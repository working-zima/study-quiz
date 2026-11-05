# Step 10: templates-bicep

## 배경

phase 107의 전체 계획·결정·공통 규칙은 `phases/107-azure-governance-tools/guide.md`에 있다. **이 step은 주제 `azure-infrastructure-as-code`에 개념 16(ARM 템플릿)·17(Bicep)의 글·문항과 도식 `TemplateDeploymentDiagram`, 표 `DeploymentMethodsTable`을 더해 주제와 phase를 마친다.**

중심 문제: 덤프는 「같은 것을 되풀이해 배포하려면 ARM 템플릿」을 일곱 번 묻는다(NO.56·193·202·326·333·449·454). 이름을 외우게 하지 말고 **템플릿이 무엇을 적고 Resource Manager가 그것으로 무엇을 하는가**(검사, 기대는 순서, 되풀이해도 같은 상태)를 가르친다. 그리고 Bicep이 ARM 템플릿과 **쓰는 꼴만 다르고 같은 길로 배포된다**는 것을 세운다.
마지막 개념의 표가 스크립트·ARM 템플릿·Bicep을 나란히 둔다.

## 읽어야 할 파일

- **`phases/107-azure-governance-tools/guide.md` 전체**
- `phases/107-azure-governance-tools/index.json`의 앞 step `summary` — 특히 step 8이 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/ResourceManagerDiagram.tsx`(step 9)와 `.test.tsx`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `src/components/diagrams/azureCostManagementTables.tsx`와 `.test.tsx` — 표 선례
- `phases/106-azure-cost/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/data/azure/visuals/azure-infrastructure-as-code.json`과 앞 step의 도식, `src/data/azure/topics.json`의 `azure-infrastructure-as-code` 개념 14·15 — 표의 칸이 이 본문과 맞아야 한다

## 작업

### 1. 개념 — `topics.json`의 `azure-infrastructure-as-code` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 16 | `azure-infrastructure-as-code.arm-templates` | — | 정식 이름과 약칭(step 8 결과)을 처음에 함께 세운다. **JSON**을 한 줄로 푼다. 무엇을 적는가(배포할 리소스와 설정 — 선언형, 앞 개념의 말로 되짚는다). Resource Manager가 그 파일로 하는 일 셋을 같은 꼴로 — 배포 전 검사, 기대는 순서대로·기대지 않는 것은 동시에, 되풀이해도 같은 상태(step 8 결과의 말과 범위 그대로). 환경마다 다른 값은 매개변수로(step 8 결과대로 한 줄). 나눠서 다시 쓰기는 한 줄. **도식의 예(가상 네트워크 1, VM 1, 스토리지 계정 1)를 본문에 쓴다** — VM이 가상 네트워크에 기대는 까닭을 이 주제 화면에서 한 줄로 푼다 |
| 17 | `azure-infrastructure-as-code.bicep` | `arm-templates` | 선언형 언어라는 것과 JSON 템플릿보다 짧고 읽기 쉽다는 것부터(꾸밈말 없이 — 무엇이 줄어드는가). 배포할 때 ARM 템플릿으로 바뀌어 같은 Resource Manager가 처리한다(step 8 결과의 표기). 모듈, 되풀이해도 같은 상태. **ARM 템플릿과 무엇이 다른가**(쓰는 꼴 / 같은 결과 — 4절). 표 `DeploymentMethodsTable`의 칸에 쓰는 사실을 본문에 먼저 쓴다 — 스크립트 행은 개념 15가 쓴 말과 같게 |

### 2. 문항 — `az176`~`az178`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az176` | `arm-templates` | 4지선다, 정답 위치 3 「원인과 결과」 — 템플릿 하나에 가상 네트워크, 그 가상 네트워크에 둘 VM, 따로 쓰는 스토리지 계정이 적혀 있다. Resource Manager는 이것들을 어떤 순서로 만드는가(step 8 결과대로 — 기대는 순서, 기대지 않는 것은 동시에). 오답은 「적힌 순서대로 하나씩」, 「모두 한꺼번에」, 「담당자가 순서를 따로 정해 줘야 한다」처럼 실제로 헷갈리는 것. 덤프의 「반복 배포는 무엇으로」 꼴을 쓰지 않는다 |
| `az177` | `arm-templates` | 예/아니요, 정답 **아니요** 「흔한 오해」 — 같은 템플릿을 같은 곳에 두 번 배포하면 같은 리소스가 두 벌 생기는가(step 8 결과의 범위로 — 배포 모드 이름은 쓰지 않는다). 해설은 무엇이 되는지(같은 상태)를 가르친다 |
| `az178` | `bicep` | 예/아니요, 정답 **예** 「원리 이해」 — Bicep으로 쓴 파일은 배포할 때 ARM 템플릿으로 바뀌어 Azure Resource Manager가 처리하는가(step 8 결과의 말로). 「Bicep으로 써도」처럼 답을 흘리는 「…도」를 쓰지 않는다 |

