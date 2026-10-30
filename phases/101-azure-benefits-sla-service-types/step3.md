# Step 3: sla-lifecycle-sources

## 배경

phase 101은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획과 결정은 `phases/101-azure-benefits-sla-service-types/guide.md`에 있다.
step 4·5가 주제 `azure-sla-lifecycle`(SLA와 서비스 수명 주기)의 개념 6개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고,
덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 또 허용 출처 목록에 약관 쪽 한 줄을 더한다. 데이터·코드는 고치지 않는다.

이 주제는 **공식 학습 가이드 밖**이다(사용자 결정으로 넣었다). 그래서 Learn 학습 경로에 단원이 없고, 사실은 흩어진 공식 문서에서 모아야 한다 —
SLA는 Well-Architected Framework, 미리 보기는 Azure 미리 보기 추가 약관과 Learn 문서의 미리 보기 안내, 수명 주기 정책은 Microsoft 수명 주기 문서.
SLA 약관 원문(`microsoft.com/licensing`)은 받을 수 없어 쓰지 않는다(guide.md 「배경」). 그래서 **덤프가 묻는 SLA 수치(유료 서비스의 하한, VM SLA 값)는 `learn.microsoft.com` 문서가 직접 말하지 않으면 쓰지 않는다.**

## 읽어야 할 파일

