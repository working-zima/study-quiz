# Step 0: compute-sources

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋(8 컴퓨팅과 앱 호스팅, 9 가상 네트워크와 연결, 10 네트워크 보호)을 더한다. 전체 계획과 결정은 `phases/103-azure-compute-networking/guide.md`에 있다.
step 1~4가 주제 `azure-compute`(컴퓨팅과 앱 호스팅)의 개념 9개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고,
덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다. 두 문서의 형식은 앞 phase가 만든 것을 그대로 따른다.

이 주제의 중심 문제는 둘이다.
(1) **덤프 답이 공식 문서와 어긋나 보이는 문항** — 설계 때 본 예: NO.192는 VM에 꼭 필요한 리소스를 「공용 IP 주소」로 적지만, VM 개요의 표는 공용 IP를 「때로」 붙는 것으로, 가상 네트워크를 VM이 통신하는 데 쓰는 것으로 적는다.
NO.499(Azure Virtual Desktop 세션 호스트의 운영 체제·동시 연결 수)도 그림의 정답을 현행 문서와 맞춰 봐야 한다.
(2) **앞 주제와 겹치는 사실** — 서버리스·Functions(phase 100 `azure-cloud-computing.serverless`), IaaS·PaaS와 VM·App Service(phase 101 `azure-service-types`), 확장 집합(phase 101 「What are Virtual Machine Scale Sets?」 항목)은
이미 `official.md`에 항목이 있다. 새 항목을 만들지 말고 그 항목에 덧붙이며, 이미 확인된 사실은 다시 적지 않는다.

## 읽어야 할 파일

- `phases/103-azure-compute-networking/guide.md` — 특히 「배경」(앞 주제가 이미 쓴 것, 쓰지 않는 것), 「세 주제와 개념 21개」의 `azure-compute` 표, 「한국어판에서 본 것」, 「예시 값」, 「출처」, 「출처 step(0·5·10)의 공통 형식」
- `docs/source/azure/CLAUDE.md` — 원본 셋, 허용하는 출처, 가리키는 표기, 덤프의 그림을 보는 법. **이 규칙을 따른다**
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞 phase가 만든 형식을 따른다.** 이미 있는 항목 「(phase 100) Learn 「Describe Azure compute services」 — 2 …」·「— 6 …」, 「(phase 100) Azure Virtual Machines — Virtual machines in Azure」,
  「(phase 100) Azure Functions — …」 둘, 「(phase 101) Azure Virtual Machine Scale Sets — …」, 「(phase 101) Azure 클라우드 컴퓨팅 사전 — What is a container?」, 「(phase 101) Azure App Service — …」 둘, 「한국어 표기 정리」 항목들, D1(NO.126)을 먼저 읽는다
