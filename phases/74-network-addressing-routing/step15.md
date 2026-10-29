# Step 15: rip-ospf

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `routing`에 AS에 딸린 개념 둘(24 RIP, 25 OSPF)의 글·문항·도식을 더한다.** 개념 18~23은 step 12~14가 만들었다.

기출은 이 둘을 자주 묻는다 — 링크 상태를 쓰는 것은 OSPF(2회), 거리 벡터가 아닌 것은 OSPF(2회), RIP의 메트릭은 홉 수뿐, OSPF는 다익스트라, OSPF는 비용이 같은 경로를 하나만 쓰지 않는다(2회), OSPF는 IP 판마다 판이 다르다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 11 `summary`(RIP·OSPF의 확인 결과와 E번호)와 step 12~14 `summary`(이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**(특히 4절 — RIP와 OSPF의 차이)
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-7 라우팅」 절과 「강의 수정 이력」, `docs/source/network/standards.md`(RFC 2453·RFC 2328·RFC 5340 항목), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p215~p216 — 원문(옮기지 않는다). p216은 렌더해서 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `routing`의 개념 18~23), `src/data/network/questions.json`, `src/data/network/visuals/routing.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`
- step 12~14가 만든 도식과 그 테스트, 도식 선례(guide.md 「도식」), `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `routing`에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 24 | `routing.rip` | RIP (Routing Information Protocol) | `as` | 거리 벡터 방식의 IGP. **거리 벡터**를 푼다 — 라우터가 목적지마다의 거리(몇 홉인지)와 방향(어느 이웃 쪽인지)을 이웃 라우터에게 정해진 간격으로 알리고, 이웃이 알린 거리에 1을 더해 자기 표를 고친다. 메트릭은 홉 수 하나뿐이다 — 링크가 빠른지 느린지는 보지 않는다(step 11 결과대로). 한도(15홉까지, 16은 갈 수 없음)와 그래서 작은 네트워크에 쓴다는 것, 알리는 간격은 step 11 결과대로. 판의 차이와 「자격시험은」 줄은 step 11 결과대로. 예 — 라우터 3이 이어진 네트워크 `198.51.100.0/24`를 라우터 2에게 「1홉」으로 알리면, 라우터 2는 라우터 1에게 「2홉」으로 알린다 |
| 25 | `routing.ospf` | OSPF (Open Shortest Path First) | `as` | 링크 상태 방식의 IGP. **링크 상태**를 푼다 — 라우터마다 자기에게 이어진 링크와 그 비용을 AS 안의 모든 라우터에게 퍼뜨리고, 모두 같은 망 지도(링크 상태 데이터베이스)를 가진 뒤, 저마다 그 지도에서 자기로부터 비용 합이 가장 작은 경로를 계산한다(다익스트라 알고리즘 — 이름과 「가장 가까운 곳부터 차례로 넓혀 가며 최단 거리를 정하는 계산법」 정도의 한 줄, 계산 과정은 풀지 않는다). Hello 패킷으로 이웃을 찾고 살아 있는지 확인한다. 비용이 같은 경로가 여럿이면 함께 쓸 수 있다. IPv4는 OSPFv2, IPv6는 OSPFv3. 각 사실의 절은 step 11 결과대로. RIP와의 차이 한 문단(무엇을 누구에게 알리는가 — 거리를 이웃에게 / 링크 상태를 모두에게, 메트릭 — 홉 수 / 비용). 예 — 라우터 네 대의 링크 비용(예시 값이라고 밝힌다)과 라우터 1에서 라우터 4까지의 경로 |

### 2. 문항 — `src/data/network/questions.json`에 `n107`~`n109`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n107` | `rip` | 4지선다 「상황 적용」 감 — 목적지까지 「빠른 링크로 2홉」인 길과 「느린 링크로 1홉」인 길이 있을 때 RIP가 고르는 길과 그 까닭을 고른다. 오답은 같은 범주(빠른 쪽을 고른다, 둘을 번갈아 쓴다, 비용 합으로 고른다)에서. 링크 속도는 상황에 쓰는 예시 값이다 |
| `n108` | `ospf` | 4지선다 「개념 비교」 감 — RIP와 OSPF가 경로 정보를 「무엇을, 누구에게」 알리는지의 차이를 고르거나, 링크 상태 방식의 라우터가 경로를 정하는 방법을 고른다. 오답은 거리 벡터의 성질과 섞인 것 |
| `n109` | `ospf` | 예/아니요 감 — 흔한 오해 「OSPF는 비용이 같은 경로가 둘 있으면 하나만 쓰고 다른 하나는 버린다」(아니요), 또는 「OSPF 라우터는 Hello 패킷으로 이웃 라우터가 살아 있는지 확인한다」(예). n108과 다른 것을 묻는다. 주장의 방향은 균형에 맞춰 고른다 |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `routing.rip` — `DistanceVectorDiagram`, JSON 키 `distance-vector`

