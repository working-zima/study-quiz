# Step 8: transport-choice

## 배경

phase 77은 네트워크 과목의 `ports`·`tcp-udp`·`tcp-connection`을 만든다. 전체 계획·결정·공통 규칙은 `phases/77-network-ports-tcp/guide.md`에 있다.
**이 step은 주제 `tcp-udp`의 마지막 개념(13 TCP와 UDP를 고르는 기준)의 글·문항·도식을 함께 만든다.** 개념이 하나뿐인 step이다.

기출은 「실시간 화상 통신에는 TCP가 맞지 않는다」, 「손실을 견디는 프로그램에는 TCP가 맞지 않는다」, 「FTP는 UDP를 쓰지 않는다」, 「TFTP는 UDP를 쓴다」를 거듭 묻는다.
응용 이름과 프로토콜을 짝지어 외우게 하지 말고, **응용이 무엇을 더 중요하게 보느냐**에서 답이 나오게 쓴다.

## 읽어야 할 파일

- **`phases/77-network-ports-tcp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/77-network-ports-tcp/index.json`의 step 3 `summary`(특히 i — 응용마다 전송 프로토콜의 근거, 실시간 응용의 근거를 찾았는지, E번호)와 step 4~7 `summary`(앞 개념의 요약문과 이미 푼 낱말)
- **`docs/WRITING_GUIDE.md` 전체**(특히 4절 — 비교)
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch4-3 TCP와 UDP」 절과 L11, `docs/source/network/interview-facts.md`의 Q22·Q38과 I4,
  `docs/source/network/standards.md`(RFC 768·RFC 8085와 「(phase 77 step 3)」 줄 — RTP·TFTP·QUIC·HTTP/3·NTP·RIP 등), `docs/source/network/exam-notes.md`(step 3이 더한 항목)
- `docs/source/network/raw/exam/data.txt`에서 `tcp-udp`로 분류한 줄과 `[인접 tcp-udp]` 줄(교사용 텍스트) — 보기 묶음이 겹치지 않게 하려고 읽는다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `tcp-udp` 주제의 앞 개념 — TCP·UDP를 어떻게 풀었는지), `src/data/network/questions.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/network/visuals/tcp-udp.json`
- 도식 선례 — step 4~7의 도식, `RouteFailoverDiagram`(두 갈래를 견주는 꼴), `src/components/diagrams/registry.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`tcp-udp` 주제의 `concepts` 끝에 guide.md 표의 13을 덧붙인다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 13 | `tcp-udp.transport-choice` | TCP와 UDP를 고르는 기준 | — | 첫 문단: 응용 프로그램이 TCP와 UDP 가운데 무엇을 쓸지는 「데이터가 빠짐없이 순서대로 가야 하는가」와 「조금 잃더라도 늦지 않아야 하는가」로 갈린다 — TCP의 연결·확인·재전송이 주는 것(빠짐없음)과 치르는 값(기다림)을 한 문장으로 되짚는다. 둘째 문단: TCP를 쓰는 응용 — 파일 전송(FTP), 웹(HTTP/1.1), 메일 보내기(SMTP), 원격 접속(SSH) — 한 바이트만 빠져도 결과가 망가진다. 셋째 문단: UDP를 쓰는 응용 — 실시간 음성·영상(늦게 다시 받은 데이터는 이미 재생할 때가 지나 쓸모가 없다 — 근거는 step 3 결과대로, 근거가 없으면 exam-notes 항목대로 「자격시험은」 줄로), 짧은 질의·응답 한 번이면 되는 DNS·DHCP·NTP·RIP(DNS는 TCP도 쓴다 — L11). 넷째 문단: UDP 위에서 응용 프로그램이 스스로 확인·재전송을 더하는 경우 — TFTP(블록마다 확인 응답을 받고 오지 않으면 다시 보낸다), HTTP/3가 쓰는 QUIC(step 3 결과대로). 그래서 「UDP를 쓰면 잃은 데이터를 되찾을 수 없다」가 아니라 「UDP 자체가 되찾아 주지 않는다」라는 것을 4절대로. 근거를 찾지 못한 응용은 쓰지 않는다. 「UDP는 대용량 전송에 맞는다」는 쓰지 않는다(I4). 목록 개념으로 만들지 않는다(굵은 글씨 없음) — 견주는 글이다 |

### 2. 문항 — `src/data/network/questions.json`에 `n186`~`n187`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n186` | `transport-choice` | 4지선다 「원인과 결과」 — 상황: 화상 회의 프로그램이 음성과 영상을 보낼 때 보통 UDP를 쓴다. 그 까닭으로 가장 알맞은 것은 → 사라진 데이터를 다시 받아도 그때는 이미 재생할 때가 지나 쓸모가 없으므로, 재전송을 기다리는 것보다 다음 데이터를 바로 받는 편이 낫다. 오답: UDP는 받는 쪽이 손상 검사를 하지 않아 더 빠르다(I3 — 틀림), UDP는 받는 쪽에서 데이터의 차례를 맞춰 준다(틀림), UDP 헤더가 데이터를 암호화해 준다(틀림). step 3이 실시간 응용의 근거를 찾지 못했으면 정답 보기를 근거가 있는 사실(재전송이 없어 기다림이 없다)로만 세운다. **정답 위치 2** |
| `n187` | `transport-choice` | 예/아니요 「오해 바로잡기」 — n186 뒤 균형(예 33·아니요 34)에서 **예** 쪽으로 세운다. 예: TFTP로 파일을 받다가 블록 하나가 사라지면, TFTP는 그 블록을 다시 보내게 할 수 있는가 — 예, TFTP는 UDP를 쓰지만 블록마다 확인 응답을 받고 오지 않으면 다시 보낸다(step 3 결과대로). 문제문에 「UDP를 쓰지만」처럼 답을 미리 알려 주는 말을 넣지 않는다. TFTP를 문제문에서 한 줄로 푼다(파일을 주고받는 간단한 프로토콜). 해설은 「전송 프로토콜이 하지 않는 일을 응용 프로그램이 할 수 있다」와 FTP(TCP)와의 차이를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 「TCP를 쓰지 않는 것」·「UDP 설명 중 틀린 것」의 보기 묶음을 그대로 쓰지 않는다). 이 step 뒤 예 34·아니요 34, 정답 위치 30/30/30/29.

