# Step 1: mail-path-smtp

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 주제 `app-protocols-mail-file`을 만들고 그 첫 개념 둘(1 전자우편의 전달 과정, 2 SMTP)의 글·문항·도식을 함께 만든다.** 2는 1에 딸린 개념이다.

기출은 SMTP가 무엇을 하는 프로토콜인지 네 번 묻는다 — 보기는 파일 전송·하이퍼텍스트·원격 접속·망 관리 같은 다른 응용 프로토콜의 일이다. 그리고 SMTP와 POP3의 차이(보내기와 받아 오기)를 묻는다.

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 0 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지, SMTP 대화의 명령·응답 코드 차례)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 78 step 0)」 줄과 RFC 5321·5598 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `ports.well-known-ports`·`tcp-udp.transport-choice` — SMTP·TCP·포트를 어떻게 풀었는지, 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `ThreeWayHandshakeDiagram`·`IcmpFeedbackDiagram`(두 장치 사이 차례), `ArpHopsDiagram`(길과 구간)과 그 테스트, `src/data/network/visuals/tcp-connection.json`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-02-25 #7], [기출 2024-08-25 #9], [기출 2025-02-23 #13], [기출 2025-05-25 #14] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`tcp-connection` 주제 객체 바로 뒤에 주제 객체를 더한다 — `{ "id": "app-protocols-mail-file", "title": "메일·파일 전송·원격 접속 프로토콜", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 3(★★★, 출제 9/11회)인지 `data.test.ts`의 주제 지도 표와 견준다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `app-protocols-mail-file.email-delivery` | 전자우편의 전달 과정 | — | 이 주제의 첫 개념이라 **프로토콜**(컴퓨터끼리 주고받는 방법을 정한 약속), **클라이언트와 서버**(요청하는 쪽과 받아서 처리해 주는 쪽), **TCP**(데이터를 순서대로 빠짐없이 전해 주는 전송 방식 — 한 줄), **포트**(한 컴퓨터 안에서 데이터를 받을 프로그램을 가리키는 번호 — 한 줄), **도메인**(`example.com`처럼 사람이 읽는 이름 — 한 줄)을 짧게 푼다(`ports`·`tcp-udp` 주제의 말과 뜻을 맞춘다). 메일 클라이언트·메일 서버·메일함이 무엇인지, 보내는 사람 `user1@example.com`의 메일이 `mail.example.com`과 `mail.example.net`을 거쳐 받는 사람 `user2@example.net`의 메일함에 쌓이고 받는 사람이 나중에 가져가는 차례를 구간마다 쓰는 프로토콜과 함께(guide.md 「예시 값」 — 예로 붙인 주소라고 밝힌다). **보내는 일과 가져오는 일에 다른 프로토콜을 쓰는 까닭**(4절). MX 레코드·역할의 영문 이름은 step 0 결과대로 |
| 2 | `app-protocols-mail-file.smtp` | SMTP (Simple Mail Transfer Protocol) | `email-delivery` | SMTP가 메일을 **넘기는** 프로토콜이라는 것, 보낼 메일을 가진 쪽이 연결을 열고 넘긴다는 것, 메일 클라이언트 → 자기 서버와 서버 → 받는 쪽 서버가 **모두 SMTP**라는 것, 포트 `25`(제출 `587`은 step 0 결과대로). 대화 예 — `mail.example.com`이 `mail.example.net`에 `user2@example.net` 앞 메일 한 통을 넘기는 차례를 명령과 응답 코드로(step 0 summary의 차례대로, 값은 예시 값). **SMTP는 메일함의 메일을 꺼내 오지 않는다**(4절 — POP3·IMAP은 이름과 한 줄씩만, 자세한 동작은 그 개념의 몫이지만 「다음 개념에서」 같은 말은 쓰지 않는다). TCP를 쓰는 까닭 한 줄 |

### 2. 문항 — `src/data/network/questions.json`에 `n196`~`n197`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n196` | `email-delivery` | 4지선다 「상황 적용」 — 본문과 다른 주소의 메일 한 통(예: `user3@example.org`가 `user4@example.com`에게)의 길을 문제문에 주고, 어느 구간에서 어떤 프로토콜이 쓰이는지를 고르게 한다(예: 「받는 사람이 자기 메일함의 메일을 휴대폰으로 가져오는 구간에 쓰는 것」 — 또는 「보내는 쪽 서버가 받는 쪽 서버로 넘기는 구간」). 보기는 같은 범주(메일 구간에 쓰는 프로토콜이나 그 조합)로 — 기출 묶음(`SNMP`·`SMTP`·`VT`·`FTP`, 파일·우편·하이퍼텍스트·원격 접속)을 쓰지 않는다. **정답 위치 0** |
| `n197` | `smtp` | 예/아니요 「오해 바로잡기」 — 시작 때 균형(예 35·아니요 36)에서 **예** 쪽으로 세운다. 예: 보내는 쪽 메일 서버가 받는 쪽 메일 서버에 메일을 넘길 때도 SMTP를 쓰는가(예 — 「SMTP는 메일 클라이언트에서 서버로만」이라는 오해). 문제문이 답의 이유를 알려 주지 않게 한다. 해설은 SMTP가 쓰이는 두 구간과, 메일함에서 가져오는 구간은 SMTP가 아니라는 것을 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 36·아니요 36, 정답 위치 32/31/31/31.

