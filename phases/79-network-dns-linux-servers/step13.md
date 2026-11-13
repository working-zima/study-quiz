# Step 13: indexes-request-body

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 `linux-servers`의 개념 둘(21 Options 지시자와 디렉터리 목록, 22 LimitRequestBody 지시자)의 글·문항·도식을 함께 만든다.** 둘 다 18(Apache HTTP Server와 httpd.conf)에 딸린 개념이다.

기출은 디렉터리 목록이 드러나는(Directory Indexing) 공격에 약한 설정으로 `Options … Indexes`를 고르게 하고([기출 2025-05-25 #45]),
클라이언트가 보내는 POST 요청이 일정 크기를 넘지 못하게 하는 지시자로 `LimitRequestBody`를 두 번 고르게 한다(보기에 `KeepRequestSize`·`RestrictBodyRequest`·`PostRequestSize`처럼 없는 이름이 섞인다).

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 9 `summary`(`Options`의 값·기본값·`+`·`-` 규칙, `DirectoryIndex`·`mod_autoindex`, `Indexes`를 끈 때의 응답, `LimitRequestBody`의 범위·기본값·판·놓는 자리·넘을 때의 응답, E 번호)와 step 10~12 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-058**(응용 계층의 「본문」), **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 79 step 9)」 줄과 Apache HTTP Server 2.4 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 10~12가 쓴 `linux-servers` 여섯 개념** — 특히 `httpd-conf`의 `<Directory>`·`DocumentRoot`와 예시 값, `linux-filesystem`의 심볼릭 링크 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/visuals/linux-servers.json`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 10~12가 만든 도식과 그 테스트, 선례 `ChmodChangeDiagram`·`IpconfigOptionsDiagram`(설정 전과 뒤)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-05-25 #45], [기출 2025-02-23 #40], [기출 2026-02-01 #31], [기출 2024-08-25 #36] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-servers` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 21 | `linux-servers.options-indexes` | Options 지시자와 디렉터리 목록 | `linux-servers.httpd-conf` | `Options`가 `<Directory>` 구역 안에서 그 디렉터리에 켤 기능을 정한다는 것(step 9 결과대로). **`Indexes`** — 요청한 주소가 디렉터리를 가리키고 그 안에 기본 문서(`DirectoryIndex`의 파일 — 기본값은 step 9 결과대로)가 없으면 파일 목록을 만들어 보여 준다. 차례 예(「예시 값」): `DocumentRoot "/srv/www/example"` 아래 `files/`에 `index.html` 없이 파일 둘(예로 붙인 이름)이 있을 때 `http://www.example.com/files/`를 요청하면 — `Indexes`가 켜져 있으면 두 파일의 이름이 목록으로 보인다, 꺼져 있으면 목록을 보이지 않는다(어떻게 답하는지는 step 9 결과대로), `index.html`이 있으면 목록 대신 그 파일을 보낸다. **켤 때와 끌 때가 무엇이 다른지**(4절 — 보여 주려 하지 않은 파일 이름이 드러나는 위험). **`FollowSymLinks`**(심볼릭 링크 — 다른 파일을 가리키는 파일, 한 줄 풀이)를 따라갈지, SSI·CGI(`Includes`·`ExecCGI`)는 step 9 결과대로 한 줄씩. 끄는 꼴(`Options -Indexes` 등)과 `+`·`-` 규칙은 step 9 결과대로. 기출의 보기 꼴 `Options FollowSymLinks Indexes`를 본문 예로 쓰지 않는다 |
| 22 | `linux-servers.limit-request-body` | LimitRequestBody 지시자 | `linux-servers.httpd-conf` | **요청 본문**(요청에 실려 오는 데이터 — 올리는 파일, 폼에 적은 내용. ADR-058의 「본문」과 뜻을 맞춘다)을 풀고, `LimitRequestBody`가 그 크기의 한도를 바이트로 정한다는 것(step 9 결과대로). 계산 예를 처음부터 끝까지: `LimitRequestBody 1048576` → `1024 × 1024 = 1048576`바이트 = 1MiB(바이트·KiB·MiB 한 줄 풀이) → 본문 500KiB인 요청은 받고, 2MiB인 요청은 받지 않고 오류로 답한다(응답 상태 코드는 step 9 결과대로 — 확인하지 못했으면 쓰지 않는다, 「예시 값」). 기본값과 `0`의 뜻, 그 기본값이 바뀐 판은 step 9 결과대로. 놓는 자리(서버 전체·`<Directory>` 등)와 쓰는 까닭(step 9 결과대로). 기출 보기의 없는 지시자 이름들은 본문에 쓰지 않아도 된다 |

### 2. 문항 — `src/data/network/questions.json`에 `n253`~`n254`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n253` | `options-indexes` | 예/아니요 「오해 바로잡기」 — 시작 때 균형(예 49·아니요 49)에서 **아니요** 쪽으로 세운다. 예: `Options Indexes`가 켜진 디렉터리라도 그 안에 기본 문서(`index.html`)가 있으면, 그 디렉터리 주소를 요청한 사람에게 파일 목록이 보이는가(아니요 — 기본 문서를 보낸다. step 9 근거대로). 또는 「`Indexes`를 빼면 그 디렉터리의 파일을 이름으로 직접 요청해도 받을 수 없게 되는가」(아니요 — 목록만 막는다. 근거가 있을 때만). 문항 글에 백틱을 쓰지 않는다. 해설은 목록을 만드는 조건과 끄는 방법을 가르친다 |
| `n254` | `limit-request-body` | 4지선다 「상황 적용」(계산) — 본문과 다른 값의 장면(예: `LimitRequestBody 524288`인 디렉터리에 크기가 서로 다른 본문 넷을 보내는 요청 — 이 가운데 거절되는 것을 고르기, 또는 「본문을 2MiB까지만 받게 하려면 적을 값」)을 주고 고르게 한다. 정답 하나, 오답은 흔한 실수 — 1000과 1024를 섞은 값, KiB와 MiB를 바꾼 값, 한도와 같은 크기를 넘는다고 본 것(근거로 「넘는다」의 경계를 확인했을 때만). 기출 묶음(`KeepRequestSize`·`LimitRequestBody`·`RestrictBodyRequest`·`PostRequestSize`)을 쓰지 않는다. **정답 위치 2** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 49·아니요 50, 정답 위치 39/39/39/38.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `linux-servers.options-indexes` — `DirectoryListingDiagram`, JSON 키 `directory-listing`

- 물음형 제목 예: `디렉터리 주소를 요청하면 무엇을 보게 될까?`
- 그릴 것: 요청 주소 `http://www.example.com/files/` → 서버의 디렉터리 `/srv/www/example/files/`(안의 파일 이름 둘 — 본문의 이름표) → 결과. 결과는 시나리오마다 다른 노드 id를 다른 자리에 둔다(목록이 보임 / 목록을 보이지 않음 / 기본 문서를 보냄). 설정 줄(`Options Indexes`·`Options -Indexes` 등 본문의 꼴)을 결과 노드 옆이나 위에 둔다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `indexes-on` | 켬 | `Indexes`를 켠 줄과 「파일 목록」 결과 | 기본 문서가 없으면 파일 이름 목록이 그대로 드러난다 |
  | `indexes-off` | 끔 | `Indexes`를 끈 줄과 그 결과 | 목록을 만들지 않아 파일 이름이 드러나지 않는다 |
  | `index-file` | 기본 문서 | `index.html`과 그 결과 | 기본 문서가 있으면 목록 대신 그 파일을 보낸다 |

- 요점 테스트: 세 시나리오의 결과 노드 id가 서로 다르다. `indexes-on`에서만 파일 이름 노드들이 선명하다. `index-file`에서 「파일 목록」 결과 노드가 흐리다.

#### 3-2. `linux-servers.limit-request-body` — `RequestBodyLimitDiagram`, JSON 키 `request-body-limit`

- 물음형 제목 예: `요청 본문이 한도를 넘으면 어떻게 될까?`
- 그릴 것: 한도 줄 `LimitRequestBody 1048576`과 그 계산(`1024 × 1024` = 1MiB — 노드나 곁말), 요청 둘(본문 500KiB, 2MiB — 이름표)과 결과(받음 / 오류로 답함 — 다른 노드 id, 다른 자리). 직교 경로만.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `under` | 한도 안 | 500KiB 요청과 「받음」 결과 | 본문이 한도보다 작으면 평소대로 받아 처리한다 |
  | `over` | 한도 넘음 | 2MiB 요청과 오류 결과 | 본문이 한도를 넘으면 받지 않고 오류로 답한다 |

- 요점 테스트: `over`에서 「받음」 결과 노드가 흐리고 `under`에서 오류 결과 노드가 흐리다. 한도 노드의 수가 본문의 `LimitRequestBody` 값과 같고, 그 값이 `1024 * 1024`와 같다(테스트에서 계산해 견준다).

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 254개, 마지막 id는 `n254`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 9의 판정(끈 때의 응답, 넘을 때의 응답, 기본값의 판)을 지켰는가. 확인하지 못한 상태 코드를 쓰지 않았는가.
3. 본문과 n254의 바이트 계산을 손으로 다시 하고, n253의 주장이 근거로 정해지는지 따진다.
4. `phases/79-network-dns-linux-servers/index.json`의 step 13을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 15~20과 23을 만들거나 고치지 마라.** 이유: 다른 step의 범위다. 앞 개념에 고칠 것을 찾으면 summary에 적는다.
- **`mod_autoindex`의 꾸밈 지시자(`IndexOptions` 등)와 다른 한도 지시자 전체, `.htaccess`·`AllowOverride`의 규칙을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」). 놓는 자리를 말할 때 `.htaccess`라는 이름과 한 줄까지만.
- **step 9가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
