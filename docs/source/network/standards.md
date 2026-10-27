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
- 이 파일은 step 1(phase 69)에서 **강의 수정 이력이 쓰는 사실만** 담아 시작했고, step 2가 **면접 수정 이력(`I1`…)이 쓰는 사실**을 더했다.
  개념 본문용 사실은 각 주제 step이 필요할 때 더한다.

확인한 날: 2026-10-27.

---

## ITU-T X.200 (07/94) — OSI Basic Reference Model: The basic model
https://www.itu.int/rec/T-REC-X.200-199407-I/en

1994-07 승인, 현행 권고다. 본문은 ISO/IEC 7498-1:1994와 같다. 위 페이지에서 무료 PDF를 받아 읽었다.

- 응용 계층은 응용 프로세스가 OSI 환경에 닿는 유일한 수단이다 — §7.1.2.1
- 표현 계층은 응용 개체들이 주고받는 정보의 표현을 공통으로 맞춰, 표현 형식(구문)을 신경 쓰지 않게 한다 — §7.2.2.1, §7.2.2.2
- 세션 계층은 대화를 조직하고 동기를 맞추며 데이터 교환을 관리한다. 세션 연결을 맺고, 질서 있게 주고받게 하고, 질서 있게 닫는다 — §7.3.2.1
- 전송 서비스는 세션 개체들 사이의 투명한 데이터 전달을 제공해, 신뢰성 있고 비용 효율적인 전달이 어떻게 이뤄지는지를 위 계층이 신경 쓰지 않게 한다 — §7.4.2.1
- 네트워크 계층은 전송 개체들이 경로 선택과 중계를 신경 쓰지 않게 한다 — §7.5.2.1. 제공하는 기능의 첫째가 네트워크 주소다 — §7.5.3.1.6
- 데이터 링크 계층은 물리 계층에서 생길 수 있는 오류를 검출하고, **경우에 따라** 고친다 — §7.6.2.2
- 물리 계층은 데이터 링크 개체 사이의 비트 전송을 위해 물리 연결을 활성화·유지·해제하는 기계적·전기적·기능적·절차적 수단을 제공한다 — §7.7.2

쓰인 곳: 면접 수정 이력 I1, I9, I10

## IEEE 802.3 — Ethernet, 3.2.6 Length/Type field
https://www.ieee802.org/3/frame_study/0411/3d0_1.pdf

IEEE 802.3 표준 본문은 허용한 곳에서 무료로 열리지 않는다. 위 문서는 IEEE 802.3 작업 그룹이 올린 개정 초안(IEEE Draft P802.3 Frame Expansion D0.1,
2004-11-16)이고, 고치려는 IEEE Std 802.3 3.2.6의 본문을 그대로 싣고 있어 그 본문을 근거로 쓴다.

- 길이/타입 필드는 2옥텟이고 값에 따라 두 뜻 중 하나로 읽는다 — §3.2.6
- 값이 1500 이하면 **뒤따르는 데이터 필드에 든 MAC 클라이언트 데이터의 옥텟 수**를 뜻한다(길이로 읽기). 프레임 전체의 크기가 아니다 — §3.2.6 a)
- 값이 1536(0x0600) 이상이면 MAC 클라이언트 프로토콜이 무엇인지 나타낸다(타입으로 읽기). 두 읽기는 서로 배타적이다 — §3.2.6 b)
- 데이터가 최소 길이보다 짧으면 데이터 필드 끝과 FCS 사이에 패드를 붙인다 — §3.2.6

쓰인 곳: 강의 수정 이력 L1

## IEEE 802.3 — Ethernet, 3.2.9 Frame Check Sequence (FCS) field, 3.4 Invalid MAC frame
https://www.ieee802.org/3/as/public/0503/3d0_1_CMP.pdf

위 3.2.6 항목과 같은 사정이다. 이 문서는 IEEE 802.3 작업 그룹이 올린 IEEE Std 802.3-2005 개정 초안(IEEE P802.3as Draft 0.1, 2005-03)이고,
3장의 3.2.9와 3.4 본문을 싣고 있어 그 본문을 근거로 쓴다.

