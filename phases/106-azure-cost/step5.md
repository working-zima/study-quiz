# Step 5: cost-management-analysis

## 배경

phase 106의 전체 계획·결정·공통 규칙은 `phases/106-azure-cost/guide.md`에 있다.
**이 step은 주제 `azure-cost-management`(비용 관리와 태그)를 만들고 개념 8(Microsoft Cost Management)·9(비용 분석)의 글·문항과, 이 주제의 첫 도식 `CostAnalysisDiagram`을 더한다.**
사실은 step 4가 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

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
- `src/data/azure/topics.json`의 `azure-cost-factors.pricing-calculator` — 겹치지 않게, 그리고 이 주제 화면만 읽고 뜻이 서게

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-cost-factors` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-cost-management", "title": "비용 관리와 태그", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`. 개념은 guide.md 표의 8·9다.

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 8 | `azure-cost-management.cost-management` | — | **목록 개념**(ADR-046). 첫 문단은 실수로 만든 리소스를 청구서를 받고서야 아는 상황부터. 항목 셋은 같은 꼴. 항목 뒤에 누가 쓰고 어디서 여는지(step 4 결과). 범위(구독·리소스 그룹·관리 그룹)를 낱말마다 푼다 |
| 9 | `azure-cost-management.cost-analysis` | `cost-management` | 회사 A가 지난달 비용이 는 까닭을 찾는 예로 나눠 보는 기준을 차례로. **도식의 예를 본문에 쓴다.** 가격 계산기를 한 줄로 풀고 무엇이 다른지(4절). 금액 없음 |

### 2. 문항 — `az143`~`az144`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az143` | `cost-management` | 예/아니요, 정답 **예** 「개념 확인」 — 리소스 그룹 하나의 비용만 따로 볼 수 있는가, 또는 step 4가 확인한 범위의 주장. NO.359의 오해를 바로잡고 싶으면 답이 예가 되도록 주장을 세운다(「종량제 구독을 쓰는 회사도 Cost Management를 쓸 수 있나요?」). 고른 까닭을 summary에 |
| `az144` | `cost-analysis` | 4지선다, 정답 위치 3 「상황 적용」 — 이미 쓴 비용을 서비스별로 나눠 어디서 늘었는지 찾으려 한다. 정답 비용 분석. 오답 가격 계산기, 예산, 태그 — 각각 왜 아닌지 해설에. 정답의 낱말(「분석」)을 문제문에 쓰지 않는다 |

### 3. 도식

이 step이 `src/data/azure/visuals/azure-cost-management.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-cost-management': azureCostManagementVisuals`로 넣는다.

#### `azure-cost-management.cost-analysis` — `CostAnalysisDiagram`, JSON 키 `cost-analysis`

- 물음형 제목 예: `같은 비용을 어떤 기준으로 나눠 볼까?`
- 그릴 것: `total`(「지난달 비용」)에서 `by-group`(「리소스 그룹별」)·`by-service`(「서비스별」)·`by-region`(「지역별」)로. 경로 `to-group`·`to-service`·`to-region`. 기준 노드 아래에 예시 노드를 둘씩 두어도 되지만 본문에 쓴 예만 쓴다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `group` | 리소스 그룹별 | `total`·`by-group` | `to-group` | 본문의 예 | 어느 묶음에서 비용이 늘었는지 본다 |
  | `service` | 서비스별 | `total`·`by-service` | `to-service` | 본문의 예 | 어느 종류의 서비스에 돈이 들었는지 본다 |
  | `region` | 지역별 | `total`·`by-region` | `to-region` | 본문의 예 | 어느 지역에 돈이 들었는지 본다 |

- 요점 테스트: 경로 셋의 시작이 모두 `total`이다. 시나리오마다 기준 노드 하나만 선명하고 나머지 둘은 opacity `0.25`다. 금액 글자(숫자와 원·달러·`$`)가 JSON의 이 도식 문구에 없다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 한 줄(`azure-cost-factors.pricing-calculator` 키 뒤).

### 4. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 144개, 마지막 id는 `az144`, 예 36·아니요 36이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 열여섯째 주제이고 `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/106-azure-cost/index.json`의 step 5을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 10~15를 만들지 마라.** 이유: step 6~8의 범위다. 이 step의 글이 예산·태그를 쓸 때는 한 줄 풀이로 그친다.
- **Azure Advisor의 권장 사항을 항목으로 세우지 마라.** 이유: `azure-monitoring`의 몫이다.
