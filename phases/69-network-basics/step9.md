# Step 9: protocols-visuals

## 배경

앱에 두 번째 과목 **네트워크**를 더하는 phase 69의 마지막 step이다. step 7이 둘째 주제 `protocols-encapsulation`(개념 10개)을 썼고, step 8이 첫 주제에 도식과 표를 붙였다
(네트워크 도식의 첫 선례 — `CastTypesDiagram`, `networkBasicsTables.tsx`, `src/data/network/visuals/network-basics.json`). 사용자는 네트워크 도식을 **처음부터 글과 함께** 만들기로 했다.
ADR-055 — registry는 개념 id로 찾고 과목을 모르므로 그대로 쓰고, 네트워크 도식은 `src/data/network/visuals/`를 읽는다.

**이 step은 `protocols-encapsulation`에 시나리오 도식 한 장과 비교표 하나를 붙인다.**

- **캡슐화 도식** — 앵커 `protocols-encapsulation.decapsulation`(캡슐화와 역캡슐화를 둘 다 읽은 자리). 보내는 쪽에서 계층마다 헤더가 붙고, 받는 쪽에서 떨어지는 것을 시나리오로 가른다.
- **참조 모델 대응표** — 앵커 `protocols-encapsulation.tcp-ip-model`(두 모델을 다 읽은 자리). TCP/IP의 네 계층이 OSI의 어느 계층들과 대응하고 무엇을 하는지 한 표에 둔다.

step 8처럼 **이 step이 좌표를 설계한다.** 기계 검사를 모두 통과시키고, 설계를 summary에 남긴다. 사용자는 1장 화면을 보고 도식 방향을 정한다.

## 읽어야 할 파일

- `docs/ADR.md`의 **ADR-055**, **ADR-036**, **ADR-037**, **ADR-038**, **ADR-047**, **ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 **「도식」 절 전체**와 **「비교표」**
- `src/components/diagrams/CLAUDE.md`
- `phases/69-network-basics/index.json`의 step 7·8 `summary`
- `src/data/network/topics.json`의 `protocols-encapsulation` — 특히 `osi-model`, `tcp-ip-model`, `encapsulation`, `decapsulation`, `packet`, `pdu-names`의 본문
- **step 8이 만든 네트워크 도식의 선례**: `src/components/diagrams/CastTypesDiagram.tsx`와 테스트, `networkBasicsTables.tsx`와 테스트, `src/data/network/visuals/network-basics.json`
- `src/data/network/index.ts`, `src/data/network/visuals.test.ts`, `src/types/visuals.ts`
- `src/components/diagrams/DiagramFrame.tsx`·`ComparisonTableFigure.tsx`(**고치지 마라**), `registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/38-service-diagrams/tools/check-path-crossings.mjs` — 노드·경로 선언 블록의 형식

## 작업

### 1. 데이터 파일과 로더

- `src/data/network/visuals/protocols-encapsulation.json` — `{ "diagrams": {}, "tables": {}, "glossary": [] }`에서 시작한다. **`glossary`는 빈 배열**이다.
- `src/data/network/index.ts`의 `visualsByTopicId`에 `'protocols-encapsulation'` 키를 더한다(기존 키 정렬 방식).

### 2. 캡슐화 도식 — `EncapsulationDiagram`

