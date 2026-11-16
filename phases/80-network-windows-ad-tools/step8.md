# Step 8: admin-tools-sources

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다 — 둘 다 강의 밖 주제다. 전체 계획과 결정은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
step 9~13이 `windows-admin-tools`의 개념 10개(MMC와 실행 창 명령, 이벤트 뷰어, Windows 로그, 성능 모니터, 리소스 모니터, PowerShell, 인증서와 인증서 관리자, EFS, BitLocker 드라이브 암호화, 클라우드 폴더)를 쓰기 전에,
**이 step은 그 개념들이 쓸 사실을 learn.microsoft.com으로 확인하고 출처 문서에 남긴다.** 데이터·코드는 고치지 않는다.
개념이 10개라 출처 step 하나가 맡는 수의 한도에 닿는다 — 문서마다 필요한 절만 찾아 읽고, 개념 하나에 문서를 셋 넘게 열지 않도록 한다.

기출 13문항이 묻는 것은 실행 창 명령(인증서 관리자를 여는 `certmgr.msc`, `.msc`를 뺀 `compmgmt`가 열리지 않는다는 짝), 이벤트 뷰어로 종료·재부팅 기록 보기(둘 — 같은 문항), Windows 로그에 드는 것(응용 프로그램),
성능 모니터를 여는 `perfmon`, 리소스 모니터가 보는 자원(둘), PowerShell의 성질(둘 — 같은 문항), EFS(인증서 파일 형식이 정답인 문항), BitLocker, 클라우드 폴더다.

## 읽어야 할 파일

