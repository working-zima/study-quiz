# Step 14: static-dynamic-as

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `routing`에 개념 둘(22 정적 라우팅과 동적 라우팅, 23 AS)의 글·문항·도식을 더한다.** 개념 18~21은 step 12·13이 만들었다.
개념 23은 뒤 step 15·16의 RIP·OSPF·BGP가 딸릴 부모 개념이다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 11 `summary`(정적 라우팅의 「부하·우선순위」, AS·EGP의 처리와 E번호)와 step 12·13 `summary`(이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」 — 고장 난 라우터를 색 없이 보이는 법)
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-7 라우팅」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p211~p216 — 원문(옮기지 않는다). p212–p214·p216은 렌더해서 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `routing`의 개념 18~21), `src/data/network/questions.json`, `src/data/network/visuals/routing.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`
- step 12·13이 만든 도식과 그 테스트, 도식 선례(guide.md 「도식」, 특히 막힌 상태를 흐림으로 보이는 `PacketLossDiagram`·`UnreachableDiagram`), `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `routing`에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 22 | `routing.static-dynamic-routing` | 정적 라우팅과 동적 라우팅 | — | **목록 개념**. 소개 문단 — 라우팅 테이블의 행을 채우는 방법은 둘이다(p211–p214). 항목 둘 — **정적 라우팅**(관리자가 행을 직접 넣는다, 망이 바뀌어도 표가 스스로 바뀌지 않는다), **동적 라우팅**(라우터들이 라우팅 프로토콜로 경로 정보를 주고받아 표를 채우고, 길이 끊기면 다른 길로 돌아간다). 항목 뒤 문단 — 예로 경로 위의 라우터 하나가 멈췄을 때 두 방법에서 무엇이 일어나는지(p212–p214). 무엇이 다르고 언제 어느 쪽을 쓰는지(WRITING_GUIDE 4절) — 근거가 확인된 것만. 기출 보기의 「부하가 적다」·「우선순위가 높다」는 step 11 결과대로(「자격시험은」 줄이면 그 줄로) |
| 23 | `routing.as` | AS (Autonomous System) | — | **목록 개념**. 소개 문단 — AS의 뜻(하나의 라우팅 정책으로 운영하는 네트워크·라우터의 묶음 — 정의의 말은 step 11 결과대로, p215), 예로 ISP 하나나 큰 기관 하나, AS마다 번호가 있다는 한 줄(번호를 나눠 주는 곳은 step 11 결과대로). **라우팅 정책**(어느 경로를 쓰고 누구에게 알릴지 정한 규칙)을 한 줄로 푼다. 항목 둘 — **IGP**(Interior Gateway Protocol — AS 안의 라우터끼리 경로를 주고받는 라우팅 프로토콜, 예 RIP·OSPF), **EGP**(Exterior Gateway Protocol — AS와 AS 사이에서 경로를 주고받는 라우팅 프로토콜, 예 BGP). 「EGP」가 갈래 이름이면서 옛 프로토콜 하나의 이름이기도 하다는 것은 step 11 결과대로 한 줄. 예의 AS는 이름표 「AS 1」·「AS 2」로 쓴다(guide.md 「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n105`~`n106`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n105` | `static-dynamic-routing` | 4지선다 「상황 적용」 감 — 경로 위의 라우터가 멈춘 상황에서 정적 라우팅만 쓰는 망과 동적 라우팅을 쓰는 망에서 각각 무엇이 일어나는지 고른다. 또는 예/아니요 「정적 라우팅으로 채운 표는 경로가 끊기면 라우터가 스스로 다른 길로 고친다」(아니요). 「부하·우선순위」는 step 11이 「자격시험은」으로만 정했으면 정답의 근거로 쓰지 않는다 |
| `n106` | `as` | 4지선다 「개념 비교」 감 — 상황(예: 두 ISP가 서로의 망으로 가는 경로를 주고받는다 / 한 회사 안의 라우터들이 경로를 주고받는다)을 주고 IGP·EGP 가운데 무엇이 맞는지, 또는 그 갈래에 드는 프로토콜을 고른다. 오답은 같은 범주(라우팅 프로토콜의 갈래와 이름)에서 |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `routing.static-dynamic-routing` — `RouteFailoverDiagram`, JSON 키 `route-failover`

- 물음형 제목 예: `경로 위의 라우터가 멈추면 패킷은 어떻게 될까?`
- 그릴 것: 호스트 A → 라우터 1 → 라우터 2 → 라우터 4 → 호스트 E와, 라우터 1 → 라우터 3 → 라우터 4의 다른 길. 라우터 2는 멈춘 상태로 — 색이 아니라 곁말(「멈춤」)과 흐림으로 보인다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `static` | 정적 라우팅 | 호스트 A·라우터 1 | 관리자가 넣은 행이 그대로라 라우터 1은 멈춘 라우터 2 쪽으로 계속 보내고 패킷은 닿지 못한다 |
  | `dynamic` | 동적 라우팅 | 호스트 A·라우터 1·라우터 3·라우터 4·호스트 E | 라우터들이 경로 정보를 주고받아 라우터 1이 라우터 3을 거치는 길로 바꾼다 |

- 요점 테스트: 두 시나리오 모두 라우터 2가 흐리다(opacity `0.25`). `static`의 보이는 경로는 라우터 1에서 라우터 2 쪽으로 가는 것뿐이고 호스트 E에 닿는 경로가 없다. `dynamic`의 보이는 경로는 라우터 3을 지나 호스트 E에서 끝나고 라우터 2에 닿는 경로가 없다.

#### 3-2. `routing.as` — `AutonomousSystemsDiagram`, JSON 키 `autonomous-systems`

- 물음형 제목 예: `AS 안과 AS 사이에서는 무엇으로 경로를 주고받을까?`
- 그릴 것: 그룹 박스 「AS 1」(라우터 1·라우터 2)과 「AS 2」(라우터 3·라우터 4). AS 안의 연결선, AS 1의 라우터 2와 AS 2의 라우터 3을 잇는 경계 연결선.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `igp` | AS 안 | 네 라우터 | AS 안의 라우터끼리는 IGP(RIP·OSPF 같은 것)로 경로를 주고받는다 |
  | `egp` | AS 사이 | 라우터 2·라우터 3 | AS와 AS 사이에서는 EGP(BGP)로 경로를 주고받는다 |

- 요점 테스트: `igp`의 보이는 시나리오 경로가 모두 한 그룹 박스 안에 있다(AS 경계를 넘지 않는다). `egp`의 보이는 시나리오 경로는 라우터 2와 라우터 3을 잇는 하나이고 두 그룹 박스에 걸친다. 그룹 박스는 어느 시나리오에서도 흐려지지 않는다.

위 도식 설계는 출발점이다. 본문(step 11 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 106개, 마지막 id는 `n106`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 12·13의 개념에서 이미 푼 낱말을 다시 풀지 않았는가. step 11 summary가 정한 것을 지켰는가.
3. `phases/74-network-addressing-routing/index.json`의 step 14를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 24~26(RIP, OSPF, BGP)을 만들지 마라.** 이유: step 15·16의 범위다. AS의 항목은 그 이름을 예로만 들고 동작을 풀지 않는다.
- **실제 AS 번호나 강의가 가리킨 AS 번호 목록을 쓰지 마라.** 이유: guide.md 「예시 값」.
- **멈춘 라우터를 빨강·회색 X·이모지로 그리지 마라.** 이유: ADR-036 — 곁말과 흐림으로만 보인다.
