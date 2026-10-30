# Step 5: cloud-computing-capex

## 배경

phase 100은 Azure AZ-900 과목의 첫 두 주제를 만든다. 전체 계획·결정·공통 규칙은 `phases/100-azure-cloud-concepts/guide.md`에 있다.
**이 step은 주제 `azure-cloud-computing`(클라우드 컴퓨팅과 비용 모델)을 만들고 그 첫 개념 셋(1 클라우드 컴퓨팅, 2 자본 지출과 운영 지출, 3 소비 기반 모델)의 글·문항과,
이 주제의 첫 도식 `CapacityPlanningDiagram`을 함께 만든다.** 주제를 만드는 step이 도식도 만들어야 `azureDiagramCoverage.test.ts`(주제마다 도식 하나 이상)가 통과한다.

이 주제는 Azure 과목의 첫 화면이다. 학습자는 클라우드를 처음 배우는 사람이고, 서버·데이터 센터·가상 머신이라는 말도 처음일 수 있다.

## 읽어야 할 파일

- **`phases/100-azure-cloud-concepts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/100-azure-cloud-concepts/index.json`의 step 1·4 `summary`(step 4 — 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 ADR-060(step 3이 쓴 Azure 과목 ADR), **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」)
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- `src/data/network/topics.json`의 앞 몇 줄과 `questions.json`의 앞 몇 줄 — 파일 꼴의 본보기
- 도식 선례(guide.md 「도식」에 적힌 파일들 — 특히 표 모양 그림 `MacTableDiagram`), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

빈 배열에 주제 객체를 더한다 — `{ "id": "azure-cloud-computing", "title": "클라우드 컴퓨팅과 비용 모델", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`. 개념은 guide.md 표의 1~3이다.
`name`은 step 4 summary가 확정한 표기를 쓴다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `azure-cloud-computing.cloud-computing` | 클라우드 컴퓨팅 | — | 이 주제의 첫 개념이라 **서버**(다른 컴퓨터의 요청을 받아 일을 해 주는 컴퓨터), **데이터 센터**, **가상 머신(VM)**, **스토리지**를 짧게 푼다(근거는 step 4의 b). 회사가 장비를 직접 사서 자기 건물에 두고 쓰던 방식과 견주어, 무엇을 누구에게서 어떻게 받는지가 그려지게 쓴다. 계절 행사의 예(공식 문서의 예). 덤프가 묻는 셋(물리 서버·인터넷 연결·가상화)은 step 4 결과대로 — 확인된 것만 |
| 2 | `azure-cloud-computing.capex-opex` | 자본 지출과 운영 지출 | — | **목록 개념** — 소개 문단 하나 뒤 `- **자본 지출**(Capital expenditure, CapEx)은 …`, `- **운영 지출**(Operational expenditure, OpEx)은 …` 두 항목. 둘을 가르는 기준이 「언제·어떻게 내는가」(미리 한꺼번에 / 쓰는 동안 계속)라는 것이 항목에서 드러나게 쓴다. 클라우드가 운영 지출로 분류되는 까닭(쓰는 만큼 그때그때 낸다). 예는 step 4가 공식 문서에서 확인한 예만 — 덤프만 말하는 분류(전기료 등)는 쓰지 않는다 |
| 3 | `azure-cloud-computing.consumption-based-model` | 소비 기반 모델 | — | **리소스**를 한 줄로 푼다. 이점과 용량 계획(크게 잡으면 / 작게 잡으면 / 클라우드는 수요에 맞춰). **도식의 예를 본문에 쓴다** — 넉 달 동안 필요한 서버가 1월 2대·2월 3대·3월 5대·4월 2대인 회사가, 기존 데이터 센터에서 서버 4대를 미리 갖추면 1·2·4월에는 서버가 남아 놀고 3월에는 1대가 모자라며, 클라우드에서는 그달 필요한 만큼 빌려 쓰고 쓴 만큼만 낸다(숫자는 예라고 밝힌다). 자본 지출·운영 지출과의 관계는 앞 개념을 되짚는 한 줄로 |

### 2. 문항 — `src/data/azure/questions.json`에 `az001`~`az004`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az001` | `cloud-computing` | 예/아니요(아니요) 「흔한 오해」 — 회사가 클라우드 서비스를 쓰려면 먼저 자기 물리 서버를 갖춰야 하는가. step 4가 확인하지 못했으면 같은 개념의 확인된 사실로 바꾼다 |
| `az002` | `capex-opex` | 4지선다 「상황 적용」 — 회사가 쓰는 돈 넷 가운데 운영 지출(또는 자본 지출)에 해당하는 것을 고른다. 보기 넷은 모두 공식 문서가 직접 분류한 예이거나 정의만으로 하나로 갈리는 것이어야 한다 — 정의로 갈리지 않는 예(전기료 등)는 보기에 넣지 않는다 |
| `az003` | `capex-opex` | 예/아니요(예) 「원리 이해」 — 회사가 서버를 사던 방식에서 클라우드로 옮기면 지출이 자본 지출 쪽에서 운영 지출 쪽으로 옮겨 가는가, 같은 꼴. `az002`와 다른 것을 묻는다 |
| `az004` | `consumption-based-model` | 4지선다 「원인과 결과」 — 기존 데이터 센터에서 앞으로 필요한 용량을 너무 크게 잡으면 어떻게 되는가. 오답은 너무 작게 잡았을 때의 결과(앱이 느려짐, 하드웨어를 더 주문해야 함)처럼 실제로 헷갈리는 것에서. 본문 예와 다른 수·상황으로 |

