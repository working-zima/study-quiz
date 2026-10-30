# Step 1: subject-skeleton

## 배경

phase 100은 앱에 세 번째 과목 **Azure AZ-900**을 더한다. 결정과 공통 규칙은 `phases/100-azure-cloud-concepts/guide.md`에 있다(「배경」의 결정은 다시 묻지 마라).
step 0이 원본 규칙(`docs/source/azure/CLAUDE.md`)과 주제 지도(`docs/source/azure/topic-map.md`)를 세웠다.
**이 step은 빈 Azure 과목을 만들어 `subjects`에 등록하고, Azure 데이터가 앞으로 지켜야 할 불변식을 테스트로 먼저 세운다.** 내용이 비어 있으므로 불변식은 지금 빈 집합으로 통과하고,
step 5부터 데이터가 들어오면 걸린다. 본보기는 네트워크 과목을 처음 만든 phase 69 step 3(`phases/69-network-basics/step3.md`)과, 그 뒤 자라 온 지금의 네트워크 테스트다.

과목 객체: id **`azure`**, 이름 **「Azure AZ-900」**, 진행률 키 **`azure-quiz.progress`**, `hasKeywordQuiz: false`. 주소는 `#/azure/…`.

## 읽어야 할 파일

- `phases/100-azure-cloud-concepts/guide.md` 전체, `phases/69-network-basics/step3.md`
- `src/data/CLAUDE.md` — 「과목을 더할 때」·「네트워크 과목 데이터」
- `src/types/content.ts`·`src/types/subject.ts`·`src/types/visuals.ts`
- `src/data/index.ts`, `src/data/index.test.ts`
- `src/data/network/index.ts`·`index.test.ts`·`data.test.ts`·`visuals.test.ts` — **Azure 테스트는 이것들을 옮겨 Azure에 맞게 고친 것이다**
- `src/components/diagrams/networkDiagramCoverage.test.ts`, `src/components/diagrams/registry.ts`
- `src/App.test.tsx`의 「주제가 없는 과목의 화면이 열린다」·「네트워크 주제 목록과 개념 읽기 머리에 별점이 보인다」
- `src/pages/SubjectListPage.tsx`와 테스트 — 과목 카드
- `docs/source/azure/topic-map.md` — 주제 20개와 문항 수
- `docs/ADR.md`의 **ADR-026**, **ADR-027**, **ADR-041**, **ADR-046**, **ADR-053**, **ADR-054**, **ADR-056**, **ADR-059**(sourcePages `[0, 0]`)

## 작업

### 1. 테스트를 먼저

**테스트를 먼저 쓰고, 실패하는 것을 확인한 뒤** 구현한다. 단언마다 위반 목록을 모아 `toEqual([])`로 비교해 실패 메시지가 위반 자리를 보여 주게 한다(네트워크 테스트와 같다).

#### `src/data/azure/data.test.ts` — Azure 데이터 불변식

`src/data/network/data.test.ts`를 옮기되 아래만 다르게 한다. 머리 주석에 이 파일이 Azure 과목의 불변식이고 AWS·네트워크 고유의 단언은 두지 않는다는 것을 적는다.

1. 주제 id·개념 id 유일, 개념 id는 `<주제 id>.<슬러그>`이고 슬러그는 소문자·숫자·하이픈 — 그대로.
2. 주제마다 개념 하나 이상, 이름·요약·문단이 비지 않음 — 그대로.
3. **주제 지도 표** — `topicMap: Record<string, { dumpQuestions: number }>`에 `docs/source/azure/topic-map.md`의 주제 20개를 지도 순서대로, 그 주제가 대표인 고유 문항 수와 함께 적는다
   (`azure-cloud-computing` 16, `azure-cloud-models` 17, … `azure-monitoring` 33). 주석에 지도와 같은 값이고 지도를 바꾸면 이 표도 바꾼다는 것, 아직 앱에 없는 주제도 있다는 것을 적는다.
   - 「주제 지도 표는 주제 20개이고 문항 수가 0 이상의 정수다」
   - 「앱의 모든 Azure 주제가 주제 지도에 있다」(지도에 없는 주제를 더하려면 ADR과 지도를 먼저 고친다는 주석)
   - 「모든 주제의 별점이 덤프 문항 수에서 계산한 값과 같다」 — `importanceFromDumpQuestions`: 25 이상 3, 13 이상 2, 그 밖 0. 주제마다 손으로 덮어쓰지 말라는 주석(네트워크와 같은 이유).
   - **「앱의 Azure 주제 순서가 주제 지도의 순서와 같다」** — 앱에 있는 주제만 추려 지도에서의 순서가 오름차순인지 본다(주제를 지도 순서대로 넣게 한다).
