# phase 106 공통 안내 — Azure AZ-900 과목의 비용 요인과 계산기, 비용 관리와 태그

이 phase의 **모든 step이 먼저 읽는 문서**다. step 문서는 자기 일의 세부만 적고, 과목 결정·두 주제의 개념 표와 글·문항·도식·파일 형식의 공통 규칙은 여기에 둔다.
step 문서와 이 문서가 다르면 step 문서를 따르고 그 차이를 summary에 적는다.

## 배경 — 다시 묻지 말 결정

Azure AZ-900 과목(`src/data/azure/`, ADR-060)은 phase 100에서 생겼고 phase 101~105가 주제 3~14를 더했다. 주제 지도(`docs/source/azure/topic-map.md`)의 주제 20개 가운데 1~14가 있고, **이 phase는 15·16을 더한다.**
둘 다 공식 학습 가이드의 묶음 「Describe cost management in Azure」를 채운다. 가이드의 줄은 넷이다 — 비용에 영향을 주는 요인, 가격 계산기, Cost Management의 기능, 태그의 목적.

**앞 phase가 남긴 것(이 phase의 출발점):**

- 주제 열넷 — `azure-cloud-computing`·`azure-cloud-models`·`azure-cloud-benefits`·`azure-sla-lifecycle`·`azure-service-types`·`azure-regions-zones`·`azure-resource-hierarchy`·`azure-compute`·`azure-virtual-networking`·`azure-network-protection`·`azure-storage`·`azure-data-movement`·`azure-identity`·`azure-security-model`, 개념 92개.
- 문항 `az001`~`az130`(130개) — 예/아니요 예 32·아니요 33, 4지선다 정답 위치(`answerIndex` 0~3) 17/16/16/16.
- 도식 49개, 표 10개.
- 출처 문서 `docs/source/azure/official.md`(항목 머리 `## (phase 100) …`~`## (phase 105) …`)와 `docs/source/azure/corrections.md`(D1~D87, G1~G55). **이 phase는 D88·G56부터 잇는다.**
- 검증 값(설계 때 잰 값): 테스트 270파일·6052개, 교차 검사 세로·가로 노드 1203·경로 825, `check-verbatim --subject azure` 원본 579개·단위 886개(설계 세션이 Learn 단원과 제품 문서를 받아 원본이 560에서 늘었다 — 아래 「출처」).
- 실행 보고 `phases/100-…`~`105-azure-identity-security/verification.md` — 출처 step이 정한 표기와 그 이유, 마무리에서 고친 문항·문장의 꼴이 있다. **`104`·`105`의 「메인 세션이 마무리에서 고친 것」을 읽는다** — 답을 흘리는 말, 소거로 풀리는 오답(ID 서비스를 묻는데 방화벽을 보기로 둔 것), 어색한 라벨 끼워 넣기를 고쳤다. 같은 것을 반복하지 않는다.

**앞 주제가 이미 쓴 것 — 겹치지 않게:**

- `azure-cloud-computing.reservations`·`spot-vm`·`pay-as-you-go`(phase 100)가 Azure 예약(1년·3년 약정, 할인은 쓰지 않으면 사라짐)과 스폿 가상 머신, 종량제를 가르치고, `az005`·`az006`·`az007`이 그것을 묻는다. 이 phase는 세 방식을 다시 가르치지 않는다 — `cost-factors`의 「사용량」 항목에서 한 줄씩 풀고, **저축 플랜과 하이브리드 혜택을 더해 표로 나란히 둔다.**
- `azure-compute.vm-resources`(phase 103)가 VM에 딸린 리소스와 「네트워크 인터페이스와 네트워크 보안 그룹에는 별도 요금이 없다」를 쓴다. `az057`은 공용 IP 없이 VM을 만들 수 있는지 묻는다. `unused-resources`는 **VM을 지운 뒤 무엇이 남아 요금이 붙는가**를 다룬다.
- `azure-resource-hierarchy.subscription-boundaries`(phase 102)가 구독을 청구 경계로 가르치고 `az052`가 청구서를 나누는 일을 묻는다. 태그는 **한 구독 안에서** 비용을 나눠 보는 쪽이다. 같은 개념이 「구독마다 지출 한도를 둘 수 있다」고 쓰는데, 제품 문서는 지출 한도가 크레딧이 있는 구독에만 있다고 한다 — step 4가 대조하고, 어긋나면 고치지 말고 summary에 적는다(메인 세션이 마무리에서 판단한다).
- `azure-resource-hierarchy.hierarchy`와 `azure-security-model.rbac-scope`가 **역할은 아래로 상속된다**고 가르친다. 그래서 `tag-inheritance`가 「태그는 상속되지 않는다」를 그 대비로 세운다.
- `azure-cloud-benefits.predictability`(phase 101)가 비용 예측 가능성과 가격 계산기를 한 줄 쓰고 `az021`이 그쪽을 묻는다. `pricing-calculator`는 **무엇을 넣고 무엇이 나오며 무엇이 만들어지지 않는가**를 다룬다.
- `azure-storage.access-tiers`(phase 104)가 계층별 저장·읽기 비용을 쓴다. 이 phase는 계층 비용을 다시 풀지 않는다.
- 다른 주제의 몫: **Azure Advisor의 비용 권장 사항은 `azure-monitoring`**(NO.206), Azure Policy와 리소스 잠금은 `azure-governance`, 포털·CLI는 `azure-management-tools`, Resource Manager 템플릿은 `azure-infrastructure-as-code` — 이 phase에서 개념으로 세우지 않는다. 필요한 낱말은 그 자리에서 한 줄로 푼다.

**사용자 결정(2026-10-30, 다시 묻지 마라):**

- **범위**: Microsoft Learn의 AZ-900 공식 학습 가이드(2026-07-20 기준)가 뼈대다. 가이드 밖이라도 **용어집에 있고 덤프도 묻는 현행 것**(이 phase에서는 무료 계정·지출 한도·하이브리드 혜택·중지와 할당 해제)은 넣는다.
  지원이 끝난 서비스·옛 이름은 빼거나 현행으로 고친다. 덤프만 묻는 것은 넣지 않는다.
- **도식**: **주제마다 최소 하나**, 그리고 구조·흐름이 있는 개념에는 개념마다. 정의형 개념에는 없다. 비교표는 도식을 대신하지 않는다.
- 주제 지도(20개, 순서·별점·phase)는 사용자가 「고칠 것 없음」으로 확인했다.
- 사실의 기준은 **Microsoft 공식 문서**다. 덤프와 용어집은 범위·강조의 기준이자 사실 **후보**이고, 공식 문서와 다르면 공식 문서를 따르고 수정 이력에 남긴다(ADR-060).
  덤프 문항·용어집 문장은 옮기지 않는다(ADR-009, ADR-021과 같은 방식). 덤프는 시험 주관 기관의 문항이 아니므로 「자격시험은 ~로 본다」 줄을 쓰지 않는다.
- 용어는 **Microsoft 한국어 문서의 표기**를 따른다. 주제 id는 `azure-` 접두사, 별점은 덤프 출제 빈도(대표 문항 25 이상 ★★★, 13~24 ★★☆, 12 이하 없음).
- **서비스마다의 SLA 수치는 쓰지 않는다**(phase 101 설계). 가격·지역 수도 쓰지 않는다.

**이 phase에서 정한 것(설계):**

