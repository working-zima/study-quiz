# Step 11: symbolic-chown

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-permissions`의 마지막 개념 둘(18 chmod의 기호 모드, 19 chown 명령)의 글·문항·도식을 함께 만들고, 이 주제를 마무리한다.** 기호 모드는 `chmod`에 딸린 개념이고, chown 명령은 새 머리 개념이다.

기출은 기호 모드를 세 번(모든 사용자의 쓰기 빼기 `a-w`, 「원래 권한을 둔 채 쓰기 더하기 — 결과가 다른 명령」 두 번), `chown`을 네 번(소유자와 그룹을 바꾸는 명령 두 번, root만 쓰는 명령 두 번) 물었다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값(사용자와 그룹의 소속), 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 7~10 `summary`(특히 step 7의 g·h와 `chown` 「root만」의 처리)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75 step 7)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-permissions` 주제(앞 step이 쓴 개념 6개 — 특히 `chmod`의 예와 `octal-mode`의 계산. **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-permissions.json`
- 앞 step의 도식(`ChmodChangeDiagram` 등)과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-permissions` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 18 | `linux-permissions.symbolic-mode` | chmod의 기호 모드 | `linux-permissions.chmod` | 권한을 **누구**(`u` 소유자·`g` 그룹·`o` 그 밖·`a` 모두 — `ugo`와 같다) + **어떻게**(`+` 더하기·`-` 빼기·`=` 그것으로 정하기) + **무엇**(`r`·`w`·`x`)으로 적는다. 명령과 결과를 `report.txt`의 `-rw-r--r--`에서 단계대로 보인다 — `chmod g+w report.txt` → `-rw-rw-r--`, `chmod g=w report.txt` → `-rw--w-r--`(그룹의 읽기가 지워진다), `chmod o-r report.txt` → `-rw-r-----`. `+`와 `=`가 무엇이 다른지(4절)와, 수로 주는 모드(`chmod 664`)는 아홉 자리를 한꺼번에 새로 정해 원래 권한에 따라 결과가 달라진다는 것을 견준다. 쉼표로 여럿을 잇는 꼴 하나(`u+x,g-w`). 예에서는 늘 누구를 적는다(누구를 빼면 다른 규칙이 끼어든다는 것은 쓰지 않는다 — guide.md 표) |
| 19 | `linux-permissions.chown` | chown 명령 | — | 파일의 소유자와 그룹을 바꾸는 명령. 명령과 결과 — `chown user2 report.txt`(소유자만 `user2`로), `chown user2:dev report.txt`(소유자와 그룹), `chown :ops report.txt`(그룹만 `ops`로), `-R`(디렉터리째). `user:group`의 차례(사용자가 앞)를 짚는다. 누가 바꿀 수 있는지 — 소유자를 바꾸는 것은 root만, 파일의 소유자는 그룹을 자기가 속한 그룹으로 바꿀 수 있다(`user1`은 `ops`에 들므로 `chown :ops report.txt`를 할 수 있다 — guide.md 「예시 값」의 소속, 예로 붙인 소속이라고 밝힌다). 그룹만 바꾸는 명령 `chgrp`를 한 줄로. `chmod`와 무엇이 다른지(4절 — 권한을 바꾸느냐, 주인을 바꾸느냐). 「자격시험은」 줄은 step 7 결과대로 |

### 2. 문항 — `n131`~`n132`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n131` | `symbolic-mode` | 4지선다 「상황 적용」 — `plan.txt`의 권한이 `-rw-r-----`일 때, 그룹의 사용자도 내용을 고칠 수 있게 하되 다른 권한은 그대로 두려면 → `chmod g+w plan.txt`. 오답은 흔히 헷갈리는 기호 — `chmod g=w plan.txt`(그룹의 읽기가 지워진다), `chmod a+w plan.txt`(그 밖에도 쓰기가 생긴다), `chmod u+w plan.txt`(소유자는 이미 쓸 수 있고 그룹은 그대로). **같은 결과를 내는 다른 명령(`chmod 660 plan.txt`)을 오답에 넣지 마라** — 보기 넷을 하나씩 실행한 결과를 손으로 따져 정답이 하나인지 본다. 정답 위치는 균형대로. 해설은 보기마다 뒤 권한 문자열을 보인다 |
| `n132` | `chown` | 4지선다 「개념 비교」 — `plan.txt`의 소유자를 `user3`으로, 그룹을 `ops`로 한 번에 바꾸는 명령 → `chown user3:ops plan.txt`. 오답은 헷갈리는 꼴 — `chown ops:user3 plan.txt`(차례를 바꿈), `chmod user3:ops plan.txt`(권한을 바꾸는 명령), `chgrp user3:ops plan.txt`(그룹만 바꾸는 명령). 해설은 누가 이 명령을 실행할 수 있는지(소유자를 바꾸므로 root)도 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 `chmod 666`·`a+w`·`ugo+w`·`go=w` 묶음, `a-w`·`u-w`·`g+rw`·`a-r` 묶음, `chmod`·`chown`·`useradd`·`chage` 묶음, `chown`·`pwd`·`ls`·`rm` 묶음을 쓰지 않는다).
이 step의 두 문항은 4지선다이므로 예/아니요 균형은 그대로이고, 정답 위치의 균형을 지킨다.

### 3. 도식 — `src/data/network/visuals/linux-permissions.json`에 더한다

