# Step 11: diagnostic-sources

## 배경

phase 78은 네트워크 과목의 강의 밖 주제 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획과 결정은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
step 12~15가 `diagnostic-commands`의 개념 8개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 허용한 공식 문서로 확인하고 출처 문서에 남긴다.**
데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

이 주제는 강의가 다루지 않으므로 **사실의 출처는 공식 문서 하나뿐이다**(ADR-059). 기출 17문항이 묻는 것은 netstat(10회 — 열린 포트 확인, Linux `-antp`, Windows `-an`·`-b`·`-r`, Linux 옵션 `-r`·`-p`·`-t`·`-a`의 뜻, netstat이 주지 않는 정보),
pathping(3회 — tracert와 같은 정보에 홉마다의 통계), ipconfig(3회 — `/all`·`/flushdns`·`/renew`), ping(1회 — 멈출 때까지 보내는 `-t`)이다.

## 읽어야 할 파일

- `phases/78-network-app-protocols-diagnostics/guide.md` — 특히 「세 주제와 개념 25개」의 `diagnostic-commands` 표, 「예시 값」, 「출처」
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 0·5 `summary`(같은 phase의 출처 step — 형식)
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과, 이미 있는 항목: 「(phase 71) Microsoft Learn — Windows commands, ping, Task Manager」(phase 73의 arp·tracert 줄 포함), 「(phase 74 step 11) … netstat(8) … Microsoft Learn — route, netstat」(phase 77 step 9의 상태 표기 줄 포함),
  「(phase 77 step 9) ss(8)」, 「(phase 77) … services(5)」, 「(phase 73 step 1) RFC 951 … RFC 2131」(DHCP). **있는 사실을 다시 찾지 않는다** — 그 항목에 줄을 더한다
- `docs/source/network/exam-notes.md` — 형식(E27~E29)과 step 0·5가 더한 항목(마지막 번호를 확인한다)
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `src/data/network/topics.json`의 `icmp.ping`·`icmp.time-exceeded`(ping·traceroute·tracert를 이미 어떻게 썼는지 — Windows ping의 `/n` 표기 포함), `routing.routing-table`(`netstat -r`·`route print`), `ip-address-types.dhcp`(`ipconfig /all`),
  `tcp-connection.tcp-states`(`ss -tan`·netstat 상태 표기) — 뜻과 표기를 맞춘다
