# Step 5: security-sources

## 배경

phase 105의 전체 계획과 결정은 `phases/105-azure-identity-security/guide.md`에 있다.
step 6~8이 주제 `azure-security-model`의 개념 7개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고, 덤프·용어집이 공식 문서와 다른 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다.

이 주제의 중심 문제: **옛 이름과 범위가 바뀐 서비스.** 덤프의 Azure Security Center·Azure Sentinel은 지금 Microsoft Defender for Cloud·Microsoft Sentinel이다. Defender for Cloud의 무료·유료 범위도 옛 표현과 다를 수 있다. Key Vault와 Sentinel은 학습 가이드 밖이라 Learn 단원이 없고 제품 문서가 기준이다.

## 읽어야 할 파일

- `phases/105-azure-identity-security/guide.md` — 특히 「배경」, 「두 주제와 개념 16개」의 `azure-security-model` 표, 「출처」, 「출처 step(0·5)의 공통 형식」
- `phases/105-azure-identity-security/index.json`의 step 0 `summary` — 표기와 마지막 D·G 번호
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞이 만든 형식을 따른다.** step 0이 쓴 항목과 RBAC·DDoS를 말하는 기존 항목을 먼저 읽는다
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `security-model`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다. 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/3-identity-access-security.md`의 RBAC·제로 트러스트·심층 방어·Defender for Cloud·Sentinel·Key Vault 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 Learn 단원 6·7·8·9와 `ko-` 판, `docs-rbac-overview.md`·`docs-rbac-scope-overview.md`
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

공식 문서를 받는 법과 파일 이름은 step 0과 같다(guide.md 「출처」). 영문판(`en-us`)으로 사실을 확인하고, 한국어판(`ko-kr`)은 **용어 표기만** 본다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `rbac` | 최소 권한, 역할·기본 제공 역할·사용자 지정 역할, 그룹에 할당, 할당을 둘 수 있는 대상. **기본 제공 역할 넷**(Owner·Contributor·Reader·User Access Administrator)의 정의와 한국어 표기 — 표 `RbacRolesTable`의 칸마다 근거(Contributor가 역할을 할당하지 못하는 것 등). 덤프 NO.81(포털의 어느 메뉴 — 그림까지, 덤프 답 「Policies」가 맞는지), NO.137(관리 그룹의 접근·정책, 최소 권한의 답), NO.217, NO.383·386 | Learn 단원 6, `built-in-roles`, `custom-roles`, `docs-rbac-overview` |
| b | `rbac-scope` | 범위 넷, 상속, **허용 모델**, Resource Manager를 거치는 동작, 「앱·데이터 수준은 강제하지 않는다」(Learn 단원 6). **제품 문서의 데이터 작업(data actions)과 어긋나는지** 본다 — Azure RBAC에 Blob 데이터 읽기 같은 역할이 있으면 Learn의 말을 그대로 쓰면 틀린다. 어떻게 한정해 쓸지 정하고 근거를 적는다. 거부 할당을 쓸지(「허용 모델」과의 관계) — 쓰지 않더라도 단정이 틀리지 않게 | Learn 단원 6, `docs-rbac-overview`, `docs-rbac-scope-overview` |
| c | `zero-trust` | 정의, 원칙 셋과 표기, 경계 기반과의 차이, 예. **JIT·JEA**를 풀 근거 | Learn 단원 7, `security/zero-trust/zero-trust-overview` |
| d | `defense-in-depth` | 계층 일곱의 이름·순서·역할과 표기, 각 계층의 Azure 예. 덤프 NO.52·116·222(DDoS 보호의 계층), NO.368·203(그림 판독이 어려우면 그 사실을 적는다) | Learn 단원 8 |
| e | `defender-for-cloud` | 정의, 옛 이름(근거 문서), Azure·온-프레미스(Azure Arc)·다른 클라우드, **평가·보안·방어**, 보안 점수, 권장 사항, JIT VM 액세스, **규정 준수**의 현행 위치(NO.37·153·185·292), 무료 범위(Foundational CSPM)와 유료 플랜(NO.401·422·460 — 「모든 기능이 무료」의 답), 표기(한국어 이름) | Learn 단원 9, `defender-for-cloud-introduction`, `concept-regulatory-compliance-standards` |
| f | `key-vault` | 정의, 비밀·키·인증서, 접근 통제, 앱 코드에서 비밀을 빼는 쓰임. NO.74(Azure Disk Encryption에 Key Vault가 먼저 필요한가 — 관련 제품 문서를 찾아 확인), NO.152, NO.414 | `key-vault/general/overview`, Azure Disk Encryption 문서 |
| g | `sentinel` | 정의, **SIEM**(그리고 SOAR를 현행 문서가 쓰는지), 수집·탐지·조사·대응의 현행 절 이름, 플레이북(NO.219), Entra ID의 보안 이벤트를 모을 수 있는지(NO.170), 옛 이름 | `sentinel/overview`, 플레이북 문서 |
| h | 도식·표 | `RbacAssignmentDiagram`·`RbacScopeDiagram`·`ZeroTrustDiagram`·`DefenseInDepthDiagram`·`DefenderForCloudDiagram`·`SentinelFlowDiagram`과 `RbacRolesTable`·`SecurityToolsTable`의 라벨·곁말·캡션·칸의 사실마다 근거가 있는지(각 step 문서의 설계를 읽는다) | a~g의 결과 |

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·5)의 공통 형식」대로. Learn 단원 6~9와 받은 제품 문서마다 항목을 둔다. 끝에 「한국어 표기 정리 — `azure-security-model`」 항목.

### 3. `docs/source/azure/corrections.md`에 더한다

D·G 번호는 step 0의 마지막 다음부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.81** — 역할 할당을 「Policies」 메뉴에서 한다는 답. 포털의 액세스 제어(IAM)와 맞는지.
- **NO.185·153·422** — 옛 이름 Security Center로 묻는 규정 준수.
- **NO.401·422·460** — 무료 범위의 진술.
- **용어집 3-4·3-5·3-6·3-7·3-8·3-9** — 「Reader, Contributor, Owner」의 표현, 심층 방어를 네 계층처럼 적은 것, Sentinel의 「AI 기반」·「SOAR」, Key Vault의 HSM.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-security-model`의 개념 7개마다 한 줄씩: **확정한 `name`, 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지.** 위 표의 a~h마다 결과와 근거 문서.
특히 (1) 「앱·데이터 수준」을 어떻게 한정해 쓰는지, (2) 역할 넷의 확정 이름과 `RbacRolesTable`의 칸, (3) 계층 일곱의 확정 이름, (4) Defender의 무료·유료를 금액 없이 어떻게 쓰는지, (5) `SecurityToolsTable`의 칸, (6) 도식 여섯에 쓸 수 있는 사실과 이름. 받은 파일 목록. 마지막 D·G 번호. 끝에 「사용자 확인」 칸(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·5)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다.
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/105-azure-identity-security/index.json`의 step 5를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.** 이유: 허용 출처를 넓히는 것은 설계에서 정한다. 필요하면 summary의 「사용자 확인」에 적는다.
- **Defender 플랜의 금액, Sentinel의 데이터 요금을 적지 마라.** 이유: 가격을 쓰지 않는다(guide.md 「배경」).
- **`topic-map.md`·`dump-topics.tsv`를 고치지 마라.**
