# phase 101 공통 안내 — Azure AZ-900 과목의 클라우드의 이점·SLA와 서비스 수명 주기·서비스 유형과 공동 책임

이 phase의 **모든 step이 먼저 읽는 문서**다. step 문서는 자기 일의 세부만 적고, 과목 결정·세 주제의 개념 표와 글·문항·도식·파일 형식의 공통 규칙은 여기에 둔다.
step 문서와 이 문서가 다르면 step 문서를 따르고 그 차이를 summary에 적는다.

## 배경 — 다시 묻지 말 결정

Azure AZ-900 과목(`src/data/azure/`, ADR-060)은 phase 100에서 생겼다. 주제 지도(`docs/source/azure/topic-map.md`)의 주제 20개 가운데 1·2가 있고, **이 phase는 3·4·5를 더한다.**
이 셋으로 공식 학습 가이드의 첫 영역 「Describe cloud concepts」가 채워진다.

**phase 100이 남긴 것(이 phase의 출발점):**

- 주제 `azure-cloud-computing`(개념 7)·`azure-cloud-models`(개념 5), 문항 `az001`~`az014`(예 4·아니요 4, 4지선다 정답 위치 `answerIndex` 0~3이 1/2/2/1).
- 도식 `CapacityPlanningDiagram`·`PublicPrivateCloudDiagram`·`HybridCloudDiagram`, 표 `PricingModelsTable`·`CloudModelsTable`.
- 출처 문서 `docs/source/azure/official.md`(항목 머리 `## (phase 100) …`)와 `docs/source/azure/corrections.md`(D1~D15, G1~G9). **이 phase는 D16·G10부터 잇는다.**
- 검증 값: 테스트 218파일·5011개, 교차 검사 세로·가로 노드 982·경로 695, `check-verbatim --subject azure` 원본 64개·단위 98개.
- 실행 보고 `phases/100-azure-cloud-concepts/verification.md` — 출처 step이 정한 표기(「사용량 기반 모델」, 「스폿」, 「온-프레미스」)와 그 이유가 있다.

**사용자 결정(2026-10-30, 다시 묻지 마라):**

- **범위**: Microsoft Learn의 AZ-900 공식 학습 가이드(2026-07-20 기준)가 뼈대다. 가이드 밖이라도 **용어집에 있고 덤프도 묻는 현행 것**(SLA와 서비스 수명 주기 등)은 넣는다.
  지원이 끝난 서비스·옛 이름은 빼거나 현행으로 고친다. 덤프만 묻는 것은 넣지 않는다.
- **도식**: **주제마다 최소 하나**, 그리고 구조·흐름이 있는 개념(공동 책임 같은 것)에는 개념마다. 정의형 개념에는 없다. 비교표는 도식을 대신하지 않는다.
- 주제 지도(20개, 순서·별점·phase)는 사용자가 「고칠 것 없음」으로 확인했다.
- 사실의 기준은 **Microsoft 공식 문서**다. 덤프와 용어집은 범위·강조의 기준이자 사실 **후보**이고, 공식 문서와 다르면 공식 문서를 따르고 수정 이력에 남긴다(ADR-060).
  덤프 문항·용어집 문장은 옮기지 않는다(ADR-009, ADR-021과 같은 방식). 덤프는 시험 주관 기관의 문항이 아니므로 「자격시험은 ~로 본다」 줄을 쓰지 않는다.
- 용어는 **Microsoft 한국어 문서의 표기**를 따른다. 주제 id는 `azure-` 접두사, 별점은 덤프 출제 빈도(대표 문항 25 이상 ★★★, 13~24 ★★☆).

**이 phase에서 정한 것(설계, 이견이 있으면 사용자가 말한다):**

- 개념 17개, 문항 24개(`az015`~`az038`), 도식 넷, 표 하나. 아래 「세 주제와 개념 17개」.
- **허용 출처에 `azure.microsoft.com/support/legal/`(약관 쪽)을 더한다** — 미리 보기를 정하는 문서(「Supplemental Terms of Use for Microsoft Azure Previews」)가 거기 있다.
  Microsoft가 낸 공식 문서라 `docs/source/azure/CLAUDE.md`의 기준(Microsoft의 공식 문서)에 맞는다. step 3이 그 목록에 한 줄 더한다.
- **SLA 약관 원문(`microsoft.com/licensing`의 「Service Level Agreements (SLA) for Online Services」)은 쓰지 않는다** — 그 쪽은 스크립트로만 글자를 그리는 쪽이라
  `fetch_page.py`로 받을 수 없고(받으면 빈 틀만 온다), 받아 두지 못한 문서는 전사 검사도 할 수 없다. 그래서 **서비스마다의 SLA 수치(예: VM 99.9%)는 쓰지 않는다** —
  `learn.microsoft.com`의 문서가 직접 말하는 것만 쓴다. 덤프가 묻는 수치(「유료 서비스의 SLA 하한」 등)도 그 기준으로 step 3이 정리한다.
- 「공동 책임 모델」의 한국어 표기 — Microsoft 한국어판 Learn 단원은 「공유 책임 모델」이라 쓴다(용어집·주제 지도는 「공동 책임」). step 6이 다른 한국어 문서도 보고 하나로 정한다.
  **「공유 책임 모델」로 정하면 주제 제목도 「서비스 유형과 공유 책임」으로 바꾼다**(id `azure-service-types`는 그대로). 주제 제목과 개념 이름이 다르면 학습자가 같은 것인지 헷갈린다.
  제목을 바꾸면 step 7이 `topic-map.md` 표의 그 칸 하나를 함께 고친다(주제를 더하거나 나누는 일이 아니므로 ADR은 필요 없다).

**실행 규칙:**

- **step 하나는 30분 안에 끝나야 한다.** `scripts/execute.py`가 step을 1800초에서 끊는다. 그래서 step은 **브라우저 화면 실측(개발 서버·headless Chrome·CDP)을 하지 않는다** —
  phase가 끝난 뒤 메인 세션이 모든 도식을 한꺼번에 실측한다. 시간을 아끼려고 검증 명령을 건너뛰지는 마라.
- 「주제마다 도식 하나 이상」을 `src/components/diagrams/azureDiagramCoverage.test.ts`가 지킨다. 그래서 **주제를 처음 만드는 step(1·4·7)이 그 주제의 첫 도식도 함께** 만든다.
  저장소의 Stop 훅(`scripts/hooks/codex-verify-gate.sh`)은 테스트가 실패한 상태로 step을 끝내지 못하게 한다.
- **진행 안내 문장을 쓰지 않는다.** 「다음 개념에서 다룬다」, 「뒤에서 자세히 다룬다」처럼 글의 진행만 알리는 말은 `src/data/azure/data.test.ts`의 진행 안내 테스트가 막는다.
  뒤 개념이나 다른 주제가 자세히 다룰 낱말이 지금 필요하면 그 자리에서 한 줄로 풀고 넘어간다. 「앞 개념에서 본 것처럼」 같은 되짚기는 써도 된다.

## step 아홉 개