- 기출: `docs/source/network/raw/exam/data.txt`에서 `X-netcmd` 줄 17문항과 그 문항(교사용 텍스트) —
  [기출 2024-02-25 #37], [기출 2024-05-19 #32·#38], [기출 2024-08-25 #32], [기출 2024-11-03 #12], [기출 2025-02-23 #38·#39], [기출 2025-08-24 #35·#42], [기출 2025-11-02 #40·#45], [기출 2026-02-01 #41], [기출 2026-05-17 #28·#31·#38], [기출 2026-08-02 #35·#39].
  시험이 무엇을 정답으로 보는지와, 「옳지 않은 것」을 고르는 문항에서 시험이 맞는 말로 두는 보기만 본다. 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 learn.microsoft.com(Windows 명령 — `https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/<명령>`)과 man7.org(Linux 명령 — netstat(8)은 net-tools, ping(8)은 iputils, ip-address(8)은 iproute2)다.
판(Microsoft Learn은 페이지의 갱신 날짜와 적용 대상, man7.org는 COLOPHON)을 적는다. 응답이 느리면 `curl -4`로 다시 받는다.
**명령의 출력 꼴은 사실이다** — 문서가 출력 예를 보이면 그 꼴(칸 이름·줄의 차례)을 적고, 보이지 않으면 「출력 예 없음」이라고 적는다. 뒤 step은 출력 예가 없는 명령의 화면을 지어 보이지 않는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `ipconfig` | ipconfig가 하는 일(모든 TCP/IP 설정 값을 보이고, DHCP·DNS 설정을 새로 고친다), 옵션 없이 보이는 것(어댑터마다 IP 주소·서브넷 마스크·기본 게이트웨이 — 문서의 말대로), **`/all`이 더 보이는 것**(문서가 항목을 늘어놓는지 — 호스트 이름·물리 주소·DHCP·DNS 서버·임대 시각 등을 문서가 실제로 적는지), 출력 예가 있는지, Linux에서 주소를 보는 명령 `ip address`(ip-address(8) — 이름과 하는 일만) | learn.microsoft.com ipconfig(문법·Parameters·Remarks·Examples), man7.org ip-address(8) |
| b | `ipconfig-options` | `/release`(DHCP 서버에 놓아 준다는 메시지를 보내고 주소 설정을 버린다), `/renew`(DHCP 설정을 새로 받는다), `/displaydns`(DNS 클라이언트 리졸버 캐시를 보인다 — Hosts 파일에서 미리 넣은 항목도 든다는 것), `/flushdns`(그 캐시를 비운다), 어댑터 이름을 줄 수 있다는 것, `/release` 뒤 `/renew`의 차례를 문서가 예로 드는지, DHCP를 쓰지 않는 어댑터에서는 어떻게 되는지(쓸지는 판단), `nslookup`이 DNS 서버에 묻는 명령이라는 것(이름과 하는 일만) | learn.microsoft.com ipconfig, nslookup |
| c | `ping-options` | Windows ping의 `/t`(멈출 때까지 — 멈추는 키 Ctrl+C, 통계만 보고 계속하는 키), `/n`(횟수 — 기본 4), `/a`(주소를 이름으로), `/l`(데이터 크기 — 기본값), 그 밖에 기출 오답 보기에 나오는 `/f`(조각내지 않게)의 뜻, **문서가 옵션을 `/`로 적는지 `-`로도 적는지**(Syntax·Examples), Linux ping(8)의 기본(멈출 때까지 보내는지)과 `-c`. 기출이 `-t`로 적는 것이 문서와 다르면 E 항목 | learn.microsoft.com ping(이미 있는 항목에 줄을 더한다), man7.org ping(8)(iputils) |
| d | `tracert` | tracert가 하는 일과 원리(TTL을 늘리며 ICMP 에코 요청을 보내고 시간 초과 메시지로 경로를 알아낸다 — 이미 있는 항목과 대조), 출력의 꼴(문서가 출력 예를 보이는지 — 홉마다 왕복 시간 셋과 이름·주소, 답이 없을 때 `*`), `/d`(이름 알아내기 안 함), `/h`(최대 홉 — 기본 30), `/w`(기다리는 시간 — 쓸지는 판단), 응답하지 않는 라우터가 있다는 것, Linux의 `traceroute`가 man7.org에 있는지(없으면 이름만 — `icmp.time-exceeded`의 근거 항목을 가리킨다) | learn.microsoft.com tracert(이미 있는 항목에 줄을 더한다) |
| e | `pathping` | pathping이 하는 일 — 경로의 라우터를 찾은 뒤(tracert와 같은 일) 각 라우터에 에코 요청을 일정 시간 동안 여러 번 보내 홉마다·링크마다 잃은 비율을 계산한다는 것, 그래서 어느 라우터·링크에 문제가 있는지 안다는 것, `/q`(홉마다 요청 수 — 기본값)·`/p`(간격 — 기본값)·`/h`(최대 홉)·`/n`(이름 안 알아내기), 통계를 계산하는 동안 기다린다는 것(시간의 어림을 문서가 적는지), **출력 예의 꼴**(경로 목록 → 통계 표의 칸 이름 — 적어 둔다, 뒤 step이 그 꼴로 간추린다) | learn.microsoft.com pathping |
| f | `netstat` | netstat이 보이는 것(활성 TCP 연결, 기다리는 포트, 이더넷 통계, 라우팅 테이블, 프로토콜별 통계 — 문서의 말대로), **결과의 칸**(Windows: 프로토콜·로컬 주소·외부 주소·상태 — 문서의 Remarks가 칸과 상태 이름을 늘어놓는지, Linux: netstat(8)의 OUTPUT 절 — Proto·Recv-Q·Send-Q·Local Address·Foreign Address·State·PID/Program name), 상태 이름 표기(Windows 문서의 이름과 Linux의 `LISTEN`·`ESTABLISHED` — 이미 있는 줄과 대조), 출력 예가 있는지, Linux에서 netstat이 대부분 낡았고 `ss`가 대신한다는 것(이미 있다) | learn.microsoft.com netstat(이미 있는 항목에 줄을 더한다), man7.org netstat(8) |
| g | `netstat-windows-options` | `-a`·`-n`·`-o`(PID)·`-b`(실행 파일 — 권한이 모자라면 실패한다는 말의 정확한 내용)·`-p <프로토콜>`(고를 수 있는 프로토콜 이름)·`-r`(`route print`와 같다 — 이미 있다)·`-s`·`-e`, 옵션을 이어 쓰는 예(`-ano` 같은 꼴을 문서가 쓰는지 — Examples), `-o`로 본 PID를 작업 관리자에서 찾는다는 말이 있는지(쓸지는 판단) | learn.microsoft.com netstat |
| h | `netstat-linux-options` | `-a`(기다리는 소켓과 아닌 것 모두)·`-n`(숫자로)·`-t`(`--tcp`)·`-u`(`--udp`)·`-l`(기다리는 소켓만)·`-p`(소켓마다 PID와 프로그램 이름 — 남의 것은 root여야 다 보인다는 근거)·`-r`(라우팅 테이블 — 이미 있다), **`-t`가 시간과 관계가 없다**는 것(문서에 시간 옵션이 따로 있는지 — `-o`/`--timers` 등, 쓸지는 판단), `/etc/services`가 서비스 이름과 포트 번호의 목록일 뿐이라는 것(services(5) — 이미 있다) | man7.org netstat(8)(이미 있는 항목에 줄을 더한다), services(5) |

빠진 것을 읽다가 찾으면 더한다. 다만 기출이 묻지 않는 것을 공식 문서에 있다는 이유만으로 끌어오지 않는다(ADR-059 「범위」) — 「바탕」이 되는 사실만 더한다.

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 78 step 11) <문서 이름> — <명령>`, URL 한 줄, **읽은 판** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 이름`, 「쓰인 곳」.
  같은 문서의 기존 항목(Microsoft Learn ping·tracert·netstat, man7.org netstat(8)·services(5) 등)이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 78 step 11)」을 붙인 줄로 더한다.
