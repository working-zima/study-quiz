# Step 1: factors-data-transfer

## 배경

phase 106의 전체 계획·결정·공통 규칙은 `phases/106-azure-cost/guide.md`에 있다.
**이 step은 주제 `azure-cost-factors`(비용 요인과 계산기)를 만들고 개념 1(비용에 영향을 주는 요인)·2(데이터 전송 비용)의 글·문항과 도식 `CostFactorsDiagram`·`DataTransferCostsDiagram`을 더한다.**
사실은 step 0이 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

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
- `src/data/azure/topics.json`의 `azure-cloud-computing.pay-as-you-go`·`reservations`·`spot-vm`과 `az005`~`az007` — 겹치지 않게

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-security-model` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-cost-factors", "title": "비용 요인과 계산기", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`. 개념은 guide.md 표의 1·2다. `name`은 step 0 summary가 확정한 표기를 쓴다.

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 1 | `azure-cost-factors.cost-factors` | — | **목록 개념**(ADR-046). 소개 문단 첫 문장은 왜 요금이 하나로 정해지지 않는지부터. 항목 여섯은 같은 꼴(무엇이 달라지면 요금이 어떻게 달라지는가). 「사용량」 항목의 예약·저축 플랜·스폿은 한 줄씩만 — 이 주제 화면만 읽고 뜻이 서게 푼다. 항목 뒤 문단에 같은 크기의 VM 두 대의 예를 쓴다(**도식의 예를 본문에 쓴다**: VM 1·VM 2, 지역 A·지역 B, 실행 시간, 라이선스) |
| 2 | `azure-cost-factors.data-transfer-costs` | `cost-factors` | 나가는 전송에 요금이 붙는 까닭을 지어내지 않는다 — 출처가 말하는 것까지만. **청구 영역과 가용성 영역**을 4절대로 — 무엇이 다르고 왜 나눠 부르는지. 온-프레미스와 오가는 경우는 step 0 결과의 범위로. 수치 없음 |

### 2. 문항 — `src/data/azure/questions.json`에 `az131`~`az134`

| id | 개념 | 형식과 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az131` | `cost-factors` | 예/아니요, 정답 **아니요** 「흔한 오해」 — 회사 A가 크기가 같은 VM 두 대를 서로 다른 지역에 두었고 한 대는 하루 종일, 한 대는 낮에만 실행한다. 두 대의 한 달 요금은 같은가. 해설은 요금을 가르는 요인을 가르친다 |
| `az132` | `cost-factors` | 4지선다, 정답 위치 0 「개념 비교」 — Azure Marketplace에서 타사 제품을 샀을 때 청구에 무엇이 더해지는가, 또는 어떤 상황이 어떤 요인에 드는가. 오답은 나머지 요인들. 소거로 풀리지 않게 조건을 준다 |
| `az133` | `data-transfer-costs` | 예/아니요, 정답 **예** 「개념 확인」 — step 0이 근거를 확인한 범위에서: 데이터를 Azure 데이터 센터 밖으로 내보내는 전송의 가격이 청구 영역에 따라 정해지는가. 근거가 다르면 맞는 주장으로 고친다(답은 예로 둔다) |
| `az134` | `data-transfer-costs` | 4지선다, 정답 위치 1 「원인과 결과」 — 회사가 같은 데이터를 온-프레미스에서 Azure로 올린 뒤 다른 지역으로 복사하고 온-프레미스로 내려받는다. 네 구간 가운데 요금을 따로 볼 필요가 없는 쪽은 어디인가, 또는 문서가 단정할 수 있는 쪽으로 다시 세운다. 「항상」을 쓰지 않는다 |

### 3. 도식

이 step이 `src/data/azure/visuals/azure-cost-factors.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-cost-factors': azureCostFactorsVisuals`로 넣는다.

#### `azure-cost-factors.cost-factors` — `CostFactorsDiagram`, JSON 키 `cost-factors`

- 물음형 제목 예: `크기가 같은 VM인데 왜 요금이 다를까?`
- 그릴 것: `vm-1`(「VM 1」)·`vm-2`(「VM 2」)를 나란히 두고, 요인 노드 `region`(「지역」)·`hours`(「실행 시간」)·`license`(「소프트웨어 라이선스」). 경로 `region-to-vm`·`hours-to-vm`·`license-to-vm`(각 요인 → `vm-2`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `region` | 지역이 다를 때 | `vm-1`·`vm-2`·`region` | `region-to-vm` | 「지역마다 가격이 다르다」 | 같은 VM도 지역에 따라 가격이 다를 수 있다 |
  | `hours` | 실행 시간이 다를 때 | `vm-1`·`vm-2`·`hours` | `hours-to-vm` | 「쓴 만큼 낸다」 | 오래 실행한 쪽이 더 낸다 |
  | `license` | 라이선스가 다를 때 | `vm-1`·`vm-2`·`license` | `license-to-vm` | 「소프트웨어 값이 더해진다」 | 운영 체제나 다른 소프트웨어의 라이선스가 요금을 바꾼다 |

- 요점 테스트: 어느 시나리오에서도 `vm-1`·`vm-2`가 모두 선명하다. 시나리오마다 요인 노드는 하나만 선명하고 경로 하나만 보인다. 경로의 끝이 모두 `vm-2`다.

#### `azure-cost-factors.data-transfer-costs` — `DataTransferCostsDiagram`, JSON 키 `data-transfer-costs`

- 물음형 제목 예: `어느 방향으로 옮길 때 요금이 붙을까?`
- 그릴 것: `outside`(「온-프레미스」, step 0 결과에 따라 「Azure 밖」으로). 그룹 `region-a`(「지역 A」) 안에 `vm-1`(「VM 1」), 그룹 `region-b`(「지역 B」) 안에 `vm-2`(「VM 2」). 경로 `inbound`(`outside`→`vm-1`), `outbound`(`vm-1`→`outside`, 나란히), `between`(`vm-1`→`vm-2`).
- 시나리오(곁말의 말은 step 0이 정한 범위로 고친다):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `in` | 들어올 때 | `outside`·`vm-1` | `inbound` | step 0 결과 | 들어오는 전송의 요금 |
  | `out` | 나갈 때 | `outside`·`vm-1` | `outbound` | 「청구 영역에 따라 요금」 | 나가는 전송은 청구 영역에 따라 가격이 정해진다 |
  | `between` | 지역 사이 | `vm-1`·`vm-2` | `between` | step 0 결과 | 지역 사이 전송의 요금 |

- 요점 테스트: `inbound`와 `outbound`의 방향이 반대다(시작·끝 노드). `between`은 두 그룹을 잇는다. `in`·`out`에서 `vm-2`가 opacity `0.25`다. `vm-1`은 `region-a` 안, `vm-2`는 `region-b` 안(두 배치).

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(`azure-security-model.sentinel` 키 뒤, 개념 순서대로).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 134개, 마지막 id는 `az134`, 예 33·아니요 34이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 열다섯째 주제이고 `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/106-azure-cost/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~7을 만들지 마라.** 이유: step 2·3의 범위다. 이 step의 글이 그 낱말(할당 해제, 저축 플랜)을 쓸 때는 한 줄 풀이로 그친다.
- **실제 지역 이름으로 비싼 곳·싼 곳을 말하지 마라.** 이유: 근거 없는 비교이고 자주 바뀐다.
