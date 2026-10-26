# Step 8: claude-md

## 배경

phase 67이 앱을 과목 단위로 나눴다(step 0~7, 결정은 `docs/ADR.md`의 ADR-053). 앱 이름은 「Study Quiz」이고 지금 과목은 AWS SAA-C03 하나, 다음은 네트워크다.

루트 `CLAUDE.md`는 지금 AWS 전용 앱을 전제로 쓰여 있고, 원본 데이터 목록처럼 **한 디렉토리에서만 필요한 규칙**까지 모두 들고 있다.
과목이 늘면 루트가 과목마다 더 길어진다. 이 step은 루트를 **앱 전체에 걸리는 것**만 남기고, 디렉토리에서만 필요한 것은 그 디렉토리의 `CLAUDE.md`로 옮긴다.
사용자가 요청한 구조다(2026-10-26).

**새 규칙을 만들지 말고 옮긴다.** 하위 파일에 쓰는 문장은 지금 루트 `CLAUDE.md`에 있거나, `docs/ARCHITECTURE.md`·`docs/UI_GUIDE.md`·`docs/ADR.md`에 이미 있는 것이어야 한다.
문서에 있는 규칙은 길게 옮겨 적지 말고 **한 줄 요약 + 근거 절 이름**(「ARCHITECTURE 「상태 관리」」「ADR-047」처럼)으로 가리킨다.

## 읽어야 할 파일

- 루트 `CLAUDE.md` 전체 — 옮길 원본
- `docs/ARCHITECTURE.md`·`docs/UI_GUIDE.md` 전체, `docs/ADR.md`의 ADR-053(step 7)과 하위 파일이 가리킬 ADR들
- `scripts/execute.py`의 `_load_guardrails` — **루트 `CLAUDE.md`와 `docs/*.md`만** 매 step 프롬프트에 주입한다
- `scripts/hooks/` 네 개의 머리 주석, `.claude/settings.json`
- 각 대상 디렉토리의 파일 목록(`ls`)

## 작업

### 1. 만들 파일

| 파일 | 담을 것 |
|---|---|
| `CLAUDE.md` (루트) | 아래 2절 |
| `docs/CLAUDE.md` | `docs/` 문서 지도(PRD·ARCHITECTURE·ADR·UI_GUIDE가 각각 무엇을 정하는가), `docs/*.md`가 execute.py로 매 step에 주입된다는 사실, `docs/source/` 안내 한 줄 |
| `docs/source/CLAUDE.md` | 지금 루트의 「원본 데이터」 절 **전부**(목록, ADR-039 허용 목록, exam-types의 쓰임, CRITICAL 「사실만 가져오고 문장은 직접 쓴다」). 첫머리에 「이 디렉토리는 **AWS 과목**의 원본이다. 다음 과목의 원본은 `docs/source/<과목>/`에 둔다(ADR-053)」 |
| `src/data/CLAUDE.md` | 과목 폴더 구조(`src/data/<과목>/`, 과목 목록 `index.ts`), 빌드 타임 정적 JSON(루트 CRITICAL을 가리킨다), 과목 불변식(`src/data/index.test.ts`, ADR-053), 데이터 가드레일 스크립트(`scripts/check-structure.mjs` 등 — 각 스크립트 머리 주석을 가리킨다), 도식 문구는 `visuals/`·좌표는 컴포넌트(ADR-037) |
| `src/lib/CLAUDE.md` | React 비의존·DOM 없이 테스트(루트 「아키텍처 규칙」), localStorage에 접근하는 유일한 계층(ARCHITECTURE 「상태 관리」), 진행률 키는 호출하는 쪽이 넘긴다 |
| `src/pages/CLAUDE.md` | 화면 단위(라우트 하나 = 파일 하나), 데이터 기본값은 `useSubject()`·테스트용 props override, 링크는 `/${subject.id}` 접두사, 라우트 표는 ARCHITECTURE 「라우트」 |
| `src/components/CLAUDE.md` | 재사용 UI 컴포넌트, 헤더 규칙(ARCHITECTURE·UI_GUIDE의 헤더 절, ADR-053), 돌아가기·하단 액션 바 등 UI_GUIDE 절 가리키기 |
| `src/components/diagrams/CLAUDE.md` | 도식 규칙 가리키기(UI_GUIDE 「도식」 이하, ADR-037·038·047·048·050), `src/lib/svg-bounds.ts` 넘침 검사(ARCHITECTURE 「테스트 경계」), 도식은 AWS 개념 전용이고 개념 id로 찾는다(registry) |
| `scripts/CLAUDE.md` | `execute.py`(harness 실행기 — 브랜치·주입·커밋 동작, `--max-steps`), `hooks/`의 네 훅이 무엇을 막는가, 데이터 가드레일·감사 스크립트 목록, 지난 phase 전용 도구는 `phases/` 아래 기록이라 고치지 않는다 |

각 하위 파일은 짧게 쓴다 — 대략 15~40줄. 그 디렉토리에서 일하는 사람이 **먼저 알아야 할 것과 어디를 더 읽을지**만 담는다.

### 2. 루트 `CLAUDE.md`

남길 것:

- 제목·소개 — 「Study Quiz」: 과목별로 개념을 읽고 바로 확인 문제로 점검하는 학습용 SPA. 시험 시뮬레이터가 아니라 학습 도구.
  **과목 구조 한 단락**(과목마다 URL 접두사·데이터 폴더·진행률 키가 따로이고, 검색·랜덤·복습은 과목 안에서만 — ADR-053). 지금 과목: AWS SAA-C03.
