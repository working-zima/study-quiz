# Step 6: rbac

## 배경

phase 105의 전체 계획·결정·공통 규칙은 `phases/105-azure-identity-security/guide.md`에 있다.
**이 step은 주제 `azure-security-model`(접근 제어와 보안 도구)을 만들고 개념 10(Azure RBAC)·11(역할을 적용하는 범위)의 글·문항과 도식 `RbacAssignmentDiagram`·`RbacScopeDiagram`, 표 `RbacRolesTable`을 더한다.**
사실은 step 5가 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

## 읽어야 할 파일

- **`phases/105-azure-identity-security/guide.md` 전체**
- `phases/105-azure-identity-security/index.json`의 앞 step `summary` — 특히 출처 step이 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/GeoRedundancyDiagram.tsx`와 `.test.tsx`, `src/data/azure/visuals/azure-storage.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/104-azure-storage-migration/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/data/azure/topics.json`의 `azure-resource-hierarchy.hierarchy`와 `questions.json`의 `az054` — 겹치지 않게
- `src/components/diagrams/azureStorageTables.tsx`와 `.test.tsx` — 표 선례

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-identity` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-security-model", "title": "접근 제어와 보안 도구", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 10 | `azure-security-model.rbac` | — | 팀이 커질 때 사람마다 권한을 적는 불편에서 시작한다. 이 주제의 첫 개념이라 **리소스**·**구독**·**권한**을 짧게 푼다. 역할을 **사용자나 그룹에** 할당한다는 구조를 회사 A의 엔지니어 그룹과 새 사람·새 리소스의 예로. 표의 사실을 본문에 먼저 쓰되 표를 문단으로 되풀이하지 않는다. 사용자 지정 역할, 역할 여럿 |
| 11 | `azure-security-model.rbac-scope` | `rbac` | 범위 넷과 상속을 **역할 이름과 함께**(관리 그룹에 소유자, 구독에 읽기 권한자). 허용 모델은 읽기 할당 + 쓰기 할당의 예로. Resource Manager와 앱·데이터 수준은 step 5 summary의 한정대로 — 그 한정을 빼고 「RBAC는 데이터 권한을 다루지 않는다」로 쓰지 않는다 |

### 2. 문항 — `az120`~`az123`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az120` | `rbac` | 4지선다, 정답 위치 3 「상황 적용」 — 감사 담당자가 리소스를 살펴보기만 하고 바꾸면 안 되는 상황. 정답 읽기 권한자. 오답 소유자·기여자·사용자 액세스 관리자(표기는 step 5 결과). 「읽기」·「읽는다」를 문제문에 쓰지 않는다(「살펴보기만」처럼) |
| `az121` | `rbac` | 예/아니요, 정답 **아니요** 「흔한 오해」 — Azure RBAC에서는 Azure가 미리 만들어 둔 역할만 쓸 수 있는가. 해설은 기본 제공 역할과 사용자 지정 역할을 가르친다 |
| `az122` | `rbac-scope` | 4지선다, 정답 위치 0 「상황 적용」 — 담당자가 VM 한 대만 다루면 되는 상황에서 최소 권한에 맞는 **범위**를 고른다. 정답 그 VM 리소스. 오답 그 VM이 든 리소스 그룹·구독·관리 그룹. VM을 그 자리에서 풀어 쓴다. `az054`(리소스 그룹에 건 역할의 상속)와 다른 것을 묻는다 |
| `az123` | `rbac-scope` | 예/아니요, 정답 **예** 「원리 이해」 — 같은 리소스 그룹에 한 할당은 읽기를, 다른 할당은 쓰기를 주면 사용자는 둘 다 할 수 있는가 |

### 3. 도식

이 step이 `src/data/azure/visuals/azure-security-model.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-security-model': azureSecurityModelVisuals`로 넣는다.

#### `azure-security-model.rbac` — `RbacAssignmentDiagram`, JSON 키 `rbac-assignment`

