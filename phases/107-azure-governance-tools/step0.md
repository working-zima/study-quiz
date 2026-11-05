# Step 0: governance-sources

## 배경

phase 107은 Azure AZ-900 과목에 주제 셋(17 거버넌스와 규정 준수, 18 관리 도구, 19 ARM과 코드형 인프라)을 더한다. 전체 계획과 결정은 `phases/107-azure-governance-tools/guide.md`에 있다.
step 1~3이 주제 `azure-governance`의 개념 7개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고, 덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다. 두 문서의 형식은 앞 phase가 만든 것을 그대로 따른다.

이 주제의 중심 문제는 셋이다.
(1) **옛 이름과 지원이 끝나는 서비스** — 덤프는 Azure Information Protection(NO.111·408·427)과 Azure Blueprints(NO.77·181)를 묻는다. guide 「배경」대로 AIP는 Microsoft Purview Information Protection의 민감도 레이블로 고쳐 쓰고, Blueprints는 쓰지 않는다. 둘 다 D 항목으로 남긴다.
(2) **정책과 잠금의 동작을 어디까지 단정할 수 있는가** — 덤프는 이미 있던 리소스의 운명(NO.53·215·239·500), 잠금이 겹칠 때(NO.106·313·415), 잠긴 리소스 그룹의 삭제(NO.33·69·141·258·330)를 진술 묶음으로 묻는다. 진술마다 공식 문서의 근거를 찾고, 그림으로 된 답은 그림을 본다.
(3) **덤프 답 자체의 의심** — NO.181은 지운 잠금을 되살리는 서비스를 AIP로 답한다.

## 읽어야 할 파일

