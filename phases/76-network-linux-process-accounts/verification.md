# phase 76 검증 보고

확인한 날: 2026-11-05(Windows PC). 브랜치 `feat-76-network-linux-process-accounts`(origin/develop 7c97f84에서 분기), 설계 커밋 7523032·e3dd990, phase 완료 커밋 c4ca5e8.
설계는 사용자가 승인했다(11-04 「승인, 쭉 실행」). 실행은 `scripts/execute.py --agent claude`를 저장소 밖 `p76-run\run-chunk.cmd`로 WMI에서 띄우고, 그 위의 감독 스크립트(`supervisor.ps1`)가 남은 step을 이어 돌렸다.
사용자 지시(문제 없으면 멈추지 않음, 「다 되면 알아서 마무리해놔 바로 종료할 수 있게」)대로 error·AC 실패·결정 거리가 있을 때만 멈추게 했고, 마무리(통독·AC·화면 실측·이 보고서)까지 메인 세션이 했다. 배포(push)는 하지 않았다.

phase 75처럼 강의가 없는 주제다. 사실은 공식 문서(man7.org — procps-ng·util-linux·psmisc·coreutils·systemd·cronie·shadow-utils·man-pages, POSIX.1-2024, GNU GRUB 매뉴얼 2.14)에서만 가져왔고, 기출은 답의 출처로만 썼다(ADR-057·059). `sourcePages`는 `[0, 0]`이다.

## step별 결과

| step | 걸린 시간 | 결과 | 테스트 |
|---|---|---|---|
| 0 process-boot-sources | 35분(아래 「실행 중에 일어난 일」) | `linux-process-boot`가 쓸 사실(standards.md 「(phase 76)」 항목 9개와 기존 항목에 줄), exam-notes E24~E26 | — |
| 1 process-ps | 21분 | 개념 1 프로세스·2 ps 명령, n145~n147 — 주제 `linux-process-boot` 만듦 | 7029 |
| 2 top-process-commands | 13분(+ 한도로 끊긴 첫 시도 약 12분) | 개념 3 top 명령·4 프로세스를 다루는 명령, n148~n149 | 7077 |
| 3 free-daemon | 21분 | 개념 5 free 명령·6 데몬, n150~n151 | 7125 |
| 4 systemctl-cron | 22분 | 개념 7 systemctl 명령·8 cron 데몬, n152~n153 | 7175 |
| 5 crontab | 22분 | 개념 9 crontab의 시간 칸·10 crontab 명령, n154~n156 | 7225 |
| 6 boot-grub | 18분 | 개념 11 부팅 과정·12 GRUB 부트 로더, n157~n158 | 7275 |
| 7 dmesg-runlevel | 22분 | 개념 13 커널 메시지와 dmesg·14 실행 레벨, n159~n161 | 7325 |
| 8 shutdown-commands | 14분 | 개념 15 시스템을 끄고 다시 시작하는 명령, n162 — `linux-process-boot` 완성(개념 15·문항 18) | 7350 |
| 9 accounts-sources | 24분 | `linux-accounts`가 쓸 사실(「(phase 76 step 9)」 항목 넷과 기존 항목에 줄), E 항목 없음 | — |
| 10 account-passwd | 19분 | 개념 16 사용자 계정과 UID·17 /etc/passwd 파일, n163~n165 — 주제 `linux-accounts` 만듦 | 7400 |
| 11 shadow-useradd | 21분 | 개념 18 /etc/shadow 파일·19 useradd 명령, n166~n167 | 7446 |
| 12 chage-login-records | 18분 | 개념 20 chage 명령·21 로그인 기록, n168~n170 — `linux-accounts` 완성(개념 6·문항 8) | 7492 |

결과: 개념 21개(`linux-process-boot` 15 ★★★ · `linux-accounts` 6 ★★☆), 문항 26개(n145~n170), 도식 21개(개념마다 하나), 새 테스트 508개(phase 시작 313파일·6984개 → 334파일·7492개). 걸린 시간은 index.json의 `started_at`~`completed_at`이다.

## 실행 중에 일어난 일

