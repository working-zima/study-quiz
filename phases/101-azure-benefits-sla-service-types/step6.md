# Step 6: service-types-sources

## 배경

phase 101은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획과 결정은 `phases/101-azure-benefits-sla-service-types/guide.md`에 있다.
step 7·8이 주제 `azure-service-types`(서비스 유형과 공동 책임)의 개념 4개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고,
덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다.

이 주제는 덤프 34문항이 묻는 ★★★ 주제다. 중심 문제는 둘이다.

1. **공동 책임 모델의 도식이 쓸 행마다의 배정** — 늘 고객·늘 공급자·서비스 유형에 따라 갈리는 책임을, 온-프레미스·IaaS·PaaS·SaaS마다 누가 맡는지.
   Learn 단원은 이것을 그림(표 모양)으로 보이고 글로는 일부만 말한다. 도식은 본문에 있는 사실만 그리므로(ADR-036), **글로 확인되는 배정만** 남긴다.
2. **Azure 서비스가 어느 유형인가** — 덤프가 가장 많이 묻는 꼴이다(VM·App Service·SQL Database·Cosmos DB·Microsoft 365 등). 공식 문서가 그 서비스를 IaaS·PaaS·SaaS라고 **직접 말하는 것만** 쓴다.

또 **「공동 책임 모델」과 「공유 책임 모델」 가운데 한국어 표기를 정한다** — 정하면 주제 제목도 따라간다(guide.md 「배경」).

## 읽어야 할 파일

- `phases/101-azure-benefits-sla-service-types/guide.md` — 특히 「배경」의 표기 결정, 「세 주제와 개념 17개」의 `azure-service-types` 표, 「출처」, 「출처 step(0·3·6)의 공통 형식」
- `phases/101-azure-benefits-sla-service-types/index.json`의 step 0~5 `summary` — 받은 문서 목록과 형식, step 2가 「보안과 거버넌스」에서 IaaS·PaaS·SaaS를 한 줄씩 푼 말(표기를 맞춘다)
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`(phase 100의 「Learn 「Describe cloud computing」 — 4 Describe the shared responsibility model」 항목을 먼저 읽는다), `docs/source/azure/corrections.md`
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `service-types`·`shared-responsibility`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다
  (설계 때 본 것: 공동 책임 NO.5·15·16·18·23·109·429·466, 서비스 유형 NO.17·65·70·104·118·135·155·166·182·187·188·189·191·201·257·262·266·290·301·310·327·348·376·398·418·458·463). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/1-cloud-concepts.md`의 IaaS·PaaS·SaaS·공동 책임 모델·클라우드 마이그레이션 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — `learn-describe-cloud-service-types-{2,3,4}-….md`, `learn-describe-cloud-compute-4-describe-shared-responsibility-model.md`와 한국어판,
  `learn-describe-azure-compute-networking-services-2-virtual-machines.md`(VM이 IaaS라는 말이 있는지)
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