- 컴포넌트 `src/components/diagrams/EncapsulationDiagram.tsx`, 문구는 JSON `diagrams["encapsulation"]`.
- 그릴 것: TCP/IP 모델의 네 계층(위에서부터 응용·전송·인터넷·네트워크 액세스) 이름 노드와, 계층마다 그 계층을 지난 데이터의 모양.
  step 7이 쓴 본문을 따라 **응용 계층도 헤더를 붙인다**(`encapsulation` 셋째 문단, `decapsulation` 둘째 문단 — 강의 p33 그림). 도식은 본문의 예 하나(웹 페이지를 TCP로 보내는 경우, 문항 `n024`와 같은 예)를
  따라가므로 줄마다 노드는 다음과 같다. 왼쪽이 앞(바깥쪽)이다.
  - 응용: `HTTP 헤더` · `데이터`
  - 전송: `TCP 헤더` · `HTTP 헤더` · `데이터`
  - 인터넷: `IP 헤더` · `TCP 헤더` · `HTTP 헤더` · `데이터`
  - 네트워크 액세스: `이더넷 헤더` · `IP 헤더` · `TCP 헤더` · `HTTP 헤더` · `데이터` · `트레일러`
  - 라벨의 근거: `HTTP 헤더`·`TCP 헤더`·`IP 헤더`·`트레일러`는 `encapsulation` 셋째 문단(「HTTP 같은 자기 프로토콜의 헤더」「TCP나 UDP의 헤더」「IP 헤더」「뒤에 트레일러도」)과 `decapsulation` 둘째 문단.
    `이더넷 헤더`는 `tcp-ip-model`의 네트워크 액세스 계층 항목(이 계층의 예가 이더넷)과 `pdu-names`의 프레임 항목(「이더넷 프레임처럼, … 이 계층의 헤더가 붙고 뒤에 트레일러가 붙은 것」)을 합친 말이다.
    예를 하나로 고정한 것이므로 `idleCaption`이나 `label`에 그 예(웹 페이지를 TCP로 보낼 때)임을 밝힌다. **라벨을 줄이거나 바꾸지 마라.**
  - 폭 어림(`estimateTextWidth(라벨, 10) + 12`, 한글 10·영문과 공백 5.5): `이더넷 헤더` 67.5, `IP 헤더` 48.5, `TCP 헤더` 54, `HTTP 헤더` 59.5, `데이터` 42, `트레일러` 52.
    네트워크 액세스 줄은 상자를 붙여 놓아도 합이 약 324이고, 계층 이름 노드 `네트워크 액세스 계층`은 약 113이다. 그러므로 세로형(280)에서는 그 줄이 한 줄에 들어가지 않고,
    가로형(440)에서도 계층 이름 노드와 같은 줄에 두면 넘친다. 계층 이름 노드를 데이터 줄 위에 두거나 긴 줄을 두 줄로 나누는 식으로 **배치로** 푼다. 어떻게 풀었는지 summary에 적는다.
  - 곁말로 줄마다 단위 이름을 둔다 — 응용 `메시지`, 전송 `세그먼트`, 인터넷 `패킷`, 네트워크 액세스 `프레임`(근거 `pdu-names`의 목록 항목). 자리가 모자라면 곁말을 빼고 summary에 적는다.
  - 위 노드 구성은 step 7이 쓴 본문을 읽고 정한 것이다. 실행할 때 본문이 이와 다르면 **본문을 따르고** 다른 점을 summary에 적는다.
- 시나리오 둘:

  | id | label | 보이는 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `send` | 보낼 때 | 계층 이름 옆을 위에서 아래로 내려가는 경로, 계층마다 새로 붙는 헤더(와 트레일러)가 선명 | 위 계층이 넘긴 것을 통째로 페이로드로 삼아 자기 헤더를 앞에 붙인다(캡슐화) |
  | `receive` | 받을 때 | 아래에서 위로 올라가는 경로, 계층마다 떼어 내는 헤더가 선명 | 계층마다 자기 헤더를 떼고 나머지를 위로 넘긴다(역캡슐화) |

  - 두 시나리오의 선명한 노드 집합이 같아지면 시나리오가 아무것도 가르지 못한다. 방향은 경로(화살표)가, 「새로 붙는 것」과 「떼어 내는 것」은 선명한 노드와 곁말이 가른다. 설계를 summary에 적는다.
  - 캡션과 곁말에는 `encapsulation`·`decapsulation`(과 위에서 쓴 개념) 본문에 있는 사실만 쓴다.
- `question` 예) `계층을 지날 때마다 데이터에는 무엇이 붙고 떨어질까?`. `idleCaption`, `label`, `svgLabel`, `sources`를 채운다.
- **색**: 노드는 모두 `stroke-disabled`(회색). 도식 전용 두 색은 쓰지 않는다(그 뜻이 AWS 계층이다). 강조는 opacity로만.
- **세로형(280)과 가로형(440)을 함께** 만든다. 세로형에서 네트워크 액세스 줄이 280 안에 들어가지 않으면 그 줄을 두 줄로 나누거나, 계층 이름 노드를 위에 두고 데이터 줄을 그 아래 전체 폭으로 펴는 배치를 쓴다.
  `wideNodes`·`widePaths`·`wideGroups`·`wideNotes`는 한 줄에 하나씩 글자 그대로 적는다(교차 검사기가 글자로 읽는다).
- **경로는 직교(M/H/V)만**, 노드 상자 안을 지나지 않는다. 화살표 마커 id는 `useId`.
- `registry.ts`에 `'protocols-encapsulation.decapsulation': EncapsulationDiagram`.

### 3. 참조 모델 대응표 — `ReferenceModelTable`

- `src/components/diagrams/protocolsTables.tsx`, 문구는 JSON `tables["reference-models"]`.
- `label` 예) `TCP/IP 모델과 OSI 모델의 계층 대응`. `columns` — `["TCP/IP 모델","OSI 모델","하는 일"]`. 행은 위 계층부터 응용·전송·인터넷·네트워크 액세스.
  OSI 칸은 대응하는 계층 이름들(예: 응용·표현·세션), 하는 일 칸은 `tcp-ip-model`·`osi-model` 본문의 말로 한 줄.
- **칸에는 두 개념 본문에 있는 사실만 쓴다.** 대응 관계가 본문에 없으면 그 행의 OSI 칸을 지어내지 말고 summary에 적는다.
- `columnWidths`를 UI_GUIDE 「비교표」 규칙대로 정하고 어림 근거를 summary에 적는다(`네트워크 액세스`의 끊을 수 없는 덩어리, `TCP/IP`).
- `sources`: `protocols-encapsulation.osi-model`, `protocols-encapsulation.tcp-ip-model`.
- `registry.ts`에 `'protocols-encapsulation.tcp-ip-model': ReferenceModelTable`.

