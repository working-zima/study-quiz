# Step 2: topic-map

## 배경

네트워크 과목은 강의(패스트캠퍼스 네트워크 5장 32강)가 범위와 순서를 정해 왔다(ADR-055). 주제는 22개이고 지금 앱에는 1장 두 주제만 있다.
사용자가 2026-10-27 네트워크관리사 2급 기출 11회(2024-02-25 ~ 2026-08-02, 550문항)를 주었고, 분석을 본 뒤 정했다.

- **목표 자격증은 네트워크관리사 2급이다. 별점을 출제 빈도로 매긴다.**
- **강의 밖의 출제 범위도 과목에 넣는다** — Linux·Windows Server(NOS), 응용 프로토콜, 장비, 무선, 진단 명령, 클라우드 등.

2026-10-28 설계를 보고 정한 것(모두 사용자 결정):

- 별점은 **주제 단위**, **11회 가운데 몇 회에 나왔는가**로 매긴다 — **9회 이상 ★★★(3), 6~8회 ★★☆(2), 5회 이하 별점 없음(0)**.
  문항 수는 주제가 클수록 많아지지만 회차는 「다음 시험에도 나올까」에 가깝다.
- 주제를 만드는 순서는 **별점 높은 것부터**이고, 바탕이 필요한 곳만 순서를 지킨다(아래 「phase 계획」).
- 과목 이름은 「네트워크」 그대로다.

**이 step은 강의 22개와 강의 밖 20개, 모두 42개 주제의 지도를 `docs/source/network/topic-map.md`로 만든다.** 주제마다 기출 문항 수·출제 회차·별점·만들 phase를 적는다.
이후 step이 이 지도를 근거로 ADR(step 3)과 별점 불변식(step 4)을 쓰고, 다음 phase들이 이 지도대로 주제를 만든다.

## 읽어야 할 파일

- `docs/source/network/CLAUDE.md` — 원본 규칙, 「기출 — 시험이 무엇을 정답으로 보는가에만 쓴다」(**기출 문장을 옮기지 마라**)
- `docs/source/network/lecture-outline.md`의 「주제 지도」(강의 22개, `sourcePages`)
- `docs/source/network/raw/exam/exam-analysis.md` — **gitignore된 로컬 파일**이다. §0(과목 구간·분류 규칙), §2(주제별), §3(범위 밖 클러스터), §7(부록 — 문항마다 분류와 묻는 사실)
- `docs/source/network/raw/exam/data.txt` — 같은 분류의 원자료(`@날짜` 줄 아래 `번호 분류 표시 …| 묻는 사실`)
- `docs/ADR.md`의 **ADR-055**(「주제」), **ADR-057**(기출의 자리)

`raw/exam/`의 시험별 `.txt`(문항 원문)는 분류가 애매한 문항을 확인할 때만 열고, 거기서 문장을 옮기지 마라.

## 작업

### 1. 강의 밖 문항을 새 주제로 나눈다

부록(§7)에서 분류가 「범위 밖: …」인 문항 308개를 아래 새 주제 20개 가운데 **하나에만** 넣는다. 「묻는 사실」 칸으로 판단한다.
**IGMP 7문항은 새 주제를 만들지 않고 강의 주제 `icmp`에 넣는다.** 범위 안 문항(강의 주제 id로 분류된 것)의 분류는 그대로 쓴다.

