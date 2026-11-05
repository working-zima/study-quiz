# Step 4: management-tools-sources

## 배경

phase 107의 전체 계획과 결정은 `phases/107-azure-governance-tools/guide.md`에 있다.
step 5~7이 주제 `azure-management-tools`의 개념 6개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고, 덤프·용어집이 공식 문서와 다른 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다.

이 주제의 중심 문제는 셋이다.
(1) **Learn 단원과 제품 문서가 어긋나는 곳** — Learn 단원 2는 Azure CLI가 「Bash 명령」을 쓰고 Cloud Shell이 「Azure PowerShell과 Azure CLI(Bash)」를 지원한다고 적는다. 제품 문서는 Azure CLI를 여러 셸에서 실행하고, Cloud Shell의 두 셸 모두에 두 도구가 들어 있다고 한다(`docs-cloud-shell-features.md`). 현행 제품 문서로 정리하고, 앱이 쓸 말을 정한다.
(2) **어느 기기·운영 체제에서 무엇을 쓰는가** — 덤프는 이것을 가장 많이 묻는다(NO.2·9·43·84·99·100·122·176·220·224·260·275·287·308·420·445). 진술마다 근거를 찾고, 덤프가 기대는 옛 조건(「PowerShell Core 6.0」, 「Windows PowerShell」)은 현행 요구 사항으로 고쳐 쓴다.
(3) **명령의 꼴로 도구를 가르는 문항**(NO.169·448) — 명령 이름을 확인한다. guide 「배경」대로 `az vm create`와 `New-AzVM`만 쓴다.

## 읽어야 할 파일

