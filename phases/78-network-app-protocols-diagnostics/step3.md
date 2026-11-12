# Step 3: ftp-modes

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 `app-protocols-mail-file`의 개념 둘(5 FTP, 6 FTP의 능동 모드와 수동 모드)의 글·문항·도식을 함께 만든다.** 6은 5에 딸린 개념이다.

기출은 FTP가 연결 제어용과 정보 전송용 포트를 나눠 쓴다는 것([기출 2025-05-25 #11]), 데이터 채널이 전송마다 새로 맺어지고 끝나면 끊긴다는 것과 FTP가 UDP 69를 쓰지 않는다는 것([기출 2025-02-23 #14]),
FTP 접속이 계정 접속만 되는 것이 아니라는 것([기출 2024-08-25 #12]·[2026-02-01 #4]의 오답), 서버가 알려 준 포트로 클라이언트가 접속하는 수동 모드([기출 2026-08-02 #37])를 묻는다.

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 0 `summary`(FTP·모드에 무엇을 쓰고 무엇을 쓰지 않는지, 익명 FTP·데이터 연결 닫기의 근거, E 항목)와 step 1·2 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 RFC 959 항목과 「(phase 78 step 0)」 줄, RFC 1635·1579 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1·2가 쓴 `app-protocols-mail-file`의 네 개념**, `ports.well-known-ports`의 FTP 항목·`ports.client-server-ports`·`ip-address-types.nat` — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/visuals/app-protocols-mail-file.json`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1·2가 만든 도식과 그 테스트, 선례 `ThreeWayHandshakeDiagram`·`NaptPortsDiagram`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-08-25 #12], [기출 2024-11-03 #16], [기출 2025-02-23 #14], [기출 2025-05-25 #11], [기출 2026-02-01 #4], [기출 2026-08-02 #37] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `app-protocols-mail-file` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `app-protocols-mail-file.ftp` | FTP (File Transfer Protocol) | — | 파일을 주고받는 프로토콜, TCP, **연결 둘**. 예: 클라이언트 `192.0.2.10`이 서버 `198.51.100.10`의 `21`번으로 제어 연결을 맺고(클라이언트 쪽 포트 `50001` — 예시 값), 로그인한 뒤 `report.txt`를 내려받는 차례 — 명령은 제어 연결로, 파일 내용은 그때 맺는 데이터 연결로 오가고, 다 보내면 데이터 연결이 끊기며 제어 연결은 남는다(step 0 결과대로). 목록을 보고 파일을 하나 더 받으면 데이터 연결이 또 맺어진다는 것. **제어 연결과 데이터 연결이 무엇이 다른지**(4절 — 오가는 것, 얼마나 유지되는지, 서버 쪽 포트). 익명 FTP·암호화하지 않는다는 것은 step 0 결과대로. 데이터 연결을 누가 여는지는 이 개념에서 한 줄로만(두 방식이 있다) — 자세한 차례는 6의 몫이지만 「다음 개념에서」 같은 말은 쓰지 않는다 |
| 6 | `app-protocols-mail-file.ftp-modes` | FTP의 능동 모드와 수동 모드 | `ftp` | **목록 개념** — 소개 문단(데이터 연결을 누가 여는지에 따라 두 방식이 있다) 뒤에 항목 둘: `- **능동 모드**(active mode)는 …`, `- **수동 모드**(passive mode)는 …`. 각 항목에 누가 무엇을 보내고 누가 어느 포트로 연결을 여는지를 차례대로 — 능동: 클라이언트가 `PORT`로 자기 데이터 포트 `50002`를 알림 → 서버가 `20`번에서 클라이언트의 `50002`로 연결. 수동: 클라이언트가 `PASV` → 서버가 기다릴 포트 `50200`을 알림 → 클라이언트가 서버의 `50200`으로 연결(값은 「예시 값」). 항목 뒤 문단: 수동 모드를 쓰는 까닭(방화벽·NAT — step 0 결과대로), **능동과 수동에서 연결을 여는 쪽이 반대라는 것**(4절). 방화벽·NAT를 한 줄씩 푼다. 어느 쪽이 기본인지·서버의 수동 포트 범위는 step 0 결과대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n200`~`n202`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n200` | `ftp` | 4지선다 「원리 이해」 — 한 번 접속해 파일 셋을 차례로 내려받는 상황(본문 예와 다른 파일 수·이름)을 주고, 그동안 연결이 어떻게 되는지 고르게 한다. 정답: 제어 연결 하나가 내내 유지되고 데이터 연결은 파일마다 맺고 끊긴다(step 0 결과대로). 오답은 흔한 오해 — 연결 하나로 명령과 파일을 모두, 데이터 연결 하나를 유지하고 제어 연결을 파일마다, 파일마다 두 연결을 모두 새로. 기출 묶음(DNS·SMTP·TFTP·FTP, FTP 설명 넷)을 쓰지 않는다. **정답 위치 2** |
| `n201` | `ftp` | 예/아니요 「오해 바로잡기」 — step 2가 끝난 뒤의 균형(계획대로면 예 36·아니요 37)에서 **예** 쪽으로 세운다. 예: 그 서버에 자기 계정이 없는 사람도 FTP로 파일을 내려받을 수 있는가(예 — 서버가 익명 FTP를 허락하면). step 0이 익명 FTP의 근거를 찾지 못했으면 n200과 다른 것을 묻는 예 쪽 주장으로 바꾼다(예: 파일을 내려받는 동안에도 제어 연결로 다른 명령을 보낼 수 있는가 — 근거가 있을 때만) — 바꾸면 summary에. 「~만」·「반드시」를 쓰지 않는다. 해설은 로그인과 익명 FTP, 제어 연결이 맡는 일을 가르친다 |
| `n202` | `ftp-modes` | 4지선다 「상황 적용」 — 클라이언트 쪽 방화벽이 바깥에서 들어오는 연결을 막는 상황(문항의 주소·포트는 본문과 다른 값)을 주고, 파일을 받으려면 어느 모드에서 누가 어느 쪽으로 데이터 연결을 열어야 하는지 고르게 한다. 보기는 「모드 + 연결을 여는 쪽과 방향」의 같은 꼴 넷 — 연결을 여는 쪽을 바꾼 것, 포트(`20`·`21`·서버가 알려 준 포트)를 바꾼 것을 오답으로. 기출 묶음(Active·Passive·Privileges·Proxy)을 쓰지 않는다. **정답 위치 3** |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 37·아니요 37, 정답 위치 32/32/32/32.

### 3. 도식

#### 3-1. `app-protocols-mail-file.ftp` — `FtpConnectionsDiagram`, JSON 키 `ftp-connections`

- 물음형 제목 예: `FTP는 명령과 파일을 같은 연결로 보낼까?`
- 그릴 것: 두 기둥 — 클라이언트 `192.0.2.10`, 서버 `198.51.100.10` — 사이에 오래 이어지는 제어 연결(서버 `21`)을 한 줄로, 그리고 명령(`USER`·`PASS` → `RETR report.txt` → `QUIT` 등 본문의 차례)과 그때 맺고 끊기는 데이터 연결을 위에서 아래로. 데이터 연결은 제어 연결과 다른 줄(그룹 박스나 곁말로 「데이터 연결」)로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `control` | 제어 연결 | 제어 연결과 명령 노드 | 명령과 응답은 `21`번의 제어 연결로 오가고 접속해 있는 동안 남는다 |
  | `data` | 데이터 연결 | `RETR`과 데이터 연결·파일 노드 | 파일 내용은 그때 맺는 데이터 연결로 오가고 다 보내면 끊긴다 |
  | `next-file` | 다음 파일 | 두 번째 전송의 데이터 연결 | 파일을 하나 더 받으면 데이터 연결을 다시 맺는다 |

- 요점 테스트: `data`와 `next-file`에서 선명한 데이터 연결 노드의 id가 서로 다르다(전송마다 새 연결). 제어 연결 노드는 세 시나리오에서 모두 같은 하나다. 서버 쪽 라벨에 `21`이 있다.

#### 3-2. `app-protocols-mail-file.ftp-modes` — `FtpModesDiagram`, JSON 키 `ftp-modes`

- 물음형 제목 예: `데이터 연결은 누가 열까?`
- 그릴 것: 클라이언트·서버 두 기둥(클라이언트 쪽에 방화벽을 그룹 박스나 곁말로 — 본문에 쓴 만큼). 시나리오마다 제어 연결로 오가는 알림(`PORT 50002` 또는 `PASV` → 포트 `50200` 알림)과 데이터 연결의 방향을 다른 노드·다른 경로로 둔다 — 같은 자리에 겹쳐 두지 않는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `active` | 능동 모드 | `PORT` 노드, 서버 `20` → 클라이언트 `50002` 경로 | 서버가 `20`번에서 클라이언트가 알려 준 포트로 연결을 연다 |
  | `passive` | 수동 모드 | `PASV`와 포트 알림 노드, 클라이언트 → 서버 `50200` 경로 | 클라이언트가 서버가 알려 준 포트로 연결을 연다 |

- 요점 테스트: `active`에서 보이는 데이터 연결 경로는 서버 기둥에서 시작해 클라이언트 기둥에서 끝나고, `passive`에서는 반대다. `active`의 경로는 `passive`에서 보이지 않는다. `passive`에서 선명한 포트 노드 라벨에 `50200`이 있다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 202개, 마지막 id는 `n202`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 1·2가 이미 푼 낱말을 다시 풀지 않았는가.
   `ports.well-known-ports`의 FTP 항목(제어 `21`, 데이터 기본 `20`)과 어긋나지 않는가. 능동·수동 모드의 차례가 RFC 959 §3.2·§4.1.2와 같은가(문장을 옮기지 않고).
3. n200·n202의 상황을 연결 하나씩 따라가 정답과 오답 셋이 맞는지 따진다.
4. `phases/78-network-app-protocols-diagnostics/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 7·8을 만들거나 step 1·2의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
- **FTP의 전송 방식(ASCII·이진, 블록·압축 모드)과 SFTP·FTPS를 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
