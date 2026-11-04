# Step 2: etc-proc

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-filesystem`의 개념 둘(3 /etc 디렉터리, 4 /proc 파일 시스템)의 글·문항·도식을 함께 만든다.** 둘 다 `directory-hierarchy`에 딸린 개념이다.

기출은 `/etc`를 네 번(「사용자 암호 정보를 가진 디렉터리」, 「설정과 사용자 정보를 가진 디렉터리」), `/proc`을 두 번(「프로세스·하드웨어·시스템 정보를 보는 가상 파일 시스템」) 물었다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 0·1 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-filesystem` 주제(step 1이 쓴 두 개념 — **이 개념들이 이어 쓴다. 이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-filesystem.json`
- step 1이 만든 `src/components/diagrams/DirectoryTreeDiagram.tsx`·`StandardDirectoriesDiagram.tsx`와 그 테스트(이 주제 도식의 짜임을 맞춘다), `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-filesystem` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `linux-filesystem.etc-directory` | /etc 디렉터리 | `linux-filesystem.directory-hierarchy` | 그 컴퓨터 전체의 설정 파일을 두는 곳이고, 실행 프로그램은 두지 않는다(근거는 step 0 결과대로). **설정 파일**(프로그램이 어떻게 동작할지 적어 둔 글 파일 — 한 줄)을 푼다. 예 파일 셋: `/etc/passwd`(사용자 계정 목록), `/etc/shadow`(계정의 암호 정보 — 일반 사용자가 읽지 못하게 둔다), `/etc/fstab`(부팅 때 붙일 저장 공간 목록 — 한 줄만). 그래서 「설정과 사용자 정보」, 「암호 정보」를 찾을 곳이 `/etc`라는 것으로 이어 쓴다. 사용자 계정의 정보가 사용자의 홈(`/home`)이 아니라 `/etc`에 있다는 것은 4절대로 왜 헷갈리는지와 함께. 파일 안의 칸(사용자 이름·UID 등)은 쓰지 않는다 |
| 4 | `linux-filesystem.proc-filesystem` | /proc 파일 시스템 | `linux-filesystem.directory-hierarchy` | **커널**(운영체제의 핵심 — 하드웨어를 다루고 프로그램 실행을 맡는다)과 **프로세스**(실행 중인 프로그램 — 저마다 번호 PID를 받는다)를 한 줄씩 푼다. `/proc` 아래 파일은 디스크에 저장된 것이 아니라 읽을 때 커널이 그때의 상태를 보여 주는 것이다 — 가상 파일 시스템. 예: PID가 `1234`인 프로세스(예로 붙인 번호라고 밝힌다)의 디렉터리 `/proc/1234`, `/proc/cpuinfo`, `/proc/meminfo`. 보통 파일과 무엇이 다른지(4절) — 내용이 디스크에 남지 않고 읽을 때마다 지금 값이 나온다는 것은 step 0 결과의 근거대로. 「파일 시스템」이라는 낱말을 이 개념에서 처음 쓰면 한 줄로 푼다(파일을 이름과 디렉터리로 다루는 방식) |

### 2. 문항 — `n114`~`n115`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n114` | `etc-directory` | 4지선다 「상황 적용」 — 사용자 계정의 암호 정보 파일이 어느 디렉터리에 있는가 → `/etc`. 오답은 계정과 관련 있어 보여 헷갈리는 `/home`(사용자의 홈)·`/root`(관리자의 홈)와, 바뀌는 데이터 `/var`. 「암호 정보」를 문제문에서 한 줄로 푼다. 정답 위치는 균형대로 |
| `n115` | `proc-filesystem` | 예/아니요 「원리 이해」 — `/proc/meminfo`를 열면 보이는 내용이 디스크에 저장해 둔 것이 아니라 커널이 그때의 상태를 보여 주는 것인가(예). step 1이 끝난 뒤의 균형(계획대로면 예 20·아니요 21)에서 **예** 쪽으로 세운다. 해설은 가상 파일 시스템이 무엇이고 프로세스·하드웨어 정보를 어디서 보는지 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식 — `src/data/network/visuals/linux-filesystem.json`에 더한다

#### 3-1. `linux-filesystem.etc-directory` — `EtcFilesDiagram`, JSON 키 `etc-files`

- 물음형 제목 예: `설정 파일과 계정 정보는 어디에 있을까?`
- 그릴 것: 나무 — `/` 아래 `etc`와 `bin`, `etc` 아래 `passwd`·`shadow`·`fstab`, `bin` 아래 `ls`(명령 프로그램 예 — 본문에 「`/bin/ls` 같은 실행 프로그램은 `/etc`에 두지 않는다」처럼 먼저 쓴다). 가지는 늘 보이는 연결선.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `accounts` | 계정 정보 | `etc`·`passwd`·`shadow` | 계정 목록과 암호 정보도 `/etc`의 설정 파일이다. 곁말로 `shadow`는 일반 사용자가 읽지 못한다(본문에 쓴 만큼) |
  | `mounts` | 마운트 목록 | `etc`·`fstab` | 부팅 때 붙일 저장 공간 목록도 `/etc`에 있다 |
  | `programs` | 실행 프로그램 | `bin`·`ls` | 실행 프로그램은 `/etc`가 아니라 `/bin` 같은 곳에 둔다 |

- 요점 테스트: `accounts`의 선명한 노드에 `passwd`·`shadow`가 있고 `ls`가 없다. `programs`의 선명한 노드에 `etc` 아래 노드(`passwd`·`shadow`·`fstab`)가 하나도 없다.

#### 3-2. `linux-filesystem.proc-filesystem` — `ProcViewDiagram`, JSON 키 `proc-view`

- 물음형 제목 예: `/proc의 파일은 어디서 올까?`
- 그릴 것: 노드 `커널`과 `디스크`, `/proc` 그룹 박스 안의 `1234`·`cpuinfo`·`meminfo`, 디스크 쪽의 보통 파일 예(`report.txt` — 본문에 보통 파일의 예로 먼저 쓴다). 시나리오 경로 — `커널`에서 `/proc`의 노드로, `디스크`에서 `report.txt`로.
- 시나리오:

  | id | label | 선명한 것 | 경로·캡션이 말할 것 |
  |---|---|---|---|
  | `process` | 프로세스 정보 | `커널`·`1234` | 커널 → `1234`. 실행 중인 프로세스마다 PID 이름의 디렉터리가 있다 |
  | `hardware` | 하드웨어 정보 | `커널`·`cpuinfo`·`meminfo` | 커널 → 두 파일. CPU와 메모리 정보를 커널이 그때그때 보여 준다 |
  | `ordinary` | 보통 파일 | `디스크`·`report.txt` | 디스크 → `report.txt`. 보통 파일은 디스크에 저장되지만 `/proc`의 파일은 그렇지 않다 |

- 요점 테스트: `process`·`hardware`에서 보이는 경로는 모두 `커널` 노드에서 시작하고, 어느 시나리오에서도 `디스크` 노드에서 `/proc` 그룹 안 노드로 가는 경로가 보이지 않는다. `ordinary`에서 `/proc` 그룹 안 노드는 모두 흐리다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 115개, 마지막 id는 `n115`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 두 개념이 `linux-filesystem`의 `concepts`에서 `standard-directories` 뒤에 차례로 있고 `parentId`가 `linux-filesystem.directory-hierarchy`인지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 1의 `standard-directories`가 `/etc`·`/proc`을 한 문장으로 말한 것과 겹치지 않고 더 깊이 들어가는가.
   step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/75-network-linux-basics/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`/etc/passwd`·`/etc/shadow`의 칸(사용자 이름·UID·암호 해시 등)을 풀지 마라.** 이유: 계정 파일의 해석은 `linux-accounts`(phase 76)의 범위다. 여기서는 무엇이 든 파일인지만 쓴다.
- **`/proc`으로 프로세스를 다루는 명령(`ps`·`top`·`kill`)을 쓰지 마라.** 이유: `linux-process-boot`(phase 76)의 범위다.
- **개념 5~11을 만들지 마라.** 이유: step 3~6의 범위다.
