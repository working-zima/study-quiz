# Step 1: dns-hosts

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 주제 `dns`를 만들고 그 첫 개념 둘(1 DNS, 2 hosts 파일)의 글·문항·도식을 함께 만든다.** 2는 1에 딸린 개념이다.

기출은 이름과 주소의 짝을 적어 두는 파일로 `/etc/hosts`를 세 번 고르게 하고(셋 다 지문이 빠졌다), DNS가 분산 데이터베이스이고 계층적인 이름을 쓰게 하는 서비스라는 것, DNS가 보안 장비가 아니라는 것을 묻는다.

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 0 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지, 용어 표, 수정 이력·E 번호)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch5-1 DNS」 절과 수정 이력(L11·L15와 step 0이 더한 것), `docs/source/network/standards.md`(「(phase 79 step 0)」 줄과 RFC 1034 항목, hosts(5)·nsswitch.conf(5) 항목), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p330~p335 — 원문(옮기지 않는다). p334·p335는 렌더해서 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `ports.well-known-ports`의 DNS 항목, `ip-address-types.dhcp`의 DNS 서버 문단, `diagnostic-commands.ipconfig-options`의 DNS 캐시 문단 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `ThreeWayHandshakeDiagram`·`SmtpDialogueDiagram`(두 장치 사이 차례), `MailPathDiagram`(길과 구간), `FstabFieldsDiagram`(줄의 칸)과 그 테스트, `src/data/network/visuals/tcp-connection.json`·`app-protocols-mail-file.json`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-02-23 #15], [기출 2025-05-25 #17], [기출 2024-05-19 #17], [기출 2024-11-03 #17], [기출 2026-02-01 #1] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`tcp-connection` 주제 객체 바로 뒤(`app-protocols-mail-file` 앞)에 주제 객체를 더한다 — `{ "id": "dns", "title": "DNS", "importance": 3, "sourcePages": [328, 351], "concepts": [ … ] }`.
`importance`가 3(★★★, 출제 10/11회)인지 `data.test.ts`의 주제 지도 표와 견준다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `dns.dns` | DNS (Domain Name System) | — | 이 주제의 첫 개념이라 **호스트**(네트워크에 이어진 컴퓨터나 장치), **IP 주소**(네트워크에서 호스트를 가리키는 숫자 주소), **클라이언트와 서버**(묻는 쪽과 답하는 쪽), **프로토콜**(주고받는 방법을 정한 약속)을 짧게 푼다(`ports`·`ip-address-types`의 말과 뜻을 맞춘다). 숫자 주소는 외우기 어렵고 바뀔 수 있어(p330–p332) 사람이 읽기 쉬운 **도메인 이름**과 짝지어 찾아 주는 시스템이 필요하다는 데서 시작한다. 웹 브라우저가 `www.example.com`의 주소를 DNS에 물어 `198.51.100.10`을 받고, 그 주소로 웹 서버에 접속하는 차례(「예시 값」 — 예로 붙인 이름·주소라고 밝힌다). 이름을 주소로 바꾸는 일의 이름과 분산 데이터베이스라는 것은 step 0 결과대로. DNS가 이름을 찾아 줄 뿐 통신을 막거나 거르지 않는다는 것은 하는 일을 정확히 쓰는 것으로 가르친다. 강의의 전화번호부 비유를 쓰면 무엇이 다른지 밝힌다 |
| 2 | `dns.hosts-file` | hosts 파일 | `dns.dns` | 이름과 주소의 짝을 컴퓨터 안의 글자 파일에 적어 두는 것. 위치(Linux·Unix `/etc/hosts`, Windows — p334), 한 줄의 꼴과 예 `192.0.2.20 server1.example.com server1`을 칸마다 읽는다(step 0 결과대로 — 「예시 값」). 이 컴퓨터가 `server1`을 쓸 때 DNS 서버에 묻지 않고 파일의 짝을 쓴다는 차례, Linux에서 그 차례를 정하는 `/etc/nsswitch.conf`(step 0 결과대로 한 줄). **hosts 파일과 DNS가 무엇이 다른지**(4절 — 한 컴퓨터만 보는 짝과 여러 서버가 나눠 갖는 이름, 고칠 때 누가 무엇을 고치는지). 한계(p335). 강의 p335의 주소·이름은 옮기지 않는다 |

