# 네트워크 과목 — 표준 문서에서 가져온 사실

네트워크 과목의 세 원본 가운데 **표준 문서**에서 가져온 사실을 문서마다 모은다(`docs/source/network/CLAUDE.md` 「원본 셋」).
강의·면접이 표준과 다르면 표준을 따르고, 그 기록은 `lecture-outline.md`·`interview-facts.md`의 「수정 이력」에 둔다.

규칙:

- **허용하는 곳만 쓴다** — `rfc-editor.org`·`datatracker.ietf.org`(RFC), `iana.org`(레지스트리), `ieee802.org`·`standards.ieee.org`(IEEE 802),
  `itu.int`(ITU-T X.200), `developer.mozilla.org`(MDN). 위키백과·블로그·업체 학습 페이지는 강의가 링크했어도 쓰지 않는다.
- **사실은 직접 쓴 말로 적는다**(ADR-009). 원문 문장을 옮기지 않는다.
- 항목마다 **절 번호**를 붙인다. MDN처럼 절 번호가 없는 문서는 절 제목을 적는다.
- RFC는 `https://www.rfc-editor.org/rfc/rfcNNNN` 꼴로 적고, 폐기된 RFC가 아니라 지금 유효한 것을 쓴다(예: HTTP는 RFC 2616·7230~7235가 아니라 RFC 9110·9111·9112).
  폐기된 RFC를 쓸 때는 역사 기록으로만 쓰고 그렇다고 밝힌다.
- 「쓰인 곳」에 강의 수정 이력 번호(`L1`…)나 면접 수정 이력 번호, 개념 id를 적는다. 뒤 step이 개념을 만들면 개념 id를 더한다.
- 이 파일은 step 1(phase 69)에서 **강의 수정 이력이 쓰는 사실만** 담아 시작했다. 개념 본문용 사실은 각 주제 step이 필요할 때 더한다.

확인한 날: 2026-10-27.

---

## IEEE 802.3 — Ethernet, 3.2.6 Length/Type field
https://www.ieee802.org/3/frame_study/0411/3d0_1.pdf

IEEE 802.3 표준 본문은 허용한 곳에서 무료로 열리지 않는다. 위 문서는 IEEE 802.3 작업 그룹이 올린 개정 초안(IEEE Draft P802.3 Frame Expansion D0.1,
2004-11-16)이고, 고치려는 IEEE Std 802.3 3.2.6의 본문을 그대로 싣고 있어 그 본문을 근거로 쓴다.

- 길이/타입 필드는 2옥텟이고 값에 따라 두 뜻 중 하나로 읽는다 — §3.2.6
- 값이 1500 이하면 **뒤따르는 데이터 필드에 든 MAC 클라이언트 데이터의 옥텟 수**를 뜻한다(길이로 읽기). 프레임 전체의 크기가 아니다 — §3.2.6 a)
- 값이 1536(0x0600) 이상이면 MAC 클라이언트 프로토콜이 무엇인지 나타낸다(타입으로 읽기). 두 읽기는 서로 배타적이다 — §3.2.6 b)
- 데이터가 최소 길이보다 짧으면 데이터 필드 끝과 FCS 사이에 패드를 붙인다 — §3.2.6

쓰인 곳: 강의 수정 이력 L1

## IEEE RA — Use of the IEEE Assigned EtherType
https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/ethertype.pdf

- 이더타입은 뒤따르는 데이터를 어떻게 해석할지 알려 준다(대개 프로토콜 식별). 길이/타입 필드는 IEEE Std 802.3 3.2.6에 정의돼 있다 — 「Tutorial」 첫 문단
- 필드 값이 1536(0x0600) 이상이면 타입으로 읽으므로 이더타입은 모두 0x0600~0xFFFF에 든다. 길이 읽기와 타입 읽기는 서로 배타적이다 — 「Tutorial」 둘째 문단
- 같은 자리의 필드를 표준 이전 이더넷은 타입 필드로, 초기 IEEE 802.3은 길이 필드로 불렀다 — 각주 1

쓰인 곳: 강의 수정 이력 L1

## IANA — IEEE 802 Numbers (EtherType 레지스트리)
https://www.iana.org/assignments/ieee-802-numbers/ieee-802-numbers.xhtml

