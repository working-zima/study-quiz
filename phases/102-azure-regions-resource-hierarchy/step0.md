# Step 0: regions-sources

## 배경

phase 102는 Azure AZ-900 과목에 주제 둘(6 지역과 가용성 영역, 7 리소스 계층)을 더한다. 전체 계획과 결정은 `phases/102-azure-regions-resource-hierarchy/guide.md`에 있다.
step 1~3이 주제 `azure-regions-zones`(지역과 가용성 영역)의 개념 6개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고,
덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다. 두 문서의 형식은 앞 phase가 만든 것을 그대로 따른다.

이 주제의 중심 문제는 **Learn 단원 5(물리 인프라)와 현행 제품 문서(Azure reliability)가 어긋날 수 있다는 것**이다. 설계 때 본 예:
단원 5는 「대부분의 지역이 짝을 이룬다」·「짝은 300마일 이상 떨어져 있다」고 쓰지만, 「What are Azure regions?」는 「새 지역 다수는 짝이 없다」고 쓴다.
단원 5는 가용성 영역을 쓰는 서비스를 「영역 서비스·영역 중복 서비스·비지역 서비스」로 나누는데, 현행 「What are availability zones?」의 나눔과 이름이 같은지 모른다.
**둘이 다르면 현행 제품 문서를 따르고**(더 최근에 고친 쪽 — 각 쪽의 갱신 날짜를 본다), 학습자에게 어느 쪽을 가르칠지와 그 근거를 summary에 적는다. 짐작으로 둘을 합치지 마라.

덤프 쪽 문제는 **지원이 끝났거나 이름이 바뀐 것**(Azure Germany, 「Azure China」라는 옛 이름)과 **계속 바뀌는 수**(북미 지역 수·데이터 센터 수)다.

## 읽어야 할 파일

