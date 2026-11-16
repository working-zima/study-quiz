# Step 5: ou-domain-users

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다. 전체 계획·결정·공통 규칙은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
**이 step은 `windows-ad`의 개념 둘(7 조직 구성 단위, 8 도메인 사용자 계정)의 글·문항·도식을 만든다.** 둘 다 머리 개념이다.

기출은 한 도메인 안을 관리부·회계부 같은 부서로 나눠 관리하려면 설정할 것으로 OU를 고르게 하고(오답 DC·RODC·사이트 — [기출 2025-02-23 #42]),
도메인 사용자 계정 관리에 대한 맞는 설명으로 「Active Directory 사용자 및 컴퓨터에서 도메인 사용자 계정을 만들고 보안 그룹의 구성원으로 넣을 수 있다」를 고르게 한다
(오답 — 암호 정책을 사용자가 임의로 정한다, 별도 권한 없이 모든 네트워크 자원에 접근한다, 로컬 계정만 만들 수 있다 — [기출 2026-08-02 #43]).

## 읽어야 할 파일

- **`phases/80-network-windows-ad-tools/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/80-network-windows-ad-tools/index.json`의 step 4 `summary`(OU·사이트, 도메인 사용자 계정·만드는 차례·계정 설정, 기출 판정, E 번호, 한국어 이름)와 step 3 `summary`의 「앞 개념에 고칠 것」·문항 균형
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 80 step 4)」 줄과 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1~3이 쓴 `windows-ad` 여섯 개념** — 이미 푼 낱말을 다시 풀지 않는다. 특히 `local-accounts`의 로컬 계정, `local-groups`의 그룹·사용 권한, `active-directory`의 도메인·디렉터리, `domain-tree-forest`의 도메인 — 뜻을 맞춘다),
  `src/data/network/questions.json`, `src/data/network/visuals/windows-ad.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1~3이 만든 도식과 그 테스트(특히 `AdForestStructureDiagram`의 겹친 그룹 박스), `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-02-23 #42], [기출 2026-08-02 #43] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-ad` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `windows-ad.organizational-unit` | 조직 구성 단위 | — | **조직 구성 단위**(OU — Organizational Unit)가 한 도메인 안에서 사용자·그룹·컴퓨터를 부서·지역처럼 나눠 담는 그릇(**컨테이너** — 한 줄)이라는 것, OU 안에 OU를 둘 수 있다는 것(step 4 결과대로). 쓰임 둘 — 그룹 정책을 그 OU에 연결해 안의 사용자·컴퓨터에만 설정을 건다(그룹 정책은 한 줄로 푼다 — 「사용자와 컴퓨터의 설정을 중앙에서 정해 한꺼번에 적용하는 기능」), 그 OU의 관리 일을 다른 사람에게 맡긴다(위임 — step 4 결과대로). **OU와 그룹이 무엇이 다른지**, **OU와 도메인**, **OU와 사이트**(4절 — step 4 결과대로, 사이트와 서브넷은 한 줄씩 푼다). 기본 컨테이너(`Users`·`Computers`)가 OU와 다르다는 것은 step 4 결과대로 한 줄. 예: `example.com` 안에 OU `영업팀`·`개발팀`을 만들고 `user01`과 `PC01`을 `영업팀`에 둔 뒤, `영업팀`에 GPO `영업팀 PC 정책`을 연결하면 `영업팀` 안의 계정·컴퓨터에만 걸린다(「예시 값」) |
| 8 | `windows-ad.domain-user-accounts` | 도메인 사용자 계정 | — | AD DS에 만든 사용자 계정 — 도메인에 가입한 어느 컴퓨터에서나 로그온하고 도메인의 자원에 접근하는 데 쓴다(step 4 결과대로). 만드는 차례를 따라 할 수 있게(도구·메뉴 이름은 step 4가 확인한 한국어 화면 이름): ① 「Active Directory 사용자 및 컴퓨터」(실행 이름 `dsa.msc`)를 연다 ② 계정을 둘 OU를 고른다 ③ 새 사용자를 만들고 첫 암호를 정한다 ④ 그 계정을 보안 그룹의 구성원으로 넣는다(보안 그룹은 한 줄로 푼다 — 사용 권한을 주는 데 쓰는 그룹). 계정 설정(다음 로그온 때 암호 바꾸기, 계정 사용 안 함 등)은 step 4 결과대로 둘~넷. 계정을 만든다고 모든 자원에 접근하는 것이 아니다 — 접근은 그 계정이 든 그룹과 자원의 사용 권한이 정한다(step 4 결과대로). 암호는 도메인의 암호 정책을 따르며 사용자가 마음대로 정하지 못한다(한 줄). **로컬 사용자 계정과 도메인 사용자 계정이 무엇이 다른지**(4절 — 어디에 저장되고 어디까지 쓰이는지 — `local-accounts`의 말과 뜻을 맞춘다). 예: `user01`을 OU `영업팀`에 만들고 그룹 `Sales-Users`에 넣으면, `Sales-Users`에 사용 권한을 준 공유 폴더는 `user01`도 열 수 있다(「예시 값」 — 공유 폴더는 한 줄로 푼다) |

### 2. 문항 — `src/data/network/questions.json`에 `n264`~`n265`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n264` | `organizational-unit` | 4지선다 「상황 적용」 — 본문과 다른 장면(예: 한 도메인 안에서 인사팀 컴퓨터에만 따로 설정을 걸고, 인사팀 계정 관리 일을 인사팀장에게 맡기려 한다 — 새 도메인은 만들지 않는다)을 주고 가장 알맞은 방법을 고르게 한다. 정답: 인사팀 OU를 만들어 계정·컴퓨터를 그 안에 두고 OU에 정책을 연결하고 관리를 위임한다. 오답은 흔한 혼동 — 인사팀 사이트를 만든다(사이트는 네트워크 위치에 따른 구분), 인사팀 글로벌 그룹을 만들어 정책을 연결한다(그룹에는 GPO를 연결하지 않는다 — step 4 결과대로 확인), 인사팀과 트러스트를 맺는다 등. 기출 묶음(DC·RODC·OU·Site)을 쓰지 않는다. **정답 위치 0** |
| `n265` | `domain-user-accounts` | 예/아니요 「개념 확인」 — 시작 때 균형(예 52·아니요 51)에서 **아니요** 쪽으로 세운다. 예: 도메인에 새 사용자 계정을 만들기만 하면, 그 계정은 다른 설정 없이 도메인의 모든 공유 폴더를 열 수 있나요?(아니요 — 그룹과 자원의 사용 권한이 정한다, step 4 결과대로). 해설은 계정을 만든 뒤 보안 그룹에 넣고 그 그룹에 사용 권한을 준다는 차례를 가르친다. 기출 보기의 문장을 그대로 쓰지 않는다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 52·아니요 52, 정답 위치 41/40/40/40.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `windows-ad.organizational-unit` — `OrganizationalUnitDiagram`, JSON 키 `organizational-unit`

- 물음형 제목 예: `OU로 나누면 무엇을 따로 할 수 있을까?`
- 그릴 것: 도메인 `example.com`(그룹 박스) 안에 OU `영업팀`(그룹 박스 — `user01`·`PC01` 노드)과 OU `개발팀`(그룹 박스 — 노드 하나는 본문에 쓴 말로만, 없으면 OU만), 도메인 밖에 GPO `영업팀 PC 정책` 노드와 관리를 맡은 사람(이름표 — 「영업팀 관리 담당」 등 본문의 말).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `contain` | 나눠 담기 | OU 둘과 그 안의 개체 | 한 도메인 안을 OU로 나눠 계정과 컴퓨터를 담는다 |
  | `policy` | 정책 연결 | GPO·`영업팀` 안의 개체와 연결 경로(`개발팀` 쪽은 흐림) | OU에 연결한 정책은 그 OU 안의 계정과 컴퓨터에만 걸린다 |
  | `delegate` | 관리 맡기기 | 관리 담당·`영업팀`과 그 사이 경로 | OU의 관리 일을 다른 사람에게 맡길 수 있다 |

- 요점 테스트: `policy`에서 보이는 GPO 경로가 `영업팀` 그룹 박스(또는 그 안의 노드)에 닿고 `개발팀` 쪽 노드는 흐리다. `delegate`에서 보이는 경로가 관리 담당에서 `영업팀`으로만 간다. 그룹 박스는 흐려지지 않는다.

#### 3-2. `windows-ad.domain-user-accounts` — `DomainUserAccountDiagram`, JSON 키 `domain-user-account`

- 물음형 제목 예: `도메인 계정은 어떻게 만들고 어디까지 쓸 수 있을까?`
- 그릴 것: 만드는 차례 넷(① 「Active Directory 사용자 및 컴퓨터」 ② OU `영업팀` ③ 새 사용자 `user01` ④ 그룹 `Sales-Users`)을 위에서 아래로(가로형은 왼쪽에서 오른쪽으로) 잇고, 그 옆에 `user01`이 로그온하는 도메인 PC 둘(`PC01`과 본문에 쓴 다른 컴퓨터)과 `Sales-Users`에 사용 권한을 준 공유 폴더 노드.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `create` | 만들기 | 차례 넷과 그 사이 경로(번호 곁말 ①~④) | 도구에서 OU를 고르고 계정을 만든 뒤 보안 그룹에 넣는다 |
  | `logon` | 로그온 | `user01`과 도메인 PC 둘, 로그온 경로 | 도메인 계정은 도메인에 가입한 어느 컴퓨터에서나 로그온한다 |
  | `access` | 자원 접근 | `user01`·`Sales-Users`·공유 폴더와 그 경로 | 자원에 접근할 수 있는지는 그룹과 사용 권한이 정한다 |

- 요점 테스트: `create`에서 번호 곁말이 ①→④ 차례로 위에서 아래(가로형은 왼쪽에서 오른쪽)로 놓인다. `access`에서 보이는 `user01` → 공유 폴더 경로가 `Sales-Users` 노드를 거친다(바로 가는 경로가 없다).

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~7, 9~13)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 265개, 마지막 id는 `n265`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. step 4 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 메뉴 이름이 step 4가 확인한 화면 이름인가.
3. n264의 보기 넷을 하나씩 「이 방법으로 문제문의 두 조건(인사팀에만 설정, 관리 맡기기)이 되는가」로 따져 정답이 하나뿐인지 본다.
4. `phases/80-network-windows-ad-tools/index.json`의 step 5를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 9~22를 만들지 마라.** 이유: step 6~13의 범위다. 이 step의 글이 그룹 범위·`ds` 명령·암호 정책을 말해야 하면 한 줄 풀이로 그친다.
- **step 1~3의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 어긋남을 찾으면 summary에 적는다.
- **관리 위임 마법사의 차례 전체, 사이트 링크·복제 일정, 계정 속성 탭 전체를 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **step 4가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
