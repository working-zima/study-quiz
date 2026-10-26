# Step 5: components-subject

## 배경

phase 67은 앱 하나에 과목을 여럿 담는 구조를 만든다(지금은 AWS 하나). 지금까지:
step 0 AWS 데이터 → `src/data/aws/`, step 1 `Subject`·`subjects`, step 2 `#/:subjectId/…` 라우트·`useSubject()`/`useOptionalSubject()`·예전 주소 리다이렉트·
`SubjectListPage`(첫 화면), step 3 과목별 진행률 키, step 4 화면 9개가 과목 데이터와 과목 접두사 링크를 쓴다.

남은 것은 **화면 밖의 공용 컴포넌트**다. `QuizRunner`는 아직 AWS 주제·도식을 직접 읽고, 헤더는 과목을 모르고(로고 → `/`, 링크 → 예전 주소),
`BackButton`의 대체 목적지는 `/`다. 이 step이 고친다. 그리고 과목 안에서 첫 화면으로 돌아가는 길(「모든 과목」)을 주제 목록 맨 위에 둔다.

## 읽어야 할 파일

- `docs/ARCHITECTURE.md`의 「헤더는 모든 화면에서 같다」「화면 전환 시 스크롤」
- `docs/UI_GUIDE.md`의 「돌아가기」「상단 고정 헤더」「헤더 안의 링크」「아이콘」「터치 영역」
- `docs/ADR.md`의 ADR-040(키워드 퀴즈의 로고 연속 탭)
- `src/components/Layout.tsx`·`Layout.test.tsx`, `BackButton.tsx`·`BackButton.test.tsx`, `QuizRunner.tsx`·`QuizRunner.test.tsx`
- `src/pages/TopicListPage.tsx`·`TopicListPage.test.tsx`
- `src/hooks/useSubject.ts`, `src/test/` 아래 테스트 도우미 (step 2·3)

## 이 step이 바꾸는 문서 규칙에 대해

ARCHITECTURE 「헤더는 모든 화면에서 같다」는 「어느 화면인지 판별하는 분기를 두지 마라」고 한다. 이 step의 헤더는 **과목 안이냐 밖이냐**에 따라
모양이 다르다. 이것은 사용자가 승인한 phase 67 설계이고, step 7이 ADR-053으로 그 규칙을 **「헤더는 과목 안에서 같다」**로 개정한다.
이 step에서 문서는 고치지 않는다. 대신 아래를 지킨다 — 개정된 규칙의 내용이다.

- 분기의 근거는 `useOptionalSubject()`(과목 컨텍스트가 있는가) **하나뿐**이다. `useParams()`·`useMatch()`·`pathname`으로 화면을 판별하지 마라.
- **과목 안에서는 모든 화면의 헤더가 같다.** 확인 문제·개념 읽기 등 화면에 따라 링크를 더하거나 빼지 마라(ARCHITECTURE의 「근거 개념」 링크 사례).

## 작업

### 1. `Layout` 헤더

```
과목 안   [과목 이름 → /${id}]          [검색 → /${id}/search]  [복습 → /${id}/review]
과목 밖   [Study Quiz → /]
```

- 과목 안의 로고 글자는 `subject.title`이다(AWS는 지금과 같은 「AWS SAA-C03」). 링크 둘은 지금 스타일 그대로다.
- 과목 밖(첫 화면과 그 밖의 과목 없는 주소)에서는 로고 「Study Quiz」만 있고 `nav`가 없다. 과목 목록 화면에 검색·복습이 없는 이유: 둘 다 과목 안의 기능이다.
- **로고 연속 탭(ADR-040)은 `subject.hasKeywordQuiz`일 때만** `/${id}/keywords`로 간다. 그 밖(과목 밖, 키워드 퀴즈가 없는 과목)에서는 연속 탭을 세지 않고
  평소처럼 로고 링크로 간다.
- 스크롤 복원 effect(`useLocation`의 `hash`·`key`, `useNavigationType`)는 그대로 둔다.
- 테스트(먼저, `Layout.test.tsx`): 과목 안 — 로고 이름·`href`, 검색·복습 `href`. 과목 밖 — 「Study Quiz」 `href="/"`, 검색·복습 링크 없음.
  연속 탭 — AWS 과목에서 `/aws/keywords`, `hasKeywordQuiz: false` 과목과 과목 밖에서는 키워드 화면으로 가지 않는다. 기존 테스트는 과목 안(AWS)으로 감싸 유지한다.

