# Step 12: routing-table

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `routing`을 만들고 그 첫 개념 둘(18 라우팅, 19 라우팅 테이블)의 글·문항·도식을 함께 만든다.** 앞 두 주제는 step 1~10이 끝냈다.

이 주제는 학습자가 「라우터는 패킷을 어디로 보낼지 어떻게 정하는가」를 처음 여는 화면이다. 앞 주제를 읽지 않고 바로 들어올 수 있다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 11 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 step 10 `summary`(교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-7 라우팅」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p199~p205, p209~p210 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `arp.arp-across-routers` — 이 주제가 이어 쓰는 예), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들, 특히 `ArpHopsDiagram`·`MacTableDiagram`), `src/types/visuals.ts`, `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`ip-address-types` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "routing", "title": "라우팅", "importance": 3, "sourcePages": [199, 216], "concepts": [ … ] }`.
개념은 guide.md 표의 18·19다. 예는 `arp.arp-across-routers`와 같은 망 — 호스트 A(`192.0.2.1`), 라우터 1(A 쪽 `192.0.2.254`, 라우터 2 쪽 `203.0.113.1`), 라우터 2(라우터 1 쪽 `203.0.113.2`, E 쪽 `198.51.100.254`), 호스트 E(`198.51.100.1`).

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 18 | `routing.routing` | 라우팅 | — | 이 주제의 첫 개념이라 **패킷**(네트워크로 보내는 데이터 덩어리), **IP 주소**(장치를 가리키는 주소, 예 `192.0.2.1`), **네트워크 계층**(여러 네트워크를 거쳐 목적지까지 나르는 일을 맡는 층), **라우터**를 짧게 푼다. 라우팅의 뜻(p201) → 홉과 홉 바이 홉(p202–p204 — 홉의 뜻은 step 11 결과대로) → 라우터마다 다음 홉만 정한다는 것(경로 전체를 아는 장치가 없어도 패킷이 목적지에 닿는다). 예 — A에서 E로 가는 패킷을 라우터 1은 라우터 2로, 라우터 2는 E로 넘긴다. 라우팅 프로토콜은 한 줄 풀이. 강의 p203–p204의 실제 도메인·주소는 옮기지 않는다 |
| 19 | `routing.routing-table` | 라우팅 테이블 | — | **목록 개념**. 소개 문단 — 라우터(와 호스트)가 「이 목적지로 가는 패킷은 어디로」를 적어 둔 표이고, 패킷이 들어오면 목적지 IP 주소를 표의 목적지·마스크와 견줘 맞는 행을 찾는다. **서브넷 마스크**(주소의 어디까지가 네트워크인지 가리키는 값)를 한 줄로 푼다. 항목 다섯 — 목적지 주소, 서브넷 마스크, 게이트웨이(다음 홉), 인터페이스(내보낼 출구 — 라우터의 인터페이스는 이어진 네트워크마다 하나), 메트릭(경로의 비용 — step 11 결과대로). 예 — 라우터 1의 표의 한 행(`198.51.100.0` / `255.255.255.0` / `203.0.113.2` / `eth1` / 메트릭 값은 예). 직접 이어진 네트워크의 행을 어떻게 적는지는 step 11 결과대로. 호스트에서 표를 보는 명령은 이름만 |

### 2. 문항 — `src/data/network/questions.json`에 `n101`~`n102`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n101` | `routing` | 예/아니요 감 — 흔한 오해 「패킷을 처음 받은 라우터는 목적지까지 거쳐 갈 라우터를 모두 정해 둔다」(아니요 — 다음 홉만), 또는 「라우터는 패킷마다 목적지 IP 주소를 보고 다음에 넘길 곳을 정한다」(예). 주장의 방향은 균형에 맞춰 고른다 |
| `n102` | `routing-table` | 4지선다 「상황 적용」 감 — 행 두세 개짜리 라우팅 테이블(본문 예와 다른 문서용 주소)과 목적지 주소를 주고, 패킷이 나갈 인터페이스나 넘겨질 게이트웨이를 고른다. 정답이 행 하나에만 맞게 만든다(여러 행이 맞는 경우는 개념 20이다). 오답은 표의 다른 열·다른 행의 값 |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/network/visuals/routing.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'routing': routingVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `routing.routing` — `HopByHopDiagram`, JSON 키 `hop-by-hop`

- 물음형 제목 예: `라우터는 경로 전체를 알고 패킷을 보낼까?`
- 그릴 것: 호스트 A → 라우터 1 → 라우터 2 → 호스트 E(세로형은 위에서 아래로). 늘 보이는 연결선. 라우터마다 「다음 홉」 곁말.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `one-hop` | 홉 하나 | 라우터 1·라우터 2 | 라우터 1에서 라우터 2로 넘어가는 한 구간이 홉 하나다 |
  | `next-hop` | 다음 홉만 | 네 노드 모두 | 라우터 1은 라우터 2로, 라우터 2는 호스트 E로 — 라우터마다 다음에 넘길 곳만 정한다 |

- 요점 테스트: `one-hop`의 시나리오 경로가 라우터 1에서 시작해 라우터 2에서 끝나는 하나뿐이다. `next-hop`의 보이는 곁말에 라우터 1의 다음 홉(라우터 2)과 라우터 2의 다음 홉(호스트 E)이 있고, 어떤 곁말도 경로 전체를 한 장치에 적지 않는다.

#### 3-2. `routing.routing-table` — `RoutingTableDiagram`, JSON 키 `routing-table`

- 물음형 제목 예: `라우터는 표의 어느 칸을 보고 패킷을 보낼까?`
- 그릴 것: 목적지가 `198.51.100.1`인 패킷 노드와 라우터 1의 표. 세로형은 행 하나를 「열 이름: 값」 노드 다섯 줄로 세운다(guide.md 「표 모양 그림」). 가로형은 두 행을 열 다섯으로.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `match` | 맞는 행 찾기 | 패킷·목적지 주소·서브넷 마스크 칸 | 목적지 `198.51.100.1`이 목적지·마스크 칸과 맞는 행을 찾는다 |
  | `forward` | 내보내기 | 게이트웨이·인터페이스 칸 | 그 행의 게이트웨이 `203.0.113.2`로, 인터페이스 `eth1`을 통해 내보낸다 |

- 요점 테스트: `match`와 `forward`의 선명한 칸 노드가 서로 겹치지 않는다. `forward`의 선명한 칸 라벨에 `203.0.113.2`와 `eth1`이 있다. 세로형·가로형 모두 칸 노드 라벨이 본문 예의 값과 같다.

위 도식 설계는 출발점이다. 본문(step 11 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 102개, 마지막 id는 `n102`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `ip-address-types` 바로 뒤에 있고, `importance` 3·`sourcePages` [199, 216]인지, `data.test.ts`의 주제 지도·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 11 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/74-network-addressing-routing/index.json`의 step 12를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 20~26(롱기스트 프리픽스 매치, 디폴트 라우트, 정적·동적 라우팅, AS, RIP, OSPF, BGP)을 만들지 마라.** 이유: step 13~16의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **라우팅 테이블 명령의 옵션·출력을 풀지 마라.** 이유: `diagnostic-commands` 주제의 범위다.
- **앞 주제(`arp`·`ip-address-types` 등)를 고치지 마라.** 이유: 다른 phase·step의 개념이다.
