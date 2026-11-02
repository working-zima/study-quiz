# Step 0: identity-sources

## 배경

phase 105는 Azure AZ-900 과목에 주제 둘(13 ID와 인증, 14 접근 제어와 보안 도구)을 더한다. 전체 계획과 결정은 `phases/105-azure-identity-security/guide.md`에 있다.
step 1~4가 주제 `azure-identity`의 개념 9개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고, 덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다. 두 문서의 형식은 앞 phase가 만든 것을 그대로 따른다.

이 주제의 중심 문제는 둘이다.
(1) **덤프가 낡았거나 틀린 답** — 덤프는 거의 모두 옛 이름(Azure AD, Azure AD Connect, Azure AD B2C)으로 묻는다. 설계 때 본 예: NO.142·505는 「암호 + 보안 질문」을 다단계 인증의 예로 답하지만 Learn 단원 3은 둘을 같은 범주(아는 것)로 적는다.
(2) **Learn 단원과 제품 문서의 차이** — 외부 ID의 이름, 암호 없는 방법의 이름(FIDO2 보안 키와 패스키). 다르면 현행 제품 문서를 따른다.

## 읽어야 할 파일

- `phases/105-azure-identity-security/guide.md` — 특히 「배경」, 「두 주제와 개념 16개」의 `azure-identity` 표, 「예시 값」, 「출처」, 「출처 step(0·5)의 공통 형식」
- `docs/source/azure/CLAUDE.md` — 원본 셋, 허용하는 출처, 가리키는 표기, 덤프의 그림을 보는 법. **이 규칙을 따른다**
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞 phase가 만든 형식을 따른다.** Entra ID를 말하는 기존 항목(`grep -n 'Entra' docs/source/azure/official.md`)과 「한국어 표기 정리」 항목들을 먼저 읽는다
- `phases/104-azure-storage-migration/verification.md`의 「설계와 달라진 것」 — 출처 step이 현행 문서로 바꾼 방식
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `identity`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다(문항 번호는 guide.md 표의 「덤프」와 NO.26·112·157·212·244·264·361·496). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/3-identity-access-security.md`의 Entra ID·SSO·MFA 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — guide.md 「출처」의 목록
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

공식 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 받아 `raw/official/`에 둔다(`CERTIFICATE_VERIFY_FAILED`면 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`).
이름은 `learn-<모듈>-<단원>.md`, `docs-<서비스>-<쪽>.md`, 한국어판은 앞에 `ko-`를 붙인다. 영문판으로 사실을 확인하고, 한국어판은 **용어 표기만** 본다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `entra-id` | 정의, 옛 이름과의 관계(`docs-entra-new-name`), 항목 넷(인증·SSO·애플리케이션 관리·디바이스 관리), 누가 쓰는가, Microsoft가 운영하고 ID는 고객이 관리, **ID**·**디렉터리**·**테넌트**를 한 줄로 풀 근거. 덤프 NO.28(온-프레미스 앱 관리, iOS 등록)·194·207·212·291·296·364·381·399·469 — 도메인 컨트롤러 필요 여부, 사용자를 리소스 그룹으로 묶는가, 그룹 정책, 디바이스 조인의 범위. **라이선스 진술은 처리만 남기고 쓰지 않는다** | Learn 단원 2, `docs-entra-whatis` |
| b | `entra-connect` | 정의, 동기화의 방향(Learn은 「두 시스템 사이」 — 제품 문서로 확인, 도식의 화살표 방향을 정한다), 연결 뒤 얻는 것, 어디에 설치하는지(문서에 있으면 — 도식의 노드 위치를 정한다), 현행 이름(Entra Connect·Connect Sync·Cloud Sync 가운데 무엇으로 쓸지). 덤프 NO.244·351·362 | Learn 단원 2, Entra Connect 소개 |
| c | `domain-services` | 정의, 제공 기능, 옛 앱이라는 쓰임, 도메인 컨트롤러 둘과 복제본 집합, 관리 범위, **한 방향 동기화**, Entra ID와의 차이. **도메인 조인**·**그룹 정책**·**LDAP**·**Kerberos**를 한 줄로 풀 근거 | Learn 단원 2, Domain Services 개요 |
| d | `authentication-authorization` | 인증·권한 부여의 정의와 순서, **자격 증명**. 덤프 NO.21·38·73·230·250·274·311·375의 답 — 그림까지 본다 | `entra/identity-platform/authentication-vs-authorization`, Learn 단원 3 |
| e | `single-sign-on` | 정의, 이점, 「처음 인증만큼만 안전」, 한국어 표기(「SSO」·「Single Sign-On」·「통합 인증」 가운데 — 제품 문서 한국어판 기준). 덤프 NO.469 | Learn 단원 3, Entra SSO 문서 |
| f | `multifactor-authentication` | 세 범주, 표기(「다단계 인증」과 「다중 요소 인증」), Microsoft Entra 다단계 인증의 현행 방법 목록, **보안 질문이 MFA 방법인가**(`concept-authentication-methods`·`concept-authentication-security-questions` 등 — 설계 때 받아 본 두 쪽에는 낱말이 없어 더 찾아야 한다). **NO.142·505**: 답을 그림까지 보고, 같은 범주의 둘이 다단계 인증이 아니라는 근거가 있으면 D 항목으로. 근거를 못 찾으면 그 사실을 summary에 적는다 — 그때는 「암호와 보안 질문은 같은 범주」까지만 쓰고 다단계 인증의 예로 들지 않는다. **NO.157·361**: 동기화 전제, 사진 신분증·여권 번호, 적용 대상 | Learn 단원 3, MFA 동작 문서 |
| g | `passwordless` | 정의, 방법 셋과 현행 이름, 각각의 동작, Learn 그림의 보안·편의 위치(암호·MFA·암호 없는 인증 — 그림은 Learn 쪽에서 내려받아 본다. 글에 있는 것: 암호 없는 인증은 높은 보안·높은 편의, 암호만은 낮은 보안·높은 편의). `SignInMethodsTable`의 칸마다 근거. 덤프 NO.112의 답 — 그림까지 본다 | Learn 단원 3, `concept-authentication-passwordless` |
| h | `external-identities` | 정의, 인증은 외부 공급자가·권한 부여는 우리가, 셋의 현행 이름과 차이(디렉터리에 표시되는가), 고객 쪽 이름(Learn의 Azure AD B2C와 「External ID for customers」 — 현행 제품 문서로), 액세스 검토. `ExternalIdentitiesDiagram`의 사실 | Learn 단원 4, `external-identities-overview` |
| i | `conditional-access` | 정의, 신호·결정·적용의 흐름과 예, 쓰임 넷, **관리되는 디바이스**. **NO.151**(패치된 장치만 — 관리되는 디바이스·규정 준수 조건으로 설명되는지), NO.274·375, NO.496의 조건부 MFA. 표기 | Learn 단원 5, 조건부 액세스 개요 |
| j | 도식·표 | `EntraConnectDiagram`·`DomainServicesDiagram`·`AuthVsAuthzDiagram`·`SingleSignOnDiagram`·`MfaFactorsDiagram`·`ExternalIdentitiesDiagram`·`ConditionalAccessDiagram`과 `SignInMethodsTable`의 라벨·곁말·캡션·칸의 사실마다 근거가 있는지(각 step 문서의 설계를 읽는다) | a~i의 결과 |

