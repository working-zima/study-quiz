# Step 12: shell-sources

## 배경

phase 75는 네트워크 과목의 강의 밖 주제 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획과 결정은 `phases/75-network-linux-basics/guide.md`에 있다.
step 13~17이 `linux-shell`의 개념 10개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 허용한 공식 문서로 확인하고 출처 문서에 남긴다.**
데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

이 주제는 강의가 다루지 않으므로 **사실의 출처는 공식 문서 하나뿐이다**(ADR-059). 기출 17문항이 묻는 것은 셸 4회(명령어 해석기, 명령을 커널에 전달하는 것),
리다이렉션 3회(`>`), vi 3회(바꾸기 `:s///g`, 글자 하나 지우기 `x`, 저장하지 않으면 끝나지 않는 `:q`), `pwd` 2회, `find`의 옵션 2회, `mv -i`, `cd ~`, 파이프와 `more`다.
**vi는 POSIX `vi`·`ex` 명세로 쓴다**(guide.md 「출처」 — 허용한 출처에 vim 문서는 없다).

## 읽어야 할 파일

- `phases/75-network-linux-basics/guide.md` — 특히 「세 주제와 개념 29개」의 `linux-shell` 표, 「예시 값」, 「출처」
- `phases/75-network-linux-basics/index.json`의 step 0·7 `summary`(같은 phase의 출처 step — 형식과, 이미 확인한 사실)
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과 step 0·7이 더한 「(phase 75)」 항목들(경로·홈 디렉터리·`/etc/passwd`·권한 관련 사실이 이미 있을 수 있다). **있는 사실을 다시 찾지 않는다**
- `docs/source/network/exam-notes.md` — step 0·7이 더한 항목(있으면)과 E15~E18의 형식
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `docs/source/network/raw/exam/data.txt`에서 `X-linux` 줄 가운데 이 주제의 17문항과 그 문항(시험 날짜·번호로 `raw/exam/`의 교사용 텍스트에서 찾는다) —
  [기출 2024-02-25 #34·#40], [기출 2024-05-19 #35·#42], [기출 2024-08-25 #45], [기출 2025-02-23 #33], [기출 2025-05-25 #28], [기출 2025-08-24 #29·#37], [기출 2025-11-02 #28·#39], [기출 2026-02-01 #37·#38·#39], [기출 2026-05-17 #35·#39·#40].
  시험이 무엇을 정답으로 보는지와, 오답 보기 가운데 시험이 맞는 말로 두는 것만 본다. 문장을 옮기지 않는다. 지문 그림이 빠진 문항(리다이렉션·vi 바꾸기의 요구 사항)은 보기와 정답으로 무엇을 묻는지만 판단한다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 `pubs.opengroup.org`(POSIX 2024년판 — Shell Command Language, Base Definitions의 용어 정의, 각 유틸리티), `gnu.org`(bash 매뉴얼 — 「What is a shell?」·Redirections·Pipelines·Controlling the Prompt, coreutils 매뉴얼),
`man7.org`(intro(2)·execve(2)·fork(2)·shells(5)·chsh(1)·passwd(5)·find(1)·man(1)·more(1)·grep(1)과 POSIX 사본 `*p` 페이지)다. 판을 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `shell` | 셸이 명령 줄을 읽어 해석하고 명령을 실행하는 프로그램(명령어 해석기)이라는 것, 셸 언어를 POSIX가 정하고 bash가 GNU의 셸이라는 것. **셸이 프로그램을 실행할 때 커널에 무엇을 요청하는지**(시스템 호출 — 프로세스를 만들고 프로그램을 실행하는 호출)와 시스템 호출이 커널로 들어가는 입구라는 것. 셸이 커널의 일부가 아닌 보통 프로그램이고 사용자마다 다른 셸을 고를 수 있다는 근거(로그인 셸 목록·`chsh`). 명령 줄이 명령 이름·옵션·인자로 이뤄진다는 것, 프롬프트의 `$`·`#` | bash 매뉴얼 1.1·3.1, POSIX Shell Command Language의 머리·「Command Search and Execution」, intro(2), fork(2), execve(2), shells(5), chsh(1), bash 매뉴얼 「Controlling the Prompt」 |
| b | `working-directory` | 프로세스마다 현재 작업 디렉터리가 있다는 것, `pwd`가 그것을 절대 경로로 출력한다는 것, `cd 디렉터리`와 인자 없는 `cd`(홈 디렉터리 — `HOME` 변수), 로그인하면 처음 작업 디렉터리가 홈 디렉터리라는 근거 | POSIX `pwd`·`cd`, Base Definitions 「Working Directory」, passwd(5)의 홈 디렉터리 칸(step 0 항목이 있으면 가리킨다) |
| c | `paths` | 절대 경로(`/`로 시작)와 상대 경로(작업 디렉터리에서부터)의 정의, `.`·`..`의 뜻, `~`가 홈 디렉터리의 경로로 바뀌는 틸드 확장, `cd /`·`cd ~`의 결과. `HOME`이 홈 디렉터리 경로를 담은 환경 변수라서 `cd HOME`은 이름이 `HOME`인 디렉터리를 찾는다는 것(`HOME`과 `$HOME`의 차이를 근거로 댈 수 있는지) | POSIX Base Definitions 「Absolute Pathname」·「Relative Pathname」·「Dot」·「Dot-Dot」·「Pathname Resolution」·환경 변수 `HOME`, Shell Command Language 「Tilde Expansion」·「Parameter Expansion」, POSIX `cd` |
| d | `file-commands` | `ls`(`-l`·`-a` — 점으로 시작하는 이름), `cat`, `cp`, `mv`(옮기기와 이름 바꾸기가 같은 명령), `rm`(`-r`), `mkdir`, `man`이 하는 일. `cp`·`mv`·`rm`의 `-i`가 무엇을 묻는지. `mv`가 `-i` 없이도 묻는 경우가 있는지(쓰기 권한이 없는 대상과 터미널 입력) — 쓸지는 판단해 적는다 | POSIX `ls`·`cat`·`cp`·`mv`·`rm`·`mkdir`, coreutils 매뉴얼, man(1)(man-db) |
| e | `redirection` | 표준 입력·표준 출력·표준 오류와 파일 디스크립터 0·1·2, `<`·`>`·`>>`·`<<`(here-document — 정한 낱말이 나올 때까지의 줄)·`2>`의 뜻, `>`가 있는 파일을 비우고 새로 쓴다는 것(`noclobber`는 다루지 않는다 — 있다는 것만 확인) | POSIX Shell Command Language 「Redirection」(입력·출력·덧붙이기·here-document 절), stdin(3), bash 매뉴얼 Redirections |
| f | `pipe` | 파이프라인(두 명령 사이의 세로 막대 — guide.md 「파이프의 예」)이 앞 명령의 표준 출력을 뒤 명령의 표준 입력으로 잇는다는 것, `more`가 한 화면씩 보여 준다는 것, `grep`이 정한 글자(패턴)가 든 줄을 골라 출력한다는 것 | POSIX Shell Command Language 「Pipelines」, POSIX `more`·`grep`, bash 매뉴얼 Pipelines |
| g | `find` | `find 시작점 식` 꼴과 아래로 모두 내려간다는 것, `-name`(파일 이름 — 와일드카드), `-type`(`f`·`d`), `-perm`(권한 — 꼴 셋: 정확히, `-`, `/`), `-user`(소유자), `-exec 명령 {} \;`(`{}` 자리에 찾은 경로), 식이 없을 때의 기본 동작(경로 출력) | find(1)(GNU findutils — man7.org), POSIX `find` |
| h | `vi` | vi가 POSIX가 정한 화면 편집기라는 것, 모드 — 처음 시작할 때의 모드(명령 모드), 입력 모드에 들어가는 명령(`i`·`a`·`o`)과 나오는 키(`Esc`), 명령 모드에서 `:`로 ex 명령을 입력한다는 것 | POSIX `vi`(「Command Descriptions in vi」·「Input Mode Commands in vi」), POSIX `ex` |
| i | `vi-edit-commands` | `x`(커서의 글자 지우기), `dd`(줄 지우기), `dw`(낱말 지우기), `D`(커서부터 줄 끝까지), `u`(되돌리기)의 뜻, 앞에 붙이는 수(count) | POSIX `vi`의 각 명령 절 |
| j | `vi-colon-commands` | `:w`·`:q`(바뀐 버퍼가 있으면 끝나지 않는다)·`:q!`·`:wq`·`:s/찾을/바꿀/`과 줄 범위(`2,6`)·`g` 플래그의 뜻(없으면 줄마다 첫 번째만), `%`가 모든 줄이라는 것(쓸지 판단) | POSIX `ex`의 quit·write·wq·substitute·「Addressing in ex」 |

빠진 것을 읽다가 찾으면 더한다. 다만 기출이 묻지 않는 것(셸 스크립트·변수·제어문, vi의 이동 명령 전부, 정규 표현식 문법)을 공식 문서에 있다는 이유만으로 끌어오지 않는다(ADR-059 「범위」).

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 75 step 12) <문서 이름> — <절 제목>`, URL 한 줄, **읽은 판** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 이름이나 번호`, 「쓰인 곳」.
  같은 문서의 기존 항목(step 0·7이 더한 POSIX·man 페이지 항목)이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 75 step 12)」를 붙인 줄로 더한다.
