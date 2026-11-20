# Step 5: wpan-zigbee

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `wireless-lan`의 개념 둘(7 WPAN, 8 Zigbee)의 글·문항·도식을 함께 만든다.** 8은 7에 딸린 개념이다.

기출은 한 사람 주변의 장치를 잇는 무선 네트워크가 WPAN이라는 것과 802.15의 규격 짝([기출 2024-08-25 #22]·[기출 2024-11-03 #20]·[기출 2025-05-25 #23] — 오답 LTE-M·NB-IoT·LAN),
802.15.4 위에 선 저전력 무선 기술이 Zigbee라는 것([기출 2026-02-01 #9] — 오답 BLE·Z-Wave·802.11ah)을 묻는다.

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 4 `summary`(WPAN·802.15.x·Bluetooth·BLE, Zigbee·Z-Wave, 기출 판정, E 번호, 한국어 이름)와 step 0~3 `summary`(단위 표기, 앞 개념이 푼 낱말)
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 1과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 0·4)」 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`wireless-lan`의 앞 개념 여섯(step 1~3)**, 특히 `wireless-lan`(스테이션·AP·LAN)·`ieee-80211-standards`(802.11ah)
- `src/data/network/questions.json`, `src/data/network/visuals/wireless-lan.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `OsiStackDiagram`·`HttpsStackDiagram`(계층 쌓기), `VirtualSwitchTypesDiagram`(갈래별 연결), `Ieee80211BandsDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-08-25 #22], [기출 2024-11-03 #20], [기출 2025-05-25 #23], [기출 2026-02-01 #9] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `wireless-lan` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `wireless-lan.wpan` | WPAN | — | **목록 개념**. 소개 문단 — WPAN의 뜻(한 사람 주변 몇 미터 안 — step 4 결과대로)과 802.15가 그 표준 묶음이라는 것. 항목 셋(802.15.1·802.15.3·802.15.4 — 무엇을 정했는지와 상태는 step 4 결과대로 — 「글」의 항목 이름 규칙). 항목 뒤 문단: Bluetooth(Bluetooth SIG가 정한다 — 802.15.1과의 관계는 step 4 결과대로)와 BLE(한 줄), LTE-M·NB-IoT는 step 4가 근거를 찾지 못했으면 쓰지 않는다. **WPAN과 무선 LAN**(4절 — 거리·전력·표준 묶음, 앞 개념 `wireless-lan`과 뜻을 맞춘다). 예: 휴대폰과 무선 이어폰, 전지로 오래 일하는 센서 `SENSOR01`(「예시 값」 — 어느 규격의 예인지는 step 4 결과대로) |
| 8 | `wireless-lan.zigbee` | Zigbee | `wireless-lan.wpan` | Zigbee의 뜻(802.15.4의 물리·MAC 계층 위에 네트워크·응용 계층을 더한 것 — CSA가 정한다, step 4 결과대로), 장치의 역할(이름은 step 4 결과대로), 메시 모양으로 이어질 수 있다는 것(그 자리에서 한 줄로 푼다 — 메시는 같은 주제의 뒤 개념이 자세히 쓰지만 진행 안내를 붙이지 않는다), 쓰는 곳(근거대로). Z-Wave(G.9959 — 한 줄), BLE와 802.11ah는 앞 개념의 한 줄과 뜻을 맞춘다. **Zigbee와 802.15.4**(4절 — 아래 계층과 그 위), **Zigbee와 BLE**(4절 — step 4가 근거를 찾은 만큼). 예: 조명 `LIGHT01`과 센서 `SENSOR01`이 다른 장치를 거쳐 코디네이터에 이어진다(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n320`~`n322`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n320` | `wpan` | 4지선다 「상황 적용」 — 본문과 다른 장면(전지 하나로 오래 일해야 하고 적은 데이터를 가끔 보내는 센서 여럿을 잇는다 등)을 주고 알맞은 802 규격을 고르게 한다. 정답·오답은 802.15.x와 802.11 가운데서(step 4가 확인한 범위). **정답 위치 0**. 기출 묶음(802.15.1·.3·.4의 짝, LTE-M·NB-IoT·LAN·WPAN)을 쓰지 않는다 — 보기 넷이 그 묶음과 둘 이상 달라야 한다 |
| `n321` | `wpan` | 예/아니요 「개념 확인」 — **예** 쪽으로 세운다. 예: 휴대폰과 스마트워치처럼 한 사람 몸 주변의 장치를 잇는 무선 네트워크는, 사무실 전체를 덮는 무선 LAN과 다른 IEEE 802 표준 묶음이 정하나요?(예 — 802.15와 802.11, step 4 결과대로). 해설은 WPAN과 무선 LAN의 차이를 가르친다. n320과 다른 것을 묻는다 |
| `n322` | `zigbee` | 4지선다 「원리 이해」 — Zigbee와 802.15.4의 관계를 묻는다. 예: Zigbee가 802.15.4 위에 더한 것이 무엇인지, 또는 802.15.4가 정하고 Zigbee는 그대로 쓰는 것이 무엇인지(정답·오답은 계층 이름이나 그 계층이 하는 일 — step 4 결과대로). **정답 위치 1**. 기출 묶음(BLE·Z-Wave·802.11ah·Zigbee)을 쓰지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 64·아니요 64, 정답 위치 49/49/48/48.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `wpan` — `WpanStandardsDiagram`, JSON 키 `wpan-standards`

- 물음형 제목 예: `WPAN의 규격은 무엇에 맞춰 나뉘었을까?`
- 그릴 것: 802.15 그룹 박스 안에 802.15.1·802.15.3·802.15.4 노드, 그리고 각 규격의 쓰임을 보이는 예 노드(본문에 나온 것만 — 예: 무선 이어폰, `SENSOR01`). 802.15.1 노드와 Bluetooth 노드를 잇는 경로(본문이 둘의 관계를 쓴 만큼).
- 시나리오(규격마다 하나):

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `dot1` | 802.15.1 | 802.15.1·Bluetooth와 그 예 | 본문의 802.15.1 설명 |
  | `dot3` | 802.15.3 | 802.15.3과 그 예 | 본문의 802.15.3 설명(고속) |
  | `dot4` | 802.15.4 | 802.15.4와 그 예 | 본문의 802.15.4 설명(저속·저전력) |

- 요점 테스트: 시나리오마다 선명한 규격 노드가 정확히 하나이고 서로 다르다. 세 규격 노드가 모두 802.15 그룹 박스 안에 있다.

#### 3-2. `zigbee` — `ZigbeeStackDiagram`, JSON 키 `zigbee-stack`

- 물음형 제목 예: `Zigbee는 802.15.4 위에 무엇을 더했을까?`
- 그릴 것: 아래에서 위로 쌓은 계층 칸 넷(물리 계층·MAC 계층을 802.15.4 그룹 박스로, 네트워크 계층·응용 계층을 Zigbee 그룹 박스로 — 계층 이름은 step 4 결과대로)과, 옆에 장치 역할 노드(코디네이터·라우터·엔드 디바이스 — 본문의 예 `LIGHT01`·`SENSOR01`)와 그 연결 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `layers` | 계층 | 계층 칸 넷 | 아래 두 계층은 802.15.4가, 그 위는 Zigbee가 정한다 |
  | `roles` | 장치 역할 | 역할 노드와 연결 경로 | 엔드 디바이스의 데이터가 라우터를 거쳐 코디네이터에 닿는다(본문의 말대로) |

- 요점 테스트: 802.15.4 그룹 박스 안의 칸과 Zigbee 그룹 박스 안의 칸이 겹치지 않고 Zigbee 박스가 위에 있다(y가 작다). `roles`에서만 역할 노드 사이 경로가 보인다.

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. step 4가 장치 역할을 확인하지 못했으면 `roles`를 빼고 정지 그림으로 만든다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 322개, 마지막 id는 `n322`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. CSA·Bluetooth SIG 문서의 사실을 그 기술(Zigbee·Bluetooth)에만 썼는가.
3. n320·n322의 보기 넷을 step 4의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/82-network-devices-wireless-security/index.json`의 step 5를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 9~11을 만들지 마라.** 이유: step 6~7의 범위다.
- **Bluetooth 프로파일·페어링, Zigbee의 응용 프로파일·보안, 802.15의 다른 규격을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 1~3의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
