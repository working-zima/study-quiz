# Step 1: directory-hierarchy

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-filesystem`을 만들고 그 첫 개념 둘(1 디렉터리 계층 구조, 2 표준 디렉터리)의 글·문항·도식을 함께 만든다.**

이 주제는 네트워크 과목에서 Linux를 처음 여는 화면이다. 학습자는 Linux를 써 본 적이 없을 수 있고, 명령 줄 화면도 낯설 수 있다고 보고 쓴다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 0 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 목록 개념의 선례 `routing.routing-table`), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`routing` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "linux-filesystem", "title": "Linux 파일 시스템과 디스크", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 1·2다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `linux-filesystem.directory-hierarchy` | 디렉터리 계층 구조 | — | 이 주제의 첫 개념이라 **Linux**(운영체제 — 컴퓨터의 하드웨어를 관리하고 프로그램이 돌아가게 하는 기본 소프트웨어, 한 줄), **파일**, **디렉터리**(파일과 다른 디렉터리를 담는 것 — Windows의 폴더와 같은 자리라는 비유는 쓰되 이름이 다를 뿐이라고만), **관리자 계정 root**(시스템 전체를 관리하는 계정)를 짧게 푼다. 예는 `/` → `home` → `user1` → `report.txt`와 경로 `/home/user1/report.txt`(guide.md 「예시 값」 — 예로 붙인 이름이라고 밝힌다). 경로를 한 디렉터리씩 따라 읽는 법을 단계대로 보인다. 루트 디렉터리 `/`와 `/root`가 다르다는 것은 4절대로 왜 헷갈리는지(둘 다 「루트」라 부른다)와 무엇이 다른지를 쓴다. 디스크가 여럿이어도 한 나무에 붙는다는 것은 step 0 결과가 허락하는 만큼 한 줄로 — 「마운트」라는 낱말을 쓰면 그 자리에서 한 줄로 푼다 |
| 2 | `linux-filesystem.standard-directories` | 표준 디렉터리 | `directory-hierarchy` | **목록 개념**. 소개 문단: FHS가 루트 디렉터리 바로 아래의 디렉터리와 쓰임을 정해 두어, 어느 Linux에서든 같은 것을 같은 곳에서 찾는다(근거는 step 0 결과대로). 항목 12개를 guide.md 표의 차례로 쓴다 — `- **/bin**은 …` 꼴(경로를 백틱 없이 굵게, 영문 이름은 붙이지 않는다 — guide.md 「글」의 항목 이름 규칙 (3)). 항목마다 「무엇이 들어 있는지」를 한 문장으로 쓰고, 필요한 낱말(라이브러리·커널·장치 파일·로그·임시 파일)은 그 항목 안에서 푼다. `/usr` 항목은 이름이 user를 닮았지만 사용자 계정의 자리가 아니고 사용자의 홈은 `/home` 아래라는 것을 말한다. 항목 뒤 문단 하나: 쓰임에 따라 묶어 보기 — 명령과 라이브러리(`/bin`·`/sbin`·`/lib`·`/usr`), 설정(`/etc`), 사용자의 홈(`/home`·`/root`), 바뀌는 데이터와 임시 파일(`/var`·`/tmp`), 부팅·장치·커널 정보(`/boot`·`/dev`·`/proc`) — 도식이 이 묶음을 쓴다. `/bin` 등을 `/usr`과 합쳐 두는 배포판 이야기는 step 0 결과가 근거를 찾았을 때만 한 줄 |

### 2. 문항 — `src/data/network/questions.json`에 `n111`~`n113`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n111` | `directory-hierarchy` | 예/아니요 「개념 비교」 — 루트 디렉터리 `/`와 관리자 root의 홈 디렉터리 `/root`를 가르는 주장. 시작 때 예 19·아니요 20이므로 **예** 쪽 주장(「`/`와 `/root`는 서로 다른 디렉터리인가요?」 같은)으로 세운다. 해설은 둘이 무엇인지와 이름이 비슷한 까닭을 가르친다 |
| `n112` | `standard-directories` | 4지선다 「상황 적용」 — 실행 중인 프로그램이 남긴 기록(로그) 파일을 찾으려면 어느 디렉터리부터 보는가 → `/var`. 오답은 쓰임이 헷갈리는 `/etc`(설정)·`/tmp`(임시 파일)·`/usr`(프로그램). 로그를 한 줄로 풀어 문제문에 둔다 |
| `n113` | `standard-directories` | 예/아니요 「오해 바로잡기」 — 사용자마다의 홈 디렉터리를 `/usr` 아래에 두는가(아니요 — `/home` 아래). n111 뒤의 균형(예 20·아니요 20)에서 **아니요** 쪽으로 세운다. 해설은 `/usr`에 무엇이 있는지와 `/home`을 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 「디렉터리 구성 설명 가운데 옳지 않은 것」 꼴과 보기 넷을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/network/visuals/linux-filesystem.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'linux-filesystem': linuxFilesystemVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `linux-filesystem.directory-hierarchy` — `DirectoryTreeDiagram`, JSON 키 `directory-tree`

