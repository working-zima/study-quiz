# Step 6: ack-control-bits

## 배경

phase 77은 네트워크 과목의 `ports`·`tcp-udp`·`tcp-connection`을 만든다. 전체 계획·결정·공통 규칙은 `phases/77-network-ports-tcp/guide.md`에 있다.
**이 step은 주제 `tcp-udp`의 개념 둘(9 확인 응답 번호, 10 TCP 제어 비트)의 글·문항·도식을 함께 만든다.**

`tcp-control-bits`는 기출이 「플래그가 아닌 것」, 「정상 종료를 뜻하는 플래그」, 「플래그 필드의 길이」로 거듭 묻는 자리다. 비트 이름을 외우게 하지 말고 「이 비트를 켜면 상대에게 무엇을 알리는가」로 읽히게 쓴다.

## 읽어야 할 파일

- **`phases/77-network-ports-tcp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/77-network-ports-tcp/index.json`의 step 3 `summary`(확인 응답 번호의 예 처리, 제어 비트의 근거, NS·AE 비트와 9비트의 처리 — E29. (exam-notes E29의 「처리」 — 11-09에 바뀌었다. step 3 summary의 E29 처리 문단은 낡았으니 따르지 마라))와 step 4·5 `summary`(앞 개념의 요약문과 이미 푼 낱말)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch4-3 TCP와 UDP」 절과 그 절이 가리키는 수정 이력, `docs/source/network/standards.md`(RFC 9293·RFC 3168·RFC 3540·RFC 8311 항목과 「(phase 77 step 3)」 줄), `docs/source/network/exam-notes.md`(step 3이 더한 항목)
- `docs/source/network/raw/exam/data.txt`에서 `tcp-udp`로 분류한 줄 가운데 제어 비트를 묻는 문항(교사용 텍스트) — 보기 묶음이 겹치지 않게 하려고 읽는다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `tcp-udp` 주제의 앞 개념), `src/data/network/questions.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/network/visuals/tcp-udp.json`
- 도식 선례 — step 4·5의 `TcpReliabilityDiagram`·`SequenceNumbersDiagram`·`TcpHeaderDiagram`, `ArpHopsDiagram`(두 장치 사이의 차례), `src/components/diagrams/registry.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`tcp-udp` 주제의 `concepts` 끝에 guide.md 표의 9·10을 덧붙인다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `tcp-udp.ack-number` | 확인 응답 번호 | `tcp-udp.tcp-header` | 받는 쪽이 보내는 「다음에 받기를 기대하는 바이트 번호」. ACK 비트가 켜졌을 때만 뜻이 있다(ACK 비트를 한 줄로 푼다). 계산 예(앞 개념 `sequence-number`의 예를 잇는다): 순서 번호 `5001`인 세그먼트의 데이터 1,000바이트를 받으면 `6001`로 답한다 — 단계대로. 누적 확인 — `8001`로 답하면 `8000`번 바이트까지 모두 받았다는 뜻. 둘째 세그먼트(`6001`부터)가 사라지고 셋째(`7001`부터)가 먼저 오면 확인 응답 번호는 여전히 `6001`이고, 셋째는 버리지 않고 가지고 있는다. 양쪽이 저마다 순서 번호를 갖고 서로 확인한다는 것(전이중 — 한 줄). 강의 p247–p248 예의 처리는 step 3 결과대로. 순서 번호와 확인 응답 번호가 무엇이 다른지(4절 — 누가 무엇을 가리키는 번호인지) |
| 10 | `tcp-udp.tcp-control-bits` | TCP 제어 비트 | `tcp-udp.tcp-header` | **목록 개념** — 소개 문단(헤더의 9비트, 비트마다 켜고 끈다, 한 세그먼트에 여럿을 함께 켤 수 있다) 뒤 항목을 헤더의 차례대로(AE·CWR·ECE·URG·ACK·PSH·RST·SYN·FIN). 항목 꼴은 guide.md 「글」의 「제어 비트」 — `- **SYN**(Synchronize)은 …`(영문 이름은 step 3 결과대로. 확인되지 않으면 약어만 굵게). AE·CWR·ECE는 한 항목에 묶어도 된다(ECN을 한 줄로 푼다. AE는 「혼잡 표시를 더 자세히 알리는 방식(AccECN)에 쓰고, 연결을 맺을 때 두 끝이 그 방식을 쓰기로 합의해야 그 방식으로 쓰인다」까지만 — 방식은 쓰지 않는다. 근거는 standards.md의 RFC 9768·IANA TCP Header Flags 항목). 뜻은 step 3 결과대로 — 특히 RST(연결을 재설정 — 비정상으로 끊거나 받을 수 없는 연결 요청을 거절한다)와 FIN(보낼 데이터가 더 없다 — 정상 종료)이 무엇이 다른지(4절 — 기출의 「정상 종료」). 목록 뒤 문단: 8비트로 그린 자료 — exam-notes E29의 처리대로(RFC 9293(2022)의 그림과 강의 p239는 AE가 정해지기 전이라 예약 4비트·제어 비트 8개다. AE 자리는 2003~2018년에 NS라는 실험용 비트로 쓰였다가 예약으로 돌아갔고, 2026년에 AE로 정해졌다. 시험의 9비트는 지금의 레지스트리와 같으므로 「자격시험은」 줄은 두지 않는다). 제어 비트를 「플래그」라고도 부른다는 것은 step 3 결과대로 한 줄 |

### 2. 문항 — `src/data/network/questions.json`에 `n181`~`n183`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n181` | `ack-number` | 4지선다 「계산·원리 이해」 — 본문과 다른 값: 보낸 쪽이 순서 번호 `3001`·`3401`·`3801`인 세그먼트 셋(각 400바이트)을 보냈는데 둘째가 사라지고 첫째와 셋째만 도착했다. 받은 쪽이 보내는 확인 응답 번호는 → `3401`. 오답: `4201`(셋째까지 받았다고 착각 — 누적 확인을 모르는 실수), `3801`(먼저 온 셋째의 번호), `3001`(받은 첫 세그먼트의 번호를 그대로). **정답 위치 3** |
| `n182` | `tcp-control-bits` | 4지선다 「개념 비교」 — FIN과 RST를 가르는 상황. 예: 웹 서버가 응답을 다 보낸 연결을 정상으로 닫을 때 켜는 비트와, 아무 프로그램도 기다리지 않는 포트로 연결 요청이 왔을 때 거절하며 켜는 비트를 짝지은 것 → (FIN, RST). 오답: (RST, FIN), (FIN, SYN), (SYN, RST). 거절의 근거가 step 3 결과에 없으면 같은 「비교」의 다른 상황으로 바꾼다(기출의 「정상 종료를 뜻하는 플래그」 꼴을 그대로 쓰지 않는다). **정답 위치 0** |
| `n183` | `tcp-control-bits` | 예/아니요 「원리 이해」 — n182 뒤 균형(예 32·아니요 33)에서 **예** 쪽으로 세운다. 예: ACK 비트가 꺼진 세그먼트라면, 받는 쪽은 그 세그먼트의 확인 응답 번호 칸을 읽지 않는가(뜻이 없는 값으로 보는가) — 예. step 3 결과가 이 사실을 확인하지 못했으면 같은 방향의 다른 주장(예: 한 세그먼트에 SYN과 ACK를 함께 켤 수 있는가)으로 바꾼다. 해설은 비트와 그 비트가 유효하게 만드는 칸의 관계를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 「플래그가 아닌 것」의 보기 묶음, 없는 비트 이름 「UTC」를 쓰지 않는다). 이 step 뒤 예 33·아니요 33, 정답 위치 30/29/29/29.

