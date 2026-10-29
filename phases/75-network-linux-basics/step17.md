# Step 17: vi-commands

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-shell`의 마지막 개념 둘(28 vi의 편집 명령, 29 vi의 콜론 명령)의 글·문항·도식을 함께 만들고, 이 주제와 이 phase의 개념 작업을 마무리한다.** 둘 다 `vi`에 딸린 목록 개념이다.

기출은 vi를 세 번 물었다 — 글자 하나를 지우는 명령(`x`), 저장하지 않은 채 끝내려 할 때 바로 끝나지 않는 명령(`:q`), 줄 범위 안의 글자를 모두 바꾸는 명령(`:s///g`).

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 12~16 `summary`(특히 step 12의 h·i·j)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75 step 12)」 항목의 POSIX `vi`·`ex`), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-shell` 주제(앞 step이 쓴 개념 여덟 — 특히 `vi`의 모드와 이미 푼 낱말. **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-shell.json`
- step 16이 만든 `ViModesDiagram`과 그 테스트, 앞 step의 「전과 후」 도식(`FileCommandsDiagram`), `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-shell` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 28 | `linux-shell.vi-edit-commands` | vi의 편집 명령 | `linux-shell.vi` | **목록 개념**. 소개 문단: 명령 모드에서 누르는 지우기·되돌리기 명령. **커서**(지금 고칠 자리를 가리키는 표시 — 한 줄)를 푼다. 항목 다섯(guide.md 「글」의 항목 이름 규칙 (2)) — `- **글자 지우기**(`x`)는 …`, `- **낱말 지우기**(`dw`)는 …`, `- **줄 끝까지 지우기**(`D`)는 …`, `- **줄 지우기**(`dd`)는 …`, `- **되돌리기**(`u`)는 …`. 항목 뒤 문단: 줄 하나 `red green blue`에서 커서가 `green`의 `g`에 있을 때 명령마다의 결과를 단계대로 — `x` → `red reen blue`, `dw` → `red blue`(낱말과 그 뒤 빈칸까지), `D` → `red `(커서 앞만 남는다), `dd` → 줄이 통째로 사라진다, 그 뒤 `u` → 바로 앞의 바꿈이 되돌아간다. 결과는 POSIX가 말하는 뜻에서 나와야 한다(step 12 결과) — 확인하지 못한 결과는 쓰지 않는다. 앞에 수를 붙이는 꼴(`3dd`)은 step 12 결과대로 한 줄 |
| 29 | `linux-shell.vi-colon-commands` | vi의 콜론 명령 | `linux-shell.vi` | **목록 개념**. 소개 문단: 명령 모드에서 `:`를 누르고 아래 줄에 입력하는 명령(앞 개념 `vi`의 말과 맞춘다). 항목 다섯 — `- **저장**(`:w`)은 …`, `- **끝내기**(`:q`)는 …`(저장하지 않은 바뀜이 있으면 끝나지 않고 알린다), `- **버리고 끝내기**(`:q!`)는 …`, `- **저장하고 끝내기**(`:wq`)는 …`, `- **바꾸기**(`:s`)는 …`. 항목 뒤 문단: 바꾸기 명령을 덩어리로 끊어 읽는다 — `:2,6s/red/blue/g`는 줄 범위 `2,6`(2째 줄부터 6째 줄까지), `s`(바꾸기), `/red/`(찾을 글자), `blue/`(바꿀 글자), `g`(줄 안의 것을 모두 — 없으면 줄마다 첫 번째만). 예로 한 줄에 `red`가 둘 있을 때 `g`가 있고 없음에 따라 결과가 어떻게 다른지 보인다. `%`(모든 줄)는 step 12 결과대로 한 줄. `:q`와 `:q!`가 무엇이 다른지(4절) |

### 2. 문항 — `n143`~`n144`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n143` | `vi-edit-commands` | 4지선다 「원리 이해」 — 본문 예와 다른 줄(예 `one two three`, 커서가 `two`의 `t`)에서 정한 명령 하나(예 `dw`)를 눌렀을 때 남는 줄을 고른다. **보기는 명령 이름이 아니라 결과 줄이다** — 정답 `one three`, 오답은 다른 명령을 눌렀을 때의 결과(`x`의 `one wo three`, `D`의 `one `, `dd`의 빈 줄 — 빈 줄은 「줄이 통째로 사라진다」처럼 말로). 기출의 `dd`·`x`·`D`·`dw` 명령 이름 묶음을 보기로 쓰지 않는다(guide.md 「문항」 11항). 결과 넷을 POSIX의 뜻으로 손으로 다시 따진다. 정답 위치는 균형대로 |
| `n144` | `vi-colon-commands` | 4지선다 「상황 적용」 — `memo.txt`를 고치다가, 고친 내용을 저장하지 않고 버린 채 vi를 끝내려면 → `:q!`. 오답 — `:q`(바뀐 내용이 있어 끝나지 않고 알린다), `:wq`(저장하고 끝나 버린다), `:w`(저장만 하고 끝나지 않는다). 기출의 `:wq`·`:wq!`·`:q!`·`:q` 묶음과 같지 않게 둔다. 정답 위치는 균형대로 |

이 step의 두 문항은 4지선다이므로 예/아니요 균형은 그대로이고(계획대로면 phase 끝에 예 25·아니요 25), 정답 위치의 균형을 지킨다.

### 3. 도식 — `src/data/network/visuals/linux-shell.json`에 더한다

#### 3-1. `linux-shell.vi-edit-commands` — `ViEditCommandsDiagram`, JSON 키 `vi-edit-commands`

