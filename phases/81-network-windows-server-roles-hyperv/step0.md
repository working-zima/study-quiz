# Step 0: roles-sources-a

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`(Windows Server의 서버 역할)와 `windows-hyperv`(Hyper-V와 Windows 컨테이너)를 만든다 — 둘 다 강의 밖 주제다. 전체 계획과 결정은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
step 1~3이 `windows-server-roles`의 앞 개념 6개(서버 역할과 기능, 서버의 고정 IP 주소, 파일 서버와 프린트 서버, DHCP 서버 역할, DHCP 예약, DHCP 장애 조치)를 쓰기 전에,
**이 step은 그 개념들이 쓸 사실을 허용한 공식 문서(learn.microsoft.com)로 확인하고 출처 문서에 남긴다.** 데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

이 주제는 강의가 다루지 않으므로 **사실의 출처는 learn.microsoft.com 하나뿐이다**(ADR-059). 기출 13문항 가운데 이 step의 여섯 개념에 걸린 것은 6문항이다 —
파일·프린터 서버에 있어야 하는 통신 프로토콜([기출 2024-11-03 #30]), DNS 서버 설치 중 생긴 문제를 고치는 방법([기출 2025-05-25 #43] — 지문이 그림이라 보기와 정답만 본다),
DHCP 범위 구성([기출 2025-02-23 #44]·[기출 2026-08-02 #32] — 같은 문항), DHCP 장애 조치의 MCLT([기출 2026-05-17 #42]), FTP 서버를 역할 서비스로·PowerShell로 설치하는 것([기출 2026-05-17 #44] — 설치 자리만, FTP 자체는 step 4).

## 읽어야 할 파일

- `phases/81-network-windows-server-roles-hyperv/guide.md` — 특히 「배경」, 「두 주제와 개념 23개」의 `windows-server-roles` 표 1~6행, 「예시 값」, 「출처」
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과 기존 항목의 형식(특히 「(phase 80 step 0)」·「(phase 80 step 8)」 Microsoft Learn 항목들), 이미 있는 항목: phase 74의 DHCP(RFC 2131 등), phase 78의 ipconfig, phase 79의 Windows DNS 서버, phase 80의 AD DS 설치(서버 관리자·`Install-WindowsFeature`)·「Features Removed or No Longer Developed in Windows Server」.
  **있는 사실을 다시 찾지 않는다** — 그 항목에 줄을 더한다
- `docs/source/network/exam-notes.md` — 형식과 마지막 번호(phase 80이 E35~E38을 더했다 — 다음 번호는 **E39**), phase 80 step 0·4·8이 더한 「대조 문단」의 꼴
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `src/data/network/topics.json`의 `ip-address-types.static-dynamic-address`·`dhcp`·`dhcp-messages`, `diagnostic-commands.ipconfig-options`, `app-protocols-mgmt-security.snmp`, `app-protocols-mail-file.smtp`, `icmp`(IGMP), `windows-admin-tools.work-folders`·`bitlocker` — 이미 가르친 사실(뜻을 맞춘다)
- 기출: `docs/source/network/raw/exam/data.txt`에서 `X-windows`로 분류한 줄과 그 문항(시험 날짜·번호로 교사용 텍스트에서 찾는다) — 위 6문항. 시험이 무엇을 정답으로 보는지와 「옳지 않은 것」·「가장 적절하지 않은 것」을 고르는 문항에서 맞는 말로 두는 보기만 본다. 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 learn.microsoft.com이다(영문 `en-us`와 한국어 `ko-kr` 판). **판을 적는다** — 페이지의 갱신 날짜와 적용 대상(Windows Server의 판). 지난 판 문서(`previous-versions`)는 지금 판에 없을 때만 쓰고 그 판을 적는다.
응답이 느리면 `curl -4`로 다시 받는다. 위키백과·블로그·업체 학습 페이지·Q&A 사이트(Microsoft Q&A·TechNet 포럼·Tech Community 블로그)는 쓰지 않는다.
**한국어 이름**: 개념마다 학습자에게 보일 한국어 이름(역할·역할 서비스·마법사·설정의 이름)을 ko-kr 판에서 확인해 적는다. ko-kr 판 안에서 이름이 갈리면 화면 이름으로 보이는 것과 기출이 쓰는 이름을 고르고 그 까닭을 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `server-roles-features` | 서버 역할·역할 서비스·기능이 각각 무엇인지(문서의 말 — 역할과 기능을 가르는 기준), 서버 관리자의 「역할 및 기능 추가 마법사」와 그 단계 이름(설치 유형·서버 선택·서버 역할·기능·확인 등 — 문서가 보이는 만큼), `Install-WindowsFeature`(역할·역할 서비스·기능을 설치, `-IncludeManagementTools`가 관리 도구를 함께 까는지)와 `Get-WindowsFeature`(설치 상태 보기), 기본으로 설치된 역할(파일 및 저장소 서비스의 저장소 서비스 등 — 근거가 있을 때만). 예로 쓸 역할 이름(DNS 서버·DHCP 서버·웹 서버(IIS)·파일 및 저장소 서비스·원격 액세스·Hyper-V)과 기능 이름(BitLocker 드라이브 암호화 — phase 80 `windows-admin-tools.bitlocker`가 「기능으로 설치」라 쓴 근거와 맞는지)의 한국어 화면 이름. **[기출 2026-05-17 #44]**의 「PowerShell로 설치할 수 없다」가 틀린 말이라는 근거(설치 cmdlet) | `windows-server/administration/server-manager/install-or-uninstall-roles-role-services-or-features`, `powershell/module/servermanager/install-windowsfeature`·`get-windowsfeature`, ko-kr 판 |
| b | `server-static-ip` | 다른 컴퓨터가 찾아오는 서버(DNS 서버·DHCP 서버·도메인 컨트롤러)에 고정 IP 주소를 쓰라는 문서의 말(역할마다 — 있는 것만), DHCP로 주소를 받은 서버에 그 역할을 설치할 때 마법사가 보이는 경고나 확인(있으면 무엇을 알리는지 — 화면 꼴을 문서가 보이는 만큼), 고정 주소를 넣는 방법(네트워크 어댑터의 TCP/IPv4 속성 「다음 IP 주소 사용」·「다음 DNS 서버 주소 사용」의 한국어 이름, `New-NetIPAddress`·`Set-DnsClientServerAddress`), `ipconfig /renew`가 하는 일(phase 78 항목에 있으면 그 줄). **[기출 2025-05-25 #43]**의 정답(「`ipconfig /renew`는 적절하지 않다」)과 맞는 말로 두는 셋(고정 할당으로 바꾸기·「다음 IP 주소 사용」·「다음 DNS 서버 주소 사용」)이 문서와 맞는지 — 지문이 그림이라 문제가 「동적 주소 경고」라고 단정하지 말고, 판정할 수 있는 만큼만 | DNS 서버 설치 문서(`windows-server/networking/dns/quickstart-install-configure-dns-server` 등), DHCP 서버 배포 문서(`windows-server/networking/technologies/dhcp/…`), AD DS 설치 문서(phase 80 항목), `powershell/module/nettcpip/new-netipaddress`, 문제 해결 문서, ko-kr 판 |
| c | `file-print-services` | 파일 및 저장소 서비스 역할과 파일 서버 역할 서비스(기본 설치 여부), 인쇄 및 문서 서비스 역할과 인쇄 서버 역할 서비스(한국어 이름), **SMB**가 무엇인지(파일·프린터 공유와 통신에 쓰는 네트워크 파일 공유 프로토콜 — 문서의 말), SMB가 TCP/IP 위에서 동작하고 쓰는 포트(TCP `445`, NetBIOS over TCP/IP의 `139`는 근거대로 한 줄), 공유 폴더를 가리키는 UNC 경로의 꼴(`\\서버\공유`). **[기출 2024-11-03 #30]**의 「파일·프린터 서버를 쓰려면 TCP/IP를 반드시 설치」를 문서로 판정할 수 있는지(TCP/IP가 Windows에 기본으로 깔려 따로 설치하지 않는다면 그것도 적는다 — 어긋나면 E 항목) | `windows-server/storage/file-server/file-server-smb-overview`, SMB 포트·방화벽 문서(`windows-server/storage/file-server/smb-secure-traffic` 등), 인쇄 서버 문서(`windows-server/administration/…print…`), UNC 경로 문서(필요할 때만), ko-kr 판 |
| d | `dhcp-server-role` | DHCP 서버 역할을 설치하는 것과 관리 도구 「DHCP」(실행 이름 `dhcpmgmt.msc`), 도메인에서 DHCP 서버의 **권한 부여**(authorize — 권한 부여되지 않은 서버가 주소를 나눠 주지 않는다는 문서의 말), **범위**의 뜻과 **새 범위 마법사**의 단계(범위 이름 → IP 주소 범위(시작·끝·길이·서브넷 마스크) → **제외 및 지연 추가**(제외 범위와 **서브넷 지연** — 단위가 밀리초인지) → **임대 기간**(정할 수 있는 단위 — 일·시간·분, 초가 있는지) → DHCP 옵션 구성(라우터(기본 게이트웨이), 도메인 이름과 DNS 서버, **WINS 서버** — 지금 판 마법사에 있는지) → 범위 활성화)과 한국어 이름, 기본 임대 기간(판), WINS가 무엇인지(한 줄 — NetBIOS 이름을 주소로 바꾸는 서비스, 지금 판의 지원 상태). **[기출 2025-02-23 #44]**·**[기출 2026-08-02 #32]**: 정답 「주소를 분배할 때 적용할 지연 시간은 ms 단위」가 문서와 맞는지, 틀린 말로 두는 셋(임대 기간을 초 단위까지, 새 범위에서 더 이상 WINS를 구성하지 않음, 예약 유형은 BOOTP 없이 DHCP만)이 정말 틀렸는지 | `windows-server/networking/technologies/dhcp/dhcp-top`·`quickstart-install-configure-dhcp-server`·`dhcp-deploy-wps`, `powershell/module/dhcpserver/add-dhcpserverv4scope`·`add-dhcpserverv4exclusionrange`(Delay 매개 변수 단위)·`set-dhcpserverv4optionvalue`, 지난 판 「Configure a DHCP scope」·「New Scope Wizard」 문서(지금 판에 없을 때), ko-kr 판 |
| e | `dhcp-reservation` | 예약이 무엇인지(특정 클라이언트에게 같은 주소 — MAC 주소로 알아본다), 새 예약 창의 항목(예약 이름·IP 주소·MAC 주소·설명·**지원되는 유형** — DHCP·BOOTP·둘 다)과 한국어 이름, 예약 주소가 범위 안이어야 하는지, 예약한 클라이언트도 DHCP로 주소를 받는다는 것(문서의 말이 있으면), `Add-DhcpServerv4Reservation`의 `-Type`(Dhcp·Bootp·Both). 기출 d의 오답 「예약 유형은 DHCP만」 판정 | `powershell/module/dhcpserver/add-dhcpserverv4reservation`, DHCP 문서의 예약 절, 지난 판 「Create a new reservation」, ko-kr 판 |
| f | `dhcp-failover` | DHCP 장애 조치가 무엇인지(두 서버가 임대 정보를 나눠 갖고 한 서버가 멈춰도 주소를 준다), 두 방식(**부하 분산** — 기본 비율, **상시 대기** — 대기 서버가 남겨 두는 주소 비율)과 한국어 이름, **MCLT**(문서의 정의 — 파트너 서버가 아는 것보다 임대를 늘릴 수 있는 최대 시간, 파트너가 멈춘 상태에서 남은 서버가 하는 일, 기본값), **상태 전환 간격**(기본값·켜는지), **공유 암호**(메시지 인증), 한 관계의 서버 수와 IPv4만인지. **[기출 2026-05-17 #42]**의 정답(파트너 서버가 기존 임대를 임시로 갱신할 수 있는 최대 시간)이 문서의 MCLT 정의와 맞는지(어긋나면 그 차이를 적는다), 오답 셋(서버 간 인증에 쓰는 최대 시간·Discover 재전송 간격·장애 조치 뒤 범위를 끄는 유예 시간)이 MCLT가 아니라는 근거 | `windows-server/networking/technologies/dhcp/dhcp-failover`(DHCP failover 개요·MCLT 절), `powershell/module/dhcpserver/add-dhcpserverv4failover`(`-MaxClientLeadTime`·`-StateSwitchInterval`·`-LoadBalancePercent`·`-ReservePercent`·`-SharedSecret`), 지난 판 「Understand and Deploy DHCP Failover」(지금 판에 없을 때), ko-kr 판 |

빠진 것을 읽다가 찾으면 더한다. **DHCP의 IPv6·정책·필터·DNS 동적 업데이트 설정, IPAM, 서버 관리자의 원격 관리, 저장소 공간·DFS·데이터 중복 제거, 프린트 관리 콘솔의 세부는 확인하지 않는다**(guide.md 「배경」).

### 2. 「Features Removed or No Longer Developed in Windows Server」를 본다

phase 80 항목에 이 문서가 있다(클라우드 폴더). 같은 항목에 「(phase 81 step 0)」 줄로 이 step의 개념과 이 phase의 뒤 주제에 걸린 것 — **WINS**, **DirectAccess**, **웹 응용 프로그램 프록시**, **Hyper-V의 기능**, **Nano Server** — 이 목록에 있는지(제거됨·더 개발하지 않음, 어느 판부터)를 한 번에 적는다.
뒤 출처 step(4·9)이 이 줄을 다시 찾지 않고 쓴다.

### 3. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 81 step 0) Microsoft Learn — <문서 제목들>`, URL 한 줄씩, **갱신 날짜와 적용 대상** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 제목`, 「쓰인 곳」.
  같은 문서의 기존 항목이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 81 step 0)」을 붙인 줄로 더한다.
- 문서가 여럿이면 주제별로 두세 항목에 모은다(예: 「서버 역할과 기능·고정 IP 주소」, 「파일 서버·SMB·인쇄 서버」, 「DHCP 서버 역할·범위·예약·장애 조치」). 항목마다 **한국어 이름** 줄(영문 → 한국어, ko-kr 판의 근거와 고른 까닭)을 둔다.
- 「쓰인 곳」에는 **쓰일 개념 id**(`windows-server-roles.dhcp-failover` 등)와 exam-notes 번호를 적는다.
- 머리의 「확인한 날」 문단들 끝에 「(phase 81 step 0)」이 붙은 줄과 항목이 무엇인지 한 문장을 더한다.

### 4. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 step의 기출 6문항이 정답으로 보는 것(과 「옳지 않은 것」을 고르는 문항에서 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 **E39**부터 `## E… — …`로 이어 더한다(E35~E38 형식 — 시험·공식 문서·처리·쓰인 곳).
공식 문서에 있으면 항목을 만들지 않는다. phase 80 step 0의 문단처럼, 이 step이 본 문항 수와 더한 항목을 소개하고 공식 문서와 맞는 문항들을 한 줄씩 짚는 문단을 둔다(확인한 날 포함).
문단은 「E39~는 phase 81(`windows-server-roles`·`windows-hyperv`)이 더한다」로 시작한다.

