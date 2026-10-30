# Step 1: availability-scalability

## 배경

phase 101은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/101-azure-benefits-sla-service-types/guide.md`에 있다.
**이 step은 주제 `azure-cloud-benefits`(클라우드의 이점)를 만들고 그 첫 개념 셋(1 고가용성, 2 확장성, 3 탄력성)의 글·문항과,
이 주제의 도식 `CloudScalingDiagram`을 함께 만든다.** 주제를 만드는 step이 도식도 만들어야 `azureDiagramCoverage.test.ts`(주제마다 도식 하나 이상)가 통과한다.

학습자는 클라우드를 처음 배우는 사람이고, 이 주제로 바로 들어올 수 있다. 리소스·VM·SLA라는 말도 이 주제에서 처음 볼 수 있다.

## 읽어야 할 파일

- **`phases/101-azure-benefits-sla-service-types/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/101-azure-benefits-sla-service-types/index.json`의 step 0 `summary` — 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지, 확장성과 탄력성을 공식 문서가 어떻게 가르는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」)
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/CapacityPlanningDiagram.tsx`와 `.test.tsx`(phase 100, 경로 없는 도식), `src/data/azure/visuals/azure-cloud-computing.json`,
  `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-cloud-models` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-cloud-benefits", "title": "클라우드의 이점", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 1~3이다. `name`과 목록 항목 이름은 step 0 summary가 확정한 표기를 쓴다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `azure-cloud-benefits.high-availability` | 고가용성 | — | 이 주제의 첫 개념이라 **리소스**(클라우드에서 빌려 쓰는 VM·스토리지 같은 것 하나하나), **VM**, **가동 시간**, **SLA**를 짧게 푼다. 서비스마다 가동 시간 보장이 다르고 그것이 SLA에 적힌다는 것. 「쓸 수 있는 시간을 최대로」가 핵심이라는 것이 드러나게 쓴다 — 장애에서 회복하는 능력(안정성, step 2)과 헷갈리지 않게, 이 개념은 그 낱말을 꺼내지 않거나 꺼내면 한 줄로 가른다 |
| 2 | `azure-cloud-benefits.scalability` | 확장성 | — | **목록 개념** — 소개 문단 하나(수요에 맞춰 리소스를 조정하는 능력, 갑자기 몰리면 더하고 줄면 덜어 비용도 줄인다 — 쓴 만큼 내므로) 뒤 항목 둘: 수직 확장(리소스 하나의 CPU·RAM을 더하거나 줄인다), 수평 확장(VM·컨테이너의 수를 늘리거나 줄인다, 자동이나 수동). 항목 이름과 영문 이름, 늘리는 쪽·줄이는 쪽의 이름은 step 0 결과대로. **CPU**·**RAM**·**컨테이너**를 짧게 푼다. **도식의 예를 본문에 쓴다** — `VM 1` 한 대로 수요를 감당하지 못할 때, 수직 확장은 `VM 1`에 CPU·RAM을 더하고, 수평 확장은 `VM 2`·`VM 3`을 더한다(VM 대수는 예라고 밝힌다) |
| 3 | `azure-cloud-benefits.elasticity` | 탄력성 | — | step 0이 확인한 정의대로 — 수요가 오르내리는 대로 리소스가 자동으로, 그때그때 늘고 준다. **확장성과 무엇이 다른지** WRITING_GUIDE 4절대로 — step 0 summary가 적은 공식 문서의 구분만 쓴다(구분이 없으면 지어내지 않고, 두 낱말이 가까운 뜻이라는 것과 공식 문서가 탄력성에서 강조하는 점만 쓴다). 수요가 오르내리는 예(달마다 몰리는 날이 있는 서비스 등)는 직접 만든다. 민첩성은 step 0이 공식 근거를 찾았을 때만 한 줄 |

### 2. 문항 — `src/data/azure/questions.json`에 `az015`~`az019`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az015` | `high-availability` | 예/아니요 「흔한 오해」 — Azure가 모든 서비스에 같은 가동 시간을 보장하는가, 같은 꼴(서비스마다 다르고 SLA에 적힌다). 다른 확인된 사실로 바꿔도 된다 |
| `az016` | `scalability` | 4지선다 「상황 적용」 — 회사가 VM 한 대의 처리 능력이 모자라 CPU·RAM을 늘리는(또는 VM 수를 늘리는) 상황이 어떤 확장인지. 보기 넷은 같은 범주 — 수직의 두 방향과 수평의 두 방향(step 0이 정한 이름) |
| `az017` | `scalability` | 예/아니요 「원리 이해」 — 확장성이 비용에 주는 영향(수요가 줄 때 리소스를 줄이면 비용도 줄어드는가), 또는 수평 확장이 리소스 하나의 성능을 올리는 것인가. `az016`과 다른 것을 묻는다 |
| `az018` | `elasticity` | 4지선다 「개념 비교」 — 사람이 손대지 않아도 사용량이 오르내리는 대로 리소스가 그때그때 늘고 주는 상황이 어느 이점인지. **확장성을 보기에 두려면** 둘을 가르는 조건(step 0이 확인한 구분)을 문제문에 넣는다 — 구분이 확인되지 않았으면 확장성을 보기에서 빼고 이 주제의 다른 이점(고가용성 등)으로 채운다 |
| `az019` | `elasticity` | 예/아니요 — 탄력성에 대한 흔한 오해 하나(예: 탄력적인 시스템은 사람이 사용량을 보고 직접 리소스를 더해야 하는가). `az018`과 다른 것을 묻는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 예 4·아니요 4, 정답 위치 1/2/2/1이다.
덤프 문항의 문장을 옮기지 않는다 — 덤프가 같은 사실을 물어도 상황과 문장은 직접 만든다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-cloud-benefits.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-cloud-benefits': azureCloudBenefitsVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### `azure-cloud-benefits.scalability` — `CloudScalingDiagram`, JSON 키 `cloud-scaling`

