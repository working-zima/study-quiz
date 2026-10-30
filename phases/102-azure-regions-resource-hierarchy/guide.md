# phase 102 공통 안내 — Azure AZ-900 과목의 지역과 가용성 영역·리소스 계층

이 phase의 **모든 step이 먼저 읽는 문서**다. step 문서는 자기 일의 세부만 적고, 과목 결정·두 주제의 개념 표와 글·문항·도식·파일 형식의 공통 규칙은 여기에 둔다.
step 문서와 이 문서가 다르면 step 문서를 따르고 그 차이를 summary에 적는다.

## 배경 — 다시 묻지 말 결정

Azure AZ-900 과목(`src/data/azure/`, ADR-060)은 phase 100에서 생겼고 phase 101이 주제 3·4·5를 더했다. 주제 지도(`docs/source/azure/topic-map.md`)의 주제 20개 가운데 1~5가 있고, **이 phase는 6·7을 더한다.**
이 둘로 공식 학습 가이드의 묶음 「Describe the core architectural components of Azure」가 채워진다 — 물리 인프라(데이터 센터·지역·가용성 영역·지역 쌍·소버린 지역)와 관리 인프라(리소스·리소스 그룹·구독·관리 그룹과 그 계층).

**앞 phase가 남긴 것(이 phase의 출발점):**

- 주제 다섯 — `azure-cloud-computing`(개념 7)·`azure-cloud-models`(5)·`azure-cloud-benefits`(7)·`azure-sla-lifecycle`(6)·`azure-service-types`(4), 개념 29개.
- 문항 `az001`~`az038`(38개) — 예/아니요 예 10·아니요 11, 4지선다 정답 위치(`answerIndex` 0~3) 4/5/4/4.
- 도식 `CapacityPlanningDiagram`·`PublicPrivateCloudDiagram`·`HybridCloudDiagram`·`CloudScalingDiagram`·`CompositeSlaDiagram`·`ServiceLifecycleDiagram`·`SharedResponsibilityDiagram`, 표 `PricingModelsTable`·`CloudModelsTable`·`ServiceTypesTable`.
- 출처 문서 `docs/source/azure/official.md`(항목 머리 `## (phase 100) …`·`## (phase 101) …`)와 `docs/source/azure/corrections.md`(D1~D37, G1~G19). **이 phase는 D38·G20부터 잇는다.**
- 검증 값: 테스트 223파일·5105개, 교차 검사 세로·가로 노드 1001·경로 699, `check-verbatim --subject azure` 원본 138개·단위 249개.
- 실행 보고 `phases/100-azure-cloud-concepts/verification.md`·`phases/101-azure-benefits-sla-service-types/verification.md` — 출처 step이 정한 표기(「온-프레미스」, 「서비스형 인프라」 꼴, 「공유 책임 모델」)와 그 이유가 있다.

**사용자 결정(2026-10-30, 다시 묻지 마라):**

- **범위**: Microsoft Learn의 AZ-900 공식 학습 가이드(2026-07-20 기준)가 뼈대다. 가이드 밖이라도 **용어집에 있고 덤프도 묻는 현행 것**은 넣는다.
  지원이 끝난 서비스·옛 이름은 빼거나 현행으로 고친다. 덤프만 묻는 것은 넣지 않는다.
- **도식**: **주제마다 최소 하나**, 그리고 구조·흐름이 있는 개념(지역·가용성 영역, 리소스 계층 같은 것)에는 개념마다. 정의형 개념에는 없다. 비교표는 도식을 대신하지 않는다.
- 주제 지도(20개, 순서·별점·phase)는 사용자가 「고칠 것 없음」으로 확인했다.
- 사실의 기준은 **Microsoft 공식 문서**다. 덤프와 용어집은 범위·강조의 기준이자 사실 **후보**이고, 공식 문서와 다르면 공식 문서를 따르고 수정 이력에 남긴다(ADR-060).
  덤프 문항·용어집 문장은 옮기지 않는다(ADR-009, ADR-021과 같은 방식). 덤프는 시험 주관 기관의 문항이 아니므로 「자격시험은 ~로 본다」 줄을 쓰지 않는다.
- 용어는 **Microsoft 한국어 문서의 표기**를 따른다. 주제 id는 `azure-` 접두사, 별점은 덤프 출제 빈도(대표 문항 25 이상 ★★★, 13~24 ★★☆).
- **서비스마다의 SLA 수치는 쓰지 않는다**(phase 101 설계 — SLA 약관 원문을 받아 확인할 수 없다).

**이 phase에서 정한 것(설계, 사용자 승인 2026-10-31):**

- 개념 12개, 문항 17개(`az039`~`az055`), 도식 여섯, 표 없음. 아래 「두 주제와 개념 12개」.
- **덤프가 묻는 것 가운데 쓰지 않는 것**: NO.493(99.99%를 위한 최소 VM·영역 수 — 서비스별 SLA 수치), NO.186·391·403의 지역 수·데이터 센터 수(바뀌는 수다. 지역 간 데이터 전송 비용은 주제 `azure-cost-factors`의 몫),
  NO.468의 Azure Germany(지원이 끝났다 — 출처 step이 공식 문서로 확인해 수정 이력에 남긴다).
- **다른 주제의 몫은 이 phase에서 한 줄 풀이로만 쓴다** — 역할 기반 액세스 제어(Azure RBAC)는 `azure-security-model`, Azure Policy는 `azure-governance`, 태그는 `azure-cost-management`,
  VM 확장 집합·가용성 집합은 `azure-compute`의 몫이다. 리소스 그룹의 태그가 리소스로 물려지는가(덤프 NO.54·93·335)는 이 phase에서 쓰지 않는다 — step 4가 사실만 `official.md`에 남긴다.
- **도식은 구조가 있는 개념 여섯에 하나씩**(아래 「도식」). 데이터 센터·가용성 영역 서비스 범주·소버린 지역·리소스·구독·관리 그룹에는 붙이지 않는다 —
  정의형이거나, 같은 주제의 다른 개념에 붙은 도식이 그 구조를 그린다(데이터 센터는 `AzureRegionDiagram`이, 관리 그룹은 `HierarchyInheritanceDiagram`이, 구독과 계정의 관계는 `SubscriptionBoundaryDiagram`이).
- **도식의 지역 이름은 이름표(「지역 A」·「지역 B」)로 쓴다.** 실제 지역 이름(예: Learn 단원의 지역 쌍 예)은 출처 step이 현행 공식 문서로 확인했을 때만 본문에 쓴다.
- **ADR은 필요 없다.** 쓸 출처가 모두 이미 허용된 `learn.microsoft.com`·`azure.microsoft.com` 안에 있다. 허용 목록 밖의 곳이 꼭 필요하면 쓰지 말고 출처 step의 summary 「사용자 확인」에 적는다.

**실행 규칙:**

- **step 하나는 30분 안에 끝나야 한다.** `scripts/execute.py`가 step을 1800초에서 끊는다. 그래서 step은 **브라우저 화면 실측(개발 서버·headless Chrome·CDP)을 하지 않는다** —
  phase가 끝난 뒤 메인 세션이 모든 도식을 한꺼번에 실측한다. 시간을 아끼려고 검증 명령을 건너뛰지는 마라.
- 「주제마다 도식 하나 이상」을 `src/components/diagrams/azureDiagramCoverage.test.ts`가 지킨다. 그래서 **주제를 처음 만드는 step(1·5)이 그 주제의 첫 도식도 함께** 만든다.
  저장소의 Stop 훅(`scripts/hooks/codex-verify-gate.sh`)은 테스트가 실패한 상태로 step을 끝내지 못하게 한다.
