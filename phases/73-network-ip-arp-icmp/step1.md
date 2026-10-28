# Step 1: arp-icmp-sources

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획과 결정은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 0이 `ip-protocol`의 사실을 확인했다. **이 step은 `arp`(개념 13~18)와 `icmp`(개념 19~26)가 쓸 사실 가운데 강의 밖이거나 강의가 틀렸을 수 있는 것을 표준·공식 문서로 확인하고 출처 문서에 남긴다.**
데이터·코드는 고치지 않는다.

- `arp`의 RARP·이웃 탐색과 `icmp`의 IGMP는 강의에 없다. 기출이 묻기 때문에 넣으며(ADR-059), 사실은 **이 step이 허용한 출처에서 확인한 것만** 쓸 수 있다.
- 기출이 맞는 보기로 쓰는 말 가운데 표준에 없는 시험 쪽 구분(「비대칭 프로토콜」, 「TTL을 제공한다」 등)이 있다. 그런 것을 사실처럼 가르치지 않도록 이 step이 처리를 정한다.

## 읽어야 할 파일

- `phases/73-network-ip-arp-icmp/guide.md` — 특히 「세 주제와 개념 26개」의 `arp`·`icmp` 표와 「예시 값」
- `phases/73-network-ip-arp-icmp/index.json`의 step 0 `summary`
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처(IETF RFC·IANA·`learn.microsoft.com`의 Windows 명령·`man7.org`의 Linux man-pages가 모두 이미 허용돼 있다). **이 규칙을 따른다**
- `docs/source/network/lecture-outline.md`의 「Ch3-2 ARP」·「Ch3-3 ICMP」 절과 「강의 수정 이력」의 L29
- `docs/source/network/standards.md` 전체 — 이미 있는 RFC 1122(§1.1.3의 ICMP·IGMP 줄), RFC 903(RARP), RFC 1112(IP 멀티캐스트), RFC 894, `(phase 71) Microsoft Learn — Windows commands, ping`,
  `(phase 72) Linux man-pages — ether_aton(3), arp(8)`, step 0이 더한 「(phase 73)」 항목. **있는 사실을 다시 찾지 않는다**
- `docs/source/network/interview-facts.md`의 Q23·Q31·Q33, `docs/source/network/exam-notes.md`(E2 RARP의 계층, step 0이 더한 항목)
- `docs/source/network/raw/lecture.md`의 p130~p158 — 원문(옮기지 않는다). 그림 슬라이드(p133–p143, p151–p157)는 렌더해서 본다(CLAUDE.md의 PyMuPDF 방법)
- `docs/source/network/raw/exam/data.txt`에서 `arp`·`icmp`·`X-igmp`로 분류한 줄과 그 문항(시험 날짜·번호로 `raw/exam/`의 교사용 텍스트에서 찾는다), `raw/exam/exam-analysis.md` 「5. 정답 키 의견」 —
  시험이 무엇을 정답으로 보는지만 본다. 문장을 옮기지 않는다
