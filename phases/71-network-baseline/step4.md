# Step 4: importance-invariant

## 배경

ADR-059(step 3)가 네트워크 과목의 별점을 정했다 — 주제 단위로, 네트워크관리사 2급 기출 11회 가운데 **출제 회차 9 이상 3(★★★), 6~8은 2(★★☆), 5 이하 0**.
값은 `docs/source/network/topic-map.md`(step 2)가 갖는다. 그리고 강의 밖 주제의 `sourcePages`는 `[0, 0]`, 강의 주제는 통합본 1~502 안이다.

지금 `src/data/network/data.test.ts`는 ADR-055의 옛 규칙을 지킨다 — 「모든 주제의 importance가 0이다(별점 없음)」, 「모든 주제의 sourcePages가 1~502 안」.
**이 step은 그 두 불변식을 ADR-059대로 바꾸고, 앱에 있는 1장 두 주제에 별점을 매긴다.**
화면 코드(`TopicListPage`·`ConceptReadPage`)는 이미 `importance` 3·2를 ★★★·★★☆로 그리므로 바꾸지 않는다.

## 읽어야 할 파일

- `phases/71-network-baseline/index.json`의 step 2·3 `summary` — 주제 42개의 `id 문항/회차 별점`
- `docs/source/network/topic-map.md`, `docs/ADR.md`의 **ADR-059**, **ADR-026**, **ADR-055** 「데이터 규칙」
- `src/data/network/data.test.ts`, `src/data/network/index.ts`, `src/data/network/topics.json`
- `src/types/content.ts`(`Importance = 3 | 2 | 0`)
- `src/data/CLAUDE.md`의 「네트워크 과목 데이터」, `docs/ARCHITECTURE.md`의 데이터 가드레일 표(네트워크 행)
- `src/pages/TopicListPage.tsx`·`ConceptReadPage.tsx`와 그 테스트, 네트워크 과목을 렌더하는 테스트(`src/App.test.tsx` 등) — 네트워크 별점이 없다고 가정한 단언이 있는지

## 작업

TDD로 한다 — 테스트를 먼저 바꿔 지금 데이터에서 실패하는 것을 본 뒤, 데이터를 고쳐 통과시킨다.

### 1. 불변식 — `src/data/network/data.test.ts`

- **주제 지도 표를 테스트 안의 상수로 둔다.** 42개 주제 각각의 출제 회차(0~11)와 강의 주제인지를 담는다. 꼴은 자유지만 한눈에 `topic-map.md`와 대조되게 쓴다. 예:

  ```ts
  // docs/source/network/topic-map.md의 표와 같은 값이다(ADR-059). 지도를 바꾸면 이 표도 함께 바꾼다.
  const topicMap: Record<string, { examSessions: number; lecture: boolean }> = { ... }
  ```

- 「importance가 0이다」 테스트를 지우고 다음으로 바꾼다.
  - **앱의 모든 네트워크 주제가 주제 지도에 있다.** 없는 주제 id는 위반이다 — 지도에 없는 주제가 몰래 들어오지 못하게(범위는 ADR-059가 정한다).
  - **별점이 출제 회차에서 계산한 값과 같다.** 9 이상 3, 6~8은 2, 5 이하 0. 계산하는 작은 함수를 테스트 안에 두고, 위반은 `id: 실제 → 기대` 꼴로 모아 `toEqual([])`.
- `sourcePages` 테스트를 바꾼다.
  - 강의 주제(`lecture: true`)는 지금처럼 1~502 안의 [시작, 끝].
  - 강의 밖 주제(`lecture: false`)는 `[0, 0]`.
- 표 자체의 검산 테스트 하나: 주제 42개, 회차는 0~11 정수, 강의 주제 22개.
- 테스트 이름은 기존처럼 한국어 문장으로. 머리 주석의 「자격증 목표가 정해지지 않아 …」는 ADR-059로 바꾼다.

### 2. 데이터 — `src/data/network/topics.json`

