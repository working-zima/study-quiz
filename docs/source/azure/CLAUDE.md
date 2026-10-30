# docs/source/azure/

**Azure AZ-900 과목**의 원본이다(ADR-053, ADR-060). AWS 과목의 원본은 한 단계 위 `docs/source/`에, 네트워크 과목의 원본은 `docs/source/network/`에 있고 규칙도 따로다.

## 원본 셋

| 원본 | 무엇 | 쓰임 |
|---|---|---|
| Microsoft 공식 문서 | `learn.microsoft.com`의 AZ-900 학습 경로(Learn 단원)와 제품 문서, AZ-900 공식 학습 가이드 | **사실의 기준**이다. 확인한 사실과 URL을 `official.md`에 남긴다 |
| 덤프 | AZ-900 덤프 V27.35(영문 294쪽, 506문항) | **범위와 강조의 근거**다 — 무엇을 넣고 별점을 어떻게 매기나(`topic-map.md`). 사실은 후보일 뿐이다. 답이 틀린 곳이 있다(설계 때 본 것: NO.1·103·126, NO.100은 문제문과 그림이 어긋난다) |
| 용어집 | 강의가 준 노션 용어집 4쪽, 134개(클라우드 개념 50·아키텍처와 서비스 45·ID와 보안 12·관리와 거버넌스 27) | 범위와 용어의 **후보**다. 틀린 곳이 있다(설계 때 본 것: Load Balancer를 라운드 로빈 분배라고 한다 — 공식 문서는 해시 기반 분배다, DDoS Protection 요금제의 옛 이름, 2027-01-31에 지원이 끝나는 Blueprints) |

여기 없는 내용을 지어내지 마라.

- CRITICAL: **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 덤프의 문제문·보기·해설, 용어집 설명, 공식 문서의 문장을 옮기지 마라.
  공식 문서의 한국어판은 기계 번역이라 특히 그대로 옮기기 쉽다. 이유: 셋 다 외부 자료다. 전사하면 저장소를 공개할 때 원문이 그대로 공개된다.
  **덤프 문항을 앱 문항으로 옮기지도 마라** — 같은 사실을 물어도 상황과 문장은 직접 만든다(ADR-021과 같은 이유).
- **충돌하면 공식 문서를 따른다.** 덤프·용어집이 공식 문서와 다르면 고쳐 쓰고, 그 기록을 `corrections.md`에 남긴다(`D…` 덤프, `G…` 용어집).
  덤프·용어집에만 있고 공식 문서가 말하지 않는 주장은 쓰지 않는다.
  네트워크 과목의 기출과 다른 점: 덤프는 시험을 주관하는 곳이 낸 문항이 아니다. 덤프의 답을 시험의 답으로 단정할 근거가 없으므로
  「자격시험은 ~로 본다」 줄을 쓰지 않는다(네트워크의 그 줄은 ADR-057).
- **범위**는 공식 학습 가이드(2026-07-20 기준, 3영역 11묶음)가 뼈대다. 가이드 밖이라도 **용어집에 있고 덤프도 묻는 현행 서비스**
  (NSG·Azure Firewall·DDoS Protection·Key Vault·Sentinel, SLA와 서비스 수명 주기)는 넣는다.
  덤프만 묻는 것(데이터·AI·IoT 서비스, 지원 플랜, 신뢰 포털·개인정보)은 넣지 않는다. 지원이 끝난 서비스와 옛 이름은 빼거나 현행으로 고친다(사용자 결정 2026-10-30).
  주제 20개의 목록·순서·별점·phase는 `topic-map.md`가 갖는다. 주제를 더하거나 나누거나 합치려면 ADR이 필요하다.
- **사실은 이 문서의 규칙이, 문장은 `docs/WRITING_GUIDE.md`가 정한다**(ADR-056을 Azure 과목으로 넓힌다, ADR-060). 처음 배우는 사람이 읽고 이해하게 쓰되,
  쉽게 쓰려고 출처에 없는 사실을 보태지 않는다.

## 허용하는 출처

기준은 하나다 — **Microsoft의 공식 문서**.

- `learn.microsoft.com` — 학습 경로·단원(`/training/`), 제품 문서(`/azure/`, `/entra/`, `/purview/` 등), 자격증 학습 가이드(`/credentials/`).
  사실은 영문판(`en-us`)으로 확인하고, 한국어판(`ko-kr`)은 **용어 표기를 확인하는 데만** 쓴다 — 기계 번역이라 문장이 어색하거나 뜻이 흐려진 곳이 있다.
- `azure.microsoft.com` — 제품·가격 페이지와 「클라우드 컴퓨팅 사전」(`/resources/cloud-computing-dictionary/`). 블로그(`/blog/`)는 쓰지 않는다.

**쓰지 않는 곳**: Microsoft Q&A·Tech Community·블로그, 위키백과, 자격증 교재, 덤프 사이트, 다른 클라우드 업체의 문서. 공식 문서보다 쉽게 풀어 써 있어도 마찬가지다.

**목록에 없는 곳**(예: SLA 약관이 있는 `microsoft.com/licensing`)은 그 주제를 만드는 phase의 설계 때 위 기준으로 판단한다. 쓰기로 하면 이 목록에 먼저 더하고 쓴다.

**공식 문서는 바뀐다.** Azure 서비스는 이름과 요금 체계가 자주 바뀐다. `official.md`의 항목마다 확인한 날을 적고,
지원 종료가 예고된 기능(예: Blueprints)은 그 날짜와 함께 적는다.

