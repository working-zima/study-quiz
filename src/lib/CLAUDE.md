# src/lib/

순수 로직(채점·진행률 계산·저장소 접근)을 둔다. **React에 의존하지 않게 짠다.** 이유: 이 계층은 DOM 없이 테스트한다
(Vitest 단위 테스트, ARCHITECTURE 「테스트 경계」).

- **localStorage에 직접 접근하는 유일한 계층이다.** 컴포넌트에서 `localStorage`를 부르지 마라. 이유: 저장소 접근을 DOM 없이
  테스트하기 위해서다(ARCHITECTURE 「상태 관리」).
- 진행률은 `storage.ts`의 `loadProgress(key)`·`saveProgress(key, progress)`가 읽고 쓴다. **키는 호출하는 쪽이 넘긴다** — 화면에서는
  `useProgress`가 과목의 `progressKey`를 읽어 넘긴다. 앱 코드에서 키 문자열은 과목 객체에만 있다(ADR-053).
- `Progress` 스키마를 바꾸면 `version`을 올리고, 마이그레이션은 `storage.ts` 한 곳에 한 단계씩 이어 붙인다(ARCHITECTURE 「데이터 모델」).
- 난수는 인자로 받는다. 화면이나 라이브러리 안쪽에서 `Math.random`을 직접 부르는 지점을 흩지 마라(ARCHITECTURE 「문항과 보기의 순서」).

규칙을 한 곳에 모아 둔 모듈이다. 화면이 같은 계산을 따로 하지 않는다.

| 모듈 | 무엇 | 근거 |
|---|---|---|
| `shuffle.ts` | 문항·보기 섞기. 보기를 섞으면 `answerIndex`를 옮긴 새 `Question`을 돌려준다. 예/아니요 문항은 그대로 돌려준다 | ARCHITECTURE 「문항과 보기의 순서」, ADR-011·ADR-054 |
| `grading.ts` | 두 형식의 채점 `isCorrect`와 버튼 문구 `choiceLabels`. 예/아니요는 0 = 예, 1 = 아니요이고, 이 대응을 아는 곳은 이 파일 하나다 | ADR-054 |
| `navigation.ts` | 앞뒤 주제 `adjacentTopics` | ARCHITECTURE 「주제 간 이동」 |
| `random-quiz.ts` | 랜덤 세트의 문항 수 허용값과 파서 | ARCHITECTURE 「전체 범위 랜덤 세트」, ADR-018 |
| `search.ts` | 검색 매칭·순위·본문 히트 가르기 | ARCHITECTURE 「개념·주제 검색」, ADR-013·ADR-024 |
| `concept-groups.ts` | `parentId` 검사(`hierarchyProblems`)와 무리 나누기(`groupConcepts`) | ARCHITECTURE 「데이터 모델」, ADR-041 |
| `keyword-quiz.ts` | 키워드 퀴즈의 문항·플래시카드 만들기와 로고 연속 탭 판정 | ARCHITECTURE 「헤더는 과목 안에서 같다」, ADR-040 |
| `keyword-crypto.ts` | 키워드 암호문 복호화. 테스트는 `@vitest-environment node`(jsdom에 `crypto.subtle`이 없다) | ARCHITECTURE 「테스트 경계」, ADR-040 |
| `svg-bounds.ts` | 도식 넘침 검사 | ARCHITECTURE 「테스트 경계」, UI_GUIDE 「도식」 |
| `paragraph-blocks.ts` | 문단 배열을 문단·목록으로 나누기 | ADR-046·ADR-050 |
| `glossary.ts` | 약어 툴팁을 달 첫 등장 판정 | ADR-037·ADR-044 |
