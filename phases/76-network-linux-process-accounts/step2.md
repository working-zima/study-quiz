# Step 2: top-process-commands

## 배경

phase 76은 네트워크 과목의 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획·결정·공통 규칙은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
**이 step은 주제 `linux-process-boot`의 개념 둘(3 top 명령, 4 프로세스를 다루는 명령)의 글·문항·도식을 함께 만든다.** 둘 다 `process`에 딸린 개념이다.

기출은 프로세스 상태와 시스템 사용량을 실시간으로 보는 명령(`top`)을 두 번 묻고, `top`을 「가장 우선순위가 높은 프로세스를 보여 주는 명령」이라 한 설명을 틀린 것으로 둔다. `kill`·`nice`·`pstree`는 맞는 설명으로 둔다.

## 읽어야 할 파일

- **`phases/76-network-linux-process-accounts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/76-network-linux-process-accounts/index.json`의 step 0~1 `summary`(특히 step 0의 c·d)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」)
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 76)」 항목의 top(1)·kill(1)·signal(7)·nice(1)·pstree(1)), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-process-boot` 주제(앞 step이 쓴 개념 — **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-process-boot.json`
- 앞 step의 도식(`ProcessTreeDiagram`·`PsColumnsDiagram`)과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-process-boot` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `linux-process-boot.top-command` | top 명령 | `process` | 프로세스와 시스템 사용량을 화면에 띄워 두고 일정한 간격으로 다시 그리는 명령이다. `ps`와 무엇이 다른지(4절) — `ps`는 그 순간을 한 번 보이고 끝나고, `top`은 끝낼 때까지 계속 새로 보인다. 화면의 두 영역(요약 영역 — 가동 시간·작업 수·CPU·메모리, 작업 영역 — 프로세스마다 PID·사용자·%CPU·%MEM·명령)을 step 0이 확인한 칸 이름대로 쓴다. 작업 영역이 기본으로 CPU 사용률이 큰 것부터 늘어선다는 것과 **우선순위 순서가 아니라는 것**(4절 — 우선순위는 CPU를 누구에게 먼저 줄지 정한 값이고, CPU 사용률은 실제로 쓴 몫이다. 우선순위 칸 PR·NI가 따로 있다는 것은 step 0 결과대로). `q`로 끝낸다. CPU(명령을 실제로 처리하는 장치)를 한 줄로 푼다. 다시 그리는 간격의 기본값을 쓸지는 step 0 결과대로. 화면의 수는 예시 값이라고 밝힌다 |
| 4 | `linux-process-boot.process-commands` | 프로세스를 다루는 명령 | `process` | **목록 개념**. 소개 문단: 프로세스를 끝내거나, CPU를 덜 차지하게 하거나, 관계를 나무로 보는 명령. 항목 셋 — `- **끝내기 요청**(`kill`)은 …`, `- **양보하며 실행하기**(`nice`)는 …`, `- **나무로 보기**(`pstree`)는 …`(guide.md 「글」의 항목 이름 규칙 (2) — 이름은 바꿔도 된다). `kill` 항목: 시그널(커널이 프로세스에 보내는 짧은 알림 — 한 줄)을 푼다. 기본 TERM은 「끝내라」는 요청이라 프로세스가 정리하고 끝날 수 있고, KILL(`kill -9`)은 프로세스가 막을 수 없다(step 0 결과대로). `nice` 항목: 나이스 값의 범위와 뜻(클수록 양보 — step 0 결과대로), 실행 중인 프로세스는 `renice`로 바꾼다는 한 줄. `pstree` 항목: `process` 개념의 부모·자식 관계를 나무로 보인다. 항목 뒤 문단: `ps -ef`로 PID를 찾아 `kill 2310`으로 `backup.sh`를 끝내는 차례(guide.md 「예시 값」)와 그 결과(목록에서 그 줄이 사라진다). 우선순위(CPU를 어느 프로세스에 먼저 줄지 — 한 줄)는 이 개념에서 처음이면 푼다(앞 개념이 풀었으면 다시 풀지 않는다). `pgrep`·`pkill`은 쓰지 않는다 |

### 2. 문항 — `src/data/network/questions.json`에 `n148`~`n149`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n148` | `top-command` | 예/아니요 「오해 바로잡기」 — `top`의 작업 영역이 기본으로 우선순위가 높은 프로세스부터 늘어서는가(아니요 — CPU 사용률이 큰 것부터, step 0 결과대로). step 1이 끝난 뒤의 균형(계획대로면 예 26·아니요 26)에서 **아니요** 쪽으로 세운다. step 0이 기본 정렬을 확인하지 못했으면 같은 방향의 다른 주장(예: `top`은 입력한 순간의 목록을 한 번 보여 주고 끝나는가 — 아니요)으로 바꾼다. 해설은 우선순위와 CPU 사용률이 무엇이 다른지를 가르친다 |
| `n149` | `process-commands` | 4지선다 「상황 적용」 — 본문과 다른 상황(예: `ps -ef`로 찾은 PID `3172` 프로세스에 끝내라는 요청을 보냈는데도 끝나지 않는다)에서 막을 수 없게 끝내려면 무엇을 입력하나 → `kill -9 3172`. 오답은 흔한 실수에서 — 같은 요청을 다시 보내기(`kill 3172`), 부모 프로세스의 번호로 보내기(PPID 값 — 문제문에 PPID를 함께 준다), 우선순위만 바꾸는 명령(`renice` 꼴 — 꼴은 step 0이 확인한 대로). 보기는 모두 명령 줄이고 하나만 맞는지 실제로 따진다. **정답 위치 3** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 「프로세스 명령의 설명 가운데 옳지 않은 것」 꼴과 보기 넷(`kill`·`nice`·`pstree`·`top`), 「실시간으로 관리하는 명령」의 보기 넷(`ps`·`top`·`kill`·`nice`)을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `linux-process-boot.top-command` — `TopScreenDiagram`, JSON 키 `top-screen`

