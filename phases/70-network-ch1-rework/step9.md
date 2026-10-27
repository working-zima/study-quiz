# Step 9: layer-visuals

## 배경

phase 69가 네트워크 과목 1장 두 주제(`network-basics` 개념 13개, `protocols-encapsulation` 개념 10개)를 배포했다. 사용자는 화면을 보고 2026-10-27
「그림이 더 많으면 좋을 거 같아. 예를 들어 컴퓨터 네트워크에서는 호스트, 노드, 중간 링크를 잇는 그림」, 「그림은 거의 한 주제에 하나씩은 있어야 된다고 봐」, 「최소 하나씩」이라고 했다.
여기서 「주제」는 화면의 개념 제목이다. 그래서 ADR-056(step 0)이 **네트워크 과목은 개념마다 도식이 하나 이상**이라고 정했다. 비교표는 도식을 대신하지 않는다.
step 1·2가 1장 글을 `docs/WRITING_GUIDE.md` 기준으로 다시 썼고, step 3~9가 도식이 없는 개념 21개에 도식을 하나씩 그린다. step 10이 그것을 테스트로 고정한다.

phase 69가 그린 네트워크 도식 둘이 선례다 — `CastTypesDiagram`(받는 대상, 시나리오 셋, 그룹 박스와 곁말)과 `EncapsulationDiagram`(캡슐화, 두 배치가 크게 다름, 칸을 이어 붙인 데이터 단위).
이전 phase들처럼 사용자 미리보기 승인을 받지 않고 **이 step이 좌표를 설계한다.** 그래서 기계 검사(넘침·라벨 폭 테스트, 경로 교차 검사기)를 모두 통과시키고 설계를 summary에 남긴다.

**이 step은 `protocols-encapsulation`의 TCP/IP 모델·역캡슐화·계층별 데이터 단위에 도식을 하나씩 그리고, phase 69의 캡슐화 도식을 「캡슐화」 개념 뒤로 옮긴다.** 그러면 이 주제의 개념 열 개가 모두 도식을 갖는다. TCP/IP 모델에는 phase 69의 계층 대응표가 이미 붙어 있다 — 도식을 앞에, 표를 뒤에 둔다.

## 읽어야 할 파일

- `src/data/network/topics.json`의 이 step 개념(`tcp-ip-model`, `encapsulation`, `decapsulation`, `pdu-names`) — **step 1·2가 다시 쓴 본문**이 도식의 유일한 근거다
- `docs/ADR.md`의 **ADR-056**, **ADR-055**(「결정 — 도식」), **ADR-036**(도식도 콘텐츠다), **ADR-037**(「한 개념 뒤의 여러 도식」·「수량과 상태를 바꾸는 도식」), **ADR-038**(물음형 제목·예시 값),
  **ADR-047**·**ADR-048**(가로형), **ADR-009**
- `docs/UI_GUIDE.md`의 **「도식 전용 색상」, 「도식」 절 전체**(「넓은 화면의 가로형」, 「한 개념 뒤의 여러 도식」, 「수량과 상태를 바꾸는 도식」, 「물음형 제목과 예시」)
- `docs/WRITING_GUIDE.md` — 캡션·곁말·물음형 제목도 처음 배우는 사람이 읽는 글이다
- `src/components/diagrams/CLAUDE.md`
- `phases/70-network-ch1-rework/index.json`의 앞 step `summary` — 특히 step 1·2(다시 쓴 글)와 바로 앞 도식 step(교차 검사기의 노드·경로 수)
- **선례**: `src/components/diagrams/CastTypesDiagram.tsx`와 `CastTypesDiagram.test.tsx`, `src/components/diagrams/EncapsulationDiagram.tsx`와 `EncapsulationDiagram.test.tsx`,
  `src/data/network/visuals/network-basics.json`, `src/data/network/visuals/protocols-encapsulation.json`
