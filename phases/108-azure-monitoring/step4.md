# Step 4: azure-monitor-activity-log

## 배경

phase 108의 전체 계획·결정·공통 규칙은 `phases/108-azure-monitoring/guide.md`에 있다.
**이 step은 `azure-monitoring`에 개념 5(Azure Monitor)·6(활동 로그)의 글·문항과 도식 `MonitorDataDiagram`·`ActivityLogDiagram`을 더한다.**
사실은 step 0·3이 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

중심 문제: **내 리소스와 앱이 낸 데이터를 모아 쓰는 것이 Azure Monitor다.** 데이터는 두 꼴(정해진 간격으로 잰 수치인 메트릭 / 일어난 일을 적은 로그)로 모이고, Azure 밖의 서버에서도 모은다. 활동 로그에서는 **누가 리소스를 만들고 바꾸고 멈췄는가는 따로 설정하지 않아도 남지만, 리소스 안에서 일어난 일은 남지 않는다**는 것이 핵심이다.

## 읽어야 할 파일

- **`phases/108-azure-monitoring/guide.md` 전체**
- `phases/108-azure-monitoring/index.json`의 앞 step `summary` — 특히 step 3이 확정한 표기(메트릭·로그·리소스 로그·진단 설정·Log Analytics 작업 영역), 무엇을 쓰고 무엇을 쓰지 않는지, step 1이 쓴 Azure Monitor 목록 항목
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-monitoring` 앞 개념 넷(이미 푼 낱말을 다시 풀지 않는다), `questions.json`, `visuals/azure-monitoring.json`, `data.test.ts`·`visuals.test.ts`
- 도식 선례 — step 1·2의 도식과 테스트, `src/components/diagrams/AzureArcDiagram.tsx`(Azure 밖의 서버), `src/types/visuals.ts`, `DiagramFrame.tsx`(고치지 마라), `registry.ts`, `src/lib/svg-bounds.ts`
- 겹치지 않게: `azure-management-tools.azure-arc`(모니터링 줄), `azure-virtual-networking.azure-dns`(활동 로그 줄), `azure-cloud-benefits.manageability`, 문항 `az023`·`az172`·`az173`

## 작업

### 1. 개념 — `topics.json`의 `azure-monitoring` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 5 | `azure-monitoring.azure-monitor` | — | 첫 문장은 리소스와 앱이 지금 어떤지 알려면 그것들이 내는 데이터를 모아 봐야 한다는 것부터. 무엇을 어디서 모으는가(앱·운영 체제·네트워크, Azure 밖 — 온-프레미스·다른 클라우드, step 3 결과대로). **온-프레미스**·**다중 클라우드**·**Azure Arc**를 이 주제에서 처음 쓰면 한 줄로 푼다. 모은 데이터를 한곳에 두고 대시보드·쿼리·경고로 쓴다(**대시보드**·**쿼리**를 한 줄로 푼다 — 앞 개념이 풀었으면 되짚기만). **메트릭과 로그**를 한 문단으로 가른다(4절 — 무엇이 다르고 각각 무엇에 쓰는가, step 3 결과의 말 그대로). 딸린 기능 넷(활동 로그·Log Analytics·Azure Monitor 경고·Application Insights)은 이름을 한 문장에 들고 각각 무엇을 하는지 한 구씩 — 목록으로 그리지 않는다. **도식의 예(웹 앱 1, VM 1, 회사 데이터 센터의 서버, CPU 사용률, 오류 기록)를 본문에 쓴다** |
| 6 | `azure-monitoring.activity-log` | `azure-monitor` | 첫 문장은 어제 멈춰 있던 VM을 누가 멈췄는지 알아야 하는 장면부터. 무엇이 남는가(**관리 작업** — 만들기·설정 바꾸기·지우기·VM 중지, step 3 표기)와 남지 않는 것(읽기는 대개 — step 3 결과대로), 누가·언제·무엇을, 따로 설정하지 않아도 남고 사용자가 고치거나 지울 수 없다(step 3 결과대로). 보는 단위(구독·리소스 그룹·리소스 하나 — **리소스 그룹**을 한 줄로 푼다). **리소스 로그와의 차이**(4절 — VM 안의 앱이 데이터베이스에 보낸 요청 같은 리소스 안의 일은 리소스 로그에 남고, 진단 설정이 있어야 모인다 — 둘 다 step 3 표기, **진단 설정**을 한 줄로 푼다). 오래 두려면 다른 곳으로 보낸다(수치 없이 한 줄). **도식의 예(담당자, VM 1, 데이터베이스)를 본문에 쓴다** |

### 2. 문항 — `az185`~`az187`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az185` | `azure-monitor` | 예/아니요, 정답 **예** 「흔한 오해」 — Azure Monitor로 회사 건물 안의 데이터 센터에 있는 서버의 데이터를 모아 볼 수 있는가(step 3 결과대로 — 무엇이 있어야 하는지는 해설에서 가르친다). 「…도」처럼 답을 흘리는 말을 쓰지 않는다. `az172`·`az173`(Azure Arc)과 같은 것을 묻지 않는다 — 묻는 것은 Azure Monitor가 지켜보는 범위다 |
| `az186` | `activity-log` | 4지선다, 정답 위치 3 「상황 적용」 — 어제 VM 1이 멈춰 있었다. 담당자는 누가 언제 그 VM을 중지했는지 알고 싶다. 정답 활동 로그. 오답은 같은 범주(무언가를 기록하거나 상태를 보여 주는 곳)에서 실제로 헷갈리는 것 — Resource Health(VM을 쓸 수 없었다는 것과 원인 쪽은 알린다 — **누가**는 알리는가, step 0·3 결과로 확인하고 맞게 읽히면 보기로 쓰지 않는다), Application Insights, 리소스 로그 같은 것. **Log Analytics는 활동 로그를 작업 영역으로 보내 두면 같은 기록을 쿼리할 수 있으므로 오답으로 두지 않는다**(guide 「문항」 4항 — step 3 결과대로). 덤프 NO.60·114·452의 문장을 쓰지 않는다 |
| `az187` | `activity-log` | 예/아니요, 정답 **아니요** 「개념 비교」 — VM 1 안의 앱이 데이터베이스에 보낸 요청은 활동 로그에 기록되는가. 해설은 활동 로그가 리소스에 한 관리 작업을 남기고, 리소스 안의 일은 리소스 로그에 남으며 진단 설정이 있어야 모인다는 것을 가르친다(step 3 결과대로) |

