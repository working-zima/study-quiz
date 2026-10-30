# Step 5: preview-ga-lifecycle

## 배경

phase 101은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/101-azure-benefits-sla-service-types/guide.md`에 있다.
**이 step은 주제 `azure-sla-lifecycle`(SLA와 서비스 수명 주기)의 나머지 개념 셋(11 미리 보기, 12 일반 공급(GA), 13 최신 수명 주기 정책)의 글·문항과 도식 `ServiceLifecycleDiagram`을 만든다.**
이 step이 끝나면 `azure-sla-lifecycle`이 완성된다.

덤프는 이 주제에서 미리 보기를 가장 많이 묻는다(비공개와 공개의 차이, SLA가 붙는가, 운영에 써도 되는가). 학습자가 「어느 단계에서 누가 쓸 수 있고, SLA가 언제부터 붙는가」를 쥐게 쓴다.

## 읽어야 할 파일

- **`phases/101-azure-benefits-sla-service-types/guide.md` 전체**
- `phases/101-azure-benefits-sla-service-types/index.json`의 step 3·4 `summary` — 개념마다 확정한 `name`·항목 이름, 무엇을 쓰고 무엇을 쓰지 않는지(특히 「공개 미리 보기는 누구나」의 근거), step 4가 이미 푼 낱말
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-sla-lifecycle` 개념 8~10(step 4가 쓴 글 — **이미 푼 낱말을 다시 풀지 않으려고 먼저 읽는다**), `questions.json`, `visuals/azure-sla-lifecycle.json`, `data.test.ts`, `visuals.test.ts`
- 도식 선례 — `src/components/diagrams/CompositeSlaDiagram.tsx`와 `.test.tsx`(step 4), `src/components/diagrams/PublicPrivateCloudDiagram.tsx`와 `.test.tsx`(phase 100, 시나리오마다 곁말이 바뀌는 도식)

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-sla-lifecycle` 끝에 셋

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `azure-sla-lifecycle.preview` | 미리 보기 | — | **목록 개념** — 소개 문단(Azure가 새 기능·서비스를 정식으로 내놓기 전에 평가용으로 먼저 내놓는다, 고객의 평가와 의견을 받으려고, 쓰려면 미리 보기 약관에 동의한다 — step 3 결과대로) 뒤 항목 둘: 비공개 미리 보기(일부 고객만, 내부 시험·평가와 의견 용도, 운영에 쓰지 않는다), 공개 미리 보기(step 3이 확인한 대로 — 누구나 써 볼 수 있다). 두 단계 모두 SLA 없이 제공되고 운영 작업에 권하지 않는다는 것. **운영 환경**(실제 사용자가 쓰는 서비스를 돌리는 환경)을 짧게 푼다. SLA는 개념 8에서 푼 말을 되짚는다. 항목 이름은 step 3 결과대로 |
| 12 | `azure-sla-lifecycle.general-availability` | 일반 공급(GA) | — | 미리 보기를 마치고 정식으로 내놓은 단계 — 모든 고객이 쓰고, SLA가 적용되고, 운영에 쓸 수 있다(step 3 결과대로). 미리 보기와 무엇이 달라지는지 WRITING_GUIDE 4절대로. 새 기능의 미리 보기·GA 소식을 Azure 업데이트에서 본다는 것은 step 3 결과대로 한 줄. **도식의 사실을 본문에 쓴다** — 세 단계(비공개 미리 보기 → 공개 미리 보기 → 일반 공급)의 순서와, 단계마다 누가 쓸 수 있는지·SLA가 붙는지. 개념 11과 겹치는 문장은 되짚는 한 줄로 줄인다 |
| 13 | `azure-sla-lifecycle.lifecycle-policy` | 최신 수명 주기 정책 | — | 계속 업데이트되는 제품·서비스에 Microsoft가 적용하는 지원 정책 — 지원이 이어지는 조건 셋, 고객 조치가 필요한 변경의 통지(최소 30일 전), 후속 없이 지원을 끝낼 때의 통지(최소 12개월 전, 무료 서비스·미리 보기 제외), 일부 Azure 서비스는 3년 전까지 통지할 수 있다는 것, Azure VM에서 돌리는 Microsoft 소프트웨어는 다른 정책(고정 수명 주기 정책)을 따른다는 것 — 모두 step 3 결과대로. 세 기간이 각각 무엇에 대한 것인지 헷갈리지 않게 쓴다. **지원**(제품에 문제가 생기면 Microsoft가 고치고 도와주는 것 — 공식 문서의 말로)을 짧게 푼다 |

### 2. 문항 — `src/data/azure/questions.json`에 `az028`~`az031`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az028` | `preview` | 4지선다 「개념 비교」 — 비공개 미리 보기와 공개 미리 보기를 가른다. **공개 단계는 셋뿐이라 단계 이름 넷을 보기로 둘 수 없다** — 보기를 설명 넷(예: 「공개 미리 보기에 맞는 설명은?」)으로 만들거나, 상황 하나에 맞는 설명을 고르게 한다. 오답은 다른 단계의 사실(초대받은 고객만, SLA 적용 등)에서 |
| `az029` | `preview` | 예/아니요 「흔한 오해」 — 공개 미리 보기 기능에 SLA가 적용되는가(아니요), 또는 누구나 쓸 수 있으니 운영에 써도 되는가. `az028`과 다른 것을 묻는다 |
| `az030` | `general-availability` | 예/아니요 또는 4지선다 — 회사가 미리 보기 기능을 운영 서비스에 쓰려면 무엇을 기다려야 하는가, 일반 공급이 되면 무엇이 달라지는가 |
| `az031` | `lifecycle-policy` | 4지선다 「개념 확인」 — 후속 제품 없이 지원을 끝낼 때 Microsoft가 최소 얼마 전에 알리는가. 오답은 같은 정책의 다른 기간(30일 — 고객 조치가 필요한 변경, 3년 — 일부 Azure 서비스)처럼 실제로 헷갈리는 것에서. 해설이 세 기간이 각각 무엇에 대한 것인지 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 4 summary의 균형 줄이다.

