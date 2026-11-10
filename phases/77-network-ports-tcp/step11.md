# Step 11: states-opening

## 배경

phase 77은 네트워크 과목의 `ports`·`tcp-udp`·`tcp-connection`을 만든다. 전체 계획·결정·공통 규칙은 `phases/77-network-ports-tcp/guide.md`에 있다.
**이 step은 주제 `tcp-connection`의 개념 둘(16 TCP 상태, 17 연결을 맺는 동안의 상태)의 글·문항·도식을 함께 만든다.**

`opening-states`는 이 주제의 기출 6문항 가운데 셋이 묻는 자리다(LISTEN 상태의 서버가 SYN을 받으면 SYN-RECEIVED). 상태 이름을 외우게 하지 말고 「무엇을 보내거나 받았기에 이 상태가 됐고, 지금 무엇을 기다리는가」로 읽히게 쓴다.

## 읽어야 할 파일

- **`phases/77-network-ports-tcp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/77-network-ports-tcp/index.json`의 step 9 `summary`(특히 **상태 전이 표**, `ss`로 보일 수 있는 것, 이름 표기의 처리)와 step 10 `summary`(앞 개념의 요약문과 이미 푼 낱말)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch4-6 TCP 상태」 절과 그 절이 가리키는 수정 이력, `docs/source/network/standards.md`(RFC 9293 항목과 `ss(8)` 항목, 「(phase 77 step 9)」 줄), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/exam/data.txt`에서 `tcp-connection`으로 분류한 줄과 그 문항(교사용 텍스트) — 보기 묶음이 겹치지 않게 하려고 읽는다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `tcp-connection` 주제의 앞 개념, 목록 개념의 선례 `routing.routing-table`), `src/data/network/questions.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/network/visuals/tcp-connection.json`
- 도식 선례 — step 10의 `ThreeWayHandshakeDiagram`·`ConnectionCloseDiagram`, `RoutingTableDiagram`(표 모양), `src/components/diagrams/registry.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`tcp-connection` 주제의 `concepts` 끝에 guide.md 표의 16·17을 덧붙인다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 16 | `tcp-connection.tcp-states` | TCP 상태 | — | **목록 개념** — 소개 문단(TCP는 연결마다 지금 어느 단계에 있는지를 상태로 기억하고, 세그먼트를 받거나 보낼 때와 응용 프로그램이 연결을 열거나 닫을 때 다음 상태로 옮긴다 — 그래서 같은 세그먼트라도 지금 상태에 따라 다르게 처리한다) 뒤 항목 열하나(RFC 9293의 차례). 항목 꼴은 `- **LISTEN**은 …`(guide.md 「글」). 항목마다 「무엇을 기다리는 상태인가」 한 줄 — 자세한 차례는 딸린 개념이 쓰므로 여기서는 한 줄로 그친다. CLOSED의 뜻은 step 9 결과대로. 목록 뒤 문단 둘: (1) 상태 이름의 표기 — step 9 결과대로(RFC의 하이픈 표기와, 자료·명령에 따라 밑줄이나 줄인 이름으로 보인다는 것 — 확인된 것만). (2) Linux에서 `ss -tan`으로 연결마다의 상태를 본다 — 옵션 셋의 뜻은 step 9가 man7.org에서 확인한 것만, 출력은 step 9가 「보일 수 있다」고 한 꼴만(아니면 출력 없이 무엇이 보이는지를 글로) |
| 17 | `tcp-connection.opening-states` | 연결을 맺는 동안의 상태 | `tcp-connection.tcp-states` | 3-way handshake 동안 두 쪽의 상태를 차례대로(step 9 상태 전이 표). 클라이언트: CLOSED → SYN을 보내면 SYN-SENT → SYN+ACK를 받고 ACK를 보내면 ESTABLISHED. 서버: 응용 프로그램이 포트를 열면 LISTEN → SYN을 받고 SYN+ACK를 보내면 SYN-RECEIVED → ACK를 받으면 ESTABLISHED. 예는 앞 개념 `three-way-handshake`와 같은 클라이언트·서버·번호 — 세그먼트마다 그때 두 쪽의 상태를 짝지어 보인다. 클라이언트가 서버보다 먼저 ESTABLISHED가 된다(셋째 세그먼트가 서버에 닿기 전). SYN-SENT와 SYN-RECEIVED가 무엇이 다른지(4절 — 누가 무엇을 보내고 무엇을 기다리는지 — 기출이 가르는 혼동). ESTABLISHED에서야 데이터를 주고받는다 |

### 2. 문항 — `src/data/network/questions.json`에 `n191`~`n193`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n191` | `tcp-states` | 4지선다 「개념 확인」 — 상태 하나를 주고 그 연결이 지금 무엇을 기다리는지 묻는다. 예: SYN-SENT 상태의 연결은 지금 무엇을 기다리는가 → 상대가 보낼 SYN+ACK. 오답: 상대가 보낼 SYN(서버의 LISTEN과 헷갈림), 자기 SYN+ACK에 대한 ACK(SYN-RECEIVED와 헷갈림), 상대의 FIN(끊는 동안의 상태와 헷갈림). 「정의에서 이름만 지운」 꼴(「SYN+ACK를 기다리는 상태는?」)로 뒤집지 않는다. **정답 위치 1** |
| `n192` | `opening-states` | 4지선다 「상황 적용」 — 상황: 클라이언트가 보낸 SYN을 받은 서버가 SYN+ACK를 보냈고, 클라이언트의 ACK는 아직 서버에 닿지 않았다. 이때 서버 쪽 연결의 상태는 → SYN-RECEIVED. 오답: SYN-SENT(클라이언트 쪽 상태 — 가장 헷갈리는 것), LISTEN, ESTABLISHED. 기출(「LISTEN 상태의 서버가 SYN을 받으면」)과 같은 사실이지만 상황을 세그먼트 차례로 주고 보기에 클라이언트 쪽 상태를 넣어 구별을 묻는다. **정답 위치 2** |
| `n193` | `opening-states` | 예/아니요 「원리 이해」 — n192 뒤 균형(예 34·아니요 35)에서 **예** 쪽으로 세운다. 예: 3-way handshake에서 클라이언트는 서버보다 먼저 ESTABLISHED가 되는가 — 예, 클라이언트는 SYN+ACK를 받고 ACK를 보내면 ESTABLISHED가 되고, 서버는 그 ACK를 받아야 된다(step 9 결과대로). 해설은 두 쪽의 상태를 세그먼트 차례와 함께 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 이 step 뒤 예 35·아니요 35, 정답 위치 31/31/31/30.

