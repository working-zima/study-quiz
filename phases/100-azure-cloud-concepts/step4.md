# Step 4: cloud-computing-sources

## 배경

phase 100은 Azure AZ-900 과목의 틀과 첫 두 주제를 만든다. 전체 계획과 결정은 `phases/100-azure-cloud-concepts/guide.md`에 있다.
step 5·6이 주제 `azure-cloud-computing`(클라우드 컴퓨팅과 비용 모델)의 개념 7개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 출처 문서에 남기고,
덤프·용어집이 공식 문서와 다른 곳을 수정 이력으로 남긴다.** 데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

이 step이 Azure 과목의 출처 문서 둘을 처음 만든다.

- `docs/source/azure/official.md` — 공식 문서에서 확인한 사실과 URL. 네트워크의 `docs/source/network/standards.md`에 해당한다.
- `docs/source/azure/corrections.md` — 덤프(`D…`)·용어집(`G…`)이 공식 문서와 다르거나 공식 문서에 없는 곳과 그 처리. 네트워크의 수정 이력(`lecture-outline.md`의 L…)과 `exam-notes.md`를 합친 자리다.

설계 세션이 이미 받아 둔 공식 문서가 `docs/source/azure/raw/official/`에 있다 — Learn 단원 「Describe cloud computing」의 3(What is cloud computing)·5(Define cloud models)·6(Describe the consumption-based model)
영문판과 한국어판(`ko-…`), 학습 가이드. 그 밖의 문서는 이 step이 받는다.

## 읽어야 할 파일