- FCS 필드는 4옥텟(32비트) CRC 값을 담는다. 프리앰블·SFD·FCS·확장 필드를 뺀 나머지(주소, 길이/타입, 데이터, 패드)로 계산한다 — §3.2.9
- 받은 프레임에서 FCS를 뺀 비트로 다시 계산한 CRC가 받은 FCS와 다르면 그 프레임은 잘못된 MAC 프레임이다(길이 불일치, 옥텟 단위가 아닌 길이도 잘못된 프레임의 조건이다) — §3.4
- 잘못된 MAC 프레임의 내용은 LLC나 MAC Control 부계층으로 넘기지 않는다. 다른 MAC 클라이언트는 무시하거나 버리거나 따로 쓸 수 있다(각주) — §3.4
- 오류를 고치는 절차는 3.2.9·3.4 어디에도 없다 — 검출하고 넘기지 않을 뿐이다 — §3.2.9, §3.4

쓰인 곳: 면접 수정 이력 I1

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
- 주소는 4옥텟(32비트) 고정 길이다. 그러니 이론상 개수는 2^32 = 4,294,967,296이다 — §2.3 「Addressing」
- 주소 클래스: A는 맨 앞 1비트가 0이고 다음 7비트가 네트워크, 나머지 24비트가 호스트 쪽이다. B는 맨 앞 2비트가 10, 다음 14비트가 네트워크, 나머지 16비트가 호스트 쪽이다.
  C는 맨 앞 3비트가 110, 다음 21비트가 네트워크, 나머지 8비트가 호스트 쪽이다 — §2.3 「Addressing」
- 단편화 오프셋 필드는 8옥텟(64비트) 단위로 센다. 첫 조각의 오프셋은 0이다 — §3.1 「Fragment Offset」
- TTL은 데이터그램을 처리하는 모든 모듈이 최소 1씩 줄인다 — §3.1 「Time to Live」

쓰인 곳: 강의 수정 이력 L3, L6, 면접 수정 이력 I8

## RFC 950 — Internet Standard Subnetting Procedure
https://www.rfc-editor.org/rfc/rfc950

인터넷 표준(STD 5)이다.

- 서브넷 마스크는 32비트 마스크이고, IP 네트워크 번호와 서브넷 번호에 해당하는 자리의 비트를 켠 비트 마스크다 — §2.2, Appendix I
- 예시의 마스크는 255.255.0.0, 255.255.252.0처럼 점으로 구분한 10진수로 적는다 — Appendix II
- 2진수는 주소의 비트 배치를 설명하는 그림(§2.1)과 예시의 서브넷 필드 값을 풀어 보일 때(Appendix II) 쓴다 — 마스크를 적는 형식으로 쓰지 않는다 — §2.1, Appendix II

쓰인 곳: 면접 수정 이력 I5

## RFC 4632 — Classless Inter-domain Routing (CIDR): The Internet Address Assignment and Aggregation Plan
https://www.rfc-editor.org/rfc/rfc4632

BCP 122다.

- 접두사는 IPv4 주소 뒤에 `/`와 0~32의 10진수(접두사 길이, 의미 있는 네트워크 비트 수)를 붙여 적는다. 예: 옛 B 클래스 172.16.0.0은 172.16.0.0/16이다 — §3.1
- /16의 마스크는 앞 16비트가 1이고 뒤 16비트가 0인 32비트 값이고, 점 10진수로는 255.255.0.0이다 — §3.1
- 마스크의 1은 왼쪽부터 끊김 없이 이어져야 한다 — §5.1

쓰인 곳: 면접 수정 이력 I5

## RFC 8200 — Internet Protocol, Version 6 (IPv6) Specification
https://www.rfc-editor.org/rfc/rfc8200

- IPv6는 주소 크기를 32비트에서 128비트로 늘렸다 — §1
- IPv6에서 단편화는 출발지 노드만 하고, 전달 경로의 라우터는 하지 않는다 — §4.5
- IPv4와 달리 IPv6 노드가 보내는 UDP 패킷은 기본적으로 체크섬을 생략할 수 없다. UDP를 터널 캡슐화에 쓰는 프로토콜만 특정 포트에서 0 체크섬을 쓸 수 있다 — §8.1

