# Step 11: load-balancing-methods

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `network-devices`의 개념 둘(5 부하 분산, 6 부하 분산 방식)의 글·문항·도식을 함께 만든다.** 6은 5에 딸린 개념이다.

기출은 부하 분산의 뜻과 로드 밸런서를 네 번 묻고([기출 2024-02-25 #47]·[기출 2025-05-25 #47] — 처리량을 늘리고 응답 시간을 줄인다, [기출 2024-11-03 #46]·[기출 2026-05-17 #49] — 지문),
서버를 차례대로 돌아가며 고르는 분산 방식이 라운드 로빈이라는 것을 다섯 번 묻는다([기출 2024-08-25 #49]·[기출 2026-02-01 #47]·[기출 2025-05-25 #36]·[기출 2025-08-24 #45]·[기출 2026-05-17 #41]).

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 8 `summary`(부하 분산·로드 밸런서·가상 주소·서버 풀·상태 확인, 분산 방식마다 이름·정의·출처, 근거가 없는 방식, 기출 판정, E 번호)와 step 9~10 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 9와 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 8)」 항목, phase 79의 DNS 라운드 로빈 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`network-devices`의 앞 개념 넷(step 9~10)**, 특히 `proxy-server`(역방향 프록시). `dns.dns-round-robin`(부하·부하 분산·라운드 로빈을 이미 정의했다 — 뜻을 맞춘다)
- `src/data/network/questions.json`, `src/data/network/visuals/network-devices.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `RoundRobinAnswersDiagram`(차례대로 바뀌는 답), `TrafficLoadDiagram`(부하), `ProxyDirectionDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 위 9문항 — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `network-devices` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `network-devices.load-balancing` | 부하 분산 | — | 부하와 부하 분산의 뜻(`dns.dns-round-robin`과 뜻을 맞춘다 — 이 화면에서 다시 한 줄로 푼다), 얻는 것(처리량·응답 시간·가용성 — step 8 결과대로), 로드 밸런서·가상 주소·서버 풀·상태 확인(이름과 뜻은 step 8 결과대로). 클라이언트는 가상 주소 하나로 접속하고 어느 서버가 답하는지 모른다는 것(근거대로). **DNS 라운드 로빈과 로드 밸런서**(4절 — 서버 상태를 보는가, 누가 나누는가). 예: 가상 주소 `192.0.2.100`의 `LB01` 뒤에 `WEB01`(`192.0.2.11`)·`WEB02`(`192.0.2.12`)·`WEB03`(`192.0.2.13`)이 있고, `WEB02`가 상태 확인에 답하지 않자 `LB01`이 나머지 둘에만 보낸다(「예시 값」 — 단계대로) |
| 6 | `network-devices.balancing-methods` | 부하 분산 방식 | `network-devices.load-balancing` | **목록 개념**. 소개 문단 — 로드 밸런서가 다음 요청을 어느 서버로 보낼지 정하는 규칙(알고리즘 — 한 줄)이 여럿이라는 것. 항목(step 8이 근거를 찾은 방식만 — 라운드 로빈·가중 라운드 로빈·최소 연결·가중 최소 연결·최소 응답 시간·해시 가운데, 이름은 영문과 함께). 항목마다 그 방식이 무엇을 보고 고르는지 한 문장. 항목 뒤 문단: 정해진 차례·비율만 보는 방식과 지금 서버 상태를 보는 방식의 차이. **라운드 로빈과 최소 연결**(4절). 계산 예: 라운드 로빈으로 요청 6개가 `WEB01`→`WEB02`→`WEB03`→`WEB01`→… 차례로 2개씩, 가중치 `WEB01` 3·`WEB02` 1의 가중 라운드 로빈으로 요청 8개가 6개·2개로 나뉜다(「예시 값」 — 단계대로, step 8이 가중치를 비율로 말하는 근거를 찾은 만큼) |

### 2. 문항 — `src/data/network/questions.json`에 `n332`~`n335`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n332` | `load-balancing` | 예/아니요 「원인과 결과」 — **예** 쪽으로 세운다. 예: 로드 밸런서 `LB05` 뒤의 웹 서버 `WEB06`이 멈춰 상태 확인에 답하지 않는다. `LB05`는 그 뒤로 들어오는 새 요청을 `WEB06`을 뺀 나머지 서버들에 나눠 보내나요?(예 — step 8 결과대로). 해설은 상태 확인과 가용성을 가르친다 |
| `n333` | `load-balancing` | 4지선다 「개념 비교」 — DNS 라운드 로빈과 로드 밸런서를 가르는 장면을 준다. 예: 서버 한 대가 멈춘 뒤에도 클라이언트 일부가 계속 그 서버 주소로 접속하다 실패한다 — 어떻게 나누고 있었기 때문인지, 또는 반대로 멈춘 서버를 피해 가려면 무엇을 두어야 하는지(정답·오답은 이 주제와 `dns.dns-round-robin`의 사실로). **정답 위치 3**. n332와 다른 것을 묻는다. 기출 묶음(VLAN·가상 컴퓨터·암호화·부하 분산 / IP 마스커레이딩·포트 포워딩·동적 주소 할당 / 네트워크 가상화·분산 네트워크·게이트웨이 이중화)을 쓰지 않는다 |
| `n334` | `balancing-methods` | 4지선다 「계산」 — 라운드 로빈 장면(본문과 다른 서버 이름 `WEB05`·`WEB06`·`WEB07`, 다른 요청 수)을 주고 정해진 번째 요청이 어느 서버로 가는지 고르게 한다. 오답은 차례를 하나 밀린 것·처음부터 다시 센 것 같은 흔한 실수. **정답 위치 0**. 해설은 차례를 하나씩 센다 |
| `n335` | `balancing-methods` | 4지선다 「상황 적용」 — 서버마다 지금 연결 수가 다른 장면(본문과 다른 이름·수)을 주고, 최소 연결 방식이면 다음 요청이 어느 서버로 가는지 고르게 한다(step 8이 최소 연결의 근거를 찾았을 때 — 찾지 못했으면 가중 라운드 로빈의 배분 계산으로 바꾼다). 오답에는 라운드 로빈이라면 갈 서버를 하나 넣는다. **정답 위치 1**. n334와 다른 것을 묻는다. 기출 묶음(분산 방식 이름 넷)을 쓰지 않는다 — 이 두 문항은 방식 이름이 아니라 서버를 보기로 둔다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 67·아니요 66, 정답 위치 51/51/50/50.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `load-balancing` — `LoadBalancerPoolDiagram`, JSON 키 `load-balancer-pool`

- 물음형 제목 예: `로드 밸런서는 멈춘 서버를 어떻게 다룰까?`
- 그릴 것: 위에 클라이언트 노드, 가운데 `LB01`(가상 주소 `192.0.2.100` — 곁말이나 노드 라벨), 아래 서버 풀 그룹 박스 안에 `WEB01`·`WEB02`·`WEB03`. `LB01`에서 서버마다 가는 경로. 280 폭에서 서버 셋은 세로로 쌓거나 그룹 박스로 묶는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `spread` | 나눠 보내기 | 모든 노드와 서버 셋으로 가는 경로 | 클라이언트는 가상 주소 하나로 접속하고 로드 밸런서가 서버에 나눠 보낸다 |
  | `health` | 서버가 멈췄을 때 | 클라이언트·`LB01`·`WEB01`·`WEB03`과 그 경로 | 상태 확인에 답하지 않는 `WEB02`에는 보내지 않는다 |

- 요점 테스트: `health`에서 `WEB02`는 흐리고 보이는 경로 어느 것도 `WEB02`에서 끝나지 않는다. `spread`에서는 서버 셋 모두에 경로가 닿는다.

#### 3-2. `balancing-methods` — `BalancingMethodsDiagram`, JSON 키 `balancing-methods`

- 물음형 제목 예: `요청은 어떤 차례로 서버에 나뉠까?`
- 그릴 것: 본문의 계산 예를 그린다 — 요청 차례 노드 줄(「요청 1」~)과 그 요청이 가는 서버 노드. 시나리오마다 다른 배분은 **다른 id의 노드를 다른 자리에** 둔다(같은 자리에 겹쳐 두고 가리지 않는다). 280 폭에 요청 줄이 들지 않으면 요청을 세로로 쌓거나, 차례를 「1·4번 → WEB01」처럼 묶은 노드로 그린다(본문의 계산 예와 같은 묶음일 때만).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `round-robin` | 라운드 로빈 | 라운드 로빈 배분 노드와 서버 셋 | 서버를 차례대로 돌아가며 하나씩 고른다 — 서버 셋이 2개씩 받는다 |
  | `weighted` | 가중 라운드 로빈 | 가중 배분 노드와 `WEB01`·`WEB02` | 가중치 3·1대로 요청 8개가 6개·2개로 나뉜다 |

  step 8이 최소 연결의 근거를 찾았으면 `least-conn` 시나리오(서버마다 지금 연결 수를 적은 노드와, 새 요청이 연결 수가 가장 적은 서버로 가는 경로)를 더할 수 있다 — 더하면 그 수를 본문에 먼저 쓴다.
- 요점 테스트: `round-robin`에서 서버마다 닿는 배분 노드 수가 같다(2개씩). `weighted`에서 `WEB01`에 닿는 배분 노드 수와 `WEB02`에 닿는 수의 비가 3:1이다(테스트가 경로 끝점을 센다).

위 도식 설계는 출발점이다. 본문(step 8 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 335개, 마지막 id는 `n335`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 배분 계산을 요청 하나씩 손으로 다시 센다. `dns.dns-round-robin`과 「라운드 로빈」의 뜻이 어긋나지 않는가.
3. n333·n334·n335의 보기 넷을 하나씩 따져 정답이 하나뿐인지 본다(계산 문항은 오답이 정말 틀린 값인지).
4. `phases/82-network-devices-wireless-security/index.json`의 step 11을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 7~10을 만들지 마라.** 이유: step 13~14의 범위다. L4·L7 스위치는 이 step에서 이름도 쓰지 않는다(그 이름의 처리는 step 12가 정한다).
- **세션 유지(sticky)·SSL 오프로드·전역 부하 분산·장애 조치 클러스터를 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 9~10의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
