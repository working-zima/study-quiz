# Step 8: paas-saas

## 배경

phase 101은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/101-azure-benefits-sla-service-types/guide.md`에 있다.
**이 step은 주제 `azure-service-types`의 나머지 개념 둘(16 PaaS, 17 SaaS)의 글·문항과, 세 유형을 견주는 표 `ServiceTypesTable`을 만든다.** 이 step이 끝나면 phase 101의 개념·문항이 모두 생긴다.

PaaS는 덤프가 가장 많이 묻는 유형이다 — 「운영 체제를 고객이 통제하는가」, 「어떤 Azure 서비스가 PaaS인가」, 「관리 부담을 가장 줄이는 유형은」. 학습자가 IaaS와 PaaS의 경계(누가 운영 체제를 맡나)를 쥐게 쓴다.

## 읽어야 할 파일

- **`phases/101-azure-benefits-sla-service-types/guide.md` 전체**
- `phases/101-azure-benefits-sla-service-types/index.json`의 step 6·7 `summary` — 개념마다 확정한 `name`, Azure 서비스마다 유형의 공식 근거, 「도식의 행 배정」, step 7이 이미 푼 낱말과 주제 제목
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-048**, **ADR-009**
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-service-types` 개념 14·15(step 7이 쓴 글 — **이미 푼 낱말을 다시 풀지 않으려고 먼저 읽는다**), `questions.json`, `visuals/azure-service-types.json`, `data.test.ts`, `visuals.test.ts`
- 표 선례 — `src/components/diagrams/azureCloudModelsTables.tsx`와 `.test.tsx`(phase 100), `src/data/azure/visuals/azure-cloud-models.json`의 `tables`, `src/components/diagrams/ComparisonTableFigure.tsx`(고치지 마라), `src/components/diagrams/registry.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-service-types` 끝에 둘

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 16 | `azure-service-types.paas` | PaaS(서비스로서의 플랫폼) | — | `name`은 step 6의 결정. IaaS와 SaaS의 중간 — 공급자가 IaaS에서 맡던 것에 더해 운영 체제·**미들웨어**(한 줄로 푼다)·개발 도구·분석 서비스까지 맡아, 고객은 운영 체제·데이터베이스의 라이선스와 패치를 신경 쓰지 않는다. 고객은 앱 코드·데이터·액세스 제어에 집중하고, 일부 네트워크·앱 보안 설정은 함께 맡는다. 맞는 경우 둘(개발 프레임워크 — 확장·고가용성 같은 기능이 들어 있어 쓸 코드가 준다, 분석·비즈니스 인텔리전스). **IaaS와 무엇이 다른지**(운영 체제를 누가 맡나) 4절대로. Azure에서의 예는 step 6이 공식 근거를 찾은 서비스만 |
| 17 | `azure-service-types.saas` | SaaS(서비스로서의 소프트웨어) | — | `name`은 step 6의 결정. 완성된 앱을 빌려 쓴다 — 예(이메일·메신저·재무 소프트웨어 등), 가장 덜 유연하지만 시작이 가장 쉽고 기술 지식이 가장 적게 든다, 공급자가 인프라·플랫폼·앱 유지 관리를 거의 다 맡고 고객은 데이터·ID와 액세스 설정·장치 접근을 맡는다. PaaS와 무엇이 다른지(앱을 만드는가, 완성된 앱을 쓰는가). Microsoft 365가 SaaS라는 것은 step 6 결과대로. **표의 사실을 이 개념 본문(과 개념 14~16 본문)에 먼저 쓴다** |

### 2. 문항 — `src/data/azure/questions.json`에 `az036`~`az038`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az036` | `paas` | 4지선다 「상황 적용」 — 개발팀이 운영 체제·데이터베이스의 패치와 라이선스를 신경 쓰지 않고 앱 코드에만 집중하려는 상황 넷 가운데 PaaS가 가장 맞는 것을 고르거나, 한 상황에 맞는 설명을 고른다. **보기를 상황·설명 넷으로** — IaaS·PaaS·SaaS 이름 넷을 보기로 두지 않는다(guide.md 「문항」 4항) |
| `az037` | `paas` | 예/아니요 「흔한 오해」 — PaaS로 웹 앱을 올리면 고객이 그 아래 운영 체제를 직접 구성·패치하는가(아니요), 또는 PaaS에서도 앱 코드와 데이터는 고객이 책임지는가(예). `az036`과 다른 것을 묻는다 |
| `az038` | `saas` | 예/아니요 또는 4지선다 — SaaS에서 고객에게 남는 책임(데이터·계정·장치), 또는 완성된 앱을 빌려 쓰는 상황이 SaaS라는 것. 4지선다라면 보기를 상황·책임으로 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 7 summary의 균형 줄이다. 이 step이 phase의 마지막 문항이므로 균형을 특히 확인한다.