| id | 제목(안) | 나누는 기준(부록의 클러스터) |
|---|---|---|
| `transmission-media` | 전송 매체와 신호 | 전송 매체·케이블(광케이블·FTTH PON), 데이터 통신 기초(다중화·신호 손상·부호화) |
| `network-topology` | 네트워크 토폴로지 | 토폴로지(성형·버스·링), 토큰 링·FDDI·IEEE 802 번호 |
| `wireless-lan` | 무선 LAN과 이동통신 | 무선 LAN·이동통신 |
| `app-protocols-mail-file` | 메일·파일 전송·원격 접속 프로토콜 | 응용 프로토콜 중 SMTP·POP3·IMAP·FTP·TFTP·SSH·Telnet |
| `app-protocols-mgmt-security` | 관리·시간·보안 프로토콜 | 응용 프로토콜 중 SNMP·NTP/SNTP·HTTPS/TLS·SIP 등 나머지 |
| `network-devices` | 네트워크 장비와 부하 분산 | 네트워크 장비·부하 분산 |
| `network-security` | 네트워크 보안과 VPN | 보안·VPN |
| `cloud-sdn` | 클라우드·SDN·NFV | 클라우드·SDN·NFV 등 |
| `diagnostic-commands` | 네트워크 진단 명령 | 네트워크 진단 명령 |
| `linux-filesystem` | Linux 파일 시스템과 디스크 | NOS-Linux 중 디렉터리 구성(/etc·/proc·/var·/usr·/dev)·fstab·스왑·파티션·fdisk/gdisk·lsattr |
| `linux-permissions` | Linux 파일 권한과 소유자 | NOS-Linux 중 chmod·chown·권한 문자열·ls -al 파일 타입 |
| `linux-shell` | Linux 셸과 기본 명령 | NOS-Linux 중 셸·리다이렉션·pwd·cd·mv·find·more·vi |
| `linux-process-boot` | Linux 프로세스·작업 예약·부팅 | NOS-Linux 중 ps·top·free·데몬·crontab·init/runlevel·systemctl·GRUB·dmesg |
| `linux-accounts` | Linux 사용자 계정 | NOS-Linux 중 /etc/passwd·useradd·chage·lastb |
| `linux-servers` | Linux 서버 설정 | NOS-Linux 중 Apache(httpd.conf)·BIND(named.conf)·resolv.conf·iptables |
| `windows-ad` | Active Directory와 그룹 정책 | NOS-Windows 중 AD·트러스트·OU·그룹·그룹 정책·ds 명령·기본 계정 |
| `windows-server-roles` | Windows Server의 서버 역할 | NOS-Windows 중 IIS·FTP 서버·DHCP·DNS 서버·WAP |
| `windows-hyperv` | Hyper-V와 Windows 컨테이너 | NOS-Windows 중 Hyper-V·검사점·저장소 이동·Windows 컨테이너 |
| `windows-admin-tools` | Windows 관리 도구와 보안 기능 | NOS-Windows 중 이벤트 뷰어·리소스 모니터·perfmon·PowerShell·실행 창 명령·certmgr·EFS·BitLocker·클라우드 폴더 |
| `raid-storage` | RAID와 스토리지 | RAID·스토리지 |

- **id는 위대로 고정한다**(step 4의 불변식과 다음 phase가 이 id를 쓴다). 제목은 명사구로 다듬어도 된다.
- 한 문항이 두 주제에 걸치면 「정답을 가르는 사실」이 속한 쪽으로 넣는다. 경계 판단은 지도 끝 「분류 메모」에 몇 줄로 남긴다(문항 원문이 아니라 직접 쓴 말로).
- 나누고 나서 **합계를 맞춘다**: 새 주제 20개의 문항 수 + `icmp`에 더한 IGMP 7 = 308.

### 2. 주제마다 숫자를 센다

- **문항 수**: 그 주제로 분류된 문항 수.
- **출제 회차**: 11회 가운데 그 주제 문항이 하나라도 나온 회 수(0~11). `icmp`는 IGMP 문항의 회차를 합친다.
- **별점**: 9회 이상 3, 6~8회 2, 5회 이하 0.
- 강의 주제의 숫자는 §2 표와 같아야 한다(`icmp`만 IGMP가 더해진다). 다르면 부록으로 다시 세고 차이를 「분류 메모」에 적는다.
- 숫자는 손으로 세지 말고 `data.txt`나 부록 표를 읽는 짧은 스크립트로 센다. 스크립트는 저장소에 남기지 않는다.

### 3. `docs/source/network/topic-map.md`를 쓴다

