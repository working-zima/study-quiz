# Step 4: tcp-mss

## 배경

phase 77은 네트워크 과목의 `ports`·`tcp-udp`·`tcp-connection`을 만든다. 전체 계획·결정·공통 규칙은 `phases/77-network-ports-tcp/guide.md`에 있다.
**이 step은 주제 `tcp-udp`를 만들고 그 첫 개념 둘(5 TCP, 6 MSS)의 글·문항·도식을 함께 만든다.**

이 주제는 학습자가 「데이터를 빠짐없이 순서대로 보내는 방법」과 「그냥 빨리 보내는 방법」을 처음 견주어 보는 화면이다. 앞 주제(`ports`)를 읽지 않고 바로 들어올 수 있다고 보고 쓴다.

## 읽어야 할 파일

- **`phases/77-network-ports-tcp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/77-network-ports-tcp/index.json`의 step 3 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 step 1·2 `summary`(앞 주제에서 포트를 어떻게 풀었는지)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch4-3 TCP와 UDP」 절과 그 절이 가리키는 수정 이력(L9 포함), `docs/source/network/interview-facts.md`의 Q22와 I2·I10,
  `docs/source/network/standards.md`(특히 RFC 9293 항목과 「(phase 77 step 3)」 줄), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `ports` 주제 — 끼울 자리와 포트 풀이, `ip-protocol`의 MTU·단편화 풀이 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들 — 특히 `PacketPartsDiagram`(헤더와 데이터의 칸)과 `ArpHopsDiagram`(두 장치 사이의 차례)), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`ports` 주제 객체 바로 뒤(`linux-filesystem` 앞)에 주제 객체를 끼운다 — `{ "id": "tcp-udp", "title": "TCP 세그먼트와 UDP 데이터그램", "importance": 3, "sourcePages": [236, 253], "concepts": [ … ] }`.
개념은 guide.md 표의 5·6이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `tcp-udp.tcp` | TCP (Transmission Control Protocol) | — | 이 주제의 첫 개념이라 **전송 계층**, **포트**(호스트 안의 프로그램을 가리는 번호 — 앞 주제와 뜻을 맞춘다), **IP**(데이터를 호스트까지 나르는 프로토콜)와 **패킷**, **응용 프로그램**, **헤더**를 짧게 푼다. 세그먼트(TCP 헤더 + 데이터)가 IP 패킷에 담겨 간다는 것. 특징 넷 — 연결형(3-way handshake를 한 줄로 푼다), 신뢰성(순서 번호·확인 응답·체크섬·재전송 — 낱말마다 한 줄로 푼다. I2 처리대로 「고친다」가 아니라 「다시 보낸다」), 흐름 제어와 혼잡 제어(무엇을 하는지 한 줄씩 — 방식은 쓰지 않는다), 양방향 바이트 흐름(step 3 결과대로). 확인을 받기 전에도 여러 세그먼트를 보낼 수 있다는 것은 step 3 결과대로 한 줄(강의 p252의 그림처럼 「하나씩 확인받으며」로 쓰지 않는다 — 수정 이력이 있으면 그 처리대로). UDP와의 차이는 이 개념에서 길게 쓰지 않는다(`udp`·`transport-choice`의 몫) |
| 6 | `tcp-udp.mss` | MSS (Maximum Segment Size) | `tcp-udp.tcp` | 세그먼트 하나에 담는 데이터의 최대 크기(L9 — 헤더 제외). **MTU**를 한 줄로 푼다(`ip-protocol`의 풀이와 뜻을 맞춘다). 계산 예(guide.md 「예시 값」): MTU `1500`에서 IPv4 헤더 `20`과 TCP 헤더 `20`을 빼 `1460` — 단계대로. 연결을 맺을 때 SYN 세그먼트의 옵션으로 서로 알린다는 것, 알려 오지 않으면 쓰는 기본값, MSS를 지키면 IP가 패킷을 조각낼 일(단편화 — 한 줄)을 줄인다는 것은 step 3 결과대로. MSS와 MTU가 무엇이 다른지(4절 — 무엇을 재는 크기인지, 누가 정하는지) |

### 2. 문항 — `src/data/network/questions.json`에 `n176`~`n177`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n176` | `tcp` | 예/아니요 「오해 바로잡기」 — 면접 수정 I2의 오해. 시작 때(step 2 뒤) 예 32·아니요 32이므로 **아니요** 쪽 주장으로 세운다. 예: 오는 길에 손상된 세그먼트를 받으면 TCP는 받은 쪽에서 손상된 부분을 고쳐 쓰는가 — 아니요, 체크섬으로 손상을 알아채면 그 세그먼트를 쓰지 않고, 보낸 쪽이 다시 보낸 것을 받는다. 문제문이 「체크섬」·「재전송」을 미리 말해 답을 알려 주지 않게 쓴다(guide.md 「문항」 3항). 해설은 손상 검출(체크섬)과 복구(재전송)가 누구의 일인지 가르친다 |
| `n177` | `mss` | 4지선다 「계산」 — 본문과 다른 값: 어떤 링크의 MTU가 `1400`바이트(예로 든 값이라고 밝힌다)이고 IPv4 헤더와 TCP 헤더가 옵션 없이 각각 20바이트일 때 MSS는 → `1360`. 오답은 흔한 실수에서 — 아무것도 빼지 않은 `1400`, 헤더 하나만 뺀 `1380`, 그 밖의 실수 하나(예: 세그먼트 전체 크기로 착각해 IP 헤더만 뺀 값과 겹치지 않게 고른다 — 보기 넷이 서로 다르고 정답이 하나인지 계산한다). **정답 위치 3** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 이 step 뒤 예 32·아니요 33, 정답 위치 28/28/28/28.

