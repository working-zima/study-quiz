# Step 0: cost-factors-sources

## 배경

phase 106은 Azure AZ-900 과목에 주제 둘(15 비용 요인과 계산기, 16 비용 관리와 태그)을 더한다. 전체 계획과 결정은 `phases/106-azure-cost/guide.md`에 있다.
step 1~3이 주제 `azure-cost-factors`의 개념 7개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고, 덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다. 두 문서의 형식은 앞 phase가 만든 것을 그대로 따른다.

이 주제의 중심 문제는 셋이다.
(1) **「요금이 붙는가」를 어디까지 단정할 수 있는가** — 덤프는 「항상 무료」(NO.389), 「미사용 리소스 중 무엇을 지우나」(NO.42·183·278·345·382·459)처럼 단정해 묻는다. 공식 문서가 말하는 범위까지만 쓴다. 금액은 어차피 쓰지 않지만, 요금이 붙는지는 이 주제의 핵심 사실이므로 쪽마다 근거를 남긴다.
(2) **지원이 끝난 도구** — TCO 계산기(NO.299·341·482). guide 「배경」대로 D 항목으로 처리한다.
(3) **덤프 답 자체의 의심** — NO.298은 지역을 요인에서 뺀다.

## 읽어야 할 파일

- `phases/106-azure-cost/guide.md` — 특히 「배경」, 「두 주제와 개념 15개」의 `azure-cost-factors` 표, 「예시 값」, 「출처」, 「출처 step(0·4)의 공통 형식」
- `docs/source/azure/CLAUDE.md` — 원본 셋, 허용하는 출처, 가리키는 표기, 덤프의 그림을 보는 법. **이 규칙을 따른다**
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞 phase가 만든 형식을 따른다.** 비용을 말하는 기존 항목(`grep -n 'Learn 「Describe cost management' docs/source/azure/official.md`, 「(phase 100) … save-compute-costs」, VM 리소스의 요금 줄)과 「한국어 표기 정리」 항목들을 먼저 읽는다. D7·D8처럼 비용 문항을 앞 phase로 미룬 줄(`grep -n '비용 관리 주제' docs/source/azure/corrections.md`)도 찾아 이번에 처리한다
- `phases/105-azure-identity-security/verification.md`의 「설계와 달라진 것」 — 출처 step이 현행 문서로 바꾼 방식
- `docs/source/azure/topic-map.md`의 「`cost-management` 라벨의 배정」 — 이 step의 문항 목록
- 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다. 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/4-management-governance.md`의 가격 계산기·TCO 계산기 항목, `1-cloud-concepts.md`의 예약 인스턴스·스폿 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — guide.md 「출처」의 목록
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

공식 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 받아 `raw/official/`에 둔다(`CERTIFICATE_VERIFY_FAILED`면 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`).
이름은 `learn-<모듈>-<단원>.md`, `docs-<서비스>-<쪽>.md`, `azure-pricing-<쪽>.md`, 한국어판은 앞에 `ko-`를 붙인다. 영문판으로 사실을 확인하고, 한국어판은 **용어 표기만** 본다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `cost-factors` | 항목 여섯과 표기, 항목마다 무엇이 요금을 바꾸는가, **같은 크기의 VM 둘이 요금이 다를 수 있는 근거**(지역·실행 시간·라이선스 — `CostFactorsDiagram`의 세 시나리오). NO.298의 답(지역을 뺀다 — 단원 2가 지역을 요인으로 적는다. **그림·글자로 답을 본 뒤** D 항목으로), NO.92·94의 둘째 진술, NO.323(웹사이트를 옮길 때 드는 비용 — 덤프 답과 해설의 범위), NO.431 첫째 진술. NO.331의 Marketplace 진술 | Learn 단원 2 |
| b | `data-transfer-costs` | **대역폭**, 들어오는 전송·나가는 전송·지역 사이·같은 영역 안의 요금 여부, **청구 영역**의 표기와 가용성 영역과의 차이(ko 단원 2는 「청구 영역」), 저장·읽기·쓰기 작업 비용(NO.12·436). **NO.91·259·439**: VPN으로 들어오고 나가는 전송, 리소스 그룹. **NO.389**: ExpressRoute로 들어오는 전송, 나가는 전송, 같은 지역 안의 서비스 사이 — 「항상」을 공식 문서가 뒷받침하는지 끝까지 본다(`official.md`의 phase 102 「영역 사이 데이터 전송 요금」 줄과 어긋나지 않게). `DataTransferCostsDiagram`의 곁말 셋에 쓸 수 있는 말을 정한다 | Learn 단원 2, `azure-pricing-bandwidth.md`, VPN Gateway·ExpressRoute 가격 쪽 |
| c | `vm-stop-deallocate` | 상태표(`docs-virtual-machines-states-billing.md`)의 Stopped와 Deallocated, 각각의 인스턴스 요금, **디스크 요금이 남는 근거**, 운영 체제 안에서 종료하면 어느 상태인가, **포털의 중지 단추가 어느 상태로 가는가**(문서에 있으면), 표기(「중지됨」·「할당 취소」·「할당 해제」 가운데 — 한국어판 기준). NO.67·490(원격 연결 끊기·절전·포털 중지 — 그림까지), NO.372, NO.92·94 셋째 진술 | `azure/virtual-machines/states-billing`와 한국어판 |
| d | `unused-resources` | 단원 2 「Maintenance」(딸린 리소스가 함께 지워지지 않을 수 있다). **공용 IP 주소에 요금이 붙는 근거**(가격 쪽 — 받아 둔 쪽이 없으니 받는다. 쓰지 않는 공용 IP에도 붙는지), **네트워크 인터페이스**(앞 phase의 `official.md` 줄), **리소스 그룹 자체의 요금**(NO.91·259 첫째 진술 — 공식 문서에 근거가 있는지 찾고, 없으면 「근거를 못 찾음」으로 적고 그 진술을 쓰지 않는다), **Entra ID의 사용자·그룹**(NO.183·345 — Entra 쪽 가격이나 문서에 근거가 있는지). 무엇을 지우면 돈이 줄어드는가의 답을 이 근거의 범위로 쓴다 | Learn 단원 2, `azure.microsoft.com/en-us/pricing/details/ip-addresses/`, `docs-virtual-machines-states-billing.md` |
| e | `savings-plan` | 현행 이름과 표기(ko 문서가 「저축 플랜」·「Savings Plans」로 섞여 있다 — 개요·구매 쪽을 보고 하나로 정한다), 시간당 금액 약정, 1년·3년, 저절로 붙는 방식, 종류(컴퓨팅·데이터베이스 — Learn은 컴퓨팅만, 문서대로), 예약과의 차이. NO.34·492(약정 기간 — 덤프 답이 맞는지), NO.94 첫째, NO.431·476·489 둘째(예약이 특정 데이터 센터의 용량을 잡는가 — `azure-cloud-computing.reservations`가 이미 쓴 것과 맞는지) | `docs-savings-plan-overview.md`, `docs-reservations-save-compute-costs-reservations.md` |
| f | `hybrid-benefit` | 정의, 표기(「Azure 하이브리드 혜택」), 자격(Software Assurance·구독 라이선스), 대상(Windows Server·SQL Server, Linux는 문서대로), **무엇이 빠지고 무엇이 남는가**(기본 컴퓨팅 요금만 내는가 — `HybridBenefitDiagram`의 핵심), 예약과 함께 쓸 수 있는가. NO.171·409 | `docs-cost-management-hybrid-benefit-scope.md`, `docs-virtual-machines-hybrid-benefit-windows.md`, `azure/azure-sql/azure-hybrid-benefit` |
| g | `pricing-calculator` | 정의·표기, 넣는 것과 나오는 것, **아무것도 만들어지지 않고 요금이 붙지 않으며 견적은 추정값**, 로그인이 필요 없다(`docs-cost-management-overview.md`), 무료. **TCO 계산기**: Learn 단원 3의 지원 종료 문장을 확인하고 한국어 표기(「사용 중지」 등)를 본다. NO.299·341·482를 D 항목으로, NO.341의 옛 이름 「Server Assessment」도 그 항목에서 처리한다. 용어집 4쪽의 TCO 항목은 G | Learn 단원 3, `docs-cost-management-overview.md` |
| h | 도식·표 | `CostFactorsDiagram`·`DataTransferCostsDiagram`·`VmStopBillingDiagram`·`LeftoverResourcesDiagram`·`HybridBenefitDiagram`·`PricingCalculatorDiagram`과 `CostSavingOptionsTable`의 라벨·곁말·캡션·칸의 사실마다 근거가 있는지(각 step 문서의 설계를 읽는다) | a~g의 결과 |

