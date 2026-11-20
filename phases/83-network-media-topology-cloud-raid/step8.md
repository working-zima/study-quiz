# Step 8: topology-basics-bus

## 배경

phase 83은 네트워크 과목의 `transmission-media`·`network-topology`·`cloud-sdn`·`raid-storage`를 만든다. 전체 계획·결정·공통 규칙은 `phases/83-network-media-topology-cloud-raid/guide.md`에 있다.
**이 step은 주제 `network-topology`를 만들고 그 첫 개념 둘(1 네트워크 토폴로지, 2 버스형)의 글·문항·도식을 함께 만든다.** 2는 1에 딸린 개념이다.
이 주제는 주제 지도 4번이라 `transmission-media` 바로 뒤·`ethernet` 앞에 들어간다 — 학습자는 이더넷·허브·CSMA/CD·IP를 아직 모른다고 보고 쓴다(guide.md 「배경」).

기출은 버스형에서 터미네이터가 신호의 반사를 막는다는 것을 묻는다([기출 2024-08-25 #18] — 오답 「스타보다 케이블이 더 든다」·「중앙 스위치에 잇는다」·「토큰이 돈다」).

## 읽어야 할 파일

- guide.md 「개념을 넣는 step의 공통 — 읽어야 할 파일」 전부. 그에 더해:
- `phases/83-network-media-topology-cloud-raid/index.json`의 step 7 `summary`(토폴로지·물리와 논리·점 대 점과 다중점, 버스·터미네이터·반사, E 번호, 한국어 이름)
- `src/data/network/topics.json` — `network-basics.computer-network`·`communication-link`(노드·링크 — 뜻을 맞춘다), `transmission-media.coaxial-cable`(동축 — 다시 길게 풀지 않고 한 줄로), `hub-switch-vlan.csma-cd`(매체를 함께 쓰는 규칙 — 뜻을 맞춘 한 줄)
- 도식 선례: `HubRepeatDiagram`(신호가 모두에게 퍼짐), `CollisionDomainDiagram`, `WirelessLanModesDiagram`(구성 갈래)과 그 테스트

## 작업

### 1. 개념 — `src/data/network/topics.json`

`transmission-media` 주제 객체 바로 뒤(= `ethernet` 주제 객체 앞)에 주제 객체를 끼운다 — `{ "id": "network-topology", "title": "네트워크 토폴로지", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 3(★★★, 출제 10/11회)인지 `data.test.ts`의 주제 지도 표와 견준다. 끼운 자리의 `  }` / `,` / `  {` 줄 꼴이 기존과 같은지 본다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `network-topology.network-topology` | 네트워크 토폴로지 | — | 이 주제의 첫 개념이라 노드·링크를 한 줄씩 다시 푼다(`network-basics`와 뜻을 맞춘다). 토폴로지의 뜻(step 7 결과대로), 물리·논리 토폴로지(근거가 있을 때만), 점 대 점과 다중점(step 7의 말대로). 다섯 모양(버스·성형·링·메시·트리)은 이름만 들고 딸린 개념이 푼다(진행 안내 없이). 토폴로지를 아는 까닭 — 한 곳이 고장 날 때 무엇이 멈추는지, 노드를 더할 때 무엇을 손대는지가 모양에 따라 다르다(근거가 있는 만큼). **점 대 점과 다중점**(4절), **물리 토폴로지와 논리 토폴로지**(4절 — 근거가 있을 때만). 예: 노드 `PC01`~`PC04`를 잇는 두 모양 |
| 2 | `network-topology.bus-topology` | 버스형 | `network-topology.network-topology` | 케이블 한 줄(버스)에 노드들이 붙는 모양과 신호가 모든 노드에 닿는 것(step 7 결과대로), 터미네이터와 반사(step 7 결과대로), 한 번에 한 노드만 보낸다(매체를 함께 쓴다 — 함께 쓰는 규칙은 한 줄로, `hub-switch-vlan.csma-cd`와 뜻을 맞춘다), 케이블이 끊기거나 터미네이터가 빠지면(근거대로). **버스형과 성형**(4절 — 성형은 이 자리에서 한 줄로). 예: 동축 케이블 한 줄에 `PC01`~`PC04`, 양 끝에 터미네이터 |

### 2. 문항 — `src/data/network/questions.json`에 `n365`~`n366`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n365` | `network-topology` | 예/아니요 「개념 확인」 — **예** 쪽으로 세운다. 예: 노드 둘만 잇는 링크와, 노드 여럿이 함께 쓰는 링크가 있다. 노드 여럿이 링크 하나를 함께 쓰는 연결도 다중점 링크라 부르나요? — 이것은 이름만 묻는 것이라 약하다. 대신 「한 노드가 보낸 신호가 그 링크의 다른 노드 모두에 닿는 연결이 다중점 링크인가요?」처럼 동작을 판단하게 하거나, step 7 결과로 더 나은 주장을 고른다(예 쪽). 해설은 점 대 점과 다중점의 차이를 가르친다 |
| `n366` | `bus-topology` | 4지선다 「원인과 결과」 — 기출 묶음(케이블 양·중앙 스위치·터미네이터·토큰)을 쓰지 않는다. 예: 버스형 케이블의 한쪽 끝에서 터미네이터가 빠졌다. 그러면 어떤 일이 생기나(정답 — 끝에 닿은 신호가 되돌아와 다른 신호와 겹친다, step 7 결과대로 / 오답 — 같은 범주의 그럴듯한 결과: 그 끝에 가까운 노드만 통신하지 못하고 나머지는 그대로다·신호가 더 세져 더 멀리 간다·중앙 장치가 그 끝의 노드를 떼어 놓는다 — 출처로 하나씩 틀린 것을 확인). **정답 위치 2** |

이 step이 끝나면 예 74·아니요 73, 정답 위치 55/55/55/54다(guide.md 「문항」 9항). 문항 글에 백틱을 쓰지 않는다.

### 3. 도식

이 step이 `src/data/network/visuals/network-topology.json`을 만들고 `src/data/network/index.ts`에 import(`networkTopologyVisuals` — 경로 알파벳순, `network-security.json` 뒤)와 `visualsByTopicId`의 `'network-topology': networkTopologyVisuals`(`'transmission-media'` 바로 뒤)를 넣는다.

#### 3-1. `network-topology` — `TopologyLinkKindsDiagram`, JSON 키 `topology-link-kinds`

- 물음형 제목 예: `링크 하나에 노드가 몇이나 이어질까?`
- 그릴 것: 그룹 박스 둘 — 「점 대 점」 안에 노드 둘(`PC01`·`PC02`)과 둘을 잇는 링크, 「다중점」 안에 노드 셋 이상(`PC01`~`PC04` — 노드 id는 그룹마다 따로)과 그들이 함께 쓰는 링크(가운데 「공유 링크」 노드에 저마다 잇는 꼴 — 경로가 노드 변에서 시작하고 끝나야 하므로). 이름표가 겹치는 노드는 id를 달리한다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `p2p` | 점 대 점 | 점 대 점 그룹의 노드와 링크 | 링크 하나에 노드 둘만 이어진다 |
  | `multipoint` | 다중점 | 다중점 그룹의 노드와 링크 | 노드 여럿이 링크 하나를 함께 쓴다 |

- 요점 테스트: `p2p`에서 선명한 노드가 둘이고 `multipoint`에서 선명한 노드(공유 링크 노드를 뺀)가 셋 이상이다. 두 시나리오의 선명한 노드 집합이 겹치지 않는다.

#### 3-2. `bus-topology` — `BusTerminatorDiagram`, JSON 키 `bus-terminator`

- 물음형 제목 예: `버스 케이블의 양 끝에는 왜 터미네이터를 달까?`
- 그릴 것: 가로로 긴 「동축 케이블(버스)」 노드(280 폭에서는 노드를 세로로 세워도 된다), 그 위·아래에 `PC01`~`PC04`(각각 케이블 노드의 변에 닿는 경로), 케이블 양 끝에 「터미네이터」 노드 둘(경로로 잇는다). 반사 시나리오용으로 오른쪽 끝에서 되돌아오는 경로(케이블 노드 옆을 따라 돌아오는 직교 경로).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `send` | 모두에게 닿기 | 모든 노드와 `PC01`에서 케이블을 지나 나머지 노드로 가는 경로 | 한 노드가 보낸 신호가 케이블을 따라 모든 노드에 닿는다 |
  | `absorb` | 끝에서 흡수 | 케이블·터미네이터 둘 | 끝에 닿은 신호를 터미네이터가 흡수한다 |
  | `reflect` | 터미네이터가 빠지면 | 케이블·왼쪽 터미네이터와 되돌아오는 경로(오른쪽 터미네이터는 흐림) | 끝에서 신호가 되돌아와 다른 신호와 겹친다(본문대로) |

- 요점 테스트: `reflect`에서 오른쪽 터미네이터의 opacity가 0.25이고 되돌아오는 경로가 보인다. `absorb`에서는 되돌아오는 경로가 보이지 않는다. `send`에서 `PC01`에서 시작한 신호의 보이는 경로가 나머지 노드 셋 모두에 닿는다.

위 도식 설계는 출발점이다. 본문(step 7 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 366개, 마지막 id는 `n366`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `transmission-media` 바로 뒤·`ethernet` 바로 앞에 있고, `importance` 3·`sourcePages` [0, 0]인지, 데이터 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 이더넷·CSMA/CD를 모르는 학습자가 막히지 않는가. step 7 summary가 「쓰지 않는다」로 정한 것을 지켰는가.
4. n366의 보기 넷을 step 7의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
5. 이 주제의 단위·용어 표기(「성형」과 「스타형」 가운데 무엇을 이름으로 세우는지 등)를 summary에 적는다 — 뒤 step이 따른다.
6. guide.md 「검증 절차의 끝」대로 `phases/83-network-media-topology-cloud-raid/index.json`의 step 8을 갱신한다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~8을 만들지 마라.** 이유: step 9~11의 범위다. 성형·링형·토큰은 이 step에서 이름과 한 줄 풀이만 쓴다.
- **`transmission-media`의 개념·문항·도식을 고치지 마라.** 이유: 그 주제는 step 1~6이 끝냈다. 고칠 것은 summary에 적는다.
