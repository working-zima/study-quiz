# 아키텍처

## 디렉토리 구조

```
src/
├── main.tsx           # 진입점
├── App.tsx            # 라우터 정의. 과목 밖·과목 안 두 가지 (ADR-053)
├── pages/             # 화면 단위 (라우트 하나 = 파일 하나)
├── components/        # 재사용 UI 컴포넌트. SubjectScope가 URL의 과목을 찾아 넘긴다
│   └── diagrams/      # 개념 본문 안에 들어가는 SVG 도식. 레이아웃이 서로 달라 도식마다 컴포넌트 하나.
├── hooks/             # React 훅. 지금 과목(useSubject), 진행 상태(useProgress), 도식 배치 선택(useWideDiagram, ADR-047·ADR-048)
├── data/              # 빌드 타임 정적 학습 데이터 (JSON). 과목마다 폴더 하나 (ADR-053)
│   ├── index.ts       # 과목 목록 subjects. 과목 불변식은 index.test.ts
│   ├── aws/           # AWS 과목. topics.json·questions.json·keywords.enc.json과 과목 객체를 export하는 index.ts
│   │   └── visuals/   # 주제별 시각 요소의 문구(도식 캡션·표·약어). 좌표는 컴포넌트에 둔다(ADR-037).
│   └── network/       # 네트워크 과목(ADR-055). topics.json·questions.json·visuals/와 과목 객체 networkSubject를 export하는 index.ts
├── types/             # TypeScript 타입 정의 (단일 출처). 과목은 subject.ts
└── lib/               # 순수 로직. React 의존 없음.
```

`src/services/`는 두지 않는다. 외부 API를 호출하지 않으므로 감쌀 대상이 없다.

## 데이터 모델

`src/types/content.ts`에 정의한다. 데이터 JSON은 이 타입을 만족해야 한다.

```ts
type Importance = 3 | 2 | 0;          // ★★★ = 3, ★★☆ = 2, 별점 없음(기초) = 0

interface Topic {
  id: string;                          // kebab-case. 예: "s3-storage-classes"
  title: string;                       // "S3 스토리지 클래스 유형"
  importance: Importance;
  sourcePages: [number, number];       // concepts-raw.md 근거 페이지 범위
  concepts: Concept[];
}

interface Concept {
  id: string;                          // 전역 유일. 예: "s3-storage-classes.standard-ia"
  parentId?: string;                   // 딸린 개념만. 같은 주제 안 머리 개념의 id (ADR-041)
  name: string;                        // "S3 Standard-IA"
  summary: string;                     // 한 줄 요약
  paragraphs: string[];                // 설명 본문. 문단 단위 평문. `**강조**`와 백틱 코드 표기를 그린다 (ADR-044)
                                       // `- `로 시작하는 문단은 목록 항목이고, 잇닿은 항목이 목록 하나가 된다 (ADR-046)
}
// concepts 배열의 순서가 학습 순서다: 서비스 블록마다 기본 → 갈림길 → 한계. 아래 절을 봐라.

interface QuestionBase {               // 두 형식이 함께 쓰는 필드
  id: string;                          // "q001"
  topicId: string;
  conceptId: string;                   // 근거 개념. 문항 화면의 개념 펼치기와 복습 집계에 쓴다.
  prompt: string;
  explanation: string;
}

interface ChoiceQuestion extends QuestionBase {
  format?: 'choice';                   // 없으면 4지선다다
  choices: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
}

interface YesNoQuestion extends QuestionBase {
  format: 'yes-no';
  answer: boolean;                     // 예가 정답이면 true
}

type Question = ChoiceQuestion | YesNoQuestion;   // 형식은 format으로 가른다 (ADR-054)
```

**`format`이 없으면 4지선다다.** 그래서 AWS `questions.json`은 형식이 둘이 된 뒤에도 한 글자도 바뀌지 않았다.
AWS의 `questions`(`src/data/aws/index.ts`)는 `ChoiceQuestion[]`이다 — AWS 문항이 모두 4지선다이고 `data.test.ts`가 `choices`·`answerIndex`를 그대로 읽는다.

**시각 요소의 문구는 `src/types/visuals.ts`가 정의한다**(ADR-037). `vpc-networking`을 시작으로 지금은
AWS 주제 11개가 `src/data/aws/visuals/<주제 id>.json`을 가진다. 도식 캡션·비교표 행·약어 뜻풀이가 여기 있고,
각 항목의 `sources`(또는 `sourceConceptId`)가 근거 개념 id를 가리킨다. 좌표와 경로는 도식
컴포넌트에 남는다. phase 38·39의 다른 도식 여덟 장은 문구를 컴포넌트 안에 둔 채다.

**주제 안의 개념 배열은 서비스 블록 순서다.** 근거는 ADR-033이고, ADR-023의 3단 정렬을 개정한 것이다.

1. 서비스별 블록을 먼저 만든다.
2. 각 서비스 블록 안에서 `기본 개념 → 주요 기능/갈림길 → 세부 기능·설정·한계` 순으로 배치한다.
3. 같은 하위 기능에 속한 개념은 가능한 한 연속해서 둔다.
4. 둘 이상의 서비스를 비교하는 개념은 비교 대상 서비스 블록이 모두 나온 뒤에 둔다.
5. 어떤 개념이 다른 개념을 이해의 전제로 삼는다면 전제 개념을 먼저 둔다. 이 규칙은 위 규칙보다
   우선한다.

| 블록 안의 자리 | 무엇 | 예 (`data-transfer-services`의 DataSync 블록) |
|---|---|---|
| 기본 | 그 서비스가 무엇인가 | `data-transfer-services.datasync` |
| 주요 기능·갈림길 | 헷갈리는 것과 무엇으로 갈리는가 | `data-transfer-services.file-gateway-vs-datasync-continuous` |
| 세부 기능·설정·한계 | 한계값·설정·세부 동작 | `data-transfer-services.datasync-manifest` |

