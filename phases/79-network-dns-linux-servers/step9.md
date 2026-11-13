# Step 9: linux-servers-sources

## 배경

phase 79는 네트워크 과목의 `dns`(강의 주제)와 `linux-servers`(강의 밖 주제)를 만든다. 전체 계획과 결정은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
step 10~14가 `linux-servers`의 개념 9개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 허용한 공식 문서로 확인하고 출처 문서에 남긴다.**
데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

이 주제는 강의가 다루지 않으므로 **사실의 출처는 공식 문서 하나뿐이다**(ADR-059) — man7.org(`resolv.conf`·`nsswitch.conf`·`su`·`iptables`), bind9.readthedocs.io(BIND 9), httpd.apache.org(Apache HTTP Server 2.4), netfilter.org.
기출 16문항이 묻는 것은 DNS 서버의 주소를 적는 `/etc/resolv.conf`, BIND의 `named.conf`(`options` 문 셋 — 둘은 지문이 그림, `directory`), BIND를 운영할 때 열어야 할 포트와 설정 검사 명령,
Apache의 `httpd.conf`(보안 설정을 하는 파일, `Listen` 둘, 잘 알려진 포트와 관리자 권한 둘, `KeepAliveTimeout` 둘, `LimitRequestBody` 둘, `Options Indexes`), iptables로 바깥에서 들어오는 Telnet 막기다.

## 읽어야 할 파일

- `phases/79-network-dns-linux-servers/guide.md` — 특히 「두 주제와 개념 23개」의 `linux-servers` 표, 「예시 값」, 「출처」
- `phases/79-network-dns-linux-servers/index.json`의 step 0·5 `summary`(DNS 쪽 사실 — 영역·주 서버·보조 서버·영역 전송·UDP와 TCP `53`. 다시 찾지 않는다)
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과, 이미 있는 항목: FHS(`/etc`의 `hosts`·`resolv.conf`), (phase 76) util-linux su(1), (phase 77) services(5), RFC 9112(HTTP/1.1 — 지속 연결), (phase 79 step 0) hosts(5)·nsswitch.conf(5)(있으면).
  **있는 사실을 다시 찾지 않는다** — 그 항목에 줄을 더한다
- `docs/source/network/exam-notes.md` — 형식(E27~E34)과 **E27**(잘 알려진 포트를 1~1023으로 쓰는 시험), step 0·5가 더한 문단·항목, 마지막 번호
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `src/data/network/topics.json`의 `ports.well-known-ports`(1024 아래 포트의 권한 문단), `linux-process-boot`의 데몬·`systemctl`, `linux-filesystem`의 심볼릭 링크, `app-protocols-mail-file.ssh`의 Telnet — 이미 가르친 사실(뜻을 맞춘다).
  step 1~8이 쓴 `dns` 주제(특히 `hosts-file`·`dns-zone`·`dns-transport`) — 이 주제가 기대는 DNS 쪽 말
