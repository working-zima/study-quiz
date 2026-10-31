# Step 4: functions-app-service

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/103-azure-compute-networking/guide.md`에 있다.
**이 step은 주제 `azure-compute`의 나머지 개념 둘(8 Azure Functions, 9 Azure App Service)의 글·문항과 도식 `FunctionTriggerDiagram`, 그리고 앱을 실행하는 네 곳을 견주는 표 `HostingOptionsTable`을 만든다.**
이 step이 끝나면 주제 `azure-compute`가 완성된다.

두 개념 모두 앞 phase의 글과 겹친다 — 서버리스와 Functions의 기본은 `azure-cloud-computing.serverless`가, App Service가 PaaS라는 것은 `azure-service-types.paas`가 이미 가르친다(guide.md 「배경」).
이 step은 그것을 한 줄로 되짚고 **Functions에만 있는 것**(트리거의 종류, 상태, 호스팅을 옮길 수 있다는 것)과 **App Service에만 있는 것**(HTTP 기반, 앱 종류 넷, 배포)을 쓴다.

사실은 step 0이 확인해 `official.md`에 남긴 것에서만 가져온다.

## 읽어야 할 파일

- **`phases/103-azure-compute-networking/guide.md` 전체**
- `phases/103-azure-compute-networking/index.json`의 step 0·3 `summary` — step 0: Functions 요금을 쓸 때의 한정, App Service의 사실, 표 칸의 근거 / step 3: 교차 검사 수, 균형 줄
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체, 비교표 절
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`(D1 — NO.126)
- `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-compute`(개념 1~7)와 앞 주제의 `azure-cloud-computing.serverless`, `azure-service-types.paas` — 같은 말을 되풀이하지 않는다
- `src/data/azure/questions.json`의 `az008`(Functions로 옮긴 뒤 남는 일)·`az036`~`az037`(PaaS) — 같은 것을 묻지 않는다
- 도식 선례 — step 1~3의 도식과 `src/data/azure/visuals/azure-compute.json`
- 표 선례 — `src/components/diagrams/azureServiceTypesTables.tsx`와 `.test.tsx`(phase 101), `src/data/azure/visuals/azure-service-types.json`의 `tables`, `src/components/diagrams/ComparisonTableFigure.tsx`(고치지 마라)

## 작업

### 1. 개념 — `azure-compute` 주제의 `concepts` 끝에 덧붙인다

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 8 | `azure-compute.functions` | Azure Functions | — | **서버리스**를 이 주제에서 한 줄로 다시 푼다. **이벤트**·**트리거**·**REST 요청**을 푼다. VM·컨테이너(앞 개념)와 견주어 「이벤트가 없을 때 리소스를 갖춰 두지 않는다」를 세운다. 요금은 step 0이 정한 한정대로. **도식의 예를 본문에 쓴다** — 회사 D의 함수가 REST 요청이 올 때와 정해 둔 시각에 실행되고, 이벤트가 없는 동안에는 실행되지 않는다 |
| 9 | `azure-compute.app-service` | Azure App Service | — | **HTTP**·**API**·**지속적 배포**를 한 줄씩 푼다. 앱 종류 넷은 한 문단에 한 줄씩(목록 개념이 아니다 — 굵은 글씨를 쓰지 않는다). 마지막 문단에서 앱을 실행할 곳(VM·컨테이너·Functions·App Service)을 견주고 표로 넘긴다 — 「아래 표」 같은 진행 안내는 쓰지 않는다 |

### 2. 문항 — `az065`~`az067`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az065` | `functions` | 예/아니요 「흔한 오해」 — Functions의 함수는 기본으로 앞서 처리한 이벤트의 내용을 기억해 다음 실행에 이어 쓰는가(아니요 — 기본은 상태 비저장, 이어 가려면 Durable Functions). 해설은 상태 비저장과 Durable Functions를 가르친다. `az008`과 다른 것을 묻는다. 균형을 보고 주장의 방향을 바꿔도 된다 |
| `az066` | `app-service` | 4지선다 「상황 적용」 — App Service 안의 기능을 고른다. 예: 회사 E는 App Service에서 웹 앱을 운영하며, 정해 둔 시각마다 정리 작업을 하는 프로그램을 같은 환경에서 실행하려 한다(WebJobs). 오답은 같은 범주(App Service가 호스트하는 앱 종류 — 웹 앱·API 앱·모바일 앱)에서. Functions처럼 다른 서비스는 보기에 넣지 않는다(같은 범주가 아니고 둘 다 맞게 읽힌다) |
| `az067` | `app-service` | 4지선다 「개념 비교」 — 앱을 실행할 곳을 고른다(표의 내용). 예: 회사 F는 늘 웹 요청을 받는 웹 사이트를 운영하려 하는데, 서버와 운영 체제는 관리하고 싶지 않고 Git 저장소에서 자동으로 배포하고 싶다(App Service). 오답은 VM·Container Instances·Functions — **Functions와 갈리게** 「늘 요청을 받는 웹 사이트 전체」 같은 조건을 준다. `az036`·`az037`(PaaS)와 같은 것을 묻지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 3 summary의 균형 줄이다.

### 3. 도식 — `src/data/azure/visuals/azure-compute.json`의 `diagrams`에 한 키를 더한다(앞 키는 바꾸지 않는다)

#### `azure-compute.functions` — `FunctionTriggerDiagram`, JSON 키 `function-trigger`

