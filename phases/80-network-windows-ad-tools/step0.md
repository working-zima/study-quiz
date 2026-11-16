# Step 0: ad-sources-a

## 배경

phase 80은 네트워크 과목의 `windows-ad`(Active Directory와 그룹 정책)와 `windows-admin-tools`(Windows 관리 도구와 보안 기능)를 만든다 — 둘 다 강의 밖 주제다. 전체 계획과 결정은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
step 1~3이 `windows-ad`의 앞 개념 6개(로컬 사용자 계정, 기본 로컬 그룹, Active Directory 도메인 서비스, 도메인 컨트롤러, 도메인·트리·포리스트, 트러스트)를 쓰기 전에,
**이 step은 그 개념들이 쓸 사실을 허용한 공식 문서(learn.microsoft.com)로 확인하고 출처 문서에 남긴다.** 데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

이 주제는 강의가 다루지 않으므로 **사실의 출처는 learn.microsoft.com 하나뿐이다**(ADR-059). 기출 14문항 가운데 이 step의 여섯 개념에 걸린 9문항이 묻는 것은
기본 로컬 사용자 계정(root는 아니다), 기본 로컬 그룹이 할 수 있는 일(셋), Active Directory가 하는 일, 트러스트(넷 — 둘은 지문이 그림)다. 도메인 컨트롤러·읽기 전용 도메인 컨트롤러·도메인·트리·포리스트·사이트는 오답 보기로 나온다.

## 읽어야 할 파일

