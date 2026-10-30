# Step 2: verbatim-guard

## 배경

phase 100은 앱에 세 번째 과목 **Azure AZ-900**을 더한다. 결정과 공통 규칙은 `phases/100-azure-cloud-concepts/guide.md`에 있다.
**이 step은 전사 검사 `scripts/check-verbatim.mjs`에 `--subject azure`를 더한다.** 개념 글과 문항이 원본 문장을 그대로 옮기지 않았는지 보는 하한선이다(ADR-009·ADR-025).

Azure의 원본은 셋이고 모두 `docs/source/azure/raw/`(gitignore)에 있다.

- 용어집 — `raw/glossary/`의 `.md` 넷. **한국어**라 그대로 옮기기 가장 쉽다.
- 덤프 — `raw/dump/dump.md`. 영문이지만 문항·해설이 완성된 문장이다.
- 공식 문서 — `raw/official/`의 `.md` 여럿. 한국어판(`ko-…`)은 기계 번역 문장이라 옮기기 쉽고, 개수가 phase마다 늘어난다(주제를 만드는 step이 받아 둔다).

그래서 Azure의 기본 원본에는 **폴더**가 들어간다 — 폴더 안의 `.md` 파일 하나하나를 원본 하나로 센다. 네트워크처럼 문항의 `prompt`·`explanation`도 검사 단위에 넣는다.

## 읽어야 할 파일

- `phases/100-azure-cloud-concepts/guide.md` — 「배경」·「출처」
- `scripts/check-verbatim.mjs` 전체, `scripts/check-verbatim.test.mjs` 전체
- `scripts/CLAUDE.md`, `docs/source/azure/CLAUDE.md`(step 0)
- `docs/ADR.md`의 **ADR-009**(임계값 32자), **ADR-025**(검사 대상과 한글 판정), **ADR-055**의 「전사 검사」
- `phases/69-network-basics/step4.md` — 네트워크를 더한 같은 일의 본보기

## 작업

### 1. 테스트를 먼저 — `scripts/check-verbatim.test.mjs`

**테스트를 먼저 쓰고, 실패하는 것을 확인한 뒤** 구현한다. 기존 테스트 8개는 고치지 않는다. 픽스처는 모두 지어낸 문장으로 쓴다(원본 문장을 테스트에 넣지 마라).

- `collectUnits('azure', topics, questions)` — 개념의 `summary`·`paragraphs[i]`에 더해 문항의 `prompt`·`explanation`을 모은다. `name`은 넣지 않는다.
- **원본 경로 펼치기** — export하는 새 함수(예: `expandSourcePaths(paths)`)가 경로 목록을 받아, 파일은 그대로 두고 **폴더는 그 안의 `.md` 파일들을 이름순으로** 펼친다(하위 폴더는 보지 않는다).
  없는 경로는 따로 모아 돌려준다(예: `{ files, missing }`). 임시 폴더(`os.tmpdir()` 아래 `mkdtempSync`)에 지어낸 `.md` 둘과 `.txt` 하나, 하위 폴더 하나를 만들어
  `.md` 둘만 이름순으로 나오는지, 없는 폴더·없는 파일이 `missing`에 들어가는지 본다. 끝나면 임시 폴더를 지운다.

### 2. `scripts/check-verbatim.mjs`

- `DEFAULT_SOURCES.azure` = `docs/source/azure/raw/glossary/`, `docs/source/azure/raw/dump/dump.md`, `docs/source/azure/raw/official/`. 폴더는 끝에 `/`를 붙여 적는다.
- 명령줄에서 원본 경로를 줄 때도 폴더를 줄 수 있게 같은 펼치기를 쓴다. aws·network의 동작(기본 원본, 경로 인자, 건너뜀·일부 없음 문구, 종료 코드)은 **바뀌지 않아야 한다.**
- 원본이 하나도 없으면(폴더가 없거나 비었고 파일도 없으면) 지금처럼 건너뜀 exit 0, 일부만 없으면 지금처럼 「원본 일부가 없어 있는 것만 검사한다」 한 줄 뒤 검사.
- `collectUnits`가 `azure`에서도 문항을 넣는다. 조건을 `subjectId === 'network'`에서 「aws가 아니면」으로 바꾸지 말고 **과목을 이름으로 적는다**(`network`·`azure`) — 새 과목이 생길 때 그 과목의 원본을 보고 정하게 한다.
- 잘못된 과목 메시지와 사용법 줄을 `aws|network|azure`로 고친다.
- 머리 주석: 과목별 원본 목록에 azure를 더하고(용어집·덤프·공식 문서 추출본 — 폴더는 그 안의 `.md` 하나하나가 원본), azure가 문항도 보는 까닭(덤프 해설과 용어집 설명이 완성된 문장이고,
  한국어판 공식 문서가 기계 번역이라 그대로 옮기기 쉽다)을 적는다. 임계값 문장(32자, ADR-009)은 그대로 둔다.
