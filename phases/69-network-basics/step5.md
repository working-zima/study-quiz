# Step 5: subject-docs

## 배경

앱에 두 번째 과목 **네트워크**를 더하는 phase 69의 여섯째 step이다. step 0~4가 출처 문서·빈 과목·전사 검사를 만들었다. 정확한 내용은
`phases/69-network-basics/index.json`의 step 0~4 `summary`와 파일에서 확인한다.

- step 0: `scripts/extract-network-source.py`(강의 자료 zip → `docs/source/network/raw/`, gitignore), `docs/source/network/CLAUDE.md`(네트워크 원본 규칙).
- step 1: `docs/source/network/lecture-outline.md`(강의 32강 정리, 주제 지도 22개, 강의 수정 이력 `L…`), `docs/source/network/standards.md`(표준 문서 사실과 URL).
- step 2: `docs/source/network/interview-facts.md`(면접 21~40번의 사실, 면접 수정 이력 `I…`).
- step 3: `src/data/network/`(빈 `topics.json`·`questions.json`, `networkSubject`), `subjects = [awsSubject, networkSubject]`, 네트워크 데이터·시각 요소 불변식 테스트.
- step 4: `scripts/check-verbatim.mjs --subject network`(강의·면접 추출본과 개념 본문·문항 문제문·해설 대조).

**이 step은 이 결정들을 ADR-055로 남기고, 루트·디렉토리 문서가 네트워크 과목을 알게 한다.** step 6부터 내용을 쓰는 세션은 루트 `CLAUDE.md`와 `docs/*.md`를
주입받으므로, 네트워크 규칙이 이 문서들에 있어야 한다. **코드와 데이터는 고치지 않는다.**

## 읽어야 할 파일

- `docs/CLAUDE.md`, 루트 `CLAUDE.md`
- `docs/ADR.md`의 ADR-009·ADR-026·ADR-027·ADR-037·ADR-039·ADR-041·ADR-046·ADR-051·**ADR-053**·**ADR-054** — ADR-053·054는 형식의 본보기(제목 괄호의 개정 대상, 「사용자 결정」, 「검토한 대안」, 「트레이드오프」)
- `docs/PRD.md` 전체, `docs/ARCHITECTURE.md`의 「디렉토리 구조」「데이터 흐름」「테스트 경계」
- `docs/source/CLAUDE.md`, `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`(주제 지도·수정 이력), `docs/source/network/interview-facts.md`의 수정 이력
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`, `scripts/CLAUDE.md`
- step 3·4가 만든 코드: `src/data/network/index.ts`와 세 테스트, `src/data/index.ts`, `scripts/check-verbatim.mjs` 머리 주석

## 작업

### 1. ADR-055 — `docs/ADR.md` 맨 끝

제목: `### ADR-055: 네트워크 과목을 더한다 — 강의가 범위를, 표준 문서가 설명과 정정을 맡는다 (ADR-053 「트레이드오프」의 도식 개정 / ADR-039 방식 확장)`

담을 것(문장은 직접 쓰되 아래 사실을 빠뜨리지 않는다. 코드·문서와 어긋나면 코드·문서가 맞다):

