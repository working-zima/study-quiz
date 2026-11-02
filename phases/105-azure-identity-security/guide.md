# phase 105 공통 안내 — Azure AZ-900 과목의 ID와 인증, 접근 제어와 보안 도구

이 phase의 **모든 step이 먼저 읽는 문서**다. step 문서는 자기 일의 세부만 적고, 과목 결정·두 주제의 개념 표와 글·문항·도식·파일 형식의 공통 규칙은 여기에 둔다.
step 문서와 이 문서가 다르면 step 문서를 따르고 그 차이를 summary에 적는다.

## 배경 — 다시 묻지 말 결정

Azure AZ-900 과목(`src/data/azure/`, ADR-060)은 phase 100에서 생겼고 phase 101~104가 주제 3~12를 더했다. 주제 지도(`docs/source/azure/topic-map.md`)의 주제 20개 가운데 1~12가 있고, **이 phase는 13·14를 더한다.**
둘 다 공식 학습 가이드의 묶음 「Describe Azure identity, access, and security」를 채운다.

**앞 phase가 남긴 것(이 phase의 출발점):**

- 주제 열둘 — `azure-cloud-computing`·`azure-cloud-models`·`azure-cloud-benefits`·`azure-sla-lifecycle`·`azure-service-types`·`azure-regions-zones`·`azure-resource-hierarchy`·`azure-compute`·`azure-virtual-networking`·`azure-network-protection`·`azure-storage`·`azure-data-movement`, 개념 76개.
- 문항 `az001`~`az105`(105개) — 예/아니요 예 26·아니요 27, 4지선다 정답 위치(`answerIndex` 0~3) 13/13/13/13.
- 도식 36개, 표 7개.
- 출처 문서 `docs/source/azure/official.md`(항목 머리 `## (phase 100) …`~`## (phase 104) …`)와 `docs/source/azure/corrections.md`(D1~D73, G1~G46). **이 phase는 D74·G47부터 잇는다.**
- 검증 값(설계 때 잰 값): 테스트 255파일·5758개, 교차 검사 세로·가로 노드 1140·경로 779, `check-verbatim --subject azure` 원본 411개·단위 724개(설계 세션이 Learn 단원을 받아 원본이 395에서 늘었다 — 아래 「출처」).
- 실행 보고 `phases/100-…`~`104-azure-storage-migration/verification.md` — 출처 step이 정한 표기와 그 이유, 마무리에서 고친 문항·문장의 꼴이 있다. **`103`·`104`의 「메인 세션이 마무리에서 고친 것」을 읽는다** — 답을 흘리는 말, 같은 말을 되풀이하는 문제문, 어색한 라벨 끼워 넣기(「보고서를 만드는 읽는 앱」)를 고쳤다. 같은 것을 반복하지 않는다.

**앞 주제가 이미 쓴 것 — 겹치지 않게:**

- `azure-resource-hierarchy.hierarchy`(phase 102)가 네 층의 범위·상속과 역할 할당의 뜻을 가르치고, `az054`가 **리소스 그룹에 건 역할이 그 안의 리소스에 미치는가**를 묻는다. 이 phase의 `rbac-scope`는 범위와 상속을 이 주제 안에서 다시 풀되 **역할 이름과 함께**(소유자·읽기 권한자) 쓰고, 허용 모델과 Resource Manager를 거치는 동작을 더한다. `az054`와 같은 것을 묻지 않는다.
- `azure-regions-zones.region`(phase 102)과 `az041`이 Entra ID를 지역을 고르지 않는 전역 서비스의 예로 든다. `azure-resource-hierarchy.subscription`이 Entra ID와 구독의 관계를 쓴다. 이 phase는 그 낱말을 한 줄로 다시 풀고, `az041`과 같은 것을 묻지 않는다.
- `azure-network-protection.ddos-protection`(phase 103)이 DDoS Protection의 동작과 현행 종류를 가르친다. `defense-in-depth`는 **그 보호가 어느 계층인가**까지만 쓴다. `network-security-groups`·`azure-firewall`도 계층의 예로 한 줄씩만 든다.
- 다른 주제의 몫: Azure Policy·리소스 잠금·Purview는 `azure-governance`, Azure Arc와 Resource Manager의 자세한 설명은 `azure-management-tools`·`azure-infrastructure-as-code`, Azure Monitor와 Log Analytics는 `azure-monitoring`, Defender 플랜의 금액은 비용 주제 — 이 phase에서 개념으로 세우지 않는다. 필요한 낱말은 그 자리에서 한 줄로 푼다.

**사용자 결정(2026-10-30, 다시 묻지 마라):**

- **범위**: Microsoft Learn의 AZ-900 공식 학습 가이드(2026-07-20 기준)가 뼈대다. 가이드 밖이라도 **용어집에 있고 덤프도 묻는 현행 것**(이 phase에서는 Key Vault·Sentinel)은 넣는다.
  지원이 끝난 서비스·옛 이름은 빼거나 현행으로 고친다. 덤프만 묻는 것은 넣지 않는다.
- **도식**: **주제마다 최소 하나**, 그리고 구조·흐름이 있는 개념에는 개념마다. 정의형 개념에는 없다. 비교표는 도식을 대신하지 않는다.
- 주제 지도(20개, 순서·별점·phase)는 사용자가 「고칠 것 없음」으로 확인했다.
- 사실의 기준은 **Microsoft 공식 문서**다. 덤프와 용어집은 범위·강조의 기준이자 사실 **후보**이고, 공식 문서와 다르면 공식 문서를 따르고 수정 이력에 남긴다(ADR-060).
  덤프 문항·용어집 문장은 옮기지 않는다(ADR-009, ADR-021과 같은 방식). 덤프는 시험 주관 기관의 문항이 아니므로 「자격시험은 ~로 본다」 줄을 쓰지 않는다.
- 용어는 **Microsoft 한국어 문서의 표기**를 따른다. 주제 id는 `azure-` 접두사, 별점은 덤프 출제 빈도(대표 문항 25 이상 ★★★, 13~24 ★★☆, 12 이하 없음).
- **서비스마다의 SLA 수치는 쓰지 않는다**(phase 101 설계). 가격·지역 수도 쓰지 않는다.

**이 phase에서 정한 것(설계):**

- 개념 16개, 문항 25개(`az106`~`az130`), 도식 13개, 표 셋(`SignInMethodsTable`·`RbacRolesTable`·`SecurityToolsTable`). 아래 「두 주제와 개념 16개」.
- **옛 이름은 쓰지 않는다** — 덤프 대부분이 Azure AD·Azure AD Connect·Azure Security Center·Azure Sentinel·Azure AD B2C로 묻는다. 본문은 현행 이름으로 쓰고, 옛 이름은 `entra-id`와 `defender-for-cloud`에서만 한 번씩 「예전 이름은 …」으로 밝힌다(공식 문서에 근거가 있을 때). 학습자가 다른 자료에서 옛 이름을 보고 다른 서비스로 알지 않게 하려는 것이다.
- **덤프 답을 믿지 않을 곳** — 설계 때 본 것: NO.142·505는 「암호 + 보안 질문」을 다단계 인증의 예로 답하는데, Learn 단원 3은 암호와 보안 질문을 **같은 범주(아는 것)**로 적는다. 출처 step 0이 제품 문서까지 보고 처리한다. 이 phase가 그 조합을 다단계 인증의 예로 가르치면 안 된다.
- **Learn 단원과 제품 문서가 어긋날 수 있는 곳**: 외부 ID의 이름(Learn은 Azure AD B2C와 Microsoft Entra External ID를 함께 쓴다), 암호 없는 방법의 이름(Learn의 FIDO2 보안 키와 제품 문서의 패스키), Defender for Cloud의 무료·유료 범위. 다르면 현행 제품 문서를 따른다.
- **쓰지 않는 것**: Microsoft Entra ID Protection·Privileged Identity Management·Defender for Identity(옛 ATP)(NO.264·496 — 덤프만 묻고 학습 가이드와 용어집에 항목이 없다), 라이선스 수(NO.207·296의 그 진술은 출처 step이 처리만 남긴다), Entra ID의 요금제 이름과 기능 표, 인증 프로토콜(OpenID Connect·SAML), Application Proxy·Intune의 동작, Key Vault의 FIPS 수준과 요금제, Sentinel의 AI·위협 인텔리전스 마케팅 문구와 포털 전환 일정, Defender 플랜 하나하나, CSPM·CWPP 같은 약어의 나열, 역할 정의의 JSON.
- **도식은 구조·흐름이 있는 개념 13개에 하나씩**(아래 「도식」). 붙이지 않는 개념: `entra-id`(목록 개념 — 첫 도식은 `entra-connect`), `passwordless`(표를 붙인다), `key-vault`(정의형 — 표 `SecurityToolsTable`이 세 도구를 나란히 둔다).
- **ADR은 필요 없다.** 쓸 출처가 모두 이미 허용된 `learn.microsoft.com` 안에 있다. 허용 목록 밖의 곳이 꼭 필요하면 쓰지 말고 출처 step의 summary 「사용자 확인」에 적는다.

