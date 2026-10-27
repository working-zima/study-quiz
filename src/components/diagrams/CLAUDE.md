# src/components/diagrams/

개념 본문 바로 뒤에 붙는 SVG 도식·비교표·단계 그림이다. 레이아웃이 서로 달라 도식마다 컴포넌트 하나를 둔다(ARCHITECTURE 「디렉토리 구조」).

- **registry는 과목을 모른다.** `registry.ts`의 `diagramsByConceptId`는 개념 id 하나로 도식을 찾는다. 개념 id가 과목을 넘어 유일하므로
  (ADR-053 「불변식」) 그것으로 충분하고, 도식은 **자기 과목 폴더**를 직접 읽는다 — AWS 도식은 `src/data/aws`, 네트워크 도식은
  `src/data/network`(ADR-055). 단계 그림은 `stepFiguresByConceptId`다(ADR-050).
- **도식은 콘텐츠다.** 본문에 없는 사실·대소 관계를 그리지 않는다. 예시 값도 본문에 나오는 것만 쓴다(ADR-036, ADR-038 「예시의 경계」).
- 문구(캡션·표·약어)는 과목 폴더의 `visuals/<주제 id>.json`(`src/data/aws/visuals/`·`src/data/network/visuals/`)에, 좌표와 경로는
  컴포넌트에 둔다(ADR-037). 약어(`glossary`)는 AWS VPC 주제에만 있고 네트워크는 비운다(ADR-055).

규칙은 UI_GUIDE 「도식」 이하에 있다. 먼저 볼 곳:

| 무엇 | 어디 |
|---|---|
| 세로형 `viewBox` 폭 280, 글자 크기(노드 라벨 10, 그룹 라벨·곁말 9), 위치가 1차 채널이고 색은 보조, opacity 강조, `figure`의 `aria-label` | UI_GUIDE 「도식」, ADR-036 |
| 도식 전용 두 색 `diagram-managed`·`diagram-resource` — 도식 안의 계층 구분에만 | UI_GUIDE 「도식 전용 색상」, ADR-036 |
| 768px 이상의 가로형(폭 440, `wideNodes`·`widePaths`·`wideGroups`, `useWideDiagram()`). 새 도식도 두 배치를 함께 짠다 | UI_GUIDE 「넓은 화면의 가로형 (ADR-047·ADR-048)」 |
| 한 개념 뒤의 여러 도식, 수량·상태는 시나리오 버튼으로 | UI_GUIDE 「한 개념 뒤의 여러 도식」·「수량과 상태를 바꾸는 도식」, ADR-037 |
| 물음형 제목과 예시 값 | UI_GUIDE 「물음형 제목과 예시 (ADR-038)」 |
| 단계 그림(폭 208, 가로형 없음) | UI_GUIDE 「단계 그림 (ADR-050)」 |
| 비교표(열 셋 이하, 320px에서 끊기지 않게) | UI_GUIDE 「비교표 (ADR-037)」 |

## 넘침 검사

- 테스트에서 `src/lib/svg-bounds.ts`로 모든 `rect`가 `viewBox` 안에 있는지(`boxesOutsideViewBox`), 라벨이
  `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`인지 단언한다. 도식마다 `matchMedia`를 모의해 가로형에도 같은 관문을 건다
  (ARCHITECTURE 「테스트 경계」, UI_GUIDE 「도식」).
- 경로선이 노드 내부를 지나는지는 `phases/38-service-diagrams/tools/check-path-crossings.mjs`가 본다(UI_GUIDE 「도식」).
- 실제 글자 폭과 경로선의 가독성은 사람이 브라우저로 확인한다(UI_GUIDE 「도식」). 실측 기록은 각 phase의 `measurements.md`에 있다.
