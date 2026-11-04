# Step 1: process-ps

## 배경

phase 76은 네트워크 과목의 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획·결정·공통 규칙은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
**이 step은 주제 `linux-process-boot`를 만들고 그 첫 개념 둘(1 프로세스, 2 ps 명령)의 글·문항·도식을 함께 만든다.**

이 주제는 학습자가 「실행 중인 프로그램」을 처음 따로 떼어 보는 화면이다. 앞 phase 75의 세 주제(파일 시스템·권한·셸)를 읽지 않고 바로 들어올 수 있다고 보고 쓴다.

## 읽어야 할 파일

- **`phases/76-network-linux-process-accounts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/76-network-linux-process-accounts/index.json`의 step 0 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 76)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `linux-shell` 주제 — 셸·파이프를 어떻게 풀었는지, 목록 개념의 선례 `routing.routing-table`), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들 — 특히 `DirectoryTreeDiagram`(나무)과 `FstabFieldsDiagram`(칸 이름과 값)), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`linux-shell` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "linux-process-boot", "title": "Linux 프로세스·작업 예약·부팅", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 1·2다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `linux-process-boot.process` | 프로세스 | — | 이 주제의 첫 개념이라 **Linux**(운영체제 — 컴퓨터의 하드웨어를 관리하고 프로그램이 실행되게 하는 기본 소프트웨어, 한 줄), **커널**(운영체제의 핵심 — 하드웨어를 다루고 프로그램 실행을 맡는다), **프로그램**(디스크에 저장된 실행 파일), **셸**(사용자가 입력한 명령 줄을 읽어 그 프로그램을 실행해 주는 프로그램), **명령**을 짧게 푼다(phase 75의 `linux-shell.shell`과 뜻을 맞춘다). 예는 guide.md 「예시 값」 — `user1`의 셸 `bash`(PID `2045`)가 `backup.sh`를 실행해 PID `2310`(PPID `2045`)이 생기고, 한 번 더 실행하면 PID `2311`이 따로 생긴다(예로 붙인 번호라고 밝힌다). 프로그램과 프로세스가 무엇이 다른지(4절) — 파일은 하나여도 실행할 때마다 프로세스가 따로 생긴다. PID 1과 그것이 무엇인지, 다른 프로세스가 거슬러 올라가면 그것에 닿는다는 것은 step 0 결과가 허락하는 만큼. 「데몬」(뒤에서 계속 실행되는 서비스 프로세스)이라는 낱말을 쓰면 그 자리에서 한 줄로 푼다 |
| 2 | `linux-process-boot.ps-command` | ps 명령 | `process` | 그 순간의 프로세스 목록을 한 번 보여 주고 끝나는 명령이다. 옵션 없이 입력하면 무엇이 보이는지(step 0 결과대로), `-e`·`-f`와 `ps -ef`의 칸 여덟을 차례대로 — 칸마다 이름과 뜻을 한 줄씩(목록 개념이 아니므로 문단으로 쓰되, 칸 이름은 백틱으로). 출력은 머리줄과 예 한두 줄(`backup.sh`의 줄 — UID `user1`, PID `2310`, PPID `2045`)을 코드 블록 없이 문장 안 백틱으로 보이거나, 칸 이름: 값으로 풀어 보인다(값은 예시 값이라고 밝힌다 — C·STIME·TTY·TIME의 값은 출처가 보이는 꼴을 따르고, 지어 쓰기 어려우면 그 칸은 뜻만 쓴다). 특정 프로세스를 찾는 `ps -ef | grep sshd`(guide.md 「명령 줄의 예」)와 그 결과 — 데몬 `sshd`가 살아 있으면 그 줄이 보인다. 파이프(앞 명령의 출력을 뒤 명령의 입력으로 넘기는 세로 막대)와 `grep`(정한 글자가 든 줄만 골라 내는 명령)을 이 주제 안에서 한 줄로 푼다. BSD 꼴 옵션(`ps aux`)은 한 줄. `grep` 자기 줄이 결과에 끼는 것은 step 0이 근거를 찾았을 때만 |

### 2. 문항 — `src/data/network/questions.json`에 `n145`~`n147`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n145` | `process` | 예/아니요 「오해 바로잡기」 — 프로그램과 프로세스를 가르는 주장. 시작 때 예 25·아니요 25이므로 **아니요** 쪽 주장으로 세운다(예: 같은 프로그램 파일을 두 번 실행하면 두 실행이 PID 하나를 함께 쓰는가 — 아니요, 실행마다 프로세스가 따로 생기고 PID도 따로다). 해설은 프로그램(디스크의 파일)과 프로세스(실행 중인 것)의 차이와 PID가 무엇에 붙는지를 가르친다 |
| `n146` | `ps-command` | 4지선다 「출력 읽기」 — `ps -ef`의 머리줄과 본문과 다른 값의 줄(예: `user5`의 셸 PID `3150`이 실행한 프로그램의 줄 — PID `3172`, PPID `3150`)을 문제문에 주고 「이 프로그램을 실행한 부모 프로세스의 번호」를 묻는다 → PPID 칸의 값. 오답은 같은 줄의 다른 칸 값(PID 값, 그리고 C·TIME 같은 다른 숫자 칸의 값 — 흔한 실수인 PID와 PPID를 바꿔 읽기를 꼭 넣는다). 보기의 값이 넷 다 다르게 줄의 값을 고른다. **정답 위치 1**(guide.md 「문항」 9항의 계획) |
| `n147` | `ps-command` | 예/아니요 「오해 바로잡기」 — 옵션 없이 `ps`만 입력했을 때 보이는 범위(예: 옵션 없이 `ps`만 입력하면 지금 터미널에서 실행한 프로세스만 보이는가 — step 0 결과가 ps(1)의 기본 선택을 확인했으면 **예**). n145 뒤의 균형(예 25·아니요 26)에서 **예** 쪽으로 세운다. 근거를 찾지 못했으면 같은 방향의 다른 주장(예: `ps`는 목록을 한 번 보여 주고 끝나는가)으로 바꾼다. 해설은 `-e`·`-f`가 무엇을 더하는지까지 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 「데몬이 살아 있는지 확인하는 명령」 꼴과 그 보기 넷(`daemon`·`fsck`·`men`·`ps`), 기출 `ps -ef` 결과의 값을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/network/visuals/linux-process-boot.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'linux-process-boot': linuxProcessBootVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `linux-process-boot.process` — `ProcessTreeDiagram`, JSON 키 `process-tree`

