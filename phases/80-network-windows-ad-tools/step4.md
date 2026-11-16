# Step 4: ad-sources-b

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다 — 둘 다 강의 밖 주제다. 전체 계획과 결정은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
step 5~7이 `windows-ad`의 뒤 개념 6개(조직 구성 단위, 도메인 사용자 계정, ds 명령, 그룹 종류와 범위, 그룹 정책, 암호 정책과 계정 잠금 정책)를 쓰기 전에,
**이 step은 그 개념들이 쓸 사실을 learn.microsoft.com으로 확인하고 출처 문서에 남긴다.** 데이터·코드는 고치지 않는다.

기출 14문항 가운데 이 step의 여섯 개념에 걸린 5문항이 묻는 것은 한 도메인 안을 부서로 나눌 때 설정하는 것(OU — 오답 DC·RODC·사이트), 도메인 사용자 계정 관리(「Active Directory 사용자 및 컴퓨터」에서 만들고 보안 그룹에 넣는다),
도메인 사용자 계정을 다루는 명령이 아닌 것(`net user` — `dsadd`·`dsmod`·`dsrm`은 도메인 명령), 지문이 설명하는 AD 그룹(유니버설 — 지문이 그림), 그룹 정책으로 할 수 없는 일로 둔 「소프트웨어를 배포할 수 없다」다.

## 읽어야 할 파일