- **step 0이 30분 제한에 걸림(11-04 23:28).** 첫 에이전트가 1800초 안에 끝나지 않아 `execute.py`가 `TimeoutExpired`로 죽었다(exit 1, step 0은 pending 그대로, 작업은 커밋되지 않은 채 워킹 트리에 남음).
  감독이 곧바로 다시 띄웠고, 새 에이전트가 남은 작업을 읽고 이어받아 2분 만에 마무리해 직접 커밋했다(62af840). 같은 기록이 두 번 들어가거나 반쯤 끊긴 곳이 없는지 standards.md·exam-notes.md를 메인 세션이 확인했다.
  원인은 개념 15개의 사실을 한 step에서 확인하는 양(phase 75 step 0은 개념 11개에 27분)과, www.gnu.org가 응답하지 않아 기다린 시간으로 본다. GRUB 매뉴얼은 설계 때 더한 대안대로 ftp.gnu.org의 grub-2.14 배포본에 든 매뉴얼을 읽었다(e3dd990).
- **사용량 한도 한 번(11-05 00:06).** step 2 첫 시도가 한도에 걸렸다. 감독이 `phases/index.json`을 되돌리고 step 2를 pending으로 돌리는 커밋(94e5d38)을 남긴 뒤 한도가 풀리자(00:36) 다시 돌렸다.
  첫 시도가 반쯤 커밋한 작업(1b3f808 — 개념·문항·문구와 도식 테스트 하나)은 되돌리지 않고 다시 돈 step 2가 이어받아 마무리했다(05f4ca7). 끝 상태의 테스트·구조·교차 검사는 모두 통과한다.
- 그 밖에는 끊김이 없었다. 출처 step 둘(0·9)의 「사용자 확인」은 모두 「없음」이다.

## 설계와 달라진 것

모두 step summary에 이유가 있고, 받아들였다. 사실과 정답 논리를 바꾼 것은 없다.

- **출처에 없는 것은 쓰지 않음.** `top`의 기본 정렬 칸, cron이 로그인 없이도 실행한다는 문장, 링 버퍼가 차면 덮어쓴다는 문장, 커널 메시지가 장치를 찾은 결과를 담는다는 문장, `crontab -u`를 누가 쓸 수 있는지,
  `ps -ef`·`free`·`last`·`chage -l`의 출력 원문, `btmp`를 누가 읽을 수 있는지, `adduser`(man7.org에 없음), init이 로그인 화면을 띄운다는 문장. 그래서 출력은 「칸 이름과 값」으로 풀어 보였고(TTY 값은 뺌), 문항은 step 문서의 대안 방향을 썼다(n148 「%CPU가 크면 우선순위가 높은가」, n153 「한 번 실행하면 줄이 지워지나」).
- **문항을 더 판단하게 바꿈.** n145·n147은 예/아니요 방향을 맞바꿨다(n147을 「옵션 없는 `ps`로 데몬 `sshd`를 확인할 수 있나」 상황 문항으로 — 균형 그대로). n154는 `0 22 15 * *`의 15가 요일·월로 읽힐 수 없어 오답이 성립하지 않으므로 `0 22 5 * *`로 바꿨다.
  n159는 「새로 단 디스크」 대신 출처에 있는 「부팅 중 커널이 남긴 오류나 경고」로, n149·n157은 답의 이유를 먼저 알려 주던 문제문을 고쳤다. n163은 두 후보 가운데 「이름을 바꿔도 UID가 같으면 파일의 주인이 그대로인가」를 골랐다.
- **도식.** `nice`는 실행 중인 프로세스를 가리킬 수 없어 `renice 10 2310`을 함께 그렸다. `bash`와 PID 1 사이의 프로세스는 출처로 정할 수 없어 점선으로 두고 범례에 밝혔다. dmesg 도식은 「가득 차면」 대신 `dmesg --level=err,warn` 시나리오를 두었고 `/var/log/dmesg`는 어디에도 그리지 않았다.
  실행 레벨 표는 280 폭에 세 칸이 들지 않아 상태 이름을 줄 테두리 라벨로 올렸다. `/etc/shadow` 예 줄의 최대 사용 기간을 60으로 두어 `chage -M 90`이 무엇을 바꾸는지 보이게 했다.

## 사용자가 볼 것

시험의 답이 공식 문서와 어긋나거나 공식 문서에 없는 곳은 ADR-059의 규칙(충돌하면 공식 문서, 시험 쪽 표현은 「자격시험은」 줄)대로 처리했다 — 사용자 결정이 필요하지 않다고 봤다.

