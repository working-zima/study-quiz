# Step 8: public-private-cloud

## 배경

phase 100은 Azure AZ-900 과목의 첫 두 주제를 만든다. 전체 계획·결정·공통 규칙은 `phases/100-azure-cloud-concepts/guide.md`에 있다.
**이 step은 주제 `azure-cloud-models`(클라우드 배포 모델)를 만들고 그 첫 개념 셋(8 클라우드 모델, 9 퍼블릭 클라우드, 10 프라이빗 클라우드)의 글·문항과,
이 주제의 첫 도식 `PublicPrivateCloudDiagram`을 함께 만든다.** 주제를 만드는 step이 도식도 만들어야 `azureDiagramCoverage.test.ts`가 통과한다.

퍼블릭과 프라이빗은 「하드웨어를 누가 갖추고 관리하나」와 「누가 함께 쓰나」로 갈린다 — 이것이 구조가 있는 비교라 도식을 둔다.
학습자는 앞 주제(`azure-cloud-computing`)를 읽지 않고 이 주제로 바로 들어올 수 있다.

## 읽어야 할 파일

- **`phases/100-azure-cloud-concepts/guide.md` 전체**
- `phases/100-azure-cloud-concepts/index.json`의 step 5·6 `summary`(문항 균형, 도식·표 선례가 된 결정), **step 7 `summary`**(개념마다 확정한 `name`, 쓰는 것과 쓰지 않는 것, 데이터 센터 문항(d)의 처리, 문항이 피할 상황)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 ADR-060, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/azure/topics.json`(앞 주제 — 표기와 낱말 풀이의 수준을 맞춘다), `src/data/azure/questions.json`, `src/data/azure/index.ts`, `src/data/azure/data.test.ts`·`visuals.test.ts`, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — step 5의 `CapacityPlanningDiagram`과 그 테스트, guide.md 「도식」에 적힌 네트워크 선례(특히 그룹 박스와 경로가 있는 `CastTypesDiagram`), `src/types/visuals.ts`, `src/components/diagrams/registry.ts`,
  `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-cloud-computing` 주제 객체 바로 뒤에 주제 객체를 더한다 — `{ "id": "azure-cloud-models", "title": "클라우드 배포 모델", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 8~10이다. `name`은 step 7 summary가 확정한 표기를 쓴다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 8 | `azure-cloud-models.cloud-models` | 클라우드 모델 | — | 이 주제의 머리 개념이자 첫 개념이라 **데이터 센터**, **클라우드 공급자**, **리소스**를 짧게 푼다(앞 주제와 같은 수준으로 — 그 주제를 읽었다고 가정하지 않는다). 모델을 가르는 기준 둘(하드웨어를 누가 갖추고 관리하나, 한 조직만 쓰나 누구나 살 수 있나)을 세우고, 주요 셋과 넷째 경우를 이름만 든다 — 각 모델의 내용은 뒤 개념이 맡으므로 여기서 풀지 않는다(「~에서 다룬다」를 쓰지 않는다). 목록 개념이 아니다 |
| 9 | `azure-cloud-models.public-cloud` | 퍼블릭 클라우드 | `azure-cloud-models.cloud-models` | 공급자가 짓고 운영, 누구나 서비스를 살 수 있음(일반 공개 — 프라이빗과의 핵심 차이). 여러 고객이 하드웨어를 함께 쓰되 서로 나뉜다는 것과 **테넌트**의 풀이는 step 7 결과대로. 강점(규모를 키울 때 자본 지출 없음 — **자본 지출**을 한 줄로 푼다, 빨리 만들고 없앰, 쓴 만큼)과 약점(리소스·보안을 완전히 통제하지 못함). 「누구나 쓸 수 있다」의 뜻을 오해하지 않게 쓴다. 예: Azure |
| 10 | `azure-cloud-models.private-cloud` | 프라이빗 클라우드 | `azure-cloud-models.cloud-models` | 한 조직 전용, 인터넷으로 서비스를 내주기도 한다는 것, 통제권과 비용, 둘 수 있는 곳(사업장 안 / 사업장 밖 전용 데이터 센터, 제3자 운영 가능), 하드웨어 구매·유지 책임. 퍼블릭과 무엇이 다르고 왜 고르는지(WRITING_GUIDE 4절). 「자기 데이터 센터가 꼭 있어야 하나」는 step 7의 d 처리대로 |

### 2. 문항 — `src/data/azure/questions.json`에 `az009`~`az011`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az009` | `cloud-models` | 예/아니요 「개념 확인」 — 클라우드 모델이 무엇으로 갈리는지에 관한 흔한 오해 하나(예: 클라우드 모델은 그 클라우드에서 쓰는 서비스의 종류로 가른다 — 아니요, 또는 같은 조직이 둘 이상의 모델을 함께 쓸 수 있다 — 예). 주장의 방향은 아래 균형으로 고른다. 문제문이 이 주제 밖의 낱말을 풀이 없이 쓰지 않게 |
| `az010` | `public-cloud` | 예/아니요 「흔한 오해」 — 퍼블릭 클라우드는 누구나 서비스를 살 수 있으니 한 회사가 만든 리소스에 다른 회사도 들어올 수 있는가(아니요). step 7이 고객 사이의 격리를 확인하지 못했으면 다른 확인된 사실(여러 고객이 공급자의 하드웨어를 함께 쓰는가 — 예 등)로 바꾼다 |
| `az011` | `private-cloud` | 예/아니요 「흔한 오해」 — 프라이빗 클라우드는 그 조직의 건물 안 데이터 센터에만 둘 수 있는가(아니요), 또는 프라이빗 클라우드는 인터넷과 끊어져 있어야 하는가(아니요). 하나를 고른다 |

**균형**: step 6이 끝났을 때의 예/아니요 수(step 6 summary)에서 이 step의 셋을 더해 예·아니요 차이가 1 이하가 되게 주장의 방향을 고른다(설계 때 계획은 step 6 끝 예 2·아니요 2 → 이 step에서 예 1·아니요 2 또는 예 2·아니요 1).
세 문항이 모두 예/아니요라 4지선다 정답 위치는 바뀌지 않는다. 한 문항을 4지선다로 바꾸려면 같은 범주의 그럴듯한 오답 셋을 출처 안에서 쓸 수 있어야 한다 — 바꾸면 이유를 summary에 적는다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-cloud-models.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-cloud-models': azureCloudModelsVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### `azure-cloud-models.private-cloud` — `PublicPrivateCloudDiagram`, JSON 키 `public-private-cloud`

- 물음형 제목 예: `클라우드의 하드웨어는 누가 갖추고, 누가 함께 쓸까?`
- 그릴 것: 그룹 박스 둘.
  - 「클라우드 공급자의 데이터 센터」 — 안에 공급자의 하드웨어 노드(예: `서버`·`스토리지` 둘이나 하드웨어 하나). 그 위(또는 옆)에 고객 노드 `회사 A`·`회사 B`·`회사 C`가 있고, 고객마다 하드웨어로 가는 경로가 있다.
  - 「한 조직 전용 데이터 센터」 — 안에 전용 하드웨어 노드. 고객 노드 `회사 D` 하나가 있고 그 하드웨어로 가는 경로가 있다.
  - 고객과 하드웨어를 잇는 경로는 시나리오마다 보인다. 노드 라벨은 본문의 말과 같게.
- 시나리오:

  | id | label | 선명한 것 | 보이는 경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `public` | 퍼블릭 클라우드 | 회사 A·B·C, 공급자의 하드웨어 | A·B·C에서 공급자 하드웨어로 가는 경로 셋, 곁말 `공급자가 갖추고 관리`(공급자 그룹 곁) | 공급자가 하드웨어를 갖추고 관리하고, 서비스를 산 여러 회사가 그 하드웨어를 함께 쓴다(서로의 리소스가 나뉜다는 것은 본문에 있을 때만) |
  | `private` | 프라이빗 클라우드 | 회사 D, 전용 하드웨어 | D에서 전용 하드웨어로 가는 경로 하나, 곁말 `한 조직만 씀` | 한 조직만 쓰는 하드웨어이고, 그 데이터 센터는 조직의 건물 안일 수도 밖(제3자 운영)일 수도 있다. 하드웨어를 사고 유지하는 책임이 그 조직에 있다 |

- 요점 테스트:
  - `public`에서 선명한 고객 노드가 둘 이상이고, 보이는 경로가 모두 같은 그룹(공급자 데이터 센터) 안의 노드에서 끝난다.
  - `private`에서 선명한 고객 노드가 정확히 하나이고, 보이는 경로가 하나이며 전용 데이터 센터 그룹 안의 노드에서 끝난다.
  - 두 시나리오의 선명한 하드웨어 노드가 서로 다른 그룹에 있다.
- 캡션·곁말·그룹 라벨의 사실은 개념 8~10 본문에 있어야 한다(ADR-036). step 7이 「둘 수 있는 곳」을 확인하지 못했으면 캡션에서 뺀다.

위 도식 설계는 출발점이다. 본문(step 7 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-cloud-models.private-cloud': PublicPrivateCloudDiagram` 한 줄(`azure-cloud-computing.*` 키들 뒤).

## Acceptance Criteria

guide.md 「개념을 넣는 step(5·6·8·9)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 11개, 마지막 id는 `az011`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `azure-cloud-computing` 바로 뒤에 있고 `importance` 2·`sourcePages` [0, 0]인지, 앞 주제의 객체가 통째로 그대로인지 기계로 본다.
   `data.test.ts`의 주제 지도·순서 테스트와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 7 summary가 「쓰지 않는다」·「고쳐 쓴다」로 정한 것을 지켰는가, 덤프끼리 갈린 단정을 쓰지 않았는가.
4. `phases/100-azure-cloud-concepts/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 11·12(하이브리드 클라우드, 다중 클라우드)를 만들지 마라.** 이유: step 9의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **앞 주제 `azure-cloud-computing`의 글·문항·도식·표를 고치지 마라.** 이유: step 5·6의 결과다.
- **step 7이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
