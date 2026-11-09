# Step 10: handshake-termination

## 배경

phase 77은 네트워크 과목의 `ports`·`tcp-udp`·`tcp-connection`을 만든다. 전체 계획·결정·공통 규칙은 `phases/77-network-ports-tcp/guide.md`에 있다.
**이 step은 주제 `tcp-connection`을 만들고 그 첫 개념 둘(14 3-way handshake, 15 TCP 연결 종료)의 글·문항·도식을 함께 만든다.**

이 주제는 학습자가 「연결을 맺고 끊는다」를 세그먼트 단위로 처음 따라가 보는 화면이다. 앞 주제(`tcp-udp`)를 읽지 않고 바로 들어올 수 있다고 보고 쓴다 — 제어 비트·순서 번호·확인 응답 번호를 이 주제 안에서 한 줄씩 다시 푼다.

## 읽어야 할 파일

- **`phases/77-network-ports-tcp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/77-network-ports-tcp/index.json`의 step 9 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지, 상태 전이 표)와 step 5·6 `summary`(순서 번호·확인 응답 번호·제어 비트를 앞 주제가 어떻게 풀었는지 — 뜻을 맞춘다)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch4-5 TCP 연결」 절과 그 절이 가리키는 수정 이력, `docs/source/network/interview-facts.md`의 Q24,
  `docs/source/network/standards.md`(RFC 9293 항목과 「(phase 77 step 9)」 줄), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/exam/data.txt`에서 `tcp-connection`으로 분류한 줄과 그 문항(교사용 텍스트) — 보기 묶음이 겹치지 않게 하려고 읽는다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `tcp-udp` 주제 — 끼울 자리와 TCP 풀이), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례 — step 6의 `AckNumbersDiagram`(두 기둥 사이의 세그먼트 차례 — 이 꼴을 따른다), `ArpHopsDiagram`·`IcmpFeedbackDiagram`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`tcp-udp` 주제 객체 바로 뒤(`linux-filesystem` 앞)에 주제 객체를 끼운다 — `{ "id": "tcp-connection", "title": "TCP 연결과 상태", "importance": 2, "sourcePages": [256, 280], "concepts": [ … ] }`.
개념은 guide.md 표의 14·15다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 14 | `tcp-connection.three-way-handshake` | 3-way handshake | — | 이 주제의 첫 개념이라 **TCP**(데이터를 빠짐없이 순서대로 보내는 전송 계층 프로토콜), **세그먼트**, **클라이언트·서버**, **제어 비트**(SYN — 연결을 시작한다, ACK — 확인 응답 번호가 유효하다), **순서 번호**(보내는 바이트에 매기는 번호)와 **초기 순서 번호 ISN**, **확인 응답 번호**(다음에 받기를 기대하는 번호)를 짧게 푼다 — 앞 주제와 뜻을 맞춘다. 연결 설정 → 데이터 송수신 → 연결 종료의 흐름(p258–p259) 한 줄. 세그먼트 셋을 차례대로(guide.md 표) — 계산 예(「예시 값」): 클라이언트 `192.0.2.10:50001`이 ISN `1000`으로 SYN, 서버 `198.51.100.10:80`이 ISN `7000`과 확인 응답 `1001`로 SYN+ACK, 클라이언트가 확인 응답 `7001`로 ACK — 왜 1을 더하는지(SYN이 번호 하나를 쓴다 — step 3·9 결과대로). ISN 값은 예이고 실제로는 연결마다 정해진다. 왜 셋인지(step 9 결과대로). 액티브 오픈·패시브 오픈(step 9 결과대로) — 서버가 미리 포트를 열고 기다려야 한다는 것(LISTEN을 한 줄로 — 상태는 뒤 개념의 몫이므로 진행 안내 없이). 데이터는 셋째 세그먼트 뒤부터 오간다(셋째 세그먼트에 데이터를 실을 수 있는지는 step 9 결과가 확인했을 때만) |
| 15 | `tcp-connection.connection-termination` | TCP 연결 종료 | — | **FIN**(이쪽은 보낼 데이터가 더 없다)을 한 줄로 푼다. 세그먼트 넷을 차례대로 — 먼저 끊는 쪽(액티브 클로즈)이 FIN, 상대(패시브 클로즈)가 ACK, 상대가 남은 데이터를 다 보낸 뒤 FIN, 처음 쪽이 ACK(p263). 예는 앞 개념과 같은 클라이언트·서버(클라이언트가 먼저 끊는 예). 왜 넷인지 — 두 방향을 따로 닫는다. 첫 FIN과 ACK 뒤에도 상대는 남은 데이터를 보낼 수 있다(step 9 결과대로). 상대의 ACK와 FIN이 한 세그먼트로 함께 올 수 있는지, 이 과정의 이름은 step 9 결과대로. RST로 끊는 것(비정상 종료 — 확인을 주고받지 않고 바로 끝낸다)과 FIN으로 끊는 것(정상 종료)이 무엇이 다른지(4절). 먼저 끊은 쪽이 마지막 ACK 뒤 곧바로 끝나지 않고 잠시 기다린다는 한 줄(TIME-WAIT — 이름만, 까닭은 쓰지 않는다. 진행 안내 없이) |

### 2. 문항 — `src/data/network/questions.json`에 `n188`~`n190`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n188` | `three-way-handshake` | 4지선다 「계산」 — 본문과 다른 값: 클라이언트의 ISN이 `3000`, 서버의 ISN이 `8000`일 때, 클라이언트가 보내는 셋째 세그먼트의 확인 응답 번호는 → `8001`. 오답: `3001`(둘째 세그먼트의 확인 응답 — 방향을 헷갈림), `8000`(1을 더하지 않음), 그 밖의 흔한 실수 하나(보기 넷이 서로 다르게). **정답 위치 3** |
| `n189` | `three-way-handshake` | 4지선다 「개념 확인」 — 둘째 세그먼트(서버 → 클라이언트)에 켜지는 제어 비트는 → SYN과 ACK. 오답: ACK만, SYN만, FIN과 ACK. 기출은 첫째·셋째 단계를 물었다 — 둘째를 묻고 보기를 「비트 짝」으로 바꿔 기출 묶음과 겹치지 않게 한다. 상황(누가 누구에게 무엇에 답하는 세그먼트인지)을 문제문에 준다. **정답 위치 0** |
| `n190` | `connection-termination` | 예/아니요 「오해 바로잡기」 — n189 뒤 균형(예 34·아니요 34)에서 **아니요** 쪽으로 세운다. 예: 먼저 FIN을 보낸 쪽이 그 ACK를 받고 나면, 상대도 더는 데이터를 보낼 수 없는가 — 아니요, FIN은 「이쪽은 보낼 것이 없다」는 뜻이라 상대는 자기 FIN을 보내기 전까지 남은 데이터를 보낼 수 있다(step 9 결과대로). 해설은 두 방향을 따로 닫는다는 것과 세그먼트가 넷인 까닭을 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 이 step 뒤 예 34·아니요 35, 정답 위치 31/30/30/30.

