# Step 2: pop3-imap

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 `app-protocols-mail-file`의 개념 둘(3 POP3, 4 IMAP)의 글·문항·도식을 함께 만든다.** 둘 다 1 `email-delivery`에 딸린 개념이다.

기출은 SMTP와 POP3의 차이(보내기와 받기 — [기출 2025-05-25 #14])와, POP3와 IMAP의 차이([기출 2026-05-17 #16] — POP3를 「서버에 보관하며 여러 기기에서 동기화」로, IMAP을 「내려받은 뒤 서버에서 삭제」로 바꿔 쓴 보기가 틀린 설명)를 묻는다.

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 0 `summary`(POP3·IMAP에 무엇을 쓰고 무엇을 쓰지 않는지, POP3 차례)와 step 1 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 78 step 0)」 줄과 RFC 1939·9051·8314 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1이 쓴 `app-protocols-mail-file`의 두 개념** — 이미 푼 낱말과 예시 값을 확인한다), `src/data/network/questions.json`, `src/data/network/visuals/app-protocols-mail-file.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1이 만든 `MailPathDiagram`·`SmtpDialogueDiagram`과 그 테스트, 선례 `ChmodChangeDiagram`(명령 전과 뒤), `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-05-25 #14], [기출 2026-05-17 #16] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `app-protocols-mail-file` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `app-protocols-mail-file.pop3` | POP3 (Post Office Protocol version 3) | `email-delivery` | 받는 사람의 메일 클라이언트가 메일함의 메일을 **내려받는** 프로토콜. TCP `110`. 차례 — 연결, 사용자 확인(사용자 이름과 암호), 목록 보기, 내려받기, 지울 표시, 끝낼 때 서버가 표시한 메일을 지운다(단계·명령 이름은 step 0 summary대로). 예: `user2@example.net`이 `mail.example.net`의 메일함에서 메일 두 통을 노트북으로 내려받고 지운다(「예시 값」). 그 뒤 휴대폰으로 같은 메일함을 열면 그 메일이 없다는 결과까지. 서버에 남겨 두는 쓰임·`995`는 step 0 결과대로. **SMTP와 무엇이 다른지**(4절 — 보내기와 가져오기, 누가 연결을 여는지) |
| 4 | `app-protocols-mail-file.imap` | IMAP (Internet Message Access Protocol) | `email-delivery` | 메일을 **서버에 둔 채** 메일함을 보고 다루는 프로토콜. TCP `143`(`993`은 step 0 결과대로). 폴더·읽음 표시·검색이 서버에 있어 노트북과 휴대폰이 같은 상태를 본다는 것을 예로 — 노트북에서 메일 한 통을 읽고 다른 폴더로 옮기면 휴대폰에서도 옮겨진 폴더에 읽음으로 보인다(「예시 값」). 지금 판 IMAP4rev2를 한 줄. **POP3와 무엇이 다른지**(4절) — 메일이 어디에 남는지, 여러 기기가 같은 상태를 보는지 |

### 2. 문항 — `src/data/network/questions.json`에 `n198`~`n199`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n198` | `pop3` | 예/아니요 「원인과 결과」 — step 1이 끝난 뒤의 균형(계획대로면 예 36·아니요 36)에서 **아니요** 쪽으로 세운다. 예: POP3로 메일을 내려받고 서버에서 지우게 둔 사람이 다른 기기로 같은 메일함을 열면 그 메일을 볼 수 있는가(아니요). 문제문이 답의 이유를 알려 주지 않게 한다. 해설은 POP3의 내려받고 지우는 차례와, 여러 기기에서 같은 메일을 보려면 무엇이 필요한지(IMAP)를 가르친다 |
| `n199` | `imap` | 4지선다 「원인과 결과」 — IMAP으로 같은 메일함을 쓰는 두 기기 가운데 한쪽에서 한 일(예: 메일을 지우거나 다른 폴더로 옮김 — 본문 예와 다른 일)을 문제문에 주고, 다른 기기에서 어떻게 보이는지 고르게 한다. 보기는 같은 범주(다른 기기에서 보이는 결과 넷 — 그 일이 반영됨, 그대로 원래 자리, 처음 기기에만 남음, 다른 기기에서 내려받은 뒤에만 반영 같은 흔한 오해). 기출의 POP3·IMAP 설명 넷 묶음을 쓰지 않는다. **정답 위치 1** |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 36·아니요 37, 정답 위치 32/32/31/31.

