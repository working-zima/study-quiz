# Step 6: records-soa

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 `dns`의 개념 둘(9 DNS 레코드, 10 SOA 레코드)의 글·문항·도식을 함께 만든다.** 9는 머리 개념, 10은 9에 딸린 개념이다.

기출은 레코드를 여러 번 묻는다 — CNAME이 별칭이라는 것(3회, 「서브 도메인을 등록하는 것」은 틀린 말), NS를 「메일 라우팅 정보」로 설명한 것이 틀렸다는 것(메일은 MX),
SOA가 영역 파일의 맨 앞에 오고 Refresh가 주 서버와 보조 서버의 동기 주기라는 것, SOA의 책임자 칸에 메일 주소를 `@` 꼴로 적는다는 것이 틀렸다는 것(4회). 여러 문항이 Windows Server DNS 화면 문맥이다.

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 5 `summary`(레코드 유형 표, 레코드 한 줄과 SOA의 꼴, SOA 필드 표와 예시 수, Windows 메뉴·필드 이름, 수정 이력·E 번호)와 step 0~4 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch5-1 DNS」 절과 수정 이력(L15와 step 0·5가 더한 것), `docs/source/network/standards.md`(「(phase 79 step 5)」 줄과 RFC 1034·1035·2308·3596 항목, learn.microsoft.com DNS 항목), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p348~p350 — 원문(옮기지 않는다). 렌더해서 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1~4가 쓴 `dns` 여덟 개념** — 특히 `dns-zone`의 영역·주 서버·보조 서버·판 번호와 `dns-cache-ttl`의 TTL, 이미 푼 낱말을 다시 풀지 않는다, `app-protocols-mail-file.email-delivery`의 MX 문단 — 뜻을 맞춘다),
  `src/data/network/questions.json`, `src/data/network/visuals/dns.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1~4가 만든 도식과 그 테스트, 선례 `FstabFieldsDiagram`·`PasswdFieldsDiagram`(줄의 칸)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-11-03 #29·#43], [기출 2025-02-23 #29], [기출 2025-05-25 #30], [기출 2025-08-24 #39], [기출 2026-02-01 #7·#40], [기출 2026-05-17 #37] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `dns` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `dns.resource-records` | DNS 레코드 | — | **목록 개념** — 소개 문단에서 **자원 레코드**와 그 칸(이름·TTL·클래스·유형·데이터)을 풀고, 예 줄 `www.example.com. 3600 IN A 198.51.100.10`을 칸마다 읽는다(step 5의 꼴대로, 「예시 값」 — TTL은 `dns-cache-ttl`과 뜻을 맞춘 한 줄). 항목(유형) 여덟: A, AAAA, CNAME, MX, NS, PTR, SOA, TXT — 항목마다 데이터가 무엇이고 무엇에 쓰는지 한 줄(「글」의 항목 이름 규칙 (1) — `- **CNAME**(풀어 쓴 이름)은 …`. 풀어 쓴 이름은 step 5의 표에 근거가 있을 때만). CNAME 항목에는 예 `mail.example.com`이 다른 이름을 가리키는 꼴을 (본문의 예시 값 안에서) 한 줄로, NS는 L15대로 **서버의 이름**, MX는 우선순위와 서버의 이름(`mail.example.com` — `app-protocols-mail-file`과 뜻을 맞춘다). 항목 뒤 문단: **NS와 MX가 무엇이 다른지**(4절), **CNAME은 서브 도메인을 만드는 것이 아니라 이미 있는 이름에 다른 이름을 붙이는 것**(서브 도메인 이름에도 A 레코드를 둘 수 있다 — step 5 결과대로), CNAME이 있는 이름에 다른 레코드를 둘 수 없다는 규칙(step 5 결과대로 한 줄), Windows DNS 관리자의 메뉴 이름 짝(step 5 결과대로 한 줄 — 한국어 이름을 확인하지 못했으면 영문 이름으로) |
| 10 | `dns.soa-record` | SOA 레코드 | `dns.resource-records` | **목록 개념** — 소개 문단: 영역 파일의 맨 앞에 영역마다 하나 오고 그 영역의 권한 정보를 담는다(L15·step 5 결과대로 — 영역·주 서버·보조 서버는 `dns-zone`의 말과 뜻을 맞춘다). 예 SOA를 보인다(step 5의 꼴과 예시 수 — `example.com`, `ns1.example.com.`, `hostmaster.example.com.`). 항목(필드) 일곱: MNAME, RNAME, SERIAL, REFRESH, RETRY, EXPIRE, MINIMUM — 항목마다 뜻과 단위(step 5의 표대로). RNAME은 메일 주소를 `@` 대신 점으로 적는다는 것을 예 `hostmaster.example.com.` → `hostmaster@example.com`으로 한 단계씩. MINIMUM의 뜻이 바뀐 것은 step 5 결과대로. 항목 뒤 문단: **REFRESH·RETRY·EXPIRE가 보조 서버의 일정이라는 것**(4절 — 판 번호를 언제 견주고, 못 견주면 언제 다시 해 보고, 언제 답하기를 멈추는지), 판 번호를 올리지 않고 고치면 보조 서버가 모른다는 것(`dns-zone`과 같은 사실 — 되풀이를 줄여 한 줄로), 「TTL이 길면 서버가 받는 질의가 늘어난다」는 거꾸로라는 것(`dns-cache-ttl`과 뜻을 맞춘다), Windows DNS 화면의 필드 이름 짝(step 5 결과대로 한 줄 — 「책임자」 칸도 점 꼴로 적는다는 것은 근거대로) |

### 2. 문항 — `src/data/network/questions.json`에 `n236`~`n239`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n236` | `resource-records` | 4지선다 「상황 적용」 — 본문과 다른 도메인(예: `example.org`)에서 할 일 하나를 주고 어느 유형의 레코드를 더해야 하는지 고르게 한다(예: 「`shop.example.org`라는 이름으로도 이미 있는 `www.example.org`와 같은 서버에 닿게 하고 싶다」 → CNAME, 또는 「이 도메인 앞으로 온 메일을 받을 서버를 알리고 싶다」 → MX). 오답은 같은 범주의 유형 셋(헷갈리는 것 — A·NS·PTR 등). 기출 묶음(Windows 레코드 짝 넷, 레코드 추가 넷)을 쓰지 않는다 — 보기는 레코드 이름이 아니라 「더할 레코드 한 줄」로 세워도 된다. **정답 위치 1** |
| `n237` | `resource-records` | 예/아니요 「오해 바로잡기」 — 시작 때 균형(예 45·아니요 45)에서 **아니요** 쪽으로 세운다. 예: 어떤 도메인 앞으로 온 메일을 어느 서버가 받는지는 그 도메인의 NS 레코드가 알려 주는가(아니요 — MX. NS는 권한 있는 네임 서버의 이름). 또는 CNAME으로 서브 도메인을 만든다는 오해. 해설은 맞는 레코드와 그 데이터를 가르친다 |
| `n238` | `soa-record` | 4지선다 「원리 이해」 — 본문과 다른 예시 수의 SOA(예: 영역 `example.net`)에서 한 필드를 고르게 하거나, 한 장면(예: 보조 서버가 주 서버에 닿지 못한 채 시간이 흘렀다)을 주고 어느 필드의 시간이 지나면 보조 서버가 그 영역에 답하기를 멈추는지 고르게 한다. 정답 EXPIRE 꼴, 오답은 같은 범주의 필드 셋(REFRESH·RETRY·MINIMUM). 기출 SOA 묶음(일련번호·주 서버·책임자·새로 고침, 영역 파일의 시작·기본 자료·Refresh·TTL 부하)을 쓰지 않는다. **정답 위치 2** |
| `n239` | `soa-record` | 예/아니요 「상황 적용」 — n238 뒤 균형(예 45·아니요 46)에서 **예** 쪽으로 세운다. 예: SOA의 책임자 칸에 `admin.example.net.`이 적혀 있으면 이 영역의 책임자에게 보낼 메일 주소는 `admin@example.net`인가(예 — RNAME 꼴). 이름 부분에 점이 있는 주소는 쓰지 않는다(판정이 복잡해진다). 해설은 RNAME 꼴과 MNAME과의 차이를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 46·아니요 46, 정답 위치 37/37/37/36.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `dns.resource-records` — `RecordTypesDiagram`, JSON 키 `record-types`

