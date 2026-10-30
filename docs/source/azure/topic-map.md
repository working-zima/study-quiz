# Azure AZ-900 과목의 주제 지도 — 주제 20개

Azure AZ-900 과목에 둘 주제 20개의 지도다. 주제를 **앱의 주제 순서**대로 늘어놓고, 주제마다 공식 학습 가이드의 묶음·덤프 문항 수·별점·만들 phase를 적는다.
범위(공식 학습 가이드가 뼈대, 가이드 밖이라도 용어집에 있고 덤프도 묻는 현행 서비스는 넣는다)와 도식의 양은 사용자 결정이다(2026-10-30).
이 지도는 설계 세션이 초안을 만들고 사용자가 「고칠 것 없음」으로 확인했다(2026-10-30).

- **근거**: 덤프 V27.35의 506문항을 문항마다 읽고 정답을 가르는 지식으로 나눴다(`dump-topics.tsv`). 거의 같은 문항 17개(문항 글자의 자카드 유사도 0.9 이상)는
  먼저 나온 문항에 묶고 세지 않아, 고유 문항은 489개다.
  - **넣는 범위 441문항(90%)** — 주제 20개에 440, 주제로 세우지 않은 부하 분산 1(아래 「넣지 않는 것」).
  - **빼는 범위 밖 48문항** — 데이터·AI·IoT 18, 신뢰·개인정보 13, 지원 플랜 12, DevOps 3, 기타 2.
- 주제 순서는 공식 학습 가이드(`learn.microsoft.com`의 AZ-900 학습 가이드, 2026-07-20 기준 3영역 11묶음)의 순서다.
- 덤프 문장은 옮기지 않았다(ADR-009). 이 문서와 `dump-topics.tsv`에 있는 것은 숫자와, 직접 쓴 주제 이름·범위·메모뿐이다.
- 사실은 덤프가 아니라 Microsoft 공식 문서에서 가져온다. 출처를 쓰는 규칙은 `docs/source/azure/CLAUDE.md`가 정한다.

## 별점 규칙

별점은 주제 단위다. 그 주제가 대표(`dump-topics.tsv`의 `primary`)인 **고유 문항 수**로 정한다.

| 고유 문항 | 별점 | `importance` |
|---|---|---|
| 25 이상 | ★★★ | 3 |
| 13~24 | ★★☆ | 2 |
| 12 이하 | — | 0 |

분포는 ★★★ 9 · ★★☆ 9 · 별점 없음 2다. 별점의 뜻은 다른 과목과 같다 — 무엇을 먼저 읽을지를 정하는 값이다(ADR-026).
네트워크 과목처럼 출제 회차로 매기지 않는 것은 덤프에 시험 회차가 없기 때문이다.

## 이 지도를 바꾸는 법

- **주제를 더하거나 나누거나 합치려면 ADR이 필요하다.** 주제 목록이 곧 과목의 범위이기 때문이다. 주제 id는 바꾸지 않는다 — 데이터 테스트와 뒤 phase가 이 id로 일한다.
- 문항을 어느 주제에 넣을지 판단을 바꾸면 `dump-topics.tsv`를 고치고 수를 다시 센다. 수가 경계를 넘으면 별점도 바뀐다.
- 별점은 `src/data/azure/topics.json`의 `importance`와 그것을 지키는 `src/data/azure/data.test.ts`의 표에도 들어간다. 이 지도를 바꾸면 그 둘도 함께 바꾼다.

## 주제 지도

「학습 가이드의 묶음」은 공식 학습 가이드의 묶음 이름(영문) 그대로다. `*`는 학습 가이드 밖이지만 넣기로 한 것이다(사용자 결정 2026-10-30).
「문항」은 그 주제가 대표인 고유 문항 수다.