### 3. 도식

이 step이 `src/data/network/visuals/app-protocols-mail-file.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'app-protocols-mail-file': appProtocolsMailFileVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `app-protocols-mail-file.email-delivery` — `MailPathDiagram`, JSON 키 `mail-path`

- 물음형 제목 예: `메일은 어떤 길을 지나 받는 사람에게 갈까?`
- 그릴 것: 장치 넷 — 보내는 사람의 메일 클라이언트, `mail.example.com`, `mail.example.net`(안에 받는 사람의 메일함 — 그룹 박스나 곁말), 받는 사람의 메일 클라이언트 — 을 길 차례로(세로형은 위에서 아래로). 구간 셋을 경로로 잇고 구간마다 곁말로 프로토콜(SMTP·SMTP·POP3나 IMAP)을 단다. 「보내기」 구간 둘과 「가져오기」 구간 하나를 가르는 표시(그룹 박스나 곁말).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `send` | 보내기 | 보내는 사람의 클라이언트·두 서버와 SMTP 구간 둘 | 보내는 쪽이 연결을 열어 받는 쪽 서버의 메일함까지 넘긴다 |
  | `store` | 메일함 | `mail.example.net`과 메일함 | 받는 사람이 접속해 있지 않아도 메일은 메일함에 쌓인다 |
  | `fetch` | 가져오기 | 메일함과 받는 사람의 클라이언트, POP3나 IMAP 구간 | 받는 사람이 나중에 접속해 메일함에서 가져온다 — SMTP가 아니다 |

- 요점 테스트: `send`에서 보이는 경로 둘의 곁말이 모두 SMTP이고 `fetch`에서 보이는 경로의 곁말은 SMTP가 아니다. `fetch`에서 선명한 노드에 보내는 사람의 클라이언트가 없다. 노드의 위아래(가로형은 왼쪽·오른쪽) 차례가 본문의 차례와 같다.

#### 3-2. `app-protocols-mail-file.smtp` — `SmtpDialogueDiagram`, JSON 키 `smtp-dialogue`

- 물음형 제목 예: `SMTP로 메일 한 통을 넘길 때 무엇을 주고받을까?`
- 그릴 것: 두 기둥 — 왼쪽 SMTP 클라이언트(`mail.example.com`), 오른쪽 SMTP 서버(`mail.example.net`, 포트 `25`) — 사이에 본문 대화 예의 명령과 응답을 위에서 아래로 차례대로(메시지 노드 하나에 명령 하나나 응답 코드 하나, 방향은 노드 양옆의 짧은 화살표). 280 폭에 다 들지 않으면 명령과 그 응답을 한 줄 노드(`MAIL FROM` → `250`)로 묶거나 그룹 박스로 단계를 나눈다 — 바꾼 것은 summary에.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `envelope` | 주고받을 사람 | `MAIL FROM`·`RCPT TO`와 그 응답 | 보내는 사람과 받는 사람을 먼저 알린다 |
  | `data` | 본문 | `DATA`·본문·끝 표시와 그 응답 | 본문을 넘기고 서버가 받았다고 답한다 |
  | `quit` | 끝 | `QUIT`과 응답 | 연결을 닫는다 — 메일은 이제 받는 쪽 서버에 있다 |

- 요점 테스트: 명령 노드는 모두 클라이언트 쪽에서 서버 쪽으로 가는 화살표를 갖고 응답 노드는 반대 방향이다. 명령 노드의 위아래 차례가 `EHLO` → `MAIL FROM` → `RCPT TO` → `DATA` → `QUIT`(step 0이 정한 차례)이다. 서버 기둥 라벨에 `25`가 있다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 197개, 마지막 id는 `n197`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `tcp-connection` 바로 뒤·`linux-filesystem` 앞에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. SMTP 대화의 차례와 응답 코드가 RFC 5321과 같은가(문장을 옮기지 않고).
4. n196의 상황을 구간 하나씩 따라가 정답과 오답 셋이 맞는지 따진다.
5. `phases/78-network-app-protocols-diagnostics/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~8을 만들지 마라.** 이유: step 2~4의 범위다. 이 step의 글이 POP3·IMAP을 쓸 때는 이름과 한 줄 풀이로 그친다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
- **SMTP의 확장 명령·인증·암호화(STARTTLS 등)를 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
