# Step 9: connection-sources

## 배경

phase 77은 네트워크 과목의 `ports`·`tcp-udp`·`tcp-connection`을 만든다. 전체 계획과 결정은 `phases/77-network-ports-tcp/guide.md`에 있다.
step 10~12가 `tcp-connection`의 개념 6개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실 가운데 강의 밖이거나 강의가 틀렸을 수 있는 것을 표준 문서로 확인하고 출처 문서에 남긴다.**
데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

`tcp-connection`의 기출 6문항은 handshake의 단계별 제어 비트(첫 단계 SYN, 셋째 단계 ACK)와 LISTEN 상태의 서버가 SYN을 받으면 SYN-RECEIVED가 된다는 것을 묻는다.
강의(Ch4-5·Ch4-6)는 연결 수립·종료와 상태 열하나를 그림으로 보인다. 이 step은 **세그먼트의 차례와 상태 전이를 RFC 9293의 상태 그림·절과 하나씩 대조**한다.

## 읽어야 할 파일

- `phases/77-network-ports-tcp/guide.md` — 특히 「세 주제와 개념 19개」의 `tcp-connection` 표와 「예시 값」
- `phases/77-network-ports-tcp/index.json`의 step 3 `summary`(순서 번호·SYN이 번호 하나를 쓴다는 것 등 이미 확인한 것 — 다시 찾지 않는다)
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 가리키는 표기, 그림만 있는 슬라이드를 보는 법. **이 규칙을 따른다**
- `docs/source/network/lecture-outline.md`의 「Ch4-5 TCP 연결」·「Ch4-6 TCP 상태」 절, 「강의 수정 이력」의 마지막 항목들과 머리의 phase 77 문단들(형식이 본보기다)
- `docs/source/network/standards.md` 전체 — 이미 있는 RFC 9293 항목(§3.6.1 TIME-WAIT 2×MSL 등)과 「(phase 77)」·「(phase 77 step 3)」 줄. **있는 사실을 다시 찾지 않는다**
- `docs/source/network/interview-facts.md`의 Q24, `docs/source/network/exam-notes.md`(step 0·3이 더한 항목의 형식)
- `docs/source/network/raw/lecture.md`의 p256~p280 — 원문(옮기지 않는다). 그림 슬라이드(p260, p263–p265, p270–p271, p273–p280)는 렌더해서 본다(CLAUDE.md의 PyMuPDF 방법)
- `docs/source/network/raw/exam/data.txt`에서 `tcp-connection`으로 분류한 줄과 그 문항(교사용 텍스트) — 시험이 무엇을 정답으로 보는지만 본다. 문장을 옮기지 않는다
- `docs/ADR.md`의 **ADR-055**, **ADR-057**, **ADR-059**, **ADR-009**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 `rfc-editor.org`(RFC 본문 — 텍스트판을 받아 절을 직접 읽는다)와 `man7.org`(Linux `ss`)다. rfc-editor.org가 응답하지 않으면 `curl -4`로 다시 받는다. 위키백과·블로그·업체 학습 페이지는 쓰지 않는다.
RFC 9293은 길다 — 텍스트판을 받아 필요한 절(§3.3.2 상태와 상태 그림, §3.5 연결 수립, §3.6 연결 종료, §3.6.1, §3.4의 MSL, §3.10의 이벤트 처리 가운데 필요한 곳)만 찾아 읽는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `three-way-handshake` | 세그먼트 셋의 차례와 각 세그먼트의 제어 비트·순서 번호·확인 응답 번호(클라이언트 ISN → 서버가 ISN + 1로 확인, 서버 ISN → 클라이언트가 ISN + 1로 확인). 세 번이 필요한 까닭(양쪽이 서로의 초기 순서 번호를 받고 확인해야 한다)의 절. 「3-way handshake」라는 이름이 표준에 있는지. 먼저 여는 쪽과 기다리는 쪽을 부르는 말(active open·passive open)의 절. guide.md 「예시 값」의 ISN `1000`·`7000`과 확인 응답 `1001`·`7001`이 규칙과 맞는지 | RFC 9293 §3.5(그림 포함), §3.9.1(OPEN 호출 — active/passive), §3.4 |
| b | `connection-termination` | FIN·ACK 넷의 차례, FIN이 「이쪽은 더 보낼 데이터가 없다」라는 뜻이라 상대는 FIN을 받은 뒤에도 남은 데이터를 보낼 수 있다는 것(반만 닫힌 연결)의 절, 상대의 ACK와 FIN이 한 세그먼트로 올 수 있는지, 「4-way handshake」 같은 이름이 표준에 있는지(없으면 없다고 적는다), RST로 끊는 것(비정상 종료)과의 차이. FIN이 순서 번호 하나를 쓴다는 것(step 3에서 확인했으면 다시 찾지 않는다) | RFC 9293 §3.6(그림 포함), §3.5.2(재설정), §3.9.1(CLOSE·ABORT) |
| c | `tcp-states` | 상태 열하나의 이름과 뜻 — LISTEN, SYN-SENT, SYN-RECEIVED, ESTABLISHED, FIN-WAIT-1, FIN-WAIT-2, CLOSE-WAIT, CLOSING, LAST-ACK, TIME-WAIT, CLOSED. **CLOSED가 실제로 기억하는 상태가 아니라 연결이 없다는 것을 나타낸다**는 것. 상태 그림의 전이(무엇을 받거나 보내면 어디로 가는지). 이름의 표기(RFC는 하이픈 — 자료에 따라 밑줄로 쓴다는 것은 강의 p280과 기출이 보이는 꼴이지 표준의 사실이 아니다 — 처리는 이 step이 정한다) | RFC 9293 §3.3.2(상태 목록과 그림) |
| d | `tcp-states` | Linux `ss -tan` — `-t`(TCP), `-a`(기다리는 소켓까지 모두), `-n`(이름 대신 숫자)의 뜻, `ss`가 보이는 상태 이름(예: `ESTAB`, `SYN-RECV`, `TIME-WAIT`, `LISTEN`) — man 페이지가 보이는 것만. 출력의 꼴(머리줄)을 man 페이지가 보이지 않으면 출력을 보이지 않는다고 적는다 | man7.org `ss(8)`(COLOPHON의 판 적기) |
| e | `opening-states` | 클라이언트 CLOSED → SYN-SENT → ESTABLISHED, 서버 CLOSED → LISTEN → SYN-RECEIVED → ESTABLISHED의 전이마다 무엇을 받거나 보냈는지. 클라이언트가 SYN+ACK를 받고 ACK를 보내면 ESTABLISHED가 되어 서버보다 먼저라는 것. 기출의 「LISTEN에서 SYN을 받으면 SYN-RECEIVED」가 표준과 맞는지 | RFC 9293 §3.3.2 그림, §3.5, §3.10.7.2(LISTEN에서 SYN 처리)·§3.10.7.3(SYN-SENT) |
| f | `closing-states` | 먼저 끊는 쪽 ESTABLISHED → FIN-WAIT-1 → FIN-WAIT-2 → TIME-WAIT → CLOSED, 나중에 끊는 쪽 ESTABLISHED → CLOSE-WAIT → LAST-ACK → CLOSED의 전이마다 무엇을 받거나 보냈는지. CLOSE-WAIT에서 응용 프로그램이 닫을 때까지 머문다는 것. 양쪽이 거의 동시에 FIN을 보내면 FIN-WAIT-1 → CLOSING → TIME-WAIT. FIN-WAIT-1에서 FIN과 ACK를 함께 받으면 곧바로 TIME-WAIT로 가는 길이 있는지 | RFC 9293 §3.3.2 그림, §3.6(세 경우의 그림) |
| g | `time-wait` | 2×MSL(이미 있다), MSL의 값(표준이 정한 값과 그것이 설계상 정한 값이라는 것), 기다리는 까닭 둘 — 마지막 ACK가 사라져 상대가 FIN을 다시 보내면 다시 확인하려고, 옛 연결의 늦은 세그먼트가 같은 주소·포트의 새 연결에 섞이지 않게 하려고 — 의 절. TIME-WAIT가 먼저 끊은 쪽에만 생긴다는 것 | RFC 9293 §3.4(MSL), §3.6, §3.6.1, RFC 1337(Informational — 있으면 상태를 적는다) |

