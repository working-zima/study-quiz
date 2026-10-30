# Step 3: subject-docs

## 배경

phase 100은 앱에 세 번째 과목 **Azure AZ-900**을 더한다. 결정과 공통 규칙은 `phases/100-azure-cloud-concepts/guide.md`에 있다.
step 0~2가 원본 규칙·도구·주제 지도, 빈 과목과 불변식 테스트, 전사 검사를 만들었다. **이 step은 그 결정을 ADR로 남기고, 설계 문서와 규칙 문서들에 Azure 과목을 적는다.**
코드·데이터·테스트는 고치지 않는다. 본보기는 네트워크 과목을 문서에 적은 phase 69 step 5(`phases/69-network-basics/step5.md`)와 그 결과(ADR-055, PRD 「네트워크 과목」 절)다.

## 읽어야 할 파일

- `phases/100-azure-cloud-concepts/guide.md` 전체, `phases/100-azure-cloud-concepts/index.json`의 step 0~2 `summary`
- `phases/69-network-basics/step5.md`
- `docs/ADR.md`의 **ADR-053**, **ADR-055**, **ADR-056**, **ADR-057**, **ADR-059**(ADR 형식의 본보기 — 하위 항목 「결정 — …」, 「사용자 결정」, 「검토한 대안」, 「트레이드오프」), **ADR-009**, **ADR-021**, **ADR-026**
- `docs/PRD.md` 전체(특히 「목표」와 맨 끝 「네트워크 과목」 절), `docs/ARCHITECTURE.md`의 「디렉토리 구조」·「데이터 흐름」·「테스트 경계」, `docs/UI_GUIDE.md`의 「도식」 절 첫머리(네트워크 규칙을 적은 곳)
- `docs/WRITING_GUIDE.md`의 머리말, `docs/CLAUDE.md`, `docs/source/CLAUDE.md`, `docs/source/azure/CLAUDE.md`·`topic-map.md`(step 0)
- 루트 `CLAUDE.md`, `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`, `scripts/CLAUDE.md`

## 작업

### 1. ADR 번호를 정한다

`docs/ADR.md`의 마지막 번호를 보고, **동시에 진행 중인 네트워크 세션의 worktree**(`../aws-saa-c03-quiz-network/docs/ADR.md`)와 `git fetch` 뒤 `origin/develop:docs/ADR.md`의 마지막 번호도 본다
(`git show origin/develop:docs/ADR.md`, 다른 worktree는 읽기만 한다 — 고치지 마라). 셋 가운데 가장 큰 번호의 다음 번호를 쓴다. 설계 때는 셋 다 ADR-059였으므로 **ADR-060**이 될 것이다.
다른 번호가 되면 그 번호를 쓰고, `docs/source/azure/CLAUDE.md` 첫 줄의 ADR 번호와 이 phase의 `guide.md`가 가리키는 「ADR-060」을 summary에 적는다(guide.md는 고치지 않는다).

### 2. `docs/ADR.md` 끝에 ADR-060

제목 예: `ADR-060: Azure AZ-900 과목을 더한다 — 공식 문서가 사실을, 덤프가 범위와 강조를 정한다 (ADR-053 확장 / ADR-056 확장 / ADR-021 방식 확장)`. 하위 항목:

- **결정 — 과목**(표): id `azure`, 이름 「Azure AZ-900」, 주소 `#/azure/…`, 진행률 키 `azure-quiz.progress`, 키워드 퀴즈 없음, 데이터 `src/data/azure/`, 원본 `docs/source/azure/`, 문항 id `az001`부터, 주제 id `azure-` 접두사(까닭 포함).
- **결정 — 출처 셋과 역할**: Microsoft 공식 문서 = 사실의 기준(허용 도메인, 한국어판은 용어 표기만), 덤프 V27.35 = 범위와 강조의 근거·사실 후보, 노션 용어집 134개 = 범위와 용어의 후보.
  충돌하면 공식 문서(수정 이력 `corrections.md`의 D·G). 덤프·용어집에만 있는 주장은 쓰지 않고, 네트워크의 「자격시험은 ~로 본다」 줄은 쓰지 않는다 — 덤프는 시험 주관 기관의 문항이 아니다.
  덤프 문항을 앱 문항으로 옮기지 않는다(ADR-021과 같은 이유).
- **결정 — 범위**: 공식 학습 가이드(2026-07-20)가 뼈대, 가이드 밖이지만 넣는 것(NSG·Azure Firewall·DDoS Protection·Key Vault·Sentinel, SLA와 서비스 수명 주기), 넣지 않는 것(데이터·AI·IoT, 지원 플랜, 신뢰 포털·개인정보), 지원 종료·옛 이름 처리.
- **결정 — 주제**: 20개, 지도는 `docs/source/azure/topic-map.md`, 순서는 학습 가이드 순서, phase 100~108. 주제를 더하거나 나누거나 합치려면 ADR.
- **결정 — 강조**: 별점은 덤프에서 그 주제가 대표인 고유 문항 수(25 이상 ★★★, 13~24 ★★☆, 12 이하 없음, 분포 9·9·2). 네트워크처럼 회차로 매기지 않는 까닭(덤프에 회차가 없다).
  굵은 글씨는 목록 항목 이름에만, 「A vs B」 제목 없음(ADR-055와 같다).