| 순서 | 주제 id | 제목 | 다루는 것 | 학습 가이드의 묶음 | 문항 | 별점 | phase |
|---|---|---|---|---|---|---|---|
| 1 | `azure-cloud-computing` | 클라우드 컴퓨팅과 비용 모델 | 정의, CapEx/OpEx, 소비 기반 모델, 가격 모델(종량제·예약·스팟), 서버리스 | Describe cloud computing | 16 | ★★☆ | 100 |
| 2 | `azure-cloud-models` | 클라우드 배포 모델 | 퍼블릭·프라이빗·하이브리드(·멀티), 사용 사례 | Describe cloud computing | 17 | ★★☆ | 100 |
| 3 | `azure-cloud-benefits` | 클라우드의 이점 | 고가용성·확장성·탄력성·안정성·예측 가능성·보안·거버넌스·관리 효율성 | Describe the benefits of using cloud services | 24 | ★★☆ | 101 |
| 4 | `azure-sla-lifecycle`* | SLA와 서비스 수명 주기 | SLA·서비스 크레딧·복합 SLA, 비공개/공개 미리 보기·GA | — (가이드 밖) | 23 | ★★☆ | 101 |
| 5 | `azure-service-types` | 서비스 유형과 공동 책임 | IaaS·PaaS·SaaS와 사용 사례, 공동 책임 모델 | Describe cloud service types (공동 책임 모델은 Describe cloud computing) | 34 | ★★★ | 101 |
| 6 | `azure-regions-zones` | 지역과 가용성 영역 | 지역·지역 쌍·소버린 지역·가용성 영역·데이터 센터 | Describe the core architectural components of Azure | 26 | ★★★ | 102 |
| 7 | `azure-resource-hierarchy` | 리소스 계층 | 리소스·리소스 그룹·구독·관리 그룹·계층과 상속 | Describe the core architectural components of Azure | 25 | ★★★ | 102 |
| 8 | `azure-compute` | 컴퓨팅과 앱 호스팅 | VM·확장 집합·가용성 집합·AVD·VM 리소스, 컨테이너(ACI·AKS)·Functions·App Service | Describe Azure compute and networking services | 16 | ★★☆ | 103 |
| 9 | `azure-virtual-networking` | 가상 네트워크와 연결 | VNet·서브넷·피어링·Azure DNS·VPN Gateway·ExpressRoute·공용/프라이빗 엔드포인트 | Describe Azure compute and networking services | 15 | ★★☆ | 103 |
| 10 | `azure-network-protection`* | 네트워크 보호 | NSG·Azure Firewall·DDoS Protection | — (가이드 밖) | 20 | ★★☆ | 103 |
| 11 | `azure-storage` | 스토리지 | 스토리지 계정·Blob/Files/Queue/Table/Disk·액세스 계층·중복성 | Describe Azure storage services | 22 | ★★☆ | 104 |
| 12 | `azure-data-movement` | 데이터 이동과 마이그레이션 | AzCopy·Storage Explorer·File Sync·Azure Migrate·Data Box | Describe Azure storage services | 3 | — | 104 |
| 13 | `azure-identity` | ID와 인증 | Entra ID·Domain Services·SSO·MFA·암호 없는 인증·외부 ID·조건부 액세스 | Describe Azure identity, access, and security | 29 | ★★★ | 105 |
| 14 | `azure-security-model` | 접근 제어와 보안 도구 | RBAC·제로 트러스트·심층 방어·Defender for Cloud·Key Vault*·Sentinel* | Describe Azure identity, access, and security | 25 | ★★★ | 105 |
| 15 | `azure-cost-factors` | 비용 요인과 계산기 | 리소스·지역·대역폭·미사용 리소스·중지와 할당 해제·예약·Hybrid Benefit·가격/TCO 계산기 | Describe cost management in Azure | 28 | ★★★ | 106 |
| 16 | `azure-cost-management` | 비용 관리와 태그 | Cost Management·예산·경고·태그·무료 계정·지출 한도 | Describe cost management in Azure | 16 | ★★☆ | 106 |
| 17 | `azure-governance` | 거버넌스와 규정 준수 | Purview(정보 보호 포함)·Azure Policy·리소스 잠금 | Describe features and tools in Azure for governance and compliance | 29 | ★★★ | 107 |
| 18 | `azure-management-tools` | 관리 도구 | 포털·Cloud Shell·Azure CLI·Azure PowerShell·모바일 앱·Azure Arc | Describe features and tools for managing and deploying Azure resources | 30 | ★★★ | 107 |
| 19 | `azure-infrastructure-as-code` | ARM과 코드형 인프라 | IaC·Azure Resource Manager·ARM 템플릿·Bicep | Describe features and tools for managing and deploying Azure resources | 9 | — | 107 |
| 20 | `azure-monitoring` | 모니터링 | Advisor·Service Health·Azure Monitor(Log Analytics·경고·Application Insights·활동 로그) | Describe monitoring tools in Azure | 33 | ★★★ | 108 |