- **결정 — 과목**: id `network`, 이름 「네트워크」, 진행률 키 `network-quiz.progress`, 키워드 퀴즈 없음, 데이터 `src/data/network/`, 원본 `docs/source/network/`.
- **결정 — 출처 셋과 역할**
  - 강의 슬라이드(패스트캠퍼스 「현실 세상의 컴퓨터공학 지식 with 30가지 실무 시나리오」 Course 1 Part 3 네트워크, 5장 32강) — **범위와 순서**를 정하고 사실을 준다.
    쪽 번호는 통합본(502쪽) 기준이고 `sourcePages`도 그 번호다.
  - 표준 문서 — 설명을 채우고 강의·면접의 오류를 고친다. 허용하는 곳은 IETF RFC·IANA·IEEE 802·ITU-T X.200·MDN뿐이다(`docs/source/network/CLAUDE.md`). 사실과 URL은
    `docs/source/network/standards.md`에 남긴다. AWS의 ADR-039가 정의 몇 개에 한해 공식 문서를 허용한 것과 달리, 네트워크에서는 표준 문서가 **처음부터 정식 출처**다.
    대신 범위는 강의가 정한다 — 강의가 다루지 않는 주제를 표준에서 끌어오지 않는다.
  - 기술면접 TOP 50 네트워크 21~40번 — 사실 출처. 틀린 답은 표준으로 고친다.
  - **충돌하면 표준을 따른다.** 고친 기록은 `lecture-outline.md`의 강의 수정 이력(`L…`)과 `interview-facts.md`의 면접 수정 이력(`I…`)에 근거 URL과 함께 있다.
    대표 예 두셋을 들되(예: 면접 22번의 UDP 체크섬, 강의의 HTTP 「비연결성」) 실제 수정 이력에 있는 것만 쓴다.
  - 사실만 가져오고 문장은 직접 쓴다(ADR-009). 원본 추출본은 gitignore다. `check-verbatim.mjs --subject network`가 강의·면접 추출본과 개념 요약·문단에 더해
    **문항 문제문·해설**도 대조한다 — 면접 답이 완성된 문장이라 해설로 옮겨지기 쉽기 때문이다(ADR-025의 AWS 범위는 그대로).
- **결정 — 주제**: 강의 순서대로 22개. 지도는 `lecture-outline.md`의 「주제 지도」. 실습 강의 다섯(와이어샤크, 패킷 분석 둘, 포트 확인, HTTP 요청·응답 확인)은 주제로 두지 않는다
  — 화면 캡처와 도구 사용법이라 개념이 아니다. phase 69가 1장의 두 주제를 채우고, 나머지는 장 단위 phase로 채운다.
- **결정 — 강조**: 자격증 목표(네트워크관리사 2급 또는 CCNA)가 정해지지 않아 **별점이 없다**(`importance` 0). 굵은 글씨는 목록 항목의 이름에만 쓴다(ADR-046 꼴).
  「A vs B」 제목은 강의나 면접이 직접 견주는 짝에만 붙인다. 목표가 정해지면 강조 기준만 덧붙인다(ADR-051 방식).
- **결정 — 데이터 규칙**(`src/data/network/data.test.ts`·`visuals.test.ts`가 지킨다): 문항 id `n001`부터 연속, 모든 문항이 `format`을 가진다, 4지선다도 물음표로 끝난다,
  커버리지 100%(ADR-026), 해설 187자 이상(ADR-027), `importance` 0, `sourcePages`는 1~502, 굵은 글씨는 목록 항목 안에만, 약어 툴팁(`glossary`)은 비운다(ADR-037 — VPC 주제에만).
  예/아니요 규칙은 모든 과목에 걸린 ADR-054 그대로다.
- **결정 — 도식(ADR-053 「트레이드오프」 개정)**: ADR-053은 도식을 「AWS 개념 전용」으로 남겼다. 도식 registry가 개념 id 하나로 도식을 찾고 개념 id가 과목을 넘어 유일하므로,
  registry는 그대로 두고 **네트워크 도식은 `src/data/network/visuals/`의 문구를 읽는다**. 도식 규칙(UI_GUIDE 「도식」 이하, ADR-036~038·047·048)은 과목과 상관없이 같다.
  사용자는 도식을 「글과 문항 먼저, 도식은 나중」이 아니라 처음부터 함께 만들기로 했다.
- **사용자 결정** — 2026-10-26: 앱 하나에 과목을 나눈다. 출처는 강의+표준+면접. 면접 자료는 「강조 기준으로만」 쓰자는 권고 대신 사실 출처로도 쓰고 틀린 답은 고치며 이력을 남긴다.
  자격증 목표는 미정. 도식은 처음부터(「글과 문항 먼저」 권고 대신). 2026-10-27: 주제 22개와 실습 강의 제외, phase 69의 범위(틀·출처·1장)를 승인. 과목 이름·진행률 키·문항 id 접두사·
  굵은 글씨·「A vs B」·도구 사용법 제외는 설계안의 기본값으로 함께 승인했다.