서비스가 하나뿐인 주제는 하위 기능을 블록으로 삼는다. 주요 기능에 세부가 딸려 있으면 그 기능을
가운데 층의 끝, 자기 세부 바로 앞에 둔다 — 층 순서(규칙 2)와 연속성(규칙 3)이 함께 지켜진다.
주제마다 어떤 블록을 어떤 순서로 두었는지는 `src/data/aws/data.test.ts`의 주제별 순서 단언이 개념 id
전부로 못박고, 그 주석이 블록과 예외를 적는다.

**`Concept`에 층·블록 필드를 두지 마라.** 순서 자체가 블록과 층이고, 필드를 더하면 배열 순서와
필드가 어긋날 수 있는 두 번째 진실이 생긴다 (ADR-023·ADR-033).

**예외는 `parentId` 하나다 (ADR-041).** 블록 안에서 무엇이 머리이고 무엇이 그 아래 딸린 개념인지는
순서로 알 수 없어서 딸린 개념에만 머리의 id를 적는다. 머리와 홀로 선 개념에는 키를 두지 않는다.
세 규칙을 `src/lib/concept-groups.ts`의 `hierarchyProblems`가 검사하고 `data.test.ts`가 전 주제에 돌린다.

1. `parentId`는 같은 주제에 있는, 자기 자신이 아닌 개념의 id다.
2. 머리에는 `parentId`가 없다(두 단까지만).
3. 딸린 개념은 머리 바로 뒤에 끊김 없이 이어진다.

화면은 같은 파일의 `groupConcepts`로 개념을 머리와 딸린 개념의 무리로 나눠 그린다. 규칙 3을 어긴 개념은
무리에 넣지 않고 평평하게 그린다 — 화면은 깨지지 않고, 테스트가 그 데이터를 잡는다. 개념 순서를 바꿀 때
머리와 딸린 개념이 떨어지면 `data.test.ts`가 실패하므로 `parentId`도 함께 고친다. `parentId`는 구조라서
`scripts/topics-baseline.json`에도 같은 값을 둔다.

개념 순서를 바꾸면 `scripts/topics-baseline.json`의 개념 항목 순서도 같은 커밋에서 옮긴다 —
`scripts/check-structure.mjs`가 순서를 대조하고, `scripts/sync-baseline.mjs`는 순서 변경을 거부한다.

`src/types/progress.ts`:

```ts
interface Progress {
  version: 3;                                  // 스키마 변경 시 올린다
  read: Record<string, boolean>;               // topicId → 개념을 끝까지 읽었는가
  answers: Record<string, boolean>;            // questionId → 마지막 시도가 정답이었는가
  review: Record<string, true>;                // 복습 목록. 사용자가 넣고 뺀다 (ADR-032)
}
```

`answers`와 `review`는 **서로 따라가지 않는다.** `answers`는 마지막 시도만 남기므로 다시 맞히면
`true`로 덮인다. `review`는 채점과 무관하게 문제 화면의 `복습에 넣기` 스위치와 복습 화면의
`지우기`로만 바뀐다 — 틀렸다고 들어오지도, 맞혔다고 빠지지도 않는다. 찍어서 맞힌 것과 익힌 것을
앱이 구분할 수 없으므로 무엇을 복습할지는 사용자가 정한다 (ADR-017·ADR-032).

마이그레이션은 `src/lib/storage.ts` 한 곳에 있고, 한 단계씩 이어 붙인다.

- **v1 → v2**: v1에는 오답노트가 없었다. 그때 틀린 문항(`answers`가 `false`인 것)을 `wrong`의
  씨앗으로 채운다 (ADR-017).
- **v2 → v3**: `wrong`을 **그대로** `review`로 옮긴다. 틀려서 저절로 들어왔더라도 사용자가
  지우지 않고 남겨 둔 목록이다 (ADR-032).

## 라우트

`HashRouter`를 쓴다. 실제 URL은 `.../#/aws/topic/s3-storage-classes` 형태다 (ADR-007).
아래 표의 경로는 해시 뒤의 경로를 뜻한다. 라우트 정의는 `src/App.tsx`의 `AppRoutes` 한 곳이다.

라우트는 **과목 밖**과 **과목 안** 두 가지로 갈린다(ADR-053). 두 가지는 형제이고, 각자 자기 `Layout`을 갖는다.
과목 가지를 과목 밖 `Layout` 라우트의 자식으로 넣으면 헤더가 두 번 그려진다.
과목 가지의 맨 위는 `SubjectScope`다. `:subjectId`로 과목을 찾아 `SubjectContext`로 넘기고, 과목이 바뀌면
`key`로 하위 트리를 다시 마운트한다(ADR-053 「과목이 바뀌면 다시 마운트하는 이유」).

**과목 밖**

| 경로 | 화면 |
|---|---|
| `/` | 과목 목록 — 과목마다 카드 하나(이름, 주제·문항 수) |
| `/topic/*` · `/review/*` · `/search` · `/random/*` · `/keywords` | 예전 주소. `/aws` + 경로 + `?검색어` + `#앵커`로 replace한다 |
| 그 밖 | `/`로 replace |

예전 주소는 과목이 AWS 하나였을 때 만들어진 북마크·공유 링크다. `search`와 `hash`를 그대로 붙여야
검색어와 개념 앵커(ADR-020)가 살아남는다. 예전 주소의 과목은 `App.tsx`의 `LEGACY_SUBJECT_ID` 하나다.

**과목 안** — 모든 경로 앞에 `/:subjectId`가 붙는다. 이 문서의 다른 절에서 `/topic/:topicId`·`/review`·`/random`처럼
접두사 없이 적은 화면 경로는 이 표의 과목 안 경로를 뜻한다. `/` 하나만은 과목 목록이다.