### 3. 도식

#### 3-1. `tcp-udp.ack-number` — `AckNumbersDiagram`, JSON 키 `ack-numbers`

- 물음형 제목 예: `받는 쪽은 어떤 번호로 답할까?`
- 그릴 것: 두 기둥(보내는 쪽 · 받는 쪽), 그 사이에 위에서 아래로 세그먼트 노드 `순서 번호 5001`·`순서 번호 6001`·`순서 번호 7001`과 확인 응답 노드(`확인 응답 6001`·`확인 응답 6001`(다시)·`확인 응답 8001`). 시나리오마다 쓰는 노드는 서로 다른 id·자리에 둔다(guide.md 「주고받는 차례 그림」).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `in-order` | 차례대로 | `순서 번호 5001`, `확인 응답 6001` | 1,000바이트를 받았으니 다음은 6001번 바이트 |
  | `gap` | 빠졌을 때 | `순서 번호 6001`(흐림 + 곁말 「사라짐」), `순서 번호 7001`, 다시 보낸 `확인 응답 6001` | 뒤 세그먼트가 먼저 와도 빠진 자리의 번호로 다시 답한다 |
  | `cumulative` | 한꺼번에 확인 | 세그먼트 셋, `확인 응답 8001` | 8001은 8000번 바이트까지 모두 받았다는 뜻 |

