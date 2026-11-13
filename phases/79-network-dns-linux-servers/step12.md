# Step 12: listen-keepalive

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 `linux-servers`의 개념 둘(19 Listen 지시자와 포트 권한, 20 KeepAlive와 KeepAliveTimeout)의 글·문항·도식을 함께 만든다.** 둘 다 18(Apache HTTP Server와 httpd.conf)에 딸린 개념이다.

기출은 Apache의 서비스 포트를 바꿀 때 고칠 지시자로 `Listen`을 두 번 고르게 하고(보기 `Port`·`Listening`처럼 없는 이름이 섞인다), 잘 알려진 포트로 Apache를 실행할 때의 주의(관리자 권한, 겹치지 않는 번호)를 두 번 묻는다 —
틀린 말로 두는 것은 「일반 사용자가 실행 명령 앞에 `su`를 붙인다」다. 요청이 없을 때 정해진 시간 뒤 연결을 끝내는 지시자로 `KeepAliveTimeout`을 두 번 고르게 한다.

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 9 `summary`(`Listen`의 꼴, 1024 아래 포트와 root·`User`·`Group`, `Port`가 없어진 판, su(1) 판정, KeepAlive 지시자들의 기본값, 「세션」 판정, E 번호)와 step 10·11 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 79 step 9)」 줄과 Apache HTTP Server 2.4·su(1)·RFC 9112 항목), `docs/source/network/exam-notes.md`(**E27**과 step 9가 더한 것)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 10·11이 쓴 `linux-servers` 네 개념**, `ports.well-known-ports`의 1024 아래 포트 문단과 `ports.port-ranges`, `tcp-connection`의 연결 풀이, `linux-process-boot`의 프로세스 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/visuals/linux-servers.json`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 10·11이 만든 도식과 그 테스트, 선례 `ThreeWayHandshakeDiagram`(두 장치 사이 차례)·`ConnectionCloseDiagram`과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-05-19 #31·#41], [기출 2024-11-03 #38], [기출 2025-08-24 #43], [기출 2025-11-02 #34·#35] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-servers` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 19 | `linux-servers.apache-listen` | Listen 지시자와 포트 권한 | `linux-servers.httpd-conf` | **포트**(한 컴퓨터 안에서 데이터를 받을 프로그램을 가리키는 번호 — 한 줄, `ports`와 뜻을 맞춘다)를 풀고, `Listen`이 웹 서버가 요청을 기다릴 포트(와 주소)를 정한다는 것. 포트를 바꾸는 차례: `Listen 80`을 `Listen 8080`으로 고친다 → 설정을 다시 읽힌다 → 웹 브라우저는 `http://www.example.com:8080/`처럼 포트를 붙여야 닿는다(「예시 값」 — 적용 방법은 step 11과 같은 말로). 여러 줄로 여러 포트에서 기다린다, 다른 프로그램이 이미 쓰는 포트에는 묶을 수 없다(step 9 결과대로). `Port`라는 지시자가 2.0에서 없어졌다는 것은 step 9 결과대로 한 줄. **포트 권한** — Unix 계열에서 `1024`보다 작은 포트에서 기다리려면 root 권한이 필요하고, 그래서 httpd는 root로 시작해 포트를 연 뒤 요청을 처리하는 자식 프로세스를 `User`·`Group`의 권한 낮은 사용자로 실행한다(step 9 결과대로 — root·프로세스는 한 줄씩 푼다). **root로 시작한 부모와 자식 프로세스가 무엇이 다른지**(4절). 기출의 「명령 앞에 `su`」 보기의 처리와 1~1023 표기(E27)는 step 9 결과대로 — 쓰면 「자격시험은」 줄 |
| 20 | `linux-servers.apache-keepalive` | KeepAlive와 KeepAliveTimeout | `linux-servers.httpd-conf` | **지속 연결**(한 TCP 연결로 요청과 응답을 여러 번 주고받는 것 — step 9 결과대로, TCP 연결은 한 줄 풀이)을 켤지 정하는 `KeepAlive`와, 응답을 보낸 뒤 같은 연결로 다음 요청을 몇 초 기다리다 닫을지 정하는 `KeepAliveTimeout`(기본값은 step 9의 표대로). 차례 예: `KeepAliveTimeout 15`(「예시 값」) — 웹 브라우저가 연결을 맺고 첫 요청 → 응답 → 15초 안에 둘째 요청이 오면 같은 연결로 받는다 → 응답 뒤 15초 동안 요청이 없으면 서버가 연결을 닫는다. `KeepAlive Off`이면 응답마다 연결을 닫아 요청마다 연결을 새로 맺는다(step 9 결과대로). **`KeepAliveTimeout`과 `Timeout`이 무엇이 다른지**(4절 — step 9 결과대로 한 줄). `MaxKeepAliveRequests`는 step 9 결과대로 한 줄. 시간을 길게 잡을 때의 대가는 근거가 있을 때만. 기출이 「세션」이라 부르는 것의 처리는 step 9 결과대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n250`~`n252`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n250` | `apache-listen` | 4지선다 「상황 적용」 — 본문과 다른 포트의 장면(예: 같은 서버에서 이미 다른 프로그램이 `8080`을 쓰고 있어 Apache를 `8000`에서 기다리게 하려 한다)을 주고 `httpd.conf`에 적을 줄을 고르게 한다. 정답 `Listen 8000`, 오답은 흔한 실수이자 없는 지시자가 아닌 것으로 — 실제 있는 다른 지시자에 포트를 적은 줄(예: `KeepAlive 8000`, `ServerRoot`·`DocumentRoot`에 포트를 넣은 줄 등 — 기출 묶음 `Port`·`Default Port`·`Listening`·`Listen`, `KeepAlive`·`DocumentRoot`·`StartServers`·`Listen`과 같지 않게, 보기 둘 이상을 바꾼다). 문항 글에 백틱을 쓰지 않는다. **정답 위치 0** |
| `n251` | `apache-listen` | 예/아니요 「원리 이해」 — n250 뒤 균형(예 48·아니요 49)에서 **예** 쪽으로 세운다. 예: Apache를 포트 80에서 기다리게 해도, 요청을 받아 처리하는 자식 프로세스들은 root가 아닌 `User`에 적은 사용자의 권한으로 실행되는가(예 — root로 시작한 경우. 조건을 문제문에 준다). 기출의 su 보기 꼴을 쓰지 않는다. 해설은 1024 아래 포트에 root가 필요한 까닭과 부모·자식의 권한을 가르친다 |
| `n252` | `apache-keepalive` | 4지선다 「원리 이해」 — 본문과 다른 값의 장면(예: `KeepAlive On`, `KeepAliveTimeout 10`인 서버에서 웹 브라우저가 응답을 받은 뒤 6초 뒤에 다음 요청을 보냈다, 또는 12초 뒤)을 주고 그 요청이 어떻게 처리되는지 고르게 한다. 정답 하나(6초면 같은 연결로 받는다 / 12초면 서버가 이미 연결을 닫았으므로 새 연결을 맺어야 한다), 오답은 흔한 실수 — 기다리는 시간을 요청 수로 읽은 것, 시간을 넘기면 요청이 버려지고 끝난다고 본 것, 연결과 상관없이 늘 새 연결이라고 본 것. 기출 묶음(`Exec-timeout`·`Listen`·`KeepAliveTimeout`·`NameVirtualHost`)을 쓰지 않는다. **정답 위치 1** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 49·아니요 49, 정답 위치 39/39/38/38.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `linux-servers.apache-listen` — `ListenPortDiagram`, JSON 키 `listen-port`

