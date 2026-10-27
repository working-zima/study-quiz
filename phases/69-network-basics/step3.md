# Step 3: subject-skeleton

## 배경

앱에 두 번째 과목 **네트워크**를 더하는 phase 69의 넷째 step이다. 사용자 결정(2026-10-26·10-27, 다시 묻지 마라):

- 앱은 하나, 과목은 분리한다(ADR-053). 과목 id **`network`**, 이름 **「네트워크」**, 주소 `#/network/…`, 데이터 폴더 `src/data/network/`,
  진행률 키 **`network-quiz.progress`**. 검색·랜덤·복습·진행률은 과목 안에서만 돈다(이미 그렇게 짜여 있다).
- 키워드 퀴즈(ADR-040)는 AWS에만 있다. 네트워크는 `hasKeywordQuiz: false`.
- 자격증 목표가 정해지지 않아 **별점이 없다** — 모든 주제의 `importance`는 `0`이다.
- 강조 기준이 없으므로 **굵은 글씨(`**…**`)는 목록 항목의 이름에만** 쓴다(ADR-046의 `- **이름**(English name)은 …` 꼴). 요약과 일반 문단에는 쓰지 않는다.
- 문항 형식은 4지선다와 예/아니요(ADR-054). 네트워크 문항은 **`format`을 항상 적는다**(`"choice"` 또는 `"yes-no"`). AWS 문항은 필드가 없는 것이 4지선다지만,
  새 과목은 데이터만 보고 형식을 알 수 있게 한다.
- 문항 id는 **`n001`부터** 빈 번호 없이 잇는다. 문항 id는 과목 안에서만 유일하면 되지만(ADR-053) AWS의 `q001…`과 섞여 보이지 않게 접두사를 달리한다.
- `sourcePages`는 강의 **통합본 쪽 번호**(1~502)의 범위다. 주제 지도(`docs/source/network/lecture-outline.md`)에 주제마다 적혀 있다.
- 주제 22개의 id·제목·순서는 `docs/source/network/lecture-outline.md`의 「주제 지도」에 있다. **이 step은 주제를 하나도 넣지 않는다** — 빈 과목을 만든다.
  1장 두 주제는 step 6·7이 채운다.

앞 step(0~2)은 원본 문서만 만들었다(`docs/source/network/`). **이 step은 빈 네트워크 과목을 만들어 `subjects`에 등록하고, 네트워크 데이터가 앞으로
지켜야 할 불변식을 테스트로 먼저 세운다.** 내용이 비어 있으므로 불변식은 지금 빈 집합으로 통과하고, step 6부터 데이터가 들어오면 걸린다.

## 읽어야 할 파일

- `src/data/CLAUDE.md` — 「과목을 더할 때」
- `src/types/content.ts`·`src/types/subject.ts`·`src/types/visuals.ts`
- `src/data/index.ts`, `src/data/index.test.ts` — 과목 불변식과 `yesNoProblems`
- `src/data/aws/index.ts`, `src/data/aws/index.test.ts`, `src/data/aws/visuals.test.ts`
- `src/data/aws/data.test.ts`의 일반 불변식 — 「모든 개념의 이름과 요약이 빈 문자열이 아니다」부터 「모든 문제의 해설이 그 개념을 가르칠 만큼의 길이를 갖는다」까지(약 5250~5400행),
  「개념 계층 (ADR-041)」, 「ADR-046 — 개념 본문 목록」의 「목록 항목은 혼자 서지 않는다」. **AWS 고유의 단언(특정 개념·문항·수)은 옮기지 않는다.**
- `src/lib/concept-groups.ts`의 `hierarchyProblems`, `src/lib/paragraph-blocks.ts`의 `isListItem`
- `src/pages/SubjectListPage.tsx`와 테스트 — 과목 카드
- `docs/ADR.md`의 **ADR-026**(커버리지 100%), **ADR-027**(해설 길이 하한 187자), **ADR-041**, **ADR-046**, **ADR-053**, **ADR-054**
- `docs/source/network/lecture-outline.md`의 「주제 지도」

## 작업

### 1. 테스트를 먼저

**테스트를 먼저 쓰고, 실패하는 것을 확인한 뒤** 구현한다.

#### `src/data/network/data.test.ts` — 네트워크 데이터 불변식