- `phases/102-azure-regions-resource-hierarchy/verification.md`의 「설계와 달라진 것」 — 출처 step이 현행 문서로 바꾼 방식
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `virtual-machines`·`app-hosting`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다
  (설계 때 본 것: NO.27·90·110·117·126·131·133·144·192·201·213·263·304·314·406·423·456·487·499). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/2-architecture-services.md`의 가상 머신·확장 집합·가용성 집합·Virtual Desktop·컨테이너·Container Instances·AKS·Functions·App Service 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — guide.md 「출처」의 컴퓨팅 목록(Learn 단원 다섯과 `ko-` 판, 제품 문서 여섯)
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

공식 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 받아 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다. `CERTIFICATE_VERIFY_FAILED`면 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`).
이름은 `learn-<모듈>-<단원>.md`(Learn 단원), `docs-<서비스>-<쪽>.md`(제품 문서), `azure-<쪽>.md`(azure.microsoft.com), 한국어판은 앞에 `ko-`를 붙인다.
영문판(`en-us`)으로 사실을 확인하고, 한국어판(`ko-kr`)은 **용어 표기만** 본다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `virtual-machines` | VM의 정의(가상화된 서버를 IaaS로, 운영 체제와 설치할 소프트웨어를 고객이 정함), VM이 맞는 경우 셋, 고객이 계속 맡는 일(VM 안의 패치·업데이트·구성), **이미지**의 정의, 쓰임 다섯(테스트와 개발·클라우드 앱 호스팅·데이터 센터 확장·재해 복구·리프트 앤 시프트), 크기를 무엇으로 고르는지(용도·vCPU·메모리 — 계열 표는 기록하지 않는다). **가상화**·**vCPU**를 한 줄로 풀 근거. Learn 단원 2가 phase 100 뒤에 고쳐졌으면(크기 계열 표가 새로 들어왔다) 바뀐 부분만 덧붙인다. 덤프 NO.90 | Learn 단원 2(받아 둠), VM 개요(받아 둠) |
| b | `vm-resources` | VM을 만들 때 함께 만들어지는 리소스와 각 쓰임 — VM 개요의 표(가상 네트워크, 네트워크 인터페이스, 사설 IP와 때로 공용 IP, 네트워크 보안 그룹, OS 디스크와 데이터 디스크, 운영 체제 라이선스), **어느 것이 꼭 있어야 하고 어느 것이 선택인지**(공용 IP 주소 없이 VM을 만들 수 있는가, VM은 가상 네트워크에 들어 있어야 하는가 — 현행 문서의 말로), 데이터를 따로 디스크에 두는 까닭, 이 리소스들이 기본으로 VM과 같은 리소스 그룹에 만들어진다는 것, 리소스마다 비용이 따로 붙을 수 있다는 것(금액은 쓰지 않는다). Learn 단원 2의 「VM resources」 절(크기·디스크·네트워킹 — 가상 네트워크·공용 IP·포트 구성). **NO.192**: 덤프 답 「공용 IP 주소」가 현행 문서와 맞는지 — 맞지 않으면 D 항목 | VM 개요(받아 둠), Learn 단원 2, 필요하면 VM 네트워킹 문서(`learn.microsoft.com/azure/virtual-network/network-overview`) |
| c | `scale-sets` | 확장 집합의 정의(같은 구성·부하 분산된 VM 묶음), 확장 집합이 없을 때 해야 하는 일, 수요나 정해 둔 일정에 따라 VM 수를 저절로 늘리고 줄임, 부하 분산과 함께 씀, **부하 분산 장치**를 한 줄로 풀 근거(Azure Load Balancer 개요 첫 문단), **확장 집합이 여러 가용성 영역에 VM을 나눠 둘 수 있는가**(영역에 걸친 확장 집합 — NO.314·423이 데이터 센터 장애 대비를 묻는다). phase 101 항목에 이미 있는 사실은 다시 적지 않는다. 덤프 NO.213·314·423 — 그림까지 본다 | 확장 집합 개요(받아 둠), 「Create a Virtual Machine Scale Set that uses Availability Zones」, Load Balancer 개요 |
| d | `availability-sets` | 가용성 집합의 정의(한 지역 안에서 관련 VM이 한꺼번에 멈출 가능성을 줄이는 논리적 묶음), **업데이트 도메인**과 **장애 도메인**의 정의, 최대 수(설계 때 본 것: 장애 도메인 3·업데이트 도메인 20)와 기본 수, 만든 뒤 바꿀 수 없다는 것, 계획된 유지 관리 때 업데이트 도메인을 한 번에 하나씩 다시 시작한다는 것, VM이 업데이트 도메인에 어떻게 배정되는가(설계 때 본 것: 다섯을 넘으면 처음부터 다시 돌아가며), 요금(집합 자체에는 없음), **막지 못하는 것**(운영 체제·앱의 문제, 데이터 센터 수준의 장애), 가용성 영역과의 차이(영역이 더 넓게 격리, VM 사이 대기 시간은 집합이 더 짧다), 공식 문서의 권장(확장 집합의 유연한 오케스트레이션, 영역)의 현행 표현. 99.95% 같은 SLA 수치는 기록만 하고 「쓰지 않는다」(guide 「배경」). 도식 `AvailabilitySetDiagram`에 쓸 장애 도메인·업데이트 도메인의 번호를 공식 문서가 어떻게 매기는지(0부터인지 1부터인지 — 정하지 못하면 도식은 이름표로 쓴다) | 가용성 집합 개요(`learn.microsoft.com/azure/virtual-machines/availability-set-overview`)와 한국어판, Learn 단원 2 |
| e | `virtual-desktop` | Azure Virtual Desktop의 정의(데스크톱·앱 가상화 서비스, 여러 장치·장소에서 Windows 데스크톱과 앱에 접속), 쓰는 경우, 특징 셋(Microsoft Entra ID와 통합, 데이터가 기기에 남지 않음, 단일 세션·**다중 세션**). **Microsoft Entra ID**를 한 줄로 풀 근거(phase 102가 남긴 항목이 있으면 가리킨다). **NO.499**: 세션 호스트가 실행할 수 있는 운영 체제(Windows 10·11만인가 — 현행 문서가 Windows Server도 드는지), 세션 호스트 20대인 호스트 풀의 최대 동시 연결 수(다중 세션이면 세션 호스트 수보다 많을 수 있는지), 데스크톱과 앱 가상화를 둘 다 지원하는지 — 그림의 정답을 직접 보고 맞춰 본다. **세션 호스트**·**호스트 풀**을 쓸지는 이 결과로 정한다(쓰지 않아도 된다). NO.110·263 | Learn 단원 4(받아 둠), Azure Virtual Desktop 개요(`learn.microsoft.com/azure/virtual-desktop/overview`)와 한국어판 |
| f | `containers` | 컨테이너의 정의(가상화 환경, 호스트 하나에 여럿), **VM과 다른 점**(VM은 저마다 운영 체제를 실행하고 고객이 관리 / 컨테이너는 고객이 운영 체제를 관리하지 않음 — 컨테이너가 호스트의 운영 체제를 함께 쓰는지는 현행 문서의 말로: Azure 사전 「What is a container?」나 Learn 단원 5), 가볍고 빨리 만들고 늘리고 멈춤, 고장 뒤 빨리 다시 시작, Docker와 Azure의 지원, 마이크로 서비스 아키텍처의 쓰임. **엔진**·**호스트**·**마이크로 서비스**를 한 줄로 풀 근거. 도식 `VmContainerDiagram`(호스트 하나 위의 VM 둘이 저마다 운영 체제, 호스트 하나 위의 컨테이너 셋)의 라벨 사실마다 근거가 있는지 | Learn 단원 5(받아 둠), Azure 사전 「What is a container?」(받아 둠), 필요하면 「What is a virtual machine?」(`azure.microsoft.com/resources/cloud-computing-dictionary/what-is-a-virtual-machine`) |
| g | `container-services` | 세 서비스의 정의와 한국어 표기 — Azure Container Instances(가장 빠르고 간단하게, VM 관리 없이, PaaS), Azure Container Apps(PaaS, 부하 분산·크기 조정 내장), Azure Kubernetes Service(**오케스트레이션** — 컨테이너의 수명 주기 관리). 셋을 고르는 기준이 공식 문서에 있으면(예: 「Choose an Azure container service」 — `learn.microsoft.com/azure/architecture/guide/choose-azure-container-service`) 그 말로. 덤프 NO.117(Container Instances의 서비스 유형 — 덤프 답이 PaaS인지), NO.304·456 | Learn 단원 5, 세 서비스의 개요(`learn.microsoft.com/azure/container-instances/container-instances-overview`, `…/container-apps/overview`, `…/aks/what-is-aks`) |
| h | `functions` | Functions의 정의(이벤트 기반 서버리스, VM·컨테이너를 유지하지 않음), **트리거의 종류**(이벤트 — 흔히 REST 요청, 타이머, 다른 Azure 서비스의 메시지), 몇 초 안에 끝나는 일, 저절로 늘어남, **요금**(Learn 단원 6은 「함수가 실행되는 동안 쓴 CPU 시간에만」 — 호스팅 플랜마다 다른지 「Azure Functions hosting options」 항목(phase 100)과 맞춰 보고, 다르면 어느 플랜의 말인지 한정한다), 상태 비저장과 **Durable Functions**, 서버리스가 아닌 환경으로 옮길 수 있다는 것. **REST 요청**을 한 줄로 풀 근거. phase 100 항목에 이미 있는 사실은 다시 적지 않는다. 덤프 NO.131·133·144·406. NO.126은 D1 — 새 항목을 만들지 않는다 | Learn 단원 6(받아 둠), Functions 개요·호스팅 옵션(받아 둠) |
| i | `app-service` | App Service의 정의(웹 앱·백그라운드 작업·모바일 백 엔드·REST API를 인프라 관리 없이, HTTP 기반), 자동 크기 조정·고가용성, Windows·Linux, GitHub·Azure DevOps·Git 저장소에서 자동 배포, 앱 종류 넷(웹 앱·API 앱·WebJobs·모바일 앱)과 각 한 줄, 플랫폼이 맡는 것(배포와 관리, 엔드포인트 보안, 빠른 크기 조정, 부하 분산). **HTTP**·**지속적 배포**를 한 줄로 풀 근거. 앱을 어디에 호스트할지 견주는 Learn 단원 7의 첫 문단(VM — 가장 많이 통제, 컨테이너 — 부분마다 따로 관리, App Service). phase 101 항목에 이미 있는 사실은 다시 적지 않는다. 덤프 NO.201(PaaS 웹 앱에서 운영 체제를 고객이 다루는가)·406·90 | Learn 단원 7(받아 둠), App Service 개요(받아 둠) |
| j | 표·도식 | `HostingOptionsTable`(행 VM·컨테이너·Azure Functions·Azure App Service, 열 「고객이 관리하는 것」·「알맞은 일」)의 칸마다 근거가 a·f·g·h·i에 있는지. `VmResourcesDiagram`(VM 1과 OS 디스크·데이터 디스크·네트워크 인터페이스·가상 네트워크·공용 IP 주소·네트워크 보안 그룹), `ScaleSetDiagram`(부하 분산 장치 뒤 VM이 수요에 따라 늘어남), `AvailabilitySetDiagram`(장애 도메인 셋에 나눈 VM 넷, 전원 장애 때와 계획된 유지 관리 때), `FunctionTriggerDiagram`(이벤트가 없을 때와 올 때)의 라벨·곁말·캡션의 사실마다 근거가 있는지 | a~i의 결과 |

