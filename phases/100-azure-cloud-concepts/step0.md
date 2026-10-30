# Step 0: source-rules

## 배경

phase 100은 앱에 세 번째 과목 **Azure AZ-900**을 더하고, 클라우드 개념 영역의 두 주제를 채운다. 결정과 공통 규칙은 `phases/100-azure-cloud-concepts/guide.md`에 있다.
**이 step은 Azure 원본을 다루는 규칙과 도구를 저장소에 세운다** — 원본을 다시 만드는 도구를 `scripts/azure-source/`로 올리고, 원본 규칙 문서 `docs/source/azure/CLAUDE.md`,
주제 지도 `docs/source/azure/topic-map.md`, 덤프 문항 분류표 `docs/source/azure/dump-topics.tsv`를 쓴다. 앱 코드와 데이터는 건드리지 않는다.

원본은 이미 이 worktree의 `docs/source/azure/raw/`(gitignore)에 있다 — 설계 세션(2026-10-30)이 만들었다.

- `raw/dump/` — AZ-900 덤프 V27.35 원본 PDF(영문 294쪽, 506문항)를 쪽마다 글자·그림 블록으로 나누고(`pages.json`, `img/`), 그림은 Windows OCR로 읽어(`ocr/`), 문항별로 합친 것(`dump.md`, `index.json`).
  번역판 PDF는 번호가 깨지고 정답이 밀린 곳이 있어 추출하지 않았다(한국어 표기 참고만).
- `raw/glossary/` — 강의가 준 노션 용어집 4쪽(클라우드 개념 50·아키텍처와 서비스 45·ID와 보안 12·관리와 거버넌스 27, 모두 134개)을 행 단위로 받은 것.
- `raw/official/` — `learn.microsoft.com`에서 받은 공식 문서(학습 가이드, Learn 단원 몇 개).
- `raw/analysis/` — 덤프 506문항을 주제로 나눈 분류(`topics-all.tsv` 등)와 주제 지도 초안(`topic-map-draft.md`, 사용자 확인 끝).
- `raw/_tools/` — 위를 만든 스크립트들.

## 읽어야 할 파일

- `phases/100-azure-cloud-concepts/guide.md` 전체
- `docs/source/network/CLAUDE.md` — 네트워크 원본의 규칙 문서. **Azure 쪽 규칙 문서의 본보기다**(원본 표, 허용하는 출처, 기출의 자리, 가리키는 표기, 이 디렉토리의 파일)
- `docs/source/network/topic-map.md` — 주제 지도의 본보기(별점 규칙, 이 지도를 바꾸는 법, 지도 표, phase 계획, 분류 메모)
- `docs/source/CLAUDE.md` — AWS 원본의 규칙(ADR-021 덤프 처리)
- `docs/source/azure/raw/analysis/topic-map-draft.md`·`topic-draft.md`·`topics-all.tsv`·`duplicates.json`, `docs/source/azure/raw/official/az-900-study-guide.md`
- `docs/source/azure/raw/_tools/`의 `dump_pages.py`·`ocr.ps1`·`dump_merge.py`·`notion_db.py`·`fetch_page.py`
- `scripts/CLAUDE.md`, `scripts/extract-network-source.py`의 머리 주석 — 추출 스크립트 머리 주석의 어조
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-053**의 「원본 위치」, **ADR-055**, **ADR-057**, **ADR-059**
- `.gitignore` — `docs/source/azure/raw/` 줄이 이미 있다(설계 커밋)

## 작업

### 1. 원본 도구 — `scripts/azure-source/`

`docs/source/azure/raw/_tools/`에서 **원본을 다시 만드는 스크립트 다섯**을 `scripts/azure-source/`로 복사한다(`raw/_tools/`는 그대로 둔다 — gitignore 안이다).

| 파일 | 하는 일 | 사용법 |
|---|---|---|
| `dump_pages.py` | 1단계 — 덤프 PDF를 쪽마다 글자 블록과 그림 블록으로 나눈다 | `python -I scripts/azure-source/dump_pages.py <덤프 원본 pdf> docs/source/azure/raw` |
| `ocr.ps1` | 2단계 — 그림 블록 PNG를 Windows 내장 OCR(en-US)로 읽는다. **Windows PowerShell 5.1(`powershell.exe`)에서만** 돈다 | `powershell.exe -File scripts/azure-source/ocr.ps1 docs/source/azure/raw/dump/img docs/source/azure/raw/dump/ocr` |
| `dump_merge.py` | 3단계 — 1·2단계를 합쳐 문항별 `dump.md`·`index.json`을 만든다 | `python -I scripts/azure-source/dump_merge.py docs/source/azure/raw` |
| `notion_db.py` | 용어집 — 노션 공개 페이지의 데이터베이스를 행 단위로 받는다 | `python -I scripts/azure-source/notion_db.py <host> docs/source/azure/raw/glossary <page id>...` |
| `fetch_page.py` | 공식 문서 — 공개 웹 문서 하나의 본문 글자를 받아 저장한다 | `python -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md` |

