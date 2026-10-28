# Step 11: diagram-coverage

## 배경

사용자는 2026-10-27 네트워크 과목의 그림에 대해 「그림은 거의 한 주제에 하나씩은 있어야 된다고 봐」, 「최소 하나씩」이라고 했다(「주제」는 화면의 개념 제목).
ADR-056(step 0)이 이것을 **네트워크 과목은 개념마다 도식이 하나 이상, 비교표는 도식을 대신하지 않는다**로 정했고, step 4~10이 1장 개념 23개 모두에 도식을 붙였다.

**이 step은 그 규칙을 불변식 테스트로 고정한다.** 다음 phase가 네트워크 2장 이후 주제를 더할 때 도식 없는 개념이 생기면 테스트가 잡게 하는 것이 목적이다.

## 읽어야 할 파일

- `docs/ADR.md`의 **ADR-056**, **ADR-037**(「한 개념 뒤의 여러 도식」 — 배열 순서)
- `phases/70-network-ch1-rework/index.json`의 step 4~10 `summary` — 개념마다 붙은 도식
- `src/components/diagrams/registry.ts` — 개념 id → 컴포넌트(또는 컴포넌트 배열)
- `src/data/network/index.ts`(`networkSubject`), `src/data/network/visuals.test.ts`, `src/data/index.test.ts` — 기존 불변식 테스트의 짜임(위반 id를 모아 `toEqual([])`로 비교)
- `src/components/diagrams/CLAUDE.md`, `src/data/CLAUDE.md`의 「네트워크 과목 데이터」

## 작업

### 1. 불변식 테스트 — `src/components/diagrams/networkDiagramCoverage.test.ts`

먼저 쓰고, 지금 데이터에서 통과하는지 본다. 그다음 아래 「위반 확인」으로 테스트가 실제로 잡는지 확인한다.

- **모든 네트워크 개념에 도식이 하나 이상 있다.** `networkSubject.topics`의 모든 개념 id에 대해 registry 값(하나 또는 배열)을 배열로 펴고,
  그 안에 도식 컴포넌트(이름이 `Diagram`으로 끝나는 컴포넌트)가 하나 이상 있어야 한다. 비교표(이름이 `Table`로 끝나는 컴포넌트)만 있는 개념은 위반이다.
  위반한 개념 id를 모아 `toEqual([])`로 비교한다 — 실패 메시지가 어느 개념인지 바로 보이게.
- **도식이 표보다 앞이다.** registry 값이 배열인 네트워크 개념은 도식 컴포넌트가 모두 표 컴포넌트보다 앞에 있다(UI_GUIDE 「한 개념 뒤의 여러 도식」).
- **registry의 네트워크 키는 모두 실제 개념이다.** `network-basics.`·`protocols-encapsulation.`처럼 네트워크 주제 id로 시작하는 registry 키가 모두 `networkSubject`에 있는 개념 id다.
- 컴포넌트 이름 판정은 `Function.prototype.name`으로 한다. 이름이 `Diagram`도 `Table`도 아닌 컴포넌트가 네트워크 개념에 걸려 있으면 그것도 위반으로 보고한다(판정할 수 없는 것을 조용히 통과시키지 않는다).
- 테스트 이름은 한국어 문장으로(기존 불변식 테스트처럼). 예외 목록을 두지 마라 — 머리 주석에 「예외를 더하지 말고 도식을 그린다(ADR-056)」를 적는다.

### 2. 위반 확인 — 커밋하지 않는다

- registry에서 네트워크 도식 한 줄을 잠시 지우고 테스트가 그 개념 id 하나만 보고하며 실패하는지 본다. 되돌린다.
- 도식과 표가 함께 걸린 배열 하나의 순서를 잠시 뒤집고 「도식이 표보다 앞」 테스트가 실패하는지 본다. 되돌린다.
- 결과를 summary에 적는다. 임시 변경은 남기지 않는다(`git diff`로 확인).

### 3. 문서 — 한 줄씩

- `src/components/diagrams/CLAUDE.md`와 `src/data/CLAUDE.md`의 「네트워크 과목 데이터」에 이 테스트 파일을 가리키는 한 줄(무엇을 지키는지, ADR-056).

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject network
node -e "const t=require('./src/data/network/topics.json');console.log('개념',t.flatMap(x=>x.concepts).length)"
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. 개념 23개, 새 테스트 통과, 교차 검사 「교차 없음」.
2. 「위반 확인」 두 가지가 실제로 실패했고 되돌렸는지 본다(`git diff --stat`에 `registry.ts`가 없어야 한다).
3. 바뀐 파일이 새 테스트 파일, `src/components/diagrams/CLAUDE.md`, `src/data/CLAUDE.md`, phase 메타데이터뿐인지 본다.
4. `phases/70-network-ch1-rework/index.json`의 step 11을 갱신한다.
   - 성공 → `"summary"`에 테스트 파일과 테스트 이름, 네트워크 개념 23개마다 붙은 도식 이름(표가 함께 있으면 표도)을 한 줄로, 위반 확인 결과, 교차 검사 결과 줄, 전체 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용. 도식 없는 개념이 남아 있으면 그 개념 id를 적는다 — **테스트에 예외를 더해 통과시키지 마라.**

## 금지사항

- **테스트에 예외 목록을 두거나 판정을 느슨하게 해서 통과시키지 마라.** 이유: 이 테스트의 목적이 「도식 없는 개념」을 잡는 것이다(ADR-056). 실패하면 도식을 그려야 한다.
- **도식·표·데이터·registry를 고치지 마라.** 이유: 도식은 step 4~10의 산출물이다. 이 step은 확인만 한다.
- **AWS 개념에 이 규칙을 걸지 마라.** 이유: ADR-056은 네트워크 과목에만 이 규칙을 정했다.
- 기존 테스트를 깨뜨리지 마라.