- **결정 — 데이터 규칙**: `format` 필수, 4지선다도 물음표, 커버리지 100%(ADR-026), 해설 187자(ADR-027), `importance`는 지도에서 계산, `sourcePages` `[0, 0]`, 앱의 주제 순서 = 지도 순서, `glossary` 비움.
  지키는 테스트는 `src/data/azure/data.test.ts`·`visuals.test.ts`.
- **결정 — 글**: Azure의 글은 모두 `docs/WRITING_GUIDE.md`를 따른다(ADR-056 확장). AZ-900은 입문 시험이고 학습자는 클라우드를 처음 배우는 사람이다.
- **결정 — 도식**: 주제마다 도식 하나 이상, 구조·흐름이 있는 개념에는 개념마다, 정의형 개념에는 없음. 비교표는 도식을 대신하지 않는다. `azureDiagramCoverage.test.ts`가 주제 단위로 지킨다
  (개념 단위로 걸지 않는 까닭 — 어느 개념이 구조·흐름을 가졌는지는 phase 설계의 판단이다). 네트워크의 「개념마다」 규칙(ADR-056)과 다르다.
- **결정 — 전사 검사**: `--subject azure`, 원본은 용어집·덤프·받아 둔 공식 문서(폴더 단위), 문항도 본다(step 2 summary).
- **결정 — 원본 도구**: `scripts/azure-source/` 다섯 스크립트, OCR은 Windows에서만.
- **사용자 결정**(2026-10-30): 범위(AskUserQuestion 권장안), 도식(권장안), 주제 지도 확인 「고칠 것 없음」.
- **검토한 대안**: 덤프를 사실 출처로 쓰기(정답 오류가 있어 기각 — 설계 때 본 NO.1·103·126), 용어집을 사실 출처로 쓰기(오류 — 부하 분산 「라운드 로빈」 등), 네트워크처럼 개념마다 도식(정의형 개념이 많아 기각 — 사용자 결정),
  과목 id `az-900`(다른 과목 id가 하이픈 없는 소문자라 `azure`로), 별점을 문항 수 대신 영역 가중치(25~30% 등)로(영역 안 주제를 가르지 못해 기각).
- **트레이드오프**: 공식 문서와 서비스 이름이 자주 바뀐다(확인한 날을 적는다), 덤프 수는 덤프 판에 묶인다, OCR은 Windows에서만, 덤프의 그림 정답은 렌더해 봐야 한다.

ADR 본문에 덤프·용어집·공식 문서 문장을 옮기지 않는다.

### 3. 설계 문서

- `docs/PRD.md` — 「목표」의 과목 문단을 「셋이다」로 고치고(AWS SAA-C03, 네트워크, Azure AZ-900 — Azure는 Microsoft Azure 기초 자격증 AZ-900의 범위), 둘째 문단이 가리키는 끝 절에 Azure도 더한다.
  맨 끝에 새 절 **「Azure AZ-900 과목」** — 사용자(클라우드를 처음 배우고 AZ-900을 목표로 하는 사람, 시험 시뮬레이터가 아님), 원본(공식 문서·덤프·용어집과 역할), 범위, 문제 은행(4지선다·예/아니요, 해설), 중요도(덤프 문항 수 별점). 네트워크 절의 짜임을 따른다.
- `docs/ARCHITECTURE.md` — 「디렉토리 구조」에 `data/azure/` 줄, 「데이터 흐름」에 Azure도 같은 흐름이라는 두 줄(원본 `docs/source/azure/raw/`, 데이터 `src/data/azure/`, 과목 객체 `azureSubject`),
  「테스트 경계」에 `src/data/azure/*.json`·`visuals/` 행(`data.test.ts`·`visuals.test.ts`가 지키는 것 — step 1 summary대로)과 `azureDiagramCoverage.test.ts`.
- `docs/UI_GUIDE.md` — 「도식」 절 첫머리의 네트워크 규칙 문장 곁에 Azure 규칙(주제마다 하나 이상, 구조·흐름이 있는 개념에는 개념마다, ADR-060) 한 문장.
- `docs/WRITING_GUIDE.md` — 머리말의 「네트워크 과목의 글은 모두 이 기준을 따른다」를 네트워크와 Azure 과목으로 넓힌다(ADR-060). 나머지 본문(사용자가 준 기준)은 고치지 않는다.

### 4. 규칙 문서(CLAUDE.md)

