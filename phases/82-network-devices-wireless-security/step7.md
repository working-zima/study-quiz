# Step 7: cognitive-radio-review

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `wireless-lan`의 마지막 개념(11 인지 무선)의 글·문항·도식을 만들고, 주제 전체(11개념)를 통독한다.**
쓰기를 마친 뒤 주제 전체를 통독하는 데 시간을 쓴다.

기출은 주변의 전파 환경을 감지해 비어 있는 주파수를 찾아 쓰는 기술이 인지 무선(CR)이라는 것을 묻는다([기출 2024-02-25 #27] — 오답 Bluetooth·NFC·Wi-Fi).

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 4 `summary`(인지 무선·동적 스펙트럼 접근·허가받은 사용자·스펙트럼 감지·802.22, 기출 판정, E 번호)와 step 0~6 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 1과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 0·4)」 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`wireless-lan`의 앞 개념 열(step 1~6)**, 특히 `wireless-channel`(채널·주파수 대역)
- `src/data/network/questions.json`, `src/data/network/visuals/wireless-lan.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `ChannelOverlapDiagram`·`CellHandoffDiagram`(이 phase), `RouteFailoverDiagram`(바뀐 상황과 다른 길)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-02-25 #27] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `wireless-lan` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `wireless-lan.cognitive-radio` | 인지 무선 | — | 인지 무선의 뜻(step 4 결과대로 — 영문 이름 cognitive radio와 줄임말 CR), 주파수를 쓰도록 허가받은 사용자와 빈 곳을 찾아 쓰는 사용자(이름은 step 4 결과대로), 스펙트럼 감지(한 줄), 허가받은 사용자가 나타나면 비켜 간다는 것, 802.22가 TV 방송 대역의 빈 채널을 쓰는 것(step 4 결과대로 한 줄). 앞 개념 `wireless-channel`의 채널과 뜻을 맞춘다. **인지 무선과 고정된 주파수 할당**(4절). 예: 채널 A로 통신하던 장치가 그 채널의 허가받은 사용자 신호를 감지하고, 비어 있는 채널 B로 옮겨 통신을 이어 간다(「예시 값」 — 채널 이름은 이름표라고 밝힌다, 단계대로) |

### 2. 문항 — `src/data/network/questions.json`에 `n326`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n326` | `cognitive-radio` | 예/아니요 「원리 이해」 — **예** 쪽으로 세운다. 예: 인지 무선 장치가 비어 있던 채널을 쓰는 중에 그 채널을 쓰도록 허가받은 사용자가 신호를 내기 시작했다. 이 장치는 그 채널을 비우고 다른 빈 채널로 옮겨 가나요?(예 — step 4 결과대로). 해설은 스펙트럼 감지와 허가받은 사용자 보호를 가르친다. 기출 묶음(Bluetooth·NFC·Wi-Fi·CR)을 쓰지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 65·아니요 65, 정답 위치 49/49/49/49.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식 — `CognitiveRadioDiagram`, JSON 키 `cognitive-radio`

- 물음형 제목 예: `인지 무선 장치는 언제 다른 채널로 옮겨 갈까?`
- 그릴 것: 채널 A·채널 B 노드(주파수 순서로 한 줄), 인지 무선 장치 노드, 허가받은 사용자 노드, 장치에서 쓰는 채널로 가는 경로, 허가받은 사용자에서 채널 A로 가는 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `sense` | 빈 채널 쓰기 | 장치·채널 A·채널 B와 장치 → 채널 A 경로 | 주변을 감지해 지금 비어 있는 채널 A를 쓴다 |
  | `vacate` | 비켜 가기 | 장치·허가받은 사용자·채널 A·B와 허가받은 사용자 → 채널 A, 장치 → 채널 B 경로 | 허가받은 사용자가 나타나자 채널 A를 비우고 빈 채널 B로 옮긴다 |

- 요점 테스트: 장치에서 나가는 보이는 경로의 끝이 `sense`는 채널 A, `vacate`는 채널 B다. 허가받은 사용자 노드는 `sense`에서 흐리고 `vacate`에서 선명하다.

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

### 4. 주제 `wireless-lan` 통독

쓰기를 마친 뒤 **주제 `wireless-lan`의 열한 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이, 같은 사실을 여러 곳이 다르게 말하는 곳 — 예: 대역·채널의 말, 단위 표기, 802.15.4와 Zigbee의 관계, 메시를 푼 두 자리, IP를 전제한 말)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다. 도식 열한 개의 문구도 함께 읽는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 326개, 마지막 id는 `n326`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념을 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다.
3. 주제 `wireless-lan`의 열한 개념을 통독한다(「작업」 4). 도식 열한 개의 문구도 함께 읽는다.
4. `phases/82-network-devices-wireless-security/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(「앞 개념에 고칠 것」에 통독 결과).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`network-devices`·`network-security`의 개념을 만들지 마라.** 이유: step 9~19의 범위다.
- **802.22의 물리 계층·데이터베이스 접근 절차, 주파수 규제 제도를 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 1~6의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