- **진행 안내 문장을 쓰지 않는다.** 「다음 개념에서 다룬다」, 「뒤에서 자세히 다룬다」처럼 글의 진행만 알리는 말은 `src/data/azure/data.test.ts`의 진행 안내 테스트가 막는다.
  뒤 개념이나 다른 주제가 자세히 다룰 낱말이 지금 필요하면 그 자리에서 한 줄로 풀고 넘어간다. 「앞 개념에서 본 것처럼」 같은 되짚기는 써도 된다.

## step 여덟 개

| step | 이름 | 하는 일 |
|---|---|---|
| 0 | `regions-sources` | 주제 6이 쓸 사실을 공식 문서로 확인해 `official.md`·`corrections.md`에 더한다 |
| 1 | `datacenter-region` | 주제 6을 만들고 개념 1·2의 글·문항과 도식 `AzureRegionDiagram` |
| 2 | `availability-zones` | 개념 3·4의 글·문항과 도식 `ZoneIsolationDiagram` |
| 3 | `region-pairs-sovereign` | 개념 5·6의 글·문항과 도식 `RegionPairDiagram` |
| 4 | `hierarchy-sources` | 주제 7이 쓸 사실을 확인해 두 문서에 더한다 |
| 5 | `resource-group` | 주제 7을 만들고 개념 7·8의 글·문항과 도식 `ResourceGroupScopeDiagram` |
| 6 | `subscription` | 개념 9·10의 글·문항과 도식 `SubscriptionBoundaryDiagram` |
| 7 | `management-group-hierarchy` | 개념 11·12의 글·문항과 도식 `HierarchyInheritanceDiagram` |

## 두 주제와 개념 12개

주제 객체(`src/data/azure/topics.json`의 기존 다섯 주제 뒤에 이 순서로):

```json
{ "id": "azure-regions-zones", "title": "지역과 가용성 영역", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }
{ "id": "azure-resource-hierarchy", "title": "리소스 계층", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }
```

별점: 주제 지도의 대표 문항 수가 `azure-regions-zones` 26, `azure-resource-hierarchy` 25다(둘 다 ★★★). `data.test.ts`가 이 값을 본다.

개념 id는 `<주제 id>.<슬러그>`다. 표의 순서·슬러그·`parentId`를 바꾸지 않는다(바꿔야 할 이유가 있으면 바꾸지 말고 summary에 적는다).
**`name`은 출처 step(0·4)이 확인한 Microsoft 한국어 문서의 표기를 따른다** — 표의 이름은 잠정이다. 한국어판 안에서도 표기가 섞인 것(아래 「한국어판에서 본 것」)은 출처 step이 하나로 정하고 근거를 남긴다.
`parentId` 열의 값은 같은 주제의 슬러그다 — JSON에는 `azure-regions-zones.availability-zones`처럼 전체 id로 쓴다. 딸린 개념은 부모 바로 뒤에 이어 둔다(ADR-041).
「다룰 것」은 범위다. 문장은 직접 쓰고, 사실은 아래 「출처」대로 가져온다. 「step N 결과」라고 적힌 사실은 그 step의 summary와 출처 문서에 적힌 처리를 따른다 —
확인되지 않았으면 쓰지 않는다. 「덤프」 뒤의 `NO.`는 덤프 문항 번호다(`docs/source/azure/dump-topics.tsv`·`raw/dump/dump.md`).

**한국어판에서 본 것(설계 때, 출처 step이 다시 확인한다):** Learn 단원 5(물리 인프라) 한국어판은 절 제목을 「소버린 지역」으로, 본문을 「주권 지역」으로 섞어 쓴다.
같은 단원이 가용성 영역을 지원하는 서비스의 세 범주를 「영역 서비스」·「영역 중복 서비스」·「비지역 서비스」로 적는다. 용어집은 지역을 「Azure 리전」으로 적지만 phase 101이 「지역」으로 정했다(`official.md`).
Learn 단원 6(관리 인프라) 한국어판은 「청구 경계」·「액세스 제어 경계」, 「테넌트 루트 그룹」, 절 제목 「관리 그룹, 구독 및 리소스 그룹 계층 구조」로 적는다.

### `azure-regions-zones` — 지역과 가용성 영역 (공식 학습 가이드 「Describe Azure regions, region pairs, and sovereign regions」·「Describe availability zones」·「Describe Azure datacenters」)

