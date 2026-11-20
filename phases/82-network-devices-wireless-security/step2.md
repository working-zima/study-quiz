# Step 2: wlan-channel-csma-ca

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `wireless-lan`의 개념 둘(3 무선 채널, 4 CSMA/CA)의 글·문항·도식을 함께 만든다.** 둘 다 1(무선 LAN)에 딸린 개념이다.

기출은 무선 호스트가 AP와 통신할 때 채널을 쓴다는 것([기출 2026-05-17 #27] — 「채널을 쓰지 않는다」가 틀린 말)과,
보내기 전에 채널을 확인하고 무작위로 기다리며 RTS/CTS를 쓰는 다중 접근 방식이 CSMA/CA라는 것([기출 2026-02-01 #27] — 오답 CSMA/CD·TDMA·토큰 패싱)을 묻는다.

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 0 `summary`(채널 번호·주파수·폭과 겹침, 한 BSS의 채널, 간섭, 채널 선택, CSMA/CA의 차례·RTS/CTS·숨은 스테이션, 기출 판정, E 번호)와 step 1 `summary`(단위 표기, 앞 개념이 푼 낱말)
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 1과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 0)」 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`wireless-lan`의 앞 개념 둘(step 1)**, `hub-switch-vlan.csma-cd`·`collision-domain`·`duplex`(뜻을 맞춘다)
- `src/data/network/questions.json`, `src/data/network/visuals/wireless-lan.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `CsmaCdDiagram`·`ThreeWayHandshakeDiagram`(두 장치 사이를 오가는 차례), `FstabFieldsDiagram`(줄과 칸), `WirelessLanModesDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2026-05-17 #27], [기출 2026-02-01 #27] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `wireless-lan` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `wireless-lan.wireless-channel` | 무선 채널 | `wireless-lan.wireless-lan` | 채널의 뜻, 2.4GHz 대역의 채널 번호·중심 주파수·폭과 이웃 채널이 겹친다는 것, 겹치지 않는 짝(모두 step 0이 확인한 값만), 5GHz 대역 한 줄. 한 BSS의 스테이션은 AP의 채널로 함께 통신한다는 것, 겹치는 채널의 이웃 AP 사이의 간섭, 채널을 정하는 일(step 0 결과대로 — 표준에 없으면 쓰지 않는다). **겹치는 채널과 겹치지 않는 채널**(4절), **채널과 주파수 대역**(4절). 계산 예: `AP01`과 이웃 `AP02`가 쓰는 두 채널의 중심 주파수 차이를 채널 폭과 견줘 겹치는지 따진다 — 겹치는 짝과 겹치지 않는 짝을 하나씩(채널 번호·주파수는 step 0이 확인한 값, 단계대로). step 0이 값을 찾지 못했으면 계산 예를 빼고 「이웃 채널은 겹치고 떨어진 채널은 겹치지 않는다」만 근거대로 쓴 뒤 summary에 적는다 |
| 4 | `wireless-lan.csma-ca` | CSMA/CA | `wireless-lan.wireless-lan` | CSMA/CA의 뜻(이름을 낱말마다 풀어 쓴다 — 반송파 감지·다중 접근·충돌 회피), 보내기 전의 차례 — 채널 듣기 → 비었어도 정해진 시간 기다리기 → 무작위 백오프 → 보내기 → 받는 쪽의 ACK(step 0 결과대로). ACK가 오지 않으면 다시 보낸다. 무선에서 충돌을 알아채기 어려운 까닭(근거대로). 숨은 스테이션 문제와 RTS/CTS(누가 무엇을 보내고, 들은 다른 스테이션이 무엇을 하는지 — step 0 결과대로). **CSMA/CD와 CSMA/CA**(4절 — `hub-switch-vlan.csma-cd`의 말과 맞춘다). 예: `LAPTOP01`이 `AP01`에 프레임 하나를 보내는 차례, `LAPTOP02`가 `LAPTOP01`의 전파를 듣지 못하는 자리에 있을 때 RTS/CTS가 하는 일(「예시 값」 — 단계대로) |

### 2. 문항 — `src/data/network/questions.json`에 `n315`~`n316`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n315` | `wireless-channel` | 예/아니요 「원리 이해」 — **아니요** 쪽으로 세운다. 예: 회의실 AP `AP07`에 노트북 `LAPTOP07`이 이어져 있다. `LAPTOP07`은 `AP07`이 쓰는 채널과 상관없이 자기가 고른 다른 채널로 `AP07`과 프레임을 주고받나요?(아니요 — 한 BSS의 스테이션은 AP의 채널로 통신한다, step 0 결과대로). 해설은 채널의 뜻과 이웃 AP의 채널을 떨어뜨리는 까닭을 가르친다. 기출의 특징 넷 묶음을 쓰지 않는다 |
| `n316` | `csma-ca` | 4지선다 「원리 이해」 — 본문과 다른 장면(노트북 `LAPTOP08`이 AP에 보낼 프레임이 있고 채널이 비어 있다 등)을 주고, CSMA/CA를 따르는 스테이션이 바로 다음에 하는 일을 고르게 한다. 정답은 정해진 시간과 무작위 백오프 시간을 더 기다린 뒤 보낸다는 것(step 0 결과대로), 오답은 CSMA/CA·CSMA/CD의 흔한 혼동(채널이 비었으니 바로 보낸다, 보내면서 충돌을 감지하면 멈추고 잼 신호를 보낸다, 받는 쪽의 ACK를 먼저 기다린다 등 — 출처로 정말 틀렸는지 따진다). **정답 위치 1**. 기출 묶음(CSMA/CD·TDMA·토큰 패싱·CSMA/CA)을 쓰지 않는다 — TDMA·토큰 패싱은 보기로 쓰지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 63·아니요 63, 정답 위치 48/48/47/47.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `wireless-channel` — `ChannelOverlapDiagram`, JSON 키 `channel-overlap`

- 물음형 제목 예: `이웃한 두 AP는 왜 채널을 떨어뜨려 고를까?`
- 그릴 것: 주파수 순서로 놓은 채널 노드 줄(본문의 계산 예에 나온 채널만 — 줄을 나눠 겹치는 채널을 위아래에 두고 곁말로 「겹친다」를 말한다, 노드를 서로 겹쳐 그리지 않는다)과 `AP01`·`AP02` 노드, AP에서 그 AP가 쓰는 채널 노드로 가는 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `overlap` | 겹치는 채널 | `AP01`·`AP02`와 겹치는 짝의 채널 노드 | 중심 주파수 차이가 채널 폭보다 작아 두 AP의 전파가 서로 간섭한다 |
  | `apart` | 겹치지 않는 채널 | `AP01`·`AP02`와 겹치지 않는 짝의 채널 노드 | 중심 주파수가 채널 폭보다 멀리 떨어져 겹치지 않는다 |

- 요점 테스트: 두 시나리오에서 `AP02`가 가리키는 채널 노드가 다르다(`AP01`의 채널 노드는 같다). 「간섭」을 말하는 곁말은 `overlap`에서만 보인다.
- step 0이 채널 값을 찾지 못해 본문에 계산 예가 없으면, 채널 노드를 이름표(「채널 A」·「이웃 채널」·「떨어진 채널」)로 그리고 summary에 적는다.

#### 3-2. `csma-ca` — `CsmaCaSequenceDiagram`, JSON 키 `csma-ca-sequence`

- 물음형 제목 예: `무선 LAN의 스테이션은 보내기 전에 무엇을 기다릴까?`
- 그릴 것: 왼쪽 `LAPTOP01`, 오른쪽 `AP01`, (RTS/CTS 시나리오용) `LAPTOP02`. 위에서 아래로 차례 노드 — 채널 듣기, 기다리기, 백오프(스테이션 쪽 노드), 데이터 프레임(스테이션 → AP 경로), ACK(AP → 스테이션 경로) — 와 RTS·CTS 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `basic` | 기본 차례 | `LAPTOP01`·`AP01`·차례 노드와 데이터·ACK 경로 | 채널이 비었어도 기다리고 무작위 시간을 더 기다린 뒤 보내며, 받은 쪽은 ACK로 답한다 |
  | `rtscts` | RTS/CTS | 세 장치와 RTS·CTS·데이터·ACK 경로 | AP의 CTS를 들은 `LAPTOP02`는 그동안 보내지 않는다 |

- 요점 테스트: `rtscts`에만 RTS·CTS 경로가 보이고, 두 시나리오 모두 ACK 경로의 시작점이 `AP01` 쪽이다(데이터 경로와 방향이 반대). `basic`에서 `LAPTOP02`는 흐리다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 316개, 마지막 id는 `n316`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 채널 계산을 MHz 단위로 손으로 다시 해 본다. CSMA/CA의 차례가 step 0의 절과 하나씩 맞는가.
3. n316의 보기 넷을 step 0의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/82-network-devices-wireless-security/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 5~11을 만들지 마라.** 이유: step 3~7의 범위다.
- **802.11의 프레임 형식·IFS의 종류별 길이·백오프 창 크기의 값을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」). 이름과 하는 일까지만.
- **step 1의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
