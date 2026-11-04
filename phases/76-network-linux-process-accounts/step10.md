# Step 10: account-passwd

## 배경

phase 76은 네트워크 과목의 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획·결정·공통 규칙은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
**이 step은 주제 `linux-accounts`를 만들고 그 첫 개념 둘(16 사용자 계정과 UID, 17 /etc/passwd 파일)의 글·문항·도식을 함께 만든다.** 17은 16에 딸린 개념이다.

기출은 `/etc/passwd`의 한 줄을 주고 설명 가운데 틀린 것(「패스워드는 `x`이다」)을 고르게 한다(3회). 맞는 말로 두는 것은 계정 이름, UID·GID, 기본 셸을 그 줄에서 읽은 것이다.

## 읽어야 할 파일

- **`phases/76-network-linux-process-accounts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/76-network-linux-process-accounts/index.json`의 step 9 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 step 0~8 `summary`의 형식
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 76 step 9)」 항목과 passwd(5)), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `linux-permissions.owner-group-others`·`linux-filesystem.etc-directory` — 사용자·그룹·root·`/etc/passwd`를 어떻게 풀었는지, 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- `linux-process-boot`의 도식(step 1~8이 만든 것)과 그 테스트, phase 75의 `FstabFieldsDiagram`·`PermissionClassesDiagram`, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`linux-process-boot` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "linux-accounts", "title": "Linux 사용자 계정", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 16·17이다. `importance`가 2(★★☆, 출제 6/11회)인지 `data.test.ts`의 주제 지도 표와 견준다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 16 | `linux-accounts.user-account` | 사용자 계정과 UID | — | 이 주제의 첫 개념이라 **Linux**(운영체제 — 한 줄), **파일**, **관리자 계정 root**(시스템 전체를 관리하는 계정), **셸**(입력한 명령을 실행해 주는 프로그램), **홈 디렉터리**(사용자마다 자기 파일을 두는 디렉터리)를 짧게 푼다(앞 phase의 말과 뜻을 맞춘다). 계정이 무엇인지 — 사람(과 서비스)마다 둔 사용자 이름과 커널이 쓰는 번호 UID. 그룹과 GID, **기본 그룹과 보조 그룹이 무엇이 다른지**(4절 — 계정마다 기본 그룹은 하나, 보조 그룹은 여럿일 수 있다, 기본 그룹이 새 파일에 붙는다는 것은 step 9 결과대로). 예: `user1`(UID `1001`)의 기본 그룹은 `dev`(GID `2001`), 보조 그룹은 `ops`(GID `2002`) — guide.md 「예시 값」, 예로 붙인 번호라고 밝힌다. root의 UID 0. 일반 사용자의 UID를 몇부터 주는지는 배포판 설정(`/etc/login.defs`)이 정한다는 것과 시스템 계정은 step 9 결과대로. 계정 정보가 든 세 파일(`/etc/passwd`·`/etc/shadow`·`/etc/group`)을 한 줄씩. `id` 명령으로 자기 UID·GID와 그룹을 본다 — 입력한 줄과 결과를 함께, 출력 꼴은 step 9가 확인한 대로(확인하지 못했으면 「무엇이 보이는지」만 말로) |
| 17 | `linux-accounts.etc-passwd` | /etc/passwd 파일 | `user-account` | 계정마다 한 줄, 콜론(`:`)으로 나눈 칸 일곱. 예 한 줄 `user4:x:1004:2001::/home/user4:/bin/bash`(guide.md 「예시 값」 — 예로 붙인 계정이라고 밝힌다)를 **칸마다 차례대로 읽어** 보인다 — 이름 `user4`, 암호 칸 `x`, UID `1004`, GID `2001`(기본 그룹 `dev`), 설명 칸(비었음 — 비면 어떻게 되는지는 step 9 결과대로), 홈 디렉터리 `/home/user4`, 로그인 셸 `/bin/bash`. 칸의 차례를 목록 개념으로 쓸지 문단으로 쓸지는 읽기 쉬운 쪽으로 — 목록이면 `- **사용자 이름**(login name)은 …` 꼴. **암호 칸의 `x`는 암호가 `x`라는 뜻이 아니라 암호화된 암호가 `/etc/shadow`에 있다는 표시다** — 왜 암호를 이 파일에 두지 않는지(누구나 읽는 파일이라는 것)는 step 9 결과대로. 암호화(원래 암호를 알아볼 수 없는 글자열로 바꿔 저장하는 것 — 한 줄)를 푼다. 이 파일을 손으로 고치기보다 계정을 다루는 명령(`useradd` 등 — 이름만)을 쓴다는 것은 한 줄 |