NO.431·476·489 셋째 진술(Azure SQL Database 중지)은 guide 「배경」이 쓰지 않기로 했다 — 처리만 summary에 적는다. NO.331의 Enterprise Agreement 진술도 처리만.

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·4)의 공통 형식」대로. Learn 단원 2는 이미 「(phase 100)」 항목이 있으니 거기에 덧붙이고, 단원 3은 새 항목으로 둔다. 끝에 「한국어 표기 정리 — `azure-cost-factors`」 항목 — 개념 7개와 목록 항목 이름마다 고른 표기와 근거 문서, 섞여 쓰인 표기와 고른 까닭.

### 3. `docs/source/azure/corrections.md`에 더한다

D88·G56부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.298** — 지역을 비용 요인에서 뺀 답.
- **NO.299·341·482** — 지원이 끝난 TCO 계산기.
- **NO.389·91·259** — 전송 요금의 단정.
- **용어집 4쪽 TCO 계산기, 1쪽 스폿의 할인율·예약의 중도 해지** — 무엇을 주장하는지 보고 처리한다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-cost-factors`의 개념 7개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**. 목록 개념은 항목 이름도. 위 표의 a~h마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다.
특히 (1) 전송 방향마다 쓸 수 있는 말(「요금 없음」을 어디까지 단정하는가), (2) 포털 중지와 운영 체제 안 종료의 상태와 요금, (3) 무엇에 요금이 붙고 무엇에 안 붙는가와 근거를 못 찾은 것, (4) 저축 플랜의 확정 이름, (5) 하이브리드 혜택에서 빠지는 것과 남는 것, (6) 도식 여섯과 표에 쓸 수 있는 사실과 이름. 받은 파일 목록. 마지막 D·G 번호. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·4)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작 579개).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/106-azure-cost/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 「요금이 없다」는 특히 — 근거를 못 찾은 것은 「못 찾음」으로 남긴다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.** 이유: 허용 출처를 넓히는 것은 설계에서 정한다. 다른 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **`azure-cost-management`의 사실(Cost Management·예산·태그·무료 계정·지출 한도)을 이 step에서 정리하지 마라.** 이유: step 4의 범위다.
