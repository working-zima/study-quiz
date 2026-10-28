# Step 7: collision-csma

## 배경

phase 72는 네트워크 과목의 `ethernet`(이더넷과 프레임)과 `hub-switch-vlan`(허브·스위치·VLAN)을 만든다. 전체 계획·결정·공통 규칙은 `phases/72-network-ethernet-switch/guide.md`에 있다.
step 6이 주제 `hub-switch-vlan`과 개념 9~10(허브, 반이중과 전이중)을 만들었다. **이 step은 개념 11 충돌 도메인과 12 CSMA/CD의 글·문항·도식을 만든다.**
충돌 도메인은 반이중 허브에서 충돌이 어디까지 번지는지이고, CSMA/CD는 그 충돌에 대처하는 규칙이다 — 강의 순서(p78–p83) 그대로다. 다음 step 8이 스위치를 잇는다.

기출이 CSMA/CD를 네 번 물었다 — 토큰을 쓰지 않는다, 충돌 뒤 무작위로 기다려 지연을 예측하기 어렵다, 충돌 도메인은 작을수록 좋다.

## 읽어야 할 파일

- **`phases/72-network-ethernet-switch/guide.md` 전체.** **이 문서를 따른다**
- `phases/72-network-ethernet-switch/index.json`의 step 0~6 `summary` — 특히 **step 1**(충돌 도메인·CSMA/CD·전이중의 결과와 E 항목)과 **step 6**(함께 쓰는 장면의 노드 id·자리)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-057**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(「수량과 상태를 바꾸는 도식」 포함)
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch2-2」·「Ch2-3」 절과 수정 이력(step 1이 더한 항목 — 특히 p89의 충돌 도메인 표현), `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p78~p83, p89 — 원문 확인용(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- **`src/data/network/topics.json`의 `hub-switch-vlan` 주제(개념 9~10)** — 이미 푼 낱말을 다시 풀지 않는다
- `src/data/network/questions.json`, `src/data/network/visuals/hub-switch-vlan.json`, `src/data/network/data.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식
- 도식 선례(guide.md 「도식」)와 step 6이 만든 `HubRepeatDiagram`·`DuplexDiagram`과 그 테스트, `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 둘 — `hub-switch-vlan` 주제의 `concepts` 끝에

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `hub-switch-vlan.collision-domain` | 충돌 도메인 | — | 충돌(반이중으로 한 매체를 나눠 쓰는 장치 둘이 동시에 보내 신호가 섞여 둘 다 망가지는 것)을 먼저 풀고, 충돌 도메인(그 안의 누가 보내든 서로 부딪칠 수 있는 범위)을 쓴다. 허브에 이은 장치 전체가 하나, 스위치는 포트마다 나눈다(스위치는 아래 개념 — 한 줄 풀이). 수정 이력이 강의 p89의 표현에 걸렸으면 고친 쪽으로. 「충돌 도메인이 작을수록 좋다」는 step 1 결과대로(출처가 없으면 E 항목대로 「자격시험은」). 브로드캐스트 도메인은 이 개념에서 다루지 않는다(개념 17) |
| 12 | `hub-switch-vlan.csma-cd` | CSMA/CD | — | **목록 개념** — 소개 문단(반이중 이더넷에서 충돌에 대처하는 규칙, 약자를 풀어 둔다) 뒤에 `- **캐리어 감지**(Carrier Sense, CS)는 …`, `- **다중 접근**(Multiple Access, MA)은 …`, `- **충돌 감지**(Collision Detection, CD)는 …`. 잼 신호(충돌을 모두에게 알리는 신호)와 무작위 시간 기다린 뒤 다시 보내기. 원인과 결과로 잇는다 — 무작위로 기다리므로 언제 보내질지 미리 알 수 없다(기출). 순서를 정해 주는 허락(토큰) 없이 각자 들어 보고 보낸다는 것을 한 줄로(토큰 방식은 「허락을 받은 장치만 보내는 다른 방식」 정도의 이름만, 기출이 견주는 대상). 전이중에서는 쓰지 않는다는 것과 재시도 횟수 같은 세부는 step 1 결과대로, 기출이 묻지 않는 세부는 넣지 않는다. step 1이 E 항목으로 남긴 「시험이 맞다고 보지만 표준과 다른 보기」는 가르치지 않는다 |

### 2. 문항 — `n037`~`n039`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n037` | `collision-domain` | 「개념 비교」 4지선다 — 같은 장치 넷을 허브에 이었을 때와 스위치에 이었을 때 충돌 도메인이 몇 개인지. 정답 수가 본문 사실로 정해져야 한다 |
| `n038` | `csma-cd` | 흔한 오해 — CSMA/CD도 토큰 같은 허락을 받아야 보낸다 — 를 겨냥한 예/아니요 감. 해설은 캐리어 감지로 각자 판단한다는 것을 가르친다. 주장의 방향은 균형에 맞춰 고른다 |
| `n039` | `csma-cd` | 「원인과 결과」 4지선다 — 충돌을 알아챈 뒤 장치가 하는 일의 차례, 또는 CSMA/CD에서 전송 지연을 미리 알기 어려운 까닭. `n038`과 다른 것을 묻는다 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다.