- 물음형 제목 예: `사람이 늘어나도 권한을 어떻게 한 번에 줄까?`
- 그릴 것: 그룹 `engineers`(「엔지니어 그룹」) 안에 `member`(「엔지니어 A」)·`new-member`(「새 엔지니어」). `role`(역할 이름은 본문의 예). 그룹 `scope`(「역할을 건 범위」) 안에 `resource`(「리소스 A」)·`new-resource`(「새 리소스」). 경로 `assign`(`member`→`role`), `assign-new`(`new-member`→`role`), `grant`(`role`→`resource`), `grant-new`(`role`→`new-resource`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `assign` | 역할 할당 | `member`·`role`·`resource` | `assign`·`grant` | 「그룹에 역할을 할당」 | 그룹에 역할을 주면 구성원이 그 역할의 권한을 받는다 |
  | `new-person` | 새 사람 | `new-member`·`role`·`resource` | `assign-new`·`grant` | 「그룹에 넣으면 같은 권한」 | 새 사람을 그룹에 넣는 것으로 권한을 따로 적지 않는다 |
  | `new-resource` | 새 리소스 | `member`·`role`·`new-resource` | `assign`·`grant-new` | 「범위 안의 새 리소스에도」 | 역할을 건 범위에 새 리소스가 생기면 기존 구성원에게도 미친다 |

- 요점 테스트: `member`·`new-member`는 `engineers` 안, `resource`·`new-resource`는 `scope` 안(두 배치). 사람에게서 리소스로 바로 가는 경로가 없다 — 모든 경로가 `role`을 지난다. 세 시나리오의 선명한 노드 집합이 서로 다르다.

#### `azure-security-model.rbac-scope` — `RbacScopeDiagram`, JSON 키 `rbac-scope`

- 물음형 제목 예: `어디에 역할을 걸면 어디까지 미칠까?`
- 그릴 것: `management-group`(「관리 그룹」), `subscription`(「구독」), `resource-group`(「리소스 그룹」), `resource`(「리소스」)를 위에서 아래로(가로형은 왼쪽에서 오른쪽으로). 경로 `inherit-1`·`inherit-2`·`inherit-3`이 차례로 잇고 늘 보인다.
- 시나리오(선명한 노드가 곧 그 역할이 미치는 곳이다):

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `at-mg` | 관리 그룹에 소유자 | 넷 모두 | `management-group` 곁 「여기에 소유자」 | 그 아래 구독·리소스 그룹·리소스를 모두 관리한다 |
  | `at-subscription` | 구독에 읽기 권한자 | 아래 셋 | `subscription` 곁 「여기에 읽기 권한자」 | 그 구독의 리소스 그룹과 리소스를 모두 볼 수 있다 |
  | `at-resource` | 리소스 하나에 | `resource` | `resource` 곁 「이 리소스에만」 | 위로 올라가지 않으므로 다른 리소스에는 미치지 않는다 |

- 요점 테스트: 경로 셋이 `management-group`에서 `resource`로 이어진다. `at-subscription`에서 `management-group`이 opacity `0.25`. `at-resource`에서 위 셋이 opacity `0.25`.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로).

### 4. 표 — `RbacRolesTable`

`src/components/diagrams/azureSecurityModelTables.tsx`와 `.test.tsx`를 새로 만든다. `visuals/azure-security-model.json`의 `tables["rbac-roles"]`, 개념 `azure-security-model.rbac`. 열은 **역할 · 리소스 관리 · 역할 할당**, 행은 소유자·기여자·읽기 권한자·사용자 액세스 관리자(표기와 칸은 step 5 결과대로). `columnWidths`와 계산은 guide.md 「도식」대로 summary에 적는다. **`사용자 액세스 관리자`처럼 긴 이름이 낱말 중간에서 끊기지 않게 첫 열 폭을 잰다.**

### 5. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 123개, 마지막 id는 `az123`, 예 31·아니요 31이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 열넷째 주제이고 `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/105-azure-identity-security/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **관리 그룹·구독의 계층 자체를 다시 가르치지 마라.** 이유: `azure-resource-hierarchy`의 범위다. 이 주제에서 뜻이 서게 한 줄씩만 푼다.
- **Azure Policy·리소스 잠금을 역할과 견주지 마라.** 이유: `azure-governance`의 범위다.
- **거부 할당을 자세히 쓰지 마라.** 이유: 학습 가이드의 범위 밖이다. 「허용 모델」의 단정이 틀리지 않게 하는 데 필요하면 step 5 summary의 말로 한 구절만 쓴다.