### 2. 문항 — `src/data/network/questions.json`에 `n163`~`n165`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n163` | `user-account` | 예/아니요 「오해 바로잡기」 — step 8이 끝난 뒤의 균형(계획대로면 예 29·아니요 29)에서 **예** 쪽으로 세운다. 예: 한 사용자가 기본 그룹 말고 다른 그룹 여럿에 함께 들 수 있는가(예 — 보조 그룹). 또는 step 9가 근거를 찾았으면 「사용자 이름을 바꿔도 UID가 그대로면 그 사용자가 가진 파일의 소유자는 그대로인가」(예 — 커널은 번호로 기억한다). 문제문이 답의 이유를 알려 주지 않게 한다. 해설은 UID·GID와 기본·보조 그룹을 가르친다 |
| `n164` | `etc-passwd` | 4지선다 「출력 읽기」 — 본문과 다른 계정의 `/etc/passwd` 한 줄(예: `guest` 계정 — UID와 GID가 서로 다른 수, 설명 칸에 글자가 있는 줄)을 문제문에 주고 그 줄에서 한 칸을 읽게 한다(예: 이 사용자의 기본 그룹 번호, 또는 로그인하면 실행되는 프로그램). 오답은 같은 줄의 다른 칸 값 — 흔한 실수인 UID와 GID를 바꿔 읽은 값을 꼭 넣는다. 보기 넷이 모두 그 줄에 있는 서로 다른 값이다. **정답 위치 0** |
| `n165` | `etc-passwd` | 예/아니요 「오해 바로잡기」 — 암호 칸의 `x`에 관한 주장(예: 어떤 사용자 줄의 둘째 칸이 `x`이면 그 사용자의 암호는 글자 `x`인가 — 아니요). n163 뒤의 균형(예 30·아니요 29)에서 **아니요** 쪽으로 세운다. n164와 다른 것을 묻는다. 해설은 `x`가 무엇을 가리키는지와 암호가 어디에 어떤 꼴로 있는지를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 「`/etc/passwd`의 내용 설명 가운데 옳지 않은 것」 꼴과 보기 넷, 기출 지문의 줄과 UID·GID `500`을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/network/visuals/linux-accounts.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'linux-accounts': linuxAccountsVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `linux-accounts.user-account` — `AccountIdsDiagram`, JSON 키 `account-ids`

- 물음형 제목 예: `커널은 사용자를 무엇으로 알아볼까?`
- 그릴 것: 사용자 이름 노드(`user1`·`root`)와 그 UID 노드(`1001`·`0`), 그룹 노드(`dev`·`ops`)와 GID 노드(`2001`·`2002`) — 이름과 번호를 짝으로 잇는다. `user1`에서 `dev`로(기본 그룹), `user1`에서 `ops`로(보조 그룹) 경로를 잇고 곁말로 「기본」·「보조」를 단다. 값은 본문의 예시 값만.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `uid` | UID | `user1`·`1001` | 사용자 이름마다 커널이 쓰는 번호 UID가 있다 |
  | `groups` | 그룹 | `user1`·`dev`·`ops`(와 GID) | 기본 그룹은 하나, 보조 그룹은 더 들 수 있다 |
  | `root` | root | `root`·`0` | 관리자 root의 UID는 0이다 |

- 요점 테스트: `root`의 선명한 번호 노드 라벨이 `0`이다. `groups`에서 「기본」 곁말이 달린 경로는 `dev`에 닿고 「보조」 곁말이 달린 경로는 `ops`에 닿는다. `uid`의 선명한 번호 노드 라벨이 본문의 `user1` UID와 같다.

#### 3-2. `linux-accounts.etc-passwd` — `PasswdFieldsDiagram`, JSON 키 `passwd-fields`

- 물음형 제목 예: `/etc/passwd의 한 줄은 무엇을 말할까?`
- 그릴 것: 본문 예 `user4:x:1004:2001::/home/user4:/bin/bash`의 칸 일곱 — 「칸 이름 | 값」 짝(세로형은 위에서 아래로 쌓는다 — guide.md 「글자열 칸」), 그리고 암호 칸에서 이어지는 `/etc/shadow` 노드. 비어 있는 설명 칸은 값 노드를 비우거나 「(비었음)」으로 — 본문이 쓴 말로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `ids` | 번호 | 이름·UID·GID 칸 | 이름, 사용자 번호, 기본 그룹 번호 |
  | `password` | `x` | 암호 칸·`/etc/shadow` | `x`는 암호가 아니라, 암호화된 암호가 `/etc/shadow`에 있다는 표시 |
  | `login` | 로그인 | 홈 디렉터리·셸 칸 | 로그인하면 홈 디렉터리에서 이 셸이 실행된다(본문대로) |

- 요점 테스트: `password`에서 보이는 경로가 암호 칸 노드에서 `/etc/shadow` 노드로 가고, 그 경로는 다른 시나리오에서 보이지 않는다. `ids`의 선명한 값 노드 라벨이 차례대로 `user4`·`1004`·`2001`이다. 칸 노드 일곱의 값을 차례대로 `:`로 이으면 본문 예의 줄과 같다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 165개, 마지막 id는 `n165`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `linux-process-boot` 바로 뒤에 있고, `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 9 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 칸 일곱의 이름과 뜻이 passwd(5)와 같은가(공식 문서 문장을 옮기지 않고).
4. 예 줄과 n164의 줄을 칸 하나씩 손으로 다시 읽어 정답과 오답 셋이 맞는지 따진다.
5. `phases/76-network-linux-process-accounts/index.json`의 step 10을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 18~21을 만들지 마라.** 이유: step 11~12의 범위다. 이 step의 글이 `/etc/shadow`의 칸·`useradd`·`chage`를 쓸 때는 한 줄 풀이로 그친다.
- **`linux-process-boot`의 개념과 도식을 고치지 마라.** 이유: step 1~8의 범위다.
- **step 9가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
