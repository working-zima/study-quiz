# docs/source/network/

**네트워크 과목**의 원본이다(ADR-053). AWS 과목의 원본은 한 단계 위 `docs/source/`에 있고 규칙도 따로다(`docs/source/CLAUDE.md`).

## 원본 셋

| 원본 | 무엇 | 쓰임 |
|---|---|---|
| 강의 슬라이드 | 패스트캠퍼스 「현실 세상의 컴퓨터공학 지식 with 30가지 실무 시나리오」 Course 1 Part 3 네트워크(강사 강민철, 5장 32강) | **범위와 순서**를 정하고 사실도 준다. 글이 적고 핵심이 그림·표에 있다 |
| 표준 문서 | IETF RFC, IANA 레지스트리, IEEE 802, ITU-T 권고 넷(X.200 OSI 참조 모델, X.800 OSI 보안 구조, Q.9 교환 용어, X.25 가상 회선), MDN | 설명을 채우고 강의·면접의 오류를 고친다. URL을 남긴다 |
| 기술면접 Q&A | 같은 강의 자료의 「기술면접 TOP 50」 중 네트워크 21~40번 | 사실 출처로 쓴다. 틀린 답은 표준 문서로 고친다 |

여기 없는 내용을 지어내지 마라.

- CRITICAL: **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 강의·면접 문장을 그대로 옮기지 마라.
  면접 답은 완성된 문장이라 특히 그대로 옮기기 쉽다. 이유: 둘 다 외부 강의 자료다. 전사하면 저장소를 공개할 때 원문이 그대로 공개된다.
- **충돌하면 표준을 따른다.** 강의·면접이 표준과 다르면 고쳐 쓰고, 그 기록을 `lecture-outline.md`·`interview-facts.md`의 「수정 이력」에 남긴다.
- **범위는 강의가 정한다.** 표준에서 가져오는 것은 강의가 다루는 주제를 설명하는 데 필요한 것뿐이다.
  강의가 다루지 않는 주제(예: TLS, IPsec)를 표준에서 끌어오지 않는다.
  예외는 ADR-057 하나다 — 자격시험이 묻는 1장의 사실 넷(프로토콜의 요소, 교환 방식의 갈래, 프로토콜의 계층 소속, 표현 계층의 암호화·압축)은 강의 밖이지만 표준으로 확인해 넣었다.
- **사실은 이 문서의 규칙이, 문장은 `docs/WRITING_GUIDE.md`가 정한다**(ADR-056). 처음 배우는 사람이 읽고 이해하게 쓰되,
  쉽게 쓰려고 출처에 없는 사실을 보태지 않는다.

## 허용하는 표준 문서

`rfc-editor.org`·`datatracker.ietf.org`(RFC), `iana.org`(레지스트리), `ieee802.org`·`standards.ieee.org`(IEEE 802),
`itu.int`(ITU-T X.200·X.800·Q.9·X.25 — X.800·Q.9·X.25는 ADR-057이 더했다), `developer.mozilla.org`(MDN).

**위키백과·블로그·업체 학습 페이지는 쓰지 않는다** — 강의가 그런 곳을 링크해도 마찬가지다.

## 기출 — 시험이 무엇을 정답으로 보는가에만 쓴다

네트워크관리사 2급 기출(2024~2026년 11회, 교사용·해설집)이 `raw/exam/`에 있다(ADR-057). 위 원본 셋과 자리가 다르다.

- **시험이 무엇을 정답으로 보는가**의 출처로만 쓴다. 기술적 사실의 근거로 쓰지 않는다 — 사실은 여전히 강의·표준·면접에서 온다.
- 시험의 답이 표준과 다르거나 표준에 없으면, 본문은 표준이 말하는 사실을 쓰고 「자격시험은 ~로 본다」를 한 줄 덧붙인다. 그 판정과 근거는 `exam-notes.md`에 남긴다.
- CRITICAL: **기출 문장을 옮기지 마라.** 출제 사이트의 문장이다(ADR-009와 같은 이유).

## 가리키는 표기

| 원본 | 표기 |
|---|---|
| 강의 | `[강의 p123]` — 통합본(`raw/pdf/lecture-merged.pdf`) 123쪽 |
| 면접 | `[면접 Q22]` — 면접 22번 문제 |
| 표준 | `standards.md`의 항목과 그 URL |
| 기출 | `[기출 2024-08-25 #10]` — 시험 날짜와 문항 번호 |

## 이 디렉토리의 파일

- `raw/` — **저장소에 없다.** `scripts/extract-network-source.py`가 만드는 추출본과 PDF 사본이고, gitignore로 로컬에만 둔다(ADR-009).
  clone한 환경에는 없으므로 강의자료 zip을 구해 다시 만든다: `python scripts/extract-network-source.py <강의자료 zip 경로>`
  - `lecture.md` — 강의 32강의 글자. 강의마다 `# Ch1-1. …(p1–p18)`, 쪽마다 `## p{통합본 쪽} (슬라이드 {강의 안 쪽})`.
    글자가 거의 없는 쪽은 머리 끝에 ` — 그림 슬라이드`가 붙는다. 판정 규칙은 스크립트 머리 주석에 있다.
  - `interview.md` — 면접 21~40번의 글자. 쪽마다 `## interview-21-30.pdf p{쪽}`.
  - `pdf/` — 렌더할 때 쓸 PDF 사본. `lecture-merged.pdf`(통합본 502쪽), `interview-21-30.pdf`, `interview-31-40.pdf`.
  - `render/` — 렌더한 쪽 그림을 두는 곳. 아래 「그림만 있는 슬라이드를 보는 법」.
  - `exam/` — 기출 11회의 시험별 글자(`.txt`)와 그것을 만든 `_extract.py`(PyMuPDF), 문항 550개를 주제별로 나눈 `exam-analysis.md`·`data.txt`.
    위 스크립트가 만들지 않는다 — 기출 PDF를 구해 `_extract.py`로 다시 만든다.
- `lecture-outline.md`(step 1) — 강의 32강을 직접 쓴 말로 정리한 것, 주제 지도, 강의 수정 이력.
- `interview-facts.md`(step 2) — 면접 21~40번에서 뽑은 사실과 면접 수정 이력.
- `standards.md`(step 1에서 만들고 이후 step이 더한다) — 표준 문서에서 가져온 사실과 URL.
- `exam-notes.md`(ADR-057) — 시험의 답이 표준과 다르거나 표준에 없는 곳과 그 처리.

## 그림만 있는 슬라이드를 보는 법

슬라이드의 핵심은 그림·표에 있는 경우가 많다. 글자만 읽고 정리하지 말고 그 쪽을 PNG로 렌더해서 본다.
이 환경에는 `pdftoppm`이 없으니 PyMuPDF를 쓴다. 쪽 인덱스는 0부터라 통합본 p123은 `doc[122]`다.

```python
import pymupdf
from pathlib import Path

out = Path("docs/source/network/raw/render")
out.mkdir(exist_ok=True)
doc = pymupdf.open("docs/source/network/raw/pdf/lecture-merged.pdf")
doc[123 - 1].get_pixmap(dpi=60).save(out / "p123.png")
```

`raw/render/`는 `raw/` 아래라 gitignore 안이다.
