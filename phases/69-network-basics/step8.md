# Step 8: basics-visuals

## 배경

앱에 두 번째 과목 **네트워크**를 더하는 phase 69의 아홉째 step이다. step 6이 첫 주제 `network-basics`(개념 13개)를 썼다. 사용자는 네트워크 과목의 도식을
**처음부터 글과 함께** 만들기로 했다(2026-10-26). ADR-055가 도식의 자리를 정했다 — registry(`src/components/diagrams/registry.ts`)는 개념 id로 도식을 찾고 과목을 모르므로
그대로 쓰고, **네트워크 도식은 `src/data/network/visuals/`의 문구를 읽는다.** 도식 규칙(UI_GUIDE 「도식」 이하, ADR-036~038·047·048)은 과목과 상관없이 같다.

**이 step은 `network-basics`에 시나리오 도식 한 장과 비교표 하나를 붙인다.**

- **받는 대상 도식** — 앵커 `network-basics.cast-types`. 한 호스트가 보낸 메시지가 유니캐스트·브로드캐스트·멀티캐스트에서 각각 누구에게 닿는지 시나리오 버튼으로 가른다.
- **성능 지표 비교표** — 앵커 `network-basics.packet-loss`(성능 지표의 마지막 개념). 전송 속도·처리율·대역폭·패킷 손실을 한 표에 견준다. 학습자가 가장 헷갈리는 셋(전송 속도·처리율·대역폭)을 가른다.

이전 phase들은 좌표를 미리 설계해 사용자 미리보기 승인을 받은 뒤 step에 박았다. **이번에는 이 step이 좌표를 설계한다.** 사용자는 1장 화면을 보고 도식 방향을 정한다.
그래서 기계 검사(테스트의 넘침 검사, 경로 교차 검사기)를 모두 통과시키고, 설계를 summary에 남긴다.

## 읽어야 할 파일

- `docs/ADR.md`의 **ADR-055**, **ADR-036**, **ADR-037**(확장 문단 포함), **ADR-038**, **ADR-047**, **ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 **「도식 전용 색상」, 「도식」 절 전체**(「넓은 화면의 가로형」, 「한 개념 뒤의 여러 도식」, 「수량과 상태를 바꾸는 도식」, 「물음형 제목과 예시」), **「비교표」**
- `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `network-basics` — 특히 `cast-types`, `transmission-speed`, `throughput`, `bandwidth`, `packet-loss`, `traffic`의 본문
- `src/data/network/index.ts`, `src/data/network/visuals.test.ts`, `src/types/visuals.ts`
- 본보기 도식: `src/components/diagrams/ContainerImageDiagram.tsx`와 테스트(시나리오·곁말·세로형/가로형·물음형 제목), `src/components/diagrams/DelegatedAdminDiagram.tsx`와 테스트
- 본보기 표: `src/components/diagrams/containerTables.tsx`와 테스트, `src/components/diagrams/ComparisonTableFigure.tsx`(**고치지 마라**)
- `src/components/diagrams/DiagramFrame.tsx`(**고치지 마라**), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/38-service-diagrams/tools/check-path-crossings.mjs` — `const nodes = [`·`const wideNodes = [` 블록의 `{ id: '…', x: N, y: N, width: N` 순서와 `'id': 'M…'` 경로를
  정규식으로 읽고 노드 높이를 32로 본다. **이 형식을 지켜라.**

## 작업

### 1. 데이터 파일과 로더

- `src/data/network/visuals/network-basics.json` — `{ "diagrams": {}, "tables": {}, "glossary": [] }`에서 시작해 아래 도식과 표를 넣는다. **`glossary`는 빈 배열**이다(ADR-037·ADR-055).
- `src/data/network/index.ts`의 `visualsByTopicId`에 `'network-basics'` 키로 이 파일을 넣는다.

### 2. 받는 대상 도식 — `CastTypesDiagram`

- 컴포넌트 `src/components/diagrams/CastTypesDiagram.tsx`(이름이 `Diagram.tsx`로 끝나야 교차 검사 대상이 된다), 문구는 JSON `diagrams["cast-types"]`.
- 그릴 것: 그룹 박스 하나(같은 네트워크) 안에 **보내는 호스트** 하나와 **받을 수 있는 호스트 넷**(`호스트 A`~`호스트 D`). 보내는 호스트에서 각 호스트로 가는 경로 넷.
- 시나리오 셋:

  | id | label | 선명한 노드 | 보이는 경로 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `unicast` | 유니캐스트 | 보내는 호스트, 호스트 하나 | 그 호스트로 하나 | 정해진 한 호스트에게만 보낸다 |
  | `broadcast` | 브로드캐스트 | 모두 | 넷 다 | 같은 네트워크의 모든 호스트에게 보낸다 |
  | `multicast` | 멀티캐스트 | 보내는 호스트, 그룹에 속한 둘 | 그 둘로 | 정해진 그룹에 속한 호스트에게만 보낸다 |

  - 멀티캐스트의 그룹은 곁말로 표시한다(예: 그룹에 속한 두 호스트 근처에 「그룹」). 색으로 표시하지 않는다.
  - **캡션과 곁말에는 `cast-types` 본문에 있는 사실만 쓴다.** 브로드캐스트가 「같은 네트워크」 안으로 한정된다는 것이 본문에 없으면 그룹 박스 라벨과 캡션에서 그 말을 빼고 「모든 호스트」로만 쓴다.
    본문에 없는 사실(라우터가 브로드캐스트를 넘기지 않는다 등)을 도식이 새로 말하지 않는다(ADR-036 「도식도 콘텐츠다」).
