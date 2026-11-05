# Step 2: service-health

## 배경

phase 108의 전체 계획·결정·공통 규칙은 `phases/108-azure-monitoring/guide.md`에 있다.
**이 step은 `azure-monitoring`에 개념 3(Azure Service Health)·4(Resource Health)의 글·문항과 도식 `HealthViewsDiagram`·`ResourceHealthDiagram`을 더한다.**
사실은 step 0이 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

중심 문제: **Azure 쪽에 문제가 있는지를 세 넓이로 본다.** 모든 지역의 모든 서비스(Azure 상태, 누구나), 내 구독이 쓰는 서비스와 지역(Service Health, 로그인한 사람), 리소스 하나(Resource Health). 학습자가 가장 많이 헷갈리는 것은 **묶음과 가운데 보기의 이름이 같다는 것**, **Azure 상태와 Service Health**(계획된 유지 관리는 어디서 알게 되는가), **같은 「사용할 수 없음」의 두 원인**(Azure 쪽의 일 / 담당자가 VM을 중지함)이다.

## 읽어야 할 파일

- **`phases/108-azure-monitoring/guide.md` 전체**
- `phases/108-azure-monitoring/index.json`의 앞 step `summary` — 특히 step 0이 확정한 묶음·세 보기·상태 값의 표기와 앱이 묶음과 보기를 가르는 말, step 1이 쓴 개념과 도식
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」)
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-monitoring` 앞 개념 둘(이미 푼 낱말을 다시 풀지 않는다), `questions.json`, `visuals/azure-monitoring.json`, `data.test.ts`·`visuals.test.ts`
- 도식 선례 — `src/components/diagrams/MonitoringToolsDiagram.tsx`(step 1)와 `.test.tsx`, 그룹 안의 그룹 `RbacScopeDiagram.tsx`·`LockInheritanceDiagram.tsx`와 그 테스트, `src/types/visuals.ts`, `DiagramFrame.tsx`(고치지 마라), `registry.ts`, `src/lib/svg-bounds.ts`
- 겹치지 않게: `azure-sla-lifecycle.sla`, `azure-regions-zones`의 지역 풀이, 문항 `az165`(모바일 앱으로 상태 보기)

## 작업

### 1. 개념 — `topics.json`의 `azure-monitoring` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 3 | `azure-monitoring.service-health` | — | **목록 개념**. 첫 문장은 내 설정이 맞아도 Azure 쪽의 장애나 유지 관리로 서비스가 멈출 수 있다는 것부터. 묶음의 이름(step 0 표기)과 세 보기를 넓은 데서 좁은 데로 같은 꼴(누가 보고 · 어디까지 보는가) 항목 셋. **지역**을 이 주제에서 처음 쓰면 한 줄로 푼다. 항목 뒤 문단: 묶음과 가운데 보기의 이름이 같다는 것과 앱이 둘을 어떻게 부르는가(step 0 결과의 말), Service Health가 알리는 일의 종류(step 0 표기), **경고**를 설정해 이메일 같은 길로 받는다(**작업 그룹**을 한 줄로 푼다 — step 0 결과대로), 지난 일의 기록. **Azure Monitor와의 차이** 한 줄(Azure 쪽의 문제 / 내 리소스가 낸 데이터 — step 1의 목록 항목과 같은 말로). **도식의 예(지역 A·지역 B의 서비스, VM 1)를 본문에 쓴다** |
| 4 | `azure-monitoring.resource-health` | `service-health` | 첫 문장은 VM 하나가 이상할 때 그것이 Azure 쪽 문제인지 내 쪽 문제인지부터 알아야 다음 할 일이 정해진다는 것부터. 상태 값 넷을 같은 꼴(무엇을 뜻하는가) 한 줄씩 — 목록으로 그릴지는 정한다(목록이면 개념 4도 목록 개념이 된다 — 항목은 혼자 서지 않는다). **원인이 Azure 쪽인가 사용자 쪽인가**(step 0 표기 — 플랫폼 이벤트·비플랫폼 이벤트를 쓸지, 하는 말로 쓸지), Azure 쪽이면 알려 주는 것과 지원으로 가는 길(step 0 결과대로). 리소스의 상태가 바뀌면 경고를 받는다(한 줄). **Service Health와의 차이**(서비스·지역 / 리소스 하나). **도식의 예(VM 1, 담당자가 VM을 중지함, 계획된 유지 관리)를 본문에 쓴다** |

### 2. 문항 — `az182`~`az184`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az182` | `service-health` | 4지선다, 정답 위치 2 「상황 적용」 — 회사 C는 지역 A의 서비스를 쓴다. Microsoft가 그 서비스에 계획된 유지 관리를 잡으면 담당자가 미리 이메일로 알고 싶다. 정답 Service Health(step 0 표기 — 「Service Health 경고」처럼 받는 쪽 이름이면 그것). 오답은 Azure 상태(누구나 보는 넓은 장애), Resource Health(리소스 하나의 지금 상태), Azure Advisor(권장 사항) — **내 구독이 쓰는 서비스만**과 **미리 알려 주는 유지 관리**라는 조건으로 갈린다. Service Health의 경고는 Azure Monitor에서 만드는 경고 규칙이기도 하므로 **Azure Monitor·Azure Monitor 경고를 오답으로 두지 않는다**(guide 「문항」 4항). 덤프 NO.218·491의 문장을 쓰지 않는다 |
| `az183` | `service-health` | 예/아니요, 정답 **예** 「흔한 오해」 — Azure 상태 페이지는 Azure에 로그인하지 않은 사람도 열어 볼 수 있는가. 「…도」처럼 답을 흘리는 말을 쓰지 않는다 — 「로그인하지 않은 사람이 열어 볼 수 있나요?」처럼. 해설은 누구나 보는 대신 넓게 퍼진 장애만 올라오고, 내 서비스에 맞춘 소식은 Service Health에서 본다는 것을 가르친다(step 0 결과대로) |
| `az184` | `resource-health` | 예/아니요, 정답 **아니요** 「원인과 결과」 — 담당자가 직접 VM 1을 중지해 그 VM을 쓸 수 없게 됐을 때, Resource Health는 그 원인을 Azure 쪽 문제로 알리는가. 해설은 사용자의 작업도 「사용할 수 없음」으로 보이지만 원인이 다르게 표시된다는 것과, Azure 쪽 문제일 때 무엇을 알려 주는가를 가르친다(step 0 결과대로 — 근거가 다르면 맞는 주장으로 고치고 답은 아니요로 둔다) |