머리에 무엇의 지도인지, 별점 규칙(회차 정의 — 11회의 날짜 범위), 이 지도를 바꾸는 법(새 기출을 더하면 다시 센다, 주제를 더하거나 나누면 ADR이 필요하다)을 짧게 쓴다. 그다음 표 하나:

| 열 | 내용 |
|---|---|
| 순서 | **앱의 주제 순서**(아래 목록) |
| 주제 id | |
| 제목 | |
| 출처 | 강의 주제는 `강의 Ch2-1` 꼴과 `sourcePages`, 강의 밖 주제는 `공식 문서: …`(아래 「출처 영역」) |
| 문항 | 기출 문항 수 |
| 회차 | `11/11` 꼴 |
| 별점 | `★★★`·`★★☆`·`—` |
| phase | 만들 phase 번호(계획). 이미 있는 1장 두 주제는 `69·70` |

**앱의 주제 순서**(강의 순서를 뼈대로, 강의 밖 주제는 내용이 가까운 곳에):

1 `network-basics` · 2 `protocols-encapsulation` · 3 `transmission-media` · 4 `network-topology` · 5 `ethernet` · 6 `hub-switch-vlan` · 7 `wireless-lan` ·
8 `ip-protocol` · 9 `arp` · 10 `icmp` · 11 `ip-addressing` · 12 `ip-address-types` · 13 `routing` · 14 `ports` · 15 `tcp-udp` · 16 `tcp-connection` ·
17 `tcp-retransmission` · 18 `tcp-flow-congestion` · 19 `dns` · 20 `app-protocols-mail-file` · 21 `app-protocols-mgmt-security` · 22 `uri-web-server` ·
23 `http-basics` · 24 `http-messages` · 25 `http-headers` · 26 `http-cache` · 27 `http-cookie` · 28 `network-devices` · 29 `network-security` · 30 `cloud-sdn` ·
31 `diagnostic-commands` · 32 `linux-filesystem` · 33 `linux-permissions` · 34 `linux-shell` · 35 `linux-process-boot` · 36 `linux-accounts` · 37 `linux-servers` ·
38 `windows-ad` · 39 `windows-server-roles` · 40 `windows-hyperv` · 41 `windows-admin-tools` · 42 `raid-storage`

**phase 계획**(사용자가 승인한 순서 — 별점 높은 것부터, 바탕이 필요한 곳만 순서를 지킨다):

| phase | 주제 |
|---|---|
| 72 | `ethernet`, `hub-switch-vlan` |
| 73 | `ip-protocol`, `arp`, `icmp`(IGMP 포함) |
| 74 | `ip-addressing`, `ip-address-types`, `routing` |
| 75 | `linux-filesystem`, `linux-permissions`, `linux-shell` |
| 76 | `linux-process-boot`, `linux-accounts` |
| 77 | `ports`, `tcp-udp`, `tcp-connection` |
| 78 | `app-protocols-mail-file`, `app-protocols-mgmt-security`, `diagnostic-commands` |
| 79 | `dns`, `linux-servers` |
| 80 | `windows-ad`, `windows-admin-tools` |
| 81 | `windows-server-roles`, `windows-hyperv` |
| 82 | `network-devices`, `wireless-lan`, `network-security` |
| 83 | `cloud-sdn`, `transmission-media`, `network-topology`, `raid-storage` |
| 84 | `tcp-retransmission`, `tcp-flow-congestion` |
| 85~ | `uri-web-server`, `http-basics`, `http-messages`, `http-headers`, `http-cache`, `http-cookie` |

phase 번호는 계획이고, 앞 phase를 화면으로 확인한 뒤 바뀔 수 있다고 적는다.

**출처 영역**(강의 밖 주제의 사실은 강의·면접이 아니라 이 공식 문서에서만 가져온다 — 규칙은 step 3이 ADR로 정한다):

