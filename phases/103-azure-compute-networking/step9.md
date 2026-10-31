# Step 9: expressroute-dns

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/103-azure-compute-networking/guide.md`에 있다.
**이 step은 주제 `azure-virtual-networking`의 나머지 개념 둘(16 ExpressRoute, 17 Azure DNS)의 글·문항과 도식 `ExpressRouteDiagram`을 만든다.** 이 step이 끝나면 주제 `azure-virtual-networking`이 완성된다.

ExpressRoute는 앞 개념(VPN 게이트웨이)과 **지나는 길**로 갈린다 — VPN은 인터넷 위의 암호화된 터널, ExpressRoute는 연결 공급자를 거쳐 인터넷을 지나지 않는 사설 연결. 도식이 두 길을 시나리오로 나란히 보인다.
Azure DNS는 정의형이라 도식이 없다 — 「도메인 이름을 살 수 없다」는 흔한 오해를 문항으로 바로잡는다.

사실은 step 5가 확인해 `official.md`에 남긴 것에서만 가져온다.

## 읽어야 할 파일

- **`phases/103-azure-compute-networking/guide.md` 전체**
- `phases/103-azure-compute-networking/index.json`의 step 5 `summary`(ExpressRoute·Azure DNS의 사실, NO.119의 처리)와 step 8 `summary`(교차 검사 수, 균형 줄)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-virtual-networking`(개념 10~15)과 앞 주제 `azure-regions-zones.region`(Azure DNS를 지역을 고르지 않는 서비스로 푼 줄) — 같은 말을 되풀이하지 않는다
- 도식 선례 — step 8의 `SiteToSiteVpnDiagram`과 `src/data/azure/visuals/azure-virtual-networking.json`

## 작업

### 1. 개념 — `azure-virtual-networking` 주제의 `concepts` 끝에 덧붙인다

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 16 | `azure-virtual-networking.expressroute` | ExpressRoute | — | **연결 공급자**·**회로**·**BGP**·**라우팅**·**Microsoft 365**를 한 줄씩 푼다. VPN 게이트웨이(개념 14)를 되짚어 지나는 길로 견준다. 특징 넷은 한 문단에 한 줄씩 — 마케팅 어조(「더 빠르고」를 꾸밈말로)를 옮기지 말고 왜 그런지(인터넷을 지나지 않으므로)를 쓴다. **도식의 예를 본문에 쓴다** — 회사 D의 온-프레미스 네트워크가 연결 공급자를 거쳐 Azure 가상 네트워크와 Microsoft 365에 닿는다 |
| 17 | `azure-virtual-networking.azure-dns` | Azure DNS | — | **DNS**(개념 10이 풀었으면 되짚는다)·**도메인**·**레코드**·**이름 서버**·**애니캐스트**를 한 줄씩 푼다. 「접근 제어·활동 로그·리소스 잠금」은 이름을 늘어놓지 말고 「누가 바꿀 수 있는지 정하고, 바꾼 기록을 남기고, 지우지 못하게 잠그는」처럼 하는 일로 쓴다. 도메인을 사는 곳과 호스트하는 곳이 다르다는 것을 4절대로 |

### 2. 문항 — `az076`~`az078`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az076` | `expressroute` | 4지선다 「개념 비교」 — 온-프레미스 데이터 센터와 Azure 사이의 연결이 공용 인터넷을 지나지 않아야 하고 대기 시간이 고르게 예측되어야 한다(ExpressRoute). 오답은 같은 범주(온-프레미스나 다른 네트워크와 잇는 방법): 사이트 간 VPN, 지점 및 사이트 간 VPN, 가상 네트워크 피어링. 사이트 간 VPN과 갈리게 「인터넷을 지나지 않아야」를 문제문에 준다 |
| `az077` | `expressroute` | 예/아니요 — ExpressRoute를 쓰면 DNS 쿼리까지 모든 트래픽이 사설 연결로만 다니는가(아니요 — step 5가 확인한 대로), 또는 ExpressRoute로 Azure뿐 아니라 Microsoft 365에도 닿는가(예). 균형을 보고 하나를 고른다. 해설은 ExpressRoute가 무엇에 닿고 무엇이 여전히 인터넷으로 가는지 가르친다 |
| `az078` | `azure-dns` | 예/아니요 「흔한 오해」 — 회사가 새 도메인 이름을 Azure DNS에서 사서 등록할 수 있는가(아니요 — 다른 곳에서 사서 Azure DNS에 호스트한다). 해설은 Azure DNS가 하는 일(레코드 관리, 같은 자격 증명·청구)을 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 8 summary의 균형 줄이다.

