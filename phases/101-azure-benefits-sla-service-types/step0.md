# Step 0: benefits-sources

## 배경

phase 101은 Azure AZ-900 과목에 주제 셋(3 클라우드의 이점, 4 SLA와 서비스 수명 주기, 5 서비스 유형과 공동 책임)을 더한다. 전체 계획과 결정은 `phases/101-azure-benefits-sla-service-types/guide.md`에 있다.
step 1·2가 주제 `azure-cloud-benefits`(클라우드의 이점)의 개념 7개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고,
덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다. 두 문서의 형식은 phase 100이 만든 것을 그대로 따른다.

이 주제의 중심 문제는 **덤프가 묻는 이점의 낱말이 지금의 공식 학습 자료보다 많다는 것**이다. Learn 모듈 「Describe the benefits of using cloud services」는 고가용성·확장성(수직·수평)·안정성·예측 가능성·보안과 거버넌스·관리 효율성을 다루는데,
덤프는 그 밖에 탄력성(5문항)·지리적 분산(5)·내결함성(3)·재해 복구(3)·민첩성(2)도 묻는다. 이 낱말들을 **현행 공식 문서가 정의하는지** 하나씩 확인해,
정의가 있으면 어느 개념에 어떻게 쓸지, 없으면 쓰지 않는다는 처리를 남기는 것이 이 step의 일이다. 짐작으로 정의를 만들지 마라.

## 읽어야 할 파일

