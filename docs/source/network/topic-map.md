# 네트워크 과목의 주제 지도 — 강의 22개와 강의 밖 20개

네트워크 과목에 둘 주제 42개의 지도다. 강의가 다루는 주제 22개(`lecture-outline.md` 「주제 지도」)와, 강의는 다루지 않지만
네트워크관리사 2급 필기가 묻는 범위를 나눈 주제 20개를 **앱의 주제 순서**대로 늘어놓고, 주제마다 기출 문항 수·출제 회차·별점·만들 phase를 적는다.
목표 자격증을 네트워크관리사 2급으로 정하고 강의 밖 출제 범위도 넣기로 한 것은 사용자 결정이다(2026-10-27). 별점 규칙과 phase 순서는 2026-10-28에 정했다.

- 주제 순서는 강의 순서를 뼈대로 하고, 강의 밖 주제는 내용이 가까운 강의 주제 곁에 둔다. 주제를 만드는 phase는 `topics.json`의 배열을 이 순서대로 둔다.
- 숫자는 기출 분석(`raw/exam/exam-analysis.md` 「부록」과 `raw/exam/data.txt` — gitignore라 로컬에만 있다)의 문항별 분류로 다시 센 것이다.
  기출 문장은 옮기지 않았다(ADR-057). 이 문서에 있는 것은 숫자와, 직접 쓴 묶음 이름·메모뿐이다.
- 강의 밖 주제의 사실은 강의·면접이 아니라 아래 「출처 영역」의 공식 문서에서 가져온다. 출처를 쓰는 규칙은 `docs/source/network/CLAUDE.md`가 정한다.

## 별점 규칙

별점은 주제 단위다. 기출 11회 가운데 그 주제의 문항이 하나라도 나온 회의 수(**출제 회차**, 0~11)로 정한다.
11회는 2024-02-25, 2024-05-19, 2024-08-25, 2024-11-03, 2025-02-23, 2025-05-25, 2025-08-24, 2025-11-02, 2026-02-01, 2026-05-17, 2026-08-02 필기다.

| 출제 회차 | 별점 | `importance` |
|---|---|---|
| 9~11 | ★★★ | 3 |
| 6~8 | ★★☆ | 2 |
| 0~5 | — | 0 |

문항 수가 아니라 회차로 매기는 것은, 문항 수는 주제가 클수록 많아지지만 회차는 「다음 시험에도 나올까」에 가깝기 때문이다.
별점의 뜻은 AWS 과목과 같다 — 무엇을 먼저 읽을지를 정하는 값이다(ADR-026).

## 이 지도를 바꾸는 법

- **새 기출 회차를 더하면** 모든 주제의 문항 수·회차·별점을 다시 센다. 위 별점 경계(9·6)는 11회를 기준으로 정한 것이라 회차 수가 바뀌면 경계도 함께 본다.
- **주제를 더하거나 나누거나 합치려면 ADR이 필요하다.** 주제 목록이 곧 과목의 범위이기 때문이다. 주제 id는 바꾸지 않는다 — 데이터 테스트와 뒤 phase가 이 id로 일한다.
- 문항을 어느 주제에 넣을지 판단을 바꾸면 아래 「분류 메모」를 고치고 숫자를 다시 센다.
- 별점은 `src/data/network/topics.json`의 `importance`와 그것을 지키는 `src/data/network/data.test.ts`의 표에도 들어간다. 이 지도를 바꾸면 그 둘도 함께 바꾼다.

## 주제 지도

「출처」 열이 `강의`로 시작하면 강의 주제이고, 쪽 번호는 그 주제의 `sourcePages`(통합본 쪽)다. `공식 문서`로 시작하면 강의 밖 주제다.
「문항」은 기출 550문항 가운데 그 주제로 분류한 수, 「회차」는 출제 회차다.

