# phase 107 공통 안내 — Azure AZ-900 과목의 거버넌스와 규정 준수, 관리 도구, ARM과 코드형 인프라

이 phase의 **모든 step이 먼저 읽는 문서**다. step 문서는 자기 일의 세부만 적고, 과목 결정·세 주제의 개념 표와 글·문항·도식·파일 형식의 공통 규칙은 여기에 둔다.
step 문서와 이 문서가 다르면 step 문서를 따르고 그 차이를 summary에 적는다.

## 배경 — 다시 묻지 말 결정

Azure AZ-900 과목(`src/data/azure/`, ADR-060)은 phase 100에서 생겼고 phase 101~106이 주제 3~16을 더했다. 주제 지도(`docs/source/azure/topic-map.md`)의 주제 20개 가운데 1~16이 있고, **이 phase는 17·18·19를 더한다.**
공식 학습 가이드의 두 묶음을 채운다 — 「Describe features and tools in Azure for governance and compliance」(Microsoft Purview, Azure Policy, 리소스 잠금)와 「Describe features and tools for managing and deploying Azure resources」(Azure 포털, Azure Cloud Shell·Azure CLI·Azure PowerShell, Azure Arc, 코드형 인프라, Azure Resource Manager와 ARM 템플릿).

**앞 phase가 남긴 것(이 phase의 출발점):**

- 주제 열여섯 — `azure-cloud-computing`·`azure-cloud-models`·`azure-cloud-benefits`·`azure-sla-lifecycle`·`azure-service-types`·`azure-regions-zones`·`azure-resource-hierarchy`·`azure-compute`·`azure-virtual-networking`·`azure-network-protection`·`azure-storage`·`azure-data-movement`·`azure-identity`·`azure-security-model`·`azure-cost-factors`·`azure-cost-management`, 개념 107개.
- 문항 `az001`~`az152`(152개) — 예/아니요 예 38·아니요 38, 4지선다 정답 위치(`answerIndex` 0~3) 19/19/19/19.
- 도식 61개, 표 12개.
- 출처 문서 `docs/source/azure/official.md`(항목 머리 `## (phase 100) …`~`## (phase 106) …`)와 `docs/source/azure/corrections.md`(D1~D105, G1~G59). **이 phase는 D106·G60부터 잇는다.**
- 검증 값(설계 때 잰 값): 테스트 284파일·6310개, 교차 검사 세로·가로 노드 1253·경로 854, `check-verbatim --subject azure` 원본 655개·단위 1037개(설계 세션이 Learn 단원과 제품 문서를 받아 원본이 626에서 늘었다 — 아래 「출처」).
- 실행 보고 `phases/100-…`~`106-azure-cost/verification.md` — 출처 step이 정한 표기와 그 이유, 마무리에서 고친 문항·문장의 꼴이 있다. **`105`·`106`의 「메인 세션이 마무리에서 고친 것」을 읽는다** — 답을 흘리는 말(「…뒤에도」, 「별도로 확인하지 않아도」), 이름만으로 소거되는 보기(az150), 어색하게 끼워 넣은 라벨 풀이(az133)를 고쳤다. 같은 것을 반복하지 않는다.

**앞 주제가 이미 쓴 것 — 겹치지 않게:**

- `azure-resource-hierarchy.hierarchy`(phase 102)가 **정책과 역할 할당이 위 층에서 아래 층으로 상속된다**를 관리 그룹 예(VM을 둘 지역을 한 곳으로 제한하는 정책)로 가르치고, 도식 `HierarchyInheritanceDiagram`이 그 장면을 그린다. 이 phase의 Azure Policy는 상속을 한 줄로만 다시 풀고 **정책이 무엇을 보고 무엇을 막는가, 이미 있던 리소스는 어떻게 되는가**를 다룬다. 같은 상속 그림을 다시 그리지 않는다.
- `azure-resource-hierarchy.resource-group`이 리소스 그룹을 지우면 안의 리소스가 함께 지워진다고 쓴다. `lock-inheritance`는 그 반대편 — **잠금이 있으면 리소스 그룹을 지울 수 없다** — 을 다룬다.
- `azure-security-model.rbac`·`rbac-scope`(phase 105)가 Azure RBAC와 역할의 범위·상속을 가르치고, `rbac-scope` 문단 4가 「역할은 Azure Resource Manager를 거치는 작업에 적용된다」를 쓴다. 이 phase는 Azure RBAC를 다시 가르치지 않고 **Azure Policy·리소스 잠금과 무엇이 다른가**만 쓴다. `az054`가 역할 할당의 범위를 묻는다.
- `azure-cloud-benefits.manageability`(phase 101)가 웹 포털·CLI·PowerShell·API를 한 줄씩 풀고 `az023`이 그 둘을 「클라우드에서의 관리」로 묻는다. `azure-cloud-benefits.security-governance`가 템플릿 배포와 감사 기능을 한 줄씩 쓴다. 이 phase는 도구마다 **어디서 실행하고 무엇이 다른가**를 다룬다.
- `azure-cloud-models.multicloud`와 `azure-security-model.defender-for-cloud`가 Azure Arc를 한 줄로 풀고 `az128`이 그 줄을 쓴다. `azure-arc`가 Arc의 개념 자리다.
- `azure-data-movement.azure-migrate`(phase 104)가 온-프레미스 서버를 Azure로 **옮기는** 도구를 가르친다. `azure-arc`는 **옮기지 않고 그 자리에서** 관리하는 쪽이다 — 4절의 짝으로 쓴다.
- `azure-cost-management.tag-inheritance`(phase 106)가 「Azure Policy로 태그를 요구하거나 다시 붙인다」를 한 줄로 쓰고 `az149`가 태그 상속을 묻는다. 이 phase의 `policy-compliance`가 수정 작업을 쓸 때 같은 예를 쓰되 다른 상황으로 묻는다.
- 다른 주제의 몫: **Azure Advisor·Service Health·Azure Monitor는 `azure-monitoring`**(phase 108). 이 phase에서 개념으로 세우지 않는다. 필요한 낱말은 그 자리에서 한 줄로 푼다.

**사용자 결정(2026-10-30, 다시 묻지 마라):**

- **범위**: Microsoft Learn의 AZ-900 공식 학습 가이드(2026-07-20 기준)가 뼈대다. 가이드 밖이라도 **용어집에 있고 덤프도 묻는 현행 것**은 넣는다.
  지원이 끝난 서비스·옛 이름은 빼거나 현행으로 고친다. 덤프만 묻는 것은 넣지 않는다. 신뢰 포털·개인정보·규정 준수 관리자(`x-trust-privacy`)는 넣지 않기로 했다(`topic-map.md` 「넣지 않는 것」).
- **도식**: **주제마다 최소 하나**, 그리고 구조·흐름이 있는 개념에는 개념마다. 정의형 개념에는 없다. 비교표는 도식을 대신하지 않는다.
- 주제 지도(20개, 순서·별점·phase)는 사용자가 「고칠 것 없음」으로 확인했다.
- 사실의 기준은 **Microsoft 공식 문서**다. 덤프와 용어집은 범위·강조의 기준이자 사실 **후보**이고, 공식 문서와 다르면 공식 문서를 따르고 수정 이력에 남긴다(ADR-060).
  덤프 문항·용어집 문장은 옮기지 않는다(ADR-009, ADR-021과 같은 방식). 덤프는 시험 주관 기관의 문항이 아니므로 「자격시험은 ~로 본다」 줄을 쓰지 않는다.
- 용어는 **Microsoft 한국어 문서의 표기**를 따른다. 주제 id는 `azure-` 접두사, 별점은 덤프 출제 빈도(대표 문항 25 이상 ★★★, 13~24 ★★☆, 12 이하 없음).
- **서비스마다의 SLA 수치는 쓰지 않는다**(phase 101 설계). 가격·지역 수도 쓰지 않는다.

**이 phase에서 정한 것(설계):**

- 개념 17개, 문항 26개(`az153`~`az178`), 도식 13개, 표 셋(`GovernanceToolsTable`·`CommandToolsTable`·`DeploymentMethodsTable`). 아래 「세 주제와 개념 17개」.
- **덤프 `management-tools` 라벨 39문항을 30·9로 나눴다** — 지도가 어림한 수와 같아 별점은 그대로다(`azure-management-tools` ★★★, `azure-infrastructure-as-code` 없음). `governance` 29문항은 모두 `azure-governance`다(★★★). 문항별 배정은 `topic-map.md` 「`management-tools` 라벨의 배정」에 있다.
- **Azure Blueprints는 쓰지 않는다.** 제품 문서가 2026-07-31부터 단계적으로 지원을 끝내 2027-01-31에 끝난다고 적고(설계 때 확인, `raw/official/blueprints-overview.md`), Learn 모듈에도 학습 가이드에도 없다. 사용자 결정(지원이 끝나는 것은 뺀다)을 따른다. TCO 계산기와 달리 Learn이 이름을 들지 않으므로 본문에 한 줄도 쓰지 않는다. 덤프 NO.77·181은 출처 step 0이 D 항목으로 남긴다.
- **「Azure Information Protection(AIP)」은 현행 이름으로 고쳐 쓴다.** 제품 문서(`raw/official/docs-information-protection-what-is.md`)가 AIP 추가 기능은 지원이 끝나 Microsoft 365 앱에 들어 있는 레이블로 바뀌었고, 지금 쓰는 것은 Microsoft Purview Information Protection이라고 적는다. 그래서 덤프 NO.111·408·427이 묻는 문서 워터마크·암호화는 **`purview`에 딸린 `sensitivity-labels`(민감도 레이블)** 로 가르치고, AIP는 「예전 이름」으로 한 번만 쓴다(phase 105의 Azure AD 처리와 같다). 출처 step 0이 D 항목으로 남긴다.
- **Azure 모바일 앱은 개념으로 세우지 않고 `management-tools`의 목록 항목 하나로 둔다.** 주제 지도의 「다루는 것」에 있고 현행 제품이지만(`raw/official/docs-azure-portal-mobile-app-overview.md`) Learn 단원 2에도 덤프에도 따로 묻는 것이 없다. 덤프 NO.220·260·287(휴대폰·태블릿에서 관리하기)의 답은 **브라우저로 여는 포털과 Cloud Shell**이다.
- **REST API도 `management-tools`의 목록 항목으로 둔다** — 덤프 NO.235(프로그램이 Azure를 다루는 길)의 답이고, Learn 단원 2가 Azure PowerShell 명령이 Azure REST API를 부른다고 적는다. 사용법·주소 꼴은 쓰지 않는다.
- **명령 예는 둘만 쓴다** — Azure CLI의 `az vm create`, Azure PowerShell의 `New-AzVM`(출처 step 4가 이름을 확인한다). 개념 본문에서는 백틱으로, 문항·도식·표에서는 백틱 없이(「예시 값」). 두 도구가 같은 일을 다른 꼴의 명령으로 한다는 것이 이 주제의 핵심이고, 덤프 NO.169·448이 명령의 꼴로 도구를 묻기 때문이다. 옵션·매개변수는 쓰지 않는다.
- **Learn 단원과 제품 문서가 어긋날 수 있는 곳**: Learn 단원 2는 Azure CLI가 「Bash 명령을 쓴다」고 하지만 제품 문서는 Azure CLI를 명령 프롬프트·PowerShell·Bash 같은 여러 셸에서 실행한다고 한다. Learn은 Cloud Shell이 「Azure PowerShell과 Azure CLI(Bash)」를 지원한다고 하지만 제품 문서는 Bash와 PowerShell 두 셸 모두에 Azure CLI와 Azure PowerShell이 미리 설치되어 있다고 한다(`docs-cloud-shell-features.md`). Learn 단원 3은 이니셔티브의 예로 「Azure Security Center」(옛 이름)를 든다. 다르면 현행 제품 문서를 따르고 출처 step이 정리한다.
- **쓰지 않는 것**: Azure Blueprints, 서비스 신뢰 포털(Learn 단원 6 — 범위 밖), Copilot in Azure와 Learn의 「AI 지원 변경」 절, Azure Policy의 Azure DevOps 연동, 정책 정의의 JSON 구조와 효과(effect) 이름 목록, 관리 ID, 이니셔티브에 든 정의 수 같은 수치, Purview의 데이터 맵·카탈로그 제품 세부와 라이선스, 다른 회사 제품 이름(Amazon S3 등), Cloud Shell의 세션 시간·저장 용량 수치·Azure 드라이브, Terraform·Ansible, Azure Arc의 사용자 지정 위치·ITOps·데이터 서비스 세부, 배포 스크립트·템플릿 사양·배포 스택·what-if·배포 모드, Azure Automation·Resource Graph.
- **도식은 구조·흐름이 있는 개념 13개에 하나씩**(아래 「도식」). 붙이지 않는 개념: `azure-portal`(정의형), `azure-powershell`(정의형 — 다음 개념의 표가 둘을 나란히 둔다), `azure-cli`(표 `CommandToolsTable`), `bicep`(표 `DeploymentMethodsTable`).
- **ADR은 필요 없다.** 쓸 출처가 모두 이미 허용된 `learn.microsoft.com`(`/training/`, `/azure/`, `/purview/`, `/cli/`, `/powershell/`) 안에 있다. 허용 목록 밖의 곳이 꼭 필요하면 쓰지 말고 출처 step의 summary 「사용자 확인」에 적는다.

