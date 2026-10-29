# Step 10: octal-chmod

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-permissions`의 개념 둘(16 8진수 권한 표기, 17 chmod 명령)의 글·문항·도식을 함께 만든다.** 8진수 권한 표기는 `permission-string`에 딸린 개념이고, chmod 명령은 새 머리 개념이다.

기출에서 이 주제의 가장 큰 몫이다 — 권한 문자열을 수로(`751`), 요구 사항에서 수로(`644`·`774`, 다섯 번), 디렉터리째 바꾸기(`chmod -R 755`, 두 번).

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 7~9 `summary`(특히 step 7의 e·f)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75 step 7)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-permissions` 주제(앞 step이 쓴 개념 — 특히 `permission-string`의 예 `-rw-r--r--`. **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-permissions.json`
- 앞 step의 도식(`PermissionStringDiagram` 등)과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들 — 비트를 더해 보이는 것은 `MaskAndDiagram`), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-permissions` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 16 | `linux-permissions.octal-mode` | 8진수 권한 표기 | `linux-permissions.permission-string` | 권한 아홉 자리를 세 자리 수로 적는 법. 읽기 4, 쓰기 2, 실행 1을 부류마다 더한다 — **단계대로** 보인다: `rwxr-xr-x`(`backup.sh`, guide.md 「예시 값」)를 `rwx`·`r-x`·`r-x`로 끊고, `rwx` = 4 + 2 + 1 = 7, `r-x` = 4 + 0 + 1 = 5, 그래서 `755`. 앞 개념의 `-rw-r--r--`는 `644`. 거꾸로 수에서 문자열로 읽는 예 하나(예 `640` → `rw-r-----` — 자리마다 4·2·1로 나눠 본다). 한 부류의 세 글자가 3비트라 각 자리가 0~7이고 그래서 8진수라 부른다 — 2진수로 `rwx` = `111` = 7, `r-x` = `101` = 5를 보인다(2진수·8진수를 한 줄씩 푼다). 근거는 step 7 결과대로 |
| 17 | `linux-permissions.chmod` | chmod 명령 | — | 파일의 권한을 바꾸는 명령. 명령과 결과를 함께 보인다 — `chmod 640 report.txt` 앞뒤의 권한 문자열(`-rw-r--r--` → `-rw-r-----`). 바꿀 수 있는 사람은 그 파일의 소유자와 root다(step 7 결과의 근거대로) — 그룹에 쓰기 권한이 있어도 그룹의 사용자는 권한을 바꾸지 못한다는 것을 4절대로(쓰기 권한은 내용을 고치는 권한이지 권한을 고치는 권한이 아니다). `-R`은 디렉터리와 그 안의 파일·하위 디렉터리를 모두 바꾼다 — 예 `chmod -R 750 project`(디렉터리 `project`와 그 안의 것, guide.md 「예시 값」). 디렉터리에 실행 권한이 있어야 안으로 들어갈 수 있다는 것을 앞 개념처럼 한 줄로 되짚어 `-R`로 줄 때 무엇을 보는지 이어 쓴다. 기호로 바꾸는 법(`u+x` 같은)은 「기호 모드로도 줄 수 있다」는 한 줄까지 |

### 2. 문항 — `n128`~`n130`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n128` | `octal-mode` | 4지선다 「계산」 — 권한 문자열 `rwxr-----`(본문 예·기출과 다른 값)를 8진수로 → `740`. 오답은 흔한 실수에서 나온 값 — `710`(읽기를 1로 셈), `760`(그룹의 `r`을 6으로 셈), `470`(부류의 차례를 바꿈) 같은 것. 오답마다 어떤 실수인지 해설에 적고, 정답은 단계대로 계산한다. 정답 위치는 균형대로 |
| `n129` | `octal-mode` | 4지선다 「상황 적용」 — 요구 사항에서 수로: 「소유자와 그룹은 읽고 고칠 수 있고, 그 밖의 사용자는 아무것도 못 하게」 → `660`. 오답은 흔한 실수 — `664`(그 밖에 읽기를 남김), `550`(쓰기를 1로 셈), `606`(그룹과 그 밖을 바꿈) 같은 것. n128과 다른 방향(요구 → 수)을 묻는다. 기출의 값(`644`·`774`·`776`·`746`·`766`·`751`·`755`)을 정답으로도 오답으로도 쓰지 않는다 |
| `n130` | `chmod` | 예/아니요 「오해 바로잡기」 — 파일의 그룹에 쓰기 권한이 있으면, 그 그룹의 사용자도 `chmod`로 그 파일의 권한을 바꿀 수 있는가(아니요 — 소유자와 root만). step 9가 끝난 뒤의 균형(계획대로면 예 23·아니요 23)에서 **아니요** 쪽으로 세운다. step 7 결과가 근거를 찾지 못했으면 다른 주장(예: `-R`이 디렉터리 안의 파일까지 바꾸는가 — 예)으로 바꾸고 균형을 다시 맞춘다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 작업지시서 상황과 `chmod -R 755 /var/www/upload` 보기 묶음을 쓰지 않는다). **계산 문항은 정답과 오답 셋을 모두 손으로 다시 계산한다.** 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식 — `src/data/network/visuals/linux-permissions.json`에 더한다