### 2. `BackButton`

- 대체 목적지(직전 화면이 없을 때)를 `/`에서 **과목 홈 `/${subject.id}`**로 바꾼다. `useSubject()`를 쓴다 — `BackButton`은 과목 안의 화면(검색·복습)에만 있다.
- 테스트: 직접 연 경우 `/aws`로 간다. 기존 테스트는 과목으로 감싸 유지한다.

### 3. `QuizRunner`

- `topics` 기본값과 `visualsByTopicId`를 `useSubject()`에서 가져온다. `topics` props override는 유지한다(`props.topics ?? subject.topics`).
- `'../data/aws'` import를 없앤다.
- `QuizRunner.test.tsx`를 과목으로 감싼다.

### 4. 주제 목록 맨 위의 「모든 과목」 — `TopicListPage`

- 제목 「주제 목록」 **위 줄**에 첫 화면(`/`)으로 가는 링크 「모든 과목」을 둔다. 모양은 UI_GUIDE 「돌아가기」의 `BackButton`과 같다
  — 같은 클래스(`-ml-4 … min-h-[44px] … text-sm text-neutral-400 …`), 같은 왼쪽 화살표 SVG 20px, 라벨을 붙인다.
- `BackButton`을 재사용하지 마라 — 그것은 `navigate(-1)`이 우선인 버튼이고, 이것은 늘 `/`로 가는 링크다. 클래스 문자열·아이콘이 두 곳에서 같아야 하면
  `BackButton.tsx`에서 export해 함께 쓴다.
- 테스트: 「모든 과목」 링크가 `href="/"`이고 제목보다 앞에 있다.

### 5. 마무리 검사

과목 없는 예전 주소를 가리키는 앱 내부 링크가 이제 하나도 없어야 한다. 아래가 **아무것도 출력하지 않아야** 한다(테스트 파일 제외).

```bash
grep -rnE "(to=\{?|to: |navigate\()['\"\`]/(topic|review|search|random|keywords)['\"\`/]" src/pages src/components --include=*.tsx | grep -v "\.test\."
grep -rn "data/aws" src/components src/pages --include=*.tsx | grep -v "\.test\." | grep -v "keywords.enc.json" | grep -v "src/components/diagrams/"
```

(`to="/"`는 이제 「Study Quiz」 로고와 「모든 과목」 두 곳에만 남는다. 첫 번째 grep은 그 둘을 잡지 않는다.)

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
```

## 검증 절차

1. AC를 실행한다. 테스트 수는 step 4 이후 개수에 이 step이 더한 만큼이다.
2. 작업 5의 grep 둘이 아무것도 출력하지 않는지 확인한다.
3. `npm run dev`를 띄우지 마라. 브라우저 실측은 phase를 마친 뒤 사람 쪽 세션이 한다(Windows에서 개발 서버의 자식 프로세스가 남아 worktree 정리를 막는다).
4. `git status`로 바뀐 파일이 `Layout`·`BackButton`·`QuizRunner`·`TopicListPage`와 그 테스트, phase 메타데이터뿐인지 확인한다.
5. `phases/67-subject-split/index.json`의 step 5를 갱신한다. 성공이면 `summary`에 헤더 두 모양, 연속 탭 조건, `BackButton` 대체 목적지, 「모든 과목」 위치, 테스트 수를 적는다.

## 금지사항

- **`docs/`를 고치지 마라.** 이유: step 7이 ADR-053과 함께 한 번에 고친다.
- **헤더에 링크를 셋 이상 두지 마라. 과목 안 헤더에 「모든 과목」·과목 전환을 넣지 마라.** 이유: UI_GUIDE 「헤더 안의 링크」 — 320px에서 링크 셋이면 로고가 눌려 두 줄로 접힌다(실측). 과목 전환은 사용자가 기각했다.
- **과목 안에서 화면마다 헤더를 바꾸지 마라.** 이유: 위 「이 step이 바꾸는 문서 규칙」. 확인 문제 화면이 언마운트되는 「근거 개념」 링크 사례가 그 규칙의 이유다.
- **`SubjectListPage`·라우트·`useProgress`·`storage.ts`를 고치지 마라.** 이유: step 2·3에서 끝났다.
- **도식(`src/components/diagrams/`)의 import를 과목 컨텍스트로 바꾸지 마라.** 이유: 도식은 AWS 개념 전용이고 개념 id로 찾는다. step 0의 `'../../data/aws'`가 맞다.
- 기존 테스트를 깨뜨리지 마라.
