# Step 9: hybrid-multicloud

## 배경

phase 100은 Azure AZ-900 과목의 첫 두 주제를 만든다. 전체 계획·결정·공통 규칙은 `phases/100-azure-cloud-concepts/guide.md`에 있다.
**이 step은 주제 `azure-cloud-models`의 나머지 개념 둘(11 하이브리드 클라우드, 12 다중 클라우드)의 글·문항과, 도식 `HybridCloudDiagram`, 네 모델을 견주는 표 `CloudModelsTable`을 만든다.**
이 phase의 마지막 step이다.

하이브리드 클라우드는 두 환경을 **서로 잇는** 구조라 개념에 도식을 둔다(guide.md 「배경」의 도식 결정). 다중 클라우드는 정의형이라 도식이 없고, 대신 이 주제의 네 모델을 정리하는 표가 붙는다.

## 읽어야 할 파일

- **`phases/100-azure-cloud-concepts/guide.md` 전체**
- `phases/100-azure-cloud-concepts/index.json`의 **step 7·8 `summary`**(개념마다 확정한 `name`, 쓰는 것과 쓰지 않는 것, 문항이 피할 상황, 이미 쓴 개념 8~10과 이미 푼 낱말, 문항 균형), step 6 `summary`(표 선례)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 ADR-060, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/azure/topics.json`(개념 8~10 — 이 step이 이어 쓴다), `src/data/azure/questions.json`, `src/data/azure/visuals/azure-cloud-models.json`, `src/data/azure/data.test.ts`·`visuals.test.ts`
- 도식 선례 — step 8의 `PublicPrivateCloudDiagram`과 그 테스트, guide.md 「도식」의 네트워크 선례. 표 선례 — step 6의 `azureCloudComputingTables.tsx`와 그 테스트
- `src/types/visuals.ts`, `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-cloud-models` 끝에 둘

`name`은 step 7 summary가 확정한 표기를 쓴다. 쓰기 전에 개념 8~10을 읽는다 — 이미 푼 낱말은 다시 풀지 않는다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `azure-cloud-models.hybrid-cloud` | 하이브리드 클라우드 | `azure-cloud-models.cloud-models` | 퍼블릭과 프라이빗을 **서로 이어** 함께 쓴다는 것(따로 쓰는 것과 무엇이 다른가), 쓰임 둘(수요가 잠시 늘 때 퍼블릭으로 넘김, 서비스마다 둘 곳을 고름), 가장 유연하다는 것. **온프레미스**를 한 줄로 푼다(표기는 step 7 결과대로). **도식의 예를 본문에 쓴다** — 예: 회사 A가 고객 데이터는 자기 데이터 센터의 프라이빗 클라우드에 두고 웹 앱은 Azure에서 실행하며 두 곳을 이어 둔다, 행사 기간에 주문이 몰리면 Azure에 서버를 더해 늘어난 몫을 맡긴다. 덤프의 갈린 문항(NO.208·248·317)은 step 7 처리대로 |
| 12 | `azure-cloud-models.multicloud` | 다중 클라우드 | `azure-cloud-models.cloud-models` | 둘 이상의 **퍼블릭** 공급자를 함께 쓴다는 것, 생기는 경우 둘, 두 환경을 모두 관리해야 한다는 부담. 하이브리드와의 차이를 4절대로(하이브리드는 퍼블릭과 프라이빗을 잇는다, 다중 클라우드는 퍼블릭 공급자가 여럿이다 — 둘이 함께 일어날 수도 있는지는 step 7 결과대로). Azure Arc는 이름과 한 줄 풀이만. Azure VMware Solution은 쓰지 않는다 |

### 2. 문항 — `src/data/azure/questions.json`에 `az012`~`az014`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az012` | `hybrid-cloud` | 4지선다 「상황 적용」 — 회사가 지금 쓰는 자기 서버는 그대로 두고 새로 필요한 서버만 퍼블릭 클라우드에 만들어 두 곳을 이어 쓰는 상황(본문 예와 다르게)의 모델. 보기는 퍼블릭·프라이빗·하이브리드·다중 클라우드 — **상황이 퍼블릭이나 다중 클라우드로도 읽히지 않게** 조건(자기 데이터 센터를 계속 쓴다, 공급자는 하나)을 문제문에 준다(guide.md 「문항」 4항, step 7 summary) |
| `az013` | `hybrid-cloud` | 예/아니요 「원리 이해」 — 예: 하이브리드 클라우드에서는 어떤 앱을 자기 데이터 센터에서, 어떤 앱을 퍼블릭 클라우드에서 실행할지 조직이 정할 수 있는가(예). `az012`와 다른 것을 묻는다. 주장의 방향은 균형으로 고른다 |
| `az014` | `multicloud` | 4지선다 「개념 비교」 — 하이브리드와 다중 클라우드를 가르는 상황. 「퍼블릭 클라우드」도 함께 맞게 읽히는 보기 구성을 피한다 — 예: 보기를 「무엇이 다른가」를 고르는 문장 보기로 쓰거나, 상황의 조건으로 하나만 맞게 한다. 고른 방법과 이유를 summary에 |

