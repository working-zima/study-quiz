# Step 0: source-extract

## 배경

앱에 두 번째 과목 **네트워크**를 더한다. 과목을 나누는 구조(ADR-053)와 예/아니요 문항 형식(ADR-054)은 이미 있다. phase 69는 네트워크 과목의 틀과
출처 문서를 만들고, 1장(오리엔테이션)의 두 주제를 채운다. 사용자 결정(2026-10-26·10-27)은 아래와 같다. **다시 묻지 마라.**

- 앱은 하나, 과목은 분리한다. 과목 id `network`, 주소 `#/network/…`, 데이터 `src/data/network/`, 진행률 키 `network-quiz.progress`.
- 출처는 셋이다.
  1. **강의 슬라이드** — 패스트캠퍼스 「현실 세상의 컴퓨터공학 지식 with 30가지 실무 시나리오」 Course 1 Part 3 네트워크(강사 강민철, 5장 32강).
     **범위와 순서**를 정하고 사실도 준다. 슬라이드는 글이 적고 핵심이 그림·표에 있다.
  2. **표준 문서** — IETF RFC, IANA 레지스트리, IEEE 802, ITU-T X.200(OSI 참조 모델), MDN. 설명을 채우고 강의·면접의 오류를 고친다. URL을 남긴다.
  3. **기술면접 Q&A** — 같은 강의 자료의 「기술면접 TOP 50」 중 네트워크 21~40번. 사실 출처로 쓰되, 틀린 답은 표준 문서로 고치고 수정 이력을 남긴다.
- 사실만 가져오고 문장은 직접 쓴다(ADR-009). 원본 추출본은 gitignore로 로컬에만 둔다.

phase의 step: **0 source-extract(이 step)** / 1 lecture-outline / 2 interview-facts / 3 subject-skeleton / 4 verbatim-guard / 5 subject-docs /
6 basics-topic / 7 protocols-topic / 8 basics-visuals / 9 protocols-visuals.

**이 step은 원본 압축 파일에서 글자를 뽑아 로컬 원본(`docs/source/network/raw/`)을 만들고, 그 디렉토리를 gitignore하고, 네트워크 원본의 규칙 문서
`docs/source/network/CLAUDE.md`를 쓴다.** 앱 코드와 데이터는 건드리지 않는다.

## 읽어야 할 파일

- `docs/source/CLAUDE.md` — AWS 원본의 규칙. 네트워크 쪽 규칙 문서의 본보기다
- `docs/ADR.md`의 **ADR-009**(전사 금지), **ADR-039**(공식 문서를 근거로 쓰고 URL을 남기는 방식), **ADR-053**의 「원본 위치」
- `.gitignore` — `docs/source/concepts-raw.md`·`docs/source/dump-slices/`를 무시하는 방식
- `scripts/CLAUDE.md`, `scripts/extract-pdf.py`·`scripts/extract-dump.py`의 머리 주석 — 추출 스크립트의 본보기

## 작업

### 1. 추출 스크립트 — `scripts/extract-network-source.py`

```
python scripts/extract-network-source.py <강의자료 zip 경로>
```

이 저장소에서 원본 압축 파일은 `C:/Users/Sungwoo Kim/Downloads/현실-세상의-컴퓨터공학-지식-with-30가지-실무-시나리오-강의자료.zip`에 있다.
**경로를 스크립트에 박아 넣지 말고 인자로 받는다.** 다른 기기에서는 경로가 다르다.

- PDF는 PyMuPDF로 연다(`import pymupdf`, 없으면 `import fitz`). 둘 다 없으면 설치 방법을 담아 종료한다. zip은 압축을 풀지 않고
  `zipfile.ZipFile(path, metadata_encoding='cp949')`로 열어 항목을 바이트로 읽는다(`pymupdf.open(stream=…, filetype='pdf')`). **파일 이름이 cp949다.**
  이 인자를 빼면 한글 이름이 깨진다.
- **강의 PDF**: `Course 1/Part 3. 네트워크/` 아래 `[ChX-Y. …]`로 시작하는 32개. **`네트워크 통합본.pdf`는 강의 목록에서 뺀다.**
  (X, Y)를 **숫자로** 정렬한다. 문자열로 정렬하면 `Ch5-10`이 `Ch5-2` 앞에 온다.
