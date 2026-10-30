# Step 7: shared-responsibility-iaas

## 배경

phase 101은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/101-azure-benefits-sla-service-types/guide.md`에 있다.
**이 step은 주제 `azure-service-types`(서비스 유형과 공동 책임)를 만들고 그 첫 개념 둘(14 공동 책임 모델, 15 IaaS)의 글·문항과, 이 주제의 첫 도식 `SharedResponsibilityDiagram`을 함께 만든다.**

공동 책임 모델을 먼저 둔다(guide.md 표 머리말) — 「클라우드에서는 누가 무엇을 맡는가」를 먼저 세우고 세 유형을 그 위의 자리로 읽게 하려는 것이다.
그래서 개념 14의 본문은 IaaS·PaaS·SaaS를 한 줄씩 풀어 「어느 유형에서 무엇이 누구에게 가는지」를 스스로 말해야 한다 — 도식이 그것을 그리고, 도식의 사실은 이 본문에 있어야 한다(ADR-036).

## 읽어야 할 파일

- **`phases/101-azure-benefits-sla-service-types/guide.md` 전체**
- `phases/101-azure-benefits-sla-service-types/index.json`의 step 6 `summary` — **공유/공동 책임의 결정과 주제 제목**, 개념마다 확정한 `name`, 「도식의 행 배정」 표, Azure 서비스마다 유형의 공식 근거, 무엇을 쓰지 않는지.
  step 2 `summary`(「보안과 거버넌스」가 세 유형을 한 줄씩 푼 말 — 다른 주제지만 표기를 맞춘다)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」)
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`, `docs/source/azure/topic-map.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/CapacityPlanningDiagram.tsx`와 `.test.tsx`(phase 100, 그룹 박스로 줄을 묶은 표 모양 그림), `src/components/diagrams/MacTableDiagram.tsx`(네트워크),
  `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 주제와 개념 — `src/data/azure/topics.json`

`azure-sla-lifecycle` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-service-types", "title": "<step 6의 결정>", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
제목은 step 6이 「공유 책임 모델」로 정했으면 `서비스 유형과 공유 책임`, 「공동 책임 모델」로 정했으면 `서비스 유형과 공동 책임`이다.
**제목을 바꿨으면 `docs/source/azure/topic-map.md`의 「주제 지도」 표에서 `azure-service-types` 줄의 「제목」 칸 하나를 같은 제목으로 고친다** — 그 밖의 칸·줄은 고치지 않는다(guide.md 「배경」).

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 14 | `azure-service-types.shared-responsibility-model` | 공동 책임 모델 | — | `name`은 step 6의 결정. 이 주제의 첫 개념이라 **클라우드 공급자**·**고객**·**온-프레미스**·**운영 체제**·**ID**(사람·서비스·장치를 가리키는 계정 같은 것 — 공식 문서의 말로)를 짧게 푼다. 온-프레미스에서는 모두 조직의 책임, 클라우드에서는 나뉜다. 늘 고객 / 늘 공급자 / 서비스 유형에 따라 — 세 묶음과 각 묶음의 책임. **IaaS·PaaS·SaaS를 한 줄씩 풀고**, 서비스 유형에 따라 갈리는 책임이 각 유형에서 누구에게 가는지를 step 6의 「도식의 행 배정」에서 `고객`·`공급자`·`함께`로 확인된 칸만 쓴다. 뒤 개념이 세 유형을 자세히 다룬다는 말은 쓰지 않는다. 덤프가 거듭 묻는 「SaaS에서도 데이터는 고객 몫」·「IaaS로 옮기면 물리 쪽 책임이 줄어든다」가 본문에서 드러나게(step 6 결과대로) |
| 15 | `azure-service-types.iaas` | IaaS(서비스로서의 인프라) | — | `name`은 step 6의 결정. 공동 책임 모델에서 IaaS가 어디에 서는지 되짚는 한 줄로 시작해, 공급자가 맡는 것(하드웨어·인터넷 연결·물리 보안)과 고객이 맡는 것(운영 체제의 설치·구성·유지 관리, 네트워크 구성, 데이터베이스와 스토리지 구성)을 쓴다. 클라우드 데이터 센터의 하드웨어를 빌리고 그 위의 일은 고객이 정한다는 것. 맞는 경우 둘 — 리프트 앤 시프트 마이그레이션(한 줄로 푼다), 개발·테스트 환경(빨리 만들고 없애면서 통제를 유지). Azure에서의 예는 step 6이 공식 근거를 찾은 서비스만(VM 등) |

### 2. 문항 — `src/data/azure/questions.json`에 `az032`~`az035`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az032` | `shared-responsibility-model` | 예/아니요 「흔한 오해」 — SaaS를 쓰면 클라우드에 둔 데이터에 대한 책임도 공급자에게 넘어가는가(아니요 — 데이터는 늘 고객), 같은 꼴 |
| `az033` | `shared-responsibility-model` | 4지선다 「개념 확인」 — 어느 서비스 유형을 쓰든 늘 공급자가 맡는 책임을 고른다. 보기 넷은 세 묶음(늘 고객·서비스 유형에 따라·늘 공급자)에서 고르고 정답은 하나만 「늘 공급자」. `az032`와 다른 것을 묻는다 |
| `az034` | `iaas` | 4지선다 「상황 적용」 — 회사가 IaaS로 VM을 빌려 쓸 때 회사가 맡는 일을 고른다(정답: 운영 체제의 패치·구성 같은 것, 오답: 공급자가 맡는 물리 쪽 일). **보기는 책임(일) 넷**으로 — IaaS·PaaS·SaaS 이름 넷을 보기로 두지 않는다(guide.md 「문항」 4항) |
| `az035` | `iaas` | 예/아니요 「상황 적용」 — 온-프레미스에서 쓰던 앱을 거의 바꾸지 않고 클라우드로 옮기려는 회사에 IaaS가 맞는가(리프트 앤 시프트), 같은 꼴. `az034`와 다른 것을 묻는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 5 summary의 균형 줄이다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-service-types.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-service-types': azureServiceTypesVisuals`로 넣는다.

