# Step 10: gateway-proxy

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `network-devices`의 개념 둘(3 게이트웨이, 4 프록시 서버)의 글·문항·도식을 함께 만든다.** 둘 다 머리 개념이다.

기출은 게이트웨이가 프로토콜이 다른 네트워크 사이의 출입구라는 것을 네 번 묻고([기출 2025-02-23 #48]·[기출 2026-05-17 #47] — 오답 허브·리피터·물리 주소 캐시, [기출 2024-02-25 #48]·[기출 2025-11-02 #47] — 「전송 계층만 잇는다」·「프레임만 중계한다」가 틀린 말),
클라이언트를 대신해 요청을 보내는 중계자인 프록시를 묻는다([기출 2024-02-25 #16] — 지문 누락, 오답 DNS·DB·TTS).

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 8 `summary`(게이트웨이의 정의와 계층에 따른 모습·기본 게이트웨이·쓸 수 있는 예, 프록시·역방향 프록시·캐시, 기출 판정, E 번호)와 step 9 `summary`(앞 개념이 푼 낱말)
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 9와 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 8)」 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`network-devices`의 앞 개념 둘(step 9)**, `routing.default-route`(기본 게이트웨이), `windows-server-roles.web-application-proxy`(역방향 프록시의 예) — 뜻을 맞춘다
- `src/data/network/questions.json`, `src/data/network/visuals/network-devices.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `WebAppProxyDiagram`(역방향 프록시의 길), `DefaultRouteDiagram`(기본 게이트웨이), `NatTranslationDiagram`(바뀌는 것), `DeviceLayersDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-02-25 #48], [기출 2025-02-23 #48], [기출 2025-11-02 #47], [기출 2026-05-17 #47], [기출 2024-02-25 #16] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `network-devices` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `network-devices.gateway` | 게이트웨이 | — | 게이트웨이의 뜻(step 8 결과대로 — RFC 4949), 왜 형식을 바꿔야 하는지(두 네트워크의 프로토콜이 다르면 서로의 데이터를 그대로 읽지 못한다), 이론상 어느 계층에서도 만들 수 있고 실제로는 계층에 따라 다른 장비로 나타난다는 것(step 8 결과대로 — 앞 개념 `device-layers`의 항목과 뜻을 맞춘다), 옛 문서가 라우터를 게이트웨이라 부르던 쓰임과 IP 설정의 기본 게이트웨이(한 줄씩 — `routing.default-route`와 뜻을 맞춘다). 「자격시험은」 줄은 step 8이 E를 만들었을 때만. **게이트웨이와 기본 게이트웨이**(4절), **게이트웨이와 라우터**(4절). 예: step 8이 확인한 변환의 예(없으면 「프로토콜 A를 쓰는 네트워크」·「프로토콜 B를 쓰는 네트워크」 이름표)와, `PC01`의 기본 게이트웨이 `R01`(「예시 값」) |
| 4 | `network-devices.proxy-server` | 프록시 서버 | — | 프록시의 뜻(step 8 결과대로 — RFC 9110), 클라이언트 쪽 프록시와 역방향 프록시(이름은 step 8 결과대로 — 「정방향 프록시」를 쓸 수 없으면 「프록시」와 「역방향 프록시」로 가른다), 캐시(한 줄 — 같은 응답을 다시 쓰면 무엇이 빨라지는지), 접근 통제·기록 같은 쓰임(근거대로). `windows-server-roles.web-application-proxy`가 역방향 프록시의 한 예라는 것(한 줄 — 그 주제의 말과 맞춘다). **정방향 프록시와 역방향 프록시**(4절 — 누구 쪽에 서는가, 누가 고르는가). 예: 사내 `PC01`이 프록시 `PROXY01`을 거쳐 `www.example.com`의 웹 페이지를 받는 차례(요청 → 프록시가 대신 요청 → 응답 → 프록시가 돌려줌, 「예시 값」 — 단계대로) |

### 2. 문항 — `src/data/network/questions.json`에 `n329`~`n331`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n329` | `gateway` | 4지선다 「개념 비교」 — 「게이트웨이」라는 낱말이 쓰인 두 자리를 가르게 한다. 예: 회사 PC의 IP 설정에 적는 기본 게이트웨이가 하는 일을 고르게 하고, 오답에 RFC 4949의 게이트웨이(형식 변환)·스위치·DNS 서버의 일을 둔다(정답·오답은 step 8 결과와 앞 주제의 사실로 정해져야 한다). 또는 반대로 형식 변환 장면을 주고 그 장비를 고르게 한다. **정답 위치 1**. 기출 묶음(계층·프레임 중계·프로토콜 변환 / 허브·리피터·물리 주소 캐시)을 쓰지 않는다 |
| `n330` | `gateway` | 예/아니요 「원리 이해」 — **예** 쪽으로 세운다. 예: 서로 다른 응용 프로토콜을 쓰는 두 시스템 사이에서 메시지의 형식을 바꿔 전하는 장치도 게이트웨이라 부를 수 있나요?(예 — RFC 4949, 게이트웨이는 한 계층에 묶이지 않는다, step 8 결과대로). 해설은 「전송 계층만」·「프레임만」 같은 말이 왜 틀린지 가르친다. n329와 다른 것을 묻는다 |
| `n331` | `proxy-server` | 4지선다 「상황 적용」 — 본문과 다른 장면(회사가 웹 서버 여러 대 앞에 중계자를 두어 인터넷 사용자의 요청을 대신 받게 한다, 또는 학교가 학생 PC들의 웹 요청을 한곳에 모아 대신 보내게 한다)을 주고 그 중계자를 무엇이라 부르는지 고르게 한다. 오답은 같은 범주(다른 쪽 프록시, 기본 게이트웨이, DNS 서버 등). **로드 밸런서를 오답으로 두지 마라** — 응용 계층 부하 분산 장치도 역방향 프록시처럼 동작할 수 있다(step 8 결과대로 따진다). **정답 위치 2**. 기출 묶음(DNS·Proxy·DB·TTS)을 쓰지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 66·아니요 66, 정답 위치 50/50/50/49.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `gateway` — `GatewayTranslateDiagram`, JSON 키 `gateway-translate`

- 물음형 제목 예: `프로토콜이 다른 두 네트워크는 무엇을 거쳐 이어질까?`
- 그릴 것: 왼쪽 네트워크 그룹 박스(본문의 프로토콜 이름이나 이름표), 오른쪽 네트워크 그룹 박스, 사이의 게이트웨이 노드. 왼쪽 형식의 데이터 노드 → 게이트웨이 → 오른쪽 형식의 데이터 노드. 아래쪽에 `PC01` → 기본 게이트웨이 `R01` → 다른 네트워크 노드.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `translate` | 형식 바꾸기 | 두 네트워크의 데이터 노드·게이트웨이와 그 경로 | 한쪽 형식으로 받은 데이터를 다른 쪽 형식으로 바꿔 넘긴다 |
  | `default-gw` | 기본 게이트웨이 | `PC01`·`R01`·다른 네트워크와 그 경로 | IP 설정의 기본 게이트웨이는 다른 네트워크로 나가는 첫 라우터다 |

- 요점 테스트: `translate`에서 게이트웨이로 들어오는 데이터 노드와 나가는 데이터 노드의 라벨이 다르다(형식이 바뀐다). `default-gw`에서 보이는 경로가 `PC01`에서 시작해 `R01`을 거친다. 두 시나리오의 선명한 노드가 겹치지 않는다.

#### 3-2. `proxy-server` — `ProxyDirectionDiagram`, JSON 키 `proxy-direction`

- 물음형 제목 예: `프록시는 누구 쪽에 서서 요청을 대신 보낼까?`
- 그릴 것: 왼쪽 사내 네트워크 그룹 박스(`PC01`·`PROXY01`), 가운데 인터넷 노드, 오른쪽 서버 쪽 그룹 박스(역방향 프록시 노드·웹 서버 노드 — 본문에 나온 것만), 오른쪽 위나 인터넷 쪽에 `www.example.com` 노드.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `forward` | 클라이언트 쪽 프록시 | `PC01`·`PROXY01`·인터넷·`www.example.com`과 요청 경로 | 사내 PC의 요청을 프록시가 대신 보내고 응답을 돌려준다 |
  | `reverse` | 역방향 프록시 | 인터넷 쪽 사용자·역방향 프록시·웹 서버와 요청 경로 | 서버 쪽에 선 프록시가 바깥 요청을 받아 안의 서버로 넘긴다 |

- 요점 테스트: `forward`의 선명한 프록시 노드는 사내 그룹 박스 안에, `reverse`의 선명한 프록시 노드는 서버 쪽 그룹 박스 안에 있다. 두 시나리오의 선명한 프록시 노드가 다르다.

위 도식 설계는 출발점이다. 본문(step 8 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 331개, 마지막 id는 `n331`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 「게이트웨이」의 두 뜻이 이 화면만 읽고 갈리는가.
3. n329·n331의 보기 넷을 step 8의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/82-network-devices-wireless-security/index.json`의 step 10을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 5~10을 만들지 마라.** 이유: step 11~14의 범위다. 부하 분산은 이 step에서 이름만 쓴다.
- **응용 계층 게이트웨이(ALG)의 프로토콜별 동작, 프록시의 인증·HTTP CONNECT 터널을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 9의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
