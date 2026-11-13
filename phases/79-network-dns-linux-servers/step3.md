# Step 3: zone-resolution

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 `dns`의 개념 둘(5 영역과 주 서버·보조 서버, 6 이름 풀이 과정)의 글·문항·도식을 함께 만든다.** 5는 4(네임 서버의 종류)에 딸린 개념이고, 6은 머리 개념이다.

영역과 영역 전송은 강의 밖이지만 기출의 SOA 문항(「Refresh는 주 서버와 보조 서버의 동기 주기」 — [기출 2024-11-03 #43])과 BIND 문항(보조 서버의 영역 파일 동기화 — [기출 2024-05-19 #40]·[기출 2026-02-01 #30])이 이것을 전제한다.
이름 풀이 과정은 강의 p344–p347과 면접 Q27(I11로 고침)이 다룬다.

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 0 `summary`(용어 표, 영역 전송의 근거, 이름 풀이의 차례 ①~⑥, 수정 이력·E 번호)와 step 1·2 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch5-1 DNS」 절과 수정 이력, `docs/source/network/interview-facts.md`의 Q27과 I11, `docs/source/network/standards.md`(「(phase 79 step 0)」 줄과 RFC 1034·5936·9499, Windows DNS 영역 항목), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p344~p346 — 원문(옮기지 않는다). p346은 렌더해서 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1·2가 쓴 `dns` 네 개념** — 이미 푼 낱말을 다시 풀지 않는다), `src/data/network/questions.json`, `src/data/network/visuals/dns.json`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1·2가 만든 도식과 그 테스트, 선례 `ThreeWayHandshakeDiagram`(두 장치 사이 차례), `ArpHopsDiagram`(여러 장치를 차례로)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-11-03 #43] — 영역 전송의 전제만 본다(SOA 필드는 step 6의 몫). 문장을 옮기지 않는다

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `dns` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `dns.dns-zone` | 영역과 주 서버·보조 서버 | `dns.name-servers` | **영역**과 도메인이 무엇이 다른지(4절 — 도메인은 이름 나무의 한 갈래, 영역은 한 서버 묶음이 원본으로 맡는 범위. 아래 일부를 떼어 다른 서버에 맡기면 그 부분은 다른 영역이 된다 — step 0 결과대로). **영역 파일**(영역의 레코드를 적은 파일 — 레코드는 「이름과 그 이름에 딸린 정보 한 줄」로 한 줄 풀이). **주 서버**와 **보조 서버**가 무엇이 다른지(4절 — 원본을 고치는 쪽과 복사해 와서 똑같이 답하는 쪽), 옛 이름 master·slave와 Windows DNS의 이름은 step 0 결과대로 한 줄. **영역 전송** — 보조 서버가 정해진 간격으로 주 서버의 영역 판 번호(SOA의 일련번호 — 한 줄 풀이)를 물어 견주고, 커졌으면 영역 데이터를 TCP로 받아 온다(step 0 결과대로). NOTIFY는 근거대로 한 줄. 둘 이상 두는 까닭(step 0 결과대로). 예: `example.com` 영역, 주 서버 `ns1.example.com`, 보조 서버 `ns2.example.com` — 주 서버에서 레코드 하나를 고치고 판 번호를 올린 뒤 보조 서버가 받아 오기까지(「예시 값」 — 판 번호의 수는 예시 값이라고 밝힌다) |
| 6 | `dns.name-resolution` | 이름 풀이 과정 | — | step 0 summary의 차례 ①~⑥을 따라 클라이언트 `192.0.2.10`이 `www.example.com`의 주소 `198.51.100.10`을 얻는 과정을 차례대로 쓴다(「예시 값」 — 로컬 DNS 서버 `192.0.2.53`). 누가 누구에게 묻고 무엇을 돌려받는지 — 루트·TLD 서버는 주소 대신 다음에 물을 서버를 알려 준다(I11 — 차례로 묻고 다니는 쪽은 로컬 DNS 서버다). **질의**와 **응답**을 한 줄씩 푼다. 로컬 DNS 서버가 받은 답을 캐시에 넣어 다음 질의에 바로 답한다는 것(TTL이라는 말이 필요하면 한 줄 풀이). 재귀적·반복적이라는 이름은 이 개념에서 쓰지 않아도 된다 — 쓰면 한 줄 풀이로 그친다. 강의 p346의 호스트 이름은 옮기지 않는다 |

### 2. 문항 — `src/data/network/questions.json`에 `n231`~`n232`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n231` | `dns-zone` | 예/아니요 「원인과 결과」 — 시작 때 균형(예 43·아니요 44)에서 **예** 쪽으로 세운다. 예: 주 서버에서 영역의 레코드를 고쳤는데 판 번호(일련번호)를 올리지 않았다면, 보조 서버는 고친 내용을 받아 오지 않고 옛 데이터로 계속 답하는가(예 — step 0 결과대로 근거가 있을 때만. 없으면 다른 주장으로 세운다). 문항의 영역 이름은 본문과 다르게(`example.org`). 해설은 보조 서버가 판 번호를 견주어 받아 오는 차례와 영역 전송이 TCP로 오간다는 것을 가르친다 |
| `n232` | `name-resolution` | 4지선다 「원리 이해」 — 캐시가 비어 있는 로컬 DNS 서버가 `www.example.net` 같은 이름을 처음 풀 때의 장면(예: 루트 네임 서버에 물은 바로 뒤)을 주고, 루트 네임 서버가 돌려주는 것을 고르게 한다. 정답 「`net`을 맡은 TLD 네임 서버가 어디 있는지」, 오답은 같은 범주(루트가 돌려줄 법한 것으로 헷갈리는 것 — 그 이름의 IP 주소, 권한 있는 네임 서버의 주소, 루트가 TLD 서버에 대신 물어 받은 최종 답). **정답 위치 3** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 44·아니요 44, 정답 위치 36/36/36/36.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `dns.dns-zone` — `ZoneTransferDiagram`, JSON 키 `zone-transfer`

- 물음형 제목 예: `보조 서버는 언제 주 서버의 영역을 받아 올까?`
- 그릴 것: 두 기둥 — 왼쪽 보조 서버 `ns2.example.com`, 오른쪽 주 서버 `ns1.example.com`(안에 「영역 파일」·판 번호 — 그룹 박스나 곁말) — 사이에 본문의 차례를 위에서 아래로: 보조 서버가 판 번호를 묻는다 → 주 서버가 판 번호를 답한다 → (커졌으면) 영역 전송(TCP). 메시지 하나가 노드 하나, 방향은 노드 양옆의 짧은 화살표.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `same` | 그대로 | 판 번호 묻기와 답(같은 번호) | 판 번호가 같으면 받아 오지 않고 가진 데이터로 답한다 |
  | `changed` | 바뀜 | 판 번호 묻기와 답(커진 번호), 영역 전송 | 판 번호가 커졌으면 영역 데이터를 TCP로 받아 온다 |

- 요점 테스트: `same`에서 영역 전송 노드와 그 경로가 흐리거나 보이지 않고 `changed`에서 보인다. 영역 전송 노드는 주 서버 쪽에서 보조 서버 쪽으로 가는 화살표를 갖는다. 영역 전송의 라벨이나 곁말에 TCP가 있다. 시나리오마다 판 번호 노드는 다른 id를 다른 자리에 둔다.

#### 3-2. `dns.name-resolution` — `ResolutionStepsDiagram`, JSON 키 `resolution-steps`

- 물음형 제목 예: `이름 하나의 주소는 어떤 차례로 찾을까?`
- 그릴 것: 왼쪽에 클라이언트와 로컬 DNS 서버(위아래), 오른쪽에 루트 네임 서버 · `com` TLD 네임 서버 · `example.com`의 권한 있는 네임 서버(위에서 아래로). 본문 차례의 질의·응답을 번호 곁말(①②…)을 단 직교 경로로 잇는다. 280 폭에서 경로가 겹치면 시나리오로 나눠 한 번에 보이는 경로를 줄인다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `ask-local` | 로컬에 묻기 | 클라이언트·로컬 DNS 서버와 그 사이 질의 | 클라이언트는 로컬 DNS 서버 하나에 묻는다 |
  | `referral` | 다음 서버 안내 | 로컬 DNS 서버·루트·TLD와 그 질의·응답 | 루트와 TLD 서버는 주소 대신 다음에 물을 서버를 알려 준다 |
  | `answer` | 최종 답 | 로컬 DNS 서버·권한 있는 서버·클라이언트와 그 질의·응답 | 권한 있는 서버의 답을 로컬 DNS 서버가 캐시에 넣고 클라이언트에 돌려준다 |

- 요점 테스트: 클라이언트 노드에서 나가거나 들어오는 경로는 모두 로컬 DNS 서버와 잇는다(클라이언트가 루트·TLD·권한 있는 서버와 직접 잇지 않는다). `referral`에서 보이는 응답 곁말에 주소 `198.51.100.10`이 없다. 번호 곁말의 차례가 본문의 차례와 같다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 232개, 마지막 id는 `n232`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 이름 풀이의 차례가 step 0 summary·RFC 1034와 같은가, I11의 처리(묻고 다니는 쪽은 로컬 DNS 서버)를 지켰는가.
3. n231의 주장이 step 0이 확인한 영역 전송의 차례로 정해지는지, n232의 오답 셋이 정말 틀린지 따진다.
4. `phases/79-network-dns-linux-servers/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~4와 7~14를 만들거나 고치지 마라.** 이유: 다른 step의 범위다.
- **SOA의 필드를 늘어놓지 마라.** 이유: step 6(`soa-record`)의 개념이다. 영역 전송에 필요한 판 번호와 간격을 한 줄로 풀고 그친다.
- **재귀적·반복적 질의를 견주어 가르치지 마라.** 이유: step 4(`recursive-iterative-query`)의 개념이다. 이 step은 차례만 쓴다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
