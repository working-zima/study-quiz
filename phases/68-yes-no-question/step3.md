# Step 3: docs

## 배경

phase 68은 문항 형식에 **예/아니요**를 더했다. 지금까지는 모든 문항이 4지선다 단일정답이었다(ADR-005). 코드는 step 0~2에서 끝났다.

- step 0: `src/types/content.ts`의 `Question = ChoiceQuestion | YesNoQuestion`. `ChoiceQuestion`은 `format?: 'choice'`(없으면 4지선다)·`choices`(넷)·`answerIndex`,
  `YesNoQuestion`은 `format: 'yes-no'`·`answer: boolean`(예가 정답이면 true). `src/lib/grading.ts`의 `isCorrect`가 두 형식을 채점하고(예/아니요는 0 = 예, 1 = 아니요)
  `choiceLabels`가 버튼 문구를 준다. `src/lib/shuffle.ts`는 예/아니요 문항을 섞지 않고 `rng`도 부르지 않는다. `src/data/aws/index.ts`의 `questions`는 `ChoiceQuestion[]`.
- step 1: `QuizRunner`에서 예/아니요는 「예」「아니요」 두 버튼을 가로로 나란히(`grid grid-cols-2 gap-3`, 글자 가운데 정렬). 그 밖의 동작은 4지선다와 같다.
- step 2: `src/data/index.test.ts`의 `yesNoProblems` — 모든 과목의 예/아니요 문항에 세 규칙(물음표로 끝남, 「항상」「절대」 없음, 예·아니요 대략 반반).

정확한 내용은 `phases/68-yes-no-question/index.json`의 step 0~2 `summary`와 코드에서 확인한다. **이 step은 문서만 고친다.**

## 읽어야 할 파일

- `docs/CLAUDE.md`
- `docs/ADR.md`의 ADR-005·ADR-011·ADR-053(형식의 본보기 — 제목에 개정 대상을 괄호로 적는 방식, 「사용자 결정」「검토한 대안」「트레이드오프」)
- `docs/PRD.md` 전체
- `docs/ARCHITECTURE.md`의 「데이터 모델」「문항과 보기의 순서」「확인 문제 화면의 공유 구조」「테스트 경계」
- `docs/UI_GUIDE.md`의 「보기 버튼 (확인 문제)」 절
- `src/lib/CLAUDE.md`·`src/data/CLAUDE.md`·`src/components/CLAUDE.md`
- step 0~2가 고친 코드: `src/types/content.ts`, `src/lib/grading.ts`, `src/lib/shuffle.ts`, `src/components/QuizRunner.tsx`, `src/data/index.test.ts`

## 작업

### 1. ADR-054 — `docs/ADR.md` 맨 끝

제목: `### ADR-054: 문항 형식에 예/아니요를 더하고, 개념의 특성으로 형식을 고른다 (ADR-005 개정)`

담을 것(문장은 직접 쓰되 아래 사실을 빠뜨리지 않는다):

- **결정**: 문항 형식은 4지선다와 예/아니요 둘이다. 둘 다 정답은 하나다. 주관식(단답형·설명형)은 만들지 않는다. 타입·채점·섞기·화면의 모양은 위 「배경」 그대로(타입 이름, 0 = 예, 섞지 않음, 가로 두 버튼).
- **형식을 고르는 기준** — 표로:

  | 개념의 특성 | 형식 |
  |---|---|
  | 잘못 알기 쉽다 | 예/아니요. 흔한 오해 하나를 겨냥한다 |
  | 비슷한 개념이 있다 | 4지선다. 오답은 헷갈리는 짝(같은 범주) |
  | 사용 조건·목적이 중요하다 | 형식이 아니라 문제문의 모양(상황형)이다. 고를 대안이 여럿이면 4지선다, 판단이 하나면 예/아니요 |
  | 명칭·정의가 중요하다 | 4지선다 「정의 → 이름」(단답형 대신) |
  | 요소 사이 관계가 중요하다 | 관계는 도식이 가르치고, 문항은 「왜·다음 단계」 4지선다나 「A 때문에 B인가요?」 예/아니요로 확인한다(설명형 대신) |

  판단이 애매하면: 같은 범주에서 그럴듯한 오답 셋을 쓸 수 있으면 4지선다, 아니면 예/아니요.
- **예/아니요를 쓰는 규칙**: 주장 하나만 묻는다. 이중 부정을 쓰지 않는다. 「항상」「절대」처럼 답을 흘리는 낱말을 쓰지 않는다. 예·아니요가 과목 안에서 대략 반반이다.
  아니요 문항의 해설은 무엇이 틀렸는지에서 그치지 않고 맞는 사실을 가르친다. 버튼 순서를 섞지 않는다(보기가 둘이라 위치가 답을 흘리지 않고, 섞으면 잘못 누르는 일만 는다).
  버튼 문구가 「예」「아니요」인 것은 문제문이 예나 아니요로 대답하는 질문(「~인가요?」)이기 때문이다.
