# 루트 CLAUDE.md 대조표 — step 8

예전 루트 `CLAUDE.md`(`git show ff17830:CLAUDE.md`, 114줄)의 절과 글머리표가 어디로 갔는지 적는다.
「그대로」는 문장을 바꾸지 않고 같은 절에 남겼다는 뜻이다. 「옮김」은 다른 파일로 갔다는 뜻이다.

## 결과

- 루트 `CLAUDE.md`: 114줄 → 113줄. 「원본 데이터」 절의 긴 목록(약 30줄)과 디렉토리별 규칙 두 줄이 빠지고, 과목 구조 한 단락과
  「하위 CLAUDE.md」 지도(하위 파일 여덟)가 들어왔다. 줄 수는 비슷하지만, 과목마다 달라지는 원본 목록이 이제 루트가 아니라 `docs/source/CLAUDE.md`에 있다.
- **「뺐다」 0건.** 모든 문장이 루트에 남았거나 하위 파일로 옮겨졌다.
- CRITICAL 문장 일곱(HashRouter, `base`, worktree 공유 자원, 정적 JSON, localStorage, TDD, 사실만 가져오기)은 모두 루트에 남았다.
  사실만 가져오기는 `docs/source/CLAUDE.md`에도 있다. `execute.py`가 하위 파일을 주입하지 않기 때문이다.

## 절별 대조

| 예전 루트 | 간 곳 | 비고 |
|---|---|---|
| 제목 「프로젝트: AWS SAA-C03 개념 학습 앱」 | 루트 제목 「프로젝트: Study Quiz」 | 앱 이름 변경(ADR-053) |
| 소개 「AWS SAA-C03 범위의 서비스 개념을 읽고, 바로 확인 문제로 점검하는 학습용 SPA. 시험 시뮬레이터가 아니라 학습 도구다.」 | 루트 소개 첫 단락 | 「과목별로」로 넓히고, AWS 범위는 「지금 과목은 AWS SAA-C03 하나」로 남겼다. 과목 구조 단락을 더했다(ADR-053의 갈라지는 넷) |
| 「기술 스택」 — Node 18.17.1 문단과 글머리표 다섯(`HashRouter` 포함) | 루트 「기술 스택」 | 그대로 |
| 「배포」 — GitHub Pages 문장 | 루트 「배포」 | 그대로 |
| 「배포」 — CRITICAL `HashRouter` | 루트 「배포」 | 그대로 |
| 「배포」 — CRITICAL `base`는 `'./'` | 루트 「배포」 | 그대로 |
| 「배포」 — `dist/` 커밋 금지 | 루트 「배포」 | 그대로 |
| 「Git 전략」 — gitflow, `develop`에서 실행, step 중 브랜치 이동 금지 | 루트 「Git 전략」 | 그대로. `scripts/CLAUDE.md` 「execute.py」가 브랜치 동작과 함께 이 절을 가리킨다 |
| 「에이전트를 여러 개 동시에 돌릴 때」 — 독점 가정 금지·worktree 하나씩 | 루트 같은 절 | 그대로 |
| 같은 절 — `git worktree add` 코드 블록 | 루트 같은 절 | 그대로(로컬 폴더 이름 `aws-saa-c03-quiz-<식별자>` 유지) |
| 같은 절 — CRITICAL 브랜치만으로 부족 | 루트 같은 절 | 그대로 |
| 같은 절 — HEAD 공유 | 루트 같은 절 | 그대로 |
| 같은 절 — 인덱스 공유(`_commit_step`의 `git add -A`) | 루트 같은 절 | 그대로. `scripts/CLAUDE.md`가 커밋 동작과 함께 가리킨다 |
| 같은 절 — 같은 브랜치 거부·worktree마다 `npm install` | 루트 같은 절 | 그대로 |
| 「커밋 전에 지킬 것」 — 브랜치·`git status` 재확인 | 루트 같은 절 | 그대로 |
| 같은 절 — 남의 변경이면 멈춤, `git add -A`·`git add .` 금지 | 루트 같은 절 | 그대로 |
| 같은 절 — 병합·`push`는 사람이 | 루트 같은 절 | 그대로 |
| 「아키텍처 규칙」 — CRITICAL 빌드 타임 정적 JSON·`fetch` 금지 | 루트 「아키텍처 규칙」 | 그대로. `src/data/CLAUDE.md`가 가리킨다 |
| 같은 절 — CRITICAL localStorage에만 | 루트 「아키텍처 규칙」 | 그대로. `src/lib/CLAUDE.md`가 가리킨다 |
| 같은 절 — 타입은 `src/types/` 한 곳 | 루트 「아키텍처 규칙」 | 그대로. `src/data/CLAUDE.md`에도 타입 파일 이름과 함께 있다 |
| 같은 절 — 순수 로직은 `src/lib/`, React 비의존, DOM 없이 테스트 | `src/lib/CLAUDE.md` 첫 단락 | 옮김. 루트에는 하위 파일을 가리키는 한 줄을 남겼다. ARCHITECTURE 「디렉토리 구조」·「테스트 경계」에도 있어 harness step에는 계속 주입된다 |
| 같은 절 — 컴포넌트는 `src/components/`, 화면은 `src/pages/` | `src/components/CLAUDE.md`·`src/pages/CLAUDE.md` 첫 단락 | 옮김. ARCHITECTURE 「디렉토리 구조」에도 있다 |
| 「개발 프로세스」 — CRITICAL TDD | 루트 「개발 프로세스」 | 그대로 |
| 같은 절 — conventional commits | 루트 「개발 프로세스」 | 그대로 |
| 같은 절 — 요청받지 않은 기능 금지 | 루트 「개발 프로세스」 | 그대로 |
| 「명령어」 네 줄 | 루트 「명령어」 | 그대로 |
| 「원본 데이터」 — 머리 문장(세 곳 + ADR-039의 네 번째, 지어내지 마라) | `docs/source/CLAUDE.md` 「원본 데이터」 | 옮김. 「AWS 과목의」를 붙였다(이 디렉토리가 AWS 과목의 원본이라서, ADR-053). 「지어내지 마라」는 루트에도 한 줄 남겼다 |
| 같은 절 — `concepts-raw.md` | `docs/source/CLAUDE.md` | 옮김, 글자 그대로 |
| 같은 절 — `exam-gaps.md` | `docs/source/CLAUDE.md` | 옮김, 글자 그대로 |
| 같은 절 — `dump-gaps/`(`dump-slices/` 포함) | `docs/source/CLAUDE.md` | 옮김, 글자 그대로 |
| 같은 절 — `aws-docs.md`(ADR-039 허용 목록) | `docs/source/CLAUDE.md` | 옮김, 글자 그대로 |
| 같은 절 — `exam-types.md`(사실의 출처가 아님, ADR-051) | `docs/source/CLAUDE.md` | 옮김, 글자 그대로 |
| 같은 절 — CRITICAL 사실만 가져오고 문장은 직접 쓴다(ADR-009) | 루트 「원본 데이터」 + `docs/source/CLAUDE.md` | 둘 다. 루트에서 빠지면 harness step이 이 규칙을 보지 못한다 |

