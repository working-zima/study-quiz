# Step 2: azure-policy

## 배경

phase 107의 전체 계획·결정·공통 규칙은 `phases/107-azure-governance-tools/guide.md`에 있다. **이 step은 주제 `azure-governance`에 개념 3(Azure Policy)·4(규정 준수 평가)·5(이니셔티브)의 글·문항과 도식 `PolicyCheckDiagram`·`PolicyComplianceDiagram`·`PolicyInitiativeDiagram`을 더한다.**

중심 문제는 둘이다. (1) **정책은 「누가」가 아니라 「무엇이 어떤 모양인가」를 본다** — 역할이 있는 사람도 규칙에 어긋난 리소스는 만들 수 없다. Azure RBAC와의 차이를 첫 개념에서 세운다. (2) **새 리소스와 이미 있던 리소스는 다르게 다뤄진다** — 새 요청은 막고, 이미 있던 리소스는 지우지 않고 비준수로 표시한다. 덤프가 가장 많이 묻는 오해다(NO.53·215·239·500).
상속은 `azure-resource-hierarchy.hierarchy`(phase 102)가 그림까지 가르쳤다 — 이 step은 한 줄로만 다시 푼다(guide 「앞 주제가 이미 쓴 것」).

## 읽어야 할 파일

- **`phases/107-azure-governance-tools/guide.md` 전체**
- `phases/107-azure-governance-tools/index.json`의 앞 step `summary` — 특히 출처 step이 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/BudgetAlertDiagram.tsx`와 `.test.tsx`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/106-azure-cost/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/data/azure/visuals/azure-governance.json`과 앞 step의 도식, `src/data/azure/topics.json`의 `azure-governance.purview`·`sensitivity-labels` — 앞 개념이 이미 푼 낱말
- 겹치지 않게: `azure-resource-hierarchy.hierarchy`·`management-group`과 `HierarchyInheritanceDiagram`, `azure-security-model.rbac`, `azure-cost-management.tag-inheritance`와 `az054`·`az149`

## 작업

### 1. 개념 — `topics.json`의 `azure-governance` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 3 | `azure-governance.azure-policy` | — | 첫 문장은 회사가 리소스에 정해 둔 기준(어느 지역에만 둔다, 어떤 크기만 쓴다)이 사람 손으로는 지켜지지 않는다는 문제부터. **리소스**·**리소스 그룹**·**구독**·**관리 그룹**을 이 개념에서 짧게 푼다. 정책 정의와 할당을 두 단계로, 할당 범위와 상속은 한 줄. 어긋난 요청을 막는 장면을 **도식의 예와 같게 본문에 쓴다**(회사 A, 지역 A·B, 허용 위치 정책, VM 1·VM 2). **Azure RBAC와의 차이**를 4절대로 한 문단 — 역할은 「누가 무엇을 할 수 있는가」, 정책은 「리소스가 어떤 모양이어야 하는가」, 역할이 있어도 정책을 어기면 막힌다. **Azure RBAC**를 그 자리에서 한 줄로 푼다 |
| 4 | `azure-governance.policy-compliance` | `azure-policy` | 정책을 나중에 할당한 장면부터 — 이미 있던 리소스는 지우지·옮기지·멈추지 않고 비준수로 표시된다(step 0 결과의 말 그대로). 언제 평가하는가. 수정 작업과 예외를 같은 꼴(무엇을 하는가, 언제 쓰는가)로. 새 리소스(막는다)와 이미 있던 리소스(표시한다)를 4절대로 가른다. **도식의 예를 본문에 쓴다**(가상 네트워크 1, VM 1, VM 2) |
| 5 | `azure-governance.policy-initiatives` | `azure-policy` | 정책 정의가 늘어나면 하나씩 할당하고 하나씩 상태를 보는 일이 많아진다는 문제부터. 묶어서 한 번에 할당하고, 큰 목표(예: 보안 권장 사항 살피기)의 규정 준수를 함께 본다. 이니셔티브에 정의를 더할 때(step 0 결과대로). **관리 그룹과의 차이** 한 줄(구독을 묶는다 / 정책 정의를 묶는다). 정의 수·옛 이니셔티브 이름은 쓰지 않는다 |

