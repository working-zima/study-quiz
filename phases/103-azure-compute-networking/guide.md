# phase 103 공통 안내 — Azure AZ-900 과목의 컴퓨팅과 앱 호스팅·가상 네트워크와 연결·네트워크 보호

이 phase의 **모든 step이 먼저 읽는 문서**다. step 문서는 자기 일의 세부만 적고, 과목 결정·세 주제의 개념 표와 글·문항·도식·파일 형식의 공통 규칙은 여기에 둔다.
step 문서와 이 문서가 다르면 step 문서를 따르고 그 차이를 summary에 적는다.

## 배경 — 다시 묻지 말 결정

Azure AZ-900 과목(`src/data/azure/`, ADR-060)은 phase 100에서 생겼고 phase 101·102가 주제 3~7을 더했다. 주제 지도(`docs/source/azure/topic-map.md`)의 주제 20개 가운데 1~7이 있고, **이 phase는 8·9·10을 더한다.**
8·9는 공식 학습 가이드의 묶음 「Describe Azure compute and networking services」를 채우고, 10은 가이드 밖이지만 용어집·덤프가 함께 묻는 현행 서비스(NSG·Azure Firewall·DDoS Protection)다(주제 지도의 `*`).

**앞 phase가 남긴 것(이 phase의 출발점):**

- 주제 일곱 — `azure-cloud-computing`(개념 7)·`azure-cloud-models`(5)·`azure-cloud-benefits`(7)·`azure-sla-lifecycle`(6)·`azure-service-types`(4)·`azure-regions-zones`(6)·`azure-resource-hierarchy`(6), 개념 41개.
- 문항 `az001`~`az055`(55개) — 예/아니요 예 15·아니요 16, 4지선다 정답 위치(`answerIndex` 0~3) 6/6/6/6.
- 도식 13개(`CapacityPlanningDiagram`~`HierarchyInheritanceDiagram`), 표 `PricingModelsTable`·`CloudModelsTable`·`ServiceTypesTable`.
- 출처 문서 `docs/source/azure/official.md`(항목 머리 `## (phase 100) …`~`## (phase 102) …`)와 `docs/source/azure/corrections.md`(D1~D50, G1~G26). **이 phase는 D51·G27부터 잇는다.**
- 검증 값(설계 때 잰 값): 테스트 229파일·5263개, 교차 검사 세로·가로 노드 1033·경로 710, `check-verbatim --subject azure` 원본 193개·단위 356개(설계 세션이 Learn 단원을 더 받아 원본이 179에서 늘었다 — 아래 「출처」).
- 실행 보고 `phases/100-…`·`101-…`·`102-azure-regions-resource-hierarchy/verification.md` — 출처 step이 정한 표기(「온-프레미스」, 「VM(가상 머신)」, 「공유 책임 모델」)와 그 이유가 있다.

**앞 주제가 이미 쓴 것 — 겹치지 않게:**

- `azure-cloud-computing.serverless`(phase 100)가 **서버리스와 Azure Functions의 기본**(이벤트가 올 때 실행, 실행한 만큼 요금, VM과의 책임 차이)을 이미 가르친다. 이 phase의 `functions`는 그것을 한 줄로 되짚고, 트리거의 종류·상태(Durable Functions)·서버리스가 아닌 호스팅으로 옮길 수 있다는 것처럼 **Functions에만 있는 것**을 쓴다. 문항 `az008`(Functions로 옮긴 뒤 남는 일)과 같은 것을 묻지 않는다.
- `azure-service-types.iaas`·`paas`(phase 101)가 **VM은 IaaS, App Service는 PaaS**와 둘의 운영 체제 책임 차이를 가르친다. 이 phase는 그 유형 이름을 한 줄로 풀어 쓰고(이 주제 화면만 읽고 뜻이 서야 한다), 같은 것을 다시 묻지 않는다(`az034`).
- `azure-cloud-benefits.scalability`·`elasticity`(phase 101)가 VM을 늘리고 줄이는 것을 가르친다. 확장 집합은 **같은 구성의 VM 묶음을 하나로 관리하고 부하를 나누는 서비스**라는 쪽을 쓴다(`az017`·`az018`과 같은 것을 묻지 않는다).
- `azure-regions-zones.availability-zones`(phase 102)가 가용성 영역을 가르친다. 가용성 집합은 **영역과 무엇이 다른가**(한 데이터 센터 안의 나눔 / 데이터 센터 사이의 나눔)를 세운다.
- 다른 주제의 몫: Azure Storage의 종류와 스토리지 계정의 세부는 `azure-storage`, Microsoft Entra ID는 `azure-identity`, 심층 방어·Azure RBAC은 `azure-security-model`, 비용(VM 중지와 할당 해제, Hybrid Benefit)은 `azure-cost-factors`의 몫이다 — 이 phase에서는 필요한 낱말만 한 줄로 푼다.

**사용자 결정(2026-10-30, 다시 묻지 마라):**

- **범위**: Microsoft Learn의 AZ-900 공식 학습 가이드(2026-07-20 기준)가 뼈대다. 가이드 밖이라도 **용어집에 있고 덤프도 묻는 현행 것**은 넣는다(주제 10이 이것이다).
  지원이 끝난 서비스·옛 이름은 빼거나 현행으로 고친다. 덤프만 묻는 것은 넣지 않는다.
- **도식**: **주제마다 최소 하나**, 그리고 구조·흐름이 있는 개념(VNet 연결 같은 것)에는 개념마다. 정의형 개념에는 없다. 비교표는 도식을 대신하지 않는다.
- 주제 지도(20개, 순서·별점·phase)는 사용자가 「고칠 것 없음」으로 확인했다.
- 사실의 기준은 **Microsoft 공식 문서**다. 덤프와 용어집은 범위·강조의 기준이자 사실 **후보**이고, 공식 문서와 다르면 공식 문서를 따르고 수정 이력에 남긴다(ADR-060).
  덤프 문항·용어집 문장은 옮기지 않는다(ADR-009, ADR-021과 같은 방식). 덤프는 시험 주관 기관의 문항이 아니므로 「자격시험은 ~로 본다」 줄을 쓰지 않는다.
- 용어는 **Microsoft 한국어 문서의 표기**를 따른다. 주제 id는 `azure-` 접두사, 별점은 덤프 출제 빈도(대표 문항 25 이상 ★★★, 13~24 ★★☆).
- **서비스마다의 SLA 수치는 쓰지 않는다**(phase 101 설계 — SLA 약관 원문을 받아 확인할 수 없다). 가격·지역 수도 쓰지 않는다.

**이 phase에서 정한 것(설계):**

- 개념 21개, 문항 30개(`az056`~`az085`), 도식 14개, 표 하나(`HostingOptionsTable`). 아래 「세 주제와 개념 21개」.
- **Learn 단원이 다루지만 쓰지 않는 것** — 덤프가 묻지 않고 학습 가이드의 줄에도 없는 세부라, 개념을 흐리게 한다:
  VM 크기 계열 표(B·D·E·F·M·L·N 계열)와 크기 이름 읽는 법(한 줄 — 「크기는 용도와 vCPU 수·메모리로 고른다」까지만), VPN 게이트웨이의 정책 기반·경로 기반 종류와 활성/대기·활성/활성 구성,
  ExpressRoute의 연결 모델 세 가지(IP VPN·지점 간 이더넷·코로케이션), 경로 테이블·사용자 정의 경로·BGP·네트워크 가상 어플라이언스, App Service의 모바일 앱 세부 기능.
- **덤프가 묻지만 쓰지 않는 것**: ExpressRoute가 동작하는 OSI 계층(NO.119 — 출처 step이 공식 문서로 사실만 확인해 `official.md`에 남기고, 본문에는 쓰지 않는다. 계층 모델을 이 주제에서 풀어야 해서 개념이 흐려진다),
  서비스 엔드포인트(NO.288 — 학습 가이드는 퍼블릭·프라이빗 엔드포인트만 든다. 출처 step이 덤프 답을 확인해 수정 이력에 남긴다), 심층 방어의 계층(NO.52·116·222 — `azure-security-model`의 몫).
- **도식은 구조·흐름이 있는 개념 14개에 하나씩**(아래 「도식」). 붙이지 않는 개념: `virtual-machines`(그 구조는 자식 `vm-resources`의 도식이 그린다)·`virtual-desktop`·`container-services`(목록 개념)·`app-service`(표를 붙인다)·`subnets`(부모 `virtual-network`의 도식이 서브넷을 그린다)·`vpn-connection-types`(부모 `vpn-gateway`의 도식이 시나리오로 그린다)·`azure-dns`(정의형).
- **ADR은 필요 없다.** 쓸 출처가 모두 이미 허용된 `learn.microsoft.com`·`azure.microsoft.com` 안에 있다. 허용 목록 밖의 곳이 꼭 필요하면 쓰지 말고 출처 step의 summary 「사용자 확인」에 적는다.

**실행 규칙:**

- **step 하나는 30분 안에 끝나야 한다.** `scripts/execute.py`가 step을 1800초에서 끊는다. 그래서 step은 **브라우저 화면 실측(개발 서버·headless Chrome·CDP)을 하지 않는다** —
  phase가 끝난 뒤 메인 세션이 모든 도식을 한꺼번에 실측한다. 시간을 아끼려고 검증 명령을 건너뛰지는 마라.
- 「주제마다 도식 하나 이상」을 `src/components/diagrams/azureDiagramCoverage.test.ts`가 지킨다. 그래서 **주제를 처음 만드는 step(1·6·11)이 그 주제의 첫 도식도 함께** 만든다.
  저장소의 Stop 훅(`scripts/hooks/codex-verify-gate.sh`)은 테스트가 실패한 상태로 step을 끝내지 못하게 한다.
- **진행 안내 문장을 쓰지 않는다.** 「다음 개념에서 다룬다」, 「뒤에서 자세히 다룬다」처럼 글의 진행만 알리는 말은 `src/data/azure/data.test.ts`의 진행 안내 테스트가 막는다.
  뒤 개념이나 다른 주제가 자세히 다룰 낱말이 지금 필요하면 그 자리에서 한 줄로 풀고 넘어간다. 「앞 개념에서 본 것처럼」 같은 되짚기는 써도 된다.
