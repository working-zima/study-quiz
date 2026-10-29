# Step 0: filesystem-sources

## 배경

phase 75는 네트워크 과목의 강의 밖 주제 `linux-filesystem`(Linux 파일 시스템과 디스크)·`linux-permissions`(Linux 파일 권한과 소유자)·`linux-shell`(Linux 셸과 기본 명령)을 만든다. 전체 계획과 결정은 `phases/75-network-linux-basics/guide.md`에 있다.
step 1~6이 `linux-filesystem`의 개념 11개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 허용한 공식 문서로 확인하고 출처 문서에 남긴다.**
데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

이 주제는 강의가 다루지 않으므로 **사실의 출처는 공식 문서 하나뿐이다**(ADR-059). 이 step이 확인하지 않은 사실은 뒤 step이 쓸 수 없다고 생각하고 빠짐없이 확인한다.
기출 18문항이 묻는 것은 디렉터리 구성(`/etc` 4회, `/proc` 2회, `/usr`·`/var`·`/boot`·`/tmp` 3회, 홈 디렉터리), 스왑 4회, `/etc/fstab`, `/dev/sda5`의 해석, 파티션 명령(`fdisk`·`gdisk`), 새 디스크를 붙이는 차례, `lsattr`이다.

## 읽어야 할 파일