- 개념 15개, 문항 22개(`az131`~`az152`), 도식 12개, 표 둘(`CostSavingOptionsTable`·`CostToolsTable`). 아래 「두 주제와 개념 15개」.
- **덤프 44문항을 28·16으로 나눴다** — 지도가 어림한 수와 같아 별점은 그대로다(`azure-cost-factors` ★★★, `azure-cost-management` ★★☆). 문항별 배정은 `topic-map.md` 「`cost-management` 라벨의 배정」에 있다.
- **TCO 계산기는 개념으로 세우지 않는다.** Learn 단원 3이 「지원이 끝났다(retired)」고 적고(설계 때 확인, 2026-11-02), `azure.microsoft.com/pricing/tco/` 주소는 이제 계산기가 아니라 다른 글로 넘어간다. 사용자 결정(지원이 끝난 것은 뺀다)을 따른다. 다른 자료에서 이 이름을 본 학습자가 헷갈리지 않게 `pricing-calculator` 본문에 한 줄만 쓴다 — 「예전에 있던 총소유비용(TCO) 계산기는 지원이 끝났다」. **문항으로 묻지 않고**, 온-프레미스와 견주는 절감액·전기료 같은 사실도 쓰지 않는다. 덤프 NO.299·341·482는 출처 step 0이 D 항목으로 남긴다.
- **금액과 할인율을 쓰지 않는다** — 비용 주제지만 앞 phase의 규칙 그대로다. 무료 계정의 크레딧 금액, 무료 제품 개수(문서마다 25개·65개로 다르다), 프로세서 수별 가격, 경고 임계값의 % 수치(Learn의 80%·90%·100%)도 쓰지 않는다.
  **요금이 붙는가 붙지 않는가는 쓴다** — 금액이 아니라 이 주제의 핵심 사실이고, 출처 step이 확인한 것만 쓴다.
- **기간은 공식 문서가 정한 값을 쓴다** — 예약·저축 플랜의 1년·3년, 무료 계정의 30일·12개월. 약관처럼 자주 바뀔 수 있으므로 무료 계정의 값은 `official.md`에 확인한 날과 함께 남긴다. 덤프가 묻는 「가장 긴 예약 기간」(NO.34·492)은 `az006`과 겹치지 않게 **`savings-plan`에서 두 방식의 공통점으로** 쓴다.
- **덤프 답을 믿지 않을 곳** — 설계 때 본 것: NO.298은 비용 요인에서 지역을 빼고 「처리한 데이터의 종류」를 답한다(Learn은 지역을 요인으로 적는다). NO.359는 Cost Management를 쓰려면 Enterprise Agreement가 필요하다고 답한다(제품 문서는 청구 계정·구독·리소스 그룹·관리 그룹에 접근할 수 있는 사람이면 쓸 수 있다고 한다). NO.389의 「항상 무료」 진술들. NO.464(비용 추적 = 예산). 출처 step이 처리한다.
- **Learn 단원과 제품 문서가 어긋날 수 있는 곳**: 무료 계정(Learn은 free trial이라 부르고 제품 페이지는 free account와 pay as you go를 나눈다), 비용 경고의 종류(Learn은 셋, 제품 문서에는 이상 징후 경고도 있다), 저축 플랜의 종류(Learn은 컴퓨팅만, 제품 문서는 데이터베이스도), VPN·ExpressRoute의 전송 요금. 다르면 현행 제품 문서를 따른다.
- **쓰지 않는 것**: 금액·할인율·제품 개수, TCO 계산기의 내용, Azure SQL Database의 중지 여부(NO.431·476·489 — 데이터 서비스는 과목 범위 밖, 출처 step이 처리만 남긴다), Enterprise Agreement의 계약 조건과 청구 구조(NO.331 — 비용 경고에서 「기업 계약」으로 한 줄만), 구독 소유권 이전(NO.134 — 처리만), Consumption API·REST API의 사용법, FinOps 용어, Azure Advisor의 권장 사항, 내보내기(export)·청구 계정 범위의 세부, Azure Marketplace의 인증 정책(`cost-factors`의 항목 한 줄까지).
- **도식은 구조·흐름이 있는 개념 12개에 하나씩**(아래 「도식」). 붙이지 않는 개념: `savings-plan`(정의형 — 다음 개념의 표가 나란히 둔다), `cost-management`(목록 개념 — 첫 도식은 `cost-analysis`), `cost-alerts`(목록 개념).
- **ADR은 필요 없다.** 쓸 출처가 모두 이미 허용된 `learn.microsoft.com`과 `azure.microsoft.com`(제품·가격 페이지) 안에 있다. 허용 목록 밖의 곳이 꼭 필요하면 쓰지 말고 출처 step의 summary 「사용자 확인」에 적는다.

**실행 규칙:**

- **step 하나는 30분 안에 끝나야 한다.** `scripts/execute.py`가 step을 1800초에서 끊는다. 그래서 step은 **브라우저 화면 실측(개발 서버·headless Chrome·CDP)을 하지 않는다** —
  phase가 끝난 뒤 메인 세션이 모든 도식을 한꺼번에 실측한다. 시간을 아끼려고 검증 명령을 건너뛰지는 마라.
- 「주제마다 도식 하나 이상」을 `src/components/diagrams/azureDiagramCoverage.test.ts`가 지킨다. 그래서 **주제를 처음 만드는 step(1·5)이 그 주제의 첫 도식도 함께** 만든다.
  저장소의 Stop 훅(`scripts/hooks/codex-verify-gate.sh`)은 테스트가 실패한 상태로 step을 끝내지 못하게 한다.
- **진행 안내 문장을 쓰지 않는다.** 「다음 개념에서 다룬다」, 「뒤에서 자세히 다룬다」처럼 글의 진행만 알리는 말은 `src/data/azure/data.test.ts`의 진행 안내 테스트가 막는다.
  뒤 개념이나 다른 주제가 자세히 다룰 낱말이 지금 필요하면 그 자리에서 한 줄로 풀고 넘어간다. 「앞 개념에서 본 것처럼」 같은 되짚기는 써도 된다.