쓰인 곳: 강의 수정 이력 L4, L5, L10, 면접 수정 이력 I3, I8

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

- TCP의 신뢰성은 잃은 패킷을 순서 번호로, 오류를 세그먼트마다 붙는 체크섬으로 검출하고, 그것을 재전송으로 바로잡는 것이다 — §2.2
- 확인 응답 번호 필드는 (ACK 비트가 켜져 있을 때) 이 세그먼트를 보낸 쪽이 다음에 받기를 기대하는 순서 번호다 — §3.1
- 체크섬은 의사 헤더(IP 주소·프로토콜·TCP 길이)·TCP 헤더·데이터에 대해 계산한다. 보내는 쪽이 만들고 받는 쪽은 반드시 검사한다(MUST) — §3.1
- 세그먼트는 오류(체크섬 검사 실패)나 혼잡으로 사라질 수 있고, TCP는 재전송으로 모든 세그먼트가 전달되게 한다 — §3.8
- SACK(선택적 확인 응답) 옵션은 자주 쓰이지만 기본 상호 운용에 꼭 필요하지는 않은 선택 옵션이다 — §3.2.1
- 확인 응답은 누적이다. 순서 번호 X를 확인하면 X 바로 앞까지의 옥텟을 모두 받았다는 뜻이다 — §3.4
- 능동적으로 닫은 쪽은 TIME-WAIT 상태에서 2×MSL 동안 머문다 — §3.6.1
- MSS 옵션으로 알릴 값은 실효 MTU에서 고정된 IP 헤더와 TCP 헤더를 뺀 값이다 — §3.7.1
- 기대하는 순서 번호보다 뒤의 세그먼트(순서가 어긋나 먼저 온 세그먼트)는 버리지 말고 나중에 처리하도록 가지고 있어야 한다(SHOULD) — §3.10.7.4

쓰인 곳: 강의 수정 이력 L9, L12, L13, 면접 수정 이력 I2

## RFC 768 — User Datagram Protocol
https://www.rfc-editor.org/rfc/rfc768

- UDP는 트랜잭션 지향이고, 전달과 중복 방지를 보장하지 않는다 — Introduction
- 순서 있고 신뢰할 수 있는 데이터 스트림 전달이 필요한 응용은 TCP를 써야 한다 — Introduction
- 길이 필드는 헤더와 데이터를 합친 UDP 데이터그램의 옥텟 수다 — Fields
- 체크섬은 의사 헤더·UDP 헤더·데이터에 대한 16비트 1의 보수 합이다. 0으로 보내면 보낸 쪽이 체크섬을 만들지 않았다는 뜻이다 — Fields

쓰인 곳: 강의 수정 이력 L10, 면접 수정 이력 I3, I4, I10

## RFC 1122 — Requirements for Internet Hosts — Communication Layers
https://www.rfc-editor.org/rfc/rfc1122

- 인터넷 프로토콜 묶음은 응용·전송·인터넷·링크의 4계층이다. 응용 계층은 OSI의 위 두 계층(표현·응용)의 일을 합친 것이라 OSI 7계층과 일대일로 맞지 않는다 — §1.1.3
- 인터넷 계층: 인터넷의 전송 프로토콜은 모두 IP로 출발지 호스트에서 목적지 호스트까지 데이터를 나른다 — §1.1.3
- 전송 계층은 응용에 종단 간 통신 서비스를 준다. TCP는 신뢰성 있는 연결형 서비스, UDP는 비연결형 데이터그램 서비스다 — §1.1.3
- 호스트는 UDP 체크섬을 만들고 검사할 수 있어야 하고, 기본값은 체크섬을 켜는 것이다 — §4.1.3.4
- 0이 아닌 체크섬이 맞지 않는 UDP 데이터그램을 받으면 알리지 않고 버린다 — §4.1.3.4
- 호스트는 통신 서비스를 마지막에 받아 쓰는 쪽이고, OSI의 종단 시스템(End-System)에 해당한다 — §1.1.1
- 네트워크들은 「게이트웨이」 또는 「IP 라우터」라 부르는 패킷 교환 장비로 서로 이어진다 — §1.1.1
- 다른 호스트가 만든 데이터그램을 넘겨주는 호스트는 그때 게이트웨이(라우터) 노릇을 하는 것이다 — §3.1
- 제한 브로드캐스트 주소로 보낸 데이터그램은 이어진 그 물리 네트워크의 모든 호스트가 받는다. 멀티캐스트(D 클래스) 주소는 호스트 그룹 하나를 가리킨다 — §3.2.1.3