빠진 것을 읽다가 찾으면 더한다. 강의 Ch4-5·Ch4-6 p256–p280에서 표준과 다르거나 오해를 부르게 줄여 말한 곳이 더 있으면 같은 방법으로 확인한다.
예를 들어 p260의 세그먼트 설명(「연결을 시작한다」·「확인했고 나도 시작한다」), p261의 액티브·패시브 오픈, p263의 종료 그림, p264–p265의 기다리는 까닭, p269의 「stateful」, p272의 CLOSED 설명, p277의 CLOSING, p280 상태 전이도의 이름 표기를 본다.

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 77 step 9) <문서 이름> — <절 제목>`, URL 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— §절 번호`, 「쓰인 곳」.
  **같은 RFC의 기존 항목(RFC 9293 등)이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 77 step 9)」를 붙인 줄로 더한다.** man7.org `ss(8)`은 새 항목으로 두고 COLOPHON의 프로젝트·판·날짜를 적는다.
  머리말의 「(phase 77 step 3)」 설명 다음 줄에 「(phase 77 step 9)」가 무엇인지(`tcp-connection` 주제의 사실, 확인한 날) 한 줄을 더한다.
- 「쓰인 곳」에는 **쓰일 개념 id**(`tcp-connection.opening-states` 등)와 수정 이력·exam-notes 번호를 적는다.

