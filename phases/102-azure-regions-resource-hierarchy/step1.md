# Step 1: datacenter-region

## 배경

phase 102는 Azure AZ-900 과목에 주제 둘을 더한다. 전체 계획·결정·공통 규칙은 `phases/102-azure-regions-resource-hierarchy/guide.md`에 있다.
**이 step은 주제 `azure-regions-zones`(지역과 가용성 영역)를 만들고 그 첫 개념 둘(1 데이터 센터, 2 지역)의 글·문항과, 이 주제의 첫 도식 `AzureRegionDiagram`을 함께 만든다.**

사실은 step 0이 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다. step 0 summary가 「쓰지 않는다」로 정한 것(지역 수·데이터 센터 수 등)을 지킨다.

## 읽어야 할 파일

- **`phases/102-azure-regions-resource-hierarchy/guide.md` 전체**
- `phases/102-azure-regions-resource-hierarchy/index.json`의 step 0 `summary` — 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지, 지역을 고르지 않는 서비스로 쓸 예와 그 풀이 근거
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/HybridCloudDiagram.tsx`와 `.test.tsx`(phase 100, 그룹 박스와 늘 보이는 연결선), `src/components/diagrams/VpcPathsDiagram.tsx`(그룹 안의 그룹), `src/data/azure/visuals/azure-cloud-models.json`,
  `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-service-types` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-regions-zones", "title": "지역과 가용성 영역", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 1·2다. `name`은 step 0 summary가 확정한 표기를 쓴다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `azure-regions-zones.datacenter` | 데이터 센터 | — | 이 주제의 첫 개념이라 **서버**·**랙**·**리소스**(Azure에서 만들어 쓰는 VM·데이터베이스 같은 것 하나하나)·**온-프레미스**를 짧게 푼다. 고객이 데이터 센터를 직접 고르지 않고 더 큰 단위(지역, 가용성 영역)로 고른다는 것이 이 개념의 요점이다 — 두 낱말은 한 줄씩 풀고 넘어간다(「뒤에서」라 하지 않는다) |
| 2 | `azure-regions-zones.region` | 지역 | — | 데이터 센터(개념 1)를 되짚어 지역을 세운다. 배포할 때 지역을 고른다, 일부 서비스·기능은 일부 지역에만 있다, 지역을 고르지 않는 서비스가 있다(step 0이 고른 예와 한 줄 풀이), 지리와 데이터 상주, 지역을 고를 때 따질 것 — step 0 결과대로. **VM**·**대기 시간**을 한 줄로 푼다. **도식의 예를 본문에 쓴다** — 회사 A가 VM 1을 만들며 지역 A를 고르고, 그 안의 어느 데이터 센터에 놓일지는 고르지 않는다(이름표라고 밝힐 필요는 없다) |

### 2. 문항 — `src/data/azure/questions.json`에 `az039`~`az041`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az039` | `datacenter` | 예/아니요 「흔한 오해」 — Azure에 VM을 만들 때 고객이 VM을 둘 데이터 센터를 직접 하나 골라 지정하는가(아니요 — 고객은 지역(과 가용성 영역)을 고른다). 해설은 무엇을 고르는지까지 가르친다 |
| `az040` | `region` | 4지선다 「상황 적용」 — 지역을 고를 때 따질 것(사용자와의 거리에 따른 대기 시간, 데이터를 둬야 하는 경계) 가운데 상황이 정하는 것을 고른다. 예: 회사 B의 사용자 대부분이 한 나라에 있고, 데이터를 그 나라가 속한 지리 밖에 두면 안 된다 — 어느 지역에 배포하나. 오답은 실제로 헷갈리는 것(가장 먼저 목록에 나오는 지역, 사용자와 먼 다른 지리의 지역, 지역을 고르지 않는 배치 등 — step 0이 확인한 사실로 갈리는 것). 지역 이름은 이름표로 쓰고 지리는 step 0이 확인한 예로 |
| `az041` | `region` | 예/아니요 — 지역을 고르지 않는 서비스가 있다는 것(step 0이 고른 예 하나를 문제문에 쓰고 그 서비스가 무엇인지 한 줄로 푼다). 균형을 보고 주장의 방향(예/아니요)을 고른다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 guide.md 「배경」의 균형 줄이다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-regions-zones.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-regions-zones': azureRegionsZonesVisuals`로 넣는다.