- 루트 `CLAUDE.md` — 첫 절의 「지금 과목은 … 둘이다」를 셋으로(Azure AZ-900, ADR-060). 「개발 프로세스」의 WRITING_GUIDE 줄에 Azure 과목은 전부를 더한다.
  「원본 데이터」의 과목별 규칙 파일에 Azure(`docs/source/azure/CLAUDE.md`)를 더한다. 「하위 CLAUDE.md」 표에 `docs/source/azure/CLAUDE.md` 행(원본 셋, 허용하는 출처, 덤프·용어집의 자리, 수정 이력, 원본 다시 만들기).
- `docs/CLAUDE.md` — 원본 폴더 문장에 `docs/source/azure/`(Azure 과목)를 더한다.
- `docs/source/CLAUDE.md` — 첫 문단의 네트워크 문장 곁에 Azure 원본의 자리(`docs/source/azure/`, 규칙은 그 폴더의 `CLAUDE.md`, ADR-060) 한 줄.
- `docs/source/azure/CLAUDE.md` — 첫 줄의 ADR 번호가 이 step이 쓴 번호와 같은지 보고, 다르면 고친다. 그 밖은 고치지 않는다.
- `src/data/CLAUDE.md` — 트리에 `azure/` 줄, 새 절 **「Azure 과목 데이터」**(근거 ADR-060, `data.test.ts`·`visuals.test.ts`가 지키는 것, 전사 검사 명령, 도식은 주제마다 하나 이상이고 `azureDiagramCoverage.test.ts`가 지킨다, 글은 WRITING_GUIDE).
- `src/components/diagrams/CLAUDE.md` — 「자기 과목 폴더」 문장에 Azure 도식은 `src/data/azure`를 읽는다를 더하고, 문구 자리에 `src/data/azure/visuals/`, 네트워크 규칙 항목 곁에 **Azure는 주제마다 도식이 하나 이상**(ADR-060)과 커버리지 테스트 이름.
- `scripts/CLAUDE.md` — 「데이터 가드레일·감사」 문단과 `check-verbatim.mjs` 행에 `--subject azure`(원본 폴더 단위, 문항 포함), 새 행 `azure-source/`(다섯 스크립트와 쓰임, OCR은 Windows PowerShell 5.1, ADR-009·ADR-060).

문장마다 짧게 — 기존 문서의 어조와 길이를 따른다. 같은 사실을 여러 문서에 길게 되풀이하지 말고, 자세한 것은 ADR-060과 `docs/source/azure/CLAUDE.md`를 가리킨다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. 코드를 고치지 않았으므로 테스트 수가 step 2가 끝났을 때와 같아야 한다.
2. 문서끼리 어긋나는 곳이 없는지 본다 — 과목 수(셋), 진행률 키, 문항 id 접두사, 별점 경계, 도식 규칙, 허용 출처가 ADR-060·PRD·`docs/source/azure/CLAUDE.md`·`src/data/CLAUDE.md`에서 같은 말인지 `grep`으로 대조한다.
   「과목은 둘」·「AWS, 네트워크 둘」처럼 남은 옛 문장이 없는지 `grep -rn "둘이다\|둘 \|두 과목" CLAUDE.md docs src/*/CLAUDE.md scripts/CLAUDE.md`로 찾아 본다.
3. `git status`로 바뀐 파일이 위 「작업」의 문서들과 phase 메타데이터뿐인지 확인한다. `src/`의 코드·데이터·테스트와 다른 worktree는 바뀌지 않아야 한다.
4. `phases/100-azure-cloud-concepts/index.json`의 step 3을 갱신한다.
   - 성공 → `"summary"`에 쓴 ADR 번호와 그 번호를 고른 근거(세 곳의 마지막 번호), ADR의 하위 항목 목록, 고친 문서마다 무엇을 더했는지 한 줄씩, 지시 밖에서 고친 곳과 이유를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **코드·데이터·테스트를 고치지 마라.** 이유: 이 step은 문서만 쓴다.
- **다른 worktree(`../aws-saa-c03-quiz-network` 등)의 파일을 고치지 마라.** 이유: 다른 에이전트가 동시에 쓰고 있다(루트 CLAUDE.md 「에이전트를 여러 개 동시에 돌릴 때」). 읽기만 한다.
- **기존 ADR의 본문을 고치지 마라.** 이유: ADR은 그때의 결정 기록이다. 넓히거나 바꾸는 것은 새 ADR의 제목 괄호(「ADR-056 확장」)와 본문으로 한다.
- **WRITING_GUIDE의 사용자 기준 본문(1~6절, 맥락 절, 객관식 절)을 고치지 마라.** 이유: 사용자가 준 기준을 그대로 옮긴 글이다. 머리말의 적용 범위 문장만 고친다.
- **덤프·용어집·공식 문서 문장을 문서에 옮기지 마라.** 이유: ADR-009.
- 기존 테스트를 깨뜨리지 마라.
