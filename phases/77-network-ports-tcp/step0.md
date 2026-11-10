# Step 0: ports-sources

## 배경

phase 77은 네트워크 과목의 `ports`(포트)·`tcp-udp`(TCP 세그먼트와 UDP 데이터그램)·`tcp-connection`(TCP 연결과 상태)을 만든다. 전체 계획과 결정은 `phases/77-network-ports-tcp/guide.md`에 있다.
step 1~2가 `ports`의 개념 4개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실 가운데 강의 밖이거나 강의가 틀렸을 수 있는 것을 표준 문서로 확인하고 출처 문서에 남긴다.**
데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

`ports`는 기출 9문항 가운데 대부분이 서비스의 기본 포트 번호(HTTPS 443, HTTP 80, SMTP 25, SSH 22와 Telnet 23, FTP 20·21)다. 강의 p224의 목록에 Telnet이 없고,
강의 p225–p226의 등록된 포트 예는 IANA 레지스트리로 확인해야 쓸 수 있다. 그래서 **서비스마다의 포트 번호는 이 step이 확인한 것만** 뒤 step이 쓸 수 있다.

## 읽어야 할 파일

- `phases/77-network-ports-tcp/guide.md` — 특히 「세 주제와 개념 19개」의 `ports` 표와 「예시 값」
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 가리키는 표기, 그림만 있는 슬라이드를 보는 법. **이 규칙을 따른다**
- `docs/source/network/lecture-outline.md`의 「Ch4-1 포트」 절, 「강의 수정 이력」의 L7·L8·L11과 머리의 phase 73·74 문단들(형식이 본보기다)
- `docs/source/network/standards.md` 전체 — 이미 있는 RFC 9293·RFC 768·RFC 1122·RFC 1035·RFC 7766·RFC 2131(「(phase 73 step 1) RFC 951 — …, RFC 2131 — …」)·「(phase 73) 문서용 주소와 이름」 항목. **있는 사실을 다시 찾지 않는다**
- `docs/source/network/interview-facts.md`의 Q30과 수정 이력 I10, `docs/source/network/exam-notes.md`(E15~E18의 형식이 본보기다)
- `docs/source/network/raw/lecture.md`의 p217~p233 — 원문(옮기지 않는다). 그림 슬라이드(p221–p222, p228–p229)는 렌더해서 본다(CLAUDE.md의 PyMuPDF 방법)
- `docs/source/network/raw/exam/data.txt`에서 `ports`로 분류한 줄과 `[인접 ports]` 표지가 붙은 줄, 그 문항(시험 날짜·번호로 `raw/exam/`의 교사용 텍스트에서 찾는다), `raw/exam/exam-analysis.md` 「5. 정답 키 의견」의 2024-05-19 #41·2025-11-02 #35 —
  시험이 무엇을 정답으로 보는지만 본다. 문장을 옮기지 않는다
