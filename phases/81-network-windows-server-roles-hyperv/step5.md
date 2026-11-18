# Step 5: iis-sites-bindings

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 `windows-server-roles`의 개념 둘(7 IIS 웹 서버, 8 사이트 바인딩과 연결 제한)의 글·문항·도식을 함께 만든다.** 8은 7에 딸린 개념이다(7에는 뒤 step에서 딸린 개념 셋이 더 붙는다).

기출은 IIS 관리자를 여는 명령([기출 2024-11-03 #40] — `inetmgr.exe`), IIS가 HTTPS를 지원하고 PHP를 실행할 수 있고 응용 프로그램 풀 하나가 여러 사이트를 맡을 수 있다는 것([기출 2025-11-02 #41]의 오답 셋 — 정답 요청 필터링은 step 6),
기본 웹 사이트 등록 정보의 TCP 포트가 시리얼 포트가 아니라는 것([기출 2025-02-23 #28])을 묻는다.

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 4 `summary`(IIS·바인딩·제한·풀, 기출 판정, E 번호, 한국어 이름)와 step 1~3 `summary`(이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 1과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 4)」 줄과 항목), `docs/source/network/exam-notes.md`(phase 81이 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`windows-server-roles`의 앞 개념 여섯(step 1~3)**, `app-protocols-mgmt-security.https`·`tls`(인증서), `ports`(포트 번호·잘 알려진 포트 80·443), `linux-servers`(Apache의 `Listen`·가상 호스트가 있으면 그 문장), `linux-process-boot`(프로세스의 뜻)
- `src/data/network/questions.json`, `src/data/network/visuals/windows-server-roles.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `ListenPortDiagram`·`HttpdConfDiagram`(웹 서버 설정), `PortDemuxDiagram`(포트로 가르기), `RoleServiceFeatureDiagram`(step 1)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-11-03 #40], [기출 2025-11-02 #41], [기출 2025-02-23 #28] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-server-roles` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `windows-server-roles.iis` | IIS 웹 서버 | — | **웹 서버**와 **HTTP**(웹 브라우저와 웹 서버가 주고받는 통신 규칙 — 한 줄)·**웹 브라우저**를 푼다. IIS의 뜻과 설치하는 역할 이름(step 4 결과대로 — `server-roles-features`와 뜻을 맞춘다). IIS 관리자와 실행 이름(step 4 결과대로 — 실행 창은 「Windows 키 + `R`로 여는 창」 한 줄). 사이트와 Default Web Site(step 4 결과대로 — 바인딩·실제 경로는 이름만 들고 자세히 풀지 않는다). HTTPS(HTTP에 TLS 암호화를 더한 것 — 한 줄, 인증서는 한 줄로 푼다) 지원과 PHP·FastCGI(step 4 결과대로 한 줄). **응용 프로그램 풀**(**프로세스**(실행 중인 프로그램) — 한 줄, 작업자 프로세스, 격리, 한 풀에 여러 사이트 — step 4 결과대로). **사이트와 응용 프로그램 풀이 무엇이 다른지**(4절). 예: `SRV01`에 웹 서버(IIS) 역할을 설치하고 사이트 `www.example.com`을 만든다(「예시 값」 — RFC 2606의 문서용 이름이라고 밝힌다) |
| 8 | `windows-server-roles.iis-site-bindings` | 사이트 바인딩과 연결 제한 | `windows-server-roles.iis` | 바인딩의 네 값과 한국어 이름(step 4 결과대로), 호스트 이름(요청에 적힌 사이트 이름 — 웹 브라우저가 주소창의 이름을 요청에 함께 보낸다는 것은 근거대로)으로 같은 IP·포트의 사이트를 가르는 규칙. 연결 제한 셋과 기본값(step 4 결과대로). TCP 포트 번호와 시리얼 포트(4절 — step 4의 근거대로, 「자격시험은」 줄은 E가 있을 때만). 예: `www.example.com`(`http`·지정하지 않은 모든 IP·`80`·`www.example.com`)과 `shop.example.com`(같은 IP·같은 포트·호스트 이름만 다름) — 요청이 어느 사이트로 가는지 단계대로(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n291`~`n293`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n291` | `iis` | 4지선다 「상황 적용」 — 웹 사이트 설정을 바꾸려는 관리자가 실행 창에 무엇을 입력해 IIS 관리자를 여는지 고르게 한다. 정답 inetmgr(step 4 결과의 꼴), 오답은 같은 범주의 다른 관리 도구 실행 이름에서(예: dhcpmgmt.msc, certmgr.msc, eventvwr.msc — 각 도구가 무엇을 여는지 해설에 쓴다, phase 80 `mmc-run-commands`와 뜻을 맞춘다). **컴퓨터 관리(compmgmt.msc)를 오답으로 두지 마라** — 그 안에서 IIS 관리자를 열 수 있는지 확인되지 않았다. 기출 묶음(wf.msc·msconfig·inetmgr.exe·dsac.exe)과 같은 넷이 되지 않게 한다. **정답 위치 0** |
| `n292` | `iis` | 예/아니요 「개념 확인」 — **예** 쪽으로 세운다. 예: 한 IIS 서버에 사이트 둘(`news.example.com`·`hr.example.com`)을 만들고 같은 응용 프로그램 풀에 맡길 수 있나요?(예 — step 4 결과대로). 해설은 풀이 무엇이고 사이트마다 풀을 나누면 무엇이 좋은지(격리)를 가르친다. n291과 다른 것을 묻는다 |
| `n293` | `iis-site-bindings` | 4지선다 「상황 적용」 — 한 서버의 같은 IP 주소·같은 포트 80으로 두 사이트(본문과 다른 이름)를 함께 운영하려면 바인딩에서 무엇을 다르게 정해야 하는지 고르게 한다. 정답 호스트 이름, 오답은 바인딩의 다른 값과 헷갈리는 것(형식, 실제 경로 — 바인딩이 아니다, 연결 시간 제한 등 — step 4 결과로 정말 그것으로는 가를 수 없는지 따진다). 기출 묶음(IP 주소·TCP 포트·연결 수 제한·연결 시간 제한)과 같은 넷이 되지 않게 한다. **정답 위치 1** |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 58·아니요 57, 정답 위치 45/45/44/44.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `iis` — `IisSitePoolDiagram`, JSON 키 `iis-site-pool`

- 물음형 제목 예: `IIS에서 사이트와 응용 프로그램 풀은 어떻게 이어질까?`
- 그릴 것: 서버 `SRV01`(그룹 박스) 안에 사이트 노드(Default Web Site·`www.example.com`)와 응용 프로그램 풀 노드(본문이 든 것만 — 풀 이름을 지어내지 말고, 본문이 「풀 A」처럼 이름표로 쓴 것만), 사이트 → 풀 경로. 서버 밖에 웹 브라우저 노드와 IIS 관리자 노드.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `request` | 요청 | 웹 브라우저·사이트·풀과 그 경로 | 브라우저의 요청을 사이트가 받고, 그 사이트를 맡은 풀의 작업자 프로세스가 처리한다 |
  | `manage` | 관리 | IIS 관리자·사이트·풀 | 관리자는 IIS 관리자에서 사이트와 풀을 설정한다 |

- 요점 테스트: `request`에서 보이는 경로가 브라우저에서 사이트를 거쳐 풀에 닿고, `manage`에서는 브라우저 노드가 흐리다. 사이트 둘이 같은 풀 노드로 이어지는 경로가 있으면(본문이 한 풀에 여러 사이트를 말할 때) 그 둘의 끝점이 같은 노드다.

#### 3-2. `iis-site-bindings` — `SiteBindingsDiagram`, JSON 키 `site-bindings`

- 물음형 제목 예: `같은 주소와 포트로 온 요청을 IIS는 어느 사이트로 보낼까?`
- 그릴 것: 바인딩 네 칸(형식·IP 주소·포트·호스트 이름)을 「칸 이름: 값」 줄로 — 사이트 둘(`www.example.com`·`shop.example.com`)마다 한 묶음(세로형은 위아래, 가로형은 좌우). 요청 노드 둘(호스트 이름이 다른 요청)과 어느 사이트로 가는지의 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `www` | www 요청 | `www.example.com` 요청과 그 사이트 묶음 | 형식·IP·포트가 같아도 호스트 이름이 맞는 사이트가 받는다 |
  | `shop` | shop 요청 | `shop.example.com` 요청과 그 사이트 묶음 | 같은 서버·같은 포트 `80`이지만 다른 사이트로 간다 |

- 요점 테스트: 두 시나리오에서 선명한 사이트 묶음이 다르고, 두 묶음의 형식·IP·포트 칸 라벨은 같으며 호스트 이름 칸 라벨만 다르다(요점 — 가르는 값은 호스트 이름).

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 293개, 마지막 id는 `n293`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 1~3이 푼 낱말을 다시 풀지 않았는가. HTTPS·포트에 관한 말이 앞 주제와 어긋나지 않는가.
3. n291·n293의 보기 넷을 step 4의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 5를 갱신한다(guide.md 「summary에 적을 것」 / error / blocked — step 1과 같은 규칙).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 9~23을 만들지 마라.** 이유: 다른 step의 범위다. 실제 경로·가상 디렉터리·요청 필터링·로그는 이 step의 글에서 이름만 들고 풀지 않는다.
- **IIS 인증 방식·ASP.NET·URL 재작성·인증서 요청 절차를 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 1~3의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
