# phase 107 검증 보고

확인한 날: 2026-11-05(Mac). 브랜치 `feat-107-azure-governance-tools`(origin/develop `ce29081`에서 분기), 설계 커밋 `9d694ed`, phase 완료 커밋 `571c490`, 마무리 수정은 이 보고와 함께 커밋한다.
사용자가 「azure 이어서 하자」고 해서 이어받았다. 저장소 밖 `aws-quiz-p103-sup/`의 supervisor로 세 덩어리(step 0~3 / 4~7 / 8~10)를 돌렸다. 처음에는 codex가 기본이었고 11-05부터는 Claude만 썼다(아래 「실행 중에 일어난 일」).

## step별 결과

| step | 맡은 쪽 | 끝난 때 | 결과 | 테스트 |
|---|---|---|---|---|
| 0 governance-sources | codex 한도 → Claude | 11-03 23:43 | `official.md` 새 항목 19·덧붙임 2곳, `corrections.md` D106~D112·G60~G63 | 6310 |
| 1 purview-labels | Claude 한도 → Claude | 11-04 02:51 | 개념 1·2, az153·az154, `PurviewDataMapDiagram`·`SensitivityLabelDiagram` — 주제 `azure-governance` 만듦 | 6354 |
| 2 azure-policy | Claude·Claude·codex 한도 → Claude | 07:37 | 개념 3·4·5, az155~az159, `PolicyCheckDiagram`·`PolicyComplianceDiagram`·`PolicyInitiativeDiagram` | 6417 |
| 3 resource-locks | Claude | 07:59 | 개념 6·7, az160~az163, `LockTypesDiagram`·`LockInheritanceDiagram`·`GovernanceToolsTable` — `azure-governance` 완성 | 6467 |
| 4 management-tools-sources | codex·Claude·codex 한도 → Claude | 12:43 | `official.md` 새 항목·덧붙임, `corrections.md` D113~D121·G64 | 6467 |
| 5 tools-portal | Claude·codex 한도 → Claude | 17:43 | 개념 8·9, az164~az166, `ToolAccessDiagram` — 주제 `azure-management-tools` 만듦 | 6489 |
| 6 shell-commands | Claude | 18:10 | 개념 10·11·12, az167~az171, `CloudShellDiagram`·`CommandToolsTable` | 6519 |
| 7 azure-arc | Claude 한도 → Claude | 23:04 | 개념 13, az172·az173, `AzureArcDiagram` — `azure-management-tools` 완성 | 6541 |
| 8 iac-sources | codex | 23:24 | `official.md` 새 항목·덧붙임, `corrections.md` D122·G65~G68 | 6541 |
| 9 resource-manager-iac | codex·Claude 한도 → Claude | 11-05 03:55 | 개념 14·15, az174·az175, `ResourceManagerDiagram`·`IacEnvironmentsDiagram` — 주제 `azure-infrastructure-as-code` 만듦 | 6589 |
| 10 templates-bicep | Claude 한도 → (supervisor 중단) → Claude | 21:44 | 개념 16·17, az176~az178, `TemplateDeploymentDiagram`·`DeploymentMethodsTable` — `azure-infrastructure-as-code` 완성 | 6620 |

결과: 주제 3개(`azure-governance` ★★★·`azure-management-tools` ★★★·`azure-infrastructure-as-code` 별점 없음 — 주제 지도와 같다), 개념 17개(7·6·4), 문항 26개(az153~az178 — 11·10·5), 도식 13개, 표 셋, 새 테스트 310개.
과목 전체는 주제 19개·개념 124개·문항 178개다. 실행 전체는 11-03 23:17 ~ 11-05 21:44(약 46시간 30분)이고, 그중 약 27시간 45분은 사용량 한도라 기다린 시간, 약 14시간은 supervisor가 멈춰 있던 시간(아래)이다. step 자체가 실패해 멈춘 일은 없다.

## 실행 중에 일어난 일

