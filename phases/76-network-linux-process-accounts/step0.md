# Step 0: process-boot-sources

## 배경

phase 76은 네트워크 과목의 강의 밖 주제 `linux-process-boot`(Linux 프로세스·작업 예약·부팅)·`linux-accounts`(Linux 사용자 계정)를 만든다. 전체 계획과 결정은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
step 1~8이 `linux-process-boot`의 개념 15개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 허용한 공식 문서로 확인하고 출처 문서에 남긴다.**
데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

이 주제는 강의가 다루지 않으므로 **사실의 출처는 공식 문서 하나뿐이다**(ADR-059). 이 step이 확인하지 않은 사실은 뒤 step이 쓸 수 없다고 생각하고 빠짐없이 확인한다.
기출 24문항이 묻는 것은 `ps`(데몬이 살아 있는지 확인 3회, `ps -ef` 결과 읽기 2회, `ps -ef | grep`), `top`(실시간 감시 2회, 「가장 우선순위가 높은 프로세스」가 틀린 말), `kill`·`nice`·`pstree`, `free` 2회, 데몬의 성질,
crontab(시간 칸 2회, `-r` 3회), 실행 레벨(`init 6` 2회, runlevel 5), 끄는 명령(`shutdown -h now`·`poweroff`·`halt`와 `init 6`), `systemctl`의 쓰임, GRUB 2회, 부팅 때의 커널 메시지(`/var/log/dmesg`) 2회다.

## 읽어야 할 파일

