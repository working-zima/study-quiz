# Step 8: arp-request-reply

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 2~7이 `ip-protocol`을 끝냈다. **이 step은 주제 `arp`를 만들고 그 첫 개념 둘(13 ARP, 14 ARP 요청과 ARP 응답)의 글·문항·도식을 함께 만든다.** 다음 step 9가 ARP 캐시와 다른 네트워크로 보낼 때의 ARP를 잇는다.

학습자는 이 화면에 바로 들어올 수 있다 — IP 주소·MAC 주소·LAN·프레임·브로드캐스트를 이 주제 안에서 푼다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-2 ARP」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`, `docs/source/network/interview-facts.md`의 Q23
- `docs/source/network/raw/lecture.md`의 p130~p137 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`ip-protocol` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "arp", "title": "ARP", "importance": 2, "sourcePages": [130, 143], "concepts": [ … ] }`.
개념은 guide.md 표의 13 ARP, 14 ARP 요청과 ARP 응답이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 13 | `arp.arp` | ARP (Address Resolution Protocol) | — | 이 주제의 첫 개념이라 **IP 주소**(여러 네트워크를 거쳐 목적지를 찾는 데 쓰는 주소), **MAC 주소**(같은 LAN 안에서 장치의 네트워크 카드를 가리키는 주소), **LAN**, **프레임**(LAN 안에서 주고받는 데이터의 정해진 형식), **스위치**(같은 LAN의 장치를 잇는 장비 — 그림에 나오면)를 여기서 짧게 푼다. 왜 MAC 주소가 필요한지, 같은 네트워크 안만, 순서(요청 → 응답 → 캐시), 이더넷 프레임에 바로 실린다(step 1 결과대로). 예시는 guide.md — 호스트 A `192.0.2.1`/`00-00-5E-00-53-01`, 호스트 B `192.0.2.2`/`00-00-5E-00-53-02` |
| 14 | `arp.arp-request-reply` | ARP 요청과 ARP 응답 | `arp.arp` | **목록 개념** — `- **ARP 요청**(ARP Request)은 …`, `- **ARP 응답**(ARP Reply)은 …`. 브로드캐스트(같은 LAN의 모든 장치에게 보내기)와 유니캐스트(한 장치에게만)를 한 줄로 푼다. 메시지 칸 한 문단(p137, step 1 결과대로). 기출의 처리 순서(캐시 확인 → 요청 브로드캐스트 → 받은 장치가 자기 IP인지 확인 → 주인만 응답)를 문단으로. 요청을 받은 쪽이 보낸 쪽의 짝을 적는지는 step 1 결과대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n063`~`n064`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n063` | `arp` | 4지선다 「원리 이해」 감 — 호스트가 같은 LAN의 상대 IP 주소는 아는데 프레임을 보내지 못하는 까닭(받는 쪽 MAC 주소가 없다)과 그때 하는 일. 오답은 같은 범주(다른 주소·다른 프로토콜의 역할) |
| `n064` | `arp-request-reply` | 4지선다 「상황 적용」 감 — 호스트 A가 호스트 C의 MAC 주소를 찾을 때 ARP 요청과 ARP 응답의 목적지 MAC 주소 조합(요청 `FF-FF-FF-FF-FF-FF`, 응답은 호스트 A의 주소), 또는 요청을 받은 장치들이 각각 무엇을 하는지. 상황의 장치는 본문 예와 다르게 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/network/visuals/arp.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'arp': arpVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `arp.arp` — `ArpPurposeDiagram`, JSON 키 `arp-purpose`

- 물음형 제목 예: `IP 주소만 알 때 무엇이 더 필요할까?`
- 그릴 것: 호스트 A와 호스트 B, A가 만들려는 프레임(목적지 MAC 칸 | 출발지 MAC 칸 | IP 패킷). 목적지 MAC 칸이 처음에는 비어 있다(곁말 「모름」 꼴은 본문의 말로).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `unknown` | ARP 전 | 호스트 A와 비어 있는 목적지 MAC 칸 | 상대의 IP 주소만 알면 프레임의 목적지 MAC 칸을 채울 수 없다 |
  | `resolved` | ARP 뒤 | 호스트 A·B와 채워진 목적지 MAC 칸 | ARP로 알아낸 MAC 주소를 넣어 프레임을 보낸다 |

- 요점 테스트: `unknown`에서 목적지 MAC 칸 곁말이 MAC 주소가 아니고, `resolved`에서 그 곁말이 호스트 B의 MAC 주소(본문 예시 값)와 같다. 두 시나리오에서 IP 패킷의 목적지 IP 곁말은 같다.

#### 3-2. `arp.arp-request-reply` — `ArpExchangeDiagram`, JSON 키 `arp-exchange`

- 물음형 제목 예: `ARP 요청과 응답은 누구에게 갈까?`
- 그릴 것: 스위치 하나에 호스트 A~D. A가 B의 MAC 주소를 찾는 장면.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `request` | ARP 요청 | 호스트 A와 B·C·D | A가 찾는 IP 주소를 담은 요청을 브로드캐스트한다 — 모든 장치가 받는다 |
  | `check` | 자기 것인지 확인 | 호스트 B·C·D | 받은 장치마다 찾는 IP 주소가 자기 것인지 본다 — C와 D는 무시한다 |
  | `reply` | ARP 응답 | 호스트 B와 A | 주인인 B만 자기 MAC 주소를 담아 A에게만 답한다 |

- 요점 테스트: `request`에서 A에서 나가는 경로가 B·C·D 셋 모두에 닿고, `reply`에서 보이는 경로는 B에서 A로 가는 하나뿐이다. `check`에서 C·D의 「무시」 곁말이 보이고 B만 다르다.

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 64개, 마지막 id는 `n064`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `ip-protocol` 바로 뒤에 있고, `importance` 2·`sourcePages` [130, 143]인지, `data.test.ts`의 주제 지도 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 15~18(ARP 캐시, 다른 네트워크로 보낼 때의 ARP, RARP, IPv6의 이웃 탐색)을 만들지 마라.** 이유: step 9·10의 범위다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