### 3. 도식

#### `azure-sla-lifecycle.general-availability` — `ServiceLifecycleDiagram`, JSON 키 `service-lifecycle`

`src/data/azure/visuals/azure-sla-lifecycle.json`의 `diagrams`에 더한다(step 4가 만든 파일 — `composite-sla` 문구는 바꾸지 않는다).

- 물음형 제목 예: `새 Azure 기능은 어떤 단계를 거쳐 운영에 쓸 수 있게 될까?`
- 그릴 것: 노드 셋 — `private-preview`(비공개 미리 보기)·`public-preview`(공개 미리 보기)·`ga`(일반 공급(GA)), 라벨은 step 3이 정한 표기. 세로형은 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로 단계 순서대로.
  늘 보이는 연결선 둘 `private-to-public`·`public-to-ga`(단계가 넘어가는 방향의 화살표).
  곁말(9): 시나리오마다 고른 단계의 노드 옆에 둘 — 누가 쓸 수 있나, SLA가 붙나. 세로형 280 폭에서 곁말이 노드 옆에 들지 않으면 노드 아래에 두고 노드 간격을 넓힌다.
- 시나리오(label은 단계 이름):

  | id | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `private` | `private-preview` | 일부 고객만 / SLA 없음 | 일부 고객이 시험·평가하고 의견을 주는 단계 — 운영에 쓰지 않는다 |
  | `public` | `public-preview` | 누구나 써 볼 수 있음 / SLA 없음 | 누구나 써 볼 수 있지만 SLA 없이 제공되고 운영 작업에 권하지 않는다 |
  | `ga` | `ga` | 모든 고객 / SLA 적용 | 정식으로 내놓은 단계 — SLA가 적용되고 운영에 쓸 수 있다 |

  곁말·캡션의 말은 본문의 말과 같게. step 3이 확인하지 못한 칸(예: 공개 미리 보기의 「누구나」)은 본문에도 도식에도 쓰지 않고, 그 곁말을 빼거나 확인된 말로 바꾼다 — summary에 적는다.
- 요점 테스트:
  - 시나리오마다 선명한 노드가 정확히 하나이고, 그 노드가 시나리오 id의 단계다. 나머지 둘은 opacity `0.25`.
  - 「SLA 없음」 곁말은 `private`·`public`에서만 보이고, `ga`에서는 SLA가 적용된다는 곁말이 보인다.
  - 노드가 단계 순서대로 놓인다 — 세로형은 `private-preview`의 y < `public-preview`의 y < `ga`의 y, 가로형은 x가 같은 순서. 두 연결선이 이 순서로 이어진다(첫 선의 끝 노드가 둘째 선의 시작 노드).
- 캡션·곁말의 사실은 개념 11·12 본문에 있어야 한다(ADR-036).

위 도식 설계는 출발점이다. 본문(step 3 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-sla-lifecycle.general-availability': ServiceLifecycleDiagram` 한 줄(`azure-sla-lifecycle.composite-sla` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `ServiceLifecycleDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다. 이 주제의 개념이 모두 생겼으므로 `azure-sla-lifecycle`의 개념 id만 걸린 줄은 모두 「쓰인 곳」이어야 한다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·4·5·7·8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 31개, 마지막 id는 `az031`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `azure-sla-lifecycle`의 개념 8~13을 처음부터 통독한다 — 풀이 없이 처음 나오는 낱말, 같은 낱말을 두 번 푼 곳, 진행 안내 문장. 세 기간(30일·12개월·3년)이 각각 무엇에 대한 것인지 헷갈리지 않는가.
3. `phases/101-azure-benefits-sla-service-types/index.json`의 step 5를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」. 통독하며 찾은, 앞 step 글의 고칠 것은 고치지 말고 summary에 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **step 4가 쓴 개념 8~10의 글·문항과 `composite-sla` 도식 문구를 고치지 마라.**
- **미리 보기·GA의 비용(무료인가, 할인되는가)을 step 3이 확인하지 않았는데 쓰지 마라.** 이유: 덤프가 묻지만(NO.358) 공식 근거가 없으면 출처 없는 사실이다.
- **특정 서비스가 지금 미리 보기인지 GA인지를 예로 들지 마라.** 이유: 금방 바뀐다. 예는 「회사 A가 쓰려는 새 기능」처럼 이름표로.
- **지원 종료가 예고된 서비스의 날짜를 이 주제에 쓰지 마라.** 이유: 이 주제는 정책을 다룬다. 서비스별 종료 날짜는 그 서비스를 다루는 주제가 `official.md`에 날짜와 함께 남긴다.