## 새 파일에 더한 것과 그 근거

새 규칙은 없다. 하위 파일의 문장은 예전 루트이거나, 아래 문서 절·코드 머리 주석을 줄여 가리킨 것이다.

| 파일 | 근거 |
|---|---|
| 루트 과목 구조 단락·「하위 CLAUDE.md」 | ADR-053, `scripts/execute.py`의 `_load_guardrails` |
| `docs/CLAUDE.md` | `docs/*.md` 각 문서의 절 구성, `_load_guardrails` |
| `docs/source/CLAUDE.md` 머리말·「이 디렉토리의 다른 파일」 | ADR-053 「원본 위치」, PRD 「원본」, ADR-019·ADR-022·ADR-040 |
| `src/data/CLAUDE.md` | ARCHITECTURE 「디렉토리 구조」·「데이터 모델」·「데이터 흐름」·「테스트 경계」, ADR-026·033·037·040·041·053 |
| `src/lib/CLAUDE.md` | ARCHITECTURE 「상태 관리」·「데이터 모델」·「문항과 보기의 순서」·「주제 간 이동」·「전체 범위 랜덤 세트」·「개념·주제 검색」·「테스트 경계」, ADR-053 |
| `src/pages/CLAUDE.md` | ARCHITECTURE 「라우트」·「상태 관리」·「확인 문제 화면의 공유 구조」·「화면 전환 시 스크롤」·「테스트 경계」, ADR-020·053, UI_GUIDE 「모든 과목」 |
| `src/components/CLAUDE.md` | ARCHITECTURE 「헤더는 과목 안에서 같다」·「화면 전환 시 스크롤」·「확인 문제 화면의 공유 구조」, UI_GUIDE 「상단 고정 헤더」·「헤더 안의 링크」·「돌아가기」 등, ADR-053 |
| `src/components/diagrams/CLAUDE.md` | UI_GUIDE 「도식」 이하, ARCHITECTURE 「테스트 경계」, ADR-036·037·038·047·048·050·053 |
| `scripts/CLAUDE.md` | `scripts/execute.py`, `scripts/hooks/*.sh` 머리 주석, `.claude/settings.json`·`.codex/hooks.json`, 각 스크립트 머리 주석, `package.json`의 `scripts` |
