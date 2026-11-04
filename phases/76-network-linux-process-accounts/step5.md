# Step 5: crontab

## 배경

phase 76은 네트워크 과목의 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획·결정·공통 규칙은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
**이 step은 주제 `linux-process-boot`의 개념 둘(9 crontab의 시간 칸, 10 crontab 명령)의 글·문항·도식을 함께 만든다.** 둘 다 `cron`에 딸린 개념이다.

기출은 정한 요일·시각에 스크립트를 실행하는 crontab 줄을 고르게 하고(2회), 설정된 crontab을 지우는 명령(`crontab -r`)을 묻는다(3회).

## 읽어야 할 파일

- **`phases/76-network-linux-process-accounts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/76-network-linux-process-accounts/index.json`의 step 0~4 `summary`(특히 step 0의 i·j — cronie와 POSIX가 다르게 말하는 곳을 어떻게 하기로 했는지)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 76)」 항목의 crontab(5)·crontab(1)·POSIX `crontab`), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-process-boot` 주제(앞 step이 쓴 개념 — **이미 푼 낱말은 다시 풀지 않는다**. 특히 `cron`이 crontab과 예 줄을 어떻게 썼는지), `src/data/network/questions.json`, `src/data/network/visuals/linux-process-boot.json`
- 앞 step의 도식과 그 테스트(특히 `CronScheduleDiagram`), phase 75의 `FstabFieldsDiagram`(한 줄의 칸)·`ChmodChangeDiagram`(바뀌기 전·뒤), `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-process-boot` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `linux-process-boot.crontab-fields` | crontab의 시간 칸 | `cron` | crontab의 한 줄은 공백으로 나눈 시간 칸 다섯과 그 뒤의 명령이다. 칸의 차례와 값 범위(분 0~59, 시 0~23, 일 1~31, 월 1~12, 요일 — 0과 7이 일요일, step 0 결과대로), `*`(그 칸의 모든 값)를 쓴다. 칸의 차례를 목록 개념으로 쓸지 문단으로 쓸지는 읽기 쉬운 쪽으로 — 목록이면 `- **분**(minute)은 …` 꼴(guide.md 「글」의 항목 이름 규칙 (1)). **본문 예 `30 2 * * 6 /home/user1/backup.sh`를 칸 하나씩 읽어** 「분 30, 시 2 → 02:30」, 「일·월 `*` → 날짜와 달을 가리지 않는다」, 「요일 6 → 토요일」, 「그래서 매주 토요일 02:30에 `backup.sh`를 실행한다」에 이르는 차례를 단계대로 보인다. **분이 시보다 앞**이라 둘을 바꿔 적으면 다른 시각이 된다는 것을 같은 예로(`2 30 * * 6`은 분 2·시 30 — 시 칸에 30은 들어갈 수 없다는 것까지, 또는 다른 값으로 바꿔 보이는 예). 쉼표(`1,15`)와 하이픈(`1-5`)은 step 0 결과대로 한 줄. cronie와 POSIX가 다르게 말하는 곳은 step 0이 정한 대로 |
| 10 | `linux-process-boot.crontab-command` | crontab 명령 | `cron` | **목록 개념**. 소개 문단: 사용자는 자기 crontab을 이 명령으로 고치고 보고 지운다(파일을 직접 고치지 않는다는 것은 step 0 결과대로). 항목 넷 — `- **편집**(`-e`)은 …`, `- **보기**(`-l`)는 …`, `- **지우기**(`-r`)는 …`, `- **다른 사용자 지정**(`-u`)은 …`(guide.md 「글」의 항목 이름 규칙 (2) — 이름은 바꿔도 된다). `-r`은 **그 사용자의 crontab 전체를 지운다 — 줄 하나가 아니다**. 줄 하나만 없애려면 `-e`로 열어 그 줄을 지운다는 것을 항목 뒤 문단에서 견준다(4절). `-u`는 누가 쓸 수 있는지(관리자 — step 0 결과대로)와 함께. `-r` 앞에 묻게 하는 `-i`는 step 0 결과대로 한 줄. 예: `user1`의 crontab에 줄 둘이 있다고 두고(본문 예 `30 2 * * 6 /home/user1/backup.sh`와, 이 개념에서 더하는 예 `0 3 1 * * /home/user1/report.sh` — 매달 1일 03:00, 예로 붙인 이름이라고 밝힌다) `crontab -l`의 결과(두 줄이 그대로 보인다)와 `crontab -r` 뒤의 결과(목록이 없다 — 「없다」를 어떻게 알리는지는 step 0 결과대로, 확인하지 못했으면 「다시 `-l`로 보면 줄이 하나도 없다」로만)를 보인다 |

### 2. 문항 — `src/data/network/questions.json`에 `n154`~`n156`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n154` | `crontab-fields` | 4지선다 「계산(칸 읽기)」 — 본문과 다른 crontab 줄(예: `0 22 15 * * /home/user5/clean.sh`)을 문제문에 주고 「이 작업은 언제 실행되나」를 묻는다 → 매달 15일 22:00. 보기는 실행되는 때를 말로 적은 넷이고, 오답은 흔한 실수에서 — 분과 시를 바꿔 읽은 때(매달 15일 00:22), 일 칸을 요일로 읽은 때, 다섯 칸의 차례를 밀려 읽은 때. 오답이 실제로 그 실수에서 나오는지 칸 하나씩 따진다. 기출처럼 「때를 주고 줄을 고르게」 하지 않는다(guide.md 「문항」 11항 — 보기의 범주를 바꾼다). **정답 위치 1** |
| `n155` | `crontab-fields` | 예/아니요 「오해 바로잡기」 — 요일 칸의 번호에 관한 주장(예: 요일 칸에 `0`을 적으면 일요일을 뜻하는가 — 예). step 4가 끝난 뒤의 균형(계획대로면 예 27·아니요 28)에서 **예** 쪽으로 세운다. n154와 다른 것을 묻는다. 해설은 요일 번호(0·7이 일요일, 1이 월요일 …, step 0이 정한 대로)와 그래서 「월요일」이 1이라는 것까지 가르친다 |
| `n156` | `crontab-command` | 4지선다 「결과 묻기」 — 본문과 다른 상황(예: `user5`의 crontab에 줄 셋이 있다)에서 `user5`가 `crontab -r`을 입력하면 무엇이 달라지나 → 그 사용자의 crontab 줄이 모두 지워진다. 오답은 흔한 오해에서 — 마지막(또는 첫) 줄 하나만 지워진다, 편집기가 열려 지울 줄을 고르게 한다, 목록을 화면에 보여 주기만 한다. 보기는 모두 결과를 말로 적은 것이다(기출의 옵션 넷 묶음을 쓰지 않는다 — guide.md 「문항」 11항). **정답 위치 3** |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `linux-process-boot.crontab-fields` — `CrontabFieldsDiagram`, JSON 키 `crontab-fields`