- 0000~05DC(10진 0~1500) 구간은 IEEE 802.3 길이 필드로 표시돼 있다 — EtherType 표
- IPv4는 0800, ARP는 0806, IPv6는 86DD다 — EtherType 표

쓰인 곳: 강의 수정 이력 L1

## RFC 9542 — IANA Considerations and IETF Protocol and Documentation Usage for IEEE 802 Parameters
https://www.rfc-editor.org/rfc/rfc9542

- 2024년 기준 IEEE가 할당하는 MAC 주소 접두사는 길이가 셋이다 — MA-L 24비트, MA-M 28비트, MA-S 36비트. 접두사 뒤에 남는 비트를 받은 쪽이 채운다 — §2.1(Table 1)
- 첫 옥텟의 X 비트(Local 비트)가 0이면 IEEE가 할당한 접두사를 가진 쪽이 관리하는 전역 주소이고, 1이면 그 네트워크의 관리자가 정해 쓸 수 있는 주소다 — §2.1.1
- 이더타입은 부호 없는 정수로 0x0600 이상인 16비트 식별자다. 길이로 쓰는 값은 이더타입과 헷갈리지 않도록 0x5DD 미만이어야 한다 — §3
- 이 RFC는 그 필드를 짧게 「프레임 길이를 주는 필드」라고 부른다. 무엇의 길이인지는 IEEE 802.3 3.2.6이 정한다(위 항목) — §3

쓰인 곳: 강의 수정 이력 L1, L2

## IEEE RA — Guidelines for Use of EUI, OUI, and CID
https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf

- OUI와 CID는 24비트다. IEEE RA는 이와 별도로 36비트 OUI-36도 할당한다 — PDF 2쪽 「IEEE-Administered organizational identifiers: OUI and CID」
- EUI를 MAC 주소로 쓸 때 첫 옥텟의 가장 낮은 비트(I/G)는 개별/그룹을, 그다음 비트(U/L)는 전역 관리(0)/지역 관리(1)를 나타낸다.
  전역 관리 주소는 전 세계에서 하나뿐이도록 만든 주소다 — PDF 6쪽
- IEEE RA가 할당한 OUI·OUI-36으로 만든 주소는 U/L이 0이라 전역 관리 주소다 — PDF 6쪽

쓰인 곳: 강의 수정 이력 L2

## RFC 791 — Internet Protocol
https://www.rfc-editor.org/rfc/rfc791

- IP가 하는 기본 기능은 주소 지정과 단편화 둘이다 — §1.4
- 주소 클래스: A는 맨 앞 1비트가 0이고 다음 7비트가 네트워크, 나머지 24비트가 호스트 쪽이다. B는 맨 앞 2비트가 10, 다음 14비트가 네트워크, 나머지 16비트가 호스트 쪽이다.
  C는 맨 앞 3비트가 110, 다음 21비트가 네트워크, 나머지 8비트가 호스트 쪽이다 — §2.3 「Addressing」
- 단편화 오프셋 필드는 8옥텟(64비트) 단위로 센다. 첫 조각의 오프셋은 0이다 — §3.1 「Fragment Offset」
- TTL은 데이터그램을 처리하는 모든 모듈이 최소 1씩 줄인다 — §3.1 「Time to Live」

쓰인 곳: 강의 수정 이력 L3, L6

## RFC 8200 — Internet Protocol, Version 6 (IPv6) Specification
https://www.rfc-editor.org/rfc/rfc8200

- IPv6는 주소 크기를 32비트에서 128비트로 늘렸다 — §1
- IPv6에서 단편화는 출발지 노드만 하고, 전달 경로의 라우터는 하지 않는다 — §4.5
- IPv4와 달리 IPv6 노드가 보내는 UDP 패킷은 기본적으로 체크섬을 생략할 수 없다. UDP를 터널 캡슐화에 쓰는 프로토콜만 특정 포트에서 0 체크섬을 쓸 수 있다 — §8.1

쓰인 곳: 강의 수정 이력 L4, L5, L10

## RFC 3022 — Traditional IP Network Address Translator (Traditional NAT)
https://www.rfc-editor.org/rfc/rfc3022