- `phases/107-azure-governance-tools/guide.md` — 특히 「배경」, 「세 주제와 개념 17개」의 `azure-governance` 표, 「예시 값」, 「출처」, 「출처 step(0·4·8)의 공통 형식」
- `docs/source/azure/CLAUDE.md` — 원본 셋, 허용하는 출처, 가리키는 표기, 덤프의 그림을 보는 법. **이 규칙을 따른다**
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞 phase가 만든 형식을 따른다.** 정책·잠금·RBAC을 말하는 기존 항목(`grep -n 'Azure Policy\|잠금\|lock\|management-groups' docs/source/azure/official.md`)과 phase 106의 「한국어 표기 정리」·「도식·표의 사실」 항목을 먼저 읽는다. 앞 phase가 이 주제로 미룬 줄(`grep -n '거버넌스 주제\|azure-governance' docs/source/azure/corrections.md`)도 찾아 이번에 처리한다
- `phases/106-azure-cost/verification.md`의 「설계와 달라진 것」 — 출처 step이 현행 문서로 바꾼 방식
- `docs/source/azure/topic-map.md`의 주제 17 줄과 `dump-topics.tsv`에서 `primary`가 `governance`인 29문항(`awk -F'\t' '$2=="governance"' docs/source/azure/dump-topics.tsv`) — 이 step의 문항 목록. `secondary`에 `governance`가 걸린 NO.479도 본다
- 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다. 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/4-management-governance.md`의 Microsoft Purview·Azure Policy·리소스 잠금·Azure Blueprint 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — guide.md 「출처」의 목록
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

공식 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 받아 `raw/official/`에 둔다(`CERTIFICATE_VERIFY_FAILED`면 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`).
이름은 `learn-<모듈>-<단원>.md`, `docs-<서비스>-<쪽>.md`, 한국어판은 앞에 `ko-`를 붙인다. 영문판으로 사실을 확인하고, 한국어판은 **용어 표기만** 본다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `purview` | 정의와 표기, 두 갈래(위험 및 규정 준수 / 통합 데이터 거버넌스)의 한국어 이름, 데이터를 찾고·분류하고·계보를 보는 것의 표기(「계보」·「데이터 계보」), 온-프레미스·다중 클라우드·SaaS의 데이터를 함께 본다. 갈래마다 무엇을 하는지 — Learn의 항목을 직접 쓴 말로 옮길 수 있는 범위. 예전 이름 Azure Purview(용어집)가 맞는지. `PurviewDataMapDiagram`에 쓸 말(데이터가 있는 곳 셋, 한곳에서 보는 것 셋) | Learn 단원 2와 ko, `purview/purview`, 계보 쪽 |
| b | `sensitivity-labels` | **AIP의 현재**(추가 기능 지원 종료, Purview Information Protection — `docs-information-protection-what-is.md`), 민감도 레이블의 정의와 한국어 표기, 레이블이 하는 일(암호화·표시 — 워터마크·머리글·바닥글), **자동으로 붙이는 범위**(사용자에게 권하기 / 조건에 맞으면 붙이기, 어디서 — Office 앱·서비스), **암호화가 파일을 따라가는가**(회사 밖으로 보낸 뒤에도), 기본 레이블 이름의 한국어 표기(예시 값에 쓴다). NO.111·408·427을 D 항목으로(이름 고침 — 답의 방향은 맞는지 본다). `SensitivityLabelDiagram`에 쓸 말 | `docs-purview-sensitivity-labels.md`, `purview/information-protection`, `purview/apply-sensitivity-label-automatically`, `purview/encryption-sensitivity-labels` |
| c | `azure-policy` | 정의, **정책 정의**와 **할당**의 한국어 표기, 할당할 수 있는 범위(관리 그룹·구독·리소스 그룹·**리소스 하나** — `docs-policy-overview.md`가 리소스도 든다), 상속, 기본 제공 정의와 그 예의 한국어 이름(허용 위치·허용되는 가상 머신 크기 SKU·허용되지 않는 리소스 유형·태그 요구 — 이름 표기), **어긋난 리소스를 만들거나 바꾸는 요청을 막는다**, **Azure RBAC와의 차이**(`docs-policy-overview.md` 「Azure Policy and Azure RBAC」 — 권한이 있어도 결과가 비준수면 막는다). NO.41(여러 구독 — 관리 그룹과의 관계, NO.479와 함께), NO.123·450, NO.357, NO.239 첫째 진술 | Learn 단원 3, `docs-policy-overview.md`, `assignment-structure`, `effect-basics`, `built-in-policies` |
| d | `policy-compliance` | 이미 있던 리소스를 평가하는가, 어긋나면 무엇이 되는가(**비준수 표시 — 지우지·옮기지·멈추지 않는다**의 근거), 평가 시점, 「규정 준수」·「비준수」의 한국어 표기, **수정 작업**(remediation — 무엇을 고칠 수 있고 기존 리소스는 따로 수정 작업을 만들어야 하는가), **예외**(exemption — 표기, Learn의 「exceptions」와 같은 것인지), 규정 준수 상태를 보는 곳. **NO.53·215·500**(VNet을 허용하지 않는 정책 뒤 기존 VNet — 그림까지, 덤프끼리 답이 갈리는지), **NO.239** 둘째·셋째 진술(그림까지) | `docs-policy-overview.md`, `get-compliance-data`, `remediate-resources`, `exemption-structure` |
| e | `policy-initiatives` | 정의와 한국어 표기(「이니셔티브」·「정책 이니셔티브」·「정책 집합」 — 하나로 정한다), 한 번에 할당, 규정 준수 상태를 함께 본다, 이니셔티브에 정의를 더하면 기존 할당에도 들어간다(`docs-policy-overview.md`), **관리 그룹과 무엇이 다른가**(쓸 근거). Learn의 예 「Azure Security Center」는 옛 이름 — 이름 없이 쓸 말을 정한다. NO.24·36·321·442·498(되풀이 — 덤프가 맞는지 묶어서) | Learn 단원 3, `docs-policy-overview.md`, `initiative-definition-structure` |
| f | `resource-locks` | 정의, **두 종류의 한국어 표기**(Delete / ReadOnly — 포털의 「삭제」·「읽기 전용」, 문서의 CanNotDelete), 각각 읽기·고치기·지우기 가운데 무엇을 막는가, **역할과 상관없이 적용** — 소유자도 먼저 잠금을 풀어야 한다, 잠금을 걸고 푸는 데 필요한 권한(문서에 있으면 — 역할 이름은 앞 phase 표기), **읽기 전용이 예상 밖으로 막는 일**(`docs-azure-resource-manager-management-lock-resources.md`의 「Considerations」에서 학습자가 읽을 만한 예 하나 — 저장소 계정의 키 목록 같은 것), 잠금은 관리 작업에만 걸리고 데이터 작업에는 걸리지 않는가(문서대로 — 쓸지는 summary에). NO.76·440 | Learn 단원 4, `docs-azure-resource-manager-management-lock-resources.md`와 ko |
| g | `lock-inheritance` | 상속(구독·리소스 그룹에 건 잠금을 안의 리소스가 물려받는다), **한 리소스에 잠금이 여럿이면 가장 제한적인 것**, 같은 종류를 여럿 걸 수 있는가, 읽기 전용 위에 삭제 잠금을 더할 수 있는가 — **NO.106·313·415**(그림까지, 덤프끼리 답이 갈리는지), **잠긴 리소스가 든 리소스 그룹을 지울 수 있는가** — **NO.33·69·141·258·330**(그림까지 — 「전역 관리자만」 같은 보기의 처리). 이 개념의 이름(「잠금 상속」 등 — 문서에 이 낱말이 없으면 하는 일로 이름을 정한다) | 같은 문서, Learn 단원 4 |
| h | 범위 밖 | **Azure Blueprints**: 지원 종료 날짜(`blueprints-overview.md` — 단계적 종료 시작 2026-07-31, 종료 2027-01-31), NO.77·181을 D 항목으로. NO.181의 답(AIP)이 왜 틀렸는지도 그 항목에. 용어집 Azure Blueprint 항목은 G. **NO.388**(거버넌스 기능 짝짓기 — 그림을 보고 기능마다 처리) | `blueprints-overview.md`, 덤프 그림 |
| i | 도식·표 | `PurviewDataMapDiagram`·`SensitivityLabelDiagram`·`PolicyCheckDiagram`·`PolicyComplianceDiagram`·`PolicyInitiativeDiagram`·`LockTypesDiagram`·`LockInheritanceDiagram`과 `GovernanceToolsTable`의 라벨·곁말·캡션·칸의 사실마다 근거가 있는지(각 step 문서의 설계를 읽는다). 표의 Azure RBAC 행에 쓸 말 | a~h의 결과 |

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·4·8)의 공통 형식」대로. Learn 단원 2·3·4를 새 항목으로 두고, 앞 phase가 둔 「Azure Policy」 개요 항목이 있으면 거기에 덧붙인다. 끝에 「도식·표의 사실 — `azure-governance`」과 「한국어 표기 정리 — `azure-governance`」 항목 — 개념 7개와 목록 항목 이름마다 고른 표기와 근거 문서, 섞여 쓰인 표기와 고른 까닭.

