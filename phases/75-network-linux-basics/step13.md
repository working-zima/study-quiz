# Step 13: shell-working-dir

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-shell`을 만들고 그 첫 개념 둘(20 셸, 21 작업 디렉터리)의 글·문항·도식을 함께 만든다.**

이 주제는 학습자가 Linux의 명령 줄을 처음 여는 화면이다. 앞 두 주제를 읽지 않고 바로 들어올 수 있다고 보고, Linux·파일·디렉터리·경로·홈 디렉터리 같은 바탕 낱말을 이 주제 안에서 다시 짧게 푼다.
기출은 셸을 네 번(「명령어 해석기」, 「사용자가 내린 명령을 커널에 전달하는 것」), `pwd`를 두 번(작업 디렉터리를 절대 경로로 보여 주는 명령) 물었다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 12 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지, 셸과 커널의 처리)와 step 11 `summary`(앞 주제가 끝났을 때의 수 — 교차 검사·균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75 step 12)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(앞 주제 `linux-filesystem`·`linux-permissions` — 같은 phase의 글이 어떤 말로 Linux·디렉터리·경로·커널을 풀었는지 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- `linux-filesystem`의 `DirectoryTreeDiagram`과 그 테스트(이 step의 나무 그림이 같은 짜임을 쓴다), `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`linux-permissions` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "linux-shell", "title": "Linux 셸과 기본 명령", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 20·21이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 20 | `linux-shell.shell` | 셸 | — | 이 주제의 첫 개념이라 **Linux**, **커널**(운영체제의 핵심 — 하드웨어를 다루고 프로그램 실행을 맡는다), **명령**(글자로 입력해 컴퓨터에게 시키는 일 — `ls`처럼 대개 프로그램의 이름이다), **터미널**(명령을 입력하고 결과를 보는 글자 화면)을 짧게 푼다. 셸은 사용자가 입력한 명령 줄을 읽어 해석하고 그 명령을 실행하는 프로그램, 곧 명령어 해석기다. 예 `ls -l /home`을 명령 이름(`ls`)·옵션(`-l`, 동작을 바꾸는 표시)·인자(`/home`, 명령이 다룰 대상)로 끊어 보이고, 셸이 `ls` 프로그램을 찾아 실행하는 차례를 단계대로 쓴다 — 실행은 커널에 요청한다(시스템 호출을 한 줄로, step 12 결과의 근거대로). 셸과 커널이 무엇이 다른지(4절) — 셸은 커널 위에서 도는 보통 프로그램이라 사용자마다 다른 셸을 쓸 수 있고(근거대로), Linux에서 흔한 셸은 GNU의 bash. 프롬프트 `$`·`#`은 step 12 결과대로 한 줄. 「자격시험은」 줄은 step 12 결과대로 |
| 21 | `linux-shell.working-directory` | 작업 디렉터리 | — | **디렉터리**(파일과 다른 디렉터리를 담는 것), **경로**(맨 위 디렉터리 `/`부터 거쳐 가는 디렉터리 이름을 `/`로 이은 위치), **홈 디렉터리**(사용자마다 자기 파일을 두라고 정해 둔 디렉터리 — 예 `/home/user1`)를 이 주제에서 처음 푼다. 셸은 지금 머물고 있는 디렉터리, 현재 작업 디렉터리를 갖는다. 명령과 결과를 차례로 보인다 — 로그인 직후 `pwd` → `/home/user1`(로그인하면 홈에서 시작한다는 것은 근거대로), `cd docs` 뒤 `pwd` → `/home/user1/docs`, `cd /var/log` 뒤 `pwd` → `/var/log`, 인자 없이 `cd` 뒤 `pwd` → `/home/user1`. `pwd`는 늘 `/`부터 적은 경로로 보인다는 것(절대 경로라는 이름은 한 줄 — 자세히는 딸린 개념의 몫이므로 「뒤에서 다룬다」를 붙이지 않는다). `cd`와 `pwd`가 무엇이 다른지(옮기기와 보기) |

