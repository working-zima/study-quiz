# Step 7: docs

## 배경

phase 67이 앱을 과목 단위로 나눴다. step 0~6의 결과(이전 step 산출물 요약도 함께 읽어라):

- 데이터: AWS 데이터가 `src/data/aws/`로 옮겨졌다(`topics.json`·`questions.json`·`keywords.enc.json`·`visuals/`·`index.ts`와 테스트 넷).
  `src/data/index.ts`는 과목 목록 `subjects`이고, 불변식 테스트(`src/data/index.test.ts`)가 과목 id·`progressKey` 유일, 예전 첫 세그먼트와 겹치지 않음,
  주제·개념 id의 과목 간 유일을 지킨다. 타입은 `src/types/subject.ts`의 `Subject`.
- 라우트: `#/`은 과목 목록(`SubjectListPage`), `#/:subjectId/…` 아래에 지금까지의 화면이 모두 있다. `SubjectScope`가 과목을 찾아 `SubjectContext`로 넘기고
  (없으면 `#/`), 과목이 바뀌면 `key`로 하위 트리를 다시 마운트한다. 예전 주소(`#/topic/…`·`#/review…`·`#/search`·`#/random…`·`#/keywords`)는
  `search`·`hash`를 유지한 채 `#/aws/…`로 replace된다. `keywords`는 `hasKeywordQuiz` 과목에서만 열린다.
- 진행률: `loadProgress(key)`·`saveProgress(key, p)`, 키는 과목의 `progressKey`. AWS는 예전 키 `'aws-quiz.progress'` 그대로라 기록이 이어진다.
- 화면·컴포넌트: 데이터 기본값을 `useSubject()`에서 읽고(테스트용 props override 유지), 링크에 `/${subject.id}` 접두사. 검색·랜덤·복습은 과목 안에서만.
  헤더 — 과목 안: 과목 이름(→ 과목 홈) + 검색 + 복습, 과목 밖: 「Study Quiz」만. 로고 연속 탭은 `hasKeywordQuiz`일 때만. `BackButton`의 대체 목적지는 과목 홈.
  주제 목록 맨 위에 「모든 과목」(→ `#/`).
- 앱 이름: 「Study Quiz」(탭 제목·메타·패키지 이름 `study-quiz`). 저장소 이름 `study-quiz`로의 변경은 배포 시점에 사람이 한다.

이 step은 **그 결정을 문서에 기록하고, 현재 상태를 설명하는 문서를 고친다.** 코드는 고치지 않는다.

## 읽어야 할 파일

- `docs/ADR.md` — 맨 위 「철학」과 최근 ADR 두세 개(ADR-050~052)의 형식. **ADR-040**(키워드 퀴즈), **ADR-020**(앵커), **ADR-032**(복습 목록)
- `docs/ARCHITECTURE.md` 전체
- `docs/PRD.md` 전체
- `docs/UI_GUIDE.md`의 「카드 (주제 목록 항목)」「돌아가기」「상단 고정 헤더」「헤더 안의 링크」
- 이 phase에서 바뀐 코드: `src/App.tsx`, `src/hooks/useSubject.ts`, `src/components/SubjectScope.tsx`, `src/pages/SubjectListPage.tsx`, `src/components/Layout.tsx`,
  `src/data/index.ts`·`index.test.ts`, `src/lib/storage.ts`. 문서는 **코드가 실제로 하는 것**을 적는다. 위 요약과 코드가 다르면 코드를 따르고 `summary`에 적는다.

## 작업

### 1. ADR-053 — `docs/ADR.md` 맨 끝에 추가

제목 형식은 앞 ADR과 같다. 예: `### ADR-053: 앱 하나에 과목을 나눠 담는다 — 과목별 URL·데이터·진행률 (ARCHITECTURE 「헤더는 모든 화면에서 같다」 개정 / ADR-040 확장)`.
담을 것:

