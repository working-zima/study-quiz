# Step 3: mimo-80211-standards

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `wireless-lan`의 개념 둘(5 MIMO, 6 IEEE 802.11 규격)의 글·문항·도식을 함께 만든다.** 둘 다 1(무선 LAN)에 딸린 개념이다.

기출은 안테나 여럿으로 전송률을 높이는 기술이 MIMO라는 것([기출 2024-08-25 #25]·[기출 2025-02-23 #24] — 오답 M2M·MQTT·OFDM),
802.11의 개정 규격마다 대역과 특징이 다르다는 것([기출 2024-05-19 #27] — 「802.11ac가 60GHz」가 틀린 말), 802.11ax와 그 OFDMA·MU-MIMO([기출 2025-02-23 #47] 지문·[기출 2025-11-02 #25])를 묻는다.

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 0 `summary`(MIMO·MU-MIMO·OFDMA와 규격, 개정 규격마다 대역·최대 전송률·방식·해·상태, 802.11ah·be, 세대 이름, 기출 판정, E 번호)와 step 1~2 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 1과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 0)」 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`wireless-lan`의 앞 개념 넷(step 1~2)**, 특히 `wlan-transmission`(OFDM)·`wireless-channel`(대역·채널)
- `src/data/network/questions.json`, `src/data/network/visuals/wireless-lan.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `VirtualSwitchTypesDiagram`(갈래별 연결), `WellKnownPortsDiagram`·`PortRangesDiagram`(이름과 범위의 짝), `WlanTransmissionDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-08-25 #25], [기출 2025-02-23 #24], [기출 2024-05-19 #27], [기출 2025-02-23 #47], [기출 2025-11-02 #25] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `wireless-lan` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `wireless-lan.mimo` | MIMO | `wireless-lan.wireless-lan` | MIMO의 뜻(이름을 낱말마다 풀어 쓴다), **안테나**(전파를 내보내고 받는 부품 — 한 줄), 공간 스트림, 어느 규격부터인지(step 0 결과대로). MU-MIMO의 뜻과 하향·상향이 어느 규격부터인지(step 0 결과대로). **MIMO와 MU-MIMO**(4절), **MIMO와 OFDM**(4절 — 앞 개념 `wlan-transmission`의 OFDM과 뜻을 맞춘다). 빔포밍은 step 0이 근거를 찾았을 때만 한 줄. 예: 안테나 넷인 `AP01`이 `LAPTOP01`에 공간 스트림 둘을 함께 보내고, MU-MIMO라면 `LAPTOP01`과 `LAPTOP02`에 하나씩 동시에 보낸다(「예시 값」 — 이름표와 수는 예라고 밝힌다) |
| 6 | `wireless-lan.ieee-80211-standards` | IEEE 802.11 규격 | `wireless-lan.wireless-lan` | **목록 개념**. 소개 문단 — 802.11이 처음 나온 뒤 개정 규격이 이름 끝 글자로 붙어 나왔고, 규격마다 쓰는 대역과 최대 데이터 전송률과 방식이 다르다는 것(step 0 결과대로). 항목 일곱(802.11b·a·g·n·ac·ad·ax — 차례는 나온 차례나 step 0이 정한 차례)에 항목마다 대역·최대 전송률·방식·특징 한 문장(step 0이 확인한 값만 — 값이 없는 칸은 쓰지 않는다). 802.11ax 항목에서 OFDMA를 한 줄로 푼다. 항목 뒤 문단: 802.11ah·802.11be 한 줄씩, 세대 이름은 step 0이 근거를 찾았을 때만. **802.11ac와 802.11ad**(4절), **802.11a와 802.11b**(4절). 「자격시험은」 줄은 step 0이 E를 만들었을 때만 |

### 2. 문항 — `src/data/network/questions.json`에 `n317`~`n319`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n317` | `mimo` | 4지선다 「원리 이해」 — MIMO가 전송률을 높이는 방법을 고르게 한다. 정답은 같은 채널에서 안테나 여럿으로 공간 스트림 여럿을 함께 보낸다는 것(step 0 결과대로), 오답은 이 주제에 있는 다른 방법과 흔한 혼동(데이터를 여러 부반송파에 나눠 싣는다 — OFDM, 보내는 주파수를 차례로 바꾼다 — FHSS, 채널이 빌 때까지 무작위 시간을 기다린다 — CSMA/CA 등 — 출처로 정말 MIMO가 아닌지 따진다). **OFDMA와 MU-MIMO는 둘 다 여러 스테이션에 동시에 보내므로 「여러 스테이션에 동시에」를 정답의 근거로 삼지 마라.** **정답 위치 2**. 기출 묶음(M2M·MQTT·OFDM·MIMO)을 쓰지 않는다 |
| `n318` | `ieee-80211-standards` | 4지선다 「개념 비교」 — 규격 하나의 대역과 특징(step 0이 확인한 값 — 예: 2.4GHz와 5GHz를 모두 쓰고 MIMO를 처음 들였다)을 주고 그 규격을 고르게 한다. 오답은 대역이나 특징 하나가 겹치는 다른 개정 규격. **정답 위치 3**. 기출 묶음(n·ac·be·ax / n·ac·ad·ax, a·b·g·ac의 특징 넷)을 쓰지 않는다 — 보기 넷이 그 묶음과 둘 이상 달라야 한다 |
| `n319` | `ieee-80211-standards` | 예/아니요 「개념 확인」 — **아니요** 쪽으로 세운다. 예: 60GHz 대역으로 통신해야 하는 장치에 802.11ac만 지원하는 AP를 두면, 그 AP로 60GHz 대역 통신을 할 수 있나요?(아니요 — 802.11ac는 5GHz 대역, 60GHz는 802.11ad, step 0 결과대로). 해설은 두 규격의 대역과 이름이 비슷해 헷갈리는 까닭을 가르친다. n318과 다른 것을 묻는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 63·아니요 64, 정답 위치 48/48/48/48.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `mimo` — `MimoStreamsDiagram`, JSON 키 `mimo-streams`

- 물음형 제목 예: `안테나가 여럿이면 무엇을 함께 보낼 수 있을까?`
- 그릴 것: `AP01`(그룹 박스 — 안에 안테나 노드 넷을 「안테나 1」~「안테나 4」 같은 이름표로, 안테나 그림은 그리지 않는다), `LAPTOP01`·`LAPTOP02`, 공간 스트림 경로 둘.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `mimo` | MIMO | `AP01`·`LAPTOP01`과 스트림 경로 둘 | 같은 채널에서 공간 스트림 둘을 한 스테이션에 함께 보내 전송률을 높인다 |
  | `mu-mimo` | MU-MIMO | `AP01`·노트북 둘과 스트림 경로 둘 | 스트림을 서로 다른 스테이션에 동시에 보낸다 |

- 요점 테스트: `mimo`에서 보이는 스트림 경로 둘이 모두 `LAPTOP01`에서 끝나고, `mu-mimo`에서는 서로 다른 노트북에서 끝난다. 두 시나리오의 보이는 경로 id 집합이 다르다.

#### 3-2. `ieee-80211-standards` — `Ieee80211BandsDiagram`, JSON 키 `ieee-80211-bands`

- 물음형 제목 예: `802.11 규격들은 어느 주파수 대역을 쓸까?`
- 그릴 것: 대역 노드(본문에 나온 대역만 — 예: 2.4GHz·5GHz·60GHz, step 0 결과에 6GHz가 있으면 그것도) 한 줄이나 한 열과, 규격 노드 일곱을 대역 노드에 잇는 경로(두 대역을 쓰는 규격은 경로 둘). 280 폭에서는 규격을 세로로 쌓는다.
- 시나리오(대역마다 하나 — 본문에 나온 대역 수만큼):

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `band-24` | 2.4GHz | 2.4GHz 노드와 그 대역을 쓰는 규격·경로 | 그 대역을 쓰는 규격(본문의 값대로) |
  | `band-5` | 5GHz | 5GHz 노드와 그 대역을 쓰는 규격·경로 | 802.11ac는 이 대역을 쓴다 |
  | `band-60` | 60GHz | 60GHz 노드와 802.11ad·경로 | 60GHz 대역은 802.11ad가 쓴다 — 이름이 비슷한 802.11ac와 다르다 |

- 요점 테스트: 802.11ac 노드는 `band-5`에서 선명하고 `band-60`에서 흐리다. 802.11ad 노드는 `band-60`에서만 선명하다. 각 시나리오의 선명한 규격이 본문 항목의 대역과 같다(테스트가 JSON의 규격·대역 짝을 본문 문자열과 견준다).

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 319개, 마지막 id는 `n319`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 규격마다의 대역·전송률·방식이 step 0의 표와 하나씩 맞는가.
3. n317·n318의 보기 넷을 step 0의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/82-network-devices-wireless-security/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 7~11을 만들지 마라.** 이유: step 5~7의 범위다.
- **변조 방식(QAM)·채널 결합·전송률 표 전체·Wi-Fi Alliance의 인증 이름을 쓰지 마라.** 이유: 기출이 묻지 않고(ADR-059 「범위」), 세대 이름은 허용한 출처에 근거가 있을 때만 쓴다.
- **step 1~2의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