### 3. 표 — `ServiceTypesTable`

- 파일: `src/components/diagrams/azureServiceTypesTables.tsx`에 `ServiceTypesTable` 함수, 테스트 `azureServiceTypesTables.test.tsx`(guide.md 「도식」의 표 항목).
  JSON: `src/data/azure/visuals/azure-service-types.json`의 `tables["service-types"]`(step 7이 만든 파일 — `shared-responsibility` 도식 문구는 바꾸지 않는다).
- 열 셋: 첫 열 유형(행 머리), 「고객이 맡는 것」, 「맞는 경우」 — 열 이름은 본문의 말로 바꿔도 된다. 행 셋: IaaS·PaaS·SaaS(이 순서, 행 머리는 개념 `name`의 약어 쪽).
- 칸 문구는 개념 14~17 본문에 있는 사실만(ADR-036) — 「고객이 맡는 것」은 step 6 「도식의 행 배정」과 어긋나지 않게, 「맞는 경우」는 공식 단원이 드는 시나리오.
- `columnWidths`: 열 수만큼의 백분율, 합 100%. 표 폭 약 273px(스크롤 막대가 낀 320px)에서 칸마다 가장 긴 덩어리(띄어쓰기 없이 이어진 글자)가 한 줄에 들게 어림하고, 그 계산을 summary에 적는다(phase 100 `CloudModelsTable`의 summary가 본보기).
- `sources`: 이 표의 근거 개념 id들.
- registry: `'azure-service-types.saas': ServiceTypesTable` 한 줄(`azure-service-types.shared-responsibility-model` 키 뒤). 이 개념에는 도식이 없으므로 배열이 아니다.

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `ServiceTypesTable`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다. **phase 101의 개념이 모두 생겼으므로**, `official.md`와 `corrections.md`에서 `(phase 101)` 항목의 「쓰일 곳」이 남아 있지 않은지 `grep`으로 본다 — 남은 줄은 그 개념 id가 실제로 있으면 고치고, 없는 id를 가리키면 고치지 말고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·4·5·7·8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 38개, 마지막 id는 `az038`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다. 교차 검사의 노드·경로 수는 step 7이 끝났을 때와 같아야 한다(표는 교차 검사 대상이 아니다).
2. `azure-service-types`의 개념 14~17을 처음부터 통독한다 — 풀이 없이 처음 나오는 낱말, 같은 낱말을 두 번 푼 곳, 진행 안내 문장. 세 유형의 차이가 「누가 무엇을 맡나」로 일관되게 읽히는가, 표의 칸이 본문과 같은 말인가.
3. phase 전체의 균형 줄을 적는다 — 문항 38개, 예/아니요 차이 1 이하, 정답 위치 최대·최소 차이 2 이하.
4. `phases/101-azure-benefits-sla-service-types/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」. 통독하며 찾은, 앞 step 글의 고칠 것은 고치지 말고 summary에 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **step 7이 쓴 개념 14·15의 글·문항과 `shared-responsibility` 도식을 고치지 마라.**
- **공식 문서가 유형을 직접 말하지 않은 Azure 서비스를 PaaS·SaaS의 예로 쓰지 마라.** 이유: step 6이 근거를 찾은 것만 사실이다. 덤프가 거듭 묻더라도 마찬가지다.
- **표에 본문에 없는 칸을 만들지 마라**(가격, 「가장 싸다」 같은 비교 등). 이유: ADR-036.
- **도식을 더하지 마라.** 이유: 이 주제의 도식은 step 7의 것 하나로 설계했다. 표는 그것을 대신하지 않고 더해지는 것이다.
