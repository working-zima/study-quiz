# Step 14: pathping-netstat

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 `diagnostic-commands`의 개념 둘(22 pathping 명령, 23 netstat 명령)의 글·문항·도식을 함께 만든다.** 22는 21 `tracert`에 딸린 개념이다.

기출은 tracert와 같은 경로 정보에 홉 사이의 시간·통계를 더해 보여 주는 명령으로 pathping을 세 번 고르게 하고, 열린 포트를 확인하는 명령으로 netstat을 여러 번 고르게 한다
(Linux에서 열린 포트 — [기출 2024-05-19 #32]·[2025-02-23 #39]·[2026-08-02 #39], 쓰지 않는 서비스 포트가 열려 있는지 — [기출 2024-08-25 #32], Windows에서 원격 접속 흔적 — [기출 2024-11-03 #12]).

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 11 `summary`(pathping·netstat에 무엇을 쓰고 무엇을 쓰지 않는지, **출력 예의 꼴**, 상태 이름 표기, E 항목)와 step 12·13 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 78 step 11)」의 pathping·netstat 줄, netstat(8)·ss(8) 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 12·13이 쓴 `diagnostic-commands`의 네 개념**, `tcp-connection.tcp-states`(LISTEN·ESTABLISHED, `ss -tan`, 상태 이름 표기), `ports.client-server-ports`, `network-basics.packet-loss` — 뜻과 표기를 맞춘다), `src/data/network/questions.json`,
  `src/data/network/visuals/diagnostic-commands.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 12·13이 만든 도식과 그 테스트, 선례 `RoutingTableDiagram`(표 모양), `TcpStatesDiagram`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-05-19 #32·#38], [기출 2024-08-25 #32], [기출 2024-11-03 #12], [기출 2025-02-23 #39], [기출 2025-11-02 #40], [기출 2026-05-17 #31], [기출 2026-08-02 #39] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `diagnostic-commands` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 22 | `diagnostic-commands.pathping` | pathping 명령 | `tracert` | Windows에서 경로를 찾은 뒤(tracert와 같은 일) 경로의 라우터마다 에코 요청을 일정 시간 동안 여러 번 보내 **홉마다 잃은 비율**을 계산해 보여 준다. 예: `pathping 198.51.100.10`(13의 경로와 같은 예시 값) — 먼저 경로 목록, 기다린 뒤 통계(step 11이 확인한 출력 예의 꼴대로 간추린다 — 출력 예가 없으면 말로). `/q`·`/p`의 기본값과 기다리는 시간은 step 11 결과대로. **잃은 비율 계산**: 예 — 어느 라우터에 요청 100개를 보내 10개가 돌아오지 않았다면 10 ÷ 100 = 10%(값은 예시 값이라고 밝힌다)를 단계대로. **tracert·ping과 무엇이 다른지**(4절 — 경로만, 끝 하나만, 경로와 어디서 잃는지). 패킷 손실(보낸 패킷이 상대에 닿지 못하고 사라지는 것 — 한 줄)을 푼다 |
| 23 | `diagnostic-commands.netstat` | netstat 명령 | — | 이 컴퓨터의 연결과 **연결을 기다리는 포트**(열린 포트)를 보여 준다(Windows·Linux). **소켓**(IP 주소와 포트 번호로 정해지는 통신의 한쪽 끝 — 한 줄), **포트**(이 주제에서 처음이면 한 줄)를 푼다. 결과의 칸(프로토콜·로컬 주소·외부 주소·상태 — step 11이 확인한 이름대로)을 예 줄로 칸마다 읽는다: Linux 서버 `198.51.100.10`에서 `22`번이 연결을 기다리는 줄과, 클라이언트 `192.0.2.10:50001`이 그 포트와 연결을 맺은 줄(「예시 값」 — 출력의 꼴은 step 11이 확인한 만큼). **기다리는 상태(LISTEN)와 맺은 연결(ESTABLISHED)의 차이**(4절 — 상태 이름 표기는 step 11 summary와 `tcp-connection.tcp-states`대로). 쓰임 둘 — 쓰지 않는 서비스의 포트가 열려 있는지, 어느 외부 주소가 접속해 있는지. Linux에서 netstat이 낡아 `ss`가 대신한다는 것 한 줄. 옵션의 자세한 뜻은 이 개념에서 쓰지 않는다 — 예에 옵션이 필요하면 한 줄로 그 뜻만 |

### 2. 문항 — `src/data/network/questions.json`에 `n221`~`n223`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n221` | `pathping` | 4지선다 「상황 적용」 — 목적지까지 가는 길의 어느 라우터에서 패킷을 많이 잃는지 홉마다 비율로 알고 싶은 상황(본문과 다른 목적지 — 예: `203.0.113.10`)을 주고, 어떤 명령을 입력할지 고르게 한다. 정답: `pathping`. 오답은 같은 범주의 진단 명령으로 실제로 헷갈리는 것 — `tracert`(경로만 — 홉마다 잃은 비율을 보이지 않는다), `ping /t`(끝 상대 하나만), `netstat -r`(라우팅 테이블). 기출 묶음(`ping`·`nslookup`·`pathping`·`nbtstat`)과 보기 둘 이상이 다르다. **정답 위치 1** |
| `n222` | `netstat` | 4지선다 「출력 읽기」 — 본문과 다른 값의 netstat 결과 줄 몇 개(예: 서버 `198.51.100.20`의 `80`번이 기다리는 줄, 외부 주소 `203.0.113.10:50100`과 맺은 줄 — step 11이 확인한 꼴대로)를 주고, 지금 이 서버에 접속해 있는 외부 주소(또는 연결을 기다리는 포트)를 고르게 한다. 오답은 같은 줄들의 다른 칸 값 — 로컬 주소와 외부 주소를 바꿔 읽은 값, 기다리는 줄의 값을 맺은 연결로 읽은 값. 기출의 주소(`52.139.250.253`)를 쓰지 않는다. **정답 위치 2** |
| `n223` | `netstat` | 예/아니요 「원리 이해」 — n222 뒤의 균형(계획대로면 예 41·아니요 42)에서 **예** 쪽으로 세운다. 예: netstat 결과에서 상태가 기다리는 상태(LISTEN)인 줄의 로컬 포트로 다른 컴퓨터가 연결을 요청할 수 있는가(예 — 열린 포트). n222와 다른 것을 묻는다. 문제문이 답의 이유를 알려 주지 않게 한다. 해설은 기다리는 상태와 맺은 연결의 차이, 열린 포트를 확인하는 까닭을 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 42·아니요 42, 정답 위치 35/35/35/34.

