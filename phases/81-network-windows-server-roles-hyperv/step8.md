# Step 8: remote-access-wap

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 `windows-server-roles`의 마지막 개념 둘(13 원격 액세스 역할, 14 웹 응용 프로그램 프록시)의 글·문항·도식을 함께 만들고, 주제 전체(14개념)를 통독한다.** 14는 13에 딸린 개념이다.
쓰기를 마친 뒤 주제 전체를 통독하는 데 시간을 쓴다.

기출은 원격 컴퓨터를 네트워크에 잇는 DirectAccess나 VPN과 달리 내부 웹 자원을 인터넷에 게시하는 원격 액세스의 기능이 웹 응용 프로그램 프록시라는 것을 두 번 묻는다
([기출 2024-08-25 #38]·[기출 2025-05-25 #39] — 같은 문항, 오답 PPTP·L2TP·SSTP).

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 4 `summary`(원격 액세스의 역할 서비스·VPN 터널링 프로토콜·DirectAccess·웹 응용 프로그램 프록시와 지금 판의 상태, 기출 판정, E 번호)와 step 0의 「Features Removed or No Longer Developed」 줄, step 1~7 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 1과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 0·4)」 항목), `docs/source/network/exam-notes.md`(phase 81이 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`windows-server-roles`의 앞 개념 열둘(step 1~7)**, 특히 `server-roles-features`·`iis`·`file-print-services`. `ip-address-types.nat`·`private-address`(NAT·사설 주소), `routing`(라우팅의 뜻), `app-protocols-mgmt-security.tls`·`https`
- `src/data/network/questions.json`, `src/data/network/visuals/windows-server-roles.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `NatTranslationDiagram`(안과 밖), `MailPathDiagram`(길과 구간), `SmbShareAccessDiagram`·`IisSitePoolDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-08-25 #38], [기출 2025-05-25 #39] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-server-roles` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 13 | `windows-server-roles.remote-access` | 원격 액세스 역할 | — | **목록 개념**. 소개 문단 — 원격 액세스 역할이 무엇인지(step 4 결과대로). 항목은 역할 서비스 셋(step 4가 확인한 한국어 화면 이름과 영문 — 「글」의 항목 이름 규칙 (1)). 항목마다 그 역할 서비스가 해 주는 일을 한 문장. 항목 뒤 문단: **VPN**(인터넷 위에 암호화한 **터널**(두 지점 사이에 만든 보호된 통로 — 한 줄)을 만들어 원격 컴퓨터를 회사 네트워크의 일부처럼 쓰게 하는 기술)과 Windows VPN 서버의 터널링 프로토콜 이름(step 4 결과대로 — 이름만 한 줄), DirectAccess의 뜻과 지금 판의 상태(step 4 결과대로), 라우팅 역할 서비스의 NAT(한 줄 — `ip-address-types.nat`과 뜻을 맞춘다). **VPN과 DirectAccess**(4절). 예: 집에 있는 `PC01`이 VPN으로 회사의 `SRV01` 공유 폴더 `\\SRV01\Data`를 연다(「예시 값」 — `file-print-services`의 예를 이어 쓴다) |
| 14 | `windows-server-roles.web-application-proxy` | 웹 응용 프로그램 프록시 | `windows-server-roles.remote-access` | 웹 응용 프로그램 프록시의 뜻(step 4 결과대로), **프록시**(다른 컴퓨터를 대신해 요청을 받아 넘겨 주는 중계자)와 **역방향 프록시**(서버 쪽에 서서 바깥 요청을 받아 안의 서버로 넘기는 중계자 — 한 줄씩). **웹 응용 프로그램**(웹 브라우저로 쓰는 프로그램 — 한 줄). 외부 사용자가 게시된 응용 프로그램 하나에만 닿고 회사 네트워크에 이어지지 않는다는 것(step 4 결과대로). 사전 인증과 통과(step 4 결과대로 한 줄 — AD FS는 이름과 「사용자를 확인해 주는 서비스」 한 줄), 지금 판의 상태(step 4 결과대로 한 줄). **웹 응용 프로그램 프록시와 VPN**(4절). 예: 내부 서버 `SRV03`의 웹 응용 프로그램을 `https://app.example.com/`으로 게시 — 인터넷 사용자의 요청이 어디를 거쳐 어디로 가고 응답이 어떻게 돌아오는지 단계대로(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n298`~`n300`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n298` | `remote-access` | 4지선다 「상황 적용」 — 본문과 다른 장면(출장 중인 직원 노트북 `PC07`이 회사 내부의 여러 서버와 파일 공유에 접근해야 한다 등)을 주고 원격 액세스 역할의 무엇을 써야 하는지 고르게 한다. 정답·오답은 원격 액세스의 구성 요소(DirectAccess 및 VPN(RAS)·라우팅·웹 응용 프로그램 프록시 — step 4가 확인한 이름)와 같은 범주의 하나에서. 보기 넷이 모자라면 같은 역할 안의 구분(VPN·DirectAccess를 따로)을 쓴다 — 지금 판에서 더 개발하지 않는 것을 정답으로 두지 마라(step 4의 상태 근거). **정답 위치 0**. 기출 묶음(WAP·PPTP·L2TP·SSTP)과 같은 넷이 되지 않게 한다 — 이 문항은 터널링 프로토콜 이름을 보기로 쓰지 않는다 |
| `n299` | `web-application-proxy` | 예/아니요 「원리 이해」 — **아니요** 쪽으로 세운다. 예: 회사가 웹 응용 프로그램 프록시로 사내 웹 응용 프로그램 하나를 게시하면, 그 응용 프로그램을 쓰는 외부 사용자의 컴퓨터가 회사 내부 네트워크에 이어져 다른 내부 서버에도 접근할 수 있게 되나요?(아니요 — step 4 결과대로). 해설은 역방향 프록시가 하는 일과 VPN과의 차이를 가르친다 |
| `n300` | `web-application-proxy` | 4지선다 「원리 이해」 — 인터넷 사용자가 웹 응용 프로그램 프록시를 거쳐 사내 웹 응용 프로그램(본문과 다른 이름)을 쓸 때 실제로 일어나는 일을 고르게 한다. 정답은 프록시가 요청을 받아 내부 웹 서버로 넘기고 응답을 돌려준다는 것, 오답은 흔한 혼동(외부 컴퓨터가 내부 주소를 받아 내부 서버와 직접 통신한다 — VPN, 내부 웹 서버의 파일이 프록시로 복사되어 프록시가 직접 답한다, 내부 서버의 사설 주소가 인터넷에 알려져 사용자가 바로 접속한다 등 — 출처로 정말 틀렸는지 따진다). **정답 위치 1**. n299와 다른 것을 묻는다(n299는 「무엇에 닿는가」, n300은 「요청이 어떻게 오가는가」) |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 59·아니요 59, 정답 위치 46/46/45/45.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `remote-access` — `RemoteAccessServicesDiagram`, JSON 키 `remote-access-services`

- 물음형 제목 예: `원격 액세스 역할은 바깥에서 무엇을 쓰게 해 줄까?`
- 그릴 것: 회사 네트워크(그룹 박스 — 안에 원격 액세스 서버 노드, `SRV01`(공유 `Data`), 내부 웹 응용 프로그램 노드), 바깥의 원격 컴퓨터 `PC01`과 인터넷 사용자 노드. 역할 서비스마다 길을 하나씩.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `vpn` | VPN | `PC01`·원격 액세스 서버·`SRV01`과 그 경로 | 원격 컴퓨터가 터널로 회사 네트워크에 이어져 내부 서버를 쓴다 |
  | `wap` | 웹 응용 프로그램 프록시 | 인터넷 사용자·원격 액세스 서버·내부 웹 응용 프로그램 | 게시한 웹 응용 프로그램 하나에만 요청이 전달된다 |

  라우팅을 그림에 넣을지는 본문이 쓴 만큼 — 넣으면 시나리오 하나를 더하고 summary에 적는다.
- 요점 테스트: `vpn`과 `wap`의 끝 노드가 다르다(`SRV01` / 내부 웹 응용 프로그램). `wap`에서 `SRV01`이 흐리고 거기로 가는 경로가 보이지 않는다.

#### 3-2. `web-application-proxy` — `WebAppProxyDiagram`, JSON 키 `web-app-proxy`

- 물음형 제목 예: `웹 응용 프로그램 프록시를 거친 요청은 어디까지 갈까?`
- 그릴 것: 인터넷 사용자 → 웹 응용 프로그램 프록시(회사 네트워크의 가장자리) → 내부 서버 `SRV03`의 웹 응용 프로그램, 그리고 응답이 돌아오는 길. 회사 네트워크 박스 안에 다른 내부 서버(`SRV01`) 노드. 주소 `https://app.example.com/`은 곁말이나 노드로(길면 조각으로).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `request` | 요청 | 사용자·프록시·`SRV03`과 요청 경로 | 프록시가 바깥 요청을 받아 내부 웹 응용 프로그램으로 넘긴다 |
  | `response` | 응답 | 같은 노드와 응답 경로(반대 방향) | 응답은 프록시를 거쳐 사용자에게 돌아간다 |
  | `boundary` | 닿지 않는 곳 | 사용자·`SRV01`(흐림 아님)·경로 없음 | 게시하지 않은 내부 서버로 가는 길은 없다 — 컴퓨터가 회사 네트워크에 이어지지 않는다 |

- 요점 테스트: `request`와 `response`의 보이는 경로가 서로 다른 id이고 화살표 방향이 반대다(끝점이 뒤바뀐다). 어느 시나리오에서도 사용자 노드에서 `SRV01`로 이어지는 경로가 없다.

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. `boundary`가 「흐린 것 + 경로 없음」으로 다른 시나리오와 갈리지 않으면 빼고 그 내용을 `request`의 곁말로 옮긴다.

### 4. 주제 `windows-server-roles` 통독

쓰기를 마친 뒤 **주제 `windows-server-roles`의 열네 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이, 같은 규칙을 여러 곳이 말해야 하는 곳 — 예: DHCP 임대의 말, `Install-WindowsFeature`의 꼴, IIS 관리자의 이름)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다. 도식 열네 개의 문구도 함께 읽는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 300개, 마지막 id는 `n300`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 지금 판에서 더 개발하지 않는 기능을 그렇게 밝혔는가(step 4 결과대로).
3. n298·n300의 보기 넷을 step 4의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. 주제 `windows-server-roles`의 열네 개념을 통독한다(「작업」 4). 도식 열네 개의 문구도 함께 읽는다.
5. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(「앞 개념에 고칠 것」에 통독 결과).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 15~23(`windows-hyperv`)을 만들지 마라.** 이유: step 10~14의 범위다.
- **VPN·DirectAccess의 배포 절차·인증서 구성·Always On VPN, AD FS의 동작을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 1~7의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
