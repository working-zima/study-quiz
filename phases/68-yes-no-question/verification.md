# phase 68 검증 보고

확인한 날: 2026-10-27. 설계 커밋 5385686, 마지막 step 커밋 cbcb1a8(`feat-68-yes-no-question`, origin/develop c4e96cd에서 분기).
step 0~1 / 2~3 두 덩어리로 끊어 돌리고 덩어리마다 검토했다.

## step별 결과

| step | 결과 | 테스트 |
|---|---|---|
| 0 question-types | `Question = ChoiceQuestion \| YesNoQuestion`(공통 필드는 `QuestionBase`), `isCorrect`가 두 형식 채점(0 = 예), `choiceLabels`, `shuffleChoices`는 예/아니요를 그대로 돌려줌. AWS `questions`는 `ChoiceQuestion[]` | 2754(+5) |
| 1 quiz-runner | `QuizRunner`의 형식 분기는 `choiceGroupClass`(`grid grid-cols-2 gap-3` / `space-y-3`)·`choiceAlignClass`(`text-center` / `text-left`) 두 값. 가짜 과목 `yn`으로 과목 경계 테스트 | 2763(+9) |
| 2 yes-no-invariants | `src/data/index.test.ts`의 `yesNoProblems` — 물음표로 끝남, 「항상」「절대」 없음, `\|예 − 아니요\| ≤ max(2, ⌈전체 × 0.2⌉)`. 픽스처 8개 + 과목마다 1개 | 2772(+9) |
| 3 docs | ADR-054(ADR-005 개정), PRD·ARCHITECTURE·UI_GUIDE, `src/lib`·`src/data`·`src/components`의 `CLAUDE.md` | 2772 |

## 설계와 달라진 것

- **step 0이 `shuffleQuestions`에도 오버로드를 더했다.** 지시에는 `shuffleChoices`만 있었다. 기존 테스트가 섞은 결과의 `choices`를 캐스트 없이 읽어서
  `ChoiceQuestion[]`을 넣으면 `ChoiceQuestion[]`이 나오게 한 것이다. 동작은 같아 받아들였다.
- **step 2가 지시보다 테스트를 둘 더 썼다.** 20문항이면 12 : 8은 통과하고 13 : 7은 보고한다(허용 오차의 비례 쪽), 4지선다는 비율의 문항 수에 세지 않는다.
  둘 다 지시한 식의 경계를 확인하는 것이라 그대로 두었다.

## 다시 돌린 검증 (phase가 끝난 뒤)

- `npm run build`·`npm run lint` 통과, `npm test` 107파일·2772개 통과.
- step 3 AC — `ADR-054`가 일곱 파일에 모두 있다(ADR 1, PRD 4, ARCHITECTURE 4, UI_GUIDE 1, lib 2, data 2, components 1).
  「4지선다 단일정답」은 PRD·ARCHITECTURE·UI_GUIDE에 0건, 「`Question` 타입도 `grading.ts`도 바뀌지 않는다」는 ARCHITECTURE에 0건.
- `docs/ADR.md`는 덧붙이기만 했다(지운 줄 0). ADR-005 본문은 그대로다.
- AWS 데이터 JSON(`src/data/aws/**/*.json`)은 phase 전체에서 바뀌지 않았다.
- ADR-054가 끌어 쓴 근거를 대조했다. 「주장 하나만」은 ADR-030 기준 2(문항 하나는 개념 하나만), 「같은 범주의 오답」은 기준 4,
  「아니요 문항의 해설은 맞는 사실을 가르친다」의 근거 ADR-026은 해설을 「개념을 가르치는 글」로 정한다. 트레이드오프의 `src/lib/stats.ts`는
  형식을 가리지 않고 `answers[id] === true`를 센다. UI_GUIDE 「예/아니요 버튼」이 따른다고 적은 비활성 규칙(정답 하나만 남김)은 「보기 버튼」 절에 있다.
  모두 근거가 있었다.

## 화면 확인 (Chrome, 개발 서버 `localhost:5268`)

- `#/aws/topic/vpc-networking/quiz` — 1 / 22. 보기 네 개가 세로로(`space-y-3`), 글자는 왼쪽 정렬(`text-left`).
  오답(PrivateLink)을 고르면 그 보기는 빨강, 정답(게이트웨이 엔드포인트)은 초록, 해설과 「복습에 넣기」가 나온다.
  남은 정답 보기를 다시 누르면 2 / 22로 넘어가고, 다음 문항도 같은 네 칸이다.
- 예/아니요 문항은 실데이터에 없으므로 화면에서 볼 수 없다. 두 버튼의 배치·채점·넘어가기는 step 1의 `QuizRunner.test.tsx`와 `App.test.tsx`(가짜 과목 `yn`)가 증거다.
- 콘솔 오류, 320px 폭, 실기기는 이번에 보지 않았다. 4지선다 화면의 클래스와 동작이 phase 67과 같기 때문이다.
