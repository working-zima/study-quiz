# Step 4: cost-management-sources

## 배경

phase 106의 전체 계획과 결정은 `phases/106-azure-cost/guide.md`에 있다.
step 5~8이 주제 `azure-cost-management`의 개념 8개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고, 덤프·용어집이 공식 문서와 다른 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다.

이 주제의 중심 문제는 셋이다.
(1) **요금제·계약에 따라 다른 사실** — Cost Management를 누가 쓰는가(NO.359의 답은 Enterprise Agreement가 필요하다고 한다), 지출 한도가 어느 구독에 있는가.
(2) **자주 바뀌는 무료 계정** — Learn(free trial), 제품 문서(free account), 가격 쪽의 설명과 수가 다를 수 있다. 쓸 값과 확인한 날을 남긴다. 금액·제품 개수는 쓰지 않는다.
(3) **앞 phase 문장과의 관계** — `azure-resource-hierarchy.subscription-boundaries`와 `management-group`이 「구독마다 지출 한도를 둘 수 있다」고 쓴다. 제품 문서는 지출 한도가 크레딧이 있는 구독에만 있다고 한다. 대조해 결과를 summary 「사용자 확인」이 아니라 **「메인 세션이 볼 것」** 칸에 적는다. 앞 phase 데이터는 고치지 않는다.

## 읽어야 할 파일