- `phases/100-azure-cloud-concepts/guide.md` — 특히 「두 주제와 개념 12개」의 `azure-cloud-computing` 표, 「예시 값」, 「출처」
- `docs/source/azure/CLAUDE.md` — 원본 셋, 허용하는 출처, 가리키는 표기. **이 규칙을 따른다**
- `docs/source/network/standards.md`의 머리말과 항목 몇 개, `docs/source/network/exam-notes.md`의 E1~E3, `docs/source/network/lecture-outline.md`의 「강의 수정 이력」 L1~L3 — 형식의 본보기
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `cloud-computing`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다
  (설계 때 본 것: NO.6·8·10·11·34·61·78·92·124·126·241·336·338·350·356·387·400·410·471·494). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/1-cloud-concepts.md`의 클라우드·클라우드 컴퓨팅·Pay-As-You-Go·예약 인스턴스·스팟 인스턴스·서버리스·FaaS·CapEx·OpEx·자본 지출·운영 비용·멀티 테넌시·하이퍼바이저 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, ADR-060(step 3이 쓴 Azure 과목 ADR — 번호는 step 3 summary)

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

공식 문서는 `python -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 받아 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다).
이름은 `learn-<모듈>-<단원>.md`(Learn 단원), `docs-<서비스>-<쪽>.md`(제품 문서), 한국어판은 앞에 `ko-`를 붙인다. 영문판(`en-us`)으로 사실을 확인하고, 한국어판(`ko-kr`)은 **용어 표기만** 본다.
공식 학습 가이드는 「Compare cloud pricing models」·「Describe serverless」를 묻지만 Learn 모듈 「Describe cloud computing」에는 그 단원이 없다 — Learn에서 그 내용을 다루는 단원이 따로 있는지 먼저 찾고,
없으면 제품 문서(아래 「볼 곳」)로 확인한다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `cloud-computing` | 클라우드 컴퓨팅의 정의(인터넷으로 컴퓨팅 서비스 제공), 서비스의 예(VM·스토리지·데이터베이스·네트워킹), 데이터 센터처럼 물리 인프라에 묶이지 않는다는 것, 계절 행사의 예. **덤프가 묻는 셋**: 클라우드를 쓰려고 자기 물리 서버가 필요 없는가(NO.410), 인터넷 연결이 필요한가(NO.410), 가상화로 여러 고객에게 동시에 제공하는가(NO.61) — 공식 문서가 직접 말하는가 | Learn `describe-cloud-compute` 단원 3(받아 둠), 가상화·다중 테넌트를 말하는 Learn·제품 문서(예: Azure의 격리·다중 테넌트를 설명하는 보안 문서) |
| b | 풀이 낱말 | 이 주제가 한 줄로 풀어야 할 낱말의 공식 문서 근거 — **데이터 센터**(전원·냉각·네트워크를 갖추고 서버를 둔 시설), **가상 머신(VM)**(물리 컴퓨터를 소프트웨어로 흉내 낸 컴퓨터), **스토리지**, **리소스** | Learn 「Describe Azure physical infrastructure」, 「Describe Azure virtual machines」, 「Describe Azure resources and resource groups」 단원 |
| c | `capex-opex` | 자본 지출·운영 지출의 정의(Learn 단원 6), 클라우드가 운영 지출로 분류된다는 것. **공식 문서가 직접 드는 예**가 있는지(데이터 센터 짓기, 장비 구매, 임대 등). 덤프가 묻는 분류 예 — 직원 월급(NO.6), 소프트웨어 임대(NO.6), 데이터 센터 전기료(NO.350·400 해설), 종량제 요금(NO.124·338·350·400), 예약 VM 인스턴스(NO.400) — 가운데 공식 문서가 말하는 것과 말하지 않는 것 | Learn 단원 6(받아 둠), Cloud Adoption Framework(`learn.microsoft.com/azure/cloud-adoption-framework/`)에서 CapEx·OpEx를 말하는 쪽 |
| d | `consumption-based-model` | 정의, 이점 넷, 용량 계획(기존 vs 클라우드 — 크게 잡으면 노는 인프라, 작게 잡으면 성능 저하와 하드웨어·전원·냉각 주문), 클라우드는 수요에 맞춰 VM을 더하고 뺀다. 덤프 NO.10·387의 진술(소비 기반 요금제에서 데이터를 고정 요금으로 내는가, 필요할 때만 늘린 용량에 내는가, 서버리스가 그 예인가)이 공식 문서와 맞는지. **한국어 표기** — 한국어판 단원 6 안에서 「소비 기반 모델」과 「사용량 기반 모델」이 섞여 있다. 다른 한국어판 문서(학습 가이드 한국어판 등)도 보고 하나를 정한다 | Learn 단원 6 영문·한국어판(받아 둠), 학습 가이드 한국어판 |
| e | `pay-as-you-go` | 종량제가 클라우드 공급자의 가격 모델이라는 것(Learn 단원 6 「Cloud pricing」), 미리 기간을 약속하지 않는다는 것의 근거, 요금을 재는 단위(VM은 초나 분·시간 단위로 매긴다는 것을 공식 문서가 말하는가), 공급자가 전원·냉각·하드웨어·네트워킹을 유지 관리한다는 것. 덤프 NO.471(웹사이트를 옮기면 달마다 사용료) | Learn 단원 6, VM 가격·청구 문서(`learn.microsoft.com/azure/virtual-machines/` 아래, 또는 `azure.microsoft.com` 가격 페이지) |
| f | `reservations` | Azure 예약 — 1년·3년 약정, 종량제보다 낮은 가격, 청구 할인이라 리소스 동작은 그대로, 사면 맞는 리소스에 할인이 저절로 붙음, 선불·월별 결제와 총액이 같음, **쓰지 않은 시간의 할인이 사라지는가**(「use-it-or-lose-it」), 어떤 작업에 맞는가. 덤프 NO.34(가장 긴 기간 3년). 한국어 표기(「Azure 예약」, 「예약 VM 인스턴스」 등) | `learn.microsoft.com/azure/cost-management-billing/reservations/save-compute-costs-reservations`, 같은 폴더의 VM 예약 문서·「예약 할인 적용」 문서 |
| g | `spot-vm` | Azure 스팟 가상 머신 — 쓰이지 않는 용량을 크게 할인된 가격에, Azure가 용량이 필요하거나 가격이 정한 최고 가격을 넘으면 회수, 회수 전 예고 시간, SLA·고가용성 보장 없음, 맞는 작업(일괄 처리, 개발·테스트, 큰 계산 작업), 회수 정책(할당 해제·삭제). **SLA**를 한 줄로 풀 근거(서비스 가동 시간 등에 대한 Microsoft의 약속). 할인 폭의 수치는 확인하더라도 본문에 쓰지 않는다(guide.md 「예시 값」) | `learn.microsoft.com/azure/virtual-machines/spot-vms`, SLA를 설명하는 Learn 쪽 |
| h | `serverless` | 서버리스의 뜻 — 서버를 배포·유지하는 일을 공급자가 맡는다, 이벤트에 따라 실행되고 수요에 따라 늘고 준다, 실행한 만큼 낸다(어느 요금제가 그런지 — Flex Consumption·Consumption). Azure Functions가 서버리스의 예라는 것. **VM과의 차이**(VM은 사용자가 OS를 관리하고 켜 둔 동안 요금이 붙는다는 것을 공식 문서가 말하는가). 덤프 NO.126의 답(Virtual Machines)이 틀렸다는 근거 | `learn.microsoft.com/azure/azure-functions/functions-overview`, Functions 호스팅 옵션 문서, Learn 「Describe Azure Functions」 단원(AZ-900 모듈 「Describe Azure compute and networking services」) |
| i | 표 | `PricingModelsTable`(종량제·예약·스팟을 「미리 약속하는 것」·「어떤 작업에 맞나」로 견줌)의 칸마다 근거가 e·f·g에 있는지 | e·f·g의 결과 |

