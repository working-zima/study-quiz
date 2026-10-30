#!/usr/bin/env python3
"""
Azure AZ-900 과목의 용어집 — notion.site 공개 페이지 안의 데이터베이스(collection_view)를 행 단위로 받아 저장한다.

용어집은 강의가 준 노션 페이지 넷(클라우드 개념·아키텍처와 서비스·ID와 보안·관리와 거버넌스, 모두 134개)이다.
결과물은 **커밋하지 않는다** — 외부 자료의 추출 전문이다(ADR-009). 규칙은 `docs/source/azure/CLAUDE.md`에 있다.

Usage:
    python -I scripts/azure-source/notion_db.py <host> docs/source/azure/raw/glossary <page id>...

    host와 page id는 `docs/source/azure/CLAUDE.md` 「이 디렉토리의 파일」에 있다. 스크립트에 박지 않는다.
    page id는 하이픈이 있든 없든 받는다.

출력:
    <out_dir>/<하이픈 없는 page id>.md
        `# 페이지 제목`, 데이터베이스마다 `collection: 이름 — rows N`과 `columns:` 줄,
        행마다 `## 첫 열`과 나머지 열의 `- 열 이름: 값`. 행(용어 페이지)에 본문 블록이 있으면 그 글자도 받아 붙인다.
        굵게·취소선·링크는 마크다운으로, 글자 색은 `글자{색}`으로 남긴다.
    용어집의 파일 이름(`1-cloud-concepts.md` 등)은 받은 뒤 손으로 바꾼다.

일반 HTTP로 받지 않는 이유:
    노션 공개 페이지는 브라우저가 스크립트로 글자를 채우므로 HTML만 받으면 비어 온다. 그래서 노션 웹 앱이 쓰는
    내부 API(`/api/v3/`)에 POST한다 — 페이지와 데이터베이스(loadCachedPageChunkV2) → 행 목록(queryCollection) →
    행 본문(loadCachedPageChunkV2, 첫 응답에 빠진 블록은 syncRecordValuesMain) 순서다. 공개 문서가 없는 내부 API라 예고 없이 바뀔 수 있으니,
    받다가 깨지면 응답 모양부터 본다. 행마다 0.2초 쉬며 받는다.
"""
import json
import sys
import time
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
HOST, OUT = sys.argv[1], Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)


def post(endpoint, body):
    req = urllib.request.Request(
        f"https://{HOST}/api/v3/{endpoint}",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "User-Agent": "curl/8.0"},
    )
    with urllib.request.urlopen(req, timeout=60) as res:
        return json.load(res)


def hyphenate(pid):
    pid = pid.replace("-", "")
    return f"{pid[:8]}-{pid[8:12]}-{pid[12:16]}-{pid[16:20]}-{pid[20:]}"


def unwrap(rec):
    v = rec.get("value", {})
    return v.get("value", v) if isinstance(v, dict) else {}


def table(record_map, name):
    return {k: unwrap(v) for k, v in record_map.get(name, {}).items()}


def rich(prop):
    out = []
    for seg in prop or []:
        text = seg[0]
        for m in (seg[1] if len(seg) > 1 else []):
            if m[0] == "b":
                text = f"**{text}**"
            elif m[0] == "s":
                text = f"~~{text}~~"
            elif m[0] == "a":
                text = f"[{text}]({m[1]})"
            elif m[0] == "h":
                text = f"{text}{{{m[1]}}}"
            elif m[0] == "p":
                text = f"[page:{m[1]}]"
        out.append(text)
    return "".join(out)


