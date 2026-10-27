# Step 8: switching-visuals

## 배경

phase 69가 네트워크 과목 1장 두 주제(`network-basics` 개념 13개, `protocols-encapsulation` 개념 10개)를 배포했다. 사용자는 화면을 보고 2026-10-27
「그림이 더 많으면 좋을 거 같아. 예를 들어 컴퓨터 네트워크에서는 호스트, 노드, 중간 링크를 잇는 그림」, 「그림은 거의 한 주제에 하나씩은 있어야 된다고 봐」, 「최소 하나씩」이라고 했다.
여기서 「주제」는 화면의 개념 제목이다. 그래서 ADR-056(step 0)이 **네트워크 과목은 개념마다 도식이 하나 이상**이라고 정했다. 비교표는 도식을 대신하지 않는다.
step 1·2가 1장 글을 `docs/WRITING_GUIDE.md` 기준으로 다시 썼고 step 3이 문항을 다시 냈다. step 4~10이 도식이 없는 개념 21개에 도식을 하나씩 그린다. step 11이 그것을 테스트로 고정한다.

phase 69가 그린 네트워크 도식 둘이 선례다 — `CastTypesDiagram`(받는 대상, 시나리오 셋, 그룹 박스와 곁말)과 `EncapsulationDiagram`(캡슐화, 두 배치가 크게 다름, 칸을 이어 붙인 데이터 단위).
이전 phase들처럼 사용자 미리보기 승인을 받지 않고 **이 step이 좌표를 설계한다.** 그래서 기계 검사(넘침·라벨 폭 테스트, 경로 교차 검사기)를 모두 통과시키고 설계를 summary에 남긴다.

**이 step은 `protocols-encapsulation`의 패킷 교환 네트워크·패킷·회선 교환 네트워크에 도식을 하나씩 그린다.** 패킷 교환과 회선 교환은 헷갈리는 짝이라, 두 도식이 같은 장면(두 호스트와 가운데 장비, 끼어드는 호스트 하나)을 쓰면 차이가 잘 보인다.

## 읽어야 할 파일

- `src/data/network/topics.json`의 이 step 개념(`packet-switching`, `packet`, `circuit-switching`) — **step 1·2가 다시 쓴 본문**이 도식의 유일한 근거다
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

#### 1. `protocols-encapsulation.packet-switching` — `PacketSwitchingDiagram`, JSON 키 `packet-switching`

- 물음형 제목 예: `큰 파일은 네트워크를 어떻게 건너갈까?`
- 그릴 것: 보내는 호스트, 받는 호스트, 가운데 패킷을 넘겨주는 장비 셋쯤(두 갈래 길이 생기게), 다른 호스트 하나. 본문의 예(큰 파일, 패킷 스위치)를 쓴다.
- 시나리오:

  | id | label | 경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `split` | 나눠 보내기 | 패킷 1·2·3이 서로 다른 길로(경로 둘 이상), 받는 쪽 곁에 `다시 합침` | 보낼 정보를 패킷으로 나눠 따로 넘기므로 패킷마다 다른 길로 갈 수 있고, 받는 쪽이 다시 합친다 |
  | `share` | 링크 나눠 쓰기 | 두 호스트의 패킷 경로가 같은 링크 구간을 함께 지남 | 회선을 미리 잡지 않으므로 여러 호스트의 패킷이 같은 링크를 함께 지나간다 |

- 요점 테스트: `split`의 경로가 둘 이상이고 같은 출발·도착을 잇되 거치는 장비가 다르다. `share`에서 서로 다른 호스트에서 출발한 두 경로가 같은 선분 구간을 공유한다.

#### 2. `protocols-encapsulation.packet` — `PacketPartsDiagram`, JSON 키 `packet-parts`

- 물음형 제목 예: `패킷 하나는 어떤 부분으로 이루어질까?`
- 그릴 것: 이어 붙인 칸 `헤더`·`페이로드`·`트레일러`(캡슐화 도식처럼 빈틈없이 붙인다). 칸마다 하는 일을 곁말로(본문의 말 — 앞에 붙는 부가 정보, 실어 보낼 정보, 뒤에 붙는 부가 정보).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `with-trailer` | 트레일러를 쓰는 프로토콜 | 세 칸 모두 | 트레일러를 쓰는 프로토콜이면 페이로드 뒤에도 부가 정보가 붙는다 |
  | `without-trailer` | 트레일러가 없는 패킷 | 헤더·페이로드(트레일러 흐림) | 트레일러는 모든 패킷에 붙지 않는다 — 헤더와 페이로드만인 패킷도 있다 |

