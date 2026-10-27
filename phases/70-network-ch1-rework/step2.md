# Step 2: rewrite-protocols

## 배경

phase 69가 네트워크 과목 1장의 둘째 주제 `protocols-encapsulation`(패킷 교환·프로토콜·계층 모델, 개념 10개, 문항 n015~n025)을 썼다. 사용자는 배포된 글을 보고 작성 기준을 새로 정했고,
그 전문이 `docs/WRITING_GUIDE.md`, 결정이 ADR-056(step 0)이다. step 1이 첫 주제 `network-basics`를 이 기준으로 다시 썼다 — **step 1의 결과가 본보기다.**

**이 step은 `protocols-encapsulation`의 개념 10개(요약·본문)와 문항 11개(문제문·해설)를 WRITING_GUIDE에 맞게 다시 쓴다.** 사실·개념 구성·문항의 정답은 그대로다.
step 7~9가 이 본문을 근거로 개념마다 도식을 그리고, 사용자가 이 step 뒤에 1장 글 전체를 직접 읽고 판단한다.

이 주제는 계층·헤더·캡슐화처럼 처음 배우는 사람에게 추상적인 개념이 많다. 「누가(어느 계층·어느 호스트가) 무엇을(어떤 데이터에) 어떻게 하는지」를 특히 빠뜨리지 않는다.

## 읽어야 할 파일

- **`docs/WRITING_GUIDE.md` 전체** — 이 step의 기준이다
- `phases/70-network-ch1-rework/index.json`의 step 0·1 `summary`, 그리고 **step 1이 다시 쓴 `network-basics` 본문**(`src/data/network/topics.json`) — 결과 글의 결을 맞춘다
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**(머리·딸린 개념), **ADR-046**, **ADR-009**
- `docs/source/network/CLAUDE.md`
- `docs/source/network/lecture-outline.md`의 「Ch1-2」 절과 「강의 수정 이력」(특히 **L25** — TCP/IP에 세션 계층이 처음부터 없음), `docs/source/network/interview-facts.md`의 **Q21**과 수정 이력 I1·I9·I10,
  `docs/source/network/standards.md`(ITU-T X.200, RFC 1122, RFC 871, RFC 791, RFC 9293, RFC 768, RFC 9110)
