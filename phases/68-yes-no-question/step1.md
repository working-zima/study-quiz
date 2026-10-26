# Step 1: quiz-runner

## 배경

phase 68은 문항 형식에 **예/아니요**를 더한다(지금까지는 4지선다 단일정답뿐, ADR-005). 주관식은 만들지 않는다. AWS 746문항은 4지선다 그대로이고,
예/아니요 문항을 처음 쓰는 것은 다음 과목(네트워크)이다.

step 0이 타입과 lib를 만들었다.
- `src/types/content.ts`: `Question = ChoiceQuestion | YesNoQuestion`. `ChoiceQuestion`은 `format?: 'choice'`·`choices`(넷)·`answerIndex`,
  `YesNoQuestion`은 `format: 'yes-no'`·`answer: boolean`(예가 정답이면 true).
- `src/lib/grading.ts`: `isCorrect(question, choiceIndex)`가 두 형식을 채점하고(예/아니요는 **0 = 예, 1 = 아니요**), `choiceLabels(question)`이 버튼 문구를 준다
  (예/아니요는 `['예', '아니요']`).
- `src/lib/shuffle.ts`: 예/아니요 문항은 섞지 않고 그대로 돌려준다(버튼 순서 고정). 문항 순서는 섞인다.
- `QuizRunner`는 버튼 문구를 `choiceLabels(question)`에서 읽도록 한 줄만 바뀌었다.

이 step은 **문항 화면(`QuizRunner`)이 예/아니요 문항을 푸는 모양**을 만든다.

## 읽어야 할 파일

- `src/components/CLAUDE.md`
- `src/components/QuizRunner.tsx`·`src/components/QuizRunner.test.tsx`
- `src/lib/grading.ts`·`src/lib/shuffle.ts`·`src/types/content.ts` (step 0)
- `docs/UI_GUIDE.md`의 「보기 버튼 (확인 문제)」 절 전체(하위 절 「개념 펼치기」「문항 사이 이동」 등 포함)
- `docs/ARCHITECTURE.md`의 「확인 문제 화면의 공유 구조」「확인 문제 안의 문항 이동」
- `src/test/subject.tsx`, `src/App.test.tsx`의 `describe('과목 경계')`(가짜 과목을 만드는 `makeSubject`와 `renderAt`)

## 작업

### 1. 화면 — `src/components/QuizRunner.tsx`

예/아니요 문항에서:

- 버튼은 「예」「아니요」 **둘을 가로로 나란히** 둔다. 버튼 묶음이 `grid grid-cols-2 gap-3`이다(4지선다는 지금처럼 `space-y-3` 세로 쌓기).
  보기가 둘뿐이라는 것이 한눈에 보이게 하려는 것이다. 왼쪽이 「예」, 오른쪽이 「아니요」다.
- 버튼 하나의 모양은 4지선다 보기와 같다 — 같은 기본·정답·오답 클래스, 같은 높이. 다른 것은 **글자를 가운데 정렬**(`text-center`)한다는 것 하나다.
  짧은 낱말을 넓은 버튼의 왼쪽에 붙이면 둘이 나란히 놓인 모양이 무너진다.
- 그 밖의 동작은 4지선다와 **완전히 같다**: 첫 선택으로 채점하고 `answer(id, correct)`를 부른다, 정답 버튼만 활성으로 남고 그 버튼을 한 번 더 누르면 넘어간다,
  고른 오답은 빨강·정답은 초록, 해설, 「정답을 한 번 더 누르면 …」 안내, 「복습에 넣기」, 「개념 보기」, 이전 문제로 돌아가기.
- 형식에 따른 분기는 **버튼 묶음의 배치와 글자 정렬에만** 둔다. 채점은 `isCorrect`, 문구는 `choiceLabels`에서 온다.

한 세트에 두 형식이 섞여 들어올 수 있다(한 과목에 두 형식이 있으면 랜덤 세트가 그렇다). 문항마다 자기 형식으로 그린다.

### 2. 테스트(먼저) — `src/components/QuizRunner.test.tsx`

예/아니요 픽스처 문항을 테스트 파일 안에 만든다(AWS 데이터에는 예/아니요 문항이 없다). 렌더링은 기존 테스트와 같은 방식(`renderWithSubject` 또는 파일이 이미 쓰는 Provider)으로 한다.