- `phases/107-azure-governance-tools/guide.md` — 특히 「배경」, 「세 주제와 개념 17개」의 `azure-management-tools` 표, 「예시 값」, 「출처」, 「출처 step(0·4·8)의 공통 형식」
- `phases/107-azure-governance-tools/index.json`의 step 0 `summary` — 표기와 마지막 D·G 번호
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞이 만든 형식을 따른다.** step 0이 쓴 항목과 도구를 말하는 기존 항목(「(phase 101) Azure CLI」·「Azure PowerShell」·「Azure portal」, 「(phase 100) Azure Arc」 — `grep -n 'Azure CLI\|PowerShell\|Azure portal\|Azure Arc\|Cloud Shell' docs/source/azure/official.md`)을 먼저 읽는다. 있는 항목에는 덧붙인다
- `docs/source/azure/topic-map.md`의 「`management-tools` 라벨의 배정」 — 이 step의 문항 목록(`azure-management-tools` 30)
- 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다. 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/4-management-governance.md`의 Azure Portal·Azure Cloud Shell·Azure CLI·Azure PowerShell·Azure Arc 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — guide.md 「출처」의 목록
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

받는 법과 파일 이름은 step 0과 같다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `management-tools` | 목록 항목 여섯의 이름과 표기(Azure 포털, Azure Cloud Shell, Azure PowerShell, Azure CLI, Azure 모바일 앱, REST API), **모든 도구의 요청이 Azure Resource Manager를 거친다**(앞 phase 항목 「(phase 102) Azure Resource Manager」에 있는지 — 있으면 덧붙이기만), **Azure 모바일 앱**이 하는 일(상태·경고 보기, VM 시작·중지, Cloud Shell 열기, iOS·Android — `docs-azure-portal-mobile-app-overview.md`), **REST API**가 무엇인가(프로그램이 HTTP 요청으로 Azure 서비스를 다루는 창구 — 주소 꼴은 쓰지 않는다). NO.99·275(클라우드를 관리하는 수단), NO.55·220(Android의 PowerApps 포털, iPhone에서 쓰는 도구 — 보기에 없는 모바일 앱의 처리), NO.235(프로그램의 답이 API), **NO.100**(문제문과 그림이 어긋난다 — 그림을 보고 처리), NO.176·445(운영 체제별 도구 — 그림까지). `ToolAccessDiagram`에 쓸 말(브라우저 / 설치한 컴퓨터 / 휴대폰) | Learn 단원 2와 ko, 모바일 앱 개요, `rest/api/azure/` |
| b | `azure-portal` | 정의·표기, 하는 일(만들기·관리·지켜보기, 대시보드, 접근성 설정), **모든 데이터 센터에 있어 한 데이터 센터의 장애에 견디고 사용자 가까이**, **유지 관리로 멈추는 시간 없이 계속 업데이트**(Learn 단원 2), 지원하는 브라우저와 운영 체제(브라우저면 된다는 근거 — 지원 브라우저 쪽이 있으면), 주소 `portal.azure.com`(NO.470 — 덤프 답이 맞는지). NO.287(Android 노트북에서 포털로 VM 만들기), NO.445 셋째 진술 | Learn 단원 2, `docs-azure-portal-overview.md`, 포털 지원 브라우저 쪽, `azure-portal-dashboards` |
| c | `cloud-shell` | 정의·표기, **셸**의 뜻을 쓸 근거, 설치·설정이 필요 없음, 로그인한 계정으로 인증됨, **Bash와 PowerShell 가운데 고른다**, **두 셸 모두에 Azure CLI와 Azure PowerShell이 미리 설치되어 있는가**(`docs-cloud-shell-features.md` — 셸마다 따로 확인할 수 있으면 확인. Learn의 「Azure CLI(Bash)」와 어긋나는 곳을 정리), 여는 곳(`portal.azure.com`의 아이콘, `shell.azure.com`, 모바일 앱 — `docs-cloud-shell-overview.md`), **파일을 남기는 일**(스토리지 계정을 붙이면 남고 저장 요금이 붙는다 / 붙이지 않는 임시 세션은 닫으면 지워진다 — 한국어 표기 「임시 세션」 등), Cloud Shell을 쓰는 데 드는 요금(호스트는 무료, 저장소 요금). NO.43·84·256·260·279·302·325·420(되풀이 — 묶어서), **NO.169·448**(Cloud Shell의 PowerShell에서 `az` 명령을 실행하는 상황 — 그림·보기까지, 덤프끼리 답이 갈리는지), NO.122 첫째 진술 | `docs-cloud-shell-overview.md`, `docs-cloud-shell-features.md`, 시작 쪽, `persisting-shell-storage` |
| d | `azure-powershell` | 정의와 표기(「Azure PowerShell」, 「Az PowerShell 모듈」 — 고른다), **PowerShell**과의 관계(셸 / 그 위의 모듈 — `docs-powershell-what-is-azure-powershell.md`), **cmdlet**의 표기와 명령 이름 `New-AzVM`(있는지 — `get-started-azureps`·`az vm` 문서의 PowerShell 짝), 명령이 Azure REST API를 부른다(Learn), 스크립트로 되풀이·자동화, **설치할 수 있는 운영 체제와 쓰려면 있어야 하는 것**(현행 PowerShell 버전 요구 — 수치는 쓰지 않고 「PowerShell 7」처럼 이름으로만 쓸 수 있는지 판단, `install-azure-powershell`). **NO.2·308·420**(macOS + PowerShell Core 6.0, Windows 10 + 모듈, Chrome OS + Cloud Shell, Linux + Azure CLI만 — 그림·보기까지, 현행 요구로 무엇이 맞고 무엇이 달라졌는지), **NO.9**(PowerShell 스크립트를 Azure CLI만 있는 곳에서 — 처리), NO.224·445 첫째 진술, NO.122 셋째 진술 | `docs-powershell-what-is-azure-powershell.md`와 ko, `install-azure-powershell`, `get-started-azureps` |
| e | `azure-cli` | 정의와 표기, 명령이 `az`로 시작한다, 명령 이름 `az vm create`(`docs-cli-az-vm.md`), **Azure PowerShell과 할 수 있는 일은 같고 명령의 꼴이 다르다**(Learn, `choose-the-right-azure-command-line-tool`), **설치할 수 있는 운영 체제**, **Windows에 처음부터 들어 있는가**(NO.122 둘째 — 근거를 찾고 없으면 「못 찾음」), **설치한 뒤 실행하는 셸**(명령 프롬프트·PowerShell·Bash 등 — `choose-the-right…`·`install-azure-cli`, NO.265의 답이 맞는지), Learn의 「Bash 명령을 쓴다」를 앱이 어떻게 한정할지. NO.256, NO.448(Windows 10에서 Azure CLI로 VM — 보기까지) | `docs-cli-what-is-azure-cli.md`와 ko, `install-azure-cli`, `choose-the-right-azure-command-line-tool`, `docs-cli-az-vm.md` |
| f | `azure-arc` | 정의·표기, **Azure 밖의 무엇을 관리하는가**(현행 목록 — Learn 단원 3의 다섯과 `docs-azure-arc-overview.md`·`azure-arc/servers/overview`가 같은지, 「미리 보기」로 적힌 것은 쓰지 않는다), Azure Resource Manager에 나타나게 한다(투영 — 표기), Azure Policy·역할·태그·모니터링을 Azure 리소스처럼 쓴다, **서버를 옮기지 않는다**(쓸 근거 — 「그 자리에 둔 채」가 문서에 있는지), **Kubernetes 클러스터**를 한 줄로 풀 근거(`azure-arc/kubernetes/overview`), **Azure Migrate와 무엇이 다른가**를 쓸 근거(앞 phase 항목). NO.83·232·254·481(그림·보기까지 — NO.232의 목록이 현행과 같은지) | Learn 단원 3, `docs-azure-arc-overview.md`와 ko, Arc 서버·Kubernetes 개요 |
| g | 도식·표 | `ToolAccessDiagram`·`CloudShellDiagram`·`AzureArcDiagram`과 `CommandToolsTable`의 라벨·곁말·캡션·칸의 사실마다 근거가 있는지(각 step 문서의 설계를 읽는다) | a~f의 결과 |

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·4·8)의 공통 형식」대로. Learn 단원 2·3을 새 항목으로 두고, 앞 phase가 둔 Azure CLI·Azure PowerShell·Azure portal·Azure Arc 항목에는 덧붙인다(끝에 `(phase 107)`). 끝에 「도식·표의 사실 — `azure-management-tools`」과 「한국어 표기 정리 — `azure-management-tools`」 항목.

### 3. `docs/source/azure/corrections.md`에 더한다

step 0의 마지막 D·G 번호 다음부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.2·308·420** — 「PowerShell Core 6.0」, 「Windows PowerShell」 같은 옛 조건.
- **NO.169·448·265** — Azure CLI를 실행하는 셸, Cloud Shell의 PowerShell에서 `az` 명령(덤프끼리 갈리면).
- **NO.122** — Azure CLI가 Windows에 기본으로 있는가.
- **NO.100** — 문제문과 그림이 어긋난다(처리만).
- **NO.232** — Azure Arc가 관리하는 대상의 목록(현행과 다르면).
- **용어집 4쪽 Azure Cloud Shell(「Azure Portal 내에서」 — 여는 곳의 범위, 「영구 스토리지도 연결돼」 — 임시 세션), Azure CLI·Azure PowerShell** — 무엇을 주장하는지 보고 처리한다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-management-tools`의 개념 6개마다 한 줄씩: **확정한 `name`, 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**. 목록 개념은 항목 이름도. 위 표의 a~g마다 결과와 근거 문서.
특히 (1) Cloud Shell의 두 셸에 무엇이 들어 있는가와 Learn과 다른 곳의 처리(앱이 쓸 말 그대로), (2) Azure CLI를 실행하는 셸과 Windows에 기본으로 있는가, (3) Azure PowerShell을 쓰려면 있어야 하는 것과 설치할 수 있는 운영 체제, (4) 명령 이름 두 개의 확인, (5) 모바일 앱이 하는 일의 범위, (6) Azure Arc가 관리하는 대상의 확정 목록과 「옮기지 않는다」의 근거, (7) 도식 셋과 표에 쓸 수 있는 사실. 받은 파일 목록. 마지막 D·G 번호. 끝에 **「메인 세션이 볼 것」**(앞 phase 문장과 어긋나는 곳 — `azure-cloud-benefits.manageability`의 도구 설명, `azure-security-model.rbac-scope` 문단 4)과 **「사용자 확인」** 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·4·8)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작은 step 3이 끝났을 때의 수).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/107-azure-governance-tools/index.json`의 step 4를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 앞 phase 문장도 고치지 않는다.
- **확인하지 못한 사실을 두 문서에 적지 마라.** 「Windows에 기본으로 없다」처럼 없음을 단정하는 말은 특히 — 근거를 못 찾은 것은 「못 찾음」으로 남긴다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.**
- **Azure Resource Manager·ARM 템플릿·Bicep의 사실을 이 step에서 정리하지 마라.** 이유: step 8의 범위다. 「모든 요청이 Resource Manager를 거친다」의 근거만 확인한다.
- **명령의 옵션·출력, 버전 번호, Cloud Shell의 시간·용량 수치를 기록에 「쓸 것」으로 적지 마라.** 이유: guide 「배경」 — 앱에 쓰지 않는다. 처리에 필요하면 「쓰지 않는다」로 적는다.
