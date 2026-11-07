# Step 1: monitoring-tools-advisor

## 배경

phase 108의 전체 계획·결정·공통 규칙은 `phases/108-azure-monitoring/guide.md`에 있다.
**이 step은 주제 `azure-monitoring`(모니터링)을 만들고 개념 1(Azure 모니터링 도구)·2(Azure Advisor)의 글·문항과 도식 `MonitoringToolsDiagram`·`AdvisorRecommendationDiagram`을 더한다.**
사실은 step 0이 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

중심 문제: **지켜볼 때 궁금한 것이 셋으로 갈리고, 도구는 그 물음으로 고른다.** Azure 쪽에 문제가 있는가(Azure Service Health), 설정을 어떻게 고치면 나아지는가(Azure Advisor), 내 리소스와 앱에서 무슨 일이 일어나는가(Azure Monitor). 학습자가 도구 이름을 외우는 대신 **무엇을 보고 무엇을 알려 주는가**로 고르게 한다.
Advisor에서는 **권장 사항을 줄 뿐 바꾸는 것은 담당자**라는 것과, **비용을 보여 주는 것(비용 분석)과 줄일 방법을 권하는 것(Advisor)** 의 차이가 핵심이다.

## 읽어야 할 파일

- **`phases/108-azure-monitoring/guide.md` 전체**
- `phases/108-azure-monitoring/index.json`의 step 0 `summary` — 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/ToolAccessDiagram.tsx`와 `.test.tsx`(주제를 만드는 step의 첫 도식, 도구 → 공통 대상), `PolicyCheckDiagram.tsx`와 `.test.tsx`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/107-azure-governance-tools/verification.md`의 「메인 세션이 마무리에서 고친 것」
- 겹치지 않게: `src/data/azure/topics.json`의 `azure-cloud-benefits.manageability`·`predictability`, `azure-security-model.defender-for-cloud`, `azure-cost-management.cost-management`·`cost-analysis`·`budgets`, `azure-cost-factors.pricing-calculator`, 문항 `az023`·`az127`·`az142`~`az147`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-infrastructure-as-code` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-monitoring", "title": "모니터링", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`. 개념은 guide.md 표의 1·2다. `name`은 step 0 summary가 확정한 표기를 쓴다.

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 1 | `azure-monitoring.monitoring-tools` | — | **목록 개념**(ADR-046). 소개 문단 첫 문장은 Azure에 리소스를 두고 쓰다 보면 확인할 것이 생긴다는 것부터 — 무엇이 궁금한가에 따라 여는 도구가 다르다. **모니터링**·**리소스**·**구독**을 이 문단에서 짧게 푼다. 항목 셋(Azure Advisor, Azure Service Health, Azure Monitor)은 같은 꼴(무엇을 보고 · 무엇을 알려 주는가) 한두 줄씩 — 뒤 개념이 자세히 쓰므로 범주 이름·세 보기·기능 넷을 늘어놓지 않는다. 항목 뒤 문단 하나: 어느 도구를 열지 고르는 예(회사 A의 담당자 셋이 서로 다른 물음으로 서로 다른 도구를 연다 — **도식의 예를 본문에 쓴다**: Azure 쪽, 내 구독, VM 1, 웹 앱 1). |
| 2 | `azure-monitoring.azure-advisor` | — | **목록 개념**. 첫 문장은 리소스를 만든 뒤 설정이 가장 나은지 담당자가 하나하나 따져 보기 어렵다는 것부터. Advisor가 무엇을 분석해(설정과 사용 기록) 무엇을 주는지(권장 사항과 할 일). 다섯 범주 항목은 step 0이 확정한 이름으로, 같은 꼴(무엇을 찾아 주는가) 한 줄씩. 항목 뒤 문단: 담당자가 권장 사항을 실행·연기·해제한다(**Advisor가 스스로 바꾸는가는 step 0 결과의 말 그대로**), 모든 구독을 한 화면에서 보고 거른다, 새 권장 사항 알림. 비용 범주의 예(사용률이 낮은 VM — step 0 결과대로), 보안 범주는 Defender for Cloud의 권장 사항을 함께 보여 준다(**Defender for Cloud**를 한 줄로 푼다). **비용 분석과의 차이** 한 줄(비용 분석을 그 자리에서 한 줄로 푼다). **도식의 예(VM 1, 담당자)를 본문에 쓴다** |