순서는 Learn 단원 5와 같다 — 가장 작은 물리 단위(데이터 센터)에서 시작해 그것을 묶는 단위(지역 → 지역 안의 가용성 영역 → 지역을 짝지은 지역 쌍)로 넓히고, 주 Azure와 떨어진 소버린 지역으로 끝난다.
학습자가 가장 많이 헷갈리는 것은 **「무엇이 어떤 장애를 막는가」**다 — 데이터 센터 하나·가용성 영역 하나의 장애는 가용성 영역이, 지역 전체의 장애는 다른 지역(지역 쌍 등)이 대비한다. 개념 3·5와 두 도식이 이 차이를 세운다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 1 | `datacenter` | 데이터 센터 | — | 1 | 서버가 랙에 놓이고 전용 전원·냉각·네트워크를 갖춘 시설 — 온-프레미스 데이터 센터와 같은 종류지만 훨씬 크다(phase 100이 정한 표기 「온-프레미스」, 한 줄로 푼다). Azure는 세계 곳곳에 데이터 센터가 있지만 **고객은 데이터 센터 하나하나를 직접 다루지 않는다** — 데이터 센터는 지역과 가용성 영역으로 묶이고, 고객은 그 단위로 고른다(두 낱말을 한 줄씩 푼다). 이 주제의 첫 개념이라 **서버**·**랙**·**리소스**를 짧게 푼다. 덤프: 데이터 센터만 묻는 문항은 없다 — 지역·가용성 영역 문항(NO.20·72·156)이 이 개념을 전제한다 |
| 2 | `region` | 지역 | — | 1 | 지구 위의 한 지리적 영역으로, 가까이 있고 대기 시간이 짧은 네트워크로 이어진 데이터 센터 하나 이상을 담는다. Azure가 지역 안의 리소스를 배정하고 관리해 부하를 고르게 한다. **리소스를 배포할 때 지역을 고르는 경우가 많다**. 일부 서비스·VM 기능(특정 VM 크기 등)은 일부 지역에만 있다. 지역을 고르지 않는 서비스도 있다(step 0이 확인한 예 — 설계 때 본 것: Microsoft Entra ID·Azure DNS, 이름마다 한 줄로 푼다). 지역은 **지리**(데이터를 둘 수 있는 경계 — step 0 결과대로) 하나 안에 있다는 것과, 지역을 고를 때 따질 것(사용자와의 거리에 따른 대기 시간, 가용성 영역 지원, 데이터 상주)은 step 0 결과대로. **대기 시간**을 한 줄로 푼다. **이 개념에 도식 `AzureRegionDiagram`을 붙인다**. 덤프: NO.221·267(정의), NO.243(배포할 때 고르는 단위). 지역 수·데이터 센터 수는 쓰지 않는다(「배경」) |
| 3 | `availability-zones` | 가용성 영역 | — | 2 | 한 지역 안에서 물리적으로 떨어진 데이터 센터(하나 이상)로, 전원·냉각·네트워크가 서로 독립이다. 격리 경계라서 영역 하나가 멈춰도 나머지는 계속 동작한다. 영역끼리는 빠른 사설 네트워크로 이어진다. 가용성 영역을 지원하는 지역에는 **최소 셋**이 있고, 모든 지역이 지원하지는 않는다. 쓰는 법: VM·스토리지·데이터베이스를 한 영역에 두고 같은 지역의 다른 영역에 복제한다 — 복제와 영역 사이 데이터 전송에 비용이 들 수 있다. **영역이 막지 못하는 것**: 한 지역의 여러 영역에 함께 미칠 만큼 큰 사건 — 그 대비는 다른 지역에 두는 것이다(지역 쌍의 이름은 쓰되 한 줄로 풀고, 「다음 개념」이라 하지 않는다). 온-프레미스에서는 중복 하드웨어를 사서 유지해야 했다는 대비는 step 0 결과대로. **중복**(같은 것을 하나 더 두어 하나가 멈춰도 다른 것이 일하게 함)을 한 줄로 푼다. **이 개념에 도식 `ZoneIsolationDiagram`을 붙인다**. 덤프가 가장 많이 묻는 개념이다: NO.20·27·72·82·156·233·340·455·461·478. NO.493(SLA 수치)은 쓰지 않는다 |
| 4 | `zone-service-categories` | 가용성 영역 서비스 범주 | `availability-zones` | 2 | **목록 개념** — 소개 문단(가용성 영역을 지원하는 서비스는 영역을 쓰는 방식에 따라 셋으로 나뉜다) 뒤 항목 셋. 영역 서비스: 리소스를 영역 하나에 고정한다(VM·관리 디스크·IP 주소 — 예는 step 0 결과대로) — 다른 영역에 대비하려면 고객이 영역마다 둔다. 영역 중복 서비스: 플랫폼이 여러 영역에 저절로 복제한다(영역 중복 스토리지·SQL Database — step 0 결과대로). 비지역 서비스: 특정 지역에 묶이지 않아 영역 전체·지역 전체의 중단에도 계속 쓸 수 있다(개념 2의 「지역을 고르지 않는 서비스」와 같은 것이면 그렇게 되짚는다). 범주 이름·항목 셋의 현행 표기는 step 0 결과대로(현행 문서가 이름을 바꿨으면 현행을 따른다). 영역 서비스와 영역 중복 서비스가 **누가 복제하는가**로 갈린다는 것을 4절대로. 덤프: NO.320·502 |
| 5 | `region-pairs` | 지역 쌍 | — | 3 | Microsoft가 같은 지리 안의 두 지역을 짝지어 둔 것 — **고객이 짝을 고를 수 없다**. 짝끼리 떨어진 거리(Learn 단원은 300마일 이상)는 step 0이 현행 문서로 확인한 대로. 짝지은 까닭: 자연재해·정전처럼 지역 전체에 미치는 사건에 대비해 리소스를 복제할 수 있다. **모든 서비스가 저절로 복제하거나 장애 조치하지는 않는다** — 그런 서비스는 고객이 복구와 복제를 구성한다. 덧붙은 이점(큰 중단 때 짝마다 한 지역을 먼저 복구, 계획된 업데이트는 짝의 한 지역씩, 데이터는 같은 지리 안에 남음 — 예외까지 step 0 결과대로). 짝이 없는 지역(새 지역에 많다 — 가용성 영역을 주된 대비로 쓴다)과 한 방향 짝은 step 0 결과대로 한 줄씩. **장애 조치**(멈춘 쪽의 일을 다른 쪽이 이어받는 것)를 한 줄로 푼다. 실제 지역 쌍의 예는 step 0이 현행 문서로 확인한 것만. **이 개념에 도식 `RegionPairDiagram`을 붙인다**. 덤프: NO.72(여러 지역에 배포) |
| 6 | `sovereign-regions` | 소버린 지역 | — | 3 | 주 Azure 인스턴스와 격리된 Azure 인스턴스 — 규정 준수나 법적인 이유로 쓴다. **인스턴스**를 한 줄로 푼다(공식 문서의 말로). 예 둘: 미국 정부 기관과 그 협력사를 위한 지역(Azure Government — 물리·논리적으로 격리, 심사를 거친 미국인이 운영, 추가 규정 인증), 21Vianet과의 협력으로 제공되는 중국의 지역(Microsoft가 데이터 센터를 직접 유지하지 않는다). 현행 이름(설계 때 본 것: 「Microsoft Azure operated by 21Vianet」)과 한국어 표기는 step 0 결과대로. 소버린 지역은 다른 지역처럼 동작하지만 서비스·기능이 적을 수 있다는 것은 step 0 결과대로. 덤프: NO.45·178·234·281·392·462. **NO.468의 Azure Germany는 쓰지 않는다**(지원 종료 — step 0이 D 항목으로) |

### `azure-resource-hierarchy` — 리소스 계층 (공식 학습 가이드 「Describe Azure resources and resource groups」·「Describe subscriptions」·「Describe management groups」·「Describe the hierarchy of resource groups, subscriptions, and management groups」)

