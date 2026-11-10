# Step 3: monitor-sources

## 배경

phase 108의 전체 계획과 결정은 `phases/108-azure-monitoring/guide.md`에 있다.
step 4·5가 개념 5~9(Azure Monitor, 활동 로그, Log Analytics, Azure Monitor 경고, Application Insights)를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고, 덤프·용어집이 공식 문서와 다른 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다.

이 범위의 중심 문제는 셋이다.
(1) **제품 문서가 Learn보다 훨씬 넓다** — Azure Monitor 개요는 AI 에이전트·Copilot·Prometheus·Azure Monitor 작업 영역·파이프라인까지 든다. guide 「배경」의 「쓰지 않는 것」대로 걸러, Learn 단원 4가 세운 줄(모은다·한곳에 둔다·대시보드·쿼리·경고, 기능 셋)과 활동 로그만 확인한다.
(2) **기록이 어디에 남는가** — 관리 작업은 활동 로그에, 리소스 안의 일은 리소스 로그에(진단 설정이 있어야), 메트릭과 로그는 따로 모인다. 덤프는 「누가 VM을 멈췄나」(NO.60·114·452), 「성능 데이터는 어디 저장되나」(NO.332), 「여러 리소스의 이벤트를 한곳에」(NO.1 — 덤프 답 Event Hubs가 의심스럽다)를 묻는다.
(3) **경고의 구성과 종류** — 경고 규칙과 작업 그룹, 메트릭·로그 검색·활동 로그 경고, Service Health·Resource Health 경고가 활동 로그 경고라는 것, 작업 그룹을 여러 서비스가 함께 쓴다는 것. 앞 phase가 쓴 「작업 그룹」 풀이(`azure-cost-management.budgets`)와 맞춘다.

## 읽어야 할 파일