| 순서 | 주제 id | 제목 | 출처 | 문항 | 회차 | 별점 | phase |
|---|---|---|---|---|---|---|---|
| 1 | `network-basics` | 네트워크의 구성과 성능 | 강의 Ch1-1, Ch1-4 · p1–47 | 6 | 6/11 | ★★☆ | 69·70 |
| 2 | `protocols-encapsulation` | 패킷 교환·프로토콜·계층 모델 | 강의 Ch1-2 · p19–37 | 32 | 11/11 | ★★★ | 69·70 |
| 3 | `transmission-media` | 전송 매체와 신호 | 공식 문서: ITU-T 권고, IEEE 802 | 18 | 10/11 | ★★★ | 83 |
| 4 | `network-topology` | 네트워크 토폴로지 | 공식 문서: IEEE 802, ITU-T 권고 | 11 | 10/11 | ★★★ | 83 |
| 5 | `ethernet` | 이더넷과 프레임 | 강의 Ch2-1 · p48–70 | 6 | 6/11 | ★★☆ | 72 |
| 6 | `hub-switch-vlan` | 허브·스위치·VLAN | 강의 Ch2-2, Ch2-3 · p71–105 | 17 | 10/11 | ★★★ | 72 |
| 7 | `wireless-lan` | 무선 LAN과 이동통신 | 공식 문서: IEEE 802, ITU-T 권고 | 18 | 10/11 | ★★★ | 82 |
| 8 | `ip-protocol` | IP와 단편화 | 강의 Ch3-1 · p106–129 | 29 | 11/11 | ★★★ | 73 |
| 9 | `arp` | ARP | 강의 Ch3-2 · p130–143 | 9 | 7/11 | ★★☆ | 73 |
| 10 | `icmp` | ICMP | 강의 Ch3-3 · p144–158 (함께 넣는 IGMP는 공식 문서: IETF RFC) | 23 | 11/11 | ★★★ | 73 |
| 11 | `ip-addressing` | IP 주소와 서브넷 마스크 | 강의 Ch3-5 · p161–179 | 19 | 11/11 | ★★★ | 74 |
| 12 | `ip-address-types` | 공인·사설 IP, NAT, DHCP | 강의 Ch3-6 · p180–198 | 21 | 11/11 | ★★★ | 74 |
| 13 | `routing` | 라우팅 | 강의 Ch3-7 · p199–216 | 12 | 10/11 | ★★★ | 74 |
| 14 | `ports` | 포트 | 강의 Ch4-1 · p217–233 | 9 | 6/11 | ★★☆ | 77 |
| 15 | `tcp-udp` | TCP 세그먼트와 UDP 데이터그램 | 강의 Ch4-3 · p236–253 | 18 | 10/11 | ★★★ | 77 |
| 16 | `tcp-connection` | TCP 연결과 상태 | 강의 Ch4-5, Ch4-6 · p256–280 | 6 | 6/11 | ★★☆ | 77 |
| 17 | `tcp-retransmission` | TCP 재전송과 ARQ | 강의 Ch4-7 · p281–300 | 9 | 8/11 | ★★☆ | 84 |
| 18 | `tcp-flow-congestion` | TCP 흐름 제어와 혼잡 제어 | 강의 Ch4-8 · p301–327 | 6 | 6/11 | ★★☆ | 84 |
| 19 | `dns` | DNS | 강의 Ch5-1 · p328–351 | 25 | 10/11 | ★★★ | 79 |
| 20 | `app-protocols-mail-file` | 메일·파일 전송·원격 접속 프로토콜 | 공식 문서: IETF RFC | 17 | 9/11 | ★★★ | 78 |
| 21 | `app-protocols-mgmt-security` | 관리·시간·보안 프로토콜 | 공식 문서: IETF RFC | 13 | 9/11 | ★★★ | 78 |
| 22 | `uri-web-server` | URI와 웹 서버 | 강의 Ch5-2, Ch5-3 · p352–392 | 0 | 0/11 | — | 85~ |
| 23 | `http-basics` | HTTP의 특성과 버전 | 강의 Ch5-4 · p393–412 | 1 | 1/11 | — | 85~ |
| 24 | `http-messages` | HTTP 메시지·메서드·상태 코드 | 강의 Ch5-5 · p413–439 | 1 | 1/11 | — | 85~ |
| 25 | `http-headers` | HTTP 헤더와 콘텐츠 협상 | 강의 Ch5-6, Ch5-10 · p440–502 | 0 | 0/11 | — | 85~ |
| 26 | `http-cache` | HTTP 캐시 | 강의 Ch5-8 · p465–477 | 0 | 0/11 | — | 85~ |
| 27 | `http-cookie` | 쿠키와 세션 | 강의 Ch5-9 · p478–492 | 0 | 0/11 | — | 85~ |
| 28 | `network-devices` | 네트워크 장비와 부하 분산 | 공식 문서: IEEE 802, IETF RFC | 23 | 11/11 | ★★★ | 82 |
| 29 | `network-security` | 네트워크 보안과 VPN | 공식 문서: IETF RFC, NIST, IEEE 802.1X | 11 | 9/11 | ★★★ | 82 |
| 30 | `cloud-sdn` | 클라우드·SDN·NFV | 공식 문서: NIST, IETF RFC, ETSI | 16 | 9/11 | ★★★ | 83 |
| 31 | `diagnostic-commands` | 네트워크 진단 명령 | 공식 문서: learn.microsoft.com, man7.org, IETF RFC | 17 | 10/11 | ★★★ | 78 |
| 32 | `linux-filesystem` | Linux 파일 시스템과 디스크 | 공식 문서: FHS, man7.org | 18 | 10/11 | ★★★ | 75 |
| 33 | `linux-permissions` | Linux 파일 권한과 소유자 | 공식 문서: man7.org, POSIX, GNU coreutils | 16 | 11/11 | ★★★ | 75 |
| 34 | `linux-shell` | Linux 셸과 기본 명령 | 공식 문서: GNU bash, POSIX, man7.org | 17 | 9/11 | ★★★ | 75 |
| 35 | `linux-process-boot` | Linux 프로세스·작업 예약·부팅 | 공식 문서: man7.org, GNU GRUB | 24 | 11/11 | ★★★ | 76 |
| 36 | `linux-accounts` | Linux 사용자 계정 | 공식 문서: man7.org | 8 | 6/11 | ★★☆ | 76 |
| 37 | `linux-servers` | Linux 서버 설정 | 공식 문서: Apache HTTP Server, ISC BIND 9, netfilter, man7.org | 16 | 8/11 | ★★☆ | 79 |
| 38 | `windows-ad` | Active Directory와 그룹 정책 | 공식 문서: learn.microsoft.com | 14 | 10/11 | ★★★ | 80 |
| 39 | `windows-server-roles` | Windows Server의 서버 역할 | 공식 문서: learn.microsoft.com | 13 | 8/11 | ★★☆ | 81 |
| 40 | `windows-hyperv` | Hyper-V와 Windows 컨테이너 | 공식 문서: learn.microsoft.com | 9 | 8/11 | ★★☆ | 81 |
| 41 | `windows-admin-tools` | Windows 관리 도구와 보안 기능 | 공식 문서: learn.microsoft.com | 13 | 8/11 | ★★☆ | 80 |
| 42 | `raid-storage` | RAID와 스토리지 | 공식 문서: SNIA | 9 | 8/11 | ★★☆ | 83 |

