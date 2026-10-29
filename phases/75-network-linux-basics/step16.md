# Step 16: find-vi

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-shell`의 개념 둘(26 find 명령, 27 vi 편집기)의 글·문항·도식을 함께 만든다.** 둘 다 새 머리 개념이고, find 명령은 목록 개념이다. vi 편집기에는 step 17이 딸린 개념 둘을 붙인다.

기출은 `find`의 옵션을 두 번(`-exec`이 찾은 파일에 명령을 실행한다 — `-name`은 사용자 이름이 아니다, `-perm`은 소유자 권한만 보는 것이 아니다) 물었다. vi는 세 번 물었지만 명령 하나하나는 step 17이 쓰고, 이 step은 그 바탕인 모드를 쓴다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙(JSON 안의 역슬래시), 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 12~15 `summary`(특히 step 12의 g·h)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75 step 12)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-shell` 주제(앞 step이 쓴 개념 여섯 — 특히 `paths`·`file-commands`. **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-shell.json`
- 앞 step의 도식(`PathResolveDiagram` 등)과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-shell` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 26 | `linux-shell.find` | find 명령 | — | **목록 개념**. 소개 문단: `find 시작할 디렉터리 조건` 꼴로, 시작 디렉터리와 그 아래를 모두 내려가며 조건에 맞는 것을 찾고, 따로 시키지 않으면 찾은 경로를 출력한다. 항목 다섯(guide.md 「글」의 항목 이름 규칙 (2)) — `- **이름으로 찾기**(`-name`)는 …`(파일 이름 — `*`는 아무 글자나 몇 개든 대신한다는 한 줄, 사용자 이름이 아니라는 것), `- **종류로 찾기**(`-type`)는 …`(`f` 일반 파일, `d` 디렉터리), `- **권한으로 찾기**(`-perm`)는 …`(소유자 권한만이 아니라 권한 전체를 본다 — 꼴 셋은 step 12 결과대로 한 줄), `- **소유자로 찾기**(`-user`)는 …`, `- **찾은 것마다 명령 실행**(`-exec`)은 …`(`-exec 명령 {} \;` — `{}` 자리에 찾은 경로가 들어가고 `\;`가 명령의 끝을 알린다). 항목 뒤 문단: 명령과 결과 — `/home/user1` 아래 예 파일(`app.log`, `report.txt`, `docs` 안의 `old.log` — guide.md 「예시 값」에 없는 이름은 예로 붙인 이름이라고 밝힌다)에서 `find /home/user1 -name "*.log"`가 `docs` 안까지 내려가 두 경로를 출력하는 것, `-type d`는 시작 디렉터리 자신도 디렉터리라 함께 나온다는 것(근거대로), `-exec ls -l {} \;`의 결과. 큰따옴표로 `*`를 감싸는 까닭(셸이 먼저 바꾸지 않게)은 근거가 있으면 한 줄 |
| 27 | `linux-shell.vi` | vi 편집기 | — | **텍스트 편집기**(글자로 된 파일을 열어 고치는 프로그램)를 푼다. vi는 터미널에서 쓰는 편집기이고 POSIX가 정한 표준 편집기다 — 이 주제의 vi 명령은 POSIX가 정한 것이라는 한 줄(guide.md 「출처」). 모드를 단계대로 — `vi memo.txt`로 열면 **명령 모드**라 누르는 글자가 명령으로 받아들여지고, `i`(커서 앞에)·`a`(커서 뒤에)·`o`(아래에 새 줄을 열고)로 **입력 모드**에 들어가 글자를 입력하며, `Esc`로 명령 모드로 돌아온다. 명령 모드에서 `:`를 누르면 화면 맨 아래 줄에 저장·끝내기·바꾸기 같은 명령을 입력하고 `Enter`로 실행한다(이 줄의 이름은 step 12 결과의 말로). 명령 모드와 입력 모드가 무엇이 다른지(4절) — 같은 글자 `x`가 명령 모드에서는 지우기 명령이고 입력 모드에서는 글자 x다. 지우기·저장 명령은 「명령 모드에서 쓰는 명령이 따로 있다」는 한 줄까지 |

### 2. 문항 — `n141`~`n142`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n141` | `find` | 4지선다 「상황 적용」 — `/home/user2` 아래에서 이름이 `.bak`로 끝나는 파일을 모두 찾아 하나씩 지우려면 → `find /home/user2 -name "*.bak" -exec rm {} \;`. 오답은 조건 자리에 다른 옵션을 둔 것 — `-user "*.bak"`(소유자를 찾는다), `-type "*.bak"`(종류를 찾는다), `-perm "*.bak"`(권한을 찾는다) — 뒤의 `-exec rm {} \;`는 넷이 같게 둔다. 정답 위치는 균형대로. **JSON에는 `\\;`로 적고**, 화면에 역슬래시 하나로 보이는지 `node -e`로 확인한다. 해설은 옵션마다 무엇을 찾는지와 `-exec`의 `{}`·`\;`를 가르친다 |
| `n142` | `vi` | 예/아니요 「오해 바로잡기」 — vi로 파일을 막 열었을 때 누르는 글자는 문서에 들어가지 않고 명령으로 받아들여지는가(예). step 15가 끝난 뒤의 균형(계획대로면 예 24·아니요 25)에서 **예** 쪽으로 세운다. 해설은 입력 모드에 들어가고 나오는 법을 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 `find` 옵션 설명 넷 묶음을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식 — `src/data/network/visuals/linux-shell.json`에 더한다

#### 3-1. `linux-shell.find` — `FindSearchDiagram`, JSON 키 `find-search`

- 물음형 제목 예: `find는 어디까지 내려가 무엇을 찾을까?`
- 그릴 것: 나무 — `user1`(시작 디렉터리 — 곁말 `/home/user1`) 아래 `app.log`·`report.txt`·`docs`, `docs` 아래 `old.log`(가지는 늘 보이는 연결선). 명령 노드 `ls -l`(시나리오 `exec`에서만 쓰는 경로의 끝).
- 시나리오:

  | id | label | 선명한 것 | 경로·곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `name` | `-name "*.log"` | `app.log`·`old.log` | 곁말 「`docs` 안까지 내려간다」. 이름이 `.log`로 끝나는 것을 아래까지 모두 찾는다 |
  | `type` | `-type d` | `user1`·`docs` | 디렉터리만 — 시작 디렉터리 자신도 디렉터리라 함께 나온다(본문이 근거를 쓴 만큼) |
  | `exec` | `-exec ls -l {} \;` | `app.log`·`old.log`·`ls -l` | `app.log` → `ls -l`, `old.log` → `ls -l`. 찾은 것마다 `{}` 자리에 경로를 넣어 명령을 실행한다 |

- 요점 테스트: `name`의 선명한 나무 노드 라벨이 모두 `.log`로 끝나고 그 가운데 `docs`의 자식이 있다. `type`의 선명한 노드는 모두 자식이 있는 노드(디렉터리)다. `exec`에서 보이는 경로는 모두 `ls -l` 노드에서 끝나고, 그 수가 `name`의 선명한 파일 수와 같다.
  JSON의 시나리오 라벨에 역슬래시가 들어가면 JSON 이스케이프(`\\;`)로 적고, 버튼에 역슬래시 하나로 보이는지 테스트로 확인한다.

#### 3-2. `linux-shell.vi` — `ViModesDiagram`, JSON 키 `vi-modes`

- 물음형 제목 예: `vi에서 글자를 입력하려면 어디로 가야 할까?`
- 그릴 것: 노드 `vi memo.txt`(시작), `명령 모드`, `입력 모드`, 콜론 명령 줄(이름은 본문의 말로). 경로 — 시작 → `명령 모드`, `명령 모드` → `입력 모드`(곁말 `i`·`a`·`o`), `입력 모드` → `명령 모드`(곁말 `Esc`), `명령 모드` → 콜론 줄(곁말 `:`), 콜론 줄 → `명령 모드`(곁말 `Enter` — 본문이 근거를 쓴 만큼). 오가는 두 경로가 겹치지 않게 나란히 긋는다.
- 시나리오:

  | id | label | 선명한 것 | 경로·캡션이 말할 것 |
  |---|---|---|---|
  | `start` | 처음 열 때 | `vi memo.txt`·`명령 모드` | 시작 → `명령 모드`. 처음에는 명령 모드라 누르는 글자가 명령이다 |
  | `insert` | 입력하기 | `명령 모드`·`입력 모드` | `i`·`a`·`o`로 들어가고 `Esc`로 나온다 |
  | `colon` | 콜론 명령 | `명령 모드`·콜론 줄 | `:`로 아래 줄에 명령을 입력하고 실행하면 명령 모드로 돌아온다 |

- 요점 테스트: `start`에서 보이는 경로는 시작 노드에서 `명령 모드`로 가는 것 하나이고 `입력 모드`는 흐리다. 어느 시나리오에서도 `입력 모드`와 콜론 줄을 바로 잇는 경로가 없다. `insert`의 보이는 곁말에 `Esc`가 있다.

위 도식 설계는 출발점이다. 본문(step 12 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 142개, 마지막 id는 `n142`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 두 개념 모두 `parentId`가 없고 `pipe` 뒤에 차례로 있는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 본문의 `find` 예가 출력할 경로를 나무를 따라 손으로 다시 따지고(시작 디렉터리 포함 여부), 본문·문항·도식에서 `{} \;`가 역슬래시 하나로 보이는지 `node -e`로 문자열을 출력해 본다.
4. `phases/75-network-linux-basics/index.json`의 step 16을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`find`의 다른 조건(`-size`·`-mtime`·`-maxdepth` 등)과 `-ok`·`+` 꼴을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **vi의 지우기·저장·끝내기·바꾸기 명령(`x`·`dd`·`:q`·`:s` 등)을 자세히 쓰지 마라.** 이유: step 17의 `vi-edit-commands`·`vi-colon-commands`가 쓴다. 이 step에서는 모드와, 모드를 오가는 키까지다.
- **vim의 기능(비주얼 모드·`:set` 등)을 쓰지 마라.** 이유: 허용한 출처는 POSIX `vi`·`ex`뿐이다(guide.md 「출처」).