**합계** — 주제 20개, 문항 440. ★★★ 9개, ★★☆ 9개, 별점 없음 2개(`azure-data-movement`, `azure-infrastructure-as-code`).

## phase 계획

phase 번호는 100부터다 — 네트워크 과목이 75~85를 예약했다. 아래 번호는 계획이다 — 앞 phase를 화면으로 확인한 뒤 바뀔 수 있다.

- **100** — 과목의 틀·출처 문서, `azure-cloud-computing`, `azure-cloud-models`
- **101** — `azure-cloud-benefits`, `azure-sla-lifecycle`, `azure-service-types`
- **102** — `azure-regions-zones`, `azure-resource-hierarchy`
- **103** — `azure-compute`, `azure-virtual-networking`, `azure-network-protection`
- **104** — `azure-storage`, `azure-data-movement`
- **105** — `azure-identity`, `azure-security-model`
- **106** — `azure-cost-factors`, `azure-cost-management`
- **107** — `azure-governance`, `azure-management-tools`, `azure-infrastructure-as-code`
- **108** — `azure-monitoring`

## 넣지 않는 것

덤프가 묻지만 주제로 두지 않는 범위다. 모두 지금 학습 가이드 밖이고, 가이드 밖에서 넣기로 한 현행 서비스(NSG·Azure Firewall·DDoS Protection·Key Vault·Sentinel, SLA와 서비스 수명 주기)에도
들지 않아 넣지 않기로 했다(사용자 결정 2026-10-30).

| 갈래(라벨) | 고유 문항 | 무엇 |
|---|---|---|
| 데이터·AI·IoT (`x-data-ai-iot`) | 18 | 데이터베이스·분석·기계 학습·AI·봇·IoT·이벤트·메시징·워크플로 서비스 |
| 신뢰·개인정보 (`x-trust-privacy`) | 13 | 신뢰 포털·개인정보 처리 방침·약관·규정 준수 관리자·규제 인증 |
| 지원 플랜 (`x-support`) | 12 | 지원 플랜과 지원 요청 경로 |
| DevOps (`x-devops`) | 3 | Azure DevOps·GitHub·DevTest Labs |
| 기타 (`x-other`) | 2 | Marketplace, Service Fabric |

- **부하 분산**은 대표 문항이 1개(NO.402, CDN)뿐이라 주제로 세우지 않았다. 이 문항은 「넣는 범위」로 셌지만 주제 20개의 수에는 들지 않는다.
- **Azure Bastion·WAF**는 분류 라벨 `network-protection`의 범위에 있었지만 대표로 묻는 문항이 없어 `azure-network-protection`에서 뺐다.

## 초안에서 바꾼 것

분류에 쓴 라벨(`raw/analysis/topic-draft.md`)에서 주제 20개로 옮기며 바꾼 것이다.

- 공동 책임 모델(8문항)을 서비스 유형에 합쳤다 — IaaS·PaaS·SaaS에서 누가 무엇을 책임지는지 보여 주는 그림 하나가 두 주제의 중심이라서다.
- VM(6)과 앱 호스팅(10)을 「컴퓨팅과 앱 호스팅」으로 합쳤다.
- 비용(44)을 요인·계산기(28)와 관리·태그(16)로, 관리 도구(39)를 도구·Arc(30)와 ARM·코드형 인프라(9)로 나눴다.