**실행 규칙:**

- **step 하나는 30분 안에 끝나야 한다.** `scripts/execute.py`가 step을 1800초에서 끊는다. 그래서 step은 **브라우저 화면 실측(개발 서버·headless Chrome·CDP)을 하지 않는다** —
  phase가 끝난 뒤 메인 세션이 모든 도식을 한꺼번에 실측한다. 시간을 아끼려고 검증 명령을 건너뛰지는 마라.
- 「주제마다 도식 하나 이상」을 `src/components/diagrams/azureDiagramCoverage.test.ts`가 지킨다. 그래서 **주제를 처음 만드는 step(1·6)이 그 주제의 첫 도식도 함께** 만든다.
  저장소의 Stop 훅(`scripts/hooks/codex-verify-gate.sh`)은 테스트가 실패한 상태로 step을 끝내지 못하게 한다.
- **진행 안내 문장을 쓰지 않는다.** 「다음 개념에서 다룬다」, 「뒤에서 자세히 다룬다」처럼 글의 진행만 알리는 말은 `src/data/azure/data.test.ts`의 진행 안내 테스트가 막는다.
  뒤 개념이나 다른 주제가 자세히 다룰 낱말이 지금 필요하면 그 자리에서 한 줄로 풀고 넘어간다. 「앞 개념에서 본 것처럼」 같은 되짚기는 써도 된다.
