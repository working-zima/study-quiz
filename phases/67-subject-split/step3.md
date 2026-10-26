# Step 3: progress-per-subject

## 배경

phase 67은 앱 하나에 과목을 여럿 담는 구조를 만든다(지금은 AWS 하나). 지금까지:
step 0이 AWS 데이터를 `src/data/aws/`로 옮겼고, step 1이 `Subject`(`src/types/subject.ts`, `progressKey` 포함)와 `subjects`(`src/data/index.ts`)를,
step 2가 `#/:subjectId/…` 라우트와 `SubjectContext`·`useSubject()`(`src/hooks/useSubject.ts`)를 만들었다. 과목이 바뀌면 `SubjectScope`가
하위 트리를 다시 마운트한다(`key={subject.id}`).

이 step은 **진행률(읽음·답변·복습 목록)을 과목마다 따로 저장한다.** 한 과목의 기록이 다른 과목에 닿으면 안 된다.
AWS 과목의 키는 지금과 같은 `'aws-quiz.progress'`라서, 배포해도 기존 사용자의 기록은 그대로 이어진다.

## 읽어야 할 파일

- `docs/ARCHITECTURE.md`의 「상태 관리」「테스트 경계」
- `docs/ADR.md`의 ADR-017·ADR-032 — 복습 목록과 v1→v2→v3 마이그레이션의 이유
- `src/lib/storage.ts`·`src/lib/storage.test.ts`
- `src/hooks/useProgress.ts`·`src/hooks/useProgress.test.tsx`
- `src/hooks/useSubject.ts`·`src/components/SubjectScope.tsx` (step 2)
- `src/data/aws/index.ts`의 `awsSubject` (step 1)
- `useProgress()`를 부르는 화면 여섯과 그 테스트: `ConceptReadPage`·`QuizPage`·`RandomQuizPage`·`ReviewPage`·`ReviewQuizPage`·`TopicListPage`

## 작업

### 1. 저장소 — `src/lib/storage.ts`

```ts
export function loadProgress(key: string): Progress
export function saveProgress(key: string, progress: Progress): void
```

- 키를 인자로 받는다. 모듈 안의 `PROGRESS_KEY` 상수는 없앤다 — 키는 과목 목록이 정한다.
- **v1 → v3, v2 → v3 마이그레이션은 그대로 둔다.** 어느 키에서 읽든 같은 규칙이 적용된다.
- `lib/`는 React와 데이터 모듈에 의존하지 않는다(CLAUDE.md). 키는 호출하는 쪽이 넘긴다.
- 테스트(먼저): 기존 테스트는 키를 넘기도록 바꾼다. 새 테스트 — 키 `a`에 저장한 것이 키 `b`에서는 빈 진행률로 읽힌다, 키 `b`에 저장해도 키 `a`의 값이 그대로다.

### 2. 훅 — `src/hooks/useProgress.ts`

- 반환 모양은 그대로다(`progress`·`markRead`·`answer`·`setInReview`).
- `useSubject().progressKey`로 읽고 쓴다. `useState`의 초기값은 `() => loadProgress(progressKey)`.
  과목이 바뀌면 step 2의 `SubjectScope`가 하위 트리를 다시 마운트하므로, 훅 안에서 키 변화를 따라가는 effect를 두지 마라.
- 테스트(먼저): `renderHook`의 `wrapper`로 `SubjectContext.Provider`를 준다. 기존 `vi.mock('../lib/storage')` 단언은 키를 첫 인자로 받는지까지 본다.
  새 테스트 — 키가 다른 두 과목에서 같은 문항에 답해도 서로의 `saveProgress` 호출에 섞이지 않는다.
  (실제 localStorage로 두 과목의 기록이 섞이지 않는지 보는 테스트는 `storage.test.ts` 쪽이 맡는다.)

### 3. 화면 테스트를 Provider로 감싼다

`useProgress()`가 `useSubject()`를 부르므로, 위 여섯 화면의 테스트는 Provider 없이 렌더링하면 던진다. **화면 코드는 바꾸지 않고 테스트만** 감싼다.

- 감쌀 과목은 `awsSubject`로 한다. 화면 테스트는 `topics`·`questions`·`progress`를 props로 넘겨 검증하므로 과목의 데이터는 쓰이지 않고,
  키만 쓰인다.
- 여러 테스트 파일이 같은 래퍼를 쓰므로 테스트 도우미 하나로 둔다. 위치는 `src/test/` 아래(예: `src/test/subject.tsx`의
  `renderWithSubject`). 경로에 `test`가 들어가면 tdd-guard가 막지 않고, `.test.` 접미사가 없으면 Vitest가 테스트 파일로 집지 않는다.
- `src/App.test.tsx`는 이미 실제 라우트(`SubjectScope`)로 렌더링하므로 따로 감싸지 않는다.

`useProgress()`를 부르지 않는 화면(`RandomStartPage`·`SearchPage`·`KeywordQuizPage`)과 `QuizRunner`의 테스트는 이 step에서 손대지 않는다 —
그 화면들이 `useSubject()`를 직접 부르게 되는 step 4·5에서 감싼다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
```

## 검증 절차

1. AC를 실행한다. 테스트 수는 step 2 이후 개수에 이 step이 더한 만큼이다. 기존 테스트가 빠지지 않았는지 파일별 개수로 확인한다.
2. `grep -rn "PROGRESS_KEY\|aws-quiz.progress" src`로 키 문자열이 `src/data/aws/index.ts`(와 그 단언 테스트)에만 남았는지 확인한다.
3. `git status`로 화면 코드(`src/pages/*.tsx` 중 테스트가 아닌 것)가 바뀌지 않았는지 확인한다.
4. `phases/67-subject-split/index.json`의 step 3을 갱신한다. 성공이면 `summary`에 새 시그니처, 테스트 도우미의 경로와 이름, 감싼 테스트 파일, 테스트 수를 적는다.

## 금지사항

- **AWS의 키를 바꾸거나, 예전 키에서 새 키로 옮기는 마이그레이션을 만들지 마라.** 이유: AWS 키는 `'aws-quiz.progress'` 그대로라 옮길 것이 없다. 이전 코드는 쓰이지 않을 코드다.
- **진행률 하나에 과목별 칸을 두는 구조(`{ aws: Progress, … }`)로 바꾸지 마라.** 이유: 설계는 과목마다 키를 따로 쓴다. 저장 형식이 바뀌면 v3 마이그레이션과 기존 기록이 깨진다.
- **화면 코드(`src/pages/*.tsx`)·`QuizRunner`·`Layout`을 고치지 마라.** 이유: step 4·5의 범위다.
- **`useProgress`가 과목 밖에서 AWS 키로 물러서게 하지 마라.** 이유: 과목 없이 렌더링된 것은 배선 실수다. step 2가 `useSubject()`를 던지게 만든 이유와 같다.
- 컴포넌트에서 `localStorage`를 직접 부르지 마라(ARCHITECTURE 「상태 관리」). 테스트 도우미도 마찬가지다.
- 기존 테스트를 깨뜨리지 마라.
