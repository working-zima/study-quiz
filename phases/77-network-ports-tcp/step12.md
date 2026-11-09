# Step 12: closing-time-wait

## 배경

phase 77은 네트워크 과목의 `ports`·`tcp-udp`·`tcp-connection`을 만든다. 전체 계획·결정·공통 규칙은 `phases/77-network-ports-tcp/guide.md`에 있다.
**이 step은 주제 `tcp-connection`의 마지막 개념 둘(18 연결을 끊는 동안의 상태, 19 TIME-WAIT 상태)의 글·문항·도식을 함께 만든다.** 이 phase의 마지막 step이다.

끊는 쪽의 상태는 이름이 비슷해 헷갈린다(FIN-WAIT-2와 CLOSE-WAIT, CLOSING과 TIME-WAIT). 「누가 먼저 끊었는가」와 「지금 누구의 무엇을 기다리는가」 두 질문으로 갈리게 쓴다.

## 읽어야 할 파일

- **`phases/77-network-ports-tcp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/77-network-ports-tcp/index.json`의 step 9 `summary`(특히 **상태 전이 표**와 TIME-WAIT·MSL의 근거)와 step 10·11 `summary`(앞 개념의 요약문과 이미 푼 낱말)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch4-5 TCP 연결」·「Ch4-6 TCP 상태」 절과 그 절이 가리키는 수정 이력, `docs/source/network/standards.md`(RFC 9293 항목과 「(phase 77 step 9)」 줄), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `tcp-connection` 주제의 앞 개념), `src/data/network/questions.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/network/visuals/tcp-connection.json`
- 도식 선례 — step 10·11의 `ConnectionCloseDiagram`·`OpeningStatesDiagram`(두 기둥의 상태와 세그먼트 — 이 꼴을 따른다), `src/components/diagrams/registry.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`tcp-connection` 주제의 `concepts` 끝에 guide.md 표의 18·19를 덧붙인다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 18 | `tcp-connection.closing-states` | 연결을 끊는 동안의 상태 | `tcp-connection.tcp-states` | 연결 종료 동안 두 쪽의 상태를 차례대로(step 9 상태 전이 표). 예는 앞 개념 `connection-termination`과 같이 클라이언트가 먼저 끊는 경우. 먼저 끊는 쪽(액티브 클로즈): ESTABLISHED → FIN을 보내면 FIN-WAIT-1 → 그 ACK를 받으면 FIN-WAIT-2 → 상대의 FIN을 받고 ACK를 보내면 TIME-WAIT → 기다린 뒤 CLOSED. 나중에 끊는 쪽(패시브 클로즈): ESTABLISHED → FIN을 받고 ACK를 보내면 CLOSE-WAIT → 자기 응용 프로그램이 연결을 닫아 FIN을 보내면 LAST-ACK → 그 ACK를 받으면 CLOSED. 세그먼트마다 그때 두 쪽의 상태를 짝지어 보인다. CLOSE-WAIT는 자기 응용 프로그램이 닫기를 기다리는 상태라, 응용 프로그램이 닫지 않으면 이 상태로 남는다(step 9 결과가 허락하는 만큼). 양쪽이 거의 동시에 FIN을 보내는 경우 — FIN-WAIT-1에서 상대의 FIN을 받으면 ACK를 보내고 CLOSING, 내 FIN의 ACK를 받으면 TIME-WAIT. FIN-WAIT-2와 CLOSE-WAIT, CLOSING과 TIME-WAIT가 무엇이 다른지(4절). FIN-WAIT-1에서 FIN과 ACK를 함께 받는 길은 step 9 결과가 확인했을 때만 한 줄 |
| 19 | `tcp-connection.time-wait` | TIME-WAIT 상태 | `tcp-connection.tcp-states` | 먼저 끊은 쪽이 마지막 ACK를 보낸 뒤 2×MSL 동안 머무는 상태. **MSL**을 한 줄로 풀고 표준이 정한 값을 쓴다(step 9 결과대로 — 설계상 정한 값이라는 것까지). 기다리는 까닭 둘을 차례대로 — (1) 마지막 ACK가 사라지면 상대가 FIN을 다시 보내는데, 이쪽이 이미 연결을 지웠다면 다시 확인해 줄 수 없다, (2) 같은 주소·포트 넷으로 곧바로 새 연결을 맺으면, 옛 연결에서 늦게 도착한 세그먼트가 새 연결의 데이터로 받아들여질 수 있다 — 2×MSL이면 그런 세그먼트가 네트워크에서 사라진다. 각 까닭의 근거 절은 step 9 결과대로. TIME-WAIT는 먼저 끊은 쪽에만 생긴다는 것(그래서 서버가 먼저 끊으면 서버에 쌓인다 — step 9 결과가 허락하는 만큼) |

### 2. 문항 — `src/data/network/questions.json`에 `n194`~`n195`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n194` | `closing-states` | 4지선다 「원인과 결과」 — 상황: 어떤 서버에서 연결 하나가 CLOSE-WAIT 상태로 오래 남아 있다. 이 연결에서 지금까지 일어난 일로 맞는 것은 → 상대(클라이언트)가 먼저 FIN을 보냈고 서버는 ACK를 보냈지만, 서버의 응용 프로그램이 아직 연결을 닫지 않았다. 오답: 서버가 먼저 FIN을 보내고 그 ACK를 기다리고 있다(FIN-WAIT-1), 서버가 먼저 FIN을 보내 ACK를 받았고 상대의 FIN을 기다리고 있다(FIN-WAIT-2), 양쪽이 거의 동시에 FIN을 보냈다(CLOSING). 보기에 상태 이름을 쓰지 않고 일어난 일로 쓴다. **정답 위치 3** |
| `n195` | `time-wait` | 예/아니요 「오해 바로잡기」 — n194 뒤 균형(예 35·아니요 35)에서 **아니요** 쪽으로 세운다. 예: TIME-WAIT 상태에서 일정 시간 기다리는 것은 상대가 아직 보낼 데이터가 남아 있을 수 있기 때문인가 — 아니요, 남은 데이터는 상대가 FIN을 보내기 전에 이미 다 보냈다. 기다리는 까닭은 마지막 ACK가 사라졌을 때 다시 확인하려는 것과 옛 연결의 늦은 세그먼트가 새 연결에 섞이지 않게 하려는 것이다. 해설은 두 까닭과 TIME-WAIT가 먼저 끊은 쪽에 생긴다는 것을 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 이 step 뒤 예 35·아니요 36, 정답 위치 31/31/31/31 — phase의 끝 값이다.

