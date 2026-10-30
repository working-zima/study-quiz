# Step 6: pricing-serverless

## 배경

phase 100은 Azure AZ-900 과목의 첫 두 주제를 만든다. 전체 계획·결정·공통 규칙은 `phases/100-azure-cloud-concepts/guide.md`에 있다.
**이 step은 주제 `azure-cloud-computing`의 나머지 개념 넷(4 종량제, 5 Azure 예약, 6 Azure 스팟 가상 머신, 7 서버리스)의 글·문항과, 세 가격 모델을 견주는 표 `PricingModelsTable`을 만든다.**
이 주제의 도식(`CapacityPlanningDiagram`)은 step 5가 만들었으므로 이 step은 도식을 더하지 않는다 — 넷 다 정의형 개념이다(guide.md 「배경」의 도식 결정).

공식 학습 가이드는 이 자리를 「Compare cloud pricing models」·「Describe serverless」로 묻는다. 그래서 세 가격 모델은 **서로 견주어** 이해되게 쓰고(WRITING_GUIDE 4절), 표가 그 비교를 한눈에 보인다.

## 읽어야 할 파일

- **`phases/100-azure-cloud-concepts/guide.md` 전체**
- `phases/100-azure-cloud-concepts/index.json`의 step 4·5 `summary`(step 5 — 이미 쓴 개념 1~3, 이미 푼 낱말, 문항 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 ADR-060, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식」 절의 비교표 부분
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/azure/topics.json`(개념 1~3 — 이 step이 이어 쓴다), `src/data/azure/questions.json`, `src/data/azure/visuals/azure-cloud-computing.json`, `src/data/azure/data.test.ts`·`visuals.test.ts`
- 표 선례 `src/components/diagrams/networkBasicsTables.tsx`·`networkBasicsTables.test.tsx`, `src/components/diagrams/ComparisonTableFigure.tsx`(고치지 마라), `src/types/visuals.ts`, `src/components/diagrams/registry.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-cloud-computing` 끝에 넷

`name`은 step 4 summary가 확정한 표기를 쓴다. 쓰기 전에 개념 1~3을 읽는다 — 이미 푼 낱말(서버·데이터 센터·VM·리소스 등)은 다시 풀지 않는다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 4 | `azure-cloud-computing.pay-as-you-go` | 종량제 | `azure-cloud-computing.consumption-based-model` | 소비 기반 모델(원리)과 종량제(그 원리를 따르는 가격 모델)가 어떻게 다른지 첫 문단에서 가른다. 약속 없이 쓰기 시작하고 그만둘 수 있다는 것, 요금을 재는 단위는 step 4 결과대로. 뒤의 예약·스팟이 종량제를 기준으로 견준다는 것이 읽히게 쓴다(「~보다 낮다」의 기준) — 진행 안내 문장은 쓰지 않는다 |
| 5 | `azure-cloud-computing.reservations` | Azure 예약 | — | 1년·3년 약정, 종량제보다 낮은 가격, 청구 할인(리소스 동작은 그대로), 결제 방법과 총액, 쓰지 않은 시간의 할인(step 4 결과대로), 맞는 작업. **약정**(미리 기간을 정해 쓰겠다고 약속하는 것)을 한 줄로 푼다. 할인율 수치는 쓰지 않는다 |
| 6 | `azure-cloud-computing.spot-vm` | Azure 스팟 가상 머신 | — | 남는 용량·큰 할인, 회수(언제·왜·예고 시간은 step 4 결과대로), SLA 없음(**SLA**를 한 줄로 푼다), 맞는 작업과 맞지 않는 작업. 예약과 무엇이 반대인지(예약은 오래 쓰겠다고 약속해 할인받고, 스팟은 언제 끊길지 모르는 것을 받아들여 할인받는다) |
| 7 | `azure-cloud-computing.serverless` | 서버리스 | — | 「서버가 없다」가 아니라는 것부터. 누가 무엇을 맡는지(공급자 — 서버 배포·유지·늘리기, 사용자 — 코드), 언제 실행되고 언제 요금이 붙는지, 소비 기반 모델의 예라는 것. **이벤트**(파일이 올라옴, 요청이 들어옴 같은 일)를 한 줄로 푼다. Azure Functions를 예로. VM과의 차이는 step 4 결과대로. 덤프 NO.126의 틀린 답은 가르치지 않는다(`corrections.md`) |

### 2. 문항 — `src/data/azure/questions.json`에 `az005`~`az008`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az005` | `pay-as-you-go` | 예/아니요 「흔한 오해」 또는 「원리 이해」 — 예: 종량제로 쓰다가 리소스를 돌려주면 그 뒤로는 그 리소스의 요금이 붙지 않는가(예). 주장의 방향은 균형에 맞춰 고른다 — step 5가 끝났을 때 예/아니요 수는 step 5 summary에 있다 |
| `az006` | `reservations` | 예/아니요 「흔한 오해」 — 예: 예약 요금을 달마다 나눠 내면 한꺼번에 낼 때보다 총액이 더 많은가(아니요), 또는 쓰지 않은 시간의 할인이 다음 달로 넘어가는가(아니요). step 4가 확인한 사실로만 |
| `az007` | `spot-vm` | 4지선다 「원인과 결과」 — 스팟 VM에서 돌던 작업이 갑자기 멈춘 까닭으로 맞는 것. 오답은 다른 가격 모델의 성질을 잘못 가져온 것(약정 기간이 끝남 등)이나 그럴듯한 오해에서. 또는 「상황 적용」 — 어떤 작업에 스팟이 맞는가(보기는 작업 넷). 둘 중 하나를 고르고 이유를 summary에 |
| `az008` | `serverless` | 4지선다 「개념 비교」나 「원리 이해」 — 예: VM으로 돌리던 작은 기능을 Azure Functions로 옮기면 사용자가 더는 하지 않아도 되는 일은 무엇인가(서버의 OS 관리·용량 늘리기 쪽이 정답, 오답은 코드 작성·실행될 조건 정하기처럼 여전히 사용자 몫인 일). 정의를 거꾸로 묻는 「무엇인가?」 꼴은 쓰지 않는다 |

`az007`을 「어떤 가격 모델인가」 꼴로 내면 보기 넷이 모두 가격 모델이어야 하는데 이 주제의 가격 모델은 셋뿐이다 — 범주 밖의 넷째 보기(서버리스 등)로 채우지 마라(ADR-030 기준 4). 그래서 위 두 꼴 가운데 하나다.
덤프 문항(NO.11·78·494의 「쓰이지 않는 용량을 크게 할인해 주는 것」 빈칸 채우기)의 꼴을 옮기지 않는다.

### 3. 표

`src/components/diagrams/azureCloudComputingTables.tsx`에 `PricingModelsTable`(테스트 `azureCloudComputingTables.test.tsx` — 먼저 쓰고 실패를 확인한다). 문구는 `src/data/azure/visuals/azure-cloud-computing.json`의 `tables["pricing-models"]`.

- `label` 예: `종량제·Azure 예약·스팟 가상 머신 견주기`(개념의 `name`과 같은 말로).
- 열 셋: 가격 모델 · 미리 약속하는 것 · 어떤 작업에 맞나. 행 셋: 종량제 · Azure 예약 · Azure 스팟 가상 머신(행 머리는 개념 `name`과 같게).
  칸마다 개념 4·5·6 본문의 말로 — 예: 종량제 「약속하지 않는다. 쓴 만큼 낸다」 / 「쓰는 양이 들쭉날쭉하거나 잠깐 쓰는 작업」, 예약 「1년이나 3년 동안 쓰겠다고 약속한다」 / 「늘 같은 양을 오래 쓰는 작업」,
  스팟 「약속은 없지만 Azure가 용량을 돌려받으면 중단된다」 / 「멈춰도 다시 하면 되는 작업」. 본문에 없는 사실은 칸에 쓰지 않는다(ADR-036).
- `sources`는 세 개념 id. `columnWidths`는 guide.md 「표」대로 어림해 정하고 계산을 summary에 적는다.
- registry: `'azure-cloud-computing.spot-vm': PricingModelsTable`(개념 6에 붙는다 — 세 모델을 다 읽은 자리).

## Acceptance Criteria

guide.md 「개념을 넣는 step(5·6·8·9)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 8개, 마지막 id는 `az008`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다. 교차 검사기의 노드·경로 수는 step 5가 끝났을 때와 같아야 한다(이 step은 도식을 더하지 않는다).
2. 주제 `azure-cloud-computing`의 개념이 일곱이고 순서·`parentId`가 guide.md 표와 같은지, 개념 1~3과 step 5의 문항·도식 문구가 통째로 그대로인지 기계로 본다.
3. 주제 전체(개념 1~7과 도식·표 문구)를 처음부터 통독한다 — 세 가격 모델과 서버리스가 서로 견주어 이해되는가, 풀이 없이 처음 나오는 낱말이 없는가, 표의 칸마다 본문에 근거가 있는가.
4. `phases/100-azure-cloud-concepts/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~3과 그 문항·도식을 고치지 마라.** 이유: step 5의 결과다. 고칠 것을 찾으면 summary에 적는다.
- **할인율·가격·VM 크기 이름을 쓰지 마라.** 이유: 상품·지역·시기마다 바뀐다(guide.md 「예시 값」).
- **이 주제에 도식을 더하지 마라.** 이유: 넷 다 정의형 개념이고, 사용자 결정은 정의형 개념에 도식을 두지 않는 것이다. 비교는 표가 맡는다.
- **`azure-cloud-models`의 개념을 만들지 마라.** 이유: step 8·9의 범위다.