| 경로 | 화면 |
|---|---|
| `/:subjectId` | 주제 목록 (중요도·진행 상태 표시. AWS 과목은 39개) |
| `/:subjectId/topic/:topicId` | 개념 읽기 |
| `/:subjectId/topic/:topicId/quiz` | 확인 문제 |
| `/:subjectId/review` | 복습 — 사용자가 넣은 문항을 주제별로 모아보고 개별 삭제 |
| `/:subjectId/review/quiz` | 복습 문제 풀기 — 복습 목록 전체 |
| `/:subjectId/review/quiz/:topicId` | 복습 문제 풀기 — 그 주제의 복습 문항만 |
| `/:subjectId/random` | 랜덤 문제 시작 — 문항 수(10·20·30·50·100·전체) 선택 |
| `/:subjectId/random/:count` | 랜덤 문제 — 그 과목의 전체 문항에서 뽑은 `count`개. `count`가 `all`이면 그 과목의 문제 은행 전부 |
| `/:subjectId/search` | 개념·주제 검색. 질의는 `?q=`에 담긴다 |
| `/:subjectId/keywords` | 키워드 퀴즈(숨은 화면). 과목의 `hasKeywordQuiz`가 참일 때만 열리고, 아니면 과목 홈(`/:subjectId`)으로 replace한다. 암호 입력 → 모드·단원 선택 → 고른 범위의 키워드 전부를 풀기. 문항 이동은 확인 문제와 같다(정답 재탭·읽기 전용 이전 문제). 링크 없이 로고 연속 탭으로만 들어온다(ADR-040) |
| 그 밖 | 과목 홈(`/:subjectId`)으로 replace |

없는 과목(`/nope`, `/nope/topic/x`)은 `SubjectScope`가 `/`로 replace한다.

**라우트 순위**: `/search` 같은 예전 주소는 정적 경로라 동적 `:subjectId`보다 앞서고, `/aws`는 `:subjectId`가
`*`보다 앞선다. 그래서 과목 id가 예전 주소의 첫 세그먼트와 같으면 그 과목에 들어갈 수 없다 —
`src/data/index.test.ts`가 그 겹침을 막는다.

**검색·랜덤·복습은 과목 안에서만 돈다.** 검색은 그 과목의 주제·개념만, 랜덤은 그 과목의 문항만,
복습은 그 과목의 진행률 키에 저장된 복습 목록만 본다(ADR-053).

### 헤더는 과목 안에서 같다

`Layout`의 헤더는 두 모양뿐이다(ADR-053).

| 어디 | 헤더 |
|---|---|
| 과목 안 | 로고 자리에 과목 이름(→ 과목 홈) + "검색" + "복습" |
| 과목 밖 | 로고 "Study Quiz"(→ `/`)뿐 |

**두 모양을 가르는 근거는 과목 컨텍스트가 있는가 하나다** — `useOptionalSubject()`가 과목을 돌려주는가.
**과목 안에서 어느 화면인지 판별하는 분기를 두지 마라.** `Layout`이 지금 쓰는 라우터 훅은 스크롤 복원용
`useLocation()`·`useNavigationType()`과 로고 연속 탭용 `useNavigate()`뿐이고, `useLocation()`에서 읽는 것은
`key`와 앵커 예외용 `hash` 둘이다(아래 "화면 전환 시 스크롤").

과목 밖 헤더에 "검색"·"복습"이 없는 것은 둘 다 과목 안의 기능이라 과목 목록에서는 갈 곳이 없기 때문이다.
링크 둘 상한(UI_GUIDE "헤더 안의 링크")은 그대로다. 과목 이름은 로고 자리에 들어가고, 과목 안 헤더에
"모든 과목"이나 과목 전환을 더하지 않는다. 첫 화면으로 가는 길은 주제 목록 맨 위의 "모든 과목"이다
(UI_GUIDE "돌아가기").

전에는 확인 문제 화면에서만 "근거 개념" 링크(→ `/topic/:topicId`)를 띄우고 "검색"을
빼는 분기가 있었다. 그 링크가 **문항 화면을 언마운트시켜 진행 위치와 고른 보기를
버리는 것**이 문제였다. ADR-011·012가 문항 순서를 저장하지 않기로 했으므로 돌아와도
1번 문항부터 다시 섞인 세트가 나온다. 확인 문제에서 개념을 보는 길은 화면을 벗어나지
않는 펼치기가 맡는다 — 아래 "확인 문제 화면의 공유 구조".

**되살리려 한다면 두 가지를 먼저 풀어야 한다.** 진행 위치를 어디에 보관할지(ADR-011·012와
아래 "확인 문제 안의 문항 이동"이 금지한다)와, 320px에서 링크 세 개가 로고를 눌러
두 줄로 접는 파손(UI_GUIDE "헤더 안의 링크"의 실측 표)이다.

**로고 연속 탭은 화면 분기가 아니다.** 과목에 키워드 퀴즈가 있으면(`hasKeywordQuiz`) 로고를 1.5초 안에 다섯 번
누를 때 그 과목의 `/keywords`로 간다(ADR-040·ADR-053). 키워드 퀴즈가 없는 과목과 과목 밖에서는 탭을 세지 않고
평소처럼 로고 링크로 간다. 로고의 `onClick`이 탭 시각만 세고, 판정은 `lib/keyword-quiz.ts`의 순수 함수가 한다.
헤더의 모양과 링크는 과목 안 어느 화면에서나 그대로다.

**`useParams()`로 화면을 판별하지 마라.** `Layout`이 path 없는 레이아웃 라우트인데도
`useParams()`는 자식 라우트의 `topicId`를 그대로 돌려준다 — 실제로 확인한 동작이다.
문제는 그 값만으로는 `/topic/:topicId`와 `/topic/:topicId/quiz`를 구분할 수 없다는 것이다.
경로 모양을 알아야 하면 `useMatch('/:subjectId/topic/:topicId/quiz')`를 쓰고,
`useLocation().pathname`을 `endsWith('/quiz')`·`split('/')`로 쪼개지 마라 — 경로 모양이
바뀌면 조용히 어긋난다. 라우트 패턴을 아는 것은 라우터다.

### 화면 전환 시 스크롤

**라우트가 바뀌면 새 화면은 맨 위에서 시작한다. 뒤로/앞으로 가기만 예외다.**