빠진 것을 읽다가 찾으면 더한다. 덤프 문항(위 번호)과 용어집 항목을 하나씩 읽어 공식 문서와 다른 주장이 더 있는지 본다.

### 2. `docs/source/azure/official.md` — 새로 만든다

- 머리말(네트워크 `standards.md`의 짜임): 무엇을 모으는지(Azure 과목의 사실 출처 — 공식 문서에서 확인한 사실과 URL), 규칙(허용하는 곳만 — `docs/source/azure/CLAUDE.md` 「허용하는 출처」,
  사실은 직접 쓴 말로, 항목마다 절 제목, 영문판으로 사실을 확인하고 한국어판은 표기만, 항목마다 **확인한 날**, 바뀌기 쉬운 것(요금제 이름·지원 종료)은 그 사실과 날짜, 「쓰인 곳」에 개념 id와 수정 이력 번호),
  덤프·용어집이 다른 곳은 여기가 아니라 `corrections.md`에 둔다는 것. 「(phase 100)」이 붙은 항목이 이 phase가 더한 것이라는 한 줄.
- 항목 형식: `## (phase 100) <문서 제목> — <단원·절 제목>`, URL 한 줄, 직접 쓴 사실 한 줄씩(끝에 `— 「절 제목」`), **한국어 표기** 줄(그 문서의 한국어판이 쓰는 용어 — 예: `consumption-based model` → 소비 기반 모델),
  「쓰인 곳」(아직 개념이 없으므로 **쓰일 개념 id** `azure-cloud-computing.capex-opex` 등과 D·G 번호).
- 학습 가이드(`raw/official/az-900-study-guide.md`)도 한 항목으로 둔다 — 영역 셋과 비율, 이 주제가 속한 묶음의 항목들(범위의 근거).

### 3. `docs/source/azure/corrections.md` — 새로 만든다

