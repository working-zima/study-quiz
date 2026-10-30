# Step 7: cloud-models-sources

## 배경

phase 100은 Azure AZ-900 과목의 첫 두 주제를 만든다. 전체 계획과 결정은 `phases/100-azure-cloud-concepts/guide.md`에 있다.
step 8·9가 주제 `azure-cloud-models`(클라우드 배포 모델)의 개념 5개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고,
덤프·용어집이 공식 문서와 다른 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다. 형식은 step 4가 만든 두 문서를 그대로 따른다.

이 주제는 덤프 17문항이 묻는데, **덤프끼리 답이 갈리는 문항이 있다** — 「인프라를 어느 모델에 두면 자기 데이터 센터가 더는 필요 없나」를 NO.30·238은 퍼블릭 클라우드로, NO.272는 프라이빗 클라우드로 본다.
공식 문서가 프라이빗 클라우드를 「사업장 밖 전용 데이터 센터, 제3자가 운영할 수도 있다」고 말하므로 단순하지 않다. 이런 곳을 공식 문서로 정리해 두는 것이 이 step의 중심이다.

## 읽어야 할 파일

- `phases/100-azure-cloud-concepts/guide.md` — 특히 「두 주제와 개념 12개」의 `azure-cloud-models` 표, 「예시 값」, 「출처」, 「문항」 4항(두 모델이 함께 맞게 읽히는 상황)
- `phases/100-azure-cloud-concepts/index.json`의 step 4 `summary`(받은 문서 목록, 형식), step 5·6 `summary`(이미 푼 낱말 — 다른 주제지만 표기를 맞춘다)
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **step 4가 만든 형식을 따른다**
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `cloud-models`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다
  (설계 때 본 것: NO.30·98·105·125·195·208·238·248·268·272·277·283·317·339·365·370·484). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/1-cloud-concepts.md`의 퍼블릭·프라이빗·하이브리드 클라우드·멀티 클라우드·멀티 테넌시·데이터 주권 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/learn-describe-cloud-compute-5-define-cloud-models.md`와 한국어판(받아 둠)
- `docs/ADR.md`의 **ADR-009**, ADR-060

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

받는 법과 이름 규칙은 step 4와 같다(`scripts/azure-source/fetch_page.py` → `docs/source/azure/raw/official/`). 영문판으로 사실을 확인하고 한국어판은 용어 표기만 본다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `cloud-models` | 「클라우드 모델」이 무엇을 가르는 말인가(배포 유형), 주요 셋과 넷째 경우(다중 클라우드). 한국어 표기 — 「클라우드 모델」·「배포 모델」 가운데 공식 한국어판이 쓰는 말. 주제 제목 「클라우드 배포 모델」과 어긋나면 summary에 적는다(제목은 지도의 것이라 고치지 않는다) | Learn 단원 5(받아 둠) |
| b | `public-cloud` | 제3자 공급자가 짓고 운영·유지 관리, 서비스를 사는 누구나 쓸 수 있다(일반 공개가 핵심 차이), Learn 비교표의 강점·약점. **여러 고객이 같은 하드웨어를 함께 쓰되 서로 나뉜다**(다중 테넌트 — 덤프 NO.105·365)를 공식 문서가 말하는가, 「테넌트」의 뜻. **「누구나 쓸 수 있다」가 「한 고객의 리소스에 다른 고객이 들어올 수 있다」는 뜻이 아님**을 댈 근거(고객 사이의 격리) | Learn 단원 5, Azure 보안 문서 가운데 퍼블릭 클라우드의 고객 격리를 말하는 쪽(예: `learn.microsoft.com/azure/security/fundamentals/isolation-choices`), `azure.microsoft.com`의 클라우드 컴퓨팅 사전(퍼블릭 클라우드) |
| c | `private-cloud` | 한 조직 전용, 기존 데이터 센터에서 자라 나옴, 인터넷으로 서비스를 내준다는 것, 통제권·비용, **둘 수 있는 곳**(사업장 안 데이터 센터 / 사업장 밖 전용 데이터 센터 / 제3자 운영), 하드웨어 구매·유지 책임. 덤프 NO.98(인터넷과 끊어야 하는가), NO.283·370(리소스와 보안을 완전히 통제하는가) | Learn 단원 5, 클라우드 컴퓨팅 사전(프라이빗 클라우드) |
| d | 데이터 센터 문항 | **NO.30·238 vs NO.272** — 각 문항이 무엇을 정답으로 보는지 그림으로 확인하고(NO.238·272는 빈칸 채우기 그림), 공식 문서로 정리한다: 퍼블릭으로 옮기면 하드웨어를 공급자가 갖춘다는 것, 프라이빗은 사업장 밖 제3자 데이터 센터에 둘 수도 있다는 것. 처리 — 본문은 「누가 하드웨어를 갖추고 관리하나」로 쓰고 「데이터 센터를 없앨 수 있다/없다」로 단정하지 않는지, 아니면 다르게 쓸지 | b·c의 결과 |
| e | `hybrid-cloud` | 퍼블릭과 프라이빗을 서로 이어 함께 쓰는 환경, 수요가 잠시 늘 때 퍼블릭으로 넘김, 서비스마다 둘 곳을 고름(앱을 어디서 실행할지 조직이 정함), 가장 유연함. **온프레미스**의 뜻과 한국어 표기(「온-프레미스」 등). 덤프 예(NO.125·277·339)가 이 정의와 맞는지. **NO.208·248**(하이브리드로 가려면 먼저 프라이빗에서 옮겨 와야 하나)·**NO.317**(물리 서버를 둘 수 있는 모델 — 덤프 답 프라이빗·하이브리드만)을 공식 문서로 어떻게 볼지 | Learn 단원 5, 클라우드 컴퓨팅 사전(하이브리드 클라우드), Azure의 하이브리드 소개 쪽 |
| f | `multicloud` | 둘 이상의 퍼블릭 공급자, 생기는 경우(기능을 골라 씀, 옮겨 가는 중), 두 환경 모두에서 관리. 한국어 표기(한국어판 단원 5는 「다중 클라우드」). **Azure Arc**를 한 줄로 풀 근거(여러 환경의 리소스를 함께 관리하는 기술). 하이브리드와의 차이 | Learn 단원 5, Azure Arc 개요(`learn.microsoft.com/azure/azure-arc/overview`) |
| g | 표 | `CloudModelsTable`(퍼블릭·프라이빗·하이브리드·다중 클라우드를 「하드웨어를 갖추고 관리하는 쪽」·「이럴 때 고른다」로 견줌)의 칸마다 근거가 b·c·e·f에 있는지. Learn 비교표의 항목이 어느 칸의 근거가 되는지 | b·c·e·f의 결과 |

