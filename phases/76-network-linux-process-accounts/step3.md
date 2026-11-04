# Step 3: free-daemon

## 배경

phase 76은 네트워크 과목의 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획·결정·공통 규칙은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
**이 step은 주제 `linux-process-boot`의 머리 개념 둘(5 free 명령, 6 데몬)의 글·문항·도식을 함께 만든다.**

기출은 메모리 사용량을 보는 명령(`free`)을 두 번, 데몬의 성질(뒤에서 실행되고, 시스템 서비스를 맡고, `ps`로 활동을 확인하며, 부팅 때만 시작되는 것이 아니다)을 한 번 묻는다. 데몬이 살아 있는지 `ps`로 확인하는 문항(3회)은 step 1의 `ps-command`가 맡았다.

## 읽어야 할 파일

- **`phases/76-network-linux-process-accounts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/76-network-linux-process-accounts/index.json`의 step 0~2 `summary`(특히 step 0의 e·f)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」)
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 76)」 항목의 free(1)·daemon(7)·systemd(1)·sshd(8)·cron(8), phase 75의 proc_meminfo(5)·mkswap(8) 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-process-boot` 주제(앞 step이 쓴 개념 — **이미 푼 낱말은 다시 풀지 않는다**)와 `linux-filesystem.swap`(스왑을 어떻게 풀었는지 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/visuals/linux-process-boot.json`
- 앞 step의 도식과 그 테스트, phase 75의 `SwapSpaceDiagram`, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-process-boot` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `linux-process-boot.free-command` | free 명령 | — | 메모리를 얼마나 쓰고 얼마나 남았는지 보여 주는 명령이다. 메모리(RAM — 실행 중인 프로그램과 데이터를 두는 저장 장치)와 스왑(메모리가 모자랄 때 커널이 내용을 옮겨 두는 디스크의 공간 — `linux-filesystem.swap`과 뜻을 맞춘다)을 한 줄씩 푼다. 출력의 칸 여섯과 Swap 줄을 step 0 결과의 뜻대로 — 머리줄과 Mem 줄·Swap 줄의 예(값은 예시 값이라고 밝힌다, 단위는 step 0이 확인한 기본 단위)를 보이고 칸마다 한 줄. **free와 available이 무엇이 다른지**(4절) — 쓰이지 않는 메모리와, 캐시(자주 읽는 파일 내용을 메모리에 남겨 둔 것 — 한 줄)를 비워 줄 수 있어 새 프로그램이 쓸 수 있다고 어림한 양. 「남은 메모리」를 볼 때는 available을 본다는 것은 step 0 결과가 허락하는 만큼. used가 total − available로 계산된다는 것을 예의 값으로 단계대로(값을 그렇게 맞춘다). `-h`는 한 줄. 디렉터리가 차지한 양은 `du`, 파일 시스템의 남은 양은 `df`라는 것은 항목이 아니라 마지막 문단의 한 줄 |
| 6 | `linux-process-boot.daemon` | 데몬 | — | 터미널 없이 뒤에서 계속 실행되며 요청이나 정해진 일을 기다리는 프로세스다. 앞 개념이 「데몬」을 한 줄로 풀었으면 여기서 제대로 정의한다(같은 말을 되풀이하지 않는다). 예 `sshd`(다른 컴퓨터에서 원격으로 접속해 오는 것을 받는다)와 `crond`(예약된 작업을 정한 시각에 실행한다) — guide.md 「예시 값」. 백그라운드(셸이 그 명령이 끝나기를 기다리지 않고 다음 명령을 받는 것 — step 0 결과대로 한 줄)와 터미널(사용자가 명령을 입력하고 결과를 보는 창 — 한 줄)을 푼다. 보통 부팅 때 systemd(PID 1 — 서비스를 켜고 끄는 일을 맡는 프로그램)가 켜지만 **부팅이 끝난 뒤에도 관리자가 켜고 끌 수 있다**는 것(관리자가 쓰는 명령 이름 `systemctl`은 한 줄 — 그 명령의 옵션은 딸린 개념이 쓴다). 데몬과 보통 프로세스가 무엇이 다른지(4절 — 둘 다 프로세스지만 데몬은 사용자의 명령 줄에 묶이지 않고 서비스를 맡아 계속 실행된다). 살아 있는지는 `ps`로 확인한다는 한 줄(앞 개념을 되짚는다). 이름 끝 `d`의 관례는 step 0이 근거를 찾았을 때만 |

### 2. 문항 — `src/data/network/questions.json`에 `n150`~`n151`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n150` | `free-command` | 4지선다 「출력 읽기」 — 본문과 다른 값의 `free` 출력(머리줄과 Mem 줄)을 문제문에 주고 「새 프로그램을 스왑 없이 시작하는 데 쓸 수 있다고 어림한 양」을 묻는다 → available 값. 오답은 같은 줄의 다른 칸 값 — 흔한 실수인 free 값을 꼭 넣고, buff/cache·shared 같은 다른 칸의 값. **total − used는 available과 같은 값이므로 오답으로 만들지 마라.** 값은 `used = total − available`가 맞게 고르고, 보기 넷이 모두 다른 수가 되게 한다. 정답의 칸 이름(available)이 문제문에 낱말로 드러나지 않게 묻는다 — 출력의 머리줄에 있는 것은 괜찮다. **정답 위치 0** |
| `n151` | `daemon` | 예/아니요 「오해 바로잡기」 — 데몬은 부팅할 때만 시작될 수 있다는 오해를 바로잡는 주장. step 2가 끝난 뒤의 균형(계획대로면 예 26·아니요 27)에서 **예** 쪽으로 세운다(예: 부팅이 끝난 뒤에 관리자가 멈춰 있던 데몬을 켤 수 있는가 — 예). 문제문이 답의 이유를 알려 주지 않게 한다(guide.md 「문항」 3항). 해설은 누가 데몬을 켜는지(부팅 때 systemd, 그 뒤에는 관리자의 요청을 받은 systemd)와 데몬이 무엇인지를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — `free`의 「설명으로 올바른 것」 꼴과 보기 넷, 「메모리 정보를 보는 명령」의 보기 넷(`mem`·`free`·`du`·`cat`), 「데몬에 관한 설명 가운데 옳지 않은 것」 꼴과 보기 넷을 쓰지 않는다).
형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `linux-process-boot.free-command` — `FreeMemoryDiagram`, JSON 키 `free-memory`

