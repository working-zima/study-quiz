# Step 9: resource-manager-iac

## 배경

phase 107의 전체 계획·결정·공통 규칙은 `phases/107-azure-governance-tools/guide.md`에 있다.
**이 step은 주제 `azure-infrastructure-as-code`(ARM과 코드형 인프라)를 만들고 개념 14(Azure Resource Manager)·15(코드형 인프라)의 글·문항과 도식 `ResourceManagerDiagram`·`IacEnvironmentsDiagram`을 더한다.**
사실은 step 8이 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

중심 문제: **Resource Manager는 도구가 아니라 도구 뒤의 관문이다.** 학습자는 Resource Manager를 포털·CLI와 나란한 「또 하나의 도구」나 ARM 템플릿 파일과 섞는다. 요청이 어디서 와서 어디를 거쳐 어디로 가는지로 세운다. 그리고 코드형 인프라에서 **명령형(순서를 적는다)과 선언형(결과를 적는다)**을 가른다.
이 주제는 별점이 없다(`importance` 0) — 덤프 문항이 9개뿐이다. 그래도 글·문항·도식의 기준은 다른 주제와 같다.

## 읽어야 할 파일

- **`phases/107-azure-governance-tools/guide.md` 전체**
- `phases/107-azure-governance-tools/index.json`의 앞 step `summary` — 특히 step 8이 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/ToolAccessDiagram.tsx`(step 5 — 같은 도구 노드를 다른 요점으로 쓴다)와 `.test.tsx`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/106-azure-cost/verification.md`의 「메인 세션이 마무리에서 고친 것」
- 겹치지 않게: `src/data/azure/topics.json`의 `azure-management-tools.management-tools`(모든 도구가 Resource Manager를 거친다는 한 줄), `azure-security-model.rbac-scope` 문단 4, `azure-cloud-benefits.manageability`·`security-governance`의 템플릿 줄과 `az023`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-management-tools` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-infrastructure-as-code", "title": "ARM과 코드형 인프라", "importance": 0, "sourcePages": [0, 0], "concepts": [ … ] }`. 개념은 guide.md 표의 14·15다. `name`은 step 8 summary가 확정한 표기를 쓴다.

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 14 | `azure-infrastructure-as-code.resource-manager` | — | 이 주제의 첫 개념이라 **리소스**·**리소스 그룹**·**구독**을 짧게 푼다. 첫 문장은 담당자마다 다른 도구를 써도 결과가 같아야 한다는 문제부터. 요청이 오는 곳(step 8의 목록 — **SDK**를 한 줄로 푼다) → 인증·권한 확인 → 서비스. 도구가 달라도 결과가 같은 까닭. 이점은 한 줄씩(묶어서 배포·관리, 의존 순서, 접근 제어, 태그 — 각 낱말을 이 주제 화면에서 짧게). **Resource Manager와 ARM 템플릿**은 다르다는 한 줄(요청을 처리하는 서비스 / 그 서비스에 넘기는 파일 — ARM 템플릿을 그 자리에서 푼다). **도식의 예(포털, Azure CLI, VM 1)를 본문에 쓴다** |
| 15 | `azure-infrastructure-as-code.infrastructure-as-code` | — | **인프라**를 한 줄로 푸는 것부터. 손으로 설정할 때 생기는 일(환경마다 달라진다, 다시 만들기 어렵다 — step 8 결과의 범위로) → 코드로 관리하는 방식. **명령형**과 **선언형**을 4절대로(무엇을 적는가, 누가 순서를 정하는가) — 스크립트와 템플릿을 예로. 앞 개념의 Azure CLI·Azure PowerShell 스크립트가 명령형의 예다. **도식의 예(개발·테스트·운영 환경)를 본문에 쓴다** |

### 2. 문항 — `src/data/azure/questions.json`에 `az174`~`az175`

| id | 개념 | 형식과 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az174` | `resource-manager` | 예/아니요, 정답 **예** 「원리 이해」 — 한 담당자는 포털로, 다른 담당자는 Azure CLI로 같은 구독에 리소스를 만들 때 두 요청이 모두 Azure Resource Manager를 거쳐 처리되는가. `az023`(관리 효율성의 두 갈래)과 다른 것을 묻는다 |
| `az175` | `infrastructure-as-code` | 4지선다, 정답 위치 0 「개념 비교」 — 무엇을 어떤 순서로 실행할지가 아니라 배포가 끝났을 때 무엇이 있어야 하는지만 적는 방식(정답 선언형 — step 8의 표기). 오답은 명령형, 포털에서 하나씩 설정하기, Cloud Shell에서 명령을 하나씩 입력하기처럼 「인프라를 만드는 방식」 안에서 헷갈리는 것. 문제문에 「선언」을 쓰지 않는다 |

### 3. 도식

이 step이 `src/data/azure/visuals/azure-infrastructure-as-code.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-infrastructure-as-code': azureInfrastructureAsCodeVisuals`로 넣는다.

#### `azure-infrastructure-as-code.resource-manager` — `ResourceManagerDiagram`, JSON 키 `resource-manager`

