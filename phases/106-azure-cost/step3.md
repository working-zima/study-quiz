# Step 3: savings-calculator

## 배경

phase 106의 전체 계획·결정·공통 규칙은 `phases/106-azure-cost/guide.md`에 있다. **이 step은 주제 `azure-cost-factors`에 개념 5(저축 플랜)·6(하이브리드 혜택)·7(가격 계산기)의 글·문항과 도식 `HybridBenefitDiagram`·`PricingCalculatorDiagram`, 표 `CostSavingOptionsTable`을 더한다.**

중심 문제: 예약·저축 플랜·스폿·하이브리드 혜택은 모두 「싸게 쓰는 법」이라 뭉뚱그려지기 쉽다. **무엇을 내놓고 할인을 받는가**로 가른다. 지원이 끝난 TCO 계산기는 한 줄로만 쓴다(guide 「배경」).

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
- `src/data/azure/visuals/azure-cost-factors.json`, 앞 step의 도식
- `src/data/azure/topics.json`의 `azure-cloud-computing.reservations`·`spot-vm`, `azure-cloud-benefits.predictability`와 `az006`·`az007`·`az021` — 겹치지 않게

## 작업

### 1. 개념 — `topics.json`의 `azure-cost-factors` 끝에

| # | id | 이 step에서 특히 |
|---|---|---|
| 5 | `azure-cost-factors.savings-plan` | 첫 문단에서 약정이 무엇인지 풀고 예약을 한 줄로 다시 세운 뒤, 무엇이 다른지로 간다(4절). 시간당 금액을 약정한다는 것을 예로 — **금액을 지어내지 않고** 「정해 둔 금액」으로 쓴다. 문서가 말하지 않는 「어느 쪽이 더 싸다」를 지어내지 않는다(문서에 있으면 그 범위로). 도식 없음 |
| 6 | `azure-cost-factors.hybrid-benefit` | 회사 C가 Windows Server 라이선스를 이미 가졌고 Software Assurance가 있는 예. 무엇이 빠지고 무엇이 남는지(step 0 결과). 약정이 아니므로 예약·저축 플랜과 무엇이 다른가. **표에 쓰는 사실을 본문에 먼저 쓴다** — 스폿·예약·저축 플랜의 칸도 이 주제의 본문에 있어야 한다(`cost-factors`의 「사용량」 항목과 개념 5) |
| 7 | `azure-cost-factors.pricing-calculator` | 무엇을 넣는가(리소스·지역·계층·중복성 — **계층**·**중복성**을 한 줄로 푼다)와 나오는 것. 정보 제공용 추정값. 실제 비용을 보는 Cost Management와 무엇이 다른가(4절, 그 이름을 한 줄로 푼다). 마지막 문단에 TCO 계산기 한 줄 — 표기는 step 0 결과 |

### 2. 문항 — `az139`~`az142`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az139` | `savings-plan` | 예/아니요, 정답 **예** 「개념 비교」 — 회사가 컴퓨팅 사용량을 약정하되 어떤 VM 크기나 지역을 쓸지 자주 바뀐다. 저축 플랜의 할인이 그 바뀐 사용량에도 이어지는가(step 0이 확인한 조건의 범위로). `az006`과 겹치지 않는다 |
| `az140` | `hybrid-benefit` | 4지선다, 정답 위치 1 「상황 적용」 — Software Assurance가 있는 SQL Server 라이선스를 가진 회사가 라이선스 비용을 줄이려 한다. 정답 Azure 하이브리드 혜택. 오답 예약·저축 플랜·스폿 가상 머신 — **「라이선스」를 조건으로 주어** 답이 갈리게 하고, 문제문이 정답의 이름 일부(「하이브리드」)를 쓰지 않는다 |
| `az141` | `pricing-calculator` | 예/아니요, 정답 **아니요** 「흔한 오해」 — 가격 계산기에 VM을 넣어 견적을 내면 그 VM이 구독에 만들어지고 요금이 시작되는가 |
| `az142` | `pricing-calculator` | 4지선다, 정답 위치 2 「개념 비교」 — 새 서비스를 열기 **전에** 지역을 바꿔 가며 달 요금을 견줘 보려 한다. 정답 가격 계산기. 오답 비용 분석, 예산, 비용 경고. `az021`과 다른 것을 묻는다(그쪽은 예측 가능성). TCO 계산기를 보기에 넣지 않는다 |