#### `azure-regions-zones.region` — `AzureRegionDiagram`, JSON 키 `azure-region`

- 물음형 제목 예: `Azure에 리소스를 만들 때, 고르는 것은 데이터 센터일까 지역일까?`
- 그릴 것: 그룹 박스 `geography`(라벨 「지리」 — step 0이 확인한 표기) 안에 그룹 박스 `region-a`(「지역 A」)·`region-b`(「지역 B」).
  노드 — `region-a` 안에 `dc-a1`·`dc-a2`(「데이터 센터」)와 `vm-1`(「VM 1」), `region-b` 안에 `dc-b1`·`dc-b2`(「데이터 센터」), 그룹 밖에 `nonregional`(step 0이 고른 지역을 고르지 않는 서비스의 이름 — 예: 「Microsoft Entra ID」).
  늘 보이는 연결선 — 같은 지역의 데이터 센터 둘을 잇는 선(`link-a`·`link-b`, 저지연 네트워크로 이어져 있다는 뜻을 캡션이나 `legend`로 밝힌다).
  세로형은 지역 둘을 위아래로 쌓아도 된다(그룹 안의 그룹 — guide.md 「도식」). `nonregional`이 어느 지역 박스에도 들지 않는 자리에 있어야 한다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `deploy` | 지역에 배포 | `vm-1`·`dc-a1`·`dc-a2` | `vm-1` 옆 「지역 A를 골라 배포」 | VM 1을 만들 때 고른 것은 지역 A다 — 그 안의 어느 데이터 센터에 놓일지는 고객이 고르지 않는다 |
  | `nonregional` | 지역을 고르지 않는 서비스 | `nonregional` | `nonregional` 옆 「지역을 고르지 않는다」 | 그 서비스는 쓸 때 지역을 고르지 않는다(step 0이 확인한 까닭대로) |

  지리·데이터 상주를 보이는 셋째 시나리오는 본문에 근거가 있고 다른 둘과 갈릴 때만 더한다(더하면 summary에).
- 요점 테스트:
  - `vm-1`의 상자가 `region-a` 그룹 박스 안에 있고, `nonregional`의 상자는 `region-a`·`region-b` 어느 박스에도 들지 않는다(세로형·가로형 모두).
  - `deploy`에서 `region-b` 안의 노드와 `nonregional`이 opacity `0.25`이고, `nonregional`에서 두 지역 박스 안의 노드가 모두 `0.25`다.
  - 늘 보이는 연결선 둘은 두 시나리오와 `전체`에서 모두 보이고, 각 선의 두 끝이 같은 지역 박스 안의 노드다.
- 캡션·곁말의 사실은 개념 1·2 본문에 있어야 한다(ADR-036·038).

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-regions-zones.region': AzureRegionDiagram` 한 줄(`azure-service-types.saas` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `AzureRegionDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·3·5·6·7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 41개, 마지막 id는 `az041`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 여섯째 주제이고 `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 0 summary가 「쓰지 않는다」로 정한 것을 지켰는가.
4. `phases/102-azure-regions-resource-hierarchy/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~6(가용성 영역, 가용성 영역 서비스 범주, 지역 쌍, 소버린 지역)을 만들지 마라.** 이유: step 2·3의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **도식에 가용성 영역을 그리지 마라.** 이유: 가용성 영역의 구조는 step 2의 `ZoneIsolationDiagram`이 그린다. 이 도식의 사실은 개념 1·2 본문에 있어야 한다(ADR-036).
- **실제 지역 이름을 도식에 쓰지 마라.** 이유: 지역 이름은 바뀌고 늘어난다 — 이름표 「지역 A」·「지역 B」로 쓴다(guide.md 「예시 값」).
