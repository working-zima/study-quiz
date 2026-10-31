# Step 5: resource-group

## 배경

phase 102는 Azure AZ-900 과목에 주제 둘을 더한다. 전체 계획·결정·공통 규칙은 `phases/102-azure-regions-resource-hierarchy/guide.md`에 있다.
**이 step은 주제 `azure-resource-hierarchy`(리소스 계층)를 만들고 그 첫 개념 둘(7 리소스, 8 리소스 그룹)의 글·문항과, 이 주제의 첫 도식 `ResourceGroupScopeDiagram`을 함께 만든다.**

리소스 그룹에서 학습자가 붙잡아야 할 것은 둘이다 — **그룹에 한 일이 안의 리소스 모두에 미친다**는 것(함께 지우고, 함께 권한을 준다)과, **리소스 그룹은 관리를 위한 묶음일 뿐 물리적 배치가 아니다**는 것
(그래서 그룹을 나눠도 데이터 센터 장애에 대비되지 않고, 그룹과 리소스의 지역이 달라도 된다 — step 4 결과대로).

## 읽어야 할 파일

- **`phases/102-azure-regions-resource-hierarchy/guide.md` 전체**
- `phases/102-azure-regions-resource-hierarchy/index.json`의 step 4 `summary` — 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지(리소스 그룹의 지역·다른 그룹 리소스끼리의 통신·태그), step 1~3 `summary`의 균형 줄·교차 검사 수
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」)
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`(주제 6 — 리소스·VM·지역을 어떻게 풀었는지 본다. 이 주제에서는 다시 푼다)·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — step 1~3의 `AzureRegionDiagram`·`ZoneIsolationDiagram`·`RegionPairDiagram`과 `.test.tsx`(이 phase의 짜임), `src/components/diagrams/HybridCloudDiagram.tsx`,
  `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-regions-zones` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-resource-hierarchy", "title": "리소스 계층", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 7·8이다. `name`은 step 4 summary가 확정한 표기를 쓴다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `azure-resource-hierarchy.resource` | 리소스 | — | 이 주제의 첫 개념이라 **VM**·**가상 네트워크**·**데이터베이스**·**지역**을 짧게 푼다(주제 6이 푼 것도 다시 — guide.md 「글」). 「만들거나 갖추거나 배포하는 것은 무엇이든」이 요점이다 — 예를 들어 VM 한 대를 만들 때 함께 생기는 것(가상 네트워크 등)도 각각 리소스라는 것은 step 4가 확인했을 때만. 리소스가 리소스 그룹 하나에 속한다는 것은 한 줄로만(규칙은 개념 8의 몫 — 그 말을 쓰지 않는다) |
| 8 | `azure-resource-hierarchy.resource-group` | 리소스 그룹 | — | guide.md 표의 「다룰 것」 전부를 step 4 결과대로. 「한 그룹에만 속한다」, 「중첩·이름 바꾸기 불가」, 「그룹에 한 일이 안의 리소스 모두에」, 쓰는 예 둘, 그룹의 지역(step 4가 쓸 수 있다고 했을 때), **물리적 배치가 아니다**(데이터 센터 장애 대비는 가용성 영역 — 이 주제에서 한 줄로 푼다). **도식의 예를 본문에 쓴다** — 회사 A가 2주짜리 시험용으로 VM 1·가상 네트워크·데이터베이스를 리소스 그룹 「개발 환경」에 두고, 운영 중인 VM 2는 리소스 그룹 「운영」에 둔다. 「개발 환경」을 지우면 안의 셋이 함께 지워지고 VM 2는 남는다. 「개발 환경」에 팀 A의 접근 권한을 주면 안의 셋 모두에 적용된다(기간·대수는 예라고 밝힌다) |

### 2. 문항 — `src/data/azure/questions.json`에 `az048`~`az050`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az048` | `resource` | 예/아니요 「개념 확인」 — VM이 아닌 것(가상 네트워크 등)도 Azure에서 만들면 하나의 리소스인가(예). 「VM만 리소스」라는 오해를 바로잡는 쪽. 해설은 리소스의 범위를 가르친다. 균형을 보고 방향을 뒤집어도 된다 |
| `az049` | `resource-group` | 4지선다 「상황 적용」 — 회사 B가 잠깐 쓸 환경(리소스 여럿)을 만들고 끝나면 한꺼번에 지우려 한다, 처음에 어떻게 두나. 정답: 한 리소스 그룹에 모은다. 오답은 실제로 헷갈리는 것(리소스마다 다른 리소스 그룹, 리소스 그룹 안에 하위 리소스 그룹 — 중첩 불가, 리소스마다 다른 가용성 영역). 본문의 예(2주 시험용, 「개발 환경」)와 상황을 다르게 만든다 |
| `az050` | `resource-group` | 예/아니요 「흔한 오해」 — VM들을 서로 다른 리소스 그룹에 나눠 두면 데이터 센터 하나가 멈춰도 일부 VM이 계속 동작하게 되는가(아니요 — 리소스 그룹은 관리용 묶음, 대비는 가용성 영역). 또는 step 4가 확인한 「그룹과 리소스의 지역이 달라도 된다」(예). `az049`와 다른 것을 묻고, 균형을 보고 고른다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 3 summary의 균형 줄이다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-resource-hierarchy.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-resource-hierarchy': azureResourceHierarchyVisuals`로 넣는다.

