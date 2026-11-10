# Step 7: udp-header

## 배경

phase 77은 네트워크 과목의 `ports`·`tcp-udp`·`tcp-connection`을 만든다. 전체 계획·결정·공통 규칙은 `phases/77-network-ports-tcp/guide.md`에 있다.
**이 step은 주제 `tcp-udp`의 개념 둘(11 UDP, 12 UDP 데이터그램 헤더)의 글·문항·도식을 함께 만든다.**

UDP는 강의(L10)와 면접(I3·I4)이 모두 고쳐 둔 자리다 — 「껍데기일 뿐」, 「체크섬은 신뢰성과 관계없다」, 「손상을 감지하지 않는다」, 「대용량 전송에 맞는다」를 쓰지 않는다.
기출은 「UDP 헤더에 없는 필드(윈도우·확인 응답 번호)」와 「UDP의 오류 검사는 패리티가 아니다」를 묻는다.

## 읽어야 할 파일

- **`phases/77-network-ports-tcp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/77-network-ports-tcp/index.json`의 step 3 `summary`(UDP·UDP 헤더의 근거와 처리)와 step 4~6 `summary`(앞 개념의 요약문과 이미 푼 낱말)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch4-3 TCP와 UDP」 절과 L10·L11, `docs/source/network/interview-facts.md`의 Q22·Q38과 I3·I4,
  `docs/source/network/standards.md`(RFC 768·RFC 8085·RFC 8200·RFC 1122 항목과 「(phase 77 step 3)」 줄), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/exam/data.txt`에서 `tcp-udp`로 분류한 줄 가운데 UDP를 묻는 문항(교사용 텍스트) — 보기 묶음이 겹치지 않게 하려고 읽는다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `tcp-udp` 주제의 앞 개념 — TCP 헤더를 어떻게 풀었는지), `src/data/network/questions.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/network/visuals/tcp-udp.json`
- 도식 선례 — step 4~6의 `TcpReliabilityDiagram`·`TcpHeaderDiagram`, `Ipv4HeaderDiagram`, `src/components/diagrams/registry.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`tcp-udp` 주제의 `concepts` 끝에 guide.md 표의 11·12를 덧붙인다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `tcp-udp.udp` | UDP (User Datagram Protocol) | — | 데이터그램(UDP 헤더 + 데이터)을 풀고, TCP와 같은 전송 계층 프로토콜이라는 것을 한 줄로. 연결을 맺지 않고 바로 보낸다. 순서를 맞추지 않고, 잃은 데이터그램을 다시 보내지 않고, 흐름 제어·혼잡 제어를 하지 않는다(그 책임이 응용 프로그램에 있다는 것은 step 3 결과대로). 체크섬으로 손상은 검출해 그 데이터그램을 알리지 않고 버리지만, 고치거나 다시 보내지는 않는다(L10·I3) — 「손상을 알아채는 것」과 「잃은 것을 되찾는 것」이 다르다는 것을 4절대로. 연결을 맺는 단계와 확인·재전송이 없어 절차가 적고 그만큼 지연이 짧다(면접 Q38 — 체크섬을 빼서 빠른 것이 아니다). 쓰는 예는 둘만(DNS — 주로 UDP, TCP도 쓴다(L11), DHCP). TCP와 무엇이 다른지는 이 개념에서 길게 쓰지 않는다(`transport-choice`의 몫) — TCP의 특징을 한 줄로 되짚는 것까지 |
| 12 | `tcp-udp.udp-header` | UDP 데이터그램 헤더 | `tcp-udp.udp` | **목록 개념** — 소개 문단(헤더는 8바이트로 늘 같고 필드 넷이 모두 16비트다 — TCP 헤더의 20바이트 이상과 견준다) 뒤 항목 넷. 항목 꼴은 `- **출발지 포트**(Source Port)는 …`. 출발지 포트(답을 받을 필요가 없으면 0 — step 3 결과대로), 목적지 포트, 길이(헤더와 데이터를 합친 바이트 수 — 가장 작은 값 8), 체크섬(손상 검출 — IPv4에서는 0으로 두어 생략할 수 있지만 IPv6에서는 기본적으로 붙인다, L10). 목록 뒤 문단: TCP 헤더에 있는 순서 번호·확인 응답 번호·제어 비트·윈도우가 UDP 헤더에는 없다 — 그래서 차례를 맞추거나, 받았다고 확인하거나, 받는 양을 조절하지 않는다(기출). 계산 예: 길이 필드가 `1008`이면 데이터는 `1008 − 8 = 1000`바이트. 「패리티」 같은 다른 검사 방식이 아니라 체크섬이라는 것은 덧붙이지 않아도 된다 — 체크섬을 바르게 풀면 된다 |

