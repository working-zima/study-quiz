# Step 1: pdu-data-name

## 배경

네트워크 1장의 `protocols-encapsulation.pdu-names`(계층별 데이터 단위)는 응용 계층의 단위를 **메시지**로 부르고, 마지막 문단에서
「OSI 모델의 응용·표현·세션 계층 단위는 그냥 데이터라고 부르기도 한다」를 덧붙였다. 사용자가 2026-10-28 화면을 보고 말했다.

> 응용계층에 데이터 단위가 메시지라고 되어 있는데, 데이터 아닌가 싶어.

출처마다 이름이 다르다.

| 출처 | 응용 계층 단위 |
|---|---|
| 강의 p37 표 | 데이터(응용·표현·세션 모두) — `lecture-outline.md` Ch1-2 |
| HTTP 표준(RFC 9110) | HTTP에서 주고받는 단위는 메시지(요청·응답) — `standards.md` |
| 기출 | 응용 계층 단위를 직접 묻는 문항은 없다. TCP/IP 단위를 고르는 보기에 「메시지」가 나온다 — [기출 2024-11-03 #1], [기출 2026-05-17 #1] |

그리고 앱의 캡슐화 도식은 응용 계층 칸을 「HTTP 헤더 | 데이터」로 그린다. 단위 이름만 데이터로 바꾸면 「데이터 = HTTP 헤더 + 데이터」처럼 보인다.

**사용자 결정(2026-10-28, 권장안)**: 「데이터, 칸은 본문」 —

- 응용 계층 단위는 강의 p37대로 **데이터**라 부른다.
- 캡슐화·역캡슐화 도식에서 HTTP 헤더 뒤의 칸 「데이터」는 **본문**으로 바꾼다. 응용 계층의 데이터 = HTTP 헤더 + 본문이 된다.
- 「HTTP 표준 문서는 이 덩어리를 (HTTP) 메시지라 부른다」를 덧붙인다.

사용자가 고른 미리 보기:

```
응용 계층   데이터
  [HTTP 헤더 | 본문]
전송 계층   세그먼트
  [TCP 헤더 | HTTP 헤더 | 본문]
인터넷 계층 패킷
  [IP 헤더 | TCP 헤더 | HTTP 헤더 | 본문]
```

**이 step은 1장에서 응용 계층 단위의 이름을 데이터로 바꾸고, HTTP 헤더 뒤의 내용을 본문이라 부르게 맞추고, 그 결정을 ADR-058로 남긴다.**

## 읽어야 할 파일

- `phases/71-network-baseline/index.json`의 step 0 `summary` — 직전 step이 1장 글을 고쳤다(장비 풀이). 그 결과 위에서 일한다.
- `docs/WRITING_GUIDE.md`, `docs/ADR.md`의 **ADR-055·056·057**, **ADR-036**(도식은 본문에 있는 사실만), **ADR-046**(목록 항목)
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`(Ch1-2, p32–p37), `docs/source/network/standards.md`(RFC 9110·RFC 1122·X.200 항목)
- `src/data/CLAUDE.md`의 「네트워크 과목 데이터」, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `protocols-encapsulation` — 특히 `pdu-names`, `encapsulation`, `decapsulation`
- `src/data/network/visuals/protocols-encapsulation.json` — `encapsulation`(노드 `unit-app`, `app-data`·`transport-data`·`internet-data`·`link-data`), `decapsulation-peel`(노드 `data`), `pdu-names`(노드 `message`)
- `src/components/diagrams/EncapsulationDiagram.tsx`·`DecapsulationDiagram.tsx`·`PduNamesDiagram.tsx`와 각 `.test.tsx`, `src/data/network/questions.json`의 n025

## 작업

### 1. 글 — `topics.json`

- **`pdu-names`**: 응용 계층 단위를 데이터로 쓴다.
  - 요약의 이름 늘어놓기(지금 「메시지·세그먼트·패킷·프레임처럼」)를 새 이름에 맞춘다.
  - 목록 항목 `**메시지**(message)`를 `**데이터**(data)`로 바꾸고, 응용 계층에서 주고받는 단위라는 것과 무엇이 들어 있는지를 쓴다 —
    응용 프로그램이 보낼 내용이고, HTTP처럼 헤더를 붙이는 응용 프로토콜이면 그 헤더와 본문을 합친 것이다. HTTP 표준 문서는 이 덩어리를 HTTP 메시지라 부른다는 것을 덧붙인다.
  - **「데이터」가 두 뜻으로 읽히지 않게 한다.** 이 개념은 「데이터 덩어리」처럼 데이터를 일반 낱말로도 쓴다. 단위 이름으로서의 데이터와 헷갈리면 일반 낱말 쪽을 「덩어리」 등으로 바꾸거나,
    응용 계층의 단위는 따로 이름 없이 데이터라 부른다는 것을 한 문장으로 밝힌다.
  - 마지막 문단(OSI 일곱 계층의 단위)은 응용·표현·세션 계층 단위도 데이터라는 것과 물리 계층의 비트를 그대로 두되, 위 목록과 말이 겹치지 않게 다듬는다.
- **`encapsulation`**: 예시 문단의 「응용 계층이 보낼 데이터 앞에 HTTP 헤더를 붙여」를 본문으로 맞춘다 — 응용 계층에서 HTTP가 웹 페이지의 내용(본문) 앞에 HTTP 헤더를 붙인다.
  **「본문」은 이 주제 화면에서 처음 나오는 자리에 풀이**한다(HTTP 헤더 뒤에 오는 실제 내용, 예: 웹 페이지). 마지막 문단의 「위 계층부터 메시지, 세그먼트, 패킷, 프레임」을 「데이터, 세그먼트, 패킷, 프레임」으로.
- **`decapsulation`**: 「응용 프로그램에 원래의 데이터가 닿는다」처럼 HTTP 헤더를 뗀 뒤 남는 것을 말하는 자리를 본문으로 맞춘다.
- 다른 개념(`tcp-ip-model`, `protocol` 등)에서 응용 계층 단위를 메시지라 부른 곳이 있으면 맞춘다. `network-basics`가 일반 낱말로 쓰는 「메시지」(호스트가 보내는 정보)는 단위 이름이 아니므로 그대로 둔다.
- 근거: 강의 p37(데이터), RFC 9110(HTTP 메시지 = 시작줄·헤더·본문 — `standards.md`에 있는 항목을 쓰고, 본문(content)에 대한 사실이 없으면 RFC 9110의 해당 절로 확인해 `standards.md`에 더한다).

### 2. 도식 — `visuals/protocols-encapsulation.json`(필요하면 컴포넌트·테스트)

- `encapsulation`: `unit-app` 「메시지」 → 「데이터」. 칸 노드 `app-data`·`transport-data`·`internet-data`·`link-data`의 라벨 「데이터」 → 「본문」.
  캡션·처음 캡션·범례가 메시지나 그 칸의 「데이터」를 말하면 맞춘다.
- `decapsulation-peel`: 노드 `data` 라벨 「데이터」 → 「본문」. 「응용 프로그램에 닿음」 곁말·캡션이 데이터를 말하면 맞춘다.
- `pdu-names`: 노드 `message` 라벨 「메시지」 → 「데이터」. 시나리오 캡션이 응용 계층 단위를 말하면 맞춘다.
- `protocol-match`의 「UDP 헤더 | 데이터」·「TCP 헤더 | 데이터」는 그대로 둔다 — 전송 계층 헤더 뒤의 데이터는 응용 계층의 단위(데이터)이므로 새 이름과 맞는다.
- **노드 id와 좌표는 바꾸지 않는다**(라벨만). 「본문」은 「데이터」보다 짧아 칸에 든다. 라벨 문구가 박힌 테스트(`EncapsulationDiagram.test.tsx`·`DecapsulationDiagram.test.tsx`·`PduNamesDiagram.test.tsx`)는 새 라벨로 고친다.
- 도식은 본문에 있는 사실만 그린다(ADR-036) — 1의 본문이 「본문」과 「데이터」를 먼저 말해야 한다.

### 3. 문항 — n025

- 보기 「메시지, 세그먼트」를 새 이름(「데이터, 세그먼트」)으로 바꾸고, 해설의 마지막 문장(메시지는 응용 계층 단위)을 데이터로 맞춘다. 정답과 정답 위치는 그대로다.
- 다른 문항에서 응용 계층 단위를 메시지라 부른 곳이 있으면 맞춘다.

### 4. ADR-058 — `docs/ADR.md` 끝에 덧붙인다

제목: `ADR-058: 응용 계층의 데이터 단위를 강의대로 「데이터」라 부르고, HTTP 헤더 뒤의 내용은 「본문」이라 부른다 (ADR-055 「충돌하면 표준」의 적용 / phase 69·70의 「메시지」 결정 개정)`

- **배경**: phase 69가 응용 계층 단위를 HTTP 표준을 따라 메시지로 정하고 데이터를 다른 이름으로 덧붙였다. 사용자의 의견(위 인용), 출처 표.
- **결정**: 위 「사용자 결정」 세 줄. 표준과 충돌이 아니라 이름의 선택이라는 것 — 강의 표도, HTTP 표준도 틀리지 않았고, 이 과목은 강의의 이름을 주된 이름으로 쓰고 표준의 이름을 덧붙인다.
- **사용자 결정(2026-10-28)**: 세 선택지(데이터+본문 / 데이터+칸도 데이터 / 메시지 유지+설명 보강) 가운데 권장안을 골랐다.
- **검토한 대안**: 나머지 두 선택지와 기각 이유(칸도 데이터 — 「데이터 = HTTP 헤더 + 데이터」, 메시지 유지 — 강의로 공부하는 학습자에게 이름이 어긋난다).
- **트레이드오프**: 「데이터」가 단위 이름과 일반 낱말 두 뜻으로 쓰인다. 「본문」이라는 새 말이 1장에 들어온다(HTTP 주제에서 다시 나온다). 이미 푼 n025의 보기 하나가 바뀐다.
- 기존 ADR은 고치지 않는다(덧붙이기만).

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject network
node -e "const t=JSON.stringify(require('./src/data/network/topics.json'))+JSON.stringify(require('./src/data/network/questions.json'))+JSON.stringify(require('./src/data/network/visuals/protocols-encapsulation.json'));console.log('메시지 남은 곳', (t.match(/메시지/g)||[]).length)"
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. 교차 검사 「교차 없음」, 전사 검사 「전사 이상 없음」.
2. 「메시지」가 남은 곳을 모두 보고, 각각이 (a) `network-basics`의 일반 낱말, (b) 「HTTP 표준은 메시지라 부른다」 덧붙임, (c) 메시지 교환(`packet-switching`) 가운데 하나인지 확인한다. 응용 계층 단위를 메시지라 부르는 곳이 남으면 안 된다.
3. `git diff`로 도식 컴포넌트의 좌표·노드 id가 바뀌지 않았고, `docs/ADR.md`는 덧붙이기만 했는지(지운 줄 0) 본다.
4. `phases/71-network-baseline/index.json`의 step 1을 갱신한다.
   - 성공 → `"summary"`에 바꾼 개념과 새 문장(요점), 바꾼 도식 라벨·캡션, n025의 바뀐 보기·해설, `standards.md`에 더한 사실(있으면), ADR-058 제목, 「메시지」가 남은 곳과 그 이유, 전체 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **노드 id·좌표·시나리오 구성을 바꾸지 마라.** 이유: 라벨 이름만 바뀌는 일이다. 좌표를 건드리면 phase 70의 실측과 교차 검사가 다시 필요해진다.
- **`network-basics`의 일반 낱말 「메시지」를 바꾸지 마라.** 이유: 그것은 호스트 사이에 오가는 정보를 가리키는 강의 1장의 말이고, 계층의 단위 이름이 아니다.
- **메시지 교환(`packet-switching`의 message switching)을 바꾸지 마라.** 이유: 교환 방식의 이름이다(ITU-T Q.9).
- **기존 ADR(ADR-055~057)을 고치지 마라.** 이유: ADR은 덧붙이기만 한다. 개정은 새 ADR이 말한다.
- 기출 문장을 옮기지 마라(ADR-057). AWS 데이터를 건드리지 마라. 기존 테스트를 깨뜨리지 마라.
