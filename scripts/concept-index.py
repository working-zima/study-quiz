#!/usr/bin/env python3
"""
`src/data/aws/topics.json`에서 개념의 id·이름·한 줄 요약만 뽑아 `docs/source/concept-index.md`로 쓴다.

`dump-gaps` step들은 "앱에 이미 있는 개념"과 중복을 걸러야 하는데, `topics.json` 전체는 110KB라
매 세션 읽으면 덤프 슬라이스를 읽을 컨텍스트가 남지 않는다. 이름과 한 줄 요약만 있으면 판단에 충분하다.

결과물은 재생성되는 파생물이라 **커밋하지 않는다**(.gitignore).

Usage:
    python3.13 scripts/concept-index.py

읽기 전용이다. `src/data/`를 고치지 않는다.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "data" / "aws" / "topics.json"
OUT = ROOT / "docs" / "source" / "concept-index.md"


def main() -> None:
    topics = json.loads(SRC.read_text(encoding="utf-8"))

    lines = [
        "# 앱에 이미 있는 개념 목록",
        "",
        "> `scripts/concept-index.py`가 `src/data/aws/topics.json`에서 뽑는다. 재생성되는 파생물이라 커밋하지 않는다.",
        "> 덤프에서 개념을 새로 만들기 전에 여기 이미 있는지 확인하는 용도다. 본문은 담지 않는다.",
        "",
    ]

    total = 0
    for topic in topics:
        lines.append(f"## {topic['id']} — {topic['title']}")
        lines.append("")
        for concept in topic["concepts"]:
            lines.append(f"- `{concept['id']}` — {concept['name']} — {concept['summary']}")
            total += 1
        lines.append("")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)} — 주제 {len(topics)}개, 개념 {total}개")


if __name__ == "__main__":
    main()
