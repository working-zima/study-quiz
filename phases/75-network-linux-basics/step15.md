# Step 15: redirection-pipe

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-shell`의 개념 둘(24 리다이렉션, 25 파이프)의 글·문항·도식을 함께 만든다.** 둘 다 새 머리 개념이고, 리다이렉션은 목록 개념이다.

기출은 리다이렉션을 세 번(요구 사항에 맞는 출력 리다이렉션 `>`), 파이프를 한 번(긴 파일을 한 화면씩 보는 `cat … | more`) 물었다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 「파이프의 예」, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 12~14 `summary`(특히 step 12의 e·f)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75 step 12)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-shell` 주제(앞 step이 쓴 개념 넷 — 특히 `file-commands`의 `ls`·`cat`. **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-shell.json`
- 앞 step의 도식과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-shell` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 24 | `linux-shell.redirection` | 리다이렉션 | — | **목록 개념**. 소개 문단: 명령은 보통 결과를 화면에 쓰고(**표준 출력**) 키보드로 입력을 받는다(**표준 입력**). 오류 메시지는 따로 **표준 오류**로 나간다. 셋에 붙은 번호 0·1·2(파일 디스크립터 — 한 줄). 리다이렉션은 그 방향을 파일로 바꾸는 표시다. 항목 넷(guide.md 「글」의 항목 이름 규칙 (2)) — `- **출력 바꾸기**(`>`)는 …`(파일이 있으면 원래 내용을 지우고 새로 쓴다), `- **출력 덧붙이기**(`>>`)는 …`(파일 끝에 이어 쓴다), `- **입력 바꾸기**(`<`)는 …`(파일 내용을 키보드 대신 입력으로), `- **here-document**(`<<`)는 …`(명령 뒤에 이어 적은 줄들을 정한 낱말이 나올 때까지 입력으로). 항목마다 명령과 결과 예 — `ls -l > list.txt`, `ls -l >> list.txt`(두 번 하면 목록이 두 벌), `sort < notes.txt`(`sort` — 줄을 차례대로 늘어놓는 명령, 한 줄), `<<`는 짧은 예(정한 낱말 `END`). 항목 뒤 문단: 표준 오류만 파일로 보내는 `2>` 한 줄. `>`와 `>>`가 무엇이 다른지(4절) |
| 25 | `linux-shell.pipe` | 파이프 | — | 두 명령 사이의 세로 막대(guide.md 「파이프의 예」)가 앞 명령의 표준 출력을 뒤 명령의 표준 입력으로 바로 넘긴다 — 중간 파일이 없다. 표준 입력·출력은 앞 개념이 이미 풀었으면 한 줄로 되짚는다. 예 둘(guide.md 「파이프의 예」) — 긴 파일을 한 화면씩 보는 `more`(한 화면을 보여 주고 키를 누르면 다음 화면으로 — 근거대로, 한 줄)와 정한 글자가 든 줄만 골라 내는 `grep`(한 줄). 명령과 결과를 함께 보인다. 리다이렉션과 무엇이 다른지(4절) — `>`는 출력을 **파일**로 보내므로 `cat notes.txt > more`는 화면에 한 화면씩 보여 주는 것이 아니라 이름이 `more`인 파일을 만든다는 것을 견준다(앞 개념의 `>` 규칙에서 나오는 결과로 쓴다) |

### 2. 문항 — `n138`~`n140`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n138` | `redirection` | 4지선다 「상황 적용」 — `ls -l`의 결과를 파일 `files.txt`에 남기되, 이미 있는 내용을 지우지 않고 뒤에 이어 붙이려면 → 덧붙이기. 보기 넷은 표 아래 「n138의 보기」 — 오답은 같은 범주의 헷갈리는 기호(원래 내용을 지우는 `>`, 오류만 보내는 `2>`, 파일이 아니라 명령에 넘기려 하는 세로 막대). **기출의 `>`·`<`·`<<`·`>>` 보기 묶음을 쓰지 않는다**(guide.md 「문항」 11항). 정답 위치는 균형대로 |
| `n139` | `redirection` | 예/아니요 「오해 바로잡기」 — `sort < names.txt`를 입력하면 `sort`의 결과가 `names.txt`에 저장되는가(아니요 — `<`는 파일을 입력으로 줄 뿐이고 결과는 화면에 나온다). step 14가 끝난 뒤의 균형(계획대로면 예 24·아니요 24)에서 **아니요** 쪽으로 세운다. n138과 다른 것(입력 방향)을 묻는다. `names.txt`는 문항의 이름표라고 문제문에서 밝힐 필요는 없지만 본문에 없는 이름임을 확인한다 |
| `n140` | `pipe` | 4지선다 「개념 비교」 — 긴 파일 `app.log`의 내용을 한 화면씩 넘겨 보려면 → 세로 막대로 `more`에 넘기는 명령. 보기 넷은 표 아래 「n140의 보기」 — 오답 셋은 `more`라는 파일을 만드는 `>`·`>>`와, `more`라는 글자가 든 줄만 골라 내는 `grep`. 정답 위치는 균형대로. 해설은 세로 막대와 `>`의 차이를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 `cat … | more`·`cat … | grep`·`find … | grep`·`tar … | grep` 묶음을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.
JSON 안의 세로 막대는 그대로 `|` 하나다(역슬래시를 붙이지 않는다 — guide.md 「파이프의 예」). 세로 막대가 든 명령 줄은 표 안에 쓰면 칸 나눔으로 읽히므로 여기 적는다(차례는 정답 위치의 균형대로 섞는다).

n138의 보기(첫째가 정답):

```
ls -l >> files.txt
ls -l > files.txt
ls -l 2> files.txt
ls -l | files.txt
```

n140의 보기(첫째가 정답):

```
cat app.log | more
cat app.log > more
cat app.log >> more
cat app.log | grep more
```

### 3. 도식 — `src/data/network/visuals/linux-shell.json`에 더한다

#### 3-1. `linux-shell.redirection` — `RedirectionFlowDiagram`, JSON 키 `redirection-flow`

- 물음형 제목 예: `>와 >>와 <는 각각 어디로 보낼까?`
- 그릴 것: 위(입력 쪽)에 `키보드`·`notes.txt`, 가운데에 명령 노드 `ls -l`·`sort`, 아래(출력 쪽)에 `화면`·`list.txt`. 시나리오 경로 — 입력 쪽에서 명령으로, 명령에서 출력 쪽으로.
- 시나리오:

  | id | label | 선명한 것 | 경로·곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `default` | 기본 | `ls -l`·`화면` | `ls -l` → `화면`. 리다이렉션이 없으면 결과는 화면(표준 출력)으로 |
  | `overwrite` | `>` | `ls -l`·`list.txt` | `ls -l` → `list.txt`, 곁말 「원래 내용을 지우고 새로 씀」 |
  | `append` | `>>` | `ls -l`·`list.txt` | `ls -l` → `list.txt`, 곁말 「끝에 이어 씀」 |
  | `input` | `<` | `notes.txt`·`sort`·`화면` | `notes.txt` → `sort` → `화면`. 파일이 키보드 대신 입력이 되고 결과는 화면으로 |

- 요점 테스트: `overwrite`와 `append`는 보이는 경로가 같고(`ls -l` → `list.txt`) 보이는 곁말이 다르다. `input`에서 `list.txt`는 흐리고 `notes.txt`에서 시작하는 경로가 보인다. `default`에서 `list.txt`로 가는 경로가 보이지 않는다.

#### 3-2. `linux-shell.pipe` — `PipeFlowDiagram`, JSON 키 `pipe-flow`

- 물음형 제목 예: `세로 막대와 >는 무엇이 다를까?`
- 그릴 것: 명령 노드 `cat notes.txt`·`more`·`ls -l`·`grep report`, 출력 노드 `화면`, 파일 노드 `more`(파일 — 라벨로 명령 `more`와 가를 수 있게, 예 「파일 `more`」). 시나리오 경로.
- 시나리오:

  | id | label | 선명한 것 | 경로·캡션이 말할 것 |
  |---|---|---|---|
  | `page` | 파이프로 more | `cat notes.txt`·`more`(명령)·`화면` | `cat notes.txt` → `more` → `화면`. 앞 명령의 출력이 `more`의 입력이 되어 한 화면씩 보인다 |
  | `filter` | 파이프로 grep | `ls -l`·`grep report`·`화면` | `ls -l` → `grep report` → `화면`. `report`가 든 줄만 화면에 나온다 |
  | `file` | `> more` | `cat notes.txt`·파일 `more` | `cat notes.txt` → 파일 `more`. `>`는 명령이 아니라 이름이 `more`인 파일로 보낸다 |

- 요점 테스트: `page`의 보이는 경로가 명령 `more` 노드를 거쳐 `화면`에서 끝나고, `file`의 보이는 경로는 파일 `more` 노드에서 끝나며 `화면`이 흐리다. 명령 `more`와 파일 `more`는 서로 다른 노드다.
  시나리오 버튼 라벨(「파이프로 more」 같은)은 바꿔도 되지만, 세로 막대를 라벨에 쓰려면 화면에서 글자로 읽히는지 테스트로 확인한다.

위 도식 설계는 출발점이다. 본문(step 12 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 140개, 마지막 id는 `n140`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 두 개념 모두 `parentId`가 없고 `file-commands` 뒤에 차례로 있는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 본문·문항·도식의 명령 줄에서 세로 막대와 꺾쇠가 글자 그대로 보이는지(`node -e`로 JSON을 읽어 문자열을 출력해 본다), 역슬래시가 섞이지 않았는지 본다.
4. `phases/75-network-linux-basics/index.json`의 step 15를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`2>&1`·`&>`·`>|`·`tee` 같은 다른 리다이렉션과 명령을 쓰지 마라.** 이유: 기출이 묻지 않는다. `2>`는 한 줄까지다.
- **`grep`의 옵션과 정규 표현식을 쓰지 마라.** 이유: `grep`은 파이프의 예로만 쓴다.
- **`ps -ef | grep` 같은 프로세스 예를 쓰지 마라.** 이유: `linux-process-boot`(phase 76)의 범위다.
- **개념 26~29를 만들지 마라.** 이유: step 16·17의 범위다.