- **결정** — 위 「배경」의 구조. 과목 단위로 갈라지는 넷(URL 접두사, 데이터 폴더, 진행률 키, 검색·랜덤·복습의 범위)을 분명히 적는다.
- **사용자 결정(2026-10-26)** — 네트워크 과목을 더하기 위해서다. 사용자는 AWS와 네트워크가 섞이지 않기를 원했다. 과목을 고르는 방식은 세 안
  (첫 화면에서 고르기 / 마지막 과목 기억 / 헤더에서 전환) 중 **첫 화면에서 고르기**를 골랐다. 앱 이름은 「Study Quiz」, 저장소 이름은 `study-quiz`로 바꾼다
  (배포 주소의 서브경로가 바뀌어 예전 주소는 끊긴다. 진행 기록은 같은 도메인의 localStorage라 남는다). 주소를 유지하는 안을 권했으나 사용자가 이름 변경을 택했다.
- **헤더 규칙 개정** — ARCHITECTURE 「헤더는 모든 화면에서 같다」를 **「헤더는 과목 안에서 같다」**로 바꾼다. 과목 밖(첫 화면)의 헤더는 「Study Quiz」뿐이다.
  분기의 근거는 과목 컨텍스트가 있는가 하나이고, 화면 판별(`useParams`·`useMatch`·`pathname`)이 아니다. 과목 안에서는 화면에 따라 헤더를 바꾸지 않는다는 원래 이유
  (「근거 개념」 링크가 확인 문제 화면을 언마운트시킨 사례)는 그대로 유효하다. 링크 둘 상한(UI_GUIDE)도 그대로다 — 과목 이름은 로고 자리에 들어간다.
- **불변식과 그 이유** — 주제·개념 id는 과목을 넘어 유일(도식 registry가 개념 id 하나로 찾는다, 검색 앵커), 과목 id는 예전 첫 세그먼트와 겹치지 않음
  (리다이렉트의 정적 경로가 라우트 순위에서 이긴다), `progressKey` 유일. 문항 id는 과목 안에서만 유일하면 된다.
- **예전 주소** — 북마크·공유 링크를 위해 `#/aws/…`로 넘긴다. `search`·`hash` 유지(ADR-020 앵커).
- **AWS 진행률 키를 바꾸지 않은 이유**, **과목이 바뀌면 다시 마운트하는 이유**(`useProgress`의 초기값).
- **키워드 퀴즈(ADR-040 확장)** — `hasKeywordQuiz` 과목에서만 열린다. 암호문은 AWS 과목 폴더에 있다.
- **원본 위치** — AWS 원본(`docs/source/`)은 제자리다. gitignore된 로컬 파일이 다른 worktree에만 있어, 옮기면 그쪽 경로가 깨진다. 다음 과목의 원본은 `docs/source/<과목>/`에 둔다.
- **검토한 대안** — 앱을 과목마다 따로 만들기(배포·공용 코드가 둘로 갈라진다), 과목 선택을 기억하거나 헤더에서 전환(사용자가 기각).

### 2. `docs/ARCHITECTURE.md`

- 「디렉토리 구조」 — `data/`가 과목 폴더(`data/aws/`)와 과목 목록(`data/index.ts`)을 담는다. `hooks/`에 `useSubject`, `types/`에 `subject.ts`.
- 「라우트」 — 표를 `#/`(과목 목록)과 `#/:subjectId/…`(지금까지의 화면, 접두사가 붙은 경로)로 다시 쓴다. 예전 주소 리다이렉트와 없는 과목·경로의 처리를 적는다.
  「주제 목록 (39개…)」처럼 AWS 고유의 수치는 「AWS 과목 기준」임을 밝히거나 뺀다.
- 「헤더는 모든 화면에서 같다」 — 절 제목과 본문을 ADR-053대로 개정한다. 과목 컨텍스트 분기만 허용, 화면 판별 금지는 유지. 로고 연속 탭 문단에 `hasKeywordQuiz` 조건을 더한다.
- 「데이터 흐름」「상태 관리」「테스트 경계」 — 경로(`src/data/aws/…`), 과목별 진행률 키, `src/data/index.test.ts`의 과목 불변식을 반영한다. 테스트 경계 표의 개념 수(618개)는 지금 값(640개)으로 고치거나 수치를 뺀다.
- 그 밖에 `src/data/topics.json`처럼 **옮기기 전 경로를 현재 상태로 설명하는** 문장을 찾아 고친다(`grep -n "src/data/" docs/ARCHITECTURE.md`).

