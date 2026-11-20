# Step 15: security-sources

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획과 결정은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
step 16~19가 `network-security`의 개념 8개(방화벽, IDS와 IPS, WAF, NAC, VPN, 터널링, VPN 프로토콜, IPsec)를 쓰기 전에,
**이 step은 그 개념들이 쓸 사실을 허용한 출처로 확인하고 출처 문서에 남긴다.** 데이터·코드는 고치지 않는다.

이 주제의 사실은 NIST(SP 800-41r1·800-94·800-77r1·800-113), IETF RFC(RFC 4949, IPsec의 RFC 4301·4302·4303·7296, PPTP·L2TP의 RFC 2637·2661·3931·3193), IEEE 802.1X에서 가져온다(ADR-059).
기출 11문항이 모두 이 step의 개념에 걸린다 — 방화벽([기출 2026-08-02 #49]), WAF([기출 2025-05-25 #49]·[기출 2026-05-17 #48]), NAC([기출 2024-02-25 #20]·[기출 2025-02-23 #49]), VPN([기출 2026-05-17 #21]),
터널링([기출 2024-05-19 #22]·[기출 2026-02-01 #19]·[기출 2024-11-03 #24]), IPsec([기출 2025-11-02 #22]·[기출 2026-08-02 #24]).
개념이 8개라 한 step이 맡는다(출처 step 하나는 10개 이하 — guide.md 「배경」). 시간이 모자라면 IDS·IPS(기출이 오답으로만 쓴다)와 VPN 프로토콜(이름과 계층만)을 가볍게 확인한다.

## 읽어야 할 파일

- `phases/82-network-devices-wireless-security/guide.md` — 특히 「배경」, 「세 주제와 개념 29개」의 `network-security` 표, 「예시 값」, 「출처」
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과 이미 있는 항목: phase 74의 NAT·사설 주소(RFC 1918), phase 78의 TLS·HTTPS, phase 79의 netfilter, phase 81의 원격 액세스·VPN 터널링 프로토콜(Microsoft Learn)·요청 필터링, 이 phase step 8·12의 RFC 4949·9110 항목.
  **있는 사실을 다시 찾지 않는다** — 그 항목에 줄을 더한다
- `docs/source/network/exam-notes.md` — 형식과 마지막 번호(앞 step이 더한 것 뒤부터)
- `phases/82-network-devices-wireless-security/index.json`의 step 0·4·8·12 `summary`(이미 쓴 E 번호)
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `src/data/network/topics.json`의 `protocols-encapsulation.encapsulation`, `ip-address-types.private-address`·`nat`, `app-protocols-mgmt-security.tls`, `linux-servers.iptables`, `windows-server-roles.request-filtering`·`remote-access`·`web-application-proxy` — 이미 가르친 사실(뜻을 맞춘다)
- 기출: `docs/source/network/raw/exam/data.txt`에서 `X-security`로 분류한 줄과 그 문항 — 위 11문항. 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

**판을 적는다** — NIST는 문서 번호·판(Rev.)·해, RFC는 번호와 그것을 고친 RFC, IEEE는 표준 번호와 해·상태. NIST PDF는 `csrc.nist.gov`의 문서 페이지에서 받는다(`nvlpubs.nist.gov`의 같은 PDF 포함). 응답이 느리면 `curl -4`로 다시 받는다.
**한국어 이름**: 학습자에게 보일 이름(방화벽·패킷 필터링·상태 검사·응용 계층 방화벽·침입 탐지·침입 방지·시그니처 기반·이상 기반·웹 응용 프로그램 방화벽·네트워크 접근 제어·신청자·인증자·인증 서버·가상 사설망·사이트 간 VPN·원격 접속 VPN·터널·인증 헤더·캡슐화 보안 페이로드·전송 모드·터널 모드 등)을 정하고 고른 까닭을 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `firewall` | **방화벽**의 정의(네트워크 사이의 트래픽 흐름을 정책에 따라 통제한다 — 문서의 말), **규칙·정책**의 구성(주소·포트·프로토콜·허용과 거부), 규칙에 없는 트래픽을 막는 기본 정책(근거대로), 방식 — **패킷 필터링**·**상태 검사**(stateful inspection)·**응용 계층 방화벽**(application firewall·application-proxy gateway)의 정의, 방화벽이 할 수 없는 것(자기를 거치지 않는 트래픽, 허용한 통로로 오는 공격, 내부의 공격 — 문서가 말하는 만큼). **[기출 2026-08-02 #49]**의 정답 보기(정책과 규칙에 따라 허용·차단)와 틀린 말 셋(IP와 프로세스 번호만 본다, 내부 공격을 모두 막는다, 자기를 거치지 않는 트래픽도 제어한다)이 문서로 판정되는지 | NIST SP 800-41 Rev. 1 §2(방화벽 기술)·§3(네트워크 구조)·§4(정책), RFC 4949(firewall), phase 79의 netfilter 항목(대조) |
| b | `ids-ips` | **IDS**·**IPS**(IDPS)의 정의, 탐지 방법(시그니처 기반·이상 기반 — 상태 기반 프로토콜 분석은 이름만), IPS가 막는 방법(연결 끊기 등 — 한 줄), 두는 자리(인라인·트래픽 사본 — 근거대로), 방화벽과 무엇이 다른지(근거대로). WAF·NAC 기출의 오답이므로 무엇인지를 정확히 쓸 수 있을 만큼 | NIST SP 800-94 §2·§4(네트워크 기반 IDPS), RFC 4949(intrusion detection) |
| c | `waf` | **WAF**(웹 응용 프로그램 방화벽)의 정의와 하는 일(HTTP 트래픽을 살펴 웹 응용 프로그램을 노리는 공격을 막는다 — 문서의 말), 막는 공격의 예(SQL 삽입·크로스 사이트 스크립팅 — 문서가 드는 만큼), 일반 방화벽·IPS와 무엇이 다른지(근거대로). **[기출 2025-05-25 #49]**·**[기출 2026-05-17 #48]**(지문 — 정답 WAF, 오답 IDS·IPS·방화벽)의 지문이 말하는 특징이 문서와 맞는지 | NIST SP 800-41 Rev. 1의 「Web Application Firewalls」 절, SP 800-95(필요할 때만), RFC 4949 |
| d | `nac` | **NAC**(네트워크 접근 제어)의 정의(장치가 네트워크에 들어오기 전에 인증과 보안 상태를 확인해 허용·거부·제한 — 문서의 말), 정책을 지키지 않는 장치를 제한된 네트워크로 보내는 것(근거대로), **IEEE 802.1X**(포트 기반 네트워크 접근 제어 — 인증 전에는 포트가 인증 메시지만 통과시킨다)와 세 역할(supplicant·authenticator·authentication server — 이름과 하는 일), 인증 서버의 예 RADIUS(이름만 — 근거대로). **[기출 2024-02-25 #20]**(정답 NAC, 오답 NIC·방화벽·IPS)와 **[기출 2025-02-23 #49]**(지문 — 오답 NAT)의 지문이 말하는 특징이 문서와 맞는지 | NIST SP 800-41 Rev. 1의 NAC 절, `standards.ieee.org/ieee/802.1X/…`(802.1X-2020 개요), `ieee802.org/1/`의 802.1X 페이지와 공개 문서, RFC 3580(802.1X와 RADIUS — 필요할 때만) |
| e | `vpn` | **VPN**의 정의(공용 네트워크 위에 논리적으로 분리된 사설 네트워크 — 문서의 말), 꼴 — **사이트 간**(gateway-to-gateway)·**원격 접속**(host-to-gateway)(·host-to-host는 이름만)(SP 800-77r1의 이름), VPN이 주는 보호(기밀성·무결성·인증 — 문서의 말), 시험이 VPN의 구성 기술로 묶는 넷(터널링·인증·암호화·접근 제어)을 그렇게 묶는 문서가 있는지(없으면 E 항목 — 각각이 VPN에서 하는 일은 문서대로). **[기출 2026-05-17 #21]**(지문 — 정답 VPN, 오답 NAT·PPP·PPPoE)의 지문이 말하는 특징이 문서와 맞는지 | NIST SP 800-77 Rev. 1 §2·§3(VPN 모델), RFC 4949(VPN), RFC 4026(필요할 때만 — 용어) |
| f | `tunneling` | **터널링**·**터널**의 정의(한 프로토콜의 패킷을 다른 프로토콜의 패킷 안에 담아 보낸다 — 문서의 말), 바깥 헤더와 안쪽 패킷이 어떻게 놓이는지(터널 모드 IPsec·IP-in-IP 같은 문서의 예), 터널링 자체가 암호화를 뜻하지 않는다는 것(근거대로 — GRE·L2TP처럼 암호화가 없는 터널의 예가 문서에 있는지). **[기출 2024-05-19 #22]**·**[기출 2026-02-01 #19]**(정답 터널링, 오답 인증·암호화·접근 제어 — 지문이 말하는 특징)와 **[기출 2024-11-03 #24]**(지문 — 오답 접근 통제·방화벽 설정·FTP)가 문서와 맞는지 | RFC 4949(tunnel), RFC 2003(IP in IP — 필요할 때만), NIST SP 800-77r1, RFC 4301 §4.1(터널 모드) |
| g | `vpn-protocols` | **PPTP**(RFC 2637 — PPP를 GRE로 IP 위에 나르는 터널, 데이터 링크 계층의 프레임을 나른다는 것), **L2TP**(RFC 2661·3931 — PPP·2계층 프레임을 UDP 위로 나르는 터널, 그 자체로 암호화하지 않는다는 것, RFC 3193의 L2TP/IPsec), **SSL/TLS VPN**(SP 800-113 — TLS로 보호하는 VPN, 웹 브라우저로 쓰는 꼴), **PPP**(한 줄 — 근거대로), PPTP의 보안이 약하다는 지금의 권고(허용한 출처에 있는 만큼 — phase 81 step 4의 Microsoft Learn 줄에 「2028 제거」가 있으면 그것도). 프로토콜마다 터널을 만드는 계층 | RFC 2637 §1, RFC 2661 §1, RFC 3931 §1, RFC 3193 §1, NIST SP 800-113 §2·§3, phase 81 step 4 항목 |
| h | `ipsec` | **IPsec**의 정의(IP 계층에서 보안 서비스 — RFC 4301), **AH**(RFC 4302 — 무결성·출발지 인증, 기밀성 없음), **ESP**(RFC 4303 — 기밀성과 무결성), **전송 모드**·**터널 모드**(RFC 4301 §4.1 — 무엇을 보호하고 바깥 헤더가 붙는지, 주로 어디에 쓰는지), **IKE**(RFC 7296 — 키를 정하는 프로토콜, 한 줄), **SA**는 이름만(쓰는지 판정). **[기출 2025-11-02 #22]**·**[기출 2026-08-02 #24]**(지문 — 정답 IPsec, 오답 PPTP·L2TP·SSL/TLS)의 지문이 말하는 특징이 문서와 맞는지 | RFC 4301 §1·§3·§4.1, RFC 4302 §1, RFC 4303 §1·§3, RFC 7296 §1, NIST SP 800-77 Rev. 1 §3 |

빠진 것을 읽다가 찾으면 더한다. **IDS의 탐지 기법 세부, IPsec의 SA·SPD 구조·암호 알고리즘 목록·IKE 메시지 교환, PPTP·L2TP의 메시지 형식, 802.1X의 EAP 방식 전체·RADIUS 속성, 방화벽 제품의 기능은 확인하지 않는다**(guide.md 「배경」).

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- step 0과 같은 형식이다: `## (phase 82 step 15) <출처 이름> — <문서 제목들>`, URL 한 줄씩, **판** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 제목`, 「쓰인 곳」.
  같은 문서의 기존 항목이 있으면(step 8의 RFC 4949, phase 81의 원격 액세스 항목) 그 항목에 「(phase 82 step 15)」을 붙인 줄로 더한다.
- 항목은 출처별로 모은다(예: 「NIST SP 800-41r1 — 방화벽·WAF·NAC」, 「NIST SP 800-94 — IDPS」, 「NIST SP 800-77r1·800-113 — VPN」, 「RFC 4301·4302·4303·7296 — IPsec」, 「RFC 2637·2661·3931·3193 — PPTP·L2TP」, 「IEEE 802.1X」). 항목마다 **한국어 이름** 줄을 둔다.
- 「쓰인 곳」에는 **쓰일 개념 id**(`network-security.ipsec` 등)와 exam-notes 번호를 적는다.
- 머리의 「확인한 날」 문단들 끝에 「(phase 82 step 15)」 줄을 더한다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 step의 기출 11문항이 정답으로 보는 것(과 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 앞 step이 더한 번호 다음부터 `## E… — …`로 더한다.
앞 step의 「phase 82」 문단 뒤에 이 step이 본 문항 수와 더한 항목, 공식 문서와 맞는 문항들을 한 줄씩 짚는 문단을 더한다(확인한 날 포함).

미리 본 것 — 판정은 이 step이 출처를 읽고 한다:
- [기출 2026-08-02 #49]의 「IP와 프로세스 번호」 — 「프로세스 번호」라는 말이 문서에 없으면, 개념 step은 그 낱말을 쓰지 않고 방화벽이 보는 값(주소·포트·프로토콜·상태·내용)을 문서대로 쓴다.
- 터널링 기출이 「VPN의 구성 기술 넷」(터널링·인증·암호화·접근 제어)을 전제한다 — 그 묶음을 말하는 문서가 없으면 E 항목.
- WAF·NAC 지문이 말하는 특징이 문서의 정의와 같은지.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`network-security`의 개념 1~8마다 한 줄씩: **무엇을 쓸 수 있는지(문서·판·절), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호), 한국어 이름**.
위 표의 a~h마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
특히 다음을 개념 step이 그대로 쓸 수 있게 적는다.
- 방화벽의 정의·규칙·기본 정책·세 방식·할 수 없는 것.
- IDS·IPS의 정의·탐지 방법·두는 자리, 방화벽과의 차이.
- WAF의 정의·막는 공격의 예·네트워크 방화벽과의 차이.
- NAC의 정의·제한, 802.1X와 세 역할.
- VPN의 정의·꼴(이름)·주는 보호, 「구성 기술 넷」의 처리.
- 터널·터널링의 정의, 바깥 헤더와 안쪽 패킷의 차례, 터널링과 암호화.
- PPTP·L2TP·SSL/TLS VPN·PPP의 사실과 계층, PPTP 권고.
- IPsec·AH·ESP·전송 모드·터널 모드·IKE의 사실.
- 기출 판정 줄: 방화벽, WAF 둘, NAC 둘, VPN, 터널링 셋, IPsec 둘.
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
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 판을 적었는지, 문장이 원문(NIST·RFC의 정의 문장)을 옮기지 않았는지 다시 본다.
4. `phases/82-network-devices-wireless-security/index.json`의 step 15를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 16~19가 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **허용 목록 밖의 문서(보안 업체의 학습 페이지·제품 문서, OWASP(목록에 없다), 위키백과·블로그·Q&A 사이트)를 근거로 쓰지 마라.** 이유: ADR-059. 꼭 필요하면 summary의 「사용자 확인」에 적는다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **기존 항목의 줄을 고치거나 지우지 마라.** 이유: 앞 phase와 앞 step의 개념이 그 줄을 근거로 쓴다.
- **`lecture-outline.md`·`interview-facts.md`·`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 이 step은 새 출처를 더하지 않는다.