- `phases/76-network-linux-process-accounts/guide.md` — 특히 「두 주제와 개념 21개」의 `linux-process-boot` 표, 「예시 값」, 「출처」
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리, 가리키는 표기. **이 규칙을 따른다**
- `docs/source/network/topic-map.md` — 「출처 영역」과 「분류 메모」의 Linux 경계(부팅 로그·끄는 명령은 이 주제)
- `docs/source/network/standards.md` — 머리의 규칙과 「(phase 75)」 줄들, phase 75 항목들(man 페이지 항목의 형식이 본보기다 — 읽은 판을 적는다). **이미 있는 사실(예: boot(7)·proc(5)·mkswap(8)·swapon(8)·passwd(5)·shadow(5)·capabilities(7)의 항목)은 다시 찾지 말고 그 항목에 줄을 더한다**
- `docs/source/network/exam-notes.md` — E19~E23의 형식과 그 앞 소개 문단
- `docs/ADR.md`의 **ADR-059**(특히 「출처」·「기출의 자리」·「트레이드오프」), **ADR-057**, **ADR-009**
- `docs/source/network/raw/exam/data.txt`에서 `X-linux` 줄 가운데 이 주제의 24문항과 그 문항(시험 날짜·번호로 `docs/source/network/raw/exam/`의 교사용 텍스트에서 찾는다) —
  [기출 2024-02-25 #30·#33·#35], [기출 2024-05-19 #29·#39·#45], [기출 2024-08-25 #35·#42], [기출 2024-11-03 #34·#37], [기출 2025-02-23 #31·#37], [기출 2025-05-25 #33], [기출 2025-08-24 #31·#40],
  [기출 2025-11-02 #31·#44], [기출 2026-02-01 #36], [기출 2026-05-17 #30·#33], [기출 2026-08-02 #34·#38·#41·#42].
  시험이 무엇을 정답으로 보는지와, 오답 보기 가운데 시험이 맞는 말로 두는 것만 본다. 지문(그림)이 빠진 문항(`ps -ef` 결과 읽기, 2025-11-02 #44)은 보기와 정답만 본다. 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 `man7.org`(Linux man-pages — 페이지 끝의 「COLOPHON」에 어느 프로젝트의 어느 판인지 적혀 있다), `pubs.opengroup.org`(POSIX — 2024년판 `onlinepubs/9799919799/`),
`www.gnu.org/software/grub/manual/`(GNU GRUB 매뉴얼 — GRUB에만)이다. 위키백과·블로그·배포판 업체의 학습 페이지(Red Hat·Ubuntu·Arch 문서 등)는 쓰지 않는다.
gnu.org는 이 설계를 쓴 날(2026-11-04) 잠시 응답하지 않았다 — 열리지 않으면 몇 분 뒤 다시 열어 본다. 그래도 열리지 않으면 아래 「검증 절차」 4의 blocked로 멈춘다(GRUB의 사실을 지어서 적지 마라).

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `process` | 프로세스가 실행 중인 프로그램이라는 것(프로그램 파일과 다르다는 근거), PID가 프로세스마다 붙는 번호라는 것, 부모 프로세스와 PPID, 새 프로세스를 만드는 쪽이 부모가 된다는 것(fork), 셸이 명령을 실행하면 셸이 그 명령의 부모가 된다는 근거, 부팅 때 커널이 처음 실행하는 사용자 프로세스가 PID 1이라는 것과 그것이 무엇인지(init, systemd), 부모가 먼저 끝나면 자식이 누구에게 넘어가는지(쓸지는 판단 — 기출은 묻지 않는다) | fork(2), getpid(2)·getppid(2), credentials(7), boot(7)(phase 75 항목이 있으면 거기에 더한다), bootup(7), systemd(1), POSIX Base Definitions §3의 「Process」·「Process ID」·「Parent Process ID」(절 번호는 열어서 확인) |
| b | `ps-command` | `ps`가 그 순간의 프로세스 목록을 보여 준다는 것, 옵션 없이 보이는 범위, `-e`(모든 프로세스), `-f`(full-format)와 그 칸 이름·차례(UID·PID·PPID·C·STIME·TTY·TIME·CMD)와 각 칸의 뜻, 대시 없는 BSD 꼴 옵션(`a`·`u`·`x`·`f` — `ps aux`·`ps afx`)이 있다는 것. `ps -ef | grep 이름`의 결과에 `grep` 자기 줄이 끼는지(근거가 없으면 쓰지 않는다) | ps(1)(procps-ng) — DESCRIPTION·EXAMPLES·STANDARD FORMAT SPECIFIERS, POSIX `ps`(`ps(1p)`) |
| c | `top-command` | `top`이 프로세스와 시스템 상태를 계속 다시 그려 보여 준다는 것(다시 그리는 간격의 기본값과 `-d`), 요약 영역과 작업 영역, 작업 영역의 칸(PID·USER·%CPU·%MEM·COMMAND 등), **기본 정렬 칸**(%CPU인지), `q`로 끝낸다는 것, 우선순위 칸(PR·NI)이 있다는 것 | top(1)(procps-ng) |
| d | `process-commands` | `kill`이 시그널을 보내는 명령이라는 것, 기본 시그널(TERM), `-9`(KILL)와 KILL은 프로세스가 잡거나 막을 수 없다는 것, 시그널이 무엇인지. `nice`가 정한 나이스 값으로 명령을 실행한다는 것, 나이스 값의 범위(-20~19)와 값이 클수록 우선순위가 낮다는 것, 값을 낮추는(우선순위를 높이는) 것은 특권이 필요하다는 것, `renice`가 실행 중인 프로세스의 값을 바꾼다는 것. `pstree`가 프로세스를 나무 꼴로 보여 준다는 것 | kill(1)(procps-ng 또는 util-linux — 어느 것인지 적는다), kill(2), signal(7), nice(1)(coreutils), nice(2), renice(1), sched(7), pstree(1)(psmisc), POSIX `kill`·`nice` |
| e | `free-command` | `free`가 메모리와 스왑의 양을 보여 준다는 것, 칸 total·used·free·shared·buff/cache·available과 각 칸의 뜻, **used가 total − available로 계산된다는 것**, available이 새 프로그램을 스왑 없이 시작할 수 있는 양의 어림이라는 것, Swap 줄, `-h`. `du`(디렉터리·파일이 차지한 양)와 `df`(파일 시스템의 남은 양)가 하는 일 한 줄씩(phase 75 항목에 du(1)이 있으면 거기에 더한다) | free(1)(procps-ng), proc_meminfo(5)(phase 75 항목), du(1), df(1) |
| f | `daemon` | 데몬이 무엇인지(터미널 없이 뒤에서 실행되며 서비스를 맡는 프로세스), 데몬을 systemd 같은 init 시스템이 켠다는 것, 부팅 때만이 아니라 필요할 때 켜고 끌 수 있다는 근거, `sshd`가 무엇을 하는 데몬인지, `crond`(cron)가 무엇을 하는 데몬인지, 이름 끝 `d`의 관례가 허용한 출처에 있는지. 백그라운드(셸이 기다리지 않는 실행)의 근거 | daemon(7)(systemd), systemd(1), sshd(8)(OpenSSH — man7.org에 있다), cron(8)(cronie), bash 매뉴얼 또는 POSIX의 background/job control(phase 75 항목이 있으면 거기에 더한다) |
| g | `systemctl` | `systemctl`의 `start`·`stop`·`restart`·`status`·`enable`·`disable`이 각각 하는 일, **`enable`이 지금 켜지 않는다는 것과 `--now`**, `start`가 다음 부팅에 영향이 없다는 근거, 유닛·서비스 유닛(`.service`)이 무엇인지, `status`가 보여 주는 것(출력 꼴은 그 페이지가 보이는 만큼). `passwd`가 systemctl의 명령이 아니라는 것은 명령 목록에 없음으로 확인 | systemctl(1), systemd.unit(5), systemd.service(5), systemd(1) |
| h | `cron` | cron이 crontab에 적힌 명령을 정한 시각에 실행하는 데몬이라는 것, crontab을 얼마나 자주 살피는지(매분), 사용자마다의 crontab과 시스템 전체의 `/etc/crontab`, 사용자의 crontab이 어디에 저장되는지(쓸지는 판단), 사용자가 로그인해 있지 않아도 실행된다는 근거가 있는지 | cron(8)(cronie), crontab(5)(cronie), POSIX `crontab`의 DESCRIPTION |
| i | `crontab-fields` | 한 줄의 칸 다섯과 차례(분·시·일·월·요일), 각 칸의 값 범위, **요일의 0과 7이 일요일**, `*`의 뜻, 쉼표(목록)와 하이픈(범위), 여섯째부터가 명령이라는 것. cronie와 POSIX가 다르게 말하는 곳(예: 요일 7, 이름 `sun`, `*/10`)이 있으면 둘 다 적는다 | crontab(5)(cronie), POSIX `crontab`의 「INPUT FILES」 |
| j | `crontab-command` | `crontab -e`(편집)·`-l`(보기)·`-r`(지우기 — **그 사용자의 crontab 전체**)·`-u 사용자`(다른 사용자 — 누가 쓸 수 있는지)·`-i`(`-r` 앞에 묻기)의 뜻. POSIX에 `-u`·`-i`가 있는지 | crontab(1)(cronie), POSIX `crontab`(`crontab(1p)`) |
| k | `boot-sequence` | 부팅의 단계와 차례(펌웨어 → 부트 로더 → 커널 → init → 서비스·로그인), 각 단계가 하는 일, BIOS·UEFI를 허용한 출처가 어떻게 부르는지, 커널이 루트 파일 시스템을 붙인 뒤 init을 실행한다는 것, systemd가 부팅에서 하는 일(타깃까지 유닛을 켠다) | boot(7)(phase 75 항목에 더한다), bootup(7)(systemd), systemd(1), bootparam(7) |
| l | `grub` | GRUB이 무엇인지(부트 로더 — 커널을 불러와 실행을 넘긴다), 메뉴로 커널·운영체제를 고른다는 것, **멀티 부팅**과 직접 불러올 수 없는 운영체제를 그 부트 로더에 넘기는 **체인 로딩**, 매뉴얼의 판(GRUB 2.xx). boot(7)이 GRUB을 무엇으로 부르는지 | GNU GRUB 매뉴얼(`www.gnu.org/software/grub/manual/grub/`)의 Introduction·Overview·「Chain-loading」 절(절 번호는 열어서 확인), boot(7) |
| m | `dmesg` | `dmesg`가 커널 링 버퍼의 메시지를 출력한다는 것, 링 버퍼가 무엇이고 가득 차면 어떻게 되는지(근거가 있으면), 커널 메시지에 무엇이 담기는지(장치를 찾은 결과·오류 — 근거가 있는 만큼). **`/var/log/dmesg` 파일이 허용한 출처에 있는지**(없을 것으로 본다 — 아래 4의 후보). 오답 보기의 `/var/log/btmp`·`/var/log/lastlog`·`/var/log/cron`이 무엇인지 허용한 출처에 있는 만큼(utmp(5)의 btmp, lastlog(8)) | dmesg(1)(util-linux), syslog(2)(커널 로그 버퍼), utmp(5), lastlog(8)(shadow-utils 또는 util-linux — 어느 것인지 적는다) |
| n | `runlevel` | 실행 레벨이 무엇인지와 그 유래(System V init), 0~6 각각의 뜻, **systemd에서 번호와 타깃의 대응**(runlevel(8)의 표), 타깃이 무엇인지, `runlevel` 명령이 보여 주는 것(앞 레벨·지금 레벨), `init 번호`·`telinit 번호`가 레벨을 바꾼다는 것과 systemd에서의 대응 | runlevel(8), telinit(8), systemd.special(7)(`graphical.target`·`multi-user.target`·`rescue.target`·`poweroff.target`·`reboot.target`), boot(7)의 run level 절, init(1) |
| o | `shutdown-commands` | `shutdown`의 꼴(`shutdown [옵션] [시각] [메시지]`), `-h`·`-r`·`-P`·`-H`의 뜻(`-h`가 poweroff인지 halt인지), 시각 `now`·`+m`·`hh:mm`, `poweroff`·`halt`·`reboot`가 각각 하는 일과 **`halt`가 전원까지 끄는지**, `init 0`·`init 6`(telinit)의 결과 | shutdown(8), halt(8)(poweroff·reboot를 함께 싣는다), telinit(8) |

빠진 것을 읽다가 찾으면 더한다. 다만 기출이 묻지 않는 것을 공식 문서에 있다는 이유만으로 끌어오지 않는다(ADR-059 「범위」) — 「바탕」이 되는 사실만 더한다.

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 76) <문서 이름> — <절 제목>`, URL 한 줄, **읽은 판** 한 줄(man 페이지의 프로젝트·판·날짜, POSIX 2024년판, GRUB 매뉴얼의 판), 직접 쓴 사실 한 줄씩 끝에 `— 절 이름이나 번호`, 「쓰인 곳」.
  같은 문서의 기존 항목(phase 75의 boot(7)·proc(5)·du(1) 등)이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 76)」을 붙인 줄로 더한다. man 페이지 여럿을 한 항목에 묶어도 된다(phase 75의 Linux man-pages 항목이 본보기).
- 머리말의 「(phase 75)」 설명들 뒤에 「(phase 76)」이 무엇인지 한 줄을 더한다 — 이 phase의 Linux 두 주제가 쓸 사실이고, 강의 밖 주제라 공식 문서만 근거라는 것, 확인한 날.
- 「쓰인 곳」에는 아직 개념 id가 없으므로 **쓰일 개념 id**(`linux-process-boot.crontab-fields` 등)와 exam-notes 번호를 적는다.
- 같은 명령의 페이지가 둘 이상이면(`crontab(1)`과 `crontab(1p)`, procps-ng와 util-linux의 `kill(1)`) 어느 페이지인지 항목에 적는다(guide.md 「출처」).

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 주제의 기출 24문항이 정답으로 보는 것(과, 「옳지 않은 것」을 고르는 문항에서 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 `## E24 — …`부터 번호를 이어 더한다(E19~E23 형식 — 시험·표준·처리·쓰인 곳).
공식 문서에 있으면 항목을 만들지 않는다. E19 앞의 「phase 75 step 0에서 …」 문단처럼 이 step이 본 문항 수와 더한 항목을 소개하는 문단을 새 항목 앞에 둔다(확인한 날 포함). 항목이 없으면 그 문단만 둔다.

미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다. 「표준」 칸은 「공식 문서」로 읽는다.

- **부팅 때의 커널 메시지 파일 `/var/log/dmesg`**([기출 2024-08-25 #35]·[2026-08-02 #38]): 시험은 부팅 때 남은 커널 메시지(하드웨어·디스크·메모리·CPU·커널의 이상)를 담은 로그 파일로 `/var/log/dmesg`를 고른다.
  dmesg(1)은 커널 링 버퍼를 출력하는 명령이고, 그 파일 이름은 허용한 출처에 없을 것으로 본다. 처리 후보: 본문은 「커널 메시지는 링 버퍼에 쌓이고 `dmesg`로 본다」를 쓰고 「자격시험은 부팅 때의 커널 메시지가 `/var/log/dmesg`에 남는다고 본다」를 덧붙인다. 도식에는 그 파일을 그리지 않는다.
- **`halt`를 끄는 명령으로 보는 것**([기출 2025-02-23 #37]): 시험은 서버를 끄는 명령으로 `shutdown -h now`·`poweroff`·`halt`를 맞는 것으로, `init 6`을 아닌 것으로 둔다. halt(8)이 `halt`를 「멈추기」(전원은 끄지 않을 수 있다)로 말하면,
  처리 후보는 「본문은 `halt`가 시스템을 멈추는 명령이고 전원을 끄는 것은 `poweroff`라고 쓴다 — 시험은 `halt`도 서버를 끄는 명령으로 본다」를 덧붙일지 판정한다. 둘이 어긋나지 않는다고 보면 항목을 만들지 않는다.
- **`free`의 「가상 메모리」**([기출 2025-05-25 #33]): 시험은 `free`가 공유 메모리와 「가상 메모리」의 정보를 보여 준다고 한다. free(1)이 보이는 것은 Swap 줄이다 — 시험의 「가상 메모리」가 스왑을 가리키는 것이면 처리 후보는 「자격시험은 스왑을 가상 메모리라고 부른다」. 판정해서 필요할 때만.
- **`top`의 「가장 우선순위가 높은 프로세스」**([기출 2024-11-03 #34]): 시험은 이것을 틀린 설명으로 둔다. top(1)의 기본 정렬이 %CPU이면 시험과 출처가 같으므로 항목을 만들지 않는다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`linux-process-boot`의 개념 15개마다 한 줄씩: **무엇을 쓸 수 있는지(출처와 함께), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호)**.
위 표의 a~o마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다. 같은 명령의 페이지가 둘이면 어느 것을 따르기로 했는지 적는다.
끝에 「사용자 확인」 칸을 둔다 — 사용자가 정해야 할 것(예: 허용한 출처로 댈 수 없는데 기출이 거듭 묻는 사실, 허용 목록 밖의 출처가 꼭 필요한 곳)이 있으면 적고, 없으면 「없음」.

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 읽은 판을 적었는지, 문장이 원문을 옮기지 않았는지 다시 본다. man 페이지·POSIX·GRUB 매뉴얼과 기출 문장 모두 옮기지 않는다.
4. `phases/76-network-linux-process-accounts/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없거나 gnu.org가 끝내 열리지 않아 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유(무엇이 열리지 않았는지, 그때까지 확인한 것)를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 1~8이 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **허용한 출처 밖의 문서(위키백과·블로그·자격증 교재·배포판 업체의 학습 페이지·Q&A 사이트)를 근거로 쓰지 마라.** 이유: ADR-059.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **`linux-accounts`의 사실(계정 파일의 칸·`useradd`·`chage`·`last`·`lastb`)을 이 step에서 정리하지 마라.** 이유: step 9의 범위다. 읽다가 본 것은 summary에 메모만 한다.
  단 m의 `/var/log/btmp`처럼 이 주제의 기출 보기가 기대는 한 줄은 이 step에서 확인한다.
- **`lecture-outline.md`·`interview-facts.md`를 고치지 마라.** 이유: 강의·면접은 이 주제를 다루지 않는다.
- **`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 이 phase는 새 출처를 더하지 않는다. 허용 목록 밖의 출처가 꼭 필요하면 쓰지 말고 「사용자 확인」에 적는다.
