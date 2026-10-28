# Step 8: switch-table

## 배경

phase 72는 네트워크 과목의 `ethernet`(이더넷과 프레임)과 `hub-switch-vlan`(허브·스위치·VLAN)을 만든다. 전체 계획·결정·공통 규칙은 `phases/72-network-ethernet-switch/guide.md`에 있다.
step 6·7이 `hub-switch-vlan`의 개념 9~12(허브, 반이중과 전이중, 충돌 도메인, CSMA/CD)를 만들었다.
**이 step은 개념 13 스위치와 그에 딸린 14 MAC 주소 테이블의 글·문항·도식을 만든다.** 스위치는 허브와 달리 목적지 장치의 포트로만 보내는 장비이고, MAC 주소 테이블은 그것을 가능하게 하는 표다.
강의 p84–p92·p98이다. 다음 step 9가 스위치에 딸린 플러딩·포워딩·필터링과 STP를 잇는다.

기출이 「L2 스위치가 프레임을 보낼 때 보는 주소는 MAC 주소」를 네 번 물었다.

## 읽어야 할 파일

- **`phases/72-network-ethernet-switch/guide.md` 전체.** **이 문서를 따른다**
- `phases/72-network-ethernet-switch/index.json`의 step 0~7 `summary` — 특히 **step 1**(스위치·브리지·학습·에이징 300초의 결과)과 **step 6·7**(함께 쓰는 장면의 노드 id·자리)
- **`docs/WRITING_GUIDE.md` 전체** — 특히 4절(비슷한 개념과의 차이 — 허브와 스위치)
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch2-3」 절과 수정 이력, `docs/source/network/standards.md`(RFC 4188 등 step 1의 항목), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p84~p92, p98 — 원문 확인용(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- **`src/data/network/topics.json`의 `hub-switch-vlan` 주제(개념 9~12)**, `ethernet` 주제의 `mac-address`(같은 예시 주소와 같은 말을 쓴다)
- `src/data/network/questions.json`, `src/data/network/visuals/hub-switch-vlan.json`, `src/data/network/data.test.ts`(`parentId` 규칙), `src/data/index.test.ts`의 예/아니요 불변식
- 도식 선례(guide.md 「도식」)와 step 6·7이 만든 도식과 그 테스트, `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 둘 — `hub-switch-vlan` 주제의 `concepts` 끝에

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 13 | `hub-switch-vlan.switch` | 스위치 | — | 머리 개념(개념 14~16이 딸린다). 데이터 링크 계층 장비라 MAC 주소(NIC마다 붙은 48비트 주소 — 이 화면에서 처음이면 한 줄 풀이)를 쓴다 — 그래서 L2(2계층) 스위치라고도 부른다. 받은 프레임의 **목적지** MAC 주소를 보고 그 장치가 이어진 포트로만 내보낸다. 전이중이고 충돌 도메인을 포트마다 나눈다(개념 10·11과 같은 말로, 되풀이하지 않게). 허브와의 비교(p88–p89)를 WRITING_GUIDE 4절대로 — 무엇이 다르고 그 결과 무엇이 달라지는지. 표준 문서에서의 이름(브리지)은 step 1 결과대로. 어느 포트에 누가 있는지 아는 방법은 다음 개념(MAC 주소 테이블)으로 넘긴다는 한 줄 |
| 14 | `hub-switch-vlan.mac-address-table` | MAC 주소 테이블 | `hub-switch-vlan.switch` | 스위치가 어느 포트에 어떤 MAC 주소의 장치가 있는지 적어 두는 표. **학습** — 프레임이 들어오면 그 프레임의 **출발지** MAC 주소와 들어온 포트를 적는다(목적지가 아니라 출발지인 까닭을 원리로: 보낸 장치가 그 포트 너머에 있다는 것을 프레임이 알려 주므로). **에이징** — 정해진 시간 동안 다시 보이지 않은 항목을 지운다(기본값은 step 1 결과대로). 지우는 까닭(장치가 옮겨 가거나 빠질 수 있으므로)은 출처에 있는 범위에서. 예시는 guide.md 「예시 값」의 호스트 A~D와 문서용 MAC 주소. 표에 없는 목적지로 가는 프레임을 어떻게 하는지는 다음 개념(플러딩)으로 넘긴다 |

### 2. 문항 — `n040`~`n041`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n040` | `switch` | 「원리 이해」 4지선다 — 스위치가 받은 프레임을 어느 포트로 내보낼지 정할 때 보는 것. 오답은 같은 범주(프레임에 든 다른 값이나 다른 주소 — 출발지 MAC 주소, 이더타입처럼 이 화면이나 해설에서 뜻이 서는 것). 정답의 이름을 문제문에 쓰지 않는다. 기출의 보기 구성(IP 주소·URL 등)을 따르지 않는다 |
| `n041` | `mac-address-table` | 「상황 적용」 4지선다 — 표가 비어 있는 스위치의 포트 1에 이은 호스트 A가 포트 3의 C에게 프레임을 보냈을 때 표에 새로 적히는 것. 오답은 실제로 헷갈리는 짝(C의 주소와 포트 3, A의 주소와 포트 3, C의 주소와 포트 1)으로. 정답이 출발지·들어온 포트라는 본문 사실로 정해져야 한다 |

### 3. 도식 — `src/data/network/visuals/hub-switch-vlan.json`의 `diagrams`에 더한다

두 도식 모두 step 6·7의 장면(가운데 장비, 포트 1~4에 호스트 A~D)을 쓴다. 예시 MAC 주소를 곁말이나 표에 쓰려면 이 주제의 본문에 그 주소가 있어야 한다.

#### 3-1. `hub-switch-vlan.switch` — `SwitchForwardDiagram`, JSON 키 `switch-forward`

- 물음형 제목 예: `스위치는 허브와 무엇이 다를까?`
- 그릴 것: 가운데 장비의 라벨이 시나리오에 따라 허브·스위치로 바뀌거나, 본문이 견주는 대로 두 장면을 함께 둔다.
- 시나리오:

  | id | label | 경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `hub` | 허브라면 | A → B·C·D 세 경로 | 허브는 다른 모든 포트로 내보낸다 |
  | `switch` | 스위치라면 | A → C 한 경로, 곁말 `목적지 MAC 주소를 보고` 같은 본문의 말 | 스위치는 목적지 MAC 주소를 보고 그 장치의 포트로만 내보낸다 |

- 요점 테스트: `switch`에서 보이는 전달 경로는 A에서 C로 가는 하나뿐이고, `hub`에서는 셋이다. 두 시나리오의 출발 호스트가 같다.

#### 3-2. `hub-switch-vlan.mac-address-table` — `MacTableDiagram`, JSON 키 `mac-table`

- 물음형 제목 예: `스위치는 누가 어느 포트에 있는지 어떻게 알까?`
- 그릴 것: 스위치 곁에 MAC 주소 테이블을 칸(노드)으로. 표의 행은 노드 높이 32를 지킨다 — 자리가 모자라면 행을 「포트 · MAC 주소」 한 칸으로 적되, 라벨은 본문의 말과 주소 그대로다.
- 시나리오(학습 순서):

  | id | label | 선명한 것·경로 | 캡션이 말할 것 |
  |---|---|---|---|
  | `learn-a` | A가 보낼 때 | A → 스위치 경로, 표에 `포트 1 · A의 주소` 행 | 들어온 프레임의 출발지 주소와 들어온 포트를 적는다 |
  | `learn-c` | C가 답할 때 | C → 스위치 경로, 표에 행 둘(A와 C) | 답이 들어오면 C의 자리도 배운다 |
  | `aging` | 시간이 지나면 | 표에서 오래된 행이 흐려지거나 사라짐, 곁말에 에이징(기본값을 본문이 말하면 그 값) | 정해진 시간 동안 다시 보이지 않은 항목은 지운다 |

- 요점 테스트: 표의 행 수가 `learn-a` 1, `learn-c` 2이고, `aging`에서 지워진 행이 보이지 않는다(또는 흐리다). 각 행의 포트 번호가 그 주소를 가진 호스트가 이어진 포트와 같다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~11)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 41개, 마지막 id는 `n041`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다. 앞 개념·문항·도식 파일이 바뀌지 않았는지 기계로 확인한다.
2. `parentId`가 두 단·연속 규칙을 지키는가(개념 14가 개념 13 바로 뒤).
3. 이 주제 화면을 개념 9부터 14까지 통독한다 — MAC 주소·L2·학습·에이징이 처음 나오는 자리에서 풀렸는가, 허브와 스위치의 차이가 「무엇이 달라 무엇이 달라지는지」로 읽히는가.
4. `phases/72-network-ethernet-switch/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **플러딩·포워딩·필터링·STP를 이 step의 개념으로 만들지 마라.** 이유: step 9의 범위다. 표에 없는 목적지를 어떻게 하는지는 넘긴다.
- **강의 그림의 MAC 주소(`ab:cd:ab:cd:00:01`~)를 쓰지 마라.** 이유: 그룹 주소라 장치 하나의 주소가 될 수 없다(guide.md 「예시 값」, step 0의 수정 이력).
- **에이징 시간을 출처에 없는 값으로 쓰지 마라.** 이유: 확인한 기본값(step 1)만 쓴다. 값이 장비에 따라 바뀔 수 있으면 그 점도 출처 범위에서 밝힌다.
