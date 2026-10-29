# Step 10: dhcp

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `ip-address-types`에 마지막 개념 둘(16 DHCP, 17 DHCP 메시지 교환)의 글·문항·도식을 더해 주제를 마무리한다.** 개념 9~15는 step 6~9가 만들었다.

기출은 DHCP를 일곱 번 물었다 — 주소를 자동으로 나눠 주는 프로토콜, 할당 방식 셋, 클라이언트가 서버를 찾으려고 브로드캐스트한다, 서버의 포트가 DNS의 53이 아니다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 5 `summary`(DHCP·메시지의 확인 결과)와 step 6~9 `summary`(이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-6」 절과 「강의 수정 이력」, `docs/source/network/standards.md`(RFC 2131·RFC 2132 항목), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p192~p196 — 원문(옮기지 않는다). 그림은 렌더해서 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `ip-address-types`의 개념 9~15와 `arp.rarp` — DHCP를 한 줄로 언급한다), `src/data/network/questions.json`, `src/data/network/visuals/ip-address-types.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`
- step 6~9가 만든 도식과 그 테스트, 도식 선례(guide.md 「도식」, 특히 메시지가 오가는 `ArpExchangeDiagram`·`EchoDiagram`), `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `ip-address-types`에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 16 | `ip-address-types.dhcp` | DHCP (Dynamic Host Configuration Protocol) | — | 무엇인가(호스트가 네트워크에 이을 때 DHCP 서버가 IP 주소와 네트워크 설정을 나눠 주는 프로토콜, p192) → 무엇을 주는가(IP 주소, 서브넷 마스크, 기본 게이트웨이, DNS 서버 주소 — DNS 서버를 한 줄로 푼다(이름을 IP 주소로 바꿔 주는 서버)) → 임대(정해진 시간 동안만 빌려주고 끝나기 전에 갱신한다 — 자동으로도, 사용자가 손으로도, p193·p196) → 할당 방식 셋(step 5 결과대로) → 포트(서버·클라이언트의 UDP 포트 번호 — UDP를 한 줄로 푼다, step 5 결과대로). 예 — DHCP 서버(`192.168.0.1`)가 PC에게 `192.168.0.10`, `255.255.255.0`, 기본 게이트웨이 `192.168.0.1`을 임대 시간과 함께 준다(임대 시간 값은 예시라고 밝힌다). 정적·동적 주소(개념 15)와 이어 쓰되 되풀이하지 않는다 |
| 17 | `ip-address-types.dhcp-messages` | DHCP 메시지 교환 | `dhcp` | **목록 개념**. 소개 문단 — 주소가 아직 없는 클라이언트가 처음 주소를 받을 때 메시지 넷이 이 차례로 오간다(p195). 항목 넷 — **Discover**(클라이언트 → 서버를 찾는 브로드캐스트, 주소가 없어 출발지는 `0.0.0.0` — step 5 결과대로), **Offer**(서버 → 줄 수 있는 주소 제안), **Request**(클라이언트 → 고른 제안을 달라는 요청, 브로드캐스트로 보내는 까닭 — step 5 결과대로), **ACK**(서버 → 확정, 이때부터 주소를 쓴다). 메시지의 정식 이름(`DHCPDISCOVER` 등)을 한 번 밝힌다. 항목 뒤 문단 — 갱신할 때는 서버를 이미 알므로 처음부터 하지 않고 Request·ACK만 오간다는 것(step 5 결과대로). 브로드캐스트를 이 주제에서 처음 쓰면 한 줄로 푼다 |

### 2. 문항 — `src/data/network/questions.json`에 `n098`~`n100`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n098` | `dhcp` | 예/아니요 감 — 흔한 오해 「DHCP로 받은 주소는 그 호스트가 영원히 갖는다」(아니요 — 임대), 또는 「DHCP 서버는 IP 주소와 함께 기본 게이트웨이 주소도 알려 줄 수 있다」(예). 주장의 방향은 균형에 맞춰 고른다 |
| `n099` | `dhcp` | 4지선다 「개념 비교」 감 — 할당 방식 셋(step 5가 확인한 이름)을 상황으로 구별한다(예: 관리자가 장치마다 정해 둔 주소를 DHCP가 전하는 방식). 오답은 나머지 두 방식과, 같은 범주의 그럴듯한 다른 것 하나. n098과 다른 것을 묻는다 |
| `n100` | `dhcp-messages` | 4지선다 「원리 이해」 감 — 주소가 없는 클라이언트가 첫 메시지를 브로드캐스트로 보내는 까닭, 또는 넷 가운데 특정 단계(서버가 주소를 확정하는 메시지 등)를 고른다. 오답은 같은 넷의 다른 메시지 |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `ip-address-types.dhcp` — `DhcpLeaseDiagram`, JSON 키 `dhcp-lease`