### 3. 도식

#### 3-1. `tcp-connection.closing-states` — `ClosingStatesDiagram`, JSON 키 `closing-states`

- 물음형 제목 예: `연결을 끊는 동안 두 쪽의 상태는 어떻게 바뀔까?`
- 그릴 것: step 11의 `OpeningStatesDiagram`과 같은 꼴 — 먼저 끊는 쪽 상태 노드(`ESTABLISHED`·`FIN-WAIT-1`·`FIN-WAIT-2`·`TIME-WAIT`·`CLOSED`)와 나중에 끊는 쪽 상태 노드(`ESTABLISHED`·`CLOSE-WAIT`·`LAST-ACK`·`CLOSED`)를 위에서 아래로, 그 사이에 세그먼트 노드 `FIN`·`ACK`·`FIN`·`ACK`.
  동시 종료의 `CLOSING` 노드는 먼저 끊는 쪽 기둥 옆에 따로 둔다(`FIN-WAIT-1`과 `TIME-WAIT` 사이의 다른 길 — 280 폭에 들지 않으면 세로형에서 기둥 아래쪽에 곁 그룹으로). 같은 이름의 상태도 쪽마다 id를 따로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `active` | 먼저 끊는 쪽 | 먼저 끊는 쪽의 상태 다섯 | FIN을 보내고, ACK와 상대의 FIN을 차례로 기다린 뒤 TIME-WAIT를 거친다 |
  | `passive` | 나중에 끊는 쪽 | 나중에 끊는 쪽의 상태 넷 | FIN을 받으면 CLOSE-WAIT — 자기 응용 프로그램이 닫으면 FIN을 보내고 LAST-ACK |
  | `simultaneous` | 동시에 끊기 | `FIN-WAIT-1`·`CLOSING`·`TIME-WAIT` | 양쪽이 거의 동시에 FIN을 보내면 CLOSING을 거친다 |

