# Step 12: ipconfig

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 주제 `diagnostic-commands`를 만들고 그 첫 개념 둘(18 ipconfig 명령, 19 ipconfig의 옵션)의 글·문항·도식을 함께 만든다.** 19는 18에 딸린 개념이다.

기출은 호스트 이름·IP 주소·서브넷 마스크·DNS 서버·기본 게이트웨이 같은 설정을 보는 명령으로 `ipconfig /all`을([기출 2026-05-17 #38]), DNS 캐시를 비우는 명령으로 `ipconfig /flushdns`를([기출 2025-02-23 #38]),
DHCP에서 주소를 새로 받는 명령으로 `ipconfig /renew`를([기출 2026-02-01 #41]) 고르게 한다.

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 11 `summary`(ipconfig에 무엇을 쓰고 무엇을 쓰지 않는지, 출력 예가 있는지, 옵션 표기, E 항목)와 앞 step `summary`의 형식
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 78 step 11)」 줄 — ipconfig·nslookup·ip-address(8), RFC 2131 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(`ip-addressing`의 IP 주소·서브넷 마스크, `ip-address-types.dhcp`와 그 `ipconfig /all` 문단, `routing`의 기본 게이트웨이 — 뜻과 값을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `ChmodChangeDiagram`(명령 전과 뒤), `FstabFieldsDiagram`·`RoutingTableDiagram`(표 모양), `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-02-23 #38], [기출 2026-02-01 #41], [기출 2026-05-17 #38] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`app-protocols-mgmt-security` 주제 객체 바로 뒤에 주제 객체를 더한다 — `{ "id": "diagnostic-commands", "title": "네트워크 진단 명령", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 3(★★★, 출제 10/11회)인지 `data.test.ts`의 주제 지도 표와 견준다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 18 | `diagnostic-commands.ipconfig` | ipconfig 명령 | — | 이 주제의 첫 개념이라 **명령**(입력해 실행하는 프로그램의 이름 — 한 줄), **명령 프롬프트**(Windows에서 명령을 입력하는 창 — 한 줄), **옵션**(명령 뒤에 붙여 하는 일을 바꾸는 표시 — 한 줄), **IP 주소**·**서브넷 마스크**·**기본 게이트웨이**·**DNS 서버**·**DHCP**를 한 줄씩 푼다(`ip-addressing`·`ip-address-types`·`routing`의 말과 뜻을 맞춘다). 옵션 없이와 **`/all`**이 무엇을 보이는지 — 항목은 step 11이 확인한 만큼만, 출력 예가 문서에 없으면 화면을 지어 보이지 않고 「무엇이 보이는지」를 말로. 예: PC `192.0.2.10`(마스크 `255.255.255.0`, 기본 게이트웨이 `192.0.2.1`, DNS 서버 `192.0.2.53`, DHCP 서버 `192.0.2.1` — 「예시 값」)에서 두 명령을 입력했을 때 무엇이 더 보이는지. Linux의 `ip address`는 step 11 결과대로 한 줄. **옵션 없이와 `/all`이 무엇이 다른지**(4절) |
| 19 | `diagnostic-commands.ipconfig-options` | ipconfig의 옵션 | `ipconfig` | **목록 개념** — 소개 문단 뒤에 항목 넷: `- **주소 내놓기**(`/release`)는 …`, `- **주소 다시 받기**(`/renew`)는 …`, `- **DNS 캐시 보기**(`/displaydns`)는 …`, `- **DNS 캐시 비우기**(`/flushdns`)는 …`. **DNS 클라이언트 캐시**(이 컴퓨터가 최근에 알아낸 이름과 주소의 짝을 잠시 적어 둔 것 — 한 줄)를 푼다. 항목마다 입력한 뒤 무엇이 달라지는지(같은 PC `192.0.2.10`의 예로 — 주소를 내놓은 뒤에는 그 어댑터에 IP 주소가 없다, 다시 받으면 DHCP 서버에서 받는다, 캐시를 비우면 `www.example.com`을 다음에 열 때 DNS 서버에 다시 묻는다). 항목 뒤 문단: 주소를 새로 받을 때의 차례(`/release` 뒤 `/renew` — step 11 결과대로), **주소를 다루는 둘과 이름 캐시를 다루는 둘이 무엇이 다른지**(4절), DNS 서버에 직접 묻는 `nslookup`은 이름과 한 줄. 옵션 표기는 step 11 summary대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n216`~`n218`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n216` | `ipconfig` | 4지선다 「상황 적용」 — `ipconfig`만 입력했더니 IP 주소·서브넷 마스크·기본 게이트웨이는 보이는데 DNS 서버 주소(또는 물리 주소)가 보이지 않는 상황(본문과 다른 PC 주소 — 예: `192.0.2.20`)을 주고, 그것을 보려면 무엇을 입력하는지 고르게 한다. 정답: `ipconfig /all`. 오답은 같은 명령의 다른 옵션 — `ipconfig /displaydns`(이름 캐시를 보일 뿐), `ipconfig /renew`(주소를 다시 받을 뿐), 옵션 없이 다시 입력. step 11이 확인한 `/all`의 항목으로 정답이 정해지는지 본다. 기출 묶음(`arp -a`·`ipconfig /all`·`convert`·`netstat`)을 쓰지 않는다. **정답 위치 2** |
| `n217` | `ipconfig-options` | 4지선다 「원리 이해」 — 네트워크의 DHCP 서버가 바뀌어 PC가 지금 주소를 놓고 새 서버에서 다시 받게 하려는 상황을 주고, 입력할 차례를 고르게 한다. 정답: `/release` 뒤 `/renew`(step 11 결과대로). 오답은 흔한 실수 — 차례를 바꾼 것(`/renew` 뒤 `/release`), 이름 캐시 옵션과 섞은 것(`/flushdns` 뒤 `/renew`, `/displaydns` 뒤 `/flushdns`). 기출 묶음 둘(`/displaydns`·`/flushdns`·`/release`·`/renew`, `/renew`·`/release`·`/flushdns`·`/setclassid`)을 하나씩 늘어놓는 꼴로 쓰지 않는다 — 보기가 차례(두 명령의 짝)라서 범주가 다르다. **정답 위치 3** |
| `n218` | `ipconfig-options` | 예/아니요 「원인과 결과」 — step 10이 끝난 뒤의 균형(계획대로면 예 40·아니요 41)에서 **예** 쪽으로 세운다. 예: `ipconfig /flushdns`를 입력한 뒤 전에 열었던 웹 사이트 이름(본문과 다른 이름 — 예: `shop.example.org`)을 다시 열면 컴퓨터가 그 이름의 주소를 DNS 서버에 다시 묻는가(예). n217과 다른 것을 묻는다. 문제문이 답의 이유를 알려 주지 않게 한다. 해설은 DNS 클라이언트 캐시와 `/flushdns`, 그리고 `/flushdns`가 IP 주소를 건드리지 않는다는 것을 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 41·아니요 41, 정답 위치 34/34/34/34.

### 3. 도식

이 step이 `src/data/network/visuals/diagnostic-commands.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'diagnostic-commands': diagnosticCommandsVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」 — `'app-protocols-mgmt-security'` 항목 바로 뒤).

#### 3-1. `diagnostic-commands.ipconfig` — `IpconfigViewDiagram`, JSON 키 `ipconfig-view`

- 물음형 제목 예: `ipconfig는 무엇을 보여 줄까?`
- 그릴 것: 명령 노드(`ipconfig`, `ipconfig /all`)와 「항목 이름: 값」 줄 여럿(표 모양 — 선례 `FstabFieldsDiagram`). 옵션 없이 보이는 줄(IP 주소 `192.0.2.10`·서브넷 마스크·기본 게이트웨이)과 `/all`에서 더 보이는 줄(DNS 서버·DHCP 서버 등 — step 11이 확인하고 본문에 쓴 항목만)을 그룹 박스로 가른다. 출력 화면을 흉내 내지 말고, 항목 이름은 본문의 말로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `basic` | 옵션 없이 | `ipconfig`와 기본 줄 | 주소·서브넷 마스크·기본 게이트웨이를 간단히 보인다 |
  | `all` | /all | `ipconfig /all`과 기본 줄·더 보이는 줄 | 자세히 — DNS 서버·DHCP 같은 설정까지 보인다 |

- 요점 테스트: `basic`에서 선명한 줄에 DNS 서버 줄이 없고 `all`에서는 있다. 기본 줄의 IP 주소 값 라벨이 본문 예 `192.0.2.10`과 같다. `all`의 선명한 줄 수가 `basic`보다 많다.

#### 3-2. `diagnostic-commands.ipconfig-options` — `IpconfigOptionsDiagram`, JSON 키 `ipconfig-options`

- 물음형 제목 예: `옵션마다 무엇이 바뀔까?`
- 그릴 것: 명령 전과 뒤(선례 `ChmodChangeDiagram`) — 위쪽에 PC의 지금 상태(IP 주소 `192.0.2.10`, DNS 캐시의 `www.example.com` 줄), 가운데 옵션 노드, 아래쪽에 옵션마다 바뀐 뒤의 상태 노드. 시나리오마다 옵션 노드와 뒤 상태 노드는 **다른 id·다른 자리**에 둔다(같은 자리에 겹쳐 두지 않는다). DHCP 서버로 가는 경로는 `/release`·`/renew`에서만 보인다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `release` | /release | `/release`와 주소가 없는 뒤 상태 | 주소를 DHCP 서버에 돌려주어 어댑터에 IP 주소가 없어진다 |
  | `renew` | /renew | `/renew`·DHCP 서버와 주소를 다시 받은 뒤 상태 | DHCP 서버에서 설정을 다시 받는다 |
  | `displaydns` | /displaydns | `/displaydns`와 캐시 줄 | 이 컴퓨터가 적어 둔 이름과 주소의 짝을 보인다 |
  | `flushdns` | /flushdns | `/flushdns`와 비운 캐시 | 캐시를 비워 다음에 그 이름을 쓸 때 DNS 서버에 다시 묻는다 — 주소는 그대로다 |

- 요점 테스트: `flushdns`에서 선명한 뒤 상태 노드에 IP 주소 `192.0.2.10`이 그대로 있고 캐시 줄은 없다. `release`에서 선명한 뒤 상태 노드에 IP 주소 값이 없다. DHCP 서버로 가는 경로는 `release`·`renew`에서만 보이고 `displaydns`·`flushdns`에서는 보이지 않는다.

위 도식 설계는 출발점이다. 본문(step 11 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 218개, 마지막 id는 `n218`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `app-protocols-mgmt-security` 바로 뒤·`linux-filesystem` 앞에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   `ip-address-types.dhcp`의 `ipconfig /all` 문단과 어긋나지 않는가. 출력 화면을 지어 보이지 않았는가(step 11 summary의 「출력 예」 판정).
4. n216·n217의 보기마다 명령을 입력했을 때의 결과를 따져 정답이 하나뿐인지 본다.
5. `phases/78-network-app-protocols-diagnostics/index.json`의 step 12를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 20~25를 만들거나 앞 두 주제를 고치지 마라.** 이유: 다른 step의 범위다.
- **`ip-address-types`·`routing` 주제의 글을 고치지 마라.** 이유: 앞 phase의 주제다. 어긋남을 찾으면 summary에 적는다.
- **step 11이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. `ipconfig /all`의 화면을 지어 보이지 마라.
- **DNS의 동작(이름 풀이 차례·레코드·TTL)과 `/registerdns`·`/setclassid`를 쓰지 마라.** 이유: DNS는 phase 79의 주제이고, 기출이 묻지 않는 옵션을 끌어오지 않는다(ADR-059 「범위」).