- **E24** — 시험은 `free`가 「가상 메모리」 정보를 보여 준다고 한다. free(1)은 물리 메모리와 스왑이라 부른다 — 본문은 공식 문서의 말로 쓰고 「자격시험은 스왑 쪽 정보를 가상 메모리의 정보라고 부른다」를 붙였다.
- **E25** — 시험은 부팅 때의 커널 메시지가 `/var/log/dmesg`에 남는다고 본다. 허용한 출처 어디에도 그 파일이 없다(dmesg(1)·syslog(2)·bootparam(7)·boot(7)·bootup(7)·journald·FHS §5.10.2 등을 봄). 본문은 「링 버퍼에 쌓이고 `dmesg`로 본다」를 쓰고 「자격시험은」 줄을 붙였다. 그 파일을 정답으로 고르게 하는 문항은 내지 않았다.
- **E26** — 시험은 시스템 상태와 끄기·다시 시작을 실행 레벨 번호(`init 0`·`init 6`, runlevel 5)로 묻는다. 실행 레벨은 systemd에서 호환용이므로, 본문은 번호와 타깃의 짝을 함께 가르치고 「자격시험은」 줄을 붙였다.
- `halt`는 systemd에서 전원을 켜 둔 채 멈춘다(halt(8)). 시험은 `halt`를 서버를 끄는 명령으로 두는데, 둘이 어긋나지 않는다고 판정해 E 항목 없이 본문에 「`halt`도 시스템을 끝낸다 — systemd에서는 전원을 켜 둔다」로 썼다.

**메인 세션 통독 뒤 고친 곳** — 모두 표현만이고 사실·정답은 그대로다.

- n166~n170의 해설 다섯이 「~습니다」체였다. 과목의 다른 해설 165개가 모두 「~다」체라 맞췄다(n167은 약어 GID에 풀이를 더함). 다섯 모두 187자 이상(318~448자).
- `linux-accounts.useradd` 본문 「`-g`와 `-G`는 글자의 크기만 다르지만」 → 「대소문자만 다르지만」(step 11·12가 적은 후보).
- `linux-process-boot.runlevel` 첫 문단의 「init은 부팅할 때 커널이 만드는 첫 프로세스다.」를 지웠다 — 같은 주제의 `process`·`boot-sequence`가 이미 푼 낱말의 되풀이다(step 8이 적은 후보).
- 그대로 둔 것: n145(같은 프로그램을 두 번 실행하면 PID가 다른 프로세스 둘인가 — 예)는 쉬운 편이지만 답의 이유를 문제문이 알려 주지는 않는다. n162의 `shutdown -r now`에서 `-r`이 `reboot`를 떠올리게 할 수 있다 — 오답 셋이 끄기·멈추기라 개념을 가르는 데는 문제가 없다.
  `etc-shadow` 끝 문단과 `chage` 첫 문단이 「기간 칸은 chage로 바꾼다」를 되풀이하지만, 앞 것은 한 줄 소개라 그대로 두었다.

## 남겨 둔 것

- exam-notes에 E24~E26 셋을 더했다(`linux-accounts`는 E 항목 없음). 강의 수정 이력(L 항목)은 없다 — 강의가 없는 주제다.
- `check-verbatim`은 공식 문서를 대조하지 못한다(ADR-059 「트레이드오프」). 공식 문서 문장과 가까운지는 step마다 자기 검수로 봤다(step 3은 available 정의를 free(1) 문장 번역처럼 읽혀 다시 썼다).
- 이 PC에서 www.gnu.org와 man7.org의 IPv6가 응답하지 않는 때가 있었다 — step들은 ftp.gnu.org 배포본과 `curl -4`로 읽었다. 다음 phase의 출처 step에도 같은 대안을 적어 두면 좋다.

## 병합 때 볼 것

origin/develop은 분기한 7c97f84 그대로다. `git merge-tree`로 시험 병합하면 충돌이 없다. 바뀐 파일은 network의 `topics.json`·`questions.json`·`visuals/linux-process-boot.json`·`visuals/linux-accounts.json`·`index.ts`, 새 도식 21개와 테스트,
`registry.ts`, `docs/source/network/standards.md`·`exam-notes.md`, `phases/index.json`과 phase 76 메타데이터뿐이다.

## 다시 돌린 검증 (phase가 끝난 뒤, 통독 수정까지 넣은 상태)

실행 프로세스가 모두 끝난 뒤라 부하가 겹치지 않았다.

