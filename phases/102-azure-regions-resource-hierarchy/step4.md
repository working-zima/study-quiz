# Step 4: hierarchy-sources

## 배경

phase 102는 Azure AZ-900 과목에 주제 둘(6 지역과 가용성 영역, 7 리소스 계층)을 더한다. 전체 계획과 결정은 `phases/102-azure-regions-resource-hierarchy/guide.md`에 있다.
step 5~7이 주제 `azure-resource-hierarchy`(리소스 계층)의 개념 6개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고,
덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다. 두 문서의 형식은 앞 phase와 step 0이 만든 것을 그대로 따른다.

이 주제의 사실은 Learn 단원 6(관리 인프라)이 뼈대이고, 덤프가 단원 6보다 자세히 묻는 것(리소스 그룹의 지역, 다른 그룹·구독으로 옮기기, 구독과 테넌트, 상속)은 Azure Resource Manager·Microsoft Entra·관리 그룹·Azure RBAC 제품 문서에서 확인한다.
덤프 쪽에서 특히 볼 것은 **지원이 끝난 것**이다 — 덤프가 「구독 관리자」로 묻는 문항(NO.40·64·289)은 Azure의 클래식 관리자 역할(계정 관리자·서비스 관리자·공동 관리자)을 가리킬 수 있는데,
이 역할들은 지원이 끝났을 수 있다(설계 때 확인하지 않음 — 이 step이 공식 문서로 확인한다). 끝났으면 그 주장은 가르치지 않는다.

이 주제의 개념은 다른 주제의 낱말(역할 할당·정책·태그)을 쓸 수밖에 없다. guide.md 「배경」대로 **그 낱말을 한 줄로 풀 근거만** 확인한다 — Azure RBAC·Azure Policy·태그 자체를 정리하지 않는다.

## 읽어야 할 파일

