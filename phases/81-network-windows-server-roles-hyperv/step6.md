# Step 6: home-directory-request-filtering

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 `windows-server-roles`의 개념 둘(9 홈 디렉터리와 가상 디렉터리, 10 요청 필터링)의 글·문항·도식을 함께 만든다.** 둘 다 7 「IIS 웹 서버」(step 5)에 딸린 개념이다.

기출은 IIS 관리자에서 홈 디렉터리를 꼭 정해진 폴더로 두어야 하는 것이 아니고, 기본 문서를 더할 수 있고, 디렉터리 검색으로 보일 항목을 고를 수 있고, 가상 디렉터리로 별칭과 실제 경로를 잇는다는 것([기출 2026-08-02 #29]),
IIS가 요청 필터링으로 특정 요청을 막을 수 있다는 것([기출 2025-11-02 #41]의 정답)을 묻는다.

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 4 `summary`(실제 경로·기본 문서·디렉터리 검색·가상 디렉터리·요청 필터링, 기출 판정, E 번호, 한국어 이름)와 step 1~5 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 1과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 4)」 줄과 항목), `docs/source/network/exam-notes.md`(phase 81이 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`windows-server-roles`의 앞 개념 여덟(step 1~5)**, 특히 `iis`·`iis-site-bindings`의 사이트·Default Web Site 문장. `linux-servers`의 Apache `Options`(디렉터리 목록)·`LimitRequestBody` 문장, `linux-filesystem`의 경로·디렉터리 문장(뜻을 맞춘다)
- `src/data/network/questions.json`, `src/data/network/visuals/windows-server-roles.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `DirectoryListingDiagram`·`RequestBodyLimitDiagram`(Apache — 문구를 빌리지 않는다), `PathResolveDiagram`(경로 풀이), `SiteBindingsDiagram`(step 5)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2026-08-02 #29], [기출 2025-11-02 #41] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-server-roles` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `windows-server-roles.iis-home-directory` | 홈 디렉터리와 가상 디렉터리 | `windows-server-roles.iis` | **URL**(웹 자원의 주소 — 한 줄)과 **폴더**(디렉터리)를 푼다. 실제 경로와 「홈 디렉터리」라는 이름의 처리, 기본값과 바꾸는 자리(step 4 결과대로). 기본 문서(목록·차례·추가 — step 4 결과대로), 디렉터리 검색(기본 상태·보일 항목 — step 4 결과대로, Apache의 디렉터리 목록과 뜻을 맞춘 한 줄), 가상 디렉터리와 별칭. 기본 문서와 디렉터리 검색의 차례(step 4 결과대로). **실제 경로와 가상 디렉터리**, **기본 문서와 디렉터리 검색**(4절). 계산 예: 별칭 `docs` → `D:\Docs`이면 `http://www.example.com/docs/guide.html`이 `D:\Docs\guide.html`을 연다 — URL을 호스트 이름·별칭·파일 이름 조각으로 나눠 단계대로(「예시 값」). `http://www.example.com/docs/`처럼 파일 이름이 없으면 무엇이 일어나는지도 본문에 한 단계 |
| 10 | `windows-server-roles.request-filtering` | 요청 필터링 | `windows-server-roles.iis` | 요청 필터링의 뜻(step 4 결과대로 — **HTTP 요청**(브라우저가 웹 서버에 보내는 부탁 — 동사(GET 등)와 URL이 담긴다, 한 줄)), 막는 기준 셋쯤(step 4 결과대로 — 확장자·URL·요청 크기 같은 것, 기본값은 판과 함께), 막힌 요청의 상태 코드(step 4 결과대로 — 상태 코드는 한 줄로 푼다). Apache LimitRequestBody와의 대응(step 4의 근거대로 한 줄). **요청 필터링과 방화벽**(4절 — **방화벽**(주소·포트를 보고 연결을 막거나 들이는 장치나 프로그램) 한 줄). 예: 확장자 `.bak`을 거부하면 `http://www.example.com/db.bak` 요청이 막혀 상태 코드를 받는다(「예시 값」 — 상태 코드는 step 4가 확인한 것만) |

### 2. 문항 — `src/data/network/questions.json`에 `n294`~`n295`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n294` | `iis-home-directory` | 4지선다 「계산·상황 적용」 — 본문과 다른 값(사이트 `news.example.com`, 별칭 `img` → `E:\Images` 등)을 주고 어떤 URL이 어느 파일을 여는지 고르게 한다. 정답은 별칭을 실제 경로로 바꾼 경로, 오답은 흔한 혼동(별칭을 사이트의 실제 경로 아래 폴더로 읽기, 별칭 이름을 경로에 그대로 붙이기, 호스트 이름을 폴더로 읽기). **정답 위치 2**. 해설은 URL을 조각마다 단계대로 바꾼다. 기출 묶음(홈 디렉터리 고정·기본 문서 추가·디렉터리 검색·가상 디렉터리 별칭)과 범주가 다르다 |
| `n295` | `request-filtering` | 예/아니요 「원리 이해」 — **아니요** 쪽으로 세운다. 예: IIS의 요청 필터링은 웹 브라우저가 요청을 보내기 전에, 사용자의 컴퓨터에서 그 요청을 막나요?(아니요 — 서버가 받은 요청을 처리하기 전에 살펴 막는다, step 4 결과대로). 또는 step 4가 확인한 다른 사실로 **아니요**가 되는 주장. 해설은 무엇으로 막는지와 막힌 요청에 무엇이 돌아가는지를 가르친다. 기출 묶음(요청 필터링·HTTPS 미지원·PHP 불가·풀 하나에 사이트 하나)의 문장을 주장으로 세우지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 58·아니요 58, 정답 위치 45/45/45/44.
문항 글에 백틱을 쓰지 않는다. 문항의 Windows 경로는 JSON 이스케이프를 확인한다.

### 3. 도식

#### 3-1. `iis-home-directory` — `VirtualDirectoryDiagram`, JSON 키 `virtual-directory`

- 물음형 제목 예: `URL의 한 조각은 서버의 어느 폴더로 이어질까?`
- 그릴 것: URL 조각 노드 줄(`www.example.com` / `docs` / `guide.html`)과 서버 쪽 폴더 노드(사이트의 실제 경로 — 본문이 쓴 기본값, `D:\Docs`, `D:\Docs\guide.html`). 조각에서 폴더로 가는 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `site` | 사이트 경로 | 호스트 이름 조각과 사이트의 실제 경로 | 호스트 이름으로 사이트를 고르고, 그 사이트의 실제 경로에서 파일을 찾는다 |
  | `alias` | 가상 디렉터리 | `docs` 조각·`D:\Docs`·`guide.html` 조각·`D:\Docs\guide.html` | 별칭 `docs`는 실제 경로 밖의 `D:\Docs`로 이어진다 |

- 요점 테스트: `alias`에서 보이는 경로가 `docs` 조각에서 `D:\Docs` 노드로 가고, 사이트의 실제 경로 노드는 흐리다. `site`에서는 `D:\Docs` 노드가 흐리다. 라벨의 백슬래시가 글자 그대로 보인다(JSON 이스케이프).

#### 3-2. `request-filtering` — `RequestFilteringDiagram`, JSON 키 `request-filtering`

- 물음형 제목 예: `요청 필터링은 어떤 요청을 사이트까지 보내지 않을까?`
- 그릴 것: 요청 노드 둘(`http://www.example.com/db.bak` — 길면 조각으로, 보통 요청 하나 — 본문에 나온 URL만), 요청 필터링 노드, 사이트 노드, 막힌 결과 노드(상태 코드 — 본문의 것만).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `allowed` | 통과 | 보통 요청·요청 필터링·사이트와 그 경로 | 규칙에 걸리지 않은 요청은 사이트가 처리한다 |
  | `denied` | 거부 | `.bak` 요청·요청 필터링·막힌 결과 노드 | 거부한 확장자의 요청은 사이트에 닿지 않고 상태 코드를 돌려받는다 |

- 요점 테스트: `denied`에서 사이트 노드가 흐리고, 보이는 경로가 요청 필터링 노드에서 결과 노드로 가며 사이트로 가는 경로가 보이지 않는다. `allowed`에서는 결과 노드가 흐리다.

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 295개, 마지막 id는 `n295`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 1~5가 푼 낱말을 다시 풀지 않았는가. Apache 쪽 말과 어긋나지 않는가.
3. n294의 URL 대응을 손으로 다시 하고, 오답 셋이 각각 어떤 혼동에서 나오는지 해설과 맞춘다. 본문·도식의 Windows 경로가 화면에 원하는 글자로 보이는지 `node -e`로 확인한다.
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 6을 갱신한다(guide.md 「summary에 적을 것」 / error / blocked — step 1과 같은 규칙).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 11~23을 만들지 마라.** 이유: 다른 step의 범위다.
- **요청 필터링의 설정 항목 전체(모든 섹션과 기본값)를 늘어놓지 마라.** 이유: 기출이 묻는 것은 「특정 요청을 막는 기능」이다 — 기준은 셋쯤이면 된다(ADR-059 「범위」).
- **step 1~5의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
