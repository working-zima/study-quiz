# Step 8: ntp-sntp

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 `app-protocols-mgmt-security`의 개념 둘(13 NTP, 14 SNTP)의 글·문항·도식을 함께 만든다.** 14는 13에 딸린 개념이다.

기출은 빈칸에 들어갈 시각 맞추기 프로토콜로 SNTP를 고르게 한다(2회 — 지문이 빠져 보기와 정답만 남았다. 보기는 SNMP·SNTP·SMTP·HTTP, 기출 분석은 포트 123을 적었다).

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 5 `summary`(NTP·SNTP에 무엇을 쓰고 무엇을 쓰지 않는지, stratum의 근거)와 step 6·7 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(RFC 5905 항목과 그 「(phase 78 step 5)」 줄, RFC 4330), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 6·7이 쓴 `app-protocols-mgmt-security`의 네 개념** — 이미 푼 낱말, `tcp-udp.transport-choice`의 NTP 문단 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/visuals/app-protocols-mgmt-security.json`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 6·7이 만든 도식과 그 테스트, 선례 `DirectoryTreeDiagram`(위에서 아래로 잇는 나무), `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-05-19 #15], [기출 2025-08-24 #17] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `app-protocols-mgmt-security` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 13 | `app-protocols-mgmt-security.ntp` | NTP (Network Time Protocol) | — | 네트워크로 시계를 맞춘다, UDP `123`. 클라이언트가 묻고 서버가 답하는 차례와, 메시지에 실린 시각으로 오가는 데 걸린 시간을 감안한다는 원리 한 줄(계산식 없이). **stratum** — 예: 기준 시계에 바로 붙은 서버(stratum 1)에서 회사의 시각 서버(stratum 2)가 시각을 받고, 회사의 PC들이 그 서버에서 받는다(이름표 — 「예시 값」). 숫자가 클수록 기준에서 멀다는 것과 상한·16의 뜻, 기준 시계의 예, 여러 서버를 견주어 고르는 것은 step 5 결과대로. 지금 판 NTPv4 한 줄. 이 주제 안의 앞 개념이 푼 말(UDP·포트)은 다시 풀지 않는다 |
| 14 | `app-protocols-mgmt-security.sntp` | SNTP (Simple Network Time Protocol) | `ntp` | NTP를 단순하게 줄인 방식 — 메시지 꼴과 UDP `123`이 같아 SNTP 클라이언트가 NTP 서버에 물을 수 있다는 것, NTP의 어떤 알고리즘을 쓰지 않는지(step 5 결과대로 — 이름을 늘어놓지 말고 무엇을 하지 않는지로), 어떤 기기에 맞는지. 예: 회사의 시각 서버(stratum 2 — 13의 예)에 PC 하나는 NTP로, 작은 기기 하나는 SNTP로 묻는다(이름표). **NTP와 무엇이 다른지**(4절 — 여러 서버를 견주는지, 얼마나 정확해야 하는지). RFC 4330과 RFC 5905 §14의 관계는 step 5 결과대로 한 줄 |

### 2. 문항 — `src/data/network/questions.json`에 `n211`~`n212`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n211` | `ntp` | 4지선다 「원리 이해」 — stratum의 차례를 주는 상황(본문 예와 다른 차례 — 예: stratum 2 서버에서 시각을 받아 다른 컴퓨터에 알려 주는 서버)을 주고, 그 서버의 stratum을 고르게 한다. 정답은 step 5가 확인한 규칙(받은 서버의 수 + 1)대로. 오답은 흔한 실수 — 받은 서버와 같은 수, 하나 작은 수, 둘 큰 수. 계산을 해설에 단계대로. 기출 묶음(SNMP·SNTP·SMTP·HTTP)을 쓰지 않는다. **정답 위치 3** |
| `n212` | `sntp` | 예/아니요 「오해 바로잡기」 — step 7이 끝난 뒤의 균형(계획대로면 예 39·아니요 40)에서 **예** 쪽으로 세운다. 예: SNTP를 쓰는 기기가 NTP 서버에 시각을 물어 자기 시계를 맞출 수 있는가(예 — step 5가 근거를 확인했을 때). 문제문이 답의 이유(같은 메시지 꼴)를 알려 주지 않게 한다. 해설은 SNTP가 NTP와 같은 것(메시지 꼴·포트)과 다른 것(줄인 알고리즘)을 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 40·아니요 40, 정답 위치 33/33/33/33.

### 3. 도식

#### 3-1. `app-protocols-mgmt-security.ntp` — `NtpStratumDiagram`, JSON 키 `ntp-stratum`

- 물음형 제목 예: `시각은 어떤 차례로 전해질까?`
- 그릴 것: 기준 시계 → stratum 1 서버 → stratum 2 서버 → PC 둘을 위에서 아래로 직교 경로로(가로형은 왼쪽에서 오른쪽). 층마다 곁말로 stratum 번호, 경로 곁말에 UDP `123`. 클라이언트가 묻고 서버가 답하는 한 쌍(질문·답 노드)을 곁에 둘지는 판단.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `source` | 기준 시계 | 기준 시계·stratum 1 서버 | 기준 시계에 바로 붙은 서버가 stratum 1이다 |
  | `chain` | 이어 받기 | stratum 1·2 서버 | 위 서버에서 시각을 받는 서버는 숫자가 하나 커진다 |
  | `client` | 클라이언트 | stratum 2 서버·PC | PC는 UDP `123`으로 서버에 묻고 답을 받아 시계를 맞춘다 |

- 요점 테스트: 층 노드의 stratum 번호가 위에서 아래로 하나씩 커진다. `client`에서 보이는 경로의 곁말에 `123`이 있다. 기준 시계 노드는 `source`에서만 선명하다(`chain`·`client`에서 흐리다).

#### 3-2. `app-protocols-mgmt-security.sntp` — `SntpClientDiagram`, JSON 키 `sntp-client`

- 물음형 제목 예: `SNTP는 NTP와 무엇이 다를까?`
- 그릴 것: 두 클라이언트 — NTP 클라이언트(PC)는 서버 여럿에 묻고 그 가운데 고르는 경로, SNTP 클라이언트(작은 기기)는 서버 하나에 묻는 경로. 서버 쪽 노드는 본문에 나온 것만(13의 stratum 2 서버 등). 두 경로 모두 곁말에 UDP `123`.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `ntp-client` | NTP | PC와 서버 여럿, 견주는 경로 | NTP는 여러 서버의 답을 견주어 믿을 만한 값을 고른다 |
  | `sntp-client` | SNTP | 작은 기기와 서버 하나 | SNTP는 같은 메시지로 서버 하나에 묻고 그 답으로 맞춘다 |

- 요점 테스트: `sntp-client`에서 보이는 질문 경로가 하나이고 `ntp-client`에서는 둘 이상이다. 두 시나리오의 경로 곁말 모두에 `123`이 있다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면(예: 여러 서버를 견준다는 근거가 없으면) 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 212개, 마지막 id는 `n212`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. `tcp-udp.transport-choice`의 NTP 문단과 어긋나지 않는가.
   step 5 summary가 「쓰지 않는다」로 정한 것(계산식 등)을 지켰는가.
3. n211의 stratum 계산을 손으로 다시 하고 오답 셋이 정말 틀린지 따진다.
4. `phases/78-network-app-protocols-diagnostics/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 15~17을 만들거나 step 6·7의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
- **step 5가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
- **NTP의 시각 계산식(지연·오프셋), 패킷 칸, 알고리즘 이름 목록을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
