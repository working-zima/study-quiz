# Step 1: purview-labels

## 배경

phase 107의 전체 계획·결정·공통 규칙은 `phases/107-azure-governance-tools/guide.md`에 있다.
**이 step은 주제 `azure-governance`(거버넌스와 규정 준수)를 만들고 개념 1(Microsoft Purview)·2(민감도 레이블)의 글·문항과 도식 `PurviewDataMapDiagram`·`SensitivityLabelDiagram`을 더한다.**
사실은 step 0이 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

중심 문제: 이 주제의 다른 개념은 모두 **리소스**(VM·저장소처럼 Azure에서 만든 것)를 다스리는데, Purview는 **데이터**를 다스린다. 학습자가 「거버넌스 = Azure Policy」로만 기억하지 않게 둘을 가른다. 그리고 덤프가 옛 이름(Azure Information Protection)으로 묻는 문서 보호를 현행 이름으로 가르친다.

## 읽어야 할 파일

- **`phases/107-azure-governance-tools/guide.md` 전체**
- `phases/107-azure-governance-tools/index.json`의 앞 step `summary` — 특히 출처 step이 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/TagInheritanceDiagram.tsx`와 `.test.tsx`, `src/data/azure/visuals/azure-cost-management.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/106-azure-cost/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/data/azure/topics.json`의 `azure-cloud-benefits.security-governance`(거버넌스·규정 준수를 이미 한 줄씩 푼 곳 — 겹치지 않게, 이 주제에서는 다시 푼다)

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-cost-management` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-governance", "title": "거버넌스와 규정 준수", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`. 개념은 guide.md 표의 1·2다. `name`은 step 0 summary가 확정한 표기를 쓴다.

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 1 | `azure-governance.purview` | — | **목록 개념**(ADR-046). 소개 문단 첫 문장은 회사의 데이터가 왜 한눈에 안 보이는지(여러 곳에 흩어져 있다)부터. **거버넌스**·**규정 준수**를 이 문단에서 짧게 푼다. 항목 둘은 같은 꼴(무엇을 돕는가). 항목 뒤 문단에 데이터를 찾고·분류하고·계보를 보는 일을 예로 쓴다(**도식의 예를 본문에 쓴다**: 데이터가 있는 곳 셋, 회사 A). 마지막에 Azure Policy와의 차이 한 줄(데이터 / 리소스의 설정) — Azure Policy는 「리소스가 지킬 규칙을 정하는 서비스」로 그 자리에서 푼다 |
| 2 | `azure-governance.sensitivity-labels` | `purview` | 레이블이 무엇인지부터 — 문서·메일에 붙이는 이름표이고, 그 이름표에 따라 보호가 붙는다. 암호화와 표시(워터마크 등)를 각각 무엇이 되는지로. 자동으로 붙는 경우는 step 0 결과의 범위로. 예전 이름 「Azure Information Protection(AIP)」은 한 번만, 지금 이름과 함께. **도식의 예(레이블 이름, 문서, 회사 밖으로 보내기)를 본문에 쓴다** |

### 2. 문항 — `src/data/azure/questions.json`에 `az153`~`az154`

| id | 개념 | 형식과 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az153` | `purview` | 4지선다, 정답 위치 1 「상황 적용」 — 회사의 데이터가 온-프레미스·다른 클라우드·SaaS에 흩어져 있고, 어디에 어떤 데이터가 있으며 민감한 데이터가 어디 있는지를 한곳에서 보려 한다. 정답 Microsoft Purview. 오답은 이 주제의 다른 거버넌스 도구(Azure Policy, 리소스 잠금 등)와 실제로 헷갈리는 것 — 「리소스」가 아니라 「데이터」를 본다는 조건으로 갈린다. 정답 이름의 일부(「Purview」)를 문제문에 쓰지 않는다 |
| `az154` | `sensitivity-labels` | 예/아니요, 정답 **예** 「원인과 결과」 — step 0이 근거를 확인한 범위에서: 암호화를 설정한 레이블이 붙은 문서를 회사 밖으로 보냈을 때도 보호가 유지되는가. 근거가 다르면 맞는 주장으로 고친다(답은 예로 둔다). 「…뒤에도」처럼 답의 방향을 흘리는 말을 쓰지 않는다. 덤프의 워터마크 상황(NO.111·427)을 그대로 쓰지 않는다 |

### 3. 도식

이 step이 `src/data/azure/visuals/azure-governance.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-governance': azureGovernanceVisuals`로 넣는다.

