# Step 4: tftp-ssh

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 `app-protocols-mail-file`의 마지막 개념 둘(7 TFTP, 8 SSH)의 글·문항·도식을 함께 만들고, 이 주제를 끝낸다.**

기출은 TFTP가 TCP를 쓰지 않는다는 것(TCP를 쓰는 것 고르기의 오답 — 3회), TFTP의 특징([기출 2024-02-25 #8]·[2024-08-25 #12]·[2026-02-01 #4] — step 0이 E 항목으로 판정한 것 포함),
SSH의 특징(암호화·무결성·공개 키, Linux·Unix에서만 쓰는 것이 아니다 — [기출 2024-08-25 #14]·[2026-02-01 #2]), 원격 접속 구성 요소 SSH([기출 2025-02-23 #41] — 지문 없음)를 묻는다.

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 0 `summary`(TFTP·SSH에 무엇을 쓰고 무엇을 쓰지 않는지, **TFTP의 E 항목**)와 step 1~3 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(RFC 1350·4251·4252·4253·854·2941·2946 항목과 「(phase 78 step 0)」 줄, OpenSSH 항목), `docs/source/network/exam-notes.md`(step 0이 더한 E 항목)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1~3이 쓴 `app-protocols-mail-file`의 여섯 개념**, `tcp-udp.transport-choice`의 TFTP 문단, `ports.well-known-ports`의 SSH·Telnet 항목 — 뜻과 값을 맞춘다), `src/data/network/questions.json`(n187 — TFTP를 이미 묻는다, 다른 것을 묻는다),
  `src/data/network/visuals/app-protocols-mail-file.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1~3이 만든 도식과 그 테스트, `tcp-udp.transport-choice`의 도식(`src/components/diagrams/registry.ts`에서 찾는다), 선례 `ThreeWayHandshakeDiagram`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-02-25 #8], [기출 2024-05-19 #9], [기출 2024-08-25 #12·#14], [기출 2025-02-23 #41], [기출 2025-05-25 #5], [기출 2026-02-01 #2·#4] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `app-protocols-mail-file` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `app-protocols-mail-file.tftp` | TFTP (Trivial File Transfer Protocol) | — | UDP(데이터를 확인 없이 따로따로 보내는 전송 방식 — 한 줄, `tcp-udp`와 뜻을 맞춘다)를 쓰는 아주 단순한 파일 전송, 서버 `69`. 로그인·목록이 없다. 예: 클라이언트가 1,300바이트 파일 `config.txt`를 내려받는 차례 — 블록 1(512바이트) → 확인 응답 1 → 블록 2(512바이트) → 확인 응답 2 → 블록 3(276바이트 — 512보다 짧아 끝) → 확인 응답 3. **1,300 − 512 − 512 = 276**을 단계대로 보인다(「예시 값」). 블록을 잃으면 시간 초과 뒤 다시 보낸다는 것과 그 차례. 요청 뒤 서버가 다른 포트로 보내는지·512의 배수일 때의 끝 표시는 step 0 결과대로(쓸지는 판단). **FTP와 무엇이 다른지**(4절 — TCP·UDP, 연결 둘과 없음, 로그인, 목록). 자격시험 줄은 step 0의 E 항목대로 — 본문은 RFC 1350의 사실을 쓰고 「자격시험은 …로 본다」를 한 줄 |
| 8 | `app-protocols-mail-file.ssh` | SSH (Secure Shell) | — | 원격 접속(한 줄)을 **암호화한 통로**로, TCP `22`. 하는 일 셋(서버 인증·암호화·무결성)과 사용자 인증(암호·공개 키), 공개 키 암호(한 줄)를 푼다. 명령 예 `ssh user1@198.51.100.10`을 입력하면 무엇이 일어나는지 차례대로 — TCP 연결 → 서버가 호스트 키로 자신을 증명 → (처음이면 사용자에게 그 키를 믿을지 묻는다 — 출처가 보이는 만큼) → 사용자 인증 → 암호화된 통로로 명령과 결과가 오간다(step 0 결과대로). **Telnet과 무엇이 다른지**(4절). Windows에도 OpenSSH가 들어 있다는 것(step 0 결과 — 적용 대상 판을 맞게) — Linux·Unix만의 도구가 아니다 |

이 step의 개념이 이 주제의 마지막이다. 쓰기를 마친 뒤 **주제 `app-protocols-mail-file`의 여덟 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다.

### 2. 문항 — `src/data/network/questions.json`에 `n203`~`n205`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n203` | `tftp` | 4지선다 「개념 비교」 — TFTP에 맞는 설명을 고르게 한다. 정답은 UDP·`69`·블록마다 확인 응답 같은 RFC 1350의 사실 하나. 오답은 FTP의 성질을 TFTP에 붙인 것(TCP로 연결을 맺는다, 로그인한 뒤 목록을 본다)과 흔한 오해(잃은 블록을 다시 보내지 않는다 — step 0의 E 항목이 이 말을 문항에서 어떻게 다루라고 했는지 따른다. 맞는 설명으로 쓰지 말라고 했으면 오답으로 두는 것은 표준과 맞으므로 쓸 수 있다). n187(TFTP — `tcp-udp`)과 다른 것을 묻는지 본다. 기출 묶음(TFTP 설명 넷, FTP·TFTP 특징 넷, TCP를 쓰는 것 넷)을 쓰지 않는다. **정답 위치 0** |
| `n204` | `tftp` | 예/아니요 「오해 바로잡기」 — step 3이 끝난 뒤의 균형(계획대로면 예 37·아니요 37)에서 **아니요** 쪽으로 세운다. 예: TFTP 클라이언트가 서버에 접속해 그 서버에 있는 파일 목록을 받아 볼 수 있는가(아니요). n203과 다른 것을 묻는다. 해설은 TFTP가 하는 일(읽기·쓰기)과 하지 않는 일(목록·로그인), 그것이 필요하면 무엇을 쓰는지(FTP)를 가르친다 |
| `n205` | `ssh` | 예/아니요 「오해 바로잡기」 — n204 뒤의 균형(계획대로면 예 37·아니요 38)에서 **예** 쪽으로 세운다. 예: Windows 컴퓨터에서 SSH로 다른 컴퓨터에 원격 접속할 수 있는가(예 — step 0이 근거를 확인했을 때), 또는 SSH가 주고받는 내용이 도중에 바뀌었는지도 알아내는가(예 — 무결성). 문제문이 답의 이유를 알려 주지 않게 한다. 해설은 SSH가 하는 일 셋과 Telnet과의 차이를 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 38·아니요 38, 정답 위치 33/32/32/32.

### 3. 도식

#### 3-1. `app-protocols-mail-file.tftp` — `TftpBlocksDiagram`, JSON 키 `tftp-blocks`

- 물음형 제목 예: `TFTP는 파일을 어떻게 나눠 보낼까?`
- 그릴 것: 두 기둥 — 클라이언트, 서버(`69`) — 사이에 요청 → 블록 1(`512`) → 확인 응답 1 → 블록 2(`512`) → 확인 응답 2 → 블록 3(`276`) → 확인 응답 3을 위에서 아래로. 잃은 블록과 다시 보내는 차례는 별도 노드(다른 id)로 — 시나리오에서만 보인다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `lockstep` | 블록마다 | 블록 1·확인 응답 1·블록 2 | 확인 응답을 받아야 다음 블록을 보낸다 |
  | `last` | 끝 | 블록 3(`276`)·확인 응답 3 | 512바이트보다 짧은 블록이 전송의 끝을 알린다 |
  | `lost` | 잃었을 때 | 잃은 블록(흐림·곁말 「사라짐」)·다시 보낸 블록 | 시간 초과 뒤 다시 보내 채운다 |

- 요점 테스트: 블록 노드의 크기 라벨을 차례대로 더하면 `1300`이다. `last`에서 선명한 블록 노드의 라벨에 `276`이 있다. `lost`의 다시 보낸 블록 노드는 다른 시나리오에서 보이지 않는다. 확인 응답 노드는 모두 클라이언트에서 서버로 가는 방향이다(내려받기 예일 때 — 본문의 방향대로).

#### 3-2. `app-protocols-mail-file.ssh` — `SshSessionDiagram`, JSON 키 `ssh-session`

- 물음형 제목 예: `SSH는 원격 접속의 무엇을 지켜 줄까?`
- 그릴 것: 두 기둥 — 사용자의 컴퓨터(`ssh user1@198.51.100.10`), 서버 `198.51.100.10`(`22`) — 사이에 본문의 차례(TCP 연결 → 서버가 호스트 키로 증명 → 사용자 인증 → 암호화된 통로로 명령과 결과)를 위에서 아래로. 비교로 Telnet(`23`)의 한 줄 — 암호가 그대로 보이는 경로(곁말 「그대로 보임」 — 색이나 자물쇠 그림을 쓰지 않는다).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `server-auth` | 서버 확인 | 호스트 키 노드 | 접속한 서버가 진짜인지 호스트 키로 확인한다 |
  | `user-auth` | 사용자 확인 | 사용자 인증 노드 | 사용자는 암호나 공개 키로 자신을 증명한다 |
  | `channel` | 암호화된 통로 | 명령·결과 노드 | 오가는 내용은 암호화되고 바뀌었는지도 확인한다 |
  | `telnet` | Telnet과 견주기 | Telnet 노드와 경로 | Telnet은 기본으로 암호화하지 않아 암호까지 그대로 보인다 |

- 요점 테스트: `channel`의 곁말에 암호화가, `telnet`의 곁말에 「그대로」가 있다. `telnet`에서 선명한 노드 라벨에 `23`이 있고 `server-auth`·`user-auth`·`channel`에서는 Telnet 노드가 흐리다. 서버 기둥 라벨에 `22`가 있다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 205개, 마지막 id는 `n205`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 0의 E 항목대로 「자격시험은」 줄을 썼는가, TFTP의 잃음을 도식에 사실처럼 그리지 않았는가.
   `tcp-udp.transport-choice`의 TFTP 문단·`ports.well-known-ports`의 SSH·Telnet 항목과 어긋나지 않는가.
3. 블록 계산(1,300 = 512 + 512 + 276)을 손으로 다시 하고, n203의 오답 셋이 RFC 1350에 비추어 정말 틀린지 따진다.
4. 주제 `app-protocols-mail-file`의 여덟 개념을 통독한다(「작업」 1).
5. `phases/78-network-app-protocols-diagnostics/index.json`의 step 4를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(「앞 개념에 고칠 것」에 통독 결과).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **step 1~3의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
- **SSH의 키 교환·암호 알고리즘 이름, 포트 포워딩, `scp`·`sftp`를 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **관리·보안 프로토콜 주제의 개념을 만들지 마라.** 이유: step 6~10의 범위다.
