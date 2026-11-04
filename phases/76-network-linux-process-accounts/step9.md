# Step 9: accounts-sources

## 배경

phase 76은 네트워크 과목의 강의 밖 주제 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획과 결정은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
step 10~12가 `linux-accounts`의 개념 6개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 허용한 공식 문서로 확인하고 출처 문서에 남긴다.**
데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

이 주제는 강의가 다루지 않으므로 **사실의 출처는 공식 문서 하나뿐이다**(ADR-059). 기출 8문항이 묻는 것은 `/etc/passwd`의 한 줄 해석(3회 — 암호 칸 `x`의 뜻, UID·GID, 기본 셸),
`chage -W`(암호 만료 며칠 전에 경고 — 2회), `useradd -g`(새 계정을 만들며 기본 그룹을 정하는 명령의 꼴), `lastb`(비인가자의 로그인 시도 이력 — 2회)다.

## 읽어야 할 파일

- `phases/76-network-linux-process-accounts/guide.md` — 특히 「두 주제와 개념 21개」의 `linux-accounts` 표, 「예시 값」, 「출처」
- `phases/76-network-linux-process-accounts/index.json`의 step 0 `summary`(같은 phase의 출처 step — 형식과, 이미 확인한 utmp(5)·lastlog(8)·`/var/log/btmp` 관련 사실)
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과 step 0이 더한 「(phase 76)」 항목들, phase 75의 passwd(5)·shadow(5)·capabilities(7) 항목. **있는 사실을 다시 찾지 않는다**
- `docs/source/network/exam-notes.md` — step 0이 더한 항목(있으면)과 E19~E23의 형식
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `docs/source/network/raw/exam/data.txt`에서 `X-linux` 줄 가운데 이 주제의 8문항과 그 문항(시험 날짜·번호로 `docs/source/network/raw/exam/`의 교사용 텍스트에서 찾는다) —
  [기출 2024-08-25 #29·#40], [기출 2024-11-03 #39], [기출 2025-02-23 #34], [기출 2025-05-25 #32], [기출 2026-02-01 #34·#35], [기출 2026-08-02 #33].
  시험이 무엇을 정답으로 보는지와, 오답 보기 가운데 시험이 맞는 말로 두는 것만 본다. `/etc/passwd`의 지문(그림)이 빠진 문항은 보기와 정답만 본다. 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 `man7.org`(man-pages 프로젝트의 credentials(7)·passwd(5)·group(5)·utmp(5), shadow-utils의 useradd(8)·usermod(8)·userdel(8)·chage(1)·passwd(1)·login.defs(5)·shadow(5)·pwconv(8)·lastlog(8), util-linux의 last(1)·lastb(1), coreutils의 id(1))와
`pubs.opengroup.org`(POSIX 2024년판 — Base Definitions의 User ID·Group ID·Supplementary Group ID 정의, `id` 유틸리티)다. 판을 적는다. 같은 이름의 페이지가 둘이면(예: man-pages와 shadow-utils의 passwd(5)) 어느 것인지 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `user-account` | 사용자 이름과 UID, 그룹과 GID, **기본 그룹**(로그인 그룹 — 새 파일에 붙는 그룹이라는 근거)과 **보조 그룹**, root의 UID 0, 커널이 이름이 아니라 번호로 사용자를 가린다는 근거(쓸지는 판단), `/etc/login.defs`의 `UID_MIN`·`UID_MAX`·`SYS_UID_MIN`과 그 기본값(배포판 설정이라는 것), `/etc/group`이 그룹 목록이라는 것, `id`가 보여 주는 것과 출력 꼴 | credentials(7), POSIX Base Definitions §3(User ID·Group ID·Supplementary Group ID — 절 번호는 열어서 확인), login.defs(5), group(5), id(1)(coreutils), POSIX `id`, open(2)·inode(7)의 새 파일 그룹(phase 75 항목이 있으면 가리킨다) |
| b | `etc-passwd` | 칸 일곱의 이름·차례·뜻(이름·암호·UID·GID·GECOS·홈 디렉터리·셸), **암호 칸의 `x`가 암호화된 암호가 `/etc/shadow`에 있다는 표시**라는 것(pwconv(8)이 `x`를 어떻게 설명하는지), 이 파일을 누구나 읽을 수 있다는 근거, 셸 칸이 로그인할 때 실행되는 프로그램이라는 것 | passwd(5)(phase 75 항목에 더한다), pwconv(8) |
| c | `etc-shadow` | 칸 아홉의 이름·차례·뜻(이름·암호화된 암호·마지막 바꾼 날·최소·최대·경고·비활성·만료·예약), **날짜 칸이 1970-01-01부터 센 날 수**라는 것, 빈 칸의 뜻(쓸지는 판단), 암호 칸의 `!`·`*`(암호로 로그인할 수 없다는 것), 이 파일을 일반 사용자가 읽을 수 없다는 근거 | shadow(5)(phase 75 항목에 더한다) |
| d | `useradd` | `useradd [옵션] 이름` 꼴, `-m`·`-d`·`-s`·`-g`(기본 그룹 — 이미 있어야 한다)·`-G`(보조 그룹 — 쉼표 목록)·`-u`의 뜻, 이 명령이 고치는 파일(`/etc/passwd`·`/etc/shadow`·`/etc/group`), `-g`를 주지 않으면 기본 그룹이 어떻게 되는지(쓸지는 판단 — 기출은 묻지 않는다), 만든 뒤 암호를 정하는 `passwd 이름`, `usermod`·`userdel`이 하는 일 한 줄씩. `adduser`가 허용한 출처에 있는지 | useradd(8), passwd(1), usermod(8), userdel(8) |
| e | `chage` | `-m`·`-M`·`-W`·`-I`·`-E`·`-l`의 뜻과 각각이 `/etc/shadow`의 어느 칸을 바꾸는지, 날 수의 기준(마지막 바꾼 날부터), 경고 기간과 최대 사용 기간의 관계(만료 며칠 전부터 경고), 비활성 기간이 지나면 어떻게 되는지, 일반 사용자가 `-l`만 쓸 수 있는지(쓸지는 판단). 기출 오답 보기의 `-L`·`-i`가 chage의 옵션인지 | chage(1), shadow(5) |
| f | `login-records` | `last`가 `/var/log/wtmp`의 로그인·로그아웃 기록을 보여 준다는 것(최근 것부터인지), **`lastb`가 실패한 로그인 시도 기록 `/var/log/btmp`를 보여 준다는 것**, `btmp`를 누가 읽을 수 있는지(근거가 있으면), wtmp·btmp가 무엇인지, `lastlog`가 사용자마다 마지막 로그인을 보여 준다는 것(쓸지는 판단), 출력 꼴(쓸지는 판단 — 지어 보이지 않는다). `history`가 셸의 명령 기록이라는 것(bash 매뉴얼 — phase 75 항목이 있으면 가리킨다) | last(1)·lastb(1)(util-linux — step 0이 utmp(5)·lastlog(8)을 이미 확인했으면 그 항목에 더한다), utmp(5), lastlog(8), bash 매뉴얼의 History |

빠진 것을 읽다가 찾으면 더한다. 다만 기출이 묻지 않는 것을 공식 문서에 있다는 이유만으로 끌어오지 않는다(ADR-059 「범위」) — 「바탕」이 되는 사실만 더한다.

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 76 step 9) <문서 이름> — <절 제목>`, URL 한 줄, **읽은 판** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 이름이나 번호`, 「쓰인 곳」.
  같은 문서의 기존 항목(phase 75의 passwd(5)·shadow(5), step 0의 utmp(5)·lastlog(8) 등)이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 76 step 9)」를 붙인 줄로 더한다.