#### 3-1. `linux-permissions.octal-mode` — `OctalModeDiagram`, JSON 키 `octal-mode`

- 물음형 제목 예: `rwxr-xr-x는 왜 755일까?`
- 그릴 것: 세 열(소유자·그룹·그 밖 — 그룹 박스) — 열마다 위에서 아래로 덩어리 노드(`rwx`·`r-x`·`r-x`), 더하기 노드(`4 + 2 + 1`·`4 + 0 + 1`·`4 + 0 + 1`), 자리 수 노드(`7`·`5`·`5`). 열 안에서 위에서 아래로 잇는 경로는 늘 보이는 연결선.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `owner` | 소유자 | 소유자 열의 노드 셋 | `rwx`는 읽기 4, 쓰기 2, 실행 1을 모두 더해 7 |
  | `group` | 그룹 | 그룹 열의 노드 셋 | `r-x`는 쓰기가 없어 4 + 0 + 1 = 5 |
  | `others` | 그 밖 | 그 밖 열의 노드 셋 | 그 밖도 `r-x`라 5 — 셋을 이어 `755` |

- 요점 테스트: 열마다 더하기 노드의 수를 실제로 더한 값이 그 열의 자리 수 노드 라벨과 같다(테스트가 라벨을 읽어 계산한다). 자리 수 노드 셋을 차례로 이으면 `755`다. 시나리오마다 선명한 노드가 한 열의 셋뿐이다.

#### 3-2. `linux-permissions.chmod` — `ChmodChangeDiagram`, JSON 키 `chmod-change`

- 물음형 제목 예: `chmod를 입력하면 무엇이 바뀔까?`
- 그릴 것: guide.md 「전과 후를 보이는 그림」. 시나리오 `numeric` — 앞 노드 `-rw-r--r--`, 명령 노드 `chmod 640 report.txt`, 뒤 노드 `-rw-r-----`. 시나리오 `recursive` — 명령 노드 `chmod -R 750 project`, 그룹 박스 「`project`」 안의 노드(디렉터리 `project` 자신과 그 안의 파일 하나·하위 디렉터리 하나 — 이름은 본문에 먼저 쓴다). 두 시나리오의 노드는 서로 다른 id·자리다.
- 시나리오:

  | id | label | 선명한 것 | 경로·캡션이 말할 것 |
  |---|---|---|---|
  | `numeric` | 수로 바꾸기 | 앞 노드·명령 노드·뒤 노드 | 앞 → 명령 → 뒤. `640`은 그룹에 읽기만 남기고 그 밖의 권한을 모두 지운다 |
  | `recursive` | `-R` | 명령 노드·`project` 그룹 안 노드 전부 | 명령 → 그룹 안 노드. `-R`은 디렉터리 안의 파일과 하위 디렉터리까지 모두 바꾼다 |

- 요점 테스트: `numeric`의 뒤 노드 라벨이 `640`을 문자열로 바꾼 `-rw-r-----`와 같다(테스트가 8진수 자리를 4·2·1로 풀어 확인한다). `recursive`에서 `project` 그룹 안 노드가 하나도 흐리지 않고, `numeric`의 노드는 모두 흐리다.

위 도식 설계는 출발점이다. 본문(step 7 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 130개, 마지막 id는 `n130`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `octal-mode`가 `file-type-char` 바로 뒤에 있고 `parentId`가 `linux-permissions.permission-string`인지, `chmod`는 `parentId`가 없는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. **본문의 `755`·`644`·`640`·`750`과 문항의 수를 모두 손으로 다시 계산한다.** 문자열과 수가 본문·문항·도식에서 서로 맞는가.
4. `phases/75-network-linux-basics/index.json`의 step 10을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **네 자리 모드(`4755` 같은 특수 비트)와 umask를 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **기호 모드(`u+x`·`go=w`)를 자세히 쓰지 마라.** 이유: step 11의 `symbolic-mode`가 쓴다. 이 step에서는 「기호로도 줄 수 있다」는 한 줄까지.
- **`chown`을 쓰지 마라.** 이유: step 11의 범위다.
