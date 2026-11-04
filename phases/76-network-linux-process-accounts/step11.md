# Step 11: shadow-useradd

## 배경

phase 76은 네트워크 과목의 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획·결정·공통 규칙은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
**이 step은 주제 `linux-accounts`의 개념 둘(18 /etc/shadow 파일, 19 useradd 명령)의 글·문항·도식을 함께 만든다.** 18은 `user-account`에 딸린 개념이고, 19는 머리 개념이다.

기출은 새 사용자를 등록하면서 정한 그룹을 기본 그룹으로 넣는 명령의 꼴(`useradd -g 그룹 이름`)을 묻는다. `/etc/shadow`는 기출이 따로 묻지 않지만, `/etc/passwd`의 `x`가 가리키는 곳이고 `chage`가 바꾸는 칸이 있는 파일이라 그 바탕으로 쓴다.

## 읽어야 할 파일

- **`phases/76-network-linux-process-accounts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/76-network-linux-process-accounts/index.json`의 step 9~10 `summary`(특히 step 9의 c·d와 `/etc/shadow` 예 줄의 날짜 칸 값)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 76 step 9)」 항목의 shadow(5)·useradd(8)·passwd(1)·group(5)), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-accounts` 주제(앞 step이 쓴 개념 — **이미 푼 낱말은 다시 풀지 않는다**)와 `linux-filesystem.etc-directory`(`/etc/shadow`를 관리자만 읽는다고 쓴 곳 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/visuals/linux-accounts.json`
- 앞 step의 도식(`AccountIdsDiagram`·`PasswdFieldsDiagram`)과 그 테스트, phase 75의 `ChownChangeDiagram`(바뀌기 전·뒤), `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-accounts` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 18 | `linux-accounts.etc-shadow` | /etc/shadow 파일 | `user-account` | 암호화된 암호와 암호의 유효 기간 정보를 계정마다 한 줄에 둔 파일이다. `/etc/passwd`의 `x`가 가리키는 곳이라는 것을 되짚는다. 칸 아홉을 예 한 줄(`user4`의 줄 — 암호화된 암호는 줄여 보이고 줄였다고 밝힌다, 날짜 칸은 step 9 summary가 정한 값)로 차례대로 읽어 보인다. 칸의 차례를 목록 개념으로 쓸지 문단으로 쓸지는 읽기 쉬운 쪽으로. **날짜 칸은 1970년 1월 1일부터 센 날 수**라는 것과 예의 수가 어느 날인지(step 9의 계산을 단계대로 — 근거가 있을 때만). 기간 칸들(최소·최대·경고·비활성)이 무엇을 정하는지 한 줄씩 — 이 칸들을 바꾸는 명령 `chage`는 이름과 한 줄(옵션은 다른 개념이 쓴다). 일반 사용자는 이 파일을 읽을 수 없다는 것과 그래서 암호를 `/etc/passwd`가 아니라 여기 둔다는 것(step 9 결과대로). 암호 칸이 `!`·`*`로 시작할 때의 뜻은 step 9 결과대로 한 줄 |
| 19 | `linux-accounts.useradd` | useradd 명령 | — | 새 계정을 만드는 명령이다 — `/etc/passwd`·`/etc/shadow`(와 `/etc/group`)에 그 계정의 줄을 더한다. 명령 꼴 `useradd [옵션] 사용자이름`에서 **사용자 이름이 맨 뒤**라는 것. 옵션(`-m`·`-d`·`-s`·`-g`·`-G`·`-u`)을 하나씩 — 목록 개념으로 쓸지 문단으로 쓸지는 읽기 쉬운 쪽으로(목록이면 guide.md 「글」의 항목 이름 규칙 (2)). **`-g`와 `-G`가 무엇이 다른지**(4절 — `-g`는 기본 그룹 하나, 이미 있는 그룹이어야 한다 / `-G`는 보조 그룹, 쉼표로 여럿). 예 `useradd -m -g dev -G ops -s /bin/bash user4`(guide.md 「예시 값」)를 입력하면 무엇이 생기는지 — `/etc/passwd`에 `etc-passwd` 개념의 예 줄(`user4:x:1004:2001::/home/user4:/bin/bash`)이 생기고 홈 디렉터리 `/home/user4`가 만들어지며 `ops` 그룹에 `user4`가 더해진다(UID `1004`는 명령이 고른 번호라는 것 — step 9 결과대로). 만든 뒤 `passwd user4`로 암호를 정해야 그 암호로 로그인할 수 있다는 것은 step 9 결과대로. 계정을 고치는 `usermod`, 지우는 `userdel`은 이름과 한 줄씩. `adduser`는 step 9가 허용한 출처에서 찾지 못했으면 쓰지 않는다 |