### 2. 문항 — `src/data/network/questions.json`에 `n133`~`n135`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n133` | `shell` | 4지선다 「개념 비교」 — 사용자가 `ls -l /home`(본문 예와 다른 명령 줄로 바꿔도 된다)을 입력했을 때, 셸과 커널이 각각 하는 일을 바르게 짝지은 것을 고른다. 오답은 둘의 일을 바꾼 것, 둘 다 한쪽 일을 하는 것, 명령 프로그램의 일을 셸의 일로 둔 것. 「정의에서 이름만 지운」 꼴(「사용자의 명령을 해석하는 것은?」)을 피한다. 정답 위치는 균형대로 |
| `n134` | `shell` | 예/아니요 「오해 바로잡기」 — 사용자는 로그인했을 때 쓸 셸을 bash가 아닌 다른 셸로 바꿀 수 있는가(예 — 셸은 커널의 일부가 아닌 프로그램이다). step 11이 끝난 뒤의 균형(계획대로면 예 23·아니요 24)에서 **예** 쪽으로 세운다. step 12 결과가 근거를 찾지 못했으면 「셸은 커널의 일부인가」(아니요)로 바꾸고 균형을 다시 맞춘다. n133과 다른 것을 묻는다 |
| `n135` | `working-directory` | 4지선다 「상황 적용」 — `user2`가 로그인한 직후 `cd /tmp`를 입력하고 이어 `pwd`를 입력하면 무엇이 출력되는가 → `/tmp`. 오답은 흔한 오해에서 — `/home/user2`(`cd`가 바꾼 것을 놓침), `tmp`(이름만 나온다고 봄), `/home/user2/tmp`(홈 아래로 옮겨졌다고 봄). 정답 위치는 균형대로 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 `Shell`·`Kernel`·`Utility Program`·`Hierarchical File System` 묶음, `System Program`·`Loader`·`Shell`·`Directory` 묶음, `cd`·`man`·`pwd`·`cron` 묶음을 쓰지 않는다).
형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/network/visuals/linux-shell.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'linux-shell': linuxShellVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `linux-shell.shell` — `ShellLayerDiagram`, JSON 키 `shell-layer`

- 물음형 제목 예: `명령을 입력하면 누가 무엇을 할까?`
- 그릴 것: 위에서 아래로 층 — `사용자`, `셸`, `커널`, `하드웨어`(본문이 하드웨어를 말하면). 곁에 프로그램 노드 `ls`. 시나리오 경로 — `사용자`에서 `셸`로(명령 줄), `셸`에서 `커널`로(실행 요청), `커널`에서 `ls`로(실행).
- 시나리오:

  | id | label | 선명한 것 | 경로·곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `read` | 명령 읽기 | `사용자`·`셸` | `사용자` → `셸`. 곁말 `ls -l /home`과 그 세 덩어리(명령 이름·옵션·인자). 셸이 명령 줄을 읽어 해석한다 |
  | `run` | 실행 요청 | `셸`·`커널`·`ls` | `셸` → `커널` → `ls`. 셸은 `ls` 프로그램의 실행을 커널에 요청한다 |

- 요점 테스트: 어느 시나리오에서도 `사용자`에서 `커널`로 바로 가는 경로가 없다. `run`에서 보이는 경로는 `셸`에서 시작하고 `커널`을 거쳐 `ls`에서 끝난다. `read`의 보이는 곁말에 본문 예의 명령 줄이 있다.

#### 3-2. `linux-shell.working-directory` — `WorkingDirectoryDiagram`, JSON 키 `working-directory`

- 물음형 제목 예: `지금 어느 디렉터리에 있을까?`
- 그릴 것: 나무 — `/` 아래 `home`·`var`, `home` 아래 `user1`, `user1` 아래 `docs`, `var` 아래 `log`(가지는 늘 보이는 연결선). 시나리오마다 작업 디렉터리 노드 하나가 선명하고, 곁말로 입력한 명령과 `pwd`의 출력을 보인다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `login` | 로그인 직후 | `user1` | 곁말 `pwd` → `/home/user1`. 로그인하면 홈 디렉터리에서 시작한다(본문이 근거를 쓴 만큼) |
  | `relative` | `cd docs` | `docs` | 곁말 `pwd` → `/home/user1/docs`. 지금 디렉터리 안의 `docs`로 옮긴다 |
  | `absolute` | `cd /var/log` | `log` | 곁말 `pwd` → `/var/log`. `/`부터 적은 경로로 어디로든 옮긴다 |

- 요점 테스트: 시나리오마다 선명한 나무 노드가 정확히 하나이고, 곁말의 `pwd` 출력이 그 노드까지 나무를 따라 이름을 `/`로 이은 경로와 같다(테스트가 나무에서 계산한다). 세 시나리오의 선명한 노드가 서로 다르다.

위 도식 설계는 출발점이다. 본문(step 12 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 135개, 마지막 id는 `n135`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `linux-permissions` 바로 뒤에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 12 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 본문의 `cd`·`pwd` 차례를 손으로 다시 따라가 출력이 맞는가.
4. `phases/75-network-linux-basics/index.json`의 step 13을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 22~29(절대 경로와 상대 경로, 파일을 다루는 기본 명령, 리다이렉션, 파이프, find 명령, vi 편집기와 그 명령)를 만들지 마라.** 이유: step 14~17의 범위다. `.`·`..`·`~`는 이 step에서 쓰지 않는다.
- **셸 스크립트·변수·별칭·명령 기록 같은 셸의 다른 기능을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 12가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