- **기계로 재는 것**: `src/data/index.test.ts`의 `yesNoProblems`가 모든 과목에 건다 — 물음표로 끝남, 「항상」「절대」 없음(부분 문자열 검사라 다른 뜻으로 쓴 낱말도 걸린다. 걸리면 바꿔 쓴다),
  `|예 − 아니요| ≤ max(2, ⌈전체 × 0.2⌉)`. 4지선다에는 걸지 않는다. 주장 하나·이중 부정·해설은 사람이 검수한다.
- **사용자 결정(2026-10-26)**: 사용자가 「보기 넷이 애매한 문제는 예, 아니요로 해도 될 것 같다」고 했고, 개념 특성별 문항 형식 표(명칭·정의 → 단답형, 잘못 알기 쉬움 → O/X,
  비슷한 개념 → 객관식, 사용 조건·목적 → 상황형, 요소 관계 → 설명형)를 주며 주관식은 만들지 않는다고 했다. 위 기준표는 그 표를 이 앱에 맞게 줄인 것이다.
  이 phase는 형식의 틀만 만들고 **AWS 746문항은 4지선다 그대로** 두는 것을 사용자가 골랐다. 예/아니요 문항을 처음 쓰는 것은 네트워크 과목이다.
- **바뀌지 않는 것**: `Progress`의 모양과 `version: 3`(`answers`는 문항 id → 정오라 형식과 무관), `isCorrect(question, choiceIndex)`의 시그니처와 인덱스 기반 `selections`,
  4지선다 보기를 섞는 규칙(ADR-011), AWS `questions.json`(`format` 필드 없음 = 4지선다).
- **아직 하지 않은 것**: AWS 문항 가운데 예/아니요가 맞는 것(예: `q043`·`q488`·`q455`. `q443`은 4지선다가 맞다)을 바꾸는 일은 따로 phase로 한다. 그 phase에서 함께 할 것 —
  `src/data/aws/index.ts`의 `questions`가 `ChoiceQuestion[]`로 캐스팅돼 있으므로 타입을 `Question[]`로 넓히고 `src/data/aws/data.test.ts`를 두 형식에 맞춘다,
  AWS JSON만 읽는 감사 스크립트(`scripts/`의 content-audit·explanation-audit·field-diff·notation-diff)를 예/아니요 필드에 맞춘다.
- **검토한 대안**:
  - *주관식(단답형·설명형)*: 사용자가 뺐다. 그 대가로 명칭은 떠올리기가 아니라 알아보기로만 점검한다.
  - *예/아니요를 4지선다의 보기 두 칸으로 표현(`choices: ['예', '아니요']`)*: `choices`는 네 칸이고, 「버튼 순서를 섞지 않는다」를 데이터가 표현할 수 없다. 형식은 `format`으로 가른다.
  - *예/아니요 전용 화면 컴포넌트*: 정답 재탭·복습·개념 펼치기·이전 문항이 `QuizRunner` 하나에 있어야 두 형식이 같은 규칙을 쓴다. 형식 분기는 버튼 묶음의 배치와 글자 정렬에만 있다.
- **트레이드오프**: 예/아니요는 찍어도 절반은 맞는다. 진행률의 「맞힘」은 형식을 가리지 않고 더하므로 예/아니요가 많은 주제는 점검 결과가 후하게 보일 수 있다.
  아니요 문항은 해설이 맞는 사실까지 가르쳐야 해서 쓰는 품이 더 든다.

### 2. PRD — `docs/PRD.md`

- 「원본」의 `dump-gaps` 항목: 문항을 가져오지 않는 이유가 복수정답이라는 점은 그대로이고, 근거를 「ADR-005의 4지선다 단일정답」에서 「문항은 정답이 하나다(ADR-005·ADR-054)」로 바꾼다.
- 「핵심 기능」 3 확인 문제: 「4지선다 단일정답」 → 4지선다 또는 예/아니요, 정답은 하나. 문항 순서와 4지선다의 보기 순서가 섞이고, 예/아니요 버튼은 「예」「아니요」 순서 그대로. 근거 ADR-054.
- 「MVP 제외 사항」: 「복수정답 문제. 이유: 4지선다 단일정답으로 고정한다.」를 형식이 4지선다와 예/아니요 둘이고 모두 정답이 하나라는 이유로 고친다. 「주관식(단답형·설명형)」 항목을 더한다 — 이유와 근거 ADR-054.

### 3. ARCHITECTURE — `docs/ARCHITECTURE.md`

- 「데이터 모델」의 `interface Question` 블록을 step 0의 세 타입(공통 필드, `ChoiceQuestion`, `YesNoQuestion`, `type Question`)으로 바꾼다. `format`이 없으면 4지선다라는 것과
  AWS의 `questions`가 `ChoiceQuestion[]`인 이유를 한 줄씩.
- 「문항과 보기의 순서」: 보기 섞기는 4지선다에만 걸리고 예/아니요는 그대로 돌려준다(난수를 쓰지 않는다)는 것을 더한다. 「`Question` 타입도 `grading.ts`도 바뀌지 않는다」는 문장은
  섞기가 타입·채점을 바꾸지 않는다는 뜻이 남도록 고친다(지금은 `Question`이 합집합 타입이고 `grading.ts`가 두 형식을 채점하므로 문장 그대로는 틀린다).