- 「쓰인 곳」에는 아직 개념 id가 없으므로 **쓰일 개념 id**(`diagnostic-commands.pathping` 등)와 exam-notes 번호를 적는다.
- 머리의 「확인한 날」 문단들 끝에 「(phase 78 step 11)」이 붙은 줄과 항목이 무엇인지 한 문장을 더한다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 주제의 기출 17문항이 정답으로 보는 것(과, 「옳지 않은 것」을 고르는 문항에서 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 step 5가 쓴 마지막 번호 다음부터 `## E… — …`로 이어 더한다(E27~E29 형식).
공식 문서에 있으면 항목을 만들지 않는다. step 0·5가 쓴 소개 문단처럼 이 step이 본 문항 수와 더한 항목을 소개하고, 표준과 맞는 문항들을 한 줄씩 짚는 문단을 둔다(확인한 날 포함).

미리 본 것 — 판정은 이 step이 출처를 읽고 한다:
- [기출 2025-08-24 #42]가 Windows ping의 옵션을 `-t`·`-a`·`-f`·`-n`처럼 `-`로 적는다. 문서가 `/`로만 적으면 항목 — 처리는 「본문은 문서의 표기를 쓰고, 자격시험은 `-t`처럼 적는다고 한 줄」이 될 것이다(Windows가 `-`도 받는다는 근거가 문서에 있으면 항목 없이 그 사실을 적는다).
  같은 일이 netstat·ipconfig·tracert에도 있는지 본다(기출은 `netstat -b`·`ipconfig /all`처럼 섞어 쓴다).
- [기출 2024-02-25 #37]이 Windows netstat이 주는 정보로 「인터페이스의 구성 정보」·「네트워크 인터페이스의 상태 정보」를 맞는 말로 둔다 — 문서의 `-e`(이더넷 통계)·`-r`(라우팅 테이블 — 인터페이스 목록을 함께 보이는지)과 대조한다.
- [기출 2024-05-19 #38] 등의 pathping 설명 「tracert와 같은 정보를 보여 주면서 홉과 세부 정보 사이의 시간에 관한 정보를 출력이 끝날 때까지 저장」이 문서와 맞는지.
- [기출 2025-11-02 #45]의 「관리자 권한으로 실행한 뒤 `-b`」 — 문서가 권한에 대해 무엇을 말하는지.
- [기출 2025-08-24 #35]·[기출 2026-05-17 #28]의 Linux netstat 옵션 설명(`-r` 라우팅 테이블, `-p` PID와 프로그램 이름, `-a` 모든 연결과 기다리는 포트 — 맞는 말, `-t` 연결된 뒤 시간 — 틀린 말)이 netstat(8)과 맞는지.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`diagnostic-commands`의 개념 8개마다 한 줄씩: **무엇을 쓸 수 있는지(출처와 절), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호)**.
위 표의 a~h마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
명령마다 **출력 예가 문서에 있는지**와, 있으면 그 꼴(칸 이름·줄의 차례 — 값은 옮기지 않는다)을 한 줄로 적는다 — 개념 step이 그 꼴로만 출력을 보인다.
**옵션 표기**(Windows 명령의 `/`와 `-`)를 이 주제에서 어떻게 쓸지 한 줄로 정해 적는다(앞 주제 `icmp.ping`의 `/n` 표기와 맞춘다).
끝에 「사용자 확인」 칸을 둔다 — 사용자가 정해야 할 것이 있으면 적고, 없으면 「없음」.

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 판을 적었는지, 문장이 원문을 옮기지 않았는지 다시 본다. Microsoft Learn·man 페이지와 기출 문장 모두 옮기지 않는다 — 옵션 설명을 번역해 옮기는 것도 전사다.
4. `phases/78-network-app-protocols-diagnostics/index.json`의 step 11을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 12~15가 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **이 PC에서 명령을 실행한 결과를 출처로 쓰지 마라.** 이유: 실행 결과는 판·설정마다 다르고 허용한 출처가 아니다(ADR-059). 출력의 꼴은 문서가 보이는 것만 적는다.
- **허용한 출처 밖의 문서(위키백과·블로그·자격증 교재·업체 학습 페이지·Q&A 사이트, Microsoft의 커뮤니티 답변·블로그)를 근거로 쓰지 마라.** 이유: ADR-059.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **기존 항목의 줄과 step 0·5가 더한 항목을 고치거나 지우지 마라.** 이유: 앞 개념이 그 줄을 근거로 쓴다. 더할 것은 「(phase 78 step 11)」 줄로 더한다.
- **`lecture-outline.md`·`interview-facts.md`·`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 강의·면접은 이 주제를 다루지 않고, 이 phase는 새 출처를 더하지 않는다.
