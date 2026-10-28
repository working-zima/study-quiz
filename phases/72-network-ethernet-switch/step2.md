# Step 2: ethernet-names

## 배경

phase 72는 네트워크 과목의 `ethernet`(이더넷과 프레임)과 `hub-switch-vlan`(허브·스위치·VLAN)을 만든다. 전체 계획·결정·공통 규칙은 `phases/72-network-ethernet-switch/guide.md`에 있다.
step 0·1이 출처를 확인해 `standards.md`·수정 이력·`exam-notes.md`에 남겼다. **이 step은 주제 `ethernet`을 만들고 그 첫 개념 둘(1 이더넷, 2 이더넷 규격 이름)의 글·문항·도식을 함께 만든다.**
개념마다 도식이 있어야 테스트가 통과하므로(ADR-056) 한 step에서 끝낸다. 다음 step 3이 패스트 이더넷과 기가비트 이더넷, NIC를 잇는다.

이 주제는 학습자가 2장에서 처음 여는 화면이다. 학습자는 네트워크를 처음 공부하는 사람이고, 1장(`network-basics`·`protocols-encapsulation`)을 읽지 않고 바로 들어올 수 있다.

## 읽어야 할 파일

- **`phases/72-network-ethernet-switch/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/72-network-ethernet-switch/index.json`의 step 0·1 `summary` — 개념마다 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch2-1 이더넷」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p48~p59 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 주제와 개념 둘 — `src/data/network/topics.json`

`protocols-encapsulation` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "ethernet", "title": "이더넷과 프레임", "importance": 2, "sourcePages": [48, 70], "concepts": [ … ] }`.
개념은 guide.md 표의 1~2행이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `ethernet.ethernet` | 이더넷 | — | 이 주제의 첫 개념이라 **LAN**(집·사무실처럼 가까운 곳의 장치를 잇는 네트워크)과 **계층**(통신에 필요한 일을 층으로 나눠 맡긴 것 — 물리 계층은 신호를 매체에 싣는 일, 데이터 링크 계층은 이웃한 장치끼리 프레임을 주고받는 일)을 여기서 짧게 푼다. **프레임**도 「이더넷이 주고받는 데이터의 정해진 형식」 정도로 처음 푼다(자세히는 개념 6). 무엇을 정하는 기술인지(케이블과 신호, 프레임 형식)와 국제 표준 IEEE 802.3, 개정판 이름 붙이는 법(802.3u, 802.3ab)을 쓴다 |
| 2 | `ethernet.standard-names` | 이더넷 규격 이름 | `ethernet.ethernet` | p55 표의 네 규격(속도·매체가 규격마다 다름)과, 이름 「속도 + BASE + 뒤 글자」를 읽는 법. 예는 강의의 이름에서 고른다(10BASE-T, 100BASE-TX, 1000BASE-T, 2.5GBASE-T, 5GBASE-T, 10GBASE-T, 25GBASE-LR). 뒤 글자(매체)의 뜻과 BASE의 뜻은 step 0 결과대로 — 강의 p59 표에 수정 이력이 걸렸으면 고친 쪽을 쓴다. 트위스티드 페어·광케이블(멀티 모드·싱글 모드)·동축 케이블처럼 처음 나오는 케이블은 한 줄로 푼다 |

### 2. 문항 — `src/data/network/questions.json`에 `n026`~`n027`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n026` | `ethernet` | 흔한 오해를 겨냥한 예/아니요 감 — 예: 이더넷이 케이블 같은 물리적인 것만 정한다(또는 프레임 형식만 정한다)는 오해. 주장의 방향은 균형에 맞춰 고른다 |
| `n027` | `standard-names` | 4지선다 「상황 적용」 — 처음 보는 규격 이름 하나를 주고 그 이름이 말하는 속도와 매체를 고르게 한다. 보기는 속도와 매체를 섞어 바꾼 조합. 정답은 step 0이 확인한 글자 뜻으로 정해져야 한다 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다.

### 3. 도식 — 새 파일 `src/data/network/visuals/ethernet.json`

이 step이 `ethernet.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'ethernet': ethernetVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `ethernet.ethernet` — `EthernetLayersDiagram`, JSON 키 `ethernet-layers`

- 물음형 제목 예: `이더넷은 무엇을 정해 둘까?`
- 그릴 것: 케이블로 이은 컴퓨터 둘과, 그 위아래로 이더넷이 정하는 두 계층(물리 계층 — 케이블과 신호, 데이터 링크 계층 — 프레임). 계층은 그룹 박스나 띠로.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `physical` | 물리 계층 | 케이블과 물리 계층 띠 | 이더넷은 어떤 케이블로 어떤 신호를 보낼지를 정한다(본문의 말로) |
  | `data-link` | 데이터 링크 계층 | 프레임과 데이터 링크 계층 띠 | 이더넷은 주고받는 데이터를 프레임이라는 정해진 형식에 담게 한다 |

- 요점 테스트: 두 시나리오의 선명한 노드 집합이 서로 다르고, 둘 다 「이더넷」 또는 IEEE 802.3을 가리키는 같은 바깥 그룹 안에 있다(두 계층을 한 표준이 함께 정한다).

#### 3-2. `ethernet.standard-names` — `StandardNameDiagram`, JSON 키 `standard-name`

- 물음형 제목 예: `1000BASE-SX라는 이름은 무엇을 말할까?`
- 그릴 것: 규격 이름 하나를 세 칸(속도 | BASE | 뒤 글자)으로 나눈 띠와, 칸마다 그 뜻을 적은 곁말. 칸은 빈틈없이 이어 붙인다(선례 `PacketPartsDiagram`).
- 시나리오: 본문에 나오는 이름 셋쯤(예: `10BASE-T`, `1000BASE-SX`, `10GBASE-T` — 매체 글자의 뜻이 step 0에서 확인된 이름만). 시나리오마다 세 칸의 글자와 곁말이 바뀐다.
- 요점 테스트: 시나리오마다 세 칸의 글자를 이으면 그 시나리오의 규격 이름과 같고, 속도 칸의 곁말이 본문의 속도 표기와 같다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~11)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 27개, 마지막 id는 `n027`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `protocols-encapsulation` 바로 뒤에 있고, `importance` 2·`sourcePages` [48, 70]인지, `data.test.ts`의 주제 지도 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0 summary가 「쓰지 않는다」·「고쳐 쓴다」로 정한 것을 지켰는가.
4. `phases/72-network-ethernet-switch/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~8(패스트·기가비트 이더넷, NIC, MAC 주소, 프레임, 이더타입/길이, FCS)을 만들지 마라.** 이유: step 3~5의 범위다. 이 step의 글이 그 개념을 언급할 때는 한 줄 풀이로 그친다.
- **step 0이 확인하지 못한 매체 글자 뜻을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