- `phases/108-azure-monitoring/guide.md` — 특히 「배경」, 「주제와 개념 9개」의 표(개념 5~9), 「예시 값」, 「출처」, 「출처 step(0·3)의 공통 형식」
- `phases/108-azure-monitoring/index.json`의 step 0~2 `summary` — 확정한 표기(특히 작업 그룹·경고), 앞 개념이 쓴 Azure Monitor 한 줄
- `docs/source/azure/CLAUDE.md` — **이 규칙을 따른다**
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — step 0이 이번 phase에 더한 항목과 「도식·표의 사실 — `azure-monitoring`」. 앞 phase의 활동 로그 항목(`grep -n 'activity-log\|활동 로그' docs/source/azure/official.md`)과 비용 경고·작업 그룹 항목
- `docs/source/azure/topic-map.md`의 주제 20 줄과 `dump-topics.tsv`의 `monitoring` 33문항 가운데 **이 step이 보는 15문항** — Azure Monitor NO.1·246·273·312·319·332·404, 활동 로그 NO.60·114·452, Log Analytics NO.85·437, 경고 NO.200, Application Insights NO.25·384
- 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다. 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/4-management-governance.md`의 Azure Monitor(두 항목)·Log Analytics·Application Insights 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — guide.md 「출처」의 목록
- `src/data/azure/topics.json`의 `azure-monitoring` 개념 1~4(step 1·2가 쓴 것), `azure-management-tools.azure-arc`의 모니터링 줄, `azure-virtual-networking.azure-dns`의 활동 로그 줄, `azure-cost-management.budgets`·`cost-alerts`
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `azure-monitor` | 정의, 데이터가 나오는 곳(앱·운영 체제·네트워크 — Learn 단원 4, 제품 문서의 Azure 리소스·VM과 대조), **온-프레미스·다른 클라우드를 지켜보는 길**(Azure Arc로 연결 — `azure-arc` 줄과 어긋나지 않는지), 한곳에 두고 대시보드·쿼리·경고로 쓴다. **메트릭과 로그**의 정의와 한국어 표기(정해진 간격으로 잰 수치 / 일어난 일의 기록 — 쓸 수 있는 말 그대로, 예 하나씩), 각각 어디에 모이는가(로그 → Log Analytics 작업 영역, 메트릭 → step이 찾은 현행 표기 — Azure Monitor 작업 영역·Prometheus는 쓰지 않는다). 딸린 기능 넷이 Azure Monitor의 것인가(활동 로그·Log Analytics·경고·Application Insights). **NO.273·404**(「Azure Monitor와 통합되는 것」 둘 — 덤프 답 Application Insights·Log Analytics, 오답 Service Health·Advisor·Azure 상태의 처리: Service Health 경고가 Azure Monitor의 경고 규칙이라는 것과 어긋나지 않게 앱이 쓸 말을 정한다), **NO.332**(성능 데이터가 어디 저장되나 — 덤프 답 Log Analytics 작업 영역이 맞는가, 메트릭과 갈리는가), **NO.1**(여러 리소스의 이벤트를 한곳에 모아 엮는 서비스 — 덤프 답 Event Hubs가 맞는가, Azure Monitor·Log Analytics 쪽 근거. Event Hubs는 범위 밖이라 앱에 쓰지 않는다), **NO.246·312·319**(진술 묶음 — 온-프레미스 감시, 경고, 여러 구독의 데이터 — 그림까지, 진술마다) | Learn 단원 4와 ko, `docs-azure-monitor-overview.md`와 ko, `data-platform`(현행 쪽), `data-platform-metrics`, `data-platform-logs`, 하이브리드·다중 클라우드 쪽 |
| b | `activity-log` | 정의와 한국어 표기, **관리 작업**(컨트롤 플레인 — 표기와 쓸지)과 예(만들기·바꾸기·지우기·VM 중지 같은 작업 시작), 읽기는 대개 남지 않는다, **누가·언제·무엇을**이 남는가(호출한 사람 — 문서의 표기), 따로 설정하지 않아도 남는다, 사용자가 고치거나 지울 수 없다, 보는 단위(구독·리소스 그룹·리소스), 오래 두려면 진단 설정으로 다른 곳에 보낸다(수치는 쓰지 않는다). **리소스 로그**(데이터 플레인 — 표기)의 정의와 예(키 자격 증명 모음에서 비밀을 꺼냄, 데이터베이스에 보낸 요청), **기본으로 모이지 않고 진단 설정이 있어야 한다**, **진단 설정**의 표기와 한 줄 정의. **활동 로그를 Log Analytics 작업 영역으로 보내 쿼리할 수 있는가**(guide 「문항」 4항의 함정 — 근거와 쓸 말). NO.60·114·452(누가 VM을 중지했는지 — 그림까지, 덤프끼리 답이 갈리는지) | `docs-azure-monitor-platform-activity-log.md`와 ko, `resource-logs`, `diagnostic-settings` |
| c | `log-analytics` | 정의(포털에서 로그 쿼리를 작성하고 실행하는 도구)와 표기, **Log Analytics 작업 영역**의 표기와 한 줄 정의, **쿼리**를 풀 말, 간단 모드·KQL 모드의 표기(쿼리를 쓰지 않고 눌러서 거르는 방식이 있다 — 쓸 말), 쿼리 언어 이름의 표기(KQL — 「Kusto 쿼리 언어」), 결과를 표·차트로 본다, 로그 경고·통합 문서가 쓰는 쿼리를 여기서 쓰고 시험한다(통합 문서 이름은 쓰지 않는다). 어디서 여는가에 따라 볼 수 있는 데이터 범위가 다르다(쓸지는 summary에). **NO.437**(VM 이벤트를 쿼리할 도구 둘 — 덤프 답 BD, 보기 확인), **NO.85**(Log Analytics 경고의 쿼리·기간·빈도 — 덤프 보기 C가 잘려 있다. 쿼리 문법·수치 세부는 쓰지 않으므로 처리만 남긴다) | `docs-azure-monitor-log-analytics-overview.md`와 ko, `log-analytics-workspace-overview` |
| d | `monitor-alerts` | 정의, **경고 규칙**의 구성(대상 리소스·신호·조건)과 표기, **작업 그룹**의 표기와 정의(알림 — 이메일·문자 메시지 같은 것, 자동화를 시작한다 — 목록은 쓰지 않는다), 앞 phase `budgets`의 「작업 그룹(경고에 맞춰 실행할 동작을 묶어 둔 것)」과 같은 것인가, **경고의 종류 셋의 한국어 표기**(메트릭 경고·로그 검색 경고·활동 로그 경고)와 각각 무엇을 보는가, **Service Health 경고·Resource Health 경고가 활동 로그 경고**라는 것(`docs-azure-monitor-alerts-overview.md`), **작업 그룹을 Azure Monitor·Service Health·Advisor가 함께 쓴다**(Learn 단원 4 — 제품 문서와 대조), 리소스가 여럿이면 리소스마다 따로 평가한다(쓸지는 summary에), **예산 경고와 무엇이 다른가**(Cost Management의 경고 — 앞 phase가 받은 `docs-cost-management-alerts.md`, 예산이 작업 그룹을 실행할 수 있다는 앞 phase 줄과 맞춘다). **NO.200**(VM이 중지되면 알림 — 어떤 경고 종류인지), NO.246·312·319의 경고 진술 | `docs-azure-monitor-alerts-overview.md`·`docs-azure-monitor-action-groups.md`와 ko, `alerts-types` |
| e | `application-insights` | 정의, **애플리케이션 성능 모니터링(APM)** 의 표기, Azure Monitor의 기능인가, 앱이 Azure·온-프레미스·다른 클라우드 어디서 실행되든 쓴다, **SDK를 넣는 길과 코드를 바꾸지 않는 길**(에이전트·자동 계측 — 표기, 어떤 환경에서 되는가를 한정할 말), 보는 것(요청 수·응답 시간·실패율, 의존성 호출, 페이지 로드 시간·사용자 수·세션, 서버 성능 카운터 — Learn 단원 4와 제품 문서 대조), **의존성**의 표기와 한 줄 정의, **가용성 테스트**의 표기와 정의(일부러 요청을 보내 응답을 확인한다 — 사용자가 적을 때도). OpenTelemetry는 이름을 쓸지 판단한다(쓰지 않는 쪽이 기본 — guide 「배경」). **NO.25**(페이지 로드 시간), **NO.384**(소속 서비스 — 그림까지) | `docs-azure-monitor-app-insights-overview.md`와 ko, `availability`, 자동 계측 쪽 |
| f | 도식·표 | `MonitorDataDiagram`·`ActivityLogDiagram`·`AlertRuleDiagram`·`AppInsightsDiagram`의 라벨·곁말·캡션과 `MonitorFeaturesTable`의 칸(기능 · 보는 것 · 이럴 때 연다)의 사실마다 근거가 있는지(step 4·5 문서의 설계를 읽는다) | a~e의 결과 |

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·3)의 공통 형식」대로. step 0이 만든 Learn 단원 4 항목이 있으면 거기에 덧붙이고, 앞 phase의 활동 로그 항목에도 덧붙인다(`(phase 108)`). 끝에 「한국어 표기 정리 — `azure-monitoring`(개념 5~9)」 항목, 그리고 step 0이 만든 「도식·표의 사실 — `azure-monitoring`」에 도식 넷과 표의 몫을 덧붙인다.

### 3. `docs/source/azure/corrections.md`에 더한다

step 0의 마지막 번호 다음부터. 미리 본 후보:

- **NO.1** — 여러 리소스의 이벤트를 한곳에 모으는 서비스의 덤프 답(Event Hubs). 주제 지도 「덤프 정답이 의심스러운 문항」에 있다.
- **NO.273·404** — 「Azure Monitor와 통합되는 것」에서 Service Health를 오답으로 두는 것이 공식 문서와 어긋나는지(Service Health 경고는 Azure Monitor의 경고 규칙이다).
- **NO.332** — 성능 데이터의 저장소(메트릭과 로그가 갈리는지).
- **NO.85** — 잘린 보기.
- **용어집 4쪽 Azure Monitor(두 항목)·Log Analytics·Application Insights** — 무엇을 주장하는지 보고 처리한다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

개념 5~9마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**. 위 표의 a~f마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다.
특히 (1) 메트릭과 로그를 가르는 말과 각각이 모이는 곳, (2) Azure Monitor가 Azure 밖을 지켜보는 길(앞 `azure-arc` 줄과의 관계), (3) 활동 로그에 남는 것·남지 않는 것과 리소스 로그·진단 설정의 확정 표기, 활동 로그를 작업 영역으로 보내는 길(문항에서 Log Analytics를 오답으로 둘 수 있는가), (4) 경고 규칙·작업 그룹·경고 종류 셋의 확정 표기와 Service Health 경고의 자리, 예산 경고와 가르는 말, (5) Application Insights를 켜는 두 길과 보는 것, 가용성 테스트, (6) 도식 넷과 표에 쓸 수 있는 사실과 이름. 받은 파일 목록. 마지막 D·G 번호. 끝에 「메인 세션이 볼 것」(앞 phase 문장 — `azure-arc`·`azure-dns`·`budgets`·`manageability`와 어긋나는 곳, step 1·2가 쓴 Azure Monitor·경고 줄과 어긋나는 곳)과 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·3)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(step 0이 끝났을 때의 수는 step 0 summary에).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/108-azure-monitoring/index.json`의 step 3을 갱신한다(성공 → 위 「4. summary」 / 3회 실패 → error / 확인 자체가 불가능 → blocked, 인증서 오류는 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. step 1·2가 쓴 글이 이 step의 출처와 어긋나도 고치지 않고 「메인 세션이 볼 것」에 적는다.
- **확인하지 못한 사실을 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 가르친다. 「활동 로그는 고치거나 지울 수 없다」, 「리소스 로그는 기본으로 모이지 않는다」, 「코드를 바꾸지 않고 켠다」 같은 단정은 특히 — 근거를 못 찾은 것은 「못 찾음」으로.
- **guide 「배경」이 쓰지 않기로 한 것(Copilot·AIOps·Prometheus·Azure Monitor 작업 영역·Grafana·자동 크기 조정·경고 처리 규칙·작업 그룹의 동작 목록·Application Insights의 화면 이름 목록)을 「쓸 것」으로 정리하지 마라.** 이유: 제품 문서에 있어도 학습 가이드의 줄에 없다. 근거 기록이 필요하면 「쓰지 않는다」로 적는다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.** 다른 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