- `phases/75-network-linux-basics/guide.md` — 특히 「세 주제와 개념 29개」의 `linux-filesystem` 표, 「예시 값」, 「출처」
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리, 가리키는 표기. **이 규칙을 따른다**
- `docs/source/network/topic-map.md` — 「출처 영역」과 「분류 메모」의 Linux 경계
- `docs/source/network/standards.md` — 머리의 규칙과 「(phase 74)」 줄들, 끝의 「(phase 74 step 11) Linux man-pages」 항목(man 페이지 항목의 형식이 본보기다 — 읽은 판을 적는다)
- `docs/source/network/exam-notes.md` — E15~E18의 형식과 그 앞 소개 문단
- `docs/ADR.md`의 **ADR-059**(특히 「출처」·「기출의 자리」·「트레이드오프」), **ADR-057**, **ADR-009**
- `docs/source/network/raw/exam/data.txt`에서 `X-linux` 줄 가운데 이 주제의 18문항과 그 문항(시험 날짜·번호로 `raw/exam/`의 교사용 텍스트에서 찾는다) —
  [기출 2024-02-25 #28·#45], [기출 2024-05-19 #37], [기출 2024-08-25 #31·#33·#44], [기출 2024-11-03 #32·#33·#45], [기출 2025-02-23 #43·#45], [기출 2025-05-25 #29·#41], [기출 2025-08-24 #33], [기출 2025-11-02 #30·#32], [기출 2026-02-01 #29], [기출 2026-08-02 #31].
  시험이 무엇을 정답으로 보는지와, 오답 보기 가운데 시험이 맞는 말로 두는 것만 본다. 문장을 옮기지 않는다

## 작업

### 1. 허용하는 출처에 GPT fdisk 문서를 더한다 (사용자 결정 2026-10-30)

`gdisk`는 man7.org에 페이지가 없다. 사용자가 **`gdisk`를 만든 사람의 공식 문서(`rodsbooks.com`의 GPT fdisk 페이지)를 `gdisk`의 사실에만 쓰기로** 정했다(phase 72의 Cisco 제품 문서와 같은 방식).
ADR-059 「목록에 없는 곳은 … 쓰기로 하면 … 먼저 더하고 쓴다」대로, 사실을 적기 전에 두 곳에 더한다.

- `docs/source/network/CLAUDE.md` 「허용하는 출처」의 「스위치 업체 기술」 항목 뒤에 **「`gdisk`」** 항목 하나 — `rodsbooks.com`의 GPT fdisk 문서(GPT fdisk를 만든 Rod Smith의 공식 문서)이고,
  `linux-filesystem`이 `gdisk`가 무엇을 하는 도구인지에만 쓴다(phase 75, 사용자 결정 2026-10-30). GPT·MBR의 일반 사실은 man7.org(fdisk(8))에서 가져온다. 어느 판의 문서인지 `standards.md` 항목에 적는다.
- `docs/source/network/topic-map.md` 「출처 영역」의 「스위치 업체 기술」 줄 뒤에 같은 내용의 줄 하나, 주제 지도 표의 `linux-filesystem` 행 「출처」 열 끝에 `, GPT fdisk 문서`.
  표의 다른 칸과 다른 행은 고치지 않는다(`data.test.ts`가 이 표를 읽는다 — 끝에 `npm test`로 확인한다).

### 2. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 `man7.org`(Linux man-pages — 페이지 끝의 「COLOPHON」에 어느 프로젝트의 어느 판인지 적혀 있다), `refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.html`(FHS 3.0),
`pubs.opengroup.org`(POSIX — 2024년판 `onlinepubs/9799919799/`), `www.rodsbooks.com/gdisk/`(`gdisk`에만)이다. 위키백과·블로그·배포판 업체의 학습 페이지는 쓰지 않는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `directory-hierarchy` | 모든 파일과 디렉터리가 루트 디렉터리 `/` 아래 나무 하나에 있다는 것, 경로(절대 경로)가 `/`부터 디렉터리 이름을 `/`로 잇는다는 것, FHS가 무엇이고 누가 정했는지(판 3.0), 루트 디렉터리와 `/root`가 다르다는 것 | FHS 3.0 머리말·ch.2·ch.3, POSIX Base Definitions §3 「Absolute Pathname」·「Pathname」, §4.16 「Pathname Resolution」(절 번호는 열어서 확인), hier(7) |
| b | `standard-directories` | `/bin`·`/sbin`·`/lib`·`/boot`(커널이 여기 있는지)·`/dev`·`/etc`·`/home`·`/root`·`/tmp`·`/usr`(여러 사용자가 함께 쓰는 읽기 전용 데이터 — 사용자 계정 자리가 아니다)·`/var`(`/var/log`·메일)·`/proc`의 쓰임과 FHS 절. 요즘 배포판이 `/bin`·`/sbin`·`/lib`를 `/usr` 아래와 합쳐 두는 것이 허용한 출처에 있는지 | FHS 3.0 ch.3·ch.4·ch.5·ch.6, hier(7), file-hierarchy(7)(man7.org의 systemd 페이지) |
| c | `etc-directory` | `/etc`가 그 컴퓨터의 설정 파일을 두는 곳이고 실행 프로그램을 두지 않는다는 것, `/etc/passwd`가 사용자 계정 목록·`/etc/shadow`가 암호 정보라는 것과 `/etc/shadow`를 일반 사용자가 읽지 못하게 둔다는 것, `/etc/fstab`이 `/etc`에 있다는 것 | FHS 3.0 §3.7, passwd(5), shadow(5), fstab(5) |
| d | `proc-filesystem` | `/proc`이 디스크에 저장된 파일이 아니라 커널의 자료를 파일 꼴로 보여 주는 가상(pseudo) 파일 시스템이라는 것, 프로세스마다 PID 이름의 디렉터리가 있다는 것, `/proc/cpuinfo`·`/proc/meminfo`가 무엇을 보여 주는지 | proc(5)과 그 하위 페이지(proc_pid(5)·proc_cpuinfo(5)·proc_meminfo(5) — 있으면), FHS 3.0 ch.6의 `/proc` 절 |
| e | `partition` | 파티션이 무엇인지(디스크를 나눈 구역), 파티션 테이블이 무엇이고 디스크의 어디에 있는지, `fdisk`가 하는 일(파티션 테이블을 만들고 고친다), `fsck`가 하는 일(파일 시스템 점검·복구) | fdisk(8) DESCRIPTION, fsck(8) |
| f | `mbr-gpt` | MBR(fdisk(8)의 DOS-type): 첫 섹터의 주 파티션 넷(번호 1~4), 확장 파티션과 그 안의 논리 파티션(번호 5부터), 시작·크기를 32비트 섹터 수로 적어 512바이트 섹터면 2TB까지라는 것. GPT: 64비트 주소, 파티션 수(도구가 흔히 128개로 둔다), 첫 섹터의 보호용 MBR. 섹터가 무엇인지. 지금의 `fdisk`가 GPT도 다룬다는 것. **`gdisk`**가 무엇을 하는 도구인지(GPT 디스크용 파티션 도구 — 1의 출처 추가 뒤 rodsbooks.com에서) | fdisk(8) 「DISK LABELS」, `www.rodsbooks.com/gdisk/` |
| g | `disk-device-names` | `/dev`에 장치 파일을 둔다는 것, `sd` 이름의 꼴(`sd` + 디스크 글자 + 파티션 번호)과 `sd`가 무슨 드라이버인지, 파티션 1~4와 5부터의 뜻, 디스크 전체를 가리키는 이름(`/dev/sda`). **SATA 디스크도 `sd` 이름을 쓰는지**가 허용한 출처에 있는지 | sd(4), FHS 3.0 §3.6, hier(7), fdisk(8) |
| h | `filesystem-mount` | 파일 시스템이 무엇인지(파티션에 파일을 저장하는 구조 — ext4를 예로), `mkfs`가 하는 일과 그것이 형식별 명령(`mkfs.ext4` 등)의 앞단이라는 것, 마운트와 마운트 지점, `mount 장치 디렉터리` 꼴, `umount`. 새 디스크를 쓰는 차례(나누기 → 만들기 → 붙이기)를 출처의 사실로 댈 수 있는지(명령 셋의 하는 일에서 이어지면 그렇다고 적는다) | mkfs(8), mkfs.ext4(8)(mke2fs), mount(8), umount(8), ext4(5) |
| i | `fstab` | 칸 여섯의 이름과 뜻(fs_spec·fs_file·fs_vfstype·fs_mntops·fs_freq·fs_passno), 장치를 UUID로도 적는다는 것, 부팅할 때 이 파일의 항목이 마운트된다는 근거(`mount -a`가 이 파일을 읽는다는 것, systemd가 이 파일로 마운트 단위를 만든다는 것 — 무엇을 근거로 「부팅 때 자동으로」라고 쓸 수 있는지), `noauto` | fstab(5), mount(8)의 `-a`, systemd-fstab-generator(8)(man7.org) |
| j | `swap` | 스왑이 무엇인지(메모리가 모자랄 때 쓰는 디스크의 공간 — 커널이 메모리 페이지를 옮겨 둔다), 스왑 파티션과 스왑 파일, `mkswap`과 `swapon`, 설치 뒤에도 더할 수 있다는 근거(스왑 파일을 만들어 켜는 절차가 있는지), `/etc/fstab`의 스왑 항목. 디스크가 메모리보다 느리다는 것과 크기 권고(「메모리의 두 배」)가 허용한 출처에 있는지 | mkswap(8), swapon(8), fstab(5) |
| k | `file-attributes` | `chattr`·`lsattr`이 하는 일, `i` 속성의 뜻(바꾸기·지우기·이름 바꾸기·링크 만들기·쓰기로 열기를 막는다)과 그것을 붙이고 떼는 사람(슈퍼유저나 CAP_LINUX_IMMUTABLE), 다른 속성 하나(`a` — 덧붙이기만)를 쓸지, `lsattr` 출력의 꼴. root가 보통은 권한 검사를 거치지 않는다는 것(그래서 `i`가 권한과 다르다) | chattr(1), lsattr(1), capabilities(7)의 CAP_DAC_OVERRIDE·CAP_LINUX_IMMUTABLE |

빠진 것을 읽다가 찾으면 더한다. 다만 기출이 묻지 않는 것을 공식 문서에 있다는 이유만으로 끌어오지 않는다(ADR-059 「범위」) — 「바탕」이 되는 사실만 더한다.

### 3. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 75) <문서 이름> — <절 제목>`, URL 한 줄, **읽은 판** 한 줄(man 페이지의 프로젝트·판·날짜, FHS 3.0, POSIX 2024년판), 직접 쓴 사실 한 줄씩 끝에 `— 절 이름이나 번호`, 「쓰인 곳」.
  같은 문서의 기존 항목이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 75)」를 붙인 줄로 더한다. man 페이지 여럿을 한 항목에 묶어도 된다(「(phase 74 step 11) Linux man-pages — …」가 본보기).
