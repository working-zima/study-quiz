#!/usr/bin/env python3
"""
네트워크 과목 원본(강의 슬라이드·기술면접 Q&A)의 글자를 뽑아 docs/source/network/raw/ 에 쓴다.

출처는 패스트캠퍼스 「현실 세상의 컴퓨터공학 지식 with 30가지 실무 시나리오」 강의자료 zip이다.
- 강의: `Course 1/Part 3. 네트워크/` 의 `[ChX-Y. …]` PDF 32개 (5장 32강)
- 면접: `[Special] Part 1. 기술면접 TOP 50/` 의 네트워크 21~30번, 31~40번 PDF 둘

결과물은 **커밋하지 않는다** — 외부 강의 자료의 추출 전문이라 `docs/source/concepts-raw.md`와
같은 취급이다(.gitignore, ADR-009). 정리는 이 추출본을 읽고 별도 문서에 직접 쓴 말로 한다
(`docs/source/network/CLAUDE.md`).

Usage:
    pip install pymupdf
    python scripts/extract-network-source.py <강의자료 zip 경로>

    zip 경로는 기기마다 다르므로 인자로 받는다. Python 3.11 이상이 필요하다
    (zipfile의 metadata_encoding).

출력 (매번 덮어쓴다. 두 번 돌려도 결과가 같다):
    raw/lecture.md    강의마다 `# Ch1-1. 오리엔테이션 — 네트워크 거시적으로 보기 (p1–p18)`,
                      쪽마다 `## p{통합본 쪽} (슬라이드 {강의 안 쪽})`와 그 쪽의 글자
    raw/interview.md  파일마다 `# 면접 21~30`, 쪽마다 `## interview-21-30.pdf p{쪽}`과 글자
    raw/pdf/          그림을 렌더할 때 쓸 PDF 사본. lecture-merged.pdf(통합본),
                      interview-21-30.pdf, interview-31-40.pdf

통합본 쪽 번호:
    `네트워크 통합본.pdf`(502쪽)는 32강을 강의 순서대로 이어 붙인 것이다. 강의마다 쪽 수를 누적해
    통합본 쪽 번호를 매기고, 누적 합이 통합본 쪽 수와 다르면 멈춘다. 이 번호가 모든 문서·데이터가
    강의를 가리키는 번호다(`[강의 p123]` = 통합본 123쪽). 통합본 자체는 강의 목록에 넣지 않는다.

강의 순서 — (장, 강)을 숫자로 정렬한다:
    파일 이름을 문자열로 정렬하면 `Ch5-10`이 `Ch5-2` 앞에 와서 통합본 쪽 번호가 통째로 어긋난다.

zip 파일 이름 — cp949로 연다:
    이 zip은 UTF-8 플래그 없이 cp949로 파일 이름을 적었다. `metadata_encoding='cp949'` 없이 열면
    한글 이름이 깨져 강의를 찾지 못한다. 압축은 풀지 않고 항목을 바이트로 읽어 PyMuPDF에 넘긴다.

`$` 정리:
    PyMuPDF는 표 칸 안의 띄어쓰기를 `$`로 내놓는 일이 있다(`목적지$주소`). 공백이 아닌 글자 사이의
    `$`만 공백으로 바꾼다. 슬라이드에는 셸 프롬프트(`$ curl`, `$ nmtui`)라는 진짜 `$`도 있는데,
    그쪽은 뒤에 공백이 오므로 그대로 남는다.

그림 슬라이드:
    머리글(첫 줄 `네트워크`), 쪽 번호(숫자뿐인 줄)와 그 바로 뒤의 단원 이름, 슬라이드 제목(본문 첫 줄),
    글머리 기호(`•`)를 빼고 남는 글자가 15자 미만이면 `##` 머리 끝에 ` — 그림 슬라이드`를 붙인다.
    핵심이 그림에 있어 렌더해서 봐야 하는 쪽을 고르는 표지다. 장·강 표지 쪽도 여기 걸린다.
"""

import re
import sys
import zipfile
from pathlib import Path

if sys.version_info < (3, 11):
    sys.exit("Python 3.11 이상이 필요하다 (zipfile의 metadata_encoding).")

try:
    import pymupdf
except ImportError:
    try:
        import fitz as pymupdf
    except ImportError:
        sys.exit("PyMuPDF가 필요하다: pip install pymupdf")

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "docs" / "source" / "network" / "raw"
PDF_DIR = OUT_DIR / "pdf"

LECTURE_DIR = "Course 1/Part 3. 네트워크/"
MERGED = LECTURE_DIR + "네트워크 통합본.pdf"
LECTURE_NAME = re.compile(r"^\[Ch(\d+)-(\d+)\. (.+?)\] (.+)\.pdf$")

INTERVIEW_DIR = "[Special] Part 1. 기술면접 TOP 50/"
INTERVIEWS = [
    # (머리, 원본 파일 이름, 사본 파일 이름)
    ("면접 21~30", "[Ch2-1. 네트워크] 문제 21~30.pdf", "interview-21-30.pdf"),
    ("면접 31~40", "[Ch2-2. 네트워크] 문제 31~40.pdf", "interview-31-40.pdf"),
]