- **통합본 쪽 번호**: 통합본은 32강을 이 순서로 이어 붙인 502쪽이다. 강의마다 쪽 수를 누적해 통합본 쪽 번호를 매긴다. 누적 합이 통합본의 쪽 수와
  다르면 예외를 내고 멈춘다. 이 번호가 앞으로 모든 문서·데이터가 강의를 가리키는 번호다(`p123` = 통합본 123쪽).
- **면접 PDF**: `[Special] Part 1. 기술면접 TOP 50/` 아래 `[Ch2-1. 네트워크] 문제 21~30.pdf`, `[Ch2-2. 네트워크] 문제 31~40.pdf` 둘.
- 출력(덮어쓴다. 두 번 돌려도 결과가 같아야 한다):
  - `docs/source/network/raw/lecture.md` — 맨 위에 이 파일이 무엇인지(강의 슬라이드 추출본, 이 스크립트가 만든다, gitignore, ADR-009) 몇 줄.
    강의마다 `# Ch1-1. 오리엔테이션 — 네트워크 거시적으로 보기 (p1–p18)` 꼴의 머리, 쪽마다 `## p{통합본 쪽} (슬라이드 {강의 안 쪽})` 머리와 그 쪽의 글자.
  - `docs/source/network/raw/interview.md` — 같은 머리말. 파일마다 `# 면접 21~30` · `# 면접 31~40`, 쪽마다 `## {파일} p{쪽}`과 글자.
  - `docs/source/network/raw/pdf/` — 그림을 렌더할 때 쓸 PDF 사본. 이름은 ASCII로: `lecture-merged.pdf`(통합본), `interview-21-30.pdf`, `interview-31-40.pdf`.
- 글자 정리:
  - PyMuPDF는 표 칸의 띄어쓰기를 `$`로 내놓는 일이 있다(`목적지$주소`). **공백이 아닌 글자 사이의 `$`만** 공백으로 바꾼다. 슬라이드에는 셸 프롬프트
    `$ curl` 같은 진짜 `$`가 있으므로 뒤에 공백이 오는 `$`는 그대로 둔다.
  - 모든 쪽 맨 위의 `네트워크` 머리글과 쪽 번호 한 줄은 그대로 두어도 된다. 대신 **글자가 거의 없는 쪽**(머리글·쪽 번호·슬라이드 제목을 빼면 남는 글자가
    15자 미만)의 `##` 머리 끝에 ` — 그림 슬라이드`를 붙인다. step 1이 렌더할 쪽을 고르는 표지다.
- 끝에 강의 수, 통합본 쪽 수, 그림 슬라이드 수, 면접 쪽 수를 출력한다.
- 머리 주석에 쓰임, 사용법, 출력, cp949·`$`·숫자 정렬을 왜 그렇게 하는지 적는다. 기존 추출 스크립트 머리 주석의 어조를 따른다.

### 2. `.gitignore`

`docs/source/network/raw/`를 무시하는 줄과, 그 이유(강의·면접 자료의 추출 전문이라 로컬에만 둔다, ADR-009)를 기존 항목처럼 주석으로 더한다.
PDF는 이미 `*.pdf`가 무시한다.

### 3. `docs/source/network/CLAUDE.md`

네트워크 과목 원본의 규칙 문서다. `docs/source/CLAUDE.md`(AWS 쪽)처럼 짧게, 아래를 담는다.

- **원본 셋과 각각의 쓰임** — 위 「배경」의 셋. 강의는 범위·순서와 사실, 표준은 설명과 정정, 면접은 사실(틀리면 표준으로 고친다).
- **이 디렉토리의 파일** — 지금 만드는 것과 다음 step들이 만들 것을 모두 적는다.
  - `raw/` — 이 step의 스크립트가 만드는 추출본과 PDF 사본. gitignore. clone한 환경에는 없다. 다시 만드는 명령.
  - `lecture-outline.md`(step 1) — 강의 32강을 직접 쓴 말로 정리한 것, 주제 지도, 강의 수정 이력.
  - `interview-facts.md`(step 2) — 면접 21~40번에서 뽑은 사실과 면접 수정 이력.
  - `standards.md`(step 1에서 만들고 이후 step이 더한다) — 표준 문서에서 가져온 사실과 URL.
