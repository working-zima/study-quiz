# Step 1: local-accounts-groups

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다. 전체 계획·결정·공통 규칙은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
**이 step은 주제 `windows-ad`를 만들고 그 첫 개념 둘(1 로컬 사용자 계정, 2 기본 로컬 그룹)의 글·문항·도식을 함께 만든다.** 2는 1에 딸린 개념이다.
네트워크 과목의 첫 Windows 개념이므로, 이 주제 화면만 읽고도 Windows Server·계정·로그온·권한의 뜻이 서게 쓴다.

기출은 Windows Server에 기본으로 만들어지는 로컬 계정이 아닌 것으로 root를 고르게 하고([기출 2024-11-03 #35]),
기본 로컬 그룹이 할 수 있는 일을 세 번 묻는다 — Remote Management Users가 WMI 자원에 관한 권한을 갖는다([기출 2024-02-25 #41]), Users 그룹은 시스템 수준을 바꾸는 권한이 없다([기출 2024-05-19 #33]),
컴퓨터 자원의 권한 부여 특성을 다루는 그룹은 Access Control Assistance Operators다([기출 2025-05-25 #40]).

## 읽어야 할 파일

- **`phases/80-network-windows-ad-tools/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/80-network-windows-ad-tools/index.json`의 step 0 `summary`(기본 로컬 계정 목록, 기본 로컬 그룹 표, 권한과 사용 권한, 기출 판정, E 번호, 한국어 이름)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 80 step 0)」 줄과 항목), `docs/source/network/exam-notes.md`(E35~가 있으면 그 항목)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(`linux-accounts.user-account`의 root, `linux-permissions`의 소유자·그룹 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `PasswdFieldsDiagram`(계정의 칸), `NamedFilesDiagram`(관계), `IptablesChainsDiagram`(시나리오별 길)과 그 테스트, `src/data/network/visuals/linux-accounts.json`·`linux-servers.json`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-11-03 #35], [기출 2024-02-25 #41], [기출 2024-05-19 #33], [기출 2025-05-25 #40] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`linux-servers` 주제 객체 바로 뒤(지금 배열의 맨 끝)에 주제 객체를 더한다 — `{ "id": "windows-ad", "title": "Active Directory와 그룹 정책", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 3(★★★, 출제 10/11회)인지 `data.test.ts`의 주제 지도 표와 견준다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `windows-ad.local-accounts` | 로컬 사용자 계정 | — | 이 주제의 첫 개념이라 **운영 체제**(컴퓨터를 움직이는 기본 프로그램), **Windows Server**(서버로 쓰도록 만든 Windows), **서버**(요청을 받아 일을 해 주는 컴퓨터), **계정**(컴퓨터를 쓰는 사람을 가리키는 이름과 그것을 확인하는 암호), **로그온**(계정 이름과 암호를 넣어 컴퓨터를 쓰기 시작하는 것), **권한**(그 계정이 할 수 있는 일)을 한 줄씩 푼다. 로컬 계정이 한 컴퓨터 안에 정의되어 그 컴퓨터의 자원(파일·폴더·프린터 — 한 줄)에만 쓰인다는 것(step 0 결과대로). 관리하는 자리 — 「컴퓨터 관리」의 「로컬 사용자 및 그룹」과 명령 `net user`(step 0 결과대로 한 줄씩 — 메뉴 이름은 step 0이 확인한 한국어 이름). 기본 로컬 사용자 계정 목록과 각 계정의 성질(step 0 결과대로 — 셋이라 말할지, 판에 따라 더 있는 계정을 한 줄로 덧붙일지는 step 0 summary가 정한 대로). **root는 Windows의 계정이 아니라 Linux·Unix의 관리자 계정**이라는 한 줄(`linux-accounts.user-account`와 뜻을 맞춘다). 예: 서버 `SRV01`에 만든 로컬 계정 `user01`은 `SRV01`의 자원에 쓰이고, 다른 컴퓨터 `PC01`에서는 쓸 수 없다(「예시 값」 — 근거는 step 0 결과대로) |
| 2 | `windows-ad.local-groups` | 기본 로컬 그룹 | `windows-ad.local-accounts` | **목록 개념**. 소개 문단 — **그룹**이 계정 여럿을 묶어 권한을 한꺼번에 주는 단위이고, 그룹에 넣은 계정은 그 그룹의 권한과 사용 권한을 받는다는 것, 운영 체제가 처음부터 만들어 두는 그룹이 있다는 것(step 0 결과대로). 항목은 guide.md 2행의 그룹들(영문 이름이 항목 이름 — 「글」의 항목 이름 규칙 (1): `- **Backup Operators**는 …`). 항목마다 그 그룹에 넣으면 할 수 있게 되는 일을 한 문장으로(step 0의 그룹 표대로 — 문서의 설명을 번역해 옮기지 않는다). **WMI**(Windows를 원격에서 살피고 관리하게 하는 장치 — step 0 근거대로 한 줄)는 Remote Management Users 항목에서 푼다. 항목 뒤 문단: **권한(right)과 사용 권한(permission)이 무엇이 다른지**(4절 — step 0 결과대로), Performance Monitor Users와 Performance Log Users의 차이(step 0 결과대로 — 한 문장), Power Users가 Administrators와 같은 권한이 아니라는 것(step 0 결과대로), 관리자 그룹에 사람을 적게 두라는 권고(근거가 있을 때만). 예: `user01`을 Backup Operators에 넣으면 `user01`이 `SRV01`의 파일을 백업하고 복원할 수 있다(「예시 값」). step 0이 판정하지 못한 그룹 설명(예: RDS Endpoint Servers)은 쓰지 않거나 근거가 있는 만큼만 |

### 2. 문항 — `src/data/network/questions.json`에 `n256`~`n258`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n256` | `local-accounts` | 예/아니요 「개념 확인」 — 시작 때 균형(예 49·아니요 50)에서 **아니요** 쪽으로 세운다. 예: Windows Server를 막 설치했을 때 기본으로 만들어지는 Guest 계정은 바로 로그온에 쓸 수 있는 상태인가요?(아니요 — 기본으로 꺼져 있다, step 0 결과대로). 해설은 기본 로컬 계정들의 성질과 root가 Windows의 계정이 아니라는 것을 가르친다. 기출의 보기 묶음(Administrator·DefaultAccount·Guest·root)을 쓰지 않는다 |
| `n257` | `local-groups` | 4지선다 「상황 적용」 — 본문과 다른 장면(예: 서버 관리자가 백업 담당 직원의 계정 `user07`에 서버 전체를 바꾸는 권한은 주지 않고 파일 백업과 복원만 맡기려 한다)을 주고 어느 그룹에 넣어야 하는지 고르게 한다. 정답 Backup Operators, 오답은 같은 범주에서 실제로 헷갈리는 그룹(예: Administrators — 일은 되지만 필요 이상의 권한이라 문제문의 조건 「서버 전체를 바꾸는 권한은 주지 않고」에 어긋난다, Users, Remote Desktop Users 등 — step 0의 그룹 표로 오답이 정말 그 일을 못 하는지 따진다). 기출 묶음(Administrators·Backup Operators·Guests·Users / Power Users·RDS Endpoint Servers·Remote Management Users·Performance Monitor Users / Replicator·Power Users·Backup Operators·ACAO)과 같은 넷이 되지 않게 한다. **정답 위치 0** |
| `n258` | `local-groups` | 예/아니요 「원인과 결과」 — **예** 쪽으로 세운다. 예: 일반 사용자 계정을 Administrators 그룹에 넣으면 그 계정은 기본 Administrator 계정처럼 그 컴퓨터를 모두 제어할 수 있게 되나요?(예 — 그룹에 넣은 계정은 그룹의 권한을 받는다, step 0 결과대로). 해설은 그룹의 권한이 구성원에게 간다는 원리와, 그래서 관리자 그룹을 좁게 쓴다는 것을 가르친다. n256과 다른 것을 묻는다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 50·아니요 51, 정답 위치 40/39/39/39.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

이 step이 `src/data/network/visuals/windows-ad.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'windows-ad': windowsAdVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」 — `'linux-servers'` 바로 뒤, 지금 맨 끝).

#### 3-1. `windows-ad.local-accounts` — `LocalUserAccountsDiagram`, JSON 키 `local-user-accounts`

- 물음형 제목 예: `로컬 계정은 어디까지 쓰일까?`
- 그릴 것: 서버 `SRV01`(그룹 박스) 안에 로컬 계정 노드들(기본 계정 — step 0 결과의 목록대로 — 과 `user01`)과 `SRV01`의 자원 노드, 그 옆에 다른 컴퓨터 `PC01`(그룹 박스)과 그 자원 노드. 직교 경로만.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `builtin` | 기본 계정 | 기본 계정 노드들 | 설치할 때 운영 체제가 만들어 두는 계정이다(꺼져 있는 계정은 곁말로 — 본문의 말) |
  | `scope` | 쓰이는 곳 | `user01`·`SRV01`의 자원과 그 사이 경로 | 로컬 계정은 그 계정을 만든 컴퓨터의 자원에만 쓰인다 — `PC01`은 흐리고 경로가 없다 |

- 요점 테스트: `builtin`에서 선명한 계정 노드의 라벨 집합이 본문이 든 기본 계정 목록과 같고 `user01`은 흐리다. `scope`에서 보이는 경로가 `user01`에서 `SRV01`의 자원으로만 가고, `PC01` 쪽 노드에 닿는 경로가 없다. 색으로 막힘을 가르지 않는다.

#### 3-2. `windows-ad.local-groups` — `BuiltinLocalGroupsDiagram`, JSON 키 `builtin-local-groups`

- 물음형 제목 예: `계정을 그룹에 넣으면 무엇을 할 수 있게 될까?`
- 그릴 것: 왼쪽(세로형은 위)에 계정 `user01`, 가운데에 그룹 노드 셋(Users·Backup Operators·Administrators), 오른쪽(세로형은 아래)에 그룹마다 할 수 있게 되는 일 노드(일상 작업 / 파일 백업과 복원 / 컴퓨터 전체 제어 — 본문의 말). 그룹 → 일 경로는 늘 보이고, 계정 → 그룹 경로는 시나리오마다 하나.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `users` | Users | `user01`·Users·일상 작업 | 새로 만든 계정은 Users에 들어 일상 작업을 한다 |
  | `backup` | Backup Operators | `user01`·Backup Operators·백업과 복원 | Backup Operators에 넣으면 파일을 백업하고 복원할 수 있다 |
  | `admins` | Administrators | `user01`·Administrators·전체 제어 | Administrators에 넣으면 그 컴퓨터를 모두 제어한다 |

- 요점 테스트: 시나리오마다 보이는 계정 → 그룹 경로가 하나이고, 그 경로가 닿는 그룹 노드에서 시작하는 그룹 → 일 경로의 끝 노드만 선명하다(다른 일 노드는 흐리다). 세 시나리오의 선명한 그룹 노드가 서로 다르다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~7, 9~13)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 258개, 마지막 id는 `n258`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `linux-servers` 바로 뒤(맨 끝)에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 그룹 설명이 문서 문장의 번역이 아니라 자기 말인가.
4. n257의 보기 넷을 step 0의 그룹 표로 하나씩 따져 문제문의 조건을 만족하는 것이 하나뿐인지 본다.
5. `phases/80-network-windows-ad-tools/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~22를 만들지 마라.** 이유: step 2~13의 범위다. 이 step의 글이 도메인을 말해야 하면 「여러 컴퓨터의 계정을 한곳에서 관리하는 묶음」이라는 한 줄로 그친다.
- **AD의 기본 그룹(Domain Admins·Domain Users 등)과 그룹 범위를 쓰지 마라.** 이유: 이 개념은 한 컴퓨터의 로컬 그룹이다. 도메인 그룹은 「그룹 종류와 범위」(step 6)의 범위다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