- 예/아니요 문항에는 보기 버튼이 「예」「아니요」 둘뿐이고 이 순서다. 두 버튼을 담은 묶음이 `grid-cols-2`를 가진다.
- `answer: true` 문항에서 「예」를 누르면 `answer`가 `(id, true)`로 불리고 해설이 보인다. 「아니요」를 누르면 `(id, false)`이고, 「아니요」가 오답 표시·「예」가 정답 표시를 갖는다.
- `answer: false` 문항에서는 「아니요」가 정답이다.
- 정답 공개 뒤 오답 버튼은 비활성이고, 정답 버튼을 다시 누르면 다음 문항으로 넘어간다(채점은 다시 일어나지 않는다 — `answer` 호출 횟수 그대로).
- 4지선다 문항과 예/아니요 문항이 섞인 세트를 끝까지 풀면 `renderComplete`가 맞힌 수와 전체 수로 불린다. 4지선다 문항은 보기 넷으로 세로 쌓기 그대로다.
- 이전 문제로 돌아가면 예/아니요 문항의 고른 상태(정답·오답 표시, 해설)가 남아 있다.

기존 4지선다 테스트는 고치지 않는다.

### 3. 경로 하나를 끝까지 — `src/App.test.tsx`

`describe('과목 경계')`의 가짜 과목 방식으로, **문항이 모두 예/아니요인 과목** 하나를 만들어 그 과목의 주제 확인 문제(`/<과목 id>/topic/<주제 id>/quiz`)를 연다.
실제 섞기(`Math.random`)를 거쳐도 첫 문항의 버튼이 「예」「아니요」 이 순서로 둘뿐이고, 하나를 누르면 해설이 보이는지 확인한다.
`Subject.questions`(`Question[]`) → `QuizPage` → `shuffleQuestions` → `QuizRunner`가 끊기지 않고 이어지는지 보는 테스트다. 가짜 과목의 id·주제 id·개념 id는
AWS와 기존 가짜 과목(`a`·`b`)과 겹치지 않게 한다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
```

## 검증 절차

1. AC를 실행한다. 테스트 수는 step 0 이후 개수에 이 step이 더한 만큼이다. `QuizRunner.test.tsx`의 기존 테스트가 그대로 있는지 개수로 확인한다.
2. `git status`로 바뀐 파일이 `src/components/QuizRunner.tsx`·`src/components/QuizRunner.test.tsx`·`src/App.test.tsx`뿐인지 확인한다(phase 메타데이터 제외).
3. 예/아니요를 지우고 생각해 본다 — `QuizRunner.tsx`에서 형식 분기를 빼면 이 step의 새 테스트가 실패하는가. 실패하지 않는 테스트가 있으면 단언을 고친다.
4. `phases/68-yes-no-question/index.json`의 step 1을 갱신한다. 성공이면 `summary`에 버튼 묶음의 클래스(두 형식), 글자 정렬, 형식 분기가 들어간 자리, 새 테스트 목록과 테스트 수를 적는다.

## 금지사항

- **예/아니요 전용 컴포넌트(`YesNoRunner` 같은)를 따로 만들지 마라.** 이유: 정오 표시·정답 재탭·복습·개념 펼치기·이전 문항이 `QuizRunner` 하나에 있어야 두 형식이 같은 규칙을 공유한다(ARCHITECTURE 「확인 문제 화면의 공유 구조」). 갈라지면 한쪽만 고쳐지는 회귀가 생긴다.
- **`QuizRunner`에 형식을 정하는 prop(`format`·`mode` 등)을 더하지 마라.** 이유: 한 세트에 두 형식이 섞인다. 형식은 문항이 정한다.
- **`QuizRunner` 안에서 0 = 예 대응이나 「예」「아니요」 문자열을 직접 쓰지 마라.** 이유: 그 규칙은 `src/lib/grading.ts` 한 곳에 있다(step 0).
- **새 색이나 새 버튼 모양을 만들지 마라.** 이유: 색은 정답/오답/중요도에만 쓴다(UI_GUIDE 「색상」). 예/아니요 버튼은 보기 버튼과 같은 모양이고 배치만 다르다.
- 화면(`src/pages/*.tsx`)·lib·타입을 고치지 마라. 이유: 페이지는 문항을 받아 넘길 뿐이고, lib·타입은 step 0의 범위다.
- AWS 데이터에 예/아니요 문항을 넣지 마라. 이유: AWS 문항은 4지선다 그대로 두기로 했다(사용자 결정). 테스트는 픽스처로 한다.
- 기존 테스트를 깨뜨리지 마라.
