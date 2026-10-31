# Step 7: management-group-hierarchy

## 배경

phase 102는 Azure AZ-900 과목에 주제 둘을 더한다. 전체 계획·결정·공통 규칙은 `phases/102-azure-regions-resource-hierarchy/guide.md`에 있다.
**이 step은 주제 `azure-resource-hierarchy`에 마지막 개념 둘(11 관리 그룹, 12 관리 그룹·구독·리소스 그룹 계층)의 글·문항과 도식 `HierarchyInheritanceDiagram`을 더해 이 주제와 phase의 개념을 끝낸다.**

이 주제의 마지막 개념은 앞의 네 층을 하나로 잇는다 — **어느 층에 건 것이 어디까지 내려가는가.** 관리 그룹에 건 정책은 그 아래 모든 구독·리소스 그룹·리소스에 미치고 아래에서 바꿀 수 없다.
리소스 그룹에 준 권한은 그 그룹 안의 리소스에만 미친다. 도식과 문항이 이 방향(위 → 아래)과 범위를 분명히 보인다.

## 읽어야 할 파일

- **`phases/102-azure-regions-resource-hierarchy/guide.md` 전체**
- `phases/102-azure-regions-resource-hierarchy/index.json`의 step 4 `summary`(개념 11·12의 확정 `name`, 관리 그룹 중첩 단계·최대 수, 테넌트 루트 그룹 표기, 상속 방향, 정책·역할 할당을 한 줄로 풀 말)와 step 5·6 `summary`(앞 개념이 푼 낱말, 도식 설계, 균형 줄, 교차 검사 수)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`(`azure-resource-hierarchy`의 개념 7~10 — **먼저 통독한다**), `questions.json`, `visuals/azure-resource-hierarchy.json`, `data.test.ts`·`visuals.test.ts`
- 도식 선례 — step 5·6의 `ResourceGroupScopeDiagram`·`SubscriptionBoundaryDiagram`과 `.test.tsx`(같은 주제), phase 100의 `src/components/diagrams/HybridCloudDiagram.tsx`(늘 보이는 연결선),
  `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-resource-hierarchy` 끝에

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `azure-resource-hierarchy.management-group` | 관리 그룹 | — | 구독(개념 9)을 되짚어 세운다 — 구독이 많아지면 구독마다 같은 규칙을 거는 일이 번거롭다는 데서 시작한다. 관리 그룹에 거버넌스 조건을 걸면 안의 구독이 저절로 물려받는다(**거버넌스**를 이 주제에서 한 줄로 푼다). 중첩 단계, 테넌트 루트 그룹, 최대 수, 부모는 하나 — 모두 step 4 결과대로(**테넌트**를 개념 9가 이미 풀었으면 다시 풀지 않는다). 관리 그룹과 구독이 무엇을 묶는지(구독은 리소스 그룹을, 관리 그룹은 구독과 다른 관리 그룹을) 4절대로 |
| 12 | `azure-resource-hierarchy.hierarchy` | 관리 그룹·구독·리소스 그룹 계층 | — | 이름은 step 4의 결정대로. 네 층과 순서, **위에서 건 것이 아래로 상속된다**, Learn 단원의 쓰임 둘(정책·역할 할당) — step 4 결과대로. **정책**과 **역할 할당**을 이 주제에서 한 줄씩 푼다. 아래층에 준 권한이 위로 올라가지 않는다는 것은 step 4가 확인했을 때만. **도식의 예를 본문에 쓴다** — 회사 A의 테넌트 루트 그룹 아래 관리 그룹 「운영」·「개발」, 「운영」 아래 구독 A·구독 B, 「개발」 아래 구독 C, 구독 A 안에 리소스 그룹 「웹」과 그 안의 VM 1. 「운영」에 VM을 둘 지역을 한 곳으로 제한하는 정책을 걸면 구독 A·B와 그 안의 리소스 그룹·VM 모두에 적용되고 구독 C에는 미치지 않으며, 구독 A의 소유자가 그 정책을 풀 수 없다. 리소스 그룹 「웹」에 준 역할 할당은 VM 1에만 미친다(이름은 이름표) |

### 2. 문항 — `src/data/azure/questions.json`에 `az053`~`az055`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az053` | `management-group` | 4지선다 「상황 적용」 — 회사 B가 구독 여럿에 같은 규칙을 **한 번에** 걸려 한다, 무엇에 거나. 정답: 그 구독들을 묶은 관리 그룹. 오답은 같은 범주(규칙을 거는 곳) 안에서 — 리소스 그룹, 구독 하나하나(한 번에가 아니다), 가용성 영역. 또는 예/아니요로 「관리 그룹·구독의 부모는 하나」(step 4 결과대로) — 균형을 보고 고른다 |
| `az054` | `hierarchy` | 4지선다 「원리 이해」 — 리소스 그룹 하나에 역할 할당을 했을 때 권한이 미치는 범위를 고른다. 정답: 그 리소스 그룹 안의 리소스들. 오답은 실제로 헷갈리는 범위 — 그 구독의 모든 리소스 그룹, 위의 관리 그룹 아래 모든 구독, 그 리소스 그룹 자체만(안의 리소스에는 미치지 않음). 본문의 예(리소스 그룹 「웹」)와 이름·상황을 다르게 |
| `az055` | `hierarchy` | 예/아니요 「흔한 오해」 — 관리 그룹에 건 정책을 그 아래 구독의 소유자가 자기 구독에서 풀 수 있는가(아니요 — 아래에서 바꿀 수 없다). 해설은 상속의 방향과, 바꾸려면 어디서 해야 하는지(step 4가 확인한 만큼)까지 가르친다. `az053`·`az054`와 같은 것을 묻지 않게 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 6 summary의 균형 줄이다. **이 step이 phase의 마지막 문항 step이다** — 끝났을 때의 균형이 phase의 결과다.