- `phases/80-network-windows-ad-tools/guide.md` — 특히 「배경」, 「두 주제와 개념 22개」의 `windows-admin-tools` 표 13~22행, 「예시 값」, 「출처」
- `phases/80-network-windows-ad-tools/index.json`의 step 0·4 `summary`(`windows-ad`가 확인한 것 — 그룹 정책 편집기·로컬 그룹 Performance Monitor Users 등. 다시 찾지 않는다)와 step 7 `summary`(`windows-ad` 통독 결과)
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과 「(phase 80 step 0)」·「(phase 80 step 4)」 항목들, 이미 있는 Microsoft Learn 항목(phase 71의 작업 관리자, phase 78의 Windows 명령), phase 78의 TLS·인증서 항목. **있는 사실을 다시 찾지 않는다** — 그 항목에 줄을 더한다
- `docs/source/network/exam-notes.md` — 형식과 step 0·4가 더한 문단·항목, 마지막 번호
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `src/data/network/topics.json`의 `app-protocols-mgmt-security.tls`(인증서·공개 키·개인 키), `network-basics.throughput`·`diagnostic-commands.netstat-windows-options`(작업 관리자), `diagnostic-commands.ipconfig`(명령 프롬프트), `windows-ad`(그룹 정책·`gpedit.msc`·로컬 그룹) — 이미 가르친 사실(뜻을 맞춘다)
- 기출: `docs/source/network/raw/exam/data.txt`에서 `X-windows`로 분류한 줄 가운데 이 주제의 13문항과 그 문항(교사용 텍스트) —
  [기출 2024-02-25 #39·#43], [기출 2024-08-25 #28·#37·#39], [기출 2024-11-03 #31·#36], [기출 2025-05-25 #35], [기출 2025-08-24 #30·#41], [기출 2025-11-02 #38], [기출 2026-02-01 #42], [기출 2026-08-02 #30].
  시험이 무엇을 정답으로 보는지와 「옳지 않은 것」을 고르는 문항에서 맞는 말로 두는 보기만 본다. 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 learn.microsoft.com이다(영문 `en-us`와 한국어 `ko-kr` 판). **판을 적는다** — 페이지의 갱신 날짜와 적용 대상(Windows Server·Windows·PowerShell의 판). 지난 판 문서(`previous-versions`)는 지금 판에 없을 때만 쓰고 그 판을 적는다.
응답이 느리면 `curl -4`로 다시 받는다. 위키백과·블로그·업체 학습 페이지·Q&A 사이트(Microsoft Q&A·TechNet 포럼·Tech Community 블로그 포함)는 쓰지 않는다.
**한국어 이름**: 도구·로그·기능의 한국어 화면 이름을 ko-kr 판에서 확인해 적는다. 이름이 갈리면 화면 이름과 기출이 쓰는 이름을 고르고 까닭을 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| m | `mmc-run-commands` | MMC가 무엇인지(관리 도구 조각인 스냅인을 담는 틀), 콘솔 파일 `.msc`, 실행 창(Windows 키 + `R`)과 명령 프롬프트에서 도구를 여는 법, 도구와 실행 이름의 짝 — 컴퓨터 관리(`compmgmt.msc` — 무엇을 모아 둔 것인지), 장치 관리자(`devmgmt.msc`), 로컬 그룹 정책 편집기(`gpedit.msc` — step 4가 확인했으면 그 줄), 로컬 보안 정책(`secpol.msc`), 이벤트 뷰어(`eventvwr.msc`), 인증서 관리자(`certmgr.msc`), 성능 모니터(`perfmon`·`perfmon.msc`) — 문서가 실행 이름을 보이는 곳마다. **`.msc`를 빼고 적으면 열리는지**(`compmgmt`만 적었을 때)를 말하는 공식 문서가 있는지 — 없으면 못 찾았다고 적는다(지어서 판정하지 않는다). **[기출 2025-08-24 #41]**(`compmgmt` – 컴퓨터 관리를 틀린 짝으로 본다)와 **[기출 2024-08-25 #37]**(인증서 관리자를 여는 명령 `certmgr.msc`)을 판정한다 | MMC 문서(`troubleshoot/windows-server/system-management-components/…`, `windows/win32/mmc/…` 또는 `previous-versions`), Windows 도구·관리 도구 문서(`windows/client-management/client-tools/…`), `windows-server/administration/windows-commands/perfmon`(있으면), 각 도구 문서, ko-kr 판 |
| n | `event-viewer` | 이벤트·이벤트 로그·이벤트 뷰어가 무엇인지(`eventvwr.msc`), 이벤트 한 건에 담기는 것(수준 — 정보·경고·오류·위험 등, 날짜와 시간, 원본, 이벤트 ID — 문서의 말), **종료·재부팅 기록**이 어느 로그에 남는지와 그 이벤트 ID(누가·왜 끈 것을 남기는 이벤트, 예기치 않은 종료 — 문서에 있는 것만, ID를 지어내지 않는다), 끌 때 이유를 적게 하는 **종료 이벤트 추적기**(Shutdown Event Tracker — 무엇이고 Windows Server에서 기본으로 켜져 있는지). **[기출 2024-08-25 #39]·[기출 2025-11-02 #38]**(같은 문항 — 지난 종료·재부팅 기록을 보는 곳은 이벤트 뷰어)을 판정한다 | 이벤트 로그 문서(`windows/win32/eventlog/…`, `windows/win32/wes/…`), 종료 이벤트 추적기·종료 이벤트 ID를 다루는 문제 해결 문서(`troubleshoot/windows-server/…`), ko-kr 판 |
| o | `windows-logs` | 이벤트 뷰어의 「Windows 로그」에 드는 로그(응용 프로그램·보안·Setup·시스템·전달된 이벤트 — 한국어 화면 이름)와 각각 무엇을 남기는지, 「응용 프로그램 및 서비스 로그」가 무엇인지와 그 아래에 드는 것의 예(하드웨어 이벤트·Windows PowerShell 등 — 문서에 있는 것만), 어느 일이 어느 로그에 남는지 예 셋(로그온 실패 → 보안, 서비스 시작 실패 → 시스템, 프로그램 오류 → 응용 프로그램 — 근거가 있는 것만). **[기출 2025-08-24 #30]**(Windows 로그에 드는 것 — 응용 프로그램, 오답 하드웨어 이벤트·인터넷 익스플로러·Windows PowerShell)을 판정한다 | 이벤트 로그 문서(`windows/win32/eventlog/eventlog-key` 등 — Application·Security·System), 이벤트 채널·「Applications and Services Logs」 문서, 이벤트 전달 문서(Forwarded Events — 이름만), ko-kr 판 |
| p | `performance-monitor` | 성능 모니터가 무엇인지(성능 카운터의 값을 그래프로 보고 모으는 도구 — `perfmon`), **성능 카운터**의 뜻과 이름의 꼴(`\개체(인스턴스)\카운터` — 예 `\Processor(_Total)\% Processor Time`), **데이터 수집기 집합**(고른 카운터를 정한 간격으로 모아 로그 파일로 남기는 설정 — 일정·멈춤 조건)과 보고서, 실행 이름(`perfmon` — `perfmon /res`처럼 다른 것을 여는 옵션은 한 줄). **[기출 2025-05-25 #35]**(일정 주기로 데이터를 모으려 성능 모니터를 시작하는 명령 `perfmon`)을 판정한다 | 성능 모니터·데이터 수집기 집합 문서(`windows-server/administration/performance-tuning/…`, `troubleshoot/windows-server/performance/…`, 지금 판에 없으면 `previous-versions` 「Windows Performance Monitor」), 성능 카운터 문서(`windows/win32/perfctrs/…`), ko-kr 판 |
| q | `resource-monitor` | 리소스 모니터가 무엇인지(CPU·메모리·디스크·네트워크를 프로세스마다 실시간으로 보여 주는 도구), 실행 이름(`resmon`, `perfmon /res`)과 여는 다른 자리(작업 관리자·성능 모니터 — 문서대로), 탭(개요·CPU·메모리·디스크·네트워크)과 탭마다 보이는 것(네트워크 탭의 프로세스별 사용량·연결·수신 대기 포트 등 — 문서에 있는 것만), 작업 관리자와의 관계(phase 71 항목이 있으면 그 줄). 방화벽 설정은 리소스 모니터의 일이 아니라는 것(탭 목록으로 판정). **[기출 2024-11-03 #36]**(리소스 모니터에서 점검할 수 없는 것 — Firewall)과 그 문제문이 리소스 모니터의 기능처럼 적은 「업데이트·설치 정보, 주요 이벤트와 날짜」가 리소스 모니터의 기능인지(다른 도구 — 안정성 모니터 등 — 의 기능인지 문서로 판정), **[기출 2026-02-01 #42]**(CPU·메모리·네트워크·디스크를 실시간으로 — Resource Monitor)를 판정한다 | 리소스 모니터 문서(`troubleshoot/windows-server/…`, `previous-versions`, `windows-server/administration/windows-commands/…`), 작업 관리자 항목(phase 71), ko-kr 판 |
| r | `powershell` | PowerShell이 무엇인지(명령줄 셸이자 스크립트 언어 — 문서의 말), **cmdlet**(동사-명사 꼴), 결과가 객체라는 것(한 줄), **별칭**(alias — `dir`·`cd`·`copy` 같은 이름이 cmdlet에 이어진다, `dir` → `Get-ChildItem`, `Get-Alias`), 외부 실행 파일(`ipconfig`·`ping` 등 — 네이티브 명령)을 그대로 실행한다는 것, **대소문자를 가리지 않는다**는 근거(명령 이름·매개 변수 — 문서의 말), 스크립트가 글자 파일(`.ps1`)이고 콘솔에서 대화형으로도 쓴다는 것, **실행 정책**(무엇이고 Windows Server의 기본값 — 판), Windows PowerShell 5.1과 PowerShell 7의 관계(한 줄). **[기출 2024-11-03 #31]·[기출 2026-08-02 #30]**(같은 문항 — 「기존 DOS 명령은 쓸 수 없다」를 틀린 말로, 대화형·텍스트·대소문자 무시를 맞는 말로)을 판정하고, 「DOS 명령」이라는 말을 본문에서 어떻게 다룰지 정한다(문서가 쓰는 말 — cmd 명령·네이티브 명령·별칭 — 로) | `powershell/scripting/overview`, `powershell/module/microsoft.powershell.core/about/about_aliases`, `about_case-sensitivity`(있으면), `about_execution_policies`, `about_scripts`, `about_command_precedence` 또는 네이티브 명령 문서, `powershell/scripting/whats-new/differences-from-windows-powershell`, ko-kr 판 |
| s | `certificate-manager` | 인증서·개인 키의 뜻(phase 78의 TLS 항목이 있으면 그 줄을 쓴다), **인증서 관리자** `certmgr.msc`가 무엇을 보는지(현재 사용자 저장소 — 로컬 컴퓨터 저장소는 `certlm.msc` — 문서대로), 인증서를 **내보내고 가져오는** 일과 **파일 형식** — `.cer`(DER·Base64 — 인증서만), `.p7b`(PKCS #7 — 인증서 여럿·인증서 경로), `.pfx`(PKCS #12 — 인증서와 개인 키, 암호로 보호), `.sst`(Microsoft 직렬 인증서 저장소) — 문서가 이 형식들을 함께 보이는 곳(인증서 내보내기 마법사·`Export-Certificate`·`Export-PfxCertificate` 등), 개인 키를 내보낼 수 있으려면 무엇이 필요한지(한 줄). **[기출 2024-08-25 #37]**(인증서 키를 복원하려 인증서 관리자를 여는 명령 — `certmgr.msc`)을 판정한다 | 인증서 관리 문서(`windows-server/identity/ad-cs/…`의 인증서 내보내기, `windows/security/…`, `powershell/module/pki/export-certificate`·`export-pfxcertificate`, `previous-versions`의 인증서 내보내기 마법사 문서), ko-kr 판 |
| t | `efs` | EFS가 무엇인지(NTFS의 파일·폴더를 사용자마다 암호화 — 문서의 말, NTFS의 뜻 한 줄), 켜는 자리(파일 속성 → 고급 → 내용을 암호화 — 문서가 보이는 만큼), 사용자의 인증서와 키로 암호화·해독하고 다른 사용자는 열 수 없다는 것, **키를 잃으면 열 수 없다**는 것과 인증서·개인 키를 백업하라는 권고(`cipher /x` 같은 백업 방법 — 명령 참조), 복구 에이전트(DRA — 한 줄), 개인 키를 스마트 카드에 둘 수 있다는 근거, 암호화할 수 없는 파일(시스템 파일·압축 파일 등 — 문서대로 한 줄). **[기출 2024-02-25 #39]** — 정답(「EFS는 인증서 파일 확장자로 CER·P7B·PFX·SST를 지원한다」)이 EFS의 기능이 아니라 인증서 내보내기의 파일 형식이라는 것이 문서와 어긋나는지(EFS 인증서를 그 형식으로 내보낼 수 있다는 문서가 있으면 맞는 말로 볼 수 있다), 오답 셋(Windows 시스템 파일에만, 개인 키 보호는 암호만, 같은 사용자면 재설치해도 열린다)이 정말 틀렸는지 | `windows/win32/fileio/file-encryption`, `windows-server/administration/windows-commands/cipher`, EFS 백업·복구 에이전트 문서(`troubleshoot/windows-server/…`, `windows/security/…`, `previous-versions`), ko-kr 판 |
| u | `bitlocker` | BitLocker가 무엇인지(볼륨 전체 암호화 — 도난·분실 때 데이터 보호), TPM과의 관계(한 줄), **복구 키**(48자리 숫자 암호 등 — 문서의 말), 이동식 드라이브의 BitLocker To Go(한 줄), Windows Server에서 기능으로 설치한다는 것, **EFS와의 차이**를 말하는 문서(있으면 — 드라이브 전체와 파일 단위, 함께 쓸 수 있는지). **[기출 2024-08-25 #28]**(하드디스크 자체를 암호화 — BitLocker)을 판정한다. FileVault(기출의 오답)는 Microsoft 제품이 아니므로 확인하지 않는다 | `windows/security/operating-system-security/data-protection/bitlocker/`(개요·복구 개요·FAQ), Windows Server BitLocker 설치 문서, ko-kr 판 |
| v | `work-folders` | 클라우드 폴더(Work Folders)가 무엇인지(파일 서버의 역할 서비스 — 회사 PC와 개인 기기에서 업무 파일, 동기화 공유, 오프라인 작업 뒤 동기화, 기기 암호화·잠금 화면 암호 정책), 설치하는 자리(파일 및 저장소 서비스 아래 역할 서비스), **한국어 이름** — ko-kr 판이 같은 페이지 안에서 「클라우드 폴더」·「작업 폴더」·「워크 폴더」를 섞어 쓴다. 설치 마법사의 역할 서비스 이름으로 보이는 것과 기출의 이름(클라우드 폴더)을 근거로 하나를 골라 적는다. **OneDrive와의 차이**(문서의 비교 표 — 파일이 회사 파일 서버에 있는지 클라우드 서비스에 있는지), **지원 상태**(Windows Server의 「제거되었거나 더 이상 개발되지 않는 기능」 목록에 있는지 — 판). **[기출 2024-02-25 #43]**(더 많은 위치와 장치에서 데이터에 접근 — 클라우드 폴더)을 판정한다 | `windows-server/storage/work-folders/work-folders-overview`(en-us·ko-kr), `windows-server/get-started/removed-deprecated-features-windows-server` |

빠진 것을 읽다가 찾으면 더한다. **step 0·4가 확인한 사실은 다시 확인하지 않는다.** PowerShell 문법·원격 실행, 이벤트 구독 설정, 성능 카운터 전체 목록, BitLocker 보호기 종류 전체·설정 절차, 클라우드 폴더 배포 절차는 정리하지 않는다(guide.md 「배경」).

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 80 step 8) Microsoft Learn — <문서 제목들>`, URL 한 줄씩, **갱신 날짜와 적용 대상** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 제목`, 「쓰인 곳」.
  같은 문서의 기존 항목(phase 71의 작업 관리자, phase 78의 Windows 명령·TLS, step 0·4의 항목)이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 80 step 8)」을 붙인 줄로 더한다.
- 문서가 여럿이면 주제별로 모은다(예: 「MMC와 실행 이름」, 「이벤트 뷰어와 로그」, 「성능 모니터·리소스 모니터」, 「PowerShell」, 「인증서·EFS·BitLocker」, 「클라우드 폴더」). 항목마다 **한국어 이름** 줄을 둔다.
- 「쓰인 곳」에는 **쓰일 개념 id**와 exam-notes 번호를 적는다.
- 머리의 「확인한 날」 문단들 끝에 「(phase 80 step 8)」이 붙은 줄과 항목이 무엇인지 한 문장을 더한다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 주제의 기출 13문항이 정답으로 보는 것(과 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 step 4가 더한 마지막 번호 다음부터 `## E… — …`로 이어 더한다(형식 — 시험·공식 문서·처리·쓰인 곳).
공식 문서에 있으면 항목을 만들지 않는다. step 0·4의 문단처럼, 이 step이 본 문항 수와 더한 항목을 소개하고 공식 문서와 맞는 문항들을 한 줄씩 짚는 문단을 둔다(확인한 날 포함).

미리 본 것 — 판정은 이 step이 출처를 읽고 한다:
- [기출 2025-08-24 #41]의 「`compmgmt`만 적으면 실행되지 않는다(컴퓨터 관리와 짝이 맞지 않는다)」 — 공식 문서가 이것을 말하지 않으면 항목을 만든다. 처리 예: 본문은 문서가 보이는 실행 이름(`compmgmt.msc`)을 쓰고 「자격시험은 `.msc`를 뺀 `compmgmt`를 열리지 않는 것으로 본다」를 덧붙이며,
  문항은 `.msc`를 뺀 꼴이 열리는지를 정답이나 오답의 근거로 쓰지 않는다. 문서가 확장자 규칙을 말하면 그 사실로 처리한다.
- [기출 2024-02-25 #39]의 정답 「EFS는 인증서 파일 확장자로 CER·P7B·PFX·SST를 지원한다」 — 그 형식들은 인증서를 내보내는 파일 형식이다. EFS 문서와 어긋나면 항목을 만들고, 본문(`efs`·`certificate-manager`)은 문서의 사실(인증서를 그 형식들로 내보내고 가져온다, EFS 키는 `.pfx`로 백업한다)로 쓰고
  「자격시험은 이 형식들을 EFS가 지원하는 인증서 형식으로 본다」를 한 줄 덧붙인다.
- [기출 2024-11-03 #31]·[기출 2026-08-02 #30]의 「기존 DOS 명령」 — PowerShell 문서는 DOS라 부르지 않는다. 답(쓸 수 있다)은 같으므로 어긋나면 문단 한 줄로 적고, 본문이 쓸 말(별칭·외부 실행 파일)을 정한다.
- [기출 2024-11-03 #36]의 문제문이 리소스 모니터의 기능처럼 적은 「소프트웨어 업데이트·설치 정보와 주요 이벤트·날짜」 — 다른 도구의 기능이면 문단 한 줄로 적는다(답 — 방화벽은 점검하지 않는다 — 은 탭 목록으로 판정). 본문은 그 기능을 리소스 모니터에 붙이지 않는다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`windows-admin-tools`의 개념 13~22마다 한 줄씩: **무엇을 쓸 수 있는지(문서·갱신 날짜·절), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호), 한국어 이름**.
위 표의 m~v마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
특히 다음을 개념 step이 그대로 쓸 수 있게 적는다.
- 도구와 실행 이름의 짝 표(도구의 한국어 화면 이름, 실행 이름, 근거)와 `.msc`를 뺀 꼴의 판정.
- 이벤트 한 건의 칸, 종료·재부팅 기록의 로그와 이벤트 ID(문서에 있는 것만), 종료 이벤트 추적기.
- Windows 로그 다섯의 한국어·영문 이름과 하는 일, 응용 프로그램 및 서비스 로그의 예, 어느 일이 어느 로그에 남는지 예.
- 성능 카운터 이름의 꼴, 데이터 수집기 집합의 뜻, 리소스 모니터의 탭과 실행 이름.
- PowerShell의 cmdlet 꼴·별칭 예·대소문자·`.ps1`·실행 정책 기본값·5.1과 7의 관계.
- 인증서 파일 형식 표(형식, 담는 것, 개인 키를 담는지), EFS의 켜는 자리·백업 방법·DRA·스마트 카드, BitLocker의 TPM·복구 키·To Go, EFS와 BitLocker의 차이 근거.
- 클라우드 폴더의 한국어 이름과 고른 근거, OneDrive와의 차이, 지원 상태.
- 기출 판정 줄: 13문항 각각.
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
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 판(갱신 날짜·적용 대상)을 적었는지, 문장이 원문(영문·한국어 판)을 옮기지 않았는지 다시 본다. cmdlet·도구 설명을 번역해 옮기는 것도 전사다.
4. `phases/80-network-windows-ad-tools/index.json`의 step 8을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 9~13이 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 이벤트 ID·기본값·실행 이름을 지어내지 않는다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **learn.microsoft.com 밖의 문서(위키백과·블로그·업체 학습 페이지·Q&A 사이트, Microsoft Q&A·TechNet 포럼·Tech Community 블로그)를 근거로 쓰지 마라.** 이유: ADR-059.
  꼭 필요한 곳이 목록에 없으면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **기존 항목의 줄을 고치거나 지우지 마라.** 이유: 앞 phase와 step 0·4의 줄을 근거로 쓰는 개념이 있다. 더할 것은 「(phase 80 step 8)」 줄로 더한다.
- **PowerShell 문법·원격 실행, 이벤트 구독, 성능 카운터 전체 목록, BitLocker 보호기 전체·설정 절차, 클라우드 폴더 배포 절차를 정리하지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **`lecture-outline.md`·`interview-facts.md`·`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 강의·면접은 이 주제를 다루지 않고, 이 phase는 새 출처를 더하지 않는다.