**합계** — 주제 42개(강의 22 · 강의 밖 20). ★★★ 23개(강의 9 · 강의 밖 14), ★★☆ 13개(강의 7 · 강의 밖 6), 별점 없음 6개(모두 강의 5장의 HTTP 계열).
문항 550 = 강의 주제 249(그중 `icmp`에 넣은 IGMP 7) + 강의 밖 주제 301.

## phase 계획

별점 높은 것부터 만들고, 앞 주제를 바탕으로 삼아야 하는 곳만 순서를 지킨다(사용자 결정 2026-10-28). 1장 두 주제는 phase 69가 만들고 70이 다시 썼다.
아래 번호는 계획이다 — 앞 phase를 화면으로 확인한 뒤 바뀔 수 있다.

- **72** — `ethernet`, `hub-switch-vlan`
- **73** — `ip-protocol`, `arp`, `icmp`(IGMP 포함)
- **74** — `ip-addressing`, `ip-address-types`, `routing`
- **75** — `linux-filesystem`, `linux-permissions`, `linux-shell`
- **76** — `linux-process-boot`, `linux-accounts`
- **77** — `ports`, `tcp-udp`, `tcp-connection`
- **78** — `app-protocols-mail-file`, `app-protocols-mgmt-security`, `diagnostic-commands`
- **79** — `dns`, `linux-servers`
- **80** — `windows-ad`, `windows-admin-tools`
- **81** — `windows-server-roles`, `windows-hyperv`
- **82** — `network-devices`, `wireless-lan`, `network-security`
- **83** — `cloud-sdn`, `transmission-media`, `network-topology`, `raid-storage`
- **84** — `tcp-retransmission`, `tcp-flow-congestion`
- **85~** — `uri-web-server`, `http-basics`, `http-messages`, `http-headers`, `http-cache`, `http-cookie`

