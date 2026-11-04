# Step 12: chage-login-records

## 배경

phase 76은 네트워크 과목의 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획·결정·공통 규칙은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
**이 step은 주제 `linux-accounts`의 마지막 개념 둘(20 chage 명령, 21 로그인 기록)의 글·문항·도식을 함께 만들고, 이 주제와 phase의 개념 작업을 마무리한다.**

기출은 계정의 암호 정책을 바꾸며 만료 며칠 전에 경고하게 하는 옵션(`chage -W`)을 두 번, 비인가자의 로그인 시도 이력을 보는 명령(`lastb`)을 두 번 묻는다.

## 읽어야 할 파일

- **`phases/76-network-linux-process-accounts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/76-network-linux-process-accounts/index.json`의 step 9~11 `summary`(특히 step 9의 e·f)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」)
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 76 step 9)」 항목의 chage(1)·shadow(5)·last(1)·utmp(5)), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-accounts` 주제(앞 step이 쓴 개념 넷 — **이미 푼 낱말은 다시 풀지 않는다**. 특히 `etc-shadow`의 기간 칸), `src/data/network/questions.json`, `src/data/network/visuals/linux-accounts.json`
- 앞 step의 도식과 그 테스트(특히 `ShadowFieldsDiagram`), `linux-process-boot`의 `BootSequenceDiagram`(차례 그림), `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-accounts` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 20 | `linux-accounts.chage` | chage 명령 | — | 암호의 유효 기간 정보(`etc-shadow` 개념의 기간 칸)를 바꾸거나 보는 명령이다. 옵션 여섯(`-m`·`-M`·`-W`·`-I`·`-E`·`-l`)을 하나씩, **각 옵션이 `/etc/shadow`의 어느 칸을 바꾸는지 짝지어** — 목록 개념으로 쓸지 문단으로 쓸지는 읽기 쉬운 쪽으로(목록이면 guide.md 「글」의 항목 이름 규칙 (2), 예 `- **경고 기간**(`-W`)은 …`). **`-m`·`-M`·`-W`·`-I`가 무엇이 다른지**(4절 — 모두 「날 수」라 헷갈리지만, 기준이 되는 날과 그 뒤에 일어나는 일이 다르다). 예 `chage -M 90 -W 7 user4`(guide.md 「예시 값」)를 날짜 축에서 단계대로 — 마지막으로 바꾼 날을 0일째로 두면 90일째에 만료되고, 그 7일 전인 83일째부터 로그인할 때 경고한다(날을 세는 기준은 step 9 결과대로 — 손으로 두 번 센다). 그다음 `chage -l user4`로 바뀐 설정을 보는 것(출력 꼴은 step 9가 확인한 만큼 — 확인하지 못했으면 「무엇이 보이는지」만 말로). 비활성 기간이 지나면 계정이 어떻게 되는지는 step 9 결과대로 |
| 21 | `linux-accounts.login-records` | 로그인 기록 | — | **목록 개념**. 소개 문단: 누가 언제 로그인했는지(또는 하려 했는지) 기록이 파일로 남고, 그것을 보는 명령이 따로 있다. 항목 둘 — `- **로그인 기록 보기**(`last`)는 …`, `- **실패한 로그인 기록 보기**(`lastb`)는 …`(guide.md 「글」의 항목 이름 규칙 (2) — 이름은 바꿔도 된다). 항목마다 어느 기록 파일을 읽는지(`/var/log/wtmp`·`/var/log/btmp`)와 무엇이 보이는지 — step 9 결과대로. `lastb`는 틀린 암호 같은 실패한 로그인 시도가 남은 기록이라, 허락받지 않은 사람이 로그인하려 했는지 확인할 때 쓴다. 항목 뒤 문단: `last`와 `lastb`가 무엇이 다른지(4절), `btmp`를 누가 읽을 수 있는지와 `lastlog`(사용자마다 마지막 로그인)는 step 9 결과대로 한 줄씩, 셸의 명령 기록(`history` — 그 사용자가 입력한 명령의 목록, 로그인 기록이 아니다)과 다르다는 것은 한 줄. 출력 꼴은 step 9가 확인한 만큼만 — 지어서 보이지 않는다 |

### 2. 문항 — `src/data/network/questions.json`에 `n168`~`n170`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n168` | `chage` | 4지선다 「결과 묻기」 — 본문과 다른 값의 명령(예: `chage -W 14 user5`)을 입력하면 무엇이 달라지나 → 암호가 만료되기 14일 전부터 경고한다. 오답은 옵션을 바꿔 읽은 뜻 — `-M`(14일마다 바꿔야 한다), `-m`(바꾼 뒤 14일 동안 다시 바꿀 수 없다), `-I`(만료 뒤 14일이 지나면 계정을 쓸 수 없다 — step 9 결과대로). 보기는 모두 결과를 말로 적은 것이다(기출처럼 옵션 넷을 보기로 두지 않는다 — guide.md 「문항」 11항). **정답 위치 1** |
| `n169` | `chage` | 예/아니요 「오해 바로잡기」 — `-l`에 관한 주장(예: `chage -l user5`를 입력하면 `user5`의 암호 기간 설정이 바뀌는가 — 아니요, 보여 주기만 한다). step 11이 끝난 뒤의 균형(계획대로면 예 31·아니요 30)에서 **아니요** 쪽으로 세운다. n168과 다른 것을 묻는다. 해설은 `-l`이 보여 주는 것과, 설정을 바꾸는 옵션이 무엇인지를 가르친다 |
| `n170` | `login-records` | 4지선다 「상황 적용」 — 본문과 다른 상황(예: 밤사이 누군가 틀린 암호로 여러 번 로그인하려 했는지 확인하려 한다)에서 무엇을 입력하나 → `lastb`. 오답은 같은 범주(기록을 보이는 명령)에서 헷갈릴 만한 것 — 성공한 로그인을 보이는 `last`, 커널 메시지를 보이는 `dmesg`, 셸의 명령 기록 `history` 같은. 기출의 보기 넷(`lastb`·`xferlog`·`history`·`pkill`)과 둘 이상 다르게 고른다. 오답 명령이 이 주제 밖이면 해설에서 한 줄로 푼다. **정답 위치 3** |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다. 계획대로면 이 step이 끝날 때 문항 170개, 예 31·아니요 31, 정답 위치 27/27/27/27이다.