- `npm run build` 통과, `npm run lint` 종료 코드 0, `npm test` 334파일·7492개 통과.
- `check-structure` 「구조 이상 없음」.
- 교차 검사 「✓ 교차 없음 — 세로 노드 1653개·경로 1058개, 가로 노드 1653개·경로 1058개」(phase 시작 1460/975에서 +193/+83).
- `check-verbatim --subject network` 「전사 이상 없음 — network: 원본 2개, 단위 1486개」. 원본 2개를 실제로 대조했다.
- 문항 170개(n145~n170 26개), 예 31·아니요 31, 정답 위치 27/27/27/27 — 균형 규칙 안이고 설계의 계획과 같다. phase의 26문항만 보면 예 6·아니요 6, 위치 3/4/3/4.
- 주제 15개(`linux-process-boot`·`linux-accounts`를 `linux-shell` 뒤에, importance 3·2, sourcePages [0, 0]), 개념 145(새 21 — 딸린 개념 11).
- **바뀌지 않아야 하는 것** — 설계 커밋 7523032의 기존 주제 13개·문항 144개를 지금 파일과 node로 통째로 견줘 차이 0. 기존 visuals 파일과 AWS·Azure 데이터는 diff가 없다.
- **문항 26개를 메인 세션이 통독**했다. 계산·결과가 든 문항(n146 PPID 3150, n150 16000000 − 10000000 = 6000000, n154 `0 22 5 * *` → 매달 5일 22:00과 오답 셋의 셈, n155 요일 0, n162 `reboot`, n164 넷째 칸 2003, n166 20500 = 2026-02-16, n168 `-W 14`)은 손으로 다시 풀어 정답 키와 같다.

## 화면 확인 (headless Chrome + CDP, 개발 서버 `127.0.0.1:5274`)

설치된 Chrome을 headless로 띄우고 저장소의 `ws`로 CDP를 몰았다(스크립트는 저장소 밖 `p76-run\measure-p76.cjs` — phase 75의 측정기를 두 주제로 좁혔다). 폭 320·390(배율 2, 모바일)과 1180(배율 1).
측정기가 실제로 결함을 잡는지는 결함을 일부러 넣는 자가 시험으로 먼저 확인했다(곁말을 SVG 밖으로, 노드 라벨을 상자보다 길게, 곁말끼리 겹치게, 그룹 라벨을 테두리 위로 — 세 폭·두 주제 모두에서 잡아 합계 66건).

- **넘침** — 세 폭에서 두 주제 모두 페이지 가로 넘침 0. 모든 시나리오 버튼을 누른 뒤에도 0. 도식 폭은 320·380, 1180에서는 가로형 638·621.
- **도식 21개의 모든 시나리오**(폭마다 87개 상태 — `linux-process-boot` 63, `linux-accounts` 24)를 하나씩 눌러 보이는 SVG 글자를 화면 픽셀로 쟀다.
  SVG 밖으로 나간 글자 0, 노드 라벨이 자기 상자보다 넓은 곳 0, 글자끼리 겹친 곳 0, 곁말이 노드 상자에 겹친 곳 0, 곁말·라벨이 그룹 박스 테두리에 걸친 곳 0.
  검사가 실제로 요소를 보는지는 그룹 박스 100개·노드 805개·글자 944개(한 폭 기준)를 세어 확인했다.
- 콘솔에는 기존의 vite 연결 알림·React 개발 안내·React Router future flag 경고 둘만 있다(새 것 없음).
- 캡처해서 눈으로 본 것: `SystemctlActionsDiagram`(320, status — 바뀌는 것 없음), `PasswordAgingDiagram`(320, -l — 0일째·83일째·90일째와 `-M 90`·`-W 7`), `ShutdownCommandsDiagram`(1180, 다시 시작 — `shutdown -r now`·`reboot`·`init 6` → 다시 켜진다) — 칸·곁말·캡션이 제자리에 있고 값이 본문과 같다.

## 배포 방법(「배포」 승인 뒤)

phase 75와 같다 — network worktree에서 origin/develop(7c97f84) 위에 `merge --no-ff feat-76-network-linux-process-accounts`로 develop 병합 커밋을, 그 위에 origin/main(0e2da1e)에서 release 커밋을 만든 뒤
`git fetch`로 원격이 그대로인지 확인하고 `git push origin <병합>:refs/heads/develop` → `git push origin <release>:refs/heads/main`(단독 명령) → Pages 성공과 공개 번들에 새 주제 id·n170이 있는지 확인한다.
