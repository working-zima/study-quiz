# Step 6: subscription

## 배경

phase 102는 Azure AZ-900 과목에 주제 둘을 더한다. 전체 계획·결정·공통 규칙은 `phases/102-azure-regions-resource-hierarchy/guide.md`에 있다.
**이 step은 주제 `azure-resource-hierarchy`에 개념 둘(9 구독, 10 구독 경계)의 글·문항과 도식 `SubscriptionBoundaryDiagram`을 더한다.**

구독에서 학습자가 가장 많이 헷갈리는 것은 **리소스 그룹과 구독이 각각 무엇을 나누는가**다 — 리소스 그룹은 함께 관리할 리소스를 묶고, 구독은 청구서와 액세스 규칙을 가른다.
덤프도 「부서별로 비용을 따로 받으려면」(구독)과 「여러 VM에 권한을 한꺼번에」(리소스 그룹)를 엇갈려 묻는다. 본문은 앞 개념 8(리소스 그룹)을 되짚어 이 차이를 세운다.

## 읽어야 할 파일

- **`phases/102-azure-regions-resource-hierarchy/guide.md` 전체**
- `phases/102-azure-regions-resource-hierarchy/index.json`의 step 4 `summary`(개념 9·10의 확정 `name`·항목 이름, 구독과 계정·테넌트의 관계를 쓸 말, 다른 구독으로 옮기기·구독 합치기·클래식 관리자 역할의 처리)와 step 5 `summary`(개념 7·8이 푼 낱말, 도식 설계, 균형 줄, 교차 검사 수)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`(`azure-resource-hierarchy`의 개념 7·8 — **먼저 통독한다**), `questions.json`, `visuals/azure-resource-hierarchy.json`, `data.test.ts`·`visuals.test.ts`
- 도식 선례 — step 5의 `ResourceGroupScopeDiagram`과 `.test.tsx`(같은 주제), step 1의 `AzureRegionDiagram`(그룹 안의 그룹),
  `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-resource-hierarchy` 끝에

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `azure-resource-hierarchy.subscription` | 구독 | — | 관리·청구·규모의 단위, Azure를 쓰려면 있어야 한다, Azure 계정에 이어지고 계정은 Microsoft Entra ID 안의 ID다(**Microsoft Entra ID**를 이 주제에서 한 줄로 푼다), 계정 하나에 구독 여럿. 구독이 리소스 그룹을 담는다(개념 8을 되짚는다). 테넌트와의 관계, 다른 구독으로 옮기기는 step 4가 쓸 수 있다고 한 만큼만 — **테넌트**를 쓰면 한 줄로 푼다. 클래식 관리자 역할(덤프의 「구독 관리자」)은 step 4가 「쓰지 않는다」로 정했으면 쓰지 않는다 |
| 10 | `azure-resource-hierarchy.subscription-boundaries` | 구독 경계 | `subscription` | **목록 개념**(ADR-046) — 소개 문단 하나 뒤에 `- **한국어 이름**(English name)은 …` 꼴 항목 둘(청구 경계·액세스 제어 경계 — 이름은 step 4 결과대로). 항목 뒤 문단: 구독을 더 만드는 까닭(환경·팀과 워크로드·청구), 리소스 그룹으로 나누는 것과 무엇이 다른지(청구서는 구독마다 나온다 — step 4 결과대로) 4절대로. **운영 환경**을 한 줄로 푼다. **도식의 예를 본문에 쓴다** — 회사 A의 Azure 계정 하나에 구독 「개발」과 구독 「운영」을 두면, 청구서가 구독마다 따로 나오고, 두 구독에 다른 지출 한도·액세스 규칙을 둘 수 있다. 각 구독 안에 리소스 그룹이 있다 |

### 2. 문항 — `src/data/azure/questions.json`에 `az051`~`az052`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az051` | `subscription` | 예/아니요 「개념 확인」 — 계정과 구독의 관계(계정 하나에 구독을 여럿 둘 수 있는가 — 예), 또는 step 4가 확인한 테넌트와의 관계. 균형을 보고 방향을 고른다. 클래식 관리자 역할을 묻지 않는다 |
| `az052` | `subscription-boundaries` | 4지선다 「상황 적용」 — 회사 B가 두 부서의 Azure 비용을 **서로 다른 청구서로** 받으려 한다, 무엇을 부서마다 따로 두나. 정답: 구독. 오답은 같은 범주(나누는 단위) 안에서 실제로 헷갈리는 것 — 리소스 그룹(청구서가 나뉘지 않는다), 관리 그룹(구독을 묶는 단위 — 이 주제에서 한 줄로 푼다), 지역. 「청구서」라는 조건이 정답 하나만 맞게 한다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 5 summary의 균형 줄이다.