받는 법과 이름 규칙은 step 0과 같다. 영문판으로 사실을 확인하고 한국어판은 용어 표기만 본다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `shared-responsibility-model` | 온-프레미스에서는 모든 책임이 조직에 있다, 클라우드에서는 공급자와 고객이 나눈다, 늘 고객(정보와 데이터, 장치, 계정과 ID), 늘 공급자(물리 데이터 센터·네트워크·호스트), 서비스 유형에 따라(운영 체제, 네트워크 제어, 애플리케이션, ID와 액세스 — ID와 액세스는 PaaS·SaaS에서 함께 맡는다), IaaS가 고객에게 가장 많이·SaaS가 공급자에게 가장 많이·PaaS가 중간. **행마다의 배정** — 아래 「도식의 행 배정」을 채운다. 덤프 NO.5·15·16·18·23·109·429·466이 공식 문서와 맞는지 | Learn 「Describe cloud computing」 단원 4(받아 둠), Azure 보안 「Shared responsibility in the cloud」(`learn.microsoft.com/azure/security/fundamentals/shared-responsibility`)와 한국어판 |
| b | 표기 | **「공유 책임 모델」과 「공동 책임 모델」** — 한국어판 Learn 단원 4·서비스 유형 단원, 위 보안 문서의 한국어판, 학습 가이드 한국어판(받아 둠)이 어느 쪽을 쓰는지 센다. Microsoft 한국어 문서가 한쪽으로 모이면 그쪽으로 정한다. **세 유형의 이름 꼴** — 한국어판이 「서비스로서의 인프라」·「서비스형 플랫폼」·「SaaS(Software as a Service)」처럼 섞어 쓴다. 학습 가이드 한국어판과 클라우드 컴퓨팅 사전 한국어판도 보고, 세 개념의 `name`을 같은 꼴(예: 「IaaS(서비스로서의 인프라)」·「PaaS(서비스로서의 플랫폼)」·「SaaS(서비스로서의 소프트웨어)」, 또는 근거가 더 많은 꼴)로 정한다 | 위 문서들의 한국어판, `ko-az-900-study-guide.md`(받아 둠) |
| c | `iaas` | 가장 유연, 통제가 가장 많음, 공급자(하드웨어·인터넷 연결·물리 보안)와 고객(운영 체제의 설치·구성·유지 관리, 네트워크 구성, 데이터베이스와 스토리지 구성), 하드웨어를 빌린다는 것, 맞는 경우(리프트 앤 시프트 마이그레이션, 개발·테스트). **리프트 앤 시프트**를 한 줄로 풀 근거. **Azure VM이 IaaS라는 것**을 공식 문서가 직접 말하는가. 덤프 NO.17·266·310·327·376·418 | Learn 「Describe cloud service types」 단원 2(받아 둠), Learn 「Describe Azure virtual machines」 단원(받아 둠), 클라우드 컴퓨팅 사전 「What is IaaS?」(`azure.microsoft.com/resources/cloud-computing-dictionary/what-is-iaas`) |
| d | `paas` | IaaS와 SaaS의 중간, 공급자가 운영 체제·미들웨어·개발 도구·분석 서비스까지 맡는다, 운영 체제·데이터베이스의 라이선스와 패치를 고객이 신경 쓰지 않는다, 고객은 앱 코드·데이터·액세스 제어, 일부 네트워크·앱 보안 설정은 함께, 맞는 경우(개발 프레임워크, 분석·BI). **미들웨어**를 한 줄로 풀 근거. **Azure App Service·Azure SQL Database·Azure Cosmos DB·Azure Functions가 PaaS라는 것**을 공식 문서가 직접 말하는가(서비스마다 따로 — 「완전 관리형」이라는 말만으로 PaaS라고 옮겨 적지 않는다). 덤프가 묻는 PaaS의 특성(운영 체제를 고객이 통제하지 못한다, 가격 계층을 고른다, 자동 확장 — NO.155·201·301·348)이 공식 문서와 맞는지 | Learn 단원 3(받아 둠), 클라우드 컴퓨팅 사전 「What is PaaS?」, App Service 개요(`learn.microsoft.com/azure/app-service/overview`), Azure SQL Database 개요(`learn.microsoft.com/azure/azure-sql/database/sql-database-paas-overview`), Cosmos DB 개요 |
| e | `saas` | 완성된 앱을 빌려 쓴다, 예(이메일·재무 소프트웨어·메신저·연결 소프트웨어), 가장 덜 유연하지만 시작이 가장 쉽고 기술 지식이 가장 적게 든다, 공급자가 거의 다 맡고 고객은 데이터·ID와 액세스 설정·장치 접근을 맡는다. **Microsoft 365가 SaaS라는 것**(NO.458)을 공식 문서가 직접 말하는가 | Learn 단원 4(받아 둠), 클라우드 컴퓨팅 사전 「What is SaaS?」 |
| f | 표 | `ServiceTypesTable`(IaaS·PaaS·SaaS를 「고객이 관리하는 것」·「맞는 경우」로 견줌)의 칸마다 근거가 c·d·e에 있는지 | c·d·e의 결과 |