### 3. 도식

이 step이 `src/data/network/visuals/tcp-connection.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'tcp-connection': tcpConnectionVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」 — `'tcp-udp'` 항목 바로 뒤).

#### 3-1. `tcp-connection.three-way-handshake` — `ThreeWayHandshakeDiagram`, JSON 키 `three-way-handshake`

- 물음형 제목 예: `연결을 맺을 때 무엇을 주고받을까?`
- 그릴 것: 두 기둥 — 클라이언트 `192.0.2.10:50001`, 서버 `198.51.100.10:80`(머리 노드). 그 사이에 위에서 아래로 세그먼트 노드 셋 — `SYN · 순서 번호 1000`, `SYN+ACK · 순서 번호 7000 · 확인 응답 1001`(들지 않으면 그룹 박스 안 노드 둘로), `ACK · 확인 응답 7001`. 방향은 노드 양옆의 짧은 직교 화살표 경로(guide.md 「주고받는 차례 그림」).
  맨 아래에 `연결됨 — 데이터를 주고받는다` 노드를 둘 수 있다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `syn` | ① SYN | 두 머리, 첫 세그먼트 | 클라이언트가 자기 ISN을 담아 연결을 청한다 |
  | `syn-ack` | ② SYN+ACK | 두 머리, 둘째 세그먼트 | 서버가 자기 ISN을 보내며 클라이언트의 ISN + 1로 확인한다 |
  | `ack` | ③ ACK | 두 머리, 셋째 세그먼트(와 연결됨 노드) | 클라이언트가 서버의 ISN + 1로 확인하면 연결이 맺어진다 |

- 요점 테스트: 둘째 세그먼트 라벨의 확인 응답 번호 = 첫 세그먼트의 순서 번호 + 1, 셋째 세그먼트의 확인 응답 번호 = 둘째 세그먼트의 순서 번호 + 1(라벨의 숫자로). 첫 세그먼트 라벨에 `ACK`가 없고, 둘째 라벨에 `SYN`과 `ACK`가 모두 있다. 시나리오마다 선명한 세그먼트가 하나다.

#### 3-2. `tcp-connection.connection-termination` — `ConnectionCloseDiagram`, JSON 키 `connection-close`

- 물음형 제목 예: `연결은 왜 네 번에 걸쳐 끊을까?`
- 그릴 것: 두 기둥 — 먼저 끊는 쪽(클라이언트, `액티브 클로즈` 곁말)과 나중에 끊는 쪽(서버, `패시브 클로즈` 곁말). 세그먼트 노드 위에서 아래로 — `FIN`(클라이언트 → 서버), `ACK`(서버 → 클라이언트), `남은 데이터`(서버 → 클라이언트), `FIN`(서버 → 클라이언트), `ACK`(클라이언트 → 서버). 같은 이름의 노드라도 id는 따로(`fin-1`·`fin-2` 등).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `first-fin` | 한쪽 닫기 | 첫 `FIN`·첫 `ACK` | 클라이언트 → 서버 방향이 닫힌다 |
  | `half-close` | 남은 데이터 | `남은 데이터` | 서버는 아직 보낼 데이터를 보낼 수 있다 |
  | `second-fin` | 다른 쪽 닫기 | 둘째 `FIN`·둘째 `ACK` | 서버 → 클라이언트 방향도 닫힌다 |

- 요점 테스트: `half-close`의 선명한 데이터 노드의 화살표가 서버에서 클라이언트로만 간다. 첫 `FIN`과 둘째 `FIN`을 보낸 쪽이 서로 다르다(화살표 방향으로). 세그먼트 노드 가운데 FIN·ACK 노드가 넷이다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2, 4~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 190개, 마지막 id는 `n190`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `tcp-udp` 바로 뒤·`linux-filesystem` 바로 앞에 있고, `importance` 2·`sourcePages` [256, 280]인지, `data.test.ts`의 주제 지도·별점·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
   `index.ts`의 `visualsByTopicId`에서 `'tcp-connection'`이 `'tcp-udp'` 바로 뒤에 있는지 본다.
3. 세그먼트의 차례·제어 비트·번호를 RFC 9293 §3.5·§3.6 그림(step 9 summary)과 하나씩 대조한다. n188의 정답·오답을 손으로 계산한다.
4. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 진행 안내 문장이 없는지(특히 「상태는 … 에서」, 「까닭은 … 에서」) 본다.
5. `phases/77-network-ports-tcp/index.json`의 step 10을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 16~19(TCP 상태·맺는 동안의 상태·끊는 동안의 상태·TIME-WAIT)를 만들지 마라.** 이유: step 11·12의 범위다. 이 step의 글은 상태 이름을 한 줄 풀이로만 쓴다.
- **ISN을 고르는 방법(시계·난수)을 쓰지 마라.** 이유: 기출이 묻지 않는다(guide.md 「배경」 — 범위). 「연결마다 정해진다」 한 줄로 그친다.
- **「4-way handshake」를 표준의 이름처럼 쓰지 마라.** 이유: step 9가 표준에 그 이름이 있는지 확인한 대로만 쓴다.