**균형**: step 8이 끝났을 때의 수(step 8 summary)에서 이 step이 끝났을 때 예·아니요 차이 1 이하, 4지선다 정답 위치 최대·최소 차이 2 이하가 되게 고른다. 과목 전체의 마지막 균형이다.

### 3. 도식 — `azure-cloud-models.hybrid-cloud` — `HybridCloudDiagram`, JSON 키 `hybrid-cloud`

문구는 `src/data/azure/visuals/azure-cloud-models.json`의 `diagrams["hybrid-cloud"]`(step 8이 만든 파일에 더한다 — `public-private-cloud`의 문구는 고치지 않는다).

- 물음형 제목 예: `자기 데이터 센터와 퍼블릭 클라우드를 이어 두면 무엇을 할 수 있을까?`
- 그릴 것: 그룹 박스 둘 — 「회사 A의 데이터 센터(프라이빗 클라우드)」와 「퍼블릭 클라우드(Azure)」. 둘을 잇는 **늘 보이는 연결선**(경로, 곁말 `서로 연결`). 노드는 본문 예의 말로 —
  프라이빗 쪽 `고객 데이터`·`웹 앱`(평소 자리), 퍼블릭 쪽 `웹 앱`·`추가 서버` 같은 것. 노드 id는 자리를 가른다(`private-data`·`private-app`·`public-app`·`public-extra` 등).
  같은 라벨(`웹 앱`)이 두 그룹에 있으면 시나리오가 「어디서 실행하나」를 가른다는 것이 보이게 한다.
- 시나리오:

  | id | label | 선명한 것 | 보이는 경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `placement` | 둘 곳을 고른다 | 프라이빗의 `고객 데이터`, 퍼블릭의 `웹 앱` | 연결선, 곁말 `여기에 둔다` 둘 | 서비스마다 둘 곳을 고른다 — 고객 데이터는 자기 데이터 센터에 두고 웹 앱은 Azure에서 실행하며, 두 곳이 이어져 있어 웹 앱이 데이터를 쓸 수 있다 |
  | `burst` | 수요가 잠시 늘 때 | 프라이빗의 `웹 앱`, 퍼블릭의 `추가 서버` | 연결선, 곁말 `늘어난 몫` | 평소에는 자기 데이터 센터로 감당하다가 주문이 몰리는 동안 Azure에 서버를 더해 늘어난 몫을 맡기고, 수요가 줄면 돌려준다 |

- 요점 테스트:
  - 두 시나리오 모두 선명한 노드가 두 그룹에 하나 이상씩 있고, 연결선이 보인다.
  - `placement`와 `burst`의 선명한 노드 집합이 서로 다르다. `placement`의 선명한 퍼블릭 노드 라벨이 `웹 앱`이고 `burst`의 선명한 퍼블릭 노드 라벨은 그와 다르다(늘어난 몫을 맡는 노드).
  - `전체`에서 연결선 하나가 두 그룹 박스의 변 사이를 잇는다.
