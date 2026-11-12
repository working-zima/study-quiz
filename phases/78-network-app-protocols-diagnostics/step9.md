# Step 9: tls-https

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 `app-protocols-mgmt-security`의 개념 둘(15 TLS, 16 HTTPS)의 글·문항·도식을 함께 만든다.** 16은 15에 딸린 개념이다.

기출은 HTTPS의 특징(기존 HTTP에 SSL/TLS 암호화를 더한다 — 정답, TCP 80·UDP 443·인증 불필요는 오답 — [기출 2024-08-25 #8]·[2026-02-01 #12])과,
TLS로 응용 계층의 데이터를 암호화하는 프로토콜이 HTTPS라는 것([기출 2025-05-25 #16])을 묻는다.

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 5 `summary`(TLS·HTTPS에 무엇을 쓰고 무엇을 쓰지 않는지, 간추린 핸드셰이크 차례, SSL의 근거, E 항목)와 step 6~8 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(RFC 9846·9110·9114 항목과 「(phase 78 step 5)」 줄, RFC 5280·7568), `docs/source/network/exam-notes.md`(**E28** — HTTPS와 UDP 443, step 5가 더한 항목)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 6~8이 쓴 이 주제의 여섯 개념**, `ports.well-known-ports`의 HTTPS 항목과 그 문단, `tcp-udp.transport-choice`의 HTTP/3 문단 — 뜻과 「자격시험은」 줄을 맞춘다), `src/data/network/questions.json`,
  `src/data/network/visuals/app-protocols-mgmt-security.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 6~8이 만든 도식과 그 테스트, 선례 `ThreeWayHandshakeDiagram`(두 기둥 사이 차례), `LayerMappingDiagram`(계층 쌓기 — `src/components/diagrams/registry.ts`에서 찾는다), `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-08-25 #8], [기출 2025-05-25 #16], [기출 2026-02-01 #12] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `app-protocols-mgmt-security` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 15 | `app-protocols-mgmt-security.tls` | TLS (Transport Layer Security) | — | 하는 일 셋(암호화, 상대 확인 — 서버는 인증서로, 바뀌었는지 확인)과 자리(TCP 위·응용 프로토콜 아래). **암호화**(한 줄 — 앞 개념에서 풀었으면 다시 풀지 않는다), **공개 키 암호**(한 줄), **인증서**와 **인증 기관**(한 줄씩)을 푼다. 예: 웹 브라우저가 `www.example.com`의 서버와 TLS로 통신을 시작하는 차례 — step 5 summary의 간추린 핸드셰이크(인사 → 서버의 인증서 → 끝맺음 확인) → 그 뒤 데이터는 암호화(「예시 값」). **SSL과 무엇이 다른지**(4절 — SSL은 TLS 앞의 프로토콜이고 결함 때문에 쓰지 않게 정해졌다, 「SSL/TLS」는 둘을 아울러 부르는 말). 지금 판 TLS 1.3. step 5의 E 항목이 있으면 그대로 |
| 16 | `app-protocols-mgmt-security.https` | HTTPS | `tls` | HTTP(한 줄)를 TLS로 보호한 것, `https://` 주소, TCP `443`(HTTP `80`). 같은 `www.example.com`을 `http://`와 `https://`로 열 때 무엇이 다른지를 차례대로 — TCP 연결(포트가 다르다) → (HTTPS만) TLS 핸드셰이크와 인증서의 이름 확인 → HTTP 요청·응답(HTTPS는 암호화됨). **HTTP와 무엇이 다른지**(4절). 「인증이 필요 없다」가 틀린 까닭 한 줄. HTTP/3와 UDP `443`은 E28대로 — 쓰면 「자격시험은 HTTPS를 TCP 443으로만 보고 UDP 443을 쓴다는 보기를 틀린 설명으로 둔다」를 붙인다(`tcp-udp.transport-choice`의 줄과 뜻을 맞춘다) |

### 2. 문항 — `src/data/network/questions.json`에 `n213`~`n214`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n213` | `tls` | 4지선다 「원리 이해」 — TLS 핸드셰이크에서 서버가 인증서를 보내는 상황(본문과 다른 서버 이름 — 예: `shop.example.org`)을 주고, 클라이언트가 그 인증서로 무엇을 확인하는지 고르게 한다. 정답: 접속한 서버가 그 이름의 진짜 서버인지(인증서의 이름과 서명). 오답은 같은 범주(클라이언트가 인증서로 하는 일이라고 오해할 만한 것) — 서버의 IP 주소가 공인 주소인지, 클라이언트 사용자의 암호가 맞는지, 데이터를 압축할 방식. 기출 묶음을 쓰지 않는다. **정답 위치 0** |
| `n214` | `https` | 예/아니요 「오해 바로잡기」 — step 8이 끝난 뒤의 균형(계획대로면 예 40·아니요 40)에서 **아니요** 쪽으로 세운다. 예: 주소가 `https://`로 시작하는 페이지를 열 때 웹 브라우저가 따로 적힌 포트가 없으면 서버의 TCP `80`번으로 연결하는가(아니요 — `443`). E28대로 「HTTPS는 TCP만 쓴다」를 맞는 설명으로 쓰지 않는다. 해설은 HTTP와 HTTPS의 포트·암호화·서버 확인을 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 40·아니요 41, 정답 위치 34/33/33/33.

### 3. 도식

#### 3-1. `app-protocols-mgmt-security.tls` — `TlsHandshakeDiagram`, JSON 키 `tls-handshake`

- 물음형 제목 예: `TLS는 암호화하기 전에 무엇을 주고받을까?`
- 그릴 것: 두 기둥 — 웹 브라우저(클라이언트), `www.example.com`의 서버 — 사이에 step 5 summary의 간추린 핸드셰이크 메시지를 위에서 아래로, 그 아래에 암호화된 데이터 노드. 인증서 노드에서 인증 기관(CA) 노드로 이어지는 「서명 확인」 경로를 둘지는 판단.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `hello` | 인사 | 클라이언트와 서버의 인사 메시지 | 쓸 암호 방식과 키를 정한다 |
  | `certificate` | 인증서 | 서버가 보낸 인증서 노드 | 서버가 인증서로 자신이 그 이름의 서버임을 증명한다 |
  | `data` | 암호화된 데이터 | 데이터 노드 | 그 뒤 데이터는 암호화되어 오가고 바뀌면 알아챈다 |

- 요점 테스트: 메시지 노드의 위아래 차례가 step 5 summary의 차례와 같다. `certificate`에서 선명한 노드는 서버 쪽에서 클라이언트 쪽으로 가는 화살표를 갖는다. 데이터 노드는 핸드셰이크 노드들보다 아래에 있다.

#### 3-2. `app-protocols-mgmt-security.https` — `HttpsStackDiagram`, JSON 키 `https-stack`

- 물음형 제목 예: `HTTP와 HTTPS는 무엇이 다를까?`
- 그릴 것: 두 쌓기 — HTTP(HTTP | TCP `80`)와 HTTPS(HTTP | TLS | TCP `443`) — 를 나란히(세로형에서 나란히 들지 않으면 위아래로). 쌓기마다 곁말로 암호화 여부와 주소의 꼴(`http://`·`https://`).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `http` | HTTP | HTTP 쌓기 | HTTP는 TCP `80`번으로 내용을 그대로 주고받는다 |
  | `https` | HTTPS | HTTPS 쌓기와 TLS 칸 | HTTPS는 TCP `443`번 위에 TLS를 두어 암호화하고 서버를 확인한다 |

- 요점 테스트: `https`에서 선명한 칸에 TLS가 있고 `http`에서 선명한 칸에는 TLS가 없다. `http`의 TCP 칸 라벨에 `80`, `https`의 TCP 칸 라벨에 `443`이 있다. 두 쌓기 모두 HTTP 칸이 맨 위다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.
「자격시험은」 줄로만 쓴 것(E28)은 도식에 사실처럼 그리지 않는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 214개, 마지막 id는 `n214`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. `ports.well-known-ports`의 HTTPS 항목, `tcp-udp.transport-choice`의 HTTP/3 줄과 어긋나지 않는가.
   핸드셰이크 메시지 이름과 차례가 RFC 9846 §2와 같은가(간추린 것을 간추렸다고 밝혔는가, 문장을 옮기지 않았는가).
3. n213의 오답 셋이 인증서의 쓰임에 비추어 정말 틀린지 따진다.
4. `phases/78-network-app-protocols-diagnostics/index.json`의 step 9를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 17을 만들거나 step 6~8의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
- **`ports`·`tcp-udp` 주제의 HTTPS 글을 고치지 마라.** 이유: 앞 phase의 주제다. 어긋남을 찾으면 summary에 적는다.
- **step 5가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
- **암호 묶음 이름, 키 교환 방식(ECDHE 등), 인증서의 칸, TLS 판 사이의 차이(1.2와 1.3)를 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
