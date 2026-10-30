# Step 2: reliability-manageability

## 배경

phase 101은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/101-azure-benefits-sla-service-types/guide.md`에 있다.
**이 step은 주제 `azure-cloud-benefits`(클라우드의 이점)의 나머지 개념 넷(4 안정성, 5 예측 가능성, 6 보안과 거버넌스, 7 관리 효율성)의 글·문항을 쓴다.** 이 주제의 도식은 step 1이 만들었다 — 이 step은 도식을 더하지 않는다
(guide.md 「도식」 — 나머지 개념은 정의형이거나 구조가 다른 주제의 몫이다).

이 step이 끝나면 `azure-cloud-benefits`가 완성된다.

## 읽어야 할 파일

- **`phases/101-azure-benefits-sla-service-types/guide.md` 전체**
- `phases/101-azure-benefits-sla-service-types/index.json`의 step 0·1 `summary` — 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지(특히 덤프만 묻는 이점 넷의 처리), step 1이 이미 푼 낱말
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-009**
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-cloud-benefits` 개념 1~3(step 1이 쓴 글 — **이미 푼 낱말을 다시 풀지 않으려고 먼저 읽는다**), `questions.json`, `data.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-cloud-benefits` 끝에 넷

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 4 | `azure-cloud-benefits.reliability` | 안정성 | — | step 0이 고른 표기. 장애에서 회복해 계속 동작하는 능력, 분산된 설계와 세계 여러 **지역**(한 줄로 푼다), 한 지역의 큰 재해에도 다른 지역이 돈다는 것, 앱을 그렇게 설계할 수 있고 경우에 따라 클라우드가 알아서 옮긴다는 것. **고가용성(개념 1)과 무엇이 다른지** 한 줄로 되짚는다 — step 0 summary의 구분대로. 내결함성·지리적 분산·재해 복구는 step 0이 공식 정의를 찾은 것만 한 줄씩(못 찾은 것은 쓰지 않는다) |
| 5 | `azure-cloud-benefits.predictability` | 예측 가능성 | — | **목록 개념** — 소개 문단(무엇을 내다볼 수 있게 되는가 — 성능과 비용) 뒤 항목 둘: 성능 예측 가능성(필요한 리소스를 내다봄 — 자동 크기 조정·부하 분산·고가용성이 돕는다), 비용 예측 가능성(사용을 실시간으로 추적·모니터링하고 분석해 앞으로의 지출을 내다봄, 가격 계산기로 어림). **부하 분산**·**모니터링**을 짧게 푼다. 자동 크기 조정은 개념 2·3에서 푼 말을 되짚는다. 항목 이름은 step 0 결과대로 |
| 6 | `azure-cloud-benefits.security-governance` | 보안과 거버넌스 | — | **거버넌스**를 한 줄로 푼다. 거버넌스 쪽(템플릿으로 표준·규정에 맞춤, 바뀌면 한꺼번에 고침, 감사가 벗어난 리소스를 짚음, 패치가 자동인 경우)과 보안 쪽(보안을 최대로 통제하려면 IaaS, 패치를 맡기려면 PaaS·SaaS, 공급자가 DDoS 공격에 대비하기 좋다)을 나눠 쓴다. **IaaS·PaaS·SaaS·운영 체제·패치·DDoS 공격**을 이 주제에서 한 줄씩 푼다(세 유형은 「무엇을 사용자가 관리하나」만 — 자세한 책임 나눔은 쓰지 않는다). 「다른 주제에서 다룬다」는 말을 쓰지 않는다 |
| 7 | `azure-cloud-benefits.manageability` | 관리 효율성 | — | **목록 개념** — 소개 문단(클라우드에서 관리가 쉬워지는 두 갈래) 뒤 항목 둘: 클라우드의 관리(리소스를 어떻게 관리하나 — 수요에 따른 자동 크기 조정, 템플릿으로 배포, 상태를 모니터링해 실패한 리소스를 자동으로 바꿈, 정한 지표로 자동 경고), 클라우드에서의 관리(무엇으로 관리하나 — 웹 포털·명령줄 인터페이스·API·PowerShell). 두 항목의 이름이 비슷하니 4절대로 「무엇을」과 「무엇으로」의 차이가 드러나게 쓴다. **웹 포털**·**명령줄 인터페이스**·**API**·**PowerShell**을 짧게 푼다. 항목 이름은 step 0 결과대로 |