가장 아래(리소스)에서 위로 쌓는다 — 리소스 → 리소스를 담는 리소스 그룹 → 리소스 그룹을 담는 구독 → 구독을 묶는 관리 그룹 → 네 층이 이어진 계층과 상속.
학습자가 가장 많이 헷갈리는 것은 **「무엇을 어느 층에서 나누는가」**다 — 함께 지울·함께 권한을 줄 리소스는 리소스 그룹, 청구서와 액세스 규칙을 가르는 것은 구독, 여러 구독에 같은 규칙을 거는 것은 관리 그룹.
문항이 이 셋을 보기로 둘 때는 고를 조건(무엇을 따로 하려는가)을 문제문에 준다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 7 | `resource` | 리소스 | — | 5 | Azure의 기본 구성 요소 — Azure에서 만들거나 갖추거나 배포하는 것은 무엇이든 리소스다. 예: VM·가상 네트워크·데이터베이스(step 4 결과대로 — 이름마다 한 줄로 푼다). 이 주제의 첫 개념이라 **VM**을 짧게 푼다. 리소스는 리소스 그룹 하나에 속한다는 것은 한 줄로만(리소스 그룹의 규칙은 개념 8의 몫 — 그 말을 쓰지 않는다). 리소스마다 지역을 골라 배포한다는 것(지역은 이 주제에서 한 줄로 다시 푼다)은 step 4 결과대로. 덤프: NO.444 |
| 8 | `resource-group` | 리소스 그룹 | — | 5 | 리소스를 묶는 그룹. **리소스는 정확히 한 리소스 그룹에 속한다** — 일부 리소스는 다른 그룹으로 옮길 수 있지만 한 번에 한 그룹에만 속한다. 그룹 안에 그룹을 둘 수 없고, 만든 뒤 이름을 바꿀 수 없다. **그룹에 한 일은 안의 리소스 모두에 미친다** — 그룹을 지우면 안의 리소스가 모두 지워지고, 그룹에 준(거둔) 접근 권한은 안의 리소스 모두에 적용된다. 쓰는 예: 잠깐 쓰는 개발 환경을 한 그룹에 모아 끝나면 그룹째 지운다, 프로젝트마다 그룹을 나눠 팀마다 자기 리소스만 본다. 정해진 짜는 법은 없다. 리소스 그룹 자체에도 지역이 있고, 그 지역과 안의 리소스의 지역이 달라도 된다는 것·다른 그룹의 리소스끼리 통신할 수 있다는 것은 step 4 결과대로. **리소스 그룹은 논리적 묶음이라, 리소스를 여러 그룹에 나눠도 데이터 센터 장애에 대비되지 않는다**(NO.87 — step 4 결과대로; 대비는 가용성 영역이라는 것을 한 줄로 풀어 쓴다). **이 개념에 도식 `ResourceGroupScopeDiagram`을 붙인다**. 덤프: NO.136·164(중첩·소속·지역), NO.366·472(그룹 사이의 접근·그룹 삭제), NO.54·93·309·335(지역·권한 상속 — 태그 부분은 쓰지 않는다), NO.87·159·270 |
| 9 | `subscription` | 구독 | — | 6 | 관리·청구·규모의 단위. Azure를 쓰려면 구독이 있어야 한다 — 구독이 Azure 제품과 서비스에 접근하게 해 주고 요금을 매기는 단위가 된다. 구독은 Azure 계정에 이어진다 — 계정은 Microsoft Entra ID(이 주제에서 한 줄로 푼다) 안의 ID다. 계정 하나에 구독이 여럿일 수 있고 하나는 있어야 한다. 구독이 리소스 그룹을 담는다(이 주제의 개념 8을 되짚는다). 구독과 **테넌트**(조직 하나를 위한 Microsoft Entra ID의 전용 인스턴스 — step 4 결과대로)의 관계(구독은 테넌트 하나를 믿고, 테넌트 하나에 구독이 여럿일 수 있다 — step 4 결과대로). 리소스(예: VM)를 다른 구독으로 옮길 수 있는지, 구독을 합칠 수 있는지는 step 4 결과대로 — 공식 문서가 말하지 않으면 쓰지 않는다. 덤프: NO.40·64·289(구독과 계정), NO.79, NO.113·318, NO.369(테넌트), NO.48·51·121·249(다른 구독으로 옮기기) |
| 10 | `subscription-boundaries` | 구독 경계 | `subscription` | 6 | **목록 개념** — 소개 문단(계정이 구독을 여럿 두면 구독마다 청구 방식과 액세스 정책을 달리 정할 수 있다 — 구독이 두 가지 경계가 되기 때문이다) 뒤 항목 둘. 청구 경계: 구독마다 청구 보고서와 청구서가 따로 나온다 — 청구 요구가 다르면 구독을 나눈다. 액세스 제어 경계: 액세스 관리 정책이 구독 수준에서 적용된다 — 예: 개발용 구독과 운영용 구독을 두어 지출 한도·액세스 규칙을 달리한다. 항목 다음에(목록 개념의 항목은 혼자 서지 않는다 — ADR-046) 구독을 더 만드는 까닭(환경 — 샌드박스·개발·테스트·운영, 팀·워크로드, 청구)을 한 문단으로. **운영 환경**을 한 줄로 푼다. 항목 이름은 step 4 결과대로. **이 개념에 도식 `SubscriptionBoundaryDiagram`을 붙인다**. 덤프: NO.59·154(부서별로 청구를 나눔) |
| 11 | `management-group` | 관리 그룹 | — | 7 | 구독 위에 있는 묶음 — 구독이 많고 여러 팀·지역에 걸칠 때, 구독들을 관리 그룹으로 묶고 거버넌스 조건(액세스 정책, 규정 준수 규칙 — **거버넌스**를 이 주제에서 한 줄로 푼다)을 그룹에 건다. 그룹 안의 구독은 그 조건을 **저절로 물려받는다**. 관리 그룹은 여러 단계로 중첩할 수 있다(Learn 단원은 루트와 구독 단계를 빼고 6단계 — step 4 결과대로). 테넌트마다 최상위 **테넌트 루트 그룹**이 하나 있고 다른 관리 그룹과 구독은 모두 그 아래로 모인다. 디렉터리 하나가 지원하는 관리 그룹 수(10,000)·관리 그룹과 구독마다 부모는 하나라는 것은 step 4 결과대로. 덤프: NO.479 |
| 12 | `hierarchy` | 관리 그룹·구독·리소스 그룹 계층 | — | 7 | 관리 그룹 → 구독 → 리소스 그룹 → 리소스의 네 층(step 4가 확인한 공식 문서의 「범위」 네 층). **위층에 건 설정은 아래층으로 상속된다**. Learn 단원의 쓰임 둘: (1) 관리 그룹에 정책을 건다 — 예: 「운영」 관리 그룹에서 VM을 둘 수 있는 지역을 한 곳으로 제한하면 그 아래 모든 구독의 VM에 적용되고, 리소스·구독 소유자가 그것을 바꿀 수 없다. (2) 관리 그룹에 역할 할당을 한 번 만들어 여러 구독에 접근 권한을 한꺼번에 준다 — 아래의 하위 관리 그룹·구독·리소스 그룹·리소스가 모두 물려받는다. **정책**(Azure Policy)과 **역할 할당**(Azure RBAC)을 이 주제에서 한 줄씩 푼다(자세한 것은 다른 주제의 몫이지만 그 말을 쓰지 않는다). 아래층에서 준 권한이 위층으로 올라가지 않는다는 것은 step 4 결과대로. name은 step 4가 한국어판 절 제목(「관리 그룹, 구독 및 리소스 그룹 계층 구조」)을 보고 명사구로 정한다. **이 개념에 도식 `HierarchyInheritanceDiagram`을 붙인다**. 덤프: NO.54·93·335(권한 상속), NO.479 |

**문항 수**: 개념마다 하나, 다섯 개념(`region`·`availability-zones`·`region-pairs`·`resource-group`·`hierarchy`)만 둘 — 모두 17개, `az039`~`az055`.
문항은 개념 순서대로 `questions.json` 끝에 붙인다. step마다 맡는 id:

| step | id | 개념별 수 |
|---|---|---|
| 1 | `az039`~`az041` | 1 하나, 2 둘 |
| 2 | `az042`~`az044` | 3 둘, 4 하나 |
| 3 | `az045`~`az047` | 5 둘, 6 하나 |
| 5 | `az048`~`az050` | 7 하나, 8 둘 |
| 6 | `az051`~`az052` | 9 하나, 10 하나 |
| 7 | `az053`~`az055` | 11 하나, 12 둘 |

**예시 값 — 두 주제가 함께 쓴다:**

- **조직 이름**은 「회사 A」·「회사 B」처럼 이름표로 쓴다. 실제 회사 이름을 예로 들지 않는다(Azure·Microsoft와 21Vianet처럼 공식 문서가 사실로 드는 이름은 예외).
- **지역 이름표**는 「지역 A」·「지역 B」, **가용성 영역**은 공식 문서처럼 「영역 1」·「영역 2」·「영역 3」, **VM 이름표**는 `VM 1`·`VM 2`·`VM 3`. 수량(VM 대수)은 예시 값이라고 본문이나 캡션에서 밝힌다.
- **리소스 그룹·구독·관리 그룹의 이름**은 쓰임을 드러내는 이름표로 쓴다 — 예: 리소스 그룹 「개발 환경」·「운영」, 구독 「개발」·「운영」, 관리 그룹 「운영」·「개발」. 이름표라고 본문에서 밝힐 필요는 없지만 본문과 도식이 같은 이름을 쓴다.
- **공식 문서가 정한 값**(가용성 영역 최소 셋, 관리 그룹 중첩 단계·최대 수, 지역 쌍의 거리)은 출처 step이 확인한 것만 쓴다. 지역 수·데이터 센터 수·가격·서비스별 SLA 수치는 쓰지 않는다.
- **서비스 이름**은 Microsoft 한국어 문서 표기로 쓰고, 영문 이름이 다르면 처음 나올 때 괄호에 적는다(출처 step이 표기를 확인한다).