- 물음형 제목 예: `RIP 라우터는 이웃에게 무엇을 알려 줄까?`
- 그릴 것: 라우터 1 – 라우터 2 – 라우터 3 – 네트워크 `198.51.100.0/24`의 줄과, 라우터 1과 라우터 3을 바로 잇는 다른 링크(「느린 링크」 곁말). 알림을 가리키는 경로와 거리 곁말(「1홉」·「2홉」).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `announce` | 거리 알리기 | 라우터 3·라우터 2·라우터 1·네트워크 | 라우터 3이 「1홉」을 알리면 라우터 2는 1을 더해 「2홉」을 라우터 1에게 알린다 |
  | `hop-only` | 홉 수만 센다 | 라우터 1·라우터 3·네트워크 | RIP는 홉 수만 보므로 느린 링크라도 홉이 적은 바로 잇는 길을 고른다 |

- 요점 테스트: `announce`의 보이는 경로가 라우터 3에서 라우터 2로, 라우터 2에서 라우터 1로 가는 둘이고 곁말에 `1홉`·`2홉`이 있다. `hop-only`의 보이는 경로는 라우터 1과 라우터 3을 바로 잇는 링크를 지나고 라우터 2가 흐리다.

#### 3-2. `routing.ospf` — `LinkStateDiagram`, JSON 키 `link-state`

- 물음형 제목 예: `OSPF 라우터는 가장 작은 비용의 길을 어떻게 찾을까?`
- 그릴 것: 라우터 넷(라우터 1~4)을 네모꼴로 — 링크 라우터 1–2, 2–4, 1–3, 3–4, 그리고 라우터 1–4를 바로 잇는 링크. 링크마다 비용 곁말(예: 1–2 `1`, 2–4 `1`, 1–3 `1`, 3–4 `1`, 1–4 `3` — 예시 값). 1–4를 바로 잇는 링크가 다른 노드 상자를 지나지 않게 배치한다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `flood` | 링크 상태 퍼뜨리기 | 네 라우터 | 라우터마다 자기 링크와 비용을 모두에게 알려 넷이 같은 망 지도를 갖는다 |
  | `shortest` | 가장 작은 비용 | 라우터 1·라우터 2·라우터 4 | 라우터 1에서 라우터 4로 바로 가면 비용 3이지만 라우터 2를 거치면 2라 이 길을 쓴다 |
  | `equal-cost` | 같은 비용의 길 | 네 라우터 | 라우터 3을 거치는 길도 비용 2라 두 길을 함께 쓸 수 있다 |

- 요점 테스트: `shortest`의 보이는 경로가 라우터 1 → 라우터 2 → 라우터 4이고 바로 잇는 링크(비용 3)는 보이지 않는다. `equal-cost`의 보이는 경로는 라우터 2를 거치는 길과 라우터 3을 거치는 길 둘이다. 곁말의 비용 합이 본문 예와 같다.

위 도식 설계는 출발점이다. 본문(step 11 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면(예: 같은 비용의 길을 함께 쓴다는 것을 step 11이 확인하지 못했으면) 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 109개, 마지막 id는 `n109`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 12~14의 개념에서 이미 푼 낱말을 다시 풀지 않았는가. RIP와 OSPF의 차이가 4절대로 드러나는가.
   예의 홉 수·비용 합을 다시 계산해 봤는가. step 11 summary가 정한 것을 지켰는가.
3. `phases/74-network-addressing-routing/index.json`의 step 15를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 26(BGP)을 만들지 마라.** 이유: step 16의 범위다.
- **다익스트라 알고리즘의 계산 과정이나 OSPF의 영역·패킷 종류를 풀지 마라.** 이유: 기출이 묻지 않는다(`docs/source/network/CLAUDE.md` — 기출이 묻지 않는 것을 표준에 있다는 이유만으로 끌어오지 않는다).
- **IGRP를 쓰지 마라.** 이유: 허용한 출처에 문서가 없다(step 11 결과).
