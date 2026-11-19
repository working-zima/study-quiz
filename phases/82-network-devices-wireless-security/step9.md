# Step 9: device-layers-repeater

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 주제 `network-devices`를 만들고 그 첫 개념 둘(1 계층별 네트워크 장비, 2 리피터)의 글·문항·도식을 함께 만든다.** 2는 1에 딸린 개념이다.
이 주제 화면만 읽고도 계층·프레임·패킷·주소의 뜻이 서게 쓴다.

기출은 약해진 신호를 다시 만들어 보내는 장비인 리피터가 물리 계층 장비라는 것을 묻는다([기출 2025-08-24 #47]). 장비와 계층의 짝은 게이트웨이·L4 스위치 기출의 바탕이다.

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 8 `summary`(장비마다 계층과 보는 것, 「L3 스위치」의 처리, 리피터의 동작, 기출 판정, E 번호, 한국어 이름)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 8)」 줄과 항목, phase 72의 802.3 항목), `docs/source/network/exam-notes.md`(E7과 phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(`network-basics.network-equipment`, `protocols-encapsulation.osi-model`·`pdu-names`, `hub-switch-vlan.hub`·`switch`·`collision-domain`, `routing.routing` — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `OsiStackDiagram`·`LayerMappingDiagram`(계층과 짝), `HubRepeatDiagram`·`CollisionDomainDiagram`(리피터·허브와 충돌 도메인)과 그 테스트, `src/data/network/visuals/hub-switch-vlan.json`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-08-24 #47], [기출 2026-02-01 #6] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`app-protocols-mgmt-security` 주제 객체 바로 뒤(= `diagnostic-commands` 주제 객체 앞)에 주제 객체를 끼운다 — `{ "id": "network-devices", "title": "네트워크 장비와 부하 분산", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 3(★★★, 출제 11/11회)인지 `data.test.ts`의 주제 지도 표와 견준다. 끼운 자리의 `  }` / `,` / `  {` 줄 꼴이 기존과 같은지 본다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `network-devices.device-layers` | 계층별 네트워크 장비 | — | **목록 개념**. 소개 문단 — 이 주제의 첫 개념이라 **계층**(통신의 일을 층으로 나눈 것 — OSI 모델의 일곱 층, 한 줄), **프레임**·**패킷**(층마다 다루는 데이터 덩어리 — 한 줄), **MAC 주소**·**IP 주소**·**포트 번호**(한 줄씩)를 짧게 풀고, 장비마다 데이터의 어디까지 읽고 전달을 정하는지가 다르다는 것. 항목 다섯(리피터와 허브·브리지와 스위치·라우터·부하 분산 장치·게이트웨이 — 계층과 보는 것은 step 8 결과대로 — 「글」의 항목 이름 규칙). 항목 뒤 문단: 위 계층 장비일수록 더 많이 읽는다는 것(근거대로), 시험 이름(L2 스위치는 E7, L3 스위치는 step 8 결과대로 — 표준에 없으면 「자격시험은 ~로 부른다」 한 줄). **스위치와 라우터**(4절). 예: `PC01`의 데이터가 스위치 `SW01`과 라우터 `R01`을 거쳐 웹 서버 `SRV01`에 닿을 때 장비마다 무엇을 읽는지(「예시 값」 — 단계대로) |
| 2 | `network-devices.repeater` | 리피터 | `network-devices.device-layers` | 리피터의 뜻(step 8 결과대로), 신호가 케이블을 지나며 약해지고 일그러진다는 것(근거대로), 리피터가 신호를 다시 만들어 보낸다는 것과 그것이 신호를 키우기만 하는 것과 무엇이 다른지(step 8이 근거를 찾은 만큼 — 없으면 쓰지 않는다), 주소를 읽지 않아 충돌 도메인을 나누지 않는다는 것, 허브와의 관계, 802.3의 권고 줄(`hub-switch-vlan.hub`와 같은 사실). **리피터와 스위치**(4절). 예: 케이블 두 구간 사이의 리피터 `RP01`(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n327`~`n328`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n327` | `device-layers` | 4지선다 「상황 적용」 — 본문과 다른 장면(다른 건물의 네트워크로 가는 패킷이 목적지 IP 주소에 따라 길을 고르는 장비를 지나야 한다 등)을 주고 그 일을 하는 장비를 고르게 하거나, 장비 하나를 주고 그 장비가 전달을 정할 때 보는 값을 고르게 한다(정답·오답은 step 8이 확인한 장비·값만). **정답 위치 0**. 기출 묶음(L1·L2·L3·L4 스위치, 허브·리피터·물리 주소 캐시)을 쓰지 않는다 — 이 문항은 L 숫자가 붙은 시험 이름을 보기로 쓰지 않는다 |
| `n328` | `repeater` | 예/아니요 「원리 이해」 — **아니요** 쪽으로 세운다. 예: 케이블 두 구간을 리피터로 이었다. 이 리피터는 받은 프레임의 목적지 MAC 주소를 읽고, 그 주소가 있는 구간 쪽으로 프레임을 보낼지 정하나요?(아니요 — 물리 계층 장비라 주소를 읽지 않고 신호를 다시 만들어 내보낸다, step 8 결과대로). 해설은 리피터와 스위치의 차이와 충돌 도메인을 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 65·아니요 66, 정답 위치 50/49/49/49.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

이 step이 `src/data/network/visuals/network-devices.json`을 만들고 `src/data/network/index.ts`에 import(`networkDevicesVisuals` — 경로 알파벳순, `network-basics.json` 뒤)와 `visualsByTopicId`의 `'network-devices': networkDevicesVisuals`(`'app-protocols-mgmt-security'` 바로 뒤)를 넣는다.

#### 3-1. `device-layers` — `DeviceLayersDiagram`, JSON 키 `device-layers`

- 물음형 제목 예: `네트워크 장비는 데이터의 어디까지 읽을까?`
- 그릴 것: 왼쪽에 아래에서 위로 쌓은 계층 칸(본문에 나온 계층만 — 물리·데이터 링크·네트워크·전송·응용 등), 오른쪽에 장비 노드(리피터와 허브·브리지와 스위치·라우터·부하 분산 장치·게이트웨이 — 본문 항목 이름 그대로)를 그 장비가 읽는 가장 높은 계층의 높이에 둔다. 장비 노드에서 그 계층 칸으로 가는 경로.
- 시나리오(장비 갈래마다 — 본문 항목 수만큼, 게이트웨이처럼 계층이 하나로 정해지지 않는 장비는 본문의 말대로 곁말로 밝힌다):

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `physical` | 리피터와 허브 | 그 장비와 물리 계층 칸 | 신호만 다루고 주소를 읽지 않는다 |
  | `datalink` | 브리지와 스위치 | 그 장비와 물리·데이터 링크 칸 | MAC 주소로 포트를 고른다 |
  | `network` | 라우터 | 그 장비와 네트워크까지의 칸 | IP 주소로 다음 경로를 고른다 |
  | `upper` | 부하 분산 장치 | 그 장비와 전송·응용까지의 칸 | 포트 번호나 요청 내용으로 서버를 고른다 |

- 요점 테스트: 선명한 계층 칸의 수가 `physical` < `datalink` < `network` < `upper` 차례로 늘어난다. 시나리오마다 선명한 장비 노드가 하나(또는 본문 항목 하나)다.

#### 3-2. `repeater` — `RepeaterRegenerateDiagram`, JSON 키 `repeater-regenerate`

- 물음형 제목 예: `리피터를 지난 신호는 무엇이 달라질까?`
- 그릴 것: 구간 1의 장치 노드와 구간 2의 장치 노드, 그 사이 `RP01`. 「약해진 신호」 노드(구간 1 쪽)와 「다시 만든 신호」 노드(구간 2 쪽) — 본문의 말대로. 두 구간을 감싸는 충돌 도메인 그룹 박스 하나.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `regenerate` | 신호 다시 만들기 | 약해진 신호·`RP01`·다시 만든 신호와 그 경로 | 약해진 신호를 받아 다시 만들어 내보내 거리를 늘린다(본문의 말대로) |
  | `no-address` | 주소를 읽지 않음 | 두 구간의 장치·`RP01`과 양쪽으로 가는 경로 | 주소를 보지 않고 반대쪽 구간으로 모두 내보내 두 구간이 한 충돌 도메인이다 |

- 요점 테스트: `regenerate`에서 보이는 경로가 약해진 신호 → `RP01` → 다시 만든 신호 차례다. `no-address`에서 `RP01`에서 나가는 경로가 두 구간 모두로 보이고, 충돌 도메인 그룹 박스가 두 구간의 장치 노드를 모두 감싼다.

위 도식 설계는 출발점이다. 본문(step 8 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. step 8이 「다시 만든다」의 근거를 찾지 못했으면 `regenerate`의 노드 이름과 캡션을 본문의 말로 바꾼다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 328개, 마지막 id는 `n328`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `app-protocols-mgmt-security` 바로 뒤·`diagnostic-commands` 바로 앞에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 앞 주제(`hub-switch-vlan`·`routing`)와 장비의 뜻이 어긋나지 않는가.
4. n327의 보기 넷을 step 8의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
5. `phases/82-network-devices-wireless-security/index.json`의 step 9를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~10을 만들지 마라.** 이유: step 10~14의 범위다. 게이트웨이·부하 분산 장치는 목록 항목에서 한 문장만 쓴다.
- **`hub-switch-vlan`·`routing`의 개념을 다시 쓰지 마라.** 이유: 이미 있는 개념이다(guide.md 「배경」). 이 주제 화면에 필요한 만큼만 한 줄로 푼다.
- **step 8이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