| step | 이름 | 하는 일 |
|---|---|---|
| 0 | `benefits-sources` | 주제 3이 쓸 사실을 공식 문서로 확인해 `official.md`·`corrections.md`에 더한다 |
| 1 | `availability-scalability` | 주제 3을 만들고 개념 1~3의 글·문항과 도식 `CloudScalingDiagram` |
| 2 | `reliability-manageability` | 개념 4~7의 글·문항 |
| 3 | `sla-lifecycle-sources` | 주제 4가 쓸 사실을 확인해 두 문서에 더하고, 허용 출처에 약관 쪽을 더한다 |
| 4 | `sla-composite` | 주제 4를 만들고 개념 8~10의 글·문항과 도식 `CompositeSlaDiagram` |
| 5 | `preview-ga-lifecycle` | 개념 11~13의 글·문항과 도식 `ServiceLifecycleDiagram` |
| 6 | `service-types-sources` | 주제 5가 쓸 사실을 확인해 두 문서에 더하고, 공동/공유 책임 표기를 정한다 |
| 7 | `shared-responsibility-iaas` | 주제 5를 만들고 개념 14~15의 글·문항과 도식 `SharedResponsibilityDiagram` |
| 8 | `paas-saas` | 개념 16~17의 글·문항과 표 `ServiceTypesTable` |

## 세 주제와 개념 17개

주제 객체(`src/data/azure/topics.json`의 기존 두 주제 뒤에 이 순서로):

```json
{ "id": "azure-cloud-benefits", "title": "클라우드의 이점", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }
{ "id": "azure-sla-lifecycle", "title": "SLA와 서비스 수명 주기", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }
{ "id": "azure-service-types", "title": "서비스 유형과 공동 책임", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }
```

별점: 주제 지도의 대표 문항 수가 `azure-cloud-benefits` 24, `azure-sla-lifecycle` 23(둘 다 ★★☆), `azure-service-types` 34(★★★)다. `data.test.ts`가 이 값을 본다.
`azure-service-types`의 제목은 step 6의 표기 결정을 따른다(「배경」).

개념 id는 `<주제 id>.<슬러그>`다. 표의 순서·슬러그·`parentId`를 바꾸지 않는다(바꿔야 할 이유가 있으면 바꾸지 말고 summary에 적는다).
**`name`은 출처 step(0·3·6)이 확인한 Microsoft 한국어 문서의 표기를 따른다** — 표의 이름은 잠정이다. 한국어판 안에서도 표기가 섞인 것(아래 「한국어판에서 본 것」)은 출처 step이 하나로 정하고 근거를 남긴다.
`parentId` 열의 값은 같은 주제의 슬러그다 — JSON에는 `azure-sla-lifecycle.sla`처럼 전체 id로 쓴다. 딸린 개념은 부모 바로 뒤에 이어 둔다(ADR-041).
「다룰 것」은 범위다. 문장은 직접 쓰고, 사실은 아래 「출처」대로 가져온다. 「step N 결과」라고 적힌 사실은 그 step의 summary와 출처 문서에 적힌 처리를 따른다 —
확인되지 않았으면 쓰지 않는다. 「덤프」 뒤의 `NO.`는 덤프 문항 번호다(`docs/source/azure/dump-topics.tsv`·`raw/dump/dump.md`).

**한국어판에서 본 것(설계 때, 출처 step이 다시 확인한다):** 한국어판 Learn 단원은 「수직 크기 조정」과 「수직 스케일링」을, 「안정성」(단원 제목)과 「신뢰도」(절 제목)를 섞어 쓰고,
「서비스로서의 인프라」·「서비스형 플랫폼」·「SaaS(Software as a Service)」처럼 세 유형의 이름 꼴이 서로 다르며, 공동 책임은 「공유 책임 모델」이다.

### `azure-cloud-benefits` — 클라우드의 이점 (공식 학습 가이드 「Describe the benefits of using cloud services」)

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 1 | `high-availability` | 고가용성 | — | 1 | 장애나 사건이 생겨도 리소스를 필요할 때 쓸 수 있게 가용 시간을 최대로 하는 것. Azure는 서비스마다 가동 시간 보장이 다르고, 그 보장이 **SLA**(한 줄로 푼다 — 서비스의 가동 시간에 대한 Microsoft의 약속)에 적힌다. 이 주제의 첫 개념이라 **리소스**·**가동 시간**을 짧게 푼다. **고가용성과 안정성(개념 4)은 공식 문서의 정의가 가깝다** — 이 개념은 「쓸 수 있는 시간」, 안정성은 「장애에서 회복해 계속 동작하는 능력」이라는 차이가 드러나게 쓴다. 덤프: NO.88·162 |
| 2 | `scalability` | 확장성 | — | 1 | **목록 개념** — 소개 문단(수요에 맞춰 리소스를 조정하는 능력, 수요가 줄면 줄여 비용도 준다 — 쓴 만큼 내는 모델이라서) 뒤 항목 둘. 수직 확장: 리소스 하나의 성능을 올리거나 내린다(VM에 CPU·RAM을 더하거나 줄임). 수평 확장: 리소스의 수를 늘리거나 줄인다(VM·컨테이너를 더하거나 뺌, 자동이나 수동). 늘리는 쪽과 줄이는 쪽의 이름(스케일 업·다운, 아웃·인)은 step 0 결과대로. 항목 이름은 step 0이 정한 표기. **CPU**·**RAM**·**컨테이너**를 한 줄로 푼다. 덤프: NO.147·355·371(수직·수평 구분), NO.139·165·315(짝짓기). **이 개념에 도식 `CloudScalingDiagram`을 붙인다** |
| 3 | `elasticity` | 탄력성 | — | 1 | 수요가 오르내리는 대로 리소스를 **자동으로, 그때그때** 늘리고 줄이는 성질 — step 0이 확인한 정의대로(설계 때 본 근거: Azure 클라우드 컴퓨팅 사전 「What is elasticity in cloud computing?」). **확장성과 무엇이 다른지**를 WRITING_GUIDE 4절대로 가른다 — 공식 문서가 둘을 어떻게 나누는지 step 0 결과대로(나누지 않으면 나누는 말을 지어내지 않는다). 덤프가 다섯 번 묻는다(NO.61·115·140·160·227 — 월말에 몰리는 사용량, 자동 크기 조정). 민첩성(NO.160·434)은 step 0이 공식 근거를 찾았을 때만 이 개념에 한 줄로 |
| 4 | `reliability` | 안정성 | — | 2 | 장애에서 회복해 계속 동작하는 시스템의 능력. 클라우드는 리소스를 세계 여러 **지역**(한 줄로 푼다 — 공식 문서의 정의로)에 둘 수 있게 분산된 설계라, 한 지역에 큰 재해가 나도 다른 지역은 계속 돈다 — 앱을 그 점을 쓰게 설계할 수 있고, 경우에 따라 클라우드가 알아서 다른 지역으로 옮긴다(step 0 결과대로). 고가용성(개념 1)과 무엇이 다른지 한 줄로 되짚는다. 덤프가 묻는 내결함성(NO.280·303·363)·지리적 분산(NO.22·75·139·165·315)·재해 복구(NO.103·188·405 — Site Recovery)는 **step 0이 현행 공식 문서에서 정의를 찾은 것만** 이 개념에 한 줄씩. 서비스 Azure Site Recovery는 이 주제의 범위가 아니다 — 이름도 쓰지 않는다 |
| 5 | `predictability` | 예측 가능성 | — | 2 | **목록 개념** — 소개 문단 뒤 항목 둘. 성능 예측 가능성: 고객에게 좋은 경험을 주는 데 필요한 리소스를 내다보는 것 — 자동 크기 조정·부하 분산·고가용성이 돕는다(부하 분산은 한 줄로 푼다). 비용 예측 가능성: 클라우드 지출을 내다보는 것 — 리소스 사용을 실시간으로 추적·모니터링하고, 분석으로 패턴을 찾고, 가격 계산기로 어림한다. 공식 문서가 둘 다 Well-Architected Framework와 엮어 말하는 것은 이름 없이 「설계 지침을 따르면」 정도로만(step 0 결과대로). 덤프: NO.179 |
| 6 | `security-governance` | 보안과 거버넌스 | — | 2 | **거버넌스**(조직이 정한 기술 표준·규정을 리소스가 지키게 하는 관리 — 공식 문서의 말로)를 한 줄로 푼다. 거버넌스 쪽: 템플릿으로 배포해 표준·규정에 맞추고, 표준이 바뀌면 한꺼번에 고치고, 감사가 기준에서 벗어난 리소스를 짚는다. 보안 쪽: 보안을 최대로 통제하려면 IaaS(운영 체제·설치한 소프트웨어와 그 패치를 사용자가 관리), 패치를 맡기고 싶으면 PaaS·SaaS — **세 유형은 이 주제에서 한 줄씩만 푼다**(이 과목의 `azure-service-types` 주제가 자세히 다루지만 그 말을 쓰지 않는다). 공급자가 DDoS 공격(한 줄로 푼다)에 대비하는 데 유리하다는 것은 step 0 결과대로 |
| 7 | `manageability` | 관리 효율성 | — | 2 | **목록 개념** — 소개 문단 뒤 항목 둘. 클라우드의 관리(리소스를 관리하는 일): 수요에 따라 자동으로 늘리기, 미리 만든 템플릿으로 배포, 리소스의 상태를 모니터링해 실패한 리소스를 자동으로 바꾸기, 정한 지표로 자동 경고. 클라우드에서의 관리(무엇으로 관리하나): 웹 포털·명령줄 인터페이스·API·PowerShell. 항목 이름은 step 0이 정한 표기(설계 때 본 한국어판: 「클라우드 관리」·「클라우드에서의 관리」). **API**·**명령줄 인터페이스**를 한 줄로 푼다 |