- 요점 테스트: `passive`의 선명한 노드에 `TIME-WAIT`가 없고, `active`의 선명한 노드에 `TIME-WAIT`가 있다. `simultaneous`의 선명한 노드에 `CLOSING`이 있다. 나중에 끊는 쪽 기둥의 상태 노드에 `FIN-WAIT-1`·`FIN-WAIT-2`가 없다.

#### 3-2. `tcp-connection.time-wait` — `TimeWaitDiagram`, JSON 키 `time-wait`

- 물음형 제목 예: `먼저 끊은 쪽은 왜 바로 닫지 않고 기다릴까?`
- 그릴 것: 두 기둥(먼저 끊은 쪽 · 나중에 끊은 쪽). 먼저 끊은 쪽 기둥에 `TIME-WAIT · 2×MSL` 노드와 그 아래 `CLOSED`. 세그먼트 노드 — `마지막 ACK`, `다시 온 FIN`, `다시 보낸 ACK`, `늦게 온 옛 세그먼트`(곁말 「기다리는 동안 사라진다」). 시나리오마다 쓰는 노드는 서로 다른 id·자리에.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `lost-ack` | 마지막 ACK가 사라지면 | `마지막 ACK`(흐림 + 곁말 「사라짐」), `다시 온 FIN`, `다시 보낸 ACK`, `TIME-WAIT · 2×MSL` | 아직 기다리고 있으니 다시 온 FIN에 다시 확인해 줄 수 있다 |
  | `old-segment` | 늦게 온 옛 세그먼트 | `늦게 온 옛 세그먼트`, `TIME-WAIT · 2×MSL` | 2×MSL 동안 기다리면 옛 연결의 세그먼트가 네트워크에서 사라진다 |

- 요점 테스트: `lost-ack`에서 `마지막 ACK`는 흐리고 `다시 보낸 ACK`는 선명하며, `다시 온 FIN`의 화살표는 나중에 끊은 쪽에서 먼저 끊은 쪽으로 간다. 두 시나리오 모두 `TIME-WAIT · 2×MSL` 노드가 선명하고, 그 노드가 먼저 끊은 쪽 기둥에 있다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2, 4~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 195개, 마지막 id는 `n195`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 상태 이름·차례·전이를 step 9 summary의 상태 전이 표와 RFC 9293 §3.3.2·§3.6 그림에 하나씩 대조한다(본문·문항·도식 모두). MSL 값과 TIME-WAIT의 두 까닭이 step 9 결과와 같은지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. **`tcp-connection` 주제를 개념 14부터 19까지 처음 배우는 사람의 눈으로 통독한다** — 이 step이 주제의 마지막이다.
   주제 전체에서 같은 말을 되풀이한 곳, 풀이 없이 처음 나오는 낱말, 앞 개념끼리 어긋나는 말이 있으면 summary의 「앞 개념에 고칠 것」에 적는다(고치지 않는다).
4. phase 전체의 끝 값을 확인한다 — 주제 셋(`ports` 4·`tcp-udp` 9·`tcp-connection` 6), 문항 `n171`~`n195`(25), 예/아니요 균형, 정답 위치, 개념마다 도식, 새 주제 셋이 `routing` 뒤·`linux-filesystem` 앞에 차례대로 있는지.
5. `phases/77-network-ports-tcp/index.json`의 step 12를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(주제 통독 결과와 phase 끝 값 포함).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **TIME-WAIT를 줄이거나 없애는 운영체제 설정을 쓰지 마라.** 이유: 기출이 묻지 않고, 출처 영역(RFC)의 사실이 아니다(guide.md 「배경」 — 범위).
- **연결이 끊긴 것을 알아채는 기능(keep-alive)·재설정 공격을 쓰지 마라.** 이유: 이 phase의 범위가 아니다.
- **앞 step이 쓴 개념 14~17을 고치지 마라.** 이유: 범위가 겹치면 무엇이 어디서 바뀌었는지 따라갈 수 없다. 고칠 것을 찾으면 summary에 적는다.
