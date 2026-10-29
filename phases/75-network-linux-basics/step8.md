# Step 8: owner-rwx

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-permissions`를 만들고 그 첫 개념 둘(12 소유자, 그룹, 그 밖의 사용자, 13 읽기·쓰기·실행 권한)의 글·문항·도식을 함께 만든다.**

이 주제는 학습자가 Linux의 권한을 처음 여는 화면이다. 앞 주제(`linux-filesystem`)를 읽지 않고 바로 들어올 수 있다고 보고, 파일·디렉터리·root 같은 바탕 낱말을 이 주제 안에서 다시 짧게 푼다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 7 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 step 6 `summary`(앞 주제가 끝났을 때의 수 — 교차 검사·균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75 step 7)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(앞 주제 `linux-filesystem` — 같은 phase의 글이 어떤 말로 Linux·파일·디렉터리·root를 풀었는지 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- `linux-filesystem`의 도식(`src/components/diagrams/` — step 1~6이 만든 것)과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`linux-filesystem` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "linux-permissions", "title": "Linux 파일 권한과 소유자", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 12·13이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 12 | `linux-permissions.owner-group-others` | 소유자, 그룹, 그 밖의 사용자 | — | 이 주제의 첫 개념이라 **Linux**, **파일·디렉터리**, **사용자 계정**(컴퓨터를 쓰는 사람마다 만든 이름과 번호), **그룹**(사용자 여럿을 묶은 이름), **관리자 root**를 짧게 푼다(앞 주제의 말과 맞춘다). 예는 guide.md 「예시 값」 — 파일 `report.txt`의 소유자 `user1`·그룹 `dev`, `user2`는 `dev` 그룹, `user3`는 아니다(예로 붙인 이름이라고 밝힌다). 세 사람이 각각 어느 부류인지 단계대로 가린다 — 소유자인가? 아니면 그 그룹에 드는가? 아니면 그 밖. 가리는 차례와 「소유자이면 그룹 권한은 보지 않는다」는 step 7 결과의 근거가 있을 때만. 새 파일의 소유자가 만든 사람이라는 것, root가 보통 권한 검사를 받지 않는다는 것은 step 7 결과대로. 권한 글자(`r`·`w`·`x`)는 이 개념에서 한 줄 풀이로만 든다 |
| 13 | `linux-permissions.rwx-permissions` | 읽기·쓰기·실행 권한 | — | **목록 개념**. 소개 문단: 세 부류마다 권한 셋을 따로 켜고 끈다. 항목 셋 — `- **읽기**(read, `r`)는 …`, `- **쓰기**(write, `w`)는 …`, `- **실행**(execute, `x`)은 …`(guide.md 「글」의 항목 이름 규칙 (1)). 항목마다 파일에서의 뜻과 디렉터리에서의 뜻을 한 항목 안에서 함께 쓴다. 디렉터리의 실행 권한은 「안으로 들어가고 안의 파일에 닿는 것」으로 풀고, `cd`(작업 위치를 그 디렉터리로 옮기는 명령)를 한 줄로 푼다. 항목 뒤 문단: 파일을 지우거나 이름을 바꿀 수 있는지는 그 파일의 권한이 아니라 그 파일이 든 디렉터리의 권한이 정한다 — step 7 결과에 근거가 있을 때만 쓰고, 4절대로 왜 헷갈리는지(「파일을 바꾼다」로 느껴지지만 실제로 바뀌는 것은 디렉터리의 목록)와 함께. 예는 `report.txt`(파일)와 `docs`(디렉터리) |

### 2. 문항 — `src/data/network/questions.json`에 `n124`~`n125`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n124` | `owner-group-others` | 4지선다 「상황 적용」 — 본문 예와 다른 상황(예: 파일 `plan.txt`의 소유자 `user2`·그룹 `ops`, 읽으려는 사람이 `ops` 그룹의 `user3`)에서 그 사람에게 어느 부류의 권한이 적용되는가 → 그룹. 오답은 소유자, 그 밖의 사용자, 「세 부류 가운데 가장 넓은 권한」(흔한 오해 — step 7 결과가 차례를 확인했을 때만 이 보기를 쓴다. 확인하지 못했으면 다른 오답). 이 상황의 그룹 소속은 문제문에 적는다(guide.md 「예시 값」의 소속과 다르면 문제문의 것이 그 문항의 이름표다). 정답 위치는 균형대로 |
| `n125` | `rwx-permissions` | 예/아니요 「오해 바로잡기」 — 파일에 쓰기 권한이 없으면, 그 파일이 든 디렉터리에 쓰기·실행 권한이 있어도 그 파일을 지울 수 없는가(아니요 — 지우기는 디렉터리의 권한이 정한다). step 7 결과가 근거를 찾지 못했으면 「디렉터리에 실행 권한이 없어도 그 디렉터리 안으로 `cd`할 수 있는가」(아니요)로 바꾼다. step 6이 끝난 뒤의 균형(계획대로면 예 22·아니요 22)에서 **아니요** 쪽으로 세운다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/network/visuals/linux-permissions.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'linux-permissions': linuxPermissionsVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `linux-permissions.owner-group-others` — `PermissionClassesDiagram`, JSON 키 `permission-classes`

