# Step 6: boot-grub

## 배경

phase 76은 네트워크 과목의 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획·결정·공통 규칙은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
**이 step은 주제 `linux-process-boot`의 부팅 묶음을 열어, 개념 둘(11 부팅 과정, 12 GRUB 부트 로더)의 글·문항·도식을 함께 만든다.** 12는 11에 딸린 개념이다.

기출은 다른 운영체제와 Linux가 함께 있는 컴퓨터에서 멀티 부팅을 맡는 Linux의 부트 로더(GRUB)를 두 번 묻는다. 오답 보기로 MBR·CMOS 같은 낱말이 나온다.

## 읽어야 할 파일

- **`phases/76-network-linux-process-accounts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/76-network-linux-process-accounts/index.json`의 step 0~5 `summary`(특히 step 0의 k·l)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 76)」 항목의 boot(7)·bootup(7)·GRUB 매뉴얼, phase 75의 boot(7) 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-process-boot` 주제(앞 step이 쓴 개념 — **이미 푼 낱말은 다시 풀지 않는다**. 특히 `process`가 PID 1을, `daemon`이 systemd를 어떻게 풀었는지)와 `linux-filesystem.mbr-gpt`(MBR을 어떻게 풀었는지 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/visuals/linux-process-boot.json`
- 앞 step의 도식과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-process-boot` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `linux-process-boot.boot-sequence` | 부팅 과정 | — | 전원을 켠 뒤 로그인할 수 있게 되기까지 무엇이 차례로 일어나는지. 단계 다섯(guide.md 표 11)을 차례대로 — 목록 개념으로 쓸지 문단으로 쓸지는 읽기 쉬운 쪽으로 고른다(목록이면 단계 이름을 한국어로 세운 `- **펌웨어**(firmware)는 …` 꼴). 단계마다 **누가 무엇을 메모리에 올리고 다음 단계에 넘기는지**를 쓴다 — 펌웨어가 부트 로더를, 부트 로더가 커널을, 커널이 init을. 펌웨어(메인보드에 든, 전원을 켜면 처음 실행되는 프로그램 — BIOS·UEFI, step 0 결과대로 한 줄), 부트 로더, 루트 파일 시스템(디렉터리 나무의 맨 위 `/` — 한 줄)을 이 개념에서 푼다. init이 `process`의 PID 1이고 지금은 흔히 systemd라는 것, init이 서비스(데몬)를 켜고 로그인할 수 있게 한다는 것은 앞 개념을 되짚는다. 부팅 중 커널이 남긴 메시지를 나중에 `dmesg`로 볼 수 있다는 것은 이름과 한 줄. 단계 이름과 차례는 step 0 결과(boot(7)·bootup(7))에 맞춘다 |
| 12 | `linux-process-boot.grub` | GRUB 부트 로더 | `boot-sequence` | GNU GRUB(Linux에서 흔히 쓰는 부트 로더)이 하는 일 — 켤 때 메뉴를 보여 어느 커널·운영체제로 부팅할지 고르게 하고, 고른 커널을 메모리에 올려 실행을 넘긴다. **멀티 부팅**(한 컴퓨터에 운영체제를 여럿 두고 켤 때 고르는 것 — 한 줄): Linux 커널은 GRUB이 직접 불러오고, 직접 불러올 수 없는 운영체제(예: Windows)는 그 운영체제의 부트 로더에 넘긴다(체인 로딩) — step 0 결과대로. 예: Linux와 Windows가 함께 설치된 컴퓨터를 켜면 GRUB 메뉴에 둘이 보이고, 무엇을 고르느냐에 따라 그다음이 달라진다(메뉴 항목의 글자는 지어 쓰지 않는다 — 「Linux 항목」·「Windows 항목」처럼 말로). 부트 로더와 커널이 무엇이 다른지(4절 — 부트 로더는 커널을 불러오고 물러나는 작은 프로그램, 커널은 그 뒤 계속 실행되는 운영체제의 핵심). MBR(디스크 맨 앞의 영역 — `linux-filesystem.mbr-gpt`와 뜻을 맞춘 한 줄)과 부트 로더가 무엇이 다른지는 step 0 결과가 허락하는 만큼. 설정 파일·`grub-mkconfig`는 쓰지 않는다 |

### 2. 문항 — `src/data/network/questions.json`에 `n157`~`n158`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n157` | `boot-sequence` | 4지선다 「원리 이해(차례)」 — 전원을 켠 뒤 일어나는 일의 차례로 맞는 것을 고른다. 보기는 단계 넷(펌웨어·부트 로더·커널·init)을 늘어놓은 차례 넷이고, 오답은 흔한 혼동에서 — 부트 로더와 커널의 차례를 바꿈, init이 커널보다 먼저, 펌웨어가 부트 로더보다 뒤. 보기마다 화살표로 이은 한 줄이고, 단계 이름은 본문의 말과 같다. **정답 위치 0** |
| `n158` | `grub` | 예/아니요 「상황 적용」 — 멀티 부팅 상황의 주장(예: Linux와 Windows를 함께 설치한 컴퓨터를 켤 때 GRUB 메뉴에서 Windows를 골라 부팅할 수 있는가 — 예). step 5가 끝난 뒤의 균형(계획대로면 예 28·아니요 28)에서 **예** 쪽으로 세운다. 문제문이 「체인 로딩」 같은 답의 실마리를 주지 않게 한다(guide.md 「문항」 3항). 해설은 GRUB이 Linux 커널은 직접, Windows는 그 부트 로더에 넘겨 부팅한다는 것을 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 「멀티 부팅을 지원하는 Linux 로더」 꼴과 보기 넷(`MBR`·`RAS`·`NetBEUI`·`GRUB`, `CMOS`·`BASH`·`GRUB`·`ROOT`)을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `linux-process-boot.boot-sequence` — `BootSequenceDiagram`, JSON 키 `boot-sequence`