### 3. 도식

#### `azure-monitoring.azure-monitor` — `MonitorDataDiagram`, JSON 키 `monitor-data`

- 물음형 제목 예: `Azure Monitor는 무엇을 어디서 모아 어디에 쓸까?`
- 그릴 것: 그룹 `g-sources`(「데이터가 나오는 곳」 — 본문의 말로) 안에 `web-app`(「웹 앱 1」)·`vm-1`(「VM 1」)·`onprem`(「회사 데이터 센터의 서버」), 그룹 `g-monitor`(「Azure Monitor」) 안에 `metrics`(「메트릭」)·`logs`(「로그」), 그 아래 `analyze`(「쿼리로 분석」)·`alerts`(「경고」) — 대시보드를 그리면 `dashboard`(「대시보드」)를 더한다. 경로 `vm-to-metrics`, `app-to-logs`, `onprem-to-logs`, `logs-to-analyze`, `metrics-to-alerts`(대시보드를 더하면 `metrics-to-dashboard`).
- 세로형(폭 280)은 그룹 둘과 쓰는 곳을 위아래로 쌓는다. `회사 데이터 센터의 서버`는 긴 라벨이다 — 노드를 넓히거나 배치를 바꾸고 라벨을 줄이지 않는다.
- 시나리오(말은 step 3 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `collect` | 모은다 | `web-app`·`vm-1`·`onprem`·`metrics`·`logs` | `vm-to-metrics`·`app-to-logs`·`onprem-to-logs` | 「Azure 밖의 서버까지」 | Azure의 리소스와 앱, 회사 데이터 센터의 서버에서 데이터를 모은다 |
  | `metrics` | 메트릭 | `vm-1`·`metrics`·`alerts` | `vm-to-metrics`·`metrics-to-alerts` | 「정해진 간격으로 잰 수치」 | CPU 사용률 같은 수치를 간격마다 재 두고, 정해 둔 기준을 넘으면 경고한다 |
  | `logs` | 로그 | `web-app`·`logs`·`analyze` | `app-to-logs`·`logs-to-analyze` | 「일어난 일의 기록」 | 오류 같은 기록을 모아 두고 쿼리로 찾아 분석한다 |

  `metrics` 캡션이 「경고는 메트릭으로만 낸다」로, `logs` 캡션이 「로그는 경고에 쓰지 않는다」로 읽히지 않게 쓴다 — 로그로도 경고를 낸다(개념 8).
- 요점 테스트: `metrics`·`logs` 노드가 `g-monitor` 안에 있고 데이터가 나오는 곳 셋은 `g-sources` 안에 있다(두 배치). `collect`에서 `analyze`·`alerts`가 흐리고, `metrics`·`logs` 두 시나리오의 선명한 노드 집합이 다르다. `onprem`은 `collect`에서만 선명하다.

#### `azure-monitoring.activity-log` — `ActivityLogDiagram`, JSON 키 `activity-log`

- 물음형 제목 예: `누가 VM을 중지했는지는 어디에 남을까?`
- 그릴 것: `admin`(「담당자」), `vm-1`(「VM 1」), `database`(「데이터베이스」), `activity-log`(「활동 로그」), `diag`(「진단 설정」), `resource-log`(「리소스 로그」). 경로 `stop-vm`(`admin`→`vm-1` — 중지 작업), `vm-to-activity`(`vm-1`→`activity-log`), `vm-to-db`(`vm-1`→`database` — 앱이 보낸 요청), `db-to-diag`(`database`→`diag`), `diag-to-log`(`diag`→`resource-log`). 이름은 step 3 표기로 고친다.
- 시나리오(말은 step 3 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `manage` | 관리 작업 | `admin`·`vm-1`·`activity-log` | `stop-vm`·`vm-to-activity` | 「누가·언제·무엇을」 | 담당자가 VM을 중지한 일은 따로 설정하지 않아도 활동 로그에 남는다 |
  | `inside` | 리소스 안의 일 | `vm-1`·`database`·`diag`·`resource-log` | `vm-to-db`·`db-to-diag`·`diag-to-log` | 「진단 설정이 있어야 모인다」 | 앱이 데이터베이스에 보낸 요청은 활동 로그가 아니라 리소스 로그에 남고, 진단 설정을 해 두어야 모인다 |

- 요점 테스트: `manage`에서 `resource-log`·`diag`가, `inside`에서 `activity-log`·`admin`이 opacity `0.25`다. `stop-vm`은 `manage`에서만, `diag-to-log`는 `inside`에서만 보인다. `inside`에서 흐린 `activity-log`가 「활동 로그가 꺼졌다」로 읽히지 않게 캡션이 그 장면이 리소스 안의 일만 밝힌다는 것을 쓴다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·4·5)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 187개, 마지막 id는 `az187`, 예 47·아니요 47, 정답 위치 23/23/23/24다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `azure-monitoring`의 개념이 여섯이고 순서가 guide 표와 같은지, `activity-log`의 `parentId`가 `azure-monitoring.azure-monitor`인지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 1의 Azure Monitor 목록 항목과 개념 5의 말이 어긋나지 않는지 본다(어긋나면 step 1의 글을 고치지 말고 summary에 적는다). 문항마다 guide.md 「문항」 11항을 다시 본다.
4. `phases/108-azure-monitoring/index.json`의 step 4를 갱신한다(성공 → guide.md 「summary에 적을 것」 / 3회 실패 → error / `check-verbatim` 「건너뜀」 → blocked).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 7~9를 만들지 마라.** 이유: step 5의 범위다. 개념 5의 글이 Log Analytics·경고·Application Insights를 쓸 때는 한 구씩으로 그친다.
- **데이터 플랫폼의 세부(Azure Monitor 작업 영역·Prometheus·데이터 수집 규칙·에이전트·파이프라인)를 쓰지 마라.** 이유: guide 「배경」 — 학습 가이드의 줄은 「모은다·한곳에 둔다·쓴다」다.
- **활동 로그의 보존 기간·나타나기까지의 시간, 리소스 로그의 범주, 진단 설정을 만드는 절차를 쓰지 마라.** 이유: guide 「배경」의 수치·세부 금지.
