# Step 4: query-modes-ttl

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 `dns`의 개념 둘(7 재귀적 질의와 반복적 질의, 8 DNS 캐시와 TTL)의 글·문항·도식을 함께 만든다.** 둘 다 6(이름 풀이 과정)에 딸린 개념이다.

기출은 TTL을 네 번 묻는다 — 캐시에서 만료되기까지의 시간이라는 것, TTL을 짧게 잡으면 질의가 늘어 서버에 부하가 되고 길게 잡으면 바뀐 주소가 늦게 반영된다는 것.
재귀적 질의는 지문이 빠진 문항 하나([기출 2024-02-25 #42])가 정답으로 둔다. 강의 p347 그림의 처리는 step 0이 정했다.

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 0 `summary`(재귀적·반복적 질의의 정의와 RD·RA 비트, **p347 그림의 처리(L번호)**, TTL의 근거와 짧고 긴 TTL의 대가, E 번호)와 step 1~3 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch5-1 DNS」 절과 수정 이력(step 0이 더한 것), `docs/source/network/interview-facts.md`의 Q27과 I11, `docs/source/network/standards.md`(「(phase 79 step 0)」 줄과 RFC 1034·1035·2181 항목), `docs/source/network/exam-notes.md`(step 0이 더한 E 항목)
- `docs/source/network/raw/lecture.md`의 p346~p347·p351 — 원문(옮기지 않는다). 렌더해서 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1~3이 쓴 `dns` 여섯 개념**, `ip-protocol`의 IP TTL 풀이와 `diagnostic-commands.ipconfig-options`의 DNS 캐시 문단 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/visuals/dns.json`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1~3이 만든 도식과 그 테스트(특히 `ResolutionStepsDiagram` — 같은 장치 배치를 맞춘다), 선례 `TtlCountdownDiagram`(IP TTL — 이름이 겹치지 않게 다르게 그린다)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-02-25 #5·#42], [기출 2025-11-02 #11], [기출 2026-02-01 #44], [기출 2026-05-17 #2] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `dns` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `dns.recursive-iterative-query` | 재귀적 질의와 반복적 질의 | `dns.name-resolution` | **목록 개념으로 써도 된다**(항목 둘 — 「글」의 항목 이름 규칙 (1)). **재귀적 질의**(물은 서버가 끝까지 찾아 최종 답이나 오류를 돌려준다 — 묻는 쪽이 재귀를 청하는 표시를 하고, 해 줄지는 서버가 정한다 — I11)와 **반복적 질의**(물은 서버가 아는 만큼만 답하고 모르면 더 가까운 서버를 알려 준다 — 묻는 쪽이 차례로 다시 묻는다). 영문 이름과 RFC의 말은 step 0의 용어 표대로. 앞 개념의 차례에 겹쳐 — 클라이언트 → 로컬 DNS 서버는 재귀적, 로컬 DNS 서버 → 루트·TLD·권한 있는 서버는 반복적(step 0 결과대로). **무엇이 다른지**(4절 — 누가 차례로 묻고 다니는지, 물은 서버가 무엇을 돌려주는지). **강의 p347 그림의 처리는 step 0의 L 판정대로** — 근거가 있으면 수정 이력대로 한정해 쓰고, 근거를 찾지 못했으면 재귀적 질의를 정의대로만 쓰고 루트·TLD 서버가 다음 서버에 대신 묻는 사슬을 쓰지도 그리지도 않는다 |
| 8 | `dns.dns-cache-ttl` | DNS 캐시와 TTL | `dns.name-resolution` | **DNS 캐시**(로컬 DNS 서버와 클라이언트가 받은 레코드를 정해진 시간 저장해 두는 것 — p351)와 **TTL**(레코드마다 붙은, 캐시에 둘 수 있는 초 수 — step 0 결과대로). 계산 예를 처음부터 끝까지: TTL `3600`인 `www.example.com`의 레코드가 캐시에 들어오고, `1800`초 뒤 남은 TTL은 `3600 − 1800 = 1800`, `3600`초가 지나면 버리고 다음 질의 때 다시 묻는다(「예시 값」 — 캐시에서 꺼낸 TTL이 줄어 보인다는 근거는 step 0 결과대로). Windows의 `ipconfig /displaydns`가 캐시의 이름·유형·TTL을 보여 준다는 것(p351 — 화면 꼴을 지어 보이지 않는다, `diagnostic-commands.ipconfig-options`와 뜻을 맞춘다). **TTL을 짧게·길게 잡으면 무엇이 달라지는지**(4절 — step 0 결과대로). **IP 헤더의 TTL과 무엇이 다른지**(4절 — 한 줄). 기출 오답 「TTL을 정하지 않으면 정방향 조회를 못 한다」는 본문에 쓰지 않아도 된다 — step 0이 E 항목을 만들었으면 그대로 따른다 |

### 2. 문항 — `src/data/network/questions.json`에 `n233`~`n235`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n233` | `recursive-iterative-query` | 예/아니요 「오해 바로잡기」 — 시작 때 균형(예 44·아니요 44)에서 **아니요** 쪽으로 세운다. 예: 로컬 DNS 서버가 루트 네임 서버에 반복적 질의를 보내면 루트 네임 서버가 TLD 서버에 대신 물어 최종 주소를 받아다 주는가(아니요 — 다음에 물을 서버를 알려 줄 뿐, 묻고 다니는 쪽은 로컬 DNS 서버. 면접 Q27 메모의 형식). 문제문의 이름은 본문과 다르게. 해설은 두 방식의 차이와 보통의 쓰임을 가르친다 |
| `n234` | `dns-cache-ttl` | 4지선다 「상황 적용」(계산) — 본문과 다른 TTL의 레코드(예: TTL `600`)가 로컬 DNS 서버의 캐시에 들어온 지 몇 초 뒤(예: `240`초)의 상황을 주고, 그때 남은 TTL이나 그 레코드로 무엇이 일어나는지 고르게 한다. 정답 하나(`360`초 남아 캐시에서 답한다 꼴), 오답은 흔한 실수 — 지난 시간을 남은 시간으로 읽은 값, 처음 TTL 그대로, 이미 만료돼 다시 묻는다. **정답 위치 0** |
| `n235` | `dns-cache-ttl` | 예/아니요 「원인과 결과」 — n234 뒤 균형(예 44·아니요 45)에서 **예** 쪽으로 세운다. 예: 웹 서버의 주소를 옮기기 전에 그 이름의 레코드 TTL을 짧게 줄여 두면, 주소를 바꾼 뒤 옛 주소로 접속하는 클라이언트가 줄어드는 시간이 짧아지는가(예 — step 0의 근거대로). 기출 TTL 묶음(짧으면 부하·정하지 않으면 불가·캐싱 주기·길면 갱신 늦음)의 문장을 옮기지 않는다. 해설은 짧은 TTL의 대가(질의가 늘어난다)까지 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 45·아니요 45, 정답 위치 37/36/36/36.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `dns.recursive-iterative-query` — `QueryModesDiagram`, JSON 키 `query-modes`

- 물음형 제목 예: `물은 서버가 끝까지 찾아 줄까, 다음 서버를 알려 줄까?`
- 그릴 것: `ResolutionStepsDiagram`과 같은 장치 배치(클라이언트·로컬 DNS 서버 / 루트·TLD·권한 있는 서버)를 쓰되, 질의 하나와 그 응답이 무엇인지에 초점을 둔다. 재귀적 질의(클라이언트 → 로컬 DNS 서버, 돌아오는 것은 최종 주소)와 반복적 질의(로컬 DNS 서버 → 루트, 돌아오는 것은 다음 서버 안내)를 경로와 곁말로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `recursive` | 재귀적 | 클라이언트·로컬 DNS 서버와 그 질의·응답 | 물은 서버가 끝까지 찾아 최종 주소를 돌려준다 |
  | `iterative` | 반복적 | 로컬 DNS 서버·루트·TLD·권한 있는 서버와 그 질의·응답 | 물은 서버는 다음 서버를 알려 주고 묻는 쪽이 차례로 다시 묻는다 |

- 요점 테스트: `iterative`에서 루트 노드와 TLD 노드를 직접 잇는 경로가 없다(루트가 TLD에 대신 묻지 않는다). `recursive`에서 보이는 응답 곁말에 최종 주소가 있고, `iterative`에서 루트가 돌려주는 곁말에는 주소가 없다. 클라이언트와 루트를 직접 잇는 경로가 없다.

#### 3-2. `dns.dns-cache-ttl` — `CacheExpiryDiagram`, JSON 키 `cache-expiry`

- 물음형 제목 예: `캐시에 든 DNS 답은 언제까지 쓸까?`
- 그릴 것: 시간 줄(위에서 아래 또는 왼쪽에서 오른쪽) 위의 세 시점 — 캐시에 들어온 때(남은 TTL `3600`), `1800`초 뒤(남은 TTL `1800` — 캐시에서 답한다), `3600`초 뒤(남은 TTL 0 — 버리고 다시 묻는다). 시점마다 노드 하나와 곁말. 본문 계산 예의 값만 쓴다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `stored` | 저장 | 들어온 때의 노드 | 답을 받으면 TTL과 함께 캐시에 넣는다 |
  | `half` | 1800초 뒤 | 1800초 뒤의 노드 | 남은 TTL이 있는 동안은 다시 묻지 않고 캐시에서 답한다 |
  | `expired` | 만료 | 3600초 뒤의 노드와 다시 묻는 경로 | TTL이 다 지나면 버리고 다음 질의 때 다시 묻는다 |

- 요점 테스트: 노드의 남은 TTL 값이 시간 차례대로 `3600` → `1800` → 만료이고, 줄어든 값이 본문 계산과 같다. 다시 묻는 경로는 `expired`에서만 보인다. 라벨·곁말에 IP TTL을 뜻하는 말(라우터·홉)이 없다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 235개, 마지막 id는 `n235`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. p347 그림의 처리와 I11을 지켰는가, TTL 사실이 step 0 summary의 근거와 같은가.
3. n234의 계산을 손으로 다시 하고 오답 셋이 정말 틀렸는지 따진다. n233·n235의 주장이 근거로 정해지는지 따진다.
4. `phases/79-network-dns-linux-servers/index.json`의 step 4를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~6과 9~14를 만들거나 고치지 마라.** 이유: 다른 step의 범위다. 앞 개념에 고칠 것을 찾으면 summary에 적는다.
- **수정 이력에 걸린 p347 그림의 사슬을 그대로 가르치거나 그리지 마라.** 이유: ADR-055. step 0의 처리를 따른다.
- **부정 응답의 캐시(SOA의 MINIMUM)를 쓰지 마라.** 이유: step 6(`soa-record`)의 개념이다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