- `phases/106-azure-cost/guide.md` — 특히 「배경」, 「두 주제와 개념 15개」의 `azure-cost-management` 표, 「출처」, 「출처 step(0·4)의 공통 형식」
- `phases/106-azure-cost/index.json`의 step 0 `summary` — 표기와 마지막 D·G 번호
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞이 만든 형식을 따른다.** step 0이 쓴 항목과 태그·구독·지출 한도를 말하는 기존 항목(`grep -n '태그\|지출 한도\|spending' docs/source/azure/official.md`)을 먼저 읽는다
- `docs/source/azure/topic-map.md`의 「`cost-management` 라벨의 배정」 — 이 step의 문항 목록과, `resource-hierarchy`가 대표지만 태그를 묻는 NO.54·93·309·335
- 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다. 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/4-management-governance.md`의 비용 관리·태그 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — guide.md 「출처」의 목록
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

받는 법과 파일 이름은 step 0과 같다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `cost-management` | 정의·표기(「Microsoft Cost Management」, 「비용 관리」가 섞인다 — 고른다), 항목 셋의 이름. **누가 쓰는가**: NO.359(EA가 전제인가 — `docs-cost-management-understand-data.md`의 지원 표로 종량제·EA·MCA를 본다), NO.209·316(관리 그룹·리소스 그룹의 비용, 지난 3개월의 VM 사용량 — 그림까지). 클래식 CSP처럼 지원되지 않는 경우는 쓰지 않는다 | Learn 단원 6, `docs-cost-management-overview.md`, `docs-cost-management-understand-data.md` |
| b | `cost-analysis` | 나눠 보는 기준의 목록, 누적 비용·예측, 어느 범위에서 여는가. `CostAnalysisDiagram`의 세 기준(리소스 그룹·서비스·지역)의 근거. 한국어 표기 | Learn 단원 6, `azure/cost-management-billing/costs/quick-acm-cost-analysis` |
| c | `budgets` | 정의, 범위·필터, 기간과 재설정, 실제 비용과 예측 비용, **리소스가 영향을 받지 않고 사용이 멈추지 않는다**(`docs-cost-management-create-budgets.md`), 자동화(작업 그룹 등 — Learn의 「자동화로 멈출 수 있다」와 제품 문서의 범위), 이메일 대상. NO.62·255·416(경고 메일의 답 — 덤프가 맞는지), **NO.464**(비용 추적의 답이 예산인지, 비용 분석과 어떻게 가르는지) | Learn 단원 6, `docs-cost-management-create-budgets.md` |
| d | `cost-alerts` | 경고 종류와 표기(Learn 셋 + 제품 문서의 이상 징후 경고), 각각 누가 받는가, **크레딧 경고·부서 지출 할당량 경고가 기업 계약에 딸리는가**. NO.373(덤프 답 「비정상 지출 패턴」이 이상 징후 경고로 맞는지). 수치는 처리만 | Learn 단원 6, `docs-cost-management-alerts.md` |
| e | `tags` | 이름·값, 쓰임 여섯과 표기, 붙이는 방법, 제한(문서에 있으면 — 수치는 쓰지 않는다), 일부 리소스에는 못 붙일 수 있는가(`tag-support`), **비용 분석에서 태그로 나눠 볼 수 있는 근거**(`TagCostReportDiagram`의 핵심). NO.101·334 | Learn 단원 7, `docs-arm-tag-resources.md`, `tag-support` |
| f | `tag-inheritance` | 상속되지 않음(이미 `official.md`에 있음 — phase 102), Azure Policy로 요구·다시 붙이기(`tag-policies`), NO.54·93·309·335의 태그 진술. **「역할은 상속되고 태그는 아니다」를 왜인지까지 쓸 수 있는지** — 문서에 까닭이 없으면 까닭을 쓰지 않는다. 비용 데이터 쪽 태그 상속 설정(`docs-cost-management-understand-data.md` 등에 있으면)이 「상속되지 않는다」와 어떻게 어울리는지 — 있으면 한정할 말을 정한다 | Learn 단원 7, `docs-arm-tag-resources.md`, `tag-policies` |
| g | `free-account` | **현행 제공 내용과 표기**(Learn 단원 2의 free trial, `docs-cost-management-avoid-charges-free-account.md`, `azure-pricing-purchase-options-azure-account.md`, `azure.microsoft.com/en-us/pricing/free-services/`, `create-free-services`), 30일·12개월·항상 무료의 근거와 **확인한 날**, 자격(새 고객), 무료 양을 넘을 때, 크레딧이 끝날 때, 업그레이드. **NO.95·394·465**(서비스 일부, 만료, 계정 10개), **NO.286**(한도·업로드·웹앱 수), **NO.251·396**(평가판이 끝난 뒤 못 하는 일 — 그림까지, 지금 문서로 맞는지) | 위 문서들 |
| h | `spending-limit` | 정의와 표기, 어느 구독에 있는가, 닿으면 일어나는 일(VM·저장소·데이터베이스 — `docs-cost-management-spending-limit.md`), 언제 다시 켜지는가, 업그레이드와 제거, **예산과의 차이를 쓸 근거**. **NO.134**(「고정되어 바꿀 수 없다」 진술 — 지출 한도를 없앨 수 있다는 문서와, 평가판→종량제 변환), 소유권 이전은 처리만 | `docs-cost-management-spending-limit.md`, `upgrade-azure-subscription` |
| i | 도식·표 | `CostAnalysisDiagram`·`BudgetAlertDiagram`·`TagCostReportDiagram`·`TagInheritanceDiagram`·`FreeAccountOffersDiagram`·`SpendingLimitDiagram`과 `CostToolsTable`의 라벨·곁말·캡션·칸의 사실마다 근거가 있는지 | a~h의 결과 |

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·4)의 공통 형식」대로. Learn 단원 6·7을 새 항목으로 둔다. 끝에 「한국어 표기 정리 — `azure-cost-management`」 항목.

### 3. `docs/source/azure/corrections.md`에 더한다

step 0의 마지막 D·G 번호 다음부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.359** — Cost Management의 전제를 Enterprise Agreement로 답한 것.
- **NO.464** — 비용 추적의 답.
- **NO.251·396** — 평가판이 끝난 뒤의 일.
- **NO.134** — 지출 한도의 진술.
- **용어집 4쪽 비용 관리·태그** — 예산 초과 때의 동작, `키=값` 표기.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-cost-management`의 개념 8개마다 한 줄씩: **확정한 `name`, 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**. 목록 개념은 항목 이름도. 위 표의 a~i마다 결과와 근거 문서.
특히 (1) 예산이 하지 않는 일과 자동화의 범위, (2) 비용 경고의 확정 목록, (3) 비용 분석에서 태그로 나눠 보는 근거와 태그 상속의 한정, (4) 무료 계정의 확정 표현(30일·12개월·항상 무료, 확인한 날), (5) 지출 한도의 대상과 닿을 때의 일, (6) 도식 다섯과 표에 쓸 수 있는 사실. 받은 파일 목록. 마지막 D·G 번호. 끝에 **「메인 세션이 볼 것」**(앞 phase 문장과 어긋나는 곳)과 **「사용자 확인」** 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·4)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작 step 0이 끝났을 때의 수).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/106-azure-cost/index.json`의 step 4을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. `subscription-boundaries` 문장도 고치지 않는다.
- **확인하지 못한 사실을 두 문서에 적지 마라.**
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.**