도식은 본문에 나온 예시 값만 쓴다(ADR-038) — 그러니 이 값들을 도식에 쓰려면 그 개념의 본문에 먼저 쓴다.

## 출처

- 사실은 `docs/source/azure/official.md`(Microsoft 공식 문서에서 확인한 사실과 URL)에서만 가져온다. 출처 step(0·4)이 그 주제에 필요한 사실을 확인해 남긴다. 그 summary가 개념마다 무엇을 쓰고 무엇을 쓰지 않는지 적는다.
- 덤프·용어집의 주장이 `docs/source/azure/corrections.md`에 걸려 있으면 **고친 쪽**을 쓴다. 덤프·용어집에만 있고 공식 문서가 말하지 않는 주장은 쓰지 않는다.
- 개념 step에서 그 밖의 사실이 필요하면, 허용한 출처(`docs/source/azure/CLAUDE.md` 「허용하는 출처」)를 실제로 열어 확인하고 `official.md`에 URL과 「쓰인 곳」을 적은 뒤 쓴다.
  받은 문서는 `python -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다).
  확인하지 못한 사실은 쓰지 않는다. 블로그·Microsoft Q&A·Tech Community·위키백과·자격증 교재·덤프 사이트는 쓰지 않는다.
- **`official.md`의 「쓰인 곳」**: 출처 step은 아직 개념이 없으므로 「쓰일 곳」으로 적는다. 그 개념을 만든 step이 자기 개념 id가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.
- **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 덤프의 문제문·보기·해설, 용어집 설명, 공식 문서(특히 한국어판)의 문장을 옮기지 않는다. `check-verbatim --subject azure`는 하한선일 뿐이다.
- 덤프 문항을 그대로 문항으로 만들지 않는다 — 덤프가 같은 사실을 물어도 상황과 문장은 직접 만든다(ADR-021과 같은 이유).

설계 세션이 받아 둔 공식 문서(`docs/source/azure/raw/official/`, 영문판과 한국어판 `ko-…`):

- Learn 「Describe the core architectural components of Azure」 단원 5(물리 인프라)·6(관리 인프라) — `learn-describe-core-architectural-components-of-azure-{5,6}-….md`. `official.md`에 phase 100·101이 둔 항목이 있다(지역·리소스·구독의 정의 몇 줄).
- Azure reliability 「What are Azure regions?」 — `docs-reliability-regions-overview.md`(phase 101). 지역·지리·지역을 고를 때 따질 것·짝이 없는 지역·비지역 서비스가 있다.
- AZ-900 학습 가이드 — `az-900-study-guide.md`.

설계 때 열어 보고 받지 않은 것(출처 step이 받는다 — 주소는 출발점이고, 옮겨졌으면 같은 내용의 현행 쪽을 찾는다):
주제 6 — Azure reliability 「What are availability zones?」(`learn.microsoft.com/azure/reliability/availability-zones-overview`), 「Azure region pairs and nonpaired regions」(`…/reliability/regions-paired`), 「Azure nonregional services」(`…/reliability/regions-nonregional-services`),
Azure Government 「What is Azure Government?」(`learn.microsoft.com/azure/azure-government/documentation-government-welcome`), 21Vianet이 운영하는 Azure의 개요(`learn.microsoft.com/azure/china/`).
주제 7 — Azure Resource Manager 개요(`learn.microsoft.com/azure/azure-resource-manager/management/overview`), 리소스 그룹 관리(`…/management/manage-resource-groups-portal`), 리소스 옮기기(`…/management/move-resource-group-and-subscription`), 태그(`…/management/tag-resources`),
Microsoft Entra 「Associate or add an Azure subscription to your Microsoft Entra tenant」(`learn.microsoft.com/entra/fundamentals/how-subscriptions-associated-directory`), 관리 그룹 개요(`learn.microsoft.com/azure/governance/management-groups/overview`), Azure RBAC 범위(`learn.microsoft.com/azure/role-based-access-control/scope-overview`).

## 글 — `docs/WRITING_GUIDE.md`를 따른다(ADR-056, ADR-060)

- `summary`는 WRITING_GUIDE 2절 — 처음 보는 사람이 일상 말로 「무엇이고 무슨 역할인지」 알게 하는 한 문장. 다른 전문용어를 알아야 이해되면 안 되고, 제목 낱말을 되풀이하는 순환 정의, 숫자·분류를 넣지 않는다.
- `paragraphs`는 3절의 흐름(개념 → 원리 → 예시 → 특징)을 필요한 만큼. 누가·무엇을·어디서 어디로를 빠뜨리지 않는다. 같은 말을 되풀이하지 않는다.
  헷갈리는 짝은 4절대로 무엇이 다르고 왜 나눠 부르는지를 말한다 — 이 phase의 짝: 데이터 센터와 가용성 영역, 지역과 가용성 영역, 가용성 영역과 지역 쌍(무엇이 어떤 장애를 막는가),
  영역 서비스와 영역 중복 서비스, 지역과 소버린 지역, 리소스 그룹과 구독, 청구 경계와 액세스 제어 경계, 구독과 관리 그룹, 관리 그룹과 테넌트 루트 그룹.
- **이 주제 화면만 읽고 뜻이 서야 한다.** 학습자는 주제 목록에서 아무 주제로나 바로 들어오므로, 다른 주제에 정의가 있다는 것은 도움이 되지 않는다.
  이 주제 안에서 처음 쓰는 낱말(리소스, VM, 지역, 데이터 센터, 온-프레미스, 중복, 장애 조치, Microsoft Entra ID, 정책, 역할 할당 등)은 그 자리에서 짧게 푼다. 앞 phase 주제가 푼 낱말도 이 주제에서는 다시 푼다.
  앞 step이 같은 주제에서 이미 푼 낱말은 다시 풀지 않는다 — 쓰기 전에 그 주제의 앞 개념을 읽는다. 도식의 라벨·곁말·캡션도 화면의 글이다.
- **진행 안내 문장을 쓰지 않는다**(「배경」). 다른 주제나 뒤 개념을 가리키는 말이 필요하면 그 낱말을 그 자리에서 한 줄로 풀고, 「~에서 다룬다」·「~에서 자세히」·「다음 개념의」·「(다음 개념)」을 붙이지 않는다.
- 비유는 이해를 돕는 데만 쓰고, 실제 동작과 다르면 그 자리에서 밝힌다. 비유로 사실을 대신하지 않는다.
- `name`은 명사구다(ADR-030 기준 1). **굵은 글씨(`**`)는 목록 항목의 이름에만** 쓴다(ADR-055와 같은 규칙, ADR-060). 목록 개념은 소개 문단 하나 뒤에 `- **한국어 이름**(English name)은 …` 꼴 항목을 두고, 항목은 혼자 서지 않는다(ADR-046).
  `EmphasizedText`는 `**…**` 안의 백틱을 코드로 그리지 않으므로 굵은 이름 안에 백틱을 넣지 않는다.
- 관용 표현(`돌린다`·`띄운다`·`태운다`·`물린다`)을 쓰지 않고 하는 일을 그대로 쓴다(ADR-030 기준 5). 평서문 「~다」로 쓴다. 「A vs B」 제목은 쓰지 않는다.
- 공식 문서의 마케팅 어조(「지능적으로」, 「원활한」, 「강력한」)를 옮기지 않는다 — 무엇이 어떻게 되는지를 쓴다.

## 문항 — WRITING_GUIDE 「객관식 문제의 문장과 선택지 구성 원칙」과 ADR-054·ADR-030

가장 중요한 원칙: **질문은 쉽게 이해할 수 있도록, 선택은 충분한 생각이 필요하도록.**

1. **정의에서 이름만 지운 「무엇인가?」 꼴을 내지 않는다.** 개념에 맞는 방식 하나를 고른다 — 개념 확인, 원리 이해, 상황 적용, 개념 비교, 원인과 결과. 고른 방식과 이유를 summary에 적는다.
2. **사람이 사람에게 묻듯 쓴다.** 소리 내어 읽어 어색하거나 한 번에 이해되지 않으면 다시 쓴다. 쉼표로 조건을 줄줄이 잇는 압축문을 쓰지 않는다.
3. 무엇을 묻는지는 첫 읽기에 분명하고, 어려움은 보기를 고르는 데서 나온다. 문제문을 비틀어 난이도를 만들지 않는다.
4. 보기는 기술적으로 갈리고 정답은 하나다. 비슷한 개념을 보기로 둘 때는 그 차이를 판단할 조건을 문제문에 준다. 오답은 문제문이 묻는 범주 안에서, 실제로 헷갈리는 것에서 고른다(ADR-030 기준 4).
   정답의 이름이나 그 일부를 문제문에 쓰지 않는다(기준 3). 보기 넷은 서로 다르다.
   **두 개념이 함께 맞게 읽힐 수 있는 상황을 만들지 않는다** — 이 phase에서 특히: 「데이터 센터 하나가 멈춰도 계속 쓰고 싶다」는 가용성 영역에도 다른 지역에 두는 것에도 맞다.
   「장애의 범위」(데이터 센터 하나·영역 하나 / 지역 전체)와 「가장 적은 비용·같은 지역 안」 같은 조건을 문제문에 넣어 하나로 고르게 한다.
   「권한을 한꺼번에 주고 싶다」는 리소스 그룹·구독·관리 그룹 모두에 맞을 수 있다 — 무엇에 걸쳐 주려는지(한 프로젝트의 리소스들 / 여러 구독)를 문제문에 준다.
5. 판단에 쓰이지 않는 정보(전문용어·수치·조건·부정문)를 늘어놓지 않는다. 판단에 필요한 조건은 남긴다.
6. **형식(ADR-054)**: 흔히 오해하는 것을 바로잡으면 예/아니요, 비슷한 개념을 구별하거나 상황에 맞는 것을 고르면 4지선다. 같은 범주의 그럴듯한 오답 셋을 출처 안에서 쓸 수 없으면 예/아니요.
   예/아니요는 주장 하나, 이중 부정·「항상」「절대」 금지, 「~인가요?」「~나요?」로 끝난다. **아니요 문항의 해설은 무엇이 틀렸는지에서 그치지 않고 맞는 사실을 가르친다.**
   예/아니요의 주장은 맞는 쪽으로도 틀린 쪽으로도 세울 수 있다 — 아래 균형을 맞추려고 주장의 방향을 고른다.
7. **문항은 풀면서 배우게 쓴다.** 문항은 섞여 나오고 랜덤 세트는 일부만 뽑으므로 혼자 읽혀야 한다. 문제문이 이 주제 밖의 낱말을 풀이 없이 전제하지 않는다(기준 5).
   상황에 쓰는 이름(「회사 A」)·숫자는 사실 주장이 아니어야 하고, 그 상황의 정답은 출처의 사실로 정해져야 한다. 문항 상황은 본문 예와 다르게 만들어 본문 문장을 외워서 풀리지 않게 한다.
8. **해설은 187자 이상**이고 그 개념을 가르치는 글이다(ADR-026·027). 4지선다는 정답이 왜 맞는지와 오답 셋이 각각 왜 아닌지를 담는다. 약어는 해설마다 처음 쓸 때 풀어 쓴다.
   같은 말을 늘려 길이를 채우지 않는다. 해설의 사실은 개념 본문이나 `official.md`에 있는 것이다.
9. **균형 — step이 끝났을 때 과목 전체에서**: 예/아니요의 예와 아니요 수 차이 **1 이하**, 4지선다의 정답 위치(`answerIndex` 0~3) 수의 최대·최소 차이 **2 이하**.
   phase 102 시작 때는 문항 38개, 예 10·아니요 11, 정답 위치 4/5/4/4다.
10. 한 문항은 개념 하나만 묻는다(ADR-030 기준 2). 같은 개념의 두 문항은 서로 다른 것을 묻는다. 앞 phase의 문항(특히 `az020` 안정성, `az015` 고가용성)과 같은 것을 묻지 않는다.
11. 덤프 문항의 문장·보기 구성을 옮기지 않는다. 덤프가 되풀이하는 꼴(「다음 진술이 맞으면 예」 세 개 묶음, 밑줄 친 말 고치기, 짝짓기)도 쓰지 않는다 — 앱의 형식은 4지선다와 예/아니요 하나씩이다.

검수 — 문항마다 WRITING_GUIDE 객관식 7항의 여섯 질문으로 다시 읽고, 보기마다 「이것이 정답이라고 우길 수 있는가」를 따진다. 문제문만 읽고 보기를 보지 않은 채 정답 글자를 짐작할 수 있지 않은지도 본다.

## 도식 — 구조가 있는 개념 여섯에 하나씩

선례는 앞 phase의 Azure 도식(`HybridCloudDiagram`·`CompositeSlaDiagram`·`SharedResponsibilityDiagram`과 그 `.test.tsx`, `src/data/azure/visuals/*.json`)과
네트워크 도식(`MacTableDiagram`·`CastTypesDiagram`·`ArpCacheDiagram`)이다. 그룹 박스 안에 그룹 박스를 두는 짜임은 AWS 도식 `VpcPathsDiagram`(VPC 안의 서브넷)을, 가용 영역 하나의 장애를 곁말과 흐림으로 보이는 짜임은 `NatCountDiagram`(`failedGroup`)을 본다 — 짜임만 참고하고 AWS의 낱말·색은 가져오지 않는다.
규칙의 근거는 UI_GUIDE 「도식 전용 색상」·「도식」 절 전체, ADR-036·037·038·047·048, `src/components/diagrams/CLAUDE.md`다.
사용자 미리보기 승인을 받지 않고 **step이 좌표를 설계한다.** 그래서 기계 검사를 모두 통과시키고 설계를 summary에 남긴다.

| 도식 | JSON 키 | 개념 | step | 요지 |
|---|---|---|---|---|
| `AzureRegionDiagram` | `azure-region` | `azure-regions-zones.region` | 1 | 지역 안의 데이터 센터들, 배포할 때 고르는 것은 지역, 지역을 고르지 않는 서비스 |
| `ZoneIsolationDiagram` | `availability-zones` | `azure-regions-zones.availability-zones` | 2 | 영역 셋에 나눠 둔 VM — 영역 하나가 멈출 때와 지역 전체가 멈출 때 |
| `RegionPairDiagram` | `region-pairs` | `azure-regions-zones.region-pairs` | 3 | 같은 지리 안의 두 지역 — 지역 재해 때의 장애 조치, 계획된 업데이트 |
| `ResourceGroupScopeDiagram` | `resource-group` | `azure-resource-hierarchy.resource-group` | 5 | 그룹에 한 일(삭제·권한)이 안의 리소스 모두에, 리소스는 한 그룹에만 |
| `SubscriptionBoundaryDiagram` | `subscription-boundaries` | `azure-resource-hierarchy.subscription-boundaries` | 6 | 계정 하나의 구독 둘 — 청구서와 액세스 규칙이 구독마다 따로 |
| `HierarchyInheritanceDiagram` | `hierarchy` | `azure-resource-hierarchy.hierarchy` | 7 | 네 층의 나무 — 어느 층에 건 것이 어디까지 내려가나 |

- **파일**: 컴포넌트는 `src/components/diagrams/<이름>Diagram.tsx`(이름이 `Diagram.tsx`로 끝나야 교차 검사와 커버리지 테스트가 도식으로 본다), 테스트는 같은 이름의 `.test.tsx`.
  문구(물음형 제목 `question`·노드 라벨·그룹 라벨·곁말·캡션·`idleCaption`·`legend`·figure `label`·`svgLabel`·시나리오·`sources`)는 그 주제의 `src/data/azure/visuals/<주제 id>.json`의 `diagrams["<키>"]`에 둔다.
  `glossary`는 빈 배열이다(ADR-037). 도식 이름과 키는 위 표대로다 — 이미 있는 이름과 겹치지 않는 것을 골라 두었다.
- **사실은 본문에만 있는 것**(ADR-036). 캡션·곁말·라벨의 사실마다 그 개념(과 같은 주제의 다른 개념) 본문의 문단을 근거로 댈 수 있어야 한다. 예시 값도 본문에 나오는 것만(ADR-038).
  「회사 A」·「지역 A」·「VM 1」처럼 대상을 가르는 이름표는 사실이 아니므로 써도 된다. 글과 도식을 같은 step이 만드므로, 도식에 필요한 사실은 **글에 먼저 쓴다** — 출처에 없으면 그리지 않는다.
- **말**: 노드 라벨·곁말은 본문에 쓰인 말과 같게 쓴다. 라벨을 줄이거나 영문 약어로 바꿔 폭을 맞추지 마라 — 노드를 넓히거나 배치를 바꾼다.
- **글자 크기**: 노드 라벨 10, 그룹 라벨·곁말 9(viewBox 단위). `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`. 노드 높이는 32다(교차 검사기가 32로 본다 — 키 큰 노드를 만들지 말고 그룹 박스를 쓴다).
- **글자 폭의 여유**: `estimateTextWidth`는 반각 문자(영문·숫자·기호)를 0.55em으로 보지만 실제 화면에서는 0.61em까지 넓다(phase 72 화면 실측).
  반각 문자가 섞인 노드 라벨·곁말·그룹 라벨(예: `VM 1`, `영역 1`, `Microsoft Entra ID`)은 `estimateTextWidth` 값의 **1.15배**를 폭으로 잡아 노드 폭·배치를 정하고, 그 범위가 둘레 박스와 `viewBox` 안에 들게 한다.
- **그룹 박스 안의 그룹 박스**(지역 안의 가용성 영역, 지리 안의 지역 등): 안쪽 박스의 라벨 영역이 바깥 박스의 라벨 영역과 겹치지 않게 위아래로 떼고, 노드는 자기를 담는 가장 안쪽 박스의 라벨 영역 아래에 둔다.
  세로형(폭 280)에서 셋을 나란히 두기 어려우면 위아래로 쌓는다 — 폭을 맞추려고 라벨을 줄이지 않는다.
- **색**: 노드는 모두 회색(`stroke-disabled`, 선례와 같은 클래스). 도식 전용 두 색(`diagram-managed`·`diagram-resource`)은 AWS 계층의 뜻이라 쓰지 않는다. 초록·빨강·주황, 16진 색, 이모지, O/X도 쓰지 않는다(ADR-036).
  강조는 opacity로만 한다 — 선택 밖 노드 `0.25`, 그룹 박스는 흐려지지 않는다. 나쁜 상태(멈춘 영역·지역, 지워진 리소스)는 색이 아니라 곁말과 흐림으로 보인다(UI_GUIDE 「수량과 상태를 바꾸는 도식」).
- **두 배치**: 세로형(`viewBox` 폭 280)과 가로형(폭 440)을 함께 만든다. 가로형은 `useWideDiagram()`이 `true`일 때 쓴다. `nodes`·`wideNodes`·경로·`wideGroups`·`wideNotes`를 **한 줄에 하나씩 글자 그대로** 적는다 —
  반복문이나 계산으로 만들지 마라(교차 검사기가 글자로 읽는다). 노드 id·경로 id·시나리오·문구는 두 배치가 함께 쓰고, 고른 시나리오는 배치가 바뀌어도 유지된다.
- **경로**: 직교(M/H/V)만, 노드 변에서 시작하고 끝나며, 다른 노드 상자 안을 지나지 않는다. 늘 보이는 연결선도 같은 경로 선언 꼴(`'id': 'M…'`)로 적는다.
  화살표 마커는 선례와 같고 마커 id는 `useId`로 만든다. 그룹 라벨 영역을 지나는 선분이 없어야 한다. 경로는 그룹 박스가 아니라 노드에서 시작하고 끝난다.
  `phases/38-service-diagrams/tools/check-path-crossings.mjs`는 `*Diagram.tsx`의 `const nodes = [`·`const wideNodes = [` 블록에서 `{ id: '…', x: N, y: N, width: N` 순서를, 경로 객체에서 `'id': 'M…'`를 정규식으로 읽는다. 이 형식을 지켜라.
- **물음형 제목**(ADR-038): 그림이 답하는 것 하나를 학습자의 말로. step 문서의 예는 바꿔도 된다.
- **시나리오**: step 문서에 적힌 시나리오를 둔다. 시나리오가 있는 도식은 `전체`(아무것도 고르지 않음)에서 노드가 모두 선명하다.
  두 시나리오의 「선명한 노드 + 보이는 경로 + 보이는 곁말」이 같으면 그 시나리오는 아무것도 가르지 못한다 — 다르게 설계한다. 캡션은 20자를 넘는다(`visuals.test.ts`).
- **금지**: SVG 두 개를 그려 놓고 CSS로 하나를 숨기지 마라. 기준 폭 문자열(`'(min-width: 768px)'`)을 도식 파일에 쓰지 마라(ADR-047). 흐르는 점·자동 재생 같은 애니메이션 금지.
  공용 컴포넌트(`DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`)와 교차 검사기, `src/lib/svg-bounds.ts`를 고치지 마라.
- **registry**: `src/components/diagrams/registry.ts`의 `diagramsByConceptId`에 `'<개념 id>': <컴포넌트>` 한 줄씩. import는 기존 정렬(모듈 경로 알파벳순),
  키는 기존 Azure 키들(`azure-service-types.saas`) 뒤에 개념 순서대로.
- **주제의 시각 요소 파일**: 주제를 만드는 step(1·5)이 `src/data/azure/visuals/<주제 id>.json`(`{ "diagrams": {}, "tables": {}, "glossary": [] }` 꼴)을 만들고
  `src/data/azure/index.ts`의 `visualsByTopicId`에 `'<주제 id>'`로 넣는다. import 이름은 `azureRegionsZonesVisuals`·`azureResourceHierarchyVisuals`,
  import 줄은 경로 알파벳순, `visualsByTopicId`의 항목은 주제 순서대로.

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

## 파일 형식

- `topics.json`: 주제 객체는 2칸 들여쓰기, `concepts` 배열의 개념은 **한 줄에 하나**(6칸 들여쓰기 + `JSON.stringify(concept)`). 개념 키 순서는 `id`, `parentId`(있을 때), `name`, `summary`, `paragraphs`.
  주제 키 순서는 `id`, `title`, `importance`, `sourcePages`, `concepts`. 앞 step이 쓴 줄과 다른 주제의 줄은 글자 하나도 바꾸지 않고, 자기 개념을 그 주제의 `concepts` 끝에 덧붙인다.
  주제를 만드는 step은 바로 앞 주제 객체의 닫는 줄 `  }`을 `  },`로 바꾸고 그 뒤에 새 주제를 덧붙인다 — 그 밖의 기존 줄은 바꾸지 않는다.
- `questions.json`: `[` 다음 줄부터 **한 줄에 문항 하나**, 마지막 줄 뒤에 `]`. 키 순서 — 4지선다 `id`, `topicId`, `conceptId`, `format`, `prompt`, `choices`, `answerIndex`, `explanation` /
  예/아니요 `id`, `topicId`, `conceptId`, `format`, `prompt`, `answer`, `explanation`. 기존 줄은 바꾸지 않고 끝에 덧붙인다(마지막 기존 줄 끝에 쉼표 하나를 더하는 것은 예외).
- 파일 끝 줄바꿈 하나. 스크립트로 쓸 때 CRLF로 바꾸지 않는다.
- 이 저장소의 TDD 훅은 테스트 파일 없이 새 `.js`·`.ts` 파일을 쓰지 못하게 막는다. 데이터를 고치는 일회용 스크립트가 필요하면 저장소 밖(임시 디렉터리)에 `.cjs`로 두거나 `node -e`를 쓴다.

## 개념을 넣는 step(1·2·3·5·6·7)의 공통 AC와 검증

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject azure
node -e "const q=require('./src/data/azure/questions.json');const yn=q.filter(x=>x.format==='yes-no');const ch=q.filter(x=>x.format==='choice');const pos=[0,1,2,3].map(i=>ch.filter(x=>x.answerIndex===i).length);console.log('문항',q.length,'마지막',q[q.length-1].id,'정답 위치',pos.join('/'),'예',yn.filter(x=>x.answer).length,'아니요',yn.filter(x=>!x.answer).length)"
git status --porcelain
```

- `check-verbatim`은 「전사 이상 없음」이고 **원본 138개 이상을 대조했다고 나와야 한다**(`raw/`가 없으면 「건너뜀」으로 통과하므로 그때는 blocked로 멈춘다). 균형은 위 「문항」 9항,
  교차 검사기는 「교차 없음」이고 노드·경로 수가 이 step이 더한 만큼 늘어야 한다(앞 step이 끝났을 때의 수는 그 step summary에, phase 시작 값은 「배경」에 있다). **검사기를 고쳐서 통과시키지 마라.**
- **바뀌지 않아야 하는 것을 기계로 확인한다** — `git show HEAD:src/data/azure/topics.json`·`questions.json`과 `visuals/*.json`을 지금 파일과 node로 읽어, 기존 주제 객체·기존 개념·기존 문항·기존 도식 문구가 통째로 같은지 본다.
  AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `git diff --stat`에 나오지 않아야 한다.
- **글로 읽는다** — 그 주제의 개념을 처음부터 이 step의 개념까지 처음 배우는 사람의 눈으로 통독하고, 풀이 없이 처음 나오는 낱말을 세어 본다(도식 문구 포함). 진행 안내 문장이 없는지도 본다.
  불변식과 테스트는 이런 결함을 잡지 못한다. 브라우저 화면 실측은 하지 않는다(「배경」의 시간 제한 — phase 끝에 메인 세션이 한다).
- 이모지·O/X·빨강·초록·주황·도식 전용 두 색·16진 색·애니메이션·기준 폭 문자열이 새 파일에 없는지 `grep`으로 본다.
- 바뀐 파일은 `src/data/azure/topics.json`·`questions.json`·`visuals/<주제>.json`(과 주제를 만드는 step은 `src/data/azure/index.ts`), 새 도식 컴포넌트와 테스트,
  `src/components/diagrams/registry.ts`, `docs/source/azure/official.md`(「쓰인 곳」과 더한 사실), phase 메타데이터뿐이어야 한다.

**summary에 적을 것**(사용자가 이것을 읽고 판단한다): 개념마다 id·name과 **새 요약문 전문**, 문항마다 id·개념·형식·고른 방식·**문제문 전문**·정답, 균형 줄(예/아니요·정답 위치),
도식마다 이름·두 배치의 `viewBox`·시나리오별 선명한 노드·경로·곁말과 캡션 요지·물음형 제목·요점 테스트, 설계 의도와 달라진 점과 이유,
`official.md`에 더한 사실, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수, 걸린 시간의 어림. 끝에 「사용자 확인」 칸(없으면 「없음」).

## 출처 step(0·4)의 공통 형식

- `official.md` 항목: `## (phase 102) <문서 제목> — <단원·절 제목>`, URL 한 줄, 확인한 날, 직접 쓴 사실 한 줄씩(끝에 `— 「절 제목」`), **한국어 표기** 줄, 「쓰일 곳」(개념 id와 D·G 번호).
  앞 phase가 이미 둔 항목(예: Learn 단원 5·6, 「What are Azure regions?」)은 새 항목을 만들지 말고 그 항목에 사실 줄과 「쓰일 곳」을 덧붙인다 — 덧붙인 줄 끝에 `(phase 102)`.
  주제마다 「한국어 표기 정리 — `<주제 id>`」 항목을 하나 둔다(앞 phase의 항목이 본보기 — 개념마다 확정한 `name`과 근거 문서, 섞여 쓰인 표기와 고른 까닭).
- `corrections.md` 항목: `## D38 — <짧은 제목> (phase 102)`부터 덤프, `## G20 — … (phase 102)`부터 용어집. 짜임은 앞 phase 항목과 같다 — **덤프/용어집**(문항 번호·쪽-번호와 주장) · **공식 문서** · **처리**(고쳐 쓴다 / 한정해 쓴다 / 쓰지 않는다) · **쓰인 곳**.
  덤프 답이 공식 문서와 **맞는** 문항은 항목을 만들지 않는다 — summary에 「확인 결과 덤프가 맞다」로 적는다. 덤프끼리 답이 갈리는 문항은 항목으로 남긴다.
- 그림으로만 표시된 덤프 정답은 OCR 글자나 `index.json`의 `answer`를 믿지 말고 `raw/dump/img/`의 그림을 직접 본다(`docs/source/azure/CLAUDE.md` 「덤프의 그림을 보는 법」).
- **시간을 나눠 쓴다** — 주제마다 덤프 문항이 25~26개라 하나하나 끝까지 읽으면 30분을 넘길 수 있다(넘기면 step이 처음부터 다시 돈다).
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
- **서비스마다의 SLA 수치, 지역 수·데이터 센터 수를 본문·문항·도식에 쓰지 마라.** 이유: 약관 원문을 받아 확인할 수 없거나(SLA), 계속 바뀌는 수다(「배경」).
- **다른 주제의 몫(Azure RBAC·Azure Policy·태그·VM 확장 집합·가용성 집합)을 개념으로 세우거나 자세히 쓰지 마라.** 이유: 그 주제를 만드는 phase의 범위다. 필요한 낱말은 그 자리에서 한 줄로 푼다.