- 「확인 문제 화면의 공유 구조」: 「보기 4개」 → 보기(4지선다 넷, 예/아니요 둘). 예/아니요도 같은 `QuizRunner`가 그리고 형식 분기는 버튼 묶음의 배치뿐이라는 것.
- 「테스트 경계」: `src/data/index.ts` 행에 예/아니요 불변식(ADR-054)을 더한다. `src/data/aws/*.json` 행은 그대로 둔다(AWS는 4지선다뿐).

### 4. UI_GUIDE — `docs/UI_GUIDE.md`의 「보기 버튼 (확인 문제)」

예/아니요 버튼을 더한다 — 둘을 가로로 나란히(`grid grid-cols-2 gap-3`), 왼쪽 「예」·오른쪽 「아니요」, 버튼 하나의 클래스는 보기 버튼과 같고 글자만 가운데 정렬,
순서는 섞지 않는다, 정답 재탭으로 넘어가기와 비활성 규칙은 보기 버튼과 같다. 이유(보기가 둘뿐임이 보이게, 짧은 낱말이 왼쪽에 붙으면 나란한 모양이 무너짐)를 한 줄로.
절 이름을 바꾸지 않는다 — 다른 절이 「보기 버튼」 절을 이름으로 가리킨다.

### 5. 디렉토리 `CLAUDE.md`

- `src/lib/CLAUDE.md`: 모듈 표의 `shuffle.ts` 행에 「예/아니요 문항은 그대로 돌려준다」를 더한다. `grading.ts` 행을 더한다 — 두 형식의 채점 `isCorrect`와 버튼 문구 `choiceLabels`,
  예/아니요는 0 = 예, 이 대응을 아는 곳은 이 파일 하나, 근거 ADR-054.
- `src/data/CLAUDE.md`: 「과목을 더할 때」의 불변식 목록에 예/아니요 규칙 셋(ADR-054)을 더한다. 「AWS 과목 데이터」에 AWS 문항은 모두 4지선다이고 `questions`가 `ChoiceQuestion[]`라는 것,
  AWS에 예/아니요를 넣는 phase는 이 타입부터 바꾼다는 것을 한 줄로.
- `src/components/CLAUDE.md`: `QuizRunner` 행의 먼저 읽을 곳에 ADR-054를 더한다.

## Acceptance Criteria

```bash
grep -c "ADR-054" docs/ADR.md docs/PRD.md docs/ARCHITECTURE.md docs/UI_GUIDE.md src/lib/CLAUDE.md src/data/CLAUDE.md src/components/CLAUDE.md
grep -n "4지선다 단일정답" docs/PRD.md docs/ARCHITECTURE.md docs/UI_GUIDE.md
grep -n "Question\` 타입도 \`grading.ts\`도 바뀌지 않는다" docs/ARCHITECTURE.md
npm run build
npm test
```

## 검증 절차

1. AC를 실행한다. 첫 줄은 일곱 파일이 모두 1 이상이어야 한다. 둘째·셋째 줄은 **아무것도 출력하지 않아야** 한다(ADR.md의 ADR-005 본문은 기록이므로 검사 대상이 아니다).
2. ADR-054에 적은 사실마다 근거를 댈 수 있는지 확인한다 — 위 「배경」·이 문서의 작업 1, step 0~2의 `summary`, 코드. 근거가 없는 문장은 지운다.
3. `git status`로 바뀐 파일이 위 작업에 나온 문서 일곱 개뿐인지 확인한다(phase 메타데이터 제외). 코드와 데이터는 바뀌지 않아야 한다.
4. `phases/68-yes-no-question/index.json`의 step 3을 갱신한다. 성공이면 `summary`에 고친 문서와 절, ADR-054의 하위 항목 이름을 적는다.

## 금지사항

- **ADR-005의 본문을 고치지 마라.** 이유: ADR은 당시의 기록이다. 이 저장소는 개정을 새 ADR의 제목(「(ADR-005 개정)」)으로 남기고, 앞선 ADR에 표시를 더하지 않는다(ADR-008이 ADR-006을 개정한 방식).
- **코드·데이터·테스트를 고치지 마라.** 이유: 이 step은 문서만 다룬다. 문서와 코드가 어긋나면 코드가 아니라 문서를 코드에 맞춘다. 코드가 틀렸다고 판단되면 고치지 말고 `summary`에 적는다.
- **AWS 문항 가운데 예/아니요로 바꿀 목록을 만들거나 늘리지 마라.** 이유: AWS 문항 전환은 따로 phase다. ADR-054에는 위에 적은 예시 셋(과 4지선다가 맞는 `q443`)만 쓴다.
- 고치라고 한 절 밖의 문장을 다듬지 마라. 이유: 변경은 이 phase로 거슬러 올라갈 수 있어야 한다.
- 기존 테스트를 깨뜨리지 마라.
