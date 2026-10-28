# Step 6: hub-duplex

## 배경

phase 72는 네트워크 과목의 `ethernet`(이더넷과 프레임)과 `hub-switch-vlan`(허브·스위치·VLAN)을 만든다. 전체 계획·결정·공통 규칙은 `phases/72-network-ethernet-switch/guide.md`에 있다.
step 2~5가 `ethernet` 주제(개념 1~8)를 끝냈다. **이 step은 주제 `hub-switch-vlan`을 만들고 그 첫 개념 둘(9 허브, 10 반이중과 전이중)의 글·문항·도식을 만든다.**
다음 step 7이 충돌 도메인과 CSMA/CD를 잇는다.

사용자는 배포된 1장을 보고 「라우터라던지 스위치라는 거 설명 없이 해당 용어를 써서 어려움을 느꼈어. 나 강의 들을 때 허브부터 설명해준 거 같아. 그러면서 허브는 요즘 사용하지 않는다는 말도」라고 했다.
그래서 이 주제는 강의 순서대로 **허브부터** 쓴다. **「허브는 요즘 안 쓴다」는 step 1이 근거를 찾았을 때만, step 1 summary가 정한 범위의 문장으로만 쓴다.**
이 주제도 학습자가 바로 들어올 수 있으므로, `ethernet` 주제에서 푼 낱말(프레임, MAC 주소, NIC, 계층, LAN)도 이 화면에서 처음 쓸 때 짧게 다시 푼다.

## 읽어야 할 파일

- **`phases/72-network-ethernet-switch/guide.md` 전체.** **이 문서를 따른다**
- `phases/72-network-ethernet-switch/index.json`의 step 0~5 `summary` — 특히 **step 1**(허브·반이중·전이중의 결과, 「요즘 안 쓴다」의 범위)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(「수량과 상태를 바꾸는 도식」 포함)
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch2-2 허브와 CSMACD」 절과 수정 이력(step 1이 더한 항목),
  `docs/source/network/standards.md`(step 1의 「(phase 72)」 항목), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p71~p77, p83 — 원문 확인용(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `ethernet` 주제 — 같은 것을 같은 이름으로 부르기 위해), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」)와 step 2~5가 만든 도식과 그 테스트, `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 주제와 개념 둘 — `src/data/network/topics.json`

`ethernet` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "hub-switch-vlan", "title": "허브·스위치·VLAN", "importance": 3, "sourcePages": [71, 105], "concepts": [ … ] }`.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `hub-switch-vlan.hub` | 허브 | — | 이 주제의 첫 개념이라 **포트**(장비에 케이블을 꽂는 자리), **신호**, **물리 계층**(신호를 매체에 싣는 층)을 여기서 푼다. 허브는 주소를 보지 않는 물리 계층 장비라, 한 포트로 들어온 신호를 다른 모든 포트로 내보낸다 — 그래서 받을 장치가 아닌 장치에도 신호가 가고, 각 장치의 NIC(장치를 LAN에 잇는 하드웨어 — 한 줄 풀이)가 자기 것이 아니면 버린다. 반이중이고 이은 장치 전체가 충돌 도메인 하나라는 것은 한 줄로 말하고 자세히는 개념 10·11에 둔다. 표준에서의 이름(리피터)과 「요즘 안 쓴다」는 step 1 결과대로 — 근거가 없으면 쓰지 않고, 쓰면 출처가 말하는 범위를 넘지 않는다 |
| 10 | `hub-switch-vlan.duplex` | 반이중과 전이중 | — | **목록 개념** — `- **반이중**(half duplex)은 …`, `- **전이중**(full duplex)은 …`. 강의의 무전기·전화 예는 쓰되, 비유가 실제와 다른 점이 있으면 밝힌다. 허브는 반이중, 스위치는 전이중으로 통신한다(스위치는 「목적지 장치가 이어진 포트로만 보내는 장비 — 아래 스위치 개념」으로 한 줄). 전이중에서 충돌이 없다는 것은 step 1 결과대로 |

