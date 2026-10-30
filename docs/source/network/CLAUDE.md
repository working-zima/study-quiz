# docs/source/network/

**네트워크 과목**의 원본이다(ADR-053). AWS 과목의 원본은 한 단계 위 `docs/source/`에 있고 규칙도 따로다(`docs/source/CLAUDE.md`).

## 원본 셋

| 원본 | 무엇 | 쓰임 |
|---|---|---|
| 강의 슬라이드 | 패스트캠퍼스 「현실 세상의 컴퓨터공학 지식 with 30가지 실무 시나리오」 Course 1 Part 3 네트워크(강사 강민철, 5장 32강) | **강의 주제 22개의 범위와 순서**를 정하고 사실도 준다. 글이 적고 핵심이 그림·표에 있다 |
| 표준·공식 문서 | 그 기술을 정한 표준 기구나 만든 곳의 공식 문서 — IETF RFC, IANA 레지스트리, IEEE 802, ITU-T 권고 전체, MDN과 아래 「허용하는 출처」의 공식 문서(ADR-059) | 설명을 채우고 강의·면접의 오류를 고친다. **강의 밖 주제의 유일한 사실 출처**다. URL을 남긴다 |
| 기술면접 Q&A | 같은 강의 자료의 「기술면접 TOP 50」 중 네트워크 21~40번 | 사실 출처로 쓴다. 틀린 답은 표준 문서로 고친다 |

여기 없는 내용을 지어내지 마라.

- CRITICAL: **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 강의·면접 문장을 그대로 옮기지 마라.
  면접 답은 완성된 문장이라 특히 그대로 옮기기 쉽다. 이유: 둘 다 외부 강의 자료다. 전사하면 저장소를 공개할 때 원문이 그대로 공개된다.
- **충돌하면 표준을 따른다.** 강의·면접이 표준·공식 문서와 다르면 고쳐 쓰고, 그 기록을 `lecture-outline.md`·`interview-facts.md`의 「수정 이력」에 남긴다.
- **범위는 강의와 네트워크관리사 2급의 출제 범위가 정한다**(ADR-059). 주제는 강의 주제 22개와 강의 밖 주제 20개, 모두 42개이고
  목록·순서·별점·phase는 `topic-map.md`가 갖는다. 주제를 더하거나 나누거나 합치려면 ADR이 필요하다.
  - 강의 주제에는 지금처럼 강의·표준·면접을 쓴다. 공식 문서도 표준 문서처럼 설명을 채우는 데 쓸 수 있다.
  - 강의 밖 주제의 사실은 아래 「허용하는 출처」의 표준·공식 문서에서만 가져온다. 강의·면접은 그 주제를 다루지 않는다.
  - 기출이 묻지 않는 것을 표준·공식 문서에 있다는 이유만으로 끌어오지 않는다. 주제 안에서 무엇까지 쓸지는 그 주제를 만드는 phase가
    기출이 묻는 사실과 그것을 이해하는 데 필요한 바탕으로 정한다.
  - ADR-057이 예외로 넣은 1장의 사실 넷(프로토콜의 요소, 교환 방식의 갈래, 프로토콜의 계층 소속, 표현 계층의 암호화·압축)은
    기출이 묻는 범위라 이제 예외가 아니라 이 규칙 안이다(ADR-059에 흡수).
- **사실은 이 문서의 규칙이, 문장은 `docs/WRITING_GUIDE.md`가 정한다**(ADR-056). 처음 배우는 사람이 읽고 이해하게 쓰되,
  쉽게 쓰려고 출처에 없는 사실을 보태지 않는다.

## 허용하는 출처

기준은 하나다 — **그 기술을 정한 표준 기구나 만든 곳의 공식 문서**(ADR-059). 지금 허용하는 곳은 다음과 같다.
강의 밖 주제가 쓰는 곳은 `topic-map.md` 「출처 영역」이 주제 묶음별로 적는다 — 두 목록은 같은 곳을 말해야 하므로 한쪽을 고치면 다른 쪽도 고친다.

- **표준**: `rfc-editor.org`·`datatracker.ietf.org`(IETF RFC), `iana.org`(레지스트리), `ieee802.org`·`standards.ieee.org`(IEEE 802, 802.1X 포함),
  `itu.int`(ITU-T 권고 전체 — ADR-057의 X.200·X.800·Q.9·X.25에서 ADR-059가 넓혔다. G 시리즈 같은 전송 권고도 든다), `developer.mozilla.org`(MDN)