**실행 규칙:**

- **step 하나는 30분 안에 끝나야 한다.** `scripts/execute.py`가 step을 1800초에서 끊는다. 그래서 step은 **브라우저 화면 실측(개발 서버·headless Chrome·CDP)을 하지 않는다** —
  phase가 끝난 뒤 메인 세션이 모든 도식을 한꺼번에 실측한다. 시간을 아끼려고 검증 명령을 건너뛰지는 마라.
- 「주제마다 도식 하나 이상」을 `src/components/diagrams/azureDiagramCoverage.test.ts`가 지킨다. 그래서 **주제를 처음 만드는 step(1·5·9)이 그 주제의 첫 도식도 함께** 만든다.
  저장소의 Stop 훅(`scripts/hooks/codex-verify-gate.sh`)은 테스트가 실패한 상태로 step을 끝내지 못하게 한다.
- **진행 안내 문장을 쓰지 않는다.** 「다음 개념에서 다룬다」, 「뒤에서 자세히 다룬다」처럼 글의 진행만 알리는 말은 `src/data/azure/data.test.ts`의 진행 안내 테스트가 막는다.
  뒤 개념이나 다른 주제가 자세히 다룰 낱말이 지금 필요하면 그 자리에서 한 줄로 풀고 넘어간다. 「앞 개념에서 본 것처럼」 같은 되짚기는 써도 된다.
