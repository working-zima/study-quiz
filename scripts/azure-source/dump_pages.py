#!/usr/bin/env python3
"""
Azure AZ-900 과목 원본 추출 1단계 — 덤프 원본 PDF를 쪽마다 글자 블록과 그림 블록으로 나눈다.

덤프는 AZ-900 덤프 V27.35(영문 294쪽, 506문항)다. 번역판 PDF는 문항 번호가 깨지고 정답이 밀린 곳이 있어
추출하지 않는다(한국어 표기를 참고할 때만 연다). 덤프 원본 PDF도 이 결과물도 **커밋하지 않는다** — 외부 자료의
추출 전문이라 `docs/source/azure/raw/`에 두고 gitignore로 로컬에만 둔다(ADR-009). 규칙은 `docs/source/azure/CLAUDE.md`에 있다.

Usage:
    pip install pymupdf
    python -I scripts/azure-source/dump_pages.py <덤프 원본 pdf> docs/source/azure/raw

    PDF 경로는 기기마다 다르므로 인자로 받는다.

출력 (매번 덮어쓴다):
    <raw>/dump/pages.json   쪽마다 [{"y":…, "kind":"text"|"image", "text"|"png":…}] — 위에서 아래 순서
    <raw>/dump/img/p{쪽}_{순번}.png
                            그림 블록을 잘라 150dpi로 렌더한 것. 쪽은 세 자리, 순번은 그 쪽 블록 목록에서의 두 자리 번호다.
                            2단계 `ocr.ps1`이 같은 이름의 `.txt`를 만든다.

버리는 것:
    머리말 로고처럼 높이 40pt 미만인 그림, 머리말 글자, 쪽 아래 60pt 안에 있는 숫자뿐인 글자(쪽 번호).

그림 블록을 따로 두는 이유:
    덤프의 표·화면 캡처·핫스팟 문항은 글자 층 없이 그림으로만 들어 있다. 그림을 잘라 두어야 OCR로 읽을 수 있고,
    OCR이 놓친 것(라디오 단추·체크 표시로만 표시된 정답)은 사람이 그 그림을 열어 본다.

다음 단계: ocr.ps1(2단계) → dump_merge.py(3단계).
"""
import json
import sys
from pathlib import Path

import pymupdf

pdf, raw = sys.argv[1], Path(sys.argv[2])
img_dir = raw / "dump" / "img"
img_dir.mkdir(parents=True, exist_ok=True)
doc = pymupdf.open(pdf)
pages = []
for pno, page in enumerate(doc, start=1):
    items = []
    height = page.rect.height
    for b in page.get_text("dict")["blocks"]:
        x0, y0, x1, y1 = b["bbox"]
        if b["type"] == 0:
            text = "\n".join("".join(s["text"] for s in line["spans"]) for line in b["lines"]).strip()
            if not text or text == "IT Certification Guaranteed, The Easy Way!" or (y0 > height - 60 and text.isdigit()):
                continue
            items.append({"y": y0, "kind": "text", "text": text})
        elif b["type"] == 1 and (y1 - y0) >= 40:
            name = f"p{pno:03d}_{len(items):02d}.png"
            page.get_pixmap(dpi=150, clip=pymupdf.Rect(x0, y0, x1, y1)).save(img_dir / name)
            items.append({"y": y0, "kind": "image", "png": name})
    items.sort(key=lambda it: it["y"])
    pages.append(items)
(raw / "dump" / "pages.json").write_text(json.dumps(pages, ensure_ascii=False, indent=1), encoding="utf-8")
print("pages", len(pages), "images", sum(1 for p in pages for it in p if it["kind"] == "image"))
