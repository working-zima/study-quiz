# Step 4: sla-composite

## 배경

phase 101은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/101-azure-benefits-sla-service-types/guide.md`에 있다.
**이 step은 주제 `azure-sla-lifecycle`(SLA와 서비스 수명 주기)을 만들고 그 첫 개념 셋(8 서비스 수준 계약(SLA), 9 서비스 크레딧, 10 복합 SLA)의 글·문항과,
이 주제의 첫 도식 `CompositeSlaDiagram`을 함께 만든다.**

이 주제는 공식 학습 가이드 밖이다. 사실은 step 3이 모은 Well-Architected Framework·약관·수명 주기 문서에서만 가져온다. **서비스마다의 SLA 수치는 쓰지 않는다**(guide.md 「배경」) — 계산의 예는 「서비스 A」·「서비스 B」의 예시 값으로 한다.

## 읽어야 할 파일

- **`phases/101-azure-benefits-sla-service-types/guide.md` 전체**
- `phases/101-azure-benefits-sla-service-types/index.json`의 step 3 `summary` — 개념마다 확정한 `name`(특히 복합 SLA/복합 SLO의 결정), 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/HybridCloudDiagram.tsx`와 `.test.tsx`(phase 100, 늘 보이는 연결선과 곁말이 있는 도식), `src/data/azure/visuals/azure-cloud-models.json`,
  `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-cloud-benefits` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-sla-lifecycle", "title": "SLA와 서비스 수명 주기", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 8~10이다. `name`은 step 3 summary가 확정한 표기를 쓴다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 8 | `azure-sla-lifecycle.sla` | 서비스 수준 계약(SLA) | — | 이 주제의 첫 개념이라 **가동 시간**·**리소스**·**서비스**(Azure가 제공하는 VM·데이터베이스 같은 기능 하나하나)를 짧게 푼다. Microsoft가 가동 시간과 연결에 대해 맺는 공식 약속이라는 것, 서비스마다 다르다는 것, 정한 범위만 덮는다는 것, 지키지 못하면 책임이 따르는 계약이라는 것 — step 3 결과대로. 가동률을 백분율로 나타낸다는 것과 그 뜻(예: 한 달 가운데 쓸 수 있었던 시간의 비율)은 step 3이 근거를 찾은 만큼만 |
| 9 | `azure-sla-lifecycle.service-credit` | 서비스 크레딧 | `sla` | 서비스가 SLA에 못 미쳤을 때 고객이 받는 보상 — step 3이 확인한 꼴(요금의 일부)과 절차(SLA에 받는 절차가 있다, 청구해야 하는지)만. SLA와 서비스 크레딧이 어떻게 이어지는지(약속 ↔ 못 지켰을 때의 보상) 4절대로 |
| 10 | `azure-sla-lifecycle.composite-sla` | 복합 SLA | `sla` | 이름은 step 3의 결정대로. 앱이 여러 서비스에 함께 기대면 그 서비스들이 모두 동작해야 앱이 동작하므로 가동률을 곱한다 — 그래서 어느 한 서비스의 값보다도 낮다. 높이려면 중복을 둔다(step 3 결과대로). **도식의 예를 본문에 쓴다** — 회사 A의 앱이 서비스 A(SLA 99.9%)와 서비스 B(SLA 99.95%)에 함께 기대면 0.999 × 0.9995 ≈ 0.9985, 약 99.85%다(값은 예라고 밝힌다 — guide.md 「예시 값」) |

### 2. 문항 — `src/data/azure/questions.json`에 `az024`~`az027`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az024` | `sla` | 예/아니요 「흔한 오해」 — SLA가 그 서비스의 모든 기능을 보장하는가(정한 범위만 덮는다), 같은 꼴. **`az015`(서비스마다 가동 시간 보장이 다른가)와 같은 것을 묻지 않는다** |
| `az025` | `service-credit` | 예/아니요 또는 4지선다 — 서비스가 SLA에 못 미쳤을 때 고객에게 무엇이 생기는가. 4지선다라면 오답은 실제로 헷갈리는 것(전액 환불, 다른 서비스로 자동 이전 등 — step 3이 확인한 사실로 갈리는 것) |
| `az026` | `composite-sla` | 4지선다 「원리 이해」 — 계산. 본문과 **다른** 값의 두 서비스(예: 99.95%와 99.99% → 약 99.94%)에 함께 기대는 앱의 값을 고른다. 오답은 헷갈리는 셈에서 — 높은 쪽 값, 낮은 쪽 값, 두 값의 평균. 정답을 손으로 다시 셈하고 summary에 셈을 적는다 |
| `az027` | `composite-sla` | 예/아니요 「흔한 오해」 — 앱이 기대는 서비스를 더 늘리면 앱 전체의 가동률이 높아지는가(아니요 — 곱이라 낮아진다), 같은 꼴. 해설은 높이는 방법(중복 — step 3 결과대로)까지 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 2 summary의 균형 줄이다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-sla-lifecycle.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-sla-lifecycle': azureSlaLifecycleVisuals`로 넣는다.

