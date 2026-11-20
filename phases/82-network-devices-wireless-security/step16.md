# Step 16: firewall-ids-ips

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 주제 `network-security`를 만들고 그 첫 개념 둘(1 방화벽, 2 IDS와 IPS)의 글·문항·도식을 함께 만든다.** 둘 다 머리 개념이다.
이 주제 화면만 읽고도 패킷·주소·포트·프로토콜의 뜻이 서게 쓴다. 이 주제가 방화벽을 정의하는 자리다 — `linux-servers.iptables`·`windows-server-roles.request-filtering`이 한 줄로 쓴 방화벽과 뜻을 맞춘다.

기출은 방화벽이 정책과 규칙에 따라 트래픽을 허용하거나 막는다는 것과, 자기를 거치지 않는 트래픽이나 내부의 공격을 모두 막지는 못한다는 것을 묻는다([기출 2026-08-02 #49]).
IDS·IPS는 WAF·NAC 기출의 오답이라 무엇인지를 정확히 가르친다.

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 15 `summary`(방화벽의 정의·규칙·기본 정책·세 방식·할 수 없는 것, IDS·IPS, 기출 판정, E 번호, 한국어 이름)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 15)」 줄과 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(`linux-servers.iptables`, `windows-server-roles.request-filtering`, `ports`, `protocols-encapsulation.protocol` — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `IptablesChainsDiagram`·`RequestFilteringDiagram`(규칙과 막힘), `SgNaclBoundaryDiagram`(경계와 거치는 길)과 그 테스트, `src/data/network/visuals/linux-servers.json`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2026-08-02 #49], [기출 2025-05-25 #49], [기출 2026-05-17 #48], [기출 2024-02-25 #20] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`network-devices` 주제 객체 바로 뒤(= `diagnostic-commands` 주제 객체 앞)에 주제 객체를 끼운다 — `{ "id": "network-security", "title": "네트워크 보안과 VPN", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 3(★★★, 출제 9/11회)인지 `data.test.ts`의 주제 지도 표와 견준다. 끼운 자리의 `  }` / `,` / `  {` 줄 꼴이 기존과 같은지 본다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `network-security.firewall` | 방화벽 | — | 이 주제의 첫 개념이라 **패킷**(네트워크로 보내는 데이터 덩어리), **IP 주소**, **포트 번호**, **프로토콜**을 한 줄씩 푼다. 방화벽의 뜻(step 15 결과대로), 규칙의 구성과 기본 정책, 세 방식(이름과 정의는 step 15 결과대로 — 무엇까지 보고 판단하는지), 방화벽이 할 수 없는 것(step 15 결과대로). `linux-servers.iptables`가 Linux의 방화벽이라는 것을 한 줄로(그 주제와 뜻을 맞춘다). 「프로세스 번호」 같은 기출의 말은 step 15의 처리대로만. **패킷 필터링과 상태 검사**(4절). 예: 방화벽 `FW01`의 규칙 — 인터넷에서 웹 서버 `192.0.2.20`의 TCP `443`으로 오는 연결은 허용, 나머지는 거부 — 을 따라 연결 셋이 각각 어떻게 되는지(허용되는 것, 거부되는 것, `FW01`을 거치지 않는 내부끼리의 것)(「예시 값」 — 규칙을 하나씩 따라 본다) |
| 2 | `network-security.ids-ips` | IDS와 IPS | — | 침입(한 줄), IDS와 IPS의 뜻(step 15 결과대로 — 영문 이름을 함께), 탐지 방법 둘(이름과 한 줄씩), 두는 자리(step 15 결과대로). **IDS와 IPS**(4절 — 알리는가, 막는가), **방화벽과 IPS**(4절 — 정한 규칙에 맞는가, 공격의 모양인가 — 앞 개념과 뜻을 맞춘다). 예: `FW01` 뒤의 IPS `IPS01`이 규칙으로는 허용된 TCP `443` 연결 안에서 알려진 공격의 모양을 찾아 막는다(「예시 값」 — 단계대로) |

### 2. 문항 — `src/data/network/questions.json`에 `n341`~`n342`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n341` | `firewall` | 예/아니요 「원리 이해」 — **아니요** 쪽으로 세운다. 예: 회사가 인터넷과 사내 네트워크 사이에 방화벽 `FW05`를 두었다. 사내의 두 PC가 `FW05`를 거치지 않고 같은 스위치로 주고받는 트래픽도 `FW05`의 규칙으로 막을 수 있나요?(아니요 — 방화벽은 자기를 지나는 트래픽만 통제한다, step 15 결과대로). 해설은 방화벽이 할 수 있는 것과 없는 것을 가르친다. 기출의 특징 넷 묶음을 쓰지 않는다 |
| `n342` | `ids-ips` | 4지선다 「개념 비교」 — 본문과 다른 장면(공격으로 보이는 트래픽을 찾아 관리자에게 알리기만 하고 트래픽은 그대로 지나가게 둔다 등)을 주고 그 시스템을 고르게 하거나, IDS와 IPS의 차이를 고르게 한다. 오답은 같은 범주(IPS·방화벽·WAF·NAC 가운데 — step 15의 근거로 정말 아닌지 따진다). **정답 위치 1**. 기출 묶음(IDS·IPS·방화벽·WAF / NIC·방화벽·IPS·NAC)을 쓰지 않는다 — 보기 넷이 그 묶음과 둘 이상 달라야 한다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 68·아니요 68, 정답 위치 52/52/51/51.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

이 step이 `src/data/network/visuals/network-security.json`을 만들고 `src/data/network/index.ts`에 import(`networkSecurityVisuals` — 경로 알파벳순, `network-devices.json` 뒤)와 `visualsByTopicId`의 `'network-security': networkSecurityVisuals`(`'network-devices'` 바로 뒤)를 넣는다.

#### 3-1. `firewall` — `FirewallRulesDiagram`, JSON 키 `firewall-rules`

- 물음형 제목 예: `방화벽은 어떤 트래픽을 들여보낼까?`
- 그릴 것: 위에 인터넷 노드, 가운데 `FW01`(옆에 규칙 노드 「TCP 443 → 192.0.2.20: 허용」·「그 밖: 거부」 — 본문의 말대로, 길면 노드를 넓히거나 두 줄로), 아래 사내 네트워크 그룹 박스(웹 서버 `192.0.2.20`, 사내 PC 둘).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `allow` | 허용 | 인터넷·`FW01`·허용 규칙·웹 서버와 그 경로 | 규칙에 맞는 연결은 지나간다 |
  | `deny` | 거부 | 인터넷·`FW01`·거부 규칙과 `FW01`에서 멈추는 경로 | 규칙에 없는 연결은 방화벽에서 막힌다 |
  | `bypass` | 거치지 않는 트래픽 | 사내 PC 둘과 둘 사이 경로 | 방화벽을 지나지 않는 트래픽은 규칙이 닿지 않는다 |

- 요점 테스트: `deny`의 보이는 경로가 `FW01`에서 끝나고 웹 서버로 이어지지 않는다. `bypass`의 보이는 경로는 `FW01`에 닿지 않고 `FW01`은 흐리다. `allow`의 경로는 `FW01`을 지나 웹 서버에서 끝난다.

#### 3-2. `ids-ips` — `IdsIpsPlacementDiagram`, JSON 키 `ids-ips-placement`

- 물음형 제목 예: `IDS와 IPS는 어디에 서서 무엇을 할까?`
- 그릴 것: 인터넷 → `FW01` → `IPS01`(길 위) → 사내 네트워크 노드, 그리고 트래픽의 사본을 받는 IDS 노드(본문이 두는 자리대로). 공격 트래픽 노드(「알려진 공격 모양」 — 본문의 말).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `ids` | IDS | 인터넷·`FW01`·사내·IDS와 사본 경로 | 사본을 살펴 침입의 흔적을 찾아 알리고, 트래픽은 그대로 지나간다 |
  | `ips` | IPS | 인터넷·`FW01`·`IPS01`과 `IPS01`에서 멈추는 경로 | 길 위에서 공격으로 본 트래픽을 그 자리에서 막는다 |

- 요점 테스트: `ips`에서 공격 트래픽의 경로가 `IPS01`에서 끝나고 사내 노드는 흐리다. `ids`에서는 사내로 가는 경로와 IDS로 가는 사본 경로가 함께 보인다.

위 도식 설계는 출발점이다. 본문(step 15 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 방화벽·IPS를 벽·방패 그림으로 그리지 않는다(guide.md 「도식」).

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 342개, 마지막 id는 `n342`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `network-devices` 바로 뒤·`diagnostic-commands` 바로 앞에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 규칙의 예를 연결 하나씩 손으로 따라가 본다.
4. n342의 보기 넷을 step 15의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
5. `phases/82-network-devices-wireless-security/index.json`의 step 16을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~8을 만들지 마라.** 이유: step 17~19의 범위다. WAF·VPN은 이 step에서 이름만 쓴다.
- **방화벽 구조(DMZ 설계 전체)·IDS 탐지 기법 세부·제품 기능을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **`linux-servers`·`windows-server-roles`의 개념을 고치지 마라.** 이유: 앞 phase의 주제다(guide.md 「모든 step의 공통 금지」).
