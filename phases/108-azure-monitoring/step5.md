# Step 5: analytics-alerts-insights

## 배경

phase 108의 전체 계획·결정·공통 규칙은 `phases/108-azure-monitoring/guide.md`에 있다.
**이 step은 `azure-monitoring`에 개념 7(Log Analytics)·8(Azure Monitor 경고)·9(Application Insights)의 글·문항과 도식 `AlertRuleDiagram`·`AppInsightsDiagram`, 표 `MonitorFeaturesTable`을 더해 주제를 마친다.** 이 step으로 Azure 과목의 주제 20개가 모두 찬다.
사실은 step 0·3이 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

중심 문제: **Azure Monitor가 모은 데이터를 쓰는 세 길.** 모인 로그에서 원하는 기록을 찾는다(Log Analytics), 조건이 맞으면 알린다(경고 규칙이 「언제」를, 작업 그룹이 「누구에게·무엇을」 정한다), 웹 앱 안에서 요청이 어떻게 처리되는지 본다(Application Insights). 마지막 표가 활동 로그까지 넷을 「무엇을 보는가 · 언제 여는가」로 나란히 둔다.

## 읽어야 할 파일

- **`phases/108-azure-monitoring/guide.md` 전체**
- `phases/108-azure-monitoring/index.json`의 앞 step `summary` — 특히 step 3이 확정한 표기(Log Analytics 작업 영역·쿼리·KQL, 경고 규칙·작업 그룹·경고 종류 셋, 애플리케이션 성능 모니터링·의존성·가용성 테스트)와 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체, 「비교표」 쪽(표의 열 폭)
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-monitoring` 앞 개념 여섯(이미 푼 낱말을 다시 풀지 않는다 — 특히 작업 그룹·쿼리·메트릭·로그·활동 로그), `questions.json`, `visuals/azure-monitoring.json`, `data.test.ts`·`visuals.test.ts`
- 도식 선례 — step 1·2·4의 도식과 테스트, `BudgetAlertDiagram.tsx`(경고와 작업 그룹 — 앞 phase), `src/types/visuals.ts`, `DiagramFrame.tsx`(고치지 마라), `registry.ts`, `src/lib/svg-bounds.ts`
- 표 선례 — `src/components/diagrams/azureGovernanceTables.tsx`와 `.test.tsx`, `ComparisonTableFigure.tsx`(고치지 마라)
- 겹치지 않게: `azure-cost-management.budgets`·`cost-alerts`(예산 경고·작업 그룹), `azure-compute`의 App Service 풀이, 문항 `az145`~`az147`

## 작업

### 1. 개념 — `topics.json`의 `azure-monitoring` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 7 | `azure-monitoring.log-analytics` | `azure-monitor` | 첫 문장은 여러 리소스의 로그가 한곳에 쌓여도 그대로는 너무 많아 원하는 기록을 찾기 어렵다는 것부터. 무엇을 하는 도구인가(포털에서 쿼리를 작성하고 실행), 로그가 모이는 곳(**Log Analytics 작업 영역** — step 3 표기, 한 줄로 푼다), 간단한 거르기부터 추세를 차트로 보는 분석까지, 쿼리를 쓰지 않고 눌러서 거르는 방식(step 3 결과대로), 쿼리 언어의 이름은 한 번(step 3 표기 — 문법은 쓰지 않는다). 로그 경고의 쿼리도 여기서 쓰고 시험한다(한 줄 — 개념 8과 이어진다). 도식 없음 — 정의형 |
| 8 | `azure-monitoring.monitor-alerts` | `azure-monitor` | 첫 문장은 담당자가 화면을 늘 지켜볼 수 없으니 문제가 생기면 먼저 알려 주는 것이 필요하다는 것부터. **경고 규칙**(어느 리소스의 무엇을 보고 어떤 조건이면 — step 3 표기)과 **작업 그룹**(누구에게 어떻게 알리고 무엇을 실행할지 — 앞 개념들이 한 줄로 푼 말과 같게, 여기서 개념 자리로 자세히)을 따로 만든다 — 4절로 둘을 가른다. 경고의 종류 셋(step 3 표기)을 같은 꼴(무엇이 일어났을 때 나는가 — 예 하나씩)으로, Service Health·Resource Health의 경고가 그 가운데 어디에 드는가(step 3 결과대로). 작업 그룹 하나를 Azure Monitor·Service Health·Azure Advisor가 함께 쓴다. **예산 경고와의 차이** 한 줄(step 3 결과대로). **도식의 예(VM 1, CPU 사용률이 80%를 넘으면, 운영 팀, 이메일, 자동화)를 본문에 쓴다** — 기준 값은 담당자가 정한 예로 읽히게 쓴다 |
| 9 | `azure-monitoring.application-insights` | `azure-monitor` | 첫 문장은 VM의 수치가 정상이어도 사용자가 겪는 앱의 느림이나 오류는 앱 안을 봐야 보인다는 것부터. **애플리케이션 성능 모니터링(APM)** 을 한 줄로 풀고, 웹 앱이 어디서 실행되든 쓴다(step 3 결과대로). 켜는 두 길(SDK — 한 줄로 풀고 / 코드를 바꾸지 않는 길 — step 3 결과의 한정대로). 보는 것(step 3 결과대로 — 요청 수·응답 시간·실패율, 의존성 — 한 줄로 푼다, 페이지 로드 시간·사용자 수·세션, 서버 성능), **가용성 테스트**. **표 `MonitorFeaturesTable`의 칸에 쓰는 사실을 본문에 먼저 쓴다**(Azure Monitor의 기능 넷을 가르는 문단 하나 — 앞 개념 6·7·8이 쓴 말과 같게). **도식의 예(사용자, 웹 앱 1, 데이터베이스, 가용성 테스트)를 본문에 쓴다** |

### 2. 문항 — `az188`~`az190`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az188` | `log-analytics` | 4지선다, 정답 위치 0 「상황 적용」 — 운영 팀이 여러 VM의 로그를 한곳에 모아 두었다. 지난 하루 동안 생긴 오류 기록만 골라 시간대별로 몇 번 생겼는지 차트로 보고 싶다. 정답 Log Analytics. 오답은 Azure Monitor의 다른 기능(활동 로그, Azure Monitor 경고, Application Insights 같은 것) — 「모아 둔 로그에서 골라 본다」는 조건으로 갈린다. 활동 로그만 보는 상황이 되지 않게(활동 로그도 작업 영역으로 보낼 수 있다 — step 3 결과) 묻는 기록을 VM이 낸 오류 기록으로 둔다 |
| `az189` | `monitor-alerts` | 4지선다, 정답 위치 1 「개념 비교」 — 담당자가 VM 1의 CPU 사용률이 기준을 넘으면 경고가 나도록 경고 규칙을 이미 만들었다. 경고가 나면 운영 팀 전체에 이메일과 문자 메시지가 가게 하려면 무엇을 설정하는가. 정답 작업 그룹(step 3 표기). 오답은 같은 범주(경고와 로그를 다루는 설정)에서 — 경고 규칙의 조건, 진단 설정, Log Analytics 작업 영역 같은 것. `az145`(예산의 작업 그룹)와 같은 것을 묻지 않는다 — 묻는 것은 경고 규칙과 작업 그룹이 나눠 맡는 일이다 |
| `az190` | `application-insights` | 예/아니요, 정답 **예** 「흔한 오해」 — 사용자가 아무도 접속하지 않는 시간에 Application Insights로 웹 앱이 응답하는지 확인할 수 있는가(가용성 테스트 — step 3 결과대로). 「…에도」처럼 답을 흘리는 말을 쓰지 않는다. 해설은 가용성 테스트가 일부러 요청을 보내 응답을 확인한다는 것과, 실제 사용자의 요청으로는 무엇을 보는가를 가르친다 |