- `src/data/network/topics.json`의 `protocols-encapsulation`, `src/data/network/questions.json`의 n015~n025 — 지금 글
- `src/data/network/visuals/protocols-encapsulation.json` — 캡슐화 도식과 계층 대응표의 문구
- `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식
- `phases/69-network-basics/index.json`의 step 7 `summary`

## 작업

### 1. 개념 10개를 다시 쓴다 — `src/data/network/topics.json`의 `protocols-encapsulation`

**그대로 두는 것**: 주제의 `id`·`title`·`importance`·`sourcePages`, 개념의 `id`·`parentId`·`name`과 **순서**, 목록 개념(`packet`·`osi-model`·`tcp-ip-model`·`pdu-names`)의 목록 꼴
(`- **한국어 이름**(English name)은 …`, ADR-046), 굵은 글씨는 목록 항목 이름에만.

**다시 쓰는 것**: `summary`와 `paragraphs`. 쓰는 법은 step 1과 같다.

- `summary`는 일상 말로 「무엇이고 무슨 역할인지」. 「계층」「헤더」「페이로드」처럼 아직 풀지 않은 말을 요약에 기대지 않는다.
- `paragraphs`는 개념 → 원리 → 예시 → 특징을 필요한 만큼. 이 주제 안의 용어(호스트·패킷·헤더·프로토콜·계층 등)는 이 주제 안에서 처음 쓰는 곳에서 짧게 푼다.
- 헷갈리는 짝(패킷 교환·회선 교환, OSI 모델·TCP/IP 모델, 캡슐화·역캡슐화, 패킷·세그먼트·데이터그램·프레임)은 왜 나눠 부르는지를 말한다.
- 비유는 이해를 돕는 데만, 실제 동작과 다르면 그 차이를 밝힌다(ADR-056).
- OSI·TCP/IP 계층 항목의 「하는 일」은 뒤 장이 다룰 것(이더넷·IP·TCP·HTTP)을 이름으로만 가리키고 자세한 동작은 쓰지 않는다 — 뒤 주제의 범위다.

**본문에서 빼면 안 되는 사실 — step 7~9의 도식이 이 사실을 그린다.** 지금 본문에 있는 사실이다. 문장은 바꾸되 사실은 남긴다.

| 개념 | 도식이 그릴 사실 |
|---|---|
| `packet-switching` | 보낼 정보를 패킷으로 나눠 보내고 받는 쪽이 다시 합친다(예: 2GB 파일). 패킷은 하나하나 따로 넘겨져 서로 다른 경로로 갈 수 있다. 여러 호스트의 패킷이 같은 링크를 함께 지나간다. 가운데 장비(패킷 스위치)가 넘겨준다 |
| `packet` | 헤더(앞, 전달·처리에 필요한 부가 정보, 내용은 프로토콜이 정함)·페이로드(실어 보낼 정보)·트레일러(뒤, 쓰는 프로토콜일 때만). 헤더와 페이로드만인 패킷도 있다 |
| `circuit-switching` | 주고받기 전에 두 호스트 사이 회선을 잡아 둔다. 그 회선은 두 호스트만 쓰고 다른 호스트는 도중에 끼어들 수 없다. 그래서 전송률이 보장되지만, 잠시 쉬는 동안에도 남이 못 써 이용률이 떨어진다 |
| `protocol` | 정보를 주고받는 쪽들이 미리 합의한 규칙. 웹 페이지는 HTTP, 파일은 FTP. 같은 프로토콜을 쓰는 쪽끼리 통신한다. 헤더의 내용은 프로토콜이 정하므로 프로토콜이 다르면 헤더도 다르다(UDP 헤더 항목 넷, TCP는 열 개 넘음) |
| `reference-model` | 주고받는 과정을 계층으로 나눈 모델. 보내는 쪽은 맨 위 계층에서 아래로, 받는 쪽은 맨 아래에서 위로. 네 계층으로 나누면 맨 위는 응용 프로그램과 주고받기, 그 아래는 신뢰성을 더할 수 있는 자리, 그 아래는 보낼 곳·받을 곳 정하기, 맨 아래는 유선·무선 매체로 실어 나르기 |
| `osi-model` | 일곱 계층(아래부터 물리·데이터 링크·네트워크·전송·세션·표현·응용)과 각 계층이 하는 일 한 줄. 데이터 링크 계층은 오류를 검출하고 고칠지는 프로토콜마다 다르다(이더넷은 버림, I1) |
| `tcp-ip-model` | 네 계층(아래부터 네트워크 액세스(표준 이름 링크 계층)·인터넷·전송·응용)과 OSI 대응(물리·데이터 링크 → 네트워크 액세스, 네트워크 → 인터넷, 전송 → 전송, 응용·표현·세션 → 응용). 일대일로 맞지 않는다는 단서, **세션 계층은 TCP/IP에 처음부터 없고 표준은 표현·응용만 말한다는 L25 문단** |
| `encapsulation` | 보내는 쪽에서 각 계층이 위 계층이 넘긴 것을 통째로 페이로드로 삼아 자기 헤더를 앞에 붙인다(필요하면 트레일러를 뒤에). 위 계층의 헤더는 떼지 않아 겹겹이 쌓인다. 예: 응용 계층이 HTTP 같은 헤더, 전송 계층이 TCP나 UDP의 헤더, 인터넷 계층이 IP 헤더, 네트워크 액세스 계층이 자기 헤더와 트레일러 |
| `decapsulation` | 받는 쪽에서 아래에서 위로, 각 계층이 같은 계층이 붙였던 자기 헤더(와 트레일러)만 떼어 나머지를 위로 넘긴다. 가장 나중에 붙은 바깥쪽 헤더부터 떨어진다. 응용 계층까지 떼면 원래 데이터가 응용 프로그램에 닿는다 |
| `pdu-names` | 프레임(네트워크 액세스, 예: 이더넷 프레임 — 헤더와 트레일러)·패킷(인터넷, IP — 표준은 IP 데이터그램)·세그먼트(전송, TCP)·데이터그램(전송, UDP — 사용자 데이터그램)·메시지(응용, HTTP 메시지). 통틀어 PDU |

캡슐화 도식(`EncapsulationDiagram`)이 쓰는 헤더 이름 `HTTP 헤더`·`TCP 헤더`·`IP 헤더`·`이더넷 헤더`·`트레일러`·`데이터`와 단위 이름 `메시지`·`세그먼트`·`패킷`·`프레임`은
본문에서 같은 말로 남긴다 — 도식의 말과 본문의 말이 같아야 도식이 본문을 가리킨다(UI_GUIDE 「도식」).

사실을 새로 더하려면 출처 문서에 있는 것이어야 한다. 없으면 허용한 표준 문서를 열어 확인하고 `standards.md`에 적은 뒤 쓴다.

### 2. 문항 11개를 다시 본다 — `src/data/network/questions.json`의 n015~n025

step 1과 같다. **그대로**: `id`·`topicId`·`conceptId`·`format`, 예/아니요의 `answer`, 4지선다의 정답 보기와 `answerIndex`, 문항 수.
**다시 쓰는 것**: `prompt`·`explanation`(오답 보기는 문구만, 같은 범주 안). 문제문은 상황(어느 호스트가, 보내는 쪽인지 받는 쪽인지, 어느 계층인지)을 준다.
해설은 187자 이상, 개념을 가르치는 글, 다시 쓴 본문과 같은 말. 아니요 문항은 맞는 사실을 가르친다. 약어는 해설마다 처음 쓸 때 풀어 쓴다.

### 3. 이미 있는 도식·표의 문구를 본문에 맞춘다 — `src/data/network/visuals/protocols-encapsulation.json`

캡슐화 도식(`diagrams["encapsulation"]`)의 캡션·곁말·idleCaption과 계층 대응표(`tables["reference-models"]`)의 칸이 다시 쓴 본문의 말이어야 한다.
표현이 바뀐 곳만 맞춘다. **좌표·노드·라벨·시나리오 구성·열 수·열 폭은 바꾸지 않는다.** 컴포넌트와 테스트 파일은 고치지 않는다.

### 4. 파일 형식

step 1과 같다. **`network-basics`의 줄과 n001~n014 줄은 글자 하나도 바꾸지 않는다.** CRLF로 바꾸지 않는다.

## Acceptance Criteria

```bash
npm run build
npm run lint
npm test
node scripts/check-verbatim.mjs --subject network
node -e "const q=require('./src/data/network/questions.json');const yn=q.filter(x=>x.format==='yes-no');console.log('문항',q.length,'예',yn.filter(x=>x.answer).length,'아니요',yn.filter(x=>!x.answer).length)"
git diff --stat
git status --porcelain
```

## 검증 절차

1. AC를 실행한다. 문항 25개, 예 6·아니요 6이 그대로, `check-verbatim` 「전사 이상 없음」.
2. **바뀌지 않아야 하는 것을 기계로 확인한다.** `git show HEAD:…`과 지금 파일을 node로 비교한다 — 개념의 `id`·`parentId`·`name`·순서, `network-basics` 주제 객체 통째로,
   n015~n025의 `id`·`conceptId`·`format`·`answer`·`answerIndex`·정답 보기 문자열, n001~n014 통째로가 같아야 한다.
3. **자기 검수** — 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽고, 걸리면 고친다. 특히:
   - 요약만 읽고 무엇인지 알 수 있는가. 「계층」「헤더」「페이로드」「프로토콜」을 모르는 사람이 막히지 않는가.
   - 위 표의 「도식이 그릴 사실」과 캡슐화 도식의 헤더·단위 이름이 본문에 모두 남아 있는가. L25 문단의 사실이 남아 있는가.
   - 수정 이력 I1·I9·I10·L25를 반영한 사실이 쉬운 말로 풀다가 바뀌지 않았는가. 문장마다 근거를 출처 문서에 댈 수 있는가.
4. 바뀐 파일이 `src/data/network/topics.json`·`questions.json`·`visuals/protocols-encapsulation.json`, (더했다면) `docs/source/network/standards.md`, phase 메타데이터뿐인지 본다.
5. `phases/70-network-ch1-rework/index.json`의 step 2를 갱신한다.
   - 성공 → `"summary"`에 **개념 10개의 새 요약문을 그대로**(개념 id와 함께) 적는다. 더해 문항에서 바꾼 것, 도식·표 JSON에서 맞춘 문구, standards.md에 더한 사실,
     자기 검수에서 고친 것, 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **개념의 `id`·`name`·`parentId`·순서와 문항의 정답·형식·수를 바꾸지 마라.** 이유: 진행률이 문항 id로 답을 기억하고, step 7~9의 도식이 개념 id를 앵커로 쓴다.
- **위 표의 「도식이 그릴 사실」과 캡슐화 도식이 쓰는 이름을 본문에서 빼거나 다른 말로 바꾸지 마라.** 이유: 도식은 본문의 사실과 말만 쓴다(ADR-036, UI_GUIDE 「도식」).
- **출처 문서에 없는 사실을 쓰지 마라. 수정 이력에 걸린 강의·면접의 주장을 그대로 가르치지 마라.** 이유: ADR-055·ADR-056.
- **강의·면접 문장을 옮기지 마라.** 이유: ADR-009.
- **`network-basics`와 n001~n014를 고치지 마라.** 이유: step 1의 산출물이다.
- **도식 좌표·컴포넌트·테스트, 불변식 테스트를 고치지 마라.** 이유: 도식은 step 3~9, 테스트가 실패하면 데이터를 고친다.
- AWS 데이터를 고치지 마라. 기존 테스트를 깨뜨리지 마라.