브라우저는 `pushState` 이동에서 스크롤 위치를 그대로 유지한다. 되돌리는 코드가 없으면
목록에서 내린 만큼 그대로 다음 화면에 착지한다. 390×844에서 실측한 값이다.

| 이동 | 클릭 전 scrollY | 이동 후 scrollY | 목적지 최대 scrollY |
|---|---|---|---|
| 목록 → 마지막 카드(절약 플랜) | 1533 | 1533 | 1570 |
| 목록 → 중간 카드(서버리스) | 405 | 405 | 2494 |
| 복습(오답 246개) → 개념 | 18568 | 1570 | 1570 |
| 목록 → 확인 문제 | 1533 | 0 | 0 |

마지막 줄이 0인 것은 그 경로만 멀쩡해서가 아니다. 확인 문제 화면은 문서 높이가 뷰포트를
넘지 않아 브라우저가 스크롤을 0으로 클램프할 뿐이다. 원인은 위 세 줄과 같다.
**목적지 문서가 뷰포트보다 길면 증상이 드러난다.** 개념 화면(2400~3900px)과
복습 화면(오답이 쌓이면 19000px 이상)이 여기 해당한다.

**위 표는 되돌리는 코드가 없던 시절, 주제 20개·개념 182개에서 잰 값이다. 기록으로 그대로
둔다** — 이 표의 유일한 가치는 실측값이라는 것이다. 지금 값은 아래에 따로 있다.

#### 지금 값 — 주제 39개·개념 618개에서 다시 잰 것

2026-09-07에 390×844에서 다시 쟀다. 창 크기에 좌우되지 않도록 **정확히 390×844인 iframe**을
띄워 그 안의 `scrollHeight - innerHeight`를 읽었고, 복습 화면은 원본과 같은 조건을 만들려고
오답 246개를 심었다.

| 화면 | 최대 scrollY | 재편 전 |
|---|---|---|
| 주제 목록(39개) | 3885 | 1533 |
| 개념 `sqs-sns-eventbridge`(33개념 — 가장 긴 주제) | 13222 | 2494 |
| 개념 `efs-fsx`(25개념) | 9666 | — |
| 개념 `aws-core-services`(18개념) | 4342 | — |
| 개념 `ai-ml-services`(6개념 — 가장 짧은 주제) | 2214 | 1570 |
| 확인 문제 | 0 | 0 |
| 복습(오답 246개, 주제 그룹 34개) | 36891 | 18568 |

주제 목록의 3885는 **진행 기록이 없는 상태**다. 카드에 `읽음`·`정답 n/m`·`확인 문제 준비 중`이
붙으면 그만큼 늘어난다 — 몇 개만 읽어도 3941이 됐다. 복습 화면이 문항 수가 그대로인데도
두 배가 된 것은 주제 그룹이 20개에서 34개로 늘고 주제 제목이 길어져 390px에서 줄바꿈이
늘었기 때문이다.

**이 표의 복습 행은 phase 27이 다시 낡게 만들었다.** 문제 은행이 246문항에서 732문항이
됐으므로(ADR-026) 오답을 전부 쌓은 복습 화면과 `/random/all`은 위 값보다 훨씬 길어진다.
**그래도 다시 재기 전에는 새 숫자를 넣지 않는다** — 이 표의 유일한 가치는 실측값이라는 것이다.

**확인 문제 행(0)도 phase 28이 낡게 만들었다.** 그 값이 0인 것은 그 화면만 멀쩡해서가 아니라
문서 높이가 뷰포트를 넘지 않아 브라우저가 클램프했기 때문인데(위 첫 표 아래 설명), phase 28이
`q001`~`q246`의 해설을 평균 126자에서 434자로 다시 써서 정답 확인 영역이 길어졌다(ADR-027).
지금은 해설이 펼쳐진 상태에서 스크롤이 생길 수 있다. **여기서도 새 숫자를 넣지 않는다** —
재려면 390×844 브라우저가 필요하고, 이 표의 유일한 가치는 실측값이라는 것이다.

**리셋은 새 크기에서도 동작한다.** 클릭 이동은 전부 0에 착지하고, 뒤로 가기만 예외로 살아난다.

| 이동(실제 클릭) | 클릭 전 scrollY | 이동 후 scrollY | 목적지 최대 scrollY |
|---|---|---|---|
| 목록 맨 아래 → 마지막 카드(`ai-ml-services`) | 3941 | **0** | 2214 |
| 목록 맨 아래 → 중간 카드(`sqs-sns-eventbridge`) | 3941 | **0** | 13222 |
| 복습 맨 아래 → 개념 | 36891 | **0** | 13222 |
| 개념 맨 아래 → 확인 문제 | 4342 | **0** | 0 |
| 개념 → 뒤로 가기 → 목록 | 3969 | — | **3969 복원** |

**다시 잴 때 주의 — `location.hash` 대입으로는 리셋을 확인할 수 없다.** react-router가 해시
변경을 POP으로 읽어 아래 "뒤로/앞으로" 규칙에 걸린다. 그렇게 재면 목록 맨 아래(3941)에서
개념으로 옮겼을 때 0이 아니라 2214(목적지 최대로 클램프된 값)가 나온다. **앵커를 `click()`
해야 PUSH가 되고 리셋이 걸린다.** 높이만 재는 데는 해시 대입이면 충분하다.

**다시 재기 전에는 새 숫자를 표에 넣지 마라.**

`react-router-dom` 6의 `<ScrollRestoration>`은 data router 전용이라 쓸 수 없다.
`HashRouter` + `<Routes>` 구조는 ADR-007에서 정한 것이고 바꾸지 않는다.
`Layout`이 네비게이션 타입을 보고 직접 처리한다.

| 네비게이션 타입 | 동작 | 이유 |
|---|---|---|
| `PUSH` / `REPLACE` | `window.scrollTo(0, 0)` | 링크로 새 화면에 들어온 것이다. 맨 위에서 시작해야 한다. |
| `PUSH` / `REPLACE` + 해시 | 아무것도 하지 않는다 | 목적지가 시작 위치를 스스로 지정했다. 그 화면이 스크롤 주인이다(ADR-020). |
| `POP` | 아무것도 하지 않는다 | 뒤로/앞으로 가기다. 브라우저 기본 복원에 맡긴다. |