- 「기술 스택」「배포」 — 그대로(CRITICAL 둘 포함).
- 「Git 전략」 — 그대로(worktree 절·「커밋 전에 지킬 것」 포함). worktree 경로 예시의 로컬 폴더 이름은 바꾸지 않는다.
- 「아키텍처 규칙」 — 앱 전체에 걸리는 CRITICAL 둘(정적 JSON·fetch 금지, localStorage만)과 「타입은 `src/types/` 한 곳」. 디렉토리별 세부는 하위 파일로.
- 「개발 프로세스」「명령어」 — 그대로.
- 원본 데이터 — **한 단락만** 남긴다: CRITICAL 「사실만 가져오고 문장은 직접 쓴다」(이유와 ADR-009)와 「원본 목록과 허용 범위는 `docs/source/CLAUDE.md`」.
  이 CRITICAL은 루트에도 남겨야 한다 — execute.py가 하위 파일을 주입하지 않으므로, 루트에서 빠지면 데이터를 만드는 step이 이 규칙을 못 볼 수 있다.
- **하위 파일 지도** — 위 표의 하위 `CLAUDE.md` 여덟 개를 한 줄씩. 그리고 사실 한 줄: 「`scripts/execute.py`는 루트 `CLAUDE.md`와 `docs/*.md`만 주입한다.
  harness step 문서를 쓸 때는 그 step이 일하는 디렉토리의 `CLAUDE.md`를 「읽어야 할 파일」에 적는다.」

### 3. 대조표 — `phases/67-subject-split/claude-md-map.md`

예전 루트 `CLAUDE.md`(`git show HEAD:CLAUDE.md` — 이 step의 커밋 전)의 절과 글머리표 하나하나가 **어느 파일의 어느 절로 갔는지** 표로 적는다.
「뺐다」가 있으면 그 이유를 적는다(예: 다른 곳과 중복). 이 표가 「옮겼지 버리지 않았다」의 증거다.

## Acceptance Criteria

```bash
for f in CLAUDE.md docs/CLAUDE.md docs/source/CLAUDE.md src/data/CLAUDE.md src/lib/CLAUDE.md src/pages/CLAUDE.md src/components/CLAUDE.md src/components/diagrams/CLAUDE.md scripts/CLAUDE.md phases/67-subject-split/claude-md-map.md; do test -f "$f" || echo "없음: $f"; done
grep -c "HashRouter\|base\|정적 JSON\|localStorage\|TDD\|git add -A\|사실만 가져오고 문장은 직접 쓴다\|docs/source/CLAUDE.md" CLAUDE.md
grep -n "ADR-039\|exam-types\|dump-gaps\|aws-docs" docs/source/CLAUDE.md | head -5
git check-ignore docs/source/CLAUDE.md || echo "추적 대상"
npm run build
npm test
```

## 검증 절차

1. AC를 실행한다. 첫 줄은 **아무것도 출력하지 않아야** 하고, `git check-ignore`는 「추적 대상」을 내야 한다(`docs/source/`의 일부는 gitignore다 — 새 파일이 무시되면 안 된다).
2. 대조표를 보며 예전 루트의 CRITICAL 문장(HashRouter·`base`·정적 JSON·localStorage·TDD·`git add -A`·사실만 가져오기)이 모두 새 파일 어딘가에 남았는지 확인한다.
3. 하위 파일에 쓴 문장마다 근거(예전 루트 또는 문서 절)를 댈 수 있는지 확인한다. 댈 수 없는 문장은 지운다.
4. `git status`로 바뀐 파일이 위 열 개(루트 `CLAUDE.md` 수정, 나머지 새 파일)와 phase 메타데이터뿐인지 확인한다.
5. `phases/67-subject-split/index.json`의 step 8을 갱신한다. 성공이면 `summary`에 만든 파일, 루트의 줄 수 변화(전 → 후), 대조표에서 「뺐다」의 수와 이유를 적는다.

## 금지사항

- **새 규칙을 만들지 마라.** 이유: 사용자 요청은 「옮기기」다. 문서에 없는 규칙을 하위 파일에 쓰면 다음 작업자가 그것을 합의된 규칙으로 믿는다.
- **루트에서 CRITICAL 문장을 빼지 마라.** 이유: execute.py는 하위 `CLAUDE.md`를 주입하지 않는다. 루트에서 빠진 CRITICAL은 harness step에서 사라진다.
- **`docs/*.md`(ADR·ARCHITECTURE·PRD·UI_GUIDE)와 코드를 고치지 마라.** 이유: step 7까지 끝났다. 하위 파일이 문서와 다르면 하위 파일을 문서에 맞춘다.
- **`docs/CLAUDE.md`를 길게 쓰지 마라.** 이유: execute.py가 `docs/*.md`를 모두 주입하므로 이 파일도 매 step 프롬프트에 들어간다.
- **`phases/` 아래 지난 phase 문서의 `CLAUDE.md` 언급을 고치지 마라.** 이유: 그 시점의 기록이다.
- **`.claude/`·`scripts/execute.py`를 고쳐 하위 파일을 주입하게 만들지 마라.** 이유: 요청받지 않은 도구 변경이다. 지도 한 줄로 해결한다.
- 기존 테스트를 깨뜨리지 마라.
