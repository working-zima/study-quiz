# phase 108 공통 안내 — Azure AZ-900 과목의 모니터링

이 phase의 **모든 step이 먼저 읽는 문서**다. step 문서는 자기 일의 세부만 적고, 과목 결정·주제의 개념 표와 글·문항·도식·파일 형식의 공통 규칙은 여기에 둔다.
step 문서와 이 문서가 다르면 step 문서를 따르고 그 차이를 summary에 적는다.

## 배경 — 다시 묻지 말 결정

Azure AZ-900 과목(`src/data/azure/`, ADR-060)은 phase 100에서 생겼고 phase 101~107이 주제 3~19를 더했다. 주제 지도(`docs/source/azure/topic-map.md`)의 주제 20개 가운데 1~19가 있고, **이 phase는 마지막 주제 20 `azure-monitoring`을 더한다.**
공식 학습 가이드의 묶음 「Describe monitoring tools in Azure」(Azure Advisor의 목적, Azure Service Health, Log Analytics·Azure Monitor 경고·Application Insights를 포함한 Azure Monitor)를 채운다.
과목 마감 점검(주제 20개·별점·문항 수와 주제 지도의 대조, 학습 가이드 줄마다의 대응, 덤프 정답 의심 문항의 처리)은 **phase가 끝난 뒤 메인 세션이 마무리에서 한다**(사용자 결정 2026-11-06). step은 하지 않는다.

**앞 phase가 남긴 것(이 phase의 출발점):**

- 주제 열아홉 — `azure-cloud-computing`·`azure-cloud-models`·`azure-cloud-benefits`·`azure-sla-lifecycle`·`azure-service-types`·`azure-regions-zones`·`azure-resource-hierarchy`·`azure-compute`·`azure-virtual-networking`·`azure-network-protection`·`azure-storage`·`azure-data-movement`·`azure-identity`·`azure-security-model`·`azure-cost-factors`·`azure-cost-management`·`azure-governance`·`azure-management-tools`·`azure-infrastructure-as-code`, 개념 124개.
- 문항 `az001`~`az178`(178개) — 예/아니요 예 45·아니요 44, 4지선다 정답 위치(`answerIndex` 0~3) 22/22/22/23.
- 출처 문서 `docs/source/azure/official.md`(항목 머리 `## (phase 100) …`~`## (phase 107) …`)와 `docs/source/azure/corrections.md`(D1~D122, G1~G68). **이 phase는 D123·G69부터 잇는다.**
- 검증 값(설계 때 잰 값): 테스트 350파일·7802개, 교차 검사 세로·가로 노드 1722·경로 1106, `check-verbatim --subject azure` 원본 777개·단위 1193개(설계 세션이 Learn 단원과 제품 문서를 받아 원본이 749에서 늘었다 — 아래 「출처」).
- 실행 보고 `phases/100-…`~`107-azure-governance-tools/verification.md` — 출처 step이 정한 표기와 그 이유, 마무리에서 고친 문항·문장의 꼴이 있다. **`105`·`106`·`107`의 「메인 세션이 마무리에서 고친 것」을 읽는다** — 답을 흘리는 말(「…뒤에도」, 「별도로 확인하지 않아도」), 이름만으로 소거되는 보기(az150), 어색하게 끼워 넣은 라벨 풀이(az133), 문제문의 말이 오답 셋을 범주로 지워 주는 것(az153), 문제문의 낱말 하나로 빠지는 범주 밖 오답(az175), 정답 보기만 가장 긴 것(az176)을 고쳤다. 같은 것을 반복하지 않는다.

**앞 주제가 이미 쓴 것 — 겹치지 않게:**

- `azure-security-model.defender-for-cloud`(phase 105)가 Defender for Cloud의 보안 상태 평가·보안 점수·권장 사항·위협 경고를 가르치고 `az127`이 그것을 묻는다. 이 phase의 `azure-advisor`는 **Advisor의 보안 범주가 Defender for Cloud의 권장 사항을 함께 보여 준다**를 한 줄로만 쓰고(step 0 결과대로), Defender for Cloud를 다시 가르치지 않는다.
- `azure-cost-management`(phase 106)가 비용 분석·예산·비용 경고를 가르치고, `budgets`가 **작업 그룹**(경고에 맞춰 실행할 동작을 묶어 둔 것)을 한 줄로 푼다. 이 phase의 `monitor-alerts`가 작업 그룹의 개념 자리다 — 같은 표기 「작업 그룹」을 쓴다(step 3이 한국어 표기를 확인한다). `azure-advisor`의 비용 범주는 **비용을 보여 주는 것(비용 분석)과 줄일 방법을 권하는 것(Advisor)** 의 차이로 쓴다(4절).
- `azure-cloud-benefits.manageability`(phase 101)가 「상태를 모니터링하다가 … 정해 둔 지표에 따라 자동으로 경고를 받는다」를 쓰고 `az023`이 그것을 묻는다. `azure-cloud-benefits.predictability`가 **모니터링**(계속 지켜보며 상태를 확인하는 일)을 한 줄로 푼다. 이 phase는 그 일을 **어느 도구가 무엇을 보고 하는가**로 다룬다.
- `azure-management-tools.azure-arc`(phase 107)가 「성능과 기록을 모아 지켜보는 모니터링도 Azure 리소스와 같은 방식으로 한다」를 쓴다. `azure-monitor`가 온-프레미스·다른 클라우드를 지켜보는 길을 쓸 때 이 줄과 어긋나지 않게 한다(Azure Arc로 연결한다 — step 3 결과대로).
- `azure-management-tools.management-tools`가 Azure 모바일 앱으로 「리소스의 상태와 경고를 본다」를 쓴다. `azure-virtual-networking.azure-dns`가 「바꾼 기록은 활동 로그에 남겨 살핀다」를 쓴다. 둘 다 이 phase와 어긋나지 않는지 본다.
- `azure-sla-lifecycle.sla`(phase 101)가 SLA를 가르친다. Resource Health 문서가 「SLA를 어겼는지 보기 쉽다」고 적어도 이 phase는 SLA를 다시 가르치지 않는다(쓴다면 한 줄 — step 0 결과대로).
- `azure-compute.scale-sets`가 자동 크기 조정을 다룬다. Azure Monitor 문서가 자동 크기 조정을 Azure Monitor의 기능으로 들지만 이 phase는 쓰지 않는다.
- 다른 범위의 몫: Microsoft Sentinel(phase 105 `azure-security-model.sentinel`), Event Hubs 같은 데이터·이벤트 서비스(주제 지도 「넣지 않는 것」 `x-data-ai-iot`), 지원 플랜(`x-support`).

**사용자 결정(2026-10-30, 다시 묻지 마라):**

- **범위**: Microsoft Learn의 AZ-900 공식 학습 가이드(2026-07-20 기준)가 뼈대다. 가이드 밖이라도 **용어집에 있고 덤프도 묻는 현행 것**은 넣는다.
  지원이 끝난 서비스·옛 이름은 빼거나 현행으로 고친다. 덤프만 묻는 것은 넣지 않는다.
- **도식**: **주제마다 최소 하나**, 그리고 구조·흐름이 있는 개념에는 개념마다. 정의형 개념에는 없다. 비교표는 도식을 대신하지 않는다.
- 주제 지도(20개, 순서·별점·phase)는 사용자가 「고칠 것 없음」으로 확인했다.
- 사실의 기준은 **Microsoft 공식 문서**다. 덤프와 용어집은 범위·강조의 기준이자 사실 **후보**이고, 공식 문서와 다르면 공식 문서를 따르고 수정 이력에 남긴다(ADR-060).
  덤프 문항·용어집 문장은 옮기지 않는다(ADR-009, ADR-021과 같은 방식). 덤프는 시험 주관 기관의 문항이 아니므로 「자격시험은 ~로 본다」 줄을 쓰지 않는다.
- 용어는 **Microsoft 한국어 문서의 표기**를 따른다. 주제 id는 `azure-` 접두사, 별점은 덤프 출제 빈도(대표 문항 25 이상 ★★★, 13~24 ★★☆, 12 이하 없음).
- **서비스마다의 SLA 수치는 쓰지 않는다**(phase 101 설계). 가격·지역 수도 쓰지 않는다.

**이 phase에서 정한 것(설계):**

