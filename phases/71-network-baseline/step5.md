# Step 5: undefined-terms

## 배경

사용자가 2026-10-28 배포된 1장을 읽고 「라우터라던지 스위치라는 거 설명 없이 해당 용어를 써서 어려움을 느꼈어」라고 했다. step 0이 공유기·스위치·라우터를 풀었고,
두 주제를 화면 순서대로 통독하며 **설명 없이 처음 나오는 다른 낱말**을 찾아 목록으로 남겼다(`phases/71-network-baseline/index.json`의 step 0 `summary` 끝).

- `network-basics`: 서버(`computer-network` P0 — 정의는 뒤의 `client-server`), 트위스티드 페어 케이블·광케이블(`communication-link` P1), 작업 관리자(`throughput` P1),
  ping을 치는 「명령」(`packet-loss` P1)
- `protocols-encapsulation`: OSI 모델(`protocol` P4 — `reference-model`·`osi-model`보다 앞), 노드·메시지(`packet-switching` P6 — 이 화면에 정의 없음), 이더넷(`osi-model` P2 — 예로만),
  IP 주소(`tcp-ip-model` P2), IP 데이터그램을 「나눈 조각」(`pdu-names` P3)

사용자의 판단 기준은 규칙 위반 여부가 아니라 **학습자가 그 화면에서 막히는가**다. 이 낱말들은 같은 종류의 공백이다.
**이 step은 이 낱말들을 그 주제 화면에 처음 나오는 자리에서 풀어 준다.** 문항과 step 1이 바꾼 문장(데이터·본문)도 같은 눈으로 본다.

### 판정 기준 — 「이 주제 화면만 읽고 뜻이 서는가」

step 0과 같다. 읽는 단위는 주제 화면이고, 학습자는 아무 주제로나 곧바로 들어오며 확인 문제에서도 주제 화면 전체가 열린다.
두 주제 각각에서 그 낱말이 화면에 처음 나오는 자리에 풀이가 있어야 하고, 같은 한 줄 풀이가 두 주제에 되풀이되는 것은 괜찮다.
뒤 개념이 정의하는 낱말이 앞 개념에 먼저 나오면(서버, OSI 모델), 앞 자리에 짧은 풀이를 두거나 그 자리의 말을 이미 배운 말로 바꾼다.

## 읽어야 할 파일

- `phases/71-network-baseline/index.json`의 step 0~4 `summary`
- `docs/WRITING_GUIDE.md` 전체, `docs/ADR.md`의 **ADR-055·056·057·058·059**, **ADR-046**, **ADR-036**
- `docs/source/network/CLAUDE.md`(step 3이 고친 「허용하는 출처」), `docs/source/network/lecture-outline.md`, `docs/source/network/standards.md`
- `src/data/CLAUDE.md`의 「네트워크 과목 데이터」, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/visuals/*.json`

## 작업

### 1. 위 목록의 낱말을 푼다

- **풀이는 일상 말 한 줄**이다. 그 낱말이 무엇인지와, 그 자리에서 왜 나오는지가 서면 된다. 짧은 덧붙임(괄호나 같은 문장 안의 마디)이나 바로 뒤 한 문장으로 넣는다.
- **근거가 있는 사실만** 쓴다. 강의(`lecture-outline.md`)·표준 문서·`standards.md`에 있는 사실을 먼저 쓰고, 없으면 ADR-059의 허용 출처(예: IEEE 802.3 — 이더넷·트위스티드 페어·광케이블,
  learn.microsoft.com — Windows 작업 관리자)로 확인해 그 사실과 URL을 `standards.md`에 먼저 더한다. 확인되지 않는 것은 풀지 말고 말을 바꾸거나 summary에 남긴다.
- **1장에서 아직 배우지 않은 말로 풀지 않는다**(MAC 주소·라우팅·서브넷 등).
- 앞 개념에 먼저 나온 「OSI 모델」은 「뒤에서 볼 참조 모델」처럼 미리 짧게 소개하거나, 그 문장이 OSI 모델을 꼭 말해야 하는지 보고 줄인다(`exam-notes.md` E1의 시험 줄은 뜻을 지킨다).
- 「노드·메시지」처럼 `network-basics`가 정의한 말을 `protocols-encapsulation` 화면에서 쓰면, 이 화면 안에서 한 번 풀어 준다.

### 2. 다시 통독한다

- 두 주제를 화면 순서대로(개념 순서 → 요약 → 문단 → 그 개념 뒤의 도식 물음·캡션·범례·노드 라벨·곁말) 다시 읽는다. **위 목록에 없던 낱말**이 설명 없이 나오면 같은 방법으로 푼다.
  흔한 일상어(노트북·휴대폰·웹 페이지 등)는 풀지 않는다. 판단이 애매하면 풀지 말고 summary에 적는다.
- 문항(n001~n025)의 문제문·해설도 같은 눈으로 본다. 해설에는 처음 나오는 자리에 짧은 풀이를, 문제문은 판단에 쓰이지 않는 낱말이면 이미 배운 말로 바꾸거나 그대로 둔다. 문항 id·형식·정답·보기의 뜻은 바꾸지 않는다.

### 3. 도식

- 노드 라벨·좌표·시나리오는 바꾸지 않는다. 도식의 물음·캡션이 그 화면에서 낱말을 본문보다 먼저 쓰는 곳만 고친다(캡션 문구를 바꾸면 테스트가 JSON과 대조하므로 그대로 통과해야 한다).

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject network
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. 교차 검사 「교차 없음」, 전사 검사 「전사 이상 없음」.
2. 위 목록의 낱말마다 처음 나오는 자리에 풀이가 있는지(또는 말을 바꿨는지) 하나씩 확인한다.
3. 바뀐 파일이 `topics.json`·`questions.json`·`visuals/*.json`(바꿨다면)·`standards.md`(더했다면)뿐이고, 도식 `.tsx` 좌표·노드 id가 그대로인지 `git diff --stat`으로 본다.
4. `phases/71-network-baseline/index.json`의 step 5를 갱신한다.
   - 성공 → `"summary"`에 낱말마다 처음 자리(개념 id·문단)와 넣은 풀이(또는 바꾼 말), 통독에서 새로 찾아 푼 낱말, 풀지 않고 남긴 낱말과 이유, 바꾼 문항,
     `standards.md`에 더한 사실(있으면), 전체 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **새 개념을 만들지 마라.** 이유: 네트워크는 개념마다 도식이 필요하다(ADR-056). 풀이는 기존 개념의 문장으로 넣는다.
- **아직 없는 주제를 가리키지 마라**(「자세한 것은 ‘이더넷’ 주제에서」 같은 문장). 이유: 2장 이후 주제는 아직 앱에 없다.
- **근거 없는 사실을 보태지 마라.** 이유: 쉽게 쓰려고 출처에 없는 사실을 보태지 않는다(ADR-056).
- **허브와 「허브는 요즘 쓰지 않는다」를 넣지 마라.** 이유: 2장 phase의 일이고, 아직 근거가 없다.
- **step 0·1이 정한 것(장비 풀이, 데이터·본문)을 되돌리지 마라.** 다듬는 것은 괜찮다.
- 도식 좌표·노드 라벨·시나리오 구성을 바꾸지 마라. 기출 문장을 옮기지 마라. AWS 데이터를 건드리지 마라. 기존 테스트를 깨뜨리지 마라.
