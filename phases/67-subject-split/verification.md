# phase 67 검증 보고

확인한 날: 2026-10-26. 설계 커밋 ce54b0f, 마지막 step 커밋 49b7328(`feat-67-subject-split`, origin/develop 8fcd85b에서 분기).
step 0~1 / 2~5 / 6~8 세 덩어리로 끊어 돌리고 덩어리마다 검토했다.

## step별 결과

| step | 결과 | 테스트 |
|---|---|---|
| 0 data-move | AWS 데이터·`visuals/`·`index.ts`·데이터 테스트 넷을 `src/data/aws/`로 `git mv`(JSON 전부 R100). import 113곳, 스크립트 11개 경로 | 2701(변화 없음) |
| 1 subject-registry | `Subject` 타입, `awsSubject`(progressKey `'aws-quiz.progress'`), `subjects`, 과목 불변식 | 2706(+5) |
| 2 subject-routes | `useSubject`·`SubjectScope`(`key={subject.id}`)·`SubjectListPage`, `AppRoutes({subjects})`, 예전 주소 → `/aws` | 2732(+26) |
| 3 progress-per-subject | `loadProgress(key)`·`saveProgress(key, p)`, `useProgress`가 과목 키 사용, 도우미 `src/test/subject.tsx` | 2736(+4) |
| 4 pages-subject | 화면 8개가 `useSubject()`에서 읽고 링크에 `/${subject.id}`. 가짜 과목 a·b로 과목 경계 테스트 넷 | 2740(+4) |
| 5 components-subject | 헤더 두 모양, 연속 탭은 `hasKeywordQuiz`만, `BackButton` 대체 목적지 과목 홈, 「모든 과목」 | 2748(+8) |
| 6 app-identity | 탭 제목·`og:title`·favicon `aria-label` 「Study Quiz」, 패키지 이름 `study-quiz`(lock은 두 자리만) | 2749(+1) |
| 7 docs | ADR-053, ARCHITECTURE·PRD·UI_GUIDE 갱신 | 2749 |
| 8 claude-md | 루트 `CLAUDE.md`를 앱 전체용으로, 하위 `CLAUDE.md` 8개, 대조표 `claude-md-map.md`(33행, 「뺐다」 0) | 2749 |

## 설계와 달라진 것

- **step 4·5가 목록 밖 테스트를 조금 고쳤다.** step 4는 `KeywordQuizPage`의 코드를 고치지 않았다(링크가 없다). 테스트만 과목으로 감쌌다.
  step 5는 헤더 링크가 바뀐 탓에 `App.test.tsx` 한 줄(`/review` → `/aws/review`)과 `SearchPage.test.tsx`의 돌아가기 라우트를 고쳤다.
  둘 다 이 step의 변경을 따라간 것이라 받아들였다.
- **step 7이 낡은 사실 하나를 바로잡았다.** ARCHITECTURE 「데이터 흐름」이 localStorage 접근을 `lib/progress.ts`로 적고 있었는데, 실제는 `lib/storage.ts`다.
  PRD의 「핵심 기능」에는 과목 선택을 8번으로 더했다. 다른 문서가 번호로 가리키므로 기존 번호는 그대로 두었다.
- **루트 `CLAUDE.md`의 줄 수는 거의 같다(114 → 113).** 글자 수는 4780 → 3886이다. 옮긴 원본 목록이 아주 긴 줄 몇 개였고,
  그 자리에 과목 구조 단락과 하위 파일 지도가 들어왔다.

## 다시 돌린 검증 (phase가 끝난 뒤)

- `npm run build`·`npm run lint` 통과, `npm test` 107파일·2749개 통과.
- step 4·5 grep — 접두사 없이 `/topic`·`/review`·`/search`·`/random`·`/keywords`로 가는 링크·`navigate` 0건.
  범위를 넓혀 `src` 전체의 `'/topic…'` 꼴 문자열과 데이터 JSON 안의 내부 링크도 찾았다. 0건이다.
