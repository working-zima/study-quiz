# Step 13: l4-l7-switch

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `network-devices`의 개념 둘(7 L4 스위치, 8 L7 스위치)의 글·문항·도식을 함께 만든다.** 둘 다 5(부하 분산)에 딸린 개념이다.
**「L4 스위치」·「L7 스위치」는 표준 용어가 아니다**(guide.md 「배경」) — 본문은 표준이 말하는 장치로 설명하고, 이름의 처리는 step 12가 정한 E 항목대로 「자격시험은 ~라 부른다」를 덧붙인다.

기출은 L4 스위치가 네트워크 계층 장비가 아니라는 것([기출 2025-08-24 #50]·[기출 2026-08-02 #46]), 그 기본 기능이 분산 방식·상태 확인·NAT라는 것([기출 2025-11-02 #48]),
지문이 가리키는 장비가 L4 스위치라는 것([기출 2026-02-01 #6] — 오답 L1·L2·L3 스위치), L7 스위치가 TCP/UDP 헤더만으로 나누는 장치가 아니라는 것([기출 2026-02-01 #49])을 묻는다.

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 12 `summary`(포트로 나누는 장치·LSNAT의 차례·기본 기능, URL로 나누는 장치, 「L4·L7 스위치」 이름과 기출 보기의 처리, E 번호)와 step 8~11 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 9와 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 8·12)」 항목), `docs/source/network/exam-notes.md`(E7과 phase 82가 더한 E — 특히 L4·L7 스위치 항목의 「처리」)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`network-devices`의 앞 개념 여섯(step 9~11)**, 특히 `device-layers`(부하 분산 장치 항목)·`proxy-server`(역방향 프록시)·`load-balancing`(가상 주소·상태 확인)·`balancing-methods`. `ip-address-types.nat`(NAT — 뜻을 맞춘다)
- `src/data/network/questions.json`, `src/data/network/visuals/network-devices.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `NatTranslationDiagram`·`NaptPortsDiagram`(바뀌는 주소와 포트), `LoadBalancerPoolDiagram`·`ProxyDirectionDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2025-08-24 #50], [기출 2026-08-02 #46], [기출 2025-11-02 #48], [기출 2026-02-01 #6], [기출 2026-02-01 #49] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `network-devices` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `network-devices.l4-switch` | L4 스위치 | `network-devices.load-balancing` | 첫 문장에서 이것이 무엇인지 — IP 주소와 TCP·UDP 포트 번호까지 보고 요청을 서버에 나눠 보내는 부하 분산 장치(step 12 결과대로) — 를 세우고, 「자격시험은 이 장치를 L4 스위치라 부른다」(step 12의 E 처리대로 — 표준에 없는 이름이라는 것을 밝힌다). 왜 「4」인지(전송 계층 — 앞 개념 `device-layers`의 계층과 뜻을 맞춘다). 기본 기능 — 분산 방식(앞 개념의 방식), 상태 확인, 가상 주소로 온 요청의 목적지 주소를 고른 서버의 주소로 바꾸고 응답의 출발지 주소를 가상 주소로 되돌리는 NAT(step 12의 LSNAT 차례대로 — `ip-address-types.nat`과 뜻을 맞춘다). 한 연결의 패킷은 같은 서버로 간다(step 12 결과대로). 네트워크 계층 장비인 라우터와 무엇이 다른지. 기출이 맞는 말로 두는 「HTTP 헤더까지」는 step 12의 처리대로만(E6 꼴이면 쓰지 않는다). **L4 스위치와 라우터**(4절). 예: 클라이언트가 `192.0.2.100`의 포트 `80`으로 보낸 요청을 L4 스위치가 `WEB01`(`192.0.2.11`)로 보내며 목적지 주소를 바꾸고, `WEB01`의 응답은 출발지 주소를 `192.0.2.100`으로 되돌려 클라이언트에 보낸다(「예시 값」 — 단계대로) |
| 8 | `network-devices.l7-switch` | L7 스위치 | `network-devices.load-balancing` | 첫 문장에서 이것이 무엇인지 — HTTP 요청의 URL·헤더 같은 응용 계층 내용까지 보고 서버를 고르는 부하 분산 장치(step 12 결과대로) — 를 세우고, 「자격시험은 이 장치를 L7 스위치라 부른다」(step 12의 E 처리대로). **URL**(웹 자원의 주소 — 한 줄), 요청 내용을 읽으려면 클라이언트와 먼저 연결을 맺고 요청을 받은 뒤 서버로 넘긴다는 것(역방향 프록시처럼 — step 12 결과대로, 앞 개념 `proxy-server`와 뜻을 맞춘다). 포트로 나누기·상태 확인 같은 L4 스위치의 일도 한다는 것(step 12 결과대로). 시험 쪽 표현(「L2·L3·L4 기능을 포괄한다」 등)은 step 12의 처리대로만. **L4 스위치와 L7 스위치**(4절 — 무엇까지 읽는가, 그래서 무엇으로 나눌 수 있는가). 예: `www.example.com/images/`로 시작하는 요청은 이미지 서버 `IMG01`로, 나머지는 `WEB01`로 보낸다(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n336`~`n338`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n336` | `l4-switch` | 예/아니요 「원리 이해」 — **아니요** 쪽으로 세운다. 예: L4 스위치 `LB05` 뒤에 웹 서버 `WEB05`·`WEB06`이 있다. 이 서비스를 쓰는 클라이언트는 `WEB05`와 `WEB06`의 주소를 저마다 알고, 그 가운데 하나를 골라 직접 접속하나요?(아니요 — 클라이언트는 가상 주소 하나로 접속하고 스위치가 서버를 골라 주소를 바꾼다, step 12 결과대로). 해설은 가상 주소와 NAT를 가르친다. **HTTP 헤더를 읽는지는 묻지 마라**(guide.md 「문항」 4항 — E 항목) |
| `n337` | `l4-switch` | 4지선다 「원리 이해」 — 본문과 다른 값의 장면(가상 주소 `198.51.100.50`의 포트 `443`으로 온 요청을 서버 `198.51.100.12`로 보낸다 등)을 주고, 스위치가 그 요청 패킷에서 무엇을 바꾸는지 고르게 한다. 정답은 목적지 IP 주소를 고른 서버의 주소로 바꾼다는 것(step 12의 LSNAT 차례대로), 오답은 흔한 혼동(출발지 주소를 스위치 주소로 바꾼다, 목적지 포트 번호를 서버마다 다른 번호로 바꾼다, HTTP 요청의 URL을 서버 주소로 바꾼다 등 — step 12 근거로 정말 틀렸는지 따진다). **정답 위치 2**. 기출 묶음(L4의 특징 넷·기능 넷, L1·L2·L3·L4 스위치)을 쓰지 않는다 |
| `n338` | `l7-switch` | 4지선다 「원리 이해」 또는 「상황 적용」 — 예: URL 경로에 따라 요청을 다른 서버 묶음으로 보내려면 장치가 먼저 무엇을 해야 하는지(클라이언트와 연결을 맺고 HTTP 요청을 받아 읽는다 — step 12 결과대로), 또는 본문과 다른 장면(`/api/`로 시작하는 요청만 다른 서버로)을 주고 그 일을 할 수 있는 장치를 고르게 한다. 오답은 같은 범주에서 흔한 혼동(포트 번호만 보는 장치, IP 주소만 보는 라우터 등). **정답 위치 3**. 기출 묶음(L7의 특징 넷)을 쓰지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 67·아니요 67, 정답 위치 51/51/51/51.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `l4-switch` — `L4SwitchNatDiagram`, JSON 키 `l4-switch-nat`

- 물음형 제목 예: `L4 스위치는 요청의 무엇을 바꿔 서버로 보낼까?`
- 그릴 것: 클라이언트 노드, L4 스위치 노드(가상 주소 `192.0.2.100` — 곁말이나 노드), `WEB01`(`192.0.2.11`)·`WEB02` 노드, 그리고 패킷 헤더를 「목적지: 192.0.2.100:80」·「목적지: 192.0.2.11:80」처럼 「칸 이름: 값」으로 적은 노드(스위치 앞과 뒤 — 다른 id·다른 자리). 응답 쪽은 「출발지: 192.0.2.11」·「출발지: 192.0.2.100」 노드.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `request` | 요청 | 클라이언트·스위치·`WEB01`과 요청 경로, 요청 헤더 노드 둘 | 가상 주소로 온 요청의 목적지 주소를 고른 서버의 주소로 바꾼다 |
  | `response` | 응답 | 같은 장치와 응답 경로(반대 방향), 응답 헤더 노드 둘 | 서버의 응답은 출발지 주소를 가상 주소로 되돌려 보낸다 |

- 요점 테스트: `request`에서 스위치 앞 헤더 노드와 뒤 헤더 노드의 목적지 값이 다르다. `response`의 보이는 경로는 `request`의 경로와 끝점이 뒤바뀐다(서버 → 스위치 → 클라이언트). 포트 번호는 두 헤더에서 같다(본문이 그렇게 쓸 때).

#### 3-2. `l7-switch` — `L7SwitchUrlDiagram`, JSON 키 `l7-switch-url`

- 물음형 제목 예: `L7 스위치는 무엇을 보고 서버를 고를까?`
- 그릴 것: 클라이언트 노드, L7 스위치 노드, `IMG01`·`WEB01` 노드, 요청 노드 둘(「/images/로 시작하는 URL」·「그 밖의 URL」 — 본문의 말대로, URL이 길면 조각 노드로).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `images` | 이미지 요청 | 클라이언트·스위치·`/images/` 요청·`IMG01`과 그 경로 | 요청의 URL을 읽어 이미지 서버로 보낸다 |
  | `others` | 그 밖의 요청 | 클라이언트·스위치·그 밖의 요청·`WEB01`과 그 경로 | 같은 주소·같은 포트로 왔어도 URL이 다르면 다른 서버로 간다 |

- 요점 테스트: 두 시나리오 모두 경로가 스위치를 지나고, 스위치에서 나가는 경로의 끝이 `images`는 `IMG01`, `others`는 `WEB01`이다. 두 시나리오의 선명한 요청 노드가 다르다.

위 도식 설계는 출발점이다. 본문(step 12 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 「자격시험은」으로만 쓴 사실은 도식에 그리지 않는다(이름표 「L4 스위치」·「L7 스위치」는 써도 된다).

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 338개, 마지막 id는 `n338`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 「L4 스위치」·「L7 스위치」가 표준 용어처럼 읽히지 않는가. 주소 바꾸기 차례를 칸마다 손으로 다시 따진다.
3. n337·n338의 보기 넷을 step 12의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/82-network-devices-wireless-security/index.json`의 step 13을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 9~10(PoE·PXE)을 만들지 마라.** 이유: step 14의 범위다.
- **부하 분산 장치의 제품별 기능·SSL 오프로드·세션 유지 구현을 쓰지 마라.** 이유: 기출이 묻지 않고 업체마다 다르다(ADR-059 「범위」).
- **step 9~11의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