### 3. 도식

#### `azure-resource-hierarchy.hierarchy` — `HierarchyInheritanceDiagram`, JSON 키 `hierarchy`

- 물음형 제목 예: `한 층에 건 규칙은, 아래 어디까지 내려갈까?`
- 그릴 것: 나무 꼴 노드 — `root`(「테넌트 루트 그룹」 — step 4의 표기), `mg-prod`(「관리 그룹: 운영」), `mg-dev`(「관리 그룹: 개발」), `sub-a`(「구독 A」), `sub-b`(「구독 B」), `sub-c`(「구독 C」), `rg-web`(「리소스 그룹: 웹」), `vm-1`(「VM 1」).
  늘 보이는 연결선 — 부모에서 자식으로(`root-mg-prod`·`root-mg-dev`·`mg-prod-sub-a`·`mg-prod-sub-b`·`mg-dev-sub-c`·`sub-a-rg-web`·`rg-web-vm-1`). 층(관리 그룹·구독·리소스 그룹·리소스)을 가르는 줄 라벨이나 그룹 박스는 280 폭에 들 때만.
  세로형은 위에서 아래로 다섯 줄, 가로형은 같은 나무를 넓게(또는 왼쪽에서 오른쪽으로). 라벨이 길면 노드를 넓히거나 두 층을 엇갈려 놓는다 — 라벨을 줄이지 않는다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `at-mg` | 관리 그룹에 정책 | `mg-prod`·`sub-a`·`sub-b`·`rg-web`·`vm-1` | `mg-prod` 옆 「정책을 건 곳」, `vm-1` 옆 「물려받음」 | 관리 그룹 「운영」에 건 정책은 그 아래 구독 A·B와 그 안의 리소스 그룹·VM 모두에 적용되고, 아래에서 풀 수 없다. 「개발」 아래 구독 C에는 미치지 않는다 |
  | `at-sub` | 구독에 역할 할당 | `sub-a`·`rg-web`·`vm-1` | `sub-a` 옆 「역할 할당」 | 구독 A에 준 역할 할당은 구독 A 안의 리소스 그룹과 리소스에 미치고, 같은 관리 그룹의 구독 B에는 미치지 않는다 |
  | `at-rg` | 리소스 그룹에 역할 할당 | `rg-web`·`vm-1` | `rg-web` 옆 「역할 할당」 | 리소스 그룹 「웹」에 준 역할 할당은 그 안의 VM 1에만 미친다 |

  `at-sub`의 사실(구독에 준 역할 할당이 그 아래로 상속된다)은 개념 12 본문에 있어야 한다 — 본문에 쓰지 않았으면 이 시나리오를 빼거나 본문에 한 줄 더한다(summary에).
- 요점 테스트:
  - 시나리오마다 선명한 노드 집합이 「고른 노드와 그 자손 전부」와 같다 — 자손은 늘 보이는 연결선의 끝점(부모 → 자식)을 따라 셈한다(테스트가 경로 id나 끝점 좌표에서 나무를 읽어 계산한다).
  - 시나리오마다 고른 노드의 조상과 형제(예: `at-mg`의 `root`·`mg-dev`·`sub-c`)는 opacity `0.25`다.
  - 늘 보이는 연결선은 세 시나리오와 `전체`에서 모두 보이고, 각 선은 위 노드의 아랫변에서 아래 노드의 윗변으로 간다(가로형이면 그 방향에 맞는 변).
- 캡션·곁말의 사실은 개념 11·12 본문에 있어야 한다(ADR-036·038).

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-resource-hierarchy.hierarchy': HierarchyInheritanceDiagram` 한 줄(`azure-resource-hierarchy.subscription-boundaries` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `HierarchyInheritanceDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」). 이 phase의 개념이 모두 생겼으므로, `official.md`·`corrections.md`에서 이 phase가 단 「쓰일 곳」 가운데 개념 id를 가리키는데 아직 「쓰일 곳」으로 남은 줄이 있는지 찾아 summary에 적는다(앞 step의 줄은 고치지 않는다 — 메인 세션이 마무리 때 본다).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·3·5·6·7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 55개, 마지막 id는 `az055`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `azure-resource-hierarchy`의 개념 7~12를 처음부터 통독한다 — 주제 하나로 읽혀 「무엇을 어느 층에서 나누는가」·「어느 층에 건 것이 어디까지 내려가는가」가 서는가, 같은 낱말을 두 번 풀지 않았는가, 진행 안내 문장이 없는가.
   이 주제의 도식 셋과 문항 8개(`az048`~`az055`)가 같은 것을 두 번 묻거나 그리지 않는가.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 4 summary가 「쓰지 않는다」로 정한 것을 지켰는가.
4. `phases/102-azure-regions-resource-hierarchy/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」. 위 2의 통독 결과와 4절의 「쓰일 곳」 확인 결과도.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **step 5·6이 쓴 개념 7~10과 도식 둘을 고치지 마라.** 고칠 것을 찾으면 summary에 적는다.
- **Azure Policy·Azure RBAC를 개념으로 세우거나 자세히 쓰지 마라**(정책 효과·이니셔티브, 기본 제공 역할·역할 정의). 이유: 주제 `azure-governance`·`azure-security-model`의 몫이다. 한 줄 풀이와 상속까지만 쓴다.
- **관리 그룹의 수치(중첩 단계·최대 수)를 step 4가 확인한 값과 다르게 쓰지 마라.** 이유: Learn 단원과 현행 문서가 다를 수 있다 — step 4가 정한 쪽을 따른다.