- **허용하는 표준 문서** — `rfc-editor.org`·`datatracker.ietf.org`(RFC), `iana.org`(레지스트리), `ieee802.org`·`standards.ieee.org`(IEEE 802),
  `itu.int`(ITU-T X.200), `developer.mozilla.org`(MDN). **위키백과·블로그·업체 학습 페이지는 쓰지 않는다** — 강의가 그런 곳을 링크해도 마찬가지다.
- **가리키는 표기** — 강의는 `[강의 p123]`(통합본 쪽), 면접은 `[면접 Q22]`, 표준은 `standards.md`의 항목과 URL.
- **충돌하면 표준을 따른다.** 강의·면접이 표준과 다르면 고쳐 쓰고, 그 기록을 `lecture-outline.md`·`interview-facts.md`의 「수정 이력」에 남긴다.
- **범위** — 표준에서 가져오는 것은 강의가 다루는 주제를 설명하는 데 필요한 것뿐이다. 강의가 다루지 않는 주제(예: TLS, IPsec)를 표준에서 끌어오지 않는다.
- **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 강의·면접 문장을 그대로 옮기지 않는다. 면접 답은 완성된 문장이라 특히 그대로 옮기기 쉽다.
- 그림만 있는 슬라이드를 보는 법 — PyMuPDF로 `raw/pdf/lecture-merged.pdf`의 쪽을 PNG로 렌더해서 본다(`page.get_pixmap(dpi=60).save(...)`).
  렌더 결과는 `raw/render/`에 둔다(gitignore 안이다). 이 환경에는 `pdftoppm`이 없다.

## Acceptance Criteria

```bash
python scripts/extract-network-source.py "C:/Users/Sungwoo Kim/Downloads/현실-세상의-컴퓨터공학-지식-with-30가지-실무-시나리오-강의자료.zip"
grep -c "^# Ch" docs/source/network/raw/lecture.md          # 32
grep -c "^## p" docs/source/network/raw/lecture.md          # 502
grep -c "^## " docs/source/network/raw/interview.md         # 1 이상
git check-ignore -q docs/source/network/raw/lecture.md && echo "raw 무시됨"
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. 강의 머리는 32개, 쪽 머리는 502개여야 하고 「raw 무시됨」이 나와야 한다.
2. `raw/lecture.md`에서 `# Ch5-10`이 `# Ch5-9` 뒤에 있는지, `# Ch1-1`의 쪽 범위가 `p1–p18`이고 마지막 강의가 `p502`에서 끝나는지 확인한다.
   한글이 깨지지 않았는지 몇 쪽을 눈으로 본다(예: `p199` 근처의 라우팅 테이블 쪽에 `목적지 주소`가 공백으로 보이는지, `$ nmtui`의 `$`가 남았는지).
3. 스크립트를 한 번 더 돌려 `raw/lecture.md`가 바뀌지 않는지(같은 해시인지) 확인한다.
4. `git status`로 바뀐 파일이 `scripts/extract-network-source.py`, `.gitignore`, `docs/source/network/CLAUDE.md`와 phase 메타데이터뿐인지 확인한다.
   `raw/` 아래 파일이 목록에 나오면 안 된다.
5. `phases/69-network-basics/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 스크립트 사용법, 출력 파일 셋, 강의 수·통합본 쪽 수·그림 슬라이드 수·면접 쪽 수, 강의별 통합본 쪽 범위를 그대로 이어 쓴 한 줄을 적는다.
   - zip이 그 경로에 없거나 PyMuPDF가 없어 진행할 수 없으면 → `"status": "blocked"`, `"blocked_reason"`에 무엇이 없는지 적고 멈춘다.

## 금지사항

- **`raw/` 아래 파일이나 PDF를 커밋하지 마라.** 이유: 외부 강의 자료의 추출 전문이다. 저장소를 공개하면 원문이 그대로 공개된다(ADR-009).
- **zip 경로나 사용자 이름이 든 경로를 스크립트에 박지 마라.** 이유: 다른 기기·다른 worktree에서 돌릴 수 없게 된다.
- **강의 글자를 손으로 고치거나 요약해서 `raw/`에 넣지 마라.** 이유: `raw/`는 원문 대조용이다. 정리는 step 1이 별도 문서로 한다.
- `src/`·`docs/*.md`·다른 스크립트를 고치지 마라. 이유: 이 step은 원본 준비만 한다. 문서는 step 5가 고친다.
- 기존 테스트를 깨뜨리지 마라.