- **Linux**: `man7.org`(Linux man-pages), `pubs.opengroup.org`(POSIX), `refspecs.linuxfoundation.org`(FHS), `gnu.org`(GNU 매뉴얼 — bash·coreutils·GRUB)
- **Linux 서버**: `httpd.apache.org`(Apache HTTP Server), `bind9.readthedocs.io`(ISC BIND 9), `netfilter.org`(netfilter)
- **Windows**: `learn.microsoft.com`(Windows Server와 Windows 명령)
- **클라우드·보안**: `csrc.nist.gov`(NIST), `etsi.org`(ETSI)
- **스토리지**: `snia.org`(SNIA)
- **스위치 업체 기술**: `cisco.com`의 **제품 문서**(Cisco Catalyst 스위치의 설정 가이드·명령 참조 같은 것) — 시스코가 만든 기술(VTP)의 사실에만 쓴다.
  강의 주제 `hub-switch-vlan`의 VTP가 쓴다(phase 72, 사용자 결정 2026-10-28). 학습·마케팅·블로그·커뮤니티 페이지는 쓰지 않고,
  VLAN·태그·트렁크 같은 일반 사실은 IEEE 802.1Q·RFC·NIST에서 가져온다. 제품·판마다 달라지므로 어느 제품·판의 문서인지 `standards.md` 항목에 적는다.
- **`gdisk`**: `rodsbooks.com`의 GPT fdisk 문서(`www.rodsbooks.com/gdisk/` 아래 — GPT fdisk를 만든 Rod Smith의 공식 문서) — `gdisk`가 무엇을 하는 도구인지에만 쓴다.
  강의 밖 주제 `linux-filesystem`이 쓴다(phase 75, 사용자 결정 2026-10-30). GPT·MBR의 일반 사실은 man7.org의 fdisk(8)에서 가져온다. 어느 판의 문서인지 `standards.md` 항목에 적는다.

**위키백과·블로그·자격증 교재·업체 학습 페이지는 쓰지 않는다** — 강의가 그런 곳을 링크해도, 공식 문서보다 쉽게 풀어 써 있어도 마찬가지다.

**목록에 없는 곳**은 그 주제를 만드는 phase의 설계 때 위 기준으로 판단한다. 쓰기로 하면 이 목록과 `topic-map.md` 「출처 영역」에 먼저 더하고 쓴다.

## 기출 — 시험이 무엇을 정답으로 보는가에만 쓴다

네트워크관리사 2급 기출(2024~2026년 11회, 교사용·해설집)이 `raw/exam/`에 있다(ADR-057). 위 원본 셋과 자리가 다르다.

- **시험이 무엇을 정답으로 보는가**의 출처로만 쓴다. 기술적 사실의 근거로 쓰지 않는다 — 사실은 여전히 강의·표준·공식 문서·면접에서 온다.
- 시험의 답이 표준과 다르거나 표준에 없으면, 본문은 표준이 말하는 사실을 쓰고 「자격시험은 ~로 본다」를 한 줄 덧붙인다. 그 판정과 근거는 `exam-notes.md`에 남긴다.
- 시험이 옛 방식을 묻고 공식 문서가 새 방식을 말할 때(예: 런레벨)도 같다 — 본문은 공식 문서가 말하는 사실을 쓰고 「자격시험은 ~로 본다」를 덧붙이며, `exam-notes.md`에 남긴다(ADR-059).
- CRITICAL: **기출 문장을 옮기지 마라.** 출제 사이트의 문장이다(ADR-009와 같은 이유).

## 가리키는 표기

| 원본 | 표기 |
|---|---|
| 강의 | `[강의 p123]` — 통합본(`raw/pdf/lecture-merged.pdf`) 123쪽 |
| 면접 | `[면접 Q22]` — 면접 22번 문제 |
| 표준·공식 문서 | `standards.md`의 항목과 그 URL |
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
- `standards.md`(step 1에서 만들고 이후 step이 더한다) — 표준 문서와 공식 문서에서 가져온 사실과 URL.
- `exam-notes.md`(ADR-057) — 시험의 답이 표준과 다르거나 표준에 없는 곳과 그 처리.
- `topic-map.md`(phase 71) — 과목 전체의 주제 지도. 강의 주제 22개와 강의 밖 주제 20개를 앱의 주제 순서대로 두고, 주제마다 기출 문항 수·출제 회차·별점·phase, 강의 밖 주제의 출처 영역, 기출 문항을 주제로 나눈 메모를 담는다.

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