- **사용량 한도로 열네 번 끊겼고 그때마다 그 step을 처음부터 다시 실행했다.** 부분 변경은 커밋되지 않고 stash로 남았다. step 8만 codex가 끝냈고 나머지 열 step은 Claude가 끝냈다.
- **codex는 11-04 09:43부터 주간 한도**(「try again at Nov 9th」)였다가 23:04에 잠깐 풀려 step 8을 끝냈다. 11-05 사용자가 「당분간 codex는 사용하지 말자」고 해서, supervisor가 환경 변수 `P34_PROVIDERS`로 쓸 쪽을 고르게 고치고(저장소 밖 `CHANGES.md`에 기록) 03:31에 step 9·10을 Claude 전용으로 다시 띄웠다(`state-p107-3b`). 이때 덩어리를 잇던 체인은 끝냈다.
- **11-05 07:27 supervisor가 `OSError(5) Input/output error`로 멈췄다.** step 10이 Claude 한도를 기다리던 중이었고, 이미 열려 있던 로그 파일에 쓰다가 실패한 뒤 새로 연 파일(상태·보고서)은 제대로 쓰였다. 외장 USB SSD가 잠깐 끊겼다 다시 붙은 것으로 보지만 원인은 확인하지 못했다(그 시각 전원 기록에 잠든 흔적은 없다). 저장소는 `git fsck` 깨끗, 워킹 트리 깨끗, step 10은 pending으로 되돌려져 있었다. 21:22 `state-p107-3c`로 step 10만 다시 띄워 21:44에 끝났다. 앞 step 대조용 스냅숏(`snap-8`·`snap-9`)은 새 상태 폴더로 옮겨 이어서 썼다.
- 덩어리를 잇는 조건 셋(앞 덩어리 `range_done`, 「사용자 확인」 없음, 워킹 트리 깨끗함)은 체인이 돈 두 번 모두 통과했다.

## 설계와 달라진 것

모두 step summary에 이유가 있고, 받아들였다.

- **Cloud Shell의 두 셸** — 설계의 「두 셸 모두에 Azure CLI와 Azure PowerShell이 미리 들어 있다」는 공식 문서로 확인하지 못했다(기능 문서는 설치 목록을 Cloud Shell 전체에 하나로 적는다). 앱은 「Cloud Shell에 두 도구가 미리 설치되어 있고, Azure CLI 명령은 두 셸 어느 쪽에서도, Azure PowerShell 명령은 PowerShell에서 실행한다」로 썼고, `CloudShellDiagram`도 셸 둘과 「미리 설치된 도구」 칸 하나로 다시 짰다(step 4·6).
- **Azure CLI가 Windows에 처음부터 있는가** — 있다·없다 둘 다 근거를 찾지 못해(D116) 쓰지 않았다. 「컴퓨터에 설치하거나 Cloud Shell에서 쓴다」까지만이다.
- **포털을 여는 기기** — 「브라우저만 있으면」을 「데스크톱 컴퓨터나 태블릿의 지원되는 웹 브라우저」로 한정했다. 휴대폰은 지원 기기 문서가 모바일 앱을 안내한다(D120).
- **명령형·선언형의 근거** — 설계가 근거로 삼은 Learn의 문장을 현행에서 찾지 못해 IaC·템플릿 문서로 바꿨다. Bicep은 「Azure가 변환한다」가 아니라 「Bicep CLI가 ARM 템플릿으로 바꾼다」로 썼다(G68). 「멱등성」 낱말은 쓰지 않고 풀이만 썼다.
- **도식의 죽은 경로** — `LockTypesDiagram`의 지우기 경로를 뺐고(어느 장면에서도 보이지 않았다), `ResourceManagerDiagram`에 「프로그램에서」 장면을 더했다(REST API 경로가 보이는 장면이 없었다).
- **이 phase의 테스트 두 곳** — 주제의 개념이 몇 개뿐이라고 단언하던 `CloudShellDiagram.test`·`IacEnvironmentsDiagram.test`를, 뒤 step이 개념을 더하며 깨지자 뜻(앞 개념들이 이 순서다)을 지키며 범위를 좁혔다(step 7·10).
- 정책 효과 이름(deny 등)은 앱에 쓰지 않았다. 문항에서도 「어긋난 요청을 거부하는 정책」처럼 하는 일로 적었다.

## 사용자가 볼 것

11개 step 모두 「사용자 확인」은 「없음」이다.

- **메인 세션이 정해 진행한 것**(설계 때) — 덤프 관리 도구 39문항을 30·9로 나눠 별점 그대로(`topic-map.md`). **Azure Blueprints는 쓰지 않았다**(2026-07-31부터 단계적 종료, 2027-01-31 종료 — Learn에도 없다). **AIP는 민감도 레이블로**(추가 기능 지원 종료, 본문에 「예전에는」 한 번). Azure 모바일 앱·REST API는 개념이 아니라 `management-tools`의 목록 항목이다. 명령 예는 `az vm create`·`New-AzVM` 둘뿐이다. 서비스 신뢰 포털·Copilot·Terraform·배포 모드는 쓰지 않았다.
- **덤프 답이 공식 문서와 달라 고쳐 쓴 것**(`corrections.md` D106~D122) — AIP의 옛 레이블과 지금의 민감도 레이블(D106), 정책을 할당하면 준수하는 리소스만 배포된다는 단정(D109), 같은 종류 잠금 여럿·읽기 전용 위 삭제 잠금(D111 — 확인하지 못해 쓰지 않음), PowerShell 스크립트를 실행할 컴퓨터의 옛 조건(D113), Android·Chrome OS 기기의 Cloud Shell(D114)과 az 명령을 실행하는 셸(D115 — 둘 다 덤프끼리 갈림), Azure CLI의 Windows 기본 포함(D116 — 그림과 해설이 갈림), 문제와 답 영역이 어긋난 NO.100(D117), 휴대폰 브라우저의 포털(D120), 「요즘 브라우저면 무엇이든」(D121) 등.
- **용어집이 공식 문서와 달라 고쳐 쓴 것**(G60~G68) — Purview의 과거 이름과 자동 계보 수집(G60), 템플릿이 보장하는 일관성의 범위(G66), Bicep을 바꾸는 주체(G68) 등.