- `phases/101-azure-benefits-sla-service-types/guide.md` — 특히 「세 주제와 개념 17개」의 `azure-sla-lifecycle` 표, 「예시 값」, 「출처」, 「출처 step(0·3·6)의 공통 형식」
- `phases/101-azure-benefits-sla-service-types/index.json`의 step 0 `summary`(받은 문서 목록, 형식), step 1·2 `summary`(고가용성 개념이 SLA를 어떻게 한 줄로 풀었는지 — 표기를 맞춘다)
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **phase 100이 만든 형식을 따른다**
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `sla-lifecycle`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다
  (설계 때 본 것: NO.4·39·57·58·63·71·132·143·150·172·175·196·210·237·328·337·358·378·390·397·407·411·447). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/1-cloud-concepts.md`의 SLA·업타임·고가용성 항목과, 다른 쪽(`2-…`·`3-…`·`4-…`)에서 SLA·미리 보기·수명 주기를 말하는 항목 — 무엇을 주장하는지만 본다
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 허용 출처에 약관 쪽을 더한다 — `docs/source/azure/CLAUDE.md`

「허용하는 출처」의 `azure.microsoft.com` 줄에 약관 쪽(`/support/legal/` — 예: 「Supplemental Terms of Use for Microsoft Azure Previews」)을 더한다. 더한 날(이 step을 실행한 날)과 이유(미리 보기를 정하는 Microsoft 문서가 거기 있다, Microsoft가 낸 공식 문서라 이 목록의 기준에 맞는다, phase 101 설계)를 한 줄로.
그 아래 「목록에 없는 곳」 문단의 `microsoft.com/licensing` 예는 **쓰지 않기로 판단했다**로 바꾼다 — 이유: SLA 약관 쪽은 스크립트로 글자를 그려 `fetch_page.py`로 받을 수 없고, 받아 두지 못한 문서는 전사 검사를 할 수 없다(phase 101 설계).
그 밖의 줄은 고치지 않는다.

### 2. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

받는 법과 이름 규칙은 step 0과 같다(`scripts/azure-source/fetch_page.py` → `docs/source/azure/raw/official/`). 영문판으로 사실을 확인하고 한국어판은 용어 표기만 본다.
Well-Architected 문서 이름은 `docs-well-architected-<쪽>.md`, 수명 주기 문서는 `docs-lifecycle-<쪽>.md`, 약관은 `azure-legal-<쪽>.md`.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `sla` | SLA가 무엇인가(조직과 고객 사이의 공식 계약, 지키지 못하면 금전·법적 책임), Azure SLA가 가동 시간과 연결에 대한 Microsoft의 약속이라는 것, 서비스마다(상품마다) 다르다는 것, 서비스마다 가용의 정의가 있다는 것, SLA가 서비스 전체를 보장하지 않고 정한 범위만 덮는다는 것. SLA와 SLO의 차이(쓸지는 이 step이 정한다 — 쓴다면 한 줄). **한국어 표기**(서비스 수준 계약). **덤프 NO.58·237의 수치 주장(유료 서비스의 SLA 하한, 무료 서비스에는 SLA가 없다), NO.378(VM SLA가 무엇을 보장하나)** — `learn.microsoft.com` 문서가 직접 말하는가. 말하지 않으면 D 항목에 「쓰지 않는다」(약관 원문을 받을 수 없다는 이유와 함께). NO.447의 월간 가동률 계산식 — 공식 문서에 있는가 | Well-Architected 「Recommendations for defining reliability targets」(`learn.microsoft.com/azure/well-architected/reliability/metrics`)와 한국어판, Learn 「Describe the benefits of using cloud services」 단원 2(받아 둠 — SLA를 한 줄로 말한다) |
| b | `service-credit` | SLA를 지키지 못했을 때 서비스 크레딧을 받는 절차가 SLA에 있다는 것, 크레딧이 무엇인가(요금의 일부를 돌려받는 꼴인지), 저절로 주어지는지 고객이 청구해야 하는지 — **공식 문서가 말하는 만큼만**. 한국어 표기. 덤프 NO.71·175·196·397(덤프가 Azure AD 등급별 SLA로 묻는 NO.175·196은 옛 이름 — 현행 이름은 Microsoft Entra ID다. 등급별 SLA 수치는 쓰지 않는다) | a의 문서 |
| c | `composite-sla` | 여러 구성 요소에 함께 기대는 워크로드의 목표 가동률을 각 값의 곱으로 셈한다는 것(공식 문서는 「composite SLO」로 쓸 수 있다 — 그러면 이 개념의 이름과 풀이를 어떻게 할지 정한다. 「복합 SLA」라는 이름을 Microsoft 문서가 쓰는 곳이 있는지 찾아보고, 없으면 summary에 그렇게 적는다), 곱하면 어느 하나보다 낮아진다는 것, 높이려면 중복(여러 지역 배포 등)을 둔다는 것. guide.md 「예시 값」의 계산(0.999 × 0.9995 ≈ 0.9985)을 다시 셈한다. 덤프 NO.143·337·390의 계산이 맞는지 하나씩 셈한다 — 덤프 답이 틀린 문항은 D 항목 | a의 문서, Well-Architected 안정성 쪽의 다른 문서 |
| d | `preview` | **미리 보기**의 뜻(정식 출시 전에 평가용으로 내놓는 기능·서비스·지역), 비공개 미리 보기(Early Access 미리 보기 — 내부 시험·평가와 의견 제공 용도, 제3자에게 줄 수 없음, 운영 환경에 쓰지 않음, 기밀), 공개 미리 보기가 **누구나 써 볼 수 있는가**(그렇게 말하는 공식 문서를 찾는다), 미리 보기가 **SLA 없이 제공되고 운영 작업에 권하지 않는다**는 것(Learn 문서의 미리 보기 안내 문구 — 그런 안내가 실린 실제 Learn 쪽 하나를 받아 URL을 남긴다), 미리 보기를 쓰려면 고객이 약관에 동의해야 한다는 것. **한국어 표기**(미리 보기·비공개 미리 보기·공개 미리 보기). 덤프 NO.4·63·172·210·328·411 | 「Supplemental Terms of Use for Microsoft Azure Previews」(`azure.microsoft.com/support/legal/preview-supplemental-terms/` — 위 1에서 허용 목록에 더한 뒤 쓴다), 미리 보기 기능 안내가 있는 Learn 문서(예: `learn.microsoft.com/azure/azure-resource-manager/management/preview-features`) |
| e | `general-availability` | 일반 공급(GA)의 뜻 — 미리 보기를 마치고 정식으로 내놓은 것, 모든 고객이 쓸 수 있다, SLA가 적용된다, 운영에 쓸 수 있다(공식 문서가 말하는 것만). 미리 보기 컨테이너를 GA 뒤에는 GA 버전으로 바꿔야 한다는 약관의 예처럼, GA를 미리 보기와 대비해 말하는 공식 문장. 새 기능·서비스의 미리 보기·GA 소식을 Azure 업데이트(`azure.microsoft.com/updates`)에서 본다는 것. **한국어 표기**(일반 공급·GA). 덤프 NO.57·132·150·358(미리 보기·GA의 비용 — 공식 문서가 말하지 않으면 쓰지 않는다) | d의 문서, Azure 업데이트 쪽, Modern Lifecycle Policy(Azure 로드맵 링크) |
| f | `lifecycle-policy` | 최신 수명 주기 정책 — 계속 업데이트되는 제품·서비스에 적용, 지원이 이어지는 조건 셋(고객이 최신 상태 유지, 사용 권한, Microsoft의 지원 제공), 고객 조치가 필요한 변경은 최소 30일 전 통지, 후속 제품 없이 지원을 끝낼 때 최소 12개월 전 통지(무료 서비스·미리 보기 제외), 일부 Azure 서비스는 3년 전까지 통지할 수 있다는 것. Azure 서비스는 이 정책을 따르고, Azure VM에서 돌리는 Microsoft 소프트웨어는 고정 수명 주기 정책을 따른다는 것. **한국어 표기**(최신 수명 주기 정책, 고정 수명 주기 정책). 덤프 NO.39·407 | `learn.microsoft.com/lifecycle/policies/modern`, `learn.microsoft.com/lifecycle/faq/azure`와 한국어판 |
| g | 도식 | `CompositeSlaDiagram`(서비스 A 99.9%·서비스 B 99.95% → 앱 약 99.85%)과 `ServiceLifecycleDiagram`(비공개 미리 보기 → 공개 미리 보기 → 일반 공급, 단계마다 누가 쓸 수 있나·SLA)의 라벨·곁말·캡션의 사실마다 근거가 a~e에 있는지. 공개 미리 보기의 「누구나」가 확인되지 않으면 그 곁말을 어떻게 바꿀지 summary에 적는다 | a~e의 결과 |

빠진 것을 읽다가 찾으면 더한다. 덤프 문항(위 번호)과 용어집 항목을 하나씩 읽어 공식 문서와 다른 주장이 더 있는지 본다.
NO.493(99.99%를 위한 최소 VM·영역 수)은 주제 `azure-regions-zones`의 문항이다 — 이 step은 보지 않는다.

### 3. `official.md`·`corrections.md`에 더한다

guide.md 「출처 step(0·3·6)의 공통 형식」대로. step 0이 이어 쓴 번호 뒤부터(step 0 summary). 끝에 「한국어 표기 정리 — `azure-sla-lifecycle`」 항목.
미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **SLA 수치를 묻는 덤프**(NO.58·237·378, 그리고 NO.175·196의 등급별 SLA): 공식 문서(`learn.microsoft.com`)가 직접 말하지 않으면 「쓰지 않는다」.
- **Azure AD라는 옛 이름**(NO.175·196): 현행 이름 Microsoft Entra ID로 고친다는 처리(이 주제에서는 이름을 쓸 일이 없으면 「쓰지 않는다」).
- **복합 SLA 계산 문항**(NO.143·337·390): 덤프 답을 셈해 맞는지.
- 용어집 SLA 항목의 「99.9% 가용성 미달 시 크레딧을 환급」 같은 수치·절차 주장, 업타임 항목의 「월간 다운타임이 수십 분」.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-sla-lifecycle`의 개념 6개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**.
목록 개념(`preview`)은 항목 이름도. 위 표의 a~g마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다. 특히 c의 이름 결정(복합 SLA / 복합 SLO)과 그 근거, d의 「공개 미리 보기는 누구나」의 근거.
`docs/source/azure/CLAUDE.md`에 더한 줄. `raw/official/`에 받은 파일 목록. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·3·6)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다.
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`·`CLAUDE.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 약관 문서는 영문 법률 문장이라 그대로 옮기기 쉽다 — 특히 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/101-azure-benefits-sla-service-types/index.json`의 step 3을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 4·5가 쓴다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **`microsoft.com/licensing`의 SLA 약관을 근거로 쓰지 마라.** 이유: 받아 둘 수 없어 사실을 다시 확인하거나 전사 검사를 할 수 없다(guide.md 「배경」). 다른 곳에서 본 SLA 수치를 그 약관의 것이라고 적지도 마라.
- **`docs/source/azure/CLAUDE.md`의 허용 목록에 약관 쪽 한 줄 밖의 곳을 더하지 마라.** 이유: 허용 출처를 넓히는 것은 설계에서 정한다. 다른 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **`azure-cloud-benefits`·`azure-service-types`의 사실을 이 step에서 정리하지 마라.** 이유: step 0·6의 범위다.
- **`topic-map.md`·`dump-topics.tsv`를 고치지 마라.**