- 물음형 제목 예: `어느 도구로 보내든 요청은 어디를 지날까?`
- 그릴 것: 요청을 보내는 곳 `portal`(「Azure 포털」)·`cli`(「Azure CLI」)·`powershell`(「Azure PowerShell」)·`rest`(「REST API」), 가운데 `arm`(「Azure Resource Manager」), 뒤에 `vm-1`(「VM 1」). 경로 `portal-to-arm`·`cli-to-arm`·`ps-to-arm`·`rest-to-arm`(각 → `arm`), `arm-to-vm`(`arm`→`vm-1`). 「인증·권한 확인」은 `arm` 곁의 곁말.
- 세로형(폭 280)은 보내는 곳 넷을 두 줄 두 칸으로, 그 아래 `arm`, 그 아래 `vm-1`. 경로가 다른 노드를 지나지 않게 설계한다.
- 시나리오(말은 step 8 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `portal` | 포털에서 | `portal`·`arm`·`vm-1` | `portal-to-arm`·`arm-to-vm` | 「인증하고 권한을 확인한다」 | 포털에서 보낸 요청이 Resource Manager를 거쳐 VM 1을 만든다 |
  | `cli` | Azure CLI에서 | `cli`·`arm`·`vm-1` | `cli-to-arm`·`arm-to-vm` | 「같은 결과」 | 다른 도구로 보내도 같은 관문을 지나 같은 결과가 된다 |
  | `denied` | 권한이 없으면 | `powershell`·`arm` | `ps-to-arm` | step 8 결과 | 권한 확인을 통과하지 못한 요청은 서비스로 넘어가지 않는다 — step 8이 근거를 확인한 범위로 |

  `denied`의 근거를 step 8이 찾지 못했으면 이 시나리오를 빼거나 근거가 있는 다른 장면(예: `rest` — 프로그램이 보낸 요청)으로 바꾸고 summary에 적는다.
- 요점 테스트: 보이는 경로 가운데 `arm`을 거치지 않고 `vm-1`에 닿는 것이 없다(모든 도구 → `arm` → `vm-1`). `portal`·`cli`에서 `arm-to-vm`이 보이고 `denied`에서는 보이지 않는다. `portal`과 `cli`에서 `arm`·`vm-1`이 함께 선명하다.

#### `azure-infrastructure-as-code.infrastructure-as-code` — `IacEnvironmentsDiagram`, JSON 키 `iac-environments`

- 물음형 제목 예: `손으로 만든 환경과 코드로 만든 환경은 무엇이 다를까?`
- 그릴 것: 그룹 `g-manual`(「손으로 설정할 때」) 안에 `manual-dev`·`manual-test`·`manual-prod`(「개발 환경」·「테스트 환경」·「운영 환경」), 그룹 `g-code`(「코드로 배포할 때」) 안에 `code`(「코드 한 벌」 — 본문의 말)와 `code-dev`·`code-test`·`code-prod`. 경로 `to-dev`·`to-test`·`to-prod`(`code`→각 환경). 그룹 이름은 본문의 말로 고친다.
- 세로형(폭 280)은 두 그룹을 위아래로 쌓는다. 환경 노드 셋을 나란히 두기 어려우면 노드 폭과 배치를 바꾼다 — 라벨을 줄이지 않는다.
- 시나리오(말은 step 8 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `manual` | 손으로 | `manual-dev`·`manual-test`·`manual-prod` | 없음 | 「환경마다 달라질 수 있다」 | 화면에서 하나씩 설정하면 환경마다 설정이 어긋날 수 있다 |
  | `code` | 코드로 | `code`·`code-dev`·`code-test`·`code-prod` | `to-dev`·`to-test`·`to-prod` | 「같은 모양으로」 | 같은 코드로 세 환경을 같은 모양으로 만든다 |
  | `rebuild` | 다시 만들 때 | `code`·`code-prod` | `to-prod` | step 8 결과 | 같은 코드로 다시 배포해 같은 환경을 만든다 |

- 요점 테스트: `manual`에서 보이는 경로가 없고 `g-code`의 노드가 모두 opacity `0.25`다. `code`의 보이는 경로 셋이 모두 `code`에서 시작한다. 환경 노드 여섯의 라벨이 두 그룹에 같은 셋으로 있다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(`azure-management-tools.azure-arc` 키 뒤, 개념 순서대로).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~7·9·10)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 175개, 마지막 id는 `az175`, 예 44·아니요 43, 정답 위치 22/22/22/22이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 열아홉째 주제이고 `importance` 0·`sourcePages` [0, 0]인지, `data.test.ts`(별점이 덤프 수 9에서 계산한 값과 같은가)와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/107-azure-governance-tools/index.json`의 step 9를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 16·17(ARM 템플릿·Bicep)을 만들지 마라.** 이유: step 10의 범위다. 이 step의 글이 템플릿을 쓸 때는 한 줄 풀이로 그친다.
- **Terraform 같은 타사 도구 이름을 쓰지 마라.** 이유: guide 「배경」.
- **Resource Manager의 API 버전·리소스 공급자·제어 평면 같은 세부를 쓰지 마라.** 이유: 학습 가이드의 줄은 「무엇인가」다.