### 3. 도식

#### `azure-monitoring.monitor-alerts` — `AlertRuleDiagram`, JSON 키 `alert-rule`

- 물음형 제목 예: `경고는 언제 나고 누구에게 알릴까?`
- 그릴 것: `vm-1`(「VM 1」), `sh-event`(「Service Health 이벤트」 — step 3 표기), `rule`(「경고 규칙」), `action-group`(「작업 그룹」), `email`(「이메일」), `automation`(「자동화」). 경로 `vm-to-rule`, `sh-to-rule`, `rule-to-group`, `group-to-email`, `group-to-automation`. 이름은 step 3 표기로 고친다.
- 시나리오(말은 step 3 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `metric` | 메트릭 경고 | `vm-1`·`rule`·`action-group`·`email` | `vm-to-rule`·`rule-to-group`·`group-to-email` | 「CPU 사용률이 80%를 넘음」(본문의 예) | 리소스의 수치가 경고 규칙의 조건에 맞으면 경고가 나고, 작업 그룹이 담당자에게 알린다 |
  | `service` | Service Health 경고 | `sh-event`·`rule`·`action-group`·`email` | `sh-to-rule`·`rule-to-group`·`group-to-email` | 「같은 작업 그룹」 | Service Health의 경고도 경고 규칙으로 만들고, 같은 작업 그룹으로 알린다 |
  | `automate` | 자동화 | `rule`·`action-group`·`automation` | `rule-to-group`·`group-to-automation` | 「알리는 대신 실행」(본문의 말로) | 작업 그룹은 알림을 보내는 대신 자동화를 시작하게 할 수도 있다 |

- 요점 테스트: 모든 시나리오에서 `action-group`과 `rule-to-group`이 보인다. `sh-event`는 `service`에서만, `automation`은 `automate`에서만 선명하다. 신호 노드(`vm-1`·`sh-event`)에서 `action-group`으로 바로 가는 경로가 없다 — 모든 신호가 `rule`을 거친다.

#### `azure-monitoring.application-insights` — `AppInsightsDiagram`, JSON 키 `app-insights`

- 물음형 제목 예: `Application Insights는 웹 앱에서 무엇을 볼까?`
- 그릴 것: `user`(「사용자」), `test`(「가용성 테스트」), `web-app`(「웹 앱 1」), `database`(「데이터베이스」 — 앱이 부르는 다른 서비스), `app-insights`(「Application Insights」). 경로 `user-to-app`, `test-to-app`, `app-to-db`, `app-to-ai`. 웹 앱이 SDK나 에이전트로 데이터를 보낸다는 것은 곁말로(step 3 결과대로).
- 시나리오(말은 step 3 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `requests` | 사용자 요청 | `user`·`web-app`·`app-insights` | `user-to-app`·`app-to-ai` | 「응답 시간·실패율·페이지 로드 시간」 | 사용자가 보낸 요청이 얼마나 빨리 처리되고 얼마나 실패하는지 본다 |
  | `dependency` | 다른 서비스 호출 | `web-app`·`database`·`app-insights` | `app-to-db`·`app-to-ai` | 「호출과 성능」(본문의 말로) | 앱이 부르는 데이터베이스 같은 서비스의 호출이 얼마나 걸리고 실패하는지 본다 |
  | `availability` | 가용성 테스트 | `test`·`web-app`·`app-insights` | `test-to-app`·`app-to-ai` | 「사용자가 적을 때도」 | 일부러 요청을 보내 앱이 응답하는지 확인한다 |

- 요점 테스트: `app-to-ai`는 모든 시나리오에서 보인다. `user`는 `requests`에서만, `test`는 `availability`에서만, `database`는 `dependency`에서만 선명하다. `user`와 `test`가 같은 시나리오에서 함께 선명하지 않다. `availability`에서 흐린 `user`가 「사용자가 접속할 수 없다」로 읽히지 않게 캡션을 쓴다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로). `application-insights`는 도식과 표를 배열로.

### 4. 표 — `MonitorFeaturesTable`

`src/components/diagrams/azureMonitoringTables.tsx`와 `.test.tsx`를 새로 만든다. `visuals/azure-monitoring.json`의 `tables["monitor-features"]`, 개념 `azure-monitoring.application-insights`. 열은 **기능 · 보는 것 · 이럴 때 연다**. 행은 활동 로그 / Log Analytics / Azure Monitor 경고 / Application Insights — 칸은 이 주제 본문과 같게 쓴다. 활동 로그는 「리소스에 한 관리 작업 — 누가·언제·무엇을」, Log Analytics는 「작업 영역에 모인 로그를 쿼리로」, Azure Monitor 경고는 「정해 둔 조건이 맞을 때 알린다」, Application Insights는 「웹 앱 안의 요청·응답·실패」 쪽으로 — 말은 본문을 따른다. 「이럴 때 연다」 칸은 학습자의 물음(예: 누가 VM을 멈췄는지 알고 싶을 때)으로 쓴다. `columnWidths`와 계산은 guide.md 「도식」대로 summary에 적는다. registry의 표 등록은 선례를 따른다.

### 5. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식·표가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·4·5)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 190개, 마지막 id는 `az190`, 예 48·아니요 47, 정답 위치 24/24/23/24다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `azure-monitoring`의 개념이 아홉이고 순서·`parentId`가 guide 표와 같은지, `topics.json`의 주제가 스무 개이고 순서가 주제 지도와 같은지 본다.
3. **주제 전체를 처음부터 끝까지 통독한다** — 개념 1의 목록 항목 셋과 뒤 개념들의 말이 어긋나지 않는지, 같은 낱말(작업 그룹·쿼리·로그·경고)을 두 번 풀지 않았는지, 「상태」가 status와 health 어느 쪽인지 헷갈리지 않는지. 앞 step의 글에서 고칠 곳을 찾으면 고치지 말고 summary에 적는다. 문항 12개를 한꺼번에 다시 읽어 같은 개념의 두 문항이 같은 것을 묻지 않는지 본다.
4. `phases/108-azure-monitoring/index.json`의 step 5를 갱신한다(성공 → guide.md 「summary에 적을 것」 / 3회 실패 → error / `check-verbatim` 「건너뜀」 → blocked).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **KQL 쿼리 글자, Log Analytics의 화면 구성, 경고 처리 규칙·경고 상태, 작업 그룹의 동작 목록, Application Insights의 화면 이름 목록·AI 에이전트 모니터링을 쓰지 마라.** 이유: guide 「배경」 — 학습 가이드의 줄에 없고 개념을 흐린다.
- **예산 경고·비용 경고를 다시 가르치지 마라.** 이유: `azure-cost-management`의 몫이다. 가르는 한 줄까지.
- **표의 칸에 본문에 없는 사실을 쓰지 마라.** 이유: ADR-036. 칸의 사실은 이 주제 개념 6~9의 본문에서 온다.