- 기출: `docs/source/network/raw/exam/data.txt`에서 `X-linux`로 분류한 줄 가운데 이 주제의 16문항과 그 문항(시험 날짜·번호로 교사용 텍스트에서 찾는다) —
  [기출 2024-05-19 #28·#31·#40·#41·#44], [기출 2024-08-25 #36], [기출 2024-11-03 #38·#42], [기출 2025-02-23 #40], [기출 2025-05-25 #42·#45], [기출 2025-08-24 #43], [기출 2025-11-02 #34·#35], [기출 2026-02-01 #30·#31].
  시험이 무엇을 정답으로 보는지와 「옳지 않은 것」을 고르는 문항에서 맞는 말로 두는 보기만 본다. `named.conf` `options` 해석 둘([기출 2024-05-19 #40]·[기출 2026-02-01 #30] — 같은 문항)은 지문이 그림이라 보기와 정답만 본다. 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 man7.org, bind9.readthedocs.io(`https://bind9.readthedocs.io/en/stable/` 아래 — 참조 장과 명령 설명), httpd.apache.org(`https://httpd.apache.org/docs/2.4/` 아래), netfilter.org다. **판을 적는다** —
man7.org는 페이지 끝 COLOPHON의 프로젝트·판·날짜, BIND 9 문서는 읽은 판(안정판 번호), Apache는 2.4 문서이고 지시자의 기본값이 판마다 바뀌었으면 몇 판부터인지.
응답이 느리면 `curl -4`로 다시 받는다. 위키백과·블로그·배포판 위키·업체 학습 페이지·Q&A 사이트, sudo 문서(sudo.ws)는 쓰지 않는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `resolv-conf` | `/etc/resolv.conf`가 무엇을 정하는 파일인지, `nameserver`(IP 주소, 여러 줄일 때 적은 차례대로 묻는다는 것, 적을 수 있는 수의 한도), `search`(짧은 이름 뒤에 붙여 볼 도메인 목록 — 언제 붙이는지는 `ndots`가 정한다는 것은 한 줄만), `domain`과 `search`의 관계, 주석. 이 파일이 비었거나 `nameserver`가 없을 때 무엇을 쓰는지(근거대로). `/etc/nsswitch.conf`의 `hosts:` 줄과의 관계(step 0이 적었으면 그 줄을 쓴다). 이 파일을 다른 프로그램이 만들어 쓰기도 한다는 근거가 man7.org에 있는지(있으면 한 줄 — 없으면 못 찾았다고 적는다) | man7.org resolv.conf(5), nsswitch.conf(5), resolver(3)(필요할 때만) |
| b | `bind-named` | BIND 9가 무엇인지(ISC가 만드는 DNS 서버 — 권한 있는 서버와 재귀 리졸버 노릇), 풀어 쓴 이름이 문서에 있는지, 데몬 `named`와 그 기본 설정 파일 위치(`named` 명령 설명의 `-c` 기본값 등 — 판대로), `named.conf`의 구성(`options` 문, `zone` 문)과 `zone` 문의 꼴(영역 이름, `type primary`·`type secondary` — 옛 이름 `master`·`slave`를 아직 받는지, `file`, 보조 서버의 `primaries`), 설정 검사 명령 `named-checkconf`(무엇을 검사하는지)과 `named-checkzone`, DNS 서버가 UDP와 TCP 포트 `53`을 쓴다는 문서의 말(step 5의 RFC 근거와 겹치면 BIND 쪽 한 줄만) | bind9.readthedocs.io — 참조 장(Configuration File Grammar, `options`·`zone` 문), 명령 설명(`named`·`named-checkconf`·`named-checkzone`) |
| c | `named-conf-options` | `options` 문의 지시자 — `directory`(영역 파일 등 상대 경로의 기준이 되는 작업 디렉터리), `listen-on`(질의를 받을 IPv4 주소와 포트 — 정하지 않았을 때의 기본, `port 53 { any; }`의 뜻), `listen-on-v6`(한 줄), `allow-query`(질의에 답할 클라이언트 — 기본값), `recursion`(기본값과 뜻), `dnssec-validation`(값 `yes`·`no`·`auto`의 뜻과 기본값, 검증에 실패한 응답을 어떻게 다루는지), `masterfile-format`(`text`·`raw` — 기본값과 보조 서버가 받아 저장하는 영역 파일의 기본값이 다른지), `dump-file`(무엇을 쏟아 내는지와 기본 파일 이름). 각 지시자가 `options` 말고 `zone` 문에도 놓일 수 있는지는 기출이 묻지 않으므로 한 줄만. **[기출 2024-05-19 #40]의 보기 넷**(질의 대역을 모두 허용, 유효성 검사 때 오류가 나지 않는다, 53번 포트에 바깥 접근 허용, 보조 서버에서 영역 파일이 동기화될 때 글자 꼴로 바뀐다)이 어떤 `options` 줄을 해석한 것으로 보이는지 — 지문이 없으니 보기마다 「이런 줄이라면 맞다/틀리다」만 근거와 함께 적는다 | bind9.readthedocs.io 참조 장(`options` 문의 각 지시자 설명) |
| d | `httpd-conf` | Apache HTTP Server가 무엇인지(Apache Software Foundation, 실행 파일 `httpd`), 주 설정 파일의 이름과 위치(컴파일할 때 정해지고 `-f`로 바꿀 수 있다는 것, 기본 이름 `httpd.conf`), 지시자 한 줄의 꼴, `Include`로 다른 파일을 끌어오는 것과 기본 배포의 `conf/extra/` 아래 파일(`httpd-default.conf`·`httpd-vhosts.conf`·`httpd-mpm.conf` 등 — 문서가 말하는 만큼), `<Directory>` 구역, `ServerRoot`·`DocumentRoot`·`ServerAdmin`의 뜻(과 기본값 — 판대로), 설정을 바꾼 뒤 적용하는 방법(다시 시작·`graceful`)과 `apachectl configtest`. **[기출 2024-08-25 #36]의 보안 설정 넷**(디렉터리 목록·심볼릭 링크·SSI·CGI 실행 디렉터리)을 어느 지시자로 하는지(`Options`·`ScriptAlias` 등 — 한 줄씩) | httpd.apache.org `configuring.html`, `mod/core.html`(`Include`·`<Directory>`·`DocumentRoot`·`ServerRoot`·`ServerAdmin`), `invoking.html`, `stopping.html`, `programs/apachectl.html`, `misc/security_tips.html` |
| e | `apache-listen` | `Listen`의 꼴(`Listen 80`, `Listen 192.0.2.10:8080` — 여러 줄), 이미 다른 프로그램이 쓰는 주소·포트에 묶으려 하면 어떻게 되는지(근거대로), `Port` 지시자가 2.0에서 없어지고 `Listen`으로 바뀌었다는 것(업그레이드 문서). **1024 아래 포트**: Unix 계열에서 그 포트에 묶으려면 root 권한이 필요하다는 것, 그래서 httpd가 root로 시작해 포트를 연 뒤 요청을 처리하는 자식 프로세스는 `User`·`Group`의 사용자로 바꿔 실행한다는 것(그러려면 root로 시작해야 한다는 것). su(1)의 사용 꼴(`su [옵션] [-] [사용자 [인자…]]`, `-c` — 이미 있는 su(1) 항목에 줄을 더한다)로 **기출의 「일반 사용자가 실행 명령 앞에 `su`를 붙인다」** 를 판정한다. 기출의 1~1023은 E27을 따른다 | httpd.apache.org `bind.html`, `mod/mpm_common.html#listen`, `mod/mod_unixd.html`(`User`·`Group`), `upgrading.html`(2.0 문서의 바뀐 지시자 — 2.4 문서에서 찾지 못하면 2.0 문서 `docs/2.0/upgrading.html`), man7.org su(1) |
| f | `apache-keepalive` | `KeepAlive`(켜고 끄기 — 기본값), `KeepAliveTimeout`(다음 요청을 기다리는 초 — 기본값, 밀리초 단위 표기), `MaxKeepAliveRequests`(기본값과 0의 뜻), 지속 연결(HTTP/1.1의 persistent connection — RFC 9112 항목이 있으면 그 줄을 쓴다)과 KeepAlive의 관계, `KeepAliveTimeout`을 크게 잡을 때의 대가를 문서가 말하는지, `Timeout`(무엇을 기다리는 시간인지 — 기본값)과의 차이. 기출이 「세션 종료」라 부르는 것이 공식 문서의 무엇인지(연결을 닫는다) | httpd.apache.org `mod/core.html`(`KeepAlive`·`KeepAliveTimeout`·`MaxKeepAliveRequests`·`Timeout`), RFC 9112 §9.3(이미 있으면 다시 찾지 않는다) |
| g | `options-indexes` | `Options`의 뜻과 놓는 자리, 값(`Indexes`·`FollowSymLinks`·`ExecCGI`·`Includes`·`All`·`None`), 기본값(판마다 다르면 판), `+`·`-`를 섞어 쓰는 규칙. `Indexes`가 켜져 있고 기본 문서가 없을 때 목록을 만드는 모듈(`mod_autoindex`)과 기본 문서를 정하는 `DirectoryIndex`(기본값), `Indexes`가 꺼져 있을 때 그 요청에 어떻게 답하는지(근거대로 — 상태 코드를 지어내지 않는다), 디렉터리 목록이 드러나는 것을 보안 문서가 말하는지 | httpd.apache.org `mod/core.html#options`, `mod/mod_autoindex.html`, `mod/mod_dir.html`, `misc/security_tips.html` |
| h | `limit-request-body` | `LimitRequestBody`의 뜻(요청 본문의 바이트 수 한도), 값의 범위와 `0`의 뜻, **기본값과 그 기본값이 바뀐 판**(2.4.54 등 — 문서대로), 놓는 자리(서버 전체·가상 호스트·디렉터리·`.htaccess`), 한도를 넘는 요청에 어떻게 답하는지(응답 상태 코드는 문서에 있을 때만), 쓰는 까닭(문서가 말하는 만큼 — 서비스 거부 공격 등). 다른 한도 지시자(`LimitRequestFields` 등)는 이름과 한 줄만 | httpd.apache.org `mod/core.html#limitrequestbody` |
| i | `iptables` | iptables가 무엇인지(netfilter의 패킷 거르기 규칙을 넣고 빼고 보는 관리 도구), 테이블(`filter` 기본)과 기본 체인 `INPUT`·`OUTPUT`·`FORWARD`가 각각 어떤 패킷인지, 규칙을 차례로 견주어 처음 맞는 것의 대상을 따른다는 것과 체인의 기본 정책(`-P`), 명령 조각 — `-A`(체인 끝에 더하기), `-I`(앞에 끼우기 — 한 줄), `-p`(프로토콜), `--dport`(목적지 포트 — `tcp`·`udp` 확장의 옵션), `-j`(대상), `-L`(목록 보기). 대상 `ACCEPT`·`DROP`과 확장 대상 `REJECT`(되돌려 알린다)의 차이. 뒤를 잇는 nftables의 근거(netfilter.org — 한 줄). **[기출 2024-05-19 #44]의 규칙 넷**이 각각 무엇을 막는지 근거로 따진다 | man7.org iptables(8)·iptables-extensions(8)(COLOPHON의 판), netfilter.org(문서 페이지·nftables 소개) |

빠진 것을 읽다가 찾으면 더한다. **DNS 쪽 사실(영역·영역 전송·DNS가 UDP와 TCP `53`을 쓰는 까닭)은 step 0·5가 확인했다 — 다시 확인하지 않는다.** `rpm`·`yum`·`sudo`는 확인하지 않는다(guide.md 「배경」).

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 79 step 9) <문서 이름> — <제목>`, URL 한 줄, **상태나 읽은 판** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 번호`(공식 문서는 절 제목·지시자 이름), 「쓰인 곳」.
  같은 문서의 기존 항목(su(1)·FHS·RFC 9112, step 0이 만든 hosts(5)·nsswitch.conf(5) 등)이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 79 step 9)」를 붙인 줄로 더한다.
- Apache 문서는 페이지가 많다 — 항목을 페이지마다 만들지 말고 「Apache HTTP Server 2.4 문서」 항목 하나(또는 `mod/core.html`과 나머지 둘)에 지시자마다 줄로 모은다. BIND 9도 같다.
- 「쓰인 곳」에는 **쓰일 개념 id**(`linux-servers.apache-listen` 등)와 exam-notes 번호를 적는다.
- 머리의 「확인한 날」 문단들 끝에 「(phase 79 step 9)」가 붙은 줄과 항목이 무엇인지 한 문장을 더한다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 주제의 기출 16문항이 정답으로 보는 것(과 「옳지 않은 것」을 고르는 문항에서 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 step 5가 더한 마지막 번호 다음부터 `## E… — …`로 이어 더한다(E27~E34 형식 — 시험·공식 문서·처리·쓰인 곳).
공식 문서에 있으면 항목을 만들지 않는다. 「phase 79 step 5」 문단처럼, 이 step이 본 문항 수와 더한 항목을 소개하고 공식 문서와 맞는 문항들을 한 줄씩 짚는 문단을 둔다(확인한 날 포함).

미리 본 것 — 판정은 이 step이 출처를 읽고 한다:
- [기출 2024-05-19 #41]·[기출 2025-11-02 #35](같은 문항)의 「잘 알려진 포트는 1부터 1023까지」는 E27을 따른다 — 새 항목을 만들지 않고 E27의 「쓰인 곳」에 이 phase를 더할지만 본다. 같은 문항의 「일반 사용자가 실행 명령 앞에 `su`를 붙인다」(틀린 말로 둔다)를 su(1)로 판정하고, 맞는 말로 두는 「관리자 권한이 필요하다」·「바꿀 때 다른 서비스와 겹치지 않는 번호를 쓴다」가 e와 맞는지.
- [기출 2024-05-19 #31]·[기출 2025-11-02 #34]의 「사용자의 요청이 없으면 세션을 끝낸다」 — 공식 문서의 말(연결을 닫는다)과 어긋나는지. 어긋나도 답(`KeepAliveTimeout`)이 같으면 항목 대신 문단 한 줄로 적어도 된다.
- [기출 2024-05-19 #40]·[기출 2026-02-01 #30] — 지문이 그림이라 정답(「유효성 검사 시 오류가 발생하지 않는다」가 틀린 말)의 근거를 지문 없이 판정할 수 없을 수 있다. 판정할 수 없으면 항목을 만들지 않고 그렇게 적는다 — 개념 step은 지시자의 사실만 가르친다.
- [기출 2025-05-25 #42]의 맞는 보기 「방화벽은 `iptables`로 설정할 수 있다」·「`named-checkconf`로 `named.conf`의 오류를 확인한다」가 b·i와 맞는지. `rpm -qa | grep bind` 보기는 판정하지 않는다(다루지 않는다).
- [기출 2024-08-25 #36]이 보안 설정 넷을 하는 파일로 `httpd.conf`를 고르는 것이 d와 맞는지(설정은 다른 파일에도 둘 수 있다는 것이 어긋나는지).

### 4. summary — 뒤 step이 이것을 보고 쓴다

`linux-servers`의 개념 9개마다 한 줄씩: **무엇을 쓸 수 있는지(출처·판·절), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호)**.
위 표의 a~i마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
특히 다음을 개념 step이 그대로 쓸 수 있게 적는다.
- 설정 줄의 꼴: `resolv.conf`의 줄, `named.conf`의 `options` 블록과 `zone` 문, `httpd.conf`의 지시자 줄과 `<Directory>` 구역, iptables 규칙 — 출처가 보이는 꼴(값은 guide.md 「예시 값」).
- 지시자 표: 지시자 이름, 하는 일, 기본값(판), 놓는 자리 — `options` 문의 일곱과 Apache의 지시자들.
- 기출 판정 줄: su 보기, 「세션」, `options` 해석 보기 넷(판정할 수 있었는지), 보안 설정 넷.
끝에 「사용자 확인」 칸을 둔다 — 사용자가 정해야 할 것이 있으면 적고, 없으면 「없음」.

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다(내려받은 문서는 저장소 밖에 둔다).
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 판을 적었는지, 문장이 원문을 옮기지 않았는지 다시 본다. 공식 문서와 기출 문장 모두 옮기지 않는다 — 지시자 설명을 번역해 옮기는 것도 전사다.
4. `phases/79-network-dns-linux-servers/index.json`의 step 9를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 10~14가 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **허용한 출처 밖의 문서(위키백과·블로그·배포판 위키(Red Hat·Ubuntu·Arch 등)·업체 학습 페이지·Q&A 사이트, sudo.ws·rpm.org처럼 목록에 없는 곳)를 근거로 쓰지 마라.** 이유: ADR-059.
  목록에 없는 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **기존 항목의 줄을 고치거나 지우지 마라.** 이유: 앞 phase의 개념이 그 줄을 근거로 쓴다. 더할 것은 「(phase 79 step 9)」 줄로 더한다.
- **BIND의 `view`·ACL 문법 전체·`rndc`, Apache의 가상 호스트·모듈 전체·MPM, iptables의 `nat` 테이블·연결 추적을 정리하지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **`lecture-outline.md`·`interview-facts.md`·`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 강의·면접은 이 주제를 다루지 않고, 이 phase는 새 출처를 더하지 않는다.