- `phases/101-azure-benefits-sla-service-types/guide.md` — 특히 「세 주제와 개념 17개」의 `azure-cloud-benefits` 표, 「한국어판에서 본 것」, 「출처」, 「출처 step(0·3·6)의 공통 형식」
- `docs/source/azure/CLAUDE.md` — 원본 셋, 허용하는 출처, 가리키는 표기, 덤프의 그림을 보는 법. **이 규칙을 따른다**
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **phase 100이 만든 형식을 따른다.** 이미 있는 항목 「Learn 「Describe the benefits of using cloud services」 — 2 …」와 「한국어 표기 정리」 둘을 먼저 읽는다
- `phases/100-azure-cloud-concepts/verification.md`의 「설계와 달라진 것」 — phase 100 출처 step이 표기를 정한 방식
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `cloud-benefits`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다
  (설계 때 본 것: NO.22·61·75·88·103·115·139·140·145·147·160·162·165·179·188·227·241·280·303·315·336·355·356·363·371·405·434). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/1-cloud-concepts.md`의 클라우드 확장성·고가용성·신뢰성·예측 가능 비용·일관된 보안·거버넌스·관리 효율성·업타임·Elasticity(탄력성)·재해 복구·오토 스케일링·애자일 개발 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — `learn-describe-benefits-use-cloud-services-{2,3,4,5}-….md`와 한국어판 `ko-…`, `azure-dictionary-what-is-cloud-computing.md`,
  `learn-describe-core-architectural-components-of-azure-5-describe-azure-physical-infrastructure.md`(지역의 정의)
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

공식 문서는 `python -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 받아 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다).
이름은 `learn-<모듈>-<단원>.md`(Learn 단원), `docs-<서비스>-<쪽>.md`(제품 문서), `azure-dictionary-<쪽>.md`(클라우드 컴퓨팅 사전), 한국어판은 앞에 `ko-`를 붙인다.
영문판(`en-us`)으로 사실을 확인하고, 한국어판(`ko-kr`)은 **용어 표기만** 본다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `high-availability` | 고가용성의 정의(장애·사건과 관계없이 가용 시간을 최대로), Azure의 가동 시간 보장이 서비스마다 다르고 SLA에 들어 있다는 것. **SLA**·**가동 시간**을 한 줄로 풀 근거. 덤프 NO.88·162. 용어집 고가용성의 「대부분 SLA 99.9% 이상」 같은 수치 주장은 공식 문서가 말하는가(말하지 않으면 G 항목으로 「쓰지 않는다」) | Learn 단원 2(받아 둠) |
| b | `scalability` | 확장성의 정의, 쓴 만큼 내므로 수요가 줄면 줄여 비용도 준다는 것. 수직(CPU·RAM을 더하거나 줄임 — 올림·내림)과 수평(VM·컨테이너의 수 — 늘림·줄임, 자동이나 수동). **한국어 표기**: 한국어판 단원 2가 「수직 크기 조정」과 「수직 스케일링」을 섞어 쓴다 — Microsoft의 다른 한국어 문서(예: VM 확장 집합·App Service 크기 조정 문서의 한국어판)도 보고 항목 이름 하나를 고른다. 스케일 업·다운·아웃·인을 한국어판이 어떻게 적는지. **CPU**·**RAM**·**컨테이너**를 한 줄로 풀 근거. 덤프 NO.147·355·371·139·165·315 | Learn 단원 2(받아 둠), VM 확장 집합 개요(`learn.microsoft.com/azure/virtual-machine-scale-sets/overview`)와 한국어판 |
| c | `elasticity` | 탄력성의 정의(수요에 맞춰 리소스를 자동으로, 실시간으로 조정), **확장성과 어떻게 다른지를 공식 문서가 말하는가**(말하는 그대로만 — 둘을 가르는 말을 짐작으로 만들지 않는다). 한국어 표기. 덤프 NO.61·115·140·160·227. 용어집 Elasticity 항목 | Azure 클라우드 컴퓨팅 사전 「What is elasticity in cloud computing?」(`azure.microsoft.com/resources/cloud-computing-dictionary/what-is-elastic-computing`)과 한국어판(설계 때 한국어판은 503으로 열리지 않았다 — 다시 열어 보고, 안 되면 「탄력성」을 쓰는 다른 Microsoft 한국어 문서에서 표기를 확인한다) |
| d | `reliability` | 안정성의 정의(장애에서 회복해 계속 동작), 분산된 설계로 세계 여러 지역에 리소스를 둔다는 것, 한 지역의 큰 재해에도 다른 지역은 돈다는 것, 클라우드가 알아서 다른 지역으로 옮기는 경우가 있다는 것. **지역**을 한 줄로 풀 근거(받아 둔 단원 5). **한국어 표기**: 한국어판 단원 3이 제목은 「안정성」, 절은 「신뢰도」다 — 하나를 고른다. 고가용성과의 차이를 공식 문서가 말하는가 | Learn 단원 3(받아 둠), 「Describe Azure physical infrastructure」 단원(받아 둠) |
| e | 덤프만 묻는 이점 넷 | **내결함성**(NO.280·303·363), **지리적 분산**(NO.22·75·139·165·315 — 사용자 가까이 두어 지연을 줄인다는 주장 포함), **재해 복구**(NO.103·188·405 — 덤프가 Azure Site Recovery로 묻는다), **민첩성**(NO.160·434). 각각을 현행 공식 문서(Learn, 제품 문서, 클라우드 컴퓨팅 사전)가 정의하는지. 정의가 있으면 그 정의와 URL, 붙일 개념(내결함성·지리적 분산·재해 복구 → `reliability`, 민첩성 → `elasticity`)을 summary에 적는다. 정의가 없으면 D 항목에 「쓰지 않는다」. **Azure Site Recovery는 이 주제에서 이름도 쓰지 않는다** — 재해 복구의 정의만 본다 | 클라우드 컴퓨팅 사전(`azure.microsoft.com/resources/cloud-computing-dictionary/`)의 해당 쪽이 있는지, Well-Architected Framework 안정성 쪽(`learn.microsoft.com/azure/well-architected/reliability/`) |
| f | `predictability` | 성능 예측 가능성(필요한 리소스를 내다봄 — 자동 크기 조정·부하 분산·고가용성), 비용 예측 가능성(실시간 추적·모니터링·분석·가격 계산기로 어림). **부하 분산**을 한 줄로 풀 근거. 두 항목의 한국어 이름. 덤프 NO.179. 용어집 「예측 가능 비용」 | Learn 단원 3(받아 둠) |
| g | `security-governance` | 템플릿으로 표준·규정을 맞춤, 표준이 바뀌면 한꺼번에 고침, 감사가 벗어난 리소스를 짚고 완화 방안을 줌, 운영 모델에 따라 패치가 자동, IaaS면 보안을 최대로 통제(운영 체제·설치한 소프트웨어·패치를 사용자가 관리), PaaS·SaaS면 패치를 맡김, 공급자가 DDoS 공격에 대비하기 좋다는 것. **거버넌스**·**DDoS 공격**·**IaaS·PaaS·SaaS**를 이 주제에서 한 줄씩 풀 근거(세 유형은 Learn 「Describe cloud service types」 단원 2~4, 받아 둠). 용어집 거버넌스·일관된 보안 | Learn 단원 4(받아 둠) |
| h | `manageability` | 클라우드의 관리(자동 크기 조정, 템플릿 배포, 상태 모니터링과 실패한 리소스 교체, 지표 기반 자동 경고), 클라우드에서의 관리(웹 포털·명령줄 인터페이스·API·PowerShell). 두 항목의 한국어 이름. **API**·**명령줄 인터페이스**를 한 줄로 풀 근거 | Learn 단원 5(받아 둠) |
| i | 도식 | `CloudScalingDiagram`(수직: VM 한 대의 CPU·RAM을 더함 / 수평: VM을 더함)의 라벨·곁말·캡션의 사실마다 근거가 b에 있는지 | b의 결과 |