### `azure-sla-lifecycle` — SLA와 서비스 수명 주기 (공식 학습 가이드 밖, 사용자 결정으로 넣음)

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 8 | `sla` | 서비스 수준 계약(SLA) | — | 4 | Microsoft가 서비스의 가동 시간과 연결에 대해 맺는 공식 약속. 서비스마다(같은 서비스 안에서도 상품마다) SLA가 다르고, 서비스마다 「가용」의 정의가 있다. 약속을 지키지 못하면 금전적 책임이 따르는 계약이라는 것, SLA가 서비스 전체를 보장하는 것이 아니라 정한 범위만 덮는다는 것(step 3 결과대로). 가동률을 백분율로 나타낸다는 것과 그 계산법(NO.447)은 step 3이 근거를 찾은 것만. **서비스마다의 SLA 수치는 쓰지 않는다**(「배경」). 덤프: NO.58·237·378 — step 3 결과대로 |
| 9 | `service-credit` | 서비스 크레딧 | `sla` | 4 | 서비스가 SLA를 지키지 못했을 때 고객이 받는 보상 — 요금의 일부를 돌려받는 꼴(step 3 결과대로). 받는 절차가 SLA에 들어 있다는 것, 저절로 주어지는지 고객이 청구해야 하는지는 step 3 결과대로. 덤프: NO.71·175·196·397 |
| 10 | `composite-sla` | 복합 SLA | `sla` | 4 | 앱이 여러 서비스에 함께 기댈 때 앱 전체의 가동률 — 각 서비스 값을 곱한다. 그래서 어느 한 서비스의 값보다도 낮아진다. 높이려면 중복(같은 것을 여러 지역에 두는 것 등)을 둔다는 것은 step 3 결과대로. 공식 문서가 「composite SLO」로 쓰면 이름과 풀이는 step 3이 정한 대로. **도식의 예**를 본문에 쓴다 — 서비스 A 99.9%와 서비스 B 99.95%에 함께 기대는 앱은 약 99.85%(아래 「예시 값」). **이 개념에 도식 `CompositeSlaDiagram`을 붙인다**. 덤프: NO.143·337·390 |
| 11 | `preview` | 미리 보기 | — | 5 | **목록 개념** — 소개 문단(Azure의 새 기능·서비스는 정식으로 내놓기 전에 미리 써 볼 수 있게 내놓는다, 평가·의견을 받으려고) 뒤 항목 둘. 비공개 미리 보기: 일부 고객만, 시험·평가와 의견 용도, 운영 환경에 쓰지 않는다(step 3 결과대로). 공개 미리 보기: 누구나 써 볼 수 있다(step 3 결과대로). 둘 다 SLA 없이 제공되고 운영 작업에 권하지 않는다는 것의 근거는 step 3 결과대로. **운영 환경**(실제 사용자가 쓰는 서비스를 돌리는 환경)을 한 줄로 푼다. 덤프: NO.4·63·172·210·328·411 |
| 12 | `general-availability` | 일반 공급(GA) | — | 5 | 미리 보기를 마치고 모든 고객에게 정식으로 내놓은 단계 — SLA가 적용되고 운영에 쓸 수 있다(step 3 결과대로). 미리 보기와 무엇이 달라지는지 4절대로. 새 기능 소식을 어디서 보는지(Azure 업데이트)는 step 3 결과대로 한 줄. 덤프: NO.57·132·150·358(비용은 step 3 결과대로). **이 개념에 도식 `ServiceLifecycleDiagram`을 붙인다** |
| 13 | `lifecycle-policy` | 최신 수명 주기 정책 | — | 5 | 계속 업데이트되는 제품·서비스에 Microsoft가 적용하는 지원 정책. 고객이 최신 상태를 유지하고, 사용 권한이 있고, Microsoft가 지원을 제공하는 동안 지원이 이어진다. 고객이 조치해야 하는 큰 변경은 최소 30일 전에, 후속 제품 없이 지원을 끝낼 때는 최소 12개월 전에 알린다(무료 서비스·미리 보기는 빠진다). 일부 Azure 서비스는 3년 전까지 알릴 수 있다. VM에서 돌리는 Microsoft 소프트웨어는 다른 정책(고정 수명 주기 정책)을 따른다 — 모두 step 3 결과대로. 덤프: NO.39·407 |

### `azure-service-types` — 서비스 유형과 공동 책임 (공식 학습 가이드 「Describe cloud service types」, 공동 책임 모델은 「Describe cloud computing」)