## 메인 세션이 마무리에서 고친 것

새 문항 26개와 개념 17개를 메인 세션이 직접 읽고 고쳤다. 정답 방향·형식·균형은 그대로다.

- **az153** — 문제문의 「담당자가 알고 싶은 것은 서버의 설정이 아니라 데이터 자체로」를 뺐다. 이 말이 오답 셋(Azure Arc는 서버, Azure Policy는 설정, Defender for Cloud는 보안 설정)을 범주로 지워 주어, Purview가 무엇인지 몰라도 풀렸다.
- **az175** — 오답 둘(「Azure 포털에서 하나씩 설정하는 방식」·「Azure Cloud Shell에서 명령을 하나씩 입력하는 방식」)이 문제문의 「파일」만으로 빠져, 묻는 범주(파일을 적는 방식) 밖에 있었다(step 9가 넘긴 곳). 묻는 것을 「두 파일은 각각 어떤 방식인가」로 바꾸고, 보기를 「1은 명령형·2는 선언형」(정답, 위치 0 그대로), 그 반대, 「파일에 적었으므로 둘 다 선언형」, 「리소스를 만드는 코드이므로 둘 다 명령형」으로 했다. 뒤의 둘은 실제로 하기 쉬운 오해다. 해설 끝도 그에 맞게 「방식을 가르는 것은 순서를 적었는가, 다 만들어졌을 때의 모습을 적었는가」로 바꿨다.
- **az176** — 정답 보기만 가장 길었다(step 10이 넘긴 곳). 「가상 네트워크를 만든 뒤 VM을 만들고, 스토리지 계정은 기다리지 않고 함께 만든다」를 「가상 네트워크 다음에 VM을 만들고, 스토리지 계정은 기다리지 않고 만든다」로 줄여 보기 0(42자)보다 짧다(41자).
- **az169 해설** — 「동사와 명사를 하이픈으로 이은 명령은 Azure PowerShell의 명령」은 PowerShell의 cmdlet 전반에 해당해 사실보다 넓었다. 「…하이픈으로 잇고 명사 앞에 Az가 붙은 명령」으로 좁혔다(`azure-powershell` 본문과 같은 말).
- **앞 phase의 `azure-cloud-benefits.security-governance`**(step 8·9·10이 넘긴 판단) — 「템플릿으로 리소스를 배포하면, 배포한 리소스가 기술 표준과 규정 요구에 맞게 만들어진다」에 「템플릿에 기술 표준과 규정 요구에 맞는 설정을 담아 두고」라는 조건을 넣었다. 템플릿으로 배포하기만 하면 저절로 기준에 맞는 것처럼 읽혔다. `official.md` 해당 항목에 처리를 적었다. 이미 공개된 phase 101의 문장을 고친 것이다.
- **앞 phase의 `azure-cloud-benefits.manageability`**(step 4가 넘긴 판단) — PowerShell 풀이 끝에 「Azure를 다룰 때는 그 위에 Azure PowerShell을 설치해 쓴다」를 더했다. 풀이가 셸만 설명해, 이번 phase가 PowerShell과 Azure PowerShell을 가른 뒤로는 셸만 있으면 Azure를 관리하는 것처럼 읽혔다. `official.md`에 처리를 적었다. 문항(az023)은 그대로다.

확인만 하고 고치지 않은 것:

- **az055**(phase 102, 「구독 소유자는 관리 그룹에 건 정책을 자기 구독에서 풀 수 없다」) — 이번 phase가 정책 예외를 들였으므로 소유자가 자기 구독에 예외를 만들 수 있는지 봤다. 예외를 만드는 사람은 대상 할당에 대한 `exempt/Action` 권한이 있어야 한다(「Azure Policy exemption structure」 「Required permissions」). 관리 그룹에 건 할당이면 구독 소유자에게 그 권한이 없으므로 az055는 맞다.
- **`azure-resource-hierarchy.hierarchy`의 정책 줄**(step 0이 넘긴 곳) — 관리 그룹에 건 정책이 아래 구독·리소스 그룹 수준에서 평가된다는 사실과 어긋나는 문장은 없다.
- **`azure-security-model.rbac-scope`·`azure-cloud-models.multicloud`·az128**(step 4·7·8·9가 넘긴 곳) — 이번 출처와 어긋나지 않는다.

