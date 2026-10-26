# Step 0: data-move

## 배경

phase 67은 앱 하나에 과목을 여럿 담는 구조를 만든다. 지금 과목은 AWS 하나뿐이고, 다음 과목(네트워크)의 데이터는 이 phase에서 넣지 않는다 — 구조만 만든다.
과목마다 URL 접두사(`#/aws/...`), 데이터 폴더(`src/data/aws/`), 진행률 저장 키가 따로 있고, 검색·랜덤·복습은 과목 안에서만 돈다.

step은 아홉 개다: 0 데이터 이동 → 1 과목 목록 → 2 라우트 → 3 과목별 진행률 → 4 화면 → 5 컴포넌트 → 6 앱 이름 → 7 문서 → 8 CLAUDE.md 계층.

이 step은 **AWS 데이터를 `src/data/aws/`로 옮기기만 한다. 앱 동작은 하나도 바뀌지 않는다.**

## 읽어야 할 파일

- `docs/ARCHITECTURE.md`의 「디렉토리 구조」「데이터 흐름」「테스트 경계」
- `src/data/index.ts` — 지금 데이터 export(`topics`·`questions`·`visualsByTopicId`)
- `src/data/*.test.ts` 네 개 — 옮길 테스트
- `scripts/check-structure.mjs`·`scripts/sync-baseline.mjs`·`scripts/coverage.mjs` 머리 주석 — 데이터 경로를 하드코딩한 가드레일

## 작업

### 1. 파일을 옮긴다 (`git mv`)

| 지금 | 옮긴 뒤 |
|---|---|
| `src/data/topics.json` | `src/data/aws/topics.json` |
| `src/data/questions.json` | `src/data/aws/questions.json` |
| `src/data/keywords.enc.json` | `src/data/aws/keywords.enc.json` |
| `src/data/visuals/` (11개 파일) | `src/data/aws/visuals/` |
| `src/data/index.ts` | `src/data/aws/index.ts` |
| `src/data/data.test.ts`·`index.test.ts`·`visuals.test.ts`·`keywords-enc.test.ts` | `src/data/aws/` 아래 같은 이름 |

옮긴 뒤 `src/data/` 바로 아래에는 `aws/`만 남는다. **`src/data/index.ts`를 새로 만들지 마라** — step 1이 과목 목록 모듈로 그 자리를 쓴다.

반드시 `git mv`로 옮겨라. `git diff -M --stat HEAD`에서 JSON 파일들이 rename(100% 또는 그에 가깝게)으로 잡혀야 한다. 이유: 내용이 같은 파일을 지우고
새로 만들면 `git log --follow`가 끊겨 데이터의 이력 추적이 어려워진다.

### 2. 옮긴 파일 안의 상대 경로

옮긴 `.ts` 파일이 `src/types/`·`src/lib/`를 가리키던 `'../types/…'`·`'../lib/…'`는 한 단계 깊어진다(`'../../types/…'`·`'../../lib/…'`).
같이 옮긴 JSON·`visuals/`를 가리키는 `'./…'`는 그대로다.

### 3. 데이터를 import하는 곳

모두 새 경로로 바꾼다. 가리키는 대상은 `src/data/aws/index.ts`(또는 그 폴더의 JSON)다.

- `src/components/diagrams/` — `from '../../data'` 101곳 → `from '../../data/aws'`. 도식은 AWS 주제 전용이므로 AWS 데이터를 직접 가리키는 것이 맞다.
- `src/pages/` 9개 화면과 `src/components/QuizRunner.tsx` — `from '../data'` → `from '../data/aws'`. `KeywordQuizPage.tsx`의 `'../data/keywords.enc.json'` → `'../data/aws/keywords.enc.json'`.
- `src/App.test.tsx`의 `'./data'` → `'./data/aws'`, `src/lib/search.test.ts`의 `'../data'` → `'../data/aws'`.

101곳은 `sed` 같은 일괄 치환으로 바꿔라. 이유: 손으로 고치면 빠뜨리기 쉽고, 테스트가 없는 파일의 Edit는 tdd-guard 훅이 막는다(Bash 치환은 막지 않는다).
치환 뒤 아래 검사가 **아무것도 출력하지 않아야** 한다.

```bash
grep -rnE "from '(\.\./)+data'|from '\./data'|'(\.\./)+data/(topics|questions|keywords|visuals)" src
```