공동 책임 모델을 앞에 둔다 — 「클라우드에서는 누가 무엇을 맡는가」를 먼저 세우고, 세 유형을 그 위의 자리로 읽게 하려는 것이다(Learn 학습 경로도 공동 책임을 서비스 유형보다 먼저 다룬다).

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 14 | `shared-responsibility-model` | 공동 책임 모델 | — | 7 | 클라우드를 쓰면 책임이 공급자와 고객 사이에 나뉜다는 모델. 온-프레미스 데이터 센터에서는 모든 것이 조직의 책임이다(한 줄로 푼다 — phase 100이 정한 표기 「온-프레미스」). 늘 고객: 클라우드에 둔 정보와 데이터, 클라우드에 연결할 수 있는 장치, 사람·서비스·장치의 계정과 ID. 늘 공급자: 물리 데이터 센터·물리 네트워크·물리 호스트. 서비스 유형에 따라: 운영 체제·네트워크 제어·애플리케이션·ID와 액세스. 세 유형의 위치 — IaaS가 고객에게 가장 많이, SaaS가 공급자에게 가장 많이, PaaS가 그 사이(**세 유형은 이 개념에서 한 줄씩 풀고**, 뒤 개념이 자세히 다룬다는 말은 쓰지 않는다). 도식의 시나리오마다 어느 책임이 누구에게 있는지가 **이 본문에** 있어야 한다(ADR-036) — 행마다의 배정은 step 6 결과대로. **고객**·**공급자**·**운영 체제**·**ID**를 한 줄로 푼다. 이름은 step 6의 결정대로. **이 개념에 도식 `SharedResponsibilityDiagram`을 붙인다**. 덤프: NO.5·15·16·18·23·109·429·466 |
| 15 | `iaas` | IaaS(서비스로서의 인프라) | — | 7 | 가장 유연한 유형 — 클라우드 리소스를 가장 많이 통제한다. 공급자: 하드웨어, 인터넷 연결, 물리 보안. 고객: 운영 체제의 설치·구성·유지 관리, 네트워크 구성, 데이터베이스와 스토리지 구성. 클라우드 데이터 센터의 하드웨어를 빌리고 그 위에서 할 일은 고객이 정한다. 맞는 경우: 리프트 앤 시프트 마이그레이션(한 줄로 푼다), 개발·테스트 환경. Azure에서의 예(VM 등)는 step 6이 공식 문서에서 확인한 것만. 덤프: NO.17·266·310·327·376·418 |
| 16 | `paas` | PaaS(서비스로서의 플랫폼) | — | 8 | IaaS와 SaaS의 중간. 공급자가 물리 인프라·물리 보안·인터넷 연결에 더해 운영 체제·미들웨어·개발 도구·분석 서비스를 맡는다 — 고객은 운영 체제·데이터베이스의 라이선스와 패치를 신경 쓰지 않는다. 고객은 앱 코드·데이터·액세스 제어에 집중하고, 일부 네트워크·앱 보안 설정은 함께 맡는다. 맞는 경우: 개발 프레임워크, 분석·비즈니스 인텔리전스. **미들웨어**를 한 줄로 푼다. Azure에서의 예(App Service·SQL Database 등)는 step 6이 공식 문서에서 확인한 것만. 덤프가 가장 많이 묻는 유형이다: NO.135·155·166·182·189·191·201·257·290·301·348·463 |
| 17 | `saas` | SaaS(서비스로서의 소프트웨어) | — | 8 | 완성된 애플리케이션을 빌려 쓰는 유형 — 제품으로 보면 가장 완전하다. 예: 이메일, 재무 소프트웨어, 메신저. 가장 덜 유연하지만 시작하기 가장 쉽고 기술 지식이 가장 적게 든다. 공급자가 인프라·플랫폼·앱 유지 관리를 거의 다 맡고, 고객은 데이터·ID와 액세스 설정·장치 접근을 맡는다. Microsoft 365가 SaaS라는 것(NO.458)은 step 6 결과대로. **이 개념에 표 `ServiceTypesTable`을 붙인다** |

**문항 수**: 개념마다 하나, 일곱 개념(`scalability`·`elasticity`·`composite-sla`·`preview`·`shared-responsibility-model`·`iaas`·`paas`)만 둘 — 모두 24개, `az015`~`az038`.
문항은 개념 순서대로 `questions.json` 끝에 붙인다. step마다 맡는 id:

| step | id | 개념별 수 |
|---|---|---|
| 1 | `az015`~`az019` | 1 하나, 2 둘, 3 둘 |
| 2 | `az020`~`az023` | 4·5·6·7 하나씩 |
| 4 | `az024`~`az027` | 8 하나, 9 하나, 10 둘 |
| 5 | `az028`~`az031` | 11 둘, 12 하나, 13 하나 |
| 7 | `az032`~`az035` | 14 둘, 15 둘 |
| 8 | `az036`~`az038` | 16 둘, 17 하나 |

**예시 값 — 세 주제가 함께 쓴다:**

- **조직 이름**은 「회사 A」·「회사 B」처럼 이름표로 쓴다. 실제 회사 이름을 예로 들지 않는다(Azure·Microsoft와 Microsoft 365처럼 공식 문서가 사실로 드는 이름은 예외).
- **VM 이름표**는 `VM 1`·`VM 2`·`VM 3`. 수량(VM 대수)은 예시 값이라고 본문이나 캡션에서 밝힌다.
- **SLA 백분율**은 예시 값이다 — 실제 서비스의 SLA처럼 쓰지 않으려고 서비스 이름 대신 「서비스 A」·「서비스 B」로 쓴다. 개념 10의 예는 서비스 A **99.9%**, 서비스 B **99.95%**,
  둘에 함께 기대는 앱 **약 99.85%**(0.999 × 0.9995 = 0.9985005)다. 본문과 도식이 함께 쓰고, 문항은 다른 값을 쓴다.
- **정책이 정한 기간**(30일·12개월·3년)과 약정 기간처럼 공식 문서가 정한 값은 쓴다(step 3 확인). 가격·할인율은 쓰지 않는다.
- **서비스 이름**은 Microsoft 한국어 문서 표기로 쓰고, 영문 이름이 다르면 처음 나올 때 괄호에 적는다(출처 step이 표기를 확인한다).

도식은 본문에 나온 예시 값만 쓴다(ADR-038) — 그러니 이 값들을 도식에 쓰려면 그 개념의 본문에 먼저 쓴다.

## 출처