- 물음형 제목 예: `레코드마다 이름에 무엇을 짝지어 둘까?`
- 그릴 것: 본문에 쓴 예 레코드 여러 줄을 「이름 → 유형 → 데이터」 꼴의 노드 줄로 — 적어도 A(`www.example.com` → `198.51.100.10`), CNAME(본문의 별칭 예), MX(`example.com` → `mail.example.com`), NS(`example.com` → `ns1.example.com`). 280 폭에 한 줄에 셋이 들지 않으면 「유형: 데이터」 노드를 이름 노드 아래에 둔다. CNAME이 가리키는 정식 이름이 A 줄의 이름과 같으면 그 둘을 경로로 잇는다(본문에 그 예가 있을 때만).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `address` | 주소 | A(와 그렸으면 AAAA) 줄 | 이름에 IP 주소를 짝지어 둔다 |
  | `alias` | 별칭 | CNAME 줄(과 이어진 A 줄) | 별칭은 다른 이름을 가리키고, 주소는 그 이름의 레코드에서 얻는다 |
  | `mail-ns` | 메일과 네임 서버 | MX 줄과 NS 줄 | 메일을 받을 서버는 MX, 영역을 맡은 네임 서버는 NS가 알린다 |

- 요점 테스트: `alias`에서 선명한 CNAME 줄의 데이터 노드에 IP 주소가 없다. `mail-ns`에서 MX 줄의 데이터와 NS 줄의 데이터가 서로 다른 이름이다. 유형 라벨이 본문의 유형 이름과 같다.