- 「쓰인 곳」에는 아직 개념 id가 없으므로 **쓰일 개념 id**(`linux-accounts.etc-passwd` 등)와 exam-notes 번호를 적는다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 주제의 기출 8문항이 정답으로 보는 것(과, 「옳지 않은 것」을 고르는 문항에서 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 step 0이 쓴 마지막 번호 다음부터 `## E… — …`로 이어 더한다(E19~E23 형식).
공식 문서에 있으면 항목을 만들지 않는다. step 0이 쓴 소개 문단처럼 이 step이 본 문항 수와 더한 항목을 소개하는 문단을 둔다(확인한 날 포함). 항목이 없으면 그 문단만 둔다.

미리 본 것 — 이 주제의 기출 답(`x`의 뜻, `chage -W`, `useradd -g 그룹 이름`, `lastb`)은 허용한 출처에 모두 있을 것으로 본다. 확인한 뒤 어긋나는 곳만 항목으로 남긴다.
`/etc/passwd` 문항 보기의 UID·GID `500`은 지문의 값을 읽는 것이라 출처와 다툴 일이 아니다 — 일반 사용자의 UID가 몇부터인지는 `login.defs`의 설정이라는 것만 a에서 확인한다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`linux-accounts`의 개념 6개마다 한 줄씩: **무엇을 쓸 수 있는지(출처와 함께), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호)**.
위 표의 a~f마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
`/etc/shadow` 예 줄의 날짜 칸에 쓸 날 수와 그 날짜(1970-01-01부터 센 계산)를 하나 정해 summary에 적는다 — step 11이 그대로 쓴다(계산은 손으로 두 번 한다).
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
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 읽은 판을 적었는지, 문장이 원문을 옮기지 않았는지 다시 본다. man 페이지·POSIX와 기출 문장 모두 옮기지 않는다.
4. `phases/76-network-linux-process-accounts/index.json`의 step 9를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 10~12가 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **허용한 출처 밖의 문서(위키백과·블로그·자격증 교재·배포판 업체의 학습 페이지·Q&A 사이트)를 근거로 쓰지 마라.** 이유: ADR-059.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **`linux-process-boot`의 사실을 다시 정리하거나 step 0의 항목을 고치지 마라.** 이유: step 0의 범위다. 같은 항목에 줄을 더하는 것은 괜찮다.
- **`lecture-outline.md`·`interview-facts.md`·`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 강의·면접은 이 주제를 다루지 않고, 이 phase는 새 출처를 더하지 않는다.
