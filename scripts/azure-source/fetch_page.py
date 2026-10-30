#!/usr/bin/env python3
"""
Azure AZ-900 과목의 공식 문서 — 공개 웹 문서 하나를 받아 본문 글자만 남겨 저장한다.

받는 곳은 `docs/source/azure/CLAUDE.md` 「허용하는 출처」의 Microsoft 공식 문서뿐이다. 받은 문서는
`docs/source/azure/raw/official/`에 둔다 — 전사 검사(`check-verbatim.mjs --subject azure`)가 이 폴더도 원본으로 읽기 때문이다.
공식 문서의 사본이라 **커밋하지 않는다**(ADR-009). 확인한 사실과 URL은 `official.md`에 직접 쓴 말로 남긴다.

Usage:
    python -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md

    한국어판은 URL의 언어 경로(`/ko-kr/`)로 고른다. 요청 머리의 Accept-Language는 en-US로 둔다.

출력 (매번 덮어쓴다. 폴더가 없으면 만든다):
    첫 줄 `<!-- url -->`, 그 뒤에 본문 글자. `<main>`이 있으면 그 안만 쓴다. script·style·nav·svg를 지우고,
    제목(h1~h4)은 `#`으로, 목록 항목은 `- `로, 문단·표 행·줄바꿈·div는 줄로 바꾼 뒤 나머지 태그를 지운다.
    겹친 공백과 빈 줄은 하나로 줄인다.
"""
import html
import re
import sys
import urllib.request
from pathlib import Path

url, out = sys.argv[1], Path(sys.argv[2])
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "en-US"})
with urllib.request.urlopen(req, timeout=60) as res:
    page = res.read().decode("utf-8", "replace")
main = re.search(r"<main[^>]*>(.*)</main>", page, re.S)
body = main.group(1) if main else page
body = re.sub(r"<(script|style|nav|svg)[^>]*>.*?</\1>", "", body, flags=re.S)
body = re.sub(r"<h([1-4])[^>]*>", lambda m: "\n" + "#" * int(m.group(1)) + " ", body)
body = re.sub(r"<li[^>]*>", "\n- ", body)
body = re.sub(r"<(p|tr|br|div)[^>]*>", "\n", body)
body = re.sub(r"<[^>]+>", "", body)
text = html.unescape(body)
text = re.sub(r"[ \t]+", " ", text)
text = re.sub(r"\n\s*\n+", "\n\n", text).strip()
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(f"<!-- {url} -->\n" + text, encoding="utf-8")
print(out, len(text))
