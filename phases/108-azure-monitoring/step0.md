# Step 0: advisor-health-sources

## 배경

phase 108은 Azure AZ-900 과목에 마지막 주제 20(모니터링)을 더한다. 전체 계획과 결정은 `phases/108-azure-monitoring/guide.md`에 있다.
step 1·2가 개념 1~4(Azure 모니터링 도구, Azure Advisor, Azure Service Health, Resource Health)를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고, 덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다. 두 문서의 형식은 앞 phase가 만든 것을 그대로 따른다.

이 범위의 중심 문제는 셋이다.
(1) **이름** — Learn은 Azure Service Health를 세 보기의 묶음이라 하면서 가운데 보기도 Service Health라 부르고, 한국어판은 「Azure 서비스 상태」·「Azure Service Health」·「서비스 상태」·「Service Health」·「Azure 상태」를 섞어 쓴다. 「상태」가 status와 health 둘 다를 옮긴 말이라 더 헷갈린다. 묶음과 세 보기, Resource Health의 상태 값, Advisor의 다섯 범주를 하나씩 정한다.
(2) **Advisor가 하는 일의 경계** — 권장 사항을 주는가, 스스로 바꾸는가, 비용을 추정하는가(덤프 NO.501의 답이 의심스럽다), 보안 권장 사항과 보안 점수(NO.245·425).
(3) **세 보기가 보여 주는 범위** — Azure 상태는 누구나 보고 넓은 장애만, Service Health는 로그인한 사람의 서비스·지역과 계획된 유지 관리·상태 권고, Resource Health는 리소스 하나와 그 원인(Azure 쪽 / 사용자 쪽). 덤프 NO.129·168·218·223·346·374·491의 진술마다 근거를 찾는다.

## 읽어야 할 파일