- 물음형 제목 예: `전원을 켜면 무엇이 차례로 실행될까?`
- 그릴 것: 단계 노드 다섯(펌웨어 → 부트 로더 → 커널 → init(PID 1) → 서비스·로그인)을 세로형은 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로(가로 440에 다섯이 들지 않으면 두 줄로 꺾되 차례가 읽히게). 단계 사이는 늘 보이는 화살표.
  노드 라벨은 본문의 단계 이름(예 `부트 로더(GRUB)` — 라벨이 길면 노드를 넓히거나 괄호 부분을 곁말로).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `firmware` | 펌웨어 | 펌웨어·부트 로더 | 전원을 켜면 펌웨어가 하드웨어를 점검하고 부트 로더를 찾는다 |
  | `loader` | 부트 로더 | 부트 로더·커널 | 부트 로더가 커널을 메모리에 올리고 실행을 넘긴다 |
  | `kernel` | 커널 | 커널·init | 커널이 장치를 준비하고 루트 파일 시스템을 붙인 뒤 첫 프로세스 init을 실행한다 |
  | `init` | init | init·서비스·로그인 | PID 1 init(지금은 흔히 systemd)이 서비스를 켜고 로그인할 수 있게 한다 |

- 요점 테스트: 노드를 차례(세로형은 `y`, 가로형은 읽는 차례)로 읽은 라벨이 본문 단계의 차례와 같다. 시나리오마다 선명한 두(또는 세) 노드는 차례상 이웃한다. 네 시나리오를 차례대로 보면 넘겨받는 쪽이 다음 시나리오의 넘겨주는 쪽이다.

#### 3-2. `linux-process-boot.grub` — `GrubMenuDiagram`, JSON 키 `grub-menu`

- 물음형 제목 예: `GRUB 메뉴에서 고르면 무엇이 부팅될까?`
- 그릴 것: GRUB 노드(메뉴 — 그룹 박스 「GRUB 메뉴」 안에 「Linux 항목」·「Windows 항목」 노드), Linux 커널 노드, Windows의 부트 로더 노드, Windows 노드. 경로 — Linux 항목 → Linux 커널(직접 불러온다), Windows 항목 → Windows의 부트 로더 → Windows(넘긴다).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `linux` | Linux 고르기 | Linux 항목·Linux 커널 | GRUB이 Linux 커널을 직접 메모리에 올린다 |
  | `windows` | Windows 고르기 | Windows 항목·Windows의 부트 로더·Windows | 직접 불러올 수 없는 운영체제는 그 부트 로더에 넘긴다(본문이 쓴 이름대로 — 체인 로딩) |

- 요점 테스트: `windows`에서 보이는 경로가 Windows의 부트 로더 노드를 지나 Windows 노드에 닿고, `linux`에서 보이는 경로는 부트 로더 노드를 거치지 않고 Linux 커널 노드에 닿는다. 두 시나리오의 선명한 노드가 겹치지 않는다(GRUB 메뉴 그룹 박스는 흐려지지 않는다).

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 158개, 마지막 id는 `n158`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 단계의 차례와 하는 일이 boot(7)·bootup(7)과 같은가, GRUB의 사실이 GRUB 매뉴얼(판을 적은 것)과 같은가(공식 문서 문장을 옮기지 않고).
3. n157의 보기 넷을 하나씩 본문의 차례와 견줘 정답이 하나뿐인지 본다.
4. `phases/76-network-linux-process-accounts/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~10과 13~15를 만들거나 고치지 마라.** 이유: 다른 step의 범위다. `dmesg`·실행 레벨·타깃은 step 7이 쓴다 — 이 step은 이름과 한 줄까지만.
- **GRUB 메뉴의 화면·항목 글자, 설정 파일의 내용을 지어 보이지 마라.** 이유: 출처가 보이는 꼴이 아니면 사실이 아니다. 「Linux 항목」처럼 말로 쓴다.
- **`linux-filesystem.mbr-gpt`를 고치지 마라.** 이유: 앞 phase의 주제다. 뜻을 맞추기만 한다.