- `phases/80-network-windows-ad-tools/guide.md` — 특히 「배경」, 「두 주제와 개념 22개」의 `windows-ad` 표 1~6행, 「예시 값」, 「출처」
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과 기존 항목의 형식(특히 「(phase 79 step 5) Microsoft Learn — …」 항목들), 이미 있는 Microsoft Learn 항목(phase 71·74·77·78·79), RFC 2606 항목. **있는 사실을 다시 찾지 않는다** — 그 항목에 줄을 더한다
- `docs/source/network/exam-notes.md` — 형식(E27~E34)과 마지막 번호(phase 79는 항목을 더하지 않았다 — 다음 번호는 **E35**), phase 79 step 0·5·9가 더한 「대조 문단」의 꼴
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `src/data/network/topics.json`의 `linux-accounts.user-account`(root), `linux-permissions`의 소유자·그룹·권한, `dns.domain-hierarchy`·`dns.dns-zone`(Windows DNS 서버 쪽 말) — 이미 가르친 사실(뜻을 맞춘다)
- 기출: `docs/source/network/raw/exam/data.txt`에서 `X-windows`로 분류한 줄 가운데 이 step의 9문항과 그 문항(시험 날짜·번호로 교사용 텍스트에서 찾는다) —
  [기출 2024-02-25 #41], [기출 2024-05-19 #33·#34], [기출 2024-08-25 #30], [기출 2024-11-03 #35], [기출 2025-05-25 #40], [기출 2025-08-24 #34], [기출 2026-05-17 #43], [기출 2026-08-02 #36].
  시험이 무엇을 정답으로 보는지와 「옳지 않은 것」을 고르는 문항에서 맞는 말로 두는 보기만 본다. [기출 2024-08-25 #30]·[기출 2026-08-02 #36](같은 문항)은 지문이 그림이라 보기와 정답만 본다. 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 learn.microsoft.com이다(영문 `en-us`와 한국어 `ko-kr` 판). **판을 적는다** — 페이지의 갱신 날짜와 적용 대상(Windows Server의 판·Windows 판). 지난 판 문서(`previous-versions`)는 지금 판에 없을 때만 쓰고 그 판을 적는다.
응답이 느리면 `curl -4`로 다시 받는다. 위키백과·블로그·업체 학습 페이지·Q&A 사이트(Microsoft Q&A·TechNet 포럼·Tech Community 블로그 포함)는 쓰지 않는다.
**한국어 이름**: 개념마다 학습자에게 보일 한국어 이름(그룹·도구·구조의 이름)을 ko-kr 판에서 확인해 적는다. ko-kr 판 안에서 이름이 갈리면 화면 이름으로 보이는 것과 기출이 쓰는 이름을 고르고 그 까닭을 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `local-accounts` | 로컬 계정이 무엇인지(한 장치에 정의되고 그 장치의 자원에만 권한 — 그 장치가 보안 기관), 기본 로컬 사용자 계정의 목록과 각 계정의 성질 — Administrator(지울 수 없음·잠글 수 없음·이름 바꾸기·끄기, 설치 때 처음 만들어지는 계정, 설치 과정이 끄고 다른 관리자 계정을 만든다는 것은 판대로), Guest(기본으로 꺼짐·암호가 비어 있음), DefaultAccount(DSMA — 기본으로 꺼짐), WDAGUtilityAccount·WSIAccount 등 판에 따라 더 있는 계정(어느 판·어느 제품부터인지 — Windows Server에 있는지). 로컬 계정을 관리하는 자리(「컴퓨터 관리」의 「로컬 사용자 및 그룹」), `net user`(로컬 사용자 관리 — 명령 참조 문서의 판), 도메인 컨트롤러에서는 「로컬 사용자 및 그룹」을 쓸 수 없다는 것. 로컬 계정이 네트워크 자원에 접근하지 못한다는 문서의 말. **[기출 2024-11-03 #35]**이 기본 계정을 셋(Administrator·DefaultAccount·Guest)으로 보는 것이 지금 문서와 어긋나는지 | `windows/security/identity-protection/access-control/local-accounts`, `windows-server/administration/windows-commands/net-user`, ko-kr 판 |
| b | `local-groups` | 그룹에 넣은 계정이 그룹의 권한(사용자 권한)과 사용 권한을 받는다는 것, **권한(user right)과 사용 권한(access permission)의 구분**(local-accounts 문서의 「How to manage local user accounts」 등). 기본 그룹마다 하는 일 — Administrators, Users(기본 구성원, 할 수 있는 일, 시스템 수준 변경을 못 한다는 근거), Guests(Guest 계정이 구성원, 임시 프로필 — 문서에 있을 때만), Backup Operators, **Power Users**(지금 문서가 무엇이라 말하는지 — 옛 판 호환용인지, Administrators와 같은 권한이 아니라는 근거. AD 기본 그룹 목록에 없으면 다른 문서(보안 식별자의 잘 알려진 SID 목록 등)에서 찾는다), **Remote Management Users**(WS-Management로 WMI 자원 — 서버 관리자 원격 관리, WinRMRemoteWMIUsers__와의 구분은 한 줄), **Performance Monitor Users**와 **Performance Log Users**(무엇이 다른지 — 데이터 수집기 집합을 만들 수 있는지 등), **Access Control Assistance Operators**(권한 부여 특성과 사용 권한을 원격으로 조회), Remote Desktop Users, Replicator, RDS Endpoint Servers. 기본 그룹이 로컬 컴퓨터와 도메인(Builtin 컨테이너)에 어떻게 있는지는 한 줄 — 이 개념은 한 컴퓨터의 로컬 그룹으로 가르친다. WMI가 무엇인지 한 줄 근거. **기출 셋**의 보기를 판정한다 — [기출 2024-02-25 #41](Power Users=Administrator와 같은 권한, RDS Endpoint Servers, Remote Management Users=WMI, Performance Monitor Users=카운터·로그 관리), [기출 2024-05-19 #33](Administrators·Backup Operators·Guests·Users), [기출 2025-05-25 #40](인증 속성을 관리하는 그룹) | `windows-server/identity/ad-ds/manage/understand-security-groups`, `windows-server/identity/ad-ds/manage/understand-security-identifiers`, `windows/security/identity-protection/access-control/local-accounts`, `windows/security/threat-protection/security-policy-settings/user-rights-assignment`(필요할 때만), ko-kr 판 |
| c | `active-directory` | 디렉터리와 디렉터리 서비스가 무엇인지, AD DS가 무엇인지(디렉터리 데이터를 저장하고 네트워크 사용자·관리자가 쓰게 한다), 하는 일 — 로그온 인증과 디렉터리 정보에 따른 접근 제어·관리(문서의 말대로), 워크그룹과 도메인의 차이를 말하는 공식 문서(있으면 — 없으면 못 찾았다고 적는다), AD DS를 서버 관리자의 역할로 설치한다는 것(또는 `Install-WindowsFeature`), AD DS가 DNS로 도메인 컨트롤러를 찾는다는 것(DNS가 필요하다는 근거). **[기출 2026-05-17 #43]**의 정답(사용자 인증과 디렉터리 기반 자원 관리)이 문서와 맞는지와 오답 셋(IP 자동 할당, DNS 동적 업데이트를 기본으로 막음, 방화벽 규칙 자동 구성)이 AD DS의 일이 아니라는 근거 — DHCP·DNS는 이 화면에서 한 줄로 풀므로 그 뜻의 근거(phase 74·79 항목이 있으면 그 줄을 쓴다) | `windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview`, `windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-`, AD DS와 DNS 문서(`windows-server/identity/ad-ds/plan/…` 등), ko-kr 판 |
| d | `domain-controller` | 도메인 컨트롤러가 무엇인지(AD DS 역할을 설치한 서버 — 디렉터리 데이터베이스를 갖고 인증), 같은 도메인의 DC끼리 복제한다는 것과 어느 DC에서나 바꿀 수 있는지(다중 마스터 복제 — 문서의 말), DC를 둘 이상 두는 까닭(가용성 — 근거대로), **읽기 전용 도메인 컨트롤러**(RODC — 읽기 전용 데이터베이스, 한 방향 복제, 자격 증명 캐시, 물리 보안이 약한 지점), DC에서 「로컬 사용자 및 그룹」을 쓰지 않는다는 것(a와 겹치면 그 줄). [기출 2025-02-23 #42]의 오답 보기(DC·RODC)가 무엇인지만 — 그 문항의 정답(OU)은 step 4가 본다 | AD DS 개요, `understand-security-groups`의 Read-only Domain Controllers 절, RODC 문서(`windows-server/identity/ad-ds/…` 또는 `previous-versions`), 복제 문서(필요할 때만), ko-kr 판 |
| e | `domain-tree-forest` | 도메인·트리·포리스트가 각각 무엇인지(문서의 말 — 포리스트가 보안 경계라는 것, 같은 포리스트의 도메인들이 함께 쓰는 것(스키마·구성·글로벌 카탈로그 등 — 이름만 한 줄)), 트리가 연속된 이름 공간의 도메인 묶음이라는 것, 이름이 이어지지 않는 트리 둘이 한 포리스트에 들 수 있다는 것, 도메인 이름이 DNS 이름이라는 것. 한국어 이름(포리스트·트리·도메인). 「트리」를 정의한 지금 판 문서가 없으면 지난 판에서 찾고 판을 적는다 | AD DS 개요, AD DS 논리 구조 문서(`windows-server/identity/ad-ds/plan/…`·`previous-versions` 「Active Directory Logical Structure」 등), 트러스트 문서의 용어 절, ko-kr 판 |
| f | `trust` | 트러스트가 무엇인지(한 도메인의 사용자를 다른 도메인이 인증 받아들여 자원에 접근하게 하는 관계 — 문서의 말), **신뢰하는 도메인(trusting)과 신뢰받는 도메인(trusted)** 이 각각 어느 쪽인지(자원 쪽·계정 쪽), **방향**(단방향 — 신뢰의 방향과 접근의 방향이 반대라는 문서의 말이 있는지, 양방향), **전이성**(전이·비전이), 같은 포리스트의 부모·자식 트러스트와 트리 루트 트러스트가 저절로 만들어지는 양방향 전이 트러스트라는 것, 다른 포리스트와 잇는 트러스트(포리스트 트러스트·외부 트러스트 — 이름과 한 줄씩), 트러스트를 만들어도 자원의 사용 권한은 따로 줘야 한다는 근거. 한국어 이름(트러스트·신뢰하는 도메인·신뢰할 수 있는 도메인 등 — ko-kr 판이 쓰는 말과 화면 이름). **기출 넷**: [기출 2024-05-19 #34]·[기출 2025-08-24 #34](같은 문항 — 서로 다른 도메인의 사용자 인증·권한 부여 → 트러스트)가 문서와 맞는지, [기출 2024-08-25 #30]·[기출 2026-08-02 #36](같은 문항 — 지문 그림, 정답 트러스트)은 판정할 수 있는 만큼만 | `windows-server/identity/ad-ds/manage/how-trusts-work`(또는 「How trust relationships work for forests in Active Directory」), 트러스트 유형 문서, ko-kr 판 |

빠진 것을 읽다가 찾으면 더한다. **인증 프로토콜(Kerberos·NTLM)의 동작, FSMO, 글로벌 카탈로그의 동작, 스키마, 복제 토폴로지, 사이트는 확인하지 않는다**(guide.md 「배경」 — 사이트는 step 4가 OU 화면의 한 줄로 확인한다).

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 80 step 0) Microsoft Learn — <문서 제목들>`, URL 한 줄씩, **갱신 날짜와 적용 대상** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 제목`, 「쓰인 곳」.
  같은 문서의 기존 항목이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 80 step 0)」을 붙인 줄로 더한다.
- 문서가 여럿이면 주제별로 두세 항목에 모은다(예: 「로컬 계정과 기본 그룹」, 「AD DS·도메인 컨트롤러·논리 구조」, 「트러스트」). 항목마다 **한국어 이름** 줄(영문 → 한국어, ko-kr 판의 근거와 고른 까닭)을 둔다.
- 「쓰인 곳」에는 **쓰일 개념 id**(`windows-ad.trust` 등)와 exam-notes 번호를 적는다.
- 머리의 「확인한 날」 문단들 끝에 「(phase 80 step 0)」이 붙은 줄과 항목이 무엇인지 한 문장을 더한다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 step의 기출 9문항이 정답으로 보는 것(과 「옳지 않은 것」을 고르는 문항에서 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 **E35**부터 `## E… — …`로 이어 더한다(E27~E34 형식 — 시험·공식 문서·처리·쓰인 곳).
공식 문서에 있으면 항목을 만들지 않는다. phase 79 step 0의 문단처럼, 이 step이 본 문항 수와 더한 항목을 소개하고 공식 문서와 맞는 문항들을 한 줄씩 짚는 문단을 둔다(확인한 날 포함).
문단은 「E35~는 phase 80(`windows-ad`·`windows-admin-tools`)이 더한다」로 시작한다.

미리 본 것 — 판정은 이 step이 출처를 읽고 한다:
- [기출 2024-11-03 #35]의 「기본 로컬 계정은 셋」 — 지금 문서가 계정을 더 든다면(WDAGUtilityAccount 등) 어긋나는지, 어긋나도 답(root는 아니다)이 같으면 항목 대신 문단 한 줄로 적어도 된다. 본문이 「셋」이라고 말해도 되는지를 summary에 적는다.
- [기출 2024-02-25 #41]의 정답 「Remote Management Users는 WMI 자원과 관련된 권한」이 문서와 맞는지, 오답으로 두는 셋(Power Users=Administrator와 같은 권한, RDS Endpoint Servers=원격 데스크톱 서비스 관련 권한, Performance Monitor Users=카운터·로그 관리 권한)이 정말 틀렸는지 —
  특히 RDS Endpoint Servers의 설명은 문서의 말과 견주어 시험이 왜 틀린 말로 보는지 판정한다(판정할 수 없으면 그렇게 적고, 개념 step은 그 그룹을 문항에 쓰지 않는다).
- [기출 2024-05-19 #33]의 맞는 말로 두는 셋(Administrators에 넣으면 같은 권한, Backup Operators는 백업·복구, Guests는 임시 프로필·기본 사용 안 함)이 문서와 맞는지 — 「Guests 그룹을 기본으로 쓰지 않도록 설정한다」는 그룹이 아니라 Guest **계정**의 성질일 수 있다.
- [기출 2025-05-25 #40]의 「컴퓨터 자원에 대한 인증 속성을 관리하는 권한」 — 문서는 「조회」(query)라 말할 수 있다. 어긋나도 답이 같으면 문단 한 줄.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`windows-ad`의 개념 1~6마다 한 줄씩: **무엇을 쓸 수 있는지(문서·갱신 날짜·절), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호), 한국어 이름**.
위 표의 a~f마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
특히 다음을 개념 step이 그대로 쓸 수 있게 적는다.
- 기본 로컬 사용자 계정 목록(Windows Server의 지금 판 기준 — 판에 따라 더 있는 계정과 그 판).
- 기본 로컬 그룹 표: 그룹 이름, 하는 일(자기 말로), 근거 문서·절 — guide.md 2행의 항목 전부.
- 권한과 사용 권한의 구분, 워크그룹과 도메인의 구분(근거가 있는지).
- 트러스트의 방향 규칙(어느 쪽이 어느 쪽 자원에 접근하는지)과 전이성, 저절로 만들어지는 트러스트, 다른 포리스트와의 트러스트 이름.
- 기출 판정 줄: 기본 계정 셋, 로컬 그룹 보기 넷, 그룹 계정 보기 넷, ACAO, AD의 역할, 트러스트.
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
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 판(갱신 날짜·적용 대상)을 적었는지, 문장이 원문(영문·한국어 판)을 옮기지 않았는지 다시 본다. 그룹 설명을 번역해 옮기는 것도 전사다.
4. `phases/80-network-windows-ad-tools/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 1~3이 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **learn.microsoft.com 밖의 문서(위키백과·블로그·업체 학습 페이지·Q&A 사이트, Microsoft Q&A·TechNet 포럼·Tech Community 블로그)를 근거로 쓰지 마라.** 이유: ADR-059.
  꼭 필요한 곳이 목록에 없으면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **기존 항목의 줄을 고치거나 지우지 마라.** 이유: 앞 phase의 개념이 그 줄을 근거로 쓴다. 더할 것은 「(phase 80 step 0)」 줄로 더한다.
- **Kerberos·NTLM·FSMO·글로벌 카탈로그의 동작·스키마·복제 토폴로지·AD FS·AD CS·Entra ID를 정리하지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **`lecture-outline.md`·`interview-facts.md`·`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 강의·면접은 이 주제를 다루지 않고, 이 phase는 새 출처를 더하지 않는다.