## 출처 영역

강의 밖 주제의 사실은 강의·면접이 아니라 그 기술을 정한 표준 기구나 만든 곳의 공식 문서에서만 가져온다. 지금 쓰는 곳은 다음과 같다.

- **Linux**: man7.org(Linux man-pages), POSIX(pubs.opengroup.org), FHS(refspecs.linuxfoundation.org), GNU 매뉴얼(gnu.org — bash·coreutils·GRUB)
- **Linux 서버**: Apache HTTP Server 문서(httpd.apache.org), ISC BIND 9 문서(bind9.readthedocs.io), netfilter(netfilter.org)
- **Windows Server**: learn.microsoft.com
- **응용 프로토콜·진단 명령**: IETF RFC, learn.microsoft.com(Windows 명령), man7.org(Linux 명령)
- **무선·매체·토폴로지**: IEEE 802, ITU-T 권고(G 시리즈 등)
- **클라우드·SDN·NFV**: NIST(csrc.nist.gov), IETF RFC, ETSI(etsi.org)
- **보안·VPN**: IETF RFC, NIST, IEEE 802.1X
- **RAID·스토리지**: SNIA(snia.org)
- **스위치 업체 기술**: Cisco 제품 문서(cisco.com의 Catalyst 설정 가이드·명령 참조 같은 제품 문서. 학습·마케팅 페이지는 아니다) — 시스코가 만든 VTP에만 쓴다. 강의 밖 주제가 아니라 강의 주제 `hub-switch-vlan`(phase 72)이 쓰는 곳이다

`network-devices`(게이트웨이·리피터·L4/L7 스위치·로드 밸런서·PoE·PXE·프록시)는 위 영역 가운데 하나에 딱 들지 않아, 이미 목록에 있는
IEEE 802(리피터·PoE)와 IETF RFC(게이트웨이·프록시)를 출처 열에 적었다. 이 둘로 댈 수 없는 사실은 그 phase를 설계할 때 같은 기준으로 판단한다.
강의 주제는 지금처럼 강의·표준 문서·면접을 쓴다.

## 분류 메모

**나눈 방법.** 기출 분석은 550문항을 강의 주제 22개(범위 안 242문항)와 범위 밖 클러스터 14개(308문항)로 나눠 두었다.
범위 안 문항은 그 분류를 그대로 썼다. 범위 밖 클러스터는 아래처럼 주제에 대응시켰고, 셋(응용 프로토콜·NOS-Linux·NOS-Windows Server)은
문항마다 정답을 가르는 사실을 보고 새 주제 여럿으로 나눴다.

| 기출 분석의 클러스터 | 문항 | 들어간 주제 |
|---|---|---|
| 전송 매체·케이블 · 데이터 통신 기초 | 9 · 9 | `transmission-media` 18 |
| 토폴로지 · 토큰 링·FDDI·IEEE 802 | 8 · 3 | `network-topology` 11 |
| 무선 LAN·이동통신 | 18 | `wireless-lan` 18 |
| 응용 프로토콜 | 30 | `app-protocols-mail-file` 17, `app-protocols-mgmt-security` 13 |
| 네트워크 장비·부하 분산 | 23 | `network-devices` 23 |
| 보안·VPN | 11 | `network-security` 11 |
| 클라우드·SDN·NFV 등 | 16 | `cloud-sdn` 16 |
| 네트워크 진단 명령 | 17 | `diagnostic-commands` 17 |
| NOS-Linux | 99 | `linux-filesystem` 18, `linux-permissions` 16, `linux-shell` 17, `linux-process-boot` 24, `linux-accounts` 8, `linux-servers` 16 |
| NOS-Windows Server | 49 | `windows-ad` 14, `windows-server-roles` 13, `windows-hyperv` 9, `windows-admin-tools` 13 |
| RAID·스토리지 | 9 | `raid-storage` 9 |
| IGMP | 7 | 새 주제 없이 강의 주제 `icmp`에 |