**해시가 붙은 이동에서 `Layout`이 물러나는 것이 핵심이다.** React는 자식 effect를 부모보다
먼저 실행하므로, 목적지 화면에서 앵커로 옮겨도 직후에 `Layout`의 `scrollTo(0, 0)`이 덮어쓴다.
페이지 쪽에만 코드를 넣으면 동작하지 않는다. `setTimeout`·`requestAnimationFrame`으로 순서를
비껴가지 마라 — 두 주인이 경쟁하는 구조가 남고 실패가 타이밍에 따라 갈린다.

**`POP`에서 스크롤을 건드리지 마라.** 목록을 2069px까지 내린 뒤 개념에 들어갔다가 뒤로 가면
지금은 2069px가 그대로 복원된다. 이 동작은 이미 잘 돌아간다.
`useEffect(() => window.scrollTo(0, 0), [pathname])`처럼 타입을 보지 않는 코드를 넣으면 깨진다.

**`history.scrollRestoration`을 `'manual'`로 바꾸지 마라.** 위의 복원이 브라우저 기본값
`'auto'`에 기대고 있다.

**스크롤 방향을 읽는 코드는 들어온 직후의 첫 스크롤을 건너뛰어야 한다.** 위 표의 세 동작
(맨 위로·앵커·복원)은 모두 착지 직후 `scroll` 이벤트를 하나 낸다. 사용자가 움직인 것이 아니다.
개념 읽기 하단 바(640px 미만에서 내릴 때 숨김, ADR-052)가 첫 이벤트를 기준점으로만 쓰는 이유다.
건너뛰지 않으면 뒤로 가기로 돌아올 때 복원(0 → 1800)을 내림으로 읽어 바가 숨은 채 시작한다.

화면 전환은 즉시 일어난다. `behavior: 'smooth'`를 쓰지 마라 — UI_GUIDE "애니메이션" 절이
페이지 전환 애니메이션을 금지한다.

### 주제 간 이동

**주제 목록을 거치지 않고 앞뒤 주제로 넘어갈 수 있어야 한다.** 한 주제를 다 읽었을 때
주제 목록(`/:subjectId`)으로 돌아갔다가 다음 카드를 누르는 것이 유일한 경로여서는 안 된다.

순서는 `topics.json` 배열 순서다. 그 순서가 학습 순서이고, 별도의 `order` 필드를 두지 않는다.
`Topic`에 `prevId`·`nextId` 같은 필드를 추가하지 마라 — 배열에서 유도되는 값을
데이터에 중복 저장하면 순서를 바꿀 때 두 곳을 고쳐야 한다.

인접 주제 계산은 `src/lib/navigation.ts`의 `adjacentTopics(topics, topicId)` 하나로 모은다.
개념 읽기와 확인 문제 완료 화면 두 곳에서 쓴다. 화면 안에서 `findIndex`를 각자 부르지 마라.

| 지점 | 이동 수단 |
|---|---|
| 개념 읽기 (`/topic/:topicId`) | 하단 고정 바 좌우의 화살표. UI_GUIDE "바 안의 3분할" 절 |
| 확인 문제 완료 (`/topic/:topicId/quiz`) | `다음 주제 이어가기` 링크 |

**첫 주제에 이전이 없고 마지막 주제에 다음이 없다.** 순환시키지 마라 — 39번째에서
1번째로 돌아가면 어디까지 읽었는지 알 수 없다.

### 문항과 보기의 순서

**확인 문제를 열 때마다 문항 순서와 각 4지선다 문항의 보기 순서를 섞는다.** `questions.json`의
배열 순서는 저장 순서일 뿐 출제 순서가 아니다. 근거는 ADR-011.

섞기는 `src/lib/shuffle.ts` 한 곳에 모은다. React에 의존하지 않고, **난수는 인자로 받는다** —
화면이나 라이브러리 안쪽에서 `Math.random`을 직접 부르는 지점이 흩어지면 안 된다.
이유: 이 계층은 DOM 없이 테스트하고, 난수를 주입해야 섞인 결과를 단언할 수 있다.

보기를 섞는 함수(`shuffleChoices`)는 **`choices`를 재배열하고 `answerIndex`를 그 보기가 옮겨 간 위치로 갱신한
새 `ChoiceQuestion`을 돌려준다.** 원본 인덱스 매핑을 따로 들고 다니지 마라 —
`isCorrect(question, choiceIndex)`가 그대로 맞고, 화면은 자기가 받은 문항만 보면 된다.
섞는다고 문항의 타입이 달라지거나 채점이 섞기를 알아야 하는 일은 없다.

**보기 섞기는 4지선다에만 걸린다.** 예/아니요 문항은 그대로 돌려주고 난수도 쓰지 않는다 —
버튼은 늘 「예」 다음 「아니요」다(ADR-054). 문항 순서는 두 형식이 함께 섞인다.

**섞은 결과는 화면에 머무는 동안 고정이다.** 렌더할 때마다 다시 섞으면 보기를 누르는 순간
자리가 바뀐다. `QuizPage`는 주제가 바뀔 때만 다시 섞고 그 사이에는 같은 배열을 쓴다.
섞기 함수를 컴포넌트 **안에서** 만들면 참조가 매 렌더 달라져 이 고정이 깨진다 —
기본값은 모듈 최상위에 둔다.

`selections`가 인덱스 기반인 것은 그대로다(아래 절). 섞인 배열도 배열이다.

### 확인 문제 안의 문항 이동

**푼 문항으로 되돌아갈 수 있다.** 문제와 해설을 다시 읽는 용도이고, 답을 고쳐 쓰는
수단이 아니다. 화면 구성과 조작 규칙은 UI_GUIDE "보기 버튼 > 문항 사이 이동"에 있다.