- 머리말의 「(phase 74 …)」 설명들 뒤에 「(phase 75)」가 무엇인지 한 줄을 더한다 — 이 phase의 Linux 세 주제가 쓸 사실이고, 강의 밖 주제라 공식 문서만 근거라는 것, 확인한 날.
- 「쓰인 곳」에는 아직 개념 id가 없으므로 **쓰일 개념 id**(`linux-filesystem.mbr-gpt` 등)와 exam-notes 번호를 적는다.

### 4. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 주제의 기출 18문항이 정답으로 보는 것(과, 「옳지 않은 것」을 고르는 문항에서 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 `## E19 — …`부터 번호를 이어 더한다(E15~E18 형식 — 시험·표준·처리·쓰인 곳).
공식 문서에 있으면 항목을 만들지 않는다. E15 앞의 「phase 74 step 5에서 …」 문단처럼 이 step이 본 문항 수와 더한 항목을 소개하는 문단을 새 항목 앞에 둔다(확인한 날 포함). 항목이 없으면 그 문단만 둔다.

미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다. 「표준」 칸은 「공식 문서」로 읽는다.

- **GPT에는 `gdisk`**([기출 2026-02-01 #29]): 시험은 2TB가 넘는 새 디스크를 GPT로 나누기에 가장 알맞은 명령으로 `gdisk`를 고르고 `fdisk`를 오답으로 둔다. fdisk(8)은 지금 GPT도 다룬다고 말한다.
  처리 후보: 본문은 「`fdisk`는 MBR·GPT를 모두 다루고 `gdisk`는 GPT용으로 따로 만든 도구」로 쓰고, 「자격시험은 GPT 디스크를 나누는 명령으로 `gdisk`를 고른다」를 덧붙인다.
- **`/dev/sda5`의 해석**([기출 2024-08-25 #44]): 시험은 「SATA로 이어진 디스크를 쓴다」와 「디스크의 다섯 번째 파티션」을 맞는 해석으로 둔다. sd(4)는 `sd`를 SCSI 디스크로, 5를 첫 논리 파티션으로 말한다.
  SATA가 허용한 출처에 없으면, 본문은 출처대로 쓰고 「자격시험은 `sd`를 SATA 디스크로 본다」를 덧붙이는지 판정한다. 「다섯 번째 파티션」은 파티션 번호 5라는 뜻이면 출처와 어긋나지 않는다 — 그렇게 판정하면 항목을 만들지 않는다.
- **스왑 크기**([기출 2024-02-25 #45]): 시험은 「옳지 않은 것」을 고르는 문항에서 「실제 메모리의 두 배 정도가 알맞다」와 「스왑이 잦으면 메모리를 늘려야 한다」를 맞는 말로 둔다. 허용한 출처에 크기 권고가 없으면 처리는
  E17의 선례처럼 「본문은 쓰지 않는다 — 시험이 맞는 말로 두는 보기라는 것만 남긴다」로 적는다.
- **`/etc`의 「암호 정보」**([기출 2024-02-25 #28]): shadow(5)가 `/etc/shadow`를 말하면 항목을 만들지 않는다.

### 5. summary — 뒤 step이 이것을 보고 쓴다

`linux-filesystem`의 개념 11개마다 한 줄씩: **무엇을 쓸 수 있는지(출처와 함께), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호)**.
위 표의 a~k마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다. 1의 출처 추가를 어디에 어떻게 적었는지 적는다.
끝에 「사용자 확인」 칸을 둔다 — 사용자가 정해야 할 것(예: 허용한 출처로 댈 수 없는데 기출이 거듭 묻는 사실)이 있으면 적고, 없으면 「없음」.

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다(특히 `src/data/network/data.test.ts`의 주제 지도 표 테스트 — `topic-map.md`의 표를 고쳤기 때문이다).
2. 바뀐 파일이 `docs/source/network/CLAUDE.md`·`topic-map.md`·`standards.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 읽은 판을 적었는지, 문장이 원문을 옮기지 않았는지 다시 본다. man 페이지·FHS·POSIX와 기출 문장 모두 옮기지 않는다.
4. `phases/75-network-linux-basics/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「5. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 1~6이 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **허용한 출처 밖의 문서(위키백과·블로그·자격증 교재·배포판 업체의 학습 페이지·Q&A 사이트)를 근거로 쓰지 마라.** 이유: ADR-059. rodsbooks.com은 `gdisk`의 사실에만 쓴다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **`linux-permissions`·`linux-shell`의 사실(권한 비트·`chmod`·`chown`·셸·리다이렉션·vi)을 이 step에서 정리하지 마라.** 이유: step 7·12의 범위다. 읽다가 본 것은 summary에 메모만 한다.
  단 k의 「root가 권한 검사를 거치지 않는다」처럼 이 주제의 개념이 기대는 한 줄은 이 step에서 확인한다.
- **`lecture-outline.md`·`interview-facts.md`를 고치지 마라.** 이유: 강의·면접은 이 주제를 다루지 않는다.
- **`docs/source/network/CLAUDE.md`·`topic-map.md`에서 1에 적은 것 말고 다른 곳을 고치지 마라.** 이유: 출처 목록과 주제 지도는 과목 전체의 규칙이다.