- 개념 9개, 문항 12개(`az179`~`az190`), 도식 8개, 표 하나(`MonitorFeaturesTable`). 아래 「주제와 개념 9개」.
- **덤프 `monitoring` 라벨 33문항은 모두 `azure-monitoring`이다**(나누지 않는다, ★★★). `secondary`에만 `monitoring`이 걸린 NO.100(앞 phase D117 — 문제와 답 영역이 어긋남)·NO.377(`azure-compute`)은 이 주제의 근거로 쓰지 않는다.
- **세 도구의 목록 개념을 맨 앞에 둔다.** 이 주제에서 학습자가 가장 많이 헷갈리는 것은 「무엇이 궁금할 때 어느 도구를 여는가」다(덤프 NO.80·129·149·273·404). 그래서 첫 개념 `monitoring-tools`가 세 도구(Azure Advisor·Azure Service Health·Azure Monitor)를 **무엇을 보고 무엇을 알려 주는가**로 나란히 세우고, 뒤 개념이 하나씩 자세히 쓴다(phase 107 `management-tools`와 같은 짜임).
- **이름이 같은 묶음과 보기**: Learn은 Azure Service Health를 세 보기(Azure 상태, Service Health, Resource Health)의 묶음이라고 하고, 그 가운데 하나도 Service Health라고 부른다. 한국어판은 「Azure 서비스 상태」·「Azure Service Health」·「서비스 상태」·「Service Health」를 섞어 쓴다. step 0이 묶음과 보기의 표기를 하나씩 정하고, `service-health` 본문이 **둘이 이름이 같아 헷갈린다는 것과 무엇을 가리키는지**를 한 번 밝힌다(4절).
- **Resource Health는 `service-health`에 딸린 개념으로 둔다.** 세 보기 가운데 덤프가 따로 묻고(NO.346) 상태 값과 원인(Azure 쪽인가 사용자 쪽인가)이 있어 구조가 있다. Azure 상태는 `service-health`의 목록 항목으로 둔다(개념으로 세우지 않는다).
- **Azure Monitor의 기능 넷(활동 로그, Log Analytics, Azure Monitor 경고, Application Insights)은 `azure-monitor`에 딸린 개념이다.** 활동 로그는 학습 가이드 줄에 없지만 주제 지도의 「다루는 것」에 있고 덤프가 셋(NO.60·114·452 — 누가 VM을 멈췄는가)을 묻는 현행 기능이다.
- **메트릭과 로그는 `azure-monitor` 안에서 가른다**(개념으로 세우지 않는다). Learn 단원 4가 「로그와 메트릭을 모은다」고 하고, 경고가 「메트릭 기반 또는 로그 기반」이라고 하므로 둘의 차이를 그 자리에서 한 문단으로 쓴다(step 3 결과대로).
- **수치를 쓰지 않는다** — 보존 기간(활동 로그·경고·Resource Health 기록), 기록이 나타나기까지 걸리는 시간, Resource Health가 「알 수 없음」으로 바꾸는 시간, Advisor가 조치를 알아차리는 시간. 계속 바뀌거나 학습 가이드의 줄에 없는 값이다. 경고 조건의 예(「CPU 사용률이 80%를 넘으면」 같은 기준 값)는 예시 값이라 써도 된다(「예시 값」).
- **쓰지 않는 것**: Azure Copilot·Observability Agent·Azure Monitor issues(Learn과 제품 문서의 AI 절), AIOps·동적 임계값·스마트 검색, Azure Monitor 작업 영역·Prometheus·PromQL·Grafana·통합 문서(workbooks)의 이름, OpenTelemetry의 세부, Azure Monitor 에이전트·데이터 수집 규칙·Azure Monitor 파이프라인, Network Watcher, 자동 크기 조정, 경고 처리 규칙·경고 상태(발생·해결)·사용자 응답, 작업 그룹에 넣을 수 있는 동작 목록(runbook·Logic Apps·ITSM·웹후크 — 「알림을 보내거나 자동화를 시작한다」까지), Advisor 점수·Advisor가 권장하는 서비스 목록·Advisor REST API, Azure 상태의 RSS·사후 검토(PIR)·세 시나리오, Azure Lighthouse, KQL의 문법, Log Analytics의 화면 구성, Application Insights의 화면 이름 목록(애플리케이션 맵·퍼널·코호트·프로파일러·스냅숏 디버거)·AI 에이전트 모니터링, 리소스 로그의 범주, 진단 설정을 만드는 절차, Microsoft Sentinel·Defender for Cloud의 세부, Event Hubs, 지원 플랜.
- **도식은 구조·흐름이 있는 개념 8개에 하나씩**(아래 「도식」). 붙이지 않는 개념: `log-analytics`(정의형 도구 — 표 `MonitorFeaturesTable`이 다른 기능과 나란히 둔다).
- **ADR은 필요 없다.** 쓸 출처가 모두 이미 허용된 `learn.microsoft.com`(`/training/`, `/azure/`) 안에 있다. 허용 목록 밖의 곳이 꼭 필요하면 쓰지 말고 출처 step의 summary 「사용자 확인」에 적는다.

**실행 규칙:**

- **step 하나는 30분 안에 끝나야 한다.** `scripts/execute.py`가 step을 1800초에서 끊는다. 그래서 step은 **브라우저 화면 실측(개발 서버·headless Chrome·CDP)을 하지 않는다** —
  phase가 끝난 뒤 메인 세션이 모든 도식을 한꺼번에 실측한다. 시간을 아끼려고 검증 명령을 건너뛰지는 마라.
- 「주제마다 도식 하나 이상」을 `src/components/diagrams/azureDiagramCoverage.test.ts`가 지킨다. 그래서 **주제를 만드는 step 1이 그 주제의 첫 도식도 함께** 만든다.
  저장소의 Stop 훅(`scripts/hooks/codex-verify-gate.sh`)은 테스트가 실패한 상태로 step을 끝내지 못하게 한다.
- **진행 안내 문장을 쓰지 않는다.** 「다음 개념에서 다룬다」, 「뒤에서 자세히 다룬다」처럼 글의 진행만 알리는 말은 `src/data/azure/data.test.ts`의 진행 안내 테스트가 막는다.
  뒤 개념이나 다른 주제가 자세히 다룰 낱말이 지금 필요하면 그 자리에서 한 줄로 풀고 넘어간다. 「앞 개념에서 본 것처럼」 같은 되짚기는 써도 된다.