### 2. 문항 — `src/data/network/questions.json`에 `n226`~`n228`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n226` | `dns` | 4지선다 「원인과 결과」 — 본문과 다른 이름의 상황(예: 사무실 PC가 `www.example.org`에 접속하려는데 그 이름에 해당하는 주소를 얻지 못했다)을 주고, 무엇이 되지 않는지 고르게 한다. 정답은 「이름으로 상대를 찾지 못해 접속을 시작하지 못한다」 꼴. 오답은 같은 범주(이름을 찾지 못했을 때의 결과로 헷갈리는 것 — 이름 없이도 자동으로 주소를 찾는다, 들어오는 연결이 막힌다(DNS를 보안 장비로 본 오해), 주소를 알아도 접속하지 못한다). 기출 묶음(DNS 역할 보기, DNS 설명 넷)을 쓰지 않는다. **정답 위치 0** |
| `n227` | `hosts-file` | 예/아니요 「오해 바로잡기」 — 시작 때 균형(예 42·아니요 43)에서 **예** 쪽으로 세운다. 예: Linux PC의 `/etc/hosts`에 어떤 이름의 짝을 적어 두면, DNS 서버가 그 이름에 다른 주소를 갖고 있어도 이 PC는 파일의 주소로 접속하는가(예 — `hosts: files dns` 차례일 때. 차례의 조건을 문제문에 준다 — step 0 결과대로). 문제문이 답의 이유를 알려 주지 않게 한다. 해설은 hosts 파일을 먼저 보는 차례와 그 한계를 가르친다 |
| `n228` | `hosts-file` | 4지선다 「상황 적용」 — 이 PC에서만 `server2`라는 이름으로 문서용 주소(예: `192.0.2.30`)의 서버에 접속하고 싶을 때 `/etc/hosts`에 적을 줄을 고르게 한다(정답 줄 하나, 오답은 흔한 실수 — 이름과 주소의 차례를 바꾼 줄, 주소 자리에 이름을 둘 적은 줄 등. 오답이 hosts(5)의 꼴로도 정말 틀렸는지 따진다). 파일 이름을 고르는 기출 묶음과 다르게, 줄의 꼴을 묻는다. **정답 위치 1** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 43·아니요 43, 정답 위치 36/36/35/35.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

이 step이 `src/data/network/visuals/dns.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'dns': dnsVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」 — `'tcp-connection'` 바로 뒤).

#### 3-1. `dns.dns` — `NameToAddressDiagram`, JSON 키 `name-to-address`

- 물음형 제목 예: `이름만 아는 웹 서버에 어떻게 접속할까?`
- 그릴 것: 장치 셋 — 웹 브라우저(클라이언트), DNS 서버, 웹 서버(`198.51.100.10`) — 와 본문의 차례: 웹 브라우저가 DNS 서버에 `www.example.com`의 주소를 묻는다 → DNS 서버가 `198.51.100.10`을 답한다 → 웹 브라우저가 그 주소로 웹 서버에 접속한다. 질의·응답·접속을 경로 셋과 곁말로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `ask` | 묻기 | 웹 브라우저·DNS 서버와 질의 경로 | 이름을 들고 DNS 서버에 그 이름의 주소를 묻는다 |
  | `answer` | 답 | DNS 서버·웹 브라우저와 응답 경로 | DNS 서버가 이름에 짝지어진 주소를 돌려준다 |
  | `connect` | 접속 | 웹 브라우저·웹 서버와 접속 경로 | 접속은 이름이 아니라 받은 주소로 한다 |

- 요점 테스트: `connect`에서 보이는 경로는 웹 브라우저와 웹 서버를 잇고 DNS 서버는 흐리다. `answer`에서 보이는 곁말에 `198.51.100.10`이 있다. 웹 서버 노드 라벨에 주소가 있다.

#### 3-2. `dns.hosts-file` — `HostsFileDiagram`, JSON 키 `hosts-file`

- 물음형 제목 예: `hosts 파일에 적어 둔 이름은 어디서 주소를 찾을까?`
- 그릴 것: hosts 파일의 예 줄 하나를 칸(주소 `192.0.2.20` · 정식 이름 `server1.example.com` · 별명 `server1`)으로 나눈 노드 줄, 그리고 이름을 푸는 차례 — 「hosts 파일 보기」 → (파일에 없으면) 「DNS 서버에 묻기」. 차례의 노드 이름과 조건은 본문(step 0 결과)대로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `fields` | 줄의 칸 | 칸 셋 | 한 줄에 주소, 정식 이름, 별명을 차례로 적는다 |
  | `listed` | 적힌 이름 | hosts 파일 보기와 그 줄 | 파일에 짝이 있으면 DNS 서버에 묻지 않고 그 주소를 쓴다 |
  | `unlisted` | 없는 이름 | hosts 파일 보기 → DNS 서버에 묻기 | 파일에 없는 이름은 DNS 서버에 묻는다 |

- 요점 테스트: `listed`에서 DNS 서버에 묻는 경로가 보이지 않고 `unlisted`에서는 보인다. 칸 노드의 왼쪽→오른쪽 차례가 주소 → 정식 이름 → 별명이다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 228개, 마지막 id는 `n228`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `tcp-connection` 바로 뒤·`app-protocols-mail-file` 앞에 있고, `importance` 3·`sourcePages` [328, 351]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0 summary가 「쓰지 않는다」·「자격시험은」·L번호로 정한 것을 지켰는가. `check-verbatim`이 강의 문장과 겹친 곳을 찾지 않았는가.
4. n227·n228의 상황을 hosts(5)·nsswitch.conf(5)의 사실로 따라가 정답과 오답이 맞는지 따진다. Windows 경로의 백슬래시가 화면에 한 개로 보이는지 `node -e`로 본다.
5. `phases/79-network-dns-linux-servers/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~14를 만들지 마라.** 이유: step 2~8의 범위다. 이 step의 글이 계층·네임 서버·캐시를 쓸 때는 이름과 한 줄 풀이로 그친다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
- **`/etc/resolv.conf`의 줄 꼴을 쓰지 마라.** 이유: `linux-servers`(step 10)의 개념이다. hosts 파일과 구별할 때 「DNS 서버의 주소는 다른 설정 파일에 적는다」는 한 줄까지만 쓴다.