- 물음형 제목 예: `Linux의 파일은 어디에 놓일까?`
- 그릴 것: 디렉터리 나무 — 맨 위 `/`, 그 아래 `etc`·`home`·`root` 세 노드, `home` 아래 `user1`, `user1` 아래 `report.txt`. 부모와 자식을 잇는 가지는 늘 보이는 연결선이다(guide.md 「디렉터리 나무」).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `root-dir` | 루트 디렉터리 | `/` | 모든 디렉터리와 파일은 루트 디렉터리 `/` 아래 나무 하나에 든다 |
  | `path` | 경로 | `/`·`home`·`user1`·`report.txt` | 곁말 `/home/user1/report.txt` — 경로는 `/`부터 거쳐 가는 디렉터리 이름을 `/`로 이은 것 |
  | `root-home` | `/root` | `/`·`root` | 곁말 「관리자 root의 홈 디렉터리」 — `/`와 `/root`는 이름이 비슷한 다른 디렉터리 |

- 요점 테스트: `path`의 선명한 노드를 나무 위에서 아래 차례로 읽어 `/` 뒤에 `/`로 이으면 보이는 곁말의 경로와 같다. `root-home`의 선명한 노드는 `/`와 라벨 `root`인 노드 둘이고 서로 다른 노드다. `root-dir`의 선명한 노드는 `/` 하나다.

#### 3-2. `linux-filesystem.standard-directories` — `StandardDirectoriesDiagram`, JSON 키 `standard-directories`

- 물음형 제목 예: `어느 디렉터리에 무엇이 들어 있을까?`
- 그릴 것: 표준 디렉터리 12개를 노드로(라벨은 경로 그대로 `/bin`·`/usr` 등), 본문의 마지막 문단이 묶은 다섯 쓰임을 그룹 박스로 — 「명령과 라이브러리」(`/bin`·`/sbin`·`/lib`·`/usr`), 「설정」(`/etc`), 「사용자의 홈」(`/home`·`/root`),
  「바뀌는 데이터와 임시 파일」(`/var`·`/tmp`), 「부팅·장치·커널 정보」(`/boot`·`/dev`·`/proc`). 그룹 라벨은 본문의 말과 같게 쓴다. 맨 위에 `/` 노드를 두고 가지를 이을지는 280 폭에 맞춰 정한다(이으면 늘 보이는 연결선).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `programs` | 명령과 라이브러리 | `/bin`·`/sbin`·`/lib`·`/usr` | 명령과 그것이 쓰는 라이브러리 — `/usr`는 사용자 계정의 자리가 아니다 |
  | `config` | 설정 | `/etc` | 시스템의 설정 파일은 `/etc`에 둔다 |
  | `users` | 사용자의 홈 | `/home`·`/root` | 사용자의 홈은 `/home` 아래, 관리자 root의 홈은 `/root` |
  | `data` | 바뀌는 데이터 | `/var`·`/tmp` | 로그처럼 바뀌는 데이터는 `/var`, 임시 파일은 `/tmp` |
  | `system` | 부팅·장치·커널 | `/boot`·`/dev`·`/proc` | 부팅 파일, 장치 파일, 커널이 보여 주는 정보 |

- 요점 테스트: `users`의 선명한 노드 라벨 집합이 정확히 {`/home`, `/root`}이고, `programs`의 선명한 노드에 `/usr`가 있고 `/home`이 없다. 다섯 시나리오의 선명한 노드를 합하면 12개 노드가 빠짐없이 한 번씩 나온다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 113개, 마지막 id는 `n113`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `routing` 바로 뒤에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·목록 항목·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 목록 항목 12개가 FHS가 말하는 쓰임과 같은가(공식 문서 문장을 옮기지 않고).
4. `phases/75-network-linux-basics/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~11(/etc 디렉터리, /proc 파일 시스템, 파티션, MBR과 GPT, 디스크 장치 이름, 파일 시스템과 마운트, /etc/fstab, 스왑, 파일 속성)을 만들지 마라.** 이유: step 2~6의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **`/etc`·`/proc` 항목을 길게 쓰지 마라.** 이유: 두 디렉터리는 딸린 개념(step 2)이 자세히 쓴다. 목록 항목은 한 문장으로 쓰임만 말한다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