- **이 Mac의 Python은 HTTPS 인증서를 찾지 못한다.** 공식 문서를 받을 때 `CERTIFICATE_VERIFY_FAILED`가 나면 명령 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`을 붙인다. 이것은 인터넷 연결 문제가 아니다 — blocked로 멈추지 마라.


## step 열한 개

| step | 이름 | 하는 일 |
|---|---|---|
| 0 | `governance-sources` | 주제 17이 쓸 사실을 공식 문서로 확인해 `official.md`·`corrections.md`에 더한다 |
| 1 | `purview-labels` | 주제 17을 만들고 개념 1·2의 글·문항과 도식 `PurviewDataMapDiagram`·`SensitivityLabelDiagram` |
| 2 | `azure-policy` | 개념 3·4·5의 글·문항과 도식 `PolicyCheckDiagram`·`PolicyComplianceDiagram`·`PolicyInitiativeDiagram` |
| 3 | `resource-locks` | 개념 6·7의 글·문항과 도식 `LockTypesDiagram`·`LockInheritanceDiagram`, 표 `GovernanceToolsTable` |
| 4 | `management-tools-sources` | 주제 18이 쓸 사실을 확인해 두 문서에 더한다 |
| 5 | `tools-portal` | 주제 18을 만들고 개념 8·9의 글·문항과 도식 `ToolAccessDiagram` |
| 6 | `shell-commands` | 개념 10·11·12의 글·문항과 도식 `CloudShellDiagram`, 표 `CommandToolsTable` |
| 7 | `azure-arc` | 개념 13의 글·문항과 도식 `AzureArcDiagram` |
| 8 | `iac-sources` | 주제 19가 쓸 사실을 확인해 두 문서에 더한다 |
| 9 | `resource-manager-iac` | 주제 19를 만들고 개념 14·15의 글·문항과 도식 `ResourceManagerDiagram`·`IacEnvironmentsDiagram` |
| 10 | `templates-bicep` | 개념 16·17의 글·문항과 도식 `TemplateDeploymentDiagram`, 표 `DeploymentMethodsTable` |

## 세 주제와 개념 17개

주제 객체(`src/data/azure/topics.json`의 기존 열여섯 주제 뒤에 이 순서로):

```json
{ "id": "azure-governance", "title": "거버넌스와 규정 준수", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }
{ "id": "azure-management-tools", "title": "관리 도구", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }
{ "id": "azure-infrastructure-as-code", "title": "ARM과 코드형 인프라", "importance": 0, "sourcePages": [0, 0], "concepts": [ … ] }
```

별점: 주제 지도의 대표 문항 수가 `azure-governance` 29(★★★), `azure-management-tools` 30(★★★), `azure-infrastructure-as-code` 9(별점 없음, `importance` 0)이다. `data.test.ts`가 이 값을 본다.

개념 id는 `<주제 id>.<슬러그>`다. 표의 순서·슬러그·`parentId`를 바꾸지 않는다(바꿔야 할 이유가 있으면 바꾸지 말고 summary에 적는다).
**`name`은 출처 step(0·4·8)이 확인한 Microsoft 한국어 문서의 표기를 따른다** — 표의 이름은 잠정이다. 한국어판 안에서도 표기가 섞인 것은 출처 step이 하나로 정하고 근거를 남긴다.
`parentId` 열의 값은 같은 주제의 슬러그다 — JSON에는 `azure-governance.purview`처럼 전체 id로 쓴다. 딸린 개념은 부모 바로 뒤에 이어 두고, 부모는 머리 개념이어야 한다(ADR-041 — 딸린 개념 아래에 또 딸리지 않는다).
「다룰 것」은 범위다. 문장은 직접 쓰고, 사실은 아래 「출처」대로 가져온다. 「step N 결과」라고 적힌 사실은 그 step의 summary와 출처 문서에 적힌 처리를 따른다 —
확인되지 않았으면 쓰지 않는다. 「덤프」 뒤의 `NO.`는 덤프 문항 번호다(`docs/source/azure/dump-topics.tsv`·`raw/dump/dump.md`).

### `azure-governance` — 거버넌스와 규정 준수 (공식 학습 가이드 「Describe features and tools in Azure for governance and compliance」)

순서는 데이터를 지킨다(Microsoft Purview, 민감도 레이블) → 리소스가 규칙을 지키게 한다(Azure Policy, 규정 준수 평가, 이니셔티브) → 실수로 지우거나 바꾸지 않게 한다(리소스 잠금, 잠금의 상속).
학습자가 가장 많이 헷갈리는 것은 **Azure Policy와 Azure RBAC**(정책은 리소스가 어떤 모양이어야 하는가를, 역할은 누가 무엇을 할 수 있는가를 정한다 — 권한이 있어도 정책을 어기는 리소스는 만들 수 없다), **정책을 나중에 걸었을 때 이미 있던 리소스**(지워지지 않고 비준수로 표시된다), **리소스 잠금과 역할**(소유자도 먼저 잠금을 풀어야 한다), **문서를 보호하는 것은 무엇인가**(Azure Policy가 아니라 민감도 레이블)다. 마지막 개념의 표 `GovernanceToolsTable`이 세 도구를 나란히 둔다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 1 | `purview` | Microsoft Purview | — | 1 | **목록 개념** — 이 주제의 첫 개념이라 **거버넌스**(조직이 정한 규칙대로 쓰게 다스리는 일)와 **규정 준수**(법·업계·회사가 정한 요구를 지키는 일), **온-프레미스**·**다중 클라우드**·**SaaS**를 짧게 푼다. 소개 문단(흩어진 데이터를 한눈에 본다 — 데이터가 어디 있고 무엇이 민감한지) 뒤 항목 둘: 위험 및 규정 준수 솔루션, 통합 데이터 거버넌스(이름은 step 0 결과대로). 자동으로 데이터를 찾고, 민감한 데이터를 분류하고, 데이터가 어디서 와서 어디로 가는지(계보)를 본다. **Azure Policy와 무엇이 다른가**(데이터를 다스린다 / 리소스의 설정을 다스린다 — 4절, 한 줄). **이 개념에 도식 `PurviewDataMapDiagram`을 붙인다**. 덤프: NO.388의 Purview 진술(있으면) |
| 2 | `sensitivity-labels` | 민감도 레이블 | `purview` | 1 | Microsoft Purview Information Protection이 문서·메일에 붙이는 레이블(이름표 — 한 줄로 푼다). 레이블에 따라 **암호화**와 **표시**(워터마크·머리글·바닥글)가 붙는다. 사용자가 고르거나, 조건(예: 신용카드 번호가 든 문서)에 맞으면 자동으로 붙는다(자동으로 붙이는 범위는 step 0 결과대로). 파일이 회사 밖으로 나가도 암호화가 따라가는가(step 0 결과대로). 예전 이름 Azure Information Protection(AIP)을 한 번만. **Azure Policy가 아니라 이것이 문서를 보호한다**(NO.427). **이 개념에 도식 `SensitivityLabelDiagram`을 붙인다**. 덤프: NO.111, 408, 427 |
| 3 | `azure-policy` | Azure Policy | — | 2 | **리소스**·**리소스 그룹**·**구독**·**관리 그룹**을 짧게 푼다(이 주제에서 처음 쓴다). **정책 정의**(리소스가 지켜야 할 규칙 — 허용 위치, 허용되는 VM 크기, 만들 수 없는 리소스 유형, 꼭 있어야 할 태그 같은 예, 이름은 step 0 결과대로)와 **할당**(그 규칙을 어느 범위에 거는가 — 관리 그룹·구독·리소스 그룹·리소스 하나, 아래로 상속은 한 줄). 기본 제공 정의가 있다. 규칙에 어긋나는 리소스를 **만들거나 바꾸지 못하게 막는다**. **Azure RBAC와 무엇이 다른가**(4절 — 권한이 있어도 정책을 어기면 막힌다, step 0 결과대로). **이 개념에 도식 `PolicyCheckDiagram`을 붙인다**. 덤프: NO.41, 123, 239, 357, 450 |
| 4 | `policy-compliance` | 규정 준수 평가 | `azure-policy` | 2 | 정책은 할당 **전부터 있던** 리소스도 평가한다. 어긋나면 **비준수**로 표시할 뿐 지우거나 옮기거나 멈추지 않는다(NO.215·500·53·239 — step 0 결과대로). 언제 평가하는가(만들거나 바꿀 때, 새로 할당할 때, 주기적으로 — step 0 결과대로). **수정 작업**(일부 정책은 어긋난 리소스를 고친다 — 빠진 태그를 붙이는 예)과 **예외**(특정 리소스를 평가에서 뺀다 — 이름은 step 0 결과대로). 규정 준수 상태를 한곳에서 본다. **이 개념에 도식 `PolicyComplianceDiagram`을 붙인다**. 덤프: NO.53, 215, 239, 500 |
| 5 | `policy-initiatives` | 이니셔티브 | `azure-policy` | 2 | 관련된 정책 정의 여럿을 하나로 묶은 것(이름은 step 0 결과대로 — 「이니셔티브」·「정책 집합」). 한 번에 할당하고, 더 큰 목표의 규정 준수 상태를 함께 본다. 이니셔티브에 정의를 더하면 이미 한 할당에도 들어간다(step 0 결과대로). **관리 그룹과 무엇이 다른가**(구독을 묶는 것 / 정책 정의를 묶는 것 — 4절, 한 줄). Learn의 예는 옛 이름이라 이름을 쓰지 않고 「보안 권장 사항을 살피는 정책들을 묶은 것」처럼 쓴다. 정의 수는 쓰지 않는다. **이 개념에 도식 `PolicyInitiativeDiagram`을 붙인다**. 덤프: NO.24, 36, 321, 442, 498 |
| 6 | `resource-locks` | 리소스 잠금 | — | 3 | 중요한 리소스를 실수로 지우거나 바꾸지 않게 거는 것. 두 종류 — **삭제 잠금**(읽고 고칠 수는 있지만 지울 수 없다)과 **읽기 전용 잠금**(읽을 수만 있다, 표기는 step 0 결과대로). 읽기 전용이 예상 밖의 작업까지 막는 예(step 0 결과대로 한 줄). **역할과 상관없이 적용된다** — 소유자도 먼저 잠금을 풀어야 막힌 작업을 한다(두 단계). 잠금을 거는 곳(포털·PowerShell·CLI·템플릿)은 한 줄. **Azure RBAC·Azure Policy와 무엇이 다른가**(4절, 한 줄). **이 개념에 도식 `LockTypesDiagram`을 붙인다**. 덤프: NO.76, 440 |
| 7 | `lock-inheritance` | 잠금 상속 | `resource-locks` | 3 | 구독·리소스 그룹에 건 잠금은 그 안의 리소스가 물려받는다. 한 리소스에 잠금이 여럿이면 **가장 제한적인 잠금**이 적용된다 — 같은 종류를 여럿 걸 수 있는지, 읽기 전용 위에 삭제 잠금을 더할 수 있는지(NO.106·313·415, step 0 결과대로). **잠긴 리소스가 든 리소스 그룹은 지울 수 없다**(NO.33·69·141·258·330 — 리소스 그룹을 지우면 안의 리소스가 함께 지워진다는 것과 이어서). **이 개념에 도식 `LockInheritanceDiagram`과 표 `GovernanceToolsTable`을 붙인다**. 덤프: NO.33, 69, 106, 141, 258, 313, 330, 415 |

### `azure-management-tools` — 관리 도구 (공식 학습 가이드 「Describe the Azure portal」·「Describe Azure Cloud Shell, Azure CLI, and Azure PowerShell」·「Describe the purpose of Azure Arc」)

순서는 무엇으로 다루는가(관리 도구) → 화면으로(포털) → 브라우저에서 명령으로(Cloud Shell) → 명령 도구 둘(Azure PowerShell, Azure CLI) → Azure 밖까지(Azure Arc).
학습자가 가장 많이 헷갈리는 것은 **Cloud Shell과 Azure CLI·Azure PowerShell**(Cloud Shell은 명령을 실행하는 자리이고, 두 도구가 그 안에 들어 있다), **Azure PowerShell과 Azure CLI**(같은 일을 다른 꼴의 명령으로 한다), **어느 운영 체제·기기에서 무엇을 쓸 수 있는가**(브라우저면 포털과 Cloud Shell을, 설치하면 Windows·Linux·macOS에서 두 명령 도구를), **Azure Arc와 Azure Migrate**(옮기지 않고 관리한다 / 옮긴다)다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 8 | `management-tools` | Azure 관리 도구 | — | 5 | **목록 개념** — 이 주제의 첫 개념이라 **리소스**·**구독**·**리소스 그룹**·**명령줄**(글자로 명령을 입력하는 방식)을 짧게 푼다. 소개 문단(같은 일을 여러 도구로 한다 — 어느 도구로 보내든 요청은 **Azure Resource Manager**(Azure의 배포·관리 서비스 — 한 줄로 푼다)를 거쳐 같은 결과가 된다) 뒤 항목: Azure 포털, Azure Cloud Shell, Azure PowerShell, Azure CLI, Azure 모바일 앱, REST API(같은 꼴로 — 무엇으로 어디서 다루는가). 모바일 앱은 iOS·Android 기기에서 리소스 상태를 보고 VM을 시작·중지하는 것과 Cloud Shell을 여는 것까지(step 4 결과대로). REST API는 프로그램이 요청을 보내는 창구(NO.235). **이 개념에 도식 `ToolAccessDiagram`을 붙인다**. 덤프: NO.55, 99, 100, 176, 220, 235, 275 |
| 9 | `azure-portal` | Azure 포털 | — | 5 | 웹 브라우저로 여는 관리 화면(그래픽 사용자 인터페이스 — 메뉴와 단추). 리소스를 만들고 관리하고 지켜본다, 대시보드를 꾸민다. 브라우저만 있으면 운영 체제와 상관없이 쓴다(NO.445·287 — step 4 결과대로). Azure 데이터 센터마다 있어 한 데이터 센터가 멈춰도 쓸 수 있고 사용자 가까이에서 열린다, **유지 관리로 멈추는 시간 없이** 계속 업데이트된다. 주소(NO.470 — step 4 결과대로). 명령 도구와 무엇이 다른가(화면을 눌러 하나씩 / 명령을 스크립트로 되풀이 — 4절, 한 줄). 도식 없음 — 정의형. 덤프: NO.287, 445, 470 |
| 10 | `cloud-shell` | Azure Cloud Shell | — | 6 | 브라우저에서 여는 **셸**(명령을 입력하고 결과를 받는 프로그램 — 한 줄로 푼다). 설치·설정이 필요 없고, 로그인한 Azure 계정으로 이미 인증되어 있다. **Bash와 PowerShell 가운데 셸을 고르고**, 두 셸 모두에 Azure CLI와 Azure PowerShell이 미리 들어 있다(step 4 결과대로 — Learn과 다르다). 여는 곳 — 포털의 Cloud Shell 아이콘, `shell.azure.com`, 모바일 앱(NO.279·302·325, step 4 결과대로). 파일을 남기려면 스토리지 계정을 붙이고 그 저장 요금이 붙으며, 붙이지 않으면 닫을 때 파일이 지워진다(step 4 결과대로). 휴대폰·태블릿·Chrome OS의 브라우저에서도 연다(NO.43·84·260·420). **이 개념에 도식 `CloudShellDiagram`을 붙인다**. 덤프: NO.43, 84, 169, 256, 260, 279, 302, 325, 420 |
| 11 | `azure-powershell` | Azure PowerShell | — | 6 | **PowerShell**(Microsoft의 셸이자 스크립트 언어)에서 Azure를 다루는 명령 묶음(모듈 — 표기는 step 4 결과대로). **cmdlet**이라 부르는 명령(`New-AzVM` 꼴 — 이름은 step 4 결과대로)이 Azure REST API를 불러 일을 한다. 하나씩 실행하거나 스크립트로 묶어 되풀이·자동화한다. Windows·Linux·macOS에 설치해 쓰고(쓰려면 무엇이 있어야 하는지는 step 4 결과대로 — NO.2·308의 「PowerShell Core 6」 진술 처리), Cloud Shell에도 들어 있다. **Azure PowerShell과 PowerShell은 무엇이 다른가**(셸 / 그 위의 Azure 명령 묶음 — 4절). 도식 없음. 덤프: NO.2, 9, 122, 224, 308 |
| 12 | `azure-cli` | Azure CLI | — | 6 | Azure를 다루는 명령줄 도구, 명령은 `az`로 시작한다(`az vm create` 꼴). **Azure PowerShell과 할 수 있는 일은 같고 명령의 꼴이 다르다** — 어느 쪽에 익숙한가로 고른다(4절). Windows·Linux·macOS에 설치해 쓰고, Windows에 처음부터 들어 있지는 않다(NO.122 — step 4 결과대로). 설치한 뒤 명령 프롬프트·PowerShell·Bash 같은 여러 셸에서 실행한다(NO.265 — Learn의 「Bash 명령」을 step 4 결과로 한정한다). Cloud Shell에도 들어 있다. **이 개념에 표 `CommandToolsTable`을 붙인다**. 덤프: NO.122, 169, 256, 265, 448 |
| 13 | `azure-arc` | Azure Arc | — | 7 | **Azure 밖**(온-프레미스 데이터 센터, 다른 클라우드, 에지)에 있는 서버·Kubernetes 클러스터·SQL Server 같은 것(목록은 step 4 결과대로, **Kubernetes 클러스터**를 한 줄로 푼다)을 Azure Resource Manager에 나타나게 해 Azure 리소스처럼 함께 관리한다 — 포털에서 보고, Azure Policy·역할·태그를 건다. **옮기지 않는다** — Azure Migrate(Azure로 옮기는 도구, 한 줄로 푼다)와 무엇이 다른가(4절). 하이브리드·다중 클라우드를 한 줄로 푼다. **이 개념에 도식 `AzureArcDiagram`을 붙인다**. 덤프: NO.83, 232, 254, 481 |

### `azure-infrastructure-as-code` — ARM과 코드형 인프라 (공식 학습 가이드 「Describe infrastructure as code (IaC)」·「Describe Azure Resource Manager (ARM) and ARM templates」)

순서는 모든 요청이 지나는 곳(Azure Resource Manager) → 손 대신 코드로(코드형 인프라) → Resource Manager가 읽는 파일(ARM 템플릿) → 더 짧게 쓰는 언어(Bicep).
학습자가 가장 많이 헷갈리는 것은 **선언형과 명령형**(무엇이 있어야 하는지만 적는다 / 무엇을 어떤 순서로 할지 적는다 — 템플릿과 스크립트), **Resource Manager와 ARM 템플릿**(요청을 처리하는 서비스 / 그 서비스에 넘기는 파일), **ARM 템플릿과 Bicep**(같은 Resource Manager가 배포한다 — 쓰는 꼴만 다르다)이다. 마지막 개념의 표 `DeploymentMethodsTable`이 세 방식을 나란히 둔다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 14 | `resource-manager` | Azure Resource Manager | — | 9 | 이 주제의 첫 개념이라 **리소스**·**리소스 그룹**·**구독**을 짧게 푼다. Azure의 배포·관리 서비스 — 포털·Azure PowerShell·Azure CLI·REST API·SDK(한 줄로 푼다)에서 보낸 요청을 모두 받아 **인증하고 권한을 확인한 뒤** 그 서비스로 넘긴다. 모든 요청이 같은 API를 지나므로 **도구가 달라도 결과가 같다**(NO.44·417). 이점(리소스를 묶어 한꺼번에 배포·관리, 의존 관계대로 순서, 역할 기반 접근 제어, 태그)은 한 줄씩. **이 개념에 도식 `ResourceManagerDiagram`을 붙인다**. 덤프: NO.44, 417 |
| 15 | `infrastructure-as-code` | 코드형 인프라(IaC) | — | 9 | 인프라(서버·네트워크·저장소 같은 기반 — 한 줄로 푼다)를 손으로 설정하지 않고 **코드와 템플릿**으로 관리하는 방식. Azure CLI·Azure PowerShell 스크립트에서 시작해 템플릿으로 되풀이 가능한 배포로 간다(Learn). **명령형**(무엇을 어떤 순서로 할지 적는다 — 스크립트)과 **선언형**(무엇이 있어야 하는지만 적는다 — 템플릿)을 4절대로. 같은 코드로 여러 환경을 같은 모양으로 만들고 다시 만든다. **이 개념에 도식 `IacEnvironmentsDiagram`을 붙인다**. 덤프: NO.326 |
| 16 | `arm-templates` | ARM 템플릿 | — | 10 | Azure Resource Manager 템플릿(표기는 step 8 결과대로) — 배포할 리소스를 **선언형 JSON** 파일로 적는다(NO.449). 배포하기 전에 검사하고, 리소스끼리 기대는 순서대로·기대지 않는 것은 동시에 만든다(NO.193). 같은 템플릿을 여러 번 배포해도 같은 상태가 된다(step 8 결과대로). 환경마다 다른 값은 매개변수로 받는다(step 8 결과대로 한 줄). 템플릿을 작은 단위로 나눠 다시 쓴다. **이 개념에 도식 `TemplateDeploymentDiagram`을 붙인다**. 덤프: NO.56, 193, 202, 326, 333, 449, 454 |
| 17 | `bicep` | Bicep | `arm-templates` | 10 | Azure 리소스를 배포하는 **선언형 언어**. JSON 템플릿보다 짧고 읽기 쉽다. 배포할 때 ARM 템플릿(JSON)으로 바뀌어 같은 Resource Manager가 처리한다(step 8 결과대로). 모듈로 나눠 다시 쓴다, 같은 파일을 되풀이해 배포해도 같은 상태. **ARM 템플릿과 무엇이 다른가**(쓰는 꼴만 다르고 결과는 같다 — 4절). **이 개념에 표 `DeploymentMethodsTable`을 붙인다** |

**문항 수**: `azure-governance` 11개, `azure-management-tools` 10개, `azure-infrastructure-as-code` 5개 — 모두 26개, `az153`~`az178`.
문항은 개념 순서대로 `questions.json` 끝에 붙인다. step마다 맡는 id와 형식은 아래와 같다 — 균형(「문항」 9항)을 step마다 지키도록 형식과 정답 방향을 미리 나눴다. **형식이나 답의 방향을 바꾸면 그 step 끝에서 균형이 깨지지 않는지 세어 보고 summary에 적는다.**

| step | id | 개념별 수 | 형식(예/아니요는 정답, 4지선다는 `answerIndex`) | step 끝의 예·아니요 / 정답 위치 |
|---|---|---|---|---|
| 1 | `az153`~`az154` | 1 하나, 2 하나 | 153 위치 1 / 154 예 | 39·38 / 19·20·19·19 |
| 2 | `az155`~`az159` | 3 둘, 4 둘, 5 하나 | 155 위치 2 / 156 아니요 / 157 아니요 / 158 위치 0 / 159 위치 3 | 39·40 / 20·20·20·20 |
| 3 | `az160`~`az163` | 6 둘, 7 둘 | 160 아니요 / 161 위치 1 / 162 예 / 163 위치 3 | 40·41 / 20·21·20·21 |
| 5 | `az164`~`az166` | 8 둘, 9 하나 | 164 위치 2 / 165 예 / 166 아니요 | 41·42 / 20·21·21·21 |
| 6 | `az167`~`az171` | 10 둘, 11 둘, 12 하나 | 167 위치 0 / 168 예 / 169 위치 3 / 170 예 / 171 위치 1 | 43·42 / 21·22·21·22 |
| 7 | `az172`~`az173` | 13 둘 | 172 위치 2 / 173 아니요 | 43·43 / 21·22·22·22 |
| 9 | `az174`~`az175` | 14 하나, 15 하나 | 174 예 / 175 위치 0 | 44·43 / 22·22·22·22 |
| 10 | `az176`~`az178` | 16 둘, 17 하나 | 176 위치 3 / 177 아니요 / 178 예 | 45·44 / 22·22·22·23 |

이대로면 phase 끝에 예 45·아니요 44, 정답 위치 22/22/22/23이다.

**예시 값 — 세 주제가 함께 쓴다:**

- **조직 이름**은 「회사 A」·「회사 B」처럼, 팀은 「운영 팀」·「개발 팀」처럼 이름표로 쓴다. 실제 회사 이름을 예로 들지 않는다.
- **리소스 이름표**는 「VM 1」·「리소스 그룹 1」·「구독 1」·「가상 네트워크 1」처럼, 지역은 「지역 A」·「지역 B」처럼 쓴다. 정책의 예는 기본 제공 정의의 한국어 이름(step 0 결과 — 「허용 위치」 같은 것)이나 「지역 A에만 리소스를 만들게 하는 정책」처럼 하는 일로 쓴다. 태그 예는 앞 phase처럼 `Environment`·`CostCenter`를 코드 표기로.
- **레이블 예**는 기본 레이블의 한국어 이름(step 0 결과 — 「기밀」 같은 것)을 쓰거나 「레이블 1」처럼 이름표로 쓴다. 실제 문서 내용·개인정보를 예로 들지 않는다 — 「신용카드 번호가 든 문서」처럼 종류만.
- **명령 예**는 step 4가 확인한 이름(`az vm create`, `New-AzVM`)만 쓴다. 옵션·출력은 쓰지 않는다. **백틱은 개념 본문에서만 쓴다** — 백틱을 코드로 그리는 것은 개념 본문의 `EmphasizedText`뿐이고, 문항(문제문·보기·해설)·도식·표는 글자를 그대로 그려 백틱이 화면에 보인다(설계 때 확인). 그래서 문항·도식·표에는 백틱 없이 「New-AzVM 같은 명령」, 「az로 시작하는 명령」처럼 쓴다. 주소(`portal.azure.com`·`shell.azure.com`)도 같다.
- **환경 이름**은 「개발 환경」·「테스트 환경」·「운영 환경」처럼 쓴다.
- **서비스 이름**은 Microsoft 한국어 문서 표기로 쓰고, 영문 이름이 다르면 처음 나올 때 괄호에 적는다(출처 step이 표기를 확인한다).

도식은 본문에 나온 예시 값만 쓴다(ADR-038) — 그러니 이 값들을 도식에 쓰려면 그 개념의 본문에 먼저 쓴다.

## 출처

- 사실은 `docs/source/azure/official.md`(Microsoft 공식 문서에서 확인한 사실과 URL)에서만 가져온다. 출처 step(0·4·8)이 그 주제에 필요한 사실을 확인해 남긴다. 그 summary가 개념마다 무엇을 쓰고 무엇을 쓰지 않는지 적는다.
- 덤프·용어집의 주장이 `docs/source/azure/corrections.md`에 걸려 있으면 **고친 쪽**을 쓴다. 덤프·용어집에만 있고 공식 문서가 말하지 않는 주장은 쓰지 않는다.
- 개념 step에서 그 밖의 사실이 필요하면, 허용한 출처(`docs/source/azure/CLAUDE.md` 「허용하는 출처」)를 실제로 열어 확인하고 `official.md`에 URL과 「쓰인 곳」을 적은 뒤 쓴다.
  받은 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다. 인증서 오류는 「배경」의 `SSL_CERT_FILE`).
  확인하지 못한 사실은 쓰지 않는다. 블로그·Microsoft Q&A·Tech Community·위키백과·자격증 교재·덤프 사이트는 쓰지 않는다.
- **`official.md`의 「쓰인 곳」**: 출처 step은 아직 개념이 없으므로 「쓰일 곳」으로 적는다. 그 개념을 만든 step이 자기 개념 id가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.
- **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 덤프의 문제문·보기·해설, 용어집 설명, 공식 문서(특히 한국어판)의 문장을 옮기지 않는다. `check-verbatim --subject azure`는 하한선일 뿐이다.
- 덤프 문항을 그대로 문항으로 만들지 않는다 — 덤프가 같은 사실을 물어도 상황과 문장은 직접 만든다(ADR-021과 같은 이유).

설계 세션이 받아 둔 공식 문서(`docs/source/azure/raw/official/`, 영문판과 한국어판 `ko-…`):

- Learn 「Describe features and tools in Azure for governance and compliance」 — `learn-describe-features-tools-azure-for-governance-compliance-{1-introduction, 2-describe-purpose-microsoft-purview, 3-describe-purpose-azure-policy, 4-describe-purpose-resource-locks, 6-describe-purpose-service-trust-portal, 8-summary}.md`와 `ko-` 판. 단원 6(서비스 신뢰 포털)은 쓰지 않는다 — 받아 둔 것은 전사 검사의 원본으로 두려는 것이다.
- Learn 「Describe features and tools for managing and deploying Azure resources」 — `learn-describe-features-tools-manage-deploy-azure-resources-{1-introduction, 2-describe-interacting-azure, 3-describe-purpose-of-azure-arc, 4-describe-azure-resource-manager-azure-arm-templates, 6-summary}.md`와 `ko-` 판.
- 제품 문서(설계 때 받음): `docs-information-protection-what-is.md`(AIP의 현재), `docs-purview-sensitivity-labels.md`, `docs-azure-portal-mobile-app-overview.md`, `docs-cloud-shell-overview.md`, `docs-cloud-shell-features.md`, `docs-bicep-overview.md`, `docs-arm-templates-overview.md`, `blueprints-overview.md`(지원 종료의 근거).
- 앞 phase가 받음: `docs-policy-overview.md`(`ko-`도), `docs-azure-resource-manager-management-lock-resources.md`(`ko-`도), `docs-azure-portal-overview.md`(`ko-`도), `docs-cli-what-is-azure-cli.md`(`ko-`도), `docs-cli-az-vm.md`, `docs-powershell-what-is-azure-powershell.md`(`ko-`도), `docs-azure-arc-overview.md`(`ko-`도), `docs-arm-overview.md`(`ko-`도), `docs-arm-tag-policies.md`, `docs-management-groups-overview.md`.
- AZ-900 학습 가이드 — `az-900-study-guide.md`.

설계 때 열어 보지 않았지만 출처 step이 받을 곳(주소는 출발점이고, 옮겨졌으면 같은 내용의 현행 쪽을 찾는다). 앞에 `learn.microsoft.com/en-us/`를 붙인다:
주제 17 — `azure/governance/policy/concepts/assignment-structure`, `azure/governance/policy/concepts/effect-basics`(효과의 이름은 쓰지 않는다 — 거부·감사·수정이 무엇을 하는지만), `azure/governance/policy/how-to/remediate-resources`, `azure/governance/policy/concepts/exemption-structure`, `azure/governance/policy/concepts/initiative-definition-structure`, `azure/governance/policy/how-to/get-compliance-data`, `azure/governance/policy/samples/built-in-policies`(이름 표기), `purview/purview`, `purview/information-protection`, `purview/apply-sensitivity-label-automatically`, `purview/encryption-sensitivity-labels`, `purview/sensitivity-labels-office-apps`(표시), `purview/concept-data-lineage`(계보, 옮겨졌으면 현행 쪽).
주제 18 — `cli/azure/install-azure-cli`, `cli/azure/choose-the-right-azure-command-line-tool`, `powershell/azure/install-azure-powershell`, `powershell/azure/get-started-azureps`, `azure/cloud-shell/get-started/classic`(또는 현행 시작 쪽), `azure/cloud-shell/persisting-shell-storage`, `azure/azure-portal/azure-portal-dashboards`, `azure/azure-arc/servers/overview`, `azure/azure-arc/kubernetes/overview`, `rest/api/azure/`.
주제 19 — `azure/azure-resource-manager/templates/syntax`, `azure/azure-resource-manager/templates/deployment-modes`(같은 템플릿을 되풀이할 때의 근거만 — 모드 이름은 쓰지 않는다), `azure/azure-resource-manager/bicep/compare-template-syntax`, `devops/deliver/what-is-infrastructure-as-code`.

## 글 — `docs/WRITING_GUIDE.md`를 따른다(ADR-056, ADR-060)

- `summary`는 WRITING_GUIDE 2절 — 처음 보는 사람이 일상 말로 「무엇이고 무슨 역할인지」 알게 하는 한 문장. 다른 전문용어를 알아야 이해되면 안 되고, 제목 낱말을 되풀이하는 순환 정의, 숫자·분류를 넣지 않는다.
- `paragraphs`는 3절의 흐름(개념 → 원리 → 예시 → 특징)을 필요한 만큼. 누가·무엇을·어디서 어디로를 빠뜨리지 않는다. 같은 말을 되풀이하지 않는다.
  헷갈리는 짝은 4절대로 무엇이 다르고 왜 나눠 부르는지를 말한다 — 이 phase의 짝: Microsoft Purview와 Azure Policy, 민감도 레이블과 Azure Policy, Azure Policy와 Azure RBAC, 새 리소스(막는다)와 이미 있던 리소스(비준수로 표시한다), 이니셔티브와 관리 그룹, 삭제 잠금과 읽기 전용 잠금, 리소스 잠금과 역할,
  Cloud Shell과 두 명령 도구, Azure PowerShell과 Azure CLI, Azure PowerShell과 PowerShell, 포털과 명령 도구, Azure Arc와 Azure Migrate, Resource Manager와 ARM 템플릿, 명령형과 선언형, ARM 템플릿과 Bicep.
- **이 주제 화면만 읽고 뜻이 서야 한다.** 학습자는 주제 목록에서 아무 주제로나 바로 들어오므로, 다른 주제에 정의가 있다는 것은 도움이 되지 않는다.
  이 주제 안에서 처음 쓰는 낱말(리소스, 구독, 리소스 그룹, 관리 그룹, VM, 역할, 태그, 셸, 스크립트, 온-프레미스, JSON 등)은 그 자리에서 짧게 푼다. 앞 phase 주제가 푼 낱말도 이 주제에서는 다시 푼다.
  앞 step이 같은 주제에서 이미 푼 낱말은 다시 풀지 않는다 — 쓰기 전에 그 주제의 앞 개념을 읽는다. 도식의 라벨·곁말·캡션과 표의 칸도 화면의 글이다.
- **진행 안내 문장을 쓰지 않는다**(「배경」). 다른 주제나 뒤 개념을 가리키는 말이 필요하면 그 낱말을 그 자리에서 한 줄로 풀고, 「~에서 다룬다」·「~에서 자세히」·「다음 개념의」·「(다음 개념)」을 붙이지 않는다.
- 비유는 이해를 돕는 데만 쓰고, 실제 동작과 다르면 그 자리에서 밝힌다. 비유로 사실을 대신하지 않는다.
- `name`은 명사구다(ADR-030 기준 1). **굵은 글씨(`**`)는 목록 항목의 이름에만** 쓴다(ADR-055와 같은 규칙, ADR-060). 목록 개념은 소개 문단 하나 뒤에 `- **한국어 이름**(English name)은 …` 꼴 항목을 두고, 항목은 혼자 서지 않는다(ADR-046).
  `EmphasizedText`는 `**…**` 안의 백틱을 코드로 그리지 않으므로 굵은 이름 안에 백틱을 넣지 않는다.
- 관용 표현(`돌린다`·`띄운다`·`태운다`·`물린다`)을 쓰지 않고 하는 일을 그대로 쓴다(ADR-030 기준 5). 평서문 「~다」로 쓴다. 「A vs B」 제목은 쓰지 않는다. 명령을 「돌린다」고 쓰지 말고 「실행한다」고 쓴다.
- 공식 문서의 마케팅 어조(「지능적으로」, 「원활한」, 「강력한」, 「통합된 단일 창」, 「손쉽게」를 꾸밈말로)를 옮기지 않는다 — 무엇이 어떻게 되는지를 쓴다.

## 문항 — WRITING_GUIDE 「객관식 문제의 문장과 선택지 구성 원칙」과 ADR-054·ADR-030

가장 중요한 원칙: **질문은 쉽게 이해할 수 있도록, 선택은 충분한 생각이 필요하도록.**

1. **정의에서 이름만 지운 「무엇인가?」 꼴을 내지 않는다.** 개념에 맞는 방식 하나를 고른다 — 개념 확인, 원리 이해, 상황 적용, 개념 비교, 원인과 결과. 고른 방식과 이유를 summary에 적는다.
2. **사람이 사람에게 묻듯 쓴다.** 소리 내어 읽어 어색하거나 한 번에 이해되지 않으면 다시 쓴다. 쉼표로 조건을 줄줄이 잇는 압축문을 쓰지 않는다.
3. 무엇을 묻는지는 첫 읽기에 분명하고, 어려움은 보기를 고르는 데서 나온다. 문제문을 비틀어 난이도를 만들지 않는다.
4. 보기는 기술적으로 갈리고 정답은 하나다. 비슷한 개념을 보기로 둘 때는 그 차이를 판단할 조건을 문제문에 준다. 오답은 문제문이 묻는 범주 안에서, 실제로 헷갈리는 것에서 고른다(ADR-030 기준 4).
   정답의 이름이나 그 일부를 문제문에 쓰지 않는다(기준 3). 보기 넷은 서로 다르다.
   **두 개념이 함께 맞게 읽힐 수 있는 상황을 만들지 않는다** — 이 phase에서 특히:
   「리소스를 함부로 못 바꾸게 하고 싶다」는 Azure Policy에도 리소스 잠금에도 Azure RBAC에도 맞다 — 규칙에 맞는 모양만 허용하려는가, 실수로 지우거나 바꾸는 일을 막으려는가, 사람마다 할 수 있는 일을 나누려는가를 준다.
   「여러 정책을 한꺼번에 관리하고 싶다」는 이니셔티브에도 관리 그룹에도 맞다 — 정책 정의를 묶는가, 구독을 묶는가를 준다.
   「설치 없이 명령을 실행하고 싶다」는 Cloud Shell에, 「같은 일을 Azure CLI로」는 Cloud Shell 안의 Azure CLI에도 설치한 Azure CLI에도 맞다 — 설치할 수 있는가, 어느 기기인가를 준다. Cloud Shell은 두 명령 도구를 모두 담으므로, 명령의 꼴로 도구를 묻는 문항에 Cloud Shell을 오답으로 두지 않는다.
   「온-프레미스 서버를 Azure에서 다루고 싶다」는 Azure Arc에도 Azure Migrate에도 맞다 — 서버를 그 자리에 두는가, 옮기는가를 준다.
   「같은 환경을 되풀이해 만들고 싶다」는 ARM 템플릿에도 Bicep에도 스크립트에도 맞다 — 무엇이 있어야 하는지만 적는가, 순서를 적는가, 어떤 파일 형식인가를 준다.
5. 판단에 쓰이지 않는 정보(전문용어·수치·조건·부정문)를 늘어놓지 않는다. 판단에 필요한 조건은 남긴다.
6. **형식(ADR-054)**: 흔히 오해하는 것을 바로잡으면 예/아니요, 비슷한 개념을 구별하거나 상황에 맞는 것을 고르면 4지선다. 같은 범주의 그럴듯한 오답 셋을 출처 안에서 쓸 수 없으면 예/아니요.
   예/아니요는 주장 하나, 이중 부정·「항상」「절대」 금지, 「~인가요?」「~나요?」로 끝난다. **아니요 문항의 해설은 무엇이 틀렸는지에서 그치지 않고 맞는 사실을 가르친다.**
   예/아니요의 주장은 맞는 쪽으로도 틀린 쪽으로도 세울 수 있다 — 아래 균형을 맞추려고 주장의 방향을 고른다. 부정형으로 묻지 않는다(「쓸 수 없나요?」 대신 「쓸 수 있나요?」).
7. **문항은 풀면서 배우게 쓴다.** 문항은 섞여 나오고 랜덤 세트는 일부만 뽑으므로 혼자 읽혀야 한다. 문제문이 이 주제 밖의 낱말을 풀이 없이 전제하지 않는다(기준 5).
   상황에 쓰는 이름(「회사 A」)·숫자는 사실 주장이 아니어야 하고, 그 상황의 정답은 출처의 사실로 정해져야 한다. 문항 상황은 본문 예와 다르게 만들어 본문 문장을 외워서 풀리지 않게 한다.
8. **해설은 187자 이상**이고 그 개념을 가르치는 글이다(ADR-026·027). 4지선다는 정답이 왜 맞는지와 오답 셋이 각각 왜 아닌지를 담는다. 약어는 해설마다 처음 쓸 때 풀어 쓴다.
   같은 말을 늘려 길이를 채우지 않는다. 해설의 사실은 개념 본문이나 `official.md`에 있는 것이다.
9. **균형 — step이 끝났을 때 과목 전체에서**: 예/아니요의 예와 아니요 수 차이 **1 이하**, 4지선다의 정답 위치(`answerIndex` 0~3) 수의 최대·최소 차이 **2 이하**.
   phase 107 시작 때는 문항 152개, 예 38·아니요 38, 정답 위치 19/19/19/19다. step마다의 형식은 「세 주제와 개념 17개」의 표대로다.
10. 한 문항은 개념 하나만 묻는다(ADR-030 기준 2). 같은 개념의 두 문항은 서로 다른 것을 묻는다. 앞 phase의 문항(특히 `az023` 포털과 PowerShell, `az054` 역할 할당의 범위, `az128` Defender for Cloud와 Azure Arc, `az149` 태그 상속)과 같은 것을 묻지 않는다.
11. 답을 흘리는 꼴을 피한다 — 놀람을 담아 답의 방향을 알리는 꼴(「…인데도 …되나요?」), 문제문의 「…만으로」, 「…뒤에도」, 「…도」(예: 「PowerShell을 골라도 쓸 수 있나요?」), 「별도로 확인하지 않아도」처럼 답의 방향을 암시하는 말, 정답 보기만 문제문의 낱말을 되풀이하는 것, **오답 셋만 같은 말로 시작해 정답만 꼴이 다른 것**(phase 103 `az056`·`az060`·`az068`·`az070`·`az077`·`az080`), **보기 이름만으로 셋이 빠지는 것**(phase 106 `az150`).
12. 덤프 문항의 문장·보기 구성을 옮기지 않는다. 덤프가 되풀이하는 꼴(「다음 진술이 맞으면 예」 세 개 묶음, 「해결책: …, 목표를 이루나?」 연작, 밑줄 친 말 고치기, 짝짓기, 운영 체제별 도구 표)도 쓰지 않는다 — 앱의 형식은 4지선다와 예/아니요 하나씩이다.

검수 — 문항마다 WRITING_GUIDE 객관식 7항의 여섯 질문으로 다시 읽고, 보기마다 「이것이 정답이라고 우길 수 있는가」를 따진다. 문제문만 읽고 보기를 보지 않은 채 정답 글자를 짐작할 수 있지 않은지도 본다.

## 도식 — 구조·흐름이 있는 개념 13개에 하나씩, 표 셋

선례는 앞 phase의 Azure 도식(`RbacScopeDiagram`·`BudgetAlertDiagram`·`TagInheritanceDiagram`·`SpendingLimitDiagram`·`AzureMigrateDiagram`과 그 `.test.tsx`, `src/data/azure/visuals/*.json`)이다. 표는 `azureCostManagementTables.tsx`와 그 테스트를 본다.
규칙의 근거는 UI_GUIDE 「도식 전용 색상」·「도식」 절 전체, ADR-036·037·038·047·048, `src/components/diagrams/CLAUDE.md`다.
사용자 미리보기 승인을 받지 않고 **step이 좌표를 설계한다.** 그래서 기계 검사를 모두 통과시키고 설계를 summary에 남긴다.

| 도식 | JSON 키 | 개념 | step | 요지 |
|---|---|---|---|---|
| `PurviewDataMapDiagram` | `purview-data-map` | `azure-governance.purview` | 1 | 여러 곳에 흩어진 데이터를 한곳에서 — 찾기, 분류, 계보 |
| `SensitivityLabelDiagram` | `sensitivity-label` | `azure-governance.sensitivity-labels` | 1 | 레이블을 붙인 문서에 무엇이 따라가는가 — 암호화, 표시 |
| `PolicyCheckDiagram` | `policy-check` | `azure-governance.azure-policy` | 2 | 규칙에 맞는 요청은 만들어지고, 어긋난 요청은 거부된다 — 권한이 있어도 |
| `PolicyComplianceDiagram` | `policy-compliance` | `azure-governance.policy-compliance` | 2 | 이미 있던 리소스는 비준수로 표시될 뿐 — 수정 작업, 예외 |
| `PolicyInitiativeDiagram` | `policy-initiative` | `azure-governance.policy-initiatives` | 2 | 정의 여럿을 하나로 묶어 한 번에 할당 |
| `LockTypesDiagram` | `lock-types` | `azure-governance.resource-locks` | 3 | 삭제 잠금과 읽기 전용 잠금 — 읽기·고치기·지우기 |
| `LockInheritanceDiagram` | `lock-inheritance` | `azure-governance.lock-inheritance` | 3 | 리소스 그룹의 잠금이 안으로 — 리소스 그룹을 지우려 할 때 |
| `ToolAccessDiagram` | `tool-access` | `azure-management-tools.management-tools` | 5 | 브라우저·설치한 컴퓨터·휴대폰에서 각각 무엇으로 — 모두 같은 곳을 지난다 |
| `CloudShellDiagram` | `cloud-shell` | `azure-management-tools.cloud-shell` | 6 | 브라우저 → 셸 고르기 → 두 명령 도구가 이미 들어 있다 |
| `AzureArcDiagram` | `azure-arc` | `azure-management-tools.azure-arc` | 7 | Azure 밖의 서버가 그 자리에 있으면서 Azure에서 함께 관리된다 |
| `ResourceManagerDiagram` | `resource-manager` | `azure-infrastructure-as-code.resource-manager` | 9 | 어느 도구로 보내든 같은 관문 — 인증·권한 확인 → 서비스 |
| `IacEnvironmentsDiagram` | `iac-environments` | `azure-infrastructure-as-code.infrastructure-as-code` | 9 | 손으로 설정한 환경과 코드 한 벌로 만든 환경 |
| `TemplateDeploymentDiagram` | `template-deployment` | `azure-infrastructure-as-code.arm-templates` | 10 | 템플릿 하나 → 검사 → 기대는 순서대로·동시에 → 다시 배포해도 같은 상태 |

표 — 파일 `src/components/diagrams/azureGovernanceTables.tsx`·`azureManagementToolsTables.tsx`·`azureInfrastructureAsCodeTables.tsx`(주제마다 하나):

| 표 | JSON `tables` 키 | 개념 | step | 열 |
|---|---|---|---|---|
| `GovernanceToolsTable` | `governance-tools` | `azure-governance.lock-inheritance` | 3 | 도구 · 정하는 것 · 막는 일 |
| `CommandToolsTable` | `command-tools` | `azure-management-tools.azure-cli` | 6 | 도구 · 명령의 꼴 · 실행하는 곳 |
| `DeploymentMethodsTable` | `deployment-methods` | `azure-infrastructure-as-code.bicep` | 10 | 방식 · 적는 것 · 파일 |

- **파일**: 컴포넌트는 `src/components/diagrams/<이름>Diagram.tsx`(이름이 `Diagram.tsx`로 끝나야 교차 검사와 커버리지 테스트가 도식으로 본다), 테스트는 같은 이름의 `.test.tsx`.
  문구(물음형 제목 `question`·노드 라벨·그룹 라벨·곁말·캡션·`idleCaption`·`legend`·figure `label`·`svgLabel`·시나리오·`sources`)는 그 주제의 `src/data/azure/visuals/<주제 id>.json`의 `diagrams["<키>"]`에 둔다.
  `glossary`는 빈 배열이다(ADR-037). 도식 이름과 키는 위 표대로다 — 이미 있는 이름과 겹치지 않는 것을 골라 두었다(AWS의 `PolicyEvaluationDiagram`이 있어 Azure Policy 쪽은 `PolicyCheck`·`PolicyCompliance`다).
- **표**: 위 「표」 표의 파일에 함수를 둔다(주제마다 파일 하나), 테스트는 같은 이름의 `.test.tsx`. `azureCostManagementTables.tsx`처럼 `ComparisonTableFigure`에 JSON의 `tables["<키>"]`를 넘긴다.
  열은 셋 이하(첫 열이 행 머리), `columnWidths`는 열 수만큼의 백분율이고 합이 100%다(`visuals.test.ts`).
  열 폭은 스크롤 막대가 낀 320px(표 폭 약 273px)에서 가장 긴 덩어리(띄어쓰기 없이 이어진 글자)가 들어가게 어림해 정하고, 그 계산을 summary에 적는다(실측은 phase 끝에 한다). **표 칸에는 백틱을 쓰지 않는다** — `ComparisonTableFigure`는 칸의 글자를 그대로 그려 백틱이 화면에 보인다.
- **사실은 본문에만 있는 것**(ADR-036). 캡션·곁말·라벨·표 칸의 사실마다 그 개념(과 같은 주제의 다른 개념) 본문의 문단을 근거로 댈 수 있어야 한다. 예시 값도 본문에 나오는 것만(ADR-038).
  「회사 A」·「지역 A」·「VM 1」처럼 대상을 가르는 이름표는 사실이 아니므로 써도 된다. 글과 도식을 같은 step이 만드므로, 도식에 필요한 사실은 **글에 먼저 쓴다** — 출처에 없으면 그리지 않는다.
- **말**: 노드 라벨·곁말은 본문에 쓰인 말과 같게 쓴다. 라벨을 줄이거나 영문 약어로 바꿔 폭을 맞추지 마라 — 노드를 넓히거나 배치를 바꾼다. (본문이 「코드형 인프라(IaC)」처럼 약어를 함께 세웠으면 라벨에 그 약어를 써도 된다.)
- **글자 크기**: 노드 라벨 10, 그룹 라벨·곁말 9(viewBox 단위). `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`. 노드 높이는 32다(교차 검사기가 32로 본다 — 키 큰 노드를 만들지 말고 그룹 박스를 쓴다).
- **글자 폭의 여유**: `estimateTextWidth`는 반각 문자(영문·숫자·기호)를 0.55em으로 보지만 실제 화면에서는 0.61em까지 넓다(phase 72 화면 실측).
  반각 문자가 섞인 노드 라벨·곁말·그룹 라벨(예: `VM 1`, `Azure Policy`, `Azure Resource Manager`, `Cloud Shell`)은 `estimateTextWidth` 값의 **1.15배**를 폭으로 잡아 노드 폭·배치를 정하고, 그 범위가 둘레 박스와 `viewBox` 안에 들게 한다.
  이 phase는 영문 이름이 많다 — 세로형(폭 280)에 `Azure Resource Manager`(약 22자)처럼 긴 라벨은 노드 하나가 폭 대부분을 쓰므로, 나란히 두지 말고 위아래로 쌓는다.
- **그룹 박스 안의 그룹 박스**(구독 안의 리소스 그룹 등): 안쪽 박스의 라벨 영역이 바깥 박스의 라벨 영역과 겹치지 않게 위아래로 떼고, 노드는 자기를 담는 가장 안쪽 박스의 라벨 영역 아래에 둔다.
  세로형(폭 280)에서 나란히 두기 어려우면 위아래로 쌓는다 — 폭을 맞추려고 라벨을 줄이지 않는다.
- **색**: 노드는 모두 회색(`stroke-disabled`, 선례와 같은 클래스). 도식 전용 두 색(`diagram-managed`·`diagram-resource`)은 AWS 계층의 뜻이라 쓰지 않는다. 초록·빨강·주황, 16진 색, 이모지, O/X, 자물쇠 그림도 쓰지 않는다(ADR-036).
  강조는 opacity로만 한다 — 선택 밖 노드 `0.25`, 그룹 박스는 흐려지지 않는다. 나쁜 상태(거부된 요청, 비준수 리소스, 지울 수 없는 리소스 그룹)는 색이 아니라 곁말과 흐림으로 보인다(UI_GUIDE 「수량과 상태를 바꾸는 도식」).
- **두 배치**: 세로형(`viewBox` 폭 280)과 가로형(폭 440)을 함께 만든다. 가로형은 `useWideDiagram()`이 `true`일 때 쓴다. `nodes`·`wideNodes`·경로·`wideGroups`·`wideNotes`를 **한 줄에 하나씩 글자 그대로** 적는다 —
  반복문이나 계산으로 만들지 마라(교차 검사기가 글자로 읽는다). 노드 id·경로 id·시나리오·문구는 두 배치가 함께 쓰고, 고른 시나리오는 배치가 바뀌어도 유지된다.
- **경로**: 직교(M/H/V)만, 노드 변에서 시작하고 끝나며, 다른 노드 상자 안을 지나지 않는다. 늘 보이는 연결선도 같은 경로 선언 꼴(`'id': 'M…'`)로 적는다.
  화살표 마커는 선례와 같고 마커 id는 `useId`로 만든다. 그룹 라벨 영역을 지나는 선분이 없어야 한다. 경로는 그룹 박스가 아니라 노드에서 시작하고 끝난다 — 그룹 전체를 가리키는 것은 선이 아니라 그룹 안에 둔 노드나 곁말로 보인다.
  `phases/38-service-diagrams/tools/check-path-crossings.mjs`는 `*Diagram.tsx`의 `const nodes = [`·`const wideNodes = [` 블록에서 `{ id: '…', x: N, y: N, width: N` 순서를, 경로 객체에서 `'id': 'M…'`를 정규식으로 읽는다. 이 형식을 지켜라.
- **물음형 제목**(ADR-038): 그림이 답하는 것 하나를 학습자의 말로. step 문서의 예는 바꿔도 된다.
- **시나리오**: step 문서에 적힌 시나리오를 둔다. 시나리오가 있는 도식은 `전체`(아무것도 고르지 않음)에서 노드가 모두 선명하다.
  두 시나리오의 「선명한 노드 + 보이는 경로 + 보이는 곁말」이 같으면 그 시나리오는 아무것도 가르지 못한다 — 다르게 설계한다. 캡션은 20자를 넘는다(`visuals.test.ts`).
  **한 장면에서 흐리게 둔 노드가 「멈췄다」·「없어졌다」로 읽히지 않는지 본다** — phase 106 마무리에서 두 캡션을 고쳤다(`BudgetAlertDiagram`·`SpendingLimitDiagram`). 그 장면이 일부만 밝히는 것이면 캡션에 그렇다고 쓴다.
- **금지**: SVG 두 개를 그려 놓고 CSS로 하나를 숨기지 마라. 기준 폭 문자열(`'(min-width: 768px)'`)을 도식 파일에 쓰지 마라(ADR-047). 흐르는 점·자동 재생 같은 애니메이션 금지.
  공용 컴포넌트(`DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`)와 교차 검사기, `src/lib/svg-bounds.ts`를 고치지 마라.
- **registry**: `src/components/diagrams/registry.ts`의 `diagramsByConceptId`에 `'<개념 id>': <컴포넌트>` 한 줄씩(도식과 표가 함께 붙는 개념은 선례처럼 배열). import는 기존 정렬(모듈 경로 알파벳순),
  키는 기존 Azure 키들(`azure-cost-management.spending-limit`) 뒤에 개념 순서대로.
- **주제의 시각 요소 파일**: 주제를 만드는 step(1·5·9)이 `src/data/azure/visuals/<주제 id>.json`(`{ "diagrams": {}, "tables": {}, "glossary": [] }` 꼴)을 만들고
  `src/data/azure/index.ts`의 `visualsByTopicId`에 `'<주제 id>'`로 넣는다. import 이름은 `azureGovernanceVisuals`·`azureManagementToolsVisuals`·`azureInfrastructureAsCodeVisuals`,
  import 줄은 경로 알파벳순, `visualsByTopicId`의 항목은 주제 순서대로.

- **테스트가 본문에서 라벨을 찾을 때**: 도식의 사실·라벨이 본문에 있는지 보는 테스트를 맞추려고 문장에 라벨을 끼워 넣지 마라(phase 104 「보고서를 만드는 읽는 앱」). 라벨을 본문의 자연스러운 말로 정하거나 문장을 제대로 다시 쓴다.

### 도식 테스트 — 도식마다 먼저 쓰고 실패를 확인한 뒤 구현한다

`<이름>Diagram.test.tsx` — 선례와 같은 관문을 건다. 세로형은 `matchMedia` 없이, 가로형은 `describe('가로형 (768px 이상)', …)` 안에서만 `vi.stubGlobal('matchMedia', …)`.

1. 물음형 제목이 시나리오 버튼보다 앞에 보인다(헤딩이 아니다).
2. 처음(`전체`)에는 노드가 모두 선명하다. 시나리오에만 쓰이는 경로는 보이지 않는다(늘 보이는 연결선은 보인다).
3. 시나리오마다 선명한 노드 집합, 보이는 경로, 보이는 곁말, 캡션이 JSON·step 문서의 설계와 같다. 선택 밖 노드는 opacity `0.25`, 그룹 박스는 흐려지지 않는다.
4. 모든 `rect`가 `boxesOutsideViewBox`로 `viewBox` 안이고, 노드 라벨이 `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`이다. 곁말·그룹 라벨은 `estimateTextWidth(문구, 9)`로 잰 가로 범위가 `viewBox` 안이다.
   그룹 박스 안의 그룹 박스는 안쪽이 바깥쪽 안에 들어 있다.
5. 경로의 끝점이 노드 변 위에 있고, 어떤 선분도 다른 노드 상자 안과 그룹 라벨 영역을 지나지 않는다.
6. **그 도식의 요점** — step 문서에 도식마다 적힌 「요점 테스트」.
7. 두 번 렌더해도 화살표 마커 id가 겹치지 않는다. JSON의 시나리오 id 집합과 컴포넌트의 것이 같고, 문구를 JSON에서 읽는다.
8. `ConceptList`에 앵커 개념을 주면 본문 뒤에 이 도식이 온다.
9. 가로형: `viewBox` 폭 440, 래퍼에 `w-full`이 있고 `max-w-[380px]`·`-mx-4`가 없다. 노드·그룹 id 집합과 경로 id 합집합이 세로형과 같고, 3~6번을 가로형에서도 통과한다. 폭이 바뀌어도 고른 시나리오와 캡션이 유지된다.

경로가 없는 도식은 경로에 관한 항목(2의 경로 부분, 5)을 「경로가 없다」로 바꿔 건다.

표 테스트(`azureGovernanceTables.test.tsx`·`azureManagementToolsTables.test.tsx`·`azureInfrastructureAsCodeTables.test.tsx`)는 선례 `azureCostManagementTables.test.tsx`와 같은 것을 본다 — 로더·`glossary`, 이름·열·`columnWidths`·근거(`sources`), 행 순서와 칸 문구, `colgroup`, `ConceptList` 배치.

## 파일 형식

- `topics.json`: 주제 객체는 2칸 들여쓰기, `concepts` 배열의 개념은 **한 줄에 하나**(6칸 들여쓰기 + `JSON.stringify(concept)`). 개념 키 순서는 `id`, `parentId`(있을 때), `name`, `summary`, `paragraphs`.
  주제 키 순서는 `id`, `title`, `importance`, `sourcePages`, `concepts`. 앞 step이 쓴 줄과 다른 주제의 줄은 글자 하나도 바꾸지 않고, 자기 개념을 그 주제의 `concepts` 끝에 덧붙인다.
  주제를 만드는 step은 바로 앞 주제 객체의 닫는 줄 `  }`을 `  },`로 바꾸고 그 뒤에 새 주제를 덧붙인다 — 그 밖의 기존 줄은 바꾸지 않는다.
- `questions.json`: `[` 다음 줄부터 **한 줄에 문항 하나**, 마지막 줄 뒤에 `]`. 키 순서 — 4지선다 `id`, `topicId`, `conceptId`, `format`, `prompt`, `choices`, `answerIndex`, `explanation` /
  예/아니요 `id`, `topicId`, `conceptId`, `format`, `prompt`, `answer`, `explanation`. 기존 줄은 바꾸지 않고 끝에 덧붙인다(마지막 기존 줄 끝에 쉼표 하나를 더하는 것은 예외).
- 파일 끝 줄바꿈 하나. 스크립트로 쓸 때 CRLF로 바꾸지 않는다.
- 이 저장소의 TDD 훅은 테스트 파일 없이 새 `.js`·`.ts` 파일을 쓰지 못하게 막는다. 데이터를 고치는 일회용 스크립트가 필요하면 저장소 밖(임시 디렉터리)에 `.cjs`로 두거나 `node -e`를 쓴다.

## 개념을 넣는 step(1~3·5~7·9·10)의 공통 AC와 검증

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject azure
node -e "const q=require('./src/data/azure/questions.json');const yn=q.filter(x=>x.format==='yes-no');const ch=q.filter(x=>x.format==='choice');const pos=[0,1,2,3].map(i=>ch.filter(x=>x.answerIndex===i).length);console.log('문항',q.length,'마지막',q[q.length-1].id,'정답 위치',pos.join('/'),'예',yn.filter(x=>x.answer).length,'아니요',yn.filter(x=>!x.answer).length)"
git status --porcelain
```

- `check-verbatim`은 「전사 이상 없음」이고 **원본 655개 이상을 대조했다고 나와야 한다**(`raw/`가 없으면 「건너뜀」으로 통과하므로 그때는 blocked로 멈춘다). 균형은 위 「문항」 9항,
  교차 검사기는 「교차 없음」이고 노드·경로 수가 이 step이 더한 만큼 늘어야 한다(앞 step이 끝났을 때의 수는 그 step summary에, phase 시작 값은 「배경」에 있다). **검사기를 고쳐서 통과시키지 마라.**
- **바뀌지 않아야 하는 것을 기계로 확인한다** — `git show HEAD:src/data/azure/topics.json`·`questions.json`과 `visuals/*.json`을 지금 파일과 node로 읽어, 기존 주제 객체·기존 개념·기존 문항·기존 도식 문구가 통째로 같은지 본다.
  AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `git diff --stat`에 나오지 않아야 한다.
- **글로 읽는다** — 그 주제의 개념을 처음부터 이 step의 개념까지 처음 배우는 사람의 눈으로 통독하고, 풀이 없이 처음 나오는 낱말을 세어 본다(도식 문구 포함). 진행 안내 문장이 없는지도 본다.
  불변식과 테스트는 이런 결함을 잡지 못한다. 브라우저 화면 실측은 하지 않는다(「배경」의 시간 제한 — phase 끝에 메인 세션이 한다).
- 이모지·O/X·빨강·초록·주황·도식 전용 두 색·16진 색·애니메이션·기준 폭 문자열이 새 파일에 없는지 `grep`으로 본다.
- 바뀐 파일은 `src/data/azure/topics.json`·`questions.json`·`visuals/<주제>.json`(과 주제를 만드는 step은 `src/data/azure/index.ts`), 새 도식 컴포넌트와 테스트(step 3·6·10은 표 컴포넌트와 테스트),
  `src/components/diagrams/registry.ts`, `docs/source/azure/official.md`(「쓰인 곳」과 더한 사실), phase 메타데이터뿐이어야 한다.

**summary에 적을 것**(사용자가 이것을 읽고 판단한다): 개념마다 id·name과 **새 요약문 전문**, 문항마다 id·개념·형식·고른 방식·**문제문 전문**·정답, 균형 줄(예/아니요·정답 위치),
도식마다 이름·두 배치의 `viewBox`·시나리오별 선명한 노드·경로·곁말과 캡션 요지·물음형 제목·요점 테스트, 설계 의도와 달라진 점과 이유,
`official.md`에 더한 사실, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수, 걸린 시간의 어림. 끝에 「사용자 확인」 칸(없으면 「없음」).

## 출처 step(0·4·8)의 공통 형식

- `official.md` 항목: `## (phase 107) <문서 제목> — <단원·절 제목>`, URL 한 줄, 확인한 날, 직접 쓴 사실 한 줄씩(끝에 `— 「절 제목」`), **한국어 표기** 줄, 「쓰일 곳」(개념 id와 D·G 번호).
  앞 phase가 이미 둔 항목(예: 「(phase 101) Azure CLI — What is the Azure CLI?」, 「(phase 102) Azure Resource Manager — What is Azure Resource Manager?」)은 새 항목을 만들지 말고 그 항목에 사실 줄과 「쓰일 곳」을 덧붙인다 — 덧붙인 줄 끝에 `(phase 107)`.
  주제마다 「한국어 표기 정리 — `<주제 id>`」 항목을 하나 둔다(앞 phase의 항목이 본보기 — 개념마다 확정한 `name`과 근거 문서, 섞여 쓰인 표기와 고른 까닭). 도식·표가 쓸 사실은 「도식·표의 사실 — `<주제 id>`」 항목에 모은다(phase 106이 본보기).
- `corrections.md` 항목: `## D106 — <짧은 제목> (phase 107)`부터 덤프, `## G60 — … (phase 107)`부터 용어집. 짜임은 앞 phase 항목과 같다 — **덤프/용어집**(문항 번호·쪽-번호와 주장) · **공식 문서** · **처리**(고쳐 쓴다 / 한정해 쓴다 / 쓰지 않는다) · **쓰인 곳**.
  덤프 답이 공식 문서와 **맞는** 문항은 항목을 만들지 않는다 — summary에 「확인 결과 덤프가 맞다」로 적는다. 덤프끼리 답이 갈리는 문항은 항목으로 남긴다.
  D·G 번호는 앞 출처 step이 쓴 마지막 번호 다음부터 잇는다(step 4는 step 0의, step 8은 step 4의 마지막 번호 다음).
- 그림으로만 표시된 덤프 정답은 OCR 글자나 `index.json`의 `answer`를 믿지 말고 `raw/dump/img/`의 그림을 직접 본다(`docs/source/azure/CLAUDE.md` 「덤프의 그림을 보는 법」). 이 phase의 잠금·정책 문항(NO.33·53·69·106·239·313·388·415·500)과 도구 문항(NO.100·122·176·224·445)은 진술이 그림 안에 있다.
- **시간을 나눠 쓴다** — `azure-governance`·`azure-management-tools`는 덤프 문항이 각각 약 30개다. 하나하나 끝까지 읽으면 30분을 넘길 수 있다(넘기면 step이 처음부터 다시 돈다).
  `dump-topics.tsv`의 `note`로 먼저 거르고, 공식 문서와 어긋날 수 있는 주장이 든 문항(옛 이름, 지원이 끝난 것, 덤프끼리 답이 갈림, 덤프에만 있는 낱말, 「~만」·「반드시」 단정)은 문제문·보기·그림을 끝까지 읽는다.
  나머지는 덤프 답이 공식 문서와 맞는지만 확인한다. 같은 진술을 되풀이하는 문항(NO.33·69·141·258·330, NO.106·313·415, NO.24·36·321·442·498, NO.122·224·445)은 묶어 한 번에 본다. 받을 문서를 먼저 모두 받고, 확인 → 기록 순으로 한다.
- 공통 AC:

```bash
npm test
node scripts/check-verbatim.mjs --subject azure
git status --porcelain
git diff --stat
```

  `npm test`는 출처 step이 코드를 고치지 않았으므로 그대로 통과해야 한다. `check-verbatim`은 원본 수가 받은 문서만큼 늘어 있어야 한다.
  `official.md`·`corrections.md`의 한국어 문장이 `raw/official/ko-…`와 32자 넘게 겹치지 않는지 `node -e`로 `findVerbatimRuns`(`scripts/check-verbatim.mjs`가 export한다)에 두 파일의 문단을 넣어 본다.
- 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.
  인증서 오류(`CERTIFICATE_VERIFY_FAILED`)는 연결 문제가 아니다 — 「배경」대로 `SSL_CERT_FILE`을 붙여 다시 받는다.

## 모든 step의 공통 금지

- **출처 문서에 없는 사실을 쓰거나 그리지 마라.** 이유: 원본에 없는 내용을 지어내지 않는 것이 이 저장소의 규칙이다(루트 CLAUDE.md, ADR-036). 필요하면 확인해서 `official.md`에 먼저 더한다.
- **덤프·용어집·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009. `check-verbatim --subject azure`는 하한선일 뿐이다.
- **수정 이력(`corrections.md`)에 걸린 덤프·용어집의 주장을 그대로 가르치지 마라.** 이유: 틀린 사실을 학습자가 외우게 된다.
- **불변식 테스트·커버리지 테스트를 고치거나 예외를 더하지 마라.** 이유: 테스트가 실패하면 데이터를 고치거나 도식을 그린다(ADR-026). 진행 안내 가드 테스트도 마찬가지다 — 걸리면 문장을 고친다.
- **자기 step의 개념이 아닌 개념을 만들거나, 앞 step·앞 phase가 쓴 글·문항·도식을 고치지 마라.** 이유: 범위가 겹치면 사용자가 무엇이 어디서 바뀌었는지 따라갈 수 없다.
  고칠 것을 찾으면 고치지 말고 summary에 적는다. 앞 phase 문장이 이 phase의 출처와 어긋나면 summary의 **「메인 세션이 볼 것」** 칸에 적는다(메인 세션이 마무리에서 판단한다).
- **AWS·네트워크 데이터와 그 테스트를 고치지 마라.** 기존 테스트를 깨뜨리지 마라.
- **브라우저 실측을 하지 마라.** 이유: step 시간 제한 30분(「배경」). 화면 확인은 phase 끝에 한꺼번에 한다.
- **`docs/source/azure/raw/` 아래 파일을 커밋하지 마라.** 이유: 덤프·용어집·공식 문서의 추출 전문이다(ADR-009). `.gitignore`가 막고 있는지 `git status`로 본다.
- **서비스마다의 SLA 수치, 가격, 지역 수·데이터 센터 수, Cloud Shell의 세션 시간·저장 용량, 이니셔티브에 든 정의 수를 본문·문항·도식에 쓰지 마라.** 이유: 계속 바뀌는 수이거나 확인할 수 없는 값이다(「배경」).
- **Azure Blueprints와 서비스 신뢰 포털을 개념·문항·도식·본문에 쓰지 마라.** 이유: 지원이 끝나는 서비스이고, 신뢰 포털은 범위 밖이다(사용자 결정, 「배경」).
- **Azure Information Protection을 현행 이름처럼 쓰지 마라.** 이유: 추가 기능은 지원이 끝났고 지금은 Microsoft Purview Information Protection의 민감도 레이블이다(「배경」). `sensitivity-labels`의 「예전 이름」 한 번만 예외다.
- **다른 주제의 몫(Azure Advisor·Service Health·Azure Monitor)을 개념으로 세우거나 자세히 쓰지 마라.** 이유: phase 108의 범위다. 필요한 낱말은 그 자리에서 한 줄로 푼다.
- **「배경」이 쓰지 않기로 한 것(Copilot in Azure, Azure DevOps 연동, 정책 정의의 JSON 구조·효과 이름 목록, Purview 제품 세부·라이선스, 다른 회사 제품 이름, Terraform, 배포 스크립트·템플릿 사양·배포 스택)을 쓰지 마라.** 이유: 학습 가이드의 줄에 없거나 개념을 흐린다.
- **`docs/source/azure/topic-map.md`·`dump-topics.tsv`를 고치지 마라.** 이유: 설계 커밋이 배정을 끝냈다. 배정이 맞지 않으면 summary에 적는다.