- 머리말의 「(phase 75 step 7)」 줄 뒤에 「(phase 75 step 12)」가 무엇인지(`linux-shell`이 쓸 사실, vi는 POSIX 명세로 쓴다는 것, 확인한 날) 한 줄을 더한다.
- 「쓰인 곳」에는 **쓰일 개념 id**(`linux-shell.redirection` 등)와 exam-notes 번호를 적는다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 주제의 기출 17문항이 정답으로 보는 것(과, 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 step 7이 쓴 다음 번호부터 `## E… — …`를 이어 더한다(E15~E18 형식).
공식 문서에 있으면 항목을 만들지 않는다. 이 step이 본 문항 수와 더한 항목을 소개하는 문단을 새 항목 앞에 둔다(확인한 날 포함). 항목이 없으면 그 문단만 둔다.

미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다. 「표준」 칸은 「공식 문서」로 읽는다.

- **「셸은 사용자가 내린 명령을 커널에 전달한다」**([기출 2025-05-25 #28], [기출 2026-02-01 #39]): 공식 문서가 셸을 「명령을 해석해 실행하는 것」으로 말하고, 실행은 시스템 호출로 커널에 요청한다고 말하면,
  처리 후보는 「본문은 공식 문서대로(셸이 명령을 해석하고, 프로그램 실행을 커널에 요청한다) 쓰고, 「자격시험은 셸을 명령을 커널에 전달하는 것으로 본다」를 덧붙인다」. 공식 문서의 말과 어긋나지 않는다고 판정하면 항목을 만들지 않는다.
- **`find`의 옵션**([기출 2024-02-25 #40], [기출 2025-11-02 #28]): 시험의 정답(`-exec`)과 오답의 판정이 find(1)과 맞으면 항목을 만들지 않는다.
- **vi**([기출 2024-05-19 #35], [기출 2025-08-24 #37], [기출 2026-05-17 #35]): 시험이 정답으로 보는 명령이 POSIX `vi`·`ex`에 있고 뜻이 같으면 항목을 만들지 않는다. POSIX에 없는 것을 시험이 정답으로 보면 항목으로 남긴다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`linux-shell`의 개념 10개마다 한 줄씩: **무엇을 쓸 수 있는지(출처와 함께), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호)**.
위 표의 a~j마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

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
4. `phases/75-network-linux-basics/index.json`의 step 12를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 13~17이 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **vim 문서나 그 밖의 허용하지 않은 곳을 vi의 근거로 쓰지 마라.** 이유: ADR-059와 guide.md 「출처」. POSIX `vi`·`ex`로 댈 수 없는 것은 쓰지 않는다고 적는다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **프로세스·작업 예약(`ps`·`top`·`cron`)의 사실을 정리하지 마라.** 이유: `linux-process-boot`(phase 76)의 범위다. `cron`이 기출 보기에 나와도 이 step에서 확인하지 않는다.
- **`docs/source/network/CLAUDE.md`·`topic-map.md`·`lecture-outline.md`·`interview-facts.md`를 고치지 마라.** 이유: 이 step이 쓰는 출처는 모두 이미 허용한 곳이고, 강의·면접은 이 주제를 다루지 않는다.
