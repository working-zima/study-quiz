# Step 4: verbatim-guard

## 배경

앱에 두 번째 과목 **네트워크**를 더하는 phase 69의 다섯째 step이다. 네트워크 과목의 출처는 강의 슬라이드, 표준 문서, 기술면접 Q&A다(사용자 결정 2026-10-26).
강의와 면접은 외부 자료라 **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 특히 면접 답은 완성된 문장이라 한 문장만 옮겨도 원문이 된다.

AWS 과목에는 이것을 기계로 보는 하한선 `scripts/check-verbatim.mjs`가 있다 — 원본 추출본과 개념 본문을 공백·문장부호를 지우고 견주어 32자 이상 연속으로
같은 구간을 잡는다(ADR-009 임계값, ADR-025 범위). 지금은 AWS 원본(`docs/source/concepts-raw.md`)과 AWS 개념만 본다.

앞 step이 만든 것:

- step 0: `docs/source/network/raw/lecture.md`(강의 추출본)·`docs/source/network/raw/interview.md`(면접 추출본). 둘 다 gitignore라 clone한 환경에는 없다.
- step 3: 빈 네트워크 과목 `src/data/network/`(`topics.json`·`questions.json`은 빈 배열). 문항은 `format`을 항상 가진다.

**이 step은 `check-verbatim.mjs`가 네트워크 과목도 검사하게 한다.** 검사 핵심을 함수로 떼어 테스트를 붙이고, `--subject network`로 네트워크 원본 둘과
네트워크 데이터를 대조한다. AWS 쪽 동작과 출력은 바꾸지 않는다. step 6·7은 이 명령을 AC로 돌린다.

## 읽어야 할 파일

- `scripts/check-verbatim.mjs` — 전부. 머리 주석의 규칙(32자, 한글 없는 겹침은 넘기고 건수를 알린다, 원본이 없으면 건너뜀 exit 0)
- `scripts/CLAUDE.md`
- `scripts/encrypt-keywords.mjs`와 `scripts/encrypt-keywords.test.mjs` — 스크립트에서 함수를 export하고 Vitest로 시험하는 선례(`// @vitest-environment node`,
  지어낸 픽스처를 쓰고 실제 원문을 옮기지 않는다)
- `docs/ADR.md`의 **ADR-009**, **ADR-025**
- `src/data/network/index.ts`, `docs/source/network/CLAUDE.md`

## 작업

### 1. 테스트를 먼저 — `scripts/check-verbatim.test.mjs`

**테스트를 먼저 쓰고, 실패하는 것을 확인한 뒤** 구현한다. 픽스처는 **지어낸 문장**으로 쓴다. 실제 강의·면접·AWS 원본 문장을 옮기지 마라(ADR-009).

`findVerbatimRuns`:

1. 원본의 한국어 문장 40자를 그대로 담은 단위 하나 → `hits`에 그 단위의 `id`·`field`와 늘린 구간(40자)이 하나.
2. 겹침이 31자뿐이면 → `hits`도 `skipped`도 비어 있다(임계값 32).
3. 원본과 공백·문장부호·`**` 표지만 다르고 글자는 같은 40자 → 여전히 `hits`(정규화).
4. 겹친 구간에 한글이 없으면(영문·숫자 나열 40자) → `skipped`에 들어가고 `hits`는 비어 있다(ADR-025).
5. 원본이 둘이고 겹침이 둘째 원본에만 있으면 → `hits`. 두 원본의 끝과 처음을 이어 붙여야만 생기는 구간은 걸리지 않는다(원본마다 따로 창을 만든다).

`collectUnits`:

6. AWS 과목은 개념의 `summary`·`paragraphs[i]`만 단위로 낸다(ADR-025 그대로). 문항은 보지 않는다.
7. 네트워크 과목은 개념의 `summary`·`paragraphs[i]`에 더해 문항의 `prompt`·`explanation`도 단위로 낸다. 단위의 `id`는 개념 id 또는 문항 id다.
   두 과목 모두 `name`은 내지 않는다.

### 2. 구현 — `scripts/check-verbatim.mjs`

```js
export function findVerbatimRuns(sourceTexts, units, minRun = 32)
// sourceTexts: string[] — 원본 글. 원본마다 정규화해 창을 따로 모은다
// units: { id, field, text }[]
// 반환: { hits: { id, field, run }[], skipped: { id, field, run }[] }

export function collectUnits(subjectId, topics, questions)
// 'aws' → 개념 summary·paragraphs / 'network' → 그것에 더해 문항 prompt·explanation
```