- 캡션·곁말·그룹 라벨·노드 라벨의 사실과 예는 개념 11 본문에 있어야 한다(ADR-036·ADR-038). 「돌려준다」 같은 말을 쓰려면 본문에 그 사실이 있어야 한다.

### 4. 표 — `azure-cloud-models.multicloud` — `CloudModelsTable`, JSON 키 `cloud-models`

`src/components/diagrams/azureCloudModelsTables.tsx`(테스트 `azureCloudModelsTables.test.tsx` — 먼저 쓰고 실패를 확인한다). step 6의 `PricingModelsTable`과 같은 꼴.

- `label` 예: `네 클라우드 모델 견주기`.
- 열 셋: 모델 · 하드웨어를 갖추고 관리하는 쪽 · 이럴 때 고른다. 행 넷: 퍼블릭 클라우드 · 프라이빗 클라우드 · 하이브리드 클라우드 · 다중 클라우드(행 머리는 개념 `name`과 같게).
  칸마다 개념 9~12 본문의 말로 — 예: 퍼블릭 「클라우드 공급자」 / 「장비를 사지 않고 빨리 시작하고 쓴 만큼 내고 싶을 때」, 프라이빗 「그 조직(데이터 센터는 건물 안이나 밖)」 / 「리소스와 보안을 직접 통제해야 할 때」,
  하이브리드 「두 쪽 모두 — 프라이빗은 조직이, 퍼블릭은 공급자가」 / 「서비스마다 둘 곳을 고르거나 잠시 늘어난 수요를 넘기고 싶을 때」, 다중 클라우드 「공급자 둘 이상」 / 「공급자마다 다른 기능을 쓰거나 다른 공급자로 옮겨 가는 중일 때」.
  본문에 없는 사실은 칸에 쓰지 않는다(ADR-036).
- `sources`는 네 개념 id. `columnWidths`는 guide.md 「표」대로 어림하고 계산을 summary에 적는다.

### 5. registry

`'azure-cloud-models.hybrid-cloud': HybridCloudDiagram`, `'azure-cloud-models.multicloud': CloudModelsTable` 두 줄(`azure-cloud-models.private-cloud` 줄 뒤에 개념 순서대로).

위 도식·표 설계는 출발점이다. 본문(step 7 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(5·6·8·9)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 14개, 마지막 id는 `az014`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `azure-cloud-models`의 개념이 다섯이고 순서·`parentId`가 guide.md 표와 같은지, 개념 8~10과 step 8의 문항·도식 문구, 앞 주제 전체가 통째로 그대로인지 기계로 본다.
3. **이 phase의 두 주제 전체를 처음부터 통독한다**(개념 12개, 도식 셋·표 둘의 문구, 문항 14개). 풀이 없이 처음 나오는 낱말, 두 주제 사이에 어긋난 표기(같은 것을 다른 말로 부름), 진행 안내 문장,
   덤프·용어집의 틀린 주장이 남았는지 본다. 이 step의 범위 밖(개념 1~10)에서 찾은 것은 고치지 말고 summary에 적는다.
4. 과목 전체의 균형 줄(예/아니요, 정답 위치)이 guide.md 「문항」 9항을 지키는지 본다.
5. `phases/100-azure-cloud-concepts/index.json`의 step 9를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」에 더해, 3번 통독에서 찾은 것(앞 개념에 고칠 것 포함)을 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~10과 그 문항·도식·표를 고치지 마라.** 이유: 앞 step의 결과다. 고칠 것을 찾으면 summary에 적는다 — 메인 세션이 phase 끝에 모아 판단한다.
- **다중 클라우드에 도식을 더하지 마라.** 이유: 정의형 개념이다(사용자 결정). 견주기는 표가 맡는다.
- **Azure Arc를 이 주제에서 늘려 쓰지 마라.** 이유: `azure-management-tools` 주제(phase 107)의 개념이다. 여기서는 이름과 한 줄 풀이로 그친다.
