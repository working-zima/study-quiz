# Step 10: sip

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 `app-protocols-mgmt-security`의 마지막 개념(17 SIP)의 글·문항·도식을 만들고, 이 주제를 끝낸다.** 개념이 하나이므로 쓰기를 마친 뒤 주제 전체를 통독하는 데 시간을 쓴다.

기출은 화상 회의를 하기 위한 기술의 빈칸에 SIP를 고르게 한다([기출 2025-11-02 #20] — 지문이 빠져 보기와 정답만 남았다. 보기는 IRC·HEVC/H.265·MIME·SIP).

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 5 `summary`(SIP에 무엇을 쓰고 무엇을 쓰지 않는지, 통화의 메시지 차례, 포트의 근거)와 step 6~9 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 78 step 5)」의 RFC 3261·8866 항목, RFC 3550 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 6~9가 쓴 이 주제의 여덟 개념**, `tcp-udp.transport-choice`의 실시간 음성·영상과 RTP 문단 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/visuals/app-protocols-mgmt-security.json`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 6~9가 만든 도식과 그 테스트, 선례 `ThreeWayHandshakeDiagram`·`ConnectionCloseDiagram`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-11-02 #20] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `app-protocols-mgmt-security` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 17 | `app-protocols-mgmt-security.sip` | SIP (Session Initiation Protocol) | — | **세션**(두 끝 이상이 음성·영상을 주고받는 한 번의 통화나 회의 — 한 줄)을 맺고 바꾸고 끝내는 신호용 프로토콜. 예: `sip:user1@example.com`이 `sip:user2@example.net`에 영상 통화를 거는 차례 — `INVITE` → `180 Ringing` → `200 OK` → `ACK` → 영상·음성이 RTP로 오감 → `BYE` → `200 OK`(step 5 summary의 차례대로, 「예시 값」). **RTP**(실시간 음성·영상을 나르는 프로토콜 — 한 줄)를 풀고, **SIP와 RTP가 무엇을 나눠 맡는지**(4절 — 통화를 맺고 끝내는 신호와 그 사이의 음성·영상). 음성·영상 방식을 SDP로 적는다는 것, SIP 주소 꼴, 포트(`5060`·`5061`), UDP·TCP 모두에서 돈다는 것은 step 5 결과대로. 화상 회의도 같은 방식으로 세션을 맺는다는 것은 근거대로 |

쓰기를 마친 뒤 **주제 `app-protocols-mgmt-security`의 아홉 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다.

### 2. 문항 — `src/data/network/questions.json`에 `n215`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n215` | `sip` | 4지선다 「개념 비교」 — SIP로 영상 통화를 맺은 뒤의 상황(본문 예와 다른 주소 — 예: `sip:user3@example.org`)을 주고, 통화하는 동안 영상과 음성이 무엇으로 오가는지(또는 통화를 끝낼 때 무엇을 보내는지) 고르게 한다. 정답은 RTP로 두 끝 사이에 오간다(또는 `BYE`). 오답은 같은 범주 — SIP 메시지(`INVITE`나 `ACK`) 안에 실려 간다, 메일처럼 SMTP로 간다, SIP 서버가 모아 두었다가 통화가 끝나면 넘긴다. 기출 묶음(`IRC`·`HEVC/H.265`·`MIME`·`SIP`)을 쓰지 않는다. **정답 위치 1** |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 40·아니요 41, 정답 위치 34/34/33/33.

### 3. 도식

#### 3-1. `app-protocols-mgmt-security.sip` — `SipCallDiagram`, JSON 키 `sip-call`

- 물음형 제목 예: `SIP 통화는 어떤 차례로 맺고 끝낼까?`
- 그릴 것: 두 기둥 — 거는 쪽 `sip:user1@example.com`, 받는 쪽 `sip:user2@example.net` — 사이에 본문의 메시지를 위에서 아래로(`INVITE` → `180 Ringing` → `200 OK` → `ACK` → RTP 구간 → `BYE` → `200 OK`). RTP 구간은 SIP 메시지와 다른 꼴(그룹 박스나 곁말 「RTP — 음성·영상」)로 가른다. 280 폭에 메시지 일곱 개가 세로로 들도록 노드를 쌓는다 — 들지 않으면 그룹 박스로 맺기·통화·끝내기를 나눈다(바꾼 것은 summary에). SIP 서버(프록시)를 그릴지는 본문에 쓴 만큼.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `setup` | 맺기 | `INVITE`·`180 Ringing`·`200 OK`·`ACK` | 거는 쪽이 초대하고, 받는 쪽이 받으면 확인으로 맺는다 |
  | `media` | 통화 | RTP 구간 | 음성·영상은 SIP가 아니라 RTP로 두 끝 사이에 오간다 |
  | `teardown` | 끝내기 | `BYE`·`200 OK` | 한쪽이 `BYE`를 보내 통화를 끝낸다 |

- 요점 테스트: SIP 메시지 노드의 위아래 차례가 step 5 summary의 차례와 같다. `media`에서 선명한 노드에 SIP 메시지 이름이 없고 RTP가 있다. `INVITE` 노드는 거는 쪽에서 받는 쪽으로, 첫 `200 OK` 노드는 받는 쪽에서 거는 쪽으로 가는 화살표를 갖는다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 215개, 마지막 id는 `n215`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 통화 차례와 메시지 이름이 step 5 summary·RFC 3261과 같은가(RFC의 예에 쓰인 이름·주소를 옮기지 않았는가).
3. n215의 오답 셋이 정말 틀린지 따진다.
4. 주제 `app-protocols-mgmt-security`의 아홉 개념을 통독한다(「작업」 1).
5. `phases/78-network-app-protocols-diagnostics/index.json`의 step 10을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(「앞 개념에 고칠 것」에 통독 결과).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **step 6~9의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
- **step 5가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
- **SIP 응답 코드 전체, `REGISTER`·프록시·리다이렉트 서버의 동작, SDP의 줄 꼴을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」). 본문에 꼭 필요한 한 줄만 근거대로 쓴다.
- **진단 명령 주제의 개념을 만들지 마라.** 이유: step 12~15의 범위다.