**검산.** 새 주제 20개의 문항 301 + `icmp`에 더한 IGMP 7 = 308(범위 밖 전부). 강의 주제 22개의 문항 수와 회차는 기출 분석 「주제별」 표와 같다.
다른 곳은 `icmp` 하나다 — IGMP를 더해 16문항이 23문항이 됐고, 회차는 11/11 그대로다.

**경계에서 정한 것.**

- Linux에서 **어느 디렉터리인지**를 고르는 문항은 그 안에 든 것이 계정 정보여도 `linux-filesystem`에 넣었다(정답을 가르는 것이 디렉터리 구성이다).
  홈 디렉터리, 디스크를 새로 붙일 때 쓰는 명령, 파일 속성을 보는 명령도 `linux-filesystem`이다.
- 부팅 때 남은 커널 메시지 로그 파일을 고르는 문항은 디렉터리가 아니라 dmesg가 무엇을 담는지가 답을 가르므로 `linux-process-boot`다.
  시스템을 끄거나 다시 켜는 명령(init 단계 번호 포함)도 `linux-process-boot`다.
- 계정 정보 파일의 필드 해석, 계정 만들기·암호 만료·실패한 로그인 기록은 `linux-accounts`다.
- DNS 클라이언트 설정 파일, BIND 설정, Apache 설정(연결 유지 시간·수신 포트·요청 크기 제한·디렉터리 목록), iptables 규칙을 읽는 문항은
  DNS·HTTP·포트 같은 강의 주제와 맞닿아도 **설정 파일을 읽는 일**이 답을 가르므로 `linux-servers`다. 기출 분석도 이들을 범위 밖으로 두었다.
- Windows의 로컬 그룹·기본 로컬 계정 문항은 도메인(Active Directory)이 아니지만, 사용자·그룹 관리라는 같은 일이라 `windows-ad`에 넣었다.
- IIS 관리자를 여는 명령을 고르는 문항은 실행 창 명령이지만 IIS를 알아야 풀리므로 `windows-server-roles`다.
  파일·프린터 서버로 쓰려면 필요한 통신 프로토콜을 묻는 문항도 서버 역할로 보아 `windows-server-roles`다.
- 파일 암호화(EFS)·드라이브 암호화(BitLocker)·클라우드 폴더는 `windows-admin-tools`다.
- SSH·FTP·SMTP 문항은 NOS 과목에 실렸어도, 포트 번호가 함께 나와도 `app-protocols-mail-file`이다. HTTPS·TLS 문항은 포트 443이 함께 나와도 `app-protocols-mgmt-security`다.
- 캐시를 비우거나 주소를 다시 받는 ipconfig 옵션, 라우팅 테이블을 보이는 netstat 옵션은 DNS·DHCP·라우팅과 맞닿아도 명령이 하는 일이 답을 가르므로 `diagnostic-commands`다.
- 게이트웨이·리피터·L4 스위치가 어느 계층 장비인지 묻는 문항은 `protocols-encapsulation`과 맞닿지만 장비를 알아야 풀리므로 `network-devices`다. 프록시도 `network-devices`다.
- IEEE 802 번호와 그 표준을 짝짓는 문항은 무선 LAN 번호가 정답이어도 표준 묶음 전체를 묻는 것이라 `network-topology`(토큰 링·FDDI와 같은 묶음)에 두었다. IDC는 `cloud-sdn`이다.

**숫자의 한계.** 기출 분석의 분류는 한 사람이 한 번 읽고 정한 것이고 지문(그림)이 빠진 문항도 있어, 경계 문항을 옮기면 주제별 문항이 ±1~3쯤 움직인다.
문항 하나를 옮겨 별점이 바뀔 수 있는 주제는 회차가 경계에 선 다음 주제뿐이다.

- 회차 9(★★★의 하한): `app-protocols-mail-file`, `app-protocols-mgmt-security`, `network-security`, `cloud-sdn`, `linux-shell`
- 회차 8(★★★ 바로 아래): `tcp-retransmission`, `linux-servers`, `windows-server-roles`, `windows-hyperv`, `windows-admin-tools`, `raid-storage`
- 회차 6(★★☆의 하한): `network-basics`, `ethernet`, `ports`, `tcp-connection`, `tcp-flow-congestion`, `linux-accounts`