- Linux: man7.org(Linux man-pages), POSIX(pubs.opengroup.org), FHS(refspecs.linuxfoundation.org), GNU 매뉴얼(gnu.org — bash·coreutils·GRUB)
- Linux 서버: Apache HTTP Server 문서(httpd.apache.org), ISC BIND 9 문서(bind9.readthedocs.io), netfilter(netfilter.org)
- Windows Server: learn.microsoft.com
- 응용 프로토콜·진단 명령: IETF RFC, learn.microsoft.com(Windows 명령), man7.org(Linux 명령)
- 무선·매체·토폴로지: IEEE 802, ITU-T 권고(G 시리즈 등)
- 클라우드·SDN·NFV: NIST(csrc.nist.gov), IETF RFC, ETSI(etsi.org)
- 보안·VPN: IETF RFC, NIST, IEEE 802.1X
- RAID·스토리지: SNIA(snia.org)

표 아래에 **합계 줄**(주제 42개, 강의 22·강의 밖 20, 별점별 주제 수, 문항 합계 550)과 「분류 메모」를 둔다.

### 4. `lecture-outline.md`의 「주제 지도」

- 강의 22개의 표는 **강의 사실(순서·id·제목·강의·`sourcePages`)만** 남기고 `phase` 열을 지운다.
- 표 위에 「과목 전체의 주제 지도(강의 밖 주제·별점·phase)는 `topic-map.md`에 있다」는 한 줄을 둔다. 「phase 열은 계획이다」 같은 이제 맞지 않는 문장을 고친다.

### 5. `docs/source/network/CLAUDE.md`의 파일 목록

「이 디렉토리의 파일」에 `topic-map.md` 한 줄을 더한다(무엇을 담는지). 다른 절은 step 3이 고친다 — 여기서 건드리지 마라.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node scripts/check-verbatim.mjs --subject network
node -e "const s=require('fs').readFileSync('docs/source/network/topic-map.md','utf8');const ids=[...s.matchAll(/^\|\s*\d+\s*\|\s*\x60([a-z0-9-]+)\x60/gm)].map(m=>m[1]);console.log('주제',ids.length,'유일',new Set(ids).size)"
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. 주제 42개·유일 42.
2. 새 주제 20개 문항 수 + IGMP 7 = 308, 강의 주제 숫자가 §2 표와 같은지(차이는 메모에 이유가 있는지) 본다.
3. `topic-map.md`·`lecture-outline.md`에 기출 문장이 옮겨지지 않았는지 본다 — 숫자, 클러스터 이름, 직접 쓴 메모뿐이어야 한다.
4. 바뀐 파일이 `topic-map.md`(새 파일), `lecture-outline.md`, `docs/source/network/CLAUDE.md`, phase 메타데이터뿐인지 본다. `raw/`는 gitignore라 커밋되지 않는다.
5. `phases/71-network-baseline/index.json`의 step 2를 갱신한다.
   - 성공 → `"summary"`에 주제 42개의 `id 문항/회차 별점` 목록(한 줄에 이어서), 별점별 주제 수, 합계 검산, 분류 메모 요지, 고친 파일을 적는다. **step 4가 이 숫자를 불변식 표로 옮긴다.**
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **기출 문장·보기를 옮기지 마라.** 이유: 출제 사이트의 문장이다(ADR-057, ADR-009). 숫자와 직접 쓴 묶음 이름만 쓴다.
- **`raw/exam/`의 파일을 저장소에 넣거나 `exam-analysis.md`를 다시 만들지 마라.** 이유: gitignore된 로컬 분석이고, 이미 끝났다. 읽기만 한다.
- **`topics.json`·`questions.json`·테스트를 바꾸지 마라.** 이유: 별점과 불변식은 step 4의 일이고, 새 주제의 내용은 다음 phase들의 일이다.
- **ADR과 `docs/source/network/CLAUDE.md`의 규칙 절을 고치지 마라.** 이유: step 3의 일이다(이 step은 파일 목록 한 줄만).
- 새 주제 id를 위 표와 다르게 짓지 마라. 이유: step 4의 불변식과 다음 phase가 이 id로 일한다.