`./index`의 `topics`·`questions`를 읽는다. 지금은 둘 다 빈 배열이라 대부분 빈 집합으로 통과한다. 그래도 각 단언은 **데이터가 들어왔을 때 의미 있게**
쓴다(예: `forEach` 안에서 단언하는 대신 위반 목록을 모아 `toEqual([])`로 비교하면, 실패 메시지가 위반 id를 보여 준다).

1. 주제 id가 유일하다. 개념 id가 유일하다. 개념 id는 `<주제 id>.<슬러그>`이고 슬러그는 소문자·숫자·하이픈이다.
2. 모든 주제는 개념 하나 이상을 갖는다. 개념의 `name`·`summary`가 빈 문자열이 아니고, `paragraphs`가 하나 이상이며 각 문단이 빈 문자열이 아니다.
3. 모든 주제의 `importance`가 `0`이다.
4. 모든 주제의 `sourcePages`가 두 정수 `[a, b]`이고 `1 ≤ a ≤ b ≤ 502`다.
5. `hierarchyProblems(topic)`이 모든 주제에서 빈 배열이다(ADR-041).
6. 목록 항목(`isListItem`)은 혼자 서지 않는다 — 앞이나 뒤 문단도 항목이다(ADR-046).
7. **굵은 글씨 표지 `**`는 목록 항목 안에만 있다.** 요약과 목록 항목이 아닌 문단에 `**`가 있으면 위반이다.
8. 문항 id가 `n001`부터 빈 번호 없이 이어진다(`n${String(i + 1).padStart(3, '0')}`). 따라서 유일하다.
9. 모든 문항의 `topicId`가 실제 주제이고, `conceptId`가 실제 개념이며, `topicId`가 그 개념이 속한 주제와 같다.
10. **모든 개념이 문항 하나 이상을 갖는다**(ADR-026). 예외 목록을 두지 않는다 — AWS 테스트의 주석처럼 그 이유를 주석으로 적는다.
11. 모든 문항이 `format`을 가진다. `"choice"`면 서로 다른 보기 4개와 0~3의 `answerIndex`, `"yes-no"`면 불리언 `answer`가 있고 `choices`·`answerIndex`가 없다.
12. 모든 문항의 `explanation`이 187자 이상이다. AWS와 같은 하한이고 근거는 ADR-027이다 — 해설은 정답만 정당화하지 않고 그 개념을 가르치는 글이라 자연히 넘는 선이다.
    하한을 과목에 맞춰 낮추지 않는다는 것을 주석으로 적는다.
13. 모든 문항의 `prompt`가 `?`로 끝난다. 예/아니요는 `src/data/index.test.ts`가 이미 보지만, 네트워크는 4지선다도 물음으로 끝낸다(「무엇인가?」).

#### `src/data/network/visuals.test.ts` — 네트워크 시각 요소 불변식

`src/data/aws/visuals.test.ts`의 일반 단언을 네트워크에 건다. 지금은 `visualsByTopicId`가 빈 객체라 빈 집합으로 통과한다.

1. 시각 요소의 주제 키가 실제 네트워크 주제 id다.
2. 모든 `sources`가 실제 네트워크 개념 id이고 비어 있지 않다(도식·시나리오·표).
3. 표의 열은 셋 이하이고, 행의 셀 수는 열 수에서 하나를 뺀 값이다. `columnWidths`가 있으면 열 수와 같고 합이 100%다.
4. 도식 안의 시나리오 id는 유일하고 `caption`은 20자를 넘는다.
5. **`glossary`는 모든 주제에서 빈 배열이다.** 약어 툴팁은 VPC 주제에만 둔다(ADR-037).

#### `src/data/network/index.test.ts` — 로더

- `topics`·`questions`가 JSON을 그대로 내보낸다(`toBe`).
- `networkSubject`의 `id`가 `'network'`, `title`이 `'네트워크'`, `progressKey`가 `'network-quiz.progress'`, `hasKeywordQuiz`가 `false`이고,
  `topics`·`questions`·`visualsByTopicId`가 이 모듈의 것과 같다.

#### `src/data/index.test.ts` — 한 줄만 더한다

- `subjects`의 id가 `['aws', 'network']` 순서다. 과목 목록 첫 화면이 이 순서로 카드를 보인다.
- 기존 단언(과목 id·예전 경로·주제/개념 id 전역 유일·진행률 키·예/아니요 규칙)은 고치지 않는다. 네트워크가 등록되면 저절로 그 단언들의 대상이 된다.

### 2. 데이터와 과목 객체 — `src/data/network/`