### 3. 도식

#### 3-1. `diagnostic-commands.pathping` — `PathpingStatsDiagram`, JSON 키 `pathping-stats`

- 물음형 제목 예: `pathping은 어느 홉에서 잃는지 어떻게 알려 줄까?`
- 그릴 것: 두 단계 — ① 경로 찾기(tracert와 같은 경로 노드 넷), ② 통계 구하기(홉마다 요청을 여러 번 보내 잃은 비율 — 본문의 계산 예 값만). 단계를 그룹 박스로 나눈다. 홉마다의 비율을 표 모양 노드 줄로 둘지는 본문에 쓴 만큼(본문에 없는 홉의 값을 지어 두지 않는다).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `path` | 경로 찾기 | 경로 노드 | 먼저 tracert처럼 경로의 라우터를 찾는다 |
  | `stats` | 통계 | 통계 단계와 계산 예의 홉 | 라우터마다 요청을 여러 번 보내 잃은 비율을 계산한다 |
  | `compare` | tracert와 견주기 | 경로 노드와 비율 노드 | tracert는 경로만, pathping은 어디서 잃는지까지 보인다 |

- 요점 테스트: 경로 노드의 주소가 본문(13의 예)의 차례와 같다. `stats`에서 선명한 비율 노드의 라벨이 본문 계산 예의 결과(예 `10%`)와 같다. `path`에서는 비율 노드가 흐리다.

#### 3-2. `diagnostic-commands.netstat` — `NetstatRowsDiagram`, JSON 키 `netstat-rows`

- 물음형 제목 예: `netstat의 한 줄은 무엇을 말할까?`
- 그릴 것: 본문 예의 결과 줄 둘(기다리는 `22`번 줄, 맺은 연결 줄)을 표 모양으로 — 세로형에서는 줄 하나를 「칸 이름: 값」 노드 여럿으로 세운다(guide.md 「표 모양 그림」). 맺은 연결 줄의 외부 주소에서 클라이언트 `192.0.2.10` 노드로 잇는 경로를 둘지는 판단.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `listening` | 열린 포트 | 기다리는 줄의 칸 | 이 포트로 연결을 기다린다 — 열린 포트다 |
  | `established` | 맺은 연결 | 맺은 연결 줄의 칸 | 외부 주소의 컴퓨터와 연결이 맺어져 있다 |

- 요점 테스트: `listening`에서 선명한 상태 칸의 라벨이 기다리는 상태 이름(본문의 표기)이고 `established`에서는 맺은 연결의 상태 이름이다. `established`의 외부 주소 칸 라벨이 `192.0.2.10:50001`이다. 두 줄의 로컬 주소 칸 라벨에 `22`가 있다.

위 도식 설계는 출발점이다. 본문(step 11 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 223개, 마지막 id는 `n223`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. `tcp-connection.tcp-states`의 상태 이름 표기와 어긋나지 않는가. 출력 화면을 지어 보이지 않았는가(step 11 summary의 「출력 예」 판정).
3. 잃은 비율 계산을 손으로 다시 하고, n221·n222의 오답 셋이 정말 틀린지 따진다(n222는 줄을 칸 하나씩 다시 읽는다).
4. `phases/78-network-app-protocols-diagnostics/index.json`의 step 14를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 24·25를 만들거나 step 12·13의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
- **`tcp-connection` 주제의 글을 고치지 마라.** 이유: 앞 phase의 주제다. 어긋남을 찾으면 summary에 적는다.
- **step 11이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. pathping·netstat의 화면을 지어 보이지 마라.
- **netstat의 옵션을 항목으로 늘어놓지 마라.** 이유: step 15의 범위다(Windows·Linux 옵션).
