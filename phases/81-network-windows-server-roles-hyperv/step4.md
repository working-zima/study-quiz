# Step 4: roles-sources-b

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다 — 둘 다 강의 밖 주제다. 전체 계획과 결정은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
step 5~8이 `windows-server-roles`의 뒤 개념 8개(IIS 웹 서버, 사이트 바인딩과 연결 제한, 홈 디렉터리와 가상 디렉터리, 요청 필터링, IIS 로그, FTP 서버, 원격 액세스 역할, 웹 응용 프로그램 프록시)를 쓰기 전에,
**이 step은 그 개념들이 쓸 사실을 허용한 공식 문서(learn.microsoft.com)로 확인하고 출처 문서에 남긴다.** 데이터·코드는 고치지 않는다.

사실의 출처는 **learn.microsoft.com 하나뿐이다**(ADR-059 — IIS 문서 `learn.microsoft.com/iis/…`와 IIS 구성 참조 `learn.microsoft.com/iis/configuration/…`도 그 안이다). 기출 13문항 가운데 이 step의 여덟 개념에 걸린 것은 8문항이다 —
IIS 관리자를 여는 명령([기출 2024-11-03 #40]), IIS 기본 웹 사이트 등록 정보([기출 2025-02-23 #28]), IIS가 제공하는 기능([기출 2025-11-02 #41]), IIS 로그 설정([기출 2026-02-01 #45]),
FTP 서버 설치([기출 2026-05-17 #44]), IIS 관리자의 홈 디렉터리·기본 문서·디렉터리 검색·가상 디렉터리([기출 2026-08-02 #29]), 원격 액세스의 웹 응용 프로그램 프록시([기출 2024-08-25 #38]·[기출 2025-05-25 #39] — 같은 문항).

## 읽어야 할 파일

- `phases/81-network-windows-server-roles-hyperv/guide.md` — 특히 「배경」, 「두 주제와 개념 23개」의 `windows-server-roles` 표 7~14행, 「예시 값」, 「출처」
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 0~3 `summary` — 특히 step 0의 「Features Removed or No Longer Developed」 줄(DirectAccess·웹 응용 프로그램 프록시)과 역할 설치 cmdlet
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과 기존 항목의 형식(「(phase 81 step 0)」 항목들), 이미 있는 항목: phase 78의 FTP(RFC 959)·FTPS(RFC 4217 — 있으면)·SSH·SFTP, TLS·HTTPS·인증서, phase 79의 Apache(`Indexes`·`LimitRequestBody`), phase 80의 PowerShell·「Features Removed…」.
  **있는 사실을 다시 찾지 않는다** — 그 항목에 줄을 더한다
- `docs/source/network/exam-notes.md` — 형식과 마지막 번호(step 0이 더한 E 번호 다음부터)
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `src/data/network/topics.json`의 `app-protocols-mail-file.ftp`·`ftp-modes`·`ssh`, `app-protocols-mgmt-security.https`·`tls`, `ports`, `linux-servers`(Apache의 `Options`와 디렉터리 목록, `LimitRequestBody`), `ip-address-types.nat` — 이미 가르친 사실(뜻을 맞춘다)
- 기출: `docs/source/network/raw/exam/data.txt`에서 `X-windows`로 분류한 줄과 위 8문항(교사용 텍스트). 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 learn.microsoft.com이다(영문 `en-us`와 한국어 `ko-kr` 판 — IIS 문서는 ko-kr 판이 없거나 영문만일 수 있다. 그때는 IIS 관리자 화면 이름을 Windows Server ko-kr 문서나 PowerShell 도움말에서 찾고, 못 찾으면 영문 이름을 쓰고 그렇게 적는다).
**판을 적는다** — 페이지의 갱신 날짜와 적용 대상(IIS 판·Windows Server 판). IIS 문서는 IIS 7.0 시절 글이 많다 — 지금 판(IIS 10.0)에서도 같은지 구성 참조로 확인하고 판을 적는다.
응답이 느리면 `curl -4`로 다시 받는다. 위키백과·블로그·업체 학습 페이지·Q&A 사이트(Microsoft Q&A·TechNet 포럼·Tech Community 블로그·IIS.net 포럼)는 쓰지 않는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `iis` | IIS가 무엇인지(웹 서버 역할 「웹 서버(IIS)」 — 한국어 화면 이름), IIS 관리자를 여는 실행 이름(`inetmgr` — `inetmgr.exe`도 되는지, 실제 파일 이름), **사이트**의 뜻과 설치하면 만들어지는 Default Web Site(바인딩 `*:80`·실제 경로 — 구성 참조의 기본값), IIS가 HTTPS를 지원한다는 근거(`https` 바인딩과 서버 인증서), PHP를 FastCGI로 실행할 수 있다는 근거(CGI 역할 서비스·FastCGI 문서), **응용 프로그램 풀**의 뜻(작업자 프로세스 `w3wp.exe`·격리)과 한 풀에 여러 사이트·응용 프로그램을 둘 수 있다는 근거. **[기출 2024-11-03 #40]**(`inetmgr.exe`)과 **[기출 2025-11-02 #41]**의 정답(요청 필터링)과 오답 셋(HTTPS 미지원·PHP 불가·풀 하나에 사이트 하나)이 문서로 판정되는지 | `iis/get-started/introduction-to-iis/introduction-to-iis-architecture`, `iis/configuration/system.applicationhost/sites/site/…`·`applicationpools/…`, `iis/application-frameworks/…/using-fastcgi-to-host-php-applications-on-iis`, `iis/manage/configuring-security/how-to-set-up-ssl-on-iis`, `iis/get-started/getting-started-with-iis/getting-started-with-the-iis-manager-in-iis-7-and-iis-8`, ko-kr 판 |
| b | `iis-site-bindings` | 사이트 바인딩의 값(형식·IP 주소·포트·호스트 이름)과 한국어 이름(「사이트 바인딩」·「지정하지 않은 모든 IP」 등), 한 서버의 여러 사이트를 바인딩으로 가르는 규칙(같은 IP·포트에서 호스트 이름으로), 사이트의 **제한**(연결 시간 제한·최대 동시 연결 수·최대 대역폭 — 이름과 기본값, 연결 시간 제한의 뜻). **[기출 2025-02-23 #28]**: 틀린 말 「TCP 포트 = 물리적인 시리얼 포트」, 맞는 말로 두는 셋(IP 주소 — 「여러 IP면 접속 순서를 지정」, 연결 수 제한, 연결 시간 제한 — 「움직임이 없으면 세션을 끊는다」)이 문서와 맞는지. 특히 「IP 주소의 접속 순서」는 문서에 없을 수 있다 — 없으면 그렇게 적는다(답 「시리얼 포트」는 같으므로 문단 한 줄이나 E) | `iis/configuration/system.applicationhost/sites/site/bindings/…`, `…/sites/site/limits`(connectionTimeout·maxConnections·maxBandwidth), `iis/get-started/…/getting-started-with-the-iis-manager…`, 호스트 이름 바인딩 문서, ko-kr 판 |
| c | `iis-home-directory` | **실제 경로**(physical path)의 뜻과 기본값(`%SystemDrive%\inetpub\wwwroot`), 바꿀 수 있다는 근거(기본 설정), 「홈 디렉터리」라는 이름을 지금 문서가 쓰는지(쓰지 않으면 옛 IIS 판의 이름이라고 적는다), **기본 문서**(defaultDocument — 기본 목록과 차례, 추가), **디렉터리 검색**(directoryBrowse — 기본으로 꺼짐, 보일 항목 showFlags: 날짜·시간·크기·확장자·긴 날짜), **가상 디렉터리**(virtualDirectory — 별칭과 실제 경로), 기본 문서와 디렉터리 검색 가운데 무엇이 먼저인지. **[기출 2026-08-02 #29]**: 틀린 말 「홈 디렉터리는 반드시 그 폴더」, 맞는 말 셋이 문서와 맞는지 | `iis/configuration/system.webserver/defaultdocument/`, `iis/configuration/system.webserver/directorybrowse`, `iis/configuration/system.applicationhost/sites/site/application/virtualdirectory`, IIS 관리자 문서, ko-kr 판 |
| d | `request-filtering` | **요청 필터링**이 무엇인지(요청을 살펴 규칙에 걸리면 막는 기능), 무엇으로 막는지(파일 이름 확장자·URL 문자열·HTTP 동사·숨겨진 세그먼트·요청 제한 — 기본값: 최대 콘텐츠 길이·URL 길이·쿼리 문자열 길이), 막힌 요청에 돌려주는 상태 코드(404와 하위 상태 — 확장자 거부 404.7 등), 기본으로 설치되는지(역할 서비스), 방화벽과의 차이를 말하는 문서가 있는지(없으면 개념 step이 두 기능의 정의로만 가른다). Apache LimitRequestBody와의 대응은 각 문서의 정의로만 | `iis/configuration/system.webserver/security/requestfiltering/`(fileExtensions·requestLimits·verbs·hiddenSegments), `iis/manage/configuring-security/use-request-filtering`, ko-kr 판 |
| e | `iis-logging` | IIS 로그가 기록하는 것(필드 — W3C 기본 필드), **로그 파일 형식**(W3C·IIS·NCSA·사용자 지정 — 기본), 로그 **디렉터리** 기본값과 바꾸기, **롤오버**(일정 — 시간별·매일·매주·매월, 최대 파일 크기, 새 파일을 만들지 않음), IIS가 오래된 로그를 스스로 지우지 않는다는 근거(로그 저장소 관리 문서), 로그를 버퍼에 모았다가 쓴다는 근거(있으면 — 「실시간」이 아니라는 기출의 판정). **[기출 2026-02-01 #45]**의 정답(저장 위치를 바꿀 수 있다)과 틀린 말 셋(W3C만·실시간·자동 삭제) 판정. 근거를 못 찾은 보기는 그렇게 적는다 | `iis/configuration/system.applicationhost/sites/site/logfile/`, `iis/configuration/system.applicationhost/log/`, `iis/manage/provisioning-and-managing-iis/managing-iis-log-file-storage`, `iis/get-started/…/configure-logging-in-iis`, ko-kr 판 |
| f | `ftp-server` | FTP 서버 역할 서비스(웹 서버(IIS) 아래 「FTP 서버」 — FTP 서비스·FTP 확장성, 한국어 이름), PowerShell 기능 이름(`Web-Ftp-Server`·`Web-Ftp-Service` 등 — `Get-WindowsFeature`로 보이는 이름), IIS 관리자에서 FTP 사이트를 더하는 차례(사이트 정보 → 바인딩 및 SSL 설정 → 인증 및 권한 부여 정보 — 이름은 문서대로), 기본 포트 `21`, **FTP over SSL(FTPS)**를 지원한다는 근거, SFTP(SSH 파일 전송)를 IIS FTP가 지원하지 않는다는 문서의 말(있으면 — 없으면 그렇게 적는다). **[기출 2026-05-17 #44]**의 정답(역할 서비스로 설치)과 틀린 말 셋(서드파티 필요·SFTP 구성 가능·PowerShell 설치 불가) 판정 | `iis/configuration/system.applicationhost/sites/site/ftpserver/`, `iis/publish/using-the-ftp-service/…`(FTP 사이트 만들기·FTP over SSL), `iis/install/installing-publishing-technologies/installing-and-configuring-ftp-7-on-iis-7`, ko-kr 판 |
| g | `remote-access` | **원격 액세스** 역할과 역할 서비스(DirectAccess 및 VPN(RAS)·라우팅·웹 응용 프로그램 프록시 — 한국어 화면 이름), Windows VPN 서버(RRAS)가 지원하는 터널링 프로토콜(PPTP·L2TP/IPsec·SSTP·IKEv2 — 지금 문서의 말과 권고), **DirectAccess**가 무엇인지(사용자가 연결을 시작하지 않아도 이어지는 방식 — 문서의 말)와 지금 판의 상태(step 0의 개발 중단 목록 줄과 맞춘다 — 더 개발하지 않음·권하는 대안), 라우팅 역할 서비스가 하는 일(NAT·LAN 라우팅 — 근거대로), VPN이 무엇인지(문서의 말) | `windows-server/remote/remote-access/remote-access`, `…/vpn/vpn-top`, `…/vpn/always-on-vpn/…`(터널링 프로토콜 절), `…/directaccess/directaccess`, ko-kr 판 |
| h | `web-application-proxy` | **웹 응용 프로그램 프록시**가 무엇인지(역방향 프록시 — 회사 네트워크 안의 웹 응용 프로그램을 밖의 사용자에게 게시), 원격 컴퓨터를 네트워크에 잇지 않는다는 근거(VPN·DirectAccess와 무엇이 다른지 — 문서의 말이 있으면), 사전 인증(AD FS)과 통과(pass-through), AD FS 프록시 노릇(한 줄), 원격 액세스 역할의 역할 서비스라는 것과 지금 판의 상태(step 0의 개발 중단 목록 줄 — Windows Server 2025에서 어떤지). **[기출 2024-08-25 #38]**·**[기출 2025-05-25 #39]**의 정답(WAP)과 오답 셋(PPTP·L2TP·SSTP — 원격 컴퓨터를 잇는 VPN 터널링 프로토콜)이 문서와 맞는지 | `windows-server/remote/remote-access/web-application-proxy/web-application-proxy-windows-server`, `…/web-application-proxy/…`(Publishing applications), ko-kr 판 |

빠진 것을 읽다가 찾으면 더한다. **IIS의 인증 방식 전체·URL 재작성·ASP.NET·공유 구성·출력 캐시, FTP 사용자 격리 전체, VPN·DirectAccess의 배포 절차와 인증서 구성, AD FS의 동작은 확인하지 않는다**(guide.md 「배경」).

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 81 step 4) Microsoft Learn — <문서 제목들>`, URL 한 줄씩, **갱신 날짜와 적용 대상** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 제목`, 「쓰인 곳」.
  같은 문서의 기존 항목이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 81 step 4)」를 붙인 줄로 더한다.
- 주제별로 서너 항목에 모은다(예: 「IIS — 사이트·바인딩·제한·응용 프로그램 풀」, 「IIS — 실제 경로·기본 문서·디렉터리 검색·가상 디렉터리·요청 필터링·로그」, 「IIS FTP 서버」, 「원격 액세스·웹 응용 프로그램 프록시」). 항목마다 **한국어 이름** 줄을 둔다.
- 「쓰인 곳」에는 **쓰일 개념 id**와 exam-notes 번호를 적는다. 머리의 「확인한 날」 문단들 끝에 「(phase 81 step 4)」 줄을 더한다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 step의 기출 8문항이 정답으로 보는 것(과 「옳지 않은 것」을 고르는 문항에서 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 step 0이 쓴 마지막 E 번호 다음부터 이어 더한다(형식 같음).
공식 문서에 있으면 항목을 만들지 않는다. step 0의 문단처럼 이 step이 본 문항 수와 더한 항목을 소개하고 공식 문서와 맞는 문항들을 한 줄씩 짚는 문단을 둔다(확인한 날 포함).

미리 본 것 — 판정은 이 step이 출처를 읽고 한다:
- [기출 2025-02-23 #28]이 맞는 말로 두는 「IP 주소 — 한 컴퓨터에 IP가 둘 이상이면 IP의 접속 순서를 지정」은 지금 IIS 문서의 바인딩과 맞지 않을 수 있다. 어긋나면 E 항목(본문은 문서대로 쓰고 이 보기를 가르치지 않는다).
- [기출 2026-02-01 #45]의 「실시간으로 업데이트되지 않는다」·「오래된 로그를 자동으로 지우지 않는다」 — 문서에 근거가 있는 만큼만 본문에 쓴다. 근거가 없는 쪽은 E 항목이나 문단 한 줄로 「시험이 틀린 말로 둔다 — 공식 문서에서 확인하지 못했다」를 남기고, 개념 step은 그것을 사실처럼 쓰지 않는다.
- [기출 2026-05-17 #44]의 「IIS FTP만으로 SSH 기반 SFTP를 구성할 수 있다」가 틀린 말이라는 근거 — 문서가 FTPS만 말하고 SFTP를 말하지 않으면 그렇게 적는다.
- 웹 응용 프로그램 프록시가 지금 판에서 더 개발하지 않는 기능이면, 기출(2016·2022)이 묻는 사실은 그대로이므로 E는 필요 없고 본문에 판과 함께 한 줄 — 그 판단을 summary에 적는다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`windows-server-roles`의 개념 7~14마다 한 줄씩: **무엇을 쓸 수 있는지(문서·갱신 날짜·절), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호), 한국어 이름**.
위 표의 a~h마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
특히 다음을 개념 step이 그대로 쓸 수 있게 적는다.
- IIS 관리자의 실행 이름, Default Web Site의 바인딩·실제 경로, HTTPS·FastCGI·응용 프로그램 풀의 근거.
- 바인딩의 네 값과 한국어 이름, 호스트 이름으로 가르는 규칙, 제한 셋의 이름·기본값.
- 실제 경로 기본값과 「홈 디렉터리」라는 이름의 처리, 기본 문서 목록·차례, 디렉터리 검색의 기본 상태와 보일 항목, 가상 디렉터리의 정의, 기본 문서와 디렉터리 검색의 차례.
- 요청 필터링이 막는 것(셋쯤 고를 수 있게 기본값과 함께), 막힌 요청의 상태 코드.
- 로그 형식 넷과 기본, 디렉터리 기본값, 롤오버 선택지, 자동 삭제·버퍼 쓰기의 근거 유무.
- FTP 서버 역할 서비스 이름·기능 이름, FTP 사이트 만들기 차례, FTPS 지원과 SFTP의 처리.
- 원격 액세스의 역할 서비스 셋, VPN 터널링 프로토콜, DirectAccess·웹 응용 프로그램 프록시의 정의와 지금 판의 상태.
- 기출 판정 줄: inetmgr, 사이트 등록 정보 넷, IIS 기능 넷, IIS 로그 넷, FTP 설치 넷, 홈 디렉터리 넷, WAP과 터널링 프로토콜.
끝에 「사용자 확인」 칸을 둔다 — 사용자가 정해야 할 것이 있으면 적고, 없으면 「없음」.

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다(내려받은 문서는 저장소 밖에 둔다).
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 판(갱신 날짜·적용 대상)을 적었는지, 문장이 원문(영문·한국어 판)을 옮기지 않았는지 다시 본다. 구성 참조의 속성 설명을 번역해 옮기는 것도 전사다.
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 4를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 5~8이 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **learn.microsoft.com 밖의 문서를 근거로 쓰지 마라** — IIS.net(`iis.net`)의 글이 learn.microsoft.com에 옮겨져 있으면 learn.microsoft.com 쪽 URL을 쓴다. 이유: ADR-059. 꼭 필요한 곳이 목록에 없으면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **기존 항목의 줄을 고치거나 지우지 마라.** 이유: 앞 phase의 개념이 그 줄을 근거로 쓴다. 더할 것은 「(phase 81 step 4)」 줄로 더한다.
- **IIS 인증 방식·URL 재작성·ASP.NET, VPN 배포 절차, AD FS를 정리하지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **`lecture-outline.md`·`interview-facts.md`·`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 강의·면접은 이 주제를 다루지 않고, 이 phase는 새 출처를 더하지 않는다.