- **이 Mac의 Python은 HTTPS 인증서를 찾지 못한다.** 공식 문서를 받을 때 `CERTIFICATE_VERIFY_FAILED`가 나면 명령 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`을 붙인다. 이것은 인터넷 연결 문제가 아니다 — blocked로 멈추지 마라.

## step 아홉 개

| step | 이름 | 하는 일 |
|---|---|---|
| 0 | `identity-sources` | 주제 13이 쓸 사실을 공식 문서로 확인해 `official.md`·`corrections.md`에 더한다 |
| 1 | `entra-id-connect` | 주제 13을 만들고 개념 1·2의 글·문항과 도식 `EntraConnectDiagram` |
| 2 | `domain-services-auth` | 개념 3·4의 글·문항과 도식 `DomainServicesDiagram`·`AuthVsAuthzDiagram` |
| 3 | `sso-mfa-passwordless` | 개념 5·6·7의 글·문항과 도식 `SingleSignOnDiagram`·`MfaFactorsDiagram`, 표 `SignInMethodsTable` |
| 4 | `external-conditional` | 개념 8·9의 글·문항과 도식 `ExternalIdentitiesDiagram`·`ConditionalAccessDiagram` |
| 5 | `security-sources` | 주제 14가 쓸 사실을 확인해 두 문서에 더한다 |
| 6 | `rbac` | 주제 14를 만들고 개념 10·11의 글·문항과 도식 `RbacAssignmentDiagram`·`RbacScopeDiagram`, 표 `RbacRolesTable` |
| 7 | `zero-trust-defense` | 개념 12·13의 글·문항과 도식 `ZeroTrustDiagram`·`DefenseInDepthDiagram` |
| 8 | `security-tools` | 개념 14·15·16의 글·문항과 도식 `DefenderForCloudDiagram`·`SentinelFlowDiagram`, 표 `SecurityToolsTable` |

## 두 주제와 개념 16개

주제 객체(`src/data/azure/topics.json`의 기존 열두 주제 뒤에 이 순서로):

```json
{ "id": "azure-identity", "title": "ID와 인증", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }
{ "id": "azure-security-model", "title": "접근 제어와 보안 도구", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }
```

별점: 주제 지도의 대표 문항 수가 `azure-identity` 29, `azure-security-model` 25로 둘 다 ★★★이다. `data.test.ts`가 이 값을 본다.

개념 id는 `<주제 id>.<슬러그>`다. 표의 순서·슬러그·`parentId`를 바꾸지 않는다(바꿔야 할 이유가 있으면 바꾸지 말고 summary에 적는다).
**`name`은 출처 step(0·5)이 확인한 Microsoft 한국어 문서의 표기를 따른다** — 표의 이름은 잠정이다. 한국어판 안에서도 표기가 섞인 것은 출처 step이 하나로 정하고 근거를 남긴다.
`parentId` 열의 값은 같은 주제의 슬러그다 — JSON에는 `azure-identity.entra-id`처럼 전체 id로 쓴다. 딸린 개념은 부모 바로 뒤에 이어 두고, 부모는 머리 개념이어야 한다(ADR-041 — 딸린 개념 아래에 또 딸리지 않는다).
「다룰 것」은 범위다. 문장은 직접 쓰고, 사실은 아래 「출처」대로 가져온다. 「step N 결과」라고 적힌 사실은 그 step의 summary와 출처 문서에 적힌 처리를 따른다 —
확인되지 않았으면 쓰지 않는다. 「덤프」 뒤의 `NO.`는 덤프 문항 번호다(`docs/source/azure/dump-topics.tsv`·`raw/dump/dump.md`).

### `azure-identity` — ID와 인증 (공식 학습 가이드 「Describe directory services in Azure」·「Describe authentication methods」·「Describe external identities」·「Describe Microsoft Entra Conditional Access」)

순서는 ID를 어디에 두는가(Entra ID와 온-프레미스, 옛 앱) → 로그인에서 무슨 일이 일어나는가(인증과 권한 부여) → 어떻게 로그인하는가(SSO·MFA·암호 없는 인증) → 회사 밖의 사람(외부 ID) → 상황에 따라 다르게(조건부 액세스).
학습자가 가장 많이 헷갈리는 것은 **「누구인가를 확인하는 일」과 「무엇을 해도 되는지 정하는 일」**이다. 또 Entra ID·Entra Domain Services·온-프레미스 AD 셋의 관계, 다단계 인증의 「요소」가 무슨 뜻인지, SSO가 로그인 수를 줄이는 것이지 보안을 더하는 것이 아니라는 것.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 1 | `entra-id` | Microsoft Entra ID | — | 1 | **목록 개념** — 소개 문단(클라우드 기반 ID·액세스 관리 서비스. **ID**와 **디렉터리**를 이 자리에서 푼다. 예전 이름 Azure Active Directory를 한 번 밝힌다 — step 0 결과대로) 뒤 항목 넷: 인증, SSO, 애플리케이션 관리, 디바이스 관리. 누가 쓰는가(관리자·개발자·사용자·구독자)는 한 문단. **도메인 컨트롤러를 설치할 필요가 없다**는 것과 Microsoft가 서비스를 운영하고 ID는 고객이 관리한다는 것. 리소스 그룹으로 사용자를 묶지 않는다(NO.291 — step 0 결과대로). 덤프: NO.28, 194, 207, 212, 291, 296, 364, 381, 399, 469 |
| 2 | `entra-connect` | Microsoft Entra Connect | `entra-id` | 1 | 온-프레미스 **Active Directory**(회사가 자기 서버에서 운영하는 디렉터리 — 한 줄로 푼다)와 Entra ID가 따로면 ID를 두 벌 관리해야 한다. Connect가 **사용자 ID를 동기화**해 같은 ID로 온-프레미스와 클라우드에 닿게 한다(**동기화**를 한 줄로 푼다). 연결하면 온-프레미스 AD만으로는 없던 로그인 감시를 받는다(Learn 단원 2 — step 0 결과대로). **이 개념에 도식 `EntraConnectDiagram`을 붙인다**. 덤프: NO.244, 351, 362 |
| 3 | `domain-services` | Microsoft Entra Domain Services | `entra-id` | 2 | **도메인 컨트롤러를 직접 두지 않고** 도메인 조인·그룹 정책·LDAP·Kerberos/NTLM 인증을 쓰게 하는 관리형 서비스(**도메인 조인**·**그룹 정책**·**LDAP**을 한 줄씩 푼다). 왜 있는가 — 최신 인증을 못 쓰는 **옛 앱**을 옮길 때. 만들면 Azure가 **도메인 컨트롤러 둘**을 고른 지역에 두고 관리한다. **Entra ID에서 관리형 도메인으로 한 방향 동기화** — 관리형 도메인에서 만든 것은 돌아가지 않는다. Entra ID 자체에는 그룹 정책이 없다(NO.364·399 — step 0 결과대로). Entra ID와 어떻게 다른가를 4절대로. **이 개념에 도식 `DomainServicesDiagram`을 붙인다** |
| 4 | `authentication-authorization` | 인증과 권한 부여 | — | 2 | **인증**(누구인지 증명)과 **권한 부여**(그 사람에게 무엇을 허용하는가). 순서가 있다 — 인증이 먼저. 로그인했다고 모든 것을 할 수 있는 것은 아니다. 일상의 예는 직접 만든다. **자격 증명**을 한 줄로 푼다. 덤프가 많이 묻는 정의지만 문항은 정의에서 이름만 지운 꼴로 내지 않는다. **이 개념에 도식 `AuthVsAuthzDiagram`을 붙인다**. 덤프: NO.21, 38, 73, 230, 250, 274, 311, 375 |
| 5 | `single-sign-on` | SSO(Single Sign-On) | — | 3 | **한 번 로그인으로 믿을 수 있는 앱 여럿**에 닿는다. 왜 좋은가 — 외울 암호가 줄어 암호 때문에 생기는 사고와 재설정 일이 준다, ID가 하나라 역할이 바뀌거나 퇴사할 때 접근을 한 번에 바꾼다. **처음 인증이 약하면 그만큼만 안전하다.** 표기는 step 0 결과대로. **이 개념에 도식 `SingleSignOnDiagram`을 붙인다**. 덤프: NO.469 |
| 6 | `multifactor-authentication` | 다단계 인증(MFA) | — | 3 | 로그인 때 **요소**를 하나 더 요구해 암호가 새어도 들어오지 못하게 한다. 요소의 세 범주 — 아는 것·가진 것·본인의 특성(생체). **같은 범주를 둘 쓰면 어떻게 되는가**(NO.142·505의 암호 + 보안 질문 — step 0 결과대로). Microsoft Entra 다단계 인증이라는 서비스와 쓸 수 있는 방법(전화·앱 알림 — step 0 결과대로). 온-프레미스 ID 동기화가 전제가 아니고, 사진 신분증·여권 번호는 방법이 아니다(NO.157·361의 처리 — step 0 결과대로). **이 개념에 도식 `MfaFactorsDiagram`을 붙인다**. 덤프: NO.142, 157, 361, 505 |
| 7 | `passwordless` | 암호 없는 인증 | — | 3 | 암호 자체를 없애고 **믿을 수 있는 디바이스 + 생체나 PIN**으로 로그인한다(**PIN**·**디바이스**를 한 줄로 푼다). **목록** 셋 — Windows Hello for Business(자기 전용 Windows PC), Microsoft Authenticator 앱(휴대폰 알림에서 숫자를 맞추고 생체·PIN), FIDO2 보안 키(이름은 step 0 결과대로). PIN을 쓰는데 왜 암호가 아닌가는 step 0 근거가 있을 때만. 세 방식을 표로 견준다. **이 개념에 표 `SignInMethodsTable`을 붙인다**. 덤프: NO.112 |
| 8 | `external-identities` | 외부 ID | — | 4 | **테넌트**(조직의 Entra ID 공간 — 한 줄로 푼다) 밖의 사람·디바이스·서비스. 협력사 사용자가 **자기 자격 증명**으로 우리 자원에 닿고, 접근은 우리가 정한다. 인증은 외부 ID 공급자가, 권한 부여는 우리가 — SSO와 어떻게 다른가를 4절대로. **목록** 셋 — B2B 협업(게스트로 디렉터리에 표시), B2B 직접 연결(다른 테넌트와 상호 신뢰, Teams 공유 채널, 디렉터리에 표시되지 않음), 고객용 External ID(이름은 step 0 결과대로). 게스트 접근을 **액세스 검토**로 다시 확인한다는 것은 한 줄. **이 개념에 도식 `ExternalIdentitiesDiagram`을 붙인다** |
| 9 | `conditional-access` | 조건부 액세스 | — | 4 | Entra ID가 **신호**(누구인가, 어디인가, 어떤 디바이스인가, 어떤 앱인가)를 모아 **결정**하고 **적용**(허용·차단·둘째 인증 요구)하는 도구. 같은 사용자도 상황에 따라 달라진다. 쓰임 넷(역할·위치에 따른 MFA, 승인된 앱만, **관리되는 디바이스**만, 믿을 수 없는 곳 차단). 패치가 된 디바이스만 허용하는 것이 어떻게 이 도구의 일인가(NO.151 — step 0 결과대로). 앞의 MFA와의 관계. **이 개념에 도식 `ConditionalAccessDiagram`을 붙인다**. 덤프: NO.151, 274, 375, 496의 조건부 MFA |

### `azure-security-model` — 접근 제어와 보안 도구 (공식 학습 가이드 「Describe Azure role-based access control (RBAC)」·「Describe the concept of Zero Trust」·「Describe the purpose of the defense-in-depth model」·「Describe the purpose of Microsoft Defender for Cloud」, 가이드 밖 Key Vault·Sentinel)

순서는 누가 무엇을 하는가(RBAC) → 어떤 태도로 지키는가(제로 트러스트) → 어떻게 겹쳐 지키는가(심층 방어) → 그 일을 돕는 도구(Defender for Cloud·Key Vault·Sentinel).
학습자가 가장 많이 헷갈리는 것은 **제로 트러스트와 심층 방어**(믿지 않는다는 태도 / 겹겹이 막는 구조), **Defender for Cloud와 Sentinel**(자원의 보안 상태를 평가하고 지키는 곳 / 여러 곳의 보안 로그를 모아 분석하고 대응하는 곳), **RBAC의 범위와 앱 안의 권한**이다. 마지막 개념의 표 `SecurityToolsTable`이 세 도구를 나란히 둔다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 10 | `rbac` | Azure RBAC(역할 기반 액세스 제어) | — | 6 | 이 주제의 첫 개념이라 **리소스**·**구독**·**권한**을 짧게 푼다. **최소 권한 원칙**. 사람마다 권한을 적으면 일이 많아지므로 **역할**을 할당한다. 기본 제공 역할과 **사용자 지정 역할**(NO.383·386). 기본 제공 역할 넷의 차이는 표로(이름은 step 5 결과대로). 한 사용자에게 역할 여럿, 한 역할을 사용자 여럿에게(NO.386). 그룹에 할당하면 새 사람이 그룹에 드는 것으로 같은 권한을 받는다. 포털의 어느 메뉴에서 할당하는가(액세스 제어(IAM) — NO.81, step 5 결과대로). **이 개념에 도식 `RbacAssignmentDiagram`과 표 `RbacRolesTable`을 붙인다**. 덤프: NO.81, 137, 217, 383, 386 |
| 11 | `rbac-scope` | 역할을 적용하는 범위 | `rbac` | 6 | **범위** 넷(관리 그룹·구독·리소스 그룹·리소스)과 **위에서 아래로 상속**을 역할 이름과 함께. **허용 모델** — 읽기 할당과 쓰기 할당이 있으면 둘 다 가진다. **Azure Resource Manager를 거치는 동작에 적용**되고(포털·Cloud Shell·PowerShell·CLI — **Resource Manager**를 한 줄로 푼다) **앱·데이터 수준의 권한은 앱이 맡는다**(Learn 단원 6 그대로의 사실 — step 5가 제품 문서의 데이터 작업과 대조한다). **이 개념에 도식 `RbacScopeDiagram`을 붙인다** |
| 12 | `zero-trust` | 제로 트러스트 | — | 7 | 침해가 이미 일어났다고 가정하고 **요청마다 검증**하는 보안 모델. 원칙 **셋** — 명시적으로 확인, 최소 권한 액세스, 침해 가정(표기는 step 5 결과대로). 경계 기반(회사 네트워크 안이면 믿는다)과 무엇이 다른가. 관리되지 않는 기기가 공용 네트워크에서 로그인하는 예를 직접 쓴 상황으로. **Just-In-Time**·**Just-Enough-Access**는 쓸 때 풀어 쓴다. **이 개념에 도식 `ZeroTrustDiagram`을 붙인다** |
| 13 | `defense-in-depth` | 심층 방어 | — | 7 | **목록 개념** — 데이터를 가운데 두고 **일곱 계층**이 차례로 지킨다: 물리적 보안, ID 및 액세스, 경계, 네트워크, 컴퓨팅, 애플리케이션, 데이터(표기와 순서는 step 5 결과대로). 항목마다 지키는 것과 Azure의 예 하나. **DDoS 보호는 경계 계층**이다(NO.52·116·222). 한 계층이 뚫려도 다음이 막고 공격을 늦춘다. 제로 트러스트와 어떻게 다른가를 4절대로. **이 개념에 도식 `DefenseInDepthDiagram`을 붙인다**. 덤프: NO.52, 116, 203, 222, 368 |
| 14 | `defender-for-cloud` | Microsoft Defender for Cloud | — | 8 | 자원의 **보안 상태를 관리하고 위협을 막는** 서비스(예전 이름 Azure Security Center를 한 번 밝힌다 — step 5 결과대로). 어디를 보는가 — Azure, 온-프레미스(Azure Arc — 한 줄로 푼다), 다른 클라우드(AWS·GCP). 하는 일 셋 — 지속 평가(**보안 점수**), 보안(권장 사항·벤치마크), 방어(경고, Just-In-Time VM 액세스). **규정 준수 대시보드·보고서**(NO.37·153·185·292). **무료 범위와 유료 범위가 나뉜다**(금액 없이 — NO.401·422·460). **이 개념에 도식 `DefenderForCloudDiagram`을 붙인다**. 덤프: NO.37, 153, 185, 214, 225, 292, 401, 422, 460 |
| 15 | `key-vault` | Azure Key Vault | — | 8 | **비밀·암호화 키·인증서**를 한곳에 안전하게 두고 접근을 통제하는 서비스(셋을 한 줄씩 푼다). 앱 코드에 암호를 적지 않게 된다. 예는 직접 만든다. Azure Disk Encryption에 Key Vault가 필요하다(NO.74 — step 5 결과대로). FIPS·요금제는 쓰지 않는다. 덤프: NO.74, 152, 167, 414 |
| 16 | `sentinel` | Microsoft Sentinel | — | 8 | 여러 곳의 보안 데이터를 모아 위협을 찾고 대응하는 **SIEM**(한 줄로 푼다). **수집 → 탐지 → 조사 → 대응**, 대응은 **플레이북**으로 자동화(NO.219). SOAR를 쓸지는 step 5 결과대로. Defender for Cloud와 무엇이 다른가를 4절대로. **이 개념에 도식 `SentinelFlowDiagram`과 표 `SecurityToolsTable`을 붙인다**. 덤프: NO.167, 170, 219, 488 |

**문항 수**: `azure-identity` 14개, `azure-security-model` 11개 — 모두 25개, `az106`~`az130`.
문항은 개념 순서대로 `questions.json` 끝에 붙인다. step마다 맡는 id와 형식은 아래와 같다 — 균형(「문항」 9항)을 step마다 지키도록 형식과 정답 방향을 미리 나눴다. **형식이나 답의 방향을 바꾸면 그 step 끝에서 균형이 깨지지 않는지 세어 보고 summary에 적는다.**

| step | id | 개념별 수 | 형식(예/아니요는 정답, 4지선다는 `answerIndex`) | step 끝의 예·아니요 |
|---|---|---|---|---|
| 1 | `az106`~`az108` | 1 둘, 2 하나 | 106 아니요 / 107 위치 0 / 108 예 | 27·28 |
| 2 | `az109`~`az112` | 3 둘, 4 둘 | 109 위치 1 / 110 예 / 111 위치 2 / 112 아니요 | 28·29 |
| 3 | `az113`~`az116` | 5 하나, 6 둘, 7 하나 | 113 예 / 114 아니요 / 115 위치 3 / 116 위치 0 | 29·30 |
| 4 | `az117`~`az119` | 8 하나, 9 둘 | 117 위치 1 / 118 위치 2 / 119 예 | 30·30 |
| 6 | `az120`~`az123` | 10 둘, 11 둘 | 120 위치 3 / 121 아니요 / 122 위치 0 / 123 예 | 31·31 |
| 7 | `az124`~`az126` | 12 하나, 13 둘 | 124 아니요 / 125 위치 1 / 126 예 | 32·32 |
| 8 | `az127`~`az130` | 14 둘, 15 하나, 16 하나 | 127 위치 2 / 128 아니요 / 129 위치 3 / 130 위치 0 | 32·33 |

이대로면 phase 끝에 예 32·아니요 33, 정답 위치 17/16/16/16이다.

**예시 값 — 두 주제가 함께 쓴다:**

- **조직 이름**은 「회사 A」·「회사 B」처럼 이름표로 쓴다. 실제 회사 이름을 예로 들지 않는다(Azure·Microsoft처럼 공식 문서가 사실로 드는 이름, AWS·GCP·Teams처럼 공식 문서가 대상으로 드는 제품 이름은 예외).
- **사용자 이름표**는 「직원 A」·「협력사 직원」처럼, **앱 이름표**는 「앱 1」·「앱 2」처럼 쓴다. 수량이 예시 값이면(앱 세 개 등) 본문이나 캡션에서 밝힌다. 도메인 컨트롤러 둘, 계층 일곱, 범주 셋, 원칙 셋은 공식 문서의 값이다.
- **공식 문서가 정한 값**은 출처 step이 확인한 것만 쓴다. 가격·서비스별 SLA 수치·라이선스 수는 쓰지 않는다(「배경」).
- **서비스 이름**은 Microsoft 한국어 문서 표기로 쓰고, 영문 이름이 다르면 처음 나올 때 괄호에 적는다(출처 step이 표기를 확인한다).

도식은 본문에 나온 예시 값만 쓴다(ADR-038) — 그러니 이 값들을 도식에 쓰려면 그 개념의 본문에 먼저 쓴다.

## 출처

- 사실은 `docs/source/azure/official.md`(Microsoft 공식 문서에서 확인한 사실과 URL)에서만 가져온다. 출처 step(0·5)이 그 주제에 필요한 사실을 확인해 남긴다. 그 summary가 개념마다 무엇을 쓰고 무엇을 쓰지 않는지 적는다.
- 덤프·용어집의 주장이 `docs/source/azure/corrections.md`에 걸려 있으면 **고친 쪽**을 쓴다. 덤프·용어집에만 있고 공식 문서가 말하지 않는 주장은 쓰지 않는다.
- 개념 step에서 그 밖의 사실이 필요하면, 허용한 출처(`docs/source/azure/CLAUDE.md` 「허용하는 출처」)를 실제로 열어 확인하고 `official.md`에 URL과 「쓰인 곳」을 적은 뒤 쓴다.
  받은 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다. 인증서 오류는 「배경」의 `SSL_CERT_FILE`).
  확인하지 못한 사실은 쓰지 않는다. 블로그·Microsoft Q&A·Tech Community·위키백과·자격증 교재·덤프 사이트는 쓰지 않는다.
- **`official.md`의 「쓰인 곳」**: 출처 step은 아직 개념이 없으므로 「쓰일 곳」으로 적는다. 그 개념을 만든 step이 자기 개념 id가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.
- **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 덤프의 문제문·보기·해설, 용어집 설명, 공식 문서(특히 한국어판)의 문장을 옮기지 않는다. `check-verbatim --subject azure`는 하한선일 뿐이다.
- 덤프 문항을 그대로 문항으로 만들지 않는다 — 덤프가 같은 사실을 물어도 상황과 문장은 직접 만든다(ADR-021과 같은 이유).

설계 세션이 받아 둔 공식 문서(`docs/source/azure/raw/official/`, 영문판과 한국어판 `ko-…`):

- Learn 「Describe Azure identity, access, and security」 — `learn-describe-azure-identity-access-security-{2-directory-services, 3-authentication-methods, 4-external-identities, 5-conditional-access, 6-role-based-access-control, 7-describe-zero-trust-model, 8-describe-defense-depth, 9-describe-microsoft-defender-for-cloud}.md`와 `ko-` 판.
- 제품 문서(앞 phase가 받음): `docs-entra-whatis.md`, `docs-entra-new-name.md`, `docs-rbac-overview.md`, `docs-rbac-scope-overview.md`.
- AZ-900 학습 가이드 — `az-900-study-guide.md`.

설계 때 열어 보고(모두 200) 받지 않은 것(출처 step이 받는다 — 주소는 출발점이고, 옮겨졌으면 같은 내용의 현행 쪽을 찾는다). 앞에 `learn.microsoft.com/`를 붙인다:
주제 13 — `entra/identity-platform/authentication-vs-authorization`, `entra/identity/authentication/concept-mfa-howitworks`, `entra/identity/authentication/concept-authentication-methods`, `entra/identity/authentication/concept-authentication-passwordless`, `entra/identity/domain-services/overview`, `entra/identity/conditional-access/overview`, `entra/external-id/external-identities-overview`.
주제 14 — `azure/role-based-access-control/built-in-roles`, `azure/role-based-access-control/custom-roles`, `azure/defender-for-cloud/defender-for-cloud-introduction`, `azure/defender-for-cloud/concept-regulatory-compliance-standards`, `azure/key-vault/general/overview`, `azure/sentinel/overview`, `security/zero-trust/zero-trust-overview`.

## 글 — `docs/WRITING_GUIDE.md`를 따른다(ADR-056, ADR-060)

- `summary`는 WRITING_GUIDE 2절 — 처음 보는 사람이 일상 말로 「무엇이고 무슨 역할인지」 알게 하는 한 문장. 다른 전문용어를 알아야 이해되면 안 되고, 제목 낱말을 되풀이하는 순환 정의, 숫자·분류를 넣지 않는다.
- `paragraphs`는 3절의 흐름(개념 → 원리 → 예시 → 특징)을 필요한 만큼. 누가·무엇을·어디서 어디로를 빠뜨리지 않는다. 같은 말을 되풀이하지 않는다.
  헷갈리는 짝은 4절대로 무엇이 다르고 왜 나눠 부르는지를 말한다 — 이 phase의 짝: 인증과 권한 부여, Entra ID와 온-프레미스 AD, Entra ID와 Entra Domain Services, Entra Connect와 Domain Services의 동기화, SSO와 MFA, MFA와 암호 없는 인증, SSO와 외부 ID, B2B 협업과 B2B 직접 연결, MFA와 조건부 액세스,
  소유자와 기여자, 기여자와 사용자 액세스 관리자, 제로 트러스트와 심층 방어, 경계 계층과 네트워크 계층, Defender for Cloud와 Sentinel.
- **이 주제 화면만 읽고 뜻이 서야 한다.** 학습자는 주제 목록에서 아무 주제로나 바로 들어오므로, 다른 주제에 정의가 있다는 것은 도움이 되지 않는다.
  이 주제 안에서 처음 쓰는 낱말(ID, 디렉터리, 테넌트, 온-프레미스, 도메인, 자격 증명, 리소스, 구독, 리소스 그룹, 관리 그룹, VM, 앱 등)은 그 자리에서 짧게 푼다. 앞 phase 주제가 푼 낱말도 이 주제에서는 다시 푼다.
  앞 step이 같은 주제에서 이미 푼 낱말은 다시 풀지 않는다 — 쓰기 전에 그 주제의 앞 개념을 읽는다. 도식의 라벨·곁말·캡션과 표의 칸도 화면의 글이다.
- **진행 안내 문장을 쓰지 않는다**(「배경」). 다른 주제나 뒤 개념을 가리키는 말이 필요하면 그 낱말을 그 자리에서 한 줄로 풀고, 「~에서 다룬다」·「~에서 자세히」·「다음 개념의」·「(다음 개념)」을 붙이지 않는다.
- 비유는 이해를 돕는 데만 쓰고, 실제 동작과 다르면 그 자리에서 밝힌다. 비유로 사실을 대신하지 않는다.
- `name`은 명사구다(ADR-030 기준 1). **굵은 글씨(`**`)는 목록 항목의 이름에만** 쓴다(ADR-055와 같은 규칙, ADR-060). 목록 개념은 소개 문단 하나 뒤에 `- **한국어 이름**(English name)은 …` 꼴 항목을 두고, 항목은 혼자 서지 않는다(ADR-046).
  `EmphasizedText`는 `**…**` 안의 백틱을 코드로 그리지 않으므로 굵은 이름 안에 백틱을 넣지 않는다.
- 관용 표현(`돌린다`·`띄운다`·`태운다`·`물린다`)을 쓰지 않고 하는 일을 그대로 쓴다(ADR-030 기준 5). 평서문 「~다」로 쓴다. 「A vs B」 제목은 쓰지 않는다.
- 공식 문서의 마케팅 어조(「지능적으로」, 「원활한」, 「강력한」, 「최상위」, 「무제한」을 꾸밈말로)를 옮기지 않는다 — 무엇이 어떻게 되는지를 쓴다.

## 문항 — WRITING_GUIDE 「객관식 문제의 문장과 선택지 구성 원칙」과 ADR-054·ADR-030

가장 중요한 원칙: **질문은 쉽게 이해할 수 있도록, 선택은 충분한 생각이 필요하도록.**

1. **정의에서 이름만 지운 「무엇인가?」 꼴을 내지 않는다.** 개념에 맞는 방식 하나를 고른다 — 개념 확인, 원리 이해, 상황 적용, 개념 비교, 원인과 결과. 고른 방식과 이유를 summary에 적는다.
2. **사람이 사람에게 묻듯 쓴다.** 소리 내어 읽어 어색하거나 한 번에 이해되지 않으면 다시 쓴다. 쉼표로 조건을 줄줄이 잇는 압축문을 쓰지 않는다.
3. 무엇을 묻는지는 첫 읽기에 분명하고, 어려움은 보기를 고르는 데서 나온다. 문제문을 비틀어 난이도를 만들지 않는다.
4. 보기는 기술적으로 갈리고 정답은 하나다. 비슷한 개념을 보기로 둘 때는 그 차이를 판단할 조건을 문제문에 준다. 오답은 문제문이 묻는 범주 안에서, 실제로 헷갈리는 것에서 고른다(ADR-030 기준 4).
   정답의 이름이나 그 일부를 문제문에 쓰지 않는다(기준 3). 보기 넷은 서로 다르다.
   **두 개념이 함께 맞게 읽힐 수 있는 상황을 만들지 않는다** — 이 phase에서 특히:
   「직원이 로그인할 때 더 안전하게 하고 싶다」는 MFA에도 암호 없는 인증에도 조건부 액세스에도 맞다 — 무엇을 조건으로 줄지(요소를 더한다 / 암호를 없앤다 / 상황에 따라 달리한다)를 문제문에 준다.
   「협력사 직원이 우리 앱에 닿게 하고 싶다」는 B2B 협업에도 B2B 직접 연결에도 맞다 — 게스트로 디렉터리에 두는가, Teams 공유 채널인가를 준다.
   「온-프레미스 계정을 클라우드에서 쓰고 싶다」는 Entra Connect에도 Domain Services에도 맞다 — ID를 맞추는 것인가, 옛 앱이 쓸 도메인 서비스인가를 준다.
   「보안 문제를 찾고 싶다」는 Defender for Cloud에도 Sentinel에도 맞다 — 자원의 보안 상태·권장 사항인가, 여러 곳의 로그를 모아 분석하고 대응하는가를 준다.
   「적게 권한을 주고 싶다」는 역할로도 범위로도 맞다 — 어느 쪽을 고르는 문항인지 문제문에 분명히 한다.
5. 판단에 쓰이지 않는 정보(전문용어·수치·조건·부정문)를 늘어놓지 않는다. 판단에 필요한 조건은 남긴다.
6. **형식(ADR-054)**: 흔히 오해하는 것을 바로잡으면 예/아니요, 비슷한 개념을 구별하거나 상황에 맞는 것을 고르면 4지선다. 같은 범주의 그럴듯한 오답 셋을 출처 안에서 쓸 수 없으면 예/아니요.
   예/아니요는 주장 하나, 이중 부정·「항상」「절대」 금지, 「~인가요?」「~나요?」로 끝난다. **아니요 문항의 해설은 무엇이 틀렸는지에서 그치지 않고 맞는 사실을 가르친다.**
   예/아니요의 주장은 맞는 쪽으로도 틀린 쪽으로도 세울 수 있다 — 아래 균형을 맞추려고 주장의 방향을 고른다.
7. **문항은 풀면서 배우게 쓴다.** 문항은 섞여 나오고 랜덤 세트는 일부만 뽑으므로 혼자 읽혀야 한다. 문제문이 이 주제 밖의 낱말을 풀이 없이 전제하지 않는다(기준 5).
   상황에 쓰는 이름(「회사 A」)·숫자는 사실 주장이 아니어야 하고, 그 상황의 정답은 출처의 사실로 정해져야 한다. 문항 상황은 본문 예와 다르게 만들어 본문 문장을 외워서 풀리지 않게 한다.
8. **해설은 187자 이상**이고 그 개념을 가르치는 글이다(ADR-026·027). 4지선다는 정답이 왜 맞는지와 오답 셋이 각각 왜 아닌지를 담는다. 약어는 해설마다 처음 쓸 때 풀어 쓴다.
   같은 말을 늘려 길이를 채우지 않는다. 해설의 사실은 개념 본문이나 `official.md`에 있는 것이다.
9. **균형 — step이 끝났을 때 과목 전체에서**: 예/아니요의 예와 아니요 수 차이 **1 이하**, 4지선다의 정답 위치(`answerIndex` 0~3) 수의 최대·최소 차이 **2 이하**.
   phase 105 시작 때는 문항 105개, 예 26·아니요 27, 정답 위치 13/13/13/13이다. step마다의 형식은 「두 주제와 개념 16개」의 표대로다.
10. 한 문항은 개념 하나만 묻는다(ADR-030 기준 2). 같은 개념의 두 문항은 서로 다른 것을 묻는다. 앞 phase의 문항(특히 `az041` Entra ID와 지역, `az054` 리소스 그룹에 건 역할의 상속, DDoS Protection을 묻는 `azure-network-protection`의 문항)과 같은 것을 묻지 않는다.
11. 답을 흘리는 꼴을 피한다 — 문제문의 「…만으로」, 「…뒤에도」처럼 답의 방향을 암시하는 말, 정답 보기만 문제문의 낱말을 되풀이하는 것, **오답 셋만 같은 말로 시작해 정답만 꼴이 다른 것**(phase 103 `az056`·`az060`·`az068`·`az070`·`az077`·`az080`).
12. 덤프 문항의 문장·보기 구성을 옮기지 않는다. 덤프가 되풀이하는 꼴(「다음 진술이 맞으면 예」 세 개 묶음, 「해결책: …, 목표를 이루나?」 연작, 밑줄 친 말 고치기, 짝짓기)도 쓰지 않는다 — 앱의 형식은 4지선다와 예/아니요 하나씩이다.

검수 — 문항마다 WRITING_GUIDE 객관식 7항의 여섯 질문으로 다시 읽고, 보기마다 「이것이 정답이라고 우길 수 있는가」를 따진다. 문제문만 읽고 보기를 보지 않은 채 정답 글자를 짐작할 수 있지 않은지도 본다.

## 도식 — 구조·흐름이 있는 개념 13개에 하나씩, 표 셋

선례는 앞 phase의 Azure 도식(`GeoRedundancyDiagram`·`AzureMigrateDiagram`·`FileSyncDiagram`·`NsgAssociationDiagram`·`ExpressRouteDiagram`과 그 `.test.tsx`, `src/data/azure/visuals/*.json`)이다. 표는 `azureStorageTables.tsx`와 그 테스트를 본다.
규칙의 근거는 UI_GUIDE 「도식 전용 색상」·「도식」 절 전체, ADR-036·037·038·047·048, `src/components/diagrams/CLAUDE.md`다.
사용자 미리보기 승인을 받지 않고 **step이 좌표를 설계한다.** 그래서 기계 검사를 모두 통과시키고 설계를 summary에 남긴다.

| 도식 | JSON 키 | 개념 | step | 요지 |
|---|---|---|---|---|
| `EntraConnectDiagram` | `entra-connect` | `azure-identity.entra-connect` | 1 | 온-프레미스 AD와 Entra ID — 연결 없이 두 벌 / Connect로 동기화해 같은 ID로 |
| `DomainServicesDiagram` | `domain-services` | `azure-identity.domain-services` | 2 | 관리형 도메인의 도메인 컨트롤러 둘을 Azure가 맡고, Entra ID에서 한 방향으로 동기화하며, 옛 앱이 닿는다 |
| `AuthVsAuthzDiagram` | `auth-vs-authz` | `azure-identity.authentication-authorization` | 2 | 로그인 뒤 인증 → 권한 부여 → 리소스, 어디서 멈추는가 |
| `SingleSignOnDiagram` | `single-sign-on` | `azure-identity.single-sign-on` | 3 | 한 번 로그인으로 앱 여럿, 처음 인증이 약하면 그만큼만 안전 |
| `MfaFactorsDiagram` | `mfa-factors` | `azure-identity.multifactor-authentication` | 3 | 요소의 세 범주 — 서로 다른 범주의 조합과 같은 범주의 조합 |
| `ExternalIdentitiesDiagram` | `external-identities` | `azure-identity.external-identities` | 4 | 테넌트 밖의 사람이 닿는 세 길 — B2B 협업, B2B 직접 연결, 고객 |
| `ConditionalAccessDiagram` | `conditional-access` | `azure-identity.conditional-access` | 4 | 신호 → 결정 → 적용(허용·둘째 인증·차단) |
| `RbacAssignmentDiagram` | `rbac-assignment` | `azure-security-model.rbac` | 6 | 그룹에 역할을 할당하면 새 사람과 새 리소스에 어떻게 미치는가 |
| `RbacScopeDiagram` | `rbac-scope` | `azure-security-model.rbac-scope` | 6 | 역할을 건 범위와 그 아래로 상속되는 넓이 |
| `ZeroTrustDiagram` | `zero-trust` | `azure-security-model.zero-trust` | 7 | 경계 기반 / 어디서 오든 요청마다 검증 |
| `DefenseInDepthDiagram` | `defense-in-depth` | `azure-security-model.defense-in-depth` | 7 | 일곱 계층의 순서, DDoS 보호의 자리, 한 계층이 뚫릴 때 |
| `DefenderForCloudDiagram` | `defender-for-cloud` | `azure-security-model.defender-for-cloud` | 8 | Defender for Cloud가 보는 곳 — Azure·온-프레미스·다른 클라우드 |
| `SentinelFlowDiagram` | `sentinel-flow` | `azure-security-model.sentinel` | 8 | 데이터 원본 → 수집 → 탐지 → 조사 → 대응 |

표 — 파일 `src/components/diagrams/azureIdentityTables.tsx`(하나)·`azureSecurityModelTables.tsx`(둘):

| 표 | JSON `tables` 키 | 개념 | step | 열 |
|---|---|---|---|---|
| `SignInMethodsTable` | `sign-in-methods` | `azure-identity.passwordless` | 3 | 방법 · 로그인에 쓰는 것 · 보안과 편의 |
| `RbacRolesTable` | `rbac-roles` | `azure-security-model.rbac` | 6 | 역할 · 리소스 관리 · 역할 할당 |
| `SecurityToolsTable` | `security-tools` | `azure-security-model.sentinel` | 8 | 도구 · 맡는 일 · 고르는 때 |

- **파일**: 컴포넌트는 `src/components/diagrams/<이름>Diagram.tsx`(이름이 `Diagram.tsx`로 끝나야 교차 검사와 커버리지 테스트가 도식으로 본다), 테스트는 같은 이름의 `.test.tsx`.
  문구(물음형 제목 `question`·노드 라벨·그룹 라벨·곁말·캡션·`idleCaption`·`legend`·figure `label`·`svgLabel`·시나리오·`sources`)는 그 주제의 `src/data/azure/visuals/<주제 id>.json`의 `diagrams["<키>"]`에 둔다.
  `glossary`는 빈 배열이다(ADR-037). 도식 이름과 키는 위 표대로다 — 이미 있는 이름과 겹치지 않는 것을 골라 두었다.
- **표**: 위 「표」 표의 파일에 함수를 둔다(주제마다 파일 하나), 테스트는 같은 이름의 `.test.tsx`. `azureStorageTables.tsx`처럼 `ComparisonTableFigure`에 JSON의 `tables["<키>"]`를 넘긴다.
  열은 셋 이하(첫 열이 행 머리), `columnWidths`는 열 수만큼의 백분율이고 합이 100%다(`visuals.test.ts`).
  열 폭은 스크롤 막대가 낀 320px(표 폭 약 273px)에서 가장 긴 덩어리(띄어쓰기 없이 이어진 글자)가 들어가게 어림해 정하고, 그 계산을 summary에 적는다(실측은 phase 끝에 한다).
- **사실은 본문에만 있는 것**(ADR-036). 캡션·곁말·라벨·표 칸의 사실마다 그 개념(과 같은 주제의 다른 개념) 본문의 문단을 근거로 댈 수 있어야 한다. 예시 값도 본문에 나오는 것만(ADR-038).
  「회사 A」·「지역 A」·「VM 1」처럼 대상을 가르는 이름표는 사실이 아니므로 써도 된다. 글과 도식을 같은 step이 만드므로, 도식에 필요한 사실은 **글에 먼저 쓴다** — 출처에 없으면 그리지 않는다.
- **말**: 노드 라벨·곁말은 본문에 쓰인 말과 같게 쓴다. 라벨을 줄이거나 영문 약어로 바꿔 폭을 맞추지 마라 — 노드를 넓히거나 배치를 바꾼다. (본문이 「네트워크 보안 그룹(NSG)」처럼 약어를 함께 세웠으면 라벨에 그 약어를 써도 된다.)
- **글자 크기**: 노드 라벨 10, 그룹 라벨·곁말 9(viewBox 단위). `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`. 노드 높이는 32다(교차 검사기가 32로 본다 — 키 큰 노드를 만들지 말고 그룹 박스를 쓴다).
- **글자 폭의 여유**: `estimateTextWidth`는 반각 문자(영문·숫자·기호)를 0.55em으로 보지만 실제 화면에서는 0.61em까지 넓다(phase 72 화면 실측).
  반각 문자가 섞인 노드 라벨·곁말·그룹 라벨(예: `Microsoft Entra ID`, `MFA`, `Azure RBAC`)은 `estimateTextWidth` 값의 **1.15배**를 폭으로 잡아 노드 폭·배치를 정하고, 그 범위가 둘레 박스와 `viewBox` 안에 들게 한다.
- **그룹 박스 안의 그룹 박스**(테넌트 안의 그룹 등): 안쪽 박스의 라벨 영역이 바깥 박스의 라벨 영역과 겹치지 않게 위아래로 떼고, 노드는 자기를 담는 가장 안쪽 박스의 라벨 영역 아래에 둔다.
  세로형(폭 280)에서 나란히 두기 어려우면 위아래로 쌓는다 — 폭을 맞추려고 라벨을 줄이지 않는다.
- **색**: 노드는 모두 회색(`stroke-disabled`, 선례와 같은 클래스). 도식 전용 두 색(`diagram-managed`·`diagram-resource`)은 AWS 계층의 뜻이라 쓰지 않는다. 초록·빨강·주황, 16진 색, 이모지, O/X도 쓰지 않는다(ADR-036).
  강조는 opacity로만 한다 — 선택 밖 노드 `0.25`, 그룹 박스는 흐려지지 않는다. 나쁜 상태(거부된 요청, 뚫린 계층, 약한 처음 인증)는 색이 아니라 곁말과 흐림으로 보인다(UI_GUIDE 「수량과 상태를 바꾸는 도식」).
- **두 배치**: 세로형(`viewBox` 폭 280)과 가로형(폭 440)을 함께 만든다. 가로형은 `useWideDiagram()`이 `true`일 때 쓴다. `nodes`·`wideNodes`·경로·`wideGroups`·`wideNotes`를 **한 줄에 하나씩 글자 그대로** 적는다 —
  반복문이나 계산으로 만들지 마라(교차 검사기가 글자로 읽는다). 노드 id·경로 id·시나리오·문구는 두 배치가 함께 쓰고, 고른 시나리오는 배치가 바뀌어도 유지된다.
- **경로**: 직교(M/H/V)만, 노드 변에서 시작하고 끝나며, 다른 노드 상자 안을 지나지 않는다. 늘 보이는 연결선도 같은 경로 선언 꼴(`'id': 'M…'`)로 적는다.
  화살표 마커는 선례와 같고 마커 id는 `useId`로 만든다. 그룹 라벨 영역을 지나는 선분이 없어야 한다. 경로는 그룹 박스가 아니라 노드에서 시작하고 끝난다 — 그룹 전체를 가리키는 것은 선이 아니라 그룹 안에 둔 노드나 곁말로 보인다.
  `phases/38-service-diagrams/tools/check-path-crossings.mjs`는 `*Diagram.tsx`의 `const nodes = [`·`const wideNodes = [` 블록에서 `{ id: '…', x: N, y: N, width: N` 순서를, 경로 객체에서 `'id': 'M…'`를 정규식으로 읽는다. 이 형식을 지켜라.
- **물음형 제목**(ADR-038): 그림이 답하는 것 하나를 학습자의 말로. step 문서의 예는 바꿔도 된다.
- **시나리오**: step 문서에 적힌 시나리오를 둔다. 시나리오가 있는 도식은 `전체`(아무것도 고르지 않음)에서 노드가 모두 선명하다.
  두 시나리오의 「선명한 노드 + 보이는 경로 + 보이는 곁말」이 같으면 그 시나리오는 아무것도 가르지 못한다 — 다르게 설계한다. 캡션은 20자를 넘는다(`visuals.test.ts`).
- **금지**: SVG 두 개를 그려 놓고 CSS로 하나를 숨기지 마라. 기준 폭 문자열(`'(min-width: 768px)'`)을 도식 파일에 쓰지 마라(ADR-047). 흐르는 점·자동 재생 같은 애니메이션 금지.
  공용 컴포넌트(`DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`)와 교차 검사기, `src/lib/svg-bounds.ts`를 고치지 마라.
- **registry**: `src/components/diagrams/registry.ts`의 `diagramsByConceptId`에 `'<개념 id>': <컴포넌트>` 한 줄씩. import는 기존 정렬(모듈 경로 알파벳순),
  키는 기존 Azure 키들(`azure-data-movement.data-box`) 뒤에 개념 순서대로.
- **주제의 시각 요소 파일**: 주제를 만드는 step(1·6)이 `src/data/azure/visuals/<주제 id>.json`(`{ "diagrams": {}, "tables": {}, "glossary": [] }` 꼴)을 만들고
  `src/data/azure/index.ts`의 `visualsByTopicId`에 `'<주제 id>'`로 넣는다. import 이름은 `azureIdentityVisuals`·`azureSecurityModelVisuals`,
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

표 테스트(`azureIdentityTables.test.tsx`·`azureSecurityModelTables.test.tsx`)는 선례 `azureStorageTables.test.tsx`와 같은 것을 본다 — 로더·`glossary`, 이름·열·`columnWidths`·근거(`sources`), 행 순서와 칸 문구, `colgroup`, `ConceptList` 배치.

## 파일 형식

- `topics.json`: 주제 객체는 2칸 들여쓰기, `concepts` 배열의 개념은 **한 줄에 하나**(6칸 들여쓰기 + `JSON.stringify(concept)`). 개념 키 순서는 `id`, `parentId`(있을 때), `name`, `summary`, `paragraphs`.
  주제 키 순서는 `id`, `title`, `importance`, `sourcePages`, `concepts`. 앞 step이 쓴 줄과 다른 주제의 줄은 글자 하나도 바꾸지 않고, 자기 개념을 그 주제의 `concepts` 끝에 덧붙인다.
  주제를 만드는 step은 바로 앞 주제 객체의 닫는 줄 `  }`을 `  },`로 바꾸고 그 뒤에 새 주제를 덧붙인다 — 그 밖의 기존 줄은 바꾸지 않는다.
- `questions.json`: `[` 다음 줄부터 **한 줄에 문항 하나**, 마지막 줄 뒤에 `]`. 키 순서 — 4지선다 `id`, `topicId`, `conceptId`, `format`, `prompt`, `choices`, `answerIndex`, `explanation` /
  예/아니요 `id`, `topicId`, `conceptId`, `format`, `prompt`, `answer`, `explanation`. 기존 줄은 바꾸지 않고 끝에 덧붙인다(마지막 기존 줄 끝에 쉼표 하나를 더하는 것은 예외).
- 파일 끝 줄바꿈 하나. 스크립트로 쓸 때 CRLF로 바꾸지 않는다.
- 이 저장소의 TDD 훅은 테스트 파일 없이 새 `.js`·`.ts` 파일을 쓰지 못하게 막는다. 데이터를 고치는 일회용 스크립트가 필요하면 저장소 밖(임시 디렉터리)에 `.cjs`로 두거나 `node -e`를 쓴다.

## 개념을 넣는 step(1~4·6~8)의 공통 AC와 검증

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject azure
node -e "const q=require('./src/data/azure/questions.json');const yn=q.filter(x=>x.format==='yes-no');const ch=q.filter(x=>x.format==='choice');const pos=[0,1,2,3].map(i=>ch.filter(x=>x.answerIndex===i).length);console.log('문항',q.length,'마지막',q[q.length-1].id,'정답 위치',pos.join('/'),'예',yn.filter(x=>x.answer).length,'아니요',yn.filter(x=>!x.answer).length)"
git status --porcelain
```

- `check-verbatim`은 「전사 이상 없음」이고 **원본 411개 이상을 대조했다고 나와야 한다**(`raw/`가 없으면 「건너뜀」으로 통과하므로 그때는 blocked로 멈춘다). 균형은 위 「문항」 9항,
  교차 검사기는 「교차 없음」이고 노드·경로 수가 이 step이 더한 만큼 늘어야 한다(앞 step이 끝났을 때의 수는 그 step summary에, phase 시작 값은 「배경」에 있다). **검사기를 고쳐서 통과시키지 마라.**
- **바뀌지 않아야 하는 것을 기계로 확인한다** — `git show HEAD:src/data/azure/topics.json`·`questions.json`과 `visuals/*.json`을 지금 파일과 node로 읽어, 기존 주제 객체·기존 개념·기존 문항·기존 도식 문구가 통째로 같은지 본다.
  AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `git diff --stat`에 나오지 않아야 한다.
- **글로 읽는다** — 그 주제의 개념을 처음부터 이 step의 개념까지 처음 배우는 사람의 눈으로 통독하고, 풀이 없이 처음 나오는 낱말을 세어 본다(도식 문구 포함). 진행 안내 문장이 없는지도 본다.
  불변식과 테스트는 이런 결함을 잡지 못한다. 브라우저 화면 실측은 하지 않는다(「배경」의 시간 제한 — phase 끝에 메인 세션이 한다).
- 이모지·O/X·빨강·초록·주황·도식 전용 두 색·16진 색·애니메이션·기준 폭 문자열이 새 파일에 없는지 `grep`으로 본다.
- 바뀐 파일은 `src/data/azure/topics.json`·`questions.json`·`visuals/<주제>.json`(과 주제를 만드는 step은 `src/data/azure/index.ts`), 새 도식 컴포넌트와 테스트(step 3·6·8은 표 컴포넌트와 테스트),
  `src/components/diagrams/registry.ts`, `docs/source/azure/official.md`(「쓰인 곳」과 더한 사실), phase 메타데이터뿐이어야 한다.

**summary에 적을 것**(사용자가 이것을 읽고 판단한다): 개념마다 id·name과 **새 요약문 전문**, 문항마다 id·개념·형식·고른 방식·**문제문 전문**·정답, 균형 줄(예/아니요·정답 위치),
도식마다 이름·두 배치의 `viewBox`·시나리오별 선명한 노드·경로·곁말과 캡션 요지·물음형 제목·요점 테스트, 설계 의도와 달라진 점과 이유,
`official.md`에 더한 사실, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수, 걸린 시간의 어림. 끝에 「사용자 확인」 칸(없으면 「없음」).

## 출처 step(0·5)의 공통 형식

- `official.md` 항목: `## (phase 105) <문서 제목> — <단원·절 제목>`, URL 한 줄, 확인한 날, 직접 쓴 사실 한 줄씩(끝에 `— 「절 제목」`), **한국어 표기** 줄, 「쓰일 곳」(개념 id와 D·G 번호).
  앞 phase가 이미 둔 항목(예: 「(phase 100) …」)은 새 항목을 만들지 말고 그 항목에 사실 줄과 「쓰일 곳」을 덧붙인다 — 덧붙인 줄 끝에 `(phase 105)`.
  주제마다 「한국어 표기 정리 — `<주제 id>`」 항목을 하나 둔다(앞 phase의 항목이 본보기 — 개념마다 확정한 `name`과 근거 문서, 섞여 쓰인 표기와 고른 까닭).
- `corrections.md` 항목: `## D74 — <짧은 제목> (phase 105)`부터 덤프, `## G47 — … (phase 105)`부터 용어집. 짜임은 앞 phase 항목과 같다 — **덤프/용어집**(문항 번호·쪽-번호와 주장) · **공식 문서** · **처리**(고쳐 쓴다 / 한정해 쓴다 / 쓰지 않는다) · **쓰인 곳**.
  덤프 답이 공식 문서와 **맞는** 문항은 항목을 만들지 않는다 — summary에 「확인 결과 덤프가 맞다」로 적는다. 덤프끼리 답이 갈리는 문항은 항목으로 남긴다.
  D·G 번호는 앞 출처 step이 쓴 마지막 번호 다음부터 잇는다(step 5는 step 0의 마지막 번호 다음).
- 그림으로만 표시된 덤프 정답은 OCR 글자나 `index.json`의 `answer`를 믿지 말고 `raw/dump/img/`의 그림을 직접 본다(`docs/source/azure/CLAUDE.md` 「덤프의 그림을 보는 법」).
- **시간을 나눠 쓴다** — 두 주제 모두 덤프 문항이 약 25~30개다. 하나하나 끝까지 읽으면 30분을 넘길 수 있다(넘기면 step이 처음부터 다시 돈다).
  `dump-topics.tsv`의 `note`로 먼저 거르고, 공식 문서와 어긋날 수 있는 주장이 든 문항(수치, 옛 이름, 지원이 끝난 것, 덤프끼리 답이 갈림, 덤프에만 있는 낱말)은 문제문·보기·그림을 끝까지 읽는다.
  나머지는 덤프 답이 공식 문서와 맞는지만 확인한다. 받을 문서를 먼저 모두 받고, 확인 → 기록 순으로 한다.
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
  고칠 것을 찾으면 고치지 말고 summary에 적는다.
- **AWS·네트워크 데이터와 그 테스트를 고치지 마라.** 기존 테스트를 깨뜨리지 마라.
- **브라우저 실측을 하지 마라.** 이유: step 시간 제한 30분(「배경」). 화면 확인은 phase 끝에 한꺼번에 한다.
- **`docs/source/azure/raw/` 아래 파일을 커밋하지 마라.** 이유: 덤프·용어집·공식 문서의 추출 전문이다(ADR-009). `.gitignore`가 막고 있는지 `git status`로 본다.
- **서비스마다의 SLA 수치, 가격, 지역 수·데이터 센터 수, 대역폭 수치를 본문·문항·도식에 쓰지 마라.** 이유: 약관 원문을 받아 확인할 수 없거나(SLA), 계속 바뀌는 수다(「배경」).
- **다른 주제의 몫(Azure Policy·리소스 잠금·Purview, Azure Arc와 Resource Manager의 자세한 설명, Azure Monitor와 Log Analytics, DDoS Protection의 동작, Defender 플랜의 금액)을 개념으로 세우거나 자세히 쓰지 마라.** 이유: 그 주제를 만드는 phase의 범위다. 필요한 낱말은 그 자리에서 한 줄로 푼다.
- **「배경」이 쓰지 않기로 한 것(Entra ID Protection, PIM, Defender for Identity, 라이선스 수, Entra ID 요금제, OpenID Connect·SAML, Key Vault의 FIPS·요금제, Sentinel의 포털 전환 일정, 플랜 하나하나)을 쓰지 마라.** 이유: 학습 가이드의 줄에 없거나 자주 바뀌어 개념을 흐린다.
- **옛 이름(Azure AD, Azure AD Connect, Azure AD B2C, Azure Security Center, Azure Sentinel)을 본문·문항·도식의 이름으로 쓰지 마라.** 이유: 사용자 결정(지원이 끝난 것·옛 이름은 현행으로). 「배경」이 허용한 「예전 이름은 …」 한 번만 예외다.
