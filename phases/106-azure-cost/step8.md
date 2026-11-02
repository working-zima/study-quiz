# Step 8: free-account-limit

## 배경

phase 106의 전체 계획·결정·공통 규칙은 `phases/106-azure-cost/guide.md`에 있다. **이 step은 주제 `azure-cost-management`에 개념 14(무료 계정)·15(지출 한도)의 글·문항과 도식 `FreeAccountOffersDiagram`·`SpendingLimitDiagram`, 표 `CostToolsTable`을 더한다.**

중심 문제: **무료 계정의 값은 자주 바뀐다.** step 4가 확인한 값과 그 표현만 쓴다. 그리고 예산과 지출 한도를 가른다 — 앞 step은 예산이 멈추지 않는다고 가르쳤고, 이 step은 실제로 멈추는 장치를 가르친다.

## 읽어야 할 파일

- **`phases/106-azure-cost/guide.md` 전체**
- `phases/106-azure-cost/index.json`의 앞 step `summary` — 특히 출처 step이 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/RbacScopeDiagram.tsx`와 `.test.tsx`, `src/data/azure/visuals/azure-security-model.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/105-azure-identity-security/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/components/diagrams/azureSecurityModelTables.tsx`와 `.test.tsx` — 표 선례
- `src/data/azure/visuals/azure-cost-management.json`, 앞 step의 도식
- `src/data/azure/topics.json`의 `azure-cost-management.budgets`·`cost-alerts`·`cost-analysis` — 표의 칸이 이 본문과 맞아야 한다

## 작업

### 1. 개념 — `topics.json`의 `azure-cost-management` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 14 | `azure-cost-management.free-account` | — | 세 가지를 같은 꼴로 — 무엇이고 언제 끝나는가. 금액·제품 개수 없음(「정해진 크레딧」). 일부 서비스·계층만 무료. 크레딧이 끝나면 어떻게 되는가와 업그레이드. **크레딧**을 한 줄로 푼다. 수치는 step 4의 표현과 확인한 날을 따른다. 도식의 예를 본문에 쓴다 |
| 15 | `azure-cost-management.spending-limit` | `free-account` | 무엇이 켜져 있고 무엇이 없는가(step 4 결과), 닿으면 VM은 어떻게 되고(할당 해제를 한 줄로 푼다) 저장소 데이터는 어떻게 되는가. 다시 쓰는 길. **예산과의 차이를 첫 두 문단 안에**(4절). 표에 쓰는 사실을 본문에 먼저 쓴다 |

### 2. 문항 — `az150`~`az152`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az150` | `free-account` | 4지선다, 정답 위치 3 「원리 이해」 — 무료 계정의 세 가지 가운데 시간이 지나도 끝나지 않는 쪽, 또는 30일이 지나 먼저 끝나는 쪽(step 4 결과로 답이 갈리는 것). 오답은 나머지 항목과 실제로 헷갈리는 것. 금액·개수를 묻지 않는다 |
| `az151` | `spending-limit` | 4지선다, 정답 위치 0 「개념 비교」 — 크레딧을 넘겨 요금이 나가는 일이 **실제로 일어나지 않게** 막는 쪽과, 알림만 주는 쪽을 가르는 상황. 정답 지출 한도. 오답 예산, 비용 경고, 비용 분석. 무료 계정을 쓰는 상황임을 조건으로 준다 |
| `az152` | `spending-limit` | 예/아니요, 정답 **예** 「원인과 결과」 — 무료 계정의 크레딧을 다 써 지출 한도에 닿으면 실행 중이던 VM이 중지되는가(step 4 결과의 범위로). 놀람을 담지 않는다 |

### 3. 도식

#### `azure-cost-management.free-account` — `FreeAccountOffersDiagram`, JSON 키 `free-account-offers`