- **검토한 대안**
  - *면접 자료를 강조 기준으로만 쓴다*(ADR-051의 노션처럼): 권했으나 사용자가 사실 출처로도 쓰기로 했다. 대가는 틀린 답을 고치는 품과 수정 이력이다.
  - *위키백과·업체 학습 페이지도 출처로 쓴다*: 강의가 링크한 곳이다. 정확성을 확인할 기준이 없고 표준 문서로 같은 사실을 댈 수 있어 뺐다.
  - *실습 강의도 주제로 둔다*: 슬라이드가 화면 캡처뿐이라 가르칠 사실이 없다.
  - *도식은 글과 문항 뒤에*: 사용자가 기각했다.
- **트레이드오프**: 표준 문서는 학습자에게 어렵고 범위가 넓어, 설명을 강의 범위에 맞춰 줄이는 판단이 step마다 필요하다. 별점이 없어 22개 주제의 우선순위가 화면에 보이지 않는다.
  `sourcePages`가 떨어진 두 강의를 쓰는 주제(`network-basics`, `http-headers`)는 사이 강의의 쪽까지 범위에 든다.

### 2. PRD — `docs/PRD.md`

- 「목표」 둘째 문단: 지금 담긴 과목이 AWS SAA-C03과 네트워크 둘이라고 고친다. 「이 문서의 나머지는 AWS 과목의 것」이라는 문장은 남기되 네트워크 과목은 끝의 새 절에 있다고 가리킨다.
- 맨 끝에 `## 네트워크 과목` 절을 더한다 — 사용자(네트워크 기초를 처음 공부하는 사람, 자격증 목표 미정), 원본 셋과 충돌 규칙, 범위(강의 순서 22주제, 실습 제외),
  문제 은행에서 AWS와 다른 것(두 형식을 함께 쓴다, `n001`, `format` 필수, 해설 하한과 커버리지는 같다), 별점 없음. 근거는 ADR-055. 짧게 — 자세한 것은 ADR이 맡는다.

### 3. ARCHITECTURE — `docs/ARCHITECTURE.md`

- 「디렉토리 구조」: `data/` 아래에 `network/`(topics.json·questions.json·visuals/와 과목 객체 `networkSubject`) 한 줄.
- 「데이터 흐름」: 원본 상자에 네트워크 원본(`docs/source/network/raw/`, gitignore)과 `src/data/network/*.json`을 더하거나, 과목마다 같은 흐름이라는 한 줄을 더한다.
- 「테스트 경계」: `src/data/network/*.json` 행 — `src/data/network/data.test.ts`·`visuals.test.ts`가 보는 것(위 ADR-055 「데이터 규칙」).

### 4. 루트 `CLAUDE.md`

- 첫 절의 「지금 과목은 AWS 솔루션스 아키텍트 어소시에이트(SAA-C03) 하나다」를 AWS와 네트워크 둘로 고친다.
- 「원본 데이터」: 원본 목록과 규칙이 과목마다 `docs/source/CLAUDE.md`(AWS)·`docs/source/network/CLAUDE.md`(네트워크)에 있다고 고친다. CRITICAL 문장(사실만 가져오고 문장은 직접 쓴다)은 그대로 둔다.
- 「하위 CLAUDE.md」 표에 `docs/source/network/CLAUDE.md` 행을 더한다(네트워크 원본 셋, 허용 표준, 충돌하면 표준, 수정 이력, 추출본 다시 만들기).
- 그 밖의 문장은 고치지 않는다.

### 5. 디렉토리 문서

- `docs/CLAUDE.md`: 끝 줄의 `docs/source/`가 AWS 과목 원본이라는 문장에 네트워크 원본(`docs/source/network/`)을 더한다.
- `docs/source/CLAUDE.md`: 첫 문단에 네트워크 원본은 `docs/source/network/`에 있고 규칙은 그 안의 `CLAUDE.md`라고 한 줄.
- `src/data/CLAUDE.md`: 트리에 `network/` 한 줄. 「네트워크 과목 데이터」 절 — `data.test.ts`·`visuals.test.ts`의 불변식, `format` 필수, `n001`, 별점 0, 굵은 글씨, `glossary` 비움, 근거 ADR-055.
- `src/components/diagrams/CLAUDE.md`: 「도식은 AWS 개념 전용이다」 항목을 고친다 — registry는 개념 id로 찾고 과목을 모른다, 도식은 **자기 과목 폴더**의 visuals(`src/data/aws/visuals/`·
  `src/data/network/visuals/`)를 읽는다, 개념 id는 과목을 넘어 유일하다(ADR-053·ADR-055). 「문구는 `src/data/aws/visuals/…`」 문장도 과목 폴더로 일반화한다.