#### `azure-governance.purview` — `PurviewDataMapDiagram`, JSON 키 `purview-data-map`

- 물음형 제목 예: `여러 곳에 흩어진 데이터를 어떻게 한곳에서 볼까?`
- 그릴 것: 데이터가 있는 곳 셋 `on-prem`(「온-프레미스」)·`other-cloud`(「다른 클라우드」)·`saas`(「SaaS」)와 `purview`(「Microsoft Purview」). 경로 `on-prem-to-purview`·`cloud-to-purview`·`saas-to-purview`(각 곳 → `purview`), `lineage`(`on-prem`→`other-cloud` — 데이터가 옮겨 간 길, step 0 결과에 맞으면).
- 시나리오(곁말의 말은 step 0이 정한 범위로 고친다):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `discover` | 데이터 찾기 | 넷 모두 | 앞 셋 | 「자동으로 찾는다」 | 세 곳의 데이터를 자동으로 찾아 한곳에 모은다 |
  | `classify` | 분류 | `on-prem`·`purview` | `on-prem-to-purview` | 「민감한 데이터를 표시한다」 | 찾은 데이터 가운데 민감한 것을 분류해 어디 있는지 보인다 |
  | `lineage` | 계보 | `on-prem`·`other-cloud`·`purview` | `lineage` | 「어디서 와서 어디로 갔는지」 | 데이터가 옮겨 간 길을 계보로 본다 |

- 요점 테스트: `discover`에서 경로 셋의 끝이 모두 `purview`다. `lineage`에서만 `lineage` 경로가 보이고 그 시작이 `on-prem`이다. 어느 시나리오에도 VM·리소스 그룹 같은 리소스 노드가 없다 — 이 그림은 데이터만 다룬다.

#### `azure-governance.sensitivity-labels` — `SensitivityLabelDiagram`, JSON 키 `sensitivity-label`

- 물음형 제목 예: `문서에 레이블을 붙이면 무엇이 따라갈까?`
- 그릴 것: `label`(레이블 이름 — step 0이 확정한 기본 레이블의 한국어 이름이나 「레이블 1」), `doc`(「문서」), `mark`(「워터마크」), `encrypt`(「암호화」), `outside`(「회사 밖의 받는 사람」). 경로 `apply`(`label`→`doc`), `send`(`doc`→`outside`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `mark` | 표시 | `label`·`doc`·`mark` | `apply` | 「문서에 표시가 붙는다」 | 레이블에 따라 워터마크 같은 표시가 문서에 붙는다 |
  | `encrypt` | 암호화 | `label`·`doc`·`encrypt` | `apply` | 「허락된 사람만 연다」 | 레이블에 따라 문서가 암호화된다 |
  | `send` | 밖으로 보낼 때 | `doc`·`encrypt`·`outside` | `send` | step 0 결과 | 문서가 회사 밖으로 나가도 보호가 따라가는가 — step 0 결과대로 |

- 요점 테스트: `mark`와 `encrypt`의 선명한 노드 집합이 다르다(`mark`/`encrypt` 하나씩). `send`에서 `label`이 opacity `0.25`이고 `send` 경로의 끝이 `outside`다. 노드 라벨에 「Azure Information Protection」이 없다(예전 이름은 본문에만).

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(`azure-cost-management.spending-limit` 키 뒤, 개념 순서대로).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~7·9·10)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 154개, 마지막 id는 `az154`, 예 39·아니요 38, 정답 위치 19/20/19/19이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 열일곱째 주제이고 `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/107-azure-governance-tools/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~7을 만들지 마라.** 이유: step 2·3의 범위다. 이 step의 글이 Azure Policy를 쓸 때는 한 줄 풀이로 그친다.
- **Purview의 제품 세부(데이터 맵·카탈로그 화면, 스캔 설정, 라이선스)와 Microsoft 365 앱 이름을 늘어놓지 마라.** 이유: 학습 가이드의 줄은 「목적」이다(guide 「배경」).
- **실제 개인정보나 문서 내용을 예로 들지 마라.** 이유: 「신용카드 번호가 든 문서」처럼 종류만 쓴다(guide 「예시 값」).