- 분석용 일회성 스크립트(`classify.py`·`dedupe.py`·`tally.py`)는 올리지 않는다 — 그 결과는 `topic-map.md`·`dump-topics.tsv`로 커밋된다.
- 스크립트의 **동작은 바꾸지 않는다.** 머리 주석(docstring·`#` 주석)만 기존 추출 스크립트의 어조로 다듬는다 — 쓰임, 사용법, 출력, 왜 그렇게 하는지(덤프 원본 PDF를 저장소에 두지 않는 이유 ADR-009,
  OCR이 라디오 단추·체크 표시를 읽지 못해 그림으로만 표시된 정답은 그 쪽을 렌더해서 확인해야 한다는 것, `ocr.ps1`이 PowerShell 7이 아니라 5.1에서만 도는 이유가 WinRT 형식 로딩이라는 것).
  `notion_db.py`의 `<host>`와 `<page id>`는 `docs/source/azure/CLAUDE.md`에 적는다 — 스크립트에 박지 않는다.
- **경로나 사용자 이름을 스크립트에 박지 마라.** 지금 다섯 모두 인자로 받는다. 그대로 둔다.
- 재현 확인: `dump.md`·`index.json`의 해시를 적어 둔 뒤 `python -I scripts/azure-source/dump_merge.py docs/source/azure/raw`를 돌려 해시가 같은지 본다.
  `dump_pages.py`·`ocr.ps1`은 다시 돌리지 않는다(PDF를 다시 읽고 그림 861장을 다시 OCR한다 — 오래 걸리고 결과가 같을 이유가 없다).
  `fetch_page.py`는 임시 경로(저장소 밖)로 학습 가이드 URL을 한 번 받아 글자가 나오는지만 본다.
- `.py`·`.ps1`이라 TDD 훅의 대상이 아니다(`.js`·`.ts`만 막는다). 테스트를 만들지 않는다.

### 2. `docs/source/azure/CLAUDE.md` — Azure 원본의 규칙

`docs/source/network/CLAUDE.md`의 짜임을 따라 짧게. 담을 것:

- 첫 줄: **Azure AZ-900 과목**의 원본이다(ADR-053, ADR-060 — ADR은 step 3이 쓴다. 번호가 바뀌면 step 3이 이 줄을 고친다).
- **원본 셋과 각각의 쓰임**(표):
  1. **Microsoft 공식 문서** — `learn.microsoft.com`의 AZ-900 학습 경로(Learn 단원)와 제품 문서, 공식 학습 가이드. **사실의 기준**이다. URL을 남긴다(`official.md`).
  2. **덤프** — AZ-900 덤프 V27.35(영문 506문항). **범위와 강조의 근거**(무엇을 넣고 별점을 어떻게 매기나)이고 사실의 후보다. 덤프 답은 틀린 곳이 있다(설계 때 본 것: NO.1·103·126, NO.100은 문제문과 그림이 어긋난다).
  3. **용어집** — 강의가 준 노션 용어집 134개. 범위와 용어의 후보다. 틀린 곳이 있다(설계 때 본 것: Load Balancer를 「라운드 로빈」이라 함 — 공식 문서는 해시 기반 분배, DDoS 요금제 옛 이름, 2027-01-31에 지원이 끝나는 Blueprints).
  여기 없는 내용을 지어내지 마라.
- CRITICAL: **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 덤프의 문제문·보기·해설, 용어집 설명, 공식 문서(특히 기계 번역인 한국어판)의 문장을 옮기지 마라.
  덤프 문항을 앱 문항으로 옮기지도 마라 — 같은 사실을 물어도 상황과 문장은 직접 만든다(ADR-021과 같은 이유).
- **충돌하면 공식 문서를 따른다.** 덤프·용어집이 공식 문서와 다르면 고쳐 쓰고, 그 기록을 `corrections.md`에 남긴다(`D…` 덤프, `G…` 용어집). 덤프·용어집에만 있고 공식 문서가 말하지 않는 주장은 쓰지 않는다.
  네트워크의 기출과 다른 점: 덤프는 시험 주관 기관이 낸 문항이 아니므로 「자격시험은 ~로 본다」 줄을 쓰지 않는다 — 덤프의 답을 시험의 답으로 단정할 근거가 없다.
