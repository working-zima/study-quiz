# Step 12: firewall-ddos

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/103-azure-compute-networking/guide.md`에 있다.
**이 step은 주제 `azure-network-protection`의 나머지 개념 둘(20 Azure Firewall, 21 Azure DDoS Protection)의 글·문항과 도식 `FirewallHubDiagram`·`DdosProtectionDiagram`을 만든다.** 이 step이 phase 103의 마지막 step이다.

세 서비스(NSG·Azure Firewall·DDoS Protection)는 **무엇을 막고, 어디에 거는가**로 갈린다 — 포트·IP 주소로 허용하고 막는 규칙을 서브넷·네트워크 인터페이스에(NSG),
여러 가상 네트워크와 구독의 규칙을 한곳에서(Azure Firewall), 서비스를 쓰지 못하게 하려고 퍼붓는 트래픽을 견디는 것(DDoS Protection). 이 step의 글은 앞 개념 NSG를 되짚으며 이 차이를 세운다.

사실은 step 10이 확인해 `official.md`에 남긴 것에서만 가져온다.

## 읽어야 할 파일

- **`phases/103-azure-compute-networking/guide.md` 전체**
- `phases/103-azure-compute-networking/index.json`의 step 10 `summary`(Azure Firewall의 「중앙」을 쓸 말, 규칙 종류의 현행 이름, DDoS Protection의 현행 종류와 옛 이름 처리, 암호화 처리)와 step 11 `summary`(이 주제가 이미 푼 낱말, 교차 검사 수, 균형 줄)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」)
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-network-protection`(개념 18·19)과 앞 주제 `azure-cloud-benefits.security-governance`(DDoS 공격을 푼 한 줄) — 같은 말을 되풀이하지 않는다
- 도식 선례 — step 11의 두 도식과 `src/data/azure/visuals/azure-network-protection.json`

## 작업

### 1. 개념 — `azure-network-protection` 주제의 `concepts` 끝에 덧붙인다

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 20 | `azure-network-protection.azure-firewall` | Azure Firewall | — | **방화벽**·**상태 저장**·**워크로드**·**구독**·**NAT**를 한 줄씩 푼다. NSG(개념 18)를 되짚어 「거는 곳과 거르는 것의 폭」으로 견준다. 규칙 종류 셋은 이름과 한 줄 뜻으로만. SKU는 쓰지 않거나 이름만. **도식의 예를 본문에 쓴다** — 회사 F가 가상 네트워크 A·B의 VM이 인터넷으로 나가는 트래픽과 서로 오가는 트래픽이 한곳의 Azure Firewall을 지나게 구성한다(step 10이 확인한 말로 — 「지나게 구성한다」의 방법(경로 설정)은 쓰지 않는다) |
| 21 | `azure-network-protection.ddos-protection` | Azure DDoS Protection | — | **DDoS(분산 서비스 거부) 공격**을 이 주제에서 다시 푼다(phase 101이 정한 표기). 현행 종류는 step 10이 정한 이름으로 — 덤프·용어집의 옛 이름(Basic/Standard)을 쓰지 않는다. 「하지 않는 것」을 한 문단으로 — 특정 포트를 여는 것은 NSG(개념 18을 되짚는다), 웹 앱 계층의 공격은 step 10이 확인한 것만. **도식의 예를 본문에 쓴다** — 회사 G의 웹 서버 VM 1이 공용 IP 주소로 인터넷에 열려 있고, 공격 트래픽이 몰려오면 DDoS Protection이 그것을 걸러 내고 정상 사용자의 트래픽은 계속 VM 1에 닿는다 |