### 3. 도식

#### 3-1. `tcp-connection.tcp-states` — `TcpStatesDiagram`, JSON 키 `tcp-states`

- 물음형 제목 예: `TCP 연결은 어떤 상태들을 거칠까?`
- 그릴 것: 상태 노드 열하나를 단계별 그룹 박스 넷에 — `연결 전`(CLOSED·LISTEN), `맺는 중`(SYN-SENT·SYN-RECEIVED), `연결됨`(ESTABLISHED), `끊는 중`(FIN-WAIT-1·FIN-WAIT-2·CLOSE-WAIT·CLOSING·LAST-ACK·TIME-WAIT). 이름은 본문과 같은 표기.
  280 폭에서 한 줄에 노드 넷 이상을 두지 마라 — `끊는 중`의 여섯은 두 열로 쌓는다(예: 먼저 끊는 쪽이 거치는 것과 나중에 끊는 쪽이 거치는 것 — 본문이 그렇게 나눴을 때만, 아니면 차례대로). 상태 사이의 화살표는 이 그림에 그리지 않는다(정지된 목록 — 전이는 딸린 개념의 그림이 보인다).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `before` | 연결 전 | CLOSED·LISTEN | 연결이 없거나, 서버가 요청을 기다린다 |
  | `opening` | 맺는 중 | SYN-SENT·SYN-RECEIVED | 3-way handshake가 끝나기를 기다린다 |
  | `established` | 연결됨 | ESTABLISHED | 데이터를 주고받는다 |
  | `closing` | 끊는 중 | 끊는 중의 여섯 | FIN과 ACK를 주고받으며 연결을 닫는다 |

- 요점 테스트: 상태 노드가 열하나이고 라벨이 본문 목록과 같다. 각 상태 노드가 그룹 박스 하나에만 든다. 네 시나리오의 선명한 노드를 합하면 열하나이고 겹치지 않는다.

#### 3-2. `tcp-connection.opening-states` — `OpeningStatesDiagram`, JSON 키 `opening-states`

- 물음형 제목 예: `연결을 맺는 동안 두 쪽의 상태는 어떻게 바뀔까?`
- 그릴 것: 두 기둥 — 클라이언트 쪽 상태 노드(`CLOSED`·`SYN-SENT`·`ESTABLISHED`)와 서버 쪽 상태 노드(`LISTEN`·`SYN-RECEIVED`·`ESTABLISHED`)를 위에서 아래로, 그 사이에 세그먼트 노드 `SYN`·`SYN+ACK`·`ACK`(step 10 도식과 같은 꼴). 같은 이름의 상태도 쪽마다 id를 따로(`client-established`·`server-established`).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `syn-sent` | SYN을 보낸 뒤 | 클라이언트 `SYN-SENT`, `SYN`, 서버 `LISTEN` | 클라이언트는 SYN+ACK를 기다린다 |
  | `syn-received` | SYN을 받은 뒤 | `SYN`, 서버 `SYN-RECEIVED`, `SYN+ACK` | 서버는 SYN+ACK를 보내고 ACK를 기다린다 |
  | `client-established` | 클라이언트 연결됨 | `SYN+ACK`, `ACK`, 클라이언트 `ESTABLISHED`, 서버 `SYN-RECEIVED` | 클라이언트가 먼저 ESTABLISHED가 된다 |
  | `server-established` | 서버 연결됨 | `ACK`, 서버 `ESTABLISHED` | 서버는 ACK를 받아야 ESTABLISHED가 된다 |

- 요점 테스트: `client-established`에서 클라이언트 `ESTABLISHED`는 선명하고 서버 `ESTABLISHED`는 흐리며 서버 `SYN-RECEIVED`는 선명하다. `syn-received`의 선명한 서버 상태 노드 라벨이 `SYN-RECEIVED`(본문 표기)다. 클라이언트 쪽 상태 노드에 `LISTEN`이 없다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2, 4~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 193개, 마지막 id는 `n193`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 상태 이름·차례·전이를 step 9 summary의 상태 전이 표와 RFC 9293 §3.3.2 그림에 하나씩 대조한다(본문·문항·도식 모두). `ss` 옵션의 뜻이 `ss(8)`과 같은지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. `tcp-connection` 주제를 개념 14부터 17까지 통독한다.
4. `phases/77-network-ports-tcp/index.json`의 step 11을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 18·19(끊는 동안의 상태, TIME-WAIT 상태)를 만들지 마라.** 이유: step 12의 범위다. 상태 목록의 끊는 쪽 항목은 한 줄씩으로 그친다.
- **`ss` 출력을 지어서 보이지 마라.** 이유: 명령의 출력도 사실이다 — step 9가 출처로 확인한 꼴만 보인다.
- **`netstat` 같은 다른 진단 명령을 늘어놓지 마라.** 이유: 진단 명령 주제(phase 78)의 범위다.