- 물음형 제목 예: `이 줄은 언제 실행될까?`
- 그릴 것: 본문 예 `30 2 * * 6 /home/user1/backup.sh`의 칸 — 값 노드 다섯(`30`·`2`·`*`·`*`·`6`)을 빈틈없이 한 줄로 잇고 그 아래(또는 위)에 칸 이름(분·시·일·월·요일)을, 명령 노드 `/home/user1/backup.sh`를 따로(guide.md 「글자열 칸」). 280 폭에서 다섯 칸이 한 줄에 들지 않으면 두 줄로 나누되 차례가 읽히게 한다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `time` | 시각 | `30`·`2` | 곁말 「02:30」 — 앞이 분, 뒤가 시 |
  | `every` | `*` | 일·월의 `*` | 날짜와 달을 가리지 않는다 |
  | `weekday` | 요일 | `6` | 곁말 「토요일」 — 0과 7은 일요일 |
  | `command` | 명령 | 명령 노드 | 다섯 칸 뒤에 실행할 명령을 적는다 |

- 요점 테스트: `time`의 선명한 값 노드는 왼쪽부터 `30`·`2` 차례이고(분 칸이 시 칸보다 왼쪽), 보이는 곁말이 그 둘로 만든 시각(`02:30`)이다. `weekday`의 선명한 노드는 요일 칸 하나다. 네 시나리오의 선명한 노드를 합하면 값 노드 다섯과 명령 노드가 빠짐없이 나온다.

#### 3-2. `linux-process-boot.crontab-command` — `CrontabOptionsDiagram`, JSON 키 `crontab-options`

- 물음형 제목 예: `crontab -r은 무엇을 지울까?`
- 그릴 것: 바뀌기 전·뒤(guide.md 「전과 후를 보이는 그림」) — 바뀌기 전 `user1`의 crontab(본문의 두 줄을 줄마다 노드로, 그룹 박스 「`user1`의 crontab」), 가운데 명령 노드, 바뀐 뒤의 crontab. 시나리오마다 명령 노드와 뒤 상태 노드가 다른 id·다른 자리다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `list` | `-l` | 전 상태·`crontab -l`·뒤 상태(두 줄 그대로) | 목록을 보여 줄 뿐 바꾸지 않는다 |
  | `edit` | `-e` | 전 상태·`crontab -e`·편집기 노드 | 편집기로 열어 줄을 고치거나 지운다 — 줄 하나만 없앨 때 |
  | `remove` | `-r` | 전 상태·`crontab -r`·뒤 상태(비었음) | 줄 하나가 아니라 crontab 전체가 지워진다 |

- 요점 테스트: `list`의 뒤 상태 줄 노드 라벨이 전 상태와 같고, `remove`의 뒤 상태에는 줄 노드가 하나도 선명하지 않으며 「비었음」(또는 본문이 쓴 말) 곁말이 보인다. `remove` 명령 노드 라벨에 `-r`이 있다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 156개, 마지막 id는 `n156`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 칸의 차례·범위·요일 번호가 step 0 결과(어느 페이지를 따르기로 했는지)와 같은가.
3. 본문 예와 n154의 줄을 칸 하나씩 손으로 다시 읽고, 오답 셋이 각각 어떤 실수에서 나오는지와 그 실수로 읽으면 정말 그 때가 되는지 따진다.
4. `phases/76-network-linux-process-accounts/index.json`의 step 5를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~8과 11~15를 만들거나 고치지 마라.** 이유: 다른 step의 범위다. 앞 개념에 고칠 것을 찾으면 summary에 적는다.
- **기출의 crontab 줄(`0 10 * * 1 /etc/check.sh`)과 crontab(5)의 예 줄을 쓰지 마라.** 이유: 기출 상황의 값과 공식 문서의 예를 옮기지 않는다(guide.md 「예시 값」, ADR-009).
- **`*/10` 같은 간격 표기와, 일과 요일을 둘 다 적었을 때의 규칙을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
