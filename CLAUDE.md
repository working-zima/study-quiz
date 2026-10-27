# 프로젝트: Study Quiz

과목별로 개념을 읽고, 바로 확인 문제로 점검하는 학습용 SPA. 시험 시뮬레이터가 아니라 학습 도구다.

과목마다 URL 접두사(`#/:subjectId/…`)·데이터 폴더(`src/data/<과목 id>/`)·진행률 키(과목의 `progressKey`)가 따로 있고,
검색·랜덤·복습은 그 과목 안에서만 돈다. 앱에 어떤 과목이 있는지는 `src/data/index.ts`의 `subjects`가 정한다(ADR-053).
지금 과목은 AWS 솔루션스 아키텍트 어소시에이트(SAA-C03)와 네트워크(ADR-055) 둘이다.

## 기술 스택

Node 18.17.1 환경이다. **Node 20 이상을 요구하는 메이저 버전은 쓰지 마라.**
(Vite 6+, Tailwind 4+, Next.js 15+ 등이 여기 해당한다. `npm run build`가 통과해도
로컬 Node에서 깨지면 의미가 없다.)

- Vite 5 + React 18
- TypeScript strict mode
- Tailwind CSS 3.4
- Vitest + @testing-library/react
- react-router-dom 6 — **`HashRouter`를 쓴다.** `BrowserRouter`가 아니다.

## 배포

GitHub Pages(정적 호스팅). 서버가 없으므로 SPA fallback이 없다.

- CRITICAL: 라우터는 `HashRouter`다. `BrowserRouter`로 바꾸면 새로고침 시 404가 난다.
- CRITICAL: `vite.config.ts`의 `base`는 `'./'`다. 절대 경로로 바꾸면 서브경로 배포가 깨진다.
- 빌드 산출물은 `dist/`. 이 디렉토리는 커밋하지 않는다.

## Git 전략

gitflow. `main`은 배포 가능 상태, `develop`이 통합 브랜치다.
harness는 현재 브랜치에서 `feat-{phase}` 브랜치를 파므로 **`develop`에서 실행**한다.
step 실행 중에는 브랜치를 직접 옮기지 마라.

### 에이전트를 여러 개 동시에 돌릴 때

이 저장소는 에이전트 여러 개가 **동시에** 쓴다. 그러므로 저장소를 독점하고 있다고
가정하지 마라. **에이전트마다 worktree를 하나씩 둔다.**

```bash
git worktree add ../aws-saa-c03-quiz-<식별자> -b feat-<phase>
cd ../aws-saa-c03-quiz-<식별자> && npm install
```

CRITICAL: 브랜치만 나누는 것으로는 부족하다. 충돌하는 자원은 히스토리가 아니라
**작업 디렉토리 하나**이고, 거기서 두 가지가 공유된다.

- **HEAD가 공유된다.** 한쪽이 `git checkout`을 하면 다른 쪽의 파일이 통째로 바뀐다.
- **인덱스가 공유된다.** `scripts/execute.py`의 `_commit_step`은 `git add -A`를 쓴다.
  같은 디렉토리를 쓰면 **다른 에이전트가 편집 중이던 파일까지 자기 커밋에 넣는다.**
  worktree 안에서는 이 동작이 안전하다 — 자기 트리 밖에 닿지 못한다.

git은 같은 브랜치를 두 worktree에서 체크아웃하는 것을 거부하므로, worktree를 나누면
"작업마다 다른 브랜치"가 규칙이 아니라 강제가 된다. `node_modules/`는 공유되지 않으므로
worktree마다 `npm install`이 한 번 필요하다.

### 커밋 전에 지킬 것 — worktree를 나눴더라도

- **커밋 직전에 현재 브랜치와 `git status`를 다시 확인한다.** 세션 앞부분에서 본 값을
  믿지 마라. 오래 걸리는 백그라운드 작업이 끝난 뒤에는 특히 그렇다.
- **내가 만들지 않은 변경이 워킹 트리에 있으면 커밋하지 말고 멈춰서 사용자에게 알려라.**
  손으로 커밋할 때 `git add -A`·`git add .`로 쓸어 담지 마라. 바꾼 파일을 이름으로 지정한다.
  (`execute.py`가 자기 worktree 안에서 `add -A`를 쓰는 것은 위 이유로 별개다.)