- **범위**는 공식 학습 가이드(2026-07-20 기준)가 뼈대이고, 가이드 밖이라도 용어집에 있고 덤프도 묻는 현행 서비스(NSG·Azure Firewall·DDoS Protection·Key Vault·Sentinel, SLA와 서비스 수명 주기)는 넣는다.
  덤프만 묻는 것(데이터·AI·IoT 서비스, 지원 플랜, 신뢰 포털·개인정보)은 넣지 않는다. 지원이 끝난 서비스·옛 이름은 빼거나 현행으로 고친다(사용자 결정 2026-10-30).
  주제 20개의 목록·순서·별점·phase는 `topic-map.md`가 갖는다. 주제를 더하거나 나누거나 합치려면 ADR이 필요하다.
- **사실은 이 문서의 규칙이, 문장은 `docs/WRITING_GUIDE.md`가 정한다**(ADR-056을 Azure로 넓힌다 — step 3).
- **허용하는 출처** — 기준은 하나다: **Microsoft의 공식 문서**.
  - `learn.microsoft.com` — 학습 경로·단원(`/training/`), 제품 문서(`/azure/`, `/entra/`, `/purview/` 등), 자격증 학습 가이드(`/credentials/`). 영문판(`en-us`)으로 사실을 확인하고,
    한국어판(`ko-kr`)은 **용어 표기를 확인하는 데만** 쓴다 — 기계 번역이라 문장이 어색하거나 뜻이 흐려진 곳이 있다.
  - `azure.microsoft.com` — 제품·가격 페이지와 「클라우드 컴퓨팅 사전」(`/resources/cloud-computing-dictionary/`). 블로그(`/blog/`)는 쓰지 않는다.
  - **쓰지 않는 곳**: Microsoft Q&A·Tech Community·블로그, 위키백과, 자격증 교재, 덤프 사이트, 다른 클라우드 업체의 문서. 공식 문서보다 쉽게 풀어 써 있어도 마찬가지다.
  - **목록에 없는 곳**(예: SLA 약관이 있는 `microsoft.com/licensing`)은 그 주제를 만드는 phase의 설계 때 위 기준으로 판단한다. 쓰기로 하면 이 목록에 먼저 더하고 쓴다.
- **공식 문서가 바뀐다는 것** — Azure 서비스는 이름과 요금 체계가 자주 바뀐다. `official.md`의 항목마다 확인한 날을 적고, 지원 종료가 예고된 기능(예: Blueprints)은 그 날짜와 함께 적는다.
- **가리키는 표기**(표): 덤프 `[덤프 NO.34]`(문항 번호), 용어집 `[용어집 1-12]`(쪽 번호 1~4와 그 쪽의 `NO.`), 공식 문서 `official.md`의 항목과 URL.
- **이 디렉토리의 파일**:
  - `raw/` — **저장소에 없다**(gitignore, ADR-009). 위 「원본 셋」의 추출본. 다시 만드는 법(`scripts/azure-source/` 다섯 스크립트의 순서와 명령, 덤프 원본 PDF는 저장소 밖에 있고 경로는 기기마다 다르다는 것,
    OCR은 Windows에서만 되므로 다른 기기에서는 이 PC의 `raw/dump/`를 복사해 온다는 것, 노션 호스트 `2miles.notion.site`와 네 쪽의 page id).
    노션 page id(설계 때 다시 받아 확인함): `1-cloud-concepts.md` ← `19e70f065ec780be8ba9effdb5ceea7c`, `2-architecture-services.md` ← `19e70f065ec780bca1a7d35cab67038d`,
    `3-identity-access-security.md` ← `19e70f065ec7801dbee7dfb304b493c3`, `4-management-governance.md` ← `19e70f065ec780fca588f8143f14e82f`.
    `notion_db.py`는 `<page id>.md`로 저장하므로 받은 뒤 이 이름으로 바꾼다.
    - `raw/dump/` — `dump.md`(문항별 글자, 그림은 OCR), `index.json`, `pages.json`, `img/`, `ocr/`.
    - `raw/glossary/` — 쪽마다 `.md` 하나.
    - `raw/official/` — 받아 둔 공식 문서. **전사 검사가 이 폴더도 원본으로 읽는다**(step 2). 공식 문서를 받을 때는 이 폴더에 둔다.
    - `raw/analysis/`, `raw/_tools/` — 설계 때의 분석 자료와 그 스크립트. 결과는 `topic-map.md`·`dump-topics.tsv`로 커밋됐다.
  - `topic-map.md`(이 step) — 주제 지도.
  - `dump-topics.tsv`(이 step) — 덤프 506문항의 분류.
  - `official.md`(step 4가 만들고 이후 step이 더한다) — 공식 문서에서 확인한 사실과 URL.
  - `corrections.md`(step 4가 만들고 이후 step이 더한다) — 덤프·용어집 수정 이력.