- 물음형 제목 예: `x·dw·D·dd는 각각 얼마나 지울까?`
- 그릴 것: guide.md 「전과 후를 보이는 그림」 — 앞 줄 노드 `red green blue`(곁말 「커서: `green`의 `g`」, 늘 선명), 시나리오마다 다른 명령 노드와 뒤 줄 노드. 줄이 사라지는 `dd`의 뒤 노드는 라벨을 말로(본문의 말 — 예 「줄이 사라짐」). 끝의 빈칸은 화면에서 보이지 않으므로 `D`의 뒤 노드 라벨은 `red`로 두고 곁말로 「커서 앞만 남음」을 보인다.
- 시나리오:

  | id | label | 선명한 것 | 경로·캡션이 말할 것 |
  |---|---|---|---|
  | `char` | `x` | 앞 줄·`x`·뒤 `red reen blue` | 커서의 글자 하나만 지운다 |
  | `word` | `dw` | 앞 줄·`dw`·뒤 `red blue` | 커서부터 낱말 끝(뒤 빈칸까지)을 지운다 |
  | `end` | `D` | 앞 줄·`D`·뒤 `red` | 커서부터 줄 끝까지 지운다 |
  | `line` | `dd` | 앞 줄·`dd`·뒤 「줄이 사라짐」 | 커서가 있는 줄을 통째로 지운다 |

- 요점 테스트: 시나리오마다 앞 줄 → 명령 → 뒤 줄 경로가 보이고, 뒤 줄 노드 라벨이 위 표와 같다(`x`의 결과는 앞 줄에서 `g` 한 글자만 빠진 것임을 테스트가 문자열로 확인한다). 네 시나리오의 명령 노드와 뒤 줄 노드가 서로 다르다.

#### 3-2. `linux-shell.vi-colon-commands` — `ViColonCommandsDiagram`, JSON 키 `vi-colon-commands`

- 물음형 제목 예: `저장하지 않고 끝내려면 무엇을 입력할까?`
- 그릴 것: 앞 상태 노드 「바뀐 내용이 저장되지 않은 `memo.txt`」(라벨이 길면 곁말로 나눈다, 늘 선명), 시나리오마다 다른 명령 노드와 결과 노드(본문의 말 — 「저장됨, vi는 그대로」, 「끝나지 않음」, 「바뀜을 버리고 끝남」, 「저장하고 끝남」). 끝나지 않는 것은 색이 아니라 곁말과 결과 노드의 말로(guide.md 「색」).
- 시나리오:

  | id | label | 선명한 것 | 경로·캡션이 말할 것 |
  |---|---|---|---|
  | `write` | `:w` | 앞 상태·`:w`·결과 | 저장하지만 vi는 끝나지 않는다 |
  | `quit` | `:q` | 앞 상태·`:q`·결과 「끝나지 않음」 | 저장하지 않은 바뀜이 있으면 끝나지 않고 알린다 |
  | `force-quit` | `:q!` | 앞 상태·`:q!`·결과 | 바뀐 내용을 버리고 끝낸다 |
  | `write-quit` | `:wq` | 앞 상태·`:wq`·결과 | 저장하고 끝낸다 |

- 요점 테스트: `quit`의 결과 노드 라벨이 「끝나지 않」을 담고, `force-quit`의 결과 노드 라벨이 「버리」를 담는다. 네 시나리오의 결과 노드가 서로 다르다. 바꾸기(`:s`)는 이 도식에 넣지 않아도 된다 — 넣는다면 다섯째 시나리오로, 줄 범위 안의 줄만 바뀌는 것을 본문의 예 그대로 보인다.

위 도식 설계는 출발점이다. 본문(step 12 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 144개, 마지막 id는 `n144`다. `linux-shell`의 개념은 10개, 문항은 12개(n133~n144)이고, 이 phase는 개념 29개·문항 34개·도식 29개를 더했다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 두 개념 모두 `parentId`가 `linux-shell.vi`이고 `vi` 바로 뒤에 차례로 있는지 본다.
3. **주제를 마무리하며 통독한다** — `linux-shell`의 개념 10개를 처음부터 끝까지 처음 배우는 사람의 눈으로 읽고, 풀이 없이 처음 나오는 낱말과, 같은 낱말을 두 번 푼 곳을 세어 summary에 적는다(고치지 않는다 — 이 step의 개념이 아니면).
   기출 17문항이 묻는 사실(guide.md 표의 「다룰 것」)이 모두 본문에 있는지 하나씩 대조해 표로 적는다.
4. **phase 전체를 센다** — 세 주제의 개념 수(11·8·10), 문항 수(13·9·12)와 id 범위(n111~n144), 예/아니요 균형과 정답 위치, 도식 29개가 registry에 모두 있는지, 교차 검사의 노드·경로 수(phase 시작 960/690에서 얼마나 늘었는지)를 summary에 적는다.
5. 개념마다 WRITING_GUIDE 「6. 최종 검토」의 질문으로 다시 읽는다. 본문의 vi 결과와 n143의 보기 넷을 POSIX의 뜻으로 손으로 다시 따진다.
6. `phases/75-network-linux-basics/index.json`의 step 17을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」과 위 3·4의 결과.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **커서 이동 명령(`h`·`j`·`k`·`l`·`w`만 따로 등)과 복사·붙이기(`yy`·`p`)를 항목으로 늘어놓지 마라.** 이유: 기출이 묻지 않는다. `dw`의 `w`가 「낱말」을 뜻한다는 한 줄까지는 된다.
- **vim의 기능(비주얼 모드, `:set`, 정규 표현식 확장)을 쓰지 마라.** 이유: 허용한 출처는 POSIX `vi`·`ex`뿐이다(guide.md 「출처」).
- **앞 step의 개념·문항·도식을 고치지 마라.** 이유: 통독에서 찾은 것은 summary에 적고, 사용자가 판단한다.
