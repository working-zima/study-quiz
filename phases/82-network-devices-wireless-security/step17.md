# Step 17: waf-nac

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `network-security`의 개념 둘(3 WAF, 4 NAC)의 글·문항·도식을 함께 만든다.** 둘 다 머리 개념이다.

기출은 웹 서버 앞에서 HTTP 요청의 내용을 살펴 웹 공격을 막는 것이 WAF라는 것을 두 번 묻고([기출 2025-05-25 #49]·[기출 2026-05-17 #48] — 지문, 오답 IDS·IPS·방화벽),
네트워크에 들어오려는 장치를 먼저 확인하는 것이 NAC라는 것을 두 번 묻는다([기출 2024-02-25 #20] — 오답 NIC·방화벽·IPS, [기출 2025-02-23 #49] — 지문, 오답 NAT).

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 15 `summary`(WAF의 정의·막는 공격·네트워크 방화벽과의 차이, NAC·802.1X·세 역할·제한, 기출 판정, E 번호)와 step 16 `summary`(앞 개념이 푼 낱말)
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 16과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 15)」 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`network-security`의 앞 개념 둘(step 16)**, `windows-server-roles.request-filtering`(IIS가 요청 내용으로 막는 기능), `ip-address-types.nat`(NAT) — 뜻을 맞춘다
- `src/data/network/questions.json`, `src/data/network/visuals/network-security.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `RequestFilteringDiagram`(요청 내용으로 막기), `DhcpExchangeDiagram`(세 장치가 주고받는 차례), `FirewallRulesDiagram`·`IdsIpsPlacementDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 위 4문항 — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `network-security` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `network-security.waf` | WAF | — | WAF의 뜻(step 15 결과대로 — 영문 이름과 한국어 이름), **웹 응용 프로그램**(웹 브라우저로 쓰는 프로그램)·**HTTP 요청**(브라우저가 웹 서버에 보내는 요청 — 한 줄씩), 막는 공격의 예(step 15가 확인한 것 — 공격 이름만이 아니라 무엇을 노리는지 한 줄씩), 앞 개념의 방화벽·IPS와 무엇이 다른지. `windows-server-roles.request-filtering`과 뜻을 맞춘 한 줄(근거대로). **WAF와 네트워크 방화벽**(4절 — 둘 다 TCP `443`을 허용하는 같은 연결을 보고도 무엇을 보느냐가 다르다). 예: `www.example.com` 앞의 `WAF01`이 로그인 칸에 SQL 문장을 섞은 요청은 막고 여느 로그인 요청은 웹 서버로 넘긴다(「예시 값」) |
| 4 | `network-security.nac` | NAC | — | NAC의 뜻(step 15 결과대로), **인증**(누구인지 확인하는 것 — 한 줄), 보안 상태를 확인한다는 것(정한 정책 — 근거대로), 802.1X와 세 역할(이름은 step 15 결과대로 — 누가 무엇을 하는지 차례대로), 인증 전에는 포트가 인증 메시지만 통과시킨다는 것, 정책을 지키지 않은 장치의 처리(근거대로). **NAC와 NAT**(4절 — 이름이 비슷한 다른 기술, `ip-address-types.nat`과 뜻을 맞춘다), **NAC와 방화벽**(4절). 예: 노트북 `LAPTOP03`이 스위치 `SW01`의 포트에 꽂히면, 인증 서버 `AUTH01`의 확인을 받기 전에는 인증 메시지만 오가고, 확인이 끝나야 사내 네트워크로 통신한다(「예시 값」 — 단계대로) |

### 2. 문항 — `src/data/network/questions.json`에 `n343`~`n346`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n343` | `waf` | 4지선다 「상황 적용」 — 본문과 다른 장면(쇼핑몰 `news.example.com`의 검색 칸에 스크립트를 넣는 공격을 막아야 하는데, 방화벽은 이미 TCP 443만 허용하고 있다 등)을 주고 무엇을 더 두어야 하는지 고르게 한다. 오답은 같은 범주(포트를 더 막는 규칙, NAC, 다른 계층의 장치 — step 15 근거로 정말 그 공격을 막지 못하는지 따진다). **IPS를 오답으로 두려면 IPS가 그 공격을 막을 수 없다는 근거가 있어야 한다** — 없으면 IPS를 보기로 쓰지 마라. **정답 위치 2**. 기출 묶음(IDS·IPS·방화벽·WAF)을 쓰지 않는다 |
| `n344` | `waf` | 예/아니요 「원리 이해」 — **예** 쪽으로 세운다. 예: 포트 443으로 들어오는 연결을 허용한 방화벽을 지나온 요청이라도, WAF는 그 HTTP 요청의 내용에 공격 문자열이 있으면 막을 수 있나요?(예 — step 15 결과대로). 해설은 네트워크 방화벽과 WAF가 보는 것의 차이를 가르친다. n343과 다른 것을 묻는다 |
| `n345` | `nac` | 4지선다 「원리 이해」 — 802.1X의 세 역할 가운데 하나가 하는 일을 묻거나(예: 스위치 포트가 인증 전에 하는 일), 본문과 다른 장면(무선 AP에 붙으려는 노트북 `LAPTOP07`)에서 차례를 묻는다. 오답은 역할을 바꾼 것(신청자·인증자·인증 서버를 바꿔 읽은 것). **정답 위치 3**. 기출 묶음(NIC·방화벽·IPS·NAC, NAT·NAC)을 쓰지 않는다 — 이 문항은 기술 이름을 보기로 쓰지 않는다 |
| `n346` | `nac` | 예/아니요 「개념 비교」 — **아니요** 쪽으로 세운다. 예: NAC는 사설 IP 주소를 쓰는 사내 장치들이 인터넷에 나갈 때 주소를 공인 주소로 바꿔 주는 기술인가요?(아니요 — 그것은 NAT, NAC는 접속 전에 장치를 확인한다, step 15 결과대로). 해설은 NAC와 NAT를 가른다. n345와 다른 것을 묻는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 69·아니요 69, 정답 위치 52/52/52/52.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `waf` — `WafInspectionDiagram`, JSON 키 `waf-inspection`

- 물음형 제목 예: `WAF는 웹 요청의 무엇을 보고 막을까?`
- 그릴 것: 사용자 노드 둘(또는 요청 노드 둘 — 「여느 로그인 요청」·「SQL 문장을 섞은 요청」, 본문의 말대로), `WAF01`, `www.example.com` 웹 서버 노드. 요청마다 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `normal` | 여느 요청 | 여느 요청·`WAF01`·웹 서버와 그 경로 | 요청 내용에 문제가 없으면 웹 서버로 넘긴다 |
  | `attack` | 공격 요청 | 공격 요청·`WAF01`과 `WAF01`에서 멈추는 경로 | 같은 포트로 온 요청이라도 내용에 공격이 있으면 막는다 |

- 요점 테스트: `attack`의 보이는 경로가 `WAF01`에서 끝나고 웹 서버는 흐리다. `normal`의 경로는 `WAF01`을 지나 웹 서버에서 끝난다. 두 시나리오의 선명한 요청 노드가 다르다.

#### 3-2. `nac` — `NacAdmissionDiagram`, JSON 키 `nac-admission`

- 물음형 제목 예: `NAC는 장치를 언제 네트워크에 들여보낼까?`
- 그릴 것: `LAPTOP03`(신청자 — 곁말), `SW01`(인증자), `AUTH01`(인증 서버), 사내 네트워크 노드. 인증 메시지 경로(`LAPTOP03`↔`SW01`↔`AUTH01`)와 사내로 가는 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `before` | 인증 전 | 세 장치와 인증 메시지 경로 | 확인이 끝나기 전에는 포트가 인증 메시지만 통과시킨다 |
  | `after` | 인증 뒤 | `LAPTOP03`·`SW01`·사내 네트워크와 그 경로 | 확인을 받은 장치만 사내 네트워크와 통신한다 |

  step 15가 정책을 지키지 않은 장치의 처리(제한된 네트워크)를 확인했으면 `restricted` 시나리오를 더할 수 있다 — 더하면 그 노드를 본문에 먼저 쓴다.
- 요점 테스트: `before`에서 사내 네트워크로 가는 경로가 보이지 않고 사내 노드는 흐리다. `after`에서는 그 경로가 보이고 `AUTH01`은 흐리다.

위 도식 설계는 출발점이다. 본문(step 15 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 346개, 마지막 id는 `n346`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 802.1X의 차례가 step 15의 절과 하나씩 맞는가.
3. n343·n345의 보기 넷을 step 15의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/82-network-devices-wireless-security/index.json`의 step 17을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 5~8을 만들지 마라.** 이유: step 18~19의 범위다.
- **웹 공격의 기법 전체·802.1X의 EAP 방식·RADIUS 속성을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」). 공격은 예 둘쯤만.
- **step 16의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