- 요점 테스트: 칸이 왼쪽부터 헤더·페이로드·트레일러 순서로 빈틈없이 이어진다. `without-trailer`에서 트레일러 칸만 흐리다.

#### 3. `protocols-encapsulation.circuit-switching` — `CircuitSwitchingDiagram`, JSON 키 `circuit-switching`

- 물음형 제목 예: `잡아 둔 회선에 다른 호스트가 끼어들 수 있을까?`
- 그릴 것: 호스트 A·B, 둘 사이 잡아 둔 회선(경로), 그 회선을 쓰려는 호스트 C. 패킷 교환 도식과 같은 자리 배치를 쓰면 좋다.
- 시나리오:

  | id | label | 선명한 것·경로 | 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `in-use` | 주고받는 중 | A·B와 회선, C 흐림 | C 곁에 `끼어들 수 없음` | 연결을 세워 잡아 둔 회선은 두 호스트만 쓰고, 다른 호스트는 도중에 끼어들 수 없다. 그래서 전송률이 보장된다 |
  | `idle` | 잠시 쉬는 중 | 회선(데이터 화살표 없음), C 흐림 | 회선 곁에 `비어 있지만 남은 못 씀` 같은 말(본문의 말로) | 두 호스트가 잠시 주고받지 않아도 다른 호스트가 쓰지 못해, 회선 이용률이 떨어진다 |

  끼어들 수 없음은 색이 아니라 흐림과 곁말로 보인다. C에서 회선으로 가는 경로는 그리지 않는다(갈 수 없으므로).
- 요점 테스트: 두 시나리오 모두 C가 흐리고 C에서 시작하는 경로가 없다. `in-use`와 `idle`의 보이는 경로·곁말이 다르다.

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
   - 바뀐 파일이 `src/data/network/visuals/protocols-encapsulation.json`, 새 도식 컴포넌트·테스트, `src/components/diagrams/registry.ts`, phase 메타데이터뿐인가.
     `DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`·`topics.json`·`questions.json`·AWS 도식·다른 네트워크 도식은 그대로인가.
3. `phases/70-network-ch1-rework/index.json`의 step 8을 갱신한다.
   - 성공 → `"summary"`에 도식마다 두 배치의 `viewBox`와 노드·그룹·경로 좌표(한 줄로 압축), 시나리오별 선명한 노드·경로·곁말과 캡션(정지 그림이면 idleCaption),
     물음형 제목, 라벨과 사실의 근거 문단, 설계 의도와 달라진 점, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **본문에 없는 사실을 도식에 그리지 마라.** 이유: 도식은 콘텐츠다(ADR-036). 그림으로 그럴듯해 보이는 인과(「트래픽이 늘면 처리율이 는다」 같은)도 본문에 없으면 사실을 더하는 것이다.
- **`topics.json`·`questions.json`을 고치지 마라.** 이유: 글과 문항은 step 1~3의 산출물이고 사용자가 읽고 승인했다. 도식에 필요한 사실이 본문에 없으면 빼고 그린다.
- **`glossary`를 채우지 마라.** 이유: 약어 툴팁은 VPC 주제에만 둔다(ADR-037·ADR-055).
- **도식 전용 두 색과 초록·빨강·주황, 이모지, O/X, 애니메이션을 쓰지 마라.** 이유: 두 색은 AWS 계층의 뜻, 나머지는 정답/오답/중요도가 점유했다(ADR-036).
- **SVG 두 개를 CSS로 골라 보이지 마라. 기준 폭 문자열을 도식 파일에 쓰지 마라.** 이유: ADR-047.
- **노드 라벨을 줄이거나 영문 약어로 바꾸지 마라.** 이유: 본문의 말과 도식의 말이 같아야 도식이 본문을 가리킨다.
- **공용 컴포넌트(`DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`)와 교차 검사기를 고치지 마라.** 이유: 이 phase의 범위가 아니다.
- **이 step에 적힌 개념 밖의 도식을 만들지 마라.** 이유: 다른 개념은 다른 step의 범위다.
- 기존 테스트를 깨뜨리지 마라.