### 2. 문항 — `n035`~`n036`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n035` | `hub` | 「원리 이해」 4지선다 — 허브에 이은 장치 하나가 보낸 신호가 어디로 가는지(같은 허브의 다른 모든 장치)를, 상황(호스트 A~D가 허브의 포트 1~4)으로 묻는다. 오답은 「목적지 장치에게만」, 「보낸 장치에게 되돌아감」처럼 실제로 헷갈리는 것 |
| `n036` | `duplex` | 「상황 적용」 — 두 장치가 동시에 서로에게 보내야 하는 상황이나, 한쪽이 보내는 동안 다른 쪽이 기다려야 하는 상황을 주고 어느 방식인지 판단하게 한다. 오답 범주가 둘뿐이면 예/아니요로 |

### 3. 도식 — 새 파일 `src/data/network/visuals/hub-switch-vlan.json`

이 step이 `hub-switch-vlan.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'hub-switch-vlan': hubSwitchVlanVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).
허브·스위치 도식은 뒤 step들도 **같은 장면**(가운데 장비 하나, 포트 1~4에 호스트 A~D)을 쓴다. 노드 id(`host-a`~`host-d`, 포트를 노드로 그리면 `port-1`~`port-4`)와 자리를 이 step에서 정하고 summary에 적는다.

#### 3-1. `hub-switch-vlan.hub` — `HubRepeatDiagram`, JSON 키 `hub-repeat`

- 물음형 제목 예: `허브는 받은 신호를 어디로 내보낼까?`
- 그릴 것: 허브 하나, 포트 1~4에 이은 호스트 A~D. 늘 보이는 연결선(케이블) 넷.
- 시나리오:

  | id | label | 경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `a-sends` | A가 C에게 보낼 때 | A → 허브 → B·C·D 세 경로, C 곁에 받을 장치, B·D 곁에 `버림`(NIC가 버린다는 본문의 말) | 허브는 주소를 보지 않아 다른 모든 포트로 내보내고, 받을 장치가 아닌 장치는 버린다 |
  | `d-sends` | D가 보낼 때 | D → 허브 → A·B·C | 어느 포트로 들어와도 같다 — 들어온 포트를 뺀 모든 포트 |

- 요점 테스트: 두 시나리오 모두 보낸 호스트를 뺀 나머지 셋 모두에게 가는 경로가 보이고, 보낸 호스트에게 돌아가는 경로는 없다.

#### 3-2. `hub-switch-vlan.duplex` — `DuplexDiagram`, JSON 키 `duplex`

- 물음형 제목 예: `보내기와 받기를 동시에 할 수 있을까?`
- 그릴 것: 장치 둘과 그 사이의 링크, 두 방향의 화살표 경로.
- 시나리오:

  | id | label | 경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `half` | 반이중 | 한 방향 경로만, 다른 쪽 곁에 `기다림` 같은 본문의 말 | 한 번에 한쪽만 보낸다 — 허브가 이렇게 통신한다 |
  | `full` | 전이중 | 두 방향 경로 함께 | 보내기와 받기를 동시에 한다 — 스위치가 이렇게 통신한다 |

- 요점 테스트: `half`에서 보이는 방향 경로는 하나, `full`에서는 서로 반대 방향인 둘이다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~11)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 36개, 마지막 id는 `n036`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다. `ethernet` 주제와 `n001`~`n034`, 앞 step의 도식 파일이 바뀌지 않았는지 기계로 확인한다.
2. 새 주제가 `topics.json`에서 `ethernet` 바로 뒤에 있고 `importance` 3·`sourcePages` [71, 105]인지 본다.
3. 이 주제 화면을 개념 9부터 10까지 통독한다 — 포트·신호·NIC·프레임·물리 계층·스위치가 처음 나오는 자리에서 풀렸는가. 「요즘 안 쓴다」를 썼다면 step 1 summary의 범위 안인가.
4. `phases/72-network-ethernet-switch/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」과, 뒤 step이 함께 쓸 장면(노드 id·자리)을 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **충돌 도메인·CSMA/CD·스위치(개념 11~)를 만들지 마라.** 이유: step 7부터의 범위다. 이 step의 글이 그것을 말할 때는 한 줄 풀이로 그친다.
- **근거 없이 「허브는 요즘 안 쓴다」를 쓰지 마라. step 1이 정한 범위보다 넓게 쓰지 마라.** 이유: 사용자가 근거를 찾은 뒤에만 쓰기로 했다.
- **`ethernet` 주제를 고치지 마라.** 이유: step 2~5의 산출물이다. 고칠 것을 찾으면 summary에 적는다.