덤프의 나머지 문항(NO.195 퍼블릭의 특징 둘, NO.268 정의, NO.484 끌어 놓기)과 용어집 항목도 하나씩 읽어 공식 문서와 다른 주장이 있는지 본다.

### 2. `docs/source/azure/official.md`에 더한다

step 4의 형식 그대로(`## (phase 100) …`, URL, 사실과 절 제목, 한국어 표기, 확인한 날, 「쓰인 곳」에 **쓰일 개념 id** `azure-cloud-models.public-cloud` 등).
이미 있는 항목(Learn 단원 5를 step 4가 a에서 썼다면 그 항목)에 사실을 더할 때는 새 항목을 만들지 말고 그 항목에 줄을 더한다.

### 3. `docs/source/azure/corrections.md`에 더한다

step 4가 쓴 마지막 번호에 이어 `D…`·`G…`를 더한다. 형식 그대로. 덤프 답이 공식 문서와 맞으면 항목을 만들지 않고 summary에 「확인 결과 덤프가 맞다」로 적는다.
덤프끼리 갈린 d는 **한 항목에 두 쪽 문항을 함께** 적고(어느 문항이 무엇을 정답으로 보는지), 공식 문서로 본 처리를 적는다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-cloud-models`의 개념 5개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**.
위 표의 a~g마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다. 특히 d의 처리와, step 8·9의 문항이 피해야 할 「두 답이 함께 맞는」 상황(예: 다중 클라우드와 퍼블릭, 하이브리드와 프라이빗)을 적는다.
`raw/official/`에 받은 파일 목록. 끝에 「사용자 확인」 칸(없으면 「없음」).

## Acceptance Criteria

```bash
npm test
node scripts/check-verbatim.mjs --subject azure
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다. `check-verbatim`은 「전사 이상 없음」이고 원본 수가 받은 문서만큼 늘어 있어야 한다.
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 더한 한국어 문장이 `raw/official/ko-…`와 32자 넘게 겹치지 않는지 step 4처럼 `findVerbatimRuns`로 본다.
   step 4가 쓴 항목은 줄을 더한 것 말고는 그대로인지 `git diff`로 본다.
4. `phases/100-azure-cloud-concepts/index.json`의 step 7을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 8·9가 쓴다.
- **확인하지 못한 사실을 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 가르친다. 못 찾았으면 summary에 적는다.
- **덤프끼리 갈린 답 가운데 하나를 공식 문서 없이 고르지 마라.** 이유: 어느 쪽이든 틀린 것을 가르칠 수 있다. 공식 문서가 정하지 않으면 그 단정을 쓰지 않는 처리로 둔다.
- **허용한 출처 밖의 문서를 근거로 쓰지 마라.** 이유: ADR-060과 `docs/source/azure/CLAUDE.md`. 클라우드 컴퓨팅 사전은 `azure.microsoft.com` 아래라 허용한 곳이다 — 블로그(`/blog/`)는 아니다.
- **덤프·용어집·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009.
- **step 4가 쓴 항목(D·G 포함)의 내용을 고치지 마라.** 이유: 그 step의 확인 기록이다. 틀린 것을 찾으면 고치지 말고 summary에 적는다.
- **`docs/source/azure/CLAUDE.md`·`topic-map.md`를 고치지 마라.**