- `docs/ADR.md`의 **ADR-055**, **ADR-057**, **ADR-059**, **ADR-009**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 `rfc-editor.org`(RFC 본문 — 텍스트판을 받아 절을 직접 읽는다), `iana.org`(포트 번호 레지스트리), `man7.org`(Linux 쪽 사실)다. RFC의 상태(Standard·Informational·Historic·폐기)는 rfc-editor의 문서 정보로 확인한다.
rfc-editor.org가 응답하지 않으면 `curl -4`로 다시 받는다. IANA 레지스트리는 `https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xml`(또는 `.csv`)을 내려받아 필요한 줄만 검색한다 — 파일이 크므로 통째로 읽지 마라.
위키백과·블로그·업체 학습 페이지는 쓰지 않는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `port-number` | 포트 번호가 16비트(0~65535)라는 것(헤더 필드의 길이로 이미 있는지 먼저 본다). TCP와 UDP가 포트 번호를 저마다 따로 쓴다는 것 — IANA가 번호를 전송 프로토콜마다 정해 준다(같은 번호의 TCP 포트와 UDP 포트가 다른 서비스일 수 있다). 주소와 포트를 `주소:포트`로 붙여 적는 꼴의 근거(웹 주소의 `host:port` 등 — 있으면 절만) | RFC 9293 §3.1, RFC 768 Format, RFC 6335 §5·§6, RFC 3986 §3.2.3 |
| b | `port-ranges` | 세 범위와 그 이름 — 0~1023(System Ports / Well-Known Ports), 1024~49151(User Ports / Registered Ports), 49152~65535(Dynamic Ports / Private Ports, Ephemeral Ports). 범위마다 IANA가 번호를 어떻게 다루는지(시스템 포트는 엄격한 절차로 정해 주고, 동적 포트는 누구에게도 정해 주지 않는다). 포트 0이 따로 쓰이는지(예약). 기출 보기의 「1~1023」을 어떻게 볼지 | RFC 6335 §6·§8.1.2, IANA 레지스트리의 머리 설명 |
| c | `port-ranges` | 강의 p225–p226의 등록된 포트 예(1194 OpenVPN, 1433 Microsoft SQL Server, 3306 MySQL, 6379 Redis, 8080 HTTP 대체)가 IANA 레지스트리에 그 서비스로 등록돼 있는지. 등록돼 있지 않거나 이름이 다르면 쓰지 않거나 레지스트리의 이름으로 고친다 | IANA 레지스트리 |
| d | `well-known-ports` | 서비스마다 기본 포트와 전송 프로토콜 — FTP(TCP 20 데이터·21 제어), SSH(TCP 22), Telnet(TCP 23), SMTP(TCP 25), DNS(UDP·TCP 53 — L11), DHCP(UDP 67 서버·68 클라이언트), HTTP(TCP 80), HTTPS(TCP 443 — HTTP를 TLS로 보호). 각 프로토콜의 RFC가 그 포트를 어디서 말하는지(말하지 않으면 IANA 레지스트리로만). HTTP·HTTPS는 `http`·`https` URI의 기본 포트가 80·443이라는 것과, 다른 포트를 URI에 적어 쓸 수 있다는 것 | RFC 959(FTP — 데이터 연결과 제어 연결의 포트), RFC 4253 §4.1(SSH), RFC 854(Telnet — 없으면 IANA), RFC 5321(SMTP), RFC 1035 §4.2(DNS — 이미 있다), RFC 2131 §4.1(DHCP), RFC 9110 §4.2.1·§4.2.2(HTTP·HTTPS), IANA 레지스트리 |
| e | `well-known-ports` | SSH와 Telnet이 무엇이 다른지 — 둘 다 원격 접속이지만 SSH는 주고받는 내용을 암호화한다(SSH 프로토콜 구조 문서), Telnet은 암호화하지 않는다는 것을 표준 문서로 댈 수 있는지(없으면 「암호화한다」만 SSH 쪽 사실로 쓴다) | RFC 4251 §1·§9, RFC 854 |
| f | `well-known-ports` | Linux에서 1024보다 작은 포트를 열려면 특별한 권한이 필요하다는 것(특권 포트) | man7.org `ip(7)`의 포트 설명, `capabilities(7)`의 `CAP_NET_BIND_SERVICE` |
| g | `client-server-ports` | 서버는 정해진 포트에서 연결을 기다리고, 클라이언트는 운영체제가 고른 임시 포트를 출발지로 쓴다는 것. 연결 하나는 양쪽의 IP 주소와 포트 번호(소켓 두 개)로 가려진다는 것과 「소켓」이라는 이름의 근거. 클라이언트가 쓰는 임시 포트를 운영체제가 실제로 어느 범위에서 고르는지 — Linux의 기본 범위(`ip_local_port_range`), 그리고 그것이 IANA의 동적 포트 범위와 다른지 | RFC 9293(소켓과 연결을 가리는 절 — 찾아서 적는다), RFC 6335 §6, RFC 6056 §2(임시 포트의 범위), man7.org `ip(7)` |
| h | 예시 값 | guide.md 「예시 값」의 문서용 주소(이미 있다)와 클라이언트 포트 `50001`·`50002`가 동적 포트 범위 안인지 | RFC 5737 §3(이미 있다), b의 결과 |

빠진 것을 읽다가 찾으면 더한다. 강의 Ch4-1 p217–p229에서 표준과 다르거나 오해를 부르게 줄여 말한 곳이 더 있으면 같은 방법으로 확인한다.
예를 들어 p219–p220의 「전송 계층의 역할」(I10과 겹치는지), p223의 범위, p224의 목록(DHCP 67·68과 전송 프로토콜), p227의 「동적 포트는 사용자가 자유롭게 쓸 수 있다」, p228의 「클라이언트는 보통 동적 포트」(운영체제의 실제 범위와 맞는지)를 본다.
p230–p233(NAT 다시 보기)은 L7·L8에 이미 걸려 있고, 이 phase는 그 내용을 쓰지 않는다 — 다시 확인하지 않는다.

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 77) <문서 이름> — <절 제목>`, URL 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— §절 번호`, 「쓰인 곳」.
  **같은 RFC의 기존 항목(RFC 9293·RFC 768·RFC 1035·RFC 2131 등)이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 77)」을 붙인 줄로 더한다.**
  머리말의 「(phase 76)」 설명 다음 줄(없으면 마지막 「(phase …)」 설명 다음 줄)에 「(phase 77)」이 무엇인지(이 phase의 포트·TCP·UDP·TCP 연결 사실, 확인한 날) 한 줄을 더한다.
- IANA 레지스트리는 항목 하나(`## (phase 77) IANA — Service Name and Transport Protocol Port Number Registry`)로 두고, 확인한 서비스·번호·전송 프로토콜을 한 줄씩 적는다. 레지스트리를 받은 날(레지스트리 머리의 「Last Updated」)도 적는다.
- 폐기되거나 역사적이 된 RFC를 쓰면 항목 제목에 `[폐기, RFC xxxx로 대체 — 역사 기록으로만 쓴다]`(또는 `[Historic — 역사 기록으로만 쓴다]`)를 붙인다(RFC 1631 항목이 본보기).
- 「쓰인 곳」에는 아직 개념 id가 없으므로 **쓰일 개념 id**(`ports.well-known-ports` 등)와 수정 이력·exam-notes 번호를 적는다.