**도식의 행 배정** — summary에 아래 꼴의 표로 남긴다. 칸은 `고객` / `공급자` / `함께` / `확인 못 함` 가운데 하나이고, 칸마다 근거(문서와 절)를 단다.
그림에서만 읽은 칸은 근거로 치지 않는다 — 글(본문·표·그림의 대체 글자)로 확인되는 것만 `고객`·`공급자`·`함께`로 적는다. 그림을 보았다면 그림이 무엇을 보이는지는 메모로 적어도 된다.

| 책임(행) | 온-프레미스 | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| 정보와 데이터 | | | | |
| 장치(휴대폰·PC) | | | | |
| 계정과 ID | | | | |
| ID와 디렉터리 인프라(또는 ID와 액세스) | | | | |
| 애플리케이션 | | | | |
| 네트워크 제어 | | | | |
| 운영 체제 | | | | |
| 물리 호스트 | | | | |
| 물리 네트워크 | | | | |
| 물리 데이터 센터 | | | | |

행의 이름과 수는 공식 문서를 따른다 — 위는 설계 때의 짐작이다.

### 2. `official.md`·`corrections.md`에 더한다

guide.md 「출처 step(0·3·6)의 공통 형식」대로. phase 100의 단원 4 항목에는 사실 줄을 덧붙이고(끝에 `(phase 101)`), 나머지는 새 항목. 끝에 「한국어 표기 정리 — `azure-service-types`」 항목(b의 셈과 결정을 포함).
미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **Azure 서비스의 유형을 묻는 덤프**(VM·App Service·SQL Database·Cosmos DB·Microsoft 365, NO.65·70·104·118·182·310·418·458·463 등): 공식 문서가 그 유형을 직접 말하면 덤프가 맞는지, 말하지 않으면 「쓰지 않는다」.
- **NO.188**(Site Recovery의 서비스 유형) — `cloud-benefits`와 함께 걸린 문항이다. step 0이 이미 항목을 만들었으면 번호만 적는다.
- **NO.16**(Azure Backup의 유형): 공식 근거가 없으면 「쓰지 않는다」.
- 용어집 IaaS 항목의 「필요 시 스펙을 빠르게 확장·축소」, PaaS의 「런타임·DB·웹 서버를 통째로」, 공동 책임의 「데이터 암호화는 고객 책임」 같은 주장이 공식 문서와 맞는지.

### 3. summary — 뒤 step이 이것을 보고 쓴다

`azure-service-types`의 개념 4개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**.
**공유/공동 책임의 결정과 주제 제목**(「서비스 유형과 공유 책임」으로 바꾸는지, 그대로인지)을 맨 앞에 적는다. 「도식의 행 배정」 표. Azure 서비스마다 유형의 공식 근거(있음 — URL / 없음).
위 표의 a~f마다 결과와 근거 문서. `raw/official/`에 받은 파일 목록. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·3·6)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다.
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/101-azure-benefits-sla-service-types/index.json`의 step 6을 갱신한다.
   - 성공 → `"summary"`에 위 「3. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 7·8이 쓴다.
- **그림에서만 읽은 책임 배정을 글로 확인한 것처럼 적지 마라.** 이유: 도식은 본문에 있는 사실만 그리고(ADR-036), 본문의 사실은 `official.md`에서 온다. 그림은 다시 확인하기 어렵고 전사 검사도 닿지 않는다.
- **「완전 관리형」·「관리되는 서비스」 같은 말만 보고 서비스를 PaaS로 분류하지 마라.** 이유: 공식 문서가 유형을 직접 말한 것만 사실이다.
- **`topic-map.md`·`dump-topics.tsv`·`docs/source/azure/CLAUDE.md`를 고치지 마라.** 이유: 주제 제목을 바꾸는 것은 주제를 만드는 step 7의 일이다(guide.md 「배경」). 이 step은 결정과 근거만 남긴다.
- **`azure-cloud-benefits`·`azure-sla-lifecycle`의 사실을 이 step에서 고치지 마라.** 이유: 그 주제는 끝났다. 표기가 어긋난 곳을 찾으면 summary에 적는다.
