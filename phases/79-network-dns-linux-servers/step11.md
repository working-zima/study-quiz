# Step 11: named-options-httpd

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 `linux-servers`의 개념 둘(17 named.conf의 options 문, 18 Apache HTTP Server와 httpd.conf)의 글·문항·도식을 함께 만든다.** 17은 16(BIND와 named)에 딸린 개념, 18은 머리 개념이다.

기출은 `named.conf`에서 영역 파일의 위치를 정하는 줄로 `directory`를 고르게 하고([기출 2024-11-03 #42]), `options` 줄을 해석한 보기 넷 가운데 틀린 것을 고르게 한다(두 회 — 지문이 그림이다).
Apache에서 디렉터리 목록·심볼릭 링크·SSI·CGI 같은 보안 설정을 하는 파일로 `httpd.conf`를 고르게 한다([기출 2024-08-25 #36]).

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 9 `summary`(`options` 지시자 표와 기본값, `options` 해석 보기 넷의 판정, `httpd.conf`의 위치·꼴·`Include`·`<Directory>`, 보안 설정 넷의 지시자, E 번호)와 step 10 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 79 step 9)」 줄과 BIND 9·Apache HTTP Server 2.4 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 10이 쓴 `linux-servers` 두 개념** — 이미 푼 낱말을 다시 풀지 않는다, `dns` 주제의 `dns-zone`·`dnssec`·`dns-transport` — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/visuals/linux-servers.json`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 10이 만든 도식과 그 테스트, 선례 `FstabFieldsDiagram`(설정 줄의 칸)·`NetstatLinuxOptionsDiagram`(조각)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-05-19 #40], [기출 2024-08-25 #36], [기출 2024-11-03 #42], [기출 2026-02-01 #30] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-servers` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 17 | `linux-servers.named-conf-options` | named.conf의 options 문 | `linux-servers.bind-named` | **목록 개념** — 소개 문단: `options { … };` 안에 서버 전체에 걸리는 설정을 적는다(step 9 결과대로). 항목 일곱(「글」의 항목 이름 규칙 (2) — 하는 일을 한국어 이름으로, 지시자를 괄호 안 코드로): 영역 파일 디렉터리(`directory`), 질의를 받을 주소와 포트(`listen-on`), 질의 허용(`allow-query`), 재귀 허용(`recursion`), DNSSEC 검증(`dnssec-validation`), 영역 파일 형식(`masterfile-format`), 캐시를 쏟아 낼 파일(`dump-file`) — 항목마다 무엇을 정하는지와 기본값(step 9의 표대로 — 기본값을 확인하지 못한 항목은 기본값을 쓰지 않는다). 재귀·DNSSEC 검증·영역 파일·보조 서버는 `dns` 주제의 말과 뜻을 맞춰 이 화면에서 한 줄씩 다시 푼다. 항목 뒤 문단: 예 `options` 블록 하나를 줄마다 읽는다(step 9의 꼴, 「예시 값」 — 기출의 `/var/named`·`192.168.0.0/24`를 쓰지 않는다). **`listen-on`과 `allow-query`가 무엇이 다른지**(4절 — 어디서 받을지와 누구에게 답할지). 기출 「유효성 검사 시 오류가 발생하지 않는다」 보기의 처리는 step 9 결과대로 |
| 18 | `linux-servers.httpd-conf` | Apache HTTP Server와 httpd.conf | — | **Apache HTTP Server**와 실행 파일 `httpd`, **웹 서버**(웹 브라우저의 요청을 받아 웹 페이지를 보내 주는 프로그램)를 푼다. 주 설정 파일 `httpd.conf`(이름·위치·`-f`는 step 9 결과대로 — 배포판의 경로를 기본처럼 쓰지 않는다), 한 줄에 **지시자**와 값. 지시자 셋을 예로 — `ServerRoot`(서버의 기준 디렉터리), `DocumentRoot "/srv/www/example"`(웹에 내보일 파일을 두는 디렉터리 — 주소 `http://www.example.com/about.html`이 그 아래 `about.html`로 이어진다, 「예시 값」), `ServerAdmin`(관리자 메일 주소 — 예시 값은 문서용 도메인). `Include`로 다른 설정 파일을 끌어온다는 것(기본 배포의 `extra/` 아래 파일 — step 9 결과대로 한 줄). **`<Directory>` 구역**(그 디렉터리에만 걸리는 지시자를 묶는 곳)과, 디렉터리 목록·심볼릭 링크·SSI·CGI 같은 보안 설정을 이 파일의 지시자로 한다는 것(step 9 결과대로 — 지시자 이름은 한 줄씩만). 설정을 바꾼 뒤 적용하는 방법과 `apachectl configtest`는 step 9 결과대로 한 줄 |

### 2. 문항 — `src/data/network/questions.json`에 `n247`~`n249`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n247` | `named-conf-options` | 4지선다 「상황 적용」 — 할 일 하나를 주고 `options` 문의 어느 줄을 고쳐야 하는지 고르게 한다(예: 「이 DNS 서버가 사내 대역(문서용 대역 예: `192.0.2.0/24`)의 클라이언트에게만 답하게 하고 싶다」 → `allow-query`). 오답은 같은 범주의 지시자 셋(헷갈리는 것 — `listen-on`(어디서 받을지), `recursion`, `directory`). 기출 묶음(`directory`·`listen-on`·`dump-file`·`allow-query`)과 정답·보기 넷이 같지 않게 한다 — 보기를 「지시자 이름」이 아니라 「고칠 줄」로 세우거나 둘 이상을 바꾼다. **정답 위치 2** |
| `n248` | `named-conf-options` | 예/아니요 「오해 바로잡기」 — 시작 때 균형(예 48·아니요 48)에서 **아니요** 쪽으로 세운다. 예: `directory` 줄은 BIND가 질의 기록(로그)을 남길 디렉터리를 정하는가(아니요 — 영역 파일 같은 상대 경로의 기준 디렉터리). 또는 `listen-on`이 답할 클라이언트를 정한다는 오해. 해설은 맞는 지시자와 그 뜻을 가르친다 |
| `n249` | `httpd-conf` | 4지선다 「원리 이해」 — 본문과 다른 값의 장면(예: `DocumentRoot`가 `/srv/www/site2`인 서버에서 웹 브라우저가 `http://www.example.net/docs/a.html`을 요청했다)을 주고, 서버가 보내는 파일의 경로를 고르게 한다. 정답 `/srv/www/site2/docs/a.html`, 오답은 흔한 실수 — `ServerRoot` 아래로 이은 것, `docs`를 빠뜨린 것, 도메인 이름을 경로에 넣은 것. 기출 묶음(`httpd.conf`·`httpd-default.conf`·`httpd-vhosts.conf`·`httpd-mpm.conf`)을 쓰지 않는다. 문항 글에 백틱을 쓰지 않는다. **정답 위치 3** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 48·아니요 49, 정답 위치 38/38/38/38.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `linux-servers.named-conf-options` — `NamedOptionsDiagram`, JSON 키 `named-options`

- 물음형 제목 예: `options 문의 줄은 저마다 무엇을 정할까?`
- 그릴 것: 본문 예 `options` 블록의 줄을 줄마다 노드로 위에서 아래로(그룹 박스 「`options { … };`」), 줄마다 곁말로 하는 일(본문의 말). 줄이 많아 280 폭·높이에 다 들지 않으면 시나리오가 고르는 묶음만 곁말을 보인다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `files` | 파일 | `directory`·`dump-file`(과 본문에 넣었으면 `masterfile-format`) 줄 | 파일을 찾고 남길 자리를 정한다 |
  | `who` | 받기와 답하기 | `listen-on`·`allow-query` 줄 | 어디서 질의를 받을지와 누구에게 답할지는 다른 줄이 정한다 |
  | `resolver` | 재귀와 검증 | `recursion`·`dnssec-validation` 줄 | 대신 찾아 줄지와 받은 응답의 서명을 확인할지 정한다 |

- 요점 테스트: `who`에서 선명한 줄이 정확히 `listen-on`과 `allow-query`다. 줄 노드의 라벨이 본문 예 블록의 줄과 글자 그대로 같다(테스트에서 본문 문자열과 견준다 — 필요하면 줄 단위로). 그룹 박스는 흐려지지 않는다.

#### 3-2. `linux-servers.httpd-conf` — `HttpdConfDiagram`, JSON 키 `httpd-conf`

- 물음형 제목 예: `요청한 주소는 서버의 어느 파일로 이어질까?`
- 그릴 것: `httpd.conf`(그룹 박스) 안의 지시자 줄 — `ServerRoot`, `DocumentRoot "/srv/www/example"`, `<Directory>` 구역 — 과, 웹 브라우저의 요청 주소 `http://www.example.com/about.html` → `DocumentRoot` 아래 파일 `/srv/www/example/about.html`로 이어지는 흐름. `Include` 줄과 끌어온 파일은 본문에 쓴 만큼.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `mapping` | 주소와 파일 | 요청 주소·`DocumentRoot` 줄·파일 경로 | 주소의 경로가 `DocumentRoot` 아래 파일로 이어진다 |
  | `directory` | 디렉터리 설정 | `<Directory>` 구역 | 그 디렉터리에만 걸리는 지시자를 묶어 둔다 |
  | `server` | 서버 설정 | `ServerRoot`(와 `Include`) 줄 | 서버의 기준 디렉터리를 정하고 다른 설정 파일을 끌어온다 |

- 요점 테스트: `mapping`에서 파일 경로 노드의 라벨이 `DocumentRoot`의 값과 요청 주소의 경로를 이은 것과 같다(테스트에서 문자열로 견준다). `mapping`에서 `ServerRoot` 줄이 흐리다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 249개, 마지막 id는 `n249`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 9 summary의 지시자 표와 기본값을 그대로 지켰는가, 확인하지 못한 기본값을 쓰지 않았는가.
3. n247의 보기마다 「이 줄을 고치면 그 일이 되는가」를 따지고, n249의 경로를 손으로 다시 잇는다.
4. `phases/79-network-dns-linux-servers/index.json`의 step 11을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 15·16과 19~23을 만들거나 고치지 마라.** 이유: 다른 step의 범위다. 이 step의 글이 `Listen`·`KeepAlive`·`Options`·`LimitRequestBody`를 쓸 때는 이름과 한 줄 풀이로 그친다.
- **BIND의 `view`·ACL 문법 전체·`rndc`, Apache의 가상 호스트·모듈 목록·MPM을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **배포판의 설정 파일 경로(`/etc/httpd/conf/httpd.conf`·`/etc/apache2/` 등)를 사실처럼 쓰지 마라.** 이유: 허용한 출처(Apache 문서)가 그 경로를 말하지 않으면 근거가 없다.
- **step 9가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