쓰인 곳: 강의 수정 이력 L10, 면접 수정 이력 I3, I9, I10, `network-basics.host`, `network-basics.network-equipment`, `network-basics.internet`, `network-basics.cast-types`

## RFC 8085 — UDP Usage Guidelines
https://www.rfc-editor.org/rfc/rfc8085

BCP 145다(RFC 5405를 대체).

- UDP를 쓰려는 응용에 권하는 대안은 TCP 같은 IETF 전송 프로토콜이다(SCTP, DCCP도 든다) — §3
- UDP로 대량 데이터를 보내는 응용은 TFRC나 TCP 같은 윈도 기반 혼잡 제어를 갖추거나, 그에 맞먹는 혼잡 제어로 TCP와 공정하게 나눠 쓰도록 해야 한다(SHOULD) — §3.1.2
- 이 지침 어디에도 UDP가 대량 전송에 TCP보다 맞는다는 말은 없다 — §3, §3.1.2

쓰인 곳: 면접 수정 이력 I4

## RFC 7766 — DNS Transport over TCP - Implementation Requirements
https://www.rfc-editor.org/rfc/rfc7766

- DNS 구현에서 TCP 지원은 필수다 — Abstract, §1
- TCP는 전체 영역 전송(AXFR)에 늘 쓰이고, 원래의 512바이트 한도를 넘는 메시지에도 자주 쓰인다 — §1
- 잘린 응답(TC 플래그)을 받으면 TCP로 다시 묻는다 — §4
- 범용 DNS 구현은 UDP와 TCP를 모두 지원해야 하고, TCP는 단지 재시도 수단이 아니라 UDP의 대안이다 — §5

쓰인 곳: 강의 수정 이력 L11

## RFC 1034 — Domain Names - Concepts and Facilities
https://www.rfc-editor.org/rfc/rfc1034

- 반복적(iterative) 질의에서는 질의를 받은 서버가 다른 서버를 알려 주고(referral), 그 서버에 다시 묻는 일은 묻는 쪽이 한다 — §4.3.1
- 재귀적(recursive) 질의는 네임 서버가 해 줄지 고를 수 있는 선택 기능이다. 묻는 쪽이 질의의 RD(recursion desired) 비트로 청하고, 서버는 RD로 청하지 않은 질의에 재귀를 하지 않는다 — §4.3.1
- 리졸버는 먼저 자기 정보(캐시 포함)에서 답을 찾고, 없으면 아는 네임 서버 가운데 가장 가까운 것부터 차례로 묻고, 받은 답은 캐시에 넣은 뒤 클라이언트에 돌려준다 — §5.3.3

쓰인 곳: 면접 수정 이력 I11

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

- 혼잡 윈도우(cwnd)는 TCP가 보낼 수 있는 데이터 양을 제한하는 상태 변수다. 수신 윈도우(rwnd)는 받는 쪽이 가장 최근에 알린 윈도우다.
  TCP는 확인된 가장 큰 순서 번호에 cwnd와 rwnd 가운데 작은 값을 더한 것보다 큰 순서 번호의 데이터를 보내면 안 된다(MUST NOT) — §2, §3.1