- 기본 NAT(Basic NAT)는 사설 주소 묶음을 전역 주소 묶음에 대응시킨다 — §2.1
- NAPT는 (사설 주소, 사설 포트) 짝을 (등록된 주소, 할당한 포트) 짝에 대응시켜, 사설망의 여러 노드가 등록된 주소 **하나**로 바깥과 통신하게 한다 — §2.2, §3.1
- NAT는 IP 주소가 끝에서 끝까지 갖던 의미를 없앤다 — §1

쓰인 곳: 강의 수정 이력 L7

## RFC 1631 — The IP Network Address Translator (NAT) [폐기, RFC 3022로 대체 — 역사 기록으로만 쓴다]
https://www.rfc-editor.org/rfc/rfc1631

- NAT(주소 재사용)를 주소 고갈에 대한 **단기** 해법으로 제안했다. 장기 해법은 더 큰 주소를 쓰는 새 인터넷 프로토콜이라고 적었다 — Abstract, §1

쓰인 곳: 강의 수정 이력 L7

## RFC 1918 — Address Allocation for Private Internets
https://www.rfc-editor.org/rfc/rfc1918

- 사설 주소 공간은 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 셋이다 — §3
- 사설 주소는 전역에서 의미가 없으므로, 사설망의 라우팅 정보는 기업 사이 연결로 퍼뜨리지 않는다 — §3

쓰인 곳: 강의 수정 이력 L8

## RFC 9293 — Transmission Control Protocol (TCP)
https://www.rfc-editor.org/rfc/rfc9293

- 확인 응답 번호 필드는 (ACK 비트가 켜져 있을 때) 이 세그먼트를 보낸 쪽이 다음에 받기를 기대하는 순서 번호다 — §3.1
- SACK(선택적 확인 응답) 옵션은 자주 쓰이지만 기본 상호 운용에 꼭 필요하지는 않은 선택 옵션이다 — §3.2.1
- 확인 응답은 누적이다. 순서 번호 X를 확인하면 X 바로 앞까지의 옥텟을 모두 받았다는 뜻이다 — §3.4
- 능동적으로 닫은 쪽은 TIME-WAIT 상태에서 2×MSL 동안 머문다 — §3.6.1
- MSS 옵션으로 알릴 값은 실효 MTU에서 고정된 IP 헤더와 TCP 헤더를 뺀 값이다 — §3.7.1
- 기대하는 순서 번호보다 뒤의 세그먼트(순서가 어긋나 먼저 온 세그먼트)는 버리지 말고 나중에 처리하도록 가지고 있어야 한다(SHOULD) — §3.10.7.4

쓰인 곳: 강의 수정 이력 L9, L12, L13

## RFC 768 — User Datagram Protocol
https://www.rfc-editor.org/rfc/rfc768

- UDP는 트랜잭션 지향이고, 전달과 중복 방지를 보장하지 않는다 — Introduction
- 길이 필드는 헤더와 데이터를 합친 UDP 데이터그램의 옥텟 수다 — Fields
- 체크섬은 의사 헤더·UDP 헤더·데이터에 대한 16비트 1의 보수 합이다. 0으로 보내면 보낸 쪽이 체크섬을 만들지 않았다는 뜻이다 — Fields

쓰인 곳: 강의 수정 이력 L10

## RFC 1122 — Requirements for Internet Hosts — Communication Layers
https://www.rfc-editor.org/rfc/rfc1122

- 호스트는 UDP 체크섬을 만들고 검사할 수 있어야 하고, 기본값은 체크섬을 켜는 것이다 — §4.1.3.4
- 0이 아닌 체크섬이 맞지 않는 UDP 데이터그램을 받으면 알리지 않고 버린다 — §4.1.3.4

쓰인 곳: 강의 수정 이력 L10

## RFC 7766 — DNS Transport over TCP - Implementation Requirements
https://www.rfc-editor.org/rfc/rfc7766

- DNS 구현에서 TCP 지원은 필수다 — Abstract, §1
- TCP는 전체 영역 전송(AXFR)에 늘 쓰이고, 원래의 512바이트 한도를 넘는 메시지에도 자주 쓰인다 — §1
- 잘린 응답(TC 플래그)을 받으면 TCP로 다시 묻는다 — §4
- 범용 DNS 구현은 UDP와 TCP를 모두 지원해야 하고, TCP는 단지 재시도 수단이 아니라 UDP의 대안이다 — §5

