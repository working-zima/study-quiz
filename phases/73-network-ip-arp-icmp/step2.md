# Step 2: ip-fragmentation

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
**이 step은 주제 `ip-protocol`을 만들고 그 첫 개념 둘(1 IP, 2 단편화)의 글·문항·도식을 함께 만든다.** 다음 step 3이 MTU와 IPv4 헤더를 잇는다.

이 주제는 학습자가 3장에서 처음 여는 화면이다. 학습자는 네트워크를 처음 공부하는 사람이고, 1·2장(이더넷·스위치)을 읽지 않고 바로 들어올 수 있다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-1 IP(IPv4, IPv6)」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p106~p114 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`hub-switch-vlan` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "ip-protocol", "title": "IP와 단편화", "importance": 3, "sourcePages": [106, 129], "concepts": [ … ] }`.
개념은 guide.md 표의 1 IP, 2 단편화이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `ip-protocol.ip` | IP (Internet Protocol) | — | 이 주제의 첫 개념이라 **LAN**(집·사무실처럼 가까운 장치를 잇는 네트워크), **계층**(통신에 필요한 일을 층으로 나눠 맡긴 것 — 네트워크 계층은 여러 네트워크를 거쳐 목적지까지 나르는 일), **패킷**(네트워크로 보내려고 나눈 데이터 덩어리), **라우터**(네트워크와 네트워크를 잇고 패킷을 다음 네트워크로 넘기는 장비), **MAC 주소**(LAN 안에서 장치의 네트워크 카드를 가리키는 주소)를 여기서 짧게 푼다. IP 주소는 「IP가 장치를 가리키는 주소」로 처음 풀고 자세히는 개념 7로 미룬다. p110의 까닭(MAC 주소만으로는 경로를 찾기 어렵고 다 기억할 수도 없다)과 p111–p112의 「IP 주소를 먼저, MAC 주소는 LAN 안 전달에」를 쓴다. 두 기본 기능(주소 지정·단편화)은 이름과 한 줄씩 — 단편화는 바로 다음 개념이다 |
| 2 | `ip-protocol.fragmentation` | 단편화 | — | MTU는 「한 링크가 한 번에 실어 나를 수 있는 IP 패킷의 최대 크기」로 한 줄 풀고 자세히는 개념 3으로 미룬다. 누가 나누는지(IPv4: 출발지와 경로 중간의 라우터, IPv6: 출발지만 — L4), 누가 다시 합치는지(목적지 호스트), 왜 나누는지(지나는 네트워크마다 실을 수 있는 크기가 다르다)를 쓴다. 예시는 guide.md 「단편화 예」 |

### 2. 문항 — `src/data/network/questions.json`에 `n049`~`n050`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n049` | `ip` | 4지선다 「원리 이해」 감 — 같은 LAN 안의 장치에게 보낼 때와 다른 네트워크의 장치에게 보낼 때 무엇이 필요한지, 또는 MAC 주소만으로 다른 네트워크의 장치에 보낼 수 없는 까닭. 오답은 같은 범주(주소·장비의 역할)에서 |
| `n050` | `fragmentation` | 예/아니요 감 — 흔한 오해 「나뉜 조각은 다음 라우터에서 다시 합쳐진다」(아니요 — 목적지에서 합친다). 주장의 방향은 균형에 맞춰 고른다 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/network/visuals/ip-protocol.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'ip-protocol': ipProtocolVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `ip-protocol.ip` — `IpAcrossNetworksDiagram`, JSON 키 `ip-across-networks`

- 물음형 제목 예: `패킷은 다른 네트워크까지 어떻게 갈까?`
- 그릴 것: 두 LAN(LAN 1의 호스트 A, LAN 2의 호스트 B)과 그 사이 라우터 둘. 각 LAN은 그룹 박스로. 호스트와 라우터를 잇는 연결선은 늘 보인다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `lan` | LAN 안 전달 | 호스트 A와 라우터 1 사이 구간만 | LAN 안에서는 MAC 주소로 다음 장치까지만 나른다(본문의 말로) |
  | `end-to-end` | 목적지까지 | 호스트 A에서 호스트 B까지 전체 경로 | IP는 IP 주소로 여러 네트워크를 거쳐 목적지까지 나른다 |

- 요점 테스트: `lan`의 보이는 경로는 호스트 A에서 시작해 라우터 1에서 끝나고, `end-to-end`의 보이는 경로는 호스트 A에서 시작해 호스트 B에서 끝난다. 두 시나리오의 선명한 노드 집합이 다르다.

#### 3-2. `ip-protocol.fragmentation` — `FragmentationDiagram`, JSON 키 `fragmentation`

- 물음형 제목 예: `큰 패킷은 어디서 나뉘고 어디서 합쳐질까?`
- 그릴 것: 출발지 호스트 → 라우터 → (실을 수 있는 크기가 작은 링크) → 목적지 호스트. 큰 패킷 하나와 조각 셋(조각 1~3).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `split` | 나누기 | 라우터와 조각 셋 | 라우터가 다음 링크의 MTU에 맞춰 패킷을 조각으로 나눈다(IPv4) |
  | `reassemble` | 합치기 | 목적지 호스트와 조각 셋 | 조각은 목적지 호스트에 모두 닿은 뒤에 원래 패킷으로 합쳐진다 |

- 요점 테스트: `split`에서 조각 노드가 라우터 뒤(목적지 쪽)에만 있고, `reassemble`에서 합쳐진 패킷을 가리키는 노드·곁말이 목적지 호스트 쪽에만 있다(라우터에서 합치는 그림이 없다).

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 50개, 마지막 id는 `n050`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `hub-switch-vlan` 바로 뒤에 있고, `importance` 3·`sourcePages` [106, 129]인지, `data.test.ts`의 주제 지도 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 2을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~12(MTU, IPv4 헤더와 그 칸, IPv4 주소, IPv6)를 만들지 마라.** 이유: step 3~7의 범위다. 이 step의 글이 그것을 언급할 때는 한 줄 풀이로 그친다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