- `src/data/network/index.ts`(`visualsByTopicId`), `src/data/network/visuals.test.ts`, `src/types/visuals.ts`
- `src/components/diagrams/DiagramFrame.tsx`(**고치지 마라** — `scenarios`는 선택 항목이라 정지 그림도 된다), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/38-service-diagrams/tools/check-path-crossings.mjs` — `*Diagram.tsx`의 `const nodes = [`·`const wideNodes = [` 블록에서 `{ id: '…', x: N, y: N, width: N` 순서를,
  경로 객체에서 `'id': 'M…'`를 정규식으로 읽고 **노드 높이를 32로 본다.** 이 형식을 지켜라.

## 작업

문구는 `src/data/network/visuals/protocols-encapsulation.json`의 `diagrams`에 더한다(그 파일의 기존 도식·표는 그대로).

### 공통 규칙 — 이 step의 도식 모두에 적용한다

- **파일**: 컴포넌트는 `src/components/diagrams/<이름>Diagram.tsx`(이름이 `Diagram.tsx`로 끝나야 교차 검사 대상이 된다), 테스트는 같은 이름의 `.test.tsx`.
  문구(물음형 제목·라벨·곁말·캡션·idleCaption·legend·figure `label`·`svgLabel`·`sources`)는 아래에 적힌 JSON 파일의 `diagrams["<키>"]`에 둔다. `glossary`는 빈 배열 그대로다(ADR-037·ADR-055).
- **사실은 본문에만 있는 것**(ADR-036). 캡션·곁말·라벨의 사실마다 그 개념(과 같은 주제의 다른 개념) 본문의 문단을 근거로 댈 수 있어야 한다. 예시 값(장치 이름, 숫자)도 본문에 나오는 것만 쓴다(ADR-038).
  `호스트 A`·`네트워크 1`처럼 대상을 가르는 이름표는 사실이 아니므로 써도 된다. **본문에 없는 사실이 필요하면 그리지 말고 summary에 「본문에 이 문장이 있으면 그릴 수 있다」고 적는다.**
  아래 「그릴 것」은 설계 의도다. 다시 쓴 본문(step 1·2)과 어긋나면 **본문을 따르고** 다른 점을 summary에 적는다.
- **말**: 노드 라벨·곁말은 본문에 쓰인 말과 같게 쓴다. 라벨을 줄이거나 영문 약어로 바꿔 폭을 맞추지 마라 — 노드를 넓히거나 배치를 바꾼다(UI_GUIDE 「도식」).
- **글자 크기**: 노드 라벨 10, 그룹 라벨·곁말 9(viewBox 단위). `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`. 노드 높이는 32다(교차 검사기가 32로 본다 — 키 큰 노드를 만들지 말고 그룹 박스를 쓴다).
- **색**: 노드는 모두 회색(`stroke-disabled`, 선례와 같은 클래스). 도식 전용 두 색(`diagram-managed`·`diagram-resource`)은 AWS 계층의 뜻이라 쓰지 않는다. 초록·빨강·주황, 이모지, O/X도 쓰지 않는다(ADR-036).
  강조는 opacity로만 한다 — 선택 밖 노드 `0.25`, 그룹 박스는 흐려지지 않는다. 나쁜 상태(과부하·손실·끼어들 수 없음)는 색이 아니라 곁말과 흐림·사라지는 경로로 보인다(UI_GUIDE 「수량과 상태를 바꾸는 도식」).
- **두 배치**: 세로형(`viewBox` 폭 280)과 가로형(폭 440)을 함께 만든다. 가로형은 `useWideDiagram()`이 `true`일 때 쓴다. `nodes`·`wideNodes`·경로·`wideGroups`·`wideNotes`를 **한 줄에 하나씩 글자 그대로** 적는다 —
  반복문이나 계산으로 만들지 마라(교차 검사기가 글자로 읽는다). 노드 id·경로 id·시나리오·문구는 두 배치가 함께 쓰고, 고른 시나리오는 배치가 바뀌어도 유지된다.
- **경로**: 직교(M/H/V)만, 노드 변에서 시작하고 끝나며, 다른 노드 상자 안을 지나지 않는다. 늘 보이는 연결선(통신 링크 같은)도 같은 경로 선언 꼴(`'id': 'M…'`)로 적어 교차 검사기가 읽게 한다.
  화살표 마커는 선례와 같고 마커 id는 `useId`로 만든다. 그룹 라벨 영역을 지나는 선분이 없어야 한다.
- **물음형 제목**(ADR-038): `question`을 둔다 — 그림이 답하는 것 하나를 학습자의 말로. 아래 예는 바꿔도 된다.
- **시나리오**: 아래에 적힌 시나리오를 둔다. 「정지 그림」이라고 적힌 도식은 `scenarios` 없이 `idleCaption`이 캡션 노릇을 한다. 시나리오가 있는 도식은 `전체`(아무것도 고르지 않음)에서 노드가 모두 선명하다.
  두 시나리오의 「선명한 노드 + 보이는 경로 + 보이는 곁말」이 같으면 그 시나리오는 아무것도 가르지 못한다 — 다르게 설계한다. 캡션은 20자를 넘는다(`visuals.test.ts`).
- **금지**: SVG 두 개를 그려 놓고 CSS로 하나를 숨기지 마라. 기준 폭 문자열(`'(min-width: 768px)'`)을 도식 파일에 쓰지 마라(ADR-047 — 판정은 `useWideDiagram()` 한 곳). 흐르는 점·자동 재생 같은 애니메이션 금지.
- **registry**: `src/components/diagrams/registry.ts`에 `'<개념 id>': <이름>Diagram` 한 줄씩. import는 기존 정렬 방식(모듈 경로 알파벳순), 키는 네트워크 줄들이 모인 곳에 개념 순서대로.
  그 개념에 이미 비교표가 있으면 배열로 `[<이름>Diagram, <표>]` — 도식을 먼저, 표를 나중에(UI_GUIDE 「한 개념 뒤의 여러 도식」).

### 테스트 — 도식마다 먼저 쓰고 실패를 확인한 뒤 구현한다

`<이름>Diagram.test.tsx` — 선례(`CastTypesDiagram.test.tsx`·`EncapsulationDiagram.test.tsx`)와 같은 관문을 건다. 세로형은 `matchMedia` 없이, 가로형은 `describe('가로형 (768px 이상)', …)` 안에서만 `vi.stubGlobal('matchMedia', …)`.

1. 물음형 제목이 시나리오 버튼보다(정지 그림이면 SVG보다) 앞에 보인다(헤딩이 아니다).
2. 처음(`전체`)에는 노드가 모두 선명하다. 시나리오에만 쓰이는 경로는 보이지 않는다(늘 보이는 연결선은 보인다).
3. 시나리오마다 선명한 노드 집합, 보이는 경로, 보이는 곁말, 캡션이 JSON·아래 설계와 같다. 선택 밖 노드는 opacity `0.25`, 그룹 박스는 흐려지지 않는다.
4. 모든 `rect`가 `boxesOutsideViewBox`로 `viewBox` 안이고, 노드 라벨이 `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`이다. 곁말·그룹 라벨은 `estimateTextWidth(문구, 9)`로 잰 가로 범위가 `viewBox` 안이다.
5. 경로의 끝점이 노드 변 위에 있고, 어떤 선분도 다른 노드 상자 안과 그룹 라벨 영역을 지나지 않는다.
6. **그 도식의 요점** — 아래 도식마다 적힌 「요점 테스트」.
7. 두 번 렌더해도 화살표 마커 id가 겹치지 않는다. JSON의 시나리오 id 집합과 컴포넌트의 것이 같고, 문구를 JSON에서 읽는다.
8. `ConceptList`에 앵커 개념을 주면 본문 뒤에 이 도식이 온다(비교표가 함께 있으면 도식이 표보다 앞).
9. 가로형: `viewBox` 폭 440, 래퍼에 `w-full`이 있고 `max-w-[380px]`·`-mx-4`가 없다. 노드·그룹 id 집합과 경로 id 합집합이 세로형과 같고, 3~6번을 가로형에서도 통과한다. 폭이 바뀌어도 고른 시나리오와 캡션이 유지된다.

정지 그림은 시나리오에 관한 항목(2의 경로 부분, 3, 7의 시나리오 id, 9의 선택 유지)을 「캡션이 `idleCaption`이고 버튼이 없다」로 바꿔 건다.

### 이 step의 도식

#### 0. 캡슐화 도식을 옮긴다

- `registry.ts`의 `'protocols-encapsulation.decapsulation': EncapsulationDiagram`을 `'protocols-encapsulation.encapsulation': EncapsulationDiagram`으로 바꾼다.
  도식 자체(`EncapsulationDiagram.tsx`의 좌표·노드·시나리오)와 JSON 문구는 바꾸지 않는다. 그 도식은 보낼 때·받을 때를 모두 보여 주므로 「캡슐화」 뒤에서 그대로 읽힌다.
- `EncapsulationDiagram.test.tsx`의 ConceptList 테스트(앵커가 `decapsulation`이라고 단언하는 곳)만 `encapsulation`으로 고친다.

#### 1. `protocols-encapsulation.tcp-ip-model` — `LayerMappingDiagram`, JSON 키 `layer-mapping`

- 물음형 제목 예: `OSI의 일곱 계층은 TCP/IP의 네 계층과 어떻게 짝지어질까?`
- 그릴 것: 왼쪽에 OSI 일곱 계층, 오른쪽에 TCP/IP 네 계층(본문의 이름 — `네트워크 액세스 계층` 등). 대응은 노드 높이를 늘려서가 아니라(노드 높이는 32) 그룹 박스나 짧은 경로로 보인다.
- 시나리오(TCP/IP 계층마다):

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `application` | 응용 계층 | TCP/IP 응용 ↔ OSI 응용·표현·세션 | 응용 계층 자리에 OSI의 응용·표현·세션을 놓는다. **표준은 표현·응용만 말하고 세션 계층은 TCP/IP에 처음부터 없다 — 세션까지 묶은 것은 강의의 정리다**(본문 L25 문단) |
  | `transport` | 전송 계층 | 전송 ↔ 전송 | 전송 계층은 전송 계층에 해당한다(본문이 말하는 차이 — OSI는 신뢰성을 정의하지만 TCP/IP에는 UDP도 있다 — 를 넣을 수 있다) |
  | `internet` | 인터넷 계층 | 인터넷 ↔ 네트워크 | 인터넷 계층은 OSI의 네트워크 계층에 해당한다 |
  | `network-access` | 네트워크 액세스 계층 | 네트워크 액세스 ↔ 데이터 링크·물리 | 네트워크 액세스 계층이 OSI의 물리·데이터 링크 계층의 일을 함께 맡는다 |

  `application` 시나리오의 세션 계층 노드 곁에 L25 내용을 짧은 곁말로 둘 수 있다(본문의 말로). 세션을 응용에 묶는 것을 표준의 대응처럼 그리지 마라.
- 요점 테스트: 시나리오마다 선명한 OSI 계층 집합이 위 표와 같고, 네 시나리오의 OSI 집합을 합치면 일곱 계층이 빠짐없이 한 번씩 나온다.
- registry: `'protocols-encapsulation.tcp-ip-model': [LayerMappingDiagram, ReferenceModelTable]`. `protocolsTables.test.tsx`의 ConceptList 테스트가 표 하나를 기대해 깨지면 표가 도식 뒤에 온다는 단언으로 고친다(그 한 곳만).

#### 2. `protocols-encapsulation.decapsulation` — `DecapsulationDiagram`, JSON 키 `decapsulation-peel`

- 물음형 제목 예: `받은 데이터에서 헤더는 어떤 순서로 떨어질까?`
- 그릴 것: 받은 단위 하나가 바깥부터 한 겹씩 벗겨지는 모습. 이름은 **캡슐화 도식과 같은 말**(`이더넷 헤더`·`IP 헤더`·`TCP 헤더`·`HTTP 헤더`·`데이터`·`트레일러`, 본문의 예).
  캡슐화 도식의 「받을 때」(계층마다 줄을 다시 그림)와 달리, 이 도식은 **한 덩어리에서 떼어 내는 순서**를 보인다 — 예: 한 줄로 이어 붙인 칸에서 단계마다 바깥쪽 칸이 떨어져 나가는 꼴.
  겹친 상자로 그린다면 겹침은 노드가 아니라 그룹 박스로 그린다(교차 검사기는 노드 상자를 지나는 선을 잡는다).
- 시나리오(아래 계층부터 차례로):

  | id | label | 떼어 내는 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `network-access` | 네트워크 액세스 계층 | 이더넷 헤더·트레일러 | 맨 아래 계층이 가장 바깥의 헤더와 트레일러를 떼고 나머지를 위로 넘긴다 |
  | `internet` | 인터넷 계층 | IP 헤더 | 인터넷 계층은 자기 헤더(IP 헤더)만 뗀다 |
  | `transport` | 전송 계층 | TCP 헤더 | 전송 계층은 TCP 헤더를 떼어 응용 계층으로 넘긴다 |
  | `application` | 응용 계층 | HTTP 헤더 | 응용 계층까지 떼면 원래의 데이터가 응용 프로그램에 닿는다 |

  단계마다 「이미 떼어 낸 칸」과 「지금 떼는 칸」과 「남은 칸」이 구별되어야 한다(흐림·곁말 `떼어 냄`).
- 요점 테스트: 시나리오를 차례로 볼 때 남은 칸 수가 줄어든다. 각 시나리오에서 지금 떼는 칸이 남은 칸들 가운데 가장 바깥(왼쪽 끝, 트레일러는 오른쪽 끝)이다. `application` 뒤에는 `데이터`만 남는다.

#### 3. `protocols-encapsulation.pdu-names` — `PduNamesDiagram`, JSON 키 `pdu-names`

- 물음형 제목 예: `계층마다 데이터 단위를 무엇이라 부를까?`
- 그릴 것: TCP/IP 네 계층(본문의 이름)과 계층마다 단위 이름 노드(`메시지`·`세그먼트`/`데이터그램`·`패킷`·`프레임`). 본문이 말하는 다른 이름(표준의 `IP 데이터그램`, `사용자 데이터그램`)은 곁말로 둘 수 있다.
- 시나리오:

  | id | label | 전송 계층 단위 | 캡션이 말할 것 |
  |---|---|---|---|
  | `tcp` | TCP를 쓸 때 | `세그먼트` | 전송 계층에서 TCP가 만든 단위가 세그먼트다 |
  | `udp` | UDP를 쓸 때 | `데이터그램` | 같은 전송 계층이라도 UDP가 만든 단위는 데이터그램이라 부른다 |

  나머지 계층의 단위 이름은 두 시나리오에서 같다.
- 요점 테스트: 계층 노드와 단위 노드가 같은 높이에 짝을 이룬다. 두 시나리오에서 전송 계층의 단위만 다르고 나머지 단위 노드는 같다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject network
git status --porcelain
```

교차 검사기의 노드·경로 수는 앞 step이 끝났을 때의 수(그 step `summary`에 있다. phase 70 시작 때는 세로·가로 모두 노드 369개·경로 278개)에서 이 step이 더한 만큼 늘고 「교차 없음」으로 끝나야 한다.
**검사기를 고쳐서 통과시키지 마라.** 경로가 노드 상자를 뚫으면 통로를 옮긴다.

## 검증 절차

1. AC를 실행한다. 교차 검사기의 수가 이 step의 도식이 더한 노드·경로 수만큼 늘었는지 본다.
2. 다음을 확인한다.
   - 캡션·곁말·라벨의 사실마다 근거 문단을 댈 수 있는가. 예시 값이 본문에 있는가. 라벨이 본문의 말과 같은가.
   - 이모지·O/X·빨강·초록·주황·도식 전용 두 색·16진 색·애니메이션·기준 폭 문자열이 새 파일에 없는가(`grep`).
   - 바뀐 파일이 `src/data/network/visuals/protocols-encapsulation.json`, 새 도식 컴포넌트·테스트, `src/components/diagrams/EncapsulationDiagram.test.tsx`(앵커 한 곳), `src/components/diagrams/protocolsTables.test.tsx`(배열이 되어 깨지면 한 곳), `src/components/diagrams/registry.ts`, phase 메타데이터뿐인가.
     `DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`·`topics.json`·`questions.json`·AWS 도식·다른 네트워크 도식(`EncapsulationDiagram.tsx`의 좌표 포함)은 그대로인가.
3. `phases/70-network-ch1-rework/index.json`의 step 9을 갱신한다.
   - 성공 → `"summary"`에 도식마다 두 배치의 `viewBox`와 노드·그룹·경로 좌표(한 줄로 압축), 시나리오별 선명한 노드·경로·곁말과 캡션(정지 그림이면 idleCaption),
     물음형 제목, 라벨과 사실의 근거 문단, 설계 의도와 달라진 점, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **본문에 없는 사실을 도식에 그리지 마라.** 이유: 도식은 콘텐츠다(ADR-036). 그림으로 그럴듯해 보이는 인과(「트래픽이 늘면 처리율이 는다」 같은)도 본문에 없으면 사실을 더하는 것이다.
- **`topics.json`·`questions.json`을 고치지 마라.** 이유: 글은 step 1·2의 산출물이고 사용자가 읽고 승인했다. 도식에 필요한 사실이 본문에 없으면 빼고 그린다.
- **`glossary`를 채우지 마라.** 이유: 약어 툴팁은 VPC 주제에만 둔다(ADR-037·ADR-055).
- **도식 전용 두 색과 초록·빨강·주황, 이모지, O/X, 애니메이션을 쓰지 마라.** 이유: 두 색은 AWS 계층의 뜻, 나머지는 정답/오답/중요도가 점유했다(ADR-036).
- **SVG 두 개를 CSS로 골라 보이지 마라. 기준 폭 문자열을 도식 파일에 쓰지 마라.** 이유: ADR-047.
- **노드 라벨을 줄이거나 영문 약어로 바꾸지 마라.** 이유: 본문의 말과 도식의 말이 같아야 도식이 본문을 가리킨다.
- **공용 컴포넌트(`DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`)와 교차 검사기를 고치지 마라.** 이유: 이 phase의 범위가 아니다.
- **이 step에 적힌 개념 밖의 도식을 만들지 마라.** 이유: 다른 개념은 다른 step의 범위다.
- 기존 테스트를 깨뜨리지 마라.