쓰인 곳: 강의 수정 이력 L11

## RFC 1035 — Domain Names - Implementation and Specification
https://www.rfc-editor.org/rfc/rfc1035

- CNAME 레코드의 데이터는 소유자 이름의 정식(canonical) 이름이고, 소유자 이름이 별칭이다 — §3.3.1
- NS 레코드의 데이터(NSDNAME)는 그 도메인에 권한이 있는 **호스트의 도메인 이름**이다. 주소가 아니다 — §3.3.11
- SOA 레코드는 영역(zone)의 시작을 알리고 다음을 담는다 — 원래(주) 네임 서버 이름(MNAME), 영역 책임자의 메일 주소(RNAME), 영역 버전 번호(SERIAL),
  다시 가져오기 간격(REFRESH), 실패 뒤 재시도 간격(RETRY), 권한을 잃기까지의 최대 시간(EXPIRE), 레코드에 붙일 최소 TTL(MINIMUM) — §3.3.13
- DNS는 UDP 53번과 TCP 53번을 모두 쓴다. 일반 질의에는 UDP를 권하고, 영역 전송은 TCP로 한다 — §4.2.1, §4.2.2

쓰인 곳: 강의 수정 이력 L11, L15

## RFC 5681 — TCP Congestion Control
https://www.rfc-editor.org/rfc/rfc5681

- 중복 ACK는 보낸 데이터가 아직 확인되지 않은 상태에서, 데이터 없이, 지금까지 받은 가장 큰 확인 응답 번호와 같은 번호로, 광고 윈도우도 같게 들어온 ACK다 — §2
- 혼잡 윈도우와 함께 쓰는 상태 변수의 이름은 느린 시작 임계치(ssthresh)다 — §3.1
- 느린 시작 동안에는 ACK 하나마다 cwnd를 최대 SMSS만큼 늘리고, 혼잡 회피 동안에는 RTT마다 대략 세그먼트 하나만큼 늘린다 — §3.1
- 재전송 타이머가 만료되면 ssthresh를 max(FlightSize/2, 2×SMSS) 이하로 정하고 cwnd를 세그먼트 하나(손실 윈도우)로 줄인다 — §3.1
- 중복 ACK **3개**를 받으면 잃어버린 것으로 보이는 세그먼트를 타이머 만료를 기다리지 않고 다시 보낸다(빠른 재전송) — §3.2
- 빠른 회복: 세 번째 중복 ACK에서 ssthresh를 위 식으로 정하고 cwnd를 ssthresh + 3×SMSS로 둔다. 중복 ACK가 더 올 때마다 cwnd를 SMSS만큼 늘린다.
  새 데이터를 확인하는 ACK가 오면 cwnd를 ssthresh로 줄이고 혼잡 회피로 이어 간다 — §3.2

쓰인 곳: 강의 수정 이력 L12, L14

## RFC 2018 — TCP Selective Acknowledgment Options
https://www.rfc-editor.org/rfc/rfc2018

- 누적 확인 응답만 쓰면 보낸 쪽은 잃어버린 세그먼트마다 왕복 시간을 기다리거나, 이미 제대로 받은 세그먼트까지 다시 보내야 한다 — §1
- SACK을 쓰면 받는 쪽이 이미 받은 데이터 구간을 알려 주므로, 보낸 쪽은 실제로 빠진 세그먼트만 다시 보낼 수 있다 — §1, §3
- SACK은 연결 설정 때 SYN 세그먼트에 SACK-Permitted 옵션을 실어 켠다 — §1, §2

쓰인 곳: 강의 수정 이력 L13

## RFC 6068 — The 'mailto' URI Scheme
https://www.rfc-editor.org/rfc/rfc6068

- mailto URI의 문법은 `mailto:` 바로 뒤에 받는 주소가 온다. `//`가 없다 — §2
- 예: `mailto:chris@example.com` — §6.1

쓰인 곳: 강의 수정 이력 L16

## RFC 3986 — Uniform Resource Identifier (URI): Generic Syntax
https://www.rfc-editor.org/rfc/rfc3986