NO.264(Identity Protection)·NO.496의 위협 감지(ATP)는 guide 「배경」이 쓰지 않기로 했다 — 문항 처리만 summary에 적는다. NO.26(구독에 새 사용자를 만드는 곳)은 어느 서비스가 맞는지 확인한다.

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·5)의 공통 형식」대로. Learn 단원 2~5를 새 항목으로 둔다. 끝에 「한국어 표기 정리 — `azure-identity`」 항목 — 개념 9개와 목록 항목 이름마다 고른 표기와 근거 문서, 섞여 쓰인 표기와 고른 까닭.

### 3. `docs/source/azure/corrections.md`에 더한다

D74·G47부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.142·505** — 암호 + 보안 질문을 다단계 인증으로 답한 것.
- **NO.28·207·296·364·399** — 온-프레미스 앱, 도메인 컨트롤러, 라이선스, 그룹 정책, 디바이스 조인의 진술.
- **용어집 3-1·3-2·3-3** — Entra ID의 「B2B, B2C」, MFA의 「OTP, 문자, 생체」와 위험 감지 자동 MFA.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-identity`의 개념 9개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**. 목록 개념은 항목 이름도. 위 표의 a~j마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다.
특히 (1) 보안 질문과 같은 범주의 조합을 어떻게 쓸지, (2) Connect의 동기화 방향과 도식의 위치, (3) 외부 ID 셋의 확정 이름, (4) 암호 없는 방법 셋의 확정 이름과 `SignInMethodsTable`의 칸, (5) 도식 일곱에 쓸 수 있는 사실과 이름. 받은 파일 목록. 마지막 D·G 번호. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·5)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작 411개).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/105-azure-identity-security/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.** 이유: 허용 출처를 넓히는 것은 설계에서 정한다. 다른 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **`azure-security-model`의 사실(RBAC·제로 트러스트·심층 방어·Defender·Key Vault·Sentinel)을 이 step에서 정리하지 마라.** 이유: step 5의 범위다.
- **`topic-map.md`·`dump-topics.tsv`를 고치지 마라.**
