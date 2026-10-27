# src/data/

빌드 타임 정적 학습 데이터다. **과목마다 폴더 하나**를 둔다(ADR-053).

```
src/data/
├── index.ts        # 과목 목록 subjects — 앱에 어떤 과목이 있는지 여기서 정한다
├── index.test.ts   # 과목 불변식
├── aws/            # AWS 과목. topics.json·questions.json·visuals/·keywords.enc.json과
│                   # 과목 객체 awsSubject를 export하는 index.ts
└── network/        # 네트워크 과목. topics.json·questions.json·visuals/와 과목 객체 networkSubject를 export하는 index.ts
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
- 예/아니요 문항도 `index.test.ts`가 모든 과목에 대해 검사한다: 문제문이 물음표로 끝난다, 「항상」「절대」가 없다, 예·아니요가
  그 과목 안에서 대략 반반이다. 4지선다에는 걸지 않는다(ADR-054).
- AWS의 `progressKey`(`'aws-quiz.progress'`)는 과목을 나누기 전과 같은 키다. 지금 사용자의 학습 기록이 여기 있다(ADR-053).

## AWS 과목 데이터

- AWS 문항은 모두 4지선다다(`questions.json`에 `format` 필드가 없다). 그래서 `aws/index.ts`의 `questions`는 `ChoiceQuestion[]`이고,
  AWS에 예/아니요를 넣는 phase는 이 타입부터 `Question[]`로 바꾼다(ADR-054).
- `aws/data.test.ts`가 스키마·id 유일성·`conceptId` 참조·개념 커버리지 100%·문항 id 연속성을 단언한다(ARCHITECTURE 「테스트 경계」).
  커버리지에 예외 목록을 만들어 통과시키지 마라(ADR-026).
- 주제 안 개념 배열의 순서가 학습 순서이고, `parentId`가 머리와 딸린 개념을 잇는다(ARCHITECTURE 「데이터 모델」, ADR-033·ADR-041).
- 개념 순서나 `parentId`를 바꾸면 `scripts/topics-baseline.json`도 같은 커밋에서 고친다. 대조는 `scripts/check-structure.mjs`가 한다(ARCHITECTURE 「데이터 모델」).
  커버리지는 `scripts/coverage.mjs`, 전사 검사는 `scripts/check-verbatim.mjs`다. 쓰임은 `scripts/CLAUDE.md`와 각 스크립트 머리 주석.
- 도식·비교표·약어의 문구는 `aws/visuals/<주제 id>.json`에, 좌표는 도식 컴포넌트에 둔다(ADR-037).
- `aws/keywords.enc.json`은 키워드 퀴즈의 암호문이다. `scripts/encrypt-keywords.mjs`가 로컬에서 만들어 커밋한다(ADR-040).

## 네트워크 과목 데이터

근거는 ADR-055다. 사실의 근거와 쓰는 법은 `docs/source/network/CLAUDE.md`에 있다.

- `network/data.test.ts`가 지키는 것: 주제·개념 id 유일과 개념 id 꼴(`<주제 id>.<슬러그>`), 문항 id는 `n001`부터 빈 번호 없이,
  모든 문항이 `format`(`choice`·`yes-no`)을 적고 형식에 맞는 필드만 가진다, 4지선다도 문제문이 물음표로 끝난다,
  커버리지 100%(ADR-026), 해설 187자 이상(ADR-027), `importance`는 모두 0(별점 없음), `sourcePages`는 강의 통합본 쪽 1~502 안,
  `parentId`(ADR-041)·목록 항목(ADR-046) 규칙, 굵은 글씨 `**`는 목록 항목 안에만. 커버리지에 예외 목록을 만들지 말고 해설 하한을 낮추지 마라.
- `network/visuals.test.ts`가 지키는 것: 주제 키와 `sources`가 실제 네트워크 주제·개념 id, 표의 열 셋 이하와 `columnWidths`,
  시나리오 id 유일, `glossary`는 비운다(약어 툴팁은 AWS VPC 주제에만, ADR-037).
- 전사 검사는 `node scripts/check-verbatim.mjs --subject network`다. 개념 요약·문단에 더해 문항의 문제문·해설도 본다.
- 개념마다 도식이 하나 이상이다. 비교표는 도식을 대신하지 않는다. 글은 `docs/WRITING_GUIDE.md`를 따른다(ADR-056).