### 3. 도식

#### `azure-cost-factors.hybrid-benefit` — `HybridBenefitDiagram`, JSON 키 `hybrid-benefit`

- 물음형 제목 예: `가진 라이선스를 Azure에서 쓰면 무엇이 줄어들까?`
- 그릴 것: 그룹 `on-premises`(「회사가 가진 것」) 안에 `license`(「Windows Server 라이선스」). 그룹 `vm-bill`(「VM 요금」) 안에 `compute`(「컴퓨팅」)·`os-license`(「Windows 라이선스」 — 본문의 말로). 경로 `use-license`(`license`→`os-license`).
- 시나리오(무엇이 빠지고 남는지는 step 0 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `without` | 혜택 없이 | `compute`·`os-license` | 없음 | 「둘 다 낸다」 | 라이선스 값이 VM 요금에 들어 있다 |
  | `with` | 혜택을 쓸 때 | `license`·`compute` | `use-license` | 「가진 라이선스로 대신한다」 | 라이선스 값이 빠지고 컴퓨팅 요금은 남는다 |

- 요점 테스트: `without`에서 경로가 없고 `license`가 opacity `0.25`. `with`에서 `os-license`가 opacity `0.25`이고 `compute`는 두 시나리오에서 모두 선명하다.

#### `azure-cost-factors.pricing-calculator` — `PricingCalculatorDiagram`, JSON 키 `pricing-calculator`

- 물음형 제목 예: `계산기에 넣으면 실제로 무엇이 생길까?`
- 그릴 것: `choices`(「지역·계층·중복성」)→`calculator`(「가격 계산기」)→`estimate`(「예상 비용」), `resource`(「실제 리소스」)→`cost-management`(「Cost Management」). 경로 `to-calculator`·`to-estimate`·`to-cost-management`. 두 줄은 이어지지 않는다 — 계산기에서 리소스로 가는 선을 그리지 않는다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `before` | 만들기 전 | `choices`·`calculator`·`estimate` | 앞 둘 | 「아무것도 만들어지지 않는다」 | 어림일 뿐이라 만들어지는 것도 요금도 없다 |
  | `after` | 만든 뒤 | `resource`·`cost-management` | `to-cost-management` | 「실제로 쓴 비용」 | 실제로 쓴 비용은 Cost Management에서 본다 |

- 요점 테스트: `calculator`나 `estimate`에서 `resource`로 가는 경로가 없다(두 배치). `before`에서 `resource`·`cost-management`가 opacity `0.25`, `after`에서 앞 셋이 opacity `0.25`.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로).

### 4. 표 — `CostSavingOptionsTable`

`src/components/diagrams/azureCostFactorsTables.tsx`와 `.test.tsx`를 새로 만든다. `visuals/azure-cost-factors.json`의 `tables["cost-saving-options"]`, 개념 `azure-cost-factors.hybrid-benefit`. 열은 **방식 · 내놓는 것 · 맞는 작업**. 행은 예약 / 저축 플랜 / 스폿 가상 머신 / 하이브리드 혜택 — 칸은 step 0과 이 주제의 본문이 확인한 대로 쓴다(스폿은 「회수될 수 있음을 받아들인다」 등). `columnWidths`와 계산은 guide.md 「도식」대로 summary에 적는다. registry의 표 등록은 선례를 따른다.

### 5. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 142개, 마지막 id는 `az142`, 예 35·아니요 36이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `azure-cost-factors`의 개념이 7개이고 순서가 guide.md 표와 같은지, 개념 2의 `parentId`가 `azure-cost-factors.cost-factors`인지 본다. `TCO`가 `pricing-calculator` 본문의 한 줄에만 있는지 `grep`으로 본다(문항·도식에 없어야 한다).
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/106-azure-cost/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **할인율을 쓰지 마라** — 「최대 몇 %」, 「크게」로 수치를 대신하는 비교도 근거 없이 쓰지 마라. 이유: guide 「배경」.
- **TCO 계산기의 기능을 설명하지 마라.** 이유: 지원이 끝난 도구를 가르치게 된다.