PAGE_HEADER = "네트워크"
FIGURE_THRESHOLD = 15
TABLE_SPACE = re.compile(r"(?<=\S)\$(?=\S)")


def read_entry(zf, name):
    try:
        return zf.read(name)
    except KeyError:
        sys.exit(f"zip에 없다: {name}")


def page_text(page):
    text = TABLE_SPACE.sub(" ", page.get_text())
    return "\n".join(line.rstrip() for line in text.splitlines()).strip("\n")


def is_figure_slide(text):
    lines = [l.strip() for l in text.splitlines()]
    lines = [l for l in lines if l and l != "•"]
    if lines and lines[0] == PAGE_HEADER:
        lines = lines[1:]
    body = []
    skip_next = False
    for line in lines:
        if skip_next:  # 쪽 번호 바로 뒤의 단원 이름
            skip_next = False
            continue
        if line.isdigit():
            skip_next = True
            continue
        body.append(line)
    rest = "".join("".join(body[1:]).split())  # body[0]은 슬라이드 제목
    return len(rest) < FIGURE_THRESHOLD


def lecture_entries(zf):
    found = []
    for name in zf.namelist():
        if not name.startswith(LECTURE_DIR) or name == MERGED:
            continue
        m = LECTURE_NAME.match(name[len(LECTURE_DIR):])
        if m:
            found.append((int(m.group(1)), int(m.group(2)), m.group(3), m.group(4), name))
    if not found:
        sys.exit(f"zip에 강의 PDF가 없다: {LECTURE_DIR}")
    return sorted(found)


def write_md(path, intro, sections):
    path.write_text("\n".join(intro + sections) + "\n", encoding="utf-8", newline="\n")


def extract_lectures(zf):
    merged_bytes = read_entry(zf, MERGED)
    merged_pages = pymupdf.open(stream=merged_bytes, filetype="pdf").page_count

    sections = []
    total = 0
    figures = 0
    lectures = lecture_entries(zf)
    for chapter, lesson, part, title, name in lectures:
        doc = pymupdf.open(stream=read_entry(zf, name), filetype="pdf")
        first, last = total + 1, total + doc.page_count
        sections.append(f"# Ch{chapter}-{lesson}. {part} — {title} (p{first}–p{last})\n")
        for index, page in enumerate(doc, start=1):
            text = page_text(page)
            mark = ""
            if is_figure_slide(text):
                mark = " — 그림 슬라이드"
                figures += 1
            sections.append(f"## p{total + index} (슬라이드 {index}){mark}\n\n{text}\n")
        total = last

    if total != merged_pages:
        raise RuntimeError(f"강의 쪽 수 합 {total}이 통합본 쪽 수 {merged_pages}와 다르다")

    intro = [
        "네트워크 강의 슬라이드 추출본이다. scripts/extract-network-source.py가 만든다 — 손으로 고치지 않는다.",
        "외부 강의 자료의 추출 전문이라 gitignore로 로컬에만 둔다(ADR-009). 사실만 가져오고 문장은 직접 쓴다.",
        "p 번호는 통합본(pdf/lecture-merged.pdf) 쪽이고, 슬라이드 번호는 강의 PDF 안의 쪽이다.",
        "「그림 슬라이드」는 글자가 거의 없어 렌더해서 봐야 하는 쪽이다. `à`는 슬라이드의 화살표(→)가 글꼴 대응 없이 뽑힌 글자다.",
        "",
    ]
    write_md(OUT_DIR / "lecture.md", intro, sections)
    (PDF_DIR / "lecture-merged.pdf").write_bytes(merged_bytes)
    return len(lectures), total, figures


def extract_interviews(zf):
    sections = []
    pages = 0
    for heading, source, copy in INTERVIEWS:
        data = read_entry(zf, INTERVIEW_DIR + source)
        doc = pymupdf.open(stream=data, filetype="pdf")
        sections.append(f"# {heading}\n")
        for index, page in enumerate(doc, start=1):
            sections.append(f"## {copy} p{index}\n\n{page_text(page)}\n")
        pages += doc.page_count
        (PDF_DIR / copy).write_bytes(data)

    intro = [
        "기술면접 TOP 50 중 네트워크 21~40번의 추출본이다. scripts/extract-network-source.py가 만든다 — 손으로 고치지 않는다.",
        "외부 강의 자료의 추출 전문이라 gitignore로 로컬에만 둔다(ADR-009). 답이 완성된 문장이라 그대로 옮기기 쉽다 — 사실만 가져오고 문장은 직접 쓴다.",
        "",
    ]
    write_md(OUT_DIR / "interview.md", intro, sections)
    return pages


def main():
    if len(sys.argv) != 2:
        sys.exit("Usage: python scripts/extract-network-source.py <강의자료 zip 경로>")
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(sys.argv[1], metadata_encoding="cp949") as zf:
        lectures, pages, figures = extract_lectures(zf)
        interview_pages = extract_interviews(zf)
    print(f"강의 {lectures}개, 통합본 {pages}쪽, 그림 슬라이드 {figures}쪽, 면접 {interview_pages}쪽")
    print(f"-> {OUT_DIR}")


if __name__ == "__main__":
    main()