- **덤프의 그림을 보는 법** — OCR이 라디오 단추·체크 표시를 읽지 못하므로 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG(`p{쪽}_{순번}.png`)를 직접 본다.
  더 크게 보려면 덤프 원본 PDF의 그 쪽을 PyMuPDF로 렌더한다(`page.get_pixmap(dpi=…)`). 렌더 결과는 `raw/render/`에 둔다(gitignore 안).

### 3. `docs/source/azure/topic-map.md` — 주제 지도

`raw/analysis/topic-map-draft.md`(사용자가 2026-10-30 「고칠 것 없음」으로 확인)를 정식 지도로 옮긴다. **주제·id·순서·문항 수·별점·phase를 바꾸지 않는다.** 짜임은 네트워크 `topic-map.md`를 따른다.

- 머리말: 무엇의 지도인지, 근거(덤프 506문항을 문항별로 읽어 나눈 것 — `dump-topics.tsv`, 거의 같은 문항 17개를 빼 고유 489문항, 넣는 주제 441문항(90%)과 빼는 범위 밖 48문항의 갈래별 수),
  사용자 결정(범위·도식, 2026-10-30)과 지도 확인(2026-10-30). 덤프 문장은 옮기지 않았다는 것.
- **별점 규칙**: 그 주제가 대표(primary)인 고유 문항 수로 정한다 — 25 이상 ★★★(`importance` 3), 13~24 ★★☆(2), 12 이하 없음(0). 분포 ★★★ 9 · ★★☆ 9 · 없음 2.
  별점의 뜻은 다른 과목과 같다 — 무엇을 먼저 읽을지를 정하는 값이다(ADR-026). 네트워크처럼 회차로 매기지 않는 까닭: 덤프에는 시험 회차가 없다.
- **이 지도를 바꾸는 법**: 주제를 더하거나 나누거나 합치려면 ADR이 필요하다. 주제 id는 바꾸지 않는다. 문항의 분류를 바꾸면 `dump-topics.tsv`를 고치고 수를 다시 센다.
  별점은 `src/data/azure/topics.json`의 `importance`와 `src/data/azure/data.test.ts`의 표에도 들어간다 — 이 지도를 바꾸면 그 둘도 함께 바꾼다.
- **주제 지도** 표 — 열: 순서, 주제 id, 제목, 다루는 것, 공식 학습 가이드의 묶음(「Describe cloud computing」 등 영문 묶음 이름 — `raw/official/az-900-study-guide.md`), 문항, 별점, phase. `*`는 학습 가이드 밖이지만 넣기로 한 것.
- **phase 계획**: 100(틀·출처 + 주제 1·2), 101(3·4·5), 102(6·7), 103(8·9·10), 104(11·12), 105(13·14), 106(15·16), 107(17·18·19), 108(20). 초안의 phase 열 그대로다.
- **넣지 않는 것**: 범위 밖 48문항의 갈래(데이터·AI·IoT 18, 신뢰·개인정보 13, 지원 플랜 12, DevOps 3, 기타 2)와 이유. 부하 분산은 1문항(NO.402 CDN)뿐이라 주제로 세우지 않았다는 것, Bastion·WAF는 묻는 문항이 없어 네트워크 보호에서 뺐다는 것.
- **초안에서 바꾼 것**(초안의 절 그대로) — 공동 책임 모델을 서비스 유형에 합침, VM과 앱 호스팅을 합침, 비용과 관리 도구를 나눔.
- **분류 라벨과 주제 id**: `dump-topics.tsv`의 `primary`·`secondary` 열은 분류 초안의 라벨(`cloud-computing`·`shared-responsibility`·`x-support` 등, `raw/analysis/topic-draft.md`)이다.
  라벨 → 주제 id 대응표를 둔다 — 대부분 `azure-<라벨>`이고, `shared-responsibility` → `azure-service-types`, `virtual-machines`·`app-hosting` → `azure-compute`, `storage-services` → `azure-storage`,
  `x-…`와 `load-balancing` → 넣지 않음. **`cost-management`(44)는 `azure-cost-factors`(28)와 `azure-cost-management`(16)로, `management-tools`(39)는 `azure-management-tools`(30)와 `azure-infrastructure-as-code`(9)로 나뉜다** —
  문항마다 어느 쪽인지는 그 주제를 만드는 phase(106·107)가 메모를 보고 정해 이 표에 적고, 수가 바뀌어 별점이 달라지면 지도와 테스트를 함께 고친다. 지금 지도의 28·16·30·9는 설계 때 센 수다.
  라벨별 대표 문항 수(`cost-management` 44 등)와 지도의 수가 맞는지 이 step이 다시 센다(아래 4).