이 상태는 **화면 안 일시 상태다. localStorage에 넣지 마라.** `Progress`에 남는 것은
`answers[questionId]`의 정오답 boolean과 `review`의 복습 목록 등재 여부뿐이고, 어느 보기를
골랐는지는 저장하지 않는다.
새로고침하면 그 주제의 확인 문제는 처음부터 다시 시작한다. 이유: 되돌아보기는 푸는 동안의
편의다. 이걸 남기려면 `Progress`의 `version`을 올리고 기존 저장분 마이그레이션까지 붙어야
하는데, 얻는 것에 비해 비싸다. 다시 볼 문항은 `복습에 넣기`로 `/review`에 영구히 남길 수 있다.

`QuizPage`는 문항별 선택을 **배열 하나로 들고 있는다.**

```ts
const [selections, setSelections] = useState<(number | null)[]>(...)   // 길이 = 그 주제의 문항 수
```

- 아직 풀지 않은 문항은 `null`이다. 정답 공개 여부는 **`selections[questionIndex] !== null`로
  판별한다.** 별도의 boolean state를 두지 마라 — 되돌아가는 순간 둘이 어긋난다.
- **맞힌 개수는 `selections`에서 계산한다.** 세지 말고 유도해라. 증감 카운터를 따로 들면
  같은 문항을 다시 지나는 경로에서 이중 계산이 난다.
- 문항별 상태를 `Record<questionId, ...>`로 만들지 마라. 이동이 인덱스 기반이므로 배열이
  그대로 맞고, 순서를 다시 계산할 필요가 없다.

### 전체 범위 랜덤 세트

**주제와 무관하게 전체 문항에서 N개를 뽑아 푸는 경로가 있다.** 근거는 ADR-012.
세트는 `shuffleQuestions(questions, Math.random)`의 결과를 앞에서 `count`개 자른 것이다.
가중치도 주제별 배분도 없다. 이 규칙을 바꾸지 마라.

문항 수는 **10 · 20 · 30 · 50 · 100과 전체**이고 `/random/:count`의 URL 세그먼트로 들어온다.
허용값과 파싱은 `src/lib/random-quiz.ts` 한 곳에 있다. 시작 화면은 그 상수로 버튼을 그리고,
퀴즈 화면은 같은 파일의 파서로 검증한다. 허용값 밖이면 `/random`으로 `replace` 이동한다.
**두 화면이 각자 `[10, 20, 30, 50, 100]`을 적지 마라** — 한쪽만 고치면 버튼은 있는데 열리지
않는 값이 생긴다.

전체는 **숫자가 아니라 `all` 세그먼트다** (ADR-018). `parseQuizCount`가 `all`을 받으면 넘겨받은
문제 은행 크기를 그대로 돌려준다. 숫자 허용값에 그때의 은행 크기를 넣지 마라 — 문항이 늘어나는
순간 그 숫자가 "전체"를 뜻하지 않게 된다. **실제로 그렇게 됐다**: ADR-018을 쓸 때 246문항이던
AWS 은행이 지금 746문항이므로(ADR-026), 그때 `246`을 허용값에 넣었다면 `/random/246` 북마크는
지금 조용히 3분의 1만 내고 있었을 것이다.

### 확인 문제 화면의 공유 구조

주제별 확인 문제와 랜덤 문제는 **문항을 푸는 부분이 완전히 같다.** 진행 표시, 보기(4지선다 넷,
예/아니요 둘), 정오 표시, 해설, 이전 문항 이동, 정답 재탭으로 넘어가기까지 전부 같다.
그 부분을 `src/components/QuizRunner.tsx` 하나에 두고 두 페이지가 함께 쓴다.

| 담당 | 무엇 |
|---|---|
| `QuizRunner` | 문항 진행 상태(`questionIndex`·`selections`·`complete`)와 문항 화면 전체 |
| 각 페이지 | 세트를 어떻게 고르는가, 다 푼 뒤 어디로 보내는가 |

- **세트는 이미 섞인 채로 `QuizRunner`에 들어온다.** 섞는 것도 자르는 것도 페이지의 몫이다.
  `QuizRunner` 안에서 `Math.random`을 부르지 마라.
- **완료 화면은 페이지가 준다.** 주제 퀴즈는 "다음 주제 이어가기"가 있고 랜덤은 없다.
  `QuizRunner`에 `mode`나 `isRandom` 같은 플래그를 넣지 마라 — 분기가 늘어나는 만큼
  두 화면이 서로의 회귀를 만든다.
- **예/아니요도 같은 `QuizRunner`가 그린다.** 형식은 페이지가 아니라 문항(`question.format`)이 정하고,
  갈리는 것은 버튼 묶음의 배치(예/아니요는 가로 두 칸)와 글자 정렬뿐이다. 채점과 버튼 문구는
  `grading.ts`에서 온다. 예/아니요 전용 화면을 만들지 마라 — 정답 재탭·복습에 넣기·개념 펼치기·
  이전 문항이 두 벌로 갈라진다(ADR-054).
- **개념은 화면 안에서 펼친다.** 보기 아래의 토글이 `question.topicId`가 가리키는
  **주제 전체**를 그 자리에 편다. 라우트의 `topicId`를 보지 않으므로 랜덤 세트에서 문항마다
  주제가 달라도 같은 규칙이 그대로 맞는다. 화면 구성과 조작 규칙은
  UI_GUIDE "보기 버튼 > 개념 펼치기"에 있다.
- **본문 렌더는 `src/components/ConceptList.tsx` 하나다.** 개념 읽기 화면과 이 펼치기가
  함께 쓴다. 제목 레벨만 `headingLevel`로 가른다(개념 읽기는 h2, 펼치기는 h4 — 펼치기 쪽은
  위에 h1 "확인 문제"·h2 문제문·h3 주제 제목이 이미 있다). **두 곳에 같은 마크업을 두지 마라** —
  갈라지면 같은 개념이 화면에 따라 다르게 보인다.
