# Step 2: subject-routes

## 배경

phase 67은 앱 하나에 과목을 여럿 담는 구조를 만든다(지금은 AWS 하나). step 0이 AWS 데이터를 `src/data/aws/`로 옮겼고,
step 1이 `Subject` 타입(`src/types/subject.ts`)과 과목 목록 `subjects`(`src/data/index.ts`)를 만들었다.

이 step은 **URL에 과목을 넣는다.** 지금 `#/topic/s3` 같은 주소가 `#/aws/topic/s3`가 되고, 첫 화면 `#/`은 과목 목록이 된다.
과목을 고르는 곳은 첫 화면 하나다(사용자 결정, 2026-10-26 — 마지막 과목 기억·헤더의 과목 전환은 기각됐다).

**화면 코드는 이 step에서 고치지 않는다.** 화면 안의 링크는 아직 `/topic/…`처럼 과목 없는 예전 주소를 가리키지만, 아래 리다이렉트가
그것을 `/aws/…`로 받아 준다. 화면이 과목을 읽게 하는 것은 step 3~5다.

## 읽어야 할 파일

- `docs/ARCHITECTURE.md`의 「라우트」「헤더는 모든 화면에서 같다」「화면 전환 시 스크롤」
- `docs/UI_GUIDE.md`의 「카드 (주제 목록 항목)」「타이포그래피」
- `src/App.tsx`·`src/App.test.tsx`
- `src/components/Layout.tsx`
- `src/pages/TopicListPage.tsx` — 카드·제목 스타일의 본보기
- `src/types/subject.ts`·`src/data/index.ts`·`src/data/index.test.ts` (step 1)
- `src/hooks/useProgress.ts` — 이 훅의 `useState` 초기값이 **마운트 때 한 번만** 읽힌다는 점(아래 「과목이 바뀌면 다시 마운트」의 이유)

## 작업

### 1. 과목 컨텍스트 — `src/hooks/useSubject.ts` (+ `useSubject.test.tsx` 먼저)

```ts
export const SubjectContext: React.Context<Subject | null>
export function useSubject(): Subject                 // Provider 밖에서 부르면 Error를 던진다
export function useOptionalSubject(): Subject | null  // 과목 밖(첫 화면)에서는 null. step 5의 Layout이 쓴다
```

`useSubject()`가 던지는 이유: 과목 안의 화면이 과목 없이 렌더링되면 그것은 라우트 배선 실수다. 기본값(AWS)으로 조용히 넘어가면
다른 과목의 화면이 AWS 데이터를 보여 주는 사고를 테스트가 못 잡는다.

### 2. 과목 범위 — `src/components/SubjectScope.tsx` (+ 테스트 먼저)

```tsx
export function SubjectScope({ subjects }: { subjects?: Subject[] })  // 기본값은 src/data의 subjects
```

- `useParams()`의 `subjectId`로 과목을 찾는다. **없는 과목이면 `/`로 replace**한다.
- 찾았으면 `SubjectContext.Provider`로 `<Outlet />`을 감싼다.
- **과목이 바뀌면 하위 트리를 다시 마운트한다 — Provider에 `key={subject.id}`를 건다.** 이유: `#/a/review`에서 `#/b/review`로 가면
  라우트 트리의 모양이 같아 React가 화면 컴포넌트를 재사용한다. `useProgress`는 저장소를 `useState` 초기값으로 한 번만 읽으므로(step 3부터는
  과목의 키로 읽는다) 재사용되면 b 과목 화면에 a 과목의 진행률이 남는다. 테스트로 못 박는다: 가짜 과목 둘을 주고, 하위에 `useState(() => useSubject().id)`
  같은 첫 값을 붙잡는 컴포넌트를 둔 채 a → b로 이동하면 b가 보여야 한다.

### 3. 과목 목록 화면 — `src/pages/SubjectListPage.tsx` (+ 테스트 먼저)

```tsx
export function SubjectListPage({ subjects }: { subjects?: Subject[] })  // 기본값은 src/data의 subjects
```

- 제목 `h1` 「과목」. 스타일은 `TopicListPage`의 제목과 같다.
- 과목마다 카드 하나 — 카드 전체가 `/${subject.id}`로 가는 링크다. 카드 스타일은 UI_GUIDE 「카드 (주제 목록 항목)」 그대로.
- 카드 안: 과목 이름(`title`)과 그 아래 한 줄 「주제 N개 · 문항 M개」(`topics.length`, `questions.length`). 보조 텍스트 색은 `TopicListPage` 카드의 보조 줄과 같게.
- 진행률·별점·설명 문구는 넣지 마라(아래 금지사항).

### 4. 라우트 — `src/App.tsx`

```tsx
export function AppRoutes({ subjects }: { subjects?: Subject[] })  // 기본값은 src/data의 subjects. SubjectScope·SubjectListPage에 넘긴다
```

라우트 모양은 이렇다(형태를 바꾸지 마라).

