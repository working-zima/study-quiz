# Step 12: icmp-types-unreachable

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 11이 주제 `icmp`를 만들고 개념 19·20을 넣었다. **이 step은 ICMP에 딸린 21 ICMP 메시지의 타입과 코드, 22 목적지 도달 불가의 글·문항·도식을 만든다.** 기출이 거의 매회 타입 번호를 묻는다. 다음 step 13이 시간 초과와 에코 요청·응답을 잇는다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-3 ICMP」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p151~p155 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), 이 주제에서 앞 step이 만든 도식과 `src/data/network/visuals/icmp.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

주제 `icmp`의 `concepts` 끝에 덧붙인다. 개념은 guide.md 표의 21 ICMP 메시지의 타입과 코드, 22 목적지 도달 불가이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 21 | `icmp.icmp-message` | ICMP 메시지의 타입과 코드 | `icmp.icmp` | **목록 개념** — 소개 문단(타입 8비트·코드 8비트·체크섬 16비트, 그 뒤는 타입마다, p151) 뒤 주요 타입 항목: `- **에코 응답**(Echo Reply, 타입 0)은 …` 꼴로 0·3·5·8·9·11(step 1 결과대로 더하거나 뺀다). 폐기된 타입(4·17)과 「IP 주소 중복」이 ICMP 메시지가 아니라는 것은 step 1 결과·E번호대로. 비트·체크섬을 이 주제 안에서 처음 쓰면 한 줄로 푼다 |
| 22 | `icmp.destination-unreachable` | 목적지 도달 불가 | `icmp.icmp` | 코드 0~4(5도 step 1이 확인했으면), 누가 보내는지(라우터/목적지 호스트 — step 1 결과대로), 원래 패킷의 앞부분을 담는다는 것. 포트를 한 줄로 푼다(한 장치 안에서 어느 프로그램에게 줄지 가리키는 번호). 강의 p153 장면은 예시 값(`203.0.113.x` 등)으로 바꿔 쓴다. 코드 4는 같은 주제 밖의 DF를 쓰므로 DF를 이 주제 안에서 한 줄로 푼다 |

### 2. 문항 — `src/data/network/questions.json`에 `n072`~`n074`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n072` | `icmp-message` | 4지선다 「상황 적용」 감 — 상황 속 메시지(예: 패킷을 버린 라우터가 TTL이 다 됐다고 알림, 상대가 에코 요청에 답함)의 타입 번호나 이름을 고르게 한다. 번호만 외우게 하지 말고 상황을 준다(guide.md 문항 11항). 오답은 다른 주요 타입 |
| `n073` | `icmp-message` | 예/아니요 감 — n072와 다른 것: 「같은 타입의 ICMP 메시지도 코드로 사유를 더 자세히 가른다」(예), 또는 「ICMP에는 장치의 IP 주소가 겹쳤다고 알리는 메시지 타입이 있다」(아니요 — step 1 결과가 그렇다면). 방향은 균형에 맞춰 |
| `n074` | `destination-unreachable` | 4지선다 「상황 적용」 감 — 나누지 말라는 표시가 있는 큰 패킷이 MTU가 작은 링크를 만났을 때 돌아오는 메시지의 코드와 보내는 쪽, 또는 목적지 호스트에 그 포트를 쓰는 프로그램이 없을 때의 코드. 오답은 다른 코드 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

`src/data/network/visuals/icmp.json`의 `diagrams`에 키를 더한다. 앞 step이 쓴 키는 고치지 않는다.

#### 3-1. `icmp.icmp-message` — `IcmpMessageDiagram`, JSON 키 `icmp-message`

- 물음형 제목 예: `ICMP 메시지는 무엇으로 종류를 가를까?`
- 그릴 것: IP 패킷 안에 든 ICMP 메시지 — IP 헤더 | 타입 | 코드 | 체크섬 | 나머지. 칸은 빈틈없이 이어 붙인다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `echo-request` | 에코 요청 | 타입·코드 칸 | 타입 8, 코드 0 — 받으면 돌려 달라는 요청 |
  | `unreachable` | 목적지 도달 불가 | 타입·코드 칸 | 타입 3 — 코드가 사유를 가른다 |
  | `time-exceeded` | 시간 초과 | 타입·코드 칸 | 타입 11, 코드 0 — TTL이 0이 되어 버렸다 |

- 요점 테스트: 시나리오마다 타입 칸 곁말의 값이 본문의 번호와 같고 서로 다르다. 칸의 순서(IP 헤더 → 타입 → 코드 → 체크섬)는 모든 시나리오에서 같다.

#### 3-2. `icmp.destination-unreachable` — `UnreachableDiagram`, JSON 키 `destination-unreachable`

- 물음형 제목 예: `목적지에 닿지 못하면 누가 무엇을 알릴까?`
- 그릴 것: 출발지 호스트 → 라우터 1 → 목적지 호스트. 패킷이 멈추는 곳과 ICMP 메시지가 돌아오는 경로.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `network` | 네트워크 도달 불가 | 출발지·라우터 1 | 라우터가 목적지 네트워크로 가는 길을 모른다 — 코드 0 |
  | `port` | 포트 도달 불가 | 출발지·목적지 호스트 | 목적지 호스트에 그 포트를 쓰는 프로그램이 없다 — 코드 3 |
  | `fragment` | 단편화 필요 | 출발지·라우터 1 | 나누지 말라는 표시(DF)가 있는데 MTU보다 크다 — 코드 4 |

- 요점 테스트: 시나리오마다 ICMP 메시지 경로가 시작하는 노드가 본문이 말한 보내는 쪽과 같다 — `network`·`fragment`는 라우터 1, `port`는 목적지 호스트(step 1 결과가 다르면 그대로 따른다).

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 74개, 마지막 id는 `n074`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `icmp`의 개념 순서와 `parentId`가 guide.md 표와 같은지, 앞 step의 개념·문항·도식 문구가 한 글자도 바뀌지 않았는지 node로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 12을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 23~26(시간 초과, 에코 요청과 에코 응답, ping, IGMP)을 만들지 마라.** 이유: step 13·14의 범위다. 타입 목록 항목은 한 줄씩만 쓴다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