4. **「모든 주제의 `sourcePages`가 `[0, 0]`이다」** — Azure에는 쪽 번호로 가리킬 원본이 없다(ADR-059의 강의 밖 주제와 같은 처리). 네트워크의 강의 쪽 테스트는 옮기지 않는다.
5. `hierarchyProblems`(ADR-041), 목록 항목은 혼자 서지 않음(ADR-046), 굵은 글씨 `**`는 목록 항목 안에만, 진행 안내 가드(정규식 그대로) — 그대로.
6. **문항 id가 `az001`부터 빈 번호 없이** 이어진다(`az${String(i + 1).padStart(3, '0')}`). 접두사를 `az`로 둔 까닭(AWS `q…`·네트워크 `n…`과 섞여 보이지 않게, ADR-053)을 주석으로.
7. 문항의 `topicId`·`conceptId` 실재와 일치, 커버리지 100%(ADR-026 주석 그대로 — 예외 목록 금지), `format` 필수와 형식별 필드, 해설 187자 이상(ADR-027 주석 그대로 — 하한을 낮추지 말라), 문제문이 물음표로 끝남 — 그대로.

#### `src/data/azure/visuals.test.ts` — Azure 시각 요소 불변식

`src/data/network/visuals.test.ts`를 그대로 옮겨 이름만 Azure로 바꾼다(주제 키, `sources`, 표의 열·`columnWidths`, 시나리오 id·캡션 20자 초과, `glossary` 빈 배열).

#### `src/data/azure/index.test.ts` — 로더

- `topics`·`questions`가 JSON을 그대로 내보낸다(`toBe`).
- `azureSubject`의 `id`가 `'azure'`, `title`이 `'Azure AZ-900'`, `progressKey`가 `'azure-quiz.progress'`, `hasKeywordQuiz`가 `false`이고, `topics`·`questions`·`visualsByTopicId`가 이 모듈의 것과 같다.

#### `src/components/diagrams/azureDiagramCoverage.test.ts` — 주제마다 도식 하나 이상

`networkDiagramCoverage.test.ts`의 짜임(`kindOf`, `componentsOf`)을 따르되 규칙이 다르다. 머리 주석에 Azure 규칙(주제마다 도식 하나 이상, 구조·흐름이 있는 개념에는 개념마다 — 그 판단은 각 phase의 설계가 한다,
비교표는 도식을 대신하지 않는다, 사용자 결정 2026-10-30)과 네트워크의 「개념마다」 규칙과 다르다는 것을 적는다.

1. **「모든 Azure 주제에 도식이 하나 이상 붙어 있다」** — 주제의 개념들에 붙은 컴포넌트 가운데 `kindOf`가 `'diagram'`인 것이 하나 이상. 위반은 주제 id로 보고한다.
2. 「Azure 개념에 붙은 컴포넌트는 이름으로 도식인지 표인지 가를 수 있다」 — 네트워크와 같다.
3. 「도식과 표가 함께 붙은 Azure 개념은 도식을 모두 표보다 앞에 둔다」 — 네트워크와 같다.
4. 「Azure 주제로 시작하는 registry 키는 모두 실제 Azure 개념 id다」 — 접두사는 앱에 있는 Azure 주제 id에 `.`을 붙인 것. 네트워크와 같다.

지금은 주제가 없으므로 넷 다 빈 집합으로 통과한다. 1번이 실제로 잡는지는 아래 「검증 절차」 2에서 본다.

#### `src/data/index.test.ts` — 한 줄만 고친다

- 「과목이 AWS, 네트워크 순서다」를 **「과목이 AWS, 네트워크, Azure AZ-900 순서다」**로 바꾸고 `['aws', 'network', 'azure']`를 기대한다. 첫 화면이 이 순서로 카드를 보인다.
- 다른 단언(과목 id·예전 경로·주제/개념 id 전역 유일·진행률 키·예/아니요 규칙)은 고치지 않는다. Azure가 등록되면 저절로 그 단언들의 대상이 된다.

#### `src/App.test.tsx` — 하나를 더한다

기존 「주제가 없는 과목의 화면이 열린다」(네트워크 경로를 연다)는 고치지 않는다. **「Azure 과목의 화면이 주제 없이도 열린다」** 하나를 더한다 — 실제 `subjects`로
`/azure`·`/azure/random`·`/azure/review`·`/azure/search`를 차례로 열어 헤더에 「Azure AZ-900」 링크(`href` `/azure`)가 있고 경로가 그대로인지 본다(기존 테스트와 같은 꼴).
이 테스트는 주제가 생겨도 그대로 통과해야 한다 — 주제 수나 「주제 0개」 같은 문구를 단언하지 않는다.

### 2. 데이터와 과목 객체 — `src/data/azure/`

- `topics.json` = `[]`, `questions.json` = `[]`. 파일 끝에 줄바꿈 하나.
- `visuals/` 폴더는 아직 만들지 않는다(빈 폴더는 git이 담지 않는다). step 5가 첫 파일을 만든다.
- `index.ts` — `src/data/network/index.ts`와 같은 모양으로:

