# Step 9: forwarding-stp

## 배경

phase 72는 네트워크 과목의 `ethernet`(이더넷과 프레임)과 `hub-switch-vlan`(허브·스위치·VLAN)을 만든다. 전체 계획·결정·공통 규칙은 `phases/72-network-ethernet-switch/guide.md`에 있다.
step 6~8이 `hub-switch-vlan`의 개념 9~14(허브부터 MAC 주소 테이블까지)를 만들었다.
**이 step은 스위치에 딸린 나머지 둘 — 15 플러딩·포워딩·필터링과 16 스패닝 트리 프로토콜(STP) — 의 글·문항·도식을 만든다.**

- 15는 스위치가 MAC 주소 테이블(개념 14)을 보고 프레임을 어디로 내보내는지다. 강의 p93–p97의 학습 장면(호스트 A~D가 포트 1~4)이고, 개념 14와 같은 장면을 쓰면 차이가 잘 보인다.
- 16은 강의에 없고 기출이 묻는다(L2 루프를 막는 기술). 15의 플러딩에서 이어진다 — 스위치를 고리로 이으면 플러딩·브로드캐스트 프레임이 끝없이 돈다.

다음 step 10이 브로드캐스트 도메인과 VLAN을 잇는다.

## 읽어야 할 파일

- **`phases/72-network-ethernet-switch/guide.md` 전체.** **이 문서를 따른다**
- `phases/72-network-ethernet-switch/index.json`의 step 0~8 `summary` — 특히 **step 1**(플러딩·STP의 결과)과 **step 6~8**(함께 쓰는 장면의 노드 id·자리, MAC 주소 테이블의 표 그리는 법)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch2-3」 절과 수정 이력, `docs/source/network/standards.md`(RFC 4188·802.1D 등 step 1의 항목), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p93~p97 — 원문 확인용(옮기지 않는다). 그림 p93–p97은 렌더해서 학습 순서를 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- **`src/data/network/topics.json`의 `hub-switch-vlan` 주제(개념 9~14)** — 특히 13 스위치와 14 MAC 주소 테이블
- `src/data/network/questions.json`, `src/data/network/visuals/hub-switch-vlan.json`, `src/data/network/data.test.ts`(`parentId`·목록 항목 규칙), `src/data/index.test.ts`의 예/아니요 불변식
- 도식 선례(guide.md 「도식」)와 step 6~8이 만든 도식과 그 테스트(특히 `MacTableDiagram`), `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 둘 — `hub-switch-vlan` 주제의 `concepts` 끝에(개념 14 바로 뒤)

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 15 | `hub-switch-vlan.flooding-forwarding-filtering` | 플러딩·포워딩·필터링 | `hub-switch-vlan.switch` | **목록 개념** — 소개 문단(스위치가 프레임을 받았을 때 표를 보고 하는 세 가지) 뒤에 `- **플러딩**(flooding)은 …`, `- **포워딩**(forwarding)은 …`, `- **필터링**(filtering)은 …`. 플러딩은 목적지 MAC 주소가 표에 없을 때 들어온 포트를 뺀 모든 포트로 내보내는 것(브로드캐스트 프레임도 그런지는 step 1 결과대로), 포워딩은 표에 있으면 그 포트로만 내보내는 것, 필터링은 그 밖의 포트로 내보내지 않는 것. 강의 그림 순서로 예를 든다 — A가 C에게 처음 보낼 때(표에 C가 없다 → 플러딩), C가 답할 때(표에 A가 있다 → 포워딩), 그 뒤 A와 C 사이(포워딩과 필터링). 포워딩과 필터링이 같은 일의 두 면이라는 것을 WRITING_GUIDE 4절대로 밝힌다. 개념 14의 학습 설명을 되풀이하지 않는다 |
| 16 | `hub-switch-vlan.stp` | 스패닝 트리 프로토콜 (STP) | `hub-switch-vlan.switch` | 원인 → 결과 → 해결 순서로. 스위치 여러 대를 고리처럼 이으면(한 길이 끊겨도 쓰려고 예비 길을 둘 때) 플러딩된 프레임과 브로드캐스트 프레임이 고리를 끝없이 돌며 불어나 네트워크를 쓸 수 없게 된다. STP는 스위치끼리 정보를 주고받아 일부 포트를 막아(차단) 고리 없는 나무 모양 경로만 쓰게 한다. 쓰던 길이 끊기면 막았던 포트를 다시 쓰는지, 포트 상태 이름은 step 1 결과대로. 루트 브리지 선출·경로 비용 계산 같은 세부는 넣지 않는다. 이름의 뜻(나무를 펼친다)을 쓰려면 출처가 있어야 한다. 브로드캐스트를 이 화면에서 처음 쓰면 한 줄로 푼다(같은 LAN의 모든 장치에게 보내는 프레임) |

### 2. 문항 — `n042`~`n043`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n042` | `flooding-forwarding-filtering` | 「원리 이해」 — 목적지 MAC 주소가 표에 없는 프레임을 받은 스위치가 하는 일. 4지선다면 오답은 「버린다」, 「보낸 포트로 되돌린다」, 「목적지 포트로만 보낸다」처럼 헷갈리는 것. 흔한 오해(모르면 버린다)를 겨냥한 예/아니요도 된다 — 균형에 맞춰 고른다 |
| `n043` | `stp` | 「원인과 결과」 4지선다 — 예비 길을 두려고 스위치 셋을 고리로 이었더니 네트워크가 마비되는 상황을 주고, 그 원인을 막는 기술을 고르게 하거나 왜 마비되는지를 고르게 한다. 오답은 같은 범주(이 주제의 다른 스위치 기능 — MAC 주소 학습, 플러딩 등 화면이나 해설에서 뜻이 서는 것). 기출의 보기 구성을 그대로 따르지 않는다 |