```
<Route element={<Layout />}>                      ← 과목 밖
  index                → SubjectListPage
  topic/*  review/*  search  random/*  keywords   → 예전 주소 리다이렉트
  *                    → Navigate to "/" replace
</Route>
<Route path=":subjectId" element={<SubjectScope />}>   ← 과목 안 (위 Layout 라우트의 자식이 아니라 형제다)
  <Route element={<Layout />}>
    index                  → TopicListPage
    topic/:topicId         → ConceptReadPage
    topic/:topicId/quiz    → QuizPage
    review · review/quiz · review/quiz/:topicId · search · random · random/:count   (지금과 같은 화면)
    keywords               → 과목의 hasKeywordQuiz가 true면 KeywordQuizPage, 아니면 과목 홈(`/${subject.id}`)으로 replace
    *                      → 과목 홈(`/${subject.id}`)으로 replace
  </Route>
</Route>
```

- **예전 주소 리다이렉트**: 과목이 AWS 하나였던 시절의 주소다. `'/aws' + pathname`으로 replace하되 **`search`와 `hash`를 그대로 붙인다**
  (`#/search?q=s3` → `#/aws/search?q=s3`, `#/topic/vpc-networking#vpc-networking.nat` → `#/aws/topic/vpc-networking#vpc-networking.nat`).
  이유: 사용자가 북마크·공유한 주소와, step 4 전까지 화면 안에 남은 예전 링크가 모두 이 길로 들어온다. 검색어와 개념 앵커(ADR-020)를 잃으면 안 된다.
  `'aws'`는 「예전 주소의 과목」이라는 이름을 붙인 상수로 둔다.
- 과목 안의 `Layout`과 과목 밖의 `Layout`은 서로 다른 라우트 가지에 있다. 과목 라우트를 바깥 `Layout` 라우트의 자식으로 넣으면 헤더가 두 번 그려진다.
- 라우트 순위: `#/search`는 정적 `search`가 동적 `:subjectId`보다 앞서고, `#/aws`는 `:subjectId`가 `*`보다 앞선다. step 1의 불변식 테스트가
  과목 id와 예전 첫 세그먼트가 겹치지 않음을 보장한다.

### 5. 테스트 — `src/App.test.tsx`

기존 테스트는 화면이 그대로 렌더링되는지 보는 것이므로, 경로를 바꿔 유지한다.

- `#/`은 과목 목록(「과목」 제목, AWS 카드 → `/aws`), `#/aws`는 주제 목록이다. 지금의 「/에서 주제 목록…」 테스트를 이 둘로 나눈다.
- 나머지 기존 테스트는 `/aws/…` 경로로 바꾼다.
- 새 테스트:
  - 예전 주소 다섯 종류가 `/aws/…`로 착지한다(경로 표시용 `CurrentPath`를 쓴다). `?q=`와 `#앵커`가 유지된다.
  - 없는 과목(`/nope`, `/nope/topic/x`)은 `/`로 간다. 과목 안의 없는 경로(`/aws/nope`)는 `/aws`로 간다.
  - `/aws/keywords`는 키워드 퀴즈 화면이다. `hasKeywordQuiz: false`인 가짜 과목(`AppRoutes`의 `subjects`로 넘긴다)의 `/<id>/keywords`는 그 과목 홈으로 간다.

`Layout.tsx`는 이 step에서 고치지 않는다. 헤더 링크(`/search`·`/review`)와 로고(`/`)는 아직 예전 주소를 가리키고, 과목 안에서 로고를 누르면 첫 화면으로 간다.
step 5가 고친다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
```

## 검증 절차

1. AC를 실행한다. 테스트 수는 step 1 이후 개수에 이 step이 더한 만큼이다.
2. `npm run dev`를 띄우지 않아도 된다. 대신 `src/App.test.tsx`가 위 「새 테스트」를 모두 담았는지 다시 읽어 확인한다.
3. `git status`로 바뀐 파일이 `src/App.tsx`·`src/App.test.tsx`, 새 파일 `src/hooks/useSubject.ts`·`src/components/SubjectScope.tsx`·`src/pages/SubjectListPage.tsx`와 그 테스트, phase 메타데이터뿐인지 확인한다.
4. `phases/67-subject-split/index.json`의 step 2를 갱신한다. 성공이면 `summary`에 새 파일·훅 시그니처, 라우트 모양, 리다이렉트 규칙, `key={subject.id}` 재마운트, 테스트 수를 적는다.

## 금지사항

- **화면(`src/pages/` 기존 9개)·`Layout`·`BackButton`·`QuizRunner`·`useProgress`·`storage.ts`를 고치지 마라.** 이유: step 3~5의 범위다. 이 step은 라우트만 바꾸고, 예전 링크는 리다이렉트가 받는다.
- **`BrowserRouter`로 바꾸지 마라.** 이유: CLAUDE.md CRITICAL — GitHub Pages에서 새로고침 시 404가 난다.
- **마지막으로 연 과목을 기억해 첫 화면을 건너뛰지 마라. 헤더에 과목 전환을 두지 마라.** 이유: 사용자가 3안 중 「첫 화면에서 고른다」를 골랐다. 나머지 둘은 기각됐다.
- **과목 목록 카드에 진행률·별점·설명을 넣지 마라.** 이유: 설계는 이름과 「주제 N개 · 문항 M개」뿐이다. 요청받지 않은 기능이다.
- **예전 주소를 `aws` 외의 과목으로 보내는 분기를 두지 마라.** 이유: 예전 주소는 과목이 AWS 하나였을 때만 만들어졌다.
- 기존 테스트를 깨뜨리지 마라.