- `phases/108-azure-monitoring/guide.md` — 특히 「배경」, 「주제와 개념 9개」의 표(개념 1~4), 「예시 값」, 「출처」, 「출처 step(0·3)의 공통 형식」
- `docs/source/azure/CLAUDE.md` — 원본 셋, 허용하는 출처, 가리키는 표기, 덤프의 그림을 보는 법. **이 규칙을 따른다**
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞 phase가 만든 형식을 따른다.** Advisor·Service Health·경고·작업 그룹을 말하는 기존 항목(`grep -n 'Advisor\|Service Health\|작업 그룹\|action group' docs/source/azure/official.md`)과 phase 107의 「한국어 표기 정리」·「도식·표의 사실」 항목을 먼저 읽는다. 앞 phase가 이 주제로 미룬 줄(`grep -n '모니터링 주제\|azure-monitoring\|phase 108' docs/source/azure/corrections.md docs/source/azure/official.md`)도 찾아 이번에 처리한다
- `phases/107-azure-governance-tools/verification.md`의 「설계와 달라진 것」 — 출처 step이 Learn과 제품 문서가 어긋날 때 현행 문서로 바꾼 방식
- `docs/source/azure/topic-map.md`의 주제 20 줄과 `dump-topics.tsv`에서 `primary`가 `monitoring`인 33문항(`awk -F'\t' '$2=="monitoring"' docs/source/azure/dump-topics.tsv`). **이 step이 보는 것은 그 가운데 18문항**이다 — Advisor NO.107·120·206·216·245·322(NO.107과 같은 문항)·393·425·501·503, Service Health·Resource Health NO.129·168·218·223·346·374·491, 도구 고르기 NO.80·149. 나머지 15문항(Azure Monitor·활동 로그·Log Analytics·경고·Application Insights)은 step 3의 몫이다
- 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다. 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/4-management-governance.md`의 Azure Advisor·Azure Service Health 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — guide.md 「출처」의 목록
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

공식 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 받아 `raw/official/`에 둔다(`CERTIFICATE_VERIFY_FAILED`면 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`).
이름은 `learn-<모듈>-<단원>.md`, `docs-<서비스>-<쪽>.md`, 한국어판은 앞에 `ko-`를 붙인다. 영문판으로 사실을 확인하고, 한국어판은 **용어 표기만** 본다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `monitoring-tools` | 세 도구를 한 줄씩 세울 사실 — Advisor(권장 사항), Azure Service Health(Azure 자체와 내 리소스의 상태), Azure Monitor(데이터를 모아 분석하고 대응 — Learn 단원 4로 한 줄까지만, 자세한 것은 step 3). 세 도구를 모두 Azure 포털에서 여는가. **모니터링**을 풀 말. NO.80(포털에서 무엇을 여는가 — 그림까지, 보안 권장 사항과 Azure 서비스의 상태를 어느 쪽으로 보는지), NO.149(짝짓기 — Advisor·Application Insights 줄만, 그림까지). `MonitoringToolsDiagram`에 쓸 말(도구마다 보는 곳과 알려 주는 것) | Learn 단원 1·2·3·4와 ko, `docs-advisor-overview.md`, `docs-service-health-overview.md`, `docs-azure-monitor-overview.md` |
| b | `azure-advisor` | 정의(무엇을 분석하는가 — 리소스 설정과 사용 기록), **다섯 범주의 한국어 이름**(Learn ko는 「안정성·보안·성능·운영 우수성·비용」 — 제품 문서 ko와 대조)과 범주마다 무엇을 찾아 주는가, 권장 사항에 붙은 할 일과 **담당자가 실행·연기·해제한다**(표기 — 「연기」·「해제」·「완료」), **Advisor가 리소스를 스스로 바꾸지 않는가**(쓸 수 있는 말 그대로 — 근거를 못 찾으면 「권장 작업을 고르면 적용 화면이 열린다」까지), 대시보드(모든 구독, 구독·리소스 그룹·서비스로 거르기), 새 권장 사항 알림(무엇으로 받는가 — 작업 그룹이면 그 말), 열 수 있는 사람(구독·리소스 그룹·리소스의 소유자·기여자·읽기 권한자 — 쓸지는 summary에). **비용 범주의 예**(사용률이 낮은 VM — 앞 phase가 받은 `docs-advisor-cost-recommendations.md`), **보안 범주와 Defender for Cloud**(Advisor가 Defender for Cloud의 권장 사항을 보여 준다 — `advisor-security-recommendations`), 보안 권장 사항을 따르면 보안 점수가 어떻게 되는가(NO.245·425 — 근거가 Defender for Cloud 문서에 있으면). NO.107·322·393(권장 사항의 범위 — 그림까지), NO.120(그림까지), NO.206·503(미사용 VM·비용 절감), NO.216(모범 사례), **NO.501**(덤프 답 「비용 추정」이 의심스럽다 — 비용을 미리 어림하는 것은 가격 계산기, 앞 phase `azure-cost-factors.pricing-calculator`), **NO.245·425**(Azure Backup으로 보호된 VM 목록, 보안 점수, 「지원을 유지하려면 30일 안에 적용」 — 그림까지, 진술마다) | `docs-advisor-overview.md`와 ko, `advisor-get-started`, `advisor-alerts-portal`, `advisor-security-recommendations`, 범주별 권장 사항 쪽 |
| c | `service-health` | **묶음의 이름과 세 보기의 한국어 표기**(Azure 상태 / Service Health / Resource Health — 영문 이름을 그대로 쓸지, 「서비스 상태」·「리소스 상태」로 옮길지 Learn ko와 제품 문서 ko를 대조해 하나로 정하고, 묶음과 가운데 보기가 같은 이름이라는 것을 앱이 어떻게 가를지 정한다). **Azure 상태**: 로그인하지 않아도 누구나 보는가, 모든 지역의 모든 서비스, 넓게 퍼진 장애만 올리고 나머지는 Service Health로 알린다(`docs-service-health-azure-status-overview.md` — 세 시나리오·사후 검토는 쓰지 않는다). **Service Health**: 로그인한 사람의 구독이 쓰는 서비스·지역, 알려 주는 일의 종류(서비스 문제·계획된 유지 관리·상태 권고 — 보안 권고 같은 것이 더 있으면 이름 표기, `service-health-overview`), **경고 설정**(무엇으로 받는가 — 작업 그룹, 이메일·문자 메시지 같은 길), 지난 일의 기록이 남는가(수치는 쓰지 않는다), 지원으로 가는 길. **Azure Monitor와 무엇이 다른가**를 쓸 근거. NO.129·374(전체 상황은 어디서 — 그림까지, 덤프끼리 답이 갈리는지), NO.168·223(Service Health로 무엇을 보고 경고를 받는가 — 그림까지, 진술마다), NO.218·491(계획된 유지 관리 알림) | `docs-service-health-overview.md`·`docs-service-health-azure-status-overview.md`와 ko, Learn 단원 3과 ko, `service-health-overview`, `alerts-activity-log-service-notifications-portal` |
| d | `resource-health` | 정의(리소스 하나의 지금 상태와 지난 기록), **상태 값 넷의 한국어 표기**(Available·Unavailable·Unknown·Degraded — 제품 문서 ko와 포털 표기)와 각각의 뜻(한 줄씩, 수치 없이), **플랫폼 이벤트와 비플랫폼 이벤트**(Azure 쪽 — 계획된 유지 관리, 예상하지 못한 호스트 재부팅 / 사용자 쪽 — 담당자가 VM을 중지함)의 표기와 Resource Health가 그 둘을 가르는가, Azure 쪽 문제일 때 알려 주는 것(Microsoft가 하는 조치, 사용자가 할 수 있는 일, 지원 연락 — 지원 계약이 없어도 되는가), 경고(Resource Health 경고 — 이름 표기), 지원되지 않는 리소스가 있다(한 줄 — 쓸지는 summary에). SLA를 어겼는지 보기 쉽다는 줄은 쓸지 판단한다(guide 「배경」 — SLA 수치는 쓰지 않는다). NO.346(VM에 영향을 준 서비스 장애를 어디서 — 덤프 답 B가 Service Health인지 Resource Health인지, 둘 다 맞게 읽히는지) | `docs-service-health-resource-health-overview.md`와 ko, `resource-health-faq`, Resource Health 경고 쪽 |
| e | 도식 | `MonitoringToolsDiagram`·`AdvisorRecommendationDiagram`·`HealthViewsDiagram`·`ResourceHealthDiagram`의 라벨·곁말·캡션의 사실마다 근거가 있는지(step 1·2 문서의 설계를 읽는다). 「Azure 쪽(Microsoft가 운영)」, 「내 구독」, 「다섯 범주」, 「로그인하지 않아도 본다」, 「사용할 수 없음 — Azure 쪽 / 사용자 작업」 같은 곁말이 출처로 서는지 | a~d의 결과 |

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·3)의 공통 형식」대로. Learn 단원 1·2·3을 새 항목으로(단원 4는 개념 1의 한 줄에 쓰는 사실만 이 step이 적고, 나머지는 step 3이 같은 항목에 덧붙인다), 제품 문서를 쪽마다 항목으로 둔다. 앞 phase가 둔 「Advisor 비용 권장 사항」 항목이 있으면 거기에 덧붙인다.
끝에 「도식·표의 사실 — `azure-monitoring`」(개념 1~4의 도식 몫 — step 3이 덧붙인다)과 「한국어 표기 정리 — `azure-monitoring`(개념 1~4)」 항목 — 개념 넷과 목록 항목 이름(세 도구, Advisor의 다섯 범주, 세 보기), Resource Health의 상태 값마다 고른 표기와 근거 문서, 섞여 쓰인 표기와 고른 까닭.