### 4. 테스트 — 먼저 쓰고 실패를 확인한 뒤 구현한다

`EncapsulationDiagram.test.tsx` — step 8의 `CastTypesDiagram.test.tsx`와 같은 관문:

1. 물음형 제목이 시나리오 버튼보다 앞에 보인다.
2. `전체`에서 노드가 모두 선명하고 경로가 없다.
3. 시나리오마다 선명한 노드·경로·곁말·캡션이 JSON과 같다. 선택 밖 노드 opacity `0.25`.
4. `send`와 `receive`의 경로 방향이 반대다(같은 축의 경로라면 시작점과 끝점이 뒤바뀐다). 두 시나리오의 「선명한 노드 + 보이는 곁말」이 같지 않다.
5. 모든 `rect`가 `viewBox` 안이고 노드 라벨이 `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`으로 들어간다. 곁말·그룹 라벨은 `viewBox` 안이다.
6. 계층 줄의 데이터 노드 수가 위에서 아래로 늘어난다(헤더가 하나씩 붙는다).
7. 두 번 렌더해도 화살표 마커 id가 겹치지 않는다. JSON의 시나리오 id 집합과 컴포넌트의 것이 같다.
8. `ConceptList`에 `protocols-encapsulation.decapsulation`을 주면 본문 뒤에 이 도식이 온다.
9. 가로형: `viewBox` 폭 440, 래퍼 클래스, 노드·그룹 id 집합과 경로 id 합집합이 세로형과 같고, 3~6번을 통과하며, 폭이 바뀌어도 선택이 유지된다.

`protocolsTables.test.tsx`:

1. `visualsByTopicId['protocols-encapsulation']`가 있고 `glossary`는 빈 배열이다.
2. 표의 `label`·`columns`·`columnWidths`·`sources`·행 머리 순서(응용·전송·인터넷·네트워크 액세스)가 JSON과 같고, 한 글자 판정이 없다.
3. 렌더된 `colgroup` 폭이 `columnWidths`와 같다.
4. `ConceptList`에 `protocols-encapsulation.tcp-ip-model`을 주면 본문 뒤에 표가 `figure` 하나로 오고 접근성 이름이 `label`과 같다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject network
git status --porcelain
```

교차 검사기는 step 8 뒤의 수에서 이 도식이 더한 만큼 늘고 「교차 없음」으로 끝나야 한다. **검사기를 고쳐서 통과시키지 마라.**

## 검증 절차

1. AC를 실행한다.
2. 다음을 확인한다.
   - 캡션·곁말·표 칸의 사실마다 근거 문단을 댈 수 있는가. 헤더 이름이 본문의 말과 같은가.
   - 이모지·O/X·빨강·초록·주황·도식 전용 두 색·애니메이션이 없는가.
   - 바뀐 파일이 `EncapsulationDiagram.tsx`·테스트, `protocolsTables.tsx`·테스트, `src/data/network/visuals/protocols-encapsulation.json`, `src/data/network/index.ts`, `registry.ts`, phase 메타데이터뿐인가.
     step 8의 도식·표, 공용 컴포넌트, `topics.json`·`questions.json`, AWS 도식은 그대로인가.
3. `phases/69-network-basics/index.json`의 step 9를 갱신한다.
   - 성공 → `"summary"`에 두 배치의 `viewBox`와 좌표(한 줄로 압축), 시나리오별 선명한 노드·경로·곁말과 두 시나리오를 어떻게 갈랐는지, 캡션, 헤더 노드에 쓴 이름과 그 근거 문단,
     표의 열·열 폭과 어림 근거, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **본문에 없는 사실을 도식·표에 그리지 마라.** 이유: 도식은 콘텐츠다(ADR-036). 필요한 사실이 본문에 없으면 빼고 그린 뒤 summary에 적는다.
- **`topics.json`·`questions.json`과 step 8의 도식·표를 고치지 마라.** 이유: 앞 step의 산출물이다.
- **노드 라벨을 줄이거나 영문 약어로 바꿔 폭을 맞추지 마라.** 이유: UI_GUIDE 「도식」 — 본문의 말과 도식의 말이 같아야 도식이 본문을 가리킨다. 노드를 넓히거나 배치를 바꾼다.
- **약어 툴팁(`glossary`)을 채우지 마라.** 이유: ADR-037·ADR-055.
- **도식 전용 두 색과 초록·빨강·주황, 이모지, O/X, 애니메이션을 쓰지 마라.** 이유: ADR-036, UI_GUIDE.
- **SVG 두 개를 CSS로 골라 보이지 마라. 기준 폭 문자열을 이 파일에 쓰지 마라.** 이유: ADR-047.
- **공용 컴포넌트(`DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`)와 검사기를 고치지 마라.** 이유: 이 phase의 범위가 아니다.
- 기존 테스트를 깨뜨리지 마라.