### 3. 도식

#### `azure-monitoring.service-health` — `HealthViewsDiagram`, JSON 키 `health-views`

- 물음형 제목 예: `세 보기는 각각 어디까지 볼까?`
- 그릴 것: 바깥 그룹 `g-all`(「모든 지역의 모든 서비스」) 안에 안쪽 그룹 `g-mine`(「내 구독이 쓰는 서비스」 — 본문의 말로)과 노드 `other-service`(「지역 B의 서비스」), `g-mine` 안에 `my-service`(「지역 A의 서비스」)·`vm-1`(「VM 1」). 그룹 밖에 보기 노드 셋 `azure-status`(「Azure 상태」)·`service-health`(「Service Health」)·`resource-health`(「Resource Health」 — 이름은 step 0 표기).
  경로는 step이 정한다 — 보기 노드에서 그 범위의 노드로 선을 그리기 어려우면(그룹 라벨 영역을 지나게 되면) **경로 없이** 선명한 노드로 범위를 보인다(guide 「도식 테스트」 끝 줄).
- 시나리오(말은 step 0 결과대로):

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `status` | Azure 상태 | `azure-status`·`other-service`·`my-service` | 「로그인하지 않아도 본다」 | 모든 지역의 모든 서비스에 걸친 넓은 장애를 누구나 본다 |
  | `service` | Service Health | `service-health`·`my-service` | 「장애·계획된 유지 관리·상태 권고」 | 로그인한 사람의 구독이 쓰는 서비스와 지역의 일만 골라 알린다 |
  | `resource` | Resource Health | `resource-health`·`vm-1` | 「이 리소스는 지금 쓸 수 있는가」 | 리소스 하나가 지금 쓸 수 있는지와 지난 기록을 보여 준다 |

  `service`에서 흐린 `other-service`가 「지역 B에 장애가 났다」로, `resource`에서 흐린 서비스 노드가 「멈췄다」로 읽히지 않게 캡션이 그 장면이 **보는 범위**만 밝힌다는 것을 쓴다(guide 「도식」 시나리오 끝 줄).