예/아니요·4지선다 어느 쪽이든 문항을 쓰기 전에 개념 본문을 먼저 쓰고, 문항의 사실이 본문에 있는지 본다.

### 2. 문항 — `src/data/azure/questions.json`에 `az020`~`az023`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az020` | `reliability` | 4지선다 「원인과 결과」 — 회사가 리소스를 여러 지역에 나눠 두었는데 한 지역에 큰 재해가 났다면 어떻게 되는가. 오답은 실제로 헷갈리는 결과에서(모든 지역이 함께 멈춘다, 사용자가 직접 새 지역에 다시 배포해야만 한다 등 — step 0이 확인한 사실로 갈리는 것). **고가용성과 함께 맞게 읽히는 상황을 만들지 않는다**(guide.md 「문항」 4항) |
| `az021` | `predictability` | 4지선다 「개념 비교」 또는 예/아니요 — 비용 예측 가능성과 성능 예측 가능성을 가른다(예: 가격 계산기로 지출을 어림하는 일이 어느 쪽인가, 자동 크기 조정이 비용 쪽인가) |
| `az022` | `security-governance` | 예/아니요 「흔한 오해」 — 운영 체제와 설치한 소프트웨어의 패치까지 직접 맡아 보안을 가장 많이 통제하려면 SaaS가 맞는가(아니요 — IaaS), 같은 꼴. 또는 템플릿·감사가 거버넌스에 어떻게 쓰이는지 |
| `az023` | `manageability` | 예/아니요 또는 4지선다 — 클라우드의 관리와 클라우드에서의 관리를 가른다(예: 포털·명령줄로 리소스를 다루는 것이 어느 쪽인가). 4지선다로 내려면 보기 넷이 같은 범주여야 한다 — 두 항목뿐이면 예/아니요로 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 1 summary의 균형 줄이다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·4·5·7·8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 23개, 마지막 id는 `az023`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다. 교차 검사의 노드·경로 수는 step 1이 끝났을 때와 같아야 한다(이 step은 도식을 더하지 않는다).
2. `azure-cloud-benefits`의 개념 1~7을 처음부터 통독한다 — 풀이 없이 처음 나오는 낱말, 같은 낱말을 두 번 푼 곳, 진행 안내 문장. 고가용성·안정성, 확장성·탄력성이 서로 다른 것으로 읽히는가.
3. `official.md`에서 이 step의 개념 id가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다. 이 주제의 개념이 모두 생겼으므로 `azure-cloud-benefits`의 개념 id만 걸린 줄은 모두 「쓰인 곳」이어야 한다.
4. `phases/101-azure-benefits-sla-service-types/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」. 통독하며 찾은, 앞 step 글의 고칠 것은 고치지 말고 summary에 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **도식이나 표를 더하지 마라.** 이유: 이 주제의 도식은 step 1의 것 하나로 설계했다(guide.md 「도식」). 꼭 필요하다고 보면 그리지 말고 summary에 적는다.
- **step 1이 쓴 개념 1~3의 글·문항·도식을 고치지 마라.** 이유: guide.md 「모든 step의 공통 금지」.
- **덤프만 묻는 이점(내결함성·지리적 분산·재해 복구)을 step 0이 정의를 찾지 못했는데도 쓰지 마라.** 이유: 공식 문서가 정의하지 않은 것을 가르치게 된다(`corrections.md`).
- **Azure Site Recovery·Azure Policy·Azure Monitor 같은 서비스 이름을 이 주제의 글에 쓰지 마라.** 이유: 이 주제는 클라우드 일반의 이점을 다룬다. 서비스는 그 서비스를 다루는 주제가 맡는다(공식 Learn 단원도 이 단원에서 서비스 이름을 들지 않는다). 가격 계산기처럼 공식 단원이 직접 드는 것은 예외다.
