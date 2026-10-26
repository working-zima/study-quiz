# Step 0: question-types

## 배경

phase 68은 문항 형식에 **예/아니요**를 더한다. 지금까지 모든 문항은 4지선다 단일정답이었다(ADR-005).
「잘못 알기 쉬운 주장 하나」를 확인하는 문항을 4지선다로 만들면, 같은 범주에서 그럴듯한 오답 셋을 쓸 수 없어 보기가 억지가 되거나
정답만 범주가 달라 소거로 풀린다. 그래서 그런 문항은 예/아니요로 쓴다. 주관식(단답형·설명형)은 만들지 않는다. 사용자 결정(2026-10-26)이다.

**이 phase는 형식의 틀만 만든다.** AWS 746문항은 4지선다 그대로 두고 `src/data/aws/questions.json`을 고치지 않는다.
예/아니요 문항을 처음 쓰는 것은 다음 과목(네트워크)이다. 그래서 이 phase가 끝나도 화면에 보이는 것은 바뀌지 않는다.

phase의 step: **0 question-types(이 step — 타입·채점·섞기)** / 1 quiz-runner(문항 화면) / 2 yes-no-invariants(데이터 불변식) / 3 docs(ADR-054와 문서).

## 읽어야 할 파일

- `src/types/content.ts`·`src/types/subject.ts`
- `src/lib/CLAUDE.md`
- `src/lib/grading.ts`·`src/lib/grading.test.ts`
- `src/lib/shuffle.ts`·`src/lib/shuffle.test.ts`
- `src/data/aws/index.ts` — `questions`의 타입
- `src/components/QuizRunner.tsx` — `question.choices.map(...)` 한 곳만 이 step에서 고친다
- `docs/ARCHITECTURE.md`의 「데이터 모델」「문항과 보기의 순서」
- `docs/ADR.md`의 ADR-005(4지선다 단일정답)·ADR-011(섞기)

## 작업

### 1. 타입 — `src/types/content.ts`

```ts
// 공통 필드: id · topicId · conceptId · prompt · explanation (지금 Question의 것 그대로)

export interface ChoiceQuestion /* 공통 필드 + */ {
  format?: 'choice'                        // 없으면 4지선다다. 지금 JSON에는 이 필드가 없다
  choices: [string, string, string, string]
  answerIndex: 0 | 1 | 2 | 3
}

export interface YesNoQuestion /* 공통 필드 + */ {
  format: 'yes-no'
  answer: boolean                          // 예가 정답이면 true
}

export type Question = ChoiceQuestion | YesNoQuestion
```

- 공통 필드는 베이스 인터페이스 하나에 두고 둘이 확장한다. 베이스를 export할지는 재량이다.
- `format`이 없거나 `'choice'`면 4지선다다. **AWS JSON에 `format`을 채워 넣지 않는다** — 필드가 없는 지금 모양 그대로 `ChoiceQuestion`이다.
- `Subject.questions`(`src/types/subject.ts`)는 `Question[]` 그대로다(이제 두 형식을 담는다). 파일을 고칠 필요가 없다.
- `src/data/aws/index.ts`의 `questions`는 **`ChoiceQuestion[]`**로 바꾼다(`questionsData as ChoiceQuestion[]`). 이유: `src/data/aws/data.test.ts`(7천 줄)가
  `question.choices`·`answerIndex`를 그대로 펼쳐 쓴다. AWS 문항은 모두 4지선다이므로 타입이 사실과 맞다.

### 2. 채점과 버튼 문구 — `src/lib/grading.ts`

```ts
export function isCorrect(question: Question, choiceIndex: number): boolean
export function choiceLabels(question: Question): string[]
```

- 버튼은 두 형식 모두 **인덱스로** 고른다. 예/아니요는 **0 = 예, 1 = 아니요**다. 이 대응을 아는 곳은 이 파일 하나다 — 화면이 「예」 문자열이나
  인덱스 규칙을 따로 들고 있지 않게 한다.
- `isCorrect`: 4지선다는 지금처럼 `answerIndex === choiceIndex`. 예/아니요는 고른 것이 예(0)인지와 `answer`가 같으면 정답.
- `choiceLabels`: 4지선다는 `choices`, 예/아니요는 `['예', '아니요']`.
- `isCorrect`의 시그니처는 바꾸지 않는다. `QuizRunner`의 `selections`가 인덱스 배열이고 진행률은 정오(boolean)만 저장하기 때문이다.
- 테스트(먼저, `grading.test.ts`): 예/아니요 문항 `answer: true`에서 0은 정답·1은 오답, `answer: false`에서 0은 오답·1은 정답.
  `choiceLabels` — 4지선다는 `choices`와 같은 배열, 예/아니요는 `['예', '아니요']`. 기존 4지선다 테스트는 그대로 둔다.

### 3. 섞기 — `src/lib/shuffle.ts`