### 3. 도식

이 step이 `src/data/network/visuals/tcp-udp.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'tcp-udp': tcpUdpVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」 — `'ports'` 항목 바로 뒤).

#### 3-1. `tcp-udp.tcp` — `TcpReliabilityDiagram`, JSON 키 `tcp-reliability`

- 물음형 제목 예: `TCP는 데이터가 빠짐없이 가도록 무엇을 할까?`
- 그릴 것: 두 기둥(보내는 쪽 · 받는 쪽)과 그 사이의 세그먼트 노드(`세그먼트 1`·`세그먼트 2`·`세그먼트 3`, 시나리오마다 쓰는 노드 — `연결 맺기`, `확인 응답`, `다시 보낸 세그먼트 2`). 받는 쪽 기둥 아래에 받은 차례를 보이는 노드(`1 · 2 · 3 차례로 넘김`)를 둘 수 있다.
  같은 자리에 노드를 겹쳐 두고 opacity로 가리지 말고, 시나리오마다 다른 노드 id를 다른 자리에 둔다. 경로는 직교(guide.md 「주고받는 차례 그림」).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `connect` | 연결 먼저 | 두 기둥의 머리, `연결 맺기` | 데이터를 보내기 전에 연결을 맺는다 |
  | `order` | 차례 맞추기 | 세그먼트 셋, 받은 차례 노드 | 늦게 온 세그먼트도 번호대로 놓아 응용 프로그램에 차례대로 넘긴다 |
  | `resend` | 다시 보내기 | `세그먼트 2`(흐림 + 곁말 「사라짐」), `다시 보낸 세그먼트 2`, `확인 응답` | 잃은 세그먼트는 보낸 쪽이 다시 보낸다 — 받은 쪽이 고치지 않는다 |

- 요점 테스트: `resend`에서 `세그먼트 2` 노드는 흐리고 `다시 보낸 세그먼트 2` 노드는 선명하며, 다시 보낸 세그먼트의 경로가 보내는 쪽에서 받는 쪽으로 간다. `connect`의 선명한 노드에 세그먼트 1~3이 없다.

#### 3-2. `tcp-udp.mss` — `MssSizeDiagram`, JSON 키 `mss-size`

- 물음형 제목 예: `MSS는 패킷의 어느 부분 크기일까?`
- 그릴 것: IP 패킷 하나를 칸으로 — `IPv4 헤더 20`·`TCP 헤더 20`·`데이터 1460`(바이트 — 단위를 라벨이나 곁말에). 칸 셋을 둘레로 묶는 그룹 박스 `MTU 1500`, 데이터 칸을 가리키는 곁말 `MSS 1460`(그룹 박스를 겹쳐 둘레가 걸치지 않게 — 곁말로 보이는 편이 안전하다).
  세로형은 칸 셋을 위에서 아래로 쌓아도 된다(폭에 비례하지 않아도 된다 — 숫자가 크기를 말한다).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `mtu` | MTU | 칸 셋 | 링크가 한 번에 실어 나르는 IP 패킷 전체가 1500바이트 |
  | `mss` | MSS | 데이터 칸 | 헤더 둘을 뺀 데이터만 1460바이트 — MSS는 이것을 잰다 |

- 요점 테스트: 데이터 칸의 숫자와 헤더 두 칸의 숫자를 더하면 MTU 그룹 라벨(또는 곁말)의 숫자와 같다. `mss`에서 선명한 노드는 데이터 칸 하나다.

위 도식 설계는 출발점이다. 본문(step 3 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2, 4~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 177개, 마지막 id는 `n177`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `ports` 바로 뒤·`linux-filesystem` 바로 앞에 있고, `importance` 3·`sourcePages` [236, 253]인지, `data.test.ts`의 주제 지도·별점·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
   `index.ts`의 `visualsByTopicId`에서 `'tcp-udp'`가 `'ports'` 바로 뒤에 있는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. MSS 계산을 손으로 다시 하고, n177의 오답 셋이 정말 틀린 값인지 계산한다.
   step 3 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것과 L9·I2의 처리를 지켰는가.
4. `phases/77-network-ports-tcp/index.json`의 step 4를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 7~13(헤더·순서 번호·확인 응답 번호·제어 비트·UDP·UDP 헤더·고르는 기준)을 만들지 마라.** 이유: step 5~8의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **재전송·흐름 제어·혼잡 제어의 방식을 쓰지 마라.** 이유: phase 84의 주제다(guide.md 「배경」). 「무엇을 하는가」 한 줄로 그친다.
- **「TCP는 데이터를 하나씩 확인받으며 보낸다」로 쓰지 마라.** 이유: 표준은 확인을 받기 전에 윈도우 안에서 여러 세그먼트를 보낼 수 있다(step 3 결과).