### 4. 스크립트의 데이터 경로

아래 11개 스크립트가 `src/data/topics.json`·`src/data/questions.json`·`src/data/keywords.enc.json`·`src/data/data.test.ts`를 문자열로 들고 있다.
`src/data/aws/…`로 바꾼다(주석 안의 경로도 함께).

`check-keywords.mjs` `check-structure.mjs` `check-verbatim.mjs` `concept-index.py` `content-audit.mjs` `coverage.mjs` `encrypt-keywords.mjs`
`explanation-audit.mjs` `field-diff.mjs` `notation-diff.mjs` `sync-baseline.mjs`

- `concept-index.py`는 `ROOT / "src" / "data" / "topics.json"`처럼 경로를 조각으로 잇는다. `"aws"` 조각을 넣는다.
- `field-diff.mjs`·`notation-diff.mjs`는 같은 경로 상수로 `git show <ref>:<path>`도 부르므로, 이동 이전 커밋을 기준으로 주면 실패하게 된다.
  **경로 상수만 바꾸고 그 이상 고치지 마라.** 이유: phase 32·33 전용 도구라 지금 쓰는 사람이 없고, 이전 경로를 함께 찾는 분기는 쓰이지 않을 코드다.
- `.gitignore`의 주석 「암호문(src/data/keywords.enc.json)만 커밋한다」의 경로도 새 경로로 바꾼다.

치환 뒤 아래 검사가 **아무것도 출력하지 않아야** 한다.

```bash
grep -rnE "src/data/(topics|questions|keywords|visuals|index|data\.test)" scripts .gitignore
grep -rn '"src" / "data" / "topics' scripts
```

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node scripts/check-structure.mjs
node scripts/sync-baseline.mjs --dry-run
node scripts/coverage.mjs
node scripts/check-keywords.mjs
```

## 검증 절차

1. AC를 실행한다. 기대 결과:
   - `npm test` — 테스트 파일 103개·테스트 2701개 통과. **개수가 이 step 전과 같아야 한다.** 줄었으면 옮기다 테스트 파일이 빠진 것이다.
   - `check-structure.mjs` — 「✓ 구조 이상 없음」. `sync-baseline.mjs --dry-run` — 「✓ 갱신할 것이 없다」.
   - `coverage.mjs` — 「개념 640개 중 640개 덮임 (100%)」「문항 746개」.
   - `check-keywords.mjs` — 이 worktree에는 평문이 없어 「건너뜀」으로 끝나는 것이 정상이다.
2. 작업 3·4의 grep 검사 셋이 아무것도 출력하지 않는지 확인한다.
3. `git diff -M --stat HEAD`로 JSON·`visuals/`·테스트 파일이 rename으로 잡혔는지, 바뀐 파일이 이 문서가 말한 곳뿐인지 확인한다.
4. `phases/67-subject-split/index.json`의 step 0을 갱신한다. 성공이면 `summary`에 옮긴 파일, 고친 import 수(도식·화면·테스트), 고친 스크립트 수, 테스트 수를 적는다.

## 금지사항

- **데이터 파일의 내용을 바꾸지 마라.** 이유: 이 step은 이동뿐이다. `topics.json`을 재직렬화하면 개념 한 줄 포맷이 깨져 `check-structure.mjs`가 진짜 사고와 구분하지 못한다.
- **`src/data/index.ts`를 남기거나 재수출 파일로 만들지 마라.** 이유: step 1이 그 경로를 과목 목록(`subjects`)으로 쓴다. 지금 AWS 데이터를 재수출해 두면 step 1이 지우면서 import가 또 흔들린다.
- **`docs/`·`CLAUDE.md`의 경로를 고치지 마라.** 이유: step 7·8의 범위다.
- **`phases/` 아래 지난 phase의 도구·문서를 고치지 마라.** 이유: 그 시점의 기록이다. 지금 경로로 고치면 그때 무엇을 돌렸는지가 지워진다.
- **`docs/source/`의 파일을 옮기지 마라.** 이유: AWS 원본은 제자리다. gitignore된 로컬 파일(`concepts-raw.md` 등)이 다른 worktree에만 있어, 옮기면 그쪽 경로가 깨진다.
- 기존 테스트를 깨뜨리지 마라.