- 화면·컴포넌트에서 `src/data/aws`를 직접 읽는 곳은 `KeywordQuizPage`(암호문)와 도식뿐이다.
- 진행률 키 문자열 `aws-quiz.progress`는 `src/data/aws/index.ts`와 그 단언 테스트에만 있다.
- `Layout`은 `useParams`·`useMatch`·`pathname`으로 화면을 판별하지 않는다(`useLocation`은 스크롤용 `hash`·`key`만).
- step 6 grep(옛 앱 이름·패키지 이름·서브경로) 0건. step 7 grep(옛 데이터 경로·개정 전 절 제목) 0건.
- step 8 AC — 파일 열 개 있음, `docs/source/CLAUDE.md`는 추적 대상.
- 하위 `CLAUDE.md`의 문장을 몇 개 골라 근거를 대조했다. 난수 주입은 ARCHITECTURE 「문항과 보기의 순서」, 데이터 자동 생성 금지는 「데이터 흐름」에 있다.
  헤더에 「모든 과목」·과목 전환을 넣지 않는 것은 ADR-053, 재시도 3회는 `execute.py`의 `MAX_RETRIES`, 훅 네 개는 각 머리 주석과 `.claude/settings.json`에 있다.
  모두 근거가 있었다.
- ADR-053 본문을 코드와 대조했다. 리다이렉트, `key` 재마운트, 진행률 키, 키워드 퀴즈 조건, AWS를 전제하는 세 곳이 구현과 같다.

## 화면 확인 (Chrome, 창 폭 1180px, 개발 서버 `localhost:5187`)

- `#/` — 탭 제목 「Study Quiz」, 헤더 「Study Quiz」뿐(검색·복습 없음), 제목 「과목」, 카드 하나 「AWS SAA-C03 · 주제 39개 · 문항 746개」 → `#/aws`.
- `#/aws` — 헤더 「AWS SAA-C03」(→ `#/aws`)·검색(→ `#/aws/search`)·복습(→ `#/aws/review`). 「모든 과목」(→ `#/`)이 제목 위에 있다.
  주제 카드 39개와 랜덤 링크 모두 `#/aws/…`.
- 검색 — 헤더에서 열면 입력창에 초점, `NAT` → 주소 `#/aws/search?q=NAT`, 결과 링크 전부 `#/aws/topic/…#개념id`.
  첫 결과를 누르면 개념 제목이 헤더 바로 아래(위에서 96px)에 선다.
- 확인 문제 — `#/aws/topic/vpc-networking/quiz`, 한 문항을 풀면 `aws-quiz.progress`에 답 1건(`version: 3`)과 읽은 주제가 남는다. 「개념 보기」는 주제 전체(개념 제목 10개)를 펼친다.
- 로고 — 한 번 누르면 `#/aws`. 1.5초 안에 다섯 번 누르면 다섯 번째에 `#/aws/keywords`(「키워드 퀴즈」). `#/`에서 일곱 번 눌러도 `#/`에 머문다.
- 예전 주소 — 아래 모두 같은 화면으로 넘어갔다. 새 탭에서 연 `#/topic/vpc-networking#vpc-networking.nat-instance`도 앵커 위치(위에서 96px)에 선다.

  | 연 주소 | 착지 |
  |---|---|
  | `#/topic/vpc-networking#vpc-networking.nat-gateway` | `#/aws/topic/vpc-networking#vpc-networking.nat-gateway` |
  | `#/topic/vpc-networking/quiz` | `#/aws/topic/vpc-networking/quiz` |
  | `#/search?q=s3` | `#/aws/search?q=s3` |
  | `#/review`·`#/review/quiz` | `#/aws/review`·`#/aws/review/quiz` |
  | `#/random`·`#/random/10` | `#/aws/random`·`#/aws/random/10` |
  | `#/keywords` | `#/aws/keywords` |
  | `#/nope`·`#/net`·`#/net/topic/x` | `#/` |
  | `#/aws/nope` | `#/aws` |

- 돌아가기 — 새 탭에서 바로 연 `#/aws/search?q=s3`의 「돌아가기」는 `#/aws`(주제 목록)로 간다. 「모든 과목」을 누르면 `#/`이고 헤더가 「Study Quiz」로 바뀐다.
- 콘솔 오류 없음(위 화면 열한 곳을 다시 돈 뒤 확인).
- 320px — 창 크기 변경이 적용되지 않아 같은 출처의 폭 320px iframe에서 쟀다. `#/`·`#/aws`·확인 문제 모두 가로 넘침이 없다(`scrollWidth` ≤ 320).
  「모든 과목」은 높이 44px이고, 화살표가 다른 돌아가기와 같은 세로선에 선다. 헤더 높이는 과목 안팎 모두 77px다.
- 실기기(iOS Safari) 확인과 배포 주소(`/study-quiz/`) 확인은 하지 않았다. 저장소 이름 변경과 배포는 사람이 한다.
