# Step 3: mtu-header

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 2가 주제 `ip-protocol`을 만들고 개념 1 IP·2 단편화를 넣었다. **이 step은 3 MTU와 4 IPv4 헤더의 글·문항·도식을 만든다.** 다음 step 4가 IPv4 헤더에 딸린 단편화 칸과 TTL을 잇는다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-1 IP(IPv4, IPv6)」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p114~p119, p123 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), 이 주제에서 앞 step이 만든 도식과 `src/data/network/visuals/ip-protocol.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

주제 `ip-protocol`의 `concepts` 끝에 덧붙인다. 개념은 guide.md 표의 3 MTU, 4 IPv4 헤더이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `ip-protocol.mtu` | MTU (Maximum Transmission Unit) | `ip-protocol.fragmentation` | 이더넷의 1500바이트(p115–p116 그림은 명령 출력에서 MTU 값을 보여 준다 — 명령 이름은 쓰되 출력 전체를 옮기지 않는다). 이더넷 프레임의 데이터 칸은 이 주제 안에서 한 줄로 푼다. MTU보다 큰 패킷은 나누거나(IPv4) 버려진다는 것, 최소 MTU(IPv4 68·IPv6 1280)는 step 0 결과대로 |
| 4 | `ip-protocol.ipv4-header` | IPv4 헤더 | — | **목록 개념** — 헤더를 「패킷의 앞머리에 붙은, 그 패킷을 어떻게 다룰지 적은 칸들」로 풀고 소개 문단 하나 뒤에 칸 무리를 항목으로(guide.md 표 4행). 단편화 칸 셋과 TTL은 이름과 한 줄만 쓰고 「아래 개념에서」로 넘긴다(개념 5·6이 딸린 개념으로 온다). 헤더 체크섬이 헤더만 검사한다는 것, 프로토콜 칸의 번호(step 0 결과대로), IP 패킷이 이더넷 프레임의 데이터 칸에 들어간다는 것. 확인 응답 번호가 IPv4 헤더에 없다는 것은 TCP를 한 줄로 풀고 쓴다 |

### 2. 문항 — `src/data/network/questions.json`에 `n051`~`n053`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n051` | `mtu` | 4지선다 「상황 적용」 감 — MTU가 1500인 이더넷 링크로 크기가 다른 IP 패킷을 보낼 때 어느 것이 나뉘어야 하는지, 또는 링크마다 MTU가 다른 경로에서 무엇이 기준이 되는지. 기출이 섞는 68·1280 같은 수를 그대로 늘어놓는 꼴은 피한다 |
| `n052` | `ipv4-header` | 4지선다 「원리 이해」 감 — 목적지 호스트가 받은 IP 패킷의 데이터를 TCP에 넘길지 UDP에 넘길지 정할 때 보는 칸. 오답은 다른 헤더 칸(TTL, 식별자, 서비스 유형 등) |
| `n053` | `ipv4-header` | 예/아니요 감 — 「IPv4 헤더 체크섬은 데이터까지 포함한 패킷 전체가 망가졌는지 검사한다」(아니요 — 헤더만). 주장의 방향은 균형에 맞춰 고른다 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

`src/data/network/visuals/ip-protocol.json`의 `diagrams`에 키를 더한다. 앞 step이 쓴 키는 고치지 않는다.

#### 3-1. `ip-protocol.mtu` — `MtuLimitDiagram`, JSON 키 `mtu-limit`

- 물음형 제목 예: `이 패킷은 그대로 지나갈 수 있을까?`
- 그릴 것: MTU 1500인 링크 하나와, 그 링크로 들어가려는 패킷(크기를 곁말로). 패킷이 링크를 지나 다음 장치에 닿는 경로.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `fits` | MTU 이하 | 1500바이트 이하 패킷과 링크 | 크기가 MTU 이하인 패킷은 그대로 지나간다 |
  | `too-big` | MTU 초과 | MTU보다 큰 패킷과 단편화 표시 | MTU보다 큰 패킷은 나누어야 지나갈 수 있다(본문이 쓴 IPv4·IPv6 차이대로) |

- 요점 테스트: `fits`에서는 패킷이 링크를 지나는 경로가 보이고 단편화 곁말이 없다. `too-big`에서는 단편화 곁말이 보이고 원래 크기 그대로 지나가는 경로는 보이지 않는다.

#### 3-2. `ip-protocol.ipv4-header` — `Ipv4HeaderDiagram`, JSON 키 `ipv4-header`

- 물음형 제목 예: `IPv4 헤더에는 어떤 칸이 있을까?`
- 그릴 것: 헤더 칸을 순서대로 빈틈없이 이어 붙인 줄 여럿(guide.md 「헤더·메시지 칸 그림」 — 비트 폭 비율을 맞추지 않는다)과 그 뒤 데이터 칸. 칸 이름은 본문의 말로.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `basic` | 기본 정보 | 버전·헤더 길이·서비스 유형·전체 길이 | 패킷의 판과 크기를 적는 칸 |
  | `fragment` | 단편화 | 식별자·플래그·단편화 오프셋 | 나뉜 조각을 다시 합칠 때 쓰는 칸 |
  | `delivery` | 전달 | TTL·프로토콜·헤더 체크섬 | 전달하며 보고 고치는 칸 — 체크섬은 헤더만 검사한다 |
  | `address` | 주소 | 출발지·목적지 IP 주소 | 어디서 와서 어디로 가는지 |

- 요점 테스트: 모든 헤더 칸 노드의 이름을 순서대로 읽으면 본문의 칸 순서와 같다. 데이터 칸은 어느 시나리오에서도 헤더 칸 무리에 들지 않는다. 확인 응답 번호라는 칸이 없다.

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 53개, 마지막 id는 `n053`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `ip-protocol`의 개념 순서와 `parentId`가 guide.md 표와 같은지, 앞 step의 개념·문항·도식 문구가 한 글자도 바뀌지 않았는지 node로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 5·6(식별자·플래그·단편화 오프셋, TTL)을 만들지 마라.** 이유: step 4의 범위다. 헤더 개념은 그 칸들의 이름과 한 줄만 쓴다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