덤프 문항의 문장을 옮기지 않는다 — 덤프가 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형(예·아니요 차이 1 이하, 정답 위치 최대·최소 차이 2 이하)을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-cloud-computing.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-cloud-computing': azureCloudComputingVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### `azure-cloud-computing.consumption-based-model` — `CapacityPlanningDiagram`, JSON 키 `capacity-planning`

- 물음형 제목 예: `필요한 서버 수가 달마다 다르면, 미리 갖춘 서버와 클라우드에서 빌린 서버는 어떻게 다를까?`
- 그릴 것 — 표 모양 그림(선례 `MacTableDiagram`): 세 줄, 줄마다 달 넷의 노드(높이 32, 회색). 줄은 그룹 박스로 묶고 그룹 라벨로 무엇의 줄인지 밝힌다.
  - 줄 1 「필요한 서버」: `1월 2대`·`2월 3대`·`3월 5대`·`4월 2대`
  - 줄 2 「기존 데이터 센터 — 미리 갖춘 서버」: `4대` 넷
  - 줄 3 「클라우드 — 그달 빌린 서버」: `2대`·`3대`·`5대`·`2대`
  - 같은 달은 같은 열에 둔다. 경로는 없다(guide.md 「도식 테스트」의 경로가 없는 도식).
  - 곁말(9): 시나리오 `traditional`에서 줄 2의 노드마다 아래에 `2대 남음`·`1대 남음`·`1대 모자람`·`2대 남음`. 곁말이 다음 줄의 그룹 라벨과 겹치지 않게 줄 2 그룹 박스 안에 자리를 둔다.
  - 세로형(폭 280)은 열 넷이 한 줄에 들어가야 한다 — 노드 폭과 간격을 반각 문자 1.15배 규칙(guide.md)으로 어림해 정한다. 가로형(폭 440)은 같은 짜임을 넓게.
- 시나리오:

  | id | label | 선명한 것 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `traditional` | 기존 데이터 센터 | 줄 1·줄 2의 노드 | 줄 2 아래 넷 | 미리 4대를 갖추면 필요한 서버가 적은 달에는 서버가 남아 놀고(노는 장비에도 돈을 썼다), 많이 필요한 3월에는 모자라 앱이 느려진다 |
  | `cloud` | 클라우드 | 줄 1·줄 3의 노드 | 없음 | 클라우드에서는 달마다 필요한 만큼 빌리고 줄면 돌려주므로 남는 서버도 모자라는 서버도 없고, 쓴 만큼만 낸다 |

- 요점 테스트:
  - `traditional`의 보이는 곁말이 넷이고 줄 2의 노드 넷과 같은 열 순서로 놓인다. 「모자람」이 든 곁말은 하나이고, 그 열의 줄 1 라벨의 대수(5)가 줄 2의 대수(4)보다 크다. 나머지 셋은 「남음」이고 그 열의 줄 1 대수가 4보다 작다.
  - `cloud`에서 열마다 줄 3 노드의 라벨이 줄 1 라벨의 달을 뺀 부분과 같다(`1월 2대` ↔ `2대`).
  - `traditional`에서 줄 3 노드는 opacity `0.25`, `cloud`에서 줄 2 노드는 opacity `0.25`이고 그룹 박스는 흐려지지 않는다.
- 캡션·그룹 라벨·곁말의 사실은 개념 3 본문에 있어야 한다(ADR-036). 「남음」·「모자람」이 본문의 말과 같게 쓴다.

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

registry에는 `'azure-cloud-computing.consumption-based-model': CapacityPlanningDiagram` 한 줄(네트워크 키들 뒤).

## Acceptance Criteria

guide.md 「개념을 넣는 step(5·6·8·9)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 4개, 마지막 id는 `az004`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 첫 주제이고 `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·순서·진행 안내 테스트와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 4 summary가 「쓰지 않는다」·「고쳐 쓴다」로 정한 것을 지켰는가. 본문의 예(2·3·5·2대와 4대 — 남는 대수와 모자란 대수)를 다시 셈해 봤는가.
4. `phases/100-azure-cloud-concepts/index.json`의 step 5를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 4~7(종량제, Azure 예약, Azure 스팟 가상 머신, 서버리스)을 만들지 마라.** 이유: step 6의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **step 4가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `official.md`에 먼저 더한다.
- **덤프만 말하는 지출 분류(데이터 센터 전기료 등)를 본문·문항에 쓰지 마라.** 이유: 덤프에 틀린 답이 있고, 공식 문서가 말하지 않는 분류를 가르치게 된다(`corrections.md`).