- `scripts/CLAUDE.md`: 「데이터 가드레일·감사」 첫 문장(대상은 AWS 과목)을 고쳐 `check-verbatim.mjs`는 `--subject network`로 네트워크도 본다고 적는다. 표에 `extract-network-source.py` 행을 더한다
  (강의 자료 zip → `docs/source/network/raw/`, ADR-009·ADR-055).

## Acceptance Criteria

```bash
grep -c "ADR-055" docs/ADR.md docs/PRD.md docs/ARCHITECTURE.md CLAUDE.md src/data/CLAUDE.md src/components/diagrams/CLAUDE.md scripts/CLAUDE.md
grep -n "AWS 개념 전용" src/components/diagrams/CLAUDE.md
grep -n "SAA-C03) 하나다" CLAUDE.md
grep -n "docs/source/network/CLAUDE.md" CLAUDE.md docs/source/CLAUDE.md
npm run build
npm test
```

## 검증 절차

1. AC를 실행한다. 첫 줄은 일곱 파일이 모두 1 이상이어야 한다. 둘째·셋째 줄은 **아무것도 출력하지 않아야** 한다. 넷째 줄은 두 파일에서 모두 나와야 한다.
2. ADR-055에 적은 사실마다 근거를 댈 수 있는지 확인한다 — 위 「배경」·이 문서의 작업 1, step 0~4의 `summary`, 코드, `docs/source/network/`의 문서. 근거가 없는 문장은 지운다.
   특히 수정 이력의 예는 실제로 `lecture-outline.md`·`interview-facts.md`에 있는 번호여야 한다.
3. 루트 `CLAUDE.md`가 커지지 않았는지 본다 — 매 step에 주입되는 문서다. 더한 것은 위 작업의 줄뿐이어야 한다.
4. `git status`로 바뀐 파일이 위 작업에 나온 문서(ADR·PRD·ARCHITECTURE·루트 CLAUDE.md·docs/CLAUDE.md·docs/source/CLAUDE.md·src/data/CLAUDE.md·src/components/diagrams/CLAUDE.md·scripts/CLAUDE.md)와
   phase 메타데이터뿐인지 확인한다. 코드와 데이터는 바뀌지 않아야 한다.
5. `phases/69-network-basics/index.json`의 step 5를 갱신한다. 성공이면 `"summary"`에 고친 문서와 절, ADR-055의 하위 항목 이름을 적는다.

## 금지사항

- **앞선 ADR(특히 ADR-053·ADR-039·ADR-037)의 본문을 고치지 마라.** 이유: ADR은 당시의 기록이다. 개정은 새 ADR의 제목 괄호로 남긴다.
- **코드·데이터·테스트를 고치지 마라.** 이유: 이 step은 문서만 다룬다. 문서와 코드가 어긋나면 문서를 코드에 맞춘다. 코드가 틀렸다고 판단되면 고치지 말고 `summary`에 적는다.
- **PRD의 AWS 절(사용자·원본·문제 은행)을 네트워크에 맞게 고쳐 쓰지 마라.** 이유: 그 절들은 AWS 과목의 것이다. 네트워크는 새 절에 따로 쓴다.
- **루트 `CLAUDE.md`에 네트워크 규칙의 세부를 옮겨 적지 마라.** 이유: 매 step 프롬프트에 통째로 들어가 모든 step의 입력을 키운다(`scripts/execute.py`의 `_load_guardrails`). 세부는 하위 CLAUDE.md와 ADR이 맡는다.
- 고치라고 한 절 밖의 문장을 다듬지 마라. 이유: 변경은 이 phase로 거슬러 올라갈 수 있어야 한다.
- 기존 테스트를 깨뜨리지 마라.
