# Step 6: budgets-alerts

## 배경

phase 106의 전체 계획·결정·공통 규칙은 `phases/106-azure-cost/guide.md`에 있다. **이 step은 주제 `azure-cost-management`에 개념 10(예산)·11(비용 경고)의 글·문항과 도식 `BudgetAlertDiagram`을 더한다.**

중심 문제: **예산은 알려 줄 뿐 멈추지 않는다.** 낱말 「예산」과 「한도」가 비슷해 학습자가 넘으면 멈춘다고 읽는다. 첫 두 문단 안에 분명히 쓴다.

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
- `src/data/azure/visuals/azure-cost-management.json`, 앞 step의 도식

## 작업

### 1. 개념 — `topics.json`의 `azure-cost-management` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 10 | `azure-cost-management.budgets` | — | 회사 B가 개발 구독에 한 달 예산을 정하는 예(금액 없이 「정해 둔 금액」). 범위와 기간, 실제 비용과 예측 비용(step 4 결과). 닿았을 때 무엇이 일어나고 무엇이 일어나지 않는가. 자동화를 더하면 무엇이 달라지는가 — step 4가 확인한 범위로. **도식의 예를 본문에 쓴다** |
| 11 | `azure-cost-management.cost-alerts` | `budgets` | **목록 개념**. 소개 문단은 경고가 한곳에 모인다는 것. 항목은 같은 꼴 — 언제 생기고 누구에게 가는가. 기업 계약에 딸린 것은 그렇다고 밝힌다. 예산 경고는 앞 개념과 겹치지 않게 한 줄로 |

### 2. 문항 — `az145`~`az147`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az145` | `budgets` | 예/아니요, 정답 **아니요** 「흔한 오해」 — 자동화를 설정하지 않은 구독의 지출이 정해 둔 예산에 닿으면 그 구독의 VM이 멈추는가. 해설은 경고와 자동화를 가르친다. 지출 한도와의 혼동도 짚는다 |
| `az146` | `budgets` | 예/아니요, 정답 **예** 「개념 확인」 — 지출이 기준에 닿으면 담당자에게 이메일을 보내도록 예산에 설정할 수 있는가, 또는 step 4가 확인한 예측 비용 기준. 덤프의 밑줄 고치기 꼴을 쓰지 않는다 |
| `az147` | `cost-alerts` | 4지선다, 정답 위치 1 「개념 비교」 — step 4의 확정 목록 가운데 상황으로 갈리는 것(예: 평소와 다르게 지출이 튄 것을 알고 싶다 → 이상 징후 경고. 확정 목록에 없으면 다른 항목으로 바꾼다). 오답은 나머지 경고 종류. 해설에 각 경고가 언제 생기는지 |

### 3. 도식 — `BudgetAlertDiagram`, JSON 키 `budget-alert`, 개념 `azure-cost-management.budgets`

- 물음형 제목 예: `예산을 넘으면 리소스가 멈출까?`
- 그릴 것: `spending`(「쓴 비용」)→`budget`(「예산」)→`alert`(「비용 경고」)→`email`(「이메일」). `budget`→`automation`(「자동화」)→`resource`(「리소스」). `running`(「VM 1」)는 곁말로 보여도 된다. 경로 `to-budget`·`to-alert`·`to-email`·`to-automation`·`to-resource`.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `alert` | 경고까지 | `spending`·`budget`·`alert`·`email` | 앞 셋 | 「리소스는 그대로 실행된다」 | 기준에 닿으면 경고가 생기고 이메일이 가지만 리소스는 멈추지 않는다 |
  | `automation` | 자동화를 더했을 때 | `spending`·`budget`·`automation`·`resource` | `to-budget`·`to-automation`·`to-resource` | 「설정해 둔 동작만 실행된다」 | 따로 설정해 둔 자동화가 리소스를 멈출 수 있다 |

- 요점 테스트: `alert`에서 `automation`·`resource`가 opacity `0.25`이고 `to-resource` 경로가 보이지 않는다. `alert`나 `email`에서 `resource`로 가는 경로가 없다(두 배치).

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 한 줄(개념 순서대로).

### 4. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 147개, 마지막 id는 `az147`, 예 37·아니요 37이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
3. `phases/106-azure-cost/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **「예산을 넘지 못하게 막는다」, 「지출을 제한한다」처럼 쓰지 마라.** 이유: 이 개념이 바로잡는 오해다. 문서가 「spending limit」이라고 부르는 말을 그대로 옮기면 지출 한도와 섞인다.
- **경고 임계값의 %를 쓰지 마라.** 이유: guide 「배경」.