- URI는 위치(locator)로도, 이름(name)으로도, 둘 다로도 분류할 수 있다 — §1.1.3
- `mailto:John.Doe@example.com`이 URI 예시로 실려 있다 — §1.1.2
- authority 앞에는 `//`가 붙는다. authority가 있으면 경로는 비어 있거나 `/`로 시작한다 — §3, §3.2
- userinfo에 `사용자:비밀번호`를 넣는 형식은 쓰지 않도록 했다(deprecated) — §3.2.1
- 쿼리는 흔히 `key=value` 짝으로 식별 정보를 나르는 데 쓰인다 — 표준이 그 꼴을 강제하지는 않는다 — §3.4
- 프래그먼트는 `#`로 시작해 URI 끝까지다 — §3.5

쓰인 곳: 강의 수정 이력 L16

## MDN — What is a URL?
https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL

- `?` 뒤의 파라미터는 `&`로 구분한 키/값 짝의 목록이고, 파라미터를 어떻게 다룰지는 웹 서버마다 규칙이 다르다 — 「Parameters」
- `#` 뒤의 프래그먼트 식별자는 요청에 실려 서버로 가지 않는다 — 「Anchor」

쓰인 곳: 강의 수정 이력 L16

## RFC 9112 — HTTP/1.1
https://www.rfc-editor.org/rfc/rfc9112

- HTTP/1.1 메시지는 시작줄, 헤더 필드 줄들, 빈 줄, 선택적인 본문 순이다. 시작줄은 요청이면 요청줄(request-line), 응답이면 상태줄(status-line)이다 — §2.1
- 요청줄은 `메서드 SP 요청 대상 SP HTTP 버전`이다 — §3
- 상태줄은 `HTTP 버전 SP 상태 코드 SP [이유 문구]`다 — §4
- 필드 줄은 `필드 이름 ":" 선택 공백 필드 값 선택 공백`이다 — §5
- HTTP/1.1은 기본으로 지속 연결을 써서 한 연결에 여러 요청·응답을 싣는다. `close` 연결 옵션이 있으면 그 응답 뒤에 닫는다.
  HTTP/1.0은 `keep-alive` 연결 옵션이 있고 받는 쪽이 받아들일 때만 연결을 유지한다 — §9.3

쓰인 곳: 강의 수정 이력 L17, L19

## MDN — An overview of HTTP
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview

- HTTP는 상태가 없다(같은 연결의 두 요청 사이에 연결 고리가 없다). 쿠키를 쓰면 상태가 있는 세션을 만들 수 있다 — 「HTTP is stateless, but not sessionless」
- 연결은 전송 계층이 다루는 일이라 HTTP의 범위 밖이다. HTTP는 전송이 연결형이기를 요구하지 않고 신뢰할 수 있기만을 요구하며, 그래서 TCP 위에서 돈다 — 「HTTP and connections」
- HTTP/1.0의 기본 동작은 요청·응답 한 쌍마다 TCP 연결을 따로 여는 것이었고, HTTP/1.1이 지속 연결을 들여왔다. HTTP/2는 한 연결에 메시지를 다중화한다 — 「HTTP and connections」

쓰인 곳: 강의 수정 이력 L17

## MDN — Connection management in HTTP/1.x
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Connection_management_in_HTTP_1.x

- HTTP/1.0의 기본은 짧은 연결이다 — 요청마다 TCP 핸드셰이크를 새로 한다 — 「Short-lived connections」
- HTTP/1.1에서는 지속 연결이 기본이고, 짧은 연결은 `Connection: close`를 보낼 때만 쓴다 — 「Short-lived connections」, 「Persistent connections」

쓰인 곳: 강의 수정 이력 L17

## RFC 9113 — HTTP/2
https://www.rfc-editor.org/rfc/rfc9113

- 프로토콜 이름은 「HTTP version 2」, 줄여서 `HTTP/2`다. 필드 압축(HPACK)을 들이고 한 연결에서 여러 교환을 동시에 진행한다 — Abstract, §1, §4.3.1, §5

쓰인 곳: 강의 수정 이력 L18

## RFC 9114 — HTTP/3
https://www.rfc-editor.org/rfc/rfc9114