### 3. 도식 — `azure-infrastructure-as-code.arm-templates` — `TemplateDeploymentDiagram`, JSON 키 `template-deployment`

- 물음형 제목 예: `템플릿 하나를 배포하면 Resource Manager는 무엇을 할까?`
- 그릴 것: `template`(「ARM 템플릿」 — step 8의 표기), `arm`(「Azure Resource Manager」), `vnet-1`(「가상 네트워크 1」), `vm-1`(「VM 1」), `storage-1`(「스토리지 계정 1」). 경로 `submit`(`template`→`arm`), `create-vnet`(`arm`→`vnet-1`), `then-vm`(`vnet-1`→`vm-1` — 기대는 순서), `create-storage`(`arm`→`storage-1`).
- 세로형(폭 280)은 위에서 아래로 `template` → `arm` → 리소스. `vnet-1`→`vm-1`을 세로로, `storage-1`을 옆에 둔다. 반각 글자가 섞인 라벨은 1.15배로 폭을 잡는다.
- 시나리오(말은 step 8 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `validate` | 배포하기 전에 | `template`·`arm` | `submit` | 「먼저 검사한다」 | Resource Manager는 템플릿을 받아 배포하기 전에 검사한다 |
  | `order` | 만드는 순서 | `arm`·`vnet-1`·`vm-1`·`storage-1` | `create-vnet`·`then-vm`·`create-storage` | 「가상 네트워크가 먼저」, 「기대지 않는 것은 동시에」 | VM은 가상 네트워크가 있어야 만들어지므로 그 뒤에, 스토리지 계정은 따로 함께 만든다 |
  | `redeploy` | 다시 배포하면 | 다섯 모두 | `submit` | step 8 결과 | 같은 템플릿을 다시 배포해도 같은 상태가 된다 — 두 벌이 생기지 않는다(step 8 결과대로) |

- 요점 테스트: `then-vm`의 시작이 `vnet-1`이고 끝이 `vm-1`이다 — `arm`에서 `vm-1`로 바로 가는 경로가 없다. `create-storage`는 `vnet-1`·`vm-1`을 거치지 않는다. `validate`에서 리소스 노드 셋이 opacity `0.25`다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다. `redeploy`에서 같은 리소스를 두 번 그리지 않는다 — 「두 벌이 아니다」는 곁말과 캡션으로 보인다.

registry에 두 줄 — `arm-templates`(도식), `bicep`(표).

### 4. 표 — `DeploymentMethodsTable`

`src/components/diagrams/azureInfrastructureAsCodeTables.tsx`와 `.test.tsx`를 새로 만든다. `visuals/azure-infrastructure-as-code.json`의 `tables["deployment-methods"]`, 개념 `azure-infrastructure-as-code.bicep`. 열은 **방식 · 적는 것 · 파일**. 행은 스크립트(Azure CLI·Azure PowerShell) / ARM 템플릿 / Bicep — 칸은 이 주제 본문과 같게 쓴다. 스크립트는 「무엇을 어떤 순서로 실행할지(명령형)」, ARM 템플릿은 「배포가 끝났을 때 있어야 할 것(선언형)」·「JSON 파일」, Bicep은 같은 선언형·「Bicep 파일 — 배포할 때 ARM 템플릿으로 바뀐다」 쪽으로 — 말은 본문을 따른다. 칸에 백틱을 쓰지 않는다(guide 「도식」 표). `columnWidths`와 계산은 guide.md 「도식」대로 summary에 적는다. registry의 표 등록은 선례를 따른다.

### 5. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~7·9·10)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 178개, 마지막 id는 `az178`, 예 45·아니요 44, 정답 위치 22/22/22/23이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `azure-infrastructure-as-code`의 개념이 4개이고 순서가 guide.md 표와 같은지, 개념 17의 `parentId`가 `azure-infrastructure-as-code.arm-templates`인지 본다. 과목 전체가 주제 19개·개념 124개·문항 178개, 예 45·아니요 44, 정답 위치 22/22/22/23인지 본다. 「Terraform」·「배포 스택」·「템플릿 사양」·배포 모드 이름이 이 주제의 개념·문항·도식·표에 없는지 `grep`으로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/107-azure-governance-tools/index.json`의 step 10을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **템플릿·Bicep 코드 조각(구역 이름, 리소스 선언, 함수)을 본문·문항·도식에 쓰지 마라.** 이유: 학습 가이드의 줄은 「무엇인가」다. 「JSON 파일」·「Bicep 파일」까지.
- **배포 모드 이름과 템플릿에 없는 리소스가 지워지는 경우를 쓰지 마라.** 이유: guide 「배경」 — 개념을 흐린다. step 8이 쓸 범위로 정한 말만 쓴다.
- **ARM 템플릿과 Bicep 가운데 하나를 「더 낫다」고 쓰지 마라.** 이유: 출처가 말하는 차이(꼴·길이)까지만 쓴다.
