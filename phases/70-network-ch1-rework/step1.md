# Step 1: rewrite-basics

## 배경

phase 69가 네트워크 과목 1장의 첫 주제 `network-basics`(네트워크의 구성과 성능, 개념 13개, 문항 n001~n014)를 썼다. 사용자는 배포된 글을 보고 작성 기준을 새로 정했고,
그 전문이 `docs/WRITING_GUIDE.md`, 결정이 ADR-056(step 0)이다. 기준이 「나쁜 예」로 든 요약문 넷(네트워크 장비·트래픽·처리율·패킷 손실)이 바로 이 주제의 요약문이다.

**이 step은 `network-basics`의 개념 13개(요약·본문)를 WRITING_GUIDE에 맞게 다시 쓴다.** 사실과 개념 구성은 그대로다.
**문항은 고치지 않는다** — step 3이 1장 문항 25개를 WRITING_GUIDE의 객관식 기준으로 다시 낸다. step 4~7이 이 본문을 근거로 개념마다 도식을 그리고,
사용자가 step 3 뒤에 다시 쓴 글과 문항을 직접 읽고 판단한다.

## 읽어야 할 파일

- **`docs/WRITING_GUIDE.md` 전체** — 이 step의 기준이다. 「최종 검토」 두 목록을 자기 검수에 쓴다
- `docs/ADR.md`의 **ADR-056**(step 0), **ADR-055**, **ADR-054**(예/아니요), **ADR-030**(개념 제목·문항 다섯 기준), **ADR-026**·**ADR-027**(커버리지·해설), **ADR-046**(목록 개념), **ADR-009**
- `docs/source/network/CLAUDE.md` — 출처 규칙(사실은 강의·면접·표준에서만, 충돌하면 표준)
- `docs/source/network/lecture-outline.md`의 「Ch1-1」·「Ch1-4」 절과 「강의 수정 이력」, `docs/source/network/interview-facts.md`(이 주제를 가리키는 Q33·Q34), `docs/source/network/standards.md`
- `src/data/network/topics.json`의 `network-basics`, `src/data/network/questions.json`의 n001~n014 — 지금 글
- `src/data/network/visuals/network-basics.json` — 받는 대상 도식(`cast-types`)과 성능 지표 표의 문구
- `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식 — 데이터가 지켜야 할 것
- `phases/69-network-basics/index.json`의 step 6 `summary` — phase 69가 이 주제를 쓸 때 고른 것(형식 변경 이유, standards.md에 더한 사실)

## 작업

### 1. 개념 13개를 다시 쓴다 — `src/data/network/topics.json`의 `network-basics`

**그대로 두는 것**: 주제의 `id`·`title`·`importance`·`sourcePages`, 개념의 `id`·`parentId`·`name`과 **순서**, 목록 개념(`cast-types`·`lan-wan`)의 목록 꼴
(`- **한국어 이름**(English name)은 …`, ADR-046), 굵은 글씨는 목록 항목 이름에만(ADR-055).

**다시 쓰는 것**: `summary`와 `paragraphs`.

- `summary`는 WRITING_GUIDE 2절. 처음 보는 사람이 일상 말로 「무엇이고 무슨 역할인지」 알게 하는 한 문장. 다른 전문용어를 알아야 이해되면 안 되고, 단위·계산·분류는 넣지 않는다.
  WRITING_GUIDE가 든 좋은 예(네트워크 장비·트래픽·처리율·패킷 손실)는 출처 사실과 맞으면 그대로 써도 되고, 더 낫게 고쳐도 된다.
- `paragraphs`는 WRITING_GUIDE 3절의 흐름(개념 → 원리 → 예시 → 특징)을 필요한 만큼. 누가·무엇을·어디서 어디로를 빠뜨리지 않는다. 같은 말을 되풀이하지 않는다.
  이 주제 안에서 쓰는 용어(노드·호스트·패킷·주소 등)는 이 주제 안에서 처음 쓰는 곳에서 짧게 푼다 — 학습자는 아무 개념으로나 바로 들어온다.
- 헷갈리는 짝(트래픽·전송 속도·처리율·대역폭·패킷 손실)은 WRITING_GUIDE 4절대로 각각 무엇을 재는지, 왜 나눠 부르는지를 말한다.
- 비유는 이해를 돕는 데만 쓰고, 실제 동작과 다른 점이 있으면 그 자리에서 밝힌다. 비유로 사실을 대신하지 않는다(ADR-056). 강의 수정 이력이 「쓰지 않는다」로 정한 비유는 쓰지 않는다.

**본문에서 빼면 안 되는 사실 — step 4~7의 도식이 이 사실을 그린다.** 지금 본문에 있는 사실이다. 문장은 바꾸되 사실은 남긴다.

| 개념 | 도식이 그릴 사실 |
|---|---|
| `computer-network` | 네트워크는 노드(장치)·통신 링크(간선)·메시지로 이루어진다. 노드는 끝자리의 호스트와 가운데의 네트워크 장비로 나뉜다. 메시지는 한 노드에서 링크를 지나 다음 노드로 건너간다 |
| `host` | 호스트는 메시지를 처음 만들어 보내거나 마지막에 받아 쓰는 끝자리 노드다. 호스트는 저마다 주소를 갖고, 보내는 쪽은 받을 호스트의 주소로 위치를 가리킨다 |
| `network-equipment` | 라우터·스위치·공유기가 예다. 같은 장치가 남의 메시지를 넘겨줄 때는 중간 노드, 자기 메시지를 보내거나 받을 때는 호스트다 |
| `communication-link` | 유선(트위스티드 페어 케이블·광케이블)과 무선(와이파이). 노트북·휴대폰은 와이파이로 공유기에, 공유기·스위치는 케이블로 다른 컴퓨터에 닿는 식으로 섞인다. 공유기·스위치는 링크가 아니라 노드다 |
| `client-server` | 요청을 보내면 클라이언트, 응답을 보내면 서버. 웹 페이지를 여는 예. 서버끼리도 요청·응답하고 그때 요청하는 서버는 클라이언트다. 요청·응답은 가운데 네트워크 장비를 거친다 |
| `internet` | 따로 있던 네트워크 여럿을 라우터 같은 네트워크 장비로 이은 네트워크의 네트워크. 그래서 다른 네트워크의 호스트와도 주고받는다 |
| `cast-types` | 유니캐스트(하나)·브로드캐스트(같은 네트워크의 모든 호스트)·멀티캐스트(주소 하나로 가리키는 그룹, 그룹에 들지 않은 호스트는 받지 않음) — 이미 있는 도식이 그린다 |
| `lan-wan` | 나누는 기준은 장치 수가 아니라 거리. LAN은 가까운 곳(공유기·스위치 중심의 장치 묶음), WAN은 먼 곳을 잇고 흩어진 LAN들을 잇는다. WAN은 ISP(예: KT·LG U+·SK 브로드밴드)가 구축하고 LAN은 ISP와 맺은 연결로 WAN에 닿는다 |
| `traffic` | 한 곳에 트래픽이 몰리면 과부하로 처리가 늦어지고 패킷을 잃기도 한다. 그래서 여러 서버가 나눠 받게 해 분산한다 |
| `transmission-speed` | 기대할 수 있는 속도, 단위 bps·Mbps·Gbps. 실제로 잰 처리율과 다르게 나올 수 있다 |
| `throughput` | 정해 둔 시간 동안 실제로 전송된 양. 예: 와이파이 연결이 그 순간 4.0 Mbps를 받았다 = 1초에 4메가비트가 실제로 들어왔다. 대역폭을 넘을 수 없다 |
| `bandwidth` | 네트워크가 받아 낼 수 있는 최대치(상한). 대역폭이 커도 늘 그만큼 전송되지는 않는다. 처리율은 대역폭을 넘지 못한다 |
| `packet-loss` | 보낸 패킷 가운데 목적지에 닿지 못하고 사라진 정도, 백분율. ping 예: 7개 보내 7개 돌아오면 0%, 3개 보내 하나도 안 돌아오면 100%. 트래픽이 몰리는 것이 원인 가운데 하나 |

사실을 새로 더하려면 출처 문서에 있는 것이어야 한다. 강의·면접·`standards.md`에 없는 사실이 필요하면 허용한 표준 문서를 실제로 열어 확인하고
`standards.md`에 절 번호·URL과 「쓰인 곳」을 적은 뒤 쓴다. 확인하지 못한 사실은 쓰지 않는다.

### 2. 이미 있는 도식·표의 문구를 본문에 맞춘다 — `src/data/network/visuals/network-basics.json`

받는 대상 도식(`diagrams["cast-types"]`)의 캡션·곁말·라벨과 성능 지표 표(`tables["performance-metrics"]`)의 칸은 개념 본문에 있는 말이어야 한다(ADR-036).
본문을 다시 쓰면서 표현이 바뀐 곳만 JSON 문구를 맞춘다. **좌표·노드·시나리오 구성·열 수·열 폭은 바꾸지 않는다.** 컴포넌트와 테스트 파일은 고치지 않는다.

### 3. 파일 형식

`topics.json`의 개념은 한 줄에 하나(6칸 들여쓰기 + `JSON.stringify(concept)`), 키 순서 `id`·`parentId`(있을 때)·`name`·`summary`·`paragraphs`.
파일 끝 줄바꿈 하나. **`protocols-encapsulation`의 줄은 글자 하나도 바꾸지 않는다. `questions.json`은 건드리지 않는다.**
Windows에서 스크립트로 쓸 때 줄바꿈이 CRLF로 바뀌지 않게 한다(바이너리로 쓰거나 `newline=''`).

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

1. AC를 실행한다. 문항 25개, 예 6·아니요 6이 그대로여야 한다. `check-verbatim`은 「전사 이상 없음」이어야 한다.
2. **바뀌지 않아야 하는 것을 기계로 확인한다.** `git show HEAD:src/data/network/topics.json`과 지금 파일을 node로 읽어 비교한다 —
   두 주제의 `id`·`title`·`sourcePages`, 개념의 `id`·`parentId`·`name`·순서가 같고, `protocols-encapsulation` 주제 객체가 통째로 같다.
   `questions.json`은 통째로 같다(`git diff --quiet -- src/data/network/questions.json`).
3. **자기 검수** — 개념마다 WRITING_GUIDE 「6. 최종 검토」 여섯 질문과 「맥락」 절의 다섯 질문으로 다시 읽는다. 걸리면 고친다. 특히:
   - 요약만 읽고 무엇인지 알 수 있는가. 요약에 그 주제에서 아직 풀지 않은 전문용어가 있는가(있으면 일상 말로 바꾼다).
   - 위 표의 「도식이 그릴 사실」이 본문에 모두 남아 있는가.
   - 쉬운 말로 풀다가 사실이 바뀌지 않았는가(「특정 상황에서만 성립하는 것을 일반화」 포함). 문장마다 근거를 출처 문서에 댈 수 있는가.
4. 바뀐 파일이 `src/data/network/topics.json`·`visuals/network-basics.json`, (더했다면) `docs/source/network/standards.md`, phase 메타데이터뿐인지 본다.
5. `phases/70-network-ch1-rework/index.json`의 step 1을 갱신한다.
   - 성공 → `"summary"`에 **개념 13개의 새 요약문을 그대로**(개념 id와 함께) 적는다 — 사용자가 이 step 뒤에 이것을 읽고 판단한다.
     더해 도식·표 JSON에서 맞춘 문구, standards.md에 더한 사실, 자기 검수에서 고친 것, 테스트 수를 적는다.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

- **개념의 `id`·`name`·`parentId`·순서를 바꾸지 마라.** 이유: 사용자가 승인한 구성이고, 문항과 step 4~10의 도식이 개념 id를 가리킨다.
- **문항(`questions.json`)을 고치지 마라.** 이유: step 3이 1장 문항 전부를 객관식 기준으로 다시 낸다. 이 step이 고치면 일이 겹친다.
- **위 표의 「도식이 그릴 사실」을 본문에서 빼지 마라.** 이유: 도식은 본문에 있는 사실만 그린다(ADR-036). 빼면 step 4~7이 그릴 것이 없어진다.
- **출처 문서에 없는 사실을 쓰지 마라.** 이유: 쉽게 쓰는 것은 문장의 일이지 사실을 더하는 일이 아니다(ADR-056). 필요하면 표준을 확인해 `standards.md`에 먼저 더한다.
- **강의·면접 문장을 옮기지 마라.** 이유: ADR-009. `check-verbatim --subject network`가 하한선이다.
- **`docs/WRITING_GUIDE.md`의 좋은 예 외의 문장을 다른 곳에서 가져오지 마라.** 이유: 문장은 직접 쓴다.
- **`protocols-encapsulation`을 고치지 마라.** 이유: step 2의 범위다.
- **도식 좌표·컴포넌트·테스트, 불변식 테스트를 고치지 마라.** 이유: 도식은 step 4~10, 테스트가 실패하면 데이터를 고친다(ADR-026).
- AWS 데이터를 고치지 마라. 기존 테스트를 깨뜨리지 마라.
