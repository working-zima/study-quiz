# src/pages/

화면 단위다. 라우트 하나에 파일 하나를 둔다(ARCHITECTURE 「디렉토리 구조」). 라우트 정의는 `src/App.tsx`의 `AppRoutes` 한 곳이고,
경로 표(과목 밖·과목 안)는 ARCHITECTURE 「라우트」에 있다. 과목 밖 화면은 과목 목록(`SubjectListPage`) 하나다.

- **과목 데이터는 `useSubject()`에서 읽는다.** 테스트용 props override는 남긴다 — props로 받은 값이 있으면 그것을, 없으면
  과목의 값을 쓴다(ADR-053). 과목 컨텍스트를 거치지 않고 AWS 데이터를 직접 읽는 화면은 암호문을 읽는 `KeywordQuizPage` 하나다
  (ADR-053 「트레이드오프」).
- `useSubject()`는 `SubjectScope` 밖에서 부르면 예외를 던진다. 과목 없이 렌더된 화면은 라우트 배선 실수다(ARCHITECTURE 「상태 관리」).
- **링크 앞에 `/${subject.id}`를 붙인다.** 과목 홈(주제 목록)은 `/${subject.id}`다. 과목 목록(`/`)으로 가는 길은 주제 목록 맨 위의
  「모든 과목」이다(ADR-053, UI_GUIDE 「모든 과목」).
- 검색·랜덤·복습은 그 과목의 주제·문항·복습 목록 안에서만 돈다(ADR-053).
- 진행률은 `useProgress` 훅으로 읽고 쓴다. 화면에서 `localStorage`를 직접 부르지 마라(ARCHITECTURE 「상태 관리」).
- 확인 문제·랜덤 문제·복습 문제 풀기는 문항 화면을 `QuizRunner`로 함께 쓴다. 페이지가 맡는 것은 세트를 고르는 일(섞고 자르기)과
  완료 화면이다(ARCHITECTURE 「확인 문제 화면의 공유 구조」).
- 스크롤은 `Layout`이 맡는다. 해시(`#개념 id`)를 붙인 링크로 들어오는 화면은 그 화면이 스크롤을 옮긴다(ARCHITECTURE 「화면 전환 시 스크롤」, ADR-020).
- 화면 테스트는 @testing-library/react로 사용자 관점 동작만 본다(ARCHITECTURE 「테스트 경계」).
- 화면마다의 모양(카드·버튼·검색 화면·완료 화면·하단 고정 액션 바)은 UI_GUIDE 「컴포넌트」 아래 같은 이름의 절에 있다.
