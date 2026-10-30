# Step 3: region-pairs-sovereign

## 배경

phase 102는 Azure AZ-900 과목에 주제 둘을 더한다. 전체 계획·결정·공통 규칙은 `phases/102-azure-regions-resource-hierarchy/guide.md`에 있다.
**이 step은 주제 `azure-regions-zones`에 마지막 개념 둘(5 지역 쌍, 6 소버린 지역)의 글·문항과 도식 `RegionPairDiagram`을 더해 이 주제를 끝낸다.**

지역 쌍에서 학습자가 가장 쉽게 잘못 외우는 것은 **「짝이 있으면 모든 것이 저절로 넘어간다」**는 것이다 — 저절로 복제하고 장애 조치하는 것은 일부 서비스뿐이고 나머지는 고객이 구성한다.
또 Learn 단원과 현행 문서가 지역 쌍의 비율·거리를 다르게 말할 수 있다 — **step 0 summary가 정한 쪽을 따른다.**

## 읽어야 할 파일

- **`phases/102-azure-regions-resource-hierarchy/guide.md` 전체**
- `phases/102-azure-regions-resource-hierarchy/index.json`의 step 0 `summary`(개념 5·6의 확정 `name`, 지역 쌍을 「대부분/일부」 중 어떻게 쓸지와 거리, 소버린/주권 표기, 실제 이름을 쓸 수 있는 것)와 step 1·2 `summary`(앞 개념이 푼 낱말, 도식 설계, 균형 줄, 교차 검사 수)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`(`azure-regions-zones`의 개념 1~4 — **먼저 통독한다**), `questions.json`, `visuals/azure-regions-zones.json`, `data.test.ts`·`visuals.test.ts`
- 도식 선례 — step 1·2의 `AzureRegionDiagram`·`ZoneIsolationDiagram`과 `.test.tsx`(같은 주제), phase 101의 `src/components/diagrams/CompositeSlaDiagram.tsx`(시나리오에만 보이는 경로·곁말),
  `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-regions-zones` 끝에

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `azure-regions-zones.region-pairs` | 지역 쌍 | — | 가용성 영역(개념 3)이 못 막는 것(지역 전체에 미치는 사건)을 되짚어 세운다 — 「앞 개념에서 본 것처럼」은 써도 된다. Microsoft가 짝을 정하고 고객은 고르지 못한다, 같은 지리 안, 거리(step 0 결과대로 — 쓰지 않기로 했으면 쓰지 않는다). **모든 서비스가 저절로 복제·장애 조치하지 않는다 — 그런 서비스는 고객이 구성한다**. 덧붙은 이점과 짝이 없는 지역·한 방향 짝은 step 0 결과대로(짝이 없는 지역이 가용성 영역을 주된 대비로 쓴다는 것은 개념 3을 되짚는다). **장애 조치**를 한 줄로 푼다. **도식의 예를 본문에 쓴다** — 같은 지리 안의 지역 A·지역 B가 짝일 때, 지역 A 전체가 멈추면 일을 지역 B가 이어받는다(서비스에 따라 저절로, 또는 고객이 미리 구성해 둔 대로), 계획된 업데이트는 두 지역에 한 번에 하지 않고 한 지역씩 한다. 실제 지역 쌍의 예는 step 0이 확인했을 때만 한 줄 |
| 6 | `azure-regions-zones.sovereign-regions` | 소버린 지역 | — | 이름은 step 0의 표기 결정대로. 주 Azure와 격리된 인스턴스라는 것, 규정 준수·법적 이유, **인스턴스**를 한 줄로 푼다. 예 둘(미국 정부용 Azure Government, 21Vianet이 운영하는 중국의 Azure — 현행 이름은 step 0 결과대로) — 각각 누가 쓰고 누가 운영하는지. 일반 지역과 무엇이 다른지 4절대로(격리, 운영 주체, 서비스·기능이 적을 수 있음 — step 0 결과대로). 덤프의 Azure Germany는 쓰지 않는다(지원 종료 — step 0의 D 항목) |

### 2. 문항 — `src/data/azure/questions.json`에 `az045`~`az047`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az045` | `region-pairs` | 예/아니요 「흔한 오해」 — 짝이 있는 지역이 멈추면 그 지역에 둔 리소스가 모두 짝 지역으로 저절로 넘어가는가(아니요 — 일부 서비스만, 나머지는 고객이 구성). 해설은 고객이 해야 할 일까지 가르친다. 문제문에 「모두」를 쓰면 「항상」 금지의 뜻(단정으로 정답을 흘림)에 걸리지 않는지 다시 읽는다 — 걸리면 서비스 하나를 집어 묻는 꼴로 |
| `az046` | `region-pairs` | 4지선다 「원리 이해」 — 계획된 업데이트를 짝의 두 지역에 한 지역씩 하는 까닭, 또는 고객이 짝을 정할 수 있는가(예/아니요로 낼 때) — step 0이 확인한 사실 가운데 `az045`와 다른 것을 묻는다. 오답은 실제로 헷갈리는 까닭(업데이트 비용을 줄이려고, 고객이 고른 순서대로, 데이터를 다른 지리로 옮기려고 등 — step 0이 확인한 사실로 갈리는 것) |
| `az047` | `sovereign-regions` | 4지선다 「상황 적용」 — 어떤 조직이 규정 때문에 주 Azure와 격리된 곳에 배포해야 하는 상황에서 알맞은 곳을 고른다(예: 미국 정부 기관 → Azure Government). 오답은 같은 범주(배포할 곳) 안에서 — 21Vianet이 운영하는 Azure, 가용성 영역이 있는 일반 지역, 짝이 있는 일반 지역. 상황의 조건(누가, 어떤 규정)이 정답 하나만 맞게 한다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 2 summary의 균형 줄이다.

