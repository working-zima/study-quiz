# Step 7: tags

## 배경

phase 106의 전체 계획·결정·공통 규칙은 `phases/106-azure-cost/guide.md`에 있다. **이 step은 주제 `azure-cost-management`에 개념 12(태그)·13(태그 상속)의 글·문항과 도식 `TagCostReportDiagram`·`TagInheritanceDiagram`을 더한다.**

중심 문제: 앞 주제(`rbac-scope`·`hierarchy`)는 **역할이 아래로 상속된다**고 가르쳤다. 같은 층 그림을 보고 태그도 내려온다고 읽기 쉽다. 이 대비를 분명히 세운다.

## 읽어야 할 파일

- **`phases/106-azure-cost/guide.md` 전체**
- `phases/106-azure-cost/index.json`의 앞 step `summary` — 특히 출처 step이 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/RbacScopeDiagram.tsx`와 `.test.tsx`, `src/data/azure/visuals/azure-security-model.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/105-azure-identity-security/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/data/azure/visuals/azure-cost-management.json`, 앞 step의 도식
- `src/data/azure/topics.json`의 `azure-resource-hierarchy.subscription-boundaries`와 `az052`, `azure-security-model.rbac-scope` — 겹치지 않게, 대비는 이 주제 안에서 서게

## 작업

### 1. 개념 — `topics.json`의 `azure-cost-management` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 12 | `azure-cost-management.tags` | — | **목록 개념**. 소개 문단에서 이름과 값을 예로 세우고(코드 표기 — 태그 이름은 `CostCenter`처럼 백틱, 굵은 이름 안에는 넣지 않는다) 구독·리소스 그룹으로 나누는 것과 무엇이 다른지(4절) 쓴다. 항목 여섯은 같은 꼴. 항목 뒤에 회사 C가 한 구독의 리소스를 부서 태그로 나눠 비용을 보는 예 — **도식의 예를 본문에 쓴다** |
| 13 | `azure-cost-management.tag-inheritance` | `tags` | 역할의 상속을 한 줄로 풀고 대비한다. 까닭은 step 4가 확인한 범위로만. 층마다 다른 태그를 둘 수 있다는 것. Azure Policy를 한 줄로 풀고 요구·다시 붙이기. 모든 리소스에 같은 태그가 필요하지는 않다. step 4가 정한 한정을 지킨다 |

### 2. 문항 — `az148`~`az149`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az148` | `tags` | 4지선다, 정답 위치 2 「상황 적용」 — 회사 D는 구독 하나에 여러 지점의 리소스를 섞어 두고, **구독과 리소스 그룹을 그대로 둔 채** 지점별 비용을 보고 싶다. 정답 태그. 오답 예산, 리소스 잠금, 구독을 나누기 등 — 조건 때문에 구독 분리는 답이 아니다. `az052`와 겹치지 않는다 |
| `az149` | `tag-inheritance` | 예/아니요, 정답 **아니요** 「흔한 오해」 — 리소스 그룹에 태그를 붙이면 그 안의 VM에도 같은 태그가 저절로 붙는가. 「역할과 달리」처럼 답을 흘리지 않는다. 해설은 정책으로 붙이는 길과 역할 상속과의 차이를 가르친다 |

### 3. 도식

#### `azure-cost-management.tags` — `TagCostReportDiagram`, JSON 키 `tag-cost-report`

- 물음형 제목 예: `한 구독의 비용을 부서별로 어떻게 나눠 볼까?`
- 그릴 것: 그룹 `subscription`(「구독 1」) 안에 `vm-sales`(「VM 1」)·`disk-sales`(「디스크 1」)·`vm-research`(「VM 2」). 밖에 `report-sales`(「영업부 비용」)·`report-research`(「연구부 비용」). 경로 `sales-vm`·`sales-disk`(→`report-sales`), `research-vm`(→`report-research`). 태그 값은 곁말로(「부서=영업」·「부서=연구」 — 본문과 같게).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `sales` | 영업부 | `vm-sales`·`disk-sales`·`report-sales` | 앞 둘 | 「부서=영업」 | 같은 태그의 리소스를 묶어 비용을 본다 |
  | `research` | 연구부 | `vm-research`·`report-research` | `research-vm` | 「부서=연구」 | 리소스의 자리는 그대로이고 태그 값으로 나눈다 |

- 요점 테스트: VM·디스크 셋이 모두 `subscription` 안(두 배치) — 자리가 바뀌지 않는다. `report-*`는 그룹 밖. `sales`에서 `vm-research`·`report-research`가 opacity `0.25`.

#### `azure-cost-management.tag-inheritance` — `TagInheritanceDiagram`, JSON 키 `tag-inheritance`

- 물음형 제목 예: `리소스 그룹의 태그가 안의 리소스로 내려올까?`
- 그릴 것: 그룹 `resource-group`(「리소스 그룹 1」) 안에 `group-tag`(「그룹의 태그」)·`vm`(「VM 1」), 밖에 `policy`(「Azure Policy」). 경로 `policy-to-vm`(`policy`→`vm`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `default` | 그대로 두면 | `group-tag`·`vm` | 없음 | 「VM에 내려오지 않는다」 | 리소스 그룹에 붙인 태그를 VM이 물려받지 않는다 |
  | `policy` | 정책을 걸면 | `policy`·`vm` | `policy-to-vm` | 「정책이 VM에 태그를 붙인다」 | 물려받게 하려면 Azure Policy로 규칙을 건다 |

- 요점 테스트: `group-tag`에서 `vm`으로 가는 경로가 없다(두 배치). `default`에서 `policy`가 opacity `0.25`, `policy`에서 `group-tag`가 opacity `0.25`. `group-tag`·`vm`은 `resource-group` 안, `policy`는 밖.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로).

### 4. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 149개, 마지막 id는 `az149`, 예 37·아니요 38이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
3. `phases/106-azure-cost/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **Azure Policy의 동작(효과의 종류·정의 JSON)을 자세히 쓰지 마라.** 이유: `azure-governance`의 몫이다.
- **상속되지 않는 까닭을 지어내지 마라.** 이유: 문서가 말하는 범위만 쓴다(step 4 결과).
