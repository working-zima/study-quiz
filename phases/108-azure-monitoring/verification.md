# phase 108 실행 확인 — Azure 모니터링과 과목 마감

- 확인한 날: 2026-11-07
- 브랜치: `feat-108-azure-monitoring`
- 상태: step 0~5와 phase 모두 `completed`
- 범위: `azure-monitoring`, Azure AZ-900 과목 전체 마감 점검

## 실행 요약

| step | 이름 | 결과 |
|---|---|---|
| 0 | `advisor-health-sources` | Advisor·Service Health·Resource Health의 공식 근거와 수정 기록 D123~D129·G69~G70을 더했다. |
| 1 | `monitoring-tools-advisor` | 주제와 개념 1~2, 문항 az179~az181, `MonitoringToolsDiagram`·`AdvisorRecommendationDiagram`을 더했다. |
| 2 | `service-health` | 개념 3~4, 문항 az182~az184, `HealthViewsDiagram`·`ResourceHealthDiagram`을 더했다. |
| 3 | `monitor-sources` | Azure Monitor와 기능 넷의 공식 근거와 수정 기록 D130~D135·G71~G73을 더했다. |
| 4 | `azure-monitor-activity-log` | 개념 5~6, 문항 az185~az187, `MonitorDataDiagram`·`ActivityLogDiagram`을 더했다. |
| 5 | `analytics-alerts-insights` | 개념 7~9, 문항 az188~az190, `AlertRuleDiagram`·`AppInsightsDiagram`과 `MonitorFeaturesTable`을 더했다. |

완성된 `azure-monitoring`은 개념 9개, 문항 12개, 도식 8개, 비교표 1개다. 모니터링 도구의 선택부터 Advisor, Service Health와 Resource Health, Azure Monitor의 메트릭·로그, 활동 로그, Log Analytics, 경고, Application Insights까지 공식 학습 가이드의 마지막 묶음을 채운다.

## 실행 중 생긴 일

- Claude 사용량 한도로 일부 시도가 중단됐지만, 각 시도는 `pending`으로 되돌린 뒤 같은 step을 이어 실행했다.
- step 4는 Codex가 구현과 검증을 완료했다.
- step 5는 Codex가 구현 커밋을 만든 뒤 사용량 한도에 걸려 phase 상태를 쓰지 못했다. 메인 세션이 전체 검증을 다시 실행하고 `phases/108-azure-monitoring/index.json`과 `phases/index.json`을 `completed`로 복구했다.
- 중단 시도의 출력과 복구 기록은 이력으로 남겼고, 완성된 데이터나 코드에는 중간 초안이 남지 않았다.

## 메인 세션이 마무리에서 확인한 것

### 과목 구조와 주제 지도

- `src/data/azure/topics.json`의 주제 20개가 `topic-map.md`의 순서·id·제목·별점과 모두 같다.
- 덤프 대표 문항 수는 주제 지도와 `data.test.ts`가 모두 같고 합계 440개다.
- 별점 분포는 ★★★ 9개, ★★☆ 9개, 별점 없음 2개다.
- 앱 데이터는 개념 133개, 문항 190개(`az001`~`az190`)다. `azure-monitoring`은 마지막 주제이며 개념 9개와 문항 12개를 갖는다.
- 예/아니요 문항은 예 48·아니요 47, 4지선다 정답 위치는 24/24/23/24다.

### 공식 학습 가이드의 11개 묶음

| 묶음 | 대응 주제 |
|---|---|
| Describe cloud computing | `azure-cloud-computing`, `azure-cloud-models` |
| Describe the benefits of using cloud services | `azure-cloud-benefits` |
| Describe cloud service types | `azure-service-types` |
| Describe the core architectural components of Azure | `azure-regions-zones`, `azure-resource-hierarchy` |
| Describe Azure compute and networking services | `azure-compute`, `azure-virtual-networking` |
| Describe Azure storage services | `azure-storage`, `azure-data-movement` |
| Describe Azure identity, access, and security | `azure-identity`, `azure-security-model` |
| Describe cost management in Azure | `azure-cost-factors`, `azure-cost-management` |
| Describe features and tools in Azure for governance and compliance | `azure-governance` |
| Describe features and tools for managing and deploying Azure resources | `azure-management-tools`, `azure-infrastructure-as-code` |
| Describe monitoring tools in Azure | `azure-monitoring` |