- **이 Mac의 Python은 HTTPS 인증서를 찾지 못한다.** 공식 문서를 받을 때 `CERTIFICATE_VERIFY_FAILED`가 나면 명령 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`을 붙인다. 이것은 인터넷 연결 문제가 아니다 — blocked로 멈추지 마라.


## step 아홉 개

| step | 이름 | 하는 일 |
|---|---|---|
| 0 | `cost-factors-sources` | 주제 15가 쓸 사실을 공식 문서로 확인해 `official.md`·`corrections.md`에 더한다 |
| 1 | `factors-data-transfer` | 주제 15를 만들고 개념 1·2의 글·문항과 도식 `CostFactorsDiagram`·`DataTransferCostsDiagram` |
| 2 | `vm-stop-unused` | 개념 3·4의 글·문항과 도식 `VmStopBillingDiagram`·`LeftoverResourcesDiagram` |
| 3 | `savings-calculator` | 개념 5·6·7의 글·문항과 도식 `HybridBenefitDiagram`·`PricingCalculatorDiagram`, 표 `CostSavingOptionsTable` |
| 4 | `cost-management-sources` | 주제 16이 쓸 사실을 확인해 두 문서에 더한다 |
| 5 | `cost-management-analysis` | 주제 16을 만들고 개념 8·9의 글·문항과 도식 `CostAnalysisDiagram` |
| 6 | `budgets-alerts` | 개념 10·11의 글·문항과 도식 `BudgetAlertDiagram` |
| 7 | `tags` | 개념 12·13의 글·문항과 도식 `TagCostReportDiagram`·`TagInheritanceDiagram` |
| 8 | `free-account-limit` | 개념 14·15의 글·문항과 도식 `FreeAccountOffersDiagram`·`SpendingLimitDiagram`, 표 `CostToolsTable` |

## 두 주제와 개념 15개

주제 객체(`src/data/azure/topics.json`의 기존 열네 주제 뒤에 이 순서로):

```json
{ "id": "azure-cost-factors", "title": "비용 요인과 계산기", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }
{ "id": "azure-cost-management", "title": "비용 관리와 태그", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }
```

별점: 주제 지도의 대표 문항 수가 `azure-cost-factors` 28(★★★), `azure-cost-management` 16(★★☆)이다. `data.test.ts`가 이 값을 본다.

개념 id는 `<주제 id>.<슬러그>`다. 표의 순서·슬러그·`parentId`를 바꾸지 않는다(바꿔야 할 이유가 있으면 바꾸지 말고 summary에 적는다).
**`name`은 출처 step(0·4)이 확인한 Microsoft 한국어 문서의 표기를 따른다** — 표의 이름은 잠정이다. 한국어판 안에서도 표기가 섞인 것은 출처 step이 하나로 정하고 근거를 남긴다.
`parentId` 열의 값은 같은 주제의 슬러그다 — JSON에는 `azure-cost-factors.cost-factors`처럼 전체 id로 쓴다. 딸린 개념은 부모 바로 뒤에 이어 두고, 부모는 머리 개념이어야 한다(ADR-041 — 딸린 개념 아래에 또 딸리지 않는다).
「다룰 것」은 범위다. 문장은 직접 쓰고, 사실은 아래 「출처」대로 가져온다. 「step N 결과」라고 적힌 사실은 그 step의 summary와 출처 문서에 적힌 처리를 따른다 —
확인되지 않았으면 쓰지 않는다. 「덤프」 뒤의 `NO.`는 덤프 문항 번호다(`docs/source/azure/dump-topics.tsv`·`raw/dump/dump.md`).

### `azure-cost-factors` — 비용 요인과 계산기 (공식 학습 가이드 「Describe factors that can affect costs in Azure」·「Explore the pricing calculator」)

순서는 무엇이 요금을 정하는가(요인, 데이터 전송) → 어떻게 새는 돈을 막는가(중지와 할당 해제, 안 쓰는 리소스) → 어떻게 싸게 쓰는가(저축 플랜, 하이브리드 혜택) → 쓰기 전에 어림하기(가격 계산기).
학습자가 가장 많이 헷갈리는 것은 **「VM을 껐는데 왜 요금이 나오는가」**(운영 체제 안에서 끈 것과 할당 해제, 남는 디스크)와 **「무엇을 지워야 돈이 줄어드는가」**(공용 IP 주소와 네트워크 인터페이스), **어느 방향의 데이터 전송에 요금이 붙는가**다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 1 | `cost-factors` | Azure 비용에 영향을 주는 요인 | — | 1 | **목록 개념** — 이 주제의 첫 개념이라 **리소스**·**구독**을 짧게 푼다. 소개 문단(쓰는 만큼 내므로 요금은 여러 요인으로 달라진다) 뒤 항목 여섯: 리소스 유형(설정·크기·저장 옵션), 사용량(종량제·예약·저축 플랜·스폿을 한 줄로), 유지 관리(안 쓰는 리소스), 지역(전력·인건비·세금이 달라 가격이 다르다), 구독 유형(무료 사용량), Azure Marketplace(타사 제품 값이 더해진다). 같은 크기의 VM 두 대도 요금이 같다고 할 수 없다(NO.92·94 — step 0 결과대로). 표기는 step 0 결과대로. **이 개념에 도식 `CostFactorsDiagram`을 붙인다**. 덤프: NO.92, 94, 298, 323, 331, 431 |
| 2 | `data-transfer-costs` | 데이터 전송 비용 | `cost-factors` | 1 | **대역폭**(데이터 센터로 들고 나는 데이터)을 한 줄로 푼다. 들어오는 전송과 나가는 전송의 요금 차이, 지역 사이 전송, **청구 영역**(가격을 매기려고 지역을 묶은 것 — **가용성 영역과 다르다**, 왜 나눠 부르는지 4절대로). 같은 지역 안·같은 영역 안, VPN·ExpressRoute로 온-프레미스와 오갈 때는 step 0 결과대로. 저장 비용과 읽기·쓰기 작업 비용이 따로 있다는 것(NO.12·436). **이 개념에 도식 `DataTransferCostsDiagram`을 붙인다**. 덤프: NO.12, 91, 259, 331, 389, 436, 439 |
| 3 | `vm-stop-deallocate` | VM 중지와 할당 해제 | — | 2 | **할당**(VM을 실행할 하드웨어를 잡아 두는 것 — 한 줄로 푼다). 운영 체제 안에서 종료하면 하드웨어를 잡고 있어 컴퓨팅 요금이 계속되고, **할당을 해제**해야 멈춘다. 포털의 중지가 무엇을 하는가(step 0 결과대로). 할당 해제해도 **디스크 요금은 남는다**. 원격 연결을 끊거나 절전 모드로 두는 것은 요금과 상관없다(NO.67 — step 0 결과대로). **이 개념에 도식 `VmStopBillingDiagram`을 붙인다**. 덤프: NO.67, 92, 94, 372, 490 |
| 4 | `unused-resources` | 쓰지 않는 리소스와 비용 | — | 2 | VM을 지워도 디스크·공용 IP 주소 같은 딸린 리소스가 함께 지워지지 않을 수 있다(Learn 「Maintenance」). **요금이 붙는 것**(공용 IP 주소·디스크)과 **별도 요금이 없는 것**(네트워크 인터페이스, 리소스 그룹 자체, Entra ID의 사용자·그룹 — 각각 step 0 결과대로). 무엇을 지워야 돈이 줄어드는가. **이 개념에 도식 `LeftoverResourcesDiagram`을 붙인다**. 덤프: NO.42, 91, 183, 259, 278, 345, 382, 459 |
| 5 | `savings-plan` | Azure 저축 플랜 | — | 3 | 시간당 쓸 금액을 1년이나 3년 약정하면 조건에 맞는 컴퓨팅 사용량에 할인이 저절로 붙는다(이름과 종류는 step 0 결과대로). **예약과 무엇이 다른가** — 예약은 특정 리소스·크기·지역에 묶이고, 저축 플랜은 금액을 약정해 서비스와 지역이 바뀌어도 이어진다(4절대로). 약정 기간은 둘 다 1년이나 3년(NO.34·492). 예약을 한 줄로 다시 푼다 — 이 주제 화면만 읽고 뜻이 서야 한다. 덤프: NO.34, 94, 431, 492 |
| 6 | `hybrid-benefit` | Azure 하이브리드 혜택 | — | 3 | 이미 가진 Windows Server·SQL Server **라이선스**(소프트웨어를 쓸 권리 — 한 줄로 푼다)를 Azure에서 다시 쓰게 해 비용을 줄이는 혜택. 자격(Software Assurance나 해당 구독 라이선스 — **Software Assurance**를 한 줄로 푼다). 무엇이 빠지고 무엇은 남는가(step 0 결과대로). 예약과 왜 다른가 — 약정이 아니라 가진 권리를 쓰는 것. **이 개념에 도식 `HybridBenefitDiagram`과 표 `CostSavingOptionsTable`을 붙인다**. 덤프: NO.171, 409 |
| 7 | `pricing-calculator` | 가격 계산기 | — | 3 | 만들기 **전에** 요금을 어림하는 무료 온라인 도구. 넣는 것(리소스, 지역, 계층, 중복성)과 나오는 것(견적). **아무것도 만들어지지 않고 요금도 붙지 않으며 견적은 추정값**이다. 로그인 없이 쓴다(step 0 결과대로). 실제로 쓴 비용을 보는 곳(Cost Management)과 무엇이 다른가. TCO 계산기 한 줄(「배경」). **이 개념에 도식 `PricingCalculatorDiagram`을 붙인다**. 덤프: NO.299, 341, 482(지원 종료의 처리만) |

### `azure-cost-management` — 비용 관리와 태그 (공식 학습 가이드 「Describe the cost management capabilities in Azure」·「Describe the purpose of tags」, 가이드 밖 무료 계정·지출 한도)

순서는 쓴 비용을 본다(Cost Management, 비용 분석) → 넘지 않게 알린다(예산, 비용 경고) → 누가 쓴 것인지 나눈다(태그, 태그 상속) → 처음 쓸 때의 한도(무료 계정, 지출 한도).
학습자가 가장 많이 헷갈리는 것은 **예산과 지출 한도**(예산은 알려 줄 뿐 멈추지 않는다 / 지출 한도는 실제로 멈춘다), **태그와 구독·리소스 그룹**(태그는 자리를 바꾸지 않고 꼬리표만 붙인다), **태그와 역할의 상속**이다. 마지막 개념의 표 `CostToolsTable`이 네 도구를 나란히 둔다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 8 | `cost-management` | Microsoft Cost Management | — | 5 | **목록 개념** — 이 주제의 첫 개념이라 **리소스**·**구독**·**리소스 그룹**·**관리 그룹**을 짧게 푼다. 무엇을 하는 도구 묶음인가(실수로 만든 리소스를 청구서를 받고서야 아는 일을 막는다). 항목 셋: 비용 분석, 비용 경고, 예산. 누가 어디서 쓰는가 — 특별한 계약이 전제가 아니고(NO.359 — step 4 결과대로) 구독·리소스 그룹·관리 그룹마다 포털에서 연다(NO.209·316). 덤프: NO.209, 316, 359 |
| 9 | `cost-analysis` | 비용 분석 | `cost-management` | 5 | 쓴 비용을 여러 기준(청구 주기·지역·리소스·리소스 그룹·서비스)으로 나눠 보고, 시간에 따라 쌓이는 비용으로 추세를 본다. 예상 비용과의 관계. 회사 A의 예로 「지난달에 어디서 비용이 늘었나」를 따라간다. 가격 계산기와 무엇이 다른가(배포 전 어림 / 배포 뒤 실제 — 4절대로). **이 개념에 도식 `CostAnalysisDiagram`을 붙인다** |
| 10 | `budgets` | 예산 | — | 6 | 범위(구독·리소스 그룹·서비스 등)와 기간에 금액 기준을 정하고, 기준에 닿으면 알려 주는 기능. 실제 비용이나 예측 비용 기준(step 4 결과대로). **예산을 넘어도 리소스는 멈추지 않는다** — 멈추려면 자동화를 따로 설정한다(**작업 그룹**을 쓴다면 한 줄로 푼다). 덤프의 「이메일 경고는 어디서」(NO.62·255·416)의 답. NO.464의 처리. **이 개념에 도식 `BudgetAlertDiagram`을 붙인다**. 덤프: NO.62, 255, 416, 464 |
| 11 | `cost-alerts` | 비용 경고 | `budgets` | 6 | **목록 개념** — 경고가 모이는 한곳. 항목: 예산 경고, 크레딧 경고, 부서 지출 할당량 경고, 이상 징후 경고(step 4 결과대로, **크레딧**·**기업 계약**을 한 줄로 푼다). 각각 무엇이 언제 누구에게. 수치(%)는 쓰지 않는다. 덤프: NO.373 |
| 12 | `tags` | 태그 | — | 7 | **목록 개념** — 리소스에 붙이는 **이름과 값**(메타데이터). 구독·리소스 그룹으로 나누는 것과 무엇이 다른가(자리는 그대로이고 꼬리표로 묶는다 — 4절대로). 항목: 리소스 관리, 비용 관리, 운영 관리, 보안, 거버넌스, 자동화(같은 꼴로). 예시 태그(`Environment`·`Owner`·`CostCenter`) 둘셋을 코드 표기로. 부서·지점별 비용을 나눠 보는 일(NO.101·334)을 예로. **이 개념에 도식 `TagCostReportDiagram`을 붙인다**. 덤프: NO.101, 334 |
| 13 | `tag-inheritance` | 태그 상속 | `tags` | 7 | 리소스는 구독·리소스 그룹의 태그를 **물려받지 않는다** — 역할이 아래로 상속되는 것과 다르다(왜 다른지는 출처 범위에서). 그래서 층마다 다른 태그를 둘 수 있다. **Azure Policy**(규칙을 정해 지키게 하는 서비스 — 한 줄로 푼다)로 태그를 요구하거나 다시 붙인다. 모든 리소스에 같은 태그가 있어야 하는 것은 아니다. **이 개념에 도식 `TagInheritanceDiagram`을 붙인다**. 덤프: NO.54, 93, 309, 335의 태그 진술 |
| 14 | `free-account` | Azure 무료 계정 | — | 8 | 새 고객에게 주는 세 가지 — 처음 30일에 쓰는 **크레딧**(금액은 쓰지 않는다), 12개월 무료 서비스, 항상 무료 서비스(step 4 결과대로). 일부 서비스·계층만 무료이고, 무료 양을 넘으면 어떻게 되는가. 크레딧이 끝나거나 30일이 지나면 어떻게 되는가와 업그레이드. 종량제 계정과 무엇이 다른가(step 4 결과대로). **이 개념에 도식 `FreeAccountOffersDiagram`을 붙인다**. 덤프: NO.95, 251, 286, 394, 396, 465 |
| 15 | `spending-limit` | Azure 지출 한도 | `free-account` | 8 | 크레딧을 넘겨 쓰지 않게 막는 장치. 무료 계정과 크레딧이 있는 구독에는 기본으로 켜지고 종량제에는 없다. 닿으면 VM이 **중지되고 할당 해제**되며 저장소 데이터는 읽기 전용이 된다(step 4 결과대로). 업그레이드하면 없어지고 다시 켜진다. **예산과 무엇이 다른가**(4절대로). **이 개념에 도식 `SpendingLimitDiagram`과 표 `CostToolsTable`을 붙인다**. 덤프: NO.134, 286 |

**문항 수**: `azure-cost-factors` 12개, `azure-cost-management` 10개 — 모두 22개, `az131`~`az152`.
문항은 개념 순서대로 `questions.json` 끝에 붙인다. step마다 맡는 id와 형식은 아래와 같다 — 균형(「문항」 9항)을 step마다 지키도록 형식과 정답 방향을 미리 나눴다. **형식이나 답의 방향을 바꾸면 그 step 끝에서 균형이 깨지지 않는지 세어 보고 summary에 적는다.**

| step | id | 개념별 수 | 형식(예/아니요는 정답, 4지선다는 `answerIndex`) | step 끝의 예·아니요 / 정답 위치 |
|---|---|---|---|---|
| 1 | `az131`~`az134` | 1 둘, 2 둘 | 131 아니요 / 132 위치 0 / 133 예 / 134 위치 1 | 33·34 / 18·17·16·16 |
| 2 | `az135`~`az138` | 3 둘, 4 둘 | 135 위치 2 / 136 예 / 137 위치 3 / 138 아니요 | 34·35 / 18·17·17·17 |
| 3 | `az139`~`az142` | 5 하나, 6 하나, 7 둘 | 139 예 / 140 위치 1 / 141 아니요 / 142 위치 2 | 35·36 / 18·18·18·17 |
| 5 | `az143`~`az144` | 8 하나, 9 하나 | 143 예 / 144 위치 3 | 36·36 / 18·18·18·18 |
| 6 | `az145`~`az147` | 10 둘, 11 하나 | 145 아니요 / 146 예 / 147 위치 1 | 37·37 / 18·19·18·18 |
| 7 | `az148`~`az149` | 12 하나, 13 하나 | 148 위치 2 / 149 아니요 | 37·38 / 18·19·19·18 |
| 8 | `az150`~`az152` | 14 하나, 15 둘 | 150 위치 3 / 151 위치 0 / 152 예 | 38·38 / 19·19·19·19 |

이대로면 phase 끝에 예 38·아니요 38, 정답 위치 19/19/19/19다.

**예시 값 — 두 주제가 함께 쓴다:**

- **조직 이름**은 「회사 A」·「회사 B」처럼, 부서는 「영업부」·「연구부」처럼 이름표로 쓴다. 실제 회사 이름을 예로 들지 않는다.
- **리소스 이름표**는 「VM 1」·「리소스 그룹 1」·「구독 1」처럼, 지역은 「지역 A」·「지역 B」처럼 쓴다(실제 지역 이름을 비싼 곳·싼 곳의 예로 들지 않는다). 태그 예는 Learn이 드는 이름(`Environment`·`Owner`·`CostCenter`)이나 「부서=영업」처럼 쓴다.
- **금액이 필요한 예**는 숫자 없이 쓴다(「정해 둔 예산」, 「한 달 예산」). 예산 금액·요금을 지어내지 않는다.
- **공식 문서가 정한 값**은 출처 step이 확인한 것만 쓴다(1년·3년, 30일·12개월). 가격·할인율·임계값 %는 쓰지 않는다(「배경」).
- **서비스 이름**은 Microsoft 한국어 문서 표기로 쓰고, 영문 이름이 다르면 처음 나올 때 괄호에 적는다(출처 step이 표기를 확인한다).

도식은 본문에 나온 예시 값만 쓴다(ADR-038) — 그러니 이 값들을 도식에 쓰려면 그 개념의 본문에 먼저 쓴다.

## 출처

- 사실은 `docs/source/azure/official.md`(Microsoft 공식 문서에서 확인한 사실과 URL)에서만 가져온다. 출처 step(0·4)이 그 주제에 필요한 사실을 확인해 남긴다. 그 summary가 개념마다 무엇을 쓰고 무엇을 쓰지 않는지 적는다.
- 덤프·용어집의 주장이 `docs/source/azure/corrections.md`에 걸려 있으면 **고친 쪽**을 쓴다. 덤프·용어집에만 있고 공식 문서가 말하지 않는 주장은 쓰지 않는다.
- 개념 step에서 그 밖의 사실이 필요하면, 허용한 출처(`docs/source/azure/CLAUDE.md` 「허용하는 출처」)를 실제로 열어 확인하고 `official.md`에 URL과 「쓰인 곳」을 적은 뒤 쓴다.
  받은 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다. 인증서 오류는 「배경」의 `SSL_CERT_FILE`).
  확인하지 못한 사실은 쓰지 않는다. 블로그·Microsoft Q&A·Tech Community·위키백과·자격증 교재·덤프 사이트는 쓰지 않는다.
- **`official.md`의 「쓰인 곳」**: 출처 step은 아직 개념이 없으므로 「쓰일 곳」으로 적는다. 그 개념을 만든 step이 자기 개념 id가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.
- **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 덤프의 문제문·보기·해설, 용어집 설명, 공식 문서(특히 한국어판)의 문장을 옮기지 않는다. `check-verbatim --subject azure`는 하한선일 뿐이다.
- 덤프 문항을 그대로 문항으로 만들지 않는다 — 덤프가 같은 사실을 물어도 상황과 문장은 직접 만든다(ADR-021과 같은 이유).

설계 세션이 받아 둔 공식 문서(`docs/source/azure/raw/official/`, 영문판과 한국어판 `ko-…`):

- Learn 「Describe cost management in Azure」 — `learn-describe-cost-management-azure-{2-describe-factors-affect-costs-azure, 3-compare-pricing-total-cost-of-ownership-calculators, 6-describe-azure-tool, 7-describe-purpose-of-tags}.md`와 `ko-` 판. 이 모듈의 단원 4·5는 없다.
- 제품 문서: `docs-cost-management-overview.md`, `docs-cost-management-understand-data.md`, `docs-cost-management-alerts.md`, `docs-cost-management-create-budgets.md`, `docs-cost-management-spending-limit.md`(`ko-`도), `docs-cost-management-avoid-charges-free-account.md`, `docs-cost-management-hybrid-benefit-scope.md`(`ko-`도), `docs-virtual-machines-hybrid-benefit-windows.md`, `docs-savings-plan-overview.md`(`ko-`도).
- 앞 phase가 받음: `docs-virtual-machines-states-billing.md`, `docs-reservations-save-compute-costs-reservations.md`(`ko-`도), `docs-virtual-machines-prepay-reserved-vm-instances.md`, `docs-cost-management-understand-vm-reservation-charges.md`, `docs-arm-tag-resources.md`(`ko-`도).
- 가격 쪽: `azure-pricing-bandwidth.md`, `azure-pricing-purchase-options-azure-account.md`. 계산기 쪽(`azure.microsoft.com/pricing/calculator/`)은 스크립트로 글자를 그려 받아지지 않는다 — 계산기의 사실은 Learn 단원 3과 `docs-cost-management-overview.md`에서 가져온다.
- AZ-900 학습 가이드 — `az-900-study-guide.md`.

설계 때 열어 보고(모두 200) 받지 않은 것(출처 step이 받는다 — 주소는 출발점이고, 옮겨졌으면 같은 내용의 현행 쪽을 찾는다). 앞에 `learn.microsoft.com/en-us/`를 붙인다:
주제 15 — `azure/virtual-network/ip-services/public-ip-addresses`(요금이 붙는지는 `azure.microsoft.com/en-us/pricing/details/ip-addresses/`), `azure/azure-sql/azure-hybrid-benefit`.
주제 16 — `azure/cost-management-billing/costs/quick-acm-cost-analysis`, `azure/cost-management-billing/costs/cost-mgt-best-practices`, `azure/cost-management-billing/manage/create-free-services`, `azure/cost-management-billing/manage/upgrade-azure-subscription`, `azure/azure-resource-manager/management/tag-support`, `azure/azure-resource-manager/management/tag-policies`.
또 `azure.microsoft.com/en-us/pricing/free-services/`.

## 글 — `docs/WRITING_GUIDE.md`를 따른다(ADR-056, ADR-060)

- `summary`는 WRITING_GUIDE 2절 — 처음 보는 사람이 일상 말로 「무엇이고 무슨 역할인지」 알게 하는 한 문장. 다른 전문용어를 알아야 이해되면 안 되고, 제목 낱말을 되풀이하는 순환 정의, 숫자·분류를 넣지 않는다.
- `paragraphs`는 3절의 흐름(개념 → 원리 → 예시 → 특징)을 필요한 만큼. 누가·무엇을·어디서 어디로를 빠뜨리지 않는다. 같은 말을 되풀이하지 않는다.
  헷갈리는 짝은 4절대로 무엇이 다르고 왜 나눠 부르는지를 말한다 — 이 phase의 짝: 청구 영역과 가용성 영역, 들어오는 전송과 나가는 전송, 운영 체제 안에서 종료와 할당 해제, 공용 IP 주소와 네트워크 인터페이스, 예약과 저축 플랜, 예약과 하이브리드 혜택, 가격 계산기와 비용 분석,
  예산과 비용 경고, 예산과 지출 한도, 태그와 리소스 그룹, 태그 상속과 역할 상속, 무료 계정과 종량제.
- **이 주제 화면만 읽고 뜻이 서야 한다.** 학습자는 주제 목록에서 아무 주제로나 바로 들어오므로, 다른 주제에 정의가 있다는 것은 도움이 되지 않는다.
  이 주제 안에서 처음 쓰는 낱말(리소스, 구독, 리소스 그룹, 관리 그룹, VM, 디스크, 공용 IP 주소, 온-프레미스, 약정, 종량제, 청구 주기, 크레딧 등)은 그 자리에서 짧게 푼다. 앞 phase 주제가 푼 낱말도 이 주제에서는 다시 푼다.
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
   「VM 비용을 줄이고 싶다」는 할당 해제에도 예약에도 하이브리드 혜택에도 맞다 — 안 쓰는 VM인가, 꾸준히 쓰는 VM인가, 가진 라이선스가 있는가를 문제문에 준다.
   「꾸준히 쓰는 컴퓨팅을 싸게 쓰고 싶다」는 예약에도 저축 플랜에도 맞다 — 크기·지역이 정해져 있는가, 서비스와 지역이 바뀌는가를 준다.
   「비용을 넘기지 않게 하고 싶다」는 예산에도 지출 한도에도 맞다 — 알림을 받고 싶은가, 실제로 멈춰야 하는가, 어떤 구독인가를 준다.
   「부서별 비용을 알고 싶다」는 태그에도 구독 분리에도 리소스 그룹에도 맞다 — 한 구독 안에서 자리를 바꾸지 않고 나눠 보는 일인지를 분명히 준다.
   「비용을 보고 싶다」는 가격 계산기에도 비용 분석에도 맞다 — 만들기 전인가 쓴 뒤인가를 준다.
5. 판단에 쓰이지 않는 정보(전문용어·수치·조건·부정문)를 늘어놓지 않는다. 판단에 필요한 조건은 남긴다.
6. **형식(ADR-054)**: 흔히 오해하는 것을 바로잡으면 예/아니요, 비슷한 개념을 구별하거나 상황에 맞는 것을 고르면 4지선다. 같은 범주의 그럴듯한 오답 셋을 출처 안에서 쓸 수 없으면 예/아니요.
   예/아니요는 주장 하나, 이중 부정·「항상」「절대」 금지, 「~인가요?」「~나요?」로 끝난다. **아니요 문항의 해설은 무엇이 틀렸는지에서 그치지 않고 맞는 사실을 가르친다.**
   예/아니요의 주장은 맞는 쪽으로도 틀린 쪽으로도 세울 수 있다 — 아래 균형을 맞추려고 주장의 방향을 고른다.
7. **문항은 풀면서 배우게 쓴다.** 문항은 섞여 나오고 랜덤 세트는 일부만 뽑으므로 혼자 읽혀야 한다. 문제문이 이 주제 밖의 낱말을 풀이 없이 전제하지 않는다(기준 5).
   상황에 쓰는 이름(「회사 A」)·숫자는 사실 주장이 아니어야 하고, 그 상황의 정답은 출처의 사실로 정해져야 한다. 문항 상황은 본문 예와 다르게 만들어 본문 문장을 외워서 풀리지 않게 한다.
8. **해설은 187자 이상**이고 그 개념을 가르치는 글이다(ADR-026·027). 4지선다는 정답이 왜 맞는지와 오답 셋이 각각 왜 아닌지를 담는다. 약어는 해설마다 처음 쓸 때 풀어 쓴다.
   같은 말을 늘려 길이를 채우지 않는다. 해설의 사실은 개념 본문이나 `official.md`에 있는 것이다.
9. **균형 — step이 끝났을 때 과목 전체에서**: 예/아니요의 예와 아니요 수 차이 **1 이하**, 4지선다의 정답 위치(`answerIndex` 0~3) 수의 최대·최소 차이 **2 이하**.
   phase 106 시작 때는 문항 130개, 예 32·아니요 33, 정답 위치 17/16/16/16이다. step마다의 형식은 「두 주제와 개념 15개」의 표대로다.
10. 한 문항은 개념 하나만 묻는다(ADR-030 기준 2). 같은 개념의 두 문항은 서로 다른 것을 묻는다. 앞 phase의 문항(특히 `az005`·`az006`·`az007` 종량제·예약·스폿, `az021` 비용 예측 가능성, `az052` 구독과 청구서, `az054` 역할의 상속, `az057` 공용 IP 주소 없이 VM 만들기)과 같은 것을 묻지 않는다.
11. 답을 흘리는 꼴을 피한다 — 비용 문항에서는 특히 「…인데도 요금이 나오나요?」처럼 놀람을 담아 답의 방향을 알리는 꼴, 문제문의 「…만으로」, 「…뒤에도」처럼 답의 방향을 암시하는 말, 정답 보기만 문제문의 낱말을 되풀이하는 것, **오답 셋만 같은 말로 시작해 정답만 꼴이 다른 것**(phase 103 `az056`·`az060`·`az068`·`az070`·`az077`·`az080`).
12. 덤프 문항의 문장·보기 구성을 옮기지 않는다. 덤프가 되풀이하는 꼴(「다음 진술이 맞으면 예」 세 개 묶음, 「해결책: …, 목표를 이루나?」 연작, 밑줄 친 말 고치기, 짝짓기)도 쓰지 않는다 — 앱의 형식은 4지선다와 예/아니요 하나씩이다.

검수 — 문항마다 WRITING_GUIDE 객관식 7항의 여섯 질문으로 다시 읽고, 보기마다 「이것이 정답이라고 우길 수 있는가」를 따진다. 문제문만 읽고 보기를 보지 않은 채 정답 글자를 짐작할 수 있지 않은지도 본다.

## 도식 — 구조·흐름이 있는 개념 12개에 하나씩, 표 둘

선례는 앞 phase의 Azure 도식(`RbacScopeDiagram`·`ConditionalAccessDiagram`·`SentinelFlowDiagram`·`GeoRedundancyDiagram`·`AzureMigrateDiagram`과 그 `.test.tsx`, `src/data/azure/visuals/*.json`)이다. 표는 `azureSecurityModelTables.tsx`와 그 테스트를 본다.
규칙의 근거는 UI_GUIDE 「도식 전용 색상」·「도식」 절 전체, ADR-036·037·038·047·048, `src/components/diagrams/CLAUDE.md`다.
사용자 미리보기 승인을 받지 않고 **step이 좌표를 설계한다.** 그래서 기계 검사를 모두 통과시키고 설계를 summary에 남긴다.

| 도식 | JSON 키 | 개념 | step | 요지 |
|---|---|---|---|---|
| `CostFactorsDiagram` | `cost-factors` | `azure-cost-factors.cost-factors` | 1 | 같은 크기의 VM 둘의 요금이 갈리는 까닭 — 지역, 실행 시간, 라이선스 |
| `DataTransferCostsDiagram` | `data-transfer-costs` | `azure-cost-factors.data-transfer-costs` | 1 | 들어올 때, 나갈 때, 지역 사이 — 어느 방향에 요금이 붙는가 |
| `VmStopBillingDiagram` | `vm-stop-billing` | `azure-cost-factors.vm-stop-deallocate` | 2 | 실행 중, 운영 체제 안에서 종료, 할당 해제 — 컴퓨팅과 디스크 요금 |
| `LeftoverResourcesDiagram` | `leftover-resources` | `azure-cost-factors.unused-resources` | 2 | VM을 지운 뒤 남는 리소스와 그 가운데 요금이 붙는 것 |
| `HybridBenefitDiagram` | `hybrid-benefit` | `azure-cost-factors.hybrid-benefit` | 3 | 혜택 없이 / 가진 라이선스로 — 무엇이 빠지고 무엇이 남는가 |
| `PricingCalculatorDiagram` | `pricing-calculator` | `azure-cost-factors.pricing-calculator` | 3 | 계산기로 어림할 때와 배포한 뒤 |
| `CostAnalysisDiagram` | `cost-analysis` | `azure-cost-management.cost-analysis` | 5 | 같은 비용을 리소스 그룹별·서비스별·지역별로 나눠 보기 |
| `BudgetAlertDiagram` | `budget-alert` | `azure-cost-management.budgets` | 6 | 기준에 닿으면 경고 — 리소스는 그대로, 자동화를 더하면 |
| `TagCostReportDiagram` | `tag-cost-report` | `azure-cost-management.tags` | 7 | 한 구독의 리소스를 태그로 부서별로 묶어 보기 |
| `TagInheritanceDiagram` | `tag-inheritance` | `azure-cost-management.tag-inheritance` | 7 | 리소스 그룹의 태그가 내려오지 않는다 / Azure Policy를 걸면 |
| `FreeAccountOffersDiagram` | `free-account-offers` | `azure-cost-management.free-account` | 8 | 크레딧·12개월 무료·항상 무료가 각각 언제 끝나는가 |
| `SpendingLimitDiagram` | `spending-limit` | `azure-cost-management.spending-limit` | 8 | 크레딧을 다 쓰면 무엇이 멈추는가와 업그레이드 |

표 — 파일 `src/components/diagrams/azureCostFactorsTables.tsx`(하나)·`azureCostManagementTables.tsx`(하나):

| 표 | JSON `tables` 키 | 개념 | step | 열 |
|---|---|---|---|---|
| `CostSavingOptionsTable` | `cost-saving-options` | `azure-cost-factors.hybrid-benefit` | 3 | 방식 · 내놓는 것 · 맞는 작업 |
| `CostToolsTable` | `cost-tools` | `azure-cost-management.spending-limit` | 8 | 도구 · 하는 일 · 리소스에 미치는 영향 |

- **파일**: 컴포넌트는 `src/components/diagrams/<이름>Diagram.tsx`(이름이 `Diagram.tsx`로 끝나야 교차 검사와 커버리지 테스트가 도식으로 본다), 테스트는 같은 이름의 `.test.tsx`.
  문구(물음형 제목 `question`·노드 라벨·그룹 라벨·곁말·캡션·`idleCaption`·`legend`·figure `label`·`svgLabel`·시나리오·`sources`)는 그 주제의 `src/data/azure/visuals/<주제 id>.json`의 `diagrams["<키>"]`에 둔다.
  `glossary`는 빈 배열이다(ADR-037). 도식 이름과 키는 위 표대로다 — 이미 있는 이름과 겹치지 않는 것을 골라 두었다.
- **표**: 위 「표」 표의 파일에 함수를 둔다(주제마다 파일 하나), 테스트는 같은 이름의 `.test.tsx`. `azureSecurityModelTables.tsx`처럼 `ComparisonTableFigure`에 JSON의 `tables["<키>"]`를 넘긴다.
  열은 셋 이하(첫 열이 행 머리), `columnWidths`는 열 수만큼의 백분율이고 합이 100%다(`visuals.test.ts`).
  열 폭은 스크롤 막대가 낀 320px(표 폭 약 273px)에서 가장 긴 덩어리(띄어쓰기 없이 이어진 글자)가 들어가게 어림해 정하고, 그 계산을 summary에 적는다(실측은 phase 끝에 한다).
- **사실은 본문에만 있는 것**(ADR-036). 캡션·곁말·라벨·표 칸의 사실마다 그 개념(과 같은 주제의 다른 개념) 본문의 문단을 근거로 댈 수 있어야 한다. 예시 값도 본문에 나오는 것만(ADR-038).
  「회사 A」·「지역 A」·「VM 1」처럼 대상을 가르는 이름표는 사실이 아니므로 써도 된다. 글과 도식을 같은 step이 만드므로, 도식에 필요한 사실은 **글에 먼저 쓴다** — 출처에 없으면 그리지 않는다.
- **말**: 노드 라벨·곁말은 본문에 쓰인 말과 같게 쓴다. 라벨을 줄이거나 영문 약어로 바꿔 폭을 맞추지 마라 — 노드를 넓히거나 배치를 바꾼다. (본문이 「네트워크 보안 그룹(NSG)」처럼 약어를 함께 세웠으면 라벨에 그 약어를 써도 된다.)
- **글자 크기**: 노드 라벨 10, 그룹 라벨·곁말 9(viewBox 단위). `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`. 노드 높이는 32다(교차 검사기가 32로 본다 — 키 큰 노드를 만들지 말고 그룹 박스를 쓴다).
- **글자 폭의 여유**: `estimateTextWidth`는 반각 문자(영문·숫자·기호)를 0.55em으로 보지만 실제 화면에서는 0.61em까지 넓다(phase 72 화면 실측).
  반각 문자가 섞인 노드 라벨·곁말·그룹 라벨(예: `VM 1`, `Cost Management`, `Azure Policy`)은 `estimateTextWidth` 값의 **1.15배**를 폭으로 잡아 노드 폭·배치를 정하고, 그 범위가 둘레 박스와 `viewBox` 안에 들게 한다.
- **그룹 박스 안의 그룹 박스**(구독 안의 리소스 그룹 등): 안쪽 박스의 라벨 영역이 바깥 박스의 라벨 영역과 겹치지 않게 위아래로 떼고, 노드는 자기를 담는 가장 안쪽 박스의 라벨 영역 아래에 둔다.
  세로형(폭 280)에서 나란히 두기 어려우면 위아래로 쌓는다 — 폭을 맞추려고 라벨을 줄이지 않는다.
- **색**: 노드는 모두 회색(`stroke-disabled`, 선례와 같은 클래스). 도식 전용 두 색(`diagram-managed`·`diagram-resource`)은 AWS 계층의 뜻이라 쓰지 않는다. 초록·빨강·주황, 16진 색, 이모지, O/X도 쓰지 않는다(ADR-036).
  강조는 opacity로만 한다 — 선택 밖 노드 `0.25`, 그룹 박스는 흐려지지 않는다. 나쁜 상태(계속 나가는 요금, 멈춘 VM, 내려오지 않는 태그)는 색이 아니라 곁말과 흐림으로 보인다(UI_GUIDE 「수량과 상태를 바꾸는 도식」).
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
  키는 기존 Azure 키들(`azure-security-model.sentinel`) 뒤에 개념 순서대로.
- **주제의 시각 요소 파일**: 주제를 만드는 step(1·5)이 `src/data/azure/visuals/<주제 id>.json`(`{ "diagrams": {}, "tables": {}, "glossary": [] }` 꼴)을 만들고
  `src/data/azure/index.ts`의 `visualsByTopicId`에 `'<주제 id>'`로 넣는다. import 이름은 `azureCostFactorsVisuals`·`azureCostManagementVisuals`,
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

표 테스트(`azureCostFactorsTables.test.tsx`·`azureCostManagementTables.test.tsx`)는 선례 `azureSecurityModelTables.test.tsx`와 같은 것을 본다 — 로더·`glossary`, 이름·열·`columnWidths`·근거(`sources`), 행 순서와 칸 문구, `colgroup`, `ConceptList` 배치.

## 파일 형식

- `topics.json`: 주제 객체는 2칸 들여쓰기, `concepts` 배열의 개념은 **한 줄에 하나**(6칸 들여쓰기 + `JSON.stringify(concept)`). 개념 키 순서는 `id`, `parentId`(있을 때), `name`, `summary`, `paragraphs`.
  주제 키 순서는 `id`, `title`, `importance`, `sourcePages`, `concepts`. 앞 step이 쓴 줄과 다른 주제의 줄은 글자 하나도 바꾸지 않고, 자기 개념을 그 주제의 `concepts` 끝에 덧붙인다.
  주제를 만드는 step은 바로 앞 주제 객체의 닫는 줄 `  }`을 `  },`로 바꾸고 그 뒤에 새 주제를 덧붙인다 — 그 밖의 기존 줄은 바꾸지 않는다.
- `questions.json`: `[` 다음 줄부터 **한 줄에 문항 하나**, 마지막 줄 뒤에 `]`. 키 순서 — 4지선다 `id`, `topicId`, `conceptId`, `format`, `prompt`, `choices`, `answerIndex`, `explanation` /
  예/아니요 `id`, `topicId`, `conceptId`, `format`, `prompt`, `answer`, `explanation`. 기존 줄은 바꾸지 않고 끝에 덧붙인다(마지막 기존 줄 끝에 쉼표 하나를 더하는 것은 예외).
- 파일 끝 줄바꿈 하나. 스크립트로 쓸 때 CRLF로 바꾸지 않는다.
- 이 저장소의 TDD 훅은 테스트 파일 없이 새 `.js`·`.ts` 파일을 쓰지 못하게 막는다. 데이터를 고치는 일회용 스크립트가 필요하면 저장소 밖(임시 디렉터리)에 `.cjs`로 두거나 `node -e`를 쓴다.

## 개념을 넣는 step(1~3·5~8)의 공통 AC와 검증

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject azure
node -e "const q=require('./src/data/azure/questions.json');const yn=q.filter(x=>x.format==='yes-no');const ch=q.filter(x=>x.format==='choice');const pos=[0,1,2,3].map(i=>ch.filter(x=>x.answerIndex===i).length);console.log('문항',q.length,'마지막',q[q.length-1].id,'정답 위치',pos.join('/'),'예',yn.filter(x=>x.answer).length,'아니요',yn.filter(x=>!x.answer).length)"
git status --porcelain
```

- `check-verbatim`은 「전사 이상 없음」이고 **원본 579개 이상을 대조했다고 나와야 한다**(`raw/`가 없으면 「건너뜀」으로 통과하므로 그때는 blocked로 멈춘다). 균형은 위 「문항」 9항,
  교차 검사기는 「교차 없음」이고 노드·경로 수가 이 step이 더한 만큼 늘어야 한다(앞 step이 끝났을 때의 수는 그 step summary에, phase 시작 값은 「배경」에 있다). **검사기를 고쳐서 통과시키지 마라.**
- **바뀌지 않아야 하는 것을 기계로 확인한다** — `git show HEAD:src/data/azure/topics.json`·`questions.json`과 `visuals/*.json`을 지금 파일과 node로 읽어, 기존 주제 객체·기존 개념·기존 문항·기존 도식 문구가 통째로 같은지 본다.
  AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `git diff --stat`에 나오지 않아야 한다.
- **글로 읽는다** — 그 주제의 개념을 처음부터 이 step의 개념까지 처음 배우는 사람의 눈으로 통독하고, 풀이 없이 처음 나오는 낱말을 세어 본다(도식 문구 포함). 진행 안내 문장이 없는지도 본다.
  불변식과 테스트는 이런 결함을 잡지 못한다. 브라우저 화면 실측은 하지 않는다(「배경」의 시간 제한 — phase 끝에 메인 세션이 한다).
- 이모지·O/X·빨강·초록·주황·도식 전용 두 색·16진 색·애니메이션·기준 폭 문자열이 새 파일에 없는지 `grep`으로 본다.
- 바뀐 파일은 `src/data/azure/topics.json`·`questions.json`·`visuals/<주제>.json`(과 주제를 만드는 step은 `src/data/azure/index.ts`), 새 도식 컴포넌트와 테스트(step 3·8은 표 컴포넌트와 테스트),
  `src/components/diagrams/registry.ts`, `docs/source/azure/official.md`(「쓰인 곳」과 더한 사실), phase 메타데이터뿐이어야 한다.

**summary에 적을 것**(사용자가 이것을 읽고 판단한다): 개념마다 id·name과 **새 요약문 전문**, 문항마다 id·개념·형식·고른 방식·**문제문 전문**·정답, 균형 줄(예/아니요·정답 위치),
도식마다 이름·두 배치의 `viewBox`·시나리오별 선명한 노드·경로·곁말과 캡션 요지·물음형 제목·요점 테스트, 설계 의도와 달라진 점과 이유,
`official.md`에 더한 사실, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수, 걸린 시간의 어림. 끝에 「사용자 확인」 칸(없으면 「없음」).

## 출처 step(0·4)의 공통 형식

- `official.md` 항목: `## (phase 106) <문서 제목> — <단원·절 제목>`, URL 한 줄, 확인한 날, 직접 쓴 사실 한 줄씩(끝에 `— 「절 제목」`), **한국어 표기** 줄, 「쓰일 곳」(개념 id와 D·G 번호).
  앞 phase가 이미 둔 항목(예: 「(phase 100) …」)은 새 항목을 만들지 말고 그 항목에 사실 줄과 「쓰일 곳」을 덧붙인다 — 덧붙인 줄 끝에 `(phase 106)`.
  주제마다 「한국어 표기 정리 — `<주제 id>`」 항목을 하나 둔다(앞 phase의 항목이 본보기 — 개념마다 확정한 `name`과 근거 문서, 섞여 쓰인 표기와 고른 까닭).
- `corrections.md` 항목: `## D88 — <짧은 제목> (phase 106)`부터 덤프, `## G56 — … (phase 106)`부터 용어집. 짜임은 앞 phase 항목과 같다 — **덤프/용어집**(문항 번호·쪽-번호와 주장) · **공식 문서** · **처리**(고쳐 쓴다 / 한정해 쓴다 / 쓰지 않는다) · **쓰인 곳**.
  덤프 답이 공식 문서와 **맞는** 문항은 항목을 만들지 않는다 — summary에 「확인 결과 덤프가 맞다」로 적는다. 덤프끼리 답이 갈리는 문항은 항목으로 남긴다.
  D·G 번호는 앞 출처 step이 쓴 마지막 번호 다음부터 잇는다(step 4는 step 0의 마지막 번호 다음).
- 그림으로만 표시된 덤프 정답은 OCR 글자나 `index.json`의 `answer`를 믿지 말고 `raw/dump/img/`의 그림을 직접 본다(`docs/source/azure/CLAUDE.md` 「덤프의 그림을 보는 법」).
- **시간을 나눠 쓴다** — `azure-cost-factors`는 덤프 문항이 약 30개, `azure-cost-management`는 약 20개다. 하나하나 끝까지 읽으면 30분을 넘길 수 있다(넘기면 step이 처음부터 다시 돈다).
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
- **금액, 할인율, 무료 제품 개수, 경고 임계값의 %, 서비스마다의 SLA 수치, 지역 수·데이터 센터 수, 대역폭 수치를 본문·문항·도식에 쓰지 마라.** 이유: 계속 바뀌는 수이거나 확인할 수 없는 값이다(「배경」). 요금이 붙는가 붙지 않는가와 공식 문서가 정한 기간(1년·3년, 30일·12개월)은 쓴다.
- **TCO 계산기를 개념·문항·도식으로 만들지 마라.** 이유: 지원이 끝난 도구다(사용자 결정, 「배경」). `pricing-calculator` 본문의 한 줄만 예외다.
- **다른 주제의 몫(Azure Advisor의 권장 사항, Azure Policy의 동작, 리소스 잠금, 포털·CLI의 사용법, Resource Manager 템플릿)을 개념으로 세우거나 자세히 쓰지 마라.** 이유: 그 주제를 만드는 phase의 범위다. 필요한 낱말은 그 자리에서 한 줄로 푼다.
- **「배경」이 쓰지 않기로 한 것(Azure SQL Database의 중지, Enterprise Agreement의 계약 조건, 구독 소유권 이전, API 사용법, FinOps 용어, 내보내기)을 쓰지 마라.** 이유: 학습 가이드의 줄에 없거나 개념을 흐린다.
- **`docs/source/azure/topic-map.md`·`dump-topics.tsv`를 고치지 마라.** 이유: 설계 커밋이 배정을 끝냈다. 배정이 맞지 않으면 summary에 적는다.
