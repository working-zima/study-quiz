# Step 16: bgp

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `routing`에 마지막 개념 하나(26 BGP)의 글·문항·도식을 더해 주제와 phase의 개념을 마무리한다.** 개념 18~25는 step 12~15가 만들었다.

기출은 BGP를 경로 벡터·정책 기반으로 정답 삼는 문항 하나와, BGP를 거리 벡터 쪽에 둔 보기가 있는 문항 둘을 냈다(그 처리는 step 11이 정했다).

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 11 `summary`(BGP의 확인 결과, 「경로 벡터」라는 이름의 근거, E번호)와 step 12~15 `summary`(이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-7 라우팅」 절과 「강의 수정 이력」, `docs/source/network/standards.md`(RFC 4271 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `routing`의 개념 18~25), `src/data/network/questions.json`, `src/data/network/visuals/routing.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`
- step 12~15가 만든 도식과 그 테스트(특히 `AutonomousSystemsDiagram`), 도식 선례(guide.md 「도식」), `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `routing`에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 26 | `routing.bgp` | BGP (Border Gateway Protocol) | `as` | 무엇인가(AS와 AS 사이에서 경로를 주고받는 EGP — 인터넷의 AS들을 잇는 데 쓴다, p215) → 무엇을 알리는가(어느 네트워크에 닿을 수 있는지와, 그 경로가 지나온 AS 번호의 목록 — AS 경로) → 그래서 무엇이라 부르는가(경로 벡터 — 이름의 근거는 step 11 결과대로. RIP의 거리 벡터와 무엇이 다른지 한 문단: 거리(홉 수)가 아니라 지나온 AS의 목록을 알린다) → 고리를 막는 법(받은 경로의 AS 목록에 자기 AS가 있으면 쓰지 않는다) → 정책(경로를 고를 때와 이웃에게 알릴 때 관리자가 정한 정책을 적용한다). 예 — AS 3에 있는 네트워크 `198.51.100.0/24`를 AS 3이 AS 2에게 「AS 3」으로 알리고, AS 2는 AS 1에게 「AS 2, AS 3」으로 알린다. 각 사실의 절과 기출 두 문항의 처리는 step 11 결과대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n110`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n110` | `bgp` | 4지선다 「원리 이해」 감 — BGP 라우터가 받은 경로를 쓰지 않고 버리는 상황(AS 목록에 자기 AS가 있다)을 고르거나, BGP가 경로와 함께 알리는 것을 고른다. 오답은 같은 범주(홉 수, 링크 비용, 다음 라우터의 MAC 주소)에서. 균형상 예/아니요가 필요하면 흔한 오해 「BGP는 RIP처럼 목적지까지의 홉 수만 알린다」(아니요) |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — **이 step이 phase의 마지막 문항이므로** 끝났을 때 과목 전체의 균형이 맞아야 한다.

### 3. 도식

#### `routing.bgp` — `AsPathDiagram`, JSON 키 `as-path`

- 물음형 제목 예: `BGP는 경로를 알릴 때 무엇을 함께 보낼까?`
- 그릴 것: 그룹 박스 「AS 1」·「AS 2」·「AS 3」(세로형은 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로)과 각 AS의 경계 라우터, AS 3 안의 네트워크 `198.51.100.0/24`. 알림 경로와 AS 경로 곁말(「AS 3」 → 「AS 2, AS 3」).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `path` | AS 경로 | 세 AS의 라우터·네트워크 | 경로가 AS를 지날 때마다 그 AS의 번호가 목록 앞에 더해진다 |
  | `loop` | 고리 막기 | AS 1·AS 3의 라우터 | AS 3이 「AS 1, AS 2, AS 3」인 경로를 받으면 자기 번호가 있어 쓰지 않는다 |

- 요점 테스트: `path`의 보이는 경로가 AS 3에서 AS 2로, AS 2에서 AS 1로 가고, 곁말의 AS 목록이 한 칸씩 길어진다(「AS 3」 → 「AS 2, AS 3」). `loop`의 보이는 곁말에 「AS 3」이 들어 있는 목록이 있고, 그 경로가 AS 3 쪽에서 쓰이지 않는다는 곁말(본문의 말)이 있다.

위 도식 설계는 출발점이다. 본문(step 11 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 110개, 마지막 id는 `n110`이다. `routing`의 개념은 9개, 이 phase가 더한 개념은 26개, 도식은 26개다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `routing`의 개념 18~26을 처음부터 통독한다(도식 문구 포함). 풀이 없이 처음 나오는 낱말, 진행 안내 문장, 앞 개념과 되풀이되는 설명이 없는지 본다.
   거리 벡터·링크 상태·경로 벡터의 차이가 세 개념을 차례로 읽었을 때 드러나는가. step 11 summary가 정한 것을 지켰는가.
3. 과목 전체의 균형(예/아니요 차이 1 이하, 정답 위치 차이 2 이하)을 다시 확인한다.
4. `phases/74-network-addressing-routing/index.json`의 step 16을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」과, `routing` 주제 전체에서 앞 step의 글에 고칠 것을 찾았으면 그 목록(고치지 않는다).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **BGP의 메시지 종류·경로 속성 목록·경로 선택 순서를 풀지 마라.** 이유: 기출이 묻지 않는다. AS 경로와 정책만 쓴다.
- **실제 AS 번호를 쓰지 마라.** 이유: guide.md 「예시 값」 — 이름표 「AS 1」~「AS 3」.
- **BGP를 거리 벡터라고 쓰지 마라.** 이유: step 11 결과 — 기출 두 문항의 보기 구성은 문항 쪽의 흠으로만 기록했다.
