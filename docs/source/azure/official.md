# Azure 과목 — 공식 문서에서 확인한 사실

Azure AZ-900 과목의 **사실 출처**다. Microsoft 공식 문서에서 확인한 사실과 URL을 문서마다 모은다(`docs/source/azure/CLAUDE.md` 「원본 셋」, ADR-060).
개념·문항·도식의 사실은 여기에 있는 것만 쓴다. 덤프와 용어집은 사실 후보일 뿐이고, 공식 문서와 다르거나 공식 문서에 없는 곳은 여기가 아니라 `corrections.md`에 둔다.

규칙:

- **허용하는 곳만 쓴다** — `docs/source/azure/CLAUDE.md` 「허용하는 출처」의 `learn.microsoft.com`(학습 단원·제품 문서·자격증 학습 가이드)과
  `azure.microsoft.com`(제품·가격 페이지, 클라우드 컴퓨팅 사전). 목록에 없는 곳은 그 목록에 먼저 더하고 쓴다.
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

쓰인 곳: `azure-cloud-computing.cloud-computing`(데이터 센터·서버를 푸는 한 줄)

쓰인 곳(phase 101): `azure-cloud-benefits.reliability`(지역과 데이터 센터를 푸는 줄), az020 해설

## (phase 100) Learn 「Describe the core architectural components of Azure」 — 6 Describe Azure management infrastructure
https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/6-describe-azure-management-infrastructure

확인한 날 2026-10-30. 사본: `learn-describe-core-architectural-components-of-azure-6-describe-azure-management-infrastructure.md`와 `ko-` 판.

- **리소스**는 Azure를 이루는 기본 단위다. Azure에서 만들거나 갖추거나 배포하는 것은 무엇이든 리소스이고, VM·가상 네트워크·데이터베이스가 그 예다 — 「Azure resources and resource groups」 첫 문단
- 한국어 표기: resource → 리소스

쓰인 곳: `azure-cloud-computing.consumption-based-model`(리소스를 푸는 한 줄)

## (phase 100) Learn 「Describe Azure compute services」 — 2 Describe Azure virtual machines
https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/2-virtual-machines

확인한 날 2026-10-30. 사본: `learn-describe-azure-compute-networking-services-2-virtual-machines.md`와 `ko-` 판. (모듈 주소는 `describe-azure-compute-networking-services`이고 지금 제목은 「Describe Azure compute services」다.)

- Azure 가상 머신(VM)으로 Azure 안에서 가상화된 서버를 실행한다. 물리 서버처럼 운영 체제와 설치한 소프트웨어를 쓰는 쪽이 정한다 — 「첫 문단」
- Azure VM을 쓰면 물리 서버 하드웨어를 사서 유지할 필요가 없다. 그래도 VM 안의 패치·업데이트·구성은 쓰는 쪽이 계속 관리한다 — 「둘째 문단」
- VM은 테스트·개발에 맞다 — 여러 구성을 빨리 만들고 테스트가 끝나면 VM을 지운다 — 「Examples of when to use VMs」
- 한국어 표기: Azure Virtual Machines → Azure VM(Virtual Machines), virtual machine → 가상 머신, physical server → 물리적 서버, operating system → 운영 체제

쓰인 곳: `azure-cloud-computing.cloud-computing`(가상 머신을 푸는 한 줄), `azure-cloud-computing.serverless`(VM과의 차이), D1, G1

## (phase 100) Azure Virtual Machines — Virtual machines in Azure
https://learn.microsoft.com/en-us/azure/virtual-machines/overview

확인한 날 2026-10-30, Last updated 2025-12-01. 사본: `docs-virtual-machines-overview.md`.

- Azure VM은 Azure가 내주는 필요할 때 받아 쓰고 늘릴 수 있는 컴퓨팅 리소스의 한 종류다 — 「첫 문단」
- Azure VM은 그 VM을 실행하는 물리 하드웨어를 사서 유지하지 않고도 가상화의 유연성을 준다. 대신 구성·패치·소프트웨어 설치 같은 VM 관리는 쓰는 쪽이 계속 한다 — 「둘째 문단」

쓰인 곳: `azure-cloud-computing.cloud-computing`(가상 머신), `azure-cloud-computing.serverless`(VM과의 차이), D1, G1

## (phase 100) Learn 「Describe Azure storage services」 — 4 Describe Azure storage services
https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/4-describe-azure-storage-services

확인한 날 2026-10-30. 사본: `learn-describe-azure-storage-services-4-describe-azure-storage-services.md`와 `ko-` 판.

- Azure Storage는 데이터를 담아 두는 서비스들의 묶음이다 — 글자·이진 데이터를 담는 Blob, 파일 공유를 내주는 Files, VM이 쓰는 블록 단위 저장 공간인 Disks 등 — 「첫 목록」
- 이 단원에 「스토리지」 낱말 하나를 정의하는 문장은 없다. 위 목록이 스토리지를 「데이터(파일 등)를 담아 두는 곳」으로 풀 근거다
- 한국어 표기: storage → 스토리지, Azure Storage → Azure Storage(이름 그대로)