- `protocols-encapsulation`의 `importance` 0 → **3**, `network-basics` 0 → **2**. 다른 필드는 그대로.
- (주제 지도의 회차가 step 2 summary와 다르면 멈추고 error로 보고한다 — 값을 맞추려고 표를 고치지 마라.)

### 3. 화면 테스트

- 네트워크 주제에 별점이 없다고 가정한 테스트가 있으면 새 값에 맞게 고친다. 화면 코드는 바꾸지 않는다.
- 네트워크 주제 목록과 개념 읽기 머리에 ★★★·★★☆가 실제로 그려지는지를 기존 테스트가 보지 않으면, 네트워크 과목으로 렌더해 두 별점이 보이는 단언을 하나 더한다(기존 테스트 파일의 짜임을 따라).

### 4. 문서 — 한 줄씩

- `src/data/CLAUDE.md` 「네트워크 과목 데이터」의 「`importance`는 모두 0(별점 없음), `sourcePages`는 강의 통합본 쪽 1~502 안」을 새 규칙으로(주제 지도 표, ADR-059).
- `docs/ARCHITECTURE.md` 데이터 가드레일 표의 네트워크 행에서 「`importance` 0」, 「`sourcePages`는 강의 통합본 1~502」를 새 규칙으로.

### 5. 위반 확인 — 커밋하지 않는다

- `network-basics`의 `importance`를 잠시 3으로 바꾸고 별점 테스트가 그 주제 하나만 보고하며 실패하는지 본다. 되돌린다.
- 지도에 없는 주제 id(예: `topics.json`의 한 주제 id를 잠시 바꿈)로 「지도에 있다」 테스트가 실패하는지 본다. 되돌린다.
- `git diff`로 임시 변경이 남지 않았는지 확인한다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node scripts/check-verbatim.mjs --subject network
node -e "const t=require('./src/data/network/topics.json');console.log(t.map(x=>x.id+':'+x.importance+':'+JSON.stringify(x.sourcePages)).join(' '))"
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. `protocols-encapsulation:3`, `network-basics:2`, 두 주제의 `sourcePages`는 그대로.
2. 테스트 안의 주제 지도 표 42개를 `topic-map.md` 표와 하나씩 대조한다(id·회차·강의 여부).
3. 「위반 확인」 두 가지가 실패했고 되돌렸는지 본다.
4. 바뀐 파일이 `data.test.ts`, `topics.json`, (필요했다면) 화면 테스트, `src/data/CLAUDE.md`, `docs/ARCHITECTURE.md`, phase 메타데이터뿐인지 본다. 화면 코드(`src/pages/*.tsx`)·타입·AWS 데이터는 그대로다.
5. `phases/71-network-baseline/index.json`의 step 4를 갱신한다.
   - 성공 → `"summary"`에 바꾼·더한 테스트 이름, 표 검산 결과, 두 주제의 새 별점, 고친 화면 테스트(있으면), 위반 확인 결과, 전체 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **`Importance` 타입과 화면 코드를 바꾸지 마라.** 이유: 3·2·0과 그 표시는 AWS와 같고, 이미 네트워크에도 그대로 쓰인다.
- **테스트에 예외 목록을 두거나 별점 계산을 주제마다 손으로 덮어쓰지 마라.** 이유: 별점은 회차에서 계산되는 값이다(ADR-059). 예외가 생기면 규칙이 아니라 목록이 된다.
- **주제 지도에 없는 주제를 `topics.json`에 더하지 마라. 새 주제의 내용을 만들지 마라.** 이유: 새 주제는 다음 phase들의 일이다.
- **`sourcePages`를 옵션 필드로 바꾸지 마라.** 이유: 타입은 AWS와 같이 쓴다. 강의 밖 주제는 `[0, 0]`으로 표시한다(ADR-059).
- AWS 데이터와 AWS 테스트의 단언을 바꾸지 마라. 기존 테스트를 깨뜨리지 마라.