- `phases/102-azure-regions-resource-hierarchy/guide.md` — 특히 「두 주제와 개념 12개」의 `azure-regions-zones` 표, 「한국어판에서 본 것」, 「예시 값」, 「출처」, 「출처 step(0·4)의 공통 형식」
- `docs/source/azure/CLAUDE.md` — 원본 셋, 허용하는 출처, 가리키는 표기, 덤프의 그림을 보는 법. **이 규칙을 따른다**
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞 phase가 만든 형식을 따른다.** 이미 있는 항목 「Learn 「Describe the core architectural components of Azure」 — 5 …」, 「(phase 101) Azure reliability — What are Azure regions?」, 「한국어 표기 정리」 항목들을 먼저 읽는다
- `phases/101-azure-benefits-sla-service-types/verification.md`의 「설계와 달라진 것」 — 출처 step이 표기를 정한 방식
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `regions-zones`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다
  (설계 때 본 것: NO.20·27·45·72·82·87·156·178·186·221·233·234·243·267·281·320·340·391·392·403·423·455·461·462·468·478·493·502). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/2-architecture-services.md`의 Azure 리전·지역 쌍·가용성 영역·데이터 센터 항목, `1-cloud-concepts.md`의 데이터 주권 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — `learn-describe-core-architectural-components-of-azure-5-describe-azure-physical-infrastructure.md`와 `ko-` 판, `docs-reliability-regions-overview.md`와 `ko-` 판, `az-900-study-guide.md`
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

공식 문서는 `python -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 받아 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다).
이름은 `learn-<모듈>-<단원>.md`(Learn 단원), `docs-<서비스>-<쪽>.md`(제품 문서), `azure-<쪽>.md`(azure.microsoft.com), 한국어판은 앞에 `ko-`를 붙인다.
영문판(`en-us`)으로 사실을 확인하고, 한국어판(`ko-kr`)은 **용어 표기만** 본다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `datacenter` | 데이터 센터의 정의(서버를 둔 랙, 전용 전원·냉각·네트워크), 온-프레미스 데이터 센터와 같은 종류지만 더 크다는 것, **고객이 데이터 센터 하나하나를 직접 다루지 않고** 지역·가용성 영역으로 고른다는 것. **서버**·**랙**을 한 줄로 풀 근거. 용어집 데이터 센터 항목의 수치 주장(데이터 센터 수 등)은 쓰지 않는다 — 공식 문서가 말해도 바뀌는 수다 | Learn 단원 5(받아 둠) |
| b | `region` | 지역의 정의(지리적 영역, 가까이 있고 저지연 네트워크로 이어진 데이터 센터 하나 이상), 배포할 때 지역을 고른다는 것, 일부 서비스·VM 기능이 일부 지역에만 있다는 것, **지역을 고르지 않는 서비스**의 현행 예(단원 5는 Microsoft Entra ID·Azure Traffic Manager·Azure DNS — 현행 「Azure nonregional services」 목록과 맞는지), **지리**(geography)의 정의와 지역과의 관계(지역은 지리 하나 안에, 지리는 데이터 상주 경계), 지역을 고를 때 따질 것(대기 시간·가용성 영역·데이터 상주). **대기 시간**을 한 줄로 풀 근거. **Microsoft Entra ID**·**Azure DNS**를 한 줄로 풀 근거(무엇을 하는 서비스인지 — 해당 제품 문서의 개요 첫 문단). 덤프 NO.221·243·267. NO.186·391·403의 지역 수·데이터 센터 수는 「쓰지 않는다」(바뀌는 수) — 지역 사이 데이터 전송 비용 부분은 주제 `azure-cost-factors`의 몫이라고만 적는다 | Learn 단원 5, 「What are Azure regions?」(받아 둠), 「Azure nonregional services」(`learn.microsoft.com/azure/reliability/regions-nonregional-services`), Microsoft Entra ID·Azure DNS 개요 |
| c | `availability-zones` | 가용성 영역의 정의(한 지역 안의 물리적으로 분리된 데이터 센터 하나 이상, 독립된 전원·냉각·네트워크, 격리 경계, 영역 사이 고속 사설 네트워크), **지원 지역에는 최소 셋**, 모든 지역이 지원하지는 않는다, 쓰는 법(리소스를 영역에 두고 다른 영역에 복제), 복제·영역 사이 전송에 비용이 들 수 있다는 것, **영역이 막는 장애와 못 막는 장애**(데이터 센터·영역 하나 / 지역 전체 — 현행 문서의 말로), 온-프레미스에서 중복을 두려면 하드웨어를 더 사야 했다는 대비. 영역 사이 거리에 대한 말(현행 문서는 「저지연이 될 만큼 가깝고, 폭풍·정전 같은 것에서 격리될 만큼 멀다」로 쓴다)이 있으면. **중복**을 한 줄로 풀 근거. 「영역 1·2·3」 같은 번호를 공식 문서가 쓰는지(도식의 이름표로 쓴다). 덤프 NO.20·27·72·82·156·233·340·455·461·478 — 영역이 막는 장애의 범위를 묻는 문항(NO.82·340·455)은 그림까지 보고 덤프 답이 현행 정의와 맞는지. NO.87(리소스 그룹으로 나누기)·NO.423(확장 집합)은 이 주제가 아니다 — 덤프 답이 맞는지만 보고 summary에 적는다. NO.493은 「쓰지 않는다」(서비스별 SLA 수치) | Learn 단원 5, 「What are availability zones?」(`learn.microsoft.com/azure/reliability/availability-zones-overview`)와 한국어판 |
| d | `zone-service-categories` | 가용성 영역을 지원하는 서비스의 범주 — 단원 5의 셋(영역 서비스: 리소스를 영역 하나에 고정, 예 VM·관리 디스크·IP 주소 / 영역 중복 서비스: 플랫폼이 영역에 걸쳐 저절로 복제, 예 영역 중복 스토리지·SQL Database / 비지역 서비스: 지역에 묶이지 않아 영역·지역 전체의 중단에도 쓸 수 있다)과 **현행 문서의 나눔·이름이 같은지**. 다르면 현행을 따르는 안과 그 근거를 summary에. 범주 묶음 전체를 가리키는 개념 이름(잠정 「가용성 영역 서비스 범주」)을 한국어판 표기로 정한다. 덤프 NO.320·502(가용성 영역의 지원 범위·용도) — 그림까지 본다 | c의 문서들, 「Azure nonregional services」 |
| e | `region-pairs` | 지역 쌍의 정의와 **현행 상태**: Microsoft가 짝을 정하고 고객은 고를 수 없다, 같은 지리 안, 짝 사이 거리(단원 5의 300마일이 현행 문서에도 있는지), 짝지은 까닭(지역 전체에 미치는 사건에 대비한 복제), **모든 서비스가 저절로 복제·장애 조치하지 않는다**(고객이 구성), 덧붙은 이점(큰 중단 때 짝마다 한 지역 먼저 복구, 계획된 업데이트는 한 지역씩, 데이터가 같은 지리 안 — 예외), 한 방향 짝, **짝이 없는 지역**(현행 문서는 새 지역 다수라고 쓴다 — 단원 5의 「대부분 짝」과 어떻게 맞출지), 실제 짝의 예(단원 5의 예가 현행 목록에도 있는지 — 있으면 본문에 써도 된다). **장애 조치**를 한 줄로 풀 근거. 덤프 NO.72. 용어집 지역 쌍 항목의 주장 | Learn 단원 5, 「Azure region pairs and nonpaired regions」(`learn.microsoft.com/azure/reliability/regions-paired`)와 한국어판 |
| f | `sovereign-regions` | 소버린 지역의 정의(주 Azure 인스턴스와 격리된 인스턴스, 규정 준수·법적 이유), **인스턴스**를 한 줄로 풀 근거. Azure Government(미국 정부 기관과 협력사, 물리·논리적 격리, 심사를 거친 미국인이 운영, 추가 규정 인증 — 누가 쓸 수 있나는 NO.392와 맞춰 본다), 21Vianet이 운영하는 Azure(현행 이름, Microsoft가 데이터 센터를 직접 유지하지 않는다 — 누가 운영하나는 NO.45·178·281과 맞춰 본다), 소버린 지역은 다른 지역처럼 동작하지만 서비스·기능이 적을 수 있다는 것. **한국어 표기**: 단원 5 한국어판이 「소버린 지역」(절 제목)과 「주권 지역」(본문)을 섞어 쓴다 — 다른 한국어 문서도 보고 하나로 정한다. **Azure Germany**(NO.468): 지원이 끝났다는 공식 문서를 찾아 D 항목으로 「쓰지 않는다」 — 찾지 못하면 그렇게 적고 역시 쓰지 않는다. NO.234·462 | Learn 단원 5, 「What is Azure Government?」(`learn.microsoft.com/azure/azure-government/documentation-government-welcome`), 21Vianet 운영 Azure 개요(`learn.microsoft.com/azure/china/`) |
| g | 도식 | `AzureRegionDiagram`(지역 둘이 지리 하나 안에, 지역마다 데이터 센터들, VM 1을 지역 A에 배포, 지역을 고르지 않는 서비스 하나), `ZoneIsolationDiagram`(지역 안의 영역 1·2·3에 VM 1·2·3, 영역 1이 멈출 때와 지역 전체가 멈출 때), `RegionPairDiagram`(지리 안의 지역 A·B, 지역 A 재해 때 지역 B로 장애 조치 — 일부 서비스만 저절로, 계획된 업데이트는 한 지역씩)의 라벨·곁말·캡션의 사실마다 근거가 b·c·e에 있는지 | b·c·e의 결과 |