- 사실은 `docs/source/azure/official.md`(Microsoft 공식 문서에서 확인한 사실과 URL)에서만 가져온다. 출처 step(0·3·6)이 그 주제에 필요한 사실을 확인해 남긴다. 그 summary가 개념마다 무엇을 쓰고 무엇을 쓰지 않는지 적는다.
- 덤프·용어집의 주장이 `docs/source/azure/corrections.md`에 걸려 있으면 **고친 쪽**을 쓴다. 덤프·용어집에만 있고 공식 문서가 말하지 않는 주장은 쓰지 않는다.
- 개념 step에서 그 밖의 사실이 필요하면, 허용한 출처(`docs/source/azure/CLAUDE.md` 「허용하는 출처」)를 실제로 열어 확인하고 `official.md`에 URL과 「쓰인 곳」을 적은 뒤 쓴다.
  받은 문서는 `python -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다).
  확인하지 못한 사실은 쓰지 않는다. 블로그·Microsoft Q&A·Tech Community·위키백과·자격증 교재·덤프 사이트는 쓰지 않는다.
- **`official.md`의 「쓰인 곳」**: 출처 step은 아직 개념이 없으므로 「쓰일 곳」으로 적는다. 그 개념을 만든 step이 자기 개념 id가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(이 phase의 개념 step은 `official.md`를 고쳐도 된다 — phase 100에서는 목록 밖이라 마무리 때 메인 세션이 고쳤다).
- **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 덤프의 문제문·보기·해설, 용어집 설명, 공식 문서(특히 한국어판)의 문장을 옮기지 않는다. `check-verbatim --subject azure`는 하한선일 뿐이다.
- 덤프 문항을 그대로 문항으로 만들지 않는다 — 덤프가 같은 사실을 물어도 상황과 문장은 직접 만든다(ADR-021과 같은 이유).

설계 세션이 받아 둔 공식 문서(`docs/source/azure/raw/official/`, 영문판과 한국어판 `ko-…`):

- Learn 「Describe the benefits of using cloud services」 단원 2(고가용성·확장성, phase 100에서 받음)·3(안정성·예측 가능성)·4(보안·거버넌스)·5(관리 효율성) — `learn-describe-benefits-use-cloud-services-<단원>-….md`
- Learn 「Describe cloud service types」 단원 2(IaaS)·3(PaaS)·4(SaaS) — `learn-describe-cloud-service-types-<단원>-….md`
- Learn 「Describe cloud computing」 단원 4(공유 책임 모델, phase 100에서 받음)

설계 때 열어 보고 받지 않은 것(출처 step이 받는다): Well-Architected Framework 「Recommendations for defining reliability targets」(`learn.microsoft.com/azure/well-architected/reliability/metrics` — SLA·SLO·복합 SLO·서비스 크레딧),
Microsoft 수명 주기 「Modern Lifecycle Policy」(`learn.microsoft.com/lifecycle/policies/modern`)와 「Platform Lifecycle FAQ - Microsoft Azure」(`learn.microsoft.com/lifecycle/faq/azure`),
「Supplemental Terms of Use for Microsoft Azure Previews」(`azure.microsoft.com/support/legal/preview-supplemental-terms/`), Azure 클라우드 컴퓨팅 사전의 탄력성·IaaS·PaaS·SaaS 쪽(`azure.microsoft.com/resources/cloud-computing-dictionary/what-is-elastic-computing` 등),
Azure 보안 「Shared responsibility in the cloud」(`learn.microsoft.com/azure/security/fundamentals/shared-responsibility`).

## 글 — `docs/WRITING_GUIDE.md`를 따른다(ADR-056, ADR-060)

- `summary`는 WRITING_GUIDE 2절 — 처음 보는 사람이 일상 말로 「무엇이고 무슨 역할인지」 알게 하는 한 문장. 다른 전문용어를 알아야 이해되면 안 되고, 제목 낱말을 되풀이하는 순환 정의, 숫자·분류를 넣지 않는다.
- `paragraphs`는 3절의 흐름(개념 → 원리 → 예시 → 특징)을 필요한 만큼. 누가·무엇을·어디서 어디로를 빠뜨리지 않는다. 같은 말을 되풀이하지 않는다.
  헷갈리는 짝은 4절대로 무엇이 다르고 왜 나눠 부르는지를 말한다 — 이 phase의 짝: 고가용성과 안정성, 확장성과 탄력성, 수직 확장과 수평 확장, 성능 예측 가능성과 비용 예측 가능성,
  클라우드의 관리와 클라우드에서의 관리, SLA와 서비스 크레딧, 비공개 미리 보기와 공개 미리 보기, 미리 보기와 일반 공급, IaaS·PaaS·SaaS.
- **이 주제 화면만 읽고 뜻이 서야 한다.** 학습자는 주제 목록에서 아무 주제로나 바로 들어오므로, 다른 주제에 정의가 있다는 것은 도움이 되지 않는다.
  이 주제 안에서 처음 쓰는 낱말(리소스, VM, 지역, SLA, IaaS·PaaS·SaaS, 운영 체제, 운영 환경, 온-프레미스, API 등)은 그 자리에서 짧게 푼다. phase 100 주제가 푼 낱말도 이 주제에서는 다시 푼다.
  앞 step이 같은 주제에서 이미 푼 낱말은 다시 풀지 않는다 — 쓰기 전에 그 주제의 앞 개념을 읽는다. 도식의 라벨·곁말·캡션도 화면의 글이다.
- **진행 안내 문장을 쓰지 않는다**(「배경」). 다른 주제나 뒤 개념을 가리키는 말이 필요하면 그 낱말을 그 자리에서 한 줄로 풀고, 「~에서 다룬다」·「~에서 자세히」·「다음 개념의」·「(다음 개념)」을 붙이지 않는다.
- 비유는 이해를 돕는 데만 쓰고, 실제 동작과 다르면 그 자리에서 밝힌다. 비유로 사실을 대신하지 않는다.
- `name`은 명사구다(ADR-030 기준 1). **굵은 글씨(`**`)는 목록 항목의 이름에만** 쓴다(ADR-055와 같은 규칙, ADR-060). 목록 개념은 소개 문단 하나 뒤에 `- **한국어 이름**(English name)은 …` 꼴 항목을 두고, 항목은 혼자 서지 않는다(ADR-046).
  `EmphasizedText`는 `**…**` 안의 백틱을 코드로 그리지 않으므로 굵은 이름 안에 백틱을 넣지 않는다.
- 관용 표현(`돌린다`·`띄운다`·`태운다`·`물린다`)을 쓰지 않고 하는 일을 그대로 쓴다(ADR-030 기준 5). 평서문 「~다」로 쓴다. 「A vs B」 제목은 쓰지 않는다.
- 공식 문서의 마케팅 어조(「원활한」, 「강력한」, 「훌륭한 이점」)를 옮기지 않는다. 이 주제의 Learn 단원은 특히 그런 말이 많다 — 무엇이 어떻게 되는지를 쓴다.

## 문항 — WRITING_GUIDE 「객관식 문제의 문장과 선택지 구성 원칙」과 ADR-054·ADR-030

가장 중요한 원칙: **질문은 쉽게 이해할 수 있도록, 선택은 충분한 생각이 필요하도록.**

1. **정의에서 이름만 지운 「무엇인가?」 꼴을 내지 않는다.** 개념에 맞는 방식 하나를 고른다 — 개념 확인, 원리 이해, 상황 적용, 개념 비교, 원인과 결과. 고른 방식과 이유를 summary에 적는다.
2. **사람이 사람에게 묻듯 쓴다.** 소리 내어 읽어 어색하거나 한 번에 이해되지 않으면 다시 쓴다. 쉼표로 조건을 줄줄이 잇는 압축문을 쓰지 않는다.
3. 무엇을 묻는지는 첫 읽기에 분명하고, 어려움은 보기를 고르는 데서 나온다. 문제문을 비틀어 난이도를 만들지 않는다.
4. 보기는 기술적으로 갈리고 정답은 하나다. 비슷한 개념을 보기로 둘 때는 그 차이를 판단할 조건을 문제문에 준다. 오답은 문제문이 묻는 범주 안에서, 실제로 헷갈리는 것에서 고른다(ADR-030 기준 4).
   정답의 이름이나 그 일부를 문제문에 쓰지 않는다(기준 3). 보기 넷은 서로 다르다.
   **두 개념이 함께 맞게 읽힐 수 있는 상황을 만들지 않는다** — 이 phase에서 특히: 「장애가 나도 계속 쓸 수 있게」는 고가용성이면서 안정성으로도 읽힌다, 「수요에 맞춰 늘린다」는 확장성이면서 탄력성으로도 읽힌다.
   그런 보기는 함께 두지 않거나, 공식 문서의 정의가 가르는 조건(자동인가, 회복하는가)을 문제문에 넣어 하나로 고른다.
   **IaaS·PaaS·SaaS는 셋뿐이다** — 유형 이름 넷을 보기로 둘 수 없으니 보기를 상황·책임으로 만들거나 예/아니요로 낸다. 서비스 유형이 아닌 것(서버리스 등)을 넷째 보기로 끼우지 않는다.
5. 판단에 쓰이지 않는 정보(전문용어·수치·조건·부정문)를 늘어놓지 않는다. 판단에 필요한 조건은 남긴다.
6. **형식(ADR-054)**: 흔히 오해하는 것을 바로잡으면 예/아니요, 비슷한 개념을 구별하거나 상황에 맞는 것을 고르면 4지선다. 같은 범주의 그럴듯한 오답 셋을 출처 안에서 쓸 수 없으면 예/아니요.
   예/아니요는 주장 하나, 이중 부정·「항상」「절대」 금지, 「~인가요?」「~나요?」로 끝난다. **아니요 문항의 해설은 무엇이 틀렸는지에서 그치지 않고 맞는 사실을 가르친다.**
   예/아니요의 주장은 맞는 쪽으로도 틀린 쪽으로도 세울 수 있다 — 아래 균형을 맞추려고 주장의 방향을 고른다.
7. **문항은 풀면서 배우게 쓴다.** 문항은 섞여 나오고 랜덤 세트는 일부만 뽑으므로 혼자 읽혀야 한다. 문제문이 이 주제 밖의 낱말을 풀이 없이 전제하지 않는다(기준 5).
   상황에 쓰는 이름(「회사 A」)·숫자는 사실 주장이 아니어야 하고, 그 상황의 정답은 출처의 사실로 정해져야 한다. 문항 상황은 본문 예와 다르게 만들어 본문 문장을 외워서 풀리지 않게 한다.
   계산 문항(복합 SLA)은 본문과 다른 값을 쓰고, 정답을 손으로 다시 셈한다.
8. **해설은 187자 이상**이고 그 개념을 가르치는 글이다(ADR-026·027). 4지선다는 정답이 왜 맞는지와 오답 셋이 각각 왜 아닌지를 담는다. 약어는 해설마다 처음 쓸 때 풀어 쓴다.
   같은 말을 늘려 길이를 채우지 않는다. 해설의 사실은 개념 본문이나 `official.md`에 있는 것이다.
9. **균형 — step이 끝났을 때 과목 전체에서**: 예/아니요의 예와 아니요 수 차이 **1 이하**, 4지선다의 정답 위치(`answerIndex` 0~3) 수의 최대·최소 차이 **2 이하**.
   phase 101 시작 때는 문항 14개, 예 4·아니요 4, 정답 위치 1/2/2/1이다.
10. 한 문항은 개념 하나만 묻는다(ADR-030 기준 2). 같은 개념의 두 문항은 서로 다른 것을 묻는다.
11. 덤프 문항의 문장·보기 구성을 옮기지 않는다. 덤프가 되풀이하는 꼴(「다음 진술이 맞으면 예」 세 개 묶음, 밑줄 친 말 고치기, 짝짓기)도 쓰지 않는다 — 앱의 형식은 4지선다와 예/아니요 하나씩이다.

검수 — 문항마다 WRITING_GUIDE 객관식 7항의 여섯 질문으로 다시 읽고, 보기마다 「이것이 정답이라고 우길 수 있는가」를 따진다. 문제문만 읽고 보기를 보지 않은 채 정답 글자를 짐작할 수 있지 않은지도 본다.

## 도식 — 주제마다 하나 이상, 구조·흐름이 있는 개념에

선례는 phase 100의 Azure 도식(`CapacityPlanningDiagram`·`PublicPrivateCloudDiagram`·`HybridCloudDiagram`과 그 `.test.tsx`, `src/data/azure/visuals/*.json`)과
네트워크 도식(`MacTableDiagram`·`CastTypesDiagram`·`ArpCacheDiagram`)이다. 표는 `azureCloudModelsTables.tsx`와 그 테스트.
규칙의 근거는 UI_GUIDE 「도식 전용 색상」·「도식」 절 전체, ADR-036·037·038·047·048, `src/components/diagrams/CLAUDE.md`다.
사용자 미리보기 승인을 받지 않고 **step이 좌표를 설계한다.** 그래서 기계 검사를 모두 통과시키고 설계를 summary에 남긴다.

`azure-cloud-benefits`의 도식은 하나(`CloudScalingDiagram`)다. 나머지 개념은 정의형이거나(고가용성·탄력성·예측 가능성·보안과 거버넌스·관리 효율성),
구조가 다른 주제의 몫이다(안정성의 지역 구조는 `azure-regions-zones` 주제의 도식이 그린다 — 글에는 그 말을 쓰지 않는다).

- **파일**: 컴포넌트는 `src/components/diagrams/<이름>Diagram.tsx`(이름이 `Diagram.tsx`로 끝나야 교차 검사와 커버리지 테스트가 도식으로 본다), 테스트는 같은 이름의 `.test.tsx`.
  문구(물음형 제목 `question`·노드 라벨·그룹 라벨·곁말·캡션·`idleCaption`·`legend`·figure `label`·`svgLabel`·시나리오·`sources`)는 그 주제의 `src/data/azure/visuals/<주제 id>.json`의 `diagrams["<키>"]`에 둔다.
  `glossary`는 빈 배열이다(ADR-037). 도식 이름과 키는 step 문서가 정한다 — 이미 있는 이름과 겹치지 않는 것을 골라 두었다.
- **표**: `src/components/diagrams/azureServiceTypesTables.tsx`에 `ServiceTypesTable` 함수, 테스트는 같은 이름의 `.test.tsx`. `azureCloudModelsTables.tsx`처럼 `ComparisonTableFigure`에 JSON의 `tables["<키>"]`를 넘긴다.
  열은 셋 이하(첫 열이 행 머리), `columnWidths`는 열 수만큼의 백분율이고 합이 100%다(`visuals.test.ts`).
  열 폭은 스크롤 막대가 낀 320px(표 폭 약 273px)에서 가장 긴 덩어리(띄어쓰기 없이 이어진 글자)가 들어가게 어림해 정하고, 그 계산을 summary에 적는다(실측은 phase 끝에 한다).
- **사실은 본문에만 있는 것**(ADR-036). 캡션·곁말·라벨·표 칸의 사실마다 그 개념(과 같은 주제의 다른 개념) 본문의 문단을 근거로 댈 수 있어야 한다. 예시 값도 본문에 나오는 것만(ADR-038).
  「회사 A」·「서비스 A」·「VM 1」처럼 대상을 가르는 이름표는 사실이 아니므로 써도 된다. 글과 도식을 같은 step이 만드므로, 도식에 필요한 사실은 **글에 먼저 쓴다** — 출처에 없으면 그리지 않는다.
- **말**: 노드 라벨·곁말은 본문에 쓰인 말과 같게 쓴다. 라벨을 줄이거나 영문 약어로 바꿔 폭을 맞추지 마라 — 노드를 넓히거나 배치를 바꾼다.
- **글자 크기**: 노드 라벨 10, 그룹 라벨·곁말 9(viewBox 단위). `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`. 노드 높이는 32다(교차 검사기가 32로 본다 — 키 큰 노드를 만들지 말고 그룹 박스를 쓴다).
- **글자 폭의 여유**: `estimateTextWidth`는 반각 문자(영문·숫자·기호)를 0.55em으로 보지만 실제 화면에서는 0.61em까지 넓다(phase 72 화면 실측).
  반각 문자가 섞인 노드 라벨·곁말·그룹 라벨(예: `VM 1`, `99.95%`, `일반 공급(GA)`)은 `estimateTextWidth` 값의 **1.15배**를 폭으로 잡아 노드 폭·배치를 정하고, 그 범위가 둘레 박스와 `viewBox` 안에 들게 한다.
- **색**: 노드는 모두 회색(`stroke-disabled`, 선례와 같은 클래스). 도식 전용 두 색(`diagram-managed`·`diagram-resource`)은 AWS 계층의 뜻이라 쓰지 않는다. 초록·빨강·주황, 16진 색, 이모지, O/X도 쓰지 않는다(ADR-036).
  강조는 opacity로만 한다 — 선택 밖 노드 `0.25`, 그룹 박스는 흐려지지 않는다. 나쁜 상태(SLA 없음, 책임이 넘어감)는 색이 아니라 곁말과 흐림으로 보인다(UI_GUIDE 「수량과 상태를 바꾸는 도식」).
- **두 배치**: 세로형(`viewBox` 폭 280)과 가로형(폭 440)을 함께 만든다. 가로형은 `useWideDiagram()`이 `true`일 때 쓴다. `nodes`·`wideNodes`·경로·`wideGroups`·`wideNotes`를 **한 줄에 하나씩 글자 그대로** 적는다 —
  반복문이나 계산으로 만들지 마라(교차 검사기가 글자로 읽는다). 노드 id·경로 id·시나리오·문구는 두 배치가 함께 쓰고, 고른 시나리오는 배치가 바뀌어도 유지된다.
- **경로**: 직교(M/H/V)만, 노드 변에서 시작하고 끝나며, 다른 노드 상자 안을 지나지 않는다. 늘 보이는 연결선도 같은 경로 선언 꼴(`'id': 'M…'`)로 적는다.
  화살표 마커는 선례와 같고 마커 id는 `useId`로 만든다. 그룹 라벨 영역을 지나는 선분이 없어야 한다.
  `phases/38-service-diagrams/tools/check-path-crossings.mjs`는 `*Diagram.tsx`의 `const nodes = [`·`const wideNodes = [` 블록에서 `{ id: '…', x: N, y: N, width: N` 순서를, 경로 객체에서 `'id': 'M…'`를 정규식으로 읽는다. 이 형식을 지켜라.
- **물음형 제목**(ADR-038): 그림이 답하는 것 하나를 학습자의 말로. step 문서의 예는 바꿔도 된다.
- **시나리오**: step 문서에 적힌 시나리오를 둔다. 시나리오가 있는 도식은 `전체`(아무것도 고르지 않음)에서 노드가 모두 선명하다.
  두 시나리오의 「선명한 노드 + 보이는 경로 + 보이는 곁말」이 같으면 그 시나리오는 아무것도 가르지 못한다 — 다르게 설계한다. 캡션은 20자를 넘는다(`visuals.test.ts`).
- **금지**: SVG 두 개를 그려 놓고 CSS로 하나를 숨기지 마라. 기준 폭 문자열(`'(min-width: 768px)'`)을 도식 파일에 쓰지 마라(ADR-047). 흐르는 점·자동 재생 같은 애니메이션 금지.
  공용 컴포넌트(`DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`)와 교차 검사기, `src/lib/svg-bounds.ts`를 고치지 마라.
- **registry**: `src/components/diagrams/registry.ts`의 `diagramsByConceptId`에 `'<개념 id>': <컴포넌트>` 한 줄씩. import는 기존 정렬(모듈 경로 알파벳순),
  키는 기존 Azure 키들(`azure-cloud-models.multicloud`) 뒤에 개념 순서대로. 한 개념에 도식과 표를 함께 붙일 때는 배열로 도식을 앞에 둔다(`azureDiagramCoverage.test.ts`가 순서를 본다).
- **주제의 시각 요소 파일**: 주제를 만드는 step(1·4·7)이 `src/data/azure/visuals/<주제 id>.json`(`{ "diagrams": {}, "tables": {}, "glossary": [] }` 꼴)을 만들고
  `src/data/azure/index.ts`의 `visualsByTopicId`에 `'<주제 id>'`로 넣는다. import 이름은 `azureCloudBenefitsVisuals`·`azureSlaLifecycleVisuals`·`azureServiceTypesVisuals`,
  import 줄은 경로 알파벳순, `visualsByTopicId`의 항목은 주제 순서대로.

### 도식 테스트 — 도식마다 먼저 쓰고 실패를 확인한 뒤 구현한다

`<이름>Diagram.test.tsx` — 선례와 같은 관문을 건다. 세로형은 `matchMedia` 없이, 가로형은 `describe('가로형 (768px 이상)', …)` 안에서만 `vi.stubGlobal('matchMedia', …)`.

1. 물음형 제목이 시나리오 버튼보다 앞에 보인다(헤딩이 아니다).
2. 처음(`전체`)에는 노드가 모두 선명하다. 시나리오에만 쓰이는 경로는 보이지 않는다(늘 보이는 연결선은 보인다).
3. 시나리오마다 선명한 노드 집합, 보이는 경로, 보이는 곁말, 캡션이 JSON·step 문서의 설계와 같다. 선택 밖 노드는 opacity `0.25`, 그룹 박스는 흐려지지 않는다.
4. 모든 `rect`가 `boxesOutsideViewBox`로 `viewBox` 안이고, 노드 라벨이 `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`이다. 곁말·그룹 라벨은 `estimateTextWidth(문구, 9)`로 잰 가로 범위가 `viewBox` 안이다.
5. 경로의 끝점이 노드 변 위에 있고, 어떤 선분도 다른 노드 상자 안과 그룹 라벨 영역을 지나지 않는다.
6. **그 도식의 요점** — step 문서에 도식마다 적힌 「요점 테스트」.
7. 두 번 렌더해도 화살표 마커 id가 겹치지 않는다. JSON의 시나리오 id 집합과 컴포넌트의 것이 같고, 문구를 JSON에서 읽는다.
8. `ConceptList`에 앵커 개념을 주면 본문 뒤에 이 도식이 온다.
9. 가로형: `viewBox` 폭 440, 래퍼에 `w-full`이 있고 `max-w-[380px]`·`-mx-4`가 없다. 노드·그룹 id 집합과 경로 id 합집합이 세로형과 같고, 3~6번을 가로형에서도 통과한다. 폭이 바뀌어도 고른 시나리오와 캡션이 유지된다.

경로가 없는 도식은 경로에 관한 항목(2의 경로 부분, 5)을 「경로가 없다」로 바꿔 건다.

표 테스트(`azureServiceTypesTables.test.tsx`)는 선례 `azureCloudModelsTables.test.tsx`와 같은 것을 본다 — 로더·`glossary`, 이름·열·`columnWidths`·근거(`sources`), 행 순서와 칸 문구, `colgroup`, `ConceptList` 배치.

## 파일 형식

- `topics.json`: 주제 객체는 2칸 들여쓰기, `concepts` 배열의 개념은 **한 줄에 하나**(6칸 들여쓰기 + `JSON.stringify(concept)`). 개념 키 순서는 `id`, `parentId`(있을 때), `name`, `summary`, `paragraphs`.
  주제 키 순서는 `id`, `title`, `importance`, `sourcePages`, `concepts`. 앞 step이 쓴 줄과 다른 주제의 줄은 글자 하나도 바꾸지 않고, 자기 개념을 그 주제의 `concepts` 끝에 덧붙인다.
  주제를 만드는 step은 바로 앞 주제 객체의 닫는 줄 `  }`을 `  },`로 바꾸고 그 뒤에 새 주제를 덧붙인다 — 그 밖의 기존 줄은 바꾸지 않는다.
- `questions.json`: `[` 다음 줄부터 **한 줄에 문항 하나**, 마지막 줄 뒤에 `]`. 키 순서 — 4지선다 `id`, `topicId`, `conceptId`, `format`, `prompt`, `choices`, `answerIndex`, `explanation` /
  예/아니요 `id`, `topicId`, `conceptId`, `format`, `prompt`, `answer`, `explanation`. 기존 줄은 바꾸지 않고 끝에 덧붙인다(마지막 기존 줄 끝에 쉼표 하나를 더하는 것은 예외).
- 파일 끝 줄바꿈 하나. 스크립트로 쓸 때 CRLF로 바꾸지 않는다.
- 이 저장소의 TDD 훅은 테스트 파일 없이 새 `.js`·`.ts` 파일을 쓰지 못하게 막는다. 데이터를 고치는 일회용 스크립트가 필요하면 저장소 밖(임시 디렉터리)에 `.cjs`로 두거나 `node -e`를 쓴다.

## 개념을 넣는 step(1·2·4·5·7·8)의 공통 AC와 검증

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject azure
node -e "const q=require('./src/data/azure/questions.json');const yn=q.filter(x=>x.format==='yes-no');const ch=q.filter(x=>x.format==='choice');const pos=[0,1,2,3].map(i=>ch.filter(x=>x.answerIndex===i).length);console.log('문항',q.length,'마지막',q[q.length-1].id,'정답 위치',pos.join('/'),'예',yn.filter(x=>x.answer).length,'아니요',yn.filter(x=>!x.answer).length)"
git status --porcelain
```

- `check-verbatim`은 「전사 이상 없음」이고 **원본 5개 이상을 대조했다고 나와야 한다**(`raw/`가 없으면 「건너뜀」으로 통과하므로 그때는 blocked로 멈춘다). 균형은 위 「문항」 9항,
  교차 검사기는 「교차 없음」이고 노드·경로 수가 이 step이 더한 만큼 늘어야 한다(앞 step이 끝났을 때의 수는 그 step summary에, phase 시작 값은 「배경」에 있다). **검사기를 고쳐서 통과시키지 마라.**
- **바뀌지 않아야 하는 것을 기계로 확인한다** — `git show HEAD:src/data/azure/topics.json`·`questions.json`과 `visuals/*.json`을 지금 파일과 node로 읽어, 기존 주제 객체·기존 개념·기존 문항·기존 도식 문구가 통째로 같은지 본다.
  AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `git diff --stat`에 나오지 않아야 한다.
- **글로 읽는다** — 그 주제의 개념을 처음부터 이 step의 개념까지 처음 배우는 사람의 눈으로 통독하고, 풀이 없이 처음 나오는 낱말을 세어 본다(도식 문구 포함). 진행 안내 문장이 없는지도 본다.
  불변식과 테스트는 이런 결함을 잡지 못한다. 브라우저 화면 실측은 하지 않는다(「배경」의 시간 제한 — phase 끝에 메인 세션이 한다).
- 이모지·O/X·빨강·초록·주황·도식 전용 두 색·16진 색·애니메이션·기준 폭 문자열이 새 파일에 없는지 `grep`으로 본다.
- 바뀐 파일은 `src/data/azure/topics.json`·`questions.json`·`visuals/<주제>.json`(과 주제를 만드는 step은 `src/data/azure/index.ts`), 새 도식·표 컴포넌트와 테스트,
  `src/components/diagrams/registry.ts`, `docs/source/azure/official.md`(「쓰인 곳」과 더한 사실), phase 메타데이터뿐이어야 한다(step 7은 `topic-map.md`의 제목 칸 하나가 더해질 수 있다).

**summary에 적을 것**(사용자가 이것을 읽고 판단한다): 개념마다 id·name과 **새 요약문 전문**, 문항마다 id·개념·형식·고른 방식·**문제문 전문**·정답, 균형 줄(예/아니요·정답 위치),
도식마다 이름·두 배치의 `viewBox`·시나리오별 선명한 노드·경로·곁말과 캡션 요지·물음형 제목·요점 테스트, 표마다 열·행·`columnWidths`와 그 어림 계산, 설계 의도와 달라진 점과 이유,
`official.md`에 더한 사실, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수, 걸린 시간의 어림.

## 출처 step(0·3·6)의 공통 형식

- `official.md` 항목: `## (phase 101) <문서 제목> — <단원·절 제목>`, URL 한 줄, 확인한 날, 직접 쓴 사실 한 줄씩(끝에 `— 「절 제목」`), **한국어 표기** 줄, 「쓰일 곳」(개념 id와 D·G 번호).
  phase 100이 이미 둔 항목(예: 학습 가이드, 「Describe cloud computing」 단원 4, 「Describe the benefits of using cloud services」 단원 2)은 새 항목을 만들지 말고 그 항목에 사실 줄과 「쓰일 곳」을 덧붙인다 — 덧붙인 줄 끝에 `(phase 101)`.
  주제마다 「한국어 표기 정리 — `<주제 id>`」 항목을 하나 둔다(phase 100의 두 항목이 본보기 — 개념마다 확정한 `name`과 근거 문서, 섞여 쓰인 표기와 고른 까닭).
- `corrections.md` 항목: `## D16 — <짧은 제목> (phase 101)`부터 덤프, `## G10 — … (phase 101)`부터 용어집. 짜임은 phase 100 항목과 같다 — **덤프/용어집**(문항 번호·쪽-번호와 주장) · **공식 문서** · **처리**(고쳐 쓴다 / 한정해 쓴다 / 쓰지 않는다) · **쓰인 곳**.
  덤프 답이 공식 문서와 **맞는** 문항은 항목을 만들지 않는다 — summary에 「확인 결과 덤프가 맞다」로 적는다. 덤프끼리 답이 갈리는 문항은 항목으로 남긴다.
- 그림으로만 표시된 덤프 정답은 OCR 글자나 `index.json`의 `answer`를 믿지 말고 `raw/dump/img/`의 그림을 직접 본다(`docs/source/azure/CLAUDE.md` 「덤프의 그림을 보는 법」).
- **시간을 나눠 쓴다** — 주제마다 덤프 문항이 23~34개라 하나하나 끝까지 읽으면 30분을 넘길 수 있다(넘기면 step이 처음부터 다시 돈다).
  `dump-topics.tsv`의 `note`로 먼저 거르고, 공식 문서와 어긋날 수 있는 주장이 든 문항(수치, 옛 이름, 덤프끼리 답이 갈림, 서비스 분류, 덤프에만 있는 낱말)은 문제문·보기·그림을 끝까지 읽는다.
  나머지는 덤프 답이 공식 문서와 맞는지만 확인한다. 받을 문서를 먼저 모두 받고, 확인 → 기록 순으로 한다.
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

## 모든 step의 공통 금지

- **출처 문서에 없는 사실을 쓰거나 그리지 마라.** 이유: 원본에 없는 내용을 지어내지 않는 것이 이 저장소의 규칙이다(루트 CLAUDE.md, ADR-036). 필요하면 확인해서 `official.md`에 먼저 더한다.
- **덤프·용어집·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009. `check-verbatim --subject azure`는 하한선일 뿐이다.
- **수정 이력(`corrections.md`)에 걸린 덤프·용어집의 주장을 그대로 가르치지 마라.** 이유: 틀린 사실을 학습자가 외우게 된다.
- **불변식 테스트·커버리지 테스트를 고치거나 예외를 더하지 마라.** 이유: 테스트가 실패하면 데이터를 고치거나 도식을 그린다(ADR-026). 진행 안내 가드 테스트도 마찬가지다 — 걸리면 문장을 고친다.
- **자기 step의 개념이 아닌 개념을 만들거나, 앞 step·앞 phase가 쓴 글·문항·도식을 고치지 마라.** 이유: 범위가 겹치면 사용자가 무엇이 어디서 바뀌었는지 따라갈 수 없다.
  고칠 것을 찾으면 고치지 말고 summary에 적는다.
- **AWS·네트워크 데이터와 그 테스트를 고치지 마라.** 기존 테스트를 깨뜨리지 마라.
- **브라우저 실측을 하지 마라.** 이유: step 시간 제한 30분(「배경」). 화면 확인은 phase 끝에 한꺼번에 한다.
- **`docs/source/azure/raw/` 아래 파일을 커밋하지 마라.** 이유: 덤프·용어집·공식 문서의 추출 전문이다(ADR-009). `.gitignore`가 막고 있는지 `git status`로 본다.
- **서비스마다의 SLA 수치를 본문·문항에 쓰지 마라.** 이유: 약관 원문을 받아 확인할 수 없고, 서비스·상품마다 다르고 바뀐다(「배경」). 예시 값(「서비스 A 99.9%」)은 예라고 밝혀 쓴다.
