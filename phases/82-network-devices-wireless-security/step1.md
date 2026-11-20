# Step 1: wlan-basics-transmission

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 주제 `wireless-lan`을 만들고 그 첫 개념 둘(1 무선 LAN, 2 무선 LAN의 전송 방식)의 글·문항·도식을 함께 만든다.** 2는 1에 딸린 개념이다.
이 주제 화면만 읽고도 LAN·프레임·전파·주파수의 뜻이 서게 쓴다. 학습자는 이더넷·허브·스위치까지 보았고 IP는 아직 모른다고 본다(guide.md 「배경」).

기출은 무선 LAN의 전송 방식 가운데 대역 확산 방식이 가장 많이 쓰인다는 것을 묻는다([기출 2024-02-25 #49] — 오답 적외선·레이저·협대역, 처리는 step 0 결과대로).

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 0 `summary`(스테이션·AP·BSS·IBSS·SSID, 대역 이름, 「Wi-Fi」를 쓸 수 있는지, 전송 방식, 기출 판정, E 번호, 한국어 이름)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 0)」 줄과 항목), `docs/source/network/exam-notes.md`(E41~가 있으면 그 항목)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(`network-basics.lan-wan`, `ethernet.ethernet`·`mac-address`·`frame`, `hub-switch-vlan.hub`·`switch` — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `HubRepeatDiagram`·`SwitchDecisionDiagram`(장치 사이의 길), `VirtualSwitchTypesDiagram`(갈래별 연결), `OsiStackDiagram`(갈래와 묶음)과 그 테스트, `src/data/network/visuals/hub-switch-vlan.json`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-02-25 #49] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`hub-switch-vlan` 주제 객체 바로 뒤(= `ip-protocol` 주제 객체 앞)에 주제 객체를 끼운다 — `{ "id": "wireless-lan", "title": "무선 LAN과 이동통신", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 3(★★★, 출제 10/11회)인지 `data.test.ts`의 주제 지도 표와 견준다. 끼운 자리의 `  }` / `,` / `  {` 줄 꼴이 기존과 같은지 본다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `wireless-lan.wireless-lan` | 무선 LAN | — | 이 주제의 첫 개념이라 **LAN**(한 건물·사무실 안의 장치를 잇는 네트워크), **프레임**(LAN에서 장치끼리 주고받는 데이터 덩어리), **MAC 주소**(장치마다 붙은 하드웨어 주소)를 한 줄씩 푼다 — 앞 주제(`network-basics.lan-wan`·`ethernet`)와 뜻을 맞춘다. **전파**와 **주파수 대역**(한 줄씩), 스테이션·AP·SSID, 두 구성(인프라스트럭처 모드·애드혹 모드 — step 0 결과의 802.11 이름과 함께). 무선 LAN도 802 가족의 LAN이라 같은 MAC 주소를 쓴다는 것은 step 0 결과대로. 「Wi-Fi」는 step 0이 근거를 찾았을 때만. **유선 LAN과 무선 LAN**(4절), **인프라스트럭처 모드와 애드혹 모드**(4절). 예: `LAPTOP01`·`LAPTOP02`가 `AP01`(SSID `OfficeNet`)에 이어져 `AP01`을 거쳐 통신하고, AP 없이 둘이 직접 통신할 수도 있다(「예시 값」 — 이름표라고 밝힌다) |
| 2 | `wireless-lan.wlan-transmission` | 무선 LAN의 전송 방식 | `wireless-lan.wireless-lan` | **목록 개념**. 소개 문단 — 무선 LAN의 물리 계층이 비트를 전파(또는 빛)에 싣는 방법이 규격마다 정해져 있다는 것. 항목 넷(적외선·FHSS·DSSS·OFDM — 이름·영문·쓰인 규격은 step 0 결과대로 — 「글」의 항목 이름 규칙). 항목마다 그 방식이 신호를 어떻게 싣는지 한 문장. 항목 뒤 문단: 대역 확산이 FHSS·DSSS를 묶는 말이라는 것, 처음 표준과 뒤 규격의 방식(step 0 결과대로), 「자격시험은」 줄은 step 0이 E를 만들었을 때만. **FHSS와 DSSS**(4절), **대역 확산과 OFDM**(4절) |

### 2. 문항 — `src/data/network/questions.json`에 `n313`~`n314`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n313` | `wireless-lan` | 예/아니요 「원리 이해」 — **예** 쪽으로 세운다. 예: 회의실에 AP가 없는데 노트북 `LAPTOP07`과 `LAPTOP08`이 서로 파일을 무선으로 주고받아야 한다. 이 두 노트북이 AP 없이 무선 LAN으로 직접 통신할 수 있나요?(예 — 애드혹 모드, step 0 결과대로). 해설은 두 구성 방식의 차이를 가르친다 |
| `n314` | `wlan-transmission` | 4지선다 「개념 비교」 — 방식 이름을 보기로 두지 말고, 방식 하나의 동작(예: 「정해진 순서에 따라 보내는 주파수를 짧은 간격으로 계속 바꾼다」)을 주고 그것이 어느 방식인지 고르게 하거나, 반대로 방식 이름을 주고 그 동작을 고르게 한다. 오답은 같은 범주(다른 세 방식의 동작). **정답 위치 0**. 기출 묶음(적외선·레이저·주파수·협대역)을 쓰지 않는다 — 레이저·협대역은 보기로 쓰지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 63·아니요 62, 정답 위치 48/47/47/47.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

이 step이 `src/data/network/visuals/wireless-lan.json`을 만들고 `src/data/network/index.ts`에 import(`wirelessLanVisuals` — 경로 알파벳순, `windows-server-roles.json` 뒤)와 `visualsByTopicId`의 `'wireless-lan': wirelessLanVisuals`(`'hub-switch-vlan'` 바로 뒤)를 넣는다.

#### 3-1. `wireless-lan` — `WirelessLanModesDiagram`, JSON 키 `wlan-modes`

- 물음형 제목 예: `무선 LAN의 장치들은 누구를 거쳐 통신할까?`
- 그릴 것: `LAPTOP01`·`LAPTOP02`, `AP01`(SSID `OfficeNet` — 곁말이나 그룹 라벨), AP가 이어지는 유선 LAN 노드. 두 구성의 길을 각각 경로로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `infra` | 인프라스트럭처 모드 | 노트북 둘·`AP01`·유선 LAN과 AP를 거치는 경로 | 스테이션끼리도 AP를 거쳐 주고받고, AP가 유선 LAN과 잇는다 |
  | `adhoc` | 애드혹 모드 | 노트북 둘과 둘을 바로 잇는 경로 | AP 없이 스테이션끼리 직접 주고받는다 |

- 요점 테스트: `infra`에서 보이는 경로가 모두 `AP01`을 한쪽 끝으로 갖는다. `adhoc`에서 보이는 경로는 `LAPTOP01`과 `LAPTOP02`를 바로 잇고 `AP01`은 흐리다.

#### 3-2. `wlan-transmission` — `WlanTransmissionDiagram`, JSON 키 `wlan-transmission`

- 물음형 제목 예: `무선 LAN은 신호를 어떤 방법으로 실어 보낼까?`
- 그릴 것: 방식 노드 넷 — 대역 확산 그룹 박스 안에 FHSS·DSSS, 그 밖에 OFDM과 적외선 — 와, 그 방식을 쓰는 규격 노드(step 0이 확인한 것만 — 예: 처음 표준, 802.11b, 802.11a·g)를 방식 노드에 잇는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `spread` | 대역 확산 | FHSS·DSSS와 그 규격 | 신호를 좁은 주파수 하나가 아니라 넓은 대역에 퍼뜨려 보낸다 |
  | `ofdm` | OFDM | OFDM과 그 규격 | 데이터를 여러 부반송파에 나눠 함께 싣는다 |
  | `infrared` | 적외선 | 적외선과 처음 표준 | 전파가 아니라 빛으로 보낸다(본문의 말대로) |

- 요점 테스트: `spread`·`ofdm`·`infrared`의 선명한 방식 노드 집합이 서로 겹치지 않는다. FHSS·DSSS 노드가 대역 확산 그룹 박스 안에 있다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 314개, 마지막 id는 `n314`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `hub-switch-vlan` 바로 뒤·`ip-protocol` 바로 앞에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. IP를 모르는 학습자가 읽어도 막히지 않는가. step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가.
4. n314의 보기 넷을 step 0의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
5. 이 step이 정한 단위 표기(`2.4GHz` 꼴)를 summary에 적는다 — 뒤 step이 따른다.
6. `phases/82-network-devices-wireless-security/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~11을 만들지 마라.** 이유: step 2~7의 범위다. 채널·CSMA/CA·MIMO·규격은 이 step에서 이름만 쓰고 자세히 풀지 않는다.
- **IP 주소·라우터에 기대어 설명하지 마라.** 이유: 이 주제는 주제 지도에서 IP보다 앞이다(guide.md 「배경」).
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