### 2. 문항 — `az155`~`az159`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az155` | `azure-policy` | 4지선다, 정답 위치 2 「상황 적용」 — 회사가 정해 둔 크기의 VM만 만들게 하고, 다른 크기를 고르면 만들어지지 않게 하려 한다. 정답 Azure Policy. 오답은 리소스 잠금·역할 할당·태그처럼 「리소스를 다스린다」로 헷갈리는 것 — 「모양(크기)의 규칙」이라는 조건으로 갈린다. 덤프의 「VM 만들기 금지」(NO.357)·「지역 제한」(NO.123·450) 상황을 그대로 쓰지 않는다 |
| `az156` | `azure-policy` | 예/아니요, 정답 **아니요** 「흔한 오해」 — 구독에 소유자 역할을 받은 담당자는 정책이 허용하지 않는 지역에도 VM을 만들 수 있는가. 해설은 역할과 정책이 각각 무엇을 보는지 가르친다 |
| `az157` | `policy-compliance` | 예/아니요, 정답 **아니요** 「원인과 결과」 — 정책을 할당하기 전부터 있던, 규칙에 어긋난 리소스가 할당하면 저절로 지워지는가. 덤프의 가상 네트워크 상황(NO.215·500)과 다른 리소스·규칙으로. 해설은 무엇이 되는지(비준수 표시, 그대로 동작)와 고치는 길(수정 작업)을 가르친다 |
| `az158` | `policy-compliance` | 4지선다, 정답 위치 0 「개념 비교」 — 정책이 요구하는 태그가 빠진 기존 리소스들에 그 태그를 붙이려 할 때 쓰는 것(정답 수정 작업 — step 0 결과의 이름), 오답은 예외·정책을 다시 할당하기·이니셔티브처럼 실제로 헷갈리는 것. `az149`(태그 상속)와 다른 것을 묻는다 |
| `az159` | `policy-initiatives` | 4지선다, 정답 위치 3 「개념 비교」 — 한 구독에 걸 보안 관련 정책 정의 여럿을 하나의 단위로 할당하고 그 규정 준수를 함께 보려 한다. 정답 이니셔티브. 오답 관리 그룹·리소스 그룹·예외 — 「구독을 묶는가, 정의를 묶는가」가 문제문에서 갈리게 조건을 준다(guide 「문항」 4항) |

### 3. 도식

#### `azure-governance.azure-policy` — `PolicyCheckDiagram`, JSON 키 `policy-check`

