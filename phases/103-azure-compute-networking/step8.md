# Step 8: vpn-gateway

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/103-azure-compute-networking/guide.md`에 있다.
**이 step은 주제 `azure-virtual-networking`의 개념 둘(14 VPN 게이트웨이, 15 VPN 게이트웨이 연결 유형)의 글·문항과 도식 `SiteToSiteVpnDiagram`을 만든다.**

덤프가 되풀이해 묻는 것은 **사이트 간 연결에 무엇이 필요한가**와 **온-프레미스 VPN 장치를 Azure에서 나타내는 것(로컬 네트워크 게이트웨이)**이다. VPN 게이트웨이(Azure 쪽 장치)와 로컬 네트워크 게이트웨이(온-프레미스 쪽을 Azure에 알리는 것)가 이름이 비슷해 섞이므로, 글과 도식이 둘의 자리를 가른다.
도식은 부모 개념 14에 붙이고, 연결 유형 셋 가운데 사이트 간과 지점 및 사이트 간을 시나리오로 그린다(개념 15의 사실이 도식에 쓰인다 — 같은 주제의 다른 개념 본문이 근거가 될 수 있다, ADR-036).

사실은 step 5가 확인해 `official.md`에 남긴 것에서만 가져온다.

## 읽어야 할 파일

- **`phases/103-azure-compute-networking/guide.md` 전체**
- `phases/103-azure-compute-networking/index.json`의 step 5 `summary`(사이트 간 연결에 필요한 리소스, 로컬 네트워크 게이트웨이의 정의, 게이트웨이 서브넷의 이름, 연결 유형 셋의 표기)와 step 7 `summary`(교차 검사 수, 균형 줄)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-virtual-networking`(개념 10~13)
- 도식 선례 — step 6·7의 도식과 `src/data/azure/visuals/azure-virtual-networking.json`, `src/components/diagrams/HybridCloudDiagram.tsx`(phase 100 — 온-프레미스와 클라우드를 잇는 짜임)

## 작업

### 1. 개념 — `azure-virtual-networking` 주제의 `concepts` 끝에 덧붙인다

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 14 | `azure-virtual-networking.vpn-gateway` | VPN 게이트웨이 | — | **VPN**·**터널**·**암호화**·**게이트웨이**를 한 줄씩 푼다. 사이트 간 연결에 필요한 것을 한 문단으로 — Azure 쪽(게이트웨이 서브넷의 VPN 게이트웨이), 온-프레미스 쪽(VPN 장치), 그 장치를 Azure에 알리는 로컬 네트워크 게이트웨이, 둘을 잇는 연결. 4절: VPN 게이트웨이와 로컬 네트워크 게이트웨이는 「어느 쪽을 나타내는가」로 갈린다. **도식의 예를 본문에 쓴다** — 회사 C의 본사 VPN 장치와 Azure 가상 네트워크의 VPN 게이트웨이 사이의 사이트 간 연결 |
| 15 | `azure-virtual-networking.vpn-connection-types` | VPN 게이트웨이 연결 유형 | `vpn-gateway` | **목록 개념**(ADR-046) — 소개 문단 뒤 항목 셋(`- **한국어 이름**(English name)은 …`), 항목 다음에 고르는 기준 문단. 부모(개념 14) 바로 뒤. 표기는 step 5가 정한 대로. 지점 및 사이트 간의 예(집이나 출장지의 컴퓨터 한 대)를 도식과 같게 본문에 쓴다 |

### 2. 문항 — `az073`~`az075`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az073` | `vpn-gateway` | 4지선다 「상황 적용」 — 사이트 간 연결을 만들며 Azure 쪽 VPN 게이트웨이를 이미 두었고, 이제 본사 VPN 장치가 어디 있는지(공용 IP 주소)와 본사 네트워크의 주소 범위를 Azure에 알려야 한다 — 무엇을 만드나(로컬 네트워크 게이트웨이 — step 5 결과대로). 오답은 같은 범주(사이트 간 연결의 구성 요소와 비슷한 이름): VPN 게이트웨이를 하나 더, 게이트웨이 서브넷, 가상 네트워크 피어링. 정의를 그대로 옮긴 「무엇인가?」 꼴이 되지 않게 상황으로 쓴다 |
| `az074` | `vpn-gateway` | 예/아니요 「흔한 오해」 — 가상 네트워크 하나가 온-프레미스 사무실 두 곳과 VPN으로 이어지려면 VPN 게이트웨이를 그 가상 네트워크에 두 개 두어야 하는가(아니요 — 가상 네트워크마다 하나, 그 하나로 여러 곳에 잇는다). 균형을 보고 주장의 방향을 바꿔도 된다 |
| `az075` | `vpn-connection-types` | 4지선다 「상황 적용」 — 출장 중인 직원 한 명이 노트북에서 회사의 Azure 가상 네트워크에 VPN으로 접속하려 한다(지점 및 사이트 간). 오답은 같은 범주(VPN 게이트웨이 연결 유형과 비슷한 연결): 사이트 간, VNet 간, ExpressRoute(이 주제의 앞 개념이 아직 없으면 보기 안에서 한 줄로 풀거나 다른 오답으로) |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 7 summary의 균형 줄이다.