## 분류 라벨과 주제 id

`dump-topics.tsv`의 `primary`·`secondary` 열은 분류 때 쓴 라벨이다. 라벨과 주제 id는 아래처럼 대응한다.
「고유 문항」은 그 라벨이 `primary`이고 `dup_of`가 빈 줄의 수다. `secondary`는 함께 걸린 라벨을 적어 둔 것이고 수에 들지 않는다.

| 라벨 | 고유 문항 | 주제 id |
|---|---|---|
| `cloud-computing` | 16 | `azure-cloud-computing` |
| `cloud-models` | 17 | `azure-cloud-models` |
| `cloud-benefits` | 24 | `azure-cloud-benefits` |
| `sla-lifecycle` | 23 | `azure-sla-lifecycle` |
| `service-types` | 26 | `azure-service-types` |
| `shared-responsibility` | 8 | `azure-service-types` |
| `regions-zones` | 26 | `azure-regions-zones` |
| `resource-hierarchy` | 25 | `azure-resource-hierarchy` |
| `virtual-machines` | 6 | `azure-compute` |
| `app-hosting` | 10 | `azure-compute` |
| `virtual-networking` | 15 | `azure-virtual-networking` |
| `network-protection` | 20 | `azure-network-protection` |
| `load-balancing` | 1 | 넣지 않음 |
| `storage-services` | 22 | `azure-storage` |
| `data-movement` | 3 | `azure-data-movement` |
| `identity` | 29 | `azure-identity` |
| `security-model` | 25 | `azure-security-model` |
| `cost-management` | 44 | `azure-cost-factors` 28 · `azure-cost-management` 16 |
| `governance` | 29 | `azure-governance` |
| `management-tools` | 39 | `azure-management-tools` 30 · `azure-infrastructure-as-code` 9 |
| `monitoring` | 33 | `azure-monitoring` |
| `x-data-ai-iot` · `x-trust-privacy` · `x-support` · `x-devops` · `x-other` | 18 · 13 · 12 · 3 · 2 | 넣지 않음 |

**두 라벨은 두 주제로 나뉜다.** `cost-management`(44)는 `azure-cost-factors`(28)와 `azure-cost-management`(16)로, `management-tools`(39)는
`azure-management-tools`(30)와 `azure-infrastructure-as-code`(9)로 간다. 28·16·30·9는 설계 때 센 수다.
문항마다 어느 쪽인지는 그 주제를 만드는 phase(106·107)가 `dump-topics.tsv`의 메모를 보고 정해 이 표에 적고, 수가 바뀌어 별점이 달라지면 이 지도와 테스트를 함께 고친다.

**숫자의 한계.** 분류는 한 사람이 한 번 읽고 정한 것이고 그림으로만 된 문항도 있어, 경계 문항을 옮기면 주제별 수가 ±1~3쯤 움직인다.
문항 몇 개로 별점이 바뀔 수 있는 주제는 다음과 같다.

- 25(★★★의 하한): `azure-resource-hierarchy`, `azure-security-model`
- 24(★★★ 바로 아래): `azure-cloud-benefits`
- 아직 나누지 않은 수: `azure-cost-management` 16(★★☆의 하한 13까지 3), `azure-infrastructure-as-code` 9(★★☆까지 4)

## 덤프 정답이 의심스러운 문항

분류하다 발견한 것이다. 공식 문서로 아직 확인하지 않았다. **그 주제를 만드는 phase가 공식 문서로 확인해 `corrections.md`에 남긴다.**

- NO.1 — 이벤트를 한곳에 모으는 문항. 덤프 답은 Event Hubs인데 묻는 것은 모니터링(Log Analytics) 쪽으로 보인다.
- NO.103 — Site Recovery의 이점. 덤프 답은 내결함성인데 재해 복구로 보인다.
- NO.126 — 서버리스의 예. 덤프 답은 Virtual Machines인데 Functions로 보인다.
- NO.100 — 문제문(운영 체제별 관리 도구)과 그림(Advisor에 관한 진술)이 어긋난다.