- 물음형 제목 예: `top 화면은 무엇을 보여 줄까?`
- 그릴 것: `top` 화면을 그룹 박스 둘로 — 「요약 영역」(노드: 가동 시간·작업 수·CPU·메모리 — 본문의 말대로)과 「작업 영역」(프로세스 줄 서너 개 — 본문 예의 이름(`backup.sh`·`sshd`·`bash` 등)과 예시 %CPU 값, CPU 사용률이 큰 것부터 위에서 아래로). 값은 본문에 쓴 예시 값만.
  `ps`와 견주는 노드(「`ps` — 한 번 보이고 끝」·「`top` — 계속 다시 그림」)를 둘지는 280 폭에 맞춰 정한다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `summary` | 요약 영역 | 요약 영역의 노드 | 시스템 전체 — 가동 시간, 작업 수, CPU와 메모리 사용 |
  | `tasks` | 작업 영역 | 작업 영역의 프로세스 줄 | 프로세스마다의 사용량 — CPU 사용률이 큰 것부터, 우선순위 순서가 아니다 |
  | `refresh` | 다시 그리기 | (`ps`와 견주는 노드를 두었으면 그 둘, 아니면 두 영역 전체와 곁말) | 끝낼 때까지 일정한 간격으로 다시 그린다 — `ps`는 한 번 보이고 끝난다 |

- 요점 테스트: `tasks`의 선명한 줄을 위에서 아래로 읽으면 %CPU 값이 커지지 않는다(큰 것부터). `summary`의 선명한 노드는 모두 요약 영역 그룹 박스 안에 있고, `tasks`의 선명한 노드는 모두 작업 영역 안에 있다.

#### 3-2. `linux-process-boot.process-commands` — `ProcessControlDiagram`, JSON 키 `process-control`

- 물음형 제목 예: `실행 중인 프로세스에 무엇을 할 수 있을까?`
- 그릴 것: 대상 프로세스 노드 `2310 backup.sh`(본문 예), 명령 노드(`kill 2310`·`kill -9 2310`·`nice`의 예 줄·`pstree`), 결과 노드나 곁말(「TERM — 끝내라는 요청」, 「KILL — 막을 수 없다」, 「나이스 값 — CPU를 양보」, 「부모·자식을 나무로」). 명령 → 대상 → 결과를 경로로 잇는다(guide.md 「전과 후를 보이는 그림」 — 끝난 프로세스는 흐림과 곁말로).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `term` | `kill` | `kill 2310`·대상·결과 | 기본 시그널 TERM — 끝내라는 요청이라 프로세스가 정리하고 끝난다 |
  | `kill9` | `kill -9` | `kill -9 2310`·대상·결과 | KILL — 프로세스가 막을 수 없어 바로 끝난다 |
  | `nice` | `nice` | `nice`의 예 줄과 결과 | 나이스 값을 정해 실행 — 클수록 CPU를 다른 프로세스에 양보한다 |
  | `pstree` | `pstree` | `pstree`와 결과 | 부모·자식 관계를 나무 꼴로 보여 준다 |

- 요점 테스트: `term`·`kill9`의 명령 노드 라벨에 든 PID가 대상 노드 라벨의 PID와 같다. `term`과 `kill9`의 보이는 곁말(시그널 이름)이 서로 다르다. `nice`·`pstree` 시나리오에서는 대상 프로세스가 끝났다는 곁말이 보이지 않는다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 149개, 마지막 id는 `n149`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 0 summary가 「쓰지 않는다」로 정한 것을 지켰는가. 목록 항목이 혼자 서지 않는가(ADR-046).
3. `linux-process-boot`의 개념 1~4를 처음부터 통독해, 앞 step이 푼 낱말을 다시 풀지 않았는지와 풀이 없이 처음 나오는 낱말이 없는지 본다.
4. `phases/76-network-linux-process-accounts/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1·2와 5~15를 만들거나 고치지 마라.** 이유: 다른 step의 범위다. 앞 개념에 고칠 것을 찾으면 summary에 적는다.
- **`top` 화면의 꼴을 지어 그리지 마라.** 이유: 출력 꼴도 사실이다. step 0이 확인한 영역·칸 이름만 쓰고, 값은 예시 값이라고 밝힌다.
- **「죽인다」를 쓰지 마라.** 이유: 관용 표현(ADR-030 기준 5) — 「끝낸다」로 쓴다.