## 남겨 둔 것

- `corrections.md`의 이 phase 항목에 「쓰인 곳: (쓰일 곳)」 표지가 남아 있다. phase 100·101·103~106도 같은 상태라(phase 102만 마무리에서 뗐다) 이번에도 그대로 두었다. 한꺼번에 정리할지는 사용자 판단으로 둔다.
- `ToolAccessDiagram` 세로형 「설치해서」 장면에서 Azure CLI 선이 두 그룹 칸 사이 8 폭 틈을 지난다(step 5가 넘긴 곳). 캡처로 보면 두 테두리 사이에 선이 따로 보여 그대로 두었다. 실측기의 「그룹 박스 테두리에 걸친 곳」도 0이다.
- `git stash`에 이 phase의 한도 중단 초안 14개가 남아 있다. 쓰이지 않는 것이고, 지우는 것은 사용자 판단으로 둔다.

## 다시 돌린 검증 (마무리 수정 뒤)

실행 부하가 없을 때 마무리 수정한 내용으로 다시 돌렸다. supervisor도 step마다 같은 검증을 돌려 모두 통과했다.

- `npm run build` 통과, `npm run lint` 경고 0, `npm test` 300파일·6620개 통과(phase 시작 284파일·6310개).
- `check-structure` 「구조 이상 없음」.
- 교차 검사 「✓ 교차 없음 — 세로 노드 1322개·경로 902개, 가로 노드 1322개·경로 902개」(phase 시작 1253/854에서 +69/+48).
- `check-verbatim --subject azure` 「전사 이상 없음 — azure: 원본 749개, 단위 1193개」(phase 시작 원본 655개·단위 1037개).
- 문항 178개(az001~az178), 예 45·아니요 44, 정답 위치 22/22/22/23.
- AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `ce29081`과 diff 없음.

## 화면 확인 (headless Chrome + CDP, 개발 서버 `127.0.0.1:5300`)

phase 106의 측정기를 주제만 바꿔 썼다(저장소 밖 `p107-run/measure-p107.cjs`). 폭 305·320·390(배율 2, 모바일)과 1180(배율 1). 측정은 마무리 수정 뒤에 했다.

- **넘침** — 네 폭에서 세 주제 모두 페이지 가로 넘침 0. 모든 시나리오 버튼을 누른 뒤에도 0.
- **도식 13개의 모든 시나리오**(폭마다 53개 상태 — `azure-governance` 28, `azure-management-tools` 12, `azure-infrastructure-as-code` 13)를 하나씩 눌러 보이는 SVG 글자를 화면 픽셀로 쟀다. SVG 밖으로 나간 글자, 노드 라벨이 자기 상자보다 넓은 곳, 글자끼리 겹친 곳, 곁말이 노드 상자에 겹친 곳, 그룹 박스 테두리에 걸친 곳 모두 0.
- **표 셋** — 폭 273·288·358·621~638에서 표 넘침 0, 낱말 끊김 0.
- **측정기 자가 시험** — 곁말을 SVG 밖으로, 라벨을 길게, 표 칸에 긴 낱말을 넣으면 폭 320에서 37건을 잡는다(주제마다 13·13·11).
- **과목 화면** — 과목 목록(`#/`)에 「Azure AZ-900 · 주제 19개 · 문항 178개」, 주제 목록(`#/azure`), 세 주제의 확인 문제(11·10·5문항)·랜덤(전체 178문항)·검색·복습 화면이 320·1180에서 넘침 0. 답을 누르면 해설이 뜬다. 콘솔 오류 없음.
- **캡처해서 눈으로 본 것**: 도식 13개의 모든 장면(390), 가로형 `AzureArcDiagram`·`TemplateDeploymentDiagram`의 모든 장면(1180). step이 넘긴 곳 — Purview 곁말 위치, PolicyCheck 곁말, LockTypes 「먼저 잠금을 푼다」, LockInheritance 통로, ToolAccess·CloudShell 선의 틈, Arc 곁말과 모이는 화살표, ResourceManager 화살표, IaC 칸 테두리, TemplateDeployment 갈라지는 화살표와 「가상 네트워크가 먼저」 — 에서 곁말이 대상과 떨어져 읽히는 곳, 선이 상자에 붙어 한 줄로 보이는 곳, 테두리가 잘린 곳은 없다.
