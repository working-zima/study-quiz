# src/components/

재사용 UI 컴포넌트를 둔다. 화면 단위는 `src/pages/`, 개념 본문 안의 SVG 도식은 `diagrams/`(그 폴더의 `CLAUDE.md`)다.
공용 컴포넌트도 과목 데이터를 `useSubject()`에서 읽고, 링크 앞에 `/${subject.id}`를 붙인다(ADR-053).

| 컴포넌트 | 먼저 읽을 곳 |
|---|---|
| `Layout` — 헤더, 화면 전환 시 스크롤 | ARCHITECTURE 「헤더는 과목 안에서 같다」·「화면 전환 시 스크롤」, UI_GUIDE 「상단 고정 헤더」·「헤더 안의 링크」, ADR-053 |
| `SubjectScope` — URL의 과목을 찾아 넘긴다 | ARCHITECTURE 「라우트」, ADR-053 「과목이 바뀌면 다시 마운트하는 이유」 |
| `QuizRunner` — 문항 화면 전체 | ARCHITECTURE 「확인 문제 화면의 공유 구조」·「확인 문제 안의 문항 이동」, UI_GUIDE 「보기 버튼 (확인 문제)」 이하 |
| `ConceptList` — 개념 본문(개념 읽기와 개념 펼치기가 함께 쓴다) | ARCHITECTURE 「확인 문제 화면의 공유 구조」, UI_GUIDE 「딸린 개념」·「타이포그래피」 |
| `BackButton` — 돌아가기 | UI_GUIDE 「돌아가기」, ARCHITECTURE 「개념·주제 검색」 |
| `EmphasizedText` — `**강조**`·백틱 코드 표기 | UI_GUIDE 「타이포그래피」, ADR-044·ADR-051 |
| `GlossaryTerm` — 약어 툴팁 | UI_GUIDE 「약어 툴팁 (ADR-037)」 |
| `KeywordQuizRunner`·`KeywordFlashcards` — 키워드 퀴즈 | ADR-040 |

헤더에서 지킬 것(이유는 위 문서에 있다):

- 헤더는 두 모양뿐이다 — 과목 안(과목 이름 + 검색 + 복습)과 과목 밖(「Study Quiz」뿐). 가르는 근거는 `useOptionalSubject()` 하나이고,
  `useParams()`·`pathname`으로 화면을 판별하지 마라.
- 헤더 링크는 둘이 상한이다. 확인 문제 화면용 「근거 개념」 링크, 「모든 과목」, 과목 전환을 헤더에 넣지 마라.
- `SubjectScope`는 `key={subject.id}`로 과목이 바뀔 때 하위 트리를 다시 마운트한다. 빼면 앞 과목의 진행률이 다음 과목 화면에 남는다.
- `Layout`의 스크롤 규칙(`PUSH`·`REPLACE`는 맨 위로, 해시가 붙으면 물러남, `POP`은 건드리지 않음)을 지킨다.

색(정답/오답/중요도에만)·터치 영역 44px·애니메이션·아이콘 같은 공통 규칙은 UI_GUIDE 전체에 있다.
하단 고정 액션 바는 개념 읽기 화면에 있다(UI_GUIDE 「하단 고정 액션 바」, ADR-052).