- 물음형 제목 예: `이벤트가 없을 때, 함수는 무엇을 하고 있을까?`
- 그릴 것: 노드 `request`(「REST 요청」)·`timer`(「타이머」)·`message`(「다른 서비스의 메시지」 — 본문이 정한 말)를 한쪽에, 노드 `function`(「함수」)을 다른 쪽에. 그룹 박스는 쓰지 않아도 된다.
  경로 `from-request`·`from-timer`·`from-message` — 각 트리거에서 `function`으로, 시나리오에서만 보인다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `idle` | 이벤트가 없을 때 | `function` | 없음 | `function` 옆 「실행되지 않음」 | 이벤트가 없으면 함수는 실행되지 않고, 함수를 실행할 리소스를 갖춰 둘 필요도 없다(요금은 step 0의 한정대로) |
  | `request` | REST 요청이 올 때 | `request`·`function` | `from-request` | `function` 옆 「요청을 처리하는 동안 실행」 | 요청이 함수를 깨우고, 함수는 일을 마치면 리소스를 놓는다 |
  | `timer` | 정해 둔 시각 | `timer`·`function` | `from-timer` | `function` 옆 「정해 둔 시각에 실행」 | 타이머로 정해 둔 시각마다 함수가 실행된다 |

  `message` 노드는 `전체`에서만 선명하다 — 트리거가 셋이라는 것을 보이고, 시나리오를 셋 넘게 늘리지 않는다(넷째 시나리오로 더해도 된다 — 더하면 summary에).
- 요점 테스트:
  - 경로 셋의 끝점이 모두 `function`의 변 위다.
  - `idle`에서 보이는 경로가 없고, `request`·`timer`에서 보이는 경로가 정확히 하나씩이며 서로 다르다.
  - `idle`에서 `request`·`timer`·`message`가 모두 opacity `0.25`다.
- 캡션·곁말의 사실은 개념 8 본문에 있어야 한다(ADR-036·038).

### 4. 표 — `HostingOptionsTable`

- 파일: `src/components/diagrams/azureComputeTables.tsx`에 `HostingOptionsTable` 함수, 테스트 `azureComputeTables.test.tsx`(guide.md 「도식」의 표 항목).
  JSON: `src/data/azure/visuals/azure-compute.json`의 `tables["hosting-options"]`.
- 열 셋: 첫 열 실행할 곳(행 머리), 「고객이 관리하는 것」, 「알맞은 일」 — 열 이름은 본문의 말로 바꿔도 된다. 행 넷: VM·컨테이너·Azure Functions·Azure App Service(이 순서, 행 머리는 개념 `name`과 같게 — 「컨테이너」 행은 개념 6·7의 말로).
- 칸 문구는 개념 1·6·7·8·9 본문에 있는 사실만(ADR-036). 「고객이 관리하는 것」은 운영 체제를 맡는가를 기준으로, 「알맞은 일」은 본문이 드는 쓰임으로.
- `columnWidths`: 열 수만큼의 백분율, 합 100%. 표 폭 약 273px(스크롤 막대가 낀 320px)에서 칸마다 가장 긴 덩어리(띄어쓰기 없이 이어진 글자)가 한 줄에 들게 어림하고, 그 계산을 summary에 적는다(phase 101 `ServiceTypesTable`의 summary가 본보기).
  행 머리 「Azure App Service」·「Azure Functions」는 영문이라 띄어쓰기에서 줄이 바뀐다 — 가장 긴 덩어리는 「Functions」다.
- `sources`: 이 표의 근거 개념 id들.
- registry: `'azure-compute.app-service': HostingOptionsTable` 한 줄(`azure-compute.functions` 키 뒤). 이 개념에는 도식이 없으므로 배열이 아니다.

### 5. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `FunctionTriggerDiagram`·`HostingOptionsTable`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다. **주제 `azure-compute`의 개념이 모두 생겼으므로**, `official.md`와 `corrections.md`에서
step 0이 더한 `(phase 103)` 항목 가운데 `azure-compute`를 가리키는 「쓰일 곳」이 남아 있지 않은지 `grep`으로 본다 — 남은 줄은 그 개념 id가 실제로 있으면 고치고, 없는 id를 가리키면 고치지 말고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~9·11~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 `azure-compute`의 개념은 9개, 문항은 67개, 마지막 id는 `az067`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. step 1~3이 쓴 개념 1~7·`az056`~`az064`·도식 문구 넷이 그대로인지 기계로 본다.
3. 주제 `azure-compute`의 개념 1~9를 처음부터 통독한다 — 풀이 없이 처음 나오는 낱말, 진행 안내, 앞 주제와 같은 말의 되풀이가 없는가. 표의 칸이 본문과 어긋나지 않는가.
4. `phases/103-azure-compute-networking/index.json`의 step 4를 갱신한다(성공 → guide.md 「summary에 적을 것」, 3회 실패 → `error`, `check-verbatim` 「건너뜀」 → `blocked`).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`azure-cloud-computing.serverless`·`azure-service-types.paas`의 글을 고치지 마라.** 이유: 앞 phase의 글이다. 겹침은 이 주제 쪽 글을 줄여서 푼다.
- **Functions의 호스팅 플랜 이름과 세부(소비·프리미엄·Flex 같은 것)를 늘어놓지 마라.** 이유: AZ-900 범위를 넘는다. 요금을 한정할 때 필요한 만큼만 쓴다.
- **App Service의 언어·프레임워크 목록, 모바일 앱의 세부 기능(푸시 알림·소셜 로그인 등)을 늘어놓지 마라.** 이유: guide.md 「배경」.
- **주제 `azure-virtual-networking`을 만들지 마라.** 이유: step 6의 범위다.