### 2. 문항 — `src/data/azure/questions.json`에 `az179`~`az181`

| id | 개념 | 형식과 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az179` | `monitoring-tools` | 4지선다, 정답 위치 0 「상황 적용」 — 담당자가 웹 앱의 응답이 느려지는 때를 알고 싶어 앱과 VM이 낸 수치를 모아 보고, 수치가 정해 둔 기준을 넘으면 알림을 받으려 한다. 정답 Azure Monitor. 오답은 Azure Advisor·Azure Service Health와 같은 범주(Azure에서 무언가를 지켜보는 도구)의 넷째 하나 — step 0 결과로 고른다(Defender for Cloud처럼 실제로 헷갈리는 것). 「알림을 받는다」만으로 Service Health·Advisor도 맞게 읽히지 않게 **무엇이 일어났을 때인가(내 리소스가 낸 수치가 기준을 넘음)**를 조건으로 준다(guide 「문항」 4항). Azure Monitor라는 이름이나 「모니터」를 문제문에 쓰지 않는다 |
| `az180` | `azure-advisor` | 예/아니요, 정답 **아니요** 「흔한 오해」 — Advisor가 사용률이 낮은 VM을 찾아 크기를 줄이라고 권하면, 그 변경이 VM에 바로 적용되는가. 해설은 담당자가 권장 사항을 실행·연기·해제한다는 것을 가르친다. step 0 결과가 다르면 맞는 주장으로 고친다(답은 아니요로 둔다). 「…해도」·「저절로」처럼 답을 흘리는 말을 쓰지 않는다 |
| `az181` | `azure-advisor` | 4지선다, 정답 위치 1 「개념 비교」 — 회사 B의 담당자가 비용을 줄이려고 **어떤 리소스를 어떻게 바꾸면 좋을지 권해 받고** 싶다. 정답 Azure Advisor. 오답은 비용 분석·예산·가격 계산기(앞 주제의 비용 도구 — 같은 범주). 각각이 무엇을 하는지 이 주제 화면에서 해설로 한 줄씩 풀린다. `az142`(가격 계산기)와 보기 구성이 겹쳐도 묻는 것은 다르다 — 상황을 다르게 만든다. 문제문의 말이 오답 셋을 범주로 지워 주지 않게 한다(phase 107 `az153`) |

### 3. 도식

이 step이 `src/data/azure/visuals/azure-monitoring.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-monitoring': azureMonitoringVisuals`로 넣는다.

#### `azure-monitoring.monitoring-tools` — `MonitoringToolsDiagram`, JSON 키 `monitoring-tools`

- 물음형 제목 예: `무엇이 궁금할 때 어느 도구를 열까?`
- 그릴 것: 그룹 `g-azure`(「Azure 쪽」 — 본문의 말로) 안에 `platform`(「Azure 서비스와 지역」), 그룹 `g-mine`(「내 구독」) 안에 `vm-1`(「VM 1」)·`web-app`(「웹 앱 1」), 그룹 밖에 도구 셋 `service-health`(「Azure Service Health」)·`advisor`(「Azure Advisor」)·`monitor`(「Azure Monitor」). 경로 `platform-to-health`(`platform`→`service-health`), `vm-to-advisor`(`vm-1`→`advisor`), `vm-to-monitor`(`vm-1`→`monitor`), `app-to-monitor`(`web-app`→`monitor`).
- 세로형(폭 280)은 그룹 둘을 위에, 도구 셋을 아래에 위아래로 쌓는 쪽이 길을 내기 쉽다. `Azure Service Health`는 반각 글자가 많다 — guide 「글자 폭의 여유」의 1.15배로 폭을 잡는다. 경로가 다른 그룹의 노드·라벨 영역을 지나지 않게 설계한다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `azure-side` | Azure 쪽에 문제가 있나 | `platform`·`service-health` | `platform-to-health` | 「장애·계획된 유지 관리」 | Azure 자체의 장애와 유지 관리는 Azure Service Health가 알린다 |
  | `improve` | 무엇을 고칠까 | `vm-1`·`advisor` | `vm-to-advisor` | 「권장 사항」 | Advisor는 리소스의 설정과 사용 기록을 분석해 고칠 것을 권한다 |
  | `my-data` | 내 리소스에서 무슨 일이 | `vm-1`·`web-app`·`monitor` | `vm-to-monitor`·`app-to-monitor` | 「수치와 기록」(본문의 말로) | Azure Monitor는 내 리소스와 앱이 낸 데이터를 모아 분석하고 경고한다 |

  `idleCaption`은 세 도구가 무엇을 보고 무엇을 알려 주는지가 다르다는 것을 말한다. `azure-side` 캡션이 「Service Health는 내 리소스를 보지 않는다」로 읽히지 않게 쓴다 — 리소스 하나의 상태를 보는 Resource Health는 이 그림의 몫이 아니다.
