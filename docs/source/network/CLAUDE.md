# docs/source/network/

**네트워크 과목**의 원본이다(ADR-053). AWS 과목의 원본은 한 단계 위 `docs/source/`에 있고 규칙도 따로다(`docs/source/CLAUDE.md`).

## 원본 셋

| 원본 | 무엇 | 쓰임 |
|---|---|---|
| 강의 슬라이드 | 패스트캠퍼스 「현실 세상의 컴퓨터공학 지식 with 30가지 실무 시나리오」 Course 1 Part 3 네트워크(강사 강민철, 5장 32강) | **범위와 순서**를 정하고 사실도 준다. 글이 적고 핵심이 그림·표에 있다 |
| 표준 문서 | IETF RFC, IANA 레지스트리, IEEE 802, ITU-T X.200(OSI 참조 모델), MDN | 설명을 채우고 강의·면접의 오류를 고친다. URL을 남긴다 |
| 기술면접 Q&A | 같은 강의 자료의 「기술면접 TOP 50」 중 네트워크 21~40번 | 사실 출처로 쓴다. 틀린 답은 표준 문서로 고친다 |

여기 없는 내용을 지어내지 마라.

- CRITICAL: **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 강의·면접 문장을 그대로 옮기지 마라.
  면접 답은 완성된 문장이라 특히 그대로 옮기기 쉽다. 이유: 둘 다 외부 강의 자료다. 전사하면 저장소를 공개할 때 원문이 그대로 공개된다.
- **충돌하면 표준을 따른다.** 강의·면접이 표준과 다르면 고쳐 쓰고, 그 기록을 `lecture-outline.md`·`interview-facts.md`의 「수정 이력」에 남긴다.
- **범위는 강의가 정한다.** 표준에서 가져오는 것은 강의가 다루는 주제를 설명하는 데 필요한 것뿐이다.
  강의가 다루지 않는 주제(예: TLS, IPsec)를 표준에서 끌어오지 않는다.

## 허용하는 표준 문서

`rfc-editor.org`·`datatracker.ietf.org`(RFC), `iana.org`(레지스트리), `ieee802.org`·`standards.ieee.org`(IEEE 802),
`itu.int`(ITU-T X.200), `developer.mozilla.org`(MDN).

**위키백과·블로그·업체 학습 페이지는 쓰지 않는다** — 강의가 그런 곳을 링크해도 마찬가지다.

## 가리키는 표기

| 원본 | 표기 |
|---|---|
| 강의 | `[강의 p123]` — 통합본(`raw/pdf/lecture-merged.pdf`) 123쪽 |
| 면접 | `[면접 Q22]` — 면접 22번 문제 |
| 표준 | `standards.md`의 항목과 그 URL |

## 이 디렉토리의 파일

- `raw/` — **저장소에 없다.** `scripts/extract-network-source.py`가 만드는 추출본과 PDF 사본이고, gitignore로 로컬에만 둔다(ADR-009).
  clone한 환경에는 없으므로 강의자료 zip을 구해 다시 만든다: `python scripts/extract-network-source.py <강의자료 zip 경로>`
  - `lecture.md` — 강의 32강의 글자. 강의마다 `# Ch1-1. …(p1–p18)`, 쪽마다 `## p{통합본 쪽} (슬라이드 {강의 안 쪽})`.
    글자가 거의 없는 쪽은 머리 끝에 ` — 그림 슬라이드`가 붙는다. 판정 규칙은 스크립트 머리 주석에 있다.
  - `interview.md` — 면접 21~40번의 글자. 쪽마다 `## interview-21-30.pdf p{쪽}`.
  - `pdf/` — 렌더할 때 쓸 PDF 사본. `lecture-merged.pdf`(통합본 502쪽), `interview-21-30.pdf`, `interview-31-40.pdf`.
  - `render/` — 렌더한 쪽 그림을 두는 곳. 아래 「그림만 있는 슬라이드를 보는 법」.
- `lecture-outline.md`(step 1) — 강의 32강을 직접 쓴 말로 정리한 것, 주제 지도, 강의 수정 이력.
- `interview-facts.md`(step 2) — 면접 21~40번에서 뽑은 사실과 면접 수정 이력.
- `standards.md`(step 1에서 만들고 이후 step이 더한다) — 표준 문서에서 가져온 사실과 URL.

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