- 물음형 제목 예: `규칙에 어긋난 리소스를 만들려 하면 어떻게 될까?`
- 그릴 것: 요청 `request-a`(「지역 A에 VM 1 만들기」)·`request-b`(「지역 B에 VM 2 만들기」), `rbac`(「Azure RBAC」), `policy`(「Azure Policy」), 결과 `vm-1`(「VM 1」). 정책은 「허용 위치: 지역 A」처럼 곁말이나 그룹 라벨로(step 0이 확정한 이름). 경로 `a-to-policy`(`request-a`→`policy`), `b-to-rbac`(`request-b`→`rbac`), `b-to-policy`(`request-b`→`policy`), `create`(`policy`→`vm-1`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `allowed` | 규칙에 맞을 때 | `request-a`·`policy`·`vm-1` | `a-to-policy`·`create` | 「만들어진다」 | 허용한 지역의 요청은 그대로 만들어진다 |
  | `denied` | 규칙에 어긋날 때 | `request-b`·`policy` | `b-to-policy` | 「거부된다」 | 허용하지 않은 지역의 요청은 만들어지지 않는다 |
  | `owner` | 권한이 있어도 | `request-b`·`rbac`·`policy` | `b-to-rbac`·`b-to-policy` | 「역할은 허락한다」, 「정책이 거부한다」 | 소유자 역할이 있어도 규칙에 어긋나면 거부된다 — 둘은 서로 다른 것을 본다 |

- 요점 테스트: `denied`·`owner`에서 `vm-1`이 opacity `0.25`이고 `create`가 보이지 않는다. `owner`에서만 `rbac`이 선명하다. `allowed`에서 `request-b`가 opacity `0.25`다.

#### `azure-governance.policy-compliance` — `PolicyComplianceDiagram`, JSON 키 `policy-compliance`

- 물음형 제목 예: `정책을 나중에 걸면, 이미 있던 리소스는 어떻게 될까?`
- 그릴 것: `assignment`(「정책 할당」), 그룹 `rg-1`(「리소스 그룹 1」) 안에 `vnet-1`(「가상 네트워크 1」)·`vm-1`(「VM 1」)·`vm-2`(「VM 2」). 경로 `check-vnet`(`assignment`→`vnet-1`), `fix-vm`(`assignment`→`vm-1`). `vm-2`로 가는 경로는 없다(평가에서 빠진다).
- 시나리오(곁말의 말은 step 0이 정한 범위로 고친다):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `existing` | 이미 있던 리소스 | `assignment`·`vnet-1` | `check-vnet` | 「비준수로 표시 — 그대로 동작」 | 규칙에 어긋나도 지워지거나 옮겨지지 않고 비준수로 표시된다 |
  | `remediate` | 수정 작업 | `assignment`·`vm-1` | `fix-vm` | 「빠진 태그를 붙인다」 | 일부 정책은 수정 작업으로 어긋난 리소스를 고친다 |
  | `exemption` | 예외 | `assignment`·`vm-2` | 없음 | 「평가에서 뺀다」 | 예외로 둔 리소스는 이 정책으로 평가하지 않는다 |

- 요점 테스트: `existing`에서 `vnet-1`이 선명하고 `vm-1`·`vm-2`는 opacity `0.25`다. `exemption`에서 보이는 경로가 없다. 세 리소스가 모두 `rg-1` 안이다(두 배치). 「삭제」·「지워진다」가 곁말에 없다.

#### `azure-governance.policy-initiatives` — `PolicyInitiativeDiagram`, JSON 키 `policy-initiative`

- 물음형 제목 예: `정책 여럿을 어떻게 한 번에 걸까?`
- 그릴 것: `def-1`·`def-2`·`def-3`(「정책 정의 1」~「정책 정의 3」), `def-4`(「정책 정의 4」), `initiative`(「이니셔티브」 — step 0이 확정한 이름), `scope`(「구독 1」). 경로 `join-1`·`join-2`·`join-3`(`def-n`→`initiative`), `join-4`(`def-4`→`initiative`), `assign`(`initiative`→`scope`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `group` | 묶기 | `def-1`·`def-2`·`def-3`·`initiative` | `join-1`·`join-2`·`join-3` | 「관련 정의를 묶는다」 | 같은 목표의 정책 정의를 하나로 묶는다 |
  | `assign` | 한 번에 할당 | `initiative`·`scope` | `assign` | 「할당 하나로」 | 묶음을 한 번 할당하면 든 정의가 모두 걸리고 상태도 함께 본다 |
  | `add` | 정의를 더하면 | `def-4`·`initiative`·`scope` | `join-4`·`assign` | step 0 결과 | 이미 한 할당에도 새 정의가 들어간다 — step 0 결과대로 |

- 요점 테스트: `assign` 경로의 시작이 `initiative`이고 끝이 `scope`다 — 정의에서 구독으로 바로 가는 경로가 없다. `group`에서 `def-4`·`scope`가 opacity `0.25`다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 세 줄(개념 순서대로).

### 4. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~7·9·10)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 159개, 마지막 id는 `az159`, 예 39·아니요 40, 정답 위치 20/20/20/20이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념 4·5의 `parentId`가 `azure-governance.azure-policy`인지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/107-azure-governance-tools/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **관리 그룹·구독·리소스 그룹의 상속 그림을 다시 그리지 마라.** 이유: `HierarchyInheritanceDiagram`(phase 102)이 이미 그린다. 이 step의 그림은 정책이 무엇을 보고 무엇을 하는가다.
- **정책 효과의 영문 이름(Deny·Audit·Modify·DeployIfNotExists 등)을 목록으로 늘어놓지 마라.** 이유: guide 「배경」 — 하는 일(거부·표시·수정)로 쓴다. 한국어 표기가 따로 필요하면 step 0 결과대로 한 번만.
- **개념 6·7(리소스 잠금)을 만들지 마라.** 이유: step 3의 범위다.
