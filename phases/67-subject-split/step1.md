# Step 1: subject-registry

## 배경

phase 67은 앱 하나에 과목을 여럿 담는 구조를 만든다(지금은 AWS 하나, 다음 과목은 네트워크 — 이 phase에서는 넣지 않는다).
step 0이 AWS 데이터를 `src/data/aws/`로 옮겼다. 이 step은 **과목이 무엇인지(타입)와 앱에 어떤 과목이 있는지(목록)**를 만든다.
라우트·화면은 아직 이 목록을 쓰지 않는다 — step 2부터 쓴다.

## 읽어야 할 파일

- `src/data/aws/index.ts` — AWS 데이터 export(step 0이 옮김)
- `src/types/content.ts`·`src/types/visuals.ts`
- `src/lib/storage.ts` — 지금 진행률 키 `'aws-quiz.progress'`
- `src/App.tsx` — 지금 라우트의 첫 세그먼트(`topic`·`review`·`search`·`random`·`keywords`)
- `src/components/diagrams/registry.ts` — 도식을 **개념 id 하나로** 찾는다(과목을 모른다)
- `src/data/aws/data.test.ts` — AWS 데이터 안의 id 유일성 검사

## 작업

### 1. 타입 — `src/types/subject.ts`

```ts
export interface Subject {
  id: string                                       // URL 첫 세그먼트. '#/aws/topic/…'의 'aws'
  title: string                                    // 헤더와 과목 목록에 쓰는 이름
  progressKey: string                              // 이 과목의 진행률을 담는 localStorage 키
  topics: Topic[]
  questions: Question[]
  visualsByTopicId: Record<string, TopicVisuals>
  hasKeywordQuiz: boolean                          // 숨은 키워드 퀴즈(ADR-040)가 있는 과목인가
}
```

`Topic`·`Question`·`TopicVisuals`는 기존 타입을 import한다. 다른 곳에 과목 타입을 다시 정의하지 마라(CLAUDE.md 「데이터 타입은 `src/types/`에 단 한 곳」).

### 2. AWS 과목 — `src/data/aws/index.ts`에 추가

기존 export(`topics`·`questions`·`visualsByTopicId`)는 그대로 두고(도식 101곳이 쓴다) 과목 객체를 하나 더 export한다.

```ts
export const awsSubject: Subject  // id 'aws', title 'AWS SAA-C03', progressKey 'aws-quiz.progress', hasKeywordQuiz true
                                  // topics·questions·visualsByTopicId는 위 export를 그대로 담는다
```

- **`progressKey`는 `'aws-quiz.progress'` 그대로다.** 이유: 지금 사용자의 학습 기록이 이 키에 있다. 바꾸면 배포하는 순간 모두의 진행률·복습 목록이 사라진다.
- `title`은 지금 헤더 로고 글자와 같은 `'AWS SAA-C03'`이다.

### 3. 과목 목록 — `src/data/index.ts` (새 파일)

```ts
export const subjects: Subject[]  // 지금은 [awsSubject] 하나
```

### 4. 불변식 테스트 — `src/data/index.test.ts` (새 파일, 구현보다 먼저)

`subjects` 전체에 대해 아래를 검사한다. 과목이 하나뿐인 지금도 통과해야 하고, 과목이 늘어도 그대로 지켜져야 하는 규칙이다.

1. **과목 id가 서로 겹치지 않는다.**
2. **과목 id가 예전 경로의 첫 세그먼트와 겹치지 않는다** — `topic`·`review`·`search`·`random`·`keywords`.
   이유: step 2가 과목 접두사 없는 예전 주소(`#/topic/…` 등)를 `#/aws/…`로 넘기는 리다이렉트 라우트를 둔다. 과목 id가 그 이름이면
   정적 경로가 라우트 순위에서 이겨 그 과목에 들어갈 수 없다. 목록은 테스트 안에 리터럴로 두고, 출처(`src/App.tsx`의 예전 경로)를 주석으로 단다.
3. **주제 id와 개념 id가 과목을 넘어서도 겹치지 않는다.** 이유: 도식 registry(`src/components/diagrams/registry.ts`)가 개념 id 하나로
   도식을 찾는다. 다른 과목에 같은 개념 id가 생기면 그 개념 아래에 엉뚱한 과목의 도식이 붙는다. 검색 결과의 앵커(`#개념id`)도 같은 이유로 겹치면 안 된다.
4. **`progressKey`가 서로 겹치지 않는다.** 이유: 겹치면 두 과목이 한 진행률을 나눠 쓴다.
5. AWS 과목의 값 — `id`·`title`·`progressKey`·`hasKeywordQuiz`가 위 값이고, `topics`·`questions`·`visualsByTopicId`가
   `src/data/aws/index.ts`의 export와 **같은 객체**(`toBe`)다.

문항 id는 과목 **안에서만** 유일하면 된다(진행률이 과목마다 따로 저장되므로). 과목을 넘는 문항 id 유일성은 검사하지 마라.

순서: 테스트를 먼저 쓰고 `npx vitest run src/data/index.test.ts`가 (모듈이 없어) 실패하는 것을 본 뒤 구현한다.
tdd-guard 훅은 `src/data/index.test.ts`가 없으면 `src/data/index.ts` 편집을 막는다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
```

## 검증 절차

1. AC를 실행한다. 테스트 수는 step 0의 2701개에 이 step이 더한 만큼이다. 다른 테스트 수가 줄면 안 된다.
2. `git status`로 바뀐 파일이 `src/types/subject.ts`, `src/data/index.ts`, `src/data/index.test.ts`, `src/data/aws/index.ts`와 phase 메타데이터뿐인지 확인한다.
3. `phases/67-subject-split/index.json`의 step 1을 갱신한다. 성공이면 `summary`에 `Subject` 필드, `awsSubject`·`subjects`의 위치, 불변식 테스트 다섯 가지와 테스트 수를 적는다.

## 금지사항

- **라우트·화면·훅·`storage.ts`를 고치지 마라.** 이유: step 2~5의 범위다. 여기서 화면이 `subjects`를 읽기 시작하면 step마다의 검증이 섞인다.
- **`storage.ts`의 키 상수를 `awsSubject`에서 가져오게 바꾸지 마라.** 이유: 키를 인자로 받는 개편은 step 3이 한다. 지금 묶으면 `lib/`가 데이터 모듈에 의존하게 된다.
- **과목 id 형식(소문자·하이픈 등)을 검사하는 규칙을 더하지 마라.** 이유: 설계에 없는 규칙이다. 위 다섯 가지만 검사한다.
- **네트워크 과목이나 빈 자리표시 과목을 목록에 넣지 마라.** 이유: 데이터가 없는 과목이 첫 화면에 보이게 된다. 네트워크는 다음 phase들의 범위다.
- 기존 테스트를 깨뜨리지 마라.