- `phases/102-azure-regions-resource-hierarchy/guide.md` — 특히 「두 주제와 개념 12개」의 `azure-resource-hierarchy` 표, 「한국어판에서 본 것」, 「예시 값」, 「출처」, 「출처 step(0·4)의 공통 형식」
- `phases/102-azure-regions-resource-hierarchy/index.json`의 step 0 `summary`(형식·받은 문서 이름 규칙)와 step 1~3 `summary`(주제 6이 리소스·VM·지역을 어떻게 한 줄로 풀었는지 — 표기를 맞춘다)
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — 이미 있는 항목 「Learn 「Describe the core architectural components of Azure」 — 6 …」(phase 101이 리소스·구독의 정의를 둠)과 「한국어 표기 정리」 항목들을 먼저 읽는다
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `resource-hierarchy`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다
  (설계 때 본 것: NO.40·48·51·54·59·64·79·87·93·113·121·136·154·159·164·249·270·289·309·318·335·366·369·444·472·479). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/2-architecture-services.md`의 리소스·리소스 그룹·구독·관리 그룹·계층 구조 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — `learn-describe-core-architectural-components-of-azure-6-describe-azure-management-infrastructure.md`와 `ko-` 판, `az-900-study-guide.md`
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

받는 법과 이름 규칙은 step 0과 같다(`scripts/azure-source/fetch_page.py` → `docs/source/azure/raw/official/`). 영문판으로 사실을 확인하고 한국어판은 용어 표기만 본다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `resource` | 리소스의 정의(Azure의 기본 구성 요소, 만들거나 갖추거나 배포하는 것은 무엇이든 — phase 101이 둔 줄을 다시 확인), 예(VM·가상 네트워크·데이터베이스), Resource Manager 문서의 정의(Azure를 통해 쓸 수 있는 관리 가능한 항목)와 맞는지. 리소스를 배포할 때 지역을 고른다는 것의 근거(주제 6과 맞춘다). **VM**·**가상 네트워크**를 한 줄로 풀 근거. 덤프 NO.444 | Learn 단원 6(받아 둠), Azure Resource Manager 개요(`learn.microsoft.com/azure/azure-resource-manager/management/overview`)와 한국어판 |
| b | `resource-group` | 리소스는 정확히 한 리소스 그룹에 속한다, 일부 리소스를 다른 그룹으로 옮길 수 있다(옮길 수 있는 범위·한계는 옮기기 문서), 그룹은 중첩할 수 없다, 만든 뒤 이름을 바꿀 수 없다, 그룹에 한 일이 안의 리소스 모두에(삭제하면 모두 삭제, 접근 권한을 주거나 거두면 모두에), 쓰는 예. **리소스 그룹의 지역**(그룹이 리소스의 메타데이터를 그 지역에 둔다, 안의 리소스는 그룹과 다른 지역에 있어도 된다 — 현행 문서의 말로), **다른 그룹의 리소스끼리 통신할 수 있는가**(NO.366·472 — 공식 문서가 말하는 만큼만), 리소스 그룹이 데이터 센터 장애에 대비가 되지 않는다는 것(NO.87 — 리소스 그룹이 무엇으로 정의되는지(논리적 컨테이너 등)로 판단하고, 공식 문서가 직접 말하지 않으면 「리소스 그룹은 ~이다」라는 정의와 주제 6의 가용성 영역 사실을 함께 근거로 적는다). **태그가 리소스 그룹에서 리소스로 물려지는가**(NO.54·93·335) — 사실만 `official.md`에 적고 「쓰일 곳」은 주제 `azure-cost-management`(이 phase는 쓰지 않는다). 권한이 리소스 그룹에서 안의 리소스로 물려진다는 것(NO.54·93·159·270·335 — f의 범위 문서와 함께). 덤프 NO.136·164·309(OCR 훼손 — 읽을 수 없으면 summary에) | Learn 단원 6, Resource Manager 개요, 리소스 그룹 관리(`…/management/manage-resource-groups-portal`), 리소스 옮기기(`…/management/move-resource-group-and-subscription`), 태그(`…/management/tag-resources`) |
| c | `subscription` | 구독의 정의(관리·청구·규모의 단위), Azure를 쓰려면 구독이 필요하다, 구독이 Azure 계정에 이어지고 계정은 Microsoft Entra ID(또는 그것이 믿는 디렉터리)의 ID라는 것, 계정 하나에 구독 여럿. **테넌트**의 정의와 **구독과 테넌트의 관계**(구독은 디렉터리 하나를 믿는다, 여러 구독이 같은 디렉터리를 믿을 수 있다 — 현행 문서의 말로, NO.369). **Microsoft Entra ID**를 한 줄로 풀 근거. 리소스를 다른 구독으로 옮길 수 있는가(NO.48·51·121·249 — VM을 예로, 옮기기 문서가 말하는 조건까지). 구독을 합칠 수 있는가(NO.113·318 — 공식 문서가 말하지 않으면 「쓰지 않는다」). **클래식 관리자 역할**(NO.40·64·289의 「구독 관리자」·「계정 관리자」 — 덤프가 무엇을 묻는지 그림까지 보고, 현행 상태(지원 종료 여부)를 Azure RBAC 문서에서 확인해 D 항목으로). NO.79(무엇을 먼저 만드나) | Learn 단원 6, Microsoft Entra 「Associate or add an Azure subscription to your Microsoft Entra tenant」(`learn.microsoft.com/entra/fundamentals/how-subscriptions-associated-directory`), 리소스 옮기기 문서, Azure RBAC의 클래식 관리자 문서(`learn.microsoft.com/azure/role-based-access-control/` 안) |
| d | `subscription-boundaries` | 구독의 두 경계 — 청구 경계(구독마다 청구 보고서·청구서가 따로), 액세스 제어 경계(액세스 관리 정책이 구독 수준에서 적용, 개발용·운영용 구독에 다른 지출 한도·액세스 규칙), 구독을 더 만드는 까닭(환경 — 샌드박스·개발·테스트·운영, 팀·워크로드, 청구). **두 항목의 한국어 이름**(설계 때 본 한국어판: 「청구 경계」·「액세스 제어 경계」)과 개념 이름(잠정 「구독 경계」). **운영 환경**을 한 줄로 풀 근거(앞 phase가 둔 줄이 있으면 그것). 덤프 NO.59·154(부서별로 청구를 나누는 단위) — 덤프 답이 구독인지 그림까지 보고 맞는지 | Learn 단원 6 |
| e | `management-group` | 관리 그룹의 정의(구독 위, 구독을 묶어 거버넌스 조건을 건다, 안의 구독이 저절로 물려받는다), **거버넌스**를 이 주제에서 한 줄로 풀 근거(앞 phase가 둔 줄이 있으면 그것), 중첩 단계(Learn 단원 6은 루트와 구독 단계를 빼고 6단계 — 현행 관리 그룹 문서와 맞는지), 테넌트 루트 그룹(테넌트마다 하나, 모든 관리 그룹·구독이 그 아래), 디렉터리 하나에 관리 그룹 최대 수(10,000), 관리 그룹·구독마다 부모는 하나. **한국어 표기**(관리 그룹·테넌트 루트 그룹·루트 관리 그룹 — 한국어판이 섞어 쓰면 하나로). 덤프 NO.479 | 관리 그룹 개요(`learn.microsoft.com/azure/governance/management-groups/overview`)와 한국어판, Learn 단원 6 |
| f | `hierarchy` | 네 층(관리 그룹 → 구독 → 리소스 그룹 → 리소스)이 **범위**(scope)라는 것과 그 순서, 위층에 건 것이 아래층으로 상속된다는 것, 아래층에 준 권한이 위로 올라가지 않는다는 것(문서가 말하는 만큼), Learn 단원 6의 쓰임 둘(관리 그룹에 정책 — VM을 둘 지역 제한, 리소스·구독 소유자가 바꿀 수 없다 / 관리 그룹에 역할 할당 한 번으로 여러 구독에). **정책**(Azure Policy가 무엇을 하는지 — 개요 첫 문단)과 **역할 할당**(Azure RBAC가 무엇을 하는지 — 개요 첫 문단)을 한 줄씩 풀 근거. 개념 이름 — 한국어판 절 제목 「관리 그룹, 구독 및 리소스 그룹 계층 구조」를 보고 명사구로(잠정 「관리 그룹·구독·리소스 그룹 계층」). 덤프 NO.54·93·335의 권한 상속 진술 — 덤프 답이 맞는지 | Azure RBAC 범위(`learn.microsoft.com/azure/role-based-access-control/scope-overview`), Azure RBAC 개요, Azure Policy 개요(`learn.microsoft.com/azure/governance/policy/overview`), Learn 단원 6 |
| g | 도식 | `ResourceGroupScopeDiagram`(리소스 그룹 「개발 환경」 안의 VM 1·가상 네트워크·데이터베이스와 리소스 그룹 「운영」 안의 VM 2 — 그룹 삭제와 권한 부여가 그룹 안의 리소스 모두에), `SubscriptionBoundaryDiagram`(Azure 계정 안의 구독 「개발」·「운영」, 구독마다 리소스 그룹·청구서·액세스 규칙), `HierarchyInheritanceDiagram`(테넌트 루트 그룹 → 관리 그룹 「운영」·「개발」 → 구독 → 리소스 그룹 → VM, 어느 층에 건 것이 어디까지)의 라벨·곁말·캡션의 사실마다 근거가 b·c·d·e·f에 있는지 | b~f의 결과 |

빠진 것을 읽다가 찾으면 더한다. 덤프 문항(위 번호)과 용어집 항목을 하나씩 읽어 공식 문서와 다른 주장이 더 있는지 본다.
NO.54·93·309·335·59(`cost-management`·`security-model`과 함께), NO.159(`security-model`), NO.289(`identity`), NO.479(`governance`)는 다른 주제와 함께 걸린 문항이다 —
이 주제의 개념이 쓰는 부분만 처리하고, 다른 주제의 부분(태그 등)은 사실만 남기고 「쓰일 곳」에 그 주제를 적는다.

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·4)의 공통 형식」대로. 이미 있는 단원 6 항목에는 사실 줄을 덧붙이고(끝에 `(phase 102)`), 새로 받은 문서는 새 항목으로 둔다.
끝에 「한국어 표기 정리 — `azure-resource-hierarchy`」 항목 — 개념 6개와 목록 항목 이름(청구 경계·액세스 제어 경계)마다 고른 표기와 근거 문서, 섞여 쓰인 표기와 고른 까닭.

### 3. `docs/source/azure/corrections.md`에 더한다

step 0이 이어 쓴 번호 뒤부터(step 0 summary). 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.40·64·289의 「구독 관리자」·「계정 관리자」** — 클래식 관리자 역할의 현행 상태. 지원이 끝났으면 「쓰지 않는다」, 아니면 덤프 답이 맞는지.
- **NO.113·318의 구독 합치기**, **NO.48·51·121·249의 다른 구독으로 옮기기** — 덤프 답이 현행 문서와 맞는지. OCR이 손상된 NO.51·121은 그림을 보고, 읽을 수 없으면 summary에 적고 항목을 만들지 않는다.
- **NO.54·93·335의 태그 상속** — 덤프 답이 맞는지만 보고 처리는 「이 phase에서 쓰지 않는다(`azure-cost-management`)」.
- **NO.87의 「리소스 그룹으로 데이터 센터 장애에 대비」** — 덤프 답이 맞는지(대비가 되지 않는다는 쪽이 정답인지).
- 용어집 리소스 그룹·구독·관리 그룹·계층 구조 항목의 수치(관리 그룹 단계·최대 수)·상속 주장이 현행 문서와 다른 곳.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-resource-hierarchy`의 개념 6개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**.
목록 개념(`subscription-boundaries`)은 항목 이름도. 위 표의 a~g마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다.
특히 (1) 리소스 그룹의 지역·다른 그룹 리소스끼리의 통신을 쓸 수 있는지, (2) 다른 구독으로 옮기기·구독 합치기·클래식 관리자 역할의 처리, (3) 구독과 테넌트의 관계를 쓸 말, (4) 관리 그룹 중첩 단계·최대 수의 현행 값, (5) 개념 12의 이름, (6) 정책·역할 할당을 한 줄로 풀 말의 근거.
받은 파일 목록(`raw/official/`). 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·4)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작 값은 step 3 summary).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/102-azure-regions-resource-hierarchy/index.json`의 step 4를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 5~7이 쓴다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.** 이유: 허용 출처를 넓히는 것은 설계에서 정한다. 다른 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **Azure RBAC·Azure Policy·태그의 사실을 개념 단위로 정리하지 마라**(역할 정의의 종류, 정책 효과, 태그 한도 등). 이유: 주제 `azure-security-model`·`azure-governance`·`azure-cost-management`를 만드는 phase의 범위다. 이 주제가 한 줄로 풀 근거와 덤프 처리만 남긴다.
- **step 0이 쓴 `azure-regions-zones`의 항목을 고치지 마라.** 고칠 것을 찾으면 summary에 적는다.
- **`topic-map.md`·`dump-topics.tsv`를 고치지 마라.**