### 3. `docs/source/azure/corrections.md`에 더한다

D106·G60부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.111·408·427** — Azure Information Protection(옛 이름, 추가 기능 지원 종료).
- **NO.77·181** — Azure Blueprints(지원 종료). NO.181은 답 자체도.
- **NO.53·215·500·239** — 정책을 할당한 뒤 기존 리소스의 운명(덤프끼리 갈리면).
- **NO.106·313·415**, **NO.33·69·141·258·330** — 잠금의 겹침과 리소스 그룹 삭제(덤프가 공식 문서와 다르면).
- **용어집 4쪽 Microsoft Purview(「과거 Azure Purview」), Azure Policy(「자동 수정」의 범위), Azure Blueprint** — 무엇을 주장하는지 보고 처리한다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-governance`의 개념 7개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**. 목록 개념은 항목 이름도. 위 표의 a~i마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다.
특히 (1) 민감도 레이블이 자동으로 붙는 범위와 암호화가 파일을 따라가는가, (2) 정책이 막는 것과 이미 있던 리소스에 일어나는 일(쓸 수 있는 말 그대로), (3) 수정 작업·예외의 확정 표기와 범위, (4) 이니셔티브의 확정 이름, (5) 잠금 두 종류의 확정 이름과 각각 막는 일, 겹칠 때와 리소스 그룹을 지울 때, (6) Azure RBAC와 Azure Policy·리소스 잠금을 가르는 말, (7) 도식 일곱과 표에 쓸 수 있는 사실과 이름. 받은 파일 목록. 마지막 D·G 번호. 끝에 「메인 세션이 볼 것」(앞 phase 문장과 어긋나는 곳 — 특히 `azure-resource-hierarchy.hierarchy`의 정책 설명)과 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·4·8)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작 655개).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/107-azure-governance-tools/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 앞 phase 문장도 고치지 않는다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 정책·잠금의 「~하지 않는다」는 특히 — 근거를 못 찾은 것은 「못 찾음」으로 남긴다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.** 이유: 허용 출처를 넓히는 것은 설계에서 정한다. 다른 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **`azure-management-tools`·`azure-infrastructure-as-code`의 사실(포털·Cloud Shell·명령 도구·Arc·Resource Manager·템플릿)을 이 step에서 정리하지 마라.** 이유: step 4·8의 범위다. 잠금을 거는 도구를 한 줄로 쓸 근거만 적는다.