- 요점 테스트: `g-mine`이 `g-all` 안에 들어 있다(두 배치). `other-service`는 `status`에서만 선명하다. 시나리오마다 선명한 보기 노드가 하나이고 셋이 서로 다르다. `status`에서 선명한 범위 노드(보기 노드를 뺀 것)가 `service`의 것을 모두 품고 더 많다. 보기 노드 셋은 어느 그룹 안에도 없다.

#### `azure-monitoring.resource-health` — `ResourceHealthDiagram`, JSON 키 `resource-health`

- 물음형 제목 예: `VM 1을 쓸 수 없을 때 원인은 어느 쪽일까?`
- 그릴 것: `platform-event`(「Azure 쪽의 일」 — 본문의 말로, 예: 계획된 유지 관리), `user-action`(「담당자의 작업」 — 예: VM 중지), `vm-1`(「VM 1」), `resource-health`(「Resource Health」), `support`(「지원 요청」 — step 0 결과대로, 근거가 없으면 빼고 summary에). 경로 `platform-to-vm`, `user-to-vm`, `vm-to-rh`, `rh-to-support`.
- 시나리오(상태 값 이름과 말은 step 0 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `platform` | Azure 쪽 원인 | `platform-event`·`vm-1`·`resource-health`·`support` | `platform-to-vm`·`vm-to-rh`·`rh-to-support` | 「사용할 수 없음 — Azure 쪽」 | Azure 쪽의 일이면 Microsoft가 무엇을 하고 있는지 알리고 지원으로 가는 길을 준다 |
  | `user` | 사용자 쪽 원인 | `user-action`·`vm-1`·`resource-health` | `user-to-vm`·`vm-to-rh` | 「사용할 수 없음 — 사용자 작업」 | 담당자가 VM을 중지해도 사용할 수 없음으로 보이지만, 원인은 사용자 작업으로 알린다 |

  셋째 시나리오(예: 「성능 저하」 — 쓸 수는 있지만 성능이 떨어짐)는 본문이 그 상태 값을 쓰고 두 시나리오와 다르게 가를 수 있으면 더한다.
- 요점 테스트: 두 시나리오 모두 `vm-1`·`resource-health`가 선명하고 `vm-to-rh`가 보인다. 원인 노드는 시나리오마다 하나만 선명하다. `support`와 `rh-to-support`는 `platform`에서만 보인다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다. 상태를 색(초록·빨강)·아이콘으로 그리지 않는다 — 곁말과 흐림으로만(guide 「도식」 색).

registry에 두 줄(개념 순서대로).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·4·5)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 184개, 마지막 id는 `az184`, 예 46·아니요 46, 정답 위치 23/23/23/23이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `azure-monitoring`의 개념이 넷이고 순서가 guide 표와 같은지, `resource-health`의 `parentId`가 `azure-monitoring.service-health`인지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 「상태」가 status와 health 어느 쪽인지 읽는 사람이 헷갈리지 않는지 소리 내어 읽어 본다. 문항마다 guide.md 「문항」 11항을 다시 본다.
4. `phases/108-azure-monitoring/index.json`의 step 2를 갱신한다(성공 → guide.md 「summary에 적을 것」 / 3회 실패 → error / `check-verbatim` 「건너뜀」 → blocked).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 5~9를 만들지 마라.** 이유: step 4·5의 범위다. 경고·작업 그룹은 한 줄 풀이로 그친다.
- **Azure 상태의 세 시나리오·사후 검토·RSS, Resource Health가 상태를 바꾸는 시간 같은 수치를 쓰지 마라.** 이유: guide 「배경」 — 학습 가이드의 줄에 없고 계속 바뀐다.
- **SLA를 다시 가르치지 마라.** 이유: `azure-sla-lifecycle`의 몫이다. step 0이 쓰기로 했으면 한 줄까지.