- 머리말: 덤프와 용어집이 공식 문서와 다르거나 공식 문서에 없는 곳과 그 처리를 모은다(`docs/source/azure/CLAUDE.md` 「충돌하면 공식 문서를 따른다」). 규칙 —
  덤프·용어집 문장을 옮기지 않고 무엇을 주장하는지만 직접 쓴 말로 적는다, 표기 `[덤프 NO.34]`·`[용어집 1-12]`, 처리는 셋 가운데 하나(**고쳐 쓴다** / **한정해 쓴다** / **쓰지 않는다**),
  「자격시험은 ~로 본다」 줄은 쓰지 않는다(덤프는 시험 주관 기관의 문항이 아니다), 공식 문서 쪽 근거와 URL은 `official.md`에 있다. 확인한 날.
- 덤프 항목 `## D1 — <짧은 제목>`: **덤프**(문항 번호와 덤프가 정답으로 보는 것) · **공식 문서**(무엇을 말하는가, 또는 말하지 않는가) · **처리** · **쓰인 곳**.
  덤프 답이 공식 문서와 **맞는** 문항은 항목을 만들지 않는다 — summary에 「확인 결과 덤프가 맞다」로 적는다.
- 용어집 항목 `## G1 — <짧은 제목>`: **용어집**(쪽-번호와 주장) · **공식 문서** · **처리** · **쓰인 곳**. 이 주제에 걸린 용어집 항목만 본다.
- 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.
  - **NO.126 서버리스의 예**: 덤프 답이 Virtual Machines다. Functions가 서버리스라는 공식 근거(h)로 「덤프 답이 틀렸다 — 고쳐 쓴다」.
  - **NO.400 예약 VM 인스턴스와 운영 지출**: 덤프가 무엇을 정답으로 보는지 그림으로 확인하고, 해설이 다른 문항(NO.350 전기료)의 것을 옮겨 온 것인지 본다. 공식 문서가 예약을 자본·운영 지출로 나누지 않으면 「쓰지 않는다」.
  - **데이터 센터 전기료**(NO.350·400): 덤프가 자본 지출로 보는지 운영 지출로 보는지 그림으로 확인한다. 공식 문서가 직접 말하지 않으면 「쓰지 않는다」 — 정의에서 추론해 가르치지 않는다.
  - **NO.10·387의 첫 진술**(소비 기반 요금제에서 오가는 데이터에 고정 요금): 공식 문서와 맞는지.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-cloud-computing`의 개념 7개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**.
위 표의 a~i마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다. `raw/official/`에 받은 파일 목록. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

```bash
npm test
node scripts/check-verbatim.mjs --subject azure
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다. `check-verbatim`은 원본 수가 받은 문서만큼 늘어 있어야 한다(단위는 아직 0개).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다(`raw/official/`에 받은 파일은 gitignore 안이라 나오지 않는다).
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다 — 공식 문서(영문·한국어판), 덤프, 용어집 모두. `official.md`·`corrections.md`의 한국어 문장이 `raw/official/ko-…`와 32자 넘게 겹치지 않는지
   `node -e`로 `findVerbatimRuns`(`scripts/check-verbatim.mjs`가 export한다)에 두 파일의 문단을 넣어 본다.
4. `phases/100-azure-cloud-concepts/index.json`의 step 4를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 5·6이 쓴다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **허용한 출처 밖의 문서(블로그·Q&A·Tech Community·위키백과·자격증 교재·덤프 사이트)를 근거로 쓰지 마라.** 이유: ADR-060과 `docs/source/azure/CLAUDE.md`.
- **덤프·용어집·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009. 공식 문서 한국어판은 특히 그대로 옮기기 쉽다.
- **덤프 답을 공식 문서 없이 사실로 적지 마라.** 이유: 덤프에는 틀린 답이 있다(NO.126 등).
- **`azure-cloud-models`의 사실(퍼블릭·프라이빗·하이브리드·다중 클라우드)을 이 step에서 정리하지 마라.** 이유: step 7의 범위다. 읽다가 본 것은 summary에 메모만 한다.
- **`docs/source/azure/CLAUDE.md`·`topic-map.md`·`dump-topics.tsv`를 고치지 마라.** 이유: 이 step이 쓰는 출처는 모두 이미 허용한 곳이다. 허용 목록에 없는 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