- **이 Mac의 Python은 HTTPS 인증서를 찾지 못한다.** 공식 문서를 받을 때 `CERTIFICATE_VERIFY_FAILED`가 나면 명령 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`을 붙인다. 이것은 인터넷 연결 문제가 아니다 — blocked로 멈추지 마라.


## step 여섯 개

| step | 이름 | 하는 일 |
|---|---|---|
| 0 | `advisor-health-sources` | 개념 1~4가 쓸 사실을 공식 문서로 확인해 `official.md`·`corrections.md`에 더한다 |
| 1 | `monitoring-tools-advisor` | 주제를 만들고 개념 1·2의 글·문항과 도식 `MonitoringToolsDiagram`·`AdvisorRecommendationDiagram` |
| 2 | `service-health` | 개념 3·4의 글·문항과 도식 `HealthViewsDiagram`·`ResourceHealthDiagram` |
| 3 | `monitor-sources` | 개념 5~9가 쓸 사실을 확인해 두 문서에 더한다 |
| 4 | `azure-monitor-activity-log` | 개념 5·6의 글·문항과 도식 `MonitorDataDiagram`·`ActivityLogDiagram` |
| 5 | `analytics-alerts-insights` | 개념 7·8·9의 글·문항과 도식 `AlertRuleDiagram`·`AppInsightsDiagram`, 표 `MonitorFeaturesTable` |

출처 step을 둘로 나눈 것은 덤프 33문항과 문서를 한 step에서 다 보면 30분을 넘길 수 있어서다. step 0은 Advisor·Service Health 쪽 18문항, step 3은 Azure Monitor 쪽 15문항을 본다(「출처 step(0·3)의 공통 형식」).

## 주제와 개념 9개

주제 객체(`src/data/azure/topics.json`의 기존 열아홉 주제 뒤에):

```json
{ "id": "azure-monitoring", "title": "모니터링", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }
```

별점: 주제 지도의 대표 문항 수가 33이다(★★★). `data.test.ts`가 이 값을 본다.

개념 id는 `azure-monitoring.<슬러그>`다. 표의 순서·슬러그·`parentId`를 바꾸지 않는다(바꿔야 할 이유가 있으면 바꾸지 말고 summary에 적는다).
**`name`은 출처 step(0·3)이 확인한 Microsoft 한국어 문서의 표기를 따른다** — 표의 이름은 잠정이다. 한국어판 안에서도 표기가 섞인 것은 출처 step이 하나로 정하고 근거를 남긴다.
`parentId` 열의 값은 같은 주제의 슬러그다 — JSON에는 `azure-monitoring.service-health`처럼 전체 id로 쓴다. 딸린 개념은 부모 바로 뒤에 이어 두고, 부모는 머리 개념이어야 한다(ADR-041 — 딸린 개념 아래에 또 딸리지 않는다).
「다룰 것」은 범위다. 문장은 직접 쓰고, 사실은 아래 「출처」대로 가져온다. 「step N 결과」라고 적힌 사실은 그 step의 summary와 출처 문서에 적힌 처리를 따른다 —
확인되지 않았으면 쓰지 않는다. 「덤프」 뒤의 `NO.`는 덤프 문항 번호다(`docs/source/azure/dump-topics.tsv`·`raw/dump/dump.md`).

### `azure-monitoring` — 모니터링 (공식 학습 가이드 「Describe monitoring tools in Azure」)

순서는 무엇으로 지켜보는가(세 도구) → 무엇을 고치면 나아지는가(Azure Advisor) → Azure 쪽에 문제가 있는가(Azure Service Health, Resource Health) → 내 리소스와 앱에서 무슨 일이 일어나는가(Azure Monitor와 그 기능 넷 — 활동 로그, Log Analytics, Azure Monitor 경고, Application Insights).
학습자가 가장 많이 헷갈리는 것은 **어느 도구를 여는가**(권장 사항을 받는가 / Azure 자체의 장애와 유지 관리를 아는가 / 내 리소스가 낸 데이터를 모아 보는가), **Azure 상태와 Service Health**(누구나 보는 전체 상황 / 로그인한 사람이 쓰는 서비스·지역만), **Service Health와 Resource Health**(서비스·지역 / 리소스 하나), **활동 로그와 리소스 안의 기록**(누가 리소스를 만들고 바꾸고 멈췄는가 / 리소스 안에서 일어난 일), **Advisor와 비용 분석**(줄일 방법을 권한다 / 쓴 비용을 보여 준다)이다. 마지막 개념의 표 `MonitorFeaturesTable`이 Azure Monitor의 기능 넷을 나란히 둔다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 1 | `monitoring-tools` | Azure 모니터링 도구 | — | 1 | **목록 개념** — 이 주제의 첫 개념이라 **모니터링**(리소스와 앱의 상태를 계속 지켜보며 확인하는 일)과 **리소스**·**구독**을 짧게 푼다. 소개 문단(지켜볼 때 궁금한 것이 셋으로 갈린다 — Azure 쪽에 문제가 있는가, 설정을 어떻게 고치면 나아지는가, 내 리소스와 앱에서 무슨 일이 일어나는가) 뒤 항목 셋: Azure Advisor, Azure Service Health, Azure Monitor(같은 꼴로 — 무엇을 보고 무엇을 알려 주는가, 한두 줄씩). 세 도구 모두 Azure 포털에서 연다(step 0 결과대로). **이 개념에 도식 `MonitoringToolsDiagram`을 붙인다**. 덤프: NO.80, 149 |
| 2 | `azure-advisor` | Azure Advisor | — | 1 | **목록 개념** — 리소스의 설정과 사용 기록을 분석해 **권장 사항**을 주는 서비스. 다섯 범주를 항목으로(이름은 step 0 결과대로 — 안정성·보안·성능·비용·운영 우수성, 같은 꼴로 무엇을 찾아 주는가 한 줄씩). 권장 사항마다 할 일이 붙어 있고, 담당자가 실행하거나 미루거나(연기) 해제한다 — **Advisor가 리소스를 스스로 바꾸지 않는다**(step 0 결과대로). 모든 구독의 권장 사항을 한 대시보드에서 보고 구독·리소스 그룹·서비스로 거른다, 새 권장 사항이 생기면 알림을 받는다. 비용 범주의 예(사용률이 낮은 VM — step 0 결과대로), 보안 범주는 Defender for Cloud의 권장 사항을 함께 보여 준다(한 줄). **비용 분석과 무엇이 다른가**(쓴 비용을 보여 준다 / 줄일 방법을 권한다 — 4절, 한 줄). **이 개념에 도식 `AdvisorRecommendationDiagram`을 붙인다**. 덤프: NO.107, 120, 206, 216, 245, 393, 425, 501, 503 |
| 3 | `service-health` | Azure Service Health | — | 2 | **목록 개념** — Azure 자체의 상태를 알려 주는 세 보기의 묶음. 넓은 데서 좁은 데로 항목 셋: **Azure 상태**(모든 지역의 모든 서비스, 로그인하지 않아도 누구나 본다, 넓게 퍼진 장애만 — step 0 결과대로), **Service Health**(로그인한 사람의 구독이 쓰는 서비스·지역만 — 장애, 계획된 유지 관리, 상태 권고), **Resource Health**(리소스 하나 — 한 줄, 딸린 개념이 자세히). 항목 뒤 문단: 묶음과 가운데 보기의 이름이 같아 헷갈린다는 것(무엇을 가리키는가 — 4절), Service Health에서 **경고**를 설정하면 내 서비스에 영향이 있는 일을 이메일 같은 길로 받는다(작업 그룹을 한 줄로 푼다 — step 0 결과대로), 지난 일의 기록이 남아 되풀이되는 문제를 본다. **Azure Monitor와 무엇이 다른가**(Azure 쪽의 문제 / 내 리소스가 낸 데이터 — 4절, 한 줄). **이 개념에 도식 `HealthViewsDiagram`을 붙인다**. 덤프: NO.129, 168, 218, 223, 374, 491 |
| 4 | `resource-health` | Resource Health | `service-health` | 2 | VM 같은 리소스 하나가 지금 정상인지, 지난 기록은 어떤지 알려 준다. 상태 값(사용 가능·사용할 수 없음·알 수 없음·저하됨 — 이름은 step 0 결과대로, 같은 꼴로 한 줄씩). **사용할 수 없을 때 원인이 Azure 쪽인가 사용자 쪽인가** — Azure 기반의 일(계획된 유지 관리, 예상하지 못한 호스트 재부팅)과 사용자의 작업(담당자가 VM을 중지함)을 가른다(step 0 결과대로). Azure 쪽 문제면 Microsoft가 무엇을 하고 있는지와 사용자가 할 수 있는 일을 알려 주고 지원에 연락하는 길을 준다(step 0 결과대로). 리소스 상태가 바뀌면 경고를 받는다(한 줄). **Service Health와 무엇이 다른가**(서비스·지역 / 리소스 하나 — 4절). **이 개념에 도식 `ResourceHealthDiagram`을 붙인다**. 덤프: NO.346 |
| 5 | `azure-monitor` | Azure Monitor | — | 4 | 리소스와 앱에서 데이터를 모으고, 분석하고, 그 결과에 따라 대응하는 서비스. 데이터가 나오는 곳(앱, 운영 체제, 네트워크 — Learn 단원 4), Azure뿐 아니라 **온-프레미스**(회사 건물 안의 데이터 센터)와 **다중 클라우드**도 지켜본다(Azure Arc로 연결 — step 3 결과대로, 앞 주제의 `azure-arc` 줄과 어긋나지 않게). 모은 데이터는 한곳에 두고 대시보드·쿼리·경고로 쓴다. **메트릭과 로그**(정해진 간격으로 잰 수치 — CPU 사용률 / 일어난 일을 적은 기록 — 오류 기록, step 3 결과대로 — 4절). 딸린 기능 넷을 한 줄씩 이름으로 든다(목록으로 그리지 않는다 — 각 개념이 자세히). **이 개념에 도식 `MonitorDataDiagram`을 붙인다**. 덤프: NO.246, 273, 312, 319, 332, 404, 1 |
| 6 | `activity-log` | 활동 로그 | `azure-monitor` | 4 | 구독 안의 리소스에 한 **관리 작업**(만들기, 설정 바꾸기, 지우기, VM 중지 같은 것 — 읽기는 대개 남지 않는다, step 3 결과대로)을 누가·언제·무엇을 했는지 적은 기록. 따로 설정하지 않아도 남고, 사용자가 고치거나 지울 수 없다(step 3 결과대로). 구독·리소스 그룹·리소스 하나 단위로 본다. **리소스 안에서 일어난 일과 무엇이 다른가** — VM 안의 앱이 데이터베이스에 보낸 요청 같은 것은 **리소스 로그**에 남고, 리소스 로그는 **진단 설정**(로그를 어디로 보낼지 정해 두는 것 — 한 줄로 푼다)을 해야 모인다(4절, step 3 결과대로). 오래 두려면 다른 곳으로 보내 둔다(한 줄, 수치 없이). **이 개념에 도식 `ActivityLogDiagram`을 붙인다**. 덤프: NO.60, 114, 452 |
| 7 | `log-analytics` | Log Analytics | `azure-monitor` | 5 | Azure 포털에서 Azure Monitor가 모은 로그에 **쿼리**(조건을 적어 원하는 기록만 찾아 달라는 요청 — 한 줄로 푼다)를 작성하고 실행하는 도구. 로그는 **Log Analytics 작업 영역**(로그를 모아 두는 곳 — 표기는 step 3 결과대로)에 모인다. 간단한 거르기(지난 한 시간의 오류 모두)부터 시간에 따른 추세를 차트로 보는 분석까지. 쿼리 언어 이름은 한 번만(KQL — 표기는 step 3 결과대로, 문법은 쓰지 않는다), 쿼리를 쓰지 않고 눌러서 거르는 방식이 있다(step 3 결과대로 한 줄). 로그 경고가 쓰는 쿼리도 여기서 쓰고 시험한다(한 줄). 도식 없음 — 정의형. 덤프: NO.85, 437 |
| 8 | `monitor-alerts` | Azure Monitor 경고 | `azure-monitor` | 5 | 정해 둔 조건이 맞으면 알려 주는 기능. **경고 규칙**(어느 리소스의 무엇을 보고, 어떤 조건이면 경고를 낼지)과 **작업 그룹**(경고가 나면 누구에게 어떻게 알리고 무엇을 실행할지 — 이메일·문자 메시지 같은 알림, 자동화 시작)을 따로 만든다. 경고의 종류(메트릭 경고 — CPU 사용률이 기준을 넘음 / 로그 검색 경고 — 여러 리소스의 로그에 특정 오류가 나타남 / 활동 로그 경고 — VM이 중지됨, Service Health·Resource Health의 경고도 이 종류 — 이름은 step 3 결과대로). 작업 그룹 하나를 Azure Monitor·Service Health·Azure Advisor가 함께 쓴다. **경고 규칙과 작업 그룹은 무엇이 다른가**(언제 / 누구에게·무엇을 — 4절). 예산 경고(앞 주제)와 이름이 비슷해도 다른 것(한 줄 — step 3 결과대로). **이 개념에 도식 `AlertRuleDiagram`을 붙인다**. 덤프: NO.200, 246, 312, 319 |
| 9 | `application-insights` | Application Insights | `azure-monitor` | 5 | 웹 앱의 성능과 사용을 지켜보는 Azure Monitor의 기능(**애플리케이션 성능 모니터링**(APM)을 한 줄로 푼다). 앱이 Azure·온-프레미스·다른 클라우드 어디서 실행되든 쓴다. 앱 코드에 SDK(앱에 넣어 쓰는 개발 도구 묶음 — 한 줄로 푼다)를 넣거나, 코드를 바꾸지 않고 에이전트를 켠다(step 3 결과대로). 보는 것 — 요청 수·응답 시간·실패율, 앱이 부르는 다른 서비스(의존성 — 한 줄로 푼다)의 호출과 성능, 페이지 로드 시간·사용자 수·세션, 서버의 CPU·메모리·네트워크 사용량. **가용성 테스트**(사용자가 적을 때도 앱이 응답하는지 일부러 요청을 보내 확인한다). **Azure Monitor의 다른 기능과 무엇이 다른가**(앱 안을 본다 — 4절, 표가 받는다). **이 개념에 도식 `AppInsightsDiagram`과 표 `MonitorFeaturesTable`을 붙인다**. 덤프: NO.25, 384 |

**문항 수**: 12개, `az179`~`az190`.
문항은 개념 순서대로 `questions.json` 끝에 붙인다. step마다 맡는 id와 형식은 아래와 같다 — 균형(「문항」 9항)을 step마다 지키도록 형식과 정답 방향을 미리 나눴다. **형식이나 답의 방향을 바꾸면 그 step 끝에서 균형이 깨지지 않는지 세어 보고 summary에 적는다.**

| step | id | 개념별 수 | 형식(예/아니요는 정답, 4지선다는 `answerIndex`) | step 끝의 예·아니요 / 정답 위치 |
|---|---|---|---|---|
| 1 | `az179`~`az181` | 1 하나, 2 둘 | 179 위치 0 / 180 아니요 / 181 위치 1 | 45·45 / 23·23·22·23 |
| 2 | `az182`~`az184` | 3 둘, 4 하나 | 182 위치 2 / 183 예 / 184 아니요 | 46·46 / 23·23·23·23 |
| 4 | `az185`~`az187` | 5 하나, 6 둘 | 185 예 / 186 위치 3 / 187 아니요 | 47·47 / 23·23·23·24 |
| 5 | `az188`~`az190` | 7 하나, 8 하나, 9 하나 | 188 위치 0 / 189 위치 1 / 190 예 | 48·47 / 24·24·23·24 |

이대로면 phase 끝에 문항 190개, 예 48·아니요 47, 정답 위치 24/24/23/24다.

**예시 값 — 주제 전체가 함께 쓴다:**

- **조직 이름**은 「회사 A」·「회사 B」처럼, 팀은 「운영 팀」·「개발 팀」처럼 이름표로 쓴다. 실제 회사 이름을 예로 들지 않는다.
- **리소스 이름표**는 「VM 1」·「리소스 그룹 1」·「구독 1」·「웹 앱 1」처럼, 지역은 「지역 A」·「지역 B」처럼 쓴다. 회사 건물 안의 서버는 「회사 데이터 센터의 서버」처럼 하는 말로.
- **경고 조건의 예**는 「CPU 사용률이 80%를 넘으면」처럼 기준 값을 예로 들 수 있다 — 사실 주장이 아니라 담당자가 정하는 값이라는 것이 문장에서 읽히게 쓴다. 로그의 예는 「오류 기록」처럼 종류로 쓰고 실제 로그 글자를 만들지 않는다.
- **권장 사항의 예**는 step 0이 확인한 것(비용 범주의 사용률이 낮은 VM 같은 것)만 쓴다. 권장 사항의 실제 제목 글자를 옮기지 않는다.
- **주소·명령·쿼리**는 쓰지 않는다(Azure 상태 페이지의 주소, `az monitor` 명령, KQL 쿼리). 꼭 필요하면 개념 본문에서만 백틱으로 쓴다 — 백틱을 코드로 그리는 것은 개념 본문의 `EmphasizedText`뿐이고, 문항(문제문·보기·해설)·도식·표는 글자를 그대로 그려 백틱이 화면에 보인다.
- **서비스 이름**은 Microsoft 한국어 문서 표기로 쓰고, 영문 이름이 다르면 처음 나올 때 괄호에 적는다(출처 step이 표기를 확인한다).

도식은 본문에 나온 예시 값만 쓴다(ADR-038) — 그러니 이 값들을 도식에 쓰려면 그 개념의 본문에 먼저 쓴다.

## 출처

- 사실은 `docs/source/azure/official.md`(Microsoft 공식 문서에서 확인한 사실과 URL)에서만 가져온다. 출처 step(0·3)이 그 개념들에 필요한 사실을 확인해 남긴다. 그 summary가 개념마다 무엇을 쓰고 무엇을 쓰지 않는지 적는다.
- 덤프·용어집의 주장이 `docs/source/azure/corrections.md`에 걸려 있으면 **고친 쪽**을 쓴다. 덤프·용어집에만 있고 공식 문서가 말하지 않는 주장은 쓰지 않는다.
- 개념 step에서 그 밖의 사실이 필요하면, 허용한 출처(`docs/source/azure/CLAUDE.md` 「허용하는 출처」)를 실제로 열어 확인하고 `official.md`에 URL과 「쓰인 곳」을 적은 뒤 쓴다.
  받은 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다. 인증서 오류는 「배경」의 `SSL_CERT_FILE`).
  확인하지 못한 사실은 쓰지 않는다. 블로그·Microsoft Q&A·Tech Community·위키백과·자격증 교재·덤프 사이트는 쓰지 않는다.
- **`official.md`의 「쓰인 곳」**: 출처 step은 아직 개념이 없으므로 「쓰일 곳」으로 적는다. 그 개념을 만든 step이 자기 개념 id가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.
- **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 덤프의 문제문·보기·해설, 용어집 설명, 공식 문서(특히 한국어판)의 문장을 옮기지 않는다. `check-verbatim --subject azure`는 하한선일 뿐이다.
- 덤프 문항을 그대로 문항으로 만들지 않는다 — 덤프가 같은 사실을 물어도 상황과 문장은 직접 만든다(ADR-021과 같은 이유).

설계 세션이 받아 둔 공식 문서(`docs/source/azure/raw/official/`, 영문판과 한국어판 `ko-…`):

- Learn 「Describe monitoring tools in Azure」 — `learn-describe-monitoring-tools-azure-{1-introduction, 2-describe-purpose-of-azure-advisor, 3-describe-azure-service-health, 4-describe-azure-monitor, 6-summary}.md`와 `ko-` 판. 단원이 짧다 — 사실의 대부분은 아래 제품 문서에서 확인한다.
- 제품 문서(설계 때 받음, 모두 `ko-` 판도): `docs-advisor-overview.md`, `docs-service-health-overview.md`, `docs-service-health-azure-status-overview.md`, `docs-service-health-resource-health-overview.md`, `docs-azure-monitor-overview.md`, `docs-azure-monitor-log-analytics-overview.md`, `docs-azure-monitor-alerts-overview.md`, `docs-azure-monitor-action-groups.md`, `docs-azure-monitor-app-insights-overview.md`.
- 앞 phase가 받음: `docs-azure-monitor-platform-activity-log.md`(`ko-`도), `docs-advisor-cost-recommendations.md`, `docs-cost-management-alerts.md`(`ko-`도), `docs-azure-monitor-autoscale-overview.md`(쓰지 않는다).
- AZ-900 학습 가이드 — `az-900-study-guide.md`.

설계 때 열어 보지 않았지만 출처 step이 받을 곳(주소는 출발점이고, 옮겨졌으면 같은 내용의 현행 쪽을 찾는다). 앞에 `learn.microsoft.com/en-us/`를 붙인다:
step 0 — `azure/advisor/advisor-get-started`(또는 현행 포털 기본 쪽), `azure/advisor/advisor-alerts-portal`(새 권장 사항 알림), `azure/advisor/advisor-security-recommendations`, `azure/advisor/advisor-reference-reliability-recommendations`·`advisor-performance-recommendations`·`advisor-reference-operational-excellence-recommendations`(범주마다 무엇을 찾는가 — 목록을 옮기지 않는다), `azure/service-health/service-health-overview`(Service Health 보기의 이벤트 종류), `azure/service-health/alerts-activity-log-service-notifications-portal`, `azure/service-health/resource-health-alert-monitor-guide`(또는 현행 Resource Health 경고 쪽), `azure/service-health/resource-health-faq`.
step 3 — `azure/azure-monitor/data-platform`(또는 현행 데이터 플랫폼 쪽 — 메트릭과 로그), `azure/azure-monitor/metrics/data-platform-metrics`, `azure/azure-monitor/logs/data-platform-logs`, `azure/azure-monitor/logs/log-analytics-workspace-overview`, `azure/azure-monitor/alerts/alerts-types`, `azure/azure-monitor/platform/resource-logs`, `azure/azure-monitor/platform/diagnostic-settings`, `azure/azure-monitor/app/availability`(가용성 테스트), `azure/azure-monitor/app/codeless-overview`(또는 현행 자동 계측 쪽 — 코드를 바꾸지 않는 길), `azure/azure-monitor/fundamentals/multicloud`(또는 현행 하이브리드 쪽), `azure/azure-arc/servers/overview`(앞 phase가 받았으면 그것).

## 글 — `docs/WRITING_GUIDE.md`를 따른다(ADR-056, ADR-060)

- `summary`는 WRITING_GUIDE 2절 — 처음 보는 사람이 일상 말로 「무엇이고 무슨 역할인지」 알게 하는 한 문장. 다른 전문용어를 알아야 이해되면 안 되고, 제목 낱말을 되풀이하는 순환 정의, 숫자·분류를 넣지 않는다.
- `paragraphs`는 3절의 흐름(개념 → 원리 → 예시 → 특징)을 필요한 만큼. 누가·무엇을·어디서 어디로를 빠뜨리지 않는다. 같은 말을 되풀이하지 않는다.
  헷갈리는 짝은 4절대로 무엇이 다르고 왜 나눠 부르는지를 말한다 — 이 phase의 짝: Azure Advisor와 Azure Service Health와 Azure Monitor, Azure Advisor와 비용 분석, Azure Advisor와 Defender for Cloud(한 줄), Azure Service Health(묶음)와 Service Health(보기), Azure 상태와 Service Health, Service Health와 Resource Health, Resource Health의 Azure 쪽 원인과 사용자 쪽 원인, Azure Service Health와 Azure Monitor, 메트릭과 로그, 활동 로그와 리소스 로그, 경고 규칙과 작업 그룹, Azure Monitor 경고와 예산 경고, Application Insights와 Azure Monitor의 다른 기능.
- **이 주제 화면만 읽고 뜻이 서야 한다.** 학습자는 주제 목록에서 아무 주제로나 바로 들어오므로, 다른 주제에 정의가 있다는 것은 도움이 되지 않는다.
  이 주제 안에서 처음 쓰는 낱말(리소스, 구독, 리소스 그룹, VM, 지역, Azure 포털, 대시보드, 쿼리, 작업 그룹, 온-프레미스, 다중 클라우드, Azure Arc, 웹 앱, SDK, Defender for Cloud, 비용 분석 등)은 그 자리에서 짧게 푼다. 앞 phase 주제가 푼 낱말도 이 주제에서는 다시 푼다.
  앞 step이 같은 주제에서 이미 푼 낱말은 다시 풀지 않는다 — 쓰기 전에 그 주제의 앞 개념을 읽는다. 도식의 라벨·곁말·캡션과 표의 칸도 화면의 글이다.
- **진행 안내 문장을 쓰지 않는다**(「배경」). 다른 주제나 뒤 개념을 가리키는 말이 필요하면 그 낱말을 그 자리에서 한 줄로 풀고, 「~에서 다룬다」·「~에서 자세히」·「다음 개념의」·「(다음 개념)」을 붙이지 않는다.
- 비유는 이해를 돕는 데만 쓰고, 실제 동작과 다르면 그 자리에서 밝힌다. 비유로 사실을 대신하지 않는다.
- `name`은 명사구다(ADR-030 기준 1). **굵은 글씨(`**`)는 목록 항목의 이름에만** 쓴다(ADR-055와 같은 규칙, ADR-060). 목록 개념은 소개 문단 하나 뒤에 `- **한국어 이름**(English name)은 …` 꼴 항목을 두고, 항목은 혼자 서지 않는다(ADR-046). 항목 뒤에 문단을 이어 써도 된다(phase 107 `management-tools`·`purview`가 선례).
  `EmphasizedText`는 `**…**` 안의 백틱을 코드로 그리지 않으므로 굵은 이름 안에 백틱을 넣지 않는다.
- 관용 표현(`돌린다`·`띄운다`·`태운다`·`물린다`)을 쓰지 않고 하는 일을 그대로 쓴다(ADR-030 기준 5). 평서문 「~다」로 쓴다. 「A vs B」 제목은 쓰지 않는다. 쿼리를 「돌린다」고 쓰지 말고 「실행한다」고 쓴다.
- 공식 문서의 마케팅 어조(「개인 맞춤형 모범 사례 가이드」, 「통합된 관찰 가능성」, 「포괄적인」, 「사전 대응적으로」를 꾸밈말로)를 옮기지 않는다 — 무엇이 어떻게 되는지를 쓴다.

## 문항 — WRITING_GUIDE 「객관식 문제의 문장과 선택지 구성 원칙」과 ADR-054·ADR-030

가장 중요한 원칙: **질문은 쉽게 이해할 수 있도록, 선택은 충분한 생각이 필요하도록.**

1. **정의에서 이름만 지운 「무엇인가?」 꼴을 내지 않는다.** 개념에 맞는 방식 하나를 고른다 — 개념 확인, 원리 이해, 상황 적용, 개념 비교, 원인과 결과. 고른 방식과 이유를 summary에 적는다.
2. **사람이 사람에게 묻듯 쓴다.** 소리 내어 읽어 어색하거나 한 번에 이해되지 않으면 다시 쓴다. 쉼표로 조건을 줄줄이 잇는 압축문을 쓰지 않는다.
3. 무엇을 묻는지는 첫 읽기에 분명하고, 어려움은 보기를 고르는 데서 나온다. 문제문을 비틀어 난이도를 만들지 않는다.
4. 보기는 기술적으로 갈리고 정답은 하나다. 비슷한 개념을 보기로 둘 때는 그 차이를 판단할 조건을 문제문에 준다. 오답은 문제문이 묻는 범주 안에서, 실제로 헷갈리는 것에서 고른다(ADR-030 기준 4).
   정답의 이름이나 그 일부를 문제문에 쓰지 않는다(기준 3). 보기 넷은 서로 다르다.
   **두 개념이 함께 맞게 읽힐 수 있는 상황을 만들지 않는다** — 이 phase에서 특히:
   「VM에 문제가 생긴 것 같다」는 Resource Health에도 Azure Monitor에도 Service Health에도 맞다 — Azure 쪽의 문제인지 알고 싶은가, 리소스 하나의 상태인가, 리소스가 낸 수치·기록을 보고 싶은가를 준다.
   「누가 VM을 멈췄는지 알고 싶다」는 활동 로그가 답이지만, Log Analytics도 활동 로그를 작업 영역으로 보내 두면 쿼리할 수 있다 — Log Analytics를 오답으로 두지 않거나, 따로 설정하지 않았다는 조건을 준다(step 3 결과대로).
   「장애를 알고 싶다」는 Azure 상태에도 Service Health에도 맞다 — 내 구독이 쓰는 서비스·지역만 보고 싶은가, 로그인하지 않고 전체를 보는가, 계획된 유지 관리까지인가를 준다.
   「경고를 받고 싶다」는 Azure Monitor 경고·Service Health 경고·Advisor 알림·예산 경고에 모두 맞다 — 무엇이 일어났을 때인가(수치가 기준을 넘음 / Azure 쪽 장애·유지 관리 / 새 권장 사항 / 쓴 비용)를 준다.
   「비용을 줄이고 싶다」는 Advisor에도 비용 분석에도 맞다 — 줄일 방법을 권해 받는가, 쓴 비용을 나눠 보는가를 준다.
   「앱이 느린지 알고 싶다」는 Application Insights에도 메트릭에도 맞다 — 앱 안의 요청 응답 시간·페이지 로드 시간인가, VM의 CPU 사용률인가를 준다.
5. 판단에 쓰이지 않는 정보(전문용어·수치·조건·부정문)를 늘어놓지 않는다. 판단에 필요한 조건은 남긴다.
6. **형식(ADR-054)**: 흔히 오해하는 것을 바로잡으면 예/아니요, 비슷한 개념을 구별하거나 상황에 맞는 것을 고르면 4지선다. 같은 범주의 그럴듯한 오답 셋을 출처 안에서 쓸 수 없으면 예/아니요.
   예/아니요는 주장 하나, 이중 부정·「항상」「절대」 금지, 「~인가요?」「~나요?」로 끝난다. **아니요 문항의 해설은 무엇이 틀렸는지에서 그치지 않고 맞는 사실을 가르친다.**
   예/아니요의 주장은 맞는 쪽으로도 틀린 쪽으로도 세울 수 있다 — 아래 균형을 맞추려고 주장의 방향을 고른다. 부정형으로 묻지 않는다(「볼 수 없나요?」 대신 「볼 수 있나요?」).
7. **문항은 풀면서 배우게 쓴다.** 문항은 섞여 나오고 랜덤 세트는 일부만 뽑으므로 혼자 읽혀야 한다. 문제문이 이 주제 밖의 낱말을 풀이 없이 전제하지 않는다(기준 5).
   상황에 쓰는 이름(「회사 A」)·숫자는 사실 주장이 아니어야 하고, 그 상황의 정답은 출처의 사실로 정해져야 한다. 문항 상황은 본문 예와 다르게 만들어 본문 문장을 외워서 풀리지 않게 한다.
8. **해설은 187자 이상**이고 그 개념을 가르치는 글이다(ADR-026·027). 4지선다는 정답이 왜 맞는지와 오답 셋이 각각 왜 아닌지를 담는다. 약어는 해설마다 처음 쓸 때 풀어 쓴다.
   같은 말을 늘려 길이를 채우지 않는다. 해설의 사실은 개념 본문이나 `official.md`에 있는 것이다.
9. **균형 — step이 끝났을 때 과목 전체에서**: 예/아니요의 예와 아니요 수 차이 **1 이하**, 4지선다의 정답 위치(`answerIndex` 0~3) 수의 최대·최소 차이 **2 이하**.
   phase 108 시작 때는 문항 178개, 예 45·아니요 44, 정답 위치 22/22/22/23이다. step마다의 형식은 「주제와 개념 9개」의 표대로다.
10. 한 문항은 개념 하나만 묻는다(ADR-030 기준 2). 같은 개념의 두 문항은 서로 다른 것을 묻는다. 앞 phase의 문항(특히 `az023` 클라우드에서의 관리, `az127` Defender for Cloud의 규정 준수, `az142`~`az147` 비용 도구와 비용 경고, `az165` 모바일 앱)과 같은 것을 묻지 않는다.
11. 답을 흘리는 꼴을 피한다 — 놀람을 담아 답의 방향을 알리는 꼴(「…인데도 …되나요?」), 문제문의 「…만으로」, 「…뒤에도」, 「…도」(예: 「다른 클라우드의 앱도 지켜볼 수 있나요?」), 「별도로 확인하지 않아도」처럼 답의 방향을 암시하는 말, 정답 보기만 문제문의 낱말을 되풀이하는 것, **오답 셋만 같은 말로 시작해 정답만 꼴이 다른 것**(phase 103 `az056` 등), **보기 이름만으로 셋이 빠지는 것**(phase 106 `az150`), **문제문의 말이 오답 셋을 범주로 지워 주는 것**(phase 107 `az153`), **정답 보기만 가장 긴 것**(phase 107 `az176`).
12. 덤프 문항의 문장·보기 구성을 옮기지 않는다. 덤프가 되풀이하는 꼴(「다음 진술이 맞으면 예」 세 개 묶음, 「해결책: …, 목표를 이루나?」 연작, 블레이드 고르기, 짝짓기, 둘 고르기)도 쓰지 않는다 — 앱의 형식은 4지선다와 예/아니요 하나씩이다.

검수 — 문항마다 WRITING_GUIDE 객관식 7항의 여섯 질문으로 다시 읽고, 보기마다 「이것이 정답이라고 우길 수 있는가」를 따진다. 문제문만 읽고 보기를 보지 않은 채 정답 글자를 짐작할 수 있지 않은지도 본다.

## 도식 — 구조·흐름이 있는 개념 8개에 하나씩, 표 하나

선례는 앞 phase의 Azure 도식(`ToolAccessDiagram`·`PolicyCheckDiagram`·`LockInheritanceDiagram`·`ResourceManagerDiagram`·`BudgetAlertDiagram`·`TagInheritanceDiagram`과 그 `.test.tsx`, `src/data/azure/visuals/*.json`)이다. 표는 `azureGovernanceTables.tsx`와 그 테스트를 본다.
규칙의 근거는 UI_GUIDE 「도식 전용 색상」·「도식」 절 전체, ADR-036·037·038·047·048, `src/components/diagrams/CLAUDE.md`다.
사용자 미리보기 승인을 받지 않고 **step이 좌표를 설계한다.** 그래서 기계 검사를 모두 통과시키고 설계를 summary에 남긴다.

| 도식 | JSON 키 | 개념 | step | 요지 |
|---|---|---|---|---|
| `MonitoringToolsDiagram` | `monitoring-tools` | `azure-monitoring.monitoring-tools` | 1 | 궁금한 것 셋 → 여는 도구 셋 — Azure 쪽의 문제 / 고칠 것 / 내 리소스와 앱의 데이터 |
| `AdvisorRecommendationDiagram` | `advisor-recommendation` | `azure-monitoring.azure-advisor` | 1 | 리소스를 분석한 권장 사항이 범주별로 나오고, 담당자가 실행·연기·해제한다 |
| `HealthViewsDiagram` | `health-views` | `azure-monitoring.service-health` | 2 | 넓은 데서 좁은 데로 — 모든 서비스·지역 / 내가 쓰는 서비스·지역 / 리소스 하나 |
| `ResourceHealthDiagram` | `resource-health` | `azure-monitoring.resource-health` | 2 | 같은 「사용할 수 없음」이라도 원인이 Azure 쪽인가 사용자 쪽인가 |
| `MonitorDataDiagram` | `monitor-data` | `azure-monitoring.azure-monitor` | 4 | 데이터가 나오는 곳 → 메트릭·로그로 모인다 → 분석·경고·대시보드 |
| `ActivityLogDiagram` | `activity-log` | `azure-monitoring.activity-log` | 4 | 리소스에 한 관리 작업은 활동 로그에, 리소스 안의 일은 리소스 로그에 |
| `AlertRuleDiagram` | `alert-rule` | `azure-monitoring.monitor-alerts` | 5 | 신호 → 경고 규칙의 조건 → 경고 → 작업 그룹 → 알림·자동화 |
| `AppInsightsDiagram` | `app-insights` | `azure-monitoring.application-insights` | 5 | 사용자의 요청과 가용성 테스트가 웹 앱에 닿고, Application Insights가 응답 시간·실패를 본다 |

표 — 파일 `src/components/diagrams/azureMonitoringTables.tsx`:

| 표 | JSON `tables` 키 | 개념 | step | 열 |
|---|---|---|---|---|
| `MonitorFeaturesTable` | `monitor-features` | `azure-monitoring.application-insights` | 5 | 기능 · 보는 것 · 이럴 때 연다 |

- **파일**: 컴포넌트는 `src/components/diagrams/<이름>Diagram.tsx`(이름이 `Diagram.tsx`로 끝나야 교차 검사와 커버리지 테스트가 도식으로 본다), 테스트는 같은 이름의 `.test.tsx`.
  문구(물음형 제목 `question`·노드 라벨·그룹 라벨·곁말·캡션·`idleCaption`·`legend`·figure `label`·`svgLabel`·시나리오·`sources`)는 `src/data/azure/visuals/azure-monitoring.json`의 `diagrams["<키>"]`에 둔다.
  `glossary`는 빈 배열이다(ADR-037). 도식 이름과 키는 위 표대로다 — 이미 있는 이름과 겹치지 않는 것을 골라 두었다(AWS의 `Route53HealthDiagram`·Azure의 `BudgetAlertDiagram`과 다르다).
- **표**: `azureMonitoringTables.tsx`에 함수를 두고, 테스트는 같은 이름의 `.test.tsx`. `azureGovernanceTables.tsx`처럼 `ComparisonTableFigure`에 JSON의 `tables["<키>"]`를 넘긴다.
  열은 셋 이하(첫 열이 행 머리), `columnWidths`는 열 수만큼의 백분율이고 합이 100%다(`visuals.test.ts`).
  열 폭은 스크롤 막대가 낀 320px(표 폭 약 273px)에서 가장 긴 덩어리(띄어쓰기 없이 이어진 글자)가 들어가게 어림해 정하고, 그 계산을 summary에 적는다(실측은 phase 끝에 한다). **표 칸에는 백틱을 쓰지 않는다** — `ComparisonTableFigure`는 칸의 글자를 그대로 그려 백틱이 화면에 보인다.
- **사실은 본문에만 있는 것**(ADR-036). 캡션·곁말·라벨·표 칸의 사실마다 그 개념(과 같은 주제의 다른 개념) 본문의 문단을 근거로 댈 수 있어야 한다. 예시 값도 본문에 나오는 것만(ADR-038).
  「회사 A」·「지역 A」·「VM 1」처럼 대상을 가르는 이름표는 사실이 아니므로 써도 된다. 글과 도식을 같은 step이 만드므로, 도식에 필요한 사실은 **글에 먼저 쓴다** — 출처에 없으면 그리지 않는다.
- **말**: 노드 라벨·곁말은 본문에 쓰인 말과 같게 쓴다. 라벨을 줄이거나 영문 약어로 바꿔 폭을 맞추지 마라 — 노드를 넓히거나 배치를 바꾼다. (본문이 「애플리케이션 성능 모니터링(APM)」처럼 약어를 함께 세웠으면 라벨에 그 약어를 써도 된다.)
- **글자 크기**: 노드 라벨 10, 그룹 라벨·곁말 9(viewBox 단위). `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`. 노드 높이는 32다(교차 검사기가 32로 본다 — 키 큰 노드를 만들지 말고 그룹 박스를 쓴다).
- **글자 폭의 여유**: `estimateTextWidth`는 반각 문자(영문·숫자·기호)를 0.55em으로 보지만 실제 화면에서는 0.61em까지 넓다(phase 72 화면 실측).
  반각 문자가 섞인 노드 라벨·곁말·그룹 라벨(예: `VM 1`, `Azure Advisor`, `Azure Service Health`, `Application Insights`, `Resource Health`)은 `estimateTextWidth` 값의 **1.15배**를 폭으로 잡아 노드 폭·배치를 정하고, 그 범위가 둘레 박스와 `viewBox` 안에 들게 한다.
  이 phase는 영문 이름이 많다 — 세로형(폭 280)에 `Azure Service Health`·`Application Insights`(약 20자)처럼 긴 라벨은 노드 하나가 폭 대부분을 쓰므로, 나란히 두지 말고 위아래로 쌓는다.
- **그룹 박스 안의 그룹 박스**(모든 서비스·지역 안의 내가 쓰는 서비스·지역 등): 안쪽 박스의 라벨 영역이 바깥 박스의 라벨 영역과 겹치지 않게 위아래로 떼고, 노드는 자기를 담는 가장 안쪽 박스의 라벨 영역 아래에 둔다.
  세로형(폭 280)에서 나란히 두기 어려우면 위아래로 쌓는다 — 폭을 맞추려고 라벨을 줄이지 않는다.
- **색**: 노드는 모두 회색(`stroke-disabled`, 선례와 같은 클래스). 도식 전용 두 색(`diagram-managed`·`diagram-resource`)은 AWS 계층의 뜻이라 쓰지 않는다. 초록·빨강·주황, 16진 색, 이모지, O/X, 신호등·종 그림도 쓰지 않는다(ADR-036).
  강조는 opacity로만 한다 — 선택 밖 노드 `0.25`, 그룹 박스는 흐려지지 않는다. 나쁜 상태(사용할 수 없는 리소스, 장애, 기준을 넘은 수치)는 색이 아니라 곁말과 흐림으로 보인다(UI_GUIDE 「수량과 상태를 바꾸는 도식」).
- **두 배치**: 세로형(`viewBox` 폭 280)과 가로형(폭 440)을 함께 만든다. 가로형은 `useWideDiagram()`이 `true`일 때 쓴다. `nodes`·`wideNodes`·경로·`wideGroups`·`wideNotes`를 **한 줄에 하나씩 글자 그대로** 적는다 —
  반복문이나 계산으로 만들지 마라(교차 검사기가 글자로 읽는다). 노드 id·경로 id·시나리오·문구는 두 배치가 함께 쓰고, 고른 시나리오는 배치가 바뀌어도 유지된다.
- **경로**: 직교(M/H/V)만, 노드 변에서 시작하고 끝나며, 다른 노드 상자 안을 지나지 않는다. 늘 보이는 연결선도 같은 경로 선언 꼴(`'id': 'M…'`)로 적는다.
  화살표 마커는 선례와 같고 마커 id는 `useId`로 만든다. 그룹 라벨 영역을 지나는 선분이 없어야 한다. 경로는 그룹 박스가 아니라 노드에서 시작하고 끝난다 — 그룹 전체를 가리키는 것은 선이 아니라 그룹 안에 둔 노드나 곁말로 보인다.
  `phases/38-service-diagrams/tools/check-path-crossings.mjs`는 `*Diagram.tsx`의 `const nodes = [`·`const wideNodes = [` 블록에서 `{ id: '…', x: N, y: N, width: N` 순서를, 경로 객체에서 `'id': 'M…'`를 정규식으로 읽는다. 이 형식을 지켜라.
- **물음형 제목**(ADR-038): 그림이 답하는 것 하나를 학습자의 말로. step 문서의 예는 바꿔도 된다.
- **시나리오**: step 문서에 적힌 시나리오를 둔다. 시나리오가 있는 도식은 `전체`(아무것도 고르지 않음)에서 노드가 모두 선명하다.
  두 시나리오의 「선명한 노드 + 보이는 경로 + 보이는 곁말」이 같으면 그 시나리오는 아무것도 가르지 못한다 — 다르게 설계한다. 캡션은 20자를 넘는다(`visuals.test.ts`).
  **한 장면에서 흐리게 둔 노드가 「멈췄다」·「없어졌다」로 읽히지 않는지 본다** — phase 106 마무리에서 두 캡션을 고쳤다(`BudgetAlertDiagram`·`SpendingLimitDiagram`). 이 phase는 특히 상태를 그리는 도식(`HealthViewsDiagram`·`ResourceHealthDiagram`)에서 흐린 노드가 「장애가 난 것」으로 읽히기 쉽다. 그 장면이 일부만 밝히는 것이면 캡션에 그렇다고 쓴다.
- **금지**: SVG 두 개를 그려 놓고 CSS로 하나를 숨기지 마라. 기준 폭 문자열(`'(min-width: 768px)'`)을 도식 파일에 쓰지 마라(ADR-047). 흐르는 점·자동 재생 같은 애니메이션 금지.
  공용 컴포넌트(`DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`)와 교차 검사기, `src/lib/svg-bounds.ts`를 고치지 마라.
- **registry**: `src/components/diagrams/registry.ts`의 `diagramsByConceptId`에 `'<개념 id>': <컴포넌트>` 한 줄씩(도식과 표가 함께 붙는 개념은 선례처럼 배열). import는 기존 정렬(모듈 경로 알파벳순),
  키는 기존 Azure 키들(`azure-infrastructure-as-code.bicep`) 뒤에 개념 순서대로.
- **주제의 시각 요소 파일**: 주제를 만드는 step 1이 `src/data/azure/visuals/azure-monitoring.json`(`{ "diagrams": {}, "tables": {}, "glossary": [] }` 꼴)을 만들고
  `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-monitoring'`로 넣는다. import 이름은 `azureMonitoringVisuals`, import 줄은 경로 알파벳순, `visualsByTopicId`의 항목은 주제 순서대로(맨 끝).

- **테스트가 본문에서 라벨을 찾을 때**: 도식의 사실·라벨이 본문에 있는지 보는 테스트를 맞추려고 문장에 라벨을 끼워 넣지 마라(phase 104 「보고서를 만드는 읽는 앱」). 라벨을 본문의 자연스러운 말로 정하거나 문장을 제대로 다시 쓴다.
- **테스트가 주제의 개념 수를 단언하지 않게 한다** — 뒤 step이 개념을 더한다. 앞 개념의 순서만 본다(phase 107 step 7·10이 고친 곳).

### 도식 테스트 — 도식마다 먼저 쓰고 실패를 확인한 뒤 구현한다

`<이름>Diagram.test.tsx` — 선례와 같은 관문을 건다. 세로형은 `matchMedia` 없이, 가로형은 `describe('가로형 (768px 이상)', …)` 안에서만 `vi.stubGlobal('matchMedia', …)`.

1. 물음형 제목이 시나리오 버튼보다 앞에 보인다(헤딩이 아니다).
2. 처음(`전체`)에는 노드가 모두 선명하다. 시나리오에만 쓰이는 경로는 보이지 않는다(늘 보이는 연결선은 보인다).
3. 시나리오마다 선명한 노드 집합, 보이는 경로, 보이는 곁말, 캡션이 JSON·step 문서의 설계와 같다. 선택 밖 노드는 opacity `0.25`, 그룹 박스는 흐려지지 않는다.
4. 모든 `rect`가 `boxesOutsideViewBox`로 `viewBox` 안이고, 노드 라벨이 `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`이다. 곁말·그룹 라벨은 `estimateTextWidth(문구, 9)`로 잰 가로 범위가 `viewBox` 안이다.
   그룹 박스 안의 그룹 박스는 안쪽이 바깥쪽 안에 들어 있다.
5. 경로의 끝점이 노드 변 위에 있고, 어떤 선분도 다른 노드 상자 안과 그룹 라벨 영역을 지나지 않는다.
6. **그 도식의 요점** — step 문서에 도식마다 적힌 「요점 테스트」.
7. 두 번 렌더해도 화살표 마커 id가 겹치지 않는다. JSON의 시나리오 id 집합과 컴포넌트의 것이 같고, 문구를 JSON에서 읽는다.
8. `ConceptList`에 앵커 개념을 주면 본문 뒤에 이 도식이 온다.
9. 가로형: `viewBox` 폭 440, 래퍼에 `w-full`이 있고 `max-w-[380px]`·`-mx-4`가 없다. 노드·그룹 id 집합과 경로 id 합집합이 세로형과 같고, 3~6번을 가로형에서도 통과한다. 폭이 바뀌어도 고른 시나리오와 캡션이 유지된다.

경로가 없는 도식은 경로에 관한 항목(2의 경로 부분, 5)을 「경로가 없다」로 바꿔 건다.

표 테스트(`azureMonitoringTables.test.tsx`)는 선례 `azureGovernanceTables.test.tsx`와 같은 것을 본다 — 로더·`glossary`, 이름·열·`columnWidths`·근거(`sources`), 행 순서와 칸 문구, `colgroup`, `ConceptList` 배치.

## 파일 형식

- `topics.json`: 주제 객체는 2칸 들여쓰기, `concepts` 배열의 개념은 **한 줄에 하나**(6칸 들여쓰기 + `JSON.stringify(concept)`). 개념 키 순서는 `id`, `parentId`(있을 때), `name`, `summary`, `paragraphs`.
  주제 키 순서는 `id`, `title`, `importance`, `sourcePages`, `concepts`. 앞 step이 쓴 줄과 다른 주제의 줄은 글자 하나도 바꾸지 않고, 자기 개념을 그 주제의 `concepts` 끝에 덧붙인다.
  주제를 만드는 step 1은 바로 앞 주제 객체(`azure-infrastructure-as-code`)의 닫는 줄 `  }`을 `  },`로 바꾸고 그 뒤에 새 주제를 덧붙인다 — 그 밖의 기존 줄은 바꾸지 않는다.
- `questions.json`: `[` 다음 줄부터 **한 줄에 문항 하나**, 마지막 줄 뒤에 `]`. 키 순서 — 4지선다 `id`, `topicId`, `conceptId`, `format`, `prompt`, `choices`, `answerIndex`, `explanation` /
  예/아니요 `id`, `topicId`, `conceptId`, `format`, `prompt`, `answer`, `explanation`. 기존 줄은 바꾸지 않고 끝에 덧붙인다(마지막 기존 줄 끝에 쉼표 하나를 더하는 것은 예외).
- 파일 끝 줄바꿈 하나. 스크립트로 쓸 때 CRLF로 바꾸지 않는다.
- 이 저장소의 TDD 훅은 테스트 파일 없이 새 `.js`·`.ts` 파일을 쓰지 못하게 막는다. 데이터를 고치는 일회용 스크립트가 필요하면 저장소 밖(임시 디렉터리)에 `.cjs`로 두거나 `node -e`를 쓴다.

## 개념을 넣는 step(1·2·4·5)의 공통 AC와 검증

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject azure
node -e "const q=require('./src/data/azure/questions.json');const yn=q.filter(x=>x.format==='yes-no');const ch=q.filter(x=>x.format==='choice');const pos=[0,1,2,3].map(i=>ch.filter(x=>x.answerIndex===i).length);console.log('문항',q.length,'마지막',q[q.length-1].id,'정답 위치',pos.join('/'),'예',yn.filter(x=>x.answer).length,'아니요',yn.filter(x=>!x.answer).length)"
git status --porcelain
```

- `check-verbatim`은 「전사 이상 없음」이고 **원본 777개 이상을 대조했다고 나와야 한다**(`raw/`가 없으면 「건너뜀」으로 통과하므로 그때는 blocked로 멈춘다). 균형은 위 「문항」 9항,
  교차 검사기는 「교차 없음」이고 노드·경로 수가 이 step이 더한 만큼 늘어야 한다(앞 step이 끝났을 때의 수는 그 step summary에, phase 시작 값은 「배경」에 있다). **검사기를 고쳐서 통과시키지 마라.**
- **바뀌지 않아야 하는 것을 기계로 확인한다** — `git show HEAD:src/data/azure/topics.json`·`questions.json`과 `visuals/*.json`을 지금 파일과 node로 읽어, 기존 주제 객체·기존 개념·기존 문항·기존 도식 문구가 통째로 같은지 본다.
  AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `git diff --stat`에 나오지 않아야 한다.
- **글로 읽는다** — 그 주제의 개념을 처음부터 이 step의 개념까지 처음 배우는 사람의 눈으로 통독하고, 풀이 없이 처음 나오는 낱말을 세어 본다(도식 문구 포함). 진행 안내 문장이 없는지도 본다.
  불변식과 테스트는 이런 결함을 잡지 못한다. 브라우저 화면 실측은 하지 않는다(「배경」의 시간 제한 — phase 끝에 메인 세션이 한다).
- 이모지·O/X·빨강·초록·주황·도식 전용 두 색·16진 색·애니메이션·기준 폭 문자열이 새 파일에 없는지 `grep`으로 본다.
- 바뀐 파일은 `src/data/azure/topics.json`·`questions.json`·`visuals/azure-monitoring.json`(과 step 1은 `src/data/azure/index.ts`), 새 도식 컴포넌트와 테스트(step 5는 표 컴포넌트와 테스트),
  `src/components/diagrams/registry.ts`, `docs/source/azure/official.md`(「쓰인 곳」과 더한 사실), phase 메타데이터뿐이어야 한다.

**summary에 적을 것**(사용자가 이것을 읽고 판단한다): 개념마다 id·name과 **새 요약문 전문**, 문항마다 id·개념·형식·고른 방식·**문제문 전문**·정답, 균형 줄(예/아니요·정답 위치),
도식마다 이름·두 배치의 `viewBox`·시나리오별 선명한 노드·경로·곁말과 캡션 요지·물음형 제목·요점 테스트, 설계 의도와 달라진 점과 이유,
`official.md`에 더한 사실, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수, 걸린 시간의 어림. 끝에 「사용자 확인」 칸(없으면 「없음」).

## 출처 step(0·3)의 공통 형식

- `official.md` 항목: `## (phase 108) <문서 제목> — <단원·절 제목>`, URL 한 줄, 확인한 날, 직접 쓴 사실 한 줄씩(끝에 `— 「절 제목」`), **한국어 표기** 줄, 「쓰일 곳」(개념 id와 D·G 번호).
  앞 phase가 이미 둔 항목(예: 활동 로그 「Activity log in Azure Monitor」, Advisor 비용 권장 사항, 비용 경고)은 새 항목을 만들지 말고 그 항목에 사실 줄과 「쓰일 곳」을 덧붙인다 — 덧붙인 줄 끝에 `(phase 108)`.
  step 0과 step 3이 각자 「한국어 표기 정리 — `azure-monitoring`(개념 1~4)」·「(개념 5~9)」 항목을 하나씩 둔다(앞 phase의 항목이 본보기 — 개념마다 확정한 `name`과 근거 문서, 섞여 쓰인 표기와 고른 까닭). 도식·표가 쓸 사실은 「도식·표의 사실 — `azure-monitoring`」 항목에 모은다(step 0이 만들고 step 3이 덧붙인다).
- `corrections.md` 항목: `## D123 — <짧은 제목> (phase 108)`부터 덤프, `## G69 — … (phase 108)`부터 용어집. 짜임은 앞 phase 항목과 같다 — **덤프/용어집**(문항 번호·쪽-번호와 주장) · **공식 문서** · **처리**(고쳐 쓴다 / 한정해 쓴다 / 쓰지 않는다) · **쓰인 곳**.
  덤프 답이 공식 문서와 **맞는** 문항은 항목을 만들지 않는다 — summary에 「확인 결과 덤프가 맞다」로 적는다. 덤프끼리 답이 갈리는 문항은 항목으로 남긴다.
  D·G 번호는 앞 출처 step이 쓴 마지막 번호 다음부터 잇는다(step 3은 step 0의 마지막 번호 다음).
- 그림으로만 표시된 덤프 정답은 OCR 글자나 `index.json`의 `answer`를 믿지 말고 `raw/dump/img/`의 그림을 직접 본다(`docs/source/azure/CLAUDE.md` 「덤프의 그림을 보는 법」). 이 주제의 진술·짝짓기 문항(NO.80·107·114·120·129·149·168·223·245·246·312·319·374·384·393·425·452·491)은 진술이나 답이 그림 안에 있다.
- **시간을 나눠 쓴다** — 덤프 문항이 step 0은 18개, step 3은 15개다. 하나하나 끝까지 읽으면 30분을 넘길 수 있다(넘기면 step이 처음부터 다시 돈다).
  `dump-topics.tsv`의 `note`로 먼저 거르고, 공식 문서와 어긋날 수 있는 주장이 든 문항(덤프 답이 의심스러운 것, 덤프끼리 답이 갈림, 덤프에만 있는 낱말, 「~만」·「반드시」 단정)은 문제문·보기·그림을 끝까지 읽는다.
  나머지는 덤프 답이 공식 문서와 맞는지만 확인한다. 같은 진술을 되풀이하는 문항(NO.107·322·393, NO.245·425, NO.168·223, NO.218·491, NO.60·114·452, NO.273·404, NO.246·312·319)은 묶어 한 번에 본다. 받을 문서를 먼저 모두 받고, 확인 → 기록 순으로 한다.
- 공통 AC:

```bash
npm test
node scripts/check-verbatim.mjs --subject azure
git status --porcelain
git diff --stat
```

  `npm test`는 출처 step이 코드를 고치지 않았으므로 그대로 통과해야 한다. `check-verbatim`은 원본 수가 받은 문서만큼 늘어 있어야 한다.
  `official.md`·`corrections.md`의 한국어 문장이 `raw/official/ko-…`와 32자 넘게 겹치지 않는지 `node -e`로 `findVerbatimRuns`(`scripts/check-verbatim.mjs`가 export한다)에 두 파일의 문단을 넣어 본다.
- 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.
  인증서 오류(`CERTIFICATE_VERIFY_FAILED`)는 연결 문제가 아니다 — 「배경」대로 `SSL_CERT_FILE`을 붙여 다시 받는다.

## 모든 step의 공통 금지

- **출처 문서에 없는 사실을 쓰거나 그리지 마라.** 이유: 원본에 없는 내용을 지어내지 않는 것이 이 저장소의 규칙이다(루트 CLAUDE.md, ADR-036). 필요하면 확인해서 `official.md`에 먼저 더한다.
- **덤프·용어집·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009. `check-verbatim --subject azure`는 하한선일 뿐이다.
- **수정 이력(`corrections.md`)에 걸린 덤프·용어집의 주장을 그대로 가르치지 마라.** 이유: 틀린 사실을 학습자가 외우게 된다.
- **불변식 테스트·커버리지 테스트를 고치거나 예외를 더하지 마라.** 이유: 테스트가 실패하면 데이터를 고치거나 도식을 그린다(ADR-026). 진행 안내 가드 테스트도 마찬가지다 — 걸리면 문장을 고친다.
- **자기 step의 개념이 아닌 개념을 만들거나, 앞 step·앞 phase가 쓴 글·문항·도식을 고치지 마라.** 이유: 범위가 겹치면 사용자가 무엇이 어디서 바뀌었는지 따라갈 수 없다.
  고칠 것을 찾으면 고치지 말고 summary에 적는다. 앞 phase 문장이 이 phase의 출처와 어긋나면 summary의 **「메인 세션이 볼 것」** 칸에 적는다(메인 세션이 마무리에서 판단한다).
- **AWS·네트워크 데이터와 그 테스트를 고치지 마라.** 기존 테스트를 깨뜨리지 마라.
- **브라우저 실측을 하지 마라.** 이유: step 시간 제한 30분(「배경」). 화면 확인은 phase 끝에 한꺼번에 한다.
- **`docs/source/azure/raw/` 아래 파일을 커밋하지 마라.** 이유: 덤프·용어집·공식 문서의 추출 전문이다(ADR-009). `.gitignore`가 막고 있는지 `git status`로 본다.
- **서비스마다의 SLA 수치, 가격, 지역 수·데이터 센터 수, 보존 기간·지연 시간 같은 수치를 본문·문항·도식에 쓰지 마라.** 이유: 계속 바뀌는 수이거나 학습 가이드의 줄에 없는 값이다(「배경」). 경고 조건의 기준 값 같은 예시 값은 예외다(「예시 값」).
- **「배경」이 쓰지 않기로 한 것(Copilot·Observability Agent, AIOps·동적 임계값, Azure Monitor 작업 영역·Prometheus·Grafana, 자동 크기 조정, 경고 처리 규칙, 작업 그룹의 동작 목록, Advisor 점수, Azure 상태의 사후 검토, KQL 문법, Application Insights의 화면 이름 목록, Event Hubs, 지원 플랜)을 쓰지 마라.** 이유: 학습 가이드의 줄에 없거나 개념을 흐린다.
- **Microsoft Sentinel·Defender for Cloud·Cost Management를 이 주제에서 다시 가르치지 마라.** 이유: 앞 phase의 개념 자리다. 짝을 가를 때 한 줄로 푼다.
- **`docs/source/azure/topic-map.md`·`dump-topics.tsv`를 고치지 마라.** 이유: 주제 지도가 배정을 끝냈다. 배정이 맞지 않으면 summary에 적는다.