def page_body(pid):
    """행 페이지의 본문을 글자로 돌려준다."""
    blocks = {}
    res = post("loadCachedPageChunkV2", {
        "page": {"id": pid}, "limit": 100, "cursor": {"stack": []},
        "chunkNumber": 0, "verticalColumns": False,
    })
    blocks.update(table(res.get("recordMap", {}), "block"))
    root = blocks.get(pid, {})
    missing = [c for c in root.get("content", []) if c not in blocks]
    for i in range(0, len(missing), 40):
        r = post("syncRecordValuesMain", {"requests": [
            {"pointer": {"table": "block", "id": m}, "version": -1} for m in missing[i:i + 40]]})
        blocks.update(table(r.get("recordMap", {}), "block"))
    lines = []

    def walk(bid, depth):
        b = blocks.get(bid)
        if not b:
            return
        t = b.get("type")
        text = rich(b.get("properties", {}).get("title"))
        if t == "table":
            order = b.get("format", {}).get("table_block_column_order", [])
            for r in b.get("content", []):
                row = blocks.get(r, {})
                lines.append("    " * depth + "| " + " | ".join(
                    rich(row.get("properties", {}).get(c)).replace("\n", " / ") for c in order) + " |")
            return
        if t == "image":
            lines.append("    " * depth + "[image]")
        elif text or t not in ("text",):
            prefix = {"header": "## ", "sub_header": "### ", "sub_sub_header": "#### ",
                      "bulleted_list": "- ", "numbered_list": "1. ", "toggle": "- ",
                      "callout": "> ", "quote": "> "}.get(t, "" if t == "text" else f"[{t}] ")
            lines.append("    " * depth + prefix + text)
        for c in b.get("content", []):
            walk(c, depth + (1 if t in ("bulleted_list", "numbered_list", "toggle", "callout") else 0))

    for c in root.get("content", []):
        walk(c, 0)
    return "\n".join(lines)


for raw in sys.argv[3:]:
    pid = hyphenate(raw)
    res = post("loadCachedPageChunkV2", {
        "page": {"id": pid}, "limit": 100, "cursor": {"stack": []},
        "chunkNumber": 0, "verticalColumns": False,
    })
    rm = res.get("recordMap", {})
    blocks = table(rm, "block")
    page = blocks[pid]
    title = rich(page.get("properties", {}).get("title"))
    out = [f"# {title}"]
    for cid in page.get("content", []):
        cv = blocks.get(cid, {})
        if cv.get("type") not in ("collection_view", "collection_view_page"):
            continue
        coll_id, view_id, space = cv["collection_id"], cv["view_ids"][0], cv["space_id"]
        q = post("queryCollection?src=initial_load", {
            "source": {"type": "collection", "id": coll_id, "spaceId": space},
            "collectionView": {"id": view_id, "spaceId": space},
            "loader": {"type": "reducer", "reducers": {
                "collection_group_results": {"type": "results", "limit": 1000}},
                "searchQuery": "", "userTimeZone": "Asia/Seoul"},
        })
        qrm = q.get("recordMap", {})
        coll = table(qrm, "collection").get(coll_id) or table(rm, "collection").get(coll_id, {})
        schema = coll.get("schema", {})
        view = table(qrm, "collection_view").get(view_id) or table(rm, "collection_view").get(view_id, {})
        order = [p["property"] for p in view.get("format", {}).get("table_properties", []) if p.get("visible", True)]
        order = order or list(schema)
        if "title" in order:
            order.remove("title")
        order.insert(0, "title")
        ids = q["result"]["reducerResults"]["collection_group_results"]["blockIds"]
        rows = table(qrm, "block")
        out.append(f"\ncollection: {rich(coll.get('name'))} — rows {len(ids)}")
        out.append("columns: " + " | ".join(schema.get(p, {}).get("name", p) for p in order))
        for rid in ids:
            row = rows.get(rid, {})
            cells = [rich(row.get("properties", {}).get(p)).replace("\n", " / ") for p in order]
            out.append("\n## " + cells[0])
            for p, cell in zip(order[1:], cells[1:]):
                if cell:
                    out.append(f"- {schema.get(p, {}).get('name', p)}: {cell}")
            if row.get("content"):
                body = page_body(rid)
                if body.strip():
                    out.append(body)
            time.sleep(0.2)
    name = raw.replace("-", "")
    (OUT / f"{name}.md").write_text("\n".join(out), encoding="utf-8")
    print(name, title, "lines", len(out), "chars", sum(len(x) for x in out))
