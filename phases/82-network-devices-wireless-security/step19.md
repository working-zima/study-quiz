# Step 19: vpn-protocols-ipsec-review

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `network-security`의 마지막 개념 둘(7 VPN 프로토콜, 8 IPsec)의 글·문항·도식을 함께 만들고, 주제 전체(8개념)를 통독한다.** 둘 다 5(VPN)에 딸린 개념이다.
쓰기를 마친 뒤 주제 전체를 통독하는 데 시간을 쓴다. 이 step이 phase 82의 마지막 step이다.

기출은 IP 계층에서 패킷을 인증하고 암호화하는 VPN 프로토콜이 IPsec이라는 것을 두 번 묻는다([기출 2025-11-02 #22]·[기출 2026-08-02 #24] — 지문, 오답 PPTP·L2TP·SSL/TLS).

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 15 `summary`(PPTP·L2TP·SSL/TLS VPN·PPP의 사실과 계층, PPTP 권고, IPsec·AH·ESP·전송 모드·터널 모드·IKE, 기출 판정, E 번호)와 step 16~18 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 16과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 15)」 항목, phase 81 step 4의 원격 액세스·VPN 항목, phase 78의 TLS 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`network-security`의 앞 개념 여섯(step 16~18)**, 특히 `vpn`·`tunneling`. `app-protocols-mgmt-security.tls`, `windows-server-roles.remote-access`(터널링 프로토콜 이름 줄) — 뜻을 맞춘다
- `src/data/network/questions.json`, `src/data/network/visuals/network-security.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `OsiStackDiagram`·`HttpsStackDiagram`(계층 쌓기), `EncapsulationDiagram`(헤더의 차례), `TunnelEncapsulationDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2025-11-02 #22], [기출 2026-08-02 #24] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `network-security` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `network-security.vpn-protocols` | VPN 프로토콜 | `network-security.vpn` | **목록 개념**. 소개 문단 — VPN의 터널을 만드는 프로토콜이 여럿이고, 어느 계층의 데이터를 담아 나르는지로 가른다는 것(step 15 결과대로). 항목 넷(PPTP·L2TP·IPsec·SSL/TLS VPN — 영문 이름과 하는 일 한 문장씩, IPsec 항목은 한 문장만 — 자세한 것을 같은 주제의 다른 개념이 쓴다는 진행 안내를 붙이지 않는다). 항목 뒤 문단: PPP(한 줄), L2TP가 그 자체로 암호화하지 않아 IPsec과 함께 쓴다는 것(step 15 결과대로), PPTP의 보안과 지금의 권고(step 15 결과대로 한 줄), `windows-server-roles.remote-access`의 프로토콜 이름 줄과 뜻을 맞춘다. **PPTP와 L2TP**(4절) |
| 8 | `network-security.ipsec` | IPsec | `network-security.vpn` | IPsec의 뜻(step 15 결과대로 — RFC 4301), 주는 보호(출발지 인증·무결성·기밀성 — 한 줄씩 푼다), AH와 ESP(step 15 결과대로 — 무엇을 하고 무엇을 하지 않는지), 전송 모드와 터널 모드(무엇을 보호하고 바깥 헤더가 붙는지, 주로 어디에 쓰는지 — 앞 개념 `tunneling`의 바깥 헤더와 뜻을 맞춘다), IKE(한 줄). **AH와 ESP**(4절), **전송 모드와 터널 모드**(4절). 예: `VPNGW1`·`VPNGW2`가 ESP 터널 모드로 `10.1.0.5` → `10.2.0.7` 패킷을 보호할 때 새 IP 헤더(`192.0.2.1` → `203.0.113.1`)·ESP 헤더·원래 패킷의 차례와 어디가 암호화되는지(「예시 값」 — 단계대로) |

### 2. 문항 — `src/data/network/questions.json`에 `n350`~`n352`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n350` | `vpn-protocols` | 4지선다 「개념 비교」 — 프로토콜 하나를 주고 그 프로토콜이 터널로 나르는 것·만드는 계층·스스로 암호화하는지를 고르게 한다(예: L2TP를 쓰면서 내용을 감추려면 무엇을 함께 써야 하는지, 또는 PPP 프레임을 나르는 데이터 링크 계층 터널이 무엇인지 — step 15 결과대로). **보기 넷이 PPTP·L2TP·IPsec·SSL/TLS 네 이름이 되면 안 된다**(기출 묶음 — 보기를 동작이나 계층의 설명으로 두거나, 이름이면 둘 이상을 다른 것으로). **정답 위치 2** |
| `n351` | `ipsec` | 4지선다 「상황 적용」 — 본문과 다른 장면(두 사무실 게이트웨이 사이에서 지사 PC들의 원래 IP 헤더까지 감추고 내용을 암호화해야 한다 등)을 주고 알맞은 보안 프로토콜과 모드의 짝을 고르게 한다(정답 ESP 터널 모드, 오답 ESP 전송 모드·AH 전송 모드·AH 터널 모드 — step 15 근거로 각각 왜 아닌지 따진다). **정답 위치 3**. 기출 묶음(PPTP·L2TP·SSL/TLS·IPsec)을 쓰지 않는다 |
| `n352` | `ipsec` | 예/아니요 「개념 확인」 — **아니요** 쪽으로 세운다. 예: IPsec에서 AH만 써서 보호한 패킷은 중간에서 가로챈 사람이 데이터의 내용을 읽을 수 없게 암호화되어 있나요?(아니요 — AH는 무결성과 출발지 인증만 주고 암호화는 ESP가 한다, step 15 결과대로). 해설은 AH와 ESP를 가른다. n351과 다른 것을 묻는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 70·아니요 70, 정답 위치 53/53/53/53(phase 82의 끝 값).
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `vpn-protocols` — `VpnProtocolLayersDiagram`, JSON 키 `vpn-protocol-layers`

- 물음형 제목 예: `VPN 프로토콜은 어느 계층의 데이터를 담아 나를까?`
- 그릴 것: 왼쪽에 아래에서 위로 쌓은 계층 칸(본문에 나온 계층만 — 데이터 링크·네트워크·전송·응용 등), 오른쪽에 프로토콜 노드 넷을 그 프로토콜이 터널로 나르는 데이터의 계층 높이에 두고 계층 칸으로 잇는다(본문의 말대로). L2TP와 IPsec을 함께 쓰는 꼴은 본문이 쓴 만큼 곁말로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `layer2` | PPTP·L2TP | PPTP·L2TP와 데이터 링크 칸 | PPP 프레임을 담아 나르는 데이터 링크 계층의 터널이다 |
  | `layer3` | IPsec | IPsec과 네트워크 칸 | IP 패킷을 보호하는 네트워크 계층의 방법이다 |
  | `tls` | SSL/TLS VPN | SSL/TLS VPN과 그 칸 | TLS로 보호하는 VPN이다(본문의 말대로) |

- 요점 테스트: 세 시나리오의 선명한 프로토콜 노드 집합이 서로 겹치지 않는다. `layer2`의 프로토콜 노드는 `layer3`의 것보다 아래(y가 크다)에 있다.

#### 3-2. `ipsec` — `IpsecModesDiagram`, JSON 키 `ipsec-modes`

- 물음형 제목 예: `IPsec의 두 모드는 패킷의 어디까지 보호할까?`
- 그릴 것: 패킷을 칸 노드 줄로 두 줄 — 전송 모드 줄(원래 IP 헤더 | ESP 헤더 | 데이터), 터널 모드 줄(새 IP 헤더 | ESP 헤더 | 원래 IP 헤더 | 데이터). 줄마다 다른 id. 280 폭에 칸 넷이 들지 않으면 칸을 세로로 쌓고, 보호(암호화)되는 칸을 그룹 박스로 감싼다(본문의 말대로).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `transport` | 전송 모드 | 전송 모드 줄의 칸 | 원래 IP 헤더는 그대로 두고 그 뒤의 데이터를 보호한다 |
  | `tunnel` | 터널 모드 | 터널 모드 줄의 칸 | 원래 패킷 전체를 보호하고 앞에 새 IP 헤더를 붙인다 — 게이트웨이 사이의 VPN에 쓴다 |

- 요점 테스트: 「새 IP 헤더」 칸은 터널 모드 줄에만 있다. 보호 그룹 박스가 터널 모드 줄에서는 원래 IP 헤더 칸을 감싸고, 전송 모드 줄에서는 원래 IP 헤더 칸을 감싸지 않는다.

위 도식 설계는 출발점이다. 본문(step 15 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 암호화를 자물쇠 그림으로 그리지 않는다 — 그룹 박스와 곁말로 보인다(guide.md 「도식」).

### 4. 주제 `network-security` 통독

쓰기를 마친 뒤 **주제 `network-security`의 여덟 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이, 같은 사실을 여러 곳이 다르게 말하는 곳 — 예: 방화벽을 푼 말과 WAF·IPS의 견줌, VPN·터널·캡슐화의 말, 사설 주소와 문서용 주소를 밝힌 자리, 「자격시험은」 줄의 꼴)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다. 도식 여덟 개의 문구도 함께 읽는다.
phase의 마지막 step이므로 summary 끝에 phase 82 전체의 수(개념 29·문항 40·도식 29, 끝 균형 줄, 교차 검사 수, 더한 E 번호 범위)를 한 줄로 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 352개, 마지막 id는 `n352`이고, 예 70·아니요 70, 정답 위치 53/53/53/53이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. IPsec 예의 헤더 차례를 칸마다 손으로 따라가 본다.
3. n350·n351의 보기 넷을 step 15의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. 주제 `network-security`의 여덟 개념을 통독한다(「작업」 4). 도식 여덟 개의 문구도 함께 읽는다.
5. `phases/82-network-devices-wireless-security/index.json`의 step 19를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(「앞 개념에 고칠 것」에 통독 결과, 끝에 phase 전체의 수).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **IPsec의 SA·SPD 구조·암호 알고리즘 목록·IKE 메시지 교환, PPTP·L2TP의 메시지 형식을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 16~18의 개념·문항·도식과 `windows-server-roles`를 고치지 마라.** 이유: 다른 step·앞 phase의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