- 끝 줄의 꼴(「✓ 전사 이상 없음 — azure: 원본 N개, 단위 M개」)은 그대로다. N은 펼친 뒤의 파일 수다.

### 3. 확인

- **AWS·네트워크 동작이 그대로인지**: 고치기 전 스크립트(`git show HEAD:scripts/check-verbatim.mjs`를 임시 파일로)와 고친 스크립트를 `--subject network`·인자 없음·`--subject aws`로 각각 돌려 출력과 종료 코드가 같은지 본다
  (네트워크 원본이 이 worktree에 없으면 둘 다 같은 건너뜀 문구여야 한다).
- **Azure가 실제로 잡는지**: `raw/glossary/1-cloud-concepts.md`에서 한국어 설명 한 줄(공백·문장부호를 빼고 32자 이상)과 `raw/official/`의 한국어판 문서에서 한 줄을 골라,
  `node -e`로 `collectUnits('azure', …)`·`findVerbatimRuns(…)`에 가짜 개념 문단과 가짜 문항 해설로 넣어 둘 다 hits로 잡히는지 본다. 가짜 데이터를 파일에 쓰지 않는다.
- `node scripts/check-verbatim.mjs --subject azure` → 「✓ 전사 이상 없음 — azure: 원본 N개, 단위 0개」, N은 용어집 4 + 덤프 1 + `raw/official/`의 `.md` 수.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node scripts/check-verbatim.mjs --subject azure
node scripts/check-verbatim.mjs --subject network
node scripts/check-verbatim.mjs
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. `--subject azure`가 원본 5개 이상을 대조했다고 나와야 한다(`raw/`가 없어 건너뜀이면 blocked).
2. 위 「3. 확인」을 모두 한다.
3. `git status`로 바뀐 파일이 `scripts/check-verbatim.mjs`·`scripts/check-verbatim.test.mjs`와 phase 메타데이터뿐인지 확인한다.
4. `phases/100-azure-cloud-concepts/index.json`의 step 2를 갱신한다.
   - 성공 → `"summary"`에 새 함수와 바뀐 동작, azure 기본 원본, 확인 결과(AWS·네트워크 출력 비교, 가짜 문단·해설이 잡힌 글자 수), AC의 끝 줄 셋, 새 테스트 수와 전체 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `raw/`가 없어 확인할 수 없으면 → `"status": "blocked"`.

## 금지사항

- **임계값 32를 바꾸지 마라.** 이유: ADR-009가 정한 값이고 근거가 문서에 있다.
- **한글 판정(한글 없는 겹침은 넘김, ADR-025)을 바꾸지 마라.** 이유: 영문 덤프·공식 문서와 겹치는 서비스 이름 나열은 베낀 문장이 아니다.
- **aws·network의 기본 원본과 검사 단위를 바꾸지 마라.** 이유: 이 step은 과목 하나를 더할 뿐이다.
- **이 검사를 `npm test`·`npm run build`에 엮지 마라.** 이유: 원본이 gitignore라 clone한 환경에는 없다(ADR-009).
- **원본 문장을 테스트 픽스처나 커밋되는 파일에 넣지 마라.** 이유: ADR-009. 확인은 `node -e`로 메모리에서만 한다.
- `src/`와 다른 스크립트를 고치지 마라. 기존 테스트를 깨뜨리지 마라.