#### `azure-service-types.shared-responsibility-model` — `SharedResponsibilityDiagram`, JSON 키 `shared-responsibility`

- 물음형 제목 예: `온-프레미스에서 SaaS로 갈수록, 고객이 맡는 책임은 어떻게 줄어들까?`
- 그릴 것 — 표 모양 그림(선례 `CapacityPlanningDiagram`·`MacTableDiagram`): 책임마다 노드 하나(높이 32, 회색)를 위에서 아래로. 노드는 세 그룹 박스로 묶는다 —
  「늘 고객」(정보와 데이터·장치·계정과 ID 등), 「서비스 유형에 따라」(운영 체제·네트워크 제어·애플리케이션·ID와 액세스 등), 「늘 공급자」(물리 호스트·물리 네트워크·물리 데이터 센터).
  그룹 라벨은 클라우드에서의 뜻이 드러나게(온-프레미스에서는 「늘 공급자」 묶음도 고객의 몫이다 — 라벨이 그와 어긋나지 않게, 예: 「클라우드에서는 늘 공급자」). 행의 이름·수·묶음은 step 6이 확인한 것.
  **step 6의 「도식의 행 배정」에서 `확인 못 함` 칸이 있는 행은 그리지 않고** 본문에도 그 배정을 쓰지 않는다 — 빠진 행을 summary에 적는다. 경로는 없다.
  곁말(9): 시나리오에서 `함께`인 행의 노드 오른쪽(세로형 280 폭에 들지 않으면 노드 안쪽 끝에 들어가게 노드 폭을 줄이고 그 옆)에 `함께`. 세로형은 노드 폭과 곁말 자리를 반각 문자 1.15배 규칙으로 어림한다. 가로형(폭 440)은 같은 짜임을 넓게.
- 시나리오(label은 step 6이 정한 표기):

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `on-premises` | 온-프레미스 | 모든 행 | 없음 | 자기 데이터 센터에서는 물리 시설부터 데이터까지 모든 책임이 조직에 있다 |
  | `iaas` | IaaS | 배정이 `고객`·`함께`인 행 | `함께`인 행마다 하나 | 물리 쪽은 공급자가 맡고, 운영 체제부터 위는 고객이 맡는다 |
  | `paas` | PaaS | 배정이 `고객`·`함께`인 행 | `함께`인 행마다 하나 | 운영 체제까지 공급자가 맡고, 고객은 앱·데이터·액세스에 집중하며 일부는 함께 맡는다 |
  | `saas` | SaaS | 배정이 `고객`·`함께`인 행 | `함께`인 행마다 하나 | 공급자가 앱까지 거의 다 맡고, 고객은 데이터·계정·장치를 맡는다 |

  선명하지 않은 행(공급자의 몫)은 opacity `0.25`. 캡션의 말은 본문의 말과 같게, 배정은 step 6의 표 그대로.
- 요점 테스트:
  - 선명한 노드 수가 `on-premises` > `iaas` ≥ `paas` ≥ `saas`다.
  - 「늘 고객」 그룹의 노드는 네 시나리오에서 모두 선명하고, 「늘 공급자」 그룹의 노드는 `on-premises`에서만 선명하다.
  - 시나리오마다 `함께` 곁말이 붙은 노드 집합이 step 6의 배정에서 `함께`인 행과 같다(테스트에 기대값을 글자 그대로 적는다).
  - 그룹 박스는 어느 시나리오에서도 흐려지지 않는다.
- 캡션·그룹 라벨·곁말·노드 라벨의 사실은 개념 14 본문에 있어야 한다(ADR-036). 행 이름은 본문의 말과 같게 쓴다.

위 도식 설계는 출발점이다. 본문(step 6 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-service-types.shared-responsibility-model': SharedResponsibilityDiagram` 한 줄(`azure-sla-lifecycle` 키들 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `SharedResponsibilityDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·4·5·7·8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 35개, 마지막 id는 `az035`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 다섯째 주제이고 `importance` 3·`sourcePages` [0, 0]인지, 제목이 step 6의 결정과 같은지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
   제목을 바꿨으면 `topic-map.md`의 그 칸이 같은지 `git diff docs/source/azure/topic-map.md`로 본다(한 줄만 바뀌어야 한다).
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 도식의 시나리오마다 선명한 행이 본문의 문장과 하나하나 맞는지 대조한다.
4. `phases/101-azure-benefits-sla-service-types/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」과 주제 제목·`topic-map.md`를 고쳤는지.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 16·17(PaaS, SaaS)을 따로 만들지 마라.** 이유: step 8의 범위다. 개념 14에서는 한 줄 풀이로 그친다.
- **step 6이 `확인 못 함`으로 남긴 배정을 그리거나 쓰지 마라.** 이유: 출처 없는 사실이다(ADR-036). Microsoft의 유명한 책임 표를 기억으로 채우지 마라.
- **`topic-map.md`에서 `azure-service-types` 줄의 제목 칸 밖을 고치지 마라.** 이유: 주제 지도는 사용자가 확인한 문서다. 제목은 개념 이름과 맞추려고 바꾸는 것이다(guide.md 「배경」).
- **주제 id `azure-service-types`를 바꾸지 마라.** 이유: `data.test.ts`와 뒤 phase가 이 id로 일한다.