빠진 것을 읽다가 찾으면 더한다. 덤프 문항(위 번호)과 용어집 항목을 하나씩 읽어 공식 문서와 다른 주장이 더 있는지 본다.
NO.186·391·403·493은 다른 주제와 함께 걸린 문항이다 — 앞 phase의 D 항목에 이미 있으면 새로 만들지 말고 summary에 그 번호를 적는다.

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·4)의 공통 형식」대로. 이미 있는 단원 5 항목과 「What are Azure regions?」 항목에는 사실 줄을 덧붙이고(끝에 `(phase 102)`), 새로 받은 문서는 새 항목으로 둔다.
끝에 「한국어 표기 정리 — `azure-regions-zones`」 항목 — 개념 6개와 목록 항목 이름(가용성 영역 서비스 범주의 셋)마다 고른 표기와 근거 문서, 섞여 쓰인 표기(소버린/주권, 지역/리전)와 고른 까닭.

### 3. `docs/source/azure/corrections.md`에 더한다

D38·G20부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.468 Azure Germany** — 지원이 끝났다(쓰지 않는다).
- **NO.45·178·234·281의 「Azure China」** — 현행 이름(21Vianet 운영)으로 고친다는 처리. 운영 주체에 대한 덤프 답이 현행 문서와 맞는지.
- **NO.186·391·403의 지역 수·데이터 센터 수** — 바뀌는 수라 쓰지 않는다(앞 phase 항목에 없으면).
- **NO.493의 SLA 수치** — 쓰지 않는다(phase 101의 SLA 처리와 같다 — 그 D 번호를 가리킨다).
- 용어집 지역 쌍·가용성 영역 항목의 거리·수치 주장, 「Azure 리전」 표기(phase 101이 「지역」으로 정했다 — 그 근거를 가리킨다).
- Learn 단원 5와 현행 제품 문서가 어긋나는 곳(지역 쌍의 비율·거리, 범주 이름) — 덤프·용어집이 아니라 공식 문서끼리의 차이이므로 D·G 항목이 아니라 `official.md`의 그 항목에 「현행 문서와 다름 — 현행을 따른다」 줄로 남긴다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-regions-zones`의 개념 6개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**.
목록 개념(`zone-service-categories`)은 항목 이름도. 위 표의 a~g마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다.
특히 (1) 지역 쌍을 「대부분」으로 쓸지 「일부」로 쓸지와 거리를 쓸지, (2) 범주 셋의 현행 이름, (3) 소버린/주권 표기, (4) 지역을 고르지 않는 서비스로 본문에 쓸 예와 그 풀이 근거, (5) 도식 셋에 쓸 수 있는 실제 이름(예: 영역 번호, 지역 쌍의 예).
받은 파일 목록(`raw/official/`). 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·4)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작 138개).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/102-azure-regions-resource-hierarchy/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 1~3이 쓴다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.** 이유: 허용 출처를 넓히는 것은 설계에서 정한다. 다른 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **지역 목록·지역 수·데이터 센터 수를 `official.md`에 사실로 적지 마라.** 이유: 계속 바뀌는 수라 가르치지 않는다(guide.md 「배경」). 쓰지 않는다는 처리만 남긴다.
- **`azure-resource-hierarchy`의 사실을 이 step에서 정리하지 마라.** 이유: step 4의 범위다.
- **`topic-map.md`·`dump-topics.tsv`를 고치지 마라.**