### 3. `docs/PRD.md`

- 제목과 「목표」 — 앱은 「Study Quiz」, 과목별로 개념을 읽고 확인 문제로 점검하는 학습 앱. 지금 과목은 AWS SAA-C03이고, 이 PRD의 나머지(사용자·원본·핵심 기능·문제 은행)는 **AWS 과목의 것**임을 밝힌다.
- 「핵심 기능」에 과목 선택(첫 화면)과 「검색·랜덤·복습은 과목 안에서」를 더한다.
- 낡은 수치(문항 732개, 개념 618개 등)는 지금 값(문항 746개, 개념 640개, 주제 39개)으로 고친다.

### 4. `docs/UI_GUIDE.md`

- 「헤더 안의 링크」 — 도식을 과목 안·과목 밖 두 줄로 바꾸고, 「구성은 화면마다 달라지지 않는다」를 「과목 안에서는 화면마다 달라지지 않는다」로 개정(ADR-053). 실측 표와 링크 둘 상한은 그대로.
- 「돌아가기」 — 주제 목록 맨 위 「모든 과목」 링크를 더한다: 같은 모양, 늘 `#/`로 가는 링크(직전 화면이 아니다), 왜 주제 목록에만 있는지. `BackButton`의 대체 목적지가 과목 홈이 된 것도 고친다.
- 과목 목록 화면 — 「카드 (주제 목록 항목)」 근처에 과목 카드(같은 카드 스타일, 과목 이름 + 「주제 N개 · 문항 M개」)를 짧게 적는다.

## Acceptance Criteria

```bash
npm run build
npm test
grep -n "^### ADR-053" docs/ADR.md
grep -nE "src/data/(topics|questions|keywords)|헤더는 모든 화면에서 같다" docs/ARCHITECTURE.md docs/UI_GUIDE.md docs/PRD.md
```

## 검증 절차

1. AC를 실행한다. ADR-053 제목이 한 줄 나와야 하고, 마지막 grep은 **아무것도 출력하지 않아야** 한다(옮기기 전 경로와 개정 전 절 제목이 현재 상태 문서에 남지 않았다).
2. 고친 문서를 처음부터 다시 읽으며, 새로 쓴 문장이 실제 코드(`src/App.tsx`·`Layout.tsx`·`storage.ts` 등)와 맞는지 대조한다.
3. `git status`로 바뀐 파일이 `docs/ADR.md`·`docs/ARCHITECTURE.md`·`docs/PRD.md`·`docs/UI_GUIDE.md`와 phase 메타데이터뿐인지 확인한다.
4. `phases/67-subject-split/index.json`의 step 7을 갱신한다. 성공이면 `summary`에 ADR-053 제목, 개정한 절, 고친 수치를 적는다.

## 금지사항

- **지난 ADR(ADR-001~052)의 본문을 고치지 마라.** 이유: 결정 당시의 기록이다. 옛 경로·수치가 남아 있어도 그때의 사실이다. 개정은 ADR-053이 「개정」으로 밝힌다.
- **코드·`CLAUDE.md`·`docs/source/`를 고치지 마라.** 이유: 코드는 step 0~6에서 끝났고, `CLAUDE.md` 계층은 step 8의 범위다.
- **네트워크 과목의 내용(주제 목록·출처·자격증)을 문서에 정하지 마라.** 이유: 다음 phase들의 범위다. ADR-053은 「다음 과목은 네트워크」와 원본 폴더 위치까지만 적는다.
- **규칙을 새로 만들지 마라.** 이유: 이 step은 이미 구현된 결정을 기록한다. 코드에 없는 규칙을 문서에 쓰면 다음 phase가 그것을 사실로 믿는다.
- 기존 테스트를 깨뜨리지 마라.