빠진 것을 읽다가 찾으면 더한다. 덤프 문항(위 번호)과 용어집 항목을 하나씩 읽어 공식 문서와 다른 주장이 더 있는지 본다.
NO.61·241·336·356은 `cloud-computing`과 함께 걸린 문항이다 — phase 100의 D 항목에 이미 있으면 새로 만들지 말고 summary에 그 번호를 적는다.

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·3·6)의 공통 형식」대로. 이미 있는 단원 2 항목에는 사실 줄을 덧붙이고(끝에 `(phase 101)`), 단원 3·4·5와 새로 받은 문서는 새 항목으로 둔다.
끝에 「한국어 표기 정리 — `azure-cloud-benefits`」 항목 — 개념 7개와 목록 항목 이름(수직·수평 확장, 성능·비용 예측 가능성, 클라우드의 관리·클라우드에서의 관리)마다 고른 표기와 근거 문서, 섞여 쓰인 표기와 고른 까닭.

### 3. `docs/source/azure/corrections.md`에 더한다

D16·G10부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- 덤프만 묻는 이점 넷(위 e) — 공식 정의가 없는 낱말마다 「쓰지 않는다」, 있으면 그 정의와 덤프의 주장이 맞는지.
- **NO.103 Site Recovery의 이점**: 설계 때 덤프 답이 「내결함성」으로 의심됐다(`docs/source/azure/CLAUDE.md`). 그림으로 덤프가 무엇을 답으로 보는지 확인하고, 재해 복구의 공식 정의(e)에 비춰 처리를 적는다.
- **NO.145**: 짝짓기 그림을 읽을 수 없다고 분류 메모에 적혀 있다 — 그림을 직접 보고, 읽을 수 없으면 summary에 그렇게 적고 항목을 만들지 않는다.
- 용어집 고가용성·업타임의 SLA 수치 주장, 신뢰성 항목이 「예측 가능한 성능」을 안정성에 넣는 것 — 공식 문서와 맞는지.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-cloud-benefits`의 개념 7개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**.
목록 개념은 항목 이름도. 위 표의 a~i마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다. 특히 e는 낱말 넷마다 「정의 있음 — <URL>, <붙일 개념>」 또는 「정의 없음 — 쓰지 않는다(D번호)」.
고가용성과 안정성, 확장성과 탄력성을 공식 문서가 어떻게 가르는지(가르지 않으면 그렇다고). `raw/official/`에 받은 파일 목록. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·3·6)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다.
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다(`raw/official/`에 받은 파일은 gitignore 안이라 나오지 않는다).
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다 — 공식 문서(영문·한국어판), 덤프, 용어집 모두. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/101-azure-benefits-sla-service-types/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 1·2가 쓴다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **덤프만 묻는 이점(내결함성·지리적 분산·재해 복구·민첩성)의 정의를 덤프·용어집에서 가져오지 마라.** 이유: 공식 문서가 정의하지 않은 것을 가르치게 된다. 공식 정의가 없으면 쓰지 않는다.
- **허용한 출처 밖의 문서(블로그·Q&A·Tech Community·위키백과·자격증 교재·덤프 사이트)를 근거로 쓰지 마라.** 이유: ADR-060과 `docs/source/azure/CLAUDE.md`.
- **`azure-sla-lifecycle`·`azure-service-types`의 사실(SLA 계산, 미리 보기, 세 유형의 책임 나눔)을 이 step에서 정리하지 마라.** 이유: step 3·6의 범위다. 이 주제가 한 줄로 풀 근거(SLA·IaaS·PaaS·SaaS의 한 줄 풀이)만 확인한다.
- **`docs/source/azure/CLAUDE.md`·`topic-map.md`·`dump-topics.tsv`를 고치지 마라.** 이유: 이 step이 쓰는 출처는 모두 이미 허용한 곳이다. 허용 목록에 없는 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