쓰인 곳: `azure-cloud-computing.cloud-computing`(스토리지를 푸는 한 줄)

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

쓰인 곳: D7

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

## (phase 100) Azure Functions — What is Azure Functions?
https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview

확인한 날 2026-10-30, Last updated 2026-09-21. 사본: `docs-azure-functions-functions-overview.md`, `ko-docs-azure-functions-functions-overview.md`.

- Azure Functions는 서버리스 솔루션이다. 서버를 배포하고 유지하는 대신 클라우드 인프라가 앱을 계속 실행하는 데 필요한 리소스를 내준다 — 「첫 문단」
- 쓰는 쪽은 코드에 집중하고 나머지는 Functions가 맡는다 — 「둘째 문단」
- 이벤트에 반응하는 트리거로 다른 서비스와 이어진다. 예: Blob 스토리지에 파일이 올라오면 코드 실행, 정해 둔 시각마다 작업 실행 — 「Scenarios」
- 한국어 표기: serverless solution → 서버리스 솔루션

쓰인 곳: `azure-cloud-computing.serverless`, D1

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

쓰인 곳: `azure-cloud-benefits.high-availability`(고가용성의 둘째 설명과 안정성을 가르는 근거), `azure-cloud-benefits.reliability`(내결함성·중복성·재해 복구를 푸는 문단 — 자연재해와 데이터를 실수로 지우는 일을 예로),
`azure-cloud-benefits.elasticity`(확장성과의 차이의 둘째 근거), D16, D21, G11. 가동 시간 백분율의 예(99.9% = 약 43분)는 쓰지 않았다

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

쓰일 곳: D20

## (phase 101) Azure 클라우드 컴퓨팅 사전 — What is a container?
https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-a-container

확인한 날 2026-10-30. 사본: `azure-dictionary-what-is-a-container.md`.

- 컨테이너는 앱 코드와 그 코드를 실행하는 데 필요한 운영 체제 라이브러리·의존성을 한데 묶은 독립된 소프트웨어 꾸러미다. 그래서 개발자의 노트북에서든 테스트 서버에서든 클라우드에서든 같게 실행된다 — 「첫 부분」
- 컨테이너는 VM보다 가볍고 옮기기 쉬워 크기를 조정하기 쉽다 — 「Key takeaways」
- 한국어 표기: container → 컨테이너(Learn 단원 2 한국어판)

쓰인 곳: `azure-cloud-benefits.scalability`(컨테이너를 푸는 한 줄)

## (phase 101) Azure DDoS Protection — Azure DDoS Protection overview
https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-protection-overview

확인한 날 2026-10-30. 사본: `docs-ddos-protection-overview.md`와 `ko-` 판. (DDoS Protection 서비스는 이 주제에서 이름을 쓰지 않는다. DDoS 공격을 푸는 근거로만 적는다.)

- DDoS 공격은 앱의 리소스를 바닥내 정상 사용자가 그 앱을 쓸 수 없게 하려는 공격이다. 인터넷에서 누구나 닿을 수 있는 끝점은 모두 대상이 될 수 있다 — 「첫 문단」
- 한국어 표기: 이 문서의 한국어판은 DDoS를 「배포된 서비스 거부」로 잘못 옮겼다. Learn 「Describe the benefits of using cloud services」 단원 4 한국어판의 **DDoS(분산 서비스 거부)** 를 쓴다

쓰인 곳: `azure-cloud-benefits.security-governance`(DDoS 공격을 푸는 한 줄)

## (phase 101) Cloud Adoption Framework — Build a cloud governance team
https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/govern/

확인한 날 2026-10-30. 사본: `docs-caf-govern.md`와 `ko-` 판.

- 클라우드 거버넌스는 조직이 가드레일을 세워 클라우드 서비스를 어떻게 쓸지 통제하는 방법이다. 가드레일은 해도 되는 클라우드 활동과 안 되는 활동을 정하는 정책·절차·도구의 묶음이다 — 「첫 문단」
- 거버넌스는 클라우드 사용을 사업 목표에 맞추고, 위험을 줄이고, 규정 준수를 지키고, 관리되지 않거나 허락받지 않은 작업을 막는다. 보안·규정 준수·운영·비용 관리·데이터 관리·리소스 프로비저닝 같은 영역을 다룬다 — 같은 문단
- 한국어 표기: cloud governance → 클라우드 거버넌스, guardrails → 가드레일, regulatory compliance → 규정 준수

쓰인 곳: `azure-cloud-benefits.security-governance`(거버넌스를 푸는 줄 — 해도 되는 일과 안 되는 일을 정책·절차·도구로 정함. 「가드레일」이라는 말은 쓰지 않았다)

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
