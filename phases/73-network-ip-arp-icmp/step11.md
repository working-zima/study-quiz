# Step 11: ip-limits-icmp

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 2~10이 `ip-protocol`과 `arp`를 끝냈다. **이 step은 주제 `icmp`를 만들고 그 첫 개념 둘(19 IP의 비신뢰성과 비연결형, 20 ICMP)의 글·문항·도식을 함께 만든다.** 다음 step 12가 ICMP 메시지의 타입과 코드, 목적지 도달 불가를 잇는다.

학습자는 이 화면에 바로 들어올 수 있다 — IP·패킷·라우터·헤더를 이 주제 안에서 푼다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-3 ICMP」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`, `docs/source/network/interview-facts.md`의 Q31·Q33
- `docs/source/network/raw/lecture.md`의 p144~p150, p158 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`arp` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "icmp", "title": "ICMP", "importance": 3, "sourcePages": [144, 158], "concepts": [ … ] }`.
개념은 guide.md 표의 19 IP의 비신뢰성과 비연결형, 20 ICMP이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 19 | `icmp.ip-limits` | IP의 비신뢰성과 비연결형 | — | **목록 개념** — `- **비신뢰성**(unreliable)은 …`, `- **비연결형**(connectionless)은 …`. 이 주제의 첫 개념이라 **IP**(여러 네트워크를 거쳐 패킷을 목적지까지 나르는 프로토콜), **패킷**, **라우터**, **계층**(네트워크 계층·전송 계층)을 여기서 짧게 푼다. 최선형 전달(best-effort)이라는 말의 출처는 step 1 결과대로. 신뢰성과 연결은 전송 계층의 TCP가 맡는다(TCP 한 줄 풀이) |
| 20 | `icmp.icmp` | ICMP (Internet Control Message Protocol) | — | 오류 보고와 진단, IP 패킷에 담겨 간다(프로토콜 번호 — step 1 결과대로), 오류 보고 메시지와 질의 메시지, **ICMP는 IP를 믿을 수 있게 만들지 않는다**(p158). 기출의 「비대칭·TTL」·「신뢰성 확보」 처리는 step 1 summary대로. ICMPv6 한 줄. 면접 Q33의 장면(ping으로 가까운 라우터와 바깥 주소를 차례로 확인)은 쓰지 않는다 — ping은 개념 25다 |

### 2. 문항 — `src/data/network/questions.json`에 `n070`~`n071`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n070` | `ip-limits` | 예/아니요 감 — 「IP는 패킷이 사라지면 그 패킷을 다시 보내 준다」(아니요) 또는 「IP는 보내기 전에 상대와 연결을 맺지 않는다」(예). 방향은 균형에 맞춰 고른다. 아니요면 해설이 누가 다시 보내는지(TCP)를 가르친다 |
| `n071` | `icmp` | 4지선다 「원리 이해」 감 — 라우터가 패킷을 목적지로 보낼 수 없을 때 ICMP가 하는 일(출발지에 알린다)과 하지 않는 일(다시 보내기, 고치기, 연결 맺기). 오답은 같은 범주의 그럴듯한 행동 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/network/visuals/icmp.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'icmp': icmpVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `icmp.ip-limits` — `IpLimitsDiagram`, JSON 키 `ip-limits`

- 물음형 제목 예: `IP는 무엇을 보장하지 않을까?`
- 그릴 것: 출발지 호스트와 목적지 호스트, 그 사이를 따로따로 가는 패킷 1~3.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `unreliable` | 비신뢰성 | 패킷 1~3과 목적지 | 패킷이 사라지거나 순서가 바뀌어 닿을 수 있다 — IP는 다시 보내지 않는다 |
  | `connectionless` | 비연결형 | 출발지와 패킷 1~3 | 보내기 전에 연결을 맺지 않고 패킷마다 따로 보낸다 |

- 요점 테스트: `unreliable`에서 한 패킷의 경로가 목적지에 닿지 않고(흐려짐·끊김), 닿은 패킷의 순서 곁말이 보낸 순서와 다르다. `connectionless`에서는 연결을 맺는 경로가 없다.

#### 3-2. `icmp.icmp` — `IcmpFeedbackDiagram`, JSON 키 `icmp-feedback`

- 물음형 제목 예: `ICMP는 문제가 생기면 누구에게 알릴까?`
- 그릴 것: 출발지 호스트 → 라우터 → (닿을 수 없는) 목적지. 원래 패킷의 경로와 ICMP 메시지가 돌아오는 경로.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `error` | 오류 보고 | 출발지·라우터와 ICMP 메시지 | 패킷을 버린 라우터가 출발지에 ICMP 오류 메시지를 보낸다 |
  | `query` | 질의 | 출발지·목적지와 요청·응답 | 질의 메시지는 묻고 답한다 — 상태를 알아보는 데 쓴다 |

- 요점 테스트: `error`에서 ICMP 메시지의 경로가 라우터에서 출발지로 향하고, 원래 패킷을 다시 보내는 경로가 없다. `query`에서는 요청과 응답 경로가 둘 다 보인다.

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 71개, 마지막 id는 `n071`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `arp` 바로 뒤에 있고, `importance` 3·`sourcePages` [144, 158]인지, `data.test.ts`의 주제 지도 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 11을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 21~26(ICMP 메시지의 타입과 코드, 목적지 도달 불가, 시간 초과, 에코 요청과 에코 응답, ping, IGMP)을 만들지 마라.** 이유: step 12~14의 범위다. ICMP 개념은 두 갈래와 대표 예만 쓴다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