### 3. 도식 — `src/data/network/visuals/hub-switch-vlan.json`의 `diagrams`에 더한다

#### 3-1. `hub-switch-vlan.collision-domain` — `CollisionDomainDiagram`, JSON 키 `collision-domain`

- 물음형 제목 예: `충돌은 어디까지 번질까?`
- 그릴 것: step 6과 같은 장면(가운데 장비, 호스트 A~D)과 충돌 도메인을 나타내는 그룹 박스. 가운데 장비의 라벨이 시나리오마다 허브·스위치로 바뀌거나, 두 장비를 함께 그린다 — 280 폭에 맞는 쪽을 고른다.
  충돌 도메인 그룹은 시나리오마다 보이고 숨는다(그룹 박스는 흐려지지 않는다는 규칙과 부딪치지 않게, 시나리오에 따라 렌더하지 않는 방식으로).
- 시나리오:

  | id | label | 그룹·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `hub` | 허브에 이었을 때 | 호스트 넷과 허브를 함께 두르는 그룹 하나, 곁말 `충돌 도메인 1개` | 허브에 이은 장치 전체가 하나라, 어느 둘이 동시에 보내도 부딪친다 |
  | `switch` | 스위치에 이었을 때 | 포트마다 호스트 하나를 두르는 그룹 넷, 곁말 `충돌 도메인 4개` | 스위치는 포트마다 나눈다 |

- 요점 테스트: `hub`에서 충돌 도메인 그룹은 하나이고 호스트 넷을 모두 담는다. `switch`에서는 넷이고 저마다 호스트 하나만 담는다. 그룹끼리 겹치지 않는다.

#### 3-2. `hub-switch-vlan.csma-cd` — `CsmaCdDiagram`, JSON 키 `csma-cd`

- 물음형 제목 예: `둘이 동시에 보내면 어떻게 될까?`
- 그릴 것: 한 매체를 나눠 쓰는 장치들(step 6의 허브 장면을 쓰면 좋다 — 허브와 호스트 A~D, 또는 그중 A·B만 강조). 시나리오가 단계다.
- 시나리오(단계 순서):

  | id | label | 선명한 것·경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `sense` | 1. 듣기 | A와 허브, A 곁에 `신호가 있나?` 같은 본문의 말 | 보내기 전에 매체에 신호가 있는지 살피고, 있으면 기다린다 |
  | `collide` | 2. 충돌 | A·B 둘 다 보내는 경로, 허브 곁에 충돌 곁말, 잼 신호 곁말 | 둘이 동시에 보내면 충돌이 나고, 알아챈 쪽이 잼 신호로 알린다 |
  | `backoff` | 3. 기다렸다 다시 | A·B 곁에 서로 다른 기다림 곁말(시간 값을 지어내지 않는다), 다시 보내는 경로 하나 | 각자 무작위 시간 기다린 뒤 다시 보낸다 — 그래서 언제 보내질지 미리 알 수 없다 |

- 요점 테스트: 시나리오 셋의 「보이는 경로 + 곁말」이 서로 다르다. `collide`에서만 보내는 경로가 둘 이상 동시에 보이고, `backoff`의 두 기다림 곁말이 서로 다르다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~11)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 39개, 마지막 id는 `n039`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다. `hub-switch-vlan`의 개념 9~10, `n001`~`n036`, 앞 step의 도식 파일이 바뀌지 않았는지 기계로 확인한다.
2. 이 주제 화면을 개념 9부터 12까지 통독한다 — 충돌·잼 신호·토큰이 처음 나오는 자리에서 풀렸는가, 개념 10(반이중)과 같은 말을 되풀이하지 않는가.
3. 기출 문장을 옮기지 않았는가 — CSMA/CD 문항은 기출과 같은 사실을 묻더라도 상황과 문장을 직접 만들었는가.
4. `phases/72-network-ethernet-switch/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **스위치와 그 딸린 개념(13~)을 만들지 마라.** 이유: step 8부터의 범위다. 이 step의 글이 스위치를 말할 때는 한 줄 풀이로 그친다.
- **토큰 링을 풀어 설명하지 마라.** 이유: 토큰 링은 뒤 주제(`network-topology`, phase 83)의 범위다. 여기서는 CSMA/CD와 견주는 이름만 쓴다.
- **충돌을 빨강이나 번개 같은 그림 기호로 그리지 마라. 백오프 시간을 숫자로 지어 그리지 마라.** 이유: 나쁜 상태는 곁말과 흐림으로 보이고(ADR-036), 본문에 없는 예시 값은 그리지 않는다(ADR-038).