- `question`(물음형 제목, ADR-038): 예) `보낸 메시지는 누구에게 닿을까?`. `idleCaption`, `label`(figure), `svgLabel`, `sources`(`network-basics.cast-types`)를 채운다.
  `legend`는 색을 쓰지 않으므로 두지 않거나 위치로 읽는 법만 적는다.
- **색**: 노드는 모두 `stroke-disabled`(회색)다. 도식 전용 두 색(`diagram-managed`·`diagram-resource`)은 쓰지 않는다 — 그 색의 뜻이 AWS 관리 영역과 VPC 안 자원이다(UI_GUIDE).
  강조는 opacity로만 한다(선택 밖 노드 0.25, 그룹 박스는 흐려지지 않는다).
- **세로형(폭 280)과 가로형(폭 440)을 함께** 만든다. 가로형은 `useWideDiagram()`이 `true`일 때 쓰고, `wideNodes`·`widePaths`·`wideGroups`(필요하면 `wideNotes`)를 **한 줄에 하나씩 글자 그대로** 적는다.
  반복문이나 계산으로 만들지 마라 — 교차 검사기가 이 줄들을 글자로 읽는다. 노드 id·경로 id·시나리오·문구는 두 배치가 함께 쓰고, 고른 시나리오는 배치가 바뀌어도 유지된다.
- **경로는 직교(M/H/V)만** 쓰고, 다른 노드 상자의 안을 지나지 않는다. 보내는 호스트에서 네 호스트로 가는 선이 서로 겹치는 구간은 괜찮지만(공용 줄기), 상자를 뚫으면 안 된다.
  화살표 마커는 기존 도식과 같고 마커 id는 `useId`로 만든다.
- `registry.ts`에 `'network-basics.cast-types': CastTypesDiagram` 한 줄. import는 기존 정렬 방식(모듈 경로 알파벳순), 키는 기존 키들 뒤에 이 주제의 줄을 모은다.

### 3. 성능 지표 비교표 — `PerformanceMetricsTable`

- `src/components/diagrams/networkBasicsTables.tsx`에 두고 `containerTables.tsx`처럼 JSON 표를 `ComparisonTableFigure`에 넘기기만 한다. 문구는 JSON `tables["performance-metrics"]`.
- `label`: 예) `네트워크 성능을 나타내는 지표`. `columns`는 셋 이하 — 예) `["지표","무엇을 나타내는가","단위"]`. 행은 전송 속도·처리율·대역폭·패킷 손실 넷, 개념 순서대로.
- **칸에는 각 개념 본문에 있는 사실만 쓴다.** 본문에 단위가 없는 지표의 단위 칸을 지어내지 마라 — 그런 지표가 있으면 열을 바꾼다. 판정에 색·이모지·O/X를 쓰지 않는다.
- `columnWidths`를 정한다. UI_GUIDE 「비교표」의 규칙대로 320px에서 끊을 수 없는 덩어리(영문 단위, 가장 긴 한글 낱말)가 열 안에 들어가게 잡고, 어떻게 어림했는지 summary에 적는다.
- `sources`: 네 개념의 id.
- `registry.ts`에 `'network-basics.packet-loss': PerformanceMetricsTable` 한 줄.

### 4. 테스트 — 먼저 쓰고 실패를 확인한 뒤 구현한다

`CastTypesDiagram.test.tsx` — 본보기 도식의 테스트와 같은 관문을 건다. 세로형은 `matchMedia` 없이, 가로형은 `describe('가로형 (768px 이상)', …)` 안에서만 `vi.stubGlobal('matchMedia', …)`.