가이드 밖에서 넣기로 한 `azure-sla-lifecycle`과 `azure-network-protection`은 주제 지도의 사용자 결정대로 별도 주제로 남아 있다. 11개 묶음 가운데 대응 주제가 없는 곳은 없다.

### 설계 때 표시한 의심 문항 네 개

- NO.126은 D1에서 Azure Functions가 서버리스의 예이고 VM은 아니라고 고쳐 `azure-cloud-computing.serverless`에 반영했다.
- NO.103은 D16에서 Site Recovery의 성격을 내결함성이 아니라 재해 복구로 바로잡았다. 앱은 Site Recovery를 별도 범위로 넓히지 않고 안정성의 정의만 공식 문서에 맞게 썼다.
- NO.100은 D117에서 문제와 답 영역이 서로 다른 자료로 판정해 쓰지 않았다. 관리 도구와 Advisor 어느 쪽의 근거로도 사용하지 않았다.
- NO.1은 D130에서 여러 리소스의 기록을 한곳에 모아 쿼리로 분석하는 일을 Azure Monitor와 Log Analytics로 고쳤다. Event Hubs는 범위 밖으로 두었다.

### 마무리에서 고친 기록

`corrections.md`의 phase 108 항목 8줄에 구현 전 표지인 `(쓰일 곳 — step …)`가 남아 있었다. 해당 개념과 도식이 모두 존재하는 것을 확인하고 표지를 지워 현재의 `쓰인 곳`만 남겼다. 제품 설명·문항·도식의 내용은 바꾸지 않았다.

## 최종 검증

- `npm run lint` 통과.
- `npm run build` 통과. Vite의 청크 크기 경고만 있었고 빌드 오류는 없다.
- `npm test` 통과 — 359파일·7949개.
- `node scripts/check-structure.mjs` — 구조 이상 없음.
- 교차 검사 — 세로 노드 1769개·경로 1138개, 가로 노드 1769개·경로 1138개, 상자 내부를 지나는 선분 0.
- `node scripts/check-verbatim.mjs --subject azure` — 전사 이상 없음, 원본 806개·단위 1288개.
- phase 시작 커밋과 비교했을 때 `src/data/aws/`와 `src/data/network/` 변경 없음.

## 화면 확인

개발 서버 `127.0.0.1:5300`과 headless Chrome의 CDP를 사용해 `azure-monitoring`을 폭 305·320·390·1180에서 측정했다.

- 네 폭 모두 페이지 가로 넘침은 시나리오 선택 전·후 0이다.
- 도식 8개의 모든 시나리오 30개 상태에서 SVG 밖 글자, 상자보다 넓은 라벨, 글자 겹침, 곁말과 노드의 겹침, 그룹 테두리 충돌이 모두 0이다.
- 비교표 하나는 실제 폭 273·288·358·621px에서 표 넘침과 낱말 끊김이 모두 0이다.
- 폭 320 자가 시험에서 일부러 긴 라벨·SVG 밖 곁말·긴 표 낱말을 넣자 17건을 잡아, 측정기가 결함을 놓치지 않는 것을 확인했다.
- 390과 1180 캡처에서 마지막 두 도식과 비교표를 눈으로 확인했다. 노드·화살표·곁말·표 셀이 읽히고 테두리나 글자가 잘린 곳은 없다.
- 앱 실행 오류는 없다. 개발 콘솔에는 Vite 연결 메시지, React DevTools 안내, 기존 React Router 미래 플래그 경고만 있다.

## 사용자 확인이 필요한 것

없다. 이 phase의 설계 범위와 Azure 과목 마감 점검을 모두 마쳤다.