### 3. 도식

#### 3-1. `linux-accounts.chage` — `PasswordAgingDiagram`, JSON 키 `password-aging`

- 물음형 제목 예: `암호는 언제 만료되고 언제부터 경고할까?`
- 그릴 것: 날짜 축(guide.md 「나무와 차례」 — 세로형은 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로) — 「마지막으로 바꾼 날(0일째)」, 「경고 시작(83일째)」, 「만료(90일째)」 노드(본문 예의 값만 — 본문이 `-m`·`-I`의 예 값을 쓰지 않았으면 그 노드를 두지 않는다). 각 노드에 그 날을 정하는 옵션을 곁말로(`-M 90`·`-W 7`). 노드 사이는 늘 보이는 화살표.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `max` | `-M` | 마지막으로 바꾼 날·만료 | 바꾼 날부터 90일이 지나면 만료된다 |
  | `warn` | `-W` | 경고 시작·만료 | 만료 7일 전부터 경고한다 — 90 − 7 = 83일째 |
  | `list` | `-l` | 노드 전체(와 곁말) | 설정을 보여 줄 뿐 바꾸지 않는다(본문대로) |

  본문이 `-m`·`-I`의 예를 들었으면 그 시나리오를 더한다.
- 요점 테스트: `warn`의 경고 시작 노드에 적힌 날이 만료 노드의 날에서 `-W` 값을 뺀 값과 같다(라벨의 수로 계산한다). 축의 노드를 차례대로 읽으면 날 수가 커진다.

#### 3-2. `linux-accounts.login-records` — `LoginRecordsDiagram`, JSON 키 `login-records`

- 물음형 제목 예: `실패한 로그인 시도는 어디에 남을까?`
- 그릴 것: 로그인 시도 노드에서 두 갈래 — 「성공」 → `/var/log/wtmp` → `last`, 「실패」 → `/var/log/btmp` → `lastb`. 두 갈래가 교차하지 않게 나란히 둔다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `success` | `last` | 성공·`/var/log/wtmp`·`last` | 로그인·로그아웃 기록은 `last`로 본다 |
  | `failure` | `lastb` | 실패·`/var/log/btmp`·`lastb` | 실패한 로그인 시도는 `lastb`로 본다 — 허락받지 않은 사람의 시도를 확인할 때 |

- 요점 테스트: `failure`에서 보이는 경로가 `/var/log/btmp`를 지나 `lastb`에 닿고 `/var/log/wtmp`에는 닿지 않는다. `success`는 그 반대다. 두 시나리오의 선명한 노드가 로그인 시도 노드 말고는 겹치지 않는다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 170개, 마지막 id는 `n170`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 옵션의 뜻과 칸의 짝이 chage(1)·shadow(5)와, 기록 파일이 last(1)·utmp(5)와 같은가(공식 문서 문장을 옮기지 않고).
3. 본문 예와 n168의 날 수를 손으로 다시 센다. n168·n170의 오답이 정말 틀렸는지 따진다.
4. **주제와 phase의 개념 작업을 마무리하는 step이다** — `linux-accounts`의 개념 6개를 처음부터 끝까지 통독해, 풀이 없이 처음 나오는 낱말, 같은 말의 되풀이, 진행 안내 문장이 없는지 본다(도식 문구 포함).
   문항 8개(n163~n170)와 phase 전체 26개(n145~n170)의 균형을 확인한다. 앞 개념에 고칠 것을 찾으면 고치지 말고 summary에 적는다.
5. `phases/76-network-linux-process-accounts/index.json`의 step 12를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」과, 주제 통독 결과.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 16~19와 `linux-process-boot`의 개념을 고치지 마라.** 이유: 앞 step의 범위다. 통독에서 찾은 것은 summary에 적는다.
- **`last`·`lastb`·`chage -l`의 출력 꼴을 지어 보이지 마라.** 이유: 출력 꼴도 사실이다. step 9가 확인한 만큼만 쓴다.
- **로그 파일을 지우거나 비우는 법, `faillock`·`pam` 같은 것을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