- **개념 읽기 화면으로 내보내는 링크를 다시 만들지 마라.** 라우트를 옮기면 `QuizRunner`가
  언마운트되어 `questionIndex`·`selections`가 사라지고, 돌아와도 페이지가 세트를 다시 섞는다.
  나가지 않는 것이 위치를 지키는 유일한 방법이다.
- 개념 조회에 필요한 `topics`와 약어 툴팁의 뜻풀이(`visualsByTopicId`)는 `QuizRunner`가 `useSubject()`에서
  직접 받는다(`topics`는 테스트용 prop override가 있다).
  **두 페이지에 `topics` 배선을 새로 깔지 마라** — 세트 선택과 무관한 값이고 두 화면이 같다.
- **펼친 상태는 문항 인덱스 하나로 들고 있는다**(`openConceptIndex`). boolean을 따로 두면
  문항을 옮기는 두 경로에서 각각 닫아 줘야 하고, 한 곳만 빠뜨리면 다음 문항에 앞 문항의
  개념이 펼쳐진 채로 남는다.
- 빈 세트를 `QuizRunner`에 넘기지 마라. "아직 확인 문제가 없습니다" 같은 안내는
  세트를 만든 페이지가 처리한다.

### 개념·주제 검색

**개념 640개는 주제 제목만으로는 찾을 수 없다.** AWS 과목의 39개 주제 제목이 대표 서비스만
이어 붙인 형태라서다. 검색 화면(`/search`)이 그 경로를 맡는다. 근거는 ADR-013.
검색 대상은 지금 과목의 `topics`뿐이다 — 다른 과목의 개념은 결과에 나오지 않는다(ADR-053).

매칭 규칙은 `src/lib/search.ts` **한 곳에 모으고 React에 의존하지 않게 짠다.** 화면은
질의 문자열을 넘기고 결과 배열을 받는 것 외에 아무 판단도 하지 않는다.
이유: 이 계층은 DOM 없이 테스트한다.

| 항목 | 규칙 |
|---|---|
| 대상 | 개념 이름 · 한 줄 요약 · 개념 본문 · 주제 제목 |
| 제외 | **`questions.json`** — 문제문·해설이 결과에 뜨면 확인 문제가 무의미해진다 |
| 매칭 | 질의를 공백으로 쪼갠 **모든** 토큰이 들어 있어야 한다. 대소문자 무시, `**강조**`·백틱(코드 표기, ADR-044) 마커 제거 후 비교 |
| 순위 | 개념 이름 → 주제 제목 → 한 줄 요약 → 개념 본문. 같은 항목은 가장 앞선 필드 하나로만 센다 |
| 표시 | 이름·요약·주제 제목에 걸린 히트를 먼저 그리고 **본문에만 걸린 히트는 접는다** (ADR-024). 자르지 않는다 |
| 목적지 | 개념 히트는 `/topic/:topicId#:conceptId`, 주제 히트는 `/topic/:topicId` (ADR-020) |

**본문 히트를 가르는 것도 `search.ts`가 한다.** `splitBodyOnly(hits, query)`가
`{ primary, bodyOnly }`를 돌려주고, 화면은 어느 쪽을 접을지가 아니라 **펼쳤는지만** 판단한다.
`primary`가 비면 접지 않는다 — 남길 것이 없는데 접으면 결과가 없는 것처럼 보인다.
펼친 상태는 **질의 문자열로 들고 있어서**(`openedFor === query`) 질의가 바뀌면 저절로 닫힌다.
`useEffect`로 닫지 마라.

**개념 히트는 그 개념 위치로 보낸다(ADR-020).** 링크에 `#:conceptId`를 붙이고,
`ConceptReadPage`가 해시를 읽어 `scrollIntoView`로 옮긴다. 위 "화면 전환 시 스크롤"의
앵커 예외가 이것을 위해 있다. 구현 제약 셋을 지켜야 한다.

- 개념 id는 `aws-core-services.ec2`처럼 **점을 품는다.** `querySelector('#'+id)`는 점을
  클래스 구분자로 읽어 아무것도 못 찾는다. **`getElementById`를 써라.**
- 헤더가 `sticky top-0`(약 77px)이다. 개념마다 `scroll-mt-24`가 없으면 제목이 헤더에 깔린다.
- **`behavior: 'smooth'`를 쓰지 마라.** UI_GUIDE "애니메이션"이 화면 전환 애니메이션을 금지한다.

**주제 히트에는 앵커를 붙이지 마라.** 지목할 개념이 없어 첫 개념을 임의로 고르는 셈이 된다.
**개념을 지목하는 색·테두리 강조도 넣지 마라** — 색은 정답/오답/중요도에만 쓴다.
결과 카드가 개념의 한 줄 요약을 함께 보여주는 것은 그대로다.

**질의는 URL의 `?q=`에 둔다.** `useState`가 아니라 `useSearchParams`이며, 타이핑 중에는
`replace: true`로 갱신한다. 이유: 결과에서 개념으로 들어갔다가 뒤로 오면 질의가 남아 있어야
한다. `replace`가 아니면 글자 수만큼 히스토리가 쌓여 뒤로 가기가 한 글자씩 되감긴다.

**검색 화면에서 나가는 길은 `navigate(-1)`이다.** 헤더가 아니라 화면 안에 둔다 — 자리는
UI_GUIDE "돌아가기"에 있다. 새 탭이나 공유 링크로 이 화면을 직접 열었으면 돌아갈 앱 화면이
없으므로 그 과목의 주제 목록(과목 홈 `/:subjectId`)으로 보낸다. 판별은 `useLocation().key === 'default'`이고,
**그 값을 `useState` 초기화로 진입 시점에 한 번만 붙잡는다.** 렌더마다 다시 읽으면 안 된다 —
위의 `replace`가 글자를 칠 때마다 새 키를 만들어, 직접 연 화면도 "돌아갈 곳이 있다"로
뒤집힌다. 그 상태의 `navigate(-1)`은 앱 밖으로 나간다.

