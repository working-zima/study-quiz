# Step 1: port-number-ranges

## 배경

phase 77은 네트워크 과목의 `ports`·`tcp-udp`·`tcp-connection`을 만든다. 전체 계획·결정·공통 규칙은 `phases/77-network-ports-tcp/guide.md`에 있다.
**이 step은 주제 `ports`를 만들고 그 첫 개념 둘(1 포트 번호, 2 포트 번호의 범위)의 글·문항·도식을 함께 만든다.**

이 주제는 학습자가 「한 컴퓨터 안의 어느 프로그램」을 처음 따로 떼어 보는 화면이다. 앞 주제(IP 주소·라우팅)를 읽지 않고 바로 들어올 수 있다고 보고 쓴다.

## 읽어야 할 파일

- **`phases/77-network-ports-tcp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/77-network-ports-tcp/index.json`의 step 0 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch4-1 포트」 절과 그 절이 가리키는 수정 이력, `docs/source/network/interview-facts.md`의 Q30·I10,
  `docs/source/network/standards.md`(특히 「(phase 77)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `routing` 주제 — 끼울 자리, `ip-address-types.napt`가 포트를 어떻게 풀었는지, 목록 개념의 선례 `routing.routing-table`), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들 — 특히 `NaptPortsDiagram`(주소와 포트)과 `RoutingTableDiagram`(표 모양)), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`routing` 주제 객체 바로 뒤(`linux-filesystem` 앞)에 주제 객체를 끼운다 — `{ "id": "ports", "title": "포트", "importance": 2, "sourcePages": [217, 233], "concepts": [ … ] }`.
개념은 guide.md 표의 1·2다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `ports.port-number` | 포트 번호 | — | 이 주제의 첫 개념이라 **호스트**(네트워크에 이어진 컴퓨터), **IP 주소**(네트워크에서 호스트를 가리키는 주소), **프로그램**, **전송 계층**(호스트 사이에서 프로그램과 프로그램의 데이터를 나르는 층 — TCP와 UDP가 이 층의 프로토콜), **헤더**(데이터 앞에 붙는 제어 정보)를 짧게 푼다. 예는 guide.md 「예시 값」 — 호스트 `192.0.2.10`에서 웹 브라우저와 메일 프로그램이 동시에 통신하고, 운영체제가 둘에게 포트 `50001`·`50002`를 정해 주었다(예로 붙인 번호라고 밝힌다). 도착한 데이터의 목적지 IP 주소는 둘 다 `192.0.2.10`이므로 주소만으로는 가리지 못하고, 목적지 포트(`50001`이냐 `50002`냐)가 받을 프로그램을 정한다. IP 주소와 포트 번호가 무엇이 다른지(4절 — 호스트를 가리는 번호와 호스트 안의 프로그램을 가리는 번호). 16비트라 0~65535. TCP와 UDP가 포트를 따로 쓴다는 것, `주소:포트` 표기는 step 0 결과대로. 전송 계층의 신뢰성은 I10 처리대로 한 줄 |
| 2 | `ports.port-ranges` | 포트 번호의 범위 | — | **목록 개념** — 소개 문단(65,536개 번호를 IANA가 쓰임에 따라 세 범위로 나눴다 — IANA를 한 줄로 푼다) 뒤 항목 셋(guide.md 표). 항목 이름의 영문과 다른 이름은 step 0 결과대로. 범위마다 예 하나 — 잘 알려진 포트는 웹 서버의 `80`(사실 — 근거는 step 0 결과), 등록된 포트는 step 0이 IANA 레지스트리에서 확인한 것 하나(예: `3306` MySQL — 확인된 것만), 동적 포트는 개념 1의 `50001`(예시 값). 누가 번호를 정해 쓰는지가 범위마다 다르다는 것(IANA가 정해 준다 / 등록해 쓴다 / 아무에게도 정해 주지 않는다)을 4절대로. 기출 보기의 「1~1023」 처리는 step 0 결과대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n171`~`n172`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n171` | `port-number` | 예/아니요 「오해 바로잡기」 — 시작 때 예 31·아니요 31이므로 **아니요** 쪽 주장으로 세운다. 예: 한 호스트에서 두 프로그램이 동시에 통신할 때, 도착한 데이터가 어느 프로그램 것인지를 목적지 IP 주소로 가릴 수 있는가 — 아니요, 두 프로그램의 데이터는 목적지 IP 주소가 같고 목적지 포트 번호가 갈라 준다. 본문과 다른 프로그램·번호를 쓴다(예: 메신저와 게임, `50100`·`50101`). 해설은 IP 주소가 가리는 것(호스트)과 포트 번호가 가리는 것(호스트 안의 프로그램)을 가르친다 |
| `n172` | `port-ranges` | 4지선다 「상황 적용」 — 상황: 회사 안에서만 쓰는 프로그램이 IANA에 번호를 등록하지 않고 잠깐 쓸 포트를 고르려 한다. 어느 범위에서 고르는 것이 맞나 → `49152~65535`. 오답: `0~1023`, `1024~49151`(등록된 포트 — 흔한 혼동), `65536~98303`(16비트를 넘는 번호 — 포트 번호의 크기를 모르는 실수). 근거가 step 0 결과와 맞는지 확인한다. **정답 위치 0** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 이 step 뒤 예 31·아니요 32, 정답 위치 28/27/27/27.