- 이 문서가 정하는 혼잡 제어 알고리즘은 느린 시작, 혼잡 회피, 빠른 재전송, 빠른 회복 넷이다 — §3
- 중복 ACK는 보낸 데이터가 아직 확인되지 않은 상태에서, 데이터 없이, 지금까지 받은 가장 큰 확인 응답 번호와 같은 번호로, 광고 윈도우도 같게 들어온 ACK다 — §2
- 혼잡 윈도우와 함께 쓰는 상태 변수의 이름은 느린 시작 임계치(ssthresh)다 — §3.1
- 느린 시작 동안에는 ACK 하나마다 cwnd를 최대 SMSS만큼 늘리고, 혼잡 회피 동안에는 RTT마다 대략 세그먼트 하나만큼 늘린다 — §3.1
- 재전송 타이머가 만료되면 ssthresh를 max(FlightSize/2, 2×SMSS) 이하로 정하고 cwnd를 세그먼트 하나(손실 윈도우)로 줄인다 — §3.1
- 중복 ACK **3개**를 받으면 잃어버린 것으로 보이는 세그먼트를 타이머 만료를 기다리지 않고 다시 보낸다(빠른 재전송) — §3.2
- 빠른 회복: 세 번째 중복 ACK에서 ssthresh를 위 식으로 정하고 cwnd를 ssthresh + 3×SMSS로 둔다. 중복 ACK가 더 올 때마다 cwnd를 SMSS만큼 늘린다.
  새 데이터를 확인하는 ACK가 오면 cwnd를 ssthresh로 줄이고 혼잡 회피로 이어 간다 — §3.2

쓰인 곳: 강의 수정 이력 L12, L14, 면접 수정 이력 I13

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

쓰인 곳: 강의 수정 이력 L17, L19, 면접 수정 이력 I15

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
- Connection 필드는 지금 연결에만 쓸 제어 옵션을 나열한다. 바로 다음 수신자에게만 뜻이 있는(hop-by-hop) 필드를 끝에서 끝까지 가는 필드와 가르는 데 쓴다 — §7.6.1
- 콘텐츠 코딩은 주로 표현을 압축하려고 쓴다. 이 문서가 정의하는 것은 compress, deflate, gzip이다 — §8.4.1(§8.4.1.1~§8.4.1.3)
- Last-Modified 응답 필드는 원 서버가 그 표현이 마지막으로 바뀌었다고 보는 날짜·시각을 알린다 — §8.8.2
- 필드 이름은 `ETag`다. 엔터티 태그는 같은 자원의 여러 표현을 가려내는 불투명한 검증자다 — §8.8.3
- 이 문서가 캐시 의미를 정의한 메서드는 GET, HEAD, POST다 — §9.2.3
- POST 응답은 명시적인 신선도 정보가 있고, POST 대상 URI와 같은 값의 Content-Location 필드가 있을 때만 캐시할 수 있다 — §9.3.3
- Retry-After 필드는 다음 요청을 보내기 전에 사용자 에이전트가 기다려야 할 시간을 알린다. 503과 함께 보내면 서비스를 쓸 수 없을 것으로 보는 기간을, 3xx와 함께 보내면 리다이렉트한 요청을 보내기 전 최소 대기 시간을 뜻한다 — §10.2.3
- 품질 값(q)은 0~1 사이로, 클수록 더 선호한다. 없으면 1이고 0은 받지 않겠다는 뜻이다 — §12.4.2
- Accept-Encoding의 `identity`는 「인코딩 없음」을 뜻한다 — §12.5.3
- If-None-Match는 요청을 받는 쪽에 그 엔터티 태그와 맞는 현재 표현이 없을 때만 메서드를 수행하게 하는 조건이다. 주로 조건부 GET으로 캐시한 정보를 효율적으로 갱신하는 데 쓴다 — §13.1.2
- If-Modified-Since는 GET·HEAD를 그 시각 뒤에 표현이 바뀌었는지에 따라 수행하게 하는 조건이다. 바뀌지 않았으면 표현 데이터를 다시 보내지 않는다 — §13.1.3
- 3xx는 요청을 끝내려면 사용자 에이전트가 더 할 일이 있다는 뜻이다. 그 가운데 하나가 Location 필드가 알려 주는 다른 URI로 가는 리다이렉트(301·302·307·308)이고,
  또 하나가 304처럼 **이전에 저장해 둔 결과로 보내는** 리다이렉트다. 그 밖에 여러 후보 가운데 고르게 하는 300, 다른 자원으로 간접 응답을 주는 303이 있다 — §15.4
