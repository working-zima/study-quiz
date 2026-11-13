# Step 7: reverse-round-robin

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 `dns`의 개념 둘(11 역방향 조회와 PTR 레코드, 12 DNS 라운드 로빈)의 글·문항·도식을 함께 만든다.** 둘 다 9(DNS 레코드)에 딸린 개념이다.

기출은 역방향 조회가 IP 주소로 도메인 이름을 찾는 것이라는 것과 그 레코드가 PTR이라는 것을 세 번 묻고, Windows DNS 화면의 설정 방식(같은 이름의 주소 여럿을 돌려 가며 답한다)으로 라운드 로빈을 고르게 한다(지문이 그림이다).

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 5 `summary`(역방향 조회 이름 만들기의 단계, PTR, Windows의 정방향·역방향 조회 영역, 라운드 로빈의 근거·기본값·한계, E 번호)와 step 0~6 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 79 step 5)」 줄과 RFC 1035·3596·2181·1794 항목, learn.microsoft.com DNS 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1~6이 쓴 `dns` 열 개념** — 특히 `domain-hierarchy`의 「오른쪽이 위 단계」, `resource-records`의 PTR·A 항목, 이미 푼 낱말을 다시 풀지 않는다), `src/data/network/questions.json`, `src/data/network/visuals/dns.json`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1~6이 만든 도식과 그 테스트, 선례 `ChmodChangeDiagram`(전과 뒤)·`NetstatLinuxOptionsDiagram`(조각)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-02-25 #38], [기출 2025-11-02 #33], [기출 2026-08-02 #28], [기출 2025-02-23 #36] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `dns` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `dns.reverse-lookup` | 역방향 조회와 PTR 레코드 | `dns.resource-records` | **정방향 조회**(이름 → 주소)와 **역방향 조회**(주소 → 이름)가 무엇이 다른지(4절). 계산 예를 처음부터 끝까지: `198.51.100.10` → 네 수를 거꾸로 `10.100.51.198` → `.in-addr.arpa.`를 붙여 `10.100.51.198.in-addr.arpa.` → 그 이름의 PTR 레코드 → `www.example.com.`(step 5의 단계대로, 「예시 값」). 거꾸로 적는 까닭(이름은 오른쪽이 위 단계이고, 주소는 왼쪽 수가 큰 묶음 — `domain-hierarchy`와 뜻을 맞춘다, step 5 결과대로). IPv6의 `ip6.arpa`는 한 줄. Windows DNS의 정방향 조회 영역·역방향 조회 영역(step 5 결과대로). 정방향과 역방향은 따로 적어 두는 레코드라는 것(A를 만든다고 PTR이 저절로 생기지 않는다 — step 5 결과대로). 쓰임은 근거가 있을 때만 |
| 12 | `dns.dns-round-robin` | DNS 라운드 로빈 | `dns.resource-records` | 같은 이름에 주소가 다른 A 레코드 셋 — `www.example.com`에 `198.51.100.10`·`198.51.100.11`·`198.51.100.12`(「예시 값」) — 을 두고, DNS 서버가 질의마다 답에 넣는 주소의 차례를 돌려 바꾼다(step 5 결과대로 — 실제 차례를 정하는 규칙을 지어내지 않는다). 질의 셋의 답을 차례대로 보이면 무엇이 달라지는지 — 클라이언트들이 여러 서버로 나뉘어 접속한다(클라이언트가 답의 어느 주소를 쓰는지는 근거가 있을 때만). Windows DNS 서버에서의 이름과 기본값은 step 5 결과대로. 한계는 근거가 있을 때만. 레코드 묶음 안의 차례가 표준상 뜻이 없다는 것은 step 5 결과대로 한 줄 |

