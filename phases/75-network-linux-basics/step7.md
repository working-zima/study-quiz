# Step 7: permissions-sources

## 배경

phase 75는 네트워크 과목의 강의 밖 주제 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획과 결정은 `phases/75-network-linux-basics/guide.md`에 있다.
step 8~11이 `linux-permissions`의 개념 8개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 허용한 공식 문서로 확인하고 출처 문서에 남긴다.**
데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

이 주제는 강의가 다루지 않으므로 **사실의 출처는 공식 문서 하나뿐이다**(ADR-059). 기출 16문항이 묻는 것은 `chmod` 11회(권한 문자열 `-rwxr-x--x`의 해석과 그 수,
8진수로 권한 주기, 기호로 주기 — `a-w`, 「결과가 다른 명령」, `-R`), `chown` 4회(소유자·그룹 바꾸기, root만 쓰는 명령), `ls -l`의 첫 글자(파일 종류)다.

## 읽어야 할 파일

- `phases/75-network-linux-basics/guide.md` — 특히 「세 주제와 개념 29개」의 `linux-permissions` 표, 「예시 값」, 「출처」
- `phases/75-network-linux-basics/index.json`의 step 0 `summary`(같은 주제 묶음의 출처 step — 형식과, 이미 확인한 capabilities(7)·inode 관련 사실)
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과 step 0이 더한 「(phase 75)」 항목들. **있는 사실을 다시 찾지 않는다**
- `docs/source/network/exam-notes.md` — step 0이 더한 항목(있으면)과 E15~E18의 형식
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `docs/source/network/raw/exam/data.txt`에서 `X-linux` 줄 가운데 이 주제의 16문항과 그 문항(시험 날짜·번호로 `raw/exam/`의 교사용 텍스트에서 찾는다) —
  [기출 2024-02-25 #31·#32·#36], [기출 2024-05-19 #30·#36], [기출 2024-08-25 #41], [기출 2024-11-03 #41], [기출 2025-02-23 #32], [기출 2025-05-25 #31], [기출 2025-08-24 #32·#36], [기출 2025-11-02 #36], [기출 2026-02-01 #28], [기출 2026-05-17 #34·#36], [기출 2026-08-02 #40].
  시험이 무엇을 정답으로 보는지와, 오답 보기 가운데 시험이 맞는 말로 두는 것만 본다. 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 `pubs.opengroup.org`(POSIX 2024년판 — Base Definitions의 「File Access Permissions」 절, `chmod`·`ls`·`chown`·`chgrp` 유틸리티), `man7.org`(chmod(1)·chmod(2)·chown(1)·chown(2)·chgrp(1)·ls(1)·inode(7)·link(2)·ln(1)·symlink(7)·unlink(2)·capabilities(7)),
`gnu.org`(coreutils 매뉴얼의 「File permissions」 장 — Mode Structure·Symbolic Modes·Numeric Modes, 「What information is listed」)다. 판을 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `owner-group-others` | 파일마다 소유자(사용자 ID)와 그룹(그룹 ID)이 있다는 것, 권한을 세 부류(소유자·그룹·그 밖)로 나눈다는 것, 접근하는 프로세스가 어느 부류인지 가리는 차례(소유자이면 소유자 권한만 본다 — 그룹 권한이 더 넓어도), 새 파일의 소유자가 만든 프로세스의 사용자라는 것, root가 보통 권한 검사를 거치지 않는다는 것(step 0이 capabilities(7)로 이미 확인했으면 그 항목을 가리킨다) | POSIX Base Definitions 「File Access Permissions」(절 번호는 열어서 확인), inode(7), open(2)의 새 파일 소유자, coreutils 「Mode Structure」 |
| b | `rwx-permissions` | 읽기·쓰기·실행 권한이 파일과 디렉터리에서 각각 무엇을 허락하는지(디렉터리의 읽기 = 이름 목록, 쓰기 = 안의 항목을 만들고 지우고 이름 바꾸기, 실행 = 찾기(search) — 안으로 들어가고 안의 파일에 닿기). **파일을 지우는 데 필요한 권한이 그 파일이 아니라 그 파일이 든 디렉터리의 쓰기·실행 권한**이라는 근거 | POSIX 「File Access Permissions」, coreutils 「Mode Structure」, unlink(2)의 EACCES, POSIX `rm`·`unlink` |
| c | `permission-string` | `ls -l`이 한 줄에 보이는 칸과 차례(파일 모드 문자열, 링크 수, 소유자, 그룹, 크기, 날짜·시각, 이름), 모드 문자열 10글자의 짜임(첫 글자 종류 + 소유자·그룹·그 밖 세 글자씩, 각 자리 `r`·`w`·`x` 또는 `-`) | POSIX `ls`의 STDOUT 절, coreutils 「What information is listed」, ls(1) |
| d | `file-type-char` | 첫 글자의 종류: `-` 일반 파일, `d` 디렉터리, `l` 심볼릭 링크, `b` 블록 장치, `c` 문자 장치(그리고 `p`·`s`를 쓸지). 블록 장치와 문자 장치가 무엇인지 한 줄로 댈 근거. **하드 링크**가 같은 파일에 이름을 하나 더 붙인 것이라 따로 종류가 없고 원래 파일의 종류로 보인다는 것, 심볼릭 링크는 다른 파일의 경로를 담은 따로 된 파일이라는 것 | POSIX `ls`, coreutils 「What information is listed」, inode(7)의 파일 종류, link(2)·ln(1), symlink(7), FHS·hier(7)의 `/dev`(step 0 항목) |
| e | `octal-mode` | 8진수 모드: 읽기 4·쓰기 2·실행 1을 부류마다 더한 자리 셋(소유자·그룹·그 밖의 차례), 예 `755`·`644`. 네 자리 모드(특수 비트)는 쓰지 않는다 — 그런 것이 있다는 것만 확인 | POSIX `chmod`의 「absolute mode」(octal), coreutils 「Numeric Modes」 |
| f | `chmod` | `chmod`가 하는 일, `-R`, **권한을 바꿀 수 있는 사람**(파일 소유자와 특권 프로세스 — chmod(2)의 EPERM) | chmod(1), chmod(2), POSIX `chmod` |
| g | `symbolic-mode` | 누구(`u`·`g`·`o`·`a`), 연산(`+`·`-`·`=`), 권한(`r`·`w`·`x`)의 뜻. **`=`는 그 부류에서 적지 않은 권한을 지운다**는 것, `+`·`-`는 다른 권한을 그대로 둔다는 것, `a`가 `ugo`와 같다는 것, 쉼표로 여럿을 잇는 것. 누구를 빼면 umask가 끼어든다는 것(다루지 않지만 그래서 예에서 누구를 늘 적는다는 근거로) | POSIX `chmod`의 「symbolic mode」 문법, coreutils 「Symbolic Modes」 |
| h | `chown` | `chown 사용자 파일`, `chown 사용자:그룹 파일`, `chown :그룹 파일`, `-R`의 뜻. **소유자를 바꾸는 것은 특권 프로세스만, 파일의 소유자는 그룹을 자기가 속한 그룹으로 바꿀 수 있다**는 것, `chgrp`가 그룹만 바꾼다는 것 | chown(1), chown(2), chgrp(1), POSIX `chown`·`chgrp` |

빠진 것을 읽다가 찾으면 더한다. 다만 기출이 묻지 않는 것(특수 비트 setuid·setgid·sticky, ACL, umask의 계산)을 공식 문서에 있다는 이유만으로 끌어오지 않는다(ADR-059 「범위」).

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 75 step 7) <문서 이름> — <절 제목>`, URL 한 줄, **읽은 판** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 이름이나 번호`, 「쓰인 곳」.
  같은 문서의 기존 항목(step 0이 더한 capabilities(7) 등)이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 75 step 7)」을 붙인 줄로 더한다. man 페이지 여럿을 한 항목에 묶어도 된다.