- 301·308은 대상 자원에 새 영구 URI가 붙었다는 뜻이다. 302·307은 대상 자원이 잠시 다른 URI에 있다는 뜻이고, 307은 자동으로 따라갈 때 요청 메서드를 바꾸면 안 된다 — §15.4.2, §15.4.3, §15.4.8, §15.4.9
- 304는 조건부 GET/HEAD 요청의 조건이 거짓이라 200 대신 보낸 응답이다. 클라이언트에게 저장해 둔 표현을 200 응답의 내용처럼 쓰라고 보내는 것이다 — §15.4.5
- 4xx는 클라이언트가 잘못한 것으로 보이는 경우다. 서버는 오류 상황과 그것이 일시적인지 영구적인지를 설명하는 표현을 함께 보내는 것이 좋다(SHOULD) — §15.5
- 401은 대상 자원에 대한 유효한 인증 자격 증명이 없어 요청을 적용하지 않았다는 뜻이다 — §15.5.2
- 408(요청 시간 초과)은 서버가 기다린 시간 안에 완전한 요청을 받지 못했다는 뜻이고, 클라이언트는 같은 요청을 다시 보내도 된다(MAY) — §15.5.9
- 5xx는 서버가 스스로 잘못했거나 요청한 메서드를 수행할 능력이 없음을 아는 경우다 — §15.6
- 501(구현되지 않음)은 서버가 요청을 처리하는 데 필요한 기능을 지원하지 않는다는 뜻이다 — §15.6.2
- 503(서비스 이용 불가)은 일시적 과부하나 예정된 점검 때문에 지금은 요청을 처리할 수 없다는 뜻이다. Retry-After로 다시 시도할 때를 알릴 수 있다 — §15.6.4

쓰인 곳: 강의 수정 이력 L20, L21, L22, 면접 수정 이력 I6, I7, I12, I14, I15

## RFC 9111 — HTTP Caching
https://www.rfc-editor.org/rfc/rfc9111

- 캐시는 바로 쓸 수 없는(예: 신선하지 않은) 저장 응답을 조건부 요청으로 원 서버에 검증한다. 저장한 응답의 Last-Modified는 If-Modified-Since로, ETag의 엔터티 태그는 If-None-Match로 싣는다 — §4.3, §4.3.1
- 304 응답은 저장해 둔 응답을 갱신해 다시 써도 된다는 뜻이다. 캐시는 저장한 응답의 헤더 필드를 304에 실려 온 필드로 갱신한다 — §4.3.3, §4.3.4

쓰인 곳: 면접 수정 이력 I14

## RFC 6585 — Additional HTTP Status Codes
https://www.rfc-editor.org/rfc/rfc6585

- 429(요청이 너무 많음)는 사용자가 정해진 시간 안에 요청을 너무 많이 보냈다는 뜻이다(속도 제한). 새 요청을 보내기 전에 기다릴 시간을 Retry-After 헤더로 알릴 수 있다(MAY) — §4

쓰인 곳: 면접 수정 이력 I7

## MDN — Redirections in HTTP
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections

- 리다이렉션을 영구·임시·특수로 나누고, 304는 300과 함께 특수 리다이렉션으로 분류한다 — 「Special redirections」
- 임시 리다이렉션(302·307)은 점검이나 장애 중처럼 자원에 잠시 닿을 수 없을 때 쓴다 — 「Temporary redirections」
- 쓰임으로 도메인 별칭(다른 이름·흔한 오타·새 도메인을 한 사이트로 잇기, http를 https로 옮기기), 사이트를 다시 짠 뒤 옛 링크 살리기,
  안전하지 않은 요청과 오래 걸리는 요청에 대한 임시 응답(303)을 든다. URL을 줄이거나 간소화하는 쓰임은 없다 — 「Use cases」