### 2. 문항 — `src/data/network/questions.json`에 `n166`~`n167`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n166` | `etc-shadow` | 예/아니요 「원리 이해」 — 날짜 칸이나 기간 칸의 뜻에 관한 주장. step 10이 끝난 뒤의 균형(계획대로면 예 30·아니요 30)에서 **예** 쪽으로 세운다(예: `/etc/shadow`의 「마지막으로 바꾼 날」 칸에 적힌 수는 1970년 1월 1일부터 센 날 수인가 — 예). 문항의 수는 본문 예와 다르게 둔다. 문제문이 답의 이유를 알려 주지 않게 한다. 해설은 그 칸의 뜻과, 다른 날짜 칸도 같은 방식으로 적는다는 것(step 9 결과대로)을 가르친다 |
| `n167` | `useradd` | 4지선다 「상황 적용」 — 본문과 다른 상황(예: 새 계정 `user5`를 만들며 기본 그룹은 `dev`, 보조 그룹으로 `ops`에도 넣으려 한다)에서 무엇을 입력하나 → `useradd -g dev -G ops user5`. 오답은 흔한 실수에서 — `-g`와 `-G`를 바꾼 명령, 고치는 명령 `usermod`로 쓴 것(계정이 아직 없다 — step 9 결과대로), `-g`에 그룹 둘을 쉼표로 준 것(`-g`는 그룹 하나 — step 9 결과대로). **사용자 이름을 옵션 앞에 둔 보기는 넣지 마라** — 옵션 해석 방식에 따라 실제로 될 수 있어 정답이 둘이 될 수 있다. 보기마다 그 명령을 실행했을 때의 결과를 따져 정답이 하나뿐인지 본다. **정답 위치 2** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 계정 이름 `network`·그룹 `icqa`와 그 보기 넷(`useradd`·`adduser`를 섞은 넷)을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `linux-accounts.etc-shadow` — `ShadowFieldsDiagram`, JSON 키 `shadow-fields`

- 물음형 제목 예: `/etc/shadow의 한 줄에는 무엇이 들어 있을까?`
- 그릴 것: 본문 예 줄의 칸 아홉 — 「칸 이름 | 값」 짝(세로형은 위에서 아래로 쌓는다 — guide.md 「글자열 칸」). 암호화된 암호 칸의 값은 본문처럼 줄여 보인다. 날짜 칸의 곁말에 그 날짜(본문이 계산한 것)를 둘지는 폭에 맞춰 정한다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `password` | 암호 | 이름·암호화된 암호 칸 | 암호는 알아볼 수 없게 바꿔 이 파일에만 둔다 |
  | `aging` | 기간 | 마지막 바꾼 날·최소·최대·경고 칸 | 날짜는 1970년 1월 1일부터 센 날 수, 기간은 날 수로 적는다 |
  | `expire` | 만료 | 비활성·계정 만료일 칸 | 만료 뒤에 무엇이 일어나는지(본문대로) |

- 요점 테스트: `aging`의 선명한 칸은 정확히 네 개이고, 마지막 바꾼 날 칸의 값이 본문 예의 수와 같다. 칸 노드 아홉의 값을 차례대로 `:`로 이으면 본문 예의 줄(줄여 보인 암호 그대로)과 같다. 세 시나리오의 선명한 칸이 겹치지 않는다(이름 칸은 `password`에만).

#### 3-2. `linux-accounts.useradd` — `UseraddOptionsDiagram`, JSON 키 `useradd-options`

- 물음형 제목 예: `useradd의 옵션은 어디에 무엇을 남길까?`
- 그릴 것: 명령 노드를 옵션 덩어리로 나눈 줄(`-m`·`-g dev`·`-G ops`·`-s /bin/bash`·`user4` — 280 폭에 맞춰 두 줄로 나눠도 된다), 결과 노드 — `/etc/passwd`의 줄(또는 그 GID·셸 칸), 홈 디렉터리 `/home/user4`, `/etc/group`의 `ops`. 옵션에서 결과로 경로를 잇는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `name` | 이름 | `user4`·`/etc/passwd`의 줄 | 맨 뒤의 이름으로 계정 줄이 생긴다 |
  | `primary` | `-g` | `-g dev`·GID 칸(`2001`) | 기본 그룹 — `/etc/passwd`의 GID 칸에 적힌다 |
  | `supplementary` | `-G` | `-G ops`·`/etc/group`의 `ops` | 보조 그룹 — 그 그룹의 구성원으로 더해진다 |
  | `home-shell` | `-m`·`-s` | `-m`·`-s /bin/bash`·`/home/user4`·셸 칸 | 홈 디렉터리를 만들고 로그인 셸을 정한다 |

- 요점 테스트: `primary`에서 보이는 경로는 `-g dev`에서 GID 값 노드로 가고 그 값이 `account-ids`·`etc-passwd` 본문의 `dev` GID와 같다. `supplementary`에서 보이는 경로는 `/etc/group` 노드에 닿고 GID 칸 노드에는 닿지 않는다. 명령 덩어리 노드를 차례대로 이으면 본문 예의 명령과 같다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 167개, 마지막 id는 `n167`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 칸 아홉의 이름과 뜻이 shadow(5)와, 옵션의 뜻이 useradd(8)과 같은가(공식 문서 문장을 옮기지 않고).
3. 날짜 칸의 날 수 계산을 손으로 다시 한다(step 9 summary의 값과 같은지). n167의 보기 넷을 하나씩 실행했다고 치고 결과를 따져 정답이 하나뿐인지 본다.
4. `phases/76-network-linux-process-accounts/index.json`의 step 11을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 16·17과 20·21을 만들거나 고치지 마라.** 이유: 다른 step의 범위다. `chage`의 옵션은 step 12가 쓴다 — 이 step은 이름과 한 줄까지만.
- **실제 암호의 해시 값이나 해시 방식의 이름을 지어 보이지 마라.** 이유: 출처에 없는 값이다. 암호화된 암호는 줄여 보이고, 해시 방식은 step 9가 근거를 찾았을 때만 쓴다.
- **`linux-filesystem.etc-directory`를 고치지 마라.** 이유: 앞 phase의 주제다. 뜻을 맞추기만 한다.