### 3. `docs/source/network/lecture-outline.md` — 수정 이력

- 확인 결과 강의가 표준과 다르거나 오해를 부르게 줄여 말했으면 `### L43 — …`부터 번호를 이어 「강의 수정 이력」 끝에 더한다. 형식은 L39~L42와 같다 —
  강의(직접 쓴 말)·표준(직접 쓴 말)·근거(문서와 절, URL)·처리(**고쳐 쓴다 / 한정해 쓴다 / 쓰지 않는다**).
  제목 끝에는 `[phase 77에서 찾음]`을 붙인다. 「설계 때 받은 후보」 표는 phase 69의 기록이라 고치지 않는다.
- 「강의 수정 이력」 머리의 「phase 74 step …에서 …」 문단들 뒤에 「phase 77 step 0에서 …」 문단을 더해 무엇을 더했는지(없으면 「Ch4-1에서 새로 찾은 것 없음」)와 표준과 어긋나지 않은 강의 사실을 적는다.
- 「강의별 정리」의 Ch4-1 절에서 해당 줄 끝에 `⚠ L번호`를 단다(L7처럼). 줄의 내용은 강의가 말한 것 그대로 둔다.
- 확인 결과 강의가 맞으면 수정 이력을 만들지 않고 summary에 「확인 결과 강의가 맞다」로 적는다.

### 4. `docs/source/network/exam-notes.md` — 시험의 답이 표준과 다르거나 표준에 없는 곳

이 주제의 기출 문항(`data.txt`의 `ports` 줄과 `[인접 ports]` 줄 가운데 이 주제의 사실로 답이 갈리는 것)이 정답으로 보는 것이 허용한 출처에 없거나 다르면 `## E27 — …`부터 번호를 이어 더한다(E24~E26 형식 — 시험·표준·처리·쓰인 곳).
표준에 있으면 항목을 만들지 않는다. 새 항목 앞에 「E27~는 phase 77 …」처럼 이 step이 더한 항목을 소개하는 문단을 둔다(확인한 날 포함 — 앞 phase의 소개 문단이 본보기다).

미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **잘 알려진 포트의 범위 「1~1023」**([기출 2024-05-19 #41], [기출 2025-11-02 #35]): 보기가 1~1023을 맞는 것으로 쓴다. IANA 범위는 0~1023이다. 포트 0이 예약이라 실제로 서비스에 정해 줄 수 있는 번호가 1부터라는 근거가 있으면,
  처리를 「본문은 0~1023으로 쓰고 포트 0이 예약이라는 것을 덧붙인다. 「자격시험은 1~1023으로 쓰기도 한다」 줄은 둘지 판단」으로 적는다. 정답을 가르는 사실이 아니면 항목을 만들지 않고 summary에 판단을 적는다.
- **SNTP 123, FTP와 UDP 69**([기출 2024-05-19 #15], [기출 2025-02-23 #14]): 응용 프로토콜 주제(phase 78)의 문항이다. 이 step에서 항목을 만들지 않는다 — 69가 TFTP의 포트라는 것만 확인해 summary에 메모한다.

### 5. summary — 뒤 step이 이것을 보고 쓴다

`ports`의 개념 4개마다 한 줄씩: **무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(L번호), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호)**.
위 표의 a~h마다 결과(확인함/강의가 맞음/못 찾음)와 근거 문서를 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다. 등록된 포트의 예로 쓸 수 있는 것(서비스 이름과 번호)을 목록으로 적는다.
끝에 「사용자 확인」 칸을 둔다(없으면 「없음」) — 허용한 출처 밖의 문서가 꼭 필요하거나 guide.md의 결정과 맞지 않는 사실을 찾았을 때만 적는다.

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`lecture-outline.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다(`raw/render/`의 렌더 그림과 내려받은 RFC·레지스트리는 gitignore 안이거나 저장소 밖이어야 한다 — 저장소 안에 내려받은 파일을 남기지 마라).
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 표준 문서와 강의·기출 문장 모두 옮기지 않는다.
4. `phases/77-network-ports-tcp/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「5. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 1~2가 쓴다.
- **확인하지 못한 사실을 standards.md·수정 이력에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **허용한 출처 밖의 문서(위키백과·블로그·자격증 교재·업체 학습 페이지, 포트 번호를 모아 둔 비공식 목록)를 근거로 쓰지 마라.** 이유: ADR-059.
- **강의·기출·표준 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **`tcp-udp`·`tcp-connection`의 사실(TCP·UDP 헤더 필드, 제어 비트, 순서 번호, 연결 수립·종료, TCP 상태)을 이 step에서 정리하지 마라.** 이유: step 3·9의 범위다. 읽다가 본 것은 summary에 메모만 한다.
- **응용 프로토콜 주제(phase 78)의 포트(POP3·IMAP·SNMP·NTP·TFTP 등)를 standards.md에 정리하지 마라.** 이유: 이 phase의 범위가 아니다. 기출의 인접 문항을 읽다가 본 것은 summary에 메모만 한다.
- **`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 이 step이 쓰는 출처는 모두 이미 허용한 곳(IETF RFC·IANA·man7.org)이다.