### 3. 도식

이 step이 `src/data/network/visuals/ports.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'ports': portsVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」 — `'routing'` 항목 바로 뒤).

#### 3-1. `ports.port-number` — `PortDemuxDiagram`, JSON 키 `port-demux`

- 물음형 제목 예: `도착한 데이터는 어느 프로그램으로 갈까?`
- 그릴 것: 왼쪽(세로형은 위)에 도착한 데이터 둘 — `목적지 192.0.2.10 · 포트 50001`과 `목적지 192.0.2.10 · 포트 50002`(라벨은 280 폭에 맞춰 정하되 본문의 말과 같게 — 두 줄 정보가 한 노드에 들지 않으면 그룹 박스 안 노드 둘로). 오른쪽(아래)에 호스트 `192.0.2.10` 그룹 박스, 그 안에 `IP 주소 192.0.2.10` 노드(호스트 입구)와 프로그램 노드 둘(`웹 브라우저 · 50001`, `메일 프로그램 · 50002`).
  경로: 데이터 → 호스트 입구(늘 보이지 않음 — 시나리오마다), 호스트 입구 → 프로그램(시나리오마다).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `ip-only` | IP 주소까지 | 데이터 둘, 호스트 입구 | 두 데이터는 목적지 IP 주소가 같다 — 주소만으로는 호스트까지만 간다 |
  | `to-browser` | 포트 50001 | `50001` 데이터, 호스트 입구, 웹 브라우저 | 목적지 포트 `50001`이 웹 브라우저를 고른다 |
  | `to-mail` | 포트 50002 | `50002` 데이터, 호스트 입구, 메일 프로그램 | 목적지 포트 `50002`가 메일 프로그램을 고른다 |

- 요점 테스트: `to-browser`·`to-mail`에서 선명한 프로그램 노드 라벨의 포트 번호가 선명한 데이터 노드 라벨의 포트 번호와 같다. `ip-only`에서 프로그램 노드는 모두 흐리다. 두 데이터 노드 라벨의 IP 주소가 같다.

#### 3-2. `ports.port-ranges` — `PortRangesDiagram`, JSON 키 `port-ranges`

- 물음형 제목 예: `포트 번호 0~65535는 어떻게 나뉠까?`
- 그릴 것: 세 범위를 위에서 아래로(가로형은 왼쪽에서 오른쪽으로) 이은 노드 줄 — `0 ~ 1023`·`1024 ~ 49151`·`49152 ~ 65535`, 범위마다 이름 노드(`잘 알려진 포트`·`등록된 포트`·`동적 포트`)와 예 노드(`80 웹 서버`·확인된 등록 포트 예·`50001 클라이언트` — 본문에 쓴 예만).
  280 폭에서 한 줄에 노드 넷 이상을 두지 마라 — 범위마다 그룹 박스 하나에 「범위 · 이름」과 예를 쌓는다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `well-known` | 잘 알려진 포트 | 0~1023 줄과 그 예 | 널리 쓰는 서비스에 IANA가 정해 준 번호 |
  | `registered` | 등록된 포트 | 1024~49151 줄과 그 예 | 응용 프로그램이 IANA에 등록해 쓰는 번호 |
  | `dynamic` | 동적 포트 | 49152~65535 줄과 그 예 | IANA가 누구에게도 정해 주지 않아 잠깐 쓰는 번호 |

- 요점 테스트: 범위 노드의 끝 번호 + 1이 다음 범위 노드의 시작 번호이고, 첫 시작이 0, 마지막 끝이 65535다. 시나리오마다 선명한 예 노드의 번호가 같은 시나리오의 범위 안에 있다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2, 4~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 172개, 마지막 id는 `n172`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `routing` 바로 뒤·`linux-filesystem` 바로 앞에 있고, `importance` 2·`sourcePages` [217, 233]인지, `data.test.ts`의 주제 지도·별점·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
   `index.ts`의 `visualsByTopicId`에서 `'ports'`가 `'routing'` 바로 뒤에 있는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 범위의 경계 번호가 RFC 6335·IANA와 같은가.
4. `phases/77-network-ports-tcp/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3·4(잘 알려진 포트, 서버 포트와 클라이언트 포트)를 만들지 마라.** 이유: step 2의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다 — 서비스마다의 번호 목록을 여기에 늘어놓지 않는다.
- **step 0이 확인하지 못한 등록된 포트의 예를 쓰지 마라.** 이유: 강의 p225–p226의 예도 IANA 레지스트리로 확인한 것만 쓴다.
- **NAT·NAPT를 다시 풀지 마라.** 이유: `ip-address-types.napt`가 이미 다룬다(guide.md 「배경」). 강의 p230–p233은 이 phase에서 쓰지 않는다.
