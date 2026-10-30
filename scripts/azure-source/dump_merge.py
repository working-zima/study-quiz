#!/usr/bin/env python3
"""
Azure AZ-900 과목 원본 추출 3단계 — 1단계의 쪽별 블록(`pages.json`)과 2단계의 OCR 글자(`ocr/*.txt`)를 합쳐
문항별 추출본을 만든다.

결과물은 **커밋하지 않는다** — 덤프 문항의 전문이다(ADR-009). 규칙은 `docs/source/azure/CLAUDE.md`에 있다.

Usage:
    python -I scripts/azure-source/dump_merge.py docs/source/azure/raw

    PDF를 다시 읽거나 OCR을 다시 하지 않으므로 금방 끝난다. 두 번 돌려도 결과가 같다.

출력 (매번 덮어쓴다):
    <raw>/dump/dump.md      문항마다 `## NO.{n} [p{첫 쪽}–p{끝 쪽}] {형식}`과 그 아래 문항 글자.
                            그림 블록은 `[그림]` 줄 뒤에 OCR 글자를 두 칸 들여 둔다. OCR 파일이 없으면 `(OCR 없음)`이다.
    <raw>/dump/index.json   문항마다 번호·쪽 범위·형식·글자로 적힌 정답·참고 URL

문항 나누기:
    `NO.{n} `으로 시작하는 줄이 바로 앞 문항 번호보다 하나 클 때만 새 문항으로 본다. 본문 안에서 다른 문항 번호를
    가리키는 줄에서 문항이 잘리지 않게 하려는 것이다.

형식 — 글자로만 판정하고, 위에서부터 처음 걸리는 것으로 정한다:
    yes-no     진술이 참이면 Yes를 고르라는 안내가 있다
    choice     `A. ` 보기와 `Answer: A` 꼴 정답이 있다
    drag-drop  drag라는 말이 있다
    hotspot    HOTSPOT·Hot Area·answer area 같은 말이 있다
    other      어디에도 걸리지 않는다

정답:
    `Answer:` 뒤의 글자만 뽑는다. 예/아니요·핫스팟·끌어 놓기 문항은 정답이 그림(라디오 단추·체크 표시)으로만
    표시된 경우가 많고 OCR이 그것을 읽지 못하므로 `answer`가 비거나 모자란다 — 그 그림을 열어 보거나 원본 PDF의
    그 쪽을 렌더해서 확인한다(`docs/source/azure/CLAUDE.md` 「덤프의 그림을 보는 법」).
    덤프의 정답은 틀린 곳이 있다. 이 스크립트는 덤프가 적은 것을 옮길 뿐 맞는지 판단하지 않는다.
"""
import json
import re
import sys
from pathlib import Path

raw = Path(sys.argv[1])
pages = json.loads((raw / "dump" / "pages.json").read_text(encoding="utf-8"))
ocr_dir = raw / "dump" / "ocr"

stream = []  # (page, line)
for pno, items in enumerate(pages, start=1):
    for it in items:
        if it["kind"] == "text":
            stream.extend((pno, line) for line in it["text"].splitlines())
        else:
            txt = ocr_dir / it["png"].replace(".png", ".txt")
            lines = txt.read_text(encoding="utf-8-sig").splitlines() if txt.exists() else ["(OCR 없음)"]
            stream.append((pno, "[그림]"))
            stream.extend((pno, "  " + line) for line in lines if line.strip())

questions = []
for pno, line in stream:
    m = re.match(r"NO\.(\d+)\s", line)
    if m and (not questions or int(m.group(1)) == questions[-1]["no"] + 1):
        questions.append({"no": int(m.group(1)), "pages": [pno, pno], "lines": [line]})
    elif questions:
        questions[-1]["pages"][1] = pno
        questions[-1]["lines"].append(line)


def kind(text):
    if re.search(r"select Yes if the statement is true", text, re.I):
        return "yes-no"
    if re.search(r"\nA\. ", text) and re.search(r"Answer:\s*[A-H]", text):
        return "choice"
    if re.search(r"drag|DRAG", text):
        return "drag-drop"
    if re.search(r"HOTSPOT|Hot Area|answer area|To answer, select", text, re.I):
        return "hotspot"
    return "other"


index = []
out = ["# AZ-900 덤프 V27.35 원본 — 문항별 추출본", "",
       "글자 층은 그대로, 그림은 Windows OCR(en-US)로 읽었다. OCR은 라디오 단추·체크 표시를 읽지 못하므로",
       "그림으로만 표시된 정답은 그 쪽을 렌더해서 확인한다. 쪽 번호는 원본 PDF 기준.", ""]
for q in questions:
    text = "\n".join(q["lines"])
    k = kind(text)
    ans = re.search(r"Answer:\s*([A-H](?:\s+[A-H])*)\b", text)
    urls = sorted(set(u.replace(" ", "") for u in re.findall(r"https?://[^\s]+(?: [^\s]+)*?(?=\s|$)", text)))
    index.append({"no": q["no"], "pages": q["pages"], "kind": k,
                  "answer": ans.group(1).replace(" ", "") if ans else None, "urls": urls})
    out.append(f"## NO.{q['no']} [p{q['pages'][0]}–p{q['pages'][1]}] {k}")
    out.extend(q["lines"][0:1] and [re.sub(r"^NO\.\d+\s", "", q["lines"][0])] + q["lines"][1:])
    out.append("")
(raw / "dump" / "dump.md").write_text("\n".join(out), encoding="utf-8")
(raw / "dump" / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8")
from collections import Counter
print("questions", len(questions), "last", questions[-1]["no"], Counter(i["kind"] for i in index))
