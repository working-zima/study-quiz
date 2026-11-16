# Step 2: ad-ds-domain-controller

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다. 전체 계획·결정·공통 규칙은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
**이 step은 `windows-ad`의 개념 둘(3 Active Directory 도메인 서비스, 4 도메인 컨트롤러)의 글·문항·도식을 만든다.** 4는 3에 딸린 개념이다.
step 1이 쓴 로컬 계정의 한계(계정이 그 컴퓨터에만 쓰인다)에서 이어, 여러 컴퓨터의 계정을 한곳에서 관리하는 까닭을 세운다.

기출은 Windows Server 2022에서 Active Directory의 주요 역할로 「사용자 인증과 디렉터리 기반의 자원 관리」를 고르게 한다 — 오답은 IP 주소 자동 할당, DNS 동적 업데이트를 기본으로 막기, 방화벽 규칙 자동 구성이다([기출 2026-05-17 #43]).
도메인 컨트롤러와 읽기 전용 도메인 컨트롤러는 「부서로 나누려면 무엇을 설정하나」([기출 2025-02-23 #42])의 오답 보기로 나온다.

## 읽어야 할 파일

- **`phases/80-network-windows-ad-tools/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/80-network-windows-ad-tools/index.json`의 step 0 `summary`(AD DS·디렉터리·워크그룹과 도메인·DNS와의 관계, 도메인 컨트롤러·복제·RODC, E 번호, 한국어 이름)와 step 1 `summary`(「앞 개념에 고칠 것」, 문항 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 80 step 0)」 줄과 항목, phase 74의 DHCP 항목, phase 79의 DNS 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1이 쓴 `windows-ad` 두 개념** — 이미 푼 낱말(운영 체제·Windows Server·서버·계정·로그온·권한·그룹·자원)을 다시 풀지 않는다, `ip-address-types.dhcp`·`dns.dns`의 말 — 뜻을 맞춘다),
  `src/data/network/questions.json`, `src/data/network/visuals/windows-ad.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1이 만든 도식(`LocalUserAccountsDiagram`·`BuiltinLocalGroupsDiagram`)과 그 테스트, 선례 `ThreeWayHandshakeDiagram`(두 장치 사이 차례)·`NamedFilesDiagram`과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2026-05-17 #43], [기출 2025-02-23 #42] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-ad` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `windows-ad.active-directory` | Active Directory 도메인 서비스 | — | 로컬 계정의 한계에서 시작한다 — 컴퓨터가 많으면 계정을 컴퓨터마다 만들고 고쳐야 한다(**워크그룹** — step 0 결과대로, 근거가 없으면 「컴퓨터마다 따로 관리하는 방식」으로 말하고 이름을 붙이지 않는다). **디렉터리**(사용자·컴퓨터·그룹·공유 폴더·프린터 같은 것의 정보를 모아 둔 데이터베이스 — **데이터베이스**는 한 줄로 푼다)와 **AD DS**(Active Directory Domain Services — 그 디렉터리를 저장하고 쓰게 해 주는 Windows Server의 역할). 하는 일 둘 — **인증**(로그온할 때 계정 이름과 암호가 맞는지 확인)과 디렉터리 정보에 따라 누가 무엇을 쓸 수 있는지 관리하는 것(step 0 결과대로). **도메인**(AD DS가 한 디렉터리로 관리하는 사용자·컴퓨터의 묶음 — 뜻만 한 줄)과, 도메인에 가입한 PC에서는 어느 PC에서나 같은 계정으로 로그온한다는 것. AD DS를 실행하는 서버를 도메인 컨트롤러라 부른다는 한 줄(자세한 것은 딸린 개념의 몫이라는 말은 쓰지 않는다). 하는 일을 정확히 쓰는 것으로 가르친다 — IP 주소를 자동으로 나눠 주는 일은 **DHCP** 서버, 이름을 IP 주소로 바꾸는 일은 **DNS** 서버의 일이다(둘 다 한 줄로 푼다 — `ip-address-types.dhcp`·`dns.dns`와 뜻을 맞춘다). 서버 관리자에서 역할로 설치한다는 것, AD DS가 DNS로 도메인 컨트롤러를 찾는다는 것(step 0 결과대로 한 줄씩). **워크그룹과 도메인이 무엇이 다른지**(4절 — 계정이 어디에 있고 누가 확인하는지). 예: 도메인 `example.com`에 가입한 `PC01`에서 `user01`로 로그온하면 도메인이 계정을 확인한다(「예시 값」 — `example.com`은 문서의 예로 남겨 둔 이름이라고 처음 쓸 때 밝힌다) |
| 4 | `windows-ad.domain-controller` | 도메인 컨트롤러 | `windows-ad.active-directory` | **도메인 컨트롤러**(DC — AD DS 역할을 설치해 그 도메인의 디렉터리 데이터베이스를 갖고 로그온을 확인하는 서버, step 0 결과대로). 한 도메인에 DC를 둘 이상 두면 한쪽에서 바뀐 내용이 다른 DC로 **복제**(같은 데이터를 다른 곳에 옮겨 똑같이 맞추는 것 — 한 줄)되어 같은 데이터를 갖는다 → 한 대가 멈춰도 다른 DC가 로그온을 확인한다(근거대로). 어느 DC에서나 고칠 수 있는지는 step 0 결과대로 한 줄. **읽기 전용 도메인 컨트롤러**(RODC — 데이터베이스를 읽기만 하고 다른 DC에서 한 방향으로만 복제받는 DC, 물리 보안이 약한 곳에 둔다 — step 0 결과대로 한 줄). DC에서는 「로컬 사용자 및 그룹」으로 계정을 관리하지 않는다는 것(step 0 결과대로 한 줄 — 첫 개념의 말과 뜻을 맞춘다). 예: `example.com`의 DC `DC01`·`DC02` — `DC01`에서 `user01`의 암호를 바꾸면 그 바뀐 내용이 `DC02`로 복제된다(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n259`~`n260`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n259` | `active-directory` | 4지선다 「상황 적용」 — 본문과 다른 장면(예: 직원 40명이 자리를 자주 옮겨 PC 40대 가운데 아무 PC에서나 자기 계정으로 로그온해야 하고, 퇴사자의 계정은 한 번에 막아야 한다)을 주고 가장 알맞은 방법을 고르게 한다 — 보기는 기능 이름이 아니라 「어디에 계정을 두고 누가 확인하는지」로(정답: 도메인을 만들어 계정을 AD DS에 두고 도메인 컨트롤러가 로그온을 확인하게 한다. 오답은 같은 범주의 헷갈리는 방법 — 모든 PC에 같은 이름의 로컬 계정을 따로 만든다, DHCP 서버가 PC에 주소를 나눠 줄 때 계정도 함께 나눠 준다, DNS 서버에 계정마다 레코드를 둔다 등 — 오답이 출처로 정말 그 일을 못 하는지 따진다). 기출 묶음(IP 자동 할당·인증과 자원 관리·DNS 동적 업데이트 차단·방화벽 규칙 자동 구성)을 쓰지 않는다. **정답 위치 1** |
| `n260` | `domain-controller` | 예/아니요 「원인과 결과」 — **예** 쪽으로 세운다. 예: 도메인 컨트롤러가 두 대인 도메인에서 한 대가 고장으로 멈추면, 사용자는 남은 한 대를 통해 계속 도메인에 로그온할 수 있나요?(예 — 복제로 같은 데이터를 갖는다, step 0 결과대로). 해설은 복제와 DC를 둘 이상 두는 까닭, RODC가 무엇이 다른지 한 줄을 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 51·아니요 51, 정답 위치 40/40/39/39.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `windows-ad.active-directory` — `ActiveDirectoryAuthDiagram`, JSON 키 `active-directory-auth`

- 물음형 제목 예: `로그온할 때 계정은 누가 확인할까?`
- 그릴 것: PC 둘(`PC01`과 다른 PC — 이름은 본문에 쓴 것만)과 각 PC 안의 로컬 계정 노드(워크그룹일 때), 그리고 AD DS(디렉터리)를 가진 도메인 컨트롤러 노드(도메인일 때). 로그온 확인 경로는 시나리오마다 다르다. 직교 경로만.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `workgroup` | 워크그룹 | 두 PC와 각 PC 안의 계정 | 계정이 PC마다 따로 있고, 각 PC가 자기 계정을 확인한다 |
  | `domain` | 도메인 | 두 PC·도메인 컨트롤러·디렉터리의 `user01` | 어느 PC에서 로그온하든 도메인 컨트롤러가 디렉터리의 같은 계정으로 확인한다 |

  워크그룹이라는 이름의 근거가 step 0에 없으면 시나리오 이름을 본문의 말(예: 「컴퓨터마다 관리」)로 바꾼다.
- 요점 테스트: `workgroup`에서 선명한 계정 노드가 PC마다 하나씩 둘이고 도메인 컨트롤러는 흐리다. `domain`에서 보이는 로그온 확인 경로 둘이 모두 같은 도메인 컨트롤러 노드에 닿는다.

#### 3-2. `windows-ad.domain-controller` — `DomainControllerReplicationDiagram`, JSON 키 `dc-replication`

- 물음형 제목 예: `도메인 컨트롤러 한 대가 멈추면 로그온은 어떻게 될까?`
- 그릴 것: `DC01`·`DC02`(각각 디렉터리 데이터베이스를 가진 노드), 둘 사이의 복제 경로, 로그온하는 `PC01`. RODC를 본문에 썼으면 RODC 노드와 그쪽으로만 들어가는 한 방향 복제 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `replicate` | 복제 | `DC01`·`DC02`와 복제 경로 | 한쪽에서 바뀐 내용이 다른 도메인 컨트롤러로 복제된다 |
  | `failover` | 한 대가 멈출 때 | `PC01`·`DC02`와 그 사이 경로(`DC01`은 흐리고 곁말 「멈춤」) | 한 대가 멈춰도 같은 데이터를 가진 다른 도메인 컨트롤러가 로그온을 확인한다 |
  | `rodc` | 읽기 전용 | RODC와 그쪽으로 들어오는 복제 경로 | 읽기 전용 도메인 컨트롤러는 한 방향으로 복제받기만 한다 |

  RODC를 본문에 쓰지 않았으면 `rodc` 시나리오와 그 노드를 뺀다.
- 요점 테스트: `failover`에서 보이는 로그온 경로가 `DC02`에 닿고 `DC01`에는 닿지 않으며 `DC01`은 흐리다. `rodc`에서 RODC 노드에서 나가는 복제 경로가 없다(들어오는 것만 보인다). 색으로 멈춤을 가르지 않는다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~7, 9~13)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 260개, 마지막 id는 `n260`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. Kerberos 같은 인증 프로토콜 이름을 쓰지 않았는가.
3. n259의 보기 넷을 하나씩 「이 방법으로 문제문의 두 조건(아무 PC에서나 같은 계정, 퇴사자 한 번에 막기)이 되는가」로 따져 정답이 하나뿐인지 본다.
4. `phases/80-network-windows-ad-tools/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 5~22를 만들지 마라.** 이유: step 3~13의 범위다. 이 step의 글이 포리스트·OU·그룹 정책을 말해야 하면 한 줄 풀이로 그친다.
- **step 1의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 어긋남을 찾으면 summary에 적는다.
- **Kerberos·NTLM·FSMO·글로벌 카탈로그·복제 토폴로지를 쓰지 마라.** 이유: guide.md 「배경」 — 기출이 묻지 않는다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