### 2. 문항 — `az083`~`az085`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az083` | `azure-firewall` | 4지선다 「개념 비교」 — 여러 구독의 여러 가상 네트워크에서 오가는 트래픽 규칙을 한곳에서 만들고 적용하고 기록하려 한다(Azure Firewall — step 10 결과대로). 오답은 같은 범주(네트워크 트래픽을 거르거나 지키는 서비스): NSG(서브넷·네트워크 인터페이스마다 건다 — 「한곳에서」가 가른다), DDoS Protection, 프라이빗 엔드포인트처럼 이 주제에서 한 줄로 풀 수 있는 것. 보기마다 이 주제 밖의 낱말이면 보기 안에서 푼다 |
| `az084` | `azure-firewall` | 예/아니요 「흔한 오해」 — Azure Firewall을 지나가는 트래픽은 방화벽이 암호화해 주는가(아니요 — step 10의 처리대로, NO.284·483). 해설은 Azure Firewall이 하는 일(규칙으로 허용·거부, 기록)과 암호화가 필요할 때 쓰는 것(이 phase의 VPN 게이트웨이처럼 — 이 주제에서 한 줄로 푼다)을 가르친다. 균형을 보고 주장의 방향을 바꿔도 된다 |
| `az085` | `ddos-protection` | 예/아니요 또는 4지선다 — 인터넷에서 VM으로 HTTP 요청이 들어오게 하려고 DDoS Protection의 설정을 바꾸면 되는가(아니요 — 그것은 NSG의 인바운드 규칙, NO.163의 사실을 문장은 직접 만들어), 또는 공격 트래픽이 몰려와 웹 서비스가 느려질 때 쓰는 서비스를 고르는 상황(DDoS Protection — 오답 NSG·Azure Firewall·VPN 게이트웨이). 균형을 보고 고른다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 11 summary의 균형 줄이다. **이 step이 phase의 마지막 문항이므로 균형을 특히 확인한다.**

### 3. 도식 — `src/data/azure/visuals/azure-network-protection.json`의 `diagrams`에 두 키를 더한다(앞 키는 바꾸지 않는다)

#### `azure-network-protection.azure-firewall` — `FirewallHubDiagram`, JSON 키 `firewall-hub`

- 물음형 제목 예: `여러 가상 네트워크의 트래픽을 한곳에서 거르려면?`
- 그릴 것: 그룹 박스 `vnet-a`(「가상 네트워크 A」)·`vnet-b`(「가상 네트워크 B」) — 각 안에 노드 `vm-1`·`vm-2`. 노드 `firewall`(「Azure Firewall」)을 둘 사이 한곳에(그룹 박스 `fw-vnet`으로 감싸도 된다 — 감싸면 라벨은 step 10이 확인한 말로), 그룹 밖에 노드 `internet`(「인터넷」).
  경로 — `a-to-fw`(`vm-1` → `firewall`), `b-to-fw`(`vm-2` → `firewall`), `fw-to-internet`(`firewall` → `internet`), `fw-to-b`(`firewall` → `vm-2`). 모두 시나리오에서만 보인다.
  `a-to-fw`와 `fw-to-b`처럼 같은 두 노드 사이를 오가는 선이 겹치면 경로를 다르게 잡거나 시나리오를 나눈다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `outbound` | 인터넷으로 나갈 때 | `vm-1`·`vm-2`·`firewall`·`internet` | `a-to-fw`·`b-to-fw`·`fw-to-internet` | `firewall` 옆 「규칙 한 벌로 거름」 | 두 가상 네트워크의 VM이 인터넷으로 나가는 트래픽이 한곳의 Azure Firewall을 지나, 한 벌의 규칙으로 허용되거나 거부된다 |
  | `between` | 가상 네트워크 사이 | `vm-1`·`firewall`·`vm-2` | `a-to-fw`·`fw-to-b` | `fw-to-b` 근처 「가상 네트워크 사이도 거름」 | 가상 네트워크 A에서 B로 가는 트래픽도 Azure Firewall을 지나며 규칙으로 걸러진다 |

  두 시나리오의 「선명한 노드 + 보이는 경로 + 곁말」이 달라야 한다 — `between`에서 `internet`이 opacity `0.25`다.
- 요점 테스트:
  - `vm-1`이 `vnet-a` 안, `vm-2`가 `vnet-b` 안이고, `firewall`은 `vnet-a`·`vnet-b` 어느 박스에도 들지 않는다(세로형·가로형 모두).
  - 두 시나리오 모두 보이는 경로마다 한 끝이 `firewall`의 변 위다 — VM끼리, VM과 인터넷이 바로 잇는 경로가 없다.
  - `between`에서 `internet`이 `0.25`다.

#### `azure-network-protection.ddos-protection` — `DdosProtectionDiagram`, JSON 키 `ddos-protection`