- 요점 테스트: `in-order`의 확인 응답 번호 = 선명한 세그먼트의 순서 번호 + 1000. `gap`의 확인 응답 번호 = 흐린(사라진) 세그먼트의 순서 번호. `cumulative`의 확인 응답 번호 = 마지막 세그먼트의 순서 번호 + 1000.

#### 3-2. `tcp-udp.tcp-control-bits` — `TcpControlBitsDiagram`, JSON 키 `tcp-control-bits`

- 물음형 제목 예: `제어 비트 아홉은 무엇을 알릴까?`
- 그릴 것: 9비트 칸 — `AE`·`CWR`·`ECE`·`URG`·`ACK`·`PSH`·`RST`·`SYN`·`FIN`(헤더의 차례). 280 폭에서 아홉 칸이 한 줄에 들지 않으면(라벨 폭 × 1.15 — guide.md 「글자 폭의 여유」) 세 칸씩 세 줄로 두고 「9비트」를 곁말로 보인다(이 경우 「한 줄에 노드 넷 이상 금지」는 칸을 빈틈없이 이은 표 모양이라 예외로 본다 — 칸 폭이 라벨 검사를 통과해야 한다). 가로형은 한 줄 아홉 칸.
  칸 아래에 시나리오마다 뜻을 말하는 곁말 하나.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `start` | 연결 시작 | `SYN` | 순서 번호를 맞추며 연결을 시작한다 |
  | `confirm` | 확인 | `ACK` | 확인 응답 번호 칸이 유효하다 |
  | `finish` | 정상 종료 | `FIN` | 보낼 데이터가 더 없다 |
  | `reset` | 재설정 | `RST` | 연결을 비정상으로 끊거나 요청을 거절한다 |

- 요점 테스트: 칸 노드가 아홉이고 라벨이 헤더의 차례(AE부터 FIN까지)와 같다(10번째 칸이 없다). 시나리오마다 선명한 칸이 정확히 하나이고, 그 라벨이 시나리오 표와 같다. 칸들이 빈틈없이 이어져 있다.

위 도식 설계는 출발점이다. 본문(step 3 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. RFC 9293 그림의 8비트와 옛 이름 NS는 도식에 그리지 않는다(본문 문단이 말한다).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2, 4~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 183개, 마지막 id는 `n183`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 확인 응답 번호의 계산과 n181의 정답·오답을 손으로 다시 계산한다. 제어 비트의 이름·차례·뜻이 step 3 summary와 RFC 9293 §3.1과 같은지 대조한다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. `tcp-udp` 주제를 개념 5부터 10까지 통독한다.
4. `phases/77-network-ports-tcp/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 11~13(UDP·UDP 헤더·고르는 기준)과 `tcp-connection`의 개념(handshake·연결 종료·상태)을 만들지 마라.** 이유: step 7·8·10~12의 범위다. 제어 비트 항목이 연결 수립·종료를 말할 때는 그 비트의 뜻까지만 쓴다.
- **빠른 재전송·중복 확인 응답·선택적 확인 응답(SACK)을 쓰지 마라.** 이유: phase 84(`tcp-retransmission`)의 범위다.
- **NS를 지금의 이름처럼 쓰지 마라. 「그 비트는 지금 쓰이지 않는다」·「지금도 예약이다」도 쓰지 마라.** 이유: 그 비트는 2018년에 예약으로 돌아갔다가 2026-04부터 AE다(exam-notes E29, standards.md RFC 9768 항목).
