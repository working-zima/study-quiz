# Step 4: fragment-ttl

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 2·3이 개념 1~4(IP, 단편화, MTU, IPv4 헤더)를 넣었다. **이 step은 IPv4 헤더에 딸린 5 식별자·플래그·단편화 오프셋과 6 TTL의 글·문항·도식을 만든다.** 다음 step 5가 IPv4 주소와 IPv6를 잇는다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-1 IP(IPv4, IPv6)」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p120~p122 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), 이 주제에서 앞 step이 만든 도식과 `src/data/network/visuals/ip-protocol.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

주제 `ip-protocol`의 `concepts` 끝에 덧붙인다. 개념은 guide.md 표의 5 식별자·플래그·단편화 오프셋, 6 TTL이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `ip-protocol.fragment-fields` | 식별자·플래그·단편화 오프셋 | `ip-protocol.ipv4-header` | **목록 개념** — 소개 문단 뒤 `- **식별자**(Identification)는 …`, `- **플래그**(Flags)는 …`, `- **단편화 오프셋**(Fragment Offset)은 …`. 예시는 guide.md 「단편화 예」 — 조각 셋의 식별자는 같고, MF는 1·1·0, 오프셋은 바이트 거리 0·1480·2960과 헤더 값 0·185·370(L3). DF가 1이면 나누지 못해 버려지고 알림(ICMP — 이름만)이 간다. 정답 키 오류 문항의 처리는 step 0 summary대로(식별자를 쓴다) |
| 6 | `ip-protocol.ttl` | TTL (Time To Live) | `ip-protocol.ipv4-header` | 라우터마다 1씩 줄고 0이면 버린다, 경로가 고리를 이뤄도 패킷이 영원히 돌지 않는다. 단위(표준의 초 정의와 실제의 홉 수)는 step 0 summary의 처리대로. 버릴 때 출발지에 보내는 알림(ICMP 시간 초과)은 이름만. IPv6의 홉 제한은 한 줄(개념 10에서 자세히) |

### 2. 문항 — `src/data/network/questions.json`에 `n054`~`n055`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n054` | `fragment-fields` | 4지선다 「상황 적용」 감 — 목적지에 닿은 조각들의 식별자·MF·오프셋 값을 주고, 그중 마지막 조각이나 원래 데이터의 몇 바이트째부터인지를 고르게 한다. 상황의 값은 본문 예와 다르게(정답이 본문 문장을 외워서 나오지 않게) |
| `n055` | `ttl` | 예/아니요 감 — 「TTL은 라우터를 지날 때마다 1씩 줄어 0이 되면 그 패킷이 버려진다」(예) 또는 「TTL이 0이 된 패킷은 출발지로 되돌아간다」(아니요) 같은 오해. 방향은 균형에 맞춰 고른다 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

`src/data/network/visuals/ip-protocol.json`의 `diagrams`에 키를 더한다. 앞 step이 쓴 키는 고치지 않는다.

#### 3-1. `ip-protocol.fragment-fields` — `FragmentFieldsDiagram`, JSON 키 `fragment-fields`

- 물음형 제목 예: `조각들은 서로 어떻게 알아볼까?`
- 그릴 것: 한 패킷에서 나온 조각 셋(조각 1~3)을 나란히, 조각마다 식별자·MF·오프셋 칸. 원래 데이터에서 각 조각이 차지하는 자리를 띠로.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `first` | 첫 조각 | 조각 1과 그 칸들 | 첫 조각은 오프셋 0, 뒤에 조각이 더 있어 MF가 1 |
  | `middle` | 가운데 조각 | 조각 2와 그 칸들 | 1480바이트 떨어진 조각의 헤더 값은 185(8바이트 단위) |
  | `last` | 마지막 조각 | 조각 3과 그 칸들 | 마지막 조각은 MF가 0 |

- 요점 테스트: 세 조각의 식별자 곁말이 모두 같다. MF 값이 1인 조각은 조각 1·2, 0인 조각은 조각 3뿐이다. 오프셋 헤더 값 × 8이 바이트 거리 곁말과 같다.

#### 3-2. `ip-protocol.ttl` — `TtlCountdownDiagram`, JSON 키 `ttl-countdown`

- 물음형 제목 예: `TTL이 다 떨어진 패킷은 어떻게 될까?`
- 그릴 것: 출발지 호스트 → 라우터 1 → 라우터 2 → 라우터 3 → 목적지 호스트. 구간마다 TTL 값 곁말.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `arrive` | 도착 | 모든 노드 | TTL이 남아 있으면 라우터마다 1씩 줄며 목적지에 닿는다 |
  | `expire` | 버려짐 | 출발지부터 TTL이 0이 되는 라우터까지 | TTL이 0이 된 라우터가 패킷을 버린다 — 목적지에 닿지 않는다 |

- 요점 테스트: `arrive`에서 TTL 곁말이 구간마다 1씩 작아지고, `expire`에서 보이는 경로가 TTL이 0이 되는 라우터에서 끝나며 목적지 호스트가 흐려진다.

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 55개, 마지막 id는 `n055`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `ip-protocol`의 개념 순서와 `parentId`가 guide.md 표와 같은지, 앞 step의 개념·문항·도식 문구가 한 글자도 바뀌지 않았는지 node로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 4을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 7~12(IPv4 주소, IPv6와 딸린 개념)를 만들지 마라.** 이유: step 5~7의 범위다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