빠진 것을 읽다가 찾으면 더한다. 덤프 문항(위 번호)과 용어집 항목을 하나씩 읽어 공식 문서와 다른 주장이 더 있는지 본다.
NO.27·487은 다른 주제와 함께 걸린 문항이다 — 앞 phase의 D 항목에 이미 있으면 새로 만들지 말고 summary에 그 번호를 적는다.

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·5·10)의 공통 형식」대로. 이미 있는 항목(Learn 단원 2·6, VM 개요, Functions 둘, 확장 집합, 컨테이너 사전, App Service 둘)에는 사실 줄을 덧붙이고(끝에 `(phase 103)`), 새로 받은 문서는 새 항목으로 둔다.
Learn 단원 4·5·7은 phase 100 항목이 쓴 모듈 이름(「Describe Azure compute services」)과 같은 꼴로 새 항목을 둔다.
끝에 「한국어 표기 정리 — `azure-compute`」 항목 — 개념 9개와 목록 항목 이름(VM을 받치는 리소스, 컨테이너 서비스 셋)마다 고른 표기와 근거 문서, 섞여 쓰인 표기(「가상 머신 확장 집합」/「확장 집합」, 「장애 도메인」, 서비스 이름의 영문·한국어)와 고른 까닭.

### 3. `docs/source/azure/corrections.md`에 더한다