### 2. 문항 — `src/data/network/questions.json`에 `n240`~`n242`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n240` | `reverse-lookup` | 4지선다 「상황 적용」(계산) — 본문과 다른 주소(예: `203.0.113.25`)의 역방향 조회에서 PTR 레코드를 찾을 이름을 고르게 한다. 정답 `25.113.0.203.in-addr.arpa`, 오답은 흔한 실수 — 네 수를 거꾸로 적지 않은 것(`203.0.113.25.in-addr.arpa`), `in-addr.arpa`를 앞에 붙인 것, 두 수씩만 뒤집은 것. 문항 글에 백틱을 쓰지 않는다. **정답 위치 3** |
| `n241` | `reverse-lookup` | 예/아니요 「오해 바로잡기」 — 시작 때 균형(예 46·아니요 46)에서 **아니요** 쪽으로 세운다. 예: 정방향 조회 영역에 어떤 이름의 A 레코드를 만들기만 하면, 그 주소로 역방향 조회를 했을 때도 따로 적은 것 없이 그 이름을 찾을 수 있는가(아니요 — PTR을 따로 둔다. step 5의 근거가 있을 때만 이 주장으로 세운다 — 없으면 다른 주장으로). 해설은 PTR이 어디에 놓이는지 가르친다 |
| `n242` | `dns-round-robin` | 예/아니요 「원리 이해」 — n241 뒤 균형(예 46·아니요 47)에서 **예** 쪽으로 세운다. 예: 같은 이름에 주소가 다른 A 레코드 둘을 두고 라운드 로빈을 쓰면, 그 이름을 묻는 클라이언트들이 같은 주소 하나로만 몰리지 않고 두 서버로 나뉘어 접속하게 되는가(예 — step 5 근거대로). 기출 보기 묶음(Round Robin·Cache Plugin·Cache Server·Azure AutoScaling)을 쓰지 않는다. 해설은 차례를 돌려 바꾸는 것과 한계(근거가 있을 때)를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 47·아니요 47, 정답 위치 37/37/37/37.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `dns.reverse-lookup` — `ReverseNameDiagram`, JSON 키 `reverse-name`

- 물음형 제목 예: `IP 주소로 이름을 찾을 때는 무엇을 물을까?`
- 그릴 것: 본문 계산 예의 단계를 위에서 아래로 노드 줄로 — 주소 `198.51.100.10` → 거꾸로 적은 `10.100.51.198` → `10.100.51.198.in-addr.arpa.` → PTR → `www.example.com.`. 정방향 조회(A: `www.example.com` → `198.51.100.10`)를 견줄 노드 줄 하나를 함께 둔다. 긴 이름은 줄이지 말고 한 줄 전체 폭의 노드로 둔다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `forward` | 정방향 | A 줄 | 이름으로 주소를 찾는 것이 정방향 조회다 |
  | `reverse-name` | 이름 만들기 | 주소 → 거꾸로 → `in-addr.arpa` 이름 | 주소의 네 수를 거꾸로 적고 `in-addr.arpa`를 붙인다 |
  | `ptr` | PTR | `in-addr.arpa` 이름 → PTR → 호스트 이름 | 그 이름의 PTR 레코드가 호스트 이름을 알려 준다 |

- 요점 테스트: 거꾸로 적은 노드의 네 수가 원래 주소의 네 수를 거꾸로 늘어놓은 것과 같다(테스트에서 문자열로 견준다). `in-addr.arpa` 이름 노드가 그 거꾸로 적은 수로 시작한다. `forward`에서 PTR 노드가 흐리다.

#### 3-2. `dns.dns-round-robin` — `RoundRobinAnswersDiagram`, JSON 키 `round-robin-answers`

- 물음형 제목 예: `같은 이름을 물을 때마다 답이 어떻게 바뀔까?`
- 그릴 것: DNS 서버 하나(안에 `www.example.com`의 A 레코드 셋 — 그룹 박스)와 질의 셋(질의 1·2·3 — 이름표)의 답. 답마다 주소 셋을 차례대로 적은 노드 줄(맨 앞 주소가 질의마다 다르게 — 본문의 차례대로), 그리고 그 답을 받은 클라이언트가 접속하는 웹 서버(본문에 쓴 만큼).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `first` | 질의 1 | 질의 1의 답 줄 | 첫 질의에는 이 차례로 답한다 |
  | `second` | 질의 2 | 질의 2의 답 줄 | 다음 질의에는 차례를 돌려 다른 주소가 앞에 온다 |
  | `third` | 질의 3 | 질의 3의 답 줄 | 질의마다 앞에 오는 주소가 바뀌어 접속이 여러 서버로 나뉜다 |

- 요점 테스트: 세 답 줄의 맨 앞 주소가 서로 다르다. 세 답 줄에 든 주소의 집합이 모두 같다(레코드는 그대로이고 차례만 바뀐다). 시나리오마다 다른 답 줄은 다른 id를 다른 자리에 둔다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 242개, 마지막 id는 `n242`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 5 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가(특히 라운드 로빈의 차례 규칙과 한계).
3. 본문과 n240의 주소 뒤집기를 손으로 한 수씩 다시 하고, 오답 셋이 정말 틀린지 따진다.
4. `phases/79-network-dns-linux-servers/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~10과 13~14를 만들거나 고치지 마라.** 이유: 다른 step의 범위다. 앞 개념에 고칠 것을 찾으면 summary에 적는다.
- **부하 분산 장비(L4 스위치·로드 밸런서)와 견주지 마라.** 이유: phase 82(`network-devices`)의 주제다.
- **IPv6 역방향 이름을 니블 단위로 풀어 보이지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」). `ip6.arpa`라는 이름과 한 줄까지만.
- **step 5가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