- 물음형 제목 예: `DHCP 서버는 호스트에게 무엇을 빌려줄까?`
- 그릴 것: DHCP 서버(`192.168.0.1`)와 PC, 서버에서 PC로 가는 경로, 건네는 설정 노드들(IP 주소 `192.168.0.10`, 서브넷 마스크 `255.255.255.0`, 기본 게이트웨이 `192.168.0.1`, DNS 서버)과 임대 시간 곁말.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `lease` | 임대 | 서버·PC·설정 노드들 | 서버는 주소와 설정을 정해진 시간 동안 빌려준다 |
  | `renew` | 갱신 | 서버·PC | 임대 시간이 끝나기 전에 PC가 갱신을 요청해 같은 주소를 계속 쓴다(step 5가 확인한 때) |

- 요점 테스트: `lease`의 선명한 노드에 설정 노드 넷이 모두 있고 라벨이 본문 예와 같다. `renew`의 보이는 경로에 PC에서 서버로 가는 경로가 있다. 두 시나리오의 보이는 경로 집합이 다르다.

#### 3-2. `ip-address-types.dhcp-messages` — `DhcpExchangeDiagram`, JSON 키 `dhcp-exchange`

- 물음형 제목 예: `처음 주소를 받을 때 어떤 메시지가 어떤 차례로 오갈까?`
- 그릴 것: 왼쪽 클라이언트, 오른쪽 DHCP 서버, 그 사이를 위에서 아래로 오가는 메시지 넷(가로 화살표 넷을 세로로 쌓는다 — 선례 `ArpExchangeDiagram`). 메시지마다 곁말로 이름과 보내는 방식(브로드캐스트 등).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `find` | 서버 찾기 | Discover·Offer | 주소가 없는 클라이언트가 브로드캐스트로 서버를 찾고, 서버가 줄 주소를 제안한다 |
  | `confirm` | 확정 | Request·ACK | 클라이언트가 고른 주소를 요청하고, 서버가 ACK로 확정하면 그 주소를 쓴다 |

- 요점 테스트: `find`의 보이는 경로가 Discover(클라이언트에서 시작)와 Offer(서버에서 시작) 둘이고, Discover의 곁말에 「브로드캐스트」가 있다. `confirm`의 보이는 경로는 Request(클라이언트에서 시작)와 ACK(서버에서 시작) 둘이다. 네 경로의 세로 차례가 Discover → Offer → Request → ACK다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 100개, 마지막 id는 `n100`이다. `ip-address-types`의 개념은 9개다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `ip-address-types`의 개념 9~17을 처음부터 통독한다(도식 문구 포함). 풀이 없이 처음 나오는 낱말, 진행 안내 문장, 앞 개념과 되풀이되는 설명이 없는지 본다.
   step 5 summary가 정한 것을 지켰는가.
3. `phases/74-network-addressing-routing/index.json`의 step 10을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」과, `ip-address-types` 주제 전체에서 앞 step의 글에 고칠 것을 찾았으면 그 목록(고치지 않는다).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`routing`의 개념을 만들지 마라.** 이유: step 12~16의 범위다.
- **Windows Server의 DHCP 서버 역할(범위·장애 조치·설정 화면)과 DHCP 릴레이를 쓰지 마라.** 이유: `windows-server-roles` 주제(phase 81)의 범위이고, 기출이 이 주제에서 묻지 않는다.
- **강의 화면의 주소(`192.168.0.7`·`192.168.219.100` 등)와 임대 시각을 옮기지 마라.** 이유: guide.md 「예시 값」.