### 3. 도식

#### `azure-resource-hierarchy.subscription-boundaries` — `SubscriptionBoundaryDiagram`, JSON 키 `subscription-boundaries`

- 물음형 제목 예: `구독을 둘로 나누면, 무엇이 따로 갈릴까?`
- 그릴 것: 그룹 박스 `account`(「Azure 계정」) 안에 그룹 박스 `sub-dev`(「구독: 개발」)·`sub-prod`(「구독: 운영」). 구독마다 노드 셋 — `rg-dev`·`rg-prod`(「리소스 그룹」), `bill-dev`·`bill-prod`(「청구서」), `access-dev`·`access-prod`(「액세스 규칙」 — 본문의 말과 같게).
  세로형은 두 구독을 위아래로 쌓아도 된다. 경로는 두지 않아도 된다(그러면 guide.md 「도식 테스트」의 경로 항목을 「경로가 없다」로).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `billing` | 청구 경계 | `bill-dev`·`bill-prod` | 구독마다 「따로 청구」 | 청구서는 구독마다 따로 나온다 — 비용을 나눠 받으려면 구독을 나눈다 |
  | `access` | 액세스 제어 경계 | `access-dev`·`access-prod` | 구독마다 「다른 규칙」 | 액세스 규칙과 지출 한도는 구독마다 따로 둘 수 있다 — 개발과 운영에 다른 규칙을 둔다 |

- 요점 테스트:
  - `billing`과 `access`의 선명한 노드 집합이 겹치지 않고, 각 집합의 두 노드가 서로 다른 구독 박스에 든다.
  - 두 시나리오 모두 `rg-dev`·`rg-prod`가 opacity `0.25`다(리소스 그룹은 이 경계와 상관없다는 것을 흐림으로 보인다).
  - 두 구독 박스가 모두 `account` 박스 안에 있고 서로 겹치지 않으며, 모든 노드가 구독 박스 꼭 하나에 든다(세로형·가로형 모두).
- 캡션·곁말의 사실은 개념 9·10 본문에 있어야 한다(ADR-036·038).

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-resource-hierarchy.subscription-boundaries': SubscriptionBoundaryDiagram` 한 줄(`azure-resource-hierarchy.resource-group` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `SubscriptionBoundaryDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·3·5·6·7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 52개, 마지막 id는 `az052`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `azure-resource-hierarchy`의 개념 7~10을 처음부터 통독한다 — 리소스 그룹과 구독이 무엇을 나누는지가 서는가, 앞 개념이 푼 낱말을 다시 풀지 않았는가.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 4 summary가 「쓰지 않는다」로 정한 것을 지켰는가.
4. `phases/102-azure-regions-resource-hierarchy/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 11·12(관리 그룹, 계층)를 만들지 마라.** 이유: step 7의 범위다. 이 step의 글이 관리 그룹을 말할 때는 한 줄 풀이로 그친다.
- **step 5가 쓴 개념 7·8과 `ResourceGroupScopeDiagram`을 고치지 마라.** 고칠 것을 찾으면 summary에 적는다.
- **청구·비용 관리 도구(Cost Management, 예산, 지출 한도의 설정법)를 자세히 쓰지 마라.** 이유: 주제 `azure-cost-management`의 몫이다. 지출 한도는 「구독마다 다르게 둘 수 있다」까지만 쓴다.
- **지원이 끝난 클래식 관리자 역할을 가르치지 마라**(step 4가 그렇게 정했으면). 이유: 지원이 끝난 것·옛 이름은 빼거나 현행으로 고친다(사용자 결정).
