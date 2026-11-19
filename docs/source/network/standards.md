# 네트워크 과목 — 표준 문서와 공식 문서에서 가져온 사실

네트워크 과목의 세 원본 가운데 **표준·공식 문서**에서 가져온 사실과 URL을 문서마다 모은다(`docs/source/network/CLAUDE.md` 「원본 셋」).
공식 문서는 그 기술을 정한 표준 기구나 만든 곳의 문서이고, 강의 밖 주제의 사실은 여기에만 근거한다(ADR-059).
강의·면접이 표준과 다르면 표준을 따르고, 그 기록은 `lecture-outline.md`·`interview-facts.md`의 「수정 이력」에 둔다.

규칙:

- **허용하는 곳만 쓴다** — 목록은 `docs/source/network/CLAUDE.md` 「허용하는 출처」에 있다(ADR-059). 표준(RFC·IANA·IEEE 802·ITU-T 권고 전체·MDN)과,
  man7.org·learn.microsoft.com처럼 그 기술을 만든 곳의 공식 문서다. 목록에 없는 곳은 그 목록에 먼저 더하고 쓴다.
  위키백과·블로그·자격증 교재·업체 학습 페이지는 강의가 링크했어도 쓰지 않는다.
- **사실은 직접 쓴 말로 적는다**(ADR-009). 원문 문장을 옮기지 않는다.
- 항목마다 **절 번호**를 붙인다. MDN처럼 절 번호가 없는 문서는 절 제목을 적는다.
- 제품 버전마다 달라지는 공식 문서(Windows Server의 판, Linux의 배포판·init 체계)는 어느 판을 기준으로 읽었는지 항목에 적는다(ADR-059 「트레이드오프」).
- RFC는 `https://www.rfc-editor.org/rfc/rfcNNNN` 꼴로 적고, 폐기된 RFC가 아니라 지금 유효한 것을 쓴다(예: HTTP는 RFC 2616·7230~7235가 아니라 RFC 9110·9111·9112).
  폐기된 RFC를 쓸 때는 역사 기록으로만 쓰고 그렇다고 밝힌다.
- 「쓰인 곳」에 강의 수정 이력 번호(`L1`…)나 면접 수정 이력 번호, 개념 id를 적는다. 뒤 step이 개념을 만들면 개념 id를 더한다.
- 이 파일은 step 1(phase 69)에서 **강의 수정 이력이 쓰는 사실만** 담아 시작했고, step 2가 **면접 수정 이력(`I1`…)이 쓰는 사실**을 더했다.
  개념 본문용 사실은 각 주제 step이 필요할 때 더한다.
- 자격시험의 답이 표준·공식 문서와 다르거나 거기 없는 곳(시험이 옛 방식을 묻는 곳 포함)은 여기가 아니라 `exam-notes.md`에 둔다(ADR-057·ADR-059).

확인한 날: 2026-10-27. 「(2026-10-28)」이 붙은 줄과 항목은 phase 70에서 1장의 빠진 사실 넷(ADR-057)을 넣으며 더했다.
「(phase 71)」이 붙은 줄과 항목은 phase 71 step 5에서 1장이 풀이 없이 쓰던 낱말(광케이블·작업 관리자·ping 명령·IP 주소 등)을 풀며 더했다(확인한 날 2026-10-28).
「(phase 72)」가 붙은 줄과 항목은 phase 72 step 0에서 `ethernet` 주제(이더넷 규격 이름·속도별 이더넷·NIC·MAC 주소·프레임·FCS)가 쓸 사실을 확인하며 더했다(확인한 날 2026-10-28).
IEEE 802.3 본문은 무료로 열리지 않으므로, 802.3 작업 그룹이 `ieee802.org`에 올린 개정 초안·발표 자료·지침과 `standards.ieee.org`의 표준 소개 페이지를 근거로 썼다. 항목마다 어떤 문서인지 적는다.
「(phase 72 step 1)」이 붙은 줄과 항목은 phase 72 step 1에서 `hub-switch-vlan` 주제(허브·반이중과 전이중·충돌 도메인·CSMA/CD·스위치·MAC 주소 테이블·플러딩·STP·브로드캐스트 도메인·VLAN·VLAN 태그·트렁크·VTP)가
쓸 사실을 확인하며 더했다(확인한 날 2026-10-28). IEEE 802.1(브리지·VLAN) 본문도 무료로 열리지 않아, 802.1 작업 그룹 자료와 802.1을 풀이한 RFC·NIST 문서를 근거로 썼다.
Cisco 제품 문서는 VTP에만 쓴다(`docs/source/network/CLAUDE.md` 「허용하는 출처」).
「(phase 72 step 2)」가 붙은 항목은 phase 72 step 2에서 `ethernet.ethernet`이 이더넷 표준을 누가 만드는지 쓰려고 더했다(확인한 날 2026-10-28).
「(phase 72 step 3)」이 붙은 줄은 phase 72 step 3에서 문항 n030의 해설이 MAC의 풀네임을 쓰려고 더했다(확인한 날 2026-10-28).
「(phase 72 step 5)」가 붙은 줄은 phase 72 step 5에서 `ethernet.ethertype-length`·`ethernet.fcs`를 쓰며 원문을 다시 열어 확인하고 더했다(확인한 날 2026-10-28).
「(phase 72 step 7)」이 붙은 줄과 항목은 phase 72 step 7에서 `hub-switch-vlan.collision-domain`·`hub-switch-vlan.csma-cd`를 쓰며 원문을 다시 열어 확인하고 더했다(확인한 날 2026-10-28).
「(phase 72 step 8)」이 붙은 줄과 항목은 phase 72 step 8에서 `hub-switch-vlan.switch`·`hub-switch-vlan.mac-address-table`을 쓰며 원문을 다시 열어 확인하고 더했다(확인한 날 2026-10-28).
「(phase 72 step 9)」가 붙은 줄은 phase 72 step 9에서 `hub-switch-vlan.flooding-forwarding-filtering`·`hub-switch-vlan.stp`를 쓰며 원문을 다시 열어 확인하고 더했다(확인한 날 2026-10-28).
「(phase 72 step 11)」이 붙은 줄과 항목은 phase 72 step 11에서 `hub-switch-vlan.vlan-membership`·`hub-switch-vlan.vlan-tagging`을 쓰며 원문을 다시 열어 확인하고 더했다(확인한 날 2026-10-28).
「(phase 73)」이 붙은 줄과 항목은 phase 73에서 `ip-protocol`(IP·단편화·MTU·IPv4 헤더·TTL·IPv4 주소·IPv6·주소 표기·IPv6 헤더·확장 헤더·SLAAC)·`arp`·`icmp`(IGMP 포함) 주제가 쓸 사실을 확인하며 더했다.
step 0(IP와 단편화)의 확인한 날은 2026-10-29다. RFC는 rfc-editor.org의 텍스트판(`https://www.rfc-editor.org/rfc/rfcNNNN.txt`)을 내려받아 절을 직접 읽었고, 지금 유효한지(폐기·개정 관계)는 rfc-editor의 문서 정보(`…/rfcNNNN.json`)로 확인했다.
「(phase 73 step 1)」이 붙은 줄과 항목은 phase 73 step 1에서 `arp`(ARP·ARP 캐시·다른 네트워크로 보낼 때·RARP·이웃 탐색)·`icmp`(IP의 한계·ICMP·타입과 코드·목적지 도달 불가·시간 초과·에코·ping·IGMP) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-10-29).
RFC는 step 0과 같은 방법으로 읽었고, IANA 레지스트리는 XML판(`…/<레지스트리>.xml`)을, man7.org·learn.microsoft.com은 그 페이지를 내려받아 읽었다. 명령 문서는 운영체제·패키지마다 다르므로 어느 판인지 항목에 적는다.
「(phase 73 step 2)」 이후의 줄은 phase 73의 개념을 쓰는 step(2~14)이 쓰다가 더 확인한 사실이다(같은 방법으로 읽었다, 2026-10-29).
「(phase 74)」가 붙은 줄과 항목은 phase 74에서 `ip-addressing`(IP 주소와 서브넷 마스크)·`ip-address-types`(공인·사설 IP, NAT, DHCP)·`routing`(라우팅) 주제가 쓸 사실을 확인하며 더했다.
step 0(`ip-addressing` — 네트워크 부분과 호스트 부분, 네트워크 주소와 브로드캐스트 주소, 주소 클래스, CIDR, 서브넷 마스크, AND 계산, 서브네팅, 서브넷 수와 호스트 수)의 확인한 날은 2026-10-29다.
RFC는 phase 73과 같은 방법(텍스트판을 내려받아 절을 직접 읽고, 상태는 `…/rfcNNNN.json`)으로, IANA 레지스트리는 XML판으로 읽었다.
「(phase 74 step 5)」가 붙은 줄과 항목은 step 5(`ip-address-types` — 공인 주소, 사설 주소, 예약된 주소, 루프백, NAT·NAPT, 정적·동적 주소, DHCP와 그 메시지)가 쓸 사실을 확인하며 더했다(확인한 날 2026-10-29).
RFC·IANA는 step 0과 같은 방법으로 읽었고, learn.microsoft.com은 페이지를 내려받아 읽었다 — 항목마다 페이지의 고친 날(`updated_at`)과 적용 판을 적는다.
「(phase 74 step 11)」이 붙은 줄과 항목은 step 11(`routing` — 라우팅, 라우팅 테이블, 롱기스트 프리픽스 매치, 디폴트 라우트, 정적·동적 라우팅, AS, RIP, OSPF, BGP)이 쓸 사실을 확인하며 더했다(확인한 날 2026-10-29).
RFC·IANA는 step 0과 같은 방법으로, man7.org·learn.microsoft.com은 페이지를 내려받아 읽었다. 라우팅 테이블을 보는 명령은 **이름과 무엇을 보여 주는지만** 적었다 — 옵션과 출력 읽기는 `diagnostic-commands` 주제의 몫이다.
「(phase 75)」가 붙은 항목은 phase 75 step 0에서 `linux-filesystem`(디렉터리 계층 구조, 표준 디렉터리, /etc, /proc, 파티션, MBR과 GPT, 디스크 장치 이름, 파일 시스템과 마운트, /etc/fstab, 스왑, 파일 속성) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-10-30).
이 주제는 강의 밖 주제라 사실의 근거는 공식 문서뿐이다(ADR-059). man7.org는 페이지를 내려받아 읽었고, 항목마다 페이지 끝 COLOPHON과 바닥줄이 밝힌 프로젝트·판·날짜를 적는다. FHS 3.0(refspecs.linuxfoundation.org)과
POSIX 2024년판(pubs.opengroup.org의 `onlinepubs/9799919799/`)은 HTML판을 내려받아 절을 읽었다. `gdisk`의 사실만 GPT fdisk 문서(rodsbooks.com)에서 가져왔고(`docs/source/network/CLAUDE.md` 「허용하는 출처」),
「섹터」와 「휘발성 메모리」의 뜻은 NIST 용어집(csrc.nist.gov)에서 가져왔다. 명령은 **무엇을 하는지와 기출이 묻는 꼴만** 적었다 — 옵션 목록을 옮기지 않는다.
「(phase 75 step 7)」이 붙은 줄과 항목은 phase 75 step 7에서 `linux-permissions`(소유자·그룹·그 밖의 사용자, 읽기·쓰기·실행 권한, 권한 문자열, 파일 종류 문자, 8진수 권한 표기, chmod 명령, chmod의 기호 모드, chown 명령) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-10-30).
POSIX 2024년판은 유틸리티(`utilities/`)·함수(`functions/`) 페이지를, man7.org는 페이지를 내려받아 읽었다. GNU Coreutils 매뉴얼은 gnu.org의 한 쪽짜리 HTML판(`coreutils.html`, 9.12)을 내려받아 절 번호로 적는다.
특수 비트(setuid·setgid·sticky)·ACL·umask의 계산은 기출이 묻지 않아 사실로 가져오지 않았고, 그것이 있다는 것과 「다루지 않는다」를 말하는 데 필요한 만큼만 적는다.
「(phase 75 step 9)」가 붙은 줄은 step 9(`linux-permissions.permission-string`·`file-type-char`)가 본문에 쓰려고 같은 문서를 다시 읽어 더한 사실이다(확인한 날 2026-10-30) — `ls -l`의 크기·날짜 칸과 심볼릭 링크의 이름 칸, `ln`의 꼴, 이름을 지울 때의 동작.
「(phase 75 step 11)」이 붙은 줄은 step 11(`linux-permissions.symbolic-mode`·`chown`)이 본문·도식에 쓰려고 chown(2)을 다시 읽어 더한 사실이다(확인한 날 2026-11-04) — 권한 없이 소유자를 바꾸려는 요청이 거부된다는 것.
「(phase 75 step 12)」가 붙은 줄과 항목은 phase 75 step 12에서 `linux-shell`(셸, 작업 디렉터리, 절대 경로와 상대 경로, 파일을 다루는 기본 명령, 리다이렉션, 파이프, find 명령, vi 편집기, vi의 편집 명령, vi의 콜론 명령) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-11-04).
POSIX 2024년판은 셸 언어 장(`utilities/V3_chap02.html`)·유틸리티·Base Definitions 페이지를, GNU Bash 매뉴얼은 gnu.org의 한 쪽짜리 HTML판(`bash.html`, 5.3)을, man7.org는 페이지를 내려받아 읽었다.
**vi는 POSIX `vi`·`ex` 명세로만 쓴다** — 허용한 출처에 vim 문서는 없고, 지금 배포판의 `vi`가 실제로 어떤 프로그램인지는 확인하지 않았다. 셸 스크립트·변수·제어문, vi의 이동 명령, 정규 표현식 문법은 기출이 묻지 않아 가져오지 않았다.
「(phase 75 step 14)」가 붙은 줄은 phase 75 step 14에서 `linux-shell.paths`·`linux-shell.file-commands`와 문항 n136·n137을 쓰며 더 확인한 사실이다(확인한 날 2026-11-04).
「(phase 75 step 15)」가 붙은 줄은 phase 75 step 15에서 `linux-shell.redirection`·`linux-shell.pipe`와 문항 n138~n140을 쓰며 더 확인한 사실이다(확인한 날 2026-11-04) — `sort`가 표준 입력을 읽어 줄을 늘어놓고 표준 출력에 쓴다는 것.
「(phase 75 step 16)」이 붙은 줄은 phase 75 step 16에서 `linux-shell.find`·`linux-shell.vi`와 문항 n141·n142를 쓰며 더 확인한 사실이다(확인한 날 2026-11-04) — `find`가 시작 디렉터리 자신도 검사한다는 것, 패턴의 `*`, 패턴을 따옴표로 감싸는 까닭, vi의 마지막 줄 명령이 끝난 뒤 명령 모드로 돌아온다는 것.
「(phase 76)」이 붙은 줄과 항목은 phase 76 step 0에서 `linux-process-boot`(프로세스와 PID·PPID, ps, top, kill·nice·renice·pstree, free, 데몬, systemctl, cron과 crontab, 부팅 과정, GRUB, 커널 메시지와 dmesg, 실행 레벨, 시스템을 끄고 다시 시작하는 명령) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-11-04).
이 주제도 강의 밖 주제라 사실의 근거는 공식 문서뿐이다(ADR-059). man7.org는 페이지를 내려받아 읽었고, 항목마다 COLOPHON과 바닥줄이 밝힌 프로젝트·판·날짜를 적는다.
**man7.org의 POSIX 사본(`ps(1p)`·`kill(1p)`·`nice(1p)`·`renice(1p)`·`crontab(1p)`)은 2017년판(IEEE Std 1003.1-2017)이라 쓰지 않고**, pubs.opengroup.org의 2024년판(`onlinepubs/9799919799/`)을 내려받아 읽었다.
GNU GRUB 매뉴얼은 `www.gnu.org`가 이날 응답하지 않아(두 번 시도, 접속 시간 초과) `ftp.gnu.org`의 GRUB 2.14 공식 배포본(`grub-2.14.tar.xz`)에 든 같은 매뉴얼(`docs/grub.info`)을 저장소 밖에 풀어 읽었다.
같은 명령의 페이지가 여럿이면(kill(1)의 util-linux판과 procps-ng판, last(1)의 GNU acct판과 util-linux판, cronie의 crontab(1)과 POSIX `crontab`) 항목에 어느 것인지 적는다.
「(phase 76 step 9)」가 붙은 줄과 항목은 phase 76 step 9에서 `linux-accounts`(사용자 계정과 UID, /etc/passwd, /etc/shadow, useradd, chage, 로그인 기록) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-11-05).
man7.org는 이날 IPv6로는 접속되지 않아 IPv4로 내려받아 읽었다. 이 주제에서도 같은 이름의 페이지가 둘인 것(passwd(5)의 Linux man-pages판과 shadow-utils판)은 항목에 어느 것인지 적는다.
「(phase 77)」이 붙은 줄과 항목은 phase 77 step 0에서 `ports`(포트 번호, 포트 번호의 범위, 잘 알려진 포트, 서버 포트와 클라이언트 포트) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-11-09).
이 phase의 `tcp-udp`(TCP·UDP 헤더와 고르는 기준)·`tcp-connection`(연결과 상태) 사실은 같은 「(phase 77)」 표시로 뒤 step(3·9)이 더한다.
RFC는 rfc-editor.org의 텍스트판을 IPv4로 내려받아 절을 직접 읽고 상태는 `…/rfcNNNN.json`으로 확인했다. IANA 포트 레지스트리는 XML판을, man7.org·learn.microsoft.com은 페이지를 내려받아 읽었다.
**서비스마다의 포트 번호는 그 프로토콜의 RFC와 IANA 레지스트리가 함께 맞는 것만** 적었다. 응용 프로토콜 주제(phase 78)의 포트(POP3·IMAP·SNMP·NTP·TFTP 등)는 이 step에서 적지 않았다.
「(phase 77 step 3)」이 붙은 줄과 항목은 phase 77 step 3에서 `tcp-udp`(TCP, MSS, TCP 헤더, 순서 번호, 확인 응답 번호, 제어 비트, UDP, UDP 헤더, TCP와 UDP를 고르는 기준) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-11-09).
RFC는 step 0과 같은 방법(텍스트판을 IPv4로 내려받아 절을 직접 읽고, 상태는 `…/rfcNNNN.json`)으로, IANA의 TCP 매개변수 레지스트리는 XML판(Last Updated 2026-10-22)으로 읽었다.
**제어 비트의 수는 문서와 때에 따라 다르다** — 아래 「(phase 77 step 3) RFC 3540 …, RFC 8311 …, RFC 9768 …, IANA — TCP Header Flags」 항목. 재전송 방식·흐름 제어·혼잡 제어의 방식과 연결 수립·종료는 이 step에서 적지 않았다(phase 84와 step 9의 몫).
응용별 전송 프로토콜은 **그 응용의 RFC가 TCP나 UDP 위에서 돈다고 적은 것만** 적었다.
「(phase 77 step 9)」가 붙은 줄과 항목은 phase 77 step 9에서 `tcp-connection`(3-way handshake, TCP 연결 종료, TCP 상태, 연결을 맺는 동안의 상태, 연결을 끊는 동안의 상태, TIME-WAIT 상태) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-11-10).
RFC는 step 0과 같은 방법(텍스트판을 IPv4로 내려받아 절을 직접 읽고, 상태는 `…/rfcNNNN.json`)으로, man7.org·learn.microsoft.com은 페이지를 내려받아 읽었다. **상태 전이는 RFC 9293의 상태 그림(그림 5)과 세그먼트 처리 절(§3.10)을 하나씩 맞춰 본 것만** 적었다.
재전송 시간·연결 유지(keep-alive)·SYN 플러딩 같은 공격과 동시 열기의 차례는 이 step에서 적지 않았다(phase 84와 보안 주제의 몫이거나 기출이 묻지 않는다).
「(phase 78 step 0)」이 붙은 줄과 항목은 phase 78 step 0에서 `app-protocols-mail-file`(전자우편의 전달 과정, SMTP, POP3, IMAP, FTP, FTP의 능동 모드와 수동 모드, TFTP, SSH) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-11-11).
이 주제는 강의 밖 주제라 사실의 근거는 공식 문서뿐이다(ADR-059). RFC는 rfc-editor.org의 텍스트판을 IPv4로 내려받아 절을 직접 읽고 상태는 `…/rfcNNNN.json`으로 확인했다. IANA 포트 레지스트리는 CSV판(레지스트리 머리의 Last Updated 2026-11-06)을,
man7.org·learn.microsoft.com은 페이지를 내려받아 읽었다 — 항목마다 COLOPHON이나 페이지의 `updated_at`과 적용 판을 적는다. learn.microsoft.com은 Windows의 OpenSSH 문서 둘과, Windows Server의 FTP 서버(IIS) 문서 둘(능동·수동 데이터 연결의 이름과 수동 모드용 포트 범위)을 읽었다.
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — SMTP 확장과 응답 코드 전체, POP3의 APOP·TOP·UIDL, IMAP 명령 전체, FTP의 블록·압축 전송 방식과 표현 형식(TYPE), SFTP·FTPS와 FTP 보안 확장의 명령, TFTP 옵션 확장, SSH의 키 교환·암호 알고리즘. 있다는 것과 「다루지 않는다」를 말하는 데 필요한 만큼만 적는다.
「(phase 78 step 5)」가 붙은 줄과 항목은 phase 78 step 5에서 `app-protocols-mgmt-security`(SNMP, MIB, SNMP의 폴링과 트랩, SNMP의 버전과 보안, NTP, SNTP, TLS, HTTPS, SIP) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-11-11).
이 주제도 강의 밖 주제라 사실의 근거는 공식 문서뿐이다(ADR-059). RFC는 rfc-editor.org의 텍스트판을 IPv4로 내려받아 절을 직접 읽고 상태는 `…/rfcNNNN.json`과 문서 머리의 STD 번호로 확인했다. IANA 포트 레지스트리는 CSV판(XML판 머리의 Last Updated 2026-11-10)을 읽었다.
**SNMP는 지금 표준인 SNMPv3(STD 62 — RFC 3411~3418)의 문서를 근거로 쓰고**, SNMPv1(RFC 1157)과 SNMPv2c(RFC 1901)는 둘 다 Historic이라 역사 기록으로만 쓴다. SNTP를 따로 적은 RFC 4330은 RFC 5905가 폐기했으므로 역사 기록으로만 쓴다.
RFC 3410·6632·3512는 Informational이라 표준 문서의 사실을 확인하고 풀어 보는 보조로만 쓴다.
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — SNMP 메시지의 부호화 형식과 GetBulkRequest·Report, USM의 키·알고리즘과 VACM의 세부, NTP의 시각 계산식과 필터·선택 알고리즘의 세부·대칭·브로드캐스트 모드,
TLS의 키 교환·암호 방식·확장, 인증서의 필드와 폐기, SIP의 프록시·등록·헤더 필드와 응답 코드 전체, SDP의 문법. 있다는 것과 「다루지 않는다」를 말하는 데 필요한 만큼만 적는다.
「(phase 78 step 11)」이 붙은 줄과 항목은 phase 78 step 11에서 `diagnostic-commands`(ipconfig 명령, ipconfig의 옵션, ping 명령의 옵션, tracert 명령, pathping 명령, netstat 명령, Windows netstat의 옵션, Linux netstat의 옵션) 주제가 쓸 사실을 확인하며 더했다(확인한 날 2026-11-11).
이 주제도 강의 밖 주제라 사실의 근거는 공식 문서뿐이다(ADR-059). learn.microsoft.com은 Windows 명령 참조 페이지(`windows-server/administration/windows-commands/<명령>`)와, 그 페이지가 출력의 꼴을 보이지 않는 곳을 메우려고 Windows Server 문제 해결 문서 몇 쪽을 IPv4로 내려받아 읽었다 —
항목마다 페이지 머리의 `updated_at`·`ms.date`, 바닥의 「Last updated on」과 「Applies to」를 적는다(세 날짜가 서로 다를 수 있다). man7.org는 페이지를 IPv4로 내려받아 COLOPHON과 바닥줄의 프로젝트·판·날짜를 적는다.
**명령의 출력 꼴은 문서가 보이는 것만** 적었다 — 출력 예가 없는 명령은 「출력 예 없음」이라고 적는다. 이 PC에서 명령을 실행한 결과는 출처로 쓰지 않았다.
**기출이 묻지 않는 옵션은 사실로 가져오지 않았다** — ping의 TTL·TOS·경로 기록·출발지 경로 옵션, tracert·pathping의 출발지 경로 옵션, ipconfig의 `/registerdns`·IPv6 옵션, netstat의 `-q`·주기 갱신, nslookup의 대화형 모드와 하위 명령. 있다는 것과 「다루지 않는다」를 말하는 데 필요한 만큼만 적는다.
「(phase 79 step 0)」이 붙은 줄과 항목은 phase 79 step 0에서 `dns` 주제의 앞 개념 여덟(DNS, hosts 파일, 도메인 이름의 계층 구조, 네임 서버의 종류, 영역과 주 서버·보조 서버, 이름 풀이 과정, 재귀적 질의와 반복적 질의, DNS 캐시와 TTL)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-12).
`dns`는 강의 주제라 강의·면접·표준을 함께 쓴다. RFC는 rfc-editor.org의 텍스트판을 IPv4로 내려받아 절을 직접 읽고 상태는 `…/rfcNNNN.json`과 문서 머리의 STD·BCP 번호로 확인했다. 용어는 DNS 용어를 모은 RFC 9499(BCP 219)를 먼저 보고, 그 정의가 가리키는 원래 절(RFC 1034·1035·1123·2181 등)을 함께 읽었다.
iana.org의 루트 서버 페이지, man7.org의 hosts(5)·nsswitch.conf(5)(COLOPHON의 판을 적는다), learn.microsoft.com의 Windows Server DNS 문서 셋(`updated_at`·「Applies to」를 적는다 — 한국어판은 기계 번역이라 용어만 참고)도 내려받아 읽었다.
**루트 서버의 운영 요건(재귀를 끄는지 등)은 지금 ICANN RSSAC 문서에 있어 허용한 출처 밖이다** — 폐기된 RFC 2870만 역사 기록으로 적는다. 레코드 유형·SOA 필드·PTR·라운드 로빈·DNS의 전송·DNSSEC은 이 step에서 적지 않았다(step 5의 몫) — 영역 전송을 설명하는 데 필요한 SOA의 SERIAL·REFRESH·RETRY·EXPIRE 한 줄만 RFC 1034 §4.3.5 줄에 있다.
「(phase 79 step 5)」가 붙은 줄과 항목은 phase 79 step 5에서 `dns` 주제의 뒤 개념 여섯(DNS 레코드, SOA 레코드, 역방향 조회와 PTR 레코드, DNS 라운드 로빈, DNS가 쓰는 UDP와 TCP, DNSSEC)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-12).
RFC는 step 0과 같은 방법(텍스트판을 IPv4로 내려받아 절을 직접 읽고, 상태는 `…/rfcNNNN.json`과 문서 머리의 STD·BCP 번호)으로 읽었다. learn.microsoft.com은 Windows Server DNS 문서와 Win32 DNS 참조·문제 해결 문서를 영문판과 한국어판(`ko-kr`)으로 내려받아 `updated_at`·「Applies to」를 적었다.
**DNS 관리자 화면의 한국어 메뉴·필드 이름은 한국어판 문서(기계 번역)의 표기로만 확인했고 실제 화면으로는 확인하지 못했다** — 항목에 그렇게 적는다. 정보성(Informational) RFC(1794·1912·3833)는 표준이 아니라 역사 기록·운영 관례·위협 분석으로만 쓴다고 항목마다 밝힌다.
「(phase 79 step 9)」가 붙은 줄과 항목은 phase 79 step 9에서 `linux-servers` 주제(DNS 클라이언트 설정 파일, BIND와 named, named.conf의 options 문, Apache HTTP Server와 httpd.conf, Listen 지시자와 포트 권한, KeepAlive와 KeepAliveTimeout, Options 지시자와 디렉터리 목록, LimitRequestBody 지시자, iptables)가 쓸 사실을 확인하며 더했다(확인한 날 2026-11-12).
이 주제는 강의 밖 주제라 사실의 근거는 공식 문서뿐이다(ADR-059). man7.org는 페이지를 IPv4로 내려받아 COLOPHON과 바닥줄의 프로젝트·판·날짜를 적었다. BIND 9 관리자 참조 설명서(ARM)와 명령 설명은 bind9.readthedocs.io의 안정판(`en/stable/` — 이날 9.20.30)을, Apache HTTP Server 문서는 httpd.apache.org의 2.4 문서(이날 최신 판 2.4.71)를 IPv4로 내려받아 읽었다 —
Apache는 페이지마다 응답 머리의 Last-Modified를 적고, 기본값이 판마다 바뀐 지시자는 문서의 Compatibility 줄대로 몇 판부터인지 적는다. netfilter.org는 프로젝트 소개 페이지 셋을 읽었다.
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — BIND의 `view`·ACL 문법 전체·`rndc` 명령 전체·DNS over TLS/HTTPS, Apache의 가상 호스트·모듈 전체·MPM·`.htaccess`의 세부, iptables의 `nat`·`mangle` 테이블과 연결 추적, nftables 문법, `rpm`·`yum`·`sudo`. 있다는 것과 「다루지 않는다」를 말하는 데 필요한 만큼만 적는다.
「(phase 80 step 0)」이 붙은 항목은 phase 80 step 0에서 `windows-ad` 주제의 앞 개념 여섯(로컬 사용자 계정, 기본 로컬 그룹, Active Directory 도메인 서비스, 도메인 컨트롤러, 도메인·트리·포리스트, 트러스트)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-16).
이 주제는 강의 밖 주제라 사실의 근거는 공식 문서뿐이다(ADR-059). learn.microsoft.com의 Windows Server·Windows 보안·PowerShell·Win32 문서를 영문판과 한국어판(`ko-kr`)으로 IPv4로 내려받아 읽었다 — 항목마다 페이지 머리의 `updated_at`·`ms.date`와 「Applies to」를 적는다.
지금 판 문서에 없는 말(트러스트의 종류와 방향을 정의한 문장, 기본 그룹의 옛 설명)은 지난 판 문서(`previous-versions` — Windows Server 2008·2012까지)에서 가져오고, 지금 판 문서가 같은 말을 하는지 줄마다 적는다.
한국어판은 기계 번역이라 같은 것을 여러 이름으로 부르는 곳이 있다(trusted를 「신뢰받는」과 「신뢰할 수 있는」으로, 기본 그룹 이름을 영문 그대로와 번역으로) — 고른 이름과 그 까닭은 항목의 「한국어 이름」 줄에 적는다. **실제 한국어 Windows 화면의 이름은 확인하지 못했다.**
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — Kerberos·NTLM의 인증 차례, 작업 마스터(FSMO) 역할의 일, 글로벌 카탈로그·스키마의 동작, 복제 토폴로지, 트러스트 암호와 신뢰할 수 있는 도메인 개체(TDO), 선택적 인증, RODC의 암호 복제 정책. 있다는 것과 「다루지 않는다」를 말하는 데 필요한 만큼만 적는다.
「(phase 80 step 4)」가 붙은 줄과 항목은 phase 80 step 4에서 `windows-ad` 주제의 뒤 개념 여섯(조직 구성 단위, 도메인 사용자 계정, ds 명령, 그룹 종류와 범위, 그룹 정책, 암호 정책과 계정 잠금 정책)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-16).
읽은 방법은 step 0과 같다(영문판과 한국어판을 IPv4로 내려받아 `updated_at`·`ms.date`·「Applies to」를 적었다). **ds 명령(`dsadd`·`dsmod`·`dsrm`·`dsquery`·`dsget`·`dsmove`)의 명령 참조는 지금 판 Windows 명령 참조에 없어**(`windows-server/administration/windows-commands/dsadd` 같은 주소가 404이고 Windows 명령 목록에도 없다)
지난 판 명령 참조(Windows Server 2012 R2·2012 묶음, 적용 대상 Windows Server 2003~2012)를 읽고, 지금 판 문제 해결 문서(적용 대상 — 지원되는 모든 Windows Server)가 같은 명령을 쓰는지 맞춰 봤다.
계정 정책 설정 문서(`windows/security/threat-protection/security-policy-settings/`)는 「Applies to」를 Windows 11·10으로 적지만 기본값 표에 기본 도메인 정책·DC·구성원 서버·독립 실행 서버의 값을 함께 싣는다 — 그 표의 값을 그대로 적고, 이 문서들의 한국어판은 번역되지 않아 영문 그대로라는 것도 적는다.
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — 그룹 정책의 상속 차단·강제·보안 필터링·WMI 필터, 세분화된 암호 정책, 글로벌 카탈로그의 동작, 사이트 링크와 복제 일정, PowerShell AD 모듈의 cmdlet 목록, `dsadd user`의 옵션 전체. 있다는 것과 「다루지 않는다」를 말하는 데 필요한 만큼만 적는다.
「(phase 80 step 8)」이 붙은 줄과 항목은 phase 80 step 8에서 `windows-admin-tools` 주제의 개념 열(MMC와 실행 창 명령, 이벤트 뷰어, Windows 로그, 성능 모니터, 리소스 모니터, PowerShell, 인증서와 인증서 관리자, EFS, BitLocker 드라이브 암호화, 클라우드 폴더)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-16).
이 주제도 강의 밖 주제라 사실의 근거는 learn.microsoft.com 하나다(ADR-059). 읽은 방법은 step 0·4와 같다(영문판과 한국어판을 IPv4로 내려받아 `updated_at`·`ms.date`와 「Applies to」를 적었다). 근거는 Windows Server 문서·Windows 명령 참조·Windows 보안 문서·PowerShell 문서·Win32 문서·문제 해결 문서이고,
지금 판 문서에 없는 것(이벤트 뷰어의 로그 갈래와 이벤트 속성 표, 데이터 수집기 집합의 일정)만 지난 판 문서(Windows Server 2008 R2·2012)에서 가져왔다. 실행 창(Windows 키 + R)과 `devmgmt.msc`, 명령 줄에 `certmgr`만 적었을 때의 동작, 인증서 관리자의 한국어 이름은 같은 learn.microsoft.com의 Windows 드라이버 문서와 .NET Framework 문서에서만 찾았다 — 항목에 어느 문서인지 적는다.
**Microsoft Learn의 교육 과정(training) 페이지는 쓰지 않았다**(업체 학습 페이지라 허용하지 않는다). 그래서 리소스 모니터의 탭 목록처럼 그 페이지에만 있는 사실은 적지 않았다 — 아래 「성능 모니터·리소스 모니터」 항목에 찾아본 곳을 적는다.
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — PowerShell의 문법(변수·파이프라인·제어문)과 원격 실행, 이벤트 구독·사용자 지정 보기의 설정, 성능 카운터 목록과 데이터 수집기 집합의 경고·템플릿, 인증서 요청·자동 등록, EFS의 키 구조(FEK·DDF·DRF)와 복구 정책 설정, BitLocker 보호기 전체와 설정 절차, 클라우드 폴더의 배포 절차. 있다는 것과 「다루지 않는다」를 말하는 데 필요한 만큼만 적는다.
「(phase 81 step 0)」이 붙은 줄과 항목은 phase 81 step 0에서 `windows-server-roles` 주제의 앞 개념 여섯(서버 역할과 기능, 서버의 고정 IP 주소, 파일 서버와 프린트 서버, DHCP 서버 역할, DHCP 예약, DHCP 장애 조치)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-18).
이 주제는 강의 밖 주제라 사실의 근거는 learn.microsoft.com 하나다(ADR-059). 읽은 방법은 phase 80과 같다(영문판과 한국어판을 IPv4로 내려받아 페이지 머리의 `updated_at`·`ms.date`와 「Applies to」를 적었다). 근거는 Windows Server 문서·PowerShell 모듈 문서(`?view=windowsserver2025-ps` 판)·Win32 문서·문제 해결 문서이고,
지금 판 문서에 정의 문장이 없는 것(역할·역할 서비스·기능의 정의, MCLT의 정의, 파일 및 저장소 서비스의 기본 설치, 인쇄 및 문서 서비스의 역할 설명)만 지금 판 문서가 링크하는 지난 판 문서(Windows Server 2008 R2·2012·2012 R2)에서 가져왔다 — 줄마다 그 판과, 지금 판 문서에서 같은 말을 찾아본 결과를 적는다.
**마법사·대화 상자의 한국어 이름은 한국어판 문서(기계 번역)의 표기로만 확인했고 실제 한국어 Windows 화면으로는 확인하지 못했다.** Microsoft Q&A에만 있는 사실(DHCP 콘솔의 실행 이름 `dhcpmgmt.msc`, 동적 주소로 DNS 서버 역할을 설치할 때 마법사가 보이는 경고의 꼴)은 쓰지 않는다 — 항목에 찾아본 곳을 적는다.
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — 서버 관리자의 원격 관리·서버 그룹·오프라인 VHD에 설치, 기능 주문형(Features on Demand), SMB의 버전별 기능·서명·암호화·다중 채널·QUIC의 설정, 저장소 공간·DFS·데이터 중복 제거, 인쇄 관리 콘솔, DHCP의 IPv6·정책·필터·DNS 동적 업데이트·분할 범위의 배포, IPAM, 장애 조치 관계의 복제·클러스터 구성. 있다는 것과 「다루지 않는다」를 말하는 데 필요한 만큼만 적는다.
「(phase 81 step 4)」가 붙은 줄과 항목은 phase 81 step 4에서 `windows-server-roles` 주제의 뒤 개념 여덟(IIS 웹 서버, 사이트 바인딩과 연결 제한, 홈 디렉터리와 가상 디렉터리, 요청 필터링, IIS 로그, FTP 서버, 원격 액세스 역할, 웹 응용 프로그램 프록시)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-18).
읽은 방법은 step 0과 같다(learn.microsoft.com의 영문판과 한국어판을 IPv4로 내려받아 페이지 머리의 `updated_at`·`ms.date`와 「Applies to」를 적었다). 근거는 IIS 문서(`iis/…` — 구성 참조 `iis/configuration/…` 포함)·Windows Server 원격 액세스 문서·Windows 보안 문서·문제 해결 문서다.
**IIS 문서는 대부분 IIS 7.0 때(2007~2008년) 쓴 글이고**, 화면 차례도 Windows Server 2008~2012 R2까지만 적는다. 그래서 같은 사실이 지금 판(IIS 10.0 — Windows Server 2016 이후)에서도 그대로인지 구성 참조의 「Compatibility」 표에 「IIS 10.0에서 바뀌지 않았다」는 줄이 있는지로 맞춰 보고, 항목마다 그 결과를 적는다.
IIS 문서의 한국어판도 있지만(`updated_at` 2026-10-27 무렵, 기계 번역) 화면 이름은 그 번역으로만 확인했고 **실제 한국어 IIS 관리자 화면으로는 확인하지 못했다**. 한국어판은 application을 줄곧 「애플리케이션」으로 옮긴다(「애플리케이션 풀」·「웹 애플리케이션 프록시」) — 고른 이름과 까닭은 항목의 「한국어 이름」 줄에 적는다.
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — IIS의 인증 방식 전체·URL 재작성·ASP.NET 구성·공유 구성·출력 캐시·모듈 목록, 요청 필터링의 사용자 지정 규칙과 헤더 제한, 로그의 사용자 지정 필드·ETW 설정, FTP 사용자 격리·방화벽 설정 전체, VPN·DirectAccess의 배포 절차와 인증서·Always On VPN의 구성, AD FS의 동작과 신뢰 당사자 구성. 있다는 것과 「다루지 않는다」를 말하는 데 필요한 만큼만 적는다.
「(phase 81 step 9)」가 붙은 줄과 항목은 phase 81 step 9에서 `windows-hyperv` 주제의 개념 아홉(Hyper-V, 가상 컴퓨터와 가상 하드 디스크, 가상 스위치, 검사점, 실시간 마이그레이션, 저장소 마이그레이션, Hyper-V 복제본, Windows 컨테이너, 컨테이너 기본 이미지)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-18).
읽은 방법은 step 0·4와 같다(learn.microsoft.com의 영문판과 한국어판을 IPv4로 내려받아 페이지 머리의 `updated_at`·`ms.date`와 「Applies to」를 적었다). 근거는 Windows Server의 Hyper-V 문서(`windows-server/virtualization/hyper-v/…`)·Windows 컨테이너 문서(`virtualization/windowscontainers/…`)·Hyper-V PowerShell 모듈 문서(`?view=windowsserver2025-ps` 판)이고,
지금 판 문서에 없는 것(실행 중인 가상 컴퓨터의 저장소를 옮기는 차례, VHDX가 처음 나온 판, Nano Server 설치 옵션의 끝)만 지난 판 문서(Windows Server 2012 R2·2012, Windows Server 2016)에서 가져왔다 — 줄마다 그 판과, 지금 판 문서에서 같은 말을 찾아본 결과를 적는다.
**Hyper-V 문서의 한국어판은 virtual machine을 대부분 「가상 머신」으로 옮기고, 몇 문서(내보내기·가져오기, 세대 선택)만 「가상 컴퓨터」로 옮긴다** — 고른 이름과 까닭은 항목의 「한국어 이름」 줄에 적는다. **실제 한국어 Hyper-V 관리자 화면의 이름은 확인하지 못했다.**
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — 장애 조치 클러스터와 클러스터 공유 볼륨, 동적 메모리·스마트 페이징, 중첩 가상화, 차폐된 가상 컴퓨터, 세대 1과 2의 차이 전체, 가상 네트워크 어댑터의 설정 전체, 실시간 마이그레이션의 인증(CredSSP·Kerberos 제한된 위임)과 성능 옵션,
복제본의 인증서·확장 복제·추가 복구 지점·테스트 장애 조치의 차례, Dockerfile 문법, 컨테이너 런타임의 설치 차례, 오케스트레이터(Kubernetes)·컨테이너 네트워크 드라이버. 있다는 것과 「다루지 않는다」를 말하는 데 필요한 만큼만 적는다.
「(phase 82 step 0)」이 붙은 항목은 phase 82 step 0에서 `wireless-lan` 주제의 앞 개념 여섯(무선 LAN, 무선 LAN의 전송 방식, 무선 채널, CSMA/CA, MIMO, IEEE 802.11 규격)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-19).
이 주제는 강의 밖 주제라 사실의 근거는 표준 문서뿐이다(ADR-059). **IEEE 802.11 본문은 무료로 열리지 않아**(`standards.ieee.org`는 구매·구독, IEEE GET 프로그램은 `ieeexplore.ieee.org`에서 IEEE 계정으로 로그인해야 한다) 읽지 않았고, 다음 넷을 근거로 썼다 —
`standards.ieee.org`의 표준 개요 페이지(제목·초록·상태·승인일), `ieee802.org/11`의 작업 그룹 페이지(작업 그룹 소개·작업반 보고·개정 연표·PAR 사본·1990~2000년 문서 보관소·1996년 튜토리얼), 802.11을 풀이한 IETF RFC(RFC 4118·5416·8325·9119·9956), 802 플레너리 튜토리얼(`ieee802.org/802_tutorials`).
**작업 그룹 문서는 표준 본문이 아니다** — 1996년 튜토리얼은 승인 전 초안을 옮긴 것이고(슬라이드마다 「unapproved draft, subject to change」), 작업반 보고·회원 발표는 그때의 진행 기록이다. 항목마다 어떤 문서인지와 그 한계를 적는다.
802.11 작업 그룹의 문서 서버(`mentor.ieee.org`)는 허용한 곳(`ieee802.org`·`standards.ieee.org`)이 아니라 쓰지 않았다. **기출이 묻지 않는 것은 사실로 가져오지 않았다** — 프레임 형식·관리 프레임 전체, 변조 방식과 전송률 표 전체, 무선 보안(WEP·WPA), 전력 관리, 로밍 절차.
「(phase 82 step 4)」가 붙은 줄과 항목은 phase 82 step 4에서 `wireless-lan` 주제의 뒤 개념 다섯(WPAN, Zigbee, 무선 메시 네트워크, 핸드오프, 인지 무선)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-19).
근거는 step 0과 같은 IEEE 802 자료(표준 개요 페이지와 802.15·802.21·802.22 작업 그룹 페이지, 802 플레너리 튜토리얼)에 더해, ITU-T 권고(G.9959, Q.1001, Q.1706/Y.2801 — `itu.int`에서 무료 PDF를 받아 읽었다), IETF RFC(2501·8376),
그리고 허용 목록의 「무선 업체 연합 기술」인 CSA(`csa-iot.org`)·Bluetooth SIG(`bluetooth.com`)의 기술 설명 페이지와 사양이다. IEEE 802.15·802.21·802.22·1900.1 본문도 무료로 열리지 않아 읽지 않았다(개요 페이지가 IEEE GET 프로그램으로 받으라고 적지만 그곳은 `ieeexplore.ieee.org` 로그인이다).
**CSA의 Zigbee 사양 PDF(R23.1·R22)는 Cloudflare가 자동 내려받기를 막아(HTTP 403·검사 페이지) 읽지 못했다** — Zigbee 항목은 CSA의 FAQ·소개 페이지와 `ieee802.org`에 올라온 2009년 튜토리얼로만 썼고, 사양에만 있을 사실(장치 역할의 정의 등)은 「찾지 못했다」로 남긴다.
CSA·Bluetooth SIG 페이지에서는 기술을 설명하는 문장만 가져왔다 — 「유일한 완전한 IoT 해법」 같은 홍보 문구, 판매량·채택 회사, 보도 자료는 사실로 옮기지 않았다.
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — Bluetooth 프로파일·페어링, Zigbee의 응용 프로파일·보안, 802.11s의 보안·프레임 형식, 셀룰러(LTE·5G)의 절차와 LTE-M·NB-IoT의 세부, 802.22의 물리 계층.
「(phase 82 step 8)」이 붙은 줄과 항목은 phase 82 step 8에서 `network-devices` 주제의 앞 개념 여섯(계층별 네트워크 장비, 리피터, 게이트웨이, 프록시 서버, 부하 분산, 부하 분산 방식)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-19).
이 주제도 강의 밖 주제라 사실의 근거는 표준·공식 문서뿐이다(ADR-059). RFC는 rfc-editor.org의 텍스트판을 IPv4로 내려받아 절을 직접 읽고 상태는 `…/rfcNNNN.json`으로 확인했다. IEEE 802.3의 리피터 사실은 `ieee802.org`에 올라온 802.3 태스크 포스 발표 자료(표준 본문이 아니다)에서,
부하 분산의 쓰임·상태 확인·분산 방식의 이름은 learn.microsoft.com의 IIS 응용 프로그램 요청 라우팅(ARR) 문서(영문판과 한국어판을 IPv4로 내려받아 페이지 머리의 `updated_at`·`ms.date`를 적었다)에서 가져왔다. learn.microsoft.com 가운데 Azure 서비스 문서(Application Gateway 등)는 검색에 걸려도 쓰지 않았다.
**ARR 문서의 글은 부하 분산 알고리즘이 여섯 가지라는 데까지만 적고, 글로 나오는 이름은 「Weighted round robin」 하나다** — 그래서 분산 방식마다의 정의는 RFC 2391 §5.1과 RFC 7098 §3에서 가져왔고, 가중 라운드 로빈에서 가중치가 몫을 어떻게 나누는지(예: 3:1)는 허용한 출처에서 찾지 못했다.
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — 세션 유지(클라이언트 선호도·쿠키)의 구현, SSL 오프로드, 전역 부하 분산, 장애 조치 클러스터, Windows Server 네트워크 부하 분산(NLB)의 설정, ARR의 캐시·URL 다시 쓰기, 프록시의 인증·로그 형식. L4·L7 스위치(RFC 3234 §2.18 포함)·PoE·PXE는 step 12가 본다.
「(phase 82 step 12)」가 붙은 줄과 항목은 phase 82 step 12에서 `network-devices` 주제의 뒤 개념 넷(L4 스위치, L7 스위치, PoE, PXE)이 쓸 사실을 확인하며 더했다(확인한 날 2026-11-20).
RFC는 rfc-editor.org의 텍스트판을 IPv4로 내려받아 절을 직접 읽고 상태는 `…/rfcNNNN.json`으로 확인했다. 「L4 스위치」·「L7 스위치」·「PoE 스위치」 같은 이름은 rfc-editor.org의 사이트 검색으로 RFC 전체의 본문에서 찾았다 — 그 검색이 본문까지 보는지는 RFC 2816 §8.7의 「Layer 3 switches」가 걸리는 것으로 먼저 확인했다.
IEEE 802.3의 PoE 사실은 `standards.ieee.org`의 표준 개요 페이지(802.3af·802.3at·802.3bt·802.3-2022)와 `ieee802.org/3`의 태스크 포스 페이지(PAR·목표·요구 사항 문서·5대 기준·4쌍 PoE 관심 요청(CFI) 발표 자료)에서 가져왔다. **IEEE 802.3 본문은 열지 못했다**(개요 페이지가 IEEE GET 프로그램으로 받으라고 적지만 그곳은 `ieeexplore.ieee.org` 로그인이다) — 태스크 포스 문서는 표준 본문이 아니므로 항목마다 어떤 문서인지 적는다.
PXE·WDS·PnP·PE와 L7 쪽의 IIS ARR은 learn.microsoft.com의 문서(영문판과 한국어판을 IPv4로 내려받아 `updated_at`·`ms.date`를 적었다)에서 가져왔다. 같은 사이트의 Configuration Manager 문제 해결 문서와 Azure 문서(Application Gateway·Front Door)는 검색에 걸려도 쓰지 않았고, Intel의 PXE 사양과 업체의 L4·L7 스위치 제품 문서는 허용 목록 밖이라 열지 않았다.
**기출이 묻지 않는 것은 사실로 가져오지 않았다** — 부하 분산 장치의 제품별 기능·SSL 오프로드·직접 서버 반환 같은 전달 기법, PoE의 전력 등급표 전체·전압과 쌍 배치의 세부·LLDP 전력 협상, PXE 펌웨어 구현·UEFI 네트워크 부팅의 세부·DHCPv6 네트워크 부팅, WDS 설치 절차.

---

## ITU-T X.200 (07/94) — OSI Basic Reference Model: The basic model
https://www.itu.int/rec/T-REC-X.200-199407-I/en

1994-07 승인, 현행 권고다. 본문은 ISO/IEC 7498-1:1994와 같다. 위 페이지에서 무료 PDF를 받아 읽었다.

- 응용 계층은 응용 프로세스가 OSI 환경에 닿는 유일한 수단이다 — §7.1.2.1
- 표현 계층은 응용 개체들이 주고받는 정보의 표현을 공통으로 맞춰, 표현 형식(구문)을 신경 쓰지 않게 한다 — §7.2.2.1, §7.2.2.2
- 세션 계층은 대화를 조직하고 동기를 맞추며 데이터 교환을 관리한다. 세션 연결을 맺고, 질서 있게 주고받게 하고, 질서 있게 닫는다 — §7.3.2.1
- 전송 서비스는 세션 개체들 사이의 투명한 데이터 전달을 제공해, 신뢰성 있고 비용 효율적인 전달이 어떻게 이뤄지는지를 위 계층이 신경 쓰지 않게 한다 — §7.4.2.1
- 네트워크 계층은 전송 개체들이 경로 선택과 중계를 신경 쓰지 않게 한다 — §7.5.2.1. 제공하는 기능의 첫째가 네트워크 주소다 — §7.5.3.1.6
- 데이터 링크 계층은 물리 계층에서 생길 수 있는 오류를 검출하고, **경우에 따라** 고친다 — §7.6.2.2
- 물리 계층은 데이터 링크 개체 사이의 비트 전송을 위해 물리 연결을 활성화·유지·해제하는 기계적·전기적·기능적·절차적 수단을 제공한다 — §7.7.2
- 제목의 OSI는 Open Systems Interconnection이다(「Information technology – Open Systems Interconnection – Basic Reference Model」). 일곱 계층의 영문 이름은
  Application Layer, Presentation Layer, Session Layer, Transport Layer, Network Layer, Data Link Layer, Physical Layer다 — 제목, §7.1~§7.7 제목
- (N)-프로토콜 데이터 단위(PDU, protocol-data-unit)는 (N)-프로토콜이 정하는 데이터 단위로, (N)-프로토콜 제어 정보에 (N)-사용자 데이터가 더해질 수 있다 — §5.6.1.3
- (N)-프로토콜 제어 정보는 같은 계층의 개체들이 함께 일하도록 서로 주고받는 정보이고, (N)-사용자 데이터는 그 계층이 위 계층을 대신해 나르는 데이터다 — §5.6.1.1, §5.6.1.2
- 위 계층의 (N)-PDU는 아래 계층으로 넘어가 (N–1)-서비스 데이터 단위가 되고, 그것이 (N–1)-PDU의 사용자 데이터 자리에 (N–1)-프로토콜 제어 정보와 함께 담긴다.
  제어 정보와 사용자 데이터의 위치 관계(앞·뒤)는 이 그림이 정하지 않는다 — §5.6.2.1, Figure 8, Figure 9 및 NOTE 2·3
- (2026-10-28) (N)-프로토콜은 (N)-개체들이 (N)-기능을 할 때 어떻게 통신할지를 정하는 규칙과 형식의 묶음이고, 그 규칙과 형식은 의미적(semantic)·구문적(syntactic)이다.
  시간·타이밍은 이 정의에 없고, 「세 요소」로 묶는 말도 없다 — §5.2.1.9
- (2026-10-28) 연결형(connection-mode)은 연결 설정 → 데이터 전달 → 연결 해제의 세 단계를 거친다 — §5.3.3.2.1.
  연결은 이어 보내는 단위들을 논리적으로 묶으므로 순서를 지키는 일과 흐름 제어를 할 수 있게 한다 — §5.3.3.2.2 d)
- (2026-10-28) 비연결형(connectionless-mode)은 연결 없이 데이터 단위 하나를 보내고, 목적지 주소처럼 보내는 데 필요한 정보를 그 단위와 함께 한 번에 넘긴다 — §5.3.3.3.1, §5.3.3.3.2 b).
  단위마다 경로가 따로 정해질 수 있고(may) — §5.3.3.3.3 a), 기본 비연결형 서비스는 순서를 지키지 않아도 된다 — §5.3.3.3.6 a)
- (2026-10-28) 「virtual circuit」「datagram」「message switching」이라는 말은 이 권고에 없다 — 전문 검색
- (2026-10-28) 표현 계층의 기능 하나는 추상 구문을 전송 구문으로 나타내는 것이고, 형식 변환과 특수 목적 변환을 포함한다. 그 예로 데이터 압축을 든다 — §7.2.4 b)
- (2026-10-28) 암호화(encryption·encipherment)라는 말은 이 권고에 없다. 보안 구조는 X.800(ISO 7498-2)에 맡긴다 — §5.1.3 NOTE, 전문 검색

쓰인 곳: 면접 수정 이력 I1, I9, I10, `protocols-encapsulation.reference-model`, `protocols-encapsulation.osi-model`, `protocols-encapsulation.encapsulation`, `protocols-encapsulation.decapsulation`, `protocols-encapsulation.pdu-names`,
`protocols-encapsulation.protocol`, `protocols-encapsulation.packet-switching`, `exam-notes.md` E1·E3, (phase 72 step 5) `ethernet.fcs`(데이터 링크 계층의 프로토콜 가운데 오류를 고치는 것도 있다, §7.6.2.2)

## IEEE 802.3 — Ethernet, 3.2.6 Length/Type field
https://www.ieee802.org/3/frame_study/0411/3d0_1.pdf

IEEE 802.3 표준 본문은 허용한 곳에서 무료로 열리지 않는다. 위 문서는 IEEE 802.3 작업 그룹이 올린 개정 초안(IEEE Draft P802.3 Frame Expansion D0.1,
2004-11-16)이고, 고치려는 IEEE Std 802.3 3.2.6의 본문을 그대로 싣고 있어 그 본문을 근거로 쓴다.

- 길이/타입 필드는 2옥텟이고 값에 따라 두 뜻 중 하나로 읽는다 — §3.2.6
- 값이 1500 이하면 **뒤따르는 데이터 필드에 든 MAC 클라이언트 데이터의 옥텟 수**를 뜻한다(길이로 읽기). 프레임 전체의 크기가 아니다 — §3.2.6 a)
- 값이 1536(0x0600) 이상이면 MAC 클라이언트 프로토콜이 무엇인지 나타낸다(타입으로 읽기). 두 읽기는 서로 배타적이다 — §3.2.6 b)
- 데이터가 최소 길이보다 짧으면 데이터 필드 끝과 FCS 사이에 패드를 붙인다 — §3.2.6

- (phase 72 step 5) 3.2.6 본문을 P802.3as D0.1(아래 항목의 문서)에서 다시 읽었다. 길이로 읽을 때 세는 것은 데이터 필드에 든 **MAC 클라이언트 데이터**의 옥텟이고, 패드는 해석과 상관없이 데이터 필드 끝과 FCS 사이에
  따로 덧붙는 옥텟이다. 그러니 패드는 이 길이에 들지 않는다(RFC 894도 채운 옥텟은 IP 패킷의 일부가 아니라고 쓴다) — §3.2.6 a), §3.2.6 둘째 문단
- (phase 72 step 5) 필드 값을 수로 따질 때 첫 옥텟이 높은 자리다. 1500과 1536 사이의 값(1501~1535)에 대한 읽기는 이 절에 없다 — §3.2.6

쓰인 곳: 강의 수정 이력 L1, `ethernet.frame`(길이/타입의 역할·패드 위치), `ethernet.ethertype-length`(두 읽기, 1500 이하는 데이터의 옥텟 수이고 프레임 전체 크기가 아니다, 1536 이상은 이더타입, 두 읽기가 겹치지 않는다, 패드는 길이에 넣지 않는다)

## IEEE 802.3 — Ethernet, 3.2.9 Frame Check Sequence (FCS) field, 3.4 Invalid MAC frame (phase 72: 3.1.1, 3.2.1~3.2.8, 3.3)
https://www.ieee802.org/3/as/public/0503/3d0_1_CMP.pdf

위 3.2.6 항목과 같은 사정이다. 이 문서는 IEEE 802.3 작업 그룹이 올린 IEEE Std 802.3-2005 개정 초안(IEEE P802.3as Draft 0.1, 2005-03)이고,
3장의 3.2.9와 3.4 본문을 싣고 있어 그 본문을 근거로 쓴다. (phase 72) 같은 문서가 3장의 나머지(3.1~3.3) 본문도 싣고 있어 함께 근거로 쓴다.

- FCS 필드는 4옥텟(32비트) CRC 값을 담는다. 프리앰블·SFD·FCS·확장 필드를 뺀 나머지(주소, 길이/타입, 데이터, 패드)로 계산한다 — §3.2.9
- 받은 프레임에서 FCS를 뺀 비트로 다시 계산한 CRC가 받은 FCS와 다르면 그 프레임은 잘못된 MAC 프레임이다(길이 불일치, 옥텟 단위가 아닌 길이도 잘못된 프레임의 조건이다) — §3.4
- 잘못된 MAC 프레임의 내용은 LLC나 MAC Control 부계층으로 넘기지 않는다. 다른 MAC 클라이언트는 무시하거나 버리거나 따로 쓸 수 있다(각주) — §3.4
- 오류를 고치는 절차는 3.2.9·3.4 어디에도 없다 — 검출하고 넘기지 않을 뿐이다 — §3.2.9, §3.4
- (phase 72) 이 판(802.3-2005)의 3.1.1은 프리앰블과 SFD까지 넣어 프레임의 필드를 아홉으로 센다. 그러나 같은 절이 최소·최대 프레임 크기는 **목적지 주소부터 FCS까지**만 센다고 하고,
  4.1.2.1.1은 프리앰블과 SFD를 프레임 **앞에 붙인다**고 쓴다(아래 4장 항목). 지금의 802.3 작업 그룹 용어는 아래 「editorial guidelines」 항목이다 — §3.1.1
- (phase 72) 그림 3–1의 필드와 크기: 프리앰블 7옥텟, SFD 1옥텟, 목적지 주소 6옥텟, 출발지 주소 6옥텟, 길이/타입 2옥텟, MAC 클라이언트 데이터와 패드를 합쳐 46~1500옥텟, FCS 4옥텟.
  프레임의 옥텟은 그림의 위에서 아래 순서로 보낸다 — §3.1.1, Figure 3–1
- (phase 72) 프리앰블 필드는 7옥텟이고, 받는 쪽 물리 계층 회로가 들어오는 프레임의 박자에 맞춰 안정된 동기 상태에 이르게 하는 데 쓴다 — §3.2.1
- (phase 72) SFD는 비트열 10101011이고, 프리앰블 바로 뒤에 와서 프레임이 시작됨을 알린다 — §3.2.2
- (phase 72) 주소 필드는 목적지 주소, 출발지 주소 순서로 둘이고 각각 48비트다. 목적지 주소의 첫 비트(가장 낮은 비트, I/G)가 0이면 개별 주소, 1이면 그룹 주소다.
  출발지 주소에서는 이 비트를 0으로 둔다. 둘째 비트(U/L)는 0이면 전역 관리 주소, 1이면 지역 관리 주소다. 주소의 각 옥텟은 가장 낮은 비트부터 보낸다 — §3.2.3 a)~d)
- (phase 72) MAC 주소는 개별 주소(스테이션 하나)와 그룹 주소(여럿)로 나뉘고, 그룹 주소는 다시 멀티캐스트 그룹 주소와 브로드캐스트 주소로 나뉜다.
  목적지 주소 필드의 비트가 모두 1이면 브로드캐스트 주소이고, 그 매체에 연결된 모든 스테이션을 가리킨다. 모든 스테이션은 브로드캐스트 주소를 알아봐야 한다.
  브로드캐스트 주소는 U/L 비트도 1이다 — §3.2.3 c), §3.2.3.1
- (phase 72) 목적지 주소는 개별 주소나 멀티캐스트(브로드캐스트 포함) 주소일 수 있고, 출발지 주소는 프레임을 보낸 스테이션을 가리킨다 — §3.2.4, §3.2.5
- (phase 72) 데이터 필드가 정해진 최소 길이보다 짧으면 옥텟 단위의 패드를 데이터 뒤에 붙여 늘린 다음 FCS를 계산해 붙인다 — §3.2.7, §3.2.8
- (phase 72) FCS를 뺀 프레임의 각 옥텟은 낮은 비트부터 보낸다 — §3.3
- (phase 72 step 9) 그림 3–1의 필드(프리앰블·SFD·두 주소·길이/타입·데이터와 패드·FCS) 가운데 프레임이 장치를 몇 번 지났는지 세거나 적는 필드는 없다.
  아래 IEEE 802.1 튜토리얼 35쪽이 경로마다 나눠 보내는 기능(ECMP)을 위해 「TTL을 담을 새 태그」를 따로 만든다고 적는 것도 같은 사정이다 — §3.1.1, Figure 3–1

- (phase 72 step 5) 3.2.9와 3.4의 전문을 다시 읽었다(2026-10-28, 위 PDF). CRC는 cyclic redundancy check의 약어이고, 보내는 쪽과 받는 쪽의 알고리즘이 같은 CRC로 FCS 값을 만든다.
  CRC 값은 정해진 생성 다항식으로 프레임 비트에서 계산하는 수학적 절차로 정의된다(이 과목은 계산법을 가르치지 않는다) — §3.2.9
- (phase 72 step 5) 3.4가 잘못된 MAC 프레임에 대해 정하는 것은 둘뿐이다 — 그 내용을 LLC·MAC Control 부계층으로 넘기지 않는다는 것과, 잘못된 프레임이 생긴 사실을 네트워크 관리 쪽에 알릴 수 있다는 것.
  손상된 비트를 고치는 절차도, 보낸 쪽에 알리거나 다시 보내 달라고 요청하는 절차도 없다 — §3.4

쓰인 곳: 면접 수정 이력 I1, `protocols-encapsulation.osi-model`, (phase 72) 강의 수정 이력 L28·L29, `ethernet.nic`(브로드캐스트 주소는 그 LAN의 모든 장치를 가리킨다), `ethernet.frame`(필드 순서·크기·프리앰블·SFD·패드·FCS의 역할), `ethernet.mac-address`(48비트·두 구분 비트·브로드캐스트), `ethernet.fcs`(4옥텟 CRC 값, 프리앰블·SFD·FCS를 뺀 나머지로 계산, 다르면 잘못된 프레임으로 위로 넘기지 않음, 고치거나 다시 보내 달라고 하는 절차가 없음), (phase 72 step 9) `hub-switch-vlan.flooding-forwarding-filtering`(브로드캐스트 주소는 그 LAN의 모든 장치를 가리킨다, §3.2.3.1), `hub-switch-vlan.stp`·문항 n043 해설(이더넷 프레임에는 장치를 몇 번 지났는지 적는 필드가 없다 — 그래서 고리에 들어간 프레임이 사라지지 않는다)

## IEEE RA — Use of the IEEE Assigned EtherType
https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/ethertype.pdf

- 이더타입은 뒤따르는 데이터를 어떻게 해석할지 알려 준다(대개 프로토콜 식별). 길이/타입 필드는 IEEE Std 802.3 3.2.6에 정의돼 있다 — 「Tutorial」 첫 문단
- 필드 값이 1536(0x0600) 이상이면 타입으로 읽으므로 이더타입은 모두 0x0600~0xFFFF에 든다. 길이 읽기와 타입 읽기는 서로 배타적이다 — 「Tutorial」 둘째 문단
- 같은 자리의 필드를 표준 이전 이더넷은 타입 필드로, 초기 IEEE 802.3은 길이 필드로 불렀다 — 각주 1
- (phase 72 step 5) 타입으로 읽으면 이 필드의 이더타입이 MAC 클라이언트의 프로토콜을 가리킨다. 여러 표준이 이더타입을 16진수 네 자리(WX-YZ 꼴)로 적는다 — 「Tutorial」 둘째·셋째 문단

쓰인 곳: 강의 수정 이력 L1, (phase 72 step 5) `ethernet.ethertype-length`(이더타입은 실린 데이터의 프로토콜을 가리키고 16진수로 적는다, 0600~FFFF, 두 읽기는 겹치지 않는다, 예전 이름 타입 필드·길이 필드)

## IANA — IEEE 802 Numbers (EtherType 레지스트리)
https://www.iana.org/assignments/ieee-802-numbers/ieee-802-numbers.xhtml

- 0000~05DC(10진 0~1500) 구간은 IEEE 802.3 길이 필드로 표시돼 있다 — EtherType 표
- IPv4는 0800, ARP는 0806, IPv6는 86DD다 — EtherType 표
- (phase 72 step 1) 8100은 「고객 VLAN 태그(C-Tag) 타입」이고 예전 이름은 Q-Tag다(근거 RFC 9542). 88A8은 IEEE 802.1Q의 서비스 VLAN 태그(S-Tag)다 — EtherType 표

- (phase 72 step 5) 레지스트리 XML(https://www.iana.org/assignments/ieee-802-numbers/ieee-802-numbers.xml)을 다시 열어 확인했다. 0000-05DC(10진 0-1500) 「IEEE802.3 Length Field」 다음 기록은
  예전에 쓰다 무효가 된 값(0101-01FF·0200·0201·0400)이고, 그다음이 0600(10진 1536)이다. 05DD~05FF(10진 1501~1535)에 대한 기록은 없다.
  0800은 「Internet Protocol version 4 (IPv4)」, 0806은 「Address Resolution Protocol (ARP)」, 86DD는 「Internet Protocol version 6 (IPv6)」으로 적혀 있다 — EtherType 표

쓰인 곳: 강의 수정 이력 L1, `ethernet.ethertype-length`(0000~05DC는 길이, 0800·86DD·0806, ARP의 풀네임, 05DD~05FF에 정해진 것이 없음), (phase 72 step 1) `hub-switch-vlan.vlan-tagging`(TPID 0x8100 — (phase 72 step 11) 본문은 값을 적지 않고 「이 자리에 VLAN 태그가 있다는 것을 알리는 정해진 값」으로만 쓴다),
(phase 73 step 1) `arp.arp`(ARP 메시지를 실은 프레임의 이더타입 0806 — 바로 실린다는 것은 아래 「(phase 73 step 1) RFC 826」 항목)

## RFC 9542 — IANA Considerations and IETF Protocol and Documentation Usage for IEEE 802 Parameters
https://www.rfc-editor.org/rfc/rfc9542

- 2024년 기준 IEEE가 할당하는 MAC 주소 접두사는 길이가 셋이다 — MA-L 24비트, MA-M 28비트, MA-S 36비트. 접두사 뒤에 남는 비트를 받은 쪽이 채운다 — §2.1(Table 1)
- 첫 옥텟의 X 비트(Local 비트)가 0이면 IEEE가 할당한 접두사를 가진 쪽이 관리하는 전역 주소이고, 1이면 그 네트워크의 관리자가 정해 쓸 수 있는 주소다 — §2.1.1
- 이더타입은 부호 없는 정수로 0x0600 이상인 16비트 식별자다. 길이로 쓰는 값은 이더타입과 헷갈리지 않도록 0x5DD 미만이어야 한다 — §3
- 이 RFC는 그 필드를 짧게 「프레임 길이를 주는 필드」라고 부른다. 무엇의 길이인지는 IEEE 802.3 3.2.6이 정한다(위 항목) — §3
- (phase 72) 이 RFC는 옥텟 하나를 16진수 두 자리로 적고, 옥텟 사이를 하이픈으로 가른다. IEEE 802.3 링크에서는 옥텟 안의 비트를 가장 낮은 비트부터 보낸다 — §1.1
- (phase 72) 48비트 MAC 주소는 이더넷 인터페이스를 가리키는 식별자로 가장 흔히 쓰인다. 전역에서 하나뿐인 것을 EUI-48이라고도 부른다 — §2.1
- (phase 72) 첫 옥텟의 가장 낮은 비트(M 비트, 흔히 그룹·멀티캐스트 비트)가 0이면 유니캐스트 주소, 1이면 그룹 주소(멀티캐스트나 브로드캐스트)다 — §2.1.1
- (phase 72) IEEE가 할당하는 MA-L·MA-M·MA-S 접두사는 Local 비트가 0이다. 접두사를 받은 쪽은 그 접두사의 M 비트를 1로 바꾼 꼴로 그룹 주소를 만들 수 있다 — §2.1.2
- (phase 72) IANA가 가진 OUI는 00-00-5E이고, 그 아래 유니캐스트 주소는 00-00-5E-00-00-00~00-00-5E-FF-FF-FF다 — §2.1.3
- (phase 72) **문서에 쓰라고 정해 둔 48비트 MAC 주소**: 유니캐스트 00-00-5E-00-53-00~00-00-5E-00-53-FF, 멀티캐스트 01-00-5E-90-10-00~01-00-5E-90-10-FF — §2.1.4
- (phase 72) 이 RFC에는 모든 비트가 1인 브로드캐스트 주소를 적은 문장이 없다 — 전문 검색. 근거는 IEEE 802.3 §3.2.3.1(위 항목)과 RFC 894(아래 항목)다

쓰인 곳: 강의 수정 이력 L1, L2, (phase 72) L29, `ethernet.mac-address`(전역·지역 관리·16진 표기·문서용 주소)와 두 주제의 예시 주소(`phases/72-network-ethernet-switch/guide.md` 「예시 값」), (phase 72 step 5) `ethernet.ethertype-length`(이더타입은 0x0600 이상, 길이는 0x5DD 미만, §3)
(phase 73 step 8) `arp.arp`·`arp.arp-request-reply`의 예시 MAC 주소 `00-00-5E-00-53-01`·`00-00-5E-00-53-02`(§2.1.4)와 브로드캐스트 주소 `FF-FF-FF-FF-FF-FF`, 도식 `arp-purpose`·`arp-exchange`, 문항 n064

## IEEE RA — Guidelines for Use of EUI, OUI, and CID
https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf

- OUI와 CID는 24비트다. IEEE RA는 이와 별도로 36비트 OUI-36도 할당한다 — PDF 2쪽 「IEEE-Administered organizational identifiers: OUI and CID」
- EUI를 MAC 주소로 쓸 때 첫 옥텟의 가장 낮은 비트(I/G)는 개별/그룹을, 그다음 비트(U/L)는 전역 관리(0)/지역 관리(1)를 나타낸다.
  전역 관리 주소는 전 세계에서 하나뿐이도록 만든 주소다 — PDF 6쪽
- IEEE RA가 할당한 OUI·OUI-36으로 만든 주소는 U/L이 0이라 전역 관리 주소다 — PDF 6쪽
- (phase 72) 문서 날짜는 2017-08-03이다. OUI는 3옥텟이고, 첫 옥텟의 가장 낮은 두 비트(M·X)가 **둘 다 0**이다. 그러니 첫 옥텟이 홀수이거나 둘째 비트가 1인 값은 IEEE RA가 준 OUI가 아니다 — PDF 2쪽 「OUI」
  (예외로 802.3-1985 승인 전 초기 이더넷 업체에 준 블록 ID 약 18개는 X 비트가 1이다 — 같은 쪽 NOTE)
- (phase 72) IEEE RA는 OUI를 하이픈으로 옥텟을 가른 16진 꼴로 적는다(예: AC-DE-48). EUI-48도 같은 꼴로 적는다(예: AC-DE-48-23-45-67) — PDF 3쪽, PDF 9쪽 「EUI Structure and Representation」
- (phase 72) EUI-48은 흔히 하드웨어 인터페이스의 주소로 쓰이고, 예전에는 「MAC-48」이라고도 불렀다 — PDF 6쪽
- (phase 72) IEEE RA가 준 OUI·OUI-36은 M 비트가 0이라, 그것으로 만든 주소는 I/G가 0인 개별 주소다. OUI를 받은 쪽은 M 비트를 1로 바꾼 꼴로 그룹 주소(I/G=1)를 만들 수 있고, 그 주소는 장치 하나를 가리키지 않는다 — PDF 6쪽

쓰인 곳: 강의 수정 이력 L2, (phase 72) L29, `ethernet.mac-address`(전역 유일성·OUI·구분 비트)

## RFC 791 — Internet Protocol
https://www.rfc-editor.org/rfc/rfc791

- (phase 72 step 4, 2026-10-28 확인) 옥텟은 비트 8개인 바이트다 — Glossary 「octet」(본문 43쪽). MAC 주소의 두 자리 묶음과 프레임 필드 크기의 단위를 풀 때만 쓴다.

- IP가 하는 기본 기능은 주소 지정과 단편화 둘이다 — §1.4
- 주소는 4옥텟(32비트) 고정 길이다. 그러니 이론상 개수는 2^32 = 4,294,967,296이다 — §2.3 「Addressing」
- 주소 클래스: A는 맨 앞 1비트가 0이고 다음 7비트가 네트워크, 나머지 24비트가 호스트 쪽이다. B는 맨 앞 2비트가 10, 다음 14비트가 네트워크, 나머지 16비트가 호스트 쪽이다.
  C는 맨 앞 3비트가 110, 다음 21비트가 네트워크, 나머지 8비트가 호스트 쪽이다 — §2.3 「Addressing」
- 단편화 오프셋 필드는 8옥텟(64비트) 단위로 센다. 첫 조각의 오프셋은 0이다 — §3.1 「Fragment Offset」
- TTL은 데이터그램을 처리하는 모든 모듈이 최소 1씩 줄인다 — §3.1 「Time to Live」
- IP는 데이터그램이라 부르는 데이터 덩어리를 출발지에서 목적지로 나른다. 쓰이는 환경은 패킷 교환 방식의 컴퓨터 통신 네트워크들을 서로 이은 시스템이다 — §1.1 「Motivation」, §1.2 「Scope」(인터넷 데이터그램)
- IP는 인터넷 데이터그램 하나하나를 다른 데이터그램과 관계없는 독립된 것으로 다룬다. 데이터그램 사이에 연결이나 논리적 회선이 없다 — §1.4 「Operation」
- (phase 71) 이름은 찾는 것이 무엇인지, 주소는 그것이 어디 있는지, 경로는 거기 어떻게 가는지를 가리키고, IP는 주로 주소를 다룬다 — §2.3 「Addressing」.
  IP 모듈은 인터넷 헤더에 실린 주소를 써서 데이터그램을 목적지 쪽으로 보낸다 — §1.4 「Operation」
- (phase 71) 데이터그램을 나눠야 하는 것은, 큰 패킷을 실을 수 있는 네트워크에서 출발한 데이터그램이 목적지로 가는 길에 더 작은 패킷만 실을 수 있는 네트워크를 지나야 할 때다 — §2.3 「Fragmentation」.
  IP 모듈은 「작은 패킷」 네트워크를 지나야 할 때 데이터그램을 나누고 다시 합친다 — §1.4 「Operation」
- (phase 73) IP 모듈은 인터넷으로 통신하는 호스트마다, 네트워크를 잇는 게이트웨이(라우터)마다 하나씩 있고, 주소 칸을 읽는 규칙과 데이터그램을 나누고 합치는 규칙을 함께 쓴다 — §1.4 「Operation」
- (phase 73) 단편화하는 곳과 합치는 곳: 긴 데이터그램을 나누는 IP 모듈의 예로 게이트웨이를 들고, 조각을 합치는 IP 모듈의 예로 목적지 호스트를 든다.
  인터넷의 기본 서비스는 데이터그램을 게이트웨이에서 나눌 수 있게 하고, 다시 합치는 일은 목적지 호스트의 IP 모듈이 한다 — §2.3 「Fragmentation」, §3.2 「Discussion」 첫머리
- (phase 73) 나누는 IP 모듈은 원래 헤더의 칸들을 조각마다 복사하고, 데이터를 8옥텟 경계에서 자른다(마지막 조각만 8의 배수가 아니어도 된다). 조각마다 전체 길이 칸을 그 조각의 길이로 고친다.
  나뉘지 않은 데이터그램은 MF가 0이고 오프셋이 0이다 — §2.3 「Fragmentation」, §3.2 「Fragmentation and Reassembly」
- (phase 73) 「나누지 마라(don't fragment)」 표시가 있는 데이터그램은 어떤 경우에도 나누지 않는다. 나누지 않고는 목적지에 보낼 수 없으면 버린다 — §2.3 「Fragmentation」, §3.2 「Fragmentation and Reassembly」
- (phase 73) 조각을 받는 쪽은 식별자 칸으로 서로 다른 데이터그램의 조각이 섞이지 않게 하고, 오프셋으로 조각이 원래 데이터그램의 어디에 들어가는지, MF가 0인 것으로 마지막 조각을 안다.
  합칠 때는 **식별자·출발지 주소·목적지 주소·프로토콜** 넷이 모두 같은 조각끼리 묶는다 — §2.3 「Fragmentation」, §3.2 「Fragmentation and Reassembly」
- (phase 73) 식별자는 보내는 쪽이 정해 붙이는 값이고, 그 데이터그램이 인터넷에 머무는 동안 같은 출발지·목적지·프로토콜 짝 안에서 겹치지 않아야 한다 — §2.3 「Fragmentation」, §3.1 「Identification」.
  RFC 6864가 이 요구를 고쳤다 — 아래 RFC 6864 항목
- (phase 73) 헤더 형식(§3.1 그림 4)의 칸과 크기: 버전(Version) 4비트, 헤더 길이(IHL) 4비트, 서비스 유형(Type of Service) 8비트, 전체 길이(Total Length) 16비트,
  식별자(Identification) 16비트, 플래그(Flags) 3비트, 단편화 오프셋(Fragment Offset) 13비트, TTL(Time to Live) 8비트, 프로토콜(Protocol) 8비트, 헤더 체크섬(Header Checksum) 16비트,
  출발지 주소(Source Address) 32비트, 목적지 주소(Destination Address) 32비트, 옵션(Options, 길이가 바뀐다)과 패딩(Padding) — §3.1
- (phase 73) 헤더 길이 칸은 헤더 길이를 **32비트 워드 수**로 적고, 바른 헤더의 최솟값은 5(곧 20옥텟)다. 흔한 헤더는 20옥텟이고 가장 긴 헤더는 60옥텟이다 — §3.1 「IHL」, 「Total Length」
- (phase 73) 전체 길이 칸은 헤더와 데이터를 합친 데이터그램의 길이를 옥텟으로 센 값이고, 65,535옥텟까지 적을 수 있다 — §3.1 「Total Length」
- (phase 73) 플래그 세 비트: 비트 0은 예약(반드시 0), 비트 1은 DF(0이면 나눠도 된다, 1이면 나누지 마라), 비트 2는 MF(0이면 마지막 조각, 1이면 뒤에 조각이 더 있다) — §3.1 「Flags」
- (phase 73) TTL 칸은 데이터그램이 인터넷에 머물 수 있는 **최대 시간**을 가리키고, 값이 0이면 그 데이터그램을 없애야 한다. 단위는 **초**로 정했지만, 1초 안에 처리해도 처리한 모듈마다 최소 1씩 줄이므로
  머무는 시간의 상한으로만 볼 수 있다. 이 칸을 두는 목적은 전달할 수 없는 데이터그램을 버리고 데이터그램의 수명에 상한을 두는 것이다 — §3.1 「Time to Live」.
  실제로 홉 수처럼 쓰인다는 것은 RFC 1122 §3.2.1.7·RFC 1812 §5.3.1(아래 두 항목)
- (phase 73) 프로토콜 칸은 데이터 부분에 담긴 **다음 계층 프로토콜**을 가리키는 번호이고, 값은 「Assigned Numbers」에 정한다(지금은 IANA 레지스트리 — 아래 IANA 항목) — §3.1 「Protocol」
- (phase 73) 헤더 체크섬은 **헤더만** 검사한다. TTL처럼 지나는 곳마다 바뀌는 칸이 있어서, 헤더를 처리하는 곳마다 다시 계산하고 검사한다 — §3.1 「Header Checksum」
- (phase 73) 서비스 유형 칸은 원하는 서비스 품질(우선순위, 지연·처리량·신뢰성)을 가리킨다 — §3.1 「Type of Service」. 이 칸의 지금 쓰임은 아래 RFC 2474·RFC 3168 항목
- (phase 73) 옵션은 데이터그램마다 있을 수도 없을 수도 있고(모든 IP 모듈이 구현은 해야 한다), 패딩은 헤더가 32비트 경계에서 끝나게 채우는 0이다 — §3.1 「Options」, 「Padding」
- (phase 73) 모든 IP 모듈은 68옥텟짜리 데이터그램을 더 나누지 않고 넘길 수 있어야 한다 — 헤더가 60옥텟까지 길어질 수 있고 가장 작은 조각이 8옥텟이기 때문이다.
  모든 목적지는 576옥텟짜리 데이터그램을 통째로든 조각으로든 받을 수 있어야 한다 — §3.2 「Fragmentation and Reassembly」, §3.1 「Total Length」
- (phase 73 step 3) 버전 칸은 인터넷 헤더의 형식을 가리키고, 이 문서(RFC 791)가 정하는 것은 버전 4다 — §3.1 「Version」. 헤더 길이 칸은 32비트 워드 수로 적어 데이터가 어디서 시작하는지 가리킨다 — §3.1 「IHL」
- (phase 73 step 1) IP는 끝과 끝 사이의 신뢰성, 흐름 제어, 순서 맞추기 같은 장치를 두지 않는다 — §1.2 「Scope」
- (phase 73 step 1) IP는 신뢰성 있는 통신을 주지 않는다. 끝과 끝 사이에도 홉과 홉 사이에도 확인 응답이 없고, 데이터에는 오류 제어가 없이 헤더 체크섬만 있으며, 다시 보내지도 흐름을 제어하지도 않는다.
  찾아낸 오류는 IP 모듈 안에 구현된 ICMP로 알릴 수 있다 — §1.4 「Operation」
- (phase 73 step 1) 동작 모델(게이트웨이 하나를 지나는 경우): 출발지의 IP 모듈은 데이터그램 헤더를 만들고, 목적지 인터넷 주소로 보낼 지역 네트워크 주소 — 이 예에서는 게이트웨이의 주소 — 를 정해 지역 네트워크 인터페이스에 넘긴다.
  인터페이스는 지역 네트워크 헤더를 붙여 보낸다. 게이트웨이의 인터페이스는 그 지역 헤더를 떼고 데이터그램을 IP 모듈에 넘기고, IP 모듈은 인터넷 주소를 보고 다른 네트워크로 넘길 데이터그램임을 안 뒤 목적지 호스트의 지역 네트워크 주소를 정해
  그 네트워크의 인터페이스에 넘기며, 그 인터페이스가 새 지역 헤더를 붙여 보낸다. 목적지 호스트의 인터페이스가 지역 헤더를 떼고 IP 모듈에 넘긴다 — §2.2 「Model of Operation」.
  이 모델에서 구간마다 떼고 새로 붙는 것은 지역 네트워크 헤더이고, 목적지를 가리키는 인터넷 주소는 그대로 다음 구간으로 간다(라우터가 넘기는 순서는 아래 RFC 1812 §5.2.1.2 줄)
- (phase 73 step 11, 2026-10-29 rfc-editor.org 원문) 목록 항목 `icmp.ip-limits`의 영문 이름 가운데 **unreliable은 표준이 붙인 용어가 아니다** — 원문은 IP가 「신뢰성 있는 통신 수단을 주지 않는다(does not provide a reliable communication facility)」고 쓰고(§1.4), RFC 792 Introduction은 「절대적으로 믿을 수 있게 설계되지 않았다」고 쓴다. 그 성질을 형용사 하나로 적은 것이다. connectionless는 RFC 1122 §1.1.3의 말이다(아래 RFC 1122 항목)
- (phase 74) 주소는 앞쪽의 **네트워크 번호**와 그 뒤의 **그 네트워크 안의 주소**(local address — 이 문서는 「rest」 칸이라고도 부르고, 클래스 표에서는 host라 적는다)로 이루어진다 — §2.3 「Addressing」, §3.2 「Addressing」의 표.
  클래스마다 앞쪽 몇 비트가 네트워크 번호이고 몇 비트가 호스트 쪽인지는 위 「주소 클래스」 줄과 같다
- (phase 74) 클래스를 셋으로 나눈 까닭: 호스트가 아주 많은 네트워크 몇 개, 중간 크기 네트워크 중간 개수, 호스트가 적은 네트워크 아주 많이를 함께 담으려고 주소 칸의 해석을 맨 앞 비트로 갈랐다.
  맨 앞 세 비트가 111이면 「확장 주소 방식으로 넘긴다」는 표시로 남겨 두었고, 그 방식은 정의하지 않았다 — §3.2 「Addressing」. 그러니 클래스 방식에서 쓸 수 있는 네트워크 크기는 셋뿐이다(RFC 4632 §3.1 — 아래 항목)
- (phase 74) 네트워크 칸의 값 0은 「이 네트워크」를 뜻하고 특정 ICMP 메시지에서만 쓴다 — §3.2 「Addressing」. 첫 옥텟이 0·127인 주소의 지금 쓰임은 아래 RFC 1122 §3.2.1.3 줄과 「(phase 74) IANA」 항목(자세히는 `ip-address-types` — step 5)

쓰인 곳: 강의 수정 이력 L3, L6, 면접 수정 이력 I8, `protocols-encapsulation.packet-switching`, `protocols-encapsulation.tcp-ip-model`, `protocols-encapsulation.pdu-names`, `ethernet.mac-address`(바이트·옥텟의 뜻; `ethernet.frame`에서도 쓰는 단위), (phase 72 step 5) `ethernet.ethertype-length`(IP는 여러 네트워크를 이은 곳에서 데이터그램을 출발지에서 목적지로 나르고 주소를 다룬다 — IPv4·IPv6·IP 주소의 한 줄 풀이, §1.1·§1.2·§2.3),
(phase 73에서 쓰일 곳) `ip-protocol.ip`(§1.4 두 기능·IP 모듈의 자리), `ip-protocol.fragmentation`(§2.3·§3.2 — 게이트웨이도 나누고 목적지가 합친다, DF), `ip-protocol.mtu`(§3.2 — 68옥텟), `ip-protocol.ipv4-header`(§3.1 칸·IHL·전체 길이·헤더 체크섬·프로토콜·서비스 유형·옵션),
`ip-protocol.fragment-fields`(§2.3·§3.1·§3.2 — 식별자·플래그·오프셋, 합치는 기준 넷), `ip-protocol.ttl`(§3.1 — 초 단위 정의와 상한), `exam-notes.md` E10,
(phase 73 step 1에서 쓰일 곳) `icmp.ip-limits`(§1.2·§1.4 — 신뢰성 장치가 없다), `icmp.icmp`(§1.4 — 오류는 ICMP로 알린다), `arp.arp-across-routers`(§2.2 — 구간마다 지역 헤더만 바뀐다), 강의 수정 이력 L34·L35(§2.3 — 32비트 주소는 8비트씩 넷)
(phase 73 step 3) `ip-protocol.ipv4-header`(§3.1 — 버전 칸의 값 4, 헤더 길이 칸이 데이터의 시작을 가리킨다), 문항 n052 해설
(phase 73 step 11) `icmp.ip-limits`(§1.4 — 확인 응답·재전송이 없다, 데이터그램 하나하나를 서로 관계없는 독립된 것으로 다루고 그 사이에 연결이 없다, 찾아낸 오류는 ICMP로 알린다), `icmp.icmp`(§1.4 — 앞 개념에서 본 대로 IP는 받았는지 확인하지 않는다), 문항 n070·n071 해설, 도식 `ip-limits`
(phase 74에서 쓰일 곳) `ip-addressing.network-host`(§2.3 — 네트워크 번호 + 그 네트워크 안의 주소), `ip-addressing.address-classes`(§2.3 — A·B·C의 맨 앞 비트와 네트워크 비트 수, §3.2 — 크기 셋을 담으려는 설계·111은 남겨 둔 표시·네트워크 칸 0), `ip-addressing.cidr`(§3.2 — 클래스가 준 크기는 셋뿐), 강의 수정 이력 L6·L36·L37

## RFC 950 — Internet Standard Subnetting Procedure
https://www.rfc-editor.org/rfc/rfc950

인터넷 표준(STD 5)이다.

- 서브넷 마스크는 32비트 마스크이고, IP 네트워크 번호와 서브넷 번호에 해당하는 자리의 비트를 켠 비트 마스크다 — §2.2, Appendix I
- 예시의 마스크는 255.255.0.0, 255.255.252.0처럼 점으로 구분한 10진수로 적는다 — Appendix II
- 2진수는 주소의 비트 배치를 설명하는 그림(§2.1)과 예시의 서브넷 필드 값을 풀어 보일 때(Appendix II) 쓴다 — 마스크를 적는 형식으로 쓰지 않는다 — §2.1, Appendix II
- (phase 74) 상태: 인터넷 표준(STD 5)이고 폐기되지 않았다. RFC 6918이 고쳤다 — 이 문서가 더한 ICMP 주소 마스크 요청·응답(Appendix I)을 폐기한 것이다(`exam-notes.md` E13). 아래 §2.1·§2.2의 주소 해석과 판정 규칙은 그대로다(rfc-editor 상태, 2026-10-29)
- (phase 74) 서브넷은 인터넷 네트워크 하나를 논리적으로 나눈 부분이다. 조직이 LAN을 여럿 쓰게 되면 네트워크 번호를 여러 개 받는 대신 하나를 서브넷 여럿으로 나눈다 — Overview, §1.
  케이블마다 네트워크 번호를 따로 받으면 조직 안의 연결 사정까지 인터넷 전체의 라우팅 표에 퍼져 표가 커진다 — §1
- (phase 74) 서브넷을 쓰는 네트워크의 주소는 <네트워크 번호><서브넷 번호><호스트 번호>로 읽는다. 서브넷 번호 칸의 폭은 네트워크마다 정하고 한 네트워크 안에서는 같으며, 폭이 0이면 서브넷을 쓰지 않는 것이다.
  호스트 번호 칸은 적어도 1비트다 — §2.1. 예로 B 클래스 네트워크에 6비트 서브넷 칸을 둔 주소 그림(맨 앞 `10` · 네트워크 14비트 · 서브넷 6비트 · 호스트 10비트)을 든다 — §2.1
- (phase 74) 서브넷 칸은 원래 그 네트워크 안의 주소(호스트 쪽) 비트에서 가져온다. 마스크로 가리키므로 떨어져 있어도 되지만, **이어진 비트로 두고 호스트 쪽의 가장 앞(왼쪽) 비트에 둘 것을 권한다** — §2.1
- (phase 74) 주소만 보고 서브넷을 쓰는지 알 수 있게 하는 방식(맨 앞 비트로 클래스를 알리듯 서브넷 칸의 폭도 주소 안에 부호로 넣는 방식)을 택하지 않고, **서브넷 여부와 칸의 폭을 주소와 따로 두는 주소 마스크 방식**을 골랐다.
  조직마다 남은 비트를 서브넷과 호스트에 어떻게 나눌지 고를 수 있기 때문이다 — §2.1. 그러니 서브넷을 쓰면 주소 모양만으로는 네트워크(와 서브넷) 부분이 어디서 끝나는지 알 수 없고 마스크가 함께 있어야 한다
- (phase 74) 특별 주소: 값이 0인 칸은 「이」(이 네트워크), 모든 비트가 1인 칸은 「모두」(모든 호스트)를 뜻한다 — 예로 128.9.255.255는 128.9 네트워크의 모든 호스트다.
  이 해석을 서브넷에도 넓혀, **서브넷 칸이 모두 0이거나 모두 1인 값은 실제 서브넷에 주지 않는다**고 했다(6비트 서브넷 칸이면 0과 63을 뺀다) — §2.1 「Special Addresses」.
  이것이 옛 규칙이다 — RFC 1812 §4.2.2.11 DISCUSSION이 CIDR에서는 이 제한이 뜻이 없어 무시해도 된다고 적었다(아래 RFC 1812 항목)
- (phase 74) 호스트가 데이터그램을 바로 보낼지 게이트웨이로 보낼지 가르는 규칙: 목적지 주소와 자기 주소를 각각 마스크와 **비트마다 AND**해 결과가 같으면 같은 (서브)네트워크라 바로 보내고, 다르면 게이트웨이로 보낸다.
  이때 쓰는 마스크는 네트워크 번호와 서브넷 번호 자리의 비트를 켠 32비트 값이다 — §2.2. 같은 판정을 호스트의 요구 사항으로 정한 것은 RFC 1122 §3.3.1.1(아래 항목)

쓰인 곳: 면접 수정 이력 I5
(phase 73 step 12) `icmp.icmp-message`(§2.2 — 서브넷 마스크는 IP 주소에서 네트워크 번호와 서브넷 번호에 해당하는 자리를 가리키는 마스크 — 한 줄 풀이만)
(phase 74에서 쓰일 곳) `ip-addressing.network-host`(§2.1 — 서브넷을 쓰면 경계는 주소와 따로 둔 마스크가 정한다), `ip-addressing.subnet-mask`(§2.2 — 마스크로 같은 네트워크인지 가른다), `ip-addressing.network-address-calc`(§2.2 — 비트마다 AND),
`ip-addressing.subnetting`(Overview·§1 — 서브넷의 뜻과 까닭, §2.1 — 호스트 쪽 앞 비트를 서브넷 칸으로, 칸의 폭이 정해지면 서브넷 수가 정해진다, 모두 0·모두 1 서브넷을 빼던 옛 규칙), `exam-notes.md`의 「phase 74 step 0」 문단

## RFC 4632 — Classless Inter-domain Routing (CIDR): The Internet Address Assignment and Aggregation Plan
https://www.rfc-editor.org/rfc/rfc4632

BCP 122다.

- 접두사는 IPv4 주소 뒤에 `/`와 0~32의 10진수(접두사 길이, 의미 있는 네트워크 비트 수)를 붙여 적는다. 예: 옛 B 클래스 172.16.0.0은 172.16.0.0/16이다 — §3.1
- /16의 마스크는 앞 16비트가 1이고 뒤 16비트가 0인 32비트 값이고, 점 10진수로는 255.255.0.0이다 — §3.1
- 마스크의 1은 왼쪽부터 끊김 없이 이어져야 한다 — §5.1
- (phase 74) CIDR는 문서 제목대로 Classless Inter-domain Routing의 줄임이다. 이 문서가 처음 CIDR 규격 RFC 1519를 폐기하고 대신한다 — 제목, §1(RFC 1519의 상태는 rfc-editor에서 폐기, 2026-10-29)
- (phase 74) 클래스 셋의 크기: C 클래스 네트워크는 호스트 주소가 최대 254개(8비트로 만들 수 있는 256가지에서 모두 0과 모두 1을 뺀 수), B 클래스는 최대 65534개다 — §2.
  (§2는 A 클래스의 맨 앞 비트를 「00」으로 적었는데 RFC 791 §2.3은 「0」이다. A의 맨 앞 비트는 RFC 791을 따른다)
- (phase 74) CIDR가 나온 까닭: 1980년대 끝 무렵 인터넷에 이어지는 조직이 크게 늘자, IETF의 ROAD 그룹이 1992년 세 문제를 짚었다 — ① B 클래스 네트워크 번호의 고갈(중간 크기 조직에 맞는 클래스가 없었다 — C는 너무 작고 B는 대부분에게 너무 컸다),
  ② 라우터의 라우팅 표가 관리할 수 없을 만큼 커짐, ③ 언젠가 32비트 주소가 다 떨어짐. CIDR는 ①②를 풀려고 만들었고 ③은 풀려고 하지 않았다 — 더 긴 해법이 나올 때까지 버틸 시간을 번다 — §2.
  다만 주소가 쓰이는 속도도 늦춰 ③에도 단기·중기의 여유를 주었다 — §3
- (phase 74) 해법은 A·B·C 클래스로 네트워크 번호를 나눠 주는 방식을 그만두고(deprecate), 접두사(prefix)라 부르는 클래스 없는 주소 블록을 쓰는 것이다 — §3
- (phase 74) 바뀐 것의 핵심은 32비트 주소에서 **어느 비트가 네트워크 번호(접두사)이고 어느 비트가 그 안의 끝 시스템 번호인지를 드러내 적는 것**이다 — §3.1.
  옛 B 클래스 172.16.0.0은 숨은(implied) 마스크가 255.255.0.0이라 172.16.0.0/16이고, 옛 C 클래스 192.168.99.0은 앞 24비트가 1인 마스크라 192.168.99.0/24다 — §3.1
- (phase 74) 예전에는 네트워크 크기가 셋뿐이었지만, 접두사 길이를 드러내 적으면 주소 1개부터 2^32개까지 **2의 거듭제곱 크기라면 어느 블록이든** 가리킬 수 있다 — §3.1.
  그러니 접두사 길이가 n이면 그 블록의 주소는 2^(32−n)개다(계산 — 표준 문장은 아니다. 같은 수를 접두사 길이마다 표로 든 것은 아래 RFC 1878 항목, 역사 기록)
- (phase 74 step 11) 인터넷의 전달은 **가장 긴 일치(longest match)** 를 기준으로 한다 — §5.1 규칙 1
- (phase 74 step 11) 접두사 `0.0.0.0/0`은 **디폴트 라우트**로 쓰이고 모든 구현이 받아들여야 한다(MUST). 다른 라우팅 도메인에는 관리자가 일부러 설정했을 때만 알리고, 설정하지 않아도 저절로 알리는 기본값으로 두지 않는다 — §5.1.
  §3.1의 표도 `0.0.0.0/0`을 「default route」라 적고, 그 블록의 주소 수를 2^32개(모든 주소)로 든다 — §3.1
- (phase 74 step 11) 클래스가 사라져 주소의 맨 앞 비트로 마스크를 짐작할 수 없으므로, 라우팅 프로토콜은 경로마다 마스크(접두사 길이)를 함께 실어 날라야 한다. OSPF·IS-IS·RIPv2·BGP4는 이것을 지원하고,
  옛 프로토콜 — RIP(RFC 1058, 곧 RIPv1)·HELLO·시스코의 IGRP와 옛 외부 프로토콜 EGP(RFC 904) — 는 마스크를 싣지 않아 지금은 낡은 것으로 보고 인터넷에 이어진 중계 네트워크에서 쓰지 말라고 한다 — §5.
  (IGRP는 이름이 여기 한 번 나올 뿐이고, 그것이 어떤 방식의 프로토콜인지는 허용한 출처에 없다 — `exam-notes.md`의 「phase 74 step 11」 문단)

쓰인 곳: 면접 수정 이력 I5
(phase 74에서 쓰일 곳) `ip-addressing.address-classes`(§3 — 클래스로 나눠 주는 방식을 그만뒀다), `ip-addressing.cidr`(제목 — 풀네임, §2 — 나온 까닭, §3 — 클래스 없는 접두사, §3.1 — 경계를 드러내 적는다·표기·2의 거듭제곱 블록),
`ip-addressing.subnet-mask`(§3.1 — 옛 B·C 클래스의 숨은 마스크, §5.1 — 1이 이어진다), `ip-addressing.network-broadcast-address`·`ip-addressing.subnet-sizing`(§2 — C 클래스의 254는 256에서 모두 0과 모두 1을 뺀 수, §3.1 — 블록의 주소 수), 강의 수정 이력 L37
(phase 74 step 11에서 쓰일 곳) `routing.longest-prefix-match`(§5.1 — 전달은 가장 긴 일치), `routing.default-route`(§5.1·§3.1 — `0.0.0.0/0`은 디폴트 라우트, 모든 주소에 맞는다), `routing.rip`(§5 — RIPv1은 마스크를 싣지 않고 RIPv2는 싣는다), `exam-notes.md` E18과 「phase 74 step 11」 문단(IGRP)

## RFC 8200 — Internet Protocol, Version 6 (IPv6) Specification
https://www.rfc-editor.org/rfc/rfc8200

- IPv6는 주소 크기를 32비트에서 128비트로 늘렸다 — §1
- IPv6에서 단편화는 출발지 노드만 하고, 전달 경로의 라우터는 하지 않는다 — §4.5
- IPv4와 달리 IPv6 노드가 보내는 UDP 패킷은 기본적으로 체크섬을 생략할 수 없다. UDP를 터널 캡슐화에 쓰는 프로토콜만 특정 포트에서 0 체크섬을 쓸 수 있다 — §8.1
- (phase 73) 인터넷 표준(STD 86)이고, IETF의 문서다. RFC 2460을 폐기하고 대신한다. RFC 9673이 홉별 옵션 헤더의 처리 절차를 고쳤다(rfc-editor 상태, 2026-10-29)
- (phase 73) IPv6는 IPv4의 **뒤를 잇도록** 만든 새 판 IP다 — §1.
  IPv4에서 달라진 점의 갈래: 주소를 128비트로 늘림(주소 체계의 단계를 늘리고, 훨씬 많은 노드에 주소를 주고, 주소 자동 설정을 쉽게 한다. 애니캐스트라는 새 주소 종류도 정한다), 헤더 형식을 단순하게 함
  (IPv4 헤더의 칸 몇을 없애거나 선택으로 돌려 처리 비용을 줄인다), 확장과 옵션을 담는 방식을 바꿈, 흐름 레이블, 인증·무결성·(선택) 기밀성 확장 — §1
- (phase 73) 용어: 링크 MTU는 링크 하나가 실어 나를 수 있는 패킷의 최대 크기(옥텟)다. 경로 MTU는 출발지와 목적지 사이 경로의 모든 링크 MTU 가운데 가장 작은 값이다. 패킷은 IPv6 헤더에 페이로드를 더한 것이다.
  이웃은 같은 링크에 붙은 노드들이다 — §2
- (phase 73 step 2) 링크는 노드들이 링크 계층(IP 바로 아래 계층)에서 서로 통신하는 통신 수단이나 매체이고, 그 예로 이더넷을 든다 — §2
- (phase 73) 기본 헤더의 칸 여덟과 크기: 버전(Version) 4비트(값 6), 트래픽 클래스(Traffic Class) 8비트, 흐름 레이블(Flow Label) 20비트, 페이로드 길이(Payload Length) 16비트,
  다음 헤더(Next Header) 8비트, 홉 제한(Hop Limit) 8비트, 출발지 주소(Source Address) 128비트, 목적지 주소(Destination Address) 128비트 — §3
- (phase 73) 기본 헤더는 40옥텟이다 — §3 그림의 칸을 더한 값(4+4+16+16)이고, §8.3은 확장 헤더가 없는 IPv6 헤더가 최소 길이 IPv4 헤더(20옥텟)보다 20옥텟 길다고 쓴다.
  기본 헤더에는 헤더 길이 칸이 없고, 옵션은 기본 헤더가 아니라 확장 헤더에 담는다 — §3, §4
- (phase 73) 페이로드 길이는 기본 헤더 **뒤의 나머지 전부**를 옥텟으로 센 값이고, **확장 헤더도 페이로드에 든다** — §3 「Payload Length」
- (phase 73) 다음 헤더 칸은 기본 헤더 바로 뒤에 오는 헤더의 종류를 가리키고, IPv4 프로토콜 칸과 같은 번호를 쓴다 — §3 「Next Header」
- (phase 73) 홉 제한은 패킷을 넘겨주는 노드마다 1씩 줄이고, 넘겨줄 때 받은 값이 0이었거나 줄여서 0이 되면 버린다. 목적지 노드는 홉 제한이 0인 패킷도 버리지 않고 처리한다 — §3 「Hop Limit」
- (phase 73) 기본 헤더에는 **헤더 체크섬이 없다** — §3의 칸 목록에 없고, §8.1은 ICMPv6가 의사 헤더를 체크섬에 넣는 까닭을 「IPv4와 달리 IPv6 헤더의 칸을 덮는 인터넷 계층 체크섬이 없기 때문」이라고 쓴다.
  기본 헤더에는 단편화 칸(식별자·플래그·오프셋)도 없다 — 단편화 정보는 단편화 확장 헤더에 담는다 — §3, §4.5
- (phase 73) 트래픽 클래스 칸(8비트)은 네트워크가 트래픽을 관리하는 데 쓰고, 받은 값이 보낸 값과 다를 수 있다. 지금 쓰임(DS 필드·ECN)은 RFC 2474·RFC 3168이 정한다 — §7.
  옛 이름 Priority(4비트)는 아래 RFC 1883 항목
- (phase 73 step 6) 흐름 레이블 칸(20비트)은 출발지가 네트워크에서 한 흐름으로 다뤄지기를 바라는 패킷들에 붙이는 표시다. 지금 정의는 RFC 6437(아래 항목)이 정한다 — §6
- (phase 73) 확장 헤더: 선택 정보는 기본 헤더와 상위 계층 헤더(TCP 등) 사이에 넣는 **별도의 헤더**에 담는다. 패킷에는 확장 헤더가 없을 수도, 하나일 수도, 여럿일 수도 있고,
  각 헤더는 **앞 헤더의 다음 헤더 칸**이 가리킨다(사슬). 확장 헤더 번호는 IPv4·IPv6가 함께 쓰는 IANA 프로토콜 번호에서 가져온다 — §4
- (phase 73) 홉별 옵션 헤더를 빼면, 경로의 노드는 패킷이 목적지에 닿을 때까지 확장 헤더를 처리하지도 넣거나 빼지도 않는다. 목적지는 확장 헤더를 나온 차례대로 처리한다 — §4
- (phase 73) 확장 헤더는 8옥텟의 정수배 길이다 — §4
- (phase 73) 완전한 IPv6 구현이 갖추는 확장 헤더: 홉별 옵션(Hop-by-Hop Options), 단편화(Fragment), 목적지 옵션(Destination Options), 라우팅(Routing), 인증(Authentication),
  ESP(Encapsulating Security Payload). 뒤의 둘은 RFC 4302·RFC 4303이 정한다 — §4
- (phase 73) 단편화 헤더는 경로 MTU보다 큰 패킷을 보내려고 **출발지가** 쓴다(앞 헤더의 다음 헤더 값 44로 가리킨다). 칸: 다음 헤더 8비트, 예약 8비트, 단편화 오프셋 13비트(8옥텟 단위),
  예약 2비트(Res), M 플래그 1비트(1이면 조각이 더 있다, 0이면 마지막 조각), 식별자 32비트 — §4.5.
  출발지는 나눌 패킷마다 식별자를 정하고, 같은 출발지·목적지 주소로 최근에 보낸 다른 조각난 패킷과 겹치지 않게 한다. 조각은 저마다 따로 보낸 패킷이고 받는 쪽에서 다시 합친다 — §4.5
- (phase 73) 모든 링크는 MTU가 1280옥텟 이상이어야 한다(IPv6 최소 링크 MTU). 1280옥텟 패킷을 통째로 나르지 못하는 링크는 IPv6 아래 계층에서 나누고 합쳐야 한다.
  MTU를 설정할 수 있는 링크는 1500옥텟 이상을 권한다 — §5
- (phase 73) 경로 MTU보다 큰 패킷은 출발지에서 단편화 헤더로 나누고 목적지에서 합칠 수 있지만, 패킷 크기를 경로 MTU에 맞출 수 있는 응용은 이 방법을 쓰지 않는 편이 좋다 — §5
- (phase 73 step 7) 인터페이스(interface)는 노드가 링크에 붙은 지점이다 — §2
- (phase 73 step 7) 단편화 헤더의 다음 헤더 칸은 원래 패킷에서 나눌 부분의 첫 헤더 종류를 가리키고, IPv4 프로토콜 칸과 같은 번호를 쓴다. 예약 칸은 보낼 때 0으로 채우고 받을 때 무시한다 — §4.5.
  원래 패킷의 상위 계층 헤더(TCP 등)는 **첫 조각에만** 단편화 헤더 뒤에 실리고, 둘째 조각부터는 기본 헤더(경로에서 처리해야 할 확장 헤더가 있으면 그것까지) 뒤에 단편화 헤더와 나머지 데이터 조각만 온다 — §4.5 「fragment packets」 그림.
  첫 조각에서는 기본 헤더의 다음 헤더 칸을 44로 바꾼다 — §4.5. 원래 패킷은 출발지 주소·목적지 주소·식별자가 같은 조각끼리만 합친다 — §4.5 재조합 규칙

쓰인 곳: 강의 수정 이력 L4, L5, L10, L33, 면접 수정 이력 I3, I8, (phase 72 step 5) `ethernet.ethertype-length`(IPv6는 주소를 32비트에서 128비트로 늘렸다, §1),
(phase 73에서 쓰일 곳) `ip-protocol.fragmentation`(§4.5 — 출발지만 나눈다), `ip-protocol.mtu`(§2 링크 MTU·경로 MTU, §5 — 1280), `ip-protocol.ipv6`(§1 — 뒤를 잇는 판·달라진 점), `ip-protocol.ipv6-header`(§3·§7·§8.1·§8.3 — 칸 여덟, 40옥텟, 체크섬·단편화 칸 없음),
`ip-protocol.ttl`(§3 — 홉 제한), `ip-protocol.extension-headers`(§4·§4.5), `exam-notes.md` E9,
(phase 73 step 2) `ip-protocol.fragmentation`(§2 — 링크의 뜻과 링크 MTU, §4.5 — IPv6는 출발지만 나눈다), 문항 n050 해설
(phase 73 step 6) `ip-protocol.ipv6-header`(§3 — 칸 여덟과 크기, 버전 값 6, 페이로드 길이에 확장 헤더가 든다, 다음 헤더는 IPv4 프로토콜 칸과 같은 번호, 홉 제한; §6 — 흐름 레이블; §7 — 트래픽 클래스; §8.1 — 헤더 체크섬 없음; §4.5 — 단편화 칸 없음, 출발지가 단편화 헤더를 붙인다; 40옥텟), 도식 `ipv6-header`, 문항 n060 해설
(phase 73 step 7) `ip-protocol.extension-headers`(§4 — 기본 헤더와 상위 계층 헤더 사이의 별도 헤더, 없거나 하나거나 여럿, 앞 헤더의 다음 헤더 칸이 가리키는 사슬, 번호는 IPv4 프로토콜 칸과 같은 목록, 홉별 옵션을 빼면 경로가 처리하지 않음, 목적지가 차례대로 처리, 8옥텟 배수; §4.5 — 출발지가 경로 MTU보다 큰 패킷을 나눠 조각마다 붙인다, 앞 헤더의 값 44, 칸 여섯과 크기, 예약 칸은 0, M 플래그, 식별자 32비트와 겹치지 않게 정하기, 출발지·목적지·식별자가 같은 조각끼리 합침, 상위 계층 헤더는 첫 조각에만), 도식 `extension-chain`, 문항 n061 해설; `ip-protocol.slaac`(§2 — 인터페이스는 노드가 링크에 붙은 지점)
(phase 77 step 7) `tcp-udp.udp-header`(§8.1 — IPv6로 보내는 UDP는 따로 정한 경우(터널 캡슐화)를 빼고 체크섬을 생략할 수 없다)

## RFC 3022 — Traditional IP Network Address Translator (Traditional NAT)
https://www.rfc-editor.org/rfc/rfc3022

- 기본 NAT(Basic NAT)는 사설 주소 묶음을 전역 주소 묶음에 대응시킨다 — §2.1
- NAPT는 (사설 주소, 사설 포트) 짝을 (등록된 주소, 할당한 포트) 짝에 대응시켜, 사설망의 여러 노드가 등록된 주소 **하나**로 바깥과 통신하게 한다 — §2.2, §3.1
- NAT는 IP 주소가 끝에서 끝까지 갖던 의미를 없앤다 — §1
- (phase 74 step 5) 상태: Informational이고 RFC 1631을 폐기·대체했으며 자기는 폐기되지 않았다(rfc-editor 상태, 2026-10-29)
- (phase 74 step 5) 주소 변환이 필요한 것은 한 네트워크의 안쪽 주소를 그 네트워크 밖에서 쓸 수 없을 때다 — 밖에서 유효하지 않은 주소이거나 사생활 때문에 — §1
- (phase 74 step 5) 이 문서의 「전통적 NAT」는 사설망 안의 호스트가 바깥 호스트에 대개 투명하게 닿게 한다. 세션은 사설망에서 바깥으로 시작하는 한 방향이 기본이고, 바깥에서 시작하는 세션은 미리 고른 호스트를 고정으로 대응시켜(static address map) 예외로만 허용한다.
  기본 NAT(Basic NAT)는 IP 주소만, NAPT는 IP 주소와 전송 계층 식별자(TCP/UDP 포트, ICMP 질의 식별자)를 함께 바꾼다. 주소 변환은 사설망과 바깥 경계(stub border)의 라우터에만 둔다 — §2와 Figure 1, §6.2
- (phase 74 step 5) 기본 NAT는 사설 주소 묶음을 전역에서 유효한 주소 묶음에 **동적으로** 대응시킨다. 안쪽 노드가 전역 주소보다 많으면 동시에 바깥에 나갈 수 있는 노드 수가 전역 주소 수로 묶인다.
  안쪽 주소 하나를 특정 전역 주소에 **고정(static)으로** 대응시켜 늘 나갈 수 있게 하거나, 바깥 호스트가 그 고정 공인 주소로 안쪽 호스트에 들어오게 할 수도 있다. 안쪽 주소는 그 도메인 밖에서 유효하지 않으므로 다른 도메인이 같은 주소를 다시 쓸 수 있다 — §2.1
- (phase 74 step 5) 대응(binding)은 사설 호스트가 처음 바깥으로 세션을 시작할 때 정해지고, 같은 사설 주소(NAPT는 같은 (사설 주소, 사설 포트))에서 시작한 뒤의 세션은 그 대응을 다시 쓴다. 대응에 기댄 마지막 세션이 끝나면 대응을 없앨 수 있다 — §3.1, §3.3
- (phase 74 step 5) 바꾸는 칸: 기본 NAT는 **모든 패킷의 IP 헤더**를 고친다 — 나가는 패킷은 출발지 IP 주소, 들어오는 패킷은 목적지 IP 주소와 IP 헤더 체크섬이다. TCP·UDP 체크섬도 IP 주소가 든 의사 헤더를 덮으므로 함께 고친다.
  NAPT는 여기에 TCP/UDP 헤더의 포트(나가는 패킷은 출발지 포트, 들어오는 패킷은 목적지 포트)를 더 바꾼다 — §4.1. 그러니 NAT는 IP 헤더(네트워크 계층)의 주소를 바꾸는 일이고 데이터 링크 계층의 프레임을 바꾸는 일이 아니며, NAPT는 전송 계층 헤더의 포트까지 바꾼다(§4.1과 RFC 1812 §2.2.3을 함께 읽은 것)
- (phase 74 step 5) NAPT를 쓰는 예: 작은 사무실·집(SOHO)의 여러 노드가 서비스 제공자가 라우터에 준 IP 주소 **하나**로 동시에 바깥에 나간다 — §1, §2.2
- (phase 74 step 5) 사생활과 보안: 세션이 사설 호스트에서 바깥으로만 시작되고 **사설 호스트의 실제 주소가 바깥 호스트에 보이지 않으므로** 전통적 NAT를 사생활을 지키는 장치로 볼 수 있다. 같은 성질 때문에 사설망의 호스트가 공격을 해도 출처를 찾기 어렵다 — §6.1.
  경로에 NAT가 있으면 IPsec이 끝과 끝 사이에 보장하는 네트워크 보안을 기대할 수 없다 — §1

쓰인 곳: 강의 수정 이력 L7, (phase 73) 아래 「RFC 7857·RFC 8512」 항목이 NAT44를 이 문서 §2.1의 기본 NAT로 가리킨다
(phase 74에서 쓰일 곳) `ip-address-types.nat`(§1·§2 — 경계 라우터가 안쪽 주소를 바꾼다, §2.1 — 동적·고정 대응, §3.1 — 대응 표, §4.1 — IP 헤더의 주소를 바꾼다, §6.1 — 실제 주소가 바깥에 보이지 않는다), `ip-address-types.napt`(§1·§2.2·§3.1·§4.1 — 포트까지 바꿔 주소 하나를 함께 쓴다),
`ip-address-types.private-address`(§1·§2.1 — 사설 주소로 바깥에 닿게 하는 것이 주소 변환이다), `exam-notes.md` E15

## RFC 1631 — The IP Network Address Translator (NAT) [폐기, RFC 3022로 대체 — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc1631

- NAT(주소 재사용)를 주소 고갈에 대한 **단기** 해법으로 제안했다. 장기 해법은 더 큰 주소를 쓰는 새 인터넷 프로토콜이라고 적었다 — Abstract, §1

쓰인 곳: 강의 수정 이력 L7

## RFC 1918 — Address Allocation for Private Internets
https://www.rfc-editor.org/rfc/rfc1918

- 사설 주소 공간은 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 셋이다 — §3
- 사설 주소는 전역에서 의미가 없으므로, 사설망의 라우팅 정보는 기업 사이 연결로 퍼뜨리지 않는다 — §3
- (phase 74 step 5) 상태: BCP 5이고 RFC 1597·RFC 1627을 대체했으며, RFC 6761이 고쳤다(rfc-editor 상태, 2026-10-29)
- (phase 74 step 5) 세 블록의 범위는 10.0.0.0~10.255.255.255(`10/8`), 172.16.0.0~172.31.255.255(`172.16/12`), 192.168.0.0~192.168.255.255(`192.168/16`)이고, 각각 24비트·20비트·16비트 블록이라 부른다.
  클래스로 보면 첫째는 A 클래스 네트워크 하나, 둘째는 이어진 B 클래스 네트워크 16개, 셋째는 이어진 C 클래스 네트워크 256개다 — §3
- (phase 74 step 5) 사설 주소는 IANA나 인터넷 등록 기관과 협의하지 않고 쓸 수 있어 여러 조직이 함께 쓴다. 그래서 사설 주소는 **그 조직 안에서만**(또는 이 공간을 함께 쓰기로 한 조직들 안에서만) 하나뿐이다 — §3.
  조직 안에서는 겹치지 않아야 하고 조직 사이에서는 겹칠 수 있다는 것은 §2의 호스트 분류(범주 1·2)가 같은 말로 적는다 — §2
- (phase 74 step 5) 전역에서 하나뿐인 주소가 필요한 조직은 인터넷 등록 기관에서 받아야 하고, 바깥과 이어지려고 주소를 신청하면 이 세 블록의 주소는 받지 않는다 — §3.
  인터넷 사업자(ISP)는 주소 등록 기관에서 주소 블록을 받아 그 안에서 고객에게 주소를 나눠 준다 — §2
- (phase 74 step 5) 사설 주소를 쓰는 호스트는 조직 안의 모든 호스트(공인·사설)와 통신하지만 조직 밖 호스트와는 IP로 이어지지 못한다. 응용 계층 게이트웨이 같은 중개 장치로 바깥 서비스에 닿을 수는 있다. 공인 주소를 쓰는 호스트도 다른 조직의 사설 호스트와는 이어지지 않는다 — §3
- (phase 74 step 5) 사설 출발지·목적지 주소를 담은 패킷은 조직 사이 링크로 넘기지 않는 것이 좋고, 사설 주소를 쓰지 않는 망의 라우터, 특히 ISP의 라우터는 사설망의 라우팅 정보를 걸러 내도록 설정한다 — §3
- (phase 74 step 5) 이점: 전역에서 하나뿐일 필요가 없는 곳에 전역 주소를 쓰지 않아 그 주소를 아낀다 — §4
- (phase 74 step 5) 이 문서는 주소 변환(NAT)을 말하지 않는다. 사설 주소로 인터넷에 나가려면 주소를 바꿔야 한다는 근거는 RFC 3022 §1·§2.1이다(그 예가 안쪽에 이 문서의 10.0.0.0/8을 쓴다 — 위 RFC 3022 항목)

쓰인 곳: 강의 수정 이력 L8
(phase 74에서 쓰일 곳) `ip-address-types.private-address`(§3 — 세 블록과 끝 주소, 조직 안에서만 하나뿐, 바깥과 IP로 이어지지 못한다, 라우팅 정보를 걸러 낸다, §4 — 전역 주소를 아낀다), `ip-address-types.public-address`(§2 — ISP가 등록 기관에서 받은 블록을 고객에게 나눠 준다, §3 — 전역 주소는 등록 기관에서 받는다),
강의 수정 이력 L39

## RFC 9293 — Transmission Control Protocol (TCP)
https://www.rfc-editor.org/rfc/rfc9293

- TCP의 신뢰성은 잃은 패킷을 순서 번호로, 오류를 세그먼트마다 붙는 체크섬으로 검출하고, 그것을 재전송으로 바로잡는 것이다 — §2.2
- 확인 응답 번호 필드는 (ACK 비트가 켜져 있을 때) 이 세그먼트를 보낸 쪽이 다음에 받기를 기대하는 순서 번호다 — §3.1
- 체크섬은 의사 헤더(IP 주소·프로토콜·TCP 길이)·TCP 헤더·데이터에 대해 계산한다. 보내는 쪽이 만들고 받는 쪽은 반드시 검사한다(MUST) — §3.1
- 세그먼트는 오류(체크섬 검사 실패)나 혼잡으로 사라질 수 있고, TCP는 재전송으로 모든 세그먼트가 전달되게 한다 — §3.8
- SACK(선택적 확인 응답) 옵션은 자주 쓰이지만 기본 상호 운용에 꼭 필요하지는 않은 선택 옵션이다 — §3.2.1
- 확인 응답은 누적이다. 순서 번호 X를 확인하면 X 바로 앞까지의 옥텟을 모두 받았다는 뜻이다 — §3.4
- 능동적으로 닫은 쪽은 TIME-WAIT 상태에서 2×MSL 동안 머문다 — §3.6.1
- MSS 옵션으로 알릴 값은 실효 MTU에서 고정된 IP 헤더와 TCP 헤더를 뺀 값이다 — §3.7.1
- 기대하는 순서 번호보다 뒤의 세그먼트(순서가 어긋나 먼저 온 세그먼트)는 버리지 말고 나중에 처리하도록 가지고 있어야 한다(SHOULD) — §3.10.7.4
- TCP 세그먼트는 하나하나 IP 데이터그램(인터넷 데이터그램)에 담겨 보내진다 — §2.2, §3.1
- (phase 73 step 12, 2026-10-29 rfc-editor.org 원문) TCP는 포트 번호로 응용 서비스를 가리키고, 호스트 사이의 서로 다른 흐름을 가른다 — §2.2
- (phase 77) 지금 유효한 Internet Standard다(STD 7, RFC 793을 대체 — rfc-editor 상태 2026-11-09). 헤더의 출발지 포트 칸과 목적지 포트 칸은 각각 16비트다 — §3.1.
  16비트로 적을 수 있는 수는 2^16 = 65,536개라 포트 번호는 0~65535다(계산)
- (phase 77) 용어(§4 Glossary): **포트**는 끝점에서 연결들을 가려내는 데 쓰는, 연결 식별자의 한 부분이다. **소켓**은 포트 식별자를 포함한 주소, 곧 인터넷 주소(IP 주소)와 TCP 포트를 이어 붙인 것이고
  소켓 번호·소켓 주소라고도 부른다. **연결**은 소켓 한 쌍이 가리키는 논리적인 통신 경로다 — §4. 같은 말을 본문에서도 쓴다 — 연결은 소켓 한 쌍으로 정해진다 — §3.4.1
- (phase 77) 응용 프로그램이 OPEN을 부를 때 능동(active)인지 수동(passive)인지 정한다. 수동 OPEN은 들어오는 연결 요청을 받겠다는 것이고 그 연결 기록은 LISTEN 상태가 된다. 상대 소켓을 정하지 않은 수동 OPEN은 어느 쪽에서 오는 연결이든 기다린다 — §3.3.2, §3.9.1.1.
  여러 연결을 함께 다루는 구현은, 같은 로컬 포트를 쓰는 다른 연결이 열리는 중이어도 그 포트에서 계속 연결을 기다릴 수 있게 해야 한다(MUST-42) — §3.9.1.1(그러니 서버 포트 하나에 연결 여럿이 함께 걸린다)
- (phase 77 step 3) **바이트 흐름과 세그먼트**: TCP는 응용 프로그램에 믿을 수 있고 순서가 맞는 **바이트 흐름(byte-stream)** 서비스를 준다. 응용이 넘긴 바이트 흐름은 TCP 세그먼트에 나뉘어 실려 가고, 세그먼트 하나가 IP 데이터그램 하나로 보내진다 — §2.2.
  응용의 바이트 흐름을 받아 세그먼트로 꾸리는 일을 segmentation이라 하고, 세그먼트의 경계는 응용이 한 번에 넘긴(쓴) 단위와 맞는다는 보장이 없다 — §3.7. 세그먼트는 TCP 모듈 둘 사이에 오가는 데이터 단위다 — §4 「segment」
- (phase 77 step 3) **연결형·양방향**: TCP는 연결 지향이다. 데이터는 한 연결에서 **두 방향으로** 흐를 수 있다(응용이 한 방향만 써도 된다) — §2.2. 이 문서는 연결을 「전이중(full-duplex) 연결」이라 부르고, 닫기(CLOSE)는 「더 보낼 데이터가 없다」는 뜻이라 **한 방향씩** 다룬다 —
  닫은 쪽도 상대가 닫을 때까지 계속 받는다 — §3.6
- (phase 77 step 3) **헤더의 칸과 길이**(§3.1 그림 1): 출발지 포트 16비트, 목적지 포트 16비트, 순서 번호(Sequence Number) 32비트, 확인 응답 번호(Acknowledgment Number) 32비트, 데이터 오프셋(Data Offset) 4비트, 예약(Reserved) 4비트,
  제어 비트(control bits, 「flags」라고도 부른다) 8개 — 1비트씩, 윈도우(Window) 16비트, 체크섬(Checksum) 16비트, 긴급 포인터(Urgent Pointer) 16비트, 옵션(길이가 바뀐다), 그 뒤에 데이터 — §3.1.
  **TCP 헤더에는 길이 칸이 없다** — 체크섬 계산의 「TCP 길이」(헤더 + 데이터의 옥텟 수)는 보내는 칸이 아니라 계산한 값이다 — §3.1 「TCP Length」
- (phase 77 step 3) **데이터 오프셋과 헤더 길이**: 데이터 오프셋은 TCP 헤더 길이를 **32비트 워드 수**로 적어 데이터가 어디서 시작하는지 가리키고, 헤더는 옵션이 있어도 32비트의 정수배다. 옵션은 데이터 오프셋이 5보다 클 때만 있고 그 크기는 (데이터 오프셋 − 5) × 32비트다 — §3.1.
  옵션이 없는 헤더는 **20옥텟**이다(§3.7.1 「TCPhdrsize」 — 옵션이 없으면 20. 같은 절은 옵션이 없는 경우가 드물다고 적는다). 4비트로 적을 수 있는 가장 큰 값은 15이므로 가장 긴 헤더는 15 × 4 = **60옥텟**, 옵션은 많아야 40옥텟이다(계산)
- (phase 77 step 3) **예약**: 앞으로 쓰려고 남겨 둔 제어 비트이고, 보낼 때는 0으로 두며 받을 때 그 기능을 구현하지 않았으면 무시한다 — §3.1 「Reserved」. **제어 비트의 할당은 IANA의 「TCP Header Flags」 레지스트리가 맡고**, 이 문서(2022)가 「지금 할당된」 것으로 드는 것은 CWR·ECE·URG·ACK·PSH·RST·SYN·FIN 여덟이다 — §3.1.
  레지스트리는 2026-04-24에 비트 7을 AE로 할당했다 — 아래 「(phase 77 step 3) RFC 3540 …」 항목
- (phase 77 step 3) **윈도우**: 확인 응답 번호가 가리키는 옥텟부터 시작해, 이 세그먼트를 보낸 쪽(데이터를 받는 쪽)이 **더 받을 준비가 된 데이터 옥텟 수**다. 부호 없는 수로 다룬다 — §3.1. 이 값은 그 연결에 지금 쓸 수 있는 버퍼 공간과 관련된다 — §3.8.6
- (phase 77 step 3) **체크섬**: 헤더와 데이터의 16비트 단어를 1의 보수로 더한 합의 1의 보수이고, 계산할 때 체크섬 칸 자신은 0으로 둔다. 헤더 앞에 있다고 치는 **의사 헤더**도 덮는다 — IPv4는 96비트(출발지 주소, 목적지 주소, 0, IP 헤더의 프로토콜 번호, TCP 길이), IPv6는 320비트(RFC 8200 §8.1).
  의사 헤더를 넣는 까닭은 엉뚱한 곳으로 간 세그먼트를 걸러 내기 위해서다. TCP 체크섬은 **선택이 아니다** — 보내는 쪽이 반드시 만들고 받는 쪽이 반드시 검사한다 — §3.1 「Checksum」
- (phase 77 step 3) **긴급 포인터**: 이 세그먼트의 순서 번호로부터의 오프셋으로, 긴급 데이터 **바로 다음** 옥텟의 순서 번호를 가리킨다. **URG 비트가 켜진 세그먼트에서만** 해석한다 — §3.1 「Urgent Pointer」, §4 「urgent pointer」.
  새 응용은 긴급 기능을 쓰지 않는 것이 좋다(SHLD-13, 구현마다 해석이 달라서) — §3.8.5
- (phase 77 step 5, 2026-11-09 rfc-editor.org 원문) **긴급 데이터**: 긴급 기능은 보내는 쪽 사용자(응용)가 받는 쪽 사용자에게 어떤 긴급 데이터를 받아 가도록 재촉하고, 받는 쪽 TCP가 지금까지 알려진 긴급 데이터를 사용자가 다 받았을 때 알리게 하려는 것이다.
  데이터 흐름의 한 지점을 긴급 정보의 끝으로 지정하고, URG가 켜져 있으면 긴급 칸 값을 세그먼트의 순서 번호에 더해 긴급 포인터를 얻는다. URG가 없으면 아직 남은 긴급 데이터가 없다는 뜻이다 — §3.8.5
- (phase 77 step 3) **순서 번호**: 연결로 보내는 데이터의 **옥텟(바이트)마다** 순서 번호가 있고, 세그먼트 안에서는 헤더 바로 뒤 첫 데이터 옥텟이 가장 작은 번호이고 뒤로 하나씩 늘어난다 — §3.4. 헤더의 순서 번호 칸은 **그 세그먼트의 첫 데이터 옥텟의 번호**다.
  **SYN이 켜져 있으면 예외** — 그때 칸의 값은 초기 순서 번호(ISN)이고 첫 데이터 옥텟은 ISN + 1이다 — §3.1 「Sequence Number」
- (phase 77 step 3) **SYN·FIN도 번호를 쓴다**: 제어 정보 가운데 순서 번호 공간을 차지하는 것은 SYN과 FIN 둘뿐이다. SYN은 그 세그먼트의 첫 데이터 옥텟 **앞**에, FIN은 마지막 데이터 옥텟 **뒤**에 있다고 친다. 세그먼트 길이(SEG.LEN)는 데이터와 SYN·FIN을 함께 센다 — §3.4, §4 「SYN」·「FIN」·「segment length」.
  ACK·RST·PSH·URG는 순서 번호를 차지하지 않는다 — §4 「ACK」·「RST」·「PUSH」·「URG」
- (phase 77 step 3) **순서 번호 공간**: 0부터 2^32 − 1까지이고 산술은 2^32를 법으로 한다. 그래서 번호는 2^32 − 1 다음에 **다시 0으로 돌아간다** — §3.4
- (phase 77 step 3) **ISN**: 연결을 새로 만들 때마다 ISN 생성기가 새 32비트 ISN을 고르고, 경로 밖의 공격자가 맞히지 못하게 고른다 — §3.4.1, §4 「ISN」. 그러니 본문의 ISN 값(예: 5000)은 사실이 아니라 예시 값이다.
  계산 예: ISN이 5000이면 SYN 세그먼트의 순서 번호는 5000이고 첫 데이터 바이트는 5001이다. 데이터 3,000바이트를 1,000바이트씩 세 세그먼트로 보내면 순서 번호는 5001·6001·7001이다(§3.1·§3.4로 계산 — 연결을 맺는 세그먼트에 데이터를 싣지 않은 경우)
- (phase 77 step 3) **확인 응답 번호**: ACK 비트가 켜져 있을 때만 뜻이 있고, 연결이 맺어진 뒤에는 **늘** 보낸다 — §3.1 「Acknowledgment Number」, §3.8(ESTABLISHED 상태부터는 모든 세그먼트가 지금의 확인 정보를 싣는다).
  ACK는 「이 세그먼트를 보낸 쪽이 다음에 받기를 기대하는 번호」를 확인 응답 칸이 담고 있다는 뜻이고, 그래서 그 앞 번호를 모두 받았다는 확인이 된다 — §4 「ACK」.
  재전송 큐의 세그먼트는 **순서 번호 + 길이**가 들어온 확인 값 이하이면 모두 확인된 것이다 — §3.4. 그러니 데이터만 실은 세그먼트를 다 받았을 때의 확인 응답 번호는 **받은 순서 번호 + 데이터 바이트 수**다(SYN·FIN이 있으면 하나씩 더한다).
  계산 예: 순서 번호 5001인 세그먼트의 데이터 1,000바이트를 받으면 6001, 위 세 세그먼트를 차례로 받으면 6001·7001·8001
- (phase 77 step 3) **확인을 기다리지 않고 여러 세그먼트를 보낸다**: 윈도우는 데이터를 받는 쪽이 지금 받을 준비가 된 순서 번호의 범위이고, 보내는 쪽은 보낼 데이터를 **지금 윈도우에 맞는 세그먼트들**로 꾸린다 — §3.8.6.
  새로 보낼 수 있는 순서 번호는 SND.NXT부터 SND.UNA + SND.WND − 1까지다(SND.UNA는 아직 확인받지 못한 가장 오래된 번호) — §4 「send window」. 곧 확인받지 못한 데이터가 있어도 윈도우 안이면 더 보낼 수 있다.
  윈도우를 작게 알리면 새 세그먼트마다 왕복 시간을 기다리게 될 수 있다 — §3.8.6. 확인을 기다리지 않고 보낼 수 있는 양에는 혼잡 윈도우도 상한을 건다 — RFC 5681 §2·§3.1(위 항목)
- (phase 77 step 3) **세그먼트마다 확인하지 않아도 된다**: 데이터 세그먼트를 받는 쪽은 받은 세그먼트 수보다 적은 수의 ACK를 보낼 수 있고(지연 ACK, 구현하는 것이 좋다 — SHLD-18), 다만 0.5초보다 늦추면 안 되고(MUST-40) 최대 크기 세그먼트 둘마다는 ACK를 하나 보내는 것이 좋다(SHLD-19) — §3.8.6.3
- (phase 77 step 3) **제어 비트의 뜻**(§3.1, §4): CWR(Congestion Window Reduced)·ECE(ECN-Echo)는 RFC 3168을 따른다(아래 항목). URG — 긴급 포인터 칸이 유효하다. ACK — 확인 응답 칸이 유효하다.
  PSH — push 기능: 응용이 데이터를 받는 쪽에 바로 보내 달라고 하면 그 데이터로 만든 마지막 세그먼트에 켠다(§3.9.1.2). 이 세그먼트의 데이터를 받는 사용자(응용)에게 밀어 올려야 한다는 표시다(§4 「PUSH」). 받는 쪽이 응용에 PSH를 알려 주는 것은 선택이다(MAY-17, §3.9.1.3).
  RST — 연결을 재설정한다: 받은 쪽은 더 주고받지 않고 연결을 지운다(§4 「RST」). 지금 연결 앞으로 온 것이 아닌 세그먼트에 RST로 답하고, 없는 연결로 온 SYN도 RST로 거절하며, 사용자(응용)가 언제든 RST를 낼 수 있다 — §3.5.2.
  SYN — 연결을 시작할 때 순서 번호가 어디서 시작하는지 알린다(§4 「SYN」). FIN — 보낸 쪽이 더 보낼 데이터가 없다(§3.1, §4 「FIN」) — 위 「연결형·양방향」 줄대로 한 방향을 닫는 것이다
- (phase 77 step 6) **제어 비트 이름의 영문**(2026-11-09 rfc-editor.org 텍스트판 원문): §3.1은 비트마다 URG — Urgent pointer field is significant, ACK — Acknowledgment field is significant, PSH — Push function, RST — Reset the connection, SYN — Synchronize sequence numbers, FIN — No more data from sender로 적고,
  §4 용어집은 ACK를 「control bit (acknowledge)」, FIN을 「control bit (finis)」, RST를 「control bit (reset)」, URG를 「control bit (urgent)」로, PSH를 「PUSH」 항목으로 적는다. 그래서 목록 항목의 괄호에는 Urgent·Acknowledgment·Push·Reset·Synchronize·Finis를 쓴다.
  같은 §3.1은 확인 응답 번호 칸이 ACK가 켜졌을 때만 값을 담는다고 적는다(위 「확인 응답 번호」 줄). §3.10.7은 ACK가 꺼진 세그먼트를 상태마다 다르게 다룬다(동기화된 상태에서는 그 세그먼트를 버린다 — §3.10.7.4 「fifth, check the ACK field」) — 그래서 문항은 「ACK가 꺼진 세그먼트의 칸을 읽지 않는다」 대신 「연결이 맺어진 뒤 데이터 세그먼트도 ACK를 켠다」를 묻는다
- (phase 77 step 3) **흐름 제어와 혼잡 제어(이름만)**: 윈도우로 받는 쪽이 받을 양을 알린다 — §3.1·§3.8.6. TCP 끝점은 혼잡이 무너지는 상황을 막으려고 기본 혼잡 제어(slow start·congestion avoidance)와 재전송 시간의 지수 증가를 반드시 구현한다(MUST-19), ECN은 구현하는 것이 좋다(SHLD-8) — §3.8.2.
  방식은 phase 84의 몫이다
- (phase 77 step 3) **MSS 옵션**: 종류(kind) 2, 길이 4옥텟, 값 16비트이고, 그 세그먼트를 보낸 끝점이 **받을 수 있는** 가장 큰 세그먼트 크기를 알린다. **SYN이 켜진 세그먼트(연결 요청)에만** 실을 수 있고 다른 세그먼트에 실으면 안 된다(MUST-65).
  이 옵션을 쓰지 않으면 어떤 세그먼트 크기든 허용된다 — §3.2. 끝점은 MSS 옵션을 보내고 받는 것을 모두 구현해야 한다(MUST-14) — §3.7.1. EOL·NOP·MSS 세 옵션은 반드시 지원한다(MUST-4) — §3.1
- (phase 77 step 3) **MSS 기본값**: 연결을 맺을 때 MSS 옵션을 받지 못하면 보내는 MSS를 IPv4는 **536**(576 − 40), IPv6는 **1220**(1280 − 60)으로 본다(MUST-15). 받는 MSS가 이 기본값과 다르면 모든 SYN에 MSS 옵션을 싣는 것이 좋다(SHLD-5) — §3.7.1.
  576은 IPv4 호스트가 재조합할 수 있어야 하는 최소 크기(RFC 1122 §3.3.2 — 위 항목), 1280은 IPv6의 최소 링크 MTU(RFC 8200 §5 — 위 항목)이고, 40과 60은 옵션 없는 IP 헤더(IPv4 20 또는 IPv6 40)에 TCP 헤더 20을 더한 값이다(계산)
- (phase 77 step 3) **MSS 계산 예**: MSS 옵션으로 알릴 값은 실효 MTU에서 고정 IP 헤더와 TCP 헤더를 뺀 값이다(§3.7.1 — 위 줄). 이더넷의 MTU 1500옥텟(RFC 1191 §7 표 7-1, IEEE 802.3 그림 3–1 — 위 항목),
  옵션 없는 IPv4 헤더 20옥텟(RFC 791 §3.1 — 위 항목), 옵션 없는 TCP 헤더 20옥텟(§3.7.1)이면 1500 − 20 − 20 = **1460**옥텟이다(계산)
- (phase 77 step 3) **MSS와 단편화**: 경로에서 가장 작은 MTU보다 큰 IP 데이터그램이 되는 세그먼트를 보내면 패킷을 잃거나 단편화가 일어나므로, 세그먼트를 그보다 작게 보내려 한다 — §3.7. TCP는 바로 이어진 링크의 MTU는 알아도 경로 전체의 MTU는 잘 모르므로,
  경로 MTU 탐색(PMTUD·PLPMTUD)으로 단편화를 피하는 세그먼트 크기를 고르는 것을 강하게 권한다 — §3.7.2. MSS 옵션은 상대가 **받을 수 있는** 패킷 크기의 상한을 알리는 것이다 — §3.7.2.
  그러니 「MSS를 지키면 단편화를 피한다」는 **양 끝 링크의 MTU에 대해서만** 맞고, 경로 중간의 더 작은 MTU는 경로 MTU 탐색이 맡는다
- (phase 77 step 9, 2026-11-10 rfc-editor.org 텍스트판 원문) **이름**: 연결을 맺는 절차의 이름 three-way handshake(줄여 3WHS)는 표준에 있다 — §3.4.1, §3.5. 연결을 끝내는 절차는 「정상 종료 순서(normal close sequence)」(그림 12)나 「FIN을 주고받는 handshake(FIN handshake)」로 부른다 — §3.6.
  **「four-way handshake」·「4-way handshake」라는 말은 RFC 9293 전문에 없다**(전문 검색, 2026-11-10)
- (phase 77 step 9) **세 번 주고받는 까닭**: 연결을 맺는다는 것은 두 끝이 서로의 ISN을 맞추는(synchronize) 일이다. 각 끝은 자기 ISN을 보내 상대의 확인을 받아야 하고, 상대의 ISN을 받아 확인을 돌려줘야 한다.
  그러면 「A의 SYN → B의 확인 → B의 SYN → A의 확인」 넷이 필요한데, 가운데 둘(B의 확인과 B의 SYN)을 세그먼트 하나에 함께 실을 수 있어 셋이 되고, 그래서 three-way(three message) handshake라 부른다 — §3.4.1.
  첫 SYN을 받은 쪽은 그것이 지금의 요청인지 네트워크에 남아 있던 옛 요청인지 스스로 알 길이 없으므로(순서 번호는 공통의 시계에 묶여 있지 않고 ISN을 고르는 방법도 구현마다 다르다) 보낸 쪽에게 확인받아야 한다 — §3.4.1.
  표준은 이 절차의 주된 까닭을 옛 연결 요청이 중복으로 닿아 생기는 혼란을 막는 것이라 적는다 — §3.5
- (phase 77 step 9) **세그먼트 셋의 차례**(§3.5 그림 6 — 그림의 상태는 그 세그먼트를 보내거나 받은 **뒤**의 상태다): ① CLOSED이던 A가 SYN만 켠 세그먼트(순서 번호 = A의 ISN)를 보내고 SYN-SENT가 된다. LISTEN이던 B는 이것을 받고 SYN-RECEIVED가 된다
  ② B가 SYN과 ACK를 함께 켠 세그먼트(순서 번호 = B의 ISN, 확인 응답 번호 = A의 ISN + 1)를 보낸다. A는 이것을 받고 ESTABLISHED가 된다 ③ A가 ACK만 켠 빈 세그먼트(순서 번호 = A의 ISN + 1, 확인 응답 번호 = B의 ISN + 1)를 보내고, B는 이것을 받고 ESTABLISHED가 된다.
  확인 응답 번호가 ISN + 1인 것은 SYN이 순서 번호 하나를 차지하기 때문이고, ACK는 번호를 차지하지 않으므로 A가 셋째 세그먼트 뒤에 처음 보내는 데이터 세그먼트도 순서 번호가 ISN + 1이다 — §3.5(그림 6의 예는 A의 ISN 100, B의 ISN 300, 확인 응답 번호 101·301).
  그러니 **먼저 SYN을 보낸 A가 B보다 먼저 ESTABLISHED가 된다**(그림 6 셋째 줄 — 그때 B는 아직 SYN-RECEIVED다). 계산 예(guide 「예시 값」): 클라이언트 ISN 1000, 서버 ISN 7000이면 둘째 세그먼트의 확인 응답 번호는 1001, 셋째 세그먼트는 순서 번호 1001·확인 응답 번호 7001이다(계산)
- (phase 77 step 9) **능동 열기와 수동 열기**: 응용의 OPEN 호출이 능동(active)이면 TCP가 곧바로 연결을 맺기 시작해 SYN을 보내고 SYN-SENT가 되고, 수동(passive)이면 TCB를 만들어 LISTEN에서 요청을 기다린다 — §3.3.2 그림 5, §3.9.1.1(위 「(phase 77)」 줄).
  두 끝이 동시에 SYN을 보내는 동시 열기도 표준이 정해 두었지만(§3.5 그림 7, MUST-10) 이 과목은 쓰지 않는다
- (phase 77 step 9) **닫기는 한 방향씩**: 응용이 CLOSE를 부르는 것은 「이쪽은 더 보낼 데이터가 없다」는 뜻이지 「더 받지 않겠다」는 뜻이 아니다. 닫은 쪽도 상대가 닫았다는 알림을 받을 때까지 계속 받는다 — §3.6, §3.9.1.4.
  두 방향은 따로 닫히므로 한 방향만 닫힌 연결(half closed)이 생길 수 있고, 아직 열린 방향으로는 데이터를 계속 보낼 수 있다 — §3.6.1. FIN을 받은 쪽은 그 FIN에 ACK는 바로 보내지만, 자기 FIN은 자기 응용이 CLOSE를 부를 때까지 보내지 않는다 — §3.6 경우 1·2
- (phase 77 step 9) **정상 종료의 차례**(§3.6 그림 12): ① 응용이 닫은 A가 FIN을 보내고 FIN-WAIT-1 ② 받은 B가 ACK를 보내고 응용에게 상대가 닫는다고 알린 뒤 CLOSE-WAIT ③ ACK를 받은 A는 FIN-WAIT-2 ④ B의 응용이 CLOSE를 부르면 B가 남은 데이터 뒤에 FIN을 보내고 LAST-ACK
  ⑤ 받은 A가 ACK를 보내고 TIME-WAIT ⑥ 그 ACK를 받은 B는 CLOSED, A는 2×MSL을 기다린 뒤 CLOSED. 그림 12의 FIN 세그먼트에도 ACK 비트가 켜져 있다(`CTL=FIN,ACK`) — 연결이 맺어진 뒤에는 모든 세그먼트가 ACK를 켠다(위 「(phase 77 step 3) 확인 응답 번호」 줄)
- (phase 77 step 9) **상대의 ACK와 FIN이 한 세그먼트로 올 수 있다**: FIN-WAIT-1에서 FIN을 받았을 때 내 FIN도 이미 확인되었으면(그 확인이 같은 FIN 세그먼트에 실려 와도 된다) FIN-WAIT-2를 거치지 않고 곧바로 TIME-WAIT로 간다 — §3.10.7.4 「eighth, check the FIN bit」, 그림 5 주 2.
  그 경우 종료에 오가는 세그먼트는 셋이다(계산)
- (phase 77 step 9) **정상 종료와 중단**: 연결이 끝나는 길은 FIN을 주고받는 정상 종료와, RST를 보내 연결 상태를 곧바로 버리는 중단(abort) 둘이다. 상대 쪽 때문에 연결이 닫히면 응용에 정상 종료인지 중단인지 알려야 한다(MUST-12) — §3.6.
  응용의 ABORT 호출은 보내고 받으려던 것을 모두 버리고 TCB를 지운 뒤 RST를 보낸다 — §3.9.1.6. 올바른 RST를 받은 쪽은 연결을 중단하고 CLOSED로 간다(LISTEN이면 무시하고, 수동 열기로 SYN-RECEIVED가 된 것이면 LISTEN으로 돌아간다) — §3.5.3
- (phase 77 step 9) **상태 열하나와 CLOSED**: 상태는 LISTEN, SYN-SENT, SYN-RECEIVED, ESTABLISHED, FIN-WAIT-1, FIN-WAIT-2, CLOSE-WAIT, CLOSING, LAST-ACK, TIME-WAIT와 CLOSED다. CLOSED는 TCB가 없는 때, 곧 연결이 없는 때를 나타내므로 표준은 이것을 실제로 있지 않은(fictional) 상태라 부른다 — §3.3.2.
  TCB(Transmission Control Block)는 연결 하나의 상태를 적어 두는 자료 구조이고, 양 끝의 IP 주소·포트 번호와 순서 번호 변수 등을 담는다 — §3.3.1, §4 「TCB」. 상태를 바꾸는 사건은 응용의 호출(OPEN·SEND·RECEIVE·CLOSE·ABORT·STATUS), 들어온 세그먼트(특히 SYN·ACK·RST·FIN을 켠 것), 시간 초과다 — §3.3.2
- (phase 77 step 9) **상태마다 기다리는 것**(§3.3.2 — 직접 쓴 말): LISTEN — 어느 상대에게서든 올 연결 요청. SYN-SENT — 연결 요청을 보낸 뒤 그에 맞는 상대의 연결 요청. SYN-RECEIVED — 요청을 받고 자기 요청도 보낸 뒤, 자기 요청에 대한 확인.
  ESTABLISHED — 기다리는 것이 아니라 연결이 열린 상태다. 받은 데이터를 응용에 넘길 수 있고, 데이터를 주고받는 동안 머무는 보통의 상태다.
  FIN-WAIT-1 — 상대의 종료 요청이나, 앞서 보낸 내 종료 요청에 대한 확인. FIN-WAIT-2 — 상대의 종료 요청. CLOSE-WAIT — 자기 응용의 종료 요청. CLOSING — 내 종료 요청에 대한 상대의 확인. LAST-ACK — 앞서 상대에게 보낸 종료 요청(상대의 종료 요청에 대한 확인도 함께 실은 것)에 대한 확인.
  TIME-WAIT — 상대가 마지막 확인을 받았다고 믿을 만큼, 그리고 옛 연결의 늦은 세그먼트가 새 연결에 끼어들지 않을 만큼 시간이 지나기. CLOSED — 연결 상태가 전혀 없음
- (phase 77 step 9) **상태 이름의 표기**: 본문과 상태 목록은 하이픈으로 잇는다(SYN-RECEIVED, FIN-WAIT-1). 상태 그림(그림 5)에서는 몇 이름을 줄이거나 달리 이어 쓴다고 표준 스스로 밝힌다 — 그림에는 SYN RCVD, ESTAB, FINWAIT-2로 적힌다 — §3.3.2.
  밑줄 표기(SYN_RECEIVED 등)는 운영체제 명령이 보이는 표기다 — 아래 「(phase 74 step 11) … netstat」 항목의 「(phase 77 step 9)」 줄. **CLOSE는 상태가 아니라 응용이 연결을 닫을 때 부르는 호출의 이름**이고 상태 이름은 CLOSED다 — §3.3.2, §3.9.1.4
- (phase 77 step 9) **연결을 맺는 동안의 전이**(§3.3.2 그림 5와 §3.10의 처리 절): CLOSED → 수동 열기(TCB를 만든다) → LISTEN. CLOSED → 능동 열기(SYN을 보낸다) → SYN-SENT. LISTEN → SYN을 받아 SYN·ACK를 보낸다 → SYN-RECEIVED(§3.10.7.2).
  SYN-SENT → 내 SYN을 확인하는 SYN·ACK를 받아 ACK를 보낸다 → ESTABLISHED(§3.10.7.3). SYN-RECEIVED → 내 SYN에 대한 받아들일 만한 ACK를 받는다(보내는 것 없음) → ESTABLISHED(§3.10.7.4 「fifth, check the ACK field」).
  LISTEN → 응용이 CLOSE를 부른다 → TCB를 지우고 CLOSED(§3.10.4)
- (phase 77 step 9) **연결을 끊는 동안의 전이**(§3.3.2 그림 5와 §3.10의 처리 절): ESTABLISHED → 응용이 CLOSE를 부른다(앞서 맡긴 데이터를 다 세그먼트로 만든 뒤 FIN을 보낸다) → FIN-WAIT-1(§3.10.4). FIN-WAIT-1 → 내 FIN의 ACK를 받는다 → FIN-WAIT-2(§3.10.7.4 fifth).
  FIN-WAIT-1 → FIN을 받아 ACK를 보낸다, 내 FIN은 아직 확인되지 않았다 → CLOSING. FIN-WAIT-1 → FIN을 받아 ACK를 보낸다, 내 FIN도 확인되었다 → TIME-WAIT. FIN-WAIT-2 → FIN을 받아 ACK를 보낸다 → TIME-WAIT(이 셋은 §3.10.7.4 eighth).
  CLOSING → 내 FIN의 ACK를 받는다 → TIME-WAIT(fifth). ESTABLISHED → FIN을 받아 ACK를 보내고 응용에 알린다 → CLOSE-WAIT(eighth). CLOSE-WAIT → 응용이 CLOSE를 부른다(앞서 맡긴 데이터 뒤에 FIN을 보낸다) → LAST-ACK(§3.10.4).
  LAST-ACK → 내 FIN의 ACK를 받는다 → TCB를 지우고 CLOSED(fifth). TIME-WAIT → 2×MSL이 다 된다 → TCB를 지우고 CLOSED(§3.10.8). CLOSE-WAIT는 자기 응용이 CLOSE를 부를 때까지 머무는 상태다 — §3.3.2, §3.6 경우 2
- (phase 77 step 9) **동시 종료**(§3.6 그림 13, 경우 3): 두 응용이 거의 함께 닫으면 양쪽이 FIN을 보내 FIN-WAIT-1 → 상대의 FIN을 받아 ACK를 보내고 CLOSING → 내 FIN의 ACK를 받아 TIME-WAIT → 2×MSL 뒤 CLOSED. **이때는 두 쪽 모두 TIME-WAIT를 거친다.**
  한쪽이 먼저 닫는 정상 종료(그림 12)에서는 먼저 닫은 쪽만 TIME-WAIT를 거치고, 나중에 닫은 쪽은 LAST-ACK에서 바로 CLOSED로 간다. RST를 보낸 쪽도 TIME-WAIT에 드는 것이 좋다는 규정(§3.5.2, 그림 5 주 3)은 이 과목이 쓰지 않는다
- (phase 77 step 9) **TIME-WAIT의 두 까닭**: TIME-WAIT는 상대가 내 마지막 ACK(상대 FIN에 대한 확인)를 받았다고 믿을 만큼, 그리고 옛 연결에서 늦게 온 세그먼트가 새 연결에 영향을 주지 않을 만큼 시간이 지나기를 기다리는 상태다 — §3.3.2.
  TIME-WAIT에 들어오는 것은 상대 FIN의 재전송뿐이고, 받으면 ACK를 다시 보내고 2×MSL을 처음부터 다시 잰다 — §3.10.7.4 fifth·eighth(마지막 ACK가 사라졌을 때의 처리다).
  연결은 소켓 한 쌍으로 정해지고 같은 소켓 쌍으로 연결을 다시 맺을 수 있으므로, 옛 연결의 중복 세그먼트를 새 연결과 가려내야 하는 문제가 생긴다. TIME-WAIT는 같은 연결을 다시 쓰는 빈도를 제한해 이를 막고, ISN을 고르는 방법이 거기에 보호를 더한다 — §3.4.1.
  능동적으로 닫은 쪽이 2×MSL 동안 머무는 것은 의무다(MUST-13) — §3.6.1(위 줄)
- (phase 77 step 9) **MSL**(Maximum Segment Lifetime): 세그먼트 하나가 인터넷 안에 머물 수 있는 가장 긴 시간이고, 표준은 이것을 2분으로 정해 두었다 — §4 「MSL」, §3.4.2. 2분은 설계상 고른 값이라 겪어 보고 바꿀 수 있다고 적고, 링크가 빨라지면서 인터넷의 실제 MSL은 줄었다고 적는다 — §3.4.2.
  표준의 값대로면 2×MSL은 4분이다(계산). 운영체제가 실제로 쓰는 TIME-WAIT의 길이는 허용한 출처에서 찾지 못했다 — tcp(7)은 TIME_WAIT 소켓 수의 상한 같은 것은 적지만 길이는 적지 않고, tcp_fin_timeout(기본 60초)은 마지막 FIN을 기다리는 시간이다(2026-11-10)

쓰인 곳: 강의 수정 이력 L9, L12, L13, 면접 수정 이력 I2, `protocols-encapsulation.osi-model`, `protocols-encapsulation.tcp-ip-model`, `protocols-encapsulation.encapsulation`, `protocols-encapsulation.pdu-names`
(phase 73 step 11) `icmp.ip-limits`(§2.2 — 사라진 데이터를 알아채 재전송한다, §3.10.7.4 — 순서가 어긋나 먼저 온 세그먼트를 가지고 있다가 차례대로 처리한다), `icmp.icmp`(신뢰성은 전송 계층의 TCP 같은 프로토콜이 맡는다), 문항 n070·n071 해설
(phase 73 step 12) `icmp.destination-unreachable`(§2.2 — 포트 번호는 한 호스트 안에서 데이터를 받을 응용 프로그램을 가리킨다)
(phase 74 step 5에서 쓰일 곳) `ip-address-types.napt`(§2.2 — 포트는 한 호스트 안의 어느 응용 프로그램의 통신인지 가리키는 번호: NAPT가 바꾸는 포트를 한 줄로 풀 때)
(phase 77에서 쓰일 곳) `ports.port-number`(§2.2 — TCP는 포트 번호로 응용 서비스를 가리킨다, §3.1 — 포트 칸 16비트라 0~65535), `ports.client-server-ports`(§4 — 소켓은 IP 주소와 포트를 이은 것, 연결은 소켓 한 쌍이 가리킨다, §3.4.1, §3.3.2·§3.9.1.1 — 서버는 수동 OPEN으로 LISTEN, 한 로컬 포트에 연결 여럿)
(phase 77 step 3에서 쓰일 곳) `tcp-udp.tcp`(§2.2 — 바이트 흐름·세그먼트·연결형·양방향·신뢰성, §3.7 — 세그먼트로 꾸리기, §3.6 — 전이중, §3.8.6 — 윈도우 안에서 여러 세그먼트, §3.8.6.3 — 지연 ACK, §3.8.2 — 혼잡 제어 이름만),
`tcp-udp.mss`(§3.2 — SYN에만 싣는다, §3.7.1 — 기본값 536·1220, 1500 − 20 − 20 = 1460, §3.7·§3.7.2 — 단편화와 경로 MTU 탐색), `tcp-udp.tcp-header`(§3.1 — 칸과 길이, 데이터 오프셋, 20·60옥텟, 예약, 윈도우, 체크섬과 의사 헤더, 긴급 포인터, 옵션, 길이 칸 없음),
`tcp-udp.sequence-number`(§3.1·§3.4 — 바이트마다 번호, 첫 데이터 바이트, SYN이면 ISN이고 데이터는 ISN + 1, SYN·FIN이 번호 하나씩, 2^32에서 0으로, §3.4.1 — ISN은 연결마다 예측할 수 없게), `tcp-udp.ack-number`(§3.1·§3.4·§3.8·§4 — ACK가 켜졌을 때만, 늘 보낸다, 순서 번호 + 길이),
`tcp-udp.tcp-control-bits`(§3.1·§3.5.2·§3.6·§3.9.1.2·§4 — 여덟 비트의 뜻, 할당은 IANA 레지스트리), 강의 수정 이력 L44·L45·L46·L47, `exam-notes.md` E29
(phase 77 step 5) `tcp-udp.tcp-header`(§3.8.5 — 긴급 데이터는 보내는 쪽 응용이 받는 쪽 응용에게 받아 가도록 재촉하는 데이터, 새 응용은 쓰지 않는 것이 좋다), 문항 n178·n179(§3.1 — 체크섬, 데이터 오프셋), `tcp-udp.sequence-number`·문항 n180(§3.1·§3.4·§3.4.1)
(phase 77 step 6) `tcp-udp.ack-number`(§3.1·§3.4·§3.8·§3.10.7.4·§4 — 다음에 받을 번호, ACK가 켜졌을 때만, 누적, 먼저 온 세그먼트를 가지고 있는다, 순서 번호 + 데이터 바이트 수, 두 방향), `tcp-udp.tcp-control-bits`(§3.1·§4 — 비트 이름과 뜻, §3.5.2 — RST로 거절, §3.6 — FIN은 한 방향, §3.9.1.2 — PSH), 문항 n181·n182·n183
(phase 77 step 9에서 쓰일 곳) `tcp-connection.three-way-handshake`(§3.4.1·§3.5 — 이름, 세 번인 까닭, 세그먼트 셋과 번호, 능동·수동 열기), `tcp-connection.connection-termination`(§3.6·§3.6.1·§3.9.1.4 — 한 방향씩 닫기, 정상 종료 차례, 이름(4-way handshake는 없다), §3.10.7.4·그림 5 주 2 — ACK와 FIN이 한 세그먼트로, §3.5.3·§3.9.1.6 — RST로 중단),
`tcp-connection.tcp-states`(§3.3.1·§3.3.2·§4 「TCB」 — 상태 열하나, CLOSED는 실제로 있지 않은 상태, 상태마다 기다리는 것, 표기), `tcp-connection.opening-states`(§3.3.2 그림 5·§3.5 그림 6·§3.10.7.2·§3.10.7.3·§3.10.7.4 — 맺는 동안의 전이, 클라이언트가 먼저 ESTABLISHED),
`tcp-connection.closing-states`(§3.6 그림 12·13·§3.10.4·§3.10.7.4·§3.10.8 — 끊는 동안의 전이, CLOSE-WAIT, 동시 종료의 CLOSING), `tcp-connection.time-wait`(§3.3.2·§3.4.1·§3.4.2·§3.6.1·§3.10.7.4·§4 「MSL」 — 두 까닭, 2×MSL, MSL 2분), `exam-notes.md`의 「phase 77 step 9」 문단, 강의 수정 이력 머리의 「phase 77 step 9」 문단

## RFC 768 — User Datagram Protocol
https://www.rfc-editor.org/rfc/rfc768

- UDP는 트랜잭션 지향이고, 전달과 중복 방지를 보장하지 않는다 — Introduction
- 순서 있고 신뢰할 수 있는 데이터 스트림 전달이 필요한 응용은 TCP를 써야 한다 — Introduction
- 길이 필드는 헤더와 데이터를 합친 UDP 데이터그램의 옥텟 수다 — Fields
- 체크섬은 의사 헤더·UDP 헤더·데이터에 대한 16비트 1의 보수 합이다. 0으로 보내면 보낸 쪽이 체크섬을 만들지 않았다는 뜻이다 — Fields
- UDP가 주고받는 단위를 사용자 데이터그램(user datagram)이라 부르고, 그냥 데이터그램이라고도 쓴다. 헤더 그림의 제목은 「User Datagram Header Format」이다 — Format, Fields, User Interface
- (phase 73 step 12, 2026-10-29 rfc-editor.org 원문) 출발지 포트는 보내는 프로세스(실행 중인 프로그램)의 포트를 가리키고, 목적지 포트는 특정 목적지 IP 주소 안에서 뜻을 갖는다 — Fields
- (phase 77) 지금 유효한 Internet Standard다. 2025년에 RFC 9868(Transport Options for UDP)이 이 문서를 고쳤다(updates — rfc-editor 상태 2026-11-09. 9868의 내용은 읽지 않았다).
  헤더 그림에서 출발지 포트와 목적지 포트는 32비트 한 줄을 반씩 나눠 각각 16비트다 — Format
- (phase 77 step 3) **헤더는 8옥텟, 칸 넷이 모두 16비트**: 그림은 32비트 줄 둘이고, 칸은 출발지 포트·목적지 포트·길이·체크섬 넷이다. 그 뒤에 데이터 옥텟이 온다 — Format.
  순서 번호·확인 응답 번호·윈도우·제어 비트에 해당하는 칸은 **없다** — Format(칸이 넷뿐이다). 그러니 헤더 크기는 늘 8옥텟이다(옵션 칸이 없다 — Format. RFC 9868(2025-10, Proposed Standard)은 UDP 옵션을 정했지만 헤더 안이 아니라 UDP 데이터가 끝난 뒤, IP 데이터그램 끝까지의 남는 자리(surplus area)에 둔다 — RFC 9868 Abstract.
  이 과목은 UDP 옵션을 쓰지 않는다 — 기출이 묻지 않는다)
- (phase 77 step 3) **출발지 포트는 선택**: 뜻이 있을 때 보내는 프로세스의 포트를 적고, 다른 정보가 없으면 답을 보낼 포트로 볼 수 있다. **쓰지 않으면 0을 넣는다** — Fields
- (phase 77 step 3) **길이의 가장 작은 값은 8**이다 — 길이는 헤더와 데이터를 합친 옥텟 수라 헤더만 있어도 8이다 — Fields. 계산 예: 길이 칸이 1008이면 데이터는 1008 − 8 = 1000옥텟이다(계산)
- (phase 77 step 3) **체크섬**: 의사 헤더(IP 헤더에서 가져온 출발지 주소·목적지 주소·프로토콜·UDP 길이)·UDP 헤더·데이터를 덮고, 계산 절차는 TCP와 같다. 의사 헤더는 엉뚱한 곳으로 간 데이터그램을 걸러 낸다.
  계산 결과가 0이면 모두 1로 보낸다(1의 보수에서 같은 값). 모두 0으로 온 체크섬은 보낸 쪽이 체크섬을 만들지 않았다는 뜻이다 — Fields. 곧 오류 검사는 **16비트 체크섬**이고 패리티 비트가 아니다(Fields — 칸과 계산 방법)
- (phase 77 step 3) **주된 쓰임**: 이 문서는 UDP의 주된 쓰임으로 인터넷 이름 서버(지금의 DNS)와 TFTP를 든다 — Protocol Application

쓰인 곳: 강의 수정 이력 L10, 면접 수정 이력 I3, I4, I10, `protocols-encapsulation.pdu-names`
(phase 73 step 11) `icmp.ip-limits`(Introduction — 순서 있고 신뢰할 수 있는 전달이 필요한 응용은 TCP를 쓴다)
(phase 73 step 12) `icmp.destination-unreachable`(Fields — 포트는 호스트 안의 프로그램을 가리킨다, UDP는 TCP와 같은 전송 계층 프로토콜)
(phase 74 step 5에서 쓰일 곳) `ip-address-types.napt`(Fields — 출발지 포트는 보내는 프로그램의 포트), `ip-address-types.dhcp`(DHCP는 UDP 위에서 동작한다 — RFC 2131 §4.1)
(phase 77에서 쓰일 곳) `ports.port-number`(Format — UDP 헤더의 두 포트 칸도 16비트, Fields — 목적지 포트로 받을 프로그램을 가린다)
(phase 77 step 3에서 쓰일 곳) `tcp-udp.udp`(Introduction — 데이터그램 방식, 전달·중복 방지를 보장하지 않는다, Protocol Application — DNS·TFTP), `tcp-udp.udp-header`(Format·Fields — 8옥텟, 칸 넷 16비트, 출발지 포트 0, 길이 최소 8, 체크섬),
`tcp-udp.transport-choice`(Introduction — 순서 있고 믿을 수 있는 전달은 TCP, Protocol Application), 강의 수정 이력 L47, 기출 대조(`exam-notes.md` 「phase 77 step 3」 문단 — UDP 헤더에 없는 칸, 패리티가 아니다)
(phase 77 step 7) `tcp-udp.udp`(Introduction — 비연결형, 전달·중복 방지를 보장하지 않는다; Format — 순서 번호 칸이 없다; Fields — 체크섬; User Interface — 사용자 데이터그램), `tcp-udp.udp-header`(Format·Fields — 칸 넷 16비트, 8옥텟, 출발지 포트는 쓰지 않으면 0, 길이는 헤더+데이터로 최소 8, 체크섬은 TCP와 같은 절차·0은 만들지 않았다는 뜻), 도식 `udp-delivery`·`udp-header-fields`, 문항 n184·n185 해설
(phase 77 step 8) `tcp-udp.transport-choice`(Introduction — 순서 있고 믿을 수 있는 흐름 전달이 필요한 응용은 TCP), 도식 `transport-choice`

## RFC 1122 — Requirements for Internet Hosts — Communication Layers
https://www.rfc-editor.org/rfc/rfc1122

- 인터넷 프로토콜 묶음은 응용·전송·인터넷·링크의 4계층이다. 응용 계층은 OSI의 위 두 계층(표현·응용)의 일을 합친 것이라 OSI 7계층과 일대일로 맞지 않는다 — §1.1.3
- 인터넷 계층: 인터넷의 전송 프로토콜은 모두 IP로 출발지 호스트에서 목적지 호스트까지 데이터를 나른다 — §1.1.3
- 전송 계층은 응용에 종단 간 통신 서비스를 준다. TCP는 신뢰성 있는 연결형 서비스, UDP는 비연결형 데이터그램 서비스다 — §1.1.3
- 호스트는 UDP 체크섬을 만들고 검사할 수 있어야 하고, 기본값은 체크섬을 켜는 것이다 — §4.1.3.4
- 0이 아닌 체크섬이 맞지 않는 UDP 데이터그램을 받으면 알리지 않고 버린다 — §4.1.3.4
- 호스트는 통신 서비스를 마지막에 받아 쓰는 쪽이고, OSI의 종단 시스템(End-System)에 해당한다 — §1.1.1
- (phase 73 step 3) 호스트는 받은 모든 데이터그램의 IP 헤더 체크섬을 반드시 검사하고(MUST), 체크섬이 맞지 않는 데이터그램은 알리지 않고 버린다 — §3.2.1.2
- (phase 73 step 3) 프로토콜 번호는 데이터를 넘길 전송 프로토콜을 고르는 데 쓴다: 호스트는 지정된(designated) 전송 프로토콜을 지원하지 않으면 프로토콜 도달 불가(코드 2)를 보내고 — §3.2.2.1, 인터넷 계층이 ICMP 오류 메시지를 전송 계층에 넘길 때는 원래 헤더의 IP 프로토콜 번호로 알맞은 전송 프로토콜을 고른다(MUST) — §3.2.2
- 네트워크들은 「게이트웨이」 또는 「IP 라우터」라 부르는 패킷 교환 장비로 서로 이어진다 — §1.1.1
- 다른 호스트가 만든 데이터그램을 넘겨주는 호스트는 그때 게이트웨이(라우터) 노릇을 하는 것이다 — §3.1
- 제한 브로드캐스트 주소로 보낸 데이터그램은 이어진 그 물리 네트워크의 모든 호스트가 받는다. 멀티캐스트(D 클래스) 주소는 호스트 그룹 하나를 가리킨다 — §3.2.1.3
- 네 계층의 영문 이름은 Application Layer, Transport Layer, Internet Layer, Link Layer다. 호스트는 대개 계층마다 프로토콜을 적어도 하나 구현해야 한다 — §1.1.3
- 링크 계층: 호스트가 자기가 직접 이어진 네트워크에서 통신하려면 그 네트워크에 닿는 데 쓰는 통신 프로토콜을 구현해야 하고, 그것을 링크 계층(또는 매체 접근 계층) 프로토콜이라 부른다.
  강의는 이 계층을 「네트워크 액세스 계층」이라 부른다 — §1.1.3
- 응용 계층의 사용자 프로토콜로 Telnet(원격 로그인), FTP(파일 전송), SMTP(전자 우편 전달)를 든다 — §1.1.3
- (2026-10-28) 응용 계층 프로토콜은 사용자에게 직접 서비스를 주는 사용자 프로토콜과, 여러 시스템 기능을 받쳐 주는 지원(support) 프로토콜로 나뉜다.
  지원 프로토콜은 호스트 이름 대응·부팅·관리에 쓰이고, 그 예로 SNMP, BOOTP, RARP, DNS를 든다 — §1.1.3
- (2026-10-28) IP는 비연결형(데이터그램) 서비스라 종단 간 전달을 보장하지 않는다. 데이터그램은 손상되거나, 중복되거나, 순서가 바뀌거나, 아예 닿지 않을 수 있다.
  인터넷의 IP는 OSI 비연결형 네트워크 프로토콜의 본보기였다 — §1.1.3
- (2026-10-28) 인터넷 계층 프로토콜은 IP·ICMP·IGMP다. ICMP는 IP의 일부로 여기는 제어 프로토콜로, 오류 보고·혼잡 보고·첫 홉 게이트웨이의 경로 바꿈(redirect)을 맡는다.
  구조로는 IP 위에 얹혀 TCP·UDP처럼 IP로 자기 데이터를 나른다. IGMP는 IP 멀티캐스트에 쓰는 호스트 그룹을 동적으로 꾸리는 인터넷 계층 프로토콜이다 — §1.1.3
- 세션 계층은 따로 없다. 네 계층 가운데 세션에 해당하는 것이 없고, OSI와 견주는 말은 응용 계층이 표현·응용을 합쳤다는 위 한 곳뿐이다. 전문에 「session」이라는 말이 나오지 않는다 — §1.1.3, 전문 검색(2026-10-27)
- 이 문서의 용어(§1.3.3):
  - 세그먼트는 TCP의 종단 간 전송 단위로, TCP 헤더 뒤에 응용 데이터가 붙은 것이다. IP 데이터그램에 담겨 전송된다.
  - IP 데이터그램은 IP의 종단 간 전송 단위로, IP 헤더 뒤에 전송 계층의 메시지가 붙은 것이다. 인터넷 계층을 설명하는 3장에서는 「데이터그램」만 써도 IP 데이터그램을 뜻한다.
  - 패킷은 인터넷 계층과 링크 계층 사이에서 넘겨지는 데이터 단위로, IP 헤더와 데이터를 담는다. IP 데이터그램 전체일 수도, 그 조각일 수도 있다.
  - 프레임은 링크 계층 프로토콜의 전송 단위로, 링크 계층 헤더 뒤에 패킷이 붙은 것이다.
  - 메시지는 이 문서가 아래 계층을 설명할 때 **전송 계층 프로토콜의 전송 단위**를 가리키는 말이다(TCP 세그먼트도 메시지다). 이 과목은 응용 계층의 단위를 강의(p37)대로 데이터라 부르고
    메시지는 HTTP 표준의 이름(HTTP 메시지)으로만 덧붙이므로(ADR-058) 이 정의는 개념 본문에 옮기지 않는다 — HTTP 메시지의 근거는 아래 RFC 9110 §1.3이다.
- (phase 73) TTL 칸의 쓰임은 둘이다 — TCP 세그먼트의 수명에 상한을 두는 것과, 경로가 고리를 이룰 때 패킷이 끝없이 도는 것을 끝내는 것이다. TTL은 초 단위의 시간이지만,
  게이트웨이(라우터)마다 최소 1씩 줄여야 하므로 홉 수의 성질도 갖는다. TTL이 다 되면 그 데이터그램은 목적지 호스트가 아니라 게이트웨이에서 버려지는 것이 본뜻이다 — §3.2.1.7 DISCUSSION
- (phase 73) 호스트는 TTL이 0인 데이터그램을 보내지 않는다 — §3.2.1.7
- (phase 73) IP 계층은 재조합을 반드시 구현한다. 합칠 수 있는 가장 큰 데이터그램 크기(EMTU_R)는 576옥텟 이상이어야 한다 — §3.3.2
- (phase 73) 재조합에는 기다리는 시간 한도가 있어야 하고 60~120초를 권한다. 그 시간이 지나면 합치다 만 데이터그램을 버리고, 첫 조각(오프셋 0)을 받았으면 출발지에 ICMP 시간 초과를 보낸다(자세히는 step 1) — §3.3.2.
  RFC 791은 이 시간을 남은 TTL로 정하라고 했지만, 게이트웨이들이 TTL을 지난 시간이 아니라 **단순한 홉 수로 다루기 때문에** 잘 맞지 않는다고 쓴다 — §3.3.2 DISCUSSION
- (phase 73) 호스트가 보낼 수 있는 가장 큰 데이터그램 크기(EMTU_S)는 출발지 주소의 네트워크 인터페이스 MTU 이하다. 호스트 쪽 단편화는 하지 않는 편이 바람직하고,
  경로의 어느 게이트웨이에서도 나뉘지 않을 만큼 작게 고르는 것이 좋다 — §3.3.3
- (phase 73 step 1) ARP 구현은 낡은 캐시 항목을 지우는 방법을 반드시 갖춰야 하고(MUST), 시간 제한으로 지운다면 그 시간을 설정할 수 있어야 한다(SHOULD). 같은 IP 주소로 ARP 요청을 빠르게 되풀이해 보내는 것을 막는 장치도 반드시 갖춘다
  (목적지마다 초당 1번을 권한다) — §2.3.2.1
- (phase 73 step 1) 캐시 항목을 지우는 까닭: 상대 호스트의 이더넷 주소가 바뀌거나 대리 ARP 때문에 캐시의 짝이 틀려질 수 있고, 잘못 들어간 정보를 저절로 바로잡을 수 있다 — §2.3.2.1 DISCUSSION.
  쓰여 온 방법은 넷이다 — 쓰고 있어도 주기적으로 지우는 시간 제한(그 시스템이 보낸 ARP 브로드캐스트를 보면 시간을 다시 센다), 유니캐스트 ARP 요청으로 주기적으로 묻고 답이 없으면 지우기,
  링크 계층이 전달 문제를 알려 오면 지우기, 인터넷 계층이 알려 오면 지우기. 앞의 둘은 대략 1분 안팎의 시간을 예로 들고, 아주 큰 이더넷에서는 더 늘려야 할 수도 있다고 쓴다 — §2.3.2.1 IMPLEMENTATION.
  표준이 시간 값을 하나로 정하지 않으므로 본문은 「운영체제가 정한 시간」으로 쓴다(Linux의 기본값은 아래 man-pages 항목의 arp(7))
- (phase 73 step 1) 아직 링크 계층 주소를 모르는 IP 주소로 갈 패킷은 적어도 마지막 하나를 버리지 않고 두었다가 주소가 정해지면 보내는 것이 좋다(SHOULD) — 그러지 않으면 주고받기의 첫 패킷이 늘 사라진다 — §2.3.2.2
- (phase 73 step 1) ICMP 메시지는 두 갈래다 — 오류 메시지(목적지 도달 불가, 리다이렉트, 발신지 억제, 시간 초과, 매개변수 문제)와 질의 메시지(에코, 정보, 타임스탬프, 주소 마스크).
  모르는 타입의 ICMP 메시지는 알리지 않고 버린다 — §3.2.2
- (phase 73 step 1) 모든 ICMP 오류 메시지는 오류를 부른 데이터그램의 IP 헤더와 데이터 앞 8옥텟 이상을 바꾸지 않고 담는다 — §3.2.2
- (phase 73 step 1) ICMP 오류 메시지를 보내지 않는 때(MUST NOT): ICMP 오류 메시지를 받았을 때, IP 브로드캐스트·멀티캐스트 주소로 온 데이터그램, 링크 계층 브로드캐스트로 온 데이터그램, 첫 조각이 아닌 조각,
  출발지 주소가 호스트 하나를 가리키지 않는 데이터그램. 브로드캐스트에 모든 호스트가 오류로 답해 네트워크가 잠시 쓸 수 없게 되는 일을 막으려는 규칙이다 — §3.2.2와 DISCUSSION
- (phase 73 step 1) 목적지 도달 불가: 호스트는 지정된 전송 프로토콜을 지원하지 않으면 코드 2(프로토콜 도달 불가)를, 전송 프로토콜(예: UDP)이 데이터그램을 받을 곳을 찾지 못하고 출발지에 알릴 방법도 없으면 코드 3(포트 도달 불가)을 보내는 것이 좋다(SHOULD).
  코드 0(네트워크)·1(호스트)·5(소스 라우트 실패)는 경로가 잠깐 흔들려서 생길 수도 있어, 받은 쪽은 도달할 수 없다는 증거가 아니라 단서로만 받는다 — §3.2.2.1
- (phase 73 step 1) 리다이렉트는 게이트웨이만 보내고 호스트는 보내지 않는 것이 좋다(SHOULD NOT). 받은 호스트는 경로 정보를 고친다 — §3.2.2.2
- (phase 73 step 1) 시간 초과: 게이트웨이는 TTL이 다 돼 데이터그램을 버리면 코드 0(전송 중)을 보낸다 — 경로가 고리를 이루거나 처음 TTL이 너무 작다는 뜻이다. 조각을 다 모으지 못하고 기다리는 시간이 지나 합치다 만 데이터그램을 버린 목적지 호스트는 코드 1(재조합 시간 초과)을 보낸다 — §3.2.2.4 DISCUSSION
- (phase 73 step 1) 모든 호스트는 에코 요청을 받아 에코 응답을 보내는 기능을 반드시 갖춘다(MUST). 진단용으로 에코 요청을 보내고 응답을 받는 응용 계층 기능도 갖추는 것이 좋다(SHOULD).
  에코 응답의 출발지 주소는 요청이 가리킨 목적지 주소이고, 요청으로 받은 데이터는 응답에 모두 담는다. IP 브로드캐스트·멀티캐스트로 온 에코 요청은 버려도 된다(MAY) — §3.2.2.6
- (phase 73 step 1) 정보 요청·응답은 구현하지 않는 것이 좋다(SHOULD NOT) — 디스크 없는 워크스테이션이 부팅 때 자기 네트워크 번호를 알아내려던 것인데, 호스트가 자기 IP 주소를 알아내는 데는 RARP와 BOOTP가 더 나은 방법이다 — §3.2.2.7.
  타임스탬프·타임스탬프 응답은 구현해도 된다(MAY) — §3.2.2.8
- (phase 73 step 1) IGMP는 한 네트워크 안에서 호스트와 게이트웨이(라우터) 사이에 쓰여, 호스트가 어느 멀티캐스트 그룹에 드는지를 정한다. 게이트웨이는 이 정보와 멀티캐스트 라우팅 프로토콜로 인터넷 전체의 IP 멀티캐스트를 받친다 — §3.2.3
- (phase 73 step 1) IP 계층은 보내는 데이터그램마다 다음 홉을 고른다. 목적지가 이어진 네트워크에 있으면 그 호스트로 바로 보내고, 아니면 이어진 네트워크의 게이트웨이로 보낸다 — §3.3.1.
  같은 네트워크인지는 주소 마스크로 가린다(§3.3.1.1 — 서브넷 마스크는 `ip-addressing` 주제라 여기서는 이름만)
- (phase 73 step 1) 경로 정보가 없는 목적지로 보낼 때 호스트는 **기본(default) 게이트웨이** 가운데 하나를 골라 보낸다. 호스트는 기본 게이트웨이를 여럿 둘 수 있어야 하고, 시작하려면 대개 적어도 하나를 알아야 한다
  (설정 파일이나 BOOTP 같은 시작 절차로 얻는다). 고른 게이트웨이가 가장 좋은 다음 홉이 아니면 그 게이트웨이가 데이터그램을 넘겨주면서 ICMP 리다이렉트를 돌려보낸다 — §3.3.1.2와 DISCUSSION
- (phase 73 step 11, 2026-10-29 rfc-editor.org 원문) 신뢰성 있는 전달이 필요하면 IP 위의 계층이 그 일을 맡는다. 지금 전송 계층의 주된 프로토콜은 TCP와 UDP 둘이다 — §1.1.3
- (phase 74) 주소 클래스는 지금 A~E 다섯이다. D는 IP 멀티캐스트에 쓰고, E는 실험용으로 남겨 두었다. D(멀티캐스트) 주소는 호스트 그룹 하나를 가리키는 28비트 논리 주소다 — §3.2.1.3.
  아래 {네트워크 번호, 호스트 번호} 표기와 특별한 경우는 **A·B·C 주소에 대해서만** 정리한다 — §3.2.1.3(그러니 D 주소는 네트워크 부분과 호스트 부분으로 나눠 읽지 않는다)
- (phase 74) 주소를 {네트워크 번호, 호스트 번호} 또는 {네트워크 번호, 서브넷 번호, 호스트 번호}로 적고, 모든 비트가 1인 칸을 -1로 적는다. 특별한 경우 가운데 이 주제가 쓰는 것:
  {네트워크 번호, -1}은 그 네트워크로 보내는 **directed broadcast**, {네트워크 번호, 서브넷 번호, -1}은 그 서브넷으로 보내는 directed broadcast이고, 둘 다 출발지 주소로 쓰면 안 된다(MUST NOT) — §3.2.1.3 (d)(e).
  나머지 — {-1, -1} 제한 브로드캐스트(c), 네트워크 칸이 0인 「이 네트워크」의 주소(a)(b), {127, 아무 값} 루프백(g) — 는 `ip-address-types`(step 5)에서 쓴다 — §3.2.1.3
- (phase 74) 호스트 번호·네트워크 번호·서브넷 번호 칸은 위의 특별한 경우를 빼고 0(모두 0)이나 -1(모두 1)일 수 없다. 그래서 칸마다 적어도 2비트가 된다 — §3.2.1.3.
  **호스트에 줄 수 있는 주소가 2^h − 2개인 근거가 이 줄이다** — h비트 호스트 칸이 가질 수 있는 2^h개 값에서 모두 0과 모두 1을 뺀다(계산. 같은 수를 표준이 직접 적은 예는 RFC 4632 §2의 C 클래스 254개, RFC 3021 §1의 /30 — 아래 항목).
  서브넷 번호 칸에 대한 같은 제한은 이 문서에 그대로 적혀 있지만, 뒤에 나온 RFC 1812 §4.2.2.11 DISCUSSION이 CIDR에서는 뜻이 없어 무시해도 된다고 적었다(아래 RFC 1812 항목)
- (phase 74) 호스트는 서브넷 확장(RFC 950)을 반드시 지원하고, 자기 IP 주소마다 주소 마스크가 하나씩 딸린다 — §3.2.1.3.
  호스트가 보내는 데이터그램의 출발지 주소는 자기 주소 가운데 하나여야 하고 브로드캐스트·멀티캐스트 주소일 수 없다 — §3.2.1.3
- (phase 74) 목적지가 이어진 네트워크에 있는지 가르는 규칙(MUST): 주소 마스크는 그 IP 주소에서 네트워크 번호와 서브넷 번호 칸을 골라내는 32비트 마스크다.
  목적지 주소에서 마스크로 골라낸 비트가 출발지 주소에서 같은 마스크로 골라낸 비트와 같으면 목적지는 이어진 네트워크에 있으니 그 호스트로 바로 보내고, 다르면 게이트웨이를 거쳐야만 닿는다 — §3.3.1.1
- (phase 74) 마스크를 아직 모르면 호스트는 그 주소의 **클래스에 맞는 마스크**를 쓰는 것이 좋다(SHOULD) — 곧 이어진 네트워크가 서브넷으로 나뉘지 않았다고 본다 — §3.2.2.9 (b).
  (이 줄은 ICMP 주소 마스크 메시지로 마스크를 알아내는 경우의 규칙이고, 그 메시지는 RFC 6918이 폐기했다 — `exam-notes.md` E13. 클래스마다 마스크가 있다는 뜻으로만 쓴다)
- (phase 74 step 5) 위 「(phase 74)」 줄이 남겨 둔 특별한 경우 넷: (a) {0, 0}은 「이 네트워크의 이 호스트」이고, 호스트가 자기 IP 주소를 알아내는 초기화 절차에서 **출발지 주소로만** 보내고 그 밖에는 보내지 않는다(MUST NOT).
  (b) {0, 호스트 번호}는 「이 네트워크의 지정한 호스트」이고 (a)와 같이 초기화 절차의 출발지로만 쓴다. (c) {-1, -1}은 **제한 브로드캐스트**이고 출발지로 쓰지 않으며, 이어진 물리 네트워크의 모든 호스트가 받지만 그 네트워크 밖으로 넘겨지지 않는다.
  (g) {127, 아무 값}은 **호스트 안의 루프백 주소**이고 이 꼴의 주소는 호스트 밖에 나타나면 안 된다(MUST NOT) — §3.2.1.3 (a)(b)(c)(g)
- (phase 74 step 5) 네트워크 번호는 **세계 전체에서 하나뿐이도록** 행정적으로 정한다 — §3.2.1.3
- (phase 74 step 11) 호스트도 정적 경로 표를 둘 수 있다(MAY). 정적 경로는 목적지 호스트나 네트워크를 정해 둔 다음 홉 게이트웨이에 미리 짝지어 둔 것이고, 관리자가 자동 라우팅 대신 쓰려고 넣는다.
  다만 정적 경로 정보는 **구성이 바뀌거나 장비가 고장 나면 장애의 원인이 될 수 있다** — §3.3.1.2와 DISCUSSION
- (phase 74 step 11) 호스트의 경로 캐시·기본 게이트웨이 목록·정적 경로 표는 개념으로는 따로지만, 실제로는 하나의 「라우팅 테이블」 자료 구조로 합쳐 둘 수 있다 — §3.3.1.3 IMPLEMENTATION.
  곧 **호스트에도 라우팅 테이블이 있다**(Linux·Windows에서 그 표를 보는 명령은 아래 「(phase 74 step 11) Linux man-pages … Microsoft Learn …」 항목)

- (phase 82 step 8, 2026-11-19 상태를 다시 확인 — Internet Standard, 1989-10, RFC 1349·4379·5884·6093·6298·6633·6864·8029·9293이 고쳤다) 위 §3.3.1·§3.3.1.2 줄(목적지가 이어진 네트워크에 없으면 그 네트워크의 게이트웨이로 보내고, 경로 정보가 없으면 **기본 게이트웨이** 가운데 하나를 고른다)의 「게이트웨이」는
  이 문서가 쓰던 옛 말로 **라우터**를 가리킨다(아래 RFC 1812 §2.2.3 줄, 아래 RFC 1983 「gateway」) — 새로 가져온 사실은 없다
  쓰인 곳: (phase 82 step 10에서 쓰일 곳) `network-devices.gateway`(IP 설정의 기본 게이트웨이는 다른 네트워크로 나가는 첫 라우터 — `routing.default-route`와 뜻을 맞춘다, 넓은 뜻의 게이트웨이와 같은 낱말의 두 쓰임)
- (phase 82 step 10) 쓰인 곳: `network-devices.gateway`(문단 4 — 컴퓨터는 목적지가 같은 네트워크에 있으면 바로 보내고, 다른 네트워크에 있는데 따로 정해 둔 길이 없으면 기본 게이트웨이에게 보낸다, 문단 5의 예, 문단 6 「게이트웨이와 기본 게이트웨이」), 도식 `gateway-translate`의 「기본 게이트웨이」 캡션, 문항 n329(정답과 해설)
쓰인 곳: 강의 수정 이력 L10, L25, 면접 수정 이력 I3, I9, I10, `network-basics.host`, `network-basics.network-equipment`, `network-basics.internet`, `network-basics.cast-types`,
`protocols-encapsulation.protocol`, `protocols-encapsulation.reference-model`, `protocols-encapsulation.tcp-ip-model`, `protocols-encapsulation.pdu-names`, `protocols-encapsulation.packet-switching`, `exam-notes.md` E2,
(phase 72에서 쓰일 곳) `ethernet.ethernet`(링크 계층 = 강의의 네트워크 액세스 계층, §1.1.3), `ethernet.frame`(링크 계층의 전송 단위가 프레임, §1.3.3),
(phase 73에서 쓰일 곳) `ip-protocol.ip`(§1.1.3 — 인터넷 계층, 최선형), `ip-protocol.fragmentation`(§3.3.2 — 목적지가 합친다, 합치는 시간 한도), `ip-protocol.mtu`(§3.3.2·§3.3.3 — 576, EMTU_S ≤ 인터페이스 MTU),
`ip-protocol.ttl`(§3.2.1.7 — 초 단위지만 홉 수의 성질, 고리를 끝낸다),
(phase 73 step 1에서 쓰일 곳) `arp.arp-cache`(§2.3.2.1·§2.3.2.2), `arp.arp-across-routers`(§3.3.1·§3.3.1.2 — 다음 홉, 기본 게이트웨이), `arp.rarp`(§3.2.2.7 — RARP와 BOOTP), `icmp.ip-limits`(§1.1.3 — 비연결형, 전달 보장 없음),
`icmp.icmp`(§1.1.3·§3.2.2 — IP의 일부, 두 갈래, 오류의 오류 금지), `icmp.icmp-message`(§3.2.2), `icmp.destination-unreachable`(§3.2.2.1), `icmp.time-exceeded`(§3.2.2.4), `icmp.echo`(§3.2.2.6), `icmp.igmp`(§1.1.3·§3.2.3)
(phase 73 step 3) `ip-protocol.ipv4-header`(§3.2.1.2 — 체크섬이 맞지 않는 패킷은 버린다, §3.2.2·§3.2.2.1 — 프로토콜 번호로 넘길 전송 프로토콜을 고른다), 문항 n052 해설
(phase 73 step 4) `ip-protocol.fragment-fields`(위 2026-10-28 줄 — 데이터그램은 순서가 바뀌어 닿을 수 있어 조각이 보낸 차례대로 닿는다는 보장이 없다), `ip-protocol.ttl`(§3.2.1.7 — 고리를 끝내는 쓰임과 홉 수의 성질), 문항 n055 해설
(phase 73 step 5) `ip-protocol.ipv6`(§3.2.1.3 — IPv4에는 그 물리 네트워크의 모든 호스트가 받는 브로드캐스트 주소가 있다), 도식 `ipv6-changes`의 「브로드캐스트 있음」, 문항 n057 해설
(phase 73 step 11) `icmp.ip-limits`(§1.1.3 — 비연결형, 손상·중복·순서 바뀜·닿지 않음, 위 계층이 신뢰성을 맡는다, 전송 계층은 끝과 끝 사이의 통신, TCP는 연결형), `icmp.icmp`(§1.1.3 — ICMP는 IP의 일부이고 인터넷 계층 프로토콜, §3.2.2 — 오류 메시지와 질의 메시지의 두 갈래, 에코는 질의 메시지), 문항 n070·n071 해설, 도식 `ip-limits`·`icmp-feedback`
(phase 73 step 12) `icmp.icmp-message`(§3.2.2 — 리다이렉트·시간 초과는 오류 메시지, 에코는 질의 메시지), `icmp.destination-unreachable`(§3.2.2 — 오류 메시지에는 원래 IP 헤더와 데이터 앞 8옥텟 이상을 담는다, §3.2.2.1 — 호스트가 코드 2·3을 보내고, 코드 0·1은 경로가 잠깐 흔들려 생길 수 있어 받은 쪽이 단서로 다룬다), 문항 n073 해설
(phase 73 step 14) `icmp.igmp`(§1.1.3 — IGMP는 인터넷 계층 프로토콜이다, §3.2.3 — 라우터는 IGMP로 얻은 정보와 멀티캐스트 라우팅 프로토콜로 멀티캐스트를 받친다: 멀리 있는 라우터와 그 정보를 나누는 일은 IGMP의 몫이 아니다), 문항 n078·n079 해설, 도식 `igmp-group`
(phase 74에서 쓰일 곳) `ip-addressing.network-host`(§3.2.1.3 — {네트워크 번호, 호스트 번호}, 주소마다 마스크가 딸린다), `ip-addressing.network-broadcast-address`(§3.2.1.3 — directed broadcast, 칸이 모두 0·모두 1일 수 없다 → 2^h − 2, 출발지로 못 쓴다),
`ip-addressing.address-classes`(§3.2.1.3 — 다섯 클래스, D 멀티캐스트·E 실험용, 특별한 경우는 A·B·C에만), `ip-addressing.subnet-mask`(§3.3.1.1 — 마스크로 같은 네트워크인지 가른다, §3.2.2.9 — 클래스에 맞는 마스크), `ip-addressing.network-address-calc`(§3.3.1.1 — 마스크로 골라낸 비트), 강의 수정 이력 L36·L38
(phase 74 step 5에서 쓰일 곳) `ip-address-types.public-address`(§3.2.1.3 — 네트워크 번호는 세계에서 하나뿐), `ip-address-types.reserved-addresses`(§3.2.1.3 (a)(b) — 0.0.0.0은 초기화의 출발지로만, (c) — 제한 브로드캐스트는 넘겨지지 않는다), `ip-address-types.loopback`(§3.2.1.3 (g) — 호스트 밖에 나타나지 않는다), `ip-address-types.dhcp-messages`((a) — 주소가 없는 클라이언트의 출발지 0.0.0.0, (c) — 목적지 255.255.255.255)
(phase 74 step 11에서 쓰일 곳) `routing.routing`(§3.3.1 — 호스트도 데이터그램마다 다음 홉을 고른다), `routing.routing-table`(§3.3.1.3 — 호스트에도 라우팅 테이블이 있다), `routing.default-route`(§3.3.1.2 — 경로 정보가 없는 목적지는 기본 게이트웨이로),
`routing.static-dynamic-routing`(§3.3.1.2 DISCUSSION — 정적 경로는 관리자가 넣고, 구성이 바뀌거나 장비가 고장 나면 장애의 원인이 된다), `exam-notes.md` E17
(phase 77 step 7) `tcp-udp.udp`·`tcp-udp.udp-header`(§4.1.3.4 — UDP 체크섬은 만들고 검사하는 것이 기본, 맞지 않는 데이터그램은 알리지 않고 버린다), 문항 n184 해설
(phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.snmp`(위 2026-10-28 줄 §1.1.3 — SNMP는 응용 계층의 지원 프로토콜이다), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — SNMP는 응용 계층, 오류 보고·혼잡 보고는 ICMP의 일)

## RFC 871 — A Perspective on the ARPANET Reference Model
https://www.rfc-editor.org/rfc/rfc871

1982년 9월, 설계에 참여한 사람이 쓴 글이다(표준이 아니라 설명 문서). 역사적 사실을 확인하는 데만 쓴다.

- TCP와 IP를 포함한 ARPANET 프로토콜 묶음은 ARPANET 참조 모델(ARM)이라는 틀 안에서 설계되었고, 이 글은 그것을 ISO의 OSI 참조 모델과 견준다 — Abstract
- ARM은 계층을 셋(프로세스·응용 수준, 호스트 간 수준, 네트워크 수준)으로 보고, OSI는 적어도 일곱으로 본다 — 「Layering」, 각주가 딸린 계층 수 논의

쓰인 곳: 강의 수정 이력 L25, `protocols-encapsulation.tcp-ip-model`

## RFC 8085 — UDP Usage Guidelines
https://www.rfc-editor.org/rfc/rfc8085

BCP 145다(RFC 5405를 대체).

- UDP를 쓰려는 응용에 권하는 대안은 TCP 같은 IETF 전송 프로토콜이다(SCTP, DCCP도 든다) — §3
- UDP로 대량 데이터를 보내는 응용은 TFRC나 TCP 같은 윈도 기반 혼잡 제어를 갖추거나, 그에 맞먹는 혼잡 제어로 TCP와 공정하게 나눠 쓰도록 해야 한다(SHOULD) — §3.1.2
- 이 지침 어디에도 UDP가 대량 전송에 TCP보다 맞는다는 말은 없다 — §3, §3.1.2
- (phase 77 step 3) RFC 8899가 고쳤다(rfc-editor 상태 2026-11-09 — 8899의 내용은 읽지 않았다).
  UDP는 IP 위에서 최소한의, 믿을 수 없는, 최선형(best-effort) 메시지 전달을 준다. 끝과 끝 사이에 **연결을 맺지 않으므로** 연결을 세우고 끊는 부담이 없고 끝 시스템이 지닐 상태도 적어, 어떤 응용에는 아주 효율적이다 — §1
- (phase 77 step 3) UDP는 **스스로 혼잡 제어를 하지 않는다**. 그래서 혼잡이 무너지는 일을 막고 경로를 공정하게 나눠 쓰게 하는 일은 UDP를 쓰는 **응용의 몫**이다 — §1, §3.1
- (phase 77 step 3) UDP는 **흐름 제어도 하지 않는다** — 보내는 쪽은 받는 쪽이 감당할 수 있는지 모른다. 이것이 필요한 응용은 TCP 같은 전송 프로토콜을 쓰는 것이 좋다 — §5
- (phase 77 step 3) UDP는 신뢰성을 주지 않는다 — 잃은 패킷을 다시 보내지 않고, 같은 데이터그램이 여러 번 올 수 있으며, 순서가 바뀌어 올 수 있다. 신뢰성·순서가 필요한 응용은 그 장치를 **스스로** 갖추거나, 되도록 그것을 주는 IETF 전송 프로토콜을 고른다 — §3.3.
  재전송을 하는 응용은 그 재전송의 혼잡 제어도 책임진다 — §3.3
- (phase 77 step 3) UDP 데이터그램 하나는 **IP 패킷 하나**에 실린다(데이터는 IPv4에서 최대 65,507바이트, IPv6에서 65,527바이트). 큰 IP 패킷은 대개 단편화를 부르고 단편화는 신뢰성과 효율을 떨어뜨린다 — §1, §3.2.
  응용의 메시지를 여러 UDP 데이터그램으로 나누는 것은 **응용이** 하고, 그때는 데이터그램 하나하나를 따로 받을 수 있게 나눈다 — §3.2

쓰인 곳: 면접 수정 이력 I4
(phase 77 step 3에서 쓰일 곳) `tcp-udp.udp`(§1 — 연결을 맺지 않아 부담이 적다, 혼잡 제어 없음, §5 — 흐름 제어 없음, §3.3 — 재전송·순서 없음, 필요하면 응용이), `tcp-udp.transport-choice`(§3.3·§5 — 믿을 수 있는 순서 전달·흐름 제어가 필요하면 TCP, UDP 위에서 응용이 재전송을 더하면 그 혼잡 제어도 응용 몫),
기출 대조(`exam-notes.md` 「phase 77 step 3」 문단 — [기출 2026-02-01 #17]의 「메시지를 나누고 재조립하는 서비스는 없다」)
(phase 77 step 7) `tcp-udp.udp`(§1 — 연결을 맺고 끊는 부담이 없고 지닐 상태가 적다, 혼잡 제어는 응용 몫; §3.2 — 데이터그램 하나가 IP 패킷 하나에 실리고 나누기는 응용이 한다; §3.3 — 재전송·순서 맞춤 없음, 중복 가능; §5 — 흐름 제어 없음)
(phase 77 step 8) `tcp-udp.transport-choice`(§3.3 — 신뢰성·순서가 필요하면 응용이 스스로 갖추거나 그것을 주는 전송 프로토콜을 고른다, 재전송하는 응용은 그 혼잡 제어도 책임진다), 문항 n187 해설

## RFC 7766 — DNS Transport over TCP - Implementation Requirements
https://www.rfc-editor.org/rfc/rfc7766

- DNS 구현에서 TCP 지원은 필수다 — Abstract, §1
- TCP는 전체 영역 전송(AXFR)에 늘 쓰이고, 원래의 512바이트 한도를 넘는 메시지에도 자주 쓰인다 — §1
- 잘린 응답(TC 플래그)을 받으면 TCP로 다시 묻는다 — §4
- 범용 DNS 구현은 UDP와 TCP를 모두 지원해야 하고, TCP는 단지 재시도 수단이 아니라 UDP의 대안이다 — §5
- (phase 79 step 5, 2026-11-12 rfc-editor.org 원문 다시 확인 — Proposed Standard, RFC 8490·9103이 고쳤다) DNSSEC과 IPv6가 퍼지며 응답이 커져 TCP를 쓰는 일이 늘었다. 서버가 TCP를 지원하지 않거나 **망에서 TCP 위의 DNS를 막으면** 이름 풀이가 실패하거나 응용이 기다리다 시간이 다 될 수 있다 — §1
- (phase 79 step 5) 권한 있는 서버, 재귀 서버(전달자 포함), 스텁 리졸버 구현이 저마다 TCP를 지원해야 한다(MUST) — 응답 크기를 UDP 패킷 하나에 묶지 않고, 큰 응답이 클라이언트까지 닿게 하려는 것이다. 리졸버는 운영 사정에 따라 질의를 UDP로도 TCP로도 처음부터 보낼 수 있고, 서버는 질의가 온 전송(TCP면 같은 연결)으로 응답한다 — §5
- (phase 79 step 8, 2026-11-12 rfc-editor.org 원문 다시 확인) EDNS0 없이 512바이트를 넘는 UDP 응답을 보내야 하는 서버는 응답을 **그 한도에 들어가게 잘라** TC 플래그를 켜고, 이 응답을 받은 클라이언트는 TC 플래그를 TCP로 다시 물으라는 뜻으로 받는다. EDNS0를 아는 클라이언트와 서버 사이에서는 클라이언트가 알린 크기까지 잘리지 않은 UDP 응답을 보낼 수 있다 — §4

쓰인 곳: 강의 수정 이력 L11
(phase 77 step 3에서 쓰일 곳) `tcp-udp.udp`·`tcp-udp.transport-choice`(DNS는 주로 UDP, TCP도 — L11)
(phase 77 step 7) `tcp-udp.udp`(§1 — DNS는 주로 UDP, 큰 메시지 등에는 TCP도 — L11)
(phase 77 step 8) `tcp-udp.transport-choice`(DNS는 응답이 클 때 등에는 TCP도 — L11), 도식 `transport-choice` 「짧은 질의」 캡션
(phase 79 step 5에서 쓰일 곳) `dns.dns-transport`(§1 — 영역 전체 전송은 늘 TCP, 큰 응답에 TCP, TCP를 막으면 이름 풀이가 실패할 수 있다, §4 — 잘린 응답 뒤 TCP로 다시 묻는다, §5 — 서버·리졸버 모두 TCP 필수), 기출 대조(`exam-notes.md` 「phase 79 step 5」 문단 — [기출 2025-05-25 #42]·[기출 2026-02-01 #8]·[기출 2026-05-17 #11])
(phase 79 step 8) `dns.dns-transport`(§4 — 한도에 들어가게 잘라 TC를 켠다·클라이언트는 TCP로 다시 묻는다, §5 — 구현은 모두 TCP 필수·처음부터 TCP로 물어도 된다·같은 연결로 응답한다), 도식 `dns-transport`, 문항 n243 해설

## RFC 1034 — Domain Names - Concepts and Facilities
https://www.rfc-editor.org/rfc/rfc1034

- 반복적(iterative) 질의에서는 질의를 받은 서버가 다른 서버를 알려 주고(referral), 그 서버에 다시 묻는 일은 묻는 쪽이 한다 — §4.3.1
- 재귀적(recursive) 질의는 네임 서버가 해 줄지 고를 수 있는 선택 기능이다. 묻는 쪽이 질의의 RD(recursion desired) 비트로 청하고, 서버는 RD로 청하지 않은 질의에 재귀를 하지 않는다 — §4.3.1
- 리졸버는 먼저 자기 정보(캐시 포함)에서 답을 찾고, 없으면 아는 네임 서버 가운데 가장 가까운 것부터 차례로 묻고, 받은 답은 캐시에 넣은 뒤 클라이언트에 돌려준다 — §5.3.3
- (phase 77 step 2, 2026-11-09 rfc-editor.org 원문) 이 문서는 Domain Name System(DNS)을 소개하는 문서다 — §1 STATUS OF THIS MEMO. 설계 목표의 하나는 이름으로 호스트 주소를 찾아 쓰는 것이다 — §2.2
- (phase 79 step 0, 2026-11-12 rfc-editor.org 원문 — Internet Standard(STD 13) 그대로, RFC 2181·2308·5936 등이 고쳤다) **DNS 전의 방식**: 이름과 주소의 짝을 한 기관(NIC)이 파일 하나(HOSTS.TXT)로 관리하고 모든 호스트가 그 파일을 내려받아 썼다.
  호스트가 늘자 파일을 나눠 주는 부담이 감당할 수 없게 커졌고, 기관마다 자기 이름을 스스로 관리하고 싶어 했다 — §2.1
- (phase 79 step 0) **설계 목표**: 데이터베이스가 크고 자주 바뀌므로 **여러 곳에 나눠 관리하고(분산), 성능을 위해 받은 것을 가까이 저장해 둔다(캐시)**. 이름으로 호스트 주소뿐 아니라 메일함 정보 같은 다른 정보도 찾을 수 있게 하고, 데이터에 유형을 붙여 질의를 한 유형으로 좁힐 수 있게 한다.
  데이터를 얻는 비용·바뀐 것이 퍼지는 속도·캐시의 정확도 사이에서 무엇을 고를지는 데이터의 출처(영역 관리자)가 정한다 — §2.2
- (phase 79 step 0) **쓰임의 가정**: 대부분의 데이터는 아주 천천히 바뀐다. 이름의 관리 책임을 나누는 경계는 대개 조직이고, 조직은 여분의 네임 서버를 둔다. 정보에 닿을 수 있는 것이 즉시 갱신보다 중요해서, 바뀐 것은 사본들로 차츰 퍼지고 사본에는 다시 받아 올 시한이 붙는다.
  질의를 다른 서버가 답해야 할 때의 두 방법 — 첫 서버가 대신 끝까지 찾아 주는 **재귀**(recursive)와, 다른 서버를 알려 주고 묻는 쪽이 이어 묻게 하는 **반복**(iterative). **반복 방식은 반드시 구현해야 하고 재귀는 선택이다** — §2.3
- (phase 79 step 0) **세 구성 요소**: ① 이름 공간(나무 구조)과 이름에 딸린 자원 레코드, ② **네임 서버** — 나무의 일부에 대한 완전한 정보를 갖고(그 부분의 **권한**(authority)을 가졌다고 한다), 다른 부분은 그것을 아는 네임 서버를 가리킨다. 권한 있는 정보는 **영역**(zone) 단위로 묶여 여러 네임 서버에 나눠 둔다.
  ③ **리졸버** — 클라이언트의 요청을 받아 네임 서버에서 정보를 얻어 내는 프로그램으로, 네임 서버에 직접 답을 얻거나 다른 서버를 알려 주는 답(referral)을 따라간다 — §2.4
- (phase 79 step 0) **이름 공간**: 나무 구조이고 노드마다 **레이블**이 있으며 레이블은 0~63옥텟이다. 길이 0인 레이블은 루트 하나만 쓴다. 노드의 도메인 이름은 그 노드에서 루트까지의 레이블 목록이고, **가장 구체적인(루트에서 먼) 것부터 왼쪽에서 오른쪽으로** 적는다.
  이름을 비교할 때 **대소문자를 가리지 않는다**. 완전한 이름은 루트의 빈 레이블로 끝나므로 **끝에 점이 붙고**(절대 이름), 끝의 점이 없으면 그 지역의 도메인으로 채워질 상대 이름일 수 있다. 이름 전체(레이블과 길이 옥텟의 합)는 **255옥텟**을 넘지 않는다.
  **도메인**은 그 도메인 이름이 가리키는 노드와 그 아래 전체이고, 어떤 도메인 안에 든 도메인이 그 **서브 도메인**이다(이름이 상대 도메인의 이름으로 끝나는지로 알 수 있다) — §3.1
- (phase 79 step 0) DNS 명세는 나무의 모양이나 레이블을 고르는 규칙을 정하지 않는다. 다만 특수 문자나 숫자로 시작하는 레이블은 더 좁은 규칙에 기대는 옛 소프트웨어를 망가뜨리기 쉽다 — §3.2
- (phase 79 step 0) **권장 이름 문법**: 레이블은 영문자로 시작해 영문자·숫자로 끝나고 가운데에는 영문자·숫자·하이픈만 쓴다(옛 ARPANET 호스트 이름 규칙). 레이블은 63자 이하다. 새 호스트 이름은 옛 HOSTS.TXT의 규칙을 따르는 것이 좋다 — §3.5(RFC 1035 §2.3.1과 같다. 숫자로 시작해도 된다는 완화는 아래 RFC 1123 항목의 §2.1)
- (phase 79 step 0) **자원 레코드의 칸**: 소유자(owner — 레코드가 있는 도메인 이름), 유형(16비트), 클래스(16비트 — IN은 인터넷), **TTL**(32비트, 초 단위 — 주로 리졸버가 레코드를 캐시에 둘 때 쓰고, 버리기 전까지 캐시에 둘 수 있는 시간을 말한다), RDATA(유형에 따른 데이터) — §3.6
- (phase 79 step 0) **TTL의 쓰임**: TTL은 캐시에 둘 수 있는 시간의 한도이고, 영역의 원본 데이터에는 걸리지 않는다(원본은 영역의 갱신 규칙으로 시한이 정해진다). TTL은 그 데이터가 나온 영역의 관리자가 정한다.
  **TTL을 짧게 잡으면 캐시를 덜 쓰게 되고, 0이면 캐시에 두지 못한다**. 인터넷의 성능을 생각하면 보통 호스트의 TTL은 며칠 단위가 알맞다. **바뀔 것을 미리 알면 바꾸기 전에 TTL을 줄여 바뀌는 동안의 어긋남을 줄이고, 바꾼 뒤 되돌린다** — §3.6
- (phase 79 step 0) **영역**: 네임 서버는 영역의 데이터로 질의에 답하는 것이 본업이다. 응답은 언제나 자기 데이터만으로 만들 수 있고, 답이거나 답에 「더 가까운」 다른 네임 서버를 알려 주는 것이다. **영역 하나를 여러 네임 서버가 맡아 한 서버나 통신 경로가 멈춰도 쓸 수 있게 하고, 모든 영역이 적어도 두 서버에 있어야 한다**.
  네임 서버는 응답에 그것이 권한 있는 데이터인지 아닌지 표시한다 — §4.1
- (phase 79 step 0) 이름 공간을 노드 사이에서 잘라(cut) 나누면 이어진 한 덩어리가 영역 하나이고, 영역은 그 안의 모든 이름에 권한을 갖는다. 영역에서 루트에 가장 가까운 노드의 이름으로 영역을 부르는 일이 많다. 어떤 조직이 하위 나무를 직접 맡고 싶은 곳에서 자르고,
  자기 영역을 맡은 조직은 그 안의 데이터를 바꾸고 그 아래에 다시 하위 영역을 **위임**할 수 있다 — §4.2. 영역의 데이터는 영역 안 노드의 권한 있는 데이터, 영역 꼭대기를 정하는 데이터(그 영역의 서버들을 적은 NS 레코드와 SOA 레코드 하나), 아래로 위임한 하위 영역을 적은 NS 레코드, 하위 영역 서버의 주소(glue)다.
  영역 전체는 레코드 묶음으로 서버 사이에 옮길 수 있다 — §4.2.1. 하위 영역을 위임받으려면 부모 영역 관리자의 동의를 얻고, 여분의 네임 서버를 갖추고, 마지막에 부모 영역에 NS 레코드(와 glue)를 넣는다 — §4.2.2
- (phase 79 step 0) **질의와 응답**: 질의와 응답은 같은 메시지 형식으로 오가고, 질의에는 찾는 이름(QNAME)·유형·클래스가 든다. **비재귀** 모드의 서버는 자기 데이터만으로 오류·답·더 가까운 서버로의 안내(referral) 가운데 하나로 답하고, 모든 네임 서버가 이것을 구현해야 한다.
  **재귀** 모드의 서버는 리졸버 노릇을 해서 답이나 오류만 돌려주고 다른 서버를 알려 주지 않는다. 재귀는 선택 기능이고, 서버는 재귀를 쓸 수 있는 클라이언트를 제한할 수 있다.
  재귀는 클라이언트가 질의의 RD 비트로 청하고 서버가 응답의 RA 비트로 해 줄 수 있음을 알릴 때만 쓰며, 서버는 RD로 청하지 않은 질의에 재귀를 하지 않는다. 재귀는 바로 답만 쓸 수 있는 단순한 클라이언트나, 클라이언트마다 캐시를 따로 두지 않고 한곳에 모으고 싶을 때 쓸모 있다 — §4.3.1
- (phase 79 step 0) 서버의 처리 순서에서, 찾아 내려가다 영역의 권한 있는 데이터 밖(아래로 위임한 곳의 NS 레코드)에 닿으면 그 NS 레코드를 응답의 권한 칸에, 아는 주소를 추가 칸에 넣어 **다른 서버를 알려 주는 응답(referral)**을 만든다 — §4.3.2 3.b
- (phase 79 step 0) **영역 유지와 전송**: 영역을 맡은 서버들 가운데 하나가 **주(primary, master) 서버**이고, 바꾸는 일은 대개 주 서버의 영역 파일을 고쳐서 한다. 나머지 **보조(secondary) 서버**는 정한 간격으로 바뀌었는지 확인해 바뀌었으면 새 사본을 받아 온다.
  바뀌었는지는 SOA의 **SERIAL** 칸으로 보고, 영역을 바꿀 때마다 SERIAL을 늘린다. 확인 간격은 SOA의 REFRESH·RETRY·EXPIRE가 정한다 — 보조 서버는 영역을 받은 뒤 REFRESH초를 기다렸다가 주 서버에 SOA를 물어 SERIAL을 견주고, 확인하지 못하면 RETRY초마다 다시 해 보며, EXPIRE 동안 끝내 확인하지 못하면 그 사본을 낡은 것으로 보고 버린다.
  바뀌었으면 **AXFR** 요청으로 영역을 받아 오는데, 정확해야 하므로 **TCP 같은 믿을 수 있는 프로토콜로** 한다 — §4.3.5
- (phase 79 step 0) **리졸버**: 리졸버는 사용자 프로그램과 네임 서버를 잇는 프로그램이고, 요청한 프로그램과 같은 컴퓨터에 있다. **리졸버의 중요한 목표는 이전 결과를 캐시에 두고 거기서 답해, 대부분의 요청에서 네트워크 지연과 네임 서버의 부하를 없애는 것**이다. 여럿이 함께 쓰는 캐시가 더 효율적이다 — §5.1
- (phase 79 step 0) **스텁 리졸버**: 이름 풀이를 자기 컴퓨터에서 하지 않고 재귀 질의를 해 주는 네임 서버에 맡기는 리졸버다. 그 서버들의 주소 목록만 있으면 되고 보통 설정 파일에 적는다. 네임 서버는 어떤 클라이언트에게든 재귀를 거절할 수 있다 — §5.3.1
- (phase 79 step 0) 리졸버의 캐시는 TTL이 지난 레코드를 버릴 책임이 있다 — §5.3.2 CACHE. 처리 순서의 4단계에서, 응답이 답이거나 이름이 없다는 오류면 캐시에 넣고 클라이언트에 돌려주고, **더 나은 위임(다른 서버)을 알려 주면 그 위임 정보를 캐시에 넣고 2단계(물을 서버 고르기)로 돌아간다** — §5.3.3
- (phase 79 step 3, 2026-11-12 rfc-editor.org 원문 다시 확인) **물을 서버 고르기(2단계)**: 찾는 이름에서 시작해 그 부모, 그 위 부모로 루트 쪽으로 올라가며 가지고 있는 NS 레코드를 찾고, 처음 찾은 단계의 서버들을 물을 목록으로 삼는다(예: 이름이 `Mockapetris.ISI.EDU`면 그 이름, `ISI.EDU`, `EDU`, 루트의 차례로 NS 레코드를 찾는다) — §5.3.3 Step 2. 그래서 앞 질의에서 받은 위임 정보가 캐시에 있으면 루트부터 다시 묻지 않고 가장 가까운 영역의 서버부터 묻는다
- (phase 79 step 5, 2026-11-12 rfc-editor.org 원문 다시 확인) **레코드 묶음 안의 차례**: 한 이름에 붙은 레코드들의 차례에는 뜻이 없고, 네임 서버·리졸버를 비롯한 DNS의 어느 부분도 그 차례를 지켜 줄 필요가 없다 — §3.6.
  그래서 이름을 주소로 바꾸는 리졸버 기능은 받은 주소들을 다시 정렬하거나 그 가운데 「가장 나은」 하나를 골라 줄 수 있다. 주소를 여럿 돌려주기를 권한다 — §5.2.1의 1번
- (phase 79 step 5) **이 문서가 드는 레코드 유형과 데이터**: A(호스트 주소 — 인터넷 클래스에서 32비트 IP 주소), CNAME(별칭의 정식 이름 — 도메인 이름), MX(그 도메인의 메일 교환 호스트 — 16비트 우선순위 값(**작을수록 앞선다**)과 메일을 받아 줄 호스트 이름),
  NS(그 도메인의 권한 있는 네임 서버 — 호스트 이름), PTR(이름 공간의 다른 곳을 가리킨다 — 도메인 이름), SOA(권한 영역의 시작 — 여러 필드) — §3.6
- (phase 79 step 5) **레코드를 글자로 적는 꼴**: 줄 맨 앞이 소유자이고, 줄이 빈칸으로 시작하면 바로 앞 레코드와 소유자가 같다. 소유자 뒤에 TTL·클래스·유형을 적되 유형 이름을 늘 마지막에 두어 헷갈리지 않게 하고(TTL은 정수), 예에서는 클래스 IN과 TTL을 흔히 뺀다. 그 뒤가 데이터다.
  대부분 한 줄이고 괄호로 여러 줄에 걸칠 수 있다 — §3.6.1. 이 문서의 영역 예에서 여러 줄로 적은 것은 SOA뿐이고, 한 영역의 레코드는 클래스가 모두 같아야 하므로 첫 레코드만 클래스를 적어도 된다 — §6.1(예의 이름·값은 옮기지 않는다)
- (phase 79 step 5) **CNAME**: 같은 대상(호스트·메일함)을 가리키는 이름이 여럿이면 하나를 정식(canonical) 이름, 나머지를 별칭(alias)으로 본다. CNAME 레코드는 **소유자 이름을 별칭으로 정하고 데이터에 정식 이름을 적는다**.
  CNAME이 있는 이름에는 다른 데이터를 두지 않는 것이 좋다(should) — 별칭과 정식 이름의 데이터가 서로 달라지지 않고, 캐시한 CNAME을 다른 유형 때문에 권한 있는 서버에 다시 확인하지 않아도 되게 하려는 것이다.
  찾는 유형의 레코드가 없고 CNAME이 있으면 네임 서버는 그 CNAME을 응답에 넣고 정식 이름으로 다시 찾는다(CNAME 자체를 묻는 질의는 빼고). 다른 이름을 가리키는 레코드(예: 주소 → 이름의 PTR)는 별칭이 아니라 정식 이름을 가리켜야 한다 — §3.6.2
- (phase 79 step 5) **주소 → 이름**: 리졸버의 이 기능은 32비트 IP 주소의 옥텟을 거꾸로 늘어놓아 이름 조각으로 쓰고 끝에 `IN-ADDR.ARPA`를 붙여 PTR을 묻고, 그 답이 그 호스트의 주된(primary) 이름이다(예: 주소 `1.2.3.4`면 `4.3.2.1.IN-ADDR.ARPA`의 PTR) — §5.2.1의 2번

쓰인 곳: 면접 수정 이력 I11
(phase 77 step 2) `ports.well-known-ports`(DNS 항목 — 풀어 쓴 이름 Domain Name System, 도메인 이름으로 호스트의 IP 주소를 찾아 준다)
(phase 77 step 7) `tcp-udp.udp`(§2.2 — DNS는 이름으로 호스트 주소를 찾는다)
(phase 79 step 0에서 쓰일 곳) `dns.dns`(§2.1 — 파일 하나로 관리하던 방식의 한계, §2.2 — 분산·캐시, 주소 말고 메일 정보 등도 찾는다, §2.4 — 네임 서버·리졸버·영역), `dns.hosts-file`(§2.1),
`dns.domain-hierarchy`(§3.1 — 레이블·루트·오른쪽이 위 단계·대소문자·끝의 점·255옥텟·도메인과 서브 도메인, §3.5 — 권장 이름 문법), `dns.name-servers`(§2.4 — 권한, §4.1 — 영역을 여러 서버가 맡는다, §5.3.1 — 스텁 리졸버),
`dns.dns-zone`(§4.1 — 둘 이상, §4.2·§4.2.1·§4.2.2 — 영역·위임·꼭대기의 NS와 SOA, §4.3.5 — 주·보조 서버, SERIAL·REFRESH·RETRY·EXPIRE, AXFR은 TCP), `dns.name-resolution`(§4.3.2 3.b·§5.3.3 — referral과 위임 정보의 캐시, phase 79 step 3 — §5.3.3 Step 2: 캐시의 위임 정보로 가장 가까운 영역의 서버부터 묻는다),
`dns.recursive-iterative-query`(§2.3·§4.3.1 — 재귀는 선택, RD·RA, 반복은 필수), `dns.dns-cache-ttl`(§3.6 — TTL의 쓰임·0이면 캐시 금지·바꾸기 전에 줄이기, §5.1 — 캐시가 지연과 서버 부하를 줄인다), 강의 수정 이력 L48·L50·L51
(phase 79 step 5에서 쓰일 곳) `dns.resource-records`(§3.6 — 유형과 데이터, §3.6.1 — 글자로 적는 꼴, §3.6.2 — CNAME), `dns.reverse-lookup`(§5.2.1의 2번 — 옥텟을 거꾸로 하고 `IN-ADDR.ARPA`를 붙여 PTR을 묻는다), `dns.dns-round-robin`(§3.6·§5.2.1의 1번 — 레코드 묶음의 차례에는 뜻이 없고 리졸버가 다시 정렬하거나 하나를 고를 수 있다)

## RFC 1035 — Domain Names - Implementation and Specification
https://www.rfc-editor.org/rfc/rfc1035

- CNAME 레코드의 데이터는 소유자 이름의 정식(canonical) 이름이고, 소유자 이름이 별칭이다 — §3.3.1
- NS 레코드의 데이터(NSDNAME)는 그 도메인에 권한이 있는 **호스트의 도메인 이름**이다. 주소가 아니다 — §3.3.11
- SOA 레코드는 영역(zone)의 시작을 알리고 다음을 담는다 — 원래(주) 네임 서버 이름(MNAME), 영역 책임자의 메일 주소(RNAME), 영역 버전 번호(SERIAL),
  다시 가져오기 간격(REFRESH), 실패 뒤 재시도 간격(RETRY), 권한을 잃기까지의 최대 시간(EXPIRE), 레코드에 붙일 최소 TTL(MINIMUM) — §3.3.13
- DNS는 UDP 53번과 TCP 53번을 모두 쓴다. 일반 질의에는 UDP를 권하고, 영역 전송은 TCP로 한다 — §4.2.1, §4.2.2
- (phase 79 step 0, 2026-11-12 rfc-editor.org 원문 — Internet Standard(STD 13) 그대로, RFC 2181·2308·5936·7766 등이 고쳤다) **두 쪽에서 본 DNS**: 사용자에게 이름 나무는 하나의 정보 공간이고, 데이터가 여러 네임 서버에 나뉘어 있다는 것은 리졸버가 감춘다.
  리졸버에게는 이름 공간의 데이터가 여러 네임 서버에 나뉘어 있고 같은 데이터가 둘 이상의 서버에 겹쳐 있다. 리졸버는 아는 네임 서버 하나에서 시작해, 원하는 정보나 다른 서버를 알려 주는 답(referral)을 받고, 그것을 따라가며 다른 서버를 알아 간다.
  네임 서버가 다루는 데이터는 둘이다 — 영역(이름 공간의 잘라 낸 하위 나무 하나에 대한 완전한 데이터, 권한 있는 데이터)과, 리졸버가 얻어 둔 캐시 데이터. **캐시 데이터는 시한이 지나면 버린다** — §2.1
- (phase 79 step 0) **흔한 구성**: 리졸버와 그 캐시는 보통 호스트 운영체제의 일부다(§2.2 첫 그림). **DNS는 모든 영역을 둘 이상의 네임 서버가 맡게 하고, 정해 둔 보조 서버가 DNS의 영역 전송으로 주 서버에서 영역을 받아 오고 바뀌었는지 확인한다**.
  여러 호스트가 캐시 몇 개를 함께 쓰게 하려고 리졸버 대신 **스텁 리졸버**를 두고, 스텁 리졸버는 재귀를 해 주는 네임 서버의 리졸버에 질의를 넘기는 앞단 노릇을 한다 — §2.2
- (phase 79 step 0) 권장 이름 문법(영문자로 시작, 영문자·숫자로 끝, 가운데는 영문자·숫자·하이픈, 레이블 63자 이하)은 RFC 1034 §3.5와 같다 — §2.3.1. 문자열(레이블·도메인 이름) 비교는 모두 대소문자를 가리지 않고, 들어온 데이터의 대소문자는 될 수 있는 대로 그대로 둔다 — §2.3.3.
  크기 한도: 레이블 63옥텟 이하, 이름 255옥텟 이하, UDP 메시지 512옥텟 이하. TTL은 이 문서에서 「부호 있는 32비트 수의 양수」로 적었는데 RFC 2181 §8이 부호 없는 수로 바로잡았다(아래 RFC 2181 항목) — §2.3.4
- (phase 79 step 0) **TTL 칸**: 그 레코드를 캐시에 둘 수 있는 시간이고, 그 시간이 지나면 정보의 출처에 다시 물어야 한다. **0이면 지금 처리 중인 일에만 쓰고 캐시에 두지 않는다**. 아주 자주 바뀌는 데이터에 0을 쓸 수 있다 — §3.2.1. 메시지 안의 레코드에서 TTL은 **초 단위**의 32비트 수다 — §4.1.3(이 절은 부호 없는 수로 적는다)
- (phase 79 step 0) **메시지 헤더**: QR — 질의(0)인지 응답(1)인지. AA — 응답한 네임 서버가 그 이름의 권한 있는 서버라는 표시. TC — 전송 경로가 허락한 것보다 길어 잘렸다는 표시. **RD(Recursion Desired)** — 질의에 켤 수 있고 응답에 그대로 옮겨지며, 켜져 있으면 네임 서버에게 재귀로 찾으라고 청한다(재귀 지원은 선택).
  **RA(Recursion Available)** — 응답에서 그 네임 서버가 재귀를 해 줄 수 있는지 알린다 — §4.1.1
- (phase 79 step 0) **시간의 셈**: 레코드의 TTL과 갱신 타이머는 초 단위 32비트 타이머다. 영역의 데이터는 TTL이 그대로이고, **캐시에 든 데이터의 TTL은 시간이 지나며 줄어든다**. 캐시의 시각은 절대 시각으로 저장했다가 질의에 답할 때 남은 시간(상대값)으로 바꿔 넣고, 바꾼 값이 음수면 시한이 지난 것이라 쓰지 않는다 — §6.1.3
- (phase 79 step 0) **캐시 쓰기**: 리졸버는 응답으로 받은 데이터를 대개 모두 캐시에 넣는다. 다만 잘려서 일부만 받았을지 모르는 레코드 묶음, 믿기 어려운 응답 등은 넣지 않고, **캐시 데이터를 권한 있는 데이터보다 앞세우지 않는다** — §7.4
- (phase 79 step 5, 2026-11-12 rfc-editor.org 원문 다시 확인) **레코드의 칸(메시지 안의 꼴)**: NAME(소유자 이름 — 이 레코드가 딸린 노드) · TYPE(2옥텟 유형 코드) · CLASS(2옥텟 클래스 코드) · TTL(32비트) · RDLENGTH(데이터 길이, 옥텟 수) · RDATA(유형·클래스에 따라 꼴이 다른 데이터)의 차례다 — §3.2.1.
  (같은 절의 「SOA는 캐시하지 않게 TTL 0으로 보낸다」는 쓰지 않는다 — 이 phase에 필요 없고, 뒤 문서 RFC 2308 §5는 SOA의 TTL을 부정 응답의 캐시 시간에 쓴다)
- (phase 79 step 5) **유형 값**: A 1, NS 2, CNAME 5, SOA 6, PTR 12, MX 15, TXT 16(MD·MF는 MX로 바뀌어 쓰지 않는다) — §3.2.2. **클래스**: IN(1)은 인터넷이다 — §3.2.4
- (phase 79 step 5) **A**: 데이터는 32비트 인터넷 주소 하나다. 주소가 여럿인 호스트는 A 레코드를 여럿 갖는다. 영역 파일에서는 점으로 나눈 십진수 넷으로 적는다 — §3.4.1
- (phase 79 step 5) **MX**: 데이터는 PREFERENCE(16비트 — 같은 소유자의 MX들 사이에서 이 레코드를 얼마나 앞세울지, **값이 작을수록 먼저**)와 EXCHANGE(소유자 이름의 메일을 받아 줄 호스트의 도메인 이름)다 — §3.3.9.
  메일을 보낼 때는 받는 주소의 메일 도메인 부분으로 MX를 찾아 거기 적힌 호스트들을 우선순위대로 쓰고, 주소의 앞부분(로컬 부분)은 보지 않는다 — §8.1
- (phase 79 step 5) **PTR**: 데이터는 이름 공간의 다른 곳을 가리키는 도메인 이름이다. CNAME 같은 특별한 처리를 하지 않는 단순한 데이터이고, 특별한 도메인(`IN-ADDR.ARPA`)에서 쓴다 — §3.3.12
- (phase 79 step 5) **TXT**: 설명하는 글자열을 하나 이상 담는다. 그 글이 무슨 뜻인지는 레코드가 놓인 도메인이 정한다 — §3.3.14
- (phase 79 step 5) **SOA(L15에 더해)**: SERIAL은 영역 원본의 부호 없는 32비트 판 번호이고 영역 전송으로 옮겨도 그대로이며, 최댓값을 넘으면 처음으로 돌아가므로 순환 산술로 견준다. REFRESH·RETRY·EXPIRE는 32비트 시간 값이고 **모든 시간의 단위는 초**다.
  필드 대부분은 네임 서버의 영역 유지에만 쓰인다. MINIMUM은 원래 영역의 모든 레코드 TTL의 아래 한도로 정했는데 이 뜻은 RFC 2308 §4가 바꿨다(아래 RFC 2308 항목) — §3.3.13
- (phase 79 step 5) **IN-ADDR.ARPA**: 인터넷 주소로 호스트 이름을 찾게 만든 특별한 도메인이다. `IN-ADDR.ARPA` 앞에 레이블을 넷까지 두고, 레이블 하나가 주소의 옥텟 하나다(0~255의 십진수, 앞자리 0은 뺀다). 호스트 주소는 레이블 넷을 다 적은 이름이고 **주소를 거꾸로 적는다**(절의 예: 주소 `10.2.0.52`의 데이터는 `52.0.2.10.IN-ADDR.ARPA`에 있다).
  거꾸로 적어 읽기는 어색하지만, 그 덕에 한 네트워크의 주소 범위를 그대로 한 영역으로 위임할 수 있다. 주소 노드의 PTR은 그 호스트의 주된 이름을 가리킨다. 이 도메인과 그 호스트의 보통 이름은 서로 다른 영역에 있어 두 쪽의 데이터가 어긋날 수 있다 — §3.5
- (phase 79 step 5) **UDP**: 포트 53을 쓰고, UDP로 나르는 메시지는 IP·UDP 헤더를 빼고 **512바이트**로 제한된다. 더 긴 메시지는 잘라 헤더의 TC 비트를 켠다. 영역 전송에는 UDP를 쓸 수 없고, 보통의 질의에는 UDP를 권한다. UDP 질의는 잃을 수 있어 다시 보내는 방법이 필요하다 — §4.2.1.
  **TCP**: 포트 53을 쓰고, 메시지 앞에 메시지 길이를 적은 2바이트를 붙인다 — §4.2.2
- (phase 79 step 5) **영역 파일(master file)의 꼴**: 대부분 한 줄에 한 항목이고 괄호로 여러 줄에 걸칠 수 있다. 빈칸·탭이 칸을 가르고, `;`부터 줄 끝은 주석이며 빈 줄과 주석은 어디에나 둘 수 있다. 제어 항목 `$ORIGIN`(상대 이름에 붙일 기준 이름)·`$INCLUDE`(다른 파일 끼우기)가 있다.
  레코드 항목은 소유자 이름으로 시작하거나(소유자를 새로 정한다) 빈칸으로 시작한다(바로 앞 소유자). 그 뒤는 `[TTL] [클래스] 유형 데이터` 또는 `[클래스] [TTL] 유형 데이터`이고, TTL·클래스를 빼면 마지막으로 적은 값을 쓴다.
  점으로 끝나는 이름은 완전한(절대) 이름이고, 점이 없으면 기준 이름이 뒤에 붙는다. 홀로 쓴 `@`는 지금의 기준 이름이다 — §5.1
- (phase 79 step 5) **영역 파일로 영역을 읽을 때**: 오류가 하나라도 있으면 그 영역을 읽지 않는 것이 좋다. 파일의 레코드는 클래스가 모두 같아야 하고, **영역 꼭대기에 SOA가 정확히 하나** 있어야 한다 — §5.2.
  이 절의 영역 파일 예는 SOA를 맨 앞에 괄호로 여러 줄에 걸쳐 적고 수마다 `;` 주석을 단다 — §5.3(예의 이름·값은 옮기지 않는다)
- (phase 79 step 5) **메일 주소를 이름 꼴로 적는 법**: `<로컬 부분>@<메일 도메인>` 꼴의 메일함은, 로컬 부분을 레이블 하나로 만들어 메일 도메인 이름 앞에 붙인 도메인 이름으로 적는다 — 곧 `@` 자리가 점이 된다. 로컬 부분에 점이 있으면 영역 파일에서 그 점 앞에 `\`를 붙여야 한다 — §8.
  SOA의 RNAME이 이 꼴이고, §5.3 예 아래 설명도 `\`로 책임자 메일함의 점을 적었다고 밝힌다

쓰인 곳: 강의 수정 이력 L11, L15
(phase 77에서 쓰일 곳) `ports.well-known-ports`(§4.2.1·§4.2.2 — DNS는 53번을 UDP와 TCP 둘 다 쓴다. IANA 레지스트리의 53 `domain` — 아래 IANA 항목)
(phase 79 step 0에서 쓰일 곳) `dns.dns`(§2.1 — 데이터가 여러 서버에 나뉘어 있고 리졸버가 감춘다), `dns.domain-hierarchy`(§2.3.1·§2.3.3·§2.3.4 — 이름 문법·대소문자·길이 한도), `dns.name-servers`(§2.2 — 스텁 리졸버와 재귀 서버),
`dns.dns-zone`(§2.2 — 영역은 둘 이상의 서버가 맡고 보조 서버는 영역 전송으로 받는다), `dns.name-resolution`(§4.1.1 QR — 질의와 응답), `dns.recursive-iterative-query`(§4.1.1 RD·RA),
`dns.dns-cache-ttl`(§2.1 — 캐시는 시한이 지나면 버린다, §3.2.1·§4.1.3 — TTL의 뜻·초 단위·0, §6.1.3 — 캐시의 TTL은 줄어든다, §7.4 — 캐시에 넣는 것)
(phase 79 step 5에서 쓰일 곳) `dns.resource-records`(§3.2.1 — 레코드의 칸, §3.2.2·§3.2.4 — 유형·클래스 IN, §3.4.1 — A, §3.3.9·§8.1 — MX, §3.3.12 — PTR, §3.3.14 — TXT, §5.1 — 영역 파일의 꼴),
`dns.soa-record`(§3.3.13 — 필드·초 단위·SERIAL, §5.2·§5.3 — 영역 꼭대기에 정확히 하나·예 파일은 SOA로 시작, §8 — RNAME의 `@` 자리는 점), `dns.reverse-lookup`(§3.5 — `IN-ADDR.ARPA`, 거꾸로 적는 까닭, 두 영역이 어긋날 수 있다, §3.3.12 — PTR),
`dns.dns-transport`(§4.2.1 — UDP 512바이트·TC, 영역 전송은 UDP 불가, §4.2.2 — TCP 53), 기출 대조(`exam-notes.md` 「phase 79 step 5」 문단)

## RFC 5681 — TCP Congestion Control
https://www.rfc-editor.org/rfc/rfc5681

- 혼잡 윈도우(cwnd)는 TCP가 보낼 수 있는 데이터 양을 제한하는 상태 변수다. 수신 윈도우(rwnd)는 받는 쪽이 가장 최근에 알린 윈도우다.
  TCP는 확인된 가장 큰 순서 번호에 cwnd와 rwnd 가운데 작은 값을 더한 것보다 큰 순서 번호의 데이터를 보내면 안 된다(MUST NOT) — §2, §3.1
- 이 문서가 정하는 혼잡 제어 알고리즘은 느린 시작, 혼잡 회피, 빠른 재전송, 빠른 회복 넷이다 — §3
- 중복 ACK는 보낸 데이터가 아직 확인되지 않은 상태에서, 데이터 없이, 지금까지 받은 가장 큰 확인 응답 번호와 같은 번호로, 광고 윈도우도 같게 들어온 ACK다 — §2
- 혼잡 윈도우와 함께 쓰는 상태 변수의 이름은 느린 시작 임계치(ssthresh)다 — §3.1
- 느린 시작 동안에는 ACK 하나마다 cwnd를 최대 SMSS만큼 늘리고, 혼잡 회피 동안에는 RTT마다 대략 세그먼트 하나만큼 늘린다 — §3.1
- 재전송 타이머가 만료되면 ssthresh를 max(FlightSize/2, 2×SMSS) 이하로 정하고 cwnd를 세그먼트 하나(손실 윈도우)로 줄인다 — §3.1
- 중복 ACK **3개**를 받으면 잃어버린 것으로 보이는 세그먼트를 타이머 만료를 기다리지 않고 다시 보낸다(빠른 재전송) — §3.2
- 빠른 회복: 세 번째 중복 ACK에서 ssthresh를 위 식으로 정하고 cwnd를 ssthresh + 3×SMSS로 둔다. 중복 ACK가 더 올 때마다 cwnd를 SMSS만큼 늘린다.
  새 데이터를 확인하는 ACK가 오면 cwnd를 ssthresh로 줄이고 혼잡 회피로 이어 간다 — §3.2

쓰인 곳: 강의 수정 이력 L12, L14, 면접 수정 이력 I13
(phase 77 step 3에서 쓰일 곳) `tcp-udp.tcp`(§2·§3.1 — 확인받지 않고 보낼 수 있는 양의 상한은 rwnd와 cwnd 가운데 작은 값: 받는 쪽과 네트워크가 함께 보내는 양을 묶는다는 한 줄. 방식은 phase 84), 강의 수정 이력 L46

## RFC 2018 — TCP Selective Acknowledgment Options
https://www.rfc-editor.org/rfc/rfc2018

- 누적 확인 응답만 쓰면 보낸 쪽은 잃어버린 세그먼트마다 왕복 시간을 기다리거나, 이미 제대로 받은 세그먼트까지 다시 보내야 한다 — §1
- SACK을 쓰면 받는 쪽이 이미 받은 데이터 구간을 알려 주므로, 보낸 쪽은 실제로 빠진 세그먼트만 다시 보낼 수 있다 — §1, §3
- SACK은 연결 설정 때 SYN 세그먼트에 SACK-Permitted 옵션을 실어 켠다 — §1, §2

쓰인 곳: 강의 수정 이력 L13

## RFC 6068 — The 'mailto' URI Scheme
https://www.rfc-editor.org/rfc/rfc6068

- mailto URI의 문법은 `mailto:` 바로 뒤에 받는 주소가 온다. `//`가 없다 — §2
- 예: `mailto:chris@example.com` — §6.1

쓰인 곳: 강의 수정 이력 L16

## RFC 3986 — Uniform Resource Identifier (URI): Generic Syntax
https://www.rfc-editor.org/rfc/rfc3986

- URI는 위치(locator)로도, 이름(name)으로도, 둘 다로도 분류할 수 있다 — §1.1.3
- `mailto:John.Doe@example.com`이 URI 예시로 실려 있다 — §1.1.2
- authority 앞에는 `//`가 붙는다. authority가 있으면 경로는 비어 있거나 `/`로 시작한다 — §3, §3.2
- userinfo에 `사용자:비밀번호`를 넣는 형식은 쓰지 않도록 했다(deprecated) — §3.2.1
- 쿼리는 흔히 `key=value` 짝으로 식별 정보를 나르는 데 쓰인다 — 표준이 그 꼴을 강제하지는 않는다 — §3.4
- 프래그먼트는 `#`로 시작해 URI 끝까지다 — §3.5
- (phase 73) IPv4 주소를 글자로 적을 때는 점으로 구분한 십진 표기(dotted-decimal)를 쓴다 — 0~255 범위의 십진수 넷을 `.`으로 이은 꼴이다. 이 문서는 그 넷이 4옥텟이라고 밝힌다 — §3.2.2 「Host」
- (phase 77) authority는 `[사용자 정보 "@"] 호스트 [":" 포트]` 꼴이다 — 호스트(이름이나 IP 주소) 뒤에 쌍점(`:`) 하나를 두고 십진수 포트 번호를 붙일 수 있다 — §3.2, §3.2.3
- (phase 77) 스킴(scheme)은 기본 포트를 정할 수 있다. 예로 `http` 스킴은 기본 포트를 80(그 스킴에 남겨 둔 TCP 포트 번호)으로 정한다. 포트 번호가 TCP·UDP 가운데 어느 것의 포트인지는 스킴이 정한다.
  포트가 비었거나 기본 포트와 같으면 주소를 만드는 쪽은 포트와 그 앞의 `:`를 빼는 것이 좋다 — §3.2.3
- (phase 81 step 6, 2026-11-18 rfc-editor.org 원문 텍스트판을 IPv4로 받아 읽음) URL(Uniform Resource Locator)은 URI 가운데 자원을 가리키는 데 더해, 그 자원에 닿는 주된 방법(네트워크의 「위치」 같은 것)을 적어 자원을 찾아가게 하는 것을 이른다 — §1.1.3

쓰인 곳: 강의 수정 이력 L16, (phase 73에서 쓰일 곳) `ip-protocol.ipv4-address`(점으로 구분한 십진 표기, §3.2.2)
(phase 77에서 쓰일 곳) `ports.port-number`(§3.2·§3.2.3 — 주소 뒤에 `:포트`를 붙여 적는 꼴), `ports.well-known-ports`(§3.2.3 — 기본 포트는 스킴이 정하고, 다른 포트는 주소에 적는다)
(phase 81 step 6) `windows-server-roles.iis-home-directory`(§1.1.3 — URL이 무엇인지 한 줄)

## MDN — What is a URL?
https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL

- `?` 뒤의 파라미터는 `&`로 구분한 키/값 짝의 목록이고, 파라미터를 어떻게 다룰지는 웹 서버마다 규칙이 다르다 — 「Parameters」
- `#` 뒤의 프래그먼트 식별자는 요청에 실려 서버로 가지 않는다 — 「Anchor」

쓰인 곳: 강의 수정 이력 L16

## RFC 9112 — HTTP/1.1
https://www.rfc-editor.org/rfc/rfc9112

- HTTP/1.1 메시지는 시작줄, 헤더 필드 줄들, 빈 줄, 선택적인 본문 순이다. 시작줄은 요청이면 요청줄(request-line), 응답이면 상태줄(status-line)이다 — §2.1
- 요청줄은 `메서드 SP 요청 대상 SP HTTP 버전`이다 — §3
- 상태줄은 `HTTP 버전 SP 상태 코드 SP [이유 문구]`다 — §4
- 필드 줄은 `필드 이름 ":" 선택 공백 필드 값 선택 공백`이다 — §5
- HTTP/1.1은 기본으로 지속 연결을 써서 한 연결에 여러 요청·응답을 싣는다. `close` 연결 옵션이 있으면 그 응답 뒤에 닫는다.
  HTTP/1.0은 `keep-alive` 연결 옵션이 있고 받는 쪽이 받아들일 때만 연결을 유지한다 — §9.3
- (phase 77 step 3, 2026-11-09 rfc-editor.org 원문 — RFC 9931이 고쳤다) 어떤 연결 프로토콜을 쓸지는 클라이언트 설정과 대상 주소가 정하고, `http` 주소는 기본으로 **IP 위의 TCP**, 기본 TCP 포트 80을 쓴다 — §9
- (phase 79 step 12, 2026-11-13 rfc-editor.org 원문 텍스트판을 IPv4로 다시 받아 읽음) 지속 연결을 지원하지 않는 서버는 1xx가 아닌 모든 응답에 `close` 연결 옵션을 보내야 한다 — §9.3.
  `close` 연결 옵션을 담은 응답을 보낸 서버는 그 응답 뒤에 연결 닫기를 시작해야 하고, 그 연결로 오는 요청을 더 처리하지 않는다 — §9.6. 클라이언트는 `close`를 받기 전까지 지속 연결에 요청을 더 보낼 수 있다 — §9.3.
  위 「(phase 79 step 9) Apache HTTP Server 2.4 문서 — 지시자 설명 …」 항목의 `KeepAlive`(지속 연결을 켤지 정한다)와 이으면, **`KeepAlive Off`로 지속 연결을 끈 서버는 응답마다 그 연결을 닫고, 웹 브라우저는 다음 요청을 보내려면 연결을 새로 맺는다**(두 문서를 이은 것)

쓰인 곳: 강의 수정 이력 L17, L19, 면접 수정 이력 I15
(phase 77 step 3에서 쓰일 곳) `tcp-udp.transport-choice`(§9 — HTTP/1.1은 기본으로 TCP 위에서)
(phase 77 step 8) `tcp-udp.transport-choice`(§9 — HTTP/1.1은 기본으로 TCP), 도식 `transport-choice`
(phase 79 step 9에서 쓰일 곳) `linux-servers.apache-keepalive`(§9.3 — HTTP/1.1은 기본으로 지속 연결을 써서 한 연결에 요청·응답을 여럿 싣는다, `close`가 있으면 그 응답 뒤에 닫는다. Apache 쪽은 아래 「(phase 79 step 9) Apache HTTP Server 2.4 문서 — 지시자 설명 …」 항목의 `KeepAlive`)
(phase 79 step 12) `linux-servers.apache-keepalive`(§9.3·§9.6 — `KeepAlive Off`이면 응답마다 연결을 닫아 요청마다 연결을 새로 맺는다, Apache `KeepAlive`와 이은 것), 도식 `keepalive-timeline`(「끄기」 시나리오)

## MDN — An overview of HTTP
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview

- HTTP는 상태가 없다(같은 연결의 두 요청 사이에 연결 고리가 없다). 쿠키를 쓰면 상태가 있는 세션을 만들 수 있다 — 「HTTP is stateless, but not sessionless」
- 연결은 전송 계층이 다루는 일이라 HTTP의 범위 밖이다. HTTP는 전송이 연결형이기를 요구하지 않고 신뢰할 수 있기만을 요구하며, 그래서 TCP 위에서 돈다 — 「HTTP and connections」
- HTTP/1.0의 기본 동작은 요청·응답 한 쌍마다 TCP 연결을 따로 여는 것이었고, HTTP/1.1이 지속 연결을 들여왔다. HTTP/2는 한 연결에 메시지를 다중화한다 — 「HTTP and connections」

쓰인 곳: 강의 수정 이력 L17

## MDN — Connection management in HTTP/1.x
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Connection_management_in_HTTP_1.x

- HTTP/1.0의 기본은 짧은 연결이다 — 요청마다 TCP 핸드셰이크를 새로 한다 — 「Short-lived connections」
- HTTP/1.1에서는 지속 연결이 기본이고, 짧은 연결은 `Connection: close`를 보낼 때만 쓴다 — 「Short-lived connections」, 「Persistent connections」

쓰인 곳: 강의 수정 이력 L17

## RFC 9113 — HTTP/2
https://www.rfc-editor.org/rfc/rfc9113

- 프로토콜 이름은 「HTTP version 2」, 줄여서 `HTTP/2`다. 필드 압축(HPACK)을 들이고 한 연결에서 여러 교환을 동시에 진행한다 — Abstract, §1, §4.3.1, §5

쓰인 곳: 강의 수정 이력 L18

## RFC 9114 — HTTP/3
https://www.rfc-editor.org/rfc/rfc9114

- 프로토콜 이름은 `HTTP/3`이고, HTTP의 의미를 QUIC 위에 옮긴 것이다 — Abstract
- 서버는 어떤 UDP 포트로든 HTTP/3를 제공할 수 있다 — §3.1
- (phase 77) 클라이언트는 `https` 주소의 자원에 닿을 때, 호스트 이름을 IP 주소로 바꾼 뒤 그 주소의 「주소에 적힌 포트」로 QUIC 연결을 맺고 그 위로 HTTP/3 요청을 보낼 수 있다(MAY).
  주소에는 포트가 적혀 있거나, 적혀 있지 않으면 그 스킴의 기본 포트(`https`는 443 — RFC 9110 §4.2.2)가 쓰인다. UDP가 막혀 QUIC 연결을 맺지 못하면 TCP 위의 HTTP로 돌아가는 것이 좋다(SHOULD) — §3.1.
  곧 HTTP/3로 가는 `https` 요청은 기본으로 **UDP 443**에 닿는다(IANA 레지스트리도 443을 TCP·UDP 둘 다 `https`로 둔다 — 아래 IANA 항목). `exam-notes.md` E28

쓰인 곳: 강의 수정 이력 L18
(phase 77에서 쓰일 곳) `exam-notes.md` E28(HTTPS와 UDP 443), (쓴다면) `ports.well-known-ports`의 HTTPS 항목
(phase 77 step 3에서 쓰일 곳) `tcp-udp.transport-choice`(Abstract — HTTP/3는 QUIC 위의 HTTP, §3.1 — UDP 포트로 닿고 UDP가 막히면 TCP 위의 HTTP로 돌아간다. QUIC이 UDP 위에서 스스로 신뢰성을 갖춘다는 것은 아래 RFC 9000 항목), `exam-notes.md` E28
(phase 77 step 8) `tcp-udp.transport-choice`(Abstract — HTTP/3는 QUIC 위의 HTTP; 「자격시험은」 줄은 `exam-notes.md` E28 처리대로)

## RFC 9110 — HTTP Semantics
https://www.rfc-editor.org/rfc/rfc9110

- HTTP는 Hypertext Transfer Protocol이다 — Abstract
- HTTP에서 주고받는 단위는 메시지이고, 메시지는 요청이거나 응답이다. 클라이언트가 요청 메시지를 만들어 보내고, 서버는 하나 이상의 응답 메시지로 답한다 — §1.3, §3.4
- (2026-10-28) HTTP 메시지는 넷으로 이루어진다. 메시지를 설명하고 보낼 곳을 정하는 제어 데이터, 그 제어 데이터를 넓히는 이름·값 짝의 헤더, 본문(content),
  본문을 보내는 동안 얻은 정보를 싣는 트레일러다 — §6
- (2026-10-28) 본문은 헤더 뒤에 보내는 바이트의 흐름이다. HTTP 메시지는 흔히 자원의 표현, 곧 자원의 상태를 나타내는 정보의 전체나 일부를 본문에 싣는다.
  GET 요청에 대한 200 응답이면 본문은 요청한 자원의 지금 상태를 나타낸다 — §6.4, §6.4.1, §3.2
- 1xx, 204, 304 응답은 본문(content)을 담지 않는다 — §6.4.1
- Connection 필드는 지금 연결에만 쓸 제어 옵션을 나열한다. 바로 다음 수신자에게만 뜻이 있는(hop-by-hop) 필드를 끝에서 끝까지 가는 필드와 가르는 데 쓴다 — §7.6.1
- 콘텐츠 코딩은 주로 표현을 압축하려고 쓴다. 이 문서가 정의하는 것은 compress, deflate, gzip이다 — §8.4.1(§8.4.1.1~§8.4.1.3)
- Last-Modified 응답 필드는 원 서버가 그 표현이 마지막으로 바뀌었다고 보는 날짜·시각을 알린다 — §8.8.2
- 필드 이름은 `ETag`다. 엔터티 태그는 같은 자원의 여러 표현을 가려내는 불투명한 검증자다 — §8.8.3
- 이 문서가 캐시 의미를 정의한 메서드는 GET, HEAD, POST다 — §9.2.3
- POST 응답은 명시적인 신선도 정보가 있고, POST 대상 URI와 같은 값의 Content-Location 필드가 있을 때만 캐시할 수 있다 — §9.3.3
- Retry-After 필드는 다음 요청을 보내기 전에 사용자 에이전트가 기다려야 할 시간을 알린다. 503과 함께 보내면 서비스를 쓸 수 없을 것으로 보는 기간을, 3xx와 함께 보내면 리다이렉트한 요청을 보내기 전 최소 대기 시간을 뜻한다 — §10.2.3
- 품질 값(q)은 0~1 사이로, 클수록 더 선호한다. 없으면 1이고 0은 받지 않겠다는 뜻이다 — §12.4.2
- Accept-Encoding의 `identity`는 「인코딩 없음」을 뜻한다 — §12.5.3
- If-None-Match는 요청을 받는 쪽에 그 엔터티 태그와 맞는 현재 표현이 없을 때만 메서드를 수행하게 하는 조건이다. 주로 조건부 GET으로 캐시한 정보를 효율적으로 갱신하는 데 쓴다 — §13.1.2
- If-Modified-Since는 GET·HEAD를 그 시각 뒤에 표현이 바뀌었는지에 따라 수행하게 하는 조건이다. 바뀌지 않았으면 표현 데이터를 다시 보내지 않는다 — §13.1.3
- 3xx는 요청을 끝내려면 사용자 에이전트가 더 할 일이 있다는 뜻이다. 그 가운데 하나가 Location 필드가 알려 주는 다른 URI로 가는 리다이렉트(301·302·307·308)이고,
  또 하나가 304처럼 **이전에 저장해 둔 결과로 보내는** 리다이렉트다. 그 밖에 여러 후보 가운데 고르게 하는 300, 다른 자원으로 간접 응답을 주는 303이 있다 — §15.4
- 301·308은 대상 자원에 새 영구 URI가 붙었다는 뜻이다. 302·307은 대상 자원이 잠시 다른 URI에 있다는 뜻이고, 307은 자동으로 따라갈 때 요청 메서드를 바꾸면 안 된다 — §15.4.2, §15.4.3, §15.4.8, §15.4.9
- 304는 조건부 GET/HEAD 요청의 조건이 거짓이라 200 대신 보낸 응답이다. 클라이언트에게 저장해 둔 표현을 200 응답의 내용처럼 쓰라고 보내는 것이다 — §15.4.5
- 4xx는 클라이언트가 잘못한 것으로 보이는 경우다. 서버는 오류 상황과 그것이 일시적인지 영구적인지를 설명하는 표현을 함께 보내는 것이 좋다(SHOULD) — §15.5
- 401은 대상 자원에 대한 유효한 인증 자격 증명이 없어 요청을 적용하지 않았다는 뜻이다 — §15.5.2
- 408(요청 시간 초과)은 서버가 기다린 시간 안에 완전한 요청을 받지 못했다는 뜻이고, 클라이언트는 같은 요청을 다시 보내도 된다(MAY) — §15.5.9
- 5xx는 서버가 스스로 잘못했거나 요청한 메서드를 수행할 능력이 없음을 아는 경우다 — §15.6
- 501(구현되지 않음)은 서버가 요청을 처리하는 데 필요한 기능을 지원하지 않는다는 뜻이다 — §15.6.2
- 503(서비스 이용 불가)은 일시적 과부하나 예정된 점검 때문에 지금은 요청을 처리할 수 없다는 뜻이다. Retry-After로 다시 시도할 때를 알릴 수 있다 — §15.6.4
- (phase 77) `http` 주소는 주어진 포트에서 TCP 연결을 기다리는 서버를 가리킨다. 주소에 포트가 없거나 비어 있으면 **TCP 80**(WWW 서비스에 남겨 둔 포트)이 기본이다 — §4.2.1.
  주소는 호스트 뒤에 포트 번호를 적을 수 있다(RFC 3986 §3.2.3) — 그러니 서버가 80이 아닌 포트에서 기다리면 클라이언트가 그 번호를 주소에 적어야 한다
- (phase 77) `https` 주소는 주어진 포트에서 TCP 연결을 기다리고, HTTP 통신을 위해 보호된 **TLS 연결**을 맺을 수 있는 서버를 가리킨다. 「보호된」은 서버가 그 이름의 주인을 대신한다는 것이 인증되고,
  그 서버와 주고받는 HTTP 통신 모두가 기밀성(남이 읽지 못함)과 무결성(바뀌지 않음) 보호를 받는다는 뜻이다. 포트가 없거나 비어 있으면 **TCP 443**(TLS 위의 HTTP에 남겨 둔 포트)이 기본이다.
  클라이언트는 `https` 자원에 보내는 요청을 보내기 전에 보호해야 한다(MUST). `http`와 `https`는 서로 다른 출처(origin)다 — §4.2.2
  (HTTP/3는 같은 `https` 주소에 UDP로 닿는다 — 위 RFC 9114 항목의 「(phase 77)」 줄)
- (phase 78 step 5, 2026-11-11 rfc-editor.org 원문 — Internet Standard 그대로이고 폐기되지 않았다. 옛 「HTTP Over TLS」 문서 RFC 2818을 이 문서가 폐기했다) `https` 주소의 자원에 닿는 한 가지 길은 이 차례다 —
  주소의 호스트 이름을 IP 주소로 바꾸고, 그 주소의 정해진 포트로 **TCP 연결**을 맺고, 그 연결 위에서 **TLS를 시작해** 끝과 끝 사이에 기밀성·무결성 보호를 갖춘 뒤, 그 연결로 HTTP 요청을 보낸다 — §4.3.3
- (phase 78 step 5) `https`에서 서버가 그 주소에 대해 답할 자격은, 클라이언트가 믿을 만하다고 보는 인증서의 짝인 개인 키를 서버가 쓸 수 있는지로 가린다. 클라이언트는 보통 미리 정해 둔 신뢰의 출발점(trust anchor)에서 이어지는 신뢰 사슬로 그 인증서를 믿을지 정한다 — §4.3.3
- (phase 78 step 5) **인증서 확인**: 안전한 연결을 맺으려면 클라이언트는 서버가 내민 신원이 주소의 원 서버와 맞는지 **반드시 확인해야 한다**(MUST). 이 확인은 경로 가운데 끼어든 공격자나 이름 풀이를 조작한 공격자가 서버를 흉내 내는 것을 막으려는 것이다.
  주소의 호스트가 IP 주소면 IP 주소로, 이름이면 DNS 이름으로 견준다. 인증서가 그 주소에 맞지 않으면 웹 브라우저 같은 사용자 에이전트는 사용자에게 계속할지 확인을 받거나, 잘못된 인증서라는 오류로 연결을 끝내야 한다 — §4.3.4
- (phase 81 step 5, 2026-11-18 rfc-editor.org 원문 — 위와 같은 판) 요청의 **Host 헤더 필드**는 대상 URI의 호스트와 포트 정보를 담아, 원 서버가 여러 호스트 이름의 요청을 맡을 때 자원을 가를 수 있게 한다. 꼴은 `Host = uri-host [ ":" port ]`로 포트는 적을 때만 붙는다.
  사용자 에이전트(웹 브라우저 같은 것)는 이 정보를 `:authority` 가상 헤더 필드로 보내는 경우가 아니면 요청에 Host 헤더 필드를 만들어 넣어야 한다(MUST). HTTP/2·HTTP/3에서는 Host 대신 요청의 제어 데이터에 든 `:authority`가 그 일을 맡기도 한다. 예로 `http://www.example.org/pub/WWW/`을 GET으로 요청하면 요청은 `GET /pub/WWW/ HTTP/1.1` 다음 줄에 `Host: www.example.org`로 시작한다 — §7.2
  (phase 81 step 5에서 쓰일 곳) `windows-server-roles.iis-site-bindings`(웹 브라우저가 주소의 이름을 Host 헤더에 담아 보내고, 서버가 그 이름으로 여러 이름의 사이트를 가른다, `Host: shop.example.com`의 꼴)

- (phase 82 step 8, 2026-11-19 rfc-editor.org 텍스트판을 IPv4로 다시 받아 확인 — Internet Standard, 2022-06, 폐기·개정 없음) **중개자와 캐시**(§3.7·§3.8):
  - HTTP는 연결 여러 개를 사슬처럼 이어 요청을 처리하는 중개자(intermediary)를 쓸 수 있고, 흔한 꼴은 **프록시·게이트웨이·터널** 셋이다. 한 중개자가 요청마다 원 서버·프록시·게이트웨이·터널 가운데 어느 것으로 동작할지 바꾸기도 한다.
    뒤의 요청은 부하 분산을 위한 동적 설정에 따라 다른 경로의 연결로 갈 수도 있다 — §3.7
  - **프록시**: **클라이언트가 고른**(대개 클라이언트 쪽 설정 규칙으로) 메시지 전달자로, 어떤 종류의 주소에 대한 요청을 받아 HTTP 인터페이스를 거쳐 처리하려 한다. 조직의 HTTP 요청을 한 중개자로 모아 보안 서비스·주석 서비스·공유 캐시를 하려고 흔히 쓴다 — §3.7
  - **게이트웨이(역방향 프록시라고도 한다)**: 바깥쪽 연결에 대해서는 **원 서버처럼 동작**하지만, 받은 요청을 바꿔 안쪽의 다른 서버(들)로 넘기는 중개자다. 낡았거나 믿을 수 없는 정보 서비스를 감싸고, 「가속기」 캐시로 서버 성능을 높이고, **HTTP 서비스를 여러 기계로 나누거나 부하를 분산하는 데** 흔히 쓴다.
    안쪽 서버와는 원하는 어떤 프로토콜로도 통신할 수 있다 — §3.7
  - 터널은 메시지를 바꾸지 않고 두 연결 사이를 그대로 중계한다 — §3.7(이 주제에서는 쓰지 않는다 — 터널은 `network-security` 주제의 몫)
  - 클라이언트가 고르지 않은 **가로채기 프록시**(interception proxy — 흔히 「투명 프록시」라고도 부른다)는 HTTP 프록시와 다르다. 나가는 TCP 80 패킷 같은 것을 걸러 내거나 다른 곳으로 돌린다 — §3.7
  - **캐시**: 앞서 받은 응답 메시지를 저장해 둔 곳과, 그 저장·꺼냄·지움을 맡는 부분이다. 같은 요청이 다시 올 때 **응답 시간과 네트워크 대역폭 사용을 줄이려고** 캐시할 수 있는 응답을 저장한다. 클라이언트도 서버도 캐시를 둘 수 있다(터널로 동작하는 동안은 쓰지 못한다).
    사슬의 한 참여자가 그 요청에 맞는 저장된 응답을 갖고 있으면 요청은 원 서버까지 가지 않고 그 자리에서 사슬이 짧아진다 — §3.8
  - 이 문서의 「게이트웨이」는 HTTP의 역방향 프록시를 뜻한다 — 아래 RFC 1983·4949의 넓은 뜻의 게이트웨이(구현이 다른 네트워크 사이)와 쓰임이 다르다. 본문은 두 뜻을 섞지 않고, 역방향 프록시를 HTTP 문서가 게이트웨이라고도 부른다는 것을 한 줄로만 밝힌다
  쓰인 곳: (phase 82 step 10에서 쓰일 곳) `network-devices.proxy-server`(프록시는 클라이언트가 고른 중계자, 역방향 프록시는 원 서버처럼 보이며 안쪽 서버로 넘기고 HTTP 문서는 게이트웨이라고도 부른다, 캐시의 뜻과 얻는 것), (phase 82 step 11에서 쓰일 곳) `network-devices.load-balancing`(역방향 프록시가 HTTP 서비스를 여러 기계로 나누는 데 쓰인다 — 한 줄),
  기출 대조(`exam-notes.md` 「phase 82 step 8」 문단 — [기출 2024-02-25 #16])
- (phase 82 step 10) 쓰인 곳: `network-devices.proxy-server`(문단 1 — 요청과 응답이 연결 두 개를 거친다, 문단 2 — HTTP 표준 문서는 정방향 프록시를 그냥 프록시라 부르고 클라이언트 쪽이 골라 쓰며 보통 클라이언트 설정에 적는다, 문단 5 — 역방향 프록시는 원래 서버처럼 보이고 응답을 캐시해 서버의 일을 덜며 여러 서버에 요청을 나누는 데 쓰인다, 문단 6 — HTTP 문서는 역방향 프록시를 게이트웨이라고도 부르고 넓은 뜻의 게이트웨이와 쓰임이 다르다), 도식 `proxy-direction`의 「역방향 프록시」 캡션, 문항 n331 해설
- (phase 82 step 12) 쓰일 곳: (phase 82 step 13에서 쓰일 곳) `network-devices.l7-switch`(§3.7 — 게이트웨이(역방향 프록시)는 바깥 연결에 대해 원 서버처럼 동작하므로 클라이언트가 맺은 연결은 그 장치에서 끝나고, 장치는 받은 요청을 안쪽 서버로 넘기며, HTTP 서비스의 부하 분산에 흔히 쓰인다 — 위 「(phase 82 step 8)」 줄),
  기출 대조(`exam-notes.md` 「phase 82 step 12」 문단 — [기출 2026-02-01 #49])
쓰인 곳: 강의 수정 이력 L20, L21, L22, 면접 수정 이력 I6, I7, I12, I14, I15, `protocols-encapsulation.tcp-ip-model`, `protocols-encapsulation.pdu-names`,
`protocols-encapsulation.encapsulation`, `protocols-encapsulation.decapsulation`
(phase 77에서 쓰일 곳) `ports.well-known-ports`(§4.2.1 — HTTP는 TCP 80, §4.2.2 — HTTPS는 TLS로 보호하고 TCP 443, 둘 다 「기본」이고 주소에 다른 포트를 적을 수 있다), `exam-notes.md` E28
(phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.https`(§4.2.1 — HTTP는 TCP 80, §4.2.2 — `https`는 TLS로 보호하고 TCP 443이 기본이며 「보호」는 서버 인증·기밀성·무결성, §4.3.3 — TCP 연결 → TLS → HTTP 요청의 차례, §4.3.4 — 인증서가 주소의 이름과 맞는지 확인),
`app-protocols-mgmt-security.tls`(§4.3.4 — 인증서를 어떻게 확인할지는 TLS 위의 응용 프로토콜이 정한다는 RFC 9846 §1의 예), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — 「인증이 필요 없다」가 틀린 까닭)

## RFC 9111 — HTTP Caching
https://www.rfc-editor.org/rfc/rfc9111

- 캐시는 바로 쓸 수 없는(예: 신선하지 않은) 저장 응답을 조건부 요청으로 원 서버에 검증한다. 저장한 응답의 Last-Modified는 If-Modified-Since로, ETag의 엔터티 태그는 If-None-Match로 싣는다 — §4.3, §4.3.1
- 304 응답은 저장해 둔 응답을 갱신해 다시 써도 된다는 뜻이다. 캐시는 저장한 응답의 헤더 필드를 304에 실려 온 필드로 갱신한다 — §4.3.3, §4.3.4

- (phase 82 step 8, 2026-11-19 rfc-editor.org 텍스트판을 IPv4로 다시 받아 확인 — Internet Standard, 2022-06, RFC 7234를 폐기, 폐기·개정 없음) HTTP 캐시는 응답 메시지를 저장해 두는 곳과 그 저장·꺼냄·지움을 맡는 부분이고, 같은 요청이 다시 올 때 응답 시간과 네트워크 대역폭 사용을 줄이려고 저장한다.
  여러 사용자가 다시 쓰는 **공유 캐시**는 대개 중개자의 일부로 두고, 한 사용자만 쓰는 **개인 캐시**는 흔히 웹 브라우저 같은 사용자 에이전트 안에 둔다. 저장해 둔 응답을 지금 요청에 다시 쓰면 지연과 네트워크 부담을 함께 줄인다 — §1
  쓰인 곳: (phase 82 step 10에서 쓰일 곳) `network-devices.proxy-server`(캐시 한 줄 — 프록시 안에 두는 공유 캐시)
- (phase 82 step 10) 쓰인 곳: `network-devices.proxy-server`(문단 3 — 캐시의 뜻, 여러 사용자가 함께 쓰는 공유 캐시, 응답이 빨라지고 오가는 데이터가 준다), 문항 n331 해설
쓰인 곳: 면접 수정 이력 I14

## RFC 6585 — Additional HTTP Status Codes
https://www.rfc-editor.org/rfc/rfc6585

- 429(요청이 너무 많음)는 사용자가 정해진 시간 안에 요청을 너무 많이 보냈다는 뜻이다(속도 제한). 새 요청을 보내기 전에 기다릴 시간을 Retry-After 헤더로 알릴 수 있다(MAY) — §4

쓰인 곳: 면접 수정 이력 I7

## MDN — Redirections in HTTP
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections

- 리다이렉션을 영구·임시·특수로 나누고, 304는 300과 함께 특수 리다이렉션으로 분류한다 — 「Special redirections」
- 임시 리다이렉션(302·307)은 점검이나 장애 중처럼 자원에 잠시 닿을 수 없을 때 쓴다 — 「Temporary redirections」
- 쓰임으로 도메인 별칭(다른 이름·흔한 오타·새 도메인을 한 사이트로 잇기, http를 https로 옮기기), 사이트를 다시 짠 뒤 옛 링크 살리기,
  안전하지 않은 요청과 오래 걸리는 요청에 대한 임시 응답(303)을 든다. URL을 줄이거나 간소화하는 쓰임은 없다 — 「Use cases」

쓰인 곳: 면접 수정 이력 I6, I12

## MDN — Connection
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Connection

- `keep-alive`를 보내면 연결을 닫지 않고 같은 서버에 대한 다음 요청에 그 연결을 쓴다 — 도입 문단, 「Directives」
- 기본값이 HTTP/1.0과 HTTP/1.1 사이에 바뀌었기 때문에, 브라우저는 호환을 위해 HTTP/1.1에서도 `Connection: keep-alive`를 명시해 보내곤 한다 — 도입 문단
- 연결을 닫는 `close`가 HTTP/1.0 요청의 기본이고, 연결을 열어 두는 것이 HTTP/1.1 요청의 기본이다 — 「Directives」
- Connection·Keep-Alive 같은 연결 전용 헤더 필드는 HTTP/2와 HTTP/3에서 쓰지 못한다 — 도입부의 경고 상자

쓰인 곳: 면접 수정 이력 I15

## RFC 6265 — HTTP State Management Mechanism
https://www.rfc-editor.org/rfc/rfc6265

- Set-Cookie·Cookie 헤더는 거의 상태가 없는 HTTP 위에서 상태 있는 세션을 유지하게 한다 — Abstract
- Domain 속성은 쿠키를 보낼 호스트를 정한다. `example.com`이면 `www.example.com` 같은 하위 도메인에도 보낸다. Domain이 없으면 원 서버에만 보낸다 — §4.1.2.3
- Secure 속성은 쿠키를 「안전한」 채널(대개 TLS 위의 HTTP)로만 보내게 한다 — §4.1.2.5
- 속성 이름은 `HttpOnly`다. 이 속성이 있으면 사용자 에이전트는 스크립트에 쿠키를 보여 주는 브라우저 API 같은 「HTTP가 아닌」 경로로는 그 쿠키를 내주지 않는다 — §4.1.2.6
- 속성 이름은 대소문자를 가리지 않고 비교한다(그래서 `HTTPOnly`라고 써도 받아들인다) — §5.2.6
- Domain 속성 값이 지금 요청한 호스트와 도메인이 맞지 않으면 사용자 에이전트는 그 쿠키를 통째로 버린다 — §5.3 6단계

쓰인 곳: 강의 수정 이력 L23, L24

## MDN — Set-Cookie
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie

- `HttpOnly`는 `Document.cookie` 같은 자바스크립트 경로로 쿠키를 읽지 못하게 한다. 그래도 자바스크립트가 보낸 요청(`fetch()` 등)에는 쿠키가 실린다.
  이것은 XSS 공격의 피해를 **줄인다** — 「HttpOnly」
- `Domain` 값은 쿠키를 보내는 서버의 도메인이거나 그 상위 도메인이어야 하고, 이 규칙을 어긴 쿠키는 무시된다. 도메인을 정하면 하위 도메인이 늘 포함된다 — 「Domain=<domain-value>」
- `Secure`는 `https:` 요청일 때만(localhost 제외) 쿠키를 보내게 한다 — 「Secure」

쓰인 곳: 강의 수정 이력 L23, L24

## RFC 919 — Broadcasting Internet Datagrams
https://www.rfc-editor.org/rfc/rfc919

인터넷 표준(STD 5)이다.

- IP 주소의 호스트 번호 자리에 정해 둔 값을 넣으면 특정 호스트가 아니라 브로드캐스트를 뜻한다 — §4
- 예를 들어 36.255.255.255는 「36번 네트워크의 모든 호스트」를 뜻한다 — §7
- (phase 74) 다른(원격) 네트워크의 모든 호스트로 보내는 브로드캐스트는 보통의 경로로 그 네트워크에 이어진 게이트웨이까지 간 뒤 거기서 브로드캐스트되고, 이것을 **directed broadcasting**이라고도 부른다 — §4
- (phase 74) 브로드캐스트를 뜻하는 호스트 번호로 **모든 비트가 1인 값**을 고른 것은 실제 호스트에 주어질 일이 없을 값이어야 해서다 — §7.
  모든 비트가 0인 칸은 「정하지 않음」으로 볼 수 있고, 표기 관례로 **호스트가 아니라 네트워크를 가리킬 때 0인 칸을 쓴다** — 36.0.0.0은 「36번 네트워크」, 36.255.255.255는 「36번 네트워크의 모든 호스트」다 — §7.
  255.255.255.255는 그 물리 네트워크 안에서만 쓰고 넘기지 않는 브로드캐스트다 — §7(`ip-address-types` — step 5). RFC 922 §7이 서브넷이 있을 때도 같은 관례를 적는다(https://www.rfc-editor.org/rfc/rfc922 , STD 5)
- (phase 74 step 5) 255.255.255.255는 지역 하드웨어 네트워크 안의 브로드캐스트이고 넘기면 안 된다. 자기 네트워크 번호를 모르는 호스트가 서버에게 물을 때 쓸 수 있다 — §7. 폐기되지 않은 인터넷 표준이다(rfc-editor 상태, 2026-10-29)

쓰인 곳: `network-basics.cast-types`
(phase 74 step 5에서 쓰일 곳) `ip-address-types.reserved-addresses`(§7 — 제한 브로드캐스트는 넘기지 않는다), `ip-address-types.dhcp-messages`(§7 — 주소를 모르는 호스트가 서버를 찾을 때 쓴다)
(phase 74에서 쓰일 곳) `ip-addressing.network-broadcast-address`(§4 — directed broadcasting이라는 이름, §7 — 모두 1을 브로드캐스트로 고른 까닭, 모두 0인 칸으로 네트워크를 가리키는 표기 관례), 강의 수정 이력 L36

## RFC 1112 — Host Extensions for IP Multicasting
https://www.rfc-editor.org/rfc/rfc1112

인터넷 표준(STD 5)이다.

- IP 멀티캐스트는 IP 데이터그램을 「호스트 그룹」에 보내는 것이다. 호스트 그룹은 목적지 IP 주소 하나로 가리키는, 0개 이상의 호스트 묶음이다 — §2
- 그룹 구성원은 고정되지 않는다 — 호스트는 언제든 그룹에 들어가거나 나올 수 있다 — §2
- 멀티캐스트 데이터그램도 보통의 유니캐스트 데이터그램과 같은 최선형(best-effort) 신뢰성으로 전달된다 — §2
- (phase 73 step 1) 위 줄의 최선형은 데이터그램이 받는 쪽 모두에 온전히 닿는다는 보장도, 다른 데이터그램과 순서가 지켜진다는 보장도 없다는 뜻이다 — §2.
  RFC 1112는 Internet Standard이고 폐기되지 않았다. RFC 2236이 고쳤다(rfc-editor 상태, 2026-10-29)
- (phase 73 step 1) 부록 I은 IGMP 첫 판(IGMPv1)이다. IGMP는 IP 호스트가 자기 호스트 그룹 가입을 바로 이웃한 멀티캐스트 라우터에 알리는 데 쓰는 **비대칭(asymmetric) 프로토콜**이고, 이 부록은 호스트 쪽에서 본 동작만 정한다 — 부록 I 첫 문단
- (phase 73 step 1) ICMP처럼 IGMP도 IP의 일부다. IGMP 메시지는 IP 데이터그램에 담겨 가고 IP 프로토콜 번호는 2다 — 부록 I
- (phase 73 step 1) v1 메시지의 칸: 버전 4비트, 타입 4비트, 쓰지 않는 칸 8비트, 체크섬 16비트, 그룹 주소 32비트. 호스트가 다루는 타입은 둘뿐이다 — 1 호스트 멤버십 질의, 2 호스트 멤버십 보고. TTL 칸은 없다 — 부록 I
- (phase 73 step 1) 멀티캐스트 라우터는 자기가 이어진 네트워크에 어느 그룹의 구성원이 있는지 알려고 질의를 모든 호스트 그룹(224.0.0.1)으로 보낸다. 호스트는 자기가 든 그룹마다 무작위 시간을 기다렸다 보고를 보내되, 보고의 목적지는 그 그룹 주소다.
  질의와 보고 모두 **IP TTL 1**로 보낸다. 같은 그룹의 다른 호스트 보고를 먼저 들으면 자기 보고를 보내지 않는다. 라우터가 알아야 하는 것은 그 네트워크에 그 그룹의 구성원이 하나라도 있는지이지 누가 구성원인지가 아니다 — 부록 I 「Informal Protocol Description」
- (phase 73 step 1) 라우터는 질의를 몇 번 보내도 어느 그룹의 보고가 없으면 그 네트워크에 구성원이 없다고 보고, 다른 곳에서 온 그 그룹의 멀티캐스트를 그 네트워크로 넘기지 않는다 — 부록 I
- (phase 73 step 1) 그룹에 새로 든 호스트는 자기가 그 네트워크의 첫 구성원일 수 있으므로 질의를 기다리지 않고 곧바로 보고를 보낸다. **첫 보고가 사라지거나 망가질 때에 대비해 짧은 간격을 두고 한두 번 되풀이할 것을 권한다** — 부록 I(`exam-notes.md` E14)
- (phase 74) 호스트 그룹은 **D 클래스** 주소로 가리킨다 — 맨 앞 4비트가 `1110`인 주소이고, 점 10진으로 224.0.0.0~239.255.255.255다. 맨 앞 4비트가 `1111`인 **E 클래스**는 앞으로의 주소 방식을 위해 남겨 두었다 — §4.
  (RFC 1122 §3.2.1.3·RFC 1812 §4.2.2.11은 E를 「실험용으로 남겨 둔」 클래스라 적는다. 어느 쪽이든 호스트에 주는 주소가 아니다)

쓰인 곳: `network-basics.cast-types`, `protocols-encapsulation.tcp-ip-model`(phase 71 — IGMP 문장의 멀티캐스트 풀이),
(phase 73 step 1에서 쓰일 곳) `icmp.ip-limits`(§2 — 최선형이라는 이름), `icmp.igmp`(부록 I — 비대칭, IP의 일부, 프로토콜 번호 2, 질의·보고, TTL 1), `exam-notes.md` E12·E14
(phase 73 step 11) `icmp.ip-limits`(§2 — 최선형 전달: 온전히 닿는다는 보장도, 순서가 지켜진다는 보장도 없다), 문항 n070 해설
(phase 73 step 14) `icmp.igmp`(§2 — 호스트 그룹은 목적지 IP 주소 하나로 가리키고 구성원은 언제든 들고 난다; 부록 I — 비대칭, IP의 일부·프로토콜 번호 2, 첫 판의 메시지는 질의·보고 둘, 질의와 보고를 TTL 1로 보낸다, 라우터는 그룹마다 구성원이 하나라도 있는지만 안다, 새로 든 호스트는 첫 보고를 한두 번 되풀이하라고 권한다), 문항 n078·n079 해설, 도식 `igmp-group`
(phase 74에서 쓰일 곳) `ip-addressing.address-classes`(§4 — D의 맨 앞 비트 `1110`과 범위 224~239, E의 맨 앞 비트 `1111`과 남겨 둠)

## RFC 1983 — Internet Users' Glossary
https://www.rfc-editor.org/rfc/rfc1983

FYI 18, 정보성(Informational) 문서다. 용어의 뜻을 확인하는 데만 쓴다.

- LAN(Local Area Network)은 몇 제곱킬로미터 이하의 좁은 지역을 맡도록 만든 데이터 네트워크다 — 「Local Area Network (LAN)」
- WAN(Wide Area Network)은 넓은 지리적 지역을 덮는 네트워크다 — 「Wide Area Network (WAN)」
- 유니캐스트는 호스트 하나만 자기 것으로 알아보는 주소다 — 「unicast」
- 브로드캐스트는 네트워크의 모든 노드가 받는 특별한 멀티캐스트이고, 멀티캐스트는 네트워크의 노드 여럿이 받을 수 있는 특별한 목적지 주소를 단 패킷이다 — 「broadcast」, 「multicast」
- 패킷은 네트워크로 보내는 데이터의 단위다 — 「packet」
- 노드는 컴퓨터 네트워크에 붙어 있는, 주소로 가리킬 수 있는 장치다 — 「node」
- 라우터는 네트워크와 네트워크 사이에서 트래픽을 넘겨주는 장치다 — 「router」
- (2026-10-28) 가상 회선은 꼭 회선 교환을 하지 않고도 연결형 서비스를 주는 네트워크 서비스다 — 「virtual circuit」
- (2026-10-28) 데이터그램은 앞서 주고받은 것에 기대지 않고, 목적지까지 가는 데 필요한 정보를 스스로 담은 독립된 데이터 단위다 — 「datagram」
- (2026-10-28) 메시지 교환은 따로 풀이하지 않고 패킷 교환 항목으로 넘긴다 — 「message switching」
- (phase 71) 10BaseT는 꼬아 만든 구리선 쌍(twisted-pair copper wire)으로, 10BaseF는 광섬유 케이블(fiber-optic cable)로 데이터를 보내는 물리 계층 규격이다 — 「10BaseT」, 「10BaseF」
- (phase 71) 서버는 자원을 내주는 쪽이고, 클라이언트는 다른 컴퓨터 시스템이나 프로세스에 서비스를 요청하는 쪽이다 — 「server」, 「client」
- (phase 71) PING은 목적지에 ICMP echo 요청을 보내고 응답을 기다려, 그 목적지에 닿을 수 있는지 시험하는 프로그램이다 — 「Packet InterNet Groper (PING)」
- (phase 71) 인터넷 주소는 인터넷에서 노드 하나를 유일하게 가리키는 IP 주소다. IP 주소는 RFC 791이 정한 32비트 주소다 — 「internet address」, 「IP address」
- (phase 74 step 11) 홉은 라우팅에서 쓰는 말이다 — 목적지까지 가는 길은 출발지에서 라우터들을 거쳐 멀어지는 홉들의 이어짐이다 — 「hop」
- (phase 74 step 11) 라우팅은 전달할 패킷에 맞는 인터페이스와 다음 홉을 고르는 일이다. 경로(route)는 트래픽이 출발지에서 목적지까지 가는 길이다 — 「routing」, 「route」
- (phase 74 step 11) 라우터는 네트워크 사이에서 트래픽을 넘기는 장치이고, 넘길 곳은 네트워크 계층 정보와 라우팅 테이블로 정한다. 라우팅 테이블은 흔히 라우팅 프로토콜이 만든다 — 「router」.
  지금은 라우터를 3계층(네트워크 계층) 게이트웨이로 본다 — 「gateway」
- (phase 74 step 11) IGP는 한 AS 안의 라우터들에게, EGP는 AS들을 잇는 라우터들에게 라우팅 정보를 나눠 주는 프로토콜이다. 두 이름의 「gateway」는 옛 말이고 지금은 「router」라 부른다.
  **EGP라는 이름의 라우팅 프로토콜도 따로 있다**(RFC 904) — 「Interior Gateway Protocol (IGP)」, 「Exterior Gateway Protocol (EGP)」
- (phase 74 step 11) RIP는 링크 상태가 아니라 거리 벡터 방식의 IGP이고, OSPF는 거리 벡터가 아니라 링크 상태 방식의 IGP다. BGP는 외부(exterior) 게이트웨이 프로토콜이고 EGP를 쓴 경험을 바탕으로 만들었다 —
  「Routing Information Protocol (RIP)」, 「Open Shortest-Path First (OSPF)」, 「Border Gateway Protocol (BGP)」(이 용어집이 가리키는 RFC 1058·1583·1771은 지금 폐기되거나 역사적이 된 판이다 — 현행은 아래 RFC 2453·2328·4271 항목)
- (phase 74 step 11) AS는 하나의 관리 주체 아래에서 공통의 IGP로 패킷을 라우팅하는 라우터들의 모임이다 — 「Autonomous System (AS)」(옛 정의 — 지금의 정의는 아래 RFC 1930 항목)

- (phase 82 step 8, 2026-11-19 rfc-editor.org 텍스트판을 IPv4로 다시 받아 확인 — FYI 18, Informational, 1996-08, RFC 1392를 폐기했고 이 문서를 고치거나 폐기한 RFC는 없다) **장비 용어**:
  - 리피터는 한 케이블의 전기 신호를 다른 케이블로 이어 퍼뜨리는 장치다 — 「repeater」. 이 항목은 계층·주소를 말하지 않는다(계층의 근거는 아래 「(phase 72 step 1) IEEE 802.3 개정 프로젝트의 의견 처리 기록」 항목의 「(phase 82 step 8)」 줄)
  - 브리지는 **데이터 링크 계층의 정보**를 보고 네트워크 구간(segment) 사이에 트래픽을 넘기는 장치이고, 그 구간들은 네트워크 계층 주소를 함께 쓴다 — 곧 같은 네트워크 안의 구간을 잇는다 — 「bridge」
  - 라우터는 네트워크와 네트워크 사이에서 트래픽을 넘기고, 넘길 곳을 **네트워크 계층 정보와 라우팅 테이블**로 정한다 — 「router」(위 「(phase 74 step 11)」 줄과 같다)
  - **게이트웨이**: 처음에는 라우터를 가리키던 말이고, 그 뜻으로는 지금 「라우터」를 쓴다. 지금의 뜻은 **하는 일은 비슷하지만 구현이 다른 네트워크 사이에서 데이터를 넘겨주는 통신 장치나 프로그램**이다. 이 정의로 보면 라우터는 3계층(네트워크 계층) 게이트웨이이고 메일 게이트웨이는 7계층(응용 계층) 게이트웨이다.
    같은 항목은 게이트웨이를 프로토콜 변환기와 헷갈리지 말라고 적는다 — 「gateway」
  - 프로토콜 변환기(protocol converter)는 하는 일이 비슷한 서로 다른 프로토콜 사이를 바꿔 주는 장치나 프로그램이다(예: TCP와 OSI의 TP4) — 「protocol converter」
  - **메일 게이트웨이**는 서로 다른 전자 우편 시스템 둘 이상을 이어 그 사이로 메시지를 옮기는 기계다. 옮기면서 형식을 바꾸고(그 바꿈이 꽤 복잡할 수 있다), 대개 한쪽에서 메시지를 다 받은 뒤 바꿔서 다른 쪽으로 보내는 축적 전달 방식을 쓴다 — 「mail gateway」
  - 「hub」 항목은 ARCnet과 메시지 처리 서비스의 쓰임만 적고 이더넷 허브를 정의하지 않는다(이더넷 허브의 근거는 phase 72 항목들)
  - **두 용어집의 차이**: 아래 RFC 4949는 프로토콜이 다른 두 네트워크 사이에서 게이트웨이가 한 프로토콜을 다른 프로토콜로 바꿀 수 있다고 적고, 이 문서는 게이트웨이를 프로토콜 변환기와 따로 둔다. 본문은 「게이트웨이는 구현이 다른 두 네트워크 사이에서 통신이 되게 하고, 그 방법의 하나가 프로토콜을 바꾸는 것」으로 쓴다(RFC 4949 쪽 — 더 새 문서다)
  - 쓰지 않는 것: 이 용어집이 1996년 기준으로 적은 수치(LAN의 「100Mb/s까지」 등)
  쓰인 곳: (phase 82 step 9·10에서 쓰일 곳) `network-devices.device-layers`(브리지는 데이터 링크 계층 정보로 같은 네트워크의 구간 사이를, 라우터는 네트워크 계층 정보로 네트워크 사이를), `network-devices.repeater`(케이블 사이로 신호를 이어 보낸다),
  `network-devices.gateway`(게이트웨이의 지금 뜻과 옛 쓰임, 라우터는 3계층 게이트웨이·메일 게이트웨이는 7계층 게이트웨이, 메일 게이트웨이의 예 — 서로 다른 우편 시스템 사이에서 형식을 바꿔 옮긴다), 기출 대조(`exam-notes.md` 「phase 82 step 8」 문단)
- (phase 82 step 10) 쓰인 곳: `network-devices.gateway`(문단 2 — 메일 게이트웨이가 서로 다른 전자 우편 시스템 사이에서 메시지를 다 받은 뒤 형식을 바꿔 보내고 이 방식이 축적 전달이며 바꾸는 일이 꽤 복잡할 수 있다, 문단 4 — 게이트웨이는 처음에 라우터를 가리키던 이름, 문단 7 「게이트웨이와 라우터」 — 라우터는 3계층 게이트웨이·메일 게이트웨이는 7계층 게이트웨이), 도식 `gateway-translate`(「A 형식의 메시지」·「메일 게이트웨이」·「B 형식의 메시지」와 「형식 바꾸기」 캡션), 문항 n329·n330 해설
쓰인 곳: `network-basics.computer-network`, `network-basics.host`, `network-basics.internet`, `network-basics.cast-types`, `network-basics.lan-wan`, `network-basics.traffic`, `network-basics.packet-loss`,
`network-basics.communication-link`(phase 71 — 트위스티드 페어 케이블의 구리선), `protocols-encapsulation.tcp-ip-model`(phase 71 — IP 주소),
`protocols-encapsulation.pdu-names`(계층을 가리지 않고 쓰는 넓은 뜻의 패킷), `protocols-encapsulation.packet-switching`(가상 회선·데이터그램·메시지 교환, phase 71에 노드·서버 풀이),
(phase 72에서 쓰일 곳) `ethernet.ethernet`(LAN), `ethernet.standard-names`(10BaseT — 꼬아 만든 구리선 쌍), `ethernet.mac-address`(브로드캐스트·멀티캐스트·유니캐스트)
(phase 74 step 11에서 쓰일 곳) `routing.routing`(「hop」·「routing」·「router」·「gateway」 — 라우터는 네트워크 계층 장비), `routing.as`(「IGP」·「EGP」 — EGP는 갈래 이름이자 옛 프로토콜 하나의 이름), `routing.rip`·`routing.ospf`(거리 벡터와 링크 상태), `routing.bgp`, 강의 수정 이력 L42

## RFC 3013 — Recommended Internet Service Provider Security Services and Procedures
https://www.rfc-editor.org/rfc/rfc3013

BCP 46이다. **이름 표기만** 가져온다.

- ISP는 Internet Service Provider의 줄임말이다 — 제목, Abstract

쓰인 곳: `network-basics.lan-wan`

## (2026-10-28) RFC 903 — A Reverse Address Resolution Protocol
https://www.rfc-editor.org/rfc/rfc903

인터넷 표준이고 폐기되지 않았다(rfc-editor 상태).

- 디스크가 없는 워크스테이션 같은 호스트는 켜질 때 자기 프로토콜 주소(IP 주소)를 모르고 하드웨어 주소만 아는 일이 많다. RARP는 그런 호스트가 자기 IP 주소를
  바깥에서 알아내는 방법이다. 하드웨어 주소를 알아내는 ARP와 반대 방향의 문제를 푼다 — §I
- 하드웨어 주소와 IP 주소의 대응표를 가진 서버가 있어야 한다 — §II
- RARP를 데이터 링크 수준(data-link level)의 별도 프로토콜로 두고, 이더넷에서는 ARP와 다른 이더타입을 쓴다 — §III
- 이 RFC에는 RARP가 인터넷(네트워크) 계층이라는 말이 없다. RFC 1122 §1.1.3은 RARP를 응용 계층의 지원 프로토콜로 든다(위 RFC 1122 항목).
  자격시험이 RARP를 인터넷 계층으로 보는 것은 `exam-notes.md`의 E2다
- (phase 73 step 1) ARP처럼 브로드캐스트 매체(이더넷 등)를 전제한다 — §I. RARP는 ARP와 같은 메시지 형식을 쓰고, 오퍼레이션 코드 3(역방향 요청)·4(역방향 응답)를 더한다.
  ARP처럼 「찾지 못함」을 알리는 메시지는 없고, 요청한 쪽은 정한 시간 안에 답이 없으면 그만둔다 — §III(IANA ARP 오퍼레이션 코드 레지스트리도 3·4를 RFC 903으로 적는다 — 아래 「(phase 73 step 1) IANA — ARP Parameters」 항목)
- (phase 73 step 1) RARP를 지금 무엇이 대신하는지: 이 RFC에는 없다. 아래 「(phase 73 step 1) RFC 951·RFC 2131」 항목이 BOOTP·DHCP와의 관계를 적는다

쓰인 곳: `protocols-encapsulation.tcp-ip-model`, (phase 72 step 5) `ethernet.ethertype-length`(ARP는 하드웨어 주소를 알아내는 프로토콜이다, §I — 「IP 주소로 같은 네트워크 안 장치의 MAC 주소」는 강의 p133),
(phase 73 step 1에서 쓰일 곳) `arp.rarp`(§I·§II·§III — 방향, 서버, 같은 형식, 링크 수준), `exam-notes.md` E2
(phase 73 step 10) `arp.rarp`(§I — 디스크 없는 워크스테이션은 켜질 때 자기 IP 주소를 모르고 하드웨어 주소만 안다, ARP와 반대 방향; §II A — RARP 서버가 하나 이상 있어야 하고 하드웨어 주소→프로토콜 주소 대응표를 갖고 답한다; §III — 오퍼레이션 3·4, 「찾지 못함」 메시지 없음·답이 없으면 그만둠, 역방향 요청의 보낸 쪽 하드웨어 주소 칸(과 자기 주소를 찾을 때의 대상 하드웨어 주소 칸)에 자기 하드웨어 주소를 넣는다, 이더넷에서 ARP와 다른 이더타입),
  도식 `rarp-direction`, 문항 n068 해설. 이 RFC는 요청을 브로드캐스트한다고 문장으로 적지 않고 「ARP처럼 브로드캐스트 매체를 전제한다」(§I)고만 하므로, 본문은 RARP 요청을 「보낸다」로 썼다

## (2026-10-28) RFC 1123 — Requirements for Internet Hosts -- Application and Support
https://www.rfc-editor.org/rfc/rfc1123

인터넷 표준이고 폐기되지 않았다(rfc-editor 상태). RFC 1122와 짝으로, 응용 계층과 지원 프로토콜을 다룬다.

- 원격 관리 절에서 네트워크 관리 프로토콜로 SNMP를 들고, 인터넷 호스트는 SNMP(또는 CMOT) 에이전트를 갖추는 것이 좋다(SHOULD)고 한다 — §6.3.1
- (phase 78 step 0, 2026-11-11 rfc-editor.org 원문 — Internet Standard 그대로, RFC 5321 등이 고쳤다) **TFTP**: TFTP는 UDP를 전송 프로토콜로 쓰면서 **믿을 수 있는 전달을 스스로 제공한다** — 블록 하나를 보내고 확인 응답을 기다리는 단순한 방식(stop-and-wait)이다.
  한 번에 512옥텟 블록 하나만 오가는 셈이라 **지연과 대역폭의 곱이 작은 경로에서만 성능이 좋다**. 파일을 다루는 방식이 아주 단순해 접근 제어도 보안도 없다.
  **가장 중요한 쓰임은 LAN에서 호스트를 부팅하는 일**이다 — 작고 단순해 EPROM에 넣기 쉽다 — §4.2.1. (이 절은 RFC 1350보다 먼저 나와 그 이전 판 RFC 783을 가리키지만, 블록마다 확인 응답을 기다리는 방식은 RFC 1350 §2와 같다)
- (phase 78 step 0) TFTP 명세의 결함(늦게 온 중복 패킷 때문에 이후 모든 패킷을 두 번씩 보내게 되는 문제)을 고치라고 요구하면서, 그 결함이 있어도 **전송이 끝까지 가면 파일은 언제나 바르게 옮겨진다**고 적는다 — §4.2.3.1.
  접근 제어가 약해, 브로드캐스트 주소로 온 TFTP 요청은 조용히 무시하는 것이 좋다 — §4.2.3.5
- (phase 78 step 0) **FTP**: 스트림 방식을 쓰는 사용자 쪽 FTP는 전송 명령마다 그 앞에 `PORT`로 기본이 아닌 데이터 포트를 정해 보내는 것이 좋다(SHOULD) — 닫은 TCP 연결의 주소·포트 쌍은 한동안 다시 쓸 수 없기 때문이다.
  스트림이 아닌 전송 방식을 쓰면 데이터 연결을 열어 둔 채 여러 번 보낼 수 있다 — §4.1.2.5. 서버 쪽 FTP는 **`PASV`를 반드시 구현해야 한다**(MUST). `PASV` 응답에 담긴 주소는 응답을 보낸 서버의 IP 주소이고, 포트는 `PASV`가 정한 기본이 아닌 데이터 포트다 — §4.1.2.6
- (phase 79 step 0, 2026-11-12 rfc-editor.org 원문 — Internet Standard 그대로) **호스트 이름의 문법**: 인터넷 호스트 이름의 문법은 RFC 952가 정했고(RFC 952는 rfc-editor 상태 「Unknown」, RFC 1123이 고쳤다), 이 문서가 **첫 글자 제한을 풀어 영문자나 숫자로 시작할 수 있게** 한다.
  호스트 소프트웨어는 63자까지의 호스트 이름을 반드시 다루고 255자까지는 다루는 것이 좋다. 다만 맨 위 단계의 레이블은 영문자라서, 올바른 호스트 이름이 점 넷으로 나눈 숫자(IPv4 주소 꼴)와 같아지는 일은 없다 — §2.1
- (phase 79 step 0) 모든 호스트는 DNS 리졸버를 갖추고 그것으로 호스트 이름을 IP 주소로(또 거꾸로) 바꿔야 한다. 그 밖에 **로컬 호스트 테이블을 찾는 방식을 함께 둘 수도 있다**(MAY). DISCUSSION: 처음에는 모든 호스트의 표를 저마다 복사해 찾았는데, 표가 너무 커져 제때 고쳐 나눠 주기 어려워 DNS가 생겼다.
  **DNS는 주로 호스트 이름과 주소를 바꾸는 데 쓰는 분산 데이터베이스**이고, 네임 서버와 리졸버 두 부분으로 이루어진다. 어느 네임 서버도 모든 정보를 갖지 않으므로 질의 하나를 풀려면 대개 여러 네임 서버에서 정보를 얻어야 한다 — §6.1.1
- (phase 79 step 0) TTL이 0인 레코드는 클라이언트에 돌려주되 캐시에 두지 않는다 — §6.1.2.1
- (phase 79 step 0) **리졸버의 두 모델**: **완전 서비스 리졸버**(full-service resolver)는 스스로 알맞은 네임 서버를 찾아가며 이름을 푸는 리졸버이고, 같은 요청에 다시 원격으로 묻지 않도록 **캐시를 반드시 두고 캐시의 정보에 시한을 둬야 한다**.
  **스텁 리졸버**는 같은 네트워크나 가까운 네트워크의 재귀 네임 서버에 맡기는 리졸버로, PC 같은 작은 호스트에 알맞고 여러 컴퓨터가 재귀 서버의 캐시를 함께 써서 바깥으로 나가는 질의를 줄인다. 스텁 리졸버는 여분의 재귀 네임 서버들에 요청을 보낼 수 있어야 하고, 재귀 네임 서버는 받아 줄 요청의 출처를 제한할 수 있다 — §6.1.3.1
- (phase 79 step 0) DNS 자체는 이름 문법을 넓게 정한다 — 레이블마다 8비트 옥텟 63개까지, 점으로 나누고 전체 255옥텟까지. DNS를 쓰는 응용마다 이름 문법을 더 좁힐 수 있다 — §6.1.3.5 DISCUSSION
- (phase 79 step 0) **로컬 호스트 테이블**: 호스트는 로컬 호스트 테이블을 DNS의 예비나 보충으로 쓸 수 있다. 그러면 DNS와 호스트 테이블 가운데 무엇을 앞세울지가 문제인데, **가장 유연한 방법은 그것을 설정으로 정하게 하는 것**이다 — §6.1.3.8 DISCUSSION
- (phase 82 step 12) 쓰일 곳: (phase 82 step 14에서 쓰일 곳) `network-devices.pxe`(§4.2.1 — TFTP의 가장 중요한 쓰임은 LAN에서 호스트를 부팅하는 일이고, 작고 단순해 EPROM에 넣기 쉽다 — 위 「(phase 78 step 0)」 줄)

쓰인 곳: `protocols-encapsulation.tcp-ip-model`
(phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.tftp`(§4.2.1 — UDP 위에서 스스로 믿을 수 있게 블록 하나씩, 지연이 큰 경로에서는 성능이 좋지 않다, LAN에서 부팅하는 데 쓴다, §4.2.3.1 — 끝까지 가면 파일은 바르게 옮겨진다),
`app-protocols-mail-file.ftp`(§4.1.2.5 — 스트림 방식에서는 전송마다 새 데이터 연결), `app-protocols-mail-file.ftp-modes`(§4.1.2.6 — 서버는 `PASV`를 구현해야 한다), `exam-notes.md` E30·E31
(phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.snmp`(§6.3.1 — SNMP는 원격 관리에 쓰는 네트워크 관리 프로토콜이고, 인터넷 호스트는 SNMP 에이전트를 갖추는 것이 좋다)
(phase 79 step 0에서 쓰일 곳) `dns.dns`(§6.1.1 — 분산 데이터베이스, 호스트 테이블이 커져 DNS가 생겼다), `dns.hosts-file`(§6.1.1 — 로컬 호스트 테이블을 함께 둘 수 있다, §6.1.3.8 — 무엇을 앞세울지는 설정),
`dns.domain-hierarchy`(§2.1 — 호스트 이름은 숫자로 시작해도 된다·63자/255자, §6.1.3.5 — DNS 자체의 문법은 넓다), `dns.name-servers`(§6.1.3.1 — 완전 서비스 리졸버와 스텁 리졸버), `dns.dns-cache-ttl`(§6.1.2.1 — TTL 0)

## (2026-10-28) RFC 1350 — The TFTP Protocol (Revision 2)
https://www.rfc-editor.org/rfc/rfc1350

인터넷 표준(STD 33)이다.

- TFTP(Trivial File Transfer Protocol)는 파일을 주고받는 아주 단순한 프로토콜이고, UDP 위에 구현되어 있다 — Summary, §1
- (phase 77 step 3, 2026-11-09 rfc-editor.org 원문 — RFC 1782~1785·2347~2349가 고쳤다) 작고 구현하기 쉽게 만들어 일반 FTP의 기능 대부분이 없다 — 원격 서버의 파일을 읽고 쓰는 것뿐이고, 디렉터리 목록도 사용자 인증도 없다 — §1
- (phase 77 step 3) **UDP 위에서 스스로 확인하고 다시 보낸다**: 파일을 512바이트 고정 블록으로 보내고, 데이터 패킷마다 확인 응답 패킷을 받아야 다음 패킷을 보낸다(lock step). 패킷을 잃으면 받을 쪽이 시간 초과 뒤 마지막 패킷을 다시 보내,
  잃은 패킷을 보낸 쪽이 그것을 다시 보내게 한다. 512바이트보다 짧은 데이터 패킷이 전송의 끝을 알린다 — §2
- (phase 77 step 3) 이 문서는 TFTP가 FTP보다 **빠르다**고 하지 않는다 — 작고 구현하기 쉽다고만 한다(§1). 확인 응답을 받아야 다음 블록을 보내는 방식(§2)이다
- (phase 78 step 0, 2026-11-11 rfc-editor.org 원문 — Internet Standard 그대로) **요청과 포트**: 전송은 쓰기 요청(WRQ — 상대의 파일 시스템에 쓴다)이나 읽기 요청(RRQ — 상대에게서 읽는다)으로 시작하고, 그 요청이 곧 연결을 청하는 일이다 — §2, §4.
  양 끝은 저마다 TID(전송 식별자)를 골라 UDP 포트로 쓴다. 요청하는 쪽은 자기 TID에서 **서버의 69번**으로 첫 요청을 보내고, 서버는 **자기가 새로 고른 TID를 출발지로** 답한다. 그 뒤 전송 내내 그 두 TID(포트)를 쓴다 — §3, §4.
  읽기 요청의 긍정 응답은 첫 데이터 패킷이고, 쓰기 요청의 긍정 응답은 블록 번호 0인 확인 응답이다. 데이터 블록의 번호는 1부터 하나씩 늘어난다 — §4
- (phase 78 step 0) 패킷 종류는 다섯이다 — 읽기 요청(RRQ)·쓰기 요청(WRQ)·데이터(DATA)·확인 응답(ACK)·오류(ERROR) — §5
- (phase 78 step 0) **끝**: 데이터 패킷의 데이터 칸은 0~512바이트다. 512바이트면 마지막 블록이 아니고, 0~511바이트면 그 블록이 전송의 끝이다 — §5, §6.
  그러니 **파일 크기가 512의 배수이면 마지막에 데이터가 0바이트인 패킷을 보내 끝을 알린다**(위 규칙에서 나오는 계산 — 이 말이 문서에 따로 적혀 있지는 않다). 예: 1,300바이트 파일은 512 + 512 + 276바이트 블록 셋이고, 276 < 512라 셋째가 끝이다(계산)
- (phase 78 step 0) **잃은 패킷과 실패**: 잃은 패킷은 시간 초과 뒤 다시 보내 채운다(§2 — 위 phase 77 step 3 줄). 오류 패킷은 확인 응답도 재전송도 받지 않고, 대부분의 오류는 연결을 끝낸다 — §2.
  마지막 데이터 패킷의 확인 응답을 끝내 받지 못한 채 보내는 쪽이 재전송을 그만두면, 전송이 성공했는지 실패했는지 알 수 없는 채로 연결이 닫힌다 — §6.
  **이 문서는 잃은 블록을 빼놓은 채 전송을 마친다고 하지 않는다** — 다시 보내 채우거나, 전송 자체가 끝나 버린다
- (phase 78 step 0) 이 문서는 TFTP가 어디에 쓰이는지 말하지 않는다 — 쓰임(LAN에서 호스트를 부팅하는 일)은 위 RFC 1123 §4.2.1
- (phase 82 step 12) 네트워크 부팅의 차례에서 TFTP가 맡는 자리 — 주소와 부팅 파일 이름을 먼저 받고(BOOTP·DHCP) 그 파일을 TFTP로 받는다 — 는 이 문서가 아니라 RFC 951 §2와 RFC 2131 §1.2·§2가 적는다(아래 「(phase 73 step 1) RFC 951 — …, RFC 2131 — …」 항목의 「(phase 82 step 12)」 줄).
  쓰일 곳: (phase 82 step 14에서 쓰일 곳) `network-devices.pxe`(부팅 파일을 TFTP로 받는다 — `app-protocols-mail-file.tftp`와 뜻을 맞춘다)

쓰인 곳: `protocols-encapsulation.tcp-ip-model`
(phase 77 step 3에서 쓰일 곳) `tcp-udp.transport-choice`(§1 — UDP 위의 파일 전송, §2 — 블록마다 확인 응답, 시간 초과 뒤 재전송: UDP 위에서 응용이 신뢰성을 더하는 예), 기출 대조(`exam-notes.md` 「phase 77 step 3」 문단 — TFTP는 TCP를 쓰지 않는다)
(phase 77 step 8) `tcp-udp.transport-choice`(§1 — UDP 위의 간단한 파일 전송, §2 — 512바이트 블록마다 확인 응답, 블록을 잃으면 받을 쪽이 시간 초과 뒤 마지막 확인 응답을 다시 보내 보내는 쪽이 잃은 블록을 다시 보낸다), 도식 `transport-choice`, 문항 n187
(phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.tftp`(§1 — UDP, 로그인·디렉터리 목록 없음, 읽기와 쓰기만, §2 — 512바이트 블록·블록마다 확인 응답·시간 초과 뒤 재전송·짧은 블록이 끝,
§4 — 69번으로 요청하고 서버는 새 포트로 답한다, §5·§6 — RRQ·WRQ, 0~511바이트가 끝), `exam-notes.md` E30·E31, 기출 대조(`exam-notes.md` 「phase 78 step 0」 문단)

## (2026-10-28) RFC 4949 — Internet Security Glossary, Version 2
https://www.rfc-editor.org/rfc/rfc4949

정보성(Informational) 문서다. 용어의 뜻을 확인하는 데만 쓴다.

- 프로토콜은 시스템 사이의 연관(예: 통신)을 구현·제어하는 규칙(형식과 절차)의 묶음이다. 또는 둘 이상의 개체가 함께 목표를 이루려고 밟는 순서 있는 단계들이다 — §4 「protocol」
- 암호화는 데이터(평문)를 원래 뜻을 감춘 다른 형태(암호문)로 바꿔, 원래 형태로 쓰이지 못하게 하는 변환이다. 되돌리는 변환이 복호화다 — §4 「encryption」

- (phase 82 step 8, 2026-11-19 rfc-editor.org 텍스트판을 IPv4로 다시 받아 확인 — Informational, 2007-08, RFC 2828을 폐기했고 이 문서를 고치거나 폐기한 RFC는 없다) **게이트웨이·브리지·라우터·프록시**:
  - **게이트웨이**: 하는 일은 비슷하지만 구현이 다른 컴퓨터 네트워크 둘(이상)에 붙어, 그 네트워크 사이에 한쪽 방향이나 양쪽 방향의 통신이 되게 하는 중간 시스템(인터페이스·중계)이다. 두 네트워크는 프로토콜이나 보안 방식 같은 여러 면에서 다를 수 있고,
    호스트에 서비스를 주는 프로토콜이 다르면 게이트웨이가 **한 프로토콜을 다른 프로토콜로 바꾸거나** 다른 방법으로 서로 동작하게 돕는다. **이론으로는 OSI 참조 모델의 어느 계층에서도 게이트웨이를 생각할 수 있지만, 실제로는 대개 2계층(브리지)·3계층(라우터)·7계층(프록시 서버)에서 동작한다** — §4 「gateway」와 그 Tutorial
  - **브리지**: 두 네트워크(대개 LAN 둘) 사이에서 OSI 2계층으로 흐르는 트래픽의 게이트웨이다 — §4 「bridge」
  - **라우터**: 자기에게 온 것이 아닌 IP 패킷을 넘겨주는 네트워크 컴퓨터다(1a). 인터넷 프로토콜 묶음의 인터넷 계층에서 동작해 서브네트워크 둘 이상을 잇는 게이트웨이이고(1b), OSI로는 3계층에서 두 네트워크 사이의 게이트웨이로 데이터 패킷을 중계하고 길을 정하는 컴퓨터다(1c) — §4 「router」
  - **프록시**: 사용자나 클라이언트를 대신해 일하는 컴퓨터 프로세스다(1). 또는 — 흔히 방화벽이나 그 일부로 쓰여 — 클라이언트와 서버 사이에서 응용의 주고받음이나 프로토콜을 중계하는데, **클라이언트에게는 서버처럼, 서버에게는 클라이언트처럼 보이는** 프로세스다(2) — §4 「proxy」
  - 프록시의 흐름(같은 항목 Tutorial): 보호된 안쪽의 클라이언트가 바깥 서버에 바로 잇지 않고 프록시 서버에 잇고, 프록시 서버가 바깥 서버에 잇는다 — 안쪽에서 요청을 기다려 받아 바깥 서버로 넘기고, 응답을 받아 클라이언트에게 돌려준다.
    클라이언트가 프록시를 의식하지 않을 수도 있고(투명), 먼저 프록시에 이어야 할 수도 있다. 프록시는 **캐시, 높은 수준의 기록(로그), 접근 통제**를 할 수 있고, 7계층의 프록시는 3계층의 필터링 라우터보다 세밀한 보안 서비스를 줄 수 있다(예: FTP 프록시가 보호된 네트워크에서 밖으로 보내는 전송만 허락한다) — §4 「proxy」 Tutorial
  - 「repeater」·「hub」·「switch」·「proxy server」·「load balancer」는 이 용어집의 항목이 아니다(전문 검색). 「proxy server」는 게이트웨이 항목의 7계층 예로만 나온다
  쓰인 곳: (phase 82 step 9·10에서 쓰일 곳) `network-devices.device-layers`(게이트웨이가 계층에 따라 브리지·라우터·프록시 서버로 나타난다, 라우터는 IP 패킷을 넘기는 3계층 장치), `network-devices.gateway`(정의, 프로토콜을 바꾸거나 서로 동작하게 돕는다, 이론으로는 어느 계층에서도·실제로는 2·3·7계층),
  `network-devices.proxy-server`(프록시의 두 정의, 클라이언트에게는 서버·서버에게는 클라이언트처럼 보인다, 안쪽 클라이언트 → 프록시 → 바깥 서버의 흐름, 캐시·기록·접근 통제), 기출 대조(`exam-notes.md` 「phase 82 step 8」 문단)
- (phase 82 step 10) 쓰인 곳: `network-devices.gateway`(문단 0 — 하는 일은 비슷하지만 만든 방식이 다른 네트워크 사이에서 통신이 오가게 하는 중간 장치, 두 네트워크는 프로토콜이나 보안 방식이 다를 수 있다, 문단 1 — 프로토콜을 바꿔 넘기거나 다른 방법으로 함께 동작하게 돕는다, 문단 3 — 이론으로는 어느 계층에서도·실제로는 브리지·라우터·프록시 서버의 세 계층), `network-devices.proxy-server`(문단 0 — 클라이언트를 대신해 일하는 중계자, 클라이언트는 프록시를 서버로·서버는 클라이언트로 여긴다, 문단 3 — 기록을 남기거나 정해 둔 요청을 막는다), 문항 n329·n330·n331 해설
쓰인 곳: `protocols-encapsulation.protocol`, `protocols-encapsulation.osi-model`

## (2026-10-28) ITU-T X.800 (03/91) — Security architecture for Open Systems Interconnection for CCITT applications
https://www.itu.int/rec/T-REC-X.800-199103-I/en

1991-03 승인, 현행 권고다. ISO 7498-2와 짝이고, X.200 §5.1.3 NOTE가 보안을 이 권고에 넘긴다. ADR-057이 허용 목록에 더했다.

- 표현 계층은 응용 계층이 주는 기밀성 서비스 등을 받쳐 주는 기능을 줄 수 있다. 그 기능은 전송 구문으로 인코딩된 데이터에서만 돌아가는 것, 예컨대 암호 기법에 기댄 것이다 — §7.6.1, Note
- 데이터 전달에 쓰는 암호화 메커니즘을 위쪽 계층에 둘 때는 표현 계층에 둔다. 보낼 때는 전송 구문으로 바꾸는 과정의 마지막 단계, 받을 때는 첫 단계에서 동작한다 — §7.6.2
- 암호화는 표현 계층만의 일이 아니다. 데이터 링크 계층이 주는 보안 서비스는 기밀성 둘(연결·비연결)뿐이고, 그것을 암호화 메커니즘으로 준다 — §7.2.1, §7.2.2.
  물리(§7.1)·네트워크(§7.3)·전송(§7.4) 계층에도 기밀성 서비스가 있고, 세션 계층에는 보안 서비스가 없다 — §7.5.1

쓰인 곳: `protocols-encapsulation.osi-model`, `exam-notes.md` E3

## (2026-10-28) ITU-T Q.9 (11/88) — Vocabulary of switching and signalling terms
https://www.itu.int/rec/T-REC-Q.9-198811-I/en

1988-11 승인, 현행 권고다. ADR-057이 허용 목록에 더했다.

- 메시지 교환(message switching)은 축적 전달 교환(store-and-forward switching)이라고도 한다. 망의 몇몇 노드가 메시지를 받아 필요한 만큼 저장했다가 넘겨,
  메시지가 갈 길을 이어 가는 과정이다 — 용어 1130
- 「datagram」은 이 용어집에 없다

쓰인 곳: `protocols-encapsulation.packet-switching`

## (2026-10-28) ITU-T X.25 (10/96) — Interface between DTE and DCE for terminals operating in the packet mode
https://www.itu.int/rec/T-REC-X.25-199610-I/en

1996-10 승인, 현행 권고다. 패킷 교환 공중 데이터망에 단말을 잇는 규격이다. ADR-057이 허용 목록에 더했다.

- 가상 회선 서비스는 가상 호(virtual call)와 영구 가상 회선(permanent virtual circuit) 둘이다. 가상 호는 호를 맺고 푸는 절차가 있다 — §3, §4.1
- 가상 호와 영구 가상 회선에서 오가는 데이터 패킷에는 방향마다 차례로 순서 번호를 매긴다 — §4.4.1.1
- 망은 가상 호마다(호 단위로) 자원을 배정하고 그 호가 지날 경로를 정한다 — §6.27
- 이 판에는 데이터그램 서비스가 없다 — 전문 검색

쓰인 곳: `protocols-encapsulation.packet-switching`

## (phase 71) ITU-T G Suppl. 42 (10/2018) — Guide on the use of the ITU-T Recommendations related to optical fibres and systems technology
https://www.itu.int/rec/T-REC-G.Sup42-201810-I/en

G 시리즈 권고의 보충 문서(Supplement)다. 권고가 아니라 광섬유·광 전송 권고들의 쓰임을 안내하는 정보성 문서라, 용어의 뜻을 확인하는 데만 쓴다. 위 페이지에서 무료 PDF를 받아 읽었다.

- 광섬유는 구리선이 전자를 이끌듯 빛을 이끌 수 있어, 레이저 빛으로 통신하는 데 알맞다고 제안되었다 — §5
- 광 송신기 안에서 전기 신호인 비트 흐름이 빛(광 반송파)의 세기를 바꾸고, 광섬유를 지난 광 신호는 광 수신기가 다시 전기 신호로 바꾼다 — §5.6

쓰인 곳: `network-basics.communication-link`, `ethernet.standard-names`(광케이블은 빛을 이끄는 광섬유로 빛 신호를 실어 나른다)

## (phase 71) Microsoft Learn — Windows commands, ping, Task Manager
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping
https://learn.microsoft.com/en-us/troubleshoot/windows-server/support-tools/support-tools-task-manager

지원되는 모든 Windows와 Windows Server를 대상으로 쓴 문서다(Windows commands 첫 문단, Task Manager 「Applies to」). 2026-10-28에 읽은 판: Windows commands 2025-07-29, ping 2023-09-15, Task Manager 2026-02-12.

- 지원되는 모든 Windows에는 콘솔 명령이 들어 있다. Windows의 명령줄 셸은 명령 셸과 PowerShell 둘이고, 셸은 사용자와 운영 체제·응용 프로그램 사이를 바로 잇는 프로그램이다.
  ping은 이 명령 목록에 있다 — Windows commands 첫 문단, 「Command-line shells」, 「Command-line reference A-Z」
- ping은 ICMP echo 요청 메시지를 보내 다른 TCP/IP 컴퓨터와 IP 수준에서 이어지는지 확인하고, 돌아온 echo 응답을 표시한다 — ping 첫 문단
- ping의 문법은 옵션 뒤에 목적지(`<targetname>`)를 적는 꼴이고, 목적지는 호스트 이름이나 IP 주소다. 예를 들어 `ping /a 10.0.99.221`처럼 입력한다 — ping 「Syntax」, 「Parameters」, 「Examples」
- 작업 관리자는 Windows에 기본으로 들어 있는(in-box) 도구로, 응용 프로그램과 프로세스의 성능과 자원 사용을 살핀다 — Task Manager 「Summary」
- 작업 관리자의 프로세스 탭은 실행 중인 앱과 백그라운드 프로세스의 목록을, 성능 탭은 성능 데이터의 목록과 그래프를 보여 준다 — Task Manager 「More information」 표
- (phase 73 step 1) 2026-10-29에 다시 읽은 판(페이지의 「Last updated on」): arp 2025-08-15, ping 2024-11-01, tracert 2024-11-01. 세 페이지 모두 Windows Server 2016~2025, Windows 10·11을 대상으로 적는다.
  arp — https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/arp ,
  tracert — https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/tracert
- (phase 73 step 1) arp 명령은 ARP 캐시의 항목을 보여 주고 고친다. ARP 캐시는 IP 주소와 그 주소로 알아낸 물리 주소(이더넷 등)를 담은 표이고, 네트워크 어댑터마다 따로 있다 — arp 첫 문단
- (phase 73 step 1) arp의 옵션: `-a`는 지금 ARP 항목을 보여 준다(`-g`도 같다). `-d`는 지정한 IP 주소의 항목을 지운다(`*`이면 모두). `-s`는 IP 주소와 물리 주소의 짝을 **고정(static) 항목**으로 더하고, 그 항목은 TCP/IP를 다시 시작할 때까지 남는다.
  동적 항목을 고정 항목으로 바꾸는 옵션은 따로 없다 — 고정 항목은 `-s`로 더한다 — arp 「Parameters」, 「Remarks」. 물리 주소는 16진수 여섯 바이트를 하이픈으로 이어 적는다(예: `00-AA-00-4F-2A-9C`) — arp 「Remarks」
- (phase 73 step 1) ping: 에코 요청을 보낸 횟수는 `/n <count>`로 정하고 기본값은 4다. `/i <TTL>`은 **보내는 에코 요청**의 IP 헤더 TTL 칸 값을 정한다(기본값은 그 호스트의 기본 TTL). 받은 에코 응답을 왕복 시간과 함께 보여 준다 — ping 첫 문단, 「Parameters」.
  출력 예는 응답마다 `bytes=`, `time=`, `TTL=`를 적는다 — 「Example of the ping command output」(그 TTL이 무엇인지는 이 페이지에 적혀 있지 않다 — 아래 Linux ping(8) 줄)
- (phase 73 step 1) tracert: 목적지로 가는 경로를 알아내려고 TTL을 1부터 하나씩 늘린 **ICMP 에코 요청**(IPv6는 ICMPv6 메시지)을 보낸다. 경로의 라우터는 넘기기 전에 TTL을 최소 1 줄여야 하므로 TTL은 사실상 지날 수 있는 링크 수의 상한이고,
  TTL이 0이 되면 라우터가 출발지에 ICMP 시간 초과를 돌려보내기로 되어 있다. 중간 라우터의 시간 초과와 목적지의 에코 응답으로 경로를 알아낸다. 최대 홉 수는 기본 30(`/h`)이다.
  시간 초과를 보내지 않는 라우터는 보이지 않고 그 홉에는 `*`가 찍힌다 — tracert 첫 세 문단, 「Parameters」
- (phase 78 step 11) 2026-11-11에 IPv4로 다시 내려받아 읽은 판: ping·tracert 모두 바닥의 「Last updated on」 2024-11-01, 머리의 `updated_at` 2026-02-16(`ms.date`는 ping 2023-09-15, tracert 2023-09-27).
  두 페이지 모두 「Applies to」가 Windows Server 2016~2025, Windows 10·11, Azure Local 2311.2 이후다
- (phase 78 step 11) ping의 **옵션 표기**: Syntax·Parameters·Examples가 옵션을 모두 빗금(`/t`, `/a`, `/n`, `/l`, `/f`)으로 적는다. 하이픈(`-t`)으로도 받는다는 문장은 이 페이지에 없다 — Syntax, Examples.
  tracert(`/d`, `/h`)도 빗금으로 적는다 — 같은 꼴. 하이픈 표기의 근거는 아래 「(phase 78 step 11) Microsoft Learn — Windows Server 문제 해결 문서」 항목의 IPv6 문서(`ping -6`, `tracert -6`)뿐이다 — `exam-notes.md` E33
- (phase 78 step 11) ping의 옵션(기출의 보기에 나오는 넷과 그 바탕): `/t`는 사용자가 끊을 때까지 에코 요청을 계속 보내게 한다. 끊는 키는 둘이다 — **Ctrl+Break**는 끊고 **통계를 보여 주고**, **Ctrl+C**는 끊고 **명령을 끝낸다**(문서는 Ctrl+Break 뒤에 계속 보내는지를 따로 적지 않고, 「통계를 보인다」와 「끝낸다」를 나란히 견줄 뿐이다).
  `/a`는 목적지 IP 주소로 이름을 거꾸로 찾아(역방향 이름 확인) 성공하면 그 호스트 이름을 보인다. `/n`은 보낼 에코 요청의 수(기본 4 — 위 줄). `/l`은 에코 요청의 데이터 칸 크기를 바이트로 정한다(기본 32, 가장 크게 65,500).
  `/f`는 IP 헤더의 「조각내지 말 것(Don't Fragment)」 플래그를 1로 켜서 보낸다(IPv4만) — 경로의 라우터가 그 요청을 조각낼 수 없어 경로 MTU 문제를 찾을 때 쓴다 — 「Parameters」.
  `/w`는 응답 하나를 기다리는 시간(ms, 기본 4000)이고 그 안에 응답이 없으면 「Request timed out」을 보인다 — 「Parameters」. 옵션 없이 부르면 도움말을 보인다 — 첫 문단
- (phase 78 step 11) ping의 **출력 예**: 첫 줄에 목적지 이름·`[주소]`와 보내는 데이터 크기(32바이트)를 적고, 이어 응답마다 한 줄씩 `Reply from <주소>: bytes=… time=…ms TTL=…`이 넷 나온다. 요약 줄은 이 페이지의 예에 없다 — 「Example of the ping command output」.
  요약 줄(`Ping statistics for …: Packets: Sent = …, Received = …, Lost = … (…% loss)`, 이어 왕복 시간의 Minimum·Maximum·Average)의 꼴은 아래 「(phase 74 step 5) Microsoft Learn …, Check Microsoft Broadband Network Adapter」 항목의 「(phase 78 step 11)」 줄에 있다
- (phase 78 step 11) tracert의 **출력 예**와 읽는 법(Examples): 첫머리에 「목적지 이름 `[주소]`까지, 최대 30홉」을 알리는 줄, 이어 홉마다 한 줄 — **맨 앞 칸은 1부터 하나씩 커지는 홉 번호**, **가운데 세 칸은 그 홉의 장치까지 다녀오는 왕복 시간(ms)**, **맨 끝 칸은 그 장치의 IP 주소나 이름**이다.
  역방향 DNS 조회가 되면 이름과 `[주소]`가, 안 되면 주소만 나온다. 답이 오지 않은 자리에는 `*`가 찍히고, 세 번 모두 오지 않은 홉은 `*` 셋과 「Request timed out.」이 나온다. 끝에 「Trace complete.」가 나온다 — 「Examples」 뒤 설명.
  각 홉은 패킷이 목적지로 가며 거치는 라우터 같은 중간 장치다 — 같은 절. 보이는 경로는 각 라우터에서 **보내는 쪽에 가장 가까운 인터페이스**의 주소다 — 셋째 문단
- (phase 78 step 11) tracert의 옵션: `/d`는 중간 라우터의 IP 주소를 이름으로 바꾸려 하지 않게 해 결과가 빨리 나올 수 있다. `/h`는 찾을 최대 홉 수(기본 30). `/w`는 시간 초과·에코 응답 하나를 기다리는 시간(ms, 기본 4000)이고 그 안에 받지 못하면 `*`를 찍는다 — 「Parameters」.
  경로를 찾으면서 **라우터와 링크마다의 지연과 패킷 손실**까지 보려면 pathping을 쓰라고 한다 — 「Important」 뒤 문단
- (phase 78 step 11) 두 명령 모두 네트워크 어댑터 속성에 TCP/IP가 설치돼 있어야 쓸 수 있다 — ping 첫머리 Note, tracert 「Important」
- (phase 80 step 11) 2026-11-16에 IPv4로 다시 받은 판: Windows commands `updated_at` 2026-02-26(`ms.date` 2025-07-29), 한국어판 같은 날. 「Command-line shells」는 PowerShell이 명령 셸의 기능을 넓혀 cmdlet이라는 PowerShell 명령을 실행하게 만든 것이고,
  **PowerShell에서는 Windows 명령과 PowerShell cmdlet을 모두 실행할 수 있지만 명령 셸에서는 Windows 명령만 실행되고 cmdlet은 실행되지 않는다**고 적는다 — 같은 절

쓰인 곳: `network-basics.throughput`(작업 관리자), `network-basics.packet-loss`(ping 명령),
(phase 73 step 1에서 쓰일 곳) `arp.arp-cache`(arp `-a`·`-s`·`-d`), `icmp.time-exceeded`(tracert — 에코 요청, TTL을 늘린다), `icmp.ping`(ping `/n`, 왕복 시간), `exam-notes.md` 앞 문단([기출 2025-08-24 #8]의 `-d` 보기)
(phase 73 step 13) `icmp.time-exceeded`와 `traceroute` 도식: Windows tracert의 TTL 1부터 증가, 중간 시간 초과·끝 에코 응답, 기본 최대 30홉·답이 없으면 *. 2026-10-29 tracert 문서를 다시 확인했다.
(phase 73 step 14) `icmp.ping`(ping — 목적지에 호스트 이름이나 IP 주소를 적는다, `/n`으로 보낼 요청 수를 정하고 기본은 4개, 받은 에코 응답을 왕복 시간과 함께 보이고 출력 예는 응답마다 `time=`(ms 단위)과 `TTL=`를 적는다). 2026-10-29 ping 문서를 다시 확인했다(Last updated 2024-11-01) — 출력 예에는 응답 줄만 있고 요약 줄은 없다
(phase 78 step 11에서 쓰일 곳) `diagnostic-commands.ping-options`(ping `/t`·Ctrl+Break·Ctrl+C, `/n` 기본 4, `/a`, `/l` 기본 32, 빗금 표기, 출력 예의 응답 줄), `diagnostic-commands.tracert`(출력 예의 칸 — 홉 번호·왕복 시간 셋·주소나 이름, `*`와 Request timed out, `/d`·`/h` 기본 30, 보내는 쪽에 가까운 인터페이스, 지연·손실은 pathping),
`diagnostic-commands.pathping`(tracert 문서가 pathping을 가리키는 문단), `exam-notes.md` 「phase 78 step 11」 문단([기출 2025-08-24 #42]의 `/a`·`/f`·`/n` 보기)과 E33
(phase 80 step 6) `windows-ad.ds-commands`(Windows commands 「Command-line shells」 — PowerShell은 명령 셸, 곧 명령 프롬프트와 함께 Windows에 들어 있는 명령 줄 셸이고, 셸은 사용자와 운영 체제·응용 프로그램 사이를 잇는 프로그램이다 — 같은 일을 하는 PowerShell 명령 `New-ADUser` 앞에서 한 줄로 푼다)
(phase 80 step 8에서 쓰일 곳) `windows-admin-tools.powershell`(「Command-line shells」 — Windows의 명령줄 셸은 명령 셸(명령 프롬프트)과 PowerShell 둘), `windows-admin-tools.resource-monitor`(「Task Manager」 — 작업 관리자는 응용 프로그램·프로세스의 성능과 자원 사용을 살피는 기본 도구. 리소스 모니터와의 관계는 아래 「(phase 80 step 8) … 성능 모니터·리소스 모니터」 항목)
(phase 80 step 11) `windows-admin-tools.powershell`(명령줄 셸은 명령 프롬프트와 PowerShell 둘, PowerShell은 Windows 명령과 cmdlet을 모두 실행하고 명령 프롬프트는 cmdlet을 실행하지 못한다), 문항 n278

## (phase 72) IEEE 802.3 — Ethernet, 4.1.2 Normal operation, 4.2.4 Frame reception model, 4.2.5 Preamble generation
https://www.ieee802.org/3/as/public/0503/4d0_1_CMP.pdf

위 3장 항목과 같은 IEEE P802.3as Draft 0.1(2005-03)의 4장이다. IEEE Std 802.3-2005 4장 본문을 싣고 있어 그 본문을 근거로 쓴다.

- 보낼 때 MAC 부계층은 위에서 받은 데이터로 프레임을 만들면서, 프레임 **앞에** 프리앰블과 SFD를 붙인다. 목적지·출발지 주소, 길이/타입 필드, (필요하면) 패드, FCS도 이때 붙인다 — §4.1.2.1.1
- 받을 때는 물리 계층이 들어오는 프리앰블에 맞춰 동기를 잡는다. MAC 부계층은 프리앰블과 SFD까지의 앞 비트를 버리고 그 뒤를 모은다 — §4.1.2.1.2
- 모은 프레임의 목적지 주소 필드를 보고 이 스테이션이 받을 프레임인지 정한다. 받을 프레임이면 주소·길이/타입·데이터를 MAC 클라이언트(위 계층)로 넘기고,
  FCS로 프레임이 오는 길에 손상됐는지도 검사한다 — §4.1.2.1.2
- 주소 인식: MAC 부계층은 목적지 주소가 ① 자기 개별 주소인 프레임, ② 브로드캐스트 주소인 프레임, ③ 위 계층이 켜 둔 그룹 주소인 프레임을 알아보고 받아들인다.
  켜 둔 그룹 주소는 다시 끌 수 있다. 목적지 주소와 상관없이 오류 없는 프레임을 모두 받아들이는 무차별(promiscuous) 수신 모드를 둘 수도 있다(선택) — §4.2.4.1.1
- FCS 검사: 받은 비트(FCS 필드는 빼고)로 만든 CRC가 받은 값과 다르면 오류로 보고 그 프레임을 잘못된 것으로 판정한다 — §4.2.4.1.2
- 프리앰블은 물리 계층 회로가 안정되도록 데이터보다 먼저 보내는 비트열이고, 10101010을 일곱 번 보낸다. 왼쪽 비트부터 보내며 0으로 끝나고, 바로 뒤에 SFD가 온다 — §4.2.5

쓰인 곳: (phase 72) 강의 수정 이력 L28, `ethernet.nic`(자기 주소·브로드캐스트 주소·켜 둔 그룹 주소의 프레임만 받아 위 계층으로 넘긴다, 무차별 모드는 선택 기능), `ethernet.frame`(프리앰블·SFD), `ethernet.fcs`(받는 쪽이 FCS를 뺀 비트로 다시 계산해 받은 값과 견주고, 다르면 잘못된 프레임으로 판정, §4.2.4.1.2), (phase 72 step 6) `hub-switch-vlan.hub`·문항 n035 해설(허브가 내보낸 신호를 받은 호스트의 NIC가 목적지 주소를 보고 자기 프레임만 받아들이고 나머지는 버린다)

## (phase 72) IEEE 802.3 Working Group — Editorial guidelines (Frames and packets; Mb/s, Gb/s)
https://www.ieee802.org/3/WG_tools/editorial/requirements/words.html

IEEE 802.3 작업 그룹이 표준 본문을 쓸 때 따르는 낱말 지침이다. 2026-10-28에 읽은 판은 2024-05-15에 마지막으로 고쳤다.

- 프레임(MAC 프레임)은 **목적지 주소부터 FCS까지**다. MAC 프레임에 프리앰블·SFD·(필요하면) 확장 필드를 더한 것은 패킷(MAC 패킷)이라 부른다 — 「Frames and packets」
- 비트 전송 속도의 단위는 b/s이고 Mb/s·Gb/s·Tb/s로 적는다. bps·Mbps 꼴은 쓰지 않는다 — 「MBd, GBd, Mb/s, Gb/s」
- (같은 쓰임) 2026년에 진행 중인 P802.3dt 프로젝트의 범위 문안도 메타데이터를 「패킷의 프리앰블 필드」에 싣는다고 쓴다 —
  https://www.ieee802.org/3/dt/public/26_03/law_3dt_01a_2603.pdf PDF 5쪽 「IEEE P802.3dt draft PAR Scope」(802.3dt 태스크 포스 발표 자료, 2026-03-10)

쓰인 곳: (phase 72) 강의 수정 이력 L28, `ethernet.frame`(목적지 주소~FCS가 프레임, 프리앰블·SFD는 앞에 붙음), `ethernet.standard-names`(속도 단위 표기)

## (phase 72) IEEE Std 802.3ah-2004 — Introduction, 1.4 Definitions
https://www.ieee802.org/21/doctree/2006_Meeting_Docs/2006-11_meeting_docs/802.3ah-2004.pdf

발행된 IEEE 표준(IEEE Std 802.3ah-2004, 2004-09-07, IEEE Std 802.3-2002의 개정판)의 전문 PDF다. IEEE 802.21 작업 그룹이 회의 자료로 `ieee802.org`에 올려 둔 사본을 읽었다.

- IEEE 802.3의 프로젝트(개정)는 802.3 뒤에 붙인 꼬리 글자로 부른다(예: 802.3ae) — Introduction(PDF 5쪽)
- 802.3이 정하는 MAC 프로토콜은 CSMA/CD이고, 802.3-1985는 10 Mb/s로 동작했다. 그 뒤로 새 매체·새 속도·새 기능이 개정으로 더해졌다 — Introduction(PDF 5쪽)
- (phase 72 step 7) CSMA/CD의 풀네임은 Carrier Sense Multiple Access with Collision Detection이다 — 같은 Introduction 문단(「The media access control (MAC) protocol specified in IEEE Std 802.3 is …」)
- 802.3u는 100 Mb/s 동작을 더했고 **Fast Ethernet**이라고도 부른다. 802.3z는 1000 Mb/s 동작을 더했고 **Gigabit Ethernet**이라고도 부른다. 802.3ae는 **10 Gigabit Ethernet**이라고도 부른다.
  이런 큰 개정은 시장에서 프로젝트 번호로도 가리킨다. 802.3x는 전이중 동작과 흐름 제어 프로토콜을 정했다 — Introduction(PDF 5쪽)
- 규격 이름 하나는 「IEEE 802.3의 물리 계층 규격(Physical Layer specification)」 하나로 정의된다. 예: 1000BASE-BX10은 싱글 모드 광섬유 **한 가닥**으로, 1000BASE-LX10은 싱글 모드나 멀티 모드 광섬유 두 가닥으로
  1000 Mb/s 점대점 링크를 만드는 물리 계층 규격이다. 100BASE-FX는 멀티 모드 광섬유 두 가닥을 쓰는 100 Mb/s 규격이다 — §1.4(PDF 20쪽)

쓰인 곳: (phase 72) 강의 수정 이력 L26·L27, `ethernet.fast-gigabit`(802.3u를 Fast Ethernet, 802.3z를 Gigabit Ethernet, 802.3ae를 10 Gigabit Ethernet이라고도 부른다), (phase 72에서 쓰일 곳) `ethernet.ethernet`(개정판 이름), `ethernet.standard-names`, (phase 72 step 7) `hub-switch-vlan.csma-cd`(풀네임, IEEE 802.3이 매체 접근 방식으로 정한 규칙), 문항 n038·n039 해설(풀네임)

## (phase 72) David Law, 「Past PHY naming」 (IEEE 802.3, 2015-12-05)
https://www.ieee802.org/3/cb/public/jan16/PHY_names_1115.pdf

당시 IEEE 802.3 작업 그룹 의장이 P802.3cb 태스크 포스 자료로 올린 정리다. 802.3의 PHY(물리 계층 규격) 이름 목록과 이름 읽는 법을 담았다.

- 이름 꼴: 「데이터 속도 + 변조 방식 + 하이픈 뒤 글자」. 속도는 수만 있으면 Mb/s(10, 100, 1000), G가 붙으면 Gb/s(2.5G, 5G, 10G, 25G, 40G, 100G, 400G)다.
  변조 방식 BASE는 베이스밴드(Baseband), BROAD는 브로드밴드(Broadband)다 — PDF 10쪽
- 하이픈 뒤 첫 글자는 매체·파장·거리를 가리킨다: T 트위스티드 페어, C 트윈 액시얼(twin axial) 구리, S 짧은 파장(850 nm)이나 짧은 거리(100 m), L 긴 파장(1310 nm)이나 10 km,
  E 아주 긴 파장(1510 nm)이나 40 km, F 광섬유(2 km), K 백플레인, B 양방향 광, P 수동 광 — PDF 10쪽 「First letter (Media/Wavelength/Reach)」
- 하이픈 뒤 둘째 글자는 부호화 방식이다: X 외부에서 정한 부호(4B5B·8B10B), R 스크램블 부호(64B66B), W WAN 부호(SONET/SDH) — PDF 10쪽
- 처음 규격(10BASE5·10BASE2)은 BASE 뒤의 수가 최대 구간 길이를 100 m 단위로 나타냈다(10BASE5는 동축 500 m) — PDF 10쪽 「nTYPEm」, PDF 2쪽 표
- 규격별 매체(표): 100BASE-TX 평형 트위스티드 페어 2쌍 100 m, 1000BASE-T 평형 트위스티드 페어 4쌍 100 m, 1000BASE-SX 멀티 모드 광섬유 두 가닥(850 nm) 550 m,
  1000BASE-LX 싱글 모드 광섬유 두 가닥(1310 nm) 5 km, 1000BASE-CX 트윈 액시얼 구리 25 m, 1000BASE-BX10 싱글 모드 광섬유 한 가닥 10 km, 10GBASE-T 평형 트위스티드 페어 4쌍 100 m — PDF 3~5쪽 표

쓰인 곳: (phase 72) 강의 수정 이력 L26·L27, `ethernet.fast-gigabit`(100BASE-TX는 트위스티드 페어, 1000BASE-SX는 멀티 모드 광섬유), (phase 72에서 쓰일 곳) `ethernet.standard-names`

## (phase 72) Pete Anslow, 「PMD naming」 (IEEE P802.3bs Task Force, 2015-07)
https://www.ieee802.org/3/bs/public/15_07/anslow_3bs_03_0715.pdf

IEEE P802.3bs 태스크 포스 회의 발표 자료다.

- PMD 이름의 글자 하나하나에는 예전에 정해진 뜻이 있었다(IEEE Std 802.3 1.2.3). 예를 들어 10GBASE-LR의 L은 원래 「긴 파장」인데, 업계는 흔히 「긴 거리」로 읽었다 — 2쪽
- 그래서 40 Gb/s·100 Gb/s PMD 이름부터는 글자에 엄밀한 뜻을 두지 않는다 — 2쪽
- 이름 해독표: 속도(10 = 10 Mb/s, 100 = 100 Mb/s, 1000 = 1000 Mb/s, 2.5G = 2.5 Gb/s …), 변조 BASE = 베이스밴드, 첫 글자 C 트윈액스 구리·L 긴 파장 또는 10 km·S 짧은 파장 또는 100 m·
  T 트위스티드 페어, 둘째 글자 R 스크램블 부호·X 외부 부호, 끝의 수는 쌍이나 레인의 수 — 3쪽

쓰인 곳: (phase 72) 강의 수정 이력 L26, (phase 72에서 쓰일 곳) `ethernet.standard-names`

## (phase 72) David Law, 「IEEE 802.3 Ethernet」 (IEEE 802.3 Working Group Chair, Version 1.0, 2010-01)
https://www.ieee802.org/misc-docs/GlobeCom2009/IEEE_802d3_Law.pdf

당시 IEEE 802.3 작업 그룹 의장의 개요 발표 자료다.

- 802.3u-1995(100BASE-T): 100BASE-TX(Cat 5 2쌍, 100 m), 100BASE-T4(Cat 3 4쌍, 100 m), 100BASE-FX(멀티 모드 광섬유 두 가닥, 2 km) — 8쪽
- 802.3z-1998(1 Gb/s 동작): 1000BASE-SX(멀티 모드 광섬유 두 가닥, 220~550 m), 1000BASE-LX(싱글 모드 광섬유 두 가닥 5 km, **또는 멀티 모드 광섬유 두 가닥 550 m**),
  1000BASE-CX(구리 케이블 어셈블리, 25 m) — 10쪽
- 802.3ab-1999: 1000BASE-T(트위스티드 페어, 100 m) — 10쪽
- 802.3ae-2002(10 Gb/s 동작): 10GBASE-SR/SW(멀티 모드), 10GBASE-LX4(싱글 모드나 멀티 모드), 10GBASE-LR/LW(싱글 모드 10 km), 10GBASE-ER/EW(싱글 모드 40 km) — 10쪽
- 802.3an-2006: 10GBASE-T(트위스티드 페어, 100 m) — 12쪽

쓰인 곳: (phase 72) 강의 수정 이력 L26·L27, `ethernet.standard-names`(1000BASE-LX가 싱글 모드·멀티 모드 광섬유를 모두 쓴다, 10GBASE-SR은 멀티 모드), `ethernet.fast-gigabit`(100BASE-FX는 멀티 모드 광섬유, 802.3ae의 10GBASE-SR은 멀티 모드·10GBASE-LR은 싱글 모드, 802.3an의 10GBASE-T)

## (phase 72) IEEE SA — 802.3u-1995, 802.3z-1998, 802.3ab-1999, 802.3ae-2002, 802.3an-2006, 802.3cc-2017 표준 소개 페이지
https://standards.ieee.org/ieee/802.3u/1079/
https://standards.ieee.org/ieee/802.3z/1084/
https://standards.ieee.org/ieee/802.3ab/1086/
https://standards.ieee.org/ieee/802.3ae/1089/
https://standards.ieee.org/ieee/802.3an/3560/
https://standards.ieee.org/ieee/802.3cc/6753/

표준마다 제목·초록·발행일을 싣는 IEEE SA 페이지다. 여섯 모두 지금은 「Superseded」(뒤 판의 IEEE Std 802.3에 합쳐짐)로 표시돼 있다.

- 802.3u-1995(1995-10-26 발행): 제목은 「100 Mb/s 동작, 유형 100BASE-T」다. 100 Mb/s 물리 계층 규격 묶음을 통틀어 100BASE-T라 부르고, 100BASE-T4(Category 3·4·5 평형 케이블 4쌍),
  100BASE-TX(Category 5 평형 케이블 2쌍이나 150옴 차폐 평형 케이블), 100BASE-FX(멀티 모드 광섬유 두 가닥)를 담는다 — 제목, 초록
- 802.3z-1998(1998-10-01 발행): 802.3·이더넷 형식 프레임을 1,000 Mb/s로 보내기 위한 MAC 매개변수·물리 계층·리피터·관리 매개변수 — 제목, 초록
- 802.3ab-1999(1999-07-26 발행): Category 5 평형 구리 케이블 4쌍 위의 1000 Mb/s 동작, 유형 1000BASE-T — 제목, 초록
- 802.3ae-2002(2002-08-26 발행): 10 Gb/s 동작을 위한 MAC 매개변수·물리 계층·관리 매개변수 — 제목, 초록
- 802.3an-2006(2006-09-01 발행): 10 Gb/s 동작, 유형 10GBASE-T. 평형 트위스티드 페어 구조화 배선으로 최대 100 m를 잇는다 — 제목, 초록
- 802.3cc-2017(2018-01-15 발행): 싱글 모드 광섬유 위의 25 Gb/s 동작 — 적어도 10 km(25GBASE-LR)와 40 km(25GBASE-ER) — 제목, 초록

쓰인 곳: (phase 72) 강의 수정 이력 L27, `ethernet.fast-gigabit`(802.3u의 발행 연도·공식 이름 100BASE-T와 그 묶음에 든 100BASE-TX·100BASE-FX, 802.3z·802.3ab·802.3ae·802.3an의 발행 연도), (phase 72에서 쓰일 곳) `ethernet.ethernet`, `ethernet.standard-names`

## (phase 72) IEEE 802.3 태스크 포스 목표 — 802.3ae, 802.3an, 802.3cc
https://www.ieee802.org/3/ae/objectives.pdf
https://www.ieee802.org/3/an/objectives.pdf
https://www.ieee802.org/3/cc/P802_3cc_Objectives.pdf

태스크 포스가 표준을 만들 때 정한 목표 목록이다(표준 본문이 아니다).

- 802.3ae(10 Gigabit Ethernet, 2001-07 정리판): 802.3/이더넷 프레임 형식과 최소·최대 프레임 크기를 유지하고, **전이중 동작만** 지원한다. 멀티 모드 광섬유(65 m·300 m)와
  싱글 모드 광섬유(2 km·10 km·40 km) 거리를 목표로 한다 — 1~2쪽
- 802.3an(10GBASE-T, 2003-09): 전이중 동작만 지원하고, 4쌍 트위스티드 페어 구리 배선으로 최대 100 m를 목표로 한다 — 2~3쪽
- 802.3cc(25 Gb/s 싱글 모드 광, 2016-01 승인): 전이중 동작만 지원하고, 싱글 모드 광섬유로 적어도 10 km와 40 km를 목표로 한다 — 2쪽

쓰인 곳: (phase 72) 강의 수정 이력 L27, (phase 72에서 쓰일 곳) `ethernet.fast-gigabit`, (phase 72 step 6) `hub-switch-vlan.duplex`(1초에 10기가비트 이상은 전이중만)

## (phase 72) IEEE 802.3 Working Group — 1997-07 플레너리 회의록
https://www.ieee802.org/3/minutes/july97/minutes.html

- 새 프로젝트의 「5 Criteria」 문안이 처음에는 진행 중인 프로젝트를 「802.3u Fast Ethernet」, 「802.3z Gigabit Ethernet」으로 적었다. 작업 그룹은 수정안으로
  「Fast Ethernet」을 「100BASE-T」로 바꿔 승인했고, 「Gigabit Ethernet」은 그대로 두었다 — 「Criteria #1」 동의안
- 그러니 「Fast Ethernet」은 작업 그룹 안에서도 쓰던 이름이지만, 802.3u의 공식 이름은 표준 제목의 「100BASE-T」다(위 IEEE SA 항목). 802.3ah-2004 머리말도 「Fast Ethernet이라고도 부른다」로 쓴다(위 항목)

쓰인 곳: `ethernet.fast-gigabit`(802.3u의 공식 이름은 100BASE-T이고 Fast Ethernet은 함께 쓰는 이름)

## (phase 72) RFC 894 — A Standard for the Transmission of IP Datagrams over Ethernet Networks
https://www.rfc-editor.org/rfc/rfc894

인터넷 표준(STD 41)이다(rfc-editor 상태).

- IP 데이터그램은 표준 이더넷 프레임에 담아 보내고, 그 프레임의 타입 필드는 16진 0800이다 — 「Frame Format」
- 이더넷으로 보내는 데이터 필드의 최소 길이는 46옥텟이고, 모자라면 0인 옥텟으로 채운다. 채운 옥텟은 IP 패킷의 일부가 아니다 — 「Frame Format」
- IP 브로드캐스트 주소는 모든 비트가 1인 이더넷 브로드캐스트 주소 FF-FF-FF-FF-FF-FF(16진)에 대응한다 — 「Broadcast Address」
- 주의: 같은 절의 1500옥텟 문장은 「minimum」이라고 적혀 있어 바로 뒤의 「최대 IP 데이터그램 1500옥텟」과 어긋난다. 최대 크기의 근거로는 이 문장이 아니라 IEEE 802.3 그림 3–1(위 항목)을 쓴다 — 「Frame Format」

쓰인 곳: `ethernet.mac-address`(브로드캐스트 주소), `ethernet.ethertype-length`(IPv4 데이터를 실은 프레임의 타입 0800, 채운 옥텟은 IP 패킷이 아니다), (phase 72 step 9) `hub-switch-vlan.flooding-forwarding-filtering`(브로드캐스트 주소 FF-FF-FF-FF-FF-FF),
(phase 73에서 쓰일 곳) `ip-protocol.mtu`(이더넷이 나르는 IP 데이터그램의 최대 크기 1500옥텟 — 이 문서의 1500 문장은 위 「주의」대로 오기가 있어, 1500은 IEEE 802.3 그림 3–1과 아래 RFC 1191 표 7-1로 댄다), `ip-protocol.ipv4-header`(IP 패킷 전체가 이더넷 프레임의 데이터 칸에 담긴다, 「Frame Format」)

## (phase 72) Linux man-pages — ether_aton(3), arp(8)
https://man7.org/linux/man-pages/man3/ether_aton.3.html
https://man7.org/linux/man-pages/man8/arp.8.html

2026-10-28에 읽은 판: ether_aton(3)은 Linux man-pages 6.19(2026-02-08), arp(8)은 net-tools(2025-09-10).

- 48비트 이더넷 주소를 글자로 적는 표준 꼴은 16진수를 콜론으로 이은 꼴이다. ether_aton()은 그 꼴의 글자를 이진값으로 바꾸고, ether_ntoa()는 거꾸로 바꾸면서 앞자리 0을 뺀다 — ether_aton(3) DESCRIPTION
- arp 명령에 이더넷 주소를 줄 때는 6바이트를 16진수로 적고 콜론으로 가른다 — arp(8) 「arp -s」
- (phase 73 step 1) 2026-10-29에 읽은 판: arp(7)은 Linux man-pages 6.19(2026-02-08), arp(8)은 net-tools(2025-09-10), ping(8)은 iputils 20250605(저장소 최신 커밋 2026-07-16), traceroute(8)은 traceroute 2.1.6(sourceforge 타르볼).
  arp(7) — https://man7.org/linux/man-pages/man7/arp.7.html , ping(8) — https://man7.org/linux/man-pages/man8/ping.8.html , traceroute(8) — https://man7.org/linux/man-pages/man8/traceroute.8.html
- (phase 73 step 1) arp(7): Linux 커널의 ARP 모듈은 RFC 826을 구현하고, 직접 이어진 네트워크에서 IPv4 주소와 2계층 하드웨어 주소를 서로 바꾼다. 하드웨어 주소와 프로토콜 주소의 짝을 캐시로 두되 크기에 한도가 있어 오래되고 덜 쓰인 항목부터 정리하고,
  영구(permanent) 항목은 지우지 않는다 — DESCRIPTION
- (phase 73 step 1) arp(7)의 시간 값(기본값, Linux만의 것): 짝을 찾은 항목은 `base_reachable_time`(기본 30초)의 1/2~3/2 사이 무작위 시간 동안 유효하고, 위 계층에서 잘 통한다는 확인이 오면 늘어난다. 확인이 없어 낡았다고 본 항목은 데이터를 보내기 전에 다시 확인한다
  (먼저 유니캐스트로, 안 되면 브로드캐스트로 ARP 요청). `gc_stale_time`(기본 60초)은 낡은 항목을 얼마나 자주 살필지 정한다 — DESCRIPTION, 「/proc interfaces」
- (phase 73 step 1) arp(8): 커널의 IPv4 이웃 캐시를 보여 주고, 항목을 더하거나 지운다. 모드 없이 `arp`만 치면 표를 보여 준다. `-a`는 표를 BSD 꼴로 보여 주는 옵션이다(Windows의 `-a`와 쓰임이 조금 다르다 — 둘 다 표를 보여 준다).
  `arp -d 주소`는 그 항목을 지운다. `arp -s 주소 하드웨어주소`는 새 항목을 더하고, `temp`를 붙이지 않으면 영구 항목으로 둔다 — DESCRIPTION 「MODES」, OPTIONS
- (phase 73 step 1) ping(8): ICMP의 필수 메시지인 ECHO_REQUEST를 보내 호스트나 게이트웨이에서 ECHO_RESPONSE를 받아 낸다. `-c count`는 에코 요청을 그 수만큼 보낸 뒤 멈춘다 — DESCRIPTION, OPTIONS.
  다 보내거나 멈추게 하면 요약을 보여 준다 — 왕복 시간과 패킷 손실 통계(왕복 시간의 최소·평균·최대·mdev). 중복해 받은 패킷은 손실 계산에 넣지 않는다 — DESCRIPTION 뒤 설명
- (phase 73 step 1) ping(8)의 TTL: IP 패킷의 TTL 값은 그 패킷이 버려지기 전에 지날 수 있는 라우터 수의 최대치를 나타내고, 지금 인터넷의 라우터는 TTL을 정확히 1씩 줄인다고 봐도 된다.
  ping은 보통 **자기가 받은 패킷(응답)의 TTL 값**을 출력한다. 응답을 보내는 쪽이 응답의 TTL을 처음에 얼마로 정하는지는 시스템마다 다르다(예: 255, 그 밖의 값) — 「TTL DETAILS」
- (phase 73 step 1) traceroute(8): IP의 TTL 칸을 이용해 경로의 게이트웨이마다 ICMP 시간 초과(TIME_EXCEEDED) 응답을 받아 낸다. TTL 1부터 하나씩 늘려 탐사 패킷을 보내고, ICMP 포트 도달 불가(또는 TCP 리셋)를 받으면 목적지에 닿았다고 본다. 최대 홉 수는 기본 30이고,
  TTL마다 기본 세 번 보내 게이트웨이 주소와 왕복 시간을 한 줄에 적는다. 시간 안에 답이 없으면 `*`를 찍는다 — DESCRIPTION
- (phase 73 step 1) traceroute(8)의 기본 방법은 UDP 탐사 패킷이다 — 목적지가 쓰지 않을 법한 포트(첫 탐사는 33434, 탐사마다 1씩 늘림)로 보내므로 목적지는 보통 ICMP 포트 도달 불가로 답한다. `-I`는 ICMP 에코를 탐사 패킷으로 쓴다(지금 가장 흔하다고 쓴다) — 「LIST OF AVAILABLE METHODS」, OPTIONS.
  Windows tracert는 ICMP 에코 요청을 쓴다(위 「(phase 71) Microsoft Learn」 항목) — 명령마다 보내는 패킷이 다르다
- (phase 78 step 11) 2026-11-11에 IPv4로 다시 내려받아 읽은 판: ping(8)은 iputils 20250605(upstream Git에서 2026-08-04에 가져옴, 그때 최신 커밋 2026-07-16), traceroute(8)은 traceroute 2.1.6 타르볼(바닥줄 2006-10-11) — 위 줄과 같은 판이다
- (phase 78 step 11) ping(8)이 **멈추는 경우**: 이 페이지가 드는 것은 셋이다 — `-c count`로 정한 수만큼 보냈을 때, `-w deadline`으로 정한 초가 지났을 때, 프로그램이 **SIGINT**로 끝날 때(이때도 요약을 보인다).
  **SIGQUIT**을 보내면 끝내지 않고 짧은 중간 통계만 보인다 — OPTIONS(`-c`·`-w`), OPTIONS 뒤 설명. 「아무것도 정하지 않으면 끝없이 보낸다」를 한 문장으로 적지는 않는다 — 그 셋 밖에 멈추는 조건을 들지 않을 뿐이다.
  그래서 본문은 「`-c`나 `-w`를 주지 않으면, 사용자가 끊을 때까지 보낸다」를 이 세 조건에서 나오는 말로 쓴다. 터미널에서 Ctrl-C가 SIGINT를 보낸다는 것은 아래 「(phase 78 step 11) Linux man-pages — ip-address(8), termios(3)」 항목에 있다
- (phase 78 step 11) ping(8)의 `-s packetsize`는 보낼 데이터 바이트 수이고 기본 56이다(ICMP 헤더 8바이트와 합쳐 ICMP 데이터 64바이트) — OPTIONS. Windows ping의 `/l`(기본 32)과 기본값이 다르다
- (phase 78 step 11) ping(8)의 `-a`는 소리를 내는 ping(audible ping)이고, `-t ttl`은 IP의 TTL을 정한다 — OPTIONS. **Windows ping의 `/a`(이름 거꾸로 찾기)·`/t`(끊을 때까지 보내기)와 글자가 같아도 뜻이 다르다**

쓰인 곳: `ethernet.mac-address`(콜론 꼴 표기),
(phase 73 step 1에서 쓰일 곳) `arp.arp-cache`(arp(7) 캐시와 시간, arp(8) `-s`·`-d`), `icmp.time-exceeded`(traceroute — UDP 기본·`-I`), `icmp.ping`(ping `-c`, 요약, 응답의 TTL), `exam-notes.md` 앞 문단([기출 2025-05-25 #10]의 캐시 시간, [기출 2025-08-24 #8]의 `-d`)
(phase 73 step 13) `icmp.time-exceeded`: traceroute의 기본 UDP·끝 포트 도달 불가, -I 에코, 최대 30홉·TTL마다 세 번·응답이 없으면 *. `icmp.echo`의 ping은 에코를 이용하는 명령이라는 한 줄에만 쓴다.
(phase 73 step 14) `icmp.ping`(ping(8) — `-c`로 보낼 요청 수를 정한다, 다 보내면 손실 통계와 왕복 시간의 최소·평균·최대를 요약한다, 출력의 TTL은 받은 응답 패킷의 TTL 값이고 지금 라우터는 TTL을 1씩 줄인다, 응답의 처음 TTL은 시스템마다 다르다), 문항 n077 해설, 도식 `ping-result`. 결과 요약은 Linux ping(8)만 근거로 썼다 — Windows ping 문서는 요약을 적지 않는다(위 「(phase 71) Microsoft Learn」 항목). 왕복 시간(RTT, round-trip time)을 「요청을 보낸 때부터 그 응답을 받은 때까지」로 푼 것은 이름의 뜻이다
(phase 78 step 11에서 쓰일 곳) `diagnostic-commands.ping-options`(Linux ping은 `-c`·`-w`가 없으면 끊을 때까지 보낸다 — Windows와 기본이 반대, Ctrl-C(SIGINT)로 끝내면 요약, 같은 글자 `-a`·`-t`의 다른 뜻), `diagnostic-commands.tracert`(Linux는 `traceroute` — 위 traceroute(8) 줄)

## (phase 72 step 2) IEEE 802 LAN/MAN Standards Committee — 홈페이지
https://www.ieee802.org/

IEEE 802 위원회의 홈페이지다. 작업 그룹 목록이 이 페이지에 있다. IEEE라는 약어의 풀네임은 이 페이지와 standards.ieee.org 「About」 페이지(https://standards.ieee.org/about/) 어디에도 적혀 있지 않아 쓰지 않는다(2026-10-28 확인).

- IEEE 802는 LAN/MAN Standards Committee(LMSC), 곧 LAN·MAN 표준을 만드는 위원회다 — 홈페이지 첫머리
- 802.3은 그 위원회의 Ethernet Working Group(이더넷 작업 그룹)이다 — 홈페이지의 작업 그룹 목록

쓰인 곳: `ethernet.ethernet`(IEEE 802 표준 위원회 안의 이더넷 작업 그룹이 IEEE 802.3을 만든다)

## (phase 72 step 1) IEEE 802.3 — Ethernet, 4.1.1 Overview, 4.1.2.2 Access interference and recovery, 4.2.3.2 Transmit media access management, 4.4 Specific implementations
https://www.ieee802.org/3/as/public/0503/4d0_1_CMP.pdf

위 「4.1.2 Normal operation …」 항목과 같은 IEEE P802.3as Draft 0.1(2005-03)의 4장이다. IEEE Std 802.3-2005 4장 본문을 싣고 있어 그 본문을 근거로 쓴다.

- MAC 부계층은 두 방식 가운데 하나로 동작한다. **반이중**에서는 여러 스테이션이 물리 매체 하나를 두고 다투며 CSMA/CD 절차를 따르고, 양쪽 통신은 프레임을 번갈아 빠르게 주고받아 이룬다.
  보내기와 받기를 동시에 하면 서로 방해되는 매체(예: 10BASE2, 100BASE-T4)에서는 반이중만 쓸 수 있다 — §4.1.1 a)
- **전이중**은 세 조건이 모두 맞을 때 쓴다 — 매체가 보내기와 받기를 동시에 해도 방해가 없고(예: 10BASE-T, 100BASE-TX), 그 LAN에 스테이션이 꼭 둘이며, 둘 다 전이중으로 설정돼 있다.
  둘뿐이라 매체를 두고 다툴 일이 없으므로 CSMA/CD 절차가 필요 없다 — §4.1.1 b)
- 전이중으로 가장 흔히 쓰는 구성은 가운데에 **브리지(스위치라고도 부른다)** 하나를 두고, 브리지 포트마다 장치 하나를 저만의 LAN으로 잇는 것이다 — §4.1.1
- CSMA/CD는 한 스테이션이 보낸 신호를 매체의 모두가 받는 LAN(로컬 영역 브로드캐스트 매체)을 위한 매체 접근 방식이다 — §4.1.1
- 충돌: 반이중에서 둘 이상의 스테이션이 같은 때 보내면, 미루기 규칙을 지켜도 서로의 전송을 방해할 수 있다. 전송이 겹친 이 다툼을 충돌이라 부른다.
  충돌은 반이중에서만, 공유 매체를 둘 이상이 쓰려 할 때 생긴다. 전이중에서는 두 스테이션이 서로에게 동시에 보내도 방해가 없고, 물리 계층이 충돌을 알려도 전이중 MAC은 무시한다 — §4.1.2.2
- 충돌이 나면 보내던 스테이션은 잼(jam)이라는 비트열을 보내 충돌이 다른 송신 스테이션에도 알려질 만큼 이어지게 한 뒤 전송을 멈추고, 무작위로 고른 시간 뒤 다시 보낸다.
  충돌이 거듭되면 그 무작위 시간을 고르는 범위를 시도마다 넓혀(백오프) 붐비는 매체에 맞춘다. 끝내 성공하거나, 매체가 고장 났거나 너무 붐빈다고 보고 포기한다 — §4.1.2.2
- 받는 쪽은 충돌로 생긴 조각 프레임을 올바른 프레임과 가려낸다 — §4.1.2.2
- (phase 72 step 7) 같은 절을 다시 열어 확인한 것: 잼은 충돌이 이어지는 시간을 다른 송신 스테이션이 알아챌 만큼 길게 만든다. 잼을 보낸 뒤 전송을 끝내고 무작위로 고른 시간 뒤의 재전송을 잡는다.
  충돌이 거듭된다는 것은 매체가 붐빈다는 뜻이어서, 자기 재전송을 일부러 늦춰(백오프) 매체에 주는 부담을 줄인다 — 그 방법이 시도마다 무작위 시간을 고르는 범위를 넓히는 것이다 — §4.1.2.2
- 반이중의 미루기 규칙: 보낼 것이 없을 때도 MAC은 물리 계층이 주는 carrierSense 신호로 매체에 다른 전송이 있는지 **지켜본다**. 매체가 쓰이고 있으면 자기 전송을 미루고,
  지나가는 프레임이 끝난 뒤에도 프레임 사이 간격(interFrameSpacing)만큼 더 기다렸다가 보낸다. 전이중에서는 carrierSense를 보고 미루지 않는다.
  매체를 살피려고 스테이션이 따로 신호를 보내는 절차는 이 규칙에 없다 — §4.2.3.2.1 a)·b)
- 충돌 감지와 잼: collisionDetect 신호로 충돌을 알아채면 전송을 곧바로 끊지 않고 jamSize만큼 더 보낸다. 잼의 내용은 정해져 있지 않다(다만 그때까지 보낸 조각의 CRC 값이 되도록 일부러 만들지는 않는다) — §4.2.3.2.4
- 재전송: 충돌로 끝난 전송은 성공하거나 attemptLimit번을 모두 충돌로 마칠 때까지 다시 한다. 다시 보내기 전 기다리는 시간은 slotTime의 정수배이고,
  n번째 재전송 전에는 0 ≤ r < 2^k(k = min(n, 10)) 범위에서 고르게 뽑은 무작위 정수 r만큼 기다린다. 이 방법의 이름이 절단 이진 지수 백오프(truncated binary exponential backoff)다.
  attemptLimit번 모두 실패하면 오류로 알린다 — §4.2.3.2.5
- 전이중 스테이션은 받는 트래픽 때문에 미루지도, 전송을 끊거나 잼을 보내거나 백오프하지도 않는다. 프레임이 있으면 프레임 사이 간격만 지키고 보낸다 — §4.2.3.2.6
- 값(표 4–2): 10 Mb/s·100 Mb/s와 1 Gb/s에서 attemptLimit 16, backoffLimit 10, jamSize 32비트다. 10 Gb/s에는 slotTime·attemptLimit·backoffLimit·jamSize가 해당하지 않는다(반이중이 없다) — §4.4.2
- 한 네트워크의 스테이션은 모두 같은 방식(반이중이나 전이중)으로 설정해야 한다. **리피터나 공유 구간(mixing segment)에 이은 DTE는 모두 반이중으로 설정해야 한다.**
  두 DTE를 링크 구간으로 바로 이으면 두 장치가 같은 방식을 써야 한다 — §4.4.1

쓰인 곳: (phase 72 step 1) 강의 수정 이력 L30·L31, `exam-notes.md` E5·E6, (phase 72 step 6) `hub-switch-vlan.hub`(허브에 이은 장치는 반이중, 같은 때 보내면 충돌 — 한 줄), `hub-switch-vlan.duplex`(반이중·전이중의 뜻과 전이중의 세 조건, 전이중에서는 충돌이 없음, 반이중에서 차례를 정하는 절차 없이 매체를 듣고 미룸, 스위치 포트마다 장치 하나를 잇는 흔한 전이중 구성, 10 Gb/s에는 반이중이 없음), 문항 n035·n036 해설, (phase 72 step 7) `hub-switch-vlan.collision-domain`(충돌은 반이중으로 공유 매체를 둘 이상이 쓸 때 전송이 겹치는 것, 받는 쪽은 조각을 가려내고 보낸 쪽이 다시 보냄, 한 충돌 도메인 안에서는 매체가 쓰이면 미룸, 포트에 장치 하나를 잇고 전이중이면 충돌 없음, 허브에 이은 스위치 포트는 반이중), `hub-switch-vlan.csma-cd`(캐리어 감지와 프레임 사이 간격, 다중 접근 — 한 장치의 신호가 매체의 모두에게 닿음, 충돌 감지와 잼·무작위 기다림, 거듭되는 충돌과 범위 넓히기, 16번 시도 뒤 포기, 전이중에서는 쓰지 않음), 문항 n037·n038·n039 해설, (phase 72 step 8) `hub-switch-vlan.switch`(표준은 이 장비를 브리지라 부르고 스위치라고도 부른다 — §4.1.1, 포트마다 장치 하나를 잇는 전이중 구성)

## (phase 72 step 1) IEEE 802.3 — Ethernet, 3.5 Elements of the Tagged MAC Frame
https://www.ieee802.org/3/as/public/0503/3d0_1_CMP.pdf

위 「3.2.9 … 3.4」 항목과 같은 IEEE P802.3as Draft 0.1(2005-03)의 3장이다. 이 초안이 싣고 있는 802.3-2005의 3.5 본문을 근거로 쓴다.

- 태그 붙은 MAC 프레임은 보통 프레임에 **4옥텟짜리 QTag 앞붙이**를 **출발지 주소 바로 뒤**, 원래의 길이/타입 필드 앞에 끼운 것이다. 그래서 프레임이 4옥텟 길어진다 — §3.5 a)·c), 그림 3–5
- QTag 앞붙이는 두 필드다 — 타입으로 읽히는 2옥텟 상수(802.1Q 태그 프로토콜 타입)와, 2옥텟짜리 태그 제어 정보(TCI) — §3.5 a)
- 태그 붙은 프레임의 그 자리 길이/타입 필드는 언제나 타입으로 읽고, 값은 **0x8100**(0x81-00)이다 — §3.5.4
- 태그 제어 정보는 3비트 사용자 우선순위, CFI 1비트, **12비트 VLAN 식별자(VID)**로 나뉜다. 그 뜻은 IEEE 802.1Q가 정한다(이 절은 참고용이다) — §3.5.5, 그림 3–5
- 원래의 길이/타입 필드는 QTag 앞붙이 뒤로 정확히 4옥텟 밀려난다. 프리앰블·SFD·주소·FCS는 보통 프레임과 같다 — §3.5.1~§3.5.3, §3.5.6, §3.5.8

쓰인 곳: (phase 72 step 11) `hub-switch-vlan.vlan-tagging`(태그는 4바이트이고 출발지 MAC 주소 바로 뒤·이더타입/길이 바로 앞에 끼며 프레임이 4바이트 길어진다, 앞 2바이트는 태그가 있음을 알리는 정해진 값, 뒤 2바이트 가운데 12비트가 VLAN ID이고 남은 비트에 우선순위 같은 정보가 든다, 끼우는 방식은 IEEE 802.1Q가 정한다), 문항 n048 해설

## (phase 72 step 1) IEEE 802.3 개정 프로젝트의 의견 처리 기록 — 리피터 조항을 「새 설치에 권하지 않음」으로 정한 결정 (P802.3ay D1.0, P802.3bh D2.0·D3.0)
https://ieee802.org/3/axay/comments/D1.0/802.3ay_D1p0.pdf
https://ieee802.org/3/bh/comments/P802d3_802d3_bh_D2p0_All_Comment.pdf
https://www.ieee802.org/3/bh/comments/P802d3_802d3_bh_D3p0_All_Clause.pdf

세 문서 모두 IEEE 802.3 **개정 프로젝트의 투표 의견과 그 처리(응답) 기록**이다. 표준 본문이 아니다. P802.3ay는 IEEE Std 802.3-2008을, P802.3bh는 IEEE Std 802.3-2012를 만든 개정 프로젝트다
(다음 개정인 802.3bx의 의견 기록 제목이 「Revision to IEEE Std 802.3-2012」다 — https://www.ieee802.org/3/bx/comments/P8023-D2p0-Comments_Final_byCls.pdf).
의견 하나는 제안일 뿐이므로, 여기에는 **응답이 받아들임(ACCEPT, ACCEPT IN PRINCIPLE)으로 끝난 것**과 그 응답이 정한 문구만 적는다. 발행된 802.3 본문의 문구는 무료로 열리지 않아 직접 보지 못했다.

- P802.3ay D1.0(Maintenance #9 Revision, 의견 기록 2007-06-30) #104(41장, 1000 Mb/s 리피터): 의견은 1000 Mb/s 리피터가 상업적으로 거의 만들어지지 않았고 오래전부터 구할 수 없다며 이 조항에
  「새 설치에 권하지 않음」 주석을 달자고 했다. 응답은 ACCEPT IN PRINCIPLE이고, 정한 주석은 「이 리피터는 새 설치에 권하지 않는다. 2007년 5월부터 이 조항의 유지 보수 변경은 더 검토하지 않는다」라는 뜻이다.
  같은 기록 #121(41장의 표기 고치기)은 「이 조항은 폐기(deprecate)되는 중」이라는 이유로 거절됐다 — 의견 #104, #121(PDF 22쪽)
- P802.3bh D2.0(첫 작업 그룹 투표, 의견 기록 2011-09-22) #168: 의견은 쓰이지 않게 된 PHY에 「새 설치에 권하지 않음」 주석을 달자고 했다. 응답은 ACCEPT IN PRINCIPLE이고,
  대상으로 **10장(10BASE2), 17장, 9장(10 Mb/s 리피터), 27장(100 Mb/s 리피터), 41장(1000 Mb/s 리피터)**을 적었다 — 의견 #168(PDF 35쪽)
- P802.3bh D3.0(첫 스폰서 투표, 의견 기록 2012-04-16) #i-49: 13장(리피터를 쓸 때의 망 구성)은 이제 리피터를 쓸 때만 해당하는데 9장을 폐기했으니 13장도 같은 주석을 달자는 의견이다.
  응답은 ACCEPT IN PRINCIPLE이고, 정한 주석은 「이 조항은 새 설치에 권하지 않는 조항들과 관련되며, 이 조항도 새 설치에 권하지 않는다. 2012년 3월부터 유지 보수 변경은 더 검토하지 않는다」라는 뜻이다 — 의견 #i-49(PDF 12쪽)
- 같은 기록 #i-50: 의견은 「이제 공유 매체와 리피터가 모두 폐기됐다(새 설치에 권하지 않음). 남은 것은 전이중을 쓸 수 있는 점대점·점대다점 PHY뿐」이라 쓰고, 4장(반이중을 담은 CSMA/CD MAC)에도
  새 설치에 권하지 않는다는 주석을 달자고 했다. 응답은 **REJECT**다 — 영향이 넓어 다음 개정에서 따로 다루겠다고 했다. 그러니 **반이중·CSMA/CD 자체를 표준이 새 설치에 권하지 않는다고 정한 것은 아니다** — 의견 #i-50(PDF 12쪽)
- 주의: 리피터가 표준에서 사라진 것은 아니다. 2022년 P802.3da 태스크 포스는 10BASE-T1S 같은 새 PHY의 공유 구간에 쓸 리피터를 따로 정할지 논의했다 —
  https://www.ieee802.org/3/da/public/040622/zimmerman_3da_01_03312022.pdf 22쪽(802.3cg-2019가 9장 리피터를 10BASE-T1L·10BASE-T1S에 적용하지 않기로 했다는 것)
- (참고) 같은 P802.3bh D3.0 기록 #i-89(ACCEPT): IEEE Std 802.5는 토큰 링 표준이고 철회됐다. 마지막 개정은 802.5v-2001 「Gigabit Token Ring Operation」이다 — 의견 #i-89

- (phase 82 step 8, 2026-11-19 위 「주의」 줄의 발표 자료를 IPv4로 다시 받아 읽음 — G. Zimmerman, 「Repeaters in 802.3da」, IEEE P802.3da Task Force, 2022-03-31, 36쪽. **표준 본문이 아니라 태스크 포스 발표 자료**이고,
  아래 줄들의 슬라이드는 802.3 개정 초안 IEEE P802.3dc D3.2(IEEE Std 802.3-2018을 고친 개정 프로젝트로, 2022-05-13 IEEE Std 802.3-2022의 승인으로 끝났다 — https://www.ieee802.org/3/dc/)의 9.1·그림 13-1·그림 27-1을 출처로 든다) **리피터가 하는 일**:
  - 리피터는 **물리 계층**이다. 100 Mb/s 리피터(그림 27-1)는 MAC보다 아래, PCS 바로 위에서 두 구간을 잇고, 그래서 두 구간이 서로 다른 PCS·PMA·PMD를 써도 된다. **리피터의 근본 목적은 매체 위의 신호를 다시 만드는 것이지 MAC의 일을 하는 것이 아니다** — 5쪽
  - 리피터는 **신호의 파형과 타이밍을 되살리고**(restore), 충돌을 감지해 넘기며, 리피터의 지연이 네트워크의 크기를 제한한다 — 23쪽(출처 9.1·그림 13-1)
  - 리피터는 구간(리피터 포트) 사이에서 신호를 처리해 넘기는데, 충돌 처리를 지키고(잼을 감지하고 만든다) **올바른 신호를 다른 구간에 다시 만들어 내보낸다**(regenerate) — 24쪽
  - **「증폭」이라는 말은 이 자료에 없다** — 자료가 말하는 것은 파형과 타이밍을 되살려 다시 만든다는 것이다. 본문은 리피터를 「신호를 키우기만 한다」로 쓰지 않는다
  - 쓰지 않는 것: 10 Mb/s(9장)와 100 Mb/s(27장) 리피터 구조의 차이(AUI·PCS에 붙는 자리), 리피터 지연의 수치, 10BASE-T1S용 리피터 논의
  쓰인 곳: (phase 82 step 9에서 쓰일 곳) `network-devices.repeater`(물리 계층, 파형과 타이밍을 되살려 다시 내보낸다, MAC의 일을 하지 않는다, 충돌을 다른 구간으로 넘긴다 — 충돌 도메인을 나누지 않는다는 것과 이어진다, 위 줄의 「새 설치에 권하지 않음」),
  `network-devices.device-layers`(리피터·허브는 물리 계층), 기출 대조(`exam-notes.md` 「phase 82 step 8」 문단 — [기출 2025-08-24 #47])
- (phase 82 step 9, 2026-11-19 같은 발표 자료를 IPv4로 다시 받아 읽음 — 표준 본문이 아니라 태스크 포스 발표 자료) **케이블을 지나는 신호와 리피터의 한계**:
  - 12쪽은 반사된 신호가 사이의 케이블 구간을 지나는 동안 약해진다(attenuated by intervening spans)고 적고, 13쪽은 PHY가 견뎌야 할 반사의 크기를 「케이블 감쇠(cable attenuation)」를 더해 셈한다 — 신호가 케이블을 지나며 약해진다는 근거다(감쇠의 수치는 쓰지 않는다)
  - 23쪽 「리피터는 신호의 파형과 타이밍을 되살린다」 — 되살린다는 말이 곧 지나온 신호의 파형과 타이밍이 흐트러질 수 있다는 뜻이라, 본문은 「흐트러질 수 있다」로만 쓴다. 같은 쪽 「리피터의 지연이 네트워크의 크기를 제한한다」(지연의 수치는 쓰지 않는다)
  - 24쪽 「구간(리피터 포트) 사이에서 신호를 처리해 넘긴다」 — 위 RFC 1983 「repeater」(한 케이블의 전기 신호를 다른 케이블로 이어 퍼뜨린다)와 함께, 리피터를 두면 한 구간을 넘어 다음 구간의 장치까지 신호가 닿는다는 근거다. **「전송 거리를 늘린다」는 문장 자체는 두 문서에 없다** — 본문은 「케이블 한 구간으로는 닿지 않는 곳의 장치까지 신호가 닿는다」로 쓴다
  - 「증폭」은 여전히 쓰지 않는다(위 step 8 줄) — 본문은 신호를 키우는 것과 다시 만드는 것을 견주는 문장을 쓰지 않았다(견줄 근거가 없다)
  쓰인 곳: (phase 82 step 9) `network-devices.repeater`(요약, 문단 0의 약해지고 흐트러진 신호, 문단 2의 닿는 거리와 지연의 한계, 예), 도식 `repeater-regenerate`(「약해진 신호」·「다시 만든 신호」 노드와 캡션)
쓰인 곳: (phase 72 step 6) `hub-switch-vlan.hub`(10·100 Mb/s와 1 Gb/s 리피터가 있다, 작업 그룹이 리피터 규격을 새 설치에 권하지 않고 더는 고치지 않기로 정함 — 1 Gb/s는 2007년, 10·100 Mb/s는 2011~2012년의 개정 작업, 규격을 지운 것은 아님), (phase 72 step 7) `hub-switch-vlan.csma-cd`(IEEE 802.5가 토큰 링 표준이라는 이름만), 문항 n038 해설

## (phase 72 step 1) IEEE 802.3 Working Group — ITU-T Q12/15에 보낸 회신 「Response to Progress on Ethernet related recommendations」(2003-07)
https://www.ieee802.org/1/files/public/docs2003/ITU%20Q12%20liaison%20from%20dot3.pdf

IEEE 802.3 작업 그룹이 2003년 7월 회의에서 승인해 ITU-T 15연구반 Q12에 보낸 공식 회신(communication statement)이다.

- IEEE 802 구조에서 이더넷 링크로 잇는 장치는 두 가지다 — DTE와 리피터. DTE는 호스트, 802.1D 브리지, 라우터 같은 장치다 — 「Response」 둘째 문단
- **리피터는 802.3이 정한 장치로, 반이중으로만 동작하고 CSMA/CD 장치 여럿이 한 매체에 접근하게(다중 포트 접근) 한다** — 「Response」 둘째 문단
- 2계층 네트워크 장치는 IEEE 802.1D 브리지로 모델링하라고 권한다 — 「Response」 권고 2)

쓰인 곳: (phase 72 step 1) 강의 수정 이력 L30, `exam-notes.md` E7, (phase 72 step 6) `hub-switch-vlan.hub`(리피터는 반이중으로만 동작하고 여러 장치가 한 매체를 함께 쓰게 한다), (phase 72 step 7) `hub-switch-vlan.collision-domain`(허브에 이은 장치 전체가 한 매체를 함께 쓴다, 브리지도 DTE라 허브에 이은 스위치 포트는 반이중), (phase 72 step 8) `hub-switch-vlan.switch`(2계층 네트워크 장치는 802.1D 브리지 — 데이터 링크 계층 장비)

## (phase 72 step 1) RFC 2108 — Definitions of Managed Objects for IEEE 802.3 Repeater Devices using SMIv2
https://www.rfc-editor.org/rfc/rfc2108

Proposed Standard(Standards Track)이다. IETF HUB MIB 작업 그룹이 만든 리피터 관리 MIB다.

- 이 MIB가 다루는 리피터는 IEEE 802.3의 9장(10 Mb/s 베이스밴드 리피터)과 27장(100 Mb/s 베이스밴드 리피터)이 정한 장치다 — §2.2
- 리피터는 비트 단위로 받아 다시 내보내는 장치이고, 들어오는 데이터를 패킷의 정보에 따라 처리하지 않는다 — §2.4.1.2
- 받은 신호를 다른 모든 포트로 내보낸다는 문장과 「충돌 도메인」의 정의는 이 RFC에 없다(전문 검색)

- (phase 82 step 8, 2026-11-19 상태를 다시 확인 — Proposed Standard, 1997-02, 폐기·개정 없음) 위 §2.4.1.2 줄(리피터는 비트 단위로 받아 다시 내보내고, 들어오는 데이터를 패킷의 정보에 따라 처리하지 않는다)을 이 주제가 다시 쓴다 — 새로 가져온 사실은 없다
  쓰인 곳: (phase 82 step 9에서 쓰일 곳) `network-devices.repeater`·`network-devices.device-layers`(리피터·허브는 주소를 읽지 않는다)
쓰인 곳: (phase 72 step 6) `hub-switch-vlan.hub`(표준의 이름은 리피터, 비트 단위로 받아 다시 내보내고 담긴 내용을 읽지 않는 물리 계층 장비), 문항 n035 해설

## (phase 72 step 1) IEEE SA — 802.1D-2004, 802.1Q-2022 표준 소개 페이지
https://standards.ieee.org/ieee/802.1D/3387/
https://standards.ieee.org/ieee/802.1Q/10323/

- 802.1D-2004 「MAC Bridges」(2004-06-09 발행, 지금은 802.1Q-2014에 합쳐져 Superseded): IEEE 802 LAN을 MAC 서비스 경계 아래에서 잇는 구조를 정한다. 이 표준의 MAC 브리지는 **저마다 MAC을 가진 서로 다른 LAN**에 붙은
  스테이션들이, LLC와 네트워크 계층 프로토콜이 보기에 같은 LAN에 있는 것처럼 통신하게 한다 — 초록
- 802.1Q-2022 「Bridges and Bridged Networks」(2022-12-22 발행, Active): 브리지 네트워크가 MAC 서비스를 어떻게 지원하는지와, MAC 브리지·VLAN 브리지의 동작(관리·프로토콜·알고리즘)을 정한다 — 초록

쓰인 곳: (phase 72 step 1) 강의 수정 이력 L30, (phase 72 step 7) `hub-switch-vlan.collision-domain`(스위치는 포트마다 따로따로의 LAN을 잇고 한 포트의 프레임을 다른 포트의 LAN으로 옮겨 보낸다 — 그래서 충돌 도메인이 포트마다 나뉜다), 문항 n037 해설, (phase 72 step 8) `hub-switch-vlan.switch`(표준의 이름은 브리지, 브리지의 동작은 IEEE 802.1Q가 정한다), `hub-switch-vlan.mac-address-table`(IEEE 802.1D는 지금 IEEE 802.1Q에 합쳐졌다), (phase 72 step 10) `hub-switch-vlan.broadcast-domain`(스위치는 포트마다 따로따로의 LAN을 잇는다 — 충돌 도메인과의 차이), (phase 72 step 11) `hub-switch-vlan.vlan-membership`·`hub-switch-vlan.vlan-tagging`(IEEE 802.1Q를 「브리지 표준」으로 부른다)

## (phase 72 step 1) IEEE 802.1 — IETF 86 Tutorial 「IEEE 802.1Q Media Access Control Bridges and Virtual Bridged Local Area Networks」(2013-03-10)
https://www.ieee802.org/802_tutorials/2013-03/8021-IETF-tutorial-final.pdf

IEEE 802.1 작업 그룹 사람들(P. Thaler, N. Finn 외)이 IETF 86에서 802.1Q를 소개한 튜토리얼 자료다(표준 본문이 아니다).

- 브리지는 **목적지 MAC 주소**와 VLAN ID(VID)를 보고 프레임을 전달한다 — 12쪽
- 프레임을 어디로 보낼지 모르면 그 프레임의 VLAN 안에서 **받은 포트를 뺀 모든 포트**로 내보낸다. 어디로 보낼지 알면 필요 없는 포트로는 내보내지 않는다(목적지 쪽으로만 내보낸다) — 12쪽
- 브로드캐스트와 목적지를 모르는 유니캐스트는 그 VLAN에 플러딩되는 프레임의 예다 — 27쪽(MVRP 설명)
- 활성 토폴로지(실제로 프레임이 다니는 경로)를 정하는 프로토콜로 RSTP·MSTP·SPB가 있다. **처음의 스패닝 트리 프로토콜(STP)은 이제 역사 속 이름이고 RSTP가 그 자리를 이었다** — 26쪽
- 802.1Q는 12비트 VLAN만 다루는 표준이 아니다(서비스·백본 태그 등도 있다) — 16쪽
- (phase 72 step 3) MAC은 Media Access Control의 약어다 — 문서 제목(「IEEE 802.1Q Media Access Control Bridges …」)
- (phase 72 step 8) MAC 주소는 「위치」 주소가 아니라 「식별자」 주소다 — 장치가 누구인지 가리킬 뿐 어디에 있는지 가리키지 않는다 — 12쪽 「Basic Principles」 첫 항목
- (phase 72 step 9) 12쪽을 다시 읽었다(2026-10-28, 위 PDF). 이 쪽이 「필터링」이라는 말을 직접 쓴다 — 프레임을 알맞은 내보낼 포트로만 전달하려고 거르고(frame filtering),
  어디로 보낼지 알면 필요 없는 포트를 걸러 낸다(filter unnecessary ports, 예: 목적지 쪽으로만 전달). 어디로 보낼지 모르면 받은 포트를 뺀 모든 포트로 전달한다 — 12쪽 「Basic Principles」
- (phase 72 step 9) 스패닝 트리는 실제로 프레임이 다니는 활성 토폴로지(Active Topology)의 한 형태다(같은 자리에 최단 경로·TE 경로가 나란히 적혀 있다). RSTP는 모든 트래픽이 스패닝 트리 하나를 함께 쓴다 — 26쪽, 28쪽
- (phase 72 step 11) 브리지가 프레임을 다루는 동작(Data Plane Actions)에는 들어오는 포트와 나가는 포트에서 태그를 붙이거나 떼는 일((un)tagging)이 있다 — 17쪽. 위 PDF를 2026-10-28에 다시 받아 읽었다

쓰인 곳: (phase 72 step 1) 강의 수정 이력 L32, `exam-notes.md` E4, (phase 72 step 3) 문항 n030 해설(MAC의 풀네임), (phase 72 step 8) `hub-switch-vlan.switch`(목적지 MAC 주소를 보고 목적지 쪽 포트로만 내보낸다 — 목적지를 아는 경우), `hub-switch-vlan.mac-address-table`(MAC 주소는 장치가 어디에 있는지 가리키지 않으므로 스위치가 자리를 배운다), 문항 n040·n041 해설, (phase 72 step 9) `hub-switch-vlan.flooding-forwarding-filtering`(목적지를 모르면 받은 포트를 뺀 모든 포트로 — 플러딩, 알면 그 쪽으로만 — 포워딩, 필요 없는 포트는 걸러 냄 — 필터링, 브로드캐스트도 플러딩된다 — 27쪽), `hub-switch-vlan.stp`(STP가 남긴, 프레임이 실제로 다니는 고리 없는 길을 스패닝 트리라 부른다 — 26쪽·28쪽, 고리에서 플러딩된 프레임이 다시 플러딩된다), 문항 n042·n043 해설, (phase 72 step 10) `hub-switch-vlan.broadcast-domain`(스위치는 브로드캐스트를 플러딩하므로 브로드캐스트 도메인을 나누지 않는다 — 27쪽), `hub-switch-vlan.vlan`(스위치는 한 VLAN의 프레임을 같은 VLAN의 포트로만 내보내고, 목적지를 모르는 프레임도 그 VLAN 안에서만 플러딩한다 — 12쪽), 문항 n044·n045·n046 해설, (phase 72 step 11) `hub-switch-vlan.vlan-tagging`(태그로 VLAN을 안 스위치가 그 VLAN에 든 포트로만 내보낸다 — 12쪽, 스위치가 포트에서 태그를 붙이고 뗀다 — 17쪽), 문항 n048 해설

## (phase 72 step 1) IEEE 802.1 — 802.1w Rapid Reconfiguration of Spanning Tree 프로젝트 페이지
https://www.ieee802.org/1/pages/802.1w.html

IEEE 802.1 작업 그룹의 프로젝트 페이지다. 프로젝트는 끝났고 802.1D-2004에 합쳐졌다.

- 802.1w는 802.1D-1998을 보완해 MAC 브리지가 빠르게 다시 구성되게 하는 변경을 정했다 — 프로젝트 설명 첫 문단
- 동기: 그때의 스패닝 트리 프로토콜은 **링크가 끊기거나 되살아날 때 다시 구성해 서비스를 되살리는 데** 시간이 오래 걸렸다 — 프로젝트 설명의 첫 항목

- (phase 72 step 9) 페이지를 다시 열어 확인했다(2026-10-28). 동기의 첫 항목이 「링크가 끊기거나 되살아날 때 다시 구성하고 서비스를 되살리는 데 드는 긴 시간」이다 — 그러니 STP는 링크가 끊기면 다시 구성해 통신을 되살린다.
  고리를 이룬 스위치 셋에서 쓰던 링크 하나가 끊기면 남은 길은 막아 둔 링크를 지나는 길뿐이므로, 되살린다는 것은 막아 둔 포트를 다시 전달 상태로 쓴다는 뜻이다. 다시 구성하는 시간과 RSTP의 방식은 가져오지 않는다

쓰인 곳: (phase 72 step 9) `hub-switch-vlan.stp`(쓰던 링크가 끊기면 다시 정보를 주고받아 길을 새로 정하고, 막아 두었던 포트를 전달 상태로 바꿔 쓴다)

## (phase 72 step 1) RFC 4188 — Definitions of Managed Objects for Bridges
https://www.rfc-editor.org/rfc/rfc4188

Proposed Standard(Standards Track)이다. IEEE 802.1D-1998의 투명 브리지를 관리하는 MIB다.

- 브리지는 네트워크 계층 아래에서 LAN 구간들을 잇는 장치다. 투명 브리징은 IEEE 802.1D가 정한다 — §3
- 전달 데이터베이스(dot1dTpFdbTable)의 항목은 유니캐스트 MAC 주소와, **출발지 주소가 그 주소인 프레임이 들어온 포트의 번호**를 짝짓는다. 항목 상태에는 배운 것(learned)·관리자가 넣은 것(mgmt) 등이 있다 — §4 dot1dTpFdbAddress·dot1dTpFdbPort·dot1dTpFdbStatus
- 동적으로 배운 전달 정보를 지우기까지의 시간이 dot1dTpAgingTime(초)이고, **802.1D-1998은 기본값 300초를 권한다** — §4 dot1dTpAgingTime(REFERENCE 802.1D-1998 14.7.1.1.3)
- 전달 과정이 걸러 버린(filtered) 프레임의 수를 센다 — §4 dot1dTpPortInDiscards
- 스패닝 트리 프로토콜이 정하는 포트 상태는 disabled·blocking(차단)·listening·learning(학습)·forwarding(전달)·broken이고, 그 상태가 포트가 받은 프레임을 어떻게 다룰지 정한다 — §4 dot1dStpPortState(REFERENCE 802.1D-1998 8.5.5.2)
- 스패닝 트리에는 뿌리(루트)가 있고 스패닝 트리 프로토콜이 그것을 정한다 — §4 dot1dStpDesignatedRoot
- 이 RFC는 학습·플러딩의 절차와 고리를 설명하지 않는다(전문 검색) — 그 근거는 위 802.1 튜토리얼과 아래 RFC 7348이다
- (phase 72 step 8) 투명 브리지의 이 표를 「전달 데이터베이스(Forwarding Database)」라 부른다 — §4 「The Forwarding Database for Transparent Bridges」 머리 주석, dot1dTpLearnedEntryDiscards
- (phase 72 step 8) dot1dTpAgingTime은 MAX-ACCESS가 read-write이고 값의 범위가 10~1000000초다 — 관리자가 바꿀 수 있는 값이다 — §4 dot1dTpAgingTime
- (phase 72 step 8) 배웠다가 에이징으로 지워진 항목은 더는 유효하지 않은 항목(invalid)으로 표시될 수 있다 — §4 dot1dTpFdbStatus
- (phase 72 step 9) 원문을 다시 열어 확인했다(2026-10-28). 걸러 버린 프레임 수의 DESCRIPTION은 「전달 과정이 버린(곧 걸러 낸, filtered) 유효한 프레임 수」다 — §4 dot1dTpPortInDiscards
- (phase 72 step 9) 스패닝 트리의 루트이거나 루트가 되려는 브리지는 모든 포트로 설정 BPDU(Configuration bridge PDU)를 일정한 간격으로 보낸다 — STP를 쓰는 브리지끼리 정보를 주고받는다 — §4 dot1dStpHelloTime.
  BPDU의 형식과 간격 값은 가져오지 않는다
- (phase 72 step 9) 포트 상태는 STP를 적용해 정해지고, 그 상태가 포트로 받은 프레임을 어떻게 다룰지 정한다 — §4 dot1dStpPortState. 포트는 학습 상태에서 전달 상태로, 전달 상태에서 차단 상태로 바뀔 수 있다 — §4 topologyChange

쓰인 곳: (phase 72 step 8) `hub-switch-vlan.mac-address-table`(표의 항목은 출발지 MAC 주소와 그 프레임이 들어온 포트의 짝, 표준 문서의 이름 전달 데이터베이스, 에이징 기본값 300초를 802.1D가 권하고 관리자가 바꿀 수 있음), 문항 n041 해설, (phase 72 step 9) `hub-switch-vlan.flooding-forwarding-filtering`(필터링 — 걸러 낸 프레임), `hub-switch-vlan.stp`(스위치들이 서로 정보를 주고받는다, 포트마다 상태가 있고 차단(blocking)·전달(forwarding) 상태가 그 가운데 둘이다, 막아 둔 포트가 전달 상태로 바뀔 수 있다)

## (phase 72 step 1) RFC 4363 — Definitions of Managed Objects for Bridges with Traffic Classes, Multicast Filtering, and Virtual LAN Extensions
https://www.rfc-editor.org/rfc/rfc4363

Proposed Standard(Standards Track)이다. IEEE 802.1Q-2003의 VLAN을 관리하는 Q-BRIDGE MIB다.

- 이 MIB는 **포트 기반 VLAN**을 다룬다 — 프레임이 들어온 브리지 포트로 VLAN 소속이 정해지는 VLAN이다. 802.1Q에는 포트와 프로토콜로 정하는 VLAN도 있지만 이 MIB 밖이다 — §2
- PVID는 포트로 들어온 **태그 없는 프레임**(과 우선순위 태그만 붙은 프레임)에 매기는 VLAN ID다 — §5 dot1qPvid(REFERENCE 802.1Q 12.10.1.1)
- 포트가 태그 없는 프레임을 받을지는 설정으로 정한다 — 모두 받거나(admitAll, 받으면 PVID로 VLAN을 매긴다), 태그 붙은 프레임만 받는다(admitOnlyVlanTagged) — §5 dot1qPortAcceptableFrameTypes
- 입력 필터링을 켜면 그 포트가 들어 있지 않은 VLAN의 프레임은 버린다 — §5 dot1qPortIngressFiltering
- VLAN마다 그 VLAN의 프레임을 내보내는 포트 묶음(egress ports)이 있고, 그 가운데 **태그를 떼고 내보내는 포트 묶음(untagged ports)**을 따로 둔다. 나머지 포트는 태그를 붙인 채 내보낸다 — §5 dot1qVlanStaticEgressPorts·dot1qVlanStaticUntaggedPorts·dot1qVlanCurrentEgressPorts·dot1qVlanCurrentUntaggedPorts
- 802.1Q VLAN ID로 쓰는 값은 1~4094다. 0과 4095는 쓰지 않는다 — §5 VlanId·VlanIndex
- MAC 주소로 VLAN을 정하는 방식은 이 RFC에 없다 — 강의 p105의 MAC 주소 기반 VLAN은 강의 사실로만 쓴다
- (phase 72 step 11) §2를 다시 열어 확인했다(2026-10-28, 위 URL의 .txt). IEEE 802.1Q는 **데이터 프레임이 들어온 브리지 포트로 소속이 정해지는 포트 기반 VLAN**(port-based Virtual LANs)과,
  들어온 포트와 프레임의 프로토콜 식별자로 정해지는 포트·프로토콜 기반 VLAN을 정한다. VLAN은 여러 LAN 구간에 흩어진 종단 장치들의 무리이고 한 LAN에 있는 것처럼 통신한다 — §2
- (phase 72 step 11) VLAN마다 그 VLAN의 트래픽을 태그 붙은 프레임이나 태그 없는 프레임으로 내보내는 포트 묶음이 있고(dot1qVlanCurrentEgressPorts),
  그 가운데 **태그 없이 내보내는 포트 묶음을 「untagged ports」라는 이름의 객체로 따로 둔다**(dot1qVlanStaticUntaggedPorts·dot1qVlanCurrentUntaggedPorts). 본문의 태그 포트(tagged port)는 그 나머지, 곧 태그를 붙인 채 내보내는 포트를 이 이름에 맞춰 부른 것이다 — §5
- (phase 72 step 11) §2는 브리지를 흔히 「layer 2 switches」라 부른다고 적는다 — §2 첫 문단. `exam-notes.md` E7(「L2 스위치」라는 이름)의 근거가 될 수 있는 문장이지만, 이 step은 `hub-switch-vlan.switch`를 고치지 않으므로 쓰지 않았다

쓰인 곳: `exam-notes.md` E4, (phase 72 step 11) `hub-switch-vlan.vlan-membership`(IEEE 802.1Q가 정한 포트 기반 VLAN — 들어온 포트에 정해 둔 VLAN으로 프레임을 다룬다), `hub-switch-vlan.vlan-tagging`(VLAN이 여러 스위치에 걸친다, 태그를 떼고 내보내는 포트와 태그를 붙인 채 내보내는 포트, 태그 없이 들어온 프레임은 그 포트에 정해 둔 VLAN으로 다룬다, VLAN ID는 1~4094이고 0·4095는 쓰지 않는다), 문항 n047·n048 해설

## (phase 72 step 1) RFC 7348 — Virtual eXtensible Local Area Network (VXLAN)
https://www.rfc-editor.org/rfc/rfc7348

Informational(Independent Submission)이다. VXLAN을 만든 까닭을 설명하면서 2계층 네트워크의 STP와 VLAN을 정리한 부분만 쓴다.

- 2계층 네트워크는 중복 경로 때문에 생기는 고리를 피하려고 IEEE 802.1D의 스패닝 트리 프로토콜(STP)을 쓴다. **STP는 일부 링크를 쓰지 못하게 막아 프레임이 복제되고 고리를 도는 것을 막는다** — §3.1
- 그래서 STP를 쓰면 사 둔 포트·링크 가운데 일부를 쓰지 못하고, 여러 경로로 나눠 보내는 데서 오는 회복력도 얻지 못한다 — §3.1
- VLAN은 브로드캐스트를 격리하는 데 쓴다. **이더넷 프레임에 담는 12비트 VLAN ID로 큰 2계층 네트워크를 여러 브로드캐스트 도메인으로 나눈다.** VLAN은 4094개까지다 — §3.1
- STP로 고리 없는 토폴로지를 만들면 쓰지 못하는 링크가 많이 생길 수 있다 — §1
- (phase 72 step 9) §3.1을 다시 열어 확인했다(2026-10-28). STP는 「IEEE 802.1D 스패닝 트리 프로토콜」이고, 고리는 **중복 경로**(duplicate paths) 때문에 생긴다.
  여러 경로를 두는 데서 오는 회복력(resiliency)은 STP 방식에서 얻지 못한다 — 막아 둔 링크는 평소에 쓰이지 않는다 — §3.1

쓰인 곳: (phase 72 step 9) `hub-switch-vlan.stp`(끊길 때를 대비한 다른 길이 고리를 만든다, STP는 IEEE 802.1D가 정했다, 일부 링크를 막아 프레임이 복제되고 고리를 도는 것을 막는다, 막아 둔 링크는 평소에 쓰지 못한다), 문항 n043 해설, (phase 72 step 10) `hub-switch-vlan.broadcast-domain`(VLAN이 브로드캐스트 도메인을 나눈다 — 다음 개념으로 넘기는 한 줄), `hub-switch-vlan.vlan`(VLAN은 브로드캐스트를 가두고 2계층 네트워크를 여러 브로드캐스트 도메인으로 나눈다), 문항 n045 해설, (phase 72 step 11) `hub-switch-vlan.vlan-tagging`(VLAN ID는 12비트이고 VLAN은 4094개까지다), 문항 n048 해설

## (phase 72 step 1) RFC 5517 — Cisco Systems' Private VLANs: Scalable Security in a Multi-Client Environment
https://www.rfc-editor.org/rfc/rfc5517

Informational(Independent Submission)이다. 시스코 사설 VLAN을 설명하는 문서인데, VLAN 일반을 말한 두 문장만 쓴다. 사설 VLAN 자체는 쓰지 않는다.

- **VLAN 하나는 그 안의 호스트들이 2계층에서 서로 바로 통신할 수 있는 브로드캐스트 도메인이다** — §1
- (보통의 구성에서) VLAN마다 서브넷을 따로 둔다 — §1.2

쓰인 곳: `exam-notes.md` E4, (phase 72 step 10) `hub-switch-vlan.vlan`(VLAN 하나는 그 안의 장치들이 데이터 링크 계층에서 서로 바로 통신하는 브로드캐스트 도메인이다 — §1), 문항 n046 해설

## (phase 72 step 1) RFC 1812 — Requirements for IP Version 4 Routers
https://www.rfc-editor.org/rfc/rfc1812

Proposed Standard(Standards Track)이다.

- 링크 계층에서 동작하는 패킷 교환 장치는 보통 브리지라고 부른다. 네트워크들을 잇는 IP 데이터그램 전달 장치는 라우터라고 부른다 — §2.2.3
- 라우터는 **링크 계층 브로드캐스트로 받은 패킷을 다른 네트워크로 넘기지 않는다**(목적지가 IP 멀티캐스트 주소인 경우만 예외다). 링크 계층 멀티캐스트로 받은 패킷도 목적지가 IP 멀티캐스트가 아니면 넘기지 않는다 — §5.3.4
- 링크 계층은 받은 패킷의 목적지 물리 주소가 유니캐스트·브로드캐스트·멀티캐스트 가운데 무엇인지 IP 계층에 알려야 한다 — §3.2
- (phase 73) TTL은 데이터그램의 수명을 재는 타이머로 정의했고 단위는 초다. 그러나 패킷을 다루는 라우터(와 다른 모듈)는 1초보다 훨씬 짧게 걸려도 TTL을 최소 1씩 줄여야 하고, 대개 그렇게 짧게 걸리므로
  TTL은 **사실상 데이터그램이 몇 홉까지 갈 수 있는지의 상한**이다 — §5.3.1
- (phase 73) 라우터는 패킷을 넘길 때 TTL을 최소 1 줄인다. 패킷을 1초 넘게 붙잡고 있었으면 1초마다 1씩 더 줄여도 된다 — §5.3.1
- (phase 73) TTL이 0(이하)이 되면 라우터는 그 패킷을 버리고, 목적지가 멀티캐스트 주소가 아니면 출발지에 ICMP 시간 초과(코드 0, 전송 중 TTL 초과)를 보낸다(ICMP는 step 1) — §5.3.1
- (phase 73) TTL은 홉 수의 상한이자 시간의 상한으로 함께 쓰인다. 홉 수 쪽 쓰임 덕에 경로 문제로 패킷이 끝없이 돌며 네트워크를 무너뜨리지 않는다. 지금 많은 구현이 TTL을 **순수한 홉 수로만** 다루고,
  이 문서도 시간 한도 쪽 기능은 라우터가 꼭 구현하지 않아도 되는 것으로 정했다. traceroute는 TTL을 홉 수로 다룰 때 제대로 동작한다 — §5.3.1 DISCUSSION
- (phase 73) 라우터는 IP 단편화를 반드시 지원한다. 단편화할 때는 조각 수를 줄이고 조각을 차례대로 보내는 것이 좋다 — §4.2.2.7
- (phase 73) 라우터는 데이터그램을 넘기기 전에 다시 합치지 않는다. 조각들이 목적지까지 서로 다른 경로로 갈 수 있기 때문이다 — §5.2.6과 DISCUSSION
- (phase 73 step 1) 라우터가 유니캐스트 데이터그램을 넘기는 순서: 라우팅 표에서 목적지에 맞는 **다음 홉의 IP 주소**와 내보낼 인터페이스를 정한다 → 넘겨도 되는지 확인한다 → TTL을 최소 1 줄이고 확인한다 → 남은 옵션을 처리한다 → 필요하면 나눈다 →
  **다음 홉의 링크 계층 주소**를 알아낸다(방법은 링크 계층마다 다르다) → 데이터그램을 새 링크 계층 프레임에 담아 그 인터페이스로 내보낸다 — §5.2.1.2.
  이 순서에 출발지·목적지 IP 주소를 바꾸는 단계는 없다(TTL이 바뀌므로 헤더 체크섬은 다시 맞춘다 — §4.2.2.5, 위 RFC 791 §3.1 줄). IP 주소를 바꾸는 NAT는 RFC 3022(위 항목)이고 `ip-address-types` 주제의 일이다
- (phase 73 step 1) ARP를 쓰는 라우터는 RFC 1122의 ARP 요구를 따른다. 목적지의 ARP 캐시 항목이 없다는 것만으로 도달 불가를 알리지 않고, ARP 요청·응답을 하는 동안 데이터그램 몇 개를 잠깐 쥐고 있다가 끝내 답이 없을 때만 알린다.
  다른 장치의 링크 계층 주소를 브로드캐스트·멀티캐스트 주소라고 하는 ARP 응답은 믿지 않는다 — §3.3.2
- (phase 73 step 1) 목적지 도달 불가는 라우터가 목적지(또는 다음 홉)에 갈 수 없거나 서비스를 쓸 수 없어 넘기지 못한 패킷에 대해 보낸다. 예로 ARP 요청에 답하지 않는 없는 호스트로 가는 메시지, 유효한 경로가 없는 네트워크 접두사로 가는 메시지를 든다.
  라우터는 이 메시지를 만들 수 있어야 하고 까닭에 가장 맞는 코드를 고른다 — §5.2.7.1
- (phase 73 step 1) 코드와 보내는 쪽: 0 네트워크 도달 불가 — 목적지 네트워크로 가는 경로가 없을 때 라우터가, 1 호스트 도달 불가 — 직접 이어진 네트워크의 목적지 호스트로 갈 길이 없을 때(ARP에 답하지 않을 때) 라우터가,
  2 프로토콜 도달 불가 — 최종 목적지의 전송 계층이 그 프로토콜을 지원하지 않을 때, 3 포트 도달 불가 — 최종 목적지의 전송 프로토콜(예: UDP)이 받을 곳을 찾지 못하고 출발지에 알릴 방법도 없을 때,
  4 단편화 필요·DF 설정 — 라우터가 나눠야 하는데 DF가 켜져 있을 때, 5 소스 라우트 실패. 6~15는 그 뒤에 더한 코드다 — §5.2.7.1
- (phase 73 step 9) 인터넷은 여러 네트워크를 IP 데이터그램을 넘겨주는 장치로 이어 만든 것이고, 그 장치를 라우터(IP 라우터)라 부른다. 예전의 인터넷 문서는 라우터를 **게이트웨이**라고 부른 것이 많다 — §2.2.3
- (phase 73 step 9) IP 호스트나 라우터의 네트워크 인터페이스는 전통적으로 저마다 자기 IP 주소를 갖는다. 주소를 아끼려고 점대점 회선의 인터페이스에 IP 주소를 주지 않는 구성(unnumbered line)도 있지만, 그것은 예외로 다룬다 — §2.2.7
- (phase 74) 상태: 폐기되지 않았고 RFC 2644·RFC 6633이 고쳤다(rfc-editor 상태, 2026-10-29). directed broadcast의 기본값을 바꾼 것이 RFC 2644다(아래 항목)
- (phase 74) 주소 클래스는 A~E 다섯이고, D는 IP 멀티캐스트에 쓰고 E는 실험용으로 남겨 두었다. **A·B·C의 구분은 이제 중요하지 않다** — 일반적인 유니캐스트 네트워크 접두사로 쓰이고, 클래스는 역사적인 의미만 남았다 — §4.2.2.11
- (phase 74) 유니캐스트 주소를 {네트워크 접두사, 호스트 번호}로 적는다. {네트워크 접두사, -1}은 그 접두사로 보내는 **directed broadcast**이고 출발지 주소로 쓰면 안 된다 — §4.2.2.11 (d).
  호스트 번호와 네트워크 접두사 칸은 특별한 경우를 빼고 0(모두 0)이나 -1(모두 1)일 수 없어, 칸마다 적어도 2비트다 — §4.2.2.11
- (phase 74) **서브넷 번호의 제한을 풀었다**: 이 문서의 앞 판은 서브넷 번호가 0도 -1도 아니어야 하고 적어도 2비트여야 한다고 적었다. CIDR에서는 서브넷 번호가 네트워크 접두사를 늘린 것일 뿐이라 접두사의 나머지 없이 따로 해석할 수 없으므로,
  이 제한은 뜻이 없고 무시해도 된다 — §4.2.2.11 DISCUSSION. 그러니 지금은 서브넷 칸이 k비트이면 서브넷 2^k개를 모두 쓴다(계산. 모두 0·모두 1 서브넷을 빼던 옛 규칙은 위 RFC 950 §2.1, 그 규칙이 낡았다고 적은 표는 아래 RFC 1878 — 역사 기록)
- (phase 74) IP 브로드캐스트는 두 갈래다 — 제한 브로드캐스트(255.255.255.255)와 directed broadcast. 네트워크 접두사로 보내는 directed broadcast는 접두사 뒤 나머지 부분을 모두 1로 둔 주소다 —
  예로 A 클래스 네트워크는 net.255.255.255, B는 net.net.255.255, C는 net.net.net.255(net은 네트워크 주소의 한 바이트) — §5.3.5.
  CIDR에서는 서브넷으로 보내는 directed broadcast가 네트워크 접두사로 보내는 것과 구별되지 않아 함께 다룬다 — §5.3.5.4. 서브넷을 모두 아우르는 directed broadcast는 CIDR에서 뜻이 없어 쓰지 않는다 — §5.3.5, §5.3.5.3
- (phase 74) 0.0.0.0과 {네트워크 접두사, 0}은 옛 구현이 브로드캐스트로 쓰던 비표준 형태다(앞의 것은 제한 브로드캐스트의, 뒤의 것은 directed broadcast의 낡은 형태).
  라우터는 이 주소로 온 패킷을 알리지 않고 버리는 것이 좋고, 이 주소로 보내지 않는 것이 좋다(SHOULD) — §4.2.3.1, §5.3.5. RFC 3021 §2.2도 {네트워크 번호, 0}을 「네트워크 주소 자체」라 부르며 같은 말을 한다(아래 항목)
- (phase 74 step 5) {127, 아무 값}은 호스트 안의 루프백 주소이고 이 꼴의 주소는 호스트 밖에 나타나면 안 된다 — §4.2.2.11 (e).
  라우터는 출발지나 목적지가 0번 네트워크인 패킷을 넘기지 않는 것이 좋고, 127번 네트워크인 패킷도 루프백 인터페이스로 보내는 경우가 아니면 넘기지 않는 것이 좋다(SHOULD NOT) — §5.3.7
- (phase 74 step 5) 라우터는 제한 브로드캐스트를 다른 네트워크로 넘기면 안 되고(MUST NOT), 버려서도 안 된다(MUST NOT) — §5.3.5.1
- (phase 74 step 11) **전달(forwarding)과 라우팅(routing)**: IP 데이터그램을 넘기려면 라우터는 다음 홉 라우터(마지막 홉이면 목적지 호스트)의 주소와 내보낼 인터페이스를 골라야 하고, 이 고름을 전달이라 부른다.
  고름은 라우터 안의 경로 데이터베이스에 기대며, 그것을 **라우팅 테이블**(또는 전달 테이블)이라고도 부른다. 이 데이터베이스를 만드는 과정 — 라우팅 프로토콜과 관리자의 설정이 함께 만드는 과정 — 이 라우팅이다 — §2.2.3.
  경로 데이터베이스는 지금의 망 모양을 비추도록 동적으로 유지하는 것이 좋고, 라우터는 대개 다른 라우터들과 분산 라우팅 알고리즘에 참여해 이것을 한다 — §2.2.3.
  (RFC 1983 용어집은 「라우팅」을 넓게, 전달할 패킷의 인터페이스와 다음 홉을 고르는 일로 적는다 — 아래 RFC 1983 항목)
- (phase 74 step 11) 다음 홉 주소는 패킷을 다음에 보낼 **인접한** 호스트나 라우터의 IP 주소이고, 인접하다는 것은 IP 라우터를 거치지 않고 닿는다는 뜻이다 — §5.2.4.
  목적지가 라우터에 바로 이어진 네트워크에 있으면 다음 홉은 목적지 자신이고, 아니면 라우팅 테이블에서 다음 홉을 찾는다. 라우터가 아닌 호스트에서는 그 다음 홉이 설정해 둔 기본 라우터일 수 있다 — §5.2.4.2 (3), §5.2.4.3
- (phase 74 step 11) 다음 홉을 고르는 차례(가지치기 규칙): 라우팅 테이블(FIB)의 경로 전부를 후보로 두고 ① 기본 일치 — 경로의 접두사 길이만큼의 앞 비트가 목적지 주소와 같은 경로만 남긴다 ② **가장 긴 일치** — 남은 것 가운데 접두사 길이가 가장 긴 것만 남긴다
  ③ TOS(선택) ④ **가장 좋은 메트릭** — 같은 라우팅 도메인에서 온 경로끼리 메트릭을 견줘 못한 쪽을 버린다(대개 단순한 산술 비교) ⑤ 업체 정책. 예: 목적지 10.144.2.5에 10.144.2.0/24·10.144.0.0/16·10.0.0.0/8이 모두 맞으면 /24만 남는다 — §5.2.4.3.
  그 결과 고르는 순서는 호스트 경로 → 네트워크 접두사 경로(접두사가 긴 것부터) → **디폴트 라우트**이고, 디폴트 라우트는 따로 적힌 경로가 없는 모든 네트워크로 가는 경로이며 **정의상 접두사 길이가 0**이다 — §5.2.4.3.
  후보가 하나도 남지 않으면 패킷을 버리고 ICMP 목적지 도달 불가를 보낸다 — §5.2.4.3. 여럿이 남으면 하나만 남기거나 나눠 보낼(load-splitting) 수 있다 — §5.2.4.3, §5.2.4.5
- (phase 74 step 11) 업체 정책의 한 예가 관리 선호도(administrative preference)다 — 경로마다 0~255의 값을 사람이 매겨(0이 가장 선호) 고르는 방식이고, 이웃 라우터와 값이 맞는지 보장하는 프로토콜이 없어 잘못 쓰면 고리를 만든다 — §5.2.4.4.
  **메트릭은 같은 라우팅 도메인의 경로끼리만 견줄 수 있다** — §5.2.4.3 규칙 4, §7.4 DISCUSSION
- (phase 74 step 11) 인터페이스가 고장 나거나 꺼지면 라우터는 그 인터페이스를 쓰는 경로를 모두 빼고, 그 인터페이스를 쓰는 **정적 경로도 쓰지 않는다**. 같은 목적지로 가는 다른 경로를 알고 있으면 그 가운데 가장 좋은 것을 넣는다 — §5.3.12.3.
  인터페이스가 다시 살아나면 그 정적 경로를 다시 쓴다 — §5.3.12.4. (정적 경로가 반응하는 것은 라우터 자신의 인터페이스 상태뿐이다 — 그 너머의 라우터가 멈춘 것은 이 규칙으로 알지 못한다)
- (phase 74 step 11) 이 문서는 라우팅 프로토콜을 7장 「APPLICATION LAYER - ROUTING PROTOCOLS」에서 다룬다. 인터넷의 라우팅은 내부 라우팅과 외부 라우팅 둘로 나뉘고, 그 경계를 정하는 것이 AS다.
  **IGP는 한 AS 안에서, 외부 게이트웨이 프로토콜은 AS 사이에서** 라우팅 정보를 주고받는 데 쓴다 — §7.1
- (phase 74 step 11) AS는 한 운영·관리 조직이 다루는 서브네트워크(와 그에 붙은 호스트)와 라우터들이 경로로 이어진 망의 한 부분이다. AS 안에서는 내부 라우팅 프로토콜을 하나 이상 쓰고 메트릭도 여러 벌일 수 있지만,
  다른 AS에게는 한결같은 내부 라우팅 계획과 그 AS를 거쳐 닿는 목적지를 보인다. AS는 AS 번호로 가리킨다 — §2.2.4(아래 RFC 1930·RFC 4271 항목의 정의와 같은 뜻)
- (phase 74 step 11) 지금 쓰는 IGP는 **거리 벡터** 방식이거나 **링크 상태** 방식이다. IGP가 갖출 일 가운데 하나로 부하를 나누도록 비용이 같은 경로를 내주는 것을 든다 — §7.2.1.
  정적 경로 말고 라우팅 프로토콜을 하나라도 구현하는 라우터는 OSPF를 구현해야 한다 — §7.2.1
- (phase 74 step 11) SPF(Shortest Path First) 방식은 **다익스트라의 최단 경로 알고리즘**에 바탕을 둔 링크 상태 방식이다. 라우터마다 플러딩(flooding)으로 망 모양 데이터베이스 전체를 얻고, 그 데이터베이스에 SPF 알고리즘을 돌려 IP 라우팅 테이블을 만든다.
  OSPF가 이 방식의 프로토콜이고 지금 판은 OSPFv2다(OSPFv1을 적은 RFC 1131은 폐기) — §7.2.2
- (phase 74 step 11) 외부 게이트웨이 프로토콜은 AS 안의 네트워크들에 닿을 수 있다는 정보를 이웃 AS에 건네는 데 쓴다. 이름이 EGP인 옛 프로토콜이 전통적으로 쓰였지만 **지금은 역사적인 것**이고, BGP가 EGP의 제약을 없애 널리 쓰인다 — §7.3.1, 부록 F.1.
  RIP는 외부 프로토콜로 만들지 않았지만 AS 사이에 쓰이기도 한다 — §7.3.1
- (phase 74 step 11) BGP-4는 AS 사이의 라우팅 프로토콜이고, 어떤 네트워크에 닿는 정보에 그 네트워크까지 가려면 지나야 하는 **AS의 목록 전체**를 담는다. 이 정보로 고리 없는 경로를 고르고 AS 단위의 정책을 적용할 수 있다 — §7.3.2.1.
  관리자가 AS마다 가중치를 매겨 특정 경로를 고르게 하거나, 어떤 AS가 AS 경로에 든 경로를 무시하게 할 수 있어야 한다(SHOULD) — §7.3.2.2
- (phase 74 step 11) **정적 라우팅**은 어떤 목적지로 가는 다음 홉을 관리자가 드러내 적어 정하는 방법이고, 목적지는 네트워크 접두사로 정한다 — §7.4.
  같은 목적지에 정적 경로와 동적 경로가 함께 있을 때 **어느 쪽을 더 쓸지(또는 메트릭으로 가를지)는 정적 경로마다 설정할 수 있어야 한다**(SHOULD) — §7.4 DISCUSSION. 표준이 정적 경로를 늘 먼저 쓰라고 정하지는 않는다(`exam-notes.md` E17)
- (phase 74 step 11) 단순한 네트워크라면 전달 데이터베이스의 내용을 정적으로 설정해도 되지만, 네트워크가 복잡해질수록 그것을 **동적으로 고치는 일**이 효율적인 운영에 중요해진다 — §7.5
- (phase 74 step 11) 용어집(부록 B): 디폴트 라우트는 라우팅 테이블에 따로 적히지 않은 네트워크 접두사로 가는 데이터를 보낼 항목이다. FIB(전달 정보 베이스)는 적어도 닿을 수 있는 목적지 접두사마다 인터페이스와 다음 홉 정보를 담는다.
  경로(path)는 패킷이 한 라우터에서 목적지 호스트까지 지나는 라우터와 네트워크의 이어짐이고 한 방향이다 — 두 호스트 사이의 오가는 길이 서로 다른 일이 드물지 않다. 라우터는 패킷을 라우터에서 라우터로 넘겨 목적지에 닿게 한다 — 부록 B 「Default Route」, 「Forwarding Information Base (FIB)」, 「Path」, 「router」
- (phase 74 step 11) 역사(부록 E): 정적 경로가 들어오면서 같은 목적지로 가는 동적 경로와 정적 경로가 함께 있게 됐고, 어느 쪽을 쓸지는 라우터의 **정책**(어떤 것은 설정할 수 있고 어떤 것은 소프트웨어를 만든 쪽이 정했다)이 정했다.
  다만 그 정책은 가장 긴 일치로 하나가 정해지지 않을 때만 쓰는 판가름이었다 — 그래서 정적 디폴트 라우트는 동적인 네트워크 경로보다 먼저 쓰이지 않는다 — 부록 E
- (phase 74 step 11) 부록 F는 지금 인터넷의 특성에 맞지 않아 권하지 않는 「역사적」 라우팅 프로토콜을 모은다 — EGP(F.1, 거리 칸에 표준 해석이 없어 라우팅 프로토콜로 보지 않는다)와 RIP(F.2).
  RIP를 구현하는 라우터는 CIDR 경로를 지원하는 RIP 버전 2를 구현하는 것이 좋다(SHOULD) — 부록 F.2.1

- (phase 82 step 8, 2026-11-19 상태를 다시 확인 — Proposed Standard, 1995-06, RFC 1009·1716을 폐기했고 RFC 2644·6633이 고쳤다) 위 §2.2.3 줄들(링크 계층의 패킷 교환 장치는 브리지, 네트워크들을 잇는 IP 데이터그램 전달 장치는 라우터, 예전 인터넷 문서는 라우터를 게이트웨이라 불렀다)을 이 주제가 다시 쓴다 — 새로 가져온 사실은 없다
  쓰인 곳: (phase 82 step 9·10에서 쓰일 곳) `network-devices.device-layers`(브리지는 링크 계층, 라우터는 네트워크들을 잇는다), `network-devices.gateway`(예전 문서가 라우터를 게이트웨이라 불렀다 — 그래서 IP 설정의 「기본 게이트웨이」도 라우터를 가리킨다)
- (phase 82 step 9, 2026-11-19 rfc-editor.org 텍스트판을 IPv4로 다시 받아 읽음) **라우터가 프레임을 다루는 차례**(§1 머리말): IP 라우터는 다른 패킷 교환 장치와 달리 교환하는 과정에서 IP 헤더를 살핀다.
  라우터는 대개 메시지를 받을 때 붙어 온 링크 계층 헤더를 떼어 내고, IP 헤더를 고친 뒤, 다시 내보낼 때 링크 계층 헤더를 새로 붙인다. 같은 §1은 이런 장치를 OSI 쪽에서는 중간 시스템이라 부르고, 예전 인터넷 문서는 게이트웨이라 불렀다고 적는다.
  라우터도 다른 인터넷 시스템과 같은 링크 계층 요구 사항을 지킨다 — §3.1. 본문은 「IP 헤더를 고친다」(TTL 등)는 쓰지 않고, 프레임 헤더를 떼어 패킷을 꺼내고 내보낼 때 새 프레임에 담는다는 데까지만 쓴다
  쓰인 곳: (phase 82 step 9) `network-devices.device-layers`(라우터 항목 — 받은 프레임의 헤더를 떼어 패킷을 꺼내고 새 프레임에 담아 보낸다, 위 계층을 읽는 장비는 아래 계층의 헤더를 먼저 푼다, 예와 4절 「스위치와 라우터」, 도식 `device-layers`의 「라우터」 캡션), 문항 n327 해설
- (phase 82 step 10) 쓰인 곳: `network-devices.gateway`(문단 4 — 예전 인터넷 문서가 라우터를 게이트웨이라 불렀고 그 옛 이름이 IP 설정의 기본 게이트웨이에 남았다, 문단 7 「게이트웨이와 라우터」), 문항 n329 해설
쓰인 곳: `exam-notes.md` E4·E7, (phase 72 step 8) `hub-switch-vlan.switch`(브리지는 링크 계층 — 데이터 링크 계층 — 장치), (phase 72 step 10) `hub-switch-vlan.broadcast-domain`(라우터는 서로 다른 네트워크를 잇는 장비이고 브로드캐스트로 받은 데이터를 다른 네트워크로 넘기지 않아 브로드캐스트 도메인의 경계가 된다 — §2.2.3·§5.3.4), 문항 n044·n046 해설,
(phase 73에서 쓰일 곳) `ip-protocol.fragmentation`(§4.2.2.7·§5.2.6 — 라우터도 나누고, 합치지 않는다), `ip-protocol.ttl`(§5.3.1 — 사실상 홉 수의 상한, 0이면 버리고 시간 초과), `exam-notes.md` E9 앞 문단(TTL 단위),
(phase 73 step 1에서 쓰일 곳) `arp.arp-across-routers`(§5.2.1.2 — 다음 홉의 링크 계층 주소, 주소를 바꾸는 단계 없음; §5.3.4 — 링크 계층 브로드캐스트로 받은 ARP 요청을 다른 네트워크로 넘기지 않는다; §3.3.2),
`icmp.destination-unreachable`(§5.2.7.1 — 코드와 보내는 쪽), `icmp.time-exceeded`(§5.3.1 — TTL 0이면 코드 0)
(phase 73 step 8) `arp.arp`(§5.3.4 — 라우터는 링크 계층 브로드캐스트로 받은 데이터를 다른 네트워크로 넘기지 않으므로 ARP는 같은 LAN 안에서만 쓴다)
(phase 73 step 9) `arp.arp-across-routers`(§2.2.3 — 표준 문서는 라우터를 게이트웨이라고도 부른다; §2.2.7 — 라우터의 인터페이스는 저마다 IP 주소를 갖는다; §5.2.1.2·§5.3.4 — 구간마다 다음 장치의 MAC 주소를 알아내 새 프레임에 담고 IP 주소는 바꾸지 않는다), 도식 `arp-hops`, 문항 n067 해설
(phase 73 step 12) `icmp.destination-unreachable`(§5.2.7.1 — 코드 0은 목적지 네트워크로 가는 경로가 없을 때, 1은 직접 이어진 네트워크의 목적지 호스트에 넘길 수 없을 때, 4는 나눠야 하는데 DF가 켜져 있을 때 라우터가 보낸다), 문항 n074 해설, 도식 `destination-unreachable`
(phase 74에서 쓰일 곳) `ip-addressing.address-classes`(§4.2.2.11 — 다섯 클래스, A·B·C 구분은 역사적 의미뿐), `ip-addressing.network-broadcast-address`(§4.2.2.11 — directed broadcast, 칸이 0·-1일 수 없다, §5.3.5 — directed broadcast의 꼴, §4.2.3.1 — 호스트 부분이 모두 0인 주소는 낡은 브로드캐스트 형태),
`ip-addressing.subnetting`·`ip-addressing.subnet-sizing`(§4.2.2.11 DISCUSSION — 모두 0·모두 1 서브넷도 쓴다), `exam-notes.md`의 「phase 74 step 0」 문단, 강의 수정 이력 L38
(phase 74 step 5에서 쓰일 곳) `ip-address-types.reserved-addresses`(§5.3.5.1 — 제한 브로드캐스트는 넘기지 않는다, §5.3.7 — 0번·127번 네트워크의 패킷은 넘기지 않는다), `ip-address-types.loopback`(§4.2.2.11 (e), §5.3.7), `ip-address-types.nat`(§2.2.3 — 라우터는 IP 데이터그램을 넘기는 장치이고 링크 계층 장치는 브리지다: NAT가 데이터 링크 계층의 일이 아니라는 것의 한쪽 근거)
(phase 74 step 11에서 쓰일 곳) `routing.routing`(§2.2.3 — 전달과 라우팅, 경로 데이터베이스 = 라우팅 테이블, §5.2.1.2 — 라우터마다 다음 홉만 정한다, §5.2.4 — 다음 홉·인접, 부록 B 「Path」·「router」), `routing.routing-table`(§2.2.3, §5.2.4.3 규칙 4 — 메트릭, 부록 B 「FIB」),
`routing.longest-prefix-match`(§5.2.4.3 규칙 1·2와 예), `routing.default-route`(§5.2.4.3 — 접두사 길이 0, 맞는 경로가 하나도 없을 때만, 부록 B 「Default Route」, §5.2.4.2 (3) — 호스트의 기본 라우터),
`routing.static-dynamic-routing`(§7.4·§7.4 DISCUSSION·§7.5·§5.3.12.3·부록 E — 정적 경로, 선호는 설정, 단순한 네트워크와 복잡한 네트워크, 인터페이스 고장), `routing.as`(§2.2.4, §7.1, §7.3.1 — AS, IGP와 외부 프로토콜, 옛 EGP는 역사적),
`routing.rip`(§7.2.1 — 거리 벡터, 부록 F.2.1 — RIPv2를 권한다), `routing.ospf`(§7.2.1·§7.2.2 — 링크 상태, 다익스트라, 플러딩, 같은 비용 경로), `routing.bgp`(§7.3.2.1·§7.3.2.2 — AS 목록, 고리 없는 경로, 정책), `exam-notes.md` E17, 강의 수정 이력 L42

## (phase 72 step 1) NIST SP 800-125B — Secure Virtual Network Configuration for Virtual Machine (VM) Protection (2016-03)
https://csrc.nist.gov/pubs/sp/800/125/b/final

NIST 특별 간행물이다. 위 csrc.nist.gov 페이지가 링크한 본문 PDF(https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-125B.pdf)의 2.4절만 쓴다.

- VLAN은 처음에 데이터 센터에서 관리를 쉽게 하려고(예: 브로드캐스트를 가두려고) 썼고, 트래픽을 격리하므로 네트워크를 나누는 보안 수단으로도 가치가 있었다 — §2.4
- 물리 스위치에서는 포트 하나 이상에 VLAN ID를 매겨 VLAN을 정하고, 그 포트에 이은 호스트가 그 VLAN의 구성원이 된다. 그렇게 **물리적 위치와 상관없이** 서버를 논리적으로 묶는다 — §2.4
- 여러 VLAN의 트래픽을 받고 보낼 수 있게 설정한 물리 스위치 포트를 **트렁크 포트**(trunking ports)라 부르고, 그런 링크를 트렁크 링크라 부른다 — §2.4, §3
- VLAN으로 나눈 무리의 트래픽은 다른 무리의 트래픽과 격리된다. 예를 들어 웹 서버·응용·데이터베이스 층마다 VLAN을 따로 두고 **층 사이의 트래픽은 방화벽 규칙으로 통제**할 수 있다.
  VLAN마다 다른 QoS 규칙도 줄 수 있다 — §2.4
- VLAN ID가 12비트라 VLAN은 4000개 남짓까지만 정할 수 있다 — §2.4.1·§2.4.2

쓰인 곳: (phase 72 step 10) `hub-switch-vlan.vlan`(물리적 위치와 상관없이 설정으로 묶는다, 브로드캐스트를 가둔다, VLAN끼리 데이터가 격리되어 VLAN마다 다른 보안 정책을 줄 수 있고 하는 일이 다른 서버들을 VLAN으로 나눠 그 사이를 규칙으로 통제한다 — §2.4), (phase 72 step 11) `hub-switch-vlan.vlan-membership`(포트에 VLAN을 정해 두면 그 포트에 이은 장치가 그 VLAN에 든다 — §2.4), `hub-switch-vlan.vlan-tagging`(여러 VLAN의 프레임을 받고 보내도록 설정한 포트가 트렁크 포트, 그런 링크가 트렁크 링크 — §2.4·§3), 문항 n048 해설

## (phase 72 step 1) Cisco — Catalyst 9200 「VLAN Configuration Guide, Cisco IOS XE 17.14.x」와 Catalyst 2960-L 「VLAN Configuration Guide, Cisco IOS Release 15.2(7)E」의 Configuring VTP
https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9200/software/release/17-14/configuration_guide/vlan/b_1714_vlan_9200_cg/configuring_vtp.html
https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960l/software/15-2_7_e/configuration_guide/vlan/b_1527e_vlan_2960l_cg/m_vlan_vtp_cg.html

시스코 스위치의 설정 가이드(제품 문서)다. VTP(VLAN Trunking Protocol)는 시스코가 만든 프로토콜이라 이 문서를 출처로 쓴다. 2026-10-28에 읽은 판: Catalyst 9200 IOS XE 17.14.x(2024-04-05 고침),
Catalyst 2960-L IOS 15.2(7)E(2020-09-17 고침). **제품과 판마다 달라질 수 있다.** VLAN·태그·트렁크의 일반 사실은 여기서 가져오지 않는다.

- VTP는 VLAN 설정이 어긋나지 않게 맞추는 2계층 메시지 프로토콜이다. VTP 도메인(VLAN 관리 도메인)은 서로 이은 장치 하나 이상으로 이루어지고, 같은 도메인의 장치는 모두 같은 도메인 이름을 써야 한다 — 9200 「Information About VTP」의 「VTP」·「VTP Domain」
- VTP 도메인의 장치는 **트렁크 포트마다** 설정 정보를 주기적으로 알린다(advertisement). 그래서 트렁크 포트가 적어도 하나 있어야 하고, VTP는 트렁크 모드 포트에서만 켤 수 있다 —
  9200 「VTP Advertisements」·「Prerequisites for VTP」·「Configuring VTP on a Per-Port Basis」
- 모드 넷: **서버**(VLAN을 만들고 고치고 지울 수 있다. 기본 모드), **클라이언트**(알림을 주고받지만 그 장치에서 VLAN을 만들거나 고치거나 지울 수 없다),
  **트랜스페어런트**(VTP에 참여하지 않는다 — 자기 VLAN 설정을 알리지 않고 받은 알림으로 맞추지도 않는다. 버전 2·3에서는 받은 알림을 트렁크로 넘겨준다),
  **off**(트랜스페어런트와 같되 받은 알림을 트렁크로 넘기지도 않는다) — 9200·2960-L 「VTP Modes」 표
- 두 문서 모두 off 모드를 특정 VTP 버전에 묶어 적지 않는다(명령 문법 `vtp mode {client | server | transparent | off}`). 「off는 버전 3에만 있다」는 이 두 문서로 확인하지 못했다 — 9200·2960-L 「VTP Modes」
- 버전은 1·2·3이 있고 기본은 버전 1이다 — 9200 「VTP Version 2」·「VTP Version 3」
- (phase 72 step 11) 9200 판을 다시 열어 확인했다(2026-10-28). 서버는 VTP 도메인 전체의 VLAN을 만들고 고치고 지울 수 있고 기본 모드다. 클라이언트는 서버처럼 트렁크로 VTP 갱신을 주고받지만
  그 장치에서 VLAN을 만들거나 고치거나 지울 수 없다. 트랜스페어런트는 VTP에 참여하지 않지만, 받은 알림을 트렁크로 넘겨준다 — 버전 1에서는 도메인 이름과 버전이 맞을 때만, 버전 2·3에서는 그대로 넘긴다.
  트랜스페어런트 모드의 장치에서는 VLAN을 만들고 고치고 지울 수 있다. off는 트랜스페어런트와 같되 알림을 트렁크로 넘기지 않는다 — 9200 「VTP Modes」·「VTP Version 2」
- (phase 72 step 11) 9200·2960-L 판 어디에도 VTP가 시스코 고유의 프로토콜이라는 문장은 없다. 그 사실은 아래 「Configure VTP on Catalyst Switches」 항목에서 가져온다

쓰인 곳: `exam-notes.md` E8, (phase 72 step 11) `hub-switch-vlan.vlan-tagging`(VTP는 VLAN 설정이 어긋나지 않게 맞추는 프로토콜이다, 같은 VTP 도메인의 스위치는 같은 도메인 이름을 쓰고 트렁크 포트로 설정을 주기적으로 알려 맞춘다, 모드 넷 — 서버(기본)·클라이언트·트랜스페어런트·off. 버전별 차이는 쓰지 않았다)

## (phase 72 step 11) Cisco — 「Configure VTP on Catalyst Switches」 (Configuration Example / Tech Note, 2026-08-18 고침)
https://www.cisco.com/c/en/us/support/docs/lan-switching/vtp/98154-conf-vlan.html

시스코 TAC가 쓴 제품 설정 예제(기술 지원 문서)다. 학습·마케팅·블로그·커뮤니티 페이지가 아니라 제품을 설정하는 법을 적은 시스코의 제품 지원 문서라서 「허용하는 출처」의 시스코 제품 문서로 본다.
위 설정 가이드 두 편에 없는 한 문장만 여기서 가져온다. VTP의 동작과 모드는 위 설정 가이드에서 가져온다.

- **VTP는 시스코 고유의 프로토콜(Cisco-proprietary protocol)이고, 시스코 Catalyst 제품군 대부분에 있다** — 「Background Information」

쓰인 곳: (phase 72 step 11) `hub-switch-vlan.vlan-tagging`(VTP는 IEEE 같은 표준 기구가 정한 표준이 아니라 시스코의 Catalyst 스위치 제품 대부분에 있는 시스코 고유의 프로토콜이다)

## (phase 72 step 4) MDN — Grammar and types, Integer literals
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#integer_literals

2026-10-28 확인. MAC 주소의 16진 표기를 이해하는 바탕만 가져온다. JavaScript 문법은 학습 범위에 넣지 않는다.

- 16진 정수 표기는 0~9와 A~F(또는 a~f)를 쓴다. A는 10, F는 15이고, 대소문자가 값에 영향을 주지 않는다 — 「Integer literals」
- 2진 표기는 0과 1만 쓴다 — 같은 절. 두 자리 16진수 = 8비트라는 묶음은 RFC 9542 §1.1의 옥텟 표기와 RFC 791 Glossary의 옥텟 정의로 뒷받침한다.

쓰인 곳: `ethernet.mac-address`(16진수의 뜻·대소문자)

## (phase 72 step 7) RFC 1748 — IEEE 802.5 MIB using SMIv2, RFC 1042 — A Standard for the Transmission of IP Datagrams over IEEE 802 Networks
https://www.rfc-editor.org/rfc/rfc1748
https://www.rfc-editor.org/rfc/rfc1042

2026-10-28 확인. RFC 1748은 Draft Standard(Standards Track)인 토큰 링 관리 MIB이고, RFC 1042는 Internet Standard(STD 43)다. CSMA/CD와 견줄 「토큰」이 무엇인지 한 구절로 쓰는 데만 가져온다.
토큰 링의 동작(토큰이 도는 방식, 모니터, 프레임 형식)은 가져오지 않는다 — 토큰 링은 뒤 주제(`network-topology`, phase 83)의 범위다.

- 토큰 링에서 스테이션은 토큰을 잡은(capturing a token) 뒤 정해 둔 최대 시간 동안 프레임을 보내도록 허락받는다(permitted to transmit) — RFC 1748 `dot5TimerHolding`의 DESCRIPTION
- IEEE 802.3은 「CSMA/CD 접근 방식(Access Method)」, IEEE 802.5는 「토큰 링 접근 방식(Token Ring Access Method)」을 정한 서로 다른 표준이다 — RFC 1042 References [3]·[5]
- IEEE 802.5 망의 패킷 최대 크기는 한 노드가 토큰을 쥐고 있을 수 있는 최대 시간에 따라 정해진다 — RFC 1042 「For IEEE 802.5」(MTU를 다룬 대목)

쓰인 곳: `hub-switch-vlan.csma-cd`(토큰을 잡은 장치가 정해 둔 시간 동안 보내도록 허락받는 방식은 CSMA/CD와 다른 매체 접근 방식), 문항 n038 해설

## (phase 72 step 8) RFC 4761 — Virtual Private LAN Service (VPLS) Using BGP for Auto-Discovery and Signaling, 4.2.1 MAC Address Learning, 4.2.2 Aging
https://www.rfc-editor.org/rfc/rfc4761

Standards Track(Proposed Standard)이다. 통신사 망 전체를 한 대의 학습 브리지처럼 보이게 하는 서비스(VPLS)를 정한 문서인데, 4.2절이 **학습 브리지가 하는 일**을 기준으로 들고
VPLS 장비도 「학습 브리지와 거의 같게」 하라고 쓴다. 여기서는 그 기준으로 든 학습 브리지의 동작만 가져온다(VPLS·BGP의 사실은 가져오지 않는다).

- 학습 브리지는 포트로 들어온 패킷의 **출발지 MAC 주소를 그 패킷이 들어온 포트와 짝지어** 배운다. 출발지 주소가 S인 패킷을 포트 P로 받은 뒤, 목적지 주소가 S인 패킷을 받으면
  포트 P로 내보내면 된다는 것을 안다 — §4.2.1
- 에이징: 학습 브리지처럼, 포트에 짝지어 둔 MAC 주소를 지우는 장치를 둔다. 그래야 그 주소의 장치가 **실제로 다른 포트 쪽으로 옮겨 가거나** 망의 구성이 바뀌어 그 주소가 새 포트로
  들어올 때 **다시 배울 수 있다**. 또 에이징은 표를 **지금 쓰이는 주소만으로 줄인다** — §4.2.2 첫 문단
- 포트 P에 짝지은 출발지 주소 S의 「나이」는 S가 P에서 **출발지로 마지막으로 보인 뒤 지난 시간**이다. 나이가 에이징 시간을 넘으면 S를 지운다. 그러니 S가 P에서 출발지로 다시 보일 때마다
  나이는 처음부터 다시 센다 — §4.2.2 둘째 문단
- 에이징 시간은 설정할 수 있게 해야 한다 — §4.2.2 셋째 문단(VPLS 장비에 대한 권고)
- 브리지는 목적지가 표에 없는 패킷을 받으면 다른 모든 포트로 내보낸다(플러딩) — §4.2.3 첫 문장

쓰인 곳: `hub-switch-vlan.mac-address-table`(학습 — 출발지 주소와 들어온 포트, 에이징 — 마지막으로 보인 뒤의 시간, 다시 보이면 처음부터 다시 셈, 지우는 까닭은 장치가 옮겨 가면 다시 배우게 하고 표를 지금 쓰이는 주소로 줄이는 것), 문항 n041 해설, (phase 72 step 9) `hub-switch-vlan.flooding-forwarding-filtering`(목적지가 표에 없으면 다른 모든 포트로 내보낸다 — §4.2.3. 에이징으로 지운 항목의 장치에게 가는 프레임도 다시 표에 없는 목적지라 그 장치를 다시 배울 때까지 플러딩된다 — §4.2.2와 §4.2.3을 함께 읽은 것), 문항 n042 해설
(phase 73 step 8) `arp.arp-request-reply`(§4.2.1 — 스위치는 들어온 프레임의 출발지 주소로 그 장치의 자리를 배워 두므로, A가 보낸 요청을 넘긴 뒤 A에게 가는 응답은 A 쪽으로만 넘긴다. §4.2.3 — 목적지가 표에 없는 프레임은 다른 모든 포트로 내보낸다)

## (phase 73) RFC 1191 — Path MTU Discovery
https://www.rfc-editor.org/rfc/rfc1191

Draft Standard(Standards Track)이고 폐기되지 않았다(rfc-editor 상태, 2026-10-29).

- 데이터그램은 출발지에서 목적지까지 경로 어디서도 나뉘지 않는 가장 큰 크기로 보내는 편이 좋고, 그 크기를 경로 MTU(PMTU)라 부른다. 경로 MTU는 경로의 각 홉 MTU 가운데 가장 작은 값이다 — §1
- 경로 MTU를 알아내는 기본 생각: 출발지는 첫 홉의 MTU를 경로 MTU로 보고 DF 비트를 켜서 보낸다. 나누지 않고는 넘길 수 없을 만큼 큰 데이터그램을 받은 라우터는 그것을 버리고,
  「단편화가 필요하다」는 코드의 ICMP 목적지 도달 불가를 돌려보낸다(ICMP는 step 1) — §2
- 호스트는 경로 MTU 추정값을 68옥텟보다 작게 줄이지 않는다 — §3
- 인터넷에서 흔한 MTU 표(표 7-1): 링크 종류마다 MTU가 다르다. 이더넷 네트워크는 1500(RFC 894), X.25 네트워크는 576이고, RFC 791이 정한 공식 최소 MTU는 68이다 — §7

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.mtu`(경로 MTU는 경로의 가장 작은 MTU, 링크마다 MTU가 다르다, 이더넷 1500·공식 최소 68 — §1·§7), `ip-protocol.fragment-fields`(DF를 켜고 보내다 너무 크면 라우터가 버리고 알린다 — 이름만, §2)

## (phase 73) RFC 6864 — Updated Specification of the IPv4 ID Field
https://www.rfc-editor.org/rfc/rfc6864

Proposed Standard(Standards Track)이고 RFC 791·RFC 1122의 식별자 칸 규정을 고쳤다.

- 식별자 칸은 단편화와 재조합 말고 다른 데 쓰지 않는다 — §4.1
- 원자 데이터그램(atomic datagram) — DF가 1이고 MF가 0이고 오프셋이 0이라 나뉘지도 않았고 나뉠 수도 없는 데이터그램 — 에서는 식별자에 뜻이 없다. 보내는 쪽은 아무 값이나 넣어도 되고,
  헤더를 보는 장치는 그 값에 기대지 않는다 — §4(정의), §4.1
- 그러니 「모든 IP 패킷에 겹치지 않는 번호를 붙인다」는 지금 규정과 맞지 않는다. 식별자는 「나뉘었거나 나뉠 수 있는 데이터그램의 조각들이 함께 갖는 값」으로 쓴다

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.fragment-fields`(식별자의 지금 뜻)

## (phase 73) RFC 2474 — Definition of the Differentiated Services Field (DS Field) in the IPv4 and IPv6 Headers, RFC 3168 — The Addition of Explicit Congestion Notification (ECN) to IP
https://www.rfc-editor.org/rfc/rfc2474
https://www.rfc-editor.org/rfc/rfc3168

둘 다 Proposed Standard(Standards Track)다. **칸의 이름과 자리만** 가져온다. DSCP 값과 ECN의 동작은 가져오지 않는다.

- DS 필드는 IPv4의 서비스 유형 칸(RFC 791)과 IPv6의 트래픽 클래스 칸의 옛 정의를 대신하는 칸이다. 앞 6비트(DSCP)로 패킷이 지나는 노드마다 받을 처리를 고른다 — RFC 2474 §3
- 그 8비트 칸의 끝 두 비트(비트 6·7)는 ECN 필드다. 혼잡이 막 시작될 때 패킷을 버리는 대신 표시해 알리는 데 쓴다. IPv4 서비스 유형 칸과 IPv6 트래픽 클래스 칸은 서로 대응하고, ECN 필드는 두 칸에서 똑같이 정의된다 — RFC 3168 §5
- (phase 77 step 3, 2026-11-09 rfc-editor.org 원문) RFC 3168은 RFC 4301·6040·8311·9768이 고쳤다(rfc-editor 상태). 이 문서가 TCP 헤더의 예약 칸에서 두 비트를 새 플래그로 정했다 — 비트 9를 **ECE**(ECN-Echo), 비트 8을 **CWR**(Congestion Window Reduced)로.
  그 결과 예약 칸은 6비트(옛 정의 — 그림 3: 예약 6비트 + URG·ACK·PSH·RST·SYN·FIN)에서 **4비트**(비트 4~7)가 되었다 — RFC 3168 §6.1, 그림 3·4
- (phase 77 step 3) 두 비트의 쓰임(TCP 끝점 사이의 신호): 혼잡을 감지한 라우터가 패킷을 버리는 대신 IP 헤더에 혼잡 표시(CE)를 하고 넘긴다 → 받은 쪽이 다음 ACK에 **ECE**를 켜서 보낸 쪽에 알린다 →
  보낸 쪽은 패킷을 잃은 것처럼 혼잡에 대응하고, 다음 세그먼트에 **CWR**을 켜서 ECE를 받고 대응했다고 알린다 — RFC 3168 §6.1. 대응하는 방식(혼잡 윈도우를 줄이는 것)은 phase 84의 몫이다

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.ipv4-header`(서비스 유형 칸의 지금 이름 — DS 필드와 ECN), `ip-protocol.ipv6-header`(트래픽 클래스의 지금 쓰임), `exam-notes.md` E9
(phase 73 step 6) `ip-protocol.ipv6-header`(트래픽 클래스 — DS 필드로 다시 정의, 앞 6비트는 처리를 고르는 값·끝 2비트는 ECN), 문항 n060 해설(트래픽 클래스는 서비스 유형 칸에 해당)
(phase 77 step 3에서 쓰일 곳) `tcp-udp.tcp-control-bits`(§6.1 — CWR·ECE의 자리와 쓰임), `tcp-udp.tcp-header`(§6.1 — 예약 칸이 6비트에서 4비트로), `exam-notes.md` E29

## (phase 73) IANA — Assigned Internet Protocol Numbers
https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml

2026-10-29에 읽은 판: 레지스트리 마지막 갱신 2026-03-09.

- 이 번호는 IPv4 헤더의 프로토콜 칸(8비트)에 넣어 다음 계층 프로토콜을 가리킨다. IPv6에서는 같은 칸을 다음 헤더 칸이라 부른다 — 레지스트리 머리글
- ICMP 1, IGMP 2, TCP 6, UDP 17, ICMPv6(IPv6-ICMP) 58 — 레지스트리
- IPv6 확장 헤더로 표시된 번호: 홉별 옵션 0, 라우팅 43, 단편화 44, ESP 50, 인증(AH) 51, 목적지 옵션 60. 59는 「다음 헤더 없음」이다 — 레지스트리의 「IPv6 Extension Header」 열
- 41은 IPv6 캡슐화다. IPv6 패킷을 IPv4 패킷에 담아 나르는 터널은 IPv4 헤더의 프로토콜 칸에 41을 넣는다 — 레지스트리, RFC 4213 §3.5

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.ipv4-header`(프로토콜 번호 TCP 6·UDP 17·ICMP 1), `ip-protocol.ipv6-header`(다음 헤더 칸은 같은 번호를 쓴다), `ip-protocol.extension-headers`(확장 헤더 번호 — 단편화 44), `ip-protocol.ipv6`(터널링 — 41은 이름만),
(phase 73 step 1에서 쓰일 곳) `icmp.icmp`(ICMP 1), `icmp.igmp`(IGMP 2), `arp.neighbor-discovery`(ICMPv6 58)
(phase 73 step 14) `icmp.igmp`(IGMP 2 — 프로토콜 칸의 값)

## (phase 73) RFC 1752 — The Recommendation for the IP Next Generation Protocol
https://www.rfc-editor.org/rfc/rfc1752

1995년의 Proposed Standard이고 폐기되지 않았다(rfc-editor 상태). IPv6를 정한 규격(RFC 8200)이 아니라 그 전의 권고라 **역사 기록으로만** 쓴다.

- IETF는 인터넷 주소 공간이 점점 모자라게 될 것이라는 예측이 나온 1990년 말에 IPv4의 뒤를 이을 프로토콜을 고르는 일을 시작했다 — §1
- 고른 다음 세대 IP(IPng)에 IANA가 버전 번호 6을 주었고, 그 프로토콜을 IPv6라 부른다 — §11.2

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.ipv6`(IETF가 주소 부족 때문에 IPv4의 다음 판을 만들었다 — RFC 8200 §1과 함께)

## (phase 73) RFC 4291 — IP Version 6 Addressing Architecture
https://www.rfc-editor.org/rfc/rfc4291

Draft Standard(Standards Track)이고 폐기되지 않았다. RFC 5952 등이 고쳤다(rfc-editor 상태, 2026-10-29).

- IPv6 주소는 인터페이스 하나나 인터페이스 묶음을 가리키는 128비트 식별자다 — §2
- 주소 종류는 셋이다 — §2
  - 유니캐스트(Unicast): 인터페이스 하나를 가리키고, 그 주소로 보낸 패킷은 그 인터페이스에 간다.
  - 애니캐스트(Anycast): 인터페이스 묶음을 가리키고, 그 주소로 보낸 패킷은 그 가운데 (라우팅으로 따져) 가장 가까운 하나에 간다.
  - 멀티캐스트(Multicast): 인터페이스 묶음을 가리키고, 그 주소로 보낸 패킷은 묶음의 모든 인터페이스에 간다.
- IPv6에는 **브로드캐스트 주소가 없다.** 그 일은 멀티캐스트 주소가 맡는다 — §2
- 모든 인터페이스는 링크 로컬 유니캐스트 주소를 적어도 하나 가져야 한다 — §2.1
- 글자로 적는 꼴 셋 — §2.2
  - 기본 꼴은 `x:x:x:x:x:x:x:x`다. 128비트를 16비트 묶음 여덟으로 나눠 묶음마다 16진수 한~네 자리로 적고 콜론으로 잇는다. 묶음 안의 앞쪽 0은 적지 않아도 되지만, 묶음마다 숫자가 적어도 하나는 있어야 한다(아래 `::` 경우는 빼고).
  - `::`는 0인 16비트 묶음 **하나 이상**을 줄인 것이고, **한 주소에 한 번만** 쓸 수 있다. 주소 앞이나 끝의 0도 줄일 수 있다(예: `::1`, `::`).
  - IPv4와 섞인 환경에서는 앞 여섯 묶음을 16진수로, 끝 32비트를 IPv4처럼 십진수 넷으로 적는 꼴(`x:x:x:x:x:x:d.d.d.d`)도 쓴다.
- `::`를 한 번만 쓰는 까닭은 이 문서에 적혀 있지 않다. 주소가 늘 묶음 여덟이고 `::`가 0 묶음 「하나 이상」을 뜻하므로, 두 번 쓰면 두 자리에 0 묶음이 몇 개씩 들었는지가 하나로 정해지지 않는다
  (예: `2001:db8::1::2`는 빠진 0 묶음 넷을 1+3, 2+2, 3+1 가운데 어느 것으로도 읽을 수 있다) — §2.2의 두 규칙에서 셈으로 나오는 것이다

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.ipv6`(주소 종류 셋, 브로드캐스트 없음 — §2), `ip-protocol.ipv6-address-notation`(§2.2 — 묶음 여덟, 앞쪽 0 생략, `::`는 한 번), `ip-protocol.slaac`(링크 로컬 주소 — §2.1)
(phase 73 step 5) `ip-protocol.ipv6`(§2 — 브로드캐스트 주소가 없고 멀티캐스트 주소가 그 일을 맡는다, 멀티캐스트는 묶음의 모든 인터페이스에 간다), 도식 `ipv6-changes`, 문항 n057 해설, 문항 n056 해설(§2.2 — 콜론으로 묶음을 잇는 꼴은 IPv6 주소의 꼴)
(phase 73 step 6) `ip-protocol.ipv6-address-notation`(§2.2 — 16비트 묶음 여덟·16진수·콜론, 앞쪽 0 생략과 묶음마다 숫자 하나는 남김, `::`는 0 묶음 하나 이상을 한 주소에 한 번만; 두 번 쓴 예 `2001:db8::1::2`는 위 셈), 도식 `ipv6-notation`, 문항 n058·n059 해설
- (phase 73 step 10) 요청 노드 멀티캐스트 주소(Solicited-Node multicast address)는 노드의 유니캐스트·애니캐스트 주소에서 계산한다 — 그 주소의 끝(하위) 24비트를 접두사 `FF02:0:0:0:0:1:FF00::/104` 뒤에 붙인 것이다. 노드는 자기 인터페이스에 정한 유니캐스트·애니캐스트 주소마다 그 요청 노드 멀티캐스트 주소를 계산해 가입해야 한다(MUST) — §2.7.1
  (rfc-editor.org 원문, 2026-10-29)

(phase 73 step 10) `arp.neighbor-discovery`(§2 — 브로드캐스트 주소가 없고 멀티캐스트가 맡는다, 멀티캐스트는 그룹의 모든 인터페이스에 간다; §2.7.1 — 요청 노드 멀티캐스트 주소는 끝 24비트로 정해지고 주소마다 그 그룹에 들어간다), 도식 `neighbor-discovery`, 문항 n069 해설

## (phase 73) RFC 5952 — A Recommendation for IPv6 Address Text Representation
https://www.rfc-editor.org/rfc/rfc5952

Proposed Standard(Standards Track)이고 RFC 4291을 고친다.

- RFC 4291은 같은 주소를 여러 꼴로 적게 허락한다 — 앞쪽 0을 남길지 뺄지, `::`로 줄일지와 어디를 줄일지, 대문자와 소문자. 그래서 같은 주소가 여러 글자로 적힌다 — §2
- 아래 권고는 시스템이 주소를 글자로 만들 때 따르고 사람도 따르기를 권한다. 받는 쪽은 RFC 4291이 허락하는 어느 꼴이든 받아들여야 한다 — §4
  - 묶음 앞쪽의 0은 **반드시 뺀다.** 0000인 묶음은 `0`으로 적는다(예: `2001:0db8::0001`이 아니라 `2001:db8::1`) — §4.1
  - `::`는 줄일 수 있는 만큼 **최대로** 쓴다 — §4.2.1
  - 0인 묶음 **하나만** 있는 곳은 `::`로 줄이지 않는다 — §4.2.2
  - 0 묶음이 이어진 곳이 여럿이면 **가장 긴 곳**을 줄이고, 길이가 같으면 **앞쪽**을 줄인다 — §4.2.3
  - 16진수 글자 a~f는 **소문자**로 적는다 — §4.3
- 끝 32비트에 IPv4 주소를 품은 특별한 주소는 십진수를 섞은 꼴로 적기를 권한다(예: `::ffff:192.0.2.1`) — §5. 이름만 쓴다
- (phase 77) 주소와 포트 번호를 글자로 함께 적는 꼴은 여러 가지다(`[2001:db8::1]:80`, `2001:db8::1 port 80` 등). IPv4도 사정이 크게 다르지 않다고 적는다. IPv6에서는 `::` 때문에 `2001:db8::1:80`처럼 쌍점으로만 이으면
  어디까지가 주소인지 모호하므로, RFC 3986의 꼴대로 주소를 대괄호로 감싸고 `:포트`를 붙이는 `[주소]:포트`를 기본으로 쓴다(SHOULD) — §6.
  (IPv4 주소는 쌍점을 쓰지 않으므로 `192.0.2.10:80`처럼 주소 뒤에 바로 `:포트`를 붙여도 모호하지 않다 — RFC 3986 §3.2·§3.2.2·§3.2.3의 꼴)

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.ipv6-address-notation`(권고 표기 — §4)
(phase 73 step 6) `ip-protocol.ipv6-address-notation`(§2 — 같은 주소가 여러 꼴로 적힌다; §4 — 앞쪽 0은 뺀다·`::`는 최대로·가장 긴 곳·같으면 앞쪽·0 묶음 하나는 줄이지 않는다·소문자, 받는 쪽은 RFC 4291이 허락하는 꼴을 모두 받는다), 문항 n058 해설(가장 긴 0 묶음을 줄이고 0 묶음 하나는 줄이지 않기를 권한다)
(phase 77에서 쓰일 곳) `ports.port-number`·`ports.client-server-ports`(§6 — 주소와 포트를 `주소:포트`로 붙여 적는 꼴. 이 phase의 예는 IPv4 문서용 주소라 `192.0.2.10:50001`처럼 쓴다)

## (phase 73) RFC 1883 — Internet Protocol, Version 6 (IPv6) Specification [폐기, RFC 2460으로 대체(RFC 2460은 다시 RFC 8200으로 대체) — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc1883

1995년의 첫 IPv6 규격이다.

- 기본 헤더의 두 번째 칸은 4비트 Priority였고, 흐름 레이블은 24비트였다. 기본 헤더는 40옥텟이다 — §3, §4.3(점보 페이로드 옵션 설명의 「IPv6 헤더 40옥텟」)
- Priority는 출발지가 자기 패킷끼리의 전달 우선순위를 정하는 값이었다. 0~7은 혼잡하면 보내는 양을 줄이는(혼잡 제어를 하는) 트래픽, 8~15는 혼잡해도 줄이지 않는 트래픽에 썼고,
  뒤쪽 범위에서는 가장 낮은 값(8)을 혼잡할 때 가장 먼저 버려져도 되는 패킷에 쓰라고 했다 — §7
- 지금 규격(RFC 8200)은 이 자리를 8비트 트래픽 클래스로, 흐름 레이블을 20비트로 정한다 — RFC 8200 §3·§7

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.ipv6-header`(트래픽 클래스의 옛 이름), `exam-notes.md` E9
(phase 73 step 6) `ip-protocol.ipv6-header`(트래픽 클래스 항목의 「자격시험은 … Priority로 묻기도 한다」 줄 — E9의 처리대로, 옛 판의 값 범위는 옮기지 않았다)

## (phase 73 step 6) RFC 6437 — IPv6 Flow Label Specification
https://www.rfc-editor.org/rfc/rfc6437

Proposed Standard(Standards Track)이고 폐기되지 않았다. RFC 3697을 폐기하고 RFC 2460(지금은 RFC 8200)의 흐름 레이블 정의를 대신한다(rfc-editor 상태, 2026-10-29). **흐름 레이블이 무엇을 표시하는지만** 가져온다. 값을 고르는 방법, 부하 분산·상태 유지 방식은 가져오지 않는다.

- 네트워크 계층에서 흐름은 한 출발지에서 한 목적지(유니캐스트·애니캐스트·멀티캐스트)로 가는 패킷들 가운데, 노드가 한 흐름으로 표시하려는 패킷의 줄이다 — §1
- 흐름 레이블 칸(20비트)은 노드가 한 흐름의 패킷들에 표시를 붙이는 데 쓴다. 값 0은 표시를 붙이지 않은 패킷이다. 패킷을 가르는 장치는 흐름 레이블·출발지 주소·목적지 주소 셋으로 패킷이 어느 흐름에 드는지 가릴 수 있다 — §2

쓰인 곳: (phase 73 step 6) `ip-protocol.ipv6-header`(흐름 레이블 항목 — 흐름의 뜻, 0은 표시하지 않은 패킷, 세 칸으로 흐름을 가린다), 문항 n060 해설

## (phase 73) RFC 4862 — IPv6 Stateless Address Autoconfiguration
https://www.rfc-editor.org/rfc/rfc4862

Draft Standard(Standards Track)이고 RFC 2462를 폐기·대체한다. RFC 7527·RFC 9762가 고쳤다(rfc-editor 상태, 2026-10-29 — RFC 9762는 라우터 알림의 접두사 정보에 P 플래그를 더한 것이라 아래 사실은 바뀌지 않는다).

- 호스트가 인터페이스를 스스로 설정하는 과정은 셋이다 — 링크 로컬 주소 만들기, 상태 비저장 주소 자동 설정으로 전역 주소 만들기, 중복 주소 검출(DAD)로 그 주소가 링크에서 겹치지 않는지 확인하기 — §1
- 상태 비저장 방식은 호스트를 손으로 설정하지 않아도 되고, 라우터 설정도 거의 필요 없고, **서버가 따로 필요 없다.** 호스트는 자기가 가진 정보와 라우터가 알리는 정보를 합쳐 주소를 만든다 —
  라우터는 링크의 서브넷을 가리키는 **접두사**를 알리고, 호스트는 서브넷 안에서 자기 인터페이스를 가리키는 **인터페이스 식별자**를 만들어, 둘을 이어 붙인다 — §1
- 라우터가 없으면 링크 로컬 주소만 만들 수 있고, 같은 링크의 노드끼리는 그것으로 통신할 수 있다 — §1
- 어느 호스트가 어떤 주소를 쓰는지 정확히 관리해야 하는 곳은 DHCPv6를 쓰고, 두 방법을 함께 쓸 수도 있다 — §1
- 순서 — §4, §5.3, §5.4, §5.5
  - 인터페이스가 켜지면 잘 알려진 링크 로컬 접두사 뒤에 인터페이스 식별자를 붙여 링크 로컬 주소를 만든다(호스트와 라우터 모두).
  - 그 주소를 쓰기 전에, 그 주소를 목표로 담은 이웃 요청(Neighbor Solicitation)을 보내 다른 노드가 이미 쓰는지 확인한다. 이미 쓰는 노드가 있으면 이웃 광고(Neighbor Advertisement)로 알려 온다.
    겹치면 자동 설정을 멈추고 손으로 설정해야 한다.
  - 그다음 호스트는 라우터 알림(Router Advertisement)을 받는다. 라우터는 알림을 주기적으로 보내고, 기다리지 않으려면 호스트가 모든 라우터 멀티캐스트 그룹으로 라우터 요청(Router Solicitation)을 보낸다.
    알림에 든 접두사 정보로 전역 주소를 만든다.
- 전역 주소는 알린 접두사(128−N비트) 뒤에 인터페이스 식별자(N비트)를 붙인 것이고, 둘의 길이를 더해 128비트가 아니면 그 접두사 정보는 쓰지 않는다 — §5.5.3 d)
- 중복 주소 검출은 상태 비저장 자동 설정·DHCPv6·손 설정 어느 쪽으로 얻었든 모든 유니캐스트 주소에 대해, 인터페이스에 붙이기 전에 한다 — §5.4
- 이 자동 설정 절차는 호스트에만 적용한다. 라우터는 다른 방법으로 설정한다(링크 로컬 주소는 라우터도 이 방법으로 만든다) — §1, §4
- 라우터 알림·라우터 요청의 형식은 RFC 4861이 정한다 — 라우터 요청 §4.1(ICMPv6 타입 133), 라우터 알림 §4.2(ICMPv6 타입 134). 이웃 탐색과 ICMPv6는 step 1에서 정리한다
- 「상태 비저장(stateless)」이라는 이름의 뜻은 이 판이 풀이하지 않는다. 옛 판(RFC 2462)의 「stateful 설정」이라는 말이 헷갈린다며 이 판은 그 자리에 DHCPv6라고만 쓴다 — Appendix C. 뜻은 아래 RFC 9915·RFC 2462 항목
- (phase 73 step 7) 용어: 링크 로컬 주소는 같은 링크에 붙은 이웃 노드에게 닿는 데 쓰는, 범위가 그 링크뿐인 주소이고 모든 인터페이스가 하나씩 갖는다. 전역 주소(global address)는 범위에 제한이 없는 주소다.
  인터페이스 식별자는 (적어도) 그 링크 안에서 겹치지 않는 인터페이스의 식별자이고, 상태 비저장 자동 설정은 이것을 접두사와 합쳐 주소를 만든다 — §2.
  라우터는 라우터 알림을 주기적으로 보내고, 호스트는 라우터 요청으로 알림을 빨리 받을 수 있다 — §4, §5.5.1

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.slaac`(§1·§4·§5 — 서버 없이 접두사 + 인터페이스 식별자, DAD, 링크 로컬 주소 먼저), `ip-protocol.ipv6`(주소 자동 설정 — RFC 8200 §1과 함께)
(phase 73 step 7) `ip-protocol.slaac`(§1 — 사람의 설정도 서버도 없이, 라우터가 알린 접두사 + 호스트가 만든 인터페이스 식별자, 라우터가 없으면 링크 로컬 주소만, DHCPv6와 함께 쓸 수 있음; §2 — 링크 로컬 주소·전역 주소(범위 제한 없음)·인터페이스 식별자; §4·§5.3~§5.5 — 링크 로컬 주소 먼저, 라우터 알림·라우터 요청, 이웃 요청·이웃 광고로 중복 주소 검출, 겹치면 자동 설정을 멈춤, 둘을 이어 128비트, 호스트에만 적용(라우터도 링크 로컬 주소는 같은 방법)), 도식 `slaac`, 문항 n062 해설

## (phase 73) RFC 9915 — Dynamic Host Configuration Protocol for IPv6 (DHCPv6)
https://www.rfc-editor.org/rfc/rfc9915

인터넷 표준(STD 102, 2026-01)이고 RFC 8415를 폐기·대체한다(rfc-editor 상태). **SLAAC와 견주는 데 필요한 것만** 가져온다. DHCPv6의 동작은 가져오지 않는다.

- DHCPv6는 노드에 네트워크 설정값·IP 주소·접두사를 나눠 주는 방법이다. 설정값만 주는 방식(stateless)도, 주소를 맡겨 주는 방식(stateful)도 있고, SLAAC를 대신하거나 함께 쓸 수 있다 — Abstract
- 주소나 접두사 없이 다른 설정값만 주면 서버가 어떤 상태도 기록해 둘 필요가 없어서, 그 방식을 「stateless DHCPv6」라 부른다 — §1

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.slaac`(「상태 비저장」의 뜻 — 주소를 누구에게 주었는지 기록하는 서버가 없다. 아래 RFC 2462와 함께)
(phase 73 step 7) `ip-protocol.slaac`(DHCPv6는 IPv6용 주소 서버, 「상태 비저장」의 뜻 — §1·Abstract)

## (phase 73) RFC 2462 — IPv6 Stateless Address Autoconfiguration [폐기, RFC 4862로 대체 — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc2462

- 옛 판은 IPv6의 주소 자동 설정을 상태 저장(stateful)과 상태 비저장(stateless) 두 방식으로 나눴다. 상태 저장 방식에서는 호스트가 **서버에서** 주소나 설정값을 받고, 서버는 **어느 주소를 어느 호스트에 주었는지 적은 데이터베이스**를 유지한다.
  상태 비저장 방식은 서버 없이 호스트가 라우터가 알린 정보와 자기 정보로 스스로 주소를 만든다 — §1

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.slaac`(「상태 비저장」의 뜻 — 지금 판 RFC 4862는 이 대목을 뺐다)
(phase 73 step 7) `ip-protocol.slaac`(주소를 나눠 주는 서버는 어느 주소를 어느 호스트에 주었는지 기록한다 — §1)

## (phase 73) RFC 4213 — Basic Transition Mechanisms for IPv6 Hosts and Routers
https://www.rfc-editor.org/rfc/rfc4213

Proposed Standard(Standards Track)이고 폐기되지 않았다.

- IPv6로 옮겨 가는 동안 IPv6 호스트·라우터가 IPv4 호스트·라우터와 함께 쓰려고 갖추는 기본 방법 둘 — §1
  - 듀얼 스택(Dual Stack, 이중 IP 계층): 호스트와 라우터가 IPv4와 IPv6를 둘 다 완전히 구현한다. 그런 노드는 IPv4 노드와는 IPv4 패킷으로, IPv6 노드와는 IPv6 패킷으로 바로 통신한다 — §1, §2
  - 설정한 터널링(Configured Tunneling): IPv6 패킷을 IPv4 헤더로 감싸 IPv4 패킷 안에 담아, 이미 있는 IPv4 라우팅 기반을 지나 나른다. 라우터와 라우터 사이, 호스트와 라우터 사이 등에 쓴다 — §1, §3
- 이 둘이 전환 방법의 전부는 아니고, 다른 방법은 다른 문서가 정한다 — §1
- 터널의 IPv4 헤더는 프로토콜 칸에 41(IPv6)을 넣는다 — §3.5

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.ipv6`(IPv4와 IPv6를 함께 쓰는 방법 — 듀얼 스택·터널링)

## (phase 73) RFC 6144 — Framework for IPv4/IPv6 Translation
https://www.rfc-editor.org/rfc/rfc6144

Informational이다.

- 듀얼 스택 말고 IPv4와 IPv6를 서로 잇는 근본적인 방법은 **터널링**과 **변환(translation)** 둘이다 — §1.1
- 터널링은 한 프로토콜을 다른 프로토콜 위로 나르는 것이라 새 프로토콜 사용자끼리는 잇지만, 듀얼 스택 호스트 없이는 새 프로토콜 사용자가 옛 프로토콜 사용자와 통신하게 하지 못한다 — §1.1
- 변환은 IPv4와 IPv6가 함께 쓰이는 동안 쓰는 중기 방법이고, 오래 쓸 방법은 아니다 — §1.1
- IETF가 가장 합리적이라고 보는 전환 모델은 RFC 4213의 것이다 — IPv6를 켜고 IPv4를 그대로 안정되게 둔 채 함께 쓰다가, 어느 쪽으로도 똑같이 통신할 수 있게 되면 IPv4를 끈다 — §1

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.ipv6`(방법 셋 — 듀얼 스택·터널링·변환, §1.1)

## (phase 73) RFC 6146 — Stateful NAT64: Network Address and Protocol Translation from IPv6 Clients to IPv4 Servers
https://www.rfc-editor.org/rfc/rfc6146

Proposed Standard(Standards Track)다. **변환의 예로 이름만** 쓴다.

- NAT64는 IPv6만 쓰는 클라이언트가 IPv4 서버에 UDP·TCP·ICMP로 접속하게 하는 변환이다. 변환기에 준 공인 IPv4 주소를 여러 IPv6 클라이언트가 함께 쓰고, DNS64와 함께 쓰면 대개 클라이언트도 서버도 고치지 않아도 된다 — Abstract

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.ipv6`(변환의 예 NAT64 — 이름만)

## (phase 73) RFC 7857 — Updates to Network Address Translation (NAT) Behavioral Requirements, RFC 8512 — A YANG Module for Network Address Translation (NAT) and Network Prefix Translation (NPT), RFC 7021 — Assessing the Impact of Carrier-Grade NAT on Network Applications
https://www.rfc-editor.org/rfc/rfc7857
https://www.rfc-editor.org/rfc/rfc8512
https://www.rfc-editor.org/rfc/rfc7021

RFC 7857은 BCP, RFC 8512는 Proposed Standard, RFC 7021은 Informational이다. **NAT44라는 이름이 무엇을 가리키는지**만 가져온다.

- NAT44는 IPv4 주소를 IPv4 주소로 바꾸는 주소 변환(Network Address Translation from IPv4 to IPv4)이다 — RFC 7857 Abstract.
  기본 NAT44는 IP 주소만 바꾸고(RFC 3022 §2.1의 기본 NAT), 포트까지 바꾸는 것은 NAPT다 — RFC 8512 §1.1
- 통신사 망에 NAT를 하나 더 두어 NAT를 두 번 거치게 하는 NAT444는 IPv6로 옮겨 가는 동안 IPv4 서비스를 이어 주는 **IPv4 확장 기술**로 소개된다 — RFC 7021 Abstract
- 허용한 출처에서 「NAT44는 IPv4–IPv6 전환 기술이 아니다」를 그대로 말하는 문장은 찾지 못했다. RFC 6144 §1.1이 IPv4와 IPv6를 잇는 방법으로 듀얼 스택·터널링·변환을 들고, NAT44는 IPv4끼리 바꾸므로 IPv6와 잇지 않는다 — 두 문서를 함께 읽은 것이다

쓰인 곳: (phase 73에서 쓰일 곳) `ip-protocol.ipv6`(NAT44는 IPv4 주소끼리 바꾸는 것이라 방법 셋에 들지 않는다 — 문항·해설에서 쓸 때)

## (phase 73) 문서용 주소와 이름 — RFC 5737, RFC 3849(RFC 9637이 고침), RFC 2606
https://www.rfc-editor.org/rfc/rfc5737
https://www.rfc-editor.org/rfc/rfc3849
https://www.rfc-editor.org/rfc/rfc9637
https://www.rfc-editor.org/rfc/rfc2606

RFC 5737·3849·9637은 Informational, RFC 2606은 BCP 32다.

- IPv4: `192.0.2.0/24`(TEST-NET-1), `198.51.100.0/24`(TEST-NET-2), `203.0.113.0/24`(TEST-NET-3)는 문서에 쓰라고 정해 둔 주소 블록이다 — RFC 5737 §3
- IPv6: `2001:db8::/32`는 문서의 예시에 쓰라고 정해 둔 유니캐스트 접두사이고, 실제로 누구에게도 할당하지 않는다. 문서 예시를 실제 망에 그대로 쓰면 주소와 라우팅이 부딪치는 문제를 막으려는 것이다 — RFC 3849 §1, §2, §4.
  RFC 9637(2024)이 문서용으로 `3fff::/20`을 더 정했다 — RFC 9637 Abstract. 이 phase는 `2001:db8::/32`만 쓴다
- 도메인: `example.com`·`example.net`·`example.org`는 IANA가 예시로 쓰라고 남겨 둔 2단계 도메인 이름이다 — RFC 2606 §3

쓰인 곳: (phase 73에서 쓰일 곳) `phases/73-network-ip-arp-icmp/guide.md` 「예시 값」 — `ip-protocol`·`arp`·`icmp`의 본문·문항·도식에 쓰는 IPv4·IPv6 주소와 도메인 이름. MAC 주소는 위 RFC 9542 항목(§2.1.4)
(phase 73 step 5) `ip-protocol.ipv4-address`(RFC 5737 §3 — `192.0.2.0`~`192.0.2.255`는 문서의 예로 쓰라고 남겨 둔 주소, 본문 예 `192.0.2.1`과 도식 `ipv4-address`), 문항 n056의 보기 주소
(phase 73 step 6) `ip-protocol.ipv6-address-notation`(RFC 3849 — 첫 두 묶음이 `2001:0db8`인 주소는 문서의 예로 쓰라고 남겨 둔 주소, 본문 예와 도식 `ipv6-notation`), 문항 n058·n059의 주소
(phase 73 step 7) `ip-protocol.slaac`(RFC 3849 — 예시 접두사 `2001:db8:0:1`과 주소 `2001:db8:0:1:1234:5678:9abc:def0`, 본문 예와 도식 `slaac`)
(phase 73 step 8) `arp.arp`·`arp.arp-request-reply`(RFC 5737 §3 — 호스트 A~D의 `192.0.2.1`~`192.0.2.4`, 본문 예와 도식 `arp-purpose`·`arp-exchange`)
(phase 74) 세 블록의 첫 옥텟은 192·198·203이라 셋 다 옛 C 클래스 범위(192~223, RFC 791 §2.3으로 계산)에 든다 — 문서용 IPv4 주소 가운데 A·B 클래스 범위의 것은 없다.
`ip-addressing`의 예는 모두 이 안에서 만든다 — 서브네팅 예 `192.0.2.0/24`를 `/26` 넷으로(`192.0.2.0`·`.64`·`.128`·`.192`, 서브넷마다 주소 64개·호스트 62개), AND 예 `192.0.2.130` AND `255.255.255.192` = `192.0.2.128`(마지막 옥텟 `10000010` AND `11000000` = `10000000`) — 계산으로 확인(2026-10-29)
(phase 77 step 2) `ports.well-known-ports`(RFC 2606 §3 — DNS 항목의 예 `www.example.com`과 웹 주소의 예 `http://www.example.com:8080/`), `ports.client-server-ports`(RFC 5737 §3 — 클라이언트 `192.0.2.10`·`192.0.2.11`, 서버 `198.51.100.10`), 문항 n174(`www.example.com`)·n175(`192.0.2.20`·`198.51.100.20`)
(phase 79 step 0에서 쓰일 곳) `phases/79-network-dns-linux-servers/guide.md` 「예시 값」 — `dns`·`linux-servers`의 본문·문항·도식에 쓰는 주소(RFC 5737)와 이름(RFC 2606 §3 — `example.com`은 문서의 예로 쓰라고 남겨 둔 **2단계 도메인 이름**이다. 「2단계 도메인」이라는 말의 근거로도 쓴다 — 강의 p342의 Second Level Domain)

## (phase 73 step 1) RFC 826 — An Ethernet Address Resolution Protocol
https://www.rfc-editor.org/rfc/rfc826

1982년 문서이고 지금은 Internet Standard다. 폐기되지 않았고 RFC 5227·RFC 5494가 고쳤다(rfc-editor 상태, 2026-10-29). 절 번호가 없어 절 제목을 적는다.

- 보내는 쪽은 라우팅으로 다음 홉의 프로토콜 주소(IP 주소)를 정하지만, 이더넷 프레임을 실제로 보내려면 받을 쪽의 48비트 이더넷 주소가 있어야 한다. 두 주소는 길이도 값도 서로 관계가 없다.
  ARP는 프로토콜 주소를 이더넷 주소로 바꾸는 데 필요한 짝을 그때그때 주고받게 하는 프로토콜이다 — Abstract, 「The Problem」
- ARP 메시지는 이더넷 프레임의 데이터 자리에 바로 실리고, 프레임의 타입 칸이 그 데이터가 ARP라고 알린다(값 0806은 위 「IANA — IEEE 802 Numbers」 항목) — 「Packet format」
- 메시지의 칸 아홉: 하드웨어 종류(16비트, 이더넷은 1), 프로토콜 종류(16비트, 이더넷에서는 이더타입 값), 하드웨어 주소 길이(8비트, 이더넷은 6), 프로토콜 주소 길이(8비트), 오퍼레이션(16비트, 요청 1·응답 2),
  보낸 쪽 하드웨어 주소, 보낸 쪽 프로토콜 주소, 대상(target) 하드웨어 주소, 대상 프로토콜 주소 — 「Definitions」, 「Packet format」.
  강의 p137의 칸 아홉과 같고, 강의가 「목적지 하드웨어·프로토콜 주소」라 부르는 것이 이 대상 칸이다. 프레임 헤더의 목적지 MAC 주소와는 다른 칸이다
- 보낼 때: ARP 모듈은 먼저 자기 표에서 그 짝을 찾고, 있으면 그 이더넷 주소를 돌려줘 바로 보내게 한다. 없으면 요청을 만든다 — 보낸 쪽 칸 둘에 자기 주소를, 대상 프로토콜 주소에 찾는 IP 주소를 넣는다.
  대상 하드웨어 주소는 알아내려는 값이므로 정해진 값을 넣지 않는다. 이 요청을 그 이더넷의 모든 스테이션에 **브로드캐스트**한다 — 「Packet Generation」
  (주소를 모르는 동안 보낼 패킷을 버리는 대목은 RFC 1122 §2.3.2.2가 「적어도 하나는 두었다가 보내라」로 바꿨다 — 위 RFC 1122 항목)
- 받을 때: 하드웨어·프로토콜 종류를 확인한 뒤, 보낸 쪽 프로토콜 주소의 짝이 이미 표에 있으면 그 하드웨어 주소를 메시지의 것으로 고친다(자기가 대상이 아니어도 고친다).
  그다음 **대상 프로토콜 주소가 자기 것인지** 본다 — 아니면 거기서 끝이다. 자기 것이면, 짝이 표에 없었을 때 보낸 쪽의 짝을 더한다. 그리고 오퍼레이션이 요청이면 보낸 쪽·대상 칸을 맞바꿔 보낸 쪽 칸에 자기 주소를 넣고,
  오퍼레이션을 응답으로 바꿔 **요청한 쪽의 하드웨어 주소로** 보낸다 — 「Packet Reception」
- 보낸 쪽의 짝을 오퍼레이션을 보기 전에 표에 넣는 것은, A가 B와 통신할 일이 있으면 B도 A와 통신할 일이 있으리라고 보기 때문이다 — 「Packet Reception」 뒤 설명
- 표의 항목에 시간 제한을 두는 문제: 이 RFC는 표 항목의 노화·시간 제한을 프로토콜 범위 밖이라 하면서, IP 주소가 다른 장치로 옮겨 가거나 잘못된 정보가 들어갈 수 있으니 영원히 남기면 안 된다고 쓰고
  시간 제한, 받은 패킷으로 시간을 다시 세기, 직접 요청을 보내 확인하기 같은 방법을 든다 — 「Related issue」. 지금 요구는 위 RFC 1122 §2.3.2.1 줄

쓰인 곳: (phase 73 step 1에서 쓰일 곳) `arp.arp`(프로토콜 주소 → 하드웨어 주소, 프레임에 바로 실린다), `arp.arp-request-reply`(요청 브로드캐스트·대상만 응답·칸 아홉·받은 쪽도 짝을 적는다·처리 순서 — [기출 2024-08-25 #17]),
`arp.arp-cache`(표를 먼저 본다, 시간 제한), `arp.arp-across-routers`(다음 홉의 주소를 바꾼다)

## (phase 73 step 1) IANA — Address Resolution Protocol (ARP) Parameters
https://www.iana.org/assignments/arp-parameters/arp-parameters.xhtml

2026-10-29에 읽은 판: 레지스트리 마지막 갱신 2023-05-19.

- 오퍼레이션 코드: 1 REQUEST, 2 REPLY(RFC 826·RFC 5227), 3 request Reverse, 4 reply Reverse(RFC 903 — RARP) — 「Operation Codes」
- 하드웨어 종류 1은 Ethernet (10Mb)이다 — 「Hardware Types」
- 프로토콜 종류 칸은 이더타입 번호를 함께 쓴다(IPv4는 0800) — 「Protocol Type」 머리 설명

쓰인 곳: (phase 73 step 1에서 쓰일 곳) `arp.arp-request-reply`(오퍼레이션 — 요청 1·응답 2), `arp.rarp`(3·4)

## (phase 73 step 1) RFC 792 — Internet Control Message Protocol
https://www.rfc-editor.org/rfc/rfc792

1981년 문서이고 Internet Standard다. 폐기되지 않았고 RFC 950·RFC 4884·RFC 6633·RFC 6918이 고쳤다(rfc-editor 상태, 2026-10-29). 절 번호가 없어 절 제목을 적는다.

- 게이트웨이(라우터)나 목적지 호스트가 출발지 호스트에 데이터그램을 처리하다 생긴 오류 같은 것을 알릴 때 쓰는 프로토콜이 ICMP다. ICMP는 IP를 상위 프로토콜처럼 이용하지만 실제로는 **IP의 일부**이고, 모든 IP 모듈이 구현해야 한다 — Introduction
- ICMP를 보내는 때의 예: 데이터그램이 목적지에 닿을 수 없을 때, 게이트웨이에 넘길 버퍼가 모자랄 때, 게이트웨이가 호스트에게 더 짧은 경로로 보내라고 알릴 때 — Introduction
- 제어 메시지의 목적은 통신 환경의 문제를 알리는 것이지 **IP를 신뢰성 있게 만드는 것이 아니다**. ICMP가 있어도 데이터그램이 전달되거나 제어 메시지가 돌아온다는 보장은 없고, 잃은 데이터그램이 아무 알림 없이 사라질 수도 있다.
  신뢰성 있는 통신이 필요하면 IP를 쓰는 상위 프로토콜이 스스로 갖춘다 — Introduction(강의 p158이 가리키는 대목)
- 메시지에 대한 메시지가 끝없이 이어지지 않도록 ICMP 메시지에 대해서는 ICMP 메시지를 보내지 않고, 조각난 데이터그램은 첫 조각(오프셋 0)의 오류만 알린다 — Introduction.
  지금 규칙은 RFC 1122 §3.2.2가 「ICMP **오류** 메시지에 대해서는 오류 메시지를 보내지 않는다」로 정리했다(위 RFC 1122 항목)
- ICMP 메시지는 기본 IP 헤더에 담겨 가고 IP 헤더의 프로토콜 값은 1이다. 데이터 부분의 첫 옥텟이 타입 칸이고, 그 값이 나머지 형식을 정한다 — 「Message Formats」
- ICMP 메시지를 싣는 IP 헤더의 TTL 칸은 평소대로 쓴다(처리하는 곳마다 줄어든다). ICMP 메시지 자신에는 TTL 칸이 없다 — 앞머리는 타입(8비트)·코드(8비트)·체크섬(16비트)이고 그 뒤는 타입마다 다르다 —
  「Message Formats」과 각 메시지 형식 그림. 체크섬은 타입 칸부터 ICMP 메시지 전체를 덮는다 — 각 메시지의 「Checksum」
- 목적지 도달 불가(타입 3): 코드 0 네트워크 도달 불가, 1 호스트 도달 불가, 2 프로토콜 도달 불가, 3 포트 도달 불가, 4 단편화가 필요한데 DF가 켜짐, 5 소스 라우트 실패.
  게이트웨이는 라우팅 표로 보아 목적지 네트워크에 갈 수 없을 때, 목적지 호스트는 지정된 프로토콜 모듈이나 포트가 동작하지 않아 넘겨줄 수 없을 때 보낸다. DF가 켜져 있어 나눌 수 없는 데이터그램은 게이트웨이가 버리고 이 메시지를 보낼 수 있다.
  **0·1·4·5는 게이트웨이가, 2·3은 호스트가 보낸다.** 메시지에는 원래 데이터그램의 IP 헤더와 데이터 앞 64비트를 담아, 출발지가 어느 통신의 일인지 맞춰 보게 한다(상위 프로토콜의 포트 번호가 그 64비트 안에 있다고 본다) — 「Destination Unreachable Message」
- 시간 초과(타입 11): 코드 0 전송 중 TTL 초과 — 데이터그램을 처리하던 게이트웨이가 TTL이 0이면 그 데이터그램을 버리고 출발지에 알릴 수 있다. 코드 1 조각 재조합 시간 초과 — 조각을 다 모으지 못한 채 기다리는 시간이 지난 호스트가 그 데이터그램을 버리고 알릴 수 있다
  (첫 조각을 받지 못했으면 보내지 않아도 된다). **0은 게이트웨이가, 1은 호스트가 보낸다** — 「Time Exceeded Message」
- 매개변수 문제(타입 12): 헤더 매개변수에 문제가 있어 처리를 마칠 수 없는 데이터그램을 버린 게이트웨이나 호스트가 출발지에 알린다 — 「Parameter Problem Message」
- 리다이렉트(타입 5): 데이터그램을 받은 게이트웨이가 다음 게이트웨이를 찾아보니 그 게이트웨이가 출발지 호스트와 같은 네트워크에 있으면, 그 목적지로 가는 데이터그램은 그 게이트웨이로 바로 보내라고 호스트에 알린다. 원래 데이터그램은 그대로 목적지로 넘긴다 — 「Redirect Message」
- 에코(타입 8)·에코 응답(타입 0): 코드 0이다. 에코 응답은 요청의 출발지·목적지 주소를 맞바꾸고 타입을 0으로 바꾸고 체크섬을 다시 계산한 것이다. 에코로 받은 데이터는 에코 응답에 그대로 돌려보낸다.
  식별자와 순서 번호는 보낸 쪽이 응답을 요청과 짝짓는 데 쓴다 — 예를 들어 식별자는 TCP·UDP의 포트처럼 한 세션을 가리키고, 순서 번호는 요청마다 하나씩 늘린다. 응답하는 쪽은 같은 값을 돌려준다 — 「Echo or Echo Reply Message」
- 메시지 타입 요약: 0 에코 응답, 3 목적지 도달 불가, 4 발신지 억제, 5 리다이렉트, 8 에코, 11 시간 초과, 12 매개변수 문제, 13 타임스탬프, 14 타임스탬프 응답, 15 정보 요청, 16 정보 응답 — 「Summary of Message Types」. 지금의 상태(폐기 여부)는 아래 IANA 항목
- (phase 73 step 12, 2026-10-29 rfc-editor.org 원문) 발신지 억제(타입 4)는 데이터그램을 처리할 버퍼가 모자란 게이트웨이(라우터)나 목적지 호스트가, 출발지 호스트에게 인터넷으로 보내는 속도를 줄여 달라고 요청하는 메시지였다(지금은 폐기 — 아래 RFC 6633 항목) — 「Source Quench Message」

쓰인 곳: 강의 수정 이력 L34, (phase 73 step 1에서 쓰일 곳) `icmp.icmp`(IP의 일부·프로토콜 1·신뢰성을 만들지 않는다·TTL 칸 없음), `icmp.icmp-message`(타입·코드·체크섬, 타입 번호), `icmp.destination-unreachable`(코드 0~5와 보내는 쪽, 원래 헤더 + 64비트),
`icmp.time-exceeded`(코드 0·1과 보내는 쪽), `icmp.echo`(그대로 돌려보낸다, 식별자·순서 번호), `exam-notes.md` E11·E12·E13
(phase 73 step 11) `icmp.icmp`(Introduction — 라우터나 목적지 호스트가 출발지에 알린다, IP의 일부이고 모든 IP 모듈이 구현한다, IP를 믿을 수 있게 만들지 않고 알림이 꼭 돌아온다는 보장도 없다, 신뢰성은 상위 프로토콜이 갖춘다; 「Message Formats」 — 프로토콜 값 1, ICMP 메시지에는 TTL 칸이 없다; 「Destination Unreachable Message」 — 라우터가 목적지 네트워크로 갈 수 없을 때; 「Echo or Echo Reply Message」 — 받은 쪽이 응답을 돌려보낸다), 문항 n070·n071 해설, 도식 `icmp-feedback`
(phase 73 step 12) `icmp.icmp-message`(「Message Formats」 — 타입·코드·체크섬 뒤는 타입마다 다르고 받은 쪽은 타입부터 읽는다; 각 메시지 — 에코·에코 응답 코드 0, 리다이렉트는 원래 데이터그램을 그대로 넘긴다, 시간 초과 코드 0; 「Source Quench Message」 — 보내는 속도를 줄여 달라는 요청), `icmp.destination-unreachable`(코드 0~4, 0·1·4는 게이트웨이가·2·3은 호스트가 보낸다, 원래 IP 헤더와 데이터 앞 64비트를 담고 포트 번호가 그 안에 있다고 본다, DF가 켜져 나눌 수 없는 데이터그램은 게이트웨이가 버린다), 문항 n072·n073·n074 해설, 도식 `icmp-message`·`destination-unreachable`
(phase 73 step 13) `icmp.time-exceeded`(타입 11·코드 0/1, 보내는 쪽, 첫 조각이 없으면 알리지 않아도 됨), `icmp.echo`(타입 8/0·코드 0, 데이터·식별자·순서 번호 유지, 주소 교환·체크섬 재계산), n075·n076 해설, `traceroute`·`echo` 도식. 2026-10-29 원문의 「Time Exceeded Message」·「Echo or Echo Reply Message」를 다시 확인했다.
(phase 73 step 14) `icmp.ping`(Introduction — ICMP는 문제를 알릴 뿐 IP를 믿을 수 있게 만들지 않는다: ping은 문제를 고치지 않는다; 「Echo or Echo Reply Message」 — 식별자·순서 번호로 응답을 요청과 짝짓는다: 어느 요청의 응답이 오지 않았는지 안다), 문항 n077 해설, 도식 `ping-result`

## (phase 73 step 1) IANA — Internet Control Message Protocol (ICMP) Parameters
https://www.iana.org/assignments/icmp-parameters/icmp-parameters.xhtml

2026-10-29에 읽은 판: 레지스트리 마지막 갱신 2026-01-05.

- 타입: 0 Echo Reply, 3 Destination Unreachable, 4 Source Quench(**Deprecated** — RFC 6633), 5 Redirect, 8 Echo, 9 Router Advertisement·10 Router Solicitation(RFC 1256), 11 Time Exceeded, 12 Parameter Problem,
  13 Timestamp·14 Timestamp Reply(폐기 표시 없음), 15·16 Information Request/Reply와 17·18 Address Mask Request/Reply(**Deprecated** — RFC 6918). 6과 30~39도 Deprecated다 — 「ICMP Type Numbers」
- IP 주소가 겹쳤다(중복됐다)는 것을 알리는 ICMP 타입은 이 레지스트리에 없다. IPv4 주소가 겹치는지는 ARP로 확인한다(아래 RFC 5227 항목) — 「ICMP Type Numbers」
- 코드: 타입 3 — 0 Net Unreachable, 1 Host Unreachable, 2 Protocol Unreachable, 3 Port Unreachable, 4 Fragmentation Needed and Don't Fragment was Set, 5 Source Route Failed(6~15는 뒤에 더한 코드).
  타입 11 — 0 Time to Live exceeded in Transit, 1 Fragment Reassembly Time Exceeded. 타입 5 — 0~3(네트워크·호스트, 서비스 유형별). 타입 9 — 0 보통의 라우터 광고, 16 일반 트래픽을 넘기지 않는 라우터 — 「Codes」 하위 레지스트리

쓰인 곳: (phase 73 step 1에서 쓰일 곳) `icmp.icmp-message`(지금 쓰는 타입과 폐기된 타입, 「IP 주소 중복」은 ICMP 메시지가 아니다 — [기출 2024-11-03 #6]), `icmp.destination-unreachable`(코드 0~4), `icmp.time-exceeded`(코드 0·1), `exam-notes.md` E13
(phase 73 step 12) `icmp.icmp-message`(타입 0·3·5·8·9·11, 4·17은 폐기, IP 주소 중복을 알리는 타입은 없다), `icmp.destination-unreachable`(코드 0~4와 그 뒤에 더한 코드), 문항 n072·n073·n074 해설, 도식 `icmp-message`·`destination-unreachable`

## (phase 73 step 1) RFC 6633 — Deprecation of ICMP Source Quench Messages, RFC 6918 — Formally Deprecating Some ICMPv4 Message Types
https://www.rfc-editor.org/rfc/rfc6633
https://www.rfc-editor.org/rfc/rfc6918

둘 다 Proposed Standard이고 폐기되지 않았다(rfc-editor 상태, 2026-10-29).

- 발신지 억제(타입 4, 코드 0)는 혼잡 제어의 수단으로 정한 메시지였다. RFC 1812가 이미 라우터에게 혼잡 때문에 보내지 말라고 했고, 효과가 없고 공격에 쓰일 수 있어 RFC 6633이 정식으로 폐기했다.
  호스트는 보내지 않고(MUST NOT) 받으면 버려도 되며, TCP는 받으면 버리고, 라우터는 무시한다. TCP는 이 메시지에 기대지 않는 자기 혼잡 제어가 있다. ICMPv6에는 발신지 억제가 없다 — RFC 6633 Abstract, §2, §3, §4
- 실제로 더는 쓰이지 않는 ICMPv4 타입을 RFC 6918이 정식으로 폐기했다. 정보 요청·응답(15·16)과 주소 마스크 요청·응답(17·18 — 서브넷 마스크를 얻으려던 것)은 호스트 설정용이었는데 DHCP 같은 다른 방법이 대신했다 — RFC 6918 §2.2~§2.5
- 타입 30(Traceroute, RFC 1393)도 널리 쓰이지 않아 폐기됐고, RFC 1393 자체도 Historic이 됐다(RFC 6814) — RFC 6918 §2.6. 이것은 IP 옵션을 쓰려던 다른 방법이고, 지금의 traceroute·tracert 명령(TTL을 늘려 시간 초과를 받는 방법)과 다르다 —
  명령의 근거는 위 「Linux man-pages」·「Microsoft Learn」 항목

쓰인 곳: (phase 73 step 1에서 쓰일 곳) `icmp.icmp-message`(4·15~18은 폐기), `exam-notes.md` E13
(phase 73 step 12) `icmp.icmp-message`(발신지 억제는 혼잡 제어의 수단이었고 효과가 없고 공격에 쓰일 수 있어 폐기 — RFC 6633, 주소 마스크 요청은 서브넷 마스크를 얻으려던 것이고 DHCP 같은 방법이 대신해 폐기 — RFC 6918)

## (phase 73 step 1) RFC 1256 — ICMP Router Discovery Messages
https://www.rfc-editor.org/rfc/rfc1256

Proposed Standard이고 폐기되지 않았다(rfc-editor 상태, 2026-10-29).

- ICMP를 넓혀, 멀티캐스트·브로드캐스트 네트워크에 붙은 호스트가 이웃 라우터의 IP 주소를 알아내게 한다 — Abstract
- 라우터는 자기 인터페이스의 IP 주소를 알리는 **라우터 광고(타입 9, 코드 0)**를 주기적으로 멀티캐스트하고, 호스트는 그것을 들어 이웃 라우터를 안다. 켜질 때 다음 광고를 기다리지 않으려고 호스트가 **라우터 요청(타입 10)**을 보낼 수 있다 — §2, §3
- 이 메시지들은 라우팅 프로토콜이 아니다 — 라우터가 있다는 것만 알리고, 어떤 목적지에 어느 라우터가 가장 좋은지는 알리지 않는다(그것은 ICMP 리다이렉트가 알린다) — §2

쓰인 곳: (phase 73 step 1에서 쓰일 곳) `icmp.icmp-message`(타입 9 — 강의 p154 「라우터가 호스트에게 자신을 알림」은 맞다)
(phase 73 step 12) `icmp.icmp-message`(§2·§3 — 라우터가 자기 IP 주소를 주기적으로 알리고 호스트가 그것으로 이웃 라우터를 안다), 문항 n072 해설

## (phase 73 step 1) RFC 4861 — Neighbor Discovery for IP version 6 (IPv6)
https://www.rfc-editor.org/rfc/rfc4861

Draft Standard이고 RFC 2461을 폐기·대체한다. 폐기되지 않았고 RFC 9762 등 여러 RFC가 고쳤다(rfc-editor 상태, 2026-10-29). 고친 RFC들의 내용은 읽지 않았다 — 아래 줄은 RFC 4861 본문이 말하는 것이다.

- IPv6 노드(호스트와 라우터)는 **이웃 탐색(Neighbor Discovery, ND)**으로 같은 링크에 있는 이웃의 링크 계층 주소를 알아내고, 값이 틀려진 캐시를 빨리 지운다. 호스트는 이것으로 이웃 라우터도 찾고, 노드들은 이웃에 아직 닿는지 살핀다 — §1
- ND가 푸는 문제: 라우터 찾기, 접두사 찾기, 매개변수 찾기, 주소 자동 설정, 주소 결정(IP 주소만 아는 같은 링크 목적지의 링크 계층 주소 알아내기), 다음 홉 정하기, 이웃 도달 불가 감지, 중복 주소 검출, 리다이렉트 — §3
- ND의 ICMP 메시지는 다섯이다 — 라우터 요청(133)·라우터 광고(134), 이웃 요청(Neighbor Solicitation, 135)·이웃 광고(Neighbor Advertisement, 136), 리다이렉트(137). 번호는 ICMPv6 타입이다 — §3, §4.1~§4.5, 아래 IANA ICMPv6 레지스트리
- 주소 결정: 노드는 찾는 주소(대상 주소)에 대응하는 **요청 노드 멀티캐스트 주소(solicited-node multicast address)**로 이웃 요청을 보내 대상에게 링크 계층 주소를 묻고, 대상은 **유니캐스트 이웃 광고**로 자기 링크 계층 주소를 답한다.
  요청에 자기 링크 계층 주소를 담으므로 한 번 주고받으면 양쪽이 서로의 주소를 안다 — §3, §4.3, §4.4
- 이웃 요청은 주소를 결정할 때는 멀티캐스트로, 캐시에 있는 이웃에 아직 닿는지 확인할 때는 유니캐스트로 보낸다. 중복 주소 검출에도 쓴다(RFC 4862) — §3, §4.3
- 주소 결정은 같은 링크에 있다고 판단한 주소에, 그 링크 계층 주소를 모를 때만 하고, 멀티캐스트 주소에는 하지 않는다 — §7.2
- ND는 IPv4의 ARP, ICMP 라우터 찾기(RFC 1256), ICMP 리다이렉트를 합친 것에 해당한다. 주소 결정 요청은 2^24개의 멀티캐스트 주소로 흩어져, 대상이 아닌 노드가 덜 방해받는다 — §3.1

쓰인 곳: (phase 73 step 1에서 쓰일 곳) `arp.neighbor-discovery`(ARP 대신 이웃 요청·광고, ICMPv6 메시지, 멀티캐스트로 묻고 유니캐스트로 답한다 — [기출 2025-08-24 #3]), `ip-protocol.slaac`(라우터 요청 133·라우터 광고 134 — 위 RFC 4862 항목이 가리킨 곳), `icmp.icmp`(ICMPv6가 이웃 탐색도 맡는다)
(phase 73 step 7) `ip-protocol.slaac`(라우터 알림·라우터 요청·이웃 요청·이웃 광고가 ICMPv6 메시지라는 것 — §3, 타입 번호는 쓰지 않았다)
- (phase 73 step 10) 링크(link)는 노드들이 링크 계층, 곧 IP 바로 아래 계층에서 통신할 수 있는 수단이나 매체다(예: 이더넷). 이웃(neighbors)은 같은 링크에 이어진 노드들이다 — §2.1
- (phase 73 step 10) 요청 노드 멀티캐스트 주소는 요청 대상 주소에서 계산하는 링크 로컬 범위의 멀티캐스트 주소다 — §2.3(계산법은 RFC 4291). 멀티캐스트를 쓰는 인터페이스가 켜지면 노드는 그 인터페이스에 정한 IP 주소마다 요청 노드 멀티캐스트 주소에 가입해야 한다(MUST) — §7.2.1
- (phase 73 step 10) 주소 결정용 멀티캐스트는 약 1,600만(2^24) 개의 멀티캐스트 주소로 흩어지므로 대상이 아닌 노드가 이 일로 방해받는 일이 크게 준다 — §3.1(위 줄과 같은 절, 원문 다시 확인)
  (rfc-editor.org 원문, 2026-10-29)
(phase 73 step 10) `arp.neighbor-discovery`(§1 — 이웃의 링크 계층 주소를 알아낸다, 라우터 찾기·이웃에 닿는지 살피기; §2.1 — 링크·이웃; §3 — 이웃 요청은 대상의 요청 노드 멀티캐스트 주소로, 이웃 광고는 유니캐스트로, 요청에 보낸 쪽 링크 계층 주소를 담아 양쪽이 서로의 주소를 안다, 확인할 때는 유니캐스트, 중복 주소 검출, 라우터 알림도 ND 메시지; §3.1 — ARP 등을 합친 것, 2^24로 흩어짐; §7.2.1 — 주소마다 가입), 도식 `neighbor-discovery`, 문항 n069 해설

## (phase 73 step 1) RFC 4443 — Internet Control Message Protocol (ICMPv6) for the Internet Protocol Version 6 (IPv6) Specification, IANA — ICMPv6 Parameters
https://www.rfc-editor.org/rfc/rfc4443
https://www.iana.org/assignments/icmpv6-parameters/icmpv6-parameters.xhtml

RFC 4443은 Internet Standard이고 RFC 2463을 폐기·대체한다. RFC 4884가 고쳤다(rfc-editor 상태, 2026-10-29). IANA 레지스트리는 2026-06-09판을 읽었다.

- IPv6는 IPv4용 ICMP(RFC 792)를 몇 가지 고쳐 쓰고, 그것을 **ICMPv6**라 부른다. 바로 앞 헤더의 다음 헤더 값 58로 가리킨다(IPv4 ICMP를 가리키는 값과 다르다) — §1, §2.1
- 앞머리는 타입 8비트·코드 8비트·체크섬 16비트로, IPv4 ICMP와 같은 꼴이다 — §2.1
- 메시지는 오류 메시지(타입 0~127)와 정보 메시지(128~255) 두 갈래다. 오류: 1 목적지 도달 불가, 2 패킷이 너무 큼, 3 시간 초과, 4 매개변수 문제. 정보: 128 에코 요청, 129 에코 응답 — §2.1
- 이웃 탐색 메시지 같은 다른 ICMPv6 메시지는 다른 문서가 더한다 — §1. 레지스트리에서 133~137이 RFC 4861의 ND 메시지다 — IANA 「ICMPv6 "type" Numbers」

쓰인 곳: (phase 73 step 1에서 쓰일 곳) `arp.neighbor-discovery`(ICMPv6의 한 줄 풀이), `icmp.icmp`(IPv6용은 ICMPv6)
- (phase 73 step 10) ICMPv6는 IPv6 노드가 패킷을 처리하다 생긴 오류를 알리고, 진단(ICMPv6 「ping」) 같은 다른 인터넷 계층 기능을 하는 데 쓴다. IPv6의 한 부분이라 모든 IPv6 노드가 구현해야 한다 — §1 (rfc-editor.org 원문, 2026-10-29)
(phase 73 step 10) `arp.neighbor-discovery`(§1 — 오류를 알리거나 네트워크 상태를 알아보는 메시지, 이웃 탐색 메시지는 다른 문서가 더한 ICMPv6 메시지; §2.1 — 다음 헤더 58로 가리키므로 IPv6 패킷에 담겨 간다), 문항 n069 해설
(phase 73 step 11) `icmp.icmp`(§1 — IPv6에 맞게 고친 ICMPv6, 오류를 알리고 진단하는 데 쓴다; 이웃 탐색 메시지도 ICMPv6 메시지다 — RFC 4861 항목)

## (phase 73 step 1) RFC 951 — Bootstrap Protocol (BOOTP), RFC 2131 — Dynamic Host Configuration Protocol
https://www.rfc-editor.org/rfc/rfc951
https://www.rfc-editor.org/rfc/rfc2131

둘 다 Draft Standard이고 폐기되지 않았다(rfc-editor 상태, 2026-10-29). **RARP와의 관계만** 가져온다. BOOTP·DHCP의 동작은 가져오지 않는다.

- BOOTP는 디스크 없는 클라이언트가 IP/UDP 위에서 자기 IP 주소 등을 알아내게 하는 부트스트랩 프로토콜이다 — RFC 951 §2
- RARP는 하드웨어 주소를 아는 클라이언트가 자기 IP 주소를 알아내게 하려고 먼저 나온 프로토콜이지만, IP/UDP가 아니라 하드웨어 링크 수준의 프로토콜이라 커널이나 드라이버를 고쳐야 쓸 수 있었다. BOOTP는 그 「하드웨어 주소로 IP 주소 찾기」를 하면서 다른 기능도 준다 — RFC 951 §6
- DHCP는 BOOTP를 바탕으로 만들었고, 다시 쓸 수 있는 주소를 자동으로 나눠 주는 기능과 설정 선택지를 더했다 — RFC 2131 Abstract
- 「RARP는 지금 쓰이지 않는다」 또는 「DHCP가 RARP를 대체했다」를 그대로 말하는 문장은 허용한 출처에서 찾지 못했다(RFC 903·951·2131·1122 전문 검색). 본문은 위 세 사실과 RFC 1122 §3.2.2.7(RARP와 BOOTP가 호스트가 자기 IP 주소를 알아내는 더 나은 방법)까지만 쓴다

쓰인 곳: (phase 73 step 1에서 쓰일 곳) `arp.rarp`(BOOTP가 같은 일을 IP 위에서 하려고 나왔고, DHCP는 BOOTP를 바탕으로 한다 — [기출 2024-02-25 #13]의 맞는 보기와 어긋나지 않는다)
(phase 73 step 10) `arp.rarp`(RFC 951 §6 — RARP가 먼저 나왔고 링크 수준이라 커널·드라이버를 고쳐야 했으며, BOOTP가 같은 일을 IP·UDP 위에서 다른 기능과 함께 한다; RFC 2131 Abstract — DHCP는 BOOTP를 바탕으로 다시 쓸 수 있는 주소를 자동으로 나눠 준다; RFC 1122 §3.2.2.7 — RARP와 BOOTP). 「RARP는 지금 쓰이지 않는다」는 쓰지 않았다
(phase 77 step 7) `tcp-udp.udp`(RFC 2131 Abstract·§4.1 — DHCP는 호스트에 설정을 나눠 주고 UDP를 쓴다)

위 머리의 「RARP와의 관계만 가져온다」는 phase 73의 기록이다. 아래 「(phase 74 step 5)」 줄은 `ip-address-types`의 DHCP 개념이 쓸 **DHCP의 동작**을 더한다(RFC 2131 원문을 다시 내려받아 읽었다, 2026-10-29).
RFC 2131은 Draft Standard이고 RFC 1541을 대체했으며 RFC 3396·4361·5494·6842가 고쳤다(rfc-editor 상태).

- (phase 74 step 5) DHCP는 인터넷 호스트에 설정 값을 주는 프로토콜이고 두 부분으로 이루어진다 — DHCP 서버가 호스트마다의 설정 값을 전하는 프로토콜과, 호스트에 네트워크 주소를 배정하는 방법이다.
  클라이언트·서버 모델이고, 서버는 주소를 배정하고 설정 값을 전한다. 관리자가 설정하지 않은 호스트는 DHCP 서버 노릇을 하지 않는 것이 좋다 — RFC 2131 §1
- (phase 74 step 5) **주소를 배정하는 방식 셋**: 자동 할당(automatic allocation) — 클라이언트에 영구 주소를 준다. 동적 할당(dynamic allocation) — 정한 기간 동안(또는 클라이언트가 돌려줄 때까지) 준다.
  수동 할당(manual allocation) — 관리자가 정한 주소를 DHCP는 전하기만 한다. 한 네트워크가 관리자 정책에 따라 하나 이상을 쓴다 — RFC 2131 §1
- (phase 74 step 5) 동적 할당만이 필요 없어진 주소를 자동으로 다시 쓴다. 그래서 잠깐만 네트워크에 이어지는 클라이언트나, 영구 주소가 필요 없는 클라이언트들이 적은 주소 묶음을 나눠 쓸 때 특히 쓸모 있다.
  수동 할당은 호스트에 손으로 주소를 넣는 실수를 없애려고 쓴다 — RFC 2131 §1
- (phase 74 step 5) **임대(lease)**: 주소를 배정해 둔 기간이다. 그 기간 안에는 그 주소를 다른 클라이언트에 다시 주지 않음을 보장하고, 클라이언트는 다시 요청해 기간을 늘릴 수 있으며, 필요 없어지면 서버에 돌려줄 수 있다. 무한 임대를 요청하면 영구 배정이 된다 — RFC 2131 §2.2.
  BOOTP와 다른 점 둘은 정한 기간의 임대로 주소를 차례로 여러 클라이언트에 다시 줄 수 있다는 것과, 클라이언트가 동작에 필요한 IP 설정을 모두 받을 수 있다는 것이다 — RFC 2131 §2
- (phase 74 step 5) **메시지**(Table 2): DHCPDISCOVER — 클라이언트가 쓸 수 있는 서버를 찾으려고 브로드캐스트한다. DHCPOFFER — 서버가 DISCOVER에 답해 설정 값을 제안한다. DHCPREQUEST — 클라이언트가 서버들에게 보내 한 서버의 제안을 요청하고 다른 서버들의 제안은 암묵적으로 거절하거나,
  재부팅 뒤 전에 받은 주소가 맞는지 확인하거나, 임대를 늘린다. DHCPACK — 서버가 확정한 주소를 포함한 설정 값을 클라이언트에 보낸다. DHCPNAK — 클라이언트가 아는 주소가 틀렸거나(예: 다른 서브넷으로 옮겼다) 임대가 끝났음을 알린다.
  DHCPDECLINE — 받은 주소를 이미 누가 쓴다고 클라이언트가 알린다. DHCPRELEASE — 클라이언트가 주소를 돌려주고 남은 임대를 취소한다. DHCPINFORM — 주소는 이미 있고 다른 설정만 묻는다 — RFC 2131 §3.1 Table 2
- (phase 74 step 5) **처음 주소를 받는 차례** — ① 클라이언트가 자기 물리 서브넷에 DHCPDISCOVER를 브로드캐스트한다(BOOTP 중계 에이전트가 같은 서브넷에 없는 서버로 넘겨줄 수 있다). ② 서버마다 줄 수 있는 주소와 설정을 담은 DHCPOFFER로 답할 수 있다.
  ③ 클라이언트는 받은 제안 가운데 하나를 골라, 고른 서버를 가리키는 서버 식별자(server identifier) 옵션을 담은 DHCPREQUEST를 **브로드캐스트**한다. ④ 고르지 않은 서버들은 그 REQUEST를 자기 제안이 거절됐다는 알림으로 받고, 고른 서버는 배정을 저장한 뒤 DHCPACK을 보낸다.
  ⑤ 클라이언트는 ACK를 받고 (예: ARP로) 마지막 확인을 한 뒤 설정을 마친다 — RFC 2131 §3.1의 1~5와 Figure 3. OFFER가 하나도 오지 않으면 DISCOVER를 다시 보낸다 — §3.1의 3
- (phase 74 step 5) **주소**: 주소를 받기 전의 클라이언트가 브로드캐스트하는 메시지는 IP 헤더의 출발지 주소가 0(`0.0.0.0`)이다 — RFC 2131 §4.1. DHCPDISCOVER는 지역 하드웨어 브로드캐스트 주소로, IP 목적지 `0xffffffff`(`255.255.255.255`)와 서버 포트로 보낸다 — §4.4.1.
  DHCPREQUEST도 DISCOVER와 같은 IP 브로드캐스트 주소로 보낸다 — §3.1의 3
- (phase 74 step 5) 서버의 OFFER·ACK는 클라이언트에 바로 보낼 때(중계 에이전트가 없을 때), 클라이언트가 BROADCAST 비트를 켰으면 `0xffffffff`로 브로드캐스트하고 껐으면 클라이언트의 하드웨어 주소와 줄 주소(yiaddr)로 유니캐스트한다.
  주소를 받기 전에는 유니캐스트를 받지 못하는 클라이언트가 그 비트를 켠다 — RFC 2131 §4.1. 그러니 OFFER·ACK는 브로드캐스트일 수도 유니캐스트일 수도 있다(중계 에이전트를 거치지 않으면 DHCPNAK은 늘 브로드캐스트 — §4.1)
- (phase 74 step 5) **포트**: DHCP는 UDP를 쓰고, 클라이언트 → 서버 메시지는 서버 포트 67로, 서버 → 클라이언트 메시지는 클라이언트 포트 68로 보낸다 — RFC 2131 §4.1(포트 번호의 IANA 이름은 아래 「(phase 74 step 5) IANA — Service Name and Transport Protocol Port Number Registry」 항목)
- (phase 74 step 5) **갱신**: 클라이언트는 두 시각 T1·T2를 둔다. T1(기본값 임대 기간의 0.5)이 되면 주소를 준 서버에게 **유니캐스트로** DHCPREQUEST를 보내 임대를 늘린다(RENEWING). T2(기본값 0.875)까지 ACK가 없으면 **브로드캐스트로** DHCPREQUEST를 보내 아무 서버에게나 늘려 달라고 한다(REBINDING).
  T1 전에 늘려 달라고 해도 된다(MAY). ACK 없이 임대가 끝나면 그 주소로 하던 네트워크 처리를 곧 멈추고 처음부터 주소를 다시 받는다 — RFC 2131 §4.4.5. 필요 없어진 주소는 DHCPRELEASE로 돌려준다 — §4.4.6
- (phase 82 step 12, 2026-11-20 rfc-editor.org 텍스트판을 IPv4로 다시 받아 읽음 — 둘 다 Draft Standard 그대로) **네트워크 부팅의 두 단계**: BOOTP는 디스크 없는 클라이언트가 자기 IP 주소, 서버의 주소, **메모리에 올려 실행할 파일의 이름**을 알아내게 하는 프로토콜이다.
  부팅은 두 단계로 볼 수 있다 — 첫 단계(주소 정하기와 부팅 파일 고르기)를 BOOTP가 맡고, 그 정보를 얻은 뒤 둘째 단계에서 파일을 옮겨 받는데 **보통 TFTP를 쓴다**. 두 단계 모두 클라이언트의 PROM(읽기 전용 메모리)에 들어가도록 만든 것이다 — RFC 951 §2
- (phase 82 step 12) DHCP 문서도 TFTP를 **부팅 서버에서 부팅 이미지를 옮겨 받는** 프로토콜로 든다 — RFC 2131 §1.2. DHCP 메시지에는 부팅의 다음 단계에서 쓸 서버의 IP 주소 칸(`siaddr`)과 **부팅 파일 이름** 칸(`file`)이 있고,
  서버는 OFFER·ACK에 `siaddr`를 담는다(운영 체제 실행 이미지 같은 다음 부팅 서비스를 자기가 줄 수 있으면 자기 주소를 넣는다) — RFC 2131 §2(Table 1과 그 앞 설명)
  쓰일 곳: (phase 82 step 14에서 쓰일 곳) `network-devices.pxe`(DHCP로 주소와 부팅 서버·부팅 파일 이름을 받고 → TFTP로 그 파일을 받고 → 실행한다 — `ip-address-types.dhcp`·`app-protocols-mail-file.tftp`와 뜻을 맞춘다)

(phase 74에서 쓰일 곳) `ip-address-types.static-dynamic-address`(RFC 2131 §1 — 동적 할당은 잠깐 이어지는 클라이언트·영구 주소가 필요 없는 클라이언트에 맞다, 자동·수동 할당은 영구 주소), `ip-address-types.dhcp`(§1·§2·§2.2 — 주소와 설정, 할당 방식 셋, 임대, §4.1 — UDP 67·68, §4.4.5 — 갱신 시각), `ip-address-types.dhcp-messages`(§3.1·Table 2 — 메시지 넷과 차례, REQUEST를 브로드캐스트하는 까닭, §4.1·§4.4.1 — 출발지 0.0.0.0·목적지 255.255.255.255, OFFER·ACK는 브로드캐스트 또는 유니캐스트), 강의 수정 이력 L41
(phase 77에서 쓰일 곳) `ports.well-known-ports`(RFC 2131 §4.1 — DHCP는 UDP를 쓰고 서버 포트 67, 클라이언트 포트 68)
(phase 77 step 3에서 쓰일 곳) `tcp-udp.udp`·`tcp-udp.transport-choice`(RFC 2131 §4.1 — DHCP는 UDP를 쓴다)
(phase 77 step 8) `tcp-udp.transport-choice`(§3.1·§4.1 — 메시지 몇 개를 주고받고 UDP를 쓴다), 도식 `transport-choice`

## (phase 73 step 1) RFC 5227 — IPv4 Address Conflict Detection
https://www.rfc-editor.org/rfc/rfc5227

Proposed Standard이고 RFC 826을 고쳤다(rfc-editor 상태, 2026-10-29). **이름과 한 문장만** 가져온다.

- 같은 링크의 두 호스트가 같은 IPv4 주소를 쓰면 문제가 생긴다. 호스트는 IPv4 주소를 쓰기 시작하기 전에(손으로 정했든 DHCP로 받았든) 그 주소를 이미 누가 쓰는지 **ARP 프로브(ARP 요청)를 브로드캐스트해** 확인한다 — Abstract, §2.1

쓰인 곳: (phase 73 step 1에서 쓰일 곳) `icmp.icmp-message`(「IP 주소 중복」은 ICMP 메시지가 아니다 — IPv4에서 그것을 알아보는 것은 ARP다. 문항·해설에서 쓸 때)
(phase 74 step 5에서 쓰일 곳) 강의 수정 이력 L39(한 링크에서 두 호스트가 같은 주소를 쓰면 문제가 생긴다 — 사설 주소도 그 네트워크 안에서는 하나뿐이어야 한다), `ip-address-types.private-address`

## (phase 73 step 1) RFC 2236 — Internet Group Management Protocol, Version 2, RFC 9776 — Internet Group Management Protocol, Version 3
https://www.rfc-editor.org/rfc/rfc2236
https://www.rfc-editor.org/rfc/rfc9776

RFC 2236(1997)은 Proposed Standard이고 RFC 3376·RFC 9776이 고쳤다. IGMPv3를 정한 RFC 3376(2002)은 **RFC 9776(Internet Standard, STD 100, 2025-03)이 폐기·대체**했다(rfc-editor 상태, 2026-10-29). 그래서 v3는 RFC 9776을 근거로 쓴다. IGMPv1은 위 RFC 1112 부록 I이다.

- IGMP는 IP 호스트가 자기 멀티캐스트 그룹 가입을 바로 이웃한 멀티캐스트 라우터에 알리는 데 쓴다. ICMP처럼 IP의 일부이고, IP 데이터그램에 담겨 가며 IP 프로토콜 번호는 2다 — RFC 2236 §2, RFC 9776 §1·§4
- 모든 IGMP 메시지는 **IP TTL 1**로 보내고 IP 헤더에 Router Alert 옵션을 담는다 — RFC 2236 §2, RFC 9776 §4. TTL은 IP 헤더의 칸이고 IGMP 메시지에는 TTL 칸이 없다 — v2 메시지의 칸은 타입 8비트, 최대 응답 시간 8비트, 체크섬 16비트, 그룹 주소 32비트다 — RFC 2236 §2
- v2의 메시지: 멤버십 질의(0x11 — 일반 질의는 그 네트워크에 구성원이 있는 그룹을, 그룹별 질의는 한 그룹에 구성원이 있는지를 묻는다), v2 멤버십 보고(0x16), **그룹 탈퇴(0x17)**, 그리고 v1과 맞추기 위한 v1 멤버십 보고(0x12) — RFC 2236 §2.1
- v2의 동작: 질의자 라우터는 주기적으로 일반 질의를 모든 시스템 그룹(224.0.0.1)으로 보낸다. 질의를 받은 호스트는 자기가 든 그룹마다 무작위 시간을 기다렸다 그 그룹으로 보고를 TTL 1로 멀티캐스트하고, 같은 그룹의 다른 호스트 보고를 먼저 들으면 자기 보고를 보내지 않는다.
  라우터는 보고를 받은 그룹을 그 네트워크의 구성원 목록에 두고, 정한 시간 안에 보고가 없으면 구성원이 없다고 보아 그 그룹의 멀티캐스트를 그 네트워크로 넘기지 않는다. 라우터가 아는 것은 그 네트워크에 구성원이 하나라도 있는지이지 구성원 전부가 아니다 — RFC 2236 §3
- 그룹에 새로 든 호스트는 곧바로 보고를 보내고, 첫 보고가 사라지거나 망가질 때에 대비해 짧은 간격을 두고 한두 번 되풀이할 것을 권한다(v1과 같다) — RFC 2236 §3(`exam-notes.md` E14)
- 그룹을 떠나는 호스트는 마지막으로 보고한 호스트였다면 그룹 탈퇴를 모든 라우터 그룹(224.0.0.2)으로 보낸다 — RFC 2236 §3
- 판의 차이: v1(RFC 1112)은 처음 널리 쓰이고 처음 인터넷 표준이 된 판이다. v2(RFC 2236)는 그룹에 구성원이 더는 없다는 것을 라우터가 빨리 알게 하는 기능(낮은 탈퇴 지연)을 더했다. v3는 **출발지 거르기** — 특정 출발지에서 오는 것만, 또는 특정 출발지를 빼고 받겠다고 알리기 — 를 더했다.
  v3는 v1·v2와 함께 쓸 수 있게 만들었다 — RFC 9776 §1
- IGMP는 그룹 구성원(멀티캐스트를 받으려는 호스트나 라우터)의 동작과 멀티캐스트 라우터의 동작을 따로 정하는 **비대칭(asymmetric) 프로토콜**이다 — RFC 9776 §5(RFC 1112 부록 I도 같은 말을 쓴다)
- v3의 메시지: 멤버십 질의(0x11), v3 멤버십 보고(0x22). 이전 판과 함께 쓰려고 v1 보고·v2 보고·v2 탈퇴(0x12·0x16·0x17)도 지원해야 한다 — RFC 9776 §4

쓰인 곳: (phase 73 step 1에서 쓰일 곳) `icmp.igmp`(IP의 일부·프로토콜 2·TTL 1·질의·보고·탈퇴·판의 차이·비대칭 — [기출 2024-05-19 #3], [기출 2024-11-03 #7], [기출 2025-05-25 #3], [기출 2025-11-02 #16]), `exam-notes.md` E12·E14
(phase 73 step 14) `icmp.igmp`(RFC 2236 §2 — 모든 메시지를 TTL 1로 보낸다, §2.1 — 멤버십 질의(일반 질의·그룹별 질의)·멤버십 보고·그룹 탈퇴, §3 — 무작위 시간을 기다렸다 그 그룹으로 보고하고 같은 그룹의 보고를 먼저 들으면 보내지 않는다, 새로 든 호스트는 곧바로 보고하고 한두 번 되풀이하라고 권한다, 마지막으로 보고한 호스트가 떠나면 그룹 탈퇴를 보낸다, 라우터는 구성원이 있는 그룹의 멀티캐스트만 넘긴다; RFC 9776 §1 — v2가 탈퇴를 빨리 알게 했고 v3가 출발지 거르기를 더했으며 앞 판과 함께 쓸 수 있다, §4 — TTL 1, §5 — 비대칭), 문항 n078·n079 해설, 도식 `igmp-group`. 메시지 이름은 RFC 2236 §2.1의 Membership Query·Membership Report·Leave Group을 옮긴 것이다

## (phase 74) RFC 3021 — Using 31-Bit Prefixes on IPv4 Point-to-Point Links
https://www.rfc-editor.org/rfc/rfc3021

Proposed Standard이고 폐기되지 않았다(rfc-editor 상태, 2026-10-29).

- 그동안 번호를 매긴 서브넷은 대개 30비트보다 긴 마스크를 쓰지 않아, 링크 하나에 주소가 넷 든다 — **호스트 주소 둘, 모두 0인 네트워크 주소 하나, 모두 1인 브로드캐스트 주소 하나** — §1
- 점대점 링크는 끝이 둘뿐이고 브로드캐스트라는 개념이 없다(한쪽이 보낸 패킷은 늘 다른 쪽이 받는다). 그래서 이 문서는 **점대점 링크에 한해** 31비트 마스크(`/31`)를 써서 링크 하나에 주소 둘만 쓰게 한다 — Abstract, §1
- `/31`이면 호스트 칸이 1비트라 주소가 {네트워크 번호, 0}과 {네트워크 번호, -1} 둘뿐이고, 예전에는 이 둘이 네트워크 주소와 브로드캐스트 주소였다. `/31`인 점대점 링크에서는 둘을 호스트 주소로 읽어야 한다(MUST) — §2.1.
  {네트워크 번호, 0}, 곧 「네트워크 주소 자체」는 directed broadcast의 낡은 형태이고 오래된 호스트가 아직 쓸 수 있다 — §2.2

쓰인 곳: (phase 74에서 쓰일 곳) `ip-addressing.network-broadcast-address`(§1 — `/30`이면 주소 넷 가운데 호스트에 둘: 2^h − 2의 예, §2.1 — `/31`은 점대점 링크에만 쓰는 예외: 이름과 절만), `ip-addressing.subnet-sizing`(§1 — `/30`의 호스트 둘), 강의 수정 이력 L36(§2.2)·L38(§1)

## (phase 74) RFC 2644 — Changing the Default for Directed Broadcasts in Routers
https://www.rfc-editor.org/rfc/rfc2644

BCP 34이고 RFC 1812를 고친다(rfc-editor 상태, 2026-10-29).

- RFC 1812는 라우터가 directed broadcast를 받아 넘기는 것을 기본값으로 정했지만, 인터넷 기간망에서 그 쓰임은 거의 모두 다른 네트워크를 노린 공격이었다(스머프 공격이 directed broadcast를 받아 주는 네트워크를 증폭기로 쓴다) — §1, §2
- 라우터는 directed broadcast를 받거나 넘기는 설정을 둘 수 있지만, **기본값은 받지도 넘기지도 않는 것**이어야 한다 — §3(RFC 1812 §4.2.2.11 (d)와 §5.3.5.2 둘째 문단을 바꿔 쓴다)

쓰인 곳: (phase 74에서 쓰일 곳) `ip-addressing.network-broadcast-address`(다른 네트워크에서 그 네트워크의 브로드캐스트 주소로 보내도 라우터가 기본으로 막는다 — 쓸지는 step 1이 정한다)

## (phase 74) RFC 1878 — Variable Length Subnet Table For IPv4 [Historic — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc1878

1995년 Informational로 나왔고 지금 상태는 Historic이다(rfc-editor 상태, 2026-10-29). 아래 두 줄은 계산 결과를 대조하는 역사 기록으로만 쓰고, 지금 규칙의 근거로는 RFC 1812 §4.2.2.11과 계산을 쓴다.

- 접두사 길이 `/1`~`/32`마다 점 10진 마스크와 주소 수를 표로 든다. 예: `/8` 255.0.0.0(옛 A 클래스 하나), `/16` 255.255.0.0(옛 B 하나), `/24` 255.255.255.0(옛 C 하나), `/26` 255.255.255.192 주소 64개, `/27` 255.255.255.224 32개,
  `/28` 255.255.255.240 16개, `/29` 255.255.255.248 8개, `/30` 255.255.255.252 4개 — 「Table」
- B·C 클래스를 나누는 표(Table 1-1·1-2)는 **모두 0인 서브넷과 모두 1인 서브넷을 넣어** 센다 — 정의할 수 있는 서브넷을 다 쓰는 것이 RFC 1812에 따른 지금의 관행이라고 밝힌다. 그 두 서브넷을 빼고 세는 표(Table 2-1·2-2)도 싣지만,
  그 방식은 「낡았다(obsolete)」고 적고 요즘 소프트웨어는 정의할 수 있는 네트워크를 다 쓸 수 있다고 적는다 — 「Subnets and Networks」

쓰인 곳: (phase 74에서 쓰일 곳) `ip-addressing.subnetting`·`ip-addressing.subnet-sizing`(계산 결과의 대조, 모두 0·모두 1 서브넷을 빼던 방식이 낡았다는 기록), `ip-addressing.subnet-mask`(`/8`·`/16`·`/24`가 옛 A·B·C 하나와 같다는 대조)

## (phase 74) IANA — IPv4 Address Space, IPv4 Multicast Address Space, RFC 5771 — IANA Guidelines for IPv4 Multicast Address Assignments
https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml
https://www.iana.org/assignments/multicast-addresses/multicast-addresses.xhtml
https://www.rfc-editor.org/rfc/rfc5771

레지스트리는 XML판(`…/ipv4-address-space.xml` 2025-10-10판, `…/multicast-addresses.xml` 2026-08-20판)을 읽었다. RFC 5771은 BCP 51이다.

- IPv4 Address Space: 224/8~239/8은 「Multicast」이고 주석이 그것을 **「예전 이름 D 클래스」**로 적는다. 240/8~255/8은 「Future use」(예약)이고 주석이 **「예전 이름 E 클래스」**로 적으며 RFC 1112를 근거로 든다 — 레지스트리 주석 14·17
- IPv4 Address Space: 255.255.255.255는 그 예약 범위 안에서 제한 브로드캐스트 목적지 주소로 남겨 두었다 — 주석 18. 0/8은 자기 식별용(RFC 791 §3.2), 127/8은 루프백(RFC 1122 §3.2.1.3)으로 남겨 둔 블록이다 — 주석 2·3·7(자세히는 `ip-address-types` — step 5)
- 멀티캐스트 주소는 224.0.0.0~239.255.255.255다 — IPv4 Multicast Address Space 머리 주석. 유니캐스트 주소처럼 블록을 지역 인터넷 등록 기관에 나눠 주지 않고 IANA가 바로 할당한다 — RFC 5771 §3
- (phase 74 step 5) IPv4 Address Space는 /8 블록마다 그 블록을 받은 곳이나 쓰임을 적는다 — 예: `1/8`은 APNIC(ALLOCATED), `0/8`은 「Local Identification」, `10/8`은 「Private Use」, `127/8`은 「Loopback」(모두 RESERVED) — 레지스트리의 각 행(2025-10-10판).
  IANA가 유니캐스트 주소 블록을 지역 인터넷 등록 기관(RIR)에 나눠 준다는 계층은 RFC 7020 §3(아래 항목)
- (phase 74 step 5) 위 둘째 줄의 0/8·127/8 주석(2·3·7)을 다시 확인했다: 0.0.0.0/8은 자기 식별용(RFC 791 §3.2), 0.0.0.0/32도 자기 식별용(RFC 1122 §3.2.1.3), 127.0.0.0/8은 루프백(RFC 1122 §3.2.1.3)이고 셋 다 「프로토콜이 남겨 둔」 블록이며,
  자세한 등록은 IPv4 Special-Purpose Address Space에 있다고 적는다. 224.0.0.0/4(224/8~239/8)는 그 특수 용도 레지스트리에는 없고 이 레지스트리와 IPv4 Multicast Address Space에 있다 — 주석 14

쓰인 곳: (phase 74에서 쓰일 곳) `ip-addressing.address-classes`(D·E의 지금 이름과 범위, 첫 옥텟 0·127이 따로 쓰인다는 한 줄, E 범위 안에 255.255.255.255가 있다는 것)
(phase 74 step 5에서 쓰일 곳) `ip-address-types.public-address`(/8 블록을 RIR에 나눠 준 기록 — 1/8 APNIC), `ip-address-types.reserved-addresses`(224.0.0.0/4 멀티캐스트 항목의 근거 — 주석 14, 0/8·127/8 — 주석 2·3·7, 240/4 안의 255.255.255.255 — 주석 18)

## (phase 74 step 5) RFC 7020 — The Internet Numbers Registry System
https://www.rfc-editor.org/rfc/rfc7020

Informational이고 RFC 2050을 폐기·대체했다(rfc-editor 상태, 2026-10-29). RFC 2050은 지금 Historic이다.

- 이 문서는 전역에서 하나뿐인 IP 주소 공간과 AS 번호를 나눠 주는 지금의 체계를 설명한다 — §1
- 나눠 주는 목표 가운데 하나가 **등록의 정확성**이다 — 배정 기록을 유지해 하나뿐임을 보장한다. 곧 같은 IP 주소와 AS 번호를 동시에 둘 이상에게 배정하지 않는다. 주소를 계층으로 나눠 주는 것은 주소들을 묶어 라우팅 알림을 줄이려는 것이다 — §2 (3)·(2)
- 계층의 맨 위는 IANA다 — IANA는 조직이 아니라 역할이고 지금은 ICANN이 맡는다. IANA가 지역 인터넷 등록 기관(Regional Internet Registry, RIR)들을 맡고, RIR은 지역(Local) 인터넷 등록 기관(LIR)과 다른 고객을 맡으며,
  LIR은 다시 자기 고객(ISP, 최종 사용자, 하위 LIR 등)에게 주소를 나눠 준다 — §3
- RIR은 대륙 규모 지역마다 있고 지금 다섯이다 — AfriNIC(아프리카), APNIC(아시아·태평양 일부), ARIN(북아메리카와 카리브 일부), LACNIC(라틴 아메리카와 카리브 일부), RIPE NCC(유럽, 아시아·중동 일부) — §3
- 나라 단위 등록 기관(NIR)이라는 말은 이 문서에 없다. LIR은 주소를 받은 곳 — 대개 그 지역의 RIR, 상위 LIR, 또는 **다른 번호 배정 기관** — 과의 관계로 세워진다고만 적는다 — §3.
  그러니 한국의 KISA가 이 계층의 어디에 있는지(APNIC과의 관계)는 허용한 출처로 댈 수 없다(RFC 7020·RFC 2050·RFC 6890과 IANA 레지스트리에서 `KISA`·`KRNIC`·`national`을 찾았다). KISA는 강의 p184 그림이 보이는 사실까지만 쓴다 — `lecture-outline.md` 「phase 74 step 5」 문단
- (phase 74 step 6) IANA는 Internet Assigned Numbers Authority, RIR은 Regional Internet Registry의 줄임말이다 — §3(rfc-editor.org 텍스트판을 다시 내려받아 확인했다, 2026-10-29)

쓰인 곳: (phase 74 step 5에서 쓰일 곳) `ip-address-types.public-address`(§2 — 하나뿐이도록 기록한다, §3 — IANA → RIR(아시아·태평양은 APNIC) → LIR → 고객)
(phase 74 step 6) `ip-address-types.public-address`(§2·§3 — 본문 문단 4·5와 도식 `public-allocation`, IANA·RIR의 풀네임), 문항 n090 해설

## (phase 74 step 5) IANA — IPv4 Special-Purpose Address Space(RFC 6890의 「IPv4 Special-Purpose Address Registry」), RFC 6890, RFC 8190, RFC 5735 [폐기 — 역사 기록으로만 쓴다]
https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml
https://www.rfc-editor.org/rfc/rfc6890
https://www.rfc-editor.org/rfc/rfc8190
https://www.rfc-editor.org/rfc/rfc5735

레지스트리는 XML판(`…/iana-ipv4-special-registry.xml`, 2025-10-09판)을 읽었다. RFC 6890은 BCP 153이고 RFC 5735·5736·4773·5156을 폐기했으며 RFC 8190이 고쳤다. RFC 8190은 BCP다. RFC 5735는 RFC 6890이 폐기했다(rfc-editor 상태, 2026-10-29).

- IETF는 새 프로토콜이나 관행을 위해 가끔 주소 블록을 특정 목적에 남겨 둔다. RFC 6890은 그런 특수 용도 블록을 **모두** 이 레지스트리에 기록하게 하고, 그 목록을 따로 싣던 RFC 5735를 폐기했다 — RFC 6890 §1
- 레지스트리는 블록마다 이름, 그 블록을 정한 RFC, 그리고 다섯 값을 적는다 — 출발지로 유효한가, 목적지로 유효한가, 라우터가 바깥 인터페이스 사이로 넘겨도 되는가(Forwardable), 한 관리 영역 밖까지 닿는가(Globally Reachable), IP 자체가 남겨 둔 것인가(Reserved-by-Protocol) — 레지스트리 머리 주석, RFC 6890 §2.2.1.
  이 레지스트리에 든 블록은 어디서든 라우팅이 보장되지 않는다 — 머리 주석
- 이 phase가 쓰는 행(이름 — RFC — 다섯 값 가운데 필요한 것):
  - `0.0.0.0/8` 「This network」 — RFC 791 — 출발지 예, 목적지 아니오, 넘김 아니오. `0.0.0.0/32` 「This host on this network」 — RFC 1122 §3.2.1.3 — 같은 값
  - `10.0.0.0/8`·`172.16.0.0/12`·`192.168.0.0/16` 「Private-Use」 — RFC 1918 — 넘김 예, 전역 도달 아니오
  - `127.0.0.0/8` 「Loopback」 — RFC 1122 §3.2.1.3 — 출발지·목적지·넘김·전역 도달 모두 아니오(몇몇 프로토콜에는 예외를 두었다 — 주석 1)
  - `169.254.0.0/16` 「Link Local」 — RFC 3927 — 출발지·목적지 예, 넘김 아니오
  - `192.0.2.0/24`·`198.51.100.0/24`·`203.0.113.0/24` 「Documentation (TEST-NET-1~3)」 — RFC 5737 — 다섯 값 모두 아니오
  - `240.0.0.0/4` 「Reserved」 — RFC 1112 §4 — 모두 아니오, 프로토콜이 남겨 둔 블록(RFC 6890은 Table 15 「Reserved for Future Use」로 적는다)
  - `255.255.255.255/32` 「Limited Broadcast」 — RFC 919 §7, RFC 8190 — 목적지 예, 넘김 아니오. RFC 8190이 이 행의 Reserved-by-Protocol을 RFC 919 §7에 맞춰 예로 바꿨다 — RFC 8190 §2.2
- 두 행이 겹친다: `240.0.0.0/4`는 240.0.0.0~255.255.255.255(2^28 = 268,435,456개, 계산)이고, 그 마지막 주소 `255.255.255.255`를 따로 제한 브로드캐스트로 정해 둔다(IPv4 Address Space 주석 18 — 위 「(phase 74) IANA」 항목). 강의 수정 이력 L40
- **`224.0.0.0/4`(멀티캐스트)는 이 레지스트리에 없다.** 근거는 IPv4 Address Space(224/8~239/8 「Multicast」, 주석 14 — 옛 D 클래스)와 IPv4 Multicast Address Space다(위 「(phase 74) IANA」 항목)
- `192.88.99.0/24`는 「Deprecated (6to4 Relay Anycast)」이고 2015-03에 끝났다(RFC 7526) — 강의 p187 표의 이 행은 이 과목이 쓰지 않는다
- (RFC 5735, 역사 기록) `127.0.0.0/8` 안의 어느 주소로 보낸 데이터그램이든 호스트 안에서 되돌아오고, 보통 `127.0.0.1/32`만으로 구현한다. `169.254.0.0/16`은 한 링크 위 호스트 사이의 통신에 쓰고, DHCP 서버를 찾지 못할 때처럼 자동 설정으로 얻는다 — RFC 5735 §3.
  지금 유효한 근거는 루프백이 RFC 1122 §3.2.1.3 (g)·RFC 1812 §4.2.2.11 (e)·§5.3.7, 링크 로컬이 RFC 3927, 「흔히 127.0.0.1」이 아래 Microsoft Learn의 어댑터 확인 문서다

쓰인 곳: (phase 74 step 5에서 쓰일 곳) `ip-address-types.reserved-addresses`(레지스트리 이름, 행마다의 이름·RFC·넘김 여부), `ip-address-types.private-address`(Private-Use 셋은 넘길 수는 있지만 전역에서 닿지 않는다), `ip-address-types.loopback`(Loopback 행), 강의 수정 이력 L40

## (phase 74 step 5) RFC 3927 — Dynamic Configuration of IPv4 Link-Local Addresses
https://www.rfc-editor.org/rfc/rfc3927

Proposed Standard이고 폐기되지 않았다(rfc-editor 상태, 2026-10-29).

- 호스트가 인터페이스에 `169.254/16` 안의 주소를 **스스로** 정하는 방법이다. 손으로 정적 주소를 넣거나 DHCP 서버를 두지 않아도 되고, 다른 설정 방법이 없을 때 특히 쓸모 있다. 이 접두사는 이 목적으로 IANA에 등록돼 있다 — §1
- 링크 로컬 주소로는 같은 물리(또는 논리) 링크에 이어진 장치와만 통신할 수 있다 — §1
- 주소는 169.254.1.0~169.254.254.255에서 의사 난수로 고른다. `169.254/16`의 처음 256개와 마지막 256개는 남겨 두어 고르지 않는다 — §2.1
- 출발지나 목적지가 `169.254/16`인 패킷은 라우터로 보내 넘기게 하지 않고, 받은 장치도 넘기지 않는다(MUST NOT) — §2.7. 라우터는 링크 로컬 출발지·목적지 패킷을 기본 경로나 라우팅 프로토콜로 얻은 경로가 있어도 넘기지 않는다 — §7
- 쓸 수 있는 라우팅 가능한 주소가 있으면 같은 인터페이스에 링크 로컬 주소를 함께 두지 않는 것이 좋다. 링크 로컬 주소를 정했다고 DHCP 같은 다른 프로토콜의 동작을 바꾸지 않는다 — 곧 DHCP로 주소를 받으려는 시도를 멈추지 않는다 — §1.9, §2.11
- Windows 98 이후와 Mac OS 8.5 이후가 이미 이 기능을 지원한다고 적는다 — §1(Windows에서의 이름 APIPA는 아래 Microsoft Learn 항목)

쓰인 곳: (phase 74 step 5에서 쓰일 곳) `ip-address-types.reserved-addresses`(169.254.0.0/16 — 주소를 받지 못한 호스트가 스스로 정하고 같은 링크에서만 쓰며 라우터가 넘기지 않는다)

## (phase 74 step 5) RFC 6761 — Special-Use Domain Names
https://www.rfc-editor.org/rfc/rfc6761

Proposed Standard이고 RFC 1918·RFC 2606을 고쳤다(rfc-editor 상태, 2026-10-29).

- `localhost.`와 그 아래 이름은 특별하다. 사용자는 localhost 이름의 IPv4·IPv6 주소 질의가 늘 그 IP 루프백 주소로 풀린다고 여겨도 된다 — §6.3 첫째
- 이름 해석 API와 라이브러리는 localhost 이름을 특별히 다뤄 주소 질의에는 루프백 주소를 돌려주고, 설정된 DNS 서버로 묻지 않는 것이 좋다(SHOULD) — §6.3 셋째

쓰인 곳: (phase 74 step 5에서 쓰일 곳) `ip-address-types.loopback`(이름 localhost가 루프백 주소를 가리킨다)

## (phase 74 step 5) RFC 2663 — IP Network Address Translator (NAT) Terminology and Considerations
https://www.rfc-editor.org/rfc/rfc2663

Informational이고 폐기되지 않았다(rfc-editor 상태, 2026-10-29). RFC 3022가 용어를 이 문서에서 가져온다.

- NAT는 IP 주소를 한 주소 영역(realm)에서 다른 영역으로 대응시켜, 끝 호스트에게는 주소가 바뀌는 것이 드러나지 않게(투명하게) 패킷을 넘기는 방법이다 — §3
- NAT는 사설망 주소와 바깥 주소를 묶고(binding), 그 묶음은 TCP/UDP 포트까지 넓힐 수 있으며 세션을 시작할 때 정한다 — §3.1. 묶는 방식은 둘이다:
  - **정적 배정**(static address assignment) — NAT가 동작하는 동안 사설 주소와 바깥 주소가 **1:1**로 고정 대응한다 — §3.1.1
  - **동적 배정**(dynamic address assignment) — 쓰임에 따라 바깥 주소를 그때그때 배정하고, 그 대응을 쓰는 마지막 세션이 끝나면 풀어 그 바깥 주소를 다시 쓴다 — §3.1.2
- NAPT는 여러 사설 호스트의 전송 식별자(TCP·UDP 포트, ICMP 질의 식별자)를 바깥 주소 **하나**의 전송 식별자로 묶어(multiplex) 여러 호스트가 바깥 주소 하나를 함께 쓰게 한다. 나가는 패킷은 출발지 IP 주소·출발지 포트와 체크섬을, 들어오는 패킷은 목적지 IP 주소·목적지 포트와 체크섬을 바꾼다.
  NAT 라우터의 바깥 인터페이스 주소를 그 하나의 주소로 쓰는 일이 많다 — §4.1.2
- 보안 고려: 많은 사람이 전통적 NAT 라우터를 바깥에서 안으로 들어오는 세션을 막는 **한 방향 필터로 여긴다**. 주소를 동적으로 배정하면 공격자가 NAT 안쪽의 특정 호스트를 겨누기 어렵다. NAT 라우터는 원치 않는 트래픽을 거르는 방화벽과 함께 쓸 수 있고, 사설망 경계에서 NAT·ALG·방화벽을 함께 두는 일이 흔하다.
  경로에 NAT가 있으면 IPsec이 보장하는 끝과 끝 사이 보안을 얻을 수 없다 — §9

쓰인 곳: (phase 74 step 5에서 쓰일 곳) `ip-address-types.nat`(§3 — 영역 사이 주소 대응, §3.1.1·§3.1.2 — 정적 1:1과 동적, §9 — 보안), `ip-address-types.napt`(§4.1.2), `exam-notes.md` E15

## (phase 74 step 5) RFC 2993 — Architectural Implications of NAT
https://www.rfc-editor.org/rfc/rfc2993

Informational이고 폐기되지 않았다(rfc-editor 상태, 2026-10-29). **이름 셋**만 가져온다.

- 정적 NAT(Static NAT)는 두 주소 공간 사이를 안정되게 **1:1**로 대응시킨다. 동적 NAT(Dynamic NAT)는 보통 한쪽(사설)의 많은 주소를 다른 쪽(공인)의 적은 주소에 동적으로 대응시킨다.
  NAPT(Network Address Port Translation)는 한쪽 여러 주소의 전송 계층 식별자를 반대쪽 주소 하나의 전송 식별자로 묶어, 여러 끝점이 IP 주소 하나로 보이게 한다(RFC 2663 §4.1.2를 가리킨다) — §2

쓰인 곳: (phase 74 step 5에서 쓰일 곳) `ip-address-types.nat`(정적 NAT·동적 NAT라는 이름), `ip-address-types.napt`(NAPT라는 이름)

## (phase 74 step 5) RFC 4864 — Local Network Protection for IPv6
https://www.rfc-editor.org/rfc/rfc4864

Informational이고 폐기되지 않았다(rfc-editor 상태, 2026-10-29). IPv4 NAT가 **준다고 여겨지는** 이점을 정리한 §2만 가져온다.

- §2는 IPv4 NAT를 쓰면 흔히 얻는다고 여겨지는 이점을 정리하고, 그 이점이 정확한지 따지는 것은 목적이 아니라고 밝힌다 — §2
- 보안: NAT는 세션마다 상태를 두므로 바깥에서 그 상태를 이용해 안쪽 호스트의 다른 포트를 공격할 수 없다는 이점은 **일부만 실재한다**. 숙련된 공격자는 NAT 경계를 넘는 방법(트로이 목마 등)을 쓰고, NAT가 모든 공격을 막지는 못한다.
  **헤더의 주소 비트를 바꾸는 일 자체는 보안을 주지 않는다** — 정적 NAT로 들어오는 모든 포트를 한 호스트로 넘기면 그 호스트의 위험은 NAT가 없을 때와 같다.
  NAT가 주는 것으로 여겨지는 보호는 미리 만들어 둔 대응이 없다는 데서 오고, 같은 수준의 보호는 기본 방화벽도 준다. NAT를 방화벽처럼 내세우기도 하지만 진짜 방화벽은 더 명시적이고 넓은 관리 수단을 준다 — §2.2
- 구조 숨기기: 공인 주소 하나(또는 몇 개)로 많은 사용자를 인터넷에 내보내므로 안쪽 네트워크 구조를 숨기는 간단한 수단이 된다. 바깥에서는 어느 안쪽 장치가 그 패킷을 보냈는지 알 수 없다 — §2.4
- 이름: §2.2는 포트까지 바꾸는 방식을 NAPT라 부르고, §2.3은 「Port Address Translation」이라는 말을 **정의 없이 한 번** 쓴다. 약어 PAT는 쓰지 않는다 — §2.2, §2.3.
  같은 방식을 IETF 문서는 NAPT라 부른다(RFC 2663 §4.1.2, RFC 3022 §2.2, RFC 2993 §2 — 그 밖에 RFC 4787·5382·6888·7857·8512에서도 「PAT」를 찾지 못했다, 2026-10-29)

쓰인 곳: (phase 74 step 5에서 쓰일 곳) `ip-address-types.nat`(§2.2 — 주소를 바꾸는 것 자체는 보안이 아니다, §2.4 — 안쪽 구조를 숨긴다), `exam-notes.md` E15·E16

## (phase 74 step 5) RFC 2132 — DHCP Options and BOOTP Vendor Extensions
https://www.rfc-editor.org/rfc/rfc2132

Draft Standard이고 RFC 1533을 대체했으며 RFC 3442·3942·4361·4833·5494가 고쳤다(rfc-editor 상태, 2026-10-29). DHCP 서버가 주는 설정 값 가운데 이 phase가 쓰는 옵션만 가져온다.

- 서브넷 마스크 옵션(코드 1) — 클라이언트의 서브넷 마스크 — §3.3
- 라우터 옵션(코드 3) — 클라이언트의 서브넷에 있는 라우터의 IP 주소 목록(먼저 쓸 것부터) — §3.5. Windows 문서는 이것을 기본 게이트웨이라 부른다(아래 Microsoft Learn 항목의 「What is DHCP Server」 줄)
- DNS 서버 옵션(코드 6) — 클라이언트가 쓸 수 있는 DNS 이름 서버의 목록 — §3.8
- IP 주소 임대 시간 옵션(코드 51) — 클라이언트가 원하는 임대 시간을 요청하거나 서버가 제안하는 임대 시간을 적는다. 단위는 초 — §9.2
- DHCP 메시지 종류 옵션(코드 53) — 1 DHCPDISCOVER, 2 DHCPOFFER, 3 DHCPREQUEST, 4 DHCPDECLINE, 5 DHCPACK, 6 DHCPNAK, 7 DHCPRELEASE, 8 DHCPINFORM — §9.6
- 서버 식별자 옵션(코드 54) — 고른 서버의 IP 주소. 서버는 OFFER에 넣어 클라이언트가 제안들을 가르게 하고, 클라이언트는 REQUEST에 넣어 어느 제안을 받아들이는지 알린다 — §9.7
- (phase 82 step 12, 2026-11-20 rfc-editor.org 텍스트판을 IPv4로 다시 받아 읽음 — Draft Standard 그대로) **부팅에 쓰는 옵션 둘**: TFTP 서버 이름 옵션(코드 66) — DHCP 헤더의 서버 이름 칸(`sname`)을 다른 옵션에 내준 경우 TFTP 서버를 알린다 — §9.4.
  부팅 파일 이름 옵션(코드 67) — 헤더의 `file` 칸을 다른 옵션에 내준 경우 부팅 파일을 알린다 — §9.5. 아래 「(phase 82 step 12) Microsoft Learn — PXE와 WDS …」 항목의 Windows PE 안내는 PXE 클라이언트가 이 두 옵션으로 부팅 서버와 부팅 파일 이름을 받는다고 적는다
  쓰일 곳: (phase 82 step 14에서 쓰일 곳) `network-devices.pxe`(부팅 서버와 부팅 파일 이름을 DHCP 옵션으로 받는다 — 옵션 번호는 본문에 쓰지 않아도 된다)

쓰인 곳: (phase 74 step 5에서 쓰일 곳) `ip-address-types.dhcp`(주소와 함께 주는 설정 — 서브넷 마스크·기본 게이트웨이(라우터)·DNS 서버, 임대 시간), `ip-address-types.dhcp-messages`(메시지 종류, 서버 식별자로 고른 서버를 알린다)
(phase 79 step 0에서 쓰일 곳) `dns.name-servers`(§3.8 — 로컬 DNS 서버의 주소를 DHCP로 자동으로 받는다. 누가 DHCP 서버인지(ISP 쪽 장비인지 공유기인지)는 이 문서가 말하지 않는다), 강의 수정 이력 「phase 79 step 0」 문단(p345)

## (phase 74 step 5) IANA — Service Name and Transport Protocol Port Number Registry
https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml

XML판(`…/service-names-port-numbers.xml`, 2026-10-27판)을 읽었다.

- 67은 `bootps`(Bootstrap Protocol Server), 68은 `bootpc`(Bootstrap Protocol Client)이고 TCP·UDP 둘 다 등록돼 있다. 53은 `domain`(Domain Name Server)이다 — 레지스트리의 각 행
- DHCP가 이 두 BOOTP 포트를 쓴다는 것은 RFC 2131 §4.1(서버 포트 67, 클라이언트 포트 68)과 §1(DHCP 메시지 형식이 BOOTP를 바탕으로 한다)이다 — 위 RFC 951·RFC 2131 항목

phase 77 step 0에서 XML판(레지스트리 머리의 Last Updated 2026-11-06판)을 2026-11-09에 다시 내려받아 읽었다. 이 레지스트리는 항목 하나로 두므로 아래 「(phase 77)」 줄을 이 항목에 더한다.

- (phase 77) **레지스트리 머리 설명**: 서비스 이름과 포트 번호는 TCP·UDP·DCCP·SCTP 같은 전송 프로토콜 위에서 도는 서로 다른 서비스를 가리는 데 쓴다. 포트 번호는 세 범위로 나뉜다 —
  System Ports(0~1023, IETF 검토나 IESG 승인으로 정해 준다), User Ports(1024~49151, IETF 검토·IESG 승인·전문가 검토로 정해 준다), Dynamic and/or Private Ports(49152~65535, 정해 주지 않는다).
  범위의 쓰임과 절차는 RFC 6335 §8.1.2가 정한다 — 레지스트리 머리의 note
- (phase 77) **레지스트리는 전송 프로토콜마다 따로 적는다** — 행마다 번호·전송 프로토콜(`tcp`·`udp`·`sctp`·`dccp`)·서비스 이름이 있고, 같은 번호라도 전송 프로토콜마다 다른 행이다.
  같은 번호가 TCP와 UDP에서 서로 다른 서비스인 예: 514는 TCP가 `shell`, UDP가 `syslog`다. 같은 번호를 TCP에만 정해 주고 UDP는 남겨 둔 예: 6379는 TCP가 `redis`, UDP는 Reserved다 — 레지스트리의 각 행
- (phase 77) **0번**은 TCP·UDP 모두 Reserved(RFC 6335)다 — 어떤 서비스에도 정해 주지 않았다. 1023·1024도 Reserved다(범위의 경계) — 레지스트리의 각 행, RFC 6335 §6
- (phase 77) **이 phase가 쓰는 서비스의 행**(번호·서비스 이름·설명):
  - 20 `ftp-data` — File Transfer [Default Data], 21 `ftp` — File Transfer Protocol [Control](참조 RFC 959)
  - 22 `ssh` — The Secure Shell (SSH) Protocol(참조 RFC 4251)
  - 23 `telnet` — Telnet(참조 RFC 854)
  - 25 `smtp` — Simple Mail Transfer
  - 53 `domain` — Domain Name Server, 67 `bootps`·68 `bootpc`(위 줄)
  - 80 `http`(별칭 `www`·`www-http`) — World Wide Web HTTP(참조 RFC 9110)
  - 443 `https` — http protocol over TLS/SSL(참조 RFC 9110)
  - 위 여덟 서비스의 번호는 모두 TCP·UDP 두 행이 같은 서비스로 있다(20·21·22·80·443은 SCTP 행도 있다). 2011년 전까지 IANA가 한 전송 프로토콜만 청해도 TCP·UDP 둘 다 정해 주던 관행이 있었고(RFC 6335 §7.2), 그래서 TCP만 쓰는 서비스도 두 행을 갖는다(services(5) — 아래 「(phase 77) Linux man-pages」 항목).
    **그러니 레지스트리에 UDP 행이 있다고 그 서비스가 UDP를 쓰는 것은 아니다** — 어느 전송 프로토콜을 쓰는지는 그 프로토콜의 RFC가 정한다: FTP·SSH·Telnet·SMTP·HTTP는 TCP(RFC 959 §8, RFC 4253 §4.1, RFC 854, RFC 5321 §4.5.4.2, RFC 9110 §4.2.1),
    DHCP는 UDP(RFC 2131 §4.1), DNS는 UDP와 TCP 둘 다(RFC 1035 §4.2), HTTPS는 TCP(RFC 9110 §4.2.2)이고 HTTP/3는 UDP(RFC 9114 §3.1)
- (phase 77) **강의 p225의 등록된 포트(User Ports) 예 다섯은 모두 레지스트리에 있다**: 1194 `openvpn` — OpenVPN(TCP·UDP), 1433 `ms-sql-s` — Microsoft-SQL-Server(TCP·UDP), 3306 `mysql` — MySQL(TCP·UDP),
  6379 `redis` — An advanced key-value cache and store(TCP만. UDP 6379는 Reserved), 8080 `http-alt` — HTTP Alternate (see port 80)(TCP·UDP) — 레지스트리의 각 행. 다섯 번호 모두 User Ports 범위(1024~49151) 안이다
- (phase 78 step 0, CSV판 — 레지스트리 머리의 Last Updated 2026-11-06, 2026-11-11에 내려받음) **메일·파일 전송 프로토콜의 행**(번호·서비스 이름·설명):
  - 69 `tftp` — Trivial File Transfer(TCP·UDP 두 행. TFTP가 쓰는 것은 UDP다 — RFC 1350 §1·§4. 위 「UDP 행이 있다고 …」와 같은 이유로 TCP 행이 남아 있다)
  - 110 `pop3` — Post Office Protocol - Version 3(TCP·UDP 두 행. POP3는 TCP — RFC 1939 §3)
  - 143 `imap` — Internet Message Access Protocol(TCP, 참조 RFC 3501·RFC 9051. UDP 143은 Reserved)
  - 587 `submission` — Message Submission(TCP·UDP, 참조 RFC 6409)
  - 993 `imaps` — IMAP over TLS protocol(TCP, 참조 RFC 3501·8314·9051. UDP 993은 Reserved), 995 `pop3s` — POP3 over TLS protocol(TCP, 참조 RFC 8314), 465 `submissions` — Message Submission over TLS protocol(TCP, 참조 RFC 8314. 같은 번호의 TCP 행에 다른 서비스 `urd`도 있다)
  - 각 번호의 쓰임은 그 프로토콜의 RFC와 맞는다 — POP3 TCP 110(RFC 1939 §3), IMAP TCP 143·993(RFC 9051 §2.1), 메일 제출 587(RFC 6409 §3.1), TLS로 감싼 POP3 995·IMAP 993·메일 제출 465(RFC 8314 §3.1~§3.3·§7)
- (phase 78 step 0) 25 `smtp` 행의 참조는 이날 RFC 5321을 고쳐 쓰는 초안의 43판(`RFC-ietf-emailcore-rfc5321bis-43`)이다 — 아직 RFC가 아니므로 SMTP는 RFC 5321로 쓴다(아래 「(phase 77) RFC 5321」 항목)
- (phase 78 step 5, CSV판 — XML판 머리의 Last Updated 2026-11-10, 2026-11-11에 내려받음) **관리·시간·보안 프로토콜의 행**(번호·서비스 이름·설명):
  - 161 `snmp` — SNMP, 162 `snmptrap` — SNMPTRAP(둘 다 TCP·UDP 두 행이고 참조 칸이 비어 있다). SNMP의 기본 전송은 UDP다 — RFC 3417 §1·§3.2, RFC 1157 §4. 위 「UDP 행이 있다고 …」와 같은 까닭으로, 여기서는 TCP 행이 있다고 SNMP가 TCP를 기본으로 쓰는 것이 아니다(TCP로 보내는 덧붙인 방식은 아래 「(phase 78 step 5) RFC 3417 …」 항목)
  - 10161 `snmptls`(TCP)·`snmpdtls`(UDP), 10162 `snmptls-trap`(TCP)·`snmpdtls-trap`(UDP) — TLS·DTLS로 감싼 SNMP의 포트(참조 RFC 6353)
  - 123 `ntp` — Network Time Protocol(TCP·UDP, 참조 RFC 5905). NTP와 SNTP가 쓰는 것은 UDP다 — RFC 5905 §7.3, RFC 4330 §4
  - 443 `https` — http protocol over TLS/SSL(TCP·UDP, 참조 RFC 9110 — 위 「(phase 77)」 줄). **설명 칸이 「TLS/SSL」로 두 이름을 함께 적는다**
  - 5060 `sip` — SIP, 5061 `sips` — SIP-TLS(둘 다 TCP·UDP 행의 참조는 RFC 3263이고 SCTP 행도 있다). RFC 3261의 기본 포트(5060 — UDP·TCP·SCTP, 5061 — TLS)와 맞는다 — RFC 3261 §18.1.1·§19.1.1
  - 기출 대조용: 181은 `unify` — Unify(TCP·UDP)이고, 143은 `imap`(TCP. UDP 143은 Reserved — 위 「(phase 78 step 0)」 줄)이다. 둘 다 SNMP의 번호가 아니다

쓰인 곳: (phase 74 step 5에서 쓰일 곳) `ip-address-types.dhcp`(서버 67·클라이언트 68, 53은 DNS의 포트)
(phase 77에서 쓰일 곳) `ports.port-number`(전송 프로토콜마다 따로 적는다 — 514·6379의 예), `ports.port-ranges`(머리의 세 범위, 0번 Reserved, 등록된 포트 예 다섯), `ports.well-known-ports`(여덟 서비스의 행, UDP 행이 있어도 UDP를 쓰는 것은 아니다), `exam-notes.md` E27·E28
(phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.smtp`(587), `app-protocols-mail-file.pop3`(110·995), `app-protocols-mail-file.imap`(143·993), `app-protocols-mail-file.tftp`(69 — UDP)
(phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.snmp`(161), `app-protocols-mgmt-security.snmp-operations`(162), `app-protocols-mgmt-security.ntp`·`sntp`(123), `app-protocols-mgmt-security.https`(443·80, 「TLS/SSL」 표기),
`app-protocols-mgmt-security.sip`(5060·5061), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — 181·143은 SNMP의 번호가 아니다)

## (phase 74 step 5) Microsoft Learn — How to use automatic TCP/IP addressing without a DHCP server, What is DHCP Server in Windows Server?, DHCP scopes in Windows Server, Check Microsoft Broadband Network Adapter
https://learn.microsoft.com/en-us/windows-server/troubleshoot/how-to-use-automatic-tcpip-addressing-without-a-dh
https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-top
https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-scopes
https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/ping-exe-check-microsoft-broadband-network-adapter

2026-10-29에 읽은 판(페이지의 `updated_at`): 자동 주소 지정 2025-09-22, DHCP Server 2025-05-14, DHCP scopes 2025-04-28, 네트워크 어댑터 확인 2026-02-19.
DHCP 두 문서는 Windows Server 2016~2025를, 어댑터 확인 문서는 지원되는 Windows 클라이언트를 대상으로 적는다. 자동 주소 지정 문서는 Windows 98~Windows Server 2003의 레지스트리 경로를 함께 적는 옛 KB 글이다 — 기능의 동작만 가져오고 설정 방법은 가져오지 않는다.

- **자동 개인 IP 주소 지정**(Automatic Private IP Addressing, APIPA): DHCP를 쓰도록 설정된 Windows 컴퓨터는 DHCP 서버가 없거나 잠시 멈춰 쓸 수 없으면 **스스로 IP 주소를 정한다**. IANA가 169.254.0.0~169.254.255.255를 이 용도로 남겨 두었고, 그래서 라우팅 가능한 주소와 부딪치지 않는다.
  서브넷 마스크는 255.255.0.0이고, 같은 LAN에서 APIPA를 쓰는(또는 169.254 주소를 손으로 정한) 컴퓨터와만 통신하며 다른 서브넷의 컴퓨터와는 통신하지 못한다. 기본으로 켜져 있다 — 자동 주소 지정 문서 첫머리와 「More Information」
- 주소를 정한 뒤에도 DHCP 서버를 다시 찾으려고 몇 분마다 DISCOVER를 보낸다 — 같은 문서 예 1·3(3분, 5분). `ipconfig /all`의 「Autoconfiguration Enabled」 줄이 Yes이고 주소가 169.254로 시작하면 APIPA로 정한 주소다 — 같은 문서.
  강의 p194의 `ipconfig /all` 화면에도 이 줄(「자동 구성 사용 : 예」)이 있다
- DHCP는 IP 호스트에 IP 주소와 서브넷 마스크·기본 게이트웨이 같은 설정을 자동으로 주는 클라이언트/서버 프로토콜이고, RFC 2131·2132가 BOOTP를 바탕으로 정의한다. 서버는 주소 묶음(pool)을 두고 클라이언트가 네트워크에서 켜질 때 주소를 **임대**하며,
  더는 쓰지 않는 주소는 자동으로 묶음에 돌아가 다시 쓰인다. DHCP 옵션의 예는 Router(기본 게이트웨이), DNS 서버, DNS 도메인 이름이다. 손으로 설정할 때 생기는 오타와, 같은 주소를 두 컴퓨터에 주어 생기는 충돌을 줄인다.
  모든 Windows 클라이언트에 DHCP 클라이언트가 들어 있고 기본으로 켜져 있다 — DHCP Server 문서 첫머리, 「Why use DHCP?」, 「Benefits of DHCP Server」
- 서버의 데이터베이스에는 특정 DHCP 클라이언트에 묶어 둔 **예약 주소**가 있어 한 클라이언트에 늘 같은 주소를 줄 수 있다 — DHCP Server 문서 「Why use DHCP?」
- **예약**(reservation): 네트워크에는 서버·라우터·스위치·프린터처럼 예약된(고정) IP 주소가 필요할 수 있는 장치가 있으니 그 목록을 만들어 두라. 예약은 MAC 주소를 기준으로 특정 NIC에 늘 같은 주소를 주고, 그 주소는 바뀌지 않는다. 장치가 DHCP를 지원해야 하고 DHCP 서버에 기대게 된다 — DHCP scopes 문서 「Reservations」.
  손으로 정적 주소를 넣은 장치는 DHCP 서버가 같은 주소를 남에게 주지 않도록 제외 범위(exclusion range)에 넣어야 한다 — 같은 문서 「Exclusion ranges」.
  (RFC 2131 §1의 수동 할당 — 관리자가 정한 주소를 DHCP가 전하기만 한다 — 과 같은 꼴로 읽히지만, 두 문서가 서로를 가리키지는 않는다)
- 범위(scope)는 한 서브넷에서 DHCP 클라이언트에 나눠 줄 주소 범위와 옵션이고, 서브넷 마스크·임대 기간·옵션(DNS 서버, 라우터·기본 게이트웨이 주소 등)을 갖는다 — DHCP scopes 문서 「Single scope」
- **루프백 확인**: 네트워크 어댑터를 확인하는 첫 단계로 `ping 127.0.0.1`을 실행해 응답 넷이 오는지 본다. 응답이 없으면 그 컴퓨터의 TCP/IP에 문제가 있을 수 있고, 이 단계를 통과해야 다음 단계(자기 어댑터 주소, 기본 게이트웨이로의 ping)로 넘어갈 수 있다 — 네트워크 어댑터 확인 문서 「Use Ping.exe to Check Your Hardware」
- (phase 78 step 11) 2026-11-11에 IPv4로 다시 내려받아 읽은 판: 자동 주소 지정 문서 `updated_at` 2025-09-22(`ms.date` 2020-05-26), 네트워크 어댑터 확인 문서 `updated_at` 2026-02-19(`ms.date` 2026-02-12, 「Applies to」 지원되는 Windows 클라이언트) — 위 줄과 같은 판이다
- (phase 78 step 11) **Windows ping의 요약 줄**: 네트워크 어댑터 확인 문서의 출력 예는 응답 넷(`Reply from <주소>: bytes=… time<1ms TTL=…`) 뒤에 요약을 둔다 — 「`Ping statistics for <주소>:`」 다음에 보낸 수(Sent)·받은 수(Received)·잃은 수(Lost)와 그 백분율, 이어 「대략의 왕복 시간(ms)」의 가장 짧은 값(Minimum)·가장 긴 값(Maximum)·평균(Average)이다.
  셋 다 요청 4개를 보내 4개를 받은(0% 손실) 예다 — 「Use Ping.exe to Check Your Hardware」 1~3단계의 예. 손실이 있는 예는 이 문서에 없다
- (phase 78 step 11) 자동 주소 지정 문서는 APIPA를 쓰는지 볼 때 `ipconfig /all`의 「Autoconfiguration Enabled」 줄과 「Autoconfiguration IP Address」를 보라고 한다 — 다만 이 대목은 Windows 2000·XP·Server 2003의 방법으로 적혀 있다 — 「More Information」(위 둘째 줄과 같은 대목)
- (phase 81 step 0) 2026-11-18에 IPv4로 다시 내려받아 읽은 판: DHCP Server 문서 `updated_at` 2025-05-14(`ms.date` 2025-05-13), DHCP scopes 2025-04-28(2023-08-11) — 위 줄과 같은 판이고, 둘 다 「Applies to」 Windows Server 2016~2025·Azure Local 2311.2 이후다.
  한국어판(「Windows Server의 DHCP(동적 호스트 구성 프로토콜) 서버란?」·「DHCP 범위」, `updated_at` 2026-01-21)도 받았다 — 용어 표기만 참고한다
- (phase 81 step 0) DHCP Server 문서가 Windows Server의 DHCP 서버 기능으로 드는 것 가운데 둘: **DHCP 서버 권한 부여** — AD에 권한을 받은 서버만 클라이언트에게 주소를 주게 해, 권한 없는 서버가 주소를 나눠 주는 일을 막는다. **DHCP 장애 조치** — DHCP 서버 두 대가 범위 하나를 함께 맡아 한쪽이 멈출 때를 대비하고(중복성) 요청을 나눠 받는다(부하 분산) — 「DHCP Server features」.
  둘의 자세한 사실은 아래 「(phase 81 step 0) Microsoft Learn — DHCP 서버 역할·범위·예약 …」·「(phase 81 step 0) Microsoft Learn — DHCP 장애 조치 …」 항목
- (phase 81 step 0) DHCP scopes: 서브넷 하나에는 범위를 하나만 둘 수 있고 그 범위는 이어진 주소 구간 하나다. 한 서브넷에서 떨어진 구간 여럿을 쓰려면 먼저 범위를 정한 뒤 필요한 제외 범위를 둔다 — 「Define a DHCP scope」.
  **제외 범위**(exclusion range)는 범위의 주소 구간 **안에 있는** 이어진 주소 구간으로, DHCP 서버가 클라이언트에게 주지 못하게 막아 둔 곳이다. 그래서 그 주소를 손으로 장치에 넣어도 주소가 부딪치지 않는다. 손으로 고정 주소를 넣은 장치의 주소를 모두 넣고, 앞으로 늘어날 장치를 위해 여유 주소를 더 넣어 두라고 권한다 — 「Exclusion ranges」(위 「Exclusion ranges」 줄에 정의를 더한다)

쓰인 곳: (phase 74 step 5에서 쓰일 곳) `ip-address-types.reserved-addresses`(169.254 — Windows는 DHCP 서버를 찾지 못하면 이 주소를 스스로 정한다, APIPA), `ip-address-types.loopback`(127.0.0.1로 ping해 자기 컴퓨터의 TCP/IP를 확인한다),
`ip-address-types.static-dynamic-address`(서버·프린터 같은 장치는 고정 주소가 필요할 수 있고, DHCP 예약으로도 늘 같은 주소를 줄 수 있다), `ip-address-types.dhcp`(주소와 설정의 자동 배정, 임대, 기본 게이트웨이 = 라우터 옵션), `exam-notes.md` 「phase 74 step 5」 문단
(phase 78 step 11에서 쓰일 곳) `diagnostic-commands.ping-options`(Windows ping 요약 줄의 꼴 — 보낸 수·받은 수·잃은 수와 백분율, 왕복 시간의 최소·최대·평균), `diagnostic-commands.ipconfig`(`/all`에 자동 구성 줄이 있다 — 옛 판의 방법으로 적힌 대목)
(phase 81 step 0에서 쓰일 곳) `windows-server-roles.dhcp-server-role`(권한 부여·장애 조치가 DHCP 서버 기능이다, 서브넷 하나에 범위 하나·이어진 구간 하나, 제외 범위의 정의), `windows-server-roles.dhcp-reservation`(위 「Reservations」 줄 — MAC 주소로 늘 같은 주소, 장치가 DHCP를 지원해야 하고 DHCP 서버에 기댄다),
`windows-server-roles.server-static-ip`(위 「Exclusion ranges」 줄 — 손으로 고정 주소를 넣은 장치는 제외 범위에), `windows-server-roles.dhcp-failover`(장애 조치가 무엇인지 한 줄)

## (phase 74 step 11) RFC 1930 — Guidelines for creation, selection, and registration of an Autonomous System (AS)
https://www.rfc-editor.org/rfc/rfc1930

BCP 6(Best Current Practice)이고 폐기되지 않았다. RFC 6996·RFC 7300이 고쳤다(rfc-editor 상태, 2026-10-29).

- AS의 정의는 오래 흐릿했다. 이 문서는 BGP-4 문서의 옛 정의(아래 RFC 4271 §1.1)를 들고 짧게 다시 정리한다 — **AS는 하나 이상의 네트워크 운영자가 운영하는, 서로 이어진 IP 접두사 하나 이상의 묶음이고, 라우팅 정책이 하나이며 분명히 정해져 있다** — §3
- 라우팅 정책은 AS 사이에 라우팅 정보를 주고받을 때 무엇을 알리고 무엇을 받아들일지의 결정이다. 예: AS X가 자기가 닿을 줄 아는 접두사를 AS Y에 알리고 Y가 그것을 받아들여야 그 접두사로 가는 트래픽이 Y에서 X로 흐른다.
  받은 정보를 쓸지 말지는 받는 AS의 몫이다 — §3
- 정책은 접두사 하나하나가 아니라 접두사들의 묶음에 대해 정하고, 그 묶음이 AS다. AS에는 세계에서 하나뿐인 번호(ASN)가 붙고, 이웃 AS와 외부 라우팅 정보를 주고받을 때와 그 AS를 가리킬 때 쓴다.
  AS는 자기 안에서 닿을 수 있다는 정보를 주고받을 때 보통 IGP를 하나 이상 쓴다 — §3
- AS에는 예외 없이 라우팅 정책이 **하나**뿐이어야 한다. 같은 관리 아래의 접두사를 묶는 편리한 이름으로 AS를 쓰는 것은 잘못이다 — §4
- 이 문서의 「접두사」는 CIDR 블록과 같은 말이다 — §3

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.as`(§3 — 정의, 하나의 분명한 라우팅 정책, 세계에서 하나뿐인 AS 번호, AS 안에서는 IGP), 강의 수정 이력 머리의 「phase 74 step 11」 문단(p215의 정의는 표준과 맞는다)

## (phase 74 step 11) IANA — Autonomous System (AS) Numbers, RFC 5398 — Autonomous System (AS) Number Reservation for Documentation Use, RFC 6793 — BGP Support for Four-Octet Autonomous System (AS) Number Space
https://www.iana.org/assignments/as-numbers/as-numbers.xhtml
https://www.rfc-editor.org/rfc/rfc5398
https://www.rfc-editor.org/rfc/rfc6793

레지스트리는 XML판(`…/as-numbers.xml`, 고친 날 2026-06-01)을 2026-10-29에 내려받아 읽었다. RFC 5398은 정보성(Informational), RFC 6793은 Proposed Standard이고 둘 다 폐기되지 않았다.

- AS 번호는 여러 라우팅 프로토콜이 쓴다. **IANA는 AS 번호를 지역 인터넷 등록 기관(RIR) 다섯 곳 — AFRINIC·APNIC·ARIN·LACNIC·RIPE NCC — 에 나눠 주고, RIR은 저마다의 정책에 따라 네트워크 운영자에게 다시 나눠 준다**.
  AS 번호는 자기 지역의 등록 기관에서 받는다 — 레지스트리 머리 설명
- 문서·예시에 쓰라고 남겨 둔 AS 번호가 두 묶음 있다 — 64496~64511과 65536~65551. 문서의 예를 실제 장비에 그대로 설정해도 실제로 쓰이는 번호와 부딪치지 않게 하려는 것이다 — RFC 5398 §2·§4, 레지스트리의 같은 행.
  (이 과목은 AS를 「AS 1」·「AS 2」 같은 이름표로 쓰므로 이 번호를 개념에 쓰지 않는다 — guide 「예시 값」)
- BGP 기본 규격에서 AS 번호는 2옥텟이었고, 2옥텟 번호가 바닥날 것에 대비해 4옥텟으로 실어 나르는 확장을 정했다 — RFC 6793 Abstract·§1

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.as`(AS마다 번호가 있고 IANA → RIR → 운영자 차례로 나눠 준다 — 쓸지는 step 14가 정한다)

## (phase 74 step 11) RFC 4271 — A Border Gateway Protocol 4 (BGP-4)
https://www.rfc-editor.org/rfc/rfc4271

Draft Standard이고 폐기되지 않았다. 옛 판 RFC 1771을 폐기하고 대신하며, RFC 6793·RFC 8212 등 여러 문서가 고쳤다(rfc-editor 상태, 2026-10-29).

- BGP는 **AS 사이의 라우팅 프로토콜**이다 — §1, §3
- BGP를 쓰는 시스템은 다른 BGP 시스템과 네트워크에 닿을 수 있다는 정보를 주고받고, 그 정보에는 **그 정보가 지나온 AS의 목록**이 들어 있다. 이것으로 AS들이 이어진 그래프를 그려 고리(routing loop)를 걸러 내고, AS 단위의 정책을 적용할 수 있다 — §1, §3
- 옛 정의의 AS는 한 기술 관리 아래의 라우터 묶음으로, AS 안에서는 IGP와 공통의 메트릭으로, 다른 AS로는 AS 사이의 라우팅 프로토콜로 패킷 경로를 정한다. 지금은 한 AS가 IGP와 메트릭을 여럿 쓰는 일이 흔하지만,
  다른 AS에게는 한결같은 내부 라우팅 계획을 보인다는 점이 AS라는 말의 핵심이다 — §1.1 「Autonomous System (AS)」. IGP는 한 AS 안의 라우터끼리 라우팅 정보를 주고받는 라우팅 프로토콜이다 — §1.1 「IGP」
- BGP는 EGP(RFC 904)와 그것을 NSFNET에서 쓴 경험을 바탕으로 만들었다 — §3
- BGP는 전송 프로토콜로 **TCP**를 쓰고 **TCP 포트 179**에서 연결을 기다린다. 처음에는 내보내도 되는 경로 전부를 보내고, 그 뒤에는 바뀐 것만 보낸다 — 주기적으로 표 전체를 다시 보내지 않는다 — §3
- BGP 스피커(BGP를 구현한 라우터)는 자기가 실제로 쓰는 경로만 이웃에게 알린다 — §1.1 「BGP speaker」, §3
- **AS_PATH** 속성은 그 경로 정보가 지나온 AS들을 가리킨다. 경로를 다른 AS의 이웃(external peer)에게 알릴 때는 자기 AS 번호를 목록 맨 앞에 붙이고, 같은 AS의 이웃에게 알릴 때는 바꾸지 않는다. 경로를 처음 만든 스피커는 자기 AS 번호 하나로 목록을 시작한다 — §5.1.2
- 결정 과정은 지역 정책 정보(PIB)를 받은 경로들에 적용해, 자기가 쓸 경로와 이웃에게 알릴 경로를 고른다 — §9.1. 다른 AS의 이웃에게서 받은 경로의 선호도는 **미리 설정한 정책**으로 계산하고, 그 정책과 계산의 세부는 각자 정할 일(local matter)이다 — §9.1.1
- **받은 경로의 AS_PATH에 고리가 있으면 그 경로는 고르는 후보에서 빼는 것이 좋다.** 고리는 AS 경로 전체를 훑어 자기 AS 번호가 들어 있는지로 찾는다 — §9.1.2

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.bgp`(§1·§3 — AS 사이, AS 목록, 고리·정책, TCP 179, §5.1.2 — AS 번호를 앞에 붙인다, §9.1·§9.1.1 — 정책으로 고른다, §9.1.2 — 자기 AS가 있으면 쓰지 않는다), `routing.as`(§1.1 — 옛 정의, IGP)

## (phase 74 step 11) RFC 4274 — BGP-4 Protocol Analysis
https://www.rfc-editor.org/rfc/rfc4274

정보성(Informational) 문서이고 폐기되지 않았다(rfc-editor 상태, 2026-10-29). 「경로 벡터」라는 이름의 근거로 쓴다.

- BGP의 알고리즘은 순수한 거리 벡터도 순수한 링크 상태도 아니고, **거리 벡터를 고친 알고리즘으로 「경로 벡터(Path Vector)」라 부른다**. 경로 정보를 써서 거리 벡터의 전통적인 문제를 피한다.
  BGP의 경로는 목적지 정보와 그 목적지까지의 경로 정보(AS_PATH)를 짝으로 갖고, 이 정보로 AS 고리를 찾아 고리 없는 경로를 고른다 — §2.2
- 경로 정보가 인터넷을 지나는 동안 지나온 AS들이 AS_PATH에 덧붙는다. AS_PATH는 라우팅 정보의 고리를 쉽게 막고, **정책 기반 라우팅**의 수단이 된다 — §2.1
- BGP는 처음에 전체 정보를 주고받은 뒤 바뀐 것만 주고받고, 그러려면 믿을 수 있는 전송이 필요해 TCP를 쓴다. 새 연결은 TCP 포트 179에서 받는다 — §2.2, §2.3

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.bgp`(§2.2 — 경로 벡터, 거리 벡터를 고친 방식, AS 고리, §2.1 — 정책 기반 라우팅), `exam-notes.md`의 「phase 74 step 11」 문단(BGP를 거리 벡터 쪽에 둔 두 문항)

## (phase 74 step 11) RFC 1772 — Application of the Border Gateway Protocol in the Internet
https://www.rfc-editor.org/rfc/rfc1772

Draft Standard이고 폐기 표시는 없다(rfc-editor 상태, 2026-10-29). 다만 BGP-4의 옛 규격 RFC 1771(지금은 RFC 4271이 대신한다)과 짝으로 쓴 1995년 문서라, 정책과 메트릭에 관한 설명에만 쓴다.

- AS 경로 전체를 실어 보내므로 라우팅 고리를 막고, 일부 거리 벡터 알고리즘의 「무한대까지 세기(count-to-infinity)」 문제를 없앤다 — §2
- RIP 같은 전통적인 거리 벡터 프로토콜은 경로에 메트릭이 **하나**(예: 홉 수)뿐이라 경로를 견주는 것이 수 두 개를 견주는 일이 된다. AS 사이에는 모두가 합의한 메트릭이 없어 AS마다 경로를 평가하는 기준이 따로 있다 — §6

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.rip`(§6 — RIP는 메트릭이 하나, 홉 수), `routing.bgp`(§2·§6 — AS 경로로 고리를 막는다, AS마다 기준이 다르다)

## (phase 74 step 11) RFC 904 — Exterior Gateway Protocol formal specification [Historic — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc904

rfc-editor 상태는 HISTORIC이다(2026-10-29). 지금 쓰지 않는 옛 프로토콜이라는 근거로만 쓴다.

- 이 문서는 **EGP(Exterior Gateway Protocol)라는 이름의 프로토콜 하나**를 정한다. 같은 AS나 서로 다른 AS의 게이트웨이(라우터)끼리 네트워크에 닿을 수 있다는 정보를 주고받는 데 쓰였다 — §1, §1.1
- 그래서 「EGP」는 AS 사이의 라우팅 프로토콜을 묶어 부르는 이름이자 이 옛 프로토콜의 이름이기도 하다 — RFC 1983 「Exterior Gateway Protocol (EGP)」(위 항목). 그 프로토콜은 지금 역사적인 것이고 BGP가 대신한다 — RFC 1812 §7.3.1, 부록 F.1(위 항목)

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.as`(EGP가 갈래 이름이자 옛 프로토콜 하나의 이름 — 한 줄)

## (phase 74 step 11) RFC 2453 — RIP Version 2
https://www.rfc-editor.org/rfc/rfc2453

STD 56, Internet Standard이고 폐기되지 않았다. RFC 4822가 고쳤다(rfc-editor 상태, 2026-10-29).

- RIP는 **벨먼-포드(곧 거리 벡터) 알고리즘**에 바탕을 둔 라우팅 프로토콜이다 — §3.1
- 인터넷은 AS들의 모임이고, AS 안에서 쓰는 라우팅 프로토콜을 IGP, AS 사이에 쓰는 것을 EGP라 한다. **RIP는 중간 크기 AS의 IGP로 만들었고** 더 복잡한 환경에는 맞지 않는다 — §3.1, §3.2.
  작은 네트워크에서는 쓰는 대역폭과 설정·관리 시간이 아주 적다는 장점이 있다 — §1
- 라우팅 프로토콜의 목적은 라우팅에 필요한 정보를 대 주는 것이다. 라우팅은 호스트나 라우터가 데이터그램을 어디로 보낼지 정하는 방법이고, 목적지가 바로 이어진 네트워크에 없으면 목적지에 더 가까운 라우터로 보낸다 — §3.1
- **거리 벡터**: 라우팅에 참여하는 각 장치(라우터나 호스트)는 목적지마다 한 항목을 두고, 항목에는 다음에 보낼 라우터와 그 목적지까지의 거리를 재는 **메트릭**이 있다. 주고받는 정보가 이 거리들의 목록뿐이어도 가장 좋은 경로를 계산할 수 있어서 거리 벡터라 부른다.
  정보는 **인접한 장치끼리만**, 곧 같은 네트워크를 함께 쓰는 장치끼리만 주고받는다. 데이터베이스는 바로 이어진 것들로 시작해 이웃 라우터가 보낸 메시지로 고친다 — §3.4
- 항목에 둘 정보의 예: 목적지 주소, 목적지로 가는 첫 라우터, 그 라우터에 닿는 데 쓸 물리 네트워크(인터페이스), 거리를 나타내는 메트릭, 마지막으로 고친 뒤 지난 시간 — §3.4.
  RIPv2의 항목에는 서브넷 마스크도 있어야 한다 — §3.5
- **홉**: 장치 i에서 장치 j로 다른 라우터를 거치지 않고 바로 갈 수 있으면 그 사이를 홉 하나로 보고 비용을 매긴다. 경로 전체의 메트릭은 홉마다의 비용을 더한 값이다 — §3.4. (홉의 양 끝은 라우터일 수도 호스트일 수도 있다 — 강의 수정 이력 L42)
- 이웃이 알려 온 거리에 그 이웃까지의 비용을 더해 견주고 **가장 작은 것**을 고른다. 실제 구현은 지금까지 본 가장 좋은(가장 작은) 메트릭과 그것을 알려 온 이웃을 기억했다가 더 작은 것을 보면 바꾼다 — §3.4
- **메트릭**: 네트워크마다 1~15의 비용이 있고, 경로의 메트릭은 지나는 네트워크들의 비용을 더한 값이다. 최대 경로 한도가 15라 보통 비용 1을 쓰고, **그러면 RIP의 메트릭은 단순한 홉 수가 된다**. 대역폭이나 신뢰성의 차이를 나타내려고 관리자가 더 큰 비용을 줄 수도 있다 — §3.5.
  RIP는 고정된 메트릭으로 경로를 견주므로 지연·신뢰성·부하처럼 그때그때 재는 값으로 경로를 고르는 데는 맞지 않는다 — §3.2
- **15홉 한도**: 가장 긴 경로가 15홉인 네트워크까지만 쓸 수 있다(네트워크마다 비용 1일 때). 메트릭 칸은 1~15이고, **16은 무한대 — 닿을 수 없는 목적지**를 뜻한다 — §3.2, §3.4.1, §3.6
- 관리자가 직접 넣는 경로를 둘 수도 있고 이것을 정적 경로라 부른다 — §3.5
- **UDP 포트 520**: RIP 메시지는 UDP로 주고받고, 라우터의 RIP 처리는 UDP 포트 520에서 보내고 받는다 — §3.6
- **30초마다** 라우팅 테이블 전체를 담은 응답 메시지를 이웃 라우터들에게 보낸다. 경로마다 시간 제한이 있어, 180초 동안 그 경로의 소식이 없으면 경로가 만료되고 메트릭을 16으로 둔 채 120초 뒤 표에서 지운다 — §3.8
- **RIPv1과 RIPv2**: RIP-1은 메시지에 서브넷 마스크가 없어, 라우터가 멀리 있는 경로의 마스크를 알 수 없고 그 경로가 서브넷 경로인지 호스트 경로인지도 가리지 못한다 — §2. RIPv2는 경로마다 **서브넷 마스크 칸**을 두어 주소에서 네트워크 부분을 가릴 수 있게 했다 — §4.3, §3.5.
  (마스크를 싣는 RIPv2와 싣지 않는 RIP(RFC 1058)의 구분은 RFC 4632 §5에도 있다 — 위 항목)

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.rip`(§3.1·§3.4 — 거리 벡터, 벨먼-포드, 이웃끼리만, §3.5 — 메트릭은 보통 홉 수, §3.2·§3.6 — 15홉, 16은 닿을 수 없음, §3.6 — UDP 520, §3.8 — 30초, §1·§3.2 — 작은·중간 크기 네트워크, §2·§4.3 — RIPv1과 RIPv2),
`routing.routing-table`(§3.4 — 항목의 칸, 작은 메트릭을 고른다), `routing.routing`(§3.1 — 라우팅 프로토콜의 목적), 강의 수정 이력 L42(§3.4 — 홉), `exam-notes.md` E18
(phase 77 step 3에서 쓰일 곳) `tcp-udp.transport-choice`(§3.6 — RIP 메시지는 UDP 520으로 주고받는다)
(phase 77 step 8) `tcp-udp.transport-choice`(§3.6 — UDP, §3.8 — 30초마다 경로 정보 전체를 이웃에게)

## (phase 74 step 11) RFC 1058 — Routing Information Protocol [Historic — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc1058

rfc-editor 상태는 HISTORIC이다(2026-10-29). RIP 버전 1을 정한 문서이고, 지금 규격은 위 RFC 2453이다.

- RIP-1의 메시지는 주소 칸에 호스트 주소·서브넷 번호·네트워크 번호·0(디폴트 라우트)을 가리지 않고 담고, **서브넷 마스크를 담지 않는다**. 받는 쪽은 마스크를 알아야 주소의 뜻을 가릴 수 있는데, 보통 바로 이어진 네트워크의 마스크만 안다.
  그래서 서브넷으로 가는 경로는 그 서브넷이 속한 네트워크 밖으로 내보내지 않는다 — §3.2

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.rip`(RIPv1은 마스크를 싣지 않는다 — 역사 기록), `exam-notes.md` E18

## (phase 74 step 11) RFC 2080 — RIPng for IPv6
https://www.rfc-editor.org/rfc/rfc2080

Proposed Standard이고 폐기되지 않았다(rfc-editor 상태, 2026-10-29). 이름만 쓴다.

- RIPng는 IPv4 인터넷에서 쓰이는 프로토콜과 알고리즘에 바탕을 둔, **IPv6용 라우팅 프로토콜**이다 — Abstract. UDP 포트 521을 쓴다 — §2.1

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.rip`(IPv6용은 RIPng — 쓸지는 step 15가 정한다)

## (phase 74 step 11) RFC 2328 — OSPF Version 2
https://www.rfc-editor.org/rfc/rfc2328

STD 54, Internet Standard이고 폐기되지 않았다. 여러 문서가 고쳤다(rfc-editor 상태, 2026-10-29). IPv4용 OSPF다.

- OSPF는 **IGP**로 분류된다 — 한 AS에 속한 라우터들 사이에 라우팅 정보를 나눠 준다. **링크 상태(SPF) 기술**에 바탕을 두며, 전통적인 TCP/IP 라우팅 프로토콜이 쓰던 벨먼-포드 방식과 다르다 — §1
- OSPF는 동적 라우팅 프로토콜이다 — 라우터 인터페이스 고장 같은 AS 안의 망 변화를 빨리 알아채고, 잠깐의 수렴 뒤 고리 없는 새 경로를 계산한다 — §1.1
- **링크 상태 방식**: 라우터마다 AS의 망 모양을 적은 **링크 상태 데이터베이스**를 갖고, 참여하는 모든 라우터의 데이터베이스는 같다. 데이터베이스의 조각 하나하나는 어떤 라우터의 지역 상태(쓸 수 있는 인터페이스, 닿을 수 있는 이웃)이고,
  라우터는 자기 지역 상태를 **플러딩**으로 AS 전체에 퍼뜨린다. 모든 라우터가 같은 알고리즘을 저마다 돌려, 데이터베이스에서 **자기를 뿌리로 한 최단 경로 나무**를 만든다 — §1.1, §2.2
- 최단 경로 나무는 목적지까지의 경로 전체를 주지만 전달에는 **다음 홉만** 쓴다 — §2.2
- 최단 경로 나무는 **다익스트라 알고리즘**으로 만든다 — §16.1, §6 「Shortest-path tree」
- (phase 74 step 15) 다익스트라 알고리즘은 뿌리(계산하는 라우터 자신)에서 경로를 찾은 후보들 가운데 **뿌리에서 가장 가까운 것**을 하나씩 최단 경로 나무에 더하고,
  그 이웃들을 살펴 후보를 고쳐 나간다 — 가장 가까운 후보까지의 경로는 가장 짧다는 것이 보장된다 — §16.1(첫 단계의 요약과 단계 (3), 2026-10-29에 rfc-editor 원문으로 확인)
- 경로의 비용은 단위 없는 메트릭 하나로 나타낸다 — §1.1. 인터페이스마다 그 인터페이스로 패킷을 보내는 **비용**(0보다 큰 값)을 두고, 그 값을 링크 비용으로 알린다 — §9 「Interface output cost(s)」, 부록 C.3.
  두 영역 사이의 경로는 비용이 가장 작은 경로들을 찾는다 — §3.2
- **같은 비용 다중 경로**: 목적지로 가는 비용이 같은 경로가 여럿이면 모두 찾아 쓰고, 트래픽을 그 경로들에 고르게 나눈다 — §1.1, §2.4, §16.8. 라우터가 그런 경로를 모두 기억해야 하는 것은 아니고 정한 수만큼만 둘 수도 있다 — §16.8
- **Hello**: Hello 프로토콜은 이웃 관계를 맺고 유지하며 이웃과의 통신이 양방향인지 확인한다. **Hello 패킷은 라우터의 모든 인터페이스로 주기적으로 보내고**, 브로드캐스트 망에서는 이것으로 이웃 라우터를 찾는다 — §1.2 「Hello Protocol」, §4, §7.1, §9.5.
  패킷 종류 표에서 Hello(타입 1)의 일은 「이웃을 찾고 유지한다」이다 — §4.3 표 8. Hello 패킷에는 보내는 간격(HelloInterval)과, 이웃이 얼마 동안 Hello를 못 들으면 그 라우터가 멈췄다고 볼지(RouterDeadInterval)가 들어 있다 — §9.5, §9 「RouterDeadInterval」
- OSPF는 망들을 묶은 **영역(area)** 을 둘 수 있다 — §1.1(이름만)
- 경로마다 목적지와 마스크를 함께 실어, 같은 네트워크 번호의 서브넷들이 서로 다른 크기를 가질 수 있다. 패킷은 가장 긴(가장 구체적인) 일치로 보낸다 — §1.1
- OSPF는 IP 프로토콜 번호 89다 — 부록 A.1(이름만)

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.ospf`(§1 — IGP, 링크 상태, 벨먼-포드와 다르다, §1.1·§2.2 — 같은 데이터베이스, 플러딩, 자기를 뿌리로 한 최단 경로 나무, §16.1 — 다익스트라, §1.1·§2.4·§16.8 — 같은 비용 다중 경로, §7.1·§9.5 — Hello, 인터페이스 비용),
`exam-notes.md`의 「phase 74 step 11」 문단. (phase 74 step 15) `routing.ospf`의 다익스트라 한 줄 풀이(§16.1 — 가장 가까운 후보부터 더한다)

## (phase 74 step 11) RFC 5340 — OSPF for IPv6
https://www.rfc-editor.org/rfc/rfc5340

Proposed Standard이고 폐기되지 않았다. 옛 판 RFC 2740을 폐기하고 대신한다(rfc-editor 상태, 2026-10-29).

- IPv6를 지원하려고 OSPF를 고친 것이다. 플러딩·영역·SPF 계산 같은 기본 동작은 그대로이고, IPv4와 IPv6의 차이와 커진 주소 때문에 바뀐 것이 있어 버전을 2에서 3으로 올렸다. **IPv6용 OSPF를 OSPFv3**라 부른다.
  IPv4용은 OSPF 버전 2다 — §1(위 RFC 2328 항목)
- 다익스트라 계산은 IPv4와 같다 — §4.8.1

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.ospf`(IPv4는 OSPFv2, IPv6는 OSPFv3)

## (phase 74 step 11) Linux man-pages — route(8), netstat(8), ip-route(8), Microsoft Learn — route, netstat
https://man7.org/linux/man-pages/man8/route.8.html
https://man7.org/linux/man-pages/man8/netstat.8.html
https://man7.org/linux/man-pages/man8/ip-route.8.html
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/route_ws2008
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netstat

2026-10-29에 읽은 판: man7.org는 net-tools(route 2025-09-10판, netstat 2026-05-10판)와 iproute2(ip-route) — 세 페이지 모두 2026-08-04에 upstream에서 가져온 것이다.
Microsoft Learn은 route(`updated_at` 2026-02-16)와 netstat(2026-09-08)이고, 둘 다 Windows Server 2016~2025와 Windows 10·11을 대상으로 적는다.
**명령의 이름과 그것이 무엇을 보여 주는지만** 적는다. 옵션과 출력 읽기는 `diagnostic-commands` 주제가 쓴다.

- Linux: `route`는 커널의 라우팅 테이블을 보여 주고 고친다. 출력의 칸은 Destination(목적지 네트워크나 호스트), Gateway(게이트웨이 주소, 없으면 `*`), Genmask(목적지의 넷마스크 — 디폴트 라우트는 `0.0.0.0`), Flags, Metric(목적지까지의 「거리」, 대개 홉 수로 센다), Iface 등이다 — route(8) NAME·OUTPUT.
  netlink 커널 인터페이스가 들어온 뒤로 이 도구는 `ip route` 명령이 대부분 대신한다 — route(8) HISTORY
- Linux: `netstat -r`(`--route`)은 커널의 라우팅 테이블을 보여 준다. netstat은 대부분 낡았고, `netstat -r`을 대신하는 것은 `ip route`다 — netstat(8) NAME·SYNOPSIS·NOTES
- Linux: `ip route`는 라우팅 테이블을 관리한다. `ip route show`가 경로를 나열한다 — ip-route(8) NAME·DESCRIPTION
- Windows: `route`는 그 컴퓨터의 IP 라우팅 테이블 항목을 보여 주고 고친다. `route print`가 표 전체를 보여 준다. 항목의 목적지는 네트워크 주소, 호스트 주소, 또는 **디폴트 라우트를 뜻하는 `0.0.0.0`** 이고,
  게이트웨이는 그 목적지에 닿으려고 넘길 **다음 홉 IP 주소**다 — 바로 붙은 서브넷이면 그 서브넷에 붙은 인터페이스의 주소, 라우터를 거쳐야 하면 바로 닿는 이웃 라우터의 주소다.
  메트릭은 목적지에 가장 잘 맞는 경로가 여럿일 때 고르는 데 쓰는 정수 비용이다. 문서의 예 하나가 기본 게이트웨이 주소로 가는 디폴트 라우트를 목적지 `0.0.0.0`·마스크 `0.0.0.0`으로 넣는다 — route 문서의 설명·Parameters·Examples
- Windows: `netstat -r`은 IP 라우팅 테이블의 내용을 보여 주고, `route print`와 같다 — netstat 문서 Parameters
- (phase 77 step 9, 2026-11-10에 다시 읽음 — man7.org netstat(8)은 net-tools 2026-05-10판(upstream에서 2026-08-04에 가져옴), Microsoft Learn netstat은 `updated_at` 2026-09-08) **TCP 상태의 표기**:
  Linux netstat(8)의 State 칸은 ESTABLISHED, SYN_SENT, SYN_RECV, FIN_WAIT1, FIN_WAIT2, TIME_WAIT, CLOSE(쓰이지 않는 소켓), CLOSE_WAIT, LAST_ACK, LISTEN, CLOSING 같은 값을 보인다 — 밑줄로 잇고 몇 이름을 줄여 적는다(SYN_RECV, FIN_WAIT1) — netstat(8) 「State」.
  같은 페이지는 netstat이 대부분 낡았고 대신 쓰는 것이 ss라고 적는다 — NOTES.
  Windows netstat 문서는 TCP 연결의 상태로 CLOSE_WAIT, CLOSED, ESTABLISHED, FIN_WAIT_1, FIN_WAIT_2, LAST_ACK, LISTEN, **SYN_RECEIVED**, SYN_SEND, TIMED_WAIT를 든다 — Remarks의 State. 곧 RFC의 SYN-RECEIVED를 밑줄로 이은 SYN_RECEIVED가 이 문서의 표기다.
  이 문서는 SYN-SENT를 SYN_SEND로, TIME-WAIT를 TIMED_WAIT로 적고 CLOSING은 들지 않는다 — RFC 9293 §3.3.2와 이름이 다른 곳이라 본문에 옮기지 않는다
- (phase 78 step 11) 2026-11-11에 IPv4로 다시 내려받아 읽은 판: man7.org netstat(8)은 net-tools 2026-05-10판(upstream Git에서 2026-08-04에 가져옴, 그때 최신 커밋 2026-06-12, HTML 2026-09-09).
  Microsoft Learn netstat은 `updated_at` 2026-09-08(바닥의 「Last updated on」도 2026-09-08, `ms.date` 2017-10-16), route는 `updated_at` 2026-02-16(「Last updated on」 2023-02-03, `ms.date` 2022-10-05) — 둘 다 「Applies to」 Windows Server 2016~2025, Windows 10·11, Azure Local 2311.2 이후
- (phase 78 step 11) **Windows netstat이 보이는 것**: 활성 TCP 연결, 이 컴퓨터가 연결을 기다리는(listening) 포트, 이더넷 통계, IP 라우팅 테이블, 프로토콜마다의 IPv4 통계(IP·ICMP·TCP·UDP)와 IPv6 통계(IPv6·ICMPv6·IPv6 위의 TCP·UDP)다.
  **옵션 없이 부르면 활성 TCP 연결만** 보인다 — 첫 문단. 네트워크 어댑터 속성에 TCP/IP가 설치돼 있어야 쓸 수 있다 — 「Important」
- (phase 78 step 11) **Windows netstat의 옵션**(문서는 옵션을 하이픈으로 적는다 — Syntax·Parameters·Examples): `-a`는 활성 TCP 연결 모두와 이 컴퓨터가 기다리는 TCP·UDP 포트를 보인다.
  `-b`는 연결이나 기다리는 포트마다 그것을 만든 **실행 파일**을 보인다 — 한 실행 파일이 여러 구성 요소를 품은 경우에는 구성 요소의 차례를 보이고 실행 파일 이름은 그 아래 `[ ]` 안에 적는다. 시간이 걸릴 수 있고, **권한이 충분하지 않으면 실패한다**(어떤 권한인지 이름을 대지는 않는다).
  `-e`는 주고받은 바이트 수·패킷 수 같은 **이더넷 통계**를 보이고 `-s`와 함께 쓸 수 있다. `-n`은 활성 TCP 연결을 보이되 주소와 포트를 **숫자로** 적고 이름을 알아내려 하지 않는다.
  `-o`는 활성 TCP 연결과 연결마다의 **PID**를 보이고, 그 PID로 작업 관리자의 프로세스 탭에서 응용 프로그램을 찾을 수 있다 — `-a`·`-n`·`-p`와 함께 쓸 수 있다.
  `-p <Protocol>`은 **뒤에 적은 프로토콜의 연결만** 보인다 — 고를 수 있는 것은 tcp·udp·tcpv6·udpv6이고, `-s`와 함께 쓸 때는 icmp·ip·icmpv6·ipv6도 고를 수 있다.
  `-s`는 프로토콜마다의 통계를 보인다(기본은 TCP·UDP·ICMP·IP, IPv6가 있으면 그 넷의 IPv6판도). `-r`은 IP 라우팅 테이블을 보이고 `route print`와 같다(위 줄). 끝에 수(초)를 적으면 그 간격마다 다시 보이고 Ctrl+C로 멈춘다 — 「Parameters」
- (phase 78 step 11) Windows netstat의 **결과 칸**(Remarks): Proto(TCP나 UDP), Local address(이 컴퓨터의 IP 주소와 쓰는 포트 번호), Foreign address(소켓이 이어진 **원격 컴퓨터**의 IP 주소와 포트 번호), State(TCP 연결의 상태 — 위 「(phase 77 step 9)」 줄의 이름들).
  `-n`을 주지 않으면 주소와 포트를 이름으로 바꿔 보이고, 포트가 아직 정해지지 않았으면 포트 자리에 `*`를 적는다 — Remarks. **출력 예는 없다** — 칸 이름과 뜻만 있다. `-o`의 PID가 어느 칸에 놓이는지는 적혀 있지 않다
- (phase 78 step 11) Windows netstat의 **옵션을 이어 쓰는 꼴**: Examples가 `netstat -e -s`, `netstat -s -p tcp udp`, `netstat -o 5`, `netstat -n -o`와, 다섯 옵션을 한데 이은 `netstat -anobq`(모든 연결·기다리는 포트·묶였지만 기다리지 않는 포트를 숫자로, PID와 실행 파일까지)를 든다 — 「Examples」.
  `netstat -ano`라는 꼴 그대로의 예는 이 페이지에 없다 — 옵션 셋을 이은 것이다. 문제 해결 문서도 `netstat -nato`·`netstat -anb`처럼 이어 쓴다(아래 「(phase 78 step 11) Microsoft Learn — Windows Server 문제 해결 문서」 항목)
- (phase 78 step 11) Windows `route`의 `if` 매개변수 설명은 **인터페이스 목록과 그 인터페이스 번호(인덱스)를 `route print`가 보이는 화면에서 찾으라**고 한다 — route 「Parameters」. 곧 `route print`(= `netstat -r`)는 라우팅 테이블과 함께 인터페이스 목록을 보인다.
  그 화면의 꼴(출력 예)은 route 페이지에 없다 — `exam-notes.md` E34
- (phase 78 step 11) **Linux netstat(8)**: 이름 줄은 네트워크 연결·라우팅 테이블·인터페이스 통계 등을 보인다고 적는다 — NAME. 첫 인자 없이 부르면 **열린 소켓**의 목록을 보인다 — DESCRIPTION 「Invocation Mode」.
  `-r`(`--route`)은 커널 라우팅 테이블(`route -e`와 같은 출력), `-i`(`--interfaces`)는 모든 네트워크 인터페이스의 표와 받기·보내기 오류 수, `-s`(`--statistics`)는 프로토콜마다의 요약 통계다 — 같은 절
- (phase 78 step 11) Linux netstat(8)의 옵션(기출이 묻는 것): `-a`(`--all`)는 **연결을 기다리는 소켓과 그렇지 않은 소켓을 모두** 보인다(`-i`와 함께 쓰면 켜지지 않은(up이 아닌) 인터페이스도 보인다). `-l`(`--listening`)은 **기다리는 소켓만** 보인다 — 기다리는 소켓은 기본으로 빠진다.
  `-n`(`--numeric`)은 호스트·포트·사용자 이름을 알아내지 않고 숫자로 보인다. `-p`(`--program`)는 소켓마다 그것을 가진 프로그램의 **PID와 이름**을 보인다 — 다른 프로세스를 들여다볼 권한이 없거나 소켓이 커널의 것이면 하이픈(`-`)을 보이고, 페이지는 이 값을 믿을 만하지 않다고 덧붙인다.
  자기 것이 아닌 소켓의 이 정보를 보려면 **슈퍼유저 권한**도 있어야 한다 — OPTIONS, OUTPUT 「PID/Program name」. `-o`(`--timers`)는 네트워크 타이머에 관한 정보를 더한다 — OPTIONS.
  **`-t`·`-u`는 OPTIONS 절에 설명이 없고** SYNOPSIS에 긴 이름 `--tcp|-t`·`--udp|-u`로만 나온다. EXAMPLES의 `netstat -tulpn`이 「열린 TCP·UDP 포트를 모두, 해당 프로세스의 PID와 함께(root 권한 필요)」 보이는 예다 — 그래서 `-t`는 TCP, `-u`는 UDP이고 **시간과는 관계가 없다**. 타이머(시간)는 `-o`의 몫이다 — SYNOPSIS, EXAMPLES, OPTIONS
- (phase 78 step 11) Linux netstat(8)의 **결과 칸**(OUTPUT 「Active Internet connections」): Proto(tcp·udp 등), Recv-Q(연결이 맺어진 소켓에서 받았지만 프로그램이 아직 가져가지 않은 바이트 수)·Send-Q(보냈지만 상대가 아직 확인하지 않은 바이트 수 — 기다리는 소켓에서는 두 칸의 뜻이 다르다), Local Address(소켓의 이쪽 끝 주소와 포트 — `-n`이 없으면 이름과 서비스 이름으로 바꾼다), Foreign Address(소켓의 저쪽 끝 주소와 포트),
  State(위 「(phase 77 step 9)」 줄 — LISTEN 상태의 소켓은 `-l`이나 `-a`를 줘야 나온다), User, PID/Program name(`--program`이 이 칸을 넣는다), Timer(`-o`)의 차례로 설명한다. User 칸을 어느 옵션이 넣는지는 적혀 있지 않다. **출력 예는 없다** — 칸 설명만 있다
- (phase 78 step 11) Linux netstat(8)의 다른 사실: `/etc/services`는 서비스 이름을 바꿔 보일 때 읽는 파일이다(FILES — 「services translation file」). EXAMPLES의 둘째 예는 라우팅 테이블을 숫자로 보이는 `netstat -rn`이다.
  소켓이 많은 서버에서는 느리니 ss(8)를 쓰라고 한다 — BUGS. netstat이 대부분 낡았고 대신 쓰는 것이 ss라는 것은 위 줄(NOTES)
- (phase 78 step 15, 2026-11-11에 IPv4로 다시 읽음 — 같은 판) Linux netstat(8)의 **PID/Program name 칸**은 소켓을 가진 프로세스의 PID와 프로세스 이름을 **빗금으로 이은 짝**(`PID/이름` — 본문의 `812/sshd` 꼴)이다 — OUTPUT 「Active Internet connections」의 「PID/Program name」

쓰인 곳: (phase 74 step 11에서 쓰일 곳) `routing.routing-table`(호스트에서 표를 보는 명령의 이름 — Linux `ip route`·`route`·`netstat -r`, Windows `route print`·`netstat -r`, 칸의 뜻), `routing.default-route`(목적지·마스크 `0.0.0.0`이 디폴트 라우트, 기본 게이트웨이로 가는 디폴트 라우트), 강의 수정 이력 머리의 「phase 74 step 11」 문단(p209–p210의 `route -v`·`netstat -rn`)
(phase 77 step 9에서 쓰일 곳) `tcp-connection.tcp-states`(상태 이름을 밑줄로 잇는 표기 — Windows netstat의 SYN_RECEIVED, Linux netstat의 SYN_RECV), `exam-notes.md`의 「phase 77 step 9」 문단(기출의 SYN_RECEIVED 표기, 오답 보기 CLOSE)
(phase 78 step 11에서 쓰일 곳) `diagnostic-commands.netstat`(Windows — 보이는 것 다섯, 옵션 없으면 활성 TCP 연결만, 결과 칸 넷과 뜻, 출력 예 없음; Linux — 열린 소켓 목록, 결과 칸, 기다리는 소켓은 `-l`·`-a`, 출력 예 없음, 낡았고 ss가 대신한다),
`diagnostic-commands.netstat-windows-options`(`-a`·`-n`·`-o`(작업 관리자)·`-b`(권한이 모자라면 실패)·`-p`(프로토콜 고르기)·`-r`(= `route print`, 인터페이스 목록도)·`-s`·`-e`, `-anobq`처럼 이어 쓰기),
`diagnostic-commands.netstat-linux-options`(`-a`·`-n`·`-t`·`-u`·`-l`·`-p`(남의 소켓은 슈퍼유저)·`-r`, `-t`는 TCP이고 타이머는 `-o`, `netstat -tulpn` 예; (phase 78 step 15) PID/Program name 칸의 빗금 꼴 — 본문·도식), `exam-notes.md` 「phase 78 step 11」 문단과 E34

## (phase 75) FHS 3.0 — Filesystem Hierarchy Standard
https://refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.html

Version 3.0, 2015-03-19 발행. The Linux Foundation의 LSB Workgroup이 낸 판이고, hier(7)도 이 판을 근거 표준으로 든다(아래 hier(7) 항목). 2026-10-30에 HTML판을 내려받아 읽었다.

- **무엇인가**: 유닉스 계열 운영체제에서 파일과 디렉터리를 어디에 둘지 정한 요구와 지침이다. 소프트웨어와 사용자가 설치된 파일·디렉터리가 어디 있을지 미리 알 수 있게 하는 것이 목적이다 — Abstract, §1.1
- 파일을 두 기준으로 가른다 — 여러 컴퓨터가 함께 쓸 수 있는가(shareable·unshareable), 관리자가 손대지 않으면 바뀌지 않는가(static·variable). 성질이 다른 파일은 다른 디렉터리에 둔다.
  바뀌는 파일을 /usr에서 /var로 옮겨서 /usr를 읽기 전용으로 마운트할 수 있게 됐다 — ch.2
- 루트 파일 시스템에는 시스템을 부팅하고 복구하는 데 필요한 것이 있어야 한다. /usr·/opt·/var는 다른 파티션이나 파일 시스템에 둘 수 있게 설계했다 — §3.1
- 루트 디렉터리 바로 아래 있어야 하는 것(디렉터리나, 디렉터리를 가리키는 심볼릭 링크): bin, boot, dev, etc, lib, media, mnt, opt, run, sbin, srv, tmp, usr, var — §3.2. 그 하위 시스템이 있으면 home, lib<qual>, root도 — §3.3.
  /proc은 이 목록에 없고 Linux 부록(§6.1.5)에 있다
- **/bin**: 관리자와 사용자가 함께 쓰는 명령 가운데, 다른 파일 시스템이 하나도 마운트되지 않았을 때(예: 단일 사용자 모드)에도 있어야 하는 것 — §3.4.1. 그만큼 필수적이지 않은 명령은 /usr/bin에 둔다 — §3.4 각주 1.
  /bin에 있어야 하는 명령의 예: cat, chmod, chown, cp — §3.4.2
- **/boot**: 부트 로더가 쓰는 정적 파일 — 커널이 사용자 모드 프로그램을 실행하기 전에 쓰는 데이터 — §3.5.1. 운영체제 커널은 / 나 /boot에 있어야 한다 — §3.5.2
- **/dev**: 특수 파일, 곧 장치 파일을 두는 곳 — §3.6.1
- **/etc**: 설정 파일을 둔다. 설정 파일은 프로그램의 동작을 정하는 정적인 로컬 파일이고 실행 가능한 바이너리일 수 없다. /etc 아래에는 바이너리를 두지 않는다 — §3.7.1, §3.7.2.
  시작·종료 때 쓰는 명령 스크립트처럼 사람이 읽을 수 있는 실행 스크립트는 둘 수 있다 — §3.7 각주 2.
  그 하위 시스템이 있으면 있어야 할 파일로 fstab(파일 시스템의 정적 정보), passwd(암호 파일), group, hosts, resolv.conf 등을 든다 — §3.7.3. shadow 암호 묶음을 쓰는 시스템은 /etc/shadow 같은 설정 파일을 /etc에 더 둔다 — §3.7.3 각주 3
- **/home**: 사용자 홈 디렉터리(선택). 사이트마다 다르므로 프로그램은 홈 디렉터리 위치를 가정하지 말고 물어야 한다 — §3.8.1. 사용자 계정을 어디 둘지는 사람마다 다르지만 FHS는 /home을 기본 자리로 권하고,
  작은 시스템에서는 사용자마다 /home 바로 아래 디렉터리를 둔다(문서의 예는 /home/smith) — §3.8 각주 6. 애플리케이션의 사용자별 설정 파일은 홈 디렉터리에 점(.)으로 시작하는 이름으로 둔다 — §3.8.2
- **/lib**: 시스템을 부팅하고 루트 파일 시스템의 명령(/bin·/sbin의 것)을 실행하는 데 필요한 공유 라이브러리 — §3.9.1. 커널 모듈은 /lib/modules — §3.9.3
- **/mnt**: 관리자가 파일 시스템을 잠깐 마운트하는 자리 — §3.12.1. **/media**: 이동식 매체의 마운트 지점 — §3.11.1
- **/root**: root 계정 홈 디렉터리의 권장 기본 위치(선택) — §3.14.1
- **/sbin**: 시스템 관리에 쓰는 명령(root만 쓰는 명령 포함)은 /sbin·/usr/sbin·/usr/local/sbin에 두고, /sbin에는 그 가운데 부팅·복구에 꼭 필요한 것을 둔다 — §3.16.1.
  있으면 /sbin에 둘 것으로 `fsck.*`(파일 시스템별 점검·복구)와 `mkfs.*`(파일 시스템별 만들기)를 든다 — §3.16.3. Linux는 파일 시스템 유지보수와 부트 로더 관리 명령을 /sbin에 둔다 — §6.1.6
- **/tmp**: 임시 파일이 필요한 프로그램을 위한 곳이고, 프로그램은 실행과 실행 사이에 /tmp의 파일이 남아 있다고 가정하면 안 된다. 부팅할 때 지우기를 권한다(요구는 아니다) — §3.18.1
- **/usr**: 파일 시스템의 두 번째 큰 부분으로, 여러 호스트가 함께 쓸 수 있는 **읽기 전용 데이터**다. 운영 중에 쓰면 안 되고, 호스트마다 다르거나 시간에 따라 바뀌는 것은 다른 곳에 둔다 — §4.1.
  있어야 하는 하위 디렉터리: bin(대부분의 사용자 명령), lib, local, sbin, share — §4.2
- **/var**: 바뀌는 데이터 파일 — 스풀, 관리·로그 데이터, 일시·임시 파일. /usr를 읽기 전용으로 마운트할 수 있게 하려고 정한 곳이다 — §5.1.
  **/var/log**는 여러 로그 파일을 두는 곳이고 로그 대부분을 여기에 쓴다 — §5.10.1. **/var/mail**은 사용자 메일함 파일을 둔다 — §5.11.1
- **/proc**(Linux 부록): proc 파일 시스템은 Linux에서 프로세스와 시스템 정보를 다루는 사실상 표준 방법이다 — §6.1.5
- FHS는 /bin을 /usr/bin과 합쳐 두는 배치(이른바 /usr 병합)를 말하지 않는다. 루트 바로 아래 항목을 「디렉터리 또는 디렉터리를 가리키는 심볼릭 링크」로 허용할 뿐이다 — §3.2.
  그 배치를 다룰 법한 systemd의 file-hierarchy(7)는 이제 UAPI 그룹의 문서(허용한 출처가 아니다)를 가리키기만 한다(아래 systemd 항목). **그러니 /usr 병합은 쓰지 않는다**
- (phase 76) **/var/log에 있어야 하는 파일**(그 하위 시스템이 설치되어 있으면): `lastlog`(사용자마다 마지막 로그인 기록), `messages`(syslogd가 남기는 시스템 메시지), `wtmp`(모든 로그인·로그아웃 기록) — §5.10.2
  (https://refspecs.linuxfoundation.org/FHS_3.0/fhs/ch05s10.html, 2026-11-04에 내려받아 읽음). `dmesg`·`btmp`·`cron`은 이 목록에 없다 — `exam-notes.md` E25

쓰인 곳: (phase 75에서 쓰일 곳) `linux-filesystem.directory-hierarchy`(Abstract·§1.1 — FHS가 무엇인가, §3.1 — /usr·/var를 다른 파티션에 둘 수 있다), `linux-filesystem.standard-directories`(항목마다의 절),
`linux-filesystem.etc-directory`(§3.7.1·§3.7.2·§3.7.3, 각주 3), `linux-filesystem.proc-filesystem`(§6.1.5), `exam-notes.md`의 「phase 75 step 0」 문단
(phase 76에서 쓰일 곳) `linux-process-boot.dmesg`(§5.10.2 — `/var/log/dmesg`는 이 목록에 없다), `exam-notes.md` E25
(phase 79 step 0에서 쓰일 곳) `dns.hosts-file`(§3.7.3 — `/etc` 아래 hosts. 줄의 꼴은 아래 「(phase 79 step 0) Linux man-pages — hosts(5), nsswitch.conf(5)」 항목)
(phase 79 step 9에서 쓰일 곳) `linux-servers.resolv-conf`(§3.7.3 — `/etc` 아래 resolv.conf. 줄의 꼴은 아래 「(phase 79 step 9) Linux man-pages — resolv.conf(5) …」 항목)

## (phase 75) POSIX.1-2024 — Base Definitions §3 Definitions, §4 General Concepts
https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap03.html
https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap04.html

The Open Group Base Specifications Issue 8, IEEE Std 1003.1-2024(2024년판). 2026-10-30에 HTML판을 내려받아 읽었다.

- 시스템의 파일은 나무 꼴로 짜여 있고, 끝이 아닌 마디는 모두 디렉터리, 끝 마디는 디렉터리가 아닌 파일이다(한 파일을 여러 디렉터리 항목이 가리킬 수 있어 엄밀히는 방향 그래프다) — §4.8 File Hierarchy
- **디렉터리**는 디렉터리 항목들을 담은 파일이고, 한 디렉터리 안의 항목 이름은 서로 겹치지 않는다. **디렉터리 항목**(하드 링크)은 파일 이름 하나를 파일 하나와 잇는다 — §3.103, §3.104
- **파일**은 읽거나 쓸 수 있는 대상이고, 접근 권한과 종류 같은 속성을 가진다. 종류에는 일반 파일·문자 특수 파일·블록 특수 파일·FIFO·심볼릭 링크·소켓·디렉터리가 있다 — §3.139
- **경로**(pathname)는 파일을 가리키는 문자열이고, 앞에 `/`가 올 수 있으며 파일 이름들을 `/`로 이어 적는다 — §3.254. `/`로 시작하는 경로가 **절대 경로**다 — §3.2.
  경로를 풀 때는 앞 이름이 가리키는 디렉터리에서 다음 이름을 찾는다. `/`로 시작하면 첫 이름을 그 프로세스의 루트 디렉터리에서 찾고, 그렇지 않으면 현재 작업 디렉터리에서 찾는다(상대 경로) — §4.16 Pathname Resolution
- **루트 디렉터리**는 `/`로 시작하는 경로를 풀 때 쓰는 디렉터리다 — §3.316
- **홈 디렉터리**는 HOME 환경 변수가 가리키는 디렉터리다 — §3.170
- **마운트 지점**은 시스템의 루트 디렉터리이거나, 부모 디렉터리와 다른 장치에 속한 디렉터리다 — §3.210. **파일 시스템**은 파일들과 그 속성 일부를 모은 것이다 — §3.153
- **블록 특수 파일**은 장치를 가리키는 파일이고, 장치의 하드웨어 특성을 드러내지 않고 장치에 접근하게 한다 — §3.50. **장치**는 컴퓨터 주변 장치나 응용 프로그램에 그렇게 보이는 대상이다 — §3.101
- **프로세스**: 주소 공간 하나와 그 안에서 실행되는 스레드, 그 스레드가 쓰는 시스템 자원 — §3.189(Live Process), §3.279. **프로세스 ID**는 프로세스가 살아 있는 동안 그것을 가리키는 양의 정수다 — §3.284
- (phase 75 step 7) **사용자 ID**는 시스템 사용자 한 사람을 가리키는 0 이상의 정수다 — §3.408. **그룹 ID**는 시스템 사용자 여럿을 묶은 그룹을 가리키는 정수이고, 사용자는 누구나 그룹 하나 이상에 든다 — §3.165.
  프로세스는 실효 그룹 ID 말고도 **보조 그룹 ID**를 여럿 가질 수 있고, 이것도 파일 접근 권한을 가를 때 쓴다 — §3.361, §3.117(실효 사용자 ID도 권한을 가를 때 쓰는 프로세스의 속성이다)
- (phase 75 step 7) **세 부류**: 프로세스의 실효 사용자 ID가 파일의 사용자 ID와 같으면 그 프로세스는 그 파일의 **소유자 부류**(file owner class)다 — §3.150.
  소유자 부류가 **아니면서** 실효 그룹 ID나 보조 그룹 ID 가운데 하나가 파일의 그룹 ID와 같으면 **그룹 부류**(file group class)다 — §3.142. 둘 다 아니면 **그 밖의 부류**(file other class)다 — §3.149.
  그러니 소유자는 그 파일의 그룹에 들어 있어도 그룹 부류로 세지 않는다. **파일 권한 비트**는 소유자·그룹·그 밖의 세 몫으로 나뉘고, 몫마다 같은 이름의 부류에 쓰인다 — §3.151
- (phase 75 step 7) **파일 접근 권한**: 프로세스가 읽기·쓰기·실행(디렉터리는 검색)을 요청하면, 특권이 없는 프로세스는 자기가 속한 부류의 그 비트가 켜져 있을 때만 허락받는다.
  적절한 특권(appropriate privileges)을 가진 프로세스는 읽기·쓰기·디렉터리 검색을 늘 허락받지만, **실행은 권한 비트가 적어도 한 부류에게 실행을 주고 있을 때만** 허락받는다 — §4.7 File Access Permissions.
  무엇이 「적절한 특권」인지는 구현이 정한다 — §3.21(Linux는 아래 path_resolution(7)·capabilities(7))
- (phase 75 step 7) **문자 특수 파일**은 장치(터미널 장치 파일 같은 것)를 가리키거나 `/dev/null`처럼 특별한 성질을 가진 파일이다 — §3.62. **일반 파일**은 시스템이 아무 짜임도 덧씌우지 않은, 아무 자리나 골라 읽을 수 있는 바이트의 나열이다 — §3.310.
  **심볼릭 링크**는 경로를 풀다 만나면 그 안에 담긴 문자열로 경로 풀이를 바꾸게 하는 종류의 파일이다 — §3.364. **하드 링크**는 디렉터리 항목의 다른 이름이고, `ln`(`-s` 없이)이나 link()로 한 파일에 여럿을 만들 수 있다. 심볼릭 링크와 대비되는 말이다 — §3.168, §3.104
- (phase 75 step 12) **셸**은 글로 입력된 것을 명령으로 해석하는 프로그램이고, 입력을 흐름으로 받아 읽기도 하고 터미널에서 사용자에게 입력을 청해 읽기도 한다 — §3.333.
  같은 일을 하는 창구를 **명령 언어 해석기**(command language interpreter)라 부르고, 그 가장 뚜렷한 예가 `sh` 유틸리티다 — §3.77, §3.334
- (phase 75 step 12) **명령**은 셸에게 어떤 일을 하라는 지시다 — §3.76. **인자**는 명령 이름 뒤에 오는 옵션·옵션 인자·피연산자를 함께 이르는 말이고, 실행되는 프로그램에는 하나씩 문자열로 넘어간다 — §3.22.
  **옵션**은 대개 그 유틸리티의 기본 동작을 바꾸는 인자이고 — §3.244, **피연산자**(operand)는 대개 옵션 뒤에 와서 유틸리티가 일을 마치는 데 필요한 대상을 주는 인자다 — §3.242.
  예: `ls -l /home`에서 `ls`가 명령 이름, `-l`이 옵션, `/home`이 피연산자다(POSIX `ls`의 SYNOPSIS `ls [-l…] [file...]`가 이 꼴이다)
- (phase 75 step 12) **유틸리티**는 셸에서 이름으로 불러 정해진 일을 시키는 프로그램이다(특수 내장 유틸리티는 빼고) — §3.410. **내장 유틸리티**(built-in)는 셸 안에 구현된 유틸리티다 — §3.54
- (phase 75 step 12) **작업 디렉터리**(현재 작업 디렉터리)는 프로세스마다 하나씩 딸린 디렉터리이고, `/`로 시작하지 않는 경로를 풀 때 쓰인다 — §3.421, §3.94. **상대 경로**는 `/`로 시작하지 않는 경로다 — §3.311(절대 경로 §3.2와 경로 풀이 §4.16은 위)
- (phase 75 step 12) **`.`과 `..`**: `.`은 마침표 하나로 된 파일 이름이고 — §3.110, `..`은 마침표 둘로 된 파일 이름이다 — §3.111. 경로를 풀 때 `.`은 바로 앞 이름이 가리키는 그 디렉터리를, `..`은 바로 앞 디렉터리의 부모 디렉터리를 가리킨다.
  루트 디렉터리에서는 `..`이 루트 자신을 가리킬 수 있다 — §4.16
- (phase 75 step 12) **파일 디스크립터**는 프로세스가 연 파일을 가리키는 0 이상의 정수다. 0·1·2는 차례로 **표준 입력·표준 출력·표준 오류**라 부르고, 프로그램은 보통 표준 입력에서 읽어 표준 출력에 쓰며, 진단 메시지(오류 알림 등)는 표준 오류에 쓴다 — §3.141, §3.353, §3.354, §3.355
- (phase 75 step 12) **파이프**는 파일 계층에 이름(링크)이 없는 FIFO다 — §3.261. **터미널**은 일반 터미널 인터페이스 규격을 따르는 문자 특수 파일이다 — §3.384. **텍스트 파일**은 글자를 0개 이상의 줄로 짜 담은 파일이다 — §3.387
- (phase 75 step 12) **HOME 환경 변수** — §8.3 Other Environment Variables(https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap08.html, 2026-11-04에 내려받아 읽음): 시스템이 로그인 때 이 변수를 그 사용자의 홈 디렉터리 경로로 정한다.
  홈 디렉터리는 HOME이 가리키는 디렉터리다(§3.170 — 위). passwd(5)의 홈 디렉터리 칸은 로그인한 사용자가 처음 놓이는 디렉터리이고 HOME의 값이 된다(아래 Linux man-pages 항목) — 그래서 로그인하면 처음 작업 디렉터리가 홈 디렉터리다
- (phase 76) **프로그램**은 정해진 일을 하라고 시스템에 줄 명령을 차례로 준비해 둔 것이다 — §3.291. 프로세스는 주소 공간 하나와 그 안에서 실행되는 스레드, 그것이 쓰는 자원이고(§3.189·§3.279 — 위),
  프로세스 ID는 프로세스가 살아 있는 동안 그것을 가리키는 양의 정수다(§3.284 — 위). 두 정의를 이으면 프로그램은 준비된 명령의 묶음이고, 프로세스는 그것이 실제로 실행되고 있는 하나하나다(2026-11-04에 다시 읽음)
- (phase 76) **자식 프로세스**는 한 프로세스가 fork() 등으로 새로 만든 프로세스이고, 둘 다 살아 있는 동안 만든 쪽의 자식으로 남는다 — §3.64. **부모 프로세스**는 지금 프로세스를 만든(또는 물려받은) 프로세스다 — §3.252.
  **부모 프로세스 ID**(PPID)는 새 프로세스가 갖는 속성으로 그것을 만든 프로세스의 ID이고, 만든 쪽이 끝난 뒤에는 구현이 정한 시스템 프로세스의 ID가 된다 — §3.253(Linux에서 누구에게 넘어가는지는 아래 「(phase 76) Linux man-pages」 항목의 getpid(2))
- (phase 76) **시그널**은 시스템에서 일어난 일(하드웨어 예외, 다른 프로세스의 특정 동작 같은 것)을 프로세스나 스레드에 알리거나 그것에 영향을 주는 방법이고, 그 일 자체를 가리키기도 한다 — §3.336
- (phase 76) **백그라운드 작업**은 셸이 끝나기를 기다리지 않고 다음 명령을 실행하거나 (대화형이면) 다음 입력을 청하는 작업이다 — §3.35
- (phase 76) **나이스 값**은 스케줄링에 대한 조언으로 시스템에 주는 수이고, 작을수록 실행 차례에서 더 우대받고 클수록 덜 우대받는다 — §3.225(Linux의 범위 -20~19는 아래 nice(2)·sched(7))

쓰인 곳: (phase 75에서 쓰일 곳) `linux-filesystem.directory-hierarchy`(§4.8, §3.103, §3.2·§3.254·§4.16, §3.316), `linux-filesystem.filesystem-mount`(§3.210, §3.153), `linux-filesystem.disk-device-names`(§3.50, §3.101),
`linux-filesystem.proc-filesystem`(§3.279·§3.284). 경로·작업 디렉터리·홈 디렉터리는 `linux-shell` 주제도 쓴다(step 12가 그 주제의 쓰임으로 다시 확인한다).
(phase 75 step 7) `linux-permissions.owner-group-others`(§3.408·§3.165·§3.361, §3.150·§3.142·§3.149·§3.151, §4.7·§3.21), `linux-permissions.rwx-permissions`(§4.7), `linux-permissions.file-type-char`(§3.139·§3.310·§3.50·§3.62·§3.364·§3.168·§3.104)
(phase 75 step 12) `linux-shell.shell`(§3.333·§3.77·§3.334 — 셸은 명령 언어 해석기, §3.76·§3.22·§3.244·§3.242 — 명령 줄의 짜임, §3.410·§3.54 — 유틸리티와 내장, §3.384 — 터미널), `linux-shell.working-directory`(§3.421·§3.94, §3.170·§8.3 HOME),
`linux-shell.paths`(§3.2·§3.311·§4.16, §3.110·§3.111 — `.`·`..`, §8.3 HOME), `linux-shell.redirection`(§3.141·§3.353~§3.355 — 디스크립터 0·1·2), `linux-shell.pipe`(§3.261), `linux-shell.vi`(§3.387 — 텍스트 파일, §3.384 — 터미널), `exam-notes.md` E23
(phase 76에서 쓰일 곳) `linux-process-boot.process`(§3.291 — 프로그램, §3.189·§3.279·§3.284 — 프로세스와 PID, §3.64·§3.252·§3.253 — 부모·자식과 PPID), `linux-process-boot.process-commands`(§3.336 — 시그널, §3.225 — 나이스 값),
`linux-process-boot.daemon`(§3.35 — 백그라운드)

## (phase 75) Linux man-pages — hier(7), boot(7), intro(2), intro(4), sd(4)
https://man7.org/linux/man-pages/man7/hier.7.html
https://man7.org/linux/man-pages/man7/boot.7.html
https://man7.org/linux/man-pages/man2/intro.2.html
https://man7.org/linux/man-pages/man4/intro.4.html
https://man7.org/linux/man-pages/man4/sd.4.html

2026-10-30에 읽은 판: Linux man-pages 6.19 — hier(7)·intro(2)·sd(4) 2026-02-08, boot(7) 2025-09-21, intro(4) 2025-05-17. man7.org가 2026-09-09에 man-pages-6.19 타르볼에서 가져온 것이다.

- **hier(7)**: Linux 시스템에 흔히 있는 디렉터리를 설명한다 — `/`는 루트 디렉터리이고 나무 전체가 여기서 시작한다. /bin은 단일 사용자 모드와 시스템을 띄우거나 고치는 데 필요한 실행 프로그램,
  /sbin은 /bin처럼 부팅에 필요한 명령이지만 보통 일반 사용자는 실행하지 않는 것, /boot는 부트 로더의 정적 파일(운영체제 커널은 / 나 /boot에 있어야 한다), /dev는 물리 장치를 가리키는 특수 파일(장치 파일),
  /etc는 그 컴퓨터에 딸린 설정 파일, /home은 사용자 홈 디렉터리가 보통 그 아래 있는 곳, /lib는 부팅과 루트 파일 시스템의 명령에 필요한 공유 라이브러리,
  /proc은 실행 중인 프로세스와 커널의 정보를 주는 proc 파일 시스템(pseudo-filesystem)의 마운트 지점, /root는 보통 root 사용자의 홈 디렉터리, /tmp는 정기 작업이나 부팅 때 예고 없이 지워질 수 있는 임시 파일,
  /usr는 흔히 따로 된 파티션에서 마운트되고 공유할 수 있는 읽기 전용 데이터만 두는 곳, /usr/bin은 일반 사용자가 실행하는 대부분 프로그램의 주 디렉터리, /var는 스풀·로그처럼 크기가 바뀌는 파일,
  /var/log는 여러 로그 파일, /var/mail은 사용자 메일함 — DESCRIPTION. 근거 표준은 FHS 3.0이다 — STANDARDS. 이 목록은 다 적은 것이 아니고 배포판·시스템마다 다를 수 있다 — BUGS
- **boot(7)**: 부팅은 대략 하드웨어 → 운영체제 로더 → 커널 → 첫 사용자 공간 프로세스 → 부팅 스크립트의 차례로 나뉜다. 운영체제 로더의 일은 커널을 장치에서 찾아 불러와 실행하는 것이다.
  전통적인 PC에서 로더는 부팅 장치의 첫 512바이트 블록에 있고 이 블록을 **MBR**(Master Boot Record)이라 부르며, 그 512바이트에는 파티션 테이블도 들어 있다. 2단계 로더는 디스크 파티션 같은 영구 저장 장치에 둘 수 있다 — DESCRIPTION 「OS loader」.
  **커널**은 불려 오면 컴퓨터와 운영체제의 여러 구성 요소를 초기화하는데, 그 일을 맡는 소프트웨어 부분을 그 구성 요소의 **드라이버**라 부른다. 커널은 가상 메모리 스와퍼(커널 프로세스 kswapd)를 시작하고,
  루트 경로 `/`에 파일 시스템을 마운트한 뒤, 첫 사용자 공간 프로세스(PID 1)를 만든다 — 「Kernel」
- **intro(2)**: 시스템 호출은 Linux 커널로 들어가는 입구다 — DESCRIPTION
- **intro(4)**: 매뉴얼 4절은 특수 파일(장치)을 설명하고, 장치 파일은 /dev 아래 있다 — DESCRIPTION, FILES
- **sd(4)**: **SCSI 디스크 드라이브의 드라이버**다 — NAME. 블록 장치 이름은 `sd` + 물리 드라이브를 가리키는 글자 + 그 드라이브의 파티션 번호이고, 드라이브 전체를 가리킬 때는 번호를 뺀다.
  `/dev/sda`는 첫째 SCSI 드라이브 전체, `/dev/sdb3`는 둘째 드라이브의 셋째 주 파티션이다. 드라이브 번호는 감지한 차례다. 파티션 1~4는 DOS의 주 파티션, 5부터는 확장(논리) 파티션이다 — CONFIGURATION.
  (CONFIGURATION·FILES의 「5~8」·`sd[a-h]` 같은 상한은 옛 장치 번호 체계의 이야기라 쓰지 않는다 — 논리 파티션 번호는 fdisk(8)대로 「5부터」로 쓴다)
- **SATA**: 허용한 출처에서 SATA 디스크를 `sd` 이름과 잇는 문장은 찾지 못했다(man-pages·util-linux·FHS, 2026-10-30). 가까운 것은 fdisk(8) DEVICES(아래 util-linux 항목 — libata가 없는 옛 시스템만 IDE `hd*`와 SCSI `sd*`를 가른다)와
  lsblk(8)이 디스크의 연결 방식(TRAN) 값으로 `sata`를 거르는 예뿐이다 — `exam-notes.md` E20
- (phase 75 step 7) **sd(4)**: `sd` 이름의 꼴을 **블록 장치 이름**이라 부르고, 지금은 블록 장치만 제공한다고 적는다 — CONFIGURATION. 그래서 `/dev/sda` 같은 디스크 장치 파일은 블록 장치다.
  다만 `ls -l /dev/sda`가 실제로 어떻게 찍히는지(장치 번호 칸 등)는 이 페이지에 없다 — 출력 줄을 그대로 보이지 않는다
- (phase 75 step 12) **intro(2)** — 2026-11-04에 다시 읽음(6.19, 2026-02-08): 매뉴얼 2절은 Linux의 시스템 호출을 설명하고, **시스템 호출은 Linux 커널로 들어가는 입구**다.
  보통은 시스템 호출을 바로 부르지 않고 C 라이브러리의 감싼 함수(wrapper)를 거쳐 부르므로, 겉으로는 보통 라이브러리 함수를 부르는 것과 같아 보인다 — DESCRIPTION.
  셸이 프로그램을 실행할 때 이 입구를 거친다는 것은 아래 「(phase 75 step 12) Linux man-pages」 항목(exec(3)·execve(2))과 「(phase 75 step 12) POSIX.1-2024 — 2 Shell Command Language」 항목(2.9.1.6)
- (phase 76) **boot(7)** — 2026-11-04에 다시 읽음(6.19, 2025-09-21): 부팅은 대략 ① 하드웨어 ② 운영체제 로더 ③ 커널 ④ 첫 사용자 공간 프로세스(init) ⑤ 부팅 스크립트가 차례로 맡는 단계로 나뉜다 — DESCRIPTION.
  전원을 켜거나 리셋하면 읽기 전용 메모리에 든 프로그램이 먼저 제어를 받고, 역사적인 까닭으로 이것을 흔히 **「BIOS」**라 부른다. 이 프로그램은 기계를 간단히 점검하고 비휘발성 메모리에서 설정을 읽는데,
  PC에서는 그 메모리가 배터리로 유지되는 CMOS 메모리라 흔히 「CMOS」라 부른다. 설정에는 적어도 어느 장치에서 운영체제 로더를 찾을지(부팅 장치)가 들어 있고, 하드웨어 단계는 부팅 장치의 정해진 자리에서 로더를 불러와 제어를 넘긴다 — 「Hardware」.
  운영체제 로더의 일은 커널을 장치에서 찾아 불러와 실행하는 것이고, 대개 다른 커널을 고르거나 커널에 매개변수를 넘길 수 있게 대화형으로 쓸 수 있다. **Linux에서 운영체제 로더는 흔히 grub(8)이다**(다른 것으로 lilo(8)).
  MBR(첫 512바이트 블록)은 파티션 테이블까지 담아 좁으므로 대부분의 시스템은 로더를 1차·2차로 나누고, 2차 로더를 디스크 파티션 같은 더 큰 저장 공간에 둔다 — 「OS loader」.
  커널은 불려 오면 장치마다의 드라이버로 컴퓨터와 운영체제의 구성 요소를 초기화하고, 메모리 스와퍼(커널 프로세스 kswapd)를 시작하고, 루트 경로 `/`에 파일 시스템을 마운트한 **뒤에야** 첫 사용자 공간 프로세스(PID 1)를 만든다.
  이 프로세스는 전통적으로 `/sbin/init` 프로그램을 실행한다 — 「Kernel」.
  System V 방식에서는 `/sbin/init`이 `/etc/inittab`을 읽고, 실행 레벨마다 켤 서비스 묶음이 정해져 있다(예로 실행 레벨 S는 단일 사용자 모드, 실행 레벨 2는 대부분의 네트워크 서비스를 켠다).
  관리자는 init(1)으로 지금 실행 레벨을 바꾸고 runlevel(8)로 지금 실행 레벨을 본다. 널리 쓰이는 여러 시스템은 이와 근본적으로 다른 systemd를 쓰고, 그 부팅은 bootup(7)이 설명한다 — 「Root user-space process」.
  서비스(메일·nfs 서버·cron 등)마다 시작 스크립트가 있어 `start`·`stop`을 받는다 — 「Boot scripts」. **서비스를 제공하는 프로그램을 흔히 「데몬」이라 부른다** — 「Boot configuration」

쓰인 곳: (phase 75에서 쓰일 곳) `linux-filesystem.directory-hierarchy`(hier(7) `/`·/root), `linux-filesystem.standard-directories`(hier(7) 항목마다), `linux-filesystem.proc-filesystem`(hier(7) /proc, boot(7) 커널),
`linux-filesystem.mbr-gpt`(boot(7) MBR이 첫 512바이트 블록이고 파티션 테이블을 담는다), `linux-filesystem.disk-device-names`(sd(4) 이름의 꼴·1~4·5부터, boot(7) 드라이버, intro(4) 장치 파일), `exam-notes.md` E20.
(phase 75 step 7) `linux-permissions.file-type-char`(sd(4) — 디스크는 블록 장치, intro(4) — 장치 파일은 /dev 아래)
(phase 75 step 12) `linux-shell.shell`(intro(2) — 시스템 호출은 커널로 들어가는 입구, boot(7) — 커널), `exam-notes.md` E23
(phase 76에서 쓰일 곳) `linux-process-boot.boot-sequence`(boot(7) — 단계 다섯의 차례, BIOS·CMOS, 로더가 커널을 찾아 불러온다, 커널이 `/`를 마운트한 뒤 PID 1), `linux-process-boot.grub`(boot(7) — Linux의 로더는 흔히 grub, MBR은 첫 512바이트 블록),
`linux-process-boot.process`(boot(7) — PID 1과 `/sbin/init`), `linux-process-boot.daemon`(boot(7) — 서비스를 제공하는 프로그램이 데몬), `linux-process-boot.runlevel`(boot(7) — 실행 레벨 S·2의 예, init(1)으로 바꾸고 runlevel(8)로 본다), `exam-notes.md` E26

## (phase 75) util-linux — fdisk(8), fsck(8), mkfs(8), blockdev(8), lsblk(8)
https://man7.org/linux/man-pages/man8/fdisk.8.html
https://man7.org/linux/man-pages/man8/fsck.8.html
https://man7.org/linux/man-pages/man8/mkfs.8.html
https://man7.org/linux/man-pages/man8/blockdev.8.html
https://man7.org/linux/man-pages/man8/lsblk.8.html

2026-10-30에 읽은 판: util-linux 2.43 개발판 — fdisk(8) 2026-08-04, fsck(8)·mkfs(8)·blockdev(8)·lsblk(8) 2026-05-24. man7.org가 2026-08-04에 util-linux 저장소에서 가져온 것이다.

- **fdisk(8)**: 파티션 테이블을 만들고 고치는 대화형 프로그램이고, GPT·MBR(과 Sun·SGI·BSD) 파티션 테이블을 다룬다 — DESCRIPTION
- 블록 장치는 **파티션**이라 부르는 논리적인 디스크 하나 이상으로 나눌 수 있고, 그 나눔은 **파티션 테이블**에 적힌다. 파티션 테이블은 보통 디스크의 섹터 0에 있다 — DESCRIPTION
- **MBR(DOS 형식)**: 섹터 0에 파티션 넷을 적을 자리가 있고 이것을 주(primary) 파티션이라 한다. 그 하나를 확장 파티션으로 둘 수 있고, 확장 파티션은 논리 파티션을 담는 상자다.
  주 파티션 넷은 있든 없든 번호 1~4를 받고, 논리 파티션은 5부터 번호가 붙는다 — DISK LABELS 「DOS-type (MBR)」.
  파티션의 시작 위치와 크기는 섹터 수로 적는데 32비트이므로, 512바이트 섹터면 2TB까지 된다(문서의 표기는 「2 TB」) — 같은 절.
  계산: 2^32 × 512 = 2^32 × 2^9 = 2^41 = 2,199,023,255,552바이트 — 2^40바이트를 1TB(TiB)로 세면 2, 10^12바이트를 1TB로 세면 약 2.2다
- **GPT(GUID Partition Table)**: 지금의 표준 배치로, 64비트 논리 블록 주소를 쓰고, 파티션마다 UUID와 이름을 두며, 파티션 수에 제한이 없다(여러 파티션 도구가 보통 128개로 묶어 둔다).
  첫 섹터는 여전히 **보호용 MBR**에 비워 두는데, MBR만 아는 도구가 GPT 디스크를 잘못 알아보고 덮어쓰지 않게 하려는 것이다. 특히 UEFI 부트 로더를 쓰는 요즘 하드웨어에서는 GPT가 MBR보다 늘 나은 선택이라고 적는다 — DISK LABELS 「GPT」
- 파티션 테이블이 없는 장치를 받으면 fdisk가 하나를 만든다. util-linux 2.43부터는 대화형 터미널이면서 EFI 시스템이면 GPT, 아니면 DOS(MBR)가 기본이다 — DISK LABELS 「Default label on empty devices」
- 장치는 보통 `/dev/sda`, `/dev/sdb`이고 장치 이름은 디스크 전체를 가리킨다. 파티션은 장치 이름 뒤에 파티션 번호를 붙인 것이고, `/dev/sda1`은 시스템의 첫째 하드 디스크의 첫째 파티션이다.
  **libata**(커널 안에서 ATA 호스트 컨트롤러와 장치를 지원하는 라이브러리)가 없는 옛 시스템만 IDE 디스크(`/dev/hd*`)와 SCSI 디스크(`/dev/sd*`)를 다르게 부른다 — DEVICES
- 섹터 크기로 512·1024·2048·4096바이트를 받고, 논리 섹터 크기와 물리 섹터 크기를 가른다 — OPTIONS `-b`. 파티션 크기는 섹터 수나 `+크기{K,M,G…}`로 준다 — SIZES
- **fsck(8)**: 하나 이상의 Linux 파일 시스템을 **점검하고, 고르면 고친다**. 파일 시스템별 점검 프로그램(`fsck.형식`)의 앞단이다. 대상을 주지 않으면 /etc/fstab의 파일 시스템을 차례로 점검한다 — NAME, DESCRIPTION
- **mkfs(8)**: 장치(보통 하드 디스크 파티션)나 파일에 **Linux 파일 시스템을 만든다**. 실제로는 파일 시스템별 만들기 프로그램(`mkfs.형식`)의 앞단일 뿐이고,
  이 앞단 자체는 파일 시스템별 `mkfs.<형식>` 도구에 자리를 내주어 **권장하지 않는다(deprecated)** — NAME, DESCRIPTION
- **blockdev(8)**: `--getss`는 논리 섹터 크기를 바이트로 보이며 보통 512다. `--getpbsz`는 물리 블록(섹터) 크기를 보인다 — OPTIONS
- **lsblk(8)**: 블록 장치를 나열한다 — NAME. 디스크의 연결 방식(TRAN) 값이 `sata`인 디스크를 세는 예가 있다 — `--ct-filter` 설명

쓰인 곳: (phase 75에서 쓰일 곳) `linux-filesystem.partition`(fdisk(8) DESCRIPTION — 파티션·파티션 테이블·섹터 0, fsck(8) — 점검·복구), `linux-filesystem.mbr-gpt`(DISK LABELS — MBR 넷·확장·논리 5부터·32비트·2TB, GPT 64비트·128·보호용 MBR, 지금의 fdisk가 GPT를 다룬다),
`linux-filesystem.disk-device-names`(DEVICES), `linux-filesystem.filesystem-mount`(mkfs(8) — 만들기, 앞단), `exam-notes.md` E19·E20

## (phase 75) util-linux — mount(8), umount(8), fstab(5), mkswap(8), swapon(8)
https://man7.org/linux/man-pages/man8/mount.8.html
https://man7.org/linux/man-pages/man8/umount.8.html
https://man7.org/linux/man-pages/man5/fstab.5.html
https://man7.org/linux/man-pages/man8/mkswap.8.html
https://man7.org/linux/man-pages/man8/swapon.8.html

2026-10-30에 읽은 판: util-linux 2.43 개발판 — mount(8)·umount(8) 2026-08-03, fstab(5)·mkswap(8)·swapon(8) 2026-05-24. man7.org가 2026-08-04에 util-linux 저장소에서 가져온 것이다.

- **mount(8)**: 유닉스 시스템에서 접근할 수 있는 파일은 모두 `/`를 뿌리로 한 큰 나무 하나(파일 계층)에 놓이고, 그 파일들은 여러 장치에 흩어져 있을 수 있다. `mount`는 어떤 장치에 있는 파일 시스템을 이 나무에 붙이고, umount(8)는 다시 뗀다.
  파일 시스템은 데이터를 장치에 어떻게 저장할지(또는 네트워크 같은 것으로 가상으로 제공할지)를 정한다 — DESCRIPTION
- 기본 꼴은 `mount -t 형식 장치 디렉터리`이고, 커널에게 그 장치의 파일 시스템을 그 디렉터리에 붙이라고 한다. `-t`는 생략할 수 있다(대개 형식을 알아낸다). 기본으로는 root 권한이 있어야 마운트한다.
  붙어 있는 동안 그 디렉터리의 원래 내용과 소유자·모드는 보이지 않고, 그 경로는 장치에 있는 파일 시스템의 루트를 가리킨다 — DESCRIPTION
- 디렉터리나 장치 하나만 주면 /etc/fstab에서 짝을 찾는다 — DESCRIPTION. 장치는 대개 블록 특수 파일 이름(`/dev/sda1`)으로 가리키지만, 디스크 파티션의 장치 이름은 하드웨어 구성이 바뀌거나 장치를 더하고 빼면 바뀔 수 있어
  UUID·LABEL 같은 식별자를 쓰기를 강하게 권한다 — 「Indicating the device and filesystem」
- `mount -a`는 fstab에 적힌 파일 시스템을 모두(`noauto`가 붙은 줄은 빼고) 마운트하고, 보통 부팅 스크립트에서 쓴다. 다만 요즘 systemd 기반 배포판의 다수는 부팅 때 `mount -a` 대신 systemd 유닛으로 마운트한다 — 「The files /etc/fstab, /etc/mtab and /proc/mounts」, OPTIONS `-a`
- `-m`·`--mkdir`(그리고 fstab 옵션 `X-mount.mkdir`)은 마운트 지점이 아직 없으면 만들게 **허용하는** 옵션이다 — OPTIONS. 그래서 이 옵션 없이는 마운트 지점이 미리 있는 디렉터리여야 한다(phase 75 step 4에서 확인, 2026-10-30).
  비어 있어야 한다는 요구는 없다 — 원래 내용이 있으면 붙어 있는 동안 가려질 뿐이다(위 DESCRIPTION)
- `defaults`는 기본 옵션(rw·suid·dev·exec·auto·nouser·async)으로 마운트하라는 옵션이고, 실제 기본 옵션의 묶음은 커널과 파일 시스템 형식에 따라 다르다 — 「FILESYSTEM-INDEPENDENT MOUNT OPTIONS」 `defaults`(phase 75 step 5에서 확인, 2026-10-30). 본문은 옵션의 목록을 쓰지 않고 「기본 옵션, 무엇이 기본인지는 커널과 형식에 따라 다르다」까지만 쓴다
- **umount(8)**: 지정한 파일 시스템을 파일 계층에서 뗀다. 마운트한 디렉터리로 가리키는 것이 기본이다. 열린 파일이 있거나 어떤 프로세스의 작업 디렉터리가 그 안에 있으면(사용 중이면) 뗄 수 없다 — DESCRIPTION
- **fstab(5)**: 시스템이 마운트할 수 있는 파일 시스템을 적은 파일이다. 프로그램은 읽기만 하고, 만들고 고치는 것은 관리자의 몫이다. fsck(8)·mount(8)·umount(8)가 위에서부터 차례로 읽으므로 줄의 차례가 중요하다.
  systemd 기반 시스템에서는 고친 뒤 `systemctl daemon-reload`를 권한다 — DESCRIPTION. 파일 시스템 하나를 한 줄에 적고 칸은 탭이나 공백으로 나누며, `#`로 시작하는 줄은 주석이다 — DESCRIPTION. 칸 여섯 —
  (1) **fs_spec**: 마운트할 블록 장치(또는 원격 파일 시스템), 스왑으로 켤 파일이나 장치. 장치 이름 대신 `LABEL=`·`UUID=`를 쓸 수 있고, 장치 이름은 하드웨어를 감지한 차례에 따라 바뀔 수 있어 이쪽을 권한다.
  (2) **fs_file**: 마운트 지점. 스왑이면 `none`. (3) **fs_vfstype**: 파일 시스템 형식(ext4·xfs·vfat 등). `swap`은 스왑으로 쓸 파일이나 파티션.
  (4) **fs_mntops**: 쉼표로 이은 마운트 옵션. 보통 적어도 `defaults`를 쓴다. `noauto`는 `mount -a`가 주어질 때(예: 부팅할 때) 마운트하지 않는다는 뜻이다.
  (5) **fs_freq**: dump(8)가 백업할 파일 시스템을 정할 때 쓴다. 없으면 0(백업하지 않음). (6) **fs_passno**: fsck(8)가 부팅할 때 점검할 차례. 루트 파일 시스템은 1, 다른 것은 2, 없으면 0(점검하지 않음) — 각 칸의 절
- 스왑 영역을 fstab에 적는 자세한 방법은 swapon(8)에 미룬다 — fstab(5) DESCRIPTION
- **mkswap(8)**: 장치나 파일에 Linux **스왑 영역**을 만든다. 장치는 보통 디스크 파티션이지만 파일이어도 된다. 만든 뒤 쓰기 시작하려면 swapon(8)이 필요하고,
  스왑 영역은 보통 /etc/fstab에 적어 부팅 때 `swapon -a`로 쓰게 한다 — DESCRIPTION. 커널은 파티션 종류 번호를 보지 않지만 설치 스크립트는 종류 82(LINUX_SWAP) 파티션을 스왑으로 여기는 경우가 많다 — DESCRIPTION.
  권하는 구성은 스왑을 위한 파티션을 따로 두는 것이다 — WARNING
- `mkswap --file`은 알맞은 권한으로 스왑 파일을 만든다. 파일을 미리 만들어 둔 뒤 mkswap으로 초기화할 수도 있다(문서의 예는 dd로 8GiB 파일을 만든다). 지금 Linux는 스왑 영역을 32개까지 쓸 수 있고, 쓰고 있는 영역은 /proc/swaps에 보인다.
  스왑 영역의 쓸모 있는 최대 크기는 아키텍처와 커널 판에 달렸다 — OPTIONS `-F`, NOTES. **알맞은 크기(메모리의 몇 배 같은 권고)는 적지 않는다** — `exam-notes.md` E21
- **swapon(8)**: 페이징과 스와핑이 일어날 장치(나 파일)를 정한다. `swapoff`는 끈다. swapon은 보통 부팅 스크립트에서 불린다 — DESCRIPTION. `-a`는 /etc/fstab에 `swap`으로 적힌 장치를 모두(`noauto`는 빼고) 쓰게 한다 — OPTIONS `-a`.
  구멍이 있는 파일은 스왑 파일로 받지 않으므로, 가장 이식성 좋은 스왑 파일 만들기는 dd와 /dev/zero다 — NOTES 「Files with holes」

쓰인 곳: (phase 75에서 쓰일 곳) `linux-filesystem.directory-hierarchy`(mount(8) — 한 나무, 여러 장치), `linux-filesystem.filesystem-mount`(mount(8) 꼴·root 권한·원래 내용이 가려진다·`--mkdir`로 본 「마운트 지점은 미리 있어야 한다」, umount(8)), `linux-filesystem.fstab`(fstab(5) 칸 여섯·UUID·noauto, mount(8) `-a`),
`linux-filesystem.swap`(mkswap(8)·swapon(8) — 파티션이나 파일, 만든 뒤 켜기, fstab에 적기, 스왑 파일을 더하는 절차, 32개), `exam-notes.md` E21

## (phase 75) e2fsprogs — mke2fs(8), ext4(5), chattr(1), lsattr(1)
https://man7.org/linux/man-pages/man8/mke2fs.8.html
https://man7.org/linux/man-pages/man5/ext4.5.html
https://man7.org/linux/man-pages/man1/chattr.1.html
https://man7.org/linux/man-pages/man1/lsattr.1.html

2026-10-30에 읽은 판: E2fsprogs 1.47.4(March 2025). man7.org가 2026-08-03에 e2fsprogs 저장소에서 가져온 것이다. (man7.org에 `mkfs.ext4(8)` 페이지는 따로 없다 — mke2fs(8)이 그 이름을 설명한다)

- **mke2fs(8)**: ext2·ext3·ext4 파일 시스템을 (보통 디스크 파티션에) 만든다. `mkfs.ext4`처럼 `mkfs.형식` 이름으로 실행하면 `-t 형식`을 준 것과 같아서, `mkfs.ext4`는 ext4 파일 시스템을 만든다 — DESCRIPTION
- **ext4(5)**: ext2·ext3·ext4는 많은 Linux 배포판의 기본 파일 시스템이었던 Linux 파일 시스템이고, 확장성과 이전 판 호환을 염두에 둔 범용 파일 시스템이다 — DESCRIPTION
- **chattr(1)**: Linux 파일 시스템에서 파일 속성을 바꾼다. `+`는 속성을 더하고, `-`는 빼고, `=`는 적은 속성만 남긴다. 모든 파일 시스템이 모든 속성을 지원하지는 않는다 — DESCRIPTION
- **a**(append only): 쓰기는 덧붙이기 모드로만 열 수 있다. 슈퍼유저나 CAP_LINUX_IMMUTABLE 능력을 가진 프로세스만 붙이고 뗄 수 있다 — chattr(1) ATTRIBUTES
- **i**(immutable): 파일을 고칠 수 없다 — 지울 수도 이름을 바꿀 수도 없고, 이 파일로 링크를 만들 수 없고, 메타데이터 대부분을 바꿀 수 없고, 쓰기 모드로 열 수 없다.
  슈퍼유저나 CAP_LINUX_IMMUTABLE 능력을 가진 프로세스만 붙이고 뗄 수 있다 — chattr(1) ATTRIBUTES. 슈퍼유저에게도 걸린다는 것은 아래 FS_IOC_SETFLAGS(2const)
- **lsattr(1)**: ext2·ext3·ext4 파일 시스템의 파일 속성을 나열한다. 속성의 뜻은 chattr(1)을 보라고 한다. `-l`은 한 글자 대신 긴 이름으로 보인다 — NAME, DESCRIPTION, OPTIONS.
  **출력 줄의 꼴(속성 글자를 늘어놓는 칸의 모양)은 문서에 없다** — 본문·도식에 lsattr 출력 줄을 그대로 그리지 않는다

쓰인 곳: (phase 75에서 쓰일 곳) `linux-filesystem.filesystem-mount`(mke2fs(8) — `mkfs.ext4`, ext4(5) — ext4가 무엇인가), `linux-filesystem.file-attributes`(chattr(1)·lsattr(1) — `+`·`-`·`=`, `a`, `i`, 붙이고 떼는 사람)

## (phase 75) Linux man-pages — proc(5), proc_pid(5), proc_cpuinfo(5), proc_meminfo(5), proc_sys_vm(5), swapon(2), mlock(2), passwd(5), capabilities(7), FS_IOC_SETFLAGS(2const), unlink(2)
https://man7.org/linux/man-pages/man5/proc.5.html
https://man7.org/linux/man-pages/man5/proc_pid.5.html
https://man7.org/linux/man-pages/man5/proc_cpuinfo.5.html
https://man7.org/linux/man-pages/man5/proc_meminfo.5.html
https://man7.org/linux/man-pages/man5/proc_sys_vm.5.html
https://man7.org/linux/man-pages/man2/swapon.2.html
https://man7.org/linux/man-pages/man2/mlock.2.html
https://man7.org/linux/man-pages/man5/passwd.5.html
https://man7.org/linux/man-pages/man7/capabilities.7.html
https://man7.org/linux/man-pages/man2/FS_IOC_SETFLAGS.2const.html
https://man7.org/linux/man-pages/man2/unlink.2.html

2026-10-30에 읽은 판: Linux man-pages 6.19 — proc(5)·proc_cpuinfo(5)·proc_meminfo(5)·proc_sys_vm(5)·swapon(2)·capabilities(7)·FS_IOC_SETFLAGS(2const)·unlink(2) 2026-02-08, proc_pid(5) 2026-03-18, mlock(2) 2026-02-11, passwd(5) 2025-09-21.
man7.org에 같은 내용의 ioctl_iflags(2)도 있지만 판이 「unreleased」로 남은 옛 페이지라 쓰지 않고 FS_IOC_SETFLAGS(2const)를 쓴다.

- **proc(5)**: proc 파일 시스템은 **커널의 자료 구조를 들여다보는 창구 노릇을 하는 가상(pseudo) 파일 시스템**이고 보통 /proc에 마운트된다. 대개 시스템이 자동으로 마운트한다.
  그 안의 파일은 대부분 읽기 전용이지만 일부는 써서 커널 변수를 바꿀 수 있다 — DESCRIPTION. /proc 아래에는 프로세스마다의 /proc/pid 디렉터리와, 시스템 전체 정보를 보여 주는 여러 파일이 있다 — 「Overview」
- **proc_pid(5)**: 실행 중인 프로세스마다 숫자 이름의 하위 디렉터리가 있고, 그 이름이 프로세스 ID다 — DESCRIPTION
- **proc_cpuinfo(5)**: /proc/cpuinfo는 CPU와 시스템 아키텍처에 따른 항목을 모은 것이다(흔한 항목: CPU 번호 processor). lscpu(1)가 이 파일에서 정보를 모은다 — DESCRIPTION
- **proc_meminfo(5)**: /proc/meminfo는 시스템의 메모리 사용 통계를 보인다. free(1)가 이 파일로 쓰고 남은 메모리(물리 메모리와 스왑 모두)를 보여 준다 — DESCRIPTION.
  MemTotal은 쓸 수 있는 RAM 전체, MemAvailable은 스와핑 없이 새 애플리케이션을 시작하는 데 쓸 수 있는 메모리의 추정치다. SwapCached는 스왑으로 나갔다가 다시 들어왔지만 스왑 파일에도 남아 있는 메모리로,
  메모리 압박이 커지면 이 페이지는 다시 내보낼 필요가 없어 입출력을 아낀다 — 각 항목
  **Active**는 최근에 쓴 메모리라 꼭 필요하지 않으면 되찾지 않고, **Inactive**는 최근에 덜 쓴 메모리라 다른 데 쓰도록 되찾을 대상으로 더 알맞다. SwapTotal은 쓸 수 있는 스왑 공간 전체, SwapFree는 아직 쓰지 않은 스왑 공간이다 — 각 항목(phase 75 step 5에서 확인, 2026-10-30).
  위 mlock(2)(묶지 않은 메모리는 커널의 메모리 관리자가 필요할 때 스왑 영역으로 내보낸다)과 함께 「메모리가 모자라면 스왑으로 옮겨 가는 것은 주로 최근에 덜 쓴 내용이다」를 쓴다. 되찾는 일이 곧 스왑으로 내보내는 일이라고 적은 문장은 없어서 「주로」로 한정한다
- **proc_sys_vm(5)**: /proc/sys/vm/swappiness는 커널이 메모리 페이지를 얼마나 적극적으로 스왑할지 정한다(기본값 60) — DESCRIPTION
- **swapon(2)**: 지정한 파일이나 블록 장치를 스왑 영역으로 정하고, swapoff()는 그 영역으로의 스와핑을 멈춘다 — DESCRIPTION
- **mlock(2)**: 프로세스의 가상 주소 공간 일부나 전체를 RAM에 묶어 **그 메모리가 스왑 영역으로 내보내지지 않게** 한다. 풀면 커널의 메모리 관리자가 필요할 때 다시 내보낼 수 있다 — DESCRIPTION.
  페이징은 프로그램 실행이 예상 밖으로 늦어지는 주된 원인의 하나이고, 페이징 때문에 비밀 정보가 영구적인 스왑 저장 매체로 옮겨져 RAM에서 지운 뒤에도 남을 수 있다 — NOTES
- **passwd(5)**: /etc/passwd는 시스템의 사용자 로그인 계정을 적은 텍스트 파일이고, 모든 사용자가 읽을 수 있되 쓰기는 슈퍼유저만 할 수 있어야 한다. 요즘은 대개 shadow 암호 묶음을 써서 /etc/passwd의 암호 칸에는 `x`를 두고,
  암호화된 암호는 **슈퍼유저만 읽을 수 있는 /etc/shadow**에 둔다 — DESCRIPTION. 루트 로그인 계정(슈퍼유저)의 사용자 ID는 0이다. 홈 디렉터리 칸은 로그인한 사용자가 처음 놓이는 디렉터리이고 HOME 환경 변수가 이 값이 된다 — 각 칸(UID, directory).
  칸 일곱의 해석은 `linux-accounts`(phase 76)의 몫이다
- **capabilities(7)**: 전통적인 유닉스는 권한 검사를 할 때 실효 사용자 ID가 0인 **특권 프로세스(슈퍼유저, root)**와 그렇지 않은 프로세스를 가르고, **특권 프로세스는 커널의 권한 검사를 모두 건너뛴다**.
  Linux 2.2부터 슈퍼유저의 특권을 능력(capability)이라는 단위로 나눠 따로 켜고 끌 수 있게 했다 — DESCRIPTION. CAP_DAC_OVERRIDE는 파일의 읽기·쓰기·실행 권한 검사를 건너뛴다. CAP_LINUX_IMMUTABLE은 append-only·immutable 플래그를 붙일 수 있게 한다 — 「Capabilities list」
- **FS_IOC_SETFLAGS(2const)**: 여러 Linux 파일 시스템이 지원하는 inode 플래그(파일의 동작을 바꾸는 속성)를 읽고 바꾸는 ioctl이고, lsattr(1)과 chattr(1)이 그 명령 창구다 — DESCRIPTION.
  FS_IMMUTABLE_FL(`i`): 파일 내용도 메타데이터(권한·시각·소유자·링크 수 등)도 바꿀 수 없고, **이 제한은 슈퍼유저에게도 걸린다**. CAP_LINUX_IMMUTABLE을 가진 프로세스만 붙이고 뗀다.
  FS_APPEND_FL(`a`): O_APPEND로만 열 수 있고, 디렉터리에 붙이면 그 안의 파일을 지울 수 없다 — 이것도 슈퍼유저에게 걸린다 — 각 플래그
- **unlink(2)**: 지우려는 파일이 immutable이나 append-only로 표시되어 있으면 EPERM으로 실패한다 — ERRORS
- (phase 75 step 7) **capabilities(7)**: CAP_CHOWN은 파일의 사용자 ID와 그룹 ID를 마음대로 바꾸게 한다. CAP_FOWNER는 chmod(2)처럼 원래 파일 소유자만 할 수 있는 일의 검사를 건너뛰게 한다 — 「Capabilities list」.
  CAP_DAC_OVERRIDE가 실행 권한에는 조건을 단다는 것은 아래 「(phase 75 step 7) Linux man-pages」 항목의 path_resolution(7)
- (phase 75 step 7) **unlink(2)**: 지우려는 파일이 든 디렉터리에 프로세스의 쓰기 권한이 없거나, 경로의 디렉터리 가운데 하나에 검색 권한이 없으면 EACCES로 실패한다 — ERRORS.
  이 조건에 지울 파일 자신의 권한은 들어 있지 않다. sticky 비트가 켜진 디렉터리에서는 파일이나 디렉터리의 소유자·특권 프로세스만 지울 수 있다는 조건이 더 붙는다 — 같은 ERRORS(특수 비트는 다루지 않는다)
- (phase 75 step 9) **unlink(2)** — DESCRIPTION: 파일 시스템에서 이름 하나를 지운다. 그 이름이 그 파일의 마지막 링크이고 그 파일을 연 프로세스가 없으면 파일이 지워지고, 연 프로세스가 있으면 마지막으로 닫힐 때까지 남는다.
  이름이 심볼릭 링크를 가리키면 링크가 지워진다. 그래서 하드 링크가 둘인 파일은 이름 하나를 지워도 다른 이름으로 남는다(2026-10-30에 다시 읽음)
- (phase 75 step 12) **passwd(5)** — 2026-11-04에 다시 읽음(6.19, 2025-09-21): 마지막 칸 `shell`은 그 사용자가 로그인할 때 실행할 프로그램이고(비어 있으면 `/bin/sh`), 이 값이 SHELL 환경 변수가 된다.
  없는 실행 파일을 적으면 그 사용자는 login(1)으로 로그인하지 못한다 — 각 칸(shell). 곧 로그인 셸은 계정마다 따로 적는다(바꾸는 명령 chsh(1)과 고를 수 있는 목록 shells(5)는 아래 「(phase 75 step 12) Linux man-pages」 항목).
  홈 디렉터리 칸(로그인한 사용자가 처음 놓이는 디렉터리, HOME의 값)은 위 줄 그대로다
- (phase 76 step 9) **passwd(5)** — 2026-11-05에 다시 읽음(Linux man-pages 6.19, 2025-09-21): 한 줄이 사용자 하나이고, 콜론으로 나눈 칸 일곱이 `name:password:UID:GID:GECOS:directory:shell` 차례다 — DESCRIPTION.
  `name`은 로그인 이름이다. `password`는 암호화된 암호, 별표(`*`), 글자 `x` 가운데 하나이고 `x`의 뜻은 pwconv(8)이 설명한다(아래 「(phase 76 step 9) shadow-utils」 항목 — 암호화된 암호가 /etc/shadow에 있다는 표시).
  `UID`는 사용자 ID이고 특권을 가진 root 계정(슈퍼유저)은 0이다. `GID`는 그 사용자의 **기본 그룹**(primary group) 번호이고, 그 밖에 더 든 그룹은 그룹 파일 /etc/group에 정한다(group(5)).
  `GECOS`는 정보를 적어 두기만 하는 선택 칸(설명 칸)이고 보통 사용자의 전체 이름을 적는다 — 각 칸.
  이 파일을 모든 사용자가 읽을 수 있어야 하는 까닭은 `ls(1)` 같은 여러 도구가 이 파일로 **사용자 ID(번호)를 사용자 이름으로 바꿔** 보이기 때문이고, 쓰기는 슈퍼유저만 할 수 있어야 한다.
  예전에는 암호화된 암호가 이 파일에 있어 누구나 읽을 수 있었고, 지금은 대개 암호 칸에 `x`를 두고 암호화된 암호는 슈퍼유저만 읽는 /etc/shadow에 둔다 — DESCRIPTION.
  암호 칸에 `*`를 두면 그 사용자는 암호로 인증할 수 없다(login(1)으로는 들어오지 못하지만 다른 길은 남을 수 있다) — DESCRIPTION, NOTES.
  같은 이름의 shadow-utils판 passwd(5)는 아래 「(phase 76 step 9) shadow-utils」 항목에 있고, 두 판이 다르게 말하는 곳은 찾지 못했다

쓰인 곳: (phase 75에서 쓰일 곳) `linux-filesystem.proc-filesystem`(proc(5)·proc_pid(5)·proc_cpuinfo(5)·proc_meminfo(5)), `linux-filesystem.etc-directory`(passwd(5) — /etc/passwd는 계정 목록, /etc/shadow는 슈퍼유저만 읽는다),
`linux-filesystem.swap`(mlock(2)·proc_meminfo(5)·proc_sys_vm(5)·swapon(2) — 커널이 메모리 페이지를 스왑 영역으로 내보낸다, 페이징은 실행을 늦출 수 있다), `linux-filesystem.file-attributes`(capabilities(7)·FS_IOC_SETFLAGS(2const)·unlink(2) — root는 권한 검사를 건너뛰지만 `i`는 root에게도 걸린다),
`linux-filesystem.directory-hierarchy`(passwd(5) — root는 UID 0인 슈퍼유저). 권한 검사는 `linux-permissions` 주제도 쓴다(step 7이 그 주제의 쓰임으로 다시 확인한다).
(phase 75 step 7) `linux-permissions.owner-group-others`(capabilities(7)·passwd(5) — root는 UID 0이고 권한 검사를 건너뛴다, 실행의 조건은 path_resolution(7)), `linux-permissions.rwx-permissions`(unlink(2) EACCES — 지우기는 디렉터리의 쓰기·검색 권한),
`linux-permissions.chmod`(capabilities(7) CAP_FOWNER), `linux-permissions.chown`(capabilities(7) CAP_CHOWN), `exam-notes.md` E22.
(phase 75 step 9) `linux-permissions.file-type-char`(unlink(2) DESCRIPTION — 이름 하나를 지워도 다른 하드 링크로 남고, 마지막 이름까지 지워지고 연 프로세스도 없어야 파일이 지워진다)
(phase 75 step 12) `linux-shell.shell`(passwd(5) shell 칸 — 로그인 셸은 계정마다 적는 프로그램이다), `linux-shell.working-directory`(passwd(5) directory 칸 — 로그인하면 홈 디렉터리에서 시작한다), `linux-shell.paths`(passwd(5) — HOME의 값)
(phase 76에서 쓰일 곳) `linux-process-boot.free-command`(proc_meminfo(5) — MemAvailable이 free의 available, SwapTotal·SwapFree)
(phase 76 step 9에서 쓰일 곳) `linux-accounts.etc-passwd`(passwd(5) — 칸 일곱의 차례와 뜻, `x`, 누구나 읽는 까닭), `linux-accounts.user-account`(passwd(5) — root의 UID 0, GID 칸은 기본 그룹, `ls`가 번호를 이름으로 바꾼다), `exam-notes.md`의 「phase 76 step 9」 문단

## (phase 75) shadow(5), free(1), du(1), cal(1), stat(1), file(1)
https://man7.org/linux/man-pages/man5/shadow.5.html
https://man7.org/linux/man-pages/man1/free.1.html
https://man7.org/linux/man-pages/man1/du.1.html
https://man7.org/linux/man-pages/man1/cal.1.html
https://man7.org/linux/man-pages/man1/stat.1.html
https://man7.org/linux/man-pages/man1/file.1.html

2026-10-30에 읽은 판: shadow(5)는 shadow-utils 4.19.0(2026-08-04), free(1)는 procps-ng(2023-05-02판, man7.org가 2026-08-04에 저장소에서 가져옴), du(1)·stat(1)는 GNU coreutils 9.11(April 2026),
cal(1)은 util-linux 2.43 개발판(2026-05-24), file(1)은 file 프로젝트의 2025-06-17판. 뒤의 넷은 기출의 보기를 판정하려고 **이름과 하는 일만** 확인했다.

- **shadow(5)**: 시스템 계정의 암호 정보와 암호 만료 정보를 담은 파일이고, 암호를 지키려면 일반 사용자가 읽을 수 없어야 한다 — DESCRIPTION. 파일 이름은 /etc/shadow다 — FILES. 칸 아홉의 해석은 `linux-accounts`(phase 76)의 몫이다
- **free(1)**: 시스템의 물리 메모리와 스왑 메모리의 전체·사용·남은 양을 보여 주고, /proc/meminfo를 읽어 얻는다 — DESCRIPTION
- **du(1)**: 파일들이 차지한 공간을 어림해 보이고, 디렉터리는 그 안까지 더한다 — NAME, DESCRIPTION
- **cal(1)**: 달력을 보인다. **stat(1)**: 파일이나 파일 시스템의 상태를 보인다. **file(1)**: 파일의 종류를 알아낸다 — 각 NAME
- (phase 76) **free(1)** — 2026-11-04에 다시 읽음(procps-ng, 2023-05-02판 그대로): 이름은 「시스템의 남은 메모리와 쓰인 메모리를 보여 준다」이고, 물리 메모리와 스왑 메모리 각각의 전체·사용·남은 양과
  커널이 쓰는 버퍼·캐시를 보여 준다 — NAME, DESCRIPTION. 칸은 여섯이다(`-w`를 주면 buffers와 cache를 따로 보여 일곱) — DESCRIPTION
  - `total`: 쓸 수 있는 메모리 전체(MemTotal·SwapTotal — 물리·스왑 메모리에서 예약된 몇 부분과 커널 코드를 뺀 것)
  - `used`: 쓰였거나 쓸 수 없는 메모리 — **total − available로 계산한다**
  - `free`: 아무 데도 쓰이지 않은 메모리(MemFree·SwapFree)
  - `shared`: 주로 tmpfs가 쓰는 메모리(Shmem)
  - `buff/cache`: 커널 버퍼(Buffers)와 페이지 캐시·slab(Cached·SReclaimable)을 더한 것
  - `available`: 스왑하지 않고 새 애플리케이션을 시작하는 데 쓸 수 있는 메모리의 어림값. free 칸과 달리 페이지 캐시와, 쓰이고 있어 다 되찾지는 못하는 slab까지 셈에 넣는다(MemAvailable)
  `-h`는 칸마다 세 자리 이하가 되는 가장 짧은 단위로 바꾸고 단위(B·Ki·Mi·Gi·Ti·Pi)를 붙여 보인다. 아무 옵션이 없으면 단위는 키비바이트다 — OPTIONS.
  **출력 예와 줄 이름(`Mem:`·`Swap:`)은 이 페이지에 없다** — 칸 이름과 「물리 메모리·스왑 메모리」 두 가지만 있다. 스왑 쪽 used를 어떻게 셈하는지도 이 페이지는 따로 적지 않는다
  (top(1)의 요약 영역은 물리 메모리 used를 MemTotal − MemAvailable, 스왑 used를 SwapTotal − SwapFree로 적는다 — 아래 「(phase 76) procps-ng」 항목). 「가상 메모리」라는 말은 이 페이지에 없다 — `exam-notes.md` E24
- (phase 76) **du(1)**: 위 줄 그대로다(GNU coreutils 9.11, 2026-11-04에 다시 읽음). 파일 시스템의 남은 양을 보이는 df(1)은 아래 「(phase 76) GNU coreutils」 항목
- (phase 76 step 3) **proc_meminfo(5)**·**tmpfs(5)** — 2026-11-05에 읽음(Linux man-pages 6.19, 2026-02-08): Buffers는 디스크 블록 원본을 비교적 잠시 담아 두는 저장 공간이고 아주 커지지는 않는다.
  Cached는 디스크에서 읽은 파일을 메모리에 담아 둔 캐시(페이지 캐시)다. Shmem은 tmpfs 파일 시스템과 공유 메모리가 쓰는 메모리다 — proc_meminfo(5) 각 항목.
  tmpfs는 내용이 가상 메모리에 놓이는 파일 시스템을 만들게 하고, 그 파일들은 대개 RAM에 있어 읽고 쓰기가 아주 빠르다 — tmpfs(5) DESCRIPTION.
  https://man7.org/linux/man-pages/man5/proc_meminfo.5.html · https://man7.org/linux/man-pages/man5/tmpfs.5.html
  (쓰인 곳: `linux-process-boot.free-command` 셋째 문단의 `buff/cache`·캐시·버퍼·`shared`·tmpfs의 풀이, n150 해설)
- (phase 76 step 9) **shadow(5)** — 2026-11-05에 다시 읽음(shadow-utils 4.19.0, 2026-08-04): 줄마다 콜론으로 나눈 칸 아홉이 이 차례다 — DESCRIPTION
  1. 로그인 이름 — 시스템에 있는 계정 이름이어야 한다
  2. 암호화된 암호 — 비어 있으면 암호 없이 로그인할 수 있다(그런 계정을 막는 프로그램도 있다). `!`로 시작하면 **암호가 잠긴 것**이고 뒤의 글자는 잠그기 전의 값이다.
     crypt(3)의 결과가 될 수 없는 문자열(`!`·`*` 같은 것)이면 그 사용자는 UNIX 암호로 로그인하지 못한다(다른 방법으로는 들어올 수 있다)
  3. 마지막으로 암호를 바꾼 날 — **1970-01-01 00:00:00 UTC부터 센 날 수**. 0이면 다음 로그인 때 암호를 바꿔야 한다. 비어 있으면 암호 기간 기능이 꺼진다
  4. 최소 사용 기간 — 암호를 바꾼 뒤 다시 바꿀 수 있기까지 기다려야 하는 날 수. 비었거나 0이면 최소가 없다
  5. 최대 사용 기간 — 이 날 수가 지나면 암호를 바꿔야 한다. 지난 뒤에도 그 암호는 아직 받아 주고, 다음 로그인 때 바꾸라고 요청한다.
     비어 있으면 최대·경고·비활성 기간이 모두 없다. 최대가 최소보다 작으면 사용자는 암호를 바꿀 수 없다
  6. 경고 기간 — 암호가 만료되기(최대 사용 기간이 다하기) 전 며칠 동안 사용자에게 알리는지. 비었거나 0이면 경고 기간이 없다
  7. 비활성 기간 — 암호가 만료된 뒤에도 며칠 동안 그 암호를 받아 주고 다음 로그인 때 바꾸게 하는지. 만료 뒤 이 기간까지 지나면 로그인할 수 없어 관리자에게 연락해야 한다. 비어 있으면 강제하지 않는다
  8. 계정 만료일 — 계정이 만료되는 날, 1970-01-01부터 센 날 수. **계정 만료는 로그인 자체를 막고, 암호 만료는 그 암호로 로그인하는 것만 막는다** — 둘은 다르다. 비어 있으면 만료되지 않고, 0은 (만료 없음으로도 1970-01-01로도 읽혀) 쓰지 말라고 한다
  9. 예약 칸 — 나중에 쓰려고 남겨 둔 칸
  일반 사용자가 읽을 수 없어야 한다는 것과 파일 이름 /etc/shadow는 위 줄 그대로다 — DESCRIPTION, FILES. 날 수를 날짜로 바꾸는 것은 이 정의에 따른 셈이다(예: 20454 = 2026-01-01).
  https://man7.org/linux/man-pages/man5/shadow.5.html

쓰인 곳: (phase 75에서 쓰일 곳) `linux-filesystem.etc-directory`(shadow(5) — 암호 정보, 일반 사용자가 읽지 못한다), `linux-filesystem.proc-filesystem`(free(1)이 /proc/meminfo를 읽는다 — 쓸지는 그 step이 정한다),
`exam-notes.md`의 「phase 75 step 0」 문단(du·cal·stat·file — 기출 보기의 판정)
(phase 76에서 쓰일 곳) `linux-process-boot.free-command`(free(1) — 칸 여섯과 used = total − available, `-h`, 줄 이름은 출처에 없다; du(1) — 디렉터리가 차지한 양), `exam-notes.md` E24
(phase 76 step 9에서 쓰일 곳) `linux-accounts.etc-shadow`(shadow(5) — 칸 아홉, 날 수, `!`·`*`, 일반 사용자는 읽지 못한다), `linux-accounts.chage`(shadow(5) — 기간 칸의 뜻, 계정 만료와 암호 만료의 차이)

## (phase 75) systemd — systemd-fstab-generator(8), systemd.mount(5), file-hierarchy(7)
https://man7.org/linux/man-pages/man8/systemd-fstab-generator.8.html
https://man7.org/linux/man-pages/man5/systemd.mount.5.html
https://man7.org/linux/man-pages/man7/file-hierarchy.7.html

2026-10-30에 읽은 판: systemd 262 개발판. man7.org가 2026-08-04에 systemd 저장소에서 가져온 것이다.

- **systemd-fstab-generator(8)**: 부팅 초기에(그리고 시스템 관리자의 설정을 다시 읽을 때) /etc/fstab을 systemd의 마운트·스왑 유닛으로 바꾼다 — DESCRIPTION
- **systemd.mount(5)**: /etc/fstab에 적힌 마운트는 부팅 때 유닛으로 바뀌고, 사람이 마운트를 관리할 때는 /etc/fstab이 권하는 방법이다 — FSTAB.
  `noauto`이면 그 마운트 유닛이 local-fs.target·remote-fs.target의 의존 대상이 되지 않아 **부팅 때 자동으로 마운트되지 않고**, 그 반대인 `auto`가 기본값이다 — 「noauto, auto」
- **file-hierarchy(7)**: systemd를 쓰는 운영체제의 파일 계층은 UAPI.9 문서(uapi-group.org)를 따른다고 적고 그 문서를 가리키기만 한다 — DESCRIPTION, NOTES. **그 문서는 허용한 출처가 아니므로 쓰지 않는다**

쓰인 곳: (phase 75에서 쓰일 곳) `linux-filesystem.fstab`(부팅 때 fstab의 항목이 자동으로 마운트된다는 근거 — mount(8) `-a`와 함께, `noauto`), `linux-filesystem.swap`(fstab의 스왑 항목도 부팅 때 스왑 유닛이 된다)

## (phase 75) GPT fdisk 문서(Rod Smith) — GPT fdisk Tutorial, Why Use GPT fdisk?, gdisk(8)
https://www.rodsbooks.com/gdisk/
https://www.rodsbooks.com/gdisk/whygdisk.html
https://www.rodsbooks.com/gdisk/gdisk.html

2026-10-30에 읽은 판: GPT fdisk 1.0.9를 다룬 판 — 「GPT fdisk Tutorial」 2022-04-18, 「Why Use GPT fdisk?」 2022-04-24에 고침. gdisk(8)은 같은 곳에 올린 매뉴얼 페이지다.
`docs/source/network/CLAUDE.md` 「허용하는 출처」대로 **`gdisk`의 사실에만** 쓴다. GPT·MBR 자체의 사실은 fdisk(8)에서 가져온다(위 util-linux 항목).

- GPT fdisk는 `gdisk`·`cgdisk`·`sgdisk`·`fixparts`로 이뤄진 텍스트 모드 파티션 도구 묶음이고, 그 가운데 `gdisk`·`cgdisk`·`sgdisk`는 옛 MBR 파티션 테이블이 아니라 **GPT 디스크**를 다룬다 — GPT fdisk Tutorial 첫머리
- `gdisk`는 GPT 파티션 테이블을 만들고 고치는 대화형 프로그램이다. 화면은 Linux `fdisk`와 비슷하지만 GPT 파티션을 고친다. MBR 파티션 테이블을 받으면 GPT로 바꿔 읽고, 필요하면 보호용 MBR을 새로 만든다 — gdisk(8) NAME, DESCRIPTION
- 2009년 `gdisk`를 처음 만들 때는 Linux `fdisk`가 GPT를 지원하지 않았고, 그 뒤 util-linux의 `fdisk`도 GPT 기능을 갖췄다. `gdisk`의 화면은 util-linux `fdisk`를 본떴지만 코드는 전혀 다르다 — Why Use GPT fdisk?

쓰인 곳: (phase 75에서 쓰일 곳) `linux-filesystem.mbr-gpt`(`gdisk`는 GPT 디스크용으로 따로 만든 도구, 지금의 `fdisk`도 GPT를 다룬다), `exam-notes.md` E19

## (phase 75) NIST 용어집 — sector, volatile memory
https://csrc.nist.gov/glossary/term/sector
https://csrc.nist.gov/glossary/term/volatile_memory

2026-10-30에 읽었다. 용어집은 정의마다 출처 문서를 밝힌다.

- **섹터**(sector): 매체에서 접근할 수 있는 가장 작은 단위 — 출처 NIST SP 800-86
- **휘발성 메모리**(volatile memory): 전원이 꺼지거나 끊기면 내용을 잃는 메모리 — 출처 NIST SP 800-101 Rev. 1, NIST SP 800-72.
  RAM이 휘발성 메모리라는 문장은 허용한 출처에서 직접 찾지 못했다(NIST 용어집의 「random access memory」 항목은 약어만 싣는다)

쓰인 곳: (phase 75에서 쓰일 곳) `linux-filesystem.mbr-gpt`(섹터의 한 줄 풀이), `linux-filesystem.swap`(메모리의 한 줄 풀이 — 쓸지는 그 step이 정한다)

## (phase 75) GNU coreutils — rm(1), chmod(1), chown(1); Linux man-pages — chmod(2), chown(2)
https://man7.org/linux/man-pages/man1/rm.1.html
https://man7.org/linux/man-pages/man1/chmod.1.html
https://man7.org/linux/man-pages/man1/chown.1.html
https://man7.org/linux/man-pages/man2/chmod.2.html
https://man7.org/linux/man-pages/man2/chown.2.html

2026-10-30에 읽은 판(phase 75 step 6): rm(1)·chmod(1)·chown(1)은 GNU coreutils 9.11(April 2026, man7.org가 2026-08-03에 tarball에서 가져옴), chmod(2)·chown(2)는 Linux man-pages 6.19(2026-02-08).

- **rm(1)**: 지정한 파일을 지운다(unlink). 기본으로는 디렉터리를 지우지 않는다 — NAME, DESCRIPTION, OPTIONS. 지우지 못한 경우에 무엇을 출력하는지는 이 페이지에 없다 —
  본문·도식에 `rm`의 오류 출력을 그대로 보이지 않는다. `i`가 붙은 파일을 지우지 못하는 근거는 위 unlink(2)(EPERM)와 FS_IOC_SETFLAGS(2const)(슈퍼유저에게도 걸린다)다
- **chmod(1)**: 파일의 모드 비트(권한)를 바꾼다 — NAME, DESCRIPTION. 기호 모드의 누구는 `u`(소유자)·`g`(파일의 그룹에 든 다른 사용자)·`o`(그룹에 들지 않은 다른 사용자)·`a`(모든 사용자),
  `+`는 고른 비트를 더하고 `-`는 뺀다 — 「SETUID AND SETGID BITS」 앞의 모드 설명. 그래서 `chmod a-w 파일`은 모든 사용자의 쓰기 비트를 뺀다. 누가 모드를 바꿀 수 있는지는 이 페이지에 없다
- **chmod(2)**: 모드를 바꾸려면 호출한 프로세스의 실효 UID가 파일의 소유자와 같거나, 프로세스가 특권을 가져야 한다(Linux: CAP_FOWNER) — DESCRIPTION
- **chown(1)**: 파일의 소유자와 그룹을 바꾼다. `chown 소유자 파일`은 소유자만 바꾸고 그룹은 그대로 둔다 — NAME, DESCRIPTION. 누가 바꿀 수 있는지는 이 페이지에 없다
- **chown(2)**: 파일의 소유자는 특권 프로세스(Linux: CAP_CHOWN)만 바꿀 수 있고, 파일의 소유자는 그룹을 자기가 속한 그룹으로 바꿀 수 있다 — DESCRIPTION
- (phase 75 step 7) **chmod(1)** — 수로 적는 모드: 8진 숫자(0~7) 한 자리에서 네 자리까지이고, 자리마다 4·2·1을 더해 만든다. 네 자리일 때 첫 자리는 특수 비트(set-user-ID 4·set-group-ID 2·sticky 1)이고,
  이어지는 세 자리가 차례로 **파일 소유자**, **그 파일의 그룹에 든 다른 사용자**, **그룹에 들지 않은 다른 사용자**의 읽기(4)·쓰기(2)·실행(1)이다. 적지 않은 앞자리는 0으로 본다 — 그래서 세 자리 `755`는 특수 비트가 0인 `0755`다 — DESCRIPTION
- (phase 75 step 7) **chmod(1)** — 기호 모드: 꼴은 `[ugoa...][[-+=][perms...]...]`이고 여럿을 쉼표로 잇는다. `+`는 고른 비트를 지금의 모드 비트에 더하고, `-`는 빼고, `=`는 고른 비트를 더하면서 **적지 않은 비트를 지운다**(디렉터리의 setuid·setgid 비트만 예외).
  누구(`ugoa`)를 하나도 적지 않으면 `a`를 적은 것처럼 되지만 umask에 켜진 비트는 건드리지 않는다 — DESCRIPTION. `-R`(`--recursive`)은 파일과 디렉터리를 재귀로 바꾼다 — OPTIONS
- (phase 75 step 7) **chown(1)**: 소유자 뒤에 콜론과 그룹을 붙여 적으면(사이에 공백 없이) 그룹도 바꾼다. 소유자를 빼고 콜론과 그룹만 적으면(`:그룹`) 그룹만 바꾸어 chgrp와 같은 일을 한다.
  콜론만 붙이고 그룹을 빼면(`소유자:`) 그룹을 그 사용자의 로그인 그룹으로 바꾼다 — DESCRIPTION. `-R`은 파일과 디렉터리를 재귀로 바꾼다 — OPTIONS. 예: `chown root /u`, `chown root:staff /u` — EXAMPLES.
  `:그룹` 꼴은 GNU 문서가 적은 꼴이다 — POSIX의 operand는 `owner[:group]`이다(아래 「(phase 75 step 7) POSIX.1-2024」 항목)
- (phase 75 step 7) **chown(2)**: 특권 프로세스(CAP_CHOWN)는 그룹도 아무 그룹으로나 바꿀 수 있다. 소유자나 그룹 자리에 -1을 주면 그 값은 바꾸지 않는다 — DESCRIPTION.
  정리하면 「소유자를 바꾸는 일은 특권 프로세스(root)만, 그룹을 바꾸는 일은 파일의 소유자도(자기가 속한 그룹으로만)」다 — `exam-notes.md` E22
- (phase 75 step 11) **chown(2)** — ERRORS: 호출한 프로세스에 소유자나 그룹을 바꿀 권한(위 DESCRIPTION의 규칙)이 없으면 EPERM으로 실패한다. 파일에 immutable·append-only 속성이 붙어 있어도 EPERM이다.
  그래서 본문·도식은 「소유자 `user1`이 `chown user2 report.txt`로 자기 파일을 넘기려 하면 시스템이 그 요청을 거부한다」고 쓴다. `chown`이 그때 무엇을 출력하는지는 chown(1)에 없어 보이지 않는다 —
  Linux man-pages 6.19(2026-02-08), 2026-11-04에 man7.org에서 다시 읽음

위 capabilities(7)(root는 커널의 권한 검사를 모두 건너뛴다)과 함께, 「모든 사용자의 쓰기 권한을 빼도, 소유자를 root로 바꿔도 root가 그 파일을 고치고 지우는 일은 막지 못한다」를 쓴다.
`chmod`·`chown`의 자세한 쓰임(수 모드·기호 모드·`-R`)은 `linux-permissions`(step 7 이후)가 다시 확인한다

쓰인 곳: `linux-filesystem.file-attributes`(rm(1) — `rm`은 파일을 지우는 명령, 「root도 `rm`으로 지우지 못한다」는 unlink(2)·FS_IOC_SETFLAGS(2const)), 문항 n123의 보기·해설(chmod(1)·chmod(2) — `chmod a-w`,
chown(1)·chown(2) — `chown root`, capabilities(7) — root는 권한 검사를 받지 않는다).
(phase 75 step 7) `linux-permissions.octal-mode`(chmod(1) 수 모드 — 4·2·1, 자리 차례, 앞자리 0), `linux-permissions.chmod`(chmod(1) `-R`, chmod(2) — 바꿀 수 있는 사람), `linux-permissions.symbolic-mode`(chmod(1) `+`·`-`·`=`·쉼표·umask),
`linux-permissions.chown`(chown(1) 꼴 셋과 `-R`, chown(2) — 소유자는 특권만·그룹은 소유자도), `exam-notes.md` E22
(phase 75 step 11) `linux-permissions.symbolic-mode`(chmod(1) 기호 모드 — `+`·`-`·`=`, 쉼표), `linux-permissions.chown`(chown(1) — `chown user2`·`chown user2:dev`·`chown :ops`·`-R`, chown(2) — 소유자는 root만·그룹은 소유자가 자기 그룹으로, ERRORS EPERM — 거부),
도식 `SymbolicModeDiagram`·`ChownChangeDiagram`(「거부」 곁말은 chown(2) ERRORS), 문항 n131(chmod(1) 기호 모드), n132(chown(1) 꼴, chown(2) — 실행하는 사람은 root)

## (phase 75 step 7) POSIX.1-2024 — Shell and Utilities: chmod, ls, chown, chgrp, rm, cd / System Interfaces: chown(), unlink(), open(), opendir(), chdir()
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/chmod.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/ls.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/chown.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/chgrp.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/rm.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/cd.html
https://pubs.opengroup.org/onlinepubs/9799919799/functions/chown.html
https://pubs.opengroup.org/onlinepubs/9799919799/functions/unlink.html
https://pubs.opengroup.org/onlinepubs/9799919799/functions/open.html
https://pubs.opengroup.org/onlinepubs/9799919799/functions/opendir.html
https://pubs.opengroup.org/onlinepubs/9799919799/functions/chdir.html

The Open Group Base Specifications Issue 8, IEEE Std 1003.1-2024(2024년판). 2026-10-30에 HTML판을 내려받아 읽었다.

- **chmod — 누가 바꾸나**: 파일의 사용자 ID와 실효 사용자 ID가 같은 프로세스, 또는 적절한 특권을 가진 프로세스만 그 파일의 모드 비트를 바꿀 수 있다 — DESCRIPTION.
  `-R`을 주면 operand가 디렉터리일 때 그 디렉터리와 그 아래 파일 계층 전체의 모드 비트를 바꾼다 — OPTIONS
- **chmod — 기호 모드**: 「누구 + 연산 + 권한」으로 된 절(clause)을 쉼표로 이은 것이고, 절은 적은 차례대로 적용된다 — EXTENDED DESCRIPTION, 「Grammar for chmod」.
  누구 `u`·`g`·`o`는 모드 비트의 사용자(소유자)·그룹·그 밖의 몫이고, `a`는 `ugo`와 같다. 권한 `r`·`w`·`x`는 읽기·쓰기·실행(디렉터리는 검색) 몫이다.
  `+`는 적은 누구·권한의 비트를 켜고, `-`는 끈다. `=`는 **적은 누구의 비트를 먼저 모두 지운 뒤** 적은 권한의 비트를 켠다 — 권한을 적지 않으면 지우기만 한다.
  누구를 적지 않으면 프로세스의 파일 모드 생성 마스크(umask)에 켜진 비트는 켜거나 끄지 않는다 — EXTENDED DESCRIPTION
- **chmod — 예**: `go+-w`는 그룹과 그 밖의 쓰기 비트를 끄고, `g-r+w`는 그룹의 읽기를 끄고 쓰기를 켠다 — EXAMPLES. `chmod a-w 파일`은 모든 쓰기 권한을 없애지만,
  누구를 뺀 `-w`는 umask에 따라 남는 쓰기 권한이 있을 수 있다 — APPLICATION USAGE
- **chmod — 수 모드**: mode가 8진 정수이면 모드 비트를 **절대값으로** 정한다 — 수에서 켜진 비트에 해당하는 권한 비트는 켜고, **나머지 권한 비트는 모두 끈다**.
  자리값은 소유자 읽기 0400·쓰기 0200·실행 0100, 그룹 0040·0020·0010, 그 밖 0004·0002·0001이고, 특수 비트는 4000(set-user-ID)·2000(set-group-ID)·1000(sticky)이다 — EXTENDED DESCRIPTION의 표
- **ls -l 한 줄**: 파일마다 한 줄에 `파일 모드`, `링크 수`, `소유자 이름`, `그룹 이름`, `크기`, `날짜와 시각`, `경로 이름`을 이 차례로 공백을 두고 적는다. 문자 특수 파일과 블록 특수 파일은 크기 자리에 장치 정보를 적는다.
  날짜와 시각은 마지막으로 고친 때이고, POSIX 로캘에서는 고친 지 여섯 달이 안 됐으면 `월 일 시:분`, 그보다 오래됐으면 `월 일 연도` 꼴이다(로캘이 다르면 꼴과 차례가 달라질 수 있다).
  이름을 알 수 없거나 `-n`을 주면 소유자·그룹 자리에 수(ID)를 적는다. 디렉터리 안의 파일 목록 앞에는 `total`로 시작하는 줄이 하나 붙는다 — STDOUT
- **ls -l의 파일 모드**: 종류 글자 하나 + 소유자 권한 세 글자 + 그룹 권한 세 글자 + 그 밖 권한 세 글자이고, 그 파일에 다른 접근 제어 방법이 붙어 있으면 끝에 공백이 아닌 글자 하나가 더 붙는다(없으면 아무것도 붙지 않는다).
  세 글자의 첫 자리는 읽을 수 있으면 `r`, 아니면 `-`이고, 둘째 자리는 쓸 수 있으면 `w`, 아니면 `-`이며, 셋째 자리는 실행할 수 있거나(디렉터리면 검색할 수 있거나) `x`, 아니면 `-`다(특수 비트가 켜지면 `s`·`S`·`t`·`T`) — STDOUT
- **ls -l의 종류 글자**: `d` 디렉터리, `b` 블록 특수 파일, `c` 문자 특수 파일, `l` 심볼릭 링크, `p` FIFO, `s` 소켓, `-` 일반 파일. 구현이 다른 종류의 글자를 더할 수 있다 — STDOUT.
  `-a`는 이름이 마침표(`.`)로 시작하는 항목까지 모두 적고, `-l`은 긴 형식으로 적는다 — OPTIONS
- (phase 75 step 9) **ls -l의 크기·날짜·심볼릭 링크**: 크기 칸은 그 파일의 st_size 값이다(일반 파일이면 바이트 수 — 아래 「(phase 75 step 7) Linux man-pages」 항목의 inode(7)).
  날짜와 시각 칸은 POSIX 로캘에서 고친 지 여섯 달이 안 됐으면 `date "+%b %e %H:%M"`의 출력과 같은 꼴, 곧 영어 달 이름 약자·날·시:분(예 `Oct 30 09:15`)이다.
  심볼릭 링크를 `-L` 없이 적으면 그 줄의 정보는 링크 자신의 것이고, 이름 칸은 `링크 이름 -> 링크 내용` 꼴이다(`->` 앞뒤에 공백 하나) — STDOUT(2026-10-30에 다시 읽음)
- **chown**: operand `owner[:group]`의 owner로 파일의 사용자 ID를 정하고, 그룹 부분을 적었으면 그룹 ID도 정하며, 적지 않았으면 그룹은 바꾸지 않는다. owner는 사용자 이름이나 사용자 ID, group은 그룹 이름이나 그룹 ID다.
  `-R`은 디렉터리와 그 아래 파일 계층 전체를 바꾼다 — DESCRIPTION, OPTIONS, OPERANDS
- **chgrp**: 파일의 그룹 ID를 operand의 그룹으로 바꾼다. 하는 일은 파일의 사용자 ID는 그대로 둔 채 chown() 함수를 부르는 것과 같아서, 누가 바꿀 수 있는지도 chown()의 규칙을 따른다. `-R`도 있다 — DESCRIPTION, OPTIONS
- **chown() 함수**: 파일의 사용자 ID와 같은 실효 사용자 ID를 가진 프로세스나 특권 프로세스만 소유권을 바꿀 수 있다. `_POSIX_CHOWN_RESTRICTED`가 걸려 있으면 **사용자 ID를 바꾸는 일은 특권 프로세스만** 하고,
  특권이 없는 파일 소유자는 사용자 ID를 그대로 둔 채 그룹을 자기 실효 그룹 ID나 보조 그룹 ID 가운데 하나로 바꾸는 일만 할 수 있다 — DESCRIPTION. Linux가 이 제한을 따른다는 것은 chown(2)
- **rm**: 지울 파일에 쓰기 권한이 없고 표준 입력이 터미널이면(`-f`가 없을 때) 지우기 전에 물어보고, 긍정하지 않으면 그 파일을 두고 넘어간다. `-i`를 주면 늘 물어본다 — DESCRIPTION.
  곧 파일 자신의 쓰기 권한은 지울 수 있는지가 아니라 **물어볼지**를 가른다
- **unlink() 함수**: 경로의 디렉터리 가운데 하나에 검색 권한이 없거나, 지울 항목이 든 디렉터리에 쓰기 권한이 없으면 EACCES로 실패한다 — ERRORS
- **open() 함수**: O_CREAT로 새 파일을 만들면 그 파일의 사용자 ID는 프로세스의 실효 사용자 ID가 되고, 그룹 ID는 부모 디렉터리의 그룹 ID나 프로세스의 실효 그룹 ID가 된다 — DESCRIPTION
- **opendir() 함수**: 디렉터리에 읽기 권한이 없거나 경로에 검색 권한이 없으면 EACCES로 실패한다 — ERRORS. **chdir() 함수**: 경로의 어느 디렉터리에든 검색 권한이 없으면 EACCES로 실패한다 — ERRORS.
  `cd` 유틸리티는 마지막에 chdir()과 같은 일을 해서 작업 디렉터리를 바꾼다 — cd DESCRIPTION
- (phase 75 step 12) **cd** — 2026-11-04에 다시 읽음: cd는 지금 셸 실행 환경의 작업 디렉터리를 바꾼다. 피연산자 없이 부르면 HOME 환경 변수가 가리키는 디렉터리를 피연산자로 준 것처럼 동작한다(HOME이 비었거나 없으면 구현이 정한다).
  피연산자가 `/`로 시작하면 그 경로를 그대로 쓰고, 첫 이름이 `.`이나 `..`이면 지금 디렉터리를 기준으로 풀며, 그 밖이면 CDPATH 변수의 디렉터리들(CDPATH가 없으면 `./`, 곧 지금 디렉터리)에서 그 이름의 디렉터리를 찾는다 — DESCRIPTION 1~6단계.
  피연산자는 새 작업 디렉터리가 될 디렉터리의 절대 경로나 상대 경로다 — OPERANDS. 그래서 `cd HOME`은 HOME 변수의 값이 아니라 **이름이 `HOME`인 디렉터리**를 찾고(CDPATH가 없으면 지금 디렉터리 안에서), `cd ../HOME`은 부모 디렉터리 안의 `HOME`을 찾는다.
  홈 디렉터리로 가는 꼴은 피연산자 없는 `cd`와, 셸이 값으로 바꿔 주는 `cd ~`·`cd $HOME`이다(아래 「(phase 75 step 12) POSIX.1-2024 — 2 Shell Command Language」 항목 2.6·2.6.1·2.6.2). `cd /`는 루트 디렉터리로 간다(§3.316·§4.16)
- (phase 75 step 12) **ls**: 표준 입력은 쓰지 않는다 — STDIN. `-a`·`-l`은 위 줄 그대로다
- (phase 75 step 12) **rm -r·-R**: `-R`은 파일 계층을 지우고 `-r`은 `-R`과 같다 — OPTIONS. 디렉터리를 `-r`·`-R`(·`-d`) 없이 주면 진단 메시지를 쓰고 그 디렉터리는 두고 넘어가며,
  `-R`이 있으면 그 안의 항목마다 같은 단계를 밟아 지운 뒤 디렉터리를 지운다(심볼릭 링크를 따라 다른 곳으로 내려가지 않고 링크 자체를 지운다) — DESCRIPTION 2단계. 피연산자의 마지막 이름이 `.`·`..`이거나 루트 디렉터리로 풀리면 지우지 않는다 — DESCRIPTION

쓰인 곳: (phase 75에서 쓰일 곳) `linux-permissions.rwx-permissions`(unlink()·open()·opendir()·chdir()·rm — 디렉터리의 읽기·쓰기·검색, 지우기는 디렉터리의 쓰기·검색 권한), `linux-permissions.owner-group-others`(open() — 새 파일의 소유자),
`linux-permissions.permission-string`(ls STDOUT — 칸의 차례, 파일 모드의 짜임), `linux-permissions.file-type-char`(ls STDOUT — 종류 글자), `linux-permissions.octal-mode`(chmod 수 모드의 표), `linux-permissions.chmod`(chmod DESCRIPTION·`-R`),
`linux-permissions.symbolic-mode`(chmod EXTENDED DESCRIPTION·EXAMPLES·APPLICATION USAGE), `linux-permissions.chown`(chown·chgrp·chown()), `exam-notes.md`의 「phase 75 step 7」 문단과 E22.
`cd`·`ls -a`·`rm`의 물어보기는 `linux-shell`도 쓴다(step 12가 그 주제의 쓰임으로 다시 확인한다).
(phase 75 step 9) `linux-permissions.permission-string`(ls STDOUT — 크기 칸, POSIX 로캘의 날짜 꼴), `linux-permissions.file-type-char`(ls STDOUT — 심볼릭 링크의 이름 칸 `latest -> report.txt`)
(phase 75 step 10) `linux-permissions.chmod`(chmod EXTENDED DESCRIPTION — 수 모드는 절대값이라 `chmod 640`이 그 밖의 읽기 비트를 끈다, DESCRIPTION — 바꾸는 사람은 소유자나 특권이라 쓰기 권한이 있는 그룹 사용자는 못 바꾸고 소유자는 아홉 비트를 다 꺼도 다시 켠다, OPTIONS `-R` — 디렉터리와 그 아래 전체에 같은 모드), 문항 n128·n129(chmod 수 모드의 표 — 4·2·1), n130(chmod DESCRIPTION)
(phase 75 step 11) `linux-permissions.symbolic-mode`(chmod EXTENDED DESCRIPTION — `u`·`g`·`o`·`a`, `a`는 `ugo`, `+`·`-`·`=`의 동작, 절은 적은 차례대로, 수 모드는 절대값이라 원래 권한에 따라 `664`와 `g+w`의 결과가 갈린다),
`linux-permissions.chown`(chown OPERANDS — `owner[:group]`의 차례, chgrp DESCRIPTION, chown() 함수 — 소유자를 바꾸는 일은 특권만), 문항 n131·n132
(phase 75 step 12) `linux-shell.working-directory`(cd DESCRIPTION — 피연산자 없으면 HOME, 작업 디렉터리를 바꾼다), `linux-shell.paths`(cd DESCRIPTION·OPERANDS — `/`로 시작·`.`·`..`·그 밖의 이름을 푸는 차례, `cd HOME`·`cd /`),
`linux-shell.file-commands`(ls OPTIONS `-a`·`-l`, rm OPTIONS·DESCRIPTION — `-r`·`-i`·쓰기 금지 파일에서 묻기), `linux-shell.redirection`(ls STDIN — 표준 입력을 쓰지 않는다), `exam-notes.md`의 「phase 75 step 12」 문단

## (phase 75 step 7) GNU Coreutils 매뉴얼 — 27 File permissions, 10.1.2 What information is listed, 12.2 ln, 12.5 mknod, 13.1 chown, 13.2 chgrp, 13.3 chmod
https://www.gnu.org/software/coreutils/manual/coreutils.html
https://www.gnu.org/software/coreutils/manual/html_node/File-permissions.html

GNU Coreutils 9.12 매뉴얼(Texinfo 7.2로 만든 HTML, Copyright 1994–2026). 2026-10-30에 한 쪽짜리 HTML판을 내려받아 절을 읽었다. man7.org의 coreutils 페이지(chmod(1)·chown(1)·chgrp(1)·ls(1)·ln(1))는 9.11이고,
아래 사실은 그 페이지들과 어긋나지 않는다(나란히 놓고 대조했다).

- **27.1 Structure of File Mode Bits**: 파일 모드 비트는 보통의 접근을 가르는 **권한 비트**와, 일부 파일에만 뜻이 있는 **특수 비트**(setuid·setgid·제한 삭제 플래그 곧 sticky)로 나뉜다. 권한은 세 가지다 —
  **읽기**: 파일을 읽는 것, 디렉터리에서는 그 안의 목록을 보는 것. **쓰기**: 파일을 바꾸는 것, 디렉터리에서는 그 안에 파일을 만들고 지우는 것. **실행**: 파일을 프로그램으로 실행하는 것, 디렉터리에서는 그 안의 파일에 접근하는 것.
  사용자는 **파일의 소유자**, **그 파일의 그룹에 든 다른 사용자**, **그 밖의 모두** 세 부류로 나뉘고, 부류마다 권한이 다를 수 있다 — 27.1
- **27.1 — 소유자와 그룹이 정해지는 때**: 파일을 만들 때 소유자와 그룹이 정해진다. 보통 소유자는 지금 사용자이고 그룹은 그 파일이 든 디렉터리의 그룹이라고 적되, 운영체제·파일 시스템·만드는 방법에 따라 다르다고 단서를 단다. 둘은 chown·chgrp로 바꾼다 — 27.1.
  (Linux에서 새 파일의 그룹이 정해지는 규칙은 아래 「(phase 75 step 7) Linux man-pages」 항목의 inode(7)·open(2))
- **27.1 — 권한 밖의 제한**: 모드 비트가 허락해도 파일 시스템의 속성(예: immutable)이 막거나 파일 시스템이 읽기 전용으로 마운트되어 있으면 그 작업은 실패한다 — `chmod a+w`를 했더라도 immutable 파일은 고칠 수 없다 — 27.1
- **27.2.1 Setting Permissions**: 기호 모드는 「누구 연산 권한」을 공백 없이 붙여 적는다. 누구는 `u`(파일 소유자), `g`(그 파일의 그룹에 든 다른 사용자), `o`(그 밖의 모든 사용자), `a`(모든 사용자 — `ugo`와 같다).
  연산은 `+`(이미 가진 권한에 더하기), `-`(이미 가진 권한에서 빼기), `=`(적은 권한**만** 갖게 하기). 권한은 `r`·`w`·`x`(디렉터리면 검색). `=` 뒤의 권한을 비우면(`go=`) 그 부류는 아무 권한도 갖지 않는다.
  `go-w`는 소유자의 권한도, 다른 사용자의 읽기·실행도 건드리지 않는다. 그리고 `go=`로 다른 사용자의 권한을 모두 없앤 파일이라도, **그 파일이 든 디렉터리에 쓰기 권한이 있는 다른 사용자는 그 파일을 지울 수 있다** — 27.2.1
- **27.2.5 Making Multiple Changes**: 기호 모드 여럿을 쉼표로 잇는다 — 예 `a+r,go-w`(모두에게 읽기를 주고 소유자가 아닌 사람의 쓰기를 뺀다), `u=rwx,g=rx,o=`(아홉 비트를 모두 드러내 정한다) — 27.2.5
- **27.2.6 The Umask and Protection**: 누구를 빼면 `a`처럼 되지만 umask에 켜진 권한은 건드리지 않는다. 반면 `a+w`는 umask와 상관없이 모두에게 쓰기를 준다 — 27.2.6
- **27.3 Numeric Modes**: 모드를 8진수(base 8)로 적을 수 있다. 부류마다 읽기·쓰기·실행에 한 비트씩, 세 비트를 쓰고 그 세 비트를 **8진 숫자 한 자리**로 적는다 — 세 비트가 모두 켜진 2진수 `111`은 8진수 `7`이다.
  특수 비트 셋도 한 자리를 차지하고 맨 앞에 온다. 자리값: 소유자 400·200·100, 그 파일의 그룹에 든 다른 사용자 40·20·10, 그룹에 들지 않은 다른 사용자 4·2·1. 예: `664`는 기호 모드 `ug=rw,o=r`과 같고, `0`은 `a=`와 같다.
  수 모드는 보통 이전 모드 비트를 고려하지 못하고 **절대값으로만** 정한다(디렉터리의 setuid·setgid 비트는 예외). 수 모드는 늘 8진수로 읽으므로 앞에 0을 붙이지 않아도 된다 — 27.3
- **10.1.2 What information is listed** — `-l`: 이름에 더해 파일 종류, 파일 모드 비트, 하드 링크 수, 소유자 이름, 그룹 이름, 크기, 시각(보통 마지막으로 고친 시각)을 적는다. 블록·문자 특수 파일은 크기 자리에 장치 번호 둘을 적는다.
  종류 글자는 `-` 일반 파일, `b` 블록 특수 파일, `c` 문자 특수 파일, `d` 디렉터리, `l` 심볼릭 링크, `p` FIFO(이름 있는 파이프), `s` 소켓이고, 다른 시스템의 글자들과 알 수 없는 종류의 `?`도 있다.
  모드 비트 뒤에는 ACL 같은 다른 접근 방법이 있는지 가리키는 글자 하나가 오는데, 없으면 공백이고 있으면 `.`(보안 문맥만)이나 `+`(그 밖)다 — 10.1.2
- **12.2 ln**: **하드 링크**는 이미 있는 파일의 또 다른 이름이라 원래 이름과 구별되지 않는다(같은 inode를 함께 쓴다). 대부분의 시스템은 디렉터리에 하드 링크를 만들지 못하게 하고, 하드 링크는 파일 시스템의 경계를 넘지 못한다.
  **심볼릭 링크**는 다른 파일을 이름으로 가리키는 특수한 종류의 파일이고, 열기·읽기·쓰기 같은 대부분의 일은 커널이 가리키는 파일에 하지만 지우기 같은 몇몇은 링크 파일 자체에 한다. `ln`은 기본으로 하드 링크를, `-s`로 심볼릭 링크를 만든다 — 12.2
- **12.5 mknod**: 특수 파일은 데이터를 내거나 받는 무언가이고 보통 프린터·플래시 드라이브 같은 물리 하드웨어에 해당한다. 이런 장치는 **한 번에 한 글자씩** 읽거나 **여러 글자를 한 덩어리(블록)로** 읽어서,
  문자 특수 파일과 블록 특수 파일로 나눈다 — 12.5
- **13.1 chown**: `[소유자][:[그룹]]` — 소유자만 적으면 그룹은 그대로, `소유자:그룹`은 둘 다, `소유자:`는 그룹을 그 사용자의 로그인 그룹으로, `:그룹`은 그룹만 바꾸어 chgrp와 같다. 콜론만 적으면 아무것도 바꾸지 않는다.
  사용자가 그룹을 아무것으로나 바꿀 수 있는지는 시스템마다 다르고, 이식성 있는 동작은 자기가 속한 그룹으로만 바꾸는 것이다 — 13.1
- **13.2 chgrp**: 파일의 그룹을 그룹 이름이나 그룹 ID로 바꾼다 — 13.2
- **13.3 chmod**: 파일의 사용자 ID와 실효 사용자 ID가 같은 프로세스나 적절한 특권을 가진 프로세스만 모드 비트를 바꿀 수 있다. chmod는 심볼릭 링크 자체의 권한은 바꾸지 않는다(명령 줄에 적은 링크는 그것이 가리키는 파일을 바꾼다) — 13.3
- (phase 75 step 12) 2026-11-04에 같은 9.12 매뉴얼을 다시 내려받아 아래 절을 읽었다.
- (phase 75 step 12) **10.1.1 Which files are listed**: ls는 기본으로 명령 줄의 파일과 디렉터리 안의 목록을 적되, 디렉터리 안에서 이름이 `.`으로 시작하는 파일은 빼고 적는다. `-a`(`--all`)를 주면 그 파일들도 적는다 — 10.1.1.
  이름이 `.`으로 시작하는 파일을 **숨은 파일**(hidden files)이라 부르는 것은 같은 매뉴얼 30.3.2(버전 정렬의 우선순위 — 「files starting with a dot」)와 bash 매뉴얼 8.3.1(`match-hidden-files`)이다
- (phase 75 step 12) **11.1 cp**: 복사본은 원본과 완전히 따로다. 파일 하나를 다른 파일로, 또는 여러 파일을 한 디렉터리 안으로 복사한다 — 11.1. `-i`(`--interactive`): 디렉터리가 아닌 파일을 복사할 때 이미 있는 대상 파일을 덮어쓸지 묻고, 긍정하지 않으면 그 복사는 실패로 친다 — 11.1 `-i`
- (phase 75 step 14) **11.1 cp — `-r`**(https://www.gnu.org/software/coreutils/manual/html_node/cp-invocation.html, 9.12, 2026-11-04에 내려받아 읽음): `-r`·`-R`·`--recursive`는 디렉터리를 그 안까지 재귀적으로 복사한다 — 11.1 `-R`. `-i`가 아니므로 이미 있는 대상에 묻지 않는다
- (phase 75 step 12) **11.4 mv**: mv는 파일(이나 디렉터리)을 옮기거나 이름을 바꾼다 — 이름 둘을 주면 첫째를 둘째로 옮긴다. 옮기는 일은 보통 이름을 바꾸는 것이고, 대상의 파일 시스템이 달라 이름 바꾸기가 안 되면 복사한 뒤 원본을 지운다.
  대상 파일이 이미 있고 보통은 쓸 수 없는 파일이며 표준 입력이 터미널이고 `-f`가 없으면, `-i`가 없어도 바꿀지 묻는다 — 11.4. `-i`는 권한과 관계없이 이미 있는 대상마다 덮어쓸지 묻는다 — 11.4 `-i`
- (phase 75 step 12) **11.5 rm**: 기본으로 디렉터리는 지우지 않는다. 쓸 수 없는 파일이고 표준 입력이 터미널이며 `-f`가 없거나, `-i`가 있으면 지울지 묻고, 긍정하지 않으면 그 파일은 두고 넘어간다.
  마지막 이름이 `.`·`..`인 것은 묻지 않고 거부한다 — 11.5

쓰인 곳: (phase 75에서 쓰일 곳) `linux-permissions.owner-group-others`(27.1 — 세 부류, 새 파일의 소유자), `linux-permissions.rwx-permissions`(27.1 — 파일·디렉터리에서 읽기·쓰기·실행의 뜻, 27.2.1 — 디렉터리 쓰기 권한이 있으면 남의 파일도 지운다),
`linux-permissions.permission-string`(10.1.2 — `-l`의 칸, 모드 뒤 한 글자), `linux-permissions.file-type-char`(10.1.2 — 종류 글자, 12.2 — 하드 링크·심볼릭 링크, 12.5 — 블록·문자 장치), `linux-permissions.octal-mode`(27.3),
`linux-permissions.chmod`(13.3), `linux-permissions.symbolic-mode`(27.2.1·27.2.5·27.2.6, 27.3 — 수 모드는 절대값), `linux-permissions.chown`(13.1·13.2)
(phase 75 step 11) `linux-permissions.symbolic-mode`(27.2.1 — 누구·연산·권한, `=`는 적은 권한만 갖게, 27.2.5 — 쉼표로 여럿, 27.3 — 수 모드는 절대값), `linux-permissions.chown`(13.1 — `소유자`·`소유자:그룹`·`:그룹` 꼴, 이식성 있는 동작은 자기가 속한 그룹으로만, 13.2 — chgrp)
(phase 75 step 12) `linux-shell.file-commands`(10.1.1 — `-a`와 숨은 파일, 11.1 — cp와 `-i`, 11.4 — mv는 옮기기와 이름 바꾸기가 같은 명령·`-i` 없이 묻는 때, 11.5 — rm은 기본으로 디렉터리를 지우지 않는다·묻는 때), `exam-notes.md`의 「phase 75 step 12」 문단
(phase 75 step 14) 문항 n137(11.1 `-R` — `cp -r`은 재귀 복사이고 묻지 않는다, 11.1 `-i`)

## (phase 75 step 7) Linux man-pages — path_resolution(7), inode(7), link(2), symlink(7), open(2), rename(2), rmdir(2), tty(4), null(4); GNU coreutils — ls(1), ln(1), chgrp(1)
https://man7.org/linux/man-pages/man7/path_resolution.7.html
https://man7.org/linux/man-pages/man7/inode.7.html
https://man7.org/linux/man-pages/man2/link.2.html
https://man7.org/linux/man-pages/man7/symlink.7.html
https://man7.org/linux/man-pages/man2/open.2.html
https://man7.org/linux/man-pages/man2/rename.2.html
https://man7.org/linux/man-pages/man2/rmdir.2.html
https://man7.org/linux/man-pages/man4/tty.4.html
https://man7.org/linux/man-pages/man4/null.4.html
https://man7.org/linux/man-pages/man1/ls.1.html
https://man7.org/linux/man-pages/man1/ln.1.html
https://man7.org/linux/man-pages/man1/chgrp.1.html

2026-10-30에 읽은 판: Linux man-pages 6.19 — path_resolution(7)·inode(7)·symlink(7)·open(2)·rename(2)·rmdir(2) 2026-02-08, link(2) 2026-02-11, tty(4) 2026-07-02, null(4) 2025-05-17(man7.org가 2026-09-09에 man-pages-6.19 타르볼에서 가져온 것).
ls(1)·ln(1)·chgrp(1)은 GNU coreutils 9.11(April 2026).

- **path_resolution(7)** — 「Permissions」: 파일 권한 비트는 셋씩 세 묶음이다. 호출한 프로세스의 실효 사용자 ID가 파일 소유자 ID와 같으면 **첫 묶음**을 쓰고, 그렇지 않고 파일의 그룹 ID가 프로세스의 실효 그룹 ID나 보조 그룹 ID 가운데 하나와 같으면 **둘째 묶음**을, 둘 다 아니면 **셋째 묶음**을 쓴다.
  묶음 안의 세 비트는 차례로 읽기·쓰기, 그리고 일반 파일이면 실행·디렉터리면 검색이다. (Linux는 실효 ID 대신 파일 시스템 ID(fsuid·fsgid)를 쓰지만 보통 둘은 같다)
- **path_resolution(7)** — 「Step 2: walk along the path」: 경로를 따라가다 지금 찾아 들어가는 디렉터리에 검색 권한이 없으면 EACCES(「Permission denied」)다
- **path_resolution(7)** — 「Bypassing permission checks: superuser and capabilities」: 전통적인 유닉스에서 슈퍼유저(root, 사용자 ID 0)는 파일에 접근할 때 권한 제한을 모두 건너뛴다. Linux에서 파일 권한 검사와 얽힌 능력은 CAP_DAC_OVERRIDE와 CAP_DAC_READ_SEARCH이고,
  fsuid가 0인 프로세스는 이 능력을 갖는다. CAP_DAC_OVERRIDE는 권한 검사를 모두 넘어서지만 **실행 권한은 세 실행 비트 가운데 적어도 하나가 켜져 있을 때만** 준다.
  그러니 「root는 권한 검사를 받지 않는다」는 읽기·쓰기에서는 그대로 맞고, 실행에서는 「누구에게도 `x`가 없는 파일은 root도 실행하지 못한다」는 단서가 붙는다 — POSIX §4.7과 같은 규칙이다
- **inode(7)**: 사용자 ID 칸은 파일 소유자의 사용자 ID이고, **새로 만든 파일은 만든 프로세스의 실효 사용자 ID를 받는다**. 그룹 ID 칸은 파일 그룹의 ID이고, 새 파일은 부모 디렉터리에 set-group-ID 비트가 켜져 있으면 그 디렉터리의 그룹을, 아니면 만든 프로세스의 실효 그룹 ID를 받는다.
  둘 다 chown(2)으로 바꾼다. 링크 수 칸은 그 파일의 하드 링크 수다 — 「User ID」·「Group ID」·「Link count」.
  파일 종류는 소켓·심볼릭 링크·일반 파일·블록 장치·디렉터리·문자 장치·FIFO다. st_mode의 아래 아홉 비트(0777)가 파일 권한 비트이고, 소유자 00400 읽기·00200 쓰기·00100 실행, 그룹 00040·00020·00010, 그 밖(그룹에 들지 않은 사람) 00004·00002·00001이다 — 「The file type and mode」
- **link(2)**: 이미 있는 파일에 새 링크(하드 링크라고도 한다)를 만든다. 새 이름은 옛 이름과 똑같이 쓰이고, 두 이름이 같은 파일을 가리켜 권한과 소유자도 같으며, 어느 쪽이 「원래」 이름인지 가릴 수 없다 — DESCRIPTION
- **symlink(7)**: 심볼릭 링크는 다른 파일의 경로 이름을 내용으로 담은 특수한 종류의 파일이다. 밑에 있는 객체가 아니라 다른 이름을 가리키므로 디렉터리도 가리킬 수 있고 파일 시스템의 경계도 넘으며, 가리키는 경로가 없어도 된다(dangling link).
  하드 링크는 원래 파일과 구별되지 않고, 디렉터리를 가리키지 못하며 파일 시스템의 경계를 넘지 못한다 — DESCRIPTION. Linux에서 보통 심볼릭 링크의 권한은 어떤 동작에도 쓰이지 않고 늘 0777이다 — 「Symbolic link ownership, permissions, and timestamps」
- **open(2)**: O_CREAT로 새 파일을 만들면 그 파일의 소유자(사용자 ID)는 프로세스의 실효 사용자 ID가 된다 — DESCRIPTION. 파일이 아직 없는데 부모 디렉터리에 쓰기 권한이 없으면 EACCES다 — ERRORS
- **rename(2)**: oldpath나 newpath가 든 디렉터리에 쓰기 권한이 없으면 EACCES다 — ERRORS. **rmdir(2)**: 지울 디렉터리가 든 디렉터리에 쓰기 권한이 없으면 EACCES다 — ERRORS
- **tty(4)**: `/dev/tty`는 문자 파일(문자 장치)이고 프로세스의 제어 터미널을 가리킨다 — DESCRIPTION. **null(4)**: `/dev/null`에 쓴 데이터는 버려지고 읽으면 늘 파일 끝이다. 보통 `mknod -m 666 /dev/null c 1 3`처럼 문자 장치(`c`)로 만든다 — DESCRIPTION
- **ls(1)**: `-l`은 긴 목록 형식, `-a`(`--all`)는 `.`으로 시작하는 항목도 숨기지 않는다 — DESCRIPTION
- **ln(1)**: 기본으로 하드 링크를 만들고, `-s`(`--symbolic`)를 주면 심볼릭 링크를 만든다. 하드 링크를 만들 때는 대상이 있어야 한다 — DESCRIPTION, OPTIONS
- **chgrp(1)**: 각 파일의 그룹을 GROUP으로 바꾼다. `-R`은 파일과 디렉터리를 재귀로 바꾼다 — DESCRIPTION, OPTIONS
- (phase 75 step 9) **ln(1)** — SYNOPSIS·DESCRIPTION: 첫 꼴은 `ln [OPTION]... [-T] TARGET LINK_NAME`이고 TARGET에 LINK_NAME이라는 이름의 링크를 만든다.
  그래서 `ln report.txt report2.txt`는 `report.txt`에 하드 링크 `report2.txt`를, `ln -s report.txt latest`는 `report.txt`를 가리키는 심볼릭 링크 `latest`를 만든다(2026-10-30에 다시 읽음)
- (phase 75 step 9) **inode(7)** — 「File size」: 일반 파일과 심볼릭 링크의 크기는 바이트 단위다(심볼릭 링크의 크기는 그것이 담은 경로 이름의 길이)
- (phase 76 step 9) **inode(7)** — 2026-11-05에 다시 읽음(Linux man-pages 6.19, 2026-02-08): 위 「User ID」·「Group ID」 줄 그대로다. 파일은 소유자와 그룹을 **번호**(사용자 ID·그룹 ID — credentials(7)대로 정수)로 담고,
  그 번호를 이름으로 바꿔 보이는 것은 /etc/passwd를 읽는 `ls` 같은 도구다(passwd(5) — 위 「(phase 75) Linux man-pages」 항목의 「(phase 76 step 9)」 줄). 새 파일의 그룹이 보통 기본 그룹이 되는 까닭은 아래 「(phase 76 step 9) util-linux」 항목의 login(1) 줄

쓰인 곳: (phase 75에서 쓰일 곳) `linux-permissions.owner-group-others`(path_resolution(7) — 어느 묶음을 쓰나·root, inode(7)·open(2) — 새 파일의 소유자), `linux-permissions.rwx-permissions`(path_resolution(7) 검색 권한, open(2)·rename(2)·rmdir(2) — 디렉터리의 쓰기 권한),
`linux-permissions.permission-string`(ls(1), inode(7) 링크 수), `linux-permissions.file-type-char`(inode(7) 파일 종류, link(2)·symlink(7)·ln(1) — 하드 링크와 심볼릭 링크, tty(4)·null(4) — 문자 장치의 예), `linux-permissions.octal-mode`(inode(7) 자리값),
`linux-permissions.chown`(chgrp(1), inode(7) — 소유자와 그룹은 chown(2)으로 바꾼다).
(phase 75 step 9) `linux-permissions.permission-string`(inode(7) — 크기는 바이트 단위), `linux-permissions.file-type-char`(ln(1) — `ln 대상 이름`과 `ln -s 대상 이름`의 꼴)
(phase 76 step 9에서 쓰일 곳) `linux-accounts.user-account`(inode(7) — 파일은 소유자를 UID 번호로 담는다, 새 파일은 만든 프로세스의 실효 그룹 ID를 받는다)

## (phase 75 step 12) GNU Bash Reference Manual — 1.1 What is Bash?, 1.2 What is a shell?, 3.2.3 Pipelines, 3.6 Redirections, 3.7.2 Command Search and Execution, 3.7.3 Command Execution Environment, 3.7.5 Exit Status, 4.1 Bourne Shell Builtins, 5.1 Bourne Shell Variables, 6.9 Controlling the Prompt
https://www.gnu.org/software/bash/manual/bash.html

GNU Bash Reference Manual Edition 5.3(2025-05-18 고침, Bash 5.3). 2026-11-04에 한 쪽짜리 HTML판을 내려받아 절을 읽었다.

- **1.1**: Bash는 GNU 운영체제의 셸, 곧 명령 언어 해석기이고, 이름은 Bourne-Again SHell을 줄인 것이다. IEEE POSIX의 셸과 도구 부분을 따르는 구현을 목표로 하고, GNU 운영체제의 기본 셸이다 — 1.1
- **1.2**: 유닉스 셸은 명령 해석기이면서 프로그래밍 언어다. 대화형으로 쓰면 키보드로 입력한 것을 받아들이고, 비대화형이면 파일이나 문자열에서 명령을 읽는다. 동기 명령은 끝날 때까지 기다린 뒤 다음 입력을 받는다.
  셸에는 내장 명령(builtin)도 있다 — `cd`처럼 셸 자체를 바꾸는 명령은 셸 밖의 따로 된 프로그램으로 만들 수 없고, `pwd` 같은 것은 따로 만들 수도 있지만 편해서 내장으로 둔다 — 1.2
- **3.7.2**: 명령 이름에 `/`가 없으면 셸 함수 → 내장 명령 → PATH 변수의 디렉터리에서 그 이름의 실행 파일 차례로 찾는다. 찾지 못하면 오류 메시지를 내고 종료 상태 127로 끝난다.
  찾았거나 이름에 `/`가 있으면 그 프로그램을 **따로 된 실행 환경**에서 실행하고, 비동기로 시작하지 않았으면 끝나기를 기다려 종료 상태를 받는다 — 3.7.2
- **3.7.3·3.7.5·4.1**: 내장도 함수도 아닌 명령은 셸과 따로 된 실행 환경에서 실행되고, 그 명령은 셸의 실행 환경(작업 디렉터리 등)을 바꿀 수 없다 — 3.7.3.
  명령을 실행하려고 만든 프로세스를 **자식 프로세스**라 부른다(명령을 찾지 못하면 그 자식 프로세스가 127을 돌려준다) — 3.7.5. 내장 `exec`는 새 프로세스를 만들지 않고 셸 자신을 그 명령으로 바꾼다 — 4.1 `exec`.
  셸이 자식 프로세스를 어느 시스템 호출로 만드는지는 이 매뉴얼에 없다
- **3.2.3**: 파이프라인은 `|`로 이은 명령들이고, 각 명령의 출력이 파이프로 다음 명령의 입력에 이어진다 — 다음 명령이 앞 명령의 출력을 읽는다. 이 연결은 앞 명령에 붙은 리다이렉션보다 먼저 이뤄진다 — 3.2.3(`|&`는 다루지 않는다)
- **3.6**: 명령을 실행하기 전에 셸이 그 명령의 입력과 출력을 다른 파일로 돌릴 수 있다. 디스크립터 번호를 빼면 `<`로 시작하는 연산자는 표준 입력(0)을, `>`로 시작하는 연산자는 표준 출력(1)을 가리킨다.
  리다이렉션은 적은 차례로 왼쪽부터 처리한다 — 3.6(연산자마다의 동작은 POSIX 2.7과 같다 — 아래 항목)
- **4.1 cd**: 작업 디렉터리를 바꾼다. 디렉터리를 주지 않으면 HOME 셸 변수의 값을 디렉터리로 쓴다. `/`로 시작하지 않는 디렉터리를 주고 CDPATH가 있으면 CDPATH의 디렉터리들에서 찾는다 — 4.1 `cd`(POSIX cd와 같다)
- **5.1·6.9 프롬프트**: 주 프롬프트 변수 PS1의 기본값은 `\s-\v\$ `다 — 5.1 PS1. 프롬프트 안의 `\$`는 실효 사용자 ID가 0(root)이면 `#`, 아니면 `$`로 바뀐다 — 6.9.
  그래서 bash의 기본 프롬프트는 root이면 `#`로, 일반 사용자면 `$`로 끝난다(`\s-\v`는 셸 이름과 판 번호). 배포판이 PS1을 어떻게 바꿔 두는지는 확인하지 않았다 — 본문은 「보통」으로 한정한다

쓰인 곳: (phase 75에서 쓰일 곳) `linux-shell.shell`(1.1·1.2 — bash는 GNU의 셸이자 명령 해석기·대화형으로 키보드 입력을 받는다·내장 명령, 3.7.2·3.7.3·3.7.5 — 내장이 아닌 명령은 자식 프로세스로 실행하고 끝나기를 기다린다, 5.1·6.9 — 프롬프트 `$`·`#`),
`linux-shell.working-directory`(1.2 — `cd`·`pwd`는 내장, 4.1 `cd`), `linux-shell.redirection`(3.6), `linux-shell.pipe`(3.2.3), `linux-shell.file-commands`(8.3.1 `match-hidden-files` — 숨은 파일이라는 말), `exam-notes.md` E23
(phase 76에서 쓰일 곳) `linux-process-boot.process`(3.7.2·3.7.5 — 셸은 내장이 아닌 명령을 실행하려고 자식 프로세스를 만든다, 그래서 셸이 그 명령 프로세스의 부모다. 같은 프로그램을 두 번 실행하면 자식 프로세스가 따로 둘 생기고
각자 자기 PID를 받는다 — 아래 fork(2)와 「(phase 76) Linux man-pages」 항목의 credentials(7)을 이은 것. 셸이 어느 시스템 호출로 자식을 만드는지는 여전히 쓰지 않는다 — `exam-notes.md` E23)

## (phase 75 step 12) POSIX.1-2024 — Shell and Utilities: 2 Shell Command Language (2.1, 2.5.3, 2.6, 2.6.1, 2.6.2, 2.7, 2.9.1.6, 2.9.2)
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html

The Open Group Base Specifications Issue 8, IEEE Std 1003.1-2024(2024년판). 2026-11-04에 HTML판을 내려받아 읽었다.

- **2.1 Shell Introduction**: 셸은 명령 언어 해석기다. 셸은 입력을 읽어 낱말과 연산자로 나누고, 단순 명령·복합 명령으로 짜 맞춘 뒤, 낱말을 확장하고 리다이렉션을 처리해 인자 목록에서 뺀다.
  그다음 함수·내장 유틸리티·실행 파일·스크립트를 실행하고, 필요하면 끝나기를 기다려 종료 상태를 받는다 — 2.1(개요의 차례)
- **2.9.1.6 Non-built-in Utility Execution**: 셸은 내장이 아닌 유틸리티를 따로 된 유틸리티 환경에서 실행한다. 명령 이름에 `/`가 없으면 PATH로 찾고, 찾으면 **execl() 함수를 부른 것과 같은 동작**으로 그 경로의 프로그램을 실행한다(인자 0은 명령 이름, 나머지는 명령의 인자) — 2.9.1.6.
  exec 계열 함수는 Linux에서 execve(2) 시스템 호출 위에 얹혀 있다(아래 「(phase 75 step 12) Linux man-pages」 항목 exec(3))
- **2.5.3 PS1**: 대화형 셸은 명령을 읽을 준비가 될 때마다 PS1의 값을 확장해 표준 오류에 쓴다(프롬프트). 기본값은 `$ `(달러와 공백)이고, 구현이 정한 추가 특권을 가진 사용자에게는 다른 값을 기본으로 둘 수 있다 — 2.5.3 PS1. POSIX는 그 값을 `#`로 정하지 않는다 — root의 `#`는 bash 6.9(위 항목)
- **2.6 Word Expansions**: 낱말의 확장은 틸드 확장·변수(매개변수) 확장·명령 대체·산술 확장 → 필드 나누기 → 경로 이름 확장 → 따옴표 없애기의 차례로 한다. `$` 글자가 변수 확장·명령 대체·산술 확장을 연다 — 2.6
- **2.6.1 Tilde Expansion**: 낱말 맨 앞의 따옴표 없는 `~`가 혼자이면(뒤가 `/`이거나 낱말 끝) HOME 변수의 값으로 바뀐다. `~` 뒤에 로그인 이름이 오면 그 사용자의 처음 작업 디렉터리(홈 디렉터리) 경로로 바뀐다 — 2.6.1
- **2.6.2 Parameter Expansion**: `${이름}`(이름 다음 글자가 헷갈리지 않으면 `$이름`)은 그 변수의 값으로 바뀐다 — 2.6.2. 그래서 `$HOME`은 홈 디렉터리의 경로로 바뀌지만, `$`도 `~`도 없는 낱말 `HOME`은 변수 값으로 바뀌지 않고 글자 그대로 명령에 넘어간다
- **2.7 Redirection**: 꼴은 `[n]연산자 낱말`이고 `n`은 파일 디스크립터 번호다(셸은 적어도 0~9를 받는다). 리다이렉션 연산자와 그 낱말은 명령에 넘기는 인자에 들지 않는다.
  여러 개면 앞에서부터 차례로 처리하고, 파일을 열거나 만들지 못하면 그 리다이렉션은 실패한다 — 2.7
  - `<`: 그 파일을 읽기로 연다. 번호를 빼면 표준 입력(0)이다 — 2.7.1
  - `>`: 그 파일을 출력으로 연다. 파일이 없으면 빈 파일로 만들고, **있으면 길이를 0으로 잘라(O_TRUNC) 연다** — 곧 원래 내용이 지워지고 새로 쓰인다. 번호를 빼면 표준 출력(1)이다.
    noclobber 옵션(`set -C`)이 켜져 있으면 이미 있는 일반 파일에 대한 `>`는 실패한다(`>|`는 그래도 연다) — 2.7.2. noclobber는 있다는 것만 적고 다루지 않는다
  - `>>`: 파일 끝에 덧붙이도록(O_APPEND) 연다. 파일이 없으면 만든다. 번호를 빼면 표준 출력이다 — 2.7.3
  - `<<`: **here-document** — 명령 줄 다음 줄부터, 정한 낱말(구분자)만 있는 줄이 나올 때까지의 줄들을 그 명령의 입력으로 넘긴다. 번호를 빼면 표준 입력이다 — 2.7.4
  - 번호를 붙이면 그 디스크립터를 돌린다 — `2>파일`은 표준 오류(2)를 그 파일로 보낸다 — 2.7·2.7.2, Base Definitions §3.353
- **2.9.2 Pipelines**: 파이프라인은 제어 연산자 `|`로 나눈 명령들이다. 셸은 마지막을 뺀 각 명령의 표준 출력을 다음 명령의 표준 입력에 잇는다 — 파이프를 만들어 쓰는 끝을 앞 명령의 표준 출력으로, 읽는 끝을 뒤 명령의 표준 입력으로 준다.
  파이프라인이 잇는 입출력은 그 명령에 붙은 리다이렉션보다 먼저 정해진다. 백그라운드가 아니면 셸은 마지막 명령이 끝나기를 기다린다 — 2.9.2

쓰인 곳: (phase 75에서 쓰일 곳) `linux-shell.shell`(2.1 — 셸이 명령 줄을 해석하는 차례, 2.9.1.6 — 프로그램을 execl()과 같은 동작으로 실행, 2.5.3 — 프롬프트 기본값 `$ `), `linux-shell.paths`(2.6·2.6.1·2.6.2 — `~`와 `$HOME`, `HOME`은 바뀌지 않는다),
`linux-shell.redirection`(2.7·2.7.1~2.7.4 — `<`·`>`·`>>`·`<<`·`2>`), `linux-shell.pipe`(2.9.2), `exam-notes.md`의 「phase 75 step 12」 문단과 E23

## (phase 75 step 12) POSIX.1-2024 — Shell and Utilities: pwd, cat, cp, mv, mkdir, man, more, grep, find
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/pwd.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/cat.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/cp.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/mv.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/mkdir.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/man.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/more.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/grep.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/find.html

The Open Group Base Specifications Issue 8, IEEE Std 1003.1-2024(2024년판). 2026-11-04에 HTML판을 내려받아 읽었다.

- **pwd**: 현재 작업 디렉터리의 **절대 경로**를 표준 출력에 한 줄로 쓰고, 그 경로에는 `.`·`..`이 들지 않는다 — DESCRIPTION, STDOUT
- **cat**: 파일들을 차례로 읽어 그 내용을 같은 차례로 표준 출력에 쓴다 — DESCRIPTION
- **cp**: 원본 파일의 내용을 대상 경로로 복사한다. 마지막 피연산자가 있는 디렉터리면 그 안에 원본의 마지막 이름으로 복사하고, `-R`이면 원본 아래 파일 계층 전체를 복사한다 — DESCRIPTION.
  `-i`는 이미 있는 대상 파일(디렉터리가 아닌 것)에 복사하기 전에 표준 오류에 물음을 쓰고, 표준 입력의 대답이 긍정이면 복사하고 아니면 하지 않는다 — OPTIONS
- (phase 75 step 14) **cp — 이미 있는 대상**(2026-11-04에 다시 읽음): 대상 파일이 이미 있으면 `-i`일 때만 표준 오류에 물음을 쓰고 대답이 긍정이 아니면 그 원본은 두고 넘어간다. 그 밖에는 대상 파일을 O_WRONLY|O_TRUNC로 열어(길이를 0으로 잘라) 원본의 내용을 쓴다 — DESCRIPTION 3단계.
  곧 `-i` 없이는 묻지 않고 덮어쓴다
- (phase 75 step 14) **ls — 피연산자 없음**(https://pubs.opengroup.org/onlinepubs/9799919799/utilities/ls.html, 2026-11-04에 내려받아 읽음): 피연산자를 하나도 주지 않으면 `.` 하나를 준 것처럼 동작한다 — DESCRIPTION. 곧 디렉터리를 적지 않으면 작업 디렉터리의 목록을 보인다
- **mv**: 원본을 대상으로 옮긴다 — 마지막 피연산자가 있는 디렉터리면 그 안으로 같은 이름으로, 아니면 그 경로 이름으로(같은 디렉터리 안이면 곧 이름 바꾸기) 옮긴다. 하는 일은 rename() 함수와 같다 — DESCRIPTION.
  대상이 이미 있고 `-f`가 없을 때, ①대상에 쓰기 권한이 없고 표준 입력이 터미널이거나 ②`-i`가 있으면, 표준 오류에 물음을 쓰고 한 줄을 읽어 긍정이 아니면 그 원본은 그대로 두고 넘어간다 — DESCRIPTION 1단계.
  `-i`는 대상이 있으면 확인을 묻고 `-f`는 묻지 않으며, 둘 다 주면 마지막 것을 따른다 — OPTIONS
- **mkdir**: 피연산자로 준 디렉터리들을 그 차례로 만든다 — DESCRIPTION(`-p`·`-m`은 다루지 않는다)
- **man**: 이름 피연산자마다 그것에 관한 정보를 쓴다 — 표준 유틸리티면 적어도 그 문법·옵션·피연산자·영향을 주는 환경 변수·종료 상태를 쓴다 — DESCRIPTION. User Portability Utilities 선택 사항([UP])이다
- **more**: 파일을 읽어, 표준 출력이 터미널이면 **한 화면씩**(정한 줄 수만큼) 사용자 명령에 따라 쓰고, 터미널이 아니면 그대로 표준 출력에 복사한다 — DESCRIPTION. 파일을 주지 않으면 표준 입력을 읽는다 — OPERANDS.
  화면에서 `<space>`(스페이스)는 기본으로 한 화면을 앞으로 넘기고 — Scroll Forward One Line, `q`는 끝낸다 — Quit(EXTENDED DESCRIPTION). [UP]
- **grep**: 입력 파일에서 하나 이상의 패턴에 맞는 줄을 골라 낸다 — DESCRIPTION. 고른 줄은 표준 출력에 쓴다 — STDOUT. 파일을 주지 않으면 표준 입력을 읽는다 — OPERANDS.
  패턴은 꼭 있어야 한다 — 세 꼴의 SYNOPSIS 모두 `pattern_list`나 `-e`·`-f`를 요구한다(패턴 문법인 정규 표현식은 다루지 않는다)
- (phase 75 step 15) **sort**(https://pubs.opengroup.org/onlinepubs/9799919799/utilities/sort.html, 2026-11-04에 내려받아 읽음): 이름 붙은 파일들의 줄을 늘어놓아(sort) 결과를 출력에 쓴다 — DESCRIPTION.
  비교는 줄 전체(키를 주지 않으면)를 지금 로캘의 글자 차례(collating sequence)로 한다 — DESCRIPTION. 파일 피연산자를 하나도 주지 않으면 표준 입력을 쓴다 — OPERANDS·STDIN.
  `-o`·`-c`가 없으면 늘어놓은 입력은 표준 출력에 쓴다 — STDOUT. 본문은 차례를 「정해진 글자 차례」로만 쓰고 로캘·키·옵션은 다루지 않는다
- **find**: `find [-H|-L] 경로... [식]` — 경로마다 그 아래 디렉터리 계층을 **끝까지 내려가며** 만나는 파일마다 식(primary를 이은 참·거짓 식)을 평가한다 — SYNOPSIS, DESCRIPTION
  - `-name 패턴`: 지금 경로의 **마지막 이름**(basename)이 셸의 패턴 맞추기 꼴(`*` 같은 — 2.14)에 맞으면 참 — OPERANDS
  - `-type c`: 파일 종류가 `c`면 참 — `b`·`c`·`d`·`l`·`p`·`f`·`s`가 차례로 블록 특수 파일·문자 특수 파일·디렉터리·심볼릭 링크·FIFO·일반 파일·소켓 — OPERANDS
  - `-perm [-]mode`·`-perm [-]onum`: 파일의 권한 비트로 고른다. `-` 없이 쓰면 권한 비트가 **정확히** 같을 때, `-`를 붙이면 적은 비트가 **적어도 모두** 켜져 있을 때 참이다.
    mode는 chmod의 기호 모드처럼(모든 비트가 꺼진 틀에 적용해서) 쓰거나 8진수로 쓴다 — OPERANDS. 하나라도 켜져 있으면 참인 `/mode`는 GNU의 꼴이다(아래 find(1))
  - `-user 이름`: 그 사용자가 소유한 파일이면 참(이름 대신 수를 주면 사용자 ID로 읽을 수 있다) — OPERANDS
  - `-exec 유틸리티 [인자…] ;`: 경로마다 한 번씩 그 유틸리티를 실행하고 종료 상태가 0이면 참이다. 인자 가운데 `{}` 두 글자뿐인 것은 지금 경로로 바뀐다. 유틸리티는 find를 시작한 디렉터리에서 실행된다.
    `{} +`로 끝내면 경로를 모아 한 번에 넘긴다(다루지 않는다) — OPERANDS
  - `-print`: 지금 경로를 표준 출력에 쓰고 줄을 바꾼다. **식이 없으면 `-print`가 식이고**, 식에 `-exec`·`-ok`·`-print`가 없으면 `( 식 ) -print`로 다룬다 — 곧 기본 동작은 찾은 경로를 출력하는 것이다 — OPERANDS
- (phase 75 step 16) **find — 시작 경로 자신**(2026-11-04에 다시 내려받아 읽음): 경로 피연산자는 준 그대로 평가되고, 그 아래에서 만난 파일의 경로 이름은 그 경로 피연산자 뒤에 `/`(피연산자가 `/`로 끝나지 않으면)와 그 아래의 상대 이름을 이은 것이다 — DESCRIPTION.
  곧 시작 디렉터리 자신도 식으로 평가되어 `-type d`면 함께 출력되고, `find /home/user1 -name "*.log"`가 내는 경로는 `/home/user1/app.log`·`/home/user1/docs/old.log` 꼴이다. 출력의 차례는 본문에 쓰지 않는다
- (phase 75 step 16) **패턴의 `*`**(https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html, 2026-11-04에 다시 내려받아 읽음): 별표 `*`는 아무 문자열(빈 문자열도)에나 맞는 패턴이다 — 2.14.2 Patterns Matching Multiple Characters. `-name`이 쓰는 셸의 패턴 맞추기가 이것이다

쓰인 곳: (phase 75에서 쓰일 곳) `linux-shell.working-directory`(pwd DESCRIPTION·STDOUT), `linux-shell.file-commands`(cat·cp·mv·mkdir·man DESCRIPTION, cp·mv OPTIONS `-i`, mv DESCRIPTION — `-i` 없이 묻는 때와 이름 바꾸기),
`linux-shell.pipe`(more DESCRIPTION·OPERANDS·EXTENDED DESCRIPTION, grep DESCRIPTION·STDOUT·OPERANDS), `linux-shell.find`(find SYNOPSIS·DESCRIPTION·OPERANDS — `-name`·`-type`·`-perm`·`-user`·`-exec`·`-print`), `exam-notes.md`의 「phase 75 step 12」 문단
(phase 75 step 14) `linux-shell.file-commands`(cp DESCRIPTION 3단계 — `-i` 없이 덮어쓴다, ls DESCRIPTION — 피연산자 없으면 작업 디렉터리), 문항 n137(cp DESCRIPTION·OPTIONS `-i`, mv `-i`, rm `-i`)
(phase 75 step 15) `linux-shell.redirection`(sort DESCRIPTION·OPERANDS·STDIN·STDOUT — `sort < notes.txt`·`sort << END`, cat DESCRIPTION — `cat list.txt`), `linux-shell.pipe`(more·grep·cat — 위 줄 그대로), 문항 n139(sort OPERANDS·STDOUT), n140(more·grep)
(phase 75 step 16) `linux-shell.find`(find SYNOPSIS·DESCRIPTION·OPERANDS — 끝까지 내려감·시작 경로 자신·출력 경로의 꼴·`-name`·`-type f`·`-type d`·`-perm`의 정확히·`-`·`-user`·`-exec`의 `{}`·`-exec`가 있으면 `-print`를 덧붙이지 않음, 2.14.2 — `*`), 문항 n141(find `-name`·`-user`·`-type`·`-perm`·`-exec`)

## (phase 75 step 12) POSIX.1-2024 — Shell and Utilities: vi, ex
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/vi.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/ex.html

The Open Group Base Specifications Issue 8, IEEE Std 1003.1-2024(2024년판). 2026-11-04에 HTML판을 내려받아 읽었다. 둘 다 User Portability Utilities 선택 사항([UP])이다.
**vi의 사실은 이 두 페이지로만 쓴다** — 허용한 출처에 vim 문서가 없다. 지금 배포판의 `vi` 명령이 vim 같은 다른 프로그램인지는 확인하지 않았다.

- **vi**: 화면을 쓰는(screen-oriented) 텍스트 편집기다. POSIX는 vi의 open·visual 모드만 적고, 나머지 편집 기능은 줄 편집기 `ex`에서 정한다. vi와 ex를 오갈 수 있고 vi 안에서 ex 명령을 실행할 수 있다 — vi DESCRIPTION
- **모드**: 터미널이 받쳐 주면 vi는 시작한 뒤 **명령 모드**에 있다. 글을 넣거나 바꾸는 명령 몇 가지로 **텍스트 입력 모드**에 들어가고, 입력 모드에서 `<ESC>`를 누르면 입력 모드를 끝내고 명령 모드로 돌아온다 — vi EXTENDED DESCRIPTION 머리, Input Mode Commands in vi(`<ESC>`)
  - `i`는 커서 **앞**에서 — Insert Before Cursor, `a`는 커서 **뒤**에서 — Append, `o`는 지금 줄 **아래**에 새 줄을 열고 — Insert Empty Line Below 입력 모드에 들어간다(`O`는 위에)
- **`:`**: ex 명령을 실행한다 — Execute an ex Command. `/`·`?`·`:`·`!` 같은 줄 명령은 화면 맨 아래 줄에서 그 글자를 프롬프트로 보이며 입력을 받고, 줄바꿈(Enter)으로 끝낸다 — vi EXTENDED DESCRIPTION(화면의 마지막 줄)
- (phase 75 step 16) **`:` 뒤**(2026-11-04에 다시 내려받아 읽음): `:`는 ex 명령을 하나 이상 실행한다. 명령이 마지막 줄 밖의 화면을 덮어썼으면 vi는 사용자의 글자 하나를 기다리고, 그 글자가 `:`가 아니면 화면을 다시 그린 뒤 **명령 모드로 돌아간다** — Execute an ex Command.
  본문은 「Enter로 실행하면, vi를 끝내는 명령이 아니면 다시 명령 모드로 돌아온다」까지만 쓴다(덮어쓴 경우의 기다림은 쓰지 않는다)
- (phase 75 step 16) **입력 모드의 글자**: 텍스트 입력 모드에서 입력한 글자는 지금 줄의 입력 지점에 들어간다 — Input Mode Commands in vi. 그래서 같은 `x`가 명령 모드에서는 지우기 명령, 입력 모드에서는 넣는 글자다
- **count**: 대부분의 명령 앞에 붙이는 양의 정수로, 되풀이 횟수나 크기를 주며 주지 않으면 1이다. `D`·`u` 같은 몇 명령은 count를 받지 않고 무시한다 — Command Descriptions in vi(count)
- **x**: 커서의 글자부터 count개의 글자를 지운다(주지 않으면 하나) — Delete Character at Cursor
- **d·dd·dw**: `d` 뒤에 동작(motion) 명령을 붙여 그 범위를 지운다. `d`를 되풀이한 `dd`는 지금 줄부터 count개의 **줄**을 지운다 — Delete. `w`는 다음 낱말의 시작으로 옮기는 명령이라,
  `dw`는 커서부터 다음 낱말 앞까지(낱말 뒤의 공백까지)를 지운다 — Delete, Move to Beginning of Word·Move to Beginning of Bigword(d·y의 범위)
- **D**: 커서부터 그 줄 끝까지 지운다 — `d$`와 같다 — Delete to End-of-Line
- **u**: ex의 undo와 같다 — 편집 버퍼를 바꾼 마지막 명령을 되돌린다. 되돌리기 자신도 그 「마지막 명령」에 든다 — vi Undo, ex Undo
- **ex의 주소**: 줄 주소는 1부터 세는 줄 번호다. `.`은 지금 줄, `$`는 마지막 줄, 수 n은 n번째 줄이고, 주소 둘은 쉼표로 잇는다(`2,6`). `%`는 `1,$`(모든 줄)와 같다 — Addressing in ex.
  주소 둘(2addr)을 받는 명령에 주소를 주지 않으면 지금 줄만이다 — Command Descriptions in ex(2addr)
- **q**: `q[uit][!]` — `!` 없이 쓰면, 마지막으로 다 쓴(저장한) 뒤 편집 버퍼가 바뀌었을 때 **오류가 되어 끝나지 않는다**. 그렇지 않으면 편집을 끝낸다. `!`를 붙이면 그 검사 없이 끝낸다 — Quit
- **w**: 줄을 주지 않으면 버퍼 전체를 쓴다. 파일 이름을 주지 않으면 지금 경로 이름(편집하고 있는 파일)에 쓴다. 쓴 줄 수와 바이트 수를 알린다 — Write
- **wq**: 쓰기 다음에 끝내기와 같고, 쓰기가 실패하면 끝내지 않는다. `wq!`는 `write!` 다음 끝내기다 — Write. (`x`·`ZZ`도 있지만 다루지 않는다)
- **s**: `[2addr] s/패턴/바꿀 말/[옵션]` — 지정한 줄마다 패턴에 맞는 **첫 하나**를 바꿀 말로 바꾼다. 옵션에 `g`(global)가 있으면 그 줄에서 겹치지 않게 맞는 것을 **모두** 바꾼다. 지정한 모든 줄에서 하나도 바꾸지 못하면 오류다 — Substitute.
  그래서 `:2,6s/red/blue/g`는 2~6번째 줄의 `red`를 모두 `blue`로 바꾸고, `g`가 없으면 줄마다 첫 `red`만 바꾼다. 패턴은 정규 표현식이지만 그 문법은 다루지 않는다
- **r**: `[1addr] r[ead] 파일` — 그 파일의 사본을 지정한 줄 뒤에 붙여 넣는다 — Read. 바꾸기 명령이 아니다(기출 보기의 판정에만 쓴다)

쓰인 곳: (phase 75에서 쓰일 곳) `linux-shell.vi`(vi DESCRIPTION, 모드와 `i`·`a`·`o`·`<ESC>`, `:`과 마지막 줄), `linux-shell.vi-edit-commands`(`x`·`dd`·`dw`·`D`·`u`, count),
`linux-shell.vi-colon-commands`(ex Quit·Write·Substitute·Addressing — `:q`·`:q!`·`:w`·`:wq`·`:s`·줄 범위·`g`·`%`), `exam-notes.md`의 「phase 75 step 12」 문단
(phase 75 step 16) `linux-shell.vi`(vi DESCRIPTION — 화면 텍스트 편집기, EXTENDED DESCRIPTION — 시작하면 명령 모드·`i`·`a`·`o`·`<ESC>`·마지막 줄의 `:`, Execute an ex Command — 명령 모드로 돌아감, Input Mode Commands in vi, Delete Character at Cursor — `x` 한 줄), 문항 n142

## (phase 75 step 12) Linux man-pages — fork(2), execve(2), exec(3), stdin(3), shells(5); util-linux — chsh(1), more(1); GNU findutils — find(1); man-db — man(1); GNU grep — grep(1)
https://man7.org/linux/man-pages/man2/fork.2.html
https://man7.org/linux/man-pages/man2/execve.2.html
https://man7.org/linux/man-pages/man3/exec.3.html
https://man7.org/linux/man-pages/man3/stdin.3.html
https://man7.org/linux/man-pages/man5/shells.5.html
https://man7.org/linux/man-pages/man1/chsh.1.html
https://man7.org/linux/man-pages/man1/more.1.html
https://man7.org/linux/man-pages/man1/find.1.html
https://man7.org/linux/man-pages/man1/man.1.html
https://man7.org/linux/man-pages/man1/grep.1.html

2026-11-04에 읽은 판: Linux man-pages 6.19 — fork(2) 2026-06-05, execve(2) 2026-02-08, exec(3) 2025-05-17, stdin(3) 2026-07-02, shells(5) 2025-05-17.
chsh(1)·more(1)은 util-linux 2.43.devel(2026-05-24), find(1)은 GNU findutils(2025-10-12, man7.org가 2026-08-03에 git에서 가져옴), man(1)은 man-db 2.13.1(2025-05-02), grep(1)은 GNU grep 3.12(2025-03-21)이다.

- **fork(2)**: 부른 프로세스를 그대로 본떠 새 프로세스를 만든다 — 새 것을 자식 프로세스, 부른 쪽을 부모 프로세스라 부르고, 자식은 자기만의 프로세스 ID를 갖는다 — DESCRIPTION
- **execve(2)**: 경로가 가리키는 프로그램을 실행한다 — 부른 프로세스가 실행하던 프로그램이 새 프로그램으로 바뀐다. 새 프로그램에는 명령 줄 인자의 배열(관례로 첫째는 그 파일 이름)과 환경이 넘어간다 — DESCRIPTION
- **exec(3)**: exec 계열 함수(execl() 등)는 지금 프로세스의 이미지를 새 것으로 바꾸고, **execve(2) 위에 얹혀 있다** — DESCRIPTION
- 위 셋과 intro(2)(시스템 호출은 커널로 들어가는 입구), bash 매뉴얼 3.7.5(명령을 실행하려고 자식 프로세스를 만든다), POSIX 2.9.1.6(execl()과 같은 동작으로 실행한다)을 이으면
  「셸은 명령 줄을 스스로 해석한 뒤, 프로그램을 실행해야 하면 그 실행을 시스템 호출로 커널에 요청한다」를 쓸 수 있다. 다만 **셸이 자식 프로세스를 어느 시스템 호출(fork(2) 등)로 만드는지 적은 문장은 허용한 출처에서 찾지 못했다** — 본문에 「fork로 만든다」고 쓰지 않는다
- **stdin(3)**: 유닉스 프로그램은 시작할 때 입력용·출력용·진단(오류) 메시지용 흐름 셋을 열어 받는다. 이것을 표준 입력·표준 출력·표준 오류라 부른다. 보통 사용자의 터미널에 이어져 있지만,
  부모 프로세스가 정한 대로 파일이나 다른 장치일 수도 있다. 시작할 때 셋의 파일 디스크립터는 0·1·2다 — DESCRIPTION
- **shells(5)**: `/etc/shells`는 쓸 수 있는 로그인 셸의 전체 경로를 적은 텍스트 파일이고 chsh(1)가 이 파일을 본다. 예로 `/bin/sh`·`/bin/bash`·`/bin/csh`를 든다 — DESCRIPTION, EXAMPLES
- **chsh(1)**: 로그인 셸을 바꾸는 명령이다. 특권 없는 사용자는 기본으로 `/etc/shells`에 있는 셸만 고를 수 있다 — DESCRIPTION, VALID SHELLS.
  「셸은 커널의 일부가 아닌 보통 프로그램이다」를 그 말 그대로 적은 곳은 찾지 못했다. 쓸 수 있는 것은 셸이 프로그램이라는 것(POSIX §3.333), 셸이 `/bin/bash` 같은 경로의 파일이고
  계정마다 로그인 셸을 passwd의 칸에 적어 두며 사용자가 chsh로 바꿀 수 있다는 것(shells(5)·passwd(5)·chsh(1))까지다
- **more(1)**(util-linux): 글을 한 화면씩 넘겨 보는 필터다 — DESCRIPTION
- **find(1)**(GNU findutils): `-name 패턴`은 앞 디렉터리를 뗀 파일 이름이 셸 패턴에 맞는지 본다 — `-name`. `-type`의 `f`는 일반 파일, `d`는 디렉터리다 — `-type`. `-user 이름`은 그 사용자가 소유한 파일(수로 된 사용자 ID도 된다) — `-user`.
  `-perm mode`는 권한 비트가 정확히 mode, `-perm -mode`는 mode의 비트가 모두 켜짐, `-perm /mode`는 mode의 비트 가운데 하나라도 켜짐이다(`/` 꼴은 POSIX에 없다) — `-perm`.
  `-exec 명령 ;`은 `;`가 나올 때까지의 인자를 명령의 인자로 받고, `{}`를 지금 처리하는 파일 이름으로 바꾸며, 찾은 파일마다 한 번씩 시작 디렉터리에서 명령을 실행한다.
  셸이 `;`·`{}`를 먼저 해석하지 않도록 역슬래시로 막거나(`\;`) 따옴표로 감싸야 할 수 있다 — `-exec`
- (phase 75 step 16) **find(1)의 시작 경로와 따옴표**(2026-11-04에 다시 읽음): `-mindepth 1`은 시작 경로를 뺀 모든 파일을 처리한다는 뜻이다 — 곧 기본으로는 시작 경로도 처리한다 — `-mindepth`.
  `-name`의 패턴은 셸이 먼저 펼치지 않게 따옴표로 감싸라고 한다 — `-name`. 따옴표 없이 `*.c`를 쓰면 셸이 지금 디렉터리에서 맞는 파일 이름들로 펼쳐 `find`에 넘긴다 — 「paths must precede expression」 절
- **man(1)**(man-db): man은 시스템의 매뉴얼 페이저다. 인자로 준 이름(보통 프로그램·유틸리티·함수의 이름)마다 그 매뉴얼 페이지를 찾아 보여 준다 — DESCRIPTION
- **grep(1)**(GNU grep): 파일마다 패턴을 찾아, 패턴에 맞는 줄을 출력한다. 파일을 주지 않으면(재귀 검색이 아니면) 표준 입력을 읽는다 — DESCRIPTION

쓰인 곳: (phase 75에서 쓰일 곳) `linux-shell.shell`(fork(2)·execve(2)·exec(3) — 프로그램 실행은 시스템 호출을 거친다, shells(5)·chsh(1) — 로그인 셸은 고를 수 있는 프로그램), `linux-shell.redirection`(stdin(3) — 표준 입력·출력·오류와 0·1·2),
`linux-shell.pipe`(more(1)·grep(1)), `linux-shell.find`(find(1) — `-perm`의 세 꼴, `-exec`의 `{}`와 `\;`), `linux-shell.file-commands`(man(1)), `exam-notes.md` E23
(phase 75 step 16) `linux-shell.find`(find(1) — `-type f`·`-type d`·`-user`·`-perm`의 `/`, `-exec`의 `\;`, `-mindepth` — 시작 경로도 처리, `-name` — 패턴을 따옴표로 감싸는 까닭), 문항 n141
(phase 76에서 쓰일 곳) `linux-process-boot.process`(fork(2) — 새 프로세스를 만든 쪽이 부모이고 자식은 자기 PID를 갖는다, execve(2) — 프로세스가 실행하는 프로그램이 바뀌어도 프로세스는 그대로), `linux-process-boot.ps-command`(grep(1) — 표준 입력에서 패턴에 맞는 줄을 고른다)

## (phase 76) Linux man-pages — credentials(7), getpid(2), signal(7), nice(2), sched(7), syslog(2), bootparam(7)
https://man7.org/linux/man-pages/man7/credentials.7.html
https://man7.org/linux/man-pages/man2/getpid.2.html
https://man7.org/linux/man-pages/man7/signal.7.html
https://man7.org/linux/man-pages/man2/nice.2.html
https://man7.org/linux/man-pages/man7/sched.7.html
https://man7.org/linux/man-pages/man2/syslog.2.html
https://man7.org/linux/man-pages/man7/bootparam.7.html

2026-11-04에 읽은 판: Linux man-pages 6.19 — credentials(7) 2026-07-02, getpid(2)·signal(7)·nice(2)·sched(7)·syslog(2)·bootparam(7) 2026-02-08. man7.org가 2026-09-09에 man-pages-6.19 타르볼에서 가져온 것이다.

- **credentials(7)**: 프로세스마다 fork(2)로 만들어질 때 다른 것과 겹치지 않는 0 이상의 정수 ID, 곧 **PID**가 붙고 getpid(2)로 자기 PID를 얻는다. PID는 kill(2)·setpriority(2) 같은 시스템 호출이 대상 프로세스를 가리키는 데 쓰인다.
  execve(2)로 다른 프로그램을 실행해도 PID는 그대로다 — 「Process ID (PID)」. **PPID**(부모 프로세스 ID)는 fork(2)로 이 프로세스를 만든 프로세스를 가리키고 getppid(2)로 얻으며, execve(2) 뒤에도 그대로다 — 「Parent process ID (PPID)」
- **getpid(2)**: getppid()는 부모의 PID를 돌려준다. 이 프로세스를 만든 프로세스가 이미 끝났으면, 이 프로세스가 넘겨진 프로세스(init(1)이나 prctl(2)로 정한 「subreaper」)의 PID를 돌려준다 — DESCRIPTION
- **signal(7)**: 시그널마다 기본 동작(disposition)이 있고, `Term`은 프로세스를 끝내는 동작이다 — 「Signal dispositions」. SIGTERM은 끝내라는 시그널이고 SIGKILL도 기본 동작이 Term이다 — 「Standard signals」.
  번호는 SIGKILL이 9, SIGTERM이 15다(x86·ARM 등 대부분의 아키텍처) — 「Signal numbering for standard signals」. **SIGKILL과 SIGSTOP은 붙잡거나 막거나 무시할 수 없다** — 「Standard signals」
  (phase 78 step 11, 2026-11-11에 다시 읽음 — 6.19, 2026-02-08) SIGINT는 키보드에서 온 끼어들기(interrupt), SIGQUIT은 키보드에서 온 끝내기(quit) 시그널이고, 기본 동작은 SIGINT가 Term, SIGQUIT이 Core(끝내며 코어 덤프)다 — 「Standard signals」.
  어느 키가 그 시그널을 보내는지는 아래 「(phase 78 step 11) Linux man-pages — ip-address(8), termios(3)」 항목의 termios(3) 줄 — 쓰일 곳 `diagnostic-commands.ping-options`(Linux ping을 Ctrl-C로 끝낸다)
- **nice(2)**: 나이스 값이 클수록 우선순위가 낮다. 범위는 +19(낮은 우선순위)부터 -20(높은 우선순위)까지이고, 범위 밖 값은 끝값으로 맞춰진다.
  전통적으로 나이스 값을 낮추는(우선순위를 높이는) 일은 특권 프로세스만 할 수 있었고, Linux 2.6.12부터는 RLIMIT_NICE 한도가 알맞으면 특권 없는 프로세스도 낮출 수 있다 — DESCRIPTION
- **sched(7)**: 나이스 값은 CPU 스케줄러가 어떤 프로세스를 더 우대하거나 덜 우대하게 하는 속성이고 nice(2)·setpriority(2) 등으로 바꾼다. 지금 Linux의 범위는 -20(높은 우선순위)~+19(낮은 우선순위)다 — 「The nice value」
- **syslog(2)**: 커널은 printk()로 남기는 메시지를 로그 수준과 관계없이 크기가 LOG_BUF_LEN인 **순환 버퍼**(cyclic buffer)에 쌓는다. 크기는 옛 커널에서 4096·8192·16384바이트였고 Linux 2.4.23/2.6부터는 커널을 만들 때 정하는 설정 값이다 — 「The kernel log buffer」.
  이 버퍼를 「커널 메시지 링 버퍼」라 부르고, 「모두 읽기」 명령은 마지막으로 비운 뒤 쓰인 것까지만 읽는다 — NAME, 「Commands」(SYSLOG_ACTION_READ_ALL).
  **가득 차면 오래된 메시지가 새 메시지로 덮인다고 적은 문장은 찾지 못했다** — 「크기가 정해진 순환 버퍼」까지만 쓴다
  (phase 76 step 7, 2026-11-05에 다시 읽음 — 6.19, 2026-02-08) printk() 메시지마다 로그 수준이 있고, 관례상 뜻은 0 시스템을 쓸 수 없음(KERN_EMERG)·1 곧바로 조치해야 함·2 심각한 상태·3 오류 상태(KERN_ERR)·4 경고 상태(KERN_WARNING)·
  5 정상이지만 눈여겨볼 상태·6 안내(KERN_INFO)·7 디버그 메시지의 여덟 단계다 — 「The log level」. 커널은 수준이 console_loglevel보다 작은(더 급한) 메시지만 콘솔에 출력한다 — 같은 절.
  메시지는 로그 수준과 관계없이 링 버퍼에 쌓이므로(위 「The kernel log buffer」), 콘솔에 나오지 않은 메시지도 링 버퍼에는 있다
- **bootparam(7)**: 커널 인자 `init=`은 커널이 처음 실행할 명령을 정하고, 정하지 않았거나 찾지 못하면 커널은 `/sbin/init`·`/etc/init`·`/bin/init`·`/bin/sh`를 차례로 시도한다 — 「General non-device-specific boot arguments」.
  커널 메시지는 klogd(8) 같은 데몬에 넘겨져 디스크에 기록될 수 있다 — 「Boot arguments for use by kernel developers」(`debug`). **어느 파일에 기록되는지는 적혀 있지 않다** — `exam-notes.md` E25
- (phase 76 step 9) **credentials(7)** — 「User and group identifiers」(2026-11-05에 다시 읽음, 6.19 2026-07-02): 프로세스마다 사용자 ID와 그룹 ID가 여럿 딸려 있고, 모두 **정수**다(uid_t·gid_t).
  실제 사용자·그룹 ID는 그 프로세스를 누가 가졌는지를 정하고, 실효 ID(Linux에서 파일에는 실효 ID를 따라가는 파일 시스템 ID)와 **보조 그룹 ID**가 파일 등에 접근할 때의 권한을 가른다.
  보조 그룹 ID는 권한 검사에 함께 쓰이는 추가 그룹 ID들의 집합이다(Linux 2.6.4부터 65536개까지). fork(2)로 만든 자식은 부모의 사용자·그룹 ID를 그대로 물려받고, execve(2) 뒤에도 실제 ID와 보조 그룹 ID는 남는다 — 같은 절.
  POSIX 쪽 정의(사용자 ID §3.408, 그룹 ID §3.165, 보조 그룹 ID §3.361)는 위 「(phase 75) POSIX.1-2024」 항목의 「(phase 75 step 7)」 줄에 있다

쓰인 곳: (phase 76에서 쓰일 곳) `linux-process-boot.process`(credentials(7) — PID·PPID, getpid(2) — 만든 쪽이 먼저 끝나면 init(1)으로 넘어간다), `linux-process-boot.process-commands`(signal(7) — TERM·KILL과 번호, nice(2)·sched(7) — 나이스 값의 범위와 특권),
`linux-process-boot.dmesg`(syslog(2) — 커널 로그 버퍼, bootparam(7) — 데몬이 디스크에 기록할 수 있다), `linux-process-boot.boot-sequence`(bootparam(7) `init=` — 커널이 처음 실행할 프로그램), `exam-notes.md` E25
(phase 76 step 9에서 쓰일 곳) `linux-accounts.user-account`(credentials(7) — UID·GID는 정수, 보조 그룹 ID, 자식 프로세스가 물려받는다)

## (phase 76) procps-ng — ps(1), top(1), kill(1)
https://man7.org/linux/man-pages/man1/ps.1.html
https://man7.org/linux/man-pages/man1/top.1.html
https://man7.org/linux/man-pages/man1/kill.1@@procps-ng.html

2026-11-04에 읽은 판: procps-ng — ps(1) 2025-04-23, top(1) 2025-03-13, kill(1) 2023-12-27. man7.org가 2026-08-04에 procps-ng 저장소(마지막 커밋 2026-07-30)에서 가져온 것이다.

- **ps(1)**: 지금 살아 있는 프로세스 가운데 고른 것의 정보를 보여 준다. **고른 목록과 정보를 되풀이해 새로 보고 싶으면 top을 쓰라고 한다** — DESCRIPTION.
  옵션은 세 갈래다 — 대시를 붙이는 Unix 꼴, 대시를 붙이지 않는 BSD 꼴, 대시 둘을 붙이는 GNU 긴 꼴 — DESCRIPTION.
  옵션이 없으면 지금 사용자와 실효 사용자 ID가 같고 ps를 실행한 터미널과 같은 터미널에 딸린 프로세스를 고르고, PID·TTY(터미널)·TIME(누적 CPU 시간)·CMD(실행 파일 이름)를 보이며 정렬하지 않는다 — DESCRIPTION.
  `-e`(`-A`와 같다)는 모든 프로세스를 고른다 — SIMPLE PROCESS SELECTION. `-f`는 전체 꼴(full-format)로 칸을 더하고 명령의 인자까지 보이며 `-o uid,pid,ppid,c,stime,tty,time,cmd`와 같다 — OUTPUT FORMAT CONTROL.
  예시 절은 시스템의 모든 프로세스를 보는 표준 꼴로 `ps -e`·`ps -ef`를, BSD 꼴로 `ps ax`·`ps axu`를 든다 — EXAMPLES.
  BSD 꼴 `a`는 「자기 것만」 제한을 풀어 터미널이 있는 프로세스를 모두, `x`는 「터미널이 있어야 한다」 제한을 풀어 터미널 없는 것까지 고르고, 둘을 함께 쓰면 모든 프로세스다 — SIMPLE PROCESS SELECTION.
  `u`는 사용자 중심 꼴(`-o user,pid,pcpu,pmem,…`)이고 — OUTPUT FORMAT CONTROL, `f`는 프로세스 나무를 글자 그림(forest)으로 보인다 — OUTPUT MODIFIERS. 곧 `ps afx`는 모든 프로세스를 나무 꼴로, `ps aux`는 모든 프로세스를 사용자 중심 꼴로 보인다(위 정의를 이은 것)
- **ps(1)의 칸**(STANDARD FORMAT SPECIFIERS): `pid`(헤더 PID) 프로세스 ID, `ppid`(PPID) 부모 프로세스 ID, `c`(C) 프로세서 사용률 — 지금은 프로세스가 산 동안의 사용률을 정수 백분율로, `stime`(STIME) 시작 시각 — 같은 날 시작했으면 `HH:MM`, 아니면 월과 날이나 해,
  `tty`(헤더 TT) 제어 터미널, `time`(TIME) 누적 CPU 시간 `[DD-]HH:MM:SS`, `cmd`(CMD) 명령과 인자 전부, `uid`(UID) 실효 사용자 ID.
  **이 표는 터미널 칸의 헤더를 `TT`로 적지만 POSIX `ps`는 `-f`의 헤더를 `TTY`로 적는다**(아래 「(phase 76) POSIX.1-2024」 항목). 본문이 칸 이름을 보일 때는 POSIX의 `-f` 헤더 여덟(UID PID PPID C STIME TTY TIME CMD)을 쓰고, 출력 줄의 값은 예시 값이라고 밝힌다.
  **`ps -ef`의 출력 예는 이 페이지에 없다.** `ps … | grep 이름`의 결과에 `grep` 자기 줄이 끼는지는 이 페이지에도 POSIX `ps`·grep(1)에도 없다 — 쓰지 않는다
- **top(1)**: 실행 중인 시스템을 실시간으로 계속 보여 주는(dynamic real-time view) 프로그램이고, 시스템 요약 정보와 커널이 관리하는 프로세스(또는 스레드)의 목록을 보인다 — DESCRIPTION.
  화면은 위쪽 요약 영역, 칸 이름 줄, 아래 작업 영역으로 이뤄지고, 가장 중요한 키는 도움말(`h`·`?`)과 끝내기(`q`)다 — OVERVIEW 「Operation」.
  요약 영역 — 첫 줄은 지금 시각과 마지막 부팅 뒤 흐른 시간·사용자 수·1·5·15분 평균 부하, 다음 줄들은 작업(프로세스) 수를 상태별로 나눈 것과 CPU 상태 백분율, 그 아래 두 줄은 메모리다 — 2a·2b·2c.
  메모리 첫 줄은 물리 메모리(total·free·used·buff/cache, used = MemTotal − MemAvailable), 둘째 줄은 스왑(total·free·used·avail, used = SwapTotal − SwapFree)이다. **이 판은 둘째 줄을 「대부분 가상 메모리」를 나타내는 줄이라 부른다** — 2c. MEMORY Usage.
  그러나 같은 페이지는 메모리를 물리 메모리·(있으면) 스왑 파일·가상 메모리 셋으로 나누고, 가상 메모리를 물리 주소에서 떨어진 추상화·프로세스마다 따로 된 주소 공간 같은 것으로 설명한다 — OVERVIEW 「Linux Memory Types」(`exam-notes.md` E24).
  작업 영역의 칸(3a): PID(프로세스 ID), USER(실효 사용자 이름), PR(스케줄링 우선순위), NI(나이스 값 — 음수면 우선순위가 높고 양수면 낮다), %CPU(지난 화면 갱신 뒤 쓴 CPU 시간의 몫), %MEM(물리 메모리 가운데 차지한 몫), TIME+(CPU 시간, 1/100초까지), COMMAND(명령 줄이나 프로그램 이름).
  **어느 칸이든 정렬 칸으로 고를 수 있고** 큰 것부터·작은 것부터도 고를 수 있다 — 3a, 4c 「SORTING of task window」(옛 키 `P`는 %CPU, `M`은 %MEM, `N`은 PID, `T`는 TIME+로 정렬한다).
  **처음 정렬 칸이 무엇인지(기본값)는 이 판에 적혀 있지 않다.** 화면을 다시 그리는 간격은 `-d`로 정하고 실행 중에는 `d`·`s`로 바꾼다 — 1 `-d`, 4a. **간격의 기본값도 이 판에 적혀 있지 않다**(설정 파일 예에 `5.0`이 보이지만 예일 뿐이다 — 6).
  `-b`는 배치 모드다 — 다른 프로그램이나 파일로 출력을 보낼 때 쓰고, 입력을 받지 않으며 `-n`으로 정한 횟수만큼 그린다 — 1
- **kill(1)**(procps-ng판): 하나 이상의 프로세스에 PID(나 프로세스 그룹 ID)로 시그널을 보낸다. 기본 시그널은 TERM이다. 시그널은 번호·이름·「SIG」를 붙인 이름으로 줄 수 있어 `-9`·`-SIGKILL`·`-KILL`이 같다 — DESCRIPTION.
  `kill 123 543`은 두 프로세스에 기본 시그널 SIGTERM을 보낸다 — EXAMPLES. 셸에 같은 이름의 내장 kill이 흔히 있다 — NOTES. (man7.org의 기본 `kill(1)` 페이지는 util-linux판이다 — 아래 항목)

쓰인 곳: (phase 76에서 쓰일 곳) `linux-process-boot.ps-command`(ps(1) — 옵션 없는 범위, `-e`, `-f`와 칸, BSD 꼴 `a`·`x`·`u`·`f`, ps와 top의 차이), `linux-process-boot.top-command`(top(1) — 실시간으로 다시 그린다, 요약·작업 영역과 칸, 정렬 칸은 고른다, `q`, `-d`),
`linux-process-boot.process-commands`(kill(1) — 기본 TERM, `-9`), `linux-process-boot.free-command`(top(1) 2c — 스왑 used), `exam-notes.md` E24

## (phase 76) util-linux — kill(1), renice(1), dmesg(1), last(1)·lastb(1)
https://man7.org/linux/man-pages/man1/kill.1.html
https://man7.org/linux/man-pages/man1/renice.1.html
https://man7.org/linux/man-pages/man1/dmesg.1.html
https://man7.org/linux/man-pages/man1/last.1@@util-linux.html

2026-11-04에 읽은 판: util-linux 2.43 개발판(2.43.devel-739-eee2e, 2026-05-24). man7.org의 기본 `kill(1)` 페이지가 이 util-linux판이다. 기본 `last(1)` 페이지는 GNU acct(psacct)판이라, `lastb`를 함께 싣는 util-linux판(`last.1@@util-linux`)을 따로 읽었다.

- **kill(1)**(util-linux판): 이름은 「프로세스를 끝낸다」이고, 정한 시그널을 정한 프로세스(나 프로세스 그룹)에 보낸다 — NAME, DESCRIPTION. 시그널을 주지 않으면 TERM을 보내고, TERM의 기본 동작은 프로세스를 끝내는 것이다.
  프로세스가 TERM을 받으면 정리를 한 뒤 차분히 끝낼 수 있으므로 KILL(9번)보다 TERM을 먼저 쓰라고 하고, **TERM을 보낸 뒤에도 끝나지 않으면 KILL을 쓸 수 있다 — KILL은 붙잡을 수 없어 정리할 기회를 주지 않는다** — DESCRIPTION.
  PID 자리의 양수 n은 PID가 n인 프로세스를 가리킨다 — ARGUMENTS. 대부분의 셸에 쓰임이 비슷한 내장 kill이 있다 — DESCRIPTION
- **renice(1)**: 이름은 「실행 중인 프로세스의 우선순위를 바꾼다」이고, 실행 중인 프로세스 하나 이상의 스케줄링 우선순위(나이스 값)를 바꾼다. 인자는 기본으로 PID로 읽고, `-g`는 프로세스 그룹, `-u`는 사용자다 — NAME, DESCRIPTION.
  슈퍼유저가 아니면 자기 프로세스만 바꿀 수 있고 나이스 값을 올리기만(덜 급하게) 할 수 있다(Linux 2.6.12부터 nice 자원 한도가 알맞으면 예외). 슈퍼유저는 어느 프로세스든 -20~19 안의 값으로 바꾼다 — NOTES.
  (phase 76 step 2, 2026-11-05에 다시 읽음) 첫 인자는 쓸 나이스 값이고 **기본으로 그 값 자체(절댓값)로 읽는다** — `--relative`를 주거나 환경 변수 POSIXLY_CORRECT가 있을 때 `-n`을 주면 지금 값에 더할 수로 읽는다 — SYNOPSIS, DESCRIPTION, OPTIONS.
  그래서 `renice 10 2310`은 PID 2310의 나이스 값을 10으로 정한다(POSIX `renice`의 `-n`은 늘 더할 수다 — 아래 「(phase 76) POSIX.1-2024」 항목. 본문은 util-linux판을 따른다)
- **dmesg(1)**: 이름은 「커널 링 버퍼를 출력하거나 다룬다」이고, 기본 동작은 커널 링 버퍼의 메시지를 모두 보여 주는 것이다 — NAME, DESCRIPTION. 커널 3.5.0부터는 기본으로 `/dev/kmsg`에서 읽는다 — `-S`.
  **`/var/log/dmesg`라는 파일은 이 페이지에 없다** — `exam-notes.md` E25.
  (phase 76 step 7, 2026-11-05에 다시 읽음 — util-linux 2.43.devel-739-eee2e, 2026-05-24) `-l`(`--level`)은 출력을 쉼표로 늘어놓은 수준의 메시지로 좁히고, 예로 `dmesg --level=err,warn`을 든다(`err`는 오류, `warn`은 경고 — 수준 이름) — OPTIONS.
  출력 줄의 꼴은 이 step에서 본문에 보이지 않는다(시각 표시 꼴은 `--time-format` 등 옵션에 따라 다르다 — OPTIONS)
- **last(1)·lastb(1)**(util-linux판): `lastb`는 `last`와 같되 기본으로 실패한 로그인 시도를 모두 담은 `/var/log/btmp`를 보여 준다 — DESCRIPTION, FILES. (로그인 기록의 나머지는 `linux-accounts`의 몫이라 step 9가 다시 읽는다)
- (phase 76 step 9) **last(1)·lastb(1)**(util-linux판) — 2026-11-05에 다시 읽음(2.43.devel-739-eee2e, 2026-05-24): 꼴은 `last [옵션] [사용자이름|tty]...`, `lastb [옵션] [사용자이름|tty]...` — SYNOPSIS.
  `last`는 /var/log/wtmp(나 `-f`로 준 파일)를 **거슬러 훑어(searches back)** 그 파일이 생긴 뒤 로그인(과 로그아웃)한 사용자를 모두 늘어놓는다. 사용자 이름이나 터미널 이름을 주면 그에 맞는 기록만 보인다.
  시스템이 다시 시작할 때마다 가짜 사용자 `reboot`가 로그인한 것으로 남으므로 `last reboot`는 다시 시작한 기록을 보인다 — DESCRIPTION.
  `lastb`는 `last`와 같되 기본으로 **실패한 로그인 시도를 모두 담은 /var/log/btmp**를 보인다 — DESCRIPTION. `-n 수`는 보일 기록의 수를 정한다 — OPTIONS.
  wtmp·btmp는 없을 수 있고, 시스템은 그 파일이 있을 때만 기록을 남긴다(지역 설정의 문제다) — NOTES.
  **출력의 칸(꼴)은 이 페이지에 없다.** 차례도 「거슬러 훑는다」까지만 있고 「최근 기록부터 출력한다」고 적은 문장은 없다.
  **btmp를 누가 읽을 수 있는지는 이 페이지에서도, utmp(5)·login(1)·su(1)에서도 찾지 못했다.** btmp에 누가 쓰는지는 util-linux su(1)이 실패한 로그인 시도를 늘 btmp에 남긴다는 것만 확인했다(아래 「(phase 76 step 9) util-linux」 항목).
  man7.org의 `man1/lastb.1.html`과 `lastb.1@@util-linux.html`은 둘 다 GNU acct(psacct 6.6.4)의 `last(1)` 페이지를 보여 주고 그 페이지에는 `lastb`가 없다 — 그래서 `last.1@@util-linux`만 근거로 쓴다

쓰인 곳: (phase 76에서 쓰일 곳) `linux-process-boot.process-commands`(kill(1) — 기본 TERM, TERM 다음 KILL, KILL은 붙잡을 수 없다; renice(1) — 실행 중인 프로세스의 나이스 값), `linux-process-boot.dmesg`(dmesg(1) — 커널 링 버퍼를 보여 준다; last(1) — `/var/log/btmp`는 실패한 로그인 기록), `exam-notes.md` E25
(phase 76 step 9에서 쓰일 곳) `linux-accounts.login-records`(last(1) — `last`는 wtmp, `lastb`는 btmp, `reboot` 기록, 파일이 있을 때만 기록), `exam-notes.md`의 「phase 76 step 9」 문단

## (phase 76) GNU coreutils — nice(1), df(1); psmisc — pstree(1)
https://man7.org/linux/man-pages/man1/nice.1.html
https://man7.org/linux/man-pages/man1/df.1.html
https://man7.org/linux/man-pages/man1/pstree.1.html

2026-11-04에 읽은 판: nice(1)·df(1)은 GNU coreutils 9.11(April 2026, man7.org가 2026-08-03에 coreutils-9.11 타르볼에서 가져옴), pstree(1)은 psmisc(2025-10-21, man7.org가 2026-08-04에 psmisc 저장소에서 가져옴).

- **nice(1)**: 이름은 「스케줄링 우선순위를 바꿔 프로그램을 실행한다」이다. 주어진 명령을 나이스 값을 조정해 실행하고(명령이 없으면 지금 나이스 값을 출력한다), 나이스 값은 -20(그 프로세스에 가장 유리)부터 19(가장 불리)까지다.
  `-n N`은 나이스 값에 N을 더하고 주지 않으면 10을 더한다 — NAME, DESCRIPTION. 셸에 자기 nice가 따로 있을 수 있다 — DESCRIPTION
- **df(1)**: 이름은 「파일 시스템의 공간 사용량을 알린다」이다. 인자로 준 파일이 든 파일 시스템의 남은 공간을 보여 주고, 인자가 없으면 마운트된 모든 파일 시스템의 남은 공간을 보여 준다 — NAME, DESCRIPTION
- **pstree(1)**: 실행 중인 프로세스를 나무 꼴로 보여 준다. PID를 주면 그 프로세스를, 주지 않으면 **init을 뿌리로 하는 나무**를 보인다. 같은 가지가 여럿이면 `4*[getty]`처럼 개수를 붙여 하나로 줄여 보인다 — DESCRIPTION

쓰인 곳: (phase 76에서 쓰일 곳) `linux-process-boot.process-commands`(nice(1) — 나이스 값을 정해 실행, 범위·기본 10; pstree(1) — 나무 꼴), `linux-process-boot.free-command`(df(1) — 파일 시스템의 남은 양), `linux-process-boot.process`(pstree(1) — init을 뿌리로 하는 나무)

## (phase 76) systemd — systemd(1)·init(1), bootup(7), daemon(7), systemctl(1), systemd.unit(5), systemd.service(5), systemd.special(7), runlevel(8), telinit(8), shutdown(8), poweroff(8)·halt(8)·reboot(8), systemd-journald.service(8), journalctl(1)
https://man7.org/linux/man-pages/man1/systemd.1.html
https://man7.org/linux/man-pages/man1/init.1.html
https://man7.org/linux/man-pages/man7/bootup.7.html
https://man7.org/linux/man-pages/man7/daemon.7.html
https://man7.org/linux/man-pages/man1/systemctl.1.html
https://man7.org/linux/man-pages/man5/systemd.unit.5.html
https://man7.org/linux/man-pages/man5/systemd.service.5.html
https://man7.org/linux/man-pages/man7/systemd.special.7.html
https://man7.org/linux/man-pages/man8/runlevel.8.html
https://man7.org/linux/man-pages/man8/telinit.8.html
https://man7.org/linux/man-pages/man8/shutdown.8.html
https://man7.org/linux/man-pages/man8/halt.8.html
https://man7.org/linux/man-pages/man8/systemd-journald.service.8.html
https://man7.org/linux/man-pages/man1/journalctl.1.html

2026-11-04에 읽은 판: systemd 262 개발판(262~devel) — man7.org가 2026-08-04에 systemd 저장소(마지막 커밋 2026-08-03)에서 가져온 것이다. **runlevel(8)·telinit(8)만 258 개발판**(258~devel, 2025-02-02에 가져옴)이다.
init(1)은 systemd(1)과 같은 페이지다(NAME 「systemd, init」). poweroff(8)·halt(8)·reboot(8)은 한 페이지(`halt.8`)다.

- **systemd(1)**: Linux의 시스템·서비스 관리자이고, 부팅 때 첫 프로세스(PID 1)로 실행되면 init 시스템으로서 사용자 공간 서비스를 띄우고 유지한다. 보통 사용자가 직접 부르지 않고 `/sbin/init` 심볼릭 링크로 설치되어 부팅 초기에 시작된다 — DESCRIPTION.
  systemd는 「유닛」이라는 대상 11종 사이의 의존 관계를 다룬다. 서비스 유닛은 데몬과 그것을 이루는 프로세스를 시작하고 관리하고, 타깃 유닛은 유닛을 묶거나 부팅 중의 잘 알려진 맞춤점이 된다 — UNITS.
  유닛의 상태는 active(시작됨 등)·inactive(멈춤 등)·failed(실패) 등이다 — UNITS Table 1. 부팅 때 `default.target`을 켜고, 이것은 보통 `graphical.target`(UI까지 갖춘 부팅)이나 `multi-user.target`(콘솔만 쓰는 부팅, `graphical.target`의 부분집합)의 별칭이다 — UNITS.
  커널 명령줄의 `3`은 `multi-user.target`, `5`는 `graphical.target`, `1`·`single`·`rescue`는 `rescue.target`으로 부팅하는 지름말이고 SysV와 맞추려고 남겨 둔 것이다 — KERNEL COMMAND LINE.
  **`init`이라는 이름에 실행 레벨 번호를 주어 실행하면 telinit으로 넘긴다는 문장은 이 판에서 찾지 못했다**(SYNOPSIS에 `init [OPTIONS...]`만 있다) — 「`init 6`」은 boot(7)(관리자는 init(1)으로 실행 레벨을 바꾼다)과 telinit(8)(6은 다시 시작)로 쓴다
- **bootup(7)**: 전원을 켜면 시스템 펌웨어가 최소한의 하드웨어 초기화를 하고, 저장 장치에 든 부트 로더(예: systemd-boot·GRUB)에 제어를 넘긴다. 부트 로더는 디스크(나 네트워크)에서 커널을 불러온다.
  EFI 같은 펌웨어를 쓰는 시스템에서는 펌웨어가 커널을 바로 불러올 수도 있다 — DESCRIPTION. 커널은 (필요하면) 메모리 안의 파일 시스템(initramfs)으로 루트 파일 시스템을 찾고, 그것을 찾아 마운트한 뒤 거기 든 시스템 관리자(systemd 등)에게 제어를 넘긴다.
  시스템 관리자는 남은 하드웨어를 살피고 필요한 파일 시스템을 마운트하고 설정된 서비스를 모두 띄운다. 끌 때는 시스템 관리자가 서비스를 모두 멈추고 파일 시스템을 떼어 낸 뒤 마지막으로 전원을 내린다 — DESCRIPTION.
  systemd는 부팅 때 `default.target`이 기대는 유닛을 모두 켠다 — SYSTEM MANAGER BOOTUP. **「UEFI」라는 낱말은 쓰지 않고 「EFI」라고 쓴다**(boot(7)은 「BIOS」라고 쓴다)
- **daemon(7)**: **데몬은 백그라운드에서 실행되며 시스템을 돌보거나 다른 프로세스에 기능을 제공하는 서비스 프로세스다** — DESCRIPTION.
  전통적인 SysV 데몬은 시작할 때 fork()로 백그라운드 프로세스를 만들고, 자식에서 setsid()로 어느 터미널에서든 떨어져 나오며, 다시 fork()한 뒤 첫 자식이 끝나서 실제 데몬 프로세스가 init(PID 1)에게 넘겨지게 한다 — 「SysV Daemons」 5~8단계(새 방식 데몬은 이 단계가 필요 없다).
  옛 방식 데몬은 대개 부팅 때(그리고 관리자가 손으로) 켜졌고, 새 방식 init 시스템은 부팅 중에도 실행 중에도 여러 방법(장치가 꽂힐 때, 요청이 올 때 등)으로 서비스를 켠다.
  systemd에서 서비스를 부팅 때 자동으로 켜려면 `multi-user.target`이나 `graphical.target`의 `.wants/` 디렉터리에 유닛 파일 링크를 둔다 — ACTIVATION 「Activation on Boot」.
  **데몬 이름 끝의 `d`가 daemon을 뜻한다는 관례는 이 페이지에도 boot(7)에도 없다**(예로 든 `bluetoothd`와 sshd(8)·cron(8)의 `sshd`·`crond`가 그렇게 끝날 뿐이다) — 쓰지 않는다
- **systemctl(1)**: systemd 시스템·서비스 관리자의 상태를 살피고 다루는 명령이다 — DESCRIPTION. 명령(COMMANDS):
  `start` — 유닛을 시작(활성화)한다. `stop` — 유닛을 멈춘다(비활성화). `restart` — 멈췄다가 다시 시작하고, 실행 중이 아니었으면 시작한다.
  `status` — 유닛의 실행 중 상태와 저널의 최근 로그를 사람이 읽는 꼴로 보인다(지금 상태만 보여 준다).
  `enable` — 유닛 파일의 [Install] 절에 적힌 대로 심볼릭 링크를 만들어 유닛을 걸어 두고, **유닛을 시작하지는 않는다 — 시작도 하려면 `--now`를 붙이거나 따로 `start`한다**.
  `disable` — 링크를 지워 `enable`을 되돌리고, **유닛을 멈추지는 않는다**(멈추려면 `--now`나 `stop`).
  **켜 두기(enable)와 시작(start)은 서로 따로다** — 켜 두기만 하고 시작하지 않을 수도, 시작만 하고 켜 두지 않을 수도 있다. 켜 두기는 유닛을 부팅 때 같은 자리에 걸어 두어 자동으로 켜지게 하는 일이고, 시작은 실제로 데몬 프로세스를 띄우는 일이다 — `enable`.
  `--now`는 `enable`·`disable` 등과 함께 쓰면 그 뒤에 유닛을 시작하거나 멈춘다 — OPTIONS. 유닛 이름의 접미사를 빼면 `.service`를 붙여 읽으므로 `systemctl start sshd`와 `systemctl start sshd.service`가 같다 — 「Parameter Syntax」.
  `halt` — 끈 뒤 운영체제 커널을 멈추기만 하고 **하드웨어 전원은 켜 둔다** — 전원까지 끄려면 `systemctl poweroff`. `poweroff` — 끄고 전원을 내린다. `reboot` — 끄고 다시 시작한다 — 각 명령.
  `status`의 출력 예(Example 1, `systemctl status bluetooth`)는 첫 줄에 상태 표시와 유닛 이름·설명, 그 아래 `Loaded:`(불러왔는지, 유닛 파일 경로, `enabled` 같은 켜 둠 상태)·`Active:`(`active (running)`과 시작 시각)·`Main PID:` 같은 줄, 끝에 최근 로그 줄을 보인다.
  `Active:` 값은 보통 `active`·`inactive`이고 실패하면 `failed`다. 켜 둔 유닛은 부팅 때 같은 때에 시작된다 — `status`. **명령 목록에 `passwd`는 없다**
- **systemd.unit(5)**: 유닛 파일은 서비스·소켓·장치·마운트 지점·스왑·시작 타깃·타이머 같은, systemd가 관리하는 대상 하나의 정보를 담은 글 파일이다. 유닛 이름은 이름 앞부분과, 점으로 시작하는 종류 접미사(`.service`·`.socket`·`.target`·`.mount`·`.timer` 등)로 이뤄진다 — DESCRIPTION
- **systemd.service(5)**: 이름이 `.service`로 끝나는 유닛 설정 파일은 systemd가 띄우고 지켜보는 프로세스의 정보를 담는다 — DESCRIPTION
- **systemd.special(7)**: `default.target` — 부팅 때 systemd가 켜는 기본 유닛, 보통 `multi-user.target`이나 `graphical.target`의 별칭. `graphical.target` — 그래픽 로그인 화면을 세우는 타깃이고 `multi-user.target`을 끌어온다.
  `multi-user.target` — 그래픽이 없는 다중 사용자 시스템을 세우는 타깃. `rescue.target` — 기본 시스템(시스템 마운트 포함)을 끌어오고 복구 셸을 띄우며, 파일 시스템은 모두 마운트되지만 가장 기본적인 것 말고는 서비스가 실행되지 않는 **단일 사용자 모드**로 시스템을 관리할 때 쓴다
  (single-user.target이라 볼 수 있다, 커널 명령줄의 `1`이 SysV와 맞추려고 둔 이것의 지름말). `poweroff.target` — 끄고 전원을 내리는 타깃. `reboot.target` — 끄고 다시 시작하는 타깃.
  `halt.target` — 끄고 멈추는 타깃이고, **대개 전원을 내리지 않고 멈추기만 한다는 점에서 `poweroff.target`과 다르다** — 각 유닛
- **runlevel(8)**: 「실행 레벨」은 SysV init이 서비스 묶음을 시작·멈추던 **낡은 방식**이고, systemd는 실행 레벨을 타깃에 짝지어 주는 호환 층과 `runlevel` 같은 명령을 둔다.
  한 번에 한 실행 레벨만 「활성」인 반면 systemd는 타깃 여럿을 함께 켤 수 있어 짝짓기는 어림일 뿐이다. 새 코드에서는 쓰지 말라고 한다 — OVERVIEW.
  짝(Table 1): `0` → `poweroff.target`, `1` → `rescue.target`, `2`·`3`·`4` → `multi-user.target`, `5` → `graphical.target`, `6` → `reboot.target`.
  `runlevel`은 알 수 있으면 앞과 지금의 SysV 실행 레벨을 빈칸 하나로 띄어 출력하고, 알 수 없는 쪽은 `N`으로 찍는다(둘 다 모르면 `unknown`). utmp 데이터베이스(`/run/utmp`)에서 읽는다 — DESCRIPTION, FILES
- **telinit(8)**: SysV 실행 레벨을 바꾸는 명령이고, 실행 레벨이라는 개념이 낡아 요청을 systemd 유닛을 켜는 요청으로 바꿔 처리한다 — DESCRIPTION.
  `0` — 전원을 끈다(`poweroff.target`, `systemctl poweroff`와 같다). `6` — 다시 시작한다(`reboot.target`, `systemctl reboot`와 같다). `2`·`3`·`4`·`5` — 그 실행 레벨로 바꾼다(`runlevel2.target`… 을 켠다).
  `1`·`s`·`S` — 복구 모드(`rescue.target`)로 바꾼다 — OPTIONS. 호환을 위해 남긴 명령이라 더는 쓰지 말라고 한다 — NOTES
- **shutdown(8)**: 꼴은 `shutdown [OPTIONS...] [TIME] [WALL...]`이다 — SYNOPSIS. 기계를 멈추거나(halt) 전원을 끄거나(power off) 다시 시작한다. 첫 인자는 때를 적는 문자열이고 대개 `now`다.
  때는 24시간제 `hh:mm`(그 시각에) 또는 `+m`(지금부터 m분 뒤)이고, `now`는 `+0`(바로)과 같으며, 때를 빼면 `+1`로 본다. 때 뒤에 로그인한 사용자 모두에게 보낼 알림 글을 붙일 수 있다 — DESCRIPTION.
  `-H` 멈추기, `-P` 전원 끄기(기본), `-r` 다시 시작, **`-h`는 `--poweroff`와 같되 이미 멈추기로 정해졌으면 그것을 바꾸지 않는다**(그래서 다른 옵션 없는 `shutdown -h now`는 바로 전원을 끈다), `-c` 예약한 끄기를 취소한다 — OPTIONS
- **poweroff(8)·halt(8)·reboot(8)**: 세 명령이 차례로 기계의 전원을 끄고, 다시 시작하고, 멈춘다 — NAME, DESCRIPTION. `--halt`·`-p`(`--poweroff`)·`--reboot`로 어느 이름으로 불렀든 동작을 바꿀 수 있다 — OPTIONS.
  **많은 SysV 시스템에서 `halt`는 `poweroff`와 같아 전원까지 껐지만, systemd에서 `halt`는 기계를 멈추기만 하고(전원은 켜 둔다) 전원을 끄려면 `poweroff`를 써야 한다** — NOTES
- **systemd-journald.service(8)**: 로그를 모아 저장하는 시스템 서비스이고, 모으는 것 가운데 하나가 kmsg로 받는 **커널 로그 메시지**다. 저장은 `/var/log/journal` 아래(영구)나 `/run/log/journal/` 아래(재부팅하면 사라짐)에 한다 — DESCRIPTION.
  **journalctl(1)**: `-k`(`--dmesg`)는 커널 메시지만 보인다 — OPTIONS. **`/var/log/dmesg`라는 파일은 이 항목의 어느 페이지에도 없다** — `exam-notes.md` E25

쓰인 곳: (phase 76에서 쓰일 곳) `linux-process-boot.process`(systemd(1) — PID 1로 실행되는 init 시스템, `/sbin/init`), `linux-process-boot.daemon`(daemon(7) — 데몬의 정의, init에게 넘겨진다, 부팅 때와 관리자가 손으로·실행 중에도 켠다; systemd(1)),
`linux-process-boot.systemctl`(systemctl(1), systemd.unit(5), systemd.service(5), systemd(1) 유닛 상태), `linux-process-boot.boot-sequence`(bootup(7), systemd(1) `default.target`), `linux-process-boot.runlevel`(runlevel(8), telinit(8), systemd.special(7), systemd(1) KERNEL COMMAND LINE),
`linux-process-boot.shutdown-commands`(shutdown(8), poweroff(8)·halt(8)·reboot(8), telinit(8) `0`·`6`, systemctl(1) `halt`·`poweroff`·`reboot`, systemd.special(7) `halt.target`), `linux-process-boot.dmesg`(systemd-journald.service(8)·journalctl(1) — 커널 메시지를 모은다),
`exam-notes.md` E25·E26

## (phase 76) cronie — cron(8), crontab(5), crontab(1)
https://man7.org/linux/man-pages/man8/cron.8.html
https://man7.org/linux/man-pages/man5/crontab.5.html
https://man7.org/linux/man-pages/man1/crontab.1.html

2026-11-04에 읽은 판: cronie — cron(8) 2013-09-26, crontab(5) 2012-11-22, crontab(1) 2019-10-29. man7.org가 2026-08-03에 cronie 저장소(마지막 커밋 2025-12-05)에서 가져온 것이다.

- **cron(8)**: 이름은 `crond` — 예약된 명령을 실행하는 데몬이다 — NAME. 전통 sysvinit 스크립트로 켜거나, systemd에서는 유닛 파일 `crond.service`가 설치되어 `systemctl start crond.service`로 켠다 — DESCRIPTION.
  `/var/spool/cron`에서 `/etc/passwd`의 계정 이름을 이름으로 한 crontab 파일들을 찾아 메모리에 올리고, `/etc/anacrontab`과 `/etc/cron.d/` 안의 파일도 찾는다. **올려 둔 crontab을 모두 살펴 작업마다 지금 그 분에 실행해야 하는지 본다** — DESCRIPTION.
  명령의 출력은 crontab 주인에게 메일로 보낸다 — DESCRIPTION. crontab이 바뀌었는지는 매분 파일의 고친 시각을 보거나 inotify로 알아차리므로 crontab을 고친 뒤 cron을 다시 켤 필요가 없다. inotify를 쓴다는 것이 `/var/log/cron` 로그에 남는다 — DESCRIPTION.
  살피는 곳: `/etc/crontab`(시스템 crontab, 요즘은 기본으로 비어 있다), `/etc/cron.d/`(시스템 작업), `/var/spool/cron`(crontab 명령으로 만든 사용자 crontab) — DESCRIPTION
- **crontab(5)**: crontab 파일은 cron 데몬에게 「이 날짜 이 시각에 이 명령을 실행하라」를 적어 주는 것이고, **사용자마다 자기 crontab을 둘 수 있으며 그 명령은 그 crontab 주인으로 실행된다** — DESCRIPTION. 빈 줄과 `#`으로 시작하는 줄(주석)은 무시한다 — DESCRIPTION.
  **한 줄은 시간·날짜 칸 다섯, (시스템 crontab이면) 사용자 이름, 명령으로 이뤄진다.** 분·시·월 칸이 지금 시각과 맞고 두 날 칸(일·요일) 가운데 적어도 하나가 맞을 때 실행한다. **cron은 매분 항목을 살핀다** — DESCRIPTION.
  칸과 허용 값: 분 0-59, 시 0-23, 일 1-31, 월 1-12(이름도 됨), 요일 0-7(**0과 7이 일요일**, 이름도 됨). `*`는 처음부터 끝까지, 곧 모든 값이다 — DESCRIPTION.
  하이픈으로 범위(`8-11`은 8·9·10·11시 — 끝값 포함), 쉼표로 목록(`1,2,5,9`·`0-4,8-12`), 범위나 `*` 뒤에 `/숫자`로 건너뛰기(`*/2`는 두 시간마다), 월·요일은 영어 세 글자 이름(`mon,wed,fri`·`jan-mar`)도 된다 — DESCRIPTION.
  여섯째 칸(줄의 나머지)이 실행할 명령이고 `/bin/sh`(또는 SHELL 변수의 셸)가 실행한다 — DESCRIPTION. 일과 요일을 둘 다 제한하면 둘 중 하나만 맞아도 실행한다 — 「Note」.
  예 파일에 `5 0 * * *`(매일 0:05), `15 14 1 * *`(매달 1일 14:15), `0 22 * * 1-5`(평일 22:00), `5 4 * * sun`(일요일 4:05)이 있다 — EXAMPLE CRON FILE.
  `/etc/crontab`과 `/etc/cron.d/`의 작업은 여러 사용자를 위한 시스템 작업이라 시간 칸 뒤에 사용자 이름을 더 적는다 — 「Jobs in /etc/cron.d/」. 파일: `/etc/crontab`(주 시스템 crontab), `/var/spool/cron/`(사용자 crontab), `/etc/cron.d/`(시스템 crontab) — FILES
- **crontab(1)**(cronie판): cron 데몬이 쓰는 표를 설치하고 지우고 보여 주는 프로그램이다. **사용자마다 자기 crontab을 둘 수 있고, 그것은 `/var/spool/` 아래의 파일이지만 직접 고치라고 둔 것이 아니다** — DESCRIPTION. 옵션 — OPTIONS:
  `-u 사용자` — 그 사용자의 crontab을 다룬다(주지 않으면 명령을 실행한 사람 자신의 crontab). `-l` — 지금 crontab을 표준 출력에 보인다. `-r` — **지금 crontab을 지운다**.
  `-e` — VISUAL·EDITOR 환경 변수가 정한 편집기로 지금 crontab을 고치고, 편집기를 닫으면 고친 것이 자동으로 설치된다. `-i` — `-r`을 바꿔 지우기 전에 y/Y 대답을 묻는다.
  `cron.allow`·`cron.deny`로 crontab을 쓸 수 있는 사용자를 정하고 둘 다 없으면 슈퍼유저만 쓸 수 있다 — DESCRIPTION. 고치거나 지우면 앞 crontab의 백업을 `$XDG_CACHE_HOME/crontab/crontab.bak`(그 변수가 없으면 `$HOME/.cache` 아래)에 남긴다 — DESCRIPTION.
  **`-u`를 누가 쓸 수 있는지(root만인지)는 이 페이지에 없다** — 본문은 「다른 사용자의 crontab을 정해 다룬다」까지만 쓴다

쓰인 곳: (phase 76에서 쓰일 곳) `linux-process-boot.cron`(cron(8) — `crond`·매분·`/var/spool/cron`·`/etc/crontab`, crontab(5) — 사용자마다 crontab·주인으로 실행), `linux-process-boot.crontab-fields`(crontab(5) — 칸 다섯과 허용 값·`*`·범위·목록·여섯째 칸),
`linux-process-boot.crontab-command`(crontab(1) — `-e`·`-l`·`-r`·`-u`·`-i`), `linux-process-boot.daemon`(cron(8) — `crond`는 데몬), `linux-process-boot.dmesg`(cron(8) — `/var/log/cron`), `exam-notes.md` E25

## (phase 76) POSIX.1-2024 — Shell and Utilities: ps, kill, nice, renice, crontab
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/ps.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/kill.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/nice.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/renice.html
https://pubs.opengroup.org/onlinepubs/9799919799/utilities/crontab.html

The Open Group Base Specifications Issue 8, IEEE Std 1003.1-2024(2024년판). 2026-11-04에 HTML판을 내려받아 읽었다. man7.org의 `*1p` 사본은 2017년판이라 쓰지 않았다.

- **ps**: 권한이 닿는 프로세스의 정보를 쓴다. 옵션이 없으면 지금 사용자와 실효 사용자 ID가 같고 제어 터미널이 같은 프로세스를 고른다 — DESCRIPTION. `-A`·`-e`는 모든 프로세스, `-f`는 전체 목록 — OPTIONS.
  XSI 시스템의 출력 칸과 그것이 나오는 옵션(STDOUT): UID(`-f`·`-l` — `-f`에서는 로그인 이름으로), PID(언제나 — **이 값을 알면 그 프로세스를 kill할 수 있다**), PPID(`-f`·`-l` — 부모 프로세스 ID), C(`-f`·`-l` — 스케줄링에 쓰는 프로세서 사용률),
  STIME(`-f` — 시작 시각), TTY(언제나 — 제어 터미널), TIME(언제나 — 누적 실행 시간), CMD(언제나 — 명령 이름, `-f`에서는 명령 이름과 인자 전부). 표의 차례에서 `-l`에만 나오는 칸(F·S·PRI·NI·ADDR·SZ·WCHAN)을 빼면
  `-f`의 칸은 UID·PID·PPID·C·STIME·TTY·TIME·CMD 차례다. 칸의 정확한 뜻은 구현이 정한다 — STDOUT
- **kill**: 피연산자의 PID마다 kill() 함수와 같은 동작으로 시그널을 보내고, 시그널을 정하지 않으면 SIGTERM이다 — DESCRIPTION. `-s 이름`, (XSI) `-이름`·`-번호`로 정한다. 번호와 이름의 짝에서 9는 SIGKILL, 15는 SIGTERM이다 — OPTIONS
- **nice**: 유틸리티를 다른 나이스 값으로 실행하라고 요청한다. 옵션이 없으면 지금 프로세스의 나이스 값보다 크거나 같은, 구현이 정한 값으로 실행한다. 권한이 모자라 요청대로 바꿀 수 없으면 나이스 값은 바꾸지 않고(경고를 낼 수 있다) 그 유틸리티는 그대로 실행한다.
  `-n 증가량`은 양수나 음수다 — DESCRIPTION, OPTIONS
- **renice**: 실행 중인 프로세스 하나 이상의 나이스 값을 바꾸라고 요청한다. 기본으로 프로세스 ID로 가리킨다. 바꿀 권한이 없으면 바꾸지 않는다 — DESCRIPTION
- **crontab**: 사용자의 crontab 항목 — 명령과 그것을 실행할 때의 목록 — 을 만들고 바꾸고 고친다. 옵션 `-e`(고치기 — 항목이 없으면 빈 항목을 만들어 고친다, 기본 편집기는 vi), `-l`(실행한 사용자의 crontab 항목을 보인다), `-r`(실행한 사용자의 crontab 항목을 지운다)
  — SYNOPSIS·DESCRIPTION·OPTIONS·ENVIRONMENT VARIABLES. **`-u`·`-i`는 POSIX에 없다**(cronie의 것이다).
  항목은 칸 여섯의 줄이고 칸은 빈칸으로 가른다. 앞 다섯 칸: 분 [0,59], 시 [0,23], 일 [1,31], 월 [1,12], **요일 [0,6](0=일요일)** — **요일 `7`과 이름(`sun`)과 `/숫자` 건너뛰기는 POSIX에 없다**(cronie의 것이다).
  칸은 `*`(모든 값), 수 하나, 하이픈으로 이은 범위(끝값 포함), 쉼표로 이은 목록이다. 일과 요일을 둘 다 적으면 둘 중 하나에 맞는 날이다. 여섯째 칸은 정한 때에 sh가 실행할 문자열이다 — INPUT FILES. `0 0 * * 1`은 월요일에만 실행한다 — EXAMPLES.
  cron.allow·cron.deny는 (XSI) 구현이 정한 디렉터리에 두고, 둘 다 없으면 적절한 특권이 있는 프로세스만 작업을 넣을 수 있다 — DESCRIPTION. **cron 데몬과 crontab 파일 자리는 일부러 다루지 않는다** — RATIONALE.
  `crontab`만 입력하면 표준 입력을 기다리고, 그때 파일 끝(보통 Ctrl-D)을 입력하면 crontab 항목이 빈 파일로 바뀐다 — APPLICATION USAGE
- (phase 76 step 9) **id** — https://pubs.opengroup.org/onlinepubs/9799919799/utilities/id.html (같은 2024년판, 2026-11-05에 내려받아 읽음): 사용자를 주지 않으면 실행한 프로세스의 사용자·그룹 ID와 그 이름을 쓰고,
  보조 그룹이 있으면 그것도 쓴다. 사용자(로그인 이름)를 주면, 권한이 있을 때 그 사용자의 ID들을 쓴다 — DESCRIPTION, OPERANDS.
  POSIX 로캘의 기본 출력 꼴은 `uid=번호(이름) gid=번호(이름)`이고, 실효 ID가 실제 ID와 다르면 ` euid=번호(이름)`·` egid=번호(이름)`를, 보조 그룹이 있으면 ` groups=번호(이름),번호(이름)…`를 줄 끝에 붙인다.
  번호를 이름으로 바꿀 수 없으면 괄호와 이름을 뺀다 — STDOUT. `-u`는 실효 사용자 ID만, `-g`는 실효 그룹 ID만, `-G`는 서로 다른 그룹 ID(실효·실제·보조) 모두, `-n`은 번호 대신 이름을, `-r`은 실효 대신 실제 ID를 쓴다 — OPTIONS.
  `groups=` 목록에 기본 그룹(실효 그룹 ID)이 함께 나오는지는 정해져 있지 않다 — getgroups(2)(아래 「(phase 76 step 9) Linux man-pages」 항목)

쓰인 곳: (phase 76에서 쓰일 곳) `linux-process-boot.ps-command`(ps — `-e`·`-f`와 칸 여덟), `linux-process-boot.process-commands`(kill — 기본 SIGTERM·9와 15; nice·renice), `linux-process-boot.crontab-fields`(crontab INPUT FILES — 요일 0~6과 cronie와의 차이),
`linux-process-boot.crontab-command`(crontab `-e`·`-l`·`-r`), `linux-process-boot.cron`
(phase 76 step 9에서 쓰일 곳) `linux-accounts.user-account`(id — 무엇을 어떤 꼴로 보이는가)

## (phase 76) OpenSSH — sshd(8); shadow-utils — lastlog(8)
https://man7.org/linux/man-pages/man8/sshd.8.html
https://man7.org/linux/man-pages/man8/lastlog.8.html

2026-11-04에 읽은 판: sshd(8)은 OpenSSH 9.9p2(바닥줄 September 15, 2024 — man7.org가 2026-08-04에 openssh-9.9p2 타르볼에서 가져옴), lastlog(8)은 shadow-utils 4.19.0(2026-08-04).

- **sshd(8)**: 이름은 「OpenSSH 데몬」이고, ssh(1)를 위한 데몬 프로그램이다. 믿을 수 없는 네트워크를 사이에 둔 두 호스트 사이에 암호화된 안전한 통신을 제공한다. 클라이언트의 연결을 기다리고, 보통 부팅 때 시작되며, 들어오는 연결마다 새 데몬을 fork해 그 연결을 맡긴다 — NAME, DESCRIPTION
- **lastlog(8)**: 마지막 로그인 기록 파일 `/var/log/lastlog`의 내용을 보여 준다 — 사용자마다 로그인 이름·포트·마지막 로그인 시각 — NAME, DESCRIPTION. (`linux-accounts`에서 step 9가 다시 읽는다)
- (phase 76 step 9) **lastlog(8)** — 2026-11-05에 다시 읽음(shadow-utils 4.19.0): 옵션 없이 실행하면 기록을 /etc/passwd에 적힌 차례로 보인다. 한 번도 로그인하지 않은 사용자는 포트·시각 대신 `**Never logged in**`이 나온다.
  `-u`는 정한 사용자(이름·UID·범위)의 기록만 보인다. 지금 시스템에 있는 사용자의 기록만 보인다 — DESCRIPTION, OPTIONS.
  /var/log/lastlog는 사용자마다 마지막 로그인을 담은 데이터베이스이고 sparse 파일이다 — NOTE, FILES. 곧 `last`(로그인·로그아웃이 일어날 때마다 쌓인 기록)와 달리 사용자마다 마지막 한 번만 남는다.
  util-linux login(1)은 /var/log/lastlog가 있으면 지난 로그인 시각을 보여 주고 이번 로그인을 기록한다(아래 「(phase 76 step 9) util-linux」 항목)

쓰인 곳: (phase 76에서 쓰일 곳) `linux-process-boot.daemon`(sshd(8) — 다른 컴퓨터의 접속을 기다리는 데몬, 보통 부팅 때 시작), `linux-process-boot.dmesg`(lastlog(8) — `/var/log/lastlog`는 마지막 로그인 기록), `exam-notes.md` E25
(phase 76 step 9에서 쓰일 곳) `linux-accounts.login-records`(lastlog(8) — 사용자마다 마지막 로그인, 쓸지는 그 step이 정한다)

## (phase 76) GNU GRUB 매뉴얼 2.14 — 1.1 Overview, 1.4 GRUB features, 4.1 Installing GRUB using grub-install, 4.4 BIOS installation, 5.1 How to boot operating systems, 5.1.1, 5.1.3 Chain-loading an OS, 5.4.4 DOS/Windows, 11 GRUB image files
https://www.gnu.org/software/grub/manual/grub/ (매뉴얼의 자리 — 2026-11-04에는 응답하지 않았다)
https://ftp.gnu.org/gnu/grub/grub-2.14.tar.xz (실제로 읽은 것 — 이 공식 배포본 안의 `docs/grub.info`·`docs/grub.info-1`, 원본 `docs/grub.texi`)

매뉴얼이 밝힌 판: GNU GRUB version 2.14, 8 January 2026(「This edition documents version 2.14.」). 2026-11-04에 배포본을 저장소 밖 임시 디렉터리에 내려받아 info 파일의 노드를 읽었다(배포본의 스크립트는 실행하지 않았다). 절 번호는 info 노드의 번호다.

- **부트 로더**는 컴퓨터가 켜질 때 처음 실행되는 소프트웨어이고, 운영체제의 커널(Linux 등)을 불러와 제어를 넘기는 일을 맡는다. 커널은 이어서 운영체제의 나머지를 초기화한다 — 1.1
- GNU GRUB은 여러 자유 운영체제를 불러올 수 있고, 독점 운영체제는 **체인 로딩**으로 불러온다. 체인 로딩은 GRUB이 직접 지원하지 않는 운영체제를 **다른 부트 로더를 불러와** 띄우는 방법이고 흔히 DOS나 Windows에 쓴다 — 1.1과 그 각주 1.
  GRUB은 파일 시스템과 커널 실행 파일 꼴을 알아서, 커널이 디스크의 어느 물리 위치에 있는지 기록하지 않고 파일 이름과 드라이브·파티션만으로 커널을 불러온다 — 1.1
- GRUB으로 부팅할 때는 명령줄 화면이나 **메뉴 화면**을 쓴다. 메뉴에서는 화살표 키로 운영체제를 고르고, 메뉴는 미리 만든 설정 파일을 바탕으로 한다 — 1.1. 메뉴는 미리 정한 부팅 명령을 늘어놓고 시간 제한을 둘 수 있다 — 1.4 「Provide a menu interface」
- 운영체제를 부팅하는 방법은 셋이다 — 운영체제를 직접 불러오기, kexec, 다른 부트 로더를 체인 로딩하기. GRUB이 모든 운영체제를 직접 지원하지는 않아 체인 로딩이 필요할 때가 있다 — 5.1.
  GRUB이 직접 불러오는 꼴은 Multiboot이고 편의로 Linux·FreeBSD·NetBSD·OpenBSD도 직접 지원하며, 그 밖의 운영체제는 체인 로딩해야 한다 — 5.1.1, 5.1.3(예: 첫 하드 디스크 첫 파티션의 Windows를 `chainloader +1`로 띄우는 메뉴 항목).
  **GRUB은 DOS·Windows를 직접 부팅하지 못해 체인 로딩해야 한다** — 5.4.4
- **용어 주의**: 이 매뉴얼의 「Multiboot」는 커널을 불러오는 규격의 이름(Multiboot Specification)이다 — 1.4·5.1.1. 한 컴퓨터에 운영체제를 여럿 두고 골라 부팅하는 일(이른바 멀티 부팅)과 다른 말이다.
  본문은 「멀티 부팅」을 메뉴로 운영체제를 고르는 일(1.1)과 체인 로딩(1.1·5.1.3)으로 설명하고, 이 매뉴얼의 Multiboot와 섞지 않는다
- **MBR과의 관계**: PC BIOS 시스템에서 전통적으로 쓰는 파티션 테이블 형식을 MBR 형식이라 한다(주 파티션 넷까지와 논리 파티션) — 4.4. GRUB의 이미지 가운데 PC BIOS 시스템에서 가장 먼저 시작하는 `boot.img`는 MBR이나 파티션의 부트 섹터에 쓰이고,
  크기가 512바이트라 파일 시스템을 읽지 못해 다음 단계(core image)의 첫 섹터를 읽어 그리로 넘어가는 일만 한다 — 11 「boot.img」. Linux에서 `grub-install /dev/sda`는 첫 디스크의 MBR에 GRUB을 설치한다 — 4.1.
  곧 MBR은 디스크 맨 앞의 512바이트 영역(과 그 파티션 테이블 형식)이고, GRUB은 그 자리에 첫 조각을 두기도 하는 부트 로더다 — boot(7) 「OS loader」(위 「(phase 75) Linux man-pages」 항목)와 같은 그림이다

쓰인 곳: (phase 76에서 쓰일 곳) `linux-process-boot.grub`(1.1 — 부트 로더·메뉴·체인 로딩, 5.1·5.1.1·5.1.3·5.4.4 — Linux는 직접, Windows는 체인 로딩, 4.1·4.4·11 — MBR과 boot.img), `linux-process-boot.boot-sequence`(1.1 — 부트 로더가 커널을 불러와 넘긴다)

## (phase 76 step 9) shadow-utils — useradd(8), groupadd(8), usermod(8), userdel(8), passwd(1), chage(1), passwd(5), login.defs(5), pwconv(8), vipw(8), newgrp(1)
https://man7.org/linux/man-pages/man8/useradd.8.html
https://man7.org/linux/man-pages/man8/groupadd.8.html
https://man7.org/linux/man-pages/man8/usermod.8.html
https://man7.org/linux/man-pages/man8/userdel.8.html
https://man7.org/linux/man-pages/man1/passwd.1.html
https://man7.org/linux/man-pages/man1/chage.1.html
https://man7.org/linux/man-pages/man5/passwd.5@@shadow-utils.html
https://man7.org/linux/man-pages/man5/login.defs.5.html
https://man7.org/linux/man-pages/man8/pwconv.8.html
https://man7.org/linux/man-pages/man8/vipw.8.html
https://man7.org/linux/man-pages/man1/newgrp.1.html

2026-11-05에 읽은 판: shadow-utils 4.19.0(바닥줄 08/04/2026 — man7.org가 2026-08-04에 shadow-4.19.0 타르볼에서 가져왔다). man7.org의 기본 `useradd(8)`·`passwd(1)` 주소는 `@@shadow-utils` 주소와 내용이 같다.
**passwd(5)는 두 페이지다** — 기본 `passwd.5`는 Linux man-pages판(위 「(phase 75) Linux man-pages」 항목)이고, `passwd.5@@shadow-utils`가 이 판이다. 칸 일곱의 차례와 `x`·`!`·`*`·빈 셸 칸의 뜻에서 둘이 다르게 말하는 곳은 찾지 못했다.
**`adduser`는 허용한 출처에 없다** — man7.org의 `man8/adduser.8.html`이 없고(404), 이 항목의 어느 페이지도 `adduser`를 말하지 않는다(2026-11-05).

- **passwd(5)**(shadow-utils판): 한 줄에 계정 하나, 콜론으로 나눈 칸 일곱 — 로그인 이름, (없어도 되는) 암호화된 암호, 숫자 사용자 ID, 숫자 그룹 ID, 사용자 이름이나 설명 칸, 홈 디렉터리, (없어도 되는) 명령 해석기.
  **암호 칸이 소문자 `x`이면 암호화된 암호는 실제로 shadow(5) 파일 쪽에 들어 있다**는 뜻이고, 그때 /etc/shadow에 같은 계정의 줄이 없으면 그 계정은 쓸 수 없다. 암호 칸이 `!`로 시작하면 잠긴 암호다.
  홈 디렉터리 칸은 처음 작업 디렉터리이고 login 프로그램이 HOME을 정하는 데 쓴다. 명령 해석기 칸(로그인 셸)이 비면 `/bin/sh`다 — DESCRIPTION
- **pwconv(8)**: `pwconv`는 passwd(와, 있으면 기존 shadow)로 shadow를 만든다. 하는 차례는 이렇다 — shadow에만 있고 passwd에 없는 줄을 지우고, passwd의 암호 칸이 `x`가 아닌 계정의 shadow 줄을 고쳐 쓰고, 빠진 shadow 줄을 더한 뒤,
  **passwd의 암호 칸을 모두 `x`로 바꾼다**. 처음 바꿀 때뿐 아니라 passwd를 손으로 고친 뒤 shadow를 맞출 때도 쓴다. 새 shadow 줄의 기간 칸은 login.defs의 PASS_MIN_DAYS·PASS_MAX_DAYS·PASS_WARN_AGE로 채운다.
  `pwunconv`는 거꾸로 암호를 passwd로 되돌리고 shadow를 지운다 — DESCRIPTION. 곧 passwd의 `x`는 「암호는 여기 없고 /etc/shadow에 있다」는 자리 표시다
- **useradd(8)**: 꼴은 `useradd [옵션] LOGIN` — **옵션들 뒤, 맨 끝에 새 계정의 이름**이 온다 — SYNOPSIS. `-D` 없이 실행하면 명령줄의 값과 시스템의 기본값으로 새 사용자 계정을 만든다.
  옵션에 따라 시스템 파일을 고치고, 새 사용자의 홈 디렉터리를 만들어 처음 파일을 복사할 수도 있다 — DESCRIPTION. 고치는 파일은 FILES에 적힌 /etc/passwd·/etc/shadow·/etc/group·/etc/gshadow다(기본값은 /etc/default/useradd, 처음 파일은 /etc/skel/에 둔다) — FILES.
  - `-m`: 홈 디렉터리가 없으면 만들고 skel 디렉터리의 파일을 복사한다. 이 옵션이 없고 login.defs의 CREATE_HOME도 켜져 있지 않으면 홈 디렉터리를 만들지 않는다
  - `-d 경로`: 새 사용자의 로그인 디렉터리(홈 디렉터리 칸)의 값. 주지 않으면 기준 디렉터리(기본 /home)에 계정 이름을 붙인 경로다. `-d`만으로는 그 디렉터리를 만들지 않는다
  - `-s 셸`: 로그인 셸의 경로. 주지 않으면 /etc/default/useradd의 SHELL 값을 쓰고, 그것도 없으면 /etc/passwd의 셸 칸을 비워 둔다(passwd(5) — 빈 칸은 `/bin/sh`)
  - `-g 그룹`: **기본 그룹**(primary group)의 이름이나 번호. **그 그룹이 이미 있어야 한다**. 주지 않으면 login.defs의 USERGROUPS_ENAB(나 `-U`·`-N`)에 따라 갈린다 —
    켜져 있으면 계정 이름과 같은 이름의 그룹을 새로 만들어 그 계정을 넣고, 꺼져 있으면 /etc/default/useradd의 GROUP 값(없으면 1000)을 기본 그룹으로 삼는다
  - `-G 그룹1,그룹2`: 새 사용자가 함께 드는 **보조 그룹**(supplementary groups)의 목록. 그룹 사이는 쉼표로 가르고 빈칸을 두지 않는다. `-g`의 그룹과 같은 제약(이미 있어야 한다)을 받는다.
    주지 않으면 처음 그룹(기본 그룹)에만 든다
  - `-u 번호`: 사용자 ID. 겹치면 안 되고(`-o`를 주지 않는 한) 0 이상이다. 주지 않으면 UID_MIN 이상이면서 다른 모든 사용자의 UID보다 큰 가장 작은 값을 쓴다
  - `-r`: 시스템 계정을 만든다 — 번호를 UID_MIN~UID_MAX가 아니라 SYS_UID_MIN~SYS_UID_MAX에서 고르고, /etc/shadow에 기간 정보를 두지 않으며, `-m`이 없으면 홈 디렉터리를 만들지 않는다
  - `-p`: 처음 암호(crypt(3)로 암호화한 값). **이 옵션 없이 만든 계정은 잠겨 있고 암호가 없다 — /etc/shadow의 그 칸에 `!` 하나만 있어, 그 계정으로 들어갈 수도, 사용자가 스스로 암호를 정할 수도 없다.**
    명령줄에 이 옵션을 쓰면 프로세스 목록을 보는 사용자에게 그 값이 보이므로 피하라고 한다
  - `-o`의 설명: 사용자 ID는 사용자를 권한·파일 소유 같은 시스템의 동작과 잇는 열쇠라, 같은 UID에 로그인 이름이 둘이면 둘 다 그 계정을 쓰게 된다 — 곧 시스템은 사용자를 이름이 아니라 UID로 가린다
  - CONFIGURATION: login.defs의 UID_MIN·UID_MAX는 useradd가 **일반 사용자**를 만들 때 쓰는 UID 범위(정하지 않았을 때의 기본값 1000·60000), SYS_UID_MIN·SYS_UID_MAX는 **시스템 사용자**의 범위(기본값 101·UID_MIN−1)다.
    그룹도 같다 — GID_MIN·GID_MAX(1000·60000), SYS_GID_MIN·SYS_GID_MAX(101·GID_MIN−1)
  - CAVEATS: 사용자 이름에는 영문 대소문자·숫자·밑줄·대시만 쓰고(끝에 `$`는 된다), 대시로 시작하거나 숫자만으로 된 이름은 안 된다 — 쓸지는 그 step이 정한다
- **groupadd(8)**: 꼴은 `groupadd [옵션] 새그룹`이고, 명령줄의 값과 시스템의 기본값으로 새 그룹 계정을 만들어 시스템 파일에 넣는다 — SYNOPSIS, DESCRIPTION
- **usermod(8)**: 꼴은 `usermod [옵션] LOGIN`이고 계정 파일을 고친다 — SYNOPSIS, DESCRIPTION. `-g`는 새 기본 그룹(이미 있어야 한다)이다.
  `-G`는 보조 그룹 목록인데, **목록에 없는 그룹에 지금 들어 있으면 그 그룹에서 빠진다** — `-a`를 `-G`와 함께 주면 빼지 않고 더하기만 한다. `-L`은 암호 앞에 `!`를 붙여 암호를 잠근다. `-l`은 로그인 이름을 바꾼다 — OPTIONS
- **userdel(8)**: 꼴은 `userdel [옵션] LOGIN`이고 그 사용자 이름을 가리키는 항목을 계정 파일에서 모두 지운다(그 사용자가 있어야 한다). `-r`을 주면 홈 디렉터리와 그 안의 파일, 메일 스풀도 지운다 — DESCRIPTION, OPTIONS
- **passwd(1)**: 꼴은 `passwd [옵션] [LOGIN]`이고 사용자 계정의 암호를 바꾼다. **일반 사용자는 자기 계정의 암호만, 슈퍼유저는 어느 계정의 암호든 바꿀 수 있다**. 계정이나 암호의 유효 기간도 바꿀 수 있다 — DESCRIPTION.
  계정에 비어 있지 않은 암호가 있으면 먼저 지금 암호를 묻는데, 슈퍼유저는 이 단계를 건너뛰어 잊은 암호도 바꿀 수 있다. 기간 정보로 보아 지금 바꿀 수 없으면 거절한다. 새 암호는 두 번 입력해 같아야 하고 복잡도 검사를 받는다 — 「Password Changes」.
  `-l`은 암호 앞에 `!`를 붙여 잠근다 — OPTIONS. 다루는 파일은 /etc/passwd·/etc/shadow — FILES.
  위 useradd(8) `-p`(암호 없이 만든 계정은 `!`로 잠겨 있다)와 이으면, `useradd`로 만든 계정은 슈퍼유저가 `passwd 이름`으로 암호를 정해 준 뒤에야 그 암호로 들어올 수 있다
- **chage(1)**: 꼴은 `chage [옵션] LOGIN`이고 사용자의 **암호 만료 정보**를 바꾼다 — 암호를 바꾸는 사이의 날 수와 마지막으로 바꾼 날을 정하고, 시스템은 이 정보로 사용자가 언제 암호를 바꿔야 하는지 정한다 — SYNOPSIS, DESCRIPTION.
  **chage(1)은 옵션이 shadow(5)의 몇째 칸을 바꾸는지 적지 않는다** — 아래 칸 번호는 두 문서의 정의를 맞춘 것이다(chage는 shadow 파일의 정보만 보이고 다룬다 — NOTE).
  - `-d 날`(`--lastday`): 마지막으로 바꾼 날(셋째 칸). YYYY-MM-DD 꼴이나 1970-01-01부터 센 날 수이고 UTC로 읽는다. 0이면 다음 로그인 때 바꿔야 한다
  - `-m 날 수`(`--mindays`): 암호를 바꾸는 사이의 최소 날 수(넷째 칸 최소 사용 기간). 0이면 언제든 바꿀 수 있다
  - `-M 날 수`(`--maxdays`): 암호가 유효한 최대 날 수(다섯째 칸). **마지막으로 바꾼 날 + 최대 날 수가 오늘보다 작으면**, 그 사용자는 계정을 쓰기 전에 암호를 바꿔야 한다. 이때를 미리 알리는 것이 `-W`다. -1이면 유효 기간을 확인하지 않는다
  - `-W 날 수`(`--warndays`): 암호를 바꿔야 하기 전 며칠 동안 경고하는지(여섯째 칸 경고 기간) — 암호가 만료되기 그 날 수 전부터 곧 만료된다고 알린다
  - `-I 날 수`(`--inactive`, 대문자 I): 암호가 만료된 뒤 계정이 잠기기까지의 비활성 날 수(일곱째 칸). 잠긴 사용자는 관리자에게 연락해야 다시 쓸 수 있다. -1이면 없앤다
  - `-E 날`(`--expiredate`): 계정 만료일(여덟째 칸). YYYY-MM-DD 꼴이나 1970-01-01부터 센 날 수. 만료되면 관리자에게 연락해야 다시 들어올 수 있다. -1이나 빈 값이면 없앤다
  - `-l`(`--list`, 소문자 L): 계정의 기간 정보를 보여 주기만 한다. **그 출력 꼴은 이 페이지에 없다**
  - `-i`(`--iso8601`, 소문자 i): 날짜를 보일 때 YYYY-MM-DD 꼴로 보인다 — 기간을 정하는 옵션이 아니다
  - **대문자 `-L`은 chage(1)의 옵션 목록에 없다**(암호를 잠그는 `-L`은 usermod(8)의 옵션이다)
  - 옵션을 하나도 주지 않으면 칸마다 지금 값을 `[ ]` 안에 보여 주며 새 값을 묻는다(빈 줄을 넣으면 그대로 둔다) — OPTIONS 끝
  - **chage는 root만 쓸 수 있고, 예외로 `-l`은 일반 사용자도 써서 자기 암호나 계정이 언제 만료되는지 볼 수 있다** — NOTE
  - 경계일: `-M`은 「마지막으로 바꾼 날 + 최대 날 수 < 오늘」, `-W`는 「만료되기 그 날 수 전부터」라고만 적는다. 만료일 당일이나 경고가 시작되는 날을 그 기간에 넣는지(하루 차이)는 따로 적혀 있지 않다
- **login.defs(5)**: /etc/login.defs는 shadow 암호 묶음의 **사이트별(그 시스템의) 설정**이고, 줄마다 설정 이름과 값이 빈칸으로 갈려 있다 — DESCRIPTION.
  UID_MIN·UID_MAX(일반 사용자), SYS_UID_MIN·SYS_UID_MAX(시스템 사용자)와 그 기본값은 위 useradd(8) 줄 그대로다. USERGROUPS_ENAB가 yes면 useradd가 기본으로 사용자 이름과 같은 이름의 그룹을 만든다.
  PASS_MAX_DAYS·PASS_MIN_DAYS·PASS_WARN_AGE는 계정을 만들 때만 쓰이고, 바꿔도 이미 있는 계정에는 영향이 없다 — 각 항목.
  곧 「일반 사용자의 UID가 몇부터인가」는 이 파일의 설정이 정하고, 1000은 설정하지 않았을 때 shadow-utils가 쓰는 기본값이다
- **vipw(8)**: /etc/passwd·/etc/group을(`-s`면 /etc/shadow·/etc/gshadow를) 편집기로 고치되, **파일이 깨지지 않게 잠금을 걸고** 고친다 — DESCRIPTION.
  「이 파일들을 손으로 고치지 마라」는 문장은 이 항목의 페이지에서 찾지 못했다 — 쓸 수 있는 것은 「계정을 만들고 고치는 명령(useradd·usermod·userdel·passwd·chage)이 이 파일들을 고친다」와 「손으로 고칠 때는 잠금을 거는 vipw를 쓴다」다
- (phase 76 step 11) **useradd(8)**·**usermod(8)** — 2026-11-05에 다시 읽음(shadow-utils 4.19.0): useradd(8) EXIT VALUES의 `6`은 「지정한 그룹이 없다」이고, `-g`는 그룹 **하나**의 이름이나 번호를 받으며 그 그룹이 이미 있어야 한다 —
  곧 `-g dev,ops`처럼 쉼표로 둘을 주면 `dev,ops`라는 그룹을 찾게 되어 계정을 만들지 못한다. usermod(8)의 NAME은 「modify a user account」(사용자 계정을 고친다)이고 DESCRIPTION은 계정 파일을 고친다고만 한다 —
  새 계정을 만드는 것은 useradd다. 쓰인 곳: `linux-accounts.useradd` 마지막 문단, n167 해설(오답 `useradd -g dev,ops user5`·`usermod -g dev -G ops user5`)
- **newgrp(1)**: 로그인해 있는 동안 지금 그룹 ID를 바꾼다. 그룹을 주지 않으면 /etc/passwd에 적힌 기본 그룹으로 바꾼다 — DESCRIPTION. 쓸지는 그 step이 정한다

쓰인 곳: (phase 76 step 9에서 쓰일 곳) `linux-accounts.user-account`(login.defs(5)·useradd(8) CONFIGURATION — UID 범위는 그 시스템의 설정, useradd(8) `-o` — 시스템은 UID로 사용자를 가린다),
`linux-accounts.etc-passwd`(passwd(5) shadow-utils판·pwconv(8) — `x`의 뜻, vipw(8)), `linux-accounts.etc-shadow`(useradd(8) `-p` — 새 계정의 `!`, usermod(8) `-L`·passwd(1) `-l` — 잠그면 앞에 `!`),
`linux-accounts.useradd`(useradd(8)·groupadd(8)·usermod(8)·userdel(8)·passwd(1)), `linux-accounts.chage`(chage(1)·login.defs(5)), `exam-notes.md`의 「phase 76 step 9」 문단

## (phase 76 step 9) Linux man-pages — group(5), utmp(5), getgroups(2), initgroups(3)
https://man7.org/linux/man-pages/man5/group.5.html
https://man7.org/linux/man-pages/man5/utmp.5.html
https://man7.org/linux/man-pages/man2/getgroups.2.html
https://man7.org/linux/man-pages/man3/initgroups.3.html

2026-11-05에 읽은 판: Linux man-pages 6.19 — group(5) 2025-05-17, utmp(5) 2025-09-21, getgroups(2)·initgroups(3) 2026-02-08.

- **group(5)**: /etc/group은 시스템의 그룹을 정하는 텍스트 파일이고, 한 줄에 그룹 하나가 `group_name:password:GID:user_list` 꼴로 있다 — 그룹 이름, (암호화된) 그룹 암호(비어 있으면 암호가 필요 없다),
  숫자 그룹 ID, 그 그룹에 든 사용자 이름을 쉼표로 늘어놓은 목록 — DESCRIPTION. passwd(5)는 사용자의 기본 그룹 말고 더 든 그룹을 이 파일에 정한다고 한다(위 「(phase 76 step 9)」 passwd(5) 줄).
  **사용자가 자기 기본 그룹 줄의 목록에도 적히는지는 이 페이지에 없다** — 예를 쓸 때 `dev` 줄의 목록에 `user4`가 있다고 단정하지 않는다
- **utmp(5)**: utmp 파일은 지금 누가 시스템을 쓰고 있는지 알게 해 주고, **wtmp 파일은 모든 로그인과 로그아웃을 기록한다**. wtmp는 utmp와 꼴이 같고(utmp 구조체를 이어 놓은 것 — 텍스트가 아니다),
  사용자 이름이 빈 기록은 그 터미널의 로그아웃, 터미널 이름 `~`에 사용자 이름 `shutdown`·`reboot`는 시스템 종료·다시 시작을 뜻한다.
  wtmp는 login(1)·init(1)·일부 getty(8)가 남기는데 이 프로그램들은 파일을 만들지 않아서, 파일을 지우면 기록이 멈춘다 — DESCRIPTION. 파일 자리는 /var/run/utmp와 /var/log/wtmp — FILES.
  파일 꼴은 기계(아키텍처)에 따라 달라 만든 기계에서 처리하라고 한다 — NOTES. **btmp는 이 페이지에 없다**(btmp는 util-linux last(1) — 위 「(phase 76) util-linux」 항목)
- **getgroups(2)**: 부른 프로세스의 보조 그룹 ID를 돌려준다. **실효 그룹 ID가 그 목록에 들어 있는지는 정해져 있지 않다** — DESCRIPTION
- **initgroups(3)**: 그룹 데이터베이스 /etc/group을 읽어 그 사용자가 든 모든 그룹으로 그룹 접근 목록을 채우고, 따로 받은 그룹 하나도 그 목록에 더한다 — DESCRIPTION.
  login(1)이 이 함수를 부른다는 문장은 이 step이 본 페이지에 없다

쓰인 곳: (phase 76 step 9에서 쓰일 곳) `linux-accounts.user-account`(group(5) — /etc/group은 그룹 목록, 보조 그룹은 그 줄의 사용자 목록; getgroups(2) — `id`의 `groups=`에 기본 그룹이 함께 나오는지는 정해져 있지 않다),
`linux-accounts.login-records`(utmp(5) — wtmp는 로그인·로그아웃·다시 시작의 기록이고 텍스트가 아니어서 `last`로 본다)

## (phase 76 step 9) util-linux — login(1), su(1); systemd — sysusers.d(5), systemd-sysusers(8)
https://man7.org/linux/man-pages/man1/login.1.html
https://man7.org/linux/man-pages/man1/su.1.html
https://man7.org/linux/man-pages/man5/sysusers.d.5.html
https://man7.org/linux/man-pages/man8/systemd-sysusers.8.html

2026-11-05에 읽은 판: login(1)·su(1)은 util-linux 2.43 개발판(2.43.devel-739-eee2e, 2026-05-24), sysusers.d(5)·systemd-sysusers(8)은 systemd 262~devel. man7.org의 `man8/login.8.html`은 없다(404).

- **login(1)**: 시스템에 들어올 때 쓰는 프로그램이다. 사용자 이름과 (필요하면) 암호를 묻고, 암호 기간 기능이 켜진 계정이면 이어 가기 전에 새 암호를 정하게 할 수 있다.
  **프로세스의 사용자 ID와 그룹 ID는 /etc/passwd에 적힌 값으로 정한다**(UID가 0인 계정은 기본 그룹 ID만 정하는 예외가 있다). HOME·USER·SHELL 같은 환경 변수도 그 줄의 칸으로 정하고, 그다음 그 사용자의 셸을 시작한다(셸이 정해져 있지 않으면 `/bin/sh`) — DESCRIPTION.
  /var/log/lastlog가 있으면 지난 로그인 시각을 보여 주고 이번 로그인을 기록한다 — DESCRIPTION. 다루는 파일에 /var/run/utmp·/var/log/wtmp·/var/log/lastlog가 있다 — FILES.
  **이어 읽기(세 문서를 이은 것)**: 로그인한 셸의 그룹 ID는 /etc/passwd의 기본 그룹이고(login(1)), 그 셸이 실행한 프로그램은 이 ID를 물려받으며(credentials(7)),
  set-group-ID 비트가 없는 디렉터리에 새로 만든 파일은 만든 프로세스의 실효 그룹 ID를 받는다(inode(7)) — 그래서 그 사용자가 만든 새 파일의 그룹은 보통 기본 그룹이다(newgrp(1)로 그룹 ID를 바꾸면 달라진다)
- **su(1)**: 보안을 위해 실패한 로그인 시도를 늘 btmp 파일에 남긴다(lastlog 파일에는 쓰지 않는다) — SECURITY NOTES
- **sysusers.d(5)**: systemd-sysusers는 이 설정 파일들로 **시스템 사용자와 그룹**을 패키지를 설치할 때나 부팅 때 만든다. 시스템이 아닌 사용자, 곧 일반(「사람」) 사용자를 만드는 데는 쓰지 않는다 — DESCRIPTION.
  `u` 줄로 만든 계정은 로그인할 수 없게 만들어지고, 시스템 사용자는 보통 로그인을 허용하지 않아야 한다 — 「u」 줄
- **systemd-sysusers(8)**: 예로, 패키지 설치 스크립트가 데몬 `radvd`를 위한 사용자 `radvd`(설명 「radvd daemon」)를 만든다 — OPTIONS의 Example 1.
  위 둘을 이으면 「시스템 계정은 사람이 아니라 프로그램(데몬 같은 것)을 위해 패키지를 설치할 때 만들고, 보통 로그인을 막아 둔다」를 쓸 수 있다. 번호의 범위는 login.defs의 SYS_UID_MIN~SYS_UID_MAX다(위 shadow-utils 항목)
- (phase 79 step 9, 2026-11-12에 IPv4로 다시 읽음 — 같은 util-linux 2.43.devel-739-eee2e, 2026-05-24) **su(1)**: 다른 사용자·그룹 ID로 명령을 실행하게 하는 명령이다. 꼴은 `su [옵션] [-] [사용자|UID [인자...]]`이다 — SYNOPSIS.
  사용자를 적지 않으면 root로 대화형 셸을 띄우고, 사용자를 적으면 그 뒤의 인자는 그 사용자의 셸에 넘긴다 — DESCRIPTION. 명령 하나를 실행하게 하려면 `-c 명령`으로 그 명령을 셸에 넘긴다 — OPTIONS `-c`. 인증·계정·세션은 PAM으로 다룬다 — DESCRIPTION.
  곧 **`su` 바로 뒤에 오는 첫 인자는 사용자 이름이지 실행할 명령이 아니다** — 「실행할 명령 앞에 `su`를 붙인다」는 이 꼴이 아니다(`exam-notes.md` 「phase 79 step 9」 문단)

쓰인 곳: (phase 76 step 9에서 쓰일 곳) `linux-accounts.user-account`(login(1) — 로그인 때 UID·GID가 /etc/passwd의 값으로 정해진다, 새 파일의 그룹; sysusers.d(5)·systemd-sysusers(8) — 시스템 계정과 일반 계정),
`linux-accounts.etc-passwd`(login(1) — 셸 칸의 프로그램을 시작한다), `linux-accounts.login-records`(login(1) — wtmp·lastlog에 남긴다; su(1) — 실패한 시도를 btmp에 남긴다)
(phase 79 step 9에서 쓰일 곳) `linux-servers.apache-listen`(su(1) — 꼴과 `-c`, 기출 오답 「명령 앞에 `su`를 붙인다」의 판정), 기출 대조(`exam-notes.md` 「phase 79 step 9」 문단 — [기출 2024-05-19 #41], [기출 2025-11-02 #35])

## (phase 76 step 9) GNU coreutils — id(1), GNU Coreutils 매뉴얼 20.1; GNU Bash — bash(1) HISTORY; procps-ng — pgrep(1)
https://man7.org/linux/man-pages/man1/id.1.html
https://www.gnu.org/software/coreutils/manual/html_node/id-invocation.html
https://man7.org/linux/man-pages/man1/bash.1.html
https://man7.org/linux/man-pages/man1/pgrep.1.html

2026-11-05에 읽은 판: id(1)은 GNU coreutils 9.11(April 2026), 매뉴얼 20.1은 gnu.org의 GNU Coreutils 9.12판(이날 www.gnu.org가 응답했다), bash(1)은 GNU Bash 5.3(2025 April 7 — man7.org가 2026-08-03에 bash 저장소에서 가져옴),
pgrep(1)은 procps-ng(2025-12-29). FTP 전송 기록 `xferlog`는 man7.org에 페이지가 없다(`man5/xferlog.5.html` 404) — 허용한 출처에서 찾지 못했다.

- **id(1)**: 사용자를 주면 그 사용자의, 주지 않으면 지금 프로세스의 사용자·그룹 정보를 보인다. `-u`는 실효 사용자 ID만, `-g`는 실효 그룹 ID만, `-G`는 모든 그룹 ID, `-n`은 (`-u`·`-g`·`-G`와 함께) 번호 대신 이름 — DESCRIPTION.
  옵션 없이 쓰면 「쓸모 있는 정보 묶음」을 보인다고만 하고 꼴은 적지 않는다(꼴은 위 「(phase 76) POSIX.1-2024」 항목의 `id` 줄)
- **GNU Coreutils 매뉴얼 20.1**: 기본으로 실제 사용자 ID, 실제 그룹 ID, (다르면) 실효 사용자·그룹 ID, 보조 그룹 ID를 보이고, 숫자마다 앞에는 무엇인지 알리는 글자를, 뒤에는 괄호 안에 이름을 붙인다.
  프로세스의 기본·보조 그룹은 보통 부모에게서 물려받아 로그인한 뒤로 바뀌지 않으므로, **로그인한 뒤 그룹 데이터베이스를 고쳐도 지금 세션의 `id`에는 나타나지 않는다**. 사용자 이름을 주어 실행하면 데이터베이스를 새로 읽으므로 다른 결과가 나올 수 있다 — 20.1
- **bash(1)** — HISTORY: 셸의 history(명령 기록)는 **그 셸에서 앞서 입력한 명령의 목록**이다. bash는 시작할 때 HISTFILE(기본 `~/.bash_history`)에서 목록을 읽고, 끝날 때 목록을 그 파일에 쓴다. 남기는 수는 HISTSIZE(기본 500) — HISTORY.
  내장 명령 `history`는 옵션 없이 쓰면 그 목록을 번호와 함께 보인다 — SHELL BUILTIN COMMANDS(`history`). 곧 `history`는 로그인 시도의 기록이 아니다
- **pgrep(1)**: `pkill`은 이름 같은 조건에 맞는 프로세스마다 시그널(기본 SIGTERM)을 보낸다 — NAME, DESCRIPTION. 로그인 기록과 관계가 없다

쓰인 곳: (phase 76 step 9에서 쓰일 곳) `linux-accounts.user-account`(id(1)·매뉴얼 20.1 — `id`가 보이는 것, 로그인한 뒤 바꾼 그룹은 지금 세션에 바로 나타나지 않는다), `linux-accounts.login-records`(bash(1) — `history`는 셸 명령의 목록),
`exam-notes.md`의 「phase 76 step 9」 문단(bash(1)·pgrep(1) — 기출 오답 `history`·`pkill`, `xferlog`는 출처에 없다)

## (phase 77) RFC 6335 — Internet Assigned Numbers Authority (IANA) Procedures for the Management of the Service Name and Transport Protocol Port Number Registry
https://www.rfc-editor.org/rfc/rfc6335

BCP 165(Best Current Practice)이고 폐기되지 않았다(rfc-editor 상태 2026-11-09). IANA가 포트 번호 레지스트리를 어떻게 다루는지 정한 문서다.

- 포트는 두 가지 일을 한다 — 같은 두 끝점 사이의 서로 다른 전송 세션을 가려내는 식별자이고, 프로세스가 이어 붙는 응용 프로토콜과 서비스를 가리키기도 한다. 포트 번호는 16비트다.
  출발지 포트·목적지 포트와 통신하는 두 끝 시스템의 IP 주소를 함께 보면 한 전송 프로토콜의 세션 하나가 하나로 정해진다 — §3
- 많은 서비스는 서버가 보통 기다리는 **기본(default) 포트**를 갖고, IANA가 그 포트를 레지스트리에 적어 둔다. 다만 어느 포트가 어느 서비스인지는 결국 연결의 두 끝 사이에서만 뜻이 있는 그 쪽의 결정이다.
  예로 서비스 이름 `telnet`은 23번, `http`(`www`·`www-http`)는 80번이다. 같은 호스트에서 같은 서비스를 여러 개 띄우면 대개 같은 포트에서 함께 기다릴 수 없다 — §3
- **세 범위**(TCP·UDP·UDP-Lite·SCTP·DCCP가 모두 16비트 포트 번호 공간을 이렇게 나눈다) — §6:
  - System Ports — **Well Known Ports**라고도 한다. 0~1023. IANA가 정해 준다
  - User Ports — **Registered Ports**라고도 한다. 1024~49151. IANA가 정해 준다
  - Dynamic Ports — **Private Ports** 또는 **Ephemeral Ports**라고도 한다. 49152~65535. 누구에게도 정해 주지 않는다
- 정해 줄 수 있는 범위(0~49151)의 번호는 Assigned(정해 줌)·Unassigned(비어 있음)·Reserved(남겨 둠) 가운데 하나다. Reserved는 보통의 신청으로는 받을 수 없는 번호이고,
  범위의 경계에 있는 값(0, 1023, 1024 등)이 여기에 든다 — 나중에 범위를 늘리는 데 쓸 수 있게 남겨 둔 것이다 — §6. **그러니 0번은 어떤 서비스의 포트로도 정해 주지 않는다**
- **범위마다 다른 절차** — §8.1.2:
  - Dynamic Ports는 그 호스트에서 그때그때 쓰라고 떼어 둔 범위라 IANA를 거쳐 정해 받을 수 없다. 응용 프로그램은 등록 없이 비어 있는 동적 포트 아무것이나 쓸 수 있다.
    그러나 특정 번호가 늘 비어 있다고 가정하면 안 되고(MUST NOT), 그래서 이 범위의 번호를 **서비스를 가리키는 번호로 쓰면 안 된다**(MUST NOT)
  - User Ports는 IANA가 정해 줄 수 있고, 정해 받은 뒤에는 서비스를 가리키는 번호로 써도 된다(MAY). 신청할 때 동적 포트로는 왜 안 되는지 밝혀야 한다
  - System Ports도 IANA가 정해 주지만 가장 작고 가장 빽빽한 범위라 조건이 더 엄격하다(IETF 검토나 IESG 승인으로만). 동적 포트로도, User Ports로도 왜 안 되는지 둘 다 밝혀야 한다
- **전송 프로토콜마다 따로 정해 준다** — 이 문서(2011)부터 IANA는 신청서에 적은 전송 프로토콜(TCP·UDP·SCTP·DCCP)에만 번호를 정해 주고, 나머지 전송 프로토콜의 같은 번호는 Reserved로 둔다.
  그 전에는 한 프로토콜만 청해도 TCP와 UDP 둘 다 정해 주던 관행이 오래 있었다. 응용 프로그램은 한 전송 프로토콜로 받은 번호를 다른 전송 프로토콜에서도 쓸 수 있다고 가정하면 안 된다(MUST NOT) — §7.2
- 포트의 쓰임은 끝점 프로세스를 가리키는 것, 응용 프로토콜을 가리키는 것, 방화벽이 걸러 내는 기준이 되는 것이다. 포트 번호는 연결의 두 끝점에게만 뜻이 있어서, 지나가는 흐름의 포트 번호만 보고 무슨 서비스인지 판단하는 것은 늘 믿을 만하지 않다 — §7.2
- FTP처럼 정해 받은 포트 하나로 시작하고, 그다음 주고받기에는 동적 포트를 쓰도록 맞추는 방식도 든다 — §7.2

쓰인 곳: (phase 77에서 쓰일 곳) `ports.port-number`(§3 — 포트는 16비트, 주소와 포트 넷으로 세션이 정해진다, §7.2 — 전송 프로토콜마다 따로), `ports.port-ranges`(§6 — 세 범위와 다른 이름, 0번 Reserved, §8.1.2 — 범위마다 다른 절차, 동적 포트는 서비스 번호로 쓰지 않는다),
`ports.well-known-ports`(§3 — 기본 포트, 결국 두 끝의 결정), `ports.client-server-ports`(§3 — 출발지·목적지 포트와 두 IP 주소), 강의 수정 이력 L43, `exam-notes.md` E27

## (phase 77) RFC 7605 — Recommendations on Using Assigned Transport Port Numbers
https://www.rfc-editor.org/rfc/rfc7605

BCP 165(RFC 6335와 같은 BCP)이고 폐기되지 않았다(rfc-editor 상태 2026-11-09).

- 역사: 처음 정해 주던 포트는 0~255였고, RFC 1340(1992)이 범위를 0~1023으로 늘렸다(RFC 1340은 지금 역사적 문서다). 그때는 한 번 정해 준 번호가 모든 전송 프로토콜에 그대로 적용된다고 여겼다 — §3
- 세 범위의 이름: System(Well-Known이라고도) 0~1023, User(Registered라고도) 1024~49151, Dynamic(Private라고도) 49152~65535. System과 User 둘 다 IANA를 거쳐 정해 주므로 둘을 합쳐 「registered」라 부르는 일도 있어
  「registered」라는 말은 0~49151 전체를 가리키기도 하고 User 범위만 가리키기도 한다 — §4
- System 범위를 「System」이라 부르는 까닭: 몇몇 시스템에서는 이 범위의 포트를 쓰려면 특권(예: root로 실행)이 필요하기 때문이다. User 범위는 특권 없이 쓰는 범위다. 다만 System 포트가 늘 특권을 요구하지는 않는다 — §4, §7.3.
  시스템을 만드는 쪽은 System 포트에서 기다리려는 프로세스에 특권을 요구하는 것이 좋다(SHOULD) — §7.3
- 포트 번호는 16비트이고 쓰임이 둘이다 — 한 호스트 안에서 전송 끝점의 짝(TCP 연결이나 UDP 주고받기 짝)을 가려내는 것과 서비스를 가리키는 것. 앞의 쓰임 때문에, 주어진 두 IP 주소 사이에서 같은 전송 프로토콜을 쓰는 짝은
  저마다 다른 포트 번호 쌍을 써야 한다. 등록이 필요한 것은 뒤의 쓰임 때문이다 — §5
- 웹 서버는 어느 포트에서든 돌 수 있다 — 클라이언트가 그 번호를 알기만 하면 된다. 번호를 알리는 방법의 예로 주소에 포트를 적는 것(`http://www.example.com:51509/`)을 든다. 서비스와 포트 번호의 짝은 결국 두 끝점 사이의 약속이다.
  IANA가 번호를 정해 주는 까닭은 모든 끝점이 그 번호의 기본 뜻에 미리 합의해 두려는 것, 곧 프로토콜이나 서비스마다 **기본 포트 번호**를 주려는 것이다 — §5
- 한 전송 프로토콜에서 어떤 서비스에 정해 준 번호가, 다른 전송 프로토콜에서는 다른 서비스에 정해질 수 있다 — §7.3

쓰인 곳: (phase 77에서 쓰일 곳) `ports.port-number`(§5 — 포트는 16비트, 같은 두 주소 사이의 짝은 다른 포트 쌍, §7.3 — 같은 번호가 전송 프로토콜마다 다른 서비스), `ports.port-ranges`(§4 — 세 범위의 이름, 「registered」의 두 뜻),
`ports.well-known-ports`(§5 — 웹 서버는 어느 포트에서든 돌 수 있고 주소에 포트를 적어 알린다, 기본 포트, §4·§7.3 — System 포트와 특권), `exam-notes.md` E27

## (phase 77) RFC 6056 — Recommendations for Transport-Protocol Port Randomization
https://www.rfc-editor.org/rfc/rfc6056

BCP 156이고 폐기되지 않았다(rfc-editor 상태 2026-11-09).

- 서비스는 보통 서비스를 주는 호스트(서버)의 정해진 잘 알려진 포트에 있다. 클라이언트 응용 프로그램은 서버의 IP 주소와 서비스 포트 번호를 정해 서버에 닿는다.
  클라이언트 쪽의 IP 주소와 포트 번호는 보통 응용 프로그램이 정하지 않고 **클라이언트의 네트워크 스택(운영체제)이 자동으로 고른다**. 이렇게 자동으로 고른 포트를 **임시 포트**(ephemeral port)라 부른다 — §1
- IANA는 TCP·UDP의 16비트 포트 범위를 Well-Known Ports(0~1023), Registered Ports(1024~49151), Dynamic and/or Private Ports(49152~65535)로 나눠 두었고, 동적 포트 범위는 임시 포트를 고르는 데 쓰라는 범위다 — §2.1
- 통신 하나는 다섯 값 {프로토콜, 로컬 IP 주소, 로컬 포트, 원격 IP 주소, 원격 포트}로 가려지므로, 임시 포트는 이 다섯 값 묶음이 겹치지 않게 골라야 한다 — §2.2
- 그러나 임시 포트를 고르는 방법은 49152~65535만이 아니라 **1024~65535 전체**를 쓰는 것이 좋다고 권한다(그 호스트가 서비스에 쓸 등록된 포트는 빼고) — §3.2.
  곧 클라이언트의 임시 포트가 IANA의 동적 포트 범위 안에서만 나온다는 보장은 없고, 실제 범위는 운영체제와 그 설정이 정한다(Linux·Windows의 예는 아래 두 항목)

쓰인 곳: (phase 77에서 쓰일 곳) `ports.client-server-ports`(§1 — 서버는 잘 알려진 포트, 클라이언트 포트는 운영체제가 자동으로 고르는 임시 포트, §2.2 — 다섯 값으로 통신을 가린다, §3.2 — 1024~65535 전체를 권한다), `ports.port-ranges`(§2.1 — 동적 포트는 임시 포트용), 강의 수정 이력 L43

## (phase 77) RFC 959 — File Transfer Protocol (FTP)
https://www.rfc-editor.org/rfc/rfc959

Internet Standard이고 폐기되지 않았다(RFC 765를 대체, RFC 2228 등이 고쳤다 — rfc-editor 상태 2026-11-09). **포트와 두 연결만** 가져온다. FTP의 명령과 전송 방식은 응용 프로토콜 주제(phase 78)의 몫이다.

- FTP는 연결 두 종류를 쓴다 — **제어 연결**(control connection)은 사용자 쪽과 서버 쪽이 명령과 응답을 주고받는 통로이고, **데이터 연결**(data connection)은 파일 같은 데이터를 실제로 옮기는 전이중 연결이다 — §2.2
- 제어 연결은 사용자 프로세스의 포트 U와 서버 프로세스의 포트 L 사이에 **TCP**로 맺고, FTP의 서버 포트는 **21**이다(L = 21) — §8
- 서버의 기본 데이터 포트는 제어 연결 포트 바로 아래 번호(L − 1), 곧 **20**이다. 사용자 쪽의 기본 데이터 포트는 자기 제어 연결 포트와 같다. 전송 요청을 받으면 서버가 데이터 연결을 연다 — §3.2.
  PASV 명령을 쓰면 서버는 기본 데이터 포트가 아닌 다른 데이터 포트에서 연결을 기다린다 — §4.1.2
- (phase 77 step 3) 이 문서는 TCP와 Telnet 프로토콜을 안다고 전제하고 쓰였다 — §1. 데이터를 옮기는 동안 잃거나 뒤섞인 비트를 찾는 장치는 FTP에 없고, **그 수준의 오류 제어는 TCP가 맡는다** — §3.5
- (phase 78 step 0, 2026-11-11 rfc-editor.org 원문 — Internet Standard(STD 9) 그대로, RFC 2228·2640·2773·3659·5797·7151이 고쳤다) **목적과 모델**: FTP는 파일을 함께 쓰게 하고, 원격 컴퓨터를 쓰게 하고, 호스트마다 다른 파일 저장 방식을 사용자에게서 가리고,
  데이터를 믿을 수 있고 효율적으로 옮기려고 만들었다 — §1. 제어 연결은 사용자 쪽이 연다. 명령은 사용자 쪽에서 서버 쪽으로, 응답은 그 명령에 답해 서버 쪽에서 사용자 쪽으로 제어 연결을 따라 간다 — §2.3.
  데이터 연결은 늘 있어야 하는 것은 아니다(그림 1의 주). 데이터를 옮기는 동안에는 제어 연결이 열려 있어야 하고, 다 쓴 뒤 제어 연결을 닫자고 청하는 것은 사용자 쪽, 실제로 닫는 것은 서버다 — §2.3
- (phase 78 step 0) **명령**: `USER`(사용자 이름 — 제어 연결을 맺은 뒤 보통 처음 보내는 명령)·`PASS`(암호 — 바로 앞에 `USER`가 와야 한다)는 접근 제어 명령이다 — §4.1.1.
  `RETR`은 서버가 그 파일의 사본을 데이터 연결로 보내게 하고(서버의 파일은 그대로다), `STOR`는 데이터 연결로 받은 데이터를 서버에 그 이름의 파일로 저장하게 하며(이미 있으면 내용을 바꾸고 없으면 새로 만든다),
  `LIST`는 디렉터리의 파일 목록(이나 파일 하나의 정보)을 데이터 연결로 보내게 한다 — §4.1.3. `QUIT`는 그 사용자의 접속을 끝내고, 전송 중이 아니면 서버가 제어 연결을 닫는다 — §4.1.1
- (phase 78 step 0) **한 번의 대화의 차례**(§7의 예와 §5.4의 명령·응답 짝, 응답의 뜻은 §4.2 — 값은 옮기지 않는다): 제어 연결(서버 21) → 서버 `220`(새 사용자를 받을 준비가 됐다) → `USER` → `331`(이름은 됐고 암호가 필요하다) → `PASS` → `230`(로그인했다)
  → `RETR` → `150`(곧 데이터 연결을 연다) → 데이터 연결로 파일이 간다 → `226`(데이터 연결을 닫는다 — 전송 성공) → `QUIT` → `221`(제어 연결을 닫는다). `PORT`의 성공 응답은 `200`, `PASV`의 성공 응답은 `227`이다 — §5.4
- (phase 78 step 0) **기본 방식에서는 데이터 연결을 전송마다 맺고 닫는다**: 모든 구현이 받아들여야 하는 기본값은 표현 형식 ASCII Non-print, 전송 방식 **스트림**, 파일 구조 **파일**이다 — §5.1.
  스트림 방식에서 파일 구조면 **보내는 쪽이 데이터 연결을 닫아 파일의 끝을 알린다** — §3.4.1. §3.3도 스트림 방식에서는 연결을 닫아 파일 끝을 알려야 한다고 적는다 — 그래서 파일을 여러 개 옮기면 그때마다 새 데이터 연결이 필요하다.
  블록·압축 방식은 연결을 닫지 않고 끝을 알려 데이터 연결을 열어 둔 채 여러 파일을 옮길 수 있다 — §3.3. 서버는 데이터 연결을 닫은 뒤 `226`을 보낸다 — §5.2
- (phase 78 step 0) **누가 데이터 연결을 여는가**: 기본으로는 사용자 쪽이 데이터 포트에서 기다리고(listen), **전송 요청을 받은 서버가 자기 기본 데이터 포트(L − 1 = 20)에서 그 포트로 연결을 연다** — §3.2, §5.2.
  사용자 쪽은 `PORT`로 기본이 아닌 자기 데이터 포트를 알릴 수 있다 — 인자는 32비트 IP 주소와 16비트 TCP 포트를 8비트씩 끊어 십진수로 쉼표로 이은 꼴(`h1,h2,h3,h4,p1,p2`)이다 — §3.3, §4.1.2.
  `PASV`는 서버 쪽에게 기본이 아닌 데이터 포트에서 **연결을 열지 말고 기다리라**고 청하고, 서버의 응답에 기다리는 호스트와 포트가 담긴다(`227 Entering Passive Mode (h1,h2,h3,h4,p1,p2)`) — §4.1.2, §4.2.
  용어: 데이터 전송 프로세스(DTP)는 능동(active)이거나 수동(passive)일 수 있고, 수동 쪽이 데이터 포트에서 기다리고 능동 쪽이 연결을 연다. 서버 쪽 DTP는 보통 능동 상태이고 수동 상태로 둘 수도 있다 — §2.2.
  **「active mode」라는 이름은 이 문서에 없다** — 「Passive Mode」는 `227` 응답 문구에만 나온다(능동·수동 데이터 연결이라는 이름은 아래 「(phase 78 step 0) Microsoft Learn — Configuring FTP Firewall Settings …」 항목)
- (phase 78 step 0) **익명 FTP와 평문 전송은 이 문서에 없다** — 「anonymous」라는 말이 전문에 없다(전문 검색 2026-11-11). 익명 FTP는 아래 RFC 1635, 사용자 이름·암호와 데이터를 암호화하지 않는다는 것은 아래 RFC 2228 §1

쓰인 곳: (phase 77에서 쓰일 곳) `ports.well-known-ports`(§2.2 — 제어 연결과 데이터 연결, §8 — TCP 21은 제어, §3.2 — 기본 데이터 포트 20)
(phase 77 step 3에서 쓰일 곳) `tcp-udp.transport-choice`(§8 — 제어 연결은 TCP, §3.5 — 데이터의 오류 제어를 TCP에 맡긴다), 기출 대조(`exam-notes.md` 「phase 77 step 3」 문단 — FTP는 UDP를 쓰지 않는다)
(phase 77 step 8) `tcp-udp.transport-choice`(§8 — TCP 연결, §3.5 — 데이터를 잃거나 뒤섞지 않았는지 살피는 일을 TCP에 맡긴다), 도식 `transport-choice`, 문항 n187 해설
(phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.ftp`(§1·§2.3 — 목적, 제어 연결과 데이터 연결, §4.1.1·§4.1.3 — `USER`·`PASS`·`RETR`·`STOR`·`LIST`·`QUIT`, §7·§5.4·§4.2 — 대화의 차례, §5.1·§3.4.1·§3.3·§5.2 — 기본 스트림 방식에서는 전송마다 데이터 연결을 맺고 닫는다),
`app-protocols-mail-file.ftp-modes`(§3.2·§5.2 — 기본은 서버가 20번에서 연다, §4.1.2 — `PORT`·`PASV`, §2.2 — 능동·수동 DTP, §4.2 — `227 Entering Passive Mode`), 기출 대조(`exam-notes.md` 「phase 78 step 0」 문단)
(phase 79 step 9) 기출 대조(`exam-notes.md` 「phase 79 step 9」 문단 — [기출 2024-05-19 #44]의 오답 `--dport 21`은 FTP 제어 연결의 포트다, §8)

## (phase 77) RFC 854 — Telnet Protocol Specification
https://www.rfc-editor.org/rfc/rfc854

Internet Standard이고 폐기되지 않았다(RFC 764를 대체, RFC 5198이 고쳤다 — rfc-editor 상태 2026-11-09).

- Telnet은 단말(터미널)과 단말을 다루는 프로세스를 표준 방법으로 서로 잇게 하는, 양방향의 범용 통신 수단이다 — INTRODUCTION. Telnet 연결은 **TCP** 연결이다 — GENERAL CONSIDERATIONS
- Telnet의 TCP 연결은 사용자의 포트 U와 서버의 포트 L 사이에 맺는다. 서버는 자기의 잘 알려진 포트 L에서 연결을 기다린다. TCP 연결은 전이중이고 **포트 쌍으로 가려지므로**,
  서버는 같은 포트 L로 서로 다른 사용자 포트 U들과 **여러 연결을 동시에** 맺을 수 있다. 원격 단말 접속에 쓸 때 서버 포트는 **23**이다(L = 23) — CONNECTION ESTABLISHMENT
- 이 문서 전문에 암호화·기밀성에 관한 말이 없다(전문 검색 2026-11-09 — 「encrypt」·「confidential」 없음). 암호화는 나중에 선택 확장으로 정했다 — 아래 RFC 2946 항목

쓰인 곳: (phase 77에서 쓰일 곳) `ports.well-known-ports`(TCP 23, 원격 단말 접속), `ports.client-server-ports`(CONNECTION ESTABLISHMENT — 서버 포트 하나로 서로 다른 사용자 포트와 여러 연결을 동시에)
(phase 77 step 3) 기출 대조(`exam-notes.md` 「phase 77 step 3」 문단 — Telnet은 TCP를 쓴다, GENERAL CONSIDERATIONS)
(phase 79 step 9에서 쓰일 곳) `linux-servers.iptables`(GENERAL CONSIDERATIONS·CONNECTION ESTABLISHMENT — Telnet은 TCP 23이라 막는 규칙은 `-p tcp --dport 23`), 기출 대조(`exam-notes.md` 「phase 79 step 9」 문단 — [기출 2024-05-19 #44])

## (phase 77) RFC 2946 — Telnet Data Encryption Option, RFC 2941 — Telnet Authentication Option
https://www.rfc-editor.org/rfc/rfc2946
https://www.rfc-editor.org/rfc/rfc2941

둘 다 Proposed Standard이고 폐기되지 않았다(rfc-editor 상태 2026-11-09). **「Telnet은 기본으로 암호화하지 않는다」의 근거로만** 쓴다. 암호화 옵션의 명령과 알고리즘은 가져오지 않는다.

- 암호화 옵션의 기본값은 쓰지 않는 것이다 — 따로 협상하지 않으면 Telnet 데이터 흐름은 암호화되지 않는다 — RFC 2946 §3
- 이 옵션을 만든 까닭: Telnet 프로토콜에는 네트워크를 지나는 IP 패킷을 중간의 게이트웨이가 들여다보는 것을 막는 보호가 없고, 비밀번호도 평문(암호화하지 않은 글자)으로 네트워크를 지나 특히 위험하다 — RFC 2946 §4
- Telnet의 약점 하나는 원격 시스템에 로그인할 때 사용자가 친 비밀번호가 평문으로 네트워크를 지난다는 것이다 — RFC 2941 §4

쓰인 곳: (phase 77에서 쓰일 곳) `ports.well-known-ports`(Telnet은 기본으로 주고받는 내용과 비밀번호를 암호화하지 않는다 — SSH와 가르는 점)

## (phase 77) RFC 4251 — The Secure Shell (SSH) Protocol Architecture, RFC 4253 — The Secure Shell (SSH) Transport Layer Protocol
https://www.rfc-editor.org/rfc/rfc4251
https://www.rfc-editor.org/rfc/rfc4253

둘 다 Proposed Standard이고 폐기되지 않았다(여러 RFC가 고쳤다 — rfc-editor 상태 2026-11-09). **포트와 「암호화한 원격 접속」만** 가져온다. 키 교환·인증 방식은 가져오지 않는다.

- SSH는 안전하지 않은 네트워크 위에서 안전하게 원격 로그인하고 그 밖의 네트워크 서비스를 쓰게 하는 프로토콜이다. 그 전송 계층 프로토콜이 서버 인증, 기밀성(암호화), 무결성을 주고 보통 TCP/IP 연결 위에서 돈다 — RFC 4251 §1
- SSH는 Telnet·rlogin 같은 옛 방식보다 훨씬 높은 보안을 준다 — RFC 4251 §4.1
- SSH 전송 계층은 안전하지 않은 네트워크 위에 **암호화한 안전한 통로**를 만든다 — 서버 호스트 인증, 키 교환, 암호화, 무결성 보호를 한다 — RFC 4253 §14
- TCP/IP 위에서 쓸 때 서버는 보통 포트 **22**에서 연결을 기다리고, 이 번호는 IANA에 SSH용으로 등록돼 있다 — RFC 4253 §4.1
- (phase 78 step 0, 2026-11-11 rfc-editor.org 원문 — 둘 다 Proposed Standard 그대로. RFC 4251은 RFC 8308·9141이, RFC 4253은 RFC 6668·8268·8308·8332·8709·8758·9142가 고쳤다) **세 부분**: SSH는
  전송 계층 프로토콜(서버 인증·기밀성·무결성), 사용자 인증 프로토콜(클라이언트 쪽 사용자를 서버에 인증한다 — 전송 계층 위에서), 연결 프로토콜(암호화한 통로를 여러 논리 채널로 나눈다 — 대화형 셸, 포트 전달 등)로 이루어진다 — RFC 4251 §1
- (phase 78 step 0) **호스트 키로 서버를 확인한다**: 서버 호스트는 호스트 키를 갖는 것이 좋고(SHOULD), 키 교환 때 서버의 호스트 키로 **클라이언트가 정말 맞는 서버와 이야기하는지** 확인한다 — 그러려면 클라이언트가 서버의 공개 호스트 키를 미리 알아야 한다.
  믿는 방법은 둘이다 — 클라이언트가 호스트 이름과 공개 호스트 키를 짝지은 자기 목록을 갖는 방법, 믿을 수 있는 인증 기관(CA)이 그 짝을 보증하는 방법 — RFC 4251 §4.1
- (phase 78 step 0) **처음 접속할 때**: 프로토콜은 처음 접속할 때 이름과 호스트 키의 짝을 확인하지 않고 넘어가는 선택을 둔다 — 그래도 엿듣기는 막지만 중간자 공격에는 약해진다.
  처음 접속할 때는 확인 없이 받아 자기 목록에 저장하고 다음 접속부터는 그 키와 견주는 전략을 예로 든다. 공개 키에서 만든 지문(fingerprint)을 전화 같은 다른 길로 맞춰 볼 수도 있다. 확인할 수 없는 호스트 키를 받지 않는 선택도 두는 것이 좋다 — RFC 4251 §4.1
- (phase 78 step 0) 사용자 인증은 서버를 이미 인증하고 암호화한 통로를 세운 전송 계층 위에서 돈다고 전제한다. 클라이언트가 서버와 그 호스트 키를 미리 강하게 짝지어 두지 않으면, 중간에 끼어든 장치에 세션을 맺어 사용자 이름과 암호를 내줄 수 있다 — RFC 4251 §9.4, §9.4.1

쓰인 곳: (phase 77에서 쓰일 곳) `ports.well-known-ports`(TCP 22, 암호화한 원격 접속, Telnet보다 안전하다)
(phase 77 step 3에서 쓰일 곳) `tcp-udp.transport-choice`(RFC 4251 §1·RFC 4253 §4.1 — SSH는 보통 TCP 위에서 돈다)
(phase 77 step 8) `tcp-udp.transport-choice`(RFC 4251 §1 — 원격 로그인, §1·RFC 4253 §4.1 — 보통 TCP 위에서), 도식 `transport-choice`
(phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.ssh`(RFC 4251 §1 — 원격 로그인·세 하는 일, §4.1 — 호스트 키로 서버를 확인한다·처음 접속할 때 받아 저장하고 다음부터 견준다·지문, §9.4 — 사용자 인증은 암호화한 통로 위에서, RFC 4253 §4.1 — TCP 22),
기출 대조(`exam-notes.md` 「phase 78 step 0」 문단 — SSH는 암호화·무결성·공개 키)
(phase 79 step 14) 문항 n255(RFC 4253 §4.1 — SSH 서버는 TCP 22에서 접속을 기다린다. 상황으로만 쓰고 이 사실을 묻지 않는다)

## (phase 77) RFC 5321 — Simple Mail Transfer Protocol
https://www.rfc-editor.org/rfc/rfc5321

Draft Standard이고 폐기되지 않았다(RFC 2821을 대체, RFC 7504가 고쳤다 — rfc-editor 상태 2026-11-09). IANA 레지스트리의 25번 행은 이 문서를 고쳐 쓰는 진행 중 초안(`rfc5321bis`)을 참조로 단다 — 아직 RFC가 아니므로 이 문서를 쓴다. **포트와 「메일을 보낸다」만** 가져온다.

- SMTP의 목적은 메일을 믿을 수 있고 효율적으로 옮기는 것이다. 순서가 지켜지는 믿을 수 있는 데이터 흐름만 있으면 되고, 이 문서는 TCP 위의 전송을 다룬다 — §1.1
- 보낼 메시지가 있는 SMTP 클라이언트는 SMTP 서버로 양방향 통로를 열고, 메일 메시지를 하나 이상의 SMTP 서버에 옮긴다 — §2.1
- SMTP 서버는 SMTP 포트(IANA가 **25**번으로 정했다)에서 늘 연결을 기다리는 것이 좋다(SHOULD). 그러려면 들어오는 TCP 연결 여럿을 함께 받을 수 있어야 한다 — §4.5.4.2
- (phase 78 step 0, 2026-11-11 rfc-editor.org 원문 — Draft Standard 그대로) **누가 누구에게**: 보낼 메일을 가진 SMTP 클라이언트가 SMTP 서버로 양방향 통로를 열고, 메일을 하나 이상의 SMTP 서버에 넘기거나 넘기지 못했다고 알린다.
  서버는 마지막 목적지일 수도, 받은 뒤 스스로 클라이언트가 되어 다음 서버로 넘기는 중계(relay)일 수도 있다. 명령은 클라이언트가 보내고, 서버는 명령마다 응답을 보낸다. 명령과 응답은 한 번에 하나씩 차례로 오간다 — §2.1.
  오늘날 흔한 경우는 처음 메일을 중계와 비슷한 「메일 제출(message submission)」 서버에 넘기는 것이다 — §2.1(아래 RFC 6409 항목)
- (phase 78 step 0) **받는 쪽 서버를 찾는다**: 클라이언트는 목적지 도메인 이름을 DNS로 풀어, 중간의 메일 교환(Mail eXchanger) 호스트나 최종 호스트의 주소를 알아낸다 — §2.1. 그 조회는 먼저 그 이름의 **MX 레코드**를 찾는다(MX가 없으면 그 이름 자체를 MX처럼 다룬다) — §5.1
- (phase 78 step 0) **주소와 메일함**: 주소는 메일을 받을 사용자나 메일이 놓일 곳을 가리키는 글자열이고, 메일이 놓이는 곳을 메일함(mailbox)이라 한다. 표준 꼴은 `로컬 부분@도메인`이고, 로컬 부분의 뜻은 도메인 부분이 가리키는 호스트만 정한다 — §2.3.11
- (phase 78 step 0) **한 번의 대화(세션)**: 클라이언트가 서버에 연결을 열면 서버가 첫 인사로 답한다(`220`) — §3.1. 클라이언트가 `EHLO`로 자기를 밝힌다(서비스 확장을 쓸 수 있다는 뜻도 함께 — 옛 시스템은 `HELO`) — §3.2.
  메일 한 통을 넘기는 일(트랜잭션)은 세 단계다 — `MAIL FROM:<보내는 사람>`(받아들이면 `250`), `RCPT TO:<받는 사람>`(받는 사람마다 되풀이, 받아들이면 `250`),
  `DATA`(서버가 `354`로 답하면 본문을 보내고 **마침표 하나만 있는 줄**로 끝을 알린다 → 서버가 받아 저장하면 `250`). 이 차례는 지켜야 한다 — §3.3.
  `QUIT`를 보내면 서버는 `221`로 답하고 연결을 닫는다 — §3.8, §4.1.1.10
- (phase 78 step 0) **응답 코드**: 세 자리 숫자이고 첫 자리가 결과를 가른다 — 2(요청한 일을 마쳤다), 3(받았지만 정보를 더 기다린다 — `DATA`에 쓴다), 4(일시적인 실패 — 다시 시도한다), 5(영구적인 실패) — §4.2.1.
  `220` 서비스 준비, `221` 연결을 닫는다, `250` 요청한 일을 마쳤다, `354` 본문을 보내라(끝은 마침표 한 줄) — §4.2.3. 명령마다 성공 응답은 연결 `220`, `EHLO` `250`, `MAIL` `250`, `RCPT` `250`, `DATA` `354` → 본문 → `250`, `QUIT` `221`이다 — §4.3.2.
  한 세션 전체의 예는 부록 D.1에 있다(값은 옮기지 않는다)
- (phase 78 step 0) **보내는 쪽의 프로토콜이다**: SMTP는 메일의 전송·배달 프로토콜로 설계됐고, POP·IMAP과 함께 「메일 제출」에도 쓰여 왔다. 지금은 따로 정한 메일 제출 프로토콜(RFC 4409 — 지금은 RFC 6409)을 SMTP를 바로 쓰는 것보다 권한다 — §1.2.
  배달하는 SMTP 시스템은 메일을 메일 사용자 에이전트에 넘기거나, 그 에이전트가 **나중에 꺼내 볼** 메시지 저장소에 넣는다 — §2.3.10. **이 문서는 메일함에서 메일을 꺼내 오는 명령을 정하지 않는다**
  (§4.1의 명령은 메일을 넘기는 일·주소 확인·세션 관리다 — `EHLO`·`MAIL`·`RCPT`·`DATA`·`RSET`·`VRFY`·`EXPN`·`HELP`·`NOOP`·`QUIT`). 꺼내 오는 것은 POP3·IMAP이다 — 아래 RFC 1939·RFC 9051·RFC 6409 항목
- (phase 78 step 0) SMTP 서버와 클라이언트는 메일을 옮기는 일을 하므로 MTA(Mail Transfer Agent)로 불리고, 메일의 출발점과 도착점은 MUA(Mail User Agent)로 여긴다. 다만 이 낱말들이 가리키는 경계가 실제 인터넷 메일의 관행과 꼭 맞지는 않으니 강한 역할 구분으로 읽지 말라고 적는다 — §2.3.3

쓰인 곳: (phase 77에서 쓰일 곳) `ports.well-known-ports`(TCP 25, 메일을 보낸다)
(phase 77 step 3에서 쓰일 곳) `tcp-udp.transport-choice`(§1.1 — 순서가 지켜지는 믿을 수 있는 데이터 흐름이 필요하고, 이 문서는 TCP 위의 전송을 다룬다. 부록 A의 제목도 「TCP Transport Service」다), 기출 대조(`exam-notes.md` 「phase 77 step 3」 문단 — SMTP는 TCP를 쓴다)
(phase 77 step 8) `tcp-udp.transport-choice`(§1.1 — 순서가 지켜지는 믿을 수 있는 데이터 흐름이 필요하다, TCP 위), 도식 `transport-choice`
(phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.email-delivery`(§2.1 — 중계, DNS로 받는 쪽 서버를 찾는다, §5.1 — MX, §2.3.11 — 주소의 꼴과 메일함, §2.3.10 — 배달된 메일은 나중에 꺼내 볼 저장소에, §2.3.3 — MTA·MUA라는 이름의 한계),
`app-protocols-mail-file.smtp`(§2.1 — 클라이언트가 서버로 연결을 열고 넘긴다·중계·명령마다 응답, §3.1~§3.3·§3.8·§4.1.1.10 — 대화의 차례, §4.2.1·§4.2.3·§4.3.2 — 응답 코드, §1.2·§2.3.10·§4.1 — 꺼내 오는 일은 하지 않는다), 기출 대조(`exam-notes.md` 「phase 78 step 0」 문단 — SMTP는 전자우편을 보낸다)

## (phase 77 step 2) RFC 9846 — The Transport Layer Security (TLS) Protocol Version 1.3
https://www.rfc-editor.org/rfc/rfc9846

Standards Track이고 2026년 7월에 나왔다. RFC 8446(TLS 1.3의 이전 명세)을 폐기하고 대신한다(rfc-editor 상태 2026-11-09 — RFC 8446 정보 쪽에 「now obsolete, see RFC 9846」).
**이름과 「무엇을 막는가」만** 가져온다. 핸드셰이크·키 교환·암호 방식은 가져오지 않는다.

- 프로토콜 이름은 Transport Layer Security(TLS)다. TLS는 클라이언트·서버 응용 프로그램이 인터넷으로 통신할 때 엿듣기(eavesdropping), 바꿔치기(tampering), 메시지 위조를 막도록 설계됐다 — Abstract
- HTTPS가 TLS로 무엇을 얻는지(서버 인증, 기밀성, 무결성)는 위 RFC 9110 §4.2.2 「(phase 77)」 줄이다
- (phase 78 step 5, 2026-11-11 rfc-editor.org 원문 — 상태 json은 Proposed Standard이고 폐기되지 않았다. RFC 8446과 함께 **TLS 1.2의 명세 RFC 5246**, RFC 5077·6961·7627·8422를 폐기하고 대신한다) 이 step부터는 아래 줄의 범위(핸드셰이크의 메시지 차례·인증·SSL 금지)까지 가져온다. 키 교환 방식·암호 방식·확장은 여전히 가져오지 않는다.
- (phase 78 step 5) TLS의 목표는 통신하는 두 쪽 사이에 **안전한 통로**를 만드는 것이고, 아래 전송에 바라는 것은 **믿을 수 있고 순서가 지켜지는 데이터 흐름** 하나뿐이다 — §1
- (phase 78 step 5) 그 통로가 주는 성질은 셋이다. **인증** — 서버 쪽은 늘 인증하고 클라이언트 쪽은 고를 수 있다(공개 키 방식이나 미리 나눠 둔 키로). **기밀성** — 통로를 맺은 뒤 보낸 데이터는 두 끝만 볼 수 있다(데이터의 길이는 감추지 않는다).
  **무결성** — 맺은 뒤 보낸 데이터를 공격자가 들키지 않고 바꿀 수 없다. 네트워크를 통째로 쥔 공격자 앞에서도 이 성질이 지켜져야 한다 — §1
- (phase 78 step 5) TLS는 두 부분이다 — **핸드셰이크 프로토콜**(서로 인증하고, 쓸 암호 방식과 매개변수를 정하고, 함께 쓸 키 재료를 만든다)과 **레코드 프로토콜**(그렇게 정한 것으로 오가는 데이터를 레코드 단위로 나눠 보호한다) — §1
- (phase 78 step 5) TLS는 특정 응용 프로토콜에 매이지 않아 **위 계층 프로토콜이 그 위에 얹힌다**. 언제 핸드셰이크를 시작하고 오간 인증서를 어떻게 확인할지는 TLS 위에서 도는 응용 프로토콜이 정해야 한다(MUST) — §1. (HTTP는 RFC 9110 §4.3.4가, 메일 프로토콜은 RFC 8314가 그것을 정한다 — 위·아래 항목)
- (phase 78 step 5) 핸드셰이크는 클라이언트와 서버가 처음 통신할 때 쓴다. 판을 정하고, 암호 방식을 고르고, 서로 인증하고(클라이언트 인증은 고를 수 있다), 함께 쓸 비밀 키 재료를 만든다. 끝나면 그 키로 응용 계층의 데이터를 보호한다. 핸드셰이크가 실패하면 연결을 끝낸다 — §2
- (phase 78 step 5) **기본 핸드셰이크의 메시지 차례**(§2 그림 1을 간추림): 클라이언트 `ClientHello`(지원하는 판·암호 방식·키 교환 값) → 서버 `ServerHello`(고른 것과 서버의 키 교환 값) — 여기까지가 키 교환이고 **이 뒤는 모두 암호화된다** →
  서버 `EncryptedExtensions` → (클라이언트도 인증서로 확인하려면 서버가 `CertificateRequest`) → 서버 `Certificate`(서버의 인증서) → 서버 `CertificateVerify`(인증서의 공개 키에 짝인 개인 키로 핸드셰이크 전체에 서명한 것) →
  서버 `Finished`(핸드셰이크 전체에 대한 메시지 인증 코드 — 키를 확인하고 상대의 신원을 키에 묶는다) → 클라이언트 `Finished`(서버가 요청했으면 그 앞에 클라이언트의 `Certificate`·`CertificateVerify`) → 그 뒤 두 쪽이 응용 데이터를 암호화해 주고받는다.
  `Finished`를 보내기 전에는 응용 데이터를 보내지 않는다(0-RTT라는 예외가 따로 있다) — §2. 핸드셰이크를 키 교환·서버 매개변수·인증의 세 단계로 볼 수 있다 — §2
- (phase 78 step 5) **SSL 2.0·SSL 3.0·TLS 1.0·TLS 1.1은 보안이 충분하지 않아 어떤 이유로도 협상해서는 안 된다**(MUST NOT) — 부록 E.5(근거로 RFC 6176·7568·8996을 든다)

쓰인 곳: (phase 77 step 2) `ports.well-known-ports`(HTTPS 항목 — TLS(Transport Layer Security)는 상대 서버가 진짜인지 확인하고 내용을 암호화해 엿보거나 바꾸지 못하게 한다), 문항 n173의 해설
(phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.tls`(§1 — 믿을 수 있는 순서 있는 전송 위, 인증·기밀성·무결성, 서버는 늘 인증, 두 부분, 위 계층이 얹힌다, §2 — 메시지 차례, 부록 E.5 — SSL 금지),
`app-protocols-mgmt-security.https`(§1 — 서버 쪽은 늘 인증한다), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — 「인증이 필요 없다」가 틀린 까닭, 「SSL/TLS」 표기)

## (phase 77) Linux man-pages — ip(7), proc_sys_net_ipv4(5), capabilities(7), tcp(7), udp(7), services(5)
https://man7.org/linux/man-pages/man7/ip.7.html
https://man7.org/linux/man-pages/man5/proc_sys_net_ipv4.5.html
https://man7.org/linux/man-pages/man7/capabilities.7.html
https://man7.org/linux/man-pages/man7/tcp.7.html
https://man7.org/linux/man-pages/man7/udp.7.html
https://man7.org/linux/man-pages/man5/services.5.html

2026-11-09에 IPv4로 내려받아 읽은 판: Linux man-pages 6.19 — ip(7)·capabilities(7)·services(5) 2026-02-08, proc_sys_net_ipv4(5) 2025-12-25, tcp(7) 2026-04-19(udp(7)도 같은 man-pages 6.19 묶음). HTML은 2026-09-09에 만든 것이다.
capabilities(7)의 다른 사실은 위 「(phase 75) Linux man-pages …」 항목에 있다.

- **ip(7)** — Address format: IP 소켓 주소는 IP 인터페이스 주소와 **16비트 포트 번호**를 합친 것이다. 기본 IP 프로토콜은 포트 번호를 주지 않고, 포트는 그 위의 udp(7)·tcp(7) 같은 프로토콜이 구현한다.
  **1024보다 작은 포트 번호는 특권 포트**(privileged port, 예약 포트라고도)라 부르고, 특권 프로세스(Linux에서는 CAP_NET_BIND_SERVICE 능력을 가진 프로세스)만 그 포트에 소켓을 묶을(bind) 수 있다
- **ip(7)** — DESCRIPTION: 들어오는 연결을 받으려는 프로세스는 소켓을 로컬 주소에 묶는다. 한 로컬 (주소, 포트) 쌍에는 IP 소켓 하나만 묶일 수 있다. 묶지 않은 소켓으로 connect(2)를 부르면 그 소켓은 **비어 있는 포트 하나에 저절로 묶인다**
- **proc_sys_net_ipv4(5)** — `/proc/sys/net/ipv4/ip_local_port_range`: 포트를 정하지 않은 소켓에 줄 **임시 포트의 범위**를 정하는 두 정수가 든 파일이다. 묶지 않은 소켓으로 connect(2)나 sendto(2)를 부르거나, bind(2)에 포트 0을 주면
  첫 수부터 둘째 수까지에서 임시 포트를 준다. 범위가 다 차면 그 시스템 호출이 오류를 낸다. 첫 수는 잘 알려진 포트와 부딪치지 않게 1024보다, 되도록 4096보다 크게 두라고 권한다.
  **이 파일의 기본값은 man-pages에 적혀 있지 않다**(ip(7)·proc_sys_net_ipv4(5)·tcp(7)·udp(7) 전문 검색 2026-11-09) — 기본값을 적은 커널 문서(`Documentation/networking/ip-sysctl.rst`)는 허용한 출처 밖이라 읽지 않았다
- **capabilities(7)**: CAP_NET_BIND_SERVICE는 인터넷 도메인의 특권 포트(1024보다 작은 번호)에 소켓을 묶게 하는 능력이다 — Capabilities list
- **tcp(7)**: 밖으로 TCP 연결을 만들려면 connect(2)로 다른 TCP 소켓에 연결한다. 들어오는 연결을 받으려면 소켓을 로컬 주소와 포트에 묶고(bind) listen(2)으로 기다리는 상태로 둔 뒤, 들어오는 연결마다 accept(2)로 새 소켓을 받는다 — DESCRIPTION
- **udp(7)**: 묶지 않은 UDP 소켓으로 보내면 소켓 계층이 `ip_local_port_range`가 정한 범위에서 비어 있는 로컬 포트를 골라 묶는다 — DESCRIPTION
- **services(5)**: `/etc/services`는 사람이 읽는 서비스 이름과 그 포트 번호·프로토콜을 짝지은 글 파일이다. 1024보다 작은 번호(「낮은 번호」 포트)에는 root만 소켓을 묶을 수 있어서, 그 포트에 붙는 클라이언트는
  그 포트의 서비스가 그 기계의 일반 사용자가 띄운 가짜가 아니라고 믿을 수 있다. IANA가 정한 잘 알려진 포트는 보통 이 범위에 있다 — DESCRIPTION.
  같은 쪽은 IANA가 지금도 TCP·UDP를 함께 정해 준다고 적지만, 그 관행은 RFC 6335 §7.2(2011)가 끝냈다 — 정책은 RFC 6335를 따른다. 「TCP만 쓰는 서비스도 두 행이 있다」는 레지스트리의 옛 행을 설명하는 데만 쓴다
- (phase 78 step 11, 2026-11-11에 IPv4로 다시 읽음 — services(5)는 Linux man-pages 6.19, 2026-02-08) **services(5)**: 이 파일에 어떤 서비스의 줄이 있다고 해서 그 서비스가 지금 그 기계에서 **돌고 있다는 뜻은 아니다** — DESCRIPTION.
  줄마다 「서비스 이름, `포트/프로토콜`, 별명」을 적는다 — 같은 절. 곧 `/etc/services`는 이름과 번호의 짝을 적어 둔 목록이고, 지금 열려 있는 포트는 netstat·ss 같은 명령이 보인다(위 「(phase 74 step 11) … netstat」 항목의 「(phase 78 step 11)」 줄)

쓰인 곳: (phase 77에서 쓰일 곳) `ports.port-number`(ip(7) — 소켓 주소는 IP 주소와 16비트 포트, 포트는 전송 계층이 구현한다), `ports.well-known-ports`(ip(7)·capabilities(7)·services(5) — Linux에서 1024보다 작은 포트에서 기다리려면 특권이 필요하다),
`ports.client-server-ports`(ip(7)·udp(7)·proc_sys_net_ipv4(5) — 클라이언트가 묶지 않고 보내면 운영체제가 비어 있는 임시 포트를 고른다, 범위는 `ip_local_port_range`, tcp(7) — 서버는 bind·listen·accept), 강의 수정 이력 L43, `exam-notes.md` E27
(phase 78 step 11에서 쓰일 곳) `diagnostic-commands.netstat-linux-options`(services(5) — `/etc/services`는 이름과 번호의 목록일 뿐 지금 도는 서비스를 보이지 않는다), `exam-notes.md` 「phase 78 step 11」 문단([기출 2024-08-25 #32]의 `cat /etc/services` 보기)
(phase 79 step 9에서 쓰일 곳) `linux-servers.apache-listen`(ip(7)·capabilities(7)·services(5) — 1024보다 작은 포트에 묶으려면 특권(root)이 필요하다, ip(7) — 한 주소·포트 쌍에는 소켓 하나만 묶인다), `exam-notes.md` 「phase 79 step 9」 문단([기출 2024-05-19 #41], [기출 2025-11-02 #35])

## (phase 77) Microsoft Learn — The default dynamic port range for TCP/IP has changed since Windows Vista and in Windows Server 2008
https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/default-dynamic-port-range-tcpip-chang

적용 판: 지원 중인 Windows Server(페이지의 「Applies to」). 페이지 날짜 ms.date 2026-02-12, updated_at 2026-02-19 — 2026-11-09에 내려받아 읽었다.

- IANA 권고에 맞추려고 Windows Vista·Windows Server 2008부터 **밖으로 나가는 연결에 쓰는 동적 클라이언트 포트 범위**의 기본값을 시작 49152, 끝 65535로 바꿨다. 그 전 판의 기본값은 1025~5000이었다
- 범위는 TCP와 UDP에 따로 정하고, `netsh int ipv4 show dynamicport tcp`처럼 보며 `netsh … set dynamicport`로 바꿀 수 있다(바꿀 수 있는 가장 작은 시작 번호는 1025)

쓰인 곳: (phase 77에서 쓰일 곳) `ports.client-server-ports`(클라이언트 포트의 범위는 운영체제가 정한다 — Windows는 기본 49152~65535, 예전 판은 1025~5000), 강의 수정 이력 L43

## (phase 77 step 3) RFC 3540 — Robust Explicit Congestion Notification (ECN) Signaling with Nonces [Historic — 역사 기록으로만 쓴다], RFC 8311 — Relaxing Restrictions on Explicit Congestion Notification (ECN) Experimentation, RFC 9768 — More Accurate Explicit Congestion Notification (AccECN) Feedback in TCP, IANA — TCP Header Flags
https://www.rfc-editor.org/rfc/rfc3540
https://www.rfc-editor.org/rfc/rfc8311
https://www.rfc-editor.org/rfc/rfc9768
https://www.iana.org/assignments/tcp-parameters/tcp-parameters.xhtml

상태(rfc-editor 2026-11-09): RFC 3540은 2003-06에 Experimental로 나와 지금은 **HISTORIC**이다. RFC 8311은 2018-01, RFC 9768은 2026-04에 나온 Proposed Standard(Standards Track)이고 둘 다 폐기되지 않았다. RFC 9768은 RFC 3168을 고친다(RFC 9293은 고치지 않는다).
IANA 레지스트리 묶음 「Transmission Control Protocol (TCP) Parameters」는 XML판(Last Updated 2026-10-22)을 읽었다. **제어 비트가 몇 개인지와 비트 7의 이름만** 가져온다. NS·AE가 혼잡 신호를 어떻게 셈하는지는 가져오지 않는다.

- **NS(Nonce Sum)**: RFC 3540은 ECN 실험의 하나로 TCP 헤더에 **NS 플래그 한 비트**를 CWR·ECE 바로 옆, 비트 7에 두었다 — RFC 3540 §5 그림 3. 같은 그림이 RFC 9768 §1.4 그림 1에도 있다(NS를 둔 시절의 플래그 그림 — 예약 3비트 + NS·CWR·ECE·URG·ACK·PSH·RST·SYN·FIN)
- **NS를 예약으로 되돌림**: RFC 8311은 RFC 3540의 실험을 끝내고 Experimental에서 Historic으로 돌렸다 — RFC 8311 Abstract, §3. IANA는 「TCP Header Flags」 레지스트리에서 비트 7의 NS 등록을 지우고, 비트 7은 Historic RFC 3540이 NS로 썼지만 **이제 Reserved**라는 설명을 달았다 — RFC 8311 §7
- **AE(Accurate ECN)**: RFC 9768은 그렇게 비어 있던 비트 7을 **AE**로 다시 정했다 — RFC 9768 §3.1.1, §7(표 6). 연결을 맺는 첫 SYN에 AE·CWR·ECE 셋을 모두 켜서 이 방식을 쓰자고 청하고, AccECN을 지원하는 서버가 받아들인 연결에서만 셋을 이 방식으로 읽는다 — §3.1.1.
  이 문서의 Abstract는 이것을 「예전에 ECN-nonce에 주었던 예약 비트를 할당한다」고 적는다
- **IANA 「TCP Header Flags」 레지스트리의 지금(2026-11-09)**: RFC 9293이 만든 레지스트리이고 등록은 Standards Action이다. 비트 4·5·6 — Reserved for future use(RFC 9293), 비트 7 — **AE (Accurate ECN)**(RFC 9768, 2026-04-24 갱신, 주석: 예전에 Historic RFC 3540이 NS로 썼다),
  비트 8 — CWR, 9 — ECE(RFC 3168), 10 — URG, 11 — ACK, 12 — PSH, 13 — RST, 14 — SYN, 15 — FIN(RFC 9293). 곧 **이름이 붙은 비트가 9개, 예약이 3비트**다
- **비트 수의 연표**(위 문서들로 정리): 옛 TCP 표준(RFC 793 — RFC 9293이 대체)의 그림은 예약 6비트 + 플래그 6개(URG~FIN)였다(RFC 3168 §6.1 그림 3) → RFC 3168(2001)이 CWR·ECE를 더해 예약 4 + 플래그 8 →
  RFC 3540(2003, 실험)이 NS를 더해 예약 3 + 플래그 9 → RFC 8311(2018)이 NS를 지워 예약 4 + 플래그 8(RFC 9293(2022)의 그림이 이 상태다 — 위 RFC 9293 항목) → RFC 9768(2026-04)이 AE를 더해 예약 3 + 이름 붙은 플래그 9.
  어느 때든 **데이터 오프셋 뒤의 12비트(예약 + 제어 비트)** 자체는 바뀌지 않았다(계산 — 6 + 6, 4 + 8, 3 + 9)

쓰인 곳: (phase 77 step 3에서 쓰일 곳) `tcp-udp.tcp-header`(예약 칸의 비트 수가 문서와 때에 따라 다르다), `tcp-udp.tcp-control-bits`(제어 비트를 8개 또는 9개로 세는 까닭, AE), `exam-notes.md` E29

## (phase 77 step 3) RFC 3550 — RTP: A Transport Protocol for Real-Time Applications
https://www.rfc-editor.org/rfc/rfc3550

Internet Standard이고 폐기되지 않았다(RFC 1889를 대체, RFC 5506 등 여럿이 고쳤다 — rfc-editor 상태 2026-11-09). **「실시간 음성·영상은 보통 UDP 위에서 나른다」만** 가져온다. RTP 헤더와 RTCP는 가져오지 않는다 — 기출이 묻지 않는다.

- RTP는 대화형 음성·영상처럼 **실시간 성질을 가진 데이터**를 끝과 끝 사이에 나르는 프로토콜이다. 응용은 보통 RTP를 **UDP 위에서** 돌린다 — UDP의 다중화(포트)와 체크섬을 쓰려고 — §1
- RTP 자체는 제때 전달하는 장치도, 전달을 보장하는 장치도, 순서가 바뀌는 것을 막는 장치도 없다 — §1
- 음성 회의의 예: 20ms 길이의 음성 조각마다 RTP 헤더를 붙여 UDP 패킷에 담아 보낸다. 네트워크가 패킷을 잃거나 순서를 바꾸거나 들쭉날쭉 늦추면, 받는 쪽은 RTP 헤더의 시각 정보와 순서 번호로 소리를 20ms마다 이어 재생하고, 순서 번호로 잃은 패킷 수를 어림한다 — §2.1
  (곧 잃은 조각을 기다리지 않고 재생을 이어 간다)
- (phase 78 step 5, 2026-11-11 rfc-editor.org 원문 — Internet Standard 그대로, RFC 5506·5761·6051·6222·7022·7160·7164·8083·8108·8860이 고쳤다) RTP는 대화형 음성·영상처럼 실시간 성질을 가진 데이터를 끝과 끝 사이에 나르는 서비스를 준다 — §1.
  회의에서 음성과 영상을 함께 쓰면 둘을 **따로 된 RTP 세션**으로 보낸다 — 매체마다 다른 UDP 포트 쌍으로 — §2.2. **세션을 맺고 끝내는 일은 RTP의 몫이 아니라 SIP 같은 신호 프로토콜의 몫이다** — 아래 「(phase 78 step 5) RFC 3261」 항목의 §2·§4

쓰인 곳: (phase 77 step 3에서 쓰일 곳) `tcp-udp.transport-choice`(실시간 음성·영상은 보통 UDP 위에서), 기출 대조(`exam-notes.md` 「phase 77 step 3」 문단 — TCP는 실시간 화상 통신에 쓰지 않는다)
(phase 77 step 8) `tcp-udp.transport-choice`(§1 — 실시간 음성·영상은 보통 UDP 위, §2.1 — 받는 쪽은 조각을 정해진 간격으로 이어 재생한다), 도식 `transport-choice`, 문항 n186
(phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.sip`(§1 — 음성·영상 자체는 RTP가 나른다, §2.2 — 음성과 영상은 따로 된 RTP 세션)

## (phase 77 step 3) RFC 4336 — Problem Statement for the Datagram Congestion Control Protocol (DCCP), RFC 4340 — Datagram Congestion Control Protocol (DCCP)
https://www.rfc-editor.org/rfc/rfc4336
https://www.rfc-editor.org/rfc/rfc4340

상태(rfc-editor 2026-11-09): RFC 4336은 Informational, RFC 4340은 Proposed Standard이고 둘 다 폐기되지 않았다(4340은 RFC 5595 등이 고쳤다). **「실시간 응용이 왜 TCP 대신 UDP를 쓰는가」만** 가져온다.
DCCP라는 프로토콜 자체는 가져오지 않는다 — 기출이 묻지 않는다(이름도 본문에 쓰지 않는다).

- UDP는 주로 DNS·SNMP처럼 짧은 요청-응답에 쓰여 왔다 — TCP의 3-way handshake, 재전송, 연결 상태를 피하려고 — RFC 4336 §1
- 음성 스트리밍·인터넷 전화·온라인 게임 같은 응용은 **신뢰성보다 제때 도착하는 것**을 더 중요하게 본다. TCP는 신뢰성과 순서를 지키느라 **지연을 얼마든지 늘릴 수 있어** 이런 응용은 UDP를 쓴다 — RFC 4336 §1
- TCP 대신 UDP를 쓰는 까닭 셋: 시작 지연(데이터를 보내기 전 3-way handshake의 지연을 피한다), 상태 없음(연결 상태를 지니지 않는다), 신뢰성과 타이밍의 교환(정한 시점 — 대개 왕복 시간 몇 번 — 까지 닿지 않은 데이터는 받는 쪽에 쓸모가 없다) — RFC 4336 §2.1
- 인터넷 전화나 영상 스트리밍에서 패킷 하나는 이어지는 흐름의 한 시간 조각이다. 그 조각을 재생할 때가 지나 도착하면 더는 쓸모가 없고, 이런 응용은 빠진 패킷의 영향을 어느 정도 가릴 수 있다.
  게임의 위치 정보는 잃었다고 옛 위치를 다시 보내지 않고 새 위치를 보낸다 — RFC 4336 §2.1
- TCP는 이런 응용에 잘 맞지 않는다 — 믿을 수 있는 순서 전달과 혼잡 제어가 지연을 얼마든지 길게 만들 수 있기 때문이다. UDP는 긴 지연을 피하지만, 혼잡 제어를 하려면 응용이 스스로 해야 한다 — RFC 4340 §1

쓰인 곳: (phase 77 step 3에서 쓰일 곳) `tcp-udp.transport-choice`(늦게 온 데이터가 쓸모없는 응용, 짧은 요청-응답에 UDP), `tcp-udp.udp`(연결 단계가 없어 지연이 짧다 — 면접 Q38과 같은 사실), 기출 대조(`exam-notes.md` 「phase 77 step 3」 문단 — TCP는 실시간 화상 통신·손실을 견디는 프로그램용이 아니다)
(phase 77 step 7) `tcp-udp.udp`(RFC 4336 §1 — DNS 같은 짧은 요청-응답에 UDP, §2.1 — 3-way handshake의 시작 지연을 피한다; RFC 4340 §1 — 믿을 수 있는 순서 전달이 지연을 늘린다), 문항 n184 해설
(phase 77 step 8) `tcp-udp.transport-choice`(RFC 4336 §1 — 짧은 요청-응답은 3-way handshake·연결 상태를 피해 UDP, 실시간 응용은 제때 도착을 중시; §2.1 — 재생할 때가 지나 닿은 조각은 쓸모없다, 잃은 패킷의 영향을 어느 정도 가린다; RFC 4340 §1 — 믿을 수 있는 순서 전달이 지연을 얼마든지 늘린다), 도식 `transport-choice`, 문항 n186

## (phase 77 step 3) RFC 9000 — QUIC: A UDP-Based Multiplexed and Secure Transport
https://www.rfc-editor.org/rfc/rfc9000

Proposed Standard이고 폐기되지 않았다(rfc-editor 상태 2026-11-09). **「QUIC은 UDP 위에서 돌며 스스로 신뢰성 있는 전달과 혼잡 제어를 갖춘다」만** 가져온다. 스트림·패킷 형식·핸드셰이크는 가져오지 않는다.

- QUIC은 연결 지향 프로토콜이라 클라이언트와 서버 사이에 상태를 가진 주고받기를 만든다. 핸드셰이크에 TLS를 품는다 — §1
- QUIC 패킷은 **UDP 데이터그램에 실려** 간다 — 지금의 시스템과 네트워크에 쉽게 놓으려고 — §1
- QUIC은 **믿을 수 있는 전달과 혼잡 제어**에 필요한 피드백을 갖춘다. 잃은 데이터를 찾아 되살리는 방법은 RFC 9002가 정한다(9002는 읽지 않았다) — §1
- HTTP/3는 HTTP를 QUIC 위에 옮긴 것이다 — RFC 9114 Abstract(위 항목)

쓰인 곳: (phase 77 step 3에서 쓰일 곳) `tcp-udp.transport-choice`(UDP 위에서 프로그램 쪽이 신뢰성을 더하는 예 — HTTP/3가 쓰는 QUIC), `exam-notes.md` E28
(phase 77 step 8) `tcp-udp.transport-choice`(§1 — QUIC 패킷은 UDP 데이터그램에 실리고 믿을 수 있는 전달과 혼잡 제어를 갖춘다)

## (phase 77 step 3) RFC 5905 — Network Time Protocol Version 4: Protocol and Algorithms Specification
https://www.rfc-editor.org/rfc/rfc5905

Proposed Standard이고 폐기되지 않았다(RFC 1305·4330을 대체, RFC 7822 등이 고쳤다 — rfc-editor 상태 2026-11-09). **전송 프로토콜만** 가져온다. NTP의 계층(stratum)·시각 계산·포트의 쓰임은 응용 프로토콜 주제(phase 78)의 몫이다.

- NTP 패킷은 **UDP 데이터그램**이다 — §7.3. NTP 포트 번호는 IANA가 정한 123이다 — §7.2 표 「Global Parameters」(PORT)
- NTP가 시각 값을 주고받는 방식은 패킷을 잃거나 같은 패킷이 두 번 와도 본래 잘 견딘다. 데이터 무결성은 IP·UDP 체크섬이 맡고, **흐름 제어나 재전송 장치는 두지 않으며 필요하지도 않다** — §8
- (phase 77 step 8, 2026-11-09 rfc-editor.org 원문) NTP는 인터넷에서 **컴퓨터의 시계를 맞추는 데** 널리 쓰인다 — Abstract
- (phase 77 step 8) 클라이언트·서버 방식에서 클라이언트가 서버에 메시지를 보내면 **서버는 바로 답한다** — §5
- (phase 78 step 5, 2026-11-11 rfc-editor.org 원문 — Proposed Standard 그대로, RFC 7822·8573·9109·9748·9769가 고쳤다) 이 step부터는 아래 줄의 범위(계층·원리·여러 서버 견주기·SNTP)까지 가져온다. 시각 계산식과 알고리즘의 세부는 여전히 가져오지 않는다.
- (phase 78 step 5) NTPv4는 시간 서버와 클라이언트들의 **시스템 시계를 맞추는 데** 널리 쓰인다. 이 문서가 NTPv3(RFC 1305)와 SNTPv4(RFC 4330)를 폐기하고 대신하며, **SNTPv4는 NTPv4의 부분 집합**이다. 몇몇 헤더 칸이 조금 바뀌었어도 앞 판의 NTP·SNTP와 함께 동작한다 — §1
- (phase 78 step 5) 국가 표준 시각에 선이나 전파로 맞춘 **주 서버**(primary server)에서 **보조 서버**(secondary server)와 클라이언트로 시각 정보를 나른다. 시각 값은 뿌리의 주 서버에서 가지처럼 갈라진 보조 서버들을 지나 클라이언트 쪽으로 흐른다 — §1
- (phase 78 step 5) NTP 구현은 주 서버·보조 서버·클라이언트 가운데 하나로 동작한다. **주 서버는 UTC에 바로 이어지는 기준 시계(예: GPS, Galileo)에 맞춘다.** 클라이언트는 위쪽 서버 하나 이상에 맞추되 아래쪽에 시각을 내주지 않고, 보조 서버는 위쪽 서버와 아래쪽 서버·클라이언트를 모두 가진다 — §2
- (phase 78 step 5) 클라이언트·서버 방식에서 클라이언트는 서버에 요청 패킷을 보내고 서버는 답 패킷을 돌려준다. 서버는 클라이언트에게 시각을 내주지만 클라이언트에게서 받지는 않는다. 서버가 GPS 수신기 같은 표준 시각원에서 시각을 바로 얻을 수도 있다 — §3
- (phase 78 step 5) **계층(stratum)**: 서버마다 층을 stratum 번호로 매긴다. 주 서버가 **stratum 1**이고, 한 층 아래의 보조 서버는 위 층보다 하나 큰 번호를 받는다. 번호가 커질수록 경로와 시계의 안정성에 따라 정확도가 떨어지고, 평균 오차는 대략 stratum 번호와 왕복 지연에 비례해 커진다 — §3
- (phase 78 step 5) 패킷의 stratum 칸 값은 0이 정하지 않음·무효, **1이 주 서버(예: GPS 수신기를 갖춘 서버)**, **2~15가 (NTP로 맞춘) 보조 서버**, **16이 동기화되지 않음**, 17~255가 남겨 둔 값이다 — §7.3 그림 11. 가장 큰 stratum 번호(MAXSTRAT)는 16이다 — §7.2 그림 6.
  구현에서는 기준 시계를 흔히 stratum 0으로 나타낸다는 설명도 있다 — §7.3 그림 11 아래. (패킷에서 0은 「정하지 않음·무효」이므로 본문에 「stratum 0 = 기준 시계」라고 쓰지 않는 것을 권한다)
- (phase 78 step 5) **원리**: 한쪽이 요청을 보낸 시각, 상대가 요청을 받은 시각, 상대가 답을 보낸 시각, 답을 받은 시각 — 네 타임스탬프로 상대 시계와의 차이(offset)와 오가는 데 걸린 왕복 지연(delay)을 계산한다 — §8(그림 15와 그 아래 식. 식은 가져오지 않는다)
- (phase 78 step 5) **여러 서버 견주기**: 서버 하나에서 받은 표본들 가운데 정확할 만한 것을 고르는 것은 시계 필터 알고리즘이다 — §10. 여러 서버의 값을 모아, 틀린 시각을 내는 서버(falseticker)를 걸러 내고 남은 것들을 묶고 가중 평균으로 합쳐 최종 값으로 시스템 시계를 조절한다(선택·묶기·합치기·시계 조절 알고리즘) — §11
- (phase 78 step 5) **SNTP**: NTP의 부분 집합인 SNTP를 따르는 주 서버와 클라이언트는 §9 이하의 완화 알고리즘(여러 서버의 값을 견주고 고르는 알고리즘들)을 구현하지 않아도 된다. SNTP는 **기준 시계 하나를 가진 주 서버**와 **위쪽 서버 하나만 두고 아래쪽 클라이언트가 없는 클라이언트**를 위한 것이고,
  완전한 NTPv4는 위쪽·아래쪽이 여럿인 보조 서버를 위한 것이다. 그 밖에는 NTP와 SNTP의 서버·클라이언트가 **완전히 함께 동작**하고 한 NTP 망에 섞어 쓸 수 있다 — §14. SNTP 클라이언트는 NTP 프로토콜의 일부만 써도 되고, 가장 단순하게는 서버 패킷에 담긴 보낸 시각 하나만 쓴다 — §14

쓰인 곳: (phase 77 step 3에서 쓰일 곳) `tcp-udp.transport-choice`(짧은 질의·응답 한 번이면 되고 재전송이 필요 없는 응용 — NTP는 UDP)
(phase 77 step 8) `tcp-udp.transport-choice`(Abstract — 컴퓨터 시계를 맞춘다, §5 — 클라이언트·서버 방식에서 서버는 바로 답한다, §7.3 — UDP, §8 — 재전송 장치를 두지 않는다)
(phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.ntp`(§1·§2·§3 — 시계를 맞춘다, 주 서버·보조 서버·클라이언트, stratum, §7.2·§7.3 — 123, stratum 칸 값과 16, §8 — 네 타임스탬프의 원리, §10·§11 — 여러 서버를 견주어 고른다),
`app-protocols-mgmt-security.sntp`(§1 — SNTPv4는 NTPv4의 부분 집합이고 RFC 4330을 이 문서가 폐기했다, §14 — 완화 알고리즘 없이·서버 하나·함께 동작), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — SNTP와 123)

## (phase 77 step 9) Linux man-pages — ss(8)
https://man7.org/linux/man-pages/man8/ss.8.html

2026-11-10에 읽은 판: iproute2 프로젝트의 페이지이고, upstream Git 저장소에서 2026-08-04에 가져온 것이다(그때 가장 최근 커밋 2026-07-28, HTML 2026-09-09 — COLOPHON).
**옵션의 뜻과 상태를 부르는 이름만** 적는다. 다른 옵션과 출력 읽기는 `diagnostic-commands` 주제의 몫이다.

- `ss`는 소켓의 통계를 보여 주는 도구다. netstat과 비슷한 정보를 보이되 TCP와 상태 정보를 더 많이 보인다 — DESCRIPTION. 옵션 없이 부르면 연결이 맺어진, 요청을 기다리지 않는(non-listening) 소켓만 보인다 — OPTIONS
- `-t`(`--tcp`)는 TCP 소켓을 보인다. `-a`(`--all`)는 요청을 기다리는(listening) 소켓과 기다리지 않는 소켓을 모두 보인다 — 그래서 LISTEN 상태의 소켓은 `-a`(또는 기다리는 소켓만 보이는 `-l`)를 줘야 나온다.
  `-n`(`--numeric`)은 포트를 서비스 이름으로 풀지 않는다(주소·포트를 이름으로 풀려고 하는 것은 `-r`이다) — OPTIONS. 그러니 `ss -tan`은 「TCP 소켓을, 기다리는 것까지 모두, 서비스 이름 대신 번호로」 보인다(옵션 셋을 합친 것)
- 상태 필터에 쓰는 이름은 established, syn-sent, syn-recv, fin-wait-1, fin-wait-2, time-wait, closed, close-wait, last-ack, listening, closing이다 — STATE-FILTER. 소문자에 하이픈으로 잇고, SYN-RECEIVED를 **syn-recv**로, LISTEN을 listening으로 부른다
- 출력에는 기본으로 머리줄이 있다(`-H`가 그것을 없앤다 — OPTIONS). 그러나 **머리줄의 내용과, 상태 칸에 무엇이 찍히는지(예: ESTAB)는 이 페이지가 보이지 않는다**. 출력의 꼴은 강의 p271 화면에만 있다(그 화면은 `| head -5`인데 머리줄 없이 다섯 줄이 나와 있어 그대로 옮길 근거가 되지 못한다)
- SEE ALSO는 TCP 상태의 근거로 RFC 793을 가리킨다 — 지금은 RFC 9293이 대체했다(위 RFC 9293 항목)

쓰인 곳: (phase 77 step 9에서 쓰일 곳) `tcp-connection.tcp-states`(`ss -tan`의 옵션 뜻, 상태를 syn-recv처럼 줄여 부르는 이름), 강의 수정 이력 머리의 「phase 77 step 9」 문단(p270–p271의 `ss -tan`)

## (phase 77 step 9) RFC 1337 — TIME-WAIT Assassination Hazards in TCP [Informational]
https://www.rfc-editor.org/rfc/rfc1337

Informational(1992-05)이고 폐기되거나 고쳐지지 않았다(rfc-editor 상태 2026-11-10). 표준을 정하는 문서가 아니므로 **보조로만** 쓴다 — TIME-WAIT의 사실은 RFC 9293 §3.3.2·§3.4.1·§3.6.1이 근거다(위 RFC 9293 항목).

- TIME-WAIT 동안 기다리는 것은, 연결을 다시 열기 전에 옛 중복 세그먼트가 인터넷에서 사라질 시간을 주려는 것이다 — 서론 (4). 옛 중복 세그먼트가 사라질 시간을 주는 것은 TIME-WAIT의 기능 가운데 하나다 — (F1)
- 이 문서는 TIME-WAIT가 옛 세그먼트나 RST 때문에 일찍 끝나 버리는 위험과 그 대책을 다룬다 — 이 과목은 쓰지 않는다

쓰인 곳: (phase 77 step 9에서 쓰일 곳) `tcp-connection.time-wait`(보조 — 옛 중복 세그먼트가 사라질 시간)

## (phase 78 step 0) RFC 5598 — Internet Mail Architecture [Informational]
https://www.rfc-editor.org/rfc/rfc5598

Informational(2009-07)이고 폐기되거나 고쳐지지 않았다(rfc-editor 상태 2026-11-11). 표준을 정하는 문서가 아니라 인터넷 메일의 구성과 용어를 정리한 문서라, **역할의 이름과 메일이 가는 차례를 확인하는 보조로만** 쓴다 — 프로토콜의 동작은 각 프로토콜의 RFC가 근거다.

- 인터넷 메일의 핵심 표준은 셋이다 — SMTP는 메시지를 인터넷으로 옮기고, IMF(RFC 5322)는 메시지의 꼴을, MIME은 첨부 같은 확장을 정한다 — §1
- 인터넷 메일은 받아 두었다가 다음으로 넘기는(store-and-forward) 서비스다 — §4. 보내는 곳에서 배달될 곳까지는 메시지를 가진 쪽이 다음 곳으로 넘기는 「밀어내기(push)」가 보통이고, 주로 SMTP를 쓴다.
  **배달된 뒤에는** 받는 사람의 메일 프로그램(이나 메시지 저장소)이 POP·IMAP으로 메시지를 **끌어올(pull)** 수 있다 — §4.4
- 역할 이름: MUA(Message User Agent — 사용자를 대신해 메시지를 만들어 제출하고, 받은 메시지를 처리한다), MSA(Mail Submission Agent — 보내는 쪽 MUA가 제출한 메시지를 받는다), MTA(Message Transfer Agent — 메시지를 응용 계층의 한 「홉」씩, IP 라우터처럼 받는 사람 쪽으로 옮긴다),
  MDA(Mail Delivery Agent — 받는 사람의 메일함으로 넘기는 「배달」을 한다), MS(Message Store — 메시지 저장소) — §4.2.1~§4.3.3
- 제출은 예전에는 SMTP로 했고 지금은 별도의 TCP 포트를 쓰는 SUBMISSION을 권한다 — §4.3.1. MTA 사이의 전달은 주로 SMTP이고, 받는 쪽 MTA를 찾는 주된 방법은 DNS의 **MX 레코드**다 — §4.3.2.
  MDA에서 메시지 저장소로 옮기는 데는 POP·IMAP 같은 접근 프로토콜을 쓴다 — §4.3.3. MUA는 메시지 저장소에 POP·IMAP으로 닿고, 저장소는 원격 서버에 있을 수도 MUA와 같은 기계에 있을 수도 있다 — §4.2.2
- 메일함 주소는 `@`로 나뉜 두 부분이다 — 오른쪽은 도메인 이름, 왼쪽은 로컬 부분이고 로컬 부분은 그 도메인만 해석한다 — §3.1. 도메인 이름은 DNS가 정의하고 운영하며, 점으로 나뉜 이름의 오른쪽 끝이 계층의 맨 위다 — §3.3
- MUA는 메시지를 「폴더」로 묶어 정리하곤 하고, IMAP에서는 폴더를 「메일함(mailbox)」이라 부른다 — §4.2.1. 원격 저장소를 다루는 관계로 온라인(원격에 둔 채 접속해 본다)·오프라인(원격에서 완전히 옮겨 온다)·연결 끊김(연결될 때 서로 맞춘다)을 든다 — §4.5

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.email-delivery`(§4.4 — 보낼 때는 밀어내고 배달 뒤에는 POP·IMAP으로 끌어온다, §4.3.2 — MX, §3.1 — 주소의 두 부분, §4.2.2 — 저장소는 원격 서버에도). 역할 이름(MUA·MSA·MTA·MDA)은 쓰지 않는 것을 권한다(step 0 summary)

## (phase 78 step 0) RFC 6409 — Message Submission for Mail
https://www.rfc-editor.org/rfc/rfc6409

Internet Standard(STD 72, 2011-11)이고 폐기되지 않았다(RFC 4409를 대체, RFC 8314가 고쳤다 — rfc-editor 상태 2026-11-11).

- SMTP는 원래 완성된 메시지를 **옮기는(transfer)** 프로토콜이다. 지금은 메일 사용자 에이전트(MUA)가 새 메시지를 메일 전송망에 처음 들여보내는 **제출(submission)**에도 널리 쓰이고, 제출을 받는 프로세스를 MSA라 한다 — §1
- 스팸을 대량으로 내보내는 감염된 기계가 많아, 표준 SMTP 포트(25)로 나가는 트래픽을 막고 모든 제출을 제출 서버로 보내게 하는 곳이 많다 — §1
- 용어: MSA는 MUA에게서 메시지를 받아 배달하거나, SMTP 클라이언트가 되어 MTA로 넘긴다. MTA는 MSA나 다른 MTA에게서 받아 배달하거나 다른 MTA로 넘긴다.
  **배달된 메시지에 닿는 데는 POP3나 IMAP을 쓰고, 메시지를 내보내는 데는 이 제출 프로토콜(이나 SMTP)을 쓴다**(split-MUA 모델) — §2.1
- **587번은 메일 제출용**이고, 이 포트로 받은 메시지는 제출로 본다. 쓰는 프로토콜은 ESMTP(서비스 확장을 쓰는 SMTP)에 이 문서의 조건을 더한 것이다. 25번을 제출에 쓸 수도 있다 — §3.1
- MSA는 기본으로, 인증하지 않은 세션의 `MAIL` 명령에 오류로 답해야 한다(MUST) — §4.3

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.smtp`(§1·§3.1 — 메일 클라이언트가 자기 서버에 처음 넘기는 일은 제출이고 587번, §2.1 — SMTP가 MSA·MTA 사이에도 쓰인다), `app-protocols-mail-file.email-delivery`(§2.1 — 꺼내 오기는 POP3·IMAP, 내보내기는 제출·SMTP)

## (phase 78 step 0) RFC 1939 — Post Office Protocol - Version 3
https://www.rfc-editor.org/rfc/rfc1939

Internet Standard(STD 53, 1996-05)이고 폐기되지 않았다(RFC 1725를 대체, RFC 1957·2449·6186·8314가 고쳤다 — rfc-editor 상태 2026-11-11).

- 작은 기계는 SMTP 서버를 늘 띄워 두거나 늘 네트워크에 붙어 있기 어렵다. 그래서 메일 전송을 하는 기계가 메일을 맡아 두는 곳(maildrop)을 제공하고, **POP3는 작업용 컴퓨터가 서버가 맡아 둔 메일을 가져오게(retrieve)** 한다 — §1
- POP3는 서버에서 메일을 폭넓게 다루려는 것이 아니다 — **보통은 내려받은 뒤 지운다**. 더 발전한(그리고 더 복잡한) 프로토콜로 IMAP4를 든다 — §1
- 이 문서는 클라이언트가 메일을 보내는 방법을 정하지 않는다. 이 문서의 생각에 맞는 방법으로, 클라이언트의 메일 프로그램이 자기 중계 호스트에 **SMTP 연결을 맺어 메일을 넘기는 것**을 든다 — §2
- 서버는 **TCP 110**에서 기다리고, 클라이언트가 TCP 연결을 맺으면 서버가 인사를 보낸다. 명령은 대소문자를 가리지 않는 3~4글자 키워드와 인자이고, 응답은 `+OK`(긍정)나 `-ERR`(부정)로 시작한다. 여러 줄 응답은 마침표 하나만 있는 줄로 끝난다 — §3
- **세 단계**: 인사 뒤 AUTHORIZATION(클라이언트가 자기를 밝히고 인증한다) → 인증되면 서버가 그 메일함을 잠그고 TRANSACTION(클라이언트가 일을 청한다) → 클라이언트가 `QUIT`를 보내면 UPDATE(서버가 잡은 자원을 풀고 인사한 뒤 TCP 연결을 닫는다) — §3, §4
- **명령**: `USER`(메일함 이름)·`PASS`(암호 — `USER`가 성공한 바로 뒤에)로 인증한다 — 설명은 §7, 최소 명령 목록은 §9. `STAT`(메일 수와 전체 크기), `LIST`(메일마다 번호와 크기), `RETR`(그 번호의 메일을 보낸다),
  `DELE`(그 메일에 **지울 표시**만 한다 — 실제로 지우는 것은 UPDATE 단계다), `RSET`(지울 표시를 모두 거둔다), `QUIT` — §5, §6, §9
- `QUIT`로 UPDATE에 들어가야 서버가 지울 표시를 한 메일을 지운다. 클라이언트의 `QUIT` 없이 세션이 끝나면 UPDATE에 들어가지 않고 아무 메일도 지우지 않는다 — §6.
  예 세션의 차례: 서버가 TCP 110에서 기다림 → 연결 → 인사 → 인증 → `STAT` → `LIST` → `RETR 1`·`DELE 1` → `RETR 2`·`DELE 2` → `QUIT`(메일함이 비었다고 답한다) → 연결을 닫는다 — §10(이 예는 인증에 `APOP`을 쓴다. 값은 옮기지 않는다)
- **서버에 남겨 두기와 그 한계**: 클라이언트가 `DELE`를 보내지 않으면(`UIDL`과 함께) IMAP처럼 메일함을 반쯤 영구 보관소로 쓰는 약한 흉내를 낼 수 있고, 클라이언트 프로그램에 「서버에 메일 남기기」 설정이 있기도 하다.
  그러나 IMAP의 다른 기능 — 열어 둔 연결로 새 메일을 확인하기, **서버에 폴더를 여럿 두기** — 은 POP3에 없다 — §8
- (phase 78 step 2) **평문으로 오간다**: `PASS`는 암호를, `RETR`(와 `TOP`)은 메일 내용을 네트워크에 평문(암호화하지 않은 그대로)으로 보낸다 — §13 Security Considerations.
  TLS로 감싼 포트 995는 아래 RFC 8314 항목. 쓰인 곳(phase 78 step 2): `app-protocols-mail-file.pop3`의 마지막 문단(`110`번은 암호와 메일 내용을 암호화하지 않는다)

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.pop3`(§1 — 서버의 메일함에서 가져온다·보통 내려받고 지운다, §3·§4·§5·§6·§9 — TCP 110·세 단계·명령·`DELE`는 UPDATE에서, §10 — 차례, §8 — 남겨 둘 수도 있다·서버에 폴더 여럿은 없다),
`app-protocols-mail-file.email-delivery`(§1·§2 — 보내기는 SMTP, 가져오기는 POP3, 늘 접속해 있지 않아도 서버가 맡아 둔다), `app-protocols-mail-file.imap`(§8 — POP3에 없는 IMAP의 기능), 기출 대조(`exam-notes.md` 「phase 78 step 0」 문단)

## (phase 78 step 0) RFC 9051 — Internet Message Access Protocol (IMAP) - Version 4rev2
https://www.rfc-editor.org/rfc/rfc9051

Proposed Standard(2021-08)이고 폐기되거나 고쳐지지 않았다. RFC 3501(IMAP4rev1, 2003)을 폐기하고 대신한다(rfc-editor 상태 2026-11-11 — RFC 3501 쪽 정보에 obsoleted by RFC 9051).

- IMAP4rev2는 클라이언트가 **서버에 있는 메일에 닿아 다루게** 한다. 메일함(원격의 메시지 폴더)을 로컬 폴더처럼 다룰 수 있고, 오프라인이던 클라이언트가 서버와 다시 맞출 수 있다.
  메일함 만들기·지우기·이름 바꾸기, 새 메일 확인, 메일을 영구히 지우기, 플래그 켜고 끄기, **검색**, 메일의 필요한 부분만 골라 가져오기를 한다 — Abstract
- **IMAP은 메일을 보내는 방법을 정하지 않는다** — 그것은 RFC 6409 같은 메일 제출 프로토콜의 몫이다 — Abstract
- TCP 같은 믿을 수 있는 데이터 흐름을 전제하고, TCP를 쓰면 서버는 **143**(평문 포트)이나 **993**(처음부터 TLS로 감싼 포트)에서 기다린다 — §2.1
- **플래그**: 메일마다 이름 붙은 표시를 0개 이상 단다. 시스템 플래그로 `\Seen`(읽었다)·`\Answered`(답장했다)·`\Flagged`(특별히 표시)·`\Deleted`(나중에 EXPUNGE로 지운다)·`\Draft`(작성 중)가 있다 — §2.3.2.
  영구 플래그는 바꾸면 **동시에 열린 세션과 나중 세션이 모두 그 변화를 본다** — §2.3.2
- 여러 에이전트가 같은 메일함에 동시에 닿아 플래그를 바꿀 수 있고, 서버는 메일함 크기가 바뀌면 알려야 하며 플래그 변화도 알리는 것이 좋다 — §5.2. 같은 메일함에 동시에 닿게 하는 서버는 다른 에이전트가 플래그를 바꾸거나 메일을 지우면 알리는 것이 좋다 — §7
- `INBOX`는 「이 서버에서 이 사용자의 기본 메일함」을 뜻하는 특별한 이름이다 — §5.1. `CREATE`는 메일함을 만들고(§6.3.4), `MOVE`는 메일을 다른 메일함으로 옮기며(§6.4.8), `SEARCH`는 메일함에서 조건에 맞는 메일을 찾는다(§6.4.4)
- IMAP4rev2는 IMAP4rev1(RFC 3501)과 대체로 호환되고, 두 판을 함께 알리는 서버도 있다 — §1.3, 부록 A
- (phase 78 step 2) **메일 내용을 가져오면 `\Seen`이 붙는다**: `FETCH`로 메일 본문(`BODY[]`)을 가져오면 `\Seen` 플래그가 저절로 켜진다. 켜지 않고 보려면 `BODY.PEEK[]`를 쓴다 — §6.4.5
- (phase 78 step 2) **옮기기는 서버에서 일어난다**: `MOVE`는 메일을 대상 메일함 끝으로 옮긴다 — 대상 메일함에 새 메일이 생기고 원래 메일함에서는 빠지며, 플래그와 받은 날짜는 그대로 두는 것이 좋다(SHOULD).
  일부만 옮겨지더라도 메일이 사라지거나 두 메일함에 함께 남지 않게 한다 — §6.4.8.
  플래그는 메일마다 영구(permanent)이거나 그 세션에서만 유효한데, 영구 플래그를 바꾸면 동시에 열린 세션과 나중 세션이 모두 그 변화를 본다 — §2.3.2(위 「플래그」 줄과 같은 절)
- (phase 78 step 2) 메일함 이름은 Net-Unicode로 적으므로 한글 이름도 쓸 수 있다 — §5.1(본문 예 `여행`)

쓰인 곳 (phase 78 step 2): `app-protocols-mail-file.imap`(§6.4.5 — 메일 내용을 가져오면 `\Seen`, §6.4.8 — 옮기면 원래 메일함에서 빠지고 플래그가 따라간다, §5.1 — 한글 메일함 이름), 문항 n199

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.imap`(Abstract — 서버의 메일을 다룬다·메일함은 원격 폴더·검색·보내기는 정하지 않는다, §2.1 — TCP 143·993, §2.3.2·§5.2·§7 — 한 기기의 변화를 다른 세션도 본다, §5.1 — `INBOX`, §6.3.4·§6.4.8·§6.4.4 — 만들기·옮기기·검색, §1.3 — 지금 판은 IMAP4rev2),
`app-protocols-mail-file.email-delivery`(Abstract — 보내기는 제출 프로토콜의 몫), 기출 대조(`exam-notes.md` 「phase 78 step 0」 문단)

## (phase 78 step 0) RFC 8314 — Cleartext Considered Obsolete: Use of Transport Layer Security (TLS) for Email Submission and Access
https://www.rfc-editor.org/rfc/rfc8314

Proposed Standard(2018-01)이고 폐기되지 않았다(RFC 1939·2595·3501·5068·6186·6409를 고쳤고, RFC 8997이 이 문서를 고쳤다 — rfc-editor 상태 2026-11-11). **TLS로 감싼 포트의 번호만** 가져온다 — TLS 자체는 `app-protocols-mgmt-security` 주제(phase 78 step 5)의 몫이다.

- 연결을 맺자마자 TLS 핸드셰이크를 시작하는 별도 포트 방식(Implicit TLS)을 POP·IMAP·메일 제출에 권한다 — §3. 기본 포트: POP3 over TLS(`pop3s`) **995**, IMAP over TLS(`imaps`) **993**, 메일 제출 over TLS(`submissions`) **465** — §3.1~§3.3, §7
- 587번에서 평문으로 시작해 TLS로 바꾸는 방식(STARTTLS)도 널리 쓰여, 한동안 둘 다 구현하라고 한다 — §3.3

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.pop3`(995), `app-protocols-mail-file.imap`(993). 465와 STARTTLS는 쓰지 않는 것을 권한다(기출이 묻지 않는다)
(phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.tls`(§3 — POP3·IMAP·메일 제출도 TLS로 감싸 쓴다: TLS 위에 HTTP 말고도 메일 프로토콜이 얹히는 예), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — 이름이 곧 「TLS로 보호한 것」인 것은 HTTPS)

## (phase 78 step 0) RFC 1635 — How to Use Anonymous FTP [Informational]
https://www.rfc-editor.org/rfc/rfc1635

Informational(FYI 24, 1994-05)이고 폐기되거나 고쳐지지 않았다(rfc-editor 상태 2026-11-11). 표준을 정하는 문서가 아니라 처음 쓰는 사람을 위한 안내다 — **익명 FTP가 있다는 것과 그 계정의 성격만** 가져온다.

- FTP로 두 호스트 사이에 파일을 옮기려면 보통 양쪽에 로그인해야 해서 양쪽의 계정과 암호가 있어야 한다. 그러나 자료를 내주는 보관 사이트(archive site)는 **`anonymous`라는 특별한 계정**으로 누구에게나 자료를 내준다 — 이것이 익명 FTP다 — 「What is FTP?」·「What is Anonymous FTP?」
- `anonymous` 사용자가 할 수 있는 것은 FTP로 로그인하기, 정해진 디렉터리의 목록 보기, 파일 내려받기뿐이고, 보통 그 사이트에 파일을 올리지는 못한다. 전통적으로 암호로 아무 글자열이나 받고, 흔히 `guest`나 자기 전자우편 주소를 쓴다 — 「What is Anonymous FTP?」

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.ftp`(익명 FTP — 계정이 없는 사람도 정해진 파일을 내려받는다), 기출 대조(`exam-notes.md` 「phase 78 step 0」 문단 — 「FTP는 계정으로만 접속한다」는 틀린 보기)

## (phase 78 step 0) RFC 2228 — FTP Security Extensions
https://www.rfc-editor.org/rfc/rfc2228

Proposed Standard(1997-10)이고 폐기되지 않았다(RFC 959를 고쳤다 — rfc-editor 상태 2026-11-11). **「RFC 959의 FTP는 평문으로 보낸다」의 근거로만** 쓴다. 보안 확장의 명령과 이름은 가져오지 않는다.

- RFC 959의 FTP는 `USER`·`PASS` 명령으로 사용자 이름과 암호를 **평문(cleartext)**으로 보내 클라이언트를 인증한다. 익명 FTP 보관소 같은 경우를 빼면, 네트워크를 엿보는 사람이 암호를 훔칠 수 있는 위험이다 — §1
- FTP에는 명령·응답·옮기는 데이터를 **암호화하거나 진짜인지 확인하는 장치가 없다**. 엿보기만으로 민감한 데이터를 볼 수 있고, 능동적인 공격자는 옮기는 데이터를 지우거나 바꿀 수 있다 — §1

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.ftp`(§1 — 사용자 이름·암호와 데이터를 암호화하지 않고 보낸다), 기출 대조(§1 — 익명 FTP 보관소가 있다)

## (phase 78 step 0) RFC 1579 — Firewall-Friendly FTP [Informational]
https://www.rfc-editor.org/rfc/rfc1579

Informational(1994-02)이고 폐기되거나 고쳐지지 않았다(rfc-editor 상태 2026-11-11). 프로토콜을 바꾸지 않고 클라이언트 프로그램의 동작을 권하는 문서다 — **수동 모드를 쓰는 까닭의 근거로** 쓴다.

- FTP는 파일을 실제로 옮기는 데 두 번째 TCP 연결을 쓰고, **기본으로는 서버가 클라이언트 쪽으로 연결을 연다(active open)** — 서버의 20번에서, 클라이언트가 제어 연결에 쓴 것과 같은 포트로.
  그러나 이 문서가 나올 때의 클라이언트는 대부분 전송마다 새 연결을 쓰고, 그때마다 새 포트를 골라 `PORT`로 알린다 — 「Overview and Rational」·「The Gory Details」
- 패킷 필터 방화벽은 보통 아무 포트로나 **들어오는 연결을 허락하지 못해**, 서버가 클라이언트 쪽으로 여는 데이터 연결이 막힌다. 나가는 연결은 다루기 쉽다 — 「Overview and Rational」·「The Gory Details」
- 클라이언트가 `PASV`를 보내면 서버가 임의의 포트에서 기다리고(passive open) 그 번호를 알려 주며, 클라이언트가 그 포트로 연결을 연다 — 데이터 연결이 클라이언트에서 나가는 연결이 된다. 그래서 클라이언트가 `PORT` 대신 `PASV`를 쓰라고 권한다 — 「The Gory Details」·「Recommendation」
- 그러면 이번에는 서버가 임의의 포트로 들어오는 연결을 받아야 한다. 서버는 클라이언트보다 훨씬 적어 지키기 쉽고, **서버가 데이터 연결에 아주 높은 번호의 포트만 쓰도록** 고쳐 그 범위에 위험한 서비스가 없게 할 수 있다 — 「Security Considerations」

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.ftp-modes`(기본은 서버가 20번에서 연결을 연다, 방화벽은 들어오는 연결을 막는다 → `PASV`, 서버가 데이터 연결에 쓸 포트를 좁힌다), 기출 대조(`exam-notes.md` 「phase 78 step 0」 문단 — 수동 모드)

## (phase 78 step 0) RFC 2428 — FTP Extensions for IPv6 and NATs
https://www.rfc-editor.org/rfc/rfc2428

Proposed Standard(1998-09)이고 폐기되거나 고쳐지지 않았다(rfc-editor 상태 2026-11-11). **수동 쪽이 방화벽·NAT에 유리하다는 근거로만** 쓴다 — EPRT·EPSV 명령은 가져오지 않는다.

- `PORT`·`PASV`를 IPv6에서도 쓸 수 있게 바꾼 `EPRT`·`EPSV`를 정한다 — §1
- 수동 쪽(`EPSV`)을 쓰면 방화벽이나 NAT를 지나는 전송에 유리하다. 방화벽은 대개 들어오는 연결을 허락하지 않는데, `PORT`(`EPRT`)를 쓰려면 들어오는 연결이 필요하다(RFC 1579).
  또 `EPRT` 쪽을 쓰면 NAT가 지나가는 트래픽 안에 적힌 주소를 바꿔야 하지만, 수동 쪽은 그럴 필요가 없다 — §4

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.ftp-modes`(§4 — 클라이언트 쪽 방화벽·NAT 때문에 수동 모드를 쓴다)

## (phase 78 step 0) RFC 4252 — The Secure Shell (SSH) Authentication Protocol
https://www.rfc-editor.org/rfc/rfc4252

Proposed Standard(2006-01)이고 폐기되지 않았다(RFC 8308·8332가 고쳤다 — rfc-editor 상태 2026-11-11). **사용자 인증 방식의 이름과 성격만** 가져온다.

- SSH 인증 프로토콜은 SSH 전송 계층 위에서 돌고, 아래 계층이 무결성과 기밀성을 준다고 전제한다 — §1
- **공개 키 인증**(`publickey`)은 모든 구현이 지원해야 하는 유일한 방식이다. 사용자의 **개인 키를 가지고 있다는 것**이 곧 인증이다 — 클라이언트가 개인 키로 만든 서명을 보내고, 서버는 그 키가 그 사용자의 것인지와 서명이 맞는지 확인한다 — §7
- **암호 인증**(`password`)은 구현하는 것이 좋다(SHOULD). 패킷에 암호가 평문으로 실리지만 **패킷 전체를 전송 계층이 암호화한다**(기밀성을 쓸 때) — §8

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.ssh`(§7 — 공개 키 인증, §8 — 암호는 암호화한 통로로 간다), 기출 대조(`exam-notes.md` 「phase 78 step 0」 문단 — SSH는 공개 키 암호를 쓴다)

## (phase 78 step 0) OpenSSH — ssh(1)
https://man7.org/linux/man-pages/man1/ssh.1.html

2026-11-11에 IPv4로 내려받아 읽은 판: OpenSSH 9.9p2(Portable OpenSSH 프로젝트, 바닥줄 July 18, 2024 — man7.org가 2026-08-04에 openssh-9.9p2 타르볼에서 가져옴 — COLOPHON). sshd(8)은 위 「(phase 76) OpenSSH — sshd(8) …」 항목에 있다.

- 이름은 「OpenSSH 원격 로그인 클라이언트」다. 원격 기계에 로그인하고 명령을 실행하는 프로그램이고, 안전하지 않은 네트워크를 사이에 둔 두 호스트 사이에 암호화한 안전한 통신을 주려는 것이다 — NAME, DESCRIPTION
- 접속할 대상은 `[사용자@]호스트이름` 꼴(또는 `ssh://[사용자@]호스트이름[:포트]`)로 적고, 사용자는 여러 방법 가운데 하나로 원격 기계에 자기를 증명해야 한다 — SYNOPSIS, DESCRIPTION. 그러니 `ssh 사용자@호스트` 꼴로 접속한다
- 인증 방법: GSSAPI·호스트 기반·**공개 키**·키보드 대화형·**암호**. 공개 키 인증은 암호화와 복호화에 서로 다른 키를 쓰고 한 키에서 다른 키를 알아낼 수 없는 **공개 키 암호**에 바탕을 둔다 — 사용자가 공개 키·개인 키 한 쌍을 만들고,
  서버는 공개 키를 알며 개인 키는 사용자만 안다. 클라이언트가 개인 키를 가졌다는 것을 증명하고, 서버는 그 공개 키가 그 계정에 허락됐는지 확인한다 — AUTHENTICATION
- 암호 인증에서도 암호는 원격 호스트로 보내지지만, 통신이 모두 암호화되어 있어 네트워크를 엿듣는 사람은 볼 수 없다 — AUTHENTICATION
- 접속한 적 있는 호스트의 키를 사용자의 `~/.ssh/known_hosts`에 저장하고 자동으로 검사한다 — 새 호스트는 자동으로 더하고, 호스트의 키가 바뀌면 경고하고 암호 인증을 막아 서버 위장·중간자 공격을 막는다 — AUTHENTICATION
- **서버에 처음 접속할 때 서버의 공개 키 지문(fingerprint)을 사용자에게 보인다**(StrictHostKeyChecking을 끄지 않았다면). 지문을 이미 알면 맞춰 보고 키를 받아들이거나 거부할 수 있다 — VERIFYING HOST KEYS.
  화면의 실제 꼴은 이 페이지가 보이지 않는다 — 아래 Microsoft Learn 「Get started with OpenSSH for Windows」의 예가 보인다

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.ssh`(DESCRIPTION — `ssh 사용자@호스트`, AUTHENTICATION — 공개 키 암호·암호도 암호화돼 간다·`known_hosts`, VERIFYING HOST KEYS — 처음 접속할 때 지문을 보인다)

## (phase 78 step 0) Microsoft Learn — OpenSSH for Windows overview, Get started with OpenSSH for Windows
https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh-overview
https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse

2026-11-11에 읽은 판(페이지의 `updated_at`): overview 2025-05-01(`ms.date` 2025-02-20), Get started 2026-09-08(`ms.date` 2025-09-04). 둘 다 Windows Server 2019·2022·2025와 Windows 10·11을 대상으로 적는다.

- OpenSSH는 원격 시스템을 관리하는 SSH 도구의 오픈 소스판이다. **Windows 10 빌드 1809와 Windows Server 2019부터** Windows에서 주문형 기능(feature on demand)으로 쓸 수 있다.
  기본 설치 상태는 판마다 다르다 — Windows Server 2025는 설치돼 있지만 켜져 있지 않고, Windows Server 2019·2022와 Windows 10 1809 이후는 선택 기능으로 설치해 켠다 — overview
- SSH는 클라이언트-서버 구조다 — 사용자가 일하는 시스템이 클라이언트, 원격으로 관리되는 시스템이 서버다. Windows의 OpenSSH에는 `ssh`(클라이언트), `sshd`(서버 — 원격으로 관리되는 시스템에서 돌아야 한다), `ssh-keygen`(인증 키를 만든다), `scp`·`sftp` 등이 들어 있다 — overview
- OpenSSH는 SSH 프로토콜로 원격 로그인하는 연결 도구이고, 클라이언트와 서버 사이의 트래픽을 모두 암호화해 엿듣기·연결 가로채기 같은 공격을 막는다 — Get started 머리
- OpenSSH Server를 설치하면 들어오는 SSH 트래픽을 **TCP 22번**에서 받는 방화벽 규칙이 만들어진다 — Get started
- PowerShell에서 `ssh domain\username@servername` 꼴로 접속한다. 처음 접속하면 그 호스트가 진짜인지 확인할 수 없다는 말과 **호스트 키의 지문(SHA256)**을 보이고 **계속 접속할지(yes/no)** 묻는다.
  `yes`를 입력하면 그 서버가 클라이언트의 알려진 SSH 호스트 목록에 들어가고, 이어서 암호를 묻는다(입력하는 글자는 화면에 보이지 않는다) — Get started 「Connect to OpenSSH Server」

- (phase 81 step 7, 2026-11-18 IPv4로 다시 받아 읽음 — overview는 위와 같은 판(`updated_at` 2025-05-01, `ms.date` 2025-02-20, 한국어판 `updated_at` 2026-01-21), 적용 대상 Windows Server 2025·2022·2019, Windows 11·10) **`sftp`**: overview의 들어 있는 명령 목록은 `sftp`를 SFTP(Secure File Transfer Protocol)를 제공하고 SSH 위에서 동작하는 것으로, `scp`를 SSH 위에서 동작하는 파일 복사 도구로 적는다(한국어판은 「보안 파일 전송 프로토콜」).
  문제 해결 문서 「Troubleshoot common SFTP issues when using OpenSSH」(https://learn.microsoft.com/en-us/troubleshoot/windows-server/system-management-components/troubleshoot-sftp-issues-using-openssh — `ms.date` 2026-02-12, `updated_at` 2026-02-19, 한국어판 `updated_at` 2026-10-14, 적용 대상: 지원되는 Windows Server·Windows 클라이언트)는 Windows의 OpenSSH가 SFTP 기능을 준다고 적고,
  OpenSSH 서버의 설정 파일 `sshd_config`의 `Subsystem sftp sftp-server.exe` 줄과 「OpenSSH SSH Server」 서비스를 다시 시작하는 차례로 SFTP 문제를 다룬다 — 그러니 Windows에서 SFTP 연결을 받는 쪽은 OpenSSH 서버다. 위 「(phase 81 step 4) … IIS의 FTP 서버」 항목의 SFTP 줄(IIS의 FTP 서비스는 SFTP를 내놓지 않는다)과 이어, 본문은 「Windows에서 SFTP는 IIS가 아니라 OpenSSH가 맡는다」로 쓴다(두 문서를 이은 말)
  (phase 81 step 7) 쓰인 곳: `windows-server-roles.ftp-server`(SFTP의 뜻과 이름, OpenSSH의 `sftp`와 OpenSSH 서버가 SFTP를 맡는다), 문항 n297의 해설, 도식 `iis-ftp-site`의 SFTP 시나리오
쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.ssh`(overview — Windows에도 OpenSSH가 들어 있다, Get started — 처음 접속할 때 지문을 보이고 계속할지 묻는다·TCP 22), 기출 대조(`exam-notes.md` 「phase 78 step 0」 문단 — SSH는 Linux·Unix만의 것이 아니다)

## (phase 78 step 0) Microsoft Learn — Configuring FTP Firewall Settings in IIS 7, FTP Firewall Support `<firewallSupport>`
https://learn.microsoft.com/en-us/iis/publish/using-the-ftp-service/configuring-ftp-firewall-settings-in-iis-7
https://learn.microsoft.com/en-us/iis/configuration/system.ftpserver/firewallsupport

2026-11-11에 읽은 판(페이지의 `updated_at`): 둘 다 2025-12-20(`ms.date`는 2008-01-15와 2016-09-26). Windows Server의 FTP 서버(IIS의 FTP 서비스 — 앞 문서는 FTP 7.0·7.5를, 뒤 문서는 IIS 7.5~10.0을 대상으로 적고 IIS 10.0까지 바뀌지 않았다고 한다)의 문서다.
**능동·수동 데이터 연결의 이름과 수동 모드용 포트 범위의 근거로만** 쓴다 — IIS의 설정 절차와 값은 가져오지 않는다.

- FTP 클라이언트마다 연결 둘이 있어야 한다 — 명령이 오가는 제어 채널(보통 21번)과, 디렉터리 목록·파일 올리기·내려받기 같은 데이터가 오가는 데이터 채널. 방화벽에서 21번만 열면 로그인은 되지만 목록을 받거나 파일을 옮기지 못한다 — 앞 문서 「More Information about Working with Firewalls」
- 데이터 연결을 맺는 방식은 둘이고, 같은 절은 이를 「두 모드」라 부른다. **능동 데이터 연결(active)**: 클라이언트가 데이터 채널용 포트를 열어 기다리고 서버가 그 포트로 연결을 연다(보통 서버의 20번에서). 예전에는 이것이 기본이었지만 인터넷 환경에서 잘 동작하지 않아 이제 권하지 않는다.
  **수동 데이터 연결(passive)**: 서버가 데이터 채널용 포트를 열어 기다리고 클라이언트가 그 포트로 연결을 연다. 인터넷 환경에서 훨씬 잘 동작하고 RFC 1579가 권한다 — 앞 문서 같은 절
- 수동 연결을 `PASV`로 맺으면 서버는 자기 IP 주소와 포트가 담긴 응답을 보낸다. 서버 관리자는 수동 연결의 데이터 채널에 쓸 **포트 범위**(가장 낮은 포트와 가장 높은 포트)를 서버 단위로 정해 둘 수 있고, 그 범위를 방화벽에서도 열어야 한다.
  범위를 「0-0」으로 두면 Windows TCP/IP의 임시(동적) 포트 범위를 쓴다 — 뒤 문서 Overview·Attributes, 앞 문서 「Step 1: Configure the Passive Port Range for the FTP Service」

쓰인 곳: (phase 78 step 0에서 쓰일 곳) `app-protocols-mail-file.ftp-modes`(능동·수동이라는 이름과 누가 연결을 여는지, 능동이 예전의 기본, 서버가 수동 모드용 포트 범위를 정해 둔다), 기출 대조(`exam-notes.md` 「phase 78 step 0」 문단 — 수동 모드)

## (phase 78 step 5) RFC 3410 — Introduction and Applicability Statements for Internet-Standard Management Framework [Informational]
https://www.rfc-editor.org/rfc/rfc3410

Informational(2002-12)이고 폐기되지 않았다(RFC 2570을 대체 — rfc-editor 상태 2026-11-11). SNMP 관리 체계의 세 판(SNMPv1·SNMPv2·SNMPv3)을 한데 소개하는 안내 문서이고, 자세한 문서와 어긋나면 자세한 문서를 따르라고 스스로 적는다 — §1.
그래서 **판들의 관계와 표준 상태, 그리고 표준 문서(STD 62)의 사실을 확인하는 보조로** 쓴다.

- 관리 체계의 기본 구성은 판과 상관없이 같다 — 관리받는 노드 여럿(노드마다 관리 정보를 원격으로 다루게 해 주는 SNMP 개체가 있고, 예부터 **에이전트**라 부른다), 관리 응용을 가진 SNMP 개체 하나 이상(예부터 **매니저**),
  두 개체 사이에 관리 정보를 나르는 관리 프로토콜, 그리고 관리 정보 — §2.1
- 관리 정보는 **관리 객체**들의 모음으로 보고, 그 모음이 놓인 가상의 정보 저장소를 **MIB**(Management Information Base)라 부른다. 관련 있는 객체들은 **MIB 모듈**이라는 문서 단위로 정의한다 — §7.1.
  MIB 모듈은 관리받는 노드의 계측 장치가 지니는 관리 정보를 정의하고, 그 정보는 에이전트가 원격으로 닿을 수 있게 해 주며, 관리 프로토콜이 나르고 관리 응용이 다룬다 — §6.2
- 전송: 여러 전송 방식(전송 매핑)이 정의돼 있지만 **UDP 위에 싣는 방식이 우선**(preferred)이다. 다른 방식을 쓰는 시스템도 UDP 방식으로 닿을 수 있게 해 두는 것이 좋다 — §7.3
- SNMPv1(옛 STD 15, RFC 1157)이 정의한 동작은 get·get-next·get-response·set-request·trap이고, 비연결형 전송 위에 얹는 것이 보통이다 — §3.3
- SNMPv1은 인증 방식을 여럿 둘 자리만 만들고 실제로는 **커뮤니티 문자열**에 기댄 아주 단순한 인증 하나만 정의했다. 처음부터 알려진 근본적인 약점이다 — §3.4
- SNMPv2는 v1보다 데이터형(64비트 카운터), 효율(get-bulk), **확인 응답을 받는 알림(inform)**, 오류 처리를 늘렸지만, 처음 목표였던 보안 — 인증(보낸 쪽 확인·메시지 무결성·일부 재전송 방지), 기밀성, 접근 제어 — 과 그 원격 관리를 채우지 못했다 — §4.
  커뮤니티 기반 SNMPv2(**SNMPv2c**, RFC 1901)가 가장 많은 지지를 받았지만 **보안과 관리 체계가 없었다** — §5. SNMPv3는 SNMPv2에 보안과 관리 기능을 더한 것으로 볼 수 있다 — §5
- **SNMPv1·SNMPv2c의 메시지는 평문 커뮤니티 문자열에 기댄 단순한 인증만 지원해 근본적으로 안전하지 않다.** 강한 보안을 담은 SNMPv3 문서가 표준(full Standard)이 되자 SNMPv1(옛 STD 15)과 실험 단계의 SNMPv2c(RFC 1901)는
  보안의 약점 때문에 Historic이 됐다 — SNMPv3가 쓸 판이라는 것을 분명히 하려는 것이다 — §8.2(작업 그룹의 권고는 §8.3)
- SNMPv3 문서는 STD 62로 묶인다 — 구조(RFC 3411), 메시지 처리(RFC 3412), 응용(RFC 3413), 사용자 기반 보안 모델 USM(RFC 3414), 뷰 기반 접근 제어 VACM(RFC 3415), 프로토콜 동작(RFC 3416), 전송 매핑(RFC 3417), SNMP 개체 자신의 MIB(RFC 3418) — §6.3, §6.4, §7.4.
  응용의 다섯 종류는 명령 생성기·명령 응답기·알림 발신기·알림 수신기·프록시 전달기다 — §7.7
- USM은 키를 쓴 해시로 메시지가 도중에 바뀌지 않았는지 지키고(무결성), 그로써 보낸 쪽이 맞는지도 확인하며, 느슨하게 맞춘 시각 값으로 일부 재전송 공격을 막는다. 내용을 감추는 암호화도 쓸 수 있다 — §7.8

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.snmp`(§2.1 — 매니저와 에이전트, §7.3 — UDP가 우선), `app-protocols-mgmt-security.mib`(§7.1·§6.2 — MIB와 MIB 모듈),
`app-protocols-mgmt-security.snmp-versions`(§3.4·§4·§5·§8.2 — 커뮤니티 문자열이 평문이라 v1·v2c는 안전하지 않아 Historic, v3가 보안을 더했다, §7.8 — USM), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — v2c는 암호화·인증을 기본으로 주지 않는다)

## (phase 78 step 5) RFC 3411 — An Architecture for Describing Simple Network Management Protocol (SNMP) Management Frameworks
https://www.rfc-editor.org/rfc/rfc3411

Internet Standard(STD 62, 2002-12)이고 폐기되지 않았다(RFC 2571을 대체, RFC 5343·5590이 고쳤다 — rfc-editor 상태 2026-11-11).

- SNMP 관리 체계는 노드 여럿(노드마다 명령 응답기·알림 발신기 응용을 가진 SNMP 개체 — 예부터 **에이전트**), 명령 생성기·알림 수신기 응용을 가진 SNMP 개체 하나 이상(예부터 **매니저**), 그 사이에 관리 정보를 나르는 관리 프로토콜로 이루어진다.
  매니저 쪽 응용이 관리받는 장치를 **감시하고 제어한다**. 관리받는 장치는 호스트·라우터·터미널 서버 같은 것이고, 그 장치의 관리 정보에 닿아 감시·제어한다 — §1.2
- 응용의 종류: 명령 생성기는 관리 데이터를 살피고 바꾼다, 명령 응답기는 관리 데이터에 닿게 해 준다, 알림 발신기는 묻지 않은(비동기) 메시지를 먼저 보낸다, 알림 수신기는 그 메시지를 처리한다, 프록시 전달기는 개체 사이에서 메시지를 넘긴다 — §3.1.3.
  명령 생성기·알림 수신기를 가진 개체를 예부터 SNMP 매니저(§3.1.3.1), 명령 응답기·알림 발신기를 가진 개체를 예부터 SNMP 에이전트라 부른다(§3.1.3.2). 에이전트의 그림에서 명령 응답기는 MIB 계측 장치(MIB instrumentation)와 이어진다 — §3.1.3.2 그림
- PDU의 갈래: 읽기(`GetRequest`·`GetNextRequest`·`GetBulkRequest`), 쓰기(`SetRequest`), 응답(`Response`·`Report`), 알림(`SNMPv2-Trap`·`InformRequest`). 받는 쪽이 응답을 돌려보내야 하는 것은 Get 계열·`SetRequest`·`InformRequest`이고,
  트랩은 확인 응답을 받지 않는다 — §2.8
- 보안 수준은 셋이다 — 인증도 암호화도 없음(noAuthNoPriv), 인증만(authNoPriv), 인증과 암호화(authPriv) — §3.4.3

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.snmp`(§1.2 — 매니저가 호스트·라우터 같은 장치를 감시·제어한다, §3.1.3 — 매니저와 에이전트가 하는 일), `app-protocols-mgmt-security.snmp-operations`(§2.8 — 메시지의 갈래와 응답이 있는 것·없는 것),
`app-protocols-mgmt-security.snmp-versions`(§3.4.3 — v3도 보안 수준을 고른다), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — SNMP는 장비를 관리·감시한다)

## (phase 78 step 5) RFC 3416 — Version 2 of the Protocol Operations for the Simple Network Management Protocol (SNMP)
https://www.rfc-editor.org/rfc/rfc3416

Internet Standard(STD 62, 2002-12)이고 폐기되지 않았다(RFC 1905를 대체 — rfc-editor 상태 2026-11-11). 메시지 이름은 이 문서대로 쓴다.

- SNMP 메시지 프로토콜의 첫 판 SNMPv1은 RFC 1157(STD 15)이, **표준 트랙이 아닌** SNMPv2c는 RFC 1901과 RFC 3417이, SNMPv3는 RFC 3417·3412·3414가 정한다 — §1
- 명령 생성기·알림 수신기를 가진 개체(예부터 「매니저」)가 명령 응답기·알림 발신기를 가진 개체(예부터 「에이전트」)와 통신한다. 이 프로토콜의 목적은 **관리 정보와 동작을 나르는 것**이다 — §2
- 변수(variable)의 이름은 그 객체 형의 OBJECT IDENTIFIER 뒤에 인스턴스를 가리키는 조각을 이어 붙인 것이다 — §2.1
- 요청을 받은 쪽은 보통 응답을 만들어 보낸다. 응답이 제때 오지 않을 때 다시 보낼지는 요청을 보낸 응용이 정한다 — §2.2
- `GetRequest`를 받은 쪽은 적힌 이름과 정확히 맞는 변수의 **값을 채워** `Response`를 만든다 — §4.2.1. `GetNextRequest`를 받은 쪽은 이름의 사전 순서로 바로 다음인 변수의 이름과 값을 돌려준다 — §4.2.2
- `Response`는 `GetRequest`·`GetNextRequest`·`GetBulkRequest`·`SetRequest`·`InformRequest`를 받았을 때만 만든다 — §4.2.4
- `SetRequest`를 받은 쪽은 변수들을 모두 검사해 문제가 없으면 값을 바꾸고(하나라도 바꾸지 못하면 나머지도 되돌린다) 결과를 `Response`로 요청한 쪽에 돌려준다 — §4.2.5
- `SNMPv2-Trap`은 알림 발신기를 대신해 보내고, 멀리 있는 알림 수신기에 일이 생겼거나 어떤 상태가 됐음을 알린다. **확인 응답이 없다**. 보낼 곳은 그 개체가 구현에 따라 정한다 — §4.2.6
- `InformRequest`도 같은 목적의 알림이지만 받은 쪽이 `Response`를 돌려보낸다(확인 응답이 있는 알림. 그래도 도착을 보장하지는 않는다) — §4.2.7
- 트랩과 인폼의 앞 두 변수는 `sysUpTime.0`과 `snmpTrapOID.0`이다 — §4.2.6, §4.2.7

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.snmp-operations`(메시지 이름과 방향 — §4.2.1·§4.2.2·§4.2.4·§4.2.5·§4.2.6·§4.2.7), `app-protocols-mgmt-security.mib`(§2.1 — 이름 뒤의 인스턴스 조각, §4.2.1 — 에이전트가 값을 채워 돌려준다),
`app-protocols-mgmt-security.snmp`(§2 — 매니저와 에이전트, 관리 정보를 나른다), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단)

## (phase 78 step 5) RFC 3417 — Transport Mappings for the Simple Network Management Protocol (SNMP), RFC 3430 — SNMP Over TCP Transport Mapping [Experimental], RFC 6353 — TLS Transport Model for SNMP
https://www.rfc-editor.org/rfc/rfc3417
https://www.rfc-editor.org/rfc/rfc3430
https://www.rfc-editor.org/rfc/rfc6353

상태(rfc-editor 2026-11-11): RFC 3417은 Internet Standard(STD 62, 2002-12 — RFC 1906을 대체, RFC 4789·5590이 고쳤다), RFC 3430은 Experimental(2002-12), RFC 6353은 Internet Standard(2011-07 — RFC 5953을 대체, RFC 8996·9456이 고쳤다). 셋 다 폐기되지 않았다.
**SNMP가 어떤 전송 위에서 도는지만** 가져온다. TLS 전송 모델의 동작은 가져오지 않는다.

- 전송 매핑이 여럿 정의돼 있지만, IPv4를 지원하는 시스템에서는 **UDP over IPv4 매핑이 우선**이고 IPv4를 구현한 시스템은 이 매핑을 **반드시 구현해야 한다**(MUST). 다른 매핑을 지원하는 시스템도 UDP 매핑으로 닿게 하는 것이 좋다(SHOULD) — RFC 3417 §1, §3.
  이 문서가 정의하는 다른 매핑은 OSI·AppleTalk(DDP)·IPX 위다 — §4~§6
- 메시지 하나는 UDP 데이터그램 하나에 싣는다 — RFC 3417 §3.1
- **명령 응답기(에이전트 쪽)는 UDP 161에서, 알림 수신기(매니저 쪽)는 UDP 162에서** 기다리게 설정하기를 권한다 — RFC 3417 §3.2
- SNMPv1만으로는 안전하지 않다 — 네트워크 자체가 안전해도 누가 객체를 읽고 바꿀 수 있는지 통제하지 못한다. SNMPv3의 USM(RFC 3414)·VACM(RFC 3415)을 쓰기를 권한다 — RFC 3417 §12
- TCP 매핑(RFC 3430): **덧붙인 선택적인 매핑**이고 주로 대량 전송을 위해 정의했다. 이 매핑을 구현한 엔진도 UDP 매핑을 **반드시 함께 구현해야 한다**. TCP는 자원을 더 쓰므로 TCP 연결이 너무 많으면 새 연결을 거절해 UDP로 돌아가게 할 수 있다 — RFC 3430 §1, §2
- TLS 전송 모델(RFC 6353): SNMP 메시지를 TCP 위의 TLS나 UDP 위의 DTLS로 보내는 방식이고, 기본 포트는 10161(명령)·10162(알림)다 — RFC 6353 §1, §10
- 곧 표준의 SNMP는 **UDP가 기본이자 반드시 갖출 전송**이고, TCP 위로 보내는 방식은 따로 정의한 선택이다

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.snmp`(RFC 3417 §1·§3 — UDP가 우선이고 반드시 구현, §3.2 — 에이전트는 UDP 161, RFC 3430 — TCP는 덧붙인 선택), `app-protocols-mgmt-security.snmp-operations`(RFC 3417 §3.2 — 트랩은 UDP 162),
`app-protocols-mgmt-security.snmp-versions`(RFC 3417 §12 — v1만으로는 안전하지 않다), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — 「TCP를 쓴다」가 틀린 까닭과 문항에서 조심할 것)

## (phase 78 step 5) RFC 1157 — A Simple Network Management Protocol (SNMP) [Historic — 역사 기록으로만 쓴다], RFC 1901 — Introduction to Community-based SNMPv2 [Historic — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc1157
https://www.rfc-editor.org/rfc/rfc1901

상태(rfc-editor 2026-11-11): RFC 1157은 Historic(1990-05, 옛 STD 15 — RFC 1098을 대체), RFC 1901은 Historic(1996-01, 문서 머리의 분류는 Experimental — 「Internet standard가 아니다」라고 스스로 적는다).
둘 다 RFC 3410 §8.2대로 보안의 약점 때문에 Historic이 됐다. **SNMP의 첫 판과 v2c가 무엇이었는지, 그리고 지금 표준과 같은 사실을 확인하는 데만** 쓴다.

- SNMP 구조: 관리국(network management station)의 관리 응용이 네트워크 요소를 감시·제어하고, 호스트·게이트웨이·터미널 서버 같은 네트워크 요소의 **관리 에이전트**가 관리국이 요청한 관리 기능을 수행한다. SNMP는 둘 사이에 관리 정보를 주고받는 데 쓴다 — RFC 1157 §3
- 목표: 에이전트가 하는 관리 기능의 수와 복잡도를 줄여, 에이전트 소프트웨어를 만드는 비용을 낮추는 것 — §3.1(1). 감시·제어의 방식이 예상하지 못한 운영·관리 측면까지 넓혀 받아들일 수 있게 하는 것 — §3.1 둘째 목표. 특정 호스트·게이트웨이의 구조와 상관없게 하는 것 — §3.1 셋째 목표
- 에이전트의 일을 변수를 살피는 것(get)과 바꾸는 것(set) 둘로 본다 — §3.2.3
- **네트워크 상태를 자세히 감시하는 일은 주로 관리국 쪽의 폴링으로 하고, 묻지 않은 메시지(트랩) 몇 가지가 폴링을 언제 어디에 할지 이끈다.** 묻지 않은 메시지 수를 적게 두는 것은 단순함과, 네트워크 관리가 만들어 내는 트래픽을 줄이는 목표에 맞는다 — §3.2.3
- SNMP 메시지를 주고받는 데는 믿을 수 없는 데이터그램 서비스면 충분하고 메시지 하나는 전송 데이터그램 하나다. 이 문서는 UDP로 주고받는 것을 정하지만 다른 전송에도 대체로 맞는다 — §3.2.4
- 에이전트와 응용 개체의 묶음을 **SNMP 커뮤니티**라 하고, 커뮤니티마다 옥텟 문자열로 된 **커뮤니티 이름**이 있다. 메시지가 그 커뮤니티의 것인지 가리는 규칙을 인증 방식이라 한다. 모든 메시지를 진짜로 보는 아주 단순한 인증만 지원하는 구현도 있을 수 있다 — §3.2.5
- SNMP는 에이전트의 MIB 변수를 살피거나 바꾸는 **응용 프로토콜**이다. 메시지 하나는 UDP 데이터그램 하나에 실리고 **판 번호·커뮤니티 이름·PDU**로 이루어진다. 트랩이 아닌 메시지는 **UDP 161**에서, 트랩은 **UDP 162**에서 받는다. 다섯 PDU(GetRequest·GetNextRequest·GetResponse·SetRequest·Trap)를 모두 지원해야 한다 — §4.
  (커뮤니티 이름이 평문이라는 것은 위 RFC 3410 §8.2)
- 트랩의 예: 에이전트가 맡은 통신 링크 가운데 하나가 끊겼음(linkDown)·다시 살아났음(linkUp), 다시 시작함(coldStart·warmStart), 인증 실패 — §4.1.6
- 이 문서는 보안을 다루지 않는다 — 「Security Considerations」 절
- RFC 1901: SNMPv1의 커뮤니티 기반 관리 체계를 SNMPv2에 그대로 쓴 것을 **커뮤니티 기반 SNMPv2(SNMPv2c)**라 부른다. 메시지 꼴도 v1에서 가져오고 판 번호만 바꿨다(판 번호·커뮤니티 이름·PDU) — RFC 1901 §3. 보안은 다루지 않는다 — §4. 전송은 UDP 매핑이 우선이다 — §2.5

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.snmp`(RFC 1157 §3 — 관리국과 에이전트, §4 — 응용 프로토콜·UDP 161, 첫 판이 RFC 1157이고 지금은 Historic), `app-protocols-mgmt-security.snmp-operations`(§3.2.3 — 감시는 주로 폴링·트랩이 폴링을 이끈다, §4 — 트랩은 162, §4.1.6 — linkDown),
`app-protocols-mgmt-security.snmp-versions`(§3.2.5·§4 — 커뮤니티 이름이 메시지의 한 칸, RFC 1901 §3 — v2c), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — 폴링, RFC 1157에 규정), `exam-notes.md` E32(§3.1)

## (phase 78 step 5) RFC 3414 — User-based Security Model (USM) for version 3 of the Simple Network Management Protocol (SNMPv3)
https://www.rfc-editor.org/rfc/rfc3414

Internet Standard(STD 62, 2002-12)이고 폐기되지 않았다(RFC 2574를 대체, RFC 5590이 고쳤다 — rfc-editor 상태 2026-11-11). **v3가 무엇을 지키는지만** 가져온다. 알고리즘 이름과 키 관리는 가져오지 않는다.

- 사용자(사용자 이름으로 가리킨다)를 단위로 보안 정보를 묶는 사용자 기반 보안 모델이다 — §1
- 막으려는 주된 위협은 둘이다 — 오가는 메시지를 허락받지 않은 쪽이 바꿔치기하는 것(정보 변경), 권한이 있는 다른 사용자인 척하는 것(가장). 덜 중요한 위협 — 에이전트와 관리국 사이를 엿보는 것(누설), 메시지를 일부러 늦추거나 다시 보내거나 순서를 바꾸는 것 — 도 어느 정도 막는다.
  서비스 거부와 트래픽 분석은 막지 않는다 — §1.1
- 목표: 받은 메시지가 도중에 바뀌지 않았는지, 메시지가 주장하는 사용자가 맞는지, 최근에 만든 메시지인지 확인하고, 필요하면 내용을 엿보지 못하게 한다 — §1.2
- 서비스: 데이터 무결성, 데이터 출처 인증, 데이터 기밀성, 메시지 시각 확인과 제한된 재전송 방지. 기밀성은 무결성·출처 인증과 함께일 때만 쓸 수 있다 — §1.3
- 이 문서는 인증과 암호화 방식을 하나씩 정하면서, 다른 방식으로 바꾸거나 더할 수 있게 했다 — §1

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.snmp-versions`(§1.1·§1.2·§1.3 — v3는 사용자마다 인증(바뀌지 않았는지·보낸 사용자가 맞는지)과 암호화를 더한다), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단)

## (phase 78 step 5) RFC 2578 — Structure of Management Information Version 2 (SMIv2), RFC 3418 — Management Information Base (MIB) for the Simple Network Management Protocol (SNMP), RFC 1213 — MIB-II
https://www.rfc-editor.org/rfc/rfc2578
https://www.rfc-editor.org/rfc/rfc3418
https://www.rfc-editor.org/rfc/rfc1213

상태(rfc-editor 2026-11-11): RFC 2578은 Internet Standard(STD 58, 1999-04 — RFC 1902를 대체), RFC 3418은 Internet Standard(STD 62, 2002-12 — RFC 1907을 대체), RFC 1213은 Internet Standard(STD 17, 1991-03 — RFC 1158을 대체, RFC 2011~2013이 고쳤다). 셋 다 폐기되지 않았다.
**OID의 꼴과 sysUpTime의 이름·번호·뜻만** 가져온다. 데이터형·매크로 문법은 가져오지 않는다.

- 관리 정보는 MIB라는 가상의 정보 저장소에 놓인 관리 객체들의 모음으로 보고, 관련 객체들은 MIB 모듈로 정의한다 — RFC 2578 §1
- **OBJECT IDENTIFIER(OID)** 값은 음이 아닌 수를 차례로 늘어놓은 것이고, 수 하나하나를 하위 식별자(sub-identifier)라 부른다. 첫 하위 식별자는 0(ccitt)·1(iso)·2(joint-iso-ccitt) 가운데 하나다 — RFC 2578 §3.5
- 뿌리에서 내려오는 길: `org`는 `iso` 아래 3, `dod`는 `org` 아래 6, `internet`은 `dod` 아래 1, `mgmt`는 `internet` 아래 2, `mib-2`는 `mgmt` 아래 1 — RFC 2578 §2(SNMPv2-SMI 정의. 「iso」 = 1이라는 주석도 같은 자리에 있다).
  IANA가 맡는 인터넷 갈래는 `1.3.6.1`로 시작하고, `mgmt(2)` 아래는 「표준」 객체를 가리키는 데 쓴다 — RFC 2578 §4
- `system` 그룹은 `mib-2` 아래 1이고(모든 관리받는 시스템에 공통인 객체의 모음), `sysUpTime`은 `system` 아래 3이다 — RFC 3418 §2. RFC 1213(MIB-II)도 같은 자리에 정의한다 — RFC 1213의 system 그룹(`system ::= { mib-2 1 }`, `sysUpTime ::= { system 3 }`)
- **`sysUpTime`의 뜻: 그 시스템의 네트워크 관리 부분이 마지막으로 다시 초기화된 뒤 흐른 시간이고, 단위는 100분의 1초(TimeTicks)다. 읽기만 된다** — RFC 3418 §2. (장비 전체가 켜진 뒤의 시간이 아니라 **관리 부분(에이전트)**이 다시 시작한 뒤의 시간이다)
- **계산 — 손으로 두 번 맞췄다**: iso(1) → org(3) → dod(6) → internet(1) → mgmt(2) → mib-2(1) → system(1) → sysUpTime(3) — 그래서 `1.3.6.1.2.1.1.3`이다
- 표 안에 있지 않은 객체(스칼라 객체)의 인스턴스는 객체 이름 뒤에 **하위 식별자 0을 하나 붙여** 가리킨다 — RFC 2578 §7. 그래서 값을 물을 때의 이름은 `1.3.6.1.2.1.1.3.0`(`sysUpTime.0`)이다. RFC 3416 §4.2.6도 트랩의 첫 변수를 `sysUpTime.0`으로 적는다

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.mib`(RFC 2578 §1 — MIB·MIB 모듈, §3.5 — OID의 꼴, §2·§4 — 가지 이름과 번호, §7 — `.0`, RFC 3418 §2 — `system`·`sysUpTime`과 그 뜻)

## (phase 78 step 5) RFC 6632 — An Overview of the IETF Network Management Standards [Informational]
https://www.rfc-editor.org/rfc/rfc6632

Informational(2012-06)이고 폐기되지 않았다(rfc-editor 상태 2026-11-11). IETF 네트워크 관리 표준을 훑는 안내 문서라 **표준 문서의 사실을 확인하고 쓰임의 예를 대는 보조로만** 쓴다.

- SNMP는 **매니저·에이전트·MIB** 세 개념 위에 선다. 어떤 구성에서도 매니저 노드가 적어도 하나 있어 관리 소프트웨어를 돌리고, 보통 **브리지·라우터·서버 같은 네트워크 장비가 에이전트를 갖춘다**. 에이전트는 자기 노드의 자원과 활동을 반영하는 객체들의 로컬 MIB에 닿게 해 준다 — §2.1.2
- 에이전트는 알림을 만들어 묻지 않은 메시지로 관리 응용에 보낼 수 있다. SNMPv2가 인폼 PDU 등을 더했다. **SNMPv1·SNMPv2 모두 보안 기능이 충분하지 않아** 그 약점을 메우려고 SNMPv3가 나왔다 — §2.1.2
- 트랩·인폼으로 알린 내용이 뒤따르는 폴링을 이끌 수 있다. SNMP는 장애·성능 데이터 감시에 널리 쓰이고 상태를 폴링하는 데에도 잘 맞는다. 표준 MIB 모듈의 카운터는 **여러 인터페이스로 드나든 바이트·패킷 수**를 감시하는 데 특히 쓸모가 있었다.
  장비가 살아 있는지 보려고 `sysUpTime`(장비의 네트워크 관리 부분이 다시 초기화된 뒤 흐른 시간)을 폴링하곤 한다 — §2.1.2

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.snmp`(§2.1.2 — 장비가 에이전트를 갖춘다), `app-protocols-mgmt-security.mib`(§2.1.2 — 인터페이스로 드나든 바이트 수 카운터, `sysUpTime`), `app-protocols-mgmt-security.snmp-operations`(§2.1.2 — 상태 폴링, 알림이 폴링을 이끈다),
`app-protocols-mgmt-security.snmp-versions`(§2.1.2 — v1·v2는 보안이 모자라 v3), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단)

## (phase 78 step 5) RFC 3512 — Configuring Networks and Devices with Simple Network Management Protocol (SNMP) [Informational]
https://www.rfc-editor.org/rfc/rfc3512

Informational(2003-04)이고 폐기되지 않았다(rfc-editor 상태 2026-11-11). **폴링의 부담에 관한 말만** 가져온다 — 기출([기출 2024-05-19 #7])이 맞는 말로 두는 「폴링과 트래픽」을 대조하려는 것이다.

- 바뀐 것을 알아내려고 객체 여럿을 폴링해야 하는 구성은 규모가 커지면 잘 맞지 않는다 — §3.3.5
- 설정 데이터가 아주 많은 장비에서 매니저가 설정 표 전체를 주기적으로 폴링하면 **에이전트와 매니저 둘 다에 부담**이 된다 — §3.3.6
- 트랩은 받았는지 확인할 방법이 없어, 확인이 필요하면 SNMP 밖의 방법을 써야 하고 보통 폴링이라는 대가가 따른다. 인폼은 받은 쪽이 `Response`로 답하므로 보낸 쪽이 받았는지 확인할 수 있다 — §3.10.2

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.snmp-operations`(§3.3.5·§3.3.6 — 폴링은 장비와 객체가 많을수록 부담이 커진다. 쓰면 「요청 하나에 응답 하나이므로 장비 수 × 묻는 횟수만큼 메시지가 오간다」는 계산임을 밝힌다, §3.10.2 — 인폼은 확인 응답이 있다),
기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — 폴링과 트래픽)

## (phase 78 step 5) RFC 4330 — Simple Network Time Protocol (SNTP) Version 4 for IPv4, IPv6 and OSI [Informational, 폐기 — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc4330

Informational(2006-01)이고 **RFC 5905가 폐기하고 대신했다**(RFC 2030·1769를 대체했었다 — rfc-editor 상태 2026-11-11). 지금 SNTP의 근거는 위 RFC 5905 §14이고, 이 문서는 **SNTP를 따로 적은 옛 문서가 무엇을 말했는지 확인하는 역사 기록으로만** 쓴다.

- 정확도가 덜 필요한 쓰임(1초의 상당 부분까지, 집의 라우터라면 1분까지도 괜찮은 곳)에는 완전한 NTP 소프트웨어가 너무 크고 복잡하므로, 더 단순한 소프트웨어로 NTP 서버·클라이언트에 닿는 방식으로 SNTPv4를 적었다 — §1
- NTP와 SNTP는 **패킷 꼴이 같고**, 시각·차이·왕복 지연을 계산하는 산술도 같다. NTP·SNTP 서버에게 NTP 클라이언트와 SNTP 클라이언트는 구별되지 않고, 클라이언트에게도 두 서버가 구별되지 않는다. 대부분의 NTP 클라이언트와 달리 **SNTP 클라이언트는 보통 한 번에 서버 하나만 쓴다** — §1
- SNTP 클라이언트는 동기화 망의 끝(가장 높은 stratum)에서만 쓰고, 다른 클라이언트가 SNTP 클라이언트에 시각을 기대지 않게 하라고 강하게 권한다 — §1
- NTP와 SNTP는 모두 UDP를 쓰고, IANA가 NTP에 정한 UDP 포트는 **123**이다. SNTP 클라이언트는 요청의 목적지 포트를 123으로 한다 — §4
- 서버를 여럿 알려 주면 하나를 쓰고 나머지는 그 서버가 고장 났을 때의 예비로 둘 수 있다 — §7

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.sntp`(역사 기록으로 — 「SNTP를 RFC 4330이 따로 적었고 지금은 RFC 5905 §14에 들어 있다」, §1 — 같은 패킷 꼴·서버 하나·정확도가 덜 필요한 기기, §4 — UDP 123), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — SNTP와 123)

## (phase 78 step 5) RFC 5280 — Internet X.509 Public Key Infrastructure Certificate and Certificate Revocation List (CRL) Profile
https://www.rfc-editor.org/rfc/rfc5280

Proposed Standard(2008-05)이고 폐기되지 않았다(RFC 3280·4325·4630을 대체, RFC 6818·8398·8399·9549·9598·9608·9618·9925·10007이 고쳤다 — rfc-editor 상태 2026-11-11). **인증서가 무엇인지만** 가져온다. 인증서의 필드·확장·경로 검증·폐기 목록은 가져오지 않는다.

- 공개 키를 쓰는 쪽은 그 짝인 개인 키를 올바른 상대(사람이나 시스템)가 가졌다는 믿음이 필요하다. 그 믿음을 주는 것이 **공개 키 인증서**다 — **공개 키 값을 그 주인(subject)에 묶은 데이터**이고, 믿을 수 있는 **인증 기관(CA)**이 인증서마다 디지털 서명을 해서 그 묶음을 보증한다 — §3.1
- 인증서에는 서명된 내용 안에 유효 기간이 적혀 있다. 인증서를 쓰는 쪽이 서명과 기간을 스스로 확인할 수 있으므로, 인증서는 믿을 수 없는 통로로 나눠 주어도 된다 — §3.1
- 인증서의 표준 형식은 ITU-T X.509이고, 지금 쓰는 것은 확장 칸을 더한 버전 3(v3)이다 — §3.1
- 이 체계의 구성 요소는 인증서의 주인인 끝 개체(end entity), 인증 기관(CA), 등록 기관(RA) 등이다 — §3

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.tls`(§3.1 — 인증서는 주인의 이름과 공개 키를 묶어 인증 기관이 서명한 것, 받는 쪽이 서명과 기간을 확인한다), `app-protocols-mgmt-security.https`
(phase 80 step 12에서 쓰일 곳) `windows-admin-tools.certificate-manager`(§3.1 — 인증서는 공개 키를 그 주인에 묶고 인증 기관이 서명한 것, 짝인 개인 키는 주인만 갖는다 — `app-protocols-mgmt-security.tls`와 같은 뜻으로 한 줄 다시 푼다), `windows-admin-tools.efs`(EFS가 쓰는 인증서와 개인 키)

## (phase 78 step 5) RFC 7568 — Deprecating Secure Sockets Layer Version 3.0, RFC 6176 — Prohibiting Secure Sockets Layer (SSL) Version 2.0, RFC 6101 — The Secure Sockets Layer (SSL) Protocol Version 3.0 [Historic — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc7568
https://www.rfc-editor.org/rfc/rfc6176
https://www.rfc-editor.org/rfc/rfc6101

상태(rfc-editor 2026-11-11): RFC 7568은 Proposed Standard(2015-06 — RFC 8996이 고쳤다), RFC 6176은 Proposed Standard(2011-03 — RFC 8996이 고쳤다), RFC 6101은 Historic(2011-08 — SSL 3.0을 남기는 역사 기록). 셋 다 폐기되지 않았다.
**SSL이 TLS와 어떤 관계이고 왜 쓰지 않는지만** 가져온다. SSL의 결함을 이루는 공격과 암호 구성의 세부는 가져오지 않는다.

- SSL 3.0은 널리 구현됐고 **TLS의 바탕**이었지만 IETF가 정식 문서로 낸 적이 없어, 1996년판을 역사 기록으로 남긴 것이 RFC 6101이다 — RFC 6101 Abstract·Foreword. SSL도 TCP 같은 믿을 수 있는 전송 위에 얹히고, 응용 프로토콜이 데이터를 주고받기 전에 핸드셰이크로 서로 인증하고 암호 방식과 키를 정했다 — RFC 6101 §1(역사 기록)
- SSL 3.0은 1996년에 나온 뒤 키 교환과 암호 방식 모두에 공격이 이어졌다. 1999년 TLS 1.0(RFC 2246)이 SSL 3.0을 대신했고 TLS 1.1·1.2가 뒤따랐다. SSL 3.0의 앞 판인 SSL 2.0도 충분히 안전하지 않다 — RFC 7568 §1
- **SSL 3.0은 써서는 안 된다**(MUST NOT). 어느 판의 TLS에서도 SSL 3.0으로 협상하게 두어서는 안 된다. TLS는 어느 판이든 SSL 3.0보다 안전하다 — RFC 7568 §3
- SSL 3.0은 데이터를 보호하는 방식(레코드 보호), 키 교환, 직접 만든 암호 구성 요소 모두에 결함이 있고, 확장을 쓸 수 없어 고칠 수도 없다 — RFC 7568 §4
- TLS 클라이언트·서버는 SSL 2.0을 협상해서는 안 된다 — RFC 6176 Abstract, §3
- 지금 TLS 1.3 명세도 SSL 2.0·3.0과 TLS 1.0·1.1을 협상하지 말라고 한다 — 위 RFC 9846 항목의 「(phase 78 step 5)」 줄(부록 E.5)
- IANA 레지스트리는 443번의 설명을 「http protocol over TLS/SSL」로 적는다 — 위 IANA 항목의 「(phase 78 step 5)」 줄. 곧 「SSL/TLS」·「TLS/SSL」은 **두 이름을 함께 적는 표기**이고, 지금의 표준에서 실제로 쓰는 것은 TLS다

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.tls`(RFC 6101 — SSL은 TLS의 바탕이 된 앞 프로토콜, RFC 7568 §1·§3·§4·RFC 6176 — 결함 때문에 쓰지 않게 정해졌다, 「SSL/TLS」는 두 이름을 함께 적는 표기), `app-protocols-mgmt-security.https`,
기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — HTTPS의 「SSL/TLS」)

## (phase 78 step 5) RFC 3261 — SIP: Session Initiation Protocol
https://www.rfc-editor.org/rfc/rfc3261

Proposed Standard(2002-07)이고 폐기되지 않았다(RFC 2543을 대체. RFC 3265·3853·4320·4916·5393·5621·5626·5630·5922·5954·6026·6141·6665·6878·7462·7463·8217·8591·8760·8898·8996이 고쳤다 — rfc-editor 상태 2026-11-11). 기본 동작은 이 문서로 쓴다.
**세션을 맺고 끝내는 기본 차례, 주소 꼴, 전송·포트, SDP·RTP와의 관계만** 가져온다. 프록시·등록·헤더 필드·응답 코드 전체·보안 방식은 가져오지 않는다. §4의 예에 나오는 사람·도메인 이름은 옮기지 않는다.

- 세션은 참가자들 사이에 데이터를 주고받는 것이다. 음성·영상·문자 같은 실시간 멀티미디어 데이터를 나르는 프로토콜은 따로 있고, **SIP는 그것들과 함께 일하며** 인터넷의 끝점(사용자 에이전트)들이 서로를 찾고 함께 쓸 세션의 성격에 합의하게 한다.
  SIP는 세션을 **만들고, 바꾸고, 끝내는** 도구이고 아래 전송 프로토콜이나 세션의 종류에 기대지 않는다 — §1
- **SIP는 인터넷 전화 같은 멀티미디어 세션(회의)을 맺고, 바꾸고, 끝내는 응용 계층의 제어 프로토콜**이다. 이미 있는 세션에 사람을 부르거나 미디어를 더하고 뺄 수도 있다 — §2
- SIP가 맡는 다섯 면: 상대가 어느 끝 시스템에 있는지(위치), 받을 뜻이 있는지(가용성), 쓸 미디어와 그 매개변수(능력), 울리기와 양쪽의 세션 매개변수 정하기(세션 설정), 넘기기·끝내기·매개변수 바꾸기(세션 관리) — §2
- SIP는 혼자 완결된 통신 체계가 아니라 다른 프로토콜과 함께 쓰는 부품이다. 보통 **실시간 데이터를 나르는 RTP**, 멀티미디어 세션을 적는 SDP 등과 함께 쓴다 — §2
- 요청·응답 방식은 HTTP와 비슷하다 — 트랜잭션 하나는 어떤 일을 시키는 요청 하나와 응답 하나 이상이다. 응답은 세 자리 코드와 짧은 설명 문구다 — §4
- SIP 주소(SIP URI)는 전자우편 주소와 비슷한 꼴로 보통 사용자 이름과 호스트 이름을 담는다 — `sip:사용자@도메인`. SIPS URI(`sips:`)로 걸면 거는 쪽에서 받는 쪽 도메인까지 SIP 메시지를 TLS로 나른다 — §4, §19.1.
  일반 꼴은 `sip:user:password@host:port;uri-parameters?headers`이고, user는 그 호스트(흔히 도메인)에서 특정 자원을 가리킨다 — §19.1.1
- **통화 한 번의 차례**(§4 그림 1의 예 — 양쪽 도메인의 프록시 서버 둘을 거친다): 거는 쪽이 `INVITE` → 각 프록시가 받았다는 `100 (Trying)` → 받는 쪽 전화가 울리며 `180 (Ringing)` → 받으면 `200 (OK)`(받는 쪽의 세션 설명을 담는다) →
  거는 쪽이 `ACK`(최종 응답을 받았다는 확인. 이때는 서로의 주소를 알게 돼 프록시를 거치지 않고 바로 간다 — 이 INVITE/200/ACK가 세션을 맺는 3단계 주고받기다) → **미디어 세션**(세션 설명으로 합의한 형식의 미디어 패킷을 주고받는다. 끝과 끝 사이의 미디어 패킷은 **SIP 신호와 다른 길**로 간다) →
  한쪽이 끊으며 `BYE`(그림에서는 받은 쪽이 먼저 끊었다) → 상대가 `200 (OK)`. BYE에는 ACK를 보내지 않는다 — ACK는 INVITE의 최종 응답에만 보낸다 — §4
- 미디어 종류·코덱 같은 세션의 세부는 SIP로 적지 않고, SIP 메시지 본문에 다른 형식(SDP)으로 담는다 — 전자우편이 첨부를, HTTP 메시지가 웹 페이지를 나르는 것처럼. INVITE와 200 (OK)에 세션 설명이 한 번씩 실려 간단히 협상한다 — §4
- 받는 쪽이 받지 않거나 통화 중이면 200 (OK) 대신 오류 응답이 가고 미디어 세션은 생기지 않는다 — §4. 통화 중에 한쪽이 새 미디어 설명을 담은 re-INVITE로 세션의 성격을 바꿀 수 있다 — §4, §14
- 세션을 끝내는 것은 `BYE`다. 맺어진 통화에서는 거는 쪽과 받는 쪽 모두 BYE를 보낼 수 있다 — §15
- INVITE를 받은 서버 쪽 트랜잭션은 200ms 안에 다른 응답을 보낼 것을 알지 못하면 `100 (Trying)`을 보내야 한다(MUST) — §17.2.1. (그러니 프록시 없이 두 전화가 바로 주고받아도 `180` 앞에 `100`이 올 수 있다)
- 전송: **모든 SIP 요소는 UDP와 TCP를 둘 다 구현해야 한다**(MUST) — 큰 메시지는 TCP로 보내야 해서다 — §18. 서버는 UDP로 기다리는 포트·인터페이스에서 TCP로도 기다려야 한다 — §18.2.1.
  기본 포트는 UDP·TCP·SCTP에서 **5060**, TLS에서 **5061**이다 — §18.1.1, §18.2.1, §19.1.1 표의 주. `sip:` 주소의 기본 전송은 UDP, `sips:` 주소는 TCP다 — §19.1.1 표의 주
- SIP는 IPv4와 IPv6 모두에서 동작한다 — §2

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.sip`(§1·§2 — 세션을 맺고 바꾸고 끝내는 응용 계층의 제어(신호) 프로토콜, RTP·SDP와 함께 쓰는 부품, §4 — 통화 차례·SDP·미디어는 다른 길, §15 — BYE는 어느 쪽이든, §17.2.1 — `100 (Trying)`,
§18·§19.1 — UDP·TCP 둘 다, 5060·5061, 주소 꼴), 기출 대조(`exam-notes.md` 「phase 78 step 5」 문단 — 화상 회의의 SIP)

## (phase 78 step 5) RFC 8866 — SDP: Session Description Protocol
https://www.rfc-editor.org/rfc/rfc8866

Proposed Standard(2021-01)이고 폐기되지 않았다(RFC 4566을 대체 — rfc-editor 상태 2026-11-11). **SDP가 무엇이고 SIP와 어떻게 함께 쓰이는지만** 가져온다. SDP의 문법은 가져오지 않는다.

- 멀티미디어 회의·인터넷 전화·영상 스트리밍 같은 세션을 시작할 때는 참가자들에게 미디어의 세부, 미디어를 보낼 주소, 그 밖의 세션 정보를 알려야 한다. SDP는 그 정보를 적는 **표준 형식**이고 **그 자체로는 전송 프로토콜이 아니다** — SIP·RTSP·전자우편·HTTP 같은 다른 프로토콜에 실려 간다 — §1
- SIP로 세션을 만들 때 SIP 메시지가 세션 설명을 실어 참가자들이 함께 쓸 미디어 형식에 합의하게 하고, 그 세션 설명은 흔히 SDP로 적는다 — §3.1

쓰인 곳: (phase 78 step 5에서 쓰일 곳) `app-protocols-mgmt-security.sip`(§1·§3.1 — 어떤 음성·영상 방식을 쓸지는 SDP로 적어 SIP 메시지에 실어 주고받는다)

## (phase 78 step 11) Microsoft Learn — ipconfig, nslookup, pathping, Command-Line Syntax Key
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nslookup
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/pathping
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/command-line-syntax-key

2026-11-11에 IPv4로 내려받아 읽은 판: ipconfig `updated_at` 2026-02-16(바닥의 「Last updated on」 2023-02-03, `ms.date` 2017-10-16), nslookup `updated_at` 2026-10-21(「Last updated on」 2024-11-01, `ms.date` 2023-09-08),
pathping `updated_at` 2026-02-16(「Last updated on」 2024-11-01, `ms.date` 2018-07-11), Command-Line Syntax Key `updated_at` 2026-09-08(「Last updated on」 2026-09-08). 넷 다 「Applies to」가 Windows Server 2016~2025, Windows 10·11, Azure Local 2311.2 이후다.
ipconfig·pathping 페이지는 옵션을 빗금(`/all`, `/q`)으로 적고, nslookup 페이지는 옵션을 하이픈으로 붙인다(아래 줄). ping·tracert·netstat 페이지의 사실은 위 「(phase 71) Microsoft Learn …」·「(phase 74 step 11) … Microsoft Learn — route, netstat」 항목에 있다.

- **ipconfig**: 지금의 TCP/IP 네트워크 설정 값을 모두 보이고, DHCP와 DNS 설정을 새로 고친다. **옵션 없이 부르면 모든 어댑터마다 IPv4·IPv6 주소, 서브넷 마스크, 기본 게이트웨이를 보인다** — 첫 문단.
  어댑터는 설치된 네트워크 어댑터 같은 **물리적인 인터페이스**일 수도, 전화 접속 연결 같은 **논리적인 인터페이스**일 수도 있다 — Parameters의 `/all`
- ipconfig `/all`: **모든 어댑터의 TCP/IP 설정 전체**를 보인다 — Parameters. **이 페이지는 `/all`이 보이는 항목을 하나하나 늘어놓지 않고, 출력 예도 없다**(Examples에는 입력하는 줄만 있다).
  항목 이름은 아래 「(phase 78 step 11) Microsoft Learn — Windows Server 문제 해결 문서 …」 항목의 출력 예와 점검 차례에서만 확인된다 — 호스트 이름, IP 주소, 서브넷 마스크, 기본 게이트웨이, DNS 서버, 연결별 DNS 접미사, 그리고 위 「(phase 74 step 5) Microsoft Learn …」 항목의 자동 구성 줄.
  **물리 주소(MAC 주소)·DHCP 사용 여부·DHCP 서버·임대 시각이 `/all`에 나온다는 것은 Windows Server·Windows 명령 문서에서 찾지 못했다**(ipconfig 페이지, 아래 문제 해결 문서 여섯, learn.microsoft.com 검색 — 2026-11-11). Azure VPN Gateway 문서의 출력 예에 Physical Address·DHCP Enabled 줄이 있지만 허용 범위(Windows Server와 Windows 명령) 밖이라 쓰지 않는다
- ipconfig `/release [<adapter>]`: DHCP 서버에 **DHCPRELEASE 메시지**를 보내 지금의 DHCP 설정을 놓아 주고, 모든 어댑터(어댑터를 적지 않았을 때)나 적은 어댑터의 IP 주소 설정을 버린다.
  주소를 자동으로 받도록 설정된 어댑터에서는 그 어댑터의 TCP/IP가 꺼진다 — Parameters. DHCPRELEASE가 무엇인지는 위 「(phase 73 step 1) RFC 951 …, RFC 2131 …」 항목(클라이언트가 주소를 돌려주고 남은 임대를 취소한다)
- ipconfig `/renew [<adapter>]`: 모든 어댑터나 적은 어댑터의 **DHCP 설정을 새로 받는다**. **주소를 자동으로 받도록 설정된 어댑터가 있는 컴퓨터에서만** 쓸 수 있다 — Parameters. 어댑터 이름은 옵션 없이 부른 ipconfig에 나오는 이름을 적고, 이름에 빈칸이 있으면 큰따옴표로 감싸며 `*`로 여러 어댑터를 고를 수 있다 — Parameters, Remarks.
  Examples는 한 어댑터만 새로 받는 `ipconfig /renew` 예를 든다. **`/release` 다음 `/renew`의 차례는 이 페이지의 예에 없고** 문제 해결 문서에 있다(아래 항목)
- ipconfig `/displaydns`: **DNS 클라이언트 리졸버 캐시**의 내용을 보인다 — 로컬 Hosts 파일에서 미리 넣은 항목과, 이 컴퓨터가 최근 이름 질의를 풀며 얻은 레코드가 함께 든다. DNS Client 서비스는 자주 묻는 이름을 설정된 DNS 서버에 묻기 **전에** 이 캐시로 빨리 푼다 — Parameters
- ipconfig `/flushdns`: 그 캐시를 **비우고 새로 시작한다**. DNS 문제를 풀 때 부정 응답 항목(이름이 없다는 답을 기억해 둔 것)과 동적으로 더해진 다른 항목을 버리는 데 쓴다 — Parameters. Examples도 DNS 이름 풀이 문제를 풀 때 쓰는 예로 든다.
  「비운 뒤에는 그 이름을 DNS 서버에 다시 묻는다」는 이 페이지에 한 문장으로 적혀 있지 않다 — `/displaydns`의 「DNS 서버에 묻기 전에 캐시로 먼저 푼다」와 `/flushdns`의 「캐시를 비운다」를 이어서 나오는 말이다
- ipconfig `/setclassid <adapter> [<classID>]`: 어댑터의 **DHCP 클래스 ID**를 정한다(`/showclassid`는 보인다). 주소를 자동으로 받는 어댑터에서만 쓸 수 있다 — Parameters. 기출의 오답 보기([기출 2026-02-01 #41])라 뜻만 적는다
- ipconfig는 주소를 자동으로 받는 컴퓨터에서 가장 쓸모가 있다 — 어느 설정 값이 DHCP·APIPA·대체 구성 가운데 무엇으로 정해졌는지 알 수 있다 — Remarks
- **nslookup**: DNS 기반 구조의 문제를 살피는 데 쓰는 정보를 보인다 — 첫 문단. 비대화형으로 쓸 때 첫 인자는 찾을 컴퓨터의 **이름이나 IP 주소**, 둘째 인자는 물어볼 **DNS 이름 서버**이고, 둘째를 빼면 기본 DNS 이름 서버에 묻는다. 이름을 주면 그 IP 주소를, IP 주소를 주면 그 도메인 이름을 찾는 예가 있다 — 「Noninteractive mode」.
  옵션은 `nslookup -<option>`처럼 하이픈으로 붙인다 — 같은 절. 출력 예는 없다
- **pathping**: 출발지와 목적지 사이 **중간 홉의 지연과 손실**에 관한 정보를 준다. 경로의 라우터마다 에코 요청을 **일정 시간 동안 여러 번** 보내고 라우터마다 돌아온 패킷으로 결과를 계산한다. 어느 라우터나 링크에서 얼마나 잃는지를 보이므로 **어느 라우터나 서브넷에 문제가 있을 수 있는지** 알 수 있다.
  또 경로에 어떤 라우터가 있는지를 **tracert와 같이** 알아낸 뒤, 정한 시간 동안 모든 라우터에 주기적으로 ping을 보내 각 라우터에서 돌아온 수로 통계를 낸다 — 첫 세 문단. 옵션 없이 부르면 도움말을 보인다 — 첫 문단
- pathping의 옵션(기출이 묻지는 않지만 오래 걸리는 까닭을 말하는 데 필요한 것): `/q`는 경로의 **라우터마다 보낼 에코 요청 수**(기본 100), `/p`는 **잇따른 ping 사이의 간격**(ms, 기본 250 — 1/4초)이다. ping은 홉마다 하나씩 차례로 보내므로 **같은 홉에 보내는 두 ping의 간격은 간격 값에 홉 수를 곱한 것**이다.
  `/h`는 찾을 최대 홉 수(기본 30), `/n`은 중간 라우터의 IP 주소를 이름으로 바꾸려 하지 않아 결과가 빨리 나올 수 있게 한다, `/w`는 응답 하나를 기다리는 시간(ms, 기본 3000) — Parameters. **모든 매개변수가 대소문자를 가린다** — Remarks.
  혼잡과 몰려서 잃는 손실의 영향을 줄이려면 ping을 충분히 느리게 보내야 한다 — Remarks
- pathping의 **출력 예**(「Example of the pathping command output」, `pathping /n` 예): ① 「목적지 이름 `[주소]`까지, 최대 30홉」 줄과 경로 목록 — 홉 번호 0(출발지 자신)부터 차례로 주소 하나씩. ② 「몇 초 동안 통계를 계산하는 중」이라는 줄. ③ 통계 표 — 머리줄은 Hop, RTT, **Source to Here**(출발지에서 그 홉까지)의 Lost/Sent = Pct, **This Node/Link**(그 노드나 링크에서)의 Lost/Sent = Pct, address.
  표는 라우터 줄(홉 번호·RTT·두 칸의 「잃은 수/보낸 수 = 백분율」·주소)과 그 사이의 **링크 줄**(address 칸에 세로 막대 `|`, This Node/Link 칸만 채운다)이 번갈아 나온다. ④ 「Trace complete.」 — 같은 절. 값(주소·시간·수)은 옮기지 않는다
- pathping의 결과를 읽는 법(출력 예 뒤 설명): 경로 목록이 먼저 나오고, 이어 **바쁘다는 줄이 대략 90초 동안**(홉 수에 따라 다르다) 보이는 사이에 앞서 나온 모든 라우터와 그 사이 링크에서 정보를 모으며, 그 시간이 끝나면 결과를 보인다.
  예에서는 두 라우터 사이의 **링크** 하나가 패킷의 13%를 잃고, 홉 2·4의 라우터는 **자기에게 온** 패킷을 잃지만 그 손실은 자기를 지나가는 트래픽을 넘기는 데 영향을 주지 않는다.
  **링크(`|`)에 보이는 손실률**은 경로로 넘어가는 패킷이 그 링크의 혼잡으로 잃는 것이고, **라우터(주소)에 보이는 손실률**은 그 라우터가 과부하일 수 있다는 뜻이다 — 같은 절
- (계산 — 문서의 문장이 아니다) 출력 예는 「125초 동안 통계를 계산」이라고 적는데, 이 예의 홉은 출발지 다음으로 5개이므로 기본값 그대로 `/q` 100 × `/p` 250ms × 홉 5 = 125초가 된다. 위 「같은 홉에 보내는 두 ping의 간격 = 간격 × 홉 수」에서 나오는 값이다.
  문서의 「대략 90초」는 홉 수에 따라 달라지는 어림으로 적힌 말이다 — 본문은 「홉이 많을수록 오래 걸린다」를 쓰고, 이 계산을 쓴다면 계산이라고 밝힌다
- **Command-Line Syntax Key**: 명령의 문법 줄에 쓰는 기호(그대로 칠 글자, `< >` 안은 값을 넣을 자리, `[ ]` 안은 넣지 않아도 되는 것, `{ }`와 `|`는 하나를 골라야 하는 것, `…`은 되풀이)를 설명한다 — 표.
  **옵션 앞의 빗금(`/`)과 하이픈(`-`)을 어떻게 쓰는지는 이 페이지에도 없다** — `exam-notes.md` E33

쓰인 곳: (phase 78 step 11에서 쓰일 곳) `diagnostic-commands.ipconfig`(옵션 없이 — 어댑터마다 IPv4·IPv6 주소·서브넷 마스크·기본 게이트웨이, 어댑터는 물리·논리 인터페이스, `/all`은 설정 전체 — 항목 목록과 출력 예 없음, 물리 주소·DHCP 서버·임대 시각은 근거 없음),
`diagnostic-commands.ipconfig-options`(`/release` — DHCPRELEASE·주소 설정을 버림·TCP/IP가 꺼짐, `/renew` — 자동으로 받는 어댑터에서만, `/displaydns` — Hosts 항목과 최근 레코드·DNS 서버보다 먼저, `/flushdns` — 비우기와 부정 응답, `/setclassid`, nslookup — 이름이나 주소를 DNS 서버에 묻는다),
`diagnostic-commands.pathping`(tracert처럼 경로를 찾은 뒤 라우터마다 일정 시간 여러 번, 노드·링크 손실, `/q` 100·`/p` 250ms, 출력의 세 부분과 칸, 대략 90초·125초 계산, 링크 손실과 라우터 손실의 뜻), `exam-notes.md` 「phase 78 step 11」 문단과 E33
(phase 79 step 0에서 쓰일 곳) `dns.dns-cache-ttl`(`/displaydns` — DNS 클라이언트 리졸버 캐시에 Hosts 파일의 항목과 최근 레코드가 함께 든다, DNS 서버에 묻기 전에 캐시로 푼다. 강의 p351 화면의 항목 이름은 데이터 이름·데이터 유형·TTL(Time To Live)·데이터 길이·섹션·레코드 줄이다 — 이 페이지는 출력 예를 보이지 않는다), `dns.hosts-file`(`/displaydns` — Hosts 파일의 항목이 캐시에 미리 실린다)
(phase 81 step 0에서 쓰일 곳 — 2026-11-18에 다시 받은 ipconfig 페이지는 위 줄과 같은 판이다) `windows-server-roles.server-static-ip`(`/renew` — 주소를 자동으로 받는 어댑터에서만 쓰고 그 어댑터의 DHCP 설정을 다시 받는다. 「실행한 뒤에도 그 어댑터는 DHCP로 주소를 받는 어댑터로 남는다 — 고정 주소로 바꾸지 않는다」는 이 페이지에 한 문장으로 적혀 있지 않고 위 `/renew` 줄에서 이어서 나오는 말이다), 기출 대조(`exam-notes.md` 「phase 81 step 0」 문단 — [기출 2025-05-25 #43])

## (phase 78 step 11) Microsoft Learn — Windows Server 문제 해결 문서(DNS 클라이언트, 네트워크 어댑터의 IP 주소 바꾸기, 공유 프린터, IPv6 설치, TCP/IP 통신, DHCP)
https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-client
https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/change-ip-address-network-adapter
https://learn.microsoft.com/en-us/troubleshoot/windows-server/printing/cannot-install-shared-network-printer-locally
https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/install-configure-ip-version-6
https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/troubleshoot-tcp-ip-communication-guidance
https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/troubleshoot-dhcp-guidance

2026-11-11에 IPv4로 내려받아 읽은 판: DNS 클라이언트 문서 `updated_at` 2025-09-22(「Last updated on」 2020-08-07, 「Applies to」 Windows Server 2016~2025). 나머지 다섯은 모두 `updated_at` 2026-02-19(`ms.date` 2026-02-12, 「Applies to」 지원되는 Windows Server)다.
명령 참조 페이지가 출력의 꼴이나 쓰는 차례를 보이지 않는 곳을 메우는 데만 쓴다. **IP 주소 바꾸기·공유 프린터·IPv6 문서는 Windows Server 2003·Windows XP 무렵의 글**이라(「시작 > 실행」, 「Local Area Connection」, 출력의 `IP Address` 줄) 화면의 꼴은 지금 판과 다를 수 있다 — 항목 이름과 차례만 가져오고 화면을 그대로 옮기지 않는다.

- **DNS 클라이언트 문제 해결**(「Check IP configuration」): 관리자 명령 프롬프트에서 `ipconfig /all`을 실행하고 — 그 네트워크에 맞는 IP 주소·서브넷 마스크·기본 게이트웨이가 있는지, **출력에 나온 DNS 서버**의 주소가 맞는지, 출력의 **연결별 DNS 접미사**가 맞는지 본다.
  설정이 틀렸고 동적으로 설정된 클라이언트이면 `ipconfig /renew`로 DHCP 서버에서 설정을 다시 받게 한다 — 같은 절
- 같은 문서(이름 풀이 시험 뒤): `nslookup <바깥 이름>`으로 공용 이름을 물어보고, 시험이 다 성공했는데도 어떤 이름이 실패하면 `ipconfig /displaydns`로 그 이름을 찾는다. 그 이름 아래 「Name does not exist」가 있으면 DNS 서버가 준 부정 응답이 클라이언트에 캐시된 것이고, `ipconfig /flushdns`로 캐시를 비워 푼다 — 같은 문서 뒷부분
- **IP 주소 바꾸기**(「How to automatically obtain an IP Address」): 주소를 자동으로 받게 바꾼 뒤 명령 프롬프트에서 `ipconfig /release`를 입력하고, 이어 `ipconfig /renew`를 입력하면 **DHCP 서버가 어댑터에 IP 주소를 준다**. 그때 나오는 화면은 「Windows Server IP Configuration」 머리줄, 어댑터 이름 줄, 그 아래 「항목 이름 . . . : 값」 꼴의 줄들 — 연결별 DNS 접미사, IP 주소, 서브넷 마스크, 기본 게이트웨이 — 이다 — 같은 절
- **공유 프린터 문서**(「Resolution」 Method 2): `ipconfig /all`의 출력이 다음과 비슷할 수 있다며 보이는 예 — 「Windows IP Configuration」 머리줄, **호스트 이름**(Host Name), 주 DNS 접미사, DNS 접미사 검색 목록, 어댑터 이름 줄, IP 주소, 서브넷 마스크, **DNS 서버**(여러 줄) — 같은 절. 옛 판의 꼴이고 기본 게이트웨이 줄은 이 예에 없다
- **IPv6 설치 문서**(「Test IPv6 connectivity by using the PING command」 등): 이름으로 IPv6 호스트에 ping할 때는 `ping -6 name`처럼 **`-6` 매개변수를 넣어야 한다**고 쓰고, `tracert -6`으로 IPv6 경로를 따라간다고 쓴다 — 명령 참조 페이지는 같은 옵션을 `/6`으로 적는다(위 「(phase 71) …」 항목). **Microsoft 문서가 같은 ping·tracert 옵션을 하이픈으로 적은 곳**이다 — `exam-notes.md` E33
- **TCP/IP 통신 문제 해결**: 특정 포트로 이어지지 않으면 그 포트가 **기다리는(listening) 상태인지** CMD에서 `netstat -nato | findstr :<port>`로 확인하라고 한다 — 「Troubleshooting checklist」 Step 6. TCP 연결이 멈춘 것 같으면 `netstat -a`로 이 컴퓨터의 TCP·UDP 포트 활동을 모두 보라고 한다 — 「Common issues and solutions」
- **DHCP 문제 해결**: DHCP 서버만 UDP 67·68 포트에서 기다리고 있는지(다른 프로세스가 차지하지 않았는지) `netstat -anb`로 확인하라고 한다 — 「Troubleshoot DHCP servers」. 클라이언트에서 `ipconfig /renew`를 실행해 DHCP 문제를 다시 일으켜 보라고도 한다 — 「Data collection」
- (phase 78 step 15) **어느 프로그램이 TCP 포트를 쓰는지 알아내기**(https://learn.microsoft.com/en-us/troubleshoot/windows-server/performance/determine-which-program-use-block-tcp-ports — 2026-11-11에 IPv4로 내려받아 읽음, `updated_at` 2026-02-19, `ms.date` 2026-02-12, 「Applies to」 Windows Server 2003): `-o`는 연결마다 그 연결과 이어진 프로세스 ID를 보이고, 그것으로 어느 프로세스(프로그램)가 어느 포트에서 기다리는지 알 수 있다고 한다.
  `netstat -ano`의 출력 예가 머리줄을 **Proto · Local Address · Foreign Address · State · PID** 차례로 적고 그 아래 줄도 같은 차례(프로토콜, 로컬 주소, 외부 주소, 상태, PID)다 — 곧 **PID 칸은 상태 칸 뒤의 마지막 칸**이다. 작업 관리자의 프로세스 탭에서 PID로 프로그램을 찾는다 — 「Summary」·「How to match the process ID to a program」.
  **Windows Server 2003의 글**이라 화면의 꼴은 지금 판과 다를 수 있다 — 칸의 차례만 가져오고 화면을 그대로 옮기지 않는다. 원격 데스크톱 문제 해결 문서(https://learn.microsoft.com/en-us/troubleshoot/windows-server/remote/remote-desktop-disconnected — 2026-11-11 Microsoft Learn 검색으로 읽음)도 `netstat -a -o`의 결과에서 포트를 쓰는 프로세스의 PID가 PID 칸에 나온다고 쓴다(위 「Windows netstat의 결과 칸」 줄은 `-o`의 PID가 어느 칸에 놓이는지 적혀 있지 않다고 했다 — 이 문서로 메운다)
- (phase 81 step 0) **IP 주소 바꾸기 문서를 2026-11-18에 IPv4로 다시 받았다** — `updated_at` 2026-02-19(`ms.date` 2026-02-12), 「Applies to」 지원되는 Windows Server, 원래 KB 323444. 한국어판(「네트워크 어댑터의 IP 주소를 변경하는 방법」, `updated_at` 2026-10-14)도 받았다.
  주소를 손으로 정하는 차례(「How to Specify an IP Address」): 「다음 IP 주소 사용」(Use the following IP address)을 고르고, IP 주소 칸에 그 네트워크에서 쓸 수 있는 주소 가운데 **겹치지 않는** 것을, 서브넷 마스크 칸에 그 네트워크의 마스크를, 기본 게이트웨이 칸에 이 네트워크를 다른 네트워크나 인터넷에 잇는 장치의 주소를 넣는다. 「기본 설정 DNS 서버」(Preferred DNS server) 칸에 이름을 주소로 바꿔 주는 컴퓨터의 주소를, 「대체 DNS 서버」(Alternate DNS server) 칸에 기본 설정 DNS 서버를 쓸 수 없을 때 쓸 DNS 서버의 주소를 넣는다.
  반대로 주소를 자동으로 받게 할 때(「How to automatically obtain an IP Address」)는 「자동으로 IP 주소 가져오기」(Obtain an IP address automatically)와, DNS 서버 주소를 직접 정하지 않으려면 「자동으로 DNS 서버 주소 가져오기」(Obtain DNS server address automatically)를 고른다(DHCP 서버가 있어야 한다). 이름은 한국어판의 표기다. 문제 해결(「Troubleshooting」): 이미 쓰이는 주소를 넣으면 그 고정 주소가 이미 네트워크에서 쓰인다는 오류가 나오고, 서브넷 마스크를 잘못 넣으면 사실상 다른 네트워크에 놓여 같은 네트워크의 컴퓨터와 통신하지 못하며, DNS 서버 주소가 틀리면 이름으로는 다른 컴퓨터에 닿지 못한다(주소로는 닿는다).
  이 문서도 옛 판의 꼴이다(「Local Area Connection」, 「Internet Protocol (TCP/IP)」) — 지금 판의 메뉴 이름은 아래 「(phase 81 step 0) Microsoft Learn — 서버의 고정 IP 주소 …」 항목의 「Core network components」·DirectAccess 시험 랩 문서에서 확인한다

쓰인 곳: (phase 78 step 11에서 쓰일 곳) `diagnostic-commands.ipconfig`(`/all` 출력의 항목 — 호스트 이름·IP 주소·서브넷 마스크·기본 게이트웨이·DNS 서버·연결별 DNS 접미사, 옛 판의 꼴), `diagnostic-commands.ipconfig-options`(`/release` 다음 `/renew`의 차례와 그 결과, `/displaydns`·`/flushdns`로 부정 응답 캐시를 찾고 비우기),
`diagnostic-commands.ping-options`(하이픈 표기 `ping -6`), `diagnostic-commands.netstat`(열린 포트가 기다리는 상태인지 netstat으로 본다), `diagnostic-commands.netstat-windows-options`(`-nato`·`-anb`처럼 이어 쓴 꼴과 쓰임; (phase 78 step 15) `netstat -ano`의 PID 칸이 상태 칸 뒤의 마지막 칸이다 — 본문·도식·n224), `exam-notes.md` 「phase 78 step 11」 문단과 E33
(phase 81 step 0에서 쓰일 곳) `windows-server-roles.server-static-ip`(IP 주소 바꾸기 문서 — 주소를 손으로 정하는 칸과 그 뜻, 자동으로 받기와 `ipconfig /release`·`/renew`의 차례, 겹치는 주소·틀린 마스크·틀린 DNS 서버 주소의 결과), 기출 대조(`exam-notes.md` 「phase 81 step 0」 문단 — [기출 2025-05-25 #43])

## (phase 78 step 11) Linux man-pages — ip-address(8), termios(3)
https://man7.org/linux/man-pages/man8/ip-address.8.html
https://man7.org/linux/man-pages/man3/termios.3.html

2026-11-11에 IPv4로 내려받아 읽은 판: ip-address(8)은 iproute2 프로젝트의 페이지이고 upstream Git에서 2026-08-04에 가져온 것이다(그때 최신 커밋 2026-07-28, 바닥줄 2011-12-20, HTML 2026-09-09). termios(3)은 Linux man-pages 6.18(2026-02-08, man-pages-6.18 타르볼, HTML 2026-05-30)이다.
**명령의 이름과 무엇을 보이는지만** 적는다.

- **ip-address(8)**: 주소는 네트워크 장치에 붙은 IPv4나 IPv6 주소이고, 한 장치에 주소가 여럿 붙을 수 있다. `ip address` 명령은 주소와 그 속성을 보이고, 더하고, 지운다 — DESCRIPTION.
  `ip address show`는 모든 네트워크 인터페이스에 붙은 IPv4·IPv6 주소를 보이고 `show`는 빼도 된다. `ip address show dev <이름>`은 그 인터페이스의 주소만 보인다 — EXAMPLES. **출력 예는 없다**
- **termios(3)**: 터미널의 끼어들기 문자(INTR)는 **Ctrl-C**이고, 이 문자를 받으면 **SIGINT** 시그널을 보낸다(ISIG가 켜져 있을 때) — DESCRIPTION, 터미널 특수 문자를 정하는 c_cc 배열 설명의 VINTR. SIGINT가 무엇인지는 위 「(phase 76) Linux man-pages …」 항목의 signal(7) 줄

쓰인 곳: (phase 78 step 11에서 쓰일 곳) `diagnostic-commands.ipconfig`(Linux에서 주소를 보는 명령 `ip address`), `diagnostic-commands.ping-options`(Linux ping을 Ctrl-C로 끝내면 SIGINT가 가서 요약을 보이고 끝난다)

## (phase 79 step 0) RFC 9499 — DNS Terminology
https://www.rfc-editor.org/rfc/rfc9499

Best Current Practice(BCP 219)이고 RFC 8499를 폐기했으며 RFC 2308을 고쳤다(rfc-editor 상태, 2026-11-12). 이 문서는 용어의 뜻을 모은 것이라 프로토콜을 새로 정하지 않는다 — 다른 RFC의 정의를 따다 쓰고 어디서 왔는지 밝힌다. 이 phase가 쓰는 낱말만 가져온다.

- **도메인 이름**: 레이블 하나 이상의 순서 있는 목록. **레이블**: 도메인 이름의 한 조각을 이루는 0옥텟 이상의 순서 있는 목록으로, 이름 나무의 노드 하나를 가리킨다 — §2 「Domain name」·「Label」
- **전 세계 DNS의 이름**: 레이블은 0~63옥텟이다. 완전한 이름(FQDN)에서 맨 끝 레이블은 길이 0이고 길이 0일 수 있는 것은 그것뿐이며, 그것을 **루트**(루트 레이블)라 한다. 이름 전체는 전송 꼴로 최대 255옥텟이고 루트도 1옥텟으로 센다 — §2 「Global DNS」 Composition of names
- **이름을 적는 꼴**: 문서용 꼴(presentation format — 영역 파일에 쓰는 꼴)에서는 루트에서 먼 레이블부터 점을 사이에 두고 적고, 완전한 이름이면 루트와 그 앞의 점까지 적어 `example.tld.`처럼 끝에 점이 붙는다. 응용 프로그램과 글에서 쓰는 꼴(common display format)에서는 끝의 점을 붙이지 않는 것이 보통이다.
  영어처럼 왼쪽에서 오른쪽으로 쓰는 글에서는 **루트(최상위 도메인) 쪽 레이블이 맨 오른쪽**에 온다 — §2 「Global DNS」 Format of names
- **이름의 관리**는 **위임**으로 정해진다. 루트 영역을 맡는 네임 서버는 서로 독립된 루트 운영자들이 제공한다 — §2 「Global DNS」 Administration of names. 이름 하나에는 자원 레코드가 0개 이상 붙을 수 있고, 레코드 유형은 IANA 레지스트리에 많다 — 같은 절 Types of data
- **FQDN**(Fully Qualified Domain Name): 노드의 도메인 이름을 분명하게 말하는 이름이다. 엄밀히는 루트의 빈 레이블까지 모두 적어 `www.example.net.`처럼 끝에 점이 붙지만, 모든 이름이 루트를 함께 쓰므로 `www.example.net`처럼 루트를 빼고 적어도 흔히 FQDN이라 부른다.
  이 말이 필요한 까닭은 끝의 레이블 몇 개를 뺀 이름(예: `example.net`에 대한 `www`)이 있어서이고, 그런 이름은 문맥으로만 뜻이 정해진다 — §2 「Fully Qualified Domain Name (FQDN)」
- **호스트 이름**: 널리 쓰는 말이지만 RFC 1034·1035·1123·2181 어디에도 정의돼 있지 않다. 흔히 RFC 1034 §3.5의 「권장 이름 문법」(레이블의 모든 글자가 영문자·숫자·하이픈)을 따르고, RFC 1123 §2.1대로 숫자로 시작해도 되는 도메인 이름을 가리킨다.
  **도메인 이름의 레이블 자체에는 어떤 옥텟 값이든 들어갈 수 있다**. FQDN의 첫 레이블만을 호스트 이름이라 부르기도 한다 — §2 「Host name」
- **최상위 도메인**(TLD — Top-Level Domain): 루트 한 층 아래의 영역(예: `com`, `jp`). DNS로 보면 TLD에 특별한 것은 없고, 나라별(ccTLD)·일반(gTLD) 같은 구분은 정책의 일이다 — §2 「Top-Level Domain (TLD)」
- **서브 도메인**: 어떤 도메인 안에 든 도메인이고, 이름이 그 도메인의 이름으로 끝나는지로 알 수 있다(RFC 1034 §3.1). 레이블 단위로 견주므로 `ooo.example.com`은 `oo.example.com`의 서브 도메인이 아니다 — §2 「Subdomain」
- **리졸버**: 클라이언트의 요청에 따라 네임 서버에서 정보를 얻어 내는 프로그램(RFC 1034 §2.4). 이름·유형·클래스로 질의를 보내고 응답을 받으며, 그 일을 **resolution**(이름 풀이)이라 부른다. 「resolve」는 RFC 1034·1035에 정식으로 정의돼 있지 않다 — §6 「Resolver」
- **스텁 리졸버**(stub resolver): 이름 풀이를 스스로 다 하지 못하고 보통 재귀 리졸버에 맡기는 리졸버(정의는 RFC 1123 §6.1.3.1) — §6 「Stub resolver」
- **반복 모드**(iterative mode): 질의를 받은 서버가 다른 서버를 알려 주는 답(referral)으로 응답하는 방식 — 서버는 클라이언트에게 다른 서버를 알려 주고 거기에 이어 묻게 한다. **재귀 모드**(recursive mode): 질의를 받은 서버가 캐시로 답하거나, 다른 서버들에 질의를 보내 최종 답을 얻어 답하는 방식이다.
  재귀 모드의 서버는 리졸버 노릇을 해 오류나 답만 돌려주고 다른 서버를 알려 주지 않는다. 재귀 모드는 RD가 켜진 질의가 재귀를 해 줄 서버에 닿을 때 일어나고, 클라이언트는 응답에 RA와 RD가 함께 켜졌는지로 확인한다.
  이렇게 동작하는 시스템을 흔히 **재귀 서버**(recursive server), 때로 **재귀 리졸버**(recursive resolver)라 부르고, 두 말은 섞여 쓰인다 — §6 「Iterative mode」·「Recursive mode」·「Recursive resolver」
- **재귀 질의**(recursive query): 헤더의 RD(Recursion Desired) 비트가 1인 질의. 재귀 서비스를 할 수 있고 RD로 청했으면 서버가 리졸버를 써서 답한다. **비재귀 질의**(non-recursive query): RD 비트가 0인 질의. 서버는 자기 정보만으로 오류·답·답에 더 가까운 다른 서버로의 안내 가운데 하나로 답한다 — §6 「Recursive query」·「Non-recursive query」
- **반복적 이름 풀이**(iterative resolution): 다른 서버만 답할 수 있는 질의를 다루는 두 방법 가운데, 첫 서버가 클라이언트 대신 다른 서버에 이어 묻는 것이 재귀, 서버가 다른 서버를 알려 주고 클라이언트가 이어 묻는 것이 반복이다(RFC 1034 §2.3). 반복적 이름 풀이에서 클라이언트는 **비재귀 질의를 되풀이하며** 안내(referral)와 별칭을 따라간다(알고리즘은 RFC 1034 §5.3.3) — §6 「Iterative resolution」
- **완전 서비스 리졸버**(full-service resolver): 캐시를 갖고 재귀 모드로 동작하는 리졸버(RFC 1123 §6.1.3.1). 재귀 리졸버는 대개 받은 답을 캐시에 둔다고 기대된다 — §6 「Full-service resolver」·「Recursive resolver」
- **프라이밍**(priming)과 **루트 힌트**: 재귀 모드로 동작하려면 루트 서버 하나 이상의 주소를 알아야 하고, 루트 영역을 맡은 서버들의 이름과 주소를 적은 루트 힌트 파일(많은 소프트웨어에 들어 있다)에서 루트 서버 목록을 찾아 시작한다 — §6 「Priming」·「Root hints」
- **권한 있는 서버**(authoritative server): DNS 영역의 내용을 자기 데이터로 알고 있어 다른 서버에 묻지 않고 그 영역의 질의에 답하는 서버(RFC 2182 §2). 영역의 NS 레코드에 이름이 오르고, 그 영역의 정보로 답할 때 헤더의 AA 플래그를 1로 켠다. 영역 하나 이상에 권한을 갖는다.
  권한 있는 서버도 자기 아래로 위임한 하위 영역에 대해서는 위임 정보(referral)를 주는데, 그때는 AA 비트가 0이다 — §6 「Authoritative server」. **권한만 있는 서버**(authoritative-only server)는 재귀 요청을 무시하고(재귀를 하지 않았다는 응답을 하고) 자기가 맡은 영역의 정보만 준다 — §6 「Authoritative-only server」
- **영역 전송**(zone transfer): 클라이언트가 영역의 사본을 요청하고 권한 있는 서버가 보내 주는 일. 표준 방법은 둘이다 — 영역 전체를 옮기는 **AXFR**(RFC 5936)과 바뀐 부분만 옮기는 **IXFR**(RFC 1995) — §6 「Zone transfer」
- **보조 서버**(secondary server): 영역 전송으로 영역을 받아 오는 권한 있는 서버(RFC 1996 §2.1). 옛 RFC는 「slave」라 불렀고 지금은 「secondary」라 부르는 것이 보통이다. **주 서버**(primary server): 보조 서버들에게 영역 전송의 원본이 되도록 설정된 권한 있는 서버. 옛 RFC는 「master」라 불렀다 — §6 「Secondary server」·「Slave server」·「Primary server」·「Master server」
- **열린 리졸버**(open resolver): 어느 클라이언트의 질의든(또는 거의 모든 질의를) 받아 처리하는 완전 서비스 리졸버. 「public resolver」라고도 하는데, 이 말은 일부러 열어 둔 것에 더 쓴다 — §6 「Open resolver」
- **정책을 적용하는 리졸버**(policy-implementing resolver): 재귀 모드로 동작하면서, 악성 코드 사이트 같은 곳에 닿지 못하게 하는 등의 정책 기준으로 돌려줄 답 일부를 바꾸는 리졸버 — §6 「Policy-implementing resolver」
- **애니캐스트**와 **인스턴스**: 같은 서비스 주소를 서로 떨어진 여러 곳에서 제공해 데이터그램이 그 가운데 한 곳으로 가게 하는 방식이 애니캐스트이고, 그렇게 같은 IP 주소를 쓰는 서버 하나하나를 인스턴스라 한다. 루트 서버의 인스턴스를 흔히 애니캐스트 인스턴스라 부른다 — §6 「Anycast」·「Instance」
- **클래식 DNS**(UDP나 TCP 위의 DNS)는 스텁 리졸버와 재귀 리졸버 사이, 재귀 리졸버와 권한 있는 서버 사이에서 쓰이고 **암호화되지 않는다** — §6 「Classic DNS」
- **영역**(zone): 권한 있는 정보를 묶는 단위로, 영역의 데이터를 겹쳐 맡는 여러 네임 서버에 자동으로 나눠 줄 수 있다(RFC 1034 §2.4) — §7 「Zone」. **영역 경계**(zone cut): 한 영역의 꼭대기가 다른 영역의 자식인 곳의 경계 — §7 「Zone cut」.
  **위임**(delegation): 어떤 도메인의 꼭대기 아래 이름 공간에 따로 영역을 만드는 일이다. 부모 영역에 자식 영역 꼭대기 이름의 NS 레코드 묶음을 넣을 때 일어나고, 늘 영역 경계에서 일어난다. 그렇게 만든 새 영역을 가리키기도 한다 — §7 「Delegation」. **루트 영역**: 꼭대기가 길이 0인 레이블인 영역 — §7 「Root zone」
- **안내 응답**(referral): 서버가 답에 대해 (완전히) 권한이 없다는 것을 알리며, 질의를 보낼 다른 곳을 리졸버에게 알려 주는 응답이다. 서버가 재귀 서비스를 하지 않을 때 생긴다(RFC 1034 §4.3.2 3.b). 보통 「referral」은 아래로의 안내(위임 응답)를 뜻한다.
  안내만 담은 응답은 답 칸이 비고, 권한 칸에 안내하는 영역의 NS 레코드 묶음이, 추가 칸에 그 주소 레코드가 들 수 있으며, AA 비트는 꺼져 있다 — §4 「Referrals」
- **TTL**: 자원 레코드의 **최대** 유효 시간. 0 이상 2147483647(2^31 − 1) 이하의 부호 없는 수이고(RFC 2181 §8), 출처에 다시 물을 때까지 캐시에 둘 수 있는 시간이다(RFC 1035 §3.2.1·§4.1.3). 「최대」인 까닭은 캐시 운영자가 운영상 TTL을 더 짧게 줄일 수 있어서다.
  캐시는 TTL이 다 되기 전에 레코드를 비울 수도 있다. 영역의 **기본 TTL**을 서버 소프트웨어의 설정이나 영역 파일의 `$TTL` 지시어로 정하기도 한다 — §5 「TTL」. **소유자**(owner): 레코드가 있는 도메인 이름 — §5 「Owner」. 영역 파일(zone file)은 master file이라고도 하는, 레코드를 글자 꼴로 적은 파일이다 — §5 「Master file」
- (phase 79 step 5, 2026-11-12 원문 다시 확인) **SOA의 필드 이름**: SOA는 「start of a zone of authority」의 줄임이고, 필드는 데이터에 놓인 차례대로 MNAME·RNAME·SERIAL·REFRESH·RETRY·EXPIRE·MINIMUM이다(정의는 RFC 1035 §3.3.13). **MINIMUM의 뜻은 RFC 2308 §4가 바꿔 지금은 「부정 응답에 쓸 TTL」 하나다** — §5 「SOA field names」.
  한 레코드 묶음 안의 레코드는 TTL이 모두 같아야 하고(RFC 2181 §5.2), 영역 파일의 `$TTL` 지시어는 RFC 2308이 더했다 — §5 「TTL」
- (phase 79 step 5) **영역의 꼭대기**(apex): 영역의 SOA와 권한 있는 NS 묶음이 놓인 이름 공간의 지점이다(영역 이름 그 자체) — §7 「Apex」. **주 서버**(primary master): 영역 SOA의 MNAME에 이름이 오르는 서버다(RFC 1996 §2.1) — §6 「Primary master」
- (phase 79 step 5) **DNSSEC의 말**: 서명된 영역(signed zone)은 레코드 묶음들이 서명되고 DNSKEY·RRSIG·NSEC(지금은 NSEC3일 수도 있다)과 (선택으로) DS를 갖춘 영역이다. 검증(validation)은 서명이 유효한지 보는 것과, 신뢰 앵커에서 응답까지 인증 사슬을 잇는 것을 가리킨다.
  검증하는 리졸버(validating resolver)는 검증을 하는 보안 인식 재귀 서버·리졸버·스텁 리졸버이고, 신뢰 앵커(trust anchor)는 그 리졸버가 인증 사슬의 출발점으로 쓰려고 미리 설정한 DNSKEY나 DS다(RFC 4033 §2) — §10 「Signed zone」·「Validation」·「Validating resolver」·「Trust anchor」

쓰인 곳: (phase 79 step 0에서 쓰일 곳) `dns.dns`(§6 「Resolver」 — 이름 풀이, 「Policy-implementing resolver」 — 답을 바꾸는 리졸버가 있다, 「Classic DNS」 — 암호화되지 않는다), `dns.domain-hierarchy`(§2 — 레이블·루트·끝의 점·FQDN·호스트 이름·TLD·서브 도메인),
`dns.name-servers`(§2 「Global DNS」 — 독립된 루트 운영자, §6 — 리졸버의 종류·권한 있는 서버·열린 리졸버·애니캐스트·인스턴스), `dns.dns-zone`(§6 — 영역 전송·주 서버·보조 서버와 옛 이름, §7 — 영역·위임·영역 경계), `dns.name-resolution`(§4 「Referrals」),
`dns.recursive-iterative-query`(§6 — 재귀·반복 모드, 재귀·비재귀 질의, 반복적 이름 풀이), `dns.dns-cache-ttl`(§5 「TTL」 — 최대 시간·범위·기본 TTL), 강의 수정 이력 L48·L49·L50·L51
(phase 79 step 5에서 쓰일 곳) `dns.soa-record`(§5 「SOA field names」 — 필드 차례·MINIMUM의 새 뜻, §7 「Apex」·§6 「Primary master」), `dns.resource-records`(§5 「Owner」 — 소유자), `dns.dnssec`(§10 — 서명된 영역·검증·검증하는 리졸버·신뢰 앵커, §6 「Classic DNS」 — 암호화되지 않는다)

## (phase 79 step 0) RFC 2181 — Clarifications to the DNS Specification
https://www.rfc-editor.org/rfc/rfc2181

Proposed Standard이고 RFC 1034·1035·1123을 고쳤으며, RFC 4033~4035·4343·5452·8767 등이 이 문서를 고쳤다(rfc-editor 상태, 2026-11-12).

- **TTL의 범위**: TTL 값은 부호 없는 수이고 최소 0, 최대 2147483647(2^31 − 1)이다. 32비트 칸의 아래 31비트에 넣고 맨 위 비트는 0으로 둔다. 맨 위 비트가 켜진 값을 받으면 0으로 본다. 구현은 받은 TTL에 상한을 둘 수 있고, **TTL은 지켜야 할 시간이 아니라 최대 유효 시간이다** — §8
- **이름의 문법**: DNS가 호스트 이름과 주소를 잇는 데만 쓰인다는 생각은 틀렸고, DNS는 (조금 제한은 있지만) 거의 어떤 데이터든 담는 일반 계층형 데이터베이스다. **DNS 자체가 레이블에 거는 제한은 길이 하나뿐이다** — 레이블은 1~63옥텟, 전체 이름은 구분자를 포함해 255옥텟. 길이 0인 이름은 루트이고 보통 `.`으로 적는다.
  그 밖에는 어떤 이진 문자열이든 레이블이 될 수 있고, DNS 서버는 일부 클라이언트가 받아들이지 못할 레이블이 있다는 이유로 영역을 거부하면 안 된다. 다만 DNS 데이터를 쓰는 응용은 자기 환경에 맞게 값을 제한할 수 있다(예: 아무 이진 레이블이나 메일 주소의 호스트 부분이 될 수는 없다) — §11
- (phase 79 step 5, 2026-11-12 원문 다시 확인) **레코드 묶음**(RRSet): 레이블·클래스·유형이 같고 데이터만 다른 레코드들의 무리다(네 가지가 모두 같은 레코드 둘은 뜻이 없어 서버가 하나로 줄인다). 질의는 그 묶음의 레코드를 모두 돌려주고, 응답에 다 들어가지 않으면 잘렸다고 표시한다 — §5, §5.1. 한 묶음의 레코드는 TTL이 모두 같아야 한다 — §5.2
- (phase 79 step 5) **CNAME**: 별칭 하나에 정식 이름은 하나뿐이다. 별칭인 이름에는 DNSSEC에 쓰는 레코드 말고 다른 데이터를 둘 수 없다 — 그래서 어떤 이름이든 ① CNAME 하나(DNSSEC 레코드는 함께 둘 수 있다) ② CNAME이 아닌 레코드 하나 이상 ③ 레코드 없이 이름만 있음 ④ 이름이 없음 가운데 정확히 하나다 — §10.1.
  (이 절이 드는 DNSSEC 레코드 이름 SIG·NXT·KEY는 옛것이고, 지금은 RFC 4035 §2.5대로 RRSIG·NSEC이다 — 아래 「(phase 79 step 5) DNSSEC」 항목). CNAME 레코드의 이름(레이블)은 정식 이름이 아니라 별칭이다 — 흔히 그 이름을 「CNAME」이라 부르는 것은 잘못 붙은 말버릇이다 — §10.1.1
- (phase 79 step 5) **PTR**: 한 이름에 PTR이 하나뿐이어야 한다는 제한은 없다. PTR의 값은 별칭이 아니라 정식 이름이어야 한다 — §10.2. **MX·NS**: 그 값(이름)은 별칭이면 안 되고, 주소 레코드를 가진 이름이어야 한다 — §10.3
- (phase 79 step 8, 2026-11-12 rfc-editor.org 원문 다시 확인) **TC 비트**: 응답에 꼭 실어야 할 레코드 묶음을 통째로 담지 못했을 때만 TC 비트를 켠다. TC가 켜진 응답에는 다 담지 못한 묶음의 일부가 남아 있을 수 있고, 이런 응답을 받은 DNS 클라이언트는 **그 응답을 쓰지 않고** TCP 연결처럼 더 큰 응답을 받을 수 있는 방법으로 다시 묻는 것이 좋다(should) — §9

쓰인 곳: (phase 79 step 0에서 쓰일 곳) `dns.domain-hierarchy`(§11 — DNS 이름 일반의 제한은 길이뿐이고 호스트 이름 규칙은 응용 쪽의 제한이다), `dns.dns-cache-ttl`(§8 — 범위·최대 시간), 강의 수정 이력 L51
(phase 79 step 5에서 쓰일 곳) `dns.resource-records`(§5 — 레코드 묶음, §10.1 — CNAME과 다른 데이터를 함께 둘 수 없다·DNSSEC 예외, §10.3 — MX·NS의 값은 별칭이 아니다), `dns.reverse-lookup`(§10.2 — PTR의 값은 정식 이름), `dns.dns-round-robin`(§5·§5.1 — 같은 이름의 A 여럿은 한 묶음으로 함께 돌아간다)
(phase 79 step 8) `dns.dns-transport`(§9 — 잘린 응답에는 레코드가 다 들어 있지 않을 수 있고, 그 응답을 쓰지 않고 TCP로 다시 묻는다), 문항 n243 해설

## (phase 79 step 0) RFC 7720 — DNS Root Name Service Protocol and Deployment Requirements
https://www.rfc-editor.org/rfc/rfc7720

Best Current Practice(BCP 40)이고 RFC 2870을 폐기했다(rfc-editor 상태, 2026-11-12). 프로토콜·배치 요건만 정하고, **운영 요건은 이 문서에서 빼 ICANN RSSAC의 문서(RSSAC-001)로 넘겼다** — §1. RSSAC 문서는 허용한 출처가 아니라 읽지 않았다.

- **루트 서버는 하나뿐인 루트 영역(`.`)의 권한 있는 서버**이고, 지금은 `root-servers.net` 영역도 맡으며 일부는 `.arpa` 최상위 도메인의 영역도 맡는다 — §1
- 루트 이름 서비스는 IPv4·IPv6로, **UDP와 TCP로** DNS 질의와 응답을 주고받을 수 있어야 하고, 권한 있는 서비스로서 DNSSEC과 EDNS(0)를 구현해야 한다 — §2. 올바른 IP 주소를 가진 누구의 질의에든 답해야 한다 — §3
- **이 문서는 루트 서버가 재귀를 하지 않는다는 요건을 적지 않는다**(운영 요건과 함께 빠졌다) — 아래 RFC 2870 항목

쓰인 곳: (phase 79 step 0에서 쓰일 곳) `dns.name-servers`(§1 — 루트 서버는 루트 영역의 권한 있는 서버), `dns.recursive-iterative-query`, 강의 수정 이력 L48·L50

## (phase 79 step 0) RFC 2870 — Root Name Server Operational Requirements [폐기, RFC 7720으로 대체 — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc2870

Best Current Practice(BCP 40)였고 RFC 7720이 폐기했다(rfc-editor 상태, 2026-11-12).

- 루트 서버는 자기가 맡은 영역의 권한 있는 응답만 해야 하고, **재귀 조회·전달처럼 캐시한 답을 줄 수 있게 하는 기능을 모두 꺼야 했다**. 루트 서버의 부하를 줄이고 틀린 데이터를 캐시할 위험을 줄이려는 것이었다 — §2.5

쓰인 곳: (phase 79 step 0) 강의 수정 이력 L48(「루트 서버는 재귀를 하지 않는다」는 이 폐기된 문서의 요건이라 지금 표준의 문장으로 단정하지 않는다)

## (phase 79 step 0) RFC 9609 — Initializing a DNS Resolver with Priming Queries
https://www.rfc-editor.org/rfc/rfc9609

Best Current Practice(BCP 209)이고 2025-02에 나와 RFC 8109를 폐기했다(rfc-editor 상태, 2026-11-12). 재귀 리졸버가 빈 캐시에서 루트 서버 목록을 얻는 방법(프라이밍)을 다룬다.

- 재귀 리졸버는 빈 캐시와, 루트 서버들의 이름과 주소를 찾는 설정에서 시작한다 — §1. 루트 서버의 도메인 이름을 「루트 서버 식별자」라 하고, **이 목록은 1997년부터 그대로이지만 그 IPv4·IPv6 주소는 가끔 바뀐다** — §2
- 리졸버 소프트웨어는 루트의 NS 레코드가 13개라고 기대하면 안 된다(예전에 더 적게 돌려준 루트 서버가 있었다) — §4.1. **이 문서가 나올 때 루트 서버 운영 기관 13곳이 루트 서버 인스턴스를 1500개 넘게 운영했고, 인스턴스마다 IPv4 주소 하나와 IPv6 주소 하나를 쓴다** — §4.2

쓰인 곳: (phase 79 step 0에서 쓰일 곳) `dns.name-servers`(§2·§4.2 — 이름 목록은 1997년부터, 인스턴스 1500개 넘게), 강의 수정 이력 L49

## (phase 79 step 0) IANA — Root Servers
https://www.iana.org/domains/root/servers

2026-11-12에 IPv4로 내려받아 읽었다(페이지에 고친 날 표시가 없다).

- 루트 영역을 맡는 권한 있는 네임 서버들(흔히 「루트 서버」)은 **여러 나라에 흩어진 수백 대의 서버로 이루어진 망**이고, 루트 영역에는 **이름 붙은 권한 13개**로 설정돼 있다 — 머리 문단
- 그 이름은 `a.root-servers.net`부터 `m.root-servers.net`까지이고, 표에 이름마다 IPv4·IPv6 주소와 운영 기관이 있다. 표의 운영 기관은 12곳이다 — 한 기관이 `a`와 `j`를 운영한다 — 「List of Root Servers」 표. **주소와 운영 기관 이름은 옮기지 않는다**
- 재귀 리졸버를 운영하는 사람은 보통 루트 서버들의 이름과 주소를 적은 「루트 힌트 파일」을 설정해야 하고, 많은 소프트웨어에는 이 목록이 들어 있다 — 「Configuring the Root Servers」

쓰인 곳: (phase 79 step 0에서 쓰일 곳) `dns.name-servers`(이름 13개 a~m, 수백 대의 서버, 루트 힌트), 강의 수정 이력 L48·L49

## (phase 79 step 0) RFC 5936 — DNS Zone Transfer Protocol (AXFR)
https://www.rfc-editor.org/rfc/rfc5936

Proposed Standard이고 RFC 1034·1035를 고쳤으며 RFC 9103이 이 문서를 고쳤다(rfc-editor 상태, 2026-11-12).

- 한 영역을 맡은 서버들의 데이터를 맞춰 두는 표준 장치는 셋이다 — 영역 전체를 옮기는 **AXFR**(RFC 1034·1035), 바뀐 것만 옮기는 **IXFR**(RFC 1995), 바뀐 것을 곧바로 알리는 **NOTIFY**(RFC 1996). 목적은 여러 서버가 한 영역에 대해 어긋나지 않게 권한 있는 답을 하게 하는 것이다 — §1
- **AXFR은 TCP로 한다**(RFC 1034 §4.3.5 — 정확해야 하므로 TCP 같은 믿을 수 있는 프로토콜). 보통은 클라이언트가 TCP 연결을 열고 AXFR 질의를 보내 응답을 받은 뒤 연결을 닫는다. 같은 연결로 SOA를 먼저 묻거나 다른 질의에 다시 쓰기도 한다 — §4. **UDP 위의 AXFR은 정의되지 않았다** — §4.2
- (phase 79 step 5, 2026-11-12 원문 다시 확인) AXFR 응답은 그 영역의 **SOA로 시작해 같은 SOA로 끝난다**. 그 사이의 레코드는 차례가 정해지지 않은 모음으로 다룬다 — §2.2

쓰인 곳: (phase 79 step 0에서 쓰일 곳) `dns.dns-zone`(§1 — AXFR·IXFR·NOTIFY, §4·§4.2 — AXFR은 TCP로 하고 UDP로는 정의되지 않았다), 강의 수정 이력 L11(영역 전송은 TCP)과 함께
(phase 79 step 5에서 쓰일 곳) `dns.soa-record`(§2.2 — 영역 전체 전송도 SOA로 시작해 SOA로 끝난다), `dns.dns-transport`(§4·§4.2 — 영역 전체 전송은 TCP)

## (phase 79 step 0) RFC 1995 — Incremental Zone Transfer in DNS, RFC 1996 — A Mechanism for Prompt Notification of Zone Changes (DNS NOTIFY)
https://www.rfc-editor.org/rfc/rfc1995
https://www.rfc-editor.org/rfc/rfc1996

둘 다 Proposed Standard이고 RFC 1035를 고쳤다. RFC 1995는 RFC 9103이 고쳤다(rfc-editor 상태, 2026-11-12). **이름과 한 줄만 쓴다** — 메시지 꼴은 가져오지 않는다.

- **IXFR**: 영역의 작은 일부가 바뀌었을 때 AXFR은 영역 파일 전체를 옮겨 비효율적이라, 바뀐 부분만 옮긴다 — RFC 1995 §1. 영역의 낡은 사본을 가진 쪽(보통 SOA의 갱신 시간이 되었거나 NOTIFY를 받은 보조 서버)이 자기 사본의 SOA 일련번호를 실어 요청하고, 서버는 그 판부터의 차이만 보내거나 영역 전체를 보낸다.
  **IXFR 질의는 UDP나 TCP로 보낼 수 있다** — 응답이 UDP 패킷 하나에 들어가면 UDP로 답하고, 안 들어가면 TCP로 다시 묻게 한다 — RFC 1995 §2. (그래서 「영역 전송은 TCP」는 AXFR에 대해서는 언제나 맞고, IXFR은 UDP로 시작할 수 있다)
- **NOTIFY**: 주(master) 서버가 보조(slave) 서버들에게 영역의 데이터가 바뀌었으니 새 데이터를 알아보라고 알린다 — RFC 1996 Abstract. 영역의 갱신 간격이 길면 주 서버의 부하는 줄지만 영역이 바뀔 때마다 서버들이 어긋나 있는 시간이 길어지므로,
  보조 서버가 정해진 간격으로 묻는 대신 주 서버가 바뀔 때 알려 퍼지는 시간을 줄인다 — RFC 1996 §1.1·§1.2. 주 서버(master)는 보조 서버들의 영역 전송 원본으로 설정된 권한 있는 서버, 보조 서버(slave)는 영역 전송으로 영역을 받는 권한 있는 서버다 — RFC 1996 §2.1

쓰인 곳: (phase 79 step 0에서 쓰일 곳) `dns.dns-zone`(IXFR은 바뀐 것만, NOTIFY는 주 서버가 먼저 알린다 — 이름과 한 줄씩)

## (phase 79 step 0) RFC 2182 — Selection and Operation of Secondary DNS Servers
https://www.rfc-editor.org/rfc/rfc2182

Best Current Practice(BCP 16)이다(rfc-editor 상태, 2026-11-12).

- 이 문서에서의 정의 — **주 서버**(primary server): 영역 정보를 자기 설정으로 가진 권한 있는 서버, 마스터 서버라고도 한다. **보조 서버**(secondary server): 주 서버에서 영역 전송으로 영역 정보를 얻는 권한 있는 서버, 슬레이브 서버라고도 한다. **권한 있는 서버**: 영역의 내용을 자기 데이터로 알아 다른 서버에 묻지 않고 답하는 서버 — §2
- **영역마다 서버를 여럿 두는 큰 까닭은, 서버 하나가 멈추거나 닿지 않을 때에도 영역의 정보를 어디서나 믿을 만하게 얻게 하는 것**이다. 서버가 여럿이면 이름 풀이의 부하도 나뉜다. 보통 하나가 주 서버이고 나머지가 보조 서버다. 주 서버와 보조 서버의 구분은 그 영역의 서버들 사이에서만 뜻이 있고, 나머지 DNS에게는 그냥 여러 서버다 — §3
- 보조 서버는 한 번에 모두 끊기지 않도록 지리적으로도 네트워크 경로로도 떨어진 곳에 두어야 한다 — §3.1. DNS 명세와 도메인 등록 규칙은 **영역마다 서버를 적어도 둘**(보통 주 서버와 보조 서버 하나) 두게 하고, 이 문서는 셋을 권한다 — §5
- 보조 서버는 영역 SOA의 일련번호로 자기 사본을 바꿀 때인지 판단하므로, 주 서버에서 영역을 바꿀 때마다 일련번호를 늘려야 한다 — §7(일련번호를 줄일 때의 절차는 가져오지 않는다)

쓰인 곳: (phase 79 step 0에서 쓰일 곳) `dns.dns-zone`(§2 — 주·보조 서버와 옛 이름, §3·§5 — 둘 이상 두는 까닭), `dns.name-servers`(§2 — 권한 있는 서버), 강의 수정 이력 L50

## (phase 79 step 0) Linux man-pages — hosts(5), nsswitch.conf(5)
https://man7.org/linux/man-pages/man5/hosts.5.html
https://man7.org/linux/man-pages/man5/nsswitch.conf.5.html

2026-11-12에 IPv4로 내려받아 읽은 판: 둘 다 Linux man-pages 6.19(man-pages-6.19 타르볼, 2026-09-09에 가져온 것, HTML 2026-09-09). 바닥줄 날짜는 hosts(5) 2026-02-11, nsswitch.conf(5) 2026-02-08이다.

- **hosts(5)**: `/etc/hosts`는 IP 주소와 호스트 이름을 짝짓는 단순한 글자 파일이고 **IP 주소 하나에 한 줄**이다. 줄마다 `IP_주소 정식_호스트_이름 [별명...]`을 적는다. IP 주소는 IPv4나 IPv6이고, 칸 사이는 빈칸이나 탭 몇 개든 된다. `#`부터 줄 끝까지는 주석이다 — DESCRIPTION
- hosts(5): 이 파일의 호스트 이름은 영숫자·하이픈(`-`)·마침표(`.`)만 쓰고, 영문자로 시작해 영숫자로 끝나야 한다. 별명은 이름 바꿈, 다른 철자, 더 짧은 이름 등에 쓴다. IPv4와 IPv6 줄을 따로 둘 수 있다 — DESCRIPTION
- hosts(5): BIND는 `/etc/hosts`를 보충하거나 대신해, 호스트가 이 파일이 최신이고 완전하다는 데 기대지 않게 한다. 호스트 테이블은 DNS로 대체되었지만 지금도 쓰인다 — 부팅 중처럼 DNS가 돌지 않을 때 쓰는 로컬 네트워크의 중요한 호스트 몇 개, NIS의 입력, 인터넷에 이어지지 않은 아주 작은 사이트 — DESCRIPTION
- hosts(5): 이 파일을 고치면 보통 바로 적용된다(응용이 파일을 캐시하는 경우는 빼고) — NOTES. DNS가 나오기 전에는 호스트 테이블이 인터넷에서 호스트 이름을 푸는 유일한 방법이었고, 원래 꼴은 RFC 952가 정했다 — NOTES 「Historical notes」. EXAMPLES의 주소·이름은 옮기지 않는다
- **nsswitch.conf(5)**: `/etc/nsswitch.conf`(Name Service Switch 설정 파일)는 GNU C 라이브러리 등이 이름 서비스 정보를 **어디서, 어떤 차례로** 얻을지 정하는 데 쓴다. 정보의 갈래마다 데이터베이스 이름이 있고, 줄의 첫 칸이 데이터베이스 이름, 나머지 칸이 물어볼 출처의 차례다 — DESCRIPTION
- nsswitch.conf(5): **`hosts` 데이터베이스는 호스트 이름과 번호**(gethostbyname(3) 등이 쓴다)다. 줄에 적은 서비스의 **차례대로 결과가 나올 때까지 묻는다**. 표준 설치에서 `files` 등을 쓸 수 있고 **`hosts` 데이터베이스에는 `dns`도 쓸 수 있다**.
  `files` 출처를 적으면 `hosts` 데이터베이스는 **`/etc/hosts`를 읽는다** — DESCRIPTION, FILES. 서비스 뒤에 `[NOTFOUND=return]` 같은 동작을 붙여 앞 출처의 결과에 따라 멈출지 이어 갈지 정할 수 있다 — DESCRIPTION.
  **페이지의 예 파일은 `hosts: dns [!UNAVAIL=return] files`로 dns를 앞에 둔다** — 곧 차례는 설정이 정하고 `files`가 늘 먼저인 것은 아니다. `hosts: files dns`(hosts 파일을 먼저, 없으면 DNS)는 위 규칙대로 읽은 예이지 man 페이지의 문장이 아니다
- (phase 79 step 9, 2026-11-12에 IPv4로 다시 읽음 — 같은 man-pages 6.19) nsswitch.conf(5)는 `dns` 출처를 `libnss_dns`가 구현한다고만 적고(FILES) resolv.conf를 말하지 않는다(SEE ALSO에만 든다). 그러니 「`hosts:` 줄의 `dns`가 DNS에 묻는 **차례**를 정하고, 물을 DNS 서버의 **주소**는 `/etc/resolv.conf`가 정한다」는
  이 페이지와 아래 「(phase 79 step 9) Linux man-pages — resolv.conf(5) …」 항목을 이은 것이고, 한 문장으로 적힌 곳은 없다

쓰인 곳: (phase 79 step 0에서 쓰일 곳) `dns.hosts-file`(hosts(5) — 줄의 꼴·주석·쓰임·고치면 바로 적용, nsswitch.conf(5) — `hosts:` 줄의 차례가 hosts 파일과 DNS 가운데 무엇을 먼저 볼지 정한다), `dns.domain-hierarchy`(hosts(5) — 이 파일의 호스트 이름 규칙)
(phase 79 step 9에서 쓰일 곳) `linux-servers.resolv-conf`(nsswitch.conf(5) — `/etc/hosts`와 DNS 가운데 무엇을 먼저 볼지는 `hosts:` 줄이 정한다, 그 `dns`가 물을 서버의 주소는 resolv.conf가 정한다 — 두 문서를 이은 것)

## (phase 79 step 0) Microsoft Learn — DNS queries and lookups, DNS zones, Troubleshoot DNS client name resolution issues
https://learn.microsoft.com/en-us/windows-server/networking/dns/queries-lookups
https://learn.microsoft.com/en-us/windows-server/networking/dns/zone-types
https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/troubleshoot-dns-client-resolution-issues

2026-11-12에 IPv4로 내려받아 읽은 판: 「DNS queries and lookups」 `updated_at` 2025-04-28(`ms.date` 2025-02-13, 바닥의 「Last updated on」 2025-03-24), 「DNS zones」 `updated_at` 2025-04-28(`ms.date` 2025-01-31, 「Last updated on」 2025-03-24) — 둘 다 「Applies to」 Windows Server 2016~2025.
「Troubleshoot DNS client name resolution issues」 `updated_at` 2026-02-19(`ms.date` 2026-02-12), 「Applies to」 지원되는 Windows 클라이언트. 한국어판(`ko-kr`)도 내려받아 용어를 봤는데 기계 번역이라 **용어 표기만** 참고한다(아래 줄).

- **DNS queries and lookups**: 클라이언트의 질의에는 FQDN으로 적은 이름, 질의 유형(레코드 유형), 클래스(Windows DNS 서버에서는 늘 IN)가 든다. DNS 서버가 클라이언트 대신 다른 DNS 서버들에 묻고 이름을 풀어 답을 돌려주는 것이 **재귀**, 클라이언트가 서버들의 안내(referral)에 따라 따로 질의를 보내며 스스로 다른 서버에 묻는 것이 **반복**이다 — 「How DNS queries work」
- 같은 문서: 반복은 클라이언트가 재귀를 청했으나 서버가 재귀를 꺼 두었을 때나, 클라이언트가 재귀를 청하지 않았을 때 쓰인다. 반복 질의를 받은 서버는 다른 서버에 묻지 않고 자기가 아는 것(캐시 포함)으로 가장 나은 답을 하고, 모르면 **답에 더 가까운 다른 DNS 서버들의 NS·A 레코드 목록**(referral)을 준다.
  **Windows의 DNS 클라이언트 서비스는 재귀를 하지 않는다** — 「How iteration works」. 기본으로 DNS 클라이언트 서비스는 서버에게 재귀로 끝까지 풀어 달라고 청한다 — 「DNS server query process」
- 같은 문서: 캐시는 자주 묻는 이름의 풀이를 빠르게 하고 **네트워크의 DNS 질의 트래픽을 크게 줄인다**. 캐시한 레코드에는 TTL이 걸리고 TTL이 다하지 않는 동안 그 레코드로 답할 수 있다. Windows DNS 서버에서 대부분의 영역은 레코드의 TTL로 **영역 SOA 레코드에 정한 최소(기본) TTL**을 쓰고, 기본값은 3600초(1시간)이며 레코드마다 따로 정할 수도 있다 — 「How caching works」
- 같은 문서: Windows DNS 서버는 루트 서버들의 NS·A 레코드를 적은 **루트 힌트 파일**(`cache.dns`)로 루트 서버를 찾아 재귀를 한다 — 「How caching works」 Note, 「DNS server query process」
- 같은 문서: **로컬 리졸버 캐시**의 정보는 두 곳에서 온다 — ① 컴퓨터에 Hosts 파일이 있으면 DNS 클라이언트 서비스가 시작할 때 그 파일의 이름-주소 짝을 캐시에 싣는다, ② 이전 질의의 답으로 받은 레코드를 TTL이 정한 시간 동안 캐시에 둔다. 캐시에 맞는 것이 없으면 DNS 서버에 묻는다. DNS 서버를 둘 이상 설정하면 한 서버나 경로가 멈춰도 이름을 풀 수 있다 — 「DNS Client service resolver」
- 같은 문서: DNS 서버는 질의를 받으면 먼저 자기 영역으로 권한 있게 답할 수 있는지 보고, 없으면 캐시를 보고, 그래도 없으면 재귀로 푼다 — 「DNS server query process」. 재귀하는 서버는 `com`을 맡은 서버에 반복 질의를 보내 다음 서버의 안내를 받고, 그 안내를 따라 마지막 서버에게서 권한 있는 답을 받으면 그 답을 클라이언트에 돌려준다.
  그 과정에서 얻은 정보를 캐시에 넣어 뒤의 질의에 쓴다 — 「DNS recursion」
- **DNS zones**: 영역은 DNS 서버가 맡는 DNS 이름 공간의 한 부분이고 레코드를 담는다. Windows DNS 서버의 영역 종류는 **주 영역**(primary zone — 레코드를 만들고 고치고 지우는 쓰기 가능한 원본), **보조 영역**(secondary zone — 주 영역의 읽기 전용 사본으로, 그 영역을 가진 다른 DNS 서버에서 받아 와야 한다), 스텁 영역, 역방향 조회 영역이다 — 「DNS zone types」.
  주 영역을 맡은 서버를 그 영역의 주 DNS 서버, 보조 영역을 맡은 서버를 보조 DNS 서버라 한다. 주·보조·스텁 영역을 맡은 서버는 모두 그 영역의 이름에 권한이 있다 — 「Replicate the DNS database」. 파일에 둔 주 영역의 기본 파일 이름은 `zone_name.dns`, 위치는 `%windir%\System32\Dns`다 — 「Primary zones」
- 같은 문서 「Zone transfer」: 영역 파일을 여러 DNS 서버로 복제하는 것을 영역 전송이라 한다. 영역 전송은 ① 주 DNS 서버가 영역이 바뀌었다고 보조 서버들에 알리거나(NOTIFY — RFC 1996), ② 보조 서버의 서비스가 시작되거나 영역의 **새로 고침 간격**이 지났을 때 보조 서버가 주 서버에 바뀐 것을 물으면서 시작된다.
  Windows에서 SOA의 새로 고침 간격 기본값은 15분이다. 전체 영역 전송(AXFR)과 바뀐 레코드만 옮기는 증분 영역 전송(IXFR) 두 가지가 있다 — 「Types of zone file replication」. 영역 전송은 NS 레코드의 서버나 지정한 서버에만 허락하는 것이 안전하다 — 「Zone transfer settings」
- 한국어판 용어(2026-11-12, 기계 번역): 「Primary zone」을 같은 페이지 안에서 **「기본 영역」과 「주 영역」 두 가지로 섞어 옮기고**, 「Secondary zone」은 「보조 영역」, 「Zone transfer」는 「영역 전송」, 「name resolution」은 「이름 확인」, recursion·iteration은 「재귀」·「반복」, root hints는 「루트 힌트」, FQDN은 「FQDN(정규화된 도메인 이름)」으로 옮긴다(「DNS queries and lookups」 한국어판). DNS 관리자 화면의 실제 메뉴 이름은 이 문서들로 확인하지 못했다
- **Troubleshoot DNS client name resolution issues**: `C:\Windows\System32\drivers\etc`에 있는 Hosts 파일에 그 이름의 줄이 있으면 DNS 서버로 질의가 나가지 않는다. DNS 클라이언트는 이름을 풀 때 **① 캐시 ② Hosts 파일 ③ DNS 서버 질의**의 차례를 쓰기 때문이다 — 「Scenario 2: There's an entry for the domain name in the Hosts file」
- (phase 79 step 5, 2026-11-12 한국어판 다시 받음 — `updated_at` 2026-01-21) 한국어판 「DNS zones」는 Refresh interval을 **「새로 고침 간격」**으로 옮기고, 그 기본값이 영역 SOA에서 15분이라는 것을 같은 절에 적는다. 같은 문서 영문판 「DNS zone types」는 정방향 조회(forward lookup — A 레코드에 적힌 이름으로 찾아 IP 주소를 답으로 기대한다)와
  역방향 조회(reverse lookup — 아는 IP 주소로 컴퓨터 이름을 찾는다)를 가르고, 역방향 이름은 `in-addr.arpa` 아래에 IP 주소의 점 십진 표기의 수를 거꾸로 늘어놓아 만든다고 적는다

쓰인 곳: (phase 79 step 0에서 쓰일 곳) `dns.hosts-file`(Windows Hosts 파일의 위치, 캐시 → Hosts 파일 → DNS 서버 차례, Hosts 파일의 짝이 캐시에 실린다), `dns.domain-hierarchy`(한국어판의 「정규화된 도메인 이름」), `dns.name-servers`(루트 힌트), `dns.dns-zone`(주 영역·보조 영역, 영역 전송이 시작되는 두 길, AXFR·IXFR),
`dns.name-resolution`(DNS 서버는 영역 → 캐시 → 재귀, 재귀하는 서버가 반복 질의로 안내를 따라간다), `dns.recursive-iterative-query`(재귀와 반복, Windows DNS 클라이언트는 재귀를 하지 않고 서버에 재귀를 청한다), `dns.dns-cache-ttl`(캐시가 질의 트래픽을 줄인다, Windows의 기본 TTL은 SOA의 최소 TTL 3600초), 강의 수정 이력 L48
(phase 79 step 5에서 쓰일 곳) `dns.soa-record`(한국어판의 「새로 고침 간격」·기본 15분), `dns.reverse-lookup`(정방향 조회와 역방향 조회, `in-addr.arpa` 아래 수를 거꾸로)

## (phase 79 step 5) RFC 3596 — DNS Extensions to Support IP Version 6
https://www.rfc-editor.org/rfc/rfc3596

rfc-editor 상태는 Internet Standard다(2003-10 Draft Standard로 나왔고 원문 머리는 Standards Track) — RFC 1886·3152를 폐기했고 이 문서를 고친 RFC는 없다(2026-11-12). **AAAA와 `IP6.ARPA`의 한 줄씩만** 가져온다.

- AAAA는 인터넷 클래스에만 있는 레코드 유형으로 IPv6 주소 하나를 담는다(유형 값 28). IPv6 주소가 여럿인 호스트는 AAAA를 여럿 둔다 — §2, §2.1
- 데이터는 128비트 IPv6 주소다 — §2.2. 영역 파일에서는 IPv6 주소의 글자 표기로 적는다 — §2.4
- IPv6 주소로 이름을 찾는 특별한 도메인은 `IP6.ARPA`다. 주소를 4비트(니블)마다 16진수 한 글자로 나눠 **낮은 쪽 니블부터 거꾸로** 점으로 잇고 끝에 `.IP6.ARPA`를 붙인다 — §2.5(절의 예 주소는 옮기지 않는다)

쓰인 곳: (phase 79 step 5에서 쓰일 곳) `dns.resource-records`(AAAA — 128비트 IPv6 주소), `dns.reverse-lookup`(`ip6.arpa` 한 줄 — 니블 단위로 거꾸로)

## (phase 79 step 5) RFC 2308 — Negative Caching of DNS Queries (DNS NCACHE)
https://www.rfc-editor.org/rfc/rfc2308

Proposed Standard(1998-03)이고 RFC 1034·1035를 고쳤으며, RFC 4033~4035·6604·8020·8499·9499·9520이 이 문서를 고쳤다(rfc-editor 상태, 2026-11-12). **SOA MINIMUM의 뜻과 `$TTL`, 부정 응답의 캐시 시간만** 가져온다.

- 부정 캐시(negative caching)는 「무엇이 없다」는 사실을 캐시에 두는 것이다. NXDOMAIN은 이름이 없다는 응답 코드(Name Error)이고, NODATA는 이름은 있지만 물은 유형의 레코드가 없다는 뜻이다 — §1
- SOA의 MINIMUM은 세 뜻(영역의 모든 레코드 TTL의 아래 한도, 영역 파일에서 TTL을 적지 않은 레코드의 기본 TTL, 부정 응답의 TTL)으로 겹쳐 쓰여 왔다. 첫째는 실제로 쓰인 적이 없어 버리고(deprecated), 둘째는 주 서버에서만 뜻이 있으므로 MINIMUM이 아닌 다른 방법으로 정하게 하며,
  **남은 셋째 — 부정 응답에 쓸 TTL — 을 MINIMUM의 새 뜻으로 정한다** — §4
- 영역 파일에 `$TTL <TTL>` 지시어를 더해, 그 뒤에 나오는 레코드 가운데 TTL을 적지 않은 것은 이 값을 TTL로 쓰게 한다 — §4
- 부정 응답에는 TTL을 붙일 레코드가 없으므로 응답의 권한 칸에 그 영역의 SOA를 넣어 TTL을 실어 보내고, 그 TTL은 **SOA의 MINIMUM과 SOA 자신의 TTL 가운데 작은 값**이다. 이 TTL도 보통의 캐시처럼 줄어들고 0이 되면 그 부정 응답을 다시 쓰지 않는다 — §5

쓰인 곳: (phase 79 step 5에서 쓰일 곳) `dns.soa-record`(§4 — MINIMUM의 새 뜻: 「그런 이름이 없다」 같은 부정 응답을 캐시에 둘 시간, §5 — SOA의 MINIMUM과 TTL 가운데 작은 값), `dns.resource-records`(§4 — `$TTL`이 필요하면 한 줄)

## (phase 79 step 5) RFC 1912 — Common DNS Operational and Configuration Errors [Informational — 운영 관례로만 쓴다]
https://www.rfc-editor.org/rfc/rfc1912

Informational(1996-02)이고 RFC 1537을 폐기했다(rfc-editor 상태, 2026-11-12). 표준이 아니라 오래된 운영 지침이라 **관례로만 쓰고 그렇다고 밝힌다**. 이 문서의 SOA 시간 값 권고(몇 분~몇 주)와 MINIMUM 설명(기본 TTL — RFC 2308 이전의 뜻)은 쓰지 않는다.

- SOA에 책임자 메일 주소를 적을 때 `@`를 먼저 `.`로 바꾸고 `@`를 쓰지 않는다. 로컬 부분에 점이 있으면 그 점 앞에 `\`를 붙인다 — §2.2(RFC 1035 §8과 같다)
- 일련번호에 소수를 쓰지 말고, `YYYYMMDDnn`(연·월·일과 그날 몇 번째로 고쳤는지) 꼴을 권한다 — §2.2. **관례의 근거로만 쓴다** — 표준(RFC 1035 §3.3.13)은 부호 없는 32비트 판 번호라고만 하고 꼴을 정하지 않는다
- EXPIRE가 지나도록 주 서버에 닿지 못한 보조 서버는 주 서버에 계속 닿아 보려 하지만 그 영역의 이름 서비스는 멈춘다 — §2.2

쓰인 곳: (phase 79 step 5에서 쓰일 곳) `dns.soa-record`(RNAME의 `@` → `.`, 일련번호를 날짜로 적는 관례 — 「그렇게 적기를 권하는 문서가 있다」로만, EXPIRE 뒤 보조 서버가 답하기를 멈춘다)

## (phase 79 step 5) RFC 1794 — DNS Support for Load Balancing [Informational — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc1794

Informational(1995-04)이고 폐기·개정 관계가 없다(rfc-editor 상태, 2026-11-12). 문서 스스로 인터넷 표준을 정하지 않는다고 적는다. **DNS로 부하를 나누던 방식의 역사와 그 한계만** 가져온다 — 이 문서가 제안하는 BIND 고친 판의 설정은 가져오지 않는다.

- 1986년 무렵 BIND를 고쳐 쓴 방식들 가운데 **A 레코드의 차례를 돌려 내주는** 「Shuffle Address」와 「Round Robin」 코드가 널리 퍼졌다 — §2
- 그 방식은 차례만 돌릴 뿐 **대상 기계의 실제 부하는 따지지 않았다** — §2
- 주소를 여럿 함께 보내자는 요구의 까닭으로, 가장 나은 주소로 알린 기계가 그 레코드의 TTL 안에 멈출 수 있으니 다음 주소들도 함께 알려 복구할 길을 남기자고 적는다 — §2 (C). 곧 DNS가 알려 준 주소의 기계가 멈춰 있을 수 있다
- DNS 프로토콜은 레코드의 차례를 보장하지 않고, 받는 쪽(클라이언트)이 차례를 다시 정할 수 있다(정렬 목록 등) — §4. 차례가 자주 바뀌는 정보를 내주려면 그 레코드의 TTL도 짧게 잡아야 쓸모가 있다 — §4

- (phase 82 step 8) 위 §2 줄(A 레코드의 차례를 돌려 내주는 「Round Robin」, 대상 기계의 실제 부하는 따지지 않는다)이 기출의 라운드 로빈 지문([기출 2025-08-24 #45]·[기출 2026-05-17 #41] — DNS 서버가 질의 순서에 따라 웹 서버들의 IP 주소를 번갈아 답한다)과 맞는다.
  아래 「(phase 82 step 8) RFC 2391 …」 항목의 라운드 로빈(로드 밸런서가 서버를 차례대로 고르는 것)과 같은 이름·같은 생각의 방식이다 — 새로 가져온 사실은 없다
  쓰인 곳: (phase 82 step 11에서 쓰일 곳) `network-devices.load-balancing`(DNS 라운드 로빈과 로드 밸런서 — DNS 라운드 로빈은 부하를 보지 않는다, `dns.dns-round-robin`과 뜻을 맞춘다), `network-devices.balancing-methods`(기출의 라운드 로빈 지문이 DNS 쪽 예를 든다)
- (phase 82 step 11) 쓰인 곳: `network-devices.load-balancing`(문단 8 — DNS 서버는 서버마다의 부하와 멈춤을 보지 않아 멈춘 서버의 주소도 알려 줄 수 있다 — §2와 §2 (C)), `network-devices.balancing-methods`(마지막 문단 — DNS 라운드 로빈도 서버를 차례대로 돌아가며 내놓는다), 문항 n333 해설
쓰인 곳: (phase 79 step 5에서 쓰일 곳) `dns.dns-round-robin`(역사 한 줄, 한계 — 부하를 보지 않는다, 멈춘 기계의 주소도 알려질 수 있다, 받는 쪽이 차례를 다시 정할 수 있다)

## (phase 79 step 5) RFC 6891 — Extension Mechanisms for DNS (EDNS(0))
https://www.rfc-editor.org/rfc/rfc6891

Internet Standard(STD 75, 2013-04)이고 RFC 2671·2673을 폐기했다(rfc-editor 상태, 2026-11-12). **UDP 크기 한도를 넓힌다는 것 한 줄만** 가져온다 — 옵션과 칸은 가져오지 않는다.

- 이 확장 없이 UDP로 보내는 DNS 메시지는 최대 512바이트다 — §1. 이 한도에 여러 IPv6 주소나 DNSSEC 서명 같은 큰 데이터를 담기가 어려워졌다 — §1, §4.3
- EDNS(0)으로 더 큰 응답을 받을 수 있다고 알리면, 잘린 UDP 응답과 그 뒤의 TCP 재시도를 피하게 돕는다 — §4.3. EDNS는 이름 풀이의 구간마다(스텁 리졸버와 재귀 리졸버 사이, 재귀 리졸버와 권한 있는 서버 사이) 따로 맞춘다 — §1

쓰인 곳: (phase 79 step 5에서 쓰일 곳) `dns.dns-transport`(EDNS 한 줄 — 512바이트보다 큰 UDP 응답을 받을 수 있게 하는 확장)

## (phase 79 step 5) RFC 9210 — DNS Transport over TCP - Operational Requirements
https://www.rfc-editor.org/rfc/rfc9210

Best Current Practice(BCP 235, 2022-03)이고 RFC 1123·1536을 고쳤다(rfc-editor 상태, 2026-11-12). RFC 7766이 정한 구현 요건에 맞춰 **운영하는 쪽**의 요건을 정한다.

- 대부분의 DNS 거래는 UDP지만, TCP 위의 DNS를 막으면 여러 통신 실패와 문제 추적의 어려움이 생긴다. 이 문서는 RFC 1123 §6.1.3.2를 고쳐 모든 리졸버·재귀 서버가 TCP와 UDP 질의를 함께 지원하게 하고, RFC 1536의 「TCP는 영역 전송에만 쓴다」는 오해를 지운다 — §1, §2.5, §3
- 모든 DNS 리졸버와 서버는 UDP와 TCP 질의를 함께 지원하고 처리해야 한다. 서버(전달자 포함)는 UDP로 보내기에 큰 응답을 클라이언트가 받을 수 있게 TCP 질의를 받아야 하고, 클라이언트는 잘린 UDP 응답을 다시 물을 수 있게 TCP로 질의를 보낼 수 있어야 한다 — §3
- **DNS 서버 운영자와 망 운영자는 DNS 서비스를 UDP와 TCP 둘 다로 허용해야 한다(MUST)**. TCP 위의 DNS를 걸러 막는 것은 대체로 해롭다 — §3, §5
- TCP를 막은 곳에서는, 잘렸다는 표시(TC)를 받은 리졸버가 TCP로 다시 물어도 닿지 못하고 시간이 다 될 때까지 자원을 붙잡는다 — §5.1

쓰인 곳: (phase 79 step 5에서 쓰일 곳) `dns.dns-transport`(§3 — 방화벽은 UDP 53과 TCP 53을 함께 연다, §1·§2.5 — 「TCP는 영역 전송에만」은 오해, §5.1 — 막으면 생기는 일), `linux-servers.bind-named`(같은 사실 — BIND 쪽은 step 9가 본다), 기출 대조(`exam-notes.md` 「phase 79 step 5」 문단 — [기출 2025-05-25 #42])

## (phase 79 step 5) DNSSEC — RFC 9364(BCP 237), RFC 4033, RFC 4034, RFC 4035
https://www.rfc-editor.org/rfc/rfc9364
https://www.rfc-editor.org/rfc/rfc4033
https://www.rfc-editor.org/rfc/rfc4034
https://www.rfc-editor.org/rfc/rfc4035

상태(rfc-editor 2026-11-12): RFC 9364는 Best Current Practice(BCP 237, 2023-02)이고 다른 RFC를 고치지 않는다. RFC 4033·4034·4035는 Proposed Standard(2005-03)이고 RFC 2535 등을 폐기했으며 RFC 1034·1035·2181·2308 등을 고쳤다. RFC 4033은 RFC 6014·6840이, RFC 4034·4035는 RFC 6840 등이 고쳤다.
**키 관리·서명 알고리즘·NSEC·NSEC3는 가져오지 않는다.**

- 지금 DNSSEC이라 부르는 것의 핵심 명세는 RFC 4033·4034·4035 셋이다(RFC 6840이 고치고 넓혔지만 동작 방식은 그대로다). RFC 9364는 그 문서들을 한곳에 모아 소개하고 다른 문서가 DNSSEC을 가리킬 때 쓰는 문서다 — RFC 9364 Abstract, §1.
  **DNS 데이터의 출처 인증에 DNSSEC을 쓰는 것이 지금의 최선 관행(BCP)이고, 표준 트랙 RFC 가운데 DNS 데이터의 출처를 인증하는 다른 방법은 없다** — §1.1
- DNSSEC은 DNS 데이터에 **출처 인증(origin authentication)과 무결성 보호**를 주고 공개 키를 나누는 수단도 준다. **기밀성은 주지 않는다** — RFC 4033 §1. DNS는 누가 묻든 같은 답을 내고 모든 데이터가 보인다는 전제로 설계되어, DNSSEC도 기밀성이나 접근 제어를 주도록 설계하지 않았다. 서비스 거부 공격도 막지 않는다 — RFC 4033 §4
- 새 레코드 유형 넷 — RRSIG(레코드 묶음의 서명), DNSKEY(공개 키), DS(위임 서명자), NSEC — 과 헤더 비트 CD·AD를 더하고, 커진 메시지를 위해 EDNS0과 DO 비트를 요구한다 — RFC 4033 §3
- **서명과 확인**: 영역은 자기 권한 있는 레코드 묶음을 개인 키로 서명하고 짝인 공개 키를 DNSKEY 레코드에 둔다. 리졸버는 그 공개 키로 서명을 확인해 레코드 묶음을 인증한다 — RFC 4034 §2. 서명은 RRSIG 레코드에 담기고, 서명이 유효한 기간과 확인에 쓸 DNSKEY를 찾는 정보가 함께 있다 — RFC 4034 §3.
  서명하는 키는 그 영역에 딸린 것이지 그 영역의 네임 서버에 딸린 것이 아니다 — RFC 4033 §3.1
- **믿음의 사슬**: DS 레코드는 위임하는 쪽(부모 영역)에만 있고, 자식 영역의 DNSKEY를 가리킨다(그 키의 요약값 등을 담는다). DS를 인증하면 그것이 가리키는 DNSKEY를 인증할 수 있다 — RFC 4034 §5. 그래서 인증 사슬은 보통 DNSKEY에서 시작해 「DS → DNSKEY」를 되풀이하며 레코드 묶음까지 이어지고,
  보안을 아는 리졸버는 미리 설정한 루트의 공개 키에서 시작해 아래 영역으로 사슬을 잇는다. 리졸버에는 신뢰 앵커가 적어도 하나 설정돼 있어야 한다 — RFC 4033 §3.1
- **누가 확인하나**: 대부분의 질의는 스텁 리졸버에서 나오고 스텁 리졸버는 이름 풀이를 재귀 서버에 맡긴다. 스스로 확인하지 않는 스텁 리졸버도 재귀 서버가 보안을 알면 DNSSEC의 덕을 보지만, 그러려면 그 재귀 서버와 둘 사이의 통신을 믿어야 한다 — RFC 4033 §7
- **CNAME과 DNSSEC**: 서명된 영역에서 CNAME이 있는 이름에는 RRSIG·NSEC이 반드시 함께 있어야 하고, 그 밖의 유형은 둘 수 없다(보안 동적 갱신용 KEY만 예외). CNAME 옆에 다른 데이터를 두지 않는다는 RFC 1034의 원래 정의를 이렇게 고쳤다 — RFC 4035 §2.5

쓰인 곳: (phase 79 step 5에서 쓰일 곳) `dns.dnssec`(출처 인증·무결성, 기밀성 없음, RRSIG·DNSKEY·DS, 위 영역이 아래 영역의 키를 보증하는 사슬, 확인하는 쪽은 보통 재귀 서버), `dns.resource-records`(CNAME 옆에 둘 수 있는 DNSSEC 레코드 한 줄이 필요하면), 기출 대조(`exam-notes.md` 「phase 79 step 5」 문단 — [기출 2025-11-02 #42])

## (phase 79 step 5) RFC 3833 — Threat Analysis of the Domain Name System (DNS) [Informational]
https://www.rfc-editor.org/rfc/rfc3833

Informational(2004-08)이고 폐기·개정 관계가 없다(rfc-editor 상태, 2026-11-12). **DNSSEC이 막으려는 위협에 이름을 붙이는 데만** 쓴다.

- 패킷을 가로채거나 질의를 엿보고 거짓 응답을 진짜보다 먼저 리졸버에 보내는 공격은, DNS가 보통 질의나 응답 하나를 **서명도 암호화도 하지 않은 UDP 패킷 하나**로 보내서 특히 쉽다 — §2.1
- 질의 ID(16비트)와 포트를 맞혀 거짓 응답을 끼워 넣는 공격도 있다 — §2.2. 이름에 기댄 공격들을 흔히 **「cache poisoning」(캐시 오염)** 공격이라 부르고, 응답에 실린 레코드를 고리로 피해자의 캐시에 나쁜 데이터를 넣는다 — §2.3
- DNSSEC은 데이터를 만든 쪽(영역 관리자)에서 쓰는 쪽까지 끝에서 끝으로 무결성을 확인하게 해 이런 가로채기 공격에 더 나은 해법이고, 서명을 스스로 확인하는 리졸버는 위조 응답을 알아챈다 — §2.1, §2.2

쓰인 곳: (phase 79 step 5에서 쓰일 곳) `dns.dnssec`(막으려는 것 — 가짜 응답을 리졸버의 캐시에 넣는 공격, 흔히 「캐시 오염」이라 부른다)

## (phase 79 step 5) Microsoft Learn — Windows Server DNS: Manage DNS resource records, DNS Architecture in Windows Server, Reverse lookup, What is DNSSEC?, Validate and secure DNS responses using DNSSEC, Dnscmd
https://learn.microsoft.com/en-us/windows-server/networking/dns/manage-resource-records
https://learn.microsoft.com/en-us/windows-server/networking/dns/dns-architecture
https://learn.microsoft.com/en-us/windows-server/networking/dns/reverse-lookup
https://learn.microsoft.com/en-us/windows-server/networking/dns/dnssec-overview
https://learn.microsoft.com/en-us/windows-server/networking/dns/validate-dnssec-responses
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/dnscmd

2026-11-12에 IPv4로 내려받아 읽은 판(모두 「Applies to」 Windows Server 2016~2025. Dnscmd는 Windows 10·11 등도 든다): 「Manage DNS resource records」 `updated_at` 2024-10-17(`ms.date` 2023-06-14), 「DNS Architecture in Windows Server」 2025-04-28(2025-02-06), 「Reverse lookup」 2025-04-28(2025-02-13),
「What is DNSSEC?」 2024-10-17(2023-06-05), 「Validate and secure DNS responses using DNSSEC」 2025-04-28(2025-02-17), 「Dnscmd」 2025-10-22(2024-03-21). 한국어판(`ko-kr`, 기계 번역)은 앞의 넷과 Dnscmd를 받았고 `updated_at`이 모두 2026-01-21이다 — **용어 표기만** 참고한다.

- **Manage DNS resource records**: DNS 관리자(DNS Manager)에서 만들 수 있는 레코드는 Host (A or AAAA)·Alias (CNAME)·Mail Exchanger (MX)·Pointer (PTR)·Service Locator (SRV)·Text (TXT)다. 정방향 조회 영역(Forward Lookup Zone)을 오른쪽 단추로 눌러
  **New Host (A or AAAA)**(IPv4·IPv6 모두 이 메뉴 — 이름과 IP 주소를 넣는다), **New Alias (CNAME)**(별칭 이름과 대상 호스트의 FQDN을 넣는다), **New Mail Exchanger (MX)**(호스트나 자식 도메인 — 비우면 부모 도메인, 메일 서버의 FQDN, 메일 서버 우선순위를 넣는다)를 고르고, TXT는 **Other New Records**에서 Text (TXT)를 고른다.
  PTR은 **역방향 조회 영역**(Reverse Lookup Zone)을 오른쪽 단추로 눌러 **New Pointer (PTR)**을 고르고 호스트 IP 주소와 호스트 이름을 넣는다 — 「Create resource records」(예의 이름·주소는 옮기지 않는다)
- 같은 문서 한국어판의 표기: 「정방향 조회 영역」·「역방향 조회 영역」·「새 호스트(A 또는 AAAA)」·「새 별칭(CNAME)」·**「새 MX(메일 교환기)」**·「새 포인터(PTR)」·「다른 새 레코드」·「텍스트(TXT)」·「새 리소스 레코드」. **실제 한국어 화면의 메뉴 이름은 확인하지 못했다** — 기출은 「새 메일 교환기(MX)」로 적는다
- **DNS Architecture in Windows Server**: DNS는 계층형 분산 데이터베이스다. 레코드 유형 표 — Host (A, AAAA)는 호스트 이름을 IP 주소로 잇는다. Alias (CNAME)는 별칭인 도메인 이름이나 하위 도메인 이름을 다른 정식 이름으로 넘기고, 한 호스트를 여러 DNS 이름으로 가리키게 한다.
  Mail exchanger (MX)는 메일을 주고받는 컴퓨터의 이름을 정하고, 메일 응용은 받는 사람 주소의 도메인으로 MX를 찾으며 MX가 여럿이면 **우선순위 값이 작은 것부터** 연결해 본다. Pointer (PTR)는 역방향 조회에서 IP 주소를 도메인으로 잇고 `in-addr.arpa` 아래 영역에 두며, PTR을 만들려면 알맞은 역방향 조회 영역이 서버에 있어야 한다.
  Name server (NS)는 그 도메인의 권한 있는 네임 서버를 정한다. Text (TXT)는 DNS에 글을 실어 질의로 돌려주고 영역의 소유를 확인하는 데 흔히 쓴다. Start of authority (SOA)는 영역의 권한 정보(주 네임 서버, 영역 관리자의 연락처, 새로 고침 정보 등)를 담는다 — 「DNS resource records」
- 같은 문서: **모든 영역 파일의 첫 레코드는 SOA다**. SOA는 영역의 주 DNS 서버를 그 영역 데이터의 가장 좋은 출처로 가리킨다 — 「Zones and delegation」
- 같은 문서: TTL을 정할 때는 캐시한 정보의 정확도와, DNS 서버의 사용률·네트워크 트래픽이 맞선다. **TTL이 짧으면 낡은 정보를 쓸 가능성은 크게 줄지만 만료된 데이터를 다시 물어야 해 DNS 서버 사용률과 트래픽이 늘고, 길면 서버 사용률과 트래픽은 줄지만 캐시한 답이 낡아 틀린 답을 줄 수 있다**.
  DNS 서버 서비스가 만드는 대부분의 레코드는 SOA의 최소(기본) TTL 1시간을 물려받는다. TTL을 0으로 두면 서버가 만료된 데이터를 끊임없이 다시 물어 성능에 큰 영향을 주므로 권하지 않는다 — 「Time-to-Live for resource records」
- 같은 문서 한국어판의 표기: SOA를 「SOA 레코드(권한 부여 시작)」·「SOA(권한 시작)」로 옮긴다
- **Reverse lookup**: 정방향 조회는 다른 컴퓨터의 DNS 이름(A 레코드에 적힌 것)으로 찾아 IP 주소를 답으로 기대하고, 역방향 조회는 아는 IP 주소로 컴퓨터 이름을 찾는다. `in-addr.arpa` 아래 이름은 점 십진 표기의 수를 거꾸로 늘어놓아 만든다 —
  **IP 주소는 왼쪽에서 오른쪽으로 읽으면 네트워크 부분에서 시작해 호스트 부분으로 끝나, DNS 이름과 읽는 방향이 반대이기 때문이다**. PTR은 역방향 조회 영역에, 보통 정방향 조회 영역의 호스트(A) 레코드에 대응하는 짝을 만든다. IPv6의 역방향 영역은 `ip6.arpa`를 쓴다 — 「How reverse lookup works」
- 같은 문서: **PTR과 역방향 조회 영역은 DNS 표준 구현에서 선택 사항이라 꼭 둘 필요는 없지만, 일부 네트워크 응용이 보안 검사에 쓴다** — Note. 역방향 질의의 차례: 클라이언트가 그 주소의 PTR을 묻고, 리졸버가 주소를 거꾸로 하고 `in-addr.arpa`를 붙인 FQDN(끝에 점)을 만들어 역방향 조회 영역에서 찾으며,
  그 이름의 권한 있는 서버가 PTR(호스트의 DNS 도메인 이름)로 답한다. 물은 서버가 답할 수 없으면 정방향 조회와 똑같이 재귀나 반복으로 권한 있는 서버를 찾는다 — 「Example: IPv4 Reverse query」(예의 주소·이름은 옮기지 않는다). 한국어판은 「정방향 조회 영역」·「역방향 조회 영역」·「역방향 조회」로 옮긴다
- **What is DNSSEC?**: DNSSEC은 DNS 응답을 검증할 수 있게 해 DNS 프로토콜에 보안을 더하는 확장 묶음이고, **출처 인증(origin authority)·데이터 무결성·존재하지 않음의 인증**을 준다. 이것으로 DNS 스푸핑 공격 같은 공격에 덜 취약해진다. DNSSEC을 지원하는 권한 있는 서버에서 영역을 서명(zone signing)하면,
  질의와 응답의 기본 방식은 그대로 둔 채 응답에 실린 전자 서명으로 검증하게 된다. 핵심 명세는 RFC 4033·4034·4035다. 레코드: RRSIG(서명), NSEC·NSEC3(이름이 없음을 증명), DNSKEY(서명을 확인하는 공개 키), DS(위임을 보호하고 자식 영역으로 인증 사슬을 잇는다 — 부모 영역에 두며 서명할 때 저절로 생기지 않는다).
  DNSKEY·DS를 신뢰 앵커(trust anchor)라고도 하고, 응답을 검증하는 권한 없는 DNS 서버(재귀 서버)들에 나눠 줘야 한다. Windows Server 2012 이후의 DNS 서버는 NSEC·NSEC3를 함께 지원한다 — 「How DNSSEC works」, 「Trust anchors」. 한국어판은 「원본 인증, 데이터 무결성」·「DNS 스푸핑 공격」·「트러스트 앵커」로 옮긴다
- **Validate and secure DNS responses using DNSSEC**: DNSSEC을 아는 재귀(또는 전달) DNS 서버가 서명된 영역에 대한 클라이언트의 질의를 받으면 권한 있는 서버에 DNSSEC 레코드도 보내 달라고 하고, DNSKEY로 서명을 확인해 맞으면 요청한 데이터로 답하고 맞지 않으면 `SERVFAIL`로 답한다 —
  그래서 클라이언트가 DNSSEC을 몰라도 신뢰 앵커를 가진 재귀 서버가 스푸핑 공격을 막는다. 검증했는지는 응답의 AD 비트로 알린다 — 「Recursive DNS」, 「DNS query and response process」
- **Dnscmd**: `dnscmd /config /roundrobin [0|1]`은 같은 이름에 호스트 레코드가 여럿일 때 돌려줄 차례를 정한다. 0이면 라운드 로빈을 쓰지 않고 모든 질의에 첫 레코드부터 돌려주고, **1이면 맞는 레코드 목록을 위에서 아래로 돌아가며 바꿔 내준다 — 기본값이 1(켜짐)이다**.
  `/localnetpriority [0|1]`은 1(기본)이면 질의한 클라이언트와 비슷한 네트워크 주소의 레코드를 먼저 돌려주고, 0이면 데이터베이스에 적힌 차례대로 돌려준다 — 「dnscmd /config command」. **DNS 관리자 화면에서 이 설정을 바꾸는 자리(탭·확인란 이름)는 이 문서들로 확인하지 못했다**

쓰인 곳: (phase 79 step 5에서 쓰일 곳) `dns.resource-records`(DNS 관리자의 메뉴 이름 — 영문과 한국어판 표기, 레코드 유형 표, MX는 값이 작은 것부터), `dns.soa-record`(모든 영역 파일의 첫 레코드는 SOA, TTL이 길면 서버 사용률이 줄고 짧으면 는다),
`dns.reverse-lookup`(정방향·역방향 조회, 거꾸로 적는 까닭, PTR은 A와 짝지어 따로 만든다, 역방향 조회는 선택이지만 보안 검사에 쓰인다, 역방향 조회 영역), `dns.dns-round-robin`(Dnscmd — 기본 켜짐, 끄면 첫 레코드부터, 서브넷 우선순위 기본 켜짐),
`dns.dnssec`(출처 인증·무결성, 스푸핑 공격, 레코드 이름, 신뢰 앵커, 재귀 서버가 검증한다, Windows Server 2016~2025가 지원한다), 기출 대조(`exam-notes.md` 「phase 79 step 5」 문단)

## (phase 79 step 5) Microsoft Learn — Win32 DNS 참조(Resource Records, MicrosoftDNS_SOAType, Modify method of the MicrosoftDNS_SOAType class)와 Windows Server 문제 해결 문서 둘
https://learn.microsoft.com/en-us/windows/win32/dns/resource-records
https://learn.microsoft.com/en-us/windows/win32/dns/microsoftdns-soatype
https://learn.microsoft.com/en-us/windows/win32/dns/microsoftdns-soatype-modify
https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/how-to-use-netmask-ordering-round-robin-feature
https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/configure-subnetted-reverse-lookup-zone

2026-11-12에 IPv4로 내려받아 읽은 판: 「Resource Records」 `updated_at` 2025-03-11(`ms.date` 2018-05-31), 「MicrosoftDNS_SOAType class」·「Modify method …」 `updated_at` 2020-12-11(`ms.date` 2018-05-31 — 요구 사항: Windows 2000 Server부터, 한국어판 2026-07-05),
「Description of the netmask ordering feature and the round robin feature in Windows Server 2003 DNS」(KB 842197) `updated_at` 2026-02-19 — 머리는 「지원되는 Windows Server」지만 **본문의 적용 대상은 Windows Server 2003**이다, 「How to configure a subnetted reverse lookup zone」 `updated_at` 2026-02-19(「Applies to」 지원되는 Windows Server, 한국어판 2026-10-14).

- **Resource Records**(Win32): 레코드는 영역 파일에 들어가는 정보의 단위다. 영역 파일에 A 레코드를 한 줄로 적으면 칸이 다섯이다 — 소유자, TTL(초), 클래스(거의 늘 인터넷 클래스 IN), 유형, 데이터(RDATA — A면 32비트 IP 주소)(예의 이름·주소는 옮기지 않는다).
  흔히 쓰는 유형을 Start of authority (SOA)·Name server (NS)·Pointer record (PTR)·Address (A)·IPv6 Address (AAAA)·Mail exchange (MX)·Canonical name (CNAME) 같은 이름으로 든다
- **MicrosoftDNS_SOAType**(Windows DNS의 WMI 클래스): SOA의 필드를 SerialNumber(SOA의 일련번호)·PrimaryServer(그 영역의 권한 있는 DNS 서버)·ResponsibleParty(그 영역의 책임자 이름)·RefreshInterval(영역을 새로 고치기까지의 초)·RetryDelay(실패한 새로 고침을 다시 해 보기까지의 초)·
  ExpireLimit(응답하지 않는 영역이 권한을 잃기까지의 초)·MinimumTTL(그 영역의 레코드를 캐시에 둘 수 있는 시간의 아래 한도, 초)로 부른다 — 「Properties」
- **Modify method**: SerialNumber는 영역이 고쳐진 횟수를 나타내고 보조 서버가 영역 전송이 필요한지 판단하는 데 쓴다. **ResponsibleParty는 책임자의 메일함 주소를 `alias.domain` 꼴로 적고 `@` 대신 점을 쓴다**. ExpireLimit은 보조 서버가 주 서버의 응답을 기다리다 영역 사본을 무효로 버리기까지의 초다.
  MinimumTTL은 TTL을 따로 적지 않은 레코드에 쓰는 TTL이라고 적는다 — 「Parameters」. (MinimumTTL을 SOAType은 「캐시의 아래 한도」로, Modify는 「기본 TTL」로 적어 두 쪽이 다르다 — RFC 2308 §4가 정리한 MINIMUM의 옛 뜻 둘이다)
- 같은 두 문서의 한국어판 표기(기계 번역): 「SOA 일련 번호」·「주 서버」·「책임 당사자의 사서함 주소」·「at 기호(@)가 아닌 마침표」. **DNS 관리자 SOA 탭의 실제 필드 이름(영문·한국어)은 확인하지 못했다** — 기출은 「일련번호」·「주 서버」·「책임자」·「새로 고침 간격」으로 적는다(「새로 고침 간격」은 한국어판 「DNS zones」에 있다)
- **KB 842197(Windows Server 2003)**: 라운드 로빈은 같은 이름의 A 레코드 여럿을 질의마다 다른 차례로 내놓아 기본적인 부하 분산을 한다. 질의마다 다른 주소가 맨 위에 오므로 클라이언트들이 늘 같은 서버로 가지 않는다. 넷마스크 차례(netmask ordering)는 클라이언트에 가까운 주소를 앞에 둔다. Windows 2000 Server 처음 판은 둘을 함께 쓸 수 없었고 Windows Server 2003부터 함께 쓸 수 있다 — 「More information」.
  **옛 판의 문서라 지금 판(Windows Server 2016~2025)의 기본값은 위 Dnscmd 항목으로 적는다**
- **How to configure a subnetted reverse lookup zone**: DNS 관리자에서 A(호스트) 레코드를 만들 때 쓰는 **「Create Associated PTR record」 확인란**(한국어판 「연결된 PTR 레코드 만들기」)이 있다 — 이 문서는 그 확인란이 서브넷으로 나눈 역방향 조회 영역에서는 동작하지 않는다는 문맥에서 이름을 든다 — 「More information」 Note.
  곧 PTR은 A와 따로 있는 레코드이고, A를 만들 때 함께 만들도록 고를 수 있다는 것까지만 쓴다. **그 확인란이 기본으로 켜져 있는지는 확인하지 못했다**

쓰인 곳: (phase 79 step 5에서 쓰일 곳) `dns.resource-records`(Win32 「Resource Records」 — 한 줄의 다섯 칸), `dns.soa-record`(Windows 쪽 필드 이름 — 영문 WMI 이름과 한국어판 표기, 책임자 칸은 `@` 대신 점), `dns.reverse-lookup`(「Create Associated PTR record」 확인란 — A를 만들 때 PTR도 함께 만들도록 고를 수 있다),
`dns.dns-round-robin`(KB 842197 — 질의마다 맨 위 주소가 바뀌어 클라이언트들이 나뉜다, 넷마스크 차례), 기출 대조(`exam-notes.md` 「phase 79 step 5」 문단)

## (phase 79 step 9) Linux man-pages — resolv.conf(5), resolver(3), bind(2); systemd — systemd-resolved.service(8)
https://man7.org/linux/man-pages/man5/resolv.conf.5.html
https://man7.org/linux/man-pages/man3/resolver.3.html
https://man7.org/linux/man-pages/man2/bind.2.html
https://man7.org/linux/man-pages/man8/systemd-resolved.service.8.html

2026-11-12에 IPv4로 내려받아 읽은 판: resolv.conf(5)·resolver(3)·bind(2)은 Linux man-pages 6.19(man-pages-6.19 타르볼, 2026-09-09에 가져옴, HTML 2026-09-09) — 바닥줄 날짜는 resolv.conf(5) 2026-08-22, resolver(3)·bind(2) 2026-02-08.
systemd-resolved.service(8)은 systemd 262~devel(systemd 저장소에서 2026-08-04에 가져옴). FHS §3.7.3(`/etc` 아래 resolv.conf)은 위 「(phase 75) FHS 3.0」 항목에 이미 있다.

- **resolv.conf(5)**: 리졸버는 C 라이브러리 안에서 DNS에 묻는 함수들의 묶음이고, `/etc/resolv.conf`는 그 리졸버의 설정 파일이다. 한 프로세스가 리졸버 함수를 처음 부를 때 읽는다. 사람이 읽을 수 있게 만든 파일이고 키워드와 값을 늘어놓는다 — DESCRIPTION 첫 문단
- resolv.conf(5): 한 줄에 키워드 하나와 그 값을 적는다. 키워드(예: `nameserver`)가 줄 맨 앞에 오고 값은 빈칸으로 띄운다. 첫 칸이 `;`나 `#`인 줄은 주석이다 — DESCRIPTION 끝 문단
- resolv.conf(5) — `nameserver`: 리졸버가 물을 이름 서버(DNS 서버)의 IP 주소 하나를 적는다(IPv4 또는 IPv6). 한 줄에 하나씩, 지금은 **3개까지**(MAXNS — `<res_state.h>`). 여럿이면 **적은 차례대로** 묻는다 —
  한 서버에 물어 시간이 다 되면 다음 서버에 묻고, 끝까지 가면 처음부터 다시 돌며 정해진 재시도 횟수까지 묻는다. **`nameserver` 줄이 하나도 없으면 이 컴퓨터 자신의 이름 서버에 묻는다** — DESCRIPTION 「nameserver」.
  기다리는 시간의 기본은 5초(`options timeout:n`), 재시도 횟수의 기본은 2(`options attempts:n`)다 — 「options」
- resolv.conf(5): **이 파일이 아예 없으면** 이 컴퓨터의 이름 서버에만 묻고, 검색 목록은 호스트 이름에서 얻은 로컬 도메인 하나다 — DESCRIPTION 둘째 문단
- resolv.conf(5) — `search`: 짧은 이름 뒤에 붙여 볼 도메인 목록을 빈칸으로 띄워 적는다. 적지 않으면 로컬 도메인 하나다(호스트 이름의 첫 점 뒤 전부, 점이 없으면 루트). 이름 안의 점이 `ndots`(기본 1)개보다 적으면 목록의 도메인을 차례로 붙여 맞는 것이 나올 때까지 묻는다.
  `search` 줄이 여럿이면 마지막 줄만 쓴다. glibc 2.25까지는 도메인 6개·256자로 묶였고 glibc 2.26부터는 제한이 없다. 목록의 도메인을 맡은 서버가 가까이 없으면 느리고 질의가 많이 생길 수 있다 — DESCRIPTION 「search」
- resolv.conf(5) — `options ndots:n`: 이름에 점이 n개 이상이면 검색 목록을 붙이기 전에 그 이름 그대로 먼저 묻는다. 기본 n은 1이다 — 「options」. 곧 점이 없는 짧은 이름(예: 호스트 이름 하나)은 기본 설정에서 `search`의 도메인을 붙여 먼저 묻는다
- resolv.conf(5): **`domain`은 `search`의 옛 이름**이고 도메인 하나만 다룬다 — DESCRIPTION 「search」 끝
- resolv.conf(5) — `options rotate`: 적은 서버들 가운데 돌아가며 골라 질의 부담을 나눈다(켜지 않으면 늘 첫 서버부터 묻는다). `options no-reload`(glibc 2.26부터)는 바뀐 설정 파일을 저절로 다시 읽는 것을 끈다 — 곧 그 판부터는 고친 파일을 저절로 다시 읽는 것이 기본이다(옵션 설명에서 이어 읽은 것) — 「options」
- **resolver(3)**: `res_init()`·`res_ninit()`은 설정 파일(resolv.conf(5))을 읽어 기본 도메인 이름과 이름 서버 주소를 얻고, 서버가 적혀 있지 않으면 로컬 호스트에 묻는다 — DESCRIPTION
- **systemd-resolved.service(8)** — 「/ETC/RESOLV.CONF」: `/etc/resolv.conf`를 다루는 방식이 넷이다. ① systemd-resolved가 늘 새로 고쳐 두는 `/run/systemd/resolve/stub-resolv.conf`(로컬 스텁 `127.0.0.53` 하나와 검색 도메인 — 권장)를 `/etc/resolv.conf`가 심볼릭 링크로 가리킨다,
  ② 검색 도메인 없이 `127.0.0.53`만 적은 정적 파일 `/usr/lib/systemd/resolv.conf`를 가리킨다, ③ systemd-resolved가 알고 있는 DNS 서버를 모두 적어 늘 새로 고쳐 두는 `/run/systemd/resolve/resolv.conf`를 가리킨다, ④ **다른 패키지가 `/etc/resolv.conf`를 관리하고** systemd-resolved는 그것을 읽기만 한다.
  어느 방식인지는 그 파일이 무엇을 가리키는지(또는 `127.0.0.53`을 적었는지)로 저절로 정해진다. 곧 **`/etc/resolv.conf`의 내용을 사람이 아니라 다른 프로그램이 만들어 고쳐 두기도 한다** — 「/ETC/RESOLV.CONF」.
  systemd-resolved가 물을 DNS 서버는 자기 설정 파일, 인터페이스별 설정, **DHCP로 받은 값** 등에서 정한다 — DESCRIPTION. **DHCP 클라이언트가 `/etc/resolv.conf`를 직접 고쳐 쓴다는 문장은 이날 읽은 허용 출처에서 찾지 못했다**
- **bind(2)**: 소켓에 주소(인터넷 소켓이면 IP 주소와 포트)를 붙인다. 실패 까닭에 **「그 주소가 보호되어 있는데 사용자가 슈퍼유저가 아니다」(EACCES)**와 **「그 주소를 이미 쓰고 있다」(EADDRINUSE)**가 있다 — DESCRIPTION, ERRORS.
  위 「(phase 77) Linux man-pages — ip(7) …」 항목(1024보다 작은 포트는 특권 프로세스만 묶는다, 한 주소·포트 쌍에는 소켓 하나만 묶인다)과 같은 사실을 오류 쪽에서 본 것이다

쓰인 곳: (phase 79 step 9에서 쓰일 곳) `linux-servers.resolv-conf`(resolv.conf(5) — 파일의 뜻, 줄의 꼴과 주석, `nameserver`의 수·차례·없을 때, `search`·`ndots`·`domain`, 파일이 없을 때; resolver(3); systemd-resolved.service(8) — 다른 프로그램이 이 파일을 관리하기도 한다),
`linux-servers.apache-listen`(bind(2) — 1024보다 작은 포트는 슈퍼유저가 아니면 EACCES, 이미 쓰는 주소·포트는 EADDRINUSE), 기출 대조(`exam-notes.md` 「phase 79 step 9」 문단 — [기출 2024-05-19 #28])

## (phase 79 step 9) ISC BIND 9 Administrator Reference Manual(9.20.30) — §1 Introduction, §3 Configurations and Zone Files, §5.3.1 Validation Failures, §8 Configuration Reference(named.conf, options·zone 블록); Manual Pages — named, named-checkconf, named-checkzone, rndc
https://bind9.readthedocs.io/en/stable/chapter1.html
https://bind9.readthedocs.io/en/stable/chapter3.html
https://bind9.readthedocs.io/en/stable/chapter5.html
https://bind9.readthedocs.io/en/stable/reference.html
https://bind9.readthedocs.io/en/stable/manpages.html

bind9.readthedocs.io의 안정판(`en/stable/`)을 2026-11-12에 IPv4로 내려받아 읽었다 — 문서 제목은 「BIND 9 9.20.30 documentation」이고, §1.1이 이 설명서가 BIND 9.20.30을 다룬다고 밝힌다(저작권 Internet Systems Consortium).
판 노트(`notes.html`)도 받아 문 이름을 찾는 데만 썼다. **문의 기본값은 판마다 바뀔 수 있다** — 아래 값은 모두 9.20.30 설명서의 것이다.

- **BIND**: Berkeley Internet Name Domain의 줄임이고, 여러 운영체제에서 도는 도메인 이름 서버 소프트웨어다. 만드는 곳은 Internet Systems Consortium(ISC)이고 지금 판은 BIND 9다 — §1.1
- BIND 9는 DNS 프로토콜 전체를 구현하고, `named.conf`로 설정해 **권한 있는 네임 서버, 리졸버(재귀 서버), (지원하는 호스트에서는) 스텁 리졸버**로 쓸 수 있다. 한 서버가 권한 있는 서버와 리졸버를 함께 맡을 수도 있다 — §1.4.6
- **named(8)**: `named`는 BIND 9 배포판의 DNS 서버 프로그램이다. **인자 없이 실행하면 기본 설정 파일 `/etc/named.conf`를 읽고**, 데이터를 읽어 들인 뒤 질의를 기다린다. `-c 파일`로 다른 설정 파일을 쓸 수 있고,
  `directory`로 작업 디렉터리가 바뀌어도 다시 읽을 수 있게 그 경로는 절대 경로로 주라고 한다 — 「named - Internet domain name server」 Description, Options `-c`
- **설정 파일의 자리를 두 곳이 다르게 말한다**: §3.1은 `named.conf`가 보통 `/etc/namedb`나 `/usr/local/etc/namedb`에 있다고 적고, named(8)·named-checkconf(8)은 따로 정하지 않으면 `/etc/named.conf`를 읽는다고 적는다.
  곧 자리는 설치에 따라 다르고, 쓸 수 있는 것은 「`named`가 따로 정하지 않으면 읽는 파일은 `/etc/named.conf`다(named(8))」까지다
- **named.conf의 짜임**: 주석, 블록(block), 문(statement) 셋으로 이루어진다. 블록은 문을 담는 그릇이고 그 안의 문이 걸리는 범위를 정한다 — `options`·`logging`처럼 맨 위에만 놓이는 블록과, `zone example.com { … };`처럼 이름을 붙여 여러 번 놓는 블록이 있다.
  문은 BIND의 동작 하나를 정하고 값 하나(예: `recursion yes;`)나 인자·값 짝을 받는다. 같은 문을 `options`에 두면 서버 전체에, `zone`에 두면 그 영역에만 걸리고 영역 쪽이 앞선다(문마다 놓일 수 있는 블록이 정해져 있다) — §8.1.
  설명서는 이제 Block·Statement·Argument·Value·Directive라는 말만 쓴다고 밝힌다 — §8.1 Note. 다만 §8.2.13의 첫 문장은 아직 「options statement」라고도 부른다
- 주석은 C 꼴(`/* … */`), C++ 꼴(`//`부터 줄 끝), 셸 꼴(`#`부터 줄 끝)을 다 쓸 수 있고, 빈칸이 놓일 수 있는 곳이면 어디에나 둔다 — §8.1.1
- 주소 목록(address match list)은 IP 주소, `/` 접두사, 다른 목록 이름 등을 담고, 미리 정해 둔 이름으로 `any`(모든 호스트)·`none`(어떤 호스트도 아님)·`localhost`·`localnets`가 있다 — §8.1.4.2, §8.2.2
- **options 블록**: 서버 전체에 걸리는 설정과 다른 문의 기본값을 정한다 — §8.2. 설정 파일에 한 번만 놓을 수 있고, 없으면 모든 옵션이 기본값인 options 블록을 쓴 것과 같다 — §8.2.13
- **`directory "경로";`**: 서버의 **작업 디렉터리**를 정한다. 설정 파일 안에서 절대 경로가 아닌 경로는 모두 이 디렉터리를 기준으로 읽고(그래서 `zone`의 `file`에 상대 경로로 적은 영역 파일도 여기서 찾는다), 서버가 남기는 파일 대부분의 기본 자리도 여기다.
  정하지 않으면 서버를 시작한 디렉터리(`.`)다. 절대 경로로 적고 `named` 프로세스가 쓸 수 있어야 하며, 상대 경로로 파일을 끌어오는 다른 지시(예: `include`)보다 먼저 적어야 한다 — §8.2.13 「directory」
- **`listen-on [port 번호] { 주소 목록; };`**: 서버가 DNS 질의를 받을 **IPv4 주소**를 정한다. 여러 줄을 둘 수 있다. **정하지 않으면 모든 IPv4 인터페이스의 53번 포트**에서 받는다. 포트를 적지 않으면 보통 DNS는 53이다(TLS·HTTPS로 받는 경우의 포트는 다루지 않는다).
  `listen-on-v6`는 같은 일을 IPv6 주소에 하고, 정하지 않으면 모든 IPv6 인터페이스의 53번에서 받으며, `{ none; };`이면 IPv6에서는 받지 않는다 — §8.2.13.5 Interfaces
- **`port`**: 서버가 DNS를 주고받는 **UDP/TCP 포트 번호**이고 기본은 53이다. 53이 아닌 포트의 서버는 인터넷의 DNS와 통신할 수 없어 주로 시험용이다 — §8.2.13 「port」
- **`allow-query { 주소 목록; };`**: 어느 호스트의 질의를 받아 줄지 정한다. **정하지 않으면 모든 호스트**의 질의를 받는다. `zone` 블록에도 둘 수 있고 그때는 options의 값보다 앞선다. 캐시에 든 데이터를 누가 받을 수 있는지는 따로 `allow-query-cache`가 정한다 — §8.2.13.4 Access Control 「allow-query」
- **`recursion yes|no;`**: 재귀(와 그에 따른 캐시 쌓기)를 허락할지 정한다. `yes`이고 질의가 재귀를 청하면 답을 얻는 데 필요한 일을 서버가 다 한다. 꺼져 있고 답을 모르면 안내 응답(referral)을 돌려준다. **기본은 `yes`**.
  꺼도 캐시에 이미 있는 데이터를 돌려주는 것은 막지 않는다 — 클라이언트의 질의 때문에 새 데이터가 캐시에 쌓이는 것만 막는다 — §8.2.13.1 Boolean Options 「recursion」
- **`dnssec-validation yes|no|auto;`**: `named`의 DNSSEC 검증을 켠다. `auto`는 검증을 켜고 BIND에 들어 있는 루트 영역의 신뢰 앵커를 쓴다. `yes`는 검증을 켜지만 신뢰 앵커를 `trust-anchors`로 직접 정해야 하고, **정하지 않으면 설정 오류**다.
  `no`는 검증을 끈다(그래도 나가는 질의에 DNSSEC 응답을 받을 수 있다는 DO 비트는 켠다). **기본은 `auto`**다(BIND를 `--disable-auto-validation`으로 빌드했으면 `yes`) — §8.2.13.1 「dnssec-validation」
- **검증에 실패하면**: 검증을 켜 두면 리졸버는 서명된 안전한 영역에서 온 답이 검증에 실패할 때 그 답을 받아들이지 않고 **클라이언트에 SERVFAIL을 돌려준다**. 실패 까닭의 예는 서명이 없거나 만료되었거나 맞지 않는 것, 부모 영역의 DS와 맞지 않는 키다 — §5.3.1 Validation Failures
- `dnssec-enable`이라는 문은 9.20 설명서(참조 장·명령 설명·판 노트)에 없다 — 전문 검색 2026-11-12
- **`masterfile-format text|raw;`**: 영역 파일의 형식을 정한다. `text`는 사람이 읽는 표준 글자 꼴이고 `raw`는 이진 꼴이다. **기본은 `text`이지만 보조(secondary) 영역은 기본이 `raw`**다. `options`에 두면 모든 영역에 걸리고, 영역·뷰마다 따로 바꿀 수 있다.
  `text`가 아닌 파일을 읽을 때는 `text` 파일에 하는 검사 일부를 건너뛸 수 있다 — §8.2.13.12 Tuning 「masterfile-format」
- **`dump-file "경로";`**: 관리 명령 `rndc dumpdb`를 받았을 때 서버가 데이터베이스를 쏟아 내는 파일의 경로다. 정하지 않으면 `named_dump.db`다 — §8.2.13 「dump-file」.
  rndc(8)의 `dumpdb`는 서버의 캐시(기본)나 영역을 그 파일에 쏟아 낸다 — Manual Pages 「rndc」 `dumpdb`
- **zone 블록**: 영역 하나를 정하고 맨 위나 `view` 안에 놓인다 — §8.2.32. 꼴은 `zone "영역 이름" { type …; file "…"; … };`이다(§8.2.33.1의 Grammar). `type`은 꼭 적어야 하고 값은 `primary`(또는 `master`), `secondary`(또는 `slave`), `mirror`·`hint`·`stub`·`static-stub`·`forward`·`redirect`다 —
  **옛 이름 `master`·`slave`는 지금도 같은 뜻으로 받는다** — §8.2.33.1 「type」, 「type primary」(`master`는 `primary`와 같은 말), 「type secondary」(`slave`는 `secondary`와 같은 말)
- `type primary`: 영역 데이터의 원본을 갖고 그 영역에 권한 있게 답한다. `type secondary`: 주 영역의 사본이고 `primaries`에 적은 주 서버(IP 주소 하나 이상)에 연락해 사본을 새로 고친다 — NOTIFY를 받거나 SOA의 REFRESH가 정한 시간이 지나면 주 서버에 SOA를 묻고,
  일련번호가 지금 것보다 크면 영역 전송을 한다. `file`을 적으면 받은 사본을 영역이 바뀔 때마다 그 파일에 쓰고 다시 시작할 때 거기서 읽는다(권한다) — §8.2.33.1 「type primary」·「type secondary」
- `file "파일 이름";`은 영역 파일의 이름을 정한다 — §8.3 Statements 「file」. `primaries { 주소; … };`는 보조 영역이 영역 전송을 청할 주 서버 목록이고, 기본으로 그 서버들의 53번 포트로 한다 — §8.2.13.7 Zone Transfers 「primaries」
- 설명서의 예(§3.2.1·§3.2.2)는 주 서버를 `zone "example.com" { type primary; file "…"; };`로, 보조 서버를 `zone "example.com" { type secondary; file "…"; primaries { 주소; }; };`로 적는다(파일 이름·주소는 옮기지 않는다).
  같은 예의 options 블록에 `directory`를 두고 모든 상대 경로의 기준이라고 주석을 단다 — §3.1.1·§3.2.1
- **named-checkconf(8)**: `named` 설정 파일의 **구문(syntax)만** 검사하고 의미는 검사하지 않는다. 그 파일과 끌어온 파일을 모두 읽어 구문 오류를 찾고, **파일을 주지 않으면 `/etc/named.conf`**를 읽는다. 오류가 있으면 종료 상태 1, 없으면 0이다.
  `-z`를 주면 `named.conf`의 주(primary) 영역을 시험 삼아 읽어 본다 — Manual Pages 「named-checkconf」 Description, Options `-z`, Return Values
- **named-checkzone(8)**: 영역 파일의 구문과 무결성을 검사한다. `named`가 영역을 읽을 때 하는 검사와 같아서, 서버 설정에 넣기 전에 영역 파일을 검사하는 데 쓴다. 꼴은 `named-checkzone [옵션] 영역_이름 파일_이름`이다 — Manual Pages 「named-checkzone」 Synopsis, Description

쓰인 곳: (phase 79 step 9에서 쓰일 곳) `linux-servers.bind-named`(§1.1·§1.4.6 — BIND와 그 노릇, named(8) — 기본 설정 파일, §3.1과의 차이, §8.1 — 블록·문·주석, zone 블록과 `type`·`file`·`primaries`, named-checkconf(8)·named-checkzone(8), `port` — UDP/TCP 53),
`linux-servers.named-conf-options`(options 블록과 그 안의 문 — `directory`·`listen-on`·`listen-on-v6`·`allow-query`·`recursion`·`dnssec-validation`·`masterfile-format`·`dump-file`, §5.3.1 — 검증에 실패하면 SERVFAIL, §8.1.4.2·§8.2.2 — `any`),
기출 대조(`exam-notes.md` 「phase 79 step 9」 문단 — [기출 2024-05-19 #40], [기출 2024-11-03 #42], [기출 2025-05-25 #42], [기출 2026-02-01 #30])

## (phase 79 step 9) Apache HTTP Server 2.4 문서 — 지시자 설명: core(KeepAlive·KeepAliveTimeout·MaxKeepAliveRequests·TimeOut·LimitRequestBody·LimitRequestFields·Options·<Directory>·DocumentRoot·ServerRoot·ServerAdmin·Include), mpm_common(Listen), mod_unixd(User·Group), mod_dir(DirectoryIndex·DirectorySlash), mod_autoindex, mod_alias(ScriptAlias), 지시자 색인
https://httpd.apache.org/docs/2.4/mod/core.html
https://httpd.apache.org/docs/2.4/mod/mpm_common.html#listen
https://httpd.apache.org/docs/2.4/mod/mod_unixd.html
https://httpd.apache.org/docs/2.4/mod/mod_dir.html
https://httpd.apache.org/docs/2.4/mod/mod_autoindex.html
https://httpd.apache.org/docs/2.4/mod/mod_alias.html#scriptalias
https://httpd.apache.org/docs/2.4/mod/directives.html

httpd.apache.org의 「Apache HTTP Server Version 2.4」 문서를 2026-11-12에 IPv4로 내려받아 읽었다. 이날 최신 판은 **2.4.71**(2026-11-11 발표 — httpd.apache.org 첫 화면)이다. 응답 머리의 Last-Modified: `mod/core.html` 2026-06-08, `mpm_common`·`mod_unixd`·`mod_dir`·`mod_autoindex`·`mod_alias` 2026-05-31.
지시자마다 문서의 Default(기본값)·Context(놓을 수 있는 자리) 줄을 적고, **판에 따라 바뀐 기본값은 Compatibility 줄대로** 적는다. 지시자 설명의 예 값은 옮기지 않는다.

- **KeepAlive On|Off**(기본 `On`, 놓는 자리: 서버 전체·가상 호스트): HTTP 지속 연결을 켤지 정한다. HTTP/1.0의 Keep-Alive 확장과 HTTP/1.1의 지속 연결은 한 TCP 연결로 요청을 여럿 보낼 수 있게 하고, 문서는 이것을 오래 가는 HTTP 세션(long-lived HTTP sessions)이라 부른다.
  HTTP/1.1 클라이언트에게는 따로 정하지 않으면 지속 연결이 기본이고, HTTP/1.0 클라이언트에게는 클라이언트가 청할 때만 쓴다 — 「KeepAlive Directive」
- **KeepAliveTimeout 초**(기본 `5`, 뒤에 `ms`를 붙이면 밀리초, 놓는 자리: 서버 전체·가상 호스트): 지속 연결에서 **다음 요청을 기다리다가 연결을 닫기까지의 초**다. 요청을 받기 시작한 뒤에는 `TimeOut`이 걸린다.
  **크게 잡으면 쉬는 클라이언트와의 연결을 기다리느라 서버 프로세스가 더 많이 묶여** 부하가 큰 서버에서 성능 문제가 날 수 있다 — 「KeepAliveTimeout Directive」
- **MaxKeepAliveRequests 수**(기본 `100`): `KeepAlive`가 켜져 있을 때 한 연결에서 받을 요청 수의 한도. `0`이면 제한이 없다. 성능을 위해 높게 두라고 권한다 — 「MaxKeepAliveRequests Directive」
- **TimeOut 초**(기본 `60`, 놓는 자리: 서버 전체·가상 호스트): 여러 경우에 입출력을 기다리는 시간이다 — 클라이언트에게서 데이터를 읽을 때 읽을 것이 없으면 TCP 패킷이 오기를 기다리는 시간, 클라이언트에게 쓸 때 보낼 자리가 차 있으면 확인 응답을 기다리는 시간, CGI 스크립트의 출력을 기다리는 시간 등 — 「TimeOut Directive」.
  곧 `KeepAliveTimeout`은 응답 뒤 **다음 요청이 오기까지**, `TimeOut`은 **요청을 주고받는 도중**의 기다림이다(두 설명을 이은 것)
- **LimitRequestBody 바이트**(기본 `1073741824`, 놓는 자리: 서버 전체·가상 호스트·디렉터리·`.htaccess`): 클라이언트가 보내는 **HTTP 요청 본문**에 허락하는 바이트 수다. `0`이면 제한이 없다. **Compatibility: 2.4.53과 그 앞 판에서는 기본이 `0`(제한 없음)이었다** — 곧 2.4.54부터 기본이 1073741824바이트(= 1024 × 1024 × 1024, 1GiB)다.
  둔 자리(서버·디렉터리·파일·위치)의 요청에 걸리고, 요청이 한도를 넘으면 처리하지 않고 **오류 응답**을 돌려준다(어떤 상태 코드인지는 이 설명에 없다 — 전문 검색으로 「413」 없음). 비정상적인 클라이언트 요청을 다루는 데 쓸모 있어 몇몇 서비스 거부 공격을 피하는 데 도움이 된다고 적고, 파일 올리기의 크기를 묶는 예를 든다 — 「LimitRequestBody Directive」
- **LimitRequestFields 수**(기본 `100`, `0`이면 제한 없음): 받을 요청 헤더 필드 수의 한도다. 같은 무리로 `LimitRequestFieldSize`·`LimitRequestLine`이 있다 — 「LimitRequestFields Directive」, 지시자 목차
- **Options [+|-]옵션 …**(기본 `FollowSymlinks`, 놓는 자리: 서버 전체·가상 호스트·디렉터리·`.htaccess`, **Compatibility: 2.3.11에서 기본이 `All`에서 `FollowSymlinks`로 바뀌었다**): 그 디렉터리에서 쓸 수 있는 서버 기능을 정한다. 값은 `None`(아무것도 켜지 않는다)이거나 다음 가운데 하나 이상이다 —
  `All`(MultiViews 말고 전부), `ExecCGI`(mod_cgi로 CGI 스크립트를 실행하게 한다), `FollowSymLinks`(이 디렉터리의 심볼릭 링크를 따라간다), `Includes`(mod_include의 SSI를 허락한다), `IncludesNOEXEC`(SSI는 허락하되 명령·CGI 실행을 막는다),
  **`Indexes`(디렉터리를 가리키는 주소를 요청했는데 그 안에 `DirectoryIndex`의 파일(예: index.html)이 없으면 mod_autoindex가 디렉터리 목록을 만들어 돌려준다)**, `MultiViews`, `SymLinksIfOwnerMatch` — 「Options Directive」
- 같은 절: **`FollowSymLinks`를 빼는 것을 보안 제한으로 여기지 말라**고 적는다 — 심볼릭 링크 검사에 경쟁 조건이 있어 피해 갈 수 있기 때문이다. `FollowSymLinks`·`SymLinksIfOwnerMatch`는 `<Directory>`나 `.htaccess`에서만 동작한다
- 같은 절: 한 디렉터리에 `Options`가 여럿 걸리면 보통 가장 구체적인 것 하나만 쓰고 합치지 않는다. **모든 값 앞에 `+`·`-`를 붙이면** 지금 걸려 있는 값에 더하거나 뺀다. **`+`·`-`가 붙은 값과 안 붙은 값을 섞으면 구문 오류**라 서버가 시작할 때 거부한다. `All`·`None`은 맨 앞에 쓰고 `+`·`-`를 붙일 수 없다. 아무것도 정하지 않으면 `FollowSymlinks`다
- **`<Directory 경로>` … `</Directory>`**(놓는 자리: 서버 전체·가상 호스트): 그 디렉터리와 하위 디렉터리, 그 안의 파일에만 걸리는 지시자를 묶는다. 경로는 전체 경로나 셸 꼴 와일드카드이고, 빈칸이 있으면 따옴표로 감싸야 한다.
  다른 경로(다른 심볼릭 링크)로 닿은 같은 파일에는 걸리지 않는다. 설명의 예는 이 구역 안에 `Options Indexes FollowSymLinks`를 둔다 — 「<Directory> Directive」
- **DocumentRoot 경로**(문서의 Default 줄 `"/usr/local/apache/htdocs"`, 놓는 자리: 서버 전체·가상 호스트): 웹에 보일 문서 나무의 디렉터리다. `Alias` 같은 것에 걸리지 않으면 **요청 주소의 경로를 이 디렉터리 뒤에 붙여** 파일의 경로를 만든다. 상대 경로면 `ServerRoot` 기준이고, 끝에 `/`를 붙이지 않는다 — 「DocumentRoot Directive」
- **ServerRoot 경로**(문서의 Default 줄 `/usr/local/apache`, 놓는 자리: 서버 전체): 서버가 설치된 기준 디렉터리다. 보통 `conf/`·`logs/`를 담고, `Include`·`LoadModule` 같은 지시자의 상대 경로는 이 디렉터리 기준이다. 기본 위치는 `configure --prefix`로 바뀌고 **제3자 배포판은 대개 다른 곳을 쓴다** — 「ServerRoot Directive」.
  **기본 경로를 문서끼리 다르게 적는다** — 이 두 지시자의 Default 줄은 `/usr/local/apache`를, 아래 항목의 httpd(8) `-d`와 설치 문서의 PREFIX 기본은 `/usr/local/apache2`를 적는다. 그러니 기본 경로는 쓰지 않고 「설치 방식에 따라 다르다」로 쓴다
- **ServerAdmin 메일주소|URL**(Default 줄 없음, 놓는 자리: 서버 전체·가상 호스트): 서버가 클라이언트에게 돌려주는 **오류 메시지에 넣는 연락처**다. URL로 알아보지 못하면 메일 주소로 본다. 메일 주소를 쓰라고 권한다 — 「ServerAdmin Directive」
- **Include 경로**(놓는 자리: 서버 전체·가상 호스트·디렉터리): 설정 파일 안에서 **다른 설정 파일을 끌어온다**. 셸 꼴 와일드카드로 여러 파일을 알파벳 차례로 읽을 수 있고, 디렉터리를 가리키면 그 안의 모든 파일을 읽는다(권하지 않는다). 와일드카드에 맞는 파일이 없으면 오류다(`IncludeOptional`은 넘어간다).
  경로는 절대 경로이거나 `ServerRoot` 기준 상대 경로다 — 「Include Directive」
- **Listen [IP주소:]포트 [프로토콜]**(mpm_common, 놓는 자리: 서버 전체): 서버가 들어오는 요청을 받을 **포트, 또는 IP 주소와 포트의 짝**을 정한다. **이제 꼭 있어야 하는 지시자**라 설정 파일에 없으면 서버가 시작하지 못한다. 포트만 적으면 모든 인터페이스의 그 포트에서 받는다.
  **여러 줄을 두어 여러 주소·포트에서 받을 수 있다**. IPv6 주소는 대괄호로 감싼다. 프로토콜을 적지 않으면 443은 https, 나머지는 http다(protocol 인자는 2.1.5부터). **같은 IP 주소와 포트를 가리키는 `Listen`이 여럿이면 「Address already in use」 오류**가 난다 — 「Listen Directive」
- **User 사용자 / Group 그룹**(mod_unixd, 기본 `#-1`, 놓는 자리: 서버 전체): 서버가 **요청에 답할 때 쓰는 사용자 ID·그룹**이다. 이 지시자를 쓰려면 **서버를 처음에 root로 실행해야** 하고, root가 아닌 사용자로 시작하면 바꾸지 못해 처음 사용자 그대로 돈다. root로 시작했으면 부모 프로세스가 root로 남는 것이 정상이다.
  그 사용자는 바깥에 보이면 안 되는 파일에 닿거나 HTTP 요청과 관계없는 코드를 실행할 권한이 없어야 하고, 서버만을 위한 새 사용자·그룹을 만들라고 권하며, root로 두지 말라고 경고한다 — 「User Directive」, 「Group Directive」
- **DirectoryIndex 파일 …**(mod_dir, 기본 `index.html`, 놓는 자리: 서버 전체·가상 호스트·디렉터리·`.htaccess`): 클라이언트가 디렉터리 끝에 `/`를 붙여 요청할 때 찾을 자원 목록이다. 여럿이면 처음 찾은 것을 돌려주고, **하나도 없는데 `Indexes`가 켜져 있으면 서버가 디렉터리 목록을 만든다**. `disabled`이면 찾지 않는다 — 「DirectoryIndex Directive」
- mod_dir·mod_autoindex의 Summary: 디렉터리의 색인은 둘 가운데 하나에서 온다 — 사용자가 둔 파일(보통 index.html, 이름은 `DirectoryIndex`가 정하고 mod_dir이 다룬다)이거나, 서버가 만든 목록(mod_autoindex)이다. 자동 목록은 `Options +Indexes`로 켠다 — 두 모듈 「Summary」
- mod_dir 「DirectorySlash Directive」의 Security Warning: 끝 `/` 리다이렉트를 끄면, `Options +Indexes`이고 `DirectoryIndex` 파일이 있어도 `/` 없이 요청할 때 디렉터리 내용이 나열되어 **정보가 드러날 수 있다**고 경고한다. 곧 Apache 문서도 의도하지 않은 디렉터리 목록을 정보 노출로 본다
- **`Indexes`가 꺼져 있고 기본 문서가 없을 때 그 요청에 어떻게 답하는지(상태 코드)는 이날 읽은 페이지(core·mod_dir·mod_autoindex·Security Tips)에서 찾지 못했다**
- **ScriptAlias [URL경로] 파일경로|디렉터리경로**(mod_alias): 주소 경로를 파일 시스템 위치에 잇고, 그 대상을 CGI 스크립트가 든 곳으로 표시한다 — `Alias`에 `Options +ExecCGI`(그리고 cgi-script 처리기)를 함께 준 것과 거의 같다 — 「ScriptAlias Directive」
- **지시자 색인**(`mod/directives.html`, 2026-11-12 대조): `Listen`·`KeepAlive`·`LimitRequestBody`·`DocumentRoot`·`ServerRoot`·`ServerAdmin`·`Options`·`ScriptAlias`·`StartServers`·`NameVirtualHost`는 있고,
  **`Port`·`Listening`·`Default Port`·`KeepRequestSize`·`RestrictBodyRequest`·`PostRequestSize`·`Exec-timeout`이라는 지시자는 없다**. `NameVirtualHost`는 2.4에서 경고만 내고 아무 효과가 없다 — `upgrading.html`

쓰인 곳: (phase 79 step 9에서 쓰일 곳) `linux-servers.httpd-conf`(`DocumentRoot`·`ServerRoot`·`ServerAdmin`·`Include`·`<Directory>`, 기본 경로가 문서끼리 다르다), `linux-servers.apache-listen`(`Listen`, `User`·`Group`, 색인에 `Port`·`Listening` 없음),
`linux-servers.apache-keepalive`(`KeepAlive`·`KeepAliveTimeout`·`MaxKeepAliveRequests`·`TimeOut`), `linux-servers.options-indexes`(`Options`, `DirectoryIndex`, mod_autoindex·mod_dir Summary, DirectorySlash 경고, `ScriptAlias`), `linux-servers.limit-request-body`(`LimitRequestBody`·`LimitRequestFields`, 색인),
기출 대조(`exam-notes.md` 「phase 79 step 9」 문단)

## (phase 79 step 9) Apache HTTP Server 2.4 문서 — Configuration Files, Starting Apache, httpd·apachectl, Binding to Addresses and Ports, Compiling and Installing, Security Tips; 2.0 문서 Upgrading to 2.0 from 1.3
https://httpd.apache.org/docs/2.4/configuring.html
https://httpd.apache.org/docs/2.4/invoking.html
https://httpd.apache.org/docs/2.4/programs/httpd.html
https://httpd.apache.org/docs/2.4/programs/apachectl.html
https://httpd.apache.org/docs/2.4/bind.html
https://httpd.apache.org/docs/2.4/install.html
https://httpd.apache.org/docs/2.4/misc/security_tips.html
https://httpd.apache.org/docs/2.0/upgrading.html
https://httpd.apache.org/

2026-11-12에 IPv4로 내려받아 읽었다. Last-Modified: `configuring`·`invoking`·`bind`·`programs/httpd`·`programs/apachectl` 2026-05-31, `install` 2026-06-11, `misc/security_tips` 2026-09-29.
`docs/2.0/upgrading.html`(2021-07-09)은 지원이 끝난 2.0 판의 문서라 **`Port` 지시자가 언제 없어졌는지의 역사 기록으로만** 쓴다(2.4 문서의 `upgrading.html`은 2.2 → 2.4만 다루고 `Port`를 말하지 않는다).

- **httpd.apache.org 첫 화면**: Apache HTTP Server는 **The Apache Software Foundation의 프로젝트**다. 이날 최신 판은 2.4.71(2026-11-11 발표)이다

- **Configuration Files** — 「Main Configuration Files」: Apache HTTP Server는 일반 글자 설정 파일에 지시자를 적어 설정한다. **주 설정 파일은 보통 `httpd.conf`**이고, 그 위치는 **컴파일할 때 정해지며 `-f` 명령줄 옵션으로 바꿀 수 있다**.
  `Include`로 다른 설정 파일을 더할 수 있고 **어떤 지시자든 이 설정 파일들 가운데 어디에나 둘 수 있다**. 주 설정 파일을 바꾸면 **httpd를 시작하거나 다시 시작할 때만** 반영된다
- 같은 문서 「Syntax of the Configuration Files」: 한 줄에 지시자 하나다. 줄 끝의 `\`는 다음 줄로 이어짐을 뜻한다. `#`으로 시작하는 줄은 주석이고, 지시자와 같은 줄에 주석을 둘 수 없다. 지시자 앞의 빈칸과 빈 줄은 무시한다. **인자는 빈칸으로 가르고**, 빈칸이 든 인자는 따옴표로 감싼다
- 같은 문서 「Scope of Directives」: 주 설정 파일에 둔 지시자는 서버 전체에 걸리고, `<Directory>`·`<Files>`·`<Location>` 같은 구역(section)에 넣으면 그 파일 시스템 위치나 URL에만 걸린다. `<VirtualHost>`로 웹사이트마다 나눌 수도 있다. 지시자마다 놓을 수 있는 자리는 그 지시자 설명의 Context 줄이 정한다.
  「.htaccess Files」: 웹 나무 안에 두는 설정 파일로 그 디렉터리와 하위에 걸리고 요청마다 읽혀 바로 반영된다. 어떤 지시자를 둘 수 있는지는 주 설정의 `AllowOverride`가 정한다
- **Starting Apache** — 머리 문단, 「How Apache Starts」: Unix에서 `httpd` 프로그램은 뒤에서 늘 돌며 요청을 처리하는 데몬으로 실행된다. 설정의 `Listen`이 기본 80(또는 **1024보다 작은 다른 포트**)이면 그 특권 포트에 묶으려고 **root 권한으로 시작해야** 한다.
  서버가 로그 파일을 여는 등의 준비를 마치면 요청을 받아 답하는 일을 맡는 **자식 프로세스 여럿**을 띄우고, **주 `httpd` 프로세스는 root로 남지만 자식 프로세스는 권한이 낮은 사용자로 돈다**(MPM이 정한다). 띄울 때는 `apachectl` 스크립트를 쓰라고 권한다.
  `httpd`는 실행되자마자 `httpd.conf`를 찾아 읽는다(위치는 컴파일 때 정해지고 `-f`로 바꾼다)
- 같은 문서 「Errors During Start-up」: 시작 중 흔한 오류 「Unable to bind to Port …」는 대개 **root로 로그인하지 않고 특권 포트에서 시작하려 했거나, 다른 Apache나 다른 웹 서버가 이미 같은 포트에 묶여 있을 때** 난다
- **httpd(8)** — Synopsis, Options: 꼴은 `httpd [-d serverroot] [-f config] [-k start|restart|graceful|stop|graceful-stop] [-t] …`이다. `-d`의 기본은 `/usr/local/apache2`, `-f`의 기본은 `ServerRoot` 기준 `conf/httpd.conf`다. `-t`는 설정 파일의 구문 검사만 하고 끝낸다(종료 코드 0이면 Syntax OK)
- **apachectl(8)** — Options: `configtest`는 설정 파일을 읽어 구문을 시험하고 「Syntax Ok」나 오류 내용을 알린다(`apachectl -t`와 같다). `restart`는 데몬을 다시 시작하고(돌고 있지 않으면 시작), `graceful`은 **열린 연결을 끊지 않고** 다시 시작한다. 둘 다 다시 시작하기 전에 `configtest`처럼 설정을 검사해 데몬이 죽지 않게 한다.
  「Files」: 기본 경로는 컴파일할 때 바뀔 수 있다
- **Binding to Addresses and Ports** — 「Overview」: httpd는 시작할 때 로컬 기계의 포트와 주소에 묶이고 들어오는 요청을 기다린다. 기본으로 기계의 모든 주소에서 기다린다. **겹치는 `Listen`은 서버가 시작하지 못하는 치명적 오류**가 된다(「Address already in use」).
  「Changing Listen configuration on restart」: 다시 시작할 때는 이미 묶은 포트를 그대로 두므로, `Listen`을 바꿔 옛 설정과 부딪히면 설정이 실패하고 서버가 끝난다
- **Compiling and Installing**: 머리 문단 — **배포판 꾸러미(RPM·DEB 등)로 설치하면 설정 파일의 배치와 기본값이 이 문서와 다를 수 있다**. 「Customize」·「Test」 — 소스에서 설치하면 `PREFIX/conf/` 아래 설정 파일(`PREFIX/conf/httpd.conf`)을 고치고 `PREFIX/bin/apachectl -k start`로 시작하며, 첫 문서는 `DocumentRoot` 아래, 보통 `PREFIX/htdocs/`에 있다.
  「Overview for the impatient」 — `--prefix`를 주지 않으면 PREFIX는 `/usr/local/apache2`다. 「Third-party packages」 — 운영체제가 주는 꾸러미는 설정 파일 배치·모듈·기본 경로가 소스 설치와 다를 수 있으니 배포판 문서를 보라고 한다
- **`conf/extra/` 아래 파일 이름(`httpd-default.conf`·`httpd-vhosts.conf`·`httpd-mpm.conf`)은 이날 읽은 페이지**(configuring·install·invoking·core·mpm·vhosts 셋·platform/windows)**에서 찾지 못했다**
- **Security Tips** — 「Permissions on ServerRoot Directories」: 보통 Apache는 root 사용자가 시작하고, 요청에 답할 때는 `User`가 정한 사용자로 바꾼다.
  「Denial of Service (DoS) attacks」: 서비스 거부 공격을 줄이는 설정으로 `TimeOut`을 낮추고, `KeepAliveTimeout`도 낮출 수 있으며(어떤 곳은 `KeepAlive`를 아예 끄지만 성능에 손해가 있다), `LimitRequestBody`·`LimitRequestFields`·`LimitRequestFieldSize`·`LimitRequestLine` 등을 신중히 정해 클라이언트 입력이 일으키는 자원 소비를 묶으라고 든다
- 같은 문서 「Server Side Includes」: SSI는 서버 부하를 늘리고, Apache가 도는 사용자·그룹의 권한으로 아무 CGI 스크립트나 프로그램을 실행할 수 있다는 위험이 있다 — `Options`의 `Includes` 대신 `IncludesNOEXEC`로 스크립트·프로그램 실행을 막을 수 있다.
  「CGI in General」·「Non Script Aliased CGI」·「Script Aliased CGI」: CGI 스크립트는 웹 서버 사용자의 권한으로 아무 명령이나 실행할 수 있어 위험하고, 아무 디렉터리에서나 실행하게 하는 것보다 `ScriptAlias`로 정한 디렉터리로 묶는 쪽이 더 안전하다.
  **이 문서에는 디렉터리 목록(`Indexes`)에 관한 절이 없다**(전문 검색 2026-11-12)
- **Upgrading to 2.0 from 1.3**(2.0 문서) — 「Run-Time Configuration Changes」: **`BindAddress`와 `Port` 지시자는 2.0에서 없어졌고 같은 일을 더 유연한 `Listen`이 한다**. 1.3에서 `Port`로 정하던, 서버가 자기를 가리키는 URL에 쓸 포트 번호는 2.0부터 `ServerName`에 호스트 이름과 함께 적는다

쓰인 곳: (phase 79 step 9에서 쓰일 곳) `linux-servers.httpd-conf`(첫 화면 — The Apache Software Foundation의 프로젝트; Configuration Files — 주 설정 파일 `httpd.conf`, 위치는 컴파일 때·`-f`, `Include`, 어떤 지시자든 어느 설정 파일에나, 바꾸면 다시 시작해야 반영, 줄의 꼴과 주석, 구역; Starting Apache — 데몬 `httpd`; apachectl(8) — `configtest`·`graceful`; Compiling and Installing — 배포판마다 배치가 다르다),
`linux-servers.apache-listen`(Starting Apache — 1024보다 작은 포트는 root로 시작, 자식 프로세스는 낮은 권한, 시작 오류의 두 까닭; Binding to Addresses and Ports — 겹치는 `Listen`; 2.0 Upgrading — `Port`가 없어졌다), `linux-servers.apache-keepalive`·`linux-servers.limit-request-body`(Security Tips 「DoS」),
`linux-servers.options-indexes`(Security Tips 「Server Side Includes」·「CGI」), 기출 대조(`exam-notes.md` 「phase 79 step 9」 문단)

## (phase 79 step 9) iptables 1.8.13 — iptables(8), iptables-extensions(8); netfilter.org — 프로젝트 소개, iptables·nftables 프로젝트 페이지
https://man7.org/linux/man-pages/man8/iptables.8.html
https://man7.org/linux/man-pages/man8/iptables-extensions.8.html
https://www.netfilter.org/
https://www.netfilter.org/projects/iptables/index.html
https://www.netfilter.org/projects/nftables/index.html

2026-11-12에 IPv4로 내려받아 읽은 판: man7.org의 iptables(8)·iptables-extensions(8)은 「iptables 1.8.13」(VERSION 절 — netfilter의 iptables 저장소에서 2026-08-04에 가져옴, 마지막 커밋 2026-07-10).
netfilter.org는 첫 화면과 프로젝트 페이지 둘을 읽었다(첫 화면 소식 목록의 최신 판: iptables 1.8.13, nftables 1.1.7). **규칙 문법은 iptables의 것만** 적고 nftables(`nft`)의 문법은 가져오지 않는다.

- **iptables(8)** — NAME, DESCRIPTION: iptables(IPv6는 ip6tables)는 **Linux 커널의 IPv4 패킷 거르기 규칙 표를 만들고 고치고 살펴보는 관리 도구**다. 표(table)가 여럿이고, 표마다 내장 체인(built-in chain)이 있으며 사용자가 체인을 만들 수도 있다.
  **체인은 패킷들에 맞을 수 있는 규칙의 목록**이고, 규칙마다 맞는 패킷을 어떻게 할지(대상, target)를 정한다
- iptables(8) — TARGETS: 규칙은 패킷의 조건과 대상으로 이루어진다. **패킷이 규칙에 맞지 않으면 체인의 다음 규칙을 보고, 맞으면 그 규칙의 대상을 따른다**. 대상은 사용자 체인, 확장 대상, 또는 특별한 값 `ACCEPT`(패킷을 지나가게 한다)·`DROP`(패킷을 버린다)·`RETURN`이다.
  **내장 체인의 끝에 닿으면 그 체인의 정책(policy)이 정한 대상이** 패킷을 어떻게 할지 정한다
- iptables(8) — TABLES: 표는 지금 다섯(`filter`·`nat`·`mangle`·`raw`·`security`)이다. **`filter`는 `-t`를 주지 않을 때의 기본 표**이고 내장 체인 셋을 갖는다 — **`INPUT`(이 기계의 로컬 소켓으로 가는 패킷), `FORWARD`(이 기계를 거쳐 라우팅되는 패킷), `OUTPUT`(이 기계에서 만들어진 패킷)**
- iptables(8) — OPTIONS 「COMMANDS」: `-A 체인 규칙`(체인의 **끝에** 규칙을 더한다), `-I 체인 [번호] 규칙`(그 번호 자리에 끼운다 — 번호를 빼면 맨 앞), `-D`(지운다), `-L [체인]`(규칙 목록을 보인다 — 체인을 빼면 모든 체인, 이름 풀이를 피하려 흔히 `-n`과 함께 쓴다),
  `-S`(규칙을 명령 꼴로 보인다), `-F`(체인을 비운다), `-P 체인 대상`(내장 체인의 정책을 `ACCEPT`나 `DROP`으로 정한다). **내장 체인 정책의 처음 값(아무것도 정하지 않았을 때)은 이 페이지에 적혀 있지 않다**(전문 검색)
- iptables(8) — OPTIONS 「PARAMETERS」: `-p 프로토콜`(`tcp`·`udp`·`icmp` 등이나 번호, 빼면 `all`), `-j 대상`(규칙에 맞을 때 할 일 — 빼면 패킷의 운명에 영향이 없고 규칙의 계수만 는다), `-s 주소[/마스크]`(출발지), `-i 인터페이스`(패킷을 받은 인터페이스 — `INPUT`·`FORWARD`·`PREROUTING`에만)
- **iptables-extensions(8)** — MATCH EXTENSIONS 머리 문단, 「tcp」·「udp」: 확장 조건 모듈은 `-m 이름`으로 부르고, `-p`를 준 규칙에서 모르는 옵션을 만나면 그 프로토콜과 같은 이름의 모듈을 불러온다.
  **`tcp` 확장은 `--protocol tcp`일 때** 쓸 수 있고 `--dport`(`--destination-port` — 목적지 포트나 범위)·`--sport`·`--tcp-flags`·`--syn`을 준다. **`udp` 확장도 `--protocol udp`일 때** `--dport`·`--sport`를 준다. 곧 `--dport`는 `-p tcp`나 `-p udp`와 함께 쓰는 옵션이다
- 같은 페이지 「tcp」 `--syn`: SYN만 켜진, 연결을 청하는 패킷에 맞는다 — 이런 패킷을 들어오는 쪽에서 막으면 들어오는 TCP 연결은 막히고 나가는 TCP 연결은 그대로다
- 같은 페이지 TARGET EXTENSIONS 「REJECT (IPv4-specific)」: **`REJECT`는 맞는 패킷에 오류 패킷을 되돌려 보내고, 그 밖에는 `DROP`과 같다**(규칙 훑기를 끝내는 대상). `INPUT`·`FORWARD`·`OUTPUT` 체인(과 거기서만 부르는 사용자 체인)에서만 쓴다. 기본으로 보내는 오류는 ICMP port-unreachable이고, TCP 규칙에서는 TCP RST를 보낼 수도 있다.
  곧 **`DROP`은 말없이 버리고 `REJECT`는 버리면서 보낸 쪽에 알린다**(두 설명을 이은 것)
- **netfilter.org** — 「What is the netfilter.org project?」: netfilter 프로젝트는 Linux 2.4 이후 커널의 **패킷 거르기 소프트웨어**를 만드는 공동체 자유 소프트웨어 프로젝트이고, iptables와 그 뒤를 잇는 nftables로 알려져 있다. 패킷 거르기, 주소·포트 변환(NA[P]T), 패킷 기록 등을 한다.
  **netfilter 훅**은 커널 네트워크 스택의 여러 자리에 모듈이 함수를 걸어 두면 그 자리를 지나는 패킷마다 그 함수가 불리게 하는 커널 안의 틀이다. **iptables는 규칙 묶음을 정하는 범용 방화벽 소프트웨어**이고, 규칙마다 조건(matches) 여럿과 동작(target) 하나가 있다. **nftables는 iptables의 뒤를 잇는 것**이고 새 기능은 거기서 만든다
- netfilter.org — `projects/iptables/`: iptables는 Linux 2.4 이후의 패킷 거르기 규칙 묶음을 설정하는 **사용자 공간의 명령줄 프로그램**이고 시스템 관리자를 위한 것이다. NAT도 같은 규칙 묶음에서 설정하므로 그 일에도 쓴다 — 「What is iptables?」.
  `projects/nftables/`: nftables는 `{ip,ip6,arp,eb}tables`를 대신하고 명령줄 도구는 `nft`다. 커널 3.13부터 쓸 수 있고, 같은 문법의 iptables 명령을 nftables 위에서 돌리는 **하위 호환 층**이 있다

쓰인 곳: (phase 79 step 9에서 쓰일 곳) `linux-servers.iptables`(iptables(8) — 무엇인가, 표·체인·대상·정책, `filter`와 `INPUT`·`OUTPUT`·`FORWARD`, `-A`·`-I`·`-L`·`-P`·`-p`·`-j`·`-s`·`-i`; iptables-extensions(8) — `tcp`·`udp`의 `--dport`, `REJECT`; netfilter.org — netfilter 훅, 방화벽 소프트웨어, nftables가 뒤를 잇는다),
`linux-servers.bind-named`(방화벽에 UDP 53과 TCP 53을 함께 연다 — 규칙의 꼴), 기출 대조(`exam-notes.md` 「phase 79 step 9」 문단 — [기출 2024-05-19 #44], [기출 2025-05-25 #42])
(phase 79 step 14) iptables-extensions(8) 「tcp」을 2026-11-13에 IPv4로 다시 받아 확인했다(iptables 1.8.13): `--sport`는 `--source-port`의 줄임이고 **출발지 포트**(나 범위)로, `--dport`는 `--destination-port`의 줄임이고 **목적지 포트**(나 범위)로 견준다. 쓰인 곳: `linux-servers.iptables`(목적지 포트와 출발지 포트, `--sport`), 문항 n255(오답 `--sport 22` — 접속하려는 쪽이 보내는 패킷에서 22는 목적지 포트에 적힌다. 출발지·목적지 포트가 응답에서 맞바뀌는 것은 RFC 6335 §3·RFC 6056 §1 항목과 `ports.client-server-ports`대로)

## (phase 80 step 0) Microsoft Learn — 로컬 계정과 기본 그룹: Local accounts, net user, Active Directory security groups, Security identifiers, Security principals, Special identity groups, Add-LocalGroupMember, Built-in and Account Domains, About WMI, Microsoft Defender Application Guard overview; 지난 판 Local and Domain Default Groups
https://learn.microsoft.com/en-us/windows/security/identity-protection/access-control/local-accounts
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/net-user
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-identifiers
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-principals
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-special-identities-groups
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.localaccounts/add-localgroupmember?view=powershell-5.1
https://learn.microsoft.com/en-us/windows/win32/secmgmt/built-in-and-account-domains
https://learn.microsoft.com/en-us/windows/win32/wmisdk/about-wmi
https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/microsoft-defender-application-guard/md-app-guard-overview
https://learn.microsoft.com/en-us/previous-versions/orphan-topics/ws.10/dd728026(v=ws.10)

2026-11-16에 IPv4로 내려받아 읽은 판: 「Local accounts」 `updated_at` 2026-10-08(`ms.date` 2026-04-13, 「Applies to」 Windows 11·10, Windows Server 2016~2025), 「net user」 2026-02-16(2025-08-06, Windows Server 2016~2025·Windows 11·10),
「Active Directory security groups」 2026-10-30(2025-07-02), 「Security identifiers」 2026-10-20(2025-06-26), 「Security principals」 2026-02-16(2025-07-08), 「Special identity groups」 2026-02-16(2025-07-08) — 넷 모두 「Applies to」 Windows Server 2016~2025.
「Add-LocalGroupMember」 2025-07-24(2023-06-28, Windows PowerShell 5.1 판). Win32 「Built-in and Account Domains」 2025-03-12·「About WMI」 2026-04-15(둘 다 `ms.date` 2018-05-31 — 적용 판을 적지 않는 개발자 문서다). 「Microsoft Defender Application Guard overview」 2025-04-15(「Applies to」 Windows 11·10).
지난 판 「Local and Domain Default Groups」는 `updated_at` 2022-01-21(`ms.date` 2012-05-28), 적용 대상 Windows Server 2000~2012다 — 지금 판 문서와 같은 말을 하는 줄만 근거로 쓰고, 지금 판에 없는 말은 「지난 판」이라고 밝힌다.
한국어판(`ko-kr`)도 모두 받았다(`updated_at` 2026-01-09~2026-11-05, 기계 번역) — **용어 표기만** 참고한다(아래 「한국어 이름」 줄).

- **로컬 계정**: 로컬 사용자 계정과 시스템 계정은 한 장치 안에서 정의되는 보안 주체이고, 그 장치 자신이 계정을 확인하는 보안 기관(security authority)이다. 그래서 이 계정의 권한과 사용 권한은 그 장치 안에서만 통한다 — 「Local accounts」 첫머리
- 같은 문서: **기본 로컬 사용자 계정**은 운영 체제를 설치할 때 저절로 만들어지는 계정이고 지울 수 없다. 그 장치의 자원에 대한 권한만 있고 네트워크 자원으로 가는 길은 주지 않는다.
  기본 계정과 관리자가 새로 만든 로컬 계정은 「컴퓨터 관리」(Computer Management — 로컬·원격 장치를 관리하는 도구를 모은 MMC)의 「로컬 사용자 및 그룹\사용자」 폴더에 있다 — 「Default local user accounts」
- 같은 문서 **Administrator**: 시스템 관리에 쓰는 계정이고 Windows 설치 중 가장 먼저 만들어진다. 그 장치의 파일·디렉터리·서비스 같은 자원을 모두 제어하고, 다른 로컬 사용자를 만들고 사용자 권한과 사용 권한을 줄 수 있다.
  **지우거나 잠글 수는 없지만 이름을 바꾸거나 사용하지 않도록(끄도록) 할 수는 있다**. 빈 암호를 쓸 수 없고, 기본으로 Administrators 그룹의 구성원이며 그 그룹에서 뺄 수 없다 — 「Administrator」, 「Account group membership」, 「Important」.
  같은 절은 Windows 설치 프로그램이 이 기본 계정을 끄고 Administrators 그룹에 든 다른 로컬 계정을 따로 만든다고 적는데, **어느 제품·판의 설치 프로그램인지 가르지 않는다** — Windows Server의 설치 과정을 이 문장으로 단정하지 않는다
- 같은 문서: Administrators 그룹의 구성원은 그 장치에 모든 권한(Full Control)을 가지므로 이 그룹에 넣는 사람의 수를 줄이라고 권한다 — 「Account group membership」
- 같은 문서 **Guest**: 그 장치에 계정이 없는 사람이 가끔 또는 한 번 임시로 로그온할 때 쓰는 계정이고 권한이 제한된다. **기본으로 꺼져 있고 암호가 비어 있다**. 익명 접근의 통로가 될 수 있어 꼭 필요할 때가 아니면 꺼 둔 채로 두라고 권한다. 기본 Guests 그룹의 유일한 구성원이다 — 「Guest」, 「Guest account group membership」
- 같은 문서 **DefaultAccount**(DSMA, Default System Managed Account — 시스템이 관리하는 계정): 사용 권한으로 보면 표준 사용자 계정이고, 여러 사용자를 의식하는 앱이 돌 때 쓰인다. 데스크톱 판과 「데스크톱 경험이 있는」 서버 운영 체제에서 **기본으로 꺼져 있다**.
  컴퓨터가 처음 시작할 때 SAM 안에 만들어지고, Windows Server 2016 이후의 DC로 만든 도메인에서는 모든 DC에 로컬 계정으로 있다. 꺼 둔 기본 설정을 바꾸지 말라고 권한다 — 「DefaultAccount」
- 같은 문서는 기본 로컬 사용자 계정 절에 **WDAGUtilityAccount**(Windows Defender Application Guard가 쓰는 계정 — 기본으로 어느 그룹에도 들지 않는다)와 **WSIAccount**(Windows 11에서 들어온 계정 — 잠금·로그인 화면에서 시작하는 웹 활동에 쓰고, Users 그룹의 구성원이다)도 든다.
  시스템 계정 절에 함께 든 HelpAssistant는 원격 지원 세션 동안만 켜지는 계정이고, Windows Server에서 원격 지원은 기본으로 설치되지 않는 선택 구성 요소다. **문서는 기본 계정의 수를 세지 않고, 어느 계정이 어느 제품에 있는지 표로 가르지도 않는다** — 「WDAGUtilityAccount」, 「WSIAccount」, 「HelpAssistant」.
  root라는 이름은 이 문서의 계정 목록 어디에도 없다(root는 Linux의 관리자 계정이다 — phase 76의 `linux-accounts.user-account`)
- 「Microsoft Defender Application Guard overview」: Application Guard의 적용 대상은 Windows 11·10이고, Windows 11 24H2부터는 쓸 수 없다 — 첫머리 Note. WDAGUtilityAccount가 Windows 클라이언트 기능의 계정이라는 근거로만 쓴다
- 「Local accounts」 「How to manage local user accounts」: **사용자 권한**(right)은 그 장치에서 어떤 작업 — 파일·폴더 백업이나 컴퓨터 끄기 같은 것 — 을 하도록 허가하는 것이고, **사용 권한**(access permission)은 파일·폴더·프린터 같은 개체에 붙어 누가 어떤 방식으로 그 개체에 접근하는지 정하는 규칙이다. 「로컬 사용자 및 그룹」으로 이 둘을 그 컴퓨터 안에서만 줄 수 있다
- 같은 절: **DC에서는 「로컬 사용자 및 그룹」으로 그 DC의 계정을 관리할 수 없다**(원격 관리가 허락되면 DC에서 이 도구로 DC가 아닌 다른 컴퓨터는 다룰 수 있다). 로컬 사용자는 `NET.EXE USER`, 로컬 그룹은 `NET.EXE LOCALGROUP`이나 Windows PowerShell의 LocalAccounts 모듈로도 관리한다
- 「net user」: 로컬 컴퓨터나 도메인의 사용자 계정을 더하고·고치고·지우고 자세한 정보를 보는 명령이다. 이름 없이 실행하면 그 로컬 컴퓨터의 사용자 계정 목록을 보인다. `/add`는 새 계정을 더하고 `/delete`는 지우는데, 둘 다 `/domain`과 함께 쓰면 로컬 컴퓨터가 아니라 도메인에서 한다.
  `/domain`은 그 컴퓨터가 속한 기본(primary) 도메인의 DC에서 작업하게 한다. `/active:{yes|no}`는 계정을 켜고 끈다(기본 yes). 사용자 이름은 20자까지다 — 「Syntax」, 「Parameters」, 「Examples」(예의 이름·암호는 옮기지 않는다)
- (phase 80 step 1, 2026-11-16 IPv4로 다시 받아 확인) 「net user」 「Syntax」: 계정을 더하는 꼴은 `net user <UserName> {<Password> | *} /add`라서 `/add` 앞에 암호나 `*`를 적는다. `*`를 적으면 암호를 묻는 줄이 나오고, 거기 입력한 암호는 화면에 보이지 않는다 — 「Parameters」의 `<Password>`. 지우는 꼴은 `net user <UserName> /delete`다
- (phase 80 step 4, 2026-11-16 IPv4로 다시 받아 확인) 「net user」 「Parameters」: `/add`를 `/domain`과 함께 쓰면 계정을 로컬 컴퓨터가 아니라 **도메인에** 만들고, `/delete`를 `/domain`과 함께 쓰면 도메인에서 지운다. `/domain` 없이 쓰면 그 컴퓨터의 로컬 계정을 다룬다.
  문제 해결 문서 「Redirect the users and computers containers in Active Directory domains」도 `NET USER`를 옛 API로 도메인에 사용자를 만드는 명령으로 든다 — 그렇게 만든 사용자는 기본 `CN=Users` 컨테이너에 들어간다(아래 「(phase 80 step 4) … 조직 구성 단위와 사이트」 항목). **E36**의 근거다
- 「Built-in and Account Domains」(Win32): DC가 아닌 컴퓨터마다 SAM 데이터베이스가 있다. 그 안의 **기본 제공(built-in) 도메인**(이름은 BUILTIN의 현지어 판)에는 운영 체제를 설치할 때 생기는 Administrators·Users 같은 기본 로컬 그룹이, **계정 도메인**(이름은 컴퓨터 이름)에는 Administrator 같은 사용자·그룹 계정이 든다.
  워크스테이션이나 구성원 서버의 계정 도메인에 정의한 계정은 **그 컴퓨터에 있는 자원에만** 닿는다. 네트워크 자원에 닿아야 하는 계정은 DC의 계정 도메인에 정의해야 하고, 네트워크에 속하지 않아 주 도메인이 없는 컴퓨터는 그 컴퓨터에 들어오는 모든 계정을 자기 계정 도메인에 둔다.
  **DC에는 기본 제공 도메인도 계정 도메인도 없고**, SAM 대신 Active Directory에 계정 정보를 둔다 — 두 절
- 「Security principals」: 로컬 사용자 계정과 보안 그룹은 로컬 컴퓨터에서 만들어 그 컴퓨터 자원의 접근을 관리하는 데 쓰고, 그 컴퓨터의 SAM이 저장·관리한다. AD 도메인에서 만든 계정과 그룹은 AD 데이터베이스에 저장되어 도메인 자원의 접근을 관리한다 — 「Accounts and security groups」.
  **보안 그룹**은 사용자 계정·컴퓨터 계정·다른 그룹을 보안 관점에서 한 단위로 다루려고 묶은 것이고, 로컬 그룹은 DC를 뺀 모든 Windows 컴퓨터의 SAM에 있으며 그 컴퓨터 자원의 권한과 사용 권한을 다루는 데만 쓴다 — 「Security groups」
- 「Add-LocalGroupMember」: 그룹에 준 권한과 사용 권한은 그 그룹의 모든 구성원에게 주어진다. 로컬 Administrators 그룹의 구성원은 그 컴퓨터에 모든 권한을 가지므로 구성원을 적게 두라고 권한다. 도메인에 가입한 컴퓨터는 그 도메인과 신뢰받는 도메인의 사용자·컴퓨터·그룹 계정도 로컬 그룹에 넣을 수 있다 — 「Description」
- 「Active Directory security groups」: 사람 하나하나가 아니라 그룹 단위로 다루면 관리가 단순해진다. **사용자 권한**은 그 그룹의 구성원이 할 수 있는 일을 정하고(예: Backup Operators에 넣은 사람은 그 그룹에 자동으로 주어진 「파일 및 디렉터리 백업」·「파일 및 디렉터리 복원」 권한을 물려받는다),
  **사용 권한**은 공유 자원에 대해 누가 어느 수준(모든 권한·읽기 등)으로 접근하는지 정한다 — 문서는 둘이 다르다고 따로 적는다. 사람을 그룹에 넣으면 그 그룹의 사용자 권한과, 그 그룹이 공유 자원에 받은 사용 권한을 모두 받는다 — 「Security groups」, 「Default security groups」.
  도메인의 기본 그룹은 「Active Directory 사용자 및 컴퓨터」의 Builtin 컨테이너와 Users 컨테이너에 있고, Builtin 컨테이너 그룹의 범위는 「Builtin Local」이라 바꿀 수 없다 — 「Group scope」 Note. (이 문서의 그룹 설명은 도메인 기준이다. 같은 이름의 그룹이 각 컴퓨터의 로컬 그룹으로도 있다는 것은 「Built-in and Account Domains」와 「Security identifiers」의 S-1-5-32 그룹들로 확인한다)
- 아래 그룹 줄은 「Active Directory security groups」의 그룹별 절과 「Security identifiers」의 잘 알려진 SID 표(S-1-5-32-…)를 맞춰 본 것이다:
  - **Administrators**: 그 컴퓨터에 제한 없는 접근을 갖는다(컴퓨터를 DC로 올리면 도메인 전체에). 이름을 바꾸거나 지울 수 없다. 설치 직후 구성원은 Administrator 계정 하나이고, 도메인에 가입하면 Domain Admins 그룹이 더해진다 — 「Administrators」, S-1-5-32-544
  - **Users**: 실수로든 일부러든 **시스템 전체에 걸친 변경을 하지 못하게 막힌다**. 대부분의 응용 프로그램을 실행하고, 로컬·네트워크 프린터를 쓰고, 컴퓨터를 끄거나 잠글 수 있다. 설치 프로그램이 사용자별 설치를 지원하면 자기만 쓰는 응용 프로그램은 설치할 수 있다.
    설치 직후 구성원은 **Authenticated Users** 하나이고, 도메인에 가입하면 Domain Users 그룹이 더해진다 — 「Users」, S-1-5-32-545
  - 「Special identity groups」: **Authenticated Users**는 로그온 과정을 거쳐 시스템에 들어온 모든 사용자를 나타내는 특수 그룹이고, 구성원은 운영 체제가 정해 관리자가 보거나 고칠 수 없다 — 「Authenticated Users」, 「How special identity groups work」.
    두 문서를 이으면 새로 만든 로컬 계정도 로그온하면 Users 그룹의 권한을 받는다. **「새 계정은 Users 그룹에 넣어진다」를 한 문장으로 적은 지금 판 문서는 찾지 못했다** — 지난 판 「Local and Domain Default Groups」는 Users의 기본 구성원을 Domain Users·Authenticated Users·Interactive로 들고, 그래서 도메인에서 만든 모든 사용자 계정이 이 그룹의 구성원이 된다고 적는다(Windows Server 2012까지의 판)
  - **Guests**: 기본 구성원은 Guest 계정 하나이고, 가끔·한 번 쓰는 사람이 제한된 권한으로 로그온하게 한다. Users와 비슷한 접근을 갖되 Guest 계정에는 제한이 더 걸린다.
    Guests 그룹의 구성원이 로그아웃하면 프로필 전체(%userprofile% 아래 모두)가 지워지므로 손님은 **임시 프로필**로 로그온하는 셈이다. Guest 계정은 기본으로 꺼져 있고 꺼 둔 채로 두라고 권한다 — 「Guests」, S-1-5-32-546.
    **기본으로 꺼져 있는 것은 Guest 계정이다 — Guests 그룹 자체를 켜고 끄는 설정은 문서에 없다**. 지난 판 문서도 「구성원은 로그온할 때 임시 프로필이 만들어지고 로그오프하면 지워진다」, 「Guest 계정(기본으로 꺼짐)도 기본 구성원」이라고 계정과 그룹을 갈라 적는다
  - **Backup Operators**: 파일을 보호하는 사용 권한과 관계없이 그 컴퓨터의 모든 파일을 백업하고 복원할 수 있고, 로그온해서 컴퓨터를 끌 수도 있다. 기본 구성원이 없다 — 「Backup Operators」, S-1-5-32-551.
    지난 판 문서는 그 까닭을 백업 권한이 모든 파일 사용 권한보다 앞서기 때문이라고 적고, 이 그룹은 보안 설정을 바꿀 수 없다고 적는다
  - **Power Users**: 기본 구성원이 없다. 로컬 사용자와 그룹을 만들고, 자기가 만든 계정을 고치거나 지우고, Power Users·Users·Guests 그룹에서 사용자를 빼고, 프로그램을 설치하고, 로컬 프린터를 만들어 관리하고, 파일 공유를 만들고 지울 수 있다 — 「Security identifiers」 S-1-5-32-547(지금 판 「Active Directory security groups」에는 이 그룹의 절이 없다).
    지난 판 문서는 여기에 더해 파일 소유권 가져오기, 디렉터리 백업·복원, 장치 드라이버 로드·언로드, 보안·감사 로그 관리는 **하지 못한다**고 적는다. **Administrators와 같은 권한이라는 말은 어느 문서에도 없다**.
    **「옛 판과의 호환을 위해 남은 그룹」이라는 문장은 지금 판·지난 판 문서에서 찾지 못했다** — 문서가 이전 버전 호환용이라고 적는 그룹은 Pre–Windows 2000 Compatible Access다
  - **Remote Management Users**: 구성원은 Windows 원격 관리(WinRM) 서비스를 거쳐 WS-Management 같은 관리 프로토콜로 **WMI**(Windows Management Instrumentation) 자원에 접근할 수 있다 — 그 사용자에게 접근을 허락한 WMI 네임스페이스에만.
    서버 관리자(Server Manager) 콘솔로 서버를 관리하게 할 때 이 그룹을 쓰고, PowerShell 명령을 원격으로 실행하게 할 때는 WinRMRemoteWMIUsers__ 그룹을 쓴다 — 「Remote Management Users」, 「WinRMRemoteWMIUsers__」 Note, S-1-5-32-580
  - 「About WMI」(Win32): WMI는 기업 환경에서 관리 정보에 접근하는 표준 기술(WBEM)을 Microsoft가 구현한 것이고, 시스템·응용 프로그램·네트워크·장치 같은 관리 대상을 CIM 표준으로 나타낸다. 원격 컴퓨터의 관리 정보를 얻을 수 있다는 것이 쓸모이고, 원격 연결은 DCOM이나 WinRM(WS-Management 프로토콜)으로 한다 — 첫머리, 「Managing Remote Computer Systems with WMI」
  - **Performance Monitor Users**: 관리자나 Performance Log Users 그룹이 아니어도 로컬과 원격에서 성능 카운터를 **모니터링**할 수 있다. Users의 기능을 모두 쓰고, 성능 모니터에서 실시간 성능 데이터를 보고 보는 동안 표시 속성을 바꿀 수 있지만 **데이터 수집기 집합을 만들거나 고칠 수 없다** — 「Performance Monitor Users」, S-1-5-32-558
  - **Performance Log Users**: 관리자가 아니어도 로컬과 원격에서 성능 카운터·로그·경고를 **관리**할 수 있고 Performance Monitor Users의 기능을 모두 쓴다(SID 표: 성능 카운터의 로깅을 원격으로 예약할 수 있다).
    Windows Server 2016부터 이 그룹의 구성원은 데이터 수집기 집합을 새로 만들 수 없고, 로깅을 시작하거나 데이터 수집기 집합을 고치려면 그룹에 「일괄 작업으로 로그온」 사용자 권한을 먼저 줘야 한다 — 「Performance Log Users」 Note, S-1-5-32-559
  - **Access Control Assistance Operators**: 구성원은 이 컴퓨터 자원의 **권한 부여 특성(authorization attributes)과 사용 권한을 원격으로 조회**할 수 있다 — 다른 사용자(관리자 포함)의 접근 정보가 드러날 수 있다. 이름을 바꾸거나 지울 수 없다 — 「Access Control Assistance Operators」, S-1-5-32-579.
    **두 문서 모두 「조회」(query)라 적고 「관리」라 적지 않으며, 「인증(authentication)」이 아니라 「권한 부여(authorization)」 특성이라 적는다**
  - **Remote Desktop Users**: RD 세션 호스트 서버에 원격으로 연결할 사용 권한을 사용자·그룹에 주는 데 쓰고(그룹 문서), 구성원은 원격으로 로그온할 권한을 받는다(SID 표) — 「Remote Desktop Users」, S-1-5-32-555
  - **RDS Endpoint Servers**: 구성원은 사람이 아니라 **서버**다 — RemoteApp 프로그램과 개인 가상 데스크톱이 실행되는 가상 머신을 돌리고 세션을 호스트하는 서버들이다. RD 연결 브로커를 실행하는 서버에서 이 그룹을 채워야 하고, 그 배포의 RD 세션 호스트·RD 가상화 호스트 서버가 들어야 한다.
    곧 원격 데스크톱 서비스(RDS) 배포를 위한 그룹이다 — 「RDS Endpoint Servers」, S-1-5-32-576
  - **Replicator**: 구성원은 도메인 안의 파일 복제를 지원하는 **컴퓨터**이고, Windows Server는 FRS로 SYSVOL 폴더의 시스템 정책과 로그온 스크립트를 복제한다(FRS는 DFS 복제가 대신한다). 기본 구성원이 없고 사용자를 넣지 말라고 한다 — 「Replicator」, S-1-5-32-552
- (phase 80 step 4, 2026-11-16 IPv4로 다시 받아 확인 — 「Active Directory security groups」 `updated_at` 2026-10-30, 한국어판 2026-11-05) **그룹 종류는 둘이다**. **보안 그룹**은 공유 자원의 사용 권한을 주는 데 쓰고(그룹에 사용자 권한도 줄 수 있다), **배포 그룹**은 Exchange Server 같은 메일 프로그램으로 여러 사람에게 메일을 보내는 목록으로만 쓴다.
  배포 그룹은 보안 기능이 꺼져 있어 자원의 사용 권한 목록(DACL)에 넣을 수 없다. 거꾸로 보안 그룹은 메일을 받는 쪽으로도 쓸 수 있다 — 「How Active Directory security groups work」, 「Security groups」, 「Distribution groups」
- 같은 문서 「Group scope」: **범위**는 그 그룹이 도메인 트리·포리스트의 어디까지 미치는지, 곧 **그 그룹에 사용 권한을 줄 수 있는 곳**이 어디인지를 정한다. 범위는 유니버설·글로벌·도메인 로컬 셋이다(Builtin 컨테이너의 기본 그룹만 범위가 Builtin Local이고 바꿀 수 없다). 표를 범위마다 이렇게 읽는다:
  - **유니버설**: 같은 포리스트의 어느 도메인에 있는 계정·글로벌 그룹·다른 유니버설 그룹을 넣을 수 있고, 같은 포리스트의 어느 도메인(과 신뢰하는 포리스트)에서나 사용 권한을 받는다
  - **글로벌**: **같은 도메인**의 계정과 같은 도메인의 다른 글로벌 그룹만 넣을 수 있고, 같은 포리스트의 어느 도메인(과 신뢰하는 도메인·포리스트)에서나 사용 권한을 받는다
  - **도메인 로컬**: 어느 도메인(신뢰받는 도메인 포함)의 계정·글로벌 그룹, 같은 포리스트의 유니버설 그룹, 같은 도메인의 다른 도메인 로컬 그룹, 다른 포리스트·외부 도메인의 계정·글로벌·유니버설 그룹까지 넣을 수 있지만, 사용 권한은 **그 그룹이 있는 도메인 안에서만** 받는다
  - 범위 바꾸기는 조건이 붙는다 — 표의 「Scope conversion」 열: 다른 유니버설 그룹의 구성원이 아닌 유니버설은 도메인 로컬로, 유니버설을 담지 않은 유니버설은 글로벌로, 다른 글로벌 그룹의 구성원이 아닌 글로벌은 유니버설로, 다른 도메인 로컬을 담지 않은 도메인 로컬은 유니버설로 바꿀 수 있다. 글로벌과 도메인 로컬 사이를 곧바로 바꾸는 칸은 없다
    (지금 판 문제 해결 문서 「Use the Directory Service command-line tools…」도 도메인 로컬과 글로벌은 서로 바꿀 수 없다고 적는다 — 아래 「(phase 80 step 4) … 도메인 사용자 계정과 ds 명령」 항목)
  - 같은 표의 「Possible member of」 열: 글로벌 그룹은 도메인 로컬 그룹(같은 포리스트의 어느 도메인이나 신뢰하는 도메인의 것)의 구성원이 될 수 있고, 도메인 로컬 그룹은 같은 도메인 컴퓨터의 로컬 그룹(잘 알려진 SID를 가진 기본 그룹은 빼고)에 들 수 있다.
    **「글로벌 그룹을 도메인 로컬 그룹에 넣고 사용 권한은 도메인 로컬 그룹에 준다」를 권고로 적은 곳은 이 문서에 없다** — 권고로 쓰지 않는다
- 같은 문서 「Domain Users」: 도메인의 **모든 사용자 계정**이 이 그룹에 들고, 도메인에 사용자 계정을 만들면 **기본으로 이 그룹에 들어간다**. 범위는 글로벌, 기본 컨테이너는 Users이고 기본으로 Users 그룹의 구성원이다. 예로, 도메인의 모든 사용자가 프린터를 쓰게 하려면 그 프린터의 사용 권한을 이 그룹에 준다 — 곧 새 도메인 계정은 처음부터 이 그룹(과 이 그룹이 든 그룹)이 받은 사용 권한을 받는다
- **로컬 그룹과 도메인 로컬 그룹**: 로컬 그룹은 DC가 아닌 각 컴퓨터의 SAM에 있고 그 컴퓨터 자원의 권한과 사용 권한에만 쓰인다(위 「Security principals」 줄). 도메인 로컬 그룹은 AD 데이터베이스에 있는 도메인의 그룹이고 그 도메인 안의 자원에 사용 권한을 받는다(위 「Group scope」 줄). **둘을 견준 한 문장은 찾지 못했다** — 어디에 저장되고 어디까지 쓰이는지로 가른다
- 「Active Directory Replication Concepts」(아래 「(phase 80 step 4) … 조직 구성 단위와 사이트」 항목): **글로벌 카탈로그** 서버는 포리스트의 모든 개체 정보를 담는 DC이고, 사용자의 유니버설 그룹 구성원 정보는 글로벌 카탈로그에서 얻는다(유니버설 그룹 구성원 캐싱을 켜면 DC가 그 정보를 캐시한다) — 「Global catalog server」, 「Universal group membership caching」. 이름과 이 한 줄만 쓰고 동작은 쓰지 않는다
- **한국어 이름**(phase 80 step 4): 「Active Directory security groups」 한국어판은 Security groups·Distribution groups를 「보안 그룹」·「배포 그룹」, Group scope를 「그룹 범위」, Universal·Global·Domain Local을 「유니버설」·「전역」·「도메인 로컬」로 옮긴다.
  **고른 이름**: 「보안 그룹」·「배포 그룹」, 「유니버설 그룹」·「글로벌 그룹」·「도메인 로컬 그룹」 — Global은 한국어판의 「전역」 대신 기출([기출 2026-02-01 #43]의 보기)과 guide.md가 쓰는 「글로벌」을 세우고, 처음 나오는 자리에 「전역 그룹」이라고도 부른다는 것을 한 번 적는다
- **한국어 이름**: 「Local accounts」 한국어판은 「컴퓨터 관리」, 「로컬 사용자 및 그룹\사용자」, 「기본 로컬 사용자 계정」으로 옮긴다. 계정 절의 제목은 「관리자」·「게스트」로 번역하면서 표시 이름은 「Administrator」로 남기고, Guest의 표시 이름은 「게스트」로 번역했다.
  그룹 이름은 영문 그대로(「Administrators 그룹」)와 번역(「관리자 그룹」)이 섞인다. 「Active Directory security groups」 한국어판의 절 제목도 영문 그대로(Administrators·Guests·Users·Replicator)와 번역(「백업 운영자」·「성능 모니터 사용자」·「성능 로그 사용자 목록」·「원격 관리 사용자」·「원격 데스크톱 사용자들」·「RDS 엔드포인트 서버」·「Access Control 지원 연산자」)이 섞인다.
  user right는 「사용자 권한」(로컬 보안 정책의 「사용자 권한 할당」)과 「사용자 권리」(「사용 권한은 사용자 권리와 다릅니다」)로 갈리고, permission은 「사용 권한」으로 옮긴 곳이 많다. WMI는 「Windows 관리 계측(WMI)」으로 옮긴다.
  **고른 이름**: 계정·그룹 이름은 **영문 그대로** 쓴다 — 한국어판의 번역이 일정하지 않고, 실제 한국어 화면의 이름은 확인하지 못했으며, 기출도 영문으로 적는다. 도구는 「컴퓨터 관리」·「로컬 사용자 및 그룹」.
  right는 「사용자 권한」(화면 이름 「사용자 권한 할당」과 같은 말), permission은 「사용 권한」 — 한국어판이 permission을 「사용 권한」으로 옮기는 곳을 따른다

쓰인 곳: (phase 80 step 1에서 쓰일 곳) `windows-ad.local-accounts`(로컬 계정과 보안 기관, 기본 로컬 사용자 계정 — Administrator·Guest·DefaultAccount와 그 성질, 다른 계정은 클라이언트 기능의 것, 「컴퓨터 관리」의 「로컬 사용자 및 그룹」, `net user`, 그 컴퓨터의 자원에만 닿는다, DC에는 로컬 계정 데이터베이스가 없다),
`windows-ad.local-groups`(그룹에 넣으면 그 그룹의 권한·사용 권한을 받는다, 그룹별 줄, 사용자 권한과 사용 권한, Administrators 구성원을 적게, WMI 한 줄), 기출 대조(`exam-notes.md` 「phase 80 step 0」 문단, **E35**)
(phase 80 step 1) `windows-ad.local-accounts`(「Local accounts」 — 한 장치가 계정을 확인하는 보안 기관·그 장치 안에서만 통한다·적용 판, 기본 로컬 사용자 계정 Administrator·Guest·DefaultAccount, WDAGUtilityAccount·WSIAccount는 PC용 Windows 기능의 계정, 「컴퓨터 관리」의 「로컬 사용자 및 그룹\사용자」; 「Built-in and Account Domains」 — 그 컴퓨터의 자원에만 닿는다·네트워크 자원에 닿을 계정은 도메인에; 「net user」 — 목록·`* /add`·`/delete`), 도식 `local-user-accounts`, 문항 n256(Guest는 기본으로 꺼져 있다);
`windows-ad.local-groups`(「Add-LocalGroupMember」·「Active Directory security groups」 — 그룹의 권한·사용 권한이 구성원에게, 사용자 권한과 사용 권한, Backup Operators의 「파일 및 디렉터리 백업」·「파일 및 디렉터리 복원」, 그룹별 줄 — 위 목록대로, Power Users는 지난 판 문서라고 밝혀 씀, RDS Endpoint Servers는 E35대로 문서의 말로 한 줄), 도식 `builtin-local-groups`, 문항 n257(Backup Operators — 오답 Administrators·Power Users·Remote Desktop Users)·n258(Administrators의 권한이 구성원에게 — 그 컴퓨터 안에서만)
(phase 80 step 4에서 쓰일 곳) `windows-ad.group-scopes`(그룹 종류 둘, 범위 셋마다 넣을 수 있는 구성원과 사용 권한을 받는 곳, 범위 바꾸기의 조건, 로컬 그룹과 도메인 로컬 그룹, 글로벌 카탈로그 한 줄), `windows-ad.domain-user-accounts`(Domain Users — 새 도메인 계정이 기본으로 드는 그룹),
`windows-ad.ds-commands`(`net user`의 `/domain` — **E36**), 기출 대조(`exam-notes.md` 「phase 80 step 4」 문단 — [기출 2026-02-01 #43], [기출 2025-08-24 #38])
(phase 80 step 6) `windows-ad.group-scopes`(「Active Directory security groups」 — 그룹 종류 둘(보안 그룹은 사용 권한과 사용자 권한을 받고, 배포 그룹은 메일 목록으로만 쓰며 사용 권한 목록에 넣을 수 없다, 보안 그룹은 메일 목록으로도 쓴다), 그룹 범위의 뜻, 범위 셋마다 넣을 수 있는 구성원과 사용 권한을 받는 곳(도메인 로컬은 신뢰받는 도메인의 계정까지 넣고 자기 도메인에서만, 글로벌은 같은 도메인의 계정·글로벌 그룹만 넣고 포리스트와 신뢰하는 도메인에서, 유니버설은 같은 포리스트의 계정·글로벌·유니버설 그룹을 넣고 포리스트와 신뢰하는 포리스트에서), 「Possible member of」 — 글로벌 그룹을 도메인 로컬 그룹에 넣을 수 있다(권고로는 쓰지 않는다), 「Global」의 한국어판 이름 「전역」; 「Security principals」 — 로컬 그룹과 도메인 로컬 그룹이 저장되는 곳과 쓰이는 범위; 「Active Directory Replication Concepts」 — 유니버설 그룹 구성원 정보는 글로벌 카탈로그에서 얻는다(복제는 쓰지 않는다)), 도식 `group-scopes`, 문항 n267(두 도메인의 계정을 넣고 두 도메인의 자원에 쓰려면 유니버설 범위의 보안 그룹 — 오답의 글로벌·도메인 로컬 범위와 배포 그룹은 같은 근거);
`windows-ad.ds-commands`(「net user」 — 따로 적지 않으면 그 컴퓨터의 로컬 계정, `/domain`을 붙이면 기본 도메인의 DC에서 도메인 사용자 계정 — **E36**대로 문서의 사실을 쓰고 「자격시험은」 한 줄을 덧붙인다. 문항은 `net user`를 쓰지 않는다)

## (phase 80 step 0) Microsoft Learn — AD DS·도메인 컨트롤러·논리 구조: Active Directory Domain Services overview, Install Active Directory Domain Services, DNS and AD DS, Domain Controller Location, Locating domain controllers in Windows and Windows Server, Domain Name System (DNS) in Windows and Windows Server, Dynamic update, Understanding the Active Directory Logical Model, Selecting the Forest Root Domain, Planning Operations Master Role Placement, Planning Domain Controller Placement, Virtualized Domain Controller Deployment and Configuration, Join a computer to a domain, Add-Computer; Win32 — Domain Trees, Forests, Searching Domain Contents, Replication and Data Integrity
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/dns-and-ad-ds
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/domain-controller-location
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/dc-locator
https://learn.microsoft.com/en-us/windows-server/networking/dns/dns-overview
https://learn.microsoft.com/en-us/windows-server/networking/dns/dynamic-update
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/understanding-the-active-directory-logical-model
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/selecting-the-forest-root-domain
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/planning-operations-master-role-placement
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/planning-domain-controller-placement
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/virtualized-domain-controller-deployment-and-configuration
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/join-computer-to-domain
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/add-computer?view=powershell-5.1
https://learn.microsoft.com/en-us/windows/win32/ad/domain-trees
https://learn.microsoft.com/en-us/windows/win32/ad/forests
https://learn.microsoft.com/en-us/windows/win32/ad/searching-domain-contents
https://learn.microsoft.com/en-us/windows/win32/ad/replication-and-data-integrity

2026-11-16에 IPv4로 내려받아 읽은 판: 「Active Directory Domain Services overview」 `updated_at` 2026-02-16(`ms.date` 2025-03-10), 「Install Active Directory Domain Services」 2026-02-16(2025-04-18),
「DNS and AD DS」·「Domain Controller Location」·「Understanding the Active Directory Logical Model」·「Selecting the Forest Root Domain」·「Planning Operations Master Role Placement」·「Planning Domain Controller Placement」·「Virtualized Domain Controller Deployment and Configuration」 2025-09-23(2025-05-12),
「Locating domain controllers in Windows and Windows Server」 2025-07-21(2025-07-10), 「Domain Name System (DNS) in Windows and Windows Server」 2025-05-15(2025-05-15), 「Dynamic update」 2025-04-28(2025-02-13), 「Join a computer to a domain」 2025-09-15(2025-06-06) — 모두 「Applies to」 Windows Server 2016~2025.
「Add-Computer」 2025-09-01(2024-09-25, Windows PowerShell 5.1 판). Win32 「Domain Trees」 2025-03-11, 「Forests」·「Searching Domain Contents」·「Replication and Data Integrity」 2025-03-12(넷 다 `ms.date` 2018-05-31 — 적용 판을 적지 않는 개발자 문서다).
한국어판(`ko-kr`)도 모두 받았다(`updated_at` 2026-01-09~2026-10-23, 기계 번역) — **용어 표기만** 참고한다.

- **Active Directory Domain Services overview**: **디렉터리**는 네트워크에 있는 개체의 정보를 담는 계층 구조이고, AD DS 같은 **디렉터리 서비스**는 디렉터리 데이터를 저장해 네트워크 사용자와 관리자가 쓰게 하는 방법을 준다. AD DS는 사용자 계정의 이름·암호·전화번호 같은 정보를 저장하고, 같은 네트워크의 권한 있는 사용자가 그 정보에 접근하게 한다.
  데이터 저장소(디렉터리)에 드는 개체는 보통 서버·볼륨·프린터 같은 공유 자원과 네트워크 사용자·컴퓨터 계정이다 — 첫머리
- 같은 문서: 보안은 **로그온 인증**과 **디렉터리 개체에 대한 접근 제어**로 AD DS에 묶인다. 네트워크 사용자 이름과 암호 하나로 관리자는 네트워크 전체의 디렉터리 데이터와 조직을 관리하고, 권한 있는 사용자는 네트워크 어디의 자원에나 접근한다. 정책 기반 관리가 복잡한 네트워크의 관리를 쉽게 한다 — 첫머리
- 같은 문서: AD DS에는 스키마(디렉터리에 드는 개체·속성의 규칙), 글로벌 카탈로그(디렉터리의 모든 개체 정보 — 어느 도메인에 있든 찾게 한다), 질의·색인 장치, **복제 서비스**가 함께 있다. 한 도메인의 모든 DC는 복제에 참여해 **그 도메인 디렉터리 정보 전체의 사본**을 갖고, 디렉터리 데이터가 바뀌면 그 도메인의 모든 DC로 복제된다 — 첫머리 목록(스키마·글로벌 카탈로그는 이름만 가져오고 동작은 가져오지 않는다)
- **Install Active Directory Domain Services**: 서버 관리자에서 「관리」 → 「역할 및 기능 추가」로 역할 추가 마법사를 열고 「서버 역할 선택」에서 Active Directory Domain Services를 골라 설치한 뒤, 결과 페이지에서 「이 서버를 도메인 컨트롤러로 승격」을 눌러 Active Directory Domain Services 구성 마법사를 시작한다 — 이 구성 마법사는 Windows Server 2012부터의 것이고 옛 설치 마법사(dcpromo.exe)는 그때부터 사용 중단이다.
  PowerShell로는 `Install-WindowsFeature -name AD-Domain-Services -IncludeManagementTools`가 AD DS 서버 역할과 관리 도구(「Active Directory 사용자 및 컴퓨터」 같은 것)를 설치한다 — 「Install AD DS by using Server Manager」, 「Install AD DS by Using Windows PowerShell」.
  구성 마법사의 「배포 구성」에서 새 포리스트 만들기, 기존 포리스트에 새 도메인(자식 도메인·트리 도메인) 더하기, 기존 도메인에 DC 더하기 가운데 고르고, 「도메인 컨트롤러 옵션」에서 새 포리스트·도메인을 만들 때 DNS 서버를 고르라고 적는다 — 같은 문서
  (DNS 서버 옵션이 기본으로 골라져 있다는 문장은 이 문서의 RODC 계정 만들기 절에만 있다). 새 포리스트를 설치하려면 그 컴퓨터의 로컬 Administrator로 로그온해야 하고, 새 자식 도메인·새 도메인 트리는 Enterprise Admins, 기존 도메인의 추가 DC는 Domain Admins의 구성원이어야 한다 — 「Prerequisites」
- **DNS and AD DS**·**Domain Controller Location**: AD DS는 DNS 이름 풀이로 클라이언트가 DC를 찾게 하고, DC끼리도 DNS로 서로를 찾아 복제 같은 일을 한다. 클라이언트는 로그온 요청 처리나 디렉터리 검색을 위해 DNS로 DC를 찾고, DC는 이를 돕는 여러 레코드(로케이터 레코드)를 DNS에 등록한다 — 두 문서 첫머리
- **Domain Name System (DNS) in Windows and Windows Server**: DNS는 서버 관리자나 PowerShell로 설치하는 Windows Server의 서버 역할이고, **새 AD 포리스트와 도메인을 세울 때 AD와 함께 저절로 설치된다**. DNS는 AD DS에서 인증·업데이트·검색을 위한 DC 위치 확인 장치다.
  예로, AD 사용자 계정으로 도메인에 로그온하면 DNS 클라이언트 서비스가 DNS 서버에 그 도메인의 DC를 묻고, 답으로 받은 DC의 IP 주소로 인증을 시작한다. AD 없이 DNS만 쓸 수도 있다 — 「Using DNS in Windows and Windows Server」
- **Locating domain controllers**: AD 도메인은 늘 이름이 둘이다 — DNS 정규화된 도메인 이름(FQDN)과 NetBIOS 도메인 이름(15자 제한). DNS 기반 찾기에서 클라이언트는 DC가 등록한 SRV 레코드(`_ldap._tcp.<DNS 도메인 이름>` 꼴)를 묻는다 — 「Discovery process」, 「DNS-based discovery」
- **Dynamic update**: 영역을 AD에 통합하면 Windows Server의 DNS 서버는 기본으로 **보안 동적 업데이트만 허용**하고, 파일에 둔 영역은 기본으로 동적 업데이트를 허용하지 않는다. 보안 동적 업데이트는 AD 통합 영역에서만 쓸 수 있다 — 「Secure dynamic update」, 첫머리. 기출 오답의 대조에만 쓴다
- **Join a computer to a domain**: 서버나 클라이언트 장치를 도메인에 가입시키는 것을 조직 네트워크의 중앙 관리와 보안 향상을 위한 단계라고 적는다 — 첫머리. 「Add-Computer」: 이 cmdlet은 컴퓨터를 **도메인 또는 작업 그룹**(workgroup)에 더한다. 작업 그룹 이름의 기본값은 `WORKGROUP`이다 — 「Description」, 「-WorkgroupName」.
  **작업 그룹 자체를 정의하거나 도메인과 견준 지금 판 문서는 찾지 못했다** — 작업 그룹 컴퓨터의 계정이 그 컴퓨터에 묶인다는 것은 앞 항목의 「Built-in and Account Domains」(네트워크 자원에 닿아야 하는 계정은 DC의 계정 도메인에, 주 도메인이 없는 컴퓨터는 모든 계정을 자기 계정 도메인에)로만 댄다
- **Understanding the Active Directory Logical Model**: AD DS는 네트워크 자원의 정보를 저장·관리하는 분산 데이터베이스이고, 사용자·컴퓨터·장치 같은 요소를 담는 계층 구조로 정리하게 한다. **맨 위 그릇이 포리스트, 그 안에 도메인, 도메인 안에 조직 구성 단위(OU)**가 있다 — DC 수나 네트워크 토폴로지 같은 물리적 측면과 상관없어서 논리 모델이라 부른다 — 첫머리
- 같은 문서 「Active Directory forest」: 포리스트는 AD 도메인 하나 이상의 묶음이고, 그 도메인들은 논리 구조·디렉터리 스키마(클래스·속성 정의)·디렉터리 구성(사이트·복제 정보)·글로벌 카탈로그(포리스트 전체 검색)를 함께 쓴다. **같은 포리스트의 도메인은 양방향 전이적 트러스트로 저절로 이어진다**.
  **「포리스트는 보안 경계다」를 적은 지금 판 문서는 찾지 못했다** — 쓰지 않는다
- 같은 문서 「Active Directory domain」: 도메인은 포리스트를 나눈 조각(파티션)이고, 데이터를 필요한 곳에만 복제하게 한다. 도메인이 맡는 일은 넷이다 — ① 네트워크 전체의 사용자 ID: 사용자 ID를 한 번 만들어 그 포리스트에 가입한 어느 컴퓨터에서나 쓰고, 도메인을 이루는 DC가 사용자 계정과 자격 증명(암호·인증서)을 안전하게 저장한다
  ② 인증: DC가 사용자를 인증하고, 자원 접근 제어에 쓰이는 그룹 구성원 같은 권한 부여 데이터를 준다 ③ 트러스트: 도메인은 트러스트로 자기 포리스트 밖 도메인의 사용자에게도 인증을 넓힌다 ④ 복제: 도메인 서비스에 충분한 디렉터리 파티션을 DC끼리 복제하므로 한 도메인의 DC는 모두 대등하고 한 단위로 관리된다
- (phase 80 step 4, 2026-11-16 다시 받아 확인) 같은 문서 「Active Directory organizational units」: OU로는 **도메인 안에** 그릇의 계층을 만든다. OU는 그룹 정책을 적용하거나 권한을 위임하는 것 같은 **관리 목적**으로 개체를 묶는다. OU와 그 안 개체를 누가 다루는지는 그 OU와 개체에 붙은 ACL이 정하고,
  위임으로 소유자가 개체의 관리 권한 전부나 일부를 다른 사용자·그룹에 넘긴다 — OU를 다룬 다른 문서는 아래 「(phase 80 step 4) … 조직 구성 단위와 사이트」 항목
- Win32 **Domain Trees**: 도메인 트리는 같은 스키마와 구성을 쓰며 **연속된 이름 공간**(contiguous namespace)을 이루는 여러 도메인이고, 트리의 도메인은 트러스트로도 이어진다. AD는 트리 하나 이상의 묶음이다 — 첫머리.
  Win32 **Searching Domain Contents**: 포리스트 안에서 도메인은 계층으로 놓인 도메인 트리를 이루고, 트리는 도메인 하나일 수도 자식 도메인을 가진 도메인일 수도 있다. 연속된 이름 공간이란 **자식 도메인의 이름이 부모의 이름 계층을 이어 간다**는 뜻이다 — 첫머리(예의 이름은 옮기지 않는다)
- Win32 **Forests**: 포리스트는 **서로 연속된 이름 공간을 이루지 않는** 도메인 트리 하나 이상의 묶음이고, 포리스트의 모든 트리는 스키마·구성·글로벌 카탈로그를 함께 쓴다. 트리와 달리 포리스트에는 따로 된 이름이 필요 없고, 트러스트 계층의 뿌리에 있는 트리의 이름이 그 포리스트를 가리킨다 — 첫머리
- **Selecting the Forest Root Domain**: 포리스트에 처음 배포한 도메인을 **포리스트 루트 도메인**이라 하고, 그 배포가 끝날 때까지 루트 도메인으로 남는다. Enterprise Admins·Schema Admins 그룹이 이 도메인에 있다 — 첫머리
- **Planning Operations Master Role Placement**: AD DS는 디렉터리 데이터의 **다중 마스터 복제**를 지원한다 — 어느 DC든 디렉터리 변경을 받아 다른 모든 DC로 복제한다. 다만 스키마 변경 같은 몇몇 변경은 정해진 DC(작업 마스터)만 받는다. RODC는 데이터베이스가 읽기 전용이라 작업 마스터가 될 수 없다 — 첫머리, Note(작업 마스터 역할의 이름과 일은 가져오지 않는다).
  Win32 「Replication and Data Integrity」: 다중 마스터 업데이트는 한 파티션의 모든 완전 복제본에 쓸 수 있다는 뜻이고, 그래서 일부 복제본이 동작하지 않아도 업데이트가 막히지 않는다. 바뀐 내용은 저절로 다른 복제본으로 퍼진다 — 첫머리
- **Virtualized Domain Controller Deployment and Configuration**: 도메인이나 포리스트의 모든 DC를 한 하이퍼바이저 호스트에서 돌리지 말라고 한다 — 단일 장애 지점이 되어 도메인 전체에 DC를 하나만 둔 것과 다르지 않기 때문이고, **여러 플랫폼의 여러 DC가 중복성과 내결함성을 준다** — 「Virtualization safeguards」 Warning
- **Planning Domain Controller Placement**: **RODC**(읽기 전용 도메인 컨트롤러)는 AD 데이터베이스의 읽기 전용 파티션을 갖는 DC다. 계정 암호를 뺀 모든 개체·속성을 쓰기 가능한 DC처럼 갖지만 그 데이터베이스는 고칠 수 없어서, 바꿀 일은 쓰기 가능한 DC에서 하고 RODC로 복제된다.
  사용자가 적고 **물리 보안이 약하며** 허브와의 대역폭이 낮고 IT 인력이 적은 원격·지점에 두도록 설계됐다(Windows Server 2008에서 들어왔다) — 첫머리.
  「Active Directory security groups」의 「Read-only Domain Controllers」: 물리 보안을 장담할 수 없는 곳(지점 등)에 DC를 쉽게 두게 하고, 기능은 읽기 전용 AD DS 데이터베이스·**단방향 복제**·자격 증명 캐싱·관리자 역할 분리·읽기 전용 DNS다. RODC 관리를 도메인 사용자·그룹에 맡길 수 있다
- **한국어 이름**: 한국어판은 「Active Directory 도메인 서비스(AD DS)」(개요 첫 문단 — 문서 제목과 역할·마법사 이름은 「Active Directory Domain Services」를 영문 그대로 둔다), 「디렉터리」·「디렉터리 서비스」, 「도메인 컨트롤러」, 「읽기 전용 도메인 컨트롤러」·「읽기 전용 AD DS 데이터베이스」·「단방향 복제」·「자격 증명 캐싱」, 「다중 마스터 복제」,
  「포리스트」·「도메인 트리」·「도메인」·「포리스트 루트 도메인」·「조직 구성 단위」, 「서버 관리자」·「역할 및 기능 추가」·「서버 역할 선택」·「이 서버를 도메인 컨트롤러로 승격」으로 옮기고, workgroup은 「작업 그룹」(「Add-Computer」·「Install AD DS」 한국어판), domain join은 「도메인에 컴퓨터를 가입」(「조인」도 섞인다)으로 옮긴다.
  Win32 「Forests」 한국어판은 제목만 「숲」이고 본문은 「포리스트」다. **고른 이름**: 「Active Directory 도메인 서비스(AD DS)」, 「도메인 컨트롤러」(DC), 「읽기 전용 도메인 컨트롤러」(RODC), 「포리스트」·「트리」(도메인 트리)·「도메인」, workgroup은 **「작업 그룹」** — 한국어판이 이 말 하나로 일관되게 옮긴다(guide.md의 「워크그룹」 대신)

쓰인 곳: (phase 80 step 2에서 쓰일 곳) `windows-ad.active-directory`(디렉터리와 디렉터리 서비스, 하는 일 — 로그온 인증과 디렉터리 개체의 접근 제어, 서버 관리자의 역할로 설치·DC로 승격, DNS로 DC를 찾는다·새 포리스트에서 DNS가 함께 설치된다, 작업 그룹과 도메인),
`windows-ad.domain-controller`(DC가 사용자 계정과 자격 증명을 저장하고 인증한다, 같은 도메인의 DC끼리 복제 — 도메인 전체 사본, 다중 마스터, 여러 DC의 중복성, RODC, DC에는 「로컬 사용자 및 그룹」을 쓰지 않는다 — 앞 항목);
(phase 80 step 3에서 쓰일 곳) `windows-ad.domain-tree-forest`(맨 위 그릇 포리스트·도메인·OU, 도메인이 맡는 일, 연속된 이름 공간의 트리, 연속되지 않은 트리들의 포리스트, 함께 쓰는 스키마·구성·글로벌 카탈로그 — 이름만, 도메인 이름은 DNS 이름, 포리스트 루트 도메인), `windows-ad.trust`(같은 포리스트의 도메인은 양방향 전이적 트러스트로 저절로 이어진다);
기출 대조(`exam-notes.md` 「phase 80 step 0」 문단);
(phase 80 step 2) `windows-ad.active-directory`(「Add-Computer」 — 컴퓨터를 도메인이나 작업 그룹에 넣는다; 「Built-in and Account Domains」 — 주 도메인이 없는 컴퓨터는 들어오는 계정을 모두 자기 안에 둔다; 「Active Directory Domain Services overview」 — 디렉터리와 그 개체, 인증과 접근 제어, 사용자 이름과 암호 하나로 네트워크의 자원에; 「Understanding the Active Directory Logical Model」 — 데이터베이스, 계정을 한 번 만들어 가입한 어느 컴퓨터에서나, DC가 인증하고 그룹 구성원 정보를 준다; 「Join a computer to a domain」 — 도메인 가입; 「Domain Name System (DNS) in Windows and Windows Server」·「DNS and AD DS」 — 로그온할 때 DNS로 DC를 찾는다, DC끼리도 DNS로, 첫 포리스트·도메인을 세울 때 DNS가 함께 설치된다(본문은 「아직 아무 도메인도 없는 곳에 첫 도메인을 세울 때」로 쓴다); 「Install Active Directory Domain Services」 — 서버 관리자의 「관리」 → 「역할 및 기능 추가」 → 「서버 역할 선택」, 「이 서버를 도메인 컨트롤러로 승격」, 구성 마법사에서 새 도메인이나 기존 도메인의 DC를 고른다; DHCP·DNS 서버가 하는 일은 phase 74 step 5·phase 79 항목), 도식 `active-directory-auth`, 문항 n259(계정을 AD DS에 한 번 만들고 PC를 도메인에 가입시킨다 — 오답의 DHCP·DNS는 같은 항목);
`windows-ad.domain-controller`(「Understanding the Active Directory Logical Model」 — DC가 계정과 자격 증명을 저장하고 인증한다; 「Active Directory Domain Services overview」 — 같은 도메인의 DC는 도메인 디렉터리 전체의 사본을 갖고 바뀐 내용이 모든 DC로 복제된다; 「Planning Operations Master Role Placement」·Win32 「Replication and Data Integrity」 — 다중 마스터 복제, 일부가 멈춰도 고치는 일이 막히지 않는다, 몇몇 변경은 정해진 DC만 받는다(작업 마스터의 이름과 일은 쓰지 않는다); 「Virtualized Domain Controller Deployment and Configuration」 — DC 한 대는 단일 장애 지점, 모든 DC를 한 호스트의 가상 머신으로 두지 말라; 「Planning Domain Controller Placement」·「Active Directory security groups」 — RODC는 계정 암호를 뺀 개체를 갖고 고칠 수 없으며, 쓰기 가능한 DC에서 단방향으로 복제받고, 물리 보안이 약한 지점에 둔다; 「Local accounts」·「Built-in and Account Domains」 — DC에는 로컬 계정을 두는 자리가 없어 「로컬 사용자 및 그룹」으로 그 DC의 계정을 관리할 수 없다), 도식 `dc-replication`, 문항 n260(한 대가 멈춰도 복제로 같은 계정을 가진 다른 DC가 확인한다)
(phase 80 step 3) `windows-ad.domain-tree-forest`(「Understanding the Active Directory Logical Model」 — 포리스트·도메인의 계층과 실제 배치와 상관없는 논리 구조, 포리스트를 나눈 조각인 도메인이 데이터를 필요한 곳에만 복제하게 한다, DC가 계정을 저장하고 인증한다, 같은 포리스트의 도메인이 함께 쓰는 스키마·구성·글로벌 카탈로그(이름과 한 줄 뜻만 — 구성은 「복제 같은 디렉터리 구성 정보」로 쓰고 사이트는 쓰지 않는다); 「Active Directory Domain Services overview」 — 스키마는 디렉터리에 드는 개체·속성의 규칙, 글로벌 카탈로그는 어느 도메인에 있든 개체를 찾게 하는 정보; Win32 「Domain Trees」·「Searching Domain Contents」 — 트리는 연속된 이름 공간을 이루는 도메인들, 자식 도메인의 이름이 부모의 이름을 이어 간다, 도메인 하나도 트리다; Win32 「Forests」 — 연속되지 않은 트리들의 묶음; 「Install Active Directory Domain Services」 — 기존 포리스트에 자식 도메인이나 새 트리의 도메인을 더한다; 「Selecting the Forest Root Domain」 — 처음 만든 도메인이 포리스트 루트 도메인; 「Locating domain controllers」 — 도메인은 DNS 이름을 갖는다; 이름의 오른쪽이 위 단계라는 것은 phase 79의 DNS 항목), 도식 `ad-forest-structure`, 문항 n261(이름이 이어지는 도메인끼리 한 트리, 이름이 다른 트리도 같은 포리스트).
  「포리스트는 보안 경계다」와 「도메인은 같은 정책을 쓰는 단위다」는 근거를 찾지 못해 쓰지 않았다 — 본문은 포리스트를 「가장 바깥의 묶음」, 도메인을 「계정을 함께 관리하는 단위」로 쓴다
(phase 80 step 4에서 쓰일 곳) `windows-ad.organizational-unit`(「Understanding the Active Directory Logical Model」 — OU는 도메인 안의 그릇 계층이고 관리 목적(그룹 정책·위임)으로 개체를 묶는다, 실제 배치와 상관없는 논리 구조), 기출 대조(`exam-notes.md` 「phase 80 step 4」 문단 — [기출 2025-02-23 #42])

## (phase 80 step 0) Microsoft Learn — 트러스트: netdom trust, Credentials processes in Windows authentication, How trust relationships work for forests in Active Directory(Microsoft Entra Domain Services 문서); 지난 판 Understanding Trusts, Understanding Trust Types, Understanding Trust Direction, Understanding Trust Transitivity, Understanding When to Create an External Trust
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netdom-trust
https://learn.microsoft.com/en-us/windows-server/security/windows-authentication/credentials-processes-in-windows-authentication
https://learn.microsoft.com/en-us/entra/identity/domain-services/concepts-forest-trust
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/cc731335(v=ws.10)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/cc730798(v=ws.10)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/cc731404(v=ws.10)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/cc754612(v=ws.10)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-r2-and-2008/cc732859(v=ws.10)

2026-11-16에 IPv4로 내려받아 읽은 판: 「netdom trust」 `updated_at` 2025-10-22(`ms.date` 2025-06-09), 「Credentials processes in Windows authentication」 2026-02-16(2025-06-30) — 둘 다 「Applies to」 Windows Server 2016~2025.
「How trust relationships work for forests in Active Directory」 2026-06-26(2025-06-30) — Microsoft Entra Domain Services 문서 묶음(`entra/identity/domain-services/`)에 있지만 본문의 앞 절들은 온프레미스 AD DS의 트러스트를 설명한다. **Entra Domain Services에만 해당하는 문장(관리형 도메인의 트러스트 방향·개수)은 쓰지 않는다**.
**Windows Server 문서 묶음에서 트러스트의 방향·전이성·종류를 정의한 지금 판 문서는 찾지 못했다**(`windows-server/identity/ad-ds/manage/how-trusts-work` 같은 주소는 404다) — 그래서 지난 판 다섯(모두 `updated_at` 2021-11-12, `ms.date` 2012-07-03, 적용 대상 Windows Server 2008)을 쓰고, 지금 판 세 문서가 같은 말을 하는지 줄마다 적는다.
한국어판(`ko-kr`)도 받았다(`updated_at` 2026-01-21~2026-11-07, 기계 번역 — 지난 판 다섯은 한국어판이 따로 없다).

- **트러스트**: 도메인 사이에 맺는 관계이고, 한 도메인의 사용자가 **다른 도메인의 DC에게 인증받을 수 있게** 한다. 트러스트 관계는 Domain Admins 그룹의 구성원만 관리한다 — 지난 판 「Understanding Trusts」 「Trusts」, 「Trusts in Windows 2000 Server…」.
  지금 판 「Credentials processes in Windows authentication」 「Local domains and trusted domains」가 같은 뜻을 적는다 — 두 도메인 사이에 트러스트가 있으면 각 도메인의 인증 장치는 상대 도메인에서 온 인증이 유효하다는 것에 기대고, 트러스트는 **자원 도메인(신뢰하는 도메인)**이 들어오는 인증 요청이 **신뢰받는 기관(신뢰받는 도메인)**에서 왔는지 확인해 공유 자원에 통제된 접근을 주게 돕는다 — 검증된 인증 요청만 도메인 사이를 건너게 하는 다리 구실이다
- **신뢰하는 도메인(trusting)과 신뢰받는 도메인(trusted)**: 지금 판 「netdom trust」 — 신뢰받는 도메인은 신뢰를 받는 쪽이고, 신뢰하는 도메인은 다른 도메인(신뢰받는 도메인)을 신뢰해 **그 도메인의 사용자가 자기 자원에 접근하도록** 허락하는 쪽이다 — 「Parameters」(`/oneside`).
  지난 판 「Understanding Trust Direction」: 신뢰하는 도메인은 사용자가 접근하려는 **자원이 있는 도메인**, 신뢰받는 도메인은 **사용자가 로그온하는 도메인**이다. 트러스트 관계에는 늘 이 두 도메인만 있고, 그림은 트러스트의 방향을 화살표로 나타낸다 — 「Trust Direction」
- **방향**: 단방향 트러스트는 두 도메인 사이에 만든 한 방향의 인증 경로이고, 양방향 트러스트는 A가 B를, B가 A를 신뢰해 인증 요청이 두 방향으로 오가는 것이다 — 지난 판 「Understanding Trust Direction」, 지금 판 Entra 문서 「One-way and two-way trusts」(같은 내용).
  지금 판 「Credentials processes」: 단방향은 **신뢰받는 도메인에서 신뢰하는 도메인의 자원으로** 접근을 주고, 양방향은 서로 상대 도메인의 자원으로 접근을 준다. 지금 판 Entra 문서 「Forest trusts」의 예: 포리스트 1(신뢰받는 쪽)과 포리스트 2(신뢰하는 쪽) 사이의 단방향 포리스트 트러스트에서 포리스트 1의 구성원은 포리스트 2의 자원에 접근하지만, 같은 트러스트로 포리스트 2의 구성원이 포리스트 1의 자원에 접근하지는 못한다.
  **「트러스트의 방향과 접근의 방향이 반대다」를 한 문장으로 적은 곳은 찾지 못했다** — 위 정의와 예를 이으면 그렇게 된다(신뢰: 신뢰하는 쪽 → 신뢰받는 쪽, 접근: 신뢰받는 쪽의 사용자 → 신뢰하는 쪽의 자원).
  두 문서의 「단방향 트러스트에서 A의 사용자가 B의 자원에 접근하고 B의 사용자는 A에 접근하지 못한다」는 문장은 A·B 가운데 어느 쪽이 신뢰하는지 말하지 않으므로 방향 규칙의 근거로 쓰지 않는다
- **전이성**: 트러스트를 맺은 두 도메인 밖으로 트러스트를 넓힐 수 있는지를 정한다 — 전이적 트러스트는 다른 도메인으로 트러스트를 넓히는 데, 비전이적 트러스트는 다른 도메인으로 넓히지 않는 데 쓴다 — 지난 판 「Understanding Trust Transitivity」, 지금 판 Entra 문서 「Transitive and non-transitive trusts」(같은 내용).
  지금 판 「Credentials processes」: 비전이적이면 두 파트너 도메인 사이에만 있고, 전이적이면 어느 한쪽이 신뢰하는 다른 도메인으로도 저절로 넓어진다. 지난 판 「Understanding Trusts」: 포리스트 안의 트러스트는 모두 양방향 전이적이라, A가 B를 신뢰하고 B가 C를 신뢰하면 C의 사용자도 (사용 권한을 받았을 때) A의 자원에 접근한다.
  지난 판 「Understanding Trust Transitivity」: 비전이적 트러스트는 그 두 도메인에 묶여 포리스트의 다른 도메인으로 흐르지 않고, 기본은 단방향이며 단방향 둘로 양방향을 만들 수 있다 — 「Nontransitive trust」
- **같은 포리스트 안에서 저절로 생기는 트러스트**: 포리스트에 새 도메인을 만들 때마다 새 도메인과 그 부모 도메인 사이에 **양방향 전이적 트러스트가 저절로** 만들어지고, 그 아래 자식 도메인이 더해지면 트러스트 경로가 도메인 계층을 따라 위로 이어져 트리의 모든 도메인 사이에 전이적 트러스트가 생긴다.
  그래서 포리스트 어느 도메인의 계정도 포리스트의 다른 어느 도메인에서 인증받고, 적절한 사용 권한이 있으면 한 번의 로그온으로 어느 도메인의 자원에나 접근한다 — 지난 판 「Understanding Trust Transitivity」 「Transitive trust」, 지금 판 Entra 문서 「Trust relationship flows」(같은 내용), 지금 판 「Understanding the Active Directory Logical Model」(같은 포리스트의 도메인은 양방향 전이적 트러스트로 저절로 이어진다 — 앞 항목).
  지금 판 Entra 문서의 그림 설명: 두 트리의 모든 도메인이 기본으로 전이적 트러스트를 가지므로 서로의 도메인 자원에 접근한다 — **자원에 적절한 사용 권한이 주어졌을 때**. **「트리 루트 트러스트」·「부모-자식 트러스트」라는 이름은 이 step이 읽은 Windows Server 문서에 없다** — 쓰지 않는다
- **다른 포리스트와 잇는 트러스트**: 지난 판 「Understanding Trust Types」는 새 트러스트 마법사나 Netdom으로 만드는 트러스트를 넷으로 든다 — **외부 트러스트**(비전이적, 단방향·양방향 — Windows NT 4.0 도메인이나, 포리스트 트러스트로 이어지지 않은 다른 포리스트의 도메인과 맺는다), 영역(realm) 트러스트(Windows가 아닌 Kerberos 영역과),
  **포리스트 트러스트**(전이적, 단방향·양방향 — 포리스트 사이의 자원 공유), 바로 가기(shortcut) 트러스트(전이적 — 같은 포리스트에서 두 트리에 나뉜 도메인 사이의 로그온 시간을 줄인다). 지난 판 「Understanding When to Create an External Trust」: 외부 트러스트를 맺으면 바깥 도메인의 보안 주체가 안쪽 도메인의 자원에 접근하고, 안쪽 도메인의 도메인 로컬 그룹 구성원이 될 수 있다.
  지금 판 Entra 문서 「Forest trusts」: 포리스트 트러스트는 두 포리스트의 **포리스트 루트 도메인 사이에만** 만들고 단방향·양방향 전이적이며, 셋째 포리스트로 저절로 넓어지지 않는다(1–2, 2–3 사이에 있어도 1과 3은 서로 신뢰하지 않는다).
  지금 판 「netdom trust」는 포리스트 트러스트를 netdom이 아니라 「Active Directory 도메인 및 트러스트」 스냅인으로 만든다고 적고(첫머리 Note), 선택적 인증 옵션이 「나가는 포리스트 트러스트와 외부 트러스트에서만」 유효하다고 적어(「Parameters」 `/selectiveauth`) **외부 트러스트라는 종류가 지금 판에도 있음**을 보인다
- **관리 도구**: 「Active Directory 도메인 및 트러스트」(Active Directory Domains and Trusts)는 도메인 트러스트, 도메인·포리스트 기능 수준, UPN 접미사를 관리하는 MMC이고, Netdom·Nltest 명령으로도 트러스트를 찾고·보이고·만들고·고친다 — 지금 판 Entra 문서 「Management tools」, 「netdom trust」 첫머리
- **트러스트와 사용 권한**: 트러스트는 인증을 받아들이게 할 뿐이고, 다른 도메인의 사용자가 자원에 접근하려면 **그 자원에 사용 권한이 주어져야 한다** — 위 「적절한 사용 권한이 있으면」 줄들(지난 판 「Understanding Trusts」·「Understanding Trust Transitivity」, 지금 판 Entra 문서 「Trust relationship flows」)
- (phase 80 step 3, 2026-11-16 Microsoft Learn에서 다시 받아 확인) 「How trust relationships work for forests in Active Directory」: 단방향 트러스트 가운데 전이적인 것도 비전이적인 것도 있고, 양방향도 마찬가지다 — 종류가 정한다(「One-way and two-way trusts」).
  양방향 트러스트는 실제로 반대 방향의 단방향 트러스트 둘이다(「TDO password changes」). 포리스트 트러스트 예: 포리스트 2와 포리스트 1·3 사이에 포리스트 트러스트가 있으면 포리스트 2의 사용자는 포리스트 1·3의 **어느 도메인 자원에나** 접근하고, 단방향 포리스트 트러스트에서는 신뢰받는 포리스트의 구성원이 신뢰하는 포리스트의 자원에 접근한다(「Forest trusts」).
  같은 문서의 그림 설명은 트리 1·트리 2의 모든 도메인이 기본으로 전이적 트러스트를 가져 서로의 자원에 접근한다고 적지만(「Trust relationship flows」), **새 트리의 루트 도메인이 어느 도메인과 트러스트를 맺는지는 적지 않는다** — 그래서 도식은 트리 사이의 트러스트 선을 그리지 않는다
- **한국어 이름**: 한국어판은 「트러스트」, 「단방향 트러스트」·「양방향 트러스트」, 「전이적 트러스트」·「비 전이적 트러스트」, 「포리스트 트러스트」, 「Active Directory 도메인 및 트러스트」로 옮긴다.
  trusting·trusted는 「신뢰하는 포리스트」·「신뢰받는 포리스트」(Entra 문서 「Forest trusts」의 예), 「신뢰받는 도메인이 신뢰하는 도메인의 리소스에 접근」(「Credentials processes」의 단방향 설명)처럼 바로 옮긴 곳과, 두 쪽을 모두 「신뢰할 수 있는 도메인」으로 옮긴 곳이 섞인다 —
  「Credentials processes」 한국어판은 resource domain (the trusting domain)을 「리소스 도메인(신뢰할 수 있는 도메인)」으로, 「netdom trust」 한국어판은 trusting domain의 이름 매개 변수를 「신뢰할 수 있는 도메인의 이름」으로 옮겼다. 절 제목 「Local domains and trusted domains」도 「로컬 도메인 및 신뢰할 수 있는 도메인」이다.
  **고른 이름**: **「신뢰하는 도메인」(trusting)·「신뢰받는 도메인」(trusted)** — 한국어판이 뜻을 바로 옮긴 곳의 말이고, 「신뢰할 수 있는」은 두 쪽에 다 쓰여 둘을 가르지 못한다. 전이성은 한국어판대로 「전이적 트러스트」·「비전이적 트러스트」(한국어판의 「비 전이적」을 붙여 쓴다), 도구는 「Active Directory 도메인 및 트러스트」

쓰인 곳: (phase 80 step 3에서 쓰일 곳) `windows-ad.trust`(트러스트의 정의, 신뢰하는 도메인 — 자원 쪽·신뢰받는 도메인 — 계정 쪽, 단방향·양방향과 접근의 방향, 전이적·비전이적, 같은 포리스트에서 저절로 생기는 양방향 전이적 트러스트, 포리스트 트러스트·외부 트러스트 한 줄씩, 「Active Directory 도메인 및 트러스트」, 사용 권한은 따로 준다),
`windows-ad.domain-tree-forest`(트리의 도메인은 트러스트로 이어진다), 기출 대조(`exam-notes.md` 「phase 80 step 0」 문단 — [기출 2024-05-19 #34]·[기출 2025-08-24 #34], [기출 2024-08-25 #30]·[기출 2026-08-02 #36])
(phase 80 step 3) `windows-ad.trust`(지난 판 「Understanding Trusts」·지금 판 「Credentials processes in Windows authentication」 — 한 도메인의 사용자가 다른 도메인에서 인증받게 하는 관계, 자원 쪽이 상대 도메인이 마친 인증을 받아들인다; 「netdom trust」·지난 판 「Understanding Trust Direction」 — 신뢰하는 도메인은 자원 쪽, 신뢰받는 도메인은 사용자가 로그온하는 쪽; 「Credentials processes」·Entra 문서 — 단방향은 신뢰받는 쪽 사용자가 신뢰하는 쪽 자원으로, 양방향은 서로, 양방향은 단방향 둘; 지난 판 「Understanding Trust Transitivity」·Entra 문서 — 전이적·비전이적, 방향과 전이성은 따로 정해진다, 새 도메인과 부모 사이의 양방향 전이적 트러스트가 저절로 생기고 위로 이어져 포리스트 어느 도메인의 계정이든 다른 도메인에서 인증받는다; 지난 판 「Understanding Trust Types」·Entra 문서 「Forest trusts」 — 포리스트 트러스트(포리스트 루트 도메인 사이, 전이적, 셋째 포리스트로 넓어지지 않음, 상대 포리스트의 어느 도메인 자원에나)와 외부 트러스트(포리스트 트러스트로 이어지지 않은 다른 포리스트의 도메인과, 비전이적 — 포리스트의 다른 도메인으로 흐르지 않음); 「Active Directory 도메인 및 트러스트」·Netdom; 사용 권한은 따로 준다), 도식 `domain-trust`(단방향 — 외부 트러스트로 보면 sales.example.com까지 이어지지 않음, 양방향, 전이 — 단방향 포리스트 트러스트로 sales.example.com까지),
문항 n262(단방향 트러스트에서 신뢰받는 쪽 사용자만 신뢰하는 쪽 자원에), n263(같은 포리스트의 형제 자식 도메인끼리는 부모를 거친 전이적 트러스트로 인증이 이어진다)

## (phase 80 step 4) Microsoft Learn — 조직 구성 단위와 사이트: Reviewing OU Design Concepts, Delegating Administration by Using OU Objects, Delegating Administration of Default Containers and OUs, Delegation of Control in Active Directory Domain Services, Reviewing the Domain Models, Active Directory Replication Concepts, Site functions, Designing the Site Topology; 문제 해결 — Redirect the users and computers containers in Active Directory domains
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/reviewing-ou-design-concepts
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/delegating-administration-by-using-ou-objects
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/delegating-administration-of-default-containers-and-ous
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/delegation-control-wizard
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/reviewing-the-domain-models
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/replication/active-directory-replication-concepts
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/site-functions
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/designing-the-site-topology
https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/redirect-users-computers-containers

2026-11-16에 IPv4로 내려받아 읽은 판: 「Reviewing OU Design Concepts」·「Delegating Administration by Using OU Objects」·「Delegating Administration of Default Containers and OUs」·「Reviewing the Domain Models」·「Active Directory Replication Concepts」·「Designing the Site Topology」 `updated_at` 2025-09-23(`ms.date` 2025-05-12),
「Site functions」 2025-09-12(2025-05-12), 「Delegation of Control in Active Directory Domain Services」 2026-07-01(2025-07-09) — 모두 「Applies to」 Windows Server 2016~2025. 문제 해결 「Redirect the users and computers containers…」 2026-08-04(2026-02-12), 적용 대상 — 지원되는 모든 Windows Server.
계획(plan) 문서 몇은 본문에 Windows Server 2008 시절 문장을 그대로 남겼다(「Site functions」 첫머리, 「Designing the Site Topology」의 하드웨어 요구) — 판 표시는 지금 판이지만, 판과 상관없는 정의만 가져온다. 한국어판(`ko-kr`)도 받았다(`updated_at` 2026-07-02~2026-10-14, 기계 번역).

- **OU를 만드는 목적**: OU 계층은 조직의 부서 계층을 그대로 따를 필요가 없고, 관리 위임·그룹 정책 적용·개체가 보이는 범위 제한 같은 **정해진 목적**으로 만든다. OU는 관리의 경계라서 데이터 관리자가 어디까지 다룰지를 정하게 한다.
  예로, 한 팀이 맡은 파일·인쇄 서버의 컴퓨터 계정을 한 OU에 모으고 그 팀의 관리자만 그 OU에 접근하게 한다. 일부 사용자·자원에만 그룹 정책을 걸려면 그것들을 한 OU에 넣고 그 OU에 그룹 정책을 적용한다.
  **OU 아래에 OU를 더 만들어(하위 트리) 위임을 더 나눌 수 있다.** 깊이에 기술적 한계는 없지만 관리하기 쉽게 10단계 이하를 권한다. OU 구조는 최종 사용자에게 보이려는 것이 아니라 관리자의 도구이고 바꾸기 쉽다 — 「Reviewing OU Design Concepts」
- 문제 해결 「Redirect the users and computers containers…」 「More information」: 보안 주체를 조직 구조·지역 배치·관리 모델을 비추는 OU 계층으로 정리하는 것을 모범 사례로 든다. 위 줄과 함께 읽으면, **OU를 부서·지역대로 짜는 것은 흔한 쓰임이지 OU의 정의가 아니다**
- **위임**: OU로 관리를 위임하려면 위임받을 사람을 그룹에 넣고, 다룰 개체를 OU에 넣고, 그 OU에 대한 관리 작업을 그 그룹에 맡긴다. 위임은 잘게 나눌 수 있다 — 한 그룹에는 OU 안 모든 개체의 모든 권한을, 다른 그룹에는 사용자 계정 만들기·지우기·관리만을, 또 다른 그룹에는 암호 재설정만을 줄 수 있고, 이 사용 권한을 하위 OU로 상속되게 할 수 있다 — 「Delegating Administration by Using OU Objects」
- 「Delegation of Control in Active Directory Domain Services」: 「Active Directory 사용자 및 컴퓨터」에서 도메인이나 OU를 고르고 Action 메뉴(한국어판은 「작업」 메뉴)의 Delegate control로 **제어 위임 마법사**를 열어, 맡길 사용자·그룹과 작업을 고른다. 고를 수 있는 흔한 작업은 사용자 계정 만들기·지우기·관리, 암호 재설정과 다음 로그온 때 암호 바꾸게 하기, 그룹 구성원 바꾸기, 컴퓨터를 도메인에 가입시키기, 그룹 정책 링크 관리 같은 것이다.
  위임은 고른 그릇 아래의 모든 개체에 미친다 — 「Delegate control」 등. 한 사람에게 맡길 범위는 도메인 전체·도메인의 모든 OU·OU 하나가 될 수 있다
- **OU와 그룹**: 위 위임 차례가 둘을 함께 쓴다 — **그룹**에는 권한을 받을 사람을, **OU**에는 다룰 개체를 넣는다. 그룹은 공유 자원의 사용 권한을 주는 단위이고(위 「로컬 계정과 기본 그룹」 항목의 「(phase 80 step 4)」 줄),
  그룹 정책은 사이트·도메인·OU 세 종류의 그릇에만 연결되며 사용자 개체에는 직접 연결할 수 없다(아래 「(phase 80 step 4) … 그룹 정책」 항목의 「Group Policy Management Console」·「Group Policy scope」). **OU와 그룹을 견준 한 문장은 찾지 못했다** — 이 근거들을 이어 쓴다
- **OU와 도메인**: 가장 단순한 도메인 설계는 도메인 하나이고, 포리스트의 도메인 수는 줄일수록 좋다. 지역 도메인을 더하는 까닭은 느린 링크로 이어진 곳의 복제 트래픽을 줄이는 것이고, 도메인이 늘면 서비스 관리자 그룹·그룹 정책·접근 제어 설정을 도메인마다 따로 맞춰야 한다.
  조직 안의 그룹처럼 자주 바뀌는 것을 기준으로 도메인을 나누면 구조를 다시 짜야 할 수 있다 — 「Reviewing the Domain Models」. 그래서 부서를 나누려고 도메인을 새로 만들 근거는 없고, 한 도메인 안의 관리 단위는 OU가 맡는다
- **기본 컨테이너**: AD DS를 설치하면 도메인 컨테이너, Builtin 컨테이너, Users 컨테이너(도메인에 새로 만든 사용자·그룹의 기본 자리), Computers 컨테이너(DC가 아닌 새 컴퓨터의 기본 자리), Domain Controllers OU가 만들어진다.
  **Users·Computers 컨테이너에는 그룹 정책 설정을 적용할 수 없으니**, 그룹 정책을 걸려면 새 OU를 만들고 사용자·컴퓨터 개체를 그리 옮긴다. 위임도 기본 컨테이너가 아니라 새 OU에서 한다. Domain Controllers OU에는 기본 정책이 걸려 있어 DC의 컴퓨터 개체를 거기서 빼지 말라고 한다 — 「Delegating Administration of Default Containers and OUs」
- 문제 해결 「Redirect the users and computers containers…」: 기본 설치에서 사용자·컴퓨터·그룹 계정은 OU가 아닌 `CN=` 꼴 컨테이너(`CN=Users`·`CN=Computers`)에 들어가고, **그룹 정책은 OU에는 걸리지만 이 CN 클래스 컨테이너에는 걸리지 않는다**. 두 컨테이너는 시스템이 보호하는 개체라 지울 수 없다.
  `NET USER`·`NET GROUP`·`NET COMPUTER`·도메인 가입 화면 같은 옛 API를 쓰는 작업이 만든 개체는 이 기본 컨테이너로 가고, 그 자리는 `redirusr`·`redircmp`로 OU로 바꿀 수 있다(이름만 — 차례는 가져오지 않는다) — 「Summary」, 「More information」. 같은 문서는 「Active Directory 사용자 및 컴퓨터」 스냅인을 `Dsa.msc`로 함께 적는다
- **사이트**: 사이트는 매우 안정적이고 빠른 네트워크로 이어진 TCP/IP 서브넷 하나 이상을 나타내는 AD 개체이고, 관리자는 사이트 정보로 AD 접근과 복제를 실제 네트워크에 맞춘다. 포리스트의 DC는 IP 주소에 따라 한 사이트에 속하고, 한 사이트에 여러 도메인의 DC가 있을 수 있으며 한 도메인이 여러 사이트에 걸칠 수 있다.
  **서브넷**은 논리적 IP 주소 묶음이 할당된 TCP/IP 네트워크의 한 토막이고, 컴퓨터가 네트워크에서 서로 가까운지를 나타낸다. AD의 서브넷 개체가 컴퓨터를 사이트에 맞춘다 — 「Active Directory Replication Concepts」 「Subnet」·「Site」
- 「Site functions」: 사이트 안의 복제는 빠르게(압축 없이 바뀌는 즉시), 사이트 사이의 복제는 압축해 정한 시각에 보내 WAN 비용을 줄인다. DC는 사이트 정보로 클라이언트에게 같은 사이트나 가장 가까운 사이트의 DC를 알려 주어 로그온이 WAN을 덜 거치게 한다 — 「Routing replication」, 「Client affinity」.
  「Designing the Site Topology」: 사이트 토폴로지는 **물리 네트워크를 논리로 나타낸 것**이고, 그 설계 전에 관리 계층·포리스트·도메인 같은 논리 구조를 먼저 설계한다 — 첫머리. (사이트 링크·브리지헤드 서버·복제 일정은 가져오지 않는다.)
  step 0 항목의 「Understanding the Active Directory Logical Model」은 포리스트·도메인·OU를 DC 수나 네트워크 토폴로지 같은 물리적 측면과 상관없는 논리 모델이라 부른다 — 곧 **OU는 관리를 위한 논리 구분, 사이트는 네트워크 위치에 따른 물리 쪽 구분**이다
- **한국어 이름**: 한국어판은 「조직 구성 단위」(OU), 「사이트」, 「서브넷」, 「관리 위임」, 「제어 위임 마법사」, 「기본 컨테이너」, 「Active Directory 사용자 및 컴퓨터」 스냅인(`Dsa.msc`)으로 옮긴다 — 고른 이름도 같다

쓰인 곳: (phase 80 step 5에서 쓰일 곳) `windows-ad.organizational-unit`(OU는 정해진 목적으로 만드는 관리 단위 — 그룹 정책 연결과 위임, OU 안의 OU, 부서·지역대로 짜는 것은 흔한 쓰임, 위임 차례와 제어 위임 마법사, OU와 그룹, OU와 도메인, 기본 컨테이너 Users·Computers에는 그룹 정책을 걸 수 없다, 사이트와 서브넷 한 줄씩 — 물리 쪽 구분),
`windows-ad.domain-user-accounts`(새 사용자의 기본 자리 Users 컨테이너, `Dsa.msc`), `windows-ad.ds-commands`(`NET USER`가 만든 도메인 사용자는 `CN=Users`로 — **E36**), 기출 대조(`exam-notes.md` 「phase 80 step 4」 문단 — [기출 2025-02-23 #42])
(phase 80 step 5) `windows-ad.organizational-unit`(「Understanding the Active Directory Logical Model」 — 도메인 안의 그릇 계층, 실제 배치와 상관없는 논리 구조; 「Reviewing OU Design Concepts」 — 관리 목적으로 만들고 부서 계층을 그대로 따를 필요가 없다, OU 안의 OU, 관리자의 도구라 사용자에게 보이려는 것이 아니고 바꾸기 쉽다, 일부에만 정책을 걸려면 한 OU에 모은다; 「Redirect the users and computers containers…」 — 부서·지역대로 짜는 것은 흔한 쓰임, 기본 컨테이너에는 그룹 정책이 걸리지 않는다; 「Delegating Administration by Using OU Objects」 — 다룰 개체를 OU에 넣고 맡을 사람(그룹)에 작업을 맡긴다, 잘게 나눈 위임; 「Delegation of Control…」 — 「Active Directory 사용자 및 컴퓨터」에서 OU를 고르고 제어 위임 마법사, 맡길 사용자·그룹, 고른 그릇 아래 모든 개체에 미친다; 「Reviewing the Domain Models」 — 도메인을 늘리면 관리자 그룹·그룹 정책·접근 설정을 도메인마다 맞춘다, 도메인은 적게, 자주 바뀌는 것으로 나누면 다시 짠다; 「Active Directory Replication Concepts」·「Site functions」 — 사이트·서브넷, IP 주소로 사이트에 맞춰진다, 사이트 안·사이트 사이 복제, 가까운 DC 안내; 「Delegating Administration of Default Containers and OUs」 — Users·Computers 기본 컨테이너의 자리와 그룹 정책·위임은 새 OU에서; 그룹 정책·GPO의 뜻과 연결·상속·도메인 단위 저장은 아래 「그룹 정책」 항목), 도식 `organizational-unit`, 문항 n264(정책과 위임을 함께 걸 단위는 OU — 오답의 사이트·그룹·기본 컨테이너는 같은 근거);
(phase 80 step 6) `windows-ad.ds-commands`(「Redirect the users and computers containers…」 — `net user`로 만든 도메인 계정은 기본 Users 컨테이너에 들어간다)

## (phase 80 step 4) Microsoft Learn — 도메인 사용자 계정과 ds 명령: Manage user accounts in Active Directory Users and Computers, Active Directory accounts, ActiveDirectory module·New-ADUser; 문제 해결 — Use the Directory Service command-line tools to manage Active Directory objects in Windows Server 2003; Win32 — Object Names and Identities, Common-Name·Organizational-Unit-Name·Domain-Component attribute; 지난 판 명령 참조 — Command-Line Reference, Dsadd, Dsadd user, Dsmod, Dsmod user, Dsrm, Dsquery, Dsget, Dsmove
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage-user-accounts-in-windows-server
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-default-user-accounts
https://learn.microsoft.com/en-us/powershell/module/activedirectory/?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/powershell/module/activedirectory/new-aduser?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/directory-service-manage-objects
https://learn.microsoft.com/en-us/windows/win32/ad/object-names-and-identities
https://learn.microsoft.com/en-us/windows/win32/adschema/a-cn
https://learn.microsoft.com/en-us/windows/win32/adschema/a-ou
https://learn.microsoft.com/en-us/windows/win32/adschema/a-dc
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc754340(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc753708(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc731279(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc732406(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc732954(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc731865(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc732952(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc755162(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc731094(v=ws.11)

2026-11-16에 IPv4로 내려받아 읽은 판: 「Manage user accounts in Active Directory Users and Computers」 `updated_at` 2025-07-22(`ms.date` 2025-06-30), 「Active Directory accounts」 2026-02-16(2025-06-30) — 둘 다 「Applies to」 Windows Server 2016~2025.
「ActiveDirectory Module」·「New-ADUser」 2025-05-14(2016-12-27, `windowsserver2025-ps` 판). 문제 해결 「Use the Directory Service command-line tools…」 2026-08-04(2026-02-12), 적용 대상 — 지원되는 모든 Windows Server(제목과 본문 예는 Windows Server 2003 시절 그대로다).
Win32 「Object Names and Identities」 2025-04-15(2018-05-31), 스키마 특성 셋 2020-12-14(2018-05-31) — 적용 판을 적지 않는 개발자 문서다.
**지난 판 명령 참조** 아홉은 모두 `updated_at` 2021-11-12(`ms.date` 2016-08-31, `ms.topic` archived)이고, 쪽마다 「Applies To」가 Windows Server 2003~2012·Windows 8이다(Dsadd user·Dsmod user는 Windows Server 2008·2012·Windows 8, Dsquery는 2008 R2도 적고, Command-Line Reference 자체는 Windows Server 2000~2012와 Windows XP~8까지 적는다).
**지금 판 Windows 명령 참조에는 이 명령들의 쪽이 없다**(머리 문단). 한국어판(`ko-kr`)도 받았다 — 지금 판 문서는 `updated_at` 2026-01-09~2026-10-14(기계 번역), 지난 판 명령 참조와 PowerShell 쪽은 번역되지 않아 영문 그대로다.

- **도메인 사용자 계정을 만드는 도구**: 「Active Directory 사용자 및 컴퓨터」 콘솔에서 사용자 계정 같은 보안 주체를 만들고 지우고 관리한다. 이 콘솔은 원격 서버 관리 도구(RSAT)의 AD DS·AD LDS 구성 요소가 설치된 Windows Server나 Windows 클라이언트에서 쓰고, 그 컴퓨터는 도메인에 가입해 있어야 하며 그 도메인의 계정을 관리할 권한이 있는 계정으로 써야 한다 — 첫머리, 「Prerequisites」.
  step 0 항목의 「Install Active Directory Domain Services」: `Install-WindowsFeature -name AD-Domain-Services -IncludeManagementTools`가 AD DS 역할과 함께 이 도구 같은 관리 도구를 설치한다. 실행 이름 `Dsa.msc`는 위 「조직 구성 단위와 사이트」 항목의 문제 해결 문서가 적는다
- 같은 문서 「Create a user account」: 사용자 계정을 더하면 그 사용자가 **도메인에 가입한 컴퓨터에 로그인할 수 있고**, 공유 폴더·프린터·응용 프로그램 같은 네트워크 자원의 사용 권한은 **그 사용자에게 따로 줄 수 있는 것**이다(계정을 만든다고 저절로 생기지 않는다). 만드는 차례:
  콘솔에서 도메인 트리를 펼쳐 계정을 둘 **컨테이너나 OU를 고른다** → Action 메뉴(한국어판은 「작업」 메뉴)에서 「새로 만들기」 → 「사용자」 → 「새 개체 - 사용자」 첫 쪽에 이름·이니셜·성(고르기), 전체 이름(꼭), 사용자 로그온 이름(꼭) → 둘째 쪽에 암호와 그 확인, 그리고 확인란 넷 → 요약을 보고 「마침」
- 같은 절의 확인란 넷: **다음 로그온 때 암호를 바꾸게 하기**(User must change password at next logon), **사용자가 암호를 바꾸지 못하게 하기**(User cannot change password), **암호가 만료되지 않게 하기**(Password never expires — 그 계정을 암호 정책에서 빼는 것), **계정을 사용하지 않는 상태로 만들기**(Account is disabled).
  「Active Directory accounts」 「Settings for default local accounts in Active Directory」 표도 같은 설정을 든다 — 다음 로그온 때 바꾸게 하는 것은 그 사용자만 암호를 알게 하려는 것, 바꾸지 못하게 하는 것은 Guest나 임시 계정을 관리자가 쥐고 있으려는 것, 만료되지 않게 하는 것은 서비스 계정에 강한 암호와 함께 쓰는 것, 사용 안 함은 그 계정으로 로그인하지 못하게 하는 것이다(그 밖의 행 — 되돌릴 수 있는 암호화·스마트 카드·위임·DES·Kerberos 사전 인증 — 은 가져오지 않는다)
- 같은 문서 「Manage group memberships」: 공유 폴더 같은 자원의 사용 권한은 사람 계정 하나하나보다 **보안 그룹**에 주는 경우가 가장 많아서, 계정이 어느 그룹에 드는지를 관리하는 것이 곧 그 계정이 닿는 자원을 관리하는 것이다. 차례: 계정을 고르고 Action(「작업」) 메뉴 → 「속성」 → Member Of 탭 → 「추가」 → 「그룹 선택」에 그룹 이름 → 「확인」.
  같은 문서는 암호 재설정(새 암호, 다음 로그온 때 바꾸게 하기, **암호를 너무 많이 틀려 잠긴 계정 풀기** 확인란), 계정 사용 안 함·사용(사용 안 함으로 해도 이미 로그인한 사용자는 그대로지만 새로 로그인하지 못한다), 지우기(지우기 전에 먼저 사용 안 함을 권한다)도 같은 콘솔에서 한다고 적는다
- 「Active Directory accounts」 「Default local accounts in Active Directory」: 계정은 사용자 이름과 암호 같은 자격 증명으로 그 사람을 확인(인증)하고, 확인한 뒤에는 **그 자원에 명시적으로 준 권한에 따라** 자원 접근을 허락하거나 거부한다. 한 계정을 여러 사람이 함께 쓰지 않게 한다 — 이 문서는 DC의 기본 계정(Administrator·Guest·KRBTGT)을 다루지만, 인증과 권한 부여를 가르는 이 줄은 도메인 계정 일반에 쓴다.
  새 도메인 계정은 기본으로 Domain Users 그룹에 든다(step 0 항목 「로컬 계정과 기본 그룹」의 「(phase 80 step 4)」 줄). 그 계정의 암호는 도메인의 계정 정책을 따른다(아래 「(phase 80 step 4) … 계정 정책」 항목)
- **로컬 계정과 도메인 계정**: step 0 항목의 「Security principals」 — 로컬 사용자 계정은 그 컴퓨터의 SAM에 저장되어 그 컴퓨터 자원에만 쓰이고, 도메인에서 만든 계정은 AD 데이터베이스에 저장되어 도메인 자원의 접근을 다루는 데 쓰인다. 「Understanding the Active Directory Logical Model」 — 도메인 계정은 한 번 만들어 그 포리스트에 가입한 어느 컴퓨터에서나 쓴다
- **PowerShell**: ActiveDirectory 모듈의 `New-ADUser`는 AD 사용자를 만든다. `-SamAccountName`이 꼭 필요하고, `-Path`로 사용자를 둘 컨테이너나 OU를 정하며 주지 않으면 도메인의 사용자 기본 컨테이너에 만든다 — 「New-ADUser」 「Description」. 이름과 이 한 줄만 쓰고 cmdlet 목록은 가져오지 않는다.
  **ds 명령 대신 이 모듈을 권한다는 문장은 이 step이 읽은 문서에 없다** — 「지금 권하는 도구」로 쓰지 않고, 「같은 일을 하는 PowerShell 명령도 있다」로만 쓴다
- **ds 명령이 있는 곳과 쓰는 조건**: 지난 판 「Command-Line Reference」의 D 항목에 Dsadd·Dsget·Dsmod·Dsmove·Dsquery·Dsrm이 있다. 쪽마다 같은 말을 적는다 — Windows Server 2008에 들어 있는 명령 줄 도구이고, **AD DS 서버 역할을 설치했을 때** 쓸 수 있으며(Dsrm·Dsmove는 AD LDS 역할로도), 관리자 권한으로 연 명령 프롬프트에서 실행한다 — 각 쪽 첫머리
- 명령마다 하는 일과 다루는 개체 — 각 쪽 첫머리와 「Commands」 표:
  - `dsadd`: 디렉터리에 정한 종류의 개체를 **더한다** — computer·contact·group·ou·user(`dsadd user`는 사용자 하나)·quota
  - `dsmod`: 디렉터리에 이미 있는 개체의 특성을 **고친다** — computer·contact·group·ou·server(DC의 속성)·user·quota·partition
  - `dsrm`: 개체를 디렉터리에서 **지운다** — 종류를 가리지 않고 DN으로 가리키고, `-subtree`를 주면 그 아래 개체까지 지운다
  - `dsquery`: 정한 조건으로 디렉터리를 **찾는다** — computer·contact·group·ou·site·server·user·quota·partition, `dsquery *`는 어느 종류든
  - `dsget`: 개체 하나의 정한 속성을 **보인다** — computer·contact·group(구성원 포함)·ou·server·user·subnet·quota·partition
  - `dsmove`: 개체 하나를 **도메인 안에서** 다른 자리로 옮기거나(`-newparent <새 부모 DN>`), 옮기지 않고 이름만 바꾼다(`-newname <새 RDN>`)
- 지금 판 문제 해결 「Use the Directory Service command-line tools…」: 실행 창에 `cmd`를 입력해 연 명령 프롬프트에서 `dsadd user`로 사용자를 만들고(`-samid`, `-pwd`), `dsmod user`로 암호를 재설정하거나(`-pwd`) 다음 로그온 때 바꾸게 하거나(`-mustchpwd`) 계정을 사용 안 함·사용으로 바꾸고(`-disabled`), `dsrm`으로 사용자·그룹·OU를 지운다(OU를 지우면 그 안의 개체도 모두 지워진다).
  `dsquery`로 사용자·그룹·컴퓨터·OU·DC를 찾고, `dsget user … -memberof`로 그 사용자가 든 그룹을 본다. `dsmod group … -secgrp {yes|no}`는 보안/배포 그룹을, `-scope {l|g|u}`는 도메인 로컬·글로벌·유니버설 범위를 바꾼다(도메인 로컬과 글로벌은 서로 바꿀 수 없다). 그룹은 OU에 두기를 권한다 — 「How to manage users」·「How to manage groups」·「How to manage organizational units」·「How to search Active Directory」
- **고유 이름**(DN): Win32 「Object Names and Identities」 — 개체의 **상대 고유 이름**(RDN)은 그 개체 자신의 이름(대개 `cn` 특성)이고 같은 그릇 안에서만 겹치지 않으면 된다. **고유 이름**은 그 개체의 RDN 뒤에 뿌리까지 올라가는 조상마다의 RDN을 차례로 이어 붙인 문자열이라 개체의 자리를 품고, 포리스트 안에서 하나뿐이며, 개체를 옮기거나 이름을 바꾸면 바뀐다(예의 꼴: `CN=Users,DC=…,DC=com`) — 「Relative Distinguished Name」, 「Distinguished Name」.
  Win32 스키마: `cn`(Common-Name)은 개체를 나타내는 이름, `ou`(Organizational-Unit-Name)는 OU의 이름, `dc`(Domain-Component)는 도메인 개체의 이름 특성이고 `dc=도메인이름` 꼴로 보인다 — 각 쪽 첫 줄
- 같은 사실의 지금 판 풀이: 아래 「(phase 80 step 4) … 그룹 정책」 항목의 「Group Policy scope」 「What is a scope?」가 DN 한 줄을 조각마다 읽는다 — `CN=`은 개체의 이름(사용자면 대개 사람 이름), `OU=`는 그 개체가 든 OU(대개 부서), `DC=` 조각들은 이어서 도메인 이름을 이룬다(`DC=corp,DC=contoso,DC=com` → `corp.contoso.com`, 맨 끝 `DC=com`이 최상위).
  같은 문서 「Linking」은 OU가 여럿인 DN을 **왼쪽부터 한 조각씩 떼어 가며** 위 그릇을 거슬러 오르는 차례를 보인다 — 왼쪽일수록 안쪽 그릇이다
- **`dsadd user`의 꼴**(지난 판 「Dsadd user」 「Syntax」·「Parameters」·「Remarks」·「Examples」 — 예의 이름·암호는 옮기지 않는다): `dsadd user <UserDN> [-samid <SAM 이름>] [-pwd {<암호> | *}] [-memberof <그룹 DN> ...] [-mustchpwd {yes | no}] [-disabled {yes | no}] …`
  - `<UserDN>`은 꼭 필요한 만들 사용자의 DN이다. `-samid`를 주지 않으면 DN의 CN 값 앞 20자로 SAM 계정 이름을 만든다. `-pwd *`이면 암호를 따로 묻는다. `-memberof`는 넣을 그룹의 DN이다. `-mustchpwd`는 다음 로그온 때 암호를 바꾸게 할지(기본 no)다
  - `-disabled`는 계정을 로그온에 쓰지 못하게 둘지이고, **기본값이 yes**라서 `-disabled no`를 주지 않으면 사용 안 함 상태로 만들어진다 — 「Parameters」의 `-disabled` 행(쪽의 예들이 모두 `-disabled no`를 함께 준다)
  - 값에 공백이 있으면 따옴표로 감싼다. 쪽의 예는 OU 안에 사용자를 만들며 `-disabled no`·`-pwd`·`-mustchpwd yes`·`-memberof <그룹 DN>`을 함께 준다
  - 예시 값으로 바꾼 꼴(guide.md 「예시 값」): `dsadd user "CN=user01,OU=영업팀,DC=example,DC=com" -samid user01 -pwd * -memberof "CN=Sales-Users,OU=영업팀,DC=example,DC=com" -disabled no` — 그룹 `Sales-Users`가 OU `영업팀`에 있다고 둔 예이고, 그룹이 다른 자리에 있으면 그 DN을 쓴다
- (phase 80 step 6, 2026-11-16 IPv4로 다시 받아 확인) 지난 판 「Dsadd user」 「Parameters」: `-samid`는 SAM 계정 이름을 정하고, 주지 않으면 dsadd가 `<UserDN>`의 CN 값 앞 20자로 SAM 계정 이름을 만든다. 본문 예는 SAM 계정 이름을 따로 풀지 않으려고 `-samid`를 빼고 쓴다(CN 값이 `user01`이다).
  `-pwd *`이면 dsadd가 암호를 묻는다 — 입력한 암호가 화면에 보이는지는 이 쪽에 적혀 있지 않아 쓰지 않는다
- **`net user`와 ds 명령**: `net user`는 기본으로 그 컴퓨터의 로컬 계정을 다루고 `/domain`을 붙이면 기본 도메인의 DC에서 도메인 계정을 다룬다(step 0 항목 「로컬 계정과 기본 그룹」의 「net user」 줄과 「(phase 80 step 4)」 줄). `net user`가 만든 도메인 사용자는 기본 `CN=Users` 컨테이너로 가지만(위 「조직 구성 단위와 사이트」 항목),
  ds 명령은 개체를 DN으로 가리켜 자리(OU)를 고르고, 사용자 말고도 그룹·OU·컴퓨터 같은 개체를 다룬다. **시험은 `net user`를 도메인 계정 명령으로 보지 않는다 — E36**
- **한국어 이름**: 한국어판은 「Active Directory 사용자 및 컴퓨터」, 「새 개체 - 사용자」, 「사용자 로그온 이름」, 「보안 그룹」, 「고유 이름」(distinguished name), 「원격 서버 관리 도구」로 옮긴다. 확인란 넷은 「사용자는 다음 로그온 시 암호를 변경해야 합니다」처럼 문장으로 옮기고, Member Of 탭은 「멤버」 탭과 「구성원」 탭으로 갈려 옮긴다 — **실제 한국어 화면의 확인란·탭 이름은 확인하지 못했다**.
  **고른 이름**: 도구는 「Active Directory 사용자 및 컴퓨터」(실행 이름 `dsa.msc`), DN은 「고유 이름」(RDN은 「상대 고유 이름」). 확인란은 하는 일을 한국어로 쓰고 영문 이름을 함께 적되 「화면에 이렇게 보인다」로 단정하지 않는다. 탭은 영문 이름 Member Of와 하는 일(그 계정이 든 그룹 목록)로 쓴다. ds 명령은 한국어 이름이 따로 없다 — 하는 일을 한국어로 세운다(guide.md 「글」의 항목 이름 규칙 (2))

쓰인 곳: (phase 80 step 5에서 쓰일 곳) `windows-ad.domain-user-accounts`(「Active Directory 사용자 및 컴퓨터」와 RSAT, `dsa.msc`, 만드는 차례 — 컨테이너나 OU 고르기·새 개체 - 사용자·확인란 넷, 보안 그룹의 구성원으로 넣는 차례, 계정을 만든 것만으로 자원에 닿지 않는다 — 인증 뒤 사용 권한, Domain Users, 로컬 계정과 도메인 계정, 잠긴 계정 풀기),
(phase 80 step 6에서 쓰일 곳) `windows-ad.ds-commands`(ds 명령 여섯의 하는 일과 개체, 쓰는 조건 — AD DS 역할·관리자 권한 명령 프롬프트, 고유 이름과 RDN, CN·OU·DC 조각, `dsadd user`의 꼴과 `-disabled` 기본값, `net user`와의 차이 — **E36**, `New-ADUser` 한 줄),
`windows-ad.group-scopes`(`dsmod group`의 `-secgrp`·`-scope`, 도메인 로컬과 글로벌은 서로 바꿀 수 없다), 기출 대조(`exam-notes.md` 「phase 80 step 4」 문단 — [기출 2026-08-02 #43], [기출 2025-08-24 #38])
(phase 80 step 5) `windows-ad.domain-user-accounts`(「Manage user accounts in Active Directory Users and Computers」 — 도구와 RSAT·도메인 가입·관리 권한, 만드는 차례(OU 고르기 → 「작업」 → 「새로 만들기」 → 「사용자」 → 「새 개체 - 사용자」 → 암호와 확인란 넷 → 「마침」), 계정을 만들면 로그온할 수 있고 사용 권한은 따로 준다, 보안 그룹에 넣는 차례(「속성」 → Member Of → 「추가」 → 「그룹 선택」 → 「확인」), 암호 재설정·잠긴 계정 풀기·사용 안 함·지우기 전에 사용 안 함; 「Active Directory accounts」 — 확인란 넷의 쓰임, 인증 뒤 자원에 준 권한에 따라 접근; 「Redirect…」 — `Dsa.msc`; 「Security principals」·「Understanding the Active Directory Logical Model」 — 로컬 계정과 도메인 계정; Domain Users는 위 「로컬 계정과 기본 그룹」 항목, 암호 정책은 아래 「계정 정책」 항목), 도식 `domain-user-account`, 문항 n265(계정을 만든 것만으로 모든 공유 폴더가 열리지 않는다 — Domain Users와 사용 권한);
(phase 80 step 6) `windows-ad.ds-commands`(지난 판 명령 참조 「Dsadd」·「Dsmod」·「Dsrm」·「Dsquery」·「Dsget」·「Dsmove」와 문제 해결 「Use the Directory Service command-line tools…」 — 여섯의 하는 일과 다루는 개체, AD DS 역할을 설치한 서버·관리자 권한 명령 프롬프트, `-subtree`와 OU를 지우면 안의 개체도 지워진다, `dsmod user`의 암호 재설정·다음 로그온 때 바꾸게 하기·사용 안 함, `dsget user … -memberof`와 그룹 구성원, `dsmove`의 옮기기·이름 바꾸기, 디렉터리 서비스 명령 줄 도구라는 이름, 지금 판 명령 참조에는 없고 문제 해결 문서가 다룬다; Win32 「Object Names and Identities」·스키마 특성 셋과 「Group Policy scope」 — 고유 이름의 짜임, 포리스트에서 하나뿐, 옮기거나 이름을 바꾸면 바뀐다, CN·OU·DC 조각과 왼쪽일수록 안쪽 그릇; 「Dsadd user」 — 예 한 줄(`-samid`는 뺐다), `-pwd *`, `-memberof`, `-disabled` 기본값 yes, 따옴표; 「New-ADUser」 — 같은 일을 하는 PowerShell 명령), 도식 `ds-commands`, 문항 n266(고유 이름의 OU 조각이 바뀌는 것은 개체를 옮기는 것이라 `dsmove` — 오답 `dsmod`·`dsquery`·`dsget`은 같은 근거);
`windows-ad.group-scopes`(문제 해결 「Use the Directory Service command-line tools…」 — `dsmod group`의 `-secgrp`·`-scope`, 도메인 로컬과 글로벌은 서로 곧바로 바꾸지 못한다)

## (phase 80 step 4) Microsoft Learn — 그룹 정책: Group Policy overview for Windows Server, Group Policy processing, Group Policy scope, Group Policy Management Console, gpupdate, Folder Redirection and Roaming User Profiles in Windows and Windows Server, Deploy Folder Redirection with Offline Files, Deploy roaming user profiles; 문제 해결 — Use Group Policy to remotely install software, How to use Group Policy to add the MaxTokenSize registry entry to multiple computers
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-overview
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-processing
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-scope
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-management-console
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/gpupdate
https://learn.microsoft.com/en-us/windows-server/storage/folder-redirection/folder-redirection-rup-overview
https://learn.microsoft.com/en-us/windows-server/storage/folder-redirection/deploy-folder-redirection
https://learn.microsoft.com/en-us/windows-server/storage/folder-redirection/deploy-roaming-user-profiles
https://learn.microsoft.com/en-us/troubleshoot/windows-server/group-policy/use-group-policy-to-install-software
https://learn.microsoft.com/en-us/troubleshoot/windows-server/group-policy/group-policy-add-maxtokensize-registry-entry

2026-11-16에 IPv4로 내려받아 읽은 판: 「Group Policy overview for Windows Server」 `updated_at` 2026-04-16(`ms.date` 2025-06-10), 「Group Policy processing」 2025-06-16(2025-06-16), 「Group Policy scope」 2025-09-15(2025-06-13), 「Group Policy Management Console」 2026-02-16(2025-05-14) — 넷 다 「Applies to」 Windows Server 2016~2025.
「gpupdate」 2025-10-22(2017-10-16, Windows Server 2016~2025·Windows 11·10). 「Folder Redirection and Roaming User Profiles…」 2025-05-15(2025-05-15), 「Deploy Folder Redirection with Offline Files」 2025-04-28(2023-03-20), 「Deploy roaming user profiles」 2026-02-16(2025-05-21) — 셋 다 Windows Server 2016~2025·Windows 11·10.
문제 해결 둘은 2026-02-18(2026-02-12), 적용 대상 — 지원되는 모든 Windows Server. 「Use Group Policy to remotely install software」의 차례는 Windows Server 2003·Windows XP 시절 화면(「Active Directory 사용자 및 컴퓨터」에서 도메인 속성의 「그룹 정책」 탭)으로 적혀 있어, **차례가 아니라 할당·게시라는 사실만** 가져온다.
한국어판(`ko-kr`)도 받았다(`updated_at` 2026-01-21~2026-10-14, 기계 번역).

- **그룹 정책**: 운영 체제·응용 프로그램·사용자 설정을 한곳에서 정해 관리하는 Windows의 기능이고, Windows Server와 Windows 클라이언트 컴퓨터의 사용자·컴퓨터 설정을 다룬다 — 「Group Policy overview」 첫머리, 「What is a Group Policy」
- 같은 절: 그룹 정책 설정은 파일 시스템에 로컬로 둘 수도 AD DS에 둘 수도 있다. AD와 함께 쓰면 설정을 **그룹 정책 개체**(GPO)에 담는다 — GPO는 정책 설정·보안 사용 권한·적용 범위를 묶은 것이고, AD 도메인 파티션의 그룹 정책 컨테이너와 각 DC의 SYSVOL 폴더에 있는 그룹 정책 템플릿 두 부분으로 되어 DC끼리 복제된다
- 같은 절: 설정은 **컴퓨터 구성**(시스템 전체에 걸린다 — 전원 관리·방화벽 규칙 같은 것)과 **사용자 구성**(그 사용자에게만 — 폴더 리디렉션 같은 것) 두 갈래다. GPO를 사이트·도메인·OU에 **연결**하면 그곳이 적용 범위가 된다.
  컴퓨터 설정은 컴퓨터가 시작할 때, 사용자 설정은 사용자가 로그인할 때 적용되고, 컴퓨터가 시작할 때 그룹 정책 서비스는 그 컴퓨터가 속한 사이트·도메인·OU(바로 위 OU와 그보다 위 OU들)에 연결된 GPO를 찾는다
- 같은 절: 한 컴퓨터의 로컬 설정은 **로컬 그룹 정책 편집기**(`gpedit.msc`)로, 도메인 전체의 설정은 AD 관련 MMC 스냅인 안의 그룹 정책 개체 편집기로 만들고 관리한다
- 같은 문서 「What is an OU」: OU는 그룹 정책 설정을 붙일 수 있는 가장 아래 단계의 AD 그릇이라 대부분의 GPO를 OU에 둔다. 도메인 단계에는 특히 **암호 정책**을 둔다. 사이트 단계에 두는 설정은 적다. 위쪽 OU에 연결한 GPO는 기본으로 아래 OU로 상속된다
- 「Group Policy processing」 첫머리: GPO는 **로컬 GPO → 사이트에 연결된 GPO → 도메인에 연결된 GPO → OU에 연결된 GPO**(중첩된 OU면 부모 OU 다음 자식 OU) 차례로 처리되고, 나중에 적용된 정책이 앞서 적용된 같은 설정을 덮어쓸 수 있다.
  그래서 사용자·컴퓨터에 가장 가까운 그릇의 GPO가 더 위쪽 그릇의 GPO를 이기고, AD 그릇에 연결된 GPO는 로컬 정책을 이긴다. 강제(Enforced)·상속 차단은 이 기본 동작을 바꾸는 옵션이다(이름만 — 가져오지 않는다). 한 그릇에 GPO를 여럿 연결하면 연결 순서 번호가 가장 낮은 것이 우선한다
- 같은 문서 「How Group Policy processing works」: 처음 적용(시작·로그온) 뒤에는 배경에서 기본 90분마다(무작위로 최대 30분을 더해) 다시 적용한다. 모든 확장이 배경에서 처리되지는 않는다 — **폴더 리디렉션은 사용자가 로그온할 때만, 소프트웨어 설치 정책은 컴퓨터가 시작할 때와 사용자가 로그온할 때만** 처리된다. 스크립트 확장은 배경에서도 처리되지만 스크립트 자체는 컴퓨터 시작·종료와 사용자 로그온·로그오프 때만 실행된다
- 「Group Policy scope」 「Linking」: GPO를 연결할 수 있는 것은 로컬(모든 Windows 컴퓨터에 하나씩 있고 가장 먼저 적용되며 도메인 기반 GPO가 덮을 수 있다), 사이트, 도메인, OU이고, **GPO를 사용자 개체에 직접 연결할 수는 없다**.
  「What is a scope?」: 사용자·컴퓨터의 DN을 보면 그 범위를 알 수 있다 — DN의 풀이는 위 「도메인 사용자 계정과 ds 명령」 항목의 「고유 이름」 줄
- 「Group Policy Management Console」: **그룹 정책 관리 콘솔**(GPMC)은 GPO를 한곳에서 관리하는 MMC 기반 도구이고 Windows Server와 RSAT에 들어 있다. 시작 메뉴에서 Group Policy Management를 찾아 열고, GPO를 만들고, 「편집」을 고르면 **그룹 정책 관리 편집기**가 열린다.
  GPO를 쓰는 주된 방법은 사이트·도메인·OU 세 종류의 AD 그릇에 연결하는 것이고(GPO 하나를 여러 그릇에 연결할 수 있다), GPO 자체는 연결한 OU 안이 아니라 도메인 단위로 저장된다. 연결하려면 그 사이트·도메인·OU의 수정 사용 권한이 있어야 하고, 기본으로 Domain Admins·Enterprise Admins만 갖는다 — 「Prerequisites」·「Create an unlinked GPO」·「Edit an existing GPO」·「Link a GPO」.
  문제 해결 「How to use Group Policy to add the MaxTokenSize registry entry…」: 실행 창에 `gpmc.msc`를 입력해 GPMC를 연다(Windows Server 2008·2008 R2 절)
- **소프트웨어 설치**: 문제 해결 「Use Group Policy to remotely install software」 — 그룹 정책으로 프로그램을 클라이언트 컴퓨터나 사용자에게 자동으로 배포할 수 있다. **할당**(assign): 사용자에게 할당하면 그 사용자가 로그온할 때, 컴퓨터에 할당하면 컴퓨터가 시작할 때 설치된다(컴퓨터에 할당한 것은 그 컴퓨터에 로그온하는 모든 사용자가 쓴다).
  **게시**(publish): 사용자에게 게시하면 그 사용자가 로그온했을 때 「프로그램 추가/제거」에 나타나 거기서 골라 설치한다. 먼저 Windows Installer 패키지(.msi)를 둔 공유 폴더(배포 지점)를 만들고, GPO의 컴퓨터 구성이나 사용자 구성의 소프트웨어 설정 아래 「소프트웨어 설치」에 그 패키지를 UNC 경로로 더한다 — 「Summary」·「Create a distribution point」·「Assign a package」·「Publish a package」
- **폴더 리디렉션과 로밍 사용자 프로필**: 「Folder Redirection and Roaming User Profiles…」 첫머리 — **폴더 리디렉션**은 「문서」 같은 알려진 폴더의 경로를 손으로 또는 **그룹 정책으로** 다른 곳(대개 파일 공유)으로 바꿔, 사용자가 네트워크의 어느 컴퓨터에서나 그 폴더의 파일을 쓰게 한다.
  **로밍 사용자 프로필**은 사용자 프로필을 파일 공유에 두어 여러 컴퓨터에서 같은 운영 체제·응용 프로그램 설정을 받게 한다 — 로그인할 때 서버의 프로필을 내려받아 로컬 프로필과 합치고, 로그아웃할 때 그동안 바뀐 것을 서버 쪽에 합친다. 보통 도메인 계정에 켠다
- 「Deploy Folder Redirection with Offline Files」 「Step 5」: GPO의 사용자 구성 > 정책 > Windows 설정 > 폴더 리디렉션에서 리디렉션할 폴더(예: 문서)를 고른다. 「Deploy roaming user profiles」 「Step 5」·「Step 6」: 로밍 프로필 경로는 AD의 사용자 계정 속성(프로필 경로)에 넣거나,
  GPO의 컴퓨터 구성 > 정책 > 관리 템플릿 > 시스템 > 사용자 프로필의 설정으로 컴퓨터에 건다 — 둘을 다 하면 컴퓨터 쪽 정책이 우선한다. 곧 **「어느 PC에서 로그온해도 같은 파일과 환경」은 그룹 정책 자체가 아니라 그룹 정책으로 설정하는 이 두 기능의 일**이다
- **로그온 스크립트**: 「Site functions」(위 「조직 구성 단위와 사이트」 항목) — 각 DC의 SYSVOL에는 GPO와 함께 시작·종료 스크립트와 로그온·로그오프 스크립트가 들어 도메인 전체로 복제된다. 위 「How Group Policy processing works」 — 스크립트는 컴퓨터 시작·종료, 사용자 로그온·로그오프 때만 실행된다
- **`gpupdate`**: 그룹 정책 설정을 새로 적용하는 명령이다. 기본으로 사용자·컴퓨터 설정 둘 다, **바뀐 설정만** 적용하고, `/force`는 바뀌지 않은 것까지 모두 다시 적용한다. `/target:{computer|user}`로 한쪽만 고른다.
  `/logoff`·`/boot`는 배경 새로 고침에서 처리되지 않는 확장 — 사용자 대상 소프트웨어 설치·폴더 리디렉션(로그온 때), 컴퓨터 대상 소프트웨어 설치(시작 때) — 을 위해 적용 뒤 로그오프하거나 다시 시작한다(그런 확장이 없으면 아무 일도 하지 않는다) — 「Syntax」·「Parameters」·「Examples」
- **보안 설정**: 암호 정책·계정 잠금 정책은 아래 「(phase 80 step 4) … 계정 정책」 항목
- **한국어 이름**: 한국어판은 「그룹 정책」, 「그룹 정책 개체」(GPO), 「그룹 정책 관리 콘솔」(GPMC), 「그룹 정책 관리 편집기」, 「로컬 그룹 정책 편집기」, 「컴퓨터 구성」·「사용자 구성」, 「소프트웨어 설치」와 소프트웨어 「할당」·「게시」, 「폴더 리디렉션」, 「로밍 사용자 프로필」, GPO 「연결」로 옮긴다 — 고른 이름도 같다

쓰인 곳: (phase 80 step 7에서 쓰일 곳) `windows-ad.group-policy`(그룹 정책과 GPO, 컴퓨터 구성·사용자 구성, 사이트·도메인·OU에 연결 — 사용자 개체·그룹에는 연결하지 않는다, 적용 차례 로컬 → 사이트 → 도메인 → OU와 덮어쓰기, 시작·로그온 때 적용과 90분 배경 새로 고침, 소프트웨어 설치의 할당·게시, 폴더 리디렉션·로밍 사용자 프로필, 로그온 스크립트, GPMC·`gpmc.msc`·그룹 정책 관리 편집기, `gpedit.msc`, `gpupdate`),
`windows-ad.organizational-unit`(OU는 그룹 정책을 붙이는 가장 아래 그릇, GPO는 사이트·도메인·OU에 연결), 기출 대조(`exam-notes.md` 「phase 80 step 4」 문단 — [기출 2024-08-25 #34])
(phase 80 step 5) `windows-ad.organizational-unit`(「Group Policy overview」 — 그룹 정책과 GPO의 뜻, OU에 연결하면 그 안의 사용자·컴퓨터에 적용, 위쪽 OU의 GPO는 아래 OU로 상속; 「Group Policy Management Console」 — GPO는 연결한 OU 안이 아니라 도메인 단위로 저장된다; 「Group Policy scope」 — 사용자 개체에는 연결할 수 없고 연결 대상은 로컬·사이트·도메인·OU라, 본문은 「그룹이나 사용자 계정에 연결하지는 않는다」로 쓴다)
(phase 80 step 7) `windows-ad.group-policy`(「Group Policy overview」 — 그룹 정책과 GPO, DC에 저장되어 DC끼리 복제, 컴퓨터 구성(전원 관리·방화벽 규칙)·사용자 구성(폴더 리디렉션), 시작·로그온 때 적용, 사이트·도메인·OU에 연결하면 적용 범위, 로컬 GPO; 「Group Policy processing」 — 로컬 → 사이트 → 도메인 → OU(부모 OU 다음 자식 OU) 차례와 덮어쓰기, 가까운 그릇이 이긴다, 한 그릇의 여러 GPO는 연결 순서 번호가 낮은 것이 우선, 90분(+최대 30분) 배경 새로 고침, 소프트웨어 설치·폴더 리디렉션은 시작·로그온 때만, 스크립트는 시작·종료·로그온·로그오프 때만 실행 — 본문은 로그오프를 앞 개념과 같은 말인 로그아웃으로 쓴다; 「Group Policy scope」 — 사용자 개체에는 연결하지 않는다, GPO 하나를 여러 곳에; 「Group Policy Management Console」·「MaxTokenSize」 문제 해결 — GPMC와 RSAT, 시작 메뉴의 Group Policy Management와 실행 창의 `gpmc.msc`, GPO 만들기 → 「편집」 → 그룹 정책 관리 편집기 → 연결, 연결에 필요한 사용 권한; 「Use Group Policy to remotely install software」 — `.msi` 패키지를 공유 폴더에 두고 GPO의 소프트웨어 설치에 더한다, 할당(컴퓨터는 시작할 때 — 그 컴퓨터의 모든 사용자가 쓴다, 사용자는 로그온할 때)과 게시(로그온했을 때 목록에 나타나 골라 설치 — 본문은 화면 이름 「프로그램 추가/제거」를 쓰지 않고 「설치할 수 있는 프로그램 목록」으로 쓴다); 「Folder Redirection and Roaming User Profiles…」·「Deploy Folder Redirection…」·「Deploy roaming user profiles」 — 두 기능의 하는 일, 폴더 리디렉션은 사용자 구성, 프로필 경로는 계정 속성이나 GPO의 컴퓨터 구성; 「Site functions」 — 스크립트는 GPO와 함께 SYSVOL에 저장되어 복제; 「gpupdate」 — 바뀐 설정만·`/force`·`/boot`·`/logoff`; 보안 설정은 아래 「계정 정책」 항목; 본문 예의 「켬·끔」 설정은 특정 설정이 아니라 차례를 보이려고 둔 것이다),
도식 `group-policy-link`, 문항 n268(인사팀 OU에 GPO를 연결하고 컴퓨터 구성의 소프트웨어 설치에 할당 — 오답의 공유 폴더 읽기 사용 권한·로컬 그룹 정책 편집기·위임은 같은 근거와 위 「조직 구성 단위와 사이트」 항목)·n269(도메인 GPO 다음 OU GPO가 적용되어 OU 쪽 값이 남는다)
(phase 80 step 8에서 쓰일 곳) `windows-admin-tools.mmc-run-commands`(「Group Policy overview」 — 한 컴퓨터의 로컬 설정은 로컬 그룹 정책 편집기 `gpedit.msc`로 만든다)

## (phase 80 step 4) Microsoft Learn — 계정 정책: Account Policies, Password Policy, Enforce password history, Maximum password age, Minimum password age, Minimum password length, Password must meet complexity requirements, Account Lockout Policy, Account lockout threshold, Account lockout duration, Reset account lockout counter after; Windows 11 security book — Advanced credential protection
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/account-policies
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/password-policy
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/enforce-password-history
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/maximum-password-age
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/minimum-password-age
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/minimum-password-length
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/password-must-meet-complexity-requirements
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/account-lockout-policy
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/account-lockout-threshold
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/account-lockout-duration
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/reset-account-lockout-counter-after
https://learn.microsoft.com/en-us/windows/security/book/identity-protection-advanced-credential-protection

2026-11-16에 IPv4로 내려받아 읽은 판: 계정 정책 문서 열하나는 모두 `updated_at` 2026-04-27이고 `ms.date`는 쪽마다 다르다 — Account Policies·Password Policy·Enforce password history·Maximum password age 2017-04-19, Account Lockout Policy 2018-10-11, Account lockout threshold·Reset account lockout counter after 2018-11-02, Minimum password age 2018-11-13, Account lockout duration 2021-08-16, Minimum password length 2022-03-30, Password must meet complexity requirements 2023-06-07.
「Applies to」는 모두 Windows 11·10이지만, 쪽마다 기본값 표가 기본 도메인 정책(Default domain policy)·기본 DC 정책·독립 실행 서버·DC·구성원 서버·클라이언트의 값을 함께 싣는다(서버의 판은 따로 적지 않는다). 이 열하나의 한국어판(같은 날짜)은 **번역되지 않은 영문 그대로**다.
「Windows 11 security book — Advanced credential protection」 2025-11-18(2025-11-13, Windows 11), 한국어판 2026-10-05.

- **계정 정책이 정해지는 자리**: 「Account Policies」 — 그룹 정책으로 정하는 계정 정책(암호 정책·계정 잠금 정책·Kerberos 정책)은 **도메인 단계에서** 적용되고, 도메인의 계정 정책이 그 도메인 구성원 컴퓨터의 기본 로컬 계정 정책이 된다. **도메인마다 계정 정책은 하나뿐이다** — 기본 도메인 정책(Default Domain Policy)이나, 도메인 루트에 연결해 그보다 앞서게 한 정책에서 정해야 하고, 도메인의 DC들이 이 값을 기본 도메인 정책 GPO에서 읽어 강제한다.
  OU에 다른 계정 정책을 두면 그 OU에 든 컴퓨터의 **로컬 계정**에만 걸린다(그 컴퓨터에 로컬로 로그인할 때) — 첫머리, Note. 「Password Policy」: 설정의 자리는 컴퓨터 구성\Windows 설정\보안 설정\계정 정책\암호 정책이고 GPMC로 연다. 그룹마다 다른 정책은 세분화된 암호 정책으로 한다(이름만 — 가져오지 않는다) — 첫머리
- 그래서 도메인 사용자의 암호 조건은 **사용자가 고르지 않고 도메인 정책이 정한다**. 「Password must meet complexity requirements」: 복잡성 조건은 **암호를 만들거나 바꿀 때** 검사한다 — 「Reference」. (계정 하나를 이 정책에서 빼는 것은 관리자가 계정에 「암호가 만료되지 않게 하기」를 거는 일이다 — 위 「도메인 사용자 계정과 ds 명령」 항목)
- **암호 정책 설정**(각 쪽 「Reference」·「Possible values」·「Default values」 — 기본값은 「기본 도메인 정책 / 독립 실행 서버」 순, DC와 구성원 서버의 실제 적용값은 기본 도메인 정책과 같다):
  - **Minimum password length**: 암호가 가져야 할 가장 적은 글자 수. 0~14(0이면 암호가 없어도 된다). 기본 7자 / 0자. 8 이상을 권한다
  - **Password must meet complexity requirements**: 켜면 암호가 (1) 계정 이름(samAccountName) 전체나 전체 이름(displayName)을 쉼표·마침표·하이픈·밑줄·공백 등으로 나눈 3자 이상 조각을 담지 않고(대소문자 가리지 않음, 계정 이름이 3자 미만이면 이 검사는 건너뛴다)
    (2) 다섯 갈래 — 영문 대문자, 영문 소문자, 숫자 0~9, 특수 문자(통화 기호는 빼고), 대소문자가 없는 알파벳 문자(아시아 언어 글자 등) — 가운데 **셋 이상**의 글자를 담아야 한다. 켬·끔. 기본 켬 / 끔
  - **Maximum password age**: 암호를 바꾸라고 요구하기 전까지 쓸 수 있는 날 수. 1~999일, 0이면 만료되지 않는다. 기본 42일 / 42일
  - **Minimum password age**: 암호를 바꾼 뒤 다시 바꿀 수 있기까지 그 암호를 써야 하는 날 수. 0~998일(0이면 바로 바꿀 수 있다), 최대 사용 기간보다 짧아야 한다. 기본 1일 / 0일. 0이면 기록 기억 수만큼 잇달아 바꿔 옛 암호로 돌아갈 수 있다
  - **Enforce password history**: 옛 암호를 다시 쓰려면 그 사이에 거쳐야 할 새 암호의 수(기억할 암호 수). 0~24. 기본 24개 / 0개
- **계정 잠금 정책 설정**(같은 방식):
  - **Account lockout threshold**: 계정을 잠그는 실패한 로그인 횟수. 1~999, 0이면 잠그지 않는다. 기본 0회 / 0회(곧 기본으로는 잠그지 않는다)
  - **Account lockout duration**: 잠긴 계정이 저절로 풀리기까지의 분. 1~99,999분, **0이면 관리자가 풀 때까지 잠겨 있다**. 기본 정의 안 됨 / 해당 없음 — 임계값을 정해야 뜻이 있다
  - **Reset account lockout counter after**: 로그인에 실패한 때부터 실패 횟수가 0으로 되돌아가기까지 지나야 하는 분. 1~99,999분. 기본 정의 안 됨 / 해당 없음
- **셋의 관계**: 임계값이 0보다 크면 **잠금 기간 ≥ 초기화 시간**이어야 한다 — 「Account lockout threshold」·「Account lockout duration」·「Reset account lockout counter after」 「Reference」. 잠금 정책은 DC가 로그온 시도를 지켜보다가 정한 횟수만큼 틀리면 그 계정을 정한 시간 동안 쓰지 못하게 하는 것이다 — 「Account Lockout Policy」 첫머리
- **잠긴 동안**: 잠긴 계정은 관리자가 풀거나 잠금 기간이 끝날 때까지 **쓸 수 없다** — 「Account lockout threshold」 「Reference」·「Countermeasure」. 「바른 암호를 넣어도 로그온하지 못한다」를 그 말 그대로 적은 문장은 없다 — 이 「쓸 수 없다」를 그렇게 읽는다.
  관리자가 푸는 자리는 「Active Directory 사용자 및 컴퓨터」의 암호 재설정 대화 상자에 있는 잠긴 계정 풀기 확인란이다(위 「도메인 사용자 계정과 ds 명령」 항목)
- (phase 80 step 7, 2026-11-16 Microsoft Learn에서 다시 받아 확인 — 「Account lockout threshold」 「Reference」·「Vulnerability」) **잠금 정책을 두는 까닭**: 무차별 대입 암호 공격은 프로그램으로 수천·수백만 개의 암호 조합을 계정에 잇달아 넣어 본다. 실패할 수 있는 로그인 횟수를 제한하면 이런 공격이 거의 통하지 않게 된다.
  같은 쪽은 임계값을 두면 남이 일부러 계정을 잠가 버리는 서비스 거부 공격의 위험이 생긴다는 것과, 기본 제공 Administrator 계정은 이 정책에서 빠진다는 것도 적는다 — 둘은 가져오지 않는다
- **새 Windows 11 기기의 기본값**: 「Windows 11 security book」 「Account lockout policies」 — Windows 11을 새로 설치한 기기는 계정 잠금 정책이 기본으로 켜져 있다: 임계값 10회, 잠금 기간 10분, 초기화 10분, Administrator 계정 잠금 허용 켬. 위 표(기본 도메인 정책의 0회 등)와 다르므로, 본문에 기본값을 쓰면 **어느 쪽의 기본값인지 밝힌다**
- **한국어 이름**: 위 설정 문서 열하나의 한국어판은 번역되지 않아 설정 이름을 영문으로만 보인다. learn.microsoft.com 한국어판에서 확인한 설정 이름은 「Windows 11 보안 책」의 **「계정 잠금 임계값」·「계정 잠금 기간」** 둘이고(같은 쪽이 Reset account lockout counter after를 「이후 계정 잠금 다시 설정 카운터」로 옮긴 것은 기계 번역이라 쓰지 않는다), 「계정 잠금 정책」·「암호 정책」·「기본 도메인 정책」은 「도메인 모델 검토하기」·「Windows 11 보안 책」 한국어판에 있다.
  **나머지 설정(최소 암호 길이 등)의 한국어 화면 이름은 확인하지 못했다**. 고른 방식: 항목 이름은 영문 설정 이름을 함께 적고, 한국어 이름은 그 영문 이름의 뜻을 옮긴 말로 쓰되 「한국어 화면에 이렇게 보인다」로 단정하지 않는다

쓰인 곳: (phase 80 step 7에서 쓰일 곳) `windows-ad.password-lockout-policy`(계정 정책은 도메인 단계 — 도메인마다 하나, 기본 도메인 정책, OU에 둔 계정 정책은 로컬 계정에만, 암호 정책 다섯과 잠금 정책 셋의 하는 일·값의 범위·기본값과 판, 셋의 관계, 잠긴 동안 쓸 수 없다, 새 Windows 11 기기의 기본값, 사용자는 암호 조건을 고르지 못한다),
`windows-ad.group-policy`(암호·계정 잠금 정책은 그룹 정책의 보안 설정이고 도메인에 연결된 GPO에서 정한다), `windows-ad.domain-user-accounts`(암호는 도메인 정책을 따른다), 기출 대조(`exam-notes.md` 「phase 80 step 4」 문단 — [기출 2024-08-25 #34], [기출 2026-08-02 #43])
(phase 80 step 7) `windows-ad.password-lockout-policy`(「Account Policies」·「Password Policy」·「Account Lockout Policy」 — 두 정책은 GPO 컴퓨터 구성의 보안 설정 아래 계정 정책에 있다, 도메인마다 하나·기본 도메인 정책이나 그보다 우선하게 한 도메인 GPO에 정하고 DC가 지킨다, OU에 둔 계정 정책은 로컬 계정에만; 「Account lockout threshold」 — 무차별 대입 공격을 막는 까닭; 설정 여덟의 하는 일·값의 범위·기본 도메인 정책의 기본값(최소 암호 길이 7자와 8자 이상 권고, 복잡성 켬과 두 가지 검사, 최대 42일, 최소 1일, 기억 24개, 임계값 0회, 잠금 기간·초기화 시간 정의 안 됨), 독립 실행 서버의 기본값, 새 Windows 11 기기의 기본값; 잠금 기간 ≥ 초기화 시간, 0이면 관리자가 풀 때까지, 잠긴 동안 쓸 수 없다 — 바른 암호를 넣어도 로그온할 수 없다로 쓴다; 잠긴 계정 풀기는 위 「도메인 사용자 계정과 ds 명령」 항목; 계산 예의 5회·30분·30분과 12자는 예시 값),
도식 `account-lockout`, 문항 n270(임계값 3회·잠금 기간 20분이면 세 번째로 틀린 9시 정각부터 20분 뒤인 9시 20분에 풀린다 — 오답의 9시 3분·곧바로·관리자가 풀 때까지는 같은 근거). 설정의 한국어 이름은 위 「한국어 이름」 줄대로 「계정 잠금 임계값」·「계정 잠금 기간」만 확인된 이름이고, 나머지(최소 암호 길이·암호 복잡성 조건·최대 암호 사용 기간·최소 암호 사용 기간·최근 암호 기억·실패 횟수 초기화 시간)는 영문 이름의 뜻을 옮긴 말이다 — 본문은 영문 설정 이름을 함께 적고 화면 이름이라고 단정하지 않는다

## (phase 80 step 8) Microsoft Learn — MMC와 실행 이름: What is Microsoft Management Console?, mmc, start, ADMX_WindowsExplorer Policy CSP, Configure NDES to use a domain user account, Tools to use with AppLocker, Delete saved logs from Event Viewer; Windows 드라이버 문서 — Universal Serial Bus Viewer in Windows, Look for potential memory leaks with PerfMon; .NET Framework 문서 — Certmgr.exe (Certificate Manager Tool)
https://learn.microsoft.com/en-us/troubleshoot/windows-server/system-management-components/what-is-microsoft-management-console
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/mmc
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/start
https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-admx-windowsexplorer
https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/create-domain-user-account-ndes-service-account
https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/applocker/tools-to-use-with-applocker
https://learn.microsoft.com/en-us/troubleshoot/windows-client/system-management-components/delete-saved-log-from-event-viewer
https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/usbview
https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/determining-whether-a-leak-exists
https://learn.microsoft.com/en-us/dotnet/framework/tools/certmgr-exe-certificate-manager-tool

2026-11-16에 IPv4로 내려받아 읽은 판: 「What is Microsoft Management Console?」 `updated_at` 2026-02-19(`ms.date` 2026-02-12, 적용 대상 — 지원되는 모든 Windows Server), 「mmc」 2026-02-16(2017-10-16)·「start」 2026-04-16(2026-04-16) — 둘 다 「Applies to」 Windows Server 2016~2025·Windows 11·10,
「ADMX_WindowsExplorer Policy CSP」 2026-10-23(2026-10-14, Windows 10 2004 이후·Windows 11), NDES 문서 2026-04-21(2023-04-03, Windows Server 2016~2025), 「Tools to use with AppLocker」 2025-02-24(2024-09-11, Windows 11·10·Windows Server 2016~2025),
「Delete saved logs from Event Viewer」 2026-02-19(2026-02-12, 지원되는 Windows 클라이언트), Windows 드라이버 문서 둘 2025-07-23(2025-07-11·2025-07-10), 「Certmgr.exe」 2023-05-22(2023-05-18, .NET Framework). 한국어판도 받았다(`updated_at` 2025-02~2026-10, 기계 번역).

- **MMC**(Microsoft Management Console)는 관리 도구를 담는 틀이다. 하드웨어·소프트웨어·네트워크 구성 요소를 관리하는 도구 묶음을 **콘솔**이라 부르고, MMC로 콘솔을 만들고 저장하고 연다. **스냅인**은 MMC 안에 얹혀 도는 관리 도구 하나다.
  MMC는 여러 스냅인을 한 화면에 함께 올려 여러 서비스를 한 인터페이스로 관리하게 하고, 필요한 스냅인만 골라 콘솔을 꾸밀 수 있다(로컬 컴퓨터와 원격 컴퓨터를 관리하는 도구를 함께 넣을 수도 있다) — 「What is Microsoft Management Console?」 「More information」
- **콘솔 파일 `.msc`**: 저장한 콘솔은 확장자 `.msc` 파일이다. `mmc <경로>\<파일 이름>.msc`는 MMC를 띄워 그 콘솔을 열고, 파일을 주지 않으면 빈 새 콘솔을 연다(`/a`는 콘솔을 고치는 작성자 모드). 이런 명령 줄은 시작 메뉴의 실행(Run), 명령 프롬프트 창, 바로 가기, 배치 파일 어디에서 불러도 같게 동작한다 — 「mmc」 「Syntax」·「Parameters」·「Remarks」
- **실행 창**: Windows 키 + R을 누르면 「실행(Run)」 대화 상자가 열리고, 거기에 실행 이름을 넣어 도구를 연다 — 「Universal Serial Bus Viewer in Windows」 「Use Device Manager to display USB information」(`devmgmt.msc`), 「Look for potential memory leaks with PerfMon」 첫머리(`perfmon`)
- **도구와 실행 이름**(문서가 보이는 것만):
  - **컴퓨터 관리** `compmgmt.msc` — 이벤트 뷰어·장치 관리자·디스크 관리 같은 주요 관리 도구를 한 콘솔에 모은 도구이고, 많은 기능은 관리자라야 쓸 수 있다(「ADMX_WindowsExplorer Policy CSP」 「NoManageMyComputerVerb」). 콘솔 트리의 시스템 도구 아래에 「로컬 사용자 및 그룹」이 있다(NDES 문서 「Add the NDES service account to the local IIS_IUSRS group」)
  - **장치 관리자** `devmgmt.msc` — 실행 대화 상자에 넣는다(「Universal Serial Bus Viewer in Windows」). 컴퓨터 관리 안에도 있다(위 줄)
  - **로컬 그룹 정책 편집기** `gpedit.msc` — 위 「(phase 80 step 4) Microsoft Learn — 그룹 정책」 항목
  - **로컬 보안 정책** `secpol.msc` — 로컬 보안 정책 MMC 스냅인(「Tools to use with AppLocker」 1번 항목)
  - **이벤트 뷰어** `eventvwr.msc` — 「Delete saved logs from Event Viewer」 「Symptoms」. 이벤트 뷰어가 무엇인지는 아래 「이벤트 뷰어와 로그」 항목
  - **인증서 관리자** `certmgr.msc` — 아래 「인증서와 파일 형식」 항목
  - **성능 모니터** `perfmon` — 실행 대화 상자에 넣는다(「Look for potential memory leaks with PerfMon」). 이 step이 읽은 Windows 문서는 성능 모니터의 실행 이름으로 `perfmon`만 보인다 — `perfmon.msc`를 보이는 Windows 문서는 찾지 못했다. 성능 모니터는 아래 「성능 모니터·리소스 모니터」 항목
- **`.msc`를 빼고 적은 이름**: 명령 프롬프트(`Cmd.exe`)는 입력한 첫 낱말이 명령도 아니고 확장자가 붙은 기존 파일의 경로도 아니면, 환경 변수 PATHEXT에 적힌 확장자를 그 차례대로 붙여 가며 찾는다. PATHEXT의 기본값은 `.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC`라 **`.MSC`가 들어 있다** — 「start」 「Remarks」.
  .NET Framework 문서 「Certmgr.exe」는, Certmgr.msc가 대개 Windows 시스템 디렉터리에 있고 Path 환경 변수에서 그 디렉터리가 SDK 도구의 디렉터리보다 앞서기 때문에 명령 줄에 `certmgr`만 적어도 인증서 MMC 스냅인이 열릴 수 있다고 적는다 — 「Note」.
  `compmgmt`를 두고 이것을 말한 문서와, 실행 창(Windows 키 + R)도 PATHEXT로 확장자를 찾는지 말한 문서는 찾지 못했다 — `exam-notes.md` **E37**
- **한국어 이름**: 「컴퓨터 관리」(ADMX_WindowsExplorer·NDES 한국어판), 「장치 관리자」(ADMX_WindowsExplorer 한국어판), 「로컬 보안 정책」(AppLocker 한국어판 — 「로컬 보안 정책 스냅인(secpol.msc)」), 「이벤트 뷰어」·「성능 모니터」(여러 한국어판), 「스냅인」(What is MMC 한국어판), MMC는 한국어판도 영문 이름.
  실행(Run) 대화 상자는 한국어판이 「Windows 키+R을 선택하고 팝업 상자에」로 옮겨 화면 이름을 확인하지 못했다 — 고른 이름: 기출이 쓰는 「실행 창」을 쓰고, Windows 키 + R로 연다고 함께 적는다
- (phase 80 step 9, 2026-11-16에 「start」를 IPv4로 다시 받아 확인 — `updated_at` 2026-04-16) 「start」 「Remarks」 첫 줄: 실행 파일이 아닌 파일도 그 파일 이름을 명령처럼 입력하면 그 파일 형식에 등록된 연결(file association)로 열린다 — 등록된 연결이 있는 파일 형식이면 무엇이든 그렇다. 본문은 「명령 프롬프트에 `.msc` 파일의 이름을 입력하면 MMC로 열린다」로 쓴다

쓰인 곳: (phase 80 step 9에서 쓰일 곳) `windows-admin-tools.mmc-run-commands`(MMC·콘솔·스냅인, 콘솔 파일 `.msc`, 실행 창과 Windows 키 + R, 도구와 실행 이름 일곱, `.msc`를 뺀 이름과 PATHEXT — E37), 기출 대조(`exam-notes.md` 「phase 80 step 8」 문단 — [기출 2025-08-24 #41], [기출 2024-08-25 #37])
(phase 80 step 9) `windows-admin-tools.mmc-run-commands`(위 줄들 — MMC·스냅인·콘솔과 `.msc`, 실행 창 Windows 키 + R과 Enter, 명령 프롬프트에서 파일 이름을 명령처럼 입력하면 연결된 프로그램으로 열린다, 도구 일곱과 실행 이름 — 컴퓨터 관리(관리 도구를 한 콘솔에 모았다, 시스템 도구 아래 「로컬 사용자 및 그룹」, 많은 기능은 관리자만), 인증서 관리자(현재 사용자의 인증서를 보고·내보내고·가져오고·지운다, 관리자가 아니면 자기 계정의 인증서만 — 아래 「인증서와 파일 형식」 항목), 성능 모니터(`perfmon.exe`가 MMC에 스냅인을 얹어 연다 — 아래 「성능 모니터·리소스 모니터」 항목), PATHEXT와 E37 줄; 장치 관리자·로컬 보안 정책·로컬 그룹 정책 편집기의 보안 설정은 아래 「(phase 80 step 9) … 로컬 보안 정책과 장치 관리자」 항목),
도식 `run-commands`, 문항 n271(`secpol.msc`로 여는 로컬 보안 정책에서 할 수 있는 일 — 오답의 장치 관리자·인증서 관리자·이벤트 뷰어의 보안 로그는 같은 근거와 아래 「이벤트 뷰어와 로그」 항목)·n272(컴퓨터 관리 한 콘솔에 이벤트 뷰어·장치 관리자가 함께 있다)

## (phase 80 step 9) Microsoft Learn — 로컬 보안 정책과 장치 관리자: Configure security policy settings, Security policy settings; Windows 드라이버 문서 — Using Device Manager
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/how-to-configure-security-policy-settings
https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/security-policy-settings
https://learn.microsoft.com/en-us/windows-hardware/drivers/install/using-device-manager

2026-11-16에 IPv4로 내려받아 읽은 판: 「Configure security policy settings」 `updated_at` 2026-04-27(`ms.date` 2023-06-07)·「Security policy settings」 2026-04-27(2017-04-19) — 둘 다 「Applies to」 Windows 11·10, 한국어판(같은 날짜)은 번역되지 않은 영문 그대로다.
「Using Device Manager」 2025-04-23(2025-04-22, Windows 드라이버 문서), 한국어판 「장치 관리자 사용」 2026-10-24(기계 번역 — 본문은 「디바이스 관리자」로 옮기고 제목만 「장치 관리자」). Windows Server를 적용 대상으로 따로 적은 지금 판 문서는 찾지 못했다 — `secpol.msc`가 Windows Server 2016~2025의 로컬 보안 정책 스냅인이라는 것은 위 「Tools to use with AppLocker」 줄이 근거다

- **로컬 보안 정책**(`secpol.msc`): 콘솔 트리의 보안 설정 아래에서 계정 정책을 고르면 암호 정책과 계정 잠금 정책을, 로컬 정책을 고르면 감사 정책(Audit Policy)·사용자 권한 할당(User Rights Assignment)·보안 옵션(Security Options)을 고친다. 이렇게 하려면 그 로컬 장치의 Administrators 권한이 있어야 한다.
  로컬 설정을 고칠 수 없게 되어 있으면 GPO가 그 설정을 정하고 있다는 뜻이다. 일부 설정은 다시 시작해야 적용되고, 사용자 권한 할당의 변경은 그 계정이 다음에 로그온할 때 적용된다 — 「Configure security policy settings」 「To configure a setting using the Local Security Policy console」
- **로컬 그룹 정책 편집기**(`gpedit.msc`)에서는 컴퓨터 구성 > Windows 설정 > 보안 설정 아래에서 같은 계정 정책·로컬 정책을 고친다. 네트워크의 많은 장치에 보안 설정을 걸려면 그룹 정책 관리 콘솔을 쓴다 — 같은 문서 「To configure a security policy setting using the Local Group Policy Editor console」
- 「Security policy settings」: 감사 정책은 보안 이벤트를 그 컴퓨터의 보안 로그에 남길지와 어떤 종류(성공·실패·둘 다)를 남길지 정한다. 사용자 권한 할당은 그 장치에서 로그인 권한이나 특권을 가진 사용자·그룹을 정한다 — 「Local Policies」
- **장치 관리자**는 장치마다 장치 종류·장치 상태·제조사·장치별 속성과 그 장치의 드라이버 정보를 보여 준다. 컴퓨터를 시작하는 데 필요하지 않은 장치에 문제가 있으면 그 장치 이름 옆에 표시를 하고, 문제를 설명하는 오류 메시지도 보여 준다.
  시작 메뉴 검색으로 열거나, 파일 탐색기의 「이 PC」에서 관리를 고르면 열리는 창의 시스템 도구 목록에서 연다 — 「Using Device Manager」(그 창이 컴퓨터 관리라는 것은 위 「ADMX_WindowsExplorer Policy CSP」 줄 — 컴퓨터 관리가 장치 관리자를 담는다). 표시의 색(노란 느낌표)은 쓰지 않는다
- **쓰지 않는 것**: 보안 옵션 하나하나, 고급 감사 정책 구성, 보안 템플릿, 장치 관리자의 숨긴 장치·속성 탭
- **한국어 이름**: 「로컬 보안 정책」·「사용자 권한 할당」은 위 항목들, 「계정 정책」·「암호 정책」·「계정 잠금 정책」은 위 「(phase 80 step 4) … 계정 정책」 항목. 감사 정책은 한국어판이 번역되지 않아 화면 이름을 확인하지 못했다 — 본문은 「감사 정책(Audit Policy)」으로 영문을 함께 적는다

쓰인 곳: (phase 80 step 9) `windows-admin-tools.mmc-run-commands`(로컬 보안 정책 — 계정 정책의 암호 정책·계정 잠금 정책, 감사 정책, 사용자 권한 할당, 로컬 그룹 정책 편집기의 컴퓨터 구성 아래 보안 설정에도 같은 설정, 바꾸려면 관리자, 도메인 정책이 정해 두면 바꿀 수 없다; 장치 관리자 — 장치의 종류·상태·제조사와 드라이버 정보, 문제 장치의 표시와 오류 메시지, 컴퓨터 관리 안에서도 연다), 문항 n271(정답 근거와 해설의 감사 정책 줄)

## (phase 80 step 8) Microsoft Learn — 이벤트 뷰어와 로그: Troubleshoot unexpected reboots using system event logs, Identify the cause of unexpected WMI shutdowns, Event ID 41(Windows 클라이언트 문서), about_Logging_Windows; Win32 — Shutdown Event Tracker, Eventlog Key, Event Types; 지난 판 Event Viewer, Event Logs, Event Properties
https://learn.microsoft.com/en-us/troubleshoot/windows-server/performance/troubleshoot-unexpected-reboots-system-event-logs
https://learn.microsoft.com/en-us/troubleshoot/windows-server/system-management-components/identify-cause-of-wmi-shutdown
https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/event-id-41-restart
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_logging_windows
https://learn.microsoft.com/en-us/windows/win32/shutdown/shutdown-event-tracker
https://learn.microsoft.com/en-us/windows/win32/eventlog/eventlog-key
https://learn.microsoft.com/en-us/windows/win32/eventlog/event-types
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc766042(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc722404(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc765981(v=ws.11)

2026-11-16에 IPv4로 내려받아 읽은 판: 문제 해결 둘(재부팅·WMI 종료) `updated_at` 2026-02-19(`ms.date` 2026-02-12, 적용 대상 — 지원되는 모든 Windows Server), 「Event ID 41」 2026-02-19(2026-02-12, 지원되는 Windows 클라이언트), about_Logging_Windows 2026-01-19(2026-01-18, PowerShell 7.6 판),
Win32 「Shutdown Event Tracker」 2025-03-11·「Eventlog Key」 2025-08-14·「Event Types」 2025-09-05(셋 다 `ms.date` 2018-05-31 — 뒤의 둘은 Windows Vista 이전의 이벤트 로깅 API 문서라 첫머리에 그렇게 밝힌다),
지난 판 「Event Viewer」·「Event Logs」·「Event Properties」 2021-11-12(2013-02-22, Applies To — Windows 7·Windows Server 2008 R2·Windows Server 2012·Windows Vista). **지금 판(Windows Server 2016~2025)에서 이벤트 뷰어의 로그 갈래와 이벤트 속성을 정리한 문서는 찾지 못해** 이 지난 판 셋을 쓴다. 지난 판 셋의 한국어판은 번역되지 않은 영문 그대로다.

- **이벤트 뷰어**는 이벤트 로그를 훑어보고 관리하는 MMC 스냅인이다. 할 수 있는 일: 여러 로그의 이벤트를 걸러 한꺼번에 보기, 그 거름을 사용자 지정 보기로 저장해 다시 쓰기, 어떤 이벤트가 남으면 작업이 돌게 걸기, 다른 컴퓨터의 이벤트를 모으는 구독 만들기(구독은 이름만 — 가져오지 않는다) — 지난 판 「Event Viewer」 첫머리
- **이벤트 한 건의 속성**(지난 판 「Event Properties」 첫 표): 원본(Source — 그 이벤트를 남긴 소프트웨어. 프로그램 이름일 수도, 드라이버처럼 큰 프로그램이나 시스템의 구성 요소일 수도 있다), 이벤트 ID(이벤트의 종류를 가리키는 번호 — 예를 들어 6005는 이벤트 로그 서비스가 시작될 때의 이벤트다),
  수준(Level — 얼마나 심각한지), 사용자, 작업 범주, 키워드, 컴퓨터, 날짜와 시간(기록된 때), 로그(기록된 로그의 이름). 원본과 이벤트 ID를 함께 보면 문제를 짚는 데 쓴다
- **수준**(같은 표): 시스템 로그와 응용 프로그램 로그의 수준은 넷 — 정보(작업이 끝났거나 자원이 만들어졌거나 서비스가 시작된 것 같은 변화), 경고(손쓰지 않으면 서비스에 영향을 주거나 더 큰 문제가 될 수 있는 일), 오류(그 구성 요소 바깥의 기능에 영향을 줄 수 있는 문제), 위험(그 구성 요소가 스스로 되살릴 수 없는 실패)이다.
  보안 로그의 수준은 성공 감사·실패 감사(사용자 권한을 쓰는 일이 성공했는지·실패했는지)다. Vista 이전 API 문서 「Event Types」도 오류·경고·정보·성공 감사·실패 감사 다섯을 들고, 서비스가 시작 중 로드되지 못하면 오류 이벤트가 남는다고 예를 든다
- **종료·재부팅 기록**(「Troubleshoot unexpected reboots using system event logs」): **시스템 이벤트 로그**를 이벤트 ID로 걸러 재부팅의 이력과 까닭을 본다. 같은 번호가 원본에 따라 다른 뜻일 수 있으니 원본도 함께 거른다. 문서의 표(이벤트 ID — 원본 — 뜻):
  - 12 — Kernel-General — 운영 체제가 시작했다 / 13 — Kernel-General — 운영 체제가 종료하는 중이다
  - 6005 — EventLog — 이벤트 로그 서비스가 시작했다 / 6009 — EventLog — 운영 체제의 판을 남긴다
  - **1074 — User32 — 어느 프로세스가 어느 사용자를 대신해 컴퓨터를 다시 시작하거나 껐는지와, 그 이유·이유 코드·종료 유형(다시 시작·전원 끄기)·설명**
  - 41 — Kernel-Power — 깨끗이 종료하지 않은 채 다시 시작했다(응답이 멈췄거나 충돌했거나 전원이 갑자기 끊긴 경우) / 6008 — EventLog — 바로 앞의 종료가 예기치 않았다
  정상적인 재부팅은 1074 다음에 13과 6009로, 예기치 않은 재부팅은 41과 6008로 알아본다 — 「Review Event IDs 12, 13, 6005, and 6009 for reboot history」·「Review Event IDs 13, 41, 1074, 6008, and 6009 to determine reboot types」
- 「Event ID 41」(Windows 클라이언트 문서): 1074는 응용 프로그램이 끄거나 다시 시작할 때와, 사용자가 시작 메뉴나 Ctrl+Alt+Del로 끄거나 다시 시작할 때 남는다. 6006은 Windows가 제대로 꺼졌다는 이벤트다.
  `shutdown.exe`는 꺼지기 바로 전에 시스템 로그에 원본 User32·ID 1074로 이유 코드와 설명을 남기고, 명령을 낸 사용자 이름과 날짜·시간도 남긴다 — 「More information」
- **종료 이벤트 추적기**(Shutdown Event Tracker, Win32): 사용자나 응용 프로그램이 시스템을 끄거나 다시 시작하는 이유를 기록하게 하는 기능이다. 시작 메뉴에서 종료를 고르거나 `Shutdown.exe`를 쓰면 정보를 적으라고 묻고, 적은 내용은 이벤트 로그에 저장된다.
  Windows Server 2003부터 기본으로 켜져 있다(Windows XP에서는 켜야 한다) — 첫머리. 지금 판 Windows Server에서도 기본으로 켜져 있다고 따로 적은 지금 판 문서는 찾지 못했다 — 본문은 「Windows Server 2003부터 기본으로 켜져 있다」까지만 쓴다
- **로그의 두 갈래**(지난 판 「Event Logs」): 이벤트 로그는 **Windows 로그**와 **응용 프로그램 및 서비스 로그**로 나뉜다.
  - **Windows 로그**는 시스템 전체에 걸친 이벤트와 옛 응용 프로그램의 이벤트를 담고, 다섯이다. 응용 프로그램(Application — 응용 프로그램이 남긴 이벤트, 예를 들어 데이터베이스 프로그램의 파일 오류. 무엇을 남길지는 그 프로그램을 만든 쪽이 정한다),
    보안(Security — 올바른 로그온 시도와 잘못된 로그온 시도, 파일 같은 개체를 만들고 열고 지우는 자원 사용. 무엇을 남길지는 관리자가 정한다 — 로그온 감사를 켜면 로그온 시도가 남는다), Setup(응용 프로그램 설치와 관련된 이벤트),
    시스템(System — Windows의 시스템 구성 요소가 남긴 이벤트, 예를 들어 시작할 때 드라이버나 구성 요소가 로드되지 못한 일. 무엇을 남길지는 Windows가 정해 두었다), ForwardedEvents(원격 컴퓨터에서 모아 온 이벤트 — 이벤트 구독을 만들어야 모인다).
    응용 프로그램·보안·시스템은 그 앞 판부터 있었고, Setup과 ForwardedEvents가 이 판(Vista)에서 더해졌다
  - **응용 프로그램 및 서비스 로그**는 시스템 전체에 영향을 주는 이벤트가 아니라 **응용 프로그램이나 구성 요소 하나**의 이벤트를 담는다. 하위 종류는 Admin·Operational·Analytic·Debug이고, Analytic·Debug 로그는 기본으로 숨겨지고 꺼져 있다
  - Vista 이전 API 문서 「Eventlog Key」도 표준 로그를 응용 프로그램·보안·시스템 셋으로, 위와 같은 뜻으로 적는다
- 응용 프로그램 및 서비스 로그 아래의 예: 「응용 프로그램 및 서비스 로그 > Microsoft > Windows > WMI-Activity」(「Identify the cause of unexpected WMI shutdowns」 「Analysis」). PowerShell 7의 로그는 이벤트 뷰어의 PowerShellCore/Operational 로그다(about_Logging_Windows — 어느 갈래인지는 그 문서에 적혀 있지 않다).
  하드웨어 이벤트(Hardware Events)·Windows PowerShell(5.1)·Internet Explorer 로그가 어느 갈래에 드는지 적은 문서는 찾지 못했다 — 본문은 「Windows 로그는 다섯이다」로 가르고, 그 셋의 자리를 사실로 적지 않는다
- **어느 일이 어느 로그에**: 로그온 실패 → 보안(로그온 감사가 켜져 있을 때), 시작할 때 드라이버·구성 요소가 로드되지 못함 → 시스템, 프로그램의 파일 오류 → 응용 프로그램, 종료·재부팅 → 시스템(위 1074 등) — 위 줄들
- **한국어 이름**: 「이벤트 뷰어」(여러 한국어판), 「종료 이벤트 추적기」(Shutdown Event Tracker 한국어판 본문 — 제목은 「Shutdown 이벤트 추적기」), 「이벤트 ID」. 지금 판 한국어판은 Application을 「애플리케이션」으로 옮긴다(Event ID 41 한국어판의 「애플리케이션 및 시스템 로그」, WMI 종료 문서 한국어판의 「애플리케이션 및 서비스 로그」).
  **실제 한국어 화면의 로그·수준 이름은 확인하지 못했다.** 고른 이름: 기출이 쓰는 「응용 프로그램」에 맞춰 「Windows 로그」·「응용 프로그램」·「보안」·「시스템」·「응용 프로그램 및 서비스 로그」로 쓰고, Setup·ForwardedEvents는 영문 이름을 세운다(한국어 이름을 화면 이름이라고 단정하지 않는다). 원본·수준과 정보·경고·오류·위험도 뜻을 옮긴 말이다

쓰인 곳: (phase 80 step 9에서 쓰일 곳) `windows-admin-tools.event-viewer`(이벤트·이벤트 로그·이벤트 뷰어, 이벤트 한 건의 속성과 수준, 종료·재부팅 기록 — 시스템 로그의 1074·6008·41·6006 등, 종료 이벤트 추적기),
(phase 80 step 10에서 쓰일 곳) `windows-admin-tools.windows-logs`(Windows 로그 다섯과 하는 일, 응용 프로그램 및 서비스 로그, 어느 일이 어느 로그에), 기출 대조(`exam-notes.md` 「phase 80 step 8」 문단 — [기출 2024-08-25 #39]·[기출 2025-11-02 #38], [기출 2025-08-24 #30])
(phase 80 step 9) `windows-admin-tools.event-viewer`(위 줄들 — 이벤트·이벤트 로그, Windows 로그 아래 응용 프로그램·보안·시스템 로그와 이벤트마다 기록된 로그가 정해져 있다, 이벤트 뷰어는 MMC 스냅인이고 여러 로그를 걸러 본다, 이벤트 속성의 날짜와 시간·원본·이벤트 ID·수준·사용자·컴퓨터·로그와 6005 예, 원본과 함께 보는 이벤트 ID, 수준 넷과 성공 감사·실패 감사, 시스템 로그의 1074·6006·41·6008과 41이 생기는 경우, 종료 이벤트 추적기와 Windows Server 2003부터 기본으로 켜짐, `shutdown.exe`가 남기는 1074; 칸 이름의 한국어는 영문의 뜻을 옮긴 말이라고 본문에 밝혔다),
도식 `event-viewer`, 문항 n273(주말 사이 다시 시작된 기록은 시스템 로그 — 오답의 성능 모니터·리소스 모니터는 위 「성능 모니터·리소스 모니터」 항목)·n274(이벤트 뷰어는 지난 일의 기록, CPU 사용률 그래프는 성능 모니터)
(phase 80 step 10) `windows-admin-tools.windows-logs`(위 줄들 — 이벤트 로그의 두 갈래 Windows 로그와 응용 프로그램 및 서비스 로그, Windows 로그는 컴퓨터 전체의 이벤트와 옛 방식 프로그램의 이벤트를 담고 다섯이다, 응용 프로그램(무엇을 남길지는 만든 쪽이 정한다)·보안(로그온 시도의 성공과 실패, 파일 같은 개체를 만들고 열고 지운 일, 무엇을 남길지는 관리자가 감사 정책으로 정한다 — 감사의 뜻은 위 「(phase 80 step 9) … 로컬 보안 정책과 장치 관리자」 항목의 감사 정책 줄)·Setup(프로그램 설치)·시스템(Windows 구성 요소, 시작할 때 드라이버를 불러오지 못한 일, 무엇을 남길지는 Windows가 정한다, 종료·재부팅 기록)·ForwardedEvents(다른 컴퓨터에서 모은 이벤트, 구독이 있어야 모인다), 응용 프로그램 및 서비스 로그는 프로그램이나 구성 요소 하나의 이벤트를 담는다와 WMI-Activity 예, 어느 일이 어느 로그에 — 로그온 실패·드라이버 불러오기 실패·프로그램의 파일 오류; 하드웨어 이벤트·Windows PowerShell·Internet Explorer 로그와 PowerShell 7 로그의 자리, 응용 프로그램 및 서비스 로그의 하위 종류는 쓰지 않았다; WMI의 뜻은 위 「(phase 80 step 0) … 로컬 계정과 기본 그룹」 항목의 About WMI 줄), 도식 `windows-logs`, 문항 n275(로그온 실패는 보안 로그 — 수준은 실패 감사, 오답의 시스템·응용 프로그램·Setup 로그는 위 줄들)

## (phase 80 step 8) Microsoft Learn — 성능 모니터·리소스 모니터: perfmon, Troubleshoot issues using Performance Monitor, Scenario guide: Troubleshoot performance problems in Windows, Guidance for troubleshooting high CPU usage; Win32 — About Performance Counters, Specifying a Counter Path, Performance Counters Tools, Compatibility and Reliability(Windows 7 개발자 안내서); 지난 판 Overview of Windows Performance Monitor, Creating Data Collector Sets, Schedule Data Collection in Windows Performance Monitor
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/perfmon
https://learn.microsoft.com/en-us/troubleshoot/windows-server/support-tools/troubleshoot-issues-performance-monitor
https://learn.microsoft.com/en-us/troubleshoot/windows-server/performance/troubleshoot-performance-problems-in-windows
https://learn.microsoft.com/en-us/troubleshoot/windows-server/performance/troubleshoot-high-cpu-usage-guidance
https://learn.microsoft.com/en-us/windows/win32/perfctrs/about-performance-counters
https://learn.microsoft.com/en-us/windows/win32/perfctrs/specifying-a-counter-path
https://learn.microsoft.com/en-us/windows/win32/perfctrs/performance-counters-tools
https://learn.microsoft.com/en-us/windows/win32/win7devguide/compatibility-and-reliability
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc749154(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc749337(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc722312(v=ws.11)

2026-11-16에 IPv4로 내려받아 읽은 판: 「perfmon」 `updated_at` 2026-02-16(`ms.date` 2018-07-25, 「Applies to」 Windows Server 2016~2025·Windows 11·10), 문제 해결 셋 2026-02-19(2026-02-12, 적용 대상 — 지원되는 모든 Windows Server), Win32 성능 카운터 셋 2025-07-16(2025-07-14),
「Compatibility and Reliability」 2025-03-13(2018-05-31, Windows 7 개발자 안내서), 지난 판 셋 2021-11-12(2013-02-22, Applies To — Windows 7·Windows Server 2008 R2·Windows Server 2012·Windows Vista). 데이터 수집기 집합의 일정·멈춤 조건을 정리한 지금 판 문서는 찾지 못해 지난 판을 쓴다.

- **성능 모니터**(Performance Monitor)는 시스템 사용량과 여러 성능 지표를 살피는 MMC 스냅인이다. 열면 세 자리가 있다 — 성능 모니터(지표를 실시간으로 본다), 데이터 수집기 집합(정해 둔 시간 동안 데이터를 모은다), 보고서(데이터 수집기 집합이 모은 데이터를 본다).
  커널 안쪽의 정보는 보지 못하고, 기본으로 들어 있는 가벼운 도구이며, 로컬로도 원격으로도 돌린다 — 「Troubleshoot issues using Performance Monitor」 「What is Performance Monitor (perfmon)?」·Note
- **여는 법**: `perfmon.exe`는 MMC에 성능 모니터 스냅인을 얹어 성능 모니터·데이터 수집기 집합·보고서를 연다 — 「Performance Counters Tools」 「Data collection tools」. 실행 창에 `perfmon` — 위 「MMC와 실행 이름」 항목.
  `perfmon`의 옵션: `/res` 리소스 보기(Resource View), `/report` 시스템 진단 데이터 수집기 집합을 돌려 결과 보고서를 보임, `/rel` 안정성 모니터(Reliability Monitor), `/sys` 성능 모니터 — 「perfmon」 「Parameters」
- **성능 카운터**: 프로세서·메모리·디스크 사용량 같은 시스템 데이터를 한결같은 방식으로 모으게 해 주는 측정 항목이다. 관리자는 성능이나 동작의 문제를 살피는 데 쓴다. 1초에 한 번보다 자주 모으도록 만들어지지 않았다.
  Windows에서 성능 데이터를 쓰는 기본 도구로 작업 관리자·리소스 모니터·성능 모니터·typeperf·logman·relog가 있다. 카운터를 묶은 것(counterset)을 다른 API에서는 성능 개체(performance object)라 부르고, 카운터는 이름과 종류를 가진 데이터 하나다 — 「About Performance Counters」 첫머리·「Concepts」
- **카운터 이름의 꼴**: `\\컴퓨터\성능개체(인스턴스)\카운터`. 로컬 컴퓨터의 카운터면 컴퓨터를 뺀다. 인스턴스가 여럿일 수 있는 개체(프로세서·프로세스·스레드 같은 것)는 괄호 안에 인스턴스를 적고, `*`는 모든 인스턴스를 뜻한다 — 「Specifying a Counter Path」.
  문서가 보이는 예: `\Processor Information(*)\% User Time`, `\Memory\Available MBytes`(메모리는 하나뿐이라 인스턴스가 없다), Processor 개체의 `_Total` 인스턴스와 `% Idle Time` 카운터 — 「Scenario guide…」 「Use Performance Monitor to record performance data」·「Introduce the 18 most important counters」. 본문의 예는 이 문서들이 보이는 이름으로 쓴다
- **데이터 수집기 집합**: 여러 데이터 수집 지점을 하나로 묶어 기록하고 보고하는 단위다. 담을 수 있는 것은 성능 카운터, 이벤트 추적 데이터, 시스템 구성 정보(레지스트리 값)이고, 템플릿이나 성능 모니터의 지금 보기에서 만들거나 하나하나 골라 만든다 — 지난 판 「Creating Data Collector Sets」.
  성능 카운터를 모은 데이터는 로그 파일(`.blg`)로 남는다 — 「Troubleshoot issues using Performance Monitor」 「Run Performance Monitor remotely」. 모으는 간격(샘플 간격)을 정한다 — 예를 들어 `logman`의 `-si 00:00:15`는 15초마다 모은다(「Scenario guide…」), `-si 00:00:01`은 1초마다(「Troubleshoot issues…」)
- **일정과 멈춤 조건**(지난 판 「Schedule Data Collection in Windows Performance Monitor」): 데이터 수집기 집합의 속성에서 일정(Schedule) 탭에 시작 날짜·시간·요일을 더한다(만료 날짜는 그 뒤 새 수집이 시작되지 않게 할 뿐, 진행 중인 수집은 멈추지 않는다).
  중지 조건(Stop Condition) 탭에서 전체 기간이나 한도(한 로그 파일의 기간·최대 크기 — 한도에 닿으면 집합을 다시 시작하게 할 수 있다)를 정한다. 전체 기간은 샘플 간격보다 길어야 보고서에 데이터가 보인다
- 권한(지난 판 「Overview of Windows Performance Monitor」): Users 그룹은 로그 파일을 열어 볼 수만 있고, Performance Monitor Users는 실시간 데이터도 보지만 데이터 수집기 집합을 만들거나 고치지 못하며, Performance Log Users는 일괄 작업으로 로그온 권한을 받으면 만들고 고친다 — `windows-ad.local-groups`가 이미 가르친 사실과 같다(이 주제에서는 다시 쓰지 않는다)
- **리소스 모니터**(Resource Monitor): `resmon`으로 열고, CPU 탭에서 프로세스마다 CPU 사용량을 보며 평균 CPU(Average CPU) 열로 정렬해 CPU를 많이 쓰는 프로세스를 찾는다 — 「Guidance for troubleshooting high CPU usage」 「Resource Monitor」.
  리소스 모니터는 성능 데이터를 쓰는 Windows 기본 도구의 하나다 — 「About Performance Counters」 「Concepts」. `perfmon /res`는 리소스 보기를 연다 — 「perfmon」
- **리소스 모니터의 탭 목록**(개요·CPU·메모리·디스크·네트워크)과 **네트워크 탭에 보이는 것**(프로세스별 네트워크 사용·연결·수신 대기 포트)은 허용한 문서에서 찾지 못했다.
  찾아본 곳: Windows 명령 참조(perfmon·netstat), 문제 해결 문서(높은 CPU, 성능 문제 안내, 작업 관리자, 포트를 쓰는 프로그램 찾기), Win32 성능 카운터 문서, 지난 판 성능 모니터 문서 묶음(개요·데이터 수집기 집합·사용자 인터페이스·사용법), Microsoft Learn 검색(리소스 모니터의 탭·디스크·네트워크로 여러 번).
  「CPU·디스크·네트워크·메모리 네 자원을 실시간으로 살핀다」와 개요 탭은 Microsoft Learn 교육 과정 페이지(「Use Resource Monitor to review current resource usage」)에만 있다 — 쓰지 않았다(step 8 summary 「사용자 확인」)
- **안정성 모니터**(Reliability Monitor): Windows에 기본으로 든 신뢰성 분석 구성 요소가 시스템 사용과 안정성을 지수로 계산하고, Windows 업데이트·응용 프로그램 설치처럼 안정성에 영향을 줄 만한 변화를 기록해 둔다. 안정성 모니터 스냅인으로 그 지수의 흐름을 그런 일들과 함께 본다 — 「Compatibility and Reliability」 「Reliability Analysis Component」(Windows 7 개발자 안내서). 여는 법은 `perfmon /rel` — 「perfmon」
- 작업 관리자는 phase 71 「Microsoft Learn — Windows commands, ping, Task Manager」 항목(응용 프로그램과 프로세스의 성능·자원 사용을 살피는 기본 도구). 리소스 모니터와 작업 관리자의 관계를 한 문장으로 적은 문서는 찾지 못했다 — 둘 다 성능 데이터를 쓰는 기본 도구라는 것(「About Performance Counters」)까지만 쓴다
- **한국어 이름**: 「성능 모니터」·「데이터 수집기 집합」·「보고서」(Troubleshoot issues using Performance Monitor 한국어판), 「리소스 모니터」(높은 CPU 문서·About Performance Counters 한국어판), 「성능 카운터」(About Performance Counters 한국어판), 「Windows 안정성 및 성능 모니터」(perfmon 한국어판 — 옵션 표는 번역되지 않았다).
  안정성 모니터는 perfmon 한국어판에 「안정성 모니터」로 보인다. 일정·중지 조건 탭과 평균 CPU 열의 한국어 화면 이름은 확인하지 못했다 — 뜻을 옮긴 말로 쓰고 영문 이름을 함께 적는다

쓰인 곳: (phase 80 step 10에서 쓰일 곳) `windows-admin-tools.performance-monitor`(성능 모니터의 세 자리, `perfmon`, 성능 카운터와 이름의 꼴, 데이터 수집기 집합·`.blg`·샘플 간격·일정·중지 조건),
(phase 80 step 11에서 쓰일 곳) `windows-admin-tools.resource-monitor`(`resmon`·`perfmon /res`, CPU 탭과 평균 CPU, 성능 데이터를 쓰는 기본 도구, 탭 목록은 못 찾음, 안정성 모니터 — 기출 문제문 판정), 기출 대조(`exam-notes.md` 「phase 80 step 8」 문단 — [기출 2025-05-25 #35], [기출 2024-11-03 #36], [기출 2026-02-01 #42])
(phase 80 step 10) `windows-admin-tools.performance-monitor`(위 줄들 — MMC 스냅인 성능 모니터와 `perfmon`, 로컬로도 원격으로도, 성능 카운터의 뜻과 1초보다 자주 재지 않는다, 성능 개체·인스턴스와 카운터 이름의 꼴, 세 자리(성능 모니터·데이터 수집기 집합·보고서), 데이터 수집기 집합과 `.blg`·샘플 간격, 일정과 중지 조건의 전체 기간; 카운터 예·화면 없이 모으기·마법사의 차례는 아래 「(phase 80 step 10) … 성능 카운터 이름과 데이터 수집기 집합 만들기」 항목; perfmon의 옵션, 커널 안쪽을 보지 못한다는 것, 만료 날짜, 성능 모니터의 권한은 쓰지 않았다), 도식 `perfmon-collector`, 문항 n276
(phase 80 step 11) `windows-admin-tools.resource-monitor`(위 줄들 — `resmon`과 CPU 탭·평균 CPU 열로 정렬하기, `perfmon /res`·`/rel`, 작업 관리자·리소스 모니터·성능 모니터가 성능 데이터를 쓰는 기본 도구라는 것, 안정성 모니터. 탭 목록과 네 자원은 아래 「(phase 80 step 11) … 리소스 모니터」 항목), 도식 `resource-monitor`, 문항 n277

## (phase 80 step 10) Microsoft Learn — 성능 카운터 이름과 데이터 수집기 집합 만들기: typeperf; Win32 — Collecting Performance Data; 지난 판 Create a Data Collector Set Manually, Create a Data Collector Set to Monitor Performance Counters
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/typeperf
https://learn.microsoft.com/en-us/windows/win32/perfctrs/collecting-performance-data
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc766404(v=ws.10)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc722414(v=ws.10)

2026-11-16에 IPv4로 내려받아 읽은 판: 「typeperf」 `updated_at` 2025-10-22(`ms.date` 2023-06-15, 「Applies to」 Windows Server 2016~2025·Windows 11·10·Azure Local 2311.2 이후), Win32 「Collecting Performance Data」 2025-07-16(2025-07-14),
지난 판 둘 2021-11-12(「Create a Data Collector Set Manually」 `ms.date` 2012-07-03, 둘 다 Applies To — Windows Server 2008·Windows Vista). 위 「(phase 80 step 8) … 성능 모니터·리소스 모니터」 항목의 「Troubleshoot issues using Performance Monitor」와 「Scenario guide…」도 같은 날 다시 받아 아래 줄을 확인했다(둘 다 `updated_at` 2026-02-19).
데이터 수집기 집합을 마법사로 만드는 차례를 적은 지금 판 문서는 찾지 못해 Windows Server 2008 판 문서를 쓴다 — 본문에 그 판이라고 밝혔다.

- **CPU 사용률 카운터**: 「Troubleshoot issues using Performance Monitor」 「Performance counters for CPU usage」는 CPU 사용률 문제에서 먼저 볼 카운터의 첫째로 Processor 개체의 % Processor Time을 든다. step 8이 쓰기로 한 `\Processor Information(*)\% User Time`은 사용자 모드 시간이라 CPU 사용률 전체가 아니므로, 본문의 예는 아래 이름으로 쓴다
- **`\Processor(_Total)\% Processor Time`**: 모든 프로세서 사용률의 평균이다 — 프로세서가 둘이고 하나는 100%, 다른 하나는 0%면 50%이고, 값의 범위는 0~100이다(Win32 「Collecting Performance Data」 「Understanding Multiple Processor Counters」). 「typeperf」의 첫째 예가 로컬 컴퓨터의 이 카운터를 그대로 이 꼴로 적는다
- **카운터 이름의 전체 꼴**: `\컴퓨터\개체(인스턴스)\카운터`이고, 예로 `\\Server1\Processor(0)\% User Time`(Server1 컴퓨터의 프로세서 0 — 컴퓨터 이름 앞에는 역슬래시가 둘이다) — 「typeperf」 「Parameters」. 로컬 컴퓨터면 컴퓨터를 뺀다는 것은 위 step 8 항목의 「Specifying a Counter Path」
- **`\Memory\Available MBytes`**: Memory 개체는 인스턴스가 없다. Available MBytes는 커널을 포함한 모든 프로그램이 쓸 수 있는 RAM의 양이다 — 「Scenario guide…」 「Use Performance Monitor to record performance data」·「Memory」
- **화면 없이 모으기**: 「Scenario guide…」는 데이터 수집기 집합을 그래픽 화면으로도 `logman.exe` 명령으로도 만든다고 하고, 명령 프롬프트에서 `logman.exe create counter …`로 만들고 `logman.exe start …`로 시작한 집합이 15초마다(`-si 00:00:15`) 성능 데이터를 로그로 남긴다고 적는다 — 성능 모니터 화면을 열어 두지 않아도 집합이 값을 모은다는 근거다. `logman`의 이름과 옵션은 본문에 쓰지 않았다
- **마법사로 만드는 차례**(지난 판 「Create a Data Collector Set Manually」): 탐색 창에서 데이터 수집기 집합(Data Collector Sets)을 펼쳐 사용자 정의(User Defined)를 오른쪽 클릭하고 새로 만들기 → 데이터 수집기 집합을 고르면 새 데이터 수집기 집합 만들기 마법사가 시작된다. 이름을 넣고, 직접 만들기(Create manually)를 고르고, 데이터 로그 만들기(Create data logs)에서 성능 카운터 확인란을 고른 뒤 추가(Add)로 카운터를 더한다.
  마법사를 마칠 때 이 데이터 수집기 집합의 속성 열기(Open properties for this data collector set)를 고를 수 있고, 지금 시작(Start this data collector set now)이나 저장하고 닫기(Save and close)를 고른다. 「Create a Data Collector Set to Monitor Performance Counters」도 같은 차례로 마법사를 연다(그 문서의 경고 설정은 쓰지 않는다)
- **샘플 간격**: 마법사의 어느 쪽에서 샘플 간격을 정하는지는 위 두 지난 판 문서에 적혀 있지 않다. 집합마다 샘플 간격이 있다는 것은 step 8 항목의 「Scenario guide…」 `-si`와 「Schedule Data Collection…」(전체 기간은 데이터를 재는 간격보다 길어야 한다)이 근거다 — 본문은 샘플 간격을 정하는 화면의 자리를 쓰지 않았다
- **쓰지 않는 것**: typeperf·logman의 옵션, 경고(알림) 설정, 실행 계정(Run As) 설정, 루트 디렉터리, 이벤트 추적 데이터·시스템 구성 정보 수집기, 그래프에 보이는 데이터 점의 한도
- **한국어 이름**: 사용자 정의·직접 만들기·데이터 로그 만들기는 한국어 화면 이름을 확인하지 못했다 — 영문의 뜻을 옮긴 말이고 본문에 영문을 함께 적었다. 「데이터 수집기 집합」·「보고서」·「성능 카운터」는 위 step 8 항목

쓰인 곳: (phase 80 step 10) `windows-admin-tools.performance-monitor`(CPU 사용률 카운터 `\Processor(_Total)\% Processor Time`과 모든 프로세서의 평균이라는 것·50% 예, 다른 컴퓨터의 카운터 이름 앞의 `\\컴퓨터 이름`, 인스턴스가 없는 `\Memory\Available MBytes`, 화면을 열어 두지 않아도 모으는 데이터 수집기 집합, 마법사로 만드는 차례), 도식 `perfmon-collector`, 문항 n276(밤새 화면을 열어 두지 않아도 집합이 로그 파일에 쓴다)

## (phase 80 step 11) Microsoft Learn — 리소스 모니터: 지난 판 Performance and Reliability Monitoring Getting Started Guide for Windows Server 2008; Task Manager may display incorrect memory information; 같은 learn.microsoft.com의 제품 문서 — Monitoring churn patterns on virtual machines(Azure Site Recovery), Monitor replication for the Data migration toolkit(Dynamics 365)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc771692(v=ws.10)
https://learn.microsoft.com/en-us/troubleshoot/windows-server/performance/task-manager-display-incorrect-memory-info
https://learn.microsoft.com/en-us/azure/site-recovery/monitoring-high-churn
https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/migration-upgrade/monitor-replication

2026-11-16에 IPv4로 내려받아 읽은 판: 지난 판 「Performance and Reliability Monitoring Getting Started Guide for Windows Server 2008」 `updated_at` 2021-11-12(`ms.date` 2012-07-02, Applies To — Windows Server 2008. 한국어판도 같은 날이고 본문은 번역되지 않은 영문),
「Task Manager may display incorrect memory information」 2026-02-19(2026-02-12, 적용 대상 — 지원되는 Windows Server, 한국어판 2026-10-14), 「Monitoring churn patterns on virtual machines」 2025-10-07(2020-09-09),
「Monitor replication for the Data migration toolkit」 2026-09-01(2026-03-17). step 8이 리소스 모니터의 탭 목록을 찾지 못하고 교육 과정 페이지만 남겨 사용자 확인으로 올렸으므로, 이 step이 교육 과정 페이지를 쓰지 않고 다시 찾았다.
지난 판 문서가 리소스 뷰를 설명하는 차례가 가장 자세해 그것을 주 근거로 쓰고, 지금 판 문서로 지금의 리소스 모니터에도 같은 자원·탭이 있는지 맞춰 봤다. 뒤의 두 문서는 Windows Server 문서가 아니라 같은 learn.microsoft.com의 Azure·Dynamics 365 제품 문서다 —
step 8이 Windows 드라이버 문서·.NET 문서를 쓴 것과 같은 처리로, 리소스 모니터에 디스크 탭과 네트워크 탭이 있다는 것을 맞춰 보는 데만 쓴다.

- **리소스 뷰**(Resource View, 지난 판 — Windows Server 2008): Windows Reliability and Performance Monitor의 첫 화면이다. CPU·디스크·네트워크·메모리 네 자원의 사용과 성능을 실시간으로 살피고, 네 자원을 펼치면 어느 프로세스가 어느 자원을 쓰는지 자세히 보인다.
  위쪽 그래프 넷이 네 자원의 지금 사용량을 보이고, 그 아래 펼치는 절 넷에 프로세스마다의 자세한 값이 있다. 명령 프롬프트에서 `perfmon /res`를 입력하면 리소스 뷰가 따로 된 창으로 열린다 — 「Resource View」·「Scenario 1」
- **자원마다 보이는 칸**(같은 문서 「Resource View details」 표): CPU — 이미지(그 자원을 쓰는 응용 프로그램), PID(그 응용 프로그램 인스턴스의 프로세스 ID), 스레드 수, 지금 CPU, **평균 CPU — 최근 60초 동안 그 인스턴스가 낸 CPU 부하의 평균을 CPU 전체 용량의 백분율로**.
  디스크 — 이미지·PID, 그 인스턴스가 읽거나 쓰는 파일, 읽기·쓰기 속도(Bytes/min), I/O 우선순위, 응답 시간. 네트워크 — 이미지·PID, 이 컴퓨터가 정보를 주고받는 상대의 주소(컴퓨터 이름·IP 주소·FQDN), 보내는 양·받는 양·합계(Bytes/min).
  메모리 — 이미지·PID, 분당 하드 폴트, 작업 집합(그 인스턴스가 지금 메모리에 올려 둔 KB), 공유할 수 있는 양, 전용 양
- **작업 관리자와의 관계**(같은 문서 「Resource View」·「Benefits…」): 이런 프로세스별 실시간 데이터는 그 전 판의 Windows에서는 작업 관리자에서만 제한된 꼴로 볼 수 있었고, 리소스 뷰는 작업 관리자 같은 앞선 도구보다 시스템 활동과 자원 사용을 훨씬 자세히 보여 준다
- **안정성 모니터**(같은 문서 「Reliability Monitor」·「Scenario 7」): 응용 프로그램의 설치·제거와 운영 체제 업데이트 같은 시스템의 변화와 응용 프로그램·운영 체제·하드웨어의 실패를 날짜별로 나란히 보이고, 안정성 지수를 계산한다(step 8 항목의 Win32 문서와 같은 사실)
- **지금의 리소스 모니터**: 시작 메뉴에서 `resmon`을 입력해 열고 **CPU 탭**에서 프로세스마다 CPU 사용량을 보며 **평균 CPU 열**로 정렬한다 — step 8 항목의 「Guidance for troubleshooting high CPU usage」(한국어판 「리소스 모니터」·「CPU 탭」·「평균 CPU 열」).
  리소스 모니터는 하드웨어 예약 메모리의 바른 값을 보여 주고 Windows 7과 그 뒤 판에 들어 있다 — 「Task Manager may display incorrect memory information」 「Workaround」. Win+R로 `resmon`을 입력해 연 리소스 모니터 창에서 **디스크 탭**으로 바꿔 프로세스마다 디스크 쓰기를 본다 — 「Monitoring churn patterns…」 「Resource Monitor」.
  작업 관리자에서 리소스 모니터를 열고, 리소스 모니터의 **네트워크 탭**에서 프로세스로 걸러 보내는 대역폭을 본다 — 「Monitor replication…」 「Network bandwidth」
- **리소스 뷰와 리소스 모니터**: 두 이름을 같은 화면이라고 한 문장으로 적은 문서는 찾지 못했다. 같은 화면으로 본 근거는 셋이다 — (1) 지금 판 Windows 명령 참조 「perfmon」(Windows Server 2016~2025)이 `/res`를 「리소스 뷰를 시작한다」로 적고 step 8 항목도 이 줄을 리소스 모니터 아래에 두었다,
  (2) 지난 판의 리소스 뷰와 지금의 리소스 모니터가 같은 「평균 CPU」 열로 CPU를 많이 쓰는 프로세스를 찾는다, (3) 지금의 리소스 모니터에도 CPU·디스크·네트워크 탭과 메모리 값이 있다(위 줄). 그래서 본문은 리소스 모니터를 중심에 두고, 열 이름과 칸은 「Windows Server 2008 판 문서가 리소스 뷰를 설명하며 정리한 것」이라고 밝혔다
- **방화벽**: 리소스 모니터가 방화벽에 대해 무엇을 보이는지(또는 보이지 않는지)를 적은 문서는 찾지 못했다 — 본문은 「방화벽은 다루지 않는다」를 쓰지 않고 리소스 모니터가 보이는 네 자원을 정확히 쓴다. [기출 2024-11-03 #36]이 방화벽을 점검할 수 없는 것으로 두는 것은 그대로 두었다
- **쓰지 않는 것**: 교육 과정 페이지(「Use Resource Monitor to review current resource usage」)와 거기에만 있는 개요(Overview) 탭, 네트워크 탭의 수신 대기 포트·TCP 연결, 하드 폴트, 프로세스 끝내기·거르기의 조작 차례, Windows Server 2008에서 리소스 뷰를 쓰는 데 필요한 권한
- **한국어 이름**: 「리소스 모니터」·「CPU 탭」·「평균 CPU 열」(높은 CPU 문서 한국어판), 「리소스 뷰」(perfmon 한국어판 — step 8 항목은 「리소스 보기」로 옮겼다. 이 step은 한국어판의 말을 따른다), 「안정성 모니터」(perfmon 한국어판). 디스크 탭·네트워크 탭의 한국어 화면 이름은 확인하지 못했다 — 「CPU 탭」과 같은 꼴로 쓴다

쓰인 곳: (phase 80 step 11) `windows-admin-tools.resource-monitor`(네 자원과 프로세스별 실시간 보기, PID, `perfmon /res`와 리소스 뷰, CPU 탭·평균 CPU 최근 60초, 디스크 탭의 파일과 속도, 네트워크 탭의 상대 주소와 보내고 받는 양, 메모리에 올려 둔 양, 작업 관리자보다 자세히, 안정성 모니터 `perfmon /rel`),
도식 `resource-monitor`(네 자원·프로세스별·성능 모니터와), 문항 n277(디스크 탭에서 프로세스별 읽기·쓰기 — 오답의 이벤트 뷰어·데이터 수집기 집합·감사 정책은 step 8·9·10 항목)

## (phase 80 step 11) Microsoft Learn — PowerShell에서 명령 실행하기: Running commands in the shell, about_Pipelines, Get-ChildItem, Get-Service, Get-Process, Set-Location
https://learn.microsoft.com/en-us/powershell/scripting/learn/shell/running-commands
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_pipelines
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-childitem
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-service
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-process
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/set-location

2026-11-16에 IPv4로 내려받아 읽은 판(PowerShell 7.6 판): 「Running commands in the shell」 `updated_at` 2026-07-01(`ms.date` 2026-06-29, 한국어판 2026-10-23), about_Pipelines 2026-01-02(2025-12-28), Get-ChildItem 2026-08-10(2026-08-10),
Get-Service 2026-06-15(2026-02-04), Get-Process 2025-07-24(2025-04-15), Set-Location 2025-07-24(2022-12-12).

- **명령의 세 갈래**(「Running commands in the shell」 첫머리·「Types of commands」): PowerShell은 `bash`나 Windows 명령 셸(`cmd.exe`)처럼, PowerShell 명령만이 아니라 시스템에 있는 어떤 명령이든 실행하게 해 준다. 셸의 명령은 셋이다 —
  셸 언어 키워드(그 셸 안에만 있고 따로 된 실행 파일이 없다. `cmd.exe`의 키워드 예로 `dir`·`copy`·`move`·`if`·`echo`), 운영 체제의 네이티브 명령(운영 체제에 설치된 실행 파일이라 PowerShell 같은 어느 명령줄 셸에서나 실행된다),
  셸 환경에만 있는 명령(PowerShell에서는 모듈이 더하는 cmdlet)
- **네이티브 명령 실행**(같은 문서 「Running native commands」): 어느 네이티브 명령이든 PowerShell 명령줄에서 실행할 수 있고, 보통 `bash`나 `cmd.exe`에서와 똑같이 입력한다. PowerShell에서는 매개 변수가 모두 하이픈(`-`)으로 시작한다 — 「Passing arguments to native commands」
- **`ipconfig.exe`**: PowerShell 프롬프트에서 `ipconfig.exe`를 실행해 그 출력을 cmdlet으로 넘기는 예 — about_Pipelines 「Using pipelines」(파이프라인 자체는 가져오지 않는다. `ipconfig`가 실행 파일 `ipconfig.exe`이고 PowerShell에서 실행된다는 것만 쓴다)
- **cmdlet이 하는 일**: `Get-ChildItem`은 지정한 위치의 항목을 가져오고, 그 항목이 다른 항목을 담는 컨테이너면 그 안의 항목(child items)을 가져온다. 위치(`-Path`)의 기본값은 현재 디렉터리다 — Get-ChildItem 「Description」·「-Path」.
  `Get-Service`는 실행 중인 것과 멈춘 것을 포함해 컴퓨터의 서비스를 나타내는 객체를 가져온다(Windows에서만) — Get-Service 「Description」. `Get-Process`는 로컬 컴퓨터의 프로세스를 가져오고, 매개 변수 없이 쓰면 모든 프로세스를 가져온다 — Get-Process 「Description」.
  `Set-Location`은 작업 위치를 지정한 위치로 바꾼다 — Set-Location 「Description」
- **쓰지 않는 것**: 파이프라인과 `Select-String`, 호출 연산자(`&`)와 `Start-Process`, 인자를 넘기는 규칙(`PSNativeCommandArgumentPassing`), cmdlet의 매개 변수 목록
- **한국어 이름**: 한국어판은 「네이티브 명령」(OS 네이티브 명령)이라 부른다 — 본문은 「실행 파일로 된 명령」으로 풀어 쓴다

쓰인 곳: (phase 80 step 11) `windows-admin-tools.powershell`(명령 프롬프트의 `dir`은 따로 된 실행 파일이 없는 명령이고 PowerShell의 `dir`은 별칭, 실행 파일로 된 명령은 어느 셸에서나 실행된다, `ipconfig`는 `ipconfig.exe`, 매개 변수는 하이픈으로 시작, `Get-ChildItem`·`Get-Service`·`Set-Location`이 하는 일),
도식 `powershell-commands`, 문항 n278(`ipconfig`를 PowerShell에서 실행)·n279(`Get-Process`의 세 꼴 — 대소문자는 step 8 항목의 about_Case-Sensitivity)

## (phase 80 step 8) Microsoft Learn — PowerShell: What is PowerShell?, What is Windows PowerShell?, Migrating from Windows PowerShell 5.1 to PowerShell 7, Differences between Windows PowerShell 5.1 and PowerShell 7.x, Cmdlet Overview, Approved Verbs for PowerShell Commands, about_Aliases, about_Case-Sensitivity, about_Command_Precedence, about_Parsing, about_Scripts, about_Execution_Policies
https://learn.microsoft.com/en-us/powershell/scripting/overview
https://learn.microsoft.com/en-us/powershell/scripting/what-is-windows-powershell
https://learn.microsoft.com/en-us/powershell/scripting/whats-new/migrating-from-windows-powershell-51-to-powershell-7
https://learn.microsoft.com/en-us/powershell/scripting/whats-new/differences-from-windows-powershell
https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/cmdlet-overview
https://learn.microsoft.com/en-us/powershell/scripting/developer/cmdlet/approved-verbs-for-windows-powershell-commands
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_aliases
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_case-sensitivity
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_command_precedence
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_scripts
https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies

2026-11-16에 IPv4로 내려받아 읽은 판(페이지는 기본으로 PowerShell 7.6 판 — `view=powershell-7.6`): 「What is PowerShell?」 `updated_at` 2026-08-12(`ms.date` 2026-08-12), 「What is Windows PowerShell?」 2025-11-21(2025-11-20), 「Migrating…」 2025-04-16(2024-04-02), 「Differences…」 2026-06-16(2026-02-04),
「Cmdlet Overview」 2026-07-13(2026-07-13), 「Approved Verbs…」 2026-03-31(2026-03-30), about_Aliases 2025-09-29(2017-11-27), about_Case-Sensitivity 2026-01-06(2026-01-06), about_Command_Precedence 2026-01-19(2026-01-18), about_Parsing 2026-07-01(2026-06-29), about_Scripts 2025-09-29(2020-10-06), about_Execution_Policies 2026-09-01(2026-08-31). 한국어판도 받았다(기계 번역).

- **PowerShell**은 명령줄 셸·스크립트 언어·구성 관리 틀로 이루어진 작업 자동화 도구이고 Windows·Linux·macOS에서 돈다. 셸로서는 명령 기록, Tab 자동 완성, 명령과 매개 변수의 별칭, 명령을 잇는 파이프라인(이름만 — 가져오지 않는다), 콘솔 안의 도움말을 갖춘다.
  대부분의 셸이 글자를 받고 글자를 내놓는 것과 달리 PowerShell은 .NET 개체를 받고 내놓는다. 스크립트 언어로서는 주로 시스템 관리를 자동화하는 데 쓴다 — 「What is PowerShell?」 「Command-line Shell」·「Scripting language」
- **cmdlet**: PowerShell 고유의 명령을 cmdlet이라 부른다. 동작을 하나 하고 대개 .NET 개체를 다음 명령에 돌려준다 — 「Cmdlet Overview」. cmdlet 이름은 **동사-명사** 짝이다 — 동사는 하는 동작을, 명사는 그 동작의 대상을 가리킨다(예를 들어 `Get-Command`는 등록된 명령을 가져온다) — 「Approved Verbs for PowerShell Commands」 첫머리
- **별칭**(alias): cmdlet이나 함수·스크립트·실행 파일 같은 명령에 붙인 다른 이름이고, 명령 이름 대신 쓸 수 있다. 기본으로 들어 있는 별칭으로 `cd`·`chdir` → `Set-Location`, Windows에서 `ls`·`dir` → `Get-ChildItem`이 있고, `Get-Alias`로 모든 별칭을 본다 — about_Aliases 「Long description」·「Built-in aliases」.
  `copy` 같은 다른 별칭은 이 step에서 확인하지 않았다 — 본문은 `dir`·`cd`를 예로 쓴다
- **실행 파일로 된 명령**: 경로를 적으면 어떤 실행 파일이든 실행하고, 경로 없이 이름만 적으면 $Env:PATH에 든 디렉터리의 것만 실행한다(현재 디렉터리의 것은 `.\`를 붙인다). 경로 없이 적은 이름은 별칭 → 함수 → cmdlet → 외부 실행 파일(PowerShell 스크립트 포함) 차례로 찾는다 — about_Command_Precedence 「Long description」.
  PowerShell 명령이 아닌 프로그램(네이티브 명령)도 PowerShell에서 부를 수 있고, 인자는 PowerShell이 먼저 해석해 넘긴다 — 문서의 예는 `icacls.exe` — about_Parsing 「Passing arguments to native commands」. `ipconfig`·`ping`을 PowerShell에서 실행하는 예를 보이는 PowerShell 문서는 찾지 못했다
- **대소문자**: PowerShell은 할 수 있는 곳에서는 대소문자를 가리지 않고, 적은 대로의 대소문자는 보존한다. 모든 시스템에서 가리지 않는 것 — 변수 이름, 연산자 이름, PowerShell 명령과 별칭을 찾는 일(외부 스크립트·응용 프로그램은 빼고), 매개 변수 이름과 그 별칭, 언어 키워드 등.
  Windows는 대부분의 작업에서 대소문자를 가리지 않고, Windows가 아닌 시스템은 파일 시스템·환경 변수에서 가린다 — about_Case-Sensitivity. 그래서 `Get-Service`와 `get-service`는 같은 cmdlet을 찾는다(PowerShell 명령을 찾는 일 — 위 줄)
- **스크립트**: 하나 이상의 PowerShell 명령을 담은 일반 텍스트 파일이고 확장자는 `.ps1`이다. 스크립트를 실행하는 것은 cmdlet을 실행하는 것과 비슷하다(경로와 파일 이름을 적고 매개 변수를 준다). 명령을 저장해 두었다가 다시 쓰고 나누게 해 준다 — about_Scripts 「Long description」.
  같은 명령을 셸(콘솔)에 하나씩 입력해 실행할 수도 있다 — 「What is PowerShell?」(명령줄 셸)
- **실행 정책**: PowerShell이 구성 파일을 불러오고 스크립트를 실행하는 조건을 정하는 안전 기능이다. 보안 경계가 아니라, 사용자가 모르고 규칙을 어기지 않게 돕는 장치다 — about_Execution_Policies 「Long description」.
  **Windows Server의 기본값은 RemoteSigned**다(스크립트는 실행되지만, 인터넷에서 받은 스크립트와 구성 파일은 믿을 만한 게시자의 디지털 서명이 있어야 한다). 모든 범위가 Undefined면 실제로 걸리는 정책은 Windows 클라이언트에서 Restricted(명령은 하나씩 되지만 스크립트는 실행하지 않는다), Windows Server에서 RemoteSigned다 — 같은 문서 「RemoteSigned」·「Restricted」·「Undefined」 줄.
  같은 문서의 「Default」 줄은 「Windows 클라이언트와 서버 모두 RemoteSigned」로, 「RemoteSigned」 줄은 「Windows 컴퓨터의 기본」으로, 「Remove the execution policy」 절은 「Restricted가 Windows 클라이언트의 기본」으로 적어 클라이언트의 기본값이 문서 안에서 갈리고, about_Scripts(2020-10-06)는 기본값을 Restricted로 적는다 — 본문은 Windows Server의 기본값(RemoteSigned)만 쓰고 클라이언트의 기본값은 단정하지 않는다. Windows가 아닌 시스템에서는 Unrestricted로 고정이다
- **Windows PowerShell 5.1과 PowerShell 7**: 둘은 별개의 제품이다. Windows에 함께 들어 있는 판이 Windows PowerShell이고, .NET Framework 위에서 돌며 마지막 판이 5.1이다(새 기능은 더하지 않는다). PowerShell(6부터, 지금 7)은 새 .NET 위에서 돌고 Windows·Linux·macOS에서 쓴다 — 「What is Windows PowerShell?」.
  PowerShell 7은 Windows PowerShell 5.1과 다른 디렉터리에 설치되므로 두 판을 한 컴퓨터에서 함께 쓸 수 있다. 실행 파일 이름은 Windows PowerShell이 `powershell.exe`, 6 이후가 `pwsh.exe`다 — 「Migrating from Windows PowerShell 5.1 to PowerShell 7」. 두 판 사이 언어의 차이는 적다 — 「Differences…」 첫머리
- 명령 프롬프트와의 관계: phase 71 「Microsoft Learn — Windows commands, ping, Task Manager」 항목(Windows의 명령줄 셸은 명령 셸과 PowerShell 둘)
- **「DOS 명령」**: 이 step이 읽은 PowerShell 문서는 「DOS」라는 말을 쓰지 않는다. 문서가 쓰는 말은 별칭(`dir`·`cd`)과 네이티브 명령(실행 파일)이다 — 본문은 이 둘로 쓴다
- **한국어 이름**: 「별칭」(about_Aliases 한국어판), 「대/소문자」(about_Case-Sensitivity 한국어판 — 본문은 「대소문자」로 쓴다), 「실행 정책」(about_Execution_Policies 한국어판), cmdlet은 한국어판도 영문 그대로

쓰인 곳: (phase 80 step 11에서 쓰일 곳) `windows-admin-tools.powershell`(셸이자 스크립트 언어, 개체, cmdlet과 동사-명사, 별칭 `dir`·`cd`, 실행 파일로 된 명령, 대소문자, `.ps1`과 대화형, 실행 정책의 Windows Server 기본값, 5.1과 7, 「DOS 명령」이라는 말을 쓰지 않음),
기출 대조(`exam-notes.md` 「phase 80 step 8」 문단 — [기출 2024-11-03 #31]·[기출 2026-08-02 #30])
(phase 80 step 11) `windows-admin-tools.powershell`(위 줄들 — 셸이자 스크립트 언어로 관리 작업을 자동화한다, cmdlet과 동사-명사, 결과가 객체다, 별칭 `dir` → `Get-ChildItem`·`cd` → `Set-Location`·`Get-Alias`, 이름만 적은 명령을 찾는 차례와 PATH, 대소문자, `.ps1`과 대화형, 실행 정책의 Windows Server 기본값 RemoteSigned, 5.1과 7·`powershell.exe`·`pwsh.exe`. 「DOS」라는 말은 쓰지 않았다. 네이티브 명령과 cmdlet 설명은 아래 「(phase 80 step 11) … PowerShell에서 명령 실행하기」 항목), 도식 `powershell-commands`, 문항 n278·n279

## (phase 80 step 8) Microsoft Learn — 인증서와 파일 형식: Inspect certificates and manage certificate store contents, Export a certificate with its private key in Windows Server, Request and renew certificates with Certificates MMC, Export-Certificate, Export-PfxCertificate; .NET Framework 문서 — How to: View certificates with the MMC snap-in
https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/inspect-certificates-manage-certificate-stores
https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/export-certificate-private-key
https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/request-renew-certificates-certificates-mmc
https://learn.microsoft.com/en-us/powershell/module/pki/export-certificate
https://learn.microsoft.com/en-us/powershell/module/pki/export-pfxcertificate
https://learn.microsoft.com/en-us/dotnet/framework/wcf/feature-details/how-to-view-certificates-with-the-mmc-snap-in

2026-11-16에 IPv4로 내려받아 읽은 판: 「Inspect certificates…」·「Request and renew…」 `updated_at` 2026-10-02(`ms.date` 2026-08-17), 「Export a certificate with its private key…」 2025-09-11(2025-05-14) — 셋 다 「Applies to」 Windows Server 2016~2025(첫 문서는 Windows Server 2025의 화면으로 쓴다),
Export-Certificate·Export-PfxCertificate 2025-05-29(2016-12-20, pki 모듈), .NET Framework 문서 2026-03-30(2019-02-25). 한국어판도 받았다(`updated_at` 2026-01~2026-10, 기계 번역).

- 인증서·공개 키·개인 키의 뜻은 phase 78의 「RFC 5280」 항목과 `app-protocols-mgmt-security.tls`가 쓴 그대로다 — 다시 찾지 않았다
- **인증서 저장소**는 사용자·컴퓨터·서비스가 기대는 인증서를 Windows가 두는 자리다. 범위는 셋이다 — **현재 사용자**(로그인한 사용자에 딸린 저장소 — `certmgr.msc`로 연다), **로컬 컴퓨터**(그 컴퓨터에 딸려 그 컴퓨터의 사용자들이 쓰는 저장소 — `certlm.msc`로 연다), 서비스 계정(`mmc`에 인증서 스냅인을 더하며 고른다).
  현재 사용자 저장소는 개인(Personal)을 빼고 로컬 컴퓨터 저장소의 내용을 물려받는다 — 「Inspect certificates…」 「Understand certificate-store scopes」·「Open the Certificates MMC snap-in」. 현재 사용자 저장소는 로그인한 사용자의 맥락에서 쓰는 인증서의 자리다 — 「Request and renew…」 「Choose the certificate store scope」
- `certmgr.msc`로 여는 도구에서 현재 사용자의 인증서를 보고, 내보내고, 가져오고, 지운다 — .NET Framework 문서 「View certificates with the Certificate Manager tool」(실행 창에 `certmgr.msc`). 관리자가 아니면 자기 사용자 계정의 인증서만 관리한다 — 같은 문서 「View certificates in the MMC snap-in」 Note
- **공개 인증서만 내보내는 형식**(「Inspect certificates…」 「Export a public certificate」 표 — 파일 확장자 — Export-Certificate의 형식 이름 — 담는 것):
  - `.cer` — CERT — DER로 부호화한 공개 인증서 하나
  - `.p7b` — P7B — PKCS #7 형식으로 담은 인증서 하나 이상
  - `.sst` — SST — Microsoft의 직렬화된 인증서 저장소에 담은 인증서 하나 이상
  이 셋(Export-Certificate)은 **공개 인증서만** 내보내고 개인 키는 넣지 않는다. Import-Certificate는 `.sst`·`.p7b`·`.cer` 파일을 가져오며 PFX와 개인 키는 가져오지 않는다 — 같은 절과 「Import a public certificate」
- **PFX**(Personal Information Exchange, PKCS #12): 공개 인증서 내보내기와 달리 **개인 키까지** 담을 수 있다. Export-PfxCertificate로 PFX를 내보내려면 암호나 `-ProtectTo`(보호할 대상) 가운데 하나가 있어야 하고, 담을 개인 키가 내보낼 수 있게 되어 있을 때만 성공한다.
  `.cer`·`.p7b`·`.sst`를 개인 키 백업으로 여기지 말라고 한다. Import-PfxCertificate는 기본으로 개인 키를 다시 내보낼 수 없게 가져온다 — 「Inspect certificates…」 「Export a PFX only when you need the private key」·「Import a PFX…」. Export-PfxCertificate는 기본으로 확장 속성과 인증 경로 전체를 함께 내보낸다 — Export-PfxCertificate 「Description」
- **마법사로 개인 키까지 내보내기**(「Export a certificate with its private key…」, Windows Server 2016~2025): 로컬 컴퓨터의 인증서 관리 콘솔(`certlm.msc`)을 열고 → 내보낼 인증서를 오른쪽 클릭해 모든 작업 → 내보내기 → 인증서 내보내기 마법사에서 개인 키를 내보낸다고 고르고 →
  파일 형식으로 개인 정보 교환 - PKCS #12(.PFX)를 고르고(인증 경로의 인증서를 모두 넣는 확인란이 있다) → 개인 키를 지킬 암호와 암호화 방식을 정하고 → 파일 이름을 정한다. 내보낼 개인 키가 그 저장소에 함께 설치되어 있어야 한다 — 「Prerequisites」
- **한국어 이름**: .NET Framework 문서 한국어판은 `certmgr.msc`로 여는 도구를 「인증서 관리자 도구」로, Windows Server 문서 한국어판은 MMC의 「인증서 스냅인」으로 부른다. 「인증서 내보내기 마법사」, 「개인 정보 교환 - PKCS #12(.PFX)」(Export a certificate with its private key 한국어판).
  한국어판은 private key를 「프라이빗 키」로 옮기지만 이 과목은 phase 78부터 「개인 키」를 쓴다. 고른 이름: 기출이 쓰는 「인증서 관리자」(`certmgr.msc`)를 세우고, MMC의 인증서 스냅인이라는 것을 한 줄로 밝힌다

쓰인 곳: (phase 80 step 12에서 쓰일 곳) `windows-admin-tools.certificate-manager`(인증서 저장소의 범위 — `certmgr.msc`·`certlm.msc`, 보고·내보내고·가져오고·지운다, 형식 넷과 개인 키를 담는지, PFX 내보내기의 조건과 마법사 차례),
`windows-admin-tools.efs`(EFS 키를 `.pfx`로 백업), 기출 대조(`exam-notes.md` 「phase 80 step 8」 문단과 E38 — [기출 2024-08-25 #37], [기출 2024-02-25 #39])
(phase 80 step 12) `windows-admin-tools.certificate-manager` — 인증서 저장소의 범위 셋, `certmgr.msc`(인증서 스냅인, 보고·내보내고·가져오고·지운다, 관리자가 아니면 자기 계정의 인증서만)과 `certlm.msc`, 형식 넷과 개인 키를 담는지(`.pfx`는 PKCS #12·암호로 보호·개인 키가 내보낼 수 있게 되어 있을 때만), 인증서 내보내기 마법사의 차례(Windows Server 문서가 보이는 `certlm.msc`의 차례라고 밝혔다).
  공개 키·개인 키·서명·인증 기관의 뜻은 phase 78 `app-protocols-mgmt-security.tls`의 말과 맞췄다. 도식 `certificate-files`, 문항 n280

## (phase 80 step 8) Microsoft Learn — EFS·BitLocker: File Encryption(Win32), cipher, Back up the recovery agent EFS private key in Windows, Personal Data Encryption overview, Smart Card and Remote Desktop Services, BitLocker overview, BitLocker recovery overview, BitLocker FAQ, Install BitLocker on Windows Server
https://learn.microsoft.com/en-us/windows/win32/fileio/file-encryption
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/cipher
https://learn.microsoft.com/en-us/troubleshoot/windows-server/certificates-and-public-key-infrastructure-pki/back-up-recovery-agent-efs-private-key
https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/personal-data-encryption/
https://learn.microsoft.com/en-us/windows/security/identity-protection/smart-cards/smart-card-and-remote-desktop-services
https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/
https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/recovery-overview
https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/faq
https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/install-server

2026-11-16에 IPv4로 내려받아 읽은 판: 「File Encryption」(Win32) `updated_at` 2025-07-10(`ms.date` 2025-07-08), 「cipher」 2026-02-16(2017-10-16, 「Applies to」 Windows Server 2016~2025·Windows 11·10),
「Back up the recovery agent EFS private key…」 2026-02-18(2026-02-12, 적용 대상 — 지원되는 모든 Windows Server. 본문의 차례는 Windows Server 2003~2008 R2의 화면이라 **차례가 아니라 키의 구조와 백업 권고만** 가져온다), 「Personal Data Encryption overview」 2025-07-21(2025-03-12, Windows 11),
「Smart Card and Remote Desktop Services」 2026-10-08(2024-10-29, Windows 11·10·Windows Server 2016~2025), BitLocker 넷 2026-10-08(`ms.date` 개요 2026-08-24, 복구 2025-07-29, FAQ 2026-06-01, 서버 설치 2025-07-29 — 개요·복구·FAQ는 Windows 11·10·Windows Server 2016~2025, 서버 설치는 Windows Server 2016~2025). 한국어판도 받았다(`updated_at` 2026-07~2026-10, 기계 번역).

- **EFS**(Encrypting File System — 「File Encryption」은 Encrypted File System으로도 적는다): NTFS 볼륨에 있는 파일을 한 개씩 공개 키 방식으로 암호화한다. 문서가 드는 쓰임: 파일과 디렉터리의 접근 제어만으로는 데이터가 든 노트북을 잃거나 도둑맞았을 때 지키기 어려우므로, 파일 자체를 암호화해 한 겹 더 지킨다 — 「File Encryption」 첫머리
- **암호화할 수 없는 것**: 압축된 파일, 시스템 파일, 시스템 디렉터리, 루트 디렉터리, 트랜잭션(희소 파일은 된다) — 「File Encryption」 「Working with EFS」. 곧 EFS는 시스템 파일에 쓰는 기능이 아니다
- **켜는 자리**: 파일 속성 → 일반 탭 → 고급을 누르면 고급 특성 창이 뜬다. EFS로 보호한 파일은 그 창의 자세히에서 「이 파일에 액세스할 수 있는 사용자」마다 인증서 지문이, 복구 정책이 정한 복구 인증서가 보인다. EFS는 **인증서**로 파일을 보호한다 — 「Personal Data Encryption overview」 「Differences between Personal Data Encryption and EFS」(Windows 11 문서).
  고급 특성 창의 「내용을 암호화」 확인란 이름을 적은 지금 판 문서는 찾지 못했다 — 본문은 「속성 → 고급」의 자리와 `cipher /e`로 쓴다
- **`cipher`**: NTFS 볼륨의 디렉터리와 파일의 암호화 상태를 보이거나 바꾼다(옵션 없이 쓰면 지금 디렉터리의 상태 — E는 암호화됨, U는 아님). `/e` 암호화(디렉터리에 걸면 그 뒤에 더한 파일도 암호화), `/d` 해독, `/k` EFS용 새 인증서와 키를 만든다,
  **`/x` EFS 인증서와 키를 파일로 백업**(`:efsfile`을 붙이면 그 파일을 암호화한 인증서), `/r` 복구 에이전트의 키와 인증서를 만들어 `.pfx`(인증서와 개인 키)와 `.cer`(인증서만) 파일로 쓴다 — `/smartcard`를 붙이면 스마트 카드에 쓰고 `.pfx`는 만들지 않는다, `/y` 지금 EFS 인증서의 지문 — 「cipher」 「Parameters」.
  부모 디렉터리가 암호화되지 않으면 고칠 때 파일이 풀릴 수 있으니 부모 디렉터리도 암호화하라 — 「Remarks」
- **키와 복구**(「Back up the recovery agent EFS private key…」 「Introduction」): EFS는 파일마다 만든 암호화 키로 파일을 암호화하고, 그 키를 사용자의 EFS **공개 키**로 암호화해 파일에 붙인다. 파일을 열려면 그 공개 키와 짝인 사용자의 EFS **개인 키**가 있어야 한다.
  개인 키를 잃으면 **복구 에이전트**로 되살린다 — 파일을 암호화할 때마다 그 파일의 키를 복구 에이전트의 공개 키로도 암호화해 붙여 두므로, 복구 에이전트의 개인 키로 열 수 있다. 복구 에이전트의 개인 키는 인증서 내보내기 마법사로 PKCS #12(.PFX) 파일로 내보내 안전한 곳에 따로 보관하라고 한다 — 「Introduction」의 내보내기 차례
- **Windows를 다시 설치하면**: 같은 사용자 이름의 계정을 새로 만들어도 열리지 않는다고 그대로 적은 문서는 찾지 못했다. 위 줄 — 파일을 열려면 그 공개 키와 짝인 **개인 키**가 있어야 한다 — 에서 판정한다(이름이 아니라 키가 필요하다). 그래서 키를 `cipher /x`나 인증서 내보내기(`.pfx`)로 백업해 둔다
- **스마트 카드**: EFS는 사용자의 스마트 카드 판독기에서 인증서를 찾고, 판독기나 인증서를 찾지 못하면 사용자 파일을 해독하지 못한다 — 「Smart Card and Remote Desktop Services」 첫머리 목록(Windows Server 2016~2025). 곧 EFS의 키는 스마트 카드에 둘 수 있다. 복구 에이전트의 키도 `cipher /r … /smartcard`로 스마트 카드에 쓴다(위 줄)
- **BitLocker**: **볼륨 전체**를 암호화하는 Windows 보안 기능이고, 잃어버리거나 도둑맞거나 제대로 폐기하지 않은 기기의 데이터가 새는 것을 막는다. 잃은 기기의 데이터는 공격 도구를 돌리거나 **하드 드라이브를 다른 기기로 옮겨 붙여** 읽힐 수 있는데, BitLocker가 이를 막는다 — 「BitLocker overview」 첫머리
- **TPM**(신뢰할 수 있는 플랫폼 모듈): Windows 기기에 흔히 들어 있는 하드웨어 부품이고, 기기가 꺼진 동안 변조되지 않았는지 BitLocker와 함께 확인한다. BitLocker는 TPM과 함께 쓸 때 가장 강하고, TPM에 더해 PIN이나 시작 키가 든 이동식 장치를 요구할 수도 있다.
  TPM이 없으면 시작 키(이동식 드라이브에 둔 파일)나 암호로 운영 체제 드라이브를 암호화하지만 시작 전 무결성 확인은 없다 — 「BitLocker overview」 「BitLocker and TPM」
- **복구**: 복구 암호(recovery password)는 복구 모드에 들어간 볼륨을 여는 **48자리 숫자**이고, 텍스트 파일로 저장하거나 인쇄하거나 Microsoft Entra ID·Active Directory에 저장한다. 복구 키(recovery key)는 이동식 미디어에 저장한 암호화 키다(파일 이름 `<보호기 ID>.bek`) — 「BitLocker recovery overview」의 복구 수단 목록
- **BitLocker To Go**: 이동식 데이터 드라이브 — USB 플래시 드라이브, SD 카드, 외장 하드 디스크 — 의 BitLocker 드라이브 암호화다 — 「BitLocker FAQ」 「What is BitLocker To Go?」
- **Windows Server**: 어느 판에도 기본으로 설치되어 있지 않고, 서버 관리자의 역할 및 기능 추가 마법사(기능에서 BitLocker 드라이브 암호화)나 PowerShell로 설치한다. 관리자 권한이 필요하다 — 「Install BitLocker on Windows Server」 첫머리·「Install BitLocker with Server Manager」
- **EFS와 BitLocker**(「BitLocker FAQ」 「Can I use EFS with BitLocker?」): **함께 쓸 수 있다** — BitLocker로 보호한 드라이브의 파일을 EFS로 암호화할 수 있다. BitLocker는 운영 체제 드라이브 전체를 오프라인 공격(기기가 꺼진 동안의 공격)에서 지키고, EFS는 같은 컴퓨터를 쓰는 여러 사용자 사이를 가르는 사용자 단위 파일 암호화를 더한다.
  EFS는 BitLocker로 암호화하지 않은 다른 드라이브의 파일에도 쓸 수 있다. EFS의 근본 비밀은 기본으로 운영 체제 드라이브에 있어서, 운영 체제 드라이브에 BitLocker를 켜면 다른 드라이브의 EFS 데이터도 간접으로 보호된다
- **한국어 이름**: 「암호화 파일 시스템」(File Encryption 한국어판), 「복구 에이전트」(EFS 복구 에이전트 문서 한국어판), 「BitLocker 드라이브 암호화」·「이동식 데이터 드라이브」(BitLocker FAQ 한국어판), 「복구 키」·「복구 암호」(복구 개요 한국어판), 「TPM(신뢰할 수 있는 플랫폼 모듈)」(BitLocker 개요 한국어판).
  고급 특성 창과 그 안의 항목, cipher 옵션 설명의 한국어 화면 이름은 확인하지 못했다 — 뜻을 옮긴 말로 쓴다

쓰인 곳: (phase 80 step 12에서 쓰일 곳) `windows-admin-tools.efs`(NTFS·파일 단위·공개 키 방식, 노트북 분실의 예, 암호화할 수 없는 것, 속성 → 고급과 `cipher /e`, 인증서와 개인 키 — 다른 사용자는 못 연다, 키를 잃으면 못 연다와 백업 `cipher /x`·`.pfx`, 복구 에이전트, 스마트 카드),
(phase 80 step 12) `windows-admin-tools.efs` — 위 줄의 사실 전부(NTFS 볼륨·파일 단위·공개 키 방식, 노트북 분실의 예, 암호화할 수 없는 것, 고급 특성 창과 `cipher`의 옵션 없음·`/e`·`/d`·`/x`·부모 폴더, 파일 키와 개인 키 — 다른 사용자는 못 연다, 다시 설치와 백업, 복구 에이전트, 스마트 카드), E38의 「자격시험은」 줄, BitLocker와의 차이 한 줄(「BitLocker FAQ」).
  고급 특성 창에서 켜고 끄는 확인란의 이름(영문 화면 「Encrypt contents to secure data」)은 learn.microsoft.com 안에서도 Microsoft Q&A 답변에만 보여(2026-11-16 Microsoft Learn 검색) 쓰지 않았다 — 본문은 창의 자리와 `cipher /e`로만 쓴다. 도식 `efs-key-backup`, 문항 n281
(phase 80 step 13에서 쓰일 곳) `windows-admin-tools.bitlocker`(볼륨 전체·도난·드라이브를 옮겨 붙이기, TPM, 복구 암호 48자리와 복구 키, BitLocker To Go, Windows Server의 기능 설치, EFS와 함께 쓰기와 차이),
기출 대조(`exam-notes.md` 「phase 80 step 8」 문단과 E38 — [기출 2024-02-25 #39], [기출 2024-08-25 #28])

(phase 80 step 13, 2026-11-16 Microsoft Learn에서 「BitLocker FAQ」(https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/faq — 위 줄과 같은 판)를 다시 받고, 「BitLocker operations guide」(https://learn.microsoft.com/en-us/windows/security/operating-system-security/data-protection/bitlocker/operations-guide, Windows 11·10·Windows Server 2016~2025) 「Enable BitLocker」를 찾아 확인)
- **읽고 쓰기**: BitLocker는 드라이브 전체를 한꺼번에 풀지 않는다 — 읽기 요청이 온 부분만 그때 풀고, 쓰는 블록은 디스크에 적기 전에 암호화하며, 보호한 드라이브에는 암호화되지 않은 데이터가 남지 않는다 — 「Does BitLocker encrypt and decrypt the entire drive all at once when reading and writing data?」
- **TPM이 키를 내주지 않는 때**: 운영 체제 드라이브의 무결성 확인이 실패하면 TPM이 드라이브를 풀 키를 내주지 않는다. 실패하게 하는 변화의 첫째가 BitLocker로 보호한 드라이브를 새 컴퓨터로 옮기는 것이고, 시작 구성·펌웨어·부트 구성 요소를 바꾸는 것도 든다 — 「What system changes would cause the integrity check on the OS drive to fail?」.
  TPM은 자체 펌웨어와 회로로 동작하는 하드웨어 부품이고 TPM은 그것이 든 컴퓨터마다 다르다 — 「What are the advantages of a TPM?」
- **PIN·시작 키**: PIN은 사용자가 정해 컴퓨터를 켜거나 최대 절전에서 돌아올 때마다 넣는 값(숫자 4~20자리)이고, 시작 키는 USB 플래시 드라이브에 담아 컴퓨터를 켤 때마다 꽂는 키다. 둘 다 TPM 인증에 더하는 인증이다 — 「What is the difference between a TPM owner password, recovery password, recovery key, PIN, enhanced PIN, and startup key?」
- **데이터 드라이브**: 데이터 드라이브를 다른 컴퓨터에 붙이면 암호나 스마트 카드로 열 수 있고, 저절로 열리게만(automatic unlock only) 해 둔 데이터 드라이브는 복구 키로 연다 — 「Can I access my BitLocker-protected drive if I insert the hard disk into a different computer?」.
  컴퓨터 안의 데이터 드라이브(fixed data drive)가 저절로 열리게 하려면 운영 체제 드라이브도 BitLocker로 보호되어 있어야 한다 — 「Why am I unable to automatically unlock my drive?」. 데이터 드라이브는 운영 체제를 끄거나 다시 시작하면 잠긴다 — 「How do I "lock" a data drive?」
- **복구**: BitLocker를 켤 때, 정해 둔 잠금 해제 방법을 쓸 수 없을 때(TPM이 부트 구성 요소를 확인하지 못했거나 PIN이나 암호를 잊었을 때) 복구할 방법을 정한다. 복구 암호는 **여덟 묶음으로 나뉜 48자리 숫자**, 복구 키는 USB 플래시 드라이브의 키 파일이다 — 위 질문.
  복구는 TPM을 거치지 않으므로 TPM이 고장 나거나 빠져도 할 수 있다 — 「What causes BitLocker to start into recovery mode…?」. 복구 정보를 잃으면: BitLocker는 필요한 인증 없이는 암호화한 드라이브를 되살릴 수 없게 설계되어 있고, 복구 정보는 안전한 곳에 둔다 — 「If I lose my recovery information, will the BitLocker-protected data be unrecoverable?」.
  복구 키를 파일로 저장할 때는 그 기기가 아닌 곳(네트워크 폴더 같은 곳)에 둔다 — 「BitLocker operations guide」 「Enable BitLocker」의 제어판 차례(차례는 가져오지 않고 이 사실만)
- **이동식 드라이브**: BitLocker To Go로 암호화한 드라이브는 다른 컴퓨터에서 암호나 스마트 카드로 연다 — 「What is BitLocker To Go?」
- **권한**: 운영 체제 드라이브와 컴퓨터 안의 데이터 드라이브에서 BitLocker를 켜고 끄고 설정을 바꾸려면 로컬 Administrators 그룹의 구성원이어야 하고, 이동식 데이터 드라이브는 일반 사용자도 할 수 있다 — 「What user rights are required to use BitLocker?」
- 쓰지 않은 것: 향상된 PIN, 네트워크 잠금 해제, 일시 중단과 해독, TPM 소유자 암호, 키 구조(전체 볼륨 암호화 키·볼륨 마스터 키), 사용한 공간만 암호화, 암호화 알고리즘

쓰인 곳: (phase 80 step 13) `windows-admin-tools.bitlocker` — 위 「BitLocker」·「TPM」·「복구」·「BitLocker To Go」·「Windows Server」·「EFS와 BitLocker」 줄과 이 문단의 사실 전부(읽고 쓰기, TPM이 키를 내주지 않는 때, PIN·시작 키, 데이터 드라이브의 잠금 해제·자동 잠금 해제·다시 잠김·다른 컴퓨터에서 열기, 복구 암호 여덟 묶음 48자리와 복구 키·TPM 없이 복구·잃으면 되살릴 수 없음·기기가 아닌 곳에 저장, To Go를 다른 컴퓨터에서 열기, 권한).
  본문 예는 운영 체제 드라이브를 TPM과 함께 보호하고 `D:`를 저절로 열리게만 해 둔 서버로 썼다 — 데이터 드라이브는 TPM이 아니라 자동 잠금 해제로 열리므로, 「TPM이 `D:`를 연다」로 그리지 않으려고 운영 체제 드라이브를 거치게 했다. 도식 `bitlocker-volume`, 문항 n282

## (phase 80 step 8) Microsoft Learn — 클라우드 폴더(Work Folders): Work Folders overview, Features Removed or No Longer Developed in Windows Server
https://learn.microsoft.com/en-us/windows-server/storage/work-folders/work-folders-overview
https://learn.microsoft.com/ko-kr/windows-server/storage/work-folders/work-folders-overview
https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server

2026-11-16에 IPv4로 내려받아 읽은 판: 「Work Folders overview」 `updated_at` 2025-09-22(`ms.date` 2025-04-16, 「Applies to」 Windows Server 2016~2025·Windows 11·10), 한국어판 「Work Folders 개요」 2026-01-21,
「Features Removed or No Longer Developed in Windows Server」 2026-03-19(2025-09-24, Windows Server 2016~2025).

- **클라우드 폴더**(Work Folders)는 파일 서버를 위한 Windows Server의 **역할 서비스**다. 사용자가 회사 PC뿐 아니라 개인 컴퓨터와 기기(BYOD)에서도 업무 파일을 저장하고 어디서나 쓰게 한다. 사용자 파일은 서버의 **동기화 공유**(sync share)라는 폴더에 두며, 이미 사용자 데이터가 든 폴더를 동기화 공유로 정할 수도 있다 — 「Work Folders overview」 첫머리
- 쓰임(「Common uses」): 업무 파일에 회사·개인 PC와 기기에서 닿는 한 곳, **연결이 끊긴 동안 작업하고 다음에 인터넷이나 인트라넷에 이어지면 중앙 파일 서버와 동기화**, 폴더 리디렉션·오프라인 파일·홈 폴더와 함께 배포, 파일 분류·폴더 할당량 같은 파일 서버 관리 기술로 사용자 데이터 관리,
  **사용자의 PC와 기기에 클라우드 폴더를 암호화하고 잠금 화면 암호를 쓰라고 하는 보안 정책**, 장애 조치 클러스터링으로 고가용성
- **설치 자리**: 클라우드 폴더는 파일 및 스토리지 서비스(File and Storage Services) 역할의 일부다. 역할 및 기능 추가 마법사의 서버 역할 선택에서 파일 및 스토리지 서비스 → 파일 및 iSCSI 서비스를 펼쳐 고른다(또는 `Install-WindowsFeature`). 설치하면 서버 관리자에서 파일 및 스토리지 서비스 아래에 클라우드 폴더 페이지가 생기고,
  동기화 공유를 맡는 Windows Sync Shares 서비스와 SyncShare PowerShell 모듈이 설치된다 — 「Server Manager」. 요구 사항: Windows Server 2012 R2 이상의 서버, 사용자 파일을 둘 NTFS 볼륨, 클라우드 폴더를 두는 파일 서버마다 서버 인증서 — 「Requirements for file servers and network infrastructure」.
  클라이언트는 Windows 10·11이고 기본 위치는 `%USERPROFILE%\Work Folders`다 — 「Requirements for client computers」
- **OneDrive와의 차이**(「Comparison with other sync technologies」 표): 클라우드 폴더는 **파일 서버에 저장된 파일**을 PC·기기와 동기화하고, 클라우드 서비스 칸이 「없음」이며 내부 네트워크의 파일 서버(Windows Server 2012 R2·2016·2019)를 쓴다.
  OneDrive for Business는 Microsoft 365나 SharePoint에 저장된 파일을(클라우드 서비스 — Microsoft 365), OneDrive는 OneDrive에 저장된 개인 파일을(클라우드 서비스 — Microsoft OneDrive) 동기화한다. 오프라인 파일은 회사 네트워크에 닿는 PC와 파일 서버의 파일을 동기화하고 클라우드 폴더로 바꿀 수 있다
- **지원 상태**: 「Features Removed or No Longer Developed in Windows Server」의 「Features no longer in development」·「Features removed」 두 목록에 클라우드 폴더(Work Folders)는 없다(문서 전체에서 「Work Folders」가 한 번도 나오지 않는다)
- **한국어 이름**: 한국어판 「Work Folders 개요」는 제목만 영문이고 본문에서 「클라우드 폴더」(21번)·「작업 폴더」(9번)·「워크 폴더」(6번)를 섞어 쓴다. 기능 표의 이름 자리(클라우드 폴더 cmdlet, 디바이스용 클라우드 폴더 앱)와 설치하면 서버 관리자에 더해지는 페이지 이름은 「클라우드 폴더」이고,
  역할 및 기능 추가 마법사에서 고르는 항목은 「작업 폴더」로 옮겼다. **실제 설치 마법사의 화면 이름은 확인하지 못했다.** 고른 이름: 「클라우드 폴더」 — 한국어판이 가장 많이 쓰고 서버 관리자의 페이지 이름 자리에 쓰며 기출([기출 2024-02-25 #43])이 쓰는 이름이다. 영문 Work Folders를 함께 적고, 「작업 폴더」로도 옮긴다는 것을 한 줄로 밝힐 수 있다.
  이름에 「클라우드」가 붙었지만 파일은 회사 파일 서버의 동기화 공유에 있다(위 비교 표). 「동기화 공유」, 「파일 및 스토리지 서비스」(한국어판 — 이 과목의 다른 주제가 이 역할을 다루지 않아 본문은 한국어판 표기를 따른다)

쓰인 곳: (phase 80 step 13에서 쓰일 곳) `windows-admin-tools.work-folders`(역할 서비스, 회사·개인 기기와 BYOD, 동기화 공유, 오프라인 작업 뒤 동기화, 암호화·잠금 화면 암호 정책, 설치 자리, OneDrive와의 차이, 지원 상태, 한국어 이름), 기출 대조(`exam-notes.md` 「phase 80 step 8」 문단 — [기출 2024-02-25 #43])

(phase 80 step 13, 2026-11-16 Microsoft Learn에서 「Work Folders overview」를 다시 받아 확인 — 위 줄과 같은 판) 클라이언트 PC에는 사용자의 클라우드 폴더 파일을 **모두 담을 만큼 빈 공간**이 로컬 NTFS 드라이브에 있어야 한다 — 「Requirements for client computers」(오프라인에서 파일을 열고 고칠 수 있는 까닭을 말할 때 쓴다).
서버 관리자의 파일 및 스토리지 서비스는 동기화 공유를 만들고, 클라우드 폴더를 살피고, 동기화 공유와 사용자의 접근을 관리하는 자리다 — 「Features」의 「Role service in Server Manager」. OneDrive for Business가 쓰는 클라우드 서비스는 Microsoft 365다 — 「Comparison with other sync technologies」 표.
쓰지 않은 것: 인터넷 너머 동기화의 요구 사항(역방향 프록시·AD FS), 서버 인증서, 파일 크기 한도, 장애 조치 클러스터링, 폴더 리디렉션·오프라인 파일·홈 폴더와 함께 배포

쓰인 곳: (phase 80 step 13) `windows-admin-tools.work-folders` — 위 줄의 사실 전부(역할 서비스, 회사·개인 기기와 BYOD, 동기화 공유, 클라이언트의 기본 위치 `%USERPROFILE%\Work Folders`, 오프라인 작업 뒤 동기화와 클라이언트의 빈 공간, 암호화·잠금 화면 암호 정책, 파일 및 스토리지 서비스 아래 설치 자리와 `Install-WindowsFeature`·클라우드 폴더 페이지에서 동기화 공유와 사용자 접근 관리·NTFS 볼륨, OneDrive와 OneDrive for Business와의 차이, 지원 상태, 한국어 이름 — 「작업 폴더」로도 옮긴다는 것 한 줄).
  설치 차례는 서버 역할 선택에서 파일 및 스토리지 서비스를 펼친 뒤 그 아래 항목에서 고른다고만 썼다 — 중간 단계 「파일 및 iSCSI 서비스」는 iSCSI를 이 주제에서 풀 근거가 없어 이름을 쓰지 않았다. 도식 `work-folders-sync`, 문항 n283

(phase 81 step 0, 2026-11-18 Microsoft Learn에서 IPv4로 다시 받아 확인) 「Features Removed or No Longer Developed in Windows Server」는 위 줄 뒤에 판이 바뀌었다 — `updated_at` 2026-11-17(`ms.date` 2026-11-16), 「Applies to」 Windows Server 2028 Preview·2025·2022·2019·2016, 한국어판 `updated_at` 2026-11-17.
두 절(「Features no longer in development」, 「Features removed」)이 판마다 탭으로 나뉜다 — 줄마다 어느 탭에 있는지는 페이지 HTML의 탭 id(`tabpanel_1_ws22`처럼 절 번호와 판)로 확인했다. 두 절의 첫 문단이 둘을 가른다 — **더 개발하지 않음**(deprecated)은 더는 새로 개발하지 않고 다음 판에서 뺄 수 있지만 아직 제품에 들어 있고 운영에 지원되며 보안·품질 업데이트를 받는 것이고,
**제거됨**(removed)은 그 판의 설치 이미지에서 빠져 더는 쓸 수 없는 것이다. Windows Server 2028은 Preview라 목록이 바뀔 수 있다고 탭마다 적는다. 이 phase의 두 주제에 걸린 줄:
- **WINS**(Windows Internet Name Service): 「Features no longer in development」의 **Windows Server 2022** 탭 — 옛(레거시) 컴퓨터 이름 등록·풀이 서비스이니 DNS로 바꾸라. 「Features removed」의 **Windows Server 2028(Preview)** 탭 — WINS 서버 역할은 2022부터 더 개발하지 않다가 2028에서 빠진다. WINS에 기대는 클라이언트와 서비스를 DNS 이름 풀이로 옮기라
- **DirectAccess**: 「Features removed」의 **Windows Server 2028(Preview)** 탭 — 2028에서 빠지니 Always On VPN으로 옮기라. 「Features no longer in development」의 어느 탭에도 없다
- **PPTP·L2TP를 통한 원격 액세스**: 「Features removed」의 **Windows Server 2028(Preview)** 탭 — 2028에서 빠지니 IKEv2나 SSTP로 옮기라
- **웹 응용 프로그램 프록시**(Web Application Proxy): 두 절 어디에도 나오지 않는다
- **Hyper-V 쪽 줄**: 「Features no longer in development」 — Windows Server 2022 탭에 LBFO 팀에 묶는 Hyper-V 가상 스위치(대신 SET로 묶는다)와 Guarded Fabric·차폐된 VM, Windows Server 2019 탭에 Hyper-V의 Key Storage Drive와 WFP 경량 필터 스위치 확장.
  「Features removed」 — Windows Server 2028(Preview) 탭에 레거시 BIOS 지원(2028을 게스트로 쓰는 VM은 2세대 Hyper-V VM이어야 한다 — 옛 게스트 운영 체제를 1세대 VM에서 실행하는 지원은 그대로다)과 차폐된 VM, Windows Server 2019 탭에 Hyper-V 네트워크 가상화(HNV — SDN에 들어갔다)
- **Nano Server**: 「Features removed」의 **Windows Server 2019** 탭 — Nano Server 설치 옵션. 설치할 수 있는 호스트 운영 체제로는 더 나오지 않고 컨테이너 운영 체제로만 나온다(Windows 컨테이너 기본 이미지 문서를 가리킨다)
- 이웃 줄 — 「Features removed」의 Windows Server 2025 탭에 IIS 6 관리 콘솔(2019부터 더 개발하지 않음), Windows Server 2019 탭에 Server Core 설치 옵션의 인쇄 구성 요소(다시 기본으로 꺼져 있고 `Install-WindowsFeature Print-Server`로 켠다)
- 클라우드 폴더(Work Folders)는 이 판에서도 두 절 어디에도 없다

(phase 81 step 4, 2026-11-18 IPv4로 다시 받아 확인 — 위 「(phase 81 step 0)」 줄과 같은 판, `updated_at` 2026-11-17) 웹 응용 프로그램 프록시(Web Application Proxy)는 여전히 두 절 어디에도 없고, DirectAccess·PPTP와 L2TP를 통한 원격 액세스 줄(「Features removed」의 Windows Server 2028(Preview) 탭)도 위 줄 그대로다.
IIS 쪽으로는 IIS 6 관리 호환성 구성 요소(IIS 6 메타베이스 호환성·IIS 6 관리 콘솔 등)와 IIS 다이제스트 인증이 목록에 있다 — 이 phase의 개념(IIS 관리자·사이트·요청 필터링·로그·FTP)이 쓰는 구성 요소는 아니어서 탭을 따로 적지 않는다. 근거로 쓴 곳은 아래 「(phase 81 step 4) … 원격 액세스·VPN·DirectAccess·웹 응용 프로그램 프록시」 항목

(phase 81 step 9, 2026-11-18 IPv4로 다시 받아 확인 — 위 「(phase 81 step 0)」 줄과 같은 판, `updated_at` 2026-11-17) Hyper-V 쪽 줄과 Nano Server 줄은 위 「(phase 81 step 0)」 줄 그대로다 — Nano Server 설치 옵션은 「Features removed」의 Windows Server 2019 탭(페이지 HTML의 탭 id `tabpanel_2_ws19`)에 있고, 설치할 수 있는 호스트 운영 체제가 아니라 컨테이너 운영 체제로만 나온다며 Windows 컨테이너 기본 이미지 문서를 가리킨다.
실시간 마이그레이션·저장소 마이그레이션·검사점·Windows 컨테이너는 두 절 어디에도 없다. Hyper-V 복제본은 이름만 한 번 나온다 — 「Features removed」의 Windows Server 2028(Preview) 탭에서 차폐된 VM을 대신할 신뢰할 수 있는 VM의 미리 보기가 장애 조치 클러스터와 Hyper-V 복제본을 아직 지원하지 않는다는 말이고, 복제본 기능 자체가 빠지거나 개발이 멈춘다는 줄은 아니다. 근거로 쓴 곳은 아래 「(phase 81 step 9)」 항목들

쓰인 곳: (phase 81 step 0에서 쓰일 곳) `windows-server-roles.dhcp-server-role`(WINS의 지원 상태 — 2022부터 더 개발하지 않음, 2028 Preview에서 제거), `windows-server-roles.file-print-services`(Server Core의 인쇄 구성 요소 줄 — 쓸 때만),
`windows-server-roles.remote-access`·`windows-server-roles.web-application-proxy`(DirectAccess·PPTP/L2TP는 2028 Preview에서 제거, 웹 응용 프로그램 프록시는 목록에 없음 — step 4가 그 주제의 문서와 함께 다시 본다), `windows-hyperv`(Hyper-V 줄·Nano Server 줄 — step 9가 다시 본다)

## (phase 81 step 0) Microsoft Learn — 서버 역할과 기능: Add or remove roles and features in Windows Server, Install-WindowsFeature, Get-WindowsFeature, Roles, Role Services, and Features included in Windows Server - Server Core, Commands by Server role, Server Manager, Manage Multiple, Remote Servers with Server Manager; Win32 — Server Feature Provider; 지난 판 Roles, Role Services, and Features (Windows Server 2008 R2)
https://learn.microsoft.com/en-us/windows-server/administration/server-manager/install-or-uninstall-roles-role-services-or-features
https://learn.microsoft.com/en-us/powershell/module/servermanager/install-windowsfeature?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/powershell/module/servermanager/get-windowsfeature?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/windows-server/administration/server-core/server-core-roles-and-services
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/commands-by-server-role
https://learn.microsoft.com/en-us/windows-server/administration/server-manager/server-manager
https://learn.microsoft.com/en-us/windows-server/administration/server-manager/manage-multiple-remote-servers-with-server-manager
https://learn.microsoft.com/en-us/windows/win32/wmisdk/server-feature-provider
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/cc754923(v=ws.11)

2026-11-18에 IPv4로 내려받아 읽은 판: 「Add or remove roles and features in Windows Server」 `updated_at` 2026-02-16(`ms.date` 2025-06-09, 「Last updated on」 2025-06-13), 「Roles, Role Services, and Features included in Windows Server - Server Core」 2026-02-16(2025-03-12) — 둘 다 「Applies to」 Windows Server 2016~2025·Windows 11·10.
「Commands by Server role」 2025-10-22(2017-10-16, Windows Server 2016~2025·Windows 11·10·Azure Local 2311.2 이후), 「Server Manager」 2025-10-15(2025-06-16), 「Manage Multiple, Remote Servers with Server Manager」 2025-05-19(2017-10-16) — 둘 다 Windows Server 2016~2025·Windows 11·10.
`Install-WindowsFeature`·`Get-WindowsFeature` 2024-02-07(2021-09-08, ServerManager 모듈 — 페이지가 `windowsserver2025-ps` 판을 가리킨다). Win32 「Server Feature Provider」 2025-03-11(2018-05-31 — 적용 판을 적지 않는 개발자 문서).
지난 판 「Roles, Role Services, and Features」 2021-11-12(`ms.date` 2009-11-17, 「Applies To」 Windows Server 2008 R2) — **지금 판 「Manage Multiple, Remote Servers with Server Manager」가 역할·역할 서비스·기능의 정의로 이 문서를 링크한다**(「Tasks that you can perform in Server Manager」 표). 지금 판 문서에서 셋을 정의한 문장은 찾지 못했다.
한국어판도 모두 받았다(`updated_at` 2026-01-21~2026-07-17, 기계 번역). PowerShell 두 페이지와 지난 판 문서의 한국어판은 번역되지 않아 영문 그대로다.

- **서버 역할**(server role, 지난 판 정의): 설치하고 알맞게 구성하면 컴퓨터가 네트워크의 여러 사용자나 다른 컴퓨터를 위해 정해진 일을 하게 하는 소프트웨어 프로그램 묶음이다. 대개 — 그 컴퓨터의 주된 일·쓰임을 나타내고(한 컴퓨터가 많이 쓰이는 역할 하나만 맡거나, 적게 쓰이는 역할 여럿을 함께 맡는다), 조직의 사용자가 다른 컴퓨터가 관리하는 웹 사이트·프린터·파일 같은 자원에 닿게 하며,
  요청을 쌓아 두거나 네트워크 사용자·컴퓨터에 관한 정보를 적는 자기 데이터베이스를 갖고(예: AD DS), 설치·구성을 마치면 사람이 거의 손대지 않아도 스스로 일한다 — 「Roles」
- 지금 판 「Commands by Server role」: 서버 역할은 서버의 주된 일을 나타내고, 서버 한 대를 역할 하나에 다 쓰거나 한 컴퓨터에 서버 역할과 하위 역할 여럿을 설치할 수 있다. 역할에 따라 명령줄 도구가 함께 설치된다 — 첫 문단. Win32 「Server Feature Provider」: 서버 역할은 인쇄·파일·도메인 제어처럼 한 영역의 일을 하는 구성 요소 묶음이다 — 첫머리
- **역할 서비스**(role service, 지난 판 정의): 역할의 일을 실제로 해 주는 프로그램이다. 역할을 설치할 때 그 역할이 다른 사용자·컴퓨터에게 어떤 역할 서비스를 제공할지 고른다. DNS 서버처럼 하는 일이 하나뿐인 역할에는 고를 역할 서비스가 없고, 원격 데스크톱 서비스처럼 여럿인 역할도 있다.
  역할은 서로 밀접한 역할 서비스의 묶음으로 볼 수 있고, 역할을 설치한다는 것은 대개 그 역할 서비스를 하나 이상 설치한다는 뜻이다 — 「Role services」
- **기능**(feature, 지난 판 정의): 역할을 이루는 부분은 아니지만, 역할 하나 이상의 일을 돕거나 넓히거나, 어떤 역할을 설치했든 상관없이 서버 자체의 일을 좋게 하는 프로그램이다. 예: 장애 조치 클러스터링(파일 서비스·DHCP 서버 같은 역할을 서버 클러스터에 넣어 중복성과 성능을 높인다), 텔넷 클라이언트(서버가 쓸 수 있는 통신 수단을 넓힌다) — 「Features」
- **어디에 무엇이 드는지**(지금 판 「Roles, Role Services, and Features included in Windows Server - Server Core」 — Server Core 설치 옵션의 표, 열은 이름·설치 이름·기본 설치 여부): 역할 표에 DHCP 서버(`DHCP`), DNS 서버(`DNS`), 파일 및 스토리지 서비스(`FileAndStorage-Services`), Hyper-V(`Hyper-V`), 인쇄 및 문서 서비스(`Print-Services`), 원격 액세스(`RemoteAccess`), 웹 서버(IIS)(`Web-Server`).
  역할 서비스 표에 — 파일 및 스토리지 서비스 아래 파일 및 iSCSI 서비스(`File-Services`)·파일 서버(`FS-FileServer`)·스토리지 서비스(`Storage-Services`), 인쇄 및 문서 서비스 아래 인쇄 서버(`Print-Server`), 원격 액세스 아래 DirectAccess 및 VPN(RAS)(`DirectAccess-VPN`)·라우팅(`Routing`)·웹 애플리케이션 프록시(`Web-Application-Proxy`), 웹 서버(IIS) 아래 웹 서버(`Web-WebServer`)·FTP 서버(`Web-Ftp-Server`)와 그 아래 FTP 서비스(`Web-Ftp-Service`)·FTP 확장성(`Web-Ftp-Ext`).
  기능 표에 — BitLocker 드라이브 암호화(`BitLocker`), 컨테이너(`Containers`), WINS 서버(`WINS`). phase 80의 `windows-admin-tools.bitlocker`가 「기능 목록에서 고른다」고 쓴 것과 맞다(위 「(phase 80 step 8) … EFS·BitLocker」 항목의 「Install BitLocker on Windows Server」)
- **기본으로 설치된 것**: 같은 표에서 기본 설치가 「Y」인 역할은 파일 및 스토리지 서비스 하나이고, 그 역할 서비스 가운데 「Y」는 스토리지 서비스 하나다(파일 서버는 「N」). 나머지 역할(DHCP 서버·DNS 서버·Hyper-V·인쇄 및 문서 서비스·원격 액세스·웹 서버(IIS))은 모두 「N」이다.
  **이 표는 Server Core 설치 옵션의 것이다** — 데스크톱 경험이 있는 설치의 기본 상태는 아래 「(phase 81 step 0) … 파일 서버·SMB·인쇄 서버」 항목의 지난 판 「File and Storage Services Overview」(2012 R2·2012)가 같은 말을 한다
- **설치하는 자리 — 서버 관리자**(「Add or remove roles and features in Windows Server」, 탭 「Roles and Features Wizard」): 서버 관리자 콘솔과 서버 관리자용 PowerShell cmdlet으로 로컬 서버·서버 관리자에 더한 원격 서버·오프라인 VHD에 역할과 기능을 더하고, 여럿을 한 번에 더할 수 있다 — 첫머리. 관리자 계정이 필요하다 — 「Prerequisites」.
  차례: 시작 메뉴에서 서버 관리자를 연다 → 오른쪽 위 「관리」 → 「역할 및 기능 추가」 → **역할 및 기능 추가 마법사** → 「시작하기 전에」 → 「설치 유형」에서 「역할 기반 또는 기능 기반 설치」(원격 데스크톱 서비스를 뺀 모든 역할·기능에 쓴다) → 「서버 선택」(로컬 서버나 서버 관리자에 더한 원격 서버, 또는 VHD) →
  「서버 역할」(더할 역할을 고른다 — 기능만 더할 때는 고르지 않아도 된다. 고른 역할에 필요한 다른 역할·기능이 있으면 더하라고 묻고, 대상 서버에 충돌이 있으면 알린다. 역할의 **관리 도구는 기본으로 함께 더해진다** — 다른 서버에서 원격으로 관리할 때는 빼도 된다) → 「기능」(역할만 더할 때는 고르지 않아도 된다) → 「확인」(고른 것을 보고 「설치」 — 설치 뒤 다시 시작해야 하는 역할·기능이 있고, 「필요한 경우 대상 서버를 자동으로 다시 시작」을 고를 수 있다) → 끝나면 「닫기」. 마법사 한 번에 대상 서버는 하나다 — 「Add roles and features on multiple servers」
- **설치하는 자리 — PowerShell**(같은 문서, 탭 「Windows PowerShell」): 관리자 PowerShell에서 `Get-WindowsFeature`로 설치할 수 있는 역할·기능 전체를 보고(`-ComputerName`으로 원격 서버도), `Install-WindowsFeature`에 역할·기능 이름을 하나 이상 주어 설치한다. 예: `Install-WindowsFeature -Name DNS,DHCP -IncludeManagementTools`(로컬 서버에 DNS와 DHCP 역할을 관리 도구와 함께 — 결과 표에 Success·Restart Needed·Exit Code·Feature Result 칸이 나온다).
  설치된 것만 보려면 `Get-WindowsFeature | ? Installed -eq $true`. 역할의 관리 도구와 스냅인은 **기본으로 들어가지 않아** `-IncludeManagementTools`를 붙인다. Server Core 설치 옵션에서는 그래도 GUI 관리 도구는 설치되지 않고 명령줄·PowerShell 관리 도구만 설치된다. 다시 시작이 필요하면 `-Restart`로 묻지 않고 다시 시작한다 — 같은 탭의 차례와 Tip
- `Install-WindowsFeature`(「Description」·매개 변수): 로컬이나 원격 Windows Server(또는 오프라인 VHD)에 **역할·역할 서비스·기능** 하나 이상을 설치한다. 서버 관리자의 설치와 비슷하게 동작하지만 기능의 관리 도구를 기본으로 설치하지 않는 것이 다르다. 관리자 권한(관리자로 연 PowerShell)이 필요하다.
  `-IncludeAllSubFeature`는 이름으로 준 역할·역할 서비스·기능 아래의 하위 역할 서비스·하위 기능까지 모두 설치한다. 예 1·2: `Install-WindowsFeature -Name Web-Server -IncludeAllSubFeature …`는 웹 서버(IIS)를 모든 역할 서비스와 함께 설치한다. 예 3: 역할 및 기능 추가 마법사의 확인 페이지에서 「구성 설정 내보내기」로 만든 XML 파일로 설치할 수 있다
- `Get-WindowsFeature`(「Description」·예): 설치할 수 있는 것과 이미 설치된 것을 함께 보인다. 예 4는 `Get-WindowsFeature -ComputerName Server01 | Where Installed`로 설치된 것만 보인다. 예 3처럼 `-Name AD*, Web*`으로 이름(명령 ID)의 앞부분을 걸러 볼 수 있다
- **서버 관리자**(「Server Manager」): 로컬·원격 Windows Server를 한곳에서 갖추고 관리하는 콘솔이다 — 첫머리. Administrators 그룹 구성원이 로그온하면 기본으로 저절로 시작한다(「서버 관리자 속성」 대화 상자의 「로그온 시 서버 관리자를 자동으로 시작 안 함」 확인란이나 같은 뜻의 그룹 정책으로 끈다) — 「Start Server Manager」. 표준 사용자는 역할 서비스를 더하거나 빼지 못한다 — 「Tasks that you can perform in Server Manager」 표
- **한국어 이름**: 한국어판은 「서버 관리자」, 「역할 및 기능 추가」·「역할 및 기능 추가 마법사」, 「역할 서비스」(Server Core 표 한국어판의 열 머리), 「기능」(마법사 단계 이름), 「역할 기반 또는 기능 기반 설치」, 마법사 단계를 「시작하기 전에」·「설치 유형」·「서버 선택」·「서버 역할」·「기능」·「확인」으로 옮긴다
  (DNS 서버·DHCP 서버 빠른 시작 한국어판은 같은 페이지를 「설치 유형 선택」·「대상 서버 선택」·「서버 역할 선택」·「기능 선택」·「설치 선택 확인」으로 옮긴다 — 아래 항목들). 역할·역할 서비스 이름은 Server Core 표 한국어판의 「DHCP 서버」·「DNS 서버」·「파일 및 스토리지 서비스」·「스토리지 서비스」·「파일 서버」·「인쇄 및 문서 서비스」·「인쇄 서버」·「원격 액세스」·「DirectAccess 및 VPN(RAS)」·「웹 애플리케이션 프록시」·「웹 서버(IIS)」·「FTP 서버」, 기능 이름은 「BitLocker 드라이브 암호화」.
  **고른 이름**: 「서버 역할」·「역할 서비스」·「기능」, 「서버 관리자」, 「역할 및 기능 추가 마법사」(그 안 페이지는 「서버 역할 선택」처럼 빠른 시작 한국어판 꼴 — phase 80의 AD DS 항목과 같다), 「파일 및 스토리지 서비스」(guide.md의 「파일 및 저장소 서비스」 대신 — 한국어판의 표기이고 phase 80 `windows-admin-tools.work-folders`가 이미 쓴다), 「인쇄 및 문서 서비스」·「인쇄 서버」, 「웹 서버(IIS)」. **실제 한국어 Windows 화면의 이름은 확인하지 못했다**

쓰인 곳: (phase 81 step 1에서 쓰일 곳) `windows-server-roles.server-roles-features`(역할·역할 서비스·기능의 정의와 차이 — 지난 판 정의, 지금 판의 「서버의 주된 일」, 어느 이름이 역할이고 역할 서비스이고 기능인지(Server Core 표), 기본 설치(파일 및 스토리지 서비스·스토리지 서비스), 서버 관리자 마법사의 차례와 페이지 이름, `Install-WindowsFeature`·`-IncludeManagementTools`·`Get-WindowsFeature`, 관리 도구가 마법사에서는 기본으로 들어가고 cmdlet에서는 아니라는 차이);
(phase 81 step 2·7에서 쓰일 곳) `windows-server-roles.file-print-services`(파일 서버·인쇄 서버 역할 서비스 이름과 기본 설치), `windows-server-roles.ftp-server`(웹 서버(IIS) 아래 FTP 서버 역할 서비스와 설치 이름 `Web-Ftp-Server` — step 4가 FTP 문서와 함께 다시 본다); 기출 대조(`exam-notes.md` 「phase 81 step 0」 문단 — [기출 2026-05-17 #44])

## (phase 81 step 0) Microsoft Learn — 서버의 고정 IP 주소: Quickstart: Install and configure DNS Server on Windows Server, Core network components, DHCP server events, New-NetIPAddress, Set-DnsClientServerAddress, STEP 6 Install and Configure 2-DC1(DirectAccess 다중 사이트 시험 랩); 문제 해결 — How To Install and Configure a DHCP Server in a Workgroup
https://learn.microsoft.com/en-us/windows-server/networking/dns/quickstart-install-configure-dns-server
https://learn.microsoft.com/en-us/windows-server/networking/core-network-guide/core-network-guide
https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-server-events
https://learn.microsoft.com/en-us/powershell/module/nettcpip/new-netipaddress?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/powershell/module/dnsclient/set-dnsclientserveraddress?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/windows-server/remote/remote-access/directaccess/tlg-multisite/step-6-install-and-configure-2-dc1
https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/install-configure-dhcp-server-workgroup

2026-11-18에 IPv4로 내려받아 읽은 판: DNS 서버 빠른 시작 `updated_at` 2025-06-11(`ms.date` 2025-06-11), 「Core network components」 2025-09-22(2023-02-06), 「DHCP server events」 2025-09-15(2025-03-12) — 셋 다 「Applies to」 Windows Server 2016~2025(이벤트 문서는 Azure Local 2311.2 이후도).
`New-NetIPAddress`·`Set-DnsClientServerAddress` 2025-05-14(2016-12-20, `windowsserver2025-ps` 판). DirectAccess 시험 랩 「STEP 6」 2026-02-16(2020-08-07, Windows Server 2016~2025·Windows 11·10).
작업 그룹 DHCP 문제 해결 문서 2026-02-19(2026-02-12, 「Applies to」 지원되는 Windows Server, 원래 KB 323416) — **본문은 Windows Server 2003에 DHCP 서버를 세우는 글**이라 줄의 사실만 가져오고 차례·화면은 가져오지 않는다.
한국어판도 받았다(`updated_at` 2026-01-21~2026-10-14, 기계 번역) — 용어 표기만 참고한다. AD DS 설치 문서 둘(「Install Active Directory Domain Services」, 「Active Directory Domain Services configuration wizard page descriptions」, 2026-02-16)도 다시 받아 찾아봤지만 고정 IP 주소에 관한 말은 없다.

- **DNS 서버 빠른 시작**(「Prerequisites」): DNS 서버를 설치하고 구성하기 전에 갖출 것으로 지원되는 Windows Server를 실행하는 컴퓨터, **고정 IP**, Administrators 그룹 구성원(이나 같은 권한의) 계정을 든다. 설치는 관리자 PowerShell의 `Install-WindowsFeature -Name DNS`(다시 시작이 필요 없다)나 서버 관리자의 역할 및 기능 추가 마법사(「서버 역할 선택」에서 DNS 서버를 고르고 필요한 기능을 더한다)로 한다 — 「Install DNS Server」.
  AD DS를 설치 마법사로 설치하면 DNS 서버를 함께 설치·구성하는 선택지가 있다 — 같은 절의 Tip
- DHCP 서버 빠른 시작(「Prerequisites」, 아래 「DHCP 서버 역할·범위·예약」 항목): 갖출 것에 **고정 IPv4 주소**가 있다
- **Core network components** — 「Planning TCP/IP static configuration」: **라우터·DHCP 서버·DNS 서버 같은 장치는 고정 IP 주소로 구성해야 한다.** 프린터처럼 늘 같은 주소를 쓰게 하고 싶은 장치도 있다. 서브넷마다 이렇게 고정으로 구성할 장치를 적고, DHCP 서버가 그 주소를 임대하지 않도록 쓸 제외 범위를 계획하라.
  「Static TCP/IP configurations」: 이 안내의 배포에서는 서버를 고정 IPv4 주소로 구성하고 클라이언트 컴퓨터는 기본 설정대로 DHCP 서버에서 주소를 임대받는다. 「Planning exclusion ranges」: 범위의 주소 구간 안에서 일부 서버·장치에 손으로 고정 주소를 넣으면, 사람과 DHCP 서버가 같은 주소를 서로 다른 장치에 주는 주소 충돌이 날 수 있고 — 그래서 제외 범위를 만든다
- 같은 문서 「Configure a static IP address」(Windows Server 2016·2012 R2·2012의 차례): 작업 표시줄의 네트워크 아이콘 오른쪽 클릭 → 「네트워크 및 공유 센터 열기」 → 「어댑터 설정 변경」(네트워크 연결 폴더) → 설정할 연결 오른쪽 클릭 → 「속성」 → 「이 연결에서는 다음 항목을 사용」에서 「인터넷 프로토콜 버전 4(TCP/IPv4)」를 고르고 「속성」 →
  「인터넷 프로토콜 버전 4(TCP/IPv4) 속성」의 「일반」 탭에서 「다음 IP 주소 사용」 → 「IP 주소」 입력 → Tab을 누르면 「서브넷 마스크」에 기본값이 채워지고 그대로 두거나 고친다 → 「기본 게이트웨이」(라우터의 LAN 쪽 인터페이스와 같은 주소여야 한다) → 「기본 설정 DNS 서버」(이 컴퓨터를 DNS 서버로 쓰려면 이 컴퓨터의 주소) → 「대체 DNS 서버」(있으면) → 「확인」·「닫기」.
  같은 일을 PowerShell로는 `New-NetIPAddress -IPAddress <주소> -InterfaceAlias "Ethernet" -DefaultGateway <게이트웨이> -AddressFamily IPv4 -PrefixLength 24`와 `Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses <DNS 서버 주소>`로 한다 — 같은 절의 Note(문서의 예는 DNS 서버 주소에 127.0.0.1을 넣는다)
- **DirectAccess 시험 랩 「STEP 6」**(「Configure TCP/IP properties」): 같은 속성 창에서 「다음 IP 주소 사용」으로 주소·마스크·기본 게이트웨이를 넣은 뒤 **「다음 DNS 서버 주소 사용」**(Use the following DNS server addresses)을 고르고 「기본 설정 DNS 서버」·「대체 DNS 서버」를 넣는다 — 이 단계의 이름이 지금 판 Windows Server 문서에 보이는 곳이다(「Core network components」의 차례는 이 고르기를 따로 적지 않는다)
- `New-NetIPAddress`(「Description」·예 1): IP 주소를 만들고 구성한다. 접두사 길이(서브넷 마스크)와 기본 게이트웨이를 함께 정하라고 권한다. **이미 DHCP가 켜진 인터페이스에 이 cmdlet으로 주소를 더하면 DHCP가 저절로 꺼진다.** 접두사 길이 24는 255.255.255.0이고, 기본 게이트웨이는 더하는 IPv4 주소와 같은 서브넷에 있어야 한다
- `Set-DnsClientServerAddress`(「Description」): 인터페이스의 TCP/IP 속성에 DNS 서버 주소를 **고정으로** 넣고, 이렇게 넣은 DNS 서버는 그 인터페이스의 DHCP 설정보다 앞선다
- **DHCP server events**(「DHCP server administrative events」 표): 이벤트 1144(EVENT_SERVER_NEED_STATIC_IP) — 이 컴퓨터에 동적으로 받은 IP 주소가 하나 이상 있으니, DHCP 서버가 믿을 만하게 동작하려면 고정 IP 주소만 쓰라는 내용이다. **DHCP 서버의 이벤트다** — DNS 서버 역할에 같은 이벤트·경고가 있다는 문서는 찾지 못했다
- **작업 그룹 DHCP 문서**(Windows Server 2003 글, 「How to Create a New Scope」 5단계): 범위에서 뺄 주소는 이미 여러 컴퓨터에 고정으로 준 주소이고, 대개 **도메인 컨트롤러·웹 서버·DHCP 서버·DNS 서버** 같은 서버가 고정 주소를 쓴다고 적는다. 지금 판 문서에서 「도메인 컨트롤러는 고정 IP 주소를 써야 한다」를 한 문장으로 적은 곳은 찾지 못했다 — 「Core network components」가 DC1(AD DS와 DNS 서버를 함께 둔 서버)을 고정 주소로 구성하는 차례를 보이는 데까지다
- **찾지 못한 것**: DHCP로 주소를 받은 서버에 DNS 서버 역할을 설치할 때 마법사가 보이는 경고의 꼴(검색 — dynamically assigned, static IP warning, Add Roles and Features validation — 에 Microsoft Q&A 글만 나왔다). 「서버가 왜 고정 주소여야 하는가」를 한 문장으로 적은 문장도 찾지 못했다 —
  클라이언트가 DNS 서버의 주소를 「기본 설정 DNS 서버」 칸에 적어 두거나(위 차례) DHCP의 DNS 서버·라우터 옵션으로 받는다(아래 「DHCP 서버 역할·범위·예약」 항목)는 사실과, 주소가 바뀌면 적어 둔 그 값이 맞지 않게 된다는 것은 이어서 나오는 말이다
- **한국어 이름**: 한국어판은 「고정 IP 주소」(「Core network components」·이벤트 1144)와 「정적 IP 주소」·「정적 IPv4 주소」(같은 문서의 절 제목, DHCP 빠른 시작)를 섞어 쓰고, DNS 빠른 시작은 「고정 IP」다. 메뉴는 「네트워크 및 공유 센터 열기」·「어댑터 설정 변경」·「인터넷 프로토콜 버전 4(TCP/IPv4) 속성」·「일반」 탭·「다음 IP 주소 사용」·「다음 DNS 서버 주소 사용」(시험 랩 한국어판)·「기본 설정 DNS 서버」·「대체 DNS 서버」로 옮긴다.
  **고른 이름**: 「고정 IP 주소」(정적 IP 주소라고도 부른다는 것은 한 줄), 메뉴 이름은 위 한국어판 그대로. **실제 한국어 Windows 화면의 이름은 확인하지 못했다**

쓰인 곳: (phase 81 step 1에서 쓰일 곳) `windows-server-roles.server-static-ip`(DNS 서버·DHCP 서버를 설치하기 전에 고정 주소, 라우터·DHCP 서버·DNS 서버는 고정 주소여야 한다, 서버는 고정·클라이언트는 DHCP, 고정 주소와 제외 범위의 관계, TCP/IPv4 속성의 차례와 이름, `New-NetIPAddress`가 DHCP를 끈다·`Set-DnsClientServerAddress`, DHCP 서버의 이벤트 1144, 도메인 컨트롤러는 2003 글과 DC1 차례로만 — 위 「(phase 78 step 11) … ipconfig」의 `/renew` 줄과 함께);
기출 대조(`exam-notes.md` 「phase 81 step 0」 문단 — [기출 2025-05-25 #43])

## (phase 81 step 0) Microsoft Learn — 파일 서버·SMB·인쇄 서버: What is SMB File Sharing for Windows and Windows Server?, Secure SMB traffic in Windows Server, Service overview and network port requirements for Windows, How to install and configure a file and print server, How to reset TCP/IP by using the NetShell utility, Error 0x80071779 when removing network components in Windows 10; 지난 판 File and Storage Services Overview, Print and Document Services Overview
https://learn.microsoft.com/en-us/windows-server/storage/file-server/file-server-smb-overview
https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-secure-traffic
https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/service-overview-and-network-port-requirements
https://learn.microsoft.com/en-us/troubleshoot/windows-server/printing/install-configure-file-print-server
https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/reset-tcp-ip-net-shell
https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/cannot-uninstall-client-for-microsoft-networks
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/hh831487(v=ws.11)
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/hh831468(v=ws.11)

2026-11-18에 IPv4로 내려받아 읽은 판: 「What is SMB File Sharing for Windows and Windows Server?」 `updated_at` 2026-11-17(`ms.date` 2026-11-10, 「Applies to」 Windows Server 2028 Preview·2025~2016·Windows 11·10·Azure Local), 「Secure SMB traffic in Windows Server」 2025-04-28(2024-10-25, Windows Server 2016~2025·Windows 11·10·Azure Local).
문제 해결 문서 넷은 모두 2026-02-19(2026-02-12) — 포트 요구 문서·TCP/IP 다시 설정 문서는 「Applies to」 지원되는 Windows Server, 파일·인쇄 서버 문서는 같은 머리에 본문이 「Applies to: Windows Server 2003」(원래 KB 325860)인 **Windows Server 2003 글**, 네트워크 구성 요소 제거 오류 문서는 지원되는 Windows 클라이언트(본문은 Windows 10 모든 판, KB 4340181).
지난 판 「File and Storage Services Overview」 2021-11-12(`ms.date` 2016-12-29, Windows Server 2012 R2·2012 — 지금 판 「Manage the Local Server and the Server Manager Console」이 파일 및 스토리지 서비스의 안내로 링크한다), 「Print and Document Services Overview」 2021-11-12(2016-08-31, Windows Server 2012).
한국어판도 받았다(`updated_at` 2026-01-21~2026-11-17, 기계 번역 — 지난 판 둘은 영문 그대로).

- **SMB**(Server Message Block, 「What is SMB File Sharing…」 첫머리): 네트워크로 파일을 공유하는 프로토콜이다. **TCP/IP 위나 다른 프로토콜 위에서** 네트워크 너머의 파일을 읽고 쓰게 하고, 응용 프로그램(이나 그 사용자)이 원격 서버의 파일·자원에 닿아 읽고 만들고 고치게 한다.
  「SMB features」의 네트워킹 갈래: 전송으로 흔히 쓰는 TCP, VPN 없이 인터넷으로 닿게 하는 QUIC, 데이터 센터의 RDMA를 든다(이름만 — 설정은 가져오지 않는다)
- 같은 문서 「SMB components」: **SMB 서버**는 자원(파일·프린터·명명된 파이프)을 공유하고 SMB 클라이언트의 요청에 답하는 구성 요소다 — 컴퓨터에 파일 공유를 만들면 그 컴퓨터의 SMB 서버가 들어오는 연결과 파일 접근 요청을 처리한다. **SMB 클라이언트**는 원격 공유에 이어 SMB 서버로 요청을 보내는 구성 요소다 — 네트워크 드라이브를 연결하거나 **`\\server\share` 같은 UNC 경로**로 닿으면 그 컴퓨터의 SMB 클라이언트가 연결을 시작하고 맡는다.
  두 이름은 프로토콜 안에서의 역할이지 Windows 판 이름이 아니고, Windows Server와 Windows 클라이언트 모두 두 구성 요소를 갖는다(Windows 11도 공유를 열어 SMB 서버가 된다)
- **포트**: 「Secure SMB traffic」은 회사 방화벽에서 인터넷에서 들어오는 **TCP 445**와 인터넷으로 나가는 TCP 445를 막으라고 권한다 — 「Block TCP port 445 …」 두 절. 「Updated firewall rules」: Windows 11 24H2·Windows Server 2025부터 기본 방화벽 규칙에 SMB의 NetBIOS 포트가 없다 —
  그 전 판에서는 공유를 만들면 「파일 및 프린터 공유」 그룹의 규칙이 인바운드 NetBIOS 포트 137~139를 저절로 열었다. SMB2 이후로 만든 공유는 137~139를 쓰지 않고, SMB1 서버가 꼭 필요하면 그 포트를 손으로 연다
- 「Service overview and network port requirements」의 **Server** 시스템 서비스(서비스 이름 `lanmanserver`): 네트워크로 파일 공유·인쇄 공유·명명된 파이프 공유와 RPC 지원을 한다. 디스크·프린터 같은 로컬 자원을 공유해 네트워크의 다른 사용자가 쓰게 한다. 포트 — SMB는 **TCP 445**, NetBIOS 세션 서비스 TCP 139, NetBIOS 이름 풀이 UDP 137, NetBIOS 데이터그램 서비스 UDP 138. **NetBIOS 포트는 선택이고** Windows 2000 이후 클라이언트는 445만으로 일한다 — 「System services ports」의 「Server」
- **TCP/IP는 Windows에 처음부터 들어 있다**: 파일·인쇄 서버 문서(Windows Server 2003 글)는 Windows Server 2003 컴퓨터에 **Microsoft 네트워크용 클라이언트, Microsoft 네트워크용 파일 및 프린터 공유, TCP/IP가 기본으로 설치된다**고 적는다(로컬 영역 연결 속성에서 보인다) — 「Install File and Printer Sharing」. 이 문서의 서버 구성 마법사 차례는 지금 판에 없는 도구라 가져오지 않는다.
  「How to reset TCP/IP …」: `netsh int ip reset`은 TCP/IP가 쓰는 레지스트리 키를 다시 쓰고, 그것은 **TCP/IP를 지웠다가 다시 설치한 것과 같은 효과**다 — 「Manually reset TCP/IP」. 「Error 0x80071779 …」(Windows 10 1803 이후 클라이언트): Microsoft 네트워크용 클라이언트 같은 네트워크 구성 요소를 지울 수 없는 것은 설계대로이고, 그 화면이나 `netcfg`로 프로토콜·기본 드라이버를 지우는 것을 지원하지 않는다 — 대신 어댑터에서 바인딩을 끈다(`Disable-NetAdapterBinding`) — 「Resolution」.
  「지금 판 Windows Server에서 TCP/IP가 기본으로 설치되어 있다」를 한 문장으로 적은 지금 판 문서는 찾지 못했다 — 위 셋으로 댄다
- **파일 서버**(지난 판 「File and Storage Services Overview」, 2012 R2·2012): 파일 및 스토리지 서비스는 **파일 서버** — 네트워크에서 파일을 한곳에 저장하고 사용자와 공유하게 하는 서버 — 를 하나 이상 세우고 관리하는 기술을 담는다. 사용자가 같은 파일에 닿아야 하거나 백업·파일 관리를 한곳에서 해야 하면 이 역할과 알맞은 역할 서비스를 설치해 파일 서버를 세운다 — 첫머리.
  **이 역할과 스토리지 서비스 역할 서비스는 기본으로 설치되지만 다른 역할 서비스는 없다** — 서버 관리자·PowerShell로 저장소를 관리하는 기본 기능뿐이고, 파일 서버를 세우거나 관리하려면 역할 및 기능 추가 마법사나 `Install-WindowsFeature`로 역할 서비스를 더 설치한다 — 같은 곳. 역할 서비스 표의 「File Server」: 파일 공유를 관리하고 사용자가 네트워크에서 이 컴퓨터의 파일에 닿게 한다(SMB 공유).
  지금 판 Server Core 표(위 「서버 역할과 기능」 항목)가 같은 기본 상태(파일 및 스토리지 서비스·스토리지 서비스 「Y」, 파일 서버 「N」)를 보인다
- **인쇄 서버**(지난 판 「Print and Document Services Overview」, Windows Server 2012): 인쇄 및 문서 서비스 역할은 인쇄 서버와 네트워크 프린터에 관한 일을 한곳에서 하게 한다(네트워크 스캐너의 문서를 받아 보내는 일도 하지만 가져오지 않는다) — 「Role description」. 인쇄 서버(Print Server)는 인쇄 대기열을 살피고 대기열이 인쇄 작업을 처리하지 않게 되면 알려 주며, 그룹 정책으로 프린터 연결을 배포하게 한다 — 「Practical applications」.
  지금 판 Server Core 표: 인쇄 및 문서 서비스(`Print-Services`) 아래 인쇄 서버(`Print-Server`), 기본 설치 「N」. 「프린트 서버는 인쇄 작업을 받아 프린터로 보낸다」를 한 문장으로 정의한 지금 판 문서는 찾지 못했다 — 위 SMB 서버(프린터를 공유한다)·Server 서비스(프린터를 공유해 다른 사용자가 쓰게 한다)·인쇄 대기열의 줄로 댄다
- **한국어 이름**: 한국어판은 「SMB(서버 메시지 블록)」, 「SMB 서버」·「SMB 클라이언트」, 「UNC 경로」, 「파일 및 프린터 공유」(방화벽 규칙 그룹), 「Microsoft 네트워크용 파일 및 프린터 공유」(파일·인쇄 서버 문서), 「파일 서버」·「인쇄 서버」·「인쇄 및 문서 서비스」(Server Core 표)로 옮긴다. 지난 판 둘은 번역되지 않았다.
  **고른 이름**: 「SMB」(Server Message Block — 한국어판의 「서버 메시지 블록」을 한 줄), 「파일 서버」, 「인쇄 서버」(guide.md의 개념 이름 「프린트 서버」는 일반 명사로 쓰고, 역할 서비스 이름은 「인쇄 서버」라고 밝힌다), 「UNC 경로」. **실제 한국어 Windows 화면의 이름은 확인하지 못했다**

쓰인 곳: (phase 81 step 2에서 쓰일 곳) `windows-server-roles.file-print-services`(SMB의 뜻 — 파일 공유 프로토콜이고 TCP/IP나 다른 전송 위에서 동작, SMB 서버가 파일·프린터를 공유하고 SMB 클라이언트가 `\\server\share`로 닿는다, TCP 445와 선택인 NetBIOS 포트, TCP/IP가 처음부터 들어 있다, 파일 서버·인쇄 서버의 뜻과 역할 서비스 이름·기본 설치, 인쇄 대기열);
기출 대조(`exam-notes.md` 「phase 81 step 0」 문단과 **E39** — [기출 2024-11-03 #30]). 오답 SNMP·SMTP·IGMP의 뜻은 이미 있는 「(phase 78 step 5) RFC 3411 …」·「(phase 78 step 0) RFC 5598 …」·「(phase 73 step 1) RFC 2236 …, RFC 9776 …」 항목으로 댄다

## (phase 81 step 0) Microsoft Learn — DHCP 서버 역할·범위·예약: Quickstart: Install and configure DHCP Server, Deploy DHCP Using Windows PowerShell, Add-DhcpServerInDC, Add-DhcpServerv4Scope, Add-DhcpServerv4ExclusionRange, Set-DhcpServerv4OptionValue, Add-DhcpServerv4Reservation, Windows Internet Name Service (WINS); Win32 — DhcpSetSubnetDelayOffer, DHCP_IP_RESERVATION_INFO
https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/quickstart-install-configure-dhcp-server
https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-deploy-wps
https://learn.microsoft.com/en-us/powershell/module/dhcpserver/add-dhcpserverindc?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/powershell/module/dhcpserver/add-dhcpserverv4scope?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/powershell/module/dhcpserver/add-dhcpserverv4exclusionrange?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/powershell/module/dhcpserver/set-dhcpserverv4optionvalue?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/powershell/module/dhcpserver/add-dhcpserverv4reservation?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/windows-server/networking/technologies/wins/wins-top
https://learn.microsoft.com/en-us/windows/win32/api/dhcpsapi/nf-dhcpsapi-dhcpsetsubnetdelayoffer
https://learn.microsoft.com/en-us/windows/win32/api/dhcpsapi/ns-dhcpsapi-dhcp_ip_reservation_info

2026-11-18에 IPv4로 내려받아 읽은 판: DHCP 서버 빠른 시작 `updated_at` 2026-02-16(`ms.date` 2025-04-17, 「Last updated on」 2025-04-21), 「Deploy DHCP Using Windows PowerShell」 2025-09-22(2021-01-04), WINS 2026-02-16(2020-08-07) — 셋 다 「Applies to」 Windows Server 2016~2025·Azure Local 2311.2 이후.
DhcpServer 모듈 cmdlet 다섯은 모두 2025-05-14(2016-12-20, `windowsserver2025-ps` 판). Win32 둘은 2024-02-22(2018-12-05 — 「Minimum supported server」 `DhcpSetSubnetDelayOffer`는 Windows Server 2008 R2, `DHCP_IP_RESERVATION_INFO`는 Windows Server 2012).
마법사의 옛 페이지 이름과 임대 기간의 단위는 위 「서버의 고정 IP 주소」 항목의 「Core network components」(2016~2025)와 작업 그룹 DHCP 문서(Windows Server 2003 글)에서 가져온다. 한국어판도 받았다(`updated_at` 2026-01-21~2026-10-14, 기계 번역 — cmdlet·Win32 페이지는 영문 그대로).

- **DHCP 서버 역할 설치**(빠른 시작 「Prerequisites」·「Install the DHCP Server role」): 갖출 것 — 지원되는 Windows Server, **고정 IPv4 주소**, 범위에 쓸 IP 주소 구간, Administrators 계정. 관리자 PowerShell에서 `Install-WindowsFeature DHCP -IncludeManagementTools`(다시 시작 필요 없음), 또는 서버 관리자 마법사의 「서버 역할 선택」에서 DHCP 서버를 고르고 필요한 기능을 더한다(뒤에 「DHCP 서버」 페이지에서 역할 설명을 본다)
- **관리 도구 — DHCP 콘솔**: 빠른 시작은 시작 메뉴 「Windows 관리 도구」 → 「DHCP」로, 「Deploy DHCP Using Windows PowerShell」은 서버 관리자 「도구」 → 「DHCP」로 연다(「Verify Server Functionality」). **실행 이름 `dhcpmgmt.msc`는 허용한 문서에서 찾지 못했다** — learn.microsoft.com 검색과 MCP 문서 검색 모두 Microsoft Q&A 글에만 나왔다. 쓰지 않는다
- **권한 부여**(빠른 시작 「Authorize the DHCP server in Active Directory」): 도메인 환경에 DHCP를 설치하면 서버가 도메인에서 동작하도록 AD에서 권한을 줘야 한다. AD 도메인에 설치한 **권한 없는 DHCP 서버는 제대로 동작하지 못하고 클라이언트에게 주소를 임대하지 않는다** — 권한 없는 서버가 잘못된 주소를 나눠 주는 일을 막는 보안 기능이다.
  PowerShell `Add-DhcpServerInDC -DnsName <서버 이름> -IPAddress <주소>`(도메인 환경이 아니면 실행하지 않는다)와 확인 `Get-DhcpServerInDC`, 또는 DHCP 콘솔에서 서버 이름을 오른쪽 클릭 → 「권한 부여」 → 몇 초 뒤 서버 목록을 새로 고쳐 확인한다. `Add-DhcpServerInDC` 「Description」: 도메인에 가입한 컴퓨터의 DHCP 서버는 AD에서 권한을 받아야 네트워크에서 주소 임대를 시작할 수 있다
- **범위와 새 범위 마법사**(빠른 시작 「Configure an IPv4 scope」, 탭 「GUI」): 범위는 DHCP 서버와 그 클라이언트가 쓸 IP 주소 구간을 정한다. DHCP 콘솔에서 서버 이름을 펼쳐 「IPv4」 오른쪽 클릭 → 「새 범위」 → **새 범위 마법사**: 「범위 이름」(이름) → 「IP 주소 범위」(클라이언트에게 줄 주소 구간과 서브넷 마스크) → **「제외 및 지연 추가」**(Add Exclusions and Delay — 서버가 나눠 주지 않을 주소나 주소 구간) →
  「임대 기간」(클라이언트에게 준 주소의 수명) → 「DHCP 옵션 구성」(「예, 지금 이러한 옵션을 구성하겠습니다」 — 라우터(기본 게이트웨이)·DNS 서버·WINS 설정 같은 흔한 옵션을 이어서 정하고, **적어도 라우터와 DNS 서버는 정해야 한다**) → 「라우터(기본 게이트웨이)」(클라이언트가 쓸 게이트웨이 주소를 넣고 「추가」) →
  「도메인 이름 및 DNS 서버」(클라이언트가 이름 풀이에 쓸 도메인 이름과 DNS 서버의 호스트 이름이나 주소) → **「WINS 서버」**(쓰는 WINS 서버의 이름과 주소 — 없으면 「다음」으로 건너뛴다) → 「범위 활성화」(「예, 이 범위를 활성화하겠습니다」를 고르면 곧바로 주소를 주기 시작하고, 「아니요, 이 범위를 나중에 활성화 하겠습니다」로 나중에 켤 수도 있다) → 「마침」.
  PowerShell 탭: `Add-DhcpServerv4Scope -Name <이름> -StartRange <시작> -EndRange <끝> -SubnetMask <마스크>`
- 같은 마법사(「Core network components」의 「To create and activate a new DHCP scope」 — 2016~2025 문서의 차례): 「IP 주소 범위」에서 시작 IP 주소와 끝 IP 주소를 넣으면 **길이와 서브넷 마스크가 시작 주소를 보고 저절로 채워지고**, 필요하면 고친다. 이 문서는 다음 페이지를 「제외 추가」(Add Exclusions — 시작·끝 IP 주소를 넣고 「추가」)라 부른다.
  **「임대 기간」에서 일·시간·분(Days, Hours, Minutes)의 기본값을 고친다.** 작업 그룹 DHCP 문서(2003 글)도 임대가 끝나기까지의 일·시간·분을 넣는다고 적는다. 마법사가 보이는 임대 기간의 기본값 숫자는 지금 판 문서에서 찾지 못했다
- `Add-DhcpServerv4Scope`(매개 변수): `-LeaseDuration` — 이 범위의 클라이언트에게 주소를 임대할 기간, **`일.시:분:초` 꼴**(TimeSpan), **기본값 `8.00:00:00`(8일)** — 곧 PowerShell로는 초까지 적는 꼴이다. `-Delay` — 클라이언트 요청에 답하기 전에 DHCP 서버가 기다릴 **밀리초** 수(UInt16, 기본 0)이고, 그 범위가 분할 범위 배포의 일부이고 이 서버가 그 범위의 보조 서버로 일할 때 정한다.
  `-State` — Active·Inactive, **활성 범위만 클라이언트 요청에 답한다**(기본 Active). `-Type` — DHCP·BootP·Both, 그 범위가 DHCP 클라이언트·BOOTP 클라이언트·둘 다 가운데 누구의 요청에 답할지(기본 DHCP)
- Win32 `DhcpSetSubnetDelayOffer`: 범위마다 **DISCOVER 메시지를 받은 뒤 OFFER 메시지를 보내기까지 늦출 시간**을 정한다 — 단위 밀리초, 0~1000, 기본 0(Windows Server 2008 R2부터) — 「Parameters」. 마법사 「제외 및 지연 추가」 페이지에서 이 값을 넣는 칸의 이름(「서브넷 지연」 같은)은 지금 판 문서에서 찾지 못했다 — 페이지 이름의 「지연」과 위 두 문서로만 댄다
- **제외 범위**: 빠른 시작 「Manage exclusions」 — DHCP 콘솔 트리에서 범위의 「주소 풀」 → 「작업」 메뉴 「새 제외 범위」 → 「제외 추가」 대화 상자의 시작 IP 주소(주소 하나만 빼면 이것만), 둘 이상이면 끝 IP 주소 → 「추가」. PowerShell `Add-DhcpServerv4ExclusionRange -ScopeId <범위 ID> -StartRange <시작> -EndRange <끝>`.
  `Add-DhcpServerv4ExclusionRange` 「Description」: 제외한 주소는 DHCP 서버가 **어떤 클라이언트에게도 임대하지 않는다 — 유일한 예외가 예약이다. 예약한 주소는 제외 범위 안에 있어도 지정한 클라이언트에게 임대된다.** 제외 범위의 정의는 위 「(phase 74 step 5) Microsoft Learn …」 항목의 DHCP scopes 줄
- **범위 옵션**: 빠른 시작 「Manage scope options」 — 콘솔에서 범위를 펼쳐 「범위 옵션」 오른쪽 클릭 → 「옵션 구성」, PowerShell `Set-DhcpServerv4OptionValue`. 「Description」: 옵션 값을 서버·범위·예약 수준에서 정한다(`-ReservedIP`만 주면 예약, `-ScopeId`만 주면 범위, 둘 다 없으면 서버 수준). 매개 변수 `-Router`(라우터·기본 게이트웨이 옵션), `-DnsServer`(DNS 서버 옵션), `-DnsDomain`(DNS 도메인 옵션), **`-WinsServer`**(WINS 서버 옵션, IPv4 주소)
- **예약**: 빠른 시작 「Manage reservations」 — 클라이언트 예약으로 DHCP 클라이언트가 계속 쓸 IP 주소를 예약한다. 예약은 **NIC의 MAC 주소로 저장되고, DHCP 서버가 정한 IP 주소를 정한 MAC 주소에게만 임대하게 한다**. 콘솔: 범위의 「예약」 노드 오른쪽 클릭 → 「새 예약」 → 예약 이름, IP 주소, 그 호스트의 NIC에 묶인 MAC 주소를 넣는다. 이미 있는 임대는 「주소 임대」 노드에서 오른쪽 클릭 → 「예약에 추가」로 예약으로 바꾼다.
  `Add-DhcpServerv4Reservation` 「Description」·매개 변수: **범위 안의** 정한 IPv4 주소를 클라이언트를 위해 예약하고, 그 뒤 그 주소는 그 클라이언트 ID의 클라이언트에게만 임대된다. `-ClientId` — 클라이언트의 고유 ID이고 **Windows 클라이언트는 MAC 주소를 클라이언트 ID로 쓴다**. **`-Type` — 그 주소를 예약해 둘 클라이언트 요청의 종류, DHCP·BootP·Both, 기본 Both.** `-Description`(예 1은 프린터용 예약이라는 설명을 단다)
- Win32 `DHCP_IP_RESERVATION_INFO`(「Members」): IPv4 예약이 담는 것 — 예약한 IP 주소, 예약을 가진 클라이언트의 하드웨어 주소(MAC 주소), 예약 클라이언트의 컴퓨터 이름, 설명, 허용하는 클라이언트 유형(DHCP만 1, BOOTP만 2, DHCPv4와 BOOTP 둘 다 3). 새 예약 대화 상자에서 유형을 고르는 칸의 이름(「지원되는 유형」 같은)은 지금 판 문서에서 찾지 못했다 — 유형 셋은 cmdlet과 이 구조체로 댄다
- **예약 주소와 범위**: cmdlet이 「범위 안의 주소를 예약한다」고 쓰고(`-ScopeId`), 콘솔도 범위의 「예약」 노드에서 만든다. 범위의 주소 구간 밖 주소를 넣으면 어떻게 되는지 적은 문서는 찾지 못했다
- **WINS**(「Windows Internet Name Service (WINS)」 첫머리): 컴퓨터의 **NetBIOS 이름을 IP 주소에 짝짓는** 옛(레거시) 컴퓨터 이름 등록·풀이 서비스다. 아직 배포하지 않았다면 WINS 대신 DNS를 배포하라(DNS도 이름 등록·풀이를 하고 AD DS와 묶이는 것 같은 이점이 더 있다), 이미 있다면 DNS를 배포한 뒤 WINS를 거두라.
  지원 상태: 위 「Features Removed …」 줄(2022부터 더 개발하지 않음, 2028 Preview에서 WINS 서버 역할 제거). Server Core 표에서 WINS 서버는 **기능**이다(위 「서버 역할과 기능」 항목). **지금 판 새 범위 마법사에는 「WINS 서버」 페이지가 있다**(빠른 시작 2025-04-17판) — 2028에서도 남는지는 문서에 없다
- **한국어 이름**: 한국어판은 「권한 부여」, 「범위」, 「새 범위」·「새 범위 마법사」, 「범위 이름」, 「IP 주소 범위」, 「제외 및 지연 추가」(「Core network components」 한국어판은 「제외 추가」), 「임대 기간」(「일, 시간 및 분」), 「DHCP 옵션 구성」, 「라우터(기본 게이트웨이)」, 「도메인 이름 및 DNS 서버」, 「WINS 서버」, 「범위 활성화」, 「범위 옵션」·「옵션 구성」,
  「예약」·「새 예약」·「주소 임대」·「예약에 추가」·「클라이언트 예약」, 「주소 풀」·「새 제외 범위」·「제외 추가」·「제외 범위」, 「Windows 관리 도구」, 「WINS(Windows 인터넷 이름 서비스)」로 옮긴다. **고른 이름**: 위 한국어판 표기 그대로이고, 「지연」은 「제외 및 지연 추가」 페이지에서 정하는 「지연 시간」(밀리초)으로 쓴다(「서브넷 지연」은 문서에서 확인한 이름이 아니다). **실제 한국어 Windows 화면의 이름은 확인하지 못했다**

쓰인 곳: (phase 81 step 2에서 쓰일 곳) `windows-server-roles.dhcp-server-role`(설치·고정 IPv4 주소, DHCP 콘솔을 여는 자리 — 실행 이름은 쓰지 않는다, 권한 부여, 범위의 뜻, 새 범위 마법사의 차례와 이름, 시작·끝 주소에서 마스크가 채워진다, 임대 기간의 단위(마법사는 일·시간·분, cmdlet은 `일.시:분:초`)와 cmdlet 기본값 8일, 지연 시간의 뜻·밀리초·0~1000·분할 범위의 보조 서버, 활성 범위만 답한다, 제외 범위와 그 예외, 범위 옵션, WINS의 뜻과 지원 상태);
(phase 81 step 3에서 쓰일 곳) `windows-server-roles.dhcp-reservation`(예약의 뜻 — MAC 주소·클라이언트 ID, 새 예약에 넣는 것, 유형 셋과 기본 Both, BOOTP 클라이언트, 제외 범위 안에서도 예약은 나간다, 범위 안의 주소, 예약 수준 옵션); 기출 대조(`exam-notes.md` 「phase 81 step 0」 문단 — [기출 2025-02-23 #44], [기출 2026-08-02 #32]).
BOOTP가 무엇인지는 이미 있는 「(phase 73 step 1) RFC 951 — Bootstrap Protocol (BOOTP), RFC 2131 …」 항목으로 댄다
- (phase 81 step 3) `Add-DhcpServerv4Reservation`을 2026-11-18에 다시 받아 읽었다 — `updated_at` 2025-05-14(`ms.date` 2016-12-20, `windowsserver2025-ps` 판, 위 줄과 같은 판). 「Syntax」: `-ScopeId`(위치 1, 필수 — 예약을 만들 범위의 ID)·`-IPAddress`(위치 2, 필수 — 클라이언트에게 예약할 IPv4 주소)·`-ClientId`(위치 3, 필수)·`-Name`·`-Description`·`-Type`.
  `-Name`은 만든 예약의 이름이고, 클라이언트의 호스트 이름이나 DHCP 서버에서 그 예약을 알아볼 이름을 쓴다. 「Example 1」은 `Add-DhcpServerv4Reservation -ScopeId 10.10.10.0 -IPAddress 10.10.10.8 -ClientId "F0-DE-F1-7A-00-5E" -Description "…"` 꼴이다 — **범위 ID를 그 범위가 나눠 주는 서브넷의 주소(`10.10.10.0`)로 적고, MAC 주소를 두 자리씩 하이픈으로 이어 적는다.** 「Example 4」도 「the scope 10.10.10.0」이라 부르고,
  같은 판 `Add-DhcpServerv4Scope`(2025-05-14)의 예 1은 `-StartRange 10.10.10.1 -EndRange 10.10.10.254 -SubnetMask 255.255.255.0`이 「10.10.10.0/24 서브넷의 범위」를 만든다고 적는다. 「Example 3」은 `Get-DhcpServerv4Lease`로 얻은 임대를 이 cmdlet에 넘겨 예약으로 바꾼다(콘솔의 「예약에 추가」와 같은 일)
  쓰인 곳: (phase 81 step 3) `windows-server-roles.dhcp-reservation`(예 — `Add-DhcpServerv4Reservation -ScopeId 192.0.2.0 -IPAddress 192.0.2.150 -ClientId "00-00-5E-00-53-01"`, 범위 ID는 서브넷 주소, `-Type`을 적지 않으면 Both, 예약 이름의 뜻)

## (phase 81 step 0) Microsoft Learn — DHCP 장애 조치: DHCP failover overview, Add-DhcpServerv4Failover, Set-DhcpServerv4Failover; 지난 판 Step-by-Step: Configure DHCP for Failover (Windows Server 2012)
https://learn.microsoft.com/en-us/windows-server/networking/technologies/dhcp/dhcp-failover
https://learn.microsoft.com/en-us/powershell/module/dhcpserver/add-dhcpserverv4failover?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/powershell/module/dhcpserver/set-dhcpserverv4failover?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/hh831385(v=ws.11)

2026-11-18에 IPv4로 내려받아 읽은 판: 「DHCP failover overview」 `updated_at` 2026-02-16(`ms.date` 2025-03-11, 「Applies to」 Windows Server 2016~2025·Azure Local 2311.2 이후), 한국어판 「DHCP 장애 조치(failover) 개요」 2026-02-16. cmdlet 둘은 2025-05-14(2016-12-20, `windowsserver2025-ps` 판, 한국어판은 영문 그대로).
지난 판 「Step-by-Step: Configure DHCP for Failover」 2021-11-12(`ms.date` 2016-08-31, 「Applies To」 Windows Server 2012) — **지금 판 개요가 서버 관리자로 장애 조치를 구성하는 안내(「step-by-step guide」)로 링크한다.** MCLT를 한 문장으로 정의한 곳은 이 지난 판 문서뿐이다(지금 판 개요는 MCLT의 쓰임만 적는다).

- **DHCP 장애 조치**(개요 첫머리·「Introduction to DHCP failover」): Microsoft DHCP 서버 두 대가 가용성 정보를 나눠 갖게 하는 것 — 주 서버와 그 장애 조치 파트너 사이에 IP 주소 임대와 설정을 복제해 고가용성을 준다. **활성 임대를 포함한 범위 정보를 모두 나누므로 한 서버를 쓸 수 없게 되면 다른 서버가 그 DHCP 클라이언트를 맡을 수 있다.**
  DHCPv4 범위를 주 서버에서 파트너로 복제하고, 장애 조치를 켠 범위를 나눠 맡는 두 서버를 **장애 조치 파트너**라 부른다. Microsoft의 구현은 IETF의 DHCP Failover Protocol 초안을 바탕으로 한다. 범위와 설정은 **DHCP 장애 조치 관계**(failover relationship)라는 개체로 나누고, 관계는 언제나 DHCP 서버 **두 대** 사이다(서버 하나가 여러 관계를 맺을 수는 있다). 장애 조치를 켠 범위를 고치면 그 바뀐 것을 파트너로 손으로 복제해야 한다
- 「DHCP failover specifications」: 한 범위의 장애 조치에 DHCP 서버를 셋 이상 넣을 수 없다. **DHCPv4 범위만** 지원하고 DHCPv6 범위는 장애 조치를 켤 수 없다(「DHCP failover and IPv6」). 클라이언트는 두 파트너와 직접이나 DHCP 릴레이로 통신할 수 있어야 하고, 임대를 처음 준 서버가 아닌 서버가 그 임대를 갱신할 수 있다. 두 서버는 동기화된 임대 데이터베이스를 각자 따로 가진다.
  두 서버는 다른 서브넷에 있어도 된다. 두 파트너는 Windows Server 2016 이상을 실행해야 한다(문서의 말). 두 서버는 늘 이어진 TCP/IP 연결을 유지하려 하고 서로의 DHCP 서비스 상태를 안다. 서로 통신하지 못하면 같은 주소를 서로 다른 두 클라이언트에게 주지 않도록 조심한다. 장애 조치 메시지는 **TCP 647**로 주고받는다(「Windows Firewall」). 두 서버의 시각 차가 1분을 넘으면 구성이 멈춘다(「Time synchronization」 — 가져오지 않아도 된다)
- **두 방식**(「DHCP failover modes」): 관계를 만들 때 고르고, 한 범위에는 한 번에 한 방식만 쓴다(서버 하나가 관계를 여럿 맺으면 두 방식을 함께 쓸 수 있다).
  **핫 대기 모드**(hot standby, 「Hot standby mode」): 활성 서버가 그 범위·서브넷의 모든 클라이언트에게 주소와 설정을 임대하고, 파트너는 **대기 서버**로서 활성 서버를 쓸 수 없을 때만 임대한다 — 중복성을 위한 방식. 기본으로는 관계를 만든 서버가 활성 서버다. 활성 서버가 답하지 않을 때 대기 서버가 쓰도록 남겨 둘 주소의 비율(**예약 비율**, 기본 **5%**)을 정하고, 이 비율은 새 임대에 쓰인다.
  **부하 분산 모드**(load balance, 「Load balance mode」): **기본 방식**이다. 두 서버가 같은 서브넷의 클라이언트에게 동시에 주소와 옵션을 주고 요청을 나눈다. **기본 비율은 50:50**이고 0~100%로 바꿀 수 있다. RFC 3074대로 클라이언트 요청에 든 MAC 주소로 해시를 계산하고, 해시 값의 구간(해시 버킷)을 비율대로 두 서버에 나눠 각자 자기 구간의 클라이언트에게 답한다. 두 서버가 같은 곳에 있을 때 알맞다
- **MCLT가 쓰이는 곳**(지금 판 개요): 핫 대기에서 클라이언트가 활성 서버에 닿지 못하는 대기 서버에게 임대 갱신을 청하면, 대기 서버는 그 클라이언트가 전에 받은 **같은 주소를 갱신해 주되 범위의 임대 기간 전체가 아니라 MCLT(최대 클라이언트 리드 타임) 동안의 임시 임대**를 준다. 대기 서버가 MCLT가 끝나기 전에 예약 비율의 주소를 새 클라이언트에게 다 주면 새 임대를 거부하고 기존 임대만 갱신하며, MCLT가 끝나면 남은 주소 풀 전체를 새 임대에 쓸 수 있다(통신 중단 상태로 남아 있으면 그렇게 하지 않는다).
  부하 분산에서 파트너와 연락이 끊긴 서버는 모든 클라이언트에게 임대를 주기 시작하고, **파트너에게 배정됐던 클라이언트가 갱신을 청하면 같은 주소를 MCLT 동안만 임시로 갱신**해 준다. 처음 오는 클라이언트에게는 자기 빈 주소에서, 그것이 다하면 파트너의 빈 주소에서 준다. **파트너 다운 상태**(partner down)에 들어가면 MCLT만큼 기다린 뒤 주소 풀 100%를 맡는다
- **MCLT의 정의**(지난 판 2012 「Configure a failover relationship」의 Important): MCLT(Maximum Client Lead Time)는 DHCP 임대가 끝난 뒤 클라이언트에게 더 주어지는 시간이고, 주 서버가 CONNECT 메시지로 보조 서버에 알린다. **한 서버가 파트너 서버가 알고 있는 시각을 넘어 클라이언트의 임대를 늘려 줄 수 있는 최대 시간**이다. 그 시험 랩은 1분을 쓰지만 실제 환경에서는 1시간처럼 더 길게 두라고 한다.
  같은 문서의 장애 조치 구성 차례: DHCP 콘솔에서 범위 오른쪽 클릭 「Configure failover」 → 「Configure Failover」 마법사 → 파트너 서버 → 새 장애 조치 관계(관계 이름, Shared Secret, Maximum Client Lead Time(시간·분), Mode — Load balance나 Hot standby, 기본 Load balance) → 마침
- **매개 변수와 기본값**(`Add-DhcpServerv4Failover`): 부하 분산이나 핫 대기 방식으로 새 IPv4 장애 조치 관계를 만들고, 그 관계를 **두 DHCP 서버 모두에** 만든다(로컬의 범위를 파트너에도 똑같이 만든다). `-MaxClientLeadTime` — 그 관계의 최대 클라이언트 리드 타임, **기본 1시간**. `-LoadBalancePercent` — 로컬 서버가 맡을 클라이언트 요청의 비율, 나머지는 파트너, **기본 50%**. `-ReservePercent` — 대기 서버에 남겨 둘 빈 주소의 비율, 장애가 나면 이 주소를 새 클라이언트에게 준다, **기본 5**.
  `-ServerRole` — 핫 대기에서 로컬의 역할 Active·Standby, 기본 Active(파트너가 대기). **`-SharedSecret` — 메시지 다이제스트 인증에 쓰는 공유 비밀**이고, 정하면 그 관계의 메시지 다이제스트 인증이 저절로 켜지고 정하지 않으면 꺼진다. **`-StateSwitchInterval` — DHCP 서버가 COMMUNICATION INTERRUPTED(통신 중단) 상태로 있다가 PARTNER DOWN(파트너 다운) 상태로 넘어가기까지의 시간**(TimeSpan, 기본값 없음).
  `-AutoStateTransition` — 그 타이머가 끝나면 통신 중단에서 파트너 다운으로 **저절로** 넘어갈지, 기본 False이고 `-StateSwitchInterval`을 주면 True가 된다(곧 기본으로는 저절로 넘어가지 않는다 — 이어서 나오는 말). `Set-DhcpServerv4Failover`: 이 값들을 고친다. `-SharedSecret`을 비우면 인증이 꺼지고 주면 켜진다
- **한국어 이름**: 한국어판 개요는 「DHCP 장애 조치(failover)」, 「장애 조치(failover) 파트너」, 「장애 조치 관계」, 「핫 대기 모드」(한 곳은 「활성 대기」), 「부하 분산 모드」, 「활성 서버」·「대기 서버」, 「예약 비율」, 「MCLT(최대 클라이언트 리드 타임)」, 「공유 비밀」, 「통신 중단 상태」·「파트너 다운 상태」로 옮긴다.
  **고른 이름**: 「DHCP 장애 조치」, 「장애 조치 파트너」, 「핫 대기」(guide.md의 「상시 대기」 대신 — 한국어판이 절 제목과 본문에서 이 말을 쓰고 「상시 대기」는 한 번도 쓰지 않는다), 「부하 분산」, 「MCLT(최대 클라이언트 리드 타임)」(guide.md의 「최대 클라이언트 선행 시간」 대신 — 한국어판의 표기), 「공유 비밀」(guide.md의 「공유 암호」 대신), 「상태 전환 간격」은 한국어판에 없는 이름이라 「통신 중단 상태에서 파트너 다운 상태로 넘어가기까지의 시간」으로 풀어 쓰고 영문 `StateSwitchInterval`·state switchover interval을 함께 적는다. **실제 한국어 Windows 화면의 이름은 확인하지 못했다**

쓰인 곳: (phase 81 step 3에서 쓰일 곳) `windows-server-roles.dhcp-failover`(장애 조치의 뜻, 관계는 두 서버·DHCPv4만, 두 방식과 기본값 — 부하 분산이 기본·50:50, 핫 대기의 예약 비율 5%, MCLT의 정의와 쓰임·기본 1시간, 파트너 다운 뒤 MCLT만큼 기다린다, 공유 비밀은 메시지 인증, 통신 중단에서 파트너 다운으로 넘어가는 시간과 기본으로는 저절로 넘어가지 않는다, TCP 647);
기출 대조(`exam-notes.md` 「phase 81 step 0」 문단 — [기출 2026-05-17 #42]). DHCPDISCOVER를 다시 보내는 것은 클라이언트의 동작이라는 것은 이미 있는 「(phase 73 step 1) RFC 951 …, RFC 2131 …」 항목으로 댄다

## (phase 81 step 4) Microsoft Learn — IIS·IIS 관리자·사이트·바인딩·연결 제한·응용 프로그램 풀: Install the Web Server WEB1, Introduction to IIS Architectures, Getting Started with the IIS Manager in IIS, IIS Modules Overview, Export a Package through IIS Manager, How to Create a Simple IIS Manager Module, Remote Manager for Windows 2003, XP and Vista SP1, Understanding Sites, Applications, and Virtual Directories on IIS 7, Sites <sites>, Binding <binding>, Limits for a Web Site <limits>, Configuring Step 4: Configure Application Security, Build a Static Website on IIS, How to Set Up SSL on IIS 7 or later, FastCGI <fastCgi>, Application Pools <applicationPools>, Adding Application Pools <add>, Application Pool Identities; 문제 해결 — Event 115 when you connect HTTPS website, Enable SSL for all customers; Windows 드라이버 문서 — Serial Controller Driver Design Guide; 기출 오답의 도구 — Windows Firewall Tools, Advanced AD DS Management Using Active Directory Administrative Center (Level 200), Windows startup issues troubleshooting
https://learn.microsoft.com/en-us/windows-server/networking/core-network-guide/cncg/server-certs/install-the-web-server-web1
https://learn.microsoft.com/en-us/iis/get-started/introduction-to-iis/introduction-to-iis-architecture
https://learn.microsoft.com/en-us/iis/get-started/getting-started-with-iis/getting-started-with-the-iis-manager-in-iis-7-and-iis-8
https://learn.microsoft.com/en-us/iis/get-started/introduction-to-iis/iis-modules-overview
https://learn.microsoft.com/en-us/iis/publish/using-web-deploy/export-a-package-through-iis-manager
https://learn.microsoft.com/en-us/iis/develop/extending-the-management-ui/how-to-create-a-simple-iis-manager-module
https://learn.microsoft.com/en-us/iis/manage/remote-administration/remote-manager-for-windows-2003-xp-and-vista-sp1
https://learn.microsoft.com/en-us/iis/get-started/planning-your-iis-architecture/understanding-sites-applications-and-virtual-directories-on-iis
https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/
https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/bindings/binding
https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/limits
https://learn.microsoft.com/en-us/iis/application-frameworks/scenario-build-an-aspnet-website-on-iis/configuring-step-4-configure-application-security
https://learn.microsoft.com/en-us/iis/manage/creating-websites/scenario-build-a-static-website-on-iis
https://learn.microsoft.com/en-us/iis/manage/configuring-security/how-to-set-up-ssl-on-iis
https://learn.microsoft.com/en-us/iis/configuration/system.webserver/fastcgi/
https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/
https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/
https://learn.microsoft.com/en-us/iis/manage/configuring-security/application-pool-identities
https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/iis/www-administration-management/event-115-connect-https-website
https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/iis/www-authentication-authorization/enable-ssl-all-customers
https://learn.microsoft.com/en-us/windows-hardware/drivers/serports/
https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/tools
https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/adac/advanced-ad-ds-management-using-active-directory-administrative-center--level-200-
https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/windows-boot-issues-troubleshooting

2026-11-18에 IPv4로 내려받아 읽은 판: 「Install the Web Server WEB1」 `updated_at` 2025-09-22(`ms.date` 2020-08-07, 「Applies to」 Windows Server 2016~2025).
IIS 문서는 「Applies to」 줄이 없고 「Compatibility」 표에 IIS 판을 적는다 — 「Introduction to IIS Architectures」 2023-02-17(2007-11-16, IIS 7.0 이후), 「Getting Started with the IIS Manager in IIS」 2025-12-20(2007-11-16, 스스로 Windows Server 2008용으로 썼다고 적는다), 「IIS Modules Overview」 2024-04-11(2007-11-22),
「Export a Package through IIS Manager」 2025-12-20(2008-10-29), 「How to Create a Simple IIS Manager Module」 2025-12-20(2007-12-18), 「Remote Manager for Windows 2003, XP and Vista SP1」 2022-03-23(2008-03-10), 「Understanding Sites, Applications, and Virtual Directories on IIS 7」 2023-02-17(2007-11-23),
「Configuring Step 4…」 2020-05-09(2013-04-14), 「Build a Static Website on IIS」 2024-04-11(2013-04-14), 「How to Set Up SSL on IIS 7 or later」 2025-12-20(2007-11-22), 「Application Pool Identities」 2025-12-20(2014-03-28).
구성 참조(`ms.date` 모두 2016-09-26) — `<sites>`·`<binding>` 2025-12-20, `<limits>`·`<applicationPools>`·`<add>` 2022-04-06, `<fastCgi>` 2024-04-11. **여섯 다 「Compatibility」 표가 IIS 10.0에서 바뀌지 않았다고 적는다**(`<binding>`은 IIS 8.0에서 `sslFlags`가 더해졌다).
문제 해결 「Event 115…」 2025-02-11(2020-03-23)·「Enable SSL for all customers」 2025-02-11(2020-03-24) — 둘 다 원래 판을 「Internet Information Services」로만 적는다. 드라이버 문서 「Serial Controller Driver Design Guide」 2025-07-18(2022-03-13).
「Windows Firewall Tools」 2026-10-08(2025-04-07, Windows 11·10·Windows Server 2016~2025), 「Advanced AD DS Management…(Level 200)」 2025-09-23(2025-06-26, Windows Server 2016~2025), 「Windows startup issues troubleshooting」 2026-02-19(2026-02-12, 지원되는 Windows 클라이언트).
한국어판도 받았다(Vista 원격 관리 도구 글과 「Enable SSL…」은 빼고 — `updated_at` 2026-01-21~2026-11-13, IIS 문서는 2026-10-27 무렵, 기계 번역).

- **IIS**(Internet Information Services): Windows Server의 서버 역할 「웹 서버(IIS)」가 IIS다. 웹 사이트·서비스·응용 프로그램을 올려 두고 인터넷·인트라넷·엑스트라넷의 사용자에게 내주는 데 쓰고, 필요한 구성 요소만 골라 넣는 모듈 구조다. 문서는 IIS를 IIS·ASP.NET·FTP 서비스·PHP·WCF를 한데 묶은 웹 플랫폼으로 소개한다 — 「Install the Web Server WEB1」 첫머리.
  설치는 서버 관리자 「관리」 → 「역할 및 기능 추가」 → 「서버 역할」에서 웹 서버(IIS)를 고르거나 `Install-WindowsFeature Web-Server -IncludeManagementTools` — 같은 문서(설치 이름 `Web-Server`는 위 「(phase 81 step 0) … 서버 역할과 기능」 항목의 Server Core 표와 같다)
- **요청을 처리하는 차례**(IIS 7.0 이후): 커널 모드의 HTTP.sys가 HTTP 요청을 받아 큐에 둔다. WAS(Windows Process Activation Service)가 응용 프로그램 풀의 설정과 작업자 프로세스를 관리해, 요청이 온 풀에 작업자 프로세스가 없으면 하나 시작한다. 작업자 프로세스가 요청을 처리해 응답을 HTTP.sys에 돌려준다 — 「Introduction to IIS Architectures」 「Hypertext Transfer Protocol Stack (HTTP.sys)」·「Process Management」·「HTTP Request Processing in IIS」.
  IIS의 기능은 모듈로 나뉘고, 요청 필터링(`RequestFilteringModule` — 허용할 동사·확장자, 길이 한도, 나쁜 문자열 검사)과 로그(`HttpLoggingModule` — 로그에 적을 정보를 HTTP.sys에 넘긴다)도 모듈이다 — 같은 문서 「Security Modules」·「Logging and Diagnostics Modules」 표
- **IIS 관리자**(IIS Manager): IIS 7.0부터 쓰는 IIS의 그래픽 관리 도구다. IIS 6.0에서는 사이트를 오른쪽 클릭해 「All Properties」를 고르면 탭이 여럿 달린 속성 대화 상자가 열렸고, IIS 7.0의 IIS 관리자는 이것을 제어판처럼 늘어놓은 기능 목록으로 바꿨다 — 「Getting Started with the IIS Manager in IIS」 「Introduction」. 서버 연결로는 컴퓨터 관리자만 관리할 수 있다 — 같은 문서 「Server, Site and Application Connections」
- **IIS 관리자를 여는 방법**: 시작 → 실행(Run)에 `inetmgr`를 넣는다(「Export a Package through IIS Manager」 2단계), 시작의 검색 상자에 `inetmgr`를 넣고 Enter(「IIS Modules Overview」 「Querying, Adding and Removing Modules Using the IIS Manager」), Windows Server 2012·2012 R2는 서버 관리자 「도구」 → 「IIS(인터넷 정보 서비스) 관리자」(구성 참조 페이지마다의 「How To」 — 차례를 Windows Server 2012 R2까지만 적는다).
  실행 파일은 `\windows\system32\inetsrv\inetmgr.exe`다(「How to Create a Simple IIS Manager Module」 「Task 1」 — 디버깅할 외부 프로그램으로 이 파일을 고른다). Vista에 원격 관리 도구를 넣는 글은 시작의 검색 상자에 `inetmgr.exe`를 넣으라고 한다(「Remote Manager for Windows 2003, XP and Vista SP1」 「Installing on Windows Vista」).
  실행 창에 `.exe`까지 붙여 넣는 차례를 지금 판 문서에서 따로 찾지는 못했지만, `inetmgr.exe`는 IIS 관리자 실행 파일의 이름 그대로다. 명령 프롬프트는 확장자를 뺀 이름에 PATHEXT의 `.EXE`를 붙여 찾는다(위 「(phase 80 step 8) … MMC와 실행 이름」 항목의 `start` 줄)
- **기출 오답의 실행 이름**([기출 2024-11-03 #40] 대조용): `wf.msc`는 고급 보안이 포함된 Windows Defender 방화벽(MMC 스냅인)을 연다(「Windows Firewall Tools」 「Windows Defender Firewall with Advanced Security」). `dsac.exe`는 Active Directory 관리 센터의 실행 파일이다(「Advanced AD DS Management…(Level 200)」 — 실행 창에 `dsac.exe`, `runas /user:<도메인\사용자> dsac`).
  `msconfig`는 시스템 구성 도구로, 서비스를 골라 켠 채 시작해 문제를 찾는 데 쓴다(「Windows startup issues troubleshooting」 「Troubleshoot issues in the Kernel phase」). 셋 다 IIS 관리자가 아니다
- **사이트·응용 프로그램·가상 디렉터리**(IIS 7 이후의 짜임): 세 단이 겹쳐 있다 — 사이트 안에 응용 프로그램이, 응용 프로그램 안에 가상 디렉터리가 들고, 가상 디렉터리 하나는 컴퓨터의 실제 디렉터리 하나를 가리킨다. 사이트마다 적어도 루트 응용 프로그램 하나, 응용 프로그램마다 적어도 루트 가상 디렉터리 하나가 있고, 클라이언트는 사이트에 붙인 바인딩(하나 이상, 사이트끼리 겹치지 않는)으로 사이트를 찾아온다.
  사이트에 딸린 설정으로 제한(대역폭·연결 수·연결 시간)과 로그가 있다 — 「Understanding Sites…」 「About Sites, Applications, and Virtual Directories in IIS 7 and Above」·「Sites」
- **Default Web Site**(한국어판 「기본 웹 사이트」): IIS를 설치하면 `ApplicationHost.config`(`%windir%\system32\inetsrv\config\`)에 사이트가 하나 들어 있다 — 이름 `Default Web Site`, id 1, 루트 가상 디렉터리의 실제 경로 `%SystemDrive%\inetpub\wwwroot`, 바인딩은 형식 `http`·`*:80:`(모든 IP 주소의 80번, 호스트 이름 없음).
  같은 기본 구성에 사이트 기본값으로 로그 형식 W3C와 로그 디렉터리 `%SystemDrive%\inetpub\logs\LogFiles`가, 응용 프로그램 기본값으로 응용 프로그램 풀 `DefaultAppPool`이 들어 있다 — 「Understanding Sites…」 「IIS Configuration: <sites> Section」(Windows Server 2008에 설치한 뒤의 내용), `<sites>` 「Configuration Sample」(IIS 10.0에서 바뀌지 않았다).
  `*`가 모든 IP 주소라는 것은 「Build a Static Website on IIS」 「Step 2: Add a Website」(`http/*:85:`는 모든 IP 주소의 85번으로 오는 HTTP 요청을 받는다)
- **새 사이트 만들기**: IIS 관리자 「연결」 창에서 서버를 펼쳐 「사이트」를 고르고 「작업」 창 「웹 사이트 추가...」 → 「웹 사이트 추가」 대화 상자에 적어도 「사이트 이름」과 「실제 경로」를 넣는다. 기본 웹 사이트를 계속 쓴다면 새 사이트의 바인딩을 달리 해야 해서, 포트를 바꾸거나 호스트 이름을 넣는다 — `<sites>` 「How To」
- **사이트 바인딩**: 클라이언트가 사이트와 통신할 때 쓰는 프로토콜(`http`·`https` — 바인딩 프로토콜)과 사이트에 닿는 정보(사이트의 IP 주소 — 또는 지정하지 않은 IP 주소, 포트 번호, 선택으로 호스트 헤더 — 바인딩 정보)의 짝이다. 사이트 하나가 바인딩을 여럿 가질 수 있고(예: HTTP와 HTTPS를 함께), 인터넷에서 보이려면 HTTP나 HTTPS 바인딩이 적어도 하나 있어야 한다 — `<binding>` 「Overview」·「Configuration」·「Attributes」, 「Understanding Sites…」 「Sites」.
  IIS 관리자에서는 사이트를 고르고 「작업」 창 「바인딩...」 → 「사이트 바인딩」 대화 상자 「추가...」 → 「사이트 바인딩 추가」에 넣는다 — `<binding>` 「How To」. 「사이트 바인딩 추가」의 칸은 「형식」(https 등)·「IP 주소」(목록에서 「All Unassigned」 — 쓸 특정 주소가 없으면)·「포트」(https면 기본 443)·「호스트 이름」·「SSL 인증서」다 — 「Configuring Step 4…」 「4.5. TLS/SSL Communication」.
  구성 예: `192.168.0.1:80:www.contoso.com`(그 주소·80번·그 호스트 이름), `*:443:`(모든 주소의 443번) — `<binding>` 「Configuration Sample」
- **한 서버의 여러 사이트**: IIS에 사이트를 여럿 두려면 사이트마다 IP 주소나 포트 번호나 호스트 헤더가 달라야 한다. 같은 문서는 IP 주소·TCP 포트가 같고 호스트 헤더만 다른 두 사이트를 들어, HTTP 쪽은 맞는 설정이지만 HTTPS(SSL) 쪽은 호스트 헤더로 가를 수 없어 둘째 사이트의 443번이 시작하지 못한다고 하고, IIS 8부터 SNI(서버 이름 표시)로 이 문제를 푼다고 적는다 — 「Event 115…」 「Workaround 1」.
  그러니 HTTP 사이트는 IP 주소·포트가 같아도 호스트 이름으로 가를 수 있다 — 같은 절과 `<sites>` 「How To」에서 이어서 나오는 말
- **연결 제한**(사이트의 `<limits>`): 사이트로 오는 클라이언트 요청의 대역폭·연결 수·연결 시간을 제한한다 — 「Overview」. `maxBandwidth` — 사이트가 쓸 네트워크 대역폭의 상한(초당 바이트), 기본 4294967295. `maxConnections` — 사이트에 동시에 이어질 수 있는 클라이언트 연결 수의 상한, 기본 4294967295.
  `connectionTimeout` — 쉬고 있다고(비활성으로) 판단한 연결을 끊기 전에 IIS가 기다리는 시간(초), 기본 2분(`00:02:00`). (`maxUrlSegments` — URL 세그먼트 수의 상한, 기본 32 — 쓰지 않는다.) 이 셋은 IIS 6.0 메타베이스의 ConnectionTimeout·MaxBandwidth·MaxConnections를 대신한다 — 「Attributes」·「Compatibility」.
  IIS 관리자에서는 사이트를 고르고 「작업」 창 「고급 설정...」 → 「고급 설정」 대화 상자에서 「제한」을 펼쳐 정한다 — 「How To」. 칸의 화면 이름은 문서의 그림에만 있어 확인하지 못했다
- **HTTPS**: IIS에서 HTTPS를 쓰려면 인증서를 얻고(IIS 관리자의 서버 노드 「서버 인증서」 — 자체 서명 인증서 만들기도 있다), 사이트에 형식 `https` 바인딩을 더해 그 인증서를 고른다. 새 바인딩의 기본은 HTTP·80번이라 형식에서 https를 고른다 — 「How to Set Up SSL on IIS 7 or later」 「Introduction」·「IIS Manager」
- **PHP와 FastCGI**: IIS에는 FastCGI 구성 요소가 들어 있어 PHP 같은 웹 응용 프로그램 프레임워크를 IIS에서 실행할 수 있다. 쓰려면 CGI 역할 서비스(서버 역할 → 웹 서버(IIS) → 웹 서버 → 응용 프로그램 개발 → CGI)를 설치하고, FastCGI 응용 프로그램으로 PHP 실행 파일의 경로를 정해 둔다 — `<fastCgi>` 「Overview」·「Setup」·「How To」(IIS 10.0에서 바뀌지 않았다). 「Install the Web Server WEB1」도 IIS가 묶는 것에 PHP를 든다
- **응용 프로그램 풀**(application pool): 같은 설정을 쓰는 작업자 프로세스 하나 이상의 묶음이고, 그 풀에 맡긴 **응용 프로그램 하나 이상**의 요청을 처리한다. 작업자 프로세스마다 프로세스 경계로 떨어져 있어, 한 풀의 응용 프로그램에 문제가 생겨도 다른 풀의 사이트·응용 프로그램에 번지지 않는다. 풀은 필요한 만큼 만들 수 있다(많으면 성능에 영향) — `<applicationPools>` 「Overview」(IIS 10.0에서 바뀌지 않았다).
  응용 프로그램은 사이트에 속하면서 풀에도 속하고, 풀이 그 응용 프로그램을 다른 풀의 응용 프로그램과 떼어 놓는다 — 「Understanding Sites…」 「Applications」. 새 풀에 꼭 정할 것은 고유한 이름이다 — `<add>` 「Overview」. IIS를 설치하면 `DefaultAppPool`이 있고 구성 파일의 응용 프로그램 기본값이 이 풀이다(위 Default Web Site 줄).
  작업자 프로세스는 `w3wp.exe`이고, 풀마다 그 풀 이름을 딴 계정(응용 프로그램 풀 ID)으로 실행된다 — 「Application Pool Identities」 첫머리
- **시리얼 포트**(serial port, 직렬 포트): 직렬 컨트롤러(16550 UART나 호환 장치)에 달린 하드웨어 통신 인터페이스이고 주변 장치가 거기에 이어진다. 옛 Windows에서는 PC 케이스에 이름 붙은 COM 포트였다 — 「Serial Controller Driver Design Guide」 첫머리. 사이트 바인딩의 포트는 이것이 아니라 TCP 포트 번호다(위 바인딩 줄, 「(phase 77) RFC 6335 …」 같은 포트 항목들) — 이어서 나오는 말
- **IIS 6.0 꼴의 사이트 속성**: 문제 해결 「Enable SSL for all customers」는 사이트의 「속성」 대화 상자 「웹 사이트」 탭에서 SSL 포트를 확인하고, 「고급」에서 그 사이트의 IP 주소·포트 짝 목록(「Multiple identities for this web site」)에 443번을 더하는 차례를 보인다 — 「Enforce SSL connections」. 위 「Getting Started with the IIS Manager」 줄의 탭 달린 속성 대화 상자 꼴이고, 지금 판에서는 이 값들이 바인딩과 「고급 설정」으로 옮겨 왔다
- **한국어 이름**: 한국어판은 「웹 서버(IIS)」, 「IIS(인터넷 정보 서비스) 관리자」, 「기본 웹 사이트」, 「연결」 창·「작업」 창, 「웹 사이트 추가」·「사이트 이름」·「실제 경로」·「호스트 이름」, 「바인딩...」·「사이트 바인딩」·「사이트 바인딩 추가」·「바인딩 편집」, 「할당되지 않은 모든 항목」(All Unassigned — 구성 참조 한국어판은 속성 설명에서 「지정되지 않은 IP 주소」로도 옮긴다), 「고급 설정」 → 「제한」,
  `<limits>` 속성 설명의 「최대 대역폭」·「최대 연결 수」·「연결 제한 시간」, 「애플리케이션 풀」·「작업자 프로세스」·「서버 인증서」로 옮긴다.
  **고른 이름**: 「IIS 관리자」, 「사이트」, 「Default Web Site」(이름이라 영문 그대로 쓰고 「기본 웹 사이트」로도 옮긴다는 것을 한 번 밝힌다 — guide.md와 같다), 「사이트 바인딩」과 그 네 값 「형식」·「IP 주소」·「포트」·「호스트 이름」, 「할당되지 않은 모든 항목」(All Unassigned — guide.md의 「지정하지 않은 모든 IP」 대신, 한국어판 문서가 대화 상자 차례에서 쓰는 표기),
  연결 제한 셋은 화면 이름을 확인하지 못해 영문 속성 이름을 함께 적는다 — 「연결 제한 시간」(`connectionTimeout`, 기출은 「연결 시간 제한」)·「최대 연결 수」(`maxConnections`, 기출은 「연결 수 제한」)·「최대 대역폭」(`maxBandwidth`),
  「응용 프로그램 풀」(guide.md와 기출 [기출 2025-11-02 #41]의 표기 — 한국어판 문서는 「애플리케이션 풀」로만 옮긴다는 것을 본문에서 한 번 밝힌다), 「작업자 프로세스」. **실제 한국어 IIS 관리자 화면의 이름은 확인하지 못했다**
- (phase 81 step 5, 2026-11-18 IPv4로 내려받아 읽음) 이 step이 더 본 문서 넷:
  https://learn.microsoft.com/en-us/iis/extensions/planning-for-arr/overview-of-shared-hosting-deployment-using-application-request-routing-20 (`updated_at` 2022-03-21, `ms.date` 2008-07-02, 한국어판 `updated_at` 2026-10-27),
  https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/application/ (`updated_at` 2022-04-06, `ms.date` 2016-09-26),
  https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/ 의 「How To」(위에서 「Overview」만 쓴 같은 문서, `updated_at` 2022-04-06, 한국어판도 받음),
  https://learn.microsoft.com/en-us/windows/deployment/usmt/usmt-recognized-environment-variables (`updated_at` 2025-06-04, `ms.date` 2025-01-29)
- (phase 81 step 5) **호스트 이름으로 사이트를 가르는 차례**: ARR 2.0의 공유 호스팅 개요는 흔한 공유 호스팅 배치를 이렇게 그린다 — 사용자가 `www.site2.com`을 요청하고, DNS에 그 이름을 물어 IP 주소를 받고, 브라우저가 그 IP 주소로 요청을 보내면, **호스트 이름에 따라 요청이 해당 사이트로 간다** — 「Common Shared Hosting Deployment」 1~6.
  웹 브라우저가 이름을 요청에 담아 보내는 자리는 위 「RFC 9110」 항목의 「(phase 81 step 5)」 줄(Host 헤더)이다. HTTPS 쪽(SNI)은 쓰지 않으므로 본문은 이 규칙을 `http` 사이트에 한정해 쓴다(위 「한 서버의 여러 사이트」 줄)
- (phase 81 step 5) **응용 프로그램과 풀의 연결**: IIS 7 이후의 응용 프로그램은 HTTP 같은 프로토콜로 내용을 내주거나 서비스를 하는 파일의 묶음이고, 응용 프로그램을 만들면 그 경로가 사이트 URL의 일부가 된다. 사이트마다 루트 응용 프로그램이 하나 있어야 한다.
  `<application>`의 `applicationPool` 속성은 그 응용 프로그램이 **맡겨진 응용 프로그램 풀**을 정한다(기본값 없음 — 위 Default Web Site 줄의 `applicationDefaults`가 `DefaultAppPool`을 준다) — `<application>` 「Overview」·「Attributes」(IIS 10.0에서 바뀌지 않았다).
  그러니 두 사이트의 루트 응용 프로그램이 같은 풀을 가리키면 그 풀 하나가 두 사이트의 요청을 처리한다 — 풀이 「맡긴 응용 프로그램 하나 이상」을 처리한다는 위 응용 프로그램 풀 줄과 이어서 나오는 말
- (phase 81 step 5) **풀을 만들고 사이트에 고르는 차례**(`<add>` 「How To」 — IIS 관리자를 여는 차례는 Windows Server 2012 R2까지 적는다): 「연결」 창에서 서버 이름을 펼치고 「응용 프로그램 풀」을 고른 뒤 「작업」 창 「응용 프로그램 풀 추가...」 → 「응용 프로그램 풀 추가」 대화 상자의 「이름」에 풀 이름을 넣는다.
  있는 사이트의 풀을 바꾸려면 「연결」 창에서 「사이트」를 펼쳐 그 사이트를 고르고 「작업」 창 「고급 설정...」 → 「고급 설정」 대화 상자 「일반」의 「응용 프로그램 풀」 항목 → 줄임표 단추 → 「응용 프로그램 풀 선택」 대화 상자에서 풀을 고른다. 한국어판은 「애플리케이션 풀」·「애플리케이션 풀 추가」·「애플리케이션 풀 선택」·「고급 설정」·「일반」으로 옮긴다
- (phase 81 step 5) **`%SystemDrive%`**: Windows 폴더가 들어 있는 드라이브이고 값은 `C:`처럼 드라이브 이름이다 — 「Recognized environment variables」 표(SYSTEMDRIVE). 그러니 Default Web Site의 `%SystemDrive%\inetpub\wwwroot`는 Windows가 들어 있는 드라이브의 `inetpub\wwwroot` 폴더다
- (phase 81 step 5) 쓰인 곳: `windows-server-roles.iis`(응용 프로그램의 뜻, 사이트를 풀에 맡기는 값과 IIS 관리자의 차례, 한 풀이 두 사이트를 맡는 예, Default Web Site 폴더가 놓이는 드라이브), `windows-server-roles.iis-site-bindings`(호스트 이름에 따라 요청이 사이트로 간다), 문항 n292·n293

쓰인 곳: (phase 81 step 5에서 쓰일 곳) `windows-server-roles.iis`(IIS와 웹 서버(IIS) 역할·설치, IIS 관리자와 여는 방법·실행 파일 `inetmgr.exe`, 사이트와 Default Web Site의 이름·바인딩·실제 경로, HTTPS 바인딩과 서버 인증서, CGI 역할 서비스와 FastCGI로 PHP, 응용 프로그램 풀의 뜻·격리·응용 프로그램 하나 이상·`DefaultAppPool`·`w3wp.exe`, 사이트와 응용 프로그램 풀의 차이),
`windows-server-roles.iis-site-bindings`(바인딩의 네 값과 「사이트 바인딩 추가」의 칸, `*`와 「할당되지 않은 모든 항목」, 한 서버의 여러 사이트는 IP·포트·호스트 이름 가운데 하나가 달라야 하고 HTTP는 호스트 이름으로 가른다, 연결 제한 셋의 뜻과 기본값과 「고급 설정」의 「제한」, 포트 번호와 시리얼 포트의 차이);
기출 대조(`exam-notes.md` 「phase 81 step 4」 문단 — [기출 2024-11-03 #40], [기출 2025-11-02 #41], [기출 2025-02-23 #28]과 **E40**)

## (phase 81 step 4) Microsoft Learn — IIS의 실제 경로·기본 문서·디렉터리 검색·가상 디렉터리·요청 필터링·로그: Create a Web Site, Compatibility and Feature Requirements for Windows Vista, Virtual Directory <virtualDirectory>, Default Document <defaultDocument>, Directory Browse <directoryBrowse>, Request Filtering <requestFiltering>, File Name Extensions <fileExtensions>, Request Limits <requestLimits>, Use Request Filtering, Log Files for a Web Site <logFile>, Configure Logging in IIS, Managing IIS Log File Storage, Logging to Event Tracing for Windows in IIS 8.5; 문제 해결 — How to create a virtual directory on an existing Web site to a folder that resides on a remote computer
https://learn.microsoft.com/en-us/iis/get-started/getting-started-with-iis/create-a-web-site
https://learn.microsoft.com/en-us/iis/install/installing-iis-7/compatibility-and-feature-requirements-for-windows-vista
https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/application/virtualdirectory
https://learn.microsoft.com/en-us/iis/configuration/system.webserver/defaultdocument/
https://learn.microsoft.com/en-us/iis/configuration/system.webserver/directorybrowse
https://learn.microsoft.com/en-us/iis/configuration/system.webserver/security/requestfiltering/
https://learn.microsoft.com/en-us/iis/configuration/system.webserver/security/requestfiltering/fileextensions/
https://learn.microsoft.com/en-us/iis/configuration/system.webserver/security/requestfiltering/requestlimits/
https://learn.microsoft.com/en-us/iis/manage/configuring-security/use-request-filtering
https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/logfile/
https://learn.microsoft.com/en-us/iis/manage/provisioning-and-managing-iis/configure-logging-in-iis
https://learn.microsoft.com/en-us/iis/manage/provisioning-and-managing-iis/managing-iis-log-file-storage
https://learn.microsoft.com/en-us/iis/get-started/whats-new-in-iis-85/logging-to-etw-in-iis-85
https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/create-virtual-directory-folder-remote-computer

2026-11-18에 IPv4로 내려받아 읽은 판: 「Create a Web Site」 `updated_at` 2023-02-17(`ms.date` 2009-11-15), 「Compatibility and Feature Requirements for Windows Vista」 2024-04-11(2007-11-22, IIS 7.0 때 글), 「Use Request Filtering」 2020-05-14(2007-11-22),
「Configure Logging in IIS」 2024-04-11(2013-04-14 — 갖출 것으로 Windows Server 2012·Windows 8을 적는다), 「Managing IIS Log File Storage」 2025-12-20(2014-05-30), 「Logging to Event Tracing for Windows in IIS 8.5」 2022-06-14(2013-07-11).
구성 참조(`ms.date` 모두 2016-09-26) — `<virtualDirectory>`·`<directoryBrowse>` 2022-03-21, `<defaultDocument>`·`<fileExtensions>` 2022-04-06, `<requestFiltering>`·`<requestLimits>`·`<logFile>` 2025-12-20. 「Compatibility」 표: `<virtualDirectory>`·`<defaultDocument>`·`<directoryBrowse>`·`<requestLimits>`·`<logFile>`는 IIS 10.0에서 바뀌지 않았고,
`<requestFiltering>`은 IIS 10.0에서 서버 헤더를 숨기는 설정만 더해졌다(`<logFile>`은 IIS 8.5에서 버퍼·ETW·줄 길이·사용자 지정 필드 설정이 더해졌다).
문제 해결 「How to create a virtual directory … remote computer」 2026-02-19(2026-02-12, 「Applies to」 지원되는 Windows Server, 원래 KB 308150 — 본문의 차례는 옛 관리 도구 「Internet Services Manager」로 적었다). 한국어판도 모두 받았다(`updated_at` 2026-10-14~2026-10-27, 기계 번역).

- **실제 경로**(physical path): 새 사이트에 꼭 정할 둘(「사이트 이름」과 함께) 가운데 하나이고, 사이트의 루트 가상 디렉터리가 이어지는 컴퓨터의 폴더다(위 「(phase 81 step 4) … IIS·IIS 관리자 …」 항목의 `<sites>` 「How To」와 「Understanding Sites…」).
  IIS를 설치하면 기본 웹 사이트의 구성이 `\Inetpub\Wwwroot` 디렉터리에 만들어지는데, 웹 콘텐츠는 이 기본 디렉터리에 두어도 되고 파일 시스템의 원하는 곳에 디렉터리를 만들어 써도 된다 — 「Create a Web Site」 「Introduction」.
  IIS 설치는 `\inetpub`을 늘 `%SystemDrive%\inetpub`에 두지만, 설치 뒤에 그 폴더를 옮기고 기본 웹 사이트가 새 위치를 가리키게 바꿀 수 있다 — 「Compatibility and Feature Requirements for Windows Vista」 「Changing the Location of Web Root During Installation」
- **「홈 디렉터리」라는 이름**: 지금 판 IIS 문서(IIS 7 이후의 개념 글·구성 참조)는 웹 사이트의 내용 폴더를 「physical path(실제 경로)」라 부르고 「home directory」를 쓰지 않는다 — 그 말은 FTP 사용자 격리의 사용자별 홈 디렉터리에 나온다(이 phase는 FTP 사용자 격리를 다루지 않는다).
  웹 사이트의 내용 폴더를 「home directory」라 부르는 것은 옛 관리 도구로 차례를 적은 옛 KB 글이다 — 「How to create a virtual directory … remote computer」 첫머리: 원격 가상 디렉터리는 웹 사이트의 홈 디렉터리 안에 있지 않지만 브라우저에는 그 안에 있는 것처럼 보이는 디렉터리이고,
  표의 예에서 `C:\WWWroot`가 별칭 없는 홈 디렉터리(`http://Sales`), `\\RemoteServer\SalesData\ProdCustomers`가 별칭 `Customers`(`http://Sales/Customers`)다. 한국어판도 「홈 디렉터리」로 옮긴다
- **기본 문서**(default document): 사이트나 응용 프로그램의 루트 디렉터리로 요청이 오면 IIS가 돌려줄 파일 이름의 목록이다. 기본으로 켜져 있고(`enabled` 기본 true), 서버 전체의 기본 목록은 차례대로 `Default.htm`·`Default.asp`·`Index.htm`·`Index.html`·`Iisstart.htm`이다(ASP.NET을 설치하면 `Default.aspx`가 더해진다).
  IIS는 목록의 차례대로 그 파일이 있는지 보고 처음 있는 것을 브라우저에 보낸다. 목록 아래쪽 파일은 위의 파일을 모두 확인한 뒤에야 찾으므로 차례가 성능에 영향을 준다 — `<defaultDocument>` 「Overview」(IIS 10.0에서 바뀌지 않았다).
  IIS 관리자: 사이트·응용 프로그램을 고르고 「기본 문서」 두 번 클릭 → 「작업」 창 「추가...」 → 「기본 문서 추가」 대화 상자의 「이름」에 파일 이름을 넣는다. 「위로 이동」·「아래로 이동」으로 차례를 바꾸고 「제거」로 뺀다 — 「How To」
- **디렉터리 검색**(directory browsing): 켜 두면 디렉터리를 가리킨 요청에 그 디렉터리의 목록을 돌려준다. `enabled` **기본 false(꺼짐)**. `showFlags`는 목록에 항목마다 보일 정보를 고른다 — `Date`(마지막으로 고친 날짜)·`Time`(그 시각)·`Size`(파일 크기)·`Extension`(파일 이름 확장자)·`LongDate`(날짜를 긴 꼴로)·`None`(이름만), 기본은 `Date, Time, Size, Extension` — `<directoryBrowse>` 「Overview」·「Attributes」(IIS 10.0에서 바뀌지 않았다).
  역할 서비스 「디렉터리 검색」(웹 서버 → 일반 HTTP 기능)은 IIS 기본 설치에 들어 있다 — 「Setup」. IIS 관리자: 사이트·응용 프로그램·디렉터리를 고르고 「디렉터리 검색」 두 번 클릭 → 「작업」 창 「사용」 → 보일 정보를 고르고 「적용」 — 「How To」
- **기본 문서와 디렉터리 검색의 차례**: 루트 디렉터리로 요청이 오면 IIS는 기본 문서 목록에서 처음 있는 파일을 보낸다. 기본 문서를 끄고 디렉터리 검색을 켜 두면 디렉터리 목록을 보내고, 둘 다 끄면 「HTTP 404 파일이 없다」 오류를 보낸다 — `<defaultDocument>` 「Overview」 끝 두 문단.
  그러니 디렉터리 목록은 보낼 기본 문서가 없을 때의 답이다 — 이어서 나오는 말(기본 문서가 켜져 있되 목록의 파일이 하나도 없을 때 디렉터리 검색이 켜져 있으면 목록을 보낸다고 한 문장으로 적은 곳은 찾지 못했다).
  Apache의 `DirectoryIndex`(디렉터리 요청에 찾을 파일 목록)·`Options Indexes`(그 파일이 없으면 목록을 만든다)와 같은 짝이다 — 위 「(phase 79 step 9) Apache …」 항목과 이 항목의 정의를 나란히 둔 말
- **가상 디렉터리**(virtual directory): IIS에 정하는 디렉터리 이름(경로)이고 로컬이나 원격 서버의 실제 디렉터리에 이어진다. 그 이름이 응용 프로그램 URL의 일부가 되어, 사용자가 브라우저로 그 URL을 요청하면 실제 디렉터리의 내용(웹 페이지나 파일 목록)에 닿는다.
  실제 디렉터리와 다른 이름을 주면 URL이 사이트 루트에 그대로 대응하지 않아 서버의 실제 파일 구조를 알아내기 어렵다. 쓰임의 예: 응용 프로그램에 파일 시스템의 다른 곳에 있는 그림을 넣되 그 파일을 루트 가상 디렉터리의 폴더로 옮기고 싶지 않을 때 — `<virtualDirectory>` 「Overview」, 「Understanding Sites…」 「Virtual Directories」.
  IIS 관리자: 사이트를 고르고 「작업」 창 「가상 디렉터리 보기」 → 「가상 디렉터리 추가...」 → 「가상 디렉터리 추가」 대화 상자에 적어도 「별칭」과 「실제 경로」를 넣는다 — `<virtualDirectory>` 「How To」. 속성 `path`(가상 경로)·`physicalPath`(실제 경로) — 「Attributes」(IIS 10.0에서 바뀌지 않았다).
  별칭이 URL 경로가 되고 그 아래 요청이 실제 경로의 파일로 이어진다는 대응은 위 KB 글의 표(별칭 `Customers` → `http://Sales/Customers` → 원격 공유 폴더)와 같다
- **요청 필터링**(Request Filtering): IIS 7.0부터 들어 있는 보안 기능이고 IIS 6.0의 추가 도구 UrlScan이 하던 일을 대부분 대신한다. 거르는 기준 — URL에 든 문자열(`denyUrlSequences`, 공격자가 노릴 URL 조각), 파일 이름 확장자의 허용·거부 목록(`fileExtensions`, 예: `web.config` 요청 막기), 탐색할 수 없게 할 URL 구간(`hiddenSegments`, 예: ASP.NET의 `App_Code` 폴더),
  요청 크기 한도(`requestLimits` — 내용·URL·쿼리 문자열의 길이, 헤더 길이), HTTP 동사의 허용·거부(`verbs`, 예: TRACE 막기). IIS 7.5에서 늘 허용할 URL·쿼리 문자열, 거부할 쿼리 문자열, 사용자 지정 규칙이 더해졌다 — `<requestFiltering>` 「Overview」·「New in IIS 7.5」.
  IIS 기본 설치에 요청 필터링 역할 서비스(웹 서버 → 보안 → 요청 필터링)가 들어 있다 — 「Setup」
- **막힌 요청에 돌려주는 상태 코드**: 요청 필터링이 요청을 막으면 클라이언트에 HTTP 404 오류를 보내고, 막은 까닭을 가르는 하위 상태와 함께 로그에 적는다 — 404.5 URL 문자열 거부, 404.6 동사 거부, 404.7 파일 이름 확장자 거부, 404.8 숨겨진 구간, 404.11 이중 이스케이프, 404.12 상위 비트 문자, 404.14 URL이 너무 김, 404.15 쿼리 문자열이 너무 김, 404.18 쿼리 문자열 거부, 404.19 사용자 지정 규칙, 그리고 **413.1 내용이 너무 큼**, 431 요청 헤더가 너무 김.
  관리자는 이 하위 상태로 IIS 로그에서 위협을 가려낸다 — `<requestFiltering>` 「HTTP 404 Error Substatus Codes」. 내용 길이만 413.1이라는 것은 「Use Request Filtering」 「Filter Based on Request Limits」도 같다
- **요청 크기 한도의 기본값**(`<requestLimits>`): `maxAllowedContentLength` 요청 내용의 최대 길이(바이트) 기본 30000000(약 28.6MB), `maxUrl` URL 최대 길이(바이트) 기본 4096, `maxQueryString` 쿼리 문자열 최대 길이(바이트) 기본 2048 — 「Attributes」.
  Apache의 `LimitRequestBody`(요청 본문에 허락하는 바이트 수, 위 「(phase 79 step 9) Apache …」 항목)와 같은 자리의 설정이다 — 두 정의를 나란히 둔 말
- **확장자를 거부하는 차례**: IIS 관리자에서 사이트·응용 프로그램·디렉터리를 고르고 「요청 필터링」 두 번 클릭 → 「파일 이름 확장명」 탭 → 「작업」 창 「파일 이름 확장명 거부...」 → 막을 확장자를 넣는다(문서의 예는 `.inc` 파일을 막으려고 `inc`를 넣는다) — `<fileExtensions>` 「How To」.
  `allowUnlisted`(기본 true)는 목록에 없는 확장자를 처리할지 정한다 — true면 막을 확장자를, false면 허용할 확장자를 모두 적어야 한다 — 「Attributes」. 확장자로 막힌 요청은 404.7로 적힌다 — 「Use Request Filtering」 「Filter Based on File Extensions」
- **요청 필터링과 방화벽**: 둘을 견주는 문서는 찾지 못했다. 개념 step은 각 정의를 나란히 두는 데까지 쓴다 — 요청 필터링은 IIS가 받은 HTTP 요청의 URL·확장자·동사·길이로 거르고(이 항목), 방화벽은 들어오는 연결을 포트 같은 기준으로 거른다(위 「(phase 77) RFC 6335 …」의 「방화벽이 걸러 내는 기준이 되는 것」 줄, 「(phase 78 step 0) RFC 1579 …」)
- **IIS 로그**: 사이트의 로그를 켜고 끄고, 로그 파일 형식과 적을 정보의 갈래와 로그 파일 디렉터리를 정하고, 새 로그 파일을 언제(파일 크기나 시간 간격) 만들지 정한다 — `<logFile>` 「Overview」. 기본으로 켜져 있다(`enabled` 기본 true — ASP·ODBC 오류는 IIS 로그에 적지 않는다) — 「Attributes」
- **로그 파일 형식**(`logFormat`, **기본 W3C**): **W3C**(W3C 확장 로그 파일 형식 — 적을 필드를 고를 수 있는 ASCII 글자 형식, 필드는 공백으로 가르고 시각은 UTC), **IIS**(Microsoft IIS 로그 파일 형식 — 필드가 정해진 ASCII 글자 형식, 쉼표로 가르고 시각은 현지 시각), **NCSA**(NCSA 공통 로그 파일 형식 — 필드가 정해진 ASCII 글자 형식, 공백으로 가르고 현지 시각에 UTC와의 차이를 붙인다),
  **Custom**(사용자 지정 로깅 모듈의 형식 — 고르면 IIS 관리자의 「로깅」 페이지로는 더 구성하지 못한다). 앞의 셋은 HTTP.sys가 다룬다 — `<logFile>` 「Overview」·`logFormat`, 「Configure Logging in IIS」 「Configure Logging at the Site Level」 4단계
- **W3C 형식의 기본 필드**(`logExtFileFlags`): 날짜·시각·클라이언트 IP·사용자 이름·서버 IP·메서드·URI 줄기(경로)·URI 쿼리·걸린 시간·HTTP 상태·Win32 상태·서버 포트·사용자 에이전트·HTTP 하위 상태·참조 페이지(Referer) — 「Attributes」. IIS 관리자에서는 「로깅」 페이지의 「필드 선택」으로 고른다 — 「Configure Logging in IIS」
- **로그 디렉터리**(`directory`): 로그 파일과 로그 관련 파일을 두는 곳이고 기본은 `%SystemDrive%\inetpub\logs\LogFiles` — `<logFile>` 「Attributes」. IIS 관리자 「로깅」 페이지의 「디렉터리」에 경로를 넣어 바꾼다(실패한 요청 추적 로그 같은 로그 파일은 `%systemroot%`가 아닌 디렉터리에 두라고 권한다) — 「Configure Logging in IIS」 5단계.
  디스크가 모자라면 다른 서버에 공유 폴더를 만들고 「디렉터리」에 그 UNC 경로를 넣어 옮길 수도 있다 — 「Managing IIS Log File Storage」 「Move the Log Folder to a Remote System」
- **롤오버**(「로그 파일 롤오버」 — 새 로그 파일을 여는 때): 「일정」 — 매시간·매일·매주·매월 새 로그 파일, 「최대 파일 크기(바이트)」 — 파일이 그 크기에 이르면 새 로그 파일(최소 1048576바이트), 「새 로그 파일을 만들지 않음」 — 파일 하나가 계속 커진다. 「파일 이름 지정 및 롤오버에 현지 시간 사용」을 고르지 않으면 UTC로 — 「Configure Logging in IIS」 「Configure Log File Rollover Options」.
  구성 속성으로는 `period`(`Hourly`·`Daily`·`Weekly`·`Monthly`·`MaxSize`, **기본 Daily**)와 `truncateSize`(`MaxSize`일 때의 크기, 기본 20971520바이트) — `<logFile>` 「Attributes」. 최대 크기에 이르러 하는 일은 **새 파일을 만드는 것**이고, 옛 파일을 지운다는 말은 두 문서 어디에도 없다
- **오래된 로그를 지우는 일**: IIS 로그는 시간이 지나면 디스크를 많이 차지해 하드 드라이브를 채울 수도 있다. 문서가 드는 대책은 폴더 압축, 로그 폴더를 원격 서버로 옮기기, **정한 날수보다 오래된 로그 파일을 지우는 스크립트를 예약 작업으로 실행하기**다 — 「Managing IIS Log File Storage」 「Overview」·「Delete Old Log Files by Script」·「Run the script as a scheduled task」.
  `<logFile>`의 속성(디렉터리·켜기·형식·필드·롤오버 주기·크기·버퍼 등)에 보존 기간이나 삭제를 정하는 것은 없다 — 「Attributes」. 그러니 IIS가 오래된 로그를 스스로 지우지 않는다는 것은 두 문서에서 이어서 나오는 말이다(그것을 한 문장으로 적은 문서는 찾지 못했다)
- **로그는 요청 즉시 파일에 쓰이지 않는다**: W3C 로그는 사건을 버퍼에 모았다가 로그 파일에 쓴다. `flushByEntryCountW3CLog`는 몇 개를 모은 뒤 쓸지 정하고, 0(기본)이면 최대치인 64k가 찼을 때 쓴다 — 줄이면 더 빨리 쓰지만 디스크 작업이 늘고, 실시간에 가깝게 문제를 살피려면 줄이라고 한다 — `<logFile>` 「Attributes」(IIS 8.5에서 더해졌다).
  IIS가 로그를 디스크에 쓰는 데 시간이 걸려 관리자가 로그 정보를 실시간으로 보지 못하고 글자 로그 파일은 실시간으로 갱신되지 않는다 — 그래서 IIS 8.5부터 로그를 ETW(Windows 이벤트 추적)로도 보낼 수 있게 했다 — 「Logging to Event Tracing for Windows in IIS 8.5」 「Problem」·「Solution」. 파일 로그는 HTTP.sys가 요청 처리를 마친 뒤 글자 로그 파일에 적는다 — `<logFile>` `logTargetW3C`
- (phase 81 step 7, 2026-11-18 영문판을 IPv4로 다시 받아 읽음 — 「Configure Logging in IIS」 `updated_at` 2024-04-11(`ms.date` 2013-04-14, 차례는 Windows Server 2012·Windows 8로 적는다)) 이 step이 본문에 쓰려고 다시 본 것:
  **사이트 수준의 차례** — IIS 관리자 「연결」 트리에서 사이트를 고르고 「로깅」을 두 번 클릭 → 「로깅」 페이지 「로그 파일」 칸의 「형식」에서 형식을 고른다 → 「디렉터리」에 경로 → 「로그 파일 롤오버」에서 셋 가운데 하나 → 「파일 이름 지정 및 롤오버에 현지 시간 사용」(고르지 않으면 UTC로 센다) → 「작업」 창의 「적용」 — 「Configure Logging at the Site Level」 1~8.
  이 선택과 상관없이 파일 안에 적히는 시각은 형식을 따른다(NCSA·W3C 형식의 시각 표시는 UTC 꼴) — 같은 절 7의 Note. 형식마다 필드를 가르는 기호와 시각: IIS 형식은 쉼표·현지 시각, NCSA 형식은 공백·현지 시각에 UTC와의 차이, W3C 형식은 공백·UTC — 같은 절 4.
  **W3C 필드를 고르는 자리** — 「로깅」 페이지 「로그 파일」 칸의 「필드 선택」 → 「W3C 로깅 필드」 대화 상자에서 고른다. 사용자 에이전트(`cs(User-Agent)`)는 클라이언트가 쓴 브라우저의 종류, 걸린 시간(`time-taken`)은 동작에 걸린 시간을 밀리초로 적는다 — 「Select W3C Fields to Log」.
  「새 로그 파일을 만들지 않음」은 파일 하나가 계속 커지므로, 로그 분석 도구에는 편하지만 큰 파일이 서버 전체의 성능에 영향을 줄 수 있다 — 「Configure Log File Rollover Options」.
  **UTC** — 본문은 UTC(Coordinated Universal Time, 협정 세계시)를 「나라마다 다른 현지 시각이 아니라 세계가 함께 쓰는 기준 시각」으로 한 줄 푼다. 이름 풀이는 위 문서가 쓰는 이름(Coordinated Universal Time) 그대로이고, 뜻풀이는 일반 용어의 풀이다.
  (phase 81 step 7) 쓰인 곳: `windows-server-roles.iis-logging`(로그 형식 넷·필드를 고르는 형식, 필드를 가르는 기호와 시각, 디렉터리 기본값과 바꾸는 차례, 롤오버 셋·기본 매일·UTC 기준, 오래된 로그와 스크립트, 버퍼에 모았다 쓴다), 문항 n296, 도식 `iis-log-rollover`
- (phase 81 step 6, 2026-11-18 영문판을 IPv4로 다시 받아 확인 — 위와 같은 판) **기본 문서는 사이트 안의 폴더마다 쓰인다**: `<defaultDocument>` 「Overview」의 Note는 목록의 차례가 성능에 주는 영향을 설명하며 사이트의 **모든 폴더**에서 홈 페이지로 쓸 파일을 목록 맨 아래에 두는 예를 든다 — 그러니 기본 문서는 사이트 루트만이 아니라 `/docs/`처럼 폴더를 가리킨 요청에도 쓰인다(이 Note와 「Overview」를 이은 말).
  `<virtualDirectory>` 「Overview」는 응용 프로그램마다 루트 가상 디렉터리가 있어 응용 프로그램을 그 내용이 든 실제 디렉터리에 잇는다고 하고, 가상 디렉터리의 이름이 URL의 일부가 되어 사용자가 그 URL로 실제 디렉터리의 내용(웹 페이지나 그 아래 디렉터리·파일의 목록)에 닿는다고 한다 —
  그러니 별칭이 아닌 URL 경로는 사이트 루트의 실제 경로 아래에서, 별칭으로 시작하는 경로는 그 별칭의 실제 경로 아래에서 찾는다(두 정의를 이은 말 — 위 KB 글의 표와 같다)
- **한국어 이름**: 한국어판은 「실제 경로」, 「홈 디렉터리」(KB 글), 「기본 문서」·「기본 문서 추가」·「추가...」·「위로 이동」·「아래로 이동」, 「디렉터리 검색」(한 곳은 「디렉터리 브라우징」)·「사용」, 「가상 디렉터리 보기」·「가상 디렉터리 추가」·「별칭」, 「요청 필터링」·「파일 이름 확장명」 탭·「파일 이름 확장명 거부」,
  「로깅」·「로그 파일」·「형식」·「디렉터리」·「필드 선택」·「로그 파일 롤오버」·「일정」(매시간·매일·매주·매월)·「최대 파일 크기(바이트)」·「새 로그 파일을 만들지 마세요」·「파일 이름 지정 및 롤오버에 현지 시간 사용」으로 옮긴다.
  **고른 이름**: 「실제 경로」(physical path — 개념 이름 「홈 디렉터리와 가상 디렉터리」는 guide.md 그대로 두고, 본문은 「홈 디렉터리」를 옛 문서와 기출이 쓰는 이름으로 소개한 뒤 「실제 경로」를 세운다), 「기본 문서」, 「디렉터리 검색」(기출과 같다), 「가상 디렉터리」·「별칭」, 「요청 필터링」, 「파일 이름 확장명」,
  「로그 파일 형식」, 「롤오버」(한국어판도 「롤오버」), 「새 로그 파일을 만들지 않음」(한국어판의 「…마세요」는 명령꼴 번역이라 이름꼴로 고친다). **실제 한국어 IIS 관리자 화면의 이름은 확인하지 못했다**

쓰인 곳: (phase 81 step 6에서 쓰일 곳) `windows-server-roles.iis-home-directory`(실제 경로와 기본값·바꿀 수 있다, 「홈 디렉터리」라는 이름의 자리, 기본 문서의 뜻·기본 목록·차례·추가, 디렉터리 검색의 뜻·기본 꺼짐·보일 정보, 기본 문서가 먼저이고 둘 다 끄면 404, 가상 디렉터리·별칭과 URL·경로의 대응, Apache와의 짝),
`windows-server-roles.request-filtering`(요청 필터링의 뜻·기본 설치·거르는 기준, 막힌 요청의 404 하위 상태와 413.1, 요청 크기 한도의 기본값, 확장자 거부 차례, Apache `LimitRequestBody`와의 짝, 방화벽과의 차이를 정의로만);
(phase 81 step 7에서 쓰일 곳) `windows-server-roles.iis-logging`(로그 형식 넷과 기본 W3C·기본 필드, 디렉터리 기본값과 바꾸기, 롤오버 셋과 기본 매일, 최대 크기는 새 파일, 오래된 로그는 스스로 지우지 않고 스크립트로, 버퍼에 모았다 쓴다);
기출 대조(`exam-notes.md` 「phase 81 step 4」 문단 — [기출 2026-08-02 #29], [기출 2025-11-02 #41], [기출 2026-02-01 #45])

## (phase 81 step 4) Microsoft Learn — IIS의 FTP 서버: FTP Site-level Settings <ftpServer>, FTP over SSL <ssl>, Scenario: Build an FTP Site on IIS, Creating a New FTP Site in IIS 7, Using FTP Over SSL in IIS 7, What's New for Microsoft and FTP in IIS 7?
https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/ftpserver/
https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/ftpserver/security/ssl
https://learn.microsoft.com/en-us/iis/publish/using-the-ftp-service/scenario-build-an-ftp-site-on-iis
https://learn.microsoft.com/en-us/iis/publish/using-the-ftp-service/creating-a-new-ftp-site-in-iis-7
https://learn.microsoft.com/en-us/iis/publish/using-the-ftp-service/using-ftp-over-ssl-in-iis-7
https://learn.microsoft.com/en-us/iis/get-started/whats-new-in-iis-7/what39s-new-for-microsoft-and-ftp-in-iis-7

2026-11-18에 IPv4로 내려받아 읽은 판: 구성 참조 `<ftpServer>`·FTP over SSL `<ssl>` 둘 다 `updated_at` 2025-12-20(`ms.date` 2016-09-26) — 「Compatibility」 표가 둘 다 IIS 10.0에서 바뀌지 않았다고 적는다. 「Scenario: Build an FTP Site on IIS」 2024-04-11(2013-04-14 — 차례를 Windows Server 2012·Windows 8로 적는다).
「Creating a New FTP Site in IIS 7」·「Using FTP Over SSL in IIS 7」·「What's New for Microsoft and FTP in IIS 7?」 셋 다 2025-12-20(2008-01-15) — IIS 7.0 때 쓴 글이고, 앞의 둘은 「Compatibility」에 FTP 7.5가 Windows Server 2008 R2·Windows 7의 IIS 7.5 기능으로 들어 있고 IIS 7.0 때는 따로 내려받아 설치했다고 적는다. 한국어판도 모두 받았다(`updated_at` 2026-10-27, 기계 번역).
FTP 자체·두 데이터 연결 모드·포트 21은 위 「(phase 77) RFC 959 …」와 「(phase 78 step 0) Microsoft Learn — Configuring FTP Firewall Settings in IIS 7 …」 항목, 설치 이름은 위 「(phase 81 step 0) … 서버 역할과 기능」 항목의 Server Core 표에 있다 — 여기서는 IIS의 FTP 서버를 설치하고 사이트를 만드는 자리와 보안 연결만 적는다.

- **FTP 서버 역할 서비스**: 웹 서버에서 FTP 게시를 하려면 FTP 서비스를 설치한다 — 서버 관리자 「관리」 → 「역할 및 기능 추가」 → 「서버 역할」에서 웹 서버(IIS)를 펼쳐 「FTP 서버」를 고르고, 그 아래 「FTP 서비스」를 고른다. ASP.NET 멤버 자격 인증이나 IIS 관리자 인증을 쓰려면 「FTP 확장성」도 고른다 — `<ftpServer>` 「Setup」, 「Scenario: Build an FTP Site on IIS」 「Step 1: Install FTP on an Existing IIS Web Server」(「FTP 서버」 확인란과 「FTP 서비스」 확인란).
  설치 이름은 `Web-Ftp-Server`(FTP 서버)·`Web-Ftp-Service`(FTP 서비스)·`Web-Ftp-Ext`(FTP 확장성)이고 셋 다 기본으로 설치되지 않는다(Server Core 표). 역할 서비스도 `Install-WindowsFeature`로 설치하고(같은 step 0 항목 — 이름을 쉼표로 여럿 줄 수 있고, `-IncludeAllSubFeature`는 하위 역할 서비스까지 넣는다),
  FTP 서버를 설치하는 줄 그대로를 보인 문서는 찾지 못했다 — 개념 step은 「설치 이름 + `Install-WindowsFeature`」라는 문서의 두 사실을 합쳐 보이고, 그렇게 합친 꼴이라고 밝힌다
- **IIS에 들어간 FTP**: FTP 7.5부터 FTP 서비스는 Windows Server 2008 R2의 IIS 7.5 기능으로 들어 있어 따로 내려받지 않는다 — 「Creating a New FTP Site in IIS 7」 「Compatibility」. FTP 서비스가 IIS에 통합되어 IIS 관리자·AppCmd·PowerShell 같은 IIS 관리 도구로 관리하고, 기존 웹 사이트에 FTP 바인딩을 더해 한 사이트에서 웹과 FTP를 함께 낼 수도 있다 — 「What's New for Microsoft and FTP in IIS 7?」 「Introduction」.
  FTP 설정도 웹 사이트 설정과 같은 `ApplicationHost.config`의 `<site>` 안에 들어간다 — `<ftpServer>` 「Overview」
- **FTP 사이트를 더하는 차례**: IIS 관리자 「연결」 창에서 「사이트」를 고르고 「작업」 창 「FTP 사이트 추가」 → 「FTP 사이트 추가」 마법사:
  ① 「사이트 정보」 페이지 — 「FTP 사이트 이름」, 「실제 경로」(내용 폴더 — 문서의 예는 `%SystemDrive%\inetpub\ftproot`이고 환경 변수를 쓸 수 있다) →
  ② 「바인딩 및 SSL 설정」 페이지 — 「IP 주소」(기본 「All Unassigned」), 「포트」(FTP 사이트와 클라이언트는 기본으로 21번, 암시적 FTPS는 990번), 「가상 호스트」(한 IP 주소에 FTP 사이트 여럿을 둘 때 넣는 호스트 이름), 「FTP 사이트 자동 시작」, SSL 선택 — 「SSL 없음」·「SSL 허용」(클라이언트가 SSL을 쓸지 고른다)·「SSL 필요」(늘 SSL), 허용·필요면 「SSL 인증서」를 고른다 →
  ③ 「인증 및 권한 부여 정보」 페이지 — 인증 방식(예: 익명·기본), 권한 부여(누구에게 — 예: 익명 사용자), 권한(읽기·쓰기) → 「마침」 — 「Scenario: Build an FTP Site on IIS」 「Step 2: Add an FTP Site」, `<ftpServer>` 「How To」(익명 읽기 사이트 예). 세 페이지의 이름은 「Creating a New FTP Site in IIS 7」의 그림 설명과 같다
- **FTPS**(FTP over SSL): IIS의 FTP 서비스(FTP 7.0부터)는 FTP 클라이언트와 서버 사이의 세션을 암호화하는 FTP over SSL을 지원한다 — 「Using FTP Over SSL in IIS 7」 「Introduction」. IIS 6.0의 FTP 서비스는 FTP over SSL을 지원하지 않았다 — FTP over SSL `<ssl>` 「Compatibility」.
  HTTPS가 보안 통신에 따로 포트·연결을 쓰는 것과 달리, FTPS는 보안 없는 통신과 같은 포트를 쓴다. 두 꼴이 있다 — **명시적 FTPS**(제어 채널은 기본 21번이고, 클라이언트가 제어 채널이나 데이터 채널에 SSL/TLS를 쓸지 서버와 협상한다 — 990이 아닌 포트에 FTPS를 켜면 이 꼴), **암시적 FTPS**(옛 꼴 — 클라이언트가 FTP 명령을 보내기 전에 SSL 핸드셰이크를 먼저 하고 세션 전체를 암호화한다 — 990번에 FTPS를 켜면 이 꼴) — FTP over SSL `<ssl>` 「Overview」.
  RFC에 따른 FTPS 구현이라 다른 회사의 FTP 클라이언트와도 쓸 수 있고, 제어 채널·데이터 채널·둘 다를 암호화하게 정할 수 있다 — 「What's New…」 「Security and Support for new Internet standards」
- **SFTP**: 「What's New for Microsoft and FTP in IIS 7?」(IIS 7.0 때 글)는 FTP 트래픽을 지키는 방법으로 이름이 비슷한 FTPS와 SFTP 둘이 있다고 가른 뒤, **Microsoft는 FTPS를 제공하고 SFTP(이 글은 「FTP over SSH」라 부른다)로 FTP 트래픽을 지키는 방법은 제공하지 않는다**고 적는다 — 「Introduction」. 지금 판 IIS 문서에서 IIS의 FTP 서버가 SFTP를 지원한다고 한 곳은 찾지 못했다.
  SFTP는 SSH 위에서 동작하는 파일 전송이고(위 「(phase 77) RFC 4251 …, RFC 4253 …」·「(phase 78 step 0) OpenSSH — ssh(1)」 항목), Windows의 OpenSSH에 `sftp` 도구가 들어 있다(위 「(phase 78 step 0) Microsoft Learn — OpenSSH for Windows overview …」 항목) — IIS의 FTP 서비스와는 다른 구성 요소다. 「지원하지 않는다」는 IIS 7.0 때 글의 말이라, 본문에 쓸 때는 그 판을 밝힌다
- (phase 81 step 7, 2026-11-18 영문판을 IPv4로 다시 받아 읽음 — 「Scenario: Build an FTP Site on IIS」 `updated_at` 2024-04-11(`ms.date` 2013-04-14, 차례는 Windows Server 2012·Windows 8로 적는다), 「What's New for Microsoft and FTP in IIS 7?」 `updated_at` 2025-12-20(`ms.date` 2008-01-15)) 이 step이 본문에 쓰려고 다시 본 것:
  **FTP 사이트를 더하는 자리** — IIS 관리자 「연결」 창에서 서버를 펼쳐 「사이트」를 고르고 「작업」 창의 「FTP 사이트 추가」로 마법사를 연다 — 「Scenario」 「Step 2」 1~3. 설치 차례는 「서버 역할 선택」에서 웹 서버(IIS)를 펼치고 그 아래 FTP 서버를 펼쳐 「FTP 서버」·「FTP 서비스」 확인란을 고른 뒤 「기능 선택」을 지나 「설치 선택 확인」에서 「설치」 — 같은 문서 「Step 1」 6~9.
  **인증 둘** — 익명은 사용자 이름 `anonymous`(또는 `ftp`)만으로 내용에 닿게 하고, 기본은 올바른 사용자 이름과 암호를 요구하는데 **암호를 암호화하지 않고 네트워크로 보내므로** 클라이언트와 FTP 서버 사이의 연결이 SSL처럼 안전할 때만 쓰라고 한다 — 같은 절 14. 권한 부여의 「다음에 액세스 허용」과 권한 「읽기」·「쓰기」 — 같은 절 15~16(한국어 화면 이름은 확인하지 못해 본문은 하는 일만 쓴다).
  **SSL 허용과 SSL 필요** — 「SSL 허용」은 FTP 서버가 클라이언트와 SSL 연결과 SSL이 아닌 연결을 모두 받게 하고, 「SSL 필요」는 FTP 서버와 클라이언트 사이의 통신에 SSL 암호화를 요구한다 — 같은 절 12.
  **FTP 확장성이 쓰이는 인증** — 「What's New…」 「Authentication for Non-Windows Accounts」는 Windows 계정이 아닌 계정으로 FTP 사용자를 인증하는 두 방식(IIS 관리자 인증과 .NET 멤버 자격 인증)을 든다. 위 「FTP 서버 역할 서비스」 줄(그 두 인증을 쓰려면 「FTP 확장성」도 고른다)과 이어 보면, FTP 확장성은 Windows 사용자 계정이 아닌 계정으로 FTP 사용자를 확인하는 인증을 쓸 때 더 고르는 것이다(두 문서를 이은 말).
  **SFTP 문장의 꼴** — 같은 「Introduction」의 「Security and Support…」 절은 업계가 FTP를 지키는 방법이 여럿이고 이름이 비슷한 FTPS와 SFTP가 있다고 한 뒤, Microsoft가 내놓은 것은 FTPS이고 SFTP(이 글은 「FTP over SSH」라 부른다)로 FTP를 지키는 방법은 내놓지 않았다고 적는다. 본문은 이 말을 IIS 7.0 때 글의 말이라고 판을 밝혀 쓴다(위 SFTP 줄과 같다).
  (phase 81 step 7) 쓰인 곳: `windows-server-roles.ftp-server`(설치 차례, FTP 사이트를 더하는 자리, 세 페이지의 칸, 익명·기본 인증과 기본 인증은 SSL로 지킬 때만, SSL 허용·필요, FTP 확장성, IIS 7.0 때 글의 SFTP 말), 문항 n297, 도식 `iis-ftp-site`
- **한국어 이름**: 한국어판은 「FTP 서버」·「FTP 서비스」·「FTP 확장성」, 「FTP 사이트 추가」 마법사, 「사이트 정보」·「바인딩 및 SSL 설정」·「인증 및 권한 부여 정보」 페이지, 「FTP 사이트 이름」·「실제 경로」·「가상 호스트」, 「SSL 없음」·「SSL 허용」·「SSL 필요」·「SSL 인증서」, 「할당되지 않은 모든 항목」, 「암시적 FTPS」로 옮긴다.
  **고른 이름**: 위 한국어판 표기 그대로, 「FTPS(FTP over SSL)」, 「명시적 FTPS」·「암시적 FTPS」. **실제 한국어 화면의 이름은 확인하지 못했다**

쓰인 곳: (phase 81 step 7에서 쓰일 곳) `windows-server-roles.ftp-server`(웹 서버(IIS) 아래 FTP 서버 역할 서비스와 FTP 서비스·FTP 확장성, 설치 이름과 `Install-WindowsFeature`, IIS 관리자로 관리, FTP 사이트 추가 마법사의 세 페이지와 칸, 포트 21·암시적 FTPS 990, FTPS의 두 꼴, SFTP는 SSH 위의 다른 프로토콜이고 IIS FTP가 제공하지 않는다(IIS 7.0 때 글));
기출 대조(`exam-notes.md` 「phase 81 step 4」 문단 — [기출 2026-05-17 #44]의 SFTP 보기. 나머지 보기는 「phase 81 step 0」 문단)

## (phase 81 step 4) Microsoft Learn — 원격 액세스·VPN·DirectAccess·웹 응용 프로그램 프록시: Remote Access, Virtual Private Networking (VPN), Configure VPN protocols in Routing and Remote Access on Windows Server, DirectAccess, VPN connection types, Web Application Proxy in Windows Server, Publishing Applications using AD FS Preauthentication, Publishing Applications with SharePoint, Exchange and RDG; Win32 — Web Application Proxy (Windows 8 cookbook)
https://learn.microsoft.com/en-us/windows-server/remote/remote-access/remote-access
https://learn.microsoft.com/en-us/windows-server/remote/remote-access/vpn/vpn-top
https://learn.microsoft.com/en-us/windows-server/remote/remote-access/configure-vpn-protocols
https://learn.microsoft.com/en-us/windows-server/remote/remote-access/directaccess/directaccess
https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/vpn/vpn-connection-type
https://learn.microsoft.com/en-us/windows-server/remote/remote-access/web-application-proxy/web-app-proxy-windows-server
https://learn.microsoft.com/en-us/windows-server/remote/remote-access/web-application-proxy/publishing-applications-using-ad-fs-preauthentication
https://learn.microsoft.com/en-us/windows-server/remote/remote-access/web-application-proxy/publishing-applications-with-sharepoint,-exchange-and-rdg
https://learn.microsoft.com/en-us/windows/win32/w8cookbook/web-application-proxy

2026-11-18에 IPv4로 내려받아 읽은 판: 「Remote Access」 `updated_at` 2026-02-16(`ms.date` 2022-09-28), 「Virtual Private Networking (VPN)」 2026-02-16(2018-11-05), 「Configure VPN protocols…」 2026-02-16(2024-06-07), 「DirectAccess」 2026-10-12(2022-11-16), 「Web Application Proxy in Windows Server」 2026-04-20(2026-04-16),
「Publishing Applications using AD FS Preauthentication」 2026-02-16(2016-07-13), 「Publishing Applications with SharePoint, Exchange and RDG」 2025-11-18(2018-04-30) — 일곱 다 「Applies to」 Windows Server 2016~2025·Windows 11·10.
Windows 보안 「VPN connection types」 2026-10-08(2025-01-27, Windows 11·10 — 클라이언트 쪽 문서). Win32 「Web Application Proxy」(Windows 8 호환성 안내) 2025-03-13(2018-05-31, 플랫폼 Windows Server 2012 R2). 한국어판도 모두 받았다(`updated_at` 2025-07-03~2026-10-17, 기계 번역).
「Features Removed or No Longer Developed in Windows Server」도 다시 받았다 — 위 「(phase 80 step 8) … 클라우드 폴더…」 항목의 「(phase 81 step 0)」 줄과 같은 판(`updated_at` 2026-11-17)이다.

- **원격 액세스**(Remote Access) 역할: 역할 및 기능 추가 마법사나 PowerShell로 이 역할을 설치할 때 역할 서비스 셋 가운데 하나 이상을 고른다 — **DirectAccess 및 VPN(RAS)**, **라우팅**(Routing), **웹 응용 프로그램 프록시**(Web Application Proxy). 셋은 따로 설치해도 같은 서버에 함께 설치해도 된다 — 「Remote Access」 첫머리.
  Windows Server 2016 글은 이 역할을 서로 관련된 네트워크 액세스 기술(원격 액세스 서비스(RAS)·라우팅·웹 응용 프로그램 프록시)을 논리적으로 묶은 것이라 하고, DirectAccess 및 VPN(RAS)을 설치하면 RAS 게이트웨이(VPN 서버로 쓸 수 있다)를 배포하는 것이라고 한다 — 「Virtual Private Networking (VPN)」 「RAS Gateway as a Single Tenant VPN Server」.
  설치 이름은 역할 `RemoteAccess`, 역할 서비스 `DirectAccess-VPN`·`Routing`·`Web-Application-Proxy`이고 기본으로 설치되지 않는다(위 「(phase 81 step 0) … 서버 역할과 기능」 항목의 Server Core 표)
- **VPN(RAS)**: VPN 서비스는 인터넷 연결에 터널링과 데이터 암호화 기술을 함께 써서 원격 클라이언트와 원격 사무실을 잇는다 — 「Remote Access」 「VPN (RAS)」. Windows 클라이언트 문서의 설명: VPN 클라이언트가 터널링 프로토콜(TCP/IP나 UDP를 쓰는 특별한 프로토콜)로 인터넷 너머의 원격 액세스 서버(VPN 서버)와 가상의 지점 간 연결을 맺으면,
  서버는 연결해 온 쪽을 인증하고 그 뒤로 그 클라이언트와 조직의 사설 네트워크 사이에서 데이터를 날라 준다 — 「VPN connection types」 첫머리
- **Windows VPN 서버가 받는 터널링 프로토콜**: 라우팅 및 원격 액세스 서비스(RRAS)는 원격 사용자 연결이나 사이트 간 연결을 VPN이나 전화 접속으로 받고, VPN 연결은 PPTP·L2TP·SSTP·IKEv2 같은 프로토콜로 받는다. RRAS를 기본 구성으로 설치하면 넷 다 켜져 있다.
  **Windows Server 2025부터 새로 구성한 RRAS는 PPTP·L2TP 연결을 받지 않는다**(필요하면 켤 수 있고, 그 앞 판에서 제자리 업그레이드한 구성은 그대로 받는다 — Windows 클라이언트에는 영향이 없다). SSTP·IKEv2는 그대로 받는다. 보안 기능이 모자라 L2TP·PPTP는 권하지 않고 IKEv2나 SSTP를 쓰라고 한다 — 「Configure VPN protocols…」 「Enable VPN protocols」.
  Windows 내장 VPN 클라이언트가 쓰는 터널링 프로토콜도 IKEv2·L2TP·PPTP·SSTP이고, 「자동」은 가장 안전한 것부터 차례로 시도한다 — 「VPN connection types」 「Built-in VPN client」.
  풀네임은 「Features Removed or No Longer Developed」의 줄이 적는다 — Point-to-Point Tunneling Protocol(PPTP)·Layer 2 Tunneling Protocol(L2TP)을 통한 원격 액세스는 Windows Server 2028(Preview)에서 빠지니 Internet Key Exchange version 2(IKEv2)나 Secure Socket Tunneling Protocol(SSTP)로 옮기라는 것(위 「(phase 81 step 0)」 줄과 같다)
- **DirectAccess**: 원격 사용자를 조직 네트워크의 자원에 잇되 VPN 연결을 쓰지 않는 방식이다. VPN은 사용자가 연결을 열고 닫아야 하지만, DirectAccess의 원격 클라이언트 컴퓨터는 켜져서 인터넷에 이어져 있는 동안 늘 조직에 이어져 있고, 그동안 IT 관리자가 그 컴퓨터를 관리할 수 있다 — 「Remote Access」 「DirectAccess」, 「DirectAccess」 첫머리.
  도메인에 가입했고 운영 체제가 DirectAccess를 지원하는 클라이언트만 지원한다(Windows 11 Enterprise·Windows 10 Enterprise 등) — 「DirectAccess」. **새 배포에는 DirectAccess 대신 Always On VPN을 쓰라고 강하게 권하고**, Windows 10 이후 클라이언트는 Always On VPN으로 잇고 DirectAccess는 Windows 10보다 앞선 클라이언트에만 쓰라고 한다 — 「DirectAccess」, 「Remote Access」 「DirectAccess」의 Important.
  Always On VPN은 Windows 10 클라이언트가 손으로 연결하지 않아도 내부 네트워크의 공유 자원·인트라넷 웹 사이트·응용 프로그램에 안전하게 닿게 한다 — 「Remote Access」 「VPN (RAS)」. DirectAccess는 Windows Server 2028(Preview)에서 빠진다(「Features Removed…」 — 위 「(phase 81 step 0)」 줄)
- **라우팅** 역할 서비스: LAN의 서브넷 사이에 네트워크 트래픽을 라우팅한다. NAT 라우터, BGP를 쓰는 LAN 라우터, RIP, IGMP를 쓰는 멀티캐스트 라우터, 요구 시 연결(demand-dial) 라우팅, 유니캐스트 IP 라우팅을 지원하고, 물리 컴퓨터나 Hyper-V의 가상 컴퓨터에 둘 수 있다.
  LAN 라우터로 설치하려면 마법사에서 원격 액세스 역할과 라우팅 역할 서비스를 고르거나 `Install-RemoteAccess -VpnType RoutingOnly` — 「Remote Access」 「Routing service」. 서버 관리자 「도구」 → 「라우팅 및 원격 액세스」 콘솔에서 VPN 서버의 포트·프로토콜을 관리한다 — 「Configure VPN protocols…」
- **웹 응용 프로그램 프록시**(Web Application Proxy): 원격 액세스 역할의 역할 서비스다. 회사 네트워크 가장자리에서 **역방향 프록시**로 일해, 내부 서버에 둔 웹 응용 프로그램·서비스를 회사 밖 사용자가 쓸 수 있게 내놓는다. 게시 방식은 둘 — AD FS(Active Directory Federation Services)로 사용자를 먼저 인증받게 해 인증된 사람만 들이는 AD FS 사전 인증과, 그 인증 없이 넘기는 통과(pass-through)다 — 「Web Application Proxy in Windows Server」 첫머리.
  「Remote Access」 「Web Application Proxy service」도 회사 네트워크 안의 웹 응용 프로그램에 역방향 프록시 기능을 주어 어느 기기의 사용자든 밖에서 닿게 하고, AD FS로 사전 인증하며 AD FS 프록시 노릇도 한다고 적는다. 설치: 마법사에서 원격 액세스 역할과 웹 응용 프로그램 프록시 역할 서비스를 고른다 — 같은 절
- Windows Server 2012 R2에서 원격 액세스 역할 아래 새로 생긴 서비스이고, 응용 프로그램을 밖에 게시하며 역방향 프록시이자 AD FS 프록시로 동작한다. Windows Server 2012의 AD FS 프록시 서비스(AD FS 역할 아래)를 대신해, 그것에 응용 프로그램을 게시하는 역방향 프록시 기능을 더한 것이다 — Win32 「Web Application Proxy」 「Description」·「Manifestation」
- **사전 인증과 통과**: AD FS 사전 인증으로 게시하면 — 클라이언트가 게시된 응용 프로그램의 공개 URL(웹 응용 프로그램 프록시가 HTTPS 요청을 기다리는 주소)로 요청하면, 프록시가 그 요청을 AD FS 서버로 돌려보낸다. AD FS가 사용자를 인증해 보안 토큰(edge token)을 담아 돌려보내면, 프록시가 토큰을 확인한 뒤 요청을 내부의 게시된 웹 응용 프로그램(백엔드 서버)으로 HTTP나 HTTPS로 넘긴다 — 「Publishing Applications using AD FS Preauthentication」 첫 절.
  사전 인증 없이 게시할 수도 있고(통과 인증 — 프록시가 먼저 사용자를 인증하지 않는다), 사전 인증을 지원하지 않는 클라이언트(예: 원격 데스크톱 연결 앱)는 통과 인증으로 게시해야 한다 — 「Publishing Applications with SharePoint, Exchange and RDG」 「Publishing Remote Desktop Gateway through Web Application Proxy」.
  외부 URL과 백엔드 서버 URL에는 IP 주소가 아니라 FQDN을 넣으라고 한다 — 「Publishing Applications using AD FS Preauthentication」 Important. AD FS 자체의 동작은 이 phase가 다루지 않는다 — 위 문서들에서 AD FS는 사용자를 인증해 토큰을 내주는 서버로만 나온다
- **VPN·DirectAccess와 무엇이 다른가**: 웹 응용 프로그램 프록시가 원격 컴퓨터를 네트워크에 잇지 않는다고 한 문장으로 적은 지금 판 문서는 찾지 못했다. 문서의 정의로 가를 수 있는 데까지 — VPN(RAS)·DirectAccess는 원격 클라이언트(컴퓨터)를 조직 네트워크에 잇는 것이고, 웹 응용 프로그램 프록시는 안의 웹 응용 프로그램을 밖에 게시하는 역방향 프록시라 바깥 사용자는 게시된 응용 프로그램의 공개 URL로 그 응용 프로그램에만 닿는다 — 위 줄들에서 이어서 나오는 말
- **지금 판의 상태**: 웹 응용 프로그램 프록시는 「Features Removed or No Longer Developed in Windows Server」(`updated_at` 2026-11-17 판)의 두 절 어디에도 없고, 「Web Application Proxy in Windows Server」의 「Applies to」는 Windows Server 2016~2025다. 이 문서 머리는 온프레미스 웹 응용 프로그램 프록시의 내용이라고 밝히고, 클라우드를 거쳐 온프레미스 응용 프로그램에 안전하게 닿게 하려면 Microsoft Entra 응용 프로그램 프록시를 보라고 적는다
- **한국어 이름**: 한국어판은 「원격 액세스」, 「RAS(직접 액세스 및 VPN) 서비스」(Server Core 표 한국어판은 「DirectAccess 및 VPN(RAS)」), 「라우팅 서비스」, 「웹 애플리케이션 프록시」(본문이 영문 「Web Application Proxy」를 그대로 두기도 한다), 「역방향 프록시」, 「사전 인증」·「통과 사전 인증」, 「터널링」, 「DirectAccess」로 옮긴다.
  **고른 이름**: 「원격 액세스」, 「DirectAccess 및 VPN(RAS)」, 「라우팅」, 「웹 응용 프로그램 프록시」(guide.md가 개념 이름으로 정한 표기 — 한국어판 문서는 「웹 애플리케이션 프록시」로만 옮긴다는 것을 본문에서 한 번 밝힌다), 「역방향 프록시」, 「사전 인증」·「통과」(pass-through), 「터널링 프로토콜」, 프로토콜 이름은 약어 그대로(PPTP·L2TP·SSTP·IKEv2 — 풀네임은 위 줄).
  **실제 한국어 화면의 이름은 확인하지 못했다**

쓰인 곳: (phase 81 step 8에서 쓰일 곳) `windows-server-roles.remote-access`(역할 서비스 셋과 설치 이름, VPN의 뜻·터널링과 암호화, Windows VPN 서버의 터널링 프로토콜 넷과 Windows Server 2025의 기본 동작·권고, DirectAccess의 뜻과 VPN과의 차이·Always On VPN 권고·2028(Preview) 제거, 라우팅 역할 서비스가 하는 일),
`windows-server-roles.web-application-proxy`(역방향 프록시로 내부 웹 응용 프로그램을 밖에 게시, AD FS 사전 인증과 통과, AD FS 프록시 노릇, Windows Server 2012 R2에서 생김, VPN·DirectAccess와의 차이를 정의로, 지금 판의 상태);
기출 대조(`exam-notes.md` 「phase 81 step 4」 문단 — [기출 2024-08-25 #38]=[기출 2025-05-25 #39])

(phase 81 step 8, 2026-11-18 IPv4로 다시 받아 확인) 「Virtual Private Networking (VPN)」(`updated_at` 2026-02-16)은 RAS의 풀이를 Remote Access Service (RAS)로 적고, RAS Gateway를 single tenant RAS Gateway virtual private network (VPN) server로 배포할 수 있다고 적는다 — 본문의 「RAS는 원격 액세스 서비스(Remote Access Service)를 줄인 말」과 「VPN(virtual private network)」의 근거다.
「VPN connection types」(`updated_at` 2026-10-08)는 VPN 연결을 인터넷 같은 사설·공용 네트워크를 지나는 지점 간(point-to-point) 연결로 적는다 — 본문의 「두 지점만 잇는 가상의 연결」.
「Remote Access」(`updated_at` 2026-02-16)는 VPN(RAS)이 터널링과 데이터 암호화 기술을 함께 써서 원격 클라이언트와 원격 사무실을 잇는다고 적는다(위 줄과 같다) — 본문의 「멀리 떨어진 사무실의 네트워크끼리 잇는 데도 VPN을 쓴다」.

(phase 81 step 8) **역방향 프록시가 응답을 돌려주는 길** — 위 줄들은 웹 응용 프로그램 프록시가 역방향 프록시로 일하고 요청을 백엔드 서버로 넘긴다는 데까지 적고, 응답이 어디로 가는지는 적지 않는다. 그래서 IIS 문서에서 역방향 프록시의 정의를 확인했다.
https://learn.microsoft.com/en-us/iis/extensions/configuring-application-request-routing-arr/creating-a-forward-proxy-using-application-request-routing
「Creating a Forward Proxy Using Application Request Routing」(IIS 확장 Application Request Routing 문서) `updated_at` 2023-03-10(`ms.date` 2014-06-11), 한국어판 `updated_at` 2026-10-27(기계 번역)을 2026-11-18에 IPv4로 받아 읽었다. 「Overview」 절:
- 프록시 서버는 요청하는 쪽이나 응답하는 쪽을 대신하는 한 접점이다. 클라이언트 쪽의 요청을 받아 인터넷으로 넘기고 만들어진 응답을 클라이언트에게 돌려주는 것이 정방향 프록시(forward proxy)이고, **인터넷에서 들어온 요청을 받아 안쪽(백엔드)의 작업자에게 넘기고 그 응답을 인터넷 쪽으로 돌려주는 것이 역방향 프록시(reverse proxy)다**.
- 역방향 프록시를 쓰면 인터넷 쪽에서는 요청을 처리하고 응답을 만든 것이 안쪽 작업자가 아니라 프록시 서버 자신인 것처럼 보인다.
- 두 프록시 모두 사설 네트워크를 인터넷과 떼어 놓아 보안을 높이는 조치를 할 수 있게 한다.
- 한국어판은 「역방향 프록시」로 옮긴다.
쓰지 않은 것: 정방향 프록시의 쓰임, ARR의 캐싱·압축과 URL 다시 쓰기(웹 응용 프로그램 프록시 문서에는 그런 동작이 적혀 있지 않다).
- (phase 82 step 8, 2026-11-19 같은 문서를 IPv4로 다시 받아 확인 — `updated_at` 2023-03-10(`ms.date` 2014-06-11), 한국어판 `updated_at` 2026-10-27(기계 번역)) **정방향 프록시**(「Overview」·「ARR as a Forward Proxy」):
  - 프록시 서버는 요청하는 쪽의 클라이언트들이나 응답하는 쪽의 웹 서버 작업자들을 대신하는 한 접점이다. 정방향 프록시는 **클라이언트 컴퓨터들의 내부 네트워크(인트라넷) 안**에 있고, 여러 클라이언트의 요청을 받아 인터넷으로 넘기므로 **인터넷 쪽에서는 요청이 클라이언트가 아니라 프록시에서 온 것처럼 보인다**
  - 정방향 프록시와 역방향 프록시는 하는 일이 크게 다르지만, 요청하는 쪽이나 응답하는 쪽을 대신한다는 기본 동작은 같다. 둘 다 사설 네트워크를 인터넷과 떼어 놓아 보안 조치를 할 수 있게 하고, 요청과 응답을 처리하므로 캐시나 압축으로 성능을 높이고 공격을 막고 정보를 거를 수 있다
  - 정방향 프록시가 요청을 다루는 차례: 클라이언트에게서 요청을 받아 올바른지 확인한다 → 올바르면 자기 캐시에 그 응답이 있는지 본다 — **있으면 인터넷에 요청을 보내지 않고 클라이언트에게 돌려준다** → 없으면 방화벽을 지나 인터넷의 콘텐츠 서버로 요청을 보낸다 → 응답이 인터넷을 지나 프록시로 돌아오고, 그 응답을 캐시해 둘 수 있다.
    처음 요청한 클라이언트의 응답을 캐시해 두면 뒤에 같은 내용을 청한 클라이언트는 캐시에서 받아 콘텐츠 서버에 다시 묻지 않으므로, 성능이 오르고 네트워크 트래픽이 준다 — 「ARR as a Forward Proxy」
  - ARR의 정방향 프록시는 HTTP만 다루고 HTTP CONNECT를 지원하지 않아 HTTPS를 넘기지 못한다 — 같은 절(ARR 한 제품의 한계라 본문에 프록시 일반의 성질로 쓰지 않는다)
  - **한국어 이름**: 한국어판은 forward proxy를 「전달 프록시」(제목)와 「정방향 프록시」(본문)로 섞어 옮기고, reverse proxy는 「역방향 프록시」로 옮긴다. **고른 이름**: 「정방향 프록시」 — 「역방향 프록시」와 짝을 이루는 이름이라 둘을 견주기 쉽다
  쓰인 곳: (phase 82 step 10에서 쓰일 곳) `network-devices.proxy-server`(정방향 프록시의 자리와 차례, 캐시에 있으면 서버에 묻지 않는다, 인터넷 쪽에서는 프록시가 보낸 것처럼 보인다, 두 프록시의 공통점, 정방향 프록시와 역방향 프록시 — 누구 쪽에 서는가), 기출 대조(`exam-notes.md` 「phase 82 step 8」 문단 — [기출 2024-02-25 #16])
- (phase 82 step 10) 쓰인 곳: `network-devices.proxy-server`(문단 2 — 정방향 프록시는 내부 네트워크 안에서 클라이언트들의 요청을 모아 대신 보내고 인터넷 쪽에서는 요청이 프록시에게서 온다, 문단 4의 예 — 요청 확인 → 캐시 확인 → 없으면 인터넷의 서버에 요청 → 응답을 캐시해 둘 수 있고 클라이언트에 넘김, 다른 컴퓨터의 같은 요청은 서버에 다시 묻지 않는다, 문단 7 — 두 프록시의 기본 동작은 같고 사설 네트워크를 인터넷과 떼어 놓는다, 문단 8 「정방향 프록시와 역방향 프록시」), 도식 `proxy-direction`(사내 네트워크 박스의 PROXY01과 「정방향 프록시」 캡션), 문항 n331 해설

쓰인 곳: (phase 81 step 8) `windows-server-roles.remote-access` — 위 「(phase 81 step 4) … 원격 액세스·VPN·DirectAccess·웹 응용 프로그램 프록시」 항목의 역할 서비스 셋과 설치 이름(`RemoteAccess`·`DirectAccess-VPN`·`Routing`·`Web-Application-Proxy`, 기본 미설치), VPN의 뜻(터널링과 암호화, VPN 클라이언트가 VPN 서버와 지점 간 연결을 맺고 서버가 확인 뒤 데이터를 나른다, 원격 사무실),
터널링 프로토콜 넷과 풀네임·Windows 내장 VPN 클라이언트·PPTP와 L2TP 비권장·Windows Server 2025의 새 구성 기본 동작·2028(Preview) 제거, 「라우팅 및 원격 액세스」 콘솔, DirectAccess의 뜻(늘 이어짐·관리자가 관리·도메인 가입 컴퓨터만)·Always On VPN 권고·Windows 10보다 앞선 클라이언트에만·2028(Preview) 제거, 라우팅 역할 서비스(서브넷 사이 라우팅·NAT 라우터), 웹 응용 프로그램 프록시가 원격 컴퓨터를 잇지 않는다는 것(위 「VPN·DirectAccess와 무엇이 다른가」 줄, 이어서 나오는 말).
VPN과 DirectAccess의 차이는 「DirectAccess」 첫머리의 견줌(VPN은 사용자가 연결을 열고 닫는다)대로 쓰고, Always On VPN이 그 견줌의 예외라는 것은 「Remote Access」 「VPN (RAS)」 줄(손으로 연결하지 않아도)에서 이어서 나오는 말로 썼다. 예의 「원격 액세스 서버」는 이 글에서 붙인 이름표다. 도식 `remote-access-services`, 문항 n298.
`windows-server-roles.web-application-proxy` — 같은 항목의 웹 응용 프로그램 프록시 줄 전부(역방향 프록시로 내부 웹 응용 프로그램을 게시, 한국어판 이름, Windows Server 2012 R2에서 생김, 마법사에서 설치, 외부 URL과 백엔드 서버 URL·IP 주소가 아니라 FQDN, HTTPS 요청을 기다렸다가 백엔드로 HTTP나 HTTPS로 넘김, AD FS 사전 인증과 통과·원격 데스크톱 연결 앱, 지금 판의 상태)와 위 「역방향 프록시가 응답을 돌려주는 길」 줄(응답이 프록시를 거쳐 돌아간다, 인터넷 쪽에서는 프록시와 주고받는 것처럼 보인다, 사설 네트워크를 떼어 놓는다).
AD FS의 「보안 토큰」은 위 사전 인증 줄의 보안 토큰(edge token)이고, 그 밖의 AD FS 동작은 쓰지 않았다. 「Microsoft Entra 응용 프로그램 프록시」는 쓰지 않았다. 도식 `web-app-proxy`, 문항 n299·n300

## (phase 81 step 9) Microsoft Learn — Hyper-V·가상 컴퓨터·가상 하드 디스크·가상 스위치: Hyper-V virtualization in Windows Server and Windows, Hyper-V features and terminology, Hyper-V architecture, Install Hyper-V, Hardware requirements for Hyper-V, Remotely manage Hyper-V hosts with Hyper-V Manager, Install Server Core Application Compatibility Feature on Demand, Create a virtual machine in Hyper-V, Should I create a generation 1 or 2 virtual machine in Hyper-V?, Hyper-V maximum scale limits in Windows Server, New-VHD, Create and configure a virtual switch with Hyper-V, Plan for Hyper-V networking in Windows Server, New-VMSwitch; 지난 판 Hyper-V Virtual Hard Disk Format Overview
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/overview
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/features-terminology
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/architecture
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/install-hyper-v
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/host-hardware-requirements
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/remotely-manage-hyper-v-hosts
https://learn.microsoft.com/en-us/windows-server/get-started/server-core-app-compatibility-feature-on-demand
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/create-a-virtual-machine-in-hyper-v
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/should-i-create-a-generation-1-or-2-virtual-machine-in-hyper-v
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/maximum-scale-limits
https://learn.microsoft.com/en-us/powershell/module/hyper-v/new-vhd?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/create-a-virtual-switch-for-hyper-v-virtual-machines
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/plan-hyper-v-networking-in-windows-server
https://learn.microsoft.com/en-us/powershell/module/hyper-v/new-vmswitch?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/hh831446(v=ws.11)

2026-11-18에 IPv4로 내려받아 읽은 판(「Applies to」를 따로 적지 않은 것은 Windows Server 2025·2022·2019·2016·Windows 11·10·Azure Local 2311.2 이후):
「Hyper-V virtualization in Windows Server and Windows」 `updated_at` 2026-02-24(`ms.date` 2025-07-28 — 옛 주소 `hyper-v-overview`·`hyper-v-technology-overview`가 이리로 넘어온다), 「Hyper-V features and terminology」 2026-02-16(2025-08-06), 「Hyper-V architecture」 2026-01-21(2026-01-21),
「Install Hyper-V」 2026-02-16(2025-05-23), 「Hardware requirements for Hyper-V」 2025-10-28(2025-06-26 — 옛 주소 `system-requirements-for-hyper-v-on-windows`가 이리로 넘어온다), 「Remotely manage Hyper-V hosts with Hyper-V Manager」 2026-02-16(2025-06-30),
「Install Server Core Application Compatibility Feature on Demand」 2026-02-16(2025-07-01, Windows Server 2025·2022·2019), 「Create a virtual machine in Hyper-V」 2025-11-27(2025-11-27), 「Should I create a generation 1 or 2 virtual machine…」 2026-02-16(2025-06-18),
「Hyper-V maximum scale limits in Windows Server」 2026-02-16(2025-10-17, Windows Server 2025~2016·Azure Local — 판마다 탭), 「Create and configure a virtual switch with Hyper-V」 2026-02-16(2025-01-29), 「Plan for Hyper-V networking in Windows Server」 2026-02-16(2026-01-21),
`New-VHD`·`New-VMSwitch` 2025-05-14(2016-12-20, Hyper-V 모듈). 지난 판 「Hyper-V Virtual Hard Disk Format Overview」 2021-11-12(`ms.date` 2016-10-25, 「Applies To」 Windows Server 2012 R2·2012).
한국어판도 모두 받았다(`updated_at` 2026-01-21~2026-07-17, 기계 번역). `New-VHD`·`New-VMSwitch`와 지난 판 문서의 한국어판은 번역되지 않아 영문 그대로다.

- **Hyper-V**(「Hyper-V virtualization…」 첫머리): Microsoft가 만든 하이퍼바이저로, 따로 내려받지 않아도 Windows Server와 Windows 안에 있다. 이것으로 가상 머신(VM)을 여럿 만들어 돌리고 관리한다(하드웨어 가상화). 운영 체제 위가 아니라 하드웨어 위에 바로 놓이는 1형(type-1) 하이퍼바이저다.
  게스트 VM으로 여러 판의 Windows·Linux·FreeBSD를 돌릴 수 있다. Windows Server의 Hyper-V는 실시간 마이그레이션·고가용성·재해 복구 같은 기능을 갖춘 기업용이고, Windows의 Hyper-V는 개발·테스트에 맞는 가벼운 쪽이다
- **하이퍼바이저**(「Hyper-V architecture」 첫머리와 「Glossary」): 물리 하드웨어 바로 위, 운영 체제들 아래에 자리 잡는 소프트웨어다. 운영 체제마다 남과 섞이지 않는 실행 칸인 **파티션**을 내주고, 그 칸들이 아래 하드웨어를 어떻게 쓸지 가운데서 정한다. 그래서 운영 체제 여럿이 서로 떨어진 채 하드웨어 한 벌을 나눠 쓴다.
  **루트 파티션**(부모 파티션)은 Windows가 돌고 물리 메모리와 장치에 직접 닿는 유일한 파티션이며 가상화 관리 기능이 여기서 돈다. 루트 파티션이 만드는 **자식 파티션**에 **게스트 운영 체제**가 들고, 자식 파티션은 실제 하드웨어 대신 가상 장치를 본다 — 장치 요청은 VMBus나 하이퍼바이저를 거쳐 루트 파티션의 장치로 넘어간다(「Root and child partitions」).
  자식 파티션은 물리 프로세서를 직접 쓰지 않고 가상 프로세서와 자기만의 가상 메모리 주소 영역에서 돈다(「Interrupt and memory handling」). 프로세서에 하드웨어 지원 가상화(Intel VT나 AMD-V)가 있어야 한다
- **호스트와 게스트**: 문서들은 VM을 실행하는 물리 컴퓨터를 「Hyper-V 호스트」(Hyper-V host)로, VM 안의 운영 체제를 「게스트 운영 체제」(guest operating system)로 부른다 — 「Install Hyper-V」·「Create a virtual machine」·「Hyper-V architecture」, 「Hyper-V features and terminology」 「Integration Services」(호스트와 게스트 운영 체제의 시계를 맞추기, 호스트가 게스트 운영 체제가 답하는지 살피기).
  호스트에는 호스트 자신과 함께 돌릴 VM 모두에 넉넉한 메모리가 있어야 한다(「Hardware requirements」 「General requirements」). **호스트·게스트를 한 문장으로 정의한 곳은 찾지 못했다** — 위 쓰임과 파티션 설명에서 이어서 나오는 말로 쓴다
- **설치**(「Install Hyper-V」, 탭 「PowerShell」·「GUI」): Windows Server에서 Hyper-V 역할을 서버 관리자나 `Install-WindowsFeature`로 설치해야 VM을 만들고 실행할 수 있다. 관리자 PowerShell에서 `Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart`(원격 서버면 `-ComputerName`) → 설치가 끝나면 컴퓨터가 다시 시작된다 → `Get-WindowsFeature Hyper-V`로 설치를 확인한다.
  Server Core 설치에서 `-IncludeManagementTools`를 주면 PowerShell용 Hyper-V 모듈만 설치되고, Hyper-V 관리자는 다른 컴퓨터에서 원격으로 쓴다. 서버 관리자 차례: 「관리」 → 「역할 및 기능 추가」 → 「시작하기 전에」 → 「설치 유형 선택」(역할 기반 또는 기능 기반) → 「대상 서버 선택」 → 「서버 역할 선택」에서 Hyper-V를 고르고 「기능 추가」 →
  「기능 선택」 → **「가상 스위치 만들기」·「가상 머신 마이그레이션」·「기본 저장소」** 페이지에서 환경에 맞는 값 → 「설치 선택 확인」에서 「필요한 경우 대상 서버를 자동으로 다시 시작」 → 「설치」. Hyper-V는 Windows Server 2025의 모든 에디션에서 서버 역할로 쓸 수 있다(「Hyper-V virtualization…」 「Get started」). Windows 11·10은 Pro·Enterprise(·Education)에서 선택적 기능으로 켠다(Home에는 설치할 수 없다).
  Server Core 표(위 「(phase 81 step 0) … 서버 역할과 기능」 항목)에서 Hyper-V는 역할(`Hyper-V`)이고 기본 설치는 「N」이다
- **하드웨어 요구**(「Hardware requirements for Hyper-V」 「General requirements」): 2단계 주소 변환(SLAT)이 있는 64비트 프로세서, VM 모니터 모드 확장, 넉넉한 메모리(적어도 4GB), BIOS나 UEFI에서 켠 하드웨어 지원 가상화(Intel VT·AMD-V)와 하드웨어 데이터 실행 방지(Intel XD 비트·AMD NX 비트).
  SLAT은 하이퍼바이저를 설치할 때만 필요하고 Hyper-V 관리 도구만 설치할 때는 필요 없다. 명령 프롬프트에서 `Systeminfo.exe`를 실행해 「Hyper-V 요구 사항」 부분이 모두 「예」인지 본다(「How to check for Hyper-V requirements」). Windows Server 2016 이후 Hyper-V에는 SLAT이 필요하다(「Hyper-V architecture」 Note)
- **관리 도구**: **Hyper-V 관리자**(Hyper-V Manager)는 Hyper-V 호스트와 VM을 관리하는 그래픽 도구로 VM을 만들고 설정하고 돌보게 한다(「Hyper-V features and terminology」 「Management」 — 같은 절이 PowerShell, Windows Admin Center, System Center Virtual Machine Manager도 든다). 서버 관리자 「도구」 → 「Hyper-V 관리자」로 연다(「Set up hosts for live migration…」·「Use live migration…」 — 아래 항목), 시작에서 이름으로 찾아 열 수도 있다(「Create a virtual machine」).
  **파일 이름은 `virtmgmt.msc`다** — Server Core에 더하는 앱 호환성 기능 주문형(FOD)의 구성 요소 표에 「Hyper-V 관리자 — `virtmgmt.msc` — Windows Server 2022부터」로 있다(「Install Server Core Application Compatibility Feature on Demand」). 실행 창에 이 이름을 넣어 여는 차례를 적은 문서는 찾지 못했다 — `.msc` 콘솔 파일을 실행 창에서 여는 일반 규칙은 위 「(phase 80 step 8) … MMC와 실행 이름」 항목이다.
  Hyper-V 관리자는 Hyper-V 관리 도구를 설치할 때 함께 들어가고(역할 전체를 설치하든 도구만 설치하든), Windows Server에서 도구만 설치하려면 「기능 선택」의 원격 서버 관리 도구 → 역할 관리 도구 → Hyper-V 관리 도구를 고른다. 처음에는 로컬 컴퓨터도 목록에 없어, 왼쪽 창의 「Hyper-V 관리자」를 오른쪽 클릭 → 「서버에 연결」 → 「로컬 컴퓨터」를 고른다(「Remotely manage Hyper-V hosts…」)
- **쓰면 얻는 것**(「Hyper-V virtualization…」 첫머리와 「Benefits of Hyper-V」): 첫머리는 가상화로 **하드웨어 사용률을 최대로 높이고**, IT 운영을 간소화하고, **업무 연속성**을 높인다고 하고, 서버 통합과 개발·테스트 환경을 쓰임으로 든다. 「Benefits」의 항목 —
  **비용 최적화**(서버 통합으로 하드웨어 구입·**유지 관리 비용**(maintenance costs)을 줄이고 데이터 센터 공간·전력·냉각 요구를 낮춘다, Windows Server·Windows에 들어 있어 하이퍼바이저 라이선스 비용이 따로 들지 않는다), 운영 효율성, 비즈니스 민첩성, 보안 강화(작업을 서로 떼어 놓는다),
  **복원력 향상**(고가용성 기능으로 가동 중지 시간을 줄이고, Hyper-V 복제본으로 재해 복구를 하고, 실시간 마이그레이션으로 업무 연속성을 지킨다), **개발 가속**(개발·테스트 환경을 빨리 만든다), 규정 준수 간소화. 「Benefits for developers and IT professionals」: 하드웨어를 따로 두지 않고 여러 운영 체제에서 시험하고, 바꾸기 전에 VM의 스냅샷을 떠 두면 실험과 되돌리기의 안전망이 된다
- **가상 컴퓨터를 만드는 차례와 갖는 것**(「Create a virtual machine in Hyper-V」): 갖출 것 — Hyper-V를 켠 컴퓨터, 로컬 Administrators나 Hyper-V Administrators 그룹, VM에 나눠 줄 호스트의 물리 메모리, VM 구성 파일과 가상 하드 디스크를 둘 디스크 공간, (네트워크가 필요하면) 가상 스위치.
  Hyper-V 관리자에서 서버를 고르고 「작업」 창 「새로 만들기」 → 「가상 머신」 → **새 가상 머신 마법사**: 「이름 및 위치 지정」(VM 이름과 구성 파일 위치) → 「세대 지정」 → 「메모리 할당」(시작할 때 줄 메모리) → 「네트워킹 구성」(VM을 이을 가상 스위치) → 「가상 하드 디스크 연결」(새로 만들기·기존 `.vhd`/`.vhdx` 쓰기·나중에 연결) → 「설치 옵션」(운영 체제를 나중에, 또는 `.iso` 같은 부팅 이미지에서) → 「요약」 → 「마침」.
  PowerShell은 `New-VM`(`-MemoryStartupBytes`·`-VHDPath`나 `-NewVHDPath`·`-Generation`·`-Switch` 같은 매개 변수 — 문서 예: 메모리 4GB, `.vhdx`, 2세대, 외부 스위치). 만든 뒤 VM을 오른쪽 클릭 → 「연결」 → 가상 머신 연결 창에서 「시작」. 가상 네트워크 어댑터는 VM을 가상 스위치에 잇는 가상화한 NIC다(「Hyper-V features and terminology」 「Virtual network adapter」)
- **한 호스트의 여러 VM**(「Hyper-V maximum scale limits」 「Maximums for Hyper-V hosts」): 서버 하나에서 **동시에 실행할 수 있는 VM은 1,024개까지**다 — Windows Server 2025·2022·2019·2016 탭이 모두 같은 값이다. 가상 스위치 수는 Hyper-V가 한도를 두지 않는다.
  「가상 컴퓨터를 많이 쓸수록 물리 서버의 하드웨어 사용률이 낮아진다」를 반박하는 문장은 따로 없다 — 위 「쓰면 얻는 것」(통합으로 사용률을 높인다)에서 이어서 나오는 말로 쓴다
- **가상 하드 디스크**(「Hyper-V features and terminology」 「Virtual hard disks」): VM의 하드 드라이브 노릇을 하는 **파일**이다. 형식은 둘 — **VHD**(원래 형식)와 **VHDX**(새 형식 — 더 큰 용량, 더 나은 성능, 데이터 손상 보호, VM이 켜진 채 크기 바꾸기, 4KB 논리 섹터, 자동 정렬). 차이 디스크(부모 디스크를 바탕으로 바뀐 것만 따로 담아 부모를 그대로 두는 디스크)도 있다.
  **최대 크기**: 「Hyper-V maximum scale limits」의 VM 표는 **VHDX 64 TB, VHD 2,040 GB**로 적고(네 판 모두), 「Hyper-V features and terminology」는 VHD를 「2TB까지」로 적는다 — 두 문서가 VHD의 값을 달리 적으므로 본문은 표의 2,040 GB를 쓴다(2TB라는 말도 문서에 있다는 것은 쓸 때 한 줄).
  `New-VHD`는 VHD나 VHDX 형식의 새 가상 하드 디스크를 만들고, **파일 이름의 확장자(`.vhd`·`.vhdx`)가 형식을 정한다**(「Description」). 지난 판 「Hyper-V Virtual Hard Disk Format Overview」(2012 R2·2012): VHDX는 Windows Server 2012의 Hyper-V에서 처음 나온 VHD의 새 판이고 64 TB까지 담으며 정전 때 데이터 손상을 막는다 — 지금 판의 위 줄과 맞다
- **세대**(「Should I create a generation 1 or 2…」, 「Hyper-V features and terminology」 「Virtual machine generations」): 1세대는 레거시 BIOS 펌웨어로 옛 하드웨어 흉내(IDE 컨트롤러 등)를 쓰고, 2세대는 UEFI 펌웨어로 보안 부팅·SCSI 부팅 같은 기능을 쓴다. 특별한 까닭이 없으면 2세대를 권하고, **만든 뒤에는 세대를 바꿀 수 없다**.
  부팅 볼륨 최대 — 2세대 64 TB(.VHDX), 1세대 .VHDX 2 TB·.VHD 2040 GB. 「Create a virtual machine」의 `-Generation` 설명은 VHD에는 1세대, VHDX에는 2세대를 쓰라고 한다. 지금 판 「Features Removed…」의 Windows Server 2028(Preview) 탭 — 2028을 게스트로 쓰는 VM은 2세대여야 한다(위 「(phase 81 step 0)」 줄)
- **가상 스위치**(「Hyper-V features and terminology」 「Virtual switch」, 「Plan for Hyper-V networking…」): VM끼리, 그리고 VM과 바깥 네트워크가 통신하게 하는 **소프트웨어로 된 네트워크 스위치**다. 종류는 셋 —
  **외부**(External — 호스트의 물리 네트워크 어댑터에 묶여 VM을 유선 물리 네트워크에 잇는다), **내부**(Internal — 그 스위치가 있는 호스트에서 도는 VM끼리, 그리고 호스트와 VM 사이만 잇고 바깥 네트워크와는 잇지 않는다), **프라이빗**(Private — 같은 호스트의 VM끼리만 잇고, 호스트와 VM 사이도 바깥 네트워크도 잇지 않는다).
  만드는 자리(「Create and configure a virtual switch…」): Hyper-V 관리자 「작업」 창 → **「가상 스위치 관리자」** → 스위치 종류를 고르고 「가상 스위치 만들기」 → 이름을 넣고, 외부면 쓸 네트워크 어댑터(NIC)를 골라 「확인」(네트워크 연결이 잠시 끊길 수 있다는 경고에 「예」), 내부·프라이빗이면 「확인」. Hyper-V 역할을 설치할 때 함께 만들 수도 있다(위 설치 마법사의 「가상 스위치 만들기」 페이지).
  외부 스위치는 관리 운영 체제(호스트)가 같은 네트워크 어댑터를 함께 쓰게 할 수 있다(「Management Operating System sharing」). PowerShell: `New-VMSwitch -Name <이름> -NetAdapterName <어댑터 이름>`이 외부 스위치를, `New-VMSwitch -Name <이름> -SwitchType Internal`(또는 `Private`)이 내부·프라이빗 스위치를 만든다 — `-SwitchType`이 받는 값은 Internal과 Private뿐이고, 외부 스위치는 `-NetAdapterName`(또는 `-NetAdapterInterfaceDescription`)을 주면 그것으로 정해진다(`New-VMSwitch` 「-SwitchType」).
  스위치의 뜻은 phase 72의 `hub-switch-vlan` 항목(IEEE 802.1D 등)과 맞춘다
- **한국어 이름**: 한국어판은 「Hyper-V 관리자」, 「하이퍼바이저」, 「루트 파티션」·「자식 파티션」, 「게스트 운영 체제」·「호스트 운영 체제」, 「가상 스위치 관리자」, 「가상 스위치 만들기」, 스위치 종류 「외부」·「내부」·「프라이빗」(「Create and configure a virtual switch…」 한국어판은 한 곳에서 「비공개」로도 옮긴다), 마법사 페이지 「이름 및 위치 지정」·「메모리 할당」·「네트워킹 구성」·「가상 하드 디스크 연결」·「설치 옵션」·「요약」으로 옮긴다.
  virtual machine은 한국어판 대부분이 「가상 머신」으로 옮기고(개요 23번·만들기 55번·검사점 43번), 「가상 머신 내보내기 및 가져오기」 본문과 「1세대 또는 2세대」 문서는 「가상 컴퓨터」를 섞어 쓴다(본문 6번·20번). 만들기 문서 한국어판은 마법사 이름을 「새 Virtual Machine 마법사」로 반만 옮긴다.
  **고른 이름**: 「가상 컴퓨터」(virtual machine) — guide.md가 정한 이름이고 기출이 Hyper-V 문항 셋([기출 2024-08-25 #43]·[기출 2025-11-02 #29]·[기출 2026-02-01 #33])에서 쓰는 이름이며 한국어판도 쓴다. 본문은 처음 쓸 때 「가상 머신(VM)이라고도 부른다」를 한 줄 밝히고, 화면 이름은 문서가 보이는 「새 가상 머신 마법사」·「가상 머신 연결」처럼 한국어판의 표기를 쓴다.
  「가상 스위치」, 스위치 종류는 「외부」·「내부」·「프라이빗」(guide.md의 「개인」 대신 — 한국어판 어디에도 「개인」이 없다), 「가상 하드 디스크」, 「호스트」·「게스트」. **실제 한국어 Hyper-V 관리자 화면의 이름은 확인하지 못했다**
- (phase 81 step 11, 2026-11-19 IPv4로 다시 받아 확인 — 「Plan for Hyper-V networking in Windows Server」 `updated_at` 2026-02-16·한국어판 2026-07-17, 「Create and configure a virtual switch with Hyper-V」 2026-02-16·한국어판 2026-02-16) **가상 스위치와 가상 네트워크 어댑터**(「Plan…」 「Hyper-V networking basics」):
  가상 스위치는 이더넷 네트워크에 이어지고 가상 네트워크 어댑터는 가상 스위치의 포트에 이어져 VM이 네트워크를 쓰게 한다. VM을 만들어 가상 스위치에 이으면 가상 네트워크 어댑터가 저절로 더해진다. 가상 스위치는 모두 Hyper-V 호스트에 딸리고, 가상 네트워크 어댑터 하나는 VM 하나에만 딸린다.
  **관리 운영 체제의 어댑터 공유**(「Plan…」 「Virtual switch options」의 설정 「Allow management operating system to share this network adapter」, 「Create and configure…」 「Management Operating System sharing」): 외부 가상 스위치는 VM을 외부 네트워크에 잇고, 이 설정을 켜면 Hyper-V 호스트(관리 운영 체제)도 그 가상 스위치와 NIC를 VM과 함께 쓴다.
  Hyper-V 관리자 「가상 스위치 관리자」에서 스위치를 골라 이 확인란을 켜거나 `Set-VMSwitch -Name <이름> -AllowManagementOS $true`로 켠다. 기본으로 켜져 있는지는 두 문서에 없다 — 본문은 「허용할 수 있다」까지만 쓴다.
  한국어판은 이 설정을 「이 네트워크 어댑터를 공유하는 관리 운영 체제 허용」(「Plan…」)과 「관리 운영 체제에서 이 네트워크 어댑터를 공유하도록 허용」(「Create and configure…」)으로 달리 옮긴다 — 본문은 화면 이름을 인용하지 않고 하는 일로 쓴다.
  쓰인 곳: `windows-hyperv.virtual-switch`(소개 문단의 어댑터·스위치 관계, 「네트워킹 구성」에서 스위치를 고르면 저절로 더해지는 어댑터, 외부 스위치에서 호스트도 어댑터를 함께 쓰는 것), 도식 `virtual-switch-types`의 「외부」 시나리오에서 호스트가 선명한 근거

쓰인 곳: (phase 81 step 10·11에서 쓰일 곳) `windows-hyperv.hyper-v`(Hyper-V의 정의, 하이퍼바이저·파티션, 호스트와 게스트, 설치 두 자리와 하드웨어 요구 한 줄, Hyper-V 관리자와 `virtmgmt.msc`, 쓰면 얻는 것), `windows-hyperv.virtual-machines`(새 가상 머신 마법사가 정하는 것, 가상 장치, 한 호스트 1,024개, VHD·VHDX와 최대 크기·확장자, 세대 한 줄),
`windows-hyperv.virtual-switch`(세 종류와 잇는 범위, 가상 스위치 관리자, `New-VMSwitch`), 기출 대조(`exam-notes.md` 「phase 81 step 9」 문단 — [기출 2024-08-25 #43]·[기출 2025-11-02 #29]·[기출 2026-02-01 #33]·[기출 2025-02-23 #30]·[기출 2026-05-17 #45])

## (phase 81 step 9) Microsoft Learn — 검사점·내보내기와 가져오기: Use checkpoints, Export and import virtual machines, Checkpoint-VM
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/checkpoints
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines
https://learn.microsoft.com/en-us/powershell/module/hyper-v/checkpoint-vm?view=windowsserver2025-ps

2026-11-18에 IPv4로 내려받아 읽은 판: 「Use checkpoints」 `updated_at` 2025-09-22(`ms.date` 2024-07-31, 「Applies to」 Windows Server 2025~2016·Windows 11·10·Azure Local 2311.2 이후) — guide.md가 든 옛 주소(`manage/choose-between-standard-or-production-checkpoints-in-hyper-v`, `manage/enable-or-disable-checkpoints-in-hyper-v`, `virtualization/hyper-v-on-windows/user-guide/checkpoints`)는 모두 이 문서로 넘어온다.
「Export and import virtual machines」 2025-09-22(2015-05-14, 같은 판들), `Checkpoint-VM` 2025-05-14(2016-12-20). 한국어판 「검사점 사용」 2026-01-21, 「가상 머신 내보내기 및 가져오기」 2026-01-21. 검사점의 두 종류는 위 항목의 「Hyper-V features and terminology」 「Checkpoints」에도 있다.

- **검사점**(checkpoint): 만든 순간의 VM 상태를 기록해 두었다가, 뒤에 그 기록을 써서 VM을 그 순간으로 돌려놓는 기능이다 — 시험·개발과 문제가 생긴 뒤의 복구에 쓴다(「Hyper-V features and terminology」 「Checkpoints」). 쓰는 때는 설정 변경, 업데이트 적용, 새 소프트웨어 설치처럼 VM을 바꾸기 직전이다 — 바꾼 뒤 문제가 생기면 검사점 시점으로 VM을 되돌린다(「Use checkpoints」 첫머리)
- **두 종류**(「Use checkpoints」 첫머리, 「Hyper-V features and terminology」): **표준 검사점**(Standard) — 검사점을 시작한 때의 VM과 **VM 메모리 상태**의 스냅샷을 뜬다(켜져 있든 꺼져 있든 메모리·디스크·장치 상태를 붙잡는다). 응용 프로그램이 일관된 상태를 보장하지 않아 테스트·개발에 맞다.
  **프로덕션 검사점**(Production) — Windows 게스트에서는 볼륨 섀도 복사본 서비스(VSS), Linux 게스트에서는 파일 시스템 고정(File System Freeze)을 써서 데이터가 맞는 상태의 백업을 만들고, **메모리 상태는 스냅샷하지 않는다**. 실제 운영 환경에 맞다.
  **기본값은 프로덕션 검사점**이고 Hyper-V 관리자나 PowerShell로 바꾼다. 판: Windows 10보다 앞선 Hyper-V는 표준 검사점(옛 이름 스냅샷)만 제공했다 — 문서 문장은 「Windows 10·11의 Hyper-V에 두 종류가 있다」로 쓰지만 같은 페이지의 「Applies to」는 Windows Server 2016~2025를 든다. 이 문서와 지금 판 문서에서 「Windows Server 2016부터」라고 판을 적은 문장은 찾지 못했다
- **종류 바꾸기**: Hyper-V 관리자 → VM 오른쪽 클릭 → 「설정」 → 「관리」 아래 「검사점」 → 종류를 고른다. PowerShell `Set-VM -Name <VM 이름> -CheckpointType Standard`(표준), `Production`(프로덕션 — 실패하면 표준 검사점을 대신 만든다), `ProductionOnly`(프로덕션 — 실패하면 만들지 않는다). 같은 설정 화면의 「검사점 사용」 확인란은 기본으로 켜져 있다(「Enable or disable checkpoints」).
  자동 검사점(VM을 시작할 때 저절로 만들고 멈출 때 병합한다)은 고를 수 있는 기능이다(「Hyper-V features and terminology」)
- **만들기**: Hyper-V 관리자에서 VM 이름을 오른쪽 클릭 → **「검사점」** → 끝나면 Hyper-V 관리자의 「검사점」 칸에 나타난다. PowerShell `Checkpoint-VM -Name <VM 이름>`, 목록은 `Get-VMCheckpoint -VMName <VM 이름>`. 기본 이름은 VM 이름에 만든 날짜·시각을 붙인 것이다(「Renaming checkpoints」 — 100자까지)
- **되돌리기 — 적용**(「Applying checkpoints」): 「가상 머신」에서 VM을 고르고 「검사점」 칸의 검사점을 오른쪽 클릭 → **「적용」** → 대화 상자의 셋 가운데 — 「검사점 만들기 및 적용」(앞 검사점을 적용하기 전에 지금 상태로 새 검사점을 하나 더 만든다), 「적용」(고른 검사점만 적용하고 되돌릴 수 없다), 「취소」.
  PowerShell `Restore-VMCheckpoint -Name <검사점 이름> -VMName <VM 이름> -Confirm:$false`. 문서의 실습: **표준 검사점을 적용하면** 검사점을 만든 때와 똑같은 상태로 돌아와, 그때 열려 있던 메모장과 저장하지 않은 글까지 그대로 있다. **프로덕션 검사점을 적용하면** VM이 꺼진 상태가 되고, 켜서 들어가면 저장했던 파일은 돌아와 있지만 메모장은 열려 있지 않다
- **파일**(「Deleting checkpoints」·「Configure checkpoint location」): 검사점은 VM의 `.vhdx` 파일과 같은 곳에 **`.avhdx` 파일**로 저장된다. 검사점을 지우면 Hyper-V가 `.avhdx`와 `.vhdx`를 병합하고 `.avhdx`를 지운다 — `.avhdx`를 직접 지우지 마라. 검사점을 지우면 호스트의 공간을 되찾는다.
  검사점 구성 파일·저장 상태 파일의 위치는 검사점이 없을 때 「검사점 파일 위치」에서 바꿀 수 있다
- **백업과의 관계**: 스냅샷(표준 검사점)은 **전체 백업이 아니며**, Active Directory처럼 노드 사이에 데이터를 복제하는 시스템에서는 데이터가 어긋나는 문제를 일으킬 수 있다(「Use checkpoints」 첫머리의 표준 검사점 줄). 검사점을 **내보내면** VM으로 묶여 다른 위치로 옮겨지고, 가져오면 VM으로 복원되며, 내보낸 검사점은 백업에 쓸 수 있다(「Exporting checkpoints」)
- **옛 이름 스냅샷**: Windows 10보다 앞선 Hyper-V의 표준 검사점을 스냅샷이라고 불렀다(위 줄). Hyper-V PowerShell 모듈에는 별칭이 있어 checkpoint와 snapshot을 서로 바꿔 쓸 수 있다(「Use checkpoints」 Note)
- **내보내기**(export, 「Export and import virtual machines」): VM을 옮기거나 복사하는 빠른 방법이다. 내보내기는 필요한 파일 — **가상 하드 디스크 파일, VM 구성 파일, 검사점 파일** — 을 한 단위로 모은다. VM이 켜져 있어도 꺼져 있어도 할 수 있다. Hyper-V 관리자에서 VM 오른쪽 클릭 → 「내보내기」 → 저장할 위치 → 「내보내기」, PowerShell `Export-VM -Name <VM 이름> -Path <경로>`
- **가져오기**(import): 내보낸 VM을 Hyper-V 호스트에 등록해 그 호스트에서 쓰게 한다 — 원래 호스트로도 새 호스트로도 가져올 수 있다. 「작업」 메뉴 「가상 머신 가져오기」 → 내보낸 파일이 든 폴더 → 가져올 VM → **가져오기 형식** — 제자리에 등록(파일을 지금 있는 곳에서 그대로 쓰고 ID를 지킨다)·VM 복원(고른 위치로 복사하고 ID를 지킨다)·VM 복사(고른 위치로 복사하고 **새 ID**를 준다 — 같은 호스트에 여러 번 가져올 수 있다) → 「마침」. PowerShell `Import-VM`.
  VM 구성에는 판 번호가 있어 더 새 Hyper-V에서 만든 VM을 옛 Hyper-V로 가져올 수는 없다
- **기출 오답의 이름**: 「롤백」은 개요 문서(위 항목 「Benefits for developers…」)가 스냅샷의 쓰임(실험과 되돌리기)을, 「Hyper-V features and terminology」가 검사점으로 그 시점에 되돌아가는 일(roll back)을 말할 때 쓰는 낱말일 뿐 Hyper-V 기능의 이름이 아니다.
  「타임머신」·「새로 고침」이라는 이름의 Hyper-V 기능은 이 항목과 이 step의 다른 항목에서 읽은 Hyper-V 문서 어디에도 없다
- **한국어 이름**: 한국어판은 「검사점」(「검사점 사용」 한국어판에서 119번 — 「체크포인트」는 내보내기 문서 한국어판에 한 번), 「표준 검사점」·「프로덕션 검사점」, 「적용」·「검사점 만들기 및 적용」, 옛 이름은 「스냅샷」, 「내보내기」·「가져오기」·「가상 머신 가져오기」(같은 문서 본문은 「가상 컴퓨터 내보내기」·「가상 컴퓨터 가져오기」로도 옮긴다)로 옮긴다.
  **고른 이름**: 「검사점」(checkpoint — 한국어판의 표기이고 기출 둘이 쓰는 이름), 「표준 검사점」·「프로덕션 검사점」, 「적용」, 「내보내기」·「가져오기」. 옛 이름은 한국어판 표기 「스냅샷」(snapshot — guide.md의 「스냅숏」 대신, 한국어판의 표기다). **실제 한국어 Hyper-V 관리자 화면의 이름은 확인하지 못했다**
- (phase 81 step 11, 2026-11-19 다시 받아 확인 — 같은 판) **적용 뒤의 변경**(「Use checkpoints」 「Applying checkpoints」·「Using standard checkpoints」·「Using production checkpoints」): 「검사점 만들기 및 적용」은 앞 검사점을 적용하기 전에 VM의 새 검사점을 하나 만든다.
  두 실습 모두 검사점을 만든 뒤 VM 바탕 화면의 텍스트 파일을 지우고 검사점을 적용하면 그 파일이 다시 있음을 보인다 — 적용하면 검사점 뒤의 변경이 남지 않는다는 것은 이 실습과 첫머리(검사점을 만든 때의 상태로 VM을 되돌린다)에서 이어서 나오는 말이다.
  쓰인 곳: `windows-hyperv.checkpoints`(적용 문단, 예시의 넷째 단계), 도식 `checkpoint-apply`의 「적용」 시나리오와 캡션

쓰인 곳: (phase 81 step 11에서 쓰일 곳) `windows-hyperv.checkpoints`(정의, 두 종류와 기본값·판, 종류 바꾸기, 만들기·적용과 대화 상자, 두 종류를 적용했을 때의 차이, `.avhdx`, 전체 백업이 아니라는 것, 옛 이름, 내보내기·가져오기와의 차이), 기출 대조(`exam-notes.md` 「phase 81 step 9」 문단 — [기출 2026-05-17 #45]·[기출 2026-08-02 #45])

## (phase 81 step 9) Microsoft Learn — 실시간 마이그레이션·저장소 마이그레이션·Hyper-V 복제본: Live Migration Overview, Set up hosts for live migration without Failover Clustering, Use live migration without Failover Clustering to move a virtual machine, Move-VM, Move-VMStorage, Hyper-V Replica overview, Enable Hyper-V Replica on a single host, Replicate a virtual machine with Hyper-V Replica, Enable-VMReplication; 지난 판 Virtual Machine Storage Migration Overview
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/live-migration-overview
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/set-up-hosts-for-live-migration-without-failover-clustering
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/manage/use-live-migration-without-failover-clustering-to-move-a-virtual-machine
https://learn.microsoft.com/en-us/powershell/module/hyper-v/move-vm?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/powershell/module/hyper-v/move-vmstorage?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/replication-overview
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/configure-replication-single-host
https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/replication-virtual-machines
https://learn.microsoft.com/en-us/powershell/module/hyper-v/enable-vmreplication?view=windowsserver2025-ps
https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/hh831656(v=ws.11)

2026-11-18에 IPv4로 내려받아 읽은 판(「Applies to」는 모두 Windows Server 2025~2016·Azure Local 2311.2 이후 — Windows 11·10이 없다): 「Live Migration Overview」 `updated_at` 2025-09-22(`ms.date` 2017-06-27), 「Set up hosts for live migration…」 2025-10-28(2025-08-14), 「Use live migration…」 2025-09-22(2025-02-19),
「Hyper-V Replica overview」 2026-02-16(2025-11-10 — 옛 주소 `manage/set-up-hyper-v-replica`가 이리로 넘어온다), 「Enable Hyper-V Replica on a single host」·「Replicate a virtual machine with Hyper-V Replica」 2026-11-16(2026-04-28), `Move-VM`·`Move-VMStorage`·`Enable-VMReplication` 2025-05-14(2016-12-20).
지난 판 「Virtual Machine Storage Migration Overview」 2021-11-12(`ms.date` 2016-10-25, 「Applies To」 Windows Server 2012 R2·2012). 한국어판도 받았다(「실시간 마이그레이션 개요」 2026-01-21, 「Hyper-V 복제본 개요」 2026-02-16 등 — 지난 판과 PowerShell 문서는 영문 그대로). 위 첫 항목의 「Hyper-V features and terminology」 「Live migration」·「Storage migration」·「Replication」 절도 함께 썼다.

- **실시간 마이그레이션**(live migration, 「Live Migration Overview」 첫머리): Windows Server의 Hyper-V 기능이고, **실행 중인 VM을 한 Hyper-V 호스트에서 다른 호스트로, 사용자가 느낄 만한 가동 중지 없이** 옮긴다. 가장 큰 이점은 실행 중인 VM이 한 호스트에 묶이지 않는다는 것 — 호스트를 폐기하거나 업그레이드하기 전에 그 호스트의 VM을 모두 다른 호스트로 비울 수 있다. 장애 조치 클러스터와 함께 쓰면 고가용성 시스템을 만든다.
  「Hyper-V features and terminology」 「Live migration」: 부하 분산·하드웨어 점검·재해 복구에 쓰고, 네트워크(SMB나 TCP/IP, RDMA)로 옮기며, **Windows Server의 Hyper-V에만 있다**. 같은 클러스터의 호스트 사이나 독립 실행형 호스트 사이로 옮긴다. 개요 「High availability…」: 서비스를 멈추지 않고 계획된 점검을 하게 한다. Windows Server 2016부터 장애 조치 클러스터 없이도 쓴다(「Live Migration in Windows Server 2016」)
- **공유 없는 실시간 마이그레이션**(shared nothing live migration, 개요 「High availability…」): 공유 저장소 없이 VM을 호스트 사이로 옮긴다 — 저장소 구성이 다른 호스트 사이나 멀리 떨어진 사이트 사이에서. `Move-VM`은 VM을 새 Hyper-V 호스트로 옮기고(「Description」), `Move-VM LMTest TestServer02 -IncludeStorage -DestinationStoragePath D:\LMTest`는 VM을 대상 서버로 옮기면서 가상 하드 디스크와 검사점·스마트 페이징 파일 같은 다른 파일도 대상 서버의 그 폴더로 옮긴다(「Use live migration…」 PowerShell 예)
- **옮기는 차례**(「Use live migration…」): 서버 관리자 「도구」 → 「Hyper-V 관리자」 → 서버를 고른다 → 「가상 머신」 창에서 VM 오른쪽 클릭 → **「이동」** → **이동 마법사** → 이동 종류·대상 서버·옵션을 고른다 → 「요약」 → 「마침」. **마법사가 보이는 이동 종류의 화면 이름은 이 문서와 Microsoft Learn 검색 어디에서도 찾지 못했다** — 본문은 「이동 마법사에서 이동 종류를 고른다」까지만 쓴다
- **요구**(「Set up hosts for live migration…」 「Requirements…」, 「Use live migration…」): 원본·대상 서버 모두 Hyper-V 역할, 같은 Active Directory 도메인이나 서로 트러스트하는 도메인, 양쪽 서버의 로컬 Hyper-V Administrators나 Administrators 그룹, Windows Server 2012 R2 이후 호스트 사이. 실시간 마이그레이션 트래픽은 **암호화하지 않고** 보내므로 믿을 수 있는 사설 네트워크로 떼어 두라고 권한다.
  설정 자리는 Hyper-V 관리자 「작업」 창 「Hyper-V 설정」 → 「실시간 마이그레이션」(위 첫 항목의 설치 마법사 「가상 머신 마이그레이션」 페이지에서도 정한다). 프로세서: 프로세서 호환성 모드를 켜면 **같은 제조사 계열 안에서** 프로세서 모델이 다른 호스트 사이로 옮길 수 있다(「Hyper-V features and terminology」 「Processor compatibility」) —
  호환성을 켜지 않은 VM에 스냅샷이 있으면 프로세서 판이 다른 호스트로 옮기기가 실패한다(「Use live migration…」 문제 해결). 인증 방식(CredSSP·Kerberos 제한된 위임)과 성능 옵션은 쓰지 않는다
- **저장소 마이그레이션**(storage migration, 「Hyper-V features and terminology」 「Storage migration」): **VM의 저장소 파일(가상 하드 디스크 같은 것)을 가동 중지 없이 한 위치에서 다른 위치로** 옮긴다. 다른 저장 장치로 옮기기, 저장 성능 다듬기, 저장소 다시 배치에 쓰고, **Windows Server의 Hyper-V에만 있다**. 개요 「High availability…」: 서로 다른 저장소 배열 사이로 가동 중지 없이 옮겨 저장소 업그레이드와 부하 분산을 돕는다.
  `Move-VMStorage`는 **VM의 저장소를 옮긴다**(「Description」) — `-DestinationStoragePath`(VM의 모든 저장소를 한 경로로), `-VirtualMachinePath`(구성 파일과 그에 딸린 메모리 파일), `-SnapshotFilePath`(스냅샷 파일), `-SmartPagingFilePath`, `-Vhds`(가상 하드 디스크마다 따로 정한 위치). 예 1: `Move-VMStorage "Test VM" -DestinationStoragePath D:\TestVM`은 그 VM에 딸린 모든 파일을 `D:\TestVM`으로 옮긴다.
  **VM은 같은 호스트에 남는다** — `Move-VMStorage`에는 대상 호스트를 정하는 매개 변수가 없고(`Move-VM`의 `-DestinationHost`와 견준다), 지난 판 개요가 실행 중인 VM을 새 저장소로 옮긴다고 쓴다. 한 문장으로 「같은 호스트에 남는다」를 적은 곳은 찾지 못했다 — 이 둘에서 이어서 나오는 말이다.
  Hyper-V 관리자에서는 VM 오른쪽 클릭 → 「이동」(이동 마법사)에서 이동 종류를 고르는 데까지만 문서가 보인다(위 줄)
- **지난 판 「Virtual Machine Storage Migration Overview」(Windows Server 2012 R2·2012)**: Windows Server 2008 R2에서는 실시간 마이그레이션으로 실행 중인 VM을 옮길 수 있었지만 VM이 실행 중일 때 저장소는 옮길 수 없었다. **Windows Server 2012의 Hyper-V부터 VM이 실행되는 채로 저장소를 옮긴다** — Hyper-V 관리자의 마법사나 PowerShell cmdlet으로. 가장 흔한 까닭은 Hyper-V가 쓰는 물리 저장소를 새로 바꾸는 것이고, 저장소 처리량의 병목으로 성능이 떨어질 때 실행 중에 다른 장치로 옮기기도 한다.
  요구: VM이 가상 하드 디스크만 저장소로 쓸 것(물리 디스크에 직접 붙은 저장소가 있으면 옮길 수 없다). **옮기는 차례**: 옮기는 동안 대부분의 디스크 읽기·쓰기는 원본 가상 하드 디스크로 간다 → 그동안 디스크 내용을 대상의 새 가상 하드 디스크로 복사한다 → 첫 복사가 끝나면 디스크 쓰기를 원본과 대상 둘 다에 거울처럼 쓰면서 남은 변경을 옮긴다 → 둘이 완전히 같아지면 VM이 대상 디스크를 쓰도록 바뀐다 → 원본 디스크를 지운다.
  지금 판 문서에서 이 차례를 적은 곳은 찾지 못했고, 지금 판(「Hyper-V features and terminology」)은 같은 기능을 「가동 중지 없이」로 말한다
- **Hyper-V 복제본**(Hyper-V Replica, 「Hyper-V Replica overview」 첫머리): Windows Server의 Hyper-V에 들어 있는 기능으로, 업무 연속성·재해 복구(BCDR)를 위해 Hyper-V 호스트 사이에 VM을 복제한다. 보조 호스트(세 번째 호스트까지 넓힐 수 있다)에 VM의 **오프라인 사본**을 만들어 두고 맞춰 두다가, 주 호스트가 실패하면 장애 조치에 쓴다. **Windows 클라이언트의 Hyper-V에는 없다**.
  하나의 VM이 서로 다른 호스트에 두 개로 있다 — 활발히 실행되는 **주 VM**(primary VM)과 그 오프라인 사본인 **복제본 VM**(replica VM)(「How Hyper-V Replica works」). 장애 조치 클러스터와 다르다 — 클러스터는 공유 저장소의 VM을 다른 노드에서 다시 시작해 로컬 고가용성을 주고, 복제본은 다른 호스트에 VM 저장소의 비동기 사본을 둔다(첫머리 둘째 문단)
- **복제본 서버와 주 서버**(「Enable Hyper-V Replica on a single host」): 복제를 **받는 쪽** 호스트를 구성한다 — Hyper-V 관리자에서 그 호스트를 고르고 「작업」 → 「Hyper-V 설정」 → 「복제 구성」 → **「이 컴퓨터를 복제본 서버로 사용」** 확인란 → 인증과 포트(Kerberos(HTTP, 기본 80번)나 인증서 기반(HTTPS, 기본 443번)) → 권한 부여와 저장소(인증에 성공한 모든 주 서버에서 받기, 또는 정한 주 서버에서만 받기 — 복제된 가상 하드 디스크를 둘 위치).
  Hyper-V 역할을 설치하면 Windows 방화벽에 HTTP(80)·HTTPS(443) 예외가 만들어지지만 기본으로 켜져 있지는 않다
- **복제 켜기와 복제 빈도**(「Replicate a virtual machine with Hyper-V Replica」): 주 호스트의 Hyper-V 관리자에서 VM 오른쪽 클릭 → **「복제 사용」** → 「복제본 서버 지정」 → 연결 매개 변수 → 「복제 VHD 선택」(빼 둘 디스크) → **「복제 빈도 구성」 — 30초·5분·15분 가운데 하나** → 「추가 복구 지점 구성」(최신 복구 지점만, 또는 시간마다 추가 복구 지점) → 「초기 복제 선택」(네트워크로 첫 사본 보내기가 기본, 외부 미디어, 복제본 서버의 기존 VM) → 요약 → 「마침」.
  PowerShell `Enable-VMReplication`의 `-ReplicationFrequencySec`는 복제본 서버로 변경을 보내는 간격을 **초**로 정한다(「-ReplicationFrequencySec」 — 매개 변수 표의 기본값 칸은 None). 같은 문서의 PowerShell 예는 「복제 빈도 5분의 기본 설정」으로 복제를 켜고, 출력의 `FrequencySec`가 300이다 — **기본 복제 빈도가 5분이라는 것은 이 예에서만 확인했다**.
  확장 복제(세 번째 호스트로)는 5분·15분만 고를 수 있다. 복구 지점은 기본이 최신 하나이고 시간마다 최대 24개까지 둔다(개요 「Plan for Hyper-V Replica」 표)
- **복제가 동작하는 차례**(개요 「How Hyper-V Replica works」): 복제를 켜면 보조 호스트에 VM의 첫 사본을 만든다(네트워크나 외부 미디어로) → Hyper-V가 주 VM의 가상 하드 디스크에 생기는 변경을 따라가 같은 위치의 `.hrl` 파일에 적는다 → **정한 복제 간격(30초·5분·15분)마다** 변경을 보조 호스트로 보낸다 — **비동기**라 주 VM은 복제하는 동안 그대로 일한다 → 보조 호스트가 받은 변경을 복제본 VM의 가상 하드 디스크에 적용한다 →
  주 호스트가 실패하면 복제본 VM으로 **장애 조치**(failover)를 시작해 복제본 VM이 새 주 VM이 된다(손으로나 스크립트로) → 주 호스트를 되살리면 **역방향 복제**로 그동안의 변경을 원래 주 VM에 돌려보낸다. 개요 「High availability…」(위 첫 항목의 「Hyper-V virtualization…」): 복구 시점 목표(RPO)를 30초까지 낮출 수 있다
- **장애 조치의 두 갈래**(개요 「Key features」): **계획된 장애 조치**(planned failover) — 주 VM을 정상 종료하고 남은 변경을 복제한 뒤 복제본으로 넘어간다. **계획되지 않은 장애 조치**(unplanned failover) — 주 VM을 끄지 않고 복제본 VM을 시작하므로 **데이터 일부를 잃을 수 있다**.
  「마지막 복제 뒤의 변경을 잃는다」를 한 문장으로 적은 곳은 찾지 못했다 — 복제가 정한 간격마다 비동기로 간다는 것과 계획되지 않은 장애 조치의 데이터 손실에서 이어서 나오는 말이다. 테스트 장애 조치의 차례는 쓰지 않는다
- **한국어 이름**: 한국어판은 「실시간 마이그레이션」(「실시간 마이그레이션 개요」 제목 — 「Use live migration…」 한국어판은 「라이브 마이그레이션」으로 옮긴다), 「이동」·「이동 마법사」, 「스토리지 마이그레이션」(「Hyper-V features and terminology」 한국어판의 절 제목 — 지난 판 저장소 마이그레이션 문서의 한국어판은 번역되지 않았다), 「Hyper-V 복제본」·「주 VM」·「복제본 VM」·「복제본 서버」·「주 서버」,
  「장애 조치(failover)」·「계획된 장애 조치」·「계획되지 않은 장애 조치」, 「복제 사용」, 「복제 빈도 구성」, 「복제 구성」, 「이 컴퓨터를 복제본 서버로 사용」으로 옮긴다.
  **고른 이름**: 「실시간 마이그레이션」(live migration), 「저장소 마이그레이션」(storage migration — guide.md가 정한 개념 이름이고 기출이 「다른 저장소로 이동」이라는 낱말을 쓴다. 한국어판은 「스토리지 마이그레이션」으로 옮긴다는 것을 본문에서 한 줄 밝힌다), 「Hyper-V 복제본」(Hyper-V Replica), 「주 서버」·「복제본 서버」, 「복제 빈도」, 「장애 조치」·「계획된 장애 조치」·「계획되지 않은 장애 조치」. **실제 한국어 Hyper-V 관리자 화면의 이름은 확인하지 못했다**
- (phase 81 step 12, 2026-11-19 Microsoft Learn에서 다시 읽어 확인) **실시간 마이그레이션이 옮기는 것과 그 차례** — 지난 판 「Virtual Machine Live Migration Overview」(https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-R2-and-2012/hh831435(v=ws.11), 「Applies To」 Windows Server 2012 R2·2012) 「Technical overview」:
  옮기는 VM의 메모리를 대상 서버에 먼저 복사해 두는 방식이라 옮기는 시간이 짧고, 게스트 운영 체제는 자기가 옮겨지는 줄 모르므로 게스트에 따로 설정할 것이 없다. 차례는 여섯 단계로 적혀 있다 —
  ① 원본 서버가 대상 서버와 연결을 맺고 VM의 구성 데이터를 넘기면, 대상 서버에 뼈대만 있는 VM이 세워지고 메모리가 마련된다 ② VM이 원본에서 계속 실행되는 동안 그 VM에 준 메모리를 네트워크로 대상에 복사하고, 그사이 VM이 바꾼 메모리 쪽(한 쪽은 4KB)을 표시해 두었다가 다시 보내는 일을 여러 번 되풀이한다(되풀이할수록 보낼 쪽이 준다)
  ③ 남은 바뀐 쪽을 마저 보내고 VM의 CPU 상태와 장치 상태를 대상으로 넘긴다(이 단계 전에는 언제든 취소할 수 있다) ④ 가상 하드 디스크 같은 저장소를 다루는 권한을 대상 서버로 넘긴다 ⑤ 대상 서버에서 VM을 이어서 실행한다 ⑥ 네트워크 스위치에 메시지를 보내, VM으로 오가는 데이터가 맞는 스위치 포트로 가게 한다.
  같은 문서 첫머리는 사용자가 VM을 쓰는 데 영향 없이 옮긴다고 하고, 「Requirements」는 두 서버가 하드웨어 가상화를 지원하고 **같은 제조사의 프로세서**(예: 모두 AMD나 모두 Intel)를 쓰며 같은 Active Directory 도메인이나 서로 트러스트하는 도메인에 속할 것, VM이 가상 하드 디스크(나 가상 Fibre Channel 디스크)만 쓸 것을 든다.
  「shared nothing」 문단: 공유 저장소 없이 로컬 저장소만 쓰는 VM도 옮길 수 있고, 이때 VM의 저장소를 네트워크로 대상 서버에 맞춰 둔 뒤 VM을 옮기며 그동안 VM은 계속 실행되어 네트워크 서비스를 낸다. 끝나면 원본 서버의 파일을 지운다(같은 문서 끝의 다섯 단계 — 위 저장소 마이그레이션의 차례와 같은 꼴로 디스크를 먼저 맞춘다).
  **지금 판에서 같은 차례를 적은 곳은 찾지 못했다.** 지금 판 「Set up hosts for live migration without Failover Clustering」(`updated_at` 2025-10-28) 「Step 2」의 성능 옵션 표는 TCP/IP·압축(기본)·SMB 세 옵션을 모두 **VM의 메모리를 대상 서버로 복사하는 방법**으로 적는다(압축은 메모리 내용을 압축한 뒤 TCP/IP로 복사) — 「메모리를 대상으로 복사한다」는 지금 판에서도 맞다. 인증 방식·성능 옵션을 고르는 법은 쓰지 않는다.
  **전원을 끄고 옮기기와의 차이**는 이 문서들이 한 문장으로 견주지 않는다 — VM을 끄면 그 안의 게스트 운영 체제와 프로그램이 실행되지 않는다는 데서, 그리고 VM이 파일로 이루어져 옮기고 복사할 수 있다는 위 「(phase 81 step 9)」 첫 항목과 `windows-hyperv.virtual-machines` 본문에서 이어서 나오는 말이다.
  `Move-VM`·`Move-VMStorage`의 예는 VM 이름(과 `Move-VM`은 대상 호스트 이름)을 매개 변수 이름 없이 앞에 적는다(위 줄의 `Move-VM LMTest TestServer02 …`, `Move-VMStorage "Test VM" -DestinationStoragePath D:TestVM`) — 본문의 `Move-VM VM01 HV02 -IncludeStorage -DestinationStoragePath D:VMs`와 `Move-VMStorage VM01 -DestinationStoragePath E:VMs`는 이 꼴에 예시 값을 넣은 것이다.
  쓰인 곳: `windows-hyperv.live-migration`(정의 문단의 게스트가 모른다는 말, 옮기는 차례 문단, 요구 한 줄, 전원을 끄고 옮기기와의 차이, 예시의 둘째·셋째 단계), `windows-hyperv.storage-migration`(두 명령의 꼴), 도식 `live-migration`의 「옮기는 중」·「옮긴 뒤」 캡션

쓰인 곳: (phase 81 step 12·13에서 쓰일 곳) `windows-hyperv.live-migration`(정의, 쓰는 때, Windows Server에만, 공유 없는 실시간 마이그레이션과 `Move-VM -IncludeStorage`, 이동 마법사, 요구 한 줄과 프로세서 제조사 계열), `windows-hyperv.storage-migration`(정의, 쓰는 때, 옮기는 파일과 `Move-VMStorage`, 같은 호스트에 남는다, Windows Server 2012부터와 옮기는 차례 — 지난 판),
`windows-hyperv.hyper-v-replica`(정의, 주 VM·복제본 VM·복제본 서버, 복제 빈도 30초·5분·15분과 기본 5분, 비동기와 차례, 계획된·계획되지 않은 장애 조치, 장애 조치 클러스터와의 차이), 기출 대조(`exam-notes.md` 「phase 81 step 9」 문단 — [기출 2024-08-25 #43]·[기출 2025-11-02 #29]·[기출 2026-02-01 #33])

## (phase 81 step 9) Microsoft Learn — Windows 컨테이너·격리 모드·기본 이미지: About Windows containers, Containers vs. virtual machines, Isolation modes, Prepare Windows operating system containers, Overview of Windows Container Base Images, Windows container version compatibility; 지난 판 Install Nano Server (Windows Server 2016)
https://learn.microsoft.com/en-us/virtualization/windowscontainers/about/
https://learn.microsoft.com/en-us/virtualization/windowscontainers/about/containers-vs-vm
https://learn.microsoft.com/en-us/virtualization/windowscontainers/manage-containers/hyperv-container
https://learn.microsoft.com/en-us/virtualization/windowscontainers/quick-start/set-up-environment
https://learn.microsoft.com/en-us/virtualization/windowscontainers/manage-containers/container-base-images
https://learn.microsoft.com/en-us/virtualization/windowscontainers/deploy-containers/version-compatibility
https://learn.microsoft.com/en-us/previous-versions/windows-server/it-pro/windows-server-2016/get-started/getting-started-with-nano-server

2026-11-18에 IPv4로 내려받아 읽은 판(「Applies to」는 모두 Windows Server 2025·2022·2019·2016): 「About Windows containers」 `updated_at` 2025-11-28(`ms.date` 2025-11-28), 「Containers vs. virtual machines」 2025-09-17(2025-01-22), 「Isolation modes」 2025-09-17(2025-01-23),
「Prepare Windows operating system containers」 2025-09-17(2025-03-19 — 본문이 Windows 11·10에도 적용된다고 적는다), 「Overview of Windows Container Base Images」 2025-11-28(2025-11-28), 「Windows container version compatibility」 2025-09-17(2025-01-23).
지난 판 「Install Nano Server」 2024-07-01(`ms.date` 2017-09-06, 「Applies to」 Windows Server 2016 — 옛 주소 `windows-server/get-started/getting-started-with-nano-server`가 이리로 넘어온다). 한국어판(`updated_at` 2026-10-21, 기계 번역)도 받았다.

- **컨테이너**(「About Windows containers」 첫머리와 「How containers work」): Windows·Linux 앱을 꾸러미로 묶어, 회사 안 서버에서든 클라우드에서든 똑같이 돌게 하는 기술이다. 앱마다 가볍고 남과 떨어진 실행 공간을 주므로 앱을 만들고 내놓고 돌보는 일이 쉬워진다. 켜고 끄는 데 오래 걸리지 않아(**빨리 시작하고 멈춘다**) 수요가 바뀔 때 바로 늘리고 줄이기 좋고, 가벼우니 같은 장비에 더 많이 올려 장비를 알차게 쓴다.
  컨테이너는 **호스트 운영 체제의 커널 위에서 돌며** 커널을 함께 쓰지만, 마음대로 닿지는 못하고 떨어진(경우에 따라 가상화된) 시스템 모습을 본다 — 예: 파일 시스템과 레지스트리의 가상화된 모습에 닿고, 바꾼 것은 그 컨테이너에만 미치며 **컨테이너가 멈추면 버려진다**(남기려면 파일 공유 같은 영구 저장소를 붙인다).
  커널이 주지 않는 API·서비스(사용자 모드의 시스템 파일·라이브러리)는 컨테이너가 자기 사본을 가져야 하고, 이 파일들을 묶은 것이 **기본 이미지**다. Windows 10 1607 이후나 Windows Server 2016 이후에서 돈다(「Containers for developers」)
- **커널**: 이 문서들은 커널을 「운영 체제의 땅속 배관」에 빗대는 데 그치고 정의하지 않는다 — 커널의 뜻은 phase 76의 Linux 항목(`linux-process-boot`)과 뜻을 맞춘다
- **컨테이너 이미지**(「Container images」): **모든 컨테이너는 컨테이너 이미지에서 만든다**. 컨테이너 이미지는 겹겹이 쌓인 층(layer)으로 짜인 파일 묶음이고, 로컬 컴퓨터나 원격 컨테이너 레지스트리에 있다. 앱이 도는 데 필요한 사용자 모드 운영 체제 파일과 앱의 런타임·의존 항목·구성 파일을 담는다.
  층으로 되어 있어 기본 이미지 대신 필요한 프레임워크를 이미 담은 다른 이미지(예: .NET 이미지)를 바탕으로 쓸 수 있다
- **컨테이너와 VM**(「Containers vs. virtual machines」 표, 「About…」 「Containers vs. virtual machines」): VM은 **커널을 포함한 운영 체제 전체**를 돌려 CPU·메모리·저장소를 더 쓰고, 컨테이너는 운영 체제의 **사용자 모드 부분만** 돌려(앱에 필요한 서비스만 담을 수 있다) 자원을 덜 쓴다.
  격리 — VM은 호스트와 다른 VM에서 완전히 떨어져 강한 보안 경계가 필요할 때 맞고, 컨테이너는 보통 가볍게 떨어질 뿐 VM만큼 강한 경계는 아니다(Hyper-V 격리로 높일 수 있다). 게스트 호환 — VM 안에는 거의 어떤 운영 체제든 돌고, 컨테이너는 호스트와 같은 판의 운영 체제에서 돈다(Hyper-V 격리면 같은 운영 체제의 이전 판도).
  배포 — VM은 Windows Admin Center·Hyper-V 관리자(여럿이면 PowerShell·SCVMM), 컨테이너는 명령 줄의 Docker(여럿이면 오케스트레이터). 영구 저장소 — VM은 가상 하드 디스크(VHD), 컨테이너는 Azure 디스크·파일 공유. 부하 분산 — VM은 실행 중인 VM을 장애 조치 클러스터의 다른 서버로 옮기고, 컨테이너는 옮기지 않고 오케스트레이터가 노드에서 시작·중지한다.
  컨테이너를 VM 안에서 돌리는 배포도 많다(클라우드에서 특히). 「시작 시간」·「크기」를 VM과 숫자로 견준 문장은 없다 — 컨테이너가 빨리 시작하고 멈춘다(위 첫 줄)와 VM이 자원을 더 쓴다(이 줄)까지만 쓴다
- **두 격리 방식**(「Isolation modes」): Windows 컨테이너의 런타임 격리는 **프로세스 격리**와 **Hyper-V 격리** 둘이다. 두 방식의 컨테이너는 만들고 관리하고 동작하는 법이 같고 **같은 컨테이너 이미지**를 쓰며, 다른 것은 컨테이너·호스트 운영 체제·같은 호스트의 다른 컨테이너 사이를 얼마나 떼어 놓느냐다.
  **프로세스 격리**(process isolation)는 전통적인 방식이다 — 여러 컨테이너가 한 호스트에서 동시에 돌며 네임스페이스·자원 제어 같은 프로세스 격리 기술로 떨어지고, **컨테이너가 호스트와 서로와 같은 커널을 함께 쓴다**(Linux 컨테이너와 거의 같다). 컨테이너마다 떼어 놓는 네임스페이스는 파일 시스템, 레지스트리, 네트워크 포트, 프로세스·스레드 ID 공간, 개체 관리자 네임스페이스다.
  **Hyper-V 격리**(Hyper-V isolation)는 보안을 높이고 호스트와 컨테이너의 판 호환을 넓힌다 — 컨테이너마다 **고도로 최적화한 VM 안에서 돌며 사실상 자기 커널을 갖고**, VM이 있어 컨테이너끼리와 컨테이너 호스트 사이가 하드웨어 수준으로 떨어진다.
  **기본값**: Windows Server에서 도는 Windows 컨테이너는 **프로세스 격리**가 기본이고, Windows 10 Pro·Enterprise에서는 **Hyper-V 격리**가 기본이다(Windows 10 October 2018 업데이트부터는 `--isolation=process`로 프로세스 격리를 직접 청할 수 있다 — 개발·테스트용). Docker로는 `docker run … --isolation=hyperv`·`--isolation=process`로 고른다
- **판 호환**(「Windows container version compatibility」): Windows Server 2016과 Windows 10 기념일 업데이트(둘 다 14393)가 Windows Server 컨테이너를 만들고 실행한 첫 판이다. Windows Server 2022 컨테이너와 Windows 11 호스트를 빼면, **컨테이너 호스트와 컨테이너 이미지의 빌드 번호가 다르면 Windows Server 컨테이너는 시작되지 않는다**(예: 호스트 Windows Server 2016(10.0.14393)에서 1709(10.0.16299) 이미지 — 판 불일치 오류).
  판이 맞지 않을 때 **Hyper-V 격리**로 돌리면 맞는 커널 파일을 컨테이너에게 주어 호스트 판에 기대지 않는다. Windows Server 2016 기반 컨테이너는 수정 번호까지 같아야 한다
- **Windows Server의 「컨테이너」 기능과 컨테이너 런타임**(「Prepare Windows operating system containers」): 컨테이너를 쓰려면 알맞은 **컨테이너 런타임**을 먼저 갖춰야 한다. Windows에서 지금 지원하는 런타임은 **Moby, Mirantis Container Runtime(옛 Docker EE), containerd**이고, 문서의 설치 스크립트가 컨테이너에 필요한 운영 체제 기능을 켠 뒤 런타임을 설치한다. Windows 10·11 Pro·Enterprise에서는 Docker Desktop을 쓴다.
  Windows Server의 기능 이름 「컨테이너」(`Containers`)는 위 「(phase 81 step 0) … 서버 역할과 기능」 항목의 Server Core 표(기능 표, 기본 설치 「N」)에 있다. 런타임의 설치 차례는 쓰지 않는다
- **기본 이미지**(「Overview of Windows Container Base Images」, 「About…」 「Container images」): Microsoft가 내놓는, 자기 컨테이너 이미지를 만드는 출발점 이미지이고 **넷**이다 — 저마다 Windows나 Windows Server의 다른 종류이며 디스크 크기와 Windows API 범위가 다르다.
  - **Windows Server Core**(Server Core): 전통적인 .NET Framework 앱을 지원한다, 중간 크기, 기존 Windows Server 앱을 거의 그대로 옮겨 오기(lift and shift)에 좋다. 서버 역할 대부분을 담는다(팩스 서버처럼 빠진 것도 있다)
  - **Nano Server**: .NET Core 앱을 위해 만들었다, **가장 작은** 이미지로 새 앱 개발에 맞다. Server Core보다 API 범위가 좁아 **PowerShell·WMI·Windows 서비스 스택이 없다**(「Windows Server Core vs Nano Server」)
  - **Windows**: Windows API 전체, **가장 큰** 이미지(3.4 GB). Windows Server 2025용은 없다
  - **Windows Server**: Windows API 전체, Windows 이미지보다 조금 작다(3.1 GB), GPU 지원·IIS 연결 수 제한 없음, 최신판은 Windows Server 2025 호스트가 있어야 한다
  대부분의 사용자에게는 Server Core와 Nano Server가 알맞다. 고르는 지침 — 전체 .NET Framework가 필요하면 Server Core, .NET Core 앱이면 Nano Server, Server Core에 없는 의존 항목이 있으면 Windows, GPU 가속이 필요하면 Windows Server
- **받는 곳과 이름 꼴**(「Image discovery」): 기본 이미지는 **Microsoft Container Registry(MCR, `mcr.microsoft.com`)**에서 오고, 찾아보기는 Docker Hub에서 한다 — 예: `docker pull mcr.microsoft.com/windows/servercore:ltsc2025`. 문서가 보이는 꼴: `mcr.microsoft.com/windows/servercore:ltsc2019`(「Isolation modes」), `mcr.microsoft.com/windows/nanoserver:1809`(「version compatibility」 — 태그로 기본 이미지의 판을 정한다),
  인사이더 저장소 `mcr.microsoft.com/windows/nanoserver/insider`·`…/windows/server/insider`·`…/windows/insider`
- **Nano Server의 자리**: 지난 판 「Install Nano Server」(Windows Server 2016) — Windows Server 2016은 Nano Server를 **새 설치 옵션**으로 내놓았다(원격으로 관리하는 서버 운영 체제, Server Core와 비슷하지만 훨씬 작고 로컬 로그온이 없다). **Nano Server 설치 옵션의 지원은 2018년 10월 9일에 끝났고, Windows Server 1709부터 Nano Server는 컨테이너 기본 OS 이미지로만 나온다**(머리의 Important).
  지금 판 「Features Removed…」의 Windows Server 2019 탭도 Nano Server는 설치할 수 있는 호스트 운영 체제가 아니라 컨테이너 운영 체제로만 나온다고 적는다(위 「(phase 81 step 0)」 줄 — 이 step에서 같은 판 `updated_at` 2026-11-17을 다시 받아 확인했다)
- **한국어 이름**: 한국어판은 「Windows 컨테이너」, 「컨테이너 이미지」, 「기본 이미지」, 「격리 모드」·「프로세스 격리」·「Hyper-V 격리」, 「컨테이너 호스트」로 옮긴다. 기본 이미지의 이름은 「Windows Server Core」, 「Nano 서버」, 「윈도우즈」, 「Windows Server (윈도우 서버)」로 들쭉날쭉 옮긴다(기계 번역).
  **고른 이름**: 「컨테이너」·「컨테이너 이미지」·「기본 이미지」, 「프로세스 격리」·「Hyper-V 격리」, 「컨테이너 런타임」, 기본 이미지 이름은 영문 그대로 **Nano Server·Server Core·Windows·Windows Server**(제품·이미지 이름이고 MCR 저장소 이름과 맞춘다 — 기출도 「Nano Server」·「NanoServer」로 쓴다)
- (phase 81 step 13, 2026-11-19 Microsoft Learn에서 다시 읽어 확인 — 「Isolation modes」 같은 판) **격리 방식 예 — 호스트에서 보이는 프로세스**(「Isolation examples」 「Isolation explanation」): 같은 기본 이미지(`mcr.microsoft.com/windows/servercore:ltsc2019`)로 프로세스 격리 컨테이너 하나와 Hyper-V 격리 컨테이너 하나를 실행해 두 방식을 견준다 —
  프로세스 격리 컨테이너 안에서 실행한 프로그램은 컨테이너 안에서 본 프로세스 번호와 같은 번호로 **호스트에서도 같은 프로세스로 보인다**. Hyper-V 격리 컨테이너 안에서 실행한 같은 프로그램은 호스트에서 찾으면 **보이지 않고**, 그 컨테이너를 감싼 가상 컴퓨터를 실행하는 프로세스(`vmwp`)만 보인다.
  같은 절은 Docker로 Hyper-V 격리 컨테이너를 다루는 법이 프로세스 격리 컨테이너와 거의 같고, 실행할 때 `--isolation=hyperv`나 `--isolation=process`로 고른다고 적는다. 같은 문서 첫머리는 두 방식이 같은 컨테이너 이미지를 쓴다고 적는다(위 「두 격리 방식」 줄) — 이 예도 같은 이미지로 컨테이너 둘을 실행한다.
  두 방식 가운데 어느 쪽이 자원을 더 쓰는지나 시작 시간을 견준 문장은 이 문서와 「Containers vs. virtual machines」 어디에도 없다 — 본문·문항은 두 방식을 커널을 누구와 함께 쓰는가와 떨어진 정도로만 가른다.
  쓰인 곳: `windows-hyperv.windows-containers`(「프로세스 격리와 Hyper-V 격리」 문단의 호스트에서 보이는 프로세스, 같은 이미지로 컨테이너 여럿, `--isolation`), 문항 n310·n311의 해설
- (phase 81 step 14, 2026-11-19 Microsoft Learn에서 다시 읽어 확인 — 「Overview of Windows Container Base Images」·「Windows container version compatibility」, 「Applies to」 Windows Server 2025·2022·2019·2016) **기본 이미지를 고르는 말과 판 맞추기**:
  「Overview…」 — 기본 이미지는 저마다 다른 종류의 Windows나 Windows Server이고 디스크에서 차지하는 크기와 Windows API 범위가 다르다(위 「기본 이미지」 줄 그대로). Nano Server는 새 앱 개발을 위한 아주 가벼운 이미지, Server Core는 중간 크기로 기존 Windows Server 앱을 옮겨 오기(lift and shift)에 좋은 이미지, Windows는 가장 큰 이미지로 Windows API 전체, Windows Server는 Windows 이미지보다 조금 작고 Windows API 전체.
  고르는 지침 — 앱이 전체 .NET Framework를 필요로 하면 Server Core, .NET Core 기반이면 Nano Server, Server Core에 앱이 필요로 하는 의존 항목이 없으면 Windows, 컨테이너 작업에 GPU 가속이 필요하면 Windows Server. 「Windows Server Core vs Nano Server」 — Nano Server는 .NET Core나 그 밖의 새 오픈 소스 프레임워크에 기대는 앱을 실행할 만큼만 API를 담고, 그 대가로 크기가 다른 기본 이미지보다 작으며, **필요하면 Nano Server 위에 층을 더 얹을 수 있다**.
  이미지 크기의 수치(3.1 GB·3.4 GB)와 Windows Server 2025 관련 판 조건은 쓰지 않는다 — 판마다 바뀐다(step 14 금지사항). 이미지 크기는 「가장 작다·중간·가장 크다·Windows보다 조금 작다」라는 문서의 비교만 쓴다
  「version compatibility」 — Windows의 판은 major·minor·build·revision 넷으로 적고, **빌드 번호는 새 판의 Windows가 나올 때만 바뀐다**. WS2022 + Windows 11 조합을 빼면 컨테이너 호스트와 컨테이너 이미지의 빌드 번호가 다를 때 Windows Server 컨테이너는 시작되지 못한다(판 불일치 오류).
  같은 문서의 호환 표는 이것보다 넓게 적는다 — 예: Windows Server 2025 호스트는 Windows Server 2022 이미지를 프로세스 격리로도 실행하고, Windows Server 2022 호스트는 Windows Server 2019 이미지를 **Hyper-V 격리로만** 실행하며, Windows Server 2019 호스트는 더 새 Windows Server 2022 이미지를 어느 격리로도 실행하지 못한다.
  그래서 본문은 「몇몇 조합을 빼고는 막는다」로 쓰고, 오류를 푸는 길 셋 가운데 **「호스트가 더 새 판이면 `--isolation=hyperv`로 실행한다」**를 쓴다 — Hyper-V 격리는 컨테이너에 맞는 커널을 따로 주므로 호스트 판에 기대지 않는다. 위 「(phase 81 step 9)」 「판 호환」 줄의 「Hyper-V 격리면 호스트 판에 기대지 않는다」는 호스트가 이미지보다 새 판일 때의 말이다(표에서 옛 호스트가 새 이미지를 실행하는 칸은 모두 안 된다).
  **태그**: `FROM mcr.microsoft.com/windows/nanoserver:1809` — Windows Server 1809 판의 기본 이미지를 쓰려면 태그 `1809`를 적는다(태그로 어느 판인지 정한다). `FROM mcr.microsoft.com/windows/servercore:ltsc2019` — Server Core 이미지의 컨테이너 운영 체제를 Windows Server 2019로 하려면 LTSC 태그 `ltsc2019`를 적는다. 2019년 4월 16일부터 `latest` 태그를 내지 않아 태그를 꼭 적는다는 줄은 쓰지 않는다
- (phase 81 step 14, 2026-11-19 Microsoft Learn 검색으로 확인) **.NET Framework와 .NET Core의 한 줄 풀이**: 「Overview of .NET Framework」(https://learn.microsoft.com/en-us/dotnet/framework/get-started/overview) — .NET Framework는 Windows 앱과 웹 서비스를 만들고 실행하게 해 주는 기술이고, 새로 개발할 때는 .NET Framework 대신 .NET을 쓰라고 권한다.
  「Introduction to .NET」(https://learn.microsoft.com/en-us/dotnet/core/introduction) — .NET은 무료이고 여러 플랫폼에서 도는 오픈 소스 개발 플랫폼이다. 기본 이미지 문서는 Server Core를 「전통적인 .NET Framework 앱」에, Nano Server를 「.NET Core나 그 밖의 새 오픈 소스 프레임워크」에 짝짓는다.
  본문은 .NET Core를 「응용 프로그램을 만들고 실행하는 데 바탕이 되는 Microsoft의 기술 가운데 새로 나온 쪽」, .NET Framework를 「같은 일을 하는 기술 가운데 예전부터 Windows에서 써 온 쪽」으로만 푼다 — .NET Core와 .NET의 이름 관계, 판 번호는 쓰지 않는다
  쓰인 곳: `windows-hyperv.container-base-images`(항목 넷의 크기와 쓰임, Nano Server와 Server Core의 차이, 층을 더 얹을 수 있다, 판 맞추기와 Hyper-V 격리, MCR과 태그 `ltsc2019`·`1809`, 예), 문항 n312의 해설

쓰인 곳: (phase 81 step 13·14에서 쓰일 곳) `windows-hyperv.windows-containers`(정의, 커널을 함께 씀과 떨어진 모습, 이미지에서 만든다, VM과의 차이, 두 격리 방식과 기본값, 판 호환 한 줄, 「컨테이너」 기능과 런타임), `windows-hyperv.container-base-images`(넷의 이름·쓰임·크기 차이, Nano Server와 Server Core의 차이, MCR과 이름 꼴, 프로세스 격리의 판 일치, Nano Server의 지금 자리와 판),
기출 대조(`exam-notes.md` 「phase 81 step 9」 문단 — [기출 2024-02-25 #44]·[기출 2025-05-25 #38]·[기출 2026-05-17 #29])

## (phase 82 step 0) IEEE 802.11 — 작업 그룹 홈페이지·소개 페이지와 표준 개요 페이지: 802.11-1997, 802.11-1999, 802.11-2024
https://www.ieee802.org/11/
https://www.ieee802.org/11/abt80211.html
https://standards.ieee.org/ieee/802.11/1163/
https://standards.ieee.org/ieee/802.11/1164/
https://standards.ieee.org/ieee/802.11/10548/

판: IEEE 802.11-1997(표준 위원회 승인 1997-06-26, 발행 1997-11-18, Superseded — 802.11-1999가 대체), IEEE 802.11-1999(승인 1999-03-18, Superseded — 802.11-2007이 대체),
**IEEE 802.11-2024(승인 2024-09-26, 발행 2025-04-28, Active — 지금 판)**. 작업 그룹 홈페이지와 소개 페이지는 2026-11-19에 받은 판이다(홈페이지의 개정 연표 머리는 2026-10-27).

- 802.11 작업 그룹은 IEEE 802 LAN/MAN 표준 위원회(LMSC) 안에서 무선 LAN 표준을 맡는다. 맡은 일은 IEEE 802 표준 묶음의 11부이고, 그 정식 제목은 「무선 LAN의 매체 접근 제어(MAC)와 물리 계층(PHY) 규격」이다 — 소개 페이지 「Introduction」
- 802.11은 **기본 표준 하나와 개정(amendment) 여럿**으로 이루어진다. 새 기능은 개정 프로젝트가 더하고, 기본 표준은 개정판(revision) 프로젝트가 고치면서 그때까지 나온 개정을 합쳐 넣는다. 개정은 802.11 뒤에 글자를 붙인 이름으로 부르고(예: 802.11ax-2021, 진행 중인 P802.11bn), 그 개정을 맡은 작업반은 TG를 붙여 부른다(TGbn) — 소개 페이지 「Introduction」·「The standards development process」
- 802.11-1997(처음 판): 무선 LAN의 MAC과 물리 계층을 정한다. MAC 하나가 여러 물리 계층을 받치도록 짜서, 쓸 수 있는 주파수 사정에 따라 물리 계층을 고를 수 있게 했다. **물리 계층은 셋** — 2400~2500 MHz 대역의 전파 방식 둘(하나는 주파수 도약 대역 확산, 하나는 직접 시퀀스 대역 확산)과
  기저대역 적외선 방식 하나다 — 802.11-1997 개요 페이지 초록. 레이저 방식이나 협대역 방식은 이 셋에 없다(기출 [기출 2024-02-25 #49]의 오답 둘)
- 802.11-2024: 802.11-2020 뒤 2021~2024년에 나온 개정 1~7을 합쳐 넣은 개정판이다. 이 판에 대한 개정으로 802.11be-2024·802.11bh-2024·802.11bk-2025가 나왔고 P802.11bn 등이 진행 중이다 — 802.11-2024 개요 페이지 초록과 「Amendments」.
  그래서 802.11ax-2021 같은 개정의 개요 페이지에 「Superseded」라고 적힌 것은 그 기능이 없어졌다는 뜻이 아니라 개정판에 합쳐졌다는 뜻이다(phase 72의 802.3 개정과 같은 꼴)
- 「Wi-Fi」라는 이름: 작업 그룹 홈페이지는 802.11be-2024를 「업계에서 Wi-Fi 7로 알려진」 표준이라고 적는다(작업 그룹 회원들이 쓴 해설서를 소개하는 줄). 홈페이지·소개 페이지·개요 페이지 어디에서도 Wi-Fi 4·5·6 같은 다른 세대 이름은 찾지 못했다 — 홈페이지.
  802.11을 「Wi-Fi」라고 함께 부르는 근거는 아래 「RFC 4118·5416·8325·9119」 항목에 있다
- **한국어 이름**: wireless LAN(WLAN) → **무선 LAN**(앞 phase가 쓴 `LAN` 표기를 따른다), medium access control → 매체 접근 제어(phase 72의 이름), physical layer → 물리 계층(앞 phase의 이름), amendment → **개정**, revision → **개정판**(phase 72가 802.3에 쓴 이름)

쓰인 곳: (phase 82 step 1에서 쓰일 곳) `wireless-lan.wireless-lan`(802.11이 무엇을 정하는가, 802.11과 802.3이 같은 IEEE 802 위원회의 표준이라는 것, 「Wi-Fi」라는 이름), `wireless-lan.wlan-transmission`(처음 판의 물리 계층 셋, 레이저·협대역은 802.11의 방식이 아니다),
(phase 82 step 3에서 쓰일 곳) `wireless-lan.ieee-80211-standards`(기본 표준과 개정, 지금 판 802.11-2024, 「대체됨」의 뜻, 802.11be와 Wi-Fi 7), 기출 대조(`exam-notes.md` 「phase 82 step 0」 문단·E41)

## (phase 82 step 0) IEEE 802.11 — 1996-03 IEEE 802 플레너리 튜토리얼: General Introduction(96/49A Rev. 1), Architecture(96/49B), MAC(96/49C), Frequency Hopping PHY(96/49D), Direct Sequence PHY(96/49E)
https://www.ieee802.org/11/Tutorial/index.html
https://www.ieee802.org/11/Tutorial/General.pdf
https://www.ieee802.org/11/Tutorial/archit.pdf
https://www.ieee802.org/11/Tutorial/MAC.pdf
https://www.ieee802.org/11/Tutorial/FH.pdf
https://www.ieee802.org/11/Tutorial/ds.pdf

판: 802.11 작업 그룹이 1996년 3월 IEEE 802 플레너리에서 한 튜토리얼 다섯이다(문서 번호 IEEE P802.11-96/49A~E). **승인 전 초안(나중의 802.11-1997)을 옮긴 발표 자료**라 슬라이드마다 「바뀔 수 있다」고 적혀 있다.
그래서 구조와 동작의 뼈대(구성 둘, CSMA/CA, ACK, RTS/CTS)는 아래 RFC 항목과 맞춰 본 것만 쓰고, 값(채널 표)은 「처음 판을 만들던 때의 초안 값」으로만 쓴다.

- 무선이 유선과 다른 점: 간섭과 잡음이 많고 품질이 장소와 시간에 따라 바뀐다. 다른 802.11 장치나 전자레인지 같은 장치와 주파수를 함께 쓴다. 모든 스테이션이 서로 들린다고 가정할 수 없다(「숨은 노드」 문제) — Architecture 「What is unique about wireless?」
- **구성 둘** — Architecture 「Architecture Overview」·「802.11 Configurations」
  - **독립(애드혹)**: 스테이션들이 AP 없이 서로 직접 통신하는 BSS(기본 서비스 세트) 하나다. 닿는 범위가 좁다
  - **인프라스트럭처**: AP들과 스테이션들로 이루어진다. 분배 시스템이 AP들을 거쳐 여러 셀(BSS)을 한 네트워크로 이어 무선이 닿는 범위를 넓힌다
- 분배 시스템은 BSS 여럿을 이어 ESS(확장 서비스 세트)를 만들고, 움직이는 스테이션이 유선 쪽 자원에 닿게 한다. 분배 시스템이 무엇으로 되어 있는지는 802.11이 정하지 않는다(브리지로 이은 IEEE LAN일 수도, 무선일 수도 있다) — 「Distribution System」, 「802.11 Defines the Airwaves IF」
- 스테이션은 AP 하나를 골라 그 AP와 연결(associate)한다. AP는 비컨으로 시간을 맞추고 절전을 돕는다. 트래픽은 대개 AP를 거치지만 스테이션끼리 직접 주고받을 수도 있다 — 「Access Points」
- 802.11이 정하는 것은 스테이션 사이(스테이션과 AP 사이 포함)의 **무선 구간** — 물리 계층과 MAC — 이다 — 「802.11 Defines the Airwaves IF」
- 물리 계층 셋(초안): 주파수 도약 대역 확산(2.4 GHz, 1·2 Mbit/s), 직접 시퀀스 대역 확산(2.4 GHz, 1·2 Mbit/s), 확산 적외선(1·2 Mbit/s) — Architecture 「Three PHYs」.
  General은 2.4 GHz 대역을 세계 여러 나라에서 쓸 수 있는 대역으로, 802.11이 그 대역에서 1·2 Mbit/s를 위한 상호 운용 표준을 만든다고 적는다 — General 「Global View」
- **적외선**(확산 적외선): 파장 850~950 nm의 빛을 쓴다. 송신기와 수신기가 서로를 겨누지 않아도 되고 가시선이 트여 있지 않아도 되지만, 거리는 10 m 안팎이고 건물 안에서만 쓴다 — General 「Infrared PHY」
- **주파수 도약**: 대역 확산의 한 갈래로, 같은 곳에서 네트워크 여럿이 함께 동작하게 해 준다. 802.11의 주파수 도약 물리 계층은 1 MHz 간격으로 서로 겹치지 않는 채널 79개(북미·유럽, 일본은 23개)를 의사 난수 순서로 옮겨 다닌다 — FH 「Why Frequency Hopping?」·「802.11 FH PHY vs. Regulations」
- **직접 시퀀스**: 보낼 기호 하나를 부호열(11칩 바커 부호)로 퍼뜨려 더 넓은 대역에 싣는다. 그만큼 주파수당 전력이 낮아지고, 간섭과 잡음에 강해진다 — DS 「What is DSSS?」·「DSSS benefits」·「IEEE 802.11 DSSS PHY characteristics」
- 직접 시퀀스의 **채널 표(초안)**: 채널마다 번호와 중심 주파수가 있고, 번호가 하나 늘 때마다 중심 주파수가 5 MHz 올라간다(미국 FCC 칸: 1번 2412 MHz부터 11번 2462 MHz까지). 유럽·일본 칸은 쓸 수 있는 번호가 지역마다 다르게 적혀 있다 — DS 「DSSS Channels」(Table 1).
  **초안 표라 지역별 칸은 최종 표준과 다를 수 있다** — 본문은 「채널을 번호로 부르고, 번호마다 중심 주파수가 있으며, 이웃 번호의 중심 주파수는 5 MHz 떨어져 있다」까지만 쓴다. 채널 하나가 차지하는 폭은 이 튜토리얼에 수치로 없다(아래 「개정 규격」 항목의 22 MHz 줄)
- 물리 계층은 채널 상태 확인(CCA, clear channel assessment) 신호로 매체가 쓰이고 있는지 MAC에 알린다 — 이것이 캐리어 감지다. 물리 계층 관리가 채널을 맞춘다(channel tuning) — Architecture 「802.11 Protocol Architecture」·「PHY Layer Services」
- 요구 사항: 같은 지역·같은 채널 공간에 네트워크 여럿이 겹쳐 있을 수 있어야 하고, 같은 채널을 쓰는 다른 장치에서 오는 간섭(동일 채널 간섭)에 견뎌야 한다 — Architecture·MAC 「Requirements」
- **기본 접근 방식 — CSMA/CA**: 분산 조정 기능(DCF)으로 CSMA/CA를 쓴다. 보내기 전에 매체가 쓰이는지 살피고(캐리어 감지), 쓰이고 있으면 미룬다. 미뤘던 스테이션은 매체가 빈 뒤 무작위 백오프를 골라 기다려, 매체가 비기를 함께 기다리던 스테이션들이 한꺼번에 보내 부딪치지 않게 한다.
  백오프 시간은 매체가 비어 있을 때만 줄어들고, 다시 보낼 때마다 백오프 범위가 지수적으로 넓어진다 — MAC 「Basic Access Protocol Features」·「CSMA/CA Explained」·「CSMA/CA + ACK protocol」.
  이 초안은 매체가 정해진 간격(DIFS)보다 오래 비어 있으면 곧바로 보낸다고 적는데, 지금 판을 풀이한 RFC 8325 §6.1.2는 DIFS 동안 비어 있어도 무작위 백오프만큼 더 기다린 뒤 보낸다고 적는다(아래 RFC 항목) — **본문의 차례는 RFC 8325를 따른다**
- **ACK**: 한 스테이션에게 보낸 프레임을 받은 쪽은 CRC가 맞으면 곧바로 ACK를 돌려준다. ACK가 오지 않으면 보낸 쪽은 무작위 백오프 뒤 그 프레임을 다시 보낸다(정해진 횟수까지). 브로드캐스트 프레임은 ACK 없이 CSMA/CA만 쓴다 — 「CSMA/CA + ACK protocol」·「Basic Access Protocol Features」
- **숨은 노드와 RTS/CTS**: 같은 AP에 보내려는 스테이션들이 서로의 신호를 듣지 못할 수 있다(둘 다 AP는 듣는다). 보내는 쪽이 RTS를 보내고 받는 쪽이 CTS로 답해 그 뒤의 데이터 전송을 위해 매체를 미리 잡는다.
  RTS·CTS에는 매체를 얼마 동안 쓸지가 들어 있고, 이것을 들은 다른 스테이션은 그 시간을 NAV에 적어 두고 그동안 보내지 않는다(가상 캐리어 감지). RTS/CTS는 선택해 쓰지만 구현은 해야 하며, 스테이션마다 RTS 임계값으로 쓸지를 정한다(짧은 프레임에 붙는 덧비용을 줄이려고) — 「"Hidden Node" Problem」·「"Hidden Node" Provisions」
- 네트워크 찾기(scanning): 스테이션은 비컨을 들어(수동) 또는 채널마다 프로브를 보내고 응답을 기다려(능동) 네트워크를 찾는다. 비컨이나 프로브 응답에 네트워크에 들어가는 데 필요한 정보가 있고, 스테이션은 고른 AP에 연결 요청을 보내 연결한다 — MAC 「Scanning」·「Active Scanning Example」
- **한국어 이름**: station → **스테이션**(영문 읽기, 줄여 STA), access point → **AP**(기출이 AP로 쓴다 — 처음 쓸 때 「액세스 포인트」를 함께 적는다), basic service set → 기본 서비스 세트(BSS), independent BSS·ad hoc → **애드혹 모드**(독립 BSS, IBSS — 기출·업계가 쓰는 이름),
  infrastructure → **인프라스트럭처 모드**, distribution system → 분배 시스템, extended service set → 확장 서비스 세트(ESS), association → 연결, frequency hopping spread spectrum → **주파수 도약 대역 확산**(FHSS), direct sequence spread spectrum → **직접 시퀀스 대역 확산**(DSSS),
  spread spectrum → **대역 확산**(기출은 「스프레드 스펙트럼」으로 적는다), infrared → 적외선, clear channel assessment → 채널 상태 확인(CCA), random backoff → **무작위 백오프**(phase 72가 CSMA/CD에 쓴 「백오프」), hidden node → **숨은 스테이션**(guide의 이름 — 튜토리얼은 「노드」, 둘 다 같은 것을 가리킨다)

쓰인 곳: (phase 82 step 1에서 쓰일 곳) `wireless-lan.wireless-lan`(스테이션·AP·BSS·두 구성·분배 시스템·ESS, 연결), `wireless-lan.wlan-transmission`(처음 판 물리 계층 셋, FHSS·DSSS·적외선의 동작과 대역·전송률),
(phase 82 step 2에서 쓰일 곳) `wireless-lan.wireless-channel`(채널 번호와 중심 주파수, 5 MHz 간격, 채널을 맞추는 일, 겹치는 네트워크와 동일 채널 간섭, 채널마다 찾기), `wireless-lan.csma-ca`(DCF·DIFS·무작위 백오프·ACK와 재전송·숨은 스테이션·RTS/CTS·NAV), 기출 대조(`exam-notes.md` 「phase 82 step 0」 문단·E41)

## (phase 82 step 0) IEEE 802.11 개정 규격 — 802.11a·b·g·n·ac·ad·ah·ax·be: 표준 개요 페이지, 개정 연표, PAR 사본, 작업반 보고, 작업 그룹 문서(1999~2000)
https://www.ieee802.org/11/Reports/802.11_Timelines.htm
https://standards.ieee.org/ieee/802.11a/1165/
https://standards.ieee.org/ieee/802.11b/1166/
https://standards.ieee.org/ieee/802.11n/3952/
https://standards.ieee.org/ieee/802.11ac/4473/
https://standards.ieee.org/ieee/802.11ad/4527/
https://standards.ieee.org/ieee/802.11ah/4960/
https://standards.ieee.org/ieee/802.11ax/7180/
https://standards.ieee.org/ieee/802.11be/7516/
https://standards.ieee.org/ieee/802.11/10548/ (802.11g-2003은 따로 된 개요 페이지를 찾지 못했다 — 이 페이지의 작업 그룹 표준 목록에 제목과 초록이 있다)
https://www.ieee802.org/11/PARs/index.html (사본: par80211aapp.html, par80211bapp.html, P802.11ac.pdf, P802.11ad.pdf, P802.11ah.pdf, P802.11ax.pdf, P802_11be_PAR_Detail.pdf, P802.11n_NesCom_PAR_Extension_Pre-Submittal_052707.pdf)
https://www.ieee802.org/11/Reports/tgg_update.htm, tgn_update.htm, tgac_update.htm, tgax_update.htm, tgbe_update.htm, hew_update.htm
https://www.ieee802.org/11/Documents/DocumentArchives/1999_docs/ (90727A-Intro of 80211a PHY to FCC.pdf — IEEE 802.11-99/072, 90257B-The-case-for-Removing-the-HR-DSSS-FH-Option.pdf — 문서 머리는 IEEE 802.11-98/025)
https://www.ieee802.org/11/Documents/DocumentArchives/2000_docs/ (00114r38S- HRbSG Draft PAR.doc — IEEE 802.11-00/114r3)

판: 개정 연표는 「OFFICIAL IEEE 802.11 WORKING GROUP PROJECT TIMELINES - 2026-10-27」판이다. 표준 개요 페이지·PAR 사본·작업반 보고는 2026-11-19에 받았다. 아래 표의 「승인」은 IEEE SA 표준 위원회의 승인일이다(개요 페이지 「Board Approval」, 802.11g만 TGg 보고).
**PAR(프로젝트 승인 요청서)는 표준을 만들기 전에 정한 목표**이고 작업반 보고는 진행 기록이며, 1999~2000년 문서는 회원이 낸 발표·초안이다 — 어느 것도 표준 본문이 아니다. 그래서 전송률 칸은 문서가 적은 말(「목표」·「~까지」)을 그대로 옮기고 지금 판 본문의 최대 전송률로 바꿔 적지 않는다.

| 개정 | 이름(개정 연표·개요 페이지) | 대역 | 전송률 — 문서가 적은 값 | 방식 — 문서가 적은 것 | 승인 | 상태 |
|---|---|---|---|---|---|---|
| 802.11-1997(처음 판) | — | 2400~2500 MHz(전파 둘), 적외선 | 1·2 Mbit/s(1996 튜토리얼) | 주파수 도약·직접 시퀀스 대역 확산, 적외선 | 1997-06-26 | 대체됨 |
| 802.11a-1999 | 5 GHz 대역의 고속 물리 계층 | 5 GHz | **6~54 Mbit/s**(6·12·24 Mbit/s는 반드시 지원) — 99/072 | **OFDM**, 채널 간격 20 MHz — 99/072 | 1999-09-16 | 대체됨 |
| 802.11b-1999 | 2.4 GHz 대역의 더 빠른 물리 계층 확장 | 2.4 GHz | **1·2·5.5·11 Mbit/s** — 00/114r3, RFC 8325 §6.1.1 | 고속 직접 시퀀스(HR/DSSS) — 99/025 | 1999-09-16 | 대체됨 |
| 802.11g-2003 | 2.4 GHz 대역의 한층 더 높은 데이터 전송률 확장 | 2.4 GHz | **54 Mbps까지** — TGg 보고 2001-11 | CCK·**OFDM**·PBCC를 바탕으로 한 초안 — TGg 보고 | 2003-06-12 | 대체됨 |
| 802.11n-2009 | 높은 처리율(High Throughput) | 찾지 못했다 | MAC에서 잰 최대 처리율 100 Mb/s 이상(목표) — 개요 초록·PAR, 처리율 600 Mbps까지(2006-01에 고른 합동 제안) — TGn 보고 | **MIMO** — 802.11ac PAR §5.3, 20 MHz·40 MHz 모드 — TGn 보고 | 2009-09-11 | 대체됨 |
| 802.11ac-2013 | 6 GHz 아래의 매우 높은 처리율(VHT) | **6 GHz 아래, 2.4 GHz 제외 — 5 GHz 대역** — PAR §5.2 | 여러 스테이션 합 1 Gbps 이상·링크 하나 500 Mbps 이상(목표) — PAR §5.2 | **MU-MIMO**(하향), 40·80·160 MHz 전송 — TGac 보고 | 2013-12-11 | 대체됨 |
| 802.11ad-2012 | 60 GHz 대역의 매우 높은 처리율 | **60 GHz**(대개 57~66 GHz) — PAR §5.2 | 최대 처리율 1 Gbps 이상(목표) — PAR §5.2 | — | 2012-10-19 | 대체됨 |
| 802.11ah-2016 | 1 GHz 아래(면허 없이 쓰는 대역) | **1 GHz 아래**(TV 화이트 스페이스 대역 제외) — 개요 초록 | 100 kb/s 이상, 닿는 거리 1 km까지 — 개요 초록 | OFDM — PAR §5.2 | 2016-12-07 | 대체됨 |
| 802.11ax-2021 | 고효율 WLAN(High Efficiency) | **1~7.125 GHz** — 개요 초록 | 붐비는 곳에서 스테이션당 평균 처리율 4배 이상(목표) — PAR §5.2.b | **OFDMA, 하향·상향 MU-MIMO** — TGax 보고의 문서 제목(아래 줄) | 2021-02-09 | 대체됨(802.11-2024에 합쳐짐) |
| 802.11be-2024 | 극도로 높은 처리율(Extremely High Throughput) | **1~7.250 GHz**, 2.4·5·6 GHz의 옛 장치와 함께 동작 — 개요 초록 | 최대 처리율 30 Gbit/s 이상 — 개요 초록·TGbe 보고 | — | 2024-09-26(발행 2025-07-22) | **현행**(Active) |

- 「처리율」과 「전송률」을 섞지 않는다: 802.11n·ac·ad·be의 값은 **MAC의 데이터 서비스 접근점에서 잰 처리율의 목표**다(개요 초록·PAR이 그렇게 적는다). 802.11a·b·g의 값은 물리 계층의 데이터 전송률이다.
  지금 판 본문이 정한 개정마다의 최대 데이터 전송률(예: 802.11n·ac·ax의 최댓값)은 **찾지 못했다** — 본문은 「~ 이상을 목표로 만들었다」로만 쓰고 최댓값을 지어내지 않는다
- **802.11a**(99/072, 1999-03 TGa 의장의 발표): 1997년 7월 2.4 GHz 대역의 무선 LAN 표준(MAC 하나, 물리 계층 셋 — FHSS·DSSS·적외선)을 마쳤고, 그 뒤 5 GHz 고속 물리 계층을 만든다. **OFDM**으로 보내고 데이터 전송률은 6~54 Mbit/s 가운데 여럿이다. 채널 간격은 20 MHz다.
  OFDM 신호는 0이 아닌 부반송파 52개(데이터 48개, 파일럿 4개)로 이루어지고 부반송파 간격은 312.5 kHz다. 부반송파마다 BPSK·QPSK·16QAM·64QAM 가운데 하나로 데이터를 싣는다. 부반송파 가운데 일부가 약해질 수 있어 오류 정정 부호를 꼭 쓴다 — 「What is 802.11?」·「Main Parameters」·「Data and Pilot subcarriers」·「Error Correction Coding」·「Supported Rates and Modulations」
- **802.11a의 PAR**(1997-09-16 승인): 처음 목표는 약 20 Mbit/s의 고속 물리 계층이었다 — 「Scope」. 최종 표준의 54 Mbit/s는 위 99/072의 값이다
- **802.11b**: PAR(1997-12-09 승인)의 목적은 2.4 GHz 대역의 802.11 네트워크가 낼 수 있는 데이터 전송률을 높이는 것이다 — par80211bapp 「Purpose」. 그 뒤를 이을 연구 그룹의 초안 PAR(00/114r3, 2000)은 802.11b가 이미 기본 전송률 1·2·5.5·11 Mbit/s를 정해 두었다고 적는다 — 「16. Additional Explanation Notes」.
  RFC 8325 §6.1.1도 802.11b를 1·2·5.5·11 Mbps를 지원하는 옛 구현으로 든다. 이 물리 계층의 이름은 고속 직접 시퀀스(HR/DSSS)다(99/025 — 이 문서는 고속 DSSS 전송이 폭 22 MHz의 채널을 차지한다고 적는다, 「What is it?」)
- **802.11g**: 이 개정을 낳은 연구 그룹의 초안 PAR(00/114r3)은 802.11b의 물리 계층을 더 빠르게 넓히는 것을 범위로 잡고, 목표 최대 데이터 전송률을 적어도 20 Mbit/s로, 그리고 **802.11b 물리 계층 표준의 필수 부분을 모두 갖춰야 한다**고 적는다(「Scope of the Project」 — 승인된 PAR은 읽지 못했다). TGg 보고(2001-11)는 첫 초안이 2.4 GHz 대역에서 54 Mbps까지를 내고 CCK·OFDM·PBCC 기술을 바탕으로 한다고 적고,
  2002년 보고는 OFDM 프레임을 보호하는 장치(protection mechanisms)를 남은 쟁점으로 든다. 표준 위원회 승인은 2003-06-12다 — TGg 보고 「June 2003」·「November 2001 Session」. 개요 목록의 초록은 802.11 1999년판(802.11a·b 등으로 고친 것)에 2.4 GHz 대역의 「한층 더 높은」 데이터 전송률 확장을 더한다고 적는다
- **802.11n의 MIMO**: 802.11ac의 PAR은 802.11n보다 높은 처리율을 내려면 802.11n의 MIMO(다중 입력 다중 출력) 기능이 필요할 것이라고 적는다 — P802.11ac §5.3. TGn 보고는 20 MHz·40 MHz 두 모드의 공존 분석과, 「단일 스트림」으로 동작하는 방식을 기능 요구에 더한 일을 적는다 — TGn 보고
- **MU-MIMO**: TGac 보고(2010년 사양 틀 결정 목록)는 MU-MIMO를 따로 묶어 다루고, 하향 MU-MIMO의 전송 기회 나눠 쓰기(DL MU-MIMO TXOP Sharing), MU-MIMO에서 사용자마다의 피드백, MU-MIMO의 백오프 절차를 정했다고 적는다 — TGac 보고 「May·September·November 2010」.
  TGax 보고는 초안 절 「28.3.15 SU-MIMO와 DL MU-MIMO 빔포밍」, 「상향 MU-MIMO(UL MU-MIMO)를 위한 HE-LTF」 같은 문서 제목을 싣는다. **MU-MIMO를 정의한 문장은 허용한 출처에서 찾지 못했다** — 이름(multi-user)과 하향·상향이 어느 개정에 나오는지까지만 쓴다
- **OFDMA**: TGax 보고는 초안 절 「28.3.3 OFDMA와 SU 톤 할당」, 「상향 OFDMA 기반 임의 접근(UORA)」 같은 문서 제목을 싣고, 고효율 WLAN 연구 그룹 보고는 「HEW에서의 OFDMA 논의」를 싣는다 — 802.11ax에 OFDMA가 들어 있다는 것까지는 이것으로 확인된다.
  **OFDMA가 무엇인지 정의한 문장은 허용한 출처에서 찾지 못했다**(802.11ax 본문은 열지 못했다). 802.16 작업 그룹의 2011년 튜토리얼(IEEE 802.16-11/0005, `ieee802.org/802_tutorials/2011-03/`)도 OFDMA를 하향·상향 다중 접속 방식으로 든 표뿐이다
- **802.11ax의 목표**: 많은 AP와 스테이션이 좁은 곳에 몰린 환경에서는 이웃 장치의 간섭이 성능을 떨어뜨리므로, 이전 개정처럼 합계 처리율이 아니라 스테이션당 평균 처리율 같은 사용자 경험 지표를 높이고 전력 효율도 지키거나 높인다 — P802.11ax §5.2.b·§5.5
- **802.11be**: 최대 처리율 30 Gbit/s 이상을 내는 동작 방식과 최악의 지연·지터를 줄이는 동작 방식을 적어도 하나씩 정한다. 1~7.250 GHz에서 동작하고 2.4·5·6 GHz의 옛 802.11 장치와 함께 동작한다 — 개요 초록, TGbe 보고 「Background」(2019-03에 작업반을 만들었다). 업계 이름은 Wi-Fi 7(위 「작업 그룹 홈페이지」 항목)
- **802.11ac와 802.11ad**: 둘 다 「매우 높은 처리율(VHT)」 연구 그룹에서 나왔지만(작업 그룹 홈페이지 「VHT SG ⇨ TGac & TGad」) 대역이 다르다 — ac는 6 GHz 아래(2.4 GHz를 뺀 5 GHz 대역), ad는 60 GHz 대역이다. 「802.11n을 바탕으로 60 GHz 밀리미터파에서 동작하는 새 물리 계층」은 ad 쪽 말이다 — [기출 2024-05-19 #27]
- **802.11a와 802.11b**: 같은 날(1999-09-16) 승인됐다. a는 5 GHz·OFDM, b는 2.4 GHz·고속 DSSS다. 이름의 알파벳은 속도 순서를 말하지 않는다(발행은 a 1999-12-30, b 2000-01-20 — 개요 페이지)
- 이 step이 쓰지 않는 개정: 802.11s(메시 — step 4의 몫), 802.11e·i·h 같은 기출이 묻지 않는 것
- **한국어 이름**: OFDM → **직교 주파수 분할 다중화**(orthogonal frequency division multiplexing — RFC 5416 §6.10이 풀어 적는다), subcarrier → **부반송파**, OFDMA → 직교 주파수 분할 다중 접속(orthogonal frequency division multiple access — 이름만),
  MIMO → **MIMO**(다중 입력 다중 출력 — 기출이 영문 약어로 쓴다), MU-MIMO → **MU-MIMO**(다중 사용자 MIMO), downlink·uplink → **하향·상향**(AP에서 스테이션 쪽·스테이션에서 AP 쪽), throughput → **처리율**(phase 70의 이름), data rate → 데이터 전송률,
  High Throughput → 높은 처리율, Very High Throughput → 매우 높은 처리율, High Efficiency → 고효율, Extremely High Throughput → 극도로 높은 처리율(이름을 풀어 적을 때만), PAR → 프로젝트 승인 요청서
- (phase 82 step 3, 2026-11-19 `ieee802.org/11/PARs/`의 PDF 사본 P802.11ac.pdf·P802.11ad.pdf·P802.11ax.pdf를 IPv4로 다시 받아 확인) **802.11n·ac·ax의 대역과 802.11ac의 동시 통신**:
  - P802.11ad §5.3·§8.1: 이 개정은 60 GHz 대역과 2.4·5 GHz 대역 사이의 빠른 세션 전환(fast session transfer)을 정하고, 그 일 때문에 802.11n의 완성에 기댄다고 적는다 — 곧 그 2.4·5 GHz 쪽 물리 계층이 802.11n이다.
    P802.11ax §8.1(5.2.b 설명)도 성능을 견줄 이전 개정으로 「2.4 GHz의 802.11n, 5 GHz의 802.11ac」를 든다. 그래서 본문은 802.11n이 2.4GHz와 5GHz 대역을 쓴다고 적는다(위 표의 「찾지 못했다」를 이 두 줄로 채운다 — 802.11n 개요 페이지에는 대역이 없다)
  - P802.11ax §8.1(5.2.b 설명): 이 개정의 중심은 **2.4 GHz 대역과 5 GHz 대역**에서의 실내·실외 동작이고, 1~7.125 GHz 사이의 다른 대역은 쓸 수 있게 되는 대로 더할 수 있다. PAR 수정 기록은 새 대역 때문에 상한을 6 GHz에서 7.125 GHz로 바꿨다고 적는다(그 새 대역의 이름은 적지 않아 쓰지 않는다)
  - P802.11ac §5.2·§8.1: 2.4 GHz를 뺀 6 GHz 아래에서 동작하면서 5 GHz 대역의 옛 802.11 장치와 함께 동작해야 한다. 이 개정은 **여러 통신을 동시에 다루는 능력**을 넣을 수 있고, 여러 스테이션 합 1 Gbps는 AP 하나와 스테이션 셋 이상이 함께 통신할 때를 두고 한 말이다.
    §5.3: 802.11n보다 높은 처리율을 내려면 802.11n의 MIMO 기능이 필요할 것이다(위 줄과 같다)
  - 쓰지 않는 것: 802.11n의 최대 전송률(합동 제안의 600 Mbps는 표준 본문의 값이 아니다), 채널 폭을 묶는 방법, 802.11ad의 빠른 세션 전환 절차
  쓰인 곳: `wireless-lan.ieee-80211-standards`(802.11n은 2.4GHz·5GHz, 802.11ax는 2.4GHz·5GHz를 중심으로 1~7.125GHz, 802.11ac는 2.4GHz를 뺀 5GHz), `wireless-lan.mimo`(802.11ac의 MU-MIMO가 여러 스테이션과 동시에 통신하는 데 쓰인다)
- (phase 82 step 4, 2026-11-19 802.11ah 개요 페이지 https://standards.ieee.org/ieee/802.11ah/4960/ 와 작업 그룹 홈페이지 https://www.ieee802.org/11/ , TGah 보고 https://www.ieee802.org/11/Reports/tgah_update.htm 를 IPv4로 다시 받아 확인) **802.11ah와 「Wi-Fi HaLow」**:
  - 802.11ah-2016(개정 2, 「1 GHz 아래 면허 없이 쓰는 동작」, 표준 위원회 승인은 위 표, 상태 대체됨): 802.11의 물리 계층과 MAC을 고쳐 TV 화이트 스페이스 대역을 뺀 1 GHz 아래 대역에서 면허 없이 802.11 무선 네트워크를 쓰게 하고, 닿는 거리 1 km까지·최소 데이터 전송률 100 kb/s 이상을 정한다 — 개요 초록(위 표의 줄과 같다)
  - **「Wi-Fi HaLow」라는 이름은 세 페이지 어디에도 없다.** 누가 붙인 이름인지도 허용한 출처에서 확인하지 못했다(Wi-Fi Alliance의 페이지는 허용한 출처가 아니라 읽지 않았다) — 본문은 「802.11ah」로만 쓰고 「Wi-Fi HaLow」라는 이름을 쓰지 않는다([기출 2026-02-01 #9]의 오답 보기 이름)
  쓰인 곳: (phase 82 step 5에서 쓰일 곳) `wireless-lan.zigbee`(오답 보기 802.11ah를 앞 개념 `ieee-80211-standards`의 한 줄과 같은 뜻으로 가른다), 기출 대조(`exam-notes.md` 「phase 82 step 4」 문단)

쓰인 곳: (phase 82 step 1에서 쓰일 곳) `wireless-lan.wlan-transmission`(802.11b는 DSSS를 넓힌 고속 DSSS, 802.11a·g는 OFDM, OFDM의 부반송파), (phase 82 step 2에서 쓰일 곳) `wireless-lan.wireless-channel`(고속 DSSS 전송이 22 MHz 채널을 차지한다, 802.11a의 채널 간격 20 MHz),
(phase 82 step 3에서 쓰일 곳) `wireless-lan.mimo`(802.11n의 MIMO, MU-MIMO 하향 802.11ac·상향 802.11ax, OFDM과의 차이), `wireless-lan.ieee-80211-standards`(위 표, 802.11ah·be 한 줄씩, ac와 ad, a와 b), 기출 대조(`exam-notes.md` 「phase 82 step 0」 문단)

## (phase 82 step 0) RFC 4118, RFC 5416, RFC 8325, RFC 9119 — 802.11의 용어와 동작을 풀이한 RFC
https://www.rfc-editor.org/rfc/rfc4118
https://www.rfc-editor.org/rfc/rfc5416
https://www.rfc-editor.org/rfc/rfc8325
https://www.rfc-editor.org/rfc/rfc9119
https://www.rfc-editor.org/rfc/rfc9956

판(rfc-editor.org 텍스트판과 `…/rfcNNNN.json`, 2026-11-19): RFC 4118(2005-06, Informational, 폐기·개정 없음), RFC 5416(2009-03, Proposed Standard, 폐기·개정 없음 — IEEE 802.11-2007을 참조한다),
RFC 8325(2018-02, Proposed Standard, RFC 8622·RFC 9956이 개정 — 두 개정은 DSCP와 802.11 우선순위의 대응만 고치고 아래 줄이 쓰는 §1.6 용어와 §6.1은 건드리지 않는다, IEEE 802.11-2016을 참조한다), RFC 9119(2021-10, Informational, 폐기·개정 없음), RFC 9956(2026-05, Proposed Standard, 폐기·개정 없음 — RFC 4594·8325를 개정한다, 아래 한 줄만 쓴다).

- RFC 4118 §3.1(802.11의 정의를 옮겨 적은 절): **스테이션**(STA)은 무선 매체에 닿는 802.11 규격의 MAC과 물리 계층 인터페이스를 가진 장치다. **AP**는 스테이션 기능을 가지면서, 자기와 연결된 스테이션들이 무선 매체를 거쳐 분배 서비스에 닿게 해 주는 것이다.
  **BSS**는 조정 기능 하나가 다스리는 스테이션 묶음이다. **분배 시스템**은 BSS들과 유선 LAN을 이어 ESS를 만드는 시스템이고, **ESS**는 같은 SSID를 쓰는 BSS 하나 이상과 거기 이어진 LAN의 묶음으로, 그 안의 스테이션 위쪽 계층에게는 BSS 하나처럼 보인다 — §3.1
- RFC 4118 §1.1: 802.11은 무선 클라이언트 스테이션과 AP 사이, 그리고 무선 클라이언트끼리의 무선 구간 접속 규칙을 정하고, 장치가 BSS에 연결되는 방법을 적는다. BSS는 BSSID로 가린다. WLAN을 셀 구조로 볼 수 있다 — 셀 하나가 BSS이고 그 BSS를 AP가 다스린다.
  AP 둘 이상이 레이어 2 브로드캐스트 네트워크로 이어지고 모두 같은 SSID를 쓰면 ESS가 된다. AP가 맡는 일로 비컨 만들기, 프로브 응답, RTS/CTS/ACK 같은 제어 프레임 처리, 재전송, 전송률 맞추기를 든다 — §1.1
- RFC 4118 §1.2: 업체들이 흔히 더하는 관리 기능 가운데 RF 설정(재전송·**채널 선택**·송신 전력 조정)과 AP 설정(SSID 등)을 든다. 이런 기능은 대개 802.11이 직접 정하지 않지만, AP의 **채널 할당**과 송신 전력 제어는 802.11 MIB에 들어 있다.
  802.11h 개정은 일부 규제 기관(주로 유럽)의 요구에 맞추려고 레이더 탐지·송신 전력 제어·**동적 채널 선택**을 정한다 — §1.2. 중앙 집중 구조의 한 예(원격 MAC 구조)에서는 컨트롤러가 채널 선택 기능을 준다 — §5.5
- RFC 5416 §6.1: **SSID**는 AP가 그 무선 LAN을 알릴 때 쓰는 서비스 세트 식별자다. ASCII 문자로 쓰고 32옥텟을 넘지 않는다. 비컨과 프로브 응답에 SSID를 넣지 않게(숨기게) 설정할 수도 있다 — §6.1 「Suppress SSID」·「SSID」
- RFC 5416 §6.5·§6.10: 컨트롤러는 AP의 「지금 쓰는 채널」 — 802.11b 무선은 DSSS 물리 계층의 동작 채널(MIB의 dot11CurrentChannel), 802.11a 무선은 OFDM 물리 계층의 동작 채널 — 을 정해 보낼 수 있고, AP는 받은 값을 따라야 한다. 그러니 AP의 채널은 관리하는 쪽이 정할 수 있다.
  802.11a 무선이 동작할 수 있는 5 GHz 구간(5.15~5.25 GHz, 5.25~5.35 GHz, 5.47~5.725 GHz, 5.725~5.825 GHz 등)도 적는다 — §6.5·§6.10
- RFC 5416 §6.9: 규제 영역(나라)마다 쓸 수 있는 채널의 첫 번호와 개수, 최대 송신 전력을 주고받는다 — 나라마다 쓸 수 있는 채널이 다르다 — §6.9
- RFC 5416 §6.2: AP의 안테나 정보에 안테나 개수(255개까지)와 안테나를 묶어 쓰는 방식(섹터·무지향·**MIMO**)이 있다 — §6.2. §6.25: 무선 종류 칸에 802.11a·b·g·n이 있다
- RFC 5416 §1: Wi-Fi Alliance가 아직 802.11에서 만들고 있던 표준에 대한 시장의 요구를 채우려고 임시 사양 둘(WPA, WMM)을 만들었다 — §1. 곧 Wi-Fi Alliance는 IEEE 802.11 작업 그룹이 아닌 업계 단체다(그 단체의 페이지는 허용한 출처가 아니라 읽지 않았다)
- RFC 8325 §1.6(용어): **CSMA/CA**는 캐리어 감지를 쓰되 채널이 비어 있다고 감지될 때만 보내 충돌을 피하려는 MAC 방식이다. **CSMA/CD**는 (초기 이더넷이 쓴) 보내는 동안 다른 스테이션의 전송을 감지해 충돌을 알아채고, 멈추고 잼 신호를 보낸 뒤 무작위 시간을 기다려 다시 보내는 방식이다.
  **DCF**는 BSS의 모든 스테이션에서 같은 조정 논리가 도는 조정 기능이다. **IFS**는 802.11에서 전송과 전송 사이의 조용한 시간이고, **DIFS**는 보내려는 스테이션이 매체가 비어 있다고 확인해야 하는 시간이다. **무작위 백오프**는 0부터 경쟁 윈도(CW)까지에서 고른 슬롯 시간의 정수배다.
  **BSS**는 흔히 말하면 무선 셀 하나이고, BSS에 속했다고 그 BSS의 다른 모든 구성원과 무선으로 통신할 수 있는 것은 아니다 — §1.6
- RFC 8325 §6.2: DCF는 스테이션이나 트래픽 종류에 따라 순서를 두지 않으므로, IEEE는 2005년에 DCF를 고쳐 우선순위를 두는 HCF를 더했고 2007년판에 합쳐 넣었다 — §6.2. RFC 9956 §7.3: 802.11e·n·ac·ax를 따르는 Wi-Fi 장비는 대개 전송 큐 넷이나 여덟과 EDCA 매개변수 네 벌(WMM 접근 범주 넷)을 두어 매체 접근에 우선순위를 둔다 — §7.3. 곧 802.11ax 장비도 DCF를 고친 경쟁 방식(EDCA)으로 매체에 접근한다
- RFC 8325 §6.1: 무선(Wi-Fi) 매체는 AP를 포함한 모든 스테이션이 같은 조건으로 다투는 공유 매체다. 유선 이더넷과 달리 **무선에서는 충돌을 직접 감지할 수 없다** — 전파가 공중으로 퍼져 나가고 부딪친 신호가 보낸 쪽으로 되돌아오지 않을 수 있기 때문이다. 그래서 IEEE는 CSMA/CD를 무선에 맞게 고쳐 CSMA/CA를 만들었고, 802.11의 처음 CSMA/CA가 DCF다 — §6.1
- RFC 8325 §6.1.2: 스테이션은 보내기 전에 매체를 살핀다. DIFS 동안 쭉 비어 있으면 보낼 수 있지만 그 뒤 **무작위 백오프만큼 더 기다린다** — 모두 고정된 시간만 기다리면 충돌이 잦을 것이기 때문이다. DIFS 동안 매체가 쓰이면 DIFS 동안 비어 있을 때까지 미룬다 — §6.1.2
- RFC 8325 §6.1.3: 무작위 백오프의 처음 범위는 0부터 CWmin까지다. 두 스테이션이 같은 값을 골라 충돌하면 다시 DIFS를 기다리고 새 값을 고르는데, 이때 범위(CW)가 대략 두 배로 커진다(CWmax까지) — §6.1.3. §6.1.1: 802.11b 같은 옛 구현은 1·2·5.5·11 Mbps를 지원한다
- RFC 9119 초록·§1: 802.11을 「802.11 (Wi-Fi)」로 함께 적고, 본문 내내 802.11 무선 LAN을 Wi-Fi라 부른다 — 초록, §1
- RFC 9119 §2·§3.1.1: ACK는 802.11의 2계층 확인 응답이다. 멀티캐스트 프레임에는 ACK가 없어 AP가 다시 보내야 하는지 알 수 없다 — 한 스테이션에게 보낸 프레임은 ACK를 받고 필요하면 다시 보낸다는 것(위 1996 튜토리얼 항목)과 짝을 이루는 말이다 — §2, §3.1.1
- RFC 9119 §3.1.2: 유선은 대개 정해진 속도로 보내지만 Wi-Fi의 전송률은 스테이션이 AP에 얼마나 가까운지에 따라 바뀐다. **MIMO 시스템의 공간 다중화**처럼 주파수를 더 알뜰히 쓰는 기법은 받는 쪽이 둘 이상인 전송(멀티캐스트)에는 쓸 수 없다 — §3.1.2. §3.1.3: 더 센 전력으로 보내면 다른 전파 사용자와 간섭하는 범위가 넓어진다 — §3.1.3
- **한국어 이름**: SSID → **SSID**(service set identifier, 서비스 세트 식별자 — 기출·업계가 약어로 쓴다), BSSID → BSSID, beacon → 비컨, probe → 프로브, contention window → 경쟁 윈도(CW), interframe space → **프레임 사이 간격**(phase 72가 802.3의 interFrameSpacing에 쓴 이름), slot time → 슬롯 시간,
  acknowledgement → **ACK**(확인 응답 — 처음 쓸 때 「잘 받았다는 확인 프레임」으로 푼다), spatial multiplexing → 공간 다중화, channel selection → 채널 선택, dynamic channel selection → 동적 채널 선택
- (phase 82 step 1, 2026-11-19 rfc-editor.org 텍스트판을 IPv4로 다시 받아 확인) **스테이션의 MAC 주소**: RFC 5416 §6.13 「IEEE 802.11 Station」 메시지 요소는 연결된 스테이션 하나를 알리며 「스테이션의 MAC 주소」 칸(6옥텟)을 담고,
  §6.23 「IEEE 802.11 WTP Radio Configuration」은 BSSID를 그 무선 장치의 기본 MAC 주소라고 적는다 — 곧 802.11 스테이션과 AP의 무선 장치도 이더넷 장치처럼 MAC 주소를 가진다.
  802.11 프레임의 주소 칸 구성은 이 RFC들이 적지 않아 쓰지 않는다(본문은 「무선 LAN의 장치도 저마다 MAC 주소를 가지고, 데이터를 프레임에 담아 주고받는다」까지 쓴다 — 프레임을 주고받는다는 것은 위 1996년 튜토리얼의 ACK·RTS/CTS 항목과 RFC 4118 §1.1).
  RFC 9542 §2.1은 48비트 MAC 주소를 이더넷 인터페이스 식별자로만 들고 802.11을 따로 말하지 않는다.
  쓰인 곳: `wireless-lan.wireless-lan`(무선 LAN의 장치도 저마다 MAC 주소를 가진다)
- (phase 82 step 3, 2026-11-19 rfc-editor.org 텍스트판 RFC 8325·9119를 IPv4로 다시 받아 확인) **공간 스트림과 MU-MIMO**:
  - RFC 9119 §3.1.2: 옛 장치와 함께 동작하는 일과 **여러 스트림을 함께 보내는 구현(multi-stream implementations)** 덕에 한 스테이션에게 보내는(유니캐스트) 최대 전송률이 지금은 몇 Gbps에 이른다.
    주파수를 더 알뜰히 쓰려고 쓰는 기법인 **MIMO 시스템의 공간 다중화**는 받는 쪽이 둘 이상인 전송에는 쓸 수 없다(위 줄과 같다) — §3.1.2
  - RFC 8325 §6.1.1: 802.11n·802.11ac 같은 새 구현의 데이터 전송률을 **공간 스트림(spatial stream) 하나마다** 적는다(「per spatial stream」 — 수치는 쓰지 않는다) — §6.1.1
  - 위 둘로 본문이 쓰는 것: MIMO 장비는 공간 다중화로 데이터를 흐름 여럿으로 나눠 같은 채널에서 함께 보내고, 그 흐름 하나하나를 공간 스트림이라 하며, 전송률은 스트림 하나마다 따지므로 스트림을 여럿 함께 보내면 한 스테이션이 받는 전송률이 높아진다.
    **공간 스트림을 정의한 문장 자체는 찾지 못했다** — 「여러 스트림 구현」(RFC 9119)·「공간 스트림마다의 전송률」(RFC 8325)·「MIMO의 공간 다중화가 주파수를 더 알뜰히 쓴다」(RFC 9119)를 합쳐 쓴 풀이다. 스트림과 안테나가 하나씩 짝을 이룬다고는 쓰지 않는다(문서가 말하지 않는다)
  - RFC 9119 §4.7(GCR): AP는 그룹의 일부 구성원에게 하나씩 보내는 블록 ACK 요청을 **하향 MU-MIMO**로 보내고, 그 답인 블록 ACK를 **상향 MU-MIMO**로 받는다. 상향 MU-MIMO는 IEEE 802.11ax-2021의 기능이다.
    여러 스테이션의 답을 동시에 받아 지연을 줄일 수도 있다 — §4.7. 곧 하향 MU-MIMO는 AP가 여러 스테이션에게 저마다의 프레임을 함께 보내는 데, 상향 MU-MIMO는 여러 스테이션이 보내는 것을 AP가 함께 받는 데 쓰인다(위 「개정 규격」 항목의 P802.11ac 「여러 통신을 동시에」와 맞는다)
  - 쓰지 않는 것: MU-MIMO가 신호를 어떻게 스테이션마다 나누는지(빔포밍·사용자마다의 피드백 — TGac·TGax 문서 제목에만 있다), 한 번에 함께 보낼 수 있는 스테이션·스트림의 수, 수신 쪽 안테나 수의 조건
  쓰인 곳: `wireless-lan.mimo`(공간 다중화·공간 스트림·스트림마다의 전송률, 받는 쪽이 둘 이상인 같은 프레임에는 공간 다중화를 쓸 수 없다, 하향·상향 MU-MIMO가 여러 스테이션과 함께 주고받는 데 쓰인다)
- (phase 82 step 4, 2026-11-19 rfc-editor.org 텍스트판 RFC 4118을 IPv4로 다시 받아 확인) **재연결(reassociation)**:
  - RFC 4118 §1.1: 802.11이 정하는 서비스 가운데 **재연결**은 스테이션과 AP 사이에 맺어 둔 연결을 다른 AP(또는 같은 AP)로 옮기는 서비스다. 연결 해제(disassociation)는 맺어 둔 연결을 없앤다 — §1.1.
    같은 절은 스테이션이 한 BSS에서 다른 BSS로 옮겨 갈(roam) 때 AP들에게 알리는 AP 사이 프로토콜(IAPP, 권고 관행 802.11F)을 802.11이 만들던 기술로 든다 — §1.1. 곧 무선 LAN에서 스테이션이 다른 AP의 셀로 옮겨 붙는 일은 재연결로 이루어진다
  - 쓰지 않는 것: 재연결 프레임의 형식과 차례, IAPP의 동작, 빠른 로밍(802.11r)
  쓰인 곳: (phase 82 step 6에서 쓰일 곳) `wireless-lan.handoff`(무선 LAN에서 스테이션이 다른 AP로 옮겨 붙는 것 — 재연결 한 줄)

쓰인 곳: (phase 82 step 1에서 쓰일 곳) `wireless-lan.wireless-lan`(스테이션·AP·BSS·ESS·분배 시스템의 뜻, SSID, 「Wi-Fi」라는 이름과 Wi-Fi Alliance), (phase 82 step 2에서 쓰일 곳) `wireless-lan.wireless-channel`(AP의 채널을 관리 쪽이 정한다, 채널 선택·동적 채널 선택, 나라마다 쓸 수 있는 채널, 간섭),
`wireless-lan.csma-ca`(CSMA/CA·CSMA/CD의 정의와 차이, 무선에서 충돌을 감지할 수 없는 까닭, DCF·DIFS·무작위 백오프·CW, ACK와 재전송, BSS의 모든 구성원이 서로 들리지 않을 수 있다, 802.11ax에서도 DCF를 고친 경쟁 방식), (phase 82 step 3에서 쓰일 곳) `wireless-lan.mimo`(안테나 여럿과 MIMO, 공간 다중화), 기출 대조(`exam-notes.md` 「phase 82 step 0」 문단)

## (phase 82 step 4) IEEE 802.15 — WPAN: 작업 그룹 페이지(홈·소개·TG1·TG3·TG4·802.15.1의 5대 기준)와 표준 개요 페이지(802.15.1-2002·2005, 802.15.3-2003·2016·2023, 802.15.4-2003·2006·2024, 802.15.5-2009)
https://www.ieee802.org/15/
https://www.ieee802.org/15/about.html
https://www.ieee802.org/15/pub/TG1.html
https://www.ieee802.org/15/pub/par/5C.html (페이지 바닥줄의 주소는 `ieee802.org/15/pub/TG1-5C.html` — 802.15 WPAN 연구 그룹이 1999-03-18에 낸 5대 기준 응답)
https://www.ieee802.org/15/pub/TG3.html
https://www.ieee802.org/15/pub/TG4.html
https://standards.ieee.org/ieee/802.15.1/1180/
https://standards.ieee.org/ieee/802.15.1/3513/
https://standards.ieee.org/ieee/802.15.3/1182/
https://standards.ieee.org/ieee/802.15.3/6211/
https://standards.ieee.org/ieee/802.15.3/10801/
https://standards.ieee.org/ieee/802.15.4/3388/
https://standards.ieee.org/ieee/802.15.4/3582/
https://standards.ieee.org/ieee/802.15.4/11041/
https://standards.ieee.org/ieee/802.15.5/3572/

판: IEEE 802.15.1-2002(승인 2002-04-15, 발행 2002-06-14, 대체됨 — 802.15.1-2005), IEEE 802.15.1-2005(승인 2005-02-14, 재확인 2010-09-30, **철회 2018-05-07 — Inactive-Withdrawn**),
IEEE 802.15.3-2003(승인 2003-06-12, 대체됨), IEEE 802.15.3-2016(승인 2016-05-15, 대체됨), **IEEE 802.15.3-2023(승인 2023-09-21, 발행 2024-02-22, Active — 지금 판)**,
IEEE 802.15.4-2003(승인 2003-05-12, 대체됨), IEEE 802.15.4-2006(승인 2006-06-08, 대체됨), **IEEE 802.15.4-2024(승인 2024-09-26, 발행 2024-12-12, Active — 지금 판)**, IEEE 802.15.5-2009(권고 관행, 승인 2009-03-19, 2020-03-05 비활성).
작업 그룹 홈페이지는 2026-10-25에 고친 판, TG1 페이지는 2004-02-09, TG3 페이지는 2009-06-09에 고친 판이다(페이지 머리와 바닥줄). TG 페이지들은 그 표준을 만들던 때의 기록이라 지금 판과 다를 수 있다 — 줄마다 어느 때의 말인지 적는다.

- 작업 그룹: 802.15는 처음에 **WPAN(무선 개인 영역 네트워크) 작업 그룹**이었고(TG1·TG3·TG4 페이지와 5대 기준의 머리), 지금은 이름을 Wireless Specialty Networks로 바꿔 사물 인터넷(IoT) 장치의 무선 네트워크·광 무선 통신 같은 표준을 맡는다.
  홈페이지는 작업 그룹 사이트가 새 주소(`ieee802-15.org`)로 옮겼다고 알린다 — 그 주소는 허용한 곳(`ieee802.org`)이 아니라 읽지 않았다 — 홈페이지·소개 페이지 「ABOUT」.
  이 이름의 줄임말 WSN은 [기출 2025-02-23 #26]·[기출 2026-05-17 #24]의 오답 보기 「Wireless sensor networks」와 다른 말이다(본문에 쓰지 않는다)
- **WPAN이 무엇을 노리는가** — 5대 기준(1999): 몸에 지니거나 손에 드는 컴퓨팅·통신 장치와 그 주변기기(컴퓨터·PDA·프린터·마이크·스피커·바코드 판독기·센서·디스플레이·호출기·휴대 전화 등)를 무선으로 잇는 것이다.
  802.11은 처리율·거리·로밍에 맞춰 만들지만 WPAN은 작은 크기에서 **낮은 비용과 낮은 전력 소비**에 맞춘다. WLAN과 달리 거리와 대역폭을 서로 맞바꿀 여지가 크고, 요구 성능이 낮아 WLAN보다 훨씬 싸게 만들 수 있다. 2.4 GHz 대역을 쓰므로 그 대역의 WLAN과 함께 동작하는 일(공존)을 핵심 조건으로 든다 —
  5대 기준 「1. BROAD MARKET POTENTIAL」·「3. DISTINCT IDENTITY」·「4. TECHNICAL FEASIBILITY」·「5. ECONOMIC FEASIBILITY」·「6. STRATEGY FOR WPAN COEXISTENCE IN THE 2.4GHz BAND」
- **WPAN이 몇 미터 안을 잇는지 수치는 이 항목의 어느 문서에도 없다** — 문서들은 「짧은 거리(short-range)」로만 적는다(802.15.1-2002 개요의 Bluetooth 설명, 802.15.4-2003 개요). 본문은 수치 없이 「짧은 거리」로 쓴다 — `exam-notes.md` **E42**
- **802.15.1**: Bluetooth 무선 기술의 아래 전송 계층(L2CAP·LMP·베이스밴드·무선)을 정한다 — Bluetooth 사양 1.1판의 MAC(L2CAP·LMP·베이스밴드)과 물리 계층(무선)을 IEEE가 검토해 표준으로 옮긴 것이다. 개요는 Bluetooth를 휴대용 개인 장치를 위한 짧은 거리 무선(RF) 연결의 업계 사양이라 적는다 —
  802.15.1-2002 개요 초록, TG1 페이지 「IEEE 802.15.1 OVERVIEW」. 그 개정판 802.15.1-2005는 **2018-05-07에 철회됐다** — 802.15.1-2005 개요 페이지. 지금 Bluetooth를 정하는 사양은 Bluetooth SIG의 Core Specification이다(아래 「Bluetooth SIG」 항목)
- **802.15.3**: TG3는 **고속 WPAN**(20 Mbit/s 이상)을 맡아, 낮은 전력·낮은 비용으로 휴대용 디지털 영상·멀티미디어 응용을 받치는 표준을 만들었다(그때의 특징: 11·22·33·44·55 Mbps, 애드혹 피어 투 피어 네트워킹, QoS) — TG3 페이지 「Overview」·「TG3 MAC & PHY Features」.
  802.15.3-2003 개요: 2.4 GHz 전파로 WPAN 안의 데이터·멀티미디어 장비를 잇는 프로토콜을 정한다. 지금 판 802.15.3-2023은 제목이 「무선 멀티미디어 네트워크(Wireless Multimedia Networks)」이고 2.4·60·300 GHz 전파를 쓴다 — 두 개요 초록
- **802.15.4**: TG4는 배터리를 몇 달에서 몇 년 쓰고 아주 단순한 **저속** 해법을 맡았고, 면허 없이 쓰는 국제 대역에서 동작한다. 쓰임의 예로 센서·장난감·스마트 배지·리모컨·홈 오토메이션을 든다 — TG4 페이지 머리.
  그때(802.15.4-2003)의 특징: 250·40·20 kbps, 16비트 짧은 주소와 64비트 IEEE 주소, CSMA-CA 채널 접근, **코디네이터가 네트워크를 자동으로 세움**, 주고받기를 확인하는 전송, 저전력을 위한 전력 관리, 2.4 GHz ISM 대역 채널 16개·915 MHz 대역 10개·868 MHz 대역 1개 — TG4 페이지 「IEEE 802.15 TG4 FEATURES」.
  802.15.4-2003 개요: 낮은 데이터 전송률·낮은 전력·낮은 복잡도의 짧은 거리 무선 전송으로 WPAN 장치를 잇는 프로토콜을 정했다. 지금 판 802.15.4-2024는 제목이 「저속 무선 네트워크(Low-Rate Wireless Networks)」이고, 배터리가 없거나 아주 적게 써야 하는 고정·휴대·이동 장치의 저속 무선 연결을 위한 **물리 계층과 MAC 부계층**을 정한다 — 두 개요 초록.
  802.15.4 위에 다른 기술(Zigbee)이 선다는 것은 이 IEEE 페이지들이 아니라 CSA 쪽 문서가 말한다(아래 「CSA — Zigbee」 항목)
- **802.15.5-2009**: WPAN 장치가 서로 통하는 안정된 무선 메시 모양(메시 토폴로지)을 이루게 하는 구조를 정한 권고 관행이다 — 개요 초록. 같은 작업반의 2006년 튜토리얼은 아래 「IEEE 802.11s — 메시」 항목
- 그 밖의 802.15 규격(802.15.2·.6·.7 등)은 기출이 묻지 않아 이름만 보았다
- **한국어 이름**: WPAN → **WPAN**(wireless personal area network, 무선 개인 영역 네트워크 — 기출이 영문 약어로 쓰고 풀어 쓴 이름도 함께 쓴다), High Rate WPAN → **고속 WPAN**, Low Rate WPAN → **저속 WPAN**, coordinator → **코디네이터**(영문 읽기),
  Wireless Multimedia Networks → 무선 멀티미디어 네트워크, withdrawn → **철회**(Inactive-Withdrawn), superseded → 대체됨(step 0과 같다), recommended practice → 권고 관행

쓰인 곳: (phase 82 step 5에서 쓰일 곳) `wireless-lan.wpan`(WPAN이 노리는 것, 802.15.1·.3·.4가 정한 것과 판·상태, WPAN과 무선 LAN — 802.11은 처리율·거리·로밍, WPAN은 낮은 비용·낮은 전력), `wireless-lan.zigbee`(802.15.4의 특징, 코디네이터), (phase 82 step 6에서 쓰일 곳) `wireless-lan.wireless-mesh`(802.15.5 WPAN 메시),
기출 대조(`exam-notes.md` 「phase 82 step 4」 문단·E42)

## (phase 82 step 4) Bluetooth SIG — Bluetooth·BLE: Bluetooth Core Specification 6.3(Vol 1 Part A Architecture), Bluetooth Technology Overview
허용 목록의 「무선 업체 연합 기술」 — phase 82 설계에서 더함(사용자 결정 2026-11-19).
https://www.bluetooth.com/specifications/specs/core-specification-6-3/
https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/Core_v6.3/out/en/architecture,-change-history,-and-conventions/architecture.html
https://www.bluetooth.com/learn-about-bluetooth/tech-overview/

판: **Bluetooth Core Specification 6.3**(상태 Adopted, 사양 페이지의 게시일 2026-05-05). 공개된 HTML판의 Vol 1 Part A 「Architecture」(머리 표기 vAtlanta r00)를 읽었다. 기술 개요 페이지는 2026-11-19에 받은 판이다.

- Core Specification 6.3: 서로 통하는 Bluetooth 장치를 만드는 데 필요한 기술을 정한다 — 사양 페이지
- Vol 1 Part A §1 「General description」: Bluetooth 무선 기술은 휴대용·고정 전자 장치를 잇는 케이블을 대신하려는 **짧은 거리 통신 시스템**이고, 튼튼함·낮은 전력 소비·낮은 비용을 핵심 특징으로 든다.
  시스템은 두 형태다 — **Basic Rate(BR)**(선택 확장 Enhanced Data Rate, EDR을 포함)와 **Low Energy(LE)**. 둘 다 장치 찾기와 연결 맺기를 갖춘다. **LE는 BR/EDR보다 전류 소비·복잡도·비용이 낮아야 하는 제품을 위해 설계했고**, 데이터 전송률과 듀티 사이클(보내는 시간의 비율)이 낮은 쓰임에 맞춘다.
  두 형태를 모두 구현한 장치는 둘 다 구현한 장치와도, 어느 하나만 구현한 장치와도 통신할 수 있다 — §1
- Vol 1 Part A §1.1: BR/EDR 무선(물리 계층)은 2.4 GHz ISM 대역에서 **주파수 도약** 송수신기로 간섭과 페이딩에 맞선다 — §1.1(앞 개념 `wlan-transmission`의 FHSS와 같은 갈래)
- 기술 개요 페이지 「Bluetooth® Classic」·「Bluetooth® LE」와 비교표: **Bluetooth Classic**(= BR/EDR)은 2.4 GHz ISM 대역의 채널 79개(1 MHz 간격)로 데이터를 보내고, 점대점 통신을 지원하며 주로 무선 오디오(스피커·헤드폰·차량)에 쓰인다.
  **Bluetooth LE**는 아주 낮은 전력으로 동작하도록 설계했고 2.4 GHz 대역의 채널 40개(2 MHz 간격)를 쓴다. **점대점·브로드캐스트·메시** 토폴로지를 지원하고, 장치의 위치를 찾는 데에도 쓰인다. 두 형태 모두 채널을 FHSS로 쓴다
- 802.15.1과의 관계: 802.15.1-2002는 Bluetooth 사양 1.1판의 아래 계층을 IEEE 표준으로 옮긴 것이고 2005년 개정판은 2018년에 철회됐다(위 「IEEE 802.15」 항목). 지금 판의 Bluetooth(6.3)는 Bluetooth SIG가 정한다. **LE가 802.15.1에 들어 있었는지는 확인하지 못했다** — 본문은 「802.15.1은 Bluetooth 1.1판의 아래 계층을 옮긴 IEEE 표준」까지 쓰고 BLE와 802.15.1을 잇지 않는다
- 쓰지 않는 것: 닿는 거리의 수치(이 두 페이지에 없다), 전송률·변조·송신 전력 표, 프로파일·페어링·보안, LE Audio·채널 사운딩 같은 기능
- **한국어 이름**: Bluetooth → **블루투스**(Bluetooth — 기출은 「블루투스」와 「Bluetooth」를 함께 쓴다), Low Energy → **BLE**(Bluetooth Low Energy — 사양은 LE로 줄여 쓰고, 기출 보기는 「Bluetooth Low Energy(BLE)」로 쓴다), Basic Rate/Enhanced Data Rate → BR/EDR(Bluetooth Classic — 이름만),
  Bluetooth SIG → **Bluetooth SIG**(Bluetooth를 정하는 업계 단체 — 이름 그대로)

쓰인 곳: (phase 82 step 5에서 쓰일 곳) `wireless-lan.wpan`(Bluetooth와 BLE 한 줄씩, 802.15.1과의 관계), `wireless-lan.zigbee`(BLE의 사실 — Zigbee와 견줄 때 각각의 사실로)

## (phase 82 step 4) CSA — Zigbee: Zigbee FAQ, Zigbee 소개 페이지; IEEE 802 플레너리 튜토리얼 「ZigBee Smart Energy」(IEEE 802.15-09-0770-00, 2009-11)
허용 목록의 「무선 업체 연합 기술」 — phase 82 설계에서 더함(사용자 결정 2026-11-19).
https://csa-iot.org/all-solutions/zigbee/zigbee-faq/
https://csa-iot.org/all-solutions/zigbee/
https://csa-iot.org/developer-resource/specifications-download-request/ (사양 목록 — Zigbee Specification R23.1·R22의 PDF 링크가 있지만 내려받지 못했다)
https://www.ieee802.org/802_tutorials/2009-11/15-09-0770-00-0000-smartgrid-tutorial-zigbee-smart-energy-overview.ppt

판: CSA 두 페이지는 2026-11-19에 받은 판이다(FAQ는 지금 Zigbee PRO가 2023년 판이라고 적는다). 사양 목록에 올라 있는 최신 Zigbee 사양은 문서 05-3474-23(R23.1, 2024-07 올림)이지만 **본문은 읽지 못했다**(머리 문단 — Cloudflare가 막았다).
2009년 튜토리얼은 2009-11 802 플레너리의 스마트 그리드 튜토리얼 가운데 하나로, 802.15 문서 번호가 붙은 그때의 소개 자료다(표준 본문이 아니다) — 계층 그림과 쓰는 곳의 예로만 쓴다.

- FAQ 「What are the IEEE 802.15.4 technical attributes on which the Zigbee specification is based?」: Zigbee는 **IEEE 802.15.4 물리 무선 표준**을 바탕으로 하고, 면허 없이 쓰는 대역 2.4 GHz(전 세계)·915 MHz(미주)·868 MHz(유럽)에서 동작한다. 2.4 GHz에서 원시 처리율은 250 kb/s다.
  **전송 거리는 출력과 환경에 따라 10~100 m**이고, 1 GHz 아래 대역의 무선으로는 1 km 이상도 닿는다
- FAQ 「How does Zigbee compensate for possible interference in the 2.4GHz band?」·「How does Zigbee address wireless reliability?」: 802.15.4가 정한 **CSMA-CA**로 다른 사용자와 부딪칠 가능성을 줄이고 자동으로 다시 보낸다. 802.15.4 무선의 DSSS와 충돌 회피·채널 상태 확인·확인 응답 같은 기능을 쓴다.
  2.4 GHz 대역에서 5 MHz 간격의 채널 16개를 쓴다 — 곧 Zigbee의 물리 계층과 MAC 쪽 기능은 802.15.4의 것이다(위 「IEEE 802.15」 항목의 TG4 줄과 같다)
- FAQ 「What is the Zigbee specification?」·「What are the key features of Zigbee?」: Zigbee 사양은 메시 네트워크부터 기기들이 함께 쓰는 **응용 계층의 데이터 모델**까지 스택의 모든 계층을 표준화하고 시험한다 — 곧 802.15.4 위의 계층을 Zigbee가 정한다. 전력 소비를 낮추도록 맞췄다
- FAQ 「What are Zigbee’s main benefits?」·「What are the key features of Zigbee?」: **메시 네트워크**는 스스로 짜이고(self-organizing), 장애에서 회복해 **스스로 고친다**(self-healing) — 네트워크에 여유를 더해 한 곳이 고장 나도 버티게 한다
- 2009년 튜토리얼의 스택 그림: 물리 무선(PHY)과 매체 접근(MAC) 위에 NWK(네트워크)·APS(응용 지원)·ZDO·보안·응용이 쌓이고, PHY부터 ZDO까지를 「ZigBee Compliant Platform」으로 묶는다(.ppt의 그림 글자로 읽었다 — 어느 슬라이드의 그림인지는 화면으로 확인하지 않았다).
  같은 파일의 시장 그림(슬라이드 제목 「Typical ZigBee Markets」)은 쓰는 곳으로 홈 제어(보안·냉난방·조명·출입 통제)·빌딩 자동화·산업 제어·개인 건강 관리·PC 주변기기·가전·에너지 관리를 든다(2009년 자료)
- FAQ 「What markets are served by Zigbee?」: 주거(스마트 홈)·상업 건물·전력 사업(스마트 미터와 가정 영역 네트워크)에 쓰인다 — 회사·제품 이름은 옮기지 않는다
- **장치 역할(코디네이터·라우터·엔드 디바이스)의 정의는 찾지 못했다** — 사양 본문에만 있을 것이고 읽지 못했다. FAQ는 「네트워크 코디네이터」 여럿을 이어 아주 큰 네트워크를 만들 수 있다고만 적는다(「How many nodes or devices can a Zigbee network support?」).
  802.15.4 쪽에서는 코디네이터가 네트워크를 자동으로 세운다(위 「IEEE 802.15」 항목의 TG4 줄). 본문은 「코디네이터가 네트워크를 세운다」까지만 쓰고, 라우터·엔드 디바이스라는 이름과 그 일은 지어내지 않는다
- **Zigbee와 BLE를 직접 견준 문장은 없다** — 각각의 사실만 쓴다: Zigbee는 802.15.4 위(DSSS·CSMA-CA, 2.4 GHz와 1 GHz 아래 대역, 메시), BLE는 Bluetooth SIG 사양의 LE(2.4 GHz 채널 40개·FHSS, 점대점·브로드캐스트·메시 — 위 「Bluetooth SIG」 항목)
- 쓰지 않는 것: 홍보 문구(「유일한 완전한 IoT 해법」, 칩 출하량, 채택 회사), 응용 프로파일·보안 방식(AES-128 등)·Zigbee Direct·Matter와의 관계, 노드 수, 인증 프로그램
- **한국어 이름**: Zigbee → **Zigbee**(CSA의 지금 표기 — 기출은 「Zigbee」와 「ZigBee」를 쓴다), Connectivity Standards Alliance → **CSA**(Zigbee를 정하는 업계 단체 — 이름 그대로), coordinator → 코디네이터, mesh → **메시**, self-healing → 「장애에서 회복해 스스로 고친다」로 풀어 쓴다

쓰인 곳: (phase 82 step 5에서 쓰일 곳) `wireless-lan.zigbee`(802.15.4 위에 선다, 물리·MAC은 802.15.4, 그 위 계층을 Zigbee가 정한다, 저전력, 메시, 쓰는 곳, 대역, Zigbee와 BLE·Z-Wave), (phase 82 step 6에서 쓰일 곳) `wireless-lan.wireless-mesh`(장애에서 회복하는 메시 — 한 줄),
기출 대조(`exam-notes.md` 「phase 82 step 4」 문단·E42)

## (phase 82 step 4) ITU-T G.9959 (01/15) — Short range narrow-band digital radiocommunication transceivers – PHY, MAC, SAR and LLC layer specifications
https://www.itu.int/rec/T-REC-G.9959-201501-I/en

판: 2015-01-13 승인, 현행(In force). 판 2.0 — G.9959(2012-02-13)와 그 Amd.1(2013-10-07)을 대체한다. 위 페이지에서 무료 PDF를 받아 읽었다.

- 요약·§1 「Scope」: 짧은 거리 협대역 디지털 무선 송수신기의 물리 계층·MAC·분할과 재조립(SAR)·논리 링크 제어(LLC)를 정한다. **1 GHz 아래**에서 동작하는 송수신기를 정하고, 그것은 부록 A를 따르는 송수신기와 함께 동작해야 한다 — 요약, §1
- §7.1.1 「General」: 물리 계층은 **저전력·좁은 대역폭의 제어 네트워크**에 쓰는 변조·데이터 전송률·동기·프레임 형식을 정한다. §8.1.1.4.3: 배터리로 동작하는 노드의 한 부류는 대부분의 시간을 잠들어 있다가 주기적으로 깨어난다 — §7.1.1, §8.1.1.4.3.
  §8.1.1.4.2.4: MAC 헤더에 멀티홉 라우팅을 받칠 칸을 두지만 라우팅 자체는 이 권고의 범위 밖이다
- **부록 A 「Non-radio related aspects of the Z-Wave PHY and MAC Specifications」**(이 권고의 필수 부분이다): **Z-Wave**는 저전력·저비용 무선 기술로, 원격 조광기·네트워크 온도 센서·전자 도어락·AV 시스템 같은 소비자 제품을 네트워크로 잇는다.
  잡음과 반사로 프레임을 자주 잃으므로 낮은 계층에서 다시 보낸다. 네트워크 계층은 메시 라우팅으로 직접 닿는 거리 너머까지 네트워크를 넓힐 수 있고, Z-Wave 라우팅 프로토콜이 그 예다 — A.1.1.
  Z-Wave는 자기 네트워크·전송·응용 계층을 따로 갖는다(참고로 적은 절) — A.1.2
- 곧 Z-Wave와 Zigbee는 아래 계층이 다르다 — Z-Wave는 ITU-T G.9959(1 GHz 아래 협대역), Zigbee는 IEEE 802.15.4(위 「CSA — Zigbee」 항목). 두 문서를 나란히 놓은 것이고, 둘을 직접 견준 문장은 없다
- 쓰지 않는 것: 데이터 전송률·채널·주파수 값, 노드 수와 HomeID·NodeID의 형식, 프레임 형식, 동작 모드(AL·FL)의 세부
- **한국어 이름**: Z-Wave → **Z-Wave**(영문 그대로 — 기출 보기 이름), sub 1 GHz → 1 GHz 아래, narrow-band → 협대역

쓰인 곳: (phase 82 step 5에서 쓰일 곳) `wireless-lan.zigbee`(오답 보기 Z-Wave를 가르는 한 줄 — 1 GHz 아래 협대역의 저전력 가정용 무선, 아래 계층이 Zigbee와 다르다), 기출 대조(`exam-notes.md` 「phase 82 step 4」 문단)

## (phase 82 step 4) IEEE 802.11s — 메시: 802.11s-2011·802.11-2012 개요 페이지, TGs 보고, 802.11s 튜토리얼(2006-11), 802.15.5 WPAN 메시 튜토리얼(2006-11)
https://standards.ieee.org/ieee/802.11s/4243/
https://standards.ieee.org/ieee/802.11/4523/
https://www.ieee802.org/11/Reports/tgs_update.htm
https://www.ieee802.org/802_tutorials/06-November/802.11s_Tutorial_r5.pdf
https://www.ieee802.org/802_tutorials/06-November/15-06-0464-00-0005-802-15-5-mesh-tutorial.pdf

판: **IEEE 802.11s-2011**(개정 10 「메시 네트워킹」, PAR 승인 2007-08-22, 표준 위원회 승인·발행 2011-09-10, 대체됨), IEEE 802.11-2012(승인 2012-02-06, 2008~2011년에 나온 개정 1~10을 합쳐 넣었다 — 곧 802.11s가 기본 표준에 들어갔다, 대체됨 — 802.11-2016).
TGs 보고는 2011-07 기록이 마지막이다. 두 튜토리얼은 2006-11 802 플레너리 발표로 **승인 전 초안 때의 설명**이다 — 장치 이름(메시 포인트 등)과 세부는 최종 표준과 다를 수 있어, 표준 개요와 맞는 뼈대(멀티홉, 스스로 구성, 경로 선택, 끊긴 링크의 처리)만 쓴다.

- 802.11s-2011 개요 초록: 802.11 스테이션들이 **스스로 구성되는 멀티홉 네트워크**를 이루고, 한 곳에 보내기(유니캐스트)와 여럿에게 보내기(브로드캐스트·멀티캐스트)를 모두 지원하게 하는 프로토콜을 정한다
- 802.11s 튜토리얼(2006): 메시는 데이터가 무선 홉 여럿으로 이어진 경로로 전달되는 구조다 — 「Abstract」. 기존 802.11 WLAN은 AP가 대개 유선으로 이어져 있는데, 메시는 AP 사이도 무선 메시 링크로 이어 유선 백홀 없이 빠르게 펼치고 선을 깔기 어려운 곳까지 덮는다 —
  「Classic 802.11 WLAN」·「Unwire the WLAN with Mesh」·「Why Mesh?」. 범위: 802.11 MAC에 토폴로지를 자동으로 알아내고 무선 경로를 설정하는 무선 분배 시스템을 더하고, 무선 상태를 반영해 동적으로 경로를 골라 한 홉·여러 홉 경로로 전달한다. 물리 계층(a·b·g·n)은 그대로 쓴다 — 「802.11s Scope」
- 이웃 찾기: 메시 장치는 비컨과 프로브 응답에 새로 넣은 정보(메시 ID 등)로 이웃 후보를 찾고, 이웃과 보안이 걸린 피어 링크를 맺어 메시에 든다 — 「Topology Formation: Membership in a WLAN Mesh Network」. 메시 장치들 사이에는 본래 위계가 없다 — 「11s Security Situation」
- 경로 선택: 필수(기본) 경로 선택 프로토콜은 **HWMP**(Hybrid Wireless Mesh Protocol)다 — 필요할 때 경로를 찾는 방식(AODV, RFC 3561을 바탕으로 함)과, 루트(메시 포털)가 있으면 그것을 향한 트리를 미리 만들어 두는 방식을 섞는다. 기본 지표는 전송 시간(airtime)이다 —
  「Default Routing protocol for Interoperability」·「Hybrid Wireless Mesh Protocol (HWMP)」. 링크 상태가 바뀌면 경로도 바뀔 수 있다 — 「Routing = Path Calculation for Forwarding」
- **링크가 끊길 때**: 다음 홉과의 링크를 살피다 끊긴 것을 알아채면 경로 오류(Route Error) 메시지로 다른 노드들에게 알린다 — 「On-demand routing in HWMP – Key Features」(Route Maintenance). 트리 쪽에서는 위쪽 링크를 살피다 **예비 링크로 바꿀 수 있다** — 「Tree-based routing in HWMP – Key Features」(Topology Maintenance)
- TGs 보고(2008~2009)의 문서 제목에 「HWMP Overview」·「Mesh STA collocation」 같은 이름이 나온다 — 최종에 가까운 초안도 HWMP를 다뤘고 메시 스테이션(mesh STA)이라는 이름을 썼다는 데까지 확인한다. 최종 표준 본문의 장치 이름 정의는 읽지 못했다
- 802.15.5 튜토리얼(2006): WPAN 메시는 완전 메시나 부분 메시 연결을 쓰는 무선 PAN이다. 목적으로 송신 전력을 높이지 않고 덮는 범위를 넓히기, **경로 여분(route redundancy)으로 신뢰성 높이기**, 네트워크 구성을 쉽게 하기를 든다 — 「What is WPAN Mesh?」·「Purpose of the project」.
  경로 선택의 과제로 스스로 짜이기(self organizing)와 여분 링크를 든다 — 「Challenges in WPAN Mesh Scenarios」
- 「중앙 제어 장치 없이」의 근거: 802.11s의 「스스로 구성」과 메시 장치 사이에 위계가 없다는 것, 아래 RFC 2501의 분산된 네트워크 제어다. 다만 802.11s의 트리 방식은 루트 포털이 **있으면** 그것을 향해 트리를 만든다 —
  본문은 「중앙 장치가 없어도 장치들이 이웃을 찾고 경로를 만든다」로 쓰고, 메시에는 중앙 장치를 「두지 않는다」로 단정하지 않는다
- 쓰지 않는 것: 802.11s 보안(인증·키 관리), 메시 프레임 형식과 6주소 체계, 전송 시간 지표의 계산식, RA-OLSR 같은 선택 프로토콜, MCCA·전력 절약, 「군사 기술에서 출발했다」(이 항목의 문서들이 말하지 않는다 — 튜토리얼은 쓰임의 하나로 공공 안전·군을 들 뿐이다)
- **한국어 이름**: mesh network → **메시 네트워크**, wireless mesh network → **무선 메시 네트워크**, multi-hop → **멀티홉**(여러 홉을 거쳐 전달), path selection → 경로 선택, mesh portal → 메시 포털, mesh STA → 메시 스테이션(이름만), HWMP → HWMP(이름만), self-configuring → 스스로 구성되는
- (phase 82 step 6, 2026-11-19 위 802.11s 튜토리얼 PDF를 IPv4로 다시 받아 확인) **메시 포털이 무엇인가**: 튜토리얼의 장치 갈래 설명은 메시 포털(Mesh Portal, MPP)을 스테이션이 보내고 받는 데이터가 WLAN 메시로 들어오고 나가는 지점으로 적고,
  그림에서 메시 포털을 메시 바깥의 네트워크(External Network)와 메시 사이에 둔다. HWMP 슬라이드는 필요할 때 경로를 찾는 방식에 **메시 포털로 가는 경로를 미리 만들어 두는 방식**을 더한 것이라 적는다(「Default Routing protocol for Interoperability」, 「Hybrid Wireless Mesh Protocol (HWMP)」 — 루트 포털이 있으면 트리를 만든다).
  메시 바깥의 목적지로 가는 데이터는 메시 포털을 거쳐 나간다(「For a destination outside the Mesh … deliver packets via unicast」). 승인 전 초안 때의 설명이라 본문은 「메시를 바깥 네트워크와 잇는 노드」로만 쓰고, 「메시 포털」이라는 이름과 브리지 동작은 쓰지 않는다
  쓰인 곳: `wireless-lan.wireless-mesh`(HWMP 한 줄, 중앙 장치가 따로 필요하지 않다는 문단), 문항 `n323`의 해설

쓰인 곳: (phase 82 step 6에서 쓰일 곳) `wireless-lan.wireless-mesh`(메시와 802.11s, 멀티홉, 이웃 찾기, 경로 선택 HWMP, 끊긴 링크를 알리고 다른 링크로 바꾸기, 경로 여분, 메시와 인프라스트럭처 모드 — AP가 유선으로 이어진 WLAN과 AP 사이도 무선으로 이은 메시), 기출 대조(`exam-notes.md` 「phase 82 step 4」 문단)

## (phase 82 step 4) RFC 2501 — Mobile Ad hoc Networking (MANET): Routing Protocol Performance Issues and Evaluation Considerations
https://www.rfc-editor.org/rfc/rfc2501

판(rfc-editor.org 텍스트판과 `…/rfc2501.json`, 2026-11-19): 1999-01, Informational, 폐기·개정 없음.

- §3 「Characteristics of MANETs」: MANET(모바일 애드혹 네트워크)은 마음대로 움직일 수 있는 노드(라우터와 그에 딸린 호스트)로 이루어진 자율 시스템이다. 혼자 동작할 수도, 게이트웨이를 거쳐 고정 네트워크에 이어질 수도 있다.
  노드가 움직이므로 **대개 멀티홉인 네트워크 토폴로지가 예측할 수 없는 때에 빠르게 바뀐다** — 1) 「Dynamic topologies」. 네트워크 제어가 분산돼 있어 중앙 집중 방식의 단일 장애점에 더 강하다 — 4) 「Limited physical security」의 끝 문장
- 이 RFC는 애드혹 네트워크를 말하고 802.11s 메시를 말하지 않는다 — 본문은 「노드가 들고 나며 구성이 바뀐다」·「중앙 제어 없이도 동작한다」를 애드혹 방식의 성질로 쓰고, 802.11s 메시가 스스로 구성된다는 것(위 「IEEE 802.11s」 항목)과 함께 놓는다
- **한국어 이름**: MANET → 모바일 애드혹 네트워크(이름만), ad hoc → **애드혹**(step 0의 「애드혹 모드」와 같은 낱말 — 여기서는 미리 깔아 둔 설비 없이 장치끼리 이루는 네트워크라는 일반 뜻), autonomous system → 이 낱말은 본문에 쓰지 않는다(phase 74 `routing`의 AS와 뜻이 다르다)

쓰인 곳: (phase 82 step 6에서 쓰일 곳) `wireless-lan.wireless-mesh`(노드가 움직이며 토폴로지가 바뀐다, 분산된 제어가 단일 장애점에 강하다), 기출 대조(`exam-notes.md` 「phase 82 step 4」 문단)

## (phase 82 step 4) ITU-T Q.1001 (11/88)·Q.1706/Y.2801 (11/06), IEEE 802.21 — 기지국·셀·핸드오버·페이징
https://www.itu.int/rec/T-REC-Q.1001-198811-I/en
https://www.itu.int/rec/T-REC-Q.1706-200611-I/en
https://www.ieee802.org/21/
https://standards.ieee.org/standard/802_21-2017.html
https://www.ieee802.org/802_tutorials/06-July/802%2021-IEEE-Tutorial.ppt

판: ITU-T Q.1001(1988-11, 「General aspects of public land mobile networks」, 현행 In force), ITU-T Q.1706/Y.2801(2006-11, 「Mobility management requirements for NGN」, 현행 In force) — 두 권고 모두 위 페이지에서 무료 PDF를 받아 읽었다.
Q.1001은 음성 통화를 다루던 때의 권고라 핸드오버를 「진행 중인 통화」로 적고, Q.1706은 그것을 세션 일반으로 넓혀 적는다.
IEEE 802.21-2017(「Media Independent Services Framework」, 승인 2017-02-14, 발행 2017-04-28, Active — 802.21-2008을 대체). 802.21 작업 그룹은 2019-07-19부터 휴면이다(작업 그룹 페이지). 802.21 튜토리얼(DCN 21-06-0706-00, 2006-07)은 그때의 소개 자료다.

- Q.1001 §2.1.4 「base station」: **기지국**은 같은 곳에 있으면서 셀 하나 또는 여럿을 맡는 무선 설비 전부를 부르는 이름이다. §2.1.5: 이동국(mobile station)은 사용자 쪽에서 무선 경로를 끝내는 장비다(곧 휴대 단말).
  §2.1.6 「cell」: **셀**은 기지국(또는 섹터 안테나처럼 그 기지국의 일부)이 덮는 지역이고, 셀 안의 이동국은 그 기지국의 무선 설비와 닿을 수 있다. §2.1.8: 위치 영역(location area)은 이동국이 위치 등록을 고치지 않고 다닐 수 있는 지역으로, 셀 여럿을 품을 수 있다.
  §2.1.3: 넓은 지역을 무선으로 덮으려면 기지국이 여럿 필요하다 — §2.1
- Q.1001 §2.3.1 「handover」: **핸드오버**는 진행 중인 통화를 한 셀에서 다른 셀로(또는 같은 셀 안의 다른 무선 채널로) 넘기는 일이다. 이동국이 셀을 옮겨도 이미 맺어진 통화가 이어지게 하려고 쓰고, 동일 채널 간섭을 줄이는 데에도 쓴다 — §2.3.1
- Q.1706/Y.2801 §6.2.2 「Features by service continuity」: 움직이는 동안과 뒤에도 서비스가 이어지는 갈래로 **핸드오버**(서비스 품질에 영향이 있을 수 있음)와 끊김 없는 핸드오버(영향 없음)를 든다. §6.4.2 「Handover management」: 단말이 세션 중에 다른 네트워크 영역으로 옮겨 접속점을 바꿔도 세션이 이어지게 하는 일이다 — §6.2.2, §6.4.2
- Q.1706/Y.2801 §6.4.1 「Location management」: 위치 관리는 위치 등록과 착신 전달·**페이징**으로 이루어지고, **페이징은 휴면 상태의 단말을 찾는 데 쓰인다**. §8.1.10 「Resource optimization」: 대기(idle) 상태 단말의 전력·신호 부담을 줄이는 일은 주로 페이징 절차로 이루어지고, 이 절차는 위치 관리와 묶여 있다 — §6.4.1, §8.1.10
- **신호가 약해져서 핸드오버한다**는 문장은 이 권고들에서 찾지 못했다. 802.21 튜토리얼은 신호 세기만 보고 AP를 고르면 엉뚱한 AP에 붙는 문제를 든다 — 「Problems….」. 본문은 「셀 안의 단말만 그 기지국과 닿으므로(Q.1001 §2.1.6), 셀을 옮기면 연결을 새 기지국으로 넘겨야 이어진다(§2.3.1)」로 쓰고 신호 세기를 원인으로 단정하지 않는다
- IEEE 802.21-2017 개요: 서로 다른 IEEE 802 네트워크 사이에서, 그리고 802 네트워크와 셀룰러 네트워크 사이에서 핸드오버 같은 서비스를 최적화하는 매체 독립 서비스 프레임워크를 정한다 — 개요 초록, 작업 그룹 페이지.
  튜토리얼은 같은 종류의 네트워크 안에서의 핸드오버(수평)와 다른 종류의 네트워크 사이의 핸드오버(수직)를 나누고, 2002년 802 튜토리얼 「Handoff Mechanisms…」에서 작업이 시작됐다고 적는다(handoff와 handover를 같은 뜻으로 쓴다) — 「Types of Handovers」·「How it all started….」
- 무선 LAN에서 다른 AP로 옮겨 붙는 일(재연결)은 위 「RFC 4118, RFC 5416, RFC 8325, RFC 9119」 항목의 「(phase 82 step 4)」 줄
- [기출 2024-08-25 #23]의 나머지 오답: 「핸드셰이크」는 앱에 이미 있는 `tcp-connection.three-way-handshake`(TCP가 연결을 맺는 절차)와 같은 낱말이다. 「채널 체인징」이라는 이름은 이 step이 읽은 문서 어디에도 없다 — 본문·문항에 쓰지 않는다
- 쓰지 않는 것: 셀룰러(LTE·5G)의 핸드오버 절차와 측정 보고, MSC와 위치 등록 절차, 802.21의 서비스(이벤트·명령·정보) 세부
- **한국어 이름**: base station → **기지국**, cell → **셀**, mobile station → 이동국(본문은 「휴대 단말」로 풀어 쓴다), handover·handoff → **핸드오프**(guide의 개념 이름이자 기출의 이름 — ITU-T 권고는 handover로 적고, 802 튜토리얼은 두 낱말을 같은 뜻으로 쓴다),
  paging → **페이징**, location area → 위치 영역, idle·dormant → 대기·휴면

쓰인 곳: (phase 82 step 6에서 쓰일 곳) `wireless-lan.handoff`(기지국·셀의 정의, 핸드오프의 정의와 까닭, 핸드오프와 페이징 — 연결 중에 옮겨 가는가와 대기 중인 단말을 찾는가), 기출 대조(`exam-notes.md` 「phase 82 step 4」 문단)

## (phase 82 step 4) IEEE 1900.1·802.22 — 인지 무선: 1900.1-2008·2019, 802.22-2011·2019 개요 페이지, 802.22 작업 그룹 페이지, 802.22 튜토리얼(2006-07)
https://standards.ieee.org/standard/1900_1-2019.html
https://standards.ieee.org/standard/1900_1-2008.html
https://standards.ieee.org/standard/802_22-2019.html
https://standards.ieee.org/standard/802_22-2011.html
https://www.ieee802.org/22/ (본문 프레임 https://www.ieee802.org/22/HomePageText.htm)
https://www.ieee802.org/802_tutorials/06-July/Rec-Practice_802.22_Tutorial.ppt

판: **IEEE 1900.1-2019**(승인 2019-02-08, 발행 2019-04-23, Active — 1900.1-2008을 대체, 표준 위원회 DySPAN-SC), **IEEE 802.22-2019**(승인 2019-09-05, 발행 2020-05-05, Active — 802.22-2011을 대체), IEEE 802.22-2011(승인 2011-06-16, 발행 2011-07-01, 대체됨).
802.22 작업 그룹은 2019-07-19부터 휴면이다(작업 그룹 페이지). 튜토리얼(2006-07, 802.22 권고 관행 소개)은 그때의 소개 자료이고, 인지 무선 기법 셋은 미국 FCC의 규칙 제정 공고(NPRM)를 옮겨 적었다고 밝힌다.

- 1900.1-2019 개요: 스펙트럼 관리·**인지 무선**·**동적 스펙트럼 접근**·정책 기반 무선·소프트웨어 정의 무선 같은 용어의 정의와, 그 기술들이 어떻게 이어지는지의 설명을 담는다. 제목은 「동적 스펙트럼 접근의 정의와 개념」이다 — 개요 초록·제목.
  **정의 문장 자체(본문)는 읽지 못했다** — 본문은 인지 무선을 1900.1의 정의로 쓰지 않고, 아래 802.22 쪽 문서가 말하는 동작으로 쓴다
- 802.22-2019 개요(제목·초록): 인지 무선 지역 네트워크(WRAN)의 **인지 MAC과 물리 계층**을 정한다 — 통신 장치가 **1차 서비스(primary service)의 스펙트럼**에서 기회를 보아(opportunistically) 동작할 수 있는, 스펙트럼 공유를 허용하는 대역의 정책과 절차다.
  고정 기지국과 고정·휴대 사용자 단말로 이루어진 점대다점 네트워크이고 **VHF/UHF TV 방송 대역(54~862 MHz)**에서 동작한다(규제가 허용하면 1300~1750 MHz·2700~3700 MHz도) — 개요. 802.22-2011의 제목은 「TV 대역에서의 동작을 위한 정책과 절차」였다 — 개요
- 802.22 작업 그룹 페이지: 802.22 작업 그룹은 스펙트럼 공유를 가능하게 하는 표준들을 만들었다. 802.22.1-2010은 면허받은 장치(무선 마이크)를 간섭에서 더 보호하는 표준이다 — HomePageText
- 튜토리얼(2006-07) 「Characteristics of 802.22 WRAN — Cognitive Radio」: 인지 무선은 협의나 기회에 따라 스펙트럼을 함께 쓰게 하고, 무선이 스펙트럼을 쓰는 방식을 **동작 환경의 실시간 상태에 맞추며**, 해로운 간섭의 위험을 줄인다.
  인지 무선 기법 셋(FCC 공고) — 데이터베이스와 위치 확인(면허받은 방송국의 보호 구역 밖인지 판단), 제어 신호 받기(그 지역에서 어느 채널이 쓰이고 어느 채널이 비었는지 알려 주는 신호), **감지**(주변 무선 환경을 감지) — 「Cognitive Radio Techniques (as per the NPRM)」.
  802.22는 그 대역을 **이미 쓰는 기존 시스템(incumbent)을 감지**하는 첫 802 작업 그룹이고, 단말과 기지국이 주변 스펙트럼을 감지해 기지국에 알리면 네트워크 차원에서 **그 채널을 계속 쓸지, 기존 시스템에 간섭하지 않도록 채널을 바꿀지** 정한다 — IEEE 802 표준 가족 그림 슬라이드의 설명 노트
- 「허가받은 사용자가 나타나면 비켜 간다」의 근거는 위 튜토리얼의 채널 전환 줄이다 — 본문은 「기존 사용자를 감지하면 그 채널을 비우고 다른 빈 채널로 옮긴다」로 쓴다
- 쓰지 않는 것: 802.22의 물리 계층(변조·채널 폭·셀 반경·전송률), 감지 방법의 세부(조용한 기간·협력 감지), 데이터베이스 운영, 1900.1의 다른 용어(소프트웨어 정의 무선·정책 기반 무선)
- **한국어 이름**: cognitive radio → **인지 무선**(CR — 기출이 「CR(Cognitive Radio)」로 쓴다), dynamic spectrum access → **동적 스펙트럼 접근**, primary service·incumbent → **허가받은 사용자**(guide의 이름 — 표준 쪽 문서는 1차 서비스(primary)·기존 시스템(incumbent)으로 부르고, 본문은 「그 대역을 쓰도록 허가받은 기존 사용자」로 풀어 쓴다),
  spectrum sensing → **스펙트럼 감지**, WRAN → 무선 지역 네트워크(이름만)

쓰인 곳: (phase 82 step 7에서 쓰일 곳) `wireless-lan.cognitive-radio`(인지 무선·동적 스펙트럼 접근·허가받은 사용자·스펙트럼 감지·802.22가 TV 대역의 비어 있는 채널을 쓴다, 인지 무선과 고정된 주파수 할당), 기출 대조(`exam-notes.md` 「phase 82 step 4」 문단)

## (phase 82 step 4) RFC 8376 — Low-Power Wide Area Network (LPWAN) Overview
https://www.rfc-editor.org/rfc/rfc8376

판(rfc-editor.org 텍스트판과 `…/rfc8376.json`, 2026-11-19): 2018-05, Informational, 폐기·개정 없음.

- §1: LPWAN 기술들은 아주 싸고 처리율이 낮으며 전력을 아주 적게 쓰는 장치를 많이 받치려 하고, 이름의 「광역(wide area)」대로 **몇 km에 이르는 무선 링크로 넓은 지역을 덮는 것**이 공통 목표다 — §1
- §2.2.1: **NB-IoT**(Narrowband IoT)는 3GPP가 개발·표준화했고(Release 13, 2016-06), 사업자의 기지국을 소프트웨어로 고쳐 기존 LTE 네트워크에 들일 수 있다 — §2.2.1. §2 머리: 기술마다의 절은 그 기술을 미는 쪽이 쓴 참고 글이다
- **LTE-M은 이 RFC에도, 이 step이 읽은 다른 문서에도 없다** — 본문·문항에 쓰지 않는다(3GPP 문서는 허용한 출처가 아니다)
- 쓰지 않는 것: NB-IoT의 수치(전송률·커버리지·장치 수·대역폭), 배치 방식, 프로토콜 구조
- **한국어 이름**: NB-IoT → **NB-IoT**(협대역 IoT — 이름만), LPWAN → 저전력 광역 네트워크(이름만)

쓰인 곳: (phase 82 step 5에서 쓰일 곳) `wireless-lan.wpan`(오답 보기 NB-IoT가 WPAN과 다른 것 — 이동통신 사업자의 기지국으로 넓은 지역을 덮는 기술, 한 줄로만), 기출 대조(`exam-notes.md` 「phase 82 step 4」 문단)

## (phase 82 step 8) RFC 3234 — Middleboxes: Taxonomy and Issues
https://www.rfc-editor.org/rfc/rfc3234

판(rfc-editor.org 텍스트판과 `…/rfc3234.json`, 2026-11-19): 2002-02, Informational, 폐기·개정 없음. 중간 장치(미들박스)의 종류를 늘어놓은 분류 문서다 — 동작을 표준으로 정하지 않는다.

- 미들박스는 출발지 호스트와 목적지 호스트 사이의 데이터그램 경로 위에서, IP 라우터의 보통 기능이 아닌 일을 하는 중간 장치다. 따로 떨어진 상자가 아니라 다른 장치에 든 기능일 수도 있다. IP 패킷 흐름을 끝내고 새 흐름을 만드는 장치일 수도, 흐름을 바꾸거나 다른 곳으로 돌리는 장치일 수도 있지만,
  **응용 세션의 마지막 끝(end-system)은 아니다**. 표준 IP 라우팅(경로를 찾고 고르는 일)은 미들박스 기능이 아니고, IP 계층 아래의 기능도 이 정의에서 뺀다 — §1.1
- 「라우팅」이라는 말은 좁게는 IP 주소로 경로를 고르는 IP 라우터의 판단을, 넓게는 URL 같은 응용 계층 정보로 내리는 판단을 가리키기도 한다. 어느 쪽이든 나갈 방향을 고르는 것이지, 방향이 하나뿐인 곳으로 넘기기만 하는 것은 아니다 — §1.1
- **패킷을 돌리거나 고치는 로드 밸런서**: 패킷을 본래의 IP 목적지에서 다른 곳으로 돌리거나 목적지를 하나로 정하지 않는 여러 기법이 있고, 그 까닭은 대개 **서버들 사이에 부하를 고르게 나누려는 것**이다(목적지 포트 번호에 따라 응용을 서버들로 나누기도 한다).
  **같은 응용 세션의 패킷은 모두 같은 물리 서버로 가야 하므로** 이 기법들은 상태를 가질 수밖에 없다(한 번 오가고 끝나는 UDP 프로토콜만 드물게 예외). 잘 만든 것은 장애 조치도 다룬다. 이 문서를 쓸 때는 업체마다의 독자 기술이었다 — §2.8
- **응용 계층 게이트웨이**: 모양이 여러 가지다. NAT가 FTP처럼 주소에 기대는 프로토콜을 위해 쓰는 ALG는 응용 프로토콜의 뜻은 그대로 두고 필드를 기계적으로 바꿔 넣는다. 반대쪽 끝의 예로, **FTP와 다른 파일 전송 프로토콜(OSI·DECnet의 것) 사이의 게이트웨이**도 만들어졌다.
  어느 쪽이든 처리 중인 세션의 상태를 지녀야 하고, 그 상태를 잃으면 세션은 대개 되돌릴 수 없이 끊긴다 — §2.11
- **프록시**: 폐기된 HTTP/1.1(RFC 2616)의 웹 프록시 정의를 옮겨 적는다 — 지금의 정의는 위 RFC 9110 §3.7 줄을 쓴다. 웹 프록시는 방화벽이 나가는 HTTP 패킷을 막을 때 방화벽과 함께 쓰이기도 한다. HTTP에서 프록시는 「자발적」이라 **클라이언트가 그 프록시를 쓰도록 설정돼 있어야 한다**.
  HTTP 프록시는 IP 패킷 흐름을 끝내고 새로 만들지만 응용 세션이 그것을 지나므로 미들박스에 든다 — §2.14
- **캐시**: 원칙적으로 프록시와 다른 것이고, 여기서는 주로 사용자의 응답 시간을 줄이려는 콘텐츠 캐시를 말한다. HTTP는 프록시가 캐시로 동작하도록 만료·재검증 방법을 두므로 HTTP에서는 캐시와 프록시가 떼어 낼 수 없이 섞여 있다 — §2.15
- IP 방화벽(§2.9)·응용 방화벽(§2.10)은 `network-security` 주제(step 15)가 본다. URL을 보고 나누는 로드 밸런서(§2.18)는 step 12가 본다
- 「L3 스위치」·「L4 스위치」·「L7 스위치」라는 이름은 이 문서에 없다(전문 검색)
- **한국어 이름**: middlebox → 미들박스(이름만 — 본문은 「중간 장치」로 풀어 쓴다), load balancer → **로드 밸런서**(기출이 쓰는 이름 「로드 밸런서(Load Balancer)」 — 영문을 그대로 읽는다), application-level gateway → 응용 계층 게이트웨이(ALG — 이름만)
- (phase 82 step 9, 2026-11-19 rfc-editor.org 텍스트판을 IPv4로 다시 받아 읽음) **URL을 돌리는 로드 밸런서**(§2.18): DNS를 쓰는 방법처럼 URL 리디렉션으로 서버 묶음에 부하를 나눌 수 있고, HTTP 프록시가 HTTP 요청을 고쳐 써 서버 묶음의 한 서버로 가게 할 수도 있다. 이 장치는 응용 세션을 임의로 돌리므로 미들박스에 든다.
  이 절의 분류 칸은 **응용 계층**이고, 패킷을 돌리는 로드 밸런서(§2.8)의 분류 칸은 **여러 계층(multi-layer)**이다. 본문은 「목적지 포트 번호로 나누기도 하고, 응용 계층까지 풀어 HTTP 요청의 URL로 나누기도 한다」까지 쓰고, URL로 나누는 방법의 세부는 step 12·13이 본다
  쓰인 곳: (phase 82 step 9) `network-devices.device-layers`(부하 분산 장치 항목, 도식 `device-layers`의 「부하 분산 장치」 — 전송 계층 칸과 응용 계층 칸 둘로 가는 화살표), 문항 n327 해설(포트 번호와 URL은 부하 분산 장치가 보는 정보)
- (phase 82 step 10) 쓰인 곳: `network-devices.proxy-server`(문단 1 — 프록시가 클라이언트와의 연결을 받고 서버와 새로 연결한다, 문단 2 — 보통 클라이언트 설정에 어느 프록시를 쓸지 적어 둔다), 문항 n330 해설(§2.11 — FTP와 다른 파일 전송 프로토콜 사이의 게이트웨이도 만들어졌다)
- (phase 82 step 11) 쓰인 곳: `network-devices.load-balancing`(문단 2 — 로드 밸런서는 서버들 사이에 부하를 나눈다, 문단 3 — 한 연결에 속한 데이터는 끝날 때까지 처음 고른 서버로만 간다 — §2.8)
- (phase 82 step 12, 2026-11-20 rfc-editor.org 텍스트판을 IPv4로 다시 받아 읽음 — 판 그대로) **패킷을 돌리는 로드 밸런서**(§2.8) 다시 보기: 목적지 포트 번호에 따라 응용을 서버들로 나누는 일을 「목적지 포트 번호를 보는 IP 라우팅」으로 적는다 — IP 주소만 보는 보통의 라우팅이 아니라 포트 번호까지 본다.
  같은 응용 세션의 패킷이 모두 같은 물리 서버로 가야 하므로 상태를 지닌다. 분류 칸은 **여러 계층**(multi-layer)이다 — §2.8. **URL을 돌리는 로드 밸런서**(§2.18)는 따로 적힌 장치이고 분류 칸이 **응용 계층**이다.
  응용 계층의 정보로 판단하는 **응용 방화벽**도 따로 적힌 장치다(§2.10 — 보안은 `network-security` 주제의 몫). 곧 이 문서는 포트로 나누는 장치, HTTP 요청·URL로 나누는 장치, 응용 계층의 보안 장치를 서로 다른 칸에 둔다
- (phase 82 step 12) rfc-editor.org 사이트 검색(RFC 전체 본문)으로 「layer 4 switch(es)」·「layer-4 switch」·「layer 7 switch(es)」·「layer-7 switch」·「L7 switch(es)」·「L1 switch」·「layer 1 switch」를 찾아 하나도 없었다.
  「L4 switch」는 RFC 3143 하나, 「L4-L7 switch」는 RFC 3466 하나, 「layer 1 switches」는 RFC 5253 §3.1 하나(전달망의 TDM 스위치·광 교차 연결 장치를 가리킨다 — LAN 장비가 아니다)에 나온다 — 아래 「(phase 82 step 12) RFC 3143·RFC 3466」 항목
  쓰일 곳: (phase 82 step 13에서 쓰일 곳) `network-devices.l4-switch`(포트 번호까지 보는 로드 밸런서는 세션 상태를 지닌다, 분류는 여러 계층), `network-devices.l7-switch`(HTTP 요청·URL로 나누는 장치는 응용 계층 — 4절),
  `exam-notes.md` E43·E44, 기출 대조(`exam-notes.md` 「phase 82 step 12」 문단 — [기출 2025-11-02 #48]의 「응용 계층의 보안 기능」)

쓰인 곳: (phase 82 step 9에서 쓰일 곳) `network-devices.device-layers`(부하 분산 장치는 IP 라우터가 보지 않는 정보로 서버를 고른다 — 포트 번호(§2.8)·URL(§2.18), 계층의 세부는 step 12가 본다),
(phase 82 step 10에서 쓰일 곳) `network-devices.gateway`(FTP와 OSI·DECnet 파일 전송 프로토콜 사이의 게이트웨이 — 변환의 예, 게이트웨이는 세션 상태를 지닌다), `network-devices.proxy-server`(클라이언트가 그 프록시를 쓰도록 설정한다, 캐시와 프록시),
(phase 82 step 11에서 쓰일 곳) `network-devices.load-balancing`(로드 밸런서는 서버들 사이에 부하를 나누려고 패킷을 돌린다, 같은 세션의 패킷은 같은 서버로)

## (phase 82 step 8) RFC 2391 — Load Sharing using IP Network Address Translation (LSNAT)
https://www.rfc-editor.org/rfc/rfc2391

판(rfc-editor.org 텍스트판과 `…/rfc2391.json`, 2026-11-19): 1998-08, Informational, 폐기·개정 없음. 표준을 정하지 않는 정보성 문서이고, 이 기술에 지식 재산권 문제가 IETF에 알려졌다고 적는다(§7). NAT 라우터에 부하 분산을 더한 방식(LSNAT)을 설명하면서 부하 분산의 뜻과 분산 방식을 함께 적는다.

- 부하 분산이 필요한 까닭: 서버 한 대가 동시에 늘어나는 세션 요구를 감당하지 못할 때다. 여러 서버에 부하를 나누면 **응답성이 좋아지고** 세션 부하가 늘어도 잘 늘려 갈 수 있다. 몰리기 쉬운 응용으로 웹 브라우저·원격 로그인·파일 전송·메일을 든다 — §1
- DNS로 나누던 방법(이름 서버가 정해 둔 알고리즘으로 서버들의 레코드 차례를 주기적으로 섞는 것)의 한계: 차례를 바꾸는 주기가 몇 분 단위로 길어 **서버들의 실시간 부하 변화를 반영하지 못하고**, 서버 풀의 모든 서버가 모든 서비스를 같은 능력으로 해낸다고 가정한다 — §1
- **부하 분산의 정의**(이 문서에서): 하는 일이 비슷하거나 같은 서버 묶음(cluster)에 **세션 부하를 퍼뜨리는 것**이다. 서버 하나가 세션을 맡으면 그 세션은 끝날 때까지 그 서버에 묶이고 도중에 다른 서버로 옮기지 않는다. 모든 서비스에 할 수도, 특정 서비스에만 할 수도 있다.
  여기서 「세션 부하」는 CPU·메모리 같은 자원 사용으로 재는 「시스템 부하」와 다른 말이다 — §2.7
- **가상 서버 주소와 서버 풀**: LSNAT는 들어오는 세션을 (클라이언트 주소, 클라이언트 포트, **가상 서버 주소**, 서버 포트)로 가리고, 실시간 분산 알고리즘으로 고른 **서버 풀**의 한 서버에 묶는다. 가상 서버 주소는 비슷하거나 같은 일을 하는 서버 하나나 서버 묶음을 가리키는, 전역에서 하나뿐인 IP 주소다 — §3.
  클라이언트는 가상 서버 주소로 접속하고, LSNAT 라우터가 그 요청을 서버 풀의 한 서버로 투명하게 돌린다. 같은 클라이언트의 세션 여럿도 그때의 부하에 따라 서로 다른 서버로 갈 수 있다 — §3
- 예(그림 1): 서버 S1·S2·S3가 서버 풀을 이루고 가상 서버 주소 하나가 그 풀에 대응한다. 한 클라이언트가 가상 서버 주소로 HTTP 세션을 열면 LSNAT 라우터가 부하를 보고 S1을 골라 보내고, 다른 클라이언트의 세션은 S1이 세션을 맡아 바쁘니 S3로 보낸다.
  들어오는 패킷은 **목적지 주소(와 포트)**를 고른 서버의 것으로 바꾸고, 돌아가는 패킷은 출발지를 같은 방법으로 바꾼다 — §3.1, §4.2(예의 주소는 옮기지 않는다 — 본문은 RFC 5737의 문서용 주소를 쓴다. 주소 바꾸기의 세부는 step 12가 다시 본다)
- 서버 풀의 서버를 바꾸거나 더하거나 빼도 클라이언트는 알 필요가 없다 — LSNAT 라우터가 바뀜을 한곳에서 감춘다. 클라이언트도 서버도 고치지 않고 LSNAT 라우터만 설정하면 된다 — §1, §3.1
- 한계: 한 세션의 모든 요청과 응답이 같은 LSNAT 라우터를 지나야 하고, 세션 단위로 부하를 재므로 세션 도중에 다른 서버로 옮기지 못한다 — §1
- **분산 알고리즘**: 고르는 기준은 서버에 닿는 네트워크 비용과 서버의 자원·부하다 — §5. 서버들이 LSNAT 라우터에서 비슷한 거리에 있을 때, 서버 쪽이 끼어들지 않는 방식으로 흔히 쓰는 것은 다섯이다 — §5.1
  1. **라운드 로빈**(Round-Robin): 가장 단순한 방식으로, **서버의 부하와 상관없이** 서버를 차례대로 돌아가며 고른다
  2. **가장 적은 부하 먼저**(Least Load first): 라운드 로빈을 나아지게 한 것으로, **묶인 세션 수가 가장 적은 서버**에 새 세션을 맡긴다. 다만 세션마다 쓰는 자원이 같고 서버들의 능력이 같다고 가정한다 — 기출의 「최소 연결」(Least Connection)에 가장 가까운 정의다(TCP 세션은 SYN으로 시작하는 연결 하나다 — §2.3)
  3. 가장 적은 트래픽 먼저(Least traffic first): 서버마다 오간 패킷 수나 바이트 수를 일정 시간 세어 부하를 어림한다
  4. **가중치를 준 가장 적은 부하 먼저**(Least Weighted Load first): 관리자가 세션 종류마다(쓸 자원을 어림해) 그리고 서버마다(자원의 여유에 따라) **가중치**를 준다. 서버에 맡긴 세션 부하를 가중치로 더한 값을 그 서버의 가중치로 나눠, 가장 작은 서버에 새 세션을 맡긴다.
     예: 서버 S3를 S1보다 자원이 세 배라고 보아 S3에 가중치 3을 준다(문서의 예는 FTP 세션 5·텔넷 세션 1의 가중치로 두 서버의 값을 계산해 S3를 고른다) — 기출의 「가중 최소 연결」(Weighted Least Connection)에 가장 가까운 정의다
  5. **가장 빨리 응답하는 서버 찾기**(Ping to find the most responsive host): 서버들에 주기적으로 ping을 보내 **응답 시간**을 재어 얼마나 바쁜지 판단하고, 위 어림 방법과 함께 써서 새 세션을 맡을 서버를 고른다 — 기출의 「최소 응답 시간」(Least Response Time)에 가장 가까운 정의다(그 이름은 문서에 없다)
  서버마다 에이전트 프로그램을 두어 자원 여유를 알리게 하는 적극적인 방식이 가장 좋은 결과를 낼 것이라고 적는다 — §5.1
- 서버가 지리적으로 흩어져 있으면 라우팅 테이블의 비용과 세션 수를 곱한 값으로 고르는 방식 등이 있다 — §5.2(쓰지 않는다)
- **죽은 서버 감지**: 세션을 맡기는 서버가 살아 있는지 알아야 한다 — 모르면 세션이 멈춘 서버로 가서 사라진다. 서버에 주기적으로 ping을 보내거나, 새 세션을 맡긴 뒤 그 서버의 응답이 몇 초 안에 오지 않으면 죽었다고 보고 **새 세션을 맡기지 않는다**. 몇 분쯤 뒤 다시 세션을 맡겨 보며 살아났는지 확인할 수 있다 — §6
- **한국어 이름**: load sharing·load balancing → **부하 분산**(기출의 「부하분산」, phase 79 `dns.dns-round-robin`과 phase 81의 「부하 분산」), virtual server address → **가상 주소**(guide의 이름 — 처음에 「가상 서버 주소」로 한 번 풀어 쓸 수 있다),
  server pool → **서버 풀**(영문을 그대로 읽는 이름 — 아래 ARR 한국어판의 「서버 팜」은 같은 것을 가리키는 다른 이름), round-robin → **라운드 로빈**(기출·phase 79), Least Load first → **최소 연결**(기출의 이름 — 문서의 이름은 「가장 적은 부하 먼저」이고 세는 것은 묶인 세션 수다),
  Least Weighted Load first → **가중 최소 연결**(기출의 이름 — 문서의 이름과 계산은 위 4), 응답 시간으로 고르는 방식 → **최소 응답 시간**(기출의 이름 — 문서는 이름을 붙이지 않는다), dead host detection → 죽은 서버 감지(본문은 아래 ARR의 「상태 확인」으로 쓴다)

- (phase 82 step 11) 쓰인 곳: `network-devices.load-balancing`(문단 0 — 같거나 비슷한 일을 하는 서버 묶음에 나눈다, 문단 2 — 가상 주소는 서버 묶음을 대표하는 IP 주소 하나이고 클라이언트는 그 주소로 접속한다,
  문단 3 — 같은 클라이언트의 요청도 그때의 부하에 따라 다른 서버로 갈 수 있고, 한 연결은 끝날 때까지 처음 고른 서버가 맡으며, 서버를 더하고 빼도 클라이언트는 알 필요가 없다, 문단 4 — 응답하지 않는 서버에는 새 요청을 맡기지 않는다,
  문단 7 — 가상 주소로 온 패킷의 목적지 주소를 고른 서버의 주소로 바꾼다(NAT), 문단 8 — DNS로 나누는 방식은 서버들의 실시간 부하를 보지 못한다),
  `network-devices.balancing-methods`(라운드 로빈·최소 연결·가중 최소 연결·최소 응답 시간 항목, 가중 최소 연결의 계산 예 — 문서의 계산(서버에 맡긴 세션 부하를 가중치로 더한 값 ÷ 서버의 가중치)에 연결 하나의 부하를 1로 친 값을 넣었다,
  상태를 보는 방식과 보지 않는 방식), 문항 n332·n333·n335 해설, 도식 `load-balancer-pool`·`balancing-methods`의 캡션
- (phase 82 step 12, 2026-11-20 rfc-editor.org 텍스트판을 IPv4로 다시 받아 읽음 — 판 그대로) **주소를 바꾸는 차례**(L4 스위치가 하는 NAT의 근거):
  - 보통의 NAT는 안쪽에서 바깥으로 나가는 세션에서 주소를 바꾸기 시작하지만, LSNAT는 **바깥에서 들어오는 세션**에서 시작한다. 들어오는 세션 하나를 (클라이언트 주소, 클라이언트 포트, 가상 서버 주소, 서버 포트)의 묶음으로 가리고, 그 세션을 그때의 부하로 고른 서버 하나에 묶는다 — §3
  - TCP·UDP 세션의 패킷은 (출발지 IP 주소, 출발지 포트, 목적지 IP 주소, 목적지 포트)의 묶음으로 가려진다 — §2.2. TCP 세션의 첫 패킷은 SYN이 켜지고 ACK가 꺼진 패킷이라 알아볼 수 있다 — §2.3
  - **세션 묶기**(session binding): 들어오는 세션을 서버 풀의 한 서버 주소에 짝짓는 단계이고, 이때 정한 것이 그 세션의 뒤따르는 모든 패킷의 바꾸기 값이 된다. 고정된 짝이 아니면 세션마다 부하 분산 알고리즘으로 서버를 정한다 — §4.1
  - **주소 찾기와 바꾸기**: 짝이 정해지면 같은 연결의 뒤 패킷은 모두 그 짝을 찾아 바꾼다. 서버 쪽으로 **들어가는 패킷은 목적지 IP 주소(TCP·UDP면 목적지 포트도)**를, 서버에서 **나오는 패킷은 출발지 IP 주소(와 출발지 포트)**를 바꾸고,
    IP·TCP·UDP·ICMP 헤더의 체크섬 같은 관련 칸도 함께 고친다 — §4.2. 세션이 끝난 것을 알면 짝을 푼다 — §4.3
  - 예(§3.1·그림 1): 클라이언트가 가상 서버 주소의 80번 포트로 HTTP 세션을 열면, LSNAT 라우터가 서버 S1을 골라 그 세션 패킷의 목적지 주소를 S1의 주소로 바꿔 넘기고(포트는 80 그대로), 돌아오는 패킷도 같은 방식으로 바꾼다.
    클라이언트와 서버는 고칠 것이 없고 설정은 LSNAT 라우터에만 한다. 예의 주소는 옮기지 않는다 — 본문은 RFC 5737의 문서용 주소(guide의 `192.0.2.100`·`192.0.2.11`)로 쓴다
  - 이 문서는 이 장치를 「LSNAT 라우터」라 부른다 — 「L4 스위치」라는 이름은 없다(전문 검색)
  쓰일 곳: (phase 82 step 13에서 쓰일 곳) `network-devices.l4-switch`(가상 주소로 들어온 세션을 고른 서버에 묶고, 들어가는 패킷은 목적지 주소를, 나오는 패킷은 출발지 주소를 바꾼다, 한 연결의 뒤 패킷은 모두 같은 서버로, 클라이언트·서버는 그대로),
  `exam-notes.md` E43, 기출 대조(`exam-notes.md` 「phase 82 step 12」 문단 — [기출 2025-11-02 #48]의 NAT)
쓰인 곳: (phase 82 step 11에서 쓰일 곳) `network-devices.load-balancing`(부하 분산이 필요한 까닭과 정의, 세션 부하와 시스템 부하, 가상 주소와 서버 풀, 클라이언트는 가상 주소로 접속하고 로드 밸런서가 고른 서버로 돌린다, 서버를 더하고 빼도 클라이언트는 모른다, DNS 방식은 실시간 부하를 보지 못한다, 죽은 서버에는 새 세션을 맡기지 않는다),
`network-devices.balancing-methods`(라운드 로빈·최소 연결·가중 최소 연결·최소 응답 시간의 정의, 부하를 보지 않는 방식과 보는 방식), 기출 대조(`exam-notes.md` 「phase 82 step 8」 문단 — [기출 2024-11-03 #46]과 분산 방식 다섯 문항)

## (phase 82 step 8) RFC 7098 — Using the IPv6 Flow Label for Load Balancing in Server Farms
https://www.rfc-editor.org/rfc/rfc7098

판(rfc-editor.org 텍스트판과 `…/rfc7098.json`, 2026-11-19): 2014-01, Informational, 폐기·개정 없음. 흐름 레이블 이야기는 가져오지 않는다 — §1·§3의 서버 팜 부하 분산 일반만 가져온다.

- 부하 분포(load distribution)는 부하 분산(load balancing)보다 조금 넓은 말이지만 부하 분산이 더 널리 쓰인다. 서버 팜에서 두 말 모두 **서버 팜이 맡은 일을 여러 서버에 나눠 성능을 최적으로 만드는 방법**을 가리킨다. 서버 부하 분산은 흔히 HTTP 트래픽에 쓰지만 다른 응용에도 쓸 수 있다 — §1
- 서버 팜의 부하 분산은 여러 방법을 흔히 함께 쓴다 — §3:
  - 가장 단순한 방법은 DNS로 한 이름(예: `www.example.com`)에 대해 사용자마다 다른 서버 주소를 돌려주는 것이고, 보통 권한 있는 DNS 서버가 주소의 차례를 돌리고 클라이언트가 첫 주소를 고른다고 가정한다 — §3 첫 항목(phase 79 `dns.dns-round-robin`과 같은 방식)
  - HTTP 서버들 앞에 **7계층 역방향 프록시**를 두는 방법: 역방향 프록시가 세상에 IP 주소 하나를 내보이고, 새 클라이언트 세션(들어오는 TCP 연결과 HTTP 요청)마다 서버 하나를 골라 그 세션을 그 서버로 중계한다. 프록시는 세션이 이어지는 동안 TCP 상태와 프록시 상태를 지녀야 한다 — §3 둘째 항목
  - 많은 부하 분산 시스템의 「앞단」은 **3·4계층 로드 밸런서**이고, 전용 장치일 수도, 일부 스위치나 라우터의 표준 기능일 수도 있다 — §3 넷째 항목(세부는 step 12가 본다)
  - **지속성**(persistence)은 한 클라이언트 세션이 끝날 때까지 한 서버에서 돈다는 보장이다 — §3 넷째 항목
  - 3·4계층 로드 밸런서 가운데 **상태를 두지 않는 것**은 패킷마다 출발지 주소나 포트처럼 찾기 쉬운 정보를 **해시해 서버 번호로 바꾸어** 서버를 고르고, 상태를 두는 것은 세션의 처음 패킷에서 정한 방향을 그 세션의 모든 패킷에 지킨다 — §3 넷째 항목.
    기출의 「IP 해시」(IP Hash)에 해당하는 근거다(그 이름은 문서에 없다). 같은 출발지 주소면 같은 서버 번호가 나와 같은 서버로 간다는 것은 지속성과 이 줄에서 이어서 나오는 말이다
- 쓰지 않는 것: 흐름 레이블, 직접 서버 반환·ECMP 같은 전달 기법, SSL 역방향 프록시 팜, 전역 부하 분산
- (phase 82 step 11) 쓰인 곳: `network-devices.load-balancing`(문단 7 — 역방향 프록시가 요청을 대신 받아 안쪽 서버 하나에 보낸다, DNS로 나누기), `network-devices.balancing-methods`(해시 항목 — 클라이언트의 IP 주소 같은 값을 계산해 서버를 정하고, 같은 값이면 같은 서버로 간다)
- **한국어 이름**: server farm → **서버 팜**(아래 ARR 한국어판과 같다 — 본문은 「서버 풀」과 같은 것을 가리킨다고 한 번 밝힌다), persistence → 지속성(이름만), hash → **해시**(기출의 「IP 해시」 — 본문은 「주소 같은 값으로 계산해 서버를 정한다」로 풀어 쓴다)
- (phase 82 step 12, 2026-11-20 rfc-editor.org 텍스트판을 IPv4로 다시 받아 읽음 — 판 그대로) **7계층 역방향 프록시**(§3 둘째 항목): HTTP 서버 묶음 앞에 두는 7계층 역방향 프록시는 바깥에 IP 주소 하나를 내보이고,
  **새 클라이언트 세션 — 들어오는 TCP 연결과 그 위의 HTTP 요청 — 마다** 서버 하나를 골라 그 세션을 중계한다. 세션 동안 TCP 상태와 프록시 상태를 지녀야 한다. 곧 7계층 장치는 클라이언트의 TCP 연결을 스스로 받아들인 뒤에야 HTTP 요청을 보고 서버를 고를 수 있다
- (phase 82 step 12) **3·4계층 로드 밸런서**(§3 넷째 항목) 다시 보기: 전용 장치일 수도 있고 **일부 네트워크 스위치나 라우터의 표준 기능**일 수도 있다. 그 장치의 IP 주소가 서비스의 대표 주소로 공개되고 **모든 클라이언트 세션이 이 장치를 지난다**.
  새 세션을 실제 응용 서버들에, 또는 7계층 프록시 묶음에 나눠 맡긴다 — 3·4계층 장치를 7계층 장치들 앞에 둘 수도 있다. 들어오는 패킷마다 빨리 가려 대상 서버를 정해야 하므로 패킷마다 들여다본다 — §3 넷째 항목. 이 문서도 이 장치를 「스위치」라는 이름으로 부르지 않는다
  쓰일 곳: (phase 82 step 13에서 쓰일 곳) `network-devices.l4-switch`(바깥 요청이 모두 이 장치를 지난다, 스위치·라우터에 기능으로 들어 있기도 하다, 지속성), `network-devices.l7-switch`(TCP 연결을 받아들이고 HTTP 요청마다 서버를 골라 중계한다, 3·4계층 장치를 그 앞에 둘 수도 있다),
  `exam-notes.md` E43, 기출 대조(`exam-notes.md` 「phase 82 step 12」 문단 — [기출 2025-08-24 #50]·[기출 2026-08-02 #46]의 「외부 요청은 모두 거쳐 간다」)

쓰인 곳: (phase 82 step 11에서 쓰일 곳) `network-devices.load-balancing`(부하 분산의 뜻 — 일을 여러 서버에 나눠 성능을 최적으로, DNS 방식과 역방향 프록시 방식 — 역방향 프록시가 IP 주소 하나를 내보이고 세션마다 서버를 고른다), `network-devices.balancing-methods`(해시 — 출발지 주소 같은 값을 서버 번호로 바꾼다),
기출 대조(`exam-notes.md` 「phase 82 step 8」 문단 — 분산 방식의 오답 「IP 해시」)

## (phase 82 step 8) RFC 2816 — A Framework for Integrated Services Over Shared and Switched IEEE 802 LAN Technologies
https://www.rfc-editor.org/rfc/rfc2816

판(rfc-editor.org 텍스트판과 `…/rfc2816.json`, 2026-11-19): 2000-05, Informational, 폐기·개정 없음. 주제는 IEEE 802 LAN의 서비스 품질이다 — 장비 이름의 쓰임만 가져온다.

- 「Layer 3 switches (i.e. routers)」: 802.1D 스위치의 기능을 최소 기준으로 보고, 더 기능이 많은 2계층 스위치나 **3계층 스위치(곧 라우터)**를 쓸 수도 있다고 적은 뒤, 3계층 스위치의 동작은 이미 IETF가 표준으로 정해 두었다고 덧붙인다 — §8.7. 곧 이 문서는 **3계층 스위치를 라우터와 같은 것으로** 적는다
- 「Layer 2 switches」, 「Layer 2 device (bridge/switch)」라는 말도 쓴다 — §7, §7.2.2, §8.7. `exam-notes.md` E7은 「L2 스위치」라는 이름 그대로는 찾지 못했다고 적었는데, 이 문서가 그 이름을 지나가며 쓴다(E7의 처리 — 표준의 이름은 브리지이고 시험은 L2 스위치라 부른다 — 는 그대로 둔다)
- 3계층 스위치를 정의한 문장은 이 문서에도, 위 RFC 4949·1983·1812·3234·7098에도 없다 — 이 문서의 괄호 하나가 허용한 출처에서 찾은 쓰임의 전부다
- **한국어 이름**: Layer 3 switch → **L3 스위치**(기출의 이름 — 「3계층 스위치」로 풀어 쓴다)

쓰인 곳: (phase 82 step 9에서 쓰일 곳) `network-devices.device-layers`(「L3 스위치」라는 이름 — IETF 문서 하나가 라우터와 같은 것으로 적는다, 정의 문장은 없다), 기출 대조(`exam-notes.md` 「phase 82 step 8」 문단)

## (phase 82 step 8) Microsoft Learn — IIS 응용 프로그램 요청 라우팅(ARR)의 부하 분산: Planning Step 3: Plan IIS Web Farm Load Balancing, Using the Application Request Routing Module, Define and Configure an Application Request Routing Server Farm, HTTP Load Balancing using Application Request Routing, Scalable Web Infrastructure, Using Failed Request Tracing rules to troubleshoot Application Request Routing
https://learn.microsoft.com/en-us/iis/web-hosting/scenario-build-a-web-farm-with-iis-servers/planning-step-3-plan-iis-web-farm-load-balancing
https://learn.microsoft.com/en-us/iis/extensions/planning-for-arr/using-the-application-request-routing-module
https://learn.microsoft.com/en-us/iis/extensions/configuring-application-request-routing-arr/define-and-configure-an-application-request-routing-server-farm
https://learn.microsoft.com/en-us/iis/extensions/configuring-application-request-routing-arr/http-load-balancing-using-application-request-routing
https://learn.microsoft.com/en-us/iis/overview/scalable-web-infrastructure
https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/iis/health-diagnostic-performance/troubleshoot-arr-using-frt-rules

2026-11-19에 IPv4로 내려받아 읽은 판: 「Planning Step 3」 `updated_at` 2020-05-14(`ms.date` 2013-04-14), 「Using the Application Request Routing Module」·「Define and Configure …」·「HTTP Load Balancing …」 셋 다 2024-04-11(2008-07-02), 「Scalable Web Infrastructure」 2020-05-09(2018-03-06),
「Using Failed Request Tracing rules …」 2025-07-14(2025-01-03). 한국어판(기계 번역)은 앞 다섯을 받았다(`updated_at` 2026-10-27). 적용 대상: ARR은 IIS 7 이후에 따로 설치하는 IIS 확장이고, 이 걸음 안내들은 Windows Server 2008 이후의 IIS 7.0 이상과 ARR 버전 1을 전제로 쓴 글이다(「Define and Configure …」·「HTTP Load Balancing …」 Prerequisites).
**같은 learn.microsoft.com에 있어도 Azure 서비스의 부하 분산 문서(Application Gateway·App Service)는 쓰지 않았다.**

- **부하 분산의 뜻**: 일(workload)을 여러 웹 서버에 나누는 방법이고, 목적은 **자원을 가장 알맞게 쓰고, 요청 처리량을 가장 크게 하고, 응답 시간을 가장 짧게 하고, 서버 과부하를 피하는 것**이다 — 「Planning Step 3」 「3.1. Plan Load Balancing with ARR」
- 로드 밸런서는 여러 알고리즘으로 이 일을 한다. 가장 단순한 것 가운데 하나인 **라운드 로빈은 모든 서버에 고르게 부하를 주려고 새 요청마다 다른 웹 서버로 보낸다**. 다른 알고리즘은 응답 시간을 줄이려고 특정 종류의 요청을 특정 서버로 보낸다 — 같은 절
- ARR은 HTTP 헤더·서버 변수·부하 분산 알고리즘으로 요청을 어느 콘텐츠 서버에 넘길지 정하는 **프록시 기반의** 라우팅·부하 분산 모듈이다 — 같은 절, 「Using …」 Introduction. IP 수준에서 판단하는 하드웨어 로드 밸런서와 달리 ARR은 응용 수준에서 판단한다 — 「Using …」 「Features」 1(계층의 세부는 step 12가 본다)
- ARR로 얻는 것으로 **응용의 가용성과 확장성을 높이고** 콘텐츠 서버의 자원을 더 잘 쓰는 것을 든다 — 「Using …」 Introduction. 관리자는 서버 팜에 서버를 더하거나 빼서 응용의 가용성에 영향을 주지 않고 수요에 맞춰 용량을 늘리고 줄일 수 있다 — 「Scalable Web Infrastructure」 「Application Request Routing and Load Balancing」
- **서버 팜**: 요청을 보낼 응용 서버들의 논리적인 묶음이고, HTTP를 살피는 규칙과 부하 분산 알고리즘으로 그 안의 서버로 요청을 보낸다 — 「Define and Configure …」 Overview. ARR은 서버 그룹을 여럿 둘 수 있다 — 「Using …」 「Features」 6
- **부하 분산 알고리즘**: 사용자가 고른 알고리즘으로 HTTP 요청을 맡기에 가장 알맞은 콘텐츠 서버를 정하고, **알고리즘은 여섯 가지**다 — 「Using …」 「Features」 2, 「Planning Step 3」 「3.2」 표. 그러나 **여섯의 이름과 정의를 적은 글은 이 문서들에 없다**(전문 검색 — 이름은 화면 그림 속에만 있다).
  글로 나오는 이름은 IIS 관리자 「Load Balance」 화면의 「Load balance algorithm」 목록에서 고르는 **「Weighted round robin」**(한국어판 「가중 라운드 로빈」) 하나다. 그 화면에서 가중 라운드 로빈을 고르고 「Load distribution」을 「Even distribution」으로 둔 서버 팜은 들어오는 요청을 서버들에 **고르게** 나눈다 — 「Define and Configure …」 Step 2·Summary(화면 그림의 설명 글 포함).
  **가중치를 서로 다르게 주었을 때 몫이 어떻게 나뉘는지는 찾지 못했다**
- 실패한 요청 추적으로 남긴 ARR 기록에는 쓰인 알고리즘(Algorithm), 그 서버를 고른 까닭(RoutingReason), 그 서버로 가는 동시 HTTP 요청 수(CurrentRequests) 같은 칸이 있다 — 「Using Failed Request Tracing rules …」(동시 요청 수를 실행 중 통계로 센다는 데까지만 — 알고리즘의 정의로 쓰지 않는다)
- **상태 확인**: ARR은 콘텐츠 서버의 상태(health)를 두 방법으로 살핀다 — 실제로 오가는 요청(라이브 트래픽)으로와, 정해 둔 URL에 GET 요청을 보내는 URL 시험으로다. 라이브 트래픽 시험은 기본으로 하고, URL 시험은 더해 쓸 수 있다. URL 시험에는 응답 본문에 기대한 글자가 있는지 보는 「Response match」를 더할 수 있다 — 「HTTP Load Balancing …」 Step 2, 「Using …」 「Features」 3
- 상태 확인의 결과: 서버 하나에서 사이트를 멈추면 다음 상태 확인 뒤로 **모든 요청이 건강한 서버로만** 가고, 멈춘 사이트를 다시 켜면 다음 상태 확인 뒤로 다시 고르게 나뉜다 — 상태 확인은 **나빠졌던 서버가 다시 좋아진 것을 알아채는 데에도** 쓰인다.
  예의 시험 간격 30초는 그 안내에서 둔 값이다(기본값으로 쓰지 않는다) — 「HTTP Load Balancing …」 Step 2의 9~10과 그 뒤 확인 차례
- 클라이언트 선호도(client affinity — 쿠키로 한 클라이언트의 요청을 한 서버로 묶는다)는 있다는 것만 적는다 — 세션 유지의 구현은 가져오지 않는다(「Using …」 「Features」 4)
- (phase 82 step 11) 쓰인 곳: `network-devices.load-balancing`(문단 1 — 과부하를 피하고 처리량을 늘리고 응답 시간을 줄이며 자원을 알맞게 쓴다, 문단 2 — 서버 팜이라는 다른 이름, 문단 3 — 서버를 더하고 빼서 수요에 맞춘다,
  문단 4 — 상태 확인의 두 방법(실제로 오가는 요청과 정해 둔 URL로 보내는 요청), 응답하지 않는 서버로는 보내지 않고 다시 좋아지면 다시 보낸다, health check를 그대로 읽은 「헬스 체크」라는 이름, 문단 5 — 가용성을 높인다),
  `network-devices.balancing-methods`(라운드 로빈 — 새 요청마다 다음 서버로 넘어가 요청 수가 고르게 나뉜다), 문항 n332·n334 해설, 도식 `load-balancer-pool`
- (phase 82 step 11, 2026-11-20 learn.microsoft.com 검색으로 다시 확인) 가중 라운드 로빈에서 가중치를 서로 다르게 주었을 때 몫이 어떻게 나뉘는지는 IIS 문서(위 여섯과 「Configuring Step 3: Configure IIS Web Farm Load Balancing」)에 여전히 없다.
  같은 사이트의 Azure Application Gateway 문서에만 있어 쓰지 않았다. 그래서 `network-devices.balancing-methods`는 가중 라운드 로빈을 항목으로 두지 않고, guide의 계산 예(가중치 3·1로 요청 8개가 6개·2개)를 최소 연결의 예로 바꿨다
- **한국어 이름**: 한국어판(기계 번역)은 Application Request Routing을 「애플리케이션 요청 라우팅」, server farm을 「서버 팜」, load balancing을 「부하 분산」, Load balance algorithm을 「부하 분산 알고리즘」, Weighted round robin을 「가중 라운드 로빈」, round robin을 「라운드 로빈」,
  Health Test(화면)를 「상태 테스트」, health check(본문)를 「상태 검사」, hardware load balancer를 「하드웨어 부하 분산 장치」(목차의 문서 제목은 「하드웨어 부하 분산기」)로 옮긴다. **고른 이름**: 「응용 프로그램 요청 라우팅(ARR)」(phase 81이 application을 「응용 프로그램」으로 옮긴 것과 맞춘다 — 한국어판의 「애플리케이션 요청 라우팅」을 한 번 밝힌다), 「서버 팜」, 「부하 분산」, 「가중 라운드 로빈」,
  「상태 확인」(guide의 이름 — health check를 옮긴 말. 기출은 「헬스 체크(Health Check)」로 쓰고 한국어판은 「상태 검사」로 옮긴다는 것을 본문에서 한 번 밝힐 수 있다). **실제 한국어 IIS 관리자 화면의 이름은 확인하지 못했다**
- (phase 82 step 12, 2026-11-20 IPv4로 다시 받아 읽음 — 「Using the Application Request Routing Module」 `updated_at` 2024-04-11 그대로, 한국어판 2026-10-27) **응용 수준의 판단**: ARR은 IIS 7 이상에서 쓰는 **프록시 기반**의 라우팅 모듈로, HTTP 헤더·서버 변수·부하 분산 알고리즘에 따라 HTTP 요청을 콘텐츠 서버로 넘긴다.
  들어오는 HTTP 요청을 살피는 일은 **URL 다시 쓰기(URL Rewrite) 모듈**에 맡기므로 그 모듈이 있어야 ARR이 동작한다 — Introduction. IP 수준에서 판단하는 하드웨어 부하 분산 장치와 달리 ARR은 응용 수준에서 판단하고, URL 다시 쓰기 모듈과 함께 HTTP 헤더·서버 변수에 바탕한 라우팅 규칙을 쓸 수 있다 — 「Features」 1.
  같은 ARR이 부하 분산 알고리즘(여섯 가지)과 서버 상태 확인(실제로 오가는 요청과 URL 시험)도 한다 — 「Features」 2·3(위 「(phase 82 step 8)」 줄)
- (phase 82 step 12) **URL로 나누는 예**:
  https://learn.microsoft.com/en-us/iis/extensions/configuring-application-request-routing-arr/configure-3-tier-deployment-architecture-using-application-request-routing
  https://learn.microsoft.com/en-us/iis/extensions/url-rewrite-module/iis-url-rewriting-and-aspnet-routing
  판(2026-11-20 IPv4로 내려받음): 「Configure 3-tier deployment architecture using Application Request Routing」 `updated_at` 2024-04-11(`ms.date` 2008-07-02, IIS 7.0 이상과 ARR 버전 1 전제 — Prerequisites), 「IIS URL Rewriting and ASP.NET Routing」 2022-08-23(2008-09-04). 한국어판은 둘 다 2026-10-27
  - 3계층 배포 안내: URL 다시 쓰기 규칙이 요청의 파일 확장자(.jpg·.css)나 URL 경로(/images/)를 살펴, 그런 정적 요청은 ARR 서버가 직접 내주고 **나머지 요청은 ARR 서버 뒤의 응용 서버로 넘긴다** — 「Step 1」. 이 안내는 ARR을 **역방향 프록시**로 쓰는 경우라고 끝에 적는다 — 「Summary」
  - URL 다시 쓰기 문서: 동적 콘텐츠와 정적 콘텐츠를 서로 다른 서버에 두었을 때, URL 다시 쓰기 모듈과 ARR로 **정적 파일 요청을 모두 다른 서버로 넘기고** 동적 페이지 요청은 지금 서버가 맡게 할 수 있다(이미지 확장자로 끝나는 URL을 정적 파일 서버로 다시 쓰는 규칙이 예로 나온다) — 「Which Option Should You Use?」
  - 곧 URL의 경로 하나로 요청을 서로 다른 서버(들)에 나눌 수 있다 — guide의 예(`www.example.com/images/`로 시작하는 요청은 `IMG01`로, 나머지는 `WEB01`로)는 이 두 문서의 동작을 이름표로 옮긴 것이다(예의 이름은 문서에 없다)
  - **한국어 이름**: 한국어판(기계 번역)은 URL Rewrite를 「URL 다시 쓰기」, 3-tier를 「3계층」, reverse proxy를 「역방향 프록시」로 옮긴다
  쓰일 곳: (phase 82 step 13에서 쓰일 곳) `network-devices.l7-switch`(응용 수준에서 HTTP 헤더·URL로 판단한다, IP 수준의 장치와 다르다, 알고리즘·상태 확인도 한다, URL 경로로 서버를 나누는 예, 역방향 프록시로 동작한다), 기출 대조(`exam-notes.md` 「phase 82 step 12」 문단 — [기출 2026-02-01 #49])

쓰인 곳: (phase 82 step 11에서 쓰일 곳) `network-devices.load-balancing`(부하 분산의 뜻과 목적 — 자원 사용·처리량·응답 시간·과부하, 로드 밸런서는 프록시 기반일 수 있다, 서버 팜, 가용성과 서버를 더하고 빼기, 상태 확인의 두 방법과 결과 — 응답하지 않는 서버로는 보내지 않고 다시 좋아지면 다시 보낸다),
`network-devices.balancing-methods`(라운드 로빈 — 새 요청마다 다른 서버, 「가중 라운드 로빈」이라는 이름, 알고리즘은 여럿이고 정의는 RFC 2391·7098에서), 기출 대조(`exam-notes.md` 「phase 82 step 8」 문단 — [기출 2024-02-25 #47]·[기출 2025-05-25 #47]·[기출 2026-05-17 #49])

## (phase 82 step 12) RFC 9569 — The Application-Layer Traffic Optimization (ALTO) Transport Information Publication Service (TIPS)
https://www.rfc-editor.org/rfc/rfc9569

판(rfc-editor.org 텍스트판과 `…/rfc9569.json`, 2026-11-20): 2024-09, Proposed Standard, 폐기·개정 없음. 주제는 ALTO라는 다른 프로토콜이다 — 부하 분산의 두 방식을 가르는 §8.1의 말만 가져온다.

- **4계층 부하 분산**(Layer 4 load balancing)은 요청을 **TCP 5-tuple**로 나누는 방식이라고 괄호로 풀어 적는다. 그래서 같은 정보에 대한 요청이라도 다른 TCP 연결로 오면 다른 서버로 갈 수 있다(이 문서는 그것이 문제가 되는 경우를 든다) — §8.1
- **7계층 로드 밸런서**(Layer 7 load balancers)는 요청을 **URI의 한 부분(경로)**으로 나눌 수 있어, 같은 정보에 대한 요청을 늘 같은 서버로 가게 설정할 수 있다 — §8.1. 서로 다른 경로의 요청을 서로 다른 물리 서버로 보내는 것도 7계층 부하 분산으로 한다 — 부록 A
- 곧 이 문서는 **4계층과 7계층을 「무엇을 보고 나누는가」로 가른다** — 연결의 주소·포트(5-tuple)인가, 요청의 URI인가. 「스위치」라는 이름은 쓰지 않는다
- 「Layer 4 load balancer」라는 말은 RFC 7609(2015-08, Informational — 클러스터의 가상 IP 주소를 지니고 들어오는 TCP 연결을 서버들에 나누는 장치)와 RFC 8684(2020-03, Proposed Standard — 지나가며)에도 나온다(rfc-editor.org 사이트 검색). 본문의 근거로는 이 문서의 §8.1이면 충분하다
- 5-tuple이 무엇인지는 이 문서가 풀지 않는다 — 아래 RFC 6437 항목
- **한국어 이름**: Layer 4 load balancing → 4계층 부하 분산, Layer 7 load balancer → 7계층 로드 밸런서(본문은 「전송 계층 정보로 나누는 부하 분산 장치」·「응용 계층 정보로 나누는 부하 분산 장치」로 풀어 쓰고 표준의 이름을 한 번 밝힌다)

쓰인 곳: (phase 82 step 13에서 쓰일 곳) `network-devices.l4-switch`(5-tuple로 나눈다), `network-devices.l7-switch`(URI의 경로로 나눈다, L4·L7이 무엇을 보고 나누는가로 갈린다 — 4절), `exam-notes.md` E43·E44

## (phase 82 step 12) RFC 6437 — IPv6 Flow Label Specification
https://www.rfc-editor.org/rfc/rfc6437

판(rfc-editor.org 텍스트판과 `…/rfc6437.json`, 2026-11-20): 2011-11, Proposed Standard, 폐기·개정 없음. 흐름 레이블 이야기는 가져오지 않는다 — 「5-tuple」이 무엇인지만 가져온다.

- 흐름을 가르는 장치들은 전통적으로 **출발지 주소·목적지 주소·출발지 포트·목적지 포트·전송 프로토콜의 종류** 다섯 값(5-tuple)을 써 왔다 — §1. 흐름을 흔히 이 5-tuple이 같은 패킷들의 묶음으로 정의한다 — §3
- **한국어 이름**: 5-tuple → 「주소·포트·프로토콜의 다섯 값」으로 풀어 쓴다(이름 「5-tuple」은 한 번 밝힐 수 있다)

쓰인 곳: (phase 82 step 13에서 쓰일 곳) `network-devices.l4-switch`(L4 스위치가 보는 값 — 출발지·목적지 IP 주소, 출발지·목적지 포트 번호, 프로토콜), 위 RFC 9569 항목

## (phase 82 step 12) RFC 3143·RFC 3466 — 「L4 switch」·「L4-L7 switch」라는 이름이 나오는 곳
https://www.rfc-editor.org/rfc/rfc3143
https://www.rfc-editor.org/rfc/rfc3466

판(rfc-editor.org 텍스트판과 json, 2026-11-20): RFC 3143은 2001-06, Informational, 폐기·개정 없음. **RFC 3466은 2003년(문서 머리 2003-02, json 2003-03), Informational이고 RFC 7336으로 폐기됐다** — 역사 기록으로만 쓴다. 대체한 RFC 7336(2014-08, Informational)에는 서버 팜·스위치의 설명이 없다(전문 검색).

- RFC 3143은 웹 프록시·캐시의 알려진 문제를 늘어놓은 문서다. 가로채기 프록시가 IP 주소에 기댄 인증을 깨뜨린다는 문제의 우회책으로, 가로채는 장치에서 IP 필터를 걸어 그런 서버로 가는 요청은 비켜 가게 하라고 적으면서 그 장치를 괄호로 「L4 switch」라 부른다 — §2.2.3.
  여기서 「L4 switch」는 웹 요청을 가로채 캐시로 돌리는 장치를 가리킬 뿐이고, 정의하지 않으며 서버 부하 분산 장치를 가리키지도 않는다
- RFC 3466 §2.3(서버 팜)은 서버 팜이 흔히 OSI 4~7계층의 정보를 쓰는 「지능형」·「콘텐츠」 스위치를 쓰고 그 스위치가 요청을 살펴 서버 묶음에 나눈다고 적는다. 서버 팜의 목표로 서버 여럿을 원 사이트 하나처럼 보이게 하기, 요청을 서버 모두에 고르게 나누기, 고장 난 서버를 피해 보내기,
  한 사용자 에이전트의 세션을 같은 서버로 보내기를 들고, 그림에서 그 장치를 「L4-L7 switch」라 이름 붙인다 — §2.3. 폐기된 문서라 본문의 근거로 쓰지 않는다 — 이런 이름이 IETF 문서에 나온 적이 있다는 기록으로만 둔다
- 「layer 4 switch」·「layer-4 switch」·「layer 7 switch」·「L7 switch」는 RFC 어디에도 없다(위 RFC 3234 항목의 「(phase 82 step 12)」 줄)
- **판단**: 시험의 「L4 스위치」·「L7 스위치」는 표준이 정의한 이름이 아니다 — `exam-notes.md` E43

쓰인 곳: `exam-notes.md` E43(이름의 처리), (phase 82 step 13에서 쓰일 곳) `network-devices.l4-switch`·`network-devices.l7-switch`(「자격시험은 … 라 부른다」 한 줄의 근거)

## (phase 82 step 12) IEEE 802.3af·802.3at·802.3bt — PoE(Power over Ethernet): 표준 개요 페이지, 태스크 포스 문서(PAR·목표·요구 사항·5대 기준), 4쌍 PoE 관심 요청(CFI) 발표
https://standards.ieee.org/ieee/802.3af/1090/
https://standards.ieee.org/ieee/802.3at/4553/
https://standards.ieee.org/ieee/802.3bt/6749/
https://standards.ieee.org/ieee/802.3/10422/
https://www.ieee802.org/3/af/index.html
https://www.ieee802.org/3/af/PAR-802-3af.pdf
https://www.ieee802.org/3/af/objectives.pdf
https://www.ieee802.org/3/af/requirements.pdf
https://www.ieee802.org/3/at/index.html
https://www.ieee802.org/3/at/P802d3at_PAR.pdf
https://www.ieee802.org/3/at/objectives.html
https://www.ieee802.org/3/bt/index.html
https://www.ieee802.org/3/bt/P802d3bt_PAR.pdf
https://www.ieee802.org/3/bt/P802d3bt_objectives.pdf
https://www.ieee802.org/3/4PPOE/5Criteria.pdf
https://www.ieee802.org/3/cfi/0313_2/CFI_02_0313.pdf

판(2026-11-20 IPv4로 내려받음):
- 개요 페이지 — 802.3af-2003(이사회 승인 2003-06-12, 발행 2003-06-17), 802.3at-2009(승인 2009-09-11, 발행 2009-10-30), 802.3bt-2018(승인 2018-09-27, 발행 2019-01-31) 셋 다 **「Superseded」**(뒤 판의 IEEE Std 802.3에 합쳐졌다).
  지금 판은 **IEEE 802.3-2022**(Active, 2022-05-13 승인, 802.3da-2026 같은 개정이 붙어 있다)이고, 개요가 「정해진 꼬임 쌍선 물리 계층 위에서 전원을 공급하는 일」을 다루는 기능으로 든다. 다음 판(P802.3)은 PAR 단계(2025-12-10 승인)다
- 태스크 포스 문서는 **표준 본문이 아니다** — 802.3af PAR(2000-01-30 승인), 802.3af 목표(1999-11 연구 그룹), **802.3af 요구 사항 문서(2000-11 — 「승인되지 않은 작업 문서」라고 스스로 적는다)**, 802.3at PAR·목표(2008-11 갱신),
  802.3bt PAR·목표(2013-05·07 채택, 2017-03 갱신), 4쌍 PoE 연구 그룹의 5대 기준(2013-07), 4쌍 PoE CFI(2013-03 — 회원들의 발표 자료)
- 본문의 자리: 802.3af·802.3at의 PoE는 802.3의 **Clause 33**이다(4쌍 PoE 5대 기준 — 「Clause 33, 유일한 DTE Power via MDI(PoE) 절」, CFI — 「IEEE Std 802.3-2012 Clause 33」). 802.3bt의 4쌍 PoE는 2017-01 결정으로 **따로 된 새 절**로 옮겨졌다(802.3bt 목표 3쪽). 새 절의 번호는 이 문서들에서 확인하지 못했다

- **PoE가 무엇인가**: 802.3 인터페이스를 가진 장치에 **평형 케이블(꼬임 쌍선)로 전원을 공급하는 방법**을 정한다 — 802.3af PAR 「Scope」. 목적은 전력을 적게 쓰고 LAN에 이어지는 새 종류의 장치에 전원을 주는 것이다 — 802.3af PAR 「Purpose」.
  10BASE-T·100BASE-TX(1000BASE-T도 검토) 장치 하나에 꼬임 쌍선 링크 구간으로 경제적으로 전원을 주는 것이 처음 목표였다 — 802.3af 목표 (1). 처음 표준의 이름은 「MDI를 통한 DTE 전원(DTE Power via MDI)」이고, 「Power over Ethernet(PoE)」라는 이름은 802.3bt의 제목·개요와 4쌍 PoE 5대 기준이 쓴다
- **PSE와 PD**: 전원을 주는 쪽은 **PSE**(Power Sourcing Equipment), 받는 쪽은 **PD**(Powered Device)다. PSE는 링크의 끝에 있을 수도, MDI들 사이의 중간(미드스팬)에 따로 있을 수도 있고, 링크 구간을 거쳐 PD에 전원을 준다 — 802.3af 개요
- **검출**: PSE는 **검출 절차로 호환되는 PD를 호환되지 않는 장치와 가려**, 호환되지 않는 장치에는 전원을 넣지 않아 망가뜨리지 않는다. 전원을 넣은 뒤에도 PD가 전원을 계속 원한다는 신호를 살펴, 더는 필요 없으면 전원을 끊는다 — 802.3af 개요.
  전원이 있는 장치와 없는 장치 모두에서 동작하는 검출 기능은 처음부터의 목표였다 — 802.3af 목표 (4). 작업 문서는 저항으로 상대를 알아보는 방식을 골랐다고 적는다 — 요구 사항 16(2000-11 작업 문서)
- **분류**: PD가 쓸 전력의 등급을 PSE에 알리는 분류가 있다 — 802.3at 목표 9(PoE Plus 모드로 분류를 넓힌다), 802.3bt 개요(협상 때 주고받는 전력 분류 정보를 넓혀 전력 관리를 쓸모 있게 한다). 등급표는 가져오지 않는다
- **전원과 전압**: 직류(DC) 전원을 보낸다 — 802.3af 요구 사항 8. PSE의 출력 전압을 **44~57V 직류 범위**로 하자는 결정이 적혀 있다 — 요구 사항 18(2000-11 작업 문서 — 승인된 표준 본문의 값이 아니다).
  4쌍 PoE CFI의 손실 계산 예는 PD 쪽 전압 48V를 예로 쓴다(CFI 10쪽 — 계산을 위한 예). **「표준 전압은 48V」라는 문장은 찾지 못했다**
- **쌍**: 802.3af·802.3at(Clause 33)는 네 쌍 가운데 **두 쌍**(1-2·3-6 또는 4-5·7-8)으로 전원을 보내고 둘 중 한 배치만 쓴다 — CFI 7쪽 「Definitions」, 요구 사항 1·12. 802.3bt는 **네 쌍을 모두 써서** PD가 받을 수 있는 최대 전력을 늘렸다 — 802.3bt 개요·PAR 「Scope」
- **규격마다의 전력(문서가 보이는 값만 — 모두 PD 쪽 값이다)**:
  - 802.3af: 802.3at의 목표 표가 802.3af PSE로 동작하는 PD의 경계를 **12.95W**로 둔다 — 그보다 적게 쓰는 PoE Plus PD는 802.3af PSE에서 동작하고, 더 쓰는 PD는 802.3af PSE에 이으면 사용자에게 알려야 한다(802.3at 목표 14, 2008-11).
    곧 802.3af로 PD가 받는 전력은 12.95W까지다(표에서 나오는 말 — 「802.3af는 12.95W」라는 문장 자체는 없다)
  - 802.3at: PoE Plus(802.3at)는 PD에서 **적어도 24W**를 목표로 했다(목표 6 — 2008-03에 30W를 지우고 24W로 바꿨다). 그 결과가 합쳐진 IEEE Std 802.3-2012 Clause 33의 **PD 최대 전력은 25.5W**다 — 4쌍 PoE CFI 11쪽(2013-03 회원 발표)
  - 802.3bt: PD에서 **적어도 49W**를 목표로 했다 — 802.3bt 목표 2쪽(2013-07). **표준이 정한 최종 값은 이 step이 읽은 공개 문서에서 찾지 못했다**(태스크 포스 회의 자료 목록의 「Type 3·Type 4」 발표들은 진행 중의 제안이라 쓰지 않았다)
  - PSE 쪽에서 포트가 내보내는 전력의 값은 찾지 못했다
- **쓰는 장치와 까닭**: IP 전화기 규격을 만들던 TIA가 쓸 전원 규격을 802.3에 청한 것이 802.3af의 계기다 — 802.3af PAR 9. 802.3at은 여러 대역의 무선 AP와 제어할 수 있는(controllable) 보안 카메라처럼 802.3af보다 많은 전력이 필요한 장치 때문에(PAR 5.5),
  802.3bt는 씬 클라이언트·여러 무선을 쓰는 AP·상하좌우로 움직이고 확대하는(PTZ) 카메라·디지털 사이니지·빌딩 자동화·산업용 센서처럼 더 많은 전력이 필요한 장치 때문에 만들었다(PAR 5.5). 4쌍 PoE 5대 기준은 **어떤 곳에서는 교류(AC) 전원을 따로 마련하는 비용이 LAN을 쓰는 데 걸림돌**이라고 적는다
- 유형(Type) 1~4라는 이름은 802.3bt 태스크 포스 발표 제목(예: 「Type 3/4 PSE … Type 1/2 PD」)에만 보인다 — 어느 유형이 어느 규격의 것인지 정한 문장은 찾지 못해 쓰지 않는다
- **한국어 이름**: Power over Ethernet → **PoE**(풀어 쓰면 「이더넷 케이블로 전원 보내기」), Power Sourcing Equipment → **PSE**(전원을 주는 장치), Powered Device → **PD**(전원을 받는 장치), mid-span → 미드스팬(이름만 — 「링크 중간에 끼우는 전원 장치」로 풀어 쓴다),
  detection → **검출**, classification → 분류(이름만), Maintain Power Signature → 이름은 쓰지 않는다(「전원을 계속 원한다는 신호」로 풀어 쓴다)

쓰인 곳: (phase 82 step 14에서 쓰일 곳) `network-devices.poe`(PoE의 뜻과 목적, PSE·PD, 미드스팬, 검출과 전원 끊기, 직류, 두 쌍과 네 쌍, 규격 셋의 해와 PD 쪽 전력, 쓰는 장치, 교류 전원을 마련하기 어려운 곳), 기출 대조(`exam-notes.md` 「phase 82 step 12」 문단 — [기출 2024-05-19 #50]·[기출 2025-11-02 #50])

## (phase 82 step 12) RFC 3621 — Power Ethernet MIB, RFC 7603 — Energy Management (EMAN) Applicability Statement
https://www.rfc-editor.org/rfc/rfc3621
https://www.rfc-editor.org/rfc/rfc7603

판(rfc-editor.org 텍스트판과 json, 2026-11-20): RFC 3621은 2003-12 Proposed Standard, RFC 7603은 2015-08 Proposed Standard, 둘 다 폐기·개정 없음.

- RFC 3621은 802.3af의 PSE를 관리하는 MIB다. IP 전화가 데이터와 같은 기반 시설 위에서 돌게 되면서 **신호를 보내는 바로 그 케이블로 전화기에 전원도 주는 일**을 802.3 작업 그룹이 표준으로 만들기 시작했다고 적는다 — §3.
  약어 PSE(Power Sourcing Equipment)·PD(Powered Device)는 802.3af가 정한 것을 그대로 쓴다 — §3. PSE 장치의 예로 **전원 이더넷을 지원하는 이더넷 스위치**와 미드스팬 상자를 든다 — §4
- 포트마다의 검출 상태 값으로 꺼짐·찾는 중(searching)·전원 공급 중(deliveringPower)·고장 등을 두고(§5 `pethPsePortDetectionStatus` — 802.3af의 PSE 상태도를 따른다), 올바르지 않은 신호를 만난 횟수를 센다(§5 `pethPsePortInvalidSignatureCounter`).
  분류는 단말을 전력 소비에 따라 꼬리표 붙이는 방법이고, IP 전화·무선 LAN AP 같은 장치를 전력 요구에 따라 나눈다 — §5 `pethPsePortPowerClassifications`(등급의 뜻은 IEEE 규격이 정한다고 적는다)
- RFC 7603 §2.2: PSE 장치(**예: PoE 스위치**)는 USB나 이더넷 같은 매체로 PD(예: 탁상용 전화기)에 전원을 준다. 포트마다 전원을 켜고 끌 수 있고 대개 실제로 준 전력을 잰다. PD는 **연결 하나로 네트워크 연결과 전원을 함께 받는다**.
  대상 장치로 IP 전화·무선 AP·IP 카메라를 들고, PoE 장치는 전원을 주는 스위치 포트에 이어진다고 적는다 — §2.2. 일부 PoE 스위치는 이어진 장치의 소비 전력을 잴 수 있다 — §1.3
- 「PoE 스위치」라는 이름은 이 표준 문서(RFC 7603)에 PSE의 예로 나온다 — 시험의 이름과 맞으므로 E 항목을 만들지 않는다. RFC 6988(2013-10, Informational)도 포트마다 전원을 주는 장비의 흔한 예로 PoE 스위치를 든다
- **한국어 이름**: PoE switch → **PoE 스위치**(PoE로 전원을 주는 스위치 — PSE 노릇을 한다), Power over LAN·power Ethernet → 이름은 쓰지 않는다(PoE로 통일한다)

쓰인 곳: (phase 82 step 14에서 쓰일 곳) `network-devices.poe`(PSE·PD의 예, PoE 스위치, 연결 하나로 데이터와 전원, IP 전화·무선 AP·IP 카메라, 포트마다 전원을 켜고 끈다 — 4절 「PoE 스위치와 일반 스위치」의 근거), 기출 대조(`exam-notes.md` 「phase 82 step 12」 문단)

## (phase 82 step 12) RFC 4578 — Dynamic Host Configuration Protocol (DHCP) Options for the Intel Preboot eXecution Environment (PXE)
https://www.rfc-editor.org/rfc/rfc4578

판(rfc-editor.org 텍스트판과 `…/rfc4578.json`, 2026-11-20): 2006-11, Informational, 폐기·개정 없음. IANA가 옵션 93·94·97과 128~135를 이 문서에 이어 두었다 — §4.

- PXE는 **Intel이 정한 사양**이다 — 이 문서는 Intel의 PXE 사양과 EFI 사양이 정한 DHCP 옵션을 IETF에 기록해 두려고 적은 것이다 — §1. 제목도 「Intel Preboot eXecution Environment(PXE)」다. Intel의 사양 자체는 허용 목록 밖이라 열지 않았다
- PXE를 따르는 클라이언트는 DHCP 옵션으로 **부팅하는 기계와 운영 체제가 올라오기 전의 실행 환경**을 알려, DHCP 서버나 PXE 부팅 서버가 그 기계에 맞는 **운영 체제 부팅 이미지(또는 부팅 전 응용)의 이름과 서버**를 돌려주게 한다 — Abstract, §1
- 옵션 셋 — 클라이언트 시스템 구조의 종류(93 — 예: x86 PC, EFI x86-64), 클라이언트 네트워크 인터페이스 식별자(94 — 지금 정한 종류는 UNDI 하나이고, 그 판으로 1·2세대 **PXE 부팅 ROM**을 가른다), 클라이언트 기계 식별자(97 — GUID).
  셋 모두 PXE 클라이언트·서버가 보내는 DHCP·PXE 패킷에 반드시 들어간다 — §2.1~§2.3
- 이 문서는 부팅 파일을 무엇으로 받는지 말하지 않는다 — TFTP는 위 「(phase 73 step 1) RFC 951 — …, RFC 2131 — …」 항목과 아래 Microsoft Learn 항목
- **한국어 이름**: Preboot Execution Environment → **PXE**(Microsoft 한국어판은 「사전 부팅 실행 환경(PXE)」 — 아래 항목), boot ROM → 부팅 ROM(이름만), bootstrap image → 부팅 이미지

쓰인 곳: (phase 82 step 14에서 쓰일 곳) `network-devices.pxe`(PXE는 Intel이 정한 사양, PXE 클라이언트가 DHCP로 자기 구조를 알리고 맞는 부팅 이미지의 이름과 서버를 받는다, 네트워크 인터페이스의 부팅 ROM), 기출 대조(`exam-notes.md` 「phase 82 step 12」 문단 — [기출 2026-05-17 #50])

## (phase 82 step 12) Microsoft Learn — PXE와 WDS: Configure a PXE server to load Windows PE, About the Windows Deployment Services API, Windows Deployment Services (WDS) boot.wim support, Features removed or no longer developed in Windows Server; PnP·PE: Introduction to Plug and Play, PE Format
https://learn.microsoft.com/en-us/windows/deployment/configure-a-pxe-server-to-load-windows-pe
https://learn.microsoft.com/en-us/windows/win32/wds/about-the-windows-deployment-services-api
https://learn.microsoft.com/en-us/windows/deployment/wds-boot-support
https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server
https://learn.microsoft.com/en-us/windows-hardware/drivers/kernel/introduction-to-plug-and-play
https://learn.microsoft.com/en-us/windows/win32/debug/pe-format

2026-11-20에 IPv4로 내려받아 읽은 판: 「Configure a PXE server to load Windows PE」 `updated_at` 2025-06-04(`ms.date` 2022-11-23, 적용 대상 Windows 10), 「About the Windows Deployment Services API」 2025-03-11(2018-05-31), 「WDS boot.wim support」 2026-09-21(2026-09-18),
「Features removed or no longer developed in Windows Server」 2026-11-17(2026-11-16), 「Introduction to Plug and Play」 2025-05-01(2025-04-23), 「PE Format」 2026-09-10(2026-09-10). 한국어판(기계 번역)도 받았다(`updated_at` 2026-07-06~2026-11-17).
같은 사이트의 「Understand PXE boot in Configuration Manager」는 같은 차례를 더 자세히 적지만 Windows Server·Windows 문서가 아니라 쓰지 않았다.

- **PXE 부팅의 차례**(「Configure a PXE server …」 「PXE boot process summary」): 클라이언트가 PXE 서버에 닿으면(다른 서브넷이면 라우터·스위치의 IP 헬퍼가 요청을 넘겨 준다) PXE 서버가 DHCP 옵션 60(클라이언트 식별자 PXEClient)·66(부팅 서버 호스트 이름)·67(부팅 파일 이름)을 보낸다.
  클라이언트는 옵션 67의 부팅 파일(네트워크 부팅 프로그램)을 **TFTP 서버에서 내려받아** 실행하고, 그 프로그램이 부팅 관리자와 부팅 설정 파일을, 부팅 관리자가 다시 Windows PE 이미지를 TFTP 서버의 같은 폴더에서 내려받아 Windows PE를 시작한다. 그 뒤 Windows PE의 도구로 디스크를 준비하고 네트워크의 Windows 이미지로 운영 체제를 설치한다.
  필요한 것은 PXE 클라이언트 요청에 답하도록 설정한 DHCP 서버(또는 DHCP 프록시), 부팅 파일을 두는 TFTP 서비스를 돌리는 PXE 서버, 파일 서버이고, 셋을 한 컴퓨터에 둘 수도 있다 — 「Prerequisites」. 이 안내의 목적은 **클라이언트 컴퓨터를 네트워크에서 부팅해 네트워크로 Windows를 설치하는 것**이다 — 도입부
- **WDS**(Windows 배포 서비스): 네트워크로 Windows 운영 체제를 배포하는 구성 요소 묶음이다. 서버 쪽 구성 요소에 **PXE 서버와 TFTP 서버**가 있어 컴퓨터를 네트워크에서 부팅해 운영 체제를 올리고 설치하게 하고, 클라이언트 쪽은 Windows PE(Windows 사전 설치 환경) 안에서 돌며 설치할 이미지를 고르는 화면이다 — 「About the WDS API」
- **WDS의 지금 상태**: 「Features removed …」는 WDS 서버 역할(역할 서비스·관리 도구·**WDS가 주는 PXE 기능** 포함)을 **Windows Server 2028부터 더 이상 개발하지 않는(deprecated) 기능**으로 올렸다 — 그 판은 아직 미리 보기이고 계획이 바뀔 수 있다고 함께 적는다.
  이 문서에서 「더 이상 개발하지 않음」은 기능이 아직 Windows Server에 들어 있고 운영에 지원되며 보안·품질 업데이트를 받지만, 뒤 판에서 빠질 수 있다는 뜻이다. 대신 Configuration Manager로 옮기기를 권한다.
  「WDS boot.wim support」도 Windows Server 2025 다음 판부터 WDS(역할·서비스·도구·PXE 부팅 기능)를 더 이상 개발하지 않는다고 적는다. 설치 미디어의 `boot.wim`으로 Windows 설치를 WDS 모드로 돌리는 방식은 Windows 11과 Windows Server 2025부터 막혔지만 **WDS의 PXE 부팅 자체는 영향을 받지 않는다**(직접 만든 부팅 이미지로는 여전히 PXE 부팅할 수 있다)고 적는다.
  곧 Windows Server 2025까지는 WDS가 들어 있다 — 본문은 「Windows Server에는 PXE 부팅으로 운영 체제를 설치하게 하는 WDS 역할이 있고, 다음 판부터 더 이상 개발하지 않는다고 예고됐다」까지 한 줄로 쓸 수 있다
- **PnP**(플러그 앤 플레이): 사용자가 거의 손대지 않아도 컴퓨터가 하드웨어의 바뀜에 맞추게 하는 Windows의 부분이다 — 장치를 붙이거나 떼도 손으로 설정할 필요가 없다(예: 노트북을 도킹 스테이션에 꽂으면 거기 이어진 키보드·마우스·모니터를 바로 쓴다). 장치 하드웨어·시스템 소프트웨어·드라이버가 함께 받쳐야 한다 — 「Introduction to Plug and Play」. 네트워크 부팅과 상관이 없다
- **PE**(Portable Executable): Windows 계열 운영 체제의 **실행 파일(이미지 파일) 형식**의 이름이다(목적 파일 형식은 COFF). 「이식 가능」은 그 형식이 특정 프로세서 구조에 묶이지 않는다는 뜻이다 — 「PE Format」. 네트워크 부팅과 상관이 없다.
  이름이 비슷한 **Windows PE**(Windows 사전 설치 환경 — 위 PXE 차례에서 내려받아 시작하는 작은 Windows)와는 다른 것이다. 시험의 오답 「PE(Portable Executable)」는 실행 파일 형식 쪽이다
- **한국어 이름**: 한국어판은 Windows Deployment Services를 「Windows 배포 서비스(WDS)」, Preboot Execution Environment를 「사전 부팅 실행 환경(PXE)」, Windows PE를 「Windows PE(Windows 사전 설치 환경)」, Plug and Play를 「PnP(플러그 앤 플레이)」, Portable Executable을 「PE(이식 가능한 실행 파일)」, boot file name을 「부팅 파일 이름」으로 옮긴다.
  **고른 이름**: 「PXE(사전 부팅 실행 환경)」 — 본문은 「네트워크 부팅」으로 풀어 쓴다, 「Windows 배포 서비스(WDS)」, 「PnP(플러그 앤 플레이)」, 「PE(Portable Executable — 실행 파일 형식)」

쓰인 곳: (phase 82 step 14에서 쓰일 곳) `network-devices.pxe`(PXE 부팅의 차례 — DHCP로 부팅 서버·부팅 파일 이름 → TFTP로 내려받기 → 실행, 네트워크로 운영 체제를 설치하는 쓰임, WDS의 PXE·TFTP 서버와 지금 상태, PnP·PE를 한 줄로 가를 근거 — 4절은 「PXE와 PoE」), 기출 대조(`exam-notes.md` 「phase 82 step 12」 문단 — [기출 2026-05-17 #50])