#### 3-1. `linux-permissions.symbolic-mode` — `SymbolicModeDiagram`, JSON 키 `symbolic-mode`

- 물음형 제목 예: `g+w와 g=w는 무엇이 다를까?`
- 그릴 것: guide.md 「전과 후를 보이는 그림」. 앞 노드 `-rw-r--r--`(늘 선명), 시나리오마다 다른 명령 노드와 뒤 노드 — `chmod g+w report.txt` → `-rw-rw-r--`, `chmod g=w report.txt` → `-rw--w-r--`, `chmod o-r report.txt` → `-rw-r-----`. 세 쌍은 서로 다른 id·자리다. 권한 문자열을 덩어리로 끊어 그리면(`-` | `rw-` | `r--` | `r--`) 바뀐 덩어리를 곁말로 짚기 쉽다 — 280 폭에 맞춰 정한다.
- 시나리오:

  | id | label | 선명한 것 | 경로·곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `plus` | `g+w` | 앞 노드·`g+w` 명령·그 뒤 노드 | 앞 → 명령 → 뒤. `+`는 쓰기만 더하고 그룹의 읽기는 그대로 둔다 |
  | `equals` | `g=w` | 앞 노드·`g=w` 명령·그 뒤 노드 | 곁말 「그룹의 읽기가 지워짐」. `=`는 그룹의 권한을 쓰기 하나로 새로 정한다 |
  | `minus` | `o-r` | 앞 노드·`o-r` 명령·그 뒤 노드 | `-`는 그 밖의 읽기만 뺀다 |

- 요점 테스트: 시나리오마다 뒤 노드 라벨이 앞 노드 라벨에 그 명령의 규칙(`+` 더하기, `-` 빼기, `=` 그 부류를 새로 정하기)을 적용한 결과와 같다 — 테스트가 문자열을 계산해 확인한다. `plus`와 `equals`의 뒤 노드 라벨이 서로 다르다.

#### 3-2. `linux-permissions.chown` — `ChownChangeDiagram`, JSON 키 `chown-change`

- 물음형 제목 예: `누가 파일의 주인을 바꿀 수 있을까?`
- 그릴 것: 앞 노드 「`report.txt` — 소유자 `user1` · 그룹 `dev`」(라벨이 길면 소유자 노드와 그룹 노드 둘로), 실행하는 사람 노드 `root`·`user1`, 시나리오마다 다른 명령 노드와 뒤 노드. 거부는 색이 아니라 곁말 「거부」와 사라지는 경로로(guide.md 「색」).
- 시나리오:

  | id | label | 선명한 것 | 경로·곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `root-owner` | root가 소유자 바꾸기 | `root`·`chown user2:dev report.txt`·뒤 노드(소유자 `user2` · 그룹 `dev`) | `root` → 명령 → 뒤. 소유자를 바꾸는 것은 root가 한다 |
  | `owner-denied` | 소유자가 넘기려 하면 | `user1`·`chown user2 report.txt` | `user1` → 명령, 뒤로 가는 경로 없음, 곁말 「거부」. 파일의 소유자라도 소유자를 남에게 넘길 수 없다 |
  | `owner-group` | 소유자가 그룹 바꾸기 | `user1`·`chown :ops report.txt`·뒤 노드(소유자 `user1` · 그룹 `ops`) | `user1` → 명령 → 뒤. 소유자는 그룹을 자기가 속한 그룹(`ops`)으로 바꿀 수 있다 |

- 요점 테스트: `owner-denied`에서 명령 노드에서 나가는 경로가 보이지 않고 보이는 곁말에 「거부」가 있다. `root-owner`의 뒤 노드에서 소유자가 `user2`, `owner-group`의 뒤 노드에서 소유자가 그대로 `user1`이고 그룹만 `ops`다.
  step 7 결과가 「소유자는 자기 그룹으로 바꿀 수 있다」를 확인하지 못했으면 `owner-group`을 빼고 summary에 적는다.

위 도식 설계는 출발점이다. 본문(step 7 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 132개, 마지막 id는 `n132`다. `linux-permissions`의 개념은 8개, 문항은 9개(n124~n132)다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. **주제를 마무리하며 통독한다** — `linux-permissions`의 개념 8개를 처음부터 끝까지 처음 배우는 사람의 눈으로 읽고, 풀이 없이 처음 나오는 낱말과, 같은 낱말을 두 번 푼 곳을 세어 summary에 적는다(고치지 않는다 — 이 step의 개념이 아니면).
   기출 16문항이 묻는 사실(guide.md 표의 「다룰 것」)이 모두 본문에 있는지 하나씩 대조해 표로 적는다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」의 질문으로 다시 읽는다. 본문의 기호 모드 결과 셋과 n131의 보기 넷을 손으로 다시 계산한다.
4. `phases/75-network-linux-basics/index.json`의 step 11을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」과 위 2의 통독 결과.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **누구를 뺀 기호 모드(`chmod +x`)와 umask, `X`·`s`·`t` 같은 다른 기호를 쓰지 마라.** 이유: 기출이 묻지 않고, 쓰면 umask까지 풀어야 한다.
- **사용자 계정이나 그룹을 만드는 명령(`useradd`·`groupadd`)을 쓰지 마라.** 이유: `linux-accounts`(phase 76)의 범위다.
- **앞 step의 개념·문항·도식을 고치지 마라.** 이유: 통독에서 찾은 것은 summary에 적고, 사용자가 판단한다.