- 물음형 제목 예: `프로세스는 누가 만들까?`
- 그릴 것: 프로세스 나무 — 맨 위 `PID 1` 노드, 그 아래 데몬 `sshd`(812)와 셸 `bash`(2045), `bash` 아래 `backup.sh` 두 노드(2310·2311). 노드 라벨은 `PID 번호 이름` 꼴(예 `2310 backup.sh` — 라벨 꼴은 280 폭에 맞춰 정하되 본문의 말과 같게).
  부모와 자식을 잇는 가지는 늘 보이는 연결선이다. **`bash`와 PID 1 사이에 실제로 다른 프로세스가 끼는지는 출처로 정할 수 없으면 지어 그리지 않는다** — 그 가지에 「사이의 프로세스는 줄임」 같은 곁말을 두거나, `bash`를 PID 1 아래에 바로 두지 않는 배치를 고른다. `sshd`가 PID 1의 자식이라는 것도 step 0 결과가 근거를 찾았을 때만 바로 잇는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `program-process` | 같은 프로그램 | `2310 backup.sh`·`2311 backup.sh` | 같은 프로그램 파일을 두 번 실행하면 PID가 다른 프로세스가 둘 생긴다 |
  | `parent` | 부모와 자식 | `2045 bash`·`2310 backup.sh` | 곁말 `PPID 2045` — 셸에서 실행한 명령의 부모는 그 셸이다 |
  | `pid1` | PID 1 | `PID 1`(과 근거가 있으면 `812 sshd`) | 부팅 때 커널이 처음 실행한 프로세스 — 다른 프로세스는 거슬러 올라가면 여기에 닿는다 |

- 요점 테스트: `parent`의 곁말에 적힌 PPID 값이 선명한 부모 노드 라벨의 PID와 같다. `program-process`의 선명한 두 노드는 라벨의 프로그램 이름이 같고 PID가 다르다. `pid1`의 선명한 노드에 라벨이 `PID 1`인 노드가 있다.

#### 3-2. `linux-process-boot.ps-command` — `PsColumnsDiagram`, JSON 키 `ps-columns`

- 물음형 제목 예: `ps -ef의 한 줄은 무엇을 말할까?`
- 그릴 것: `ps -ef`가 보인 `backup.sh`의 줄을 칸으로 — 칸 여덟(UID·PID·PPID·C·STIME·TTY·TIME·CMD)을 「칸 이름 | 값」 노드 짝으로(세로형은 위에서 아래로 쌓고, 가로형은 두 줄로 나눠도 된다 — guide.md 「글자열 칸」·「표 모양 그림」). 값은 본문에 쓴 예시 값만 — 본문이 값을 쓰지 않은 칸은 칸 이름만 두고 값 자리를 비우거나 그 칸을 뺀다(뺀 칸은 본문이 말한다).
  맨 위에 명령 노드 `ps -ef`를 둘지는 280 폭에 맞춰 정한다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `who` | 누가 무엇을 | UID·CMD 칸 | 이 프로세스를 실행한 사용자와 실행한 명령 |
  | `ids` | 번호 | PID·PPID 칸 | 이 프로세스의 번호와, 이것을 만든 부모 프로세스의 번호 |
  | `time` | 시각과 시간 | STIME·TIME 칸 | 시작한 시각과 CPU를 쓴 시간(뜻은 step 0 결과대로 — 둘이 다르다는 것) |

- 요점 테스트: `ids`의 선명한 칸은 정확히 PID·PPID 둘이고, PPID 칸의 값이 `process` 본문 예의 셸 PID(`2045`)와 같고 PID 칸의 값(`2310`)과 다르다. 세 시나리오의 선명한 칸을 합하면 겹치지 않는다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 147개, 마지막 id는 `n147`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `linux-shell` 바로 뒤에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. `ps -ef`의 칸 이름과 뜻이 ps(1)과 같은가(공식 문서 문장을 옮기지 않고).
4. `phases/76-network-linux-process-accounts/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~15를 만들지 마라.** 이유: step 2~8의 범위다. 이 step의 글이 그 낱말(`top`·`kill`·데몬·systemd·부팅)을 쓸 때는 한 줄 풀이로 그친다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
- **프로세스 사이의 부모·자식 관계를 지어 그리지 마라.** 이유: 도식의 가지 하나도 사실이다(ADR-036). 근거가 있는 관계만 바로 잇는다.