#### `azure-sla-lifecycle.composite-sla` — `CompositeSlaDiagram`, JSON 키 `composite-sla`

- 물음형 제목 예: `서비스 두 개에 함께 기대는 앱은, 가동률이 어떻게 될까?`
- 그릴 것: 노드 셋 — `app`(본문의 이름, 예: 「회사 A의 앱」), `service-a`(`서비스 A`), `service-b`(`서비스 B`). 세로형은 `app`을 위에, 두 서비스를 아래에 나란히. 가로형은 같은 짜임을 넓게(또는 `app`을 왼쪽에).
  늘 보이는 연결선 둘 `app-a`·`app-b`(`app`에서 각 서비스로 — 앱이 그 서비스에 기댄다). 화살표 뜻은 캡션이나 `legend`로 밝힌다.
  곁말(9): 각 서비스 아래에 그 값(`99.9%`·`99.95%`), `app` 옆이나 아래에 앱의 값. 곁말이 연결선·노드 상자와 겹치지 않게 둔다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `single` | 서비스 하나 | `app`·`service-a` | `service-a`의 `99.9%`, `app`의 값 `99.9%` | 앱이 서비스 A 하나에만 기대면 앱의 가동률은 서비스 A의 값과 같다 |
  | `composite` | 서비스 둘 | `app`·`service-a`·`service-b` | 두 서비스의 값, `app`의 셈(예: `99.9% × 99.95% ≈ 99.85%`) | 두 서비스가 모두 동작해야 앱이 동작하므로 값을 곱한다 — 결과는 어느 서비스의 값보다 낮다 |

  `single`이 본문에서 근거를 댈 수 없으면(서비스 하나에 기대는 경우를 본문이 말하지 않으면) 본문에 한 줄로 쓰거나 시나리오를 바꾸고 summary에 적는다.
- 요점 테스트:
  - `composite`에서 `app` 곁말의 백분율이 두 서비스 곁말의 백분율 어느 것보다 작고, 두 값을 곱해 소수 둘째 자리로 반올림한 값과 같다(곁말 글자에서 숫자를 읽어 셈한다).
  - `single`에서 `app` 곁말의 값이 `service-a` 곁말의 값과 같고, `service-b`는 opacity `0.25`이며 그 값 곁말이 보이지 않는다.
  - 늘 보이는 연결선 둘은 두 시나리오와 `전체`에서 모두 보인다.
- 캡션·곁말의 사실과 값은 개념 10 본문에 있어야 한다(ADR-036·038).

위 도식 설계는 출발점이다. 본문(step 3 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-sla-lifecycle.composite-sla': CompositeSlaDiagram` 한 줄(`azure-cloud-benefits` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `CompositeSlaDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·4·5·7·8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 27개, 마지막 id는 `az027`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 넷째 주제이고 `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 본문·도식·문항의 계산(0.999 × 0.9995, `az026`의 셈)을 손으로 다시 셈했는가.
   step 3 summary가 「쓰지 않는다」로 정한 것(SLA 수치 등)을 지켰는가.
4. `phases/101-azure-benefits-sla-service-types/index.json`의 step 4를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 11~13(미리 보기, 일반 공급, 최신 수명 주기 정책)을 만들지 마라.** 이유: step 5의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **실제 서비스 이름에 SLA 값을 붙이지 마라**(「VM은 99.9%」 등). 이유: guide.md 「배경」 — 확인할 수 없는 수치다. 예시는 「서비스 A」·「서비스 B」로.
- **덤프가 쓰는 옛 이름(Azure AD 등)을 쓰지 마라.** 이유: 지원이 끝난 이름·옛 이름은 현행으로 고친다(사용자 결정).