### 3. `docs/source/network/lecture-outline.md` — 수정 이력

- 확인 결과 강의가 표준과 다르거나 오해를 부르게 줄여 말했으면 「강의 수정 이력」 끝에 번호를 이어 더한다(지금 마지막 번호를 보고 잇는다). 형식은 L39~L42와 같고, 제목 끝에 `[phase 77에서 찾음]`을 붙인다.
- 「강의 수정 이력」 머리의 「phase 77 step 3에서 …」 문단 뒤에 「phase 77 step 9에서 …」 문단을 더해 무엇을 더했는지와 표준과 어긋나지 않은 강의 사실을 적는다.
- 「강의별 정리」의 Ch4-5·Ch4-6 절에서 해당 줄 끝에 `⚠ L번호`를 단다. 줄의 내용은 강의가 말한 것 그대로 둔다.
- 확인 결과 강의가 맞으면 수정 이력을 만들지 않고 summary에 「확인 결과 강의가 맞다」로 적는다.

### 4. `docs/source/network/exam-notes.md` — 시험의 답이 표준과 다르거나 표준에 없는 곳

이 주제의 기출 문항(`data.txt`의 `tcp-connection` 줄)이 정답으로 보는 것이 허용한 출처에 없거나 다르면 번호를 이어 더한다(앞 step이 더한 마지막 번호 다음 — E24~E26 형식).
표준에 있으면 항목을 만들지 않는다. 새 항목이 있으면 그 앞에, 없으면 앞 step의 phase 77 항목 뒤에 「phase 77 step 9에서 …」 소개 문단을 둔다(확인한 날 포함, 항목을 만들지 않았으면 그렇다고).

미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **상태 이름의 밑줄 표기**([기출 2024-02-25 #29], [기출 2025-02-23 #35], [기출 2026-05-17 #32]): 시험은 `SYN_RECEIVED`처럼 밑줄로 쓴다. 뜻이 같으면 항목을 만들지 않고, 본문이 「자료에 따라 밑줄로도 쓴다」를 쓸 수 있는지(표준의 사실이 아니라 표기 차이라는 것) summary에 판단을 적는다.
- **handshake 단계의 제어 비트**([기출 2024-11-03 #10], [기출 2025-11-02 #5], [기출 2026-08-02 #11]): 표준과 맞으면 항목을 만들지 않는다.

### 5. summary — 뒤 step이 이것을 보고 쓴다

`tcp-connection`의 개념 6개마다 한 줄씩: **무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(L번호), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호)**.
위 표의 a~g마다 결과(확인함/강의가 맞음/못 찾음)와 근거 문서를 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
**상태 전이 표**(지금 상태 · 받은 것 · 보낸 것 · 다음 상태 — 연결 수립·종료·동시 종료의 모든 전이)를 summary에 둔다 — step 11·12가 이것을 따른다. `ss`로 보일 수 있는 것(옵션 뜻·상태 이름 표기·출력 꼴)을 적는다.
끝에 「사용자 확인」 칸을 둔다(없으면 「없음」) — 허용한 출처 밖의 문서가 꼭 필요하거나 guide.md의 결정과 맞지 않는 사실을 찾았을 때만 적는다.

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`lecture-outline.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다(내려받은 RFC·man 페이지는 저장소 밖에 둔다).
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 표준 문서와 강의·기출 문장 모두 옮기지 않는다.
4. `phases/77-network-ports-tcp/index.json`의 step 9를 갱신한다.
   - 성공 → `"summary"`에 위 「5. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 10~12가 쓴다.
- **확인하지 못한 사실을 standards.md·수정 이력에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **허용한 출처 밖의 문서(위키백과·블로그·자격증 교재·업체 학습 페이지, 패킷 분석 도구의 설명서)를 근거로 쓰지 마라.** 이유: ADR-059.
- **강의·기출·표준 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **재전송 시간·혼잡 제어·연결을 오래 두는 기능(keep-alive)·SYN 플러딩 같은 공격을 이 step에서 정리하지 마라.** 이유: 이 phase의 범위가 아니다(guide.md 「배경」). 읽다가 본 것은 summary에 메모만 한다.
- **`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 이 step이 쓰는 출처는 모두 이미 허용한 곳(IETF RFC·man7.org)이다.
