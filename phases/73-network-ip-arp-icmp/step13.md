# Step 13: time-exceeded-echo

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 11·12가 개념 19~22를 넣었다. **이 step은 ICMP에 딸린 23 시간 초과와 24 에코 요청과 에코 응답의 글·문항·도식을 만든다.** 다음 step 14가 ping과 IGMP로 phase를 끝낸다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-3 ICMP」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p152~p157 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), 이 주제에서 앞 step이 만든 도식과 `src/data/network/visuals/icmp.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

주제 `icmp`의 `concepts` 끝에 덧붙인다. 개념은 guide.md 표의 23 시간 초과, 24 에코 요청과 에코 응답이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 23 | `icmp.time-exceeded` | 시간 초과 | `icmp.icmp` | TTL을 이 주제 안에서 한 줄로 푼다(패킷이 지날 수 있는 라우터 수의 한도처럼 쓰이는 값 — step 0의 TTL 처리대로). 코드 0(라우터), 코드 1(목적지 — step 1 결과대로). traceroute(Windows는 tracert)가 TTL을 1부터 늘려 경로를 알아내는 방법(p157 — 그림의 출력을 옮기지 않는다). 보내는 패킷 종류와 끝에서 돌아오는 메시지는 step 1 결과대로 |
| 24 | `icmp.echo` | 에코 요청과 에코 응답 | `icmp.icmp` | **목록 개념** — `- **에코 요청**(Echo Request, 타입 8)은 …`, `- **에코 응답**(Echo Reply, 타입 0)은 …`. 응답이 요청의 데이터를 그대로 돌려준다, 식별자·순서 번호로 짝을 맞춘다(step 1 결과대로), 응답이 오면 그 호스트까지 IP 패킷이 오간다는 뜻. p155 그림(요청과 응답이 번갈아 오가는 시간 흐름) |

### 2. 문항 — `src/data/network/questions.json`에 `n075`~`n076`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n075` | `time-exceeded` | 4지선다 「원리 이해」 감 — traceroute가 경로의 두 번째 라우터를 알아내는 방법(TTL 2인 패킷이 그 라우터에서 0이 되어 시간 초과가 돌아온다). 오답은 그럴듯한 다른 방법(라우터가 경로를 미리 알려 준다, 에코 응답에 경로가 적혀 온다 등) |
| `n076` | `echo` | 예/아니요 감 — 「에코 응답은 받은 에코 요청의 데이터를 그대로 담아 돌려보낸다」(예) 또는 「에코 요청을 받은 호스트는 자기가 정한 다른 데이터를 담아 답한다」(아니요). 방향은 균형에 맞춰 고른다 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

`src/data/network/visuals/icmp.json`의 `diagrams`에 키를 더한다. 앞 step이 쓴 키는 고치지 않는다.

#### 3-1. `icmp.time-exceeded` — `TracerouteDiagram`, JSON 키 `traceroute`

- 물음형 제목 예: `traceroute는 경로의 라우터를 어떻게 알아낼까?`
- 그릴 것: 출발지 호스트 → 라우터 1 → 라우터 2 → 목적지 호스트. TTL 곁말과 돌아오는 메시지 경로.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `ttl-1` | TTL 1 | 출발지·라우터 1 | TTL 1인 패킷은 라우터 1에서 0이 되고 라우터 1이 시간 초과를 보낸다 |
  | `ttl-2` | TTL 2 | 출발지·라우터 1·라우터 2 | TTL 2인 패킷은 라우터 2에서 0이 되고 라우터 2가 시간 초과를 보낸다 |
  | `ttl-3` | TTL 3 | 모든 노드 | TTL 3이면 목적지에 닿고 목적지가 답한다(답의 종류는 본문대로) |

- 요점 테스트: `ttl-n`에서 돌아오는 메시지 경로가 시작하는 노드가 n번째 라우터(n=3이면 목적지 호스트)이고, 나가는 패킷 경로가 그 노드에서 끝난다.

#### 3-2. `icmp.echo` — `EchoDiagram`, JSON 키 `echo`

- 물음형 제목 예: `에코 요청과 에코 응답은 어떻게 짝지어질까?`
- 그릴 것: 호스트 A와 호스트 B를 양쪽에, 그 사이 오가는 요청·응답(순서 번호 1·2 곁말).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `request` | 에코 요청 | 호스트 A와 요청 | A가 순서 번호를 붙인 에코 요청을 보낸다 |
  | `reply` | 에코 응답 | 호스트 B와 응답 | B가 같은 번호와 데이터를 담아 에코 응답을 돌려보낸다 |

- 요점 테스트: `reply`의 응답 곁말에 적힌 순서 번호가 `request`의 요청 곁말의 번호와 같고, 요청은 A→B, 응답은 B→A 경로다.

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 76개, 마지막 id는 `n076`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `icmp`의 개념 순서와 `parentId`가 guide.md 표와 같은지, 앞 step의 개념·문항·도식 문구가 한 글자도 바뀌지 않았는지 node로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 13을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 25·26(ping, IGMP)을 만들지 마라.** 이유: step 14의 범위다. 에코 개념은 ping을 이름과 한 줄로만 쓴다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