### 3. 도식

#### 3-1. `app-protocols-mail-file.pop3` — `Pop3DownloadDiagram`, JSON 키 `pop3-download`

- 물음형 제목 예: `POP3로 받은 메일은 어디에 남을까?`
- 그릴 것: 서버의 메일함(메일 두 통 노드)과 노트북·휴대폰. 내려받기 전과 뒤를 두 줄로 — 뒤 줄에서는 메일이 노트북에 있고 서버의 메일함은 비었다(곁말로 「지워짐」 — 색을 쓰지 않는다). 휴대폰에서 메일함을 열었을 때 빈 메일함을 보는 경로. 본문의 차례(사용자 확인 → 내려받기 → 지울 표시 → 끝낼 때 지움)를 그룹 박스나 곁말로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `download` | 내려받기 | 서버의 메일 두 통·노트북 | 노트북이 메일함의 메일을 내려받는다 |
  | `delete` | 지우기 | 끝낼 때의 서버 메일함(빈)·노트북의 메일 | 끝낼 때 서버가 표시한 메일을 지운다 |
  | `other-device` | 다른 기기 | 휴대폰·빈 메일함 | 다른 기기에서는 지워진 메일을 볼 수 없다 |

- 요점 테스트: `delete`에서 선명한 서버 쪽 메일 노드가 없다(뒤 줄의 메일함에 메일 노드가 없다). `download`의 경로가 서버 쪽에서 노트북 쪽으로 간다. `other-device`에서 노트북의 메일 노드는 흐리다.

#### 3-2. `app-protocols-mail-file.imap` — `ImapSyncDiagram`, JSON 키 `imap-sync`

- 물음형 제목 예: `IMAP을 쓰면 두 기기가 같은 메일함을 볼까?`
- 그릴 것: 서버 `mail.example.net`의 메일함과 폴더 둘(받은 편지함과 다른 폴더 하나 — 이름은 본문대로), 노트북·휴대폰이 각각 서버에 이어진 경로. 노트북에서 메일을 읽고 옮긴 일이 서버에 반영되고, 휴대폰이 그 상태를 보는 차례.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `keep` | 서버에 둔다 | 서버의 메일함·폴더 | 메일과 폴더는 서버에 남는다 |
  | `change` | 한 기기에서 | 노트북·옮긴 메일·읽음 표시 | 노트북에서 읽고 옮긴 일이 서버의 메일함에 반영된다 |
  | `sync` | 다른 기기에서 | 휴대폰·옮긴 폴더의 메일 | 휴대폰도 같은 상태를 본다 |

- 요점 테스트: `sync`에서 선명한 메일 노드가 원래 폴더가 아니라 옮긴 폴더 쪽에 있다. 모든 시나리오에서 메일 노드가 서버의 그룹 박스 안에 있다. `change`의 경로가 노트북에서 서버로 간다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 199개, 마지막 id는 `n199`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 1이 이미 푼 낱말을 다시 풀지 않았는가, 아직 안 푼 낱말을 풀었는가.
   step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. POP3의 차례와 명령 이름이 RFC 1939와 같은가(문장을 옮기지 않고).
3. n199의 상황을 따라가 정답과 오답 셋이 맞는지 따진다 — 오답이 IMAP에서 정말 틀린 결과인지.
4. `phases/78-network-app-protocols-diagnostics/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 5~8을 만들거나 step 1의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
- **IMAP의 명령 전체, POP3의 선택 명령(`TOP`·`UIDL` 등)을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