이 판별은 `src/components/BackButton.tsx` 한 곳에 있고 **복습 화면(`/review`)이 같은 것을
쓴다.** 두 화면이 같은 이유로 막히기 때문이다 — 헤더 링크로 들어오면 그 링크가 자기 자신을
가리킨다. 화면마다 복사하지 마라. 지금 `replace`를 쓰는 것은 검색뿐이지만, 복사본이 생기면
그 함정을 아는 주석과 모르는 사본이 갈린다.

**최근 검색어를 저장하지 마라.** 검색은 아무 상태도 남기지 않는다 —
`localStorage`에 닿는 순간 `Progress` 스키마 밖의 저장 형식이 하나 더 생긴다.

## 데이터 흐름

```
docs/source/concepts-raw.md          (AWS 과목 원본 PDF 추출본, gitignore — 로컬에만 둔다. ADR-009)
        │
        │  빌드 전 1회. harness step에서 사람이 검수하며 생성한다.
        │  앱 런타임이나 npm 스크립트에서 자동 생성하지 않는다.
        ▼
src/data/aws/topics.json, src/data/aws/questions.json   (커밋됨)
        │
        │  import — 번들에 정적 포함. fetch 없음.
        ▼
src/data/aws/index.ts (awsSubject)  ──▶  src/data/index.ts (subjects)
        │
        │  SubjectScope가 URL의 :subjectId로 과목을 골라 SubjectContext로 넘긴다
        ▼
pages/*  ──읽기──▶  lib/storage.ts  ──▶  localStorage (키 = 과목의 progressKey)
        ◀──상태──
```

과목의 원본은 과목마다 따로 둔다. AWS 원본은 `docs/source/`에 있고, 다음 과목의 원본은
`docs/source/<과목>/`에 둔다(ADR-053).
네트워크 과목도 같은 흐름이다 — 원본은 `docs/source/network/raw/`(강의·면접 추출본, gitignore)이고,
데이터는 `src/data/network/topics.json`·`questions.json`, 과목 객체는 `src/data/network/index.ts`의 `networkSubject`다(ADR-055).

핵심: **런타임에 네트워크를 타는 경로가 하나도 없다.** 새 코드가 `fetch`를
쓰고 있다면 설계에서 벗어난 것이다.

## 상태 관리

- 학습 데이터: import한 상수. 불변. 전역 상태 라이브러리를 쓰지 않는다. 화면과 공용 컴포넌트는
  지금 과목의 데이터를 `useSubject()`에서 읽는다(테스트에서는 props로 덮어쓸 수 있다). `useSubject()`는
  `SubjectScope` 밖에서 부르면 예외를 던진다 — 과목 없이 렌더된 화면은 라우트 배선 실수다.
- 진행 상태: `lib/storage.ts`의 `loadProgress(key)`·`saveProgress(key, progress)`가 localStorage를 읽고 쓴다.
  키는 과목의 `progressKey`다. 화면에서는 `useProgress` 훅으로 접근하고, 훅이 `useSubject()`에서 키를 읽는다.
  과목마다 키가 달라 진행률과 복습 목록이 서로 닿지 않는다. AWS의 키는 과목을 나누기 전과 같은
  `'aws-quiz.progress'`다(ADR-053).
- 화면 내 일시 상태(선택한 보기, 정답 공개 여부 등): `useState`. 그 이상 필요 없다.
- 키워드 퀴즈: 복호화한 키워드와 결과는 `KeywordQuizPage`의 `useState`에만 둔다. **어떤 저장소에도 쓰지 않는다**(ADR-040).
  화면을 벗어나면 사라지므로 다시 들어오면 암호를 또 입력한다.

`lib/`는 localStorage에 직접 접근하는 유일한 계층이다. 컴포넌트에서
`localStorage`를 직접 부르지 마라. 이유: 저장소 접근을 DOM 없이 테스트하기 위해서다.

## 테스트 경계

| 대상 | 방식 |
|---|---|
| `lib/*` (채점·진행률·저장소) | Vitest 단위 테스트. DOM 불필요. |
| `src/data/aws/*.json` | `src/data/aws/data.test.ts`의 스키마 검증 테스트 — 타입 일치, id 유일성, `conceptId` 참조 무결성, `answerIndex` 범위, **개념 커버리지 100%**(개념 640개가 모두 문항 하나 이상을 갖는가), 문항 id의 연속성 |
| `src/data/network/*.json`·`visuals/` | `src/data/network/data.test.ts` — 주제·개념 id 유일, 개념 id는 `<주제 id>.<슬러그>`, 문항 id `n001`부터 연속, 모든 문항의 `format`과 형식별 필드, 4지선다도 문제문이 물음표로 끝남, **개념 커버리지 100%**, 해설 187자 이상, `importance` 0, `sourcePages`는 강의 통합본 1~502, `parentId`·목록 항목 규칙, 굵은 글씨는 목록 항목 안에만. `visuals.test.ts` — `sources`가 실제 네트워크 개념 id, 표 열 셋 이하, 시나리오 id 유일, `glossary`는 비움 (ADR-055) |
| `src/data/index.ts` (과목 목록) | `src/data/index.test.ts` — 과목 id 유일, 과목 id가 예전 주소의 첫 세그먼트와 겹치지 않음, 주제·개념 id가 과목을 넘어 유일, `progressKey` 유일 (ADR-053), 모든 과목의 예/아니요 문항 — 물음표로 끝남, 「항상」「절대」 없음, 예·아니요 대략 반반 (ADR-054) |
| `pages/`, `components/` | @testing-library/react. 사용자 관점 동작만. |
| `lib/keyword-crypto.ts` | `@vitest-environment node`. jsdom에는 `crypto.subtle`이 없다. 화면 테스트에서는 이 모듈을 mock한다. |
| `components/diagrams/*` | @testing-library/react + 좌표 단언. 시나리오 동작에 더해 **viewBox 넘침과 라벨 넘침을 `src/lib/svg-bounds.ts`로 기계 검사**한다. 브라우저가 없는 환경에서 레이아웃 회귀를 잡는 유일한 장치다. 도식마다 `matchMedia`를 모의해 가로형에도 같은 관문을 건다(ADR-047·ADR-048). |