- **덤프 정답이 의심스러운 문항** — 초안의 목록(NO.1·103·126, NO.100). 「주제를 만드는 phase가 공식 문서로 확인해 `corrections.md`에 남긴다」고 적는다.

### 4. `docs/source/azure/dump-topics.tsv` — 덤프 문항 분류

`raw/analysis/topics-all.tsv`를 그대로 복사한다(열: `no`, `primary`, `secondary`, `dup_of`, `note`). 커밋해도 되는지 먼저 본다 —
**`note` 열이 덤프 문장을 옮긴 것이 아닌지** 확인한다(모두 30자 이하의 한국어 메모인지, 영어 단어 다섯 개 이상이 이어진 곳이 없는지). 옮긴 것이 있으면 그 칸만 직접 쓴 말로 고친다.
그리고 `dup_of`가 빈 줄을 `primary`로 세어 지도의 수와 맞는지 확인한다: 라벨별 수(`cost-management` 44, `management-tools` 39, `monitoring` 33, …)와, 합친 주제(`service-types` 26 + `shared-responsibility` 8 = 34,
`virtual-machines` 6 + `app-hosting` 10 = 16)가 지도와 같아야 한다. 다르면 지도를 고치지 말고 `"status": "error"`로 차이를 적고 멈춘다.

## Acceptance Criteria

```bash
python -I scripts/azure-source/dump_merge.py docs/source/azure/raw
git check-ignore -q docs/source/azure/raw/dump/dump.md && echo "raw 무시됨"
npm test
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. 「raw 무시됨」이 나와야 하고, `dump_merge.py`를 다시 돌린 뒤 `dump.md`·`index.json`의 해시가 돌리기 전과 같아야 한다.
2. 다섯 스크립트의 동작 코드가 `raw/_tools/`의 원본과 같은지 `diff`로 본다 — 다른 것은 주석뿐이어야 한다.
3. `topic-map.md`의 주제 20개(id·제목·문항·별점·phase)가 `raw/analysis/topic-map-draft.md`와 같은지 한 줄씩 대조한다. `dump-topics.tsv`의 줄 수가 507(머리 포함)인지 본다.
4. `git status`로 바뀐 파일이 `scripts/azure-source/` 다섯, `docs/source/azure/CLAUDE.md`·`topic-map.md`·`dump-topics.tsv`와 phase 메타데이터뿐인지 확인한다. `raw/` 아래 파일이 목록에 나오면 안 된다.
5. `phases/100-azure-cloud-concepts/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 올린 스크립트와 사용법, 재현 확인 결과(해시), CLAUDE.md의 허용 출처 목록, 지도의 별점 분포와 라벨별 수 확인 결과, `dump-topics.tsv` 메모 확인 결과(고친 칸이 있으면 번호), 「사용자 확인」 칸(없으면 「없음」).
   - 수가 지도와 다르면 → `"status": "error"`, `"error_message"`에 라벨·지도의 수·다시 센 수.
   - `raw/`가 없어 확인할 수 없으면 → `"status": "blocked"`, `"blocked_reason"`에 무엇이 없는지 적고 멈춘다.

## 금지사항

- **`raw/` 아래 파일이나 덤프 PDF를 커밋하지 마라.** 이유: 외부 자료의 추출 전문이다(ADR-009).
- **스크립트의 동작을 바꾸지 마라.** 이유: 지금 `raw/`를 만든 코드와 같아야 다시 만들었을 때 같은 결과가 나온다. 고칠 것을 찾으면 summary에 적는다.
- **주제 지도의 주제·id·순서·수·별점·phase를 바꾸지 마라.** 이유: 사용자가 확인한 지도다. 다시 센 수가 다르면 멈추고 보고한다.
- **덤프·용어집·공식 문서 문장을 규칙 문서·지도·tsv에 옮기지 마라.** 이유: ADR-009.
- `src/`·`docs/*.md`(ADR·PRD·ARCHITECTURE)·루트와 다른 디렉토리의 `CLAUDE.md`·`scripts/` 아래 다른 파일을 고치지 마라. 이유: 과목 등록은 step 1, 문서는 step 3이 한다.
- 기존 테스트를 깨뜨리지 마라.