## 가리키는 표기

| 원본 | 표기 |
|---|---|
| 덤프 | `[덤프 NO.34]` — 덤프 문항 번호 |
| 용어집 | `[용어집 1-12]` — 쪽 번호(1 클라우드 개념, 2 아키텍처와 서비스, 3 ID와 보안, 4 관리와 거버넌스)와 그 쪽의 `NO.` |
| 공식 문서 | `official.md`의 항목과 그 URL |

## 이 디렉토리의 파일

- `raw/` — **저장소에 없다.** 위 원본 셋의 추출본이고 gitignore로 로컬에만 둔다(ADR-009).
  - `raw/dump/` — `dump.md`(문항별 글자, 그림은 OCR 글자), `index.json`(문항마다 쪽·형식·글자로 적힌 정답·URL), `pages.json`(쪽별 블록), `img/`(그림 블록), `ocr/`(그림의 OCR 글자).
  - `raw/glossary/` — 쪽마다 `.md` 하나: `1-cloud-concepts.md`, `2-architecture-services.md`, `3-identity-access-security.md`, `4-management-governance.md`.
  - `raw/official/` — 받아 둔 공식 문서. **전사 검사(`check-verbatim.mjs --subject azure`)가 이 폴더도 원본으로 읽는다.** 공식 문서를 받을 때는 이 폴더에 둔다.
  - `raw/analysis/`, `raw/_tools/` — 설계 때의 분석 자료와 그 스크립트. 결과는 `topic-map.md`·`dump-topics.tsv`로 커밋됐다.
  - `raw/render/` — 덤프 쪽을 렌더한 그림을 두는 곳. 아래 「덤프의 그림을 보는 법」.
- `topic-map.md` — 과목 전체의 주제 지도. 주제 20개의 순서·학습 가이드 묶음·덤프 문항 수·별점·phase, 분류 라벨과 주제 id의 대응.
- `dump-topics.tsv` — 덤프 506문항의 분류(`no`, `primary`, `secondary`, `dup_of`, `note`). `note`는 직접 쓴 짧은 메모다.
- `official.md`(phase 100 step 4가 만들고 이후 step이 더한다) — 공식 문서에서 확인한 사실과 URL, 확인한 날.
- `corrections.md`(phase 100 step 4가 만들고 이후 step이 더한다) — 덤프·용어집 수정 이력.

### `raw/`를 다시 만드는 법

도구는 `scripts/azure-source/`에 있다. 사용법과 이유는 각 스크립트의 머리 주석에 있다.
덤프 원본 PDF는 저장소 밖에 있고 경로는 기기마다 다르다.

```bash
pip install pymupdf
# 덤프 — 세 단계
python -I scripts/azure-source/dump_pages.py <덤프 원본 pdf> docs/source/azure/raw
powershell.exe -File scripts/azure-source/ocr.ps1 docs/source/azure/raw/dump/img docs/source/azure/raw/dump/ocr
python -I scripts/azure-source/dump_merge.py docs/source/azure/raw
# 용어집
python -I scripts/azure-source/notion_db.py 2miles.notion.site docs/source/azure/raw/glossary <page id>...
# 공식 문서 — 한 쪽씩
python -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md
```

- 2단계 `ocr.ps1`은 Windows 내장 OCR을 쓰므로 **Windows PowerShell 5.1(`powershell.exe`)에서만** 돈다. 다른 기기에서는 이 PC의 `raw/dump/`를 통째로 복사해 온다.
  3단계 `dump_merge.py`는 PDF를 다시 읽지 않으므로 `raw/dump/`만 있으면 어디서나 돌고, 두 번 돌려도 결과가 같다.
- 용어집의 호스트는 `2miles.notion.site`이고 쪽마다 page id는 아래와 같다. `notion_db.py`는 `<하이픈 없는 page id>.md`로 저장하므로 받은 뒤 이 이름으로 바꾼다.

| 파일 | page id |
|---|---|
| `1-cloud-concepts.md` | `19e70f065ec780be8ba9effdb5ceea7c` |
| `2-architecture-services.md` | `19e70f065ec780bca1a7d35cab67038d` |
| `3-identity-access-security.md` | `19e70f065ec7801dbee7dfb304b493c3` |
| `4-management-governance.md` | `19e70f065ec780fca588f8143f14e82f` |

## 덤프의 그림을 보는 법

덤프의 표·화면 캡처·핫스팟 문항은 그림으로만 들어 있고, OCR은 라디오 단추·체크 표시를 읽지 못한다.
그래서 **그림으로만 표시된 정답은 OCR 글자나 `index.json`의 `answer`를 믿지 말고 그림을 직접 본다.**
그림 블록은 `raw/dump/img/p{쪽}_{순번}.png`(쪽은 세 자리)이고, `dump.md`의 문항 머리 `[p{첫 쪽}–p{끝 쪽}]`로 쪽을 찾는다.
더 크게 보려면 덤프 원본 PDF의 그 쪽을 PyMuPDF로 렌더한다. 쪽 인덱스는 0부터라 p123은 `doc[122]`다.

```python
import pymupdf
from pathlib import Path

out = Path("docs/source/azure/raw/render")
out.mkdir(exist_ok=True)
doc = pymupdf.open("<덤프 원본 pdf>")
doc[123 - 1].get_pixmap(dpi=120).save(out / "p123.png")
```

`raw/render/`는 `raw/` 아래라 gitignore 안이다.
