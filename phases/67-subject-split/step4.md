# Step 4: pages-subject

## 배경

phase 67은 앱 하나에 과목을 여럿 담는 구조를 만든다(지금은 AWS 하나). 지금까지:
step 0 AWS 데이터 → `src/data/aws/`, step 1 `Subject`·`subjects`, step 2 `#/:subjectId/…` 라우트·`useSubject()`·예전 주소 리다이렉트·`SubjectListPage`,
step 3 과목별 진행률 키.

화면은 아직 AWS 데이터를 직접 import하고(`'../data/aws'`), 링크는 과목 없는 예전 주소(`/topic/…`)를 가리킨다 — 리다이렉트가 받아 주고 있다.
이 step은 **화면 9개가 자기 과목의 데이터만 쓰고, 과목 안의 주소로 링크하게 한다.** 그래야 검색·랜덤·복습이 과목을 넘지 않는다.

## 읽어야 할 파일

- `docs/ARCHITECTURE.md`의 「라우트」「개념·주제 검색」「전체 범위 랜덤 세트」
- `src/hooks/useSubject.ts`·`src/App.tsx`·`src/test/` 아래 테스트 도우미 (step 2·3)
- 화면 9개와 그 테스트: `ConceptReadPage` `KeywordQuizPage` `QuizPage` `RandomQuizPage` `RandomStartPage` `ReviewPage` `ReviewQuizPage` `SearchPage` `TopicListPage`

## 작업

### 1. 데이터 기본값을 과목에서

각 화면은 지금 `topics = defaultTopics`처럼 import한 AWS 데이터를 props 기본값으로 쓴다. 이것을 `useSubject()`에서 가져오게 바꾼다.

- **테스트용 props override는 유지한다.** props로 넘긴 값이 있으면 그것을, 없으면 과목의 값을 쓴다(`props.topics ?? subject.topics`).
  기본값 자리에서 훅을 부를 수 없으니 함수 본문에서 고른다.
- `ConceptReadPage`의 `visualsByTopicId`도 과목에서 가져온다.
- `KeywordQuizPage`는 과목 데이터가 아니라 AWS 키워드 암호문(`src/data/aws/keywords.enc.json`)을 그대로 import한다 — 키워드 퀴즈는
  `hasKeywordQuiz`인 과목에만 라우트가 열리고(step 2), 지금 그런 과목은 AWS뿐이다. 이 화면에서 바꾸는 것은 아래 링크뿐이다.
- 바꾼 뒤 `src/pages/` 아래 구현 파일에 `'../data/aws'` import가 남지 않아야 한다(`KeywordQuizPage`의 `keywords.enc.json` 하나만 예외).

### 2. 링크에 과목 접두사

화면 안의 모든 앱 내부 주소에 `/${subject.id}`를 붙인다. 대상은 `<Link to>`, `<Navigate to>`, `navigate(…)`, 그리고 `to`를 담는 객체(예: `ConceptReadPage`의 `primaryAction`).

| 지금 | 바뀐 뒤 |
|---|---|
| `/` (「주제 목록으로 돌아가기」 등) | `/${subject.id}` |
| `/topic/${id}`·`/topic/${id}/quiz`·`/topic/${id}#${conceptId}` | `/${subject.id}/topic/…` |
| `/review`·`/review/quiz`·`/review/quiz/${topicId}` | `/${subject.id}/review…` |
| `/random`·`/random/${count}` | `/${subject.id}/random…` |

- 같은 접두사 문자열을 화면마다 손으로 조립하게 된다. 도우미 함수를 만들지 말지는 판단에 맡기되, 만든다면 `src/lib/`에 React 없이 두고 테스트를 먼저 쓴다.
- 바꾼 뒤 아래 검사가 **아무것도 출력하지 않아야** 한다(테스트 파일 제외).

```bash
grep -rnE "(to=\{?|to: |navigate\()['\"\`]/(topic|review|search|random|keywords)?['\"\`/]" src/pages --include=*.tsx | grep -v "\.test\."
```

(이 step 시작 전에는 28줄이 나온다.)

### 3. 테스트

- 기존 화면 테스트의 링크 단언(`toHaveAttribute('href', '/topic/…')` 등)을 과목 접두사가 붙은 값으로 바꾼다. 감쌀 과목은 step 3과 같은 `awsSubject`라 기대값은 `/aws/…`다.
- step 3에서 감싸지 않은 `RandomStartPage`·`SearchPage`·`KeywordQuizPage` 테스트도 step 3의 테스트 도우미로 감싼다.
- **새 테스트 — 과목을 넘지 않는다.** `src/App.test.tsx`에 가짜 과목 둘(`a`·`b`, 서로 다른 주제·문항·`progressKey`)을 `AppRoutes`의 `subjects`로 넘겨 확인한다.
  - 검색: 두 과목에 같은 낱말이 든 주제를 두고 `/a/search?q=그낱말` — a 과목의 결과만 나오고 링크가 `/a/topic/…`이다.
  - 랜덤: `/b/random/all`이 b 과목 문항 수만큼만 낸다.
  - 복습: a 과목 키에 복습 문항을 저장해 두고 `/b/review`를 열면 비어 있다. `/a/review`에는 그 문항이 있다.
  - 주제 목록: `/a`에 a 과목 주제만 있고 카드 링크가 `/a/topic/…`이다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
```

## 검증 절차

1. AC를 실행한다. 테스트 수는 step 3 이후 개수에 이 step이 더한 만큼이다.
2. 작업 2의 grep 검사가 아무것도 출력하지 않는지, `grep -rn "data/aws" src/pages --include=*.tsx | grep -v "\.test\."`가 `keywords.enc.json` 한 줄만 내는지 확인한다.
3. `git status`로 바뀐 파일이 화면 9개와 그 테스트, `src/App.test.tsx`(와 도우미를 만들었다면 `src/lib/`의 파일과 테스트), phase 메타데이터뿐인지 확인한다.
4. `phases/67-subject-split/index.json`의 step 4를 갱신한다. 성공이면 `summary`에 바뀐 화면, 링크 접두사 방식, 과목 경계 테스트 넷, 테스트 수를 적는다.

## 금지사항

- **`Layout`·`BackButton`·`QuizRunner`를 고치지 마라.** 이유: step 5의 범위다. `QuizRunner`는 아직 AWS 주제·도식을 직접 읽고, 헤더 링크는 예전 주소다 — 리다이렉트가 받는다.
- **`TopicListPage`에 「모든 과목」 링크를 넣지 마라.** 이유: step 5에서 `Layout`·`BackButton` 변경과 함께 넣는다.
- **테스트용 props를 없애지 마라.** 이유: 화면 테스트가 작은 가짜 데이터로 동작을 검증하는 방식이다. 없애면 테스트가 실제 데이터 746문항에 묶인다.
- **예전 주소 리다이렉트를 지우지 마라.** 이유: 북마크·공유된 예전 주소가 계속 들어온다(step 2).
- **검색·랜덤에 「모든 과목에서」 같은 선택지를 만들지 마라.** 이유: 과목이 섞이지 않는 것이 사용자 요구다.
- 기존 테스트를 깨뜨리지 마라.