- 물음형 제목 예: `이 사람에게는 어느 권한이 적용될까?`
- 그릴 것: 파일 노드 `report.txt`와 그 곁말(「소유자 `user1` · 그룹 `dev`」), 사용자 노드 `user1`·`user2`·`user3`, 부류 노드 `소유자 권한`·`그룹 권한`·`그 밖의 권한`(세 부류 노드를 그룹 박스 「`report.txt`의 권한」으로 묶을 수 있다). 시나리오 경로 — 사용자에서 그 사람의 부류로.
- 시나리오:

  | id | label | 선명한 것 | 경로·캡션이 말할 것 |
  |---|---|---|---|
  | `owner` | `user1` | `user1`·`소유자 권한` | `user1` → `소유자 권한`. 파일의 소유자다 |
  | `group` | `user2` | `user2`·`그룹 권한` | `user2` → `그룹 권한`. 소유자가 아니지만 파일의 그룹 `dev`에 든다 |
  | `others` | `user3` | `user3`·`그 밖의 권한` | `user3` → `그 밖의 권한`. 소유자도 아니고 그룹에도 들지 않는다 |

- 요점 테스트: 시나리오마다 보이는 경로가 하나이고, 그 경로는 그 시나리오의 사용자 노드에서 시작해 부류 노드에서 끝난다. `group`의 끝 노드 라벨이 `그룹 권한`이다. 세 시나리오의 끝 노드가 서로 다르다.

#### 3-2. `linux-permissions.rwx-permissions` — `RwxMeaningDiagram`, JSON 키 `rwx-meaning`

- 물음형 제목 예: `r·w·x는 파일과 디렉터리에서 무엇을 허락할까?`
- 그릴 것: 글자 노드 `r`·`w`·`x`를 위에서 아래로, 각 글자의 오른쪽(세로형이면 아래)에 파일에서의 뜻 노드와 디렉터리에서의 뜻 노드(본문의 말로 — 예 「내용 읽기」·「이름 목록 보기」). 뜻 노드를 그룹 박스 「파일」·「디렉터리」로 묶는다.
  280 폭에 세 칸을 한 줄에 넣기 어렵다면 글자 노드 줄과 뜻 노드 줄을 시나리오마다 다른 노드로 둔다(guide.md 「전과 후를 보이는 그림」의 원칙 — 같은 자리에 겹쳐 두지 않는다).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `file` | 파일에서 | 글자 셋·파일 쪽 뜻 노드 셋 | 파일에서는 내용을 읽고, 고치고, 프로그램으로 실행한다 |
  | `directory` | 디렉터리에서 | 글자 셋·디렉터리 쪽 뜻 노드 셋 | 디렉터리에서는 목록을 보고, 안의 항목을 만들고 지우고, 안으로 들어간다 |
  | `delete` | 파일 지우기 | `w`·디렉터리 쪽 쓰기 뜻 노드(본문이 실행도 말하면 실행 뜻 노드도) | 파일을 지울 수 있는지는 그 파일이 든 디렉터리의 권한이 정한다 — step 7 결과에 근거가 없어 본문에 없으면 이 시나리오를 뺀다 |

- 요점 테스트: `file`의 선명한 뜻 노드는 모두 「파일」 그룹 안에 있고, `directory`의 것은 모두 「디렉터리」 그룹 안에 있다. `directory`의 쓰기 뜻 노드 라벨에 「만들」과 「지우」가 함께 있다(본문의 말대로). `delete`가 있으면 그 선명한 뜻 노드에 「파일」 그룹 안 노드가 없다.

위 도식 설계는 출발점이다. 본문(step 7 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 125개, 마지막 id는 `n125`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `linux-filesystem` 바로 뒤에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·목록 항목·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 7 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 세 사람의 부류 가리기를 손으로 다시 따졌는가.
4. `phases/75-network-linux-basics/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 14~19(권한 문자열, 파일 종류 문자, 8진수 권한 표기, chmod 명령, chmod의 기호 모드, chown 명령)를 만들지 마라.** 이유: step 9~11의 범위다. 이 step의 글이 `ls -l`·`chmod`를 쓸 때는 한 줄 풀이로 그친다.
- **특수 권한(setuid·setgid·sticky)·ACL을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 7이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