- 물음형 제목 예: `Apache는 어느 포트에서 누구의 권한으로 요청을 받을까?`
- 그릴 것: `Listen` 줄(본문의 `Listen 80`과 바꾼 `Listen 8080`), 그 포트를 여는 httpd 부모 프로세스(root), 부모가 띄운 자식 프로세스 둘(`User`의 사용자 — 본문에 쓴 이름표나 값), 웹 브라우저의 요청 주소(포트를 붙인 꼴과 붙이지 않은 꼴). 직교 경로만.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `default` | 80번 | `Listen 80`·부모 프로세스·포트를 붙이지 않은 주소 | `1024`보다 작은 포트를 열려면 root로 시작해야 한다 |
  | `changed` | 바꾼 포트 | `Listen 8080`·포트를 붙인 주소 | 포트를 바꾸면 주소에 그 포트를 붙여야 닿는다 |
  | `children` | 자식 프로세스 | 자식 프로세스 둘 | 요청은 권한 낮은 사용자로 실행되는 자식 프로세스가 처리한다 |

- 요점 테스트: `changed`에서 선명한 주소 노드의 라벨에 `:8080`이 있고 `default`의 주소 노드에는 없다. `children`에서 부모 프로세스 노드가 흐리다. 부모와 자식은 다른 id를 다른 자리에 둔다.

#### 3-2. `linux-servers.apache-keepalive` — `KeepAliveTimelineDiagram`, JSON 키 `keepalive-timeline`

- 물음형 제목 예: `응답을 보낸 뒤 서버는 연결을 언제 닫을까?`
- 그릴 것: 두 기둥 — 왼쪽 웹 브라우저, 오른쪽 웹 서버 — 사이에 본문 차례를 위에서 아래로: 연결 맺기 → 요청 1 → 응답 1 → (15초 안에) 요청 2 → 응답 2 → (15초 동안 요청 없음) → 서버가 연결을 닫음. 기다리는 시간은 곁말로. `KeepAlive Off`의 차례(응답마다 닫음)는 같은 기둥에 다른 노드 id로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `reuse` | 같은 연결 | 요청 1·응답 1·요청 2·응답 2 | 기다리는 시간 안에 온 요청은 같은 연결로 받는다 |
  | `timeout` | 시간 초과 | 응답 2 뒤의 기다림과 연결 닫기 | 정한 시간 동안 요청이 없으면 서버가 연결을 닫는다 |
  | `off` | 끄기 | `KeepAlive Off`의 차례 노드들 | 지속 연결을 끄면 응답마다 연결을 닫고 요청마다 새로 맺는다 |

- 요점 테스트: `timeout`의 연결 닫기 노드는 서버 쪽에서 웹 브라우저 쪽으로 가는 화살표를 갖는다. `reuse`에서 연결 맺기 노드는 하나만 선명하다(두 요청이 한 연결을 쓴다). 곁말의 초 수가 본문의 `KeepAliveTimeout` 값과 같다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 252개, 마지막 id는 `n252`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 9의 판정(su, 「세션」, E27)과 기본값을 지켰는가. `ports.well-known-ports`의 1024 문단과 뜻이 같은가.
3. n250의 오답이 모두 「있는 지시자이지만 그 일을 하지 않는다」거나 흔한 실수인지, n252의 시간 계산과 오답을 손으로 따진다.
4. `phases/79-network-dns-linux-servers/index.json`의 step 12를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 15~18과 21~23을 만들거나 고치지 마라.** 이유: 다른 step의 범위다. 앞 개념에 고칠 것을 찾으면 summary에 적는다.
- **`sudo`, MPM(`StartServers` 등), 가상 호스트를 쓰지 마라.** 이유: guide.md 「배경」 — 출처를 더하지 않기로 했거나 기출이 묻지 않는다.
- **step 9가 확인하지 못한 사실(기본값 포함)을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