```ts
export const topics: Topic[]
export const questions: Question[]          // Azure는 4지선다와 예/아니요를 함께 담는다. 문항마다 format을 적는다(ADR-054)
export const visualsByTopicId: Record<string, TopicVisuals>   // 지금은 {}
export const azureSubject: Subject          // id 'azure', title 'Azure AZ-900', progressKey 'azure-quiz.progress', hasKeywordQuiz false
```

  빈 배열 JSON을 import하면 타입이 `never[]`로 잡힌다. `as Topic[]`·`as Question[]`로 단언한다. `progressKey` 옆에 이 키가 이 과목의 학습 기록이 담기는 곳이라 바꾸면 기록이 사라진다는 주석을 네트워크처럼 단다.

### 3. 등록 — `src/data/index.ts`

`subjects = [awsSubject, networkSubject, azureSubject]`. import 정렬은 기존 방식(경로 알파벳순)을 따른다.

### 4. 확인

- 첫 화면(`SubjectListPage`)에 카드가 셋이 되고, Azure 카드는 「주제 0개 · 문항 0개」다(임시 테스트나 렌더로 확인하고 남기지 않는다). 기존 화면 테스트는 픽스처 과목을 쓰므로 깨지지 않아야 한다.
  깨지는 테스트가 있으면 **그 테스트를 고치지 말고** 멈춰서 `"status": "error"`로 테스트 이름을 적는다 — 과목 목록에 의존하는 곳은 설계가 예상하지 못한 의존이다.
- `scripts/`의 데이터 검사(`check-structure.mjs`·`coverage.mjs` 등)가 `subjects`를 돌면서 빈 Azure 과목 때문에 깨지지 않는지 `scripts/CLAUDE.md`를 보고 확인한다(AWS만 보는 것이면 그대로 둔다). 깨지면 고치지 말고 summary에 적는다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. 테스트 수는 시작 전보다 이 step이 더한 만큼 늘고, 기존 테스트가 빠지지 않았는지 파일별 개수로 확인한다.
2. 불변식이 실제로 잡는지 확인한다 — `topics.json`·`questions.json`·`registry.ts`에 위반을 하나씩 잠시 넣어 해당 테스트만 실패하는 것을 보고 **되돌린다.** 이 확인은 커밋에 남기지 않는다.
   - 별점 3인 `azure-cloud-computing`(지도의 16문항이면 2여야 한다) → 별점 테스트
   - 지도에 없는 주제 id(`azure-unknown`) → 「지도에 있다」 테스트
   - 지도 순서를 거꾸로 둔 두 주제(`azure-cloud-models` 다음 `azure-cloud-computing`) → 순서 테스트
   - `sourcePages` `[1, 1]` → `[0, 0]` 테스트
   - 문항 없는 개념 → 커버리지 테스트, `format` 없는 문항 → 형식 테스트, `az002`로 시작하는 문항 → id 테스트, `**`가 든 요약 → 굵은 글씨 테스트
   - 도식 없는 주제(개념은 있지만 registry에 아무것도 없음) → 「주제마다 도식」 테스트. 표만 붙은 주제(`…Table` 이름의 컴포넌트)도 이 테스트에 걸리는지 본다.
3. `git status`로 바뀐 파일이 `src/data/azure/`(index.ts·topics.json·questions.json·세 테스트), `src/components/diagrams/azureDiagramCoverage.test.ts`, `src/data/index.ts`, `src/data/index.test.ts`,
   `src/App.test.tsx`와 phase 메타데이터뿐인지 확인한다.
4. `phases/100-azure-cloud-concepts/index.json`의 step 1을 갱신한다.
   - 성공 → `"summary"`에 만든 파일, `azureSubject`의 필드 값, 불변식 목록(파일별 번호와 한 줄씩), 2번 확인에서 각 위반이 어느 테스트로 잡혔는지, 첫 화면 카드 확인 결과, 테스트 수(전후, 파일 수)를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **주제·개념·문항을 넣지 마라.** 이유: 내용은 step 5부터 출처를 확인하며 쓴다. 이 step의 확인용 데이터는 되돌린다.
- **`progressKey`를 `'azure-quiz.progress'` 말고 다른 값으로 두지 마라.** 이유: 배포된 뒤 키를 바꾸면 사용자의 학습 기록이 사라진다(ADR-053).
- **AWS·네트워크 데이터와 그 테스트(`src/data/aws/`·`src/data/network/`, `networkDiagramCoverage.test.ts`)를 고치지 마라.** 이유: 이 step은 새 과목만 더한다.
- **화면 코드(`src/pages/`·`src/components/`의 컴포넌트)를 고치지 마라.** 이유: 과목 구조는 ADR-053이 이미 만들었다. 빈 과목에서 화면이 죽으면 고치지 말고 멈춰서 보고한다.
- **불변식에 예외 목록을 두지 마라.** 이유: 목록이 생기는 순간 사각지대가 되살아난다(ADR-026).
- **해설 하한 187을 낮추지 마라.** 이유: ADR-027의 실측값이고, 해설은 개념을 가르치는 글이다.
- **별점 경계(25·13)를 바꾸지 마라.** 이유: 사용자가 확인한 주제 지도의 규칙이다.
- 기존 테스트를 깨뜨리지 마라.