1. 물음형 제목이 시나리오 버튼보다 앞에 보인다(헤딩이 아니다).
2. 처음(`전체`)에는 노드가 모두 선명하고 경로가 없다.
3. 시나리오마다 선명한 노드 집합, 보이는 경로, 보이는 곁말, 캡션이 JSON·위 표와 같다. 선택 밖 노드는 opacity `0.25`, 그룹 박스는 흐려지지 않는다.
4. 모든 `rect`가 `boxesOutsideViewBox`로 `viewBox` 안이고, `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`이다. 곁말·그룹 라벨은 `estimateTextWidth(문구, 9)`로 잰 가로 범위가 `viewBox` 안이다.
5. 어떤 경로 선분도 그룹 라벨 영역을 지나지 않는다. 노드 다섯은 두 배치 모두 그룹 박스 안이다.
6. 멀티캐스트의 경로는 그룹 곁말이 가리키는 두 호스트에서만 끝난다. 유니캐스트의 경로는 하나다. 브로드캐스트의 경로는 넷이다.
7. 두 번 렌더해도 화살표 마커 id가 겹치지 않는다.
8. JSON의 시나리오 id 집합과 컴포넌트의 시나리오 id 집합이 같고, 문구를 JSON에서 읽는다.
9. `ConceptList`에 `network-basics.cast-types` 개념을 주면 본문 뒤에 이 도식이 온다.
10. 가로형: `viewBox` 폭 440, 래퍼에 `w-full`이 있고 `max-w-[380px]`·`-mx-4`가 없다. 노드·그룹 id 집합과 경로 id 합집합이 세로형과 같다. 3~6번을 가로형에서도 통과한다.
    폭이 바뀌어도 고른 시나리오와 캡션이 유지된다.

`networkBasicsTables.test.tsx`:

1. `visualsByTopicId['network-basics']`가 있고 `glossary`는 빈 배열이다.
2. 표의 `label`·`columns`·`columnWidths`·`sources`·행 머리 순서가 JSON과 같고, 칸에 `O`·`X`·`○`·`×` 한 글자 판정이 없다.
3. 렌더된 `colgroup` 폭이 `columnWidths`와 같다.
4. `ConceptList`에 `network-basics.packet-loss`를 주면 본문 뒤에 표가 `figure` 하나로 오고 접근성 이름이 `label`과 같다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
git status --porcelain
```

교차 검사기는 지금 「세로 노드 345개·경로 268개, 가로 노드 345개·경로 268개」를 검사한다. 이 도식이 더한 수만큼 늘고 「교차 없음」으로 끝나야 한다.
**검사기를 고쳐서 통과시키지 마라.** 경로가 노드 상자를 뚫으면 통로를 옮긴다.

## 검증 절차

1. AC를 실행한다. 교차 검사기 출력의 노드·경로 수가 이 도식이 더한 만큼(노드 5개, 경로 4개 — 설계가 다르면 그 수) 늘었는지 본다.
2. 다음을 확인한다.
   - 캡션·곁말·표 칸에 개념 본문 밖의 사실이 없는가. 칸마다, 캡션마다 근거 문단을 댈 수 있는가.
   - 이모지·O/X·빨강·초록·주황·도식 전용 두 색·애니메이션이 없는가.
   - 바뀐 파일이 `CastTypesDiagram.tsx`·테스트, `networkBasicsTables.tsx`·테스트, `src/data/network/visuals/network-basics.json`, `src/data/network/index.ts`, `registry.ts`, phase 메타데이터뿐인가.
     `DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`topics.json`·`questions.json`·AWS 도식은 그대로인가.
3. `phases/69-network-basics/index.json`의 step 8을 갱신한다.
   - 성공 → `"summary"`에 두 배치의 `viewBox`와 노드·그룹·경로 좌표(한 줄로 압축), 시나리오별 선명한 노드·경로·곁말, 캡션 셋, 표의 열·열 폭과 어림 근거, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **본문에 없는 사실을 도식·표에 그리지 마라.** 이유: 도식은 콘텐츠다(ADR-036). 필요하면 고치지 말고 summary에 「본문에 이 문장이 있으면 그릴 수 있다」고 적는다.
- **`topics.json`·`questions.json`을 고치지 마라.** 이유: step 6의 산출물이다. 도식에 필요한 사실이 본문에 없으면 그 사실을 빼고 그린다.
- **약어 툴팁(`glossary`)을 채우지 마라.** 이유: 약어 툴팁은 VPC 주제에만 둔다(ADR-037·ADR-055).
- **도식 전용 두 색과 초록·빨강·주황, 이모지, O/X를 쓰지 마라.** 이유: 두 색은 AWS 계층의 뜻이 정해져 있고, 나머지는 정답/오답/중요도가 점유했다(ADR-036).
- **SVG 두 개를 그려 놓고 CSS로 하나를 숨기지 마라. 기준 폭 문자열(`'(min-width: 768px)'`)을 이 파일에 쓰지 마라.** 이유: ADR-047 — 판정은 `useWideDiagram()` 한 곳이다.
- **흐르는 점·자동 재생 같은 애니메이션을 넣지 마라.** 이유: UI_GUIDE 「애니메이션」.
- **`DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`·AWS 도식을 고치지 마라. 검사기를 고쳐서 통과시키지 마라.** 이유: 공용 컴포넌트와 검사기는 이 phase의 범위가 아니다.
- **`protocols-encapsulation`의 도식·표를 만들지 마라.** 이유: step 9의 범위다.
- 기존 테스트를 깨뜨리지 마라.