- 정규화, 32자 창, 걸린 구간을 끝까지 늘리기, 한글 판정은 **지금 코드 그대로** 함수 안으로 옮긴다. 판정 규칙을 바꾸지 마라.
- 명령줄: `node scripts/check-verbatim.mjs [--subject aws|network] [원본 경로 ...]`
  - `--subject`가 없으면 `aws`다. **지금의 `node scripts/check-verbatim.mjs`와 `node scripts/check-verbatim.mjs <원본 경로>`가 그대로 동작해야 한다.**
  - 기본 원본 — `aws`: `docs/source/concepts-raw.md`. `network`: `docs/source/network/raw/lecture.md`, `docs/source/network/raw/interview.md`.
  - 데이터 — `src/data/<과목>/topics.json`, `src/data/<과목>/questions.json`.
  - 원본이 하나도 없으면 지금처럼 건너뜀(exit 0)과 그 이유를 출력한다. 일부만 있으면 있는 것으로 검사하고 없는 것의 경로를 한 줄로 알린다.
  - 결과 출력은 지금 형식을 따른다. 끝 줄에 검사한 과목, 원본 수, 단위 수를 적는다(예: `✓ 전사 이상 없음 — network: 원본 2개, 단위 0개`).
  - 함수를 import해도 검사가 돌지 않도록, 직접 실행했을 때만 명령줄 처리를 한다.
- 머리 주석: 네트워크 과목을 더한 것, 네트워크는 문항의 문제문·해설도 보는 이유(면접 답이 완성된 문장이라 해설로 옮겨지기 쉽다), 사용법. 임계값을 바꾸지 말라는 문장은 그대로 둔다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node scripts/check-verbatim.mjs; echo "aws exit $?"
node scripts/check-verbatim.mjs --subject network; echo "network exit $?"
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. 네트워크는 단위 0개로 통과해야 한다(내용이 아직 없다).
2. **AWS 쪽 동작이 같은지**: 이 step 전의 `git stash`나 `git show HEAD:scripts/check-verbatim.mjs`로 옛 스크립트를 임시 파일로 꺼내 같은 인자로 돌리고, 새 스크립트의 출력과
   종료 코드를 비교한다(끝 줄에 더한 과목·원본 수·단위 수 말고는 같아야 한다). 이 환경에 `docs/source/concepts-raw.md`가 없으면 둘 다 건너뜀이 나와야 한다 — 그 사실을 summary에 적는다.
3. **네트워크 쪽이 실제로 잡는지**: `raw/lecture.md`의 한국어 문장 하나(40자 이상)를 임시 파일에 담고, 그 문장을 문단으로 가진 가짜 개념이 든 임시 `topics.json`을 만들 수 없으므로
   대신 `node -e`로 `collectUnits('network', 가짜주제, 가짜문항)`과 `findVerbatimRuns([raw 글], 단위)`를 불러 걸리는지 본다. 가짜 데이터는 저장소에 남기지 않는다.
4. `git status`로 바뀐 파일이 `scripts/check-verbatim.mjs`, `scripts/check-verbatim.test.mjs`와 phase 메타데이터뿐인지 확인한다.
5. `phases/69-network-basics/index.json`의 step 4를 갱신한다.
   - 성공 → `"summary"`에 두 함수의 시그니처, 명령줄 사용법, 과목별 단위(aws: 개념 요약·문단 / network: 그것과 문항 문제문·해설), 2·3번 확인 결과, 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **임계값 32자를 바꾸지 마라.** 이유: ADR-009의 실측값이고 코드 주석과 ADR이 함께 그 값을 적고 있다.
- **AWS 과목의 검사 대상(개념 요약·문단)을 넓히거나 좁히지 마라.** 이유: ADR-025의 결정이다. 네트워크에만 문항을 더한다.
- **이 검사를 `npm test`·`npm run build`에 엮지 마라.** 이유: 원본이 gitignore라 clone한 환경에는 없다. 손으로 돌리는 검사다(머리 주석).
- **테스트 픽스처에 실제 강의·면접·AWS 원본 문장을 옮기지 마라.** 이유: 테스트 파일은 커밋된다(ADR-009).
- `src/`·`docs/`를 고치지 마라. 이유: 이 step은 스크립트만 다룬다. `scripts/CLAUDE.md`의 표는 step 5가 고친다.
- 기존 테스트를 깨뜨리지 마라.
