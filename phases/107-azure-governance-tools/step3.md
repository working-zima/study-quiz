# Step 3: resource-locks

## 배경

phase 107의 전체 계획·결정·공통 규칙은 `phases/107-azure-governance-tools/guide.md`에 있다. **이 step은 주제 `azure-governance`에 개념 6(리소스 잠금)·7(잠금 상속)의 글·문항과 도식 `LockTypesDiagram`·`LockInheritanceDiagram`, 표 `GovernanceToolsTable`을 더해 주제를 마친다.**

중심 문제: **잠금은 권한과 따로 움직인다.** 역할로 지울 권한이 있는 사람도 잠금이 있으면 먼저 풀어야 한다. 그리고 덤프가 가장 많이 되풀이하는 두 가지 — 잠금이 겹칠 때(NO.106·313·415)와 잠긴 리소스가 든 리소스 그룹을 지울 때(NO.33·69·141·258·330) — 를 step 0이 확인한 말로 가르친다.
마지막 개념의 표가 Azure RBAC·Azure Policy·리소스 잠금을 나란히 둔다 — 덤프의 「리소스를 함부로 못 바꾸게」 문항(NO.76·357·388·440)이 이 셋을 섞는다.

## 읽어야 할 파일

- **`phases/107-azure-governance-tools/guide.md` 전체**
- `phases/107-azure-governance-tools/index.json`의 앞 step `summary` — 특히 출처 step이 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/TagInheritanceDiagram.tsx`와 `.test.tsx`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `src/components/diagrams/azureCostManagementTables.tsx`와 `.test.tsx` — 표 선례
- `phases/106-azure-cost/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/data/azure/visuals/azure-governance.json`과 앞 step의 도식, `src/data/azure/topics.json`의 `azure-governance` 개념 1~5 — 표의 칸이 이 본문과 맞아야 한다
- 겹치지 않게: `azure-resource-hierarchy.resource-group`(리소스 그룹을 지우면 안의 리소스가 함께 지워진다)

## 작업

### 1. 개념 — `topics.json`의 `azure-governance` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 6 | `azure-governance.resource-locks` | — | 첫 문장은 접근 권한을 잘 나눠도 권한이 있는 사람이 중요한 리소스를 실수로 지울 수 있다는 문제부터. 두 종류를 같은 꼴(무엇은 되고 무엇은 막히는가)로 — 이름은 step 0이 확정한 표기. 읽기 전용이 예상 밖의 일을 막는 예(step 0 결과대로 한 줄). **역할과 상관없이 적용** — 소유자도 먼저 잠금을 풀고 그다음에 지운다(두 단계). **역할**을 그 자리에서 한 줄로 푼다(앞 step이 Azure RBAC를 풀었으면 되짚기만). Azure Policy와의 차이 한 줄. **도식의 예(VM 1, 읽기·고치기·지우기)를 본문에 쓴다** |
| 7 | `azure-governance.lock-inheritance` | `resource-locks` | 리소스 그룹에 건 잠금이 안의 리소스로 내려가는 장면부터. 잠금이 겹칠 때 무엇이 적용되는가(step 0 결과의 말 그대로). **잠긴 리소스가 든 리소스 그룹을 지우려 할 때** — 리소스 그룹을 지우면 안의 리소스가 함께 지워진다는 것(이 주제 화면에서 한 줄로 푼다)과 이어서, 무엇이 막히고 일부만 지워지는 일이 있는가(step 0 결과대로). 표 `GovernanceToolsTable`의 칸에 쓰는 사실을 본문에 먼저 쓴다(셋을 가르는 문단 하나 — 이 주제 개념 3·6이 쓴 말과 같게). **도식의 예를 본문에 쓴다**(리소스 그룹 1, VM 1, 디스크 1) |

### 2. 문항 — `az160`~`az163`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az160` | `resource-locks` | 예/아니요, 정답 **아니요** 「흔한 오해」 — 소유자 역할이 있는 담당자는 삭제 잠금이 걸린 리소스를 그대로 지울 수 있는가. `az156`(역할과 정책)과 같은 꼴이 되지 않게 상황과 리소스를 바꾼다. 해설은 두 단계(잠금 풀기 → 지우기)를 가르친다 |
| `az161` | `resource-locks` | 4지선다, 정답 위치 1 「개념 비교」 — 담당자들이 리소스를 읽고 설정도 바꿀 수 있어야 하지만 지우지는 못하게 하려 한다. 정답 삭제 잠금(step 0의 이름). 오답은 읽기 전용 잠금, 읽기 권한자 같은 역할, 정책의 거부처럼 실제로 헷갈리는 것 — 「고칠 수 있어야 한다」는 조건이 읽기 전용을 가른다 |
| `az162` | `lock-inheritance` | 예/아니요, 정답 **예** 「원인과 결과」 — 리소스 그룹에만 삭제 잠금을 걸고 안의 리소스에는 따로 잠금을 걸지 않았을 때, 그 리소스를 지우려 하면 막히는가. 「…도」처럼 답을 흘리는 말을 쓰지 않는다 |
| `az163` | `lock-inheritance` | 4지선다, 정답 위치 3 「원인과 결과」 — 리소스 그룹 안의 리소스 하나에만 삭제 잠금이 있는데 그 리소스 그룹을 지우려 하면 어떻게 되는가(step 0 결과대로 — 일부만 지워지는가). 오답은 「잠긴 리소스만 남고 나머지는 지워진다」처럼 실제로 헷갈리는 결과들. 덤프의 「리소스 그룹에 삭제 잠금」 상황(NO.33 등)을 그대로 쓰지 않는다 |

### 3. 도식