#### 3-2. `dns.soa-record` — `SoaFieldsDiagram`, JSON 키 `soa-fields`

- 물음형 제목 예: `SOA 레코드의 칸은 각각 무엇을 정할까?`
- 그릴 것: 본문의 예 SOA를 「필드 이름: 값」 노드 줄 일곱으로 위에서 아래로(MNAME부터 MINIMUM까지 — 값은 본문의 예시 수). RNAME 줄 옆에 메일 주소 꼴(`hostmaster@example.com`)을 곁말이나 노드로. 보조 서버가 쓰는 세 필드(REFRESH·RETRY·EXPIRE)를 그룹 박스로 묶는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `who` | 서버와 책임자 | MNAME·RNAME 줄과 메일 주소 꼴 | 주 서버의 이름과 책임자의 메일 주소를 적는다 — `@` 자리에 점 |
  | `version` | 판 번호 | SERIAL 줄 | 영역을 고칠 때마다 올리고, 보조 서버가 이 번호를 견준다 |
  | `secondary` | 보조 서버의 일정 | REFRESH·RETRY·EXPIRE 줄 | 언제 견주고, 실패하면 언제 다시 하고, 언제 답하기를 멈추는지 정한다 |

- 요점 테스트: 필드 노드의 위아래 차례가 MNAME → RNAME → SERIAL → REFRESH → RETRY → EXPIRE → MINIMUM이다. `secondary`에서 선명한 노드가 정확히 REFRESH·RETRY·EXPIRE 셋이다. RNAME 값 노드에 `@`가 없고 메일 주소 꼴 노드나 곁말에 `@`가 있다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 239개, 마지막 id는 `n239`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. L15를 지켰는가(NS는 이름, SOA는 관리자 정보만이 아니다), step 5 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가.
3. n236·n238의 장면이 정답 하나로만 정해지는지, 오답 셋이 정말 틀린지 따진다. n239의 RNAME 변환을 손으로 다시 한다.
4. `phases/79-network-dns-linux-servers/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~8과 11~14를 만들거나 고치지 마라.** 이유: 다른 step의 범위다. 이 step의 글이 PTR·역방향 조회를 쓸 때는 이름과 한 줄 풀이로 그친다.
- **기출이 묻지 않는 레코드 유형(SRV·CAA·DNSSEC 레코드 등)을 항목으로 더하지 마라.** 이유: ADR-059 「범위」. 목록은 위 여덟이다.
- **step 5가 확인하지 못한 사실(Windows 메뉴의 한국어 이름 포함)을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
