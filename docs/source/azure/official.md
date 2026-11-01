# Azure 과목 — 공식 문서에서 확인한 사실

Azure AZ-900 과목의 **사실 출처**다. Microsoft 공식 문서에서 확인한 사실과 URL을 문서마다 모은다(`docs/source/azure/CLAUDE.md` 「원본 셋」, ADR-060).
개념·문항·도식의 사실은 여기에 있는 것만 쓴다. 덤프와 용어집은 사실 후보일 뿐이고, 공식 문서와 다르거나 공식 문서에 없는 곳은 여기가 아니라 `corrections.md`에 둔다.

규칙:

- **허용하는 곳만 쓴다** — `docs/source/azure/CLAUDE.md` 「허용하는 출처」의 `learn.microsoft.com`(학습 단원·제품 문서·자격증 학습 가이드)과
  `azure.microsoft.com`(제품·가격 페이지, 클라우드 컴퓨팅 사전, 약관 쪽 `/support/legal/` — phase 101에서 더함). 목록에 없는 곳은 그 목록에 먼저 더하고 쓴다.
- **사실은 직접 쓴 말로 적는다**(ADR-009). 원문 문장을 옮기지 않는다. 한국어판은 기계 번역이라 특히 그대로 옮기기 쉽다.
- 사실은 **영문판(`en-us`)으로 확인**하고, 한국어판(`ko-kr`)은 **용어 표기만** 본다. 항목마다 「한국어 표기」 줄에 그 문서의 한국어판이 쓰는 말을 적는다.
- 항목마다 사실 줄 끝에 **절 제목**을 「」로 적는다. 절이 없는 짧은 단원은 「첫 문단」처럼 적는다.
- 항목마다 **확인한 날**을 적고, 제품 문서는 페이지의 「Last updated on」 날짜도 적는다. 요금제 이름이 바뀌거나 지원 종료가 예고된 것은 그 날짜와 함께 적는다.
- 「쓰인 곳」에 개념 id와 수정 이력 번호(`D…` 덤프, `G…` 용어집)를 적는다. 개념이 아직 없으면 **쓰일 개념 id**를 적고, 개념을 만든 step이 고친다.
- 받은 문서의 사본은 `raw/official/`에 둔다(gitignore, 전사 검사의 원본). 항목마다 그 파일 이름을 적는다.

「(phase 100)」이 붙은 항목은 phase 100 step 4가 `azure-cloud-computing` 주제(클라우드 컴퓨팅과 비용 모델)가 쓸 사실을 확인하며 더했다(확인한 날 2026-10-30).
문서는 `scripts/azure-source/fetch_page.py`로 내려받아 읽었다. 화면에 보이지 않던 절(예: Functions 단원의 「Serverless computing in Azure」)은 페이지 HTML을 직접 열어 비어 있음을 확인했다.
phase 100 step 7이 `azure-cloud-models` 주제(클라우드 배포 모델)가 쓸 사실을 확인하며 더한 항목은 맨 아래 「한국어 표기 정리 — `azure-cloud-computing`」 다음에 모았다(확인한 날 2026-10-30).
step 4가 만든 항목에 step 7이 더한 줄은 「(phase 100 step 7이 더한 줄)」 표시 뒤에 이어 적었다. 그 항목의 제목과 step 4가 쓴 줄은 그대로다.

「(phase 101)」이 붙은 항목은 phase 101 step 0이 `azure-cloud-benefits` 주제(클라우드의 이점)가 쓸 사실을 확인하며 더했다(확인한 날 2026-10-30). 맨 아래 「한국어 표기 정리 — `azure-cloud-models`」 다음에 모았다.
phase 100 항목에 덧붙인 줄은 끝에 `(phase 101)`을 달았다. 아직 개념이 없어 「쓰일 곳」으로 적고, 그 개념을 만든 step이 「쓰인 곳」으로 고친다.
받은 제품 문서의 사본에는 「Last updated on」 뒤 날짜가 비어 있어(페이지가 스크립트로 그린다) 확인한 날만 적었다.

phase 101 step 3이 `azure-sla-lifecycle` 주제(SLA와 서비스 수명 주기)가 쓸 사실을 확인하며 더한 항목은 맨 아래 「한국어 표기 정리 — `azure-cloud-benefits`」 다음에 모았다(확인한 날 2026-10-30).
이 주제는 공식 학습 가이드 밖이라 Learn 단원이 없다 — Well-Architected Framework·Cloud Adoption Framework·Azure 안정성 문서(SLA), Microsoft 수명 주기 문서(미리 보기·GA·수명 주기 정책), 미리 보기 약관에서 모았다.
SLA 약관 원문(`microsoft.com/licensing`)은 받을 수 없어 쓰지 않으므로 서비스마다의 SLA 수치는 확인하지 않았다. 앞 항목에 덧붙인 줄은 「(phase 101 step 3)」을 달았다.
이번에 받은 사본에는 「Last updated on」 뒤 날짜가 있어 항목마다 적었다.

phase 101 step 6이 `azure-service-types` 주제(서비스 유형과 공유 책임)가 쓸 사실을 확인하며 더한 항목은 맨 아래 「한국어 표기 정리 — `azure-sla-lifecycle`」 다음에 모았다(확인한 날 2026-10-31).
앞 항목(「Describe cloud computing」 단원 4, 「Describe Azure compute services」 단원 2, 「Describe cloud service types」 2·3·4)에 덧붙인 줄은 「(phase 101)」 또는 「(phase 101 step 6)」을 달았다.
**공유 책임 모델의 행마다의 배정은 Azure 보안 문서 「Shared responsibility in the cloud」의 표(글)로 확인했다** — Learn 단원의 유형별 그림은 글로 읽을 수 없어 근거로 치지 않는다.
Azure 서비스의 유형은 공식 문서가 직접 IaaS·PaaS·SaaS라고 말한 것만 적었다. 「완전 관리형」이라는 말만으로 PaaS로 옮겨 적지 않았다(Azure Cosmos DB).

phase 102 step 0이 `azure-regions-zones` 주제(지역과 가용성 영역)가 쓸 사실을 확인하며 더한 항목은 맨 아래 「한국어 표기 정리 — `azure-service-types`」 다음에 모았다(확인한 날 2026-10-31).
앞 항목(Learn 「Describe the core architectural components of Azure」 단원 5, 「What are Azure regions?」, 「What are business continuity, …」, 「What are Virtual Machine Scale Sets?」)에 덧붙인 줄은 끝에 `(phase 102)`를 달았다.
**Learn 단원 5와 현행 Azure 안정성 문서가 어긋나는 곳이 있다** — 단원 5 항목의 「현행 문서와 다름」 줄에 모았다. 어긋나면 현행 제품 문서(「Last updated on」이 2026년인 쪽)를 따른다.
지역 목록·지역 수·데이터 센터 수는 바뀌는 수라 사실로 적지 않았다. 아직 개념이 없어 「쓰일 곳」으로 적고, 그 개념을 만든 step이 「쓰인 곳」으로 고친다.

phase 102 step 4가 `azure-resource-hierarchy` 주제(리소스 계층)가 쓸 사실을 확인하며 더한 항목은 맨 아래 「한국어 표기 정리 — `azure-regions-zones`」 다음에 모았다(확인한 날 2026-10-31).
Learn 단원 6 항목에 덧붙인 줄은 끝에 `(phase 102)`를 달았다. 단원 6과 현행 Azure Resource Manager 문서가 어긋나는 곳은 단원 6 항목의 「현행 문서와 다름」 줄에 모았다.
Azure 역할 기반 액세스 제어(Azure RBAC)·Azure Policy·태그는 다른 주제의 몫이라 이 주제가 한 줄로 풀 근거와 덤프 처리에 쓸 사실만 적었다.

phase 103 step 0이 `azure-compute` 주제(컴퓨팅과 앱 호스팅)가 쓸 사실을 확인하며 더한 항목은 맨 아래 「한국어 표기 정리 — `azure-resource-hierarchy`」 다음에 모았다(확인한 날 2026-10-31).
앞 항목(Learn 「Describe Azure compute services」 단원 2·6, 「Virtual machines in Azure」, Functions 문서 둘, 「What are Virtual Machine Scale Sets?」, 「What is a container?」, 「App Service overview」, 「Azure REST API reference」)에 덧붙인 줄은 끝에 `(phase 103)`을 달았다.
**Learn 단원 2가 phase 100 뒤에 바뀌었다** — 확장 집합·가용성 집합 절(「Scale and resiliency options for VMs」)과 VM 크기 계열 표가 들어왔다. 크기 계열 표·크기 이름 읽는 법·SLA 수치는 확인만 하고 「쓰지 않는다」로 적었다(guide 「배경」).
VM에 꼭 있어야 하는 리소스와 선택인 리소스는 VM 개요의 표가 아니라 「Virtual networks and virtual machines in Azure」의 글로 갈랐다 — 표는 VM을 만들 때 함께 생기는 리소스를 늘어놓을 뿐 필수 여부를 말하지 않는다.
아직 개념이 없어 「쓰일 곳」으로 적고, 그 개념을 만든 step이 「쓰인 곳」으로 고친다.

phase 103 step 5가 `azure-virtual-networking` 주제(가상 네트워크와 연결)가 쓸 사실을 확인하며 더한 항목은 맨 아래 「한국어 표기 정리 — `azure-compute`」 다음에 모았다(확인한 날 2026-10-31).
앞 항목(ExpressRoute 소개, Azure DNS 개요, 가상 네트워크 개요)에 덧붙인 줄은 끝에 `(phase 103)`을 달았다. Learn 네트워킹 단원은 새 모듈 「Describe Azure networking services」로 옮겨져 새 항목으로 두었다.
**설계와 달라진 사실 하나**: VNet 간 VPN 트래픽은 인터넷이 아니라 Microsoft 백본으로 다닌다(「VPN Gateway FAQ」 항목). 그래서 피어링과 VNet 간 VPN은 지나는 길이 아니라 **게이트웨이와 암호화 터널이 있는가**로 갈린다.

---

## (phase 100) AZ-900 공식 학습 가이드 — Skills measured as of July 20, 2026
https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900
https://learn.microsoft.com/ko-kr/credentials/certifications/resources/study-guides/az-900

확인한 날 2026-10-30. 사본: `az-900-study-guide.md`, `ko-az-900-study-guide.md`.

- 시험 범위는 영역 셋이다 — 클라우드 개념(25~30%), Azure 아키텍처와 서비스(35~40%), Azure 관리와 거버넌스(30~35%) — 「Skills at a glance」
- 「Describe cloud computing」 묶음의 항목은 일곱이다: 클라우드 컴퓨팅의 정의, 공동 책임 모델, 클라우드 모델(퍼블릭·프라이빗·하이브리드)의 정의, 모델마다 맞는 쓰임,
  소비 기반 모델, **클라우드 가격 모델의 비교**, **서버리스** — 「Describe cloud computing」
- 영어판 시험이 먼저 바뀌고, 다른 언어판은 대략 8주 뒤에 따라 바뀐다 — 「Updates to the exam」
- 한국어 표기: Describe cloud computing → 클라우드 컴퓨팅 설명, consumption-based model → **사용량 기반 모델**, Compare cloud pricing models → 클라우드 가격 책정 모델 비교, serverless → 서버리스
- (phase 100 step 7이 더한 줄) 클라우드 모델 항목은 둘이다 — 퍼블릭·프라이빗·하이브리드를 정의하는 것과 모델마다 맞는 쓰임을 고르는 것. 다중 클라우드는 이 묶음에 이름이 나오지 않고 Learn 단원 5가 넷째 경우로 다룬다.
  한국어판은 앞 항목의 이름을 「퍼블릭, 프라이빗 및 하이브리드를 포함한 클라우드 모델 정의」로 옮기고, 뒤 항목은 「사용 사례 식별」이라는 말로 옮긴다 — 「Describe cloud computing」

쓰인 곳: 주제 `azure-cloud-computing`의 범위(개념 7개가 이 묶음의 항목을 덮는다), 사용량 기반 모델의 표기(아래 「한국어 표기 정리」)
쓰인 곳(phase 100 step 7이 더한 줄): 주제 `azure-cloud-models`의 범위(개념 5개가 위 두 항목과 Learn 단원 5의 다중 클라우드를 덮는다)

## (phase 100) Learn 「Describe cloud computing」 — 2 Introduction to cloud computing, 8 Summary
https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/2-introduction-cloud-compute
https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/8-summary

확인한 날 2026-10-30. 사본: `learn-describe-cloud-compute-2-introduction-cloud-compute.md`, `learn-describe-cloud-compute-8-summary.md`와 각각의 `ko-` 판.

- 이 모듈의 단원은 여덟이다: 1 소개, 2 클라우드 컴퓨팅 소개, 3 클라우드 컴퓨팅이란, 4 공동 책임 모델, 5 클라우드 모델, 6 소비 기반 모델, 7 지식 점검, 8 요약.
  학습 목표에는 「클라우드 가격 모델 비교」가 있지만 **그 이름의 단원은 없고**, 가격 모델은 단원 6의 「Cloud pricing」 절이 짧게 다룬다. 서버리스를 다루는 단원도 없다 — 모듈 목차, 「Learning objectives」
- 요약 단원은 마지막 단원을 「클라우드가 IT 지출을 자본 지출에서 운영 지출로 옮기는 것」에 관한 단원으로 정리한다 — 8 「첫 문단」
- 한국어 표기: 학습 목표의 consumption-based model → **사용량 기반 모델**, capital expense → 자본 비용, operational expense → 운영 비용

쓰인 곳: `azure-cloud-computing.capex-opex`, `azure-cloud-computing.consumption-based-model`, D6

## (phase 100) Learn 「Describe cloud computing」 — 3 What is cloud computing
https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/3-what-cloud-compute

확인한 날 2026-10-30. 사본: `learn-describe-cloud-compute-3-what-cloud-compute.md`, `ko-learn-describe-cloud-compute-3-what-cloud-compute.md`.

- 클라우드 컴퓨팅은 컴퓨팅 서비스를 **인터넷으로 내주는 것**이다. 여기서 컴퓨팅 서비스는 가상 머신·스토리지·데이터베이스·네트워킹 같은 흔한 IT 인프라이고,
  사물 인터넷·기계 학습·인공 지능 같은 것도 클라우드 서비스에 든다 — 「첫 문단」
- 인터넷으로 내주므로 기존 데이터 센터처럼 물리 인프라에 얽매이지 않는다. IT 인프라를 빨리 늘려야 할 때 데이터 센터를 새로 지을 때까지 기다리지 않고 클라우드로 늘린다 — 「둘째 문단」
- 예: 소매 팀이 계절 행사 기간에 손님이 몰릴 것을 안다. 몇 달 전에 물리 서버를 사서 갖추는 대신 행사 동안만 클라우드에 컴퓨팅 용량을 더하고 끝나면 줄인다.
  그러면 지출이 실제 수요에 맞춰진다 — 「Practical example」
- 클라우드는 인프라를 갖추는 방식을 긴 구매 절차에서 필요할 때 바로 받아 쓰는(on-demand) 방식으로 바꾼다 — 「Practical example」 둘째 문단
- 이 단원은 「인터넷 연결이 반드시 있어야 한다」, 「자기 물리 서버가 있어야 한다」, 「용량을 늘리는 비용이 더 적다」를 따로 말하지 않는다. 이 단원이 말하는 것은 위의 정의와 기다림의 차이뿐이다(`corrections.md` D7·D8)
- 한국어 표기: cloud computing → 클라우드 컴퓨팅, virtual machines → 가상 머신, storage → 스토리지, datacenter → 데이터 센터, compute capacity → 컴퓨팅 용량

쓰인 곳: `azure-cloud-computing.cloud-computing`, D7·D8

쓰인 곳(phase 101 step 4): `azure-sla-lifecycle.sla`(Azure와 서비스를 푸는 첫 문단 — 가상 머신·데이터베이스 같은 컴퓨팅 서비스를 인터넷으로 빌려 쓴다)

## (phase 100) Learn 「Describe cloud computing」 — 6 Describe the consumption-based model
https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/6-describe-consumption-based-model

확인한 날 2026-10-30. 사본: `learn-describe-cloud-compute-6-describe-consumption-based-model.md`, `ko-learn-describe-cloud-compute-6-describe-consumption-based-model.md`.

- 클라우드 컴퓨팅은 소비 기반 모델로 운영된다 — 쓴 IT 리소스에 대해서만 내고 그 이상은 내지 않는다. 자기 데이터 센터 인프라를 사서 유지하는 대신 컴퓨팅 성능과 스토리지를 빌리고, 다 쓰면 그 리소스를 놓아준다 — 「첫 문단」
- **자본 지출(CapEx)** 은 서버·네트워크 하드웨어·데이터 센터 공간 같은 물리 인프라에 미리(up-front) 쓰는 돈이다. **운영 지출(OpEx)** 은 서비스에 시간에 걸쳐 계속 쓰는 돈이다.
  클라우드 서비스는 쓰는 대로 내므로 클라우드 컴퓨팅은 운영 지출로 분류된다 — 「둘째 문단」. 이 단원이 드는 자본 지출의 예는 서버·네트워크 하드웨어·데이터 센터 공간 셋뿐이고,
  운영 지출의 예는 「시간에 걸친 서비스 지출」이라는 정의뿐이다. 직원 월급·전기료·소프트웨어 임대·예약은 어느 쪽으로도 들지 않는다(`corrections.md` D4·D5)
- 소비 기반 모델의 이점 넷: 하드웨어·데이터 센터 인프라에 미리 내는 돈이 없다, 다 쓰이지 않을 수도 있는 용량을 사 두고 관리할 필요가 없다, 수요가 늘면 리소스를 더한다, 수요가 줄면 리소스를 놓아준다 — 「첫 목록」
- **용량 계획**: 기존 데이터 센터에서는 앞으로 필요한 리소스를 미리 짐작한다. 크게 잡으면 놀고 있는 인프라에 돈을 더 쓰고, 작게 잡으면 앱의 성능이 떨어진다.
  모자란 것을 고치려면 하드웨어·전원·냉각을 더 주문하고 설치해 갖춰야 한다 — 「Capacity planning: traditional vs. cloud」 첫 문단
- 클라우드에서는 실제 수요에 맞춰 리소스를 조정한다 — 용량이 더 필요하면 가상 머신을 더하고, 수요가 줄면 뺀다. 노는 용량이 아니라 쓴 것에 대해서만 낸다 — 「Capacity planning: traditional vs. cloud」 둘째 문단
- **클라우드 공급자는 종량제(pay-as-you-go) 가격 모델을 쓴다** — 대개 쓴 서비스에 대해서만 낸다. 그래서 운영 비용을 계획·관리하고, 인프라를 더 효율적으로 운영하고, 작업량의 요구가 바뀌는 대로 규모를 바꿀 수 있다 — 「Cloud pricing」
- 전원·냉각·하드웨어·네트워킹 같은 밑바탕 인프라는 클라우드 공급자가 유지 관리하므로, 쓰는 쪽은 자기 업무의 문제와 사용자에게 내줄 기능에 집중한다 — 「Cloud pricing」 마지막 문단
- 이 단원에서 **소비 기반 모델은 돈을 내는 원리**(쓴 만큼 낸다)이고, **종량제는 공급자가 쓰는 가격 모델의 이름**이다 — 두 절이 따로 쓴다(「첫 문단」, 「Cloud pricing」)
- 한국어 표기: 단원 제목은 **사용량 기반 모델 설명**이고 본문은 **소비 기반 모델**이라고 쓴다. capital expenditure → CapEx(자본 지출), operational expenditure → 운영 지출(OpEx),
  operational expense → 운영 비용, pay-as-you-go → **종량제**, cloud pricing → 클라우드 가격 책정, capacity planning → 용량 계획

쓰인 곳: `azure-cloud-computing.capex-opex`, `azure-cloud-computing.consumption-based-model`, `azure-cloud-computing.pay-as-you-go`, `CapacityPlanningDiagram`(용량 계획), D2·D3·D4·D5·D6·D8, G1·G8

## (phase 100) Learn 「Describe cloud computing」 — 5 Define cloud models (비교표의 한 칸만)
https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models

확인한 날 2026-10-30. 사본: `learn-describe-cloud-compute-5-define-cloud-models.md`, `ko-learn-describe-cloud-compute-5-define-cloud-models.md`(설계 세션이 받아 두었다).

- 클라우드 모델 비교표는 퍼블릭 클라우드의 특징으로 규모를 키우는 데 자본 지출이 들지 않는다는 것을 든다 — 「Define cloud models」 비교표
- 이 단원의 나머지(퍼블릭·프라이빗·하이브리드·다중 클라우드의 내용)는 `azure-cloud-models` 주제가 쓸 사실이라 phase 100 step 7이 이 파일에 더한다. 여기서는 D3의 근거인 위 한 칸만 적는다
- (phase 100 step 7이 더한 줄) 아래 줄들은 step 7이 단원 전체를 다시 읽고 더했다. 제목의 「비교표의 한 칸만」은 step 4 때의 범위다
- 클라우드 모델은 클라우드 리소스를 어떤 형태로 배포하는지(배포 유형)를 가르는 분류다. 주요 모델은 프라이빗·퍼블릭·하이브리드 셋이다 — 「첫 문단」
- **프라이빗 클라우드**는 한 조직(entity)만 쓰는 클라우드 환경이다. 기존 데이터 센터 방식에서 자라 나온 것으로, IT 서비스를 인터넷으로 내주되 리소스는 그 조직 전용으로 둔다.
  IT 팀의 통제권은 훨씬 크지만, 비용이 더 들고 퍼블릭 배포가 주는 이점은 적다 — 「Private cloud」
- 프라이빗 클라우드를 **둘 수 있는 곳**은 조직 사업장 안의 데이터 센터, 또는 사업장 밖의 전용 데이터 센터다. 사업장 밖이면 그 데이터 센터를 제3자가 운영할 수도 있다 — 「Private cloud」 마지막 문장
- **퍼블릭 클라우드**는 제3자 클라우드 공급자가 짓고 통제하고 유지 관리한다. 클라우드 서비스를 사려는 사람이면 누구나 리소스에 접근해 쓸 수 있다.
  이렇게 **일반에 열려 있다**는 것이 퍼블릭과 프라이빗을 가르는 핵심 차이다 — 「Public cloud」
- **하이브리드 클라우드**는 퍼블릭과 프라이빗을 서로 이어 둔 채 둘 다 쓰는 컴퓨팅 환경이다. 프라이빗 쪽 수요가 잠시 늘면 퍼블릭 리소스를 배포해 늘어난 만큼을 받아 낼 수 있고, 보안 층을 하나 더 두는 데도 쓴다.
  예: 어떤 서비스는 퍼블릭에 두고 어떤 서비스는 프라이빗 인프라에 배포할지 쓰는 쪽이 고른다 — 「Hybrid cloud」
- 비교표의 칸 — 「Define cloud models」 비교표
  - 퍼블릭: 규모를 키우는 데 자본 지출이 들지 않는다(위 첫 줄), 앱을 빨리 갖추고(provision) 없앨(deprovision) 수 있다, 쓴 만큼만 낸다, 리소스와 보안을 완전히 통제하지는 못한다
  - 프라이빗: 리소스와 보안을 완전히 통제한다, 데이터가 다른 테넌트의 데이터와 같은 곳에 놓이지 않는다, 시작하고 유지하려면 하드웨어를 사야 한다, 하드웨어 유지 관리와 업데이트를 조직이 맡는다
  - 하이브리드: 셋 가운데 가장 유연하다, 앱을 어디서 실행할지 쓰는 쪽이 정한다, 보안·규정 준수·법적 요구 사항을 쓰는 쪽이 통제한다
- **다중 클라우드**는 넷째이자 점점 흔해지는 경우로, 퍼블릭 클라우드 공급자 여럿을 함께 쓴다. 공급자마다 다른 기능을 골라 쓰거나, 한 공급자로 클라우드를 시작했다가 다른 공급자로 옮겨 가는 중일 때 생긴다.
  어느 쪽이든 둘 이상의 퍼블릭 공급자를 다루고, 두 환경 모두에서 리소스와 보안을 관리한다 — 「Multicloud」
- **Azure Arc**는 클라우드 환경을 관리하도록 돕는 기술 묶음이다. Azure만 쓰는 퍼블릭, 자기 데이터 센터의 프라이빗, 하이브리드, 여러 공급자를 한꺼번에 쓰는 다중 클라우드 가운데 어떤 환경이든 관리를 돕는다 — 「Azure Arc」
- 「Azure VMware Solution」 절(VMware로 꾸린 프라이빗 환경의 작업을 Azure에서 실행)은 **이 주제에서 쓰지 않는다**(phase 100 guide)
- 이 단원은 「어느 모델에 인프라를 두면 자기 데이터 센터가 필요 없나」를 따로 말하지 않는다. 말하는 것은 퍼블릭은 공급자가 짓고 관리한다는 것,
  프라이빗은 사업장 밖의 제3자 데이터 센터에도 둘 수 있고 하드웨어를 사서 유지하는 일은 조직 몫이라는 것이다(`corrections.md` D11)
- 이 단원은 하이브리드를 퍼블릭과 「프라이빗」의 결합으로만 정의하고 on-premises라는 말을 쓰지 않는다(사업장 안은 「on-site datacenter」). 온-프레미스 장비와 클라우드를 이은 것을 하이브리드로 부르는 근거는 아래 「What is a hybrid cloud?」 항목이다
- 한국어 표기: cloud models → **클라우드 모델**(단원 제목 「클라우드 모델 정의」), deployment type → 배포 유형, private / public / hybrid cloud → **프라이빗 클라우드 / 퍼블릭 클라우드 / 하이브리드 클라우드**, multicloud → **다중 클라우드**,
  third-party cloud provider → 타사 클라우드 공급자, on-site datacenter → 사내 데이터 센터, tenant → 테넌트, Azure Arc → Azure Arc(이름 그대로). 한국어판은 「단일 엔터티」·「프로비전」처럼 영문을 소리대로 옮긴 곳이 많다

쓰인 곳: D3
쓰인 곳(phase 100 step 7이 더한 줄): `azure-cloud-models.cloud-models`, `azure-cloud-models.public-cloud`, `azure-cloud-models.private-cloud`, `azure-cloud-models.hybrid-cloud`, `azure-cloud-models.multicloud`,
`PublicPrivateCloudDiagram`, `HybridCloudDiagram`, `CloudModelsTable`, D11·D12·D13·D14·D15, G9

## (phase 100) Learn 「Describe the core architectural components of Azure」 — 5 Describe Azure physical infrastructure
https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/5-describe-azure-physical-infrastructure

확인한 날 2026-10-30. 사본: `learn-describe-core-architectural-components-of-azure-5-describe-azure-physical-infrastructure.md`와 `ko-` 판.

- **데이터 센터**는 서버를 랙(서버를 층층이 꽂아 두는 틀)에 늘어놓고 전용 전원·냉각·네트워킹 인프라를 갖춘 시설이다. Azure의 데이터 센터는 회사가 자기 건물에 둔 데이터 센터와 비슷하지만 훨씬 크다 — 「Physical infrastructure」
- Azure는 전 세계에 데이터 센터를 두지만, 쓰는 쪽이 데이터 센터 하나하나를 직접 다루지는 않는다 — 「Physical infrastructure」 둘째 문단
- 한국어 표기: datacenter → 데이터 센터, on-premises datacenter → 온-프레미스 데이터 센터, rack → 랙
- **지역**(region)은 지구 위의 한 지리적 영역이다. 그 안에 서로 가까이 있고 대기 시간이 짧은 네트워크로 이어진 데이터 센터가 하나 이상 있다. Azure에 리소스를 배포할 때는 흔히 어느 지역에 둘지 고른다 — 「Regions」 (phase 101)
- 한국어 표기: region → 지역(절 제목 「지역」) (phase 101)
- 데이터 센터는 Azure 지역과 가용성 영역으로 묶이고, 그 묶음이 워크로드의 복원력과 안정성을 준다 — 「Physical infrastructure」 둘째 문단 (phase 102)
- Azure는 지역마다 그 안의 리소스를 배정하고 관리해 워크로드가 알맞게 나뉘게 한다 — 「Regions」 (phase 102)
- 일부 서비스나 VM 기능(특정 VM 크기나 저장소 종류 등)은 일부 지역에서만 쓸 수 있다. 지역을 고르지 않아도 되는 전역 서비스도 있고, 예로 Microsoft Entra ID·Azure Traffic Manager·Azure DNS를 든다 — 「Regions」 Note (셋 다 현행 「Azure nonregional services」 목록에 있다) (phase 102)
- **가용성 영역**은 한 지역 안에서 물리적으로 떨어진 데이터 센터다. 영역 하나는 전원·냉각·네트워크를 따로 갖춘 데이터 센터 하나 이상으로 이루어진다. 영역은 격리 경계라서 한 영역이 멈춰도 나머지 영역은 계속 일한다. 영역끼리는 빠른 사설 광섬유 네트워크로 이어진다 — 「Availability Zones」 (phase 102)
- 가용성 영역을 지원하는 지역에는 서로 떨어진 영역이 최소 셋 있다. 모든 지역이 가용성 영역을 지원하지는 않는다 — 「Availability Zones」 Important (phase 102)
- 온-프레미스에서 중복을 갖추려면 같은 하드웨어를 한 벌 더 사서 유지해야 한다. Azure에서는 한 지역 안의 여러 가용성 영역에 워크로드를 나눠 두어 보호한다 — 「Use availability zones for your workloads」 (phase 102)
- 쓰는 법: VM·저장소·데이터베이스 같은 리소스를 한 영역에 두고 같은 지역의 다른 영역에 복제한다. 서비스를 한 벌 더 두는 데 비용이 들 수 있다 — 같은 절 (영역 사이 데이터 전송 요금은 아래 「현행 문서와 다름」) (phase 102)
- 가용성 영역을 지원하는 서비스를 세 범주로 나눈다 — 영역 서비스(리소스를 특정 영역 하나에 고정한다, 예: VM·관리 디스크·IP 주소), 영역 중복 서비스(플랫폼이 영역들에 걸쳐 저절로 복제한다, 예: 영역 중복 스토리지·SQL Database),
  비지역 서비스(Azure 지리에서 늘 쓸 수 있고 영역 전체·지역 전체의 중단에도 견딘다) — 같은 절 (나눔은 아래 「현행 문서와 다름」) (phase 102)
- 가용성 영역이 있어도 한 지역의 여러 영역에 함께 미칠 만큼 큰 사건이 일어날 수 있다. 그보다 큰 대비로 지역 쌍을 든다 — 같은 절 끝 (phase 102)
- **지역 쌍**: 같은 지리(미국·유럽·아시아 등) 안의 다른 지역과 짝을 지어 두면, 지리 안에서 리소스를 복제해 자연재해·시민 소요·정전·물리 네트워크 중단처럼 지역 하나 전체에 미치는 사건으로 서비스가 끊길 가능성을 줄인다 — 「Region pairs」 (짝의 비율과 거리는 아래 「현행 문서와 다름」) (phase 102)
- 모든 Azure 서비스가 데이터를 저절로 복제하거나 실패한 지역에서 다른 지역으로 저절로 넘어가지는 않는다. 그런 경우 복구와 복제는 고객이 구성한다 — 「Region pairs」 Important (phase 102)
- 짝의 예로 미국 서부와 미국 동부, 동남아시아와 동아시아를 든다 — 「Region pairs」 (현행 「Azure region pairs and nonpaired regions」의 짝 목록에도 같다) (phase 102)
- 지역 쌍의 덧붙은 이점 셋: 큰 중단이 나면 짝마다 한 지역을 먼저 복구한다, 계획된 업데이트는 짝의 두 지역에 한 번에 한 지역씩 적용한다, 데이터 상주와 규정 준수를 위해 데이터가 짝과 같은 지리 안에 남는다(브라질 남부는 예외) — 「Additional advantages of region pairs」 (phase 102)
- 대부분의 짝은 서로를 백업하는 양방향이다. 브라질 남부처럼 한 방향으로만 짝지은 지역도 있다 — 브라질 남부의 짝은 지리 밖의 미국 중남부이지만 미국 중남부의 짝은 브라질 남부가 아니다. 이탈리아 북부·폴란드 중부·이스라엘 중부처럼 짝이 없는 지역은 가용성 영역과 지역 중복 스토리지로 복원력을 얻는다 — 같은 절 Important (phase 102)
- **소버린 지역**은 주 Azure 인스턴스와 떨어진 Azure 인스턴스다. 규정 준수나 법적인 이유로 써야 할 수 있다 — 「Sovereign Regions」 (phase 102)
- 소버린 지역의 예 둘: 미국 정부 기관과 협력사를 위한 지역(US DoD Central·US Gov Virginia·US Gov Arizona 등) — 물리·논리 네트워크가 격리된 인스턴스이고, 심사를 거친 미국인이 운영하며 규정 준수 인증이 더 붙는다.
  중국의 지역(China East·China North 등) — Microsoft와 21Vianet의 협력으로 제공되고, Microsoft가 데이터 센터를 직접 유지하지 않는다 — 「Sovereign Regions」 (phase 102)
- 한국어 표기(phase 102): availability zone → 가용성 영역, region pair → 지역 쌍, geography → 지리, redundancy → 중복성, zonal services → 영역 서비스, zone-redundant services → 영역 중복 서비스, non-regional services → 비지역 서비스,
  sovereign region → 절 제목은 「소버린 지역」, 본문은 「주권 지역」(세 번) — 이 주제가 고른 이름과 근거는 「한국어 표기 정리 — `azure-regions-zones`」
- **현행 문서와 다름(phase 102)** — 단원 5는 받은 날(2026-10-30) 기준의 학습 단원이지만 아래 일곱 곳이 현행 Azure 안정성 문서와 어긋난다. 모두 **현행을 따른다**.
  1. 지역 쌍의 비율: 단원 5는 「대부분의 지역이 짝을 이룬다」고 한다. 「Azure region pairs and nonpaired regions」(2026-10-15)는 짝이 없는 지역이 많다고, 「What are Azure regions?」(2026-06-29)는 새 지역 다수가 짝이 없다고 한다 → 「Microsoft가 일부 지역을 짝지어 둔다」로 쓴다.
  2. 짝 사이 거리: 단원 5의 「300마일 이상」은 현행 두 문서 어디에도 없다 → 수치를 쓰지 않는다. 짝이 같은 지리 안에 있다는 것만 쓴다.
  3. 짝 지역으로의 자동 장애 조치: 단원 5는 짝의 한 지역이 재해를 입으면 서비스가 짝 지역으로 저절로 넘어간다고 예를 든다. 현행 「Azure region pairs and nonpaired regions」는 짝의 한 지역에 배포하는 것만으로는 복원력·고가용성·재해 복구·장애 조치가 저절로 생기지 않고,
     Microsoft가 관리하는 장애 조치를 주된 대비로 삼지 말라고 한다 → 「저절로 장애 조치된다」고 쓰지 않는다. 단원 5의 Important(복구와 복제는 고객이 구성)는 현행과 맞다.
  4. 영역 사이 데이터 전송 요금: 단원 5는 영역 사이 데이터 전송에 비용이 들 수 있다고 한다. 현행 「What are availability zones?」(2026-09-23)는 같은 지역의 가용성 영역 사이 데이터 전송에 요금을 매기지 않는다고 한다 → 전송 요금은 쓰지 않고, 리소스를 영역마다 더 두는 비용만 쓴다.
  5. 범주의 나눔: 현행 「What are availability zones?」 「Types of availability zone support」는 영역 중복 리소스와 영역 리소스 둘로 나누고, 영역을 쓰도록 구성하지 않은 리소스를 비영역(지역) 배포라 부른다. 비지역 서비스는 가용성 영역 지원 유형이 아니라 「Azure nonregional services」가 따로 다루는 갈래다 → 개념 `zone-service-categories`는 현행의 나눔으로 쓴다(「한국어 표기 정리 — `azure-regions-zones`」).
  6. 영역 중복의 「저절로」: 단원 5는 플랫폼이 저절로 복제한다고만 한다. 현행은 지원 지역에서 저절로 영역 중복이 되는 서비스도 있고 고객이 영역 중복으로 구성해야 하는 서비스도 있다고 한다 → 「서비스가 여러 영역에 복제한다(고객이 켜야 하는 서비스도 있다)」로 쓴다.
  7. 비지역 서비스가 「지역 전체 중단에도 견딘다」: 현행 「Azure nonregional services」는 전역 서비스만 지역 장애에 견딘다고 하고, 지리 서비스는 한 지리 영역 안에 배포된다고 한다 → 지역 전체 중단에 견딘다는 말은 전역 서비스로 한정해 쓴다.

쓰인 곳: `azure-cloud-computing.cloud-computing`(데이터 센터·서버를 푸는 한 줄)

쓰인 곳(phase 101): `azure-cloud-benefits.reliability`(지역과 데이터 센터를 푸는 줄), az020 해설

쓰인 곳(phase 101 step 4): `azure-sla-lifecycle.composite-sla`(지역과 데이터 센터를 푸는 한 줄)

쓰인 곳(phase 102 step 1): `azure-regions-zones.datacenter`(데이터 센터의 정의와 랙, 온-프레미스 데이터 센터보다 훨씬 크다, 고객은 데이터 센터를 직접 다루지 않고 지역·가용성 영역으로 고른다),
`azure-regions-zones.region`(정의, 배포할 때 지역을 고른다, Azure가 지역 안의 리소스를 배정·관리한다, 일부 서비스·VM 기능은 일부 지역에만, 지역을 고르지 않는 서비스의 예), az039·az040·az041 해설, `AzureRegionDiagram`

쓰인 곳(phase 102 step 2): `azure-regions-zones.availability-zones`(정의·격리 경계·빠른 사설 네트워크·최소 셋·모든 지역이 지원하지는 않음·쓰는 법·온-프레미스와의 대비·한 지역의 여러 영역에 미치는 큰 사건 — 자연재해를 예로·그보다 큰 대비로 지역 쌍),
`azure-regions-zones.zone-service-categories`(예로 든 서비스 — 영역 리소스의 VM, 영역 중복의 영역 중복 스토리지·SQL Database. 관리 디스크·IP 주소는 예로 쓰지 않았다. 나눔과 이름은 현행), az042·az043·az044 해설, `ZoneIsolationDiagram`

- 한국어 표기(phase 102 step 3): main instance of Azure → Azure의 주 인스턴스(L5 한국어판). 이 주제는 「주 인스턴스」로 쓰고 「모두가 함께 쓰는 Azure」로 풀어 쓴다

쓰인 곳(phase 102 step 3): `azure-regions-zones.region-pairs`(짝지은 까닭 — 자연재해·정전처럼 지역 전체에 미치는 사건, 고객이 복제와 장애 조치를 구성, 짝의 예 — 미국 서부·미국 동부와 동아시아·동남아시아, 덧붙은 이점 셋, 브라질 남부의 예외와 한 방향 짝. 「현행 문서와 다름」 1~3을 따라 「일부 지역」으로 쓰고 거리 수치와 「저절로 장애 조치된다」는 쓰지 않았다),
`azure-regions-zones.sovereign-regions`(주 인스턴스와 격리된 인스턴스, 규정 준수·법적 이유, 예 둘 — 심사를 거친 미국인이 운영, 추가 규정 준수 인증, Microsoft가 데이터 센터를 직접 유지하지 않음, 지역 이름은 단원 5 한국어판 표기로 US Gov 버지니아·US Gov 애리조나·중국 동부·중국 북부. US DoD Central은 쓰지 않았다), az045·az046·az047 해설, `RegionPairDiagram`, D38·D39·D40·D41·D42·D43, G21·G22. **「현행 문서와 다름」의 일곱 곳은 단원 5의 말이 아니라 현행 문서의 말로 썼다**

쓰인 곳(phase 102 step 5): `azure-resource-hierarchy.resource`(지역과 데이터 센터를 푸는 한 줄, 리소스를 배포할 때 지역을 고르는 경우가 많다), `azure-resource-hierarchy.resource-group`(가용성 영역을 푸는 한 줄), az049·az050 해설(데이터 센터·가용성 영역을 푸는 줄)

## (phase 100) Learn 「Describe the core architectural components of Azure」 — 6 Describe Azure management infrastructure
https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/6-describe-azure-management-infrastructure

확인한 날 2026-10-30. 사본: `learn-describe-core-architectural-components-of-azure-6-describe-azure-management-infrastructure.md`와 `ko-` 판.

- **리소스**는 Azure를 이루는 기본 단위다. Azure에서 만들거나 갖추거나 배포하는 것은 무엇이든 리소스이고, VM·가상 네트워크·데이터베이스가 그 예다 — 「Azure resources and resource groups」 첫 문단
- 한국어 표기: resource → 리소스
- Azure를 쓰려면 **Azure 구독**이 있어야 한다. 구독은 Azure 제품과 서비스에 접근하게 해 주고, 요금을 매기는 단위가 된다 — 「Azure subscriptions」 둘째 문단 (phase 101)
- 한국어 표기: subscription → 구독, Azure subscription → Azure 구독 (phase 101)
- 리소스 그룹은 리소스를 묶은 것이다. 리소스는 리소스 그룹 하나에 속해야 하고, 일부 리소스는 다른 그룹으로 옮길 수 있지만 어느 때든 한 그룹에만 속한다. 리소스 그룹 안에 리소스 그룹을 둘 수 없고, 만든 뒤에는 이름을 바꿀 수 없다 — 「Azure resources and resource groups」 둘째 문단 (phase 102)
- 리소스 그룹에 한 일은 그 안의 리소스 모두에 미친다 — 그룹을 지우면 안의 것이 모두 지워지고, 그룹에 접근을 허용하거나 막으면 안의 리소스 모두에 적용된다 — 같은 절 셋째 문단 (phase 102)
- 쓰는 예 둘: 잠깐 쓸 개발 환경을 한 그룹에 모아 두면 다 쓴 뒤 그룹째 지울 수 있다. 프로젝트가 여럿이면 프로젝트마다 그룹을 따로 두어 팀마다 자기 리소스만 보고 관리하게 한다. 리소스 그룹을 짜는 정해진 규칙은 없다 — 같은 절 넷째·다섯째 문단 (phase 102)
- 구독은 관리·청구·규모의 단위다. 구독으로 리소스 그룹을 정리하고, 청구를 접근과 따로 다룬다 — 「Azure subscriptions」 첫 문단 (phase 102)
- 구독은 Azure 계정에 이어지고, 그 계정은 Microsoft Entra ID 안의 ID이거나 Microsoft Entra ID가 믿는 디렉터리 안의 ID다 — 같은 절 둘째 문단 (phase 102)
- 계정 하나에 구독이 여럿일 수 있고, 하나는 있어야 한다. 구독이 여럿이면 청구 방식과 액세스 정책을 구독마다 달리 정할 수 있다 — 구독이 두 가지 경계가 되기 때문이다 — 같은 절 셋째 문단 (phase 102)
- **청구 경계**: Azure 계정에 요금을 어떻게 매기는지를 가른다. 청구 요구가 다르면 구독을 따로 만들 수 있고, Azure는 구독마다 청구 보고서와 청구서를 따로 낸다 — 같은 절 목록 (phase 102)
- **액세스 제어 경계**: Azure는 액세스 관리 정책을 구독 수준에서 적용한다. 예로 개발용 구독과 운영용 구독을 따로 두어 지출 한도와 액세스 규칙을 달리한다 — 같은 절 목록 (phase 102)
- 구독을 더 만드는 까닭 셋: 환경(샌드박스·개발·테스트·운영처럼 수명 주기 단계마다 — 액세스 제어가 구독 수준이라 자연스러운 경계가 된다), 팀·워크로드(프로젝트마다 구독을 주면 비용을 따로 보기 쉽고, 샌드박스를 운영과 떼어 둘 수 있다), 청구(비용을 따로 추적한다 — 예: 운영 워크로드용 하나, 개발·테스트용 하나) — 「Create additional Azure subscriptions」 (phase 102)
- 같은 구독 안에서 리소스 그룹을 여럿으로 나눠도 청구서가 나뉘지 않는다는 것은 문서가 직접 말하지 않는다. 판단 근거는 둘이다 — Azure가 청구 보고서와 청구서를 따로 내는 단위는 구독이다(위 「청구 경계」), 리소스 그룹은 구독 안에 든다(「Azure management groups」 첫 문단). 그래서 비용을 서로 다른 청구서로 받으려면 리소스 그룹이 아니라 구독을 나눈다 (phase 102 step 6)
- 리소스는 리소스 그룹에, 리소스 그룹은 구독에 들어간다. 구독이 많고 여러 팀이나 지리에 걸치면 접근과 정책을 더 높은 수준에서 관리할 수단이 필요하다 — 「Azure management groups」 첫 문단 (phase 102)
- 관리 그룹은 구독 위에 있다. 구독을 관리 그룹으로 묶고 거버넌스 조건(액세스 정책·규정 준수 규칙 같은 것)을 그룹에 걸면, 그룹 안의 구독이 모두 그 조건을 저절로 물려받는다 — 리소스가 자기 리소스 그룹의 설정을 물려받는 것과 같다. 관리 그룹은 여섯 단계까지 중첩할 수 있다(루트 단계와 구독 단계는 세지 않는다) — 같은 절 둘째 문단 (phase 102)
- Microsoft Entra 테넌트마다 최상위 **테넌트 루트 그룹**이 하나 있고, 다른 관리 그룹과 구독은 모두 그 아래로 모인다. 그래서 거버넌스 정책을 전체에 걸 수 있다 — 같은 절 셋째 문단 (phase 102)
- 관리 그룹을 쓰는 예 둘 — (1) 여러 구독에 정책을 건다: Production이라는 관리 그룹에서 VM을 둘 수 있는 곳을 US West 지역으로 제한하면, 그 아래 모든 구독이 물려받아 그 구독들의 VM 모두에 적용되고, 리소스나 구독의 소유자가 그것을 바꿀 수 없다. (2) 여러 구독에 접근을 한 번에 준다: 관리 그룹에 Azure RBAC 할당을 하나 만들면 그 아래 하위 관리 그룹·구독·리소스 그룹·리소스가 모두 그 권한을 물려받는다 — 「Management group, subscriptions, and resource group hierarchy」 (phase 102)
- 디렉터리 하나에 관리 그룹을 10,000개까지 둘 수 있다. 관리 그룹과 구독은 저마다 부모가 하나뿐이다 — 같은 절 「Important facts about management groups」 (phase 102)
- 한국어 표기: resource group → 리소스 그룹, account → 계정, subscription boundaries → 구독 경계(「구독 경계에는 두 가지 유형이 있습니다」), billing boundary → 청구 경계, access control boundary → 액세스 제어 경계, management group → 관리 그룹, Tenant Root Group → 테넌트 루트 그룹, governance → 거버넌스, compliance → 규정 준수, sandbox → 샌드박스, production → 프로덕션(이 앱은 phase 101이 정한 「운영 환경」을 쓴다), 절 제목 「관리 그룹, 구독 및 리소스 그룹 계층 구조」 (phase 102)
- **현행 문서와 다름** (phase 102) — 어긋나면 현행 제품 문서를 따른다:
  1. 단원 6은 리소스마다 리소스 그룹 하나에 **반드시** 속한다고 한다. 「What is Azure Resource Manager?」(2026-08-04)는 리소스가 리소스 그룹 하나에만 있을 수 있다고 하면서도, **일부 리소스는 리소스 그룹 밖에 있을 수 있다**(구독·관리 그룹·테넌트에 배포한다)고 하고, 리소스 그룹·구독·관리 그룹·태그 자체도 리소스라고 한다. → VM·가상 네트워크·데이터베이스처럼 리소스 그룹에 넣는 리소스는 리소스 그룹 하나에만 속한다고 쓰고, 「모든 리소스가 리소스 그룹에 들어간다」로 일반화하지 않는다
  2. 단원 6은 리소스 그룹의 지역을 말하지 않는다. 같은 문서와 「Manage Azure resource groups by using the Azure portal」은 리소스 그룹에도 위치(지역)가 있고 그 위치가 리소스의 메타데이터를 두는 곳이며, 안의 리소스는 리소스 그룹과 다른 지역에 있어도 된다고 한다 — 어긋남이 아니라 단원 6에 없는 사실이다

쓰인 곳(phase 102 step 5): `azure-resource-hierarchy.resource`(정의와 예 — VM·가상 네트워크·데이터베이스. 「현행 문서와 다름」 1대로 「VM·가상 네트워크·데이터베이스 같은 리소스는」 리소스 그룹 하나에 들어간다고 한정했다),
`azure-resource-hierarchy.resource-group`(한 그룹에만 속함·옮길 수 있음·중첩 불가·이름 변경 불가·그룹에 한 일이 안의 리소스 모두에·쓰는 예 둘·정해진 규칙 없음, 「현행 문서와 다름」 1·2), az048·az049·az050 해설, `ResourceGroupScopeDiagram`, D48·G24

쓰인 곳(phase 102 step 6): `azure-resource-hierarchy.subscription`(Azure를 쓰려면 구독이 있어야 한다, 쓰고 관리하며 요금을 내는 단위 — 「규모」는 이 주제에서 풀 말이 없어 쓰지 않았다, 계정은 Microsoft Entra ID 또는 그것이 믿는 디렉터리의 ID, 계정 하나에 구독 여럿·적어도 하나, 구독이 리소스 그룹을 담는다 — D46),
`azure-resource-hierarchy.subscription-boundaries`(청구 경계·액세스 제어 경계, 구독마다 다른 지출 한도와 액세스 규칙, 구독을 더 만드는 까닭 셋, 「프로덕션」 대신 「운영 환경」, 리소스 그룹을 나눠도 청구서가 나뉘지 않는다는 판단), az051·az052 해설, `SubscriptionBoundaryDiagram`, D46·G25. 클래식 관리자 역할·「Microsoft 계정」·「Azure AD」는 쓰지 않았다

쓰인 곳(phase 102 step 7): `azure-resource-hierarchy.management-group`(구독이 많고 여러 팀에 걸치면 더 높은 수준의 관리가 필요하다, 구독 위의 묶음, 거버넌스 조건(액세스 정책·규정 준수 규칙)의 상속과 리소스 그룹 설정 상속과의 비교, 여섯 단계 — 테넌트 루트 그룹 단계와 구독 단계는 세지 않음, 테넌트 루트 그룹, 10,000개 — 「디렉터리 하나에」를 개념 9가 푼 테넌트로 「테넌트 하나에」라고 썼다, 부모 하나, 관리 그룹으로 묶어도 청구서는 구독마다 — 위 step 6의 판단 줄),
`azure-resource-hierarchy.hierarchy`(쓰는 예 둘 — Production·US West 대신 이름표 「운영」과 「지역을 한 곳으로 제한」으로 썼다, 절 제목을 명사구로 줄인 name), az053·az054·az055 해설, `HierarchyInheritanceDiagram`, D50·G26

쓰인 곳: `azure-cloud-computing.consumption-based-model`(리소스를 푸는 한 줄)

쓰인 곳(phase 101 step 4): `azure-sla-lifecycle.sla`(리소스를 푸는 한 줄 — 서비스로 만들어 쓰는 것 하나하나, 가상 머신 한 대가 그 예)

쓰인 곳(phase 101 step 5): `azure-sla-lifecycle.preview`(Azure 구독을 푸는 한 줄 — Azure 서비스를 쓰려면 있어야 하고, 서비스를 쓸 수 있게 해 주며 요금을 매기는 단위), az028·az029 해설

쓰인 곳(phase 101 step 7): `azure-service-types.shared-responsibility-model`(리소스를 푸는 한 줄 — 클라우드에서 빌려 쓰는 서버나 저장 공간 하나하나)

## (phase 100) Learn 「Describe Azure compute services」 — 2 Describe Azure virtual machines
https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/2-virtual-machines

확인한 날 2026-10-30. 사본: `learn-describe-azure-compute-networking-services-2-virtual-machines.md`와 `ko-` 판. (모듈 주소는 `describe-azure-compute-networking-services`이고 지금 제목은 「Describe Azure compute services」다.)

- Azure 가상 머신(VM)으로 Azure 안에서 가상화된 서버를 실행한다. 물리 서버처럼 운영 체제와 설치한 소프트웨어를 쓰는 쪽이 정한다 — 「첫 문단」
- Azure VM을 쓰면 물리 서버 하드웨어를 사서 유지할 필요가 없다. 그래도 VM 안의 패치·업데이트·구성은 쓰는 쪽이 계속 관리한다 — 「둘째 문단」
- VM은 테스트·개발에 맞다 — 여러 구성을 빨리 만들고 테스트가 끝나면 VM을 지운다 — 「Examples of when to use VMs」
- 한국어 표기: Azure Virtual Machines → Azure VM(Virtual Machines), virtual machine → 가상 머신, physical server → 물리적 서버, operating system → 운영 체제

쓰인 곳: `azure-cloud-computing.cloud-computing`(가상 머신을 푸는 한 줄), `azure-cloud-computing.serverless`(VM과의 차이), D1, G1

쓰인 곳(phase 101 step 4): `azure-sla-lifecycle.sla`(가상 머신을 푸는 한 줄)

- Azure VM은 가상화된 서버를 IaaS로 실행하는 서비스다. IaaS 서비스이므로 VM 안의 패치·업데이트·구성은 쓰는 쪽이 맡는다 — 「첫 문단」·「둘째 문단」 (phase 101)

쓰인 곳(phase 101 step 7): `azure-service-types.iaas`(Azure에서의 예 — VM이 IaaS이고, 물리 서버를 사서 유지하지 않아도 되지만 VM 안의 패치·업데이트·구성은 고객이 맡는다. 가상 머신을 푸는 한 줄), az034 해설, D32·D34

쓰인 곳(phase 102 step 5): `azure-resource-hierarchy.resource`(VM을 푸는 한 줄 — Azure 안에서 실행되는 서버이고, 서버 장비를 사서 관리하지 않고도 운영 체제와 프로그램을 골라 쓴다), az048 해설

다시 확인한 날 2026-10-31. 영문·`ko-` 사본을 다시 받았다 — 단원에 「VM resources and sizing」의 크기 계열 표와 「Scale and resiliency options for VMs」 절이 새로 들어와 있다. (phase 103)

- VM이 맞는 경우는 셋이다 — 운영 체제를 통째로 통제해야 할 때, 직접 만든 소프트웨어를 실행해야 할 때, 호스팅 구성을 직접 정해야 할 때 — 「첫 문단」 (phase 103)
- 미리 만들어 둔 이미지로 VM을 빨리 배포한다. 이미지는 운영 체제와 도구(예: 웹 호스팅 구성 요소)가 이미 들어 있는 틀이다 — 「첫 문단」 (phase 103)
- 쓰임 다섯 — 테스트와 개발(여러 운영 체제·앱 구성을 빨리 만들고 끝나면 VM을 지운다), 클라우드 앱 호스팅(Azure에서 앱을 실행하고 수요에 따라 용량을 늘리고 줄인다), 데이터 센터 확장(온-프레미스 네트워크를 Azure로 넓혀 이어진 가상 네트워크에서 워크로드를 실행한다),
  재해 복구(주 사이트를 쓸 수 없을 때 Azure에 둔 대체 용량으로 중요한 워크로드를 실행한다), 리프트 앤 시프트 마이그레이션(앱을 거의 다시 설계하지 않고 기존 서버 워크로드를 옮긴다) — 「Examples of when to use VMs」 (phase 103)
- VM을 만들 때 고르는 것은 크기(용도·프로세서 코어 수·RAM 양), 스토리지 디스크, 네트워킹(가상 네트워크·공용 IP 주소·포트 구성)이다. **고르는 설정의 목록이고, 공용 IP 주소가 꼭 있어야 한다는 말이 아니다**(필수 여부는 아래 「Virtual networks and virtual machines in Azure」 항목) — 「VM resources and sizing」 (phase 103)
- vCPU는 가상 CPU다. vCPU 수는 VM이 한꺼번에 해낼 수 있는 계산의 양에, RAM은 VM이 메모리에 올려 두고 일할 수 있는 데이터의 양에 영향을 준다 — 「Understand VM size families and names」 (phase 103)
- 같은 절의 크기 계열 표(B·D·E·F·M·L·N 시리즈)와 크기 이름 읽는 법은 확인만 했다. **쓰지 않는다**(guide 「배경」 — 「크기는 용도와 vCPU 수·메모리로 고른다」까지만) (phase 103)
- VM은 한 대로도 실행하고(테스트·개발·작은 일), 여러 대를 묶어 고가용성·확장성·중복성을 얻기도 한다. Azure는 그 묶음을 확장 집합·가용성 집합 같은 기능으로 관리한다 — 「Scale and resiliency options for VMs」 (phase 103)
- 가상 머신 확장 집합은 같은 구성이고 부하가 분산되는 VM 무리를 만들고 관리하게 한다. 확장 집합이 없으면 VM 구성을 손으로 맞추고, 사용률을 지켜보고, 인스턴스 수를 손으로 바꿔야 한다. 확장 집합은 구성을 한곳에 모으고, 수요나 일정에 따라 저절로 스케일 아웃·스케일 인하며, 부하 분산과 함께 동작해 트래픽을 나눈다 — 「Virtual machine scale sets」 (phase 103)
- 가상 머신 가용성 집합은 한 지역 안에서 VM의 복원력을 높인다 — 유지 관리 한 번이나 하드웨어 고장 하나가 모든 VM에 미칠 가능성을 줄인다. VM을 **업데이트 도메인**(계획된 유지 관리 때 함께 다시 부팅될 수 있는 VM)과 **장애 도메인**(전원이나 네트워크의 고장 지점을 함께 쓰는 VM)으로 나눈다 — 「Virtual machine availability sets」 (phase 103)
- 가용성 집합은 VM 수준의 중복에 쓴다. 가용성 영역을 지원하는 지역에서는 장애를 더 넓게 격리하는 영역 기반 설계를 흔히 더 낫게 본다. 가용성 집합 자체에는 비용이 없고 VM 인스턴스 값만 낸다 — 같은 절 (phase 103)
- 한국어 표기: 단원 제목 「Azure 가상 머신 설명」, Azure Virtual Machines → Azure VM(Virtual Machines), image → 이미지, total control over the OS → OS(운영 체제)에 대한 완전한 제어, custom software → 사용자 지정 소프트웨어, datacenter extension → 데이터 센터 확장, disaster recovery → 재해 복구, lift and shift migration → 리프트 앤 시프트 마이그레이션,
  vCPU → vCPU(가상 CPU), Virtual machine scale sets → 절 제목은 영문 그대로, 본문 「가상 머신 확장 집합」·「확장 집합」, Virtual machine availability sets → 가상 머신 가용성 집합·가용성 집합, update domain → 업데이트 도메인, fault domain → 장애 도메인, availability zones → 가용성 영역 (phase 103)

쓰인 곳(phase 103 step 1): `azure-compute.virtual-machines`(정의·맞는 경우 셋·이미지·쓰임 다섯·크기는 용도와 vCPU·메모리로, vCPU 풀이), `azure-compute.vm-resources`(고르는 설정의 목록), D51

쓰인 곳(phase 103 step 2): `azure-compute.scale-sets`(확장 집합이 없을 때의 일, 구성을 한곳에, 수요·일정에 따른 증감, 부하 분산), `azure-compute.availability-sets`(정의·두 도메인·영역이 더 넓게 격리·비용 없음), az058~az060 해설, G27·G28

쓰인 곳(phase 103 step 4): `HostingOptionsTable`(VM 행)

## (phase 100) Azure Virtual Machines — Virtual machines in Azure
https://learn.microsoft.com/en-us/azure/virtual-machines/overview

확인한 날 2026-10-30, Last updated 2025-12-01. 사본: `docs-virtual-machines-overview.md`.

- Azure VM은 Azure가 내주는 필요할 때 받아 쓰고 늘릴 수 있는 컴퓨팅 리소스의 한 종류다 — 「첫 문단」
- Azure VM은 그 VM을 실행하는 물리 하드웨어를 사서 유지하지 않고도 가상화의 유연성을 준다. 대신 구성·패치·소프트웨어 설치 같은 VM 관리는 쓰는 쪽이 계속 한다 — 「둘째 문단」

쓰인 곳: `azure-cloud-computing.cloud-computing`(가상 머신), `azure-cloud-computing.serverless`(VM과의 차이), D1, G1

다시 확인한 날 2026-10-31. 영문 사본을 다시 받고 `ko-docs-virtual-machines-overview.md`를 새로 받았다(사본의 「Last updated on」 뒤 날짜는 비어 있다). (phase 103)

- 다른 선택지보다 컴퓨팅 환경을 더 많이 통제해야 할 때 흔히 VM을 고른다 — 「첫 문단」 (phase 103)
- VM을 만들면 VM을 받쳐 주는 리소스도 함께 만들어지고, 그 리소스에는 저마다 비용이 붙을 수 있다 — 「Parts of a VM and how they're billed」 (phase 103)
- 그 표의 리소스와 쓰임: 가상 네트워크(VM이 다른 리소스와 통신하게 한다), 가상 네트워크 인터페이스 카드(NIC — 가상 네트워크에 잇는다), 개인 IP 주소와 때로 공용 IP 주소(자기 네트워크와 바깥 네트워크에서 통신하고 데이터를 주고받는다),
  네트워크 보안 그룹(NSG — VM으로 오가는 트래픽을 다룬다. 예: 어떤 포트는 열고 어떤 포트는 막는다), OS 디스크와 경우에 따라 데이터를 둘 디스크 따로, 경우에 따라 운영 체제 라이선스 — 같은 표 (phase 103)
- 데이터는 운영 체제와 다른 디스크에 두는 것이 좋다 — VM이 고장 나면 데이터 디스크를 떼어 새 VM에 붙일 수 있다 — 같은 표 (phase 103)
- 새 VM에는 모두 OS 디스크가 있다(로컬 임시 디스크도 함께 생기지만 이 주제에서는 쓰지 않는다). 데이터 디스크는 「경우에 따라 따로」 둔다 — 같은 표의 비용 칸 (phase 103)
- NIC에는 따로 비용이 없고, 네트워크 보안 그룹에도 추가 요금이 없다. 가상 네트워크·IP 주소·디스크·라이선스는 저마다 가격 쪽을 가리킨다. **그래서 「모든 리소스에 비용이 붙는다」로 쓰지 않고 「비용이 따로 붙을 수 있다」로 쓴다.** 금액은 쓰지 않는다 — 같은 표 (phase 103)
- 이 리소스들은 기본으로 VM과 같은 리소스 그룹에 만들어진다 — 같은 절 마지막 문장 (phase 103)
- 확장 집합의 VM은 여러 가용성 영역에, 한 영역에, 또는 영역을 정하지 않고(지역) 배포할 수 있다 — 「Availability」(같은 절의 99.99% 수치는 쓰지 않는다) (phase 103)
- **이 표는 필수 여부를 말하지 않는다.** 표 제목이 「기본으로 만들어지는 리소스」일 뿐이고, 무엇이 꼭 있어야 하는지는 「Virtual networks and virtual machines in Azure」 항목을 따른다 (phase 103)
- 한국어 표기: virtual network → 가상 네트워크, virtual Network Interface Card (NIC) → 가상 네트워크 인터페이스 카드(NIC), private IP address → **개인 IP 주소**, public IP address → **공용 IP 주소**, Network security group (NSG) → NSG(네트워크 보안 그룹), OS disk → OS 디스크(「운영 체제 디스크」도 섞였다), data disk → 데이터 디스크, resource group → 리소스 그룹 (phase 103)

쓰인 곳(phase 103 step 1): `azure-compute.virtual-machines`(더 많이 통제할 때), `azure-compute.vm-resources`(함께 만들어지는 리소스와 쓰임, 데이터 디스크를 따로 두는 까닭, 비용이 따로 붙을 수 있다, 같은 리소스 그룹), `VmResourcesDiagram`, D51·D57

쓰인 곳(phase 103 step 2): `azure-compute.scale-sets`(영역에 나눠 배포 — 여러 가용성 영역에 걸쳐 만드는 것만 썼다. 한 영역에만 두거나 영역을 정하지 않는 선택지는 쓰지 않았다)

쓰인 곳(phase 103 step 11): `azure-network-protection.network-security-groups`(네트워크 보안 그룹에 추가 요금이 없다)

## (phase 100) Learn 「Describe Azure storage services」 — 4 Describe Azure storage services
https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/4-describe-azure-storage-services

확인한 날 2026-10-30. 사본: `learn-describe-azure-storage-services-4-describe-azure-storage-services.md`와 `ko-` 판.

- Azure Storage는 데이터를 담아 두는 서비스들의 묶음이다 — 글자·이진 데이터를 담는 Blob, 파일 공유를 내주는 Files, VM이 쓰는 블록 단위 저장 공간인 Disks 등 — 「첫 목록」
- 이 단원에 「스토리지」 낱말 하나를 정의하는 문장은 없다. 위 목록이 스토리지를 「데이터(파일 등)를 담아 두는 곳」으로 풀 근거다
- 한국어 표기: storage → 스토리지, Azure Storage → Azure Storage(이름 그대로)
- Azure Storage의 핵심 서비스는 다섯이다 — Blob(글자·이진 데이터를 담는 객체 저장소), Files(클라우드나 온-프레미스에서 쓰는 관리형 파일 공유), Queue(앱 구성 요소 사이의 메시지 저장소), Disk(VM의 블록 수준 볼륨), Table(구조적이고 비관계형인 데이터를 담는 NoSQL 저장소) — 「첫 목록」 (phase 104)
- 이점 가운데 쓸 것: 계정에 쓰는 데이터를 서비스가 모두 암호화한다. 하드웨어 유지 관리·업데이트·심각한 문제 처리를 Azure가 맡는다. 데이터에는 HTTP나 HTTPS로 세계 어디서나 닿는다 — 「Benefits of Azure Storage」 (phase 104)
- Blob의 쓰임: 브라우저에 이미지·문서를 바로 내주기, 분산해서 쓰는 파일 저장, 동영상·오디오 스트리밍, 백업과 복원·재해 복구·보관, 온-프레미스나 Azure의 서비스가 분석할 데이터 저장. 개체에는 URL, REST API, PowerShell, CLI, 클라이언트 라이브러리로 닿는다 — 「Azure Blobs」·「Accessing blob storage」 (phase 104)
- 네 계층의 쓰임과 최소 보관: 핫은 자주 읽는 데이터(예: 웹사이트 이미지), 쿨은 자주 읽지 않고 30일 이상 두는 데이터(예: 고객 송장), 콜드는 자주 읽지 않고 90일 이상 두는 데이터, 보관은 거의 읽지 않고 180일 이상 두며 읽기까지 기다려도 되는 데이터(예: 장기 백업) — 「Blob storage tiers」 (phase 104)
- 핫·쿨·콜드는 계정 수준에서 정할 수 있고 보관은 계정 수준에 없다. 네 계층 모두 Blob 수준에서 올릴 때나 올린 뒤 정한다. 쿨·콜드는 저장 비용이 낮고 읽는 비용이 높다. 보관은 저장 비용이 가장 낮고 리하이드레이션 시간과 읽는 비용이 가장 크다 — 「Considerations for access tiers」 (phase 104)
- Azure Files: SMB나 NFS로 닿는 완전 관리형 파일 공유이고, 클라우드와 온-프레미스가 동시에 탑재할 수 있다. 서버 하드웨어와 운영 체제 패치를 쓰는 쪽이 맡지 않는다. SMB 공유는 Azure File Sync로 Windows Server에 캐시할 수 있다 — 「Azure Files」 (phase 104). **이 단원은 NFS를 Linux·macOS로 적지만 제품 문서는 Linux만 든다 — 제품 문서를 따른다(아래 「What is Azure Files?」)**
- Queue: 비동기로 처리할 메시지를 많이 담는다. Disk: 관리 디스크라고도 하고, Azure VM에 붙이는 블록 수준 볼륨을 Azure가 가상화해 관리한다. Table: 구조적이고 비관계형인 데이터를 담는 NoSQL 저장소다 — 각 절 (phase 104). 메시지 크기 값은 쓰지 않는다(guide 「배경」)
- **쓰지 않는 것**: Data Lake Storage Gen2, 클라이언트 라이브러리의 언어 목록, 쿨·콜드의 가용성 SLA (phase 104, guide 「배경」)
- 한국어 표기: 이 단원 한국어판은 「Azure 블롭스」·「Azure 큐」·「Azure 테이블」·「Azure 디스크」·「리하일레이션」처럼 흔들린다. **제품 문서 한국어판의 이름을 쓴다** — 맨 아래 「한국어 표기 정리 — `azure-storage`」 (phase 104)

쓰인 곳: `azure-cloud-computing.cloud-computing`(스토리지를 푸는 한 줄)
쓰인 곳(phase 104): `azure-storage.storage-services`, `azure-storage.blob-storage`, `azure-storage.access-tiers`, `azure-storage.azure-files`, D65, D66, G41, G42

## (phase 100) Azure security — Isolation in the Azure public cloud
https://learn.microsoft.com/en-us/azure/security/fundamentals/isolation-choices

확인한 날 2026-10-30, Last updated 2026-07-21. 사본: `docs-security-isolation-choices.md`.

- Azure는 앱과 VM을 여러 고객이 함께 쓰는 물리 인프라 위에서 실행한다. 공용 리소스의 비용을 여러 테넌트(고객)가 나눠 지는 것이 클라우드의 경제적 이점이고, 이것을 다중 테넌트(multitenancy)라 한다 — 「첫 문단」
- 여러 테넌트가 같은 인프라를 **동시에** 함께 써서 규모의 경제를 얻는 것이 클라우드 컴퓨팅의 주된 이점 가운데 하나다 — 「Tenant level isolation」
- Azure의 컴퓨팅 플랫폼은 가상화에 바탕을 둔다. 고객의 코드는 모두 가상 머신 안에서 실행되고, 각 물리 서버(노드) 위의 하이퍼바이저가 그 서버를 여러 손님 VM으로 나눈다.
  하이퍼바이저와 호스트 운영 체제가 VM끼리를 서로 떼어 놓는다 — 「Compute isolation」의 「Hyper-V and root OS isolation between root VM and guest VMs」
- (phase 100 step 7이 더한 줄) **테넌트**는 클라우드 서비스의 한 인스턴스를 가지고 관리하는 고객이나 조직이다. Azure의 ID 플랫폼에서는 조직이 Microsoft 클라우드 서비스에 가입할 때 받는 Microsoft Entra ID 인스턴스 하나를 테넌트라고 부르기도 한다 — 「Tenant level isolation」 둘째 문단
- 보안 경계가 테넌트를 논리적으로 떼어 놓아, 어떤 고객도 같은 인프라를 함께 쓰는 다른 테넌트에 고의로든 실수로든 접근하거나 해를 끼치지 못한다. 테넌트 사이의 접근은 테넌트 관리자가 허락할 때만 생긴다 — 「Tenant level isolation」
- 위 두 줄이, 퍼블릭 클라우드를 「누구나 쓸 수 있다」는 말이 「한 고객의 리소스에 다른 고객이 들어올 수 있다」는 뜻이 아니라는 근거다. 「누구나」는 서비스를 사서 쓸 수 있는 사람의 범위이고, 고객마다의 리소스는 서로 떨어져 있다
- 한국어 표기(한국어판 사본 `ko-docs-security-isolation-choices.md`): tenant → 테넌트, multitenancy → 멀티테넌시, multitenant architecture → 멀티테넌트 아키텍처, tenant level isolation → 테넌트 수준 격리, co-tenants → 공동 테넌트

쓰인 곳: `azure-cloud-computing.cloud-computing`([덤프 NO.61] 셋째 진술 — 가상화로 여러 고객에게 동시에 서비스한다 — 를 쓸 근거), 용어집 1-1·1-24·1-40이 이 문서와 맞는다는 확인
쓰인 곳(phase 100 step 7이 더한 줄): `azure-cloud-models.public-cloud`(테넌트 풀이, 멀티테넌시, 고객 사이의 격리 — [덤프 NO.105·365]), `azure-cloud-models.private-cloud`(다른 테넌트와 데이터를 함께 두지 않는다는 대비)

## (phase 100) Azure ExpressRoute — What is Azure ExpressRoute?
https://learn.microsoft.com/en-us/azure/expressroute/expressroute-introduction

확인한 날 2026-10-30, Last updated 2026-08-27. 사본: `docs-expressroute-expressroute-introduction.md`.

- ExpressRoute는 회사 네트워크를 통신 사업자를 거쳐 사설 연결로 Microsoft 클라우드에 잇는다. 이 연결은 공용 인터넷을 지나지 않는다 — 「첫 두 문단」
- 이 주제에서는 ExpressRoute를 쓰지 않는다. 「클라우드를 쓰려면 인터넷 연결이 반드시 있어야 한다」를 단정하지 않을 근거로만 적는다
- 사본 `ko-docs-expressroute-expressroute-introduction.md`도 받았다(확인한 날 2026-10-31) (phase 103)
- 공용 인터넷을 지나지 않아서 보통의 인터넷 연결보다 안정적이고, 빠르고, 대기 시간이 고르고, 보안이 높다 — 「첫 두 문단」 (phase 103)
- 이 문서는 ExpressRoute를 Layer 3 연결이라고 적는다(덤프 NO.119의 답과 같다). **계층은 쓰지 않는다**(guide 「배경」) — 「Key benefits」·「Layer 3 connectivity」 (phase 103)
- BGP는 업계 표준인 동적 라우팅 프로토콜이고, Microsoft는 이것으로 온-프레미스 네트워크·Azure의 인스턴스·Microsoft 공용 주소 사이의 경로를 주고받는다 — 「Layer 3 connectivity」 (phase 103)
- 회로 하나는 Microsoft 쪽 에지 라우터 둘로 가는 연결 둘로 되어 있고, 연결 공급자도 중복된 장치를 쓴다. 가장 높은 복원력에는 두 피어링 위치에 회로 둘을 권장한다 — 「Redundancy」·「Resiliency」 (phase 103)
- 닿는 곳은 Azure 서비스와 Microsoft 365 서비스다. **다만 Microsoft 365는 인터넷으로 쓰도록 만들어졌다며 ExpressRoute를 특정 상황에만 권한다.** 그래서 「Microsoft 365에도 닿을 수 있다」까지 쓰고, 권하는 것처럼 쓰지 않는다 — 「Connectivity to Microsoft cloud services」 (phase 103)
- 이 문서는 모든 지역으로 넓히는 연결을 premium add-on이 맡는다고 하고, Learn 단원 4는 같은 줄을 Global Reach로 적는다. **Global Reach는 Learn 단원 4의 「온-프레미스 사이트끼리」 뜻으로만 쓴다**(요금제 이름 premium은 쓰지 않는다) — 「Key benefits」 (phase 103)
- 한국어 표기: ExpressRoute(옮기지 않는다), ExpressRoute 회로, 연결 공급자, 프라이빗 연결 (phase 103)
- 피어링 위치 하나로 이으면 같은 지정학적 지역 안의 지역들에 닿는다. 이 문서의 예는 암스테르담에서 이어 북유럽·서유럽에 닿는 것이다. **지정학적 지역을 「유럽처럼 지역 여럿을 넓게 묶은 범위」로 푸는 근거로 쓴다** — 「Connectivity to all regions within a geopolitical region」 (phase 103)

쓰인 곳: D7
쓰인 곳(phase 103 step 9): `azure-virtual-networking.expressroute`(프라이빗 연결, 공용 인터넷을 지나지 않아 생기는 이점, BGP, 회로 안의 연결 둘, Microsoft 365에도 닿는다, 지정학적 지역을 푸는 한 줄), `ExpressRouteDiagram`, az076·az077 해설

## (phase 100) Cloud Adoption Framework — Cost efficiency (Shift from a CapEx model to an OpEx model)
https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/strategy/inform/cost-efficiency

확인한 날 2026-10-30, Last updated 2026-03-02. 사본: `docs-caf-strategy-inform-cost-efficiency.md`. (옛 주소 `…/strategy/business-outcomes/fiscal-outcomes`가 이 문서로 넘어온다.)

- 예전부터 조직은 IT 예산을 자본 지출 모델로 꾸렸다. 하드웨어와 장비에 큰돈을 미리 들이고, 그 투자를 자산으로 장부에 올린다 — 「Shift from a CapEx model to an OpEx model」 첫 문단
- 클라우드로 옮기면 IT 지출이 운영 지출 모델로 옮겨 간다. 운영 지출은 Azure 같은 서비스에 주기적으로 내는 돈처럼 계속 드는 운영 비용이고, 요금은 정해진 장비 값이 아니라 실제 사용량을 따른다 — 같은 절 둘째 문단
- 운영 지출로 옮길 때 감가상각 대신 바로 받는 세금 공제, 회계 방식의 변화 같은 것을 검토하라고 권한다 — 같은 절 목록. **이 주제에서는 쓰지 않는다**(회계 세부, `corrections.md` G7·G8)

쓰인 곳: `azure-cloud-computing.capex-opex`, D2·D4, G7·G8

## (phase 100) Azure 클라우드 컴퓨팅 사전 — What is cloud computing?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-cloud-computing

확인한 날 2026-10-30. 사본: `azure-dictionary-what-is-cloud-computing.md`.

- 클라우드로 옮기면 하드웨어·소프트웨어를 사고 사내 데이터 센터를 세워 운영하는 데 드는 돈이 사라진다고 말하면서, 그 돈에 서버 랙, 전원·냉각에 드는 상시 전기, 인프라를 관리하는 IT 전문가를 함께 묶어
  「capital expense」라고 부른다 — 「Cost」 문단
- 이 문단은 데이터 센터를 짓고 운영하는 돈을 통틀어 부르는 소개 글이라, 전기료와 인건비를 자본 지출로 **분류하는 근거로 쓰지 않는다**. Learn 단원 6의 정의(미리 쓰는 물리 인프라 대 시간에 걸친 서비스 지출)와도 기준이 다르다.
  이 사전과 덤프가 전기료·인건비를 서로 다르게 다루는 것을 보여 주는 자료로만 적는다
- 이 사전은 클라우드를 쓰는 흔한 이유 일곱을 든다(Cost, Speed, Global scale, Productivity, Performance, Reliability, Security). 「Speed」는 서비스가 셀프서비스·주문형이라 많은 리소스도 몇 분 만에 마련된다는 것,
  「Global scale」은 탄력적으로 크기를 조정할 수 있다는 것 — 필요한 만큼의 IT 리소스를 필요한 때에 알맞은 지리적 위치에서 내준다는 것 — 이다. 「Performance」는 세계에 퍼진 데이터 센터 덕분에 앱의 네트워크 대기 시간이 준다는 것,
  「Reliability」는 공급자 네트워크의 여러 중복 사이트에 데이터를 복제해 둘 수 있어 백업·재해 복구·비즈니스 연속성이 쉬워지고 싸진다는 것이다 — 「Top benefits of cloud computing」 (phase 101)
- 이 일곱은 Learn 「Describe the benefits of using cloud services」가 쓰는 이점의 이름·묶음(고가용성·확장성·안정성·예측 가능성·보안과 거버넌스·관리 효율성)과 다르다. `azure-cloud-benefits` 주제의 개념은 Learn 단원의 묶음을 따르고,
  이 문단은 덤프가 묻는 탄력성·지리적 위치·재해 복구가 공식 문서에 어떻게 나오는지 보여 주는 자료로만 적는다 (phase 101)

쓰인 곳: D4, G6

쓰일 곳(phase 101): D19, D20

## (phase 100) Azure 가격 — Build in the cloud with an Azure account (Pay as you go 절)
https://azure.microsoft.com/en-us/pricing/purchase-options/azure-account

확인한 날 2026-10-30. 사본: `azure-pricing-purchase-options-azure-account.md`. (`…/pricing/purchase-options/pay-as-you-go`가 이 페이지로 넘어온다.)

- 종량제로 쓰면 미리 약속하는 것이 없고 언제든 그만둘 수 있다 — 「Pay as you go」
- 종량제에서는 쓴 것에 대해서만 낸다 — 「Pay only for what you use」

쓰인 곳: `azure-cloud-computing.pay-as-you-go`, `PricingModelsTable`(종량제 행의 「미리 약속하는 것」)

## (phase 100) Learn 「Describe cost management in Azure」 — 2 Describe factors that can affect costs in Azure
https://learn.microsoft.com/en-us/training/modules/describe-cost-management-azure/2-describe-factors-affect-costs-azure

확인한 날 2026-10-30. 사본: `learn-describe-cost-management-azure-2-describe-factors-affect-costs-azure.md`와 `ko-` 판.

- Azure에서는 자기 인프라를 사서 유지하는 대신 IT 리소스를 쓰는 대로 낸다. 필요한 것을 빌리고 다 쓰면 놓아주므로 비용이 실제 사용량을 따라간다 — 「첫 문단」
- 리소스를 갖추면 Azure가 리소스마다 쓴 양을 재고 그 양에 따라 요금을 매긴다 — 「Resource type」
- **종량제**는 한 청구 주기 동안 쓴 리소스에 대해 내는 결제 모델이다. 이번 주기에 많이 쓰면 많이 내고 적게 쓰면 적게 낸다 — 「Consumption」 첫 문단
- 쓰는 양을 예측할 수 있는 작업에는 할인 방식이 있다. **예약**은 특정 리소스를 1년이나 3년 동안 쓰겠다고 약정해 비용을 줄이고, VM·데이터베이스·스토리지 같은 서비스에 쓸 수 있다 — 「Consumption」 둘째 문단
- 컴퓨팅용 **절약 플랜(savings plan for compute)** 도 있다 — VM 종류를 정하지 않고 1년이나 3년 동안 시간당 쓸 금액을 약정한다 — 「Consumption」 셋째 문단. **이 주제의 개념에는 넣지 않았다**(phase 100 개념 표에 없다)
- 일괄 데이터 처리처럼 중간에 멈춰도 되는 작업에는 **Azure 스폿 가상 머신**이 비용을 더 줄인다 — 쓰이지 않는 Azure 용량을 낮은 가격에 쓰지만, Azure가 그 용량을 다시 필요로 하면 작업이 내보내진다 — 「Consumption」 넷째 문단
- 대역폭(Azure 데이터 센터를 드나드는 데이터)은 들어오는 전송 일부가 무료이고, 나가는 전송은 지역을 묶은 청구 영역에 따라 값이 매겨진다 — 「Network traffic」. 그래서 「VM을 드나드는 모든 데이터에 고정 요금」은 틀린 말이다([덤프 NO.10·387] 첫 진술의 「아니요」와 맞는다)
- 한국어 표기: 단원은 「소비 기반 접근 방식」, pay-as-you-go → 종량제, Reservations → 예약, savings plan for compute → 컴퓨팅에 대한 Azure 절감 계획, Azure Spot Virtual Machines → Azure Spot Virtual Machines(이름 그대로), billing cycle → 청구 주기

쓰인 곳: `azure-cloud-computing.consumption-based-model`, `azure-cloud-computing.pay-as-you-go`, `azure-cloud-computing.reservations`, `azure-cloud-computing.spot-vm`, `PricingModelsTable`, D10, G2

## (phase 100) Cost Management — Review your individual Azure subscription bill
https://learn.microsoft.com/en-us/azure/cost-management-billing/understand/review-individual-bill

확인한 날 2026-10-30, Last updated 2026-04-29. 사본: `docs-cost-management-review-individual-bill.md`.

- 종량제 구독은 청구 기간마다 청구서를 받는다 — 「첫 문단」. 청구 기간이 한 달인지는 이 문서가 말하지 않는다(무료 계정에 「매달 주는 크레딧」이라는 말만 있다)

쓰인 곳: D10

## (phase 100) Azure Reservations — What are Azure Reservations?
https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations

확인한 날 2026-10-30, Last updated 2026-07-17. 사본: `docs-reservations-save-compute-costs-reservations.md`, `ko-docs-reservations-save-compute-costs-reservations.md`.

- Azure 예약은 여러 제품을 **1년이나 3년** 동안 쓰겠다고 약정해 비용을 줄이는 방식이다. 약정하면 쓰는 리소스에 할인을 받고, 할인은 종량제 가격과 견준다 — 「첫 문단」. 할인 폭의 수치는 이 과목에서 쓰지 않는다(guide 「예시 값」)
- 예약은 **청구 금액만 깎는 할인**이고 리소스가 실행되는 상태에는 영향을 주지 않는다. 사고 나면 조건이 맞는 리소스에 할인이 **저절로** 붙는다 — 「첫 문단」
- 예약 금액은 미리 한꺼번에 내거나 달마다 낼 수 있다. 두 방식의 **총액은 같고**, 달마다 내도 웃돈이 붙지 않는다 — 「둘째 문단」
- 같은 리소스를 꾸준히 쓰는 경우에 예약을 사면 비용을 줄일 수 있다. 예약 없이 계속 실행하면 종량제 요금이 붙고, 예약을 사면 그 리소스에 종량제 대신 할인된 요금이 붙는다 — 「Why buy a reservation?」
- 할인은 예약을 살 때 고른 속성(SKU — 상품의 종류, 지역, 범위)과 맞는 사용량에 붙는다 — 「How reservation discount is applied」. Azure Databricks를 뺀 모든 예약은 시간 단위로 적용된다 — 「Determine what to purchase」
- 필요 없어진 예약은 같은 종류의 예약으로 바꾸거나 정해진 한도 안에서 환불받을 수 있다 — 「Flexibility with Azure reservations」(한도 금액은 쓰지 않는다)
- VM 예약은 VM의 컴퓨팅 요금만 덮고, 소프트웨어·Windows 라이선스·네트워킹·스토리지 요금은 덮지 않는다 — 「Charges covered by reservation」
- 한국어 표기: Azure Reservations → **Azure 예약**, pay-as-you-go prices → 종량제 가격, billing discount → 청구 할인, up front / monthly → 선결제·선불 / 매달·월별

쓰인 곳: `azure-cloud-computing.reservations`, `PricingModelsTable`(예약 행), D5, G3

## (phase 100) Cost Management — How the Azure reservation discount is applied to virtual machines
https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/understand-vm-reservation-charges

확인한 날 2026-10-30, Last updated 2026-07-17. 사본: `docs-cost-management-understand-vm-reservation-charges.md`.

- 예약 VM 인스턴스를 사면 예약의 속성·수량과 맞는 VM에 할인이 저절로 붙는다. 예약은 VM의 컴퓨팅 비용을 덮는다 — 「첫 문단」
- **Azure는 스폿 VM에는 예약을 내주지 않는다** — 「Note」
- 예약 할인은 **쓰지 않으면 사라진다**(use-it-or-lose-it). 어느 한 시간 동안 조건이 맞는 리소스가 없으면 그 시간의 예약분을 잃고, 쓰지 않은 예약 시간을 다음으로 넘길 수 없다 — 「How reservation discount is applied」
- 할인은 실행 중인 VM에 시간 단위로 붙는다. 한 시간을 채우지 못하면 그 시간의 예약은 덜 쓰인 것이 된다 — 「Reservation discount for non-Windows VMs」
- 한국어 표기: 아래 「Save costs with Azure Reserved VM Instances」 항목

쓰인 곳: `azure-cloud-computing.reservations`, `PricingModelsTable`(스폿 행 — 예약을 붙일 수 없다)

## (phase 100) Azure Virtual Machines — Save costs with Azure Reserved VM Instances
https://learn.microsoft.com/en-us/azure/virtual-machines/prepay-reserved-vm-instances

확인한 날 2026-10-30, Last updated 2026-05-05. 사본: `docs-virtual-machines-prepay-reserved-vm-instances.md`, `ko-docs-virtual-machines-prepay-reserved-vm-instances.md`.

- 예약 VM 인스턴스의 할인은 범위·속성이 맞는 실행 중인 VM에 저절로 붙는다. 할인을 받으려고 예약을 특정 VM에 따로 붙일 필요가 없다 — 「첫 문단」
- 예약 VM 인스턴스는 **청구 할인만** 준다. 컴퓨팅 용량을 잡아 두거나 보장하지 않는다 — 「둘째 문단」
- 한국어 표기: 제목은 **Azure 예약된 VM 인스턴스**, 본문은 **예약 VM 인스턴스**, reserved instance → 예약 인스턴스

쓰인 곳: `azure-cloud-computing.reservations`, G3

## (phase 100) Azure Virtual Machines — Azure Spot Virtual Machines
https://learn.microsoft.com/en-us/azure/virtual-machines/spot-vms

확인한 날 2026-10-30, Last updated 2026-02-06. 사본: `docs-virtual-machines-spot-vms.md`, `ko-docs-virtual-machines-spot-vms.md`.

- Azure 스폿 가상 머신은 Azure의 **쓰이지 않는 용량**을 크게 줄어든 비용으로 쓰게 한다. Azure가 그 용량을 다시 필요로 하면 언제든 Azure 인프라가 스폿 VM을 **회수(evict)** 한다.
  그래서 일괄 처리 작업, 개발·테스트 환경, 큰 계산 작업처럼 **중단을 견딜 수 있는 작업**에 맞다 — 「첫 문단」
- 쓸 수 있는 용량은 VM 크기·지역·시간대 등에 따라 달라진다. 용량이 있으면 VM을 내주지만 **스폿 VM에는 SLA가 없고** 고가용성도 보장하지 않는다. 회수할 때는 **30초** 전에 알린다 — 「둘째 문단」
- 스폿 VM은 Azure가 다른 종량제 작업에 용량이 필요할 때나, 스폿 가격이 쓰는 쪽이 정한 **최고 가격**을 넘을 때 멈춰질 수 있다 — 「Eviction policy」 첫 문단
- 회수 정책은 **할당 해제**(기본값 — VM을 중지·할당 해제 상태로 두어 나중에 다시 배포할 수 있지만 성공은 보장하지 않고, 디스크 스토리지 요금은 계속 붙는다)와 **삭제**(디스크까지 지워 스토리지 요금도 멈춘다) 가운데 고른다 — 「Eviction policy」
- 최고 가격을 -1로 두면 가격 때문에는 회수되지 않고, 표준 VM 가격보다 많이 내지 않는다 — 「Eviction policy」 표, 「Pricing」
- 스폿 VM의 가격은 지역과 VM 종류(SKU)에 따라 달라진다 — 「Pricing」
- 한국어 표기: Azure Spot Virtual Machines → **Azure 스폿 가상 머신**(제목), 본문 일부는 영문 이름 그대로. evict / eviction → **제거**, eviction policy → 제거 정책, Deallocate → 할당 취소, Delete → 삭제,
  unused capacity → 사용되지 않은 용량, batch processing jobs → 일괄 처리 작업, dev/test → 개발/테스트
  (한국어판은 「할당 취소된 VM은 할당량에 계산되지 않는다」고 쓰지만 영문판은 계산된다고 쓴다 — 기계 번역의 오류이고, 이 주제에서는 쓰지 않는다)

쓰인 곳: `azure-cloud-computing.spot-vm`, `PricingModelsTable`(스폿 행), G4

## (phase 100) Azure 제품 — Azure Spot Virtual Machines
https://azure.microsoft.com/en-us/products/virtual-machines/spot

확인한 날 2026-10-30. 사본: `azure-products-virtual-machines-spot.md`.

- 스폿 VM은 쓰이지 않는 Azure 컴퓨팅 용량을 종량제 가격보다 크게 할인해 쓴다(할인 폭의 수치는 이 과목에서 쓰지 않는다). 최고 가격은 미리 정해 둘 수 있고 정하지 않아도 된다 — 「Buy unused Azure compute capacity at deep discounts」
- 중단돼도 되고 정해진 시간 안에 끝내지 않아도 되는 앱에만 쓰라고 한다. 예로 개발·테스트 환경, 일괄 처리 작업, 렌더링을 든다 — 같은 절의 셋째 항목

쓰인 곳: `azure-cloud-computing.spot-vm`, `PricingModelsTable`(스폿 행), G4

## (phase 100) Learn 「Describe the benefits of using cloud services」 — 2 Describe the benefits of high availability and scalability in the cloud
https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/2-high-availability-scalability-cloud

확인한 날 2026-10-30. 사본: `learn-describe-benefits-use-cloud-services-2-high-availability-scalability-cloud.md`와 `ko-` 판.

- Azure는 서비스마다 가동 시간(서비스가 멈추지 않고 돌아가는 시간)을 보장하고, 이 보장이 **서비스 수준 계약(SLA)** 에 담긴다 — 「High availability」
- 한국어 표기: service-level agreement → **SLA(서비스 수준 계약)**, uptime → 가동 시간
- 앱이나 서비스, IT 리소스를 배포할 때는 필요한 때 그 리소스를 쓸 수 있어야 한다. **고가용성**은 어떤 중단이나 사건이 생기든 가용성을 가장 높게 지키는 데 초점을 둔다 — 「High availability」 첫 문단 (phase 101)
- 솔루션을 설계할 때는 서비스마다의 가용성 보장을 따져야 한다. Azure의 가동 시간 보장은 서비스에 따라 다르다 — 「High availability」 둘째 문단 (phase 101)
- **확장성**은 수요에 맞춰 리소스를 조정하는 능력이다. 갑자기 트래픽이 몰려 시스템이 버거우면 리소스를 더해 늘어난 수요를 받아 낸다. 클라우드는 쓴 만큼 내는 사용량 기반 모델이라, 수요가 줄면 리소스를 줄여 비용도 줄일 수 있다 — 「Scalability」 첫·둘째 문단 (phase 101)
- 크기 조정은 흔히 두 가지다. 수직은 리소스 하나의 능력을 올리거나 내리는 것이고, 수평은 리소스의 개수를 더하거나 빼는 것이다 — 「Scalability」 셋째 문단 (phase 101)
- 수직 크기 조정의 예: 앱에 처리 능력이 더 필요하면 VM에 CPU나 RAM을 더해 **스케일 업**하고, 필요를 너무 높게 잡았으면 CPU·RAM 사양을 낮춰 **스케일 다운**한다 — 「Vertical scaling」 (phase 101)
- 수평 크기 조정의 예: 수요가 크게 뛰면 VM이나 컨테이너를 더 두어 **스케일 아웃**하고, 크게 줄면 배포한 리소스를 **스케일 인**한다. 둘 다 자동으로도 수동으로도 할 수 있다 — 「Horizontal scaling」 (phase 101)
- 한국어 표기(phase 101): high availability → 고가용성, scalability → 확장성(절 제목. 본문은 「스케일링 성능」이라고도 쓴다), vertical/horizontal scaling → 수직 크기 조정 / 수평 크기 조정(절 제목. 본문은 「수직 스케일링」·「수평 스케일링」),
  scale up/down/out → 스케일 업 / 스케일링 다운 / 스케일 아웃. 한국어판은 scale in을 「확장」으로 잘못 옮겼다(줄이는 쪽인데 늘리는 말이 됐다) — 이 말은 쓰지 않는다

쓰인 곳: `azure-cloud-computing.spot-vm`(SLA를 푸는 한 줄)

쓰인 곳(phase 101): `azure-cloud-benefits.high-availability`(고가용성의 정의, SLA·가동 시간을 푸는 한 줄), `azure-cloud-benefits.scalability`(소개 문단과 수직·수평 크기 조정 두 항목), `CloudScalingDiagram`(수직: VM 한 대에 CPU·RAM을 더함 / 수평: VM을 더함), D17, G10, G11

쓰인 곳(phase 101 step 4): `azure-sla-lifecycle.sla`(Azure의 가동 시간 보장은 서비스마다 다르고 SLA에 담긴다 — 서비스마다 SLA가 따로 있다는 문단)

쓰인 곳(phase 103 step 2): `azure-compute.availability-sets`(고가용성을 푸는 한 줄 — 장애가 나도 서비스를 쓸 수 있는 시간을 가장 길게 지키는 것)

## (phase 100) Learn 「Describe Azure compute services」 — 6 Describe Azure Functions
https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/6-functions

확인한 날 2026-10-30. 사본: `learn-describe-azure-compute-networking-services-6-functions.md`, `ko-learn-describe-azure-compute-networking-services-6-functions.md`.

- **Azure Functions는 이벤트에 따라 실행되는 서버리스 컴퓨팅 방식**이고, 가상 머신이나 컨테이너를 유지할 필요가 없다 — 「첫 문단」
- VM이나 컨테이너로 만든 앱은 그 리소스가 계속 「실행 중」이어야 동작한다. Functions에서는 이벤트가 함수를 깨우므로 이벤트가 없는 동안 리소스를 갖춰 둘 필요가 없다 — 「첫 문단」
- 서비스를 돌리는 코드만 신경 쓰고 밑바탕 플랫폼·인프라는 신경 쓰고 싶지 않을 때 맞다. 이벤트(흔히 REST 요청), 타이머, 다른 Azure 서비스가 보낸 메시지에 응답해 몇 초 안에 끝나는 일을 할 때 주로 쓴다 — 「Benefits of Azure Functions」
- 수요에 따라 저절로 늘고 줄어 수요가 들쭉날쭉할 때 맞다 — 같은 절
- 코드는 트리거될 때 실행되고, 함수가 끝나면 리소스를 저절로 할당 해제한다. **함수가 실행되는 동안 쓴 CPU 시간에 대해서만** 요금을 매긴다 — 같은 절
- 「Serverless computing in Azure」 절은 제목뿐이고 본문이 없다(페이지 HTML로 확인했다)
- 한국어 표기: 단원 제목 「Azure 함수 설명」, 본문은 **Azure Functions**(이름 그대로), serverless compute → **서버리스 컴퓨팅**, event-driven → 이벤트 기반, trigger → 트리거

쓰인 곳: `azure-cloud-computing.serverless`, D1, G5

다시 확인한 날 2026-10-31. 영문·`ko-` 사본을 다시 받았다 — 본문은 phase 100 때와 같다. (phase 103)

- 함수는 상태 비저장(기본)이거나 상태 저장이다. 상태 비저장이면 이벤트에 응답할 때마다 처음부터 다시 시작하는 것처럼 동작하고, 상태 저장(**Durable Functions**)이면 런타임이 함수에 맥락을 넘겨 앞의 활동을 추적한다 — 「Benefits of Azure Functions」 (phase 103)
- Functions는 어떤 코드든 실행하는 일반 컴퓨팅 플랫폼이기도 하다. 앱의 요구가 바뀌면 프로젝트를 서버리스가 아닌 환경에 배포할 수 있고, 그러면 크기 조정을 직접 다루고 가상 네트워크에서 실행하고 함수를 완전히 격리할 수도 있다 — 같은 절 (phase 103)
- **「CPU 시간에만 요금」은 이 단원의 한 줄이다.** 아래 「Azure Functions hosting options」의 「Billing」은 요금제마다 다르게 청구한다고 한다 — 서버리스 요금제(Flex Consumption·Consumption)에서는 실행할 때 쓴 만큼 내지만, Premium은 늘 한 인스턴스 이상을 데워 두어 그 값을 내고, Dedicated는 App Service 요금제 값을 낸다.
  그래서 요금은 **「서버리스 요금제에서는」으로 한정해** 「실행되는 동안 쓴 만큼 낸다」로 쓴다. 「CPU 시간에만」을 모든 Functions에 일반화하지 않는다 — 같은 절과 호스팅 옵션 「Billing」 대조 (phase 103)
- 한국어 표기: stateless → 상태 비저장, stateful → 상태 저장, Durable Functions(옮기지 않는다), REST request → REST 요청, timer → 타이머, trigger → 트리거(「트리거될 때」) (phase 103)

쓰인 곳(phase 103 step 4): `azure-compute.functions`(트리거의 종류 셋·몇 초 안의 일·저절로 늘어남·끝나면 리소스를 놓음·서버리스 요금제로 한정한 요금·상태 비저장과 Durable Functions·서버리스가 아닌 환경으로 옮김), `FunctionTriggerDiagram`, `HostingOptionsTable`(Functions 행), D53·D55·G30

## (phase 100) Azure Functions — What is Azure Functions?
https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview

확인한 날 2026-10-30, Last updated 2026-09-21. 사본: `docs-azure-functions-functions-overview.md`, `ko-docs-azure-functions-functions-overview.md`.

- Azure Functions는 서버리스 솔루션이다. 서버를 배포하고 유지하는 대신 클라우드 인프라가 앱을 계속 실행하는 데 필요한 리소스를 내준다 — 「첫 문단」
- 쓰는 쪽은 코드에 집중하고 나머지는 Functions가 맡는다 — 「둘째 문단」
- 이벤트에 반응하는 트리거로 다른 서비스와 이어진다. 예: Blob 스토리지에 파일이 올라오면 코드 실행, 정해 둔 시각마다 작업 실행 — 「Scenarios」
- 한국어 표기: serverless solution → 서버리스 솔루션

쓰인 곳: `azure-cloud-computing.serverless`, D1

다시 확인한 날 2026-10-31. 영문 사본을 다시 받았다. (phase 103)

- 트리거와 바인딩이 함수를 다른 서비스에 이어 준다. 예: HTTP 트리거로 웹 앱이 부를 REST 끝점을 만들고, Durable Functions로 함수 여러 개를 이어 이벤트 기반 워크플로를 만든다 — 「Scenarios」 (phase 103)

쓰인 곳(phase 103 step 4): `azure-compute.functions`(이벤트의 흔한 예인 REST 요청, Durable Functions), `FunctionTriggerDiagram`

## (phase 100) Azure Functions — Azure Functions hosting options
https://learn.microsoft.com/en-us/azure/azure-functions/functions-scale

확인한 날 2026-10-30, Last updated 2026-09-16. 사본: `docs-azure-functions-functions-scale.md`, `ko-docs-azure-functions-functions-scale.md`.

- **Flex Consumption 요금제**는 이벤트에 따라 빠르게 늘고 서버리스 종량제로 청구한다. 함수가 실제로 실행될 때만 내는 서버리스 호스팅이 필요할 때 고른다 — 「Overview of plans」
- **Consumption 요금제**는 옛 요금제(legacy)다. 함수가 실행될 때만 컴퓨팅 리소스에 내고, 새 앱은 Flex Consumption을 쓰라고 한다 — 같은 절
- 함수 앱을 Linux의 Consumption 요금제에 두는 방식은 **2028-09-30에 지원이 끝난다**(예고). 그 전에 Flex Consumption으로 옮기라고 한다 — 「Operating system support」 아래 알림
- Consumption 요금제는 실행 횟수·실행 시간·메모리로, Flex Consumption은 실행 횟수와 실행 중인 인스턴스의 메모리(와 늘 준비해 둔 인스턴스)로 청구한다 — 「Billing」
- 쓰지 않으면 0개까지 줄어들 수 있다(그래서 처음 요청이 늦을 수 있다) — 「Cold start behavior」
- Premium 요금제는 미리 데워 둔 인스턴스로 늘리고, Dedicated 요금제는 App Service 요금제에서 비용과 규모를 예측할 수 있게 실행한다. 이 문서가 「서버리스 청구」라고 부르는 것은 Flex Consumption과 Consumption이다 — 「Overview of plans」.
  (Learn 「Describe Azure Functions」도 앱의 요구가 바뀌면 서버리스가 아닌 환경에 배포할 수 있다고 한다.) **이 주제에서는 요금제 이름을 늘어놓지 않는다**
- 한국어 표기: Flex Consumption plan → Flex 소비 계획, Consumption plan → 소비 계획(「사용량 계획」·「사용량 플랜」도 섞여 있다)

쓰인 곳: `azure-cloud-computing.serverless`(「실행한 만큼 낸다」의 근거 — 서버리스 요금제에서)

다시 확인한 날 2026-10-31. 영문 사본의 「Billing」을 다시 읽었다. (phase 103)

- Premium 요금제는 필요한 인스턴스와 미리 데워 둔 인스턴스의 코어 초·메모리로 청구하고, **요금제마다 적어도 한 인스턴스를 늘 데워 둔다**. Dedicated 요금제는 같은 App Service 요금제의 웹 앱과 똑같이 낸다. Flex Consumption은 늘 준비해 둔 인스턴스를 두면 그 값도 낸다 — 「Billing」
  그래서 「이벤트가 없으면 요금이 없다」는 서버리스 요금제(그것도 늘 준비해 둔 인스턴스를 두지 않을 때)에만 맞다. 도식·표에서 Functions의 요금을 그릴 때는 「서버리스 요금제에서」라는 한정을 같이 쓴다 (phase 103)

쓰인 곳(phase 103 step 4): `azure-compute.functions`(요금의 한정), `FunctionTriggerDiagram`(이벤트가 없을 때의 요금 캡션 — 곁말에는 쓰지 않았다), G30. `HostingOptionsTable`에는 요금을 쓰지 않았다

## (phase 100) Azure Virtual Machines — States and billing status of Azure Virtual Machines
https://learn.microsoft.com/en-us/azure/virtual-machines/states-billing

확인한 날 2026-10-30, Last updated 2024-08-22. 사본: `docs-virtual-machines-states-billing.md`.

- VM은 시작 중·실행 중·중지 중·중지됨(할당된 채) 상태에서 요금이 붙는다. 할당 해제되어 밑바탕 하드웨어를 놓은 상태에서는 VM 요금이 붙지 않는다 — 「Power states and billing」 표
- 할당 해제된 뒤에도 디스크·네트워킹 같은 일부 리소스에는 요금이 계속 붙는다 — 같은 표 아래 별표

쓰인 곳: `azure-cloud-computing.serverless`(VM과의 차이 — VM은 실행·할당된 동안 요금이 붙는다), G2

## (phase 100) Azure 클라우드 컴퓨팅 사전 — What is serverless computing?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-serverless-computing

확인한 날 2026-10-30. 사본: `azure-dictionary-what-is-serverless-computing.md`.

- 서버리스 컴퓨팅은 서버를 관리할 필요를 없애는 클라우드 실행 방식이다. 인프라·규모 조정·유지 보수는 공급자가 맡고 개발자는 코드를 쓴다 — 「Serverless computing definition」
- 서버리스에서도 **코드는 서버에서 실행된다**. 인프라를 갖추고 관리하는 일이 개발자에게 보이지 않을 뿐이다 — 「How does serverless computing work?」 둘째 문단
- 서버를 갖추는 대신 이벤트에 반응해 실행되는 코드를 배포한다. 함수는 트리거될 때만 실행되어 리소스를 필요할 때만 쓴다 — 같은 절
- 미리 잡아 둔 서버 용량이 아니라 실제 실행 횟수와 계산 시간에 대해 낸다 — 「Five serverless computing benefits」
- 같은 페이지가 「서버리스 서비스의 예로 IaaS·PaaS·SaaS를 든다」는 문장을 싣고 있는데, Learn 단원(VM은 IaaS이고 운영 체제를 쓰는 쪽이 관리한다)과 맞지 않는다. **이 문장은 쓰지 않는다**

쓰인 곳: `azure-cloud-computing.serverless`

---

## (phase 100) 한국어 표기 정리 — `azure-cloud-computing`

위 항목의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다. Microsoft 한국어 문서의 표기를 따르고(guide 「배경」), 한국어판 사이에 표기가 갈리면 그 근거를 적는다.

| 영문 | 쓸 이름 | 근거 |
|---|---|---|
| cloud computing | 클라우드 컴퓨팅 | Learn 단원 3 한국어판 |
| capital expenditure (CapEx) / operational expenditure (OpEx) | 자본 지출(CapEx) / 운영 지출(OpEx) | Learn 단원 6 한국어판 「CapEx(자본 지출)」·「운영 지출(OpEx)」. 요약 단원은 「자본 비용·운영 비용」이라고도 쓴다 |
| consumption-based model | **사용량 기반 모델** | 학습 가이드·모듈 학습 목표·단원 6 제목이 모두 「사용량 기반 모델」이다. 단원 6 본문과 다른 단원 본문은 「소비 기반 모델」이라고 쓴다 — 본문에서 한 번 「소비 기반 모델이라고도 옮긴다」고 밝혀도 된다 |
| pay-as-you-go | 종량제 | Learn 단원 6·비용 요인 단원·Azure 예약 한국어판 |
| Azure Reservations | Azure 예약 | Azure 예약 문서 한국어판 제목. VM 상품은 「예약 VM 인스턴스」(본문) |
| Azure Spot Virtual Machines | Azure 스폿 가상 머신 | Spot VM 문서 한국어판 제목. eviction은 「제거」로 옮기지만, 처음 배우는 사람에게는 「회수」가 뜻을 더 잘 전한다 — 개념 글에서는 「회수(제거, eviction)」처럼 한 번 같이 적는 것을 권한다 |
| serverless | 서버리스 | 학습 가이드·Functions 단원 한국어판 |
| Azure Functions | Azure Functions | Functions 단원·문서 한국어판(이름 그대로) |
| service-level agreement | SLA(서비스 수준 계약) | 고가용성 단원 한국어판 |
| datacenter / virtual machine / storage / resource | 데이터 센터 / 가상 머신(VM) / 스토리지 / 리소스 | 물리 인프라·VM·스토리지·관리 인프라 단원 한국어판 |

---

## (phase 100) Learn 「Describe cloud computing」 — 4 Describe the shared responsibility model
https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/4-describe-shared-responsibility-model

확인한 날 2026-10-30. 사본: `learn-describe-cloud-compute-4-describe-shared-responsibility-model.md`와 `ko-` 판. (공동 책임 모델 자체는 `azure-service-types` 주제가 쓴다. 여기서는 `azure-cloud-models`가 쓸 줄만 적는다.)

- 기존의 **온-프레미스 데이터 센터**에서는 조직의 팀이 물리적 공간을 관리하고 보안을 지키며, 문제가 생기면 서버를 고치거나 바꾼다. 데이터 센터를 계속 운영하는 데 드는 인프라와 소프트웨어도 IT 부서가 모두 관리한다 — 「How responsibilities shift in cloud」 첫 문단
- 온-프레미스 데이터 센터에서는 조직이 모든 것을 맡는다 — 같은 절 다섯째 문단
- 클라우드에서는 물리적 보안·전원·냉각·네트워크 연결을 공급자가 맡는다. 쓰는 쪽이 그 데이터 센터에 함께 있지 않기 때문이다 — 같은 절 둘째 문단
- 공급자가 늘 맡는 것은 물리 데이터 센터, 물리 네트워크, 물리 호스트다 — 「What the provider always owns」
- 한국어 표기: on-premises datacenter → **온-프레미스 데이터 센터**, cloud provider → 클라우드 공급자, consumer → 소비자, shared responsibility model → 공유 책임 모델(학습 가이드 한국어판은 「공동 책임 모델」 — step 4 메모)

쓰인 곳: `azure-cloud-models.hybrid-cloud`(온-프레미스를 푸는 한 줄), `azure-cloud-models.public-cloud`·`azure-cloud-models.private-cloud`(하드웨어와 데이터 센터를 누가 갖추고 관리하나), D11·D13

- 공유 책임 모델에서는 온-프레미스에서 조직이 지던 책임을 클라우드 공급자와 소비자가 나눠 진다 — 「How responsibilities shift in cloud」 둘째 문단 (phase 101)
- 클라우드에 저장한 데이터와 정보는 소비자가 맡는다(공급자가 그 정보를 읽게 두고 싶지 않을 것이므로). 접근 보안 — 필요한 사람에게만 접근을 주는 것 — 도 소비자가 맡는다 — 같은 절 셋째 문단 (phase 101)
- 어떤 것은 상황에 따라 갈린다. 클라우드의 SQL 데이터베이스 서비스를 쓰면 데이터베이스 자체의 유지 관리는 공급자가, 넣는 데이터는 소비자가 맡는다. VM을 만들고 그 위에 SQL 데이터베이스를 직접 설치했다면 데이터베이스의 패치·업데이트까지 소비자가 맡는다 — 같은 절 넷째 문단 (phase 101)
- 공유 책임 모델은 서비스 유형과 깊이 묶여 있다. IaaS는 소비자에게 책임을 가장 많이 두고 공급자는 물리 보안·전원·연결 같은 기본만 맡는다. SaaS는 책임 대부분을 공급자에게 둔다. PaaS는 그 사이에서 둘이 책임을 나눈다 — 같은 절 다섯째 문단 (phase 101)
- 늘 소비자가 맡는 것: 클라우드에 저장한 정보와 데이터, 클라우드에 연결하도록 허용한 장치(휴대폰·컴퓨터 등), 환경 안의 사람·서비스·장치의 계정과 ID — 「What always stays with you」 (phase 101)
- 늘 공급자가 맡는 것으로 물리 데이터 센터·물리 네트워크·물리 호스트에 더해 「인프라」를 든다 — 「What the provider always owns」 (phase 101)
- 서비스 유형에 따라 갈리는 것: 운영 체제, 네트워크 제어, 애플리케이션, ID와 액세스. ID와 액세스는 PaaS·SaaS에서 함께 맡는다 — 사용자·역할·정책은 소비자가 관리하고, 인증 플랫폼(예: Microsoft Entra ID)은 공급자가 실행한다. 인프라는 온-프레미스를 떠나 IaaS로 가는 순간 공급자에게 넘어간다 — 「What depends on the service type」 (phase 101)
- 「Responsibility by service model」 절의 유형별 책임 그림은 그림뿐이라 글로 읽을 수 없다. 행마다의 배정은 아래 「Shared responsibility in the cloud」의 표(글)로 확인한다 (phase 101)
- 한국어 표기(phase 101): 단원 한국어판은 제목·본문 모두 「공유 책임 모델」(다섯 번)이다. 「책임 공유」는 요약 단원에 한 번 나온다

쓰인 곳(phase 101 step 7): `azure-service-types.shared-responsibility-model`(온-프레미스에서는 회사가 모두 맡는다, 클라우드에서 책임이 공급자와 고객 사이에 나뉘고 고객이 데이터 센터에 함께 있지 않아 물리 보안·전원·냉각·네트워크 연결은 공급자가 맡는다, 데이터와 접근은 고객, 데이터베이스 서비스와 직접 설치한 데이터베이스의 예, IaaS에서 고객 책임이 가장 많고 SaaS에서 가장 적으며 PaaS는 그 사이, 늘 고객·늘 공급자·유형에 따라의 세 묶음, PaaS·SaaS에서 인증 시스템은 공급자가 실행하고 사용자와 권한은 고객이 정한다), `SharedResponsibilityDiagram`(세 묶음의 이름), az032·az033 해설, D30·G18

## (phase 100) Azure 클라우드 컴퓨팅 사전 — What is a public cloud?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-public-cloud

확인한 날 2026-10-30. 사본: `azure-dictionary-what-is-a-public-cloud.md`.

- 퍼블릭 클라우드는 제3자 공급자가 서버·스토리지·네트워킹·앱 같은 컴퓨팅 리소스를 **여러 고객이 함께 쓰는 인프라** 위에서 인터넷으로 내주는 모델이다. 쓴 만큼 내는 방식으로 운영되고, 쓰는 쪽은 **온-프레미스 하드웨어 없이** IT 서비스를 쓴다 — 「Public cloud definition」
- 리소스는 **공급자의 데이터 센터**에 있다. 공급자는 큰 데이터 센터의 물리 서버를 가상화로 나눠 VM이나 컨테이너로 고객에게 내준다 — 「How does public cloud work?」
- **멀티테넌시**(multi-tenancy): 여러 기업·개인·조직이 같은 밑바탕 인프라를 함께 쓰지만, 고객마다의 데이터와 앱은 보안과 개인정보를 위해 서로 떨어져 있다 — 같은 절
- **필요할 때 쓰는 접근**(on-demand access): 웹 화면·API·명령줄 도구로 서비스에 접근하고, 작업량에 따라 리소스를 빨리 늘리고 줄인다 — 같은 절
- 쓴 만큼 내므로 하드웨어와 인프라에 큰돈을 미리 들일 필요가 없다 — 「Advantages of public cloud」
- **쓰지 않는 것**: 같은 페이지가 유지 관리·업데이트·보안 조치를 공급자가 맡는다고 넓게 말하는 대목(「Managed services and security」)은, 데이터와 접근 보안이 쓰는 쪽 몫이라는 Learn 단원 4와 어긋나게 읽힐 수 있어 쓰지 않는다.
  사내 인력 비용이 준다는 비교, 규제 인증의 이름, 「인터넷만 있으면 어디서나」 같은 소개 문장도 쓰지 않는다
- 한국어 표기: 한국어판은 받지 않았다. 용어는 Learn 단원 5 한국어판을 따른다

쓰인 곳: `azure-cloud-models.public-cloud`, `PublicPrivateCloudDiagram`, `CloudModelsTable`(퍼블릭 행), D11·D15, [용어집 1-6] 확인

## (phase 100) Azure 클라우드 컴퓨팅 사전 — What is a private cloud?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-private-cloud

확인한 날 2026-10-30. 사본: `azure-dictionary-what-is-a-private-cloud.md`.

- 프라이빗 클라우드는 한 조직만 쓰는 전용 클라우드 환경이다. 퍼블릭처럼 여러 사용자가 리소스를 나눠 쓰지 않고, 컴퓨팅·스토리지·네트워킹을 그 조직만 쓴다. 통제권과 보안, 원하는 대로 꾸미는 폭이 크다 — 「Private clouds defined」
- 조직 사업장 안(on-premises)에 둘 수도 있고, 제3자 공급자가 호스트할 수도 있다 — 「Private clouds defined」, 「How does a private cloud work?」
- 가상화로 같은 하드웨어에서 여러 앱을 실행하면서 작업끼리는 떼어 놓는다 — 「How does a private cloud work?」
- 의료·금융·공공 기관이 엄격한 규제를 맞추려고 쓰는 예를 든다 — 「Common private cloud scenarios」
- 같은 페이지가 「서비스형 프라이빗 클라우드(PCaaS)」를 앞으로의 흐름으로 소개하며, 물리 인프라를 관리하는 비용 없이 프라이빗의 이점을 얻는다고 한다 — 「The future of private clouds」.
  **이 과목에서는 쓰지 않는다**(Learn 단원과 학습 가이드에 없다). 「프라이빗이면 조직이 반드시 자기 데이터 센터를 짓고 운영한다」를 단정하지 않을 근거로만 적는다(D11, G9)
- 한국어 표기: 한국어판은 받지 않았다. 용어는 Learn 단원 5 한국어판을 따른다

쓰인 곳: `azure-cloud-models.private-cloud`, `PublicPrivateCloudDiagram`, `CloudModelsTable`(프라이빗 행), D11, G9

## (phase 100) Azure 클라우드 컴퓨팅 사전 — What is a hybrid cloud?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-hybrid-cloud-computing

확인한 날 2026-10-30. 사본: `azure-dictionary-what-is-hybrid-cloud-computing.md`.

- 하이브리드 클라우드는 퍼블릭 클라우드와 **온-프레미스 인프라(또는 프라이빗 클라우드)** 를 하나로 이은 환경으로 묶어, 앱·데이터·작업을 둘 사이에서 함께 쓰게 한다 — 「Hybrid cloud definition」
- 업무 요구에 따라 작업을 어디서 실행할지 고른다. 규모를 키우는 데는 제3자의 퍼블릭을 쓰고, 보안이나 통제가 더 필요한 중요한 작업은 온-프레미스·프라이빗에 둔다 — 「How does the hybrid cloud work?」
- 수요가 가장 많을 때도 온-프레미스 인프라에 더 투자하지 않고 작업 규모를 늘리고 줄인다 — 「Scalability」
- **클라우드 버스팅**(cloud bursting): 수요가 프라이빗의 용량을 넘으면 퍼블릭 리소스를 더 끌어 쓴다 — 「Cloud bursting」
- 민감한 데이터는 프라이빗에 두어 데이터 규정을 지킨다 — 「Security and compliance」
- **쓰지 않는 것**: 같은 페이지 「Multicloud strategy」 절은 하이브리드 모델로 여러 공급자를 쓴다고 말해 하이브리드와 다중 클라우드를 섞는다. Learn 단원 5의 구분(하이브리드는 퍼블릭과 프라이빗을 이은 것, 다중 클라우드는 퍼블릭 공급자 여럿)을 따르고 이 대목은 쓰지 않는다.
  성능이 좋아진다거나 비용 효율이 크다는 일반화도 쓰지 않는다
- 한국어 표기: 한국어판은 받지 않았다. 용어는 Learn 단원 5·단원 4 한국어판을 따른다(온-프레미스)

쓰인 곳: `azure-cloud-models.hybrid-cloud`, `HybridCloudDiagram`, `CloudModelsTable`(하이브리드 행), D12·D13·D14, [덤프 NO.125·268·339](온-프레미스와 클라우드를 이은 것을 하이브리드로 보는 근거), [용어집 1-8] 확인

## (phase 100) Azure 클라우드 컴퓨팅 사전 — What is multicloud?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-multi-cloud

확인한 날 2026-10-30. 사본: `azure-dictionary-what-is-multi-cloud.md`.

- 다중 클라우드는 퍼블릭 클라우드 공급자 둘 이상의 서비스를 쓰는 방식이다. 프라이빗이 섞일 수도 있다고 덧붙이지만, 대개는 여러 퍼블릭 플랫폼을 작업마다 나눠 쓰는 것이다 — 「Multicloud meaning」
- 하이브리드(퍼블릭과 프라이빗을 긴밀히 잇는 것)와는 목표와 구조가 다른 방식이라고 따로 견준다 — 「Multicloud meaning」 비교 목록
- **둘은 서로 배타적이지 않다.** 한 기업이 공급자마다 하이브리드 구조를 두면서 공급자 사이에서는 다중 클라우드로 쓰기도 한다 — 「Multicloud meaning」 마지막 문단.
  그래서 프라이빗과 퍼블릭 공급자 둘을 함께 쓰는 상황은 하이브리드이면서 다중 클라우드로도 읽힌다 — 문항이 피할 상황
- 공급자 한 곳에 묶이는 것(벤더 종속)을 피하는 것이 다중 클라우드를 쓰는 주된 까닭 가운데 하나다 — 「Benefits of a multicloud strategy」
- 이 과목은 Learn 단원 5의 정의(퍼블릭 공급자 여럿)를 기준으로 쓴다. 이 페이지의 「프라이빗이 섞일 수도 있다」는 쓰지 않는다
- 한국어 표기: 한국어판은 받지 않았다. 용어는 Learn 단원 5 한국어판을 따른다(다중 클라우드)

쓰인 곳: `azure-cloud-models.multicloud`, `CloudModelsTable`(다중 클라우드 행), [용어집 1-28] 확인

## (phase 100) Azure Arc — Azure Arc overview
https://learn.microsoft.com/en-us/azure/azure-arc/overview

확인한 날 2026-10-30, Last updated 2025-08-26. 사본: `docs-azure-arc-overview.md`, `ko-docs-azure-arc-overview.md`.

- 데이터 센터·여러 클라우드·에지에 걸친 환경을 다스리기 어렵다는 문제에 대해, Azure Arc는 다중 클라우드와 온-프레미스를 한결같은 방식으로 관리하는 플랫폼을 내준다 — 「첫 두 문단」
- Azure 밖의 리소스(서버·VM·Kubernetes 클러스터·데이터베이스 등)를 Azure Resource Manager로 끌어와 Azure 안에 있는 것처럼 관리한다 — 「첫 두 문단」 아래의 두 목록
- **이 주제에서는 이름과 한 줄 풀이**(여러 환경에 흩어진 리소스를 Azure에서 함께 관리하는 기술)로만 쓴다. 자세한 것은 `azure-management-tools` 주제의 몫이다(phase 100 guide)
- 간접 연결 모드(indirectly connected mode)는 2025년 9월에 지원이 끝났다 — 「Indirectly connected mode」. 이 주제에서는 쓰지 않는다
- 한국어 표기: Azure Arc → Azure Arc(이름 그대로), multicloud → 다중 클라우드, on-premises → 온-프레미스

쓰인 곳: `azure-cloud-models.multicloud`(Azure Arc를 푸는 한 줄)

---

## (phase 100) 한국어 표기 정리 — `azure-cloud-models`

위 항목의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다(step 7). 표기는 Microsoft 한국어 문서를 따른다(guide 「배경」).

| 영문 | 쓸 이름 | 근거 |
|---|---|---|
| cloud models | **클라우드 모델** | Learn 단원 5 한국어판 제목 「클라우드 모델 정의」, 학습 가이드 한국어판. 한국어판에 「배포 모델」이라는 말은 없고 「클라우드 리소스의 배포 유형」이라고 쓴다. 주제 제목 「클라우드 배포 모델」은 주제 지도의 것이라 그대로 둔다 |
| public / private / hybrid cloud | 퍼블릭 클라우드 / 프라이빗 클라우드 / 하이브리드 클라우드 | Learn 단원 5 한국어판 |
| multicloud | **다중 클라우드** | Learn 단원 5·요약 단원·Azure Arc 한국어판. 용어집의 「멀티 클라우드」는 쓰지 않는다 |
| on-premises | **온-프레미스** | Learn 단원 4·물리 인프라 단원·Azure Arc 한국어판. 받은 한국어판 어디에도 붙여 쓴 「온프레미스」는 없다(guide의 잠정 표기와 다르다) |
| on-site datacenter | 사내 데이터 센터 | Learn 단원 5 한국어판. 「사업장 안의 데이터 센터」로 풀어 써도 된다 |
| tenant / multitenancy | 테넌트 / 멀티테넌시 | Learn 단원 5·격리 문서 한국어판(격리 문서는 multitenant를 「멀티테넌트」로, SQL Database 줄에서만 「다중 테넌트」로 옮긴다). Microsoft Entra ID의 테넌트(ID 주제의 뜻)와 섞지 않는다 — 이 주제의 테넌트는 「클라우드 서비스를 쓰는 고객(조직)」이다 |
| cloud provider | 클라우드 공급자 | Learn 단원 4 한국어판(단원 5는 「타사 클라우드 공급자」) |
| Azure Arc | Azure Arc | 이름 그대로 |
| datacenter / resource | 데이터 센터 / 리소스 | step 4의 표와 같다 |

---

## (phase 101) Learn 「Describe the benefits of using cloud services」 — 3 Describe the benefits of reliability and predictability in the cloud
https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/3-reliability-predictability-cloud

확인한 날 2026-10-30. 사본: `learn-describe-benefits-use-cloud-services-3-reliability-predictability-cloud.md`와 `ko-` 판.

- **안정성**은 시스템이 장애에서 회복해 계속 동작하는 능력이다. 안정성은 Well-Architected Framework(Microsoft Azure의 설계 지침)가 꼽는 기둥 가운데 하나이기도 하다 — 「Reliability」 첫 문단
- 클라우드는 한곳에 몰리지 않은 분산된 설계라 세계 곳곳의 지역에 리소스를 둘 수 있다. 그래서 한 지역에 큰 재해가 일어나도 다른 지역은 계속 돌아간다 — 「Reliability」 둘째 문단
- 앱을 이 점을 저절로 쓰도록 설계할 수 있다. 경우에 따라서는 쓰는 쪽이 아무것도 하지 않아도 클라우드 환경이 스스로 다른 지역으로 옮겨 간다 — 같은 문단
- **예측 가능성**은 성능 예측 가능성과 비용 예측 가능성으로 나뉜다. 둘 다 Well-Architected Framework의 영향을 크게 받고, 그 지침을 따라 지은 솔루션은 성능과 비용을 내다볼 수 있다고 한다 — 「Predictability」
- **성능 예측 가능성**은 고객에게 좋은 경험을 주는 데 어떤 리소스가 필요한지 내다보는 것이다. 자동 크기 조정·부하 분산·고가용성이 이를 돕는다. 리소스가 갑자기 더 필요하면 자동 크기 조정이 리소스를 더 배포했다가 수요가 줄면 되돌리고,
  트래픽이 한쪽에 몰리면 부하 분산이 넘친 몫의 일부를 덜 바쁜 쪽으로 보낸다 — 「Performance」
- **비용 예측 가능성**은 클라우드에 쓸 돈을 내다보는 것이다. 리소스 사용을 실시간으로 추적하고, 가장 효율적으로 쓰는지 모니터링하고, 데이터 분석으로 패턴과 추세를 찾아 배포를 계획한다. 이렇게 얻은 정보로 앞으로의 비용을 내다보고 리소스를 조정한다.
  Azure 가격 계산기 같은 도구로 앞으로 쓸 돈을 어림할 수도 있다 — 「Cost」
- 이 단원은 고가용성(단원 2)과 안정성을 견주는 문장을 두지 않는다. 둘을 가르는 말은 각 단원의 정의(고가용성 = 중단과 관계없이 쓸 수 있는 시간을 최대로, 안정성 = 장애에서 회복해 계속 동작)와 아래 「What are business continuity, high availability, and disaster recovery?」에서만 가져온다
- 한국어 표기: 단원 제목 「안정성 및 예측 가능성」, reliability → 안정성(절 제목만 「신뢰도」), predictability → 예측 가능성(절 제목은 「예측」), performance/cost predictability → 성능 예측 가능성 / 비용 예측 가능성,
  autoscaling → 자동 크기 조정, load balancing → 부하 분산, Azure Pricing Calculator → Azure 가격 계산기, Well-Architected Framework → 이름 그대로

쓰인 곳: `azure-cloud-benefits.reliability`(정의, 분산된 설계와 세계 여러 지역, 앱을 그 점을 쓰게 설계할 수 있고 클라우드 환경이 스스로 다른 지역으로 옮겨 가기도 한다는 것 — Well-Architected Framework의 기둥이라는 줄은 쓰지 않았다),
`azure-cloud-benefits.predictability`(소개 문단의 「Azure 설계 지침」 — 이름은 쓰지 않았다, 두 항목과 자동 크기 조정·부하 분산을 푸는 줄), az020, az021, D18, G12, G14

## (phase 101) Learn 「Describe the benefits of using cloud services」 — 4 Describe the benefits of security and governance in the cloud
https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/4-security-governance-cloud

확인한 날 2026-10-30. 사본: `learn-describe-benefits-use-cloud-services-4-security-governance-cloud.md`와 `ko-` 판.

- IaaS로 배포하든 SaaS로 배포하든 클라우드의 기능이 거버넌스와 규정 준수를 돕는다 — 「첫 문단」
- 템플릿 같은 도구는 배포한 리소스가 기술 표준과 규정 요구 사항을 지키게 한다. 표준이 바뀌면 리소스를 한꺼번에 많이 고칠 수 있다 — 「둘째 문단」
- 클라우드 기반 감사는 기준을 벗어난 리소스를 짚어 주고 완화 방안을 내준다. 운영 모델에 따라서는 소프트웨어 패치와 업데이트가 자동으로 적용되기도 해, 거버넌스와 보안 양쪽에 도움이 된다 — 같은 문단
- 보안을 가장 많이 직접 통제하고 싶으면 IaaS다. 물리 리소스는 공급자가 내주고, 운영 체제와 설치한 소프트웨어는 패치·유지 관리까지 쓰는 쪽이 관리한다. 패치와 유지 관리를 자동으로 맡기고 싶으면 PaaS나 SaaS 배포가 나을 수 있다 — 「셋째 문단」
- 클라우드 공급자는 보통 DDoS 공격 같은 것을 다루기에 알맞아, 네트워크를 더 튼튼하고 안전하게 해 준다 — 「넷째 문단」
- 한국어 표기: security and governance → 보안 및 거버넌스(단원 제목), governance → 거버넌스, compliance → 규정 준수, DDoS → **DDoS(분산 서비스 거부)**, IaaS/PaaS/SaaS → 약어 그대로(첫 문단만 「인프라를 서비스로」·「서비스로서의 소프트웨어」로 풀어 썼다)

쓰인 곳: `azure-cloud-benefits.security-governance`(템플릿·감사·쓰는 방식에 따른 패치 자동 적용, 보안을 가장 많이 통제하려면 IaaS·패치를 맡기려면 PaaS나 SaaS, 공급자가 DDoS 공격에 대비하기 알맞다는 것), az022, G12, G13

## (phase 101) Learn 「Describe the benefits of using cloud services」 — 5 Describe the benefits of manageability in the cloud
https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/5-manageability-cloud

확인한 날 2026-10-30. 사본: `learn-describe-benefits-use-cloud-services-5-manageability-cloud.md`와 `ko-` 판.

- 클라우드 컴퓨팅의 관리 효율성은 두 종류다 — 「첫 문단」
- **클라우드 관리**(management of the cloud)는 클라우드 리소스를 관리하는 일이다. 클라우드에서는 필요에 따라 리소스 배포를 자동으로 늘리고 줄이고, 미리 구성한 템플릿으로 배포해 손으로 구성할 일을 없애고,
  리소스 상태를 모니터링하다 실패한 리소스를 자동으로 바꾸고, 구성한 지표에 따라 자동 경고를 받아 성능을 실시간으로 안다 — 「Management of the cloud」
- **클라우드에서의 관리**(management in the cloud)는 클라우드 환경과 리소스를 무엇으로 관리하는가다. 웹 포털, 명령줄 인터페이스, API, PowerShell로 관리한다 — 「Management in the cloud」
- 예로, 운영 팀이 템플릿으로 리소스를 배포하고 포털에서 상태를 지켜보며 CLI나 PowerShell 스크립트로 되풀이 작업을 자동화하면 손이 덜 가고 구성이 일관되게 유지된다 — 같은 절 끝 문단
- 한국어 표기: manageability → 관리 효율성, management of the cloud → **클라우드 관리**(절 제목), management in the cloud → **클라우드에서의 관리**(절 제목). 한국어판은 둘째 절 본문 첫 문장을 「클라우드의 관리는 …」이라고 옮겨 첫째 절 이름과 섞였다(번역 오류).
  command line interface → CLI(명령줄 인터페이스), web portal → 웹 포털, API → API, metrics → 메트릭

쓰인 곳: `azure-cloud-benefits.manageability`(두 항목과 끝 문단의 운영 팀 예), az023, G14

## (phase 101) Azure 클라우드 컴퓨팅 사전 — What is elasticity in cloud computing?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-elastic-computing

확인한 날 2026-10-30. 사본: `azure-dictionary-what-is-elastic-computing.md`와 `ko-` 판(설계 때 503이던 한국어판이 이번에는 열렸다).

- **탄력성**은 인프라가 실시간 수요에 따라 컴퓨팅 리소스를 자동으로 조정하는 능력이다. 트래픽이 늘면 리소스를 더 마련하고, 수요가 줄면 다시 줄인다. 사람이 손대지 않아도 이렇게 된다 — 「Understanding cloud elasticity」
- 이 쪽은 탄력성이 두 방향으로 작동한다며 수직 크기 조정(스케일 업/다운 — VM의 CPU나 메모리를 늘리는 것)과 수평 크기 조정(스케일 아웃/인 — 인스턴스를 통째로 더하거나 빼는 것)을 든다 — 같은 절
- 확장성과 탄력성은 흔히 같은 뜻으로 쓰이지만 다른 면을 다룬다. 확장성은 **용량**에 관한 것(리소스를 더해 늘어난 작업량을 받아 내는 시스템의 능력)이고, 탄력성은 **자동화와 속도**에 관한 것(그 조정이 얼마나 빨리, 저절로 일어나는가)이다 — 「How elasticity differs from scalability」
- 같은 절은 확장성의 특징으로 예상에 따른 계획된 증설, 수동이나 일정에 따른 조정, 최대 작업량 대비를 들고, 탄력성의 특징으로 지금 수요에 대한 자동 반응, 실시간으로 리소스를 마련하고 거두기, 예측이 아닌 실제 사용량을 든다. 둘은 서로를 보완한다고 한다 — 같은 절
- 탄력성이 주는 사업상 이점으로 비용·성능·민첩성을 든다. 「Business agility」 문단은 탄력적인 인프라가 시장 기회와 고객 요구를 따라잡게 하고, 예상하지 못한 트래픽을 받아 내며, 긴 조달 과정 없이 새 서비스를 빨리 내놓게 한다고 한다 — 「The business benefits of cloud elasticity」
- 주의: 이 쪽의 확장성 특징(「수동이나 일정에 따른 조정」)은 수평 크기 조정을 자동으로도 할 수 있다는 Learn 단원 2와 강조가 다르다. 확장성의 정의는 Learn 단원 2(수요에 맞춰 리소스를 조정하는 능력, 자동이나 수동)를 바탕에 두고,
  이 쪽은 「탄력성은 수요가 바뀌는 그때그때 자동으로 조정한다」는 차이를 대는 데만 쓴다. 아래 「What are business continuity, …」도 같은 차이를 말한다(확장성 = 리소스를 더하고 빼서 부하를 받아 냄, 탄력성 = 그것을 요구가 바뀔 때 빨리)
- 한국어 표기: elasticity → 탄력성, scalability → 확장성, vertical scaling → 수직 크기 조정(스케일 업/다운), horizontal scaling → 수평 크기 조정(스케일 아웃/인), agility → 민첩성

쓰인 곳: `azure-cloud-benefits.elasticity`(정의, 확장성과의 차이, 긴 조달 과정 없이 새 서비스를 빨리 내놓는다는 한 줄 — 「민첩성」이라는 이름은 쓰지 않았다), D19, G10. `azure-cloud-benefits.scalability`에는 확장성과 탄력성을 가르는 줄을 두지 않았다(그 차이는 탄력성 개념이 맡는다)

## (phase 101) Azure Monitor — Overview of autoscale in Azure Monitor
https://learn.microsoft.com/en-us/azure/azure-monitor/autoscale/autoscale-overview

확인한 날 2026-10-30. 사본: `docs-azure-monitor-autoscale-overview.md`와 `ko-` 판.

- **자동 크기 조정**은 앱에 걸린 부하에 따라 리소스를 자동으로 더하고 빼는 서비스다 — 「What is autoscale」
- 자동 크기 조정은 수평으로만(스케일 아웃·스케일 인) 하고 수직 크기 조정은 지원하지 않는다. 수평 크기 조정은 리소스 인스턴스의 수를 늘리거나 줄이는 것이고(예: 확장 집합에 VM을 더함 = 스케일 아웃, 뺌 = 스케일 인),
  수직 크기 조정(스케일 업·스케일 다운)은 인스턴스 수는 그대로 두고 메모리·CPU 속도·디스크 공간·네트워크 용량을 늘리는 것이다 — 「Horizontal vs. vertical scaling」
- 수직 크기 조정은 더 큰 하드웨어가 있어야 해서 결국 한계에 닿고, 크기를 바꾸는 동안 VM을 다시 시작해야 할 수 있다 — 같은 절
- 한국어 표기: autoscale → **자동 크기 조정**, horizontal/vertical scaling → 수평 크기 조정 / 수직 크기 조정(본문에 「수직적 스케일링」도 섞였다), scale out/in → 스케일 아웃 / 스케일 인, scale up/down → 스케일 업 / 스케일 다운

쓰인 곳: `azure-cloud-benefits.scalability`(항목 이름과 늘림·줄임의 이름, 수직 크기 조정의 한계 문단), `azure-cloud-benefits.predictability`(자동 크기 조정이라는 말), `CloudScalingDiagram`.
`azure-cloud-benefits.manageability`는 「자동 크기 조정」이라는 이름 대신 Learn 단원 5대로 「리소스를 자동으로 늘리고 줄인다」로 썼다

## (phase 101) Azure Virtual Machine Scale Sets — What are Virtual Machine Scale Sets?
https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview

확인한 날 2026-10-30. 사본: `docs-virtual-machine-scale-sets-overview.md`와 `ko-` 판. (이 서비스는 `azure-cloud-benefits` 주제에서 이름을 쓰지 않는다. 표기를 맞추는 근거로만 적는다.)

- 확장 집합은 부하가 분산되는 VM 무리를 만들고 관리하게 하며, VM의 수가 수요나 정해 둔 일정에 따라 자동으로 늘거나 준다 — 「첫 문단」
- 한국어 표기: scale(크기를 바꾸는 일) → 크기 조정, autoscale → 자동 크기 조정, scale out → 스케일 아웃. 서비스 이름은 「가상 머신 스케일 세트」(제목)와 「확장 집합」(본문)이 섞였다

쓰인 곳: (표기 근거만) `azure-cloud-benefits.scalability`

- 확장 집합만으로는 데이터 센터 장애에서 보호되지 않는다. 확장 집합 안의 VM을 가용성 영역들에 나눠 두어야 데이터 센터 장애에서 보호된다 — 「Why use Virtual Machine Scale Sets?」 (phase 102)

쓰일 곳(phase 102): 근거 기록 — [덤프 NO.423]의 답(확장 집합에 배포하는 것만으로는 데이터 센터 장애에 대비되지 않는다)이 맞는지 대조했다. 확장 집합은 `azure-compute` 주제의 몫이라 이 주제의 개념 글에는 쓰지 않는다

다시 확인한 날 2026-10-31. 영문·`ko-` 사본을 다시 받았다. (phase 103)

- 확장 집합의 이점 넷 — VM 여러 대를 쉽게 만들고 관리한다, VM을 가용성 영역이나 장애 도메인에 나눠 고가용성과 복원력을 준다, 수요에 따라 앱이 저절로 크기를 바꾼다, 큰 규모로 동작한다 — 「첫 문단」 (phase 103)
- 앱의 성능을 고르게 하려면 VM 크기·디스크 구성·설치한 앱이 모든 VM에서 같아야 한다. 확장 집합에서는 모든 VM 인스턴스를 같은 기본 OS 이미지와 구성으로 만든다 — 「Easy to create and manage multiple VMs」 (phase 103)
- 단, 유연한 오케스트레이션 모드는 서로 다른 VM 유형을 섞어 쓰는 경우도 지원한다고 한다. **「같은 구성」은 확장 집합의 기본 쓰임으로 쓰고, 「확장 집합의 VM은 언제나 똑같다」로 일반화하지 않는다** — 「첫 부분」(오케스트레이션 모드의 세부는 쓰지 않는다) (phase 103)
- 앱 사용자는 부하 분산 장치를 거쳐 앱 인스턴스 가운데 하나로 요청을 보낸다. VM 인스턴스 하나에 문제가 생겨도 다른 인스턴스로 계속 앱에 닿는다 — 「Why use Virtual Machine Scale Sets?」·「Provides high availability and application resiliency」 (phase 103)
- 수요가 줄면 불필요한 VM을 줄여 비용을 아끼고, 늘면 VM을 더해 성능을 지킨다 — 「Allows your application to automatically scale …」 (phase 103)
- 확장 집합 자체에는 추가 비용이 없다. 확장 집합이 쓰는 컴퓨팅·네트워크·스토리지 리소스에 대해 낸다 — 「Cost-effective service」 (phase 103)
- 인스턴스 수의 상한(1,000·600)은 확인만 했다. 쓰지 않는다 (phase 103)
- 한국어 표기: 제목 「가상 머신 확장 집합이란?」 — 본문은 「확장 집합」, load balancer → 부하 분산 장치, fault domain → 장애 도메인 (phase 103)

쓰인 곳(phase 103 step 2): `azure-compute.scale-sets`(같은 구성 — VM 크기·디스크·설치한 앱이 같아야 성능이 고르다, 「언제나 똑같다」로 쓰지 않았다 / 요청이 부하 분산 장치를 거쳐 여러 VM으로, 한 대가 문제여도 다른 VM으로, 수요에 따른 증감과 비용, 추가 비용 없음, 확장 집합만으로는 데이터 센터 장애에 대비되지 않음), `ScaleSetDiagram`, az058 해설, D56·G28

## (phase 101) Azure reliability — What are business continuity, high availability, and disaster recovery?
https://learn.microsoft.com/en-us/azure/reliability/disaster-recovery-overview

확인한 날 2026-10-30. 사본: `docs-reliability-disaster-recovery-overview.md`와 `ko-` 판.

- 비즈니스 연속성은 장애·중단·재해가 있어도 사업이 계속 운영되는 상태다. 고가용성은 날마다 생기는 문제에 견디게 설계해 사업이 요구하는 가용성을 맞추는 것이고, 재해 복구는 드문 위험과 그로 인한 큰 중단에 어떻게 대응할지 계획하는 것이다 — 「첫 부분」
- **고가용성**: 일시적인 오류나 간헐적인 실패가 있어도 워크로드가 날마다 필요한 가동 시간을 유지하는 상태다 — 「High availability」
- 가동 시간은 흔히 가동 시간 백분율의 9의 개수로 잰다. 99.9%를 요구하면 한 달에 약 43분, 99.95%면 약 21분의 중단을 허용한다. 가동 시간은 부품 하나가 아니라 워크로드 전체의 가용성으로 잰다 — 같은 절(이 주제에서는 쓰지 않는다. SLA를 다루는 step 3이 볼 몫이다)
- **내결함성**: 장애가 일어나도 시스템이 정해 둔 수준으로 계속 동작하는 능력이다. 예: 웹 서버 하나가 실패해도 웹 앱이 계속 돌게 설계한다. 중복성, 장애 조치(failover), 분할, 기능을 줄여 계속 동작하기 같은 방법으로 얻는다. 고가용성을 이루는 설계 요소의 하나로 든다 — 「Fault tolerance」
- **중복성**: 워크로드의 안정성을 높이려고 인스턴스나 데이터를 여럿 두는 것이다. 데이터 센터 안(로컬 중복성), 한 지역의 가용성 영역 사이(영역 중복성), 지역 사이(지역 중복성)에 둔다 — 「Redundancy」
- **확장성과 탄력성**: 리소스를 더하고 빼서 늘어난 부하를 받아 내는 능력이 확장성이고, 그것을 요구가 바뀔 때 빨리 해내는 능력이 탄력성이다. 둘 다 부하가 가장 클 때 가용성을 지키는 데 도움이 된다 — 「Scalability and elasticity」
- **재해**는 고가용성 설계로 막을 수 있는 것보다 크고 오래가는 드물고 큰 사건이다. 예로 태풍·지진·홍수·화재 같은 자연재해, 운영 데이터를 실수로 지우는 것 같은 큰 사람 실수, 데이터 손상·손실이나 서비스 중단으로 이어지는 큰 보안 사고를 든다.
  **재해 복구**는 이런 상황에 어떻게 대응할지 계획하는 것이다 — 「Disaster recovery」
- 한국어 표기: business continuity → 비즈니스 연속성, high availability → 고가용성, disaster recovery → 재해 복구, fault tolerance → **내결함성**, redundancy → 중복성(로컬·영역·지역 중복성), failover → 장애 조치(failover), scalability and elasticity → 확장성 및 탄력성
- **장애 조치**: 재해 복구 계획에서 다른 곳에 두 번째 배포를 갖춰 두고, 주 배포가 재해를 입으면 트래픽을 그쪽으로 넘기는 것이다. 주 인스턴스가 실패했음을 알아차리고 보조 인스턴스로 바꾸기까지 보통 시간이 걸린다 — 「Failover and failback」 (phase 102)

쓰인 곳(phase 102 step 2): `azure-regions-zones.availability-zones`(중복을 푸는 한 줄 — 위 「중복성」 줄), `azure-regions-zones.zone-service-categories`(장애 조치를 푸는 한 줄 — 멈춘 쪽이 하던 일을 미리 갖춰 둔 다른 쪽이 넘겨받는 것. 이 주제에서 장애 조치를 처음 푼 자리다), az044 해설

쓰인 곳(phase 102 step 3): `azure-regions-zones.region-pairs`(장애 조치를 다시 풀지 않고 썼다 — 같은 주제의 `zone-service-categories`가 이미 풀었다), az045 해설(장애 조치를 푸는 한 줄 — 해설은 혼자 읽혀야 해서 다시 풀었다)

쓰인 곳: `azure-cloud-benefits.high-availability`(고가용성의 둘째 설명과 안정성을 가르는 근거), `azure-cloud-benefits.reliability`(내결함성·중복성·재해 복구를 푸는 문단 — 자연재해와 데이터를 실수로 지우는 일을 예로),
`azure-cloud-benefits.elasticity`(확장성과의 차이의 둘째 근거), D16, D21, G11. 가동 시간 백분율의 예(99.9% = 약 43분)는 쓰지 않았다

쓰인 곳(phase 101 step 4): `azure-sla-lifecycle.sla`(가동 시간 백분율을 한 달 중단 시간으로 바꾼 예 — 99.9%는 약 43분, 예시 값으로만. Well-Architected 지표 문서의 표와 같다), az024 해설, G16. 99.95%의 약 21분은 쓰지 않았다

## (phase 101) Azure reliability — Reliability in Azure
https://learn.microsoft.com/en-us/azure/reliability/glossary (이 주소로 받으면 「Reliability in Azure」 쪽이 열린다)

확인한 날 2026-10-30. 사본: `docs-reliability-glossary.md`와 `ko-docs-reliability-glossary.md`.

- 안정성은 장애나 중단 중에도 워크로드가 사업의 기대를 계속 맞추는 능력이다. 안정적인 워크로드는 두 성질을 갖는다 — 장애와 환경 변화를 흡수하며 받아들일 만한 수준으로 계속 동작하는 복원력, 중단이 생기면 정한 시간·데이터 손실 한도 안에서 정상으로 돌아오는 복구 가능성 — 「첫 부분」
- Azure는 세계 70개가 넘는 지역에서 운영되고, 이렇게 지리적으로 퍼져 있어 워크로드가 계획된 장애 조치로 지역 전체의 중단도 견딜 수 있다 — 「Resilient foundations in Azure」의 Regions
- Azure Site Recovery는 VM 워크로드의 재해 복구를 조율한다(복제와 장애 조치 순서를 자동화한다) — 「Geographic replication and failover」
- 한국어 표기: 제목 「Azure 안정성」, reliability → 안정성, geographic distribution → 지리적 배포(이 문서의 한국어판. 「지리적 분산」이라는 말은 없다)

쓰인 곳: `azure-cloud-benefits.reliability`(안정적인 시스템이 갖추는 두 성질 — 장애가 나도 받아들일 만한 수준으로 계속 동작, 멈춰도 정해 둔 시간 안에 정상 상태를 되찾음), D16, D20.
지역 수(70개 넘음), Azure Site Recovery, 「지리적 배포」라는 말은 쓰지 않았다

## (phase 101) Azure reliability — What are Azure regions?
https://learn.microsoft.com/en-us/azure/reliability/regions-overview

확인한 날 2026-10-30. 사본: `docs-reliability-regions-overview.md`와 `ko-` 판. (지역은 `azure-regions-zones` 주제의 몫이다. 이 주제에서는 쓰지 않고, 덤프의 「지리적 분산」을 대조한 근거로 적는다.)

- Azure 지역은 고용량·내결함성·저지연 네트워크로 이어진 데이터 센터 하나 이상으로 이루어진다 — 「Understand Azure regions and geographies」
- 지역을 고를 때 따질 것 가운데 하나가 대기 시간이다. 사용자와 지리적으로 가까운 지역을 고르면 대기 시간이 준다 — 「Choosing Azure regions」
- 한국어 표기: latency → 대기 시간, region → 지역
- 지역은 데이터 센터와 네트워크 인프라를 포함한 물리 시설의 묶음이다. Azure 데이터 센터는 보통 큰 도시권 안에 있다 — 첫 부분, 「Understand Azure regions and geographies」 (phase 102)
- **지리**는 데이터를 둘 곳의 경계(데이터 상주 경계)이고 예로 미국·유럽을 든다. 지리 하나에 지역이 하나 이상 있고, 지역은 모두 지리 하나 안에 들어 있다. 데이터 상주 요구가 있으면 요구된 지리 안의 지역을 고른다. 지리마다 가용성 영역을 갖춘 지역이 하나 이상 있다 — 첫 부분, 「Understand Azure regions and geographies」 (phase 102)
- 대부분의 지역은 모든 Azure 고객이 쓸 수 있지만, 일부 지역은 소버린 클라우드 지리에 속하고 데이터 상주 규제가 엄격한 특정 지역의 고객이 쓴다. 소버린 클라우드 지역은 다른 지역과 같은 방식으로 동작하지만 서비스와 기능이 제한된 경우가 많다 — 「Understand Azure regions and geographies」 Note (phase 102)
- 지역을 고를 때 따질 것 셋: 대기 시간(사용자와 가까운 지역 — 예: 사용자가 미국에 있으면 미국이나 캐나다의 지역), 가용성 영역(지원하는 지역을 고르고 여러 영역에 리소스를 나눈다), 데이터 상주(조직이 요구하는 경계 안의 지역) — 「Choosing Azure regions」 (phase 102)
- 가용성 영역은 전원·냉각·네트워크 연결이 격리된 독립 데이터 센터 묶음이다. 영역들은 저지연 네트워크가 될 만큼 가깝고, 폭풍이나 국지 정전 같은 일에서 서로 격리될 만큼 떨어져 있다. 지원 지역에는 영역이 최소 셋 있고 셋보다 많은 지역도 있다 — 「Availability zones」 (phase 102)
- Microsoft가 일부 지역을 다른 지역과 짝지어 지역 쌍을 만든다. **고객은 짝을 직접 고를 수 없다.** 새 지역 다수는 짝이 없고 가용성 영역을 주된 중복 수단으로 쓴다. 짝이 있든 없든 복원력 있는 설계를 할 수 있다 — 「Paired and nonpaired regions」 (phase 102)
- 여러 지역을 함께 쓰면 여러 종류의 장애에 견디고 재해 복구의 선택지가 많아진다. 지역 사이 복제와 장애 조치를 갖춘 서비스도 있고, 고객이 직접 설계해야 하는 서비스도 있다 — 「Using multiple Azure regions」 (phase 102)
- 대부분의 서비스는 특정 지역에 배포하지만 지역 하나에 묶이지 않는 서비스(비지역 서비스)도 있다. Microsoft가 비지역 서비스를 지역 둘 이상에 두어, 한 지역이 실패하면 정상 지역의 인스턴스가 요청을 계속 처리한다. Microsoft Entra ID처럼 데이터를 둘 지리(예: 유럽·북아메리카)를 고르게 하는 비지역 서비스도 있다 — 「Nonregional services」 (phase 102)
- 첫 문단의 지역 수(「70개가 넘는」)는 바뀌는 수라 적지 않는다. 페이지의 「Last updated on」은 2026-06-29 (phase 102)
- 한국어 표기(phase 102): geography → 지리, data residency → 데이터 상주(데이터 상주 경계), sovereign cloud region → 소버린 클라우드 지역, nonregional services → 비지역 서비스, paired / nonpaired regions → 쌍을 이루는 지역 / 쌍을 이루지 않는 지역(절 제목은 region을 「영역」으로 잘못 옮겨 「쌍을 이루는 영역과 쌍을 이루지 않는 영역」), failover → 장애 조치

쓰일 곳: D20

쓰인 곳(phase 102 step 1): `azure-regions-zones.region`(데이터 센터 하나 이상과 저지연 네트워크, 지리와 데이터 상주, 지역을 고를 때 따질 것 셋, 비지역 서비스가 있고 Microsoft Entra ID는 데이터를 둘 지리를 고르게 한다), az040·az041 해설, `AzureRegionDiagram`

쓰인 곳(phase 103 step 2): `azure-compute.scale-sets`(지역을 푸는 한 줄 — Azure가 데이터 센터를 모아 둔 지리적 장소), az059 해설

쓰인 곳(phase 102 step 2): `azure-regions-zones.availability-zones`(최소 셋·셋보다 많은 지역, 가깝되 격리될 만큼 떨어짐)

쓰인 곳(phase 102 step 3): `azure-regions-zones.region-pairs`(Microsoft가 짝짓고 고객은 고를 수 없다, 새 지역 가운데 많은 곳이 짝 없이 가용성 영역을 주된 대비 수단으로 쓴다, 짝이 있든 없든 여러 지역을 함께 써서 대비할 수 있다), `azure-regions-zones.sovereign-regions`(다른 지역처럼 동작하지만 서비스·기능이 적은 경우가 많다, 데이터 상주 요구는 지리 안의 지역을 골라 맞춘다 — G23), az045·az046 해설, D38·G20·G21·G23

## (phase 101) Azure 클라우드 컴퓨팅 사전 — What is a container?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-container

확인한 날 2026-10-30. 사본: `azure-dictionary-what-is-a-container.md`.

- 컨테이너는 앱 코드와 그 코드를 실행하는 데 필요한 운영 체제 라이브러리·의존성을 한데 묶은 독립된 소프트웨어 꾸러미다. 그래서 개발자의 노트북에서든 테스트 서버에서든 클라우드에서든 같게 실행된다 — 「첫 부분」
- 컨테이너는 VM보다 가볍고 옮기기 쉬워 크기를 조정하기 쉽다 — 「Key takeaways」
- 한국어 표기: container → 컨테이너(Learn 단원 2 한국어판)

쓰인 곳: `azure-cloud-benefits.scalability`(컨테이너를 푸는 한 줄)

다시 확인한 날 2026-10-31. 영문 사본을 다시 받았다. (phase 103)

- 컨테이너와 VM은 둘 다 워크로드를 컴퓨팅 리소스와 떼어 두는 가상화지만 방법이 다르다. VM은 밑의 리소스를 가상화해 운영 체제 여러 개를 한 하드웨어에서 실행하고, VM마다 운영 체제 이미지·라이브러리·앱을 담아 크다 — 「What's the difference between a container and a virtual machine?」 (phase 103)
- **컨테이너는 호스트의 운영 체제를 함께 쓴다.** 그래서 운영 체제를 시작하거나 라이브러리를 올릴 필요가 없어 가볍고 효율적이지만, VM보다 덜 격리된다. 컨테이너는 자기가 정의된 운영 체제에 묶인다 — 같은 절과 마지막 「What is the difference …」 문답 (phase 103)
- 마이크로 서비스 아키텍처는 큰 앱을 특정 기능을 맡는 작은 서비스들로 나누고, 서비스끼리 API로 통신하게 하는 방식이다. 서비스마다 자기 컨테이너에서 실행되어 따로 업데이트·크기 조정·배포한다 — 「Containers and modern app development」 (phase 103)
- 한국어 표기: 한국어판은 받지 않았다. Learn 단원 5 한국어판의 「컨테이너」·「가상 머신」·「마이크로 서비스 아키텍처」를 쓴다 (phase 103)

쓰인 곳(phase 103 step 3): `azure-compute.containers`(앱 코드와 필요한 라이브러리를 한 꾸러미로 묶어 어디서든 같게 실행, VM과 다른 점 — 호스트의 운영 체제를 함께 쓴다, 운영 체제를 새로 시작하지 않아 가볍다, 덜 격리된다, 마이크로 서비스는 서비스마다 자기 컨테이너에서 따로 고치고 늘리고 배포), `VmContainerDiagram`(VM마다 운영 체제, 컨테이너는 호스트의 운영 체제 하나를 함께 쓴다), az062 해설, D53·D55

쓰인 곳(phase 103 step 4): `HostingOptionsTable`(컨테이너 행)

## (phase 101) Azure DDoS Protection — Azure DDoS Protection overview
https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-protection-overview

확인한 날 2026-10-30. 사본: `docs-ddos-protection-overview.md`와 `ko-` 판. (DDoS Protection 서비스는 이 주제에서 이름을 쓰지 않는다. DDoS 공격을 푸는 근거로만 적는다.)

- DDoS 공격은 앱의 리소스를 바닥내 정상 사용자가 그 앱을 쓸 수 없게 하려는 공격이다. 인터넷에서 누구나 닿을 수 있는 끝점은 모두 대상이 될 수 있다 — 「첫 문단」
- DDoS Protection은 가상 네트워크의 특정 Azure 리소스에 맞춰 저절로 조정되고, 새 가상 네트워크든 있는 가상 네트워크든 앱이나 리소스를 바꾸지 않고 켠다 — 「둘째 문단」 (phase 103)
- 앱의 트래픽을 늘 지켜보다 공격의 낌새를 찾으면 저절로 완화한다 — 「Always-on traffic monitoring」. 공격 중에는 일정 간격의 보고서를, 끝나면 요약을 준다 — 「Attack analytics」. 공격의 시작·끝에 경고를 받을 수 있다 — 「Attack alerting」 (phase 103)
- 네트워크 쪽(계층 3·4)을 지키고, 웹 앱 쪽(계층 7)은 웹 애플리케이션 방화벽을 더해야 한다 — 「셋째 문단」·「Multilayered protection」 (phase 103)
- DDoS Network Protection을 켜면 그 가상 네트워크의 리소스가, DDoS IP Protection을 켜면 그 공용 IP 주소가 보호된다. 후자는 보호 계획이 필요 없고, 전자의 계획 하나는 테넌트 안 여러 구독에 쓸 수 있다. 차이는 신속 대응 지원·비용 보호·WAF 할인이다 — 「Turnkey protection」·「Pricing」·「DDoS IP Protection」 (phase 103)
- 가상 네트워크에 두지 않는 서비스에는 기본 인프라 수준 보호가 적용되어 흔한 네트워크 공격을 막는다 — 「Architecture」 (phase 103)
- 한국어 표기: 이 문서의 한국어판은 DDoS를 「배포된 서비스 거부」로 잘못 옮겼다. Learn 「Describe the benefits of using cloud services」 단원 4 한국어판의 **DDoS(분산 서비스 거부)** 를 쓴다

쓰인 곳: `azure-cloud-benefits.security-governance`(DDoS 공격을 푸는 한 줄)

쓰인 곳(phase 103 step 12): `azure-network-protection.ddos-protection`, `DdosProtectionDiagram`, D62

## (phase 101) Cloud Adoption Framework — Build a cloud governance team
https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/govern/

확인한 날 2026-10-30. 사본: `docs-caf-govern.md`와 `ko-` 판.

- 클라우드 거버넌스는 조직이 가드레일을 세워 클라우드 서비스를 어떻게 쓸지 통제하는 방법이다. 가드레일은 해도 되는 클라우드 활동과 안 되는 활동을 정하는 정책·절차·도구의 묶음이다 — 「첫 문단」
- 거버넌스는 클라우드 사용을 사업 목표에 맞추고, 위험을 줄이고, 규정 준수를 지키고, 관리되지 않거나 허락받지 않은 작업을 막는다. 보안·규정 준수·운영·비용 관리·데이터 관리·리소스 프로비저닝 같은 영역을 다룬다 — 같은 문단
- 한국어 표기: cloud governance → 클라우드 거버넌스, guardrails → 가드레일, regulatory compliance → 규정 준수

쓰인 곳: `azure-cloud-benefits.security-governance`(거버넌스를 푸는 줄 — 해도 되는 일과 안 되는 일을 정책·절차·도구로 정함. 「가드레일」이라는 말은 쓰지 않았다)

쓰인 곳(phase 102 step 7): `azure-resource-hierarchy.management-group`(거버넌스와 규정 준수를 푸는 한 줄 — 해도 되는 일과 안 되는 일을 정해 두고 지켜지게 통제하는 일, 규정 준수는 `azure-cloud-benefits`가 쓴 풀이와 같은 뜻 「법이나 업계가 정한 규칙을 지키는 것」)

## (phase 101) Azure CLI — What is the Azure CLI?
https://learn.microsoft.com/en-us/cli/azure/what-is-azure-cli

확인한 날 2026-10-30. 사본: `docs-cli-what-is-azure-cli.md`와 `ko-` 판.

- Azure CLI는 Azure에 연결해 Azure 리소스에 관리 명령을 실행하는 명령줄 도구이고, 여러 운영 체제에서 쓴다. 명령은 터미널에서 대화하듯 하나씩 입력하거나 스크립트로 실행한다 — 「첫 문단」
- 한국어 표기: command-line interface → 명령줄 인터페이스(CLI), command-line tool → 명령줄 도구

쓰인 곳: `azure-cloud-benefits.manageability`(명령줄 인터페이스를 푸는 한 줄, 명령을 하나씩 입력하거나 스크립트로 실행한다는 것), az023

## (phase 101) Azure REST API reference
https://learn.microsoft.com/en-us/rest/api/azure/

확인한 날 2026-10-30. 사본: `docs-rest-api-azure.md`. (영문판만 받았다. 한국어 표기는 Learn 단원 5 한국어판의 「API」를 쓴다.)

- REST API는 HTTP 요청(메서드)을 받아 서비스의 리소스를 만들고·읽고·고치고·지우게 해 주는 서비스의 끝점이다 — 「첫 문단」

쓰인 곳: `azure-cloud-benefits.manageability`(API를 푸는 한 줄 — 「프로그램이 요청을 보내 리소스를 만들고, 읽고, 고치고, 지울 수 있게 해 주는 창구」)

다시 확인한 날 2026-10-31(사본을 다시 받았다 — 위 사실 그대로). REST 요청은 이 끝점에 HTTP 메서드로 보내는 요청이다 — 「첫 문단」의 「REST API request/response pair」 (phase 103)

쓰인 곳(phase 103 step 4): `azure-compute.functions`(REST 요청을 푸는 한 줄 — 프로그램이 HTTP로 서비스에 보내는 요청), `azure-compute.app-service`(REST API)

## (phase 101) Azure PowerShell — What is Azure PowerShell?
https://learn.microsoft.com/en-us/powershell/azure/what-is-azure-powershell

확인한 날 2026-10-30. 사본: `docs-powershell-what-is-azure-powershell.md`와 `ko-` 판. (phase 101 step 2가 받았다. Azure PowerShell이라는 제품 이름은 이 주제에서 쓰지 않고, PowerShell을 푸는 근거로만 적는다.)

- PowerShell은 명령줄 셸이자 스크립트 언어다. Azure PowerShell은 Azure 리소스를 관리하는 공식 Microsoft PowerShell 모듈들을 묶어 부르는 제품 이름이고, 쓰려면 PowerShell이 있어야 한다 — 「첫 문단」
- 명령을 하나씩 실행해 대화하듯 쓸 수도, 여러 명령으로 이루어진 스크립트를 만들어 실행할 수도 있다 — 같은 부분
- 한국어 표기: PowerShell → 이름 그대로(Learn 「Describe the benefits of using cloud services」 단원 5 한국어판도 같다), scripting language → 스크립팅 언어(이 문서 한국어판. 앱에서는 「스크립트를 쓰는 언어」로 풀어 쓴다)

쓰인 곳(phase 101 step 2): `azure-cloud-benefits.manageability`(PowerShell을 푸는 한 줄), az023

## (phase 101) Azure portal — What is the Azure portal?
https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-overview

확인한 날 2026-10-30. 사본: `docs-azure-portal-overview.md`와 `ko-` 판. (phase 101 step 2가 받았다. 이 주제는 「Azure 포털」이라는 제품 이름 대신 Learn 단원 5의 「웹 포털」을 쓰고, 이 문서는 웹 포털을 푸는 근거로만 적는다.)

- Azure 포털은 Azure 리소스를 만들고 관리하는 웹 기반 콘솔이다. 그래픽 사용자 인터페이스(화면의 메뉴·버튼)로 구독을 관리하고, 안내 마법사로 새 리소스를 만든다 — 「첫 문단」
- 지원되는 브라우저면 어느 것으로든 들어갈 수 있다 — 둘째 문단
- 한국어 표기: Azure portal → Azure 포털(이 문서 한국어판), web portal → 웹 포털(Learn 단원 5 한국어판)

쓰인 곳(phase 101 step 2): `azure-cloud-benefits.manageability`(웹 포털을 푸는 한 줄 — 웹 브라우저로 여는 관리 화면, 메뉴와 버튼으로 리소스를 만들고 관리한다), az023

## (phase 101) Learn 「Describe cloud service types」 — 2·3·4 (이 주제가 쓰는 한 줄 풀이만)
https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service
https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/3-describe-platform-service
https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/4-describe-software-service

확인한 날 2026-10-30. 사본: `learn-describe-cloud-service-types-{2,3,4}-….md`와 `ko-` 판. (세 유형의 책임 나눔과 이름은 `azure-service-types` 주제를 준비하는 step 6이 정리한다. 여기에는 `azure-cloud-benefits`가 세 유형을 한 줄씩 푸는 데 쓸 것만 적는다.)

- IaaS는 클라우드 서비스 가운데 가장 유연한 유형으로, 쓰는 쪽이 클라우드 리소스를 가장 많이 통제한다. 공급자는 하드웨어·인터넷 연결·물리 보안을 맡고, 운영 체제 설치·구성·유지 관리를 비롯한 나머지는 쓰는 쪽이 맡는다 — 단원 2 첫 문단
- PaaS는 데이터 센터 공간을 빌리는 IaaS와 다 만들어진 솔루션에 돈을 내는 SaaS의 중간이다. 공급자가 물리 인프라에 더해 운영 체제·미들웨어·개발 도구 등을 유지 관리하므로, 쓰는 쪽은 운영 체제와 데이터베이스의 라이선스·패치를 신경 쓰지 않는다 — 단원 3 첫 문단
- SaaS는 다 만들어진 애플리케이션을 빌려 쓰는 유형이다. 이메일·재무 소프트웨어·메시징 앱이 흔한 예다 — 단원 4 첫 문단
- 한국어 표기: 단원 제목이 「서비스로서의 인프라」·「서비스형 플랫폼」·「SaaS(Software as a Service)」로 꼴이 서로 다르다. 이름은 step 6이 정한다 — 이 주제는 약어 IaaS·PaaS·SaaS와 한 줄 풀이만 쓴다

쓰인 곳: `azure-cloud-benefits.security-governance`(세 유형을 한 줄씩 푸는 근거 — IaaS는 공급자가 하드웨어·인터넷 연결·물리 보안, PaaS는 운영 체제와 개발 도구까지 공급자가 유지 관리, SaaS는 이메일처럼 다 만들어진 앱), az022

phase 101 step 6이 `azure-service-types` 주제를 위해 덧붙인 줄:

- IaaS에서 쓰는 쪽이 맡는 「나머지」는 운영 체제의 설치·구성·유지 관리, 네트워크 구성, 데이터베이스와 스토리지 구성이다. IaaS는 클라우드 데이터 센터의 하드웨어를 빌리는 것이고 그 하드웨어로 무엇을 할지는 쓰는 쪽이 정한다 — 단원 2 첫 문단·둘째 문단 (phase 101 step 6)
- IaaS에서 쓰는 쪽은 워크로드의 대부분 — 운영 체제, 패치, 구성, 많은 보안 통제 — 를 관리한다. 유연성이 가장 크고 운영 책임도 가장 크다 — 단원 2 「Responsibility focus in IaaS」 (phase 101 step 6)
- IaaS가 맞는 경우: 리프트 앤 시프트 마이그레이션(온-프레미스 데이터 센터와 비슷한 클라우드 리소스를 갖춘 뒤 워크로드를 그대로 옮긴다), 테스트·개발(정해 둔 구성을 빨리 복제하고, 환경을 빨리 시작하거나 끄면서도 통제를 모두 유지한다) — 단원 2 「Scenarios」 (phase 101 step 6)
- PaaS는 개발 인프라를 모두 유지 관리하는 수고 없이 완전한 개발 환경을 주는 데 알맞다 — 단원 3 첫 문단 뒤 (phase 101 step 6)
- PaaS에서 공급자는 물리 인프라와 플랫폼 구성 요소(운영 체제·미들웨어·관리형 런타임)를 관리하고, 쓰는 쪽은 앱 코드·데이터·액세스 제어에 집중한다. 서비스 구성에 따라 일부 네트워크·앱 보안 설정은 함께 맡는다 — 단원 3 「Responsibility focus in PaaS」 (phase 101 step 6)
- PaaS가 맞는 경우: 개발 프레임워크(개발자가 기본 제공 구성 요소로 앱을 만들거나 고치고, 확장성·고가용성·멀티 테넌트 기능이 이미 들어 있어 코드를 덜 쓴다), 분석·비즈니스 인텔리전스(데이터를 분석해 통찰과 패턴을 찾고 결과를 예측하는 도구를 서비스로 받는다) — 단원 3 「Scenarios」 (phase 101 step 6)
- SaaS는 제품으로 보면 가장 완전한 클라우드 서비스 모델이다. 이메일·재무 소프트웨어·메시징 앱·연결 소프트웨어가 흔한 예다 — 단원 4 첫 문단 (phase 101 step 6)
- SaaS는 가장 덜 유연할 수 있지만 시작하기 가장 쉽고, 제대로 쓰는 데 드는 기술 지식이 가장 적다 — 단원 4 둘째 문단 (phase 101 step 6)
- SaaS에서 공급자는 인프라·플랫폼·앱 유지 관리를 포함해 앱 스택의 거의 전부를 관리하고, 쓰는 쪽은 주로 데이터, ID와 액세스 설정, 장치의 접근 상태를 관리한다. 고객의 운영 부담이 가장 적다. 예: SaaS 협업 플랫폼을 쓰는 팀은 사용자 등록·접근 제어·데이터 거버넌스에 집중하고, 인프라 패치·앱 업데이트·가용성은 공급자가 맡는다 — 단원 4 「Responsibility focus in SaaS」 (phase 101 step 6)
- SaaS가 쓰이는 경우: 이메일과 메시징, 생산성 앱, 재무와 경비 관리 — 단원 4 「Scenarios」 (phase 101 step 6)
- 세 단원 모두 「Responsibility focus」 앞에 유형별 계층 그림을 두지만 그림이라 글로 읽을 수 없다 (phase 101 step 6)
- 한국어 표기(phase 101 step 6): 단원 제목은 「서비스로서의 인프라 설명」(단원 2)·「서비스형 플랫폼 설명」(단원 3)·「SaaS(Software as a Service) 설명」(단원 4). lift-and-shift migration → 리프트 앤 시프트 마이그레이션, middleware → 미들웨어, development framework → 개발 프레임워크, business intelligence → 비즈니스 인텔리전스

쓰인 곳(phase 101 step 7): `azure-service-types.iaas`(가장 유연하고 고객이 리소스를 가장 많이 통제한다, 공급자는 하드웨어 유지 관리·인터넷 연결·물리 보안, 고객은 운영 체제 설치·구성·유지 관리와 네트워크·데이터베이스·스토리지 구성, 하드웨어를 빌려 무엇을 할지 고객이 정한다, 운영 책임이 가장 크다, 리프트 앤 시프트 마이그레이션과 개발·테스트), `azure-service-types.shared-responsibility-model`(세 유형을 한 줄씩 푸는 근거), az034·az035 해설, G19

쓰인 곳(phase 101 step 8): `azure-service-types.paas`(IaaS와 SaaS의 중간, 공급자가 물리 인프라·물리 보안·인터넷 연결에 더해 운영 체제·미들웨어·개발 도구·분석 서비스를 유지 관리한다, 운영 체제·데이터베이스의 라이선스와 패치를 고객이 신경 쓰지 않는다, 고객은 앱 코드·데이터·액세스 제어를 맡고 일부 네트워크·앱 보안 설정은 함께 맡는다, 개발 프레임워크와 분석·비즈니스 인텔리전스), `azure-service-types.saas`(제품으로 보면 가장 완성된 유형, 다 만들어진 앱을 빌려 쓴다, 이메일·재무 소프트웨어·메시지 앱, 가장 덜 유연할 수 있지만 시작이 가장 쉽고 기술 지식이 가장 적게 든다, 공급자가 인프라·플랫폼·앱 유지 관리를 거의 다 맡고 고객은 데이터·ID와 액세스 설정·장치를 맡는다, 협업 앱의 예, 이메일과 메시지·생산성 앱·재무와 경비 관리), `ServiceTypesTable`(PaaS·SaaS 행의 칸과 IaaS 행의 맞는 경우), az036·az037·az038 해설, D31·D33·G17·G18(위 두 개념이 고친 쪽을 따랐다)

쓰인 곳(phase 103 step 3): `azure-compute.container-services`(PaaS를 이 주제에서 다시 푸는 한 줄 — 공급자가 서버와 운영 체제 같은 바탕을 맡고 고객은 그 위의 앱에 집중한다), az063·az064 해설

## (phase 101) 한국어 표기 정리 — `azure-cloud-benefits`

위 항목들의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다(phase 101 step 0). Microsoft 한국어 문서의 표기를 따르고(guide 「배경」), 한국어판 사이에 표기가 갈리면 근거를 적는다.

| 영문 | 쓸 이름 | 근거 |
|---|---|---|
| high availability | **고가용성** | Learn 단원 2 한국어판 절 제목, 비즈니스 연속성·고가용성·재해 복구 문서 한국어판 |
| scalability | **확장성** | Learn 단원 2 한국어판 절 제목, 탄력성 사전·비즈니스 연속성 문서 한국어판. 단원 2 본문의 「스케일링 성능」은 쓰지 않는다 |
| vertical scaling (목록 항목) | **수직 크기 조정**(Vertical scaling) | Learn 단원 2 절 제목, 탄력성 사전, 자동 크기 조정 개요 한국어판이 모두 「수직 크기 조정」이다. 본문의 「수직 스케일링」·「수직적 스케일링」은 쓰지 않는다. guide의 잠정 「수직 확장」은 한국어판에 없다 |
| horizontal scaling (목록 항목) | **수평 크기 조정**(Horizontal scaling) | 위와 같다 |
| scale up / down / out / in | **스케일 업 / 스케일 다운 / 스케일 아웃 / 스케일 인** | 탄력성 사전·자동 크기 조정 개요 한국어판. Learn 단원 2 한국어판의 「스케일링 다운」과 scale in을 옮긴 「확장」은 쓰지 않는다(뒤의 것은 뜻이 거꾸로다) |
| elasticity | **탄력성** | 탄력성 사전 한국어판 제목·본문 |
| reliability | **안정성** | Learn 단원 3 한국어판 제목·본문, 「Azure 안정성」 문서 한국어판 제목. 단원 3의 절 제목 「신뢰도」와 용어집의 「신뢰성」은 쓰지 않는다 — 같은 단원의 제목과 본문, 다른 문서가 모두 「안정성」이다 |
| predictability | **예측 가능성** | Learn 단원 3 한국어판 본문(절 제목만 「예측」) |
| performance / cost predictability (목록 항목) | **성능 예측 가능성**(Performance predictability) / **비용 예측 가능성**(Cost predictability) | Learn 단원 3 한국어판 본문 |
| security and governance | **보안과 거버넌스** | Learn 단원 4 한국어판 제목 「보안 및 거버넌스」. 개념 이름은 이 과목의 다른 이름(「자본 지출과 운영 지출」)처럼 「과」로 잇는다 |
| manageability | **관리 효율성** | Learn 단원 5 한국어판 |
| management of the cloud (목록 항목) | **클라우드 관리**(Management of the cloud) | Learn 단원 5 한국어판 절 제목. guide의 잠정 「클라우드의 관리」는 한국어판 둘째 절 본문의 오역과 같은 꼴이라 둘째 항목과 헷갈린다 — 절 제목대로 쓴다 |
| management in the cloud (목록 항목) | **클라우드에서의 관리**(Management in the cloud) | Learn 단원 5 한국어판 절 제목 |
| autoscaling / load balancing | 자동 크기 조정 / 부하 분산 | Learn 단원 3, 자동 크기 조정 개요 한국어판 |
| Azure Pricing Calculator | Azure 가격 계산기 | Learn 단원 3 한국어판 |
| governance / compliance | 거버넌스 / 규정 준수 | Learn 단원 4, 클라우드 거버넌스 문서 한국어판 |
| DDoS | DDoS(분산 서비스 거부) | Learn 단원 4 한국어판. DDoS Protection 문서 한국어판의 「배포된 서비스 거부」는 오역이라 쓰지 않는다 |
| command line interface / API / web portal | 명령줄 인터페이스(CLI) / API / 웹 포털 | Learn 단원 5, Azure CLI 문서 한국어판 |
| region / uptime / SLA / container | 지역 / 가동 시간 / SLA(서비스 수준 계약) / 컨테이너 | 물리 인프라 단원·Learn 단원 2 한국어판 |
| CPU / RAM | CPU / RAM | Learn 단원 2 한국어판(약어 그대로). 탄력성 사전은 같은 예를 「CPU나 메모리」로 쓴다 — RAM을 「메모리」로 풀 근거 |
| fault tolerance / disaster recovery / redundancy | 내결함성 / 재해 복구 / 중복성 | 비즈니스 연속성·고가용성·재해 복구 문서 한국어판 |
| agility | 민첩성 | 탄력성 사전 한국어판 |
| geographic distribution | (이점 이름으로 쓰지 않는다) | 「Azure 안정성」 한국어판은 「지리적 배포」로 옮긴다. 덤프의 「지리적 분산(geo-distribution)」은 공식 문서의 이점 이름이 아니다 — D20 |

## (phase 101) Well-Architected Framework — Architecture strategies for defining reliability targets
https://learn.microsoft.com/en-us/azure/well-architected/reliability/metrics

확인한 날 2026-10-30. 페이지의 「Last updated on」 2024-08-20. 사본: `docs-well-architected-reliability-metrics.md`와 `ko-` 판.

- **SLA**는 서비스를 내주는 쪽(공급자)과 그 서비스를 쓰는 쪽(고객)이 맺는 계약상 합의다. 약속한 수준을 맞추지 못하면 공급자가 금전적인 책임을 질 수 있다 — 「첫 부분의 용어 표」
- SLA와 **SLO**는 같은 데이터를 보더라도 목적이 다르다. SLA는 조직이 고객과 맺는 공식 계약이라 지키지 못하면 돈과 법에 걸린 책임이 바로 생기고, SLO는 조직이 「이 정도 중단은 견딜 수 있나」를 따지려고 스스로 세우는 목표다 — 「Set availability objectives」의 Important
- 클라우드 공급자는 제품마다 SLA를 공개한다. 내 워크로드의 목표를 셀 때 그 SLA를 넣되, SLA가 어디까지 덮는지 모른 채 숫자만 가져다 쓰면 안 된다 — 같은 절
- 가동 시간 목표를 허용되는 중단 시간으로 바꾼 표가 있다. 한 달 기준으로 99.9%는 약 43.2분, 99.95%는 약 21.6분, 99.99%는 약 4.32분이다 — 「Define composite SLO targets」
- 여러 요소에 함께 기대는 목표는 요소마다의 값을 곱해 얻는다고 하고, 예로 99.95%와 99.99999%를 곱하면 약 99.95%가 된다고 든다. 이 문서는 이 값을 「복합 SLO」라 부른다 — 같은 절의 Important
- Microsoft SLA가 알려 주는 것은 Microsoft가 약속한 범위의 가용성뿐이고, 제품을 통째로 보장하지는 않는다. 예로 App Service의 Web Apps는 정해 둔 경우에 200 OK 응답을 돌려주면 「가용」으로 치고, 그 밖의 기능(간편 인증, 슬롯 전환)의 가용성은 금전적 보장에 들지 않는다고 한다 — 「Assess the impact of Microsoft SLAs」
- 여러 지역에 배포하는 것은 중복성 원칙을 구현한 것이고, 장애 조치에 쓸 두 번째 지역이 생겨 목표를 높일 수 있다. Microsoft는 Azure Cosmos DB를 여러 지역에 배포하면 한 지역에만 둘 때보다 높은 SLA를 약속한다 — 「Implement multiregion targets」
- **Azure SLA**는 가동 시간과 연결에 대해 Microsoft가 하는 약속이다. 서비스마다 SLA가 다르고, 같은 서비스 안에서도 상품에 따라 다를 때가 있다 — 「Azure facilitation」
- Azure SLA에는 워크로드가 SLA에 못 미쳤을 때 **서비스 크레딧**을 받는 절차와, 서비스마다 무엇을 「가용」으로 보는지의 정의가 들어 있다 — 같은 절
- 한국어 표기: service-level agreement → SLA(서비스 수준 계약), service-level objective → SLO(서비스 수준 목표), composite SLO → 복합 SLO, service credit → **서비스 크레딧**, uptime → 가동 시간, connectivity → 연결
- 쓰지 않는 것: 이 문서의 예(Contoso, 서비스마다의 수치 99.99%·99.95% 등)와 SLI·RTO·RPO 같은 다른 지표. 서비스마다의 SLA 수치는 이 과목에서 쓰지 않는다(guide 「배경」)

쓰인 곳(phase 101 step 4): `azure-sla-lifecycle.sla`(SLA의 정의 — 공급자와 고객이 맺는 계약, 가동 시간과 연결에 대한 약속, 못 미치면 공급자가 금전적 책임을 질 수 있어 스스로 세운 목표와 다르다는 것, 서비스·상품마다 다름, 가용 정의, 약속한 범위만 덮음, 99.9%가 한 달 약 43분이라는 둘째 근거), `azure-sla-lifecycle.service-credit`(SLA에 크레딧을 받는 절차가 들어 있다), `azure-sla-lifecycle.composite-sla`(곱한다, 여러 지역에 두는 중복으로 높일 수 있고 여러 지역 배포에 더 높은 SLA를 약속하는 서비스가 있다 — 「복합 SLO」·「SLO」라는 말은 쓰지 않았다), `CompositeSlaDiagram`, az024·az025·az026·az027 해설, D22, D23, D24, G15, G16

## (phase 101) Azure reliability — How to read a service-level agreement (SLA)
https://learn.microsoft.com/en-us/azure/reliability/concept-service-level-agreements

확인한 날 2026-10-30. 페이지의 「Last updated on」 2026-04-01. 사본: `docs-reliability-concept-service-level-agreements.md`와 `ko-` 판.
**주의**: 이 문서는 스스로 Microsoft SLA에만 해당하는 글이 아니라 어느 공급자의 SLA에나 쓰는 읽는 법이라고 밝힌다. 그래서 여기서 가져온 사실은 「Microsoft SLA는 ~」이 아니라 「SLA는 보통 ~」으로 한정해 쓴다.

- 대부분의 SLA는 가동 시간이나 가용성을 약속하지만, 성능·복구 시간·데이터 내구성 같은 다른 요구를 약속하는 SLA도 있다 — 「첫 부분」
- SLA는 공급자와 고객 사이의 계약상 약속이라 목표를 못 맞췄을 때의 결과가 정해져 있고, SLO는 내 워크로드에 내가 세우는 내부 목표다. SLA는 공급자가 지키겠다는 최소한을 적은 것이다 — 「How SLAs relate to SLOs and reliability targets」
- SLA는 조건이 붙은 약속이다. 고객이 정해 둔 요건을 맞추면 공급자가 일정한 서비스 수준을 약속하고, 그 수준에 못 미치면 고객이 보상을 받는데 그 보상은 대개 서비스 크레딧이다. SLA는 무엇을 장애(중단)로 셀지 정해 두며, 그 정의에 들지 않는 문제는 덮지 않는다 — 「What an SLA is and isn't」
- 의존하는 서비스들의 SLA 백분율을 곱해 시스템의 가용성을 어림하는 **복합 SLA**를 만들지 말라고 한다. 곱한 값은 대략의 상한일 뿐이고, 모든 서비스가 서로 따로 멈춘다고 가정하는데 실제로는 그런 일이 드물며, SLA마다의 정의·조건·제외를 빼고 셈해 시스템을 실제보다 믿을 만하게 보이게 한다 — 같은 절
- 99.9% SLA라고 해서 서비스를 늘 쓸 수 있다는 보장은 아니고, 1년에 그만큼만 멈춘다는 뜻도 아니다. 무엇이 측정되는지는 SLA가 「중단」을 어떻게 정의했는지가 정한다 — 「Pass 1: Definitions」의 Tip
- SLA는 보통 실시간이 아니라 청구 기간 동안의 가동 시간을 잰다. 몇 분 동안 멈춘 일이 있어도 그달의 SLA는 지켜질 수 있다 — 「Pass 2: Measurement」의 Tip
- 같은 서비스라도 인스턴스를 하나만 두는 배포는 중복을 둔 여러 인스턴스 배포보다 SLA가 낮을 수 있고, 등급(티어)에 따라 SLA가 다를 수 있다. SLA는 계획된 유지 관리, 고객의 잘못된 구성, 미리 보기나 지원하지 않는 기능 같은 것을 흔히 빼고, 미리 보기 기능과 낮은 등급을 덮지 않을 수 있다 — 「Pass 3: Prerequisites, variations, and exclusions」
- 서비스 크레딧은 중단에 대한 보상이지만 공급자가 보통 알아서 주지 않는다. 공급자는 SLA 위반을 먼저 찾아 주지도 대신 청구해 주지도 않으므로, 고객이 SLA를 어긴 중단을 찾아 기록하고 기한 안에 청구해야 한다 — 「Pass 5: How to claim service credits」
- 크레딧은 대개 영향을 받은 서비스의 한 달 요금에 대한 백분율로 정해지고, 잃은 매출·고객·평판은 보상하지 않는다 — 같은 절의 Note
- 가상의 서비스(PPaaS)를 든 예에서 월간 가동률은 「(청구 대상 분 − 중단 분) ÷ 청구 대상 분 × 100」으로 셈한다. 이 예의 짜임이 실제 SLA 여럿을 닮았다고만 하고, 특정 Azure 서비스의 식이라고 하지는 않는다 — 「A guided example: Decode a fictional SLA」
- 한국어 표기: service credit → 서비스 크레딧, composite SLA → 복합 SLA, downtime → 가동 중지 시간, billing period → 청구 기간, monthly uptime percentage → 월별 가동 시간 백분율
- 쓰지 않는 것: 청구 기한(30~60일), 크레딧 비율(10%·25% 등) — 가상의 예이거나 공급자마다 다르다

쓰인 곳(phase 101 step 4): `azure-sla-lifecycle.sla`(중단의 정의가 덮는 범위를 정함, 보통 청구 기간 단위로 잼, 많은 SLA가 쓰는 셈의 꼴 — D25, SLA는 멈춤을 막는 장치가 아니라 못 미치면 보상받는 약속 — G16), `azure-sla-lifecycle.service-credit`(크레딧은 보상이고 보통 한 달 요금의 백분율, 보통 저절로 오지 않아 고객이 중단을 기록해 기한 안에 청구, 놓친 매출·고객·평판은 보통 보상하지 않음), `azure-sla-lifecycle.composite-sla`(리소스를 하나만 두는 배포가 여러 개 두는 배포보다 SLA가 낮을 수 있음, 곱한 값은 따로 멈춘다는 가정에 기댄 대략의 상한이고 SLA마다의 정의·조건을 빼고 셈한다), `CompositeSlaDiagram`(composite 캡션의 「어림값」), az024·az025·az026·az027 해설, D23, D24, D25, G15, G16. 「등급」이라는 말은 쓰지 않고 「상품」으로 썼다

쓰일 곳: D26

## (phase 101) Cloud Adoption Framework — Protect your cloud estate (Manage reliability)
https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/manage/considerations/commitment

확인한 날 2026-10-30. 페이지의 「Last updated on」 2026-10-27. 사본: `docs-caf-manage-commitment.md`와 `ko-` 판.

- 워크로드의 가동 시간을 어림하려면 워크로드마다 **복합 SLA**를 셈한다. 멈추면 워크로드가 실패하는 서비스(중요 경로)만 넣는다 — 「Manage reliability」
- 중요 경로가 하나뿐이면 그 경로에 있는 서비스들의 SLA를 모두 곱한다(N = S1 × S2 × … × Sn). 예로 앱 99.99%, 데이터베이스 99.95%, 캐시 99.9%를 한 경로에 둔 워크로드를 든다 — 같은 절의 표
- 하나가 멈춰도 다른 하나로 계속 돌아가는 경로가 있으면 그 둘이 함께 멈출 확률로 셈하고, 여러 지역에 배포하면 「1 − (1 − 한 지역의 값)^지역 수」로 셈한다 — 같은 표
- 셈한 가동 시간이 목표에 못 미치면 더 높은 등급의 SLA를 고르거나 중복을 더한다(여러 가용성 영역, 여러 지역). 바꿀 때마다 다시 셈한다 — 같은 절
- 한국어 표기: composite SLA → **복합 SLA**, critical path → 중요 경로, multi-region SLA → 다중 지역 SLA, redundancy → 중복성(이중화로도 옮겼다)
- 쓰지 않는 것: 예의 서비스별 수치, 가용성 영역 SLA가 있는 서비스 목록 — 가용성 영역은 `azure-regions-zones` 주제의 몫이다

쓰인 곳(phase 101 step 4): `azure-sla-lifecycle.composite-sla`(이름, 멈추면 앱도 멈추는 서비스만 골라 곱하는 법, 중복(여러 지역)을 두거나 SLA가 더 높은 상품을 골라 높이기), `CompositeSlaDiagram`(서비스 A·B를 곱한 앱의 값), az026·az027 해설, D23, G15. 「중요 경로」라는 말, 여러 지역의 셈(1 − (1 − N)^R), 가용성 영역은 쓰지 않았다

## (phase 101) Microsoft 수명 주기 — Infrastructure Lifecycle FAQ - Microsoft Azure
https://learn.microsoft.com/en-us/lifecycle/faq/azure-infrastructure

확인한 날 2026-10-30. 페이지의 「Last updated on」 2026-03-18. 사본: `docs-lifecycle-faq-azure-infrastructure.md`와 `ko-` 판.
이 문서는 대상을 「Azure 인프라 제품과 기능」이라 밝힌다. 단계를 차례로 들 뿐, 모든 서비스(또는 대부분의 서비스)가 모든 단계를 거친다고 하지는 않는다(D29).

- Azure 인프라 제품·기능의 수명 주기에는 큰 단계가 다섯 있다 — 비공개 미리 보기, 공개 미리 보기, 일반 공급(GA), 사용 중단과 이전 세대, 사용 중지 — 「What are the lifecycle stages …」
- **비공개 미리 보기**는 초대받은 일부 고객만 들어오는 단계다. 더 넓게 내놓기 전에 초기 기능을 평가하고 의견을 준다. 기능이 덜 갖춰졌거나 크게 바뀔 수 있고, 지역·구독 유형·용량 등으로 쓸 수 있는 범위가 좁으며, 지원·문서가 적고 보통 SLA가 없다. 운영(프로덕션) 워크로드에 쓰라고 내놓은 것이 아니다 — 「Private preview」
- 비공개 미리 보기는 대개 고른 소수의 고객·파트너에게 열린다 — Azure 구독이 있고, 기능을 검증할 뚜렷한 쓰임이 있고, 제때 의견을 줄 수 있고, 필요하면 비밀 유지 계약이나 미리 보기 조건을 맞출 수 있는 곳 — 같은 절
- **공개 미리 보기**는 GA 전에 모든 Azure 고객이 기능을 평가하고 의견을 줄 수 있는 단계다. 비공개 미리 보기보다 다듬어졌지만 의견에 따라 바뀔 수 있고, 지역·구독 유형·용량으로 쓸 수 있는 범위가 좁을 수 있으며, 지원·문서는 비공개보다 낫지만 보통 SLA가 없고 SLA와 운영 지원 약속이 보장되지 않는다. 따로 밝히지 않는 한 운영 워크로드에 쓰라고 내놓은 것이 아니다 — 「Public preview」
- 공개 미리 보기는 대개 Azure 구독이 있고, 기능을 시험해 의견을 줄 수 있고, 아직 GA가 아니어서 바뀔 수 있음을 알고, 미리 보기 조건을 맞출 수 있는 모든 Azure 고객이 쓸 수 있다 — 같은 절
- **일반 공급(GA)**은 기능을 정식으로 내놓아 모든 Azure 고객이 운영에 쓰도록 지원하는 단계다. 기능이 안정되어 운영 워크로드에 맞게 충분히 시험되었고, 따로 밝히지 않는 한 지역·구독 유형·용량으로 막지 않으며, 지원과 문서를 다 갖추고, SLA와 운영 지원 약속이 보장되며, 지원 기간 동안 지원된다. 운영 워크로드에 권한다 — 「General availability (GA)」
- 사용 중단 단계의 기능은 아직 쓸 수 있고 지원되지만 차차 거두어지는 중이라 새 개선을 받지 않고, 보통 사용 중지 최소 12개월 전에 알리며, 그동안 SLA는 계속 효력이 있다. 사용 중지 뒤에는 기능을 쓸 수 없고 지원·업데이트가 끝나며 SLA도 적용되지 않는다 — 「Deprecation & Previous-gen」, 「Retirement」
- 한국어 표기: 제목 「인프라 수명 주기 FAQ - Microsoft Azure」. private preview → 프라이빗 미리 보기(본문)·비공개 미리 보기(절 안의 질문 제목), public preview → 공개 미리 보기(절 제목만 「공개 프리뷰」), general availability → GA(일반 공급), production workload → 프로덕션 워크로드, deprecation → 사용 중단·사용 중지 예정(섞였다), retirement → 사용 중지

쓰인 곳(phase 101 step 5): `azure-sla-lifecycle.preview`(두 항목 — 비공개는 초대받은 일부 고객, 더 넓게 내놓기 전 초기 기능의 평가와 의견, 덜 갖춰졌거나 크게 바뀔 수 있음, 지원·문서가 적음 / 공개는 Azure 구독이 있는 모든 고객이 정식 출시 전에 평가와 의견, 비공개보다 다듬어지고 지원·문서가 더 갖춰짐, 의견에 따라 바뀔 수 있음, 지역 같은 조건으로 범위가 좁을 수 있음 / 둘 다 보통 SLA가 없고 따로 밝히지 않는 한 운영에 쓰라고 내놓은 것이 아님), `azure-sla-lifecycle.general-availability`(GA의 정의 — 정식으로 내놓아 모든 고객이 운영에 쓰도록 지원, 안정·충분히 시험, 따로 밝히지 않는 한 지역 같은 조건으로 막지 않음, 지원·문서 완비, SLA와 운영 지원 약속 보장, 운영에 권함, 세 단계의 차례), `ServiceLifecycleDiagram`(세 단계의 차례와 단계마다 누가 쓸 수 있나·SLA), az028·az029·az030 해설, D26, D27, D28, D29. 사용 중단·사용 중지 단계는 쓰지 않았다

## (phase 101) Microsoft 수명 주기 — Modern Lifecycle Policy
https://learn.microsoft.com/en-us/lifecycle/policies/modern

확인한 날 2026-10-30. 페이지의 「Last updated on」 2024-06-18. 사본: `docs-lifecycle-policies-modern.md`와 `ko-` 판.

- **최신 수명 주기 정책**은 계속 서비스되고 지원되는 제품·서비스에 적용된다. 세 조건을 맞추는 동안 지원이 이어진다 — 고객이 그 제품에 공개된 서비스·시스템 요구에 맞춰 최신 상태를 유지할 것, 고객에게 사용 권한(라이선스)이 있을 것, Microsoft가 지금 그 제품을 지원하고 있을 것 — 「첫 부분」
- 이런 제품은 바뀌는 일이 잦을 수 있어 고객이 다가올 변경을 살펴야 한다. 따로 밝히지 않는 한, 고객이 조치하지 않으면 제품을 평소대로 쓰기 어려워지는 변경은 최소 30일 전에 알린다. 보안 업데이트는 나올 때 함께 알린다 — 「Change notification」
- 앞으로 나올 기능과 출시 소식을 보는 곳으로 Azure는 Azure 업데이트 쪽(`https://azure.microsoft.com/updates`)을 든다 — 같은 절
- 후속 제품·서비스 없이 지원을 끝낼 때는 최소 12개월 전에 알린다. 무료 서비스와 미리 보기 릴리스는 이 약속에서 빠진다 — 「Continuity and migration」
- 이 정책을 따르는 일부 Azure 서비스·제품은 지원이 끝나기 최대 3년 전에 알릴 수 있다 — 같은 절
- 고정 수명 주기 정책 같은 기존 정책을 따르는 제품은 정해진 기간 동안 서비스와 지원을 받고, 이미 그 정책으로 나온 제품은 공개된 지원 종료 날짜까지 지원된다 — 같은 절
- 한국어 표기: Modern Lifecycle Policy → **최신 수명 주기 정책**, Fixed Lifecycle Policy → 고정 수명 주기 정책. Azure 업데이트 쪽은 한국어판에도 이름 없이 주소만 있다

쓰인 곳(phase 101 step 5): `azure-sla-lifecycle.lifecycle-policy`(정책의 대상, 지원이 이어지는 세 조건, 30일·12개월·3년 통지, 무료 서비스·미리 보기 제외, 고정 수명 주기 정책은 정해 둔 기간 동안 지원하고 지원 종료 날짜를 공개해 둔다는 것), `azure-sla-lifecycle.general-availability`(정식으로 내놓은 뒤에도 계속 업데이트하며 지원해 서비스가 자주 바뀔 수 있고 고객이 다가올 변경을 살펴야 한다는 것, 앞으로 나올 기능과 출시 소식을 보는 Azure 업데이트 쪽), az030·az031 해설, D29. 보안 업데이트를 나올 때 알린다는 것은 쓰지 않았다

## (phase 101) Microsoft 수명 주기 — Platform Lifecycle FAQ - Microsoft Azure
https://learn.microsoft.com/en-us/lifecycle/faq/azure

확인한 날 2026-10-30. 쪽에 적힌 처음 게시 2016-06-06, 갱신 2021-09-01, 「Last updated on」 2026-03-18. 사본: `docs-lifecycle-faq-azure.md`와 `ko-` 판.

- Azure Virtual Machines(IaaS) 위에서 지원되는 Microsoft 소프트웨어는 고정 정책의 일반 지원·확장 지원 단계를 따르고, 그 밖의 모든 Azure 서비스는 최신 수명 주기 정책을 따른다 — 「첫 부분」
- 한국어 표기: Fixed Policy → 고정 정책(이 쪽 한국어판), Mainstream and Extended Support → 일반 및 확장 지원 단계, Modern Lifecycle Policy → 최신 수명 주기 정책
- 쓰지 않는 것: SDK·Cloud Services 게스트 OS의 12개월 통지 — 이 주제의 범위가 아니다

쓰인 곳(phase 101 step 5): `azure-sla-lifecycle.lifecycle-policy`(Azure 가상 머신 위에서 쓰도록 지원되는 Microsoft 소프트웨어는 고정 수명 주기 정책을, 그 밖의 Azure 서비스는 모두 최신 수명 주기 정책을 따른다), `azure-sla-lifecycle.general-availability`(Azure 서비스가 정식으로 내놓은 뒤에도 최신 수명 주기 정책으로 계속 업데이트·지원된다는 근거), az030 해설. 「일반 지원·확장 지원 단계」라는 이름은 쓰지 않았다

## (phase 101) Azure 약관 — Supplemental Terms of Use for Microsoft Azure Previews
https://azure.microsoft.com/en-us/support/legal/preview-supplemental-terms/

확인한 날 2026-10-30. 쪽에 적힌 「Last Updated」 2026년 6월. 사본: `azure-legal-preview-supplemental-terms.md`와 `ko-` 판. 약관 쪽(`/support/legal/`)은 phase 101 step 3이 허용 목록에 더했다(`docs/source/azure/CLAUDE.md`).

- **미리 보기**는 Microsoft가 고객이 골라 평가해 보도록 내놓는 미리 보기·베타·출시 전의 기능, 서비스, 소프트웨어, 지역을 묶어 부르는 말이다 — 「Preview Terms」
- 미리 보기는 Azure 사용 계약의 일부로 허가되고 미리 보기에 걸린 조건을 따른다. 이 조건에 동의하지 않으면 미리 보기를 쓰지 말라고 한다 — 쓰려면 동의해야 한다는 뜻이다 — 같은 절
- 프런티어·조기 액세스·**비공개(프라이빗) 미리 보기**·연구·실험으로 지정된 초기 단계의 미리 보기를 「조기 액세스 미리 보기」로 묶어 따로 조건을 둔다 — 고객 안에서 새 기능을 시험·평가하고 Microsoft에 의견을 주는 데만 쓸 수 있고, 제3자에게 주거나 함께 쓰거나 공개할 수 없으며, 운영(프로덕션·라이브) 환경에 쓸 수 없고, 쓴 일은 기밀이다 — 「Early Access Previews」
- 미리 보기를 GA와 맞대어 말하는 예: 컨테이너로 쓰는 AI 서비스의 미리 보기는 그 컨테이너가 일반 공급(GA)되면 미리 보기 컨테이너를 그만 쓰고 GA 버전으로 바꿔야 한다 — 「AI Services in Connected or Disconnected Containers (Previews)」
- 주의: 덤프 NO.63·411의 해설이 이 약관에서 옮겼다는 문장(미리 보기는 있는 그대로 제공되고 SLA와 제한 보증에서 빠진다)은 이번에 받은 판(2026년 6월)에 없다. 미리 보기가 SLA 밖이라는 사실은 위 인프라 수명 주기 FAQ와 아래 AI Search 문서로 댄다(D26)
- 한국어 표기: 제목 「Microsoft Azure 미리 보기에 대한 추가 사용 약관」, preview → 미리 보기, Early Access Previews → 조기 액세스 미리 보기, private preview → 프라이빗 미리 보기(아래 다른 절에서는 「비공개 미리 보기」·「개인 미리 보기」), public preview → 공개 미리 보기, general availability → 일반 공급("GA"), production → 프로덕션(「프로덕션 또는 "라이브" 운영 환경」)
- 쓰지 않는 것: 서비스별 미리 보기 조건(생성형 AI, Quantum, Communication Services, Fabric 등) — 이 주제는 서비스 이름을 쓰지 않는다

쓰인 곳(phase 101 step 5): `azure-sla-lifecycle.preview`(미리 보기의 뜻 — 정식으로 내놓기 전의 기능·서비스를 고객이 골라 평가하게 하는 것, 쓰려면 미리 보기 조건(약관)에 동의, 비공개 미리 보기의 쓰임 — 회사 안의 시험·평가와 의견에만, 다른 회사에 넘기거나 밖에 알릴 수 없음, 운영 환경 금지), `ServiceLifecycleDiagram`(private 캡션), D27, D28. GA가 되면 미리 보기 판을 GA 판으로 바꾸는 컨테이너의 예는 한 서비스의 예라 쓰지 않았다(D29)

## (phase 101) Azure Resource Manager — Set up preview features in Azure subscription
https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/preview-features

확인한 날 2026-10-30. 페이지의 「Last updated on」 2026-02-27. 사본: `docs-arm-preview-features.md`와 `ko-` 판.

- 미리 보기 기능은 새 기능이 정식으로 나오기 전에 고객이 스스로 신청(옵트인)해 써 보게 한다. 그 가운데 일부는 원하는 사람 누구나 신청할 수 있고, 일부는 제품 팀의 승인을 받아야 한다 — 「첫 부분」
- 구독의 미리 보기 기능은 Azure 포털(구독 → 설정 → 미리 보기 기능), Azure CLI, Azure PowerShell로 나열하고 등록한다 — 「List preview features」, 「Register preview feature」
- 한국어 표기: preview features → 미리 보기 기능, opt in → 옵트인

쓰인 곳(phase 101 step 5): 이 문서의 사실은 개념 글에 쓰지 않았다 — 누구나 신청하는 미리 보기와 승인이 필요한 미리 보기의 구분은 「공개」·「비공개」라는 이름과 이어지지 않아 `azure-sla-lifecycle.preview`에 넣지 않았다. D27·D29의 대조 근거로만 남는다

## (phase 101) Azure AI Search — What's new in Azure AI Search (미리 보기 안내 문단)
https://learn.microsoft.com/en-us/azure/search/search-api-preview (이 주소로 받으면 「What's new in Azure AI Search」 쪽이 열린다)

확인한 날 2026-10-30. 페이지의 「Last updated on」 2026-10-09. 사본: `docs-search-api-preview.md`(한국어판은 받지 않았다 — 표기는 위 문서들로 확인했다). 서비스 이름은 이 주제에서 쓰지 않는다. Learn 제품 문서가 미리 보기에 붙이는 안내의 실례로 적는다.

- (preview)로 표시한 기능은 SLA가 덮지 않고, 운영 워크로드에 권하지 않으며, 일반 공급되기 전에 바뀌거나 제한될 수 있다 — 쪽 머리의 Important

쓰인 곳(phase 101 step 5): `azure-sla-lifecycle.preview`(미리 보기는 SLA가 없고 운영에 권하지 않는다는 둘째 근거), `ServiceLifecycleDiagram`(public 캡션), az029 해설, D26, D27

## (phase 101) Microsoft Entra — What's new (Roadmap column descriptions)
https://learn.microsoft.com/en-us/entra/fundamentals/whats-new-overview

확인한 날 2026-10-30. 페이지의 「Last updated on」 2026-03-16. 사본: `docs-entra-whats-new-overview.md`와 `ko-` 판.
Microsoft Entra 제품의 로드맵 표에서 열을 설명한 것이다. Azure 전체의 정의는 인프라 수명 주기 FAQ로 대고, 이 쪽은 다른 Microsoft 문서도 같은 구분과 한국어 표기를 쓴다는 근거로만 쓴다.

- 공개 미리 보기는 필요한 라이선스가 있는 모든 고객이 쓸 수 있고, 고객 지원이 제한될 수 있으며 표준 SLA가 적용되지 않는다. GA는 사용 허가가 있는 모든 고객이 쓸 수 있고 모든 Microsoft 지원 경로로 지원된다 — 「Roadmap column descriptions」
- 한국어 표기: public preview → 공개 미리 보기, general availability → GA (일반 공급)

쓰인 곳(phase 101 step 5): (표기 근거) `azure-sla-lifecycle.preview`(「공개 미리 보기」), `azure-sla-lifecycle.general-availability`(「일반 공급(GA)」)

## (phase 101) Microsoft Entra — New name for Azure Active Directory
https://learn.microsoft.com/en-us/entra/fundamentals/new-name

확인한 날 2026-10-30. 페이지의 「Last updated on」 2025-05-07. 사본: `docs-entra-new-name.md`.

- Microsoft는 Azure Active Directory(Azure AD)의 이름을 Microsoft Entra ID로 바꿨다 — 「첫 부분」

쓰일 곳: D22(덤프의 옛 이름. 이 주제는 이 서비스의 이름을 쓰지 않는다)

## (phase 101) 한국어 표기 정리 — `azure-sla-lifecycle`

위 항목들의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다(phase 101 step 3). Microsoft 한국어 문서의 표기를 따르고(guide 「배경」), 한국어판 사이에 표기가 갈리면 근거를 적는다.

| 영문 | 쓸 이름 | 근거 |
|---|---|---|
| service-level agreement | **서비스 수준 계약(SLA)** | Well-Architected 지표 문서·Learn 「Describe the benefits of using cloud services」 단원 2 한국어판이 「SLA(서비스 수준 계약)」로 쓴다. 개념 이름은 이 과목의 다른 이름처럼 한국어를 앞에 둔다(guide의 잠정 이름 그대로) |
| service-level objective | SLO(서비스 수준 목표) | Well-Architected 지표 문서 한국어판. 이 주제가 꼭 써야 할 때만 한 줄로 푼다 |
| service credit | **서비스 크레딧** | Well-Architected 지표 문서·SLA 읽는 법 문서 한국어판 |
| composite SLA | **복합 SLA** | Cloud Adoption Framework 「클라우드 자산 보호」와 SLA 읽는 법 문서가 영문·한국어판 모두 「composite SLA / 복합 SLA」로 쓴다. Well-Architected 지표 문서는 같은 곱셈을 「복합 SLO」로 부른다 — 이 주제가 곱하는 값은 서비스들이 공개한 SLA이고, SLO를 따로 들이면 낱말이 하나 더 늘어나므로 「복합 SLA」를 쓴다. 이 값은 어림이지 Microsoft가 약속하는 SLA가 아니라는 것을 본문이 함께 밝힌다(SLA 읽는 법 문서) |
| uptime / downtime / connectivity | 가동 시간 / 가동 중지 시간 / 연결 | Well-Architected 지표 문서·SLA 읽는 법 문서 한국어판. 「가동 중지 시간」을 낱말로 세우기 어색하면 「서비스가 멈춘 시간」으로 풀어 쓴다 |
| preview | **미리 보기** | 미리 보기 약관·인프라 수명 주기 FAQ·미리 보기 기능 문서 한국어판 |
| private preview (목록 항목) | **비공개 미리 보기**(Private preview) | 인프라 수명 주기 FAQ 한국어판의 절 안 질문 제목, 미리 보기 약관 한국어판의 「비공개 미리 보기 및 공개 미리 보기」. 두 한국어판 본문은 「프라이빗 미리 보기」를 더 많이 쓰고 약관은 「개인 미리 보기」도 쓴다 — 짝 「공개 미리 보기」와 낱말이 맞서 한 쌍으로 읽히는 「비공개」를 고른다 |
| public preview (목록 항목) | **공개 미리 보기**(Public preview) | 인프라 수명 주기 FAQ·미리 보기 약관·Microsoft Entra 한국어판. 인프라 FAQ의 절 제목 「공개 프리뷰」는 쓰지 않는다 |
| Early Access Previews | 조기 액세스 미리 보기 | 미리 보기 약관 한국어판. 개념 이름으로 쓰지 않는다 — 비공개 미리 보기의 조건(운영 환경 금지, 남에게 줄 수 없음)을 대는 근거다 |
| general availability | **일반 공급(GA)** | 인프라 수명 주기 FAQ 「GA(일반 공급)」, 미리 보기 약관 「일반 공급("GA")」, Microsoft Entra 「GA (일반 공급)」. 개념 이름은 한국어를 앞에 둔다 |
| production workload / environment | 운영 환경 | 한국어판은 「프로덕션 워크로드」(인프라 FAQ)와 「프로덕션 또는 "라이브" 운영 환경」(약관)을 쓴다 — 뜻이 드러나는 「운영 환경」을 쓰고 처음 나올 때 실제 사용자가 쓰는 서비스를 실행하는 환경이라고 푼다 |
| Modern Lifecycle Policy | **최신 수명 주기 정책** | 최신 수명 주기 정책 한국어판 제목, Azure 플랫폼 수명 주기 FAQ 한국어판 |
| Fixed Lifecycle Policy | 고정 수명 주기 정책 | 최신 수명 주기 정책 한국어판. Azure 플랫폼 수명 주기 FAQ 한국어판의 「고정 정책」은 줄인 말이라 쓰지 않는다 |
| Mainstream / Extended Support | 일반 지원 / 확장 지원 | Azure 플랫폼 수명 주기 FAQ 한국어판 「일반 및 확장 지원 단계」. 쓸지는 step 5가 정한다 |
| Azure updates | Azure 업데이트 | 한국어 문서에 따로 붙은 이름이 없다(최신 수명 주기 정책 한국어판도 주소만 든다). 쪽 이름을 그대로 옮기고 주소(`azure.microsoft.com/updates`)를 함께 적는다 |
| end of support / retirement | 지원 종료 / 사용 중지 | 최신 수명 주기 정책 한국어판 「지원을 종료하기 전에」, 인프라 수명 주기 FAQ 한국어판 「사용 중지」(사용 중단·사용 중지 예정·폐기 예정이 섞였다 — 이 주제는 「지원 종료」를 주로 쓴다) |
| Microsoft Entra ID (옛 Azure AD) | (쓰지 않는다) | 덤프의 옛 이름 「Azure Active Directory」를 대조한 근거로만 적는다 — D22 |

## (phase 101) Azure security — Shared responsibility in the cloud
https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility

확인한 날 2026-10-31, Last updated on 2026-08-24. 사본: `docs-security-shared-responsibility.md`와 `ko-` 판.

- 워크로드의 책임은 그 워크로드가 SaaS·PaaS·IaaS·온-프레미스 데이터 센터 가운데 어디에 있느냐에 따라 달라진다 — 「첫 문단」
- 유형마다 쓰는 쪽이 하는 일과 Azure의 예: IaaS는 가상 머신·운영 체제·애플리케이션을 쓰는 쪽이 관리하고, 예는 Azure Virtual Machines·Azure Disk Storage·가상 네트워크다. PaaS는 VM이나 운영 체제를 관리하지 않고 앱을 배포하고, 예는 Azure App Service·Azure Functions·Azure SQL Database·Azure Storage다. SaaS는 다 만들어진 앱을 쓰고, 예는 Microsoft 365·Dynamics 365다 — 「첫 문단」 뒤 목록
- 많은 Azure 솔루션은 서비스 모델을 섞어 쓴다 — 같은 곳
- 이 문서의 「책임」은 각 통제를 누가 구성·운영·모니터링하느냐를 뜻하는 거버넌스의 말이고, 법적 결론이나 Microsoft와의 계약 조건을 바꾸지 않는다 — 「Note」
- 온-프레미스 데이터 센터에서는 스택 전체를 고객이 가진다. 클라우드로 옮기면 일부 책임이 Microsoft로 넘어간다. 어느 배포 유형이든 데이터와 ID는 고객의 것이다 — 「Division of responsibility」
- **책임 표**(행 10개, 열은 온-프레미스·IaaS·PaaS·SaaS. 칸은 고객·함께·Microsoft) — 「Responsibility matrix」
  - 고객 데이터 — 온-프레미스는 고객, IaaS는 고객, PaaS는 고객, SaaS는 고객
  - 구성과 설정 — 온-프레미스는 고객, IaaS는 고객, PaaS는 고객, SaaS는 고객
  - ID와 사용자 — 온-프레미스는 고객, IaaS는 고객, PaaS는 고객, SaaS는 고객
  - 클라이언트 장치 — 온-프레미스는 고객, IaaS는 고객, PaaS는 고객, SaaS는 함께
  - 애플리케이션 — 온-프레미스는 고객, IaaS는 고객, PaaS는 함께, SaaS는 함께
  - 네트워크 제어 — 온-프레미스는 고객, IaaS는 고객, PaaS는 함께, SaaS는 Microsoft
  - 운영 체제 — 온-프레미스는 고객, IaaS는 고객, PaaS는 Microsoft, SaaS는 Microsoft
  - 물리 호스트 — 온-프레미스는 고객, IaaS는 Microsoft, PaaS는 Microsoft, SaaS는 Microsoft
  - 물리 네트워크 — 온-프레미스는 고객, IaaS는 Microsoft, PaaS는 Microsoft, SaaS는 Microsoft
  - 물리 데이터 센터 — 온-프레미스는 고객, IaaS는 Microsoft, PaaS는 Microsoft, SaaS는 Microsoft
- 배포 유형과 관계없이 고객이 늘 지는 책임: 데이터(분류·보호·암호화 결정·데이터 거버넌스 요구 준수), 끝점(클라우드 서비스에 접근하는 휴대폰·노트북·데스크톱 같은 장치의 보호), 계정(사용자 접근을 만들고 관리하고 없애는 일), 접근 관리(역할 기반 액세스 제어·다단계 인증·조건부 액세스 정책) — 「Responsibilities you always retain」
- 함께 지는 책임의 나뉨 — 「Shared responsibilities explained」
  - 애플리케이션: IaaS에서는 배포한 앱을 고객이 모두 맡는다. PaaS·SaaS에서는 Microsoft가 앱 스택의 일부를 관리하지만 앱 구성·코드 보안·접근 제어는 고객이 맡는다
  - 네트워크 제어: IaaS에서는 방화벽·네트워크 분할을 비롯한 네트워크 보안을 고객이 모두 구성한다. PaaS에서는 Microsoft가 기본 네트워크 보안을 주고 앱 수준의 네트워크 통제는 고객이 구성한다. SaaS에서는 네트워크 보안을 Microsoft가 관리한다
  - 클라이언트 장치: SaaS에서 Microsoft가 일부 장치 관리 기능을 줄 수 있지만 끝점 보호와 규정 준수는 고객이 맡는다
- Microsoft가 맡는 것: 물리 보안(시설·물리 출입 통제·환경 통제), 물리 네트워크(데이터 센터 안의 라우터·스위치·케이블), 물리 호스트(클라우드 서비스를 올리는 물리 서버), 하이퍼바이저(IaaS·PaaS에서 VM을 가능하게 하는 가상화 계층), 플랫폼 서비스(PaaS·SaaS에서 운영 체제·런타임 환경·미들웨어) — 「Microsoft responsibilities」
- 한국어 표기: 제목은 「클라우드의 공동 책임」이지만 본문은 「공유 책임 모델」(두 번)이고, 절 제목도 「공유 책임 설명」이다. 표의 행은 고객 데이터·구성 및 설정·ID 및 사용자·클라이언트 디바이스·응용 프로그램·네트워크 제어·운영 체제·물리적 호스트·실제 네트워크·실제 데이터 센터, 칸은 고객·Shared·Microsoft(「Shared」를 옮기지 않았다). 유형 이름은 「인프라-서비스」·「인프라 서비스」(IaaS), 「서비스형 플랫폼」(PaaS, 세 번), 「소프트웨어-서비스」·「서비스형 소프트웨어」(SaaS)로 섞였다

쓰인 곳(phase 101 step 7): `azure-service-types.shared-responsibility-model`(책임 표 열 행의 배정, 고객이 늘 지는 책임 — 데이터의 보호와 암호화 결정·장치 보호·계정 관리·접근 관리, 함께 지는 책임의 나뉨 — 애플리케이션·네트워크 제어·장치, 물리 네트워크·물리 호스트를 푸는 말, IaaS·PaaS·SaaS에서 고객이 하는 일), `SharedResponsibilityDiagram`(행 열 개와 시나리오마다 선명한 행·「함께」 곁말 — 이 표 그대로. 「고객 데이터」 행은 Learn 단원 4의 말로 「정보와 데이터」, 「ID와 사용자」 행은 「계정과 ID」, 「클라이언트 장치」 행은 「장치」라 적었다), `azure-service-types.iaas`(VM이 IaaS의 예), az032·az033·az034 해설, D30·D32

쓰인 곳(phase 101 step 8): `azure-service-types.paas`(App Service·SQL Database가 PaaS의 예 — Functions·Storage는 쓰지 않았다, IaaS에서는 VM과 운영 체제를 고객이 관리하고 PaaS에서는 VM이나 운영 체제를 관리하지 않고 앱을 실행한다, 애플리케이션·네트워크 제어의 나뉨), `azure-service-types.saas`(Microsoft 365가 SaaS의 예 — Dynamics 365는 쓰지 않았다, 장치 보호는 고객), `ServiceTypesTable`(세 행의 「고객이 맡는 것」), az036·az037 해설, D31·D33·D34·D37·G18(위 두 개념이 고친 쪽을 따랐다)

## (phase 101) Azure 클라우드 컴퓨팅 사전 — What is infrastructure as a service (IaaS)?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-iaas

확인한 날 2026-10-31. 사본: `azure-dictionary-what-is-iaas.md`와 `ko-` 판.

- IaaS는 서버·스토리지·네트워킹을 필요할 때 빌려 쓰게 하는 클라우드 컴퓨팅 모델이다. 쓰는 쪽은 물리 하드웨어를 사지 않고 필요에 따라 리소스를 늘리거나 줄이며 쓴 만큼 낸다 — 「Infrastructure as a service definition」·「How does IaaS work?」
- 공급자는 그 기반 인프라를 자기 데이터 센터에서 호스트하고 관리하며, 쓰는 쪽은 웹 화면이나 API로 리소스에 접근해 구성한다 — 「How does IaaS work?」
- 한국어 표기: 제목은 「IaaS(서비스 제공 인프라)」다. 본문에서 SaaS를 「서비스형 소프트웨어」(두 번)로 쓴다

쓰인 곳(phase 101 step 7): `azure-service-types.iaas`(서버·스토리지·네트워크를 필요할 때 빌려 쓰고, 하드웨어를 사지 않으며, 필요에 따라 늘리고 줄이고 쓴 만큼 낸다), 표기 결정

## (phase 101) Azure 클라우드 컴퓨팅 사전 — What is platform as a service (PaaS)?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-paas

확인한 날 2026-10-31. 사본: `azure-dictionary-what-is-paas.md`와 `ko-` 판.

- PaaS는 개발자가 기반 인프라를 신경 쓰지 않고 앱을 만들고 배포하고 관리하게 하는 클라우드 컴퓨팅 모델이다. 개발자는 코드를 쓰는 데 집중하고 인프라·유지 관리·확장은 공급자가 맡는다 — 「Platform as a service definition」
- PaaS에는 앱 개발에 필요한 운영 체제·런타임 환경·데이터베이스·개발 도구·미들웨어와 호스팅·확장 기능이 들어 있다 — 같은 절
- 배포하면 런타임·미들웨어·운영 체제 관리는 플랫폼이 맡는다. 수요에 따라 리소스를 자동으로 늘리고 줄이며, 보안 패치·업데이트·인프라 유지 관리는 PaaS 공급자가 한다 — 「How does PaaS work?」
- 한국어 표기: 제목은 「PaaS(Platform as a Service)」로 한국어 이름을 붙이지 않았다

- Microsoft 365는 Word·Excel·Outlook·Teams 같은 생산성 도구를 클라우드로 제공하는 SaaS다 — 「Is M365 a PaaS?」 (phase 103)

쓰인 곳(phase 101 step 8): `azure-service-types.paas`(플랫폼에 운영 체제·개발 도구가 들어 있다는 것으로 플랫폼을 푸는 한 줄, 수요에 따라 리소스를 자동으로 늘리고 줄인다), D35·G17
쓰인 곳(phase 103 step 9): `azure-virtual-networking.expressroute`(Microsoft 365를 푸는 한 줄)

## (phase 101) Azure 클라우드 컴퓨팅 사전 — What is software as a service (SaaS)?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-saas

확인한 날 2026-10-31. 사본: `azure-dictionary-what-is-saas.md`와 `ko-` 판.

- SaaS는 앱을 사서 직접 설치하지 않고 구독해 인터넷으로(대개 웹 브라우저로) 쓰는 클라우드 기반 소프트웨어 제공 모델이다. 기반 인프라·보안·유지 관리·업데이트는 공급자가 맡는다 — 「Software as a service definition」
- 앱은 공급자의 서버에서 실행되고 처리와 데이터 저장도 거기서 한다. 그래서 인터넷에 연결된 기기라면 어디서나 쓸 수 있다 — 「How does SaaS work?」
- SaaS의 흔한 예로 이메일 서비스, 고객 관계 관리(CRM) 시스템, 사무용 생산성 도구를 든다 — 「Comparing SaaS, PaaS, and MaaS」
- 한국어 표기: 제목은 「SaaS(Software as a Service)」로 한국어 이름을 붙이지 않았다

쓰인 곳(phase 101 step 8): `azure-service-types.saas`(사서 설치하지 않고 인터넷으로 — 대개 웹 브라우저로 — 쓴다, 앱이 공급자의 서버에서 실행되고 처리·저장도 거기서 해 인터넷에 연결된 기기라면 어디서나 쓴다, 업데이트는 공급자, 생산성 앱을 「사무용 앱」으로 푸는 근거), az038 해설, G18

## (phase 101) Azure 클라우드 컴퓨팅 사전 — What is middleware?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-middleware

확인한 날 2026-10-31. 사본: `azure-dictionary-what-is-middleware.md`와 `ko-` 판.

- 미들웨어는 앱·데이터베이스·운영 체제 사이를 잇는 소프트웨어 계층으로, 서로 다른 앱·시스템·서비스가 데이터를 주고받고 함께 동작하게 돕는다 — 첫 문단·「Middleware definition」
- 한국어 표기: middleware → 미들웨어(사전 한국어판 제목 「미들웨어란?」, Learn 단원 3 한국어판)

쓰인 곳(phase 101 step 8): `azure-service-types.paas`(미들웨어를 푸는 한 줄)

## (phase 101) Azure App Service — App Service overview
https://learn.microsoft.com/en-us/azure/app-service/overview

확인한 날 2026-10-31, Last updated on 2026-08-18. 사본: `docs-app-service-overview.md`와 `ko-` 판.

- Azure App Service는 웹앱·모바일 백 엔드·REST API를 그 아래 인프라를 관리하지 않고 실행하게 하는 플랫폼이다 — 「첫 문단」
- 쓴 리소스만큼 내고, 사업에 맞춰 스케일 업·스케일 아웃할 수 있으며, 수요에 따라 앱을 자동으로 확장한다 — 「Small businesses and startups」
- 이 문서는 App Service를 「PaaS」라고 부르지 않는다. App Service가 PaaS라는 근거는 위 「Shared responsibility in the cloud」의 PaaS 예다
- 한국어 표기: 「App Service 개요」, Azure App Service(이름 그대로)

쓰인 곳(phase 101 step 8): `azure-service-types.paas`(App Service는 웹 앱 같은 앱을 그 아래 인프라를 관리하지 않고 실행하게 해 준다 — 자동 확장은 PaaS 사전을 근거로 썼다), D31·D33·D34·D35

다시 확인한 날 2026-10-31. 영문·`ko-` 사본을 다시 받았다. (phase 103)

- App Service는 여러 웹 스택(.NET·Java·Node.js·Python·PHP)을 Windows와 Linux에서 실행한다. 컨테이너로 만든 앱은 사용자 지정 컨테이너로 배포할 수도 있다 — 「첫 부분」 (phase 103)
- GitHub Actions·Azure Pipelines 등으로 지속적으로 배포하고, 스테이징 환경을 거쳐 배포할 수 있다 — 같은 부분의 기능 목록 (phase 103)
- 표준 App Service 요금제를 고르는 경우의 하나로 「운영 체제와 런타임의 관리·패치가 저절로 되기를 원할 때」를 든다 — 운영 체제 패치를 플랫폼이 맡는다는 근거 — 「Quick decision guide」 (phase 103)
- 같은 문서의 Managed Instance(설치 스크립트로 운영 체제 수준 기능을 구성하는 선택지)는 확인만 했다. 쓰지 않는다 (phase 103)

쓰인 곳(phase 103 step 4): `azure-compute.app-service`(Windows·Linux, 여러 언어, 운영 체제는 플랫폼이 맡는다, 지속적 배포), `HostingOptionsTable`(App Service 행), D53·D55

## (phase 101) Azure App Service — Scale up an app in Azure App Service
https://learn.microsoft.com/en-us/azure/app-service/manage-scale-up

확인한 날 2026-10-31, Last updated on 2025-09-08. 사본: `docs-app-service-manage-scale-up.md`와 `ko-` 판.

- App Service 앱의 크기 조정은 둘이다. 스케일 업은 앱이 속한 App Service 플랜의 가격 책정 계층을 바꿔 CPU·메모리·디스크 공간이나 추가 기능을 더 얻는 것이고, 스케일 아웃은 앱을 실행하는 VM 인스턴스 수를 늘리는 것이다. 인스턴스 수는 정한 규칙과 일정에 따라 자동으로 늘릴 수도 있다 — 「첫 문단」
- 한국어 표기: 제목 「Azure App Service에서 앱 강화」, pricing tier → 가격 책정 계층, scale up → 강화·스케일 업(섞였다)

쓰인 곳(phase 101 step 8): `azure-service-types.paas`(App Service의 예로 한정해 — 가격 책정 계층을 높은 것으로 바꿔 CPU와 메모리를 더 얻는다), D35(가격 책정 계층을 바꿔 메모리를 더하는가 — 덤프끼리 갈림을 가르는 근거)

## (phase 101) Azure SQL Database — What is Azure SQL Database?
https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview

확인한 날 2026-10-31, Last updated on 2026-10-13. 사본: `docs-azure-sql-database-paas-overview.md`와 `ko-` 판.

- Azure SQL Database는 완전 관리형 PaaS 데이터베이스 엔진이다. 업그레이드·패치·백업·모니터링 같은 데이터베이스 관리 대부분을 사용자 개입 없이 처리한다 — 「첫 문단」
- 기본으로 들어 있는 PaaS 기능 덕분에 쓰는 쪽은 업무에 필요한 데이터베이스 관리·최적화에 집중한다 — 같은 문서 본문
- 한국어 표기: 제목 「Azure SQL Database란?」, Azure SQL Database(이름 그대로)

쓰인 곳(phase 101 step 8): `azure-service-types.paas`(Azure에서의 예 — SQL Database가 PaaS라는 근거, 업그레이드·패치·백업 같은 관리 대부분을 사람 손 없이 처리한다), D32·D34

쓰인 곳(phase 102 step 2): `azure-regions-zones.zone-service-categories`(Azure SQL Database를 푸는 한 구절 — 업그레이드·백업 같은 관리를 Azure가 대신 처리하는 데이터베이스 서비스)

## (phase 101) Azure Cosmos DB — introduction
https://learn.microsoft.com/en-us/azure/cosmos-db/introduction

확인한 날 2026-10-31, Last updated on 2026-06-08. 사본: `docs-cosmos-db-introduction.md`와 `ko-` 판.

- Azure Cosmos DB는 완전 관리형 NoSQL·벡터 데이터베이스이고, 관리·업데이트·패치를 자동으로 처리한다 — 「첫 문단」
- **이 문서는 Cosmos DB를 IaaS·PaaS·SaaS 어느 것이라고도 말하지 않는다.** 위 「Shared responsibility in the cloud」의 유형별 예에도 없다. 「완전 관리형」만으로 PaaS라고 적지 않는다
- 한국어 표기: 「완전 관리형 데이터베이스 서비스」

쓰일 곳: D36(Cosmos DB의 서비스 유형은 쓰지 않는다는 근거). 개념 글에는 쓰지 않는다

## (phase 101) 한국어 표기 정리 — `azure-service-types`

위 항목들의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다(phase 101 step 6). Microsoft 한국어 문서의 표기를 따르고(guide 「배경」), 한국어판 사이에 표기가 갈리면 근거를 적는다.
받아 둔 한국어판(`raw/official/ko-…`)을 모두 세어 정했다.

| 영문 | 쓸 이름 | 근거 |
|---|---|---|
| shared responsibility model | **공유 책임 모델** | 「공유 책임 모델」이 여섯 문서에 14번 나온다 — Learn 「Describe cloud computing」 단원 2·4·8(1·5·3번), 「Describe cloud service types」 단원 2(1번), 보안 문서 「Shared responsibility in the cloud」 본문(2번), 「Reliability in Azure」 본문(2번). 「공동 책임 모델」은 두 번뿐이다 — 학습 가이드 한국어판의 기술 목록 한 줄, 보안 문서의 다른 문서 링크 한 줄. 보안 문서 제목 「클라우드의 공동 책임」과 「Reliability in Azure」 절 제목 「안정성에 대한 공동 책임」은 본문과 갈린 제목이다. 그래서 **주제 제목도 「서비스 유형과 공유 책임」으로 바꾼다**(guide 「배경」 — 주제 id는 그대로, step 7이 `topic-map.md`의 그 칸을 고친다). 용어집·주제 지도의 「공동 책임」은 쓰지 않는다 |
| infrastructure as a service | **IaaS(서비스형 인프라)** | 세 이름을 같은 꼴로 맞춘다(guide). 「서비스형 ○○」 꼴이 일곱 번(PaaS 넷 — Learn 단원 3 제목·보안 문서 셋, SaaS 셋 — IaaS 사전 둘·보안 문서 하나)으로 「서비스로서의 ○○」 꼴 세 번(IaaS 둘 — Learn 단원 2 제목·플랫폼 수명 주기 FAQ, SaaS 하나 — 이점 단원 4)보다 많다. **다만 「서비스형 인프라」라는 말 자체는 받은 한국어판에 없다** — IaaS는 「서비스로서의 인프라」(두 번)와 「서비스 제공 인프라」(학습 가이드·사전, 일곱 번)로 쓰인다. 「서비스 제공 인프라」는 「서비스를 제공하는 인프라」로 읽혀 뜻이 흐려 쓰지 않고, 셋을 한 꼴로 맞추려고 PaaS·SaaS와 같은 「서비스형」을 붙인다 |
| platform as a service | **PaaS(서비스형 플랫폼)** | Learn 단원 3 한국어판 제목, 보안 문서 한국어판(세 번). 「서비스로서의 플랫폼」은 받은 한국어판에 없다 |
| software as a service | **SaaS(서비스형 소프트웨어)** | IaaS 사전 한국어판(두 번), 보안 문서 한국어판. 「서비스로서의 소프트웨어」(이점 단원 4, 한 번)는 쓰지 않는다. Learn 단원 4·SaaS 사전 한국어판은 영문 「Software as a Service」를 그대로 둔다 |
| cloud provider / consumer(customer) | 클라우드 공급자 / 고객 | Learn 단원 4 한국어판은 「클라우드 공급자」·「소비자」, 보안 문서는 「고객」. 책임을 나누는 말로는 「고객」을 쓴다. 책임 표의 칸 이름은 「고객」·「함께」·「공급자」(보안 문서는 「Microsoft」 — 공급자가 Microsoft인 Azure의 경우라고 밝히면 「Microsoft」도 쓸 수 있다) |
| physical datacenter / network / hosts | 물리 데이터 센터 / 물리 네트워크 / 물리 호스트 | Learn 단원 4 한국어판 「물리적 데이터 센터」, 보안 문서 한국어판 「물리적 호스트」. 두 한국어판의 「실제 네트워크」·「실제 호스트」·「실제 데이터 센터」는 physical의 오역이라 쓰지 않는다. 「물리적」은 이 과목의 표기(「물리 보안」)에 맞춰 「물리」로 줄인다 |
| information and data / devices / accounts and identities | 정보와 데이터 / 장치 / 계정과 ID | Learn 단원 4 한국어판 「정보 및 데이터」·「디바이스」·「계정 및 ID」. 「디바이스」는 이 과목이 다른 주제에서 쓴 「장치」로 쓴다 |
| operating system / network controls / applications / identity and access | 운영 체제 / 네트워크 제어 / 애플리케이션 / ID와 액세스 | Learn 단원 4·보안 문서 한국어판. 한국어판의 「응용 프로그램」은 이 과목이 쓰는 「앱」·「애플리케이션」과 맞추려고 쓰지 않는다 |
| configurations and settings / identities and users / client devices | 구성과 설정 / ID와 사용자 / 클라이언트 장치 | 보안 문서 한국어판 「구성 및 설정」·「ID 및 사용자」·「클라이언트 디바이스」 |
| lift-and-shift migration | 리프트 앤 시프트 마이그레이션 | Learn 단원 2 한국어판 |
| middleware | 미들웨어 | Learn 단원 3, 미들웨어 사전 한국어판 |
| Azure Virtual Machines / App Service / SQL Database / Functions / Storage | Azure 가상 머신(VM) / Azure App Service / Azure SQL Database / Azure Functions / Azure Storage | 각 문서 한국어판이 이름을 옮기지 않는다. VM은 phase 100의 「Azure VM(Virtual Machines)」·「가상 머신」 표기를 따른다 |
| Microsoft 365 | Microsoft 365 | 보안 문서 한국어판. 용어집의 옛 이름 「Office 365」는 쓰지 않는다 — G18 |

## (phase 102) Azure reliability — What are availability zones?
https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview

확인한 날 2026-10-31. 「Last updated on」 2026-09-23. 사본: `docs-reliability-availability-zones-overview.md`와 `ko-` 판.

- 많은 지역이 가용성 영역을 갖춘다. 가용성 영역은 한 지역 안에서 따로 떨어진 데이터 센터 묶음이고, 영역마다 전원·냉각·네트워크 인프라가 따로라서 한 영역이 중단돼도 남은 영역이 지역의 서비스와 용량을 이어 간다. 여러 영역을 저절로 쓰는 서비스도 있고, 고객이 여러 영역 배포를 구성해야 하는 서비스도 있다 — 첫 부분
- 가용성 영역은 영역 전체가 멈추는 큰 중단뿐 아니라, 한 영역 안의 서버 랙이나 클러스터 하나가 실패하는 작은 장애에도 대비가 된다 — 첫 부분
- 영역은 한 지역 안에서 물리적으로 떨어진 데이터 센터 하나 이상을 논리적으로 묶은 것이다. 한 영역에 정전·네트워크 문제가 생겨도 다른 영역은 계속 일하게 지어져 있다. **데이터 센터 하나만으로는 이런 보호가 되지 않는다** — 「Datacenters and availability zones」
- 데이터 센터의 위치는 엄격한 취약성 위험 평가 기준으로 고르고, 영역 사이에 함께 걸리는 위험도 따진다 — 「Datacenters and availability zones」
- 영역끼리는 보통 몇 킬로미터 떨어져 있고 대개 100킬로미터 안에 있다. 그래서 대기 시간이 짧으면서도 국지 정전이나 날씨가 여러 영역에 한꺼번에 미칠 가능성이 준다 — 같은 절(수치는 「보통」·「대개」라는 단서가 붙은 값이다)
- **가용성 영역 지원 유형** 둘 — 영역 중복 리소스: 서비스가 리소스를 여러 영역에 복제하거나 나눠 둔다. 지원 지역에서 저절로 영역 중복이 되는 서비스도 있고, 고객이 영역 중복으로 구성해야 하는 서비스도 있다. 영역에 중단이 나면 다른 영역으로의 장애 조치를 Microsoft가 맡는다.
  영역 리소스: 고객이 고른 영역 하나에 배포한다. 다른 영역의 장애와는 격리되지만 그것만으로 영역 중단에 대비되지 않는다 — 대비하려면 고객이 여러 영역에 리소스를 따로 두고, 영역에 중단이 나면 다른 영역으로의 장애 조치도 고객이 맡는다 — 「Types of availability zone support」
- 리소스를 영역 중복으로 구성하거나 영역 리소스를 여러 영역에 하나씩 두면, 영역 하나의 중단을 견딘다 — 같은 절
- 가용성 영역을 쓰도록 구성하지 않은 리소스(지역이 영역을 지원하지 않거나 고객이 그렇게 고른 경우)는 비영역 배포 또는 지역 배포라 부른다. Azure가 그 리소스를 지역의 아무 영역에나 둘 수 있어서, 어느 영역이 중단되면 함께 멈출 수 있다 — 같은 절
- 데이터 센터마다 물리 영역이 정해지고, 물리 영역은 구독마다 논리 영역 번호(영역 1·2·3 등)로 이어진다. 같은 물리 영역이 구독마다 다른 번호일 수 있다 — 「Physical and logical availability zones」(이 주제에서는 「영역 1」처럼 영역을 가르는 이름표가 공식 문서의 꼴이라는 근거로만 쓴다)
- Microsoft는 지역마다 Azure 서비스의 업데이트를 한 번에 영역 하나씩 적용하려 한다. 그 덕을 보려면 워크로드가 이미 여러 영역에 걸쳐 있어야 한다 — 「Availability zones and Azure updates」
- 영역끼리는 고성능 네트워크로 이어지고, **같은 지역의 가용성 영역 사이 데이터 전송에는 요금을 매기지 않는다** — 「Inter-zone networking」(Learn 단원 5와 다름 — 그 항목의 「현행 문서와 다름」 4)
- 운영 워크로드는 지역이 지원하면 여러 가용성 영역을 쓰도록 구성한다. 데이터 상주 요구로 한 지역에 묶인 워크로드는 여러 영역에 나눠 두는 것이 데이터를 지역 밖으로 옮기지 않고 가용성을 높이는 주된 방법이다. **가용성 영역은 지역 전체의 중단을 막지 못한다** — 「Availability zone architectural guidance」
- 영역을 지원하는 지역의 표에서 영역 수는 대부분 셋이고 미국 동부 2는 넷이다 — 「Regions with availability zones」(지역마다의 목록은 바뀌므로 적지 않는다. 「최소 셋」이 「언제나 셋」이 아니라는 근거로만 쓴다)
- 한국어 표기: availability zone → 가용성 영역(제목 「가용성 영역이란?」), types of availability zone support → **가용성 영역 지원 유형**(절 제목), zone-redundant resource → 영역 중복 리소스, zonal resource → 영역 리소스, nonzonal resource → 비 영역 리소스(띄어 씀), regional deployment → 지역 배포, outage → 중단, failover → 장애 조치, datacenter → 데이터 센터

쓰인 곳(phase 102 step 2): `azure-regions-zones.availability-zones`(정의, 랙 장애에도 — 클러스터는 쓰지 않았다, 데이터 센터 하나로는 이 보호가 안 됨, 영역 사이 거리의 질적 설명, 지역 전체 중단은 막지 못함, 영역 사이 전송 요금 없음, 「영역 1·2·3」 이름표),
`azure-regions-zones.zone-service-categories`(지원 유형의 나눔과 이름, 누가 복제하고 누가 장애 조치를 맡는가, 저절로 되는 서비스와 고객이 구성하는 서비스, 비영역 배포), az042·az043·az044 해설, `ZoneIsolationDiagram`, D39·D40·D45(D45는 쓰지 않은 근거)·G22

쓰인 곳(phase 102 step 5): `azure-resource-hierarchy.resource-group`(리소스 그룹을 나눠도 데이터 센터 하나의 장애에 대비가 되지 않고, 그 대비는 여러 가용성 영역에 나눠 두는 것이다 — ARM 항목의 NO.87 판단), az049·az050 해설

쓰인 곳(phase 103 step 2): `azure-compute.scale-sets`(가용성 영역을 푸는 한 줄 — 한 지역 안에서 전원·냉각·네트워크를 따로 갖춘 데이터 센터 묶음, 한 영역이 멈춰도 다른 영역은 영향을 받지 않음), `azure-compute.availability-sets`(같은 풀이를 되짚음), az058~az060 해설

## (phase 102) Azure reliability — Azure region pairs and nonpaired regions
https://learn.microsoft.com/en-us/azure/reliability/regions-paired

확인한 날 2026-10-31. 「Last updated on」 2026-10-15. 사본: `docs-reliability-regions-paired.md`와 `ko-` 판.

- Azure 지역은 서로 독립이다. Microsoft는 일부 지역을 다른 지역과 짝짓고, 두 지역은 보통 같은 지리에 있다. 소수의 서비스가 이 짝으로 지역 사이 복제(지역 중복)를 하고, 지역이 복구할 수 없을 만큼 실패하는 드문 경우의 재해 복구 일부에 쓴다 — 첫 부분
- **짝이 없는 지역도 많고**, 그런 지역은 가용성 영역을 주된 중복 수단으로 쓴다. 짝이 있든 없든 서비스 다수가 지역 중복을 지원한다 — 첫 부분
- 짝을 쓰는 서비스의 예로 지역 중복 스토리지(GRS)가 데이터를 짝 지역에 저절로 복제할 수 있다고 든다 — 「Paired regions」
- 짝 지역을 보조 지역으로 쓰면 얻는 것 셋: 지리 전체에 걸친 중단 때 짝마다 한 지역을 먼저 복구한다, 계획된 시스템 업데이트를 짝의 두 지역에 시차를 두고 적용한다, 데이터 상주 요구를 맞추도록 거의 모든 지역이 짝과 같은 지리에 있다(예외는 지역 목록) — 「Paired regions」
- **짝의 한 지역에 리소스를 배포하는 것만으로는 복원력·고가용성·재해 복구·장애 조치가 저절로 생기지 않는다.** 짝을 쓰든 안 쓰든 고가용성과 재해 복구 계획은 고객이 세운다. Microsoft가 관리하는 짝 사이 장애 조치를 주된 재해 복구 방법으로 삼지 말라 — 예로 GRS 저장소 계정의 Microsoft 관리 장애 조치는 큰 재난에서 복구를 거듭 실패한 뒤에만 한다 — 「Paired regions」 Important
- 고객은 한 지역이나 그 짝 지역에만 묶이지 않고, 사업 요구에 맞는 어느 지역에나 서비스를 둘 수 있다 — 「Paired regions」
- 대부분의 짝은 양방향이다(예: 미국 서부와 미국 동부가 서로의 짝). 한 방향으로만 짝지은 비대칭 짝도 있다 — 예: 브라질 남부의 짝은 브라질 지리 밖의 미국 중남부이지만 미국 중남부의 짝은 브라질 남부가 아니다. 미국 서부 3은 미국 동부와 한 방향으로 짝지어 있다 — 「Asymmetrically paired regions」
- 짝 목록에서 동아시아와 동남아시아, 미국 동부와 미국 서부는 서로의 짝이다. 이탈리아 북부·폴란드 중부·이스라엘 중부는 짝 칸이 비어 있다(N/A) — 「Azure region pairs list」(목록 전체는 바뀌므로 적지 않는다)
- 짝 사이 거리에 관한 수치는 이 문서에 없다(Learn 단원 5의 「300마일 이상」은 쓰지 않는다 — 단원 5 항목의 「현행 문서와 다름」 2)
- 한국어 표기: region pair → 지역 쌍, paired region → 쌍을 이루는 지역, nonpaired region → 쌍을 이루지 않는 지역(제목은 「페어링을 이루지 않은 지역」, 본문은 「쌍을 이루지 않는/않은」), asymmetrically paired → 비대칭 쌍, geo-redundant storage → 지역 중복 스토리지(GRS), West US / East US → 미국 서부 / 미국 동부

- 계획된 업데이트에 시차를 두는 까닭: 드물게 업데이트에 결함이 있을 때 그 영향을 줄이고, 짝의 두 지역을 함께 쓰도록 설계한 솔루션이 멈추지 않게 하려는 것이다 — 「Paired regions」 Sequential updating (Learn 단원 5도 중단 시간과 애플리케이션 중단 위험을 줄이려는 것이라 한다) (phase 102 step 3)

쓰인 곳(phase 102 step 3): `azure-regions-zones.region-pairs`(Microsoft가 짝짓는다, 짝 없는 지역이 많다, 지역 중복 스토리지(GRS)가 짝 지역에 복제한다, 이점 셋과 업데이트에 시차를 두는 까닭, 저절로 장애 조치되지 않고 대비 계획은 고객이 세운다, 고객은 지역이나 그 짝에 묶이지 않는다, 비대칭 짝, 짝의 예), az045·az046 해설, `RegionPairDiagram`(지역 재해 때 고객이 구성해 둔 장애 조치, 계획된 업데이트는 한 지역씩), G21

## (phase 102) Azure reliability — Azure nonregional services
https://learn.microsoft.com/en-us/azure/reliability/regions-nonregional-services

확인한 날 2026-10-31. 「Last updated on」 2026-01-22. 사본: `docs-reliability-regions-nonregional-services.md`와 `ko-` 판.

- 비지역 서비스는 특정 Azure 지역에 배포하지 않는 서비스다 — 첫 부분
- 비지역 서비스는 두 갈래다. 전역 서비스는 세계 여러 지역에 배포되어 한 지역이 실패해도 다른 지역의 인스턴스가 계속 동작하므로, 고객이 지역 전체 중단에 따로 대비하지 않아도 된다. 지리 서비스는 특정 지역이 아니라 지리 영역에 배포되고 그 안의 지역 하나 이상이 요청을 처리한다 — 「Types of nonregional services」
- Microsoft Entra ID는 구성에 따라 전역이 될 수도 지리가 될 수도 있다 — 같은 절
- 비지역 서비스는 서비스 자체의 지역을 고르지 않지만, 함께 쓰는 부속 구성 요소의 지역은 골라야 할 수 있다(예: Azure Virtual Desktop의 호스트 풀 VM) — 「Regionally dependent service components」
- 목록에 Microsoft Entra ID, Azure DNS(공용 영역·사설 영역), Azure Traffic Manager가 있다. 그 밖에 Azure Policy, 관리 그룹(Azure management groups), 구독(Azure subscriptions), Azure portal도 있다 — 「List of nonregional services」(목록은 바뀌므로 이름은 앞의 셋만 예로 쓴다. 관리 그룹·구독은 `azure-resource-hierarchy`의 몫)
- 한국어 표기: nonregional services → 비지역 서비스(본문·절 제목. 문서 제목은 「비지정 서비스 Azure」로 잘못 옮겼다), global services → 글로벌 서비스, geographic services → 지리적 서비스

쓰인 곳(phase 102 step 1): `azure-regions-zones.region`(지역을 고르지 않는 서비스의 현행 예 — Microsoft Entra ID·Azure DNS), az040·az041 해설, `AzureRegionDiagram`

쓰인 곳(phase 102 step 2): `azure-regions-zones.zone-service-categories`(비영역 리소스와 비지역 서비스를 가르는 문단 — 비지역 서비스는 가용성 영역 지원 유형과 다른 갈래다)

쓰인 곳(phase 102 step 5): `azure-resource-hierarchy.resource`(지역을 고르지 않고 쓰는 서비스도 있어 모든 리소스가 특정 지역에 놓이는 것은 아니다 — G24. 서비스 이름은 들지 않았다)

## (phase 102) Microsoft Entra — What is Microsoft Entra?
https://learn.microsoft.com/en-us/entra/fundamentals/whatis

확인한 날 2026-10-31. 「Last updated on」 2026-06-18. 사본: `docs-entra-whatis.md`와 `ko-` 판.

- Microsoft Entra ID는 Microsoft Entra 제품군의 바탕이 되는 클라우드 기반 ID·액세스 관리 서비스다. 사용자·장치·앱·리소스가 누구인지 확인(인증)하고, 정책을 적용하고, 보호한다 — 「Microsoft Entra ID」
- 한국어 표기: Microsoft Entra ID(옮기지 않는다), identity and access management → ID 및 액세스 관리, authentication → 인증

쓰인 곳(phase 102 step 1): `azure-regions-zones.region`, az041 해설(Microsoft Entra ID를 푸는 한 줄 — 사용자가 누구인지 확인하고 무엇에 접근할 수 있는지 관리하는 클라우드 서비스)

쓰인 곳(phase 102 step 6): `azure-resource-hierarchy.subscription`, az051 해설(Microsoft Entra ID를 이 주제에서 다시 푸는 한 줄 — 같은 뜻)

쓰인 곳(phase 103 step 3): `azure-compute.virtual-desktop`(Microsoft Entra ID를 이 주제에서 다시 푸는 한 줄 — 같은 뜻)

## (phase 102) Azure DNS — Azure DNS overview
https://learn.microsoft.com/en-us/azure/dns/dns-overview

확인한 날 2026-10-31. 「Last updated on」 2026-07-28. 사본: `docs-dns-overview.md`와 `ko-` 판.

- DNS(Domain Name System)는 서비스 이름을 IP 주소로 바꿔 준다(이름 확인). Azure DNS는 Azure 인프라로 DNS 호스팅·이름 확인·부하 분산을 제공한다 — 첫 부분
- Azure Traffic Manager는 DNS를 써서 트래픽을 나누는 부하 분산 서비스이고, 공개된 애플리케이션으로 오는 요청을 전 세계 Azure 지역에 나눠 보낸다 — 같은 부분(Azure DNS가 제공하는 서비스 목록)
- 한국어 표기: Azure DNS·Azure Traffic Manager(옮기지 않는다), resolve → 확인, load balancing → 부하 분산
- Azure DNS의 서비스는 셋이다 — 도메인을 호스트하는 Azure Public DNS, 가상 네트워크 안의 이름을 맡는 Azure Private DNS, 온-프레미스와 프라이빗 영역 사이의 질의를 잇는 Azure DNS Private Resolver. `azure-dns`는 앞의 둘을 「프라이빗 DNS 도메인」까지만 쓴다. Private Resolver는 쓰지 않는다 — 첫 부분 (phase 103)
- 이 사본에는 DNSSEC이 나오지 않는다. 용어집 2-21이 드는 DNSSEC은 쓰지 않는다 (phase 103)

쓰인 곳(phase 102 step 1): `azure-regions-zones.region`, az041 해설(Azure DNS를 푸는 한 줄 — 웹 주소 같은 이름을 컴퓨터가 쓰는 IP 주소로 바꿔 주는 서비스. Traffic Manager는 쓰지 않아도 된다)
쓰인 곳(phase 103 step 6): `azure-virtual-networking.virtual-network`(DNS를 푸는 한 줄)
쓰인 곳(phase 103 step 9): `azure-virtual-networking.azure-dns`(DNS를 되짚는 한 줄, 프라이빗 DNS 도메인), az078 해설

## (phase 102) Azure Government — What is Azure Government?
https://learn.microsoft.com/en-us/azure/azure-government/documentation-government-welcome

확인한 날 2026-10-31. 「Last updated on」 2026-05-19. 사본: `docs-azure-government-welcome.md`와 `ko-` 판.

- Azure Government는 미국 정부 기관과 그 협력사를 위한 전용 클라우드이고, 미국 정부의 여러 규정과 요구를 받는 데이터를 다룰 수 있다 — 첫 부분
- Azure Government는 미국 안에만 있는 물리적으로 격리된 데이터 센터와 네트워크를 쓴다. 전역 Azure와 비교해, 고객 데이터를 미국 안에 저장한다는 계약상 약속과 고객 데이터를 처리하는 시스템에 접근할 수 있는 사람을 심사를 거친 미국인으로 제한하는 보호가 더 붙는다 — 첫 부분
- 고객(미국 연방·주·지방 정부나 그 협력사)은 자격 확인을 받는다 — 첫 부분
- 전역 Azure와 같은 기반 기술로 IaaS·PaaS·SaaS를 제공하고, 연결한 뒤에는 대부분 전역 Azure와 같은 경험이지만 서비스 가용성과 기능에 차이가 있다 — 「Compare Azure Government and global Azure」
- 지역 목록에 US Gov Arizona·US Gov Texas·US Gov Virginia가 있고, US Gov Arizona와 US Gov Texas가 서로의 짝이다 — 「List of regions」
- 한국어 표기: Azure Government(옮기지 않는다), global Azure → 글로벌 Azure

쓰인 곳(phase 102 step 3): `azure-regions-zones.sovereign-regions`(미국 정부 기관과 협력사를 위한 Azure — 미국 안의 물리적으로 격리된 데이터 센터와 네트워크, 고객 데이터를 다루는 시스템에 접근하는 사람을 심사를 거친 미국인으로 제한, 연방·주·지방 정부 기관이나 협력사가 자격 확인을 받아 쓴다, 같은 기반 기술 — 인스턴스를 푸는 줄), az047 해설, D43. 짝(US Gov Arizona·US Gov Texas)은 쓰지 않았다

## (phase 102) Azure in China — Microsoft Azure operated by 21Vianet
https://learn.microsoft.com/en-us/azure/china/overview-operations

확인한 날 2026-10-31. 「Last updated on」 2023-12-13. 사본: `docs-china-overview-operations.md`와 `ko-` 판(한국어판도 영문 그대로다).

- Microsoft Azure operated by 21Vianet(Azure in China)은 중국에 있는, 물리적으로 분리된 클라우드 서비스 인스턴스다. 21Vianet(Shanghai Blue Cloud Technology Co., Ltd.)이 독립적으로 운영하고 거래한다 — 「What is Microsoft Azure operated by 21Vianet?」
- Azure in China는 전역 Azure와 기능 차이가 있고 그 차이는 줄어드는 중이다 — 「Service availability and roadmaps」
- 접근을 중국 안으로 제한한다는 말은 이 문서에 없다
- 한국어 표기: 한국어판이 이름을 옮기지 않는다. Learn 단원 5 한국어판은 「21Vianet」, 「What are Azure regions?」 한국어판은 「21Vianet에서 운영하는 Microsoft Azure」 — 이 주제는 「21Vianet이 운영하는 Microsoft Azure(Microsoft Azure operated by 21Vianet)」로 쓴다

쓰인 곳(phase 102 step 3): `azure-regions-zones.sovereign-regions`(중국 안에 있고 물리적으로 분리된 인스턴스, 21Vianet이 독립적으로 운영), az047 해설, D41·D42. 「중국에서만 접근」은 쓰지 않았다(D42)

## (phase 102) Azure Germany (이전 버전 문서) — Welcome to Azure Germany
https://learn.microsoft.com/en-us/previous-versions/azure/germany/germany-welcome

확인한 날 2026-10-31. 「Last updated on」 2020-10-16. 사본: `docs-germany-welcome.md`(영문만).

- Microsoft Cloud Germany는 2018년 8월부터 새 고객을 받지 않았고, 2020년 9월 30일에 2021년 10월 29일로 문을 닫는다고 알렸다 — 첫 부분 Note. 문서는 `previous-versions` 아래로 옮겨져 있다
- Azure Germany는 독일의 데이터 관리 수탁자가 고객 데이터를 관리하던, 물리적으로 격리된 Azure 인스턴스였다 — 첫 부분(지원이 끝난 서비스라 쓰지 않는다)

쓰일 곳: D44 — 개념 글에 쓰지 않는다(근거 기록)

## (phase 102) 한국어 표기 정리 — `azure-regions-zones`

위 항목들과 단원 5·「What are Azure regions?」 항목의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다(phase 102 step 0). Microsoft 한국어 문서의 표기를 따르고(guide 「배경」), 한국어판 사이에 표기가 갈리면 근거를 적는다.
받아 둔 한국어판(`raw/official/ko-…`)에서 낱말을 세어 정했다 — L5는 Learn 단원 5, R은 「What are Azure regions?」, AZ는 「What are availability zones?」, P는 「Azure region pairs and nonpaired regions」, N은 「Azure nonregional services」, SG는 AZ-900 학습 가이드.

| 개념·영문 | 쓸 이름 | 근거 |
|---|---|---|
| `datacenter` — datacenter | **데이터 센터** | L5·AZ 한국어판. 「데이터센터」로 붙여 쓰지 않는다(phase 100 표기). rack → 랙(L5), server → 서버 |
| `region` — region | **지역** | L5 절 제목 「지역」, R 제목 「Azure 지역은 무엇인가요?」. 용어집의 「리전」은 쓰지 않는다(G20, phase 101 표기와 같다) |
| geography | 지리 | R 절 제목 「Azure 지역 및 지리 이해」, R·P·N 본문. data residency → **데이터 상주**(R 여덟 번·N 세 번. L5는 「데이터 보존」 한 번 — 데이터 보관 기간과 헷갈려 쓰지 않는다) |
| latency | 대기 시간 | R·AZ 한국어판(열 번씩). phase 101 표기와 같다 |
| nonregional services | 비지역 서비스 | L5·R·N 본문. N 제목의 「비지정 서비스」는 잘못 옮긴 것이라 쓰지 않는다. global / geographic → 글로벌 서비스 / 지리적 서비스(N) |
| `availability-zones` — availability zone | **가용성 영역** | L5(17번)·R(17번)·AZ 제목과 본문(71번). 이름표는 「영역 1」·「영역 2」·「영역 3」(AZ의 논리 영역 번호 꼴) |
| redundancy | 중복성 · 중복 | 「What are business continuity, …」 한국어판 「중복성」. 문장 안에서는 「중복」으로 줄여 써도 된다 — L5 한국어판도 둘을 함께 쓴다 |
| `zone-service-categories` — types of availability zone support | **가용성 영역 지원 유형** | AZ 절 제목. 잠정 이름 「가용성 영역 서비스 범주」(L5의 「세 범주」)는 쓰지 않는다 — 현행 문서의 나눔이 L5와 다르다(단원 5 항목 「현행 문서와 다름」 5). 슬러그는 그대로 둔다 |
| zonal resource / zone-redundant resource / nonzonal resource | **영역 리소스**(Zonal resource) / **영역 중복 리소스**(Zone-redundant resource) / **비영역 리소스**(Nonzonal resource) | AZ 한국어판(영역 리소스 9번, 영역 중복 리소스·영역 중복 7번). 셋째는 AZ 한국어판이 「비 영역 리소스」로 띄어 쓰지만, 접두사 「비-」는 붙여 쓰는 한국어 맞춤법을 따라 「비영역」으로 쓴다. L5의 「영역 서비스」·「영역 중복 서비스」는 같은 나눔을 서비스 단위로 부른 이름이라 쓰지 않는다 |
| `region-pairs` — region pair | **지역 쌍** | L5(9번)·R(4번)·P(18번). 「페어링」은 P 제목에만 섞였다. paired / nonpaired region → 쌍을 이루는 지역 / 쌍을 이루지 않는 지역(R 본문·P 본문) |
| failover | 장애 조치 | 「What are business continuity, …」·L5·AZ·P 한국어판. phase 101 표기와 같다 |
| geo-redundant storage | 지역 중복 스토리지(GRS) | P 한국어판. 이 주제에서 쓸 일이 있으면 |
| `sovereign-regions` — sovereign region | **소버린 지역** | 한국어판이 갈린다 — 「소버린」은 L5 절 제목(1번)과 R의 「소버린 클라우드 지역」(2번), 「주권 지역」은 L5 본문(3번)과 SG의 기술 목록 한 줄(「Azure 지역, 지역 쌍 및 주권 지역 설명」). 수는 「주권 지역」이 하나 많지만 「소버린」으로 쓴다 — 현행 제품 문서(R, 2026-06-29)가 「소버린」을 쓰고, 현행 문서에서 「주권」은 이 지역의 이름이 아니라 sovereignty(주권 요구)를 옮긴 말이다(AZ의 「데이터 상주 또는 주권 요구 사항」은 보통 지역에도 걸리는 요구다). 「주권 지역」이라 쓰면 그 요구를 맞추려면 이 지역을 써야 한다고 읽힐 수 있다. 본문에서 「주권 지역이라고도 옮긴다」를 한 번 밝혀도 된다 |
| instance (of Azure) | 인스턴스 | L5·R 한국어판. 이 주제에서는 「같은 기술로 지었지만 데이터 센터와 네트워크를 따로 둔 Azure 한 벌」로 푼다(Azure Government·21Vianet 항목) |
| Azure Government / Microsoft Azure operated by 21Vianet | Azure Government / 21Vianet이 운영하는 Microsoft Azure(Microsoft Azure operated by 21Vianet) | 두 문서 한국어판이 이름을 옮기지 않는다. R 한국어판 「21Vianet에서 운영하는 Microsoft Azure」를 「이」로 고쳐 쓴다. 덤프의 「Azure China」는 쓰지 않는다(D41) |
| Microsoft Entra ID / Azure DNS / Azure Traffic Manager | Microsoft Entra ID / Azure DNS / Azure Traffic Manager | 한국어판이 옮기지 않는다 |
| region names | 미국 서부·미국 동부·동아시아·동남아시아·브라질 남부·미국 중남부 | P 한국어판(「미국 서부」·「미국 동부」). 본문에 쓸 때만. 도식은 「지역 A」·「지역 B」 이름표로 그린다(guide 「예시 값」) |

## (phase 102) Azure Resource Manager — What is Azure Resource Manager?
https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/overview

확인한 날 2026-10-31. 「Last updated on」 2026-08-04. 사본: `docs-arm-overview.md`와 `ko-` 판.

- Azure Resource Manager는 Azure의 배포·관리 서비스다. Azure 포털·명령줄 도구·API로 보낸 요청을 모두 받아 인증·권한 확인을 한 뒤 해당 서비스로 넘긴다 — 첫 부분, 「Consistent management layer」
- 리소스는 Azure로 쓸 수 있는, 관리할 수 있는 항목이다. 예로 가상 머신·스토리지 계정·웹앱·데이터베이스·가상 네트워크를 들고, 리소스 그룹·구독·관리 그룹·태그도 리소스라고 한다 — 「Terminology」
- 리소스 그룹은 한 솔루션에 관련된 리소스를 담는 컨테이너이고, 함께 관리할 리소스를 넣는다. 무엇을 한 그룹에 넣을지는 조직에 맞게 고객이 정한다 — 「Terminology」, 「What is a resource group?」
- 관리 범위는 네 층이다 — 관리 그룹, 구독, 리소스 그룹, 리소스. 관리 설정은 어느 층에나 걸 수 있고, 고른 층이 설정이 미치는 넓이를 정한다. **아래층은 위층의 설정을 물려받는다** — 「Understand scope」
- 예: 구독에 정책을 걸면 그 구독의 모든 리소스 그룹과 리소스에 적용된다. 리소스 그룹에 정책을 걸면 그 리소스 그룹과 안의 리소스에 적용되고, **다른 리소스 그룹에는 그 정책이 걸리지 않는다** — 「Understand scope」(위층으로 올라가지 않는다는 말을 직접 하지는 않는다 — 고른 층과 그 아래에만 미친다는 데서 읽는다)
- 리소스 그룹에 둘 리소스는 수명 주기가 같은 것이 좋다 — 함께 배포하고 고치고 지운다 — 「What is a resource group?」
- 리소스는 리소스 그룹 하나에만 있을 수 있다. 리소스는 언제든 리소스 그룹에 넣거나 뺄 수 있고, 다른 리소스 그룹으로 옮길 수 있다 — 같은 절
- **리소스 그룹 안의 리소스는 리소스 그룹과 다른 지역에 있어도 된다**(같은 위치를 권한다) — 같은 절
- 리소스 그룹을 접근 제어의 범위로 쓸 수 있고, 리소스 그룹에 정책·역할·리소스 잠금을 걸어 관리한다 — 같은 절
- 리소스 그룹에 태그를 붙여도 안의 리소스는 그 태그를 물려받지 않는다 — 같은 절(`azure-cost-management`의 몫 — 이 phase는 쓰지 않는다)
- **리소스는 다른 리소스 그룹의 리소스와 연결될 수 있다.** 관련은 있지만 수명 주기가 다를 때 흔하다 — 예: 웹앱이 다른 리소스 그룹의 데이터베이스에 연결한다 — 같은 절
- 리소스 그룹을 지우면 안의 리소스도 모두 지워진다 — 같은 절
- 일부 리소스는 리소스 그룹 밖에 있을 수 있다 — 구독·관리 그룹·테넌트에 배포하는 특정 리소스 유형이다 — 같은 절(Learn 단원 6과 다름 — 그 항목의 「현행 문서와 다름」 1)
- 리소스 그룹을 만들 때 위치를 정한다. **리소스 그룹은 리소스의 메타데이터(리소스에 관한 정보)를 저장하고, 리소스 그룹의 위치가 그 메타데이터를 두는 곳이다.** 규정 준수 때문에 데이터를 특정 지역에 두어야 할 때 이 위치가 중요하다 — 「Which location should I use for my resource group?」
- 리소스 그룹이 데이터 센터 장애에 대비가 되는지는 문서가 직접 말하지 않는다. 판단 근거는 셋이다 — 리소스 그룹은 함께 관리할 리소스를 담는 컨테이너다(「Terminology」), 안의 리소스는 그룹과 다른 지역에 있어도 된다(「What is a resource group?」), 리소스를 다른 그룹으로 옮겨도 리소스의 물리적 지역은 바뀌지 않는다(「Move Azure resources to a new resource group or subscription」). 리소스를 어느 리소스 그룹에 두는지는 리소스가 놓이는 데이터 센터·영역을 정하지 않으므로 대비가 되지 않는다. 데이터 센터·영역 하나의 장애에 대비하는 것은 리소스를 여러 가용성 영역에 두는 것이다(「What are availability zones?」) — D 항목 없음, 덤프 NO.87의 답 「아니요」의 근거
- 한국어 표기: Azure Resource Manager(옮기지 않는다), resource → 리소스, resource group → 리소스 그룹, scope → 범위(「네 가지 관리 범위 수준」), inherit → 상속, metadata → 메타데이터, location → 위치, tag → 태그

쓰인 곳(phase 102 step 5): `azure-resource-hierarchy.resource`(리소스 하나하나가 관리할 수 있는 항목이다, 리소스 그룹 밖의 리소스가 있다는 한정 — 「VM·가상 네트워크·데이터베이스 같은 리소스는」으로 한정했고, 리소스 그룹·구독 자체도 리소스라는 말은 쓰지 않았다),
`azure-resource-hierarchy.resource-group`(무엇을 한 그룹에 넣을지 고객이 정한다, 한 그룹에만, 옮기기, 수명 주기가 같은 리소스를 한 그룹에, 그룹의 지역과 메타데이터, 다른 지역의 리소스, 다른 그룹의 리소스와의 연결 — 웹앱과 데이터베이스의 예, 그룹 삭제, 접근 제어 범위, 다른 리소스 그룹에는 미치지 않음, NO.87의 판단), az049·az050 해설, `ResourceGroupScopeDiagram`, D48

쓰인 곳(phase 102 step 7): `azure-resource-hierarchy.hierarchy`(범위 네 층과 상속, 구독에 건 설정은 그 구독의 모든 리소스 그룹·리소스에, 리소스 그룹에 건 설정은 그 리소스 그룹과 안의 리소스에 적용되고 다른 리소스 그룹에는 걸리지 않음 — 「위로 올라가지 않는다」는 쓰지 않고 「건 층과 그 아래에만 미친다」로 썼다), az053·az054 해설, `HierarchyInheritanceDiagram`, G26

## (phase 102) Azure Resource Manager — Manage Azure resource groups by using the Azure portal
https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal

확인한 날 2026-10-31. 「Last updated on」 2026-02-27. 사본: `docs-arm-manage-resource-groups-portal.md`와 `ko-` 판.

- 리소스 그룹은 리소스의 메타데이터를 저장하고, 리소스 그룹의 위치를 정하는 것이 그 메타데이터를 둘 곳을 정하는 것이다. 안의 리소스는 다른 지역에 있을 수 있다 — 「What is a resource group」
- 리소스 그룹을 만들 때 이름과 지역을 정한다 — 「Create resource groups」
- 한국어 표기: resource group → 리소스 그룹, region → 지역

쓰인 곳(phase 102 step 5): `azure-resource-hierarchy.resource-group`(그룹을 만들 때 지역을 고른다, 메타데이터, 안의 리소스는 다른 지역에 있어도 된다)

## (phase 102) Azure Resource Manager — Move Azure resources to a new resource group or subscription
https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-resource-group-and-subscription

확인한 날 2026-10-31. 「Last updated on」 2025-07-29. 사본: `docs-arm-move-resource-group-and-subscription.md`와 `ko-` 판.

- 리소스를 같은 구독 안의 다른 리소스 그룹으로도, **다른 구독으로도 옮길 수 있다.** 다른 구독으로 옮길 때는 두 구독이 같은 Microsoft Entra 테넌트에 속해야 한다 — 첫 부분, 「Checklist before moving resources」
- 옮길 리소스는 옮기기 작업을 지원하는 유형이어야 한다 — 리소스 유형마다 다르다 — 「Checklist before moving resources」
- 다른 구독으로 옮길 때는 리소스와 그 리소스가 기대는 리소스가 같은 리소스 그룹에 있어야 하고 함께 옮긴다 — 예: 관리 디스크가 붙은 VM은 VM과 디스크를 함께 옮긴다 — 같은 절
- 리소스를 옮기면 리소스가 속한 리소스 그룹(과 리소스 ID)만 바뀌고 **리소스의 물리적 지역은 바뀌지 않는다** — 첫 부분
- 옮기는 동안 원래 그룹과 대상 그룹은 잠겨 그 안의 리소스를 만들거나 지우거나 고칠 수 없지만, 이미 있는 리소스는 계속 동작한다 — 첫 부분
- 구독 둘을 하나로 합친다는 말은 이 문서에 없다(리소스를 다른 구독으로 옮기는 방법만 있다) — D49
- 한국어 표기: move → 이동, resource group → 리소스 그룹, subscription → 구독, Microsoft Entra tenant → Microsoft Entra 테넌트

쓰인 곳(phase 102 step 5): `azure-resource-hierarchy.resource-group`(다른 그룹으로 옮겨도 한 그룹에만 속한다, 옮겨도 지역은 그대로), az050 해설

쓰인 곳(phase 102 step 6): `azure-resource-hierarchy.subscription`(VM 같은 리소스를 다른 구독으로 옮길 수 있다 — 두 구독이 같은 테넌트를 믿어야 하고, 옮기기를 지원하는 유형이어야 하며, 기대는 리소스(VM과 디스크)와 함께 옮긴다, 옮겨도 지역은 그대로), D47. 구독을 합친다는 말은 쓰지 않았다(D49)

## (phase 102) Azure Resource Manager — Handling special cases when moving virtual machines to resource group or subscription
https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/move-limitations/virtual-machines-move-limitations

확인한 날 2026-10-31. 「Last updated on」 2025-09-15. 사본: `docs-arm-move-limitations-vm.md`와 `ko-` 판.

- VM은 새 리소스 그룹이나 다른 구독으로 옮길 수 있다. 디스크 암호화·Marketplace 플랜·Azure Backup을 쓰는 VM은 따로 거칠 단계가 있다 — 첫 부분
- 옮길 수 없는 경우가 있다 — 예: 가용성 집합 안의 VM은 하나씩 옮길 수 없고, 기존 가상 네트워크 안의 VM은 그 가상 네트워크와 기대는 리소스를 함께 옮길 때만 다른 구독으로 옮길 수 있다 — 「Scenarios not supported」(이 주제는 「옮길 수 없는 경우도 있다」까지만 쓴다)
- 한국어 표기: virtual machine → 가상 머신

쓰인 곳(phase 102 step 6): `azure-resource-hierarchy.subscription`(VM을 다른 구독으로 옮길 수 있되 옮길 수 없는 경우도 있다 — 가용성 집합 같은 경우의 예는 들지 않았다), D47

## (phase 102) Azure Resource Manager — Use tags to organize your Azure resources and management hierarchy (상속 한 줄만)
https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources

확인한 날 2026-10-31. 「Last updated on」 2025-09-15. 사본: `docs-arm-tag-resources.md`와 `ko-` 판.

- 리소스는 리소스 그룹이나 구독에 붙인 태그를 물려받지 않는다. 물려받게 하려면 Azure Policy로 태그 규칙을 건다 — 「Inherit tags」
- 한국어 표기: tag → 태그

쓰일 곳: `azure-cost-management` 주제(이 phase는 쓰지 않는다). 덤프 NO.54·93·309·335의 태그 진술 「아니요」는 이 사실과 맞다 — D 항목 없음

## (phase 102) Microsoft Entra — Associate or add an Azure subscription to your Microsoft Entra tenant
https://learn.microsoft.com/en-us/entra/fundamentals/how-subscriptions-associated-directory

확인한 날 2026-10-31. 「Last updated on」 2026-06-19. 사본: `docs-entra-how-subscriptions-associated-directory.md`와 `ko-` 판.

- 모든 Azure 구독은 Microsoft Entra 테넌트 하나와 신뢰 관계를 맺고, 그 테넌트(디렉터리)로 사용자와 장치를 인증하고 권한을 확인한다 — 「Overview」
- **구독은 디렉터리 하나만 믿는다. 테넌트 하나는 여러 구독이 믿을 수 있다** — 「Overview」
- 구독은 Azure 리소스와 Azure 역할 할당을 관리하는 범위이고, 테넌트는 로그인하고 접근을 받는 데 쓰는 ID를 담은 디렉터리다 — 「Overview」
- 구독이 만료되어도 믿던 테넌트는 남지만, 사용자 등은 Azure 리소스에 접근하지 못하게 된다 — 「Overview」
- 구독의 소유자는 구독을 다른 디렉터리(테넌트)에 연결할 수 있다. 그러면 Azure RBAC로 역할을 받은 사용자는 접근을 잃는다 — 「Overview」 Important, 「Associate a subscription to a directory」
- 한국어 표기: tenant → 테넌트, directory → 디렉터리, trust relationship → 트러스트 관계(이 앱은 「믿는다」로 쓴다), associate → 연결

쓰인 곳(phase 102 step 6): `azure-resource-hierarchy.subscription`(구독은 테넌트 하나만 믿고 그 테넌트의 ID로 누가 로그인했는지 확인하고 무엇을 할 수 있는지 따진다, 테넌트 하나를 구독 여럿이 믿을 수 있다, 테넌트에는 로그인하고 접근 권한을 받는 데 쓰는 ID가 들어 있다), az051 해설. 구독이 만료될 때와 구독을 다른 디렉터리에 연결하는 일은 쓰지 않았다. 덤프 NO.369의 세 답(아니요·예·아니요)의 근거 — D 항목 없음

## (phase 102) Microsoft Entra — Quickstart: Create a new tenant in Microsoft Entra ID
https://learn.microsoft.com/en-us/entra/fundamentals/create-new-tenant

확인한 날 2026-10-31. 「Last updated on」 2026-07-31. 사본: `docs-entra-create-new-tenant.md`와 `ko-` 판.

- 테넌트는 조직 하나를 나타내고, 그 조직의 내부·외부 사용자를 위한 Microsoft 클라우드 서비스의 한 인스턴스를 관리하게 해 준다 — 「Create a new tenant for your organization」
- 한국어 표기: tenant → 테넌트, instance → 인스턴스

쓰인 곳(phase 102 step 6): `azure-resource-hierarchy.subscription`(테넌트를 푸는 한 줄 — 조직 하나를 나타내는 Microsoft Entra ID의 디렉터리), az051 해설

쓰인 곳(phase 102 step 7): `azure-resource-hierarchy.management-group`(테넌트 루트 그룹의 「테넌트」 — 개념 9가 이미 푼 낱말이라 다시 풀지 않았다)

## (phase 102) Azure governance — What are Azure management groups?
https://learn.microsoft.com/en-us/azure/governance/management-groups/overview

확인한 날 2026-10-31. 「Last updated on」 2025-07-21. 사본: `docs-management-groups-overview.md`와 `ko-` 판.

- 관리 그룹은 구독 위의 거버넌스 범위다. 구독이 많을 때 그 구독들의 접근·정책·규정 준수를 한꺼번에 관리하려고 쓴다. 관리 그룹에 건 거버넌스 조건은 상속으로 그 아래 구독 모두에 내려간다 — 첫 부분
- 한 관리 그룹 안의 구독은 모두 같은 Microsoft Entra 테넌트를 믿어야 한다 — 첫 부분
- 예: 관리 그룹에 VM을 만들 수 있는 지역을 제한하는 정책을 걸면 아래의 관리 그룹·구독·리소스 모두에 적용되고, 리소스나 구독의 소유자는 그 정책을 바꿀 수 없다. 관리 그룹에 역할 할당을 하나 만들면 그 접근이 아래 구독 모두에 상속된다 — 첫 부분, 「Hierarchy of management groups and subscriptions」
- 디렉터리 하나에 관리 그룹을 10,000개까지 둘 수 있다. 관리 그룹 나무는 여섯 단계 깊이까지이고, 이 제한에 루트 단계와 구독 단계는 들지 않는다. 관리 그룹과 구독은 저마다 부모가 하나다 — 「Important facts about management groups」 (Learn 단원 6과 같다)
- 디렉터리마다 최상위 관리 그룹이 하나 있다(**루트 관리 그룹**). 모든 관리 그룹과 구독이 그 아래로 모이고, 전체에 걸 정책과 역할 할당을 여기에 건다. 루트 관리 그룹의 표시 이름은 기본으로 **Tenant root group**이고, 그 자체도 관리 그룹으로 동작하며, ID가 Microsoft Entra 테넌트 ID와 같다. 루트 관리 그룹은 옮기거나 지울 수 없다 — 「Root management group for each directory」
- 새로 만든 구독은 기본으로 루트 관리 그룹 바로 아래에 놓인다 — 「Important facts about the root management group」 (phase 102 step 7)
- 루트 관리 그룹에 건 사용자 접근 할당이나 정책 할당은 그 디렉터리의 모든 리소스에 적용된다. 그래서 루트에는 꼭 필요한 것만 건다 — 같은 절 Important (phase 102 step 7)
- 한국어 표기: management group → 관리 그룹, root management group → 루트 관리 그룹(한국어판 28번), Tenant root group → 테넌트 루트 그룹(한국어판 1번 — 표시 이름), inheritance → 상속, governance → 거버넌스, compliance → 규정 준수

쓰인 곳(phase 102 step 6): az052 해설(관리 그룹을 푸는 한 줄 — 구독 여럿을 묶어 같은 조건을 한꺼번에 거는, 구독보다 위의 단위)

쓰인 곳(phase 102 step 7): `azure-resource-hierarchy.management-group`(구독 위의 거버넌스 범위, 상속, 같은 테넌트, 10,000개·여섯 단계·부모 하나, 테넌트 루트 그룹 — 표시 이름이 테넌트 루트 그룹이고 루트 관리 그룹이라고도 부른다, 그 자체가 관리 그룹이다, 옮기거나 지울 수 없다, 새 구독이 그 바로 아래에 놓인다, 거기에 건 접근 권한·규칙은 테넌트의 모든 리소스에 미친다 — ID가 테넌트 ID와 같다는 것은 쓰지 않았다), `azure-resource-hierarchy.hierarchy`(정책·역할 할당의 예 — 리소스나 구독의 소유자가 정책을 바꿀 수 없다), az053·az055 해설, `HierarchyInheritanceDiagram`, D50·G26

## (phase 102) Azure RBAC — Understand scope for Azure RBAC
https://learn.microsoft.com/en-us/azure/role-based-access-control/scope-overview

확인한 날 2026-10-31. 「Last updated on」 2025-03-30. 사본: `docs-rbac-scope-overview.md`와 `ko-` 판.

- 범위(scope)는 접근이 미치는 리소스의 묶음이다. Azure에서 범위는 네 층 — 관리 그룹, 구독, 리소스 그룹, 리소스 — 이고 부모와 자식 관계로 이어지며, 아래로 갈수록 범위가 좁아진다 — 첫 부분, 「Scope levels」
- 역할은 어느 층에나 할당할 수 있고, 고른 층이 역할이 미치는 넓이를 정한다. **아래층은 위층의 역할 권한을 물려받는다** — 「Scope levels」
- 관리 그룹은 구독 위의 범위이고 더 복잡한 계층을 만들 수 있다 — 「Scope levels」
- 한국어 표기: scope → 범위, role assignment → 역할 할당, inherit → 상속

쓰인 곳(phase 102 step 5): `azure-resource-hierarchy.resource-group`(리소스 그룹에 준 접근 권한이 안의 리소스에 미치고 다른 리소스 그룹에는 미치지 않는다 — 「역할」·「범위」라는 말은 쓰지 않고 「접근 권한」으로 썼다. 덤프 NO.54·93·159·270·309·335의 권한 진술은 이 사실과 맞다), `ResourceGroupScopeDiagram`(권한 부여)

쓰인 곳(phase 102 step 7): `azure-resource-hierarchy.hierarchy`(네 층이 범위라는 것, 아래로 갈수록 좁아진다, 위에서 아래로 상속 — 구독에 준 역할 할당이 그 구독의 리소스 그룹·리소스에, 리소스 그룹에 준 역할 할당이 그 안의 리소스에 미친다), az054 해설, `HierarchyInheritanceDiagram`(구독·리소스 그룹에 역할 할당)

## (phase 102) Azure RBAC — What is Azure role-based access control (Azure RBAC)? (한 줄 풀이만)
https://learn.microsoft.com/en-us/azure/role-based-access-control/overview

확인한 날 2026-10-31. 「Last updated on」 2024-03-12. 사본: `docs-rbac-overview.md`와 `ko-` 판.

- Azure RBAC는 누가 Azure 리소스에 접근하고, 그 리소스로 무엇을 할 수 있고, 어느 범위에 접근하는지를 관리하게 해 준다. Azure Resource Manager 위에 지은 권한 부여 시스템이다 — 첫 부분
- **역할 할당**은 사용자·그룹 같은 대상에게 역할 정의를 특정 범위에서 붙여 접근을 주는 일이다. 역할 할당을 만들면 접근이 생기고 지우면 접근이 사라진다 — 「Role assignments」
- 한국어 표기: Azure role-based access control → Azure RBAC(Azure 역할 기반 액세스 제어), role assignment → 역할 할당, role definition → 역할 정의

쓰인 곳(phase 102 step 7): `azure-resource-hierarchy.hierarchy`(Azure RBAC와 역할 할당을 푸는 줄 — 누가 어떤 리소스에 접근해 무엇을 할 수 있는지 관리하는 서비스, 사용자나 사용자 그룹 같은 대상에게 어느 범위에서 무엇을 할 수 있는지 정해 붙이는 것, 만들면 접근이 생기고 지우면 사라진다), az054 해설. 역할 정의의 종류·보안 주체의 종류는 `azure-security-model`의 몫이라 적지 않았고 쓰지도 않았다

## (phase 102) Azure RBAC — Azure classic subscription administrators
https://learn.microsoft.com/en-us/azure/role-based-access-control/classic-administrators

확인한 날 2026-10-31. 「Last updated on」 2026-05-07. 사본: `docs-rbac-classic-administrators.md`와 `ko-` 판.

- Azure의 클래식 관리자 역할(서비스 관리자·공동 관리자)은 2024년 8월 31일부터 지원이 끝났다. 2025년 12월부터 Azure가 아직 그 역할을 가진 사용자에게 구독 범위의 소유자(Owner) 역할을 자동으로 할당했고, 2026년 5월부터 클래식 관리자 역할은 완전히 없어져 접근은 Azure RBAC 역할 할당으로 관리해야 한다 — 첫 부분 Important, 「Frequently asked questions」
- 계정 관리자(Account Administrator)는 청구 계정의 주 사용자이고 지원 종료 대상이 아니다. 구독마다 계정 관리자를 몇 명 둘 수 있는지는 이 문서에 없다 — 「Frequently asked questions」
- 한국어 표기: Azure classic subscription administrators → Azure 클래식 구독 관리자, Service Administrator → 서비스 관리자, Co-Administrator → Co-Administrator(옮기지 않는다), Account Administrator → 계정 관리자, retired → 사용 중지

쓰일 곳: D46 — 개념 글에 쓰지 않는다(근거 기록)

## (phase 102) Azure governance — What is Azure Policy? (한 줄 풀이만)
https://learn.microsoft.com/en-us/azure/governance/policy/overview

확인한 날 2026-10-31. 「Last updated on」 2026-07-08. 사본: `docs-policy-overview.md`와 `ko-` 판.

- Azure Policy는 조직이 정한 기준을 리소스에 강제하고, 여러 리소스가 그 기준을 지키는지(규정 준수) 한꺼번에 평가한다. 규정 준수 대시보드로 전체 상태를 보고, 기준에 어긋난 기존 리소스를 한꺼번에 고치게 돕는다 — 첫 부분
- 한국어 표기: Azure Policy(옮기지 않는다), compliance → 규정 준수, policy definition → 정책 정의

쓰인 곳(phase 102 step 7): `azure-resource-hierarchy.hierarchy`(정책을 푸는 줄 — Azure Policy로 정하는 규칙, 조직의 기준을 리소스에 강제하고 여러 리소스가 지키는지 평가한다), az055 해설, D50(문항이 「규칙을 걸 자리」를 조건으로 주어 관리 그룹만 정답이 되게 했다 — az053). 정책 효과·정책 정의의 구조는 `azure-governance`의 몫이라 적지 않았고 쓰지도 않았다

## (phase 102) Azure Virtual Network — What is Azure Virtual Network? (한 줄 풀이만)
https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview

확인한 날 2026-10-31. 「Last updated on」 2025-07-17. 사본: `docs-virtual-network-overview.md`와 `ko-` 판.

- Azure 가상 네트워크는 Azure 안의 사설 네트워크를 이루는 기본 단위다. VM 같은 Azure 리소스가 서로, 인터넷과, 온-프레미스 네트워크와 안전하게 통신하게 해 준다 — 첫 부분
- 한국어 표기: Azure Virtual Network → Azure Virtual Network(제목), virtual network → 가상 네트워크(한국어판 46번)
- 이 개요가 꼽는 쓰임은 여섯이다 — 인터넷과 통신, Azure 리소스끼리 통신, 온-프레미스와 통신, 트래픽 거르기, 트래픽 경로 정하기, Azure 서비스와 통합. Learn 단원 2의 일곱과 거의 겹치고, 그쪽은 격리와 분할·가상 네트워크 잇기를 따로 센다 — 「Why use an Azure virtual network?」 (phase 103)
- 지점 및 사이트 간 VPN은 연결할 컴퓨터마다 설정이 필요하고 기존 네트워크를 거의 바꾸지 않아도 된다. 사이트 간 VPN은 온-프레미스 VPN 디바이스와 VPN 게이트웨이 사이에 놓이고, 허가한 온-프레미스 리소스가 가상 네트워크에 닿게 한다. 둘 다 트래픽이 인터넷 위의 암호화된 터널로 간다. ExpressRoute 트래픽은 인터넷으로 가지 않는다 — 「Communicate with on-premises resources」 (phase 103)
- Azure는 서브넷·연결된 가상 네트워크·온-프레미스 네트워크·인터넷 사이의 트래픽 경로를 기본으로 잡아 주고, 경로 테이블이나 BGP로 바꿀 수 있다. **바꾸는 방법은 쓰지 않는다**(guide 「배경」) — 「Route network traffic」 (phase 103)
- 이 개요는 「모든 리소스가 기본으로 인터넷으로 나갈 수 있다」고 적는다(2025-07-17). 뒤의 「Default outbound access in Azure」(2026-09-10)가 새 가상 네트워크의 기본을 바꿨다고 하므로 **이 문장을 쓰지 않는다** — 「Communicate with the internet」 (phase 103)

쓰인 곳(phase 102 step 5): `azure-resource-hierarchy.resource`(가상 네트워크를 푸는 한 줄 — VM 같은 리소스가 서로, 그리고 인터넷과 통신하게 해 주는 Azure 안의 사설 네트워크. 온-프레미스 네트워크와의 통신은 쓰지 않았다), az048 해설
쓰인 곳(phase 103 step 6): `azure-virtual-networking.virtual-network`
쓰인 곳(phase 103 step 8): `azure-virtual-networking.vpn-connection-types`(사이트 간은 허가한 온-프레미스 리소스가 가상 네트워크에 닿게 한다, 지점 및 사이트 간은 컴퓨터마다 설정하고 기존 네트워크를 거의 바꾸지 않는다, 지점 및 사이트 간 연결이 컴퓨터와 가상 네트워크 사이에 놓인다), `SiteToSiteVpnDiagram`, az075 해설

## (phase 102) 한국어 표기 정리 — `azure-resource-hierarchy`

위 항목들과 Learn 단원 6 항목의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다(phase 102 step 4). Microsoft 한국어 문서의 표기를 따르고(guide 「배경」), 한국어판 사이에 표기가 갈리면 근거를 적는다.
받아 둔 한국어판(`raw/official/ko-…`)에서 낱말을 세어 정했다 — L6은 Learn 단원 6, ARM은 「What is Azure Resource Manager?」, MG는 「What are Azure management groups?」, SC는 「Understand scope for Azure RBAC」, EN은 「Associate or add an Azure subscription to your Microsoft Entra tenant」.

| 개념·영문 | 쓸 이름 | 근거 |
|---|---|---|
| `resource` — resource | **리소스** | L6·ARM 한국어판. phase 100 표기와 같다. virtual machine → 가상 머신(VM), virtual network → 가상 네트워크, database → 데이터베이스 |
| `resource-group` — resource group | **리소스 그룹** | L6·ARM 한국어판. metadata → 메타데이터. 리소스 그룹을 만들 때 고르는 곳은 「지역」으로 쓴다 — 「Manage Azure resource groups by using the Azure portal」이 그 칸을 Region으로 적는다(ARM의 location → 위치는 같은 것을 가리킨다) |
| `subscription` — subscription | **구독** | L6·EN 한국어판. phase 101 표기와 같다. account → 계정, tenant → 테넌트, directory → 디렉터리 |
| `subscription-boundaries` — subscription boundaries | **구독 경계** | L6 한국어판 「구독 경계에는 두 가지 유형이 있습니다」. 잠정 이름 그대로다 |
| billing boundary / access control boundary | **청구 경계**(Billing boundary) / **액세스 제어 경계**(Access control boundary) | L6 한국어판 목록. 영문은 L6 목록의 굵은 이름 |
| production | 운영 환경 | L6 한국어판은 「프로덕션」을 쓴다. phase 101이 정한 「운영 환경」을 쓴다(`azure-sla-lifecycle` 표기 정리 — 뜻이 드러나는 쪽) |
| `management-group` — management group | **관리 그룹** | L6(15번)·MG(141번) 한국어판 |
| Tenant Root Group / root management group | **테넌트 루트 그룹** | L6 한국어판(1번)과 MG 한국어판의 표시 이름(1번). MG 본문은 「루트 관리 그룹」(28번)을 쓰지만, 학습 단원과 표시 이름이 「테넌트 루트 그룹」이라 그것을 쓴다. 본문에서 「루트 관리 그룹이라고도 부른다」를 한 번 밝혀도 된다 |
| `hierarchy` — management group, subscriptions, and resource group hierarchy | **관리 그룹·구독·리소스 그룹 계층 구조** | L6 한국어판 절 제목 「관리 그룹, 구독 및 리소스 그룹 계층 구조」를 명사구로 줄였다(「및」·쉼표를 가운뎃점으로). 잠정 이름 「…계층」에 「구조」를 붙인 것은 L6 절 제목과 용어집 「계층 구조」가 함께 쓰는 말이라서다 |
| scope / inherit | 범위 / 상속(물려받는다) | ARM 「네 가지 관리 범위 수준」, SC 한국어판 「범위」(35번). 본문에서는 「물려받는다」로 풀어 써도 된다 |
| role assignment / Azure RBAC | 역할 할당 / Azure 역할 기반 액세스 제어(Azure RBAC) | SC·RBAC 개요 한국어판 |
| Azure Policy / policy | Azure Policy / 정책 | Policy 개요 한국어판이 이름을 옮기지 않는다 |
| governance / compliance | 거버넌스 / 규정 준수 | L6·MG 한국어판. phase 101 표기와 같다 |
| Microsoft Entra ID | Microsoft Entra ID | 한국어판이 옮기지 않는다. 옛 이름 Azure Active Directory(Azure AD)는 쓰지 않는다(phase 101 「New name for Azure Active Directory」 항목, D46·G25) |

---

## (phase 103) Azure Virtual Network — Virtual networks and virtual machines in Azure
https://learn.microsoft.com/en-us/azure/virtual-network/network-overview

확인한 날 2026-10-31(사본의 「Last updated on」 뒤 날짜는 비어 있다). 사본: `docs-virtual-network-network-overview.md`와 `ko-` 판.

- VM을 만들 때 가상 네트워크를 새로 만들거나 이미 있는 것을 쓴다. 가상 네트워크는 VM보다 먼저 만들어도 되고 VM을 만들면서 만들어도 된다 — 「첫 부분」
- **VM과 통신하려고 만드는 리소스**는 네트워크 인터페이스, IP 주소, 가상 네트워크와 서브넷이고, **선택적 리소스**는 네트워크 보안 그룹과 부하 분산 장치다 — 「첫 부분」의 두 목록
- 네트워크 인터페이스(NIC)는 VM과 가상 네트워크를 잇는 것이고 **VM에는 NIC가 적어도 하나 있어야 한다**. NIC는 VM과 같은 위치·구독의 가상 네트워크에 이어져야 한다 — 「Network interfaces」
- **공용 IP 주소를 NIC에 붙이는 것은 선택이다.** 공용 IP 주소는 인터넷, 그리고 가상 네트워크에 이어지지 않은 Azure 리소스와 통신하는 데 쓴다. **개인 IP 주소는 VM에 적어도 하나 있어야 하고** 가상 네트워크 안·온-프레미스 네트워크와의 통신에 쓴다 — 「IP addresses」
- 포털에서 VM을 만들면 NIC가 저절로 하나 만들어지고, 네트워크 보안 그룹도 저절로 만들어져 그 NIC에 걸린다 — 「Network interfaces」·「Network security groups」
- 한국어 표기: network interface → 네트워크 인터페이스, optional resources → 선택적 리소스, private/public IP address → **개인 IP 주소 / 공용 IP 주소**, network security group → 네트워크 보안 그룹, load balancer → 부하 분산 장치

쓰인 곳: `azure-compute.vm-resources`(꼭 있는 것 — 가상 네트워크와 서브넷·NIC·개인 IP 주소 / 필요할 때 붙이는 것 — 공용 IP 주소·네트워크 보안 그룹. 새로 만들거나 있는 것을 쓴다), `VmResourcesDiagram`(늘 있는 것과 필요할 때 붙이는 것), D51

## (phase 103) Azure Managed Disks — Azure managed disks overview
https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview

확인한 날 2026-10-31, Last updated on 2026-08-20. 사본: `docs-virtual-machines-managed-disks-overview.md`.

- 관리 디스크는 Azure가 관리하는 블록 수준 저장 볼륨이고 Azure VM에 붙여 쓴다. 온-프레미스 서버의 물리 디스크처럼 쓰지만 가상화되어 있다. 쓰는 쪽은 디스크 유형과 크기만 정하고, 나머지는 Azure가 맡는다 — 「첫 문단」
- 관리 디스크는 스토리지 계정을 만들고 관리하는 일을 뒤에서 대신 해 준다(VM 개요 「Managed disks」도 같은 말을 한다) — VM 개요 「Managed disks」
- 이미지와 스냅샷은 VM에 붙은 관리 디스크(OS 디스크와 데이터 디스크)를 담는다 — 「Compare managed images and managed disk snapshots」(쓰지 않는다 — 데이터 디스크라는 말의 근거로만)
- 한국어 표기: 받은 한국어판이 없다. VM 개요 한국어판의 「OS 디스크」·「데이터 디스크」를 쓴다

쓰인 곳: `azure-compute.vm-resources`(디스크를 푸는 한 줄 — VM에 붙이는 가상 디스크), D57

## (phase 103) Azure Virtual Machines — Availability sets overview
https://learn.microsoft.com/en-us/azure/virtual-machines/availability-set-overview

확인한 날 2026-10-31, Last updated on 2026-04-07. 사본: `docs-virtual-machines-availability-set-overview.md`와 `ko-` 판.

- **권장**: 고가용성에는 유연한 오케스트레이션 모드의 가상 머신 확장 집합을 권한다(VM을 한곳에서 관리하고 수요·일정에 따라 수를 바꾼다). 가용성 집합은 고가용성을 주지만 가용성 영역만큼의 복원력은 주지 않는다 — 「첫 부분의 Note」
- 가용성 집합은 관련된 VM이 함께 걸리는 고장으로 한꺼번에 멈출 가능성을 줄이는 VM의 논리적 묶음이다. VM을 여러 장애 도메인에 나눠 두고, 가용성 영역을 지원하지 않는 지역에서 특히 쓸모 있다 — 「What is an availability set?」
- 가용성 집합에는 VM을 둘 이상 만든다. 가용성 집합 자체에는 추가 비용이 없고 VM 인스턴스 값만 낸다 — 같은 절(같은 문장의 99.95% SLA 수치는 쓰지 않는다)
- VM끼리 물리적으로 더 가까이 놓여 **VM 사이 대기 시간은 가용성 영역보다 짧다**. 그래도 여러 장애 도메인에 함께 미치는 공유 인프라의 고장 — 예: **데이터 센터 수준의 네트워크 중단** — 에는 여전히 약하다 — 같은 절
- 더 높은 안정성이 필요하면 가용성 영역을 쓴다. 영역에 VM을 나눠 두면 데이터 센터 하나의 전원·네트워킹·냉각 손실에서 보호된다 — 같은 절
- Azure 플랫폼이 가용성 집합의 VM마다 **업데이트 도메인과 장애 도메인을 정해 준다**. 가용성 집합 하나에 **장애 도메인은 최대 3개, 업데이트 도메인은 최대 20개**까지이고, **만든 뒤에는 바꿀 수 없다** — 「How do availability sets work?」
- 업데이트 도메인은 함께 다시 시작될 수 있는 VM과 그 밑의 물리 하드웨어의 묶음이다. 계획된 유지 관리 때 업데이트 도메인이 번호 순서대로 다시 시작되지 않을 수 있지만 **한 번에 하나씩만** 다시 시작되고, 다시 시작된 업데이트 도메인은 30분 동안 회복한 뒤 다음 도메인의 유지 관리가 시작된다 — 「Update domains」(30분은 쓰지 않는다)
- 업데이트 도메인이 다섯인 가용성 집합에 VM이 다섯 대를 넘으면 여섯째 VM은 첫째와, 일곱째는 둘째와 같은 업데이트 도메인에 놓인다 — 같은 절
- 장애 도메인은 전원과 네트워크 스위치를 함께 쓰는 VM의 묶음이다. 기본으로 가용성 집합의 VM은 장애 도메인 최대 셋에 나뉜다 — 「Fault domains」
- **가용성 집합에 두어도 운영 체제나 앱 자체의 고장은 막지 못한다.** 막는 것은 물리 하드웨어 고장·네트워크 중단·전원 중단의 영향을 줄이는 것이다 — 같은 절
- 도메인 번호: 글은 번호를 매기지 않는다. 같은 페이지의 그림(「Diagram that shows compute clusters split into fault domains that contain update domains.」, `media/virtual-machines-common-manage-availability/ud-fd-configuration.png` — 사본 `ud-fd-configuration.png`)은 장애 도메인을 0·1·2로, 업데이트 도메인을 1~5로 매긴다(VM 여섯째가 업데이트 도메인 1). **번호 매김이 하나로 정해지지 않으므로 도식은 이름표(「장애 도메인 A」 같은 것)로 쓴다**
- 한국어 표기: 제목 「가용성 집합 개요」, availability set → 가용성 집합, fault domain → 장애 도메인, update domain → 업데이트 도메인, Virtual Machine Scale Sets → 「가상 머신 스케일 세트」(이 문서 한국어판), flexible orchestration mode → 유연한 오케스트레이션 모드, correlated failure → 상관 관계 오류(쓰지 않는다 — 「함께 걸리는 고장」으로 푼다)

쓰인 곳(phase 103 step 2): `azure-compute.availability-sets`(정의·VM 둘 이상·추가 비용 없음·두 도메인의 정의·최대 3과 20·만든 뒤 못 바꿈·한 번에 하나씩·여섯째 VM 배정·막지 못하는 것·영역과의 차이(대기 시간, 데이터 센터 수준 중단)·권장), `AvailabilitySetDiagram`(도메인은 이름표 「장애 도메인 A·B·C」로, 전원 장애 때와 계획된 유지 관리 때), az059·az060 해설, G27

## (phase 103) Azure CLI — az vm availability-set (create의 기본값만)
https://learn.microsoft.com/en-us/cli/azure/vm/availability-set?view=azure-cli-latest

확인한 날 2026-10-31. 사본: `docs-cli-vm-availability-set.md`.

- `az vm availability-set create`의 장애 도메인 수 기본값은 2이고, 업데이트 도메인 수는 정하지 않으면 서버가 알맞은 수(예: 5)를 고른다 — 「az vm availability-set create」의 매개 변수 설명
- 위 개요는 「기본으로 장애 도메인 최대 셋」이라 하고, CLI는 기본값을 2로 둔다 — **만드는 도구마다 기본값이 달라 「기본 수」는 쓰지 않는다.** 최대 수(3·20)와 「만든 뒤 못 바꾼다」만 쓴다

쓰인 곳(phase 103 step 2): (근거 기록) `azure-compute.availability-sets`에 기본 수를 쓰지 않은 까닭. 본문의 「장애 도메인 셋, 업데이트 도메인 다섯」은 기본 수가 아니라 「예를 들어」로 고른 값이다

## (phase 103) Azure Virtual Machines — Maintenance for virtual machines in Azure
https://learn.microsoft.com/en-us/azure/virtual-machines/maintenance-and-updates

확인한 날 2026-10-31(phase 103 step 2가 계획된 유지 관리를 풀려고 받았다). 사본: `docs-virtual-machines-maintenance-and-updates.md`와 `ko-` 판.

- Azure는 VM을 받치는 호스트 인프라의 안정성·성능·보안을 높이려고 플랫폼을 때때로 업데이트한다. 그 일은 호스팅 환경의 소프트웨어 구성 요소에 패치를 적용하는 것부터 네트워킹 구성 요소를 바꾸거나 하드웨어를 퇴역시키는 것까지다 — 「첫 부분」
- 업데이트가 VM에 영향을 주는 일은 드물다. 다시 부팅이 필요하면 Azure가 계획된 유지 관리를 미리 알린다 — 「첫 부분」(다시 부팅이 없는 방식의 세부, 일시 중지 시간, 직접 유지 관리를 시작할 수 있는 기간의 일수는 쓰지 않는다)
- 가용성 집합에 VM을 두면 중단 때나 다시 부팅이 필요한 유지 관리 때 적어도 VM 하나는 쓸 수 있다. 가용성 집합의 VM은 업데이트 도메인 최대 20개에 나뉘고, 예약된 유지 관리 때는 업데이트 도메인을 한 번에 하나만 업데이트하며 순서대로 하지는 않을 수 있다 — 「Availability sets and Uniform scale sets」
- 한국어 표기: planned maintenance → 계획된 유지 관리, update domain → 업데이트 도메인, live migration → 실시간 마이그레이션(쓰지 않는다)

쓰인 곳(phase 103 step 2): `azure-compute.availability-sets`(계획된 유지 관리를 푸는 문장 — 바탕 설비를 때때로 업데이트하고, VM에 영향을 주는 일은 드물며, 다시 시작해야 하는 업데이트는 미리 알린다), `AvailabilitySetDiagram`(계획된 유지 관리 시나리오), az059 해설

## (phase 103) Azure Virtual Machine Scale Sets — Availability zone options for Azure Virtual Machine Scale Sets
https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-use-availability-zones

확인한 날 2026-10-31, Last updated on 2026-09-09. 사본: `docs-virtual-machine-scale-sets-availability-zones.md`와 `ko-` 판.

- **확장 집합을 데이터 센터 수준의 고장에서 지키려면 가용성 영역에 걸쳐 확장 집합을 만든다.** 가용성 영역을 지원하는 지역이어야 한다 — 「첫 부분」
- 영역에 걸친 확장 집합은 인스턴스를 영역 둘 이상에 나눠 둔다. 한 영역이 중단되면 그 영역의 인스턴스는 닿지 않을 수 있지만 다른 영역의 인스턴스는 영향을 받지 않는다 — 「Zone spanning」
- 한 영역에만 두는 확장 집합(영역 정렬)과 영역을 정하지 않는 지역 배포도 있다 — 「Choose an availability zone deployment option」(선택지의 세부와 99.99% 수치는 쓰지 않는다)
- 한국어 표기: 「가용성 영역을 가로지르는 확장 집합」, 「데이터 센터 수준의 장애」

쓰인 곳(phase 103 step 2): `azure-compute.scale-sets`(확장 집합을 여러 가용성 영역에 걸쳐 만들어 VM을 영역 둘 이상에 나눠 둔다 — 그래야 데이터 센터 장애에 대비된다, 가용성 영역을 지원하는 지역이어야 한다), D56

## (phase 103) Azure Load Balancer — What is Azure Load Balancer?
https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview

확인한 날 2026-10-31, Last updated on 2026-08-21. 사본: `docs-load-balancer-overview.md`와 `ko-` 판.

- Azure Load Balancer는 들어오는 네트워크 트래픽을 뒤쪽의 VM이나 가상 머신 확장 집합에 나눠 보내는 클라우드 서비스다. 부하 분산은 들어오는 트래픽을 VM 무리에 효율적으로 나누는 일이다 — 「첫 부분」
- Basic Load Balancer는 2025-09-30에 사용 중지되었다(Standard로 옮기라고 한다) — 「첫 부분의 Important」(쓰지 않는다)
- 한국어 표기: load balancing → 부하 분산, load balancer → **부하 분산 장치**(한국어판 12번), VMSS → VMSS(가상 머신 확장 집합)

쓰인 곳(phase 103 step 2): `azure-compute.scale-sets`(부하 분산 장치를 푸는 한 줄 — 들어오는 요청을 받아 여러 VM에 나눠 보내는 것), `ScaleSetDiagram`, az058 해설, G32

## (phase 103) Azure Load Balancer — Azure Load Balancer distribution modes
https://learn.microsoft.com/en-us/azure/load-balancer/distribution-mode-concepts

확인한 날 2026-10-31(설계 세션이 받은 사본), Last updated on 2026-05-20. 사본: `lb-distribution-mode.md`.

- Azure Load Balancer는 기본으로 다섯 값(five-tuple)의 해시로 연결을 나눈다. 같은 클라이언트 IP의 연결을 같은 인스턴스로 보내는 세션 유지 방식도 고를 수 있다 — 「첫 부분」(나누는 방식은 이 주제에 쓰지 않는다 — 「나눠 보낸다」까지만)

쓰인 곳(phase 103 step 2): G32 — `azure-compute.scale-sets`와 `ScaleSetDiagram`은 나누는 방식을 쓰지 않고 「나눠 보낸다」까지만 썼다

## (phase 103) Learn 「Describe Azure compute services」 — 4 Describe Azure virtual desktop
https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/4-virtual-desktop

확인한 날 2026-10-31. 사본: `learn-describe-azure-compute-networking-services-4-virtual-desktop.md`와 `ko-` 판.

- Azure Virtual Desktop은 데스크톱과 앱을 가상화해 주는 Azure 서비스다. 사용자는 여러 종류의 장치로, 여러 장소에서 Windows 데스크톱과 앱에 안전하게 접속한다 — 「첫 문단」
- 데스크톱과 앱이 사용자의 기기가 아니라 클라우드에 머무는, 관리형 원격 데스크톱 접속 방식이다 — 「둘째 문단」
- 흩어져 일하는 사용자·협력업체 직원·하이브리드 근무자에게 데스크톱과 앱을 한곳에서 내줄 때 쓴다. 많은 사용자에게 전체 데스크톱을 중앙에서 관리하며 내주려면, 사용자 무리마다 VM으로 데스크톱 환경을 따로 만드는 것보다 운영하기 쉬운 경우가 많다 — 「When to use Azure Virtual Desktop」
- 특징 셋 — ID와 접근 제어를 Microsoft Entra ID와 통합해 관리한다, 앱과 데이터가 Azure의 세션에 남을 수 있어 사용자 기기에 데이터가 노출될 일이 준다, 단일 세션과 다중 세션 Windows 환경을 지원한다 — 「Key points」
- 한국어 표기: 단원 제목 「Azure 가상 데스크톱 설명」, 본문은 **Azure Virtual Desktop**(옮기지 않는다), desktop and application virtualization → 데스크톱 및 애플리케이션 가상화, single-session / multi-session → **단일 세션 / 다중 세션**, hybrid workers → 하이브리드 작업자

쓰인 곳(phase 103 step 3): `azure-compute.virtual-desktop`(정의·데스크톱과 앱이 Azure에 머문다·쓰는 경우와 VM으로 따로 만드는 것보다 운영하기 쉬운 경우가 많다·특징 셋 — 협력업체 직원 예는 직접 만들었다), az061 해설, D54

## (phase 103) Azure Virtual Desktop — What is Azure Virtual Desktop?
https://learn.microsoft.com/en-us/azure/virtual-desktop/overview

확인한 날 2026-10-31, Last updated on 2026-09-18. 사본: `docs-virtual-desktop-overview.md`와 `ko-` 판.

- **Windows 11·Windows 10·Windows Server**로 전체 Windows 환경을 내준다. 단일 세션은 장치를 한 사용자에게 주고, 다중 세션은 규모를 키운다 — 「첫 목록」
- 전체 데스크톱을 내주거나, RemoteApp으로 앱 하나하나를 내줄 수 있다 — 「첫 목록」 → **데스크톱 가상화와 앱 가상화를 둘 다 지원한다**
- 풀링된 다중 세션 리소스로 비용을 줄인다 — Windows 11·10 Enterprise 다중 세션이나 Windows Server로 VM 수와 운영 체제 부담을 줄이면서 사용자에게 같은 리소스를 준다 — 「Key capabilities」
- 시간·요일·수요에 따라 용량을 저절로 늘리고 줄일 수 있다 — 같은 절
- Azure Virtual Desktop의 옛 이름은 Windows Virtual Desktop이다 — 「Introductory video」. 「Azure Virtual Desktop (classic)」은 2026-09-30에 사용 중지 예고 — 「Important」(둘 다 쓰지 않는다)
- 한국어 표기: 다중 세션, 단일 세션, 세션 호스트, 호스트 풀(본문)

쓰인 곳(phase 103 step 3): `azure-compute.virtual-desktop`(데스크톱 가상화와 앱 가상화를 둘 다 지원, Windows 11·Windows 10과 Windows Server, 다중 세션으로 VM 수를 줄이면서 같은 환경을 내준다 — 자동 크기 조정과 옛 이름은 쓰지 않았다), az061 해설, D52·D54

## (phase 103) Azure Virtual Desktop — Azure Virtual Desktop terminology
https://learn.microsoft.com/en-us/azure/virtual-desktop/terminology

확인한 날 2026-10-31. 사본: `docs-virtual-desktop-terminology.md`(영문판만 받았다).

- **호스트 풀**은 Azure Virtual Desktop에 **세션 호스트**로 등록한 Azure VM의 모음이다 — 「Host pools」
- 호스트 풀은 둘이다 — 개인(세션 호스트마다 한 사용자에게 배정)과 **풀링(한 세션 호스트에 여러 사용자가 동시에 접속할 수 있다)** — 같은 절
- 풀링 호스트 풀은 사용자 세션을 세션 호스트의 세션 수에 따라 나눠 보내고, 세션 호스트마다 최대 세션 수를 정한다 — 같은 절의 표
- 앱 그룹은 데스크톱(전체 Windows 데스크톱)과 RemoteApp(골라 게시한 앱 하나하나)이다 — 「Application groups」
- 한국어 표기: 한국어판을 받지 않았다. 개요·필수 조건 한국어판의 「세션 호스트」·「호스트 풀」을 쓴다

쓰인 곳(phase 103 step 3): `azure-compute.virtual-desktop`(단일 세션은 VM 한 대를 한 사용자가, 다중 세션은 VM 한 대에 여러 사용자가 동시에 — 세션 호스트·호스트 풀이라는 말과 최대 세션 수는 쓰지 않았다), az061 해설, D52

## (phase 103) Azure Virtual Desktop — Prerequisites for Azure Virtual Desktop
https://learn.microsoft.com/en-us/azure/virtual-desktop/prerequisites

확인한 날 2026-10-31. 사본: `docs-virtual-desktop-prerequisites.md`와 `ko-` 판.

- 세션 호스트에 쓸 수 있는 운영 체제 표에 Windows 11 Enterprise(다중 세션 포함)·Windows 10 Enterprise(다중 세션 포함)와 **Windows Server 2025·2022·2019·2016**이 있다(64비트) — 「Operating systems and licenses」(판 이름은 쓰지 않는다 — 「Windows Server도 된다」까지만)

쓰인 곳(phase 103 step 3): `azure-compute.virtual-desktop`(데스크톱을 실행하는 VM의 운영 체제로 Windows Server도 — 판 이름은 쓰지 않았다), D52

## (phase 103) Learn 「Describe Azure compute services」 — 5 Describe Azure containers
https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/5-containers

확인한 날 2026-10-31. 사본: `learn-describe-azure-compute-networking-services-5-containers.md`와 `ko-` 판.

- VM은 물리 하드웨어보다 비용을 줄이지만 VM마다 운영 체제는 하나다. 호스트 컴퓨터 하나에서 앱 인스턴스를 여럿 실행하려면 컨테이너가 알맞다 — 「첫 문단」
- 컨테이너는 가상화 환경이다. 물리 호스트 하나에서 VM 여러 대를 실행하듯, **물리 또는 가상 호스트** 하나에서 컨테이너 여러 개를 실행한다 — 「What are containers?」
- **VM과 달리 컨테이너의 운영 체제는 고객이 관리하지 않는다.** VM은 저마다 운영 체제를 실행하고 고객이 그 운영 체제에 접속해 관리한다 — 같은 절
- 컨테이너는 가볍고, 그때그때 만들고 스케일 아웃하고 멈추도록 설계되었다. 수요 변화에 빨리 대응하고, 크래시나 하드웨어 중단 뒤 빨리 다시 시작한다. 널리 쓰이는 컨테이너 엔진의 하나가 Docker이고 Azure가 Docker를 지원한다 — 같은 절
- **Azure Container Instances**는 VM을 관리하거나 다른 서비스를 들이지 않고 Azure에서 컨테이너를 실행하는 가장 빠르고 간단한 방법이고, **PaaS**다. 컨테이너를 올리면 서비스가 실행한다 — 「Azure Container Instances」
- **Azure Container Apps**도 바로 실행하고 컨테이너 관리 부담을 덜어 주는 PaaS이고, **부하 분산과 크기 조정이 들어 있어** 수요 변화에 맞춘다 — 「Azure Container Apps」
- **Azure Kubernetes Service(AKS)**는 컨테이너 **오케스트레이션** 서비스다. 오케스트레이션 서비스는 컨테이너의 수명 주기를 관리하고, AKS는 컨테이너를 무리로 배포할 때 그 관리를 쉽게 한다 — 「Azure Kubernetes Service」
- 컨테이너는 마이크로 서비스 아키텍처에 자주 쓰인다 — 솔루션을 작고 독립된 조각으로 나눈다. 예: 웹사이트를 프런트 엔드·백 엔드·저장 부분의 컨테이너로 나누면 부분마다 따로 유지·크기 조정·업데이트하고, 백 엔드만 부담이 몰리면 백 엔드만 늘린다 — 「Use containers in your solutions」
- 한국어 표기: 단원 제목 「Azure 컨테이너 설명」, container → 컨테이너, container engine → 컨테이너 엔진, host → 호스트(「물리적 또는 가상 호스트」), Azure Container Instances / Azure Container Apps / Azure Kubernetes Service → **이름 그대로**(「AKS(Azure Kubernetes Service)」), orchestration → 오케스트레이션, lifecycle → 수명 주기,
  microservice architecture → 마이크로 서비스 아키텍처, front end / back end → 프런트 엔드 / 백 엔드

쓰인 곳(phase 103 step 3): `azure-compute.containers`(VM마다 운영 체제는 하나, 가상화 환경, 호스트는 실제 서버이거나 VM, 고객이 컨테이너의 운영 체제를 관리하지 않는다, 가볍고 빨리 만들고 늘리고 멈추며 크래시·하드웨어 중단 뒤 빨리 다시 시작, 컨테이너 엔진과 Docker, 마이크로 서비스 — 예는 온라인 서점의 화면·주문·결제로 직접 만들었다, 프런트 엔드·백 엔드 풀이), `azure-compute.container-services`(세 서비스와 각 한 줄, ACI·Container Apps는 PaaS, 오케스트레이션은 컨테이너의 수명 주기 관리), `VmContainerDiagram`, az062~az064 해설, D53·D55

쓰인 곳(phase 103 step 4): `HostingOptionsTable`(컨테이너 행)

## (phase 103) Windows containers — Windows containers overview
https://learn.microsoft.com/en-us/virtualization/windowscontainers/about/

확인한 날 2026-10-31. 사본: `docs-windowscontainers-about.md`(영문판만 받았다).

- 컨테이너는 호스트 운영 체제 위에서 앱을 실행하는 격리된 가벼운 꾸러미다. **컨테이너는 호스트 운영 체제의 커널 위에서 실행되고 그 커널을 함께 쓰지만**, 커널에 마음대로 닿지는 못하고 격리된 시야를 받는다 — 「How it works」
- AKS는 Azure VM에 컨테이너를 배포하고 대규모로 관리한다 — 「Containers in Azure」 → 컨테이너는 VM을 호스트로 삼아 실행될 수 있다(위 Learn 단원 5 「물리 또는 가상 호스트」와 같다)

쓰인 곳(phase 103 step 3): `azure-compute.containers`(「호스트의 운영 체제를 함께 쓴다」까지 — 「커널」이라는 말은 쓰지 않았다, 호스트가 VM일 수도 있다), `VmContainerDiagram`

## (phase 103) Azure IoT Edge — Supported systems (Container engines 절만)
https://learn.microsoft.com/en-us/azure/iot-edge/support

확인한 날 2026-10-31. 사본: `docs-iot-edge-support.md`.

- 컨테이너를 띄우려면 컨테이너 엔진이 있어야 한다. Docker는 널리 쓰이는 컨테이너 엔진이다 — 「Container engines」(IoT Edge 자체는 쓰지 않는다)

쓰인 곳(phase 103 step 3): `azure-compute.containers`(엔진을 푸는 한 줄 — 호스트에서 컨테이너를 만들고 실행하는 소프트웨어, 컨테이너를 실행하려면 엔진이 있어야 한다), az063 해설

## (phase 103) Azure 클라우드 컴퓨팅 사전 — What is a virtual machine?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-virtual-machine

확인한 날 2026-10-31. 사본: `azure-dictionary-what-is-a-virtual-machine.md`.

- 클라우드 VM은 물리 서버 위에서 자기 운영 체제와 앱을 실행하는, 소프트웨어로 만든 컴퓨터다. 물리 컴퓨터를 흉내 내고 호스트 시스템과 격리된다 — 「첫 부분」·「Virtual machine defined」
- **가상화**는 소프트웨어로 된(가상의) 컴퓨터를 만드는 과정이고, 그 가상 컴퓨터는 물리 호스트 컴퓨터의 CPU·메모리·스토리지를 일정 부분씩 받는다 — 「How does a cloud virtual machine work?」
- VM은 저마다 운영 체제와 앱을 가진 별개의 컴퓨터처럼 동작하고, 하이퍼바이저가 여러 VM에서 서로 다른 운영 체제를 함께 실행하게 한다 — 「What benefits do VMs offer?」(하이퍼바이저라는 말은 쓰지 않는다)

쓰인 곳(phase 103 step 1): `azure-compute.virtual-machines`(가상화를 푸는 한 줄), D53

쓰인 곳(phase 103 step 3): `azure-compute.containers`(VM은 저마다 운영 체제를 실행한다 — 호스트 위의 VM 견줌), `VmContainerDiagram`(호스트 위의 VM마다 운영 체제)

## (phase 103) Azure Container Instances — What is Azure Container Instances?
https://learn.microsoft.com/en-us/azure/container-instances/container-instances-overview

확인한 날 2026-10-31, Last updated on 2026-07-25. 사본: `docs-container-instances-overview.md`와 `ko-` 판.

- ACI는 VM을 관리하지 않고, 더 높은 수준의 서비스를 들이지 않고 Azure에서 Linux·Windows 컨테이너를 실행하는 가장 빠르고 간단한 방법이다 — 「첫 문단」
- ACI는 인스턴스 하나로도, NGroups로 여럿으로도 쓰고, AKS 클러스터의 가상 노드로 오케스트레이션과 함께 쓸 수도 있다. 컨테이너 그룹 하나에 컨테이너 여럿을 둘 수 있다 — 「첫 문단」·「Linux and Windows containers」 표(세부는 쓰지 않는다 — G29의 근거)
- 이 문서는 ACI를 PaaS라 부르지 않는다. PaaS라는 근거는 Learn 단원 5다
- 한국어 표기: Azure Container Instances(옮기지 않는다)

쓰인 곳(phase 103 step 3): `azure-compute.container-services`(ACI 항목 — VM 관리 없이, 더 복잡한 서비스를 갖추지 않고 가장 빠르고 간단하게. 「컨테이너 하나만」·요금·컨테이너 그룹은 쓰지 않았다), az063·az064 해설, G29

## (phase 103) Azure Container Apps — Azure Container Apps overview
https://learn.microsoft.com/en-us/azure/container-apps/overview

확인한 날 2026-10-31, Last updated on 2026-07-07. 사본: `docs-container-apps-overview.md`와 `ko-` 판.

- Container Apps는 그 밑의 인프라를 관리하지 않고 컨테이너로 만든 앱을 실행하는 서버리스 플랫폼이다. 서버 구성·컨테이너 오케스트레이션·배포 세부를 직접 다루지 않는다 — 「첫 문단」
- 흔한 쓰임은 API 끝점 배포, 백그라운드 처리 작업, 이벤트 기반 처리, 마이크로 서비스 실행이다. HTTP 트래픽·이벤트·CPU나 메모리 부하에 따라 크기를 바꾼다 — 「첫 부분」
- 한국어 표기: Azure Container Apps(옮기지 않는다 — Learn 단원 5 한국어판 절 제목에는 「(애저 컨테이너 앱)」이 붙었다)

쓰인 곳(phase 103 step 3): `azure-compute.container-services`(Container Apps 항목 — 서버를 구성하는 일을 직접 다루지 않는다, 요청이나 처리할 일의 양에 따라 크기를 바꾼다), az063·az064 해설

## (phase 103) Azure Kubernetes Service — What is Azure Kubernetes Service (AKS)?
https://learn.microsoft.com/en-us/azure/aks/what-is-aks

확인한 날 2026-10-31, Last updated on 2026-06-04. 사본: `docs-aks-what-is-aks.md`와 `ko-` 판.

- AKS는 컨테이너로 만든 앱을 배포하고 관리하는 관리형 Kubernetes 서비스이고, Kubernetes를 관리하는 복잡함과 운영 부담을 Azure가 맡는다 — 「첫 문단」
- 클러스터 모드는 둘이다 — AKS Automatic(노드 관리·크기 조정·보안·모니터링·업그레이드를 Azure가 저절로 맡는다)과 AKS Standard(클러스터 구성과 노드 풀 관리를 고객이 완전히 통제한다) — 같은 부분(모드 이름은 쓰지 않는다 — G31의 근거)
- 한국어 표기: 「AKS(Azure Kubernetes Service)」, managed Kubernetes service → 관리되는 Kubernetes 서비스

쓰인 곳(phase 103 step 3): `azure-compute.container-services`(AKS 항목 — Kubernetes를 바탕으로 하고 Kubernetes를 운영하는 부담을 Azure가 덜어 준다. 모드와 고객이 맡는 노드는 쓰지 않았다), az063·az064 해설, G31

## (phase 103) Azure Architecture Center — Choose an Azure container service
https://learn.microsoft.com/en-us/azure/architecture/guide/choose-azure-container-service

확인한 날 2026-10-31. 사본: `docs-architecture-choose-azure-container-service.md`와 `ko-` 판.

- 이 안내가 견주는 것은 Container Apps·AKS·Web App for Containers 셋이고 ACI는 들지 않는다 — 「Azure container services in scope for this guide」
- AKS는 IaaS와 PaaS가 섞여 단순함보다 통제를 앞세우고 Kubernetes에 익숙하지 않으면 배울 것이 많다. Container Apps는 Kubernetes 위의 추상화 층이라 인프라를 직접 관리하지 않고 앱을 실행·크기 조정한다 — 「Compare the service models of Azure container solutions」
- 그래서 셋을 고르는 기준(Learn 단원 5의 말로): 컨테이너 하나를 VM 관리 없이 빨리 실행 → ACI, 부하 분산·크기 조정이 들어 있어야 하는 앱 → Container Apps, 많은 컨테이너의 수명 주기를 Kubernetes로 관리·통제 → AKS. **「AKS는 PaaS다」로 쓰지 않는다**(이 안내는 IaaS와 PaaS가 섞였다고 한다)
- 한국어 표기: 제목 「Azure 컨테이너 서비스 선택」

- AKS는 컨테이너 오케스트레이션의 표준 시스템인 Kubernetes를 쓴다 — 「Compare the service models of Azure container solutions」의 「Azure Kubernetes Service (AKS)」 (phase 103 step 3)

쓰인 곳(phase 103 step 3): `azure-compute.container-services`(AKS 항목의 「컨테이너 오케스트레이션에 표준으로 쓰이는 Kubernetes」, 셋을 고르는 기준 문단 — AKS는 통제가 많은 대신 Kubernetes에 익숙하지 않으면 배울 것이 많다, Container Apps는 Kubernetes 위의 한 층. 「AKS는 PaaS다」는 쓰지 않았다), az063·az064 해설, G31

## (phase 103) Learn 「Describe Azure compute services」 — 7 Describe application hosting options
https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/7-describe-application-hosting-options

확인한 날 2026-10-31. 사본: `learn-describe-azure-compute-networking-services-7-describe-application-hosting-options.md`와 `ko-` 판.

- Azure에 앱을 호스트할 때 흔히 VM이나 컨테이너를 먼저 떠올린다. **VM은 호스팅 환경을 가장 많이 통제**하고 원하는 대로 구성하며, **컨테이너는 호스팅 솔루션의 부분을 떼어 따로 관리**할 수 있다. 그 밖의 선택지로 Azure App Service가 있다 — 「첫 문단」
- App Service는 고른 언어로 웹 앱·백그라운드 작업·모바일 백 엔드·RESTful API를 인프라 관리 없이 만들고 호스트한다. 자동 크기 조정과 고가용성을 갖췄고, Windows·Linux를 지원하며, 지속적 배포를 위해 GitHub·Azure DevOps·Git 리포지토리에서 자동 배포한다 — 「Azure App Service」
- App Service는 웹 앱·REST API·모바일 백 엔드를 호스트하는 **HTTP 기반 서비스**이고, 고객은 앱을 만들고 유지하는 데 집중하며 환경을 실행 상태로 두는 일은 Azure가 맡는다. 여러 언어·프레임워크를 지원한다 — 같은 절
- 앱 종류 넷 — 웹 앱(Windows나 Linux를 호스트 운영 체제로 고른다), API 앱(REST 기반 웹 API — HTTP·HTTPS 클라이언트가 쓴다), WebJobs(웹 앱 등과 같은 맥락에서 프로그램이나 스크립트를 실행 — 일정이나 트리거로, 흔히 백그라운드 작업), 모바일 앱(iOS·Android 앱의 백 엔드) — 「Types of app services」 이하(모바일 앱의 세부 기능은 쓰지 않는다)
- App Service가 맡는 인프라 결정 — 배포와 관리가 플랫폼에 들어 있다, 끝점을 보호할 수 있다, 트래픽이 많으면 빨리 크기를 늘린다, 부하 분산과 트래픽 관리자로 고가용성을 준다 — 같은 절
- 한국어 표기: 단원 제목 「Azure 애플리케이션 호스팅 옵션 설명」, web apps → **웹앱**(붙여 쓴다), API apps → API 앱, WebJobs(옮기지 않는다), mobile apps → 모바일 앱, background jobs → 백그라운드 작업, mobile back end → 모바일 백 엔드, continuous deployment → 지속적인 배포, Git repo → Git 리포지토리

쓰인 곳(phase 103 step 4): `azure-compute.app-service`(정의·HTTP 기반·자동 크기 조정과 고가용성·Windows와 Linux·지속적 배포·앱 종류 넷·맡는 인프라 결정·VM·컨테이너와 견주는 문단), `HostingOptionsTable`, D53·D55

## (phase 103) Azure App Service — Configure continuous deployment to Azure App Service
https://learn.microsoft.com/en-us/azure/app-service/deploy-continuous-deployment

확인한 날 2026-10-31, Last updated on 2025-06-16. 사본: `docs-app-service-deploy-continuous-deployment.md`.

- 지속적 배포(CD)를 구성하면 GitHub·Bitbucket·Azure Repos 같은 리포지토리의 변경을 App Service가 끌어와 배포한다. 고른 리포지토리·브랜치에 새 커밋이 생기면 앱에 계속 배포된다 — 「첫 문단」·GitHub Actions 절

쓰인 곳(phase 103 step 4): `azure-compute.app-service`(지속적 배포를 푸는 한 줄 — 코드 저장소에 바뀐 코드를 올리면 앱에 저절로 배포되는 것)

## (phase 103) Azure Functions — Azure Functions triggers and bindings
https://learn.microsoft.com/en-us/azure/azure-functions/functions-triggers-bindings

확인한 날 2026-10-31, Last updated on 2026-10-12. 사본: `docs-azure-functions-functions-triggers-bindings.md`, `ko-docs-azure-functions-functions-triggers-bindings.md`.

- 트리거는 함수를 어떻게 실행할지 정하는 것이고, **함수 하나에는 트리거가 꼭 하나 있어야 한다** — 「첫 부분」
- 그래서 「함수 하나가 REST 요청으로도 타이머로도 실행된다」는 틀린 말이다. REST 요청과 타이머로 실행할 일이 따로 있으면 함수를 둘 둔다(phase 103 step 4가 step 문서의 예를 이렇게 고쳤다)
- 한국어 표기: trigger → 트리거, bindings → 바인딩(이 주제에서는 쓰지 않는다)

쓰인 곳(phase 103 step 4): `azure-compute.functions`(함수 하나에 트리거 하나, 회사 D의 예를 함수 둘로), `FunctionTriggerDiagram`(캡션·범례)

## (phase 103) .NET — Choosing a Transport (HTTP 절만)
https://learn.microsoft.com/en-us/dotnet/framework/wcf/feature-details/choosing-a-transport

확인한 날 2026-10-31. 사본: `docs-dotnet-choosing-a-transport.md`.

- HTTP는 클라이언트와 서버 사이의 요청·응답 프로토콜이다. 흔한 예는 웹 브라우저가 웹 서버와 통신하는 것 — 클라이언트가 요청을 보내면 서버가 요청의 상태를 담은 응답을 돌려주고, 성공하면 웹 페이지 같은 데이터가 함께 온다 — 「HTTP Transport」

쓰인 곳(phase 103 step 4): `azure-compute.app-service`(HTTP를 푸는 한 줄 — 웹 브라우저 같은 클라이언트가 요청을 보내고 서버가 응답하는 규칙), `azure-compute.functions`(REST 요청 풀이)

---

## (phase 103) 한국어 표기 정리 — `azure-compute`

위 항목들의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다(phase 103 step 0). Microsoft 한국어 문서의 표기를 따르고(guide 「배경」), 한국어판 사이에 표기가 갈리면 근거를 적는다.

| 개념·항목 | 쓸 이름(`name`) | 근거 |
|---|---|---|
| `virtual-machines` | **가상 머신(Azure Virtual Machines)** | Learn 단원 2 한국어판 제목 「Azure 가상 머신 설명」, 본문 「Azure VM(Virtual Machines)」. 본문의 줄임은 phase 100·101대로 「VM(가상 머신)」 |
| `vm-resources` | **가상 머신에 필요한 리소스** | 「Virtual networks and virtual machines in Azure」 한국어판 「가상 머신에 대한 통신을 지원하기 위해 … 리소스」, VM 개요 한국어판의 표. 목록 항목 이름 — **가상 네트워크**(Virtual Network), **네트워크 인터페이스**(Network Interface — VM 개요 한국어판은 「가상 네트워크 인터페이스 카드(NIC)」, 네트워킹 문서 한국어판은 「네트워크 인터페이스」 — 짧은 쪽), **IP 주소**(IP Address — 「개인 IP 주소」와 「공용 IP 주소」), **네트워크 보안 그룹**(Network Security Group), **디스크**(Disk — 「OS 디스크」·「데이터 디스크」) |
| `scale-sets` | **가상 머신 확장 집합** | Learn 단원 2 한국어판 본문 「가상 머신 확장 집합」(본문에서는 「확장 집합」). 제품 문서 한국어판 제목은 「가상 머신 확장 집합이란?」이고 가용성 집합 개요 한국어판에는 「가상 머신 스케일 세트」가 섞였다 — Learn 쪽과 확장 집합 문서 제목을 따른다 |
| `availability-sets` | **가용성 집합** | Learn 단원 2 한국어판 「가상 머신 가용성 집합」·「가용성 집합」, 가용성 집합 개요 한국어판 제목 「가용성 집합 개요」. 업데이트 도메인 / 장애 도메인도 두 한국어판이 같다 |
| `virtual-desktop` | **Azure Virtual Desktop** | Learn 단원 4·개요 한국어판 본문이 옮기지 않는다(단원 제목만 「Azure 가상 데스크톱 설명」). 다중 세션 / 단일 세션 |
| `containers` | **컨테이너** | Learn 단원 5 한국어판. 컨테이너 엔진, 호스트, 마이크로 서비스 아키텍처, 프런트 엔드 / 백 엔드 |
| `container-services` | **Azure의 컨테이너 서비스** | 이름표 개념이라 한국어판 문구가 따로 없다 — Architecture Center 한국어판 제목 「Azure 컨테이너 서비스 선택」의 「컨테이너 서비스」. 목록 항목 이름 — **Azure Container Instances**, **Azure Container Apps**, **Azure Kubernetes Service(AKS)** — 세 문서 한국어판이 옮기지 않는다. ACI·Container Apps는 굵은 이름 뒤에 영문 괄호를 따로 붙이지 않는다(이름이 이미 영문) |
| `functions` | **Azure Functions** | Learn 단원 6·Functions 문서 한국어판(옮기지 않는다). 상태 비저장 / 상태 저장, Durable Functions, 트리거, REST 요청 |
| `app-service` | **Azure App Service** | Learn 단원 7·App Service 개요 한국어판(옮기지 않는다). 앱 종류는 웹앱(한국어판은 붙여 쓴다)·API 앱·WebJobs·모바일 앱. 지속적 배포(「지속적인 배포」) |

섞여 쓰인 표기와 고른 것:

- **개인 IP 주소 / 사설 IP 주소** — 받은 한국어판(VM 개요, 네트워킹 문서)은 private IP address를 모두 「개인 IP 주소」로 쓴다. 이 과목은 phase 102가 가상 네트워크를 「사설 네트워크」로 풀었다. IP 주소는 한국어판대로 **「개인 IP 주소」**를 쓰고, 처음 쓸 때 「가상 네트워크 안에서만 쓰는 주소」로 푼다. guide의 「사설 IP」는 잠정 표기다 — step 5가 네트워킹 문서 한국어판으로 다시 본다
- **공용 IP 주소** — 받은 한국어판이 모두 「공용 IP」다(Learn 단원 2 포함). 「퍼블릭 IP」는 쓰지 않는다
- **확장 집합 / 스케일 세트** — 위 표대로 「가상 머신 확장 집합」, 본문 줄임은 「확장 집합」
- **부하 분산 장치** — Load Balancer 개요 한국어판(12번). 「로드 밸런서」·「부하 분산기」는 쓰지 않는다
- **장애 도메인 / 업데이트 도메인** — 두 한국어판이 같다. 도식은 번호 대신 이름표(가용성 집합 개요 항목의 「도메인 번호」)
- **리프트 앤 시프트 마이그레이션, 재해 복구, 데이터 센터 확장** — Learn 단원 2 한국어판

## (phase 103) Learn 「Describe Azure networking services」 — 2 Describe Azure virtual networking
https://learn.microsoft.com/en-us/training/modules/describe-azure-networking-services/2-virtual-network

확인한 날 2026-10-31. 사본: `learn-describe-azure-networking-services-2-virtual-network.md`와 `ko-` 판. 옛 주소(`…/describe-azure-compute-networking-services/8-virtual-network`)는 이 모듈로 옮겨졌다.

- 가상 네트워크와 서브넷은 VM·웹앱·데이터베이스 같은 Azure 리소스가 서로, 인터넷의 사용자와, 온-프레미스의 클라이언트 컴퓨터와 통신하게 한다. 온-프레미스 네트워크를 Azure로 넓힌 것으로 볼 수 있다 — 첫 문단
- 핵심 기능은 일곱이다 — 격리와 분할, 인터넷 통신, Azure 리소스 사이 통신, 온-프레미스 리소스와 통신, 트래픽 경로 정하기, 트래픽 거르기, 가상 네트워크 잇기 — 같은 곳
- Azure Virtual Network로 서로 격리된 가상 네트워크를 여럿 만들 수 있다. 가상 네트워크를 만들 때 개인 IP 주소 공간을 정하는데, 그 범위는 가상 네트워크 안에만 있고 인터넷에서 경로가 잡히지 않는다 — 「Isolation and segmentation」
- 그 주소 공간을 서브넷으로 나누고, 이름 붙인 서브넷마다 주소 공간의 일부를 준다 — 같은 절
- 이름 확인은 Azure에 들어 있는 서비스를 쓰거나, 내부 또는 외부 DNS 서버를 쓰도록 가상 네트워크를 구성한다 — 같은 절
- 인터넷에서 들어오는 연결을 열려면 리소스에 공용 IP 주소를 붙이거나 공용 부하 분산 장치 뒤에 둔다 — 「Internet communications」
- 온-프레미스와 잇는 방법은 셋이다 — 지점 및 사이트 간 VPN(바깥의 컴퓨터가 암호화된 연결을 시작한다), 사이트 간 VPN(온-프레미스 VPN 디바이스나 게이트웨이를 가상 네트워크의 VPN 게이트웨이에 잇는다. 암호화되어 인터넷으로 간다. Azure의 장치가 로컬 네트워크에 있는 것처럼 보일 수 있다), ExpressRoute(인터넷으로 가지 않는 전용 프라이빗 연결) — 「Communicate with on-premises resources」
- Azure는 기본으로 서브넷·연결된 가상 네트워크·온-프레미스 네트워크·인터넷 사이의 트래픽 경로를 잡아 준다 — 「Route network traffic」. 경로 테이블·BGP·사용자 정의 경로는 **쓰지 않는다**(guide 「배경」)
- 서브넷 사이 트래픽을 거르는 방법으로 네트워크 보안 그룹을 든다 — 들어오고 나가는 규칙을 담은 Azure 리소스이고, 원본·대상 IP 주소, 포트, 프로토콜로 허용하거나 막는다 — 「Filter network traffic」. 네트워크 가상 어플라이언스는 **쓰지 않는다**(guide 「배경」)
- 가상 네트워크 피어링은 두 가상 네트워크를 서로 직접 잇는다. 트래픽은 사설이고 Microsoft 백본 네트워크로 다니며 공용 인터넷에 들어가지 않는다. 다른 지역의 가상 네트워크도 이을 수 있다 — 「Connect virtual networks」
- 퍼블릭 엔드포인트는 공용 IP 주소를 가져 세계 어디서나 닿는다. 프라이빗 엔드포인트는 가상 네트워크 안에 있고 그 주소 공간에서 받은 개인 IP 주소를 쓴다 — 첫 부분
- 서비스 엔드포인트도 이 단원에 나오지만 **쓰지 않는다**(guide 「배경」) — 「Communicate between Azure resources」
- 한국어 표기: 가상 네트워크, 서브넷, 격리 및 구분(제목. 이 주제의 글은 「격리」와 「나눔」으로 쓴다), 공용 IP 주소, 개인 IP 주소, 공용 부하 분산 장치, 퍼블릭 엔드포인트, 프라이빗 엔드포인트, 온-프레미스, 가상 네트워크 피어링, Microsoft 백본 네트워크, 네트워크 보안 그룹

쓰인 곳(phase 103 step 6): `azure-virtual-networking.virtual-network`, `azure-virtual-networking.subnets`, `VnetIsolationDiagram`
쓰인 곳(phase 103 step 7): `azure-virtual-networking.peering`, `azure-virtual-networking.endpoints`, `VnetPeeringDiagram`, `PrivateEndpointDiagram`
쓰인 곳(phase 103 step 8): `azure-virtual-networking.vpn-connection-types`(사이트 간 터널, 로컬 네트워크에 있는 것처럼 보임, 바깥의 컴퓨터가 연결을 시작), `SiteToSiteVpnDiagram`, az075 해설

## (phase 103) Learn 「Describe Azure networking services」 — 3 Describe Azure virtual private networks
https://learn.microsoft.com/en-us/training/modules/describe-azure-networking-services/3-virtual-private-networks

확인한 날 2026-10-31. 사본: `learn-describe-azure-networking-services-3-virtual-private-networks.md`와 `ko-` 판.

- VPN은 다른 네트워크 안에 암호화된 터널을 두는 것이다. 흔히 믿을 수 있는 사설 네트워크들을 믿을 수 없는 네트워크(대개 공용 인터넷) 너머로 잇는 데 쓰고, 도청 같은 공격을 막으려고 트래픽을 암호화한다 — 첫 문단
- VPN 게이트웨이는 가상 네트워크 게이트웨이의 한 종류이고, 가상 네트워크의 전용 서브넷에 배포한다 — 「VPN gateways」
- 잇는 방식은 셋이다 — 온-프레미스 데이터 센터와는 사이트 간, 개별 장치와는 지점 및 사이트 간, 다른 가상 네트워크와는 네트워크 간(제품 문서의 이름은 VNet 간) — 같은 절
- 가상 네트워크마다 VPN 게이트웨이는 하나만 둘 수 있고, 게이트웨이 하나로 다른 가상 네트워크나 온-프레미스 데이터 센터 같은 여러 곳에 이을 수 있다 — 같은 절
- 이 단원은 데이터가 인터넷을 건널 때 사설 터널 안에서 암호화된다고 적는다. **VNet 간 연결은 인터넷을 건너지 않으므로(「VPN Gateway FAQ」 항목) 「VPN 게이트웨이의 트래픽은 모두 인터넷으로 간다」로 쓰지 않는다** — 같은 절
- 기본으로 인스턴스 둘이 활성/대기로 배포되고, 활성 쪽이 멈추면 대기 쪽이 연결을 이어받는다. 그 사이 연결은 잠깐 끊긴다 — 「Active/standby」. 복구 시간은 이 단원과 「Highly available」 문서의 수가 달라 **쓰지 않는다**
- VPN 게이트웨이를 ExpressRoute의 대체 경로로 둘 수 있다. 회로의 복원력이 들어 있어도 케이블 문제나 위치 전체의 중단까지 막지는 못하므로, 인터넷을 쓰는 다른 길을 하나 더 둔다 — 「ExpressRoute failover」
- 정책 기반·경로 기반, 활성/활성, 영역 중복 게이트웨이, 미리 공유한 키는 **쓰지 않는다**(guide 「배경」)
- 한국어 표기: VPN(가상 사설망), VPN 게이트웨이, 가상 네트워크 게이트웨이, 전용 서브넷, 사이트 간, 지점 및 사이트 간, 네트워크 간, 활성/대기

쓰인 곳(phase 103 step 8): `azure-virtual-networking.vpn-gateway`(VPN의 정의·도청을 막는 암호화, 가상 네트워크 게이트웨이의 한 종류, 전용 서브넷, 가상 네트워크마다 하나와 여러 곳, 기본 구성의 대기), `azure-virtual-networking.vpn-connection-types`(세 유형), `SiteToSiteVpnDiagram`, az073~az075 해설
쓰인 곳(phase 103 step 9): `azure-virtual-networking.expressroute`(VPN의 터널과 견주기, VPN 게이트웨이를 대체 경로로), `ExpressRouteDiagram`

## (phase 103) Learn 「Describe Azure networking services」 — 4 Describe Azure ExpressRoute
https://learn.microsoft.com/en-us/training/modules/describe-azure-networking-services/4-expressroute

확인한 날 2026-10-31. 사본: `learn-describe-azure-networking-services-4-expressroute.md`와 `ko-` 판.

- ExpressRoute는 연결 공급자의 도움으로 온-프레미스 네트워크를 프라이빗 연결로 Microsoft 클라우드까지 넓힌다. 이 연결이 ExpressRoute 회로이고, 사무실·데이터 센터 같은 장소마다 회로를 둔다 — 첫 문단
- 이 단원이 꼽는 이점은 넷이다 — 지정학적 지역 안 모든 지역의 Microsoft 클라우드 서비스에 연결, Global Reach, BGP로 하는 동적 라우팅, 피어링 위치마다 든 중복 — 「Features and benefits of ExpressRoute」
- Global Reach는 회로끼리 이어 온-프레미스 사이트끼리 공용 인터넷을 거치지 않고 데이터를 주고받게 한다. 이 단원의 예는 아시아의 사무실과 유럽의 데이터 센터다 — 「Global connectivity」
- ExpressRoute는 BGP로 온-프레미스 네트워크와 Azure의 리소스 사이에 경로를 주고받는다 — 「Dynamic routing」
- 연결 공급자는 중복된 장치를 쓰고, 회로를 여러 개 둘 수도 있다 — 「Built-in redundancy」
- 고르는 때 — 프라이빗하고 고른 연결이 필요할 때, 규정 준수나 데이터 전송 요건이 엄격할 때, 예측할 수 있는 대기 시간과 높은 처리량이 필요할 때, 중요한 트래픽을 공용 인터넷에 보내지 않으려 할 때 — 「Connectivity model options」
- ExpressRoute가 있어도 DNS 쿼리, 인증서 해지 목록 확인, Azure CDN 요청은 공용 인터넷으로 간다 — 「Security considerations」
- 연결 모델 셋(IP VPN·지점 간 이더넷·코로케이션)은 **쓰지 않는다** — 이 단원도 그 수준에서는 고르는 때에 집중하라고 한다(guide 「배경」)
- 한국어 표기: ExpressRoute 회로, 연결 공급자, 프라이빗 연결, 지정학적 지역, Global Reach, BGP(Border Gateway Protocol), 동적 라우팅, 피어링 위치, 대기 시간, 인증서 해지 목록

쓰인 곳(phase 103 step 9): `azure-virtual-networking.expressroute`, `ExpressRouteDiagram`, az076·az077 해설

## (phase 103) Learn 「Describe Azure networking services」 — 5 Describe Azure DNS
https://learn.microsoft.com/en-us/training/modules/describe-azure-networking-services/5-domain-name-system

확인한 날 2026-10-31. 사본: `learn-describe-azure-networking-services-5-domain-name-system.md`와 `ko-` 판.

- Azure DNS는 DNS 도메인을 Azure 인프라에서 호스트해 이름 확인을 맡는 서비스다. 도메인을 Azure에 두면 다른 Azure 서비스와 같은 자격 증명·API·도구·청구로 DNS 레코드를 관리한다 — 첫 문단
- DNS 이름 서버의 전 세계 네트워크에 호스트되고, 애니캐스트 네트워킹을 써서 사용할 수 있는 가장 가까운 서버가 질의에 답한다 — 「Reliability and performance」
- Azure Resource Manager 위에 있어 Azure RBAC·활동 로그·리소스 잠금으로 DNS 리소스와 레코드를 지킨다 — 「Security」
- 포털·Azure PowerShell·Azure CLI로 관리한다 — 「Ease of use」
- 가상 네트워크 안에서 Azure가 준 이름 대신 직접 정한 도메인 이름을 쓰는 프라이빗 DNS 도메인을 지원한다 — 「Customizable virtual networks with private domains」
- 별칭 레코드 집합은 공용 IP 주소 같은 Azure 리소스를 가리키고, 그 리소스의 IP 주소가 바뀌면 DNS 확인 때 저절로 따라간다 — 「Alias records」
- **Azure DNS로는 도메인 이름을 살 수 없다.** App Service 도메인이나 다른 도메인 이름 등록 기관에서 해마다 값을 내고 산 뒤 Azure DNS에 호스트한다 — 「Alias records」 뒤의 알림
- 한국어 표기: Azure DNS, DNS 레코드, 이름 서버, 애니캐스트 네트워킹, 활동 로그, 리소스 잠금, 프라이빗 DNS 도메인, 별칭 레코드, App Service 도메인

쓰인 곳(phase 103 step 9): `azure-virtual-networking.azure-dns`, az078 해설

## (phase 103) Azure Virtual Network — Azure Virtual Network frequently asked questions (FAQ)
https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq

확인한 날 2026-10-31. 「Last updated on」 2026-07-08. 사본: `docs-virtual-network-virtual-networks-faq.md`와 `ko-` 판.

- 가상 네트워크는 서로 격리되어 있고, Azure 인프라에 호스트된 다른 서비스와도 격리되어 있다. 가상 네트워크 하나가 신뢰 경계다 — 「What is the security model for virtual networks?」
- 가상 네트워크는 Azure 클라우드를 논리적으로 나눈 부분이고 구독에 딸려 있다. 그 안의 서비스와 VM은 서로 바로 통신한다 — 「What is a virtual network?」
- 가상 네트워크는 지역 하나에 묶이고 그 지역의 가용성 영역에는 걸칠 수 있다 — 「Can a virtual network span regions?」
- 가상 네트워크끼리는 피어링이나 VPN 게이트웨이로 잇는다 — 「Can I connect a virtual network to another virtual network in Azure?」
- 가상 네트워크를 다른 가상 네트워크나 온-프레미스와 잇는 조건은 주소 범위가 겹치지 않는 것이다 — 「What is a virtual network?」. 피어링도 주소 공간이 겹치면 켤 수 없다 — 「Can I peer two virtual networks that have matching or overlapping address ranges?」
- 네트워크 보안 그룹은 서브넷이나 네트워크 인터페이스, 또는 둘 다에 걸 수 있다 — 「Can I restrict inbound or outbound traffic flow…?」 (세부는 `azure-network-protection`의 몫이라 그 말을 쓰지 않는다)
- 피어링한 가상 네트워크의 VM은 같은 네트워크에 있는 것처럼 통신한다. 같은 지역이든 다른 지역이든(글로벌 가상 네트워크 피어링) 되고, 다른 구독도 다른 Microsoft Entra 테넌트도 된다 — 「What is virtual network peering?」 등
- **피어링은 이어지지 않는다** — A와 B, B와 C를 피어링해도 A와 C는 피어링된 것이 아니다. A와 C를 직접 피어링해야 한다 — 「If I peer VNetA to VNetB…」
- 피어링 트래픽은 Microsoft가 통제하지 않는 물리 경계 바깥으로 데이터 센터 사이를 옮길 때 데이터 링크 수준의 MACsec 암호화를 받는다 — 「Is virtual network peering traffic encrypted?」. **그래서 「피어링 트래픽은 암호화되지 않는다」로 쓰지 않는다**. MACsec이라는 말은 쓰지 않는다
- Azure PaaS 리소스의 네트워크 접근은 서비스 엔드포인트나 Private Link로 좁힌다. 서비스 엔드포인트 트래픽은 Microsoft 백본으로 다닌다(D59의 근거) — 「How can I restrict access to Azure PaaS resources…?」·「How do virtual network service endpoints provide security?」
- 주소 범위의 값(RFC 1918 등)은 **쓰지 않는다**(guide 「예시 값」)
- 한국어 표기: 글로벌 가상 네트워크 피어링, 전이적 피어링(이 낱말은 쓰지 않고 「이어지지 않는다」로 푼다)

쓰인 곳(phase 103 step 6): `azure-virtual-networking.virtual-network`, `VnetIsolationDiagram`
쓰인 곳(phase 103 step 7): `azure-virtual-networking.peering`, `VnetPeeringDiagram`
쓰인 곳(phase 103 step 12): D58, D59, D60

## (phase 103) Azure Virtual Network — Plan virtual networks
https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-vnet-plan-design-arm

확인한 날 2026-10-31. 「Last updated on」 2025-04-17. 사본: `docs-virtual-network-virtual-network-vnet-plan-design-arm.md`와 `ko-` 판.

- 가상 네트워크 이름은 리소스 그룹 안에서 겹치면 안 되지만, 구독이나 지역 안에서는 겹쳐도 된다 — 「Naming」
- 리소스는 자기와 같은 지역·같은 구독의 가상 네트워크 안에만 만들 수 있고, 다른 지역·다른 구독의 가상 네트워크끼리는 이을 수 있다 — 「Regions」
- 가상 네트워크는 구독과 지역마다 여럿 만들 수 있고, 잇고 잇지 않는 것은 고르는 일이다. 가상 네트워크 하나에 서브넷도 여럿 둔다 — 「Segmentation」
- **주소 공간이 달라야 하는 것은 다른 가상 네트워크나 온-프레미스와 잇는 가상 네트워크다.** 구독 안에서 언제나 달라야 한다는 말은 없다(D58) — 「Segmentation」
- 서브넷의 주소 범위는 가상 네트워크의 주소 공간 안에 있고 다른 서브넷과 겹치면 안 된다 — 「Subnets」
- 서브넷을 나누는 까닭으로 드는 것: 어떤 Azure 서비스가 자기 서브넷을 요구한다(VPN 게이트웨이의 게이트웨이 서브넷 등), 서브넷마다 네트워크 보안 그룹을 다르게 건다, 트래픽이 특정 장비를 지나게 한다, 서비스 접근을 특정 서브넷으로 좁힌다. **쓰는 것은 앞의 둘과 「용도마다 리소스를 나눈다」까지다** — 같은 절
- 가상 네트워크 안의 리소스 사이 트래픽을 거르려면 네트워크 보안 그룹을 쓴다 — 「Traffic filtering」
- 서브넷 수·주소 표기(CIDR)는 **쓰지 않는다**(guide 표 11)
- 한국어 표기: 구독, 지역, 서브넷, 주소 공간, 주소 범위

쓰인 곳(phase 103 step 6): `azure-virtual-networking.virtual-network`, `azure-virtual-networking.subnets`
쓰인 곳(phase 103 step 12): D58, D60

## (phase 103) Azure Virtual Network — Virtual networks and virtual machines in Azure (서브넷 절만 — step 5)
https://learn.microsoft.com/en-us/azure/virtual-network/network-overview

확인한 날 2026-10-31. 사본: `docs-virtual-network-network-overview.md`와 `ko-` 판(step 0이 받았다).

- 서브넷 사이에는 기본으로 보안 경계가 없어 각 서브넷의 VM이 서로 통신한다. 경계가 필요하면 네트워크 보안 그룹을 쓴다 — 「Virtual network and subnets」
- 주소 공간은 다른 네트워크와 잇는다면 겹치지 않게 고른다 — 같은 절

쓰인 곳(phase 103 step 6): `azure-virtual-networking.subnets`, `VnetIsolationDiagram`
쓰인 곳(phase 103 step 12): D58, D60

## (phase 103) Azure Virtual Network — Virtual network traffic routing (기본 경로만)
https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview

확인한 날 2026-10-31. 「Last updated on」 2026-03-31. 사본: `docs-virtual-network-virtual-networks-udr-overview.md`와 `ko-` 판.

- 가상 네트워크를 만들면 Azure가 서브넷마다 시스템 경로를 저절로 만든다. 그 가운데 하나가 가상 네트워크의 주소 공간 안 범위끼리 트래픽을 보낸다 — 그래서 같은 가상 네트워크의 서브넷끼리 고객이 경로를 만들지 않아도 통신한다 — 「Default system routes」
- 경로는 주소 범위와 다음 도착지로 이루어지고, 트래픽이 서브넷을 나갈 때 Azure가 맞는 경로를 쓴다. **라우팅을 「트래픽이 어느 길로 갈지 정하는 것」으로 푸는 근거로만 쓴다** — 같은 절
- 사용자 정의 경로와 경로 선택 규칙은 **쓰지 않는다**(guide 「배경」)

쓰인 곳(phase 103 step 6): `azure-virtual-networking.subnets`
쓰인 곳(phase 103 step 9): `azure-virtual-networking.expressroute`(라우팅을 푸는 한 줄)

## (phase 103) Azure Virtual Network — Private IP addresses (한 줄 풀이만)
https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/private-ip-addresses

확인한 날 2026-10-31. 「Last updated on」 2024-11-10. 사본: `docs-virtual-network-ip-services-private-ip-addresses.md`와 `ko-` 판.

- 개인 IP 주소는 Azure 리소스끼리 공용 IP 주소 없이 통신하게 한다. 같은 가상 네트워크의 리소스뿐 아니라 VPN 게이트웨이나 ExpressRoute 회로로 이어진 온-프레미스 네트워크와도 통신한다 — 첫 부분
- 한국어 표기: 제목은 「프라이빗 IP 주소」인데 본문은 「개인 IP」다. 다른 한국어판과 같이 「개인 IP 주소」로 쓴다

쓰인 곳(phase 103 step 6): `azure-virtual-networking.virtual-network`
쓰인 곳(phase 103 step 7): `azure-virtual-networking.endpoints`

## (phase 103) Azure Virtual Network — Public IP addresses (한 줄 풀이만)
https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/public-ip-addresses

확인한 날 2026-10-31. 「Last updated on」 2025-11-18. 사본: `docs-virtual-network-ip-services-public-ip-addresses.md`와 `ko-` 판.

- 공용 IP 주소는 인터넷에서 Azure 리소스로 들어오는 통신을 받고, Azure 리소스가 인터넷과 공용 Azure 서비스로 통신하게 한다. 붙인 리소스에는 떼거나 리소스를 지울 때까지 그 리소스 전용으로 남는다 — 첫 부분
- VM의 네트워크 인터페이스 같은 리소스에 붙인다. Azure Resource Manager에서 공용 IP 주소는 자기 속성을 가진 리소스다 — 같은 곳
- 한국어 표기: 공용 IP 주소

쓰인 곳(phase 103 step 6): `azure-virtual-networking.virtual-network`
쓰인 곳(phase 103 step 7): `azure-virtual-networking.endpoints`, `PrivateEndpointDiagram`

## (phase 103) Azure Virtual Network — Default outbound access in Azure (쓰지 않는 근거)
https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/default-outbound-access

확인한 날 2026-10-31. 「Last updated on」 2026-09-10. 사본: `docs-virtual-network-ip-services-default-outbound-access.md`.

- 나가는 방법을 정하지 않은 VM에 Azure가 공용 IP 주소를 저절로 주는 기본 아웃바운드 액세스가 있지만, 2026-03-31 뒤에 나온 API로 만든 새 가상 네트워크의 서브넷은 기본으로 이 액세스가 꺼진다. 기존 가상 네트워크는 바뀌지 않는다 — 첫 부분과 「How and when default outbound access is provided」
- **그래서 「가상 네트워크의 리소스는 기본으로 인터넷으로 나갈 수 있다」를 쓰지 않는다.** 이 주제는 들어오는 연결(공용 IP 주소·공용 부하 분산 장치)만 쓴다

쓰인 곳(phase 103 step 9가 확인): `azure-virtual-networking.virtual-network`(쓰지 않는다는 기록 — 개념에 쓰지 않았다)

## (phase 103) Azure Virtual Network — Azure virtual network peering
https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview

확인한 날 2026-10-31. 「Last updated on」 2026-10-20. 사본: `docs-virtual-network-virtual-network-peering-overview.md`와 `ko-` 판.

- 피어링은 가상 네트워크 둘 이상을 이어 연결 면에서 하나처럼 보이게 한다. 같은 지역을 잇는 가상 네트워크 피어링과 다른 지역을 잇는 글로벌 가상 네트워크 피어링이 있다 — 첫 부분
- 구독·Microsoft Entra 테넌트·지역이 달라도 데이터를 옮길 수 있고, 피어링을 만드는 동안이나 뒤에 양쪽 리소스가 멈추지 않는다 — 같은 곳
- 피어링한 가상 네트워크 사이 트래픽은 사설이고 Microsoft 백본 네트워크에 머문다. 통신에 공용 인터넷·게이트웨이·암호화가 필요 없다 — 같은 곳
- 트래픽은 게이트웨이나 공용 인터넷을 지나지 않고 백본으로 바로 간다. 같은 지역 VM 사이의 지연은 한 가상 네트워크 안과 같다 — 「Connectivity」
- 어느 쪽 가상 네트워크든 네트워크 보안 그룹으로 다른 가상 네트워크나 서브넷으로 가는 접근을 막을 수 있다. 기본은 전체 연결이다 — 같은 절
- 서브넷 피어링, 서비스 체이닝, 허브 앤 스포크, Virtual Network Manager는 **쓰지 않는다**
- 한국어 표기: 가상 네트워크 피어링, 글로벌 가상 네트워크 피어링(제품 문서 FAQ 한국어판. 개요 한국어판의 표기도 「글로벌」), 피어링된 가상 네트워크

쓰인 곳(phase 103 step 7): `azure-virtual-networking.peering`, `VnetPeeringDiagram`
쓰인 곳(phase 103 step 12): D60

## (phase 103) Azure networking — Microsoft global network (한 줄 풀이만)
https://learn.microsoft.com/en-us/azure/networking/microsoft-global-network

확인한 날 2026-10-31. 「Last updated on」 2026-08-27. 사본: `docs-networking-microsoft-global-network.md`와 `ko-` 판.

- Microsoft 글로벌 네트워크는 Microsoft 데이터 센터들을 서로, 그리고 전 세계 고객과 잇는 광역 네트워크이고 백본 네트워크다. **그래서 「Microsoft 백본 네트워크」를 「Microsoft가 운영하며 자기 데이터 센터들을 잇는 네트워크」로 푼다.** 지역 수와 길이는 **쓰지 않는다** — 첫 문단
- 한국어 표기: Microsoft 글로벌 네트워크, 백본 네트워크

쓰인 곳(phase 103 step 7): `azure-virtual-networking.peering`, `azure-virtual-networking.endpoints`

## (phase 103) Azure Private Link — What is a private endpoint?
https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview

확인한 날 2026-10-31. 「Last updated on」 2026-08-11. 사본: `docs-private-link-private-endpoint-overview.md`와 `ko-` 판.

- 프라이빗 엔드포인트는 가상 네트워크의 개인 IP 주소를 쓰는 네트워크 인터페이스이고, Azure Private Link로 제공되는 서비스에 사설로 잇는다. 서비스를 가상 네트워크 안으로 들이는 셈이다 — 첫 문단
- 그 서비스는 Azure Storage·Azure Cosmos DB·Azure SQL Database 같은 Azure 서비스이거나, Private Link 서비스로 내놓은 고객 자신의 서비스다 — 같은 곳
- 프라이빗 엔드포인트는 서브넷에 배포되고 그 서브넷에서 IP 주소를 받는다 — 「Private endpoint properties」
- 연결은 프라이빗 엔드포인트에 닿는 클라이언트 쪽에서만 시작한다. 프라이빗 엔드포인트는 가상 네트워크와 같은 지역·같은 구독에 있어야 하지만 연결할 리소스는 다른 지역에 있어도 된다 — 「Private endpoint properties」 아래 목록. **쓰지 않아도 된다**
- 승인 절차·DNS 구성·네트워크 정책은 **쓰지 않는다**
- 한국어 표기: 프라이빗 엔드포인트, 개인 IP 주소, 네트워크 인터페이스, Azure Private Link(옮기지 않는다)

쓰인 곳(phase 103 step 7): `azure-virtual-networking.endpoints`, `PrivateEndpointDiagram`
쓰인 곳(phase 103 step 12): D59, G38

## (phase 103) Azure Private Link — What is Azure Private Link?
https://learn.microsoft.com/en-us/azure/private-link/private-link-overview

확인한 날 2026-10-31. 「Last updated on」 2026-07-23. 사본: `docs-private-link-private-link-overview.md`와 `ko-` 판.

- Private Link는 가상 네트워크의 프라이빗 엔드포인트를 거쳐 Azure PaaS 서비스(Azure Storage 등)와 Azure에 호스트된 고객·파트너 서비스에 닿게 한다. 가상 네트워크와 그 서비스 사이 트래픽은 Microsoft 백본 네트워크로 다니고, 서비스를 공용 인터넷에 내놓을 필요가 없어진다 — 첫 문단
- 프라이빗 엔드포인트는 PaaS 리소스 인스턴스 하나에 대응하므로 그 서비스의 다른 리소스에는 닿지 못한다 — 「Key benefits」
- 온-프레미스도 VPN 터널이나 ExpressRoute로, 피어링한 가상 네트워크도 프라이빗 엔드포인트로 서비스에 닿는다 — 같은 절
- 한국어 표기: Azure Private Link, 프라이빗 링크

쓰인 곳(phase 103 step 7): `azure-virtual-networking.endpoints`, `PrivateEndpointDiagram`
쓰인 곳(phase 103 step 12): D59

## (phase 103) Azure Storage — Use private endpoints for Azure Storage
https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints

확인한 날 2026-10-31. 「Last updated on」 2025-07-16. 사본: `docs-storage-common-storage-private-endpoints.md`와 `ko-` 판.

- 스토리지 계정의 프라이빗 엔드포인트는 가상 네트워크의 주소 공간에서 받은 IP 주소를 쓰고, 가상 네트워크의 클라이언트와 스토리지 계정 사이 트래픽은 Microsoft 백본 네트워크의 private link로 다녀 공용 인터넷에 드러나지 않는다 — 첫 문단
- **프라이빗 엔드포인트를 만들어도 퍼블릭 엔드포인트의 연결이 저절로 막히지는 않는다.** 프라이빗 엔드포인트로만 받으려면 스토리지 방화벽으로 퍼블릭 엔드포인트를 막는다 — 첫 문단 다음 목록과 「Conceptual overview」
- 가상 네트워크 밖에서 스토리지 주소를 찾으면 퍼블릭 엔드포인트로, 프라이빗 엔드포인트가 있는 가상 네트워크 안에서 찾으면 그 프라이빗 엔드포인트의 IP 주소로 이어진다 — DNS 절
- 한국어 표기: 프라이빗 엔드포인트, 퍼블릭 엔드포인트(이 문서 한국어판에도 그대로), 스토리지 계정, 스토리지 방화벽

쓰인 곳(phase 103 step 7): `azure-virtual-networking.endpoints`, `PrivateEndpointDiagram`
쓰인 곳(phase 103 step 12): G38

## (phase 103) Azure Storage — Storage account overview (한 줄 풀이만)
https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview

확인한 날 2026-10-31. 「Last updated on」 2026-07-16. 사본: `docs-storage-common-storage-account-overview.md`.

- 스토리지 계정은 Azure Storage의 데이터 개체를 담고, HTTP나 HTTPS로 세계 어디서나 닿을 수 있는 고유한 이름 공간을 준다 — 첫 문단. **「데이터를 담는 Azure 저장소의 단위」로 푸는 데만 쓴다**(종류는 `azure-storage`의 몫이다)
- 저장한 개체마다 계정 이름이 든 URL 주소가 있고, 계정 이름과 서비스 엔드포인트를 합친 것이 그 계정의 엔드포인트다 — 「Storage account endpoints」. **이 문서가 엔드포인트를 그 데이터에 닿는 주소로 쓴다.** 받은 문서에는 엔드포인트만 따로 정의하는 문장이 없으므로, `endpoints`는 이 쓰임과 Learn 단원 2의 두 정의로 「서비스에 닿을 때 연결하는 접속 지점」까지만 푼다
- 스토리지 계정은 Blob·파일·큐·테이블 데이터 개체를 담는다 — 첫 문단 (phase 104, 다시 확인 2026-11-01)
- 계정 유형 넷의 지원 서비스: 표준 범용 v2는 Blob·Queue·Table·Files, 프리미엄 블록 Blob은 Blob, 프리미엄 파일 공유는 Files, 프리미엄 페이지 Blob은 페이지 Blob만이다. 중복성은 표준 범용 v2가 여섯 옵션, 프리미엄 블록 Blob과 프리미엄 파일 공유가 LRS·ZRS다 — 「Types of storage accounts」 (phase 104)
- **프리미엄 페이지 Blob의 중복성을 이 문서만 LRS·ZRS로 적는다.** Learn 단원 2, 「Azure Storage redundancy」(2026-08-11)의 표, 「Create a storage account」(`Premium_LRS`만)는 LRS 하나다. 셋을 따라 **LRS로 쓴다** (phase 104)
- 권장 용도: 표준 범용 v2는 대부분의 경우에 권장된다. 프리미엄 블록 Blob은 트랜잭션이 많거나 작은 개체를 쓰거나 대기 시간이 늘 낮아야 할 때, 프리미엄 파일 공유는 규모가 크거나 성능이 중요한 앱과 SMB·NFS 공유를 함께 두려는 계정, 프리미엄 페이지 Blob은 페이지 Blob 전용이다 — 같은 표 (phase 104)
- 프리미엄 계정은 SSD를 써서 대기 시간이 낮고 처리량이 높다 — 같은 표 각주 3. **표준 계정의 저장 장치를 말하는 문장은 받은 문서에 없다 — 쓰지 않는다** (phase 104)
- 계정을 만든 뒤에는 유형을 바꿀 수 없다. 다른 유형으로 옮기려면 새 계정을 만들어 데이터를 복사한다 — 같은 절 Note (phase 104)
- 계정 이름은 3~24자이고 숫자와 소문자만 쓴다. Azure 안에서 하나뿐이라 같은 이름의 계정이 둘일 수 없다 — 「Storage account name」 (phase 104)
- 표준 엔드포인트는 프로토콜, 하위 도메인인 계정 이름, 서비스 이름이 든 고정 도메인으로 이루어진다. Blob은 `https://<계정 이름>.blob.core.windows.net`, Files는 `https://<계정 이름>.file.core.windows.net`이다 — 「Standard endpoints」 (phase 104)
- **쓰지 않는 것**: 옛 계정 유형, DNS 영역 엔드포인트, 계정 수 한도, 워크로드 표 (phase 104, guide 「배경」)
- 한국어 표기: 스토리지 계정, 네임스페이스(이 한국어판과 Blob 소개 한국어판), 표준 범용 v2, 프리미엄 블록 Blob, 프리미엄 파일 공유, 프리미엄 페이지 Blob, 엔드포인트 (phase 104)

쓰인 곳(phase 103 step 7): `azure-virtual-networking.endpoints`
쓰인 곳(phase 104): `azure-storage.storage-accounts`, `azure-storage.account-types`, `StorageAccountDiagram`, `StorageAccountTypesTable`, D67, D68

## (phase 103) Azure VPN Gateway — What is Azure VPN Gateway?
https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways

확인한 날 2026-10-31. 「Last updated on」 2026-06-08. 사본: `docs-vpn-gateway-vpn-gateway-about-vpngateways.md`와 `ko-` 판.

- VPN Gateway는 가상 네트워크와 온-프레미스 사이에는 공용 인터넷으로, 가상 네트워크끼리는 Microsoft 네트워크로 암호화된 트래픽을 보낸다. 쓰는 것은 VPN 게이트웨이라는 종류의 가상 네트워크 게이트웨이다 — 첫 문단
- 한 VPN 게이트웨이에 연결을 여럿 만들 수 있고, 그 터널들이 게이트웨이의 대역폭을 나눠 쓴다 — 같은 곳. 대역폭 수치는 **쓰지 않는다**
- 사이트 간 연결은 VPN 게이트웨이와 온-프레미스 VPN 디바이스 사이의 터널이다 — 「Why use VPN Gateway?」
- 지점 및 사이트 간 연결은 회의장이나 집 같은 원격 위치에서 가상 네트워크로 잇는다 — 같은 절
- VNet 간 연결은 VPN 게이트웨이와 다른 Azure VPN 게이트웨이 사이의 터널이다 — 같은 절
- 사이트 간 VPN은 ExpressRoute의 대체 경로로 쓸 수 있고, 두 연결을 함께 둘 수도 있다 — 같은 절
- 프로토콜 이름(IPsec/IKE·OpenVPN 등), SKU, 요금은 **쓰지 않는다**
- 한국어 표기: 제품 이름 Azure VPN Gateway, 리소스 VPN 게이트웨이, 가상 네트워크 게이트웨이, 사이트 간(이 문서 한국어판에 「사이트 및 사이트 간」도 섞인다), 지점 및 사이트 간, VNet 간, 온-프레미스 VPN 디바이스

쓰인 곳(phase 103 step 8): `azure-virtual-networking.vpn-gateway`(연결을 여럿 만든다), `azure-virtual-networking.vpn-connection-types`(사이트 간·지점 및 사이트 간·VNet 간의 두 끝), `SiteToSiteVpnDiagram`

## (phase 103) Azure VPN Gateway — Tutorial: Create a site-to-site VPN connection in the Azure portal
https://learn.microsoft.com/en-us/azure/vpn-gateway/tutorial-site-to-site-portal

확인한 날 2026-10-31. 「Last updated on」 2025-07-09. 사본: `docs-vpn-gateway-tutorial-site-to-site-portal.md`와 `ko-` 판.

- 사이트 간 연결을 만드는 순서: 가상 네트워크 → 게이트웨이 서브넷 → VPN 게이트웨이 → 로컬 네트워크 게이트웨이 → VPN 디바이스 구성 → VPN 연결 — 「What you accomplish」과 절 제목
- 가상 네트워크 게이트웨이에는 이름이 `GatewaySubnet`인 서브넷이 꼭 있어야 하고, 이 서브넷은 가상 네트워크 주소 범위의 일부다 — 「Create a gateway subnet」
- **로컬 네트워크 게이트웨이**는 Azure에 만드는 개체이고 온-프레미스 위치(사이트)를 라우팅 목적으로 나타낸다. 온-프레미스 VPN 디바이스의 IP 주소와, VPN 게이트웨이를 지나 그쪽으로 보낼 온-프레미스 주소 범위를 적는다. VPN 디바이스마다 하나 만든다 — 「Create a local network gateway」
- VPN 연결은 가상 네트워크 게이트웨이와 온-프레미스 VPN 디바이스 사이에 만든다. 만들 때 그 VPN 게이트웨이와 로컬 네트워크 게이트웨이를 고른다 — 「Create VPN connections」
- 온-프레미스 VPN 디바이스는 호환되는 장비여야 하고 바깥에서 닿는 공용 IPv4 주소가 있어야 한다. VPN 게이트웨이도 공용 IP 주소를 쓴다 — 「Prerequisites」·「Create a VPN gateway」
- 온-프레미스와 가상 네트워크의 주소 범위가 겹치면 트래픽이 뜻하지 않게 간다 — 「Prerequisites」·「Create a virtual network」 알림
- 이 자습서는 활성-활성 게이트웨이를 고가용성에 권장하며 만든다. 기본 구성은 「Highly available」 항목대로 활성/대기다. **활성-활성은 쓰지 않는다**(guide 「배경」)
- 게이트웨이 서브넷의 크기, 실제 주소 값, 미리 공유한 키, SKU는 **쓰지 않는다**
- 한국어 표기: 로컬 네트워크 게이트웨이, 게이트웨이 서브넷(이름 `GatewaySubnet`), VPN 디바이스, 온-프레미스 VPN 디바이스, VPN 연결, 사이트 간

쓰인 곳(phase 103 step 8): `azure-virtual-networking.vpn-gateway`(사이트 간 연결에 필요한 네 가지, 게이트웨이 서브넷의 이름, 로컬 네트워크 게이트웨이, VPN 연결, 둘 다 공용 IP 주소), `SiteToSiteVpnDiagram`, az073·az074 해설

## (phase 103) Azure VPN Gateway — About Point-to-Site VPN
https://learn.microsoft.com/en-us/azure/vpn-gateway/point-to-site-about

확인한 날 2026-10-31. 사본: `docs-vpn-gateway-point-to-site-about.md`와 `ko-` 판(step 8이 받았다).

- 지점 및 사이트 간 연결은 개별 컴퓨터에서 가상 네트워크로 잇는 연결이고, 그 컴퓨터 쪽에서 시작해 만들어진다. 집이나 회의장 같은 원격 위치에서 쓰고, 연결할 컴퓨터가 몇 대뿐이면 사이트 간 대신 쓸 만하다 — 첫 문단
- **이 문서와 받은 다른 문서는 「온-프레미스 VPN 디바이스가 필요 없다」고 문장으로 말하지 않는다.** 그래서 그 말로 쓰지 않고, 연결이 컴퓨터와 가상 네트워크 사이에 놓인다는 사실(「What is Azure Virtual Network?」 항목)대로 「온-프레미스 VPN 디바이스를 거치지 않는다」로 쓴다
- 프로토콜 이름과 인증 방식은 **쓰지 않는다**(guide 「배경」)
- 한국어 표기: 지점 및 사이트 간

쓰인 곳(phase 103 step 8): `azure-virtual-networking.vpn-connection-types`, `SiteToSiteVpnDiagram`, az075 해설

## (phase 103) Azure VPN Gateway — VPN Gateway FAQ (VNet 간 절만)
https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-vpn-faq

확인한 날 2026-10-31. 「Last updated on」 2026-06-04. 사본: `docs-vpn-gateway-vpn-gateway-vpn-faq.md`.

- **VNet 간 트래픽은 인터넷이 아니라 Microsoft Azure 백본으로 다니고**, IPsec·IKE 암호화로 보호된다 — 「Does VNet-to-VNet traffic travel across the internet?」·「Is VNet-to-VNet traffic secure?」
- 가상 네트워크끼리 잇는 데는 VPN 디바이스가 필요 없다. 온-프레미스도 함께 이을 때만 필요하다 — 「Do I need a VPN device to connect VNets together?」
- 그래서 **피어링과 VNet 간 VPN은 둘 다 인터넷을 지나지 않고, 갈리는 것은 VPN 게이트웨이와 암호화 터널이 있는가다.** 피어링 쪽 근거는 「Azure virtual network peering」 항목(게이트웨이·암호화가 필요 없다)
- 한국어 표기: VNet 간

쓰인 곳(phase 103 step 7): `azure-virtual-networking.peering`
쓰인 곳(phase 103 step 8): `azure-virtual-networking.vpn-connection-types`(VNet 간 트래픽은 Microsoft 백본 네트워크로, VPN 디바이스가 필요 없다 — 온-프레미스도 함께 이을 때가 아니면)

## (phase 103) Azure VPN Gateway — Design highly available gateway connectivity (기본 구성만)
https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-highlyavailable

확인한 날 2026-10-31. 「Last updated on」 2025-03-31. 사본: `docs-vpn-gateway-vpn-gateway-highlyavailable.md`.

- VPN 게이트웨이는 기본으로 인스턴스 둘의 활성/대기 구성이고, 유지 관리나 뜻밖의 중단이 활성 쪽에 오면 대기 쪽이 저절로 이어받으며 그동안 잠깐 끊긴다 — 「About VPN gateway redundancy」. 시간 수치는 **쓰지 않는다**(Learn 단원 3과 수가 다르다)

쓰인 곳(phase 103 step 8): `azure-virtual-networking.vpn-gateway`(기본으로 실행 단위 둘, 대기 쪽이 이어받고 잠깐 끊긴다)

## (phase 103) Azure ExpressRoute — ExpressRoute FAQ와 circuit peerings (근거 기록)
https://learn.microsoft.com/en-us/azure/expressroute/expressroute-faqs
https://learn.microsoft.com/en-us/azure/expressroute/expressroute-circuit-peerings

확인한 날 2026-10-31. 「Last updated on」 FAQ 2026-03-31, circuit peerings 2026-08-28. 사본: `docs-expressroute-expressroute-faqs.md`·`docs-expressroute-expressroute-circuit-peerings.md`.

- 프라이빗 연결은 서비스 공급자에게서 사고, 회로 하나는 공급자 하나에 대응하며, 회로를 여러 공급자로 여럿 둘 수 있다 — FAQ 「Can I have ExpressRoute circuits from different service providers?」 등. **연결 공급자를 「온-프레미스와 Microsoft 사이의 연결을 맡는 업체」로 푸는 근거로 쓴다**
- 회로는 공급자·피어링 위치에 묶인 고정 대역폭을 갖는다 — circuit peerings. 대역폭 수치는 **쓰지 않는다**(guide 금지)
- Azure까지 Layer 2를 넓히는 것은 지원하지 않는다 — FAQ. 계층은 **쓰지 않는다**(guide 「배경」)
- 받은 문서에는 ExpressRoute 트래픽이 암호화된다는 말도, 되지 않는다는 말도 없다. **그래서 암호화 여부를 쓰지 않고 「보안이 높다」는 공용 인터넷을 지나지 않는다는 데서만 쓴다**

쓰인 곳(phase 103 step 9): `azure-virtual-networking.expressroute`(연결 공급자를 푸는 한 줄), `ExpressRouteDiagram`, G37

## (phase 103) Azure Resource Manager — Lock your Azure resources (한 줄 풀이만)
https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources

확인한 날 2026-10-31. 「Last updated on」 2025-02-06. 사본: `docs-azure-resource-manager-management-lock-resources.md`와 `ko-` 판.

- 잠금은 구독·리소스 그룹·리소스가 실수로 지워지거나 바뀌지 않게 한다 — 첫 문단. **`azure-dns`의 「리소스 잠금」 한 줄 풀이에만 쓴다**
- 한국어 표기: 잠금, 리소스 잠금

쓰인 곳(phase 103 step 9): `azure-virtual-networking.azure-dns`

## (phase 103) Azure Monitor — Activity log in Azure Monitor (한 줄 풀이만)
https://learn.microsoft.com/en-us/azure/azure-monitor/platform/activity-log

확인한 날 2026-10-31. 「Last updated on」 2026-10-19. 사본: `docs-azure-monitor-platform-activity-log.md`와 `ko-` 판.

- 활동 로그는 Azure 리소스의 관리 작업(만들기, 정책 변경 같은 것)을 기록해 나중에 살피거나 감사하게 한다 — 첫 문단. **`azure-dns`의 한 줄 풀이에만 쓴다**
- 한국어 표기: 활동 로그

쓰인 곳(phase 103 step 9): `azure-virtual-networking.azure-dns`

## (phase 103) Azure DNS — Overview of DNS zones and records
https://learn.microsoft.com/en-us/azure/dns/dns-zones-records

확인한 날 2026-10-31. 「Last updated on」 2026-09-14. 사본: `docs-dns-dns-zones-records.md`와 `ko-` 판.

- 도메인 이름 등록 기관은 도메인 이름을 살 수 있게 해 주는 조직이다. 이름을 사면 그 아래의 DNS 계층을 다스릴 권리를 얻는다 — 「Domain names」
- Azure DNS는 도메인을 호스트할 이름 서버를 주지만 도메인 이름을 파는 일은 지원하지 않는다 — 같은 절
- 도메인을 호스트하려면 DNS 영역을 만들고 그 안에 레코드를 둔다. 예로 웹 사이트용 `www`나 메일 서버용 `mail` 같은 이름을 들고, A 레코드 `www`가 IP 주소를 가리키는 예를 보인다. **그래서 레코드를 「도메인 안의 어떤 이름이 어디를 가리키는지 적어 둔 항목」으로 푼다** — 「DNS zones」·「Record sets」
- 레코드 유형 표와 레코드 집합의 세부는 **쓰지 않는다**
- 한국어 표기: DNS 영역, 레코드, 레코드 집합, 도메인 이름 등록 기관(Learn 단원 5 한국어판의 「도메인 이름 등록자」는 같은 뜻이다 — 이 문서의 「등록 기관」을 쓴다)

쓰인 곳(phase 103 step 9): `azure-virtual-networking.azure-dns`, az078 해설

## (phase 103) Azure CDN — What is Azure Content Delivery Network? (한 줄 풀이만)
https://learn.microsoft.com/en-us/azure/cdn/cdn-overview

확인한 날 2026-10-31. 「Last updated on」 2026-02-28. 사본: `docs-cdn-cdn-overview.md`.

- 콘텐츠 전송 네트워크는 서버를 여러 곳에 두어 웹 콘텐츠를 전달하는 네트워크이고, 콘텐츠를 사용자 가까운 에지 서버에 캐시해 대기 시간을 줄인다 — 첫 부분. **`expressroute`의 Azure CDN 한 줄 풀이에만 쓴다**
- 이 문서는 Azure CDN Standard from Microsoft (classic)가 2027-09-30에 끝나고 Azure Front Door로 옮기라고 적는다 — 맨 앞의 알림. Learn 단원 4가 Azure CDN을 드는 줄을 따라 이름을 쓰고, 지원 종료는 본문에 쓰지 않는다

쓰인 곳(phase 103 step 9): `azure-virtual-networking.expressroute`, az077 해설

## (phase 103) 한국어 표기 정리 — `azure-virtual-networking`

위 항목들의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다(phase 103 step 5). Microsoft 한국어 문서의 표기를 따르고(guide 「배경」), 한국어판 사이에 표기가 갈리면 근거를 적는다.

| 개념·항목 | 쓸 이름(`name`) | 근거 |
|---|---|---|
| `virtual-network` | **가상 네트워크** | Learn 단원 2 한국어판·가상 네트워크 개요 한국어판 본문. 제품 이름 Azure Virtual Network는 옮기지 않는다 |
| `subnets` | **서브넷** | Learn 단원 2 한국어판·Plan virtual networks 한국어판 |
| `peering` | **가상 네트워크 피어링** | Learn 단원 2·피어링 개요 한국어판. 다른 지역을 잇는 것은 **글로벌 가상 네트워크 피어링**(FAQ 한국어판) |
| `endpoints` | **퍼블릭 엔드포인트와 프라이빗 엔드포인트** | Learn 단원 2 한국어판. 목록 항목 이름 — **퍼블릭 엔드포인트**(Public Endpoint), **프라이빗 엔드포인트**(Private Endpoint) |
| `vpn-gateway` | **VPN 게이트웨이** | Learn 단원 3 한국어판의 절 제목, VPN Gateway 개요 한국어판의 「VPN 게이트웨이」. 제품 이름은 Azure VPN Gateway |
| `vpn-connection-types` | **VPN 게이트웨이 연결 유형** | 이름표 개념이라 한국어판 문구가 따로 없다 — Learn 단원 3의 「연결」. 목록 항목 이름 — **사이트 간**(Site-to-Site), **지점 및 사이트 간**(Point-to-Site), **VNet 간**(VNet-to-VNet) |
| `expressroute` | **ExpressRoute** | Learn 단원 4 한국어판(옮기지 않는다). ExpressRoute 회로, 연결 공급자 |
| `azure-dns` | **Azure DNS** | Learn 단원 5 한국어판(옮기지 않는다) |

섞여 쓰인 표기와 고른 것:

- **퍼블릭 / 공용** — 엔드포인트는 Learn 단원 2와 스토리지 프라이빗 엔드포인트 문서 한국어판이 모두 **「퍼블릭 엔드포인트」**, IP 주소는 공용 IP 주소 문서와 Learn 단원 2 한국어판이 모두 **「공용 IP 주소」**다. 한 문장 안에서 갈려도 한국어판대로 쓴다 — 「퍼블릭 엔드포인트는 공용 IP 주소를 쓴다」
- **개인 / 프라이빗 / 사설** — step 0의 물음에 대한 답: IP 주소는 **「개인 IP 주소」**로 확정한다(Learn 단원 2, 개인 IP 문서 본문, 프라이빗 엔드포인트 개요 한국어판. 개인 IP 문서의 제목만 「프라이빗 IP 주소」다). 엔드포인트와 ExpressRoute의 연결은 한국어판대로 **「프라이빗 엔드포인트」·「프라이빗 연결」**이다. 네트워크 자체는 phase 102가 쓴 **「사설 네트워크」**를 잇는다. 프라이빗 연결은 처음 쓸 때 「공용 인터넷을 지나지 않는 연결」로 푼다
- **지점 및 사이트 간 / 지점 간** — Learn 단원 2·3과 VPN Gateway 개요 한국어판이 **「지점 및 사이트 간」**이다(개요 한국어판의 다른 곳에는 「지점-사이트 간」도 있다). 「지점 간」은 Learn 단원 4 한국어판에서 point-to-point(이더넷 연결 모델)를 옮긴 말이고 용어집 2-22의 표현이라 쓰지 않는다
- **사이트 간 / 사이트 및 사이트 간 / S2S** — 자습서 제목과 Learn 단원 3 한국어판의 **「사이트 간」**을 쓴다. VPN Gateway 개요 한국어판 한 줄의 「사이트 및 사이트 간」은 쓰지 않는다
- **VNet 간 / 네트워크 간** — Learn 단원 3 한국어판은 「네트워크 간」, VPN Gateway 개요 한국어판은 **「VNet 간」**이다. 제품 문서의 이름인 「VNet 간」을 쓰고, VNet을 가상 네트워크로 한 번 푼다
- **VPN 게이트웨이 / 가상 네트워크 게이트웨이** — 다른 것을 가리키는 낱말이다. 가상 네트워크 게이트웨이가 넓은 종류이고 VPN 게이트웨이는 그 한 종류다(Learn 단원 3). 본문은 「VPN 게이트웨이」로 쓰고 위 관계를 한 번 밝힌다
- **VPN 디바이스 / VPN 장치** — 한국어판이 모두 **「VPN 디바이스」**다. guide의 「VPN 장치」는 잠정 표기이고, 도식 라벨도 「온-프레미스 VPN 디바이스」로 쓴다
- **게이트웨이 서브넷** — 자습서 한국어판. 그 서브넷의 이름은 `GatewaySubnet`이다(이름 자체가 정해져 있다)
- **온-프레미스** — phase 100의 표기를 잇는다. Learn 단원 2 한국어판도 같다
- **애니캐스트 네트워킹 / 이름 서버 / 별칭 레코드 / 활동 로그 / 리소스 잠금** — Learn 단원 5 한국어판

## (phase 103) Azure Virtual Network — Azure network security groups overview
https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview

확인한 날 2026-11-01. 「Last updated on」 2025-07-15. 사본: `docs-virtual-network-network-security-groups-overview.md`와 `ko-` 판.

- 네트워크 보안 그룹은 가상 네트워크 안 Azure 리소스의 트래픽을 거르는 리소스이고, 들어오거나 나가는 트래픽을 허용하거나 막는 보안 규칙을 담는다 — 첫 문단
- 규칙의 속성은 일곱이다 — 이름, 우선순위, 원본 또는 대상, 프로토콜, 방향, 포트 범위, 작업 — 「Security rules」의 표
- 우선순위는 100~4096의 수다. **번호가 낮을수록 먼저 처리하고, 트래픽이 어떤 규칙에 맞으면 거기서 처리를 멈춘다.** 그래서 뒤의 규칙은 보지 않는다 — 같은 표 「Priority」
- 우선순위와 방향이 모두 같은 규칙은 둘 만들 수 없다 — 표 다음 문단
- 원본·대상에는 모두(Any), IP 주소 하나, 주소 범위, **서비스 태그, 애플리케이션 보안 그룹**을 쓸 수 있다 — 표 「Source or destination」. **그래서 NO.68의 「애플리케이션 보안 그룹만」은 틀리다**(D61). 한 규칙에 서비스 태그나 애플리케이션 보안 그룹을 여럿 쓰지는 못한다 — 같은 칸(세부라 쓰지 않는다)
- 프로토콜은 TCP·UDP·ICMP 또는 모두(Any)로 고른다(ESP·AH는 포털에 없어 쓰지 않는다) — 표 「Protocol」. 방향은 인바운드나 아웃바운드, 작업은 허용이나 거부다 — 표 「Direction」·「Action」
- **상태 저장**: 이미 맺어진 연결마다 흐름 기록이 만들어져, 나가는 요청을 허용했으면 그 응답이 들어오는 규칙을 따로 만들지 않아도 되고, 들어오는 쪽을 허용했으면 나가는 응답도 마찬가지다. 들어오는 규칙이 꼭 필요한 것은 바깥에서 먼저 연결을 시작할 때다 — 표 다음 문단
- 규칙을 지워도 이미 맺어진 연결은 끊기지 않는다. 규칙의 변경은 새 연결에만 적용된다 — 같은 곳의 다음 문단(세부라 쓰지 않아도 된다)
- **기본 규칙**(만든 NSG마다 Azure가 넣는다) — 「Default security rules」. 들어오는 쪽: `AllowVNetInBound`(65000, 가상 네트워크끼리 허용), `AllowAzureLoadBalancerInBound`(65001, Azure 부하 분산 장치에서 오는 것 허용), `DenyAllInbound`(65500, 나머지 모두 거부). 나가는 쪽: `AllowVnetOutBound`(65000, 가상 네트워크끼리 허용), `AllowInternetOutBound`(65001, 인터넷으로 나가는 것 허용), `DenyAllOutBound`(65500, 나머지 모두 거부)
- **그래서 인터넷에서 들어오는 트래픽은 `DenyAllInbound`에 걸린다.** 「인터넷 인바운드 거부」라는 이름의 규칙이 따로 있는 것은 아니다 — 위 표에서 읽는다. 기본 규칙에는 가장 낮은 우선순위(가장 큰 번호)가 붙어 고객이 만든 규칙이 먼저 처리된다 — 표 「Priority」
- 기본 규칙은 지울 수 없고, 더 높은 우선순위(더 작은 번호)의 규칙으로 덮어쓴다 — 「Default security rules」 끝
- 서비스 태그와 애플리케이션 보안 그룹의 정의도 이 문서에 짧게 있다. 강화된 보안 규칙(augmented)·보안 관리 규칙·흐름 시간 제한·포트 25 규칙은 **쓰지 않는다**
- 한국어 표기: 네트워크 보안 그룹, 보안 규칙, 기본 보안 규칙(이 phase의 글은 「기본 규칙」으로 줄인다), 우선 순위(이 문서. 앱 글은 띄지 않고 「우선순위」 — 표기 정리), 원본 또는 대상, 프로토콜, 방향, 포트 범위, 작업, 인바운드, 아웃바운드, 서비스 태그, 애플리케이션 보안 그룹

쓰인 곳(phase 103 step 11): `azure-network-protection.network-security-groups`, `azure-network-protection.security-rules`, `NsgRuleOrderDiagram`, D61

## (phase 103) Azure Virtual Network — How network security groups filter network traffic
https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works

확인한 날 2026-11-01. 「Last updated on」 2025-07-29. 사본: `docs-virtual-network-network-security-group-how-it-works.md`와 `ko-` 판.

- **연결할 수 있는 곳**은 서브넷과 VM의 네트워크 인터페이스다. 같은 NSG를 서브넷과 네트워크 인터페이스 여럿에 연결할 수 있고, 그 수에 이 문서가 정한 제한은 없다 — 둘째 문단
- **가상 네트워크 자체에 연결하지 못한다고 말하는 문장은 받은 문서 어디에도 없다.** 대상을 서브넷과 네트워크 인터페이스 둘로 드는 말(이 문서, 「Plan virtual networks」 「Traffic filtering」, 가상 네트워크 FAQ)과, 서브넷에 연결할 때 가상 네트워크를 먼저 찾은 뒤 그 안의 서브넷을 고르는 절차(「Create, change, or delete a network security group」)로 세운다. 그래서 본문은 「서브넷이나 네트워크 인터페이스에 연결한다」로 쓴다(D63)
- 서브넷에 연결하면 그 서브넷의 모든 리소스에 같은 결과가 적용된다 — 「Inbound traffic」의 VM2. 네트워크 인터페이스에 연결하면 그 인터페이스가 붙은 VM에 걸린다 — 같은 절의 VM3
- **들어오는 트래픽**은 서브넷의 NSG를 먼저, 그다음 네트워크 인터페이스의 NSG를 본다. 둘 다 연결된 VM으로 들어오려면 **둘 다** 허용해야 하고, 서브넷 쪽에서 막히면 뒤쪽은 보지 않는다 — 「Inbound traffic」의 VM1. **나가는 트래픽**은 거꾸로 네트워크 인터페이스 쪽이 먼저다 — 「Outbound traffic」
- 같은 서브넷 안의 VM끼리도 NSG 규칙의 영향을 받는다. 기본 규칙이 허용하므로 평소에는 통신하지만, 서브넷에 연결한 NSG에 모두 거부하는 규칙을 넣으면 막힌다 — 「Intra-subnet traffic」
- 공식 문서는 서브넷과 그 네트워크 인터페이스에 NSG를 함께 연결하지 말고 한쪽만 쓰라고 권한다. 규칙이 부딪혀 원인을 찾기 어렵기 때문이다 — 「Intra-subnet traffic」 끝의 Tip. **그래서 도식은 서브넷 NSG와 네트워크 인터페이스 NSG를 서로 다른 VM에 그린다**
- NSG가 어디에도 없는 VM의 동작은 **쓰지 않는다** — 이 문서의 VM4는 표준 공용 IP 주소를 가진 VM의 이야기이고, 들어오는 쪽(막힘)과 나가는 쪽(통과)이 갈려 한 줄로 쓰면 틀리기 쉽다
- 한국어 표기: 네트워크 보안 그룹, 서브넷, 네트워크 인터페이스, 인바운드 트래픽, 아웃바운드 트래픽

쓰인 곳(phase 103 step 11): `azure-network-protection.network-security-groups`, `azure-network-protection.security-rules`, `NsgAssociationDiagram`, D63

## (phase 103) Azure Virtual Network — Create, change, or delete a network security group
https://learn.microsoft.com/en-us/azure/virtual-network/manage-network-security-group

확인한 날 2026-11-01. 「Last updated on」 2025-07-26. 사본: `docs-virtual-network-manage-network-security-group.md`와 `ko-` 판.

- NSG를 서브넷에 연결할 때 포털에서 가상 네트워크를 고른 뒤 그 안의 서브넷을 고른다. 대상을 정하는 마지막 칸은 서브넷이다 — 「Associate or dissociate a network security group to or from a subnet」
- 한국어 표기: 네트워크 보안 그룹, 연결(associate)

쓰인 곳(phase 103 step 11): `azure-network-protection.network-security-groups`, D63

## (phase 103) Azure Virtual Network — Diagnose a virtual machine network traffic filter problem
https://learn.microsoft.com/en-us/azure/virtual-network/diagnose-network-traffic-filter-problem

확인한 날 2026-11-01. 「Last updated on」 2026-10-08. 사본: `docs-virtual-network-diagnose-network-traffic-filter-problem.md`와 `ko-` 판.

- **서브넷 하나와 네트워크 인터페이스 하나에 연결할 수 있는 NSG는 0개나 1개다.** 그 NSG는 서로 같아도 달라도 된다 — 본문의 VM 네트워크 인터페이스 설명. 「Plan virtual networks」 「Subnets」도 서브넷을 두고 같은 수를 말한다

쓰인 곳(phase 103 step 11): `azure-network-protection.network-security-groups`, `NsgAssociationDiagram`, D63

## (phase 103) Azure Virtual Network — Create, change, or delete a network interface (한 줄 풀이만)
https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-network-interface

확인한 날 2026-11-01. 「Last updated on」 2025-07-28. 사본: `docs-virtual-network-network-interface.md`와 `ko-` 판.

- 네트워크 인터페이스(NIC)는 VM이 인터넷·Azure·온-프레미스의 리소스와 통신하게 하는 것이다. **그래서 「VM이 네트워크에 연결되는 접속 부품」으로 푼다** — 첫 문단

쓰인 곳(phase 103 step 11): `azure-network-protection.network-security-groups`

## (phase 103) Azure Virtual Network — Azure service tags overview
https://learn.microsoft.com/en-us/azure/virtual-network/service-tags-overview

확인한 날 2026-11-01. 「Last updated on」 2026-09-16. 사본: `docs-virtual-network-service-tags-overview.md`와 `ko-` 판.

- 서비스 태그는 어떤 Azure 서비스가 쓰는 IP 주소 범위 묶음을 이름 하나로 가리키는 것이다. 주소 범위가 바뀌면 Microsoft가 태그를 고치므로 고객이 규칙을 고치지 않아도 된다 — 첫 문단
- 보안 규칙의 원본·대상 칸에 서비스 태그 이름을 적는다. Azure Firewall 규칙에도 쓴다 — 「How service tags work」와 첫 부분
- 기본 규칙 표의 `VirtualNetwork`·`AzureLoadBalancer`·`Internet`도 IP 주소가 아니라 서비스 태그다 — NSG 개요의 「Default security rules」
- 태그 목록은 **쓰지 않는다**
- 한국어 표기: 서비스 태그

쓰인 곳(phase 103 step 11): `azure-network-protection.security-rules`, D61

## (phase 103) Azure Virtual Network — Application security groups
https://learn.microsoft.com/en-us/azure/virtual-network/application-security-groups

확인한 날 2026-11-01. 「Last updated on」 2025-07-25. 사본: `docs-virtual-network-application-security-groups.md`와 `ko-` 판.

- 애플리케이션 보안 그룹은 VM(의 네트워크 인터페이스)을 앱의 역할에 따라 묶는 이름표이고, 규칙의 원본·대상에 IP 주소 대신 그 묶음을 적는다 — 첫 문단
- 예시 규칙에서 인터넷에서 웹 서버 묶음의 TCP 포트 80으로 들어오는 것을 우선순위 100으로 허용한다. 그런 규칙이 없는 묶음은 `DenyAllInbound` 때문에 인터넷에서 들어오는 트래픽을 받지 못한다 — 「Allow-HTTP-Inbound-Internet」. 데이터베이스 묶음에는 허용 규칙(110)과 모두 거부 규칙(120)을 함께 두어 작은 번호가 먼저 처리되는 것을 이용한다 — 「Allow-Database-BusinessLogic」. **`NsgRuleOrderDiagram`의 「우선순위 100의 허용과 기본 거부」는 이 예와 같은 짜임이다**
- 예시 이름(`AsgWeb` 등)은 **쓰지 않는다**
- 한국어 표기: 애플리케이션 보안 그룹

쓰인 곳(phase 103 step 11): `azure-network-protection.security-rules`, `NsgRuleOrderDiagram`, D61

## (phase 103) Learn 「Fundamentals of computer networking」 — Network protocols (한 줄 풀이만)
https://learn.microsoft.com/en-us/training/modules/network-fundamentals/4-network-protocols

확인한 날 2026-11-01. 쪽에 날짜 표시 없음. 사본: `learn-network-fundamentals-4-network-protocols.md`와 `ko-` 판. 이 주제의 낱말을 푸는 근거로만 쓴다.

- 프로토콜은 네트워크 장치끼리 어떻게 통신할지 정한 조건과 규칙이다 — 「Network protocols」의 첫 문장
- 포트는 들어오는 메시지를 컴퓨터 안의 어느 프로그램에 줄지 가르는 번호이고, 0~65535 범위다. 서비스마다 자기 번호가 있다 — 「Ports」
- 잘 알려진 포트 번호 표에서 웹의 HTTP는 80이다 — 「Well-known port numbers」. **예시 포트로 쓴다(guide 「예시 값」)**
- HTTPS는 HTTP에 TLS·SSL 암호화를 더한 것이다 — 「Network security protocols」. **암호화가 필요할 때 쓰는 것의 근거 둘 가운데 하나다**(다른 하나는 VPN Gateway 개요)
- `트래픽`을 따로 정의한 문장은 찾지 못했다. 공식 문서는 network traffic을 설명 없이 쓴다. **앞 주제의 글처럼 「네트워크로 오가는 데이터」로 푼다.** 사실 주장이 아니라 낱말 풀이다
- 한국어 표기: 프로토콜, 포트, 포트 번호

쓰인 곳(phase 103 step 11): `azure-network-protection.network-security-groups`, `azure-network-protection.security-rules`, `NsgRuleOrderDiagram`
쓰인 곳(phase 103 step 12): `azure-network-protection.azure-firewall`, D64

## (phase 103) Azure Firewall — What is Azure Firewall?
https://learn.microsoft.com/en-us/azure/firewall/overview

확인한 날 2026-11-01. 「Last updated on」 2026-10-09. 사본: `docs-firewall-overview.md`와 `ko-` 판.

- Azure Firewall은 Azure의 클라우드 워크로드를 지키는 네트워크 방화벽 서비스이고, 상태 저장 방화벽을 서비스로 받는 것이며 고가용성이 들어 있다 — 첫 문단. 「최상위」·「지능형」은 꾸밈말이라 옮기지 않는다
- 종류(SKU)는 Basic·Standard·Premium 셋이다 — 첫 부분. Basic은 위협 인텔리전스를 경고로만 쓰고 실행 규모가 고정이다. Standard는 네트워크 계층부터 앱 계층까지 거르며 알려진 악성 IP 주소·도메인의 트래픽을 알리고 막는다 — 「Azure Firewall Basic」·「Azure Firewall Standard」. **이름까지만 쓴다.** Premium의 세부, 처리량 수치는 쓰지 않는다
- **이 문서 첫 문단의 「무제한 클라우드 확장」을 그대로 쓰지 않는다.** 같은 문서가 Basic의 규모를 고정이라 하고 기능 문서가 종류마다 상한을 둔다(`Azure Firewall features by SKU`). 「트래픽이 늘면 저절로 규모가 커진다(종류마다 상한이 있다)」까지로 쓴다. 수치는 쓰지 않는다
- Azure Firewall Manager는 여러 구독의 Azure Firewall을 한곳에서 관리하는 자리이고, 방화벽 정책으로 같은 규칙을 여러 방화벽에 적용한다 — 「Azure Firewall Manager」
- Azure Firewall·Azure DDoS Protection·Azure Web Application Firewall은 Azure의 네트워크 보안 범주로 함께 묶이고, 서비스마다 하는 일이 다르다 — 첫 부분의 메모
- 한국어 표기: 제품 이름 Azure Firewall(옮기지 않는다), 상태 저장(`features` 한국어판. 이 문서 한국어판은 「상태 유지형」 — 표기 정리), 고가용성, 워크로드, 방화벽 정책, Basic·Standard·Premium(이 문서 한국어판은 기본·표준·프리미엄 — 표기 정리)

쓰인 곳(phase 103 step 12): `azure-network-protection.azure-firewall`, `FirewallHubDiagram`

## (phase 103) Azure Firewall — Azure Firewall features by SKU
https://learn.microsoft.com/en-us/azure/firewall/features

확인한 날 2026-11-01. 「Last updated on」 2026-10-14. 사본: `docs-firewall-features.md`와 `ko-` 판.

- 고가용성이 들어 있어 부하 분산 장치를 더하거나 구성할 것이 없다 — 「Key Basic features」·「Built-in high availability and Availability Zones」
- 네트워크 규칙: 원본·대상 IP 주소, 포트, 프로토콜로 허용하거나 거부한다 — 「Network traffic filtering rules」
- 애플리케이션 규칙: 나가는 HTTP·HTTPS(또는 Azure SQL) 트래픽을 정해 둔 도메인 이름 목록으로 좁힌다 — 「Application FQDN filtering rules」. FQDN이라는 말은 **쓰지 않고** 「도메인 이름」으로 쓴다
- **NAT**: 인터넷에서 방화벽의 공용 IP 주소로 들어온 트래픽의 주소를 가상 네트워크 안의 개인 IP 주소로 바꿔 넘긴다(DNAT). 나가는 트래픽은 출발지를 방화벽의 공용 IP 주소로 바꾼다(SNAT) — 「Inbound DNAT support」·「Outbound SNAT support」. **그래서 NAT를 「주소를 다른 주소로 바꿔 넘기는 일」로 푼다.** NO.31의 답(NAT 규칙)은 맞다
- 위협 인텔리전스: 알려진 악성 IP 주소·도메인과 오가는 트래픽을 Basic은 경고만 하고 Standard·Premium은 경고하거나 막는다 — 비교 표
- 상태 저장: 연결의 종류마다 정상 패킷을 구별한다 — 「Network traffic filtering rules」. 비교 표의 첫 줄이 상태 저장 방화벽이고 셋 다 해당한다. 상태 저장의 뜻 자체는 NSG 개요의 설명(응답을 따로 허용하지 않아도 된다)으로 푼다
- 규모: 세 종류 모두 트래픽이 늘면 저절로 커지되 종류마다 상한이 있다 — 비교 표의 「Cloud scalability」. **수치는 쓰지 않는다**(guide 금지)
- Firewall Manager로 중앙 관리하는 것은 세 종류 모두 된다 — 비교 표의 「Central management via Firewall Manager」
- 한국어 표기: 상태 저장 방화벽, 기본 제공 고가용성, 네트워크 필터링 규칙, 위협 인텔리전스, 자동 크기 조정

쓰인 곳(phase 103 step 12): `azure-network-protection.azure-firewall`, G40

## (phase 103) Azure Firewall — Configure Azure Firewall rules
https://learn.microsoft.com/en-us/azure/firewall/rule-processing

확인한 날 2026-11-01. 「Last updated on」 2026-04-02. 사본: `docs-firewall-rule-processing.md`와 `ko-` 판.

- 규칙 종류는 **NAT 규칙·네트워크 규칙·애플리케이션 규칙** 셋이다. **아무 규칙도 없으면 모든 트래픽을 거부하고**, 허용하는 규칙을 구성해야 지나간다. 규칙에 맞으면 거기서 처리를 멈춘다 — 첫 문단
- 처리 순서는 종류끼리는 언제나 DNAT 규칙 → 네트워크 규칙 → 애플리케이션 규칙이다 — 「Rule processing by using Firewall Policy」의 요약. **쓰지 않아도 된다** — 규칙 컬렉션 그룹과 우선순위 세부는 쓰지 않는다
- NSG와의 차이로 쓸 수 있는 것: NSG는 기본 규칙이 가상 네트워크 안을 허용하지만, Azure Firewall은 허용 규칙이 없으면 모두 거부한다(이 문서 첫 문단 + NSG 개요의 기본 규칙)
- 한국어 표기: NAT 규칙, 네트워크 규칙, 애플리케이션 규칙(한국어판 그대로), 방화벽 정책

쓰인 곳(phase 103 step 12): `azure-network-protection.azure-firewall`

## (phase 103) Azure Firewall — Azure Firewall FAQ
https://learn.microsoft.com/en-us/azure/firewall/firewall-faq

확인한 날 2026-11-01. 「Last updated on」 2026-10-14. 사본: `docs-firewall-firewall-faq.md`와 `ko-` 판.

- 구독과 가상 네트워크에 걸쳐 앱과 네트워크 연결에 대한 정책을 **한곳에서 만들고 적용하고 기록한다** — 「What is Azure Firewall?」. **「중앙」은 이 말로 쓴다**
- **NSG와의 차이**: 둘은 함께 쓰는 관계다. NSG는 구독마다 가상 네트워크 안에 흩어져 놓이며 네트워크 계층에서 거르고, Azure Firewall은 구독과 가상 네트워크를 가로질러 한곳에서 네트워크 수준과 앱 수준으로 지킨다 — 「What is the difference between Network Security Groups (NSGs) and Azure Firewall?」
- 흔한 배치는 중앙 가상 네트워크에 방화벽을 두고 다른 가상 네트워크를 그곳에 피어링한 뒤, 그들의 기본 경로가 방화벽을 가리키게 하는 허브-스포크다. 가상 네트워크마다 방화벽을 두지 않아도 된다. 어떤 가상 네트워크에도 배포할 수는 있다 — 「What is the typical deployment model for Azure Firewall?」. **`FirewallHubDiagram`의 근거다.** 경로·허브-스포크 설계 방법과 이름은 **쓰지 않고** 「피어링으로 이어 트래픽이 방화벽을 지나게 한다」까지만 쓴다
- **그래서 「방화벽 하나를 두면 저절로 모든 가상 네트워크가 보호된다」로 쓰지 않는다.** 트래픽이 방화벽을 지나도록 이어 두어야 한다. NO.127·197·432의 답(Azure Firewall)은 맞고 이 조건은 덤프에 없다
- **「NSG 하나로는 여러 가상 네트워크를 걸 수 없다」로 쓰지 않는다.** 같은 NSG를 서브넷 여럿에 연결할 수 있다(`How network security groups filter network traffic`). 경계는 「구독마다 흩어져 놓이는 규칙 / 구독과 가상 네트워크를 가로질러 한곳에서」다
- 피어링한 가상 네트워크들 사이의 트래픽도 가운데 가상 네트워크의 Azure Firewall을 지나게 해 거를 수 있다. 각 서브넷에서 방화벽으로 가도록 경로를 두어야 한다 — 「Can Azure Firewall in a hub virtual network forward and filter network traffic between multiple spoke virtual networks?」. **`FirewallHubDiagram`의 「가상 네트워크 사이」 장면의 근거다.** 경로 설정 방법은 쓰지 않는다 (phase 103 step 12)
- 웹 앱 쪽의 차이: Application Gateway WAF는 웹 앱으로 들어오는 흔한 공격을 막고, Azure Firewall은 HTTP·HTTPS 밖의 프로토콜로 들어오는 것과 나가는 트래픽을 지킨다 — 「What is the difference between Application Gateway WAF and Azure Firewall?」(WAF는 쓰지 않는다 — 금지 범위)
- 한국어 표기: NSG(네트워크 보안 그룹), 심층 방어(이 phase에서는 쓰지 않는다)

쓰인 곳(phase 103 step 12): `azure-network-protection.azure-firewall`, `FirewallHubDiagram`, G40

## (phase 103) Azure Firewall Manager — What is Azure Firewall Manager?
https://learn.microsoft.com/en-us/azure/firewall-manager/overview

확인한 날 2026-11-01. 「Last updated on」 2025-01-27. 사본: `docs-firewall-manager-overview.md`와 `ko-` 판.

- Azure Firewall Manager는 여러 지역과 구독에 걸친 Azure Firewall 인스턴스를 한곳에서 배포하고 구성하는 보안 관리 서비스다. 조직 전체 규칙을 전역 방화벽 정책으로 두고 팀마다 지역 정책을 더할 수 있다 — 「Central Azure Firewall deployment and configuration」·「Hierarchical policies」
- **이름과 한 줄 풀이만 쓴다.** 보안 가상 허브, 허브 가상 네트워크, 파트너 공급자는 **쓰지 않는다**
- 한국어 표기: Azure Firewall Manager(옮기지 않는다), 방화벽 정책

쓰인 곳(phase 103 step 12): `azure-network-protection.azure-firewall`

## (phase 103) Azure Firewall — Azure Firewall Premium features (암호화의 경계만)
https://learn.microsoft.com/en-us/azure/firewall/premium-features

확인한 날 2026-11-01. 「Last updated on」 2026-10-09. 사본: `docs-firewall-premium-features.md`와 `ko-` 판.

- Premium의 TLS 검사는 **이미 암호화된** 나가는 연결을 풀어 살펴본 뒤 다시 암호화해 보낸다. 검사하지 않으면 방화벽은 TLS 터널 안의 내용을 보지 못한다 — 「TLS inspection」
- **그래서 「Azure Firewall에는 암호화와 관련된 기능이 전혀 없다」로 쓰지 않는다**(D64). 암호화되지 않은 트래픽을 대신 암호화하는 기능으로 든 곳은 받은 문서에 없다. TLS 검사 자체는 이 주제에 **쓰지 않는다**

쓰인 곳(phase 103 step 12): D64

## (phase 103) Azure DDoS Protection — About Azure DDoS Protection tier comparison
https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-protection-sku-comparison

확인한 날 2026-11-01. 「Last updated on」 2026-03-17. 사본: `docs-ddos-protection-ddos-protection-sku-comparison.md`와 `ko-` 판.

- 고르는 **계층은 DDoS IP Protection과 DDoS Network Protection 둘**이다 — 「Tiers」
- 두 계층 모두 늘 켜진 감시, 자동 완화, 지표와 경고, **완화 보고서**, 흐름 로그를 준다. **DDoS 신속 대응 지원, 비용 보호, WAF 할인은 Network Protection에만 있다** — 같은 표
- 표 아래 메모: 추가 비용 없이 **DDoS 인프라 보호**가 공용 IPv4·IPv6 주소를 쓰는 모든 Azure 서비스를 지킨다. 구성이 필요 없다 — 「Tiers」 끝의 메모
- Basic이라는 말은 이 표에 공용 IP 주소의 계층(Public IP Basic tier)으로만 나온다. DDoS Protection 자체의 종류가 아니다 — 같은 표. **옛 이름과 헷갈리지 않게 쓰지 않는다**
- 제한(NAT 게이트웨이의 공용 IP 주소 등)과 가격 기준은 **쓰지 않는다**
- 한국어 표기: 아래 「한국어 표기 정리」

쓰인 곳(phase 103 step 12): `azure-network-protection.ddos-protection`, D62, G39

## (phase 103) Azure DDoS Protection — Types of attacks Azure DDoS Protection mitigates
https://learn.microsoft.com/en-us/azure/ddos-protection/types-of-attacks

확인한 날 2026-11-01. 「Last updated on」 2026-08-01. 사본: `docs-ddos-protection-types-of-attacks.md`와 `ko-` 판.

- DDoS Protection이 완화하는 것은 네트워크 쪽 공격이다 — 많은 양을 퍼붓는 공격과 프로토콜의 약점을 노린 공격. 대량 공격은 Azure의 네트워크 규모로 받아 걸러 내고, 프로토콜 공격은 악성 트래픽과 정상 트래픽을 가려 악성 쪽을 막는다 — 첫 부분과 앞의 두 항목
- **웹 앱 계층의 공격(SQL 주입, 교차 사이트 스크립팅, HTTP 프로토콜 위반 등)은 웹 애플리케이션 방화벽을 함께 써야 한다** — 첫 문장과 셋째 항목. **「DDoS Protection이 하지 않는 일」의 근거다.** 웹 애플리케이션 방화벽은 이 한 줄만 쓴다. 계층 번호(3·4·7)는 쓰지 않는다(guide 「배경」) — 「네트워크 쪽」·「웹 앱 쪽」으로 쓴다
- 공격 이름 표는 **쓰지 않는다**
- 한국어 표기: 웹 애플리케이션 방화벽(WAF), SQL 주입

쓰인 곳(phase 103 step 12): `azure-network-protection.ddos-protection`, `DdosProtectionDiagram`, D62

## (phase 103) Azure DDoS Protection — Azure DDoS Protection FAQ
https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-faq

확인한 날 2026-11-01. 「Last updated on」 2026-04-02. 사본: `docs-ddos-protection-ddos-faq.md`와 `ko-` 판.

- **무엇을 지키는가**: 계층을 켜서 지키는 대상은 가상 네트워크(ARM 기반)의 공용 IP 주소이고, VM·부하 분산 장치·Azure Firewall·VPN 게이트웨이 등에 붙은 공용 IP 주소가 든다 — 「What are the supported protected resource types?」. 스토리지나 App Service처럼 여러 고객이 함께 쓰는 PaaS의 공용 IP 주소는 대상이 아니다 — 「Can I protect my PaaS resources using DDoS Protection?」
- 기본 인프라 보호는 원격 분석도 경고도 주지 않고, 그 문턱이 대부분의 앱이 감당할 양보다 높다. 그래서 플랫폼에는 작은 양이어도 앱에는 큰일일 수 있다. 계층을 켜면 그 앱에 맞춘 문턱이 생긴다 — 「Are services unsafe in Azure without the service?」
- **특정 IP 주소를 허용·차단 목록에 넣는 설정은 없다** — 「Can I allowlist/blocklist specific IP addresses?」. **그래서 NO.163은 맞다.** 트래픽을 열거나 막는 규칙은 NSG의 일이다
- 웹 앱 쪽은 WAF와 함께 쓴다 — 「What about protection at the service layer (layer 7)?」
- 한국어 표기: 공용 IP 주소

쓰인 곳(phase 103 step 12): `azure-network-protection.ddos-protection`, `DdosProtectionDiagram`, D62, G39

## (phase 103) Azure networking — DDoS protection for Azure networks
https://learn.microsoft.com/en-us/azure/networking/design-guide/ddos

확인한 날 2026-11-01. 「Last updated on」 2026-08-19. 사본: `docs-networking-design-guide-ddos.md`와 `ko-` 판.

- 세 가지를 나란히 든다 — DDoS 인프라 보호(모든 Azure 고객에게 저절로, 추가 비용·구성 없음), DDoS Network Protection(계획 하나로 구독에 걸친 가상 네트워크의 공용 IP 주소), DDoS IP Protection(공용 IP 주소마다) — 「Azure services and features」의 표. **현행 종류는 이 표대로 쓴다.** 가격 칸의 수와 SLA는 **쓰지 않는다**
- 계층을 켜면 앱의 평소 트래픽을 배워 문턱을 맞추고, 정상 트래픽이 몰리는 때를 공격으로 잘못 보는 일을 줄인다. UDP 쪽 정책은 대량 공격을 걸러 내면서 정상 앱 트래픽을 통과시킨다 — 「What each tier protects」. **「공격은 걸러지고 정상 트래픽은 통과한다」의 근거다**
- 이 문서는 첫 절에서 앱 계층 공격까지 방어한다고도 적는다. 개요와 공격 유형 문서가 그쪽은 WAF의 몫이라 하므로 **앱 계층까지 막는다고 쓰지 않는다**
- 한국어 표기: DDoS 인프라 보호, DDoS 네트워크 보호, DDoS IP 보호

쓰인 곳(phase 103 step 12): `azure-network-protection.ddos-protection`, `DdosProtectionDiagram`, D62, G39

## (phase 103) Azure Traffic Manager — What is Azure Traffic Manager? (덤프 대조만)
https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-overview

확인한 날 2026-11-01. 「Last updated on」 2026-10-19. 사본: `docs-traffic-manager-overview.md`와 `ko-` 판.

- Traffic Manager는 DNS로 요청을 알맞은 서비스 끝점에 보내는 부하 분산 서비스다 — 첫 문단. VM 포트를 여는 일과 관계가 없다. **그래서 NO.7(아니요)은 맞다.** 개념 글에는 쓰지 않는다

쓰인 곳(phase 103 step 12): 없음(덤프 대조 기록)

## (phase 103) Windows Server — netsh ipsec (덤프 대조만)
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netsh-ipsec

확인한 날 2026-11-01. 「Last updated on」 2025-08-04. 사본: `docs-windows-server-netsh-ipsec.md`(영문만).

- 적용 대상에 Windows Server 2016이 있고, IPsec은 IP 패킷을 암호화한다 — 첫 부분. **NO.284·483의 셋째 칸을 대조하는 데만 쓴다.** 설정법과 IPsec은 개념 글에 쓰지 않는다

쓰인 곳(phase 103 step 12): D64

## (phase 103) Azure security — Azure network security overview (범주만)
https://learn.microsoft.com/en-us/azure/security/fundamentals/network-overview

확인한 날 2026-11-01. 「Last updated on」 2026-07-20. 사본: `docs-security-network-overview.md`와 `ko-` 판.

- 네트워크 보안은 네트워크 트래픽을 통제해 무단 접근과 공격에서 리소스를 지키는 일이라고 적는다 — 첫 문장. NSG는 IP 주소와 TCP·UDP 프로토콜을 기준으로 상태 저장 패킷 필터링을 한다 — 「Network security groups」
- **세 서비스를 하나로 묶는 말로 쓴다.** 심층 방어, Defender for Cloud, Bastion, WAF의 세부는 **쓰지 않는다**

쓰인 곳(phase 103 step 11): `azure-network-protection.network-security-groups`
쓰인 곳(phase 103 step 12): D64

## (phase 103) 한국어 표기 정리 — `azure-network-protection`

위 항목들의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다(phase 103 step 10). Microsoft 한국어 문서의 표기를 따르고(guide 「배경」), 한국어판 사이에 표기가 갈리면 근거를 적는다.

| 개념·항목 | 쓸 이름(`name`) | 근거 |
|---|---|---|
| `network-security-groups` | **네트워크 보안 그룹** | NSG 개요·작동 방식 문서 한국어판. 약어 NSG를 괄호로 함께 세운다 |
| `security-rules` | **보안 규칙** | NSG 개요 한국어판 절 제목 「보안 규칙」 |
| `azure-firewall` | **Azure Firewall** | 개요 한국어판(옮기지 않는다) |
| `ddos-protection` | **Azure DDoS Protection** | 개요 한국어판(옮기지 않는다). DDoS는 phase 101이 정한 **DDoS(분산 서비스 거부)** — 이 문서 한국어판의 「배포된 서비스 거부」는 오역이라 쓰지 않는다 |

규칙 속성과 기본 규칙:

- **이름, 우선순위, 원본·대상, 프로토콜, 방향, 포트 범위, 작업** — NSG 개요 한국어판의 표. 「우선 순위」는 한국어 맞춤법과 앞 phase의 글에 맞춰 붙여 쓴다. **허용·거부**를 쓴다(작업의 값)
- **인바운드·아웃바운드** — 처음 쓸 때 「들어오는 쪽」·「나가는 쪽」으로 푼다
- **기본 규칙**(한국어판 「기본 보안 규칙」을 줄인다). 규칙 이름 `AllowVNetInBound`·`DenyAllInbound` 등은 옮기지 않고 코드 표기로 쓴다. 문서의 철자는 나가는 쪽이 `AllowVnetOutBound`이고 들어오는 쪽이 `AllowVNetInBound`다 — 그대로 옮긴다
- **서비스 태그, 애플리케이션 보안 그룹** — 한국어판 그대로

Azure Firewall:

- **NAT 규칙, 네트워크 규칙, 애플리케이션 규칙** — 규칙 처리 문서 한국어판. **DNAT 규칙**이라는 이름은 쓰지 않는다
- **상태 저장 / 상태 유지형** — 개요 한국어판은 「상태 유지형」, 기능·FAQ 한국어판과 NSG 쪽은 **「상태 저장」**이다. 「상태 저장」으로 쓴다
- **SKU 이름** — 개요 한국어판의 기본·표준·프리미엄은 다른 뜻의 「기본」(기본 규칙, 기본 인프라 보호)과 헷갈린다. 영문 이름 **Basic·Standard·Premium**을 쓴다
- **위협 인텔리전스, 방화벽 정책, 고가용성, 워크로드** — 기능·Firewall Manager 문서 한국어판

Azure DDoS Protection:

- **DDoS 인프라 보호**(Azure DDoS infrastructure protection) — 설계 가이드 한국어판
- **DDoS 네트워크 보호**(DDoS Network Protection), **DDoS IP 보호**(DDoS IP Protection) — 개요 한국어판의 절 제목. 비교 표 한국어판은 영문 이름을 그대로 둔다. 목록 항목으로 쓰면 ADR-046의 꼴(`**DDoS 네트워크 보호**(DDoS Network Protection)는 …`)이 맞다
- **계층** — 두 유료 종류를 묶는 말(개요 한국어판). 인프라 보호까지 셋을 말할 때는 「종류」로 쓴다
- **웹 애플리케이션 방화벽(WAF)** — 공격 유형 문서 한국어판. 한 줄에만 쓴다
- **공용 IP 주소, 개인 IP 주소, 부하 분산 장치, 네트워크 인터페이스, 서브넷** — `azure-compute`·`azure-virtual-networking` 표기를 잇는다

**쓰지 않는 이름**: DDoS Protection Basic·Standard(옛 이름 — D62·G39), 강화된 보안 규칙, 허브-스포크, FQDN, TLS 검사, 심층 방어, Defender for Cloud, Azure Bastion.

## (phase 104) Learn 「Describe Azure storage services」 — 2 Describe Azure storage accounts
https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/2-accounts

확인한 날 2026-11-01. 쪽에 날짜 표시 없음. 사본: `learn-describe-azure-storage-services-2-accounts.md`와 `ko-` 판.

- 계정 유형이 쓸 수 있는 서비스와 중복성 옵션을 정하고, 쓰임에도 영향을 준다. 계정을 만들 때 유형부터 고른다 — 첫 문단
- 중복성 옵션은 여섯이다 — LRS, GRS, RA-GRS, ZRS, GZRS, RA-GZRS — 같은 곳
- 유형 넷의 표: 표준 범용 v2(네 서비스, 여섯 옵션, 대부분의 경우에 권장), 프리미엄 블록 Blob(LRS·ZRS), 프리미엄 파일 공유(LRS·ZRS), 프리미엄 페이지 Blob(LRS) — 유형 표. 페이지 Blob의 중복성이 제품 문서 하나와 갈리는 것은 위 「Storage account overview」 항목에 적었다
- NFS 파일 공유가 필요하면 프리미엄 파일 공유를 쓴다 — 표준 범용 v2 행의 쓰임 칸
- 계정 이름과 서비스 엔드포인트를 합친 것이 계정의 엔드포인트다. Blob·Files·Queue·Table의 주소 꼴 — 「Storage account endpoints」
- **쓰지 않는 것**: Data Lake Storage 엔드포인트(guide 「배경」)
- 한국어 표기: 표준 범용 v2, 프리미엄 블록 Blob, 프리미엄 파일 공유, 프리미엄 페이지 Blob, 네임스페이스, 엔드포인트

쓰인 곳: `azure-storage.storage-accounts`, `azure-storage.account-types`, `StorageAccountTypesTable`, D67

## (phase 104) Learn 「Describe Azure storage services」 — 3 Describe Azure storage redundancy
https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/3-redundancy

확인한 날 2026-11-01. 쪽에 날짜 표시 없음. 사본: `learn-describe-azure-storage-services-3-redundancy.md`와 `ko-` 판.

- Azure Storage는 하드웨어 고장·중단·지역 재해에서 지키려고 데이터 복사본을 여럿 둔다. 고를 때는 비용과 가용성 사이에서 균형을 잡는다 — 첫 문단
- **주 지역에서 데이터는 언제나 세 번 복제된다.** 주 지역의 옵션은 LRS와 ZRS다 — 「Redundancy in the primary region」
- LRS는 주 지역의 데이터 센터 한 곳 안에 세 번 복제한다. 가장 싸고 서버 랙·드라이브 고장을 막지만, 복제본이 모두 그 데이터 센터에 있어 데이터 센터 규모의 재해로 잃을 수 있다 — 「Locally redundant storage」
- ZRS는 가용성 영역을 지원하는 지역에서 주 지역의 가용성 영역 셋에 동기로 복제한다. 영역 하나를 쓸 수 없어도 읽고 쓸 수 있다 — 「Zone-redundant storage」
- 보조 지역은 주 지역에서 멀리 떨어진 곳이고, 계정을 만들 때 고른 주 지역에 맞춰 Azure가 지역 쌍으로 정한다. 옵션은 GRS와 GZRS다. GRS는 두 지역 모두 LRS, GZRS는 주 지역 ZRS에 보조 지역 LRS다 — 「Redundancy in a secondary region」
- 기본으로 보조 지역의 데이터는 장애 조치 전에는 읽을 수 없고, 주 지역을 쓸 수 없을 때 장애 조치하면 보조 지역이 주 지역이 된다. 보조 지역으로는 비동기로 복제하므로 주 지역을 복구하지 못하면 데이터를 잃을 수 있다 — 같은 곳
- 장애 조치 전에 보조 지역을 읽으려면 RA-GRS나 RA-GZRS를 켠다. 그 데이터는 최신이 아닐 수 있다 — 「Read access to data in the secondary region」
- **복사본 수의 근거**: LRS·ZRS는 위 「세 번」이다(ZRS는 아래 「Disaster recovery」의 「영역마다 하나」도 같은 말). GRS·GZRS의 **여섯은 받은 문서에 낱말로 없고, 주 지역 셋과 보조 지역의 LRS 셋을 더한 값이다.** 덤프 NO.297의 답(6)과 같다
- **쓰지 않는 것**: 내구성의 9 개수, RPO 값, SLA(guide 「배경」)
- 한국어 표기: 로컬 중복 스토리지(LRS), 영역 중복 스토리지(ZRS), 지역 중복 스토리지(GRS), 지역 영역 중복 스토리지(GZRS), 읽기 액세스 지역 중복 스토리지(RA-GRS), 읽기 액세스 지역 영역 중복 스토리지(RA-GZRS), 주 지역, 보조 지역, 지역 쌍, 장애 조치(failover). 이 단원 한국어판의 「기본 지역」·「이차 지역」은 쓰지 않는다

쓰인 곳: `azure-storage.storage-redundancy`, `azure-storage.geo-redundancy`, `LrsZrsDiagram`, `GeoRedundancyDiagram`, `RedundancyOptionsTable`, D70, G43

## (phase 104) Azure Storage — Introduction to Azure Storage
https://learn.microsoft.com/en-us/azure/storage/common/storage-introduction

확인한 날 2026-11-01. 「Last updated on」 2026-08-11. 사본: `docs-storage-common-introduction.md`와 `ko-` 판.

- 서비스 고르는 기준(비교 표): Azure Files는 파일 시스템 API로 공유하는 앱을 옮기거나 온-프레미스 파일 서버를 대신할 때, Blob은 스트리밍·임의 접근이나 어디서나 앱 데이터에 닿아야 할 때, Disk는 붙인 가상 하드 디스크에 데이터를 두고 그 VM 밖에서 닿을 필요가 없을 때, Queue는 앱 구성 요소를 떼어 놓고 비동기 메시지로 통신할 때, Table은 사용자 데이터·주소록·장치 정보 같은 유연한 데이터 집합을 둘 때다 — 「Sample scenarios for Azure Storage services」
- Azure Storage는 데이터를 저장하기 전에 저절로 암호화하고 읽을 때 복호화한다 — 「Encryption at rest」
- 관리 디스크는 가상 하드 디스크이고, 온-프레미스 서버의 물리 디스크를 가상화한 것으로 생각할 수 있다 — 「Disk Storage」. **이 절의 「페이지 Blob으로 저장된다」는 쓰지 않는다**(D57·D72 — 쓰는 쪽이 고르는 것이 아니다)
- 한국어 표기: Azure 관리 디스크, 비동기 메시지

쓰인 곳: `azure-storage.storage-services`, D57, D72

## (phase 104) Azure Blob Storage — Introduction to Azure Blob Storage
https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction

확인한 날 2026-11-01. 「Last updated on」 2026-05-15. 사본: `docs-storage-blobs-introduction.md`와 `ko-` 판.

- Blob Storage는 비정형 데이터를 많이 담도록 만든 객체 저장소다. 비정형 데이터는 정해진 데이터 모델을 따르지 않는 데이터이고, 글자나 이진 데이터가 그 예다 — 첫 문단
- 자원은 세 단계다 — 스토리지 계정, 그 안의 컨테이너, 컨테이너 안의 Blob — 「Blob Storage resources」
- **컨테이너**는 Blob을 묶는 단위이고 파일 시스템의 디렉터리와 비슷하다 — 「Containers」. 앱을 담는 컨테이너(Azure Container Instances 같은)와 같은 낱말이지만 다른 것이라는 점은 본문이 그 자리에서 밝힌다(두 쓰임 모두 공식 문서에 있다)
- Blob의 종류: 블록 Blob은 글자·이진 데이터를 담고 따로 관리할 수 있는 블록으로 이루어진다. 추가 Blob은 뒤에 덧붙이는 일에 맞췄다. 페이지 Blob은 임의 접근 파일을 담고 가상 하드 디스크 파일을 담아 VM의 디스크 구실을 한다 — 「Blobs」
- **Blob도 NFS 3.0이나 BlobFuse로 탑재하는 길이 있다**(첫 문단 뒤와 도구 목록). 그래서 Files와 가르는 말은 「주로 어떻게 쓰는가」이고, **「Blob은 탑재할 수 없다」로 쓰지 않는다**
- 객체 주소에는 계정 이름이 들어가고, 계정 이름과 Blob 엔드포인트를 합친 것이 기본 주소다 — 「Storage accounts」
- **쓰지 않는 것**: Data Lake Storage, 크기 한도, 이름 규칙의 세부(guide 「배경」)
- 한국어 표기: Azure Blob Storage, 비정형 데이터, 컨테이너, 블록 Blob, 추가 Blob, 페이지 Blob, 네임스페이스

쓰인 곳: `azure-storage.blob-storage`, `azure-storage.account-types`, D69

## (phase 104) Azure Blob Storage — Access tiers for blob data
https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview

확인한 날 2026-11-01. 「Last updated on」 2026-06-15. 사본: `docs-storage-blobs-access-tiers.md`와 `ko-` 판.

- 핫·쿨·콜드는 **온라인 계층**이라 바로 읽을 수 있고, 보관은 **오프라인 계층**이다 — 첫 목록·「Online access tiers」
- 표현이 Learn 단원 4와 조금 다르다: 쿨은 자주 읽거나 고치지 않는 데이터, 콜드는 드물게 읽거나 고치지만 **빨리 꺼낼 수 있어야 하는** 데이터, 보관은 드물게 읽고 **몇 시간쯤 기다려도 되는** 데이터다 — 첫 목록. **쿨과 콜드는 낱말보다 최소 보관 기간(30·90일)으로 가른다**
- 쿨·콜드는 핫과 내구성·첫 바이트까지의 시간이 같고 밀리초 단위다. 가용성이 조금 낮다. 보관은 시간 단위다 — 「Online access tiers」·요약 표. 가용성 값은 쓰지 않는다
- **비용의 방향**: 계층이 차가워질수록 GB당 저장 비용은 내려가고, 읽는 비용과 트랜잭션 비용은 올라간다. 핫은 저장이 가장 비싸고 읽기가 가장 싸며, 보관은 저장이 가장 싸고 읽기가 가장 비싸다 — 「Storage capacity costs」·「Data access costs」·「Transaction costs」·첫 목록
- **최소 보관 기간은 금지가 아니라 요금 조건이다.** 쿨 30일·콜드 90일·보관 180일 전에 지우거나 덮어쓰거나 옮기면 남은 날만큼 조기 삭제 요금이 붙는다(쿨에서 21일 만에 지우면 9일치) — 「Online access tiers」·「Archive access tier」. 표는 「권장 최소 보관 기간」이라 부른다. 금액은 쓰지 않는다. 범용 v2 계정 기준이다
- **계정의 기본 액세스 계층**은 새 Blob이 만들어질 온라인 계층을 가리키고 핫·쿨·콜드 가운데 고른다. 보관은 기본값이 될 수 없다. 새 범용 v2 계정은 핫으로 시작하고, 계정을 만들 때나 만든 뒤 바꿀 수 있다 — 「Default account access tier setting」
- 계층을 따로 정하지 않은 Blob은 계정 기본값을 따른다. 기본값을 바꾸면 그런 Blob 모두에 적용되고 그에 따른 요금이 붙는다. 계층을 지정한 Blob은 그대로다 — 같은 절
- Blob 하나의 계층은 올릴 때 정하거나 만든 뒤 바꿀 수 있다 — 「Setting or changing a blob's tier」. 온라인 계층끼리 옮기는 것은 바로 끝나고 보관에서 나오는 것만 오래 걸린다 — 같은 절
- **계층은 블록 Blob에 쓰는 것이다.** 추가 Blob·페이지 Blob에는 정할 수 없고, 프리미엄 블록 Blob 계정의 데이터도 이 계층들로 옮기지 못한다 — 첫 목록 Note·「Blob lifecycle management」
- **보관 계층과 중복성은 서로 걸린다.** 핫·쿨·콜드는 모든 중복성을 지원하지만 보관은 LRS·GRS·RA-GRS 계정에서만 된다(ZRS·GZRS·RA-GZRS는 안 된다) — 「Archive access tier」·요약 표. **「계층과 중복성은 서로 다른 질문이다」라고 쓸 때 이 예외와 어긋나게 쓰지 않는다**
- 이 문서의 첫 목록에는 **스마트 계층**(smart tier — 사용 패턴에 따라 핫·쿨·콜드 사이를 저절로 옮긴다)도 있다. Learn 단원 4와 학습 가이드에 없고 데이터가 머무는 또 하나의 온도도 아니므로 **쓰지 않는다.** 본문은 「핫·쿨·콜드·보관 가운데 고른다」로 쓰고, 「계층은 넷뿐이다」로 단정하지 않는다
- 표준 저장소의 Blob에 핫 계층을 쓸 수 있고 쿨을 계정 수준에 정할 수 있다 — 위 두 절. Azure Files는 이 계층이 아니라 SSD·HDD 미디어 계층을 쓴다(아래 「Plan to deploy Azure Files」)
- **쓰지 않는 것**: 수명 주기 관리, 일시 삭제, 암호화 범위, 작업 이름(Set Blob Tier 등), Storage Actions(guide 「배경」과 범위 밖)
- 한국어 표기: 액세스 계층, 핫·쿨·콜드·보관 계층, 온라인 계층, 오프라인 계층, 기본 액세스 계층, 조기 삭제, 트랜잭션

쓰인 곳: `azure-storage.access-tiers`, `azure-storage.archive-rehydration`, `AccessTierDiagram`, D65, D66, G41

## (phase 104) Azure Blob Storage — Blob rehydration from the archive tier
https://learn.microsoft.com/en-us/azure/storage/blobs/archive-rehydrate-overview

확인한 날 2026-11-01. 「Last updated on」 2026-09-01. 사본: `docs-storage-blobs-archive-rehydration.md`와 `ko-` 판.

- 보관 계층의 Blob은 오프라인이라 읽거나 고칠 수 없고, 데이터를 쓰려면 먼저 핫·쿨·콜드 가운데 하나로 리하이드레이션한다 — 첫 문단
- 방법은 둘이다 — 온라인 계층의 새 Blob으로 복사하거나, 그 Blob의 계층을 온라인 계층으로 바꾼다. 복사하면 원본은 보관 계층에 그대로 남는다 — 첫 문단·「Copy an archived blob to an online tier」
- **리하이드레이션**(rehydrate)이라는 낱말을 문서가 따로 풀지는 않는다. 쓰임대로 「보관 계층에서 오프라인으로 있던 Blob을 온라인 계층으로 되돌려 읽을 수 있게 하는 일」로 푼다. 낱말의 원뜻(말린 것에 물을 다시 넣다)은 **문서에 없다 — 쓰지 않는다**
- 걸리는 시간은 몇 시간이고, 우선순위가 둘이다. 표준(기본값)은 10GB 미만 객체 기준으로 15시간까지 걸릴 수 있고, 높음은 더 빠르지만 비용이 더 든다. 크거나 많으면 더 오래 걸릴 수 있다 — 첫 문단 뒤·「Rehydration priority」. **본문은 「몇 시간, 표준은 15시간까지 걸릴 수 있다」와 「높음은 더 빠르고 비용이 더 든다」까지 쓴다.** 높음의 1시간과 계정당 시간 한도 값은 조건이 많아 쓰지 않는다
- 보관 계층에 두는 쓰임은 장기 백업, 처리한 뒤에도 보존할 원본 데이터, 오래 두고 거의 읽지 않는 규정 준수 데이터다 — 「Access tiers」의 「Archive access tier」
- 보관 계층에 있는 동안에도 메타데이터는 읽을 수 있다 — 같은 곳. **도식에 「아무것도 볼 수 없다」로 그리지 않는다.** 그리는 것은 「데이터를 읽을 수 없다」다
- 문서 어디에도 AzCopy로 언제든 읽는다거나 Azure Backup으로만 읽는다는 말이 없다 — D65
- 한국어 표기: **리하이드레이션**(이 문서 제목 「보관 계층에서 Blob 리하이드레이션」과 절 제목). 같은 한국어판 안의 「재수화」·「재하이드레이션」·「재충전」, Access tiers 한국어판의 「재활성화」, Learn 단원 4 한국어판의 「리하일레이션」은 쓰지 않는다. 표준 우선순위, 높은 우선순위

쓰인 곳: `azure-storage.archive-rehydration`, `ArchiveRehydrationDiagram`, D65

## (phase 104) Azure Files — What is Azure Files?
https://learn.microsoft.com/en-us/azure/storage/files/storage-files-introduction

확인한 날 2026-11-01. 「Last updated on」 2026-10-16. 사본: `docs-storage-files-introduction.md`와 `ko-` 판.

- 클라우드에 있는 완전 관리형 파일 공유이고 SMB·NFS로 닿는다. 클라우드와 온-프레미스의 Windows·Linux·macOS 클라이언트가 동시에 탑재할 수 있고 따로 설치할 소프트웨어가 없다 — 첫 문단
- 프로토콜과 클라이언트: **SMB는 Windows·Linux·macOS, NFS는 Linux** — 첫 표. 「Plan to deploy Azure Files」도 NFS를 Linux만으로 적는다. Learn 단원 4의 「Linux·macOS」는 따르지 않는다
- 온-프레미스 파일 서버를 대신하거나 보완하고, 직접 탑재하거나 Azure File Sync로 Windows 서버에 캐시할 수 있다 — 「Why use Azure Files?」
- 관리할 하드웨어·패치할 운영 체제·바꿀 디스크가 없다 — 「Key benefits」
- 한국어 표기: Azure Files, 파일 공유, 탑재, 클라이언트, 온-프레미스

쓰인 곳: `azure-storage.azure-files`, `FileShareDiagram`, D69

## (phase 104) Azure Files — Plan to deploy Azure Files
https://learn.microsoft.com/en-us/azure/storage/files/storage-files-planning

확인한 날 2026-11-01. 「Last updated on」 2026-08-26. 사본: `docs-storage-files-planning.md`와 `ko-` 판.

- SMB와 NFS는 파일 공유를 탑재하는 표준 파일 시스템 프로토콜이다. 한 파일 공유에 둘을 함께 쓰지 못하지만 한 스토리지 계정에 SMB 공유와 NFS 공유를 함께 둘 수 있다 — 「Available protocols」
- **파일 공유를 만드는 곳이 둘이다.** 클래식 파일 공유는 스토리지 계정 안에 만들고 SMB·NFS와 모든 중복성을 지원한다. 새 `Microsoft.FileShares` 방식은 계정 없이 최상위 리소스로 만들지만 지금은 NFS 공유뿐이다 — 「Management concepts」. **본문은 「SMB 파일 공유를 비롯한 클래식 파일 공유는 스토리지 계정 안에 만든다」처럼 한정하고, 「파일 공유는 언제나 스토리지 계정 안에 있다」로 쓰지 않는다**
- Azure Files의 미디어 계층은 SSD·HDD다. Blob의 핫·쿨·콜드와 다른 낱말이다 — 「Storage tiers」. NO.242의 「프리미엄 저장소의 파일 공유에 쿨 계층」은 그래서 해당하지 않는다(덤프 답 「아니요」가 맞다). **파일 공유의 계층은 본문에 쓰지 않는다**(guide 표)
- 한국어 표기: 클래식 파일 공유, SMB(서버 메시지 블록), NFS(네트워크 파일 시스템), SSD, HDD

쓰인 곳: `azure-storage.access-tiers`(근거 기록), `azure-storage.azure-files`

## (phase 104) Azure Files — Mount SMB Azure file share on Windows
https://learn.microsoft.com/en-us/azure/storage/files/storage-how-to-use-files-windows

확인한 날 2026-11-01. 「Last updated on」 2026-04-09. 사본: `docs-storage-files-windows.md`와 `ko-` 판.

- Windows에서는 파일 공유를 탑재(드라이브 문자나 탑재 지점 경로에 연결)하거나 UNC 경로로 닿는다 — 「Use an Azure file share with Windows」. **「탑재」의 풀이는 이 문장에서 가져온다**
- 포털이나 PowerShell, `net use` 명령으로 드라이브 문자를 골라 탑재할 수 있다 — 「Mount the Azure file share」
- SMB는 TCP 포트 445를 쓰고, 막혀 있으면 VPN이나 ExpressRoute로 연결한다 — 「Ensure port 445 is open」. **본문에는 쓰지 않아도 된다.** 예를 든다면 포트 이야기 없이 드라이브 연결까지만 쓴다
- **현행 문서는 ID 기반 인증을 권하고 스토리지 계정 키만 쓰라고 하지 않는다** — 「Use identity-based authentication」. D71
- 한국어 표기: 탑재, 드라이브 문자, 탑재 지점

쓰인 곳: `azure-storage.azure-files`, D71

## (phase 104) Azure Queue Storage — What is Azure Queue Storage?
https://learn.microsoft.com/en-us/azure/storage/queues/storage-queues-introduction

확인한 날 2026-11-01. 「Last updated on」 2023-11-17. 사본: `docs-storage-queues-introduction.md`와 `ko-` 판.

- 메시지를 많이 쌓아 두는 서비스이고, 인증한 HTTP·HTTPS 호출로 닿는다. 나중에 비동기로 처리할 일감을 쌓아 두는 데 흔히 쓴다 — 첫 문단
- **쓰지 않는 것**: 메시지 크기, 수명(guide 「배경」)
- 한국어 표기: Azure Queue Storage, 큐, 메시지

쓰인 곳: `azure-storage.storage-services`

## (phase 104) Azure Table Storage — What is Azure Table storage?
https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-overview

확인한 날 2026-11-01. 「Last updated on」 2022-11-29. 사본: `docs-storage-tables-overview.md`와 `ko-` 판.

- 구조적이고 비관계형인 데이터(구조적 NoSQL 데이터라고도 한다)를 클라우드에 담는다. 키와 특성으로 저장하고 스키마가 없어 앱의 필요에 맞춰 데이터 모양을 바꾸기 쉽다 — 첫 문단
- 복잡한 조인·외래 키·저장 프로시저가 필요 없는 데이터에 맞는다 — 「What is Table storage」. **`NoSQL`은 「표끼리 잇는 관계형 데이터베이스와 달리, 정해진 틀 없이 키와 특성으로 담는 방식」으로 푼다.** 조인·외래 키라는 낱말은 쓰지 않는다
- 사용자 데이터·주소록·장치 정보 같은 유연한 데이터 집합을 둔다 — 첫 문단 뒤. **「행과 속성」은 guide의 잠정 표현이고 문서 낱말은 엔터티·키/특성이다** — 본문은 「키와 특성」으로 쓴다
- 머리 Tip에 더 새로운 Azure Cosmos DB for Table이 있지만 범위 밖이라 쓰지 않는다
- 한국어 표기: Azure Table Storage, 구조화된 NoSQL 데이터, 키/특성 저장소

쓰인 곳: `azure-storage.storage-services`, G42

## (phase 104) Azure Virtual Machines — Azure managed disks overview
https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview

확인한 날 2026-11-01. 「Last updated on」 2026-08-20. 사본: `docs-virtual-machines-managed-disks-overview.md`와 `ko-` 판.

- 관리 디스크는 Azure가 관리하고 Azure VM과 함께 쓰는 블록 수준 저장 볼륨이다. 온-프레미스 서버의 물리 디스크와 비슷하되 가상화한 것이고, 쓰는 쪽은 디스크 유형과 크기만 정한다 — 첫 문단
- 관리 디스크가 스토리지 계정을 뒤에서 대신 관리한다는 것은 VM 개요(phase 103 항목)가 말하고 D57에 있다
- **쓰지 않는 것**: 디스크 유형 다섯, 수치 한도(guide 「배경」)
- 한국어 표기: Azure 관리 디스크, 블록 수준

쓰인 곳: `azure-storage.storage-services`, D72, `azure-storage.storage-accounts`, `StorageAccountDiagram`

## (phase 104) Azure 클라우드 컴퓨팅 사전 — What is cloud storage?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-cloud-storage/

확인한 날 2026-11-01. 사본: `docs-dictionary-cloud-storage.md`와 `ko-` 판.

- 클라우드 스토리지는 로컬 하드 드라이브 대신 인터넷으로 닿는 원격 서버에 데이터를 두는 방식이다 — 「Cloud storage definition」. **「스토리지」의 풀이 근거다**
- 저장 유형: 객체 스토리지는 메타데이터를 가진 객체 단위로 묶어 사진·동영상·백업 같은 비정형 데이터에 맞고, 파일 스토리지는 폴더와 디렉터리 구조로 두어 공유 파일에 맞으며, **블록 스토리지는 데이터를 정해진 크기의 블록으로 나눠 저장해 빨리 꺼낼 수 있고** 데이터베이스와 성능이 중요한 앱에 맞는다 — 「Types of cloud storage」. **「블록 수준」의 풀이 근거다**
- 한국어 표기: 객체 스토리지, 파일 스토리지, 블록 스토리지

쓰인 곳: `azure-storage.storage-services`

## (phase 104) Azure Storage — Azure Storage redundancy
https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy

확인한 날 2026-11-01. 「Last updated on」 2026-08-11. 사본: `docs-storage-common-redundancy.md`와 `ko-` 판.

- 중복성 설정은 계정에 하나이고 그 계정의 서비스 모두가 함께 쓴다. 요구가 다르면 계정을 나눈다 — 첫 문단 뒤
- LRS는 드라이브·서버·랙 고장을 막지만 데이터 센터 안의 화재·홍수로 복제본을 모두 잃을 수 있다 — 「Locally redundant storage」
- ZRS는 쓰기가 동기로 이루어져, 가용성 영역 셋의 복제본에 다 써야 성공을 돌려준다. 각 영역은 전원·냉각·네트워크가 따로인 별개의 장소다. 지역 전체 재해에는 ZRS만으로 부족할 수 있다 — 「Zone-redundant storage」. 이 문서의 머리는 「셋 이상의 영역」이라 하고 쓰기 절과 Learn 단원 3은 「셋」이다. **「복사본 셋을 영역 셋에」로 쓴다**
- **복제는 백업이 아니다의 첫째 근거**: 복제본은 모두 현재 상태를 담아, 지우고 덮어쓴 것이 모든 복사본에 함께 적용된다. 중복성은 하드웨어 고장을 막을 뿐 데이터를 바꾸는 작업을 막지 못한다 — 「Locally redundant storage」
- 보조 지역: 주 지역에 맞춰 정해지고 바꿀 수 없다. GRS는 주 지역에서 LRS로 동기 복사한 뒤 보조 지역으로 비동기 복사하고, 보조 지역 안에서는 LRS다. GZRS와의 차이는 주 지역에서 복제하는 방식뿐이다 — 「Redundancy in a secondary region」
- 장애 조치 전에는 보조 지역을 읽거나 쓸 수 없고, 장애 조치 중에는 데이터에 닿을 수 없으며, 끝나면 보조 지역이 주 지역이 되어 읽고 쓴다 — 같은 곳·「Read access to data in the secondary region」
- 보조 지역은 쓰기가 보통 주 지역보다 뒤처져 있어 재해 때 일부 데이터를 잃을 수 있다 — 「Plan for data loss」
- 장애 표(무엇이 남는가): 노드 하나가 멈추면 네 옵션 모두 남는다. 데이터 센터 전체가 멈추면 LRS는 안 되고 ZRS·GZRS는 그대로이며 GRS는 **장애 조치를 거치면** 된다. 주 지역 전체가 멈추면 GRS·GZRS만 되고 장애 조치가 필요하다 — 「Durability and availability by outage scenario」. **「LRS·ZRS·GRS 모두」처럼 묶어 쓸 때 이 표를 따른다**
- 서비스마다의 지원: Blob·Queue·Table은 여섯 옵션 모두. **Azure Files는 LRS·ZRS·GRS·GZRS이고 RA-GRS·RA-GZRS를 지원하지 않는다.** 관리 디스크는 LRS·ZRS다 — 「Supported Azure Storage services」. **표준 범용 v2 칸의 「여섯 옵션」은 계정 기준으로 맞지만, Files까지 여섯이라고 쓰지 않는다**
- 계정 유형 표: 표준 범용 v2는 여섯, 프리미엄 블록 Blob과 파일 공유(이 문서 이름은 SSD file shares)는 LRS·ZRS, 프리미엄 페이지 Blob은 LRS — 「Supported storage account types」. 지역에 따라 못 쓰는 옵션이 있다
- 보관 계층은 LRS·GRS·RA-GRS에서만 된다 — 같은 절. 위 「Access tiers」 항목과 같다
- GZRS는 지역이 가용성 영역을 지원하고 지역 쌍이 있어야 쓸 수 있다 — 「Geo-zone-redundant storage」
- 규정(데이터 거버넌스) 때문에 복제를 한 지역 안으로 제한해야 하면 LRS를 고려하고, ZRS도 그런 경우에 권장한다 — 「Locally redundant storage」·「Zone-redundant storage」 (phase 104 step 3)
- **쓰지 않는 것**: 내구성의 9 개수, RPO 값, 가용성 수치, 비관리 디스크, CRC(guide 「배경」)
- 한국어 표기: 이 한국어판은 GRS를 「지리중복 저장소」·「지리적 중복 저장」, GZRS를 「지오존 중복 저장소」로도 적어 흔들린다. Learn 단원 3 한국어판과 이 문서의 RA 이름을 따라 **지역 중복 스토리지·지역 영역 중복 스토리지**로 쓴다. 「기본 지역」과 「주 지역」은 **주 지역**으로 쓴다

쓰인 곳: `azure-storage.storage-redundancy`, `azure-storage.geo-redundancy`, `LrsZrsDiagram`, `GeoRedundancyDiagram`, `RedundancyOptionsTable`, D70, G43, `azure-storage.account-types`, `StorageAccountTypesTable`, D67

## (phase 104) Azure reliability — What are redundancy, replication, and backup?
https://learn.microsoft.com/en-us/azure/reliability/concept-redundancy-replication-backup

확인한 날 2026-11-01. 「Last updated on」 2026-09-23. 사본: `docs-reliability-redundancy-replication-backup.md`와 `ko-` 판.

- **복제는 백업이 아니다의 둘째 근거**: 복제는 변경을 복제본 모두에 맞추고 옛 사본을 남기지 않는다. 실수로 지우면 그 삭제도 복제본에 전해져 데이터가 어디서나 사라지므로 백업에서 되살려야 한다 — 「Replication: Redundancy for data」. **이 문장은 쓸 수 있다**
- 백업은 어느 시점의 사본을 떠 두었다가 복원하는 것이고, 삭제와 손상에 대비한다 — 「Backup」
- 동기 복제는 모든 복제본에 다 반영해야 끝난 것으로 치고, 비동기는 먼저 끝낸 뒤 나중에 복제한다 — 「Synchronous and asynchronous replication」. **「동기」·「비동기」의 풀이 근거다**
- 한국어 표기: 복제, 복제본, 백업, 동기, 비동기

쓰인 곳: `azure-storage.storage-redundancy`, `azure-storage.geo-redundancy`, D70

## (phase 104) Azure Storage — Disaster recovery and storage account failover
https://learn.microsoft.com/en-us/azure/storage/common/storage-disaster-recovery-guidance

확인한 날 2026-11-01. 「Last updated on」 2025-11-03. 사본: `docs-storage-common-disaster-recovery.md`와 `ko-` 판.

- LRS는 복사본 셋을 데이터 센터 하나에 두고, ZRS는 같은 지역의 가용성 영역 셋에 하나씩 둔다 — 「Choose the right redundancy option」. **ZRS 복사본 셋의 직접 근거다**
- 장애 조치 때 계정의 서비스 엔드포인트 DNS가 저절로 갱신되어 보조 지역의 엔드포인트가 새 주 엔드포인트가 된다 — 「Geo-redundant storage and failover」
- 장애 조치의 종류는 고객이 하는 계획·비계획과 Microsoft가 할 수 있는 것이다. Microsoft 쪽에 기대지 말라고 한다 — 「Plan for failover」. **본문은 「장애 조치를 하면」까지 쓰고 종류는 쓰지 않는다.** 「Azure가 저절로 넘긴다」로 쓰지 않는다
- 한국어 표기: 장애 조치(failover)

쓰인 곳: `azure-storage.geo-redundancy`, `GeoRedundancyDiagram`

## (phase 104) Azure Storage — Create a storage account
https://learn.microsoft.com/en-us/azure/storage/common/storage-account-create

확인한 날 2026-11-01. 「Last updated on」 2026-05-08. 사본: `docs-storage-common-create-account.md`와 `ko-` 판.

- 계정을 만들 때 기본 탭에서 이름, 지역, 성능(표준은 범용 v2이고 기본값), 중복성을 고른다. 지역에 따라 못 쓰는 유형·옵션이 있다 — 「Basics tab」
- 유형 표: 프리미엄 페이지 Blob은 `Premium_LRS`만, 프리미엄 블록 Blob과 파일 공유는 LRS·ZRS — 「Storage account type parameters」
- 포털에서 계정은 「스토리지 계정」으로 찾아 만든다 — 포털 절차 첫머리
- 한국어 표기: 지역, 성능, 중복성

쓰인 곳: `azure-storage.storage-accounts`, `azure-storage.account-types`, `StorageAccountDiagram`, `StorageAccountTypesTable`

## (phase 104) Azure Blob Storage — 낱말을 푸는 근거: 페이지 Blob, 대기 시간, 트랜잭션
- 페이지 Blob 개요 https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-pageblob-overview — 「Last updated on」 2023-05-11. 페이지 Blob은 임의의 범위를 읽고 쓸 수 있어 VM의 OS·데이터 디스크 같은 곳에 맞는다 — 첫 문단. 블록 Blob은 글자·이진 파일과 큰 파일 올리기에 맞다 — 같은 곳. 이 쪽의 「페이지 Blob은 핫 계층만」은 쓰지 않는다(2023년 글이고 쿨·보관만 들어 콜드가 없다)
- Blob 대기 시간 https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-latency — 「Last updated on」 2023-04-03. 대기 시간은 앱이 요청이 끝나기를 기다리는 시간이고, 프리미엄 블록 Blob은 SSD로 표준보다 낮고 고른 대기 시간을 낸다 — 첫 문단
- REST 작업과 가격 https://learn.microsoft.com/en-us/azure/storage/blobs/map-rest-apis-transaction-categories — 도구와 앱의 요청은 저마다 REST 작업으로 서비스에 가고 요금은 작업 종류(읽기·쓰기 등)로 나뉜다 — 첫머리. 다른 계정에서 복사할 때 읽기 요청마다 트랜잭션 하나로 센다 — 각주 2. **「트랜잭션」을 「읽기·쓰기 같은 요청 한 번」으로 푸는 근거다**

확인한 날 2026-11-01. 사본: `docs-storage-blobs-page-overview.md`, `docs-storage-blobs-latency.md`, `docs-storage-blobs-map-rest-apis-transaction-categories.md`와 `ko-` 판.
한국어 표기: 페이지 Blob, 블록 Blob, 대기 시간, 트랜잭션

쓰인 곳: `azure-storage.account-types`, `StorageAccountTypesTable`

## (phase 104) Azure Storage — 쓰지 않는 근거: 용량 한도와 데이터 보호
- 표준 스토리지 계정 확장 목표 https://learn.microsoft.com/en-us/azure/storage/common/scalability-targets-standard-account — 「Last updated on」 2025-11-02. 계정의 기본 최대 용량은 페타바이트 단위이고 Blob·파일 개수에는 한도가 없다. **덤프의 「2TB·파일 100만 개」가 틀렸음을 확인하는 데만 썼고, 값은 가르치지 않는다**(D70, guide 「배경」)
- Blob Storage 확장 목표 https://learn.microsoft.com/en-us/azure/storage/blobs/scalability-targets — 같은 확인에만 썼다
- Blob 데이터 보호 개요 https://learn.microsoft.com/en-us/azure/storage/blobs/data-protection-overview — 넓은 데이터 손실에는 계정 안의 기능에 더해 Azure Backup을 켜라고 한다. 일시 삭제·버전 관리 같은 기능 이름은 범위 밖이라 쓰지 않는다. **「복제는 백업이 아니다」의 보조 근거로만 둔다**

확인한 날 2026-11-01. 사본: `docs-storage-common-scalability-targets-standard-account.md`, `docs-storage-blobs-scalability-targets.md`, `docs-storage-blobs-data-protection.md`와 `ko-` 판.

쓰일 곳: D70(근거 기록)

## (phase 104) 한국어 표기 정리 — `azure-storage`

위 항목들의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다(phase 104 step 0). Microsoft 한국어 문서의 표기를 따르고(guide 「배경」), 한국어판 사이에 표기가 갈리면 근거를 적는다. 제품 문서가 절 제목에 쓴 이름을 먼저 고르고, Learn 한국어판의 기계 번역 이름은 쓰지 않는다.

| 개념 | 쓸 이름(`name`) | 근거 |
|---|---|---|
| `storage-services` | **Azure Storage 서비스** | 「Azure Storage 소개」 한국어판. 제품 이름은 옮기지 않는다 |
| `blob-storage` | **Azure Blob Storage** | 「Azure Blob Storage 소개」 한국어판 제목. Learn의 「Azure 블롭스」는 쓰지 않는다 |
| `access-tiers` | **Blob 액세스 계층** | 「Blob 데이터를 위한 액세스 계층」 제목을 줄였다 |
| `archive-rehydration` | **보관 계층 데이터 읽기(리하이드레이션)** | 「보관 계층에서 Blob 리하이드레이션」 제목. 명사구로 쓰려고 「데이터 읽기」를 앞에 뒀다 |
| `azure-files` | **Azure Files** | 「Azure Files란?」 제목 |
| `storage-redundancy` | **스토리지 중복성** | 「Azure Storage 중복성」 제목과 본문의 「스토리지」 |
| `geo-redundancy` | **보조 지역으로 복제** | Learn 단원 3 한국어판의 「보조 지역」·「복제」. 고유 이름이 아니라 하는 일을 쓴 제목이다 |
| `storage-accounts` | **스토리지 계정** | 「스토리지 계정 개요」 제목 |
| `account-types` | **스토리지 계정 유형** | 같은 문서 절 제목 |

목록 항목과 표의 이름:

- **서비스 다섯**(`storage-services`, ADR-046 꼴): **Azure Blob Storage**, **Azure Files**, **Azure Queue Storage**, **Azure Table Storage**, **Azure Disk Storage**(관리 디스크). 앞 넷은 제품 문서 한국어판이 이름을 옮기지 않고 제목에 쓴다. Disk만 한국어판이 「Azure 관리 디스크」·「Azure 디스크」로 갈리므로, Learn 영문판의 Azure Disk storage를 이름으로 쓰고 뒤에 「관리 디스크」를 괄호로 둔다. 이름이 이미 영문이라 영문 괄호를 붙이지 않는다
- **계층 넷**: **핫 계층**, **쿨 계층**, **콜드 계층**, **보관 계층**(Hot·Cool·Cold·Archive) — Access tiers 한국어판. 묶는 말은 **온라인 계층**·**오프라인 계층**, 계정 설정은 **기본 액세스 계층**
- **중복성 옵션 여섯**: **로컬 중복 스토리지(LRS)**, **영역 중복 스토리지(ZRS)**, **지역 중복 스토리지(GRS)**, **지역 영역 중복 스토리지(GZRS)**, **읽기 액세스 지역 중복 스토리지(RA-GRS)**, **읽기 액세스 지역 영역 중복 스토리지(RA-GZRS)** — Learn 단원 3 한국어판. 앞 phase의 「지역 중복 스토리지(GRS)」를 잇는다. 「지리적 중복」·「지리중복」·「지오존」은 쓰지 않는다. **지역**은 region의 표기인데 geo- 도 같은 낱말로 옮겨져 있다 — 본문에서 「다른 지역까지 복제」로 뜻을 함께 쓴다
- **계정 유형 넷**: **표준 범용 v2**, **프리미엄 블록 Blob**, **프리미엄 파일 공유**, **프리미엄 페이지 Blob** — 계정 개요·Learn 단원 2 한국어판. 「SSD file shares」는 중복성 문서만의 이름이라 쓰지 않는다
- **낱말**: 스토리지, 스토리지 계정, 네임스페이스(guide의 잠정 「이름공간」 대신 — 계정 개요·Blob 소개 한국어판. 처음 쓸 때 뜻을 푼다), 엔드포인트, 컨테이너, 블록 Blob, 페이지 Blob, 탑재, 온-프레미스, 주 지역, 보조 지역, 지역 쌍, 가용성 영역, 장애 조치(failover), 복제, 동기, 비동기, 트랜잭션, 대기 시간, 조기 삭제, 비정형 데이터, NoSQL, SMB(서버 메시지 블록), NFS(네트워크 파일 시스템)

**쓰지 않는 이름**: 스마트 계층, Data Lake Storage Gen2, 옛 계정 유형(범용 v1, 레거시 Blob Storage), 비관리 디스크, 추가 Blob(표 밖에서 풀 일이 없다), Azure Elastic SAN, Azure NetApp Files, 수명 주기 관리, 일시 삭제.

## (phase 104) Learn 「Describe Azure storage services」 — 6 Identify Azure data migration options
https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/6-identify-azure-data-migration-options

확인한 날 2026-11-01. 사본: `learn-describe-azure-storage-services-6-identify-azure-data-migration-options.md`와 `ko-` 판.

- Azure Migrate는 온-프레미스 환경을 클라우드로 옮기는 일을 돕고, 데이터 센터의 평가와 이전을 관리하는 허브 구실을 한다. 이전을 시작하고 진행하고 지켜보는 포털이 하나다 — 「Azure Migrate」
- 허브에 통합된 선택지는 검색 및 평가, 서버·데이터베이스·웹 앱의 마이그레이션이다 — 「Integrated tools」
- Data Box는 물리 장치로 큰 데이터를 옮기는 서비스다. 포털에서 주문하고 지역 배송 업체가 오가며, 로컬 웹 UI로 설정해 네트워크에 연결하고, 다 옮기면 돌려보낸다. Azure로 가져오는 경우 Microsoft가 받은 뒤 저절로 올라간다. 과정 전체를 포털에서 지켜본다 — 「Azure Data Box」
- 네트워크 대역폭이 모자랄 때의 큰 데이터에 맞고, 쓰임은 일회성 대량 이전, 온라인 전송이 너무 느린 주기적 업로드, 복구·규제 때문에 Azure에서 내보내기다 — 「Use cases」
- 가져오기는 업로드 뒤에 디스크를 지우고, 내보내기는 장치가 Azure 데이터 센터에 닿은 뒤에 지운다 — 「Use cases」 끝. 지우는 표준의 이름은 쓰지 않는다(guide 「배경」)
- **현행 문서와 다른 곳 넷 — 제품 문서를 따른다**: (1) 장치 용량 — 이 단원은 80테라바이트 하나를 적지만 제품 개요는 120TB·525TB 장치를 들고 80TB 장치가 차례로 끝난다고 한다. **용량은 어느 쪽도 쓰지 않는다.** (2) 「실시간(real-time) 마이그레이션」과 「비동기」 — 제품 개요에 없는 말이다. 쓰지 않고 「네트워크로」·「장치를 배송해」로 가른다. (3) 도구 이름 「Server Migration」 — 제품 문서의 이름은 Migrate and Modernize다. (4) 이 단원에 없는 범위(가상 데스크톱, Data Box가 Azure Migrate의 통합 도구라는 것)가 제품 개요에 있다
- **쓰지 않는 것**: ISV 도구, 지우는 표준의 이름, 장치 용량, 「tens of terabytes」의 수치
- 한국어 표기: 이 판의 「지역 이동 통신 사업자」는 regional carrier의 오역이다 — **지역 배송 업체**로 쓴다. 「Azure Migrate (Azure 마이그레이션)」의 괄호와 「재산적 가치를 가지는」은 따르지 않는다

쓰인 곳: `azure-data-movement.azure-migrate`, `azure-data-movement.data-box`, `AzureMigrateDiagram`, `DataBoxDiagram`, `DataMoveOptionsTable`, G45, G46

## (phase 104) Learn 「Describe Azure storage services」 — 7 Identify Azure file movement options
https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/7-identify-azure-file-movement-options

확인한 날 2026-11-01. 사본: `learn-describe-azure-storage-services-7-identify-azure-file-movement-options.md`와 `ko-` 판.

- AzCopy는 스토리지 계정과 Blob·파일을 주고받는 명령줄 유틸리티이고, 올리기·내려받기·계정 사이 복사·동기화를 한다 — 「AzCopy」
- AzCopy의 동기화는 원본과 대상을 정해 그 방향으로만 복사한다. 시간 표시나 메타데이터로 양쪽을 맞추지 않는다 — 「AzCopy」의 Important
- Storage Explorer는 스토리지 계정의 파일과 Blob을 화면으로 관리하는 독립 실행형 앱이고 Windows·macOS·Linux에서 돈다. 올리기·내려받기·계정 사이 옮기기를 한다 — 「Azure Storage Explorer」
- File Sync는 Azure Files에 파일 공유를 모으면서 Windows 파일 서버의 쓰임을 유지하게 하고, 서버에 설치하면 Azure의 파일과 양방향으로 저절로 맞춘다. 서버에서는 SMB·NFS·FTPS처럼 Windows Server가 쓸 수 있는 프로토콜로 닿고, 캐시를 세계 곳곳에 필요한 만큼 둘 수 있다. 클라우드 계층화는 자주 쓰는 파일을 서버에 복제해 두고 나머지를 요청받을 때까지 클라우드에 둔다 — 「Azure File Sync」
- **현행 문서와 다른 곳 셋 — 제품 문서를 따른다**: (1) 「다른 클라우드와 파일을 오간다(back and forth)」 — 제품 문서는 Amazon S3와 Google Cloud Storage **에서 Azure로** 복사하는 안내만 둔다. 「다른 클라우드의 저장소에서 Azure로 복사」까지 쓴다. (2) Storage Explorer가 「모든」 관리 작업을 AzCopy로 한다 — 제품 문서는 「대부분의 데이터 전송」이다. (3) 고장 난 서버를 「같은 데이터 센터」의 새 서버로 바꾼다 — 제품 문서는 데이터 센터를 한정하지 않고 새 Windows Server라고만 한다. 「새 Windows Server」로 쓴다
- **쓰지 않는 말**: 「미니어처 콘텐츠 배달 네트워크」라는 비유(캐시로 충분하다)
- 한국어 표기: 명령줄 유틸리티, 독립 실행형 앱, 원본과 대상, 단방향·양방향 동기화, Azure 파일 동기화, 클라우드 계층화

쓰인 곳: `azure-data-movement.azcopy`, `azure-data-movement.storage-explorer`, `azure-data-movement.file-sync`, `FileSyncDiagram`, `DataMoveOptionsTable`

## (phase 104) AzCopy — Get started with AzCopy
https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-v10

확인한 날 2026-11-01. 「Last updated on」 2026-10-23. 사본: `docs-storage-common-storage-use-azcopy-v10.md`와 `ko-` 판.

- AzCopy는 스토리지 계정으로, 계정에서, 계정 사이로 데이터를 복사하는 명령줄 유틸리티다 — 머리글
- 쓰임: 온-프레미스에서 계정으로, 계정에서 온-프레미스로, 계정에서 다른 계정으로. Blob Storage와 Azure Files를 고를 수 있고 둘 사이로도 복사한다. 복사 명령과 동기화 명령이 따로 있다 — 「AzCopy use cases」
- 내려받아 Windows·Linux·macOS에서 실행하는 파일이고, 명령 셸에 `azcopy`를 친다 — 「Get AzCopy」. **「명령줄」을 풀 때 「글자로 명령을 쳐서 프로그램을 다루는 방식」까지 쓰고 나머지는 일반 IT 용어로 푼다(ADR-010)**
- 명령을 직접 치는 것 말고 스크립트에 넣어 일괄·예약 전송을 할 수 있다 — 「Transfer data」. **표의 「작업을 자동으로」의 근거다**
- 전송 중에 원본이나 대상이 계속 바뀌는 상황은 지원하지 않는다 — 「Transfer data」의 Note
- **이 쪽 맨 위의 Note**: Azure Storage로 데이터를 옮길 계획이면 Azure Storage Mover를 쓰라고 한다. Storage Mover는 학습 가이드의 줄에 없어 **개념으로 쓰지 않는다.** 다만 **「AzCopy는 대량 이전 도구」로 쓰지 않는다** — G44
- **쓰지 않는 것**: Microsoft Entra ID·SAS 인증, 버전 번호, 명령 목록, Azure Storage Mover
- 한국어 표기: AzCopy, 명령줄 유틸리티, 스토리지 계정

쓰인 곳: `azure-data-movement.azcopy`, `FileSyncDiagram`, `DataMoveOptionsTable`, G44

## (phase 104) AzCopy — 동기화의 방향과 비교 기준
- Azure Files 전송 https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-files — 「Last updated on」 2026-08-17. 사본 `docs-storage-common-storage-use-azcopy-files.md`
- Blob 동기화 https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-blobs-synchronize — 「Last updated on」 2025-10-28. 사본 `docs-storage-common-azcopy-blobs-synchronize.md`
- 명령 참조 https://learn.microsoft.com/en-us/azure/storage/common/storage-ref-azcopy-sync — 사본 `docs-storage-common-azcopy-sync-ref.md`. 쪽에 수정 날이 없다

확인한 날 2026-11-01. 셋 다 `ko-` 판이 있다(명령 참조의 `ko-` 판은 영문 그대로다).

- 동기화는 한 방향이다. 두 끝 가운데 어느 쪽이 원본이고 어느 쪽이 대상인지 쓰는 쪽이 고른다 — 두 문서의 「Synchronize」 절. **Blob과 Files 모두에 든다**
- 맞출 수 있는 짝: 로컬 파일 시스템과 Blob 컨테이너, 컨테이너끼리, 로컬 파일 시스템과 파일 공유, 파일 공유끼리. Blob과 Files 사이의 동기화는 지금 판이 지원하지 않는다(복사는 된다) — 같은 절의 경고
- Azure Files의 동기화는 지원하지만 전적으로 권하지는 않는다고 적는다 — Azure Files 쪽 경고. **동기화를 File Sync의 대안으로 권하는 문장을 쓰지 않는다**
- **시간 표시의 쓰임**: 동기화 명령은 기본으로 파일 이름과 마지막 수정 시간을 비교해 무엇을 보낼지 정하고, 대상 쪽이 더 새 파일은 건너뛴다 — 「Guidelines」, 명령 참조 「Synopsis」. 그러므로 **guide의 「시간 표시로 양쪽을 맞추지 않는다」를 「시간 표시를 쓰지 않는다」로 읽히게 쓰지 않는다.** 비교에 쓰되 복사는 한 방향이라고 쓰거나 시간 표시를 꺼내지 않는다
- 대상에만 있는 파일은 기본값으로 지우지 않는다(`--delete-destination`의 기본값 false) — 명령 참조. 그러므로 **「동기화하면 대상이 원본과 똑같아진다」로 쓰지 않는다.** 「대상에서 바꾸거나 지운 것이 원본으로 돌아오지 않는다」는 쓸 수 있다
- 한국어 표기: 동기화, 원본, 대상. 제품 문서의 「소스」는 쓰지 않고 Learn 한국어판의 **원본**으로 쓴다

쓰인 곳: `azure-data-movement.azcopy`, `FileSyncDiagram`

## (phase 104) AzCopy — 다른 클라우드에서 복사
- Amazon S3 https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-s3 — 「Last updated on」 2026-05-27. 사본 `docs-storage-common-storage-use-azcopy-s3.md`
- Google Cloud Storage https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-google-cloud — 「Last updated on」 2025-10-31. 사본 `docs-storage-common-storage-use-azcopy-google-cloud.md`

확인한 날 2026-11-01. 둘 다 `ko-` 판이 있다.

- 두 문서 모두 제목과 머리글이 다른 클라우드 저장소에서 **Azure로** 복사하는 안내이고, 반대 방향의 안내는 찾지 못했다. Get started의 표는 Google Cloud 쪽을 미리 보기로 적는다
- 본문에는 「Amazon S3 같은 다른 클라우드의 저장소에서 Azure로 복사할 수 있다」까지 쓴다. Google Cloud의 미리 보기 여부는 쓰지 않는다

쓰인 곳: `azure-data-movement.azcopy`

## (phase 104) Azure Storage Explorer — 쓰는 곳과 하는 일
- Get started https://learn.microsoft.com/en-us/azure/storage/storage-explorer/vs-azure-tools-storage-manage-with-storage-explorer — 「Last updated on」 2025-04-14. 사본 `docs-storage-explorer-get-started.md`
- Blob 관리 https://learn.microsoft.com/en-us/azure/storage/storage-explorer/vs-azure-tools-storage-explorer-blobs — 「Last updated on」 2024-02-04. 사본 `docs-storage-explorer-blobs.md`
- 네트워크 연결 https://learn.microsoft.com/en-us/azure/storage/common/storage-explorer-network — 「Last updated on」 2025-06-27. 사본 `docs-storage-explorer-network.md`

확인한 날 2026-11-01. 셋 다 `ko-` 판이 있다.

- Storage Explorer는 내려받아 설치하는 독립 실행형 앱이고 Windows·macOS·Linux에서 돈다 — Get started 「Overview」·「Download and install」. **덤프의 「클라우드에 있는 서비스」가 틀린 근거다**(D73)
- Azure 계정으로 로그인하거나 리소스 하나에 연결해 스토리지 계정·Blob 컨테이너·파일 공유·큐·테이블을 다룬다 — Get started 「Connect to a storage account or service」
- 화면의 도구 모음으로 Blob을 올리고 내려받고, 컨테이너를 복사해 다른 스토리지 계정에 붙여 넣는다 — Blob 관리 「Copy a blob container」·「Managing blobs in a blob container」
- 대부분의 데이터 전송에 AzCopy를 쓴다 — 네트워크 연결 「AzCopy proxy usage」. **「안에서 대부분의 전송을 AzCopy로 한다」로 쓴다. 「모든」으로 쓰지 않는다**
- **쓰지 않는 것**: 인증 방식, 에뮬레이터, 지원 운영 체제의 판, Data Lake 컨테이너, 프록시 설정
- 한국어 표기: Azure Storage Explorer(제목은 Storage Explorer), 독립 실행형 앱, 업로드·다운로드. Learn 한국어판의 「그래픽 인터페이스」는 **화면**으로 풀어 쓴다

쓰인 곳: `azure-data-movement.storage-explorer`, `DataMoveOptionsTable`, D73, G44

## (phase 104) Azure File Sync — 하는 일과 맞추는 상대
- What is Azure File Sync? https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-introduction — 「Last updated on」 2026-08-18. 사본 `docs-file-sync-introduction.md`
- Deploy Azure File Sync https://learn.microsoft.com/en-us/azure/storage/files/storage-sync-files-deployment-guide — 「Last updated on」 2026-07-22. 사본 `docs-storage-sync-files-deployment-guide.md`
- Plan for an Azure File Sync deployment https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning — 「Last updated on」 2026-08-17. 사본 `docs-file-sync-planning.md`

확인한 날 2026-11-01. 셋 다 `ko-` 판이 있다.

- 파일 공유를 Azure Files에 모으면서 Windows 파일 서버의 쓰임을 유지한다. 등록한 Windows Server마다 가운데의 Azure 파일 공유와 양쪽으로 데이터를 맞춘다 — What is 첫머리. **맞추는 상대는 Azure 파일 공유다**(클라우드 엔드포인트가 곧 Azure 파일 공유다 — Plan 「Management concepts」). Blob 컨테이너나 Data Lake 컨테이너, 큐를 상대로 삼는 설명은 없다
- 한 서버의 변경은 Azure 파일 공유를 거쳐 다른 서버로 저절로 간다. 지점끼리 서버를 직접 잇지 않아도 된다 — What is 「Key benefits」
- 설치: Azure에 Storage Sync Service를 두고, 서버에 Azure 파일 동기화 에이전트를 설치해 등록하고, 동기화 그룹으로 파일 공유와 서버의 폴더를 잇는다 — What is 「How it works」. **본문은 「서버에 에이전트를 설치한다」까지 쓰고 나머지 이름은 쓰지 않는다**
- 서버에서는 SMB·NFS·FTPS처럼 Windows Server가 쓸 수 있는 프로토콜로 데이터에 닿는다 — Deploy 첫머리. **현행 제품 문서로 확인했다.** 이 프로토콜은 서버에 닿을 때의 것이고, Azure 쪽 상대는 앞 항목 「Azure Files」대로 SMB 파일 공유다. 새 방식(Microsoft.FileShares)의 NFS 공유는 File Sync가 지원하지 않는다 — Plan 「Management concepts」의 Note. 둘을 섞어 「File Sync는 NFS 파일 공유와 맞춘다」로 쓰지 않는다
- 캐시를 세계 곳곳에 필요한 만큼 둔다 — What is 첫머리, Deploy 첫머리
- 서버가 고장 나면 새 Windows Server에 에이전트를 설치하고 Azure에서 네임스페이스를 내려받아 되살린다 — What is 「Key benefits」. **「같은 데이터 센터」로 한정하지 않는다**
- 서버는 온-프레미스 Windows Server이거나 Azure VM이거나 둘 다일 수 있다 — Plan 머리의 「Key decisions」. 본문의 예는 온-프레미스로 쓰되 「온-프레미스에서만」으로 쓰지 않는다
- 양방향은 저절로지만 곧바로라는 뜻이 아니다. 파일 공유를 Azure 쪽에서 직접 바꾸면 변경 감지 작업이 찾아낸 뒤에 서버로 간다 — Plan 「Management concepts」의 Important. **「실시간」, 「곧바로」로 쓰지 않는다.** 주기의 값은 쓰지 않는다
- **쓰지 않는 것**: Storage Sync Service·동기화 그룹·엔드포인트라는 이름, Windows Server 판, 개수 한도, 다른 도구와의 조합
- 한국어 표기: **Azure 파일 동기화**, Azure 파일 공유, 에이전트, 동기화. 아래 표기 정리

쓰인 곳: `azure-data-movement.file-sync`, `FileSyncDiagram`, `DataMoveOptionsTable`, D73

## (phase 104) Azure File Sync — Cloud tiering overview
https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-cloud-tiering-overview

확인한 날 2026-11-01. 「Last updated on」 2026-04-09. 사본: `docs-file-sync-cloud-tiering-overview.md`와 `ko-` 판.

- 클라우드 계층화는 고를 수 있는 기능이고, 서버에 필요한 저장 공간을 줄인다 — 머리글
- 자주 쓰는 파일만 서버에 두고, 드물게 쓰는 파일은 이름과 폴더 구조만 서버에 남기고 내용을 Azure 파일 공유에 둔다. 그 파일을 열면 Azure 파일 공유에서 가져온다 — 머리글
- 서버의 여유 공간이나 마지막으로 쓴 날을 기준으로 정책을 정한다 — 「Cloud tiering policies」. 정책의 이름과 값은 쓰지 않는다
- **Blob 액세스 계층과 다른 말이라는 근거**: 이 문서가 옮기는 자리는 서버와 Azure 파일 공유 사이이고, 「Access tiers for blob data」가 정하는 것은 스토리지 계정 안 Blob의 핫·쿨·콜드·보관이다. 이 문서가 둘을 직접 견주는 문장은 없다 — **두 문서의 사실을 나란히 놓은 것**이라 「File Sync 문서가 다르다고 한다」로 쓰지 않는다
- 이 문서는 자주 쓰는 파일과 드물게 쓰는 파일을 hot·cool로도 부른다. Blob 계층 이름과 헷갈리므로 **본문은 핫·쿨을 쓰지 않고 「자주 쓰는 파일」·「나머지 파일」로 쓴다**
- 한국어 표기: **클라우드 계층화**. 이 문서 한국어판은 제목만 「클라우드 티어링」이고 절 제목과 본문은 「클라우드 계층화」다. What is 한국어판도 둘이 섞였고, Learn 단원 7 한국어판은 「클라우드 계층화」다. 그래서 「클라우드 티어링」은 쓰지 않는다

쓰인 곳: `azure-data-movement.file-sync`, `FileSyncDiagram`

## (phase 104) Azure Migrate — What is Azure Migrate?
https://learn.microsoft.com/en-us/azure/migrate/migrate-services-overview

확인한 날 2026-11-01. 「Last updated on」 2026-05-19. 사본: `docs-migrate-services-overview.md`와 `ko-` 판.

- Azure로 옮길지 정하고 계획하고 실행하는 일을 돕는 서비스다. 준비 상태와 비용을 평가하고 실제 이전까지 한다 — 머리글
- 포털 하나에서 시작하고 진행하고 지켜본다 — 「Benefits」의 Unified migration platform. **허브와 「한곳에서 지켜본다」의 근거다**
- 허브에서 평가·이전하는 것: 서버, 데이터베이스, 웹 앱, 그리고 Data Box 제품으로 옮기는 큰 데이터 — 「Benefits」. 머리글은 가상 데스크톱도 든다. **본문은 「서버·데이터베이스·웹 앱 같은 것」으로 쓰고 전부인 것처럼 쓰지 않는다**
- 순서: 먼저 무엇이 있는지 찾고(검색), 평가로 Azure 준비 상태·크기·비용·서버 사이 의존성을 보고, 그다음 실행 단계에서 옮긴다 — 「Migration phases」의 Decide·Plan·Execute. **본문은 「검색 및 평가 → 마이그레이션」 둘로 줄여 쓴다.** 비즈니스 사례는 쓰지 않는다
- 통합 도구의 현행 이름: **Discovery and Assessment**(검색 및 평가), **Migrate and Modernize**(마이그레이션 및 현대화). 데이터베이스·웹 앱 도구와 **Azure Data Box**도 표에 있다 — 「Integrated tools and features」. Learn 단원 6의 「Server Migration」, 덤프의 「Server Assessment」는 옛 이름이다
- **Data Box와의 관계**: Data Box는 Azure Migrate 허브의 통합 도구이기도 하다. 그러므로 guide의 「데이터를 옮기는 서비스가 아니라」로 단정하지 않는다. **「Azure Migrate는 무엇을 옮길지 평가하고 이전을 묶는 허브이고, Data Box는 큰 데이터를 장치에 담아 옮기는 서비스이며 허브에서 고를 수 있는 도구의 하나다」** 로 쓴다
- **쓰지 않는 것**: 「실시간」(이 문서는 쓰지 않고 「가동 중지 시간과 위험을 줄여」로 쓴다), ISV 도구(SDC 표), Azure Copilot 에이전트(미리 보기), 어플라이언스, Movere(지원 종료), 무료라는 것, 대상 서비스 이름
- 한국어 표기: Azure Migrate(이 문서는 이름을 옮기지 않는다), 허브, 검색 및 평가, 마이그레이션 및 현대화, 마이그레이션, 평가

쓰인 곳: `azure-data-movement.azure-migrate`, `AzureMigrateDiagram`, `DataMoveOptionsTable`, G45

## (phase 104) Azure Data Box — What is Azure Data Box?
https://learn.microsoft.com/en-us/azure/databox/data-box-overview

확인한 날 2026-11-01. 「Last updated on」 2025-07-24. 사본: `docs-data-box-overview.md`와 `ko-` 판.

- 큰 데이터를 Azure로 가져오거나 Azure에서 내보내려고 Microsoft가 전용 저장 장치를 지역 배송 업체로 보내 주는 서비스다 — 머리글
- 네트워크 연결이 없거나 제한된 곳의 큰 데이터에 맞고, 일회성·주기적이거나 처음에 대량으로 옮긴 뒤 네트워크로 이어 보낼 수 있다 — 「Use cases」
- 가져오기의 쓰임: 일회성 이전, 처음 한 번의 대량 전송, 주기적 업로드 — 「Use cases」
- 내보내기의 쓰임: 재해 복구, 정부·보안 요구, 온-프레미스나 다른 클라우드로 되돌아가기 — 「Use cases」
- **가져오기 흐름**: 포털에서 배송 정보와 대상 스토리지 계정을 적어 주문 → 받아서 전원과 네트워크를 연결하고 설정한 뒤 복사할 컴퓨터에 공유를 탑재 → 데이터를 복사 → 돌려보냄 → Azure 데이터 센터에서 스토리지 계정으로 저절로 복사되고 디스크를 지움 — 「The workflow」
- **내보내기 흐름**: 포털에서 원본 스토리지 계정을 적어 주문 → **Microsoft가 데이터를 장치에 담은 뒤 보냄** → 받아서 연결하고 공유를 탑재 → 장치에서 서버로 복사 → 돌려보냄 → 디스크를 지움 — 「The workflow」
- 장치의 데이터는 언제나 암호화되어 있고 포털의 암호로만 열린다 — 「Benefits」. 설정에 쓰는 것은 장치의 로컬 웹 UI다 — 「Data Box components」
- **용량은 쓰지 않는다.** 이 문서 안에서도 120TB·525TB 판과 80TB 판의 설명이 나뉘어 있고, Data Box Heavy는 지원이 끝났으며 80TB 장치도 차례로 끝난다 — 머리글의 Note. 이것은 **어긋난다는 처리로만** 남긴다(guide 「배경」). 「40TB」 같은 알맞은 크기 값, 속도, 무게도 쓰지 않는다
- **쓰지 않는 것**: Data Box Heavy, 지우는 표준의 이름, 장치 사양, 파트너 제품, 지역 간 업로드 조건
- 한국어 표기: Azure Data Box, **Data Box 디바이스**(이 문서 한국어판이 일관되게 쓴다. 처음 쓰는 자리에서 「저장 장치」로 푼다), 가져오기·내보내기, 로컬 웹 UI. 「지역 이동 통신 사업자」는 오역이라 **지역 배송 업체**로 쓴다

쓰인 곳: `azure-data-movement.data-box`, `DataBoxDiagram`, `DataMoveOptionsTable`, G46

## (phase 104) Azure Data Box — Tutorial: Create export order
https://learn.microsoft.com/en-us/azure/databox/data-box-deploy-export-ordered

확인한 날 2026-11-01. 「Last updated on」 2025-04-22. 사본: `docs-data-box-deploy-export-ordered.md`와 `ko-` 판.

- 내보내기 주문의 주된 까닭은 온-프레미스 저장소가 손상됐을 때의 복구다 — 머리글
- 주문하면 Microsoft가 장치를 준비해 지역 배송 업체로 보낸다. 받는 쪽은 데이터 센터 네트워크에 연결한 컴퓨터로 장치에서 복사한다 — 「For device」, 「Track the order」
- 보관 계층의 Blob은 내보낼 수 없어 먼저 리하이드레이션해야 한다 — 「Track the order」의 Note. **쓰려면 한 줄로만 쓴다**(앞 주제 `archive-rehydration`과 이어진다). 쓰지 않아도 된다
- 한국어 표기: 내보내기 주문

쓰인 곳: `azure-data-movement.data-box`, `DataBoxDiagram`

## (phase 104) Azure Storage — Migrating your data to Azure - overview
https://learn.microsoft.com/en-us/azure/storage/common/storage-choose-data-transfer-solution

확인한 날 2026-11-01. 「Last updated on」 2025-09-25. 사본: `docs-storage-common-choose-data-transfer.md`와 `ko-` 판.

- 상황별 도구 표 — 「Select migration tools」: 네트워크가 없거나 낮은 대역폭의 오프라인 전송은 Data Box. 빠르고 작거나 중간 규모의 전송과 스크립트로 세밀하게 다루는 일은 AzCopy. 물리 서버와 VM은 Azure Migrate. Windows 파일 서버, 양방향 동기화, 온-프레미스 캐시와 클라우드 계층화는 Azure File Sync. **표 `DataMoveOptionsTable`의 「알맞은 때」 근거다**
- **Data Box가 맞지 않는 때의 근거**: 이 표가 작거나 중간 규모의 온라인 전송에 AzCopy를 고르고, Data Box 개요가 네트워크가 제한된 큰 데이터에 맞다고 하므로, 「네트워크로 보낼 만한 작은 데이터면 AzCopy 같은 온라인 도구가 맞다」로 쓴다. 「Data Box를 쓸 수 없다」로 쓰지 않는다
- 이 표에는 Storage Explorer 행이 없다. Storage Explorer의 「알맞은 때」는 위 Storage Explorer 항목(화면에서 올리고 내려받기)에서 가져온다
- 이 표의 크기 경계 값은 쓰지 않는다. Azure Storage Mover, Data Box Gateway, robocopy 같은 이름은 학습 가이드의 줄 밖이라 쓰지 않는다
- 한국어 표기: 온라인·오프라인 전송, 마이그레이션

쓰인 곳: `azure-data-movement.azcopy`, `azure-data-movement.data-box`, `DataMoveOptionsTable`, G44

## (phase 104) 한국어 표기 정리 — `azure-data-movement`

위 항목들의 한국어 표기 줄에서 이 주제가 쓸 이름을 정했다(phase 104 step 5). 근거는 `azure-storage`의 표기 정리와 같다 — Microsoft 한국어 문서의 표기를 따르고, 문서가 이름을 옮기지 않으면 그대로 둔다.

| 개념 | 쓸 이름(`name`) | 근거 |
|---|---|---|
| `azcopy` | **AzCopy** | 「AzCopy 시작」 제목 |
| `storage-explorer` | **Azure Storage Explorer** | Learn 단원 7 한국어판. 제품 문서 제목은 줄여 Storage Explorer로 쓴다 |
| `file-sync` | **Azure 파일 동기화(Azure File Sync)** | 「Azure 파일 동기화란?」 제목과 Learn 단원 4·7, Azure Files 소개·계획 한국어판이 모두 이 이름이다. 영문 이름이 달라 괄호에 둔다(guide 「예시 값」). 학습 가이드와 덤프는 영문으로 쓰므로 두 이름을 함께 세운다 |
| `azure-migrate` | **Azure Migrate** | 「Azure Migrate란?」 제목. Learn 한국어판 괄호의 「Azure 마이그레이션」은 쓰지 않는다 |
| `data-box` | **Azure Data Box** | 「Azure Data Box란?」 제목 |

이름과 낱말:

- **`file-sync`의 다음 자리**: 본문·문제문·표·시나리오 버튼은 **Azure 파일 동기화**로 쓰고, 영문은 개념 이름과 처음 쓰는 자리의 괄호에만 둔다. 앞 개념 `azure-storage.azure-files`는 「Azure File Sync」로 적어 두었다(step 2). 영문이 괄호에 함께 있어 이어 읽히므로 그 글은 고치지 않는다
- **도식의 노드**: Windows 파일 서버, **Azure 파일 공유**(guide의 잠정 「Azure Files 파일 공유」 대신), 검색 및 평가, 마이그레이션, **Data Box 디바이스**(guide의 잠정 「Data Box 장치」 대신), **스토리지 계정**(guide의 잠정 「Azure 스토리지」 대신 — 흐름의 대상이 대상 스토리지 계정이다), 온-프레미스 데이터
- **낱말**: 명령줄, 원본, 대상, 동기화, 단방향·양방향(본문은 「한 방향」·「양쪽으로」로 풀어도 된다), 독립 실행형 앱, 캐시, 에이전트, 클라우드 계층화, 마이그레이션, 허브, 대역폭, 가져오기, 내보내기, 로컬 웹 UI, 지역 배송 업체

**쓰지 않는 이름**: Azure Storage Mover, Data Box Heavy, Data Box Gateway, Server Migration, Server Assessment, Movere, Storage Sync Service, 동기화 그룹, 클라우드·서버 엔드포인트, 클라우드 티어링, 소스, 이동 통신 사업자.