- 병합과 `push`는 사람이 판단한다. 요청받지 않았으면 하지 마라.

## 아키텍처 규칙

- CRITICAL: 학습 데이터(개념·문제)는 **빌드 타임 정적 JSON**이다.
  런타임에 외부 API를 호출하지 마라. 이유: 이 앱은 API 키 없이 오프라인으로 동작해야 한다.
  `fetch`로 외부 호스트를 부르는 코드가 들어가면 설계 위반이다.
- CRITICAL: 사용자 상태(진행률·오답)는 **localStorage에만** 저장한다.
  서버·계정·DB를 만들지 마라. 이유: 서버가 없는 게 이 앱의 배포 전략이다.
- 데이터 타입은 `src/types/`에 단 한 곳에서 정의한다. 컴포넌트마다 인라인 타입을 다시 만들지 마라.
- 디렉토리마다의 규칙(`src/lib/`의 순수 로직, `src/components/`·`src/pages/`의 자리 등)은
  그 디렉토리의 `CLAUDE.md`에 있다 — 아래 「하위 CLAUDE.md」.

## 개발 프로세스

- CRITICAL: 새 기능 구현 시 반드시 테스트를 먼저 작성하고, 테스트가 통과하는 구현을 작성할 것 (TDD)
- 커밋 메시지는 conventional commits 형식을 따를 것 (feat:, fix:, docs:, refactor:)
- 요청받지 않은 기능을 만들지 마라. step 문서에 적힌 범위만 구현한다.

## 명령어

npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 (tsc 타입체크 포함)
npm run lint     # ESLint
npm run test     # Vitest (CI 모드, watch 금지)

## 원본 데이터

- CRITICAL: **사실만 가져오고 문장은 직접 쓴다.** 원본 문장을 그대로 옮기지 마라.
  이유: `concepts-raw.md`는 외부 참고 자료의 추출 전문이다. 전사하면 저장소를 공개할 때
  원문이 그대로 공개된다. 근거는 ADR-009.

원본 목록과 각 원본에서 무엇을 가져올 수 있는지는 과목마다 따로 있다 — AWS는 `docs/source/CLAUDE.md`(ADR-039의 허용 목록 포함),
네트워크는 `docs/source/network/CLAUDE.md`.
원본에 없는 내용을 지어내지 마라.

## 하위 CLAUDE.md

| 파일 | 담은 것 |
|---|---|
| `docs/CLAUDE.md` | `docs/` 문서 지도 — PRD·ARCHITECTURE·ADR·UI_GUIDE가 각각 무엇을 정하는가 |
| `docs/source/CLAUDE.md` | AWS 과목 원본 목록, ADR-039 허용 목록, `exam-types.md`의 쓰임, 전사 금지 |
| `docs/source/network/CLAUDE.md` | 네트워크 원본 셋(강의·표준·면접), 허용 표준 문서, 충돌하면 표준, 수정 이력, 추출본 다시 만들기 |
| `src/data/CLAUDE.md` | 과목 폴더 구조, 과목 불변식, 데이터 가드레일 스크립트, 도식 문구의 자리 |
| `src/lib/CLAUDE.md` | 순수 로직, localStorage에 접근하는 유일한 계층, 진행률 키를 넘기는 쪽 |
| `src/pages/CLAUDE.md` | 화면 단위, `useSubject()`와 테스트용 props override, 링크의 과목 접두사 |
| `src/components/CLAUDE.md` | 공용 컴포넌트, 헤더 규칙, 컴포넌트별로 먼저 읽을 문서 절 |
| `src/components/diagrams/CLAUDE.md` | 도식 규칙이 있는 문서 절, 넘침 검사, 도식은 자기 과목 폴더의 문구를 읽는다 |
| `scripts/CLAUDE.md` | harness 실행기 `execute.py`, 에이전트 훅, 데이터 가드레일·감사 스크립트 |

`scripts/execute.py`는 루트 `CLAUDE.md`와 `docs/*.md`만 주입한다.
harness step 문서를 쓸 때는 그 step이 일하는 디렉토리의 `CLAUDE.md`를 「읽어야 할 파일」에 적는다.
