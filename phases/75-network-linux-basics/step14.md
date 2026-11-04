# Step 14: paths-file-commands

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-shell`의 개념 둘(22 절대 경로와 상대 경로, 23 파일을 다루는 기본 명령)의 글·문항·도식을 함께 만든다.** 절대 경로와 상대 경로는 `working-directory`에 딸린 목록 개념이고, 파일을 다루는 기본 명령은 새 머리 개념(목록)이다.

기출은 어디서든 홈 디렉터리로 가는 명령(`cd ~`), `mv -i`의 뜻을 물었다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 12·13 `summary`(특히 step 12의 c·d)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75 step 12)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-shell` 주제(step 13이 쓴 두 개념 — 특히 `working-directory`의 예와 이미 푼 디렉터리·경로·홈 디렉터리. **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-shell.json`
- step 13이 만든 `ShellLayerDiagram`·`WorkingDirectoryDiagram`과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-shell` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 22 | `linux-shell.paths` | 절대 경로와 상대 경로 | `linux-shell.working-directory` | **목록 개념**. 소개 문단: 명령에 파일이나 디렉터리를 알려 주는 방법이 둘이다. 항목 둘 — `- **절대 경로**(absolute pathname)는 …`(`/`로 시작해 어디서 입력해도 같은 곳), `- **상대 경로**(relative pathname)는 …`(`/`로 시작하지 않고 작업 디렉터리에서부터). 항목 뒤 문단: 특별한 이름 셋 — `.`(지금 디렉터리), `..`(한 단계 위 디렉터리), `~`(홈 디렉터리 — 셸이 홈 디렉터리의 경로로 바꿔 준다). 예를 단계대로 — 작업 디렉터리가 `/home/user1/docs`일 때 `../report.txt`는 `..`로 `/home/user1`에 올라가 `report.txt`, 곧 `/home/user1/report.txt`. 마지막 문단: `cd ~`(와 인자 없는 `cd`)는 어디서든 홈 디렉터리로 가고, `cd /`는 맨 위 디렉터리로 가는 것이라 홈이 아니라는 것(4절). `HOME`과 `cd HOME`의 처리는 step 12 결과대로 |
| 23 | `linux-shell.file-commands` | 파일을 다루는 기본 명령 | — | **목록 개념**. 소개 문단: 파일과 디렉터리를 보고, 복사하고, 옮기고, 지우는 명령. 항목 일곱(guide.md 「글」의 항목 이름 규칙 (2)) — `- **목록 보기**(`ls`)는 …`(`-l` 자세히, `-a` 점으로 시작하는 숨은 이름까지), `- **내용 보기**(`cat`)는 …`, `- **복사**(`cp`)는 …`, `- **옮기기와 이름 바꾸기**(`mv`)는 …`, `- **지우기**(`rm`)는 …`(`-r` 디렉터리째 — 되돌릴 수 없다는 것은 근거가 있으면), `- **디렉터리 만들기**(`mkdir`)는 …`, `- **설명서 보기**(`man`)는 …`. 항목마다 명령 한 줄 예(이름은 guide.md 「예시 값」). 항목 뒤 문단: `cp`·`mv`·`rm`의 `-i`는 덮어쓰거나 지우기 전에 물어본다 — 명령과 결과로 보인다(`mv -i notes.txt memo.txt`에서 `memo.txt`가 이미 있으면 덮어쓸지 묻고, 답에 따라 옮기거나 그만둔다). `mv`가 `-i` 없이 묻는 경우는 step 12 결과대로 |

### 2. 문항 — `n136`~`n137`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n136` | `paths` | 4지선다 「상황 적용」 — 작업 디렉터리가 `/home/user2/docs`일 때 상대 경로 `../plan.txt`가 가리키는 파일 → `/home/user2/plan.txt`. 오답은 흔한 잘못 읽기 — `/home/user2/docs/plan.txt`(`..`를 무시), `/plan.txt`(맨 위로 간다고 봄), `/home/plan.txt`(두 단계 올라감). 정답 위치는 균형대로. 해설은 한 단계씩 따라가며 `.`·`..`·`~`를 가르친다 |
| `n137` | `file-commands` | 4지선다 「상황 적용」 — 파일을 다른 디렉터리로 **복사**하는데, 같은 이름의 파일이 이미 있으면 덮어쓰기 전에 확인받고 싶을 때 쓰는 명령 → `cp -i plan.txt backup/`. 오답은 같은 범주에서 헷갈리는 것 — `cp -r`(디렉터리째 복사), `mv -i`(묻기는 하지만 복사가 아니라 옮겨서 원본이 남지 않는다), `rm -i`(지우기 전에 묻는다). 보기는 명령과 하는 일을 함께 쓰지 말고 명령만 둔다 — 하는 일은 해설이 가르친다. `backup/`은 본문에 없는 이름표이니 문제문에서 「`backup` 디렉터리」로 밝힌다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 `cd HOME`·`cd /`·`cd ../HOME`·`cd ~` 묶음, `mv -i`의 설명 넷 묶음을 쓰지 않는다).
이 step의 두 문항은 4지선다이므로 예/아니요 균형은 그대로이고, 정답 위치의 균형을 지킨다.