- `docs/ADR.md`의 **ADR-055**, **ADR-057**, **ADR-059**, **ADR-009**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어(WebFetch) 확인한다

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `arp` | ARP가 프로토콜 주소(IP 주소)를 하드웨어 주소(이더넷 주소)로 바꾸는 프로토콜이라는 것, 이더넷 프레임에 바로 실린다(이더타입 0806 — IANA·RFC 9542에 있으면 기존 항목에 「쓰인 곳」만 더한다) | RFC 826, IANA 「Address Resolution Protocol (ARP) Parameters」 |
| b | `arp-request-reply` | 요청은 브로드캐스트로, 응답은 요청한 장치에게 바로 보낸다. 메시지의 칸(하드웨어 유형, 프로토콜 유형, 두 주소 길이, 오퍼레이션 — 요청 1·응답 2, 보낸 쪽 하드웨어·프로토콜 주소, 대상 하드웨어·프로토콜 주소)과 강의 p137의 칸 이름이 맞는지. 대상 프로토콜 주소가 자기 것이 아니면 무시한다는 것, **요청을 받은 장치도 보낸 쪽의 짝을 표에 적는다(또는 이미 있으면 갱신한다)**는 것 | RFC 826 「Packet format」·「Packet Reception」 |
| c | `arp-cache` | 짝을 적어 두는 표(캐시)를 둔다는 것, 항목을 일정 시간 뒤 지우거나 다시 확인해야 한다는 것과 그 까닭(상대의 하드웨어 주소가 바뀔 수 있다). 시간 값은 표준이 정하는지, 운영체제마다 다른지 — 다르면 「운영체제가 정한 시간」으로만 쓴다 | RFC 1122 §2.3.2.1·§2.3.2.2, RFC 826 「Related issue」, man7.org `arp(7)`(Linux의 시간 매개변수 — 이미 있는 `arp(8)` 항목 곁에) |
| d | `arp-cache` | 명령 — 표 보기(`arp -a`), 고정 항목 넣기(`arp -s`), 항목 지우기(`arp -d`). Windows 명령 문서와 Linux man-pages 둘 다에서 확인하고, 둘이 다르면 다르다고 적는다. [기출 2025-08-24 #8]의 보기(동적 항목을 고정으로 바꾸는 옵션이 `-d`라는 말)가 왜 틀렸는지 댈 수 있게 | `learn.microsoft.com`의 Windows 명령 「arp」, man7.org `arp(8)` |
| e | `arp-across-routers` | ARP 요청(브로드캐스트)이 라우터를 넘어가지 않는다는 것, 목적지가 다른 네트워크면 다음 홉(라우터, 기본 게이트웨이)의 하드웨어 주소를 ARP로 찾는다는 것, 구간마다 링크 계층 주소는 바뀌고 IP 헤더의 출발지·목적지 주소는 그대로라는 것(라우터가 TTL·체크섬만 고친다 — 이미 있는 RFC 1812 항목을 본다). 「기본 게이트웨이」라는 이름의 출처 | RFC 1122 §3.3.1(다음 홉 고르기)·§3.3.1.1, RFC 1812 §4·§5, RFC 919(이미 있음 — 브로드캐스트) |
| f | `rarp` | 이미 있는 RFC 903 항목으로 충분한지. 그 일을 지금 다른 방법(BOOTP, DHCP)이 맡는다는 것을 허용한 출처로 댈 수 있는지(못 찾으면 쓰지 않는다) | RFC 903, RFC 951(BOOTP) §1·§2, RFC 2131 §1 |
| g | `neighbor-discovery` | IPv6에서 ARP의 일을 이웃 탐색이 맡는다는 것, 이웃 요청(NS)·이웃 광고(NA)가 하는 일, 이 메시지들이 ICMPv6 메시지라는 것(타입 번호 135·136 — 확인되면 이름과 함께), 요청을 요청 노드 멀티캐스트 주소로 보낸다는 것(브로드캐스트가 아니라). 이웃 탐색의 다른 일(라우터 찾기 — 라우터 요청·라우터 알림, 주소 중복 확인)은 이름만 | RFC 4861 §1·§3·§4.3·§4.4·§7.2, RFC 4443 §1 |
| h | `ip-limits` | 이미 있는 RFC 1122 §1.1.3(비연결형, 전달 보장 없음, 손상·중복·순서 바뀜·유실)과 RFC 791 §1.4로 충분한지. 「최선형(best-effort)」이라는 말의 허용 출처 | RFC 1122 §1.1.3, RFC 1112 §2(이미 있음 — best-effort), RFC 791 §1.4 |
| i | `icmp` | ICMP가 IP의 일부로 다루어지고 IP에 담겨 간다(프로토콜 번호 1), 오류 보고와 질의(정보) 메시지의 두 갈래, **ICMP는 IP를 신뢰성 있게 만들려는 것이 아니다**(RFC 792 머리 — 강의 p158). 오류 메시지에 대해서는 ICMP 오류를 보내지 않는다(오류의 오류 금지), 조각의 첫 조각이 아니면 보내지 않는다 같은 규칙은 이름만. IPv6용 ICMPv6가 따로 있다는 것 | RFC 792 「Introduction」, RFC 1122 §3.2.2, RFC 4443 §1·§2.1 |
| j | `icmp` | **기출의 시험 쪽 구분**: [기출 2024-02-25 #17]·[2026-02-01 #5]는 ICMP가 「비대칭 프로토콜이고 TTL을 제공한다」를 틀린 설명으로, 「호스트 사이 신뢰성을 확보하려고 에코를 지원한다」를 맞는 설명으로 본다. [기출 2025-11-02 #4]도 「비대칭·TTL」을 ICMP가 아닌 쪽 보기로 쓴다. 표준에서 댈 수 있는 사실(ICMP 메시지에는 TTL 칸이 없고 TTL은 그것을 싣는 IP 헤더의 칸이다, ICMP는 신뢰성을 만들지 않는다)과 댈 수 없는 것(「비대칭」)을 가른다 | RFC 792, RFC 1122 §3.2.2 |
| k | `icmp-message` | 타입 8비트·코드 8비트·체크섬 16비트의 머리. 주요 타입 번호와 이름 — 0 에코 응답, 3 목적지 도달 불가, 5 경로 바꿈(Redirect), 8 에코 요청, 9 라우터 광고, 10 라우터 요청, 11 시간 초과, 12 매개변수 문제. **4(발신지 억제)는 폐기됐다**(RFC 6633), **13·14(타임스탬프)는 유효한지**, 15~18(정보·주소 마스크)은 폐기됐다(RFC 6918). 「IP 주소 중복」이라는 ICMP 메시지가 없다는 것을 IANA 레지스트리로 확인 | IANA 「Internet Control Message Protocol (ICMP) Parameters」, RFC 792, RFC 1256 §3(라우터 광고·요청), RFC 6633, RFC 6918 |
| l | `destination-unreachable` | 코드 0~5의 이름과 뜻(0 네트워크, 1 호스트, 2 프로토콜, 3 포트, 4 단편화 필요·DF 설정, 5 소스 라우트 실패), 0·1·4는 라우터(게이트웨이)가, 2·3은 목적지 호스트가 보낸다는 것. 메시지에 원래 패킷의 IP 헤더와 데이터 앞부분 64비트를 담는다는 것 | RFC 792 「Destination Unreachable Message」, RFC 1122 §3.2.2.1, RFC 1812 §5.2.7.1 |
| m | `time-exceeded` | 코드 0(전송 중 TTL 초과 — 라우터가 보냄), 코드 1(조각 재조합 시간 초과 — 목적지 호스트가 보냄). traceroute가 이것을 써서 경로를 알아내는 방법(TTL을 1부터 늘림), Linux traceroute가 기본으로 보내는 것(UDP 높은 포트 — 끝에서 포트 도달 불가가 돌아옴)과 Windows `tracert`가 보내는 것(ICMP 에코 요청), 명령 이름 | RFC 792 「Time Exceeded Message」, RFC 1393(역사 기록일 수 있음 — 상태 확인), man7.org `traceroute(8)`, `learn.microsoft.com` Windows 명령 「tracert」 |
| n | `echo` | 에코 요청(8)·에코 응답(0), 응답이 요청의 데이터를 그대로 돌려준다는 것, 식별자·순서 번호로 요청과 응답을 맞춘다는 것, 모든 호스트가 에코 요청에 답해야 한다(MUST)는 것 | RFC 792 「Echo or Echo Reply Message」, RFC 1122 §3.2.2.6 |
| o | `ping` | ping이 에코 요청을 보내고 응답을 기다리는 명령이라는 것(이미 있는 `(phase 71) Microsoft Learn — ping` 항목을 본다), 결과에 나오는 값(보낸 수·받은 수·손실률, 왕복 시간 최소·평균·최대, 응답의 TTL)이 무엇인지. Linux ping의 횟수 옵션 `-c`와 Windows의 `-n`. 결과의 TTL이 **응답 패킷 IP 헤더에 남은 값**이라는 것을 공식 문서로 댈 수 있는지(없으면 RFC 791의 TTL 정의와 RFC 792의 에코 응답으로 설명할 수 있는 범위만 쓴다) | man7.org `ping(8)`, `learn.microsoft.com` Windows 명령 「ping」 |
| p | `igmp` | IGMP가 호스트가 자기 멀티캐스트 그룹 가입을 이웃 멀티캐스트 라우터에 알리는 프로토콜이라는 것, IP에 담겨 간다(프로토콜 번호 2), 메시지 종류(멤버십 질의, 멤버십 보고, 그룹 탈퇴 — v2부터), 판(v1 RFC 1112 부록 I, v2 RFC 2236, v3 RFC 3376 — 출발지 지정). **IGMP 메시지를 IP TTL 1로 보낸다**는 것(같은 네트워크 밖으로 나가지 않는다). 유니캐스트에 쓰는 것이 아니라는 것 | RFC 1112 부록 I, RFC 2236 §2·§3, RFC 3376 §1·§4·§5 |
| q | `igmp` | **기출의 시험 쪽 구분**: [기출 2025-05-25 #3]은 IGMP가 「TTL을 제공한다」, 「IGMPv1은 첫 보고를 잃어도 다시 보내지 않는다」, 「호스트와 라우터 사이 비대칭 구조다」를 맞는 설명으로 본다. [기출 2024-05-19 #3]은 「비대칭 프로토콜로서 TTL을 제공하지 않는다」를 틀린 보기로 둔다. RFC 3376 등이 IGMP를 비대칭(asymmetric) 프로토콜이라 부르는지, IGMPv1 호스트가 첫 보고를 되풀이하는지(RFC 1112 부록 I)를 원문에서 찾아 가른다 | RFC 3376 §1·§5, RFC 2236 §3, RFC 1112 부록 I |

빠진 것을 읽다가 찾으면 더한다. 강의 Ch3-2·Ch3-3에서 표준과 다르거나 오해를 부르게 줄여 말한 곳이 더 있으면 같은 방법으로 확인한다.
예를 들어 강의 p152의 코드 4 설명, p155의 「라우터 광고(타입 9)」 설명, p140–p143 그림의 구간별 주소가 표준과 맞는지 본다.

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 73 step 1) <문서 이름> — <절 제목>`, URL 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— §절 번호`, 「쓰인 곳」.
  **같은 문서의 기존 항목(RFC 1122·RFC 903·RFC 1112·RFC 1812·Microsoft Learn·Linux man-pages, step 0이 만든 것)이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 73 step 1)」을 붙인 줄로 더한다.**
  머리말의 「(phase 73)」 줄 다음에 「(phase 73 step 1)」이 무엇인지 한 줄을 더한다.
- 운영체제마다 달라지는 명령 문서(arp·ping·traceroute)는 **어느 판·어느 패키지의 문서인지**(예: Linux man-pages의 판, iputils·traceroute 패키지, Windows Server의 판) 항목에 적는다(ADR-059 「트레이드오프」).
- 폐기된 RFC를 쓰면 항목 제목에 `[폐기, RFC xxxx로 대체 — 역사 기록으로만 쓴다]`를 붙인다.
- 「쓰인 곳」에는 **쓰일 개념 id**(`arp.arp-cache`, `icmp.igmp` 등)와 수정 이력·exam-notes 번호를 적는다.

### 3. `docs/source/network/lecture-outline.md` — 수정 이력

- 확인 결과 강의가 표준과 다르거나 오해를 부르게 줄여 말했으면 step 0이 쓴 마지막 번호 다음부터 `### L…` 항목을 「강의 수정 이력」 끝에 더한다. 형식은 L3·L4와 같고 제목 끝에 `[phase 73에서 찾음]`.
- 「강의 수정 이력」 머리의 step 0 문단 뒤에 「phase 73 step 1에서 …」 문단을 더해 무엇을 더했는지와, 표준 쪽 문서와 어긋나지 않은 강의 사실이 무엇인지를 적는다(phase 72 step 1 문단이 본보기).
- 「강의별 정리」의 Ch3-2·Ch3-3 절에서 해당 줄 끝에 `⚠ L번호`를 단다. 줄의 내용은 강의가 말한 것 그대로 둔다.
- L29(예시 MAC 주소)는 이미 Ch3-2를 덮는다 — 같은 내용으로 새 항목을 만들지 않는다.

### 4. `docs/source/network/exam-notes.md` — 시험의 답이 표준과 다르거나 표준에 없는 곳

이 주제들의 기출 문항(`data.txt`의 `arp`·`icmp`·`X-igmp` 줄)이 정답으로 보는 것이 허용한 출처에 없거나 다르면 step 0이 쓴 마지막 번호 다음부터 `## E…` 항목을 더한다. 형식은 E8을 따른다. 표준에 있으면 항목을 만들지 않는다.

- 위 1-j·1-q처럼 **표준에 없는 시험 쪽 구분**은 「본문은 표준이 말하는 사실을 쓴다」를 지키되, 그 구분 자체(「비대칭 프로토콜이다/아니다」)를 「자격시험은 ~로 본다」 줄로 가르칠 만한지 판단한다.
  학습자가 그 줄로 무엇을 배우는지 설명할 수 없으면(예: 같은 말을 한 문항은 맞다고, 다른 문항은 틀리다고 본다) 「자격시험은」 줄을 쓰지 않는다고 처리하고 그 까닭을 적는다.
  표준에서 같은 내용을 댈 수 있으면(예: RFC 3376이 IGMP를 비대칭이라 부른다) 표준의 사실로 쓴다.
- 기출이 폐기된 ICMP 타입(4 발신지 억제, 17 주소 마스크 요청)을 맞는 보기로 쓰는 곳 — ADR-059의 「시험이 옛 방식을 물을 때」처럼 처리한다(본문은 폐기됐다는 사실을 쓰고 자격시험이 옛 목록으로 묻는다는 것을 덧붙인다).

### 5. summary — 뒤 step이 이것을 보고 쓴다

`arp`의 개념 6개와 `icmp`의 개념 8개마다 한 줄씩: **무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(L번호), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호)**.
위 표의 a~q마다 결과(확인함/강의가 맞음/못 찾음)와 근거 문서를 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`lecture-outline.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 1을 갱신한다.
   - 성공 → `"summary"`에 위 「5. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - WebFetch가 아예 되지 않는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다.
- **확인하지 못한 사실을 standards.md·수정 이력에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **허용한 출처 밖의 문서를 근거로 쓰지 마라.** 이유: ADR-059. 특히 IGMP·ICMP 타입은 교재·블로그 요약이 많다 — RFC와 IANA 레지스트리만 쓴다.
- **강의·기출·표준 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **step 0이 쓴 항목을 고치지 마라.** 이유: 범위가 겹치면 무엇이 어디서 바뀌었는지 따라갈 수 없다. 같은 문서 항목에 줄을 더하는 것은 된다. 고칠 것을 찾으면 summary에 적는다.
- **`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 이 phase가 쓰는 출처는 모두 이미 허용한 곳이다.