- `phases/80-network-windows-ad-tools/guide.md` — 특히 「배경」, 「두 주제와 개념 22개」의 `windows-ad` 표 7~12행, 「예시 값」, 「출처」
- `phases/80-network-windows-ad-tools/index.json`의 step 0 `summary`(앞 개념 여섯의 사실 — 로컬 계정·그룹·AD DS·DC·도메인 구조·트러스트. 다시 찾지 않는다)와 step 1~3 `summary`(본문에 쓴 말 — 뜻을 맞춘다)
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과 「(phase 80 step 0)」 항목들(같은 문서면 그 항목에 줄을 더한다). **있는 사실을 다시 찾지 않는다**
- `docs/source/network/exam-notes.md` — 형식과 step 0이 더한 문단·항목, 마지막 번호
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `src/data/network/topics.json`의 `windows-ad`(step 1~3이 쓴 여섯 개념) — 이 step이 확인할 사실이 기대는 말
- 기출: `docs/source/network/raw/exam/data.txt`에서 `X-windows`로 분류한 줄 가운데 이 step의 5문항과 그 문항(교사용 텍스트) —
  [기출 2025-02-23 #42], [기출 2026-08-02 #43], [기출 2025-08-24 #38], [기출 2026-02-01 #43], [기출 2024-08-25 #34].
  [기출 2026-02-01 #43]은 지문이 그림이라 보기와 정답만 본다. 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 learn.microsoft.com이다(영문 `en-us`와 한국어 `ko-kr` 판). **판을 적는다** — 페이지의 갱신 날짜와 적용 대상. 지난 판 문서(`previous-versions`)는 지금 판에 없을 때만 쓰고 그 판을 적는다.
응답이 느리면 `curl -4`로 다시 받는다. 위키백과·블로그·업체 학습 페이지·Q&A 사이트(Microsoft Q&A·TechNet 포럼·Tech Community 블로그 포함)는 쓰지 않는다.
**한국어 이름**: 개념마다 학습자에게 보일 한국어 이름(도구·정책 설정·그룹 범위의 이름)을 ko-kr 판에서 확인해 적는다. 이름이 갈리면 화면 이름과 기출이 쓰는 이름을 고르고 까닭을 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| g | `organizational-unit` | OU가 무엇인지(도메인 안의 컨테이너 — 사용자·그룹·컴퓨터·다른 OU를 담는다), 쓰임 — 그룹 정책을 연결하는 단위, 관리 권한 위임의 단위(문서의 말), OU와 그룹의 차이를 말하는 문서(있으면), 부서·지역을 나누려고 도메인 대신 OU를 쓴다는 근거(있으면), 기본 컨테이너(`Users`·`Computers`)가 OU가 아니라 그룹 정책을 바로 연결할 수 없다는 근거. **사이트**가 무엇인지(빠르고 안정적인 연결로 이어진 서브넷의 묶음 — 복제와 로그온 트래픽을 조절, 논리 구조와 별개인 물리 구조) — 한 줄에 필요한 만큼만. **[기출 2025-02-23 #42]**의 정답(OU)과 오답(DC·RODC·Site)이 문서와 맞는지 | AD DS 개요, OU 설계·위임 문서(`windows-server/identity/ad-ds/plan/…`의 OU·위임 문서), 사이트 문서(`windows-server/identity/ad-ds/plan/…` 사이트 토폴로지), 그룹 정책 개요(연결 단위), ko-kr 판 |
| h | `domain-user-accounts` | 도메인 사용자 계정이 무엇인지(AD DS에 저장된 계정 — 도메인 컴퓨터에 로그온하고 도메인 자원에 접근), 만드는 도구 「Active Directory 사용자 및 컴퓨터」(실행 이름 `dsa.msc` — 문서의 근거)와 만드는 차례(OU 고르기 → 새 사용자 → 그룹의 구성원으로 넣기 — 문서가 보이는 만큼), 계정 설정(다음 로그온 때 암호 바꾸기, 암호를 바꿀 수 없음, 암호 사용 기간 제한 없음, 계정 사용 안 함 — `understand-default-user-accounts`의 계정 설정 표), 계정을 만든 것만으로 자원에 접근하는 것이 아니라 사용 권한이 정한다는 근거, 암호가 도메인 암호 정책을 따른다는 근거. **[기출 2026-08-02 #43]**의 정답과 오답 셋(암호 정책을 사용자가 임의로, 별도 권한 없이 모든 자원, 로컬 계정만 만들 수 있다)이 문서와 맞는지 | `windows-server/identity/ad-ds/manage/understand-default-user-accounts`, AD 사용자 및 컴퓨터 문서(`windows-server/identity/ad-ds/…` 또는 `previous-versions`·`troubleshoot`), `windows/security/identity-protection/access-control/active-directory-accounts`(있으면), ko-kr 판 |
| i | `ds-commands` | `dsadd`·`dsmod`·`dsrm`·`dsquery`·`dsget`·`dsmove`가 각각 무엇을 하는지와 다루는 개체 종류(사용자·그룹·컴퓨터·OU 등), 명령 참조 문서의 판과 적용 대상, 이 명령들을 쓰려면 무엇이 설치돼 있어야 하는지(AD DS 역할 또는 관리 도구 — 문서대로 한 줄), 개체를 **고유 이름**(DN)으로 가리킨다는 것과 그 꼴(`CN=…,OU=…,DC=…,DC=…`), `dsadd user` 한 줄의 꼴(문서의 예가 보이는 꼴 — 값은 guide.md 「예시 값」으로 바꿔 쓸 수 있게). **`net user`**: 로컬 계정을 다루는 명령이라는 것, `/domain` 옵션이 무엇을 하는지(도메인 컨트롤러에서 도메인 계정을 다루는지 — 문서의 말 그대로 판정), 그래서 **[기출 2025-08-24 #38]**이 `net user`를 「도메인 사용자 계정을 관리하는 명령이 아니다」로 보는 것이 문서와 어긋나는지. 지금 Microsoft가 AD 관리에 권하는 PowerShell 모듈(`ActiveDirectory` 모듈의 `New-ADUser` 등)은 이름만 한 줄 — 근거가 있을 때만 | `windows-server/administration/windows-commands/dsadd`(와 `dsadd-user`), `dsmod`, `dsrm`, `dsquery`, `dsget`, `dsmove`, `net-user`, ko-kr 판 |
| j | `group-scopes` | 그룹 **종류**(보안 그룹 — 사용 권한·권한을 줄 수 있다, 배포 그룹 — 메일 배포 목록이라 사용 권한에 쓸 수 없다)와 **범위**(도메인 로컬·글로벌·유니버설 — 각각 누구를 구성원으로 넣을 수 있는지, 그 그룹을 어디의 사용 권한에 쓸 수 있는지, 범위를 바꿀 수 있는 조건은 한 줄), 문서의 범위 표를 자기 말로 범위마다 한 문장씩 적는다. 로컬 그룹(한 컴퓨터의 그룹 — step 0의 기본 로컬 그룹)과 도메인 로컬 그룹의 차이, 유니버설 그룹의 구성원 목록이 글로벌 카탈로그에 복제된다는 것(이름만 한 줄 — 동작은 쓰지 않는다). 글로벌 그룹을 도메인 로컬 그룹에 넣고 사용 권한을 도메인 로컬 그룹에 주는 권고가 문서에 있는지(있으면 한 줄). 한국어 이름(도메인 로컬·글로벌·유니버설, 보안 그룹·배포 그룹). **[기출 2026-02-01 #43]** — 지문이 그림이라 정답(유니버설)만 남았다. 판정할 수 있는 만큼만 적는다 | `windows-server/identity/ad-ds/manage/understand-security-groups`(Group scope·Group types 절), ko-kr 판 |
| k | `group-policy` | 그룹 정책이 무엇인지, **그룹 정책 개체**(GPO), GPO를 사이트·도메인·OU에 **연결**한다는 것, 컴퓨터 구성과 사용자 구성, **적용 차례**(로컬 → 사이트 → 도메인 → OU, 나중 것이 앞 것을 덮는다 — 문서의 말), 할 수 있는 일 — 보안 설정, **소프트웨어 설치**(GPO로 프로그램을 배포 — 문서의 근거), **폴더 리디렉션**과 **로밍 사용자 프로필**(어느 PC에서 로그온해도 같은 파일·환경 — 문서의 근거), 로그온 스크립트. 도구 — 그룹 정책 관리 콘솔(`gpmc.msc`)·그룹 정책 관리 편집기, 로컬 그룹 정책 편집기(`gpedit.msc` — 한 컴퓨터의 로컬 GPO), `gpupdate`(정책을 바로 다시 적용 — 명령 참조). 한국어 이름. **[기출 2024-08-25 #34]**의 맞는 말로 두는 셋(암호·계정 잠금을 강제, 암호 길이·복잡성 지정, 어느 PC에서나 같은 환경)과 틀린 말(소프트웨어를 배포할 수 없다)이 문서와 맞는지 | `windows-server/identity/ad-ds/manage/group-policy/group-policy-overview`, 그룹 정책 처리 문서(적용 차례), 소프트웨어 설치 문서(지금 판에 없으면 `previous-versions`), `windows-server/storage/folder-redirection/…`(폴더 리디렉션·로밍 사용자 프로필), `windows-server/administration/windows-commands/gpupdate`, ko-kr 판 |
| l | `password-lockout-policy` | 계정 정책의 **암호 정책** 설정(최소 암호 길이, 암호는 복잡성을 만족해야 함 — 무엇을 요구하는지, 최대 암호 사용 기간, 최소 암호 사용 기간, 최근 암호 기억)과 **계정 잠금 정책** 설정(계정 잠금 임계값, 계정 잠금 기간, 다음 시간 후 계정 잠금 수 원래대로 설정 — 셋의 관계), 각 설정의 **기본값**(판 — 도메인 기본값과 독립 실행 서버 기본값이 다르면 둘 다), 잠긴 동안에는 바른 암호로도 로그온할 수 없다는 근거, 잠금 기간을 0으로 두면 관리자가 풀 때까지 잠긴다는 것(문서대로 한 줄), 도메인 계정의 암호·잠금 정책이 도메인에 연결된 GPO(Default Domain Policy)에서 정해진다는 근거, 각 설정의 한국어 화면 이름(ko-kr 판). 세분화된 암호 정책은 이름만 확인하고 정리하지 않는다 | `windows/security/threat-protection/security-policy-settings/password-policy`, `account-lockout-policy`와 설정마다의 문서(`minimum-password-length`, `password-must-meet-complexity-requirements`, `maximum-password-age`, `enforce-password-history`, `account-lockout-threshold`, `account-lockout-duration`, `reset-account-lockout-counter-after`), ko-kr 판 |

빠진 것을 읽다가 찾으면 더한다. **step 0이 확인한 사실은 다시 확인하지 않는다.** 그룹 정책의 상속 차단·강제·보안 필터링·WMI 필터, 세분화된 암호 정책, 글로벌 카탈로그의 동작은 정리하지 않는다(guide.md 「배경」).

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 80 step 4) Microsoft Learn — <문서 제목들>`, URL 한 줄씩, **갱신 날짜와 적용 대상** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 제목`, 「쓰인 곳」.
  step 0이 만든 항목과 같은 문서(예: `understand-security-groups`, `understand-default-user-accounts`)면 새 항목을 만들지 말고 그 항목에 「(phase 80 step 4)」를 붙인 줄로 더한다.
- 문서가 여럿이면 주제별로 모은다(예: 「OU와 사이트」, 「도메인 계정과 ds 명령」, 「그룹 범위」, 「그룹 정책」, 「계정 정책」). 항목마다 **한국어 이름** 줄을 둔다.
- 「쓰인 곳」에는 **쓰일 개념 id**와 exam-notes 번호를 적는다.
- 머리의 「확인한 날」 문단들 끝에 「(phase 80 step 4)」가 붙은 줄과 항목이 무엇인지 한 문장을 더한다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 step의 기출 5문항이 정답으로 보는 것(과 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 step 0이 더한 마지막 번호 다음부터 `## E… — …`로 이어 더한다(형식 — 시험·공식 문서·처리·쓰인 곳).
공식 문서에 있으면 항목을 만들지 않는다. step 0의 문단처럼, 이 step이 본 문항 수와 더한 항목을 소개하고 공식 문서와 맞는 문항들을 한 줄씩 짚는 문단을 둔다(확인한 날 포함).

미리 본 것 — 판정은 이 step이 출처를 읽고 한다:
- [기출 2025-08-24 #38]의 「`net user`는 도메인 사용자 계정을 관리하는 명령이 아니다」 — `net user`의 `/domain` 옵션이 도메인 계정을 다룬다고 문서가 말하면 어긋난다. 어긋나면 항목을 만들고 처리를 정한다
  (예: 본문은 `net user`가 기본으로 로컬 계정을 다루고 `/domain`을 붙이면 도메인 컨트롤러에서 다룬다는 문서의 사실을 쓰고 「자격시험은 `net user`를 도메인 계정 명령으로 보지 않는다」를 덧붙인다. 문항은 `net user`를 정답도 오답도 아닌 자리에 두지 않는다 — 판정이 갈리지 않는 보기만 쓴다).
- [기출 2026-08-02 #43]의 오답 「도메인 사용자 계정을 만들면 별도 권한 설정 없이 모든 네트워크 자원에 접근」 — 도메인 사용자는 기본으로 Domain Users·Users 그룹에 들어 그 그룹이 가진 사용 권한은 받는다. 「모든 자원」이 아니라는 근거가 있으면 문단 한 줄로.
- [기출 2024-08-25 #34]의 「어느 PC에서 로그온해도 같은 환경」 — 그룹 정책 자체의 기능인지, 그룹 정책으로 설정하는 폴더 리디렉션·로밍 사용자 프로필인지 문서의 말로 판정한다. 답(소프트웨어 배포가 된다)은 같으므로 어긋나도 문단 한 줄이면 된다.
- [기출 2026-02-01 #43] — 지문이 그림이라 판정할 수 없으면 항목을 만들지 않고 그렇게 적는다. 개념 step은 그룹 범위의 사실만 가르친다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`windows-ad`의 개념 7~12마다 한 줄씩: **무엇을 쓸 수 있는지(문서·갱신 날짜·절), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호), 한국어 이름**.
위 표의 g~l마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
특히 다음을 개념 step이 그대로 쓸 수 있게 적는다.
- OU의 쓰임 둘과, OU·그룹·도메인·사이트의 구분 한 줄씩.
- 도메인 사용자 계정을 만드는 차례(도구 이름·메뉴 이름 — 한국어 화면 이름)와 계정 설정 넷.
- `ds` 명령 표(명령, 하는 일, 다루는 개체), DN의 꼴, `dsadd user` 한 줄의 꼴, `net user`와 `/domain`의 판정.
- 그룹 범위 셋의 「넣을 수 있는 구성원 / 쓸 수 있는 곳」 한 문장씩과 그룹 종류 둘.
- 그룹 정책의 연결 단위·적용 차례·할 수 있는 일(기출이 묻는 넷)·도구 이름·`gpupdate`.
- 계정 정책 설정 표(한국어 화면 이름, 영문 이름, 하는 일, 기본값과 판)와 잠금 계산에 필요한 규칙(임계값·기간·초기화 시간의 관계, 잠긴 동안 바른 암호도 안 되는지).
- 기출 판정 줄: OU, 도메인 계정 관리, `net user`, 유니버설 그룹, 그룹 정책 설정.
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
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 판(갱신 날짜·적용 대상)을 적었는지, 문장이 원문(영문·한국어 판)을 옮기지 않았는지 다시 본다. 정책 설정의 설명을 번역해 옮기는 것도 전사다.
4. `phases/80-network-windows-ad-tools/index.json`의 step 4를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 5~7이 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **learn.microsoft.com 밖의 문서(위키백과·블로그·업체 학습 페이지·Q&A 사이트, Microsoft Q&A·TechNet 포럼·Tech Community 블로그)를 근거로 쓰지 마라.** 이유: ADR-059.
  꼭 필요한 곳이 목록에 없으면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **기존 항목의 줄을 고치거나 지우지 마라.** 이유: 앞 phase와 step 0의 줄을 근거로 쓰는 개념이 있다. 더할 것은 「(phase 80 step 4)」 줄로 더한다.
- **그룹 정책의 상속 차단·강제·보안 필터링·WMI 필터, 세분화된 암호 정책, 글로벌 카탈로그의 동작, PowerShell AD 모듈의 cmdlet 목록을 정리하지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **`lecture-outline.md`·`interview-facts.md`·`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 강의·면접은 이 주제를 다루지 않고, 이 phase는 새 출처를 더하지 않는다.