### 3. 도식

#### `azure-regions-zones.region-pairs` — `RegionPairDiagram`, JSON 키 `region-pairs`

- 물음형 제목 예: `한 지역 전체가 멈추면, 짝지은 지역은 무엇을 해 줄까?`
- 그릴 것: 그룹 박스 `geography`(「지리」 — step 1과 같은 표기) 안에 노드 `region-a`(「지역 A」)·`region-b`(「지역 B」). 세로형은 위아래, 가로형은 왼쪽·오른쪽.
  늘 보이는 연결선 `pair`(두 지역이 짝이라는 뜻 — 캡션이나 `legend`로 밝힌다). 시나리오에만 보이는 경로 `failover`(`region-a` → `region-b`, 화살표).
  `pair`와 `failover`가 같은 자리를 지나 겹쳐 보이지 않게 떼어 그린다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `disaster` | 지역 A 전체 중단 | `region-b` | `pair`, `failover` | `region-a` 옆 「지역 전체 중단」, `region-b` 옆 「일을 이어받음」 | 지역 A 전체가 멈추면 지역 B가 일을 이어받는다 — 저절로 넘어가는 서비스도 있고, 고객이 미리 구성해 둬야 하는 서비스도 있다 |
  | `update` | 계획된 업데이트 | `region-a`·`region-b` | `pair` | `region-a` 옆 「업데이트 중」, `region-b` 옆 「계속 동작」 | 계획된 업데이트는 짝의 두 지역에 한 번에 하지 않고 한 지역씩 한다 — 한쪽이 업데이트되는 동안 다른 쪽이 동작한다 |

- 요점 테스트:
  - `disaster`에서 `region-a`가 opacity `0.25`이고 `failover` 경로가 보이며, 그 경로가 `region-a`의 변에서 시작해 `region-b`의 변에서 끝난다(화살표 쪽이 `region-b`).
  - `update`에서 `failover`가 보이지 않고 두 지역 노드가 모두 선명하다. 두 시나리오의 곁말 집합이 서로 다르다.
  - 두 지역 노드가 모두 `geography` 박스 안에 있고, `pair`는 두 시나리오와 `전체`에서 모두 보인다.
- 캡션·곁말의 사실은 개념 5 본문에 있어야 한다(ADR-036·038). 짝이 없는 지역을 셋째 시나리오로 보이려면 본문에 근거가 있고 다른 둘과 갈릴 때만(더하면 summary에).

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-regions-zones.region-pairs': RegionPairDiagram` 한 줄(`azure-regions-zones.availability-zones` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `RegionPairDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·3·5·6·7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 47개, 마지막 id는 `az047`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `azure-regions-zones`의 개념 1~6을 처음부터 통독한다 — 주제 하나로 읽혀 「무엇이 어떤 장애를 막는가」(영역 하나 / 지역 전체)가 서는가, 같은 낱말을 두 번 풀지 않았는가, 진행 안내 문장이 없는가.
   이 주제의 도식 셋과 문항 9개(`az039`~`az047`)가 같은 것을 두 번 묻거나 그리지 않는가.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 0 summary가 「쓰지 않는다」로 정한 것(Azure Germany 등)을 지켰는가.
4. `phases/102-azure-regions-resource-hierarchy/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」. 위 2의 통독 결과(주제 전체에서 고칠 것을 찾았으면 고치지 말고 적는다)도.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **step 1·2가 쓴 개념 1~4와 도식 둘을 고치지 마라.** 고칠 것을 찾으면 summary에 적는다.
- **지원이 끝난 소버린 클라우드(Azure Germany)와 옛 이름(「Azure China」를 현행 이름처럼)을 쓰지 마라.** 이유: 지원이 끝난 서비스·옛 이름은 현행으로 고친다(사용자 결정, step 0의 D 항목).
- **실제 지역 이름을 도식에 쓰지 마라.** 이유: 이름표 「지역 A」·「지역 B」로 쓴다(guide.md 「예시 값」). 본문의 실제 지역 쌍 예는 step 0이 현행 문서로 확인한 것만.