- 머리말의 「(phase 75)」 줄 뒤에 「(phase 75 step 7)」이 무엇인지(`linux-permissions`가 쓸 사실, 확인한 날) 한 줄을 더한다.
- 「쓰인 곳」에는 **쓰일 개념 id**(`linux-permissions.symbolic-mode` 등)와 exam-notes 번호를 적는다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 주제의 기출 16문항이 정답으로 보는 것(과, 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 step 0이 쓴 다음 번호부터 `## E… — …`를 이어 더한다(E15~E18 형식).
공식 문서에 있으면 항목을 만들지 않는다. 이 step이 본 문항 수와 더한 항목을 소개하는 문단을 새 항목 앞에 둔다(확인한 날 포함). 항목이 없으면 그 문단만 둔다.

미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다. 「표준」 칸은 「공식 문서」로 읽는다.

- **「root만 쓸 수 있는 명령은 `chown`」**([기출 2024-02-25 #31], [기출 2026-05-17 #34]): chown(2)대로 소유자 바꾸기만 특권이 필요하고 그룹은 소유자도 바꿀 수 있다면,
  처리 후보는 「본문은 공식 문서대로(소유자 바꾸기는 root만, 그룹은 소유자도) 쓰고, 「자격시험은 `chown`을 root만 쓰는 명령으로 본다」를 덧붙인다」.
- **「원래 권한을 둔 채 모든 사용자에게 쓰기 더하기 — 결과가 다른 명령」**([기출 2024-05-19 #36], [기출 2025-08-24 #36]): 시험은 `chmod 666`·`a+w`·`ugo+w`를 같은 결과로, `go=w`를 다른 결과로 본다.
  `666`은 원래 권한을 두지 않고 아홉 자리를 새로 정하므로, 원래 권한이 `rw-r--r--`일 때만 셋이 같다. 문항이 원래 권한을 보여 주는지(지문 그림이 빠졌을 수 있다) 보고, 시험의 답이 공식 문서와 맞으면 항목을 만들지 않는다.
- **「소유자와 그룹이 아닌 사람은 읽기만」 → `774`** 등 8진수 문항: 계산이 공식 문서의 4·2·1과 맞으면 항목을 만들지 않는다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`linux-permissions`의 개념 8개마다 한 줄씩: **무엇을 쓸 수 있는지(출처와 함께), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호)**.
위 표의 a~h마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 읽은 판을 적었는지, 문장이 원문을 옮기지 않았는지 다시 본다.
4. `phases/75-network-linux-basics/index.json`의 step 7을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 8~11이 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **허용한 출처 밖의 문서를 근거로 쓰지 마라.** 이유: ADR-059. rodsbooks.com은 `gdisk`에만 쓴다 — 이 step에서는 쓰지 않는다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **`linux-shell`의 사실(셸·리다이렉션·`find`·vi)을 이 step에서 정리하지 마라.** 이유: step 12의 범위다. 읽다가 본 것은 summary에 메모만 한다.
- **`docs/source/network/CLAUDE.md`·`topic-map.md`·`lecture-outline.md`·`interview-facts.md`를 고치지 마라.** 이유: 이 step이 쓰는 출처는 모두 이미 허용한 곳이고, 강의·면접은 이 주제를 다루지 않는다.