- **이 Mac의 Python은 HTTPS 인증서를 찾지 못한다.** 공식 문서를 받을 때 `CERTIFICATE_VERIFY_FAILED`가 나면 명령 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`을 붙인다. 이것은 인터넷 연결 문제가 아니다 — blocked로 멈추지 마라.

## step 열세 개

| step | 이름 | 하는 일 |
|---|---|---|
| 0 | `compute-sources` | 주제 8이 쓸 사실을 공식 문서로 확인해 `official.md`·`corrections.md`에 더한다 |
| 1 | `virtual-machines` | 주제 8을 만들고 개념 1·2의 글·문항과 도식 `VmResourcesDiagram` |
| 2 | `scale-availability-sets` | 개념 3·4의 글·문항과 도식 `ScaleSetDiagram`·`AvailabilitySetDiagram` |
| 3 | `desktop-containers` | 개념 5·6·7의 글·문항과 도식 `VmContainerDiagram` |
| 4 | `functions-app-service` | 개념 8·9의 글·문항과 도식 `FunctionTriggerDiagram`, 표 `HostingOptionsTable` |
| 5 | `networking-sources` | 주제 9가 쓸 사실을 확인해 두 문서에 더한다 |
| 6 | `virtual-network-subnets` | 주제 9를 만들고 개념 10·11의 글·문항과 도식 `VnetIsolationDiagram` |
| 7 | `peering-endpoints` | 개념 12·13의 글·문항과 도식 `VnetPeeringDiagram`·`PrivateEndpointDiagram` |
| 8 | `vpn-gateway` | 개념 14·15의 글·문항과 도식 `SiteToSiteVpnDiagram` |
| 9 | `expressroute-dns` | 개념 16·17의 글·문항과 도식 `ExpressRouteDiagram` |
| 10 | `protection-sources` | 주제 10이 쓸 사실을 확인해 두 문서에 더한다 |
| 11 | `network-security-groups` | 주제 10을 만들고 개념 18·19의 글·문항과 도식 `NsgAssociationDiagram`·`NsgRuleOrderDiagram` |
| 12 | `firewall-ddos` | 개념 20·21의 글·문항과 도식 `FirewallHubDiagram`·`DdosProtectionDiagram` |

## 세 주제와 개념 21개

주제 객체(`src/data/azure/topics.json`의 기존 일곱 주제 뒤에 이 순서로):

```json
{ "id": "azure-compute", "title": "컴퓨팅과 앱 호스팅", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }
{ "id": "azure-virtual-networking", "title": "가상 네트워크와 연결", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }
{ "id": "azure-network-protection", "title": "네트워크 보호", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }
```

별점: 주제 지도의 대표 문항 수가 `azure-compute` 16, `azure-virtual-networking` 15, `azure-network-protection` 20이다(셋 다 ★★☆). `data.test.ts`가 이 값을 본다.

개념 id는 `<주제 id>.<슬러그>`다. 표의 순서·슬러그·`parentId`를 바꾸지 않는다(바꿔야 할 이유가 있으면 바꾸지 말고 summary에 적는다).
**`name`은 출처 step(0·5·10)이 확인한 Microsoft 한국어 문서의 표기를 따른다** — 표의 이름은 잠정이다. 한국어판 안에서도 표기가 섞인 것(아래 「한국어판에서 본 것」)은 출처 step이 하나로 정하고 근거를 남긴다.
`parentId` 열의 값은 같은 주제의 슬러그다 — JSON에는 `azure-compute.virtual-machines`처럼 전체 id로 쓴다. 딸린 개념은 부모 바로 뒤에 이어 둔다(ADR-041).
「다룰 것」은 범위다. 문장은 직접 쓰고, 사실은 아래 「출처」대로 가져온다. 「step N 결과」라고 적힌 사실은 그 step의 summary와 출처 문서에 적힌 처리를 따른다 —
확인되지 않았으면 쓰지 않는다. 「덤프」 뒤의 `NO.`는 덤프 문항 번호다(`docs/source/azure/dump-topics.tsv`·`raw/dump/dump.md`).

**한국어판에서 본 것(설계 때, 출처 step이 다시 확인한다):** Learn 「Describe Azure compute and networking services」·「Describe Azure networking services」 한국어판은
「가상 머신 확장 집합」과 「확장 집합」, 「가용성 집합」, 「장애 도메인」·「업데이트 도메인」, 「퍼블릭 엔드포인트」·「프라이빗 엔드포인트」, 「공용 IP」, 「VPN 게이트웨이」·「가상 네트워크 게이트웨이」,
「사이트 간」과 「지점 및 사이트 간」(「지점 간」도 섞인다), 「연결 공급자」·「회로」, 「별칭 레코드」, 「네트워크 보안 그룹」으로 적는다. 엔드포인트의 「퍼블릭」과 IP 주소의 「공용」이 한 단원 안에서 갈린다 — 출처 step이 제품 문서 한국어판까지 보고 정한다.

### `azure-compute` — 컴퓨팅과 앱 호스팅 (공식 학습 가이드 「Compare compute types」·「Describe virtual machine options」·「Describe the resources required for virtual machines」·「Describe application hosting options」)

순서는 Learn 단원과 같다 — 가장 많이 맡는 VM에서 시작해(VM과 그에 필요한 리소스 → VM을 여러 대 묶는 두 방법 → VM 위의 데스크톱), 운영 체제를 덜 맡는 쪽으로 옮겨 간다(컨테이너 → Functions → App Service).
학습자가 가장 많이 헷갈리는 것은 **「무엇을 고객이 맡고, 언제 실행되고, 어디에 맞는가」**다 — VM은 운영 체제까지 맡고 늘 실행되어 있다, 컨테이너는 운영 체제를 맡지 않고 빨리 만들고 멈춘다, Functions는 이벤트가 올 때만 실행된다, App Service는 웹 앱을 인프라 관리 없이 실행한다.
마지막 개념의 표 `HostingOptionsTable`이 넷을 나란히 둔다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 1 | `virtual-machines` | 가상 머신(Azure Virtual Machines) | — | 1 | Azure에서 가상화된 서버를 IaaS로 실행하는 것 — 물리 서버처럼 운영 체제와 설치할 소프트웨어를 고객이 정한다. 이 주제의 첫 개념이라 **VM**·**가상화**·**IaaS**·**운영 체제**를 짧게 푼다(앞 phase 주제가 푼 낱말도 이 주제에서 다시 푼다). 물리 서버를 사서 유지할 필요는 없지만 VM 안의 패치·업데이트·구성은 고객이 계속 맡는다. **이미지**(운영 체제와 도구가 미리 든 틀)로 빨리 만든다. VM이 맞는 경우(운영 체제를 완전히 통제해야 할 때, 직접 만든 소프트웨어를 실행할 때, 호스팅 구성을 직접 정할 때)와 쓰임 다섯(테스트와 개발, 클라우드 앱 호스팅, 데이터 센터 확장, 재해 복구, 리프트 앤 시프트 마이그레이션 — 쓰임마다 한 줄). 크기는 용도와 vCPU 수·메모리로 고른다는 것까지만(「배경」). 덤프: NO.90(컴퓨팅 서비스 설명), NO.201은 PaaS 쪽 — 이 개념에서 묻지 않는다 |
| 2 | `vm-resources` | 가상 머신에 필요한 리소스 | `virtual-machines` | 1 | **목록 개념** — 소개 문단(VM을 만들면 VM 혼자가 아니라 VM을 받쳐 주는 리소스가 함께 만들어지고, 저마다 비용이 따로 붙을 수 있다 — step 0 결과대로) 뒤 항목: 가상 네트워크·네트워크 인터페이스(NIC)·IP 주소(사설 IP와, 필요할 때 공용 IP)·네트워크 보안 그룹·디스크(OS 디스크와 데이터 디스크) — 항목과 각 항목의 쓰임은 step 0이 확인한 VM 개요의 표대로. **어느 것이 꼭 있어야 하고 어느 것은 필요할 때만 붙이는지**를 가른다(설계 때 본 것: 공용 IP는 「때로」, 데이터 디스크는 「따로 둘 수도」 — step 0 결과대로). 데이터를 OS 디스크와 다른 디스크에 두는 까닭(VM이 고장 나면 데이터 디스크를 떼어 새 VM에 붙인다). 이 리소스들은 기본으로 VM과 같은 리소스 그룹에 만들어진다(리소스 그룹을 한 줄로 푼다). 네트워크 보안 그룹은 한 줄 풀이만(트래픽을 허용·차단하는 규칙의 묶음 — 자세한 것은 다른 주제의 몫이지만 그 말을 쓰지 않는다). **이 개념에 도식 `VmResourcesDiagram`을 붙인다**. 덤프: NO.192(VM에 필요한 리소스 — 덤프 답 「공용 IP 주소」는 step 0이 확인한다) |
| 3 | `scale-sets` | 가상 머신 확장 집합 | — | 2 | 같은 구성의 VM 여러 대를 한 묶음으로 만들고 관리하는 기능 — 부하를 나눠 받는다. 확장 집합이 없으면 VM마다 구성을 직접 맞추고, 사용량을 지켜보고, 대수를 손으로 바꿔야 한다. 확장 집합은 구성을 한곳에서 관리하고, **수요나 정해 둔 일정에 따라 VM 수를 저절로 늘리고 줄인다**. 부하 분산과 함께 써서 요청이 여러 VM에 고르게 간다 — **부하 분산 장치**(들어오는 요청을 여러 VM에 나눠 보내는 것)를 한 줄로 푼다. 확장 집합이 여러 가용성 영역에 VM을 나눠 둘 수 있는지(NO.314·423 — 데이터 센터 장애)는 step 0 결과대로. 덤프: NO.213(같은 구성·자동 증감), NO.314·423 |
| 4 | `availability-sets` | 가용성 집합 | — | 2 | 한 지역 안에서 관련된 VM이 한꺼번에 멈출 가능성을 줄이려고 VM을 나눠 두는 논리적 묶음. Azure가 묶음 안의 VM마다 **업데이트 도메인**(계획된 유지 관리 때 함께 다시 시작될 수 있는 묶음 — 한 번에 하나씩만 다시 시작된다)과 **장애 도메인**(전원과 네트워크 스위치를 함께 쓰는 묶음)을 정해 준다. 장애 도메인·업데이트 도메인의 최대 수와 기본 수는 step 0 결과대로. 가용성 집합 자체에는 요금이 없고 VM 값만 낸다. **가용성 집합이 막지 못하는 것**: 운영 체제나 앱의 문제, 데이터 센터 수준의 장애 — 그 대비는 가용성 영역(한 지역 안에서 전원·냉각·네트워크를 따로 갖춘 데이터 센터 묶음 — 이 주제에서 한 줄로 푼다)이다. 공식 문서는 가용성 영역을 지원하는 지역에서는 영역을 쓰는 설계를, 새로 만들 때는 확장 집합(유연한 오케스트레이션)을 권한다 — 권장의 현행 표현은 step 0 결과대로. 확장 집합과 가용성 집합이 **무엇을 위한 것인가**(대수를 늘리고 줄이기 / 한꺼번에 멈추지 않게 나눠 두기)로 갈린다는 것을 4절대로. **이 개념에 도식 `AvailabilitySetDiagram`을 붙인다**. 덤프: 가용성 집합만 묻는 문항은 적다 — NO.27·423과 함께 읽는다 |
| 5 | `virtual-desktop` | Azure Virtual Desktop | — | 3 | 클라우드에서 실행하는 Windows 데스크톱과 앱을 여러 장치·장소에서 접속해 쓰게 하는 데스크톱·앱 가상화 서비스. 데스크톱과 앱이 사용자 기기가 아니라 Azure에 있다. 쓰는 경우: 흩어져 일하는 사람들(협력사·하이브리드 근무자)에게 같은 데스크톱을 중앙에서 내줄 때 — 예는 직접 만든다. 특징 셋: Microsoft Entra ID(이 주제에서 한 줄로 푼다)로 ID와 접근을 관리, 데이터가 기기에 남지 않아 노출이 준다, 단일 세션과 **다중 세션**(VM 한 대에 여러 사용자가 동시에 접속 — 한 줄로 푼다) Windows를 지원한다. 세션 호스트가 실행할 수 있는 운영 체제와 동시 연결 수(NO.499)는 step 0 결과대로 — 확인한 것만. 덤프: NO.110, NO.263, NO.499 |
| 6 | `containers` | 컨테이너 | — | 3 | 앱과 그 앱이 실행되는 데 필요한 것을 한데 묶은 가상화 환경 — 물리 호스트 하나에 VM 여러 대를 실행하듯, 호스트 하나에 컨테이너 여러 개를 실행한다. **VM과 다른 점**: VM은 저마다 운영 체제를 실행하고 고객이 그 운영 체제를 관리한다, 컨테이너는 고객이 운영 체제를 관리하지 않는다(컨테이너가 운영 체제를 어떻게 함께 쓰는지는 step 0 결과대로). 그래서 가볍고, 빨리 만들고 늘리고 멈추며, 고장 뒤 빨리 다시 시작한다. Docker는 널리 쓰이는 컨테이너 엔진이고 Azure가 지원한다(**엔진**을 한 줄로 푼다). 쓰임: 마이크로 서비스 — 웹사이트를 프런트 엔드·백 엔드·저장 부분으로 나눠 컨테이너마다 두면, 부담이 몰린 부분만 따로 늘리고 한 부분을 바꿔도 나머지에 영향이 없다(예는 직접 만든다). **호스트**·**프런트 엔드**·**백 엔드**를 한 줄씩 푼다. **이 개념에 도식 `VmContainerDiagram`을 붙인다** |
| 7 | `container-services` | Azure의 컨테이너 서비스 | `containers` | 3 | **목록 개념** — 소개 문단(Azure에서 컨테이너를 실행하는 서비스는 고객이 맡는 일의 양에 따라 갈린다) 뒤 항목 셋. Azure Container Instances: VM을 관리하거나 다른 서비스를 들이지 않고 컨테이너를 가장 빠르고 간단하게 실행한다 — PaaS(한 줄로 푼다), 컨테이너를 올리면 서비스가 실행한다. Azure Container Apps: Container Instances처럼 바로 실행하고 컨테이너 관리 부담을 덜어 주는 PaaS이고, 부하 분산과 크기 조정이 들어 있어 수요에 맞춘다. Azure Kubernetes Service(AKS): 컨테이너의 수명 주기를 관리하는 **오케스트레이션** 서비스(한 줄로 푼다) — 컨테이너를 무리로 배포할 때 관리를 쉽게 한다. 항목 다음에 셋을 고르는 기준(하나를 빨리 실행 / 크기 조정이 필요한 앱 / 많은 컨테이너의 관리)을 한 문단으로. 서비스 이름의 한국어 표기는 step 0 결과대로. 덤프: NO.117(Container Instances의 서비스 유형), NO.304·456 |
| 8 | `functions` | Azure Functions | — | 4 | 이벤트로 실행되는 서버리스 컴퓨팅 서비스 — VM이나 컨테이너를 유지하지 않는다. **서버리스**를 이 주제에서 한 줄로 다시 푼다(`azure-cloud-computing.serverless`가 자세히 다루지만 그 말을 쓰지 않는다). VM·컨테이너로 만든 앱은 리소스가 실행되어 있어야 동작하지만, Functions는 이벤트가 함수를 깨우므로 이벤트가 없을 때 리소스를 갖춰 둘 필요가 없다. 함수를 실행하는 것(트리거) — 이벤트(흔히 REST 요청), 타이머, 다른 Azure 서비스의 메시지 — 와 몇 초 안에 끝나는 일에 맞는다는 것. 수요에 따라 저절로 늘어난다. 실행이 끝나면 리소스를 저절로 놓고, 함수가 실행되는 동안 쓴 CPU 시간에만 요금을 낸다(호스팅 플랜마다 다른지 — step 0 결과대로 한정해 쓴다). 상태 비저장(기본 — 이벤트마다 처음부터 다시 시작하듯 동작)과 상태 저장(**Durable Functions** — 앞의 활동을 이어 간다). 서버리스가 아닌 환경으로 옮겨 실행할 수도 있다. **REST 요청**을 한 줄로 푼다. **이 개념에 도식 `FunctionTriggerDiagram`을 붙인다**. 덤프: NO.131·133·144(서버 없이 코드 실행), NO.126은 D1(phase 100)이 이미 처리했다, NO.406 |
| 9 | `app-service` | Azure App Service | — | 4 | 웹 앱·백그라운드 작업·모바일 백 엔드·REST API를 인프라를 관리하지 않고 만들고 호스트하는 HTTP 기반 서비스 — **HTTP**를 한 줄로 푼다. 자동 크기 조정과 고가용성을 갖췄고, Windows와 Linux를 지원하며, GitHub·Azure DevOps·Git 저장소에서 자동 배포(지속적 배포 — 한 줄로 푼다)할 수 있다. 여러 언어·프레임워크를 지원한다(이름을 늘어놓지 않는다 — 「여러」로 충분하다). 호스트하는 앱 종류 넷(웹 앱·API 앱·WebJobs·모바일 앱 — 한 줄씩, 세부 기능은 쓰지 않는다). App Service가 PaaS라는 것과 운영 체제를 고객이 관리하지 않는다는 것은 한 줄로(이 주제의 VM과 견준다). 앱을 어디에 호스트할지 — VM(호스팅 환경을 가장 많이 통제), 컨테이너(부분마다 따로 관리), App Service(인프라 관리 없이 웹 앱) — 를 견주는 문단. **이 개념에 표 `HostingOptionsTable`을 붙인다**. 덤프: NO.201(PaaS 웹 앱의 운영 체제 제어), NO.406·90 |

### `azure-virtual-networking` — 가상 네트워크와 연결 (공식 학습 가이드 「Describe virtual networking, including the purpose of Azure virtual networks, subnets, peering, Azure DNS, Azure VPN Gateway, and ExpressRoute」·「Define public and private endpoints」)

가장 안쪽(가상 네트워크와 그 안의 서브넷)에서 바깥으로 넓힌다 — 가상 네트워크끼리(피어링) → Azure 서비스와(엔드포인트) → 온-프레미스와 인터넷 너머로(VPN 게이트웨이) → 인터넷을 거치지 않는 전용 연결(ExpressRoute) → 이름으로 찾기(Azure DNS).
학습자가 가장 많이 헷갈리는 것은 **「무엇과 무엇을, 어떤 길로 잇는가」**다 — 가상 네트워크끼리(피어링 / VNet 간 VPN), 온-프레미스와(인터넷 위의 암호화된 터널인 VPN / 인터넷을 거치지 않는 ExpressRoute), Azure 서비스와(퍼블릭 / 프라이빗 엔드포인트).
문항이 이것들을 보기로 둘 때는 **잇는 두 끝과 지나는 길(인터넷을 거쳐도 되는가)**을 문제문에 준다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 10 | `virtual-network` | 가상 네트워크 | — | 6 | Azure 안의 사설 네트워크 — VM·웹 앱·데이터베이스 같은 Azure 리소스가 서로, 인터넷의 사용자와, 온-프레미스의 컴퓨터와 통신하게 한다. 이 주제의 첫 개념이라 **리소스**·**VM**·**온-프레미스**·**IP 주소**를 짧게 푼다. 가상 네트워크가 하는 일(격리와 분할, 인터넷 통신, Azure 리소스 사이 통신, 온-프레미스와 통신, 트래픽 경로 정하기, 트래픽 거르기, 가상 네트워크 잇기) 가운데 이 개념은 **격리**를 세운다: 가상 네트워크는 서로 격리되어, **다른 가상 네트워크의 리소스와는 따로 잇지 않으면 통신하지 않는다** — step 5가 확인한 현행 문서의 말로. 가상 네트워크를 만들 때 사설 IP 주소 공간을 정하고, 그 범위는 가상 네트워크 안에만 있어 인터넷에서 경로가 잡히지 않는다. 인터넷에서 들어오는 연결은 리소스에 공용 IP 주소를 붙이거나 부하 분산 장치 뒤에 두어 연다. 이름 확인은 Azure가 제공하는 것을 쓰거나 내부·외부 DNS 서버를 지정한다(**DNS**를 한 줄로 푼다). 나머지 일(온-프레미스와 통신, 거르기, 잇기)은 한 문장으로 묶어 이름만 들고 그 자리에서 푼다. 가상 네트워크가 지역 하나·구독 하나에 속하는지(NO.86 — 같은 지역의 가상 네트워크끼리 기본으로 이어지는가, 같은 리소스 그룹 안 이름, 주소 공간이 구독 안에서 겹쳐도 되는가)는 step 5 결과대로. **이 개념에 도식 `VnetIsolationDiagram`을 붙인다** — 서브넷도 그린다. 덤프: NO.184·395·451·474(VM끼리 통신을 막으려면 — 덤프 답이 맞는지 step 5가 확인), NO.86·342 |
| 11 | `subnets` | 서브넷 | `virtual-network` | 6 | 가상 네트워크의 주소 공간을 나눈 부분 — 이름을 붙인 서브넷마다 주소 공간의 일부를 준다. 나누는 까닭(용도마다 리소스를 나눠 두고, 서브넷마다 다른 규칙을 거는 것 — step 5 결과대로). **같은 가상 네트워크 안의 서브넷끼리는 Azure가 기본으로 트래픽을 보낸다** — 서브넷을 나눠도 기본으로 막히지 않는다(4절: 서브넷과 가상 네트워크는 「나눔」과 「격리」로 갈린다). 서브넷 사이 트래픽을 거르는 방법으로 네트워크 보안 그룹이 있다는 것은 한 줄 풀이만. 주소 범위의 표기(CIDR)는 쓰지 않는다 — 「주소 공간의 일부」로 충분하다. 덤프: NO.342(분할) |
| 12 | `peering` | 가상 네트워크 피어링 | — | 7 | 두 가상 네트워크를 서로 직접 잇는 것 — 이으면 두 가상 네트워크의 리소스가 서로 통신한다. 피어링한 네트워크 사이의 트래픽은 사설이고 **Microsoft 백본 네트워크**(Microsoft가 가진 전용망 — 한 줄로 푼다)로 다니며 공용 인터넷에 들어가지 않는다. 다른 지역의 가상 네트워크끼리도 피어링할 수 있다(전역 피어링 — 이름은 step 5 결과대로). 피어링이 다른 구독의 가상 네트워크도 잇는지, 피어링이 **이어지지 않는다**(A-B, B-C를 이어도 A-C는 이어지지 않는다 — 비전이성)는 것은 step 5 결과대로, 확인한 것만. 피어링과 VPN 게이트웨이의 VNet 간 연결이 **어느 길로 다니는가**(백본 / 인터넷 위의 암호화된 터널)로 갈린다는 것은 VPN 게이트웨이를 한 줄로 풀어 쓴다. **이 개념에 도식 `VnetPeeringDiagram`을 붙인다**. 덤프: NO.252 |
| 13 | `endpoints` | 퍼블릭 엔드포인트와 프라이빗 엔드포인트 | — | 7 | **목록 개념** — 소개 문단(**엔드포인트**는 서비스에 닿는 접속 지점이다 — 공식 문서의 말로. Azure 가상 네트워크는 두 엔드포인트를 지원한다) 뒤 항목 둘. 퍼블릭 엔드포인트: 공용 IP 주소를 가져 세계 어디서나 닿을 수 있다. 프라이빗 엔드포인트: 가상 네트워크 안에 있고 그 가상 네트워크의 주소 공간에서 받은 사설 IP 주소를 쓴다 — Azure 서비스(예: 스토리지 계정 — 데이터를 담는 Azure 저장소의 단위, 한 줄로 푼다)에 사설로 닿게 해, 가상 네트워크에서 그 서비스로 가는 트래픽이 공용 인터넷을 지나지 않는다(step 5가 확인한 Private Link 문서의 말로 — **Private Link**는 이름만 쓰고 한 줄로 푼다). 항목 다음에 둘을 고르는 기준을 한 문단으로. 서비스 엔드포인트는 쓰지 않는다(「배경」). **이 개념에 도식 `PrivateEndpointDiagram`을 붙인다**. 덤프: NO.288(덤프 답은 step 5가 확인 — 서비스 엔드포인트를 쓰지 않으므로 이 문항은 문항 근거로 쓰지 않는다) |
| 14 | `vpn-gateway` | VPN 게이트웨이 | — | 8 | **VPN**(믿을 수 있는 사설 네트워크끼리 믿을 수 없는 네트워크 — 흔히 공용 인터넷 — 너머로, 그 안에 암호화된 터널을 두어 잇는 것)을 먼저 한 줄로 푼다. VPN 게이트웨이는 가상 네트워크 게이트웨이의 한 종류로, 가상 네트워크의 **전용 서브넷**(게이트웨이 서브넷 — 이름은 step 5 결과대로)에 배포한다. 인터넷을 건너는 데이터는 모두 사설 터널 안에서 암호화된다. **가상 네트워크마다 VPN 게이트웨이는 하나**지만, 게이트웨이 하나로 여러 곳(다른 가상 네트워크, 온-프레미스 데이터 센터)에 이을 수 있다. **사이트 간 연결에 필요한 것**: Azure 쪽의 VPN 게이트웨이, 온-프레미스 쪽의 VPN 장치, 그리고 그 온-프레미스 장치와 네트워크를 Azure에 알려 주는 **로컬 네트워크 게이트웨이**, 둘을 잇는 연결 — step 5가 확인한 사이트 간 연결 문서대로. 기본으로 두 인스턴스가 활성/대기로 배포되어 하나가 멈추면 다른 하나가 이어받는다는 것은 한 줄로만. **이 개념에 도식 `SiteToSiteVpnDiagram`을 붙인다**. 덤프: NO.29(온-프레미스와 잇는 데 필요한 리소스), NO.32·497(온-프레미스 VPN 장치를 Azure에서 나타내는 것), NO.180 |
| 15 | `vpn-connection-types` | VPN 게이트웨이 연결 유형 | `vpn-gateway` | 8 | **목록 개념** — 소개 문단(VPN 게이트웨이는 무엇과 무엇을 잇느냐에 따라 세 가지로 연결한다) 뒤 항목 셋. 사이트 간: 온-프레미스 데이터 센터(의 VPN 장치)와 가상 네트워크 — Azure의 장치가 로컬 네트워크에 있는 것처럼 보인다. 지점 및 사이트 간: 집이나 출장지의 컴퓨터 한 대가 가상 네트워크로 — 그 컴퓨터가 암호화된 VPN 연결을 시작한다. VNet 간: 가상 네트워크와 다른 가상 네트워크. 항목 이름의 한국어 표기는 step 5 결과대로(한국어판에 「지점 및 사이트 간」과 「지점 간」이 섞인다). 항목 다음에 셋을 고르는 기준(잇는 두 끝이 무엇인가)을 한 문단으로. 덤프: NO.180·263 |
| 16 | `expressroute` | ExpressRoute | — | 9 | **연결 공급자**의 도움으로 온-프레미스 네트워크를 사설 연결로 Microsoft 클라우드에 잇는 서비스 — 이 연결을 **ExpressRoute 회로**라 부르고, 사무실·데이터 센터마다 회로를 둔다. 연결이 **공용 인터넷을 지나지 않으므로** 보통의 인터넷 연결보다 안정적이고, 빠르고, 대기 시간이 고르고, 보안이 높다. Azure뿐 아니라 Microsoft 365 같은 Microsoft 클라우드 서비스에도 닿는다. 특징: 같은 지정학적 지역 안의 모든 지역에 연결, **Global Reach**(회로끼리 이어 온-프레미스 사이트끼리 인터넷을 거치지 않고 데이터를 주고받기 — 한 줄로), BGP로 경로를 주고받는 동적 라우팅(**BGP**·**라우팅**을 한 줄로 푼다), 피어링 위치마다 기본으로 갖춘 중복. 고르는 때(사설로 고른 연결이 필요할 때, 규정 준수 요건, 예측할 수 있는 대기 시간과 높은 처리량, 중요한 트래픽을 인터넷에 보내지 않으려 할 때). ExpressRoute를 써도 DNS 쿼리·인증서 해지 목록 확인·CDN 요청은 공용 인터넷으로 간다는 것은 step 5 결과대로 한 줄. VPN 게이트웨이와 **지나는 길**(인터넷 위의 암호화된 터널 / 인터넷을 지나지 않는 사설 연결)로 갈린다는 것을 4절대로 — VPN 게이트웨이를 이 주제의 앞 개념으로 되짚는다. ExpressRoute 연결이 끊길 때 VPN 게이트웨이를 대체 경로로 둘 수 있다는 것은 한 줄. **이 개념에 도식 `ExpressRouteDiagram`을 붙인다**. 덤프: NO.252·263·295(회로·BGP). NO.119(OSI 계층)는 쓰지 않는다(「배경」) |
| 17 | `azure-dns` | Azure DNS | — | 9 | **DNS**(사람이 읽는 도메인 이름을 컴퓨터가 쓰는 IP 주소로 바꿔 주는 체계 — 이 주제의 앞 개념이 풀었으면 되짚는다)의 도메인을 Azure 인프라에서 호스트하는 서비스. 도메인을 Azure에 두면 다른 Azure 서비스와 같은 자격 증명·API·도구·청구로 DNS 레코드(**레코드**를 한 줄로 푼다)를 관리한다. 이점: 세계 곳곳의 DNS 이름 서버에 호스트되고 **애니캐스트**로 가장 가까운 서버가 답한다(한 줄로 푼다), Azure Resource Manager 위에 있어 접근 제어·활동 로그·리소스 잠금을 쓴다(셋은 이름만 들고 한 줄로), 포털·PowerShell·CLI로 관리, 가상 네트워크 안에서 쓰는 사설 도메인, 별칭 레코드(바탕 리소스의 IP가 바뀌면 저절로 따라간다 — 한 줄). **Azure DNS로는 도메인 이름을 살 수 없다** — 도메인은 App Service 도메인이나 다른 도메인 등록 기관에서 사서 Azure DNS에 호스트한다. 덤프: NO.86·252의 DNS 부분 — step 5 결과대로 |

### `azure-network-protection` — 네트워크 보호 (학습 가이드 밖 — 용어집·덤프가 묻는 현행 서비스, 주제 지도의 `*`)

네트워크 트래픽을 거르는 가까운 쪽(리소스 하나·서브넷 하나에 거는 NSG와 그 규칙)에서 넓은 쪽(여러 가상 네트워크를 한곳에서 거르는 Azure Firewall)으로 가고, 거르는 것과 다른 일(넘치는 공격 트래픽을 견디는 DDoS Protection)로 끝난다.
학습자가 가장 많이 헷갈리는 것은 **「무엇을 막고, 어디에 거는가」**다 — 포트·IP 주소로 허용하고 막는 규칙은 NSG, 여러 가상 네트워크와 구독에 걸친 중앙의 방화벽은 Azure Firewall, 서비스를 쓰지 못하게 하려고 트래픽을 퍼붓는 공격은 DDoS Protection.
**어느 것도 트래픽을 암호화하지 않는다**(NO.284·483 — 출처 step이 확인한다). 문항이 셋을 보기로 둘 때는 막으려는 것과 거는 범위를 문제문에 준다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 18 | `network-security-groups` | 네트워크 보안 그룹 | — | 11 | Azure 리소스로 들어오고 나가는 네트워크 트래픽을 거르는 **보안 규칙**의 묶음 — 규칙마다 허용하거나 거부한다. 이 주제의 첫 개념이라 **가상 네트워크**·**서브넷**·**네트워크 인터페이스**·**포트**·**IP 주소**·**트래픽**을 짧게 푼다. **어디에 연결하는가**: 서브넷이나 네트워크 인터페이스에 연결한다(가상 네트워크 자체에는 연결하지 않는다 — step 10 결과대로). 서브넷에 연결하면 그 서브넷의 리소스 모두에, 네트워크 인터페이스에 연결하면 그 VM에만 걸린다. 서브넷과 네트워크 인터페이스마다 연결할 수 있는 NSG 수, NSG 하나를 여러 곳에 연결할 수 있는지, 둘 다 연결했을 때 트래픽이 둘을 모두 지나야 한다는 것은 step 10 결과대로 — 확인한 것만. NSG에 추가 요금이 없다는 것은 step 10 결과대로. **이 개념에 도식 `NsgAssociationDiagram`을 붙인다**. 덤프: NO.261·467(연결할 수 있는 대상), NO.236(웹 서버와 데이터베이스 서버 사이 제한), NO.102·229·269·379·428·441·443(VM으로 들어오는 포트 허용) |
| 19 | `security-rules` | 보안 규칙 | `network-security-groups` | 11 | NSG 규칙이 무엇으로 트래픽을 가르는가 — 원본·대상(IP 주소, **서비스 태그**, **애플리케이션 보안 그룹** — 둘은 한 줄씩 푼다), 포트, 프로토콜, 방향(인바운드·아웃바운드 — 한 줄로 푼다), 허용·거부 — 항목은 step 10이 확인한 현행 문서대로. **우선순위**: 규칙마다 번호가 있고 **번호가 낮은 규칙부터** 보며, 트래픽에 맞는 규칙을 만나면 거기서 멈춘다 — 뒤의 규칙은 보지 않는다. **기본 규칙**: 만들지 않아도 있는 규칙(같은 가상 네트워크 안의 트래픽 허용, 인터넷에서 들어오는 트래픽 거부 등 — step 10이 확인한 이름과 내용대로)이 가장 낮은 우선순위로 있어, 고객이 만든 규칙이 먼저 적용된다. 그래서 **VM의 특정 포트로 들어오는 트래픽을 열려면 그 포트를 허용하는 인바운드 규칙을 기본 거부 규칙보다 높은 우선순위로 더한다**. NSG가 상태 저장인지(응답 트래픽을 따로 허용하지 않아도 되는지)는 step 10 결과대로. **이 개념에 도식 `NsgRuleOrderDiagram`을 붙인다**. 덤프: NO.68(인바운드 규칙의 원본 — 덤프 답은 step 10이 확인), NO.441·428·443 |
| 20 | `azure-firewall` | Azure Firewall | — | 12 | Azure의 클라우드 워크로드를 지키는 관리형 클라우드 네트워크 방화벽 서비스 — 상태 저장 방화벽을 서비스로 받고, 고가용성이 들어 있으며 크기가 제한 없이 늘어난다(**방화벽**·**상태 저장**·**워크로드**를 한 줄씩 푼다). **여러 가상 네트워크와 구독**에 걸쳐 트래픽 규칙을 한곳에서 만들고 적용하고 기록한다는 것(Firewall Manager·방화벽 정책 — 이름은 한 줄 풀이만), 네트워크 규칙·애플리케이션 규칙·NAT 규칙(설계 때 본 것 — 셋을 이름과 한 줄 뜻으로만, step 10이 확인한 현행 이름대로), 위협 인텔리전스로 알려진 악성 IP 주소·도메인의 트래픽을 알리거나 막는다는 것은 step 10 결과대로. SKU(Basic·Standard·Premium)는 이름만 쓰거나 쓰지 않는다. **NSG와의 차이**를 4절대로 — 거는 곳(서브넷·네트워크 인터페이스 하나하나 / 여러 가상 네트워크를 한곳에서)과 거르는 것의 폭(step 10 결과대로). **이 개념에 도식 `FirewallHubDiagram`을 붙인다**. 덤프: NO.127·197·432(여러 구독·가상 네트워크의 트래픽 제한), NO.31(NAT 규칙), NO.7 |
| 21 | `ddos-protection` | Azure DDoS Protection | — | 12 | **DDoS(분산 서비스 거부) 공격**(많은 곳에서 트래픽을 퍼부어 앱의 리소스를 바닥내 정상 사용자가 쓰지 못하게 하는 공격 — phase 101이 정한 표기)을 한 줄로 푼다. DDoS Protection은 그런 공격에서 Azure 리소스를 지키는 서비스 — 트래픽을 늘 지켜보다 공격을 알아차리면 공격 트래픽을 걸러 내고 정상 트래픽은 계속 통과시킨다(현행 문서의 말로). 무엇을 지키는가(가상 네트워크의 공용 IP 주소를 가진 리소스 — step 10 결과대로). 현행 종류(설계 때 본 것: 기본으로 들어 있는 인프라 보호, 유료인 DDoS Network Protection·DDoS IP Protection — 덤프의 「Basic/Standard」는 옛 이름)와 유료 쪽이 더 주는 것(공격 보고서·경고 등)은 step 10 결과대로. **DDoS Protection이 하지 않는 것**: 특정 포트·HTTP 트래픽을 허용하는 일(그것은 NSG — NO.163), 웹 앱의 공격(SQL 주입 같은)을 거르는 일(그것은 웹 애플리케이션 방화벽 — 이름만 한 줄로, 확인한 것만). **이 개념에 도식 `DdosProtectionDiagram`을 붙인다**. 덤프: NO.3, NO.163. NO.52·116·222(심층 방어의 계층)는 `azure-security-model`의 몫 |

**문항 수**: 개념마다 하나, 아홉 개념(`availability-sets`·`container-services`·`app-service`·`virtual-network`·`vpn-gateway`·`expressroute`·`network-security-groups`·`security-rules`·`azure-firewall`)만 둘 — 모두 30개, `az056`~`az085`.
문항은 개념 순서대로 `questions.json` 끝에 붙인다. step마다 맡는 id:

| step | id | 개념별 수 |
|---|---|---|
| 1 | `az056`~`az057` | 1 하나, 2 하나 |
| 2 | `az058`~`az060` | 3 하나, 4 둘 |
| 3 | `az061`~`az064` | 5 하나, 6 하나, 7 둘 |
| 4 | `az065`~`az067` | 8 하나, 9 둘 |
| 6 | `az068`~`az070` | 10 둘, 11 하나 |
| 7 | `az071`~`az072` | 12 하나, 13 하나 |
| 8 | `az073`~`az075` | 14 둘, 15 하나 |
| 9 | `az076`~`az078` | 16 둘, 17 하나 |
| 11 | `az079`~`az082` | 18 둘, 19 둘 |
| 12 | `az083`~`az085` | 20 둘, 21 하나 |

**예시 값 — 세 주제가 함께 쓴다:**

- **조직 이름**은 「회사 A」·「회사 B」처럼 이름표로 쓴다. 실제 회사 이름을 예로 들지 않는다(Azure·Microsoft와 Docker·GitHub처럼 공식 문서가 사실로 드는 이름은 예외).
- **VM 이름표**는 `VM 1`·`VM 2`·`VM 3`, **가상 네트워크**는 「가상 네트워크 A」·「가상 네트워크 B」, **서브넷**은 쓰임을 드러내는 이름표(「웹」·「데이터베이스」), **지역**은 「지역 A」·「지역 B」. 수량(VM 대수)은 예시 값이라고 본문이나 캡션에서 밝힌다.
- **포트 번호**는 본문 예에서 하나를 정해 도식과 같이 쓴다(예: 웹 요청의 포트). 포트가 무엇인지는 그 주제에서 한 줄로 푼다. IP 주소와 주소 범위의 실제 값(`10.0.0.0/16` 같은 것)은 쓰지 않는다 — 「사설 IP 주소」·「주소 공간의 일부」로 충분하다.
- **공식 문서가 정한 값**(장애 도메인·업데이트 도메인의 최대 수, 가상 네트워크마다 VPN 게이트웨이 하나 같은 것)은 출처 step이 확인한 것만 쓴다. 가격·서비스별 SLA 수치·대역폭 수치는 쓰지 않는다.
- **서비스 이름**은 Microsoft 한국어 문서 표기로 쓰고, 영문 이름이 다르면 처음 나올 때 괄호에 적는다(출처 step이 표기를 확인한다).

도식은 본문에 나온 예시 값만 쓴다(ADR-038) — 그러니 이 값들을 도식에 쓰려면 그 개념의 본문에 먼저 쓴다.

## 출처

- 사실은 `docs/source/azure/official.md`(Microsoft 공식 문서에서 확인한 사실과 URL)에서만 가져온다. 출처 step(0·5·10)이 그 주제에 필요한 사실을 확인해 남긴다. 그 summary가 개념마다 무엇을 쓰고 무엇을 쓰지 않는지 적는다.
- 덤프·용어집의 주장이 `docs/source/azure/corrections.md`에 걸려 있으면 **고친 쪽**을 쓴다. 덤프·용어집에만 있고 공식 문서가 말하지 않는 주장은 쓰지 않는다.
- 개념 step에서 그 밖의 사실이 필요하면, 허용한 출처(`docs/source/azure/CLAUDE.md` 「허용하는 출처」)를 실제로 열어 확인하고 `official.md`에 URL과 「쓰인 곳」을 적은 뒤 쓴다.
  받은 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다. 인증서 오류는 「배경」의 `SSL_CERT_FILE`).
  확인하지 못한 사실은 쓰지 않는다. 블로그·Microsoft Q&A·Tech Community·위키백과·자격증 교재·덤프 사이트는 쓰지 않는다.
- **`official.md`의 「쓰인 곳」**: 출처 step은 아직 개념이 없으므로 「쓰일 곳」으로 적는다. 그 개념을 만든 step이 자기 개념 id가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.
- **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 덤프의 문제문·보기·해설, 용어집 설명, 공식 문서(특히 한국어판)의 문장을 옮기지 않는다. `check-verbatim --subject azure`는 하한선일 뿐이다.
- 덤프 문항을 그대로 문항으로 만들지 않는다 — 덤프가 같은 사실을 물어도 상황과 문장은 직접 만든다(ADR-021과 같은 이유).

설계 세션이 받아 둔 공식 문서(`docs/source/azure/raw/official/`, 영문판과 한국어판 `ko-…`):

- **Learn 단원이 옮겨졌다.** 앞 phase가 받은 「Describe Azure compute and networking services」 모듈에서 네트워킹 단원이 빠져 새 모듈 「Describe Azure networking services」(`learn.microsoft.com/training/modules/describe-azure-networking-services/`)가 되었다.
  옛 단원 주소(`…/describe-azure-compute-networking-services/8-virtual-network` 같은 것)는 새 모듈의 첫 화면으로 넘어간다 — 출처 step은 새 주소를 쓴다.
- 컴퓨팅 — `learn-describe-azure-compute-networking-services-{2-virtual-machines, 4-virtual-desktop, 5-containers, 6-functions, 7-describe-application-hosting-options}.md`와 `ko-` 판.
  제품 문서(phase 100·101이 받음): `docs-virtual-machines-overview.md`(VM을 받치는 리소스의 표), `docs-virtual-machine-scale-sets-overview.md`, `docs-azure-functions-functions-overview.md`·`…-functions-scale.md`, `docs-app-service-overview.md`, `azure-dictionary-what-is-a-container.md`.
- 네트워킹 — `learn-describe-azure-networking-services-{2-virtual-network, 3-virtual-private-networks, 4-expressroute, 5-domain-name-system}.md`와 `ko-` 판. 제품 문서(phase 100·102가 받음): `docs-virtual-network-overview.md`, `docs-expressroute-expressroute-introduction.md`, `docs-dns-overview.md`.
- 네트워크 보호 — `docs-ddos-protection-overview.md`(phase 101).
- AZ-900 학습 가이드 — `az-900-study-guide.md`.

설계 때 열어 보고 받지 않은 것(출처 step이 받는다 — 주소는 출발점이고, 옮겨졌으면 같은 내용의 현행 쪽을 찾는다):
주제 8 — 가용성 집합 개요(`learn.microsoft.com/azure/virtual-machines/availability-set-overview` — 설계 때 「확장 집합(유연한 오케스트레이션)을 권한다」, 장애 도메인 최대 3·업데이트 도메인 최대 20을 봤다), Azure Virtual Desktop 개요(`learn.microsoft.com/azure/virtual-desktop/overview`),
Container Instances 개요(`learn.microsoft.com/azure/container-instances/container-instances-overview`), Container Apps 개요(`learn.microsoft.com/azure/container-apps/overview`), AKS 개요(`learn.microsoft.com/azure/aks/what-is-aks`), 가용성 영역과 확장 집합(`learn.microsoft.com/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-use-availability-zones`).
주제 9 — 가상 네트워크 피어링 개요(`learn.microsoft.com/azure/virtual-network/virtual-network-peering-overview`), 프라이빗 엔드포인트 개요(`learn.microsoft.com/azure/private-link/private-endpoint-overview`), 공용 IP 주소(`learn.microsoft.com/azure/virtual-network/ip-services/public-ip-addresses`),
VPN Gateway 개요(`learn.microsoft.com/azure/vpn-gateway/vpn-gateway-about-vpngateways`), 사이트 간 연결 만들기(`learn.microsoft.com/azure/vpn-gateway/tutorial-site-to-site-portal` — 로컬 네트워크 게이트웨이), 가상 네트워크 FAQ(`learn.microsoft.com/azure/virtual-network/virtual-networks-faq`).
주제 10 — NSG 개요(`learn.microsoft.com/azure/virtual-network/network-security-groups-overview`), NSG가 트래픽을 거르는 방식(`…/virtual-network/network-security-group-how-it-works`), Azure Firewall 개요(`learn.microsoft.com/azure/firewall/overview`)·기능(`…/firewall/features`)·Firewall Manager 개요(`learn.microsoft.com/azure/firewall-manager/overview`),
DDoS Protection 종류 비교(`learn.microsoft.com/azure/ddos-protection/ddos-protection-sku-comparison`), Learn 「Introduction to Azure Firewall」 모듈.

## 글 — `docs/WRITING_GUIDE.md`를 따른다(ADR-056, ADR-060)

- `summary`는 WRITING_GUIDE 2절 — 처음 보는 사람이 일상 말로 「무엇이고 무슨 역할인지」 알게 하는 한 문장. 다른 전문용어를 알아야 이해되면 안 되고, 제목 낱말을 되풀이하는 순환 정의, 숫자·분류를 넣지 않는다.
- `paragraphs`는 3절의 흐름(개념 → 원리 → 예시 → 특징)을 필요한 만큼. 누가·무엇을·어디서 어디로를 빠뜨리지 않는다. 같은 말을 되풀이하지 않는다.
  헷갈리는 짝은 4절대로 무엇이 다르고 왜 나눠 부르는지를 말한다 — 이 phase의 짝: VM과 컨테이너, 확장 집합과 가용성 집합, 가용성 집합과 가용성 영역, Container Instances·Container Apps·AKS, Functions와 App Service, App Service와 VM,
  가상 네트워크와 서브넷, 피어링과 VNet 간 VPN, 퍼블릭 엔드포인트와 프라이빗 엔드포인트, VPN 게이트웨이와 로컬 네트워크 게이트웨이, VPN 게이트웨이와 ExpressRoute, Azure DNS와 도메인 등록 기관,
  NSG를 서브넷에 거는 것과 네트워크 인터페이스에 거는 것, NSG와 Azure Firewall, Azure Firewall과 DDoS Protection.
- **이 주제 화면만 읽고 뜻이 서야 한다.** 학습자는 주제 목록에서 아무 주제로나 바로 들어오므로, 다른 주제에 정의가 있다는 것은 도움이 되지 않는다.
  이 주제 안에서 처음 쓰는 낱말(VM, 운영 체제, IaaS·PaaS, 리소스 그룹, 가용성 영역, 서버리스, 가상 네트워크, 서브넷, IP 주소, 포트, DNS, 온-프레미스 등)은 그 자리에서 짧게 푼다. 앞 phase 주제가 푼 낱말도 이 주제에서는 다시 푼다.
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
   「VM 두 대가 서로 통신하지 못하게 하고 싶다」는 다른 가상 네트워크에 두는 것에도 NSG에도 맞다 — 문제문에 조건(같은 가상 네트워크 안이어야 한다 / 규칙을 두지 않고)을 준다.
   「온-프레미스와 Azure를 안전하게 잇고 싶다」는 사이트 간 VPN에도 ExpressRoute에도 맞다 — 지나는 길(인터넷을 거쳐도 되는가)을 준다.
   「코드를 서버 관리 없이 실행하고 싶다」는 Functions에도 App Service에도 맞다 — 실행되는 때(이벤트가 올 때만 / 늘 웹 요청을 받는 웹 앱)를 준다.
   「VM이 한꺼번에 멈추지 않게 하고 싶다」는 가용성 집합에도 가용성 영역에도 맞다 — 막으려는 장애의 범위(랙의 전원·스위치 / 데이터 센터 전체)를 준다.
   「여러 가상 네트워크의 트래픽을 막고 싶다」는 NSG를 여러 곳에 거는 것에도 Azure Firewall에도 맞다 — 「한곳에서 중앙으로」 같은 조건을 준다.
5. 판단에 쓰이지 않는 정보(전문용어·수치·조건·부정문)를 늘어놓지 않는다. 판단에 필요한 조건은 남긴다.
6. **형식(ADR-054)**: 흔히 오해하는 것을 바로잡으면 예/아니요, 비슷한 개념을 구별하거나 상황에 맞는 것을 고르면 4지선다. 같은 범주의 그럴듯한 오답 셋을 출처 안에서 쓸 수 없으면 예/아니요.
   예/아니요는 주장 하나, 이중 부정·「항상」「절대」 금지, 「~인가요?」「~나요?」로 끝난다. **아니요 문항의 해설은 무엇이 틀렸는지에서 그치지 않고 맞는 사실을 가르친다.**
   예/아니요의 주장은 맞는 쪽으로도 틀린 쪽으로도 세울 수 있다 — 아래 균형을 맞추려고 주장의 방향을 고른다.
7. **문항은 풀면서 배우게 쓴다.** 문항은 섞여 나오고 랜덤 세트는 일부만 뽑으므로 혼자 읽혀야 한다. 문제문이 이 주제 밖의 낱말을 풀이 없이 전제하지 않는다(기준 5).
   상황에 쓰는 이름(「회사 A」)·숫자는 사실 주장이 아니어야 하고, 그 상황의 정답은 출처의 사실로 정해져야 한다. 문항 상황은 본문 예와 다르게 만들어 본문 문장을 외워서 풀리지 않게 한다.
8. **해설은 187자 이상**이고 그 개념을 가르치는 글이다(ADR-026·027). 4지선다는 정답이 왜 맞는지와 오답 셋이 각각 왜 아닌지를 담는다. 약어는 해설마다 처음 쓸 때 풀어 쓴다.
   같은 말을 늘려 길이를 채우지 않는다. 해설의 사실은 개념 본문이나 `official.md`에 있는 것이다.
9. **균형 — step이 끝났을 때 과목 전체에서**: 예/아니요의 예와 아니요 수 차이 **1 이하**, 4지선다의 정답 위치(`answerIndex` 0~3) 수의 최대·최소 차이 **2 이하**.
   phase 103 시작 때는 문항 55개, 예 15·아니요 16, 정답 위치 6/6/6/6이다.
10. 한 문항은 개념 하나만 묻는다(ADR-030 기준 2). 같은 개념의 두 문항은 서로 다른 것을 묻는다. 앞 phase의 문항(특히 `az008` Functions로 옮긴 뒤 남는 일, `az034` IaaS에서 고객이 맡는 일, `az017`·`az018` VM 늘리고 줄이기, `az042` 데이터 센터 장애와 가용성 영역)과 같은 것을 묻지 않는다.
11. 덤프 문항의 문장·보기 구성을 옮기지 않는다. 덤프가 되풀이하는 꼴(「다음 진술이 맞으면 예」 세 개 묶음, 「해결책: …, 목표를 이루나?」 연작, 밑줄 친 말 고치기, 짝짓기)도 쓰지 않는다 — 앱의 형식은 4지선다와 예/아니요 하나씩이다.

검수 — 문항마다 WRITING_GUIDE 객관식 7항의 여섯 질문으로 다시 읽고, 보기마다 「이것이 정답이라고 우길 수 있는가」를 따진다. 문제문만 읽고 보기를 보지 않은 채 정답 글자를 짐작할 수 있지 않은지도 본다.

## 도식 — 구조·흐름이 있는 개념 14개에 하나씩, 표 하나

선례는 앞 phase의 Azure 도식(`AzureRegionDiagram`·`ZoneIsolationDiagram`·`ResourceGroupScopeDiagram`·`HierarchyInheritanceDiagram`과 그 `.test.tsx`, `src/data/azure/visuals/*.json`)과
네트워크 도식(`MacTableDiagram`·`CastTypesDiagram`·`ArpCacheDiagram`)이다. 그룹 박스 안에 그룹 박스를 두는 짜임은 phase 102의 `ZoneIsolationDiagram`(지역 안의 영역)을, 하나가 멈춘 상태를 곁말과 흐림으로 보이는 짜임은 같은 도식의 시나리오를 본다.
표는 `azureServiceTypesTables.tsx`와 그 테스트를 본다.
규칙의 근거는 UI_GUIDE 「도식 전용 색상」·「도식」 절 전체, ADR-036·037·038·047·048, `src/components/diagrams/CLAUDE.md`다.
사용자 미리보기 승인을 받지 않고 **step이 좌표를 설계한다.** 그래서 기계 검사를 모두 통과시키고 설계를 summary에 남긴다.

| 도식 | JSON 키 | 개념 | step | 요지 |
|---|---|---|---|---|
| `VmResourcesDiagram` | `vm-resources` | `azure-compute.vm-resources` | 1 | VM 하나와 그를 받치는 리소스 — 늘 있는 것과 필요할 때 붙이는 것 |
| `ScaleSetDiagram` | `scale-sets` | `azure-compute.scale-sets` | 2 | 부하 분산 장치 뒤의 같은 구성 VM들 — 수요가 늘 때 저절로 늘어남 |
| `AvailabilitySetDiagram` | `availability-sets` | `azure-compute.availability-sets` | 2 | 장애 도메인과 업데이트 도메인에 나눠 둔 VM — 전원 장애 때와 계획된 유지 관리 때 멈추는 VM이 다르다 |
| `VmContainerDiagram` | `vm-containers` | `azure-compute.containers` | 3 | 호스트 하나 위의 VM 여러 대(저마다 운영 체제)와 컨테이너 여러 개 |
| `FunctionTriggerDiagram` | `function-trigger` | `azure-compute.functions` | 4 | 이벤트가 없을 때와 올 때 — 함수가 실행되는 때와 요금이 붙는 때 |
| `VnetIsolationDiagram` | `vnet-isolation` | `azure-virtual-networking.virtual-network` | 6 | 가상 네트워크 둘과 서브넷 — 같은 가상 네트워크 안은 통신, 다른 가상 네트워크와는 기본으로 통신하지 않음 |
| `VnetPeeringDiagram` | `vnet-peering` | `azure-virtual-networking.peering` | 7 | 피어링한 가상 네트워크 사이의 트래픽이 백본으로 — 지역이 달라도 |
| `PrivateEndpointDiagram` | `private-endpoint` | `azure-virtual-networking.endpoints` | 7 | 스토리지 계정에 닿는 두 길 — 퍼블릭 엔드포인트와 가상 네트워크 안의 프라이빗 엔드포인트 |
| `SiteToSiteVpnDiagram` | `site-to-site-vpn` | `azure-virtual-networking.vpn-gateway` | 8 | VPN 게이트웨이와 온-프레미스 VPN 장치(로컬 네트워크 게이트웨이) 사이의 암호화된 터널, 지점 및 사이트 간 |
| `ExpressRouteDiagram` | `expressroute` | `azure-virtual-networking.expressroute` | 9 | 연결 공급자를 거친 사설 연결과 인터넷 위의 VPN — 지나는 길이 다르다 |
| `NsgAssociationDiagram` | `nsg-association` | `azure-network-protection.network-security-groups` | 11 | NSG를 서브넷에 걸 때와 네트워크 인터페이스에 걸 때 — 규칙이 미치는 VM |
| `NsgRuleOrderDiagram` | `nsg-rule-order` | `azure-network-protection.security-rules` | 11 | 규칙을 우선순위 번호가 낮은 것부터 보고, 처음 맞는 규칙에서 멈춘다 |
| `FirewallHubDiagram` | `firewall-hub` | `azure-network-protection.azure-firewall` | 12 | 여러 가상 네트워크의 트래픽이 한곳의 Azure Firewall을 지나간다 |
| `DdosProtectionDiagram` | `ddos-protection` | `azure-network-protection.ddos-protection` | 12 | 공격 트래픽은 걸러지고 정상 트래픽은 공용 IP 주소의 리소스에 닿는다 |

표: `HostingOptionsTable`, JSON `tables["hosting-options"]`, 개념 `azure-compute.app-service`, step 4.

- **파일**: 컴포넌트는 `src/components/diagrams/<이름>Diagram.tsx`(이름이 `Diagram.tsx`로 끝나야 교차 검사와 커버리지 테스트가 도식으로 본다), 테스트는 같은 이름의 `.test.tsx`.
  문구(물음형 제목 `question`·노드 라벨·그룹 라벨·곁말·캡션·`idleCaption`·`legend`·figure `label`·`svgLabel`·시나리오·`sources`)는 그 주제의 `src/data/azure/visuals/<주제 id>.json`의 `diagrams["<키>"]`에 둔다.
  `glossary`는 빈 배열이다(ADR-037). 도식 이름과 키는 위 표대로다 — 이미 있는 이름과 겹치지 않는 것을 골라 두었다.
- **표**: `src/components/diagrams/azureComputeTables.tsx`에 `HostingOptionsTable` 함수, 테스트는 같은 이름의 `.test.tsx`. `azureServiceTypesTables.tsx`처럼 `ComparisonTableFigure`에 JSON의 `tables["<키>"]`를 넘긴다.
  열은 셋 이하(첫 열이 행 머리), `columnWidths`는 열 수만큼의 백분율이고 합이 100%다(`visuals.test.ts`).
  열 폭은 스크롤 막대가 낀 320px(표 폭 약 273px)에서 가장 긴 덩어리(띄어쓰기 없이 이어진 글자)가 들어가게 어림해 정하고, 그 계산을 summary에 적는다(실측은 phase 끝에 한다).
- **사실은 본문에만 있는 것**(ADR-036). 캡션·곁말·라벨·표 칸의 사실마다 그 개념(과 같은 주제의 다른 개념) 본문의 문단을 근거로 댈 수 있어야 한다. 예시 값도 본문에 나오는 것만(ADR-038).
  「회사 A」·「가상 네트워크 A」·「VM 1」처럼 대상을 가르는 이름표는 사실이 아니므로 써도 된다. 글과 도식을 같은 step이 만드므로, 도식에 필요한 사실은 **글에 먼저 쓴다** — 출처에 없으면 그리지 않는다.
- **말**: 노드 라벨·곁말은 본문에 쓰인 말과 같게 쓴다. 라벨을 줄이거나 영문 약어로 바꿔 폭을 맞추지 마라 — 노드를 넓히거나 배치를 바꾼다. (본문이 「네트워크 보안 그룹(NSG)」처럼 약어를 함께 세웠으면 라벨에 그 약어를 써도 된다.)
- **글자 크기**: 노드 라벨 10, 그룹 라벨·곁말 9(viewBox 단위). `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`. 노드 높이는 32다(교차 검사기가 32로 본다 — 키 큰 노드를 만들지 말고 그룹 박스를 쓴다).
- **글자 폭의 여유**: `estimateTextWidth`는 반각 문자(영문·숫자·기호)를 0.55em으로 보지만 실제 화면에서는 0.61em까지 넓다(phase 72 화면 실측).
  반각 문자가 섞인 노드 라벨·곁말·그룹 라벨(예: `VM 1`, `Azure Firewall`, `DDoS Protection`)은 `estimateTextWidth` 값의 **1.15배**를 폭으로 잡아 노드 폭·배치를 정하고, 그 범위가 둘레 박스와 `viewBox` 안에 들게 한다.
- **그룹 박스 안의 그룹 박스**(가상 네트워크 안의 서브넷, 지역 안의 가상 네트워크 등): 안쪽 박스의 라벨 영역이 바깥 박스의 라벨 영역과 겹치지 않게 위아래로 떼고, 노드는 자기를 담는 가장 안쪽 박스의 라벨 영역 아래에 둔다.
  세로형(폭 280)에서 나란히 두기 어려우면 위아래로 쌓는다 — 폭을 맞추려고 라벨을 줄이지 않는다.
- **색**: 노드는 모두 회색(`stroke-disabled`, 선례와 같은 클래스). 도식 전용 두 색(`diagram-managed`·`diagram-resource`)은 AWS 계층의 뜻이라 쓰지 않는다. 초록·빨강·주황, 16진 색, 이모지, O/X도 쓰지 않는다(ADR-036).
  강조는 opacity로만 한다 — 선택 밖 노드 `0.25`, 그룹 박스는 흐려지지 않는다. 나쁜 상태(멈춘 VM, 막힌 트래픽, 걸러진 공격)는 색이 아니라 곁말과 흐림으로 보인다(UI_GUIDE 「수량과 상태를 바꾸는 도식」).
- **두 배치**: 세로형(`viewBox` 폭 280)과 가로형(폭 440)을 함께 만든다. 가로형은 `useWideDiagram()`이 `true`일 때 쓴다. `nodes`·`wideNodes`·경로·`wideGroups`·`wideNotes`를 **한 줄에 하나씩 글자 그대로** 적는다 —
  반복문이나 계산으로 만들지 마라(교차 검사기가 글자로 읽는다). 노드 id·경로 id·시나리오·문구는 두 배치가 함께 쓰고, 고른 시나리오는 배치가 바뀌어도 유지된다.
- **경로**: 직교(M/H/V)만, 노드 변에서 시작하고 끝나며, 다른 노드 상자 안을 지나지 않는다. 늘 보이는 연결선도 같은 경로 선언 꼴(`'id': 'M…'`)로 적는다.
  화살표 마커는 선례와 같고 마커 id는 `useId`로 만든다. 그룹 라벨 영역을 지나는 선분이 없어야 한다. 경로는 그룹 박스가 아니라 노드에서 시작하고 끝난다 — 「서브넷에 건다」처럼 그룹에 무엇을 거는 것은 선이 아니라 그룹 안에 둔 노드나 곁말로 보인다.
  `phases/38-service-diagrams/tools/check-path-crossings.mjs`는 `*Diagram.tsx`의 `const nodes = [`·`const wideNodes = [` 블록에서 `{ id: '…', x: N, y: N, width: N` 순서를, 경로 객체에서 `'id': 'M…'`를 정규식으로 읽는다. 이 형식을 지켜라.
- **물음형 제목**(ADR-038): 그림이 답하는 것 하나를 학습자의 말로. step 문서의 예는 바꿔도 된다.
- **시나리오**: step 문서에 적힌 시나리오를 둔다. 시나리오가 있는 도식은 `전체`(아무것도 고르지 않음)에서 노드가 모두 선명하다.
  두 시나리오의 「선명한 노드 + 보이는 경로 + 보이는 곁말」이 같으면 그 시나리오는 아무것도 가르지 못한다 — 다르게 설계한다. 캡션은 20자를 넘는다(`visuals.test.ts`).
- **금지**: SVG 두 개를 그려 놓고 CSS로 하나를 숨기지 마라. 기준 폭 문자열(`'(min-width: 768px)'`)을 도식 파일에 쓰지 마라(ADR-047). 흐르는 점·자동 재생 같은 애니메이션 금지.
  공용 컴포넌트(`DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`)와 교차 검사기, `src/lib/svg-bounds.ts`를 고치지 마라.
- **registry**: `src/components/diagrams/registry.ts`의 `diagramsByConceptId`에 `'<개념 id>': <컴포넌트>` 한 줄씩. import는 기존 정렬(모듈 경로 알파벳순),
  키는 기존 Azure 키들(`azure-resource-hierarchy.hierarchy`) 뒤에 개념 순서대로.
- **주제의 시각 요소 파일**: 주제를 만드는 step(1·6·11)이 `src/data/azure/visuals/<주제 id>.json`(`{ "diagrams": {}, "tables": {}, "glossary": [] }` 꼴)을 만들고
  `src/data/azure/index.ts`의 `visualsByTopicId`에 `'<주제 id>'`로 넣는다. import 이름은 `azureComputeVisuals`·`azureVirtualNetworkingVisuals`·`azureNetworkProtectionVisuals`,
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

표 테스트(`azureComputeTables.test.tsx`)는 선례 `azureServiceTypesTables.test.tsx`와 같은 것을 본다 — 로더·`glossary`, 이름·열·`columnWidths`·근거(`sources`), 행 순서와 칸 문구, `colgroup`, `ConceptList` 배치.

## 파일 형식

- `topics.json`: 주제 객체는 2칸 들여쓰기, `concepts` 배열의 개념은 **한 줄에 하나**(6칸 들여쓰기 + `JSON.stringify(concept)`). 개념 키 순서는 `id`, `parentId`(있을 때), `name`, `summary`, `paragraphs`.
  주제 키 순서는 `id`, `title`, `importance`, `sourcePages`, `concepts`. 앞 step이 쓴 줄과 다른 주제의 줄은 글자 하나도 바꾸지 않고, 자기 개념을 그 주제의 `concepts` 끝에 덧붙인다.
  주제를 만드는 step은 바로 앞 주제 객체의 닫는 줄 `  }`을 `  },`로 바꾸고 그 뒤에 새 주제를 덧붙인다 — 그 밖의 기존 줄은 바꾸지 않는다.
- `questions.json`: `[` 다음 줄부터 **한 줄에 문항 하나**, 마지막 줄 뒤에 `]`. 키 순서 — 4지선다 `id`, `topicId`, `conceptId`, `format`, `prompt`, `choices`, `answerIndex`, `explanation` /
  예/아니요 `id`, `topicId`, `conceptId`, `format`, `prompt`, `answer`, `explanation`. 기존 줄은 바꾸지 않고 끝에 덧붙인다(마지막 기존 줄 끝에 쉼표 하나를 더하는 것은 예외).
- 파일 끝 줄바꿈 하나. 스크립트로 쓸 때 CRLF로 바꾸지 않는다.
- 이 저장소의 TDD 훅은 테스트 파일 없이 새 `.js`·`.ts` 파일을 쓰지 못하게 막는다. 데이터를 고치는 일회용 스크립트가 필요하면 저장소 밖(임시 디렉터리)에 `.cjs`로 두거나 `node -e`를 쓴다.

## 개념을 넣는 step(1~4·6~9·11~12)의 공통 AC와 검증

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject azure
node -e "const q=require('./src/data/azure/questions.json');const yn=q.filter(x=>x.format==='yes-no');const ch=q.filter(x=>x.format==='choice');const pos=[0,1,2,3].map(i=>ch.filter(x=>x.answerIndex===i).length);console.log('문항',q.length,'마지막',q[q.length-1].id,'정답 위치',pos.join('/'),'예',yn.filter(x=>x.answer).length,'아니요',yn.filter(x=>!x.answer).length)"
git status --porcelain
```

- `check-verbatim`은 「전사 이상 없음」이고 **원본 193개 이상을 대조했다고 나와야 한다**(`raw/`가 없으면 「건너뜀」으로 통과하므로 그때는 blocked로 멈춘다). 균형은 위 「문항」 9항,
  교차 검사기는 「교차 없음」이고 노드·경로 수가 이 step이 더한 만큼 늘어야 한다(앞 step이 끝났을 때의 수는 그 step summary에, phase 시작 값은 「배경」에 있다). **검사기를 고쳐서 통과시키지 마라.**
- **바뀌지 않아야 하는 것을 기계로 확인한다** — `git show HEAD:src/data/azure/topics.json`·`questions.json`과 `visuals/*.json`을 지금 파일과 node로 읽어, 기존 주제 객체·기존 개념·기존 문항·기존 도식 문구가 통째로 같은지 본다.
  AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `git diff --stat`에 나오지 않아야 한다.
- **글로 읽는다** — 그 주제의 개념을 처음부터 이 step의 개념까지 처음 배우는 사람의 눈으로 통독하고, 풀이 없이 처음 나오는 낱말을 세어 본다(도식 문구 포함). 진행 안내 문장이 없는지도 본다.
  불변식과 테스트는 이런 결함을 잡지 못한다. 브라우저 화면 실측은 하지 않는다(「배경」의 시간 제한 — phase 끝에 메인 세션이 한다).
- 이모지·O/X·빨강·초록·주황·도식 전용 두 색·16진 색·애니메이션·기준 폭 문자열이 새 파일에 없는지 `grep`으로 본다.
- 바뀐 파일은 `src/data/azure/topics.json`·`questions.json`·`visuals/<주제>.json`(과 주제를 만드는 step은 `src/data/azure/index.ts`), 새 도식 컴포넌트와 테스트(step 4는 표 컴포넌트와 테스트),
  `src/components/diagrams/registry.ts`, `docs/source/azure/official.md`(「쓰인 곳」과 더한 사실), phase 메타데이터뿐이어야 한다.

**summary에 적을 것**(사용자가 이것을 읽고 판단한다): 개념마다 id·name과 **새 요약문 전문**, 문항마다 id·개념·형식·고른 방식·**문제문 전문**·정답, 균형 줄(예/아니요·정답 위치),
도식마다 이름·두 배치의 `viewBox`·시나리오별 선명한 노드·경로·곁말과 캡션 요지·물음형 제목·요점 테스트, 설계 의도와 달라진 점과 이유,
`official.md`에 더한 사실, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수, 걸린 시간의 어림. 끝에 「사용자 확인」 칸(없으면 「없음」).

## 출처 step(0·5·10)의 공통 형식

- `official.md` 항목: `## (phase 103) <문서 제목> — <단원·절 제목>`, URL 한 줄, 확인한 날, 직접 쓴 사실 한 줄씩(끝에 `— 「절 제목」`), **한국어 표기** 줄, 「쓰일 곳」(개념 id와 D·G 번호).
  앞 phase가 이미 둔 항목(예: 「(phase 100) Azure Virtual Machines — Virtual machines in Azure」, 「(phase 102) Azure Virtual Network — What is Azure Virtual Network?」)은 새 항목을 만들지 말고 그 항목에 사실 줄과 「쓰일 곳」을 덧붙인다 — 덧붙인 줄 끝에 `(phase 103)`.
  **Learn 단원 항목**: 앞 phase의 「Learn 「Describe Azure compute services」 — 2 …」·「— 6 …」 항목은 옛 모듈 이름이다 — 같은 단원이면 그 항목에 덧붙이고, 네트워킹 단원은 새 모듈 이름으로 새 항목을 둔다.
  주제마다 「한국어 표기 정리 — `<주제 id>`」 항목을 하나 둔다(앞 phase의 항목이 본보기 — 개념마다 확정한 `name`과 근거 문서, 섞여 쓰인 표기와 고른 까닭).
- `corrections.md` 항목: `## D51 — <짧은 제목> (phase 103)`부터 덤프, `## G27 — … (phase 103)`부터 용어집. 짜임은 앞 phase 항목과 같다 — **덤프/용어집**(문항 번호·쪽-번호와 주장) · **공식 문서** · **처리**(고쳐 쓴다 / 한정해 쓴다 / 쓰지 않는다) · **쓰인 곳**.
  덤프 답이 공식 문서와 **맞는** 문항은 항목을 만들지 않는다 — summary에 「확인 결과 덤프가 맞다」로 적는다. 덤프끼리 답이 갈리는 문항은 항목으로 남긴다.
  D·G 번호는 앞 출처 step이 쓴 마지막 번호 다음부터 잇는다(step 5는 step 0의 마지막 번호 다음, step 10은 step 5의 다음).
- 그림으로만 표시된 덤프 정답은 OCR 글자나 `index.json`의 `answer`를 믿지 말고 `raw/dump/img/`의 그림을 직접 본다(`docs/source/azure/CLAUDE.md` 「덤프의 그림을 보는 법」).
- **시간을 나눠 쓴다** — 주제마다 덤프 문항이 15~23개다. 하나하나 끝까지 읽으면 30분을 넘길 수 있다(넘기면 step이 처음부터 다시 돈다).
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
- **서비스마다의 SLA 수치, 가격, 지역 수·데이터 센터 수, 대역폭 수치를 본문·문항·도식에 쓰지 마라.** 이유: 약관 원문을 받아 확인할 수 없거나(SLA), 계속 바뀌는 수다(「배경」).
- **다른 주제의 몫(스토리지의 종류, Microsoft Entra ID, 심층 방어, Azure RBAC, 비용 요인)을 개념으로 세우거나 자세히 쓰지 마라.** 이유: 그 주제를 만드는 phase의 범위다. 필요한 낱말은 그 자리에서 한 줄로 푼다.
- **「배경」이 쓰지 않기로 한 것(VM 크기 계열 표, VPN 종류와 활성 구성, ExpressRoute 연결 모델, 경로 테이블·BGP의 세부, 서비스 엔드포인트, OSI 계층)을 쓰지 마라.** 이유: 학습 가이드의 줄에 없고 덤프도 거의 묻지 않는 세부라 개념을 흐린다.