쓰인 곳: 면접 수정 이력 I6, I12

## MDN — Connection
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Connection

- `keep-alive`를 보내면 연결을 닫지 않고 같은 서버에 대한 다음 요청에 그 연결을 쓴다 — 도입 문단, 「Directives」
- 기본값이 HTTP/1.0과 HTTP/1.1 사이에 바뀌었기 때문에, 브라우저는 호환을 위해 HTTP/1.1에서도 `Connection: keep-alive`를 명시해 보내곤 한다 — 도입 문단
- 연결을 닫는 `close`가 HTTP/1.0 요청의 기본이고, 연결을 열어 두는 것이 HTTP/1.1 요청의 기본이다 — 「Directives」
- Connection·Keep-Alive 같은 연결 전용 헤더 필드는 HTTP/2와 HTTP/3에서 쓰지 못한다 — 도입부의 경고 상자

쓰인 곳: 면접 수정 이력 I15

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

## RFC 919 — Broadcasting Internet Datagrams
https://www.rfc-editor.org/rfc/rfc919

인터넷 표준(STD 5)이다.

- IP 주소의 호스트 번호 자리에 정해 둔 값을 넣으면 특정 호스트가 아니라 브로드캐스트를 뜻한다 — §4
- 예를 들어 36.255.255.255는 「36번 네트워크의 모든 호스트」를 뜻한다 — §7

쓰인 곳: `network-basics.cast-types`

## RFC 1112 — Host Extensions for IP Multicasting
https://www.rfc-editor.org/rfc/rfc1112

인터넷 표준(STD 5)이다.

- IP 멀티캐스트는 IP 데이터그램을 「호스트 그룹」에 보내는 것이다. 호스트 그룹은 목적지 IP 주소 하나로 가리키는, 0개 이상의 호스트 묶음이다 — §2
- 그룹 구성원은 고정되지 않는다 — 호스트는 언제든 그룹에 들어가거나 나올 수 있다 — §2
- 멀티캐스트 데이터그램도 보통의 유니캐스트 데이터그램과 같은 최선형(best-effort) 신뢰성으로 전달된다 — §2

쓰인 곳: `network-basics.cast-types`

## RFC 1983 — Internet Users' Glossary
https://www.rfc-editor.org/rfc/rfc1983

FYI 18, 정보성(Informational) 문서다. 용어의 뜻을 확인하는 데만 쓴다.

- LAN(Local Area Network)은 몇 제곱킬로미터 이하의 좁은 지역을 맡도록 만든 데이터 네트워크다 — 「Local Area Network (LAN)」
- WAN(Wide Area Network)은 넓은 지리적 지역을 덮는 네트워크다 — 「Wide Area Network (WAN)」
- 유니캐스트는 호스트 하나만 자기 것으로 알아보는 주소다 — 「unicast」
- 브로드캐스트는 네트워크의 모든 노드가 받는 특별한 멀티캐스트이고, 멀티캐스트는 네트워크의 노드 여럿이 받을 수 있는 특별한 목적지 주소를 단 패킷이다 — 「broadcast」, 「multicast」
- 패킷은 네트워크로 보내는 데이터의 단위다 — 「packet」
- 노드는 컴퓨터 네트워크에 붙어 있는, 주소로 가리킬 수 있는 장치다 — 「node」
- 라우터는 네트워크와 네트워크 사이에서 트래픽을 넘겨주는 장치다 — 「router」

쓰인 곳: `network-basics.computer-network`, `network-basics.host`, `network-basics.internet`, `network-basics.cast-types`, `network-basics.lan-wan`, `network-basics.traffic`, `network-basics.packet-loss`

## RFC 3013 — Recommended Internet Service Provider Security Services and Procedures
https://www.rfc-editor.org/rfc/rfc3013

BCP 46이다. **이름 표기만** 가져온다.

- ISP는 Internet Service Provider의 줄임말이다 — 제목, Abstract

쓰인 곳: `network-basics.lan-wan`