```ts
export function shuffleChoices(question: ChoiceQuestion, rng: () => number): ChoiceQuestion
export function shuffleChoices(question: Question, rng: () => number): Question
export function shuffleQuestions(questions: Question[], rng: () => number): Question[]
```

- `shuffleChoices`는 오버로드(또는 같은 효과의 제네릭)로 **4지선다를 넣으면 4지선다가 나온다**. 기존 테스트의 `result.choices` 접근이 캐스트 없이 컴파일돼야 한다.
- **예/아니요 문항은 그대로 돌려주고 `rng`를 부르지 않는다.** 버튼 순서는 늘 「예」 다음 「아니요」다. 문항 순서는 `shuffleQuestions`가 지금처럼 섞는다.
- 4지선다를 섞는 동작은 바꾸지 않는다(ADR-011).
- 테스트(먼저, `shuffle.test.ts`): 예/아니요 문항을 `shuffleChoices`에 넣으면 같은 내용(`toEqual`)이 나오고 `rng`가 한 번도 불리지 않는다(`vi.fn`).
  4지선다와 예/아니요가 섞인 배열을 `shuffleQuestions`에 넣으면 문항 집합이 보존되고, 예/아니요 문항은 내용이 그대로이며, 4지선다 문항은 정답 보기를 따라
  `answerIndex`가 옮겨 간다.

### 4. 타입 변경으로 깨지는 컴파일만 고친다

- `src/components/QuizRunner.tsx`: `question.choices.map(...)`을 `choiceLabels(question).map(...)`으로 바꾼다. **이 한 줄 말고는 고치지 않는다** —
  예/아니요 버튼의 배치는 step 1이 한다. 지금 데이터에는 예/아니요 문항이 없으므로 화면은 바뀌지 않는다.
- 테스트 파일에서 `Question`으로 주석한 픽스처의 `.choices`·`.answerIndex`를 읽어 컴파일이 깨지면, **그 픽스처의 타입 주석을 `ChoiceQuestion`으로 바꾸는 것만** 한다.
  단언과 테스트 개수는 그대로다.
- 그 밖에 `npm run build`가 가리키는 곳이 있으면 같은 원칙(타입 주석만, 동작 변경 없음)으로 고치고 summary에 파일을 적는다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
git diff --quiet c4e96cd -- src/data/aws/questions.json src/data/aws/topics.json && echo "AWS 데이터 그대로"
```

## 검증 절차

1. AC를 실행한다. 마지막 줄은 「AWS 데이터 그대로」를 출력해야 한다. 테스트 수는 시작 전보다 이 step이 더한 만큼 늘고, 기존 테스트가 빠지지 않았는지 파일별 개수로 확인한다.
2. `git diff c4e96cd -- src/components/QuizRunner.tsx`가 import 한 줄과 `choiceLabels(question)` 한 곳뿐인지 확인한다.
3. `git status`로 바뀐 파일을 확인한다. 위 작업에 나온 파일과, 작업 4에서 타입 주석만 바꾼 테스트 파일이어야 한다.
4. `phases/68-yes-no-question/index.json`의 step 0을 갱신한다. 성공이면 `summary`에 새 타입 이름과 모양, `isCorrect`·`choiceLabels`·`shuffleChoices`의 시그니처와
   예/아니요 규칙(0 = 예, 섞지 않고 rng를 부르지 않음), 타입 주석만 고친 파일, 테스트 수를 적는다.

## 금지사항

- **`src/data/aws/questions.json`을 고치지 마라. `format: 'choice'`를 채워 넣는 것도 안 된다.** 이유: AWS 문항은 4지선다 그대로 두기로 했고(사용자 결정), 필드가 없으면 4지선다라는 규칙이 746문항의 diff를 막는다.
- **예/아니요를 `ChoiceQuestion`의 보기 두 칸(`choices: ['예', '아니요']`)으로 표현하지 마라.** 이유: `choices`는 네 칸 튜플이고, 「버튼 순서를 섞지 않는다」를 데이터가 표현할 수 없다. 형식은 `format`으로 가른다.
- **`Progress`의 모양과 `version`(3)을 바꾸지 마라.** 이유: `answers`는 문항 id → 정오(boolean)라 형식과 무관하다. 바꾸면 기존 학습 기록의 마이그레이션이 필요해진다.
- **예/아니요 문항의 버튼 순서를 섞지 마라.** 이유: 보기가 둘뿐이라 위치가 정답을 흘릴 일이 없다. 섞으면 얻는 것 없이 「예」를 누르려다 「아니요」를 누르는 실수만 는다.
- **화면 코드에서 `question.format`으로 채점하거나 「예」「아니요」 문자열을 직접 쓰지 마라.** 이유: 인덱스 대응(0 = 예)이 두 곳에 생기면 한쪽만 바뀌는 순간 채점과 버튼이 어긋난다. `isCorrect`·`choiceLabels`를 쓴다.
- `QuizRunner`의 배치(버튼 묶음의 클래스 등)를 바꾸지 마라. 이유: step 1의 범위다.
- 기존 테스트를 깨뜨리지 마라.