#### `azure-resource-hierarchy.resource-group` — `ResourceGroupScopeDiagram`, JSON 키 `resource-group`

- 물음형 제목 예: `리소스 그룹에 한 일은, 그 안의 리소스에 어떻게 미칠까?`
- 그릴 것: 그룹 박스 `rg-dev`(「리소스 그룹: 개발 환경」 — 라벨 꼴은 정한다) 안에 노드 `vm-1`(「VM 1」)·`vnet`(「가상 네트워크」)·`db`(「데이터베이스」), 그룹 박스 `rg-prod`(「리소스 그룹: 운영」) 안에 노드 `vm-2`(「VM 2」).
  경로는 두지 않아도 된다(경로가 없는 도식이면 guide.md 「도식 테스트」의 경로 항목을 「경로가 없다」로 바꿔 건다).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `delete` | 그룹 삭제 | `vm-2` | `rg-dev` 라벨 옆 「그룹과 함께 모두 삭제」 | 리소스 그룹 「개발 환경」을 지우면 안의 VM 1·가상 네트워크·데이터베이스가 함께 지워지고, 다른 그룹의 VM 2는 남는다 |
  | `access` | 권한 부여 | `vm-1`·`vnet`·`db` | `rg-dev` 라벨 옆 「팀 A의 권한이 셋 모두에」 | 리소스 그룹 「개발 환경」에 준 접근 권한은 그 안의 리소스 모두에 적용되고, 다른 그룹에는 미치지 않는다 |

  「한 그룹에만 속한다」를 셋째 시나리오(리소스 옮기기)로 보이려면, 같은 리소스를 두 노드로 그리지 않고 그릴 수 있을 때만(더하면 summary에).
- 요점 테스트:
  - `delete`에서 `rg-dev` 박스 안의 노드가 모두 opacity `0.25`이고 `rg-prod` 박스 안의 노드는 선명하다. `access`에서는 그 반대다.
  - 두 시나리오의 선명한 노드 집합이 겹치지 않는다. 그룹 박스 둘은 어느 시나리오에서도 흐려지지 않는다.
  - 모든 노드가 그룹 박스 꼭 하나에만 든다(세로형·가로형 모두) — 리소스가 한 그룹에만 속한다는 것을 그림이 어기지 않는다.
- 캡션·곁말의 사실은 개념 8 본문에 있어야 한다(ADR-036·038). 「팀 A」는 이름표다.

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-resource-hierarchy.resource-group': ResourceGroupScopeDiagram` 한 줄(`azure-regions-zones.region-pairs` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `ResourceGroupScopeDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·3·5·6·7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 50개, 마지막 id는 `az050`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 일곱째 주제이고 `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 4 summary가 「쓰지 않는다」로 정한 것(태그 상속 등)을 지켰는가.
4. `phases/102-azure-regions-resource-hierarchy/index.json`의 step 5를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 9~12(구독, 구독 경계, 관리 그룹, 계층)를 만들지 마라.** 이유: step 6·7의 범위다. 이 step의 글이 구독을 말할 때는 한 줄 풀이로 그친다.
- **주제 `azure-regions-zones`의 개념·문항·도식을 고치지 마라.** 고칠 것을 찾으면 summary에 적는다.
- **태그를 쓰지 마라.** 이유: 주제 `azure-cost-management`의 몫이다(guide.md 「배경」). 덤프가 리소스 그룹과 함께 태그를 묻더라도 이 phase에서는 다루지 않는다.
- **권한을 「역할」·「RBAC」 같은 낱말로 자세히 풀지 마라.** 이유: 주제 `azure-security-model`의 몫이다. 이 개념에서는 「접근 권한」으로 쓰고, 그룹에 준 것이 안의 리소스에 적용된다는 것까지만 쓴다.