- 물음형 제목 예: `메모리는 얼마나 남았을까?`
- 그릴 것: `free` 출력의 칸 — Mem 줄의 칸(total·used·free·shared·buff/cache·available)과 그 값(본문의 예시 값), Swap 줄(total·used·free). 세로형은 「칸 이름 | 값」 짝을 위에서 아래로 쌓는다(guide.md 「표 모양 그림」).
  막대 길이로 양을 견주는 그림은 **칸 사이의 합 관계가 출처대로일 때만** 쓴다 — used가 total − available로 계산되므로 used + free + buff/cache가 total과 같다고 그리지 마라.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `used` | used | total·available·used | 곁말에 본문 예의 계산(`total − available = used`의 수) — used는 total에서 available을 뺀 값 |
  | `available` | free와 available | free·buff/cache·available | free는 쓰이지 않는 메모리, available은 캐시를 비워 줄 수 있어 새 프로그램이 쓸 수 있다고 어림한 양 |
  | `swap` | Swap | Swap 줄의 칸 | 메모리가 모자랄 때 쓰는 디스크의 스왑 공간 |

- 요점 테스트: 노드 라벨의 값으로 `total − available = used`가 성립하고, available 값이 free 값보다 크다. `used` 곁말의 계산식에 나온 세 수가 각 칸 노드의 값과 같다.

#### 3-2. `linux-process-boot.daemon` — `DaemonServiceDiagram`, JSON 키 `daemon-service`

- 물음형 제목 예: `데몬은 언제 켜지고 무엇을 할까?`
- 그릴 것: `PID 1`(systemd) 노드, 데몬 `sshd` 노드, 관리자 노드, 원격 접속하는 다른 컴퓨터 노드. 경로 — 부팅 때 systemd가 `sshd`를 켜는 경로, 부팅 뒤 관리자가 켜 달라고 하면 systemd가 켜는 경로, 다른 컴퓨터의 접속 요청이 `sshd`에 닿는 경로.
  관리자가 데몬을 「직접」 실행하는지, systemd에 요청하는지는 step 0 결과(systemctl(1)·systemd(1))대로 그린다 — 근거 없이 관리자에서 `sshd`로 바로 잇지 마라. 「터미널 없음」은 곁말로.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `boot` | 부팅 때 | `PID 1`·`sshd` | 부팅할 때 systemd가 데몬을 켠다 |
  | `manual` | 부팅 뒤 | 관리자·`PID 1`·`sshd` | 부팅이 끝난 뒤에도 관리자가 데몬을 켜고 끌 수 있다 |
  | `waiting` | 요청 기다리기 | 다른 컴퓨터·`sshd` | 터미널 없이 뒤에서 실행되며 접속 요청을 기다린다 |

- 요점 테스트: `boot`와 `manual`에서 보이는 경로가 모두 `sshd` 노드에서 끝나고, `manual`에만 관리자 노드가 선명하다. `waiting`에서는 `PID 1` 노드가 흐리다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 151개, 마지막 id는 `n151`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가(특히 step 0의 E 항목 — `free`의 「가상 메모리」를 판정했으면 그 처리).
3. `free` 출력 예의 값을 손으로 다시 계산한다 — `total − available = used`, available > free. n150의 값도 같은 식으로 따지고, 보기 넷 가운데 정답 값과 같은 수가 오답에 없는지 본다.
4. `phases/76-network-linux-process-accounts/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~4와 7~15를 만들거나 고치지 마라.** 이유: 다른 step의 범위다. `systemctl`의 옵션은 개념 7이 쓴다 — 이 step은 명령 이름과 한 줄까지만.
- **`free` 출력의 칸 사이 관계를 지어 쓰지 마라.** 이유: used = total − available은 free(1)의 정의다. 다른 합 관계(used + free + buff/cache = total 같은)는 출처가 그렇게 말하지 않으면 쓰지도 그리지도 않는다.
- **`linux-filesystem.swap`을 고치지 마라.** 이유: 앞 phase의 주제다. 뜻을 맞추기만 한다.