### 3. 도식 — `src/data/network/visuals/hub-switch-vlan.json`의 `diagrams`에 더한다

#### 3-1. `hub-switch-vlan.flooding-forwarding-filtering` — `SwitchDecisionDiagram`, JSON 키 `switch-decision`

- 물음형 제목 예: `표에 없는 주소로 가는 프레임은 어디로 갈까?`
- 그릴 것: step 8의 `MacTableDiagram`과 같은 장면(스위치, 포트 1~4에 호스트 A~D, 스위치 곁의 표).
- 시나리오:

  | id | label | 경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `flooding` | 표에 없을 때 | A → 스위치 → B·C·D, 표에 C가 없음 | 목적지를 모르면 들어온 포트를 뺀 모든 포트로 내보낸다 |
  | `forwarding` | 표에 있을 때 | C → 스위치 → A 한 경로 | 목적지가 표에 있으면 그 포트로만 내보낸다 |
  | `filtering` | 다른 포트는 | `forwarding`과 같은 전달에 B·D 곁 `보내지 않음` 같은 본문의 말 | 그 밖의 포트로는 내보내지 않는다 |

  `forwarding`과 `filtering`이 같은 장면의 두 면이면, 두 시나리오의 「보이는 경로 + 곁말」이 달라야 한다는 규칙(guide.md)을 곁말로 지킨다.
- 요점 테스트: `flooding`에서 전달 경로가 보낸 호스트를 뺀 셋 모두에게 가고, `forwarding`에서는 하나뿐이다. `filtering`에서만 B·D 곁의 곁말이 보인다.

#### 3-2. `hub-switch-vlan.stp` — `SpanningTreeDiagram`, JSON 키 `spanning-tree`

- 물음형 제목 예: `스위치를 고리로 이으면 무슨 일이 생길까?`
- 그릴 것: 스위치 셋을 서로 이은 고리(링크 셋)와 한 스위치에 이은 호스트 하나. 경로는 직교선만 쓰므로 삼각형 대신 사각 고리로 배치한다.
- 시나리오:

  | id | label | 경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `loop` | STP가 없으면 | 브로드캐스트 프레임이 고리를 따라 도는 경로(링크 셋 모두), 곁말 `끝없이 돎` 같은 본문의 말 | 고리가 있으면 플러딩·브로드캐스트 프레임이 끝없이 돌아 네트워크를 쓸 수 없게 된다 |
  | `stp` | STP를 쓰면 | 링크 하나가 흐리고 그 포트 곁에 `막음`(차단) 곁말, 남은 경로는 나무 모양 | 일부 포트를 막아 고리 없는 경로만 쓴다 |

  본문이 「쓰던 길이 끊기면 막았던 포트를 다시 쓴다」를 말하면 `failover` 시나리오를 더해도 된다.
- 요점 테스트: `loop`에서 보이는 전달 경로가 고리를 이루고(링크 셋 모두를 지남), `stp`에서는 막힌 링크를 지나는 전달 경로가 없고 남은 링크가 고리를 이루지 않는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~11)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 43개, 마지막 id는 `n043`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다. 앞 개념·문항·도식 파일이 바뀌지 않았는지 기계로 확인한다.
2. `parentId`가 두 단·연속 규칙을 지키는가(개념 15·16이 개념 14 바로 뒤에, 스위치의 딸린 개념으로 이어진다).
3. 이 주제 화면을 개념 9부터 16까지 통독한다 — 플러딩·고리·차단이 처음 나오는 자리에서 풀렸는가, 개념 14와 같은 말을 되풀이하지 않는가.
4. `phases/72-network-ethernet-switch/index.json`의 step 9를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **브로드캐스트 도메인·VLAN을 만들지 마라.** 이유: step 10·11의 범위다.
- **STP의 계산 절차(루트 브리지 선출, 경로 비용, BPDU 형식, RSTP·MSTP)를 더하지 마라.** 이유: 기출이 묻지 않는다(ADR-059 — 기출이 묻는 사실과 그 바탕만).
- **고리를 빨강이나 경고 기호로 그리지 마라.** 이유: 나쁜 상태는 곁말과 흐림으로 보인다(ADR-036).