- 요점 테스트: 시나리오마다 선명한 도구 노드가 하나이고 셋이 서로 다르다. `platform-to-health`만 `g-azure`의 노드에서 나온다. `service-health`로 들어오는 경로가 `g-mine`의 노드에서 나오지 않는다. 도구 노드 셋은 어느 그룹 안에도 없다(두 배치).

#### `azure-monitoring.azure-advisor` — `AdvisorRecommendationDiagram`, JSON 키 `advisor-recommendation`

- 물음형 제목 예: `Advisor의 권장 사항은 어디서 나오고 누가 적용할까?`
- 그릴 것: `vm-1`(「VM 1」), `defender`(「Defender for Cloud」 — step 0 표기), `advisor`(「Azure Advisor」), `cost-rec`(「비용 권장 사항」), `security-rec`(「보안 권장 사항」), `admin`(「담당자」). 경로 `vm-to-advisor`, `defender-to-advisor`, `advisor-to-cost`, `advisor-to-security`, `cost-to-admin`. 범주 이름은 step 0이 확정한 표기로 고친다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `cost` | 비용 | `vm-1`·`advisor`·`cost-rec` | `vm-to-advisor`·`advisor-to-cost` | step 0 결과(사용률이 낮은 VM 같은 것) | 리소스의 사용 기록을 분석해 비용을 줄일 방법을 권한다 |
  | `security` | 보안 | `defender`·`advisor`·`security-rec` | `defender-to-advisor`·`advisor-to-security` | 「Defender for Cloud의 권장 사항」 | 보안 범주는 Defender for Cloud가 낸 권장 사항을 함께 보여 준다 |
  | `act` | 담당자가 고른다 | `cost-rec`·`admin` | `cost-to-admin` | 「실행·연기·해제」(step 0 표기) | 권장 사항을 따를지는 담당자가 정한다 — step 0 결과의 말대로 |

- 요점 테스트: `security`에서만 `defender`가 선명하다. `act`에서만 `admin`이 선명하고 `cost-to-admin`이 보인다. `cost`와 `security`의 선명한 권장 사항 노드가 서로 다르다. `act`에서 흐린 `advisor`·`vm-1`이 「멈췄다」로 읽히지 않게 캡션이 그 장면이 담당자의 선택만 밝힌다는 것을 쓴다(guide 「도식」 시나리오 끝 줄).

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다. 종·신호등·체크 표시 같은 그림을 그리지 않는다(guide 「도식」 색).

registry에 두 줄(`azure-infrastructure-as-code.bicep` 키 뒤, 개념 순서대로).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·4·5)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 181개, 마지막 id는 `az181`, 예 45·아니요 45, 정답 위치 23/23/22/23이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 스무째(마지막) 주제이고 `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/108-azure-monitoring/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~9를 만들지 마라.** 이유: step 2·4·5의 범위다. 이 step의 글이 Service Health·Azure Monitor를 쓸 때는 목록 항목의 한두 줄로 그친다.
- **Advisor의 범주마다 권장 사항 목록을 늘어놓지 마라.** 이유: 권장 사항은 자주 바뀌고 학습 가이드의 줄은 「Advisor의 목적」이다. 범주마다 무엇을 찾아 주는가 한 줄과 비용 범주의 예 하나까지.
- **Defender for Cloud·Cost Management를 다시 가르치지 마라.** 이유: 앞 phase의 개념 자리다. 짝을 가르는 한 줄씩까지.