- 프로토콜 이름은 `HTTP/3`이고, HTTP의 의미를 QUIC 위에 옮긴 것이다 — Abstract
- 서버는 어떤 UDP 포트로든 HTTP/3를 제공할 수 있다 — §3.1

쓰인 곳: 강의 수정 이력 L18

## RFC 9110 — HTTP Semantics
https://www.rfc-editor.org/rfc/rfc9110

- 1xx, 204, 304 응답은 본문(content)을 담지 않는다 — §6.4.1
- 콘텐츠 코딩은 주로 표현을 압축하려고 쓴다. 이 문서가 정의하는 것은 compress, deflate, gzip이다 — §8.4.1(§8.4.1.1~§8.4.1.3)
- 이 문서가 캐시 의미를 정의한 메서드는 GET, HEAD, POST다 — §9.2.3
- POST 응답은 명시적인 신선도 정보가 있고, POST 대상 URI와 같은 값의 Content-Location 필드가 있을 때만 캐시할 수 있다 — §9.3.3
- 품질 값(q)은 0~1 사이로, 클수록 더 선호한다. 없으면 1이고 0은 받지 않겠다는 뜻이다 — §12.4.2
- Accept-Encoding의 `identity`는 「인코딩 없음」을 뜻한다 — §12.5.3
- 3xx는 요청을 끝내려면 사용자 에이전트가 더 할 일이 있다는 뜻이다. 그 가운데 하나가 Location 필드가 알려 주는 다른 URI로 가는 리다이렉트(301·302·307·308)이고,
  또 하나가 304처럼 **이전에 저장해 둔 결과로 보내는** 리다이렉트다 — §15.4
- 304는 조건부 GET/HEAD 요청의 조건이 거짓이라 200 대신 보낸 응답이다. 클라이언트에게 저장해 둔 표현을 200 응답의 내용처럼 쓰라고 보내는 것이다 — §15.4.5
- 401은 대상 자원에 대한 유효한 인증 자격 증명이 없어 요청을 적용하지 않았다는 뜻이다 — §15.5.2

쓰인 곳: 강의 수정 이력 L20, L21, L22

## RFC 6265 — HTTP State Management Mechanism
https://www.rfc-editor.org/rfc/rfc6265

- Set-Cookie·Cookie 헤더는 거의 상태가 없는 HTTP 위에서 상태 있는 세션을 유지하게 한다 — Abstract
- Domain 속성은 쿠키를 보낼 호스트를 정한다. `example.com`이면 `www.example.com` 같은 하위 도메인에도 보낸다. Domain이 없으면 원 서버에만 보낸다 — §4.1.2.3
- Secure 속성은 쿠키를 「안전한」 채널(대개 TLS 위의 HTTP)로만 보내게 한다 — §4.1.2.5
- 속성 이름은 `HttpOnly`다. 이 속성이 있으면 사용자 에이전트는 스크립트에 쿠키를 보여 주는 브라우저 API 같은 「HTTP가 아닌」 경로로는 그 쿠키를 내주지 않는다 — §4.1.2.6
- 속성 이름은 대소문자를 가리지 않고 비교한다(그래서 `HTTPOnly`라고 써도 받아들인다) — §5.2.6
- Domain 속성 값이 지금 요청한 호스트와 도메인이 맞지 않으면 사용자 에이전트는 그 쿠키를 통째로 버린다 — §5.3 6단계

쓰인 곳: 강의 수정 이력 L23, L24

## MDN — Set-Cookie
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie

- `HttpOnly`는 `Document.cookie` 같은 자바스크립트 경로로 쿠키를 읽지 못하게 한다. 그래도 자바스크립트가 보낸 요청(`fetch()` 등)에는 쿠키가 실린다.
  이것은 XSS 공격의 피해를 **줄인다** — 「HttpOnly」
- `Domain` 값은 쿠키를 보내는 서버의 도메인이거나 그 상위 도메인이어야 하고, 이 규칙을 어긴 쿠키는 무시된다. 도메인을 정하면 하위 도메인이 늘 포함된다 — 「Domain=<domain-value>」
- `Secure`는 `https:` 요청일 때만(localhost 제외) 쿠키를 보내게 한다 — 「Secure」

쓰인 곳: 강의 수정 이력 L23, L24