### 3. `docs/source/azure/corrections.md`에 더한다

D123·G69부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.501** — 덤프 답이 Advisor로 비용을 추정한다(가격 계산기의 일로 보인다). 맞는 답이 보기에 있는지도 본다.
- **NO.245·425** — 보안 권장 사항과 보안 점수, 「지원을 유지하려면 기한 안에 적용」, Azure Backup VM 목록(진술마다 공식 문서 근거 — 근거가 없는 진술은 「쓰지 않는다」).
- **NO.129·374**, **NO.346** — 어느 보기가 답인지 덤프끼리 갈리거나 둘 다 맞게 읽히면.
- **NO.80** — 「Azure 서비스의 상태」를 어느 블레이드로 보는지(덤프 답이 Service Health를 품은 다른 화면이면 그 관계를 적는다).
- **용어집 4쪽 Azure Advisor·Azure Service Health** — 무엇을 주장하는지 보고 처리한다(범주 수·이름, 세 보기의 범위).

### 4. summary — 뒤 step이 이것을 보고 쓴다

개념 1~4마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**. 목록 개념은 항목 이름도. 위 표의 a~e마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다.
특히 (1) 묶음과 세 보기의 확정 표기와 앱이 둘을 가르는 말, (2) Advisor 다섯 범주의 확정 이름과 범주마다 한 줄, Advisor가 스스로 바꾸는가에 쓸 수 있는 말, (3) Advisor와 비용 분석·가격 계산기·Defender for Cloud를 가르는 말, (4) Azure 상태·Service Health가 보여 주는 범위와 알려 주는 일의 종류, 경고를 받는 길, (5) Resource Health의 상태 값 넷과 원인을 가르는 말(쓸 수 있는 말 그대로), (6) 도식 넷에 쓸 수 있는 사실과 이름. 받은 파일 목록. 마지막 D·G 번호. 끝에 「메인 세션이 볼 것」(앞 phase 문장과 어긋나는 곳 — 특히 `azure-security-model.defender-for-cloud`의 권장 사항·보안 점수 줄, `azure-cost-management.budgets`의 작업 그룹 풀이)과 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·3)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작 777개).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/108-azure-monitoring/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 앞 phase 문장도 고치지 않는다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 「Advisor는 스스로 바꾸지 않는다」, 「Azure 상태는 로그인 없이 본다」 같은 단정은 특히 — 근거를 못 찾은 것은 「못 찾음」으로 남긴다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.** 이유: 허용 출처를 넓히는 것은 설계에서 정한다. 다른 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **Azure Monitor·활동 로그·Log Analytics·경고 종류·Application Insights의 사실을 이 step에서 정리하지 마라.** 이유: step 3의 범위다. 개념 1의 Azure Monitor 항목에 쓸 한 줄과, Service Health 경고를 받는 길(작업 그룹)에 쓸 근거만 적는다.