### 3. 도식 — `src/data/azure/visuals/azure-virtual-networking.json`의 `diagrams`에 한 키를 더한다(앞 키는 바꾸지 않는다)

#### `azure-virtual-networking.vpn-gateway` — `SiteToSiteVpnDiagram`, JSON 키 `site-to-site-vpn`

- 물음형 제목 예: `회사 네트워크와 Azure 가상 네트워크를 인터넷 너머로 어떻게 이을까?`
- 그릴 것: 그룹 박스 `onprem`(「온-프레미스 네트워크」) 안에 노드 `vpn-device`(「VPN 장치」). 그룹 박스 `vnet`(「가상 네트워크」) 안에 그룹 박스 `gateway-subnet`(「게이트웨이 서브넷」 — step 5가 정한 이름) — 그 안에 노드 `vpn-gw`(「VPN 게이트웨이」) — 과 노드 `vm-1`(「VM 1」).
  그룹 밖에 노드 `lng`(「로컬 네트워크 게이트웨이」)·`laptop`(「집의 컴퓨터」 — 본문이 정한 말).
  경로 — `s2s-tunnel`(`vpn-device` → `vpn-gw`), `p2s-tunnel`(`laptop` → `vpn-gw`), `gw-to-vm`(`vpn-gw` → `vm-1`). 모두 시나리오에서만 보인다.
  `lng`는 Azure 안에서 온-프레미스를 나타내는 리소스다 — `vnet` 박스 밖에 두되 `onprem` 박스 안에 두지 않는다(그 뜻을 곁말이나 `legend`로 밝힌다).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `site-to-site` | 사이트 간 | `vpn-device`·`lng`·`vpn-gw`·`vm-1` | `s2s-tunnel`·`gw-to-vm` | `s2s-tunnel` 근처 「인터넷 위의 암호화된 터널」, `lng` 옆 「온-프레미스 VPN 장치를 Azure에 알림」 | 본사의 VPN 장치와 게이트웨이 서브넷의 VPN 게이트웨이가 인터넷 너머로 암호화된 터널을 잇고, Azure는 로컬 네트워크 게이트웨이로 온-프레미스 쪽을 안다 |
  | `point-to-site` | 지점 및 사이트 간 | `laptop`·`vpn-gw`·`vm-1` | `p2s-tunnel`·`gw-to-vm` | `laptop` 옆 「컴퓨터가 연결을 시작」 | 컴퓨터 한 대가 스스로 VPN 연결을 시작해 가상 네트워크에 닿는다 — 온-프레미스 VPN 장치가 필요 없다(step 5 결과대로) |

- 요점 테스트:
  - `vpn-gw`가 `gateway-subnet` 안, `gateway-subnet`·`vm-1`이 `vnet` 안, `vpn-device`가 `onprem` 안이고, `lng`·`laptop`은 `vnet`·`onprem` 어느 박스에도 들지 않는다(세로형·가로형 모두).
  - 두 시나리오 모두 `vpn-gw`가 선명하고, `site-to-site`에서 `laptop`이, `point-to-site`에서 `vpn-device`·`lng`가 opacity `0.25`다.
  - `s2s-tunnel`·`p2s-tunnel`의 끝점이 모두 `vpn-gw`의 변 위다.
- 캡션·곁말의 사실은 개념 14·15 본문에 있어야 한다(ADR-036·038).

위 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-virtual-networking.vpn-gateway': SiteToSiteVpnDiagram` 한 줄(`azure-virtual-networking.endpoints` 키 뒤). 개념 15에는 도식이 없다.

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `SiteToSiteVpnDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~9·11~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 `azure-virtual-networking`의 개념은 6개, 문항은 75개, 마지막 id는 `az075`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 앞 step이 쓴 개념·문항(`az056`~`az072`)·도식 문구가 그대로인지 기계로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. VPN 게이트웨이와 로컬 네트워크 게이트웨이의 자리가 갈리는가.
4. `phases/103-azure-compute-networking/index.json`의 step 8을 갱신한다(성공 → guide.md 「summary에 적을 것」, 3회 실패 → `error`, `check-verbatim` 「건너뜀」 → `blocked`).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 16·17을 만들지 마라.** 이유: step 9의 범위다.
- **VPN의 정책 기반·경로 기반, 활성/활성, 영역 중복 게이트웨이, IPsec·IKE 같은 프로토콜 이름을 쓰지 마라.** 이유: guide.md 「배경」이 쓰지 않기로 했다.
