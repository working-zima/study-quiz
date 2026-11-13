# Step 2: hierarchy-name-servers

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 `dns`의 개념 둘(3 도메인 이름의 계층 구조, 4 네임 서버의 종류)의 글·문항·도식을 함께 만든다.** 둘 다 머리 개념이다.

기출은 DNS가 계층적인 이름을 쓰고 이름 안에 하위 도메인을 둘 수 있다는 것, 호스트 이름에 `@`·`#` 같은 특수 문자를 쓰지 않는다는 것을 묻는다([기출 2025-05-25 #17]).
네임 서버의 종류는 기출이 따로 묻지 않지만, 이름 풀이·재귀적 질의·영역(뒤 개념들과 기출의 SOA·BIND 문항)이 모두 이 구분 위에 선다.

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 0 `summary`(용어 표, 호스트 이름 규칙의 판정, 루트 서버 13개의 근거, 수정 이력·E 번호)와 step 1 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch5-1 DNS」 절과 수정 이력(step 0이 더한 것), `docs/source/network/standards.md`(「(phase 79 step 0)」 줄과 RFC 1034·1035·1123·2181·9499 항목), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p336~p345 — 원문(옮기지 않는다). p338–p342·p344는 렌더해서 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1이 쓴 `dns` 두 개념** — 이미 푼 낱말을 다시 풀지 않는다, `ip-address-types.dhcp`의 DNS 서버 문단), `src/data/network/questions.json`, `src/data/network/visuals/dns.json`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1이 만든 도식과 그 테스트, 선례 `DirectoryTreeDiagram`(나무)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-05-25 #17] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `dns` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `dns.domain-hierarchy` | 도메인 이름의 계층 구조 | — | 점으로 나눈 **레이블**, 맨 위의 **루트**, **최상위 도메인**(TLD), 그 아래 단계들 — 이름은 오른쪽이 위 단계다. 예: `www.example.com`을 오른쪽부터 루트 → `com` → `example` → `www`로 한 단계씩 읽는다(「예시 값」). **서브 도메인**(p343 — 예 `www.example.com`·`mail.example.com`), **FQDN**(끝의 점까지 — step 0 결과대로). **이름 규칙**은 step 0의 판정대로 — 호스트 이름의 레이블에 쓰는 문자(영문자·숫자·하이픈)와 길이 한도, 대소문자. 「DNS 이름 일반은 더 넓다」를 쓸지는 step 0 결과대로. 강의 p342의 표기와 p341의 처음 TLD 목록은 옮기지 않는다 |
| 4 | `dns.name-servers` | 네임 서버의 종류 | — | **목록 개념** — 소개 문단에서 **네임 서버**(도메인 이름의 정보를 갖고 질의에 답하는 서버 — step 1이 쓴 「DNS 서버」와 같은 것이라고 밝힌다)를 풀고, 항목 넷: 루트 네임 서버, TLD 네임 서버, 권한 있는 네임 서버, 로컬 DNS 서버(이름과 영문 이름·다른 이름은 step 0의 용어 표대로 — 「글」의 항목 이름 규칙 (1)). 항목마다 무엇을 맡고 무엇을 돌려주는지 한 줄씩. 루트 서버의 이름 13개는 step 0 결과대로(강의 p338–p339의 지도는 옮기지 않는다). 로컬 DNS 서버의 주소를 정하는 방법(p345 — 사람이 직접 적거나 자동으로 받는다, DHCP와 뜻을 맞춘다). 항목 뒤 문단: **층을 맡는 셋과 대신 찾아 주는 로컬 DNS 서버가 무엇이 다른지**(4절), 위 층이 아래 층을 맡은 서버를 알려 주는 위임(한 줄 — step 0 결과대로). 예는 `www.example.com`의 층마다 어느 서버가 맡는지(「예시 값」 — 실제 서버 주소는 쓰지 않는다) |

### 2. 문항 — `src/data/network/questions.json`에 `n229`~`n230`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n229` | `domain-hierarchy` | 예/아니요 「오해 바로잡기」 — 시작 때 균형(예 43·아니요 43)에서 **아니요** 쪽으로 세운다. 예: 이름 `api.dev.example.net`에서 가장 위 단계(루트 바로 아래)는 맨 왼쪽의 `api`인가(아니요 — 오른쪽이 위 단계, 최상위 도메인은 `net`). 또는 step 0의 이름 규칙 판정이 분명하면 그것으로 세워도 된다(기출의 `@`·`#` 보기 꼴을 그대로 쓰지 않는다). 해설은 오른쪽부터 읽는 차례와 서브 도메인을 가르친다 |
| `n230` | `name-servers` | 4지선다 「개념 비교」 — 이름 풀이 도중의 한 장면(예: 어떤 서버가 `example.org`의 주소는 모르지만 `org`를 맡은 서버가 어디 있는지 알려 주었다)을 주고 그 서버가 무엇인지 고르게 한다. 정답 루트 네임 서버, 오답은 같은 범주의 서버 셋(TLD 네임 서버, 권한 있는 네임 서버, 로컬 DNS 서버). 장면이 정답 하나로만 정해지는지 따진다. **정답 위치 2** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 43·아니요 44, 정답 위치 36/36/36/35.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `dns.domain-hierarchy` — `DomainTreeDiagram`, JSON 키 `domain-tree`

- 물음형 제목 예: `도메인 이름은 어느 쪽부터 읽어야 할까?`
- 그릴 것: 나무 — 맨 위 루트(라벨은 본문이 쓴 말 — 예: 「루트」), 그 아래 TLD `com`(곁가지로 `net`·`org`는 280 폭에 들 때만), 그 아래 `example`, 그 아래 `www`·`mail` 두 가지. 오른쪽 또는 아래에 이름 `www.example.com`을 레이블 단위로 나눈 노드 줄을 두고, 레이블과 나무의 층을 곁말(층의 이름 — 최상위 도메인 등)로 잇는다. 직교 경로만.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `read` | 읽는 차례 | 루트 → `com` → `example` → `www`의 갈래 | 이름은 오른쪽 레이블이 위 단계라 오른쪽부터 읽는다 |
  | `tld` | 최상위 도메인 | 루트와 `com`(과 그린 곁가지 TLD) | 루트 바로 아래 층이 최상위 도메인이다 |
  | `subdomain` | 서브 도메인 | `example`과 그 아래 `www`·`mail` | `example.com` 아래에 딸린 이름은 그 서브 도메인이다 |

- 요점 테스트: 나무 노드의 위아래 차례가 루트 → `com` → `example` → `www`다. `read`에서 `mail` 노드가 흐리다. 경로는 모두 위에서 아래로 내려가는 직교 경로다.

#### 3-2. `dns.name-servers` — `NameServerRolesDiagram`, JSON 키 `name-server-roles`

- 물음형 제목 예: `네임 서버는 저마다 무엇을 맡을까?`
- 그릴 것: 두 묶음(그룹 박스) — 「이름의 층을 나눠 맡는 서버」 안에 루트 네임 서버 · `com` TLD 네임 서버 · `example.com`의 권한 있는 네임 서버를 위에서 아래로, 「대신 찾아 주는 서버」 안에 로컬 DNS 서버와 그 위의 클라이언트. 서버마다 곁말로 맡는 것(돌려주는 것)을 본문의 말로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `root` | 루트 | 루트 네임 서버 | 각 최상위 도메인을 맡은 서버가 어디 있는지 알려 준다 |
  | `tld` | TLD | `com` TLD 네임 서버 | 그 아래 도메인을 맡은 서버를 알려 준다 |
  | `authoritative` | 권한 있는 서버 | 권한 있는 네임 서버 | 그 도메인의 정보를 원본으로 갖고 최종 답을 준다 |
  | `local` | 로컬 DNS 서버 | 클라이언트와 로컬 DNS 서버 | 어느 층도 맡지 않고 클라이언트 대신 찾아 준다 |

- 요점 테스트: `local`에서 선명한 노드에 층을 맡는 세 서버가 없다. 층을 맡는 세 서버의 위아래 차례가 루트 → TLD → 권한 있는 서버다. 그룹 박스 둘은 어느 시나리오에서도 흐려지지 않는다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 230개, 마지막 id는 `n230`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 0 summary가 「쓰지 않는다」·「자격시험은」·L번호로 정한 것을 지켰는가(특히 루트 서버의 수, 로컬 DNS 서버라는 말).
3. n229의 이름을 오른쪽부터 한 레이블씩 다시 읽어 정답을 따지고, n230의 장면이 정답 하나로만 정해지는지 따진다.
4. `phases/79-network-dns-linux-servers/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1·2와 5~14를 만들거나 고치지 마라.** 이유: 다른 step의 범위다. 이 step의 글이 영역·이름 풀이 차례를 쓸 때는 이름과 한 줄 풀이로 그친다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
- **실제 루트 서버·TLD 서버의 이름·주소·운영 기관을 늘어놓지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」). 이름 13개라는 사실은 step 0 결과대로 한 줄까지만.