### 2. 문항 — `src/data/network/questions.json`에 `n184`~`n185`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n184` | `udp` | 예/아니요 「오해 바로잡기」 — 면접 Q38·수정 I3의 오해. 시작 때(step 6 뒤) 예 33·아니요 33이므로 **아니요** 쪽 주장으로 세운다. 예: UDP가 TCP보다 지연이 짧은 까닭 가운데 하나는 받는 쪽이 데이터그램의 손상을 검사하지 않기 때문인가 — 아니요, UDP도 체크섬으로 손상을 검출해 버리고, 짧은 지연은 연결을 맺지 않고 확인·재전송을 하지 않는 데서 온다. 해설은 둘을 가르친다 |
| `n185` | `udp-header` | 4지선다 「계산」 — 본문과 다른 값: 받은 UDP 데이터그램의 길이 필드가 `1208`이다. 데이터는 몇 바이트인가 → `1200`. 오답은 흔한 실수에서 — 아무것도 빼지 않은 `1208`, TCP의 최소 헤더 20바이트를 뺀 `1188`, 그 밖의 실수 하나(예: 길이 필드가 IP 헤더까지 센다고 착각해 IP 헤더 20바이트와 UDP 헤더 8바이트를 뺀 `1180`). 보기 넷이 서로 다르고 정답이 하나인지 계산한다. 해설은 헤더 8바이트가 필드 넷 × 16비트에서 나온다는 것과 UDP 헤더에 없는 칸을 함께 가르친다. **정답 위치 1** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 「UDP 헤더에 없는 것」의 보기 묶음을 그대로 쓰지 않는다). 이 step 뒤 예 33·아니요 34, 정답 위치 30/30/29/29.

### 3. 도식

#### 3-1. `tcp-udp.udp` — `UdpDeliveryDiagram`, JSON 키 `udp-delivery`

- 물음형 제목 예: `UDP는 잃거나 망가진 데이터그램을 어떻게 할까?`
- 그릴 것: 두 기둥(보내는 쪽 · 받는 쪽), 그 사이에 위에서 아래로 `데이터그램 1`·`데이터그램 2`·`데이터그램 3`. 연결을 맺는 노드는 없다(그것이 요점이다). 시나리오마다 곁말로 상태를 보인다(guide.md 「색」 — 나쁜 상태는 곁말과 흐림으로).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `no-connection` | 바로 보내기 | 데이터그램 셋 | 연결을 맺지 않고 첫 데이터그램부터 바로 보낸다 |
  | `lost` | 잃었을 때 | `데이터그램 1`·`데이터그램 3`(`데이터그램 2`는 흐림 + 곁말 「사라짐」) | 잃은 데이터그램을 다시 보내지 않는다 |
  | `damaged` | 망가졌을 때 | `데이터그램 3`(곁말 「체크섬이 맞지 않아 버림」) | 손상은 체크섬으로 알아채 버리지만 고치거나 다시 받지 않는다 |

- 요점 테스트: 어느 시나리오에도 「다시 보낸」 노드나 확인 응답 노드가 없다(노드 id 집합으로). `lost`에서 `데이터그램 2`는 흐리다. `damaged`의 곁말에 「체크섬」이 들어 있다.

#### 3-2. `tcp-udp.udp-header` — `UdpHeaderDiagram`, JSON 키 `udp-header-fields`

- 물음형 제목 예: `UDP 헤더에는 무엇이 있고 무엇이 없을까?`
- 그릴 것: 선례 `TcpHeaderDiagram`(step 5)과 같은 꼴로 32비트 두 줄 — 줄1 `출발지 포트 16`·`목적지 포트 16`, 줄2 `길이 16`·`체크섬 16`, 두 줄을 묶는 곁말 `8바이트`. 그 아래 따로 떨어진 노드 하나(또는 그룹 박스) `TCP 헤더에만 있는 칸: 순서 번호 · 확인 응답 번호 · 제어 비트 · 윈도우`(폭에 들지 않으면 노드 둘로 나눈다).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `ports` | 포트 | 출발지·목적지 포트 | TCP처럼 포트로 받을 프로그램을 가린다 |
  | `length-checksum` | 길이와 체크섬 | 길이·체크섬 | 헤더와 데이터를 합친 크기, 그리고 손상 검사 |
  | `missing` | 없는 칸 | TCP에만 있는 칸 노드 | 차례 맞추기·확인·받는 양 조절에 쓰는 칸이 없다 |

- 요점 테스트: 두 줄 각각의 비트 수 합이 32이고 줄이 둘이다(64비트 = 8바이트). `missing`의 선명한 노드 라벨에 「윈도우」와 「확인 응답 번호」가 들어 있다.

위 도식 설계는 출발점이다. 본문(step 3 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2, 4~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 185개, 마지막 id는 `n185`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. L10·L11·I3·I4의 처리를 지켰는지 본문·문항·도식에서 본다(「껍데기」, 「체크섬은 신뢰성과 관계없다」, 「손상을 감지하지 않는다」, 「대용량 전송」이 없는지 `grep`). n185의 정답·오답을 손으로 계산한다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. `tcp-udp` 주제를 개념 5부터 12까지 통독한다.
4. `phases/77-network-ports-tcp/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 13(TCP와 UDP를 고르는 기준)을 만들지 마라.** 이유: step 8의 범위다. UDP를 쓰는 응용은 둘만 예로 든다.
- **UDP 체크섬을 「선택 사항이라 대개 쓰지 않는다」로 쓰지 마라.** 이유: 표준은 기본값이 켜짐이고 IPv6에서는 기본적으로 붙여야 한다(L10). 생략할 수 있는 경우만 한정해 쓴다.