### 3. 도식 — `src/data/network/visuals/linux-shell.json`에 더한다

#### 3-1. `linux-shell.paths` — `PathResolveDiagram`, JSON 키 `path-resolve`

- 물음형 제목 예: `같은 파일을 두 가지로 가리킬 수 있을까?`
- 그릴 것: 나무 — `/` → `home` → `user1` → `docs`, `user1` 아래 `report.txt`(가지는 늘 보이는 연결선). 작업 디렉터리 `docs`를 곁말 「작업 디렉터리」로 짚는다. 시나리오 경로는 나무 가지 곁에 따로 긋는 화살표(가지와 겹치지 않게).
- 시나리오:

  | id | label | 선명한 것 | 경로·곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `absolute` | 절대 경로 | `/`·`home`·`user1`·`report.txt` | `/`에서 `report.txt`까지. 곁말 `/home/user1/report.txt`. 맨 위에서부터 적어 어디서든 같다 |
  | `relative` | 상대 경로 | `docs`·`user1`·`report.txt` | `docs`에서 `user1`로 올라가(`..`) `report.txt`로. 곁말 `../report.txt`. 작업 디렉터리에서부터 찾는다 |
  | `home` | `~` | `user1` | 곁말 `~` = `/home/user1`. 셸이 `~`를 홈 디렉터리의 경로로 바꾼다 |

- 요점 테스트: `absolute`의 보이는 경로는 `/` 노드에서 시작하고 `relative`의 것은 `docs` 노드에서 시작하며, 둘 다 `report.txt` 노드에서 끝난다. `relative`의 곁말이 `..`로 시작한다.

#### 3-2. `linux-shell.file-commands` — `FileCommandsDiagram`, JSON 키 `file-commands`

- 물음형 제목 예: `cp·mv·rm 뒤에 무엇이 남을까?`
- 그릴 것: guide.md 「전과 후를 보이는 그림」 — 앞 상태(디렉터리 안의 파일 노드), 시나리오마다 다른 명령 노드와 뒤 상태 노드. 이름은 본문의 예와 같게(`notes.txt`·`memo.txt`). 시나리오마다 노드 id·자리를 따로 둔다.
- 시나리오:

  | id | label | 선명한 것 | 경로·곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `copy` | `cp` | 앞 `notes.txt`·`cp notes.txt memo.txt`·뒤 `notes.txt`와 `memo.txt` | 복사하면 원본이 남고 같은 내용의 새 파일이 생긴다 |
  | `move` | `mv` | 앞 `notes.txt`·`mv notes.txt memo.txt`·뒤 `memo.txt` | 옮기거나 이름을 바꾸면 원래 이름은 남지 않는다 |
  | `remove` | `rm` | 앞 `notes.txt`·`rm notes.txt`·곁말 「지워짐」 | 지운 파일은 목록에서 사라진다 |
  | `interactive` | `mv -i` | 앞 `notes.txt`와 이미 있는 `memo.txt`·`mv -i notes.txt memo.txt`·곁말 「덮어쓸지 묻는다」 | `-i`는 같은 이름이 있으면 덮어쓰기 전에 묻는다 |

- 요점 테스트: `copy`의 뒤 노드 라벨에 `notes.txt`와 `memo.txt`가 모두 있고, `move`의 뒤 노드 라벨에는 `notes.txt`가 없다. `interactive`의 보이는 곁말에 「묻」이 있다. 네 시나리오의 명령 노드가 서로 다르다.

위 도식 설계는 출발점이다. 본문(step 12 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 137개, 마지막 id는 `n137`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `paths`가 `working-directory` 바로 뒤에 있고 `parentId`가 `linux-shell.working-directory`인지, `file-commands`는 `parentId`가 없는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 본문의 경로 풀이와 n136을 한 단계씩 손으로 따라간다. n137의 보기 넷이 하는 일을 출처대로 다시 따진다.
4. `phases/75-network-linux-basics/index.json`의 step 14를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **명령의 옵션을 늘어놓지 마라.** 이유: 기출은 `-i`만 묻는다. 항목마다 옵션은 guide.md 표에 적힌 것(`ls -l`·`-a`, `rm -r`, `-i`)까지다.
- **와일드카드(`*`)·`find`·리다이렉션을 이 step에서 쓰지 마라.** 이유: step 15·16의 범위다.
- **개념 24~29를 만들지 마라.** 이유: step 15~17의 범위다.