### 3. 도식 — `src/data/azure/visuals/azure-virtual-networking.json`의 `diagrams`에 한 키를 더한다(앞 키는 바꾸지 않는다)

#### `azure-virtual-networking.expressroute` — `ExpressRouteDiagram`, JSON 키 `expressroute`

- 물음형 제목 예: `ExpressRoute 연결은 사이트 간 VPN과 어느 길로 다르게 다닐까?`
- 그릴 것: 노드 `onprem`(「온-프레미스 네트워크」)·`provider`(「연결 공급자」)·`internet`(「공용 인터넷」), 그룹 박스 `microsoft`(「Microsoft 클라우드」) 안에 노드 `vnet`(「Azure 가상 네트워크」)·`m365`(「Microsoft 365」).
  경로 — `er-in`(`onprem` → `provider`), `er-vnet`(`provider` → `vnet`), `er-m365`(`provider` → `m365`), `vpn-in`(`onprem` → `internet`), `vpn-vnet`(`internet` → `vnet`). 모두 시나리오에서만 보인다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `expressroute` | ExpressRoute | `onprem`·`provider`·`vnet`·`m365` | `er-in`·`er-vnet`·`er-m365` | `provider` 옆 「공용 인터넷을 지나지 않음」 | ExpressRoute는 연결 공급자를 거친 사설 연결로 Azure와 Microsoft 365에 닿고, 트래픽이 공용 인터넷을 지나지 않는다 |
  | `vpn` | 사이트 간 VPN | `onprem`·`internet`·`vnet` | `vpn-in`·`vpn-vnet` | `internet` 옆 「암호화된 터널로 지남」 | 사이트 간 VPN은 공용 인터넷 위에 암호화된 터널을 두어 가상 네트워크에 잇는다 |

- 요점 테스트:
  - `vnet`·`m365`가 `microsoft` 안이고, `onprem`·`provider`·`internet`은 밖이다(세로형·가로형 모두).
  - `expressroute`에서 `internet`이 opacity `0.25`이고 보이는 경로의 끝점이 `internet`의 변에 닿지 않는다. `vpn`에서 `provider`·`m365`가 `0.25`다.
  - 두 시나리오 모두 `onprem`과 `vnet`이 선명하다 — 두 길의 시작과 끝은 같고 지나는 곳만 다르다.
- 캡션·곁말의 사실은 개념 14·16 본문에 있어야 한다(ADR-036·038).

위 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-virtual-networking.expressroute': ExpressRouteDiagram` 한 줄(`azure-virtual-networking.vpn-gateway` 키 뒤). 개념 17에는 도식이 없다.

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `ExpressRouteDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다. **주제 `azure-virtual-networking`의 개념이 모두 생겼으므로**, `official.md`와 `corrections.md`에서
step 5가 더한 `(phase 103)` 항목 가운데 `azure-virtual-networking`을 가리키는 「쓰일 곳」이 남아 있지 않은지 `grep`으로 본다 — 남은 줄은 그 개념 id가 실제로 있으면 고치고, 없는 id를 가리키면 고치지 말고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~9·11~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 `azure-virtual-networking`의 개념은 8개, 문항은 78개, 마지막 id는 `az078`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 앞 step이 쓴 개념·문항(`az056`~`az075`)·도식 문구가 그대로인지 기계로 본다.
3. 주제 `azure-virtual-networking`의 개념 10~17을 처음부터 통독한다 — 풀이 없이 처음 나오는 낱말, 진행 안내, 같은 말의 되풀이가 없는가.
4. `phases/103-azure-compute-networking/index.json`의 step 9를 갱신한다(성공 → guide.md 「summary에 적을 것」, 3회 실패 → `error`, `check-verbatim` 「건너뜀」 → `blocked`).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **ExpressRoute의 연결 모델 셋, 피어링 종류(사설·Microsoft 피어링), 대역폭 수치, OSI 계층을 쓰지 마라.** 이유: guide.md 「배경」.
- **DNS 레코드 종류(A·CNAME·MX 같은 것)를 늘어놓지 마라.** 이유: AZ-900 범위를 넘는다. 「레코드」를 한 줄로 푸는 데서 그친다.
- **주제 `azure-network-protection`을 만들지 마라.** 이유: step 11의 범위다.