미리 본 것 — 판정은 이 step이 출처를 읽고 한다:
- [기출 2024-11-03 #30]의 「반드시 설치해야 하는 통신 프로토콜 TCP/IP」 — Windows Server에서 TCP/IP는 따로 설치하는 것이 아니라 기본으로 있다면, 시험의 「설치」라는 말이 문서와 어긋나는지. 답(SMB가 TCP/IP 위에서 동작하므로 TCP/IP가 있어야 한다)이 문서로 서면 항목 대신 문단 한 줄로 적어도 된다.
- [기출 2025-05-25 #43]은 지문(문제 화면)이 빠졌다. 보기 넷이 모두 「고정 주소」 쪽 해결이므로 문제는 DHCP로 받은 주소에 관한 경고로 보인다 — 그렇게 단정할 근거가 문서에 없으면 그렇게 적고, 개념 step은 「고정 주소를 쓰라는 문서의 말」과 `ipconfig /renew`가 하는 일만 가르친다.
- [기출 2025-02-23 #44]의 셋 — 임대 기간에 초 단위가 없는지, 새 범위 마법사에 WINS 옵션이 지금 판에도 있는지(WINS가 개발 중단 목록에 있다면 「마법사에는 남아 있다」가 서는지), 예약 유형에 BOOTP가 있는지. 근거를 찾지 못한 보기는 개념 step이 문항에 쓰지 않는다.

### 5. summary — 뒤 step이 이것을 보고 쓴다

`windows-server-roles`의 개념 1~6마다 한 줄씩: **무엇을 쓸 수 있는지(문서·갱신 날짜·절), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호), 한국어 이름**.
위 표의 a~f마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
특히 다음을 개념 step이 그대로 쓸 수 있게 적는다.
- 역할·역할 서비스·기능의 구분과 예(한국어 화면 이름), 마법사의 단계 이름, 설치 cmdlet의 꼴.
- 고정 IP 주소를 쓰라는 문서의 말(역할마다), 경고의 내용(있으면), 넣는 방법의 메뉴 이름.
- SMB의 뜻·포트, 파일 서버·인쇄 서버의 역할 이름, UNC 경로 꼴.
- 새 범위 마법사의 단계 이름(한국어)과 단계마다 정하는 값·단위, 기본 임대 기간, WINS 옵션과 지원 상태.
- 예약 창의 항목과 지원되는 유형, 예약 주소가 범위 안이어야 하는지.
- 장애 조치의 두 방식과 기본 비율, MCLT 정의·기본값, 상태 전환 간격·공유 암호, 관계의 서버 수.
- 개발 중단 목록 줄(WINS·DirectAccess·웹 응용 프로그램 프록시·Hyper-V 기능·Nano Server).
- 기출 판정 줄: 파일·프린터 서버의 TCP/IP, DNS 설치 문제, DHCP 구성 넷, MCLT 넷, FTP 설치 자리(PowerShell).
끝에 「사용자 확인」 칸을 둔다 — 사용자가 정해야 할 것(허용 출처를 넓혀야 하는 일 등)이 있으면 적고, 없으면 「없음」.

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다(내려받은 문서는 저장소 밖에 둔다).
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 판(갱신 날짜·적용 대상)을 적었는지, 문장이 원문(영문·한국어 판)을 옮기지 않았는지 다시 본다. 설정 항목 설명을 번역해 옮기는 것도 전사다.
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「5. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 1~3이 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **learn.microsoft.com 밖의 문서(위키백과·블로그·업체 학습 페이지·Q&A 사이트, Microsoft Q&A·TechNet 포럼·Tech Community 블로그)를 근거로 쓰지 마라.** 이유: ADR-059.
  꼭 필요한 곳이 목록에 없으면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **기존 항목의 줄을 고치거나 지우지 마라.** 이유: 앞 phase의 개념이 그 줄을 근거로 쓴다. 더할 것은 「(phase 81 step 0)」 줄로 더한다.
- **DHCP의 IPv6·정책·필터·IPAM, SMB의 버전별 기능·암호화·다중 채널, 저장소 공간·DFS를 정리하지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **`lecture-outline.md`·`interview-facts.md`·`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 강의·면접은 이 주제를 다루지 않고, 이 phase는 새 출처를 더하지 않는다.