- 물음형 제목 예: `VM 한 대로 수요를 감당하지 못하면, 어떻게 늘릴 수 있을까?`
- 그릴 것: 노드 셋 `vm-1`(`VM 1`)·`vm-2`(`VM 2`)·`vm-3`(`VM 3`)을 한 줄에. 셋을 그룹 박스 하나로 묶고, 그룹 라벨은 그 VM들이 무엇을 하는지(예: 「회사 A의 웹사이트를 실행하는 VM」 — 본문의 말과 같게). 경로는 없다(guide.md 「도식 테스트」의 경로가 없는 도식).
  곁말(9)은 노드 아래, 그룹 박스 안에 자리를 둔다. 세로형(폭 280)은 노드 셋이 한 줄에 들어가야 한다 — 반각 문자 1.15배 규칙으로 노드 폭과 간격을 어림한다. 가로형(폭 440)은 같은 짜임을 넓게.
- 시나리오(label은 step 0이 정한 항목 이름):

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `vertical` | 수직 확장 | `vm-1` | `vm-1` 아래 하나 — CPU·RAM을 더한다는 것 | VM 수는 그대로 두고 `VM 1`에 CPU·RAM을 더해 그 VM의 성능을 올린다, 필요가 줄면 다시 줄인다 |
  | `horizontal` | 수평 확장 | `vm-1`·`vm-2`·`vm-3` | `vm-2`·`vm-3` 아래 하나씩 — 더한 VM이라는 것 | 같은 일을 하는 VM을 더해 수를 늘린다, 자동이나 수동으로, 수요가 줄면 VM을 뺀다 |

- 요점 테스트:
  - `vertical`의 선명한 노드는 하나, `horizontal`은 셋이다. `vertical`에서 `vm-2`·`vm-3`은 opacity `0.25`이고 그룹 박스는 흐려지지 않는다.
  - `vertical`의 곁말은 하나이고 「CPU」와 「RAM」이 들었으며 `vm-1`과 같은 열(가로 중심이 `vm-1` 상자 안)에 있다.
  - `horizontal`의 곁말은 둘이고 각각 `vm-2`·`vm-3`과 같은 열에 있다. 두 시나리오가 함께 보이는 곁말은 없다.
- 캡션·그룹 라벨·곁말의 사실은 개념 2 본문에 있어야 한다(ADR-036). 「더한」·「CPU·RAM」이 본문의 말과 같게 쓴다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

registry에는 `'azure-cloud-benefits.scalability': CloudScalingDiagram` 한 줄(기존 Azure 키들 뒤).

### 4. `official.md`의 「쓰일 곳」

`docs/source/azure/official.md`에서 이 step의 개념 id(`azure-cloud-benefits.high-availability`·`scalability`·`elasticity`)와 `CloudScalingDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」). 다른 개념 id가 함께 걸린 줄은 그 개념이 모두 생긴 뒤에 고친다 — 그대로 둔다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·4·5·7·8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 19개, 마지막 id는 `az019`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 셋째 주제이고 `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·순서·진행 안내 테스트와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0 summary가 「쓰지 않는다」·「고쳐 쓴다」로 정한 것을 지켰는가. 확장성과 탄력성을 가르는 문장이 step 0이 확인한 구분에서 벗어나지 않는가.
4. `phases/101-azure-benefits-sla-service-types/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 4~7(안정성, 예측 가능성, 보안과 거버넌스, 관리 효율성)을 만들지 마라.** 이유: step 2의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `official.md`에 먼저 더한다.
- **확장성과 탄력성을 가르는 기준을 짐작으로 만들지 마라.** 이유: 덤프·용어집이 흔히 쓰는 구분(「확장성은 계획된 증가, 탄력성은 일시적 변동」 같은 것)이 공식 문서에 없으면 출처 없는 사실이다.
- **서비스마다의 SLA 수치(99.9% 등)를 쓰지 마라.** 이유: guide.md 「배경」 — 약관 원문을 확인할 수 없다.