D51·G27부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.192** — VM에 꼭 필요한 리소스를 「공용 IP 주소」로 적는다(공용 IP는 선택, 가상 네트워크가 필요 — 확인한 대로).
- **NO.499** — Azure Virtual Desktop 세션 호스트의 운영 체제·동시 연결 수의 덤프 답이 현행 문서와 맞는지.
- **NO.314·423** — 확장 집합으로 데이터 센터 장애에 대비할 수 있는지 — 덤프끼리 답이 갈리면 항목으로.
- **NO.117** — Container Instances의 서비스 유형.
- 용어집 항목의 옛 이름·수치 주장(예: 옛 「Windows Virtual Desktop」, Container Instances·AKS의 설명).

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-compute`의 개념 9개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**.
목록 개념(`vm-resources`·`container-services`)은 항목 이름과 **꼭 있는 것/선택인 것의 구분**도. 위 표의 a~j마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다.
특히 (1) VM에 꼭 있어야 하는 리소스와 선택인 리소스, (2) 장애 도메인·업데이트 도메인의 수와 번호 매김, (3) 확장 집합이 가용성 영역에 걸칠 수 있는지, (4) Functions 요금을 쓸 때의 한정, (5) 컨테이너가 운영 체제를 어떻게 함께 쓰는지의 현행 표현,
(6) 도식 넷과 표에 쓸 수 있는 사실과 이름. 받은 파일 목록(`raw/official/`). 마지막 D·G 번호. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·5·10)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작 193개).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/103-azure-compute-networking/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다 — guide.md 「배경」).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 1~4가 쓴다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.** 이유: 허용 출처를 넓히는 것은 설계에서 정한다. 다른 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **VM 크기 계열 표·가격·SLA 수치를 `official.md`에 가르칠 사실로 적지 마라.** 이유: guide.md 「배경」이 쓰지 않기로 했다. 쓰지 않는다는 처리만 남긴다.
- **`azure-virtual-networking`·`azure-network-protection`의 사실을 이 step에서 정리하지 마라.** 이유: step 5·10의 범위다.
- **`topic-map.md`·`dump-topics.tsv`를 고치지 마라.**