- `topics.json` = `[]`, `questions.json` = `[]`. 파일 끝에 줄바꿈 하나.
- `visuals/` 폴더는 아직 만들지 않는다(빈 폴더는 git이 담지 않는다). step 8이 첫 파일을 만든다.
- `index.ts` — `src/data/aws/index.ts`와 같은 모양으로:

```ts
export const topics: Topic[]
export const questions: Question[]          // 네트워크는 두 형식을 함께 담는다
export const visualsByTopicId: Record<string, TopicVisuals>   // 지금은 {}
export const networkSubject: Subject        // id 'network', title '네트워크', progressKey 'network-quiz.progress', hasKeywordQuiz false
```

  빈 배열 JSON을 import하면 타입이 `never[]`로 잡힌다. `as Topic[]`·`as Question[]`로 단언한다. `progressKey` 옆에 이 키가 이 과목의 학습 기록이 담기는
  곳이라 바꾸면 기록이 사라진다는 주석을 AWS처럼 단다.

### 3. 등록 — `src/data/index.ts`

`subjects = [awsSubject, networkSubject]`. import 정렬은 기존 방식을 따른다.

### 4. 확인

- 첫 화면(`SubjectListPage`)에 카드가 둘이 되고, 네트워크 카드는 「주제 0개 · 문항 0개」다. 기존 화면 테스트는 픽스처 과목을 쓰므로 깨지지 않아야 한다.
  깨지는 테스트가 있으면 **그 테스트를 고치지 말고** 멈춰서 `"status": "error"`로 테스트 이름을 적는다 — 과목 목록에 의존하는 곳은 설계가 예상하지 못한 의존이다.
- 빈 과목에서 화면이 죽지 않는지: `#/network`(주제 목록)·`#/network/random`·`#/network/review`·`#/network/search`를 렌더하는 테스트가 이미 있는지 찾아보고,
  없으면 `src/App.test.tsx`에 「주제가 없는 과목의 화면이 열린다」 하나를 더한다(실제 `subjects`로 `#/network`를 열어 과목 이름이 보이는지). 빈 상태 문구를 새로 만들지는 않는다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. 테스트 수는 시작 전보다 이 step이 더한 만큼 늘고, 기존 테스트가 빠지지 않았는지 파일별 개수로 확인한다.
2. 불변식이 실제로 잡는지 확인한다 — `topics.json`·`questions.json`에 위반 데이터(별점 2인 주제, 문항 없는 개념, `format` 없는 문항, `**`가 든 요약, `n002`로 시작하는 문항)를
   하나씩 잠시 넣어 해당 테스트가 실패하는 것을 보고 **되돌린다.** 이 확인은 커밋에 남기지 않는다.
3. `git status`로 바뀐 파일이 `src/data/network/`(index.ts·topics.json·questions.json·세 테스트), `src/data/index.ts`, `src/data/index.test.ts`,
   (더했다면) `src/App.test.tsx`와 phase 메타데이터뿐인지 확인한다.
4. `phases/69-network-basics/index.json`의 step 3을 갱신한다.
   - 성공 → `"summary"`에 만든 파일, `networkSubject`의 필드 값, 불변식 목록(번호와 한 줄씩), 2번 확인에서 각 위반이 어느 테스트로 잡혔는지, 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **주제·개념·문항을 넣지 마라.** 이유: 내용은 step 6·7이 출처를 확인하며 쓴다. 이 step의 테스트 확인용 데이터는 되돌린다.
- **`progressKey`를 `'network-quiz.progress'` 말고 다른 값으로 두지 마라.** 이유: 배포된 뒤 키를 바꾸면 사용자의 학습 기록이 사라진다(ADR-053).
- **AWS 데이터와 AWS 테스트(`src/data/aws/`)를 고치지 마라.** 이유: 이 step은 새 과목만 더한다.
- **화면 코드(`src/pages/`·`src/components/`)를 고치지 마라.** 이유: 과목 구조는 ADR-053이 이미 만들었다. 빈 과목에서 화면이 죽으면 고치지 말고 멈춰서 보고한다 — 설계가 예상하지 못한 일이다.
- **불변식에 예외 목록을 두지 마라.** 이유: 목록이 생기는 순간 사각지대가 되살아난다(ADR-026).
- **해설 하한 187을 낮추지 마라.** 이유: ADR-027의 실측값이고, 해설은 개념을 가르치는 글이다.
- 기존 테스트를 깨뜨리지 마라.