- 물음형 제목 예: `공격 트래픽이 몰려올 때, DDoS Protection은 무엇을 걸러 낼까?`
- 그릴 것: 노드 `users`(「정상 사용자」)·`attack`(「공격 트래픽」)·`ddos`(「DDoS Protection」), 그룹 박스 `vnet`(「가상 네트워크」) 안에 노드 `public-ip`(「공용 IP 주소」)·`vm-1`(「VM 1」).
  늘 보이는 연결선 — `public-ip`와 `vm-1`(`link-ip`). 경로 — `users-in`(`users` → `ddos`), `pass`(`ddos` → `public-ip`), `attack-in`(`attack` → `ddos`). 셋 모두 시나리오에서만 보인다.
  `attack`에서 `public-ip`로 바로 가는 경로는 두지 않는다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `normal` | 평소 | `users`·`ddos`·`public-ip`·`vm-1` | `users-in`·`pass` | `ddos` 옆 「트래픽을 지켜봄」 | 평소에는 DDoS Protection이 공용 IP 주소로 오는 트래픽을 지켜보고, 정상 트래픽은 VM 1에 닿는다 |
  | `attack` | 공격이 올 때 | 다섯 모두 | `users-in`·`attack-in`·`pass` | `attack-in` 근처 「걸러 냄」, `pass` 근처 「정상 트래픽은 계속 통과」 | 공격을 알아차리면 공격 트래픽은 걸러 내고, 정상 사용자의 트래픽은 계속 VM 1에 닿게 한다 |

  「걸러진 공격」은 색이 아니라 곁말로 보인다(UI_GUIDE 「수량과 상태를 바꾸는 도식」).
- 요점 테스트:
  - `public-ip`·`vm-1`이 `vnet` 안이고 `users`·`attack`·`ddos`는 밖이다(세로형·가로형 모두).
  - `attack-in`의 끝점이 `ddos`의 변 위이고, 어느 시나리오에서도 `attack`의 변에서 시작해 `public-ip`·`vm-1`의 변에 닿는 경로가 없다.
  - `normal`에서 `attack`이 opacity `0.25`이고 `attack-in`이 보이지 않는다.

두 도식 모두 캡션·곁말의 사실은 개념 20·21 본문에 있어야 한다(ADR-036·038). 위 설계는 출발점이다 — 본문(step 10 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-network-protection.azure-firewall': FirewallHubDiagram`, `'azure-network-protection.ddos-protection': DdosProtectionDiagram` 두 줄(`azure-network-protection.security-rules` 키 뒤, 개념 순서대로).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 두 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다. **phase 103의 개념이 모두 생겼으므로**, `official.md`와 `corrections.md`에서 `(phase 103)` 항목의 「쓰일 곳」이 남아 있지 않은지 `grep`으로 본다 —
남은 줄은 그 개념 id가 실제로 있으면 고치고, 없는 id를 가리키면 고치지 말고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~9·11~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 주제는 10개, 개념은 62개(앞 41 + 21), 문항은 85개, 마지막 id는 `az085`다. 예/아니요 차이 1 이하, 정답 위치 차이 2 이하.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 앞 step이 쓴 개념·문항(`az056`~`az082`)·도식 문구가 그대로인지 기계로 본다.
3. 주제 `azure-network-protection`의 개념 18~21을 처음부터 통독한다 — 세 서비스가 「무엇을 막고, 어디에 거는가」로 갈리는가, 풀이 없이 처음 나오는 낱말·진행 안내가 없는가.
4. `phases/103-azure-compute-networking/index.json`의 step 12를 갱신한다(성공 → guide.md 「summary에 적을 것」, 3회 실패 → `error`, `check-verbatim` 「건너뜀」 → `blocked`).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **허브-스포크 같은 네트워크 설계 이름, 경로 테이블·사용자 정의 경로로 트래픽을 방화벽에 보내는 방법을 쓰지 마라.** 이유: guide.md 「배경」 — 「한곳을 지나게 구성한다」까지가 이 과목의 범위다.
- **DDoS Protection의 가격·보호하는 공용 IP 수 같은 수치를 쓰지 마라.** 이유: guide.md 「배경」.
- **심층 방어의 계층, 웹 애플리케이션 방화벽·Azure Bastion을 개념으로 세우거나 자세히 쓰지 마라.** 이유: 다른 주제의 몫이거나 범위 밖이다. 필요하면 한 줄로 그친다.
