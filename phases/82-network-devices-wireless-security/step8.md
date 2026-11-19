# Step 8: devices-sources-a

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획과 결정은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
step 9~11이 `network-devices`의 앞 개념 6개(계층별 네트워크 장비, 리피터, 게이트웨이, 프록시 서버, 부하 분산, 부하 분산 방식)를 쓰기 전에,
**이 step은 그 개념들이 쓸 사실을 허용한 출처로 확인하고 출처 문서에 남긴다.** 데이터·코드는 고치지 않는다.

이 여섯 개념의 사실은 IETF RFC(용어집·중간 장치 분류·부하 분산 NAT·HTTP), IEEE 802.3(리피터), learn.microsoft.com(IIS 응용 프로그램 요청 라우팅(ARR)·Windows Server 네트워크 부하 분산)에서 가져온다(ADR-059).
`topic-map.md` 「출처 영역」의 메모대로, 이 주제는 IEEE 802와 IETF RFC로 댈 수 없는 사실을 이미 목록에 있는 learn.microsoft.com으로 채운다 — 새 출처를 더하지 않는다.
기출 23문항 가운데 이 step의 여섯 개념에 걸린 것은 15문항이다 — 리피터([기출 2025-08-24 #47]), 게이트웨이([기출 2024-02-25 #48]·[기출 2025-02-23 #48]·[기출 2025-11-02 #47]·[기출 2026-05-17 #47]), 프록시([기출 2024-02-25 #16] — 지문 누락),
부하 분산([기출 2024-02-25 #47]·[기출 2025-05-25 #47]·[기출 2024-11-03 #46]·[기출 2026-05-17 #49]), 부하 분산 방식([기출 2024-08-25 #49]·[기출 2025-05-25 #36]·[기출 2025-08-24 #45]·[기출 2026-02-01 #47]·[기출 2026-05-17 #41]).

## 읽어야 할 파일

- `phases/82-network-devices-wireless-security/guide.md` — 특히 「배경」, 「세 주제와 개념 29개」의 `network-devices` 표 1~6행, 「예시 값」, 「출처」
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/topic-map.md`의 「출처 영역」 끝 메모(`network-devices`) — 읽기만 한다
- `docs/source/network/standards.md` — 머리의 규칙과 이미 있는 항목: phase 72의 IEEE 802.3(허브·리피터 — 「새 설치에 권하지 않는다」 줄)·RFC 1812(라우터·브리지), phase 74의 NAT(RFC 3022)·디폴트 라우트, phase 79의 DNS 라운드 로빈, phase 81의 IIS·웹 응용 프로그램 프록시·역방향 프록시.
  **있는 사실을 다시 찾지 않는다** — 그 항목에 줄을 더한다
- `docs/source/network/exam-notes.md` — 형식과 마지막 번호(step 0·4가 더한 것 뒤부터), E7(「L2 스위치」라는 이름)
- `phases/82-network-devices-wireless-security/index.json`의 step 0·4 `summary`(이미 쓴 E 번호)
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `src/data/network/topics.json`의 `network-basics.network-equipment`, `protocols-encapsulation.osi-model`, `hub-switch-vlan.hub`·`switch`·`collision-domain`, `routing.routing`·`default-route`, `ip-address-types.nat`, `dns.dns-round-robin`, `windows-server-roles.web-application-proxy` — 이미 가르친 사실(뜻을 맞춘다)
- 기출: `docs/source/network/raw/exam/data.txt`에서 `X-devices`로 분류한 줄과 그 문항 — 위 15문항. 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

**판을 적는다** — RFC는 번호와 그것을 고친 RFC, IEEE는 표준 번호와 해·상태, learn.microsoft.com은 갱신 날짜와 적용 대상(IIS·ARR 판, Windows Server 판). 응답이 느리면 `curl -4`로 다시 받는다.
**한국어 이름**: 개념마다 학습자에게 보일 한국어 이름(리피터·브리지·게이트웨이·기본 게이트웨이·정방향 프록시·역방향 프록시·부하 분산·로드 밸런서·가상 주소·서버 풀·상태 확인·라운드 로빈·가중 라운드 로빈·최소 연결 등)을 정하고 고른 까닭(기출이 쓰는 이름, 앞 phase의 이름, ARR 한국어 판의 이름)을 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `device-layers` | 리피터·허브·브리지·스위치·라우터·게이트웨이가 각각 어느 계층에서 무엇을 보고 전달하는지(문서의 말), 위 계층 장비일수록 더 많은 헤더를 읽는다는 것(근거대로). **「L3 스위치」**(라우터 기능을 하는 스위치)라는 이름과 뜻이 허용한 출처에 있는지 — 없으면 E 항목(E7과 같은 꼴). 「L4 스위치」·「L7 스위치」는 step 12가 확인한다 | RFC 4949(bridge·router·gateway 항목), RFC 1983(인터넷 용어집 — bridge·router·gateway·repeater), RFC 1812 §2.2.3(phase 72 항목), RFC 3234 §1·§2(중간 장치), phase 72의 802.3 항목 |
| b | `repeater` | 리피터가 무엇인지(문서의 말 — 물리 계층, 신호를 받아 다시 내보내 거리를 늘린다), 신호를 다시 만드는지(재생·재타이밍) 키우기만 하는지(문서가 말하는 만큼), 리피터가 충돌 도메인을 나누지 않는다는 것(phase 72 항목에 있으면 그 줄), 허브와 리피터의 관계(phase 72 줄). **[기출 2025-08-24 #47]**의 정답(물리 계층)과 지문이 말하는 동작(단순 증폭·재생성 — 교사용 텍스트에서 확인)이 문서와 맞는지 | phase 72의 IEEE 802.3 항목, RFC 1983, RFC 4949 |
| c | `gateway` | **게이트웨이**의 정의(RFC 4949 — 기능은 비슷하나 구현이 다른 두 네트워크를 잇는다, 이론상 어느 계층에서도, 실제로는 어느 장비로 나타나는지), 옛 RFC가 라우터를 「게이트웨이」라 부르던 쓰임(RFC 1812 등 — 근거대로 한 줄), IP 설정의 **기본 게이트웨이**(phase 74 항목과 뜻을 맞춘다), 게이트웨이의 예(프로토콜 변환 — 문서가 드는 예). **[기출 2024-02-25 #48]**·**[기출 2025-11-02 #47]**(옳지 않은 것 — 정답 보기와, 시험이 맞는 말로 두는 셋을 교사용 텍스트에서 확인)과 **[기출 2025-02-23 #48]**·**[기출 2026-05-17 #47]**(정답 「프로토콜이 전혀 다른 네트워크 사이의 인터페이스」)이 문서와 맞는지. 시험이 맞는 말로 두는 보기에 「OSI 몇 계층」 같은 말이 있으면 그것이 RFC 4949의 「어느 계층에서도」와 어긋나는지 | RFC 4949(gateway), RFC 1983, RFC 1812, phase 74의 디폴트 라우트 항목 |
| d | `proxy-server` | **프록시**의 정의(RFC 9110 §3.7 — 클라이언트가 고른 중계자, 요청을 받아 다시 보낸다), **역방향 프록시**(RFC 9110이 「gateway」라고도 부르는 것 — 서버 쪽 중계자), 정방향 프록시라는 이름이 허용한 출처에 있는지(없으면 「프록시」와 「역방향 프록시」로 가른다), **캐시**(RFC 9111 — 한 줄), 프록시가 접근을 통제하거나 기록하는 쓰임(근거대로). **[기출 2024-02-25 #16]**은 지문이 빠졌다 — 정답 Proxy와 오답 DNS·DB·TTS만 보고, 판정할 수 있는 만큼만 | RFC 9110 §3.7, RFC 9111 §1, RFC 4949(proxy·proxy server), phase 81의 웹 응용 프로그램 프록시 항목 |
| e | `load-balancing` | **부하 분산**의 뜻(서버 여럿에 요청을 나눠 보낸다 — 문서의 말), **로드 밸런서**(장치·소프트웨어), 클라이언트가 접속하는 **가상 주소**(RFC 2391의 가상 서버 주소 등 — 이름은 문서대로), **서버 풀·서버 팜**(이름은 문서대로), **상태 확인**(서버가 응답하는지 확인해 응답하지 않는 서버에는 보내지 않는다 — ARR의 health test 등), 부하 분산으로 얻는 것(처리량·응답 시간·가용성 — 문서의 말이 있는 만큼). DNS 라운드 로빈과의 차이(phase 79 항목과 견준다 — 서버 상태를 보는가). **[기출 2024-02-25 #47]**·**[기출 2025-05-25 #47]**의 정답(처리량을 늘리고 응답 시간을 줄이는 최적화)과 **[기출 2024-11-03 #46]**·**[기출 2026-05-17 #49]**(지문)의 정답·특징이 문서와 맞는지 | RFC 2391 §1·§2·§3, RFC 3234 §2.8, RFC 7098 §1(용어), learn.microsoft.com의 IIS ARR 문서(서버 팜·부하 분산·상태 확인 — `iis/extensions/configuring-application-request-routing-arr/…`), Windows Server 네트워크 부하 분산(NLB) 문서(필요할 때만), ko-kr 판 |
| f | `balancing-methods` | 분산 방식마다 이름과 정의(문서의 말): **라운드 로빈**(차례대로, 부하를 보지 않는다 — RFC 2391 §5.1), **최소 연결**(RFC 2391의 Least Load first — 세션 수가 가장 적은 서버, ARR의 Least current request), **가중 라운드 로빈**·**가중 최소 연결**(가중치 — RFC 2391의 Least Weighted Load first·ARR의 Weighted round robin), **최소 응답 시간**(ARR의 Least response time·RFC 2391의 응답 시간), **해시**(ARR의 Server variable hash 등 — 같은 값이면 같은 서버로). 근거를 찾지 못한 방식은 그렇게 적는다(개념 step이 그 항목을 뺀다). 가중 라운드 로빈의 배분 예(가중치 3·1이면 3:1 — 문서가 비율로 말하는지). **[기출 2024-08-25 #49]**·**[기출 2026-02-01 #47]**·**[기출 2025-05-25 #36]**·**[기출 2025-08-24 #45]**·**[기출 2026-05-17 #41]**의 정답(라운드 로빈)과 지문이 말하는 동작(교사용 텍스트에서 확인)이 문서와 맞는지, 오답(하트비트·장애 조치 클러스터·부인 방지 등)은 이 개념에 쓰지 않는다 | RFC 2391 §5.1, learn.microsoft.com의 ARR 「Load balance algorithm」 설명(`iis/extensions/configuring-application-request-routing-arr/define-and-configure-an-application-request-routing-server-farm` 등), ko-kr 판 |

빠진 것을 읽다가 찾으면 더한다. **세션 유지(sticky)·SSL 오프로드의 구현, 전역 부하 분산(GSLB), 장애 조치 클러스터, Azure·AWS의 부하 분산 서비스 문서는 확인하지 않는다**(guide.md 「배경」 — learn.microsoft.com 가운데서도 IIS·Windows Server 문서만 쓴다).

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- step 0과 같은 형식이다: `## (phase 82 step 8) <출처 이름> — <문서 제목들>`, URL 한 줄씩, **판** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 제목`, 「쓰인 곳」.
  같은 문서의 기존 항목이 있으면(RFC 1812, phase 72의 802.3, phase 74의 NAT, phase 79의 DNS 라운드 로빈, phase 81의 IIS) 그 항목에 「(phase 82 step 8)」을 붙인 줄로 더한다.
- 항목은 출처별로 모은다(예: 「RFC 4949·1983 — 장비 용어(리피터·브리지·라우터·게이트웨이·프록시)」, 「RFC 9110·9111 — 프록시·역방향 프록시·캐시」, 「RFC 2391·3234·7098 — 부하 분산과 분산 방식」, 「Microsoft Learn — IIS ARR의 서버 팜·분산 방식·상태 확인」). 항목마다 **한국어 이름** 줄을 둔다.
- 「쓰인 곳」에는 **쓰일 개념 id**(`network-devices.gateway` 등)와 exam-notes 번호를 적는다.
- 머리의 「확인한 날」 문단들 끝에 「(phase 82 step 8)」 줄을 더한다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 step의 기출 15문항이 정답으로 보는 것(과 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 앞 step이 더한 번호 다음부터 `## E… — …`로 더한다(E7·E39·E40 형식).
공식 문서에 있으면 항목을 만들지 않는다. 앞 step의 「phase 82」 문단 뒤에 이 step이 본 문항 수와 더한 항목, 공식 문서와 맞는 문항들을 한 줄씩 짚는 문단을 더한다(확인한 날 포함).

미리 본 것 — 판정은 이 step이 출처를 읽고 한다:
- 「L3 스위치」라는 이름 — 허용한 출처에 없으면 E7과 같은 꼴의 E 항목.
- 게이트웨이 기출의 맞는 말로 두는 보기들 — 계층을 하나로 못 박는 말이 있으면 RFC 4949와 견준다.
- 부하 분산 방식 기출의 지문이 말하는 라운드 로빈의 동작이 RFC 2391의 정의와 같은지.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`network-devices`의 개념 1~6마다 한 줄씩: **무엇을 쓸 수 있는지(문서·판·절), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호), 한국어 이름**.
위 표의 a~f마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
특히 다음을 개념 step이 그대로 쓸 수 있게 적는다.
- 장비마다 계층과 보는 것, 「L3 스위치」의 처리.
- 리피터의 동작(재생·재타이밍 — 근거가 있는 만큼), 충돌 도메인, 802.3의 권고 줄.
- 게이트웨이의 정의와 계층에 따른 모습, 기본 게이트웨이와의 차이, 쓸 수 있는 예.
- 프록시·역방향 프록시·캐시의 정의, 정방향 프록시라는 이름을 쓸 수 있는지.
- 부하 분산·로드 밸런서·가상 주소·서버 풀·상태 확인의 정의와 이름, 얻는 것.
- 분산 방식마다 이름(영문·한국어)·정의·출처, 근거가 없는 방식, 가중치 배분의 근거.
- 기출 판정 줄: 리피터, 게이트웨이 넷, 프록시, 부하 분산 넷, 분산 방식 다섯.
끝에 「사용자 확인」 칸을 둔다 — 있으면 적고, 없으면 「없음」.

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다(내려받은 문서는 저장소 밖에 둔다).
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 판을 적었는지, 문장이 원문(RFC·learn.microsoft.com 영문·한국어 판)을 옮기지 않았는지 다시 본다.
4. `phases/82-network-devices-wireless-security/index.json`의 step 8을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 9~11이 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **허용 목록 밖의 문서(업체의 부하 분산 학습 페이지·제품 문서(cisco.com 포함 — VTP에만 허용)·위키백과·블로그·Q&A 사이트)를 근거로 쓰지 마라.** 이유: ADR-059. learn.microsoft.com 안에서도 Azure·AWS 서비스 문서는 쓰지 않는다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **기존 항목의 줄을 고치거나 지우지 마라.** 이유: 앞 phase의 개념이 그 줄을 근거로 쓴다.
- **L4·L7 스위치·PoE·PXE를 정리하지 마라.** 이유: step 12의 범위다.
- **`lecture-outline.md`·`interview-facts.md`·`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 이 step은 새 출처를 더하지 않는다.
