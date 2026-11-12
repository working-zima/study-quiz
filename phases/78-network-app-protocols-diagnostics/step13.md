# Step 13: ping-tracert

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 `diagnostic-commands`의 개념 둘(20 ping 명령의 옵션, 21 tracert 명령)의 글·문항·도식을 함께 만든다.**

기출은 사용자가 멈출 때까지 에코 요청을 되풀이해 보내는 Windows ping 옵션을 고르게 하고([기출 2025-08-24 #42] — 기출은 `-t`로 적는다), Windows netstat이 주지 않는 정보로 패킷이 목적지까지 거치는 게이트웨이의 차례를 고르게 한다([기출 2024-02-25 #37] — 그것은 tracert가 보여 준다).

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 11 `summary`(ping·tracert에 무엇을 쓰고 무엇을 쓰지 않는지, 출력 예, **옵션 표기**, E 항목)와 step 12 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(Microsoft Learn ping·tracert 항목과 「(phase 78 step 11)」 줄, man7.org ping(8)), `docs/source/network/exam-notes.md`(step 11이 더한 항목)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 12가 쓴 `diagnostic-commands`의 두 개념** — 이미 푼 낱말, `icmp.ping`·`icmp.echo`·`icmp.time-exceeded`·`ip-protocol.ttl` — ping·traceroute·TTL을 이미 어떻게 썼는지, 뜻과 표기를 맞춘다), `src/data/network/questions.json`(icmp 주제의 ping·tracert 문항 — 다른 것을 묻는다),
  `src/data/network/visuals/diagnostic-commands.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 12가 만든 도식과 그 테스트, `PingResultDiagram`·`TracerouteDiagram`(icmp 주제 — 같은 그림을 다시 만들지 않는다)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-02-25 #37], [기출 2025-08-24 #42] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `diagnostic-commands` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 20 | `diagnostic-commands.ping-options` | ping 명령의 옵션 | — | **목록 개념** — 소개 문단에서 ping을 이 주제 안에서 한 줄로 다시 푼다(상대에게 에코 요청을 보내 응답이 돌아오는지와 오가는 데 걸린 시간을 보는 명령 — `icmp.ping`과 뜻을 맞춘다). 항목 넷: `- **계속 보내기**(`/t`)는 …`, `- **횟수 정하기**(`/n`)는 …`, `- **이름 알아내기**(`/a`)는 …`, `- **크기 정하기**(`/l`)는 …`(표기는 step 11 summary대로). 항목마다 입력한 줄과 결과 — 예 `ping /n 2 198.51.100.10`은 요청 2개를 보내고 멈춘다, `ping /t 198.51.100.10`은 Ctrl+C를 누를 때까지 보낸다(「예시 값」). 항목 뒤 문단: **Linux의 ping은 기본이 반대다**(4절 — 정하지 않으면 멈출 때까지, `-c`로 횟수). 기출 표기 `-t`는 step 11의 E 항목대로 「자격시험은」 줄 |
| 21 | `diagnostic-commands.tracert` | tracert 명령 | — | Windows에서 목적지까지 거치는 라우터를 차례대로 보여 주는 명령(Linux는 `traceroute` — 한 줄). **라우터**(네트워크와 네트워크 사이에서 패킷을 다음 장치로 넘기는 장치 — 한 줄), **TTL**(한 줄), **홉**(한 줄)을 푼다. 원리 한 줄(`icmp.time-exceeded`와 뜻을 맞춘다 — 같은 설명을 길게 되풀이하지 않는다). 예: `tracert 198.51.100.10`을 입력해 `192.0.2.1` → `203.0.113.1` → `198.51.100.1` → `198.51.100.10`의 네 홉이 차례로 나온다(「예시 값」) — 결과의 꼴은 step 11이 확인한 만큼만(문서에 출력 예가 없으면 「한 줄에 무엇이 있는지」를 말로). `/d`·`/h`는 step 11 결과대로. **라우터에게 경로 전체를 한 번에 받아 오는 것이 아니다**와, **경로의 라우터 차례는 netstat이 아니라 tracert가 보여 준다**(4절 한 줄) |

### 2. 문항 — `src/data/network/questions.json`에 `n219`~`n220`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n219` | `ping-options` | 4지선다 「원인과 결과」 — Windows에서 옵션이 붙은 ping 줄 하나(본문과 다른 값 — 예: `ping /n 6 203.0.113.10`)를 주고, 입력하면 무엇이 일어나는지 고르게 한다. 정답: 요청 6개를 보내고 멈춘다. 오답은 흔한 오해 — 6초 동안 보낸다, 6바이트 데이터를 보낸다, 사용자가 멈출 때까지 보내며 6번째마다 통계를 보인다. 보기가 「결과」라서 기출 묶음(`-t`·`-a`·`-f`·`-n`)과 범주가 다르다 — 옵션 이름 넷을 늘어놓는 꼴로 쓰지 않는다. 표기는 step 11 summary대로. **정답 위치 0** |
| `n220` | `tracert` | 예/아니요 「오해 바로잡기」 — step 12가 끝난 뒤의 균형(계획대로면 예 41·아니요 41)에서 **아니요** 쪽으로 세운다. 예: tracert는 목적지까지의 경로를 라우터에게 한 번에 물어 그 목록을 받아 오는가(아니요), 또는 netstat으로 목적지까지 거치는 라우터의 차례를 볼 수 있는가(아니요 — 이 개념의 4절 줄). icmp 주제의 문항과 같은 주장이면 다른 쪽을 고른다. 해설은 tracert가 결과를 얻는 차례와, 줄마다 무엇이 적히는지를 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 41·아니요 42, 정답 위치 35/34/34/34.

### 3. 도식

#### 3-1. `diagnostic-commands.ping-options` — `PingOptionsDiagram`, JSON 키 `ping-options`

- 물음형 제목 예: `옵션에 따라 ping은 언제 멈출까?`
- 그릴 것: 명령 줄 노드(시나리오마다 다른 id·다른 자리)와, 그 줄이 보내는 에코 요청을 위에서 아래로 쌓은 노드(요청 1, 요청 2, …), 멈추는 때를 곁말로. 기본(옵션 없이 — 4개), `/n 2`(2개), `/t`(멈출 때까지 — 「Ctrl+C로 멈춤」 곁말). 280 폭에서 줄 셋을 나란히 두지 말고 그룹 박스로 위아래에 둔다. Linux와의 차이를 곁말 한 줄로 둘지는 판단.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `default` | 옵션 없이 | 기본 줄과 요청 넷 | Windows ping은 옵션이 없으면 요청 4개를 보내고 멈춘다 |
  | `count` | 횟수 정하기 | `/n 2` 줄과 요청 둘 | 정한 수만큼 보내고 멈춘다 |
  | `continuous` | 계속 보내기 | `/t` 줄과 이어지는 요청 | 사용자가 멈출 때까지 계속 보낸다 |

- 요점 테스트: `default`에서 선명한 요청 노드가 4개, `count`에서 2개다. `continuous`의 곁말에 Ctrl+C가 있다. 명령 줄 노드의 라벨이 본문의 줄과 같다.

#### 3-2. `diagnostic-commands.tracert` — `TracertHopsDiagram`, JSON 키 `tracert-hops`

- 물음형 제목 예: `tracert 결과의 한 줄은 어느 라우터일까?`
- 그릴 것: 왼쪽에 경로(PC `192.0.2.10` → `192.0.2.1` → `203.0.113.1` → `198.51.100.1` → `198.51.100.10`)를 위에서 아래로, 오른쪽(가로형) 또는 아래쪽(세로형)에 결과의 줄(홉 번호 1~4)을 놓고 줄과 장치를 잇는다. icmp 주제의 `TracerouteDiagram`과 같은 그림(TTL을 늘리는 차례)을 다시 그리지 말고 **결과를 읽는 것**에 맞춘다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `first-hop` | 첫 줄 | 홉 1 줄과 `192.0.2.1` | 첫 줄은 가장 가까운 라우터 — 보통 기본 게이트웨이다(본문에 쓴 만큼) |
  | `path` | 경로 | 홉 1~3 줄과 라우터 셋 | 줄이 내려갈수록 목적지에 가까운 라우터다 |
  | `destination` | 목적지 | 마지막 줄과 `198.51.100.10` | 마지막 줄이 목적지다 |

- 요점 테스트: 결과 줄의 홉 번호가 위에서부터 1, 2, 3, 4이고, 각 줄이 이어진 장치의 주소가 본문 경로의 차례와 같다. `destination`에서 선명한 장치 라벨이 `198.51.100.10`이다.

위 도식 설계는 출발점이다. 본문(step 11 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 220개, 마지막 id는 `n220`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. `icmp.ping`·`icmp.time-exceeded`와 어긋나지 않는가(Windows ping의 기본 4개, `/n` 표기, tracert의 최대 30홉).
   step 11 summary의 옵션 표기·「자격시험은」 줄을 지켰는가. 출력 화면을 지어 보이지 않았는가.
3. n219의 보기마다 그 줄을 입력했을 때의 결과를 따져 정답이 하나뿐인지 본다.
4. `phases/78-network-app-protocols-diagnostics/index.json`의 step 13을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 22~25를 만들거나 step 12의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
- **`icmp` 주제의 글·문항·도식을 고치지 마라.** 이유: 앞 phase의 주제다. 어긋남을 찾으면 summary에 적는다.
- **step 11이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. tracert·ping의 화면을 지어 보이지 마라.
- **ping의 TTL·조각내기·경로 기록 옵션(`/i`·`/f`·`/r` 등)을 항목으로 늘어놓지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」). 오답 해설에 한 줄이 필요하면 step 11 결과대로.