- 물음형 제목 예: `무료 계정에서 무엇이 언제 끝날까?`
- 그릴 것: `credit`(「크레딧」)·`free-12`(「12개월 무료 서비스」)·`always-free`(「항상 무료 서비스」)와 `upgrade`(「업그레이드」). 경로 `credit-to-upgrade`(`credit`→`upgrade`) — step 4 결과에 맞으면. 항목 이름은 step 4가 확정한 표기를 쓴다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `start` | 가입했을 때 | 앞 셋 | 없음 | 없음 | 새 고객은 세 가지를 함께 받는다 |
  | `after-30` | 30일이 지나면 | `free-12`·`always-free`·`upgrade` | `credit-to-upgrade` | 「크레딧이 끝난다」 | step 4 결과 — 크레딧이 끝난 뒤 계속 쓰려면 |
  | `after-12` | 12개월이 지나면 | `always-free` | 없음 | 「항상 무료 서비스만 남는다」 | step 4 결과 |

  step 4 결과와 맞지 않으면(예: 30일 뒤 구독이 멈추면 12개월 무료를 이어 쓰는 조건이 업그레이드뿐이면) 그 사실대로 시나리오를 다시 쓴다 — **출처의 순서가 우선이다.**
- 요점 테스트: `start`에서 `upgrade`가 opacity `0.25`. `after-30`에서 `credit`이 opacity `0.25`. 금액 글자(숫자+원·달러·`$`)가 이 도식 문구에 없다. 「30일」·「12개월」은 본문에도 있다.

#### `azure-cost-management.spending-limit` — `SpendingLimitDiagram`, JSON 키 `spending-limit`

- 물음형 제목 예: `크레딧을 다 쓰면 무엇이 멈출까?`
- 그릴 것: `credit`(「크레딧」)→`limit`(「지출 한도」), `limit`→`vm`(「VM 1」), `limit`→`storage`(「스토리지 계정」). `upgrade`(「업그레이드」)→`vm`. 경로 `reach`·`stop-vm`·`read-only`·`resume`.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `reach` | 한도에 닿으면 | `credit`·`limit`·`vm`·`storage` | 앞 셋 | 「중지되고 할당 해제」, 「읽기 전용」(step 4 결과) | 배포한 서비스가 멈추고 저장한 데이터는 읽기만 된다 |
  | `upgrade` | 업그레이드하면 | `upgrade`·`vm` | `resume` | 「한도가 없어지고 다시 쓴다」 | 종량제로 바꾸면 한도가 없어지고 구독이 다시 켜진다 |

- 요점 테스트: `reach`에서 `upgrade`가 opacity `0.25`이고 `resume`이 보이지 않는다. `upgrade`에서 `limit`이 opacity `0.25`다. 예산 노드가 없다 — 이 그림은 지출 한도만 다룬다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로).

### 4. 표 — `CostToolsTable`

`src/components/diagrams/azureCostManagementTables.tsx`와 `.test.tsx`를 새로 만든다. `visuals/azure-cost-management.json`의 `tables["cost-tools"]`, 개념 `azure-cost-management.spending-limit`. 열은 **도구 · 하는 일 · 리소스에 미치는 영향**. 행은 비용 분석 / 예산 / 비용 경고 / 지출 한도 — 칸은 이 주제 본문과 같게 쓴다. 비용 분석·비용 경고는 「없다」, 예산은 「자동화를 설정해야 영향이 있다」, 지출 한도는 「실제로 멈춘다」 쪽으로 — 말은 본문을 따른다. `columnWidths`와 계산은 guide.md 「도식」대로 summary에 적는다. registry의 표 등록은 선례를 따른다.

### 5. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 152개, 마지막 id는 `az152`, 예 38·아니요 38이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `azure-cost-management`의 개념이 8개이고 순서가 guide.md 표와 같은지, 개념 9·11·13·15의 `parentId`가 표대로인지 본다. 끝에 예 38·아니요 38, 정답 위치 19/19/19/19인지 본다. 금액·할인율·제품 개수가 새 개념·문항·도식에 없는지 `grep`으로 본다(`$`, `달러`, `%`, 숫자 뒤의 `개 `).
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/106-azure-cost/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **무료 계정의 금액·제품 개수를 쓰지 마라.** 이유: guide 「배경」 — 문서마다 다르고 자주 바뀐다.
- **「한도」 낱말을 예산에 쓰지 마라.** 이유: 두 개념을 가르는 것이 이 step의 일이다.
