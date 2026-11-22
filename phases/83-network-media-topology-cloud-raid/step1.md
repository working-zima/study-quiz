# Step 1: media-basics-twisted-pair

## 배경

phase 83은 네트워크 과목의 `transmission-media`·`network-topology`·`cloud-sdn`·`raid-storage`를 만든다. 전체 계획·결정·공통 규칙은 `phases/83-network-media-topology-cloud-raid/guide.md`에 있다.
**이 step은 주제 `transmission-media`를 만들고 그 첫 개념 둘(1 전송 매체, 2 트위스티드 페어 케이블)의 글·문항·도식을 함께 만든다.** 2는 1에 딸린 개념이다.
학습자는 `network-basics`(호스트·노드·통신 링크·대역폭)와 `protocols-encapsulation`(패킷·OSI 계층)까지 보았고, **이더넷·IEEE 802.3·10BASE-T·허브·MAC 주소·IP는 아직 모른다**고 보고 쓴다(guide.md 「배경」).

기출은 트위스티드 페어를 광케이블 문항의 오답으로 낸다([기출 2024-05-19 #48]·[기출 2024-08-25 #46]·[기출 2024-11-03 #50]·[기출 2026-08-02 #50]).

## 읽어야 할 파일

- guide.md 「개념을 넣는 step의 공통 — 읽어야 할 파일」 전부. 그에 더해:
- `phases/83-network-media-topology-cloud-raid/index.json`의 step 0 `summary`(전송 매체의 뜻·유선과 무선, 트위스티드 페어의 구조·UTP·STP·등급·쌍과 핀, 기출 판정, E 번호, 한국어 이름)
- `src/data/network/topics.json`의 `network-basics.communication-link`·`bandwidth`, `protocols-encapsulation.osi-model`, `ethernet.standard-names` — 뜻을 맞춘다(같은 이름 「트위스티드 페어 케이블」을 쓴다)
- 도식 선례: `HubRepeatDiagram`(신호가 지나는 길), `WirelessLanModesDiagram`(구성 갈래), `FstabFieldsDiagram`(칸 줄)과 그 테스트, `src/data/network/visuals/wireless-lan.json`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`protocols-encapsulation` 주제 객체 바로 뒤(= `ethernet` 주제 객체 앞)에 주제 객체를 끼운다 — `{ "id": "transmission-media", "title": "전송 매체와 신호", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 3(★★★, 출제 10/11회)인지 `data.test.ts`의 주제 지도 표와 견준다. 끼운 자리의 `  }` / `,` / `  {` 줄 꼴이 기존과 같은지 본다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `transmission-media.transmission-media` | 전송 매체 | — | 이 주제의 첫 개념이라 **신호**(비트를 실어 보내려고 바꾼 전기·빛·전파의 변화)를 한 줄로 풀고 물리 계층(`osi-model`)과 뜻을 맞춘다. 전송 매체의 뜻, 유선 매체와 무선 매체(step 0의 이름대로), 구리선은 전기·광섬유는 빛·무선은 전파, 매체를 견주는 축(대역폭·거리에 따른 약해짐·바깥 잡음 — step 0 결과대로, 대역폭은 `network-basics.bandwidth`와 뜻을 맞춘 한 줄). 세 유선 매체는 이름만 들고 딸린 개념이 푼다(진행 안내 없이). **유선 매체와 무선 매체**(4절), **통신 링크와 전송 매체**(4절). 예: `PC01`과 `SW01`(장비 이름표 — 스위치는 한 줄로 푼다) 사이는 케이블, 노트북과 공유기 사이는 전파(「예시 값」) |
| 2 | `transmission-media.twisted-pair` | 트위스티드 페어 케이블 | `transmission-media.transmission-media` | 구조(구리선 둘을 꼰 쌍 여럿 — step 0 결과대로), 꼬는 까닭, UTP와 STP(step 0 결과대로 — 표기는 근거가 있을 때만), 등급(근거대로 한 줄), 이더넷의 10BASE-T·100BASE-TX가 쓰는 쌍과 8핀 가운데 쓰는 핀·길이 한도(step 0 결과대로 — 이더넷과 규격 이름은 이 자리에서 한 줄로 푼다, `ethernet.standard-names`와 뜻을 맞춘다). **UTP와 STP**(4절), **트위스티드 페어와 광케이블**(4절 — 광케이블은 이 자리에서 한 줄로 푼다). 예: `PC01`과 `SW01` 사이의 케이블 한 가닥 |

이 주제의 단위 표기(`100 m`·`Mb/s` 등)를 이 step이 정한다 — `ethernet.standard-names`의 `10 Mb/s` 꼴에 맞추고 summary에 적는다.

### 2. 문항 — `src/data/network/questions.json`에 `n353`~`n354`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n353` | `transmission-media` | 예/아니요 「개념 확인」 — **예** 쪽으로 세운다. 흔한 오해 「전송 매체 = 케이블」을 겨냥한다. 예: 노트북 `PC07`이 케이블 없이 전파로 공유기와 데이터를 주고받는다. 이 통신에도 신호가 지나가는 전송 매체가 있나요?(예 — step 0이 무선 매체를 매체로 보는 근거를 찾았을 때. 찾지 못했으면 다른 주장으로 바꾸고 summary에). 해설은 유선·무선 매체의 차이를 가르친다 |
| `n354` | `twisted-pair` | 4지선다 「원리 이해」 — 구리선을 두 가닥씩 꼬거나 차폐를 두는 까닭을 묻는다(예: 공장의 큰 전동기 옆을 지나는 구리 케이블에서 바깥 전기 잡음의 영향을 더 줄이려면 무엇이 있는 케이블을 고르나 — 정답 차폐(STP), step 0 결과대로). 오답은 같은 범주(케이블 구조나 그 효과)에서 실제로 헷갈리는 것. **정답 위치 0**. 오답에 광케이블을 넣으면 「간섭을 덜 받는 매체」로 정답이 둘이 될 수 있다 — 문제문의 조건(「구리 케이블 가운데」 등)으로 갈라 둔다(guide.md 「문항」 4항) |

이 step이 끝나면 예 71·아니요 70, 정답 위치 54/53/53/53이다(guide.md 「문항」 9항). 문항 글에 백틱을 쓰지 않는다.

### 3. 도식

이 step이 `src/data/network/visuals/transmission-media.json`을 만들고 `src/data/network/index.ts`에 import(`transmissionMediaVisuals` — 경로 알파벳순, `tcp-udp.json` 뒤)와 `visualsByTopicId`의 `'transmission-media': transmissionMediaVisuals`(`'protocols-encapsulation'` 바로 뒤)를 넣는다.

#### 3-1. `transmission-media` — `MediaSignalKindsDiagram`, JSON 키 `media-signal-kinds`

- 물음형 제목 예: `매체마다 무엇이 신호를 실어 나를까?`
- 그릴 것: 왼쪽 「보내는 쪽」, 오른쪽 「받는 쪽」 노드. 가운데에 매체 노드 셋 — 「구리선」·「광섬유」(그룹 박스 「유선 매체」 안), 「공간」(그룹 박스 「무선 매체」 안 — 이름은 본문대로) — 과 보내는 쪽에서 매체를 지나 받는 쪽으로 가는 경로 셋. 곁말로 매체마다 신호의 종류(전기·빛·전파).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `wired` | 유선 매체 | 양 끝과 구리선·광섬유, 그 둘을 지나는 경로 | 케이블이 신호를 길을 따라 이끈다 — 구리선은 전기, 광섬유는 빛 |
  | `wireless` | 무선 매체 | 양 끝과 공간, 그것을 지나는 경로 | 케이블 없이 전파가 공간으로 퍼져 간다 |

- 요점 테스트: `wired`에서 보이는 경로가 모두 「유선 매체」 그룹 박스 안의 노드를 지나고, `wireless`에서 보이는 경로는 「무선 매체」 그룹 안의 노드만 지난다. 두 시나리오의 선명한 매체 노드 집합이 겹치지 않는다.

#### 3-2. `twisted-pair` — `TwistedPairPinsDiagram`, JSON 키 `twisted-pair-pins`

- 물음형 제목 예: `트위스티드 페어 케이블의 여덟 가닥 가운데 무엇을 쓸까?`
- 그릴 것: 커넥터의 핀 1~8 노드(세로로 쌓는다 — 280 폭에서 한 줄에 넷 이상 두지 않는다), 꼰 쌍을 묶은 그룹 박스 넷(어느 핀끼리 한 쌍인지는 step 0 결과대로), 10BASE-T가 보내기·받기에 쓰는 핀에서 「보내는 쌍」·「받는 쌍」 노드로 가는 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `pairs` | 네 쌍 | 핀 여덟 모두 | 여덟 가닥이 두 가닥씩 꼬인 네 쌍이다 |
  | `in-use` | 10BASE-T가 쓰는 쌍 | 쓰는 핀 넷과 보내는 쌍·받는 쌍 노드, 그 경로 | 쌍 둘 가운데 하나로 보내고 하나로 받는다(step 0 결과대로) |

- 요점 테스트: `in-use`에서 선명한 핀이 step 0이 확인한 핀 넷과 같고, 보내는 쌍과 받는 쌍으로 가는 경로가 서로 다른 핀에서 시작한다.
- **step 0이 핀 배치를 확인하지 못했으면** 이 설계를 버리고 UTP와 STP의 겹(구리선 쌍 → 차폐 → 피복, 안에서 밖으로 쌓은 칸 노드)을 시나리오 `utp`·`stp`로 그린다 — 바꾼 것과 이유를 summary에 적는다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 354개, 마지막 id는 `n354`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `protocols-encapsulation` 바로 뒤·`ethernet` 바로 앞에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. 이더넷·IP를 모르는 학습자가 읽어도 막히지 않는가. step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가.
4. n354의 보기 넷을 step 0의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
5. 정한 단위 표기를 summary에 적는다 — 뒤 step이 따른다.
6. guide.md 「검증 절차의 끝」대로 `phases/83-network-media-topology-cloud-raid/index.json`의 step 1을 갱신한다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~10을 만들지 마라.** 이유: step 2~6의 범위다. 동축·광케이블은 이 step에서 이름과 한 줄 풀이만 쓴다.
- **이더넷·IP에 기대어 설명하지 마라.** 이유: 이 주제는 주제 지도에서 이더넷보다 앞이다(guide.md 「배경」). 10BASE-T를 쓸 때는 그 자리에서 한 줄로 푼다.
- **step 0이 확인하지 못한 사실(핀 번호·길이 한도·등급)을 사실처럼 쓰지 마라.**
