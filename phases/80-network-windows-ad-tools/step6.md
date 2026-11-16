# Step 6: ds-commands-group-scopes

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다. 전체 계획·결정·공통 규칙은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
**이 step은 `windows-ad`의 개념 둘(9 ds 명령, 10 그룹 종류와 범위)의 글·문항·도식을 만든다.** 9는 8(도메인 사용자 계정)에 딸린 개념이고, 10은 머리 개념이다.

기출은 Windows Server 2022의 Active Directory에서 도메인 사용자 계정을 만들고 고치고 지울 때 쓰는 명령이 아닌 것으로 `net user`를 고르게 하고(맞는 쪽 `dsadd`·`dsmod`·`dsrm` — [기출 2025-08-24 #38]),
그림 지문이 설명하는 Active Directory 그룹으로 유니버설 그룹을 고르게 한다(오답 글로벌·도메인 로컬·로컬 — [기출 2026-02-01 #43], 지문이 추출본에 없다).

## 읽어야 할 파일

- **`phases/80-network-windows-ad-tools/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/80-network-windows-ad-tools/index.json`의 step 4 `summary`(`ds` 명령 표·DN의 꼴·`dsadd user`의 꼴·`net user`와 `/domain`의 판정, 그룹 종류와 범위, E 번호, 한국어 이름)와 step 5 `summary`의 「앞 개념에 고칠 것」·문항 균형
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 80 step 4)」 줄과 항목), `docs/source/network/exam-notes.md`(step 4가 더한 항목 — 특히 `net user`)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1~5가 쓴 `windows-ad` 여덟 개념** — 특히 `local-accounts`의 `net user`, `local-groups`의 로컬 그룹, `domain-tree-forest`의 포리스트, `domain-user-accounts`의 보안 그룹 — 뜻을 맞춘다),
  `src/data/network/questions.json`, `src/data/network/visuals/windows-ad.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1~5가 만든 도식과 그 테스트, 선례 `NetstatLinuxOptionsDiagram`·`IptablesChainsDiagram`(명령 줄의 조각)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-08-24 #38], [기출 2026-02-01 #43] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-ad` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `windows-ad.ds-commands` | ds 명령 | `windows-ad.domain-user-accounts` | **목록 개념**. 소개 문단 — AD DS의 개체(사용자·그룹·컴퓨터·OU 등 — **개체**는 한 줄로 푼다)를 명령 프롬프트에서 다루는 명령 묶음이라는 것(**명령 프롬프트**는 한 줄로 푼다, step 4 결과대로). 항목(「글」의 항목 이름 규칙 (2) — `- **개체 추가**(`dsadd`)는 …`): 개체 추가(`dsadd`), 개체 속성 바꾸기(`dsmod`), 개체 지우기(`dsrm`), 개체 찾기(`dsquery`), 개체 속성 보기(`dsget`), 개체 옮기기·이름 바꾸기(`dsmove`) — 하는 일은 step 4의 표대로. 항목 뒤 문단: 이 명령들은 개체를 **고유 이름**(DN — Distinguished Name)으로 가리킨다 — `CN=user01,OU=영업팀,DC=example,DC=com`을 조각마다 읽는다(`CN=` 개체 이름, `OU=` 담긴 OU, `DC=` 도메인 이름의 조각 — 꼴과 조각 이름은 step 4 결과대로, 「예시 값」). 예 한 줄 — `user01`을 만드는 `dsadd user` 줄(꼴은 step 4 결과대로)과 그 줄이 하는 일. **`net user`와 무엇이 다른지**(4절 — step 4의 판정대로. 「자격시험은 ~로 본다」 줄이 필요하면 E 번호의 처리대로). 지금 권하는 다른 도구(PowerShell의 AD 모듈)는 step 4 결과대로 한 줄 |
| 10 | `windows-ad.group-scopes` | 그룹 종류와 범위 | — | 도메인의 그룹을 두 축으로 나눈다는 것(step 4 결과대로). **종류** — 보안 그룹(사용 권한을 줄 수 있다)과 배포 그룹(메일을 여러 사람에게 보내는 목록 — 사용 권한에 쓸 수 없다). **범위** — 「누구를 구성원으로 넣을 수 있는지」와 「그 그룹을 어디의 사용 권한에 쓸 수 있는지」를 범위마다 한 문장씩(표로 보이지 않는다 — guide.md 6행 「다룰 것」): 도메인 로컬, 글로벌, 유니버설(step 4 결과대로). 유니버설 그룹의 구성원 목록이 포리스트 전체에서 쓰이도록 복제된다는 것은 step 4 결과대로 한 줄(글로벌 카탈로그의 동작은 쓰지 않는다). **로컬 그룹(한 컴퓨터의 그룹 — 「기본 로컬 그룹」)과 도메인 로컬 그룹이 무엇이 다른지**, **보안 그룹과 배포 그룹**, **글로벌과 유니버설**(4절). 예: 글로벌 그룹 `Sales-Users`에 `example.com`의 영업팀 계정을 넣고, 도메인 로컬 그룹 `Sales-Share-Read`에 공유 폴더 읽기 사용 권한을 준 뒤 `Sales-Users`를 `Sales-Share-Read`에 넣는다 — 이 쓰임은 step 4가 근거를 찾았을 때만 쓰고, 없으면 그룹 하나씩의 예로 바꾼다. 포리스트의 여러 도메인 계정을 함께 묶는 유니버설 그룹 `All-Sales`(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n266`~`n267`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n266` | `ds-commands` | 4지선다 「상황 적용」 — 본문과 다른 장면(예: 도메인의 계정 `user07`을 OU `인사팀`에서 OU `총무팀`으로 옮겨야 한다, 또는 `user07`의 속성(설명·전화번호 등 — step 4가 확인한 속성만)을 확인만 하고 바꾸지는 않는다)을 주고 알맞은 명령을 고르게 한다. **기출 묶음(`dsadd`·`dsmod`·`dsrm`·`net user`)과 같은 넷이 되지 않게** 정답을 `dsmove`나 `dsget`처럼 고르고, 오답은 같은 범주의 헷갈리는 `ds` 명령에서 고른다(넷 가운데 둘 이상이 기출 묶음과 다르게). `net user`는 판정이 갈리는 보기라 쓰지 않는다(step 4의 E 처리를 따른다). **정답 위치 1** |
| `n267` | `group-scopes` | 4지선다 「개념 비교」 — 본문과 다른 장면(예: 한 포리스트의 `example.org`와 `hr.example.org` 두 도메인 계정을 한 그룹에 함께 넣고, 그 그룹을 두 도메인 어디의 자원 사용 권한에도 쓰고 싶다)을 주고 알맞은 그룹을 고르게 한다. **보기는 범위 이름만 넷으로 두지 않는다** — 기출 묶음(글로벌·유니버설·도메인 로컬·로컬)과 겹치므로, 보기를 「종류 + 범위」(예: 보안 그룹 · 유니버설 / 배포 그룹 · 유니버설 / 보안 그룹 · 글로벌 / 보안 그룹 · 도메인 로컬)로 바꾸거나 「이 그룹에 넣을 수 있는 구성원」 같은 설명으로 바꾼다. 오답마다 step 4 결과로 왜 조건에 맞지 않는지 따진다(배포 그룹은 사용 권한에 쓸 수 없다, 글로벌은 같은 도메인 구성원만 등). **정답 위치 2** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 52·아니요 52, 정답 위치 41/41/41/40.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `windows-ad.ds-commands` — `DsCommandsDiagram`, JSON 키 `ds-commands`

- 물음형 제목 예: `ds 명령은 어느 개체를 어떻게 가리킬까?`
- 그릴 것: 위쪽에 DN `CN=user01,OU=영업팀,DC=example,DC=com`을 조각 노드 넷(`CN=user01`·`OU=영업팀`·`DC=example`·`DC=com` — 나눔이 본문의 설명과 같을 때만)으로 빈틈없이 잇고, 아래쪽에 명령 노드 여섯(`dsadd`·`dsmod`·`dsrm`·`dsquery`·`dsget`·`dsmove`)과 각 명령이 하는 일(본문 항목의 한국어 이름)을 짝지어 둔다. 280 폭에서 한 줄에 노드 넷 이상을 두지 않는다 — 명령은 두 열로 쌓는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `dn` | 고유 이름 | DN 조각 넷 | 개체를 이름·담긴 OU·도메인 조각으로 가리킨다 |
  | `change` | 만들고 바꾸고 지우기 | `dsadd`·`dsmod`·`dsrm`과 그 일 | 개체를 더하고 속성을 바꾸고 지운다 |
  | `look` | 찾고 보기 | `dsquery`·`dsget`과 그 일 | 개체를 찾고 속성을 본다 — 바꾸지 않는다 |

  `dsmove`는 본문에 쓴 만큼 `change`에 넣거나 따로 둔다.
- 요점 테스트: DN 조각 노드의 왼쪽→오른쪽(세로형은 위→아래) 차례대로 라벨을 쉼표로 이어 붙이면 본문의 DN 문자열이 된다. `look`에서 선명한 명령 노드에 `dsadd`·`dsmod`·`dsrm`이 없다.

#### 3-2. `windows-ad.group-scopes` — `GroupScopesDiagram`, JSON 키 `group-scopes`

- 물음형 제목 예: `그룹 범위에 따라 누구를 넣고 어디에 쓸 수 있을까?`
- 그릴 것: 포리스트 안의 두 도메인(본문에 쓴 이름 — 예: `example.com`·`sales.example.com`, 그룹 박스)과 그 안의 계정 이름표, 그룹 노드 셋(도메인 로컬·글로벌·유니버설 — 본문의 예 이름 `Sales-Share-Read`·`Sales-Users`·`All-Sales`), 자원 노드. 「넣을 수 있는 구성원」 경로(계정 → 그룹)와 「쓸 수 있는 곳」 경로(그룹 → 자원)를 시나리오마다 보인다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `domain-local` | 도메인 로컬 | 도메인 로컬 그룹과 그 구성원·자원 경로 | 본문이 쓴 도메인 로컬의 규칙(넣을 수 있는 구성원 / 쓸 수 있는 곳) |
  | `global` | 글로벌 | 글로벌 그룹과 같은 도메인의 계정·자원 경로 | 같은 도메인의 계정만 넣고 포리스트 어디의 자원에나 쓴다(step 4 결과대로) |
  | `universal` | 유니버설 | 유니버설 그룹과 두 도메인의 계정·자원 경로 | 포리스트의 어느 도메인 계정이든 넣고 어디의 자원에나 쓴다(step 4 결과대로) |

- 요점 테스트: `global`에서 보이는 계정 → 그룹 경로가 모두 한 도메인 그룹 박스 안에서 시작한다. `universal`에서 보이는 계정 → 그룹 경로가 두 도메인 모두에서 시작한다. 시나리오마다 선명한 그룹 노드가 하나이고 서로 다르다.

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~7, 9~13)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 267개, 마지막 id는 `n267`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. step 4 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 명령 줄과 DN의 꼴이 출처의 꼴과 같은가(문장을 옮기지 않고).
3. n266·n267의 보기 넷을 step 4 결과로 하나씩 따져 정답이 하나뿐인지 보고, 기출 묶음과 넷 가운데 둘 이상이 다른지 본다.
4. `phases/80-network-windows-ad-tools/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 11~22를 만들지 마라.** 이유: step 7~13의 범위다.
- **step 1~5의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 어긋남을 찾으면 summary에 적는다.
- **`ds` 명령의 옵션 전체, PowerShell AD 모듈의 cmdlet 목록, 글로벌 카탈로그의 동작, 범위 바꾸기 규칙 전체를 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **step 4가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