### 3. 도식

#### 3-1. `tcp-udp.transport-choice` — `TransportChoiceDiagram`, JSON 키 `transport-choice`

- 물음형 제목 예: `이 응용은 TCP와 UDP 가운데 무엇을 쓸까?`
- 그릴 것: 두 그룹 박스 — `TCP`(노드: `파일 전송 FTP`·`웹 HTTP/1.1`·`메일 SMTP`·`원격 접속 SSH`)와 `UDP`(노드: `실시간 음성·영상`·`DNS 질의`·`DHCP`·`TFTP`). 그룹 위(세로형) 또는 왼쪽(가로형)에 기준 노드 둘 — `빠짐없이 순서대로` → TCP 그룹, `늦지 않게 · 짧은 질의` → UDP 그룹(직교 경로).
  본문에서 근거가 확인되지 않아 뺀 응용은 그리지 않는다. 280 폭에서 한 줄에 노드 넷 이상을 두지 마라 — 그룹 안에서 세로로 쌓는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `complete` | 빠짐없이 | `빠짐없이 순서대로`, TCP 그룹의 응용 넷 | 한 바이트만 빠져도 결과가 망가지는 응용은 TCP |
  | `timely` | 늦지 않게 | `늦지 않게 · 짧은 질의`, `실시간 음성·영상` | 늦게 다시 받은 데이터는 쓸모가 없다 |
  | `short-query` | 짧은 질의 | `늦지 않게 · 짧은 질의`, `DNS 질의`·`DHCP` | 질의와 응답 한 번이면 연결을 맺는 비용이 더 크다(본문이 이렇게 쓴 경우만 — 아니면 본문의 말로) |
  | `app-reliability` | 응용이 맡는 확인 | `TFTP` | UDP 위에서 응용 프로그램이 스스로 확인하고 다시 보낸다 |

- 요점 테스트: 시나리오마다 선명한 응용 노드가 모두 한 그룹(TCP 또는 UDP) 안에 있다. `complete`의 선명한 응용은 모두 TCP 그룹 안이고, `timely`·`short-query`·`app-reliability`의 선명한 응용은 모두 UDP 그룹 안이다. 두 그룹의 노드 id 집합이 겹치지 않는다.

위 도식 설계는 출발점이다. 본문(step 3 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 「자격시험은」 줄로만 쓴 사실은 도식에 사실처럼 그리지 않는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2, 4~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 187개, 마지막 id는 `n187`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 응용마다의 전송 프로토콜이 step 3이 `standards.md`에 남긴 근거와 하나씩 같은지 본문·문항·도식에서 대조한다. 근거가 없는 짝이 하나도 없어야 한다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. **`tcp-udp` 주제를 개념 5부터 13까지 처음 배우는 사람의 눈으로 통독한다** — 이 step이 주제의 마지막이다.
   주제 전체에서 같은 말을 되풀이한 곳, 풀이 없이 처음 나오는 낱말, 앞 개념끼리 어긋나는 말이 있으면 summary의 「앞 개념에 고칠 것」에 적는다(고치지 않는다).
4. `phases/77-network-ports-tcp/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(주제 통독 결과 포함).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **비교표(`tables`)를 만들지 마라.** 이유: 이 phase는 비교표를 만들지 않는다(guide.md 「도식」). 견주는 것은 글과 도식으로 한다.
- **근거가 확인되지 않은 「이 응용은 이 프로토콜을 쓴다」를 쓰지 마라.** 이유: 짝 하나가 시험의 답이다 — step 3이 확인한 짝만 쓴다.
- **QUIC·HTTP/3의 동작(스트림, 연결 이전 등)을 자세히 쓰지 마라.** 이유: HTTP 계열 주제(phase 85~)의 범위다. 「UDP 위에서 스스로 재전송한다」 한 줄로 그친다.
