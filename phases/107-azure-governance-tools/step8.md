# Step 8: iac-sources

## 배경

phase 107의 전체 계획과 결정은 `phases/107-azure-governance-tools/guide.md`에 있다.
step 9~10이 주제 `azure-infrastructure-as-code`의 개념 4개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고, 덤프·용어집이 공식 문서와 다른 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다.

이 주제는 덤프 문항이 9개뿐이고(별점 없음) 덤프 답은 대부분 「반복 배포는 ARM 템플릿」이다. 중심 문제는 둘이다.
(1) **선언형과 명령형을 쓸 근거** — Learn 단원 4는 템플릿을 선언형, Azure PowerShell을 「명령형 코드」로 적는다. 두 낱말의 한국어 표기와, 앱이 쓸 짧은 풀이의 근거를 정한다.
(2) **「같은 템플릿을 되풀이하면 같은 상태」를 어디까지 단정할 수 있는가** — 템플릿 개요는 멱등이라고 적는다. 배포 모드에 따라 템플릿에 없는 리소스가 어떻게 되는지까지 쓰면 개념을 흐리므로, 쓸 범위를 정한다(guide 「배경」 — 배포 모드 이름은 쓰지 않는다).

## 읽어야 할 파일

- `phases/107-azure-governance-tools/guide.md` — 특히 「배경」, 「세 주제와 개념 17개」의 `azure-infrastructure-as-code` 표, 「예시 값」, 「출처」, 「출처 step(0·4·8)의 공통 형식」
- `phases/107-azure-governance-tools/index.json`의 step 0·4 `summary` — 표기와 마지막 D·G 번호, step 4가 「모든 요청이 Resource Manager를 거친다」에 남긴 근거
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞이 만든 형식을 따른다.** Resource Manager를 말하는 기존 항목(「(phase 102) Azure Resource Manager — What is Azure Resource Manager?」 등, `grep -n 'Resource Manager\|템플릿\|template' docs/source/azure/official.md`)을 먼저 읽는다. 있는 항목에는 덧붙인다
- `docs/source/azure/topic-map.md`의 「`management-tools` 라벨의 배정」 — 이 step의 문항 목록(`azure-infrastructure-as-code` 9 — NO.228은 NO.193과 같은 문항이라 세지 않는다)
- 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다. 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/4-management-governance.md`의 IaC·ARM·ARM 템플릿·Bicep·Terraform 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — guide.md 「출처」의 목록(`docs-arm-overview.md`, `docs-arm-templates-overview.md`, `docs-bicep-overview.md`, Learn 단원 4)
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

받는 법과 파일 이름은 step 0과 같다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `resource-manager` | 정의·표기(「Azure Resource Manager」를 옮기지 않는지, 약칭 「ARM」·「Resource Manager」를 어디서 쓰는지), **요청이 오는 곳**(포털·Azure PowerShell·Azure CLI·REST API·SDK — **SDK**의 뜻을 쓸 근거), **인증하고 권한을 확인한 뒤 서비스로 넘긴다**, **같은 API를 지나므로 도구가 달라도 결과가 같다**, 이점 목록(묶어서 배포·관리, 의존 순서, 접근 제어, 태그 — Learn 단원 4와 `docs-arm-overview.md`). 앞 phase 항목에 있는 사실은 덧붙이기만. NO.44·417(「일관된 관리 계층/배포 플랫폼」 — 덤프가 맞는지) | Learn 단원 4와 ko, `docs-arm-overview.md`와 ko |
| b | `infrastructure-as-code` | 정의와 한국어 표기(「코드형 인프라」·「IaC(Infrastructure as Code)」 — Learn ko 단원 4를 본다), **명령형**과 **선언형**의 한국어 표기와 각각 무엇을 적는가(Learn 단원 4, `docs-arm-templates-overview.md` 「Why choose ARM templates?」, `devops/deliver/what-is-infrastructure-as-code`), 같은 코드로 여러 환경을 같은 모양으로 만든다는 근거, 스크립트에서 템플릿으로(Learn). **인프라**를 한 줄로 풀 근거. NO.326 | Learn 단원 4와 ko, `devops/deliver/what-is-infrastructure-as-code`, `docs-arm-templates-overview.md` |
| c | `arm-templates` | 표기(「ARM 템플릿」·「Azure Resource Manager 템플릿」·「Resource Manager 템플릿」 — 하나로 정하고 처음 나올 때의 풀이를 정한다), **JSON 파일**(**JSON**을 한 줄로 풀 근거), 선언형, **배포 전에 검사한다**, **기대는 순서대로·기대지 않는 것은 동시에 만든다**, **되풀이해도 같은 상태**(멱등 — 한국어 표기, 쓸 범위), **매개변수**로 환경마다 다른 값을 받는다(`templates/syntax` — 구역 이름은 쓰지 않는다), 템플릿을 나눠 다시 쓴다(모듈·연결된 템플릿 — 쓸 말). NO.56·202·333·454(반복 배포 — 덤프가 맞는지 묶어서), **NO.193·228**(배포·코드 정의·범위 진술 — 그림까지, 덤프끼리 갈리는지), NO.449(형식) | `docs-arm-templates-overview.md`, `templates/syntax`, `templates/deployment-modes`(근거만) |
| d | `bicep` | 정의·표기(「Bicep」), **선언형 언어**, JSON보다 짧고 읽기 쉽다(쓸 수 있는 말 — 꾸밈말을 빼고), **배포할 때 ARM 템플릿(JSON)으로 바뀌어 Resource Manager가 처리한다**(표기 — 「변환」·「트랜스파일」 가운데), 모듈, 되풀이해도 같은 상태, **ARM 템플릿과 같은 것을 할 수 있는가**(새 리소스 유형을 바로 쓰는가 — `docs-bicep-overview.md`), 용어집 Bicep 항목의 「Azure가 이를 ARM 템플릿으로 변환」이 맞는지 | `docs-bicep-overview.md`, `bicep/compare-template-syntax` |
| e | 범위 밖 | 용어집 **Terraform** 항목(타사 도구 — 쓰지 않는다, 처리만), 용어집 IaC 항목의 「ARM, Terraform 등」·「DevOps 프로세스에 필수」 진술의 처리. Learn 단원 4의 「배포 스크립트」(쓰지 않는다 — 처리만) | 용어집 |
| f | 도식·표 | `ResourceManagerDiagram`·`IacEnvironmentsDiagram`·`TemplateDeploymentDiagram`과 `DeploymentMethodsTable`의 라벨·곁말·캡션·칸의 사실마다 근거가 있는지(각 step 문서의 설계를 읽는다) | a~e의 결과 |

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·4·8)의 공통 형식」대로. Learn 단원 4를 새 항목으로 두고, 앞 phase가 둔 「(phase 102) Azure Resource Manager — What is Azure Resource Manager?」에는 덧붙인다(끝에 `(phase 107)`). ARM 템플릿·Bicep 개요는 새 항목. 끝에 「도식·표의 사실 — `azure-infrastructure-as-code`」과 「한국어 표기 정리 — `azure-infrastructure-as-code`」 항목.

### 3. `docs/source/azure/corrections.md`에 더한다

step 4의 마지막 D·G 번호 다음부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.193·228** — 템플릿 진술 묶음(덤프끼리 갈리거나 공식 문서와 다르면).
- **용어집 4쪽 IaC·Terraform·Bicep·ARM 템플릿** — 무엇을 주장하는지 보고 처리한다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-infrastructure-as-code`의 개념 4개마다 한 줄씩: **확정한 `name`, 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**. 위 표의 a~f마다 결과와 근거 문서.
특히 (1) 명령형·선언형의 확정 표기와 앱이 쓸 짧은 풀이, (2) ARM 템플릿의 확정 표기와 처음 나올 때의 풀이, (3) 「되풀이해도 같은 상태」를 쓸 말과 범위, (4) Bicep이 배포되는 길(쓸 말 그대로), (5) Resource Manager가 요청을 받는 곳의 확정 목록, (6) 도식 셋과 표에 쓸 수 있는 사실. 받은 파일 목록. 마지막 D·G 번호. 끝에 **「메인 세션이 볼 것」**(앞 phase 문장과 어긋나는 곳 — `azure-resource-hierarchy`·`azure-security-model.rbac-scope`의 Resource Manager 설명, `azure-cloud-benefits.security-governance`·`manageability`의 템플릿 설명)과 **「사용자 확인」** 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·4·8)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작은 step 7이 끝났을 때의 수).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/107-azure-governance-tools/index.json`의 step 8을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 앞 phase 문장도 고치지 않는다.
- **확인하지 못한 사실을 두 문서에 적지 마라.**
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.** Terraform 쪽 문서(타사)는 열지 않는다.
- **템플릿 문법(구역 이름, 함수, 표현식), 배포 모드 이름, 템플릿 사양·배포 스택·what-if를 기록에 「쓸 것」으로 적지 마라.** 이유: guide 「배경」 — 앱에 쓰지 않는다.
