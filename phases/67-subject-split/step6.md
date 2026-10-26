# Step 6: app-identity

## 배경

phase 67은 앱 하나에 과목을 여럿 담는 구조를 만든다(지금은 AWS 하나, 다음은 네트워크). step 0~5가 데이터·라우트·진행률·화면·헤더를 과목 단위로 바꿨고,
첫 화면 헤더는 이미 「Study Quiz」다(step 5).

이 step은 **앱의 이름을 「Study Quiz」로 바꾼다** — 브라우저 탭 제목, 공유 메타데이터, 패키지 이름. 더 이상 AWS 전용 앱이 아니기 때문이다.
저장소 이름도 `study-quiz`로 바뀔 예정이다(배포 시점에 사람이 한다). 그러면 배포 주소의 서브경로가 `/aws-saa-c03-quiz/`에서 `/study-quiz/`가 된다.

## 읽어야 할 파일

- `index.html`
- `src/deploy-metadata.test.ts`
- `public/favicon.svg`의 첫 줄(`aria-label`)
- `package.json`·`package-lock.json`의 `name`
- `vite.config.ts` — `base: './'`(바꾸지 않는다)

## 작업

### 1. 테스트 먼저 — `src/deploy-metadata.test.ts`

- 새 테스트: 제목(`<title>`)과 `og:title`이 「Study Quiz」다.
- 주석 안의 서브경로 예시 `/aws-saa-c03-quiz/`를 `/study-quiz/`로 바꾼다.
- 실행해서 새 테스트가 실패하는 것을 본다.

### 2. `index.html`

- `<title>`과 `og:title` → 「Study Quiz」.
- `description` → 앱 전체를 말하는 문장으로 다시 쓴다: 과목별로 개념을 읽고 바로 확인 문제로 점검하는 학습 앱, 지금 과목은 AWS SAA-C03.
  주제·개념·문항 수는 넣지 마라 — 지금 문장의 「618개·732개」처럼 데이터가 늘 때마다 낡는다(실제는 640개·746개). 기존 테스트대로 20자를 넘어야 한다.
- `og:description` → 위와 같은 취지로. 지금 문장의 「오답노트」는 이미 「복습」으로 바뀐 이름이다(ADR-032) — 쓰지 마라.
- CRITICAL 주석의 서브경로 예시 `/aws-saa-c03-quiz/` → `/study-quiz/`. 아이콘 경로(`./favicon.svg`)는 상대 경로 그대로다.

### 3. 나머지

- `public/favicon.svg`의 `aria-label` → 「Study Quiz」. 그림은 바꾸지 마라.
- `package.json`의 `name` → `study-quiz`. `package-lock.json`은 **맨 위 `name`과 `packages[""].name` 두 자리만** 손으로 고친다.
  `npm install`로 lock을 다시 만들지 마라 — 다른 의존성 줄이 바뀐다.
- `README.md`는 하네스 프레임워크 설명서이고 앱 이름·배포 주소가 없다. **고치지 않는다.** 확인만 하고 `summary`에 적는다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
grep -rn "aws-saa-c03-quiz\|aws-saa-c03-concept-learning\|AWS SAA-C03 개념 학습" index.html public package.json package-lock.json src
```

## 검증 절차

1. AC를 실행한다. 마지막 grep은 **아무것도 출력하지 않아야** 한다.
2. `dist/index.html`의 `<title>`이 「Study Quiz」이고 아이콘 경로가 `./`로 시작하는지 본다.
3. `git status`로 바뀐 파일이 `index.html`·`public/favicon.svg`·`package.json`·`package-lock.json`·`src/deploy-metadata.test.ts`와 phase 메타데이터뿐인지 확인한다.
4. `phases/67-subject-split/index.json`의 step 6을 갱신한다. 성공이면 `summary`에 바꾼 이름이 들어간 자리, 새 설명 문장, README를 고치지 않은 이유, 테스트 수를 적는다.

## 금지사항

- **`vite.config.ts`의 `base`를 바꾸지 마라.** 이유: CLAUDE.md CRITICAL — `'./'`여야 저장소 이름이 바뀌어도 서브경로 배포가 깨지지 않는다.
- **GitHub 저장소 이름을 바꾸거나 `gh repo rename`을 실행하지 마라. `push`하지 마라.** 이유: 배포 주소가 바뀌어 예전 주소가 끊기는 일이라 사람이 배포 시점에 결정한다.
- **`CLAUDE.md`·`docs/`를 고치지 마라.** 이유: step 7·8의 범위다.
- **로컬 폴더 이름·worktree 경로를 바꾸지 마라.** 이유: 에이전트 메모리 경로가 폴더 이름에 묶여 있다.
- **헤더의 과목 이름(「AWS SAA-C03」)을 바꾸지 마라.** 이유: 그것은 앱 이름이 아니라 과목 이름이다(`awsSubject.title`).
- 기존 테스트를 깨뜨리지 마라.
