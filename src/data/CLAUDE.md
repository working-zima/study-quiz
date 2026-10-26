# src/data/

빌드 타임 정적 학습 데이터다. **과목마다 폴더 하나**를 둔다(ADR-053).

```
src/data/
├── index.ts        # 과목 목록 subjects — 앱에 어떤 과목이 있는지 여기서 정한다
├── index.test.ts   # 과목 불변식
└── aws/            # AWS 과목. topics.json·questions.json·visuals/·keywords.enc.json과
                    # 과목 객체 awsSubject를 export하는 index.ts
```

- 루트 CRITICAL 그대로다 — 데이터는 import로 번들에 들어가고 `fetch`로 읽지 않는다. 데이터는 빌드 전에 harness step에서
  사람이 검수하며 만들고, 앱 런타임이나 npm 스크립트에서 자동 생성하지 않는다(ARCHITECTURE 「데이터 흐름」).
- 타입은 `src/types/`(`content.ts`·`subject.ts`·`visuals.ts`)에만 있고 JSON은 그 타입을 만족해야 한다(ARCHITECTURE 「데이터 모델」).
- 사실의 근거와 쓰는 법은 `docs/source/CLAUDE.md`에 있다. 사실만 가져오고 문장은 직접 쓴다(ADR-009).

## 과목을 더할 때

- `src/data/<과목 id>/`에 데이터와 과목 객체를 export하는 `index.ts`를 두고 `subjects`에 더한다(ADR-053).
- `index.test.ts`가 지키는 불변식: 과목 id가 서로 겹치지 않고 예전 주소의 첫 세그먼트(`topic`·`review`·`search`·`random`·`keywords`)와도
  겹치지 않는다, 주제·개념 id가 과목을 넘어 유일하다, `progressKey`가 서로 겹치지 않는다. 이유는 ADR-053 「불변식」에 있다.
  주제·개념 id는 AWS가 쓴 것을 피해야 한다(ADR-053 「트레이드오프」).
- AWS의 `progressKey`(`'aws-quiz.progress'`)는 과목을 나누기 전과 같은 키다. 지금 사용자의 학습 기록이 여기 있다(ADR-053).

## AWS 과목 데이터

- `aws/data.test.ts`가 스키마·id 유일성·`conceptId` 참조·개념 커버리지 100%·문항 id 연속성을 단언한다(ARCHITECTURE 「테스트 경계」).
  커버리지에 예외 목록을 만들어 통과시키지 마라(ADR-026).
- 주제 안 개념 배열의 순서가 학습 순서이고, `parentId`가 머리와 딸린 개념을 잇는다(ARCHITECTURE 「데이터 모델」, ADR-033·ADR-041).
- 개념 순서나 `parentId`를 바꾸면 `scripts/topics-baseline.json`도 같은 커밋에서 고친다. 대조는 `scripts/check-structure.mjs`가 한다(ARCHITECTURE 「데이터 모델」).
  커버리지는 `scripts/coverage.mjs`, 전사 검사는 `scripts/check-verbatim.mjs`다. 쓰임은 `scripts/CLAUDE.md`와 각 스크립트 머리 주석.
- 도식·비교표·약어의 문구는 `aws/visuals/<주제 id>.json`에, 좌표는 도식 컴포넌트에 둔다(ADR-037).
- `aws/keywords.enc.json`은 키워드 퀴즈의 암호문이다. `scripts/encrypt-keywords.mjs`가 로컬에서 만들어 커밋한다(ADR-040).