#### `azure-governance.resource-locks` — `LockTypesDiagram`, JSON 키 `lock-types`

- 물음형 제목 예: `두 잠금은 각각 무엇을 막을까?`
- 그릴 것: `vm-1`(「VM 1」)과 작업 셋 `read`(「읽기」)·`update`(「고치기」)·`delete`(「지우기」), 그리고 `owner`(「소유자」 — step 0이 확정한 역할 이름). 경로 `do-read`·`do-update`·`do-delete`(`vm-1`→각 작업), `owner-delete`(`owner`→`vm-1`).
- 시나리오(작업의 이름과 막히는 범위는 step 0 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `delete-lock` | 삭제 잠금 | `vm-1`·`read`·`update` | `do-read`·`do-update` | 「지우기는 막힌다」 | 읽고 고칠 수는 있지만 지울 수 없다 |
  | `read-only` | 읽기 전용 잠금 | `vm-1`·`read` | `do-read` | 「고치기·지우기가 막힌다」 | 읽을 수만 있다 |
  | `owner` | 소유자라도 | `owner`·`vm-1` | `owner-delete` | 「먼저 잠금을 푼다」 | 소유자도 잠금을 먼저 풀어야 지울 수 있다 — 잠금은 역할과 상관없이 적용된다 |

- 요점 테스트: `delete-lock`에서 `delete`가, `read-only`에서 `update`·`delete`가 opacity `0.25`다. 두 잠금 시나리오의 선명한 노드 집합이 다르다. `owner`에서만 `owner`가 선명하다.

#### `azure-governance.lock-inheritance` — `LockInheritanceDiagram`, JSON 키 `lock-inheritance`

- 물음형 제목 예: `리소스 그룹에 건 잠금은 안의 리소스에 어떻게 미칠까?`
- 그릴 것: 그룹 `rg-1`(「리소스 그룹 1」) 안에 `rg-lock`(「삭제 잠금」)·`vm-1`(「VM 1」)·`disk-1`(「디스크 1」)·`vm-lock`(「읽기 전용 잠금」). 바깥에 `admin`(「담당자」). 경로 `to-vm`(`rg-lock`→`vm-1`), `to-disk`(`rg-lock`→`disk-1`), `direct`(`vm-lock`→`vm-1`), `delete-rg`(`admin`→`rg-lock` — 리소스 그룹을 지우는 요청이 잠금에 막히는 길).
- 시나리오(말은 step 0 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `inherit` | 물려받을 때 | `rg-lock`·`vm-1`·`disk-1` | `to-vm`·`to-disk` | 「안의 리소스도 지울 수 없다」 | 리소스 그룹에 건 잠금을 안의 리소스가 물려받는다 |
  | `stack` | 잠금이 겹칠 때 | `rg-lock`·`vm-lock`·`vm-1` | `to-vm`·`direct` | 「더 제한적인 쪽 — 읽기만 된다」 | 한 리소스에 잠금이 여럿이면 가장 제한적인 것이 적용된다 |
  | `delete-group` | 리소스 그룹을 지울 때 | `admin`·`rg-lock` | `delete-rg` | step 0 결과 | 잠긴 리소스가 들어 있으면 리소스 그룹을 지울 수 없다 — 일부만 지워지는가는 step 0 결과대로 |

- 요점 테스트: 잠금 노드 둘과 리소스 노드 둘이 모두 `rg-1` 안이고 `admin`은 밖이다(두 배치). `inherit`에서 `vm-lock`이 opacity `0.25`다. `stack`에서만 `direct`가 보인다. `delete-group`에서 `vm-1`·`disk-1`이 흐려 「지워졌다」로 읽히지 않게 캡션이 그 장면이 요청만 그린다는 것을 밝힌다(guide 「도식」 시나리오 끝 줄).

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다. 자물쇠 그림·아이콘을 그리지 않는다(guide 「도식」 색).

registry에 두 줄(개념 순서대로). `lock-inheritance`는 도식과 표를 배열로.

### 4. 표 — `GovernanceToolsTable`

`src/components/diagrams/azureGovernanceTables.tsx`와 `.test.tsx`를 새로 만든다. `visuals/azure-governance.json`의 `tables["governance-tools"]`, 개념 `azure-governance.lock-inheritance`. 열은 **도구 · 정하는 것 · 막는 일**. 행은 Azure RBAC / Azure Policy / 리소스 잠금 — 칸은 이 주제 본문과 같게 쓴다. Azure RBAC는 「누가 무엇을 할 수 있는가」, Azure Policy는 「리소스가 어떤 모양이어야 하는가」, 리소스 잠금은 「실수로 지우거나 바꾸지 않게」 쪽으로 — 말은 본문을 따른다. `columnWidths`와 계산은 guide.md 「도식」대로 summary에 적는다. registry의 표 등록은 선례를 따른다.

### 5. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~7·9·10)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 163개, 마지막 id는 `az163`, 예 40·아니요 41, 정답 위치 20/21/20/21이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `azure-governance`의 개념이 7개이고 순서가 guide.md 표와 같은지, 개념 2·4·5·7의 `parentId`가 표대로인지 본다. 「Blueprints」·「Information Protection」(예전 이름 한 번 말고)·「신뢰 포털」이 이 주제의 개념·문항·도식에 없는지 `grep`으로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/107-azure-governance-tools/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **잠금을 거는 명령·템플릿 문법을 쓰지 마라.** 이유: 도구는 주제 18·19의 몫이다. 「포털·PowerShell·CLI·템플릿으로 건다」 한 줄까지.
- **「잠금은 데이터도 막는다」처럼 범위를 넓히지 마라.** 이유: 잠금은 관리 작업에 걸린다 — step 0이 확인한 범위로만 쓴다.
