# 네트워크 과목 — 표준 문서와 공식 문서에서 가져온 사실

네트워크 과목의 세 원본 가운데 **표준·공식 문서**에서 가져온 사실과 URL을 문서마다 모은다(`docs/source/network/CLAUDE.md` 「원본 셋」).
공식 문서는 그 기술을 정한 표준 기구나 만든 곳의 문서이고, 강의 밖 주제의 사실은 여기에만 근거한다(ADR-059).
강의·면접이 표준과 다르면 표준을 따르고, 그 기록은 `lecture-outline.md`·`interview-facts.md`의 「수정 이력」에 둔다.

규칙:

- **허용하는 곳만 쓴다** — 목록은 `docs/source/network/CLAUDE.md` 「허용하는 출처」에 있다(ADR-059). 표준(RFC·IANA·IEEE 802·ITU-T 권고 전체·MDN)과,
  man7.org·learn.microsoft.com처럼 그 기술을 만든 곳의 공식 문서다. 목록에 없는 곳은 그 목록에 먼저 더하고 쓴다.
  위키백과·블로그·자격증 교재·업체 학습 페이지는 강의가 링크했어도 쓰지 않는다.
- **사실은 직접 쓴 말로 적는다**(ADR-009). 원문 문장을 옮기지 않는다.
- 항목마다 **절 번호**를 붙인다. MDN처럼 절 번호가 없는 문서는 절 제목을 적는다.
- 제품 버전마다 달라지는 공식 문서(Windows Server의 판, Linux의 배포판·init 체계)는 어느 판을 기준으로 읽었는지 항목에 적는다(ADR-059 「트레이드오프」).
- RFC는 `https://www.rfc-editor.org/rfc/rfcNNNN` 꼴로 적고, 폐기된 RFC가 아니라 지금 유효한 것을 쓴다(예: HTTP는 RFC 2616·7230~7235가 아니라 RFC 9110·9111·9112).
  폐기된 RFC를 쓸 때는 역사 기록으로만 쓰고 그렇다고 밝힌다.
- 「쓰인 곳」에 강의 수정 이력 번호(`L1`…)나 면접 수정 이력 번호, 개념 id를 적는다. 뒤 step이 개념을 만들면 개념 id를 더한다.
- 이 파일은 step 1(phase 69)에서 **강의 수정 이력이 쓰는 사실만** 담아 시작했고, step 2가 **면접 수정 이력(`I1`…)이 쓰는 사실**을 더했다.
  개념 본문용 사실은 각 주제 step이 필요할 때 더한다.
- 자격시험의 답이 표준·공식 문서와 다르거나 거기 없는 곳(시험이 옛 방식을 묻는 곳 포함)은 여기가 아니라 `exam-notes.md`에 둔다(ADR-057·ADR-059).

확인한 날: 2026-10-27. 「(2026-10-28)」이 붙은 줄과 항목은 phase 70에서 1장의 빠진 사실 넷(ADR-057)을 넣으며 더했다.
「(phase 71)」이 붙은 줄과 항목은 phase 71 step 5에서 1장이 풀이 없이 쓰던 낱말(광케이블·작업 관리자·ping 명령·IP 주소 등)을 풀며 더했다(확인한 날 2026-10-28).
「(phase 72)」가 붙은 줄과 항목은 phase 72 step 0에서 `ethernet` 주제(이더넷 규격 이름·속도별 이더넷·NIC·MAC 주소·프레임·FCS)가 쓸 사실을 확인하며 더했다(확인한 날 2026-10-28).
IEEE 802.3 본문은 무료로 열리지 않으므로, 802.3 작업 그룹이 `ieee802.org`에 올린 개정 초안·발표 자료·지침과 `standards.ieee.org`의 표준 소개 페이지를 근거로 썼다. 항목마다 어떤 문서인지 적는다.
「(phase 72 step 1)」이 붙은 줄과 항목은 phase 72 step 1에서 `hub-switch-vlan` 주제(허브·반이중과 전이중·충돌 도메인·CSMA/CD·스위치·MAC 주소 테이블·플러딩·STP·브로드캐스트 도메인·VLAN·VLAN 태그·트렁크·VTP)가
쓸 사실을 확인하며 더했다(확인한 날 2026-10-28). IEEE 802.1(브리지·VLAN) 본문도 무료로 열리지 않아, 802.1 작업 그룹 자료와 802.1을 풀이한 RFC·NIST 문서를 근거로 썼다.
Cisco 제품 문서는 VTP에만 쓴다(`docs/source/network/CLAUDE.md` 「허용하는 출처」).
「(phase 72 step 2)」가 붙은 항목은 phase 72 step 2에서 `ethernet.ethernet`이 이더넷 표준을 누가 만드는지 쓰려고 더했다(확인한 날 2026-10-28).
「(phase 72 step 3)」이 붙은 줄은 phase 72 step 3에서 문항 n030의 해설이 MAC의 풀네임을 쓰려고 더했다(확인한 날 2026-10-28).
「(phase 72 step 5)」가 붙은 줄은 phase 72 step 5에서 `ethernet.ethertype-length`·`ethernet.fcs`를 쓰며 원문을 다시 열어 확인하고 더했다(확인한 날 2026-10-28).

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
- 제목의 OSI는 Open Systems Interconnection이다(「Information technology – Open Systems Interconnection – Basic Reference Model」). 일곱 계층의 영문 이름은
  Application Layer, Presentation Layer, Session Layer, Transport Layer, Network Layer, Data Link Layer, Physical Layer다 — 제목, §7.1~§7.7 제목
- (N)-프로토콜 데이터 단위(PDU, protocol-data-unit)는 (N)-프로토콜이 정하는 데이터 단위로, (N)-프로토콜 제어 정보에 (N)-사용자 데이터가 더해질 수 있다 — §5.6.1.3
- (N)-프로토콜 제어 정보는 같은 계층의 개체들이 함께 일하도록 서로 주고받는 정보이고, (N)-사용자 데이터는 그 계층이 위 계층을 대신해 나르는 데이터다 — §5.6.1.1, §5.6.1.2
- 위 계층의 (N)-PDU는 아래 계층으로 넘어가 (N–1)-서비스 데이터 단위가 되고, 그것이 (N–1)-PDU의 사용자 데이터 자리에 (N–1)-프로토콜 제어 정보와 함께 담긴다.
  제어 정보와 사용자 데이터의 위치 관계(앞·뒤)는 이 그림이 정하지 않는다 — §5.6.2.1, Figure 8, Figure 9 및 NOTE 2·3
- (2026-10-28) (N)-프로토콜은 (N)-개체들이 (N)-기능을 할 때 어떻게 통신할지를 정하는 규칙과 형식의 묶음이고, 그 규칙과 형식은 의미적(semantic)·구문적(syntactic)이다.
  시간·타이밍은 이 정의에 없고, 「세 요소」로 묶는 말도 없다 — §5.2.1.9
- (2026-10-28) 연결형(connection-mode)은 연결 설정 → 데이터 전달 → 연결 해제의 세 단계를 거친다 — §5.3.3.2.1.
  연결은 이어 보내는 단위들을 논리적으로 묶으므로 순서를 지키는 일과 흐름 제어를 할 수 있게 한다 — §5.3.3.2.2 d)
- (2026-10-28) 비연결형(connectionless-mode)은 연결 없이 데이터 단위 하나를 보내고, 목적지 주소처럼 보내는 데 필요한 정보를 그 단위와 함께 한 번에 넘긴다 — §5.3.3.3.1, §5.3.3.3.2 b).
  단위마다 경로가 따로 정해질 수 있고(may) — §5.3.3.3.3 a), 기본 비연결형 서비스는 순서를 지키지 않아도 된다 — §5.3.3.3.6 a)
- (2026-10-28) 「virtual circuit」「datagram」「message switching」이라는 말은 이 권고에 없다 — 전문 검색
- (2026-10-28) 표현 계층의 기능 하나는 추상 구문을 전송 구문으로 나타내는 것이고, 형식 변환과 특수 목적 변환을 포함한다. 그 예로 데이터 압축을 든다 — §7.2.4 b)
- (2026-10-28) 암호화(encryption·encipherment)라는 말은 이 권고에 없다. 보안 구조는 X.800(ISO 7498-2)에 맡긴다 — §5.1.3 NOTE, 전문 검색

쓰인 곳: 면접 수정 이력 I1, I9, I10, `protocols-encapsulation.reference-model`, `protocols-encapsulation.osi-model`, `protocols-encapsulation.encapsulation`, `protocols-encapsulation.decapsulation`, `protocols-encapsulation.pdu-names`,
`protocols-encapsulation.protocol`, `protocols-encapsulation.packet-switching`, `exam-notes.md` E1·E3, (phase 72 step 5) `ethernet.fcs`(데이터 링크 계층의 프로토콜 가운데 오류를 고치는 것도 있다, §7.6.2.2)

## IEEE 802.3 — Ethernet, 3.2.6 Length/Type field
https://www.ieee802.org/3/frame_study/0411/3d0_1.pdf

IEEE 802.3 표준 본문은 허용한 곳에서 무료로 열리지 않는다. 위 문서는 IEEE 802.3 작업 그룹이 올린 개정 초안(IEEE Draft P802.3 Frame Expansion D0.1,
2004-11-16)이고, 고치려는 IEEE Std 802.3 3.2.6의 본문을 그대로 싣고 있어 그 본문을 근거로 쓴다.

- 길이/타입 필드는 2옥텟이고 값에 따라 두 뜻 중 하나로 읽는다 — §3.2.6
- 값이 1500 이하면 **뒤따르는 데이터 필드에 든 MAC 클라이언트 데이터의 옥텟 수**를 뜻한다(길이로 읽기). 프레임 전체의 크기가 아니다 — §3.2.6 a)
- 값이 1536(0x0600) 이상이면 MAC 클라이언트 프로토콜이 무엇인지 나타낸다(타입으로 읽기). 두 읽기는 서로 배타적이다 — §3.2.6 b)
- 데이터가 최소 길이보다 짧으면 데이터 필드 끝과 FCS 사이에 패드를 붙인다 — §3.2.6

- (phase 72 step 5) 3.2.6 본문을 P802.3as D0.1(아래 항목의 문서)에서 다시 읽었다. 길이로 읽을 때 세는 것은 데이터 필드에 든 **MAC 클라이언트 데이터**의 옥텟이고, 패드는 해석과 상관없이 데이터 필드 끝과 FCS 사이에
  따로 덧붙는 옥텟이다. 그러니 패드는 이 길이에 들지 않는다(RFC 894도 채운 옥텟은 IP 패킷의 일부가 아니라고 쓴다) — §3.2.6 a), §3.2.6 둘째 문단
- (phase 72 step 5) 필드 값을 수로 따질 때 첫 옥텟이 높은 자리다. 1500과 1536 사이의 값(1501~1535)에 대한 읽기는 이 절에 없다 — §3.2.6

쓰인 곳: 강의 수정 이력 L1, `ethernet.frame`(길이/타입의 역할·패드 위치), `ethernet.ethertype-length`(두 읽기, 1500 이하는 데이터의 옥텟 수이고 프레임 전체 크기가 아니다, 1536 이상은 이더타입, 두 읽기가 겹치지 않는다, 패드는 길이에 넣지 않는다)

## IEEE 802.3 — Ethernet, 3.2.9 Frame Check Sequence (FCS) field, 3.4 Invalid MAC frame (phase 72: 3.1.1, 3.2.1~3.2.8, 3.3)
https://www.ieee802.org/3/as/public/0503/3d0_1_CMP.pdf

위 3.2.6 항목과 같은 사정이다. 이 문서는 IEEE 802.3 작업 그룹이 올린 IEEE Std 802.3-2005 개정 초안(IEEE P802.3as Draft 0.1, 2005-03)이고,
3장의 3.2.9와 3.4 본문을 싣고 있어 그 본문을 근거로 쓴다. (phase 72) 같은 문서가 3장의 나머지(3.1~3.3) 본문도 싣고 있어 함께 근거로 쓴다.

- FCS 필드는 4옥텟(32비트) CRC 값을 담는다. 프리앰블·SFD·FCS·확장 필드를 뺀 나머지(주소, 길이/타입, 데이터, 패드)로 계산한다 — §3.2.9
- 받은 프레임에서 FCS를 뺀 비트로 다시 계산한 CRC가 받은 FCS와 다르면 그 프레임은 잘못된 MAC 프레임이다(길이 불일치, 옥텟 단위가 아닌 길이도 잘못된 프레임의 조건이다) — §3.4
- 잘못된 MAC 프레임의 내용은 LLC나 MAC Control 부계층으로 넘기지 않는다. 다른 MAC 클라이언트는 무시하거나 버리거나 따로 쓸 수 있다(각주) — §3.4
- 오류를 고치는 절차는 3.2.9·3.4 어디에도 없다 — 검출하고 넘기지 않을 뿐이다 — §3.2.9, §3.4
- (phase 72) 이 판(802.3-2005)의 3.1.1은 프리앰블과 SFD까지 넣어 프레임의 필드를 아홉으로 센다. 그러나 같은 절이 최소·최대 프레임 크기는 **목적지 주소부터 FCS까지**만 센다고 하고,
  4.1.2.1.1은 프리앰블과 SFD를 프레임 **앞에 붙인다**고 쓴다(아래 4장 항목). 지금의 802.3 작업 그룹 용어는 아래 「editorial guidelines」 항목이다 — §3.1.1
- (phase 72) 그림 3–1의 필드와 크기: 프리앰블 7옥텟, SFD 1옥텟, 목적지 주소 6옥텟, 출발지 주소 6옥텟, 길이/타입 2옥텟, MAC 클라이언트 데이터와 패드를 합쳐 46~1500옥텟, FCS 4옥텟.
  프레임의 옥텟은 그림의 위에서 아래 순서로 보낸다 — §3.1.1, Figure 3–1
- (phase 72) 프리앰블 필드는 7옥텟이고, 받는 쪽 물리 계층 회로가 들어오는 프레임의 박자에 맞춰 안정된 동기 상태에 이르게 하는 데 쓴다 — §3.2.1
- (phase 72) SFD는 비트열 10101011이고, 프리앰블 바로 뒤에 와서 프레임이 시작됨을 알린다 — §3.2.2
- (phase 72) 주소 필드는 목적지 주소, 출발지 주소 순서로 둘이고 각각 48비트다. 목적지 주소의 첫 비트(가장 낮은 비트, I/G)가 0이면 개별 주소, 1이면 그룹 주소다.
  출발지 주소에서는 이 비트를 0으로 둔다. 둘째 비트(U/L)는 0이면 전역 관리 주소, 1이면 지역 관리 주소다. 주소의 각 옥텟은 가장 낮은 비트부터 보낸다 — §3.2.3 a)~d)
- (phase 72) MAC 주소는 개별 주소(스테이션 하나)와 그룹 주소(여럿)로 나뉘고, 그룹 주소는 다시 멀티캐스트 그룹 주소와 브로드캐스트 주소로 나뉜다.
  목적지 주소 필드의 비트가 모두 1이면 브로드캐스트 주소이고, 그 매체에 연결된 모든 스테이션을 가리킨다. 모든 스테이션은 브로드캐스트 주소를 알아봐야 한다.
  브로드캐스트 주소는 U/L 비트도 1이다 — §3.2.3 c), §3.2.3.1
- (phase 72) 목적지 주소는 개별 주소나 멀티캐스트(브로드캐스트 포함) 주소일 수 있고, 출발지 주소는 프레임을 보낸 스테이션을 가리킨다 — §3.2.4, §3.2.5
- (phase 72) 데이터 필드가 정해진 최소 길이보다 짧으면 옥텟 단위의 패드를 데이터 뒤에 붙여 늘린 다음 FCS를 계산해 붙인다 — §3.2.7, §3.2.8
- (phase 72) FCS를 뺀 프레임의 각 옥텟은 낮은 비트부터 보낸다 — §3.3

- (phase 72 step 5) 3.2.9와 3.4의 전문을 다시 읽었다(2026-10-28, 위 PDF). CRC는 cyclic redundancy check의 약어이고, 보내는 쪽과 받는 쪽의 알고리즘이 같은 CRC로 FCS 값을 만든다.
  CRC 값은 정해진 생성 다항식으로 프레임 비트에서 계산하는 수학적 절차로 정의된다(이 과목은 계산법을 가르치지 않는다) — §3.2.9
- (phase 72 step 5) 3.4가 잘못된 MAC 프레임에 대해 정하는 것은 둘뿐이다 — 그 내용을 LLC·MAC Control 부계층으로 넘기지 않는다는 것과, 잘못된 프레임이 생긴 사실을 네트워크 관리 쪽에 알릴 수 있다는 것.
  손상된 비트를 고치는 절차도, 보낸 쪽에 알리거나 다시 보내 달라고 요청하는 절차도 없다 — §3.4

쓰인 곳: 면접 수정 이력 I1, `protocols-encapsulation.osi-model`, (phase 72) 강의 수정 이력 L28·L29, `ethernet.nic`(브로드캐스트 주소는 그 LAN의 모든 장치를 가리킨다), `ethernet.frame`(필드 순서·크기·프리앰블·SFD·패드·FCS의 역할), `ethernet.mac-address`(48비트·두 구분 비트·브로드캐스트), `ethernet.fcs`(4옥텟 CRC 값, 프리앰블·SFD·FCS를 뺀 나머지로 계산, 다르면 잘못된 프레임으로 위로 넘기지 않음, 고치거나 다시 보내 달라고 하는 절차가 없음)

## IEEE RA — Use of the IEEE Assigned EtherType
https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/ethertype.pdf

- 이더타입은 뒤따르는 데이터를 어떻게 해석할지 알려 준다(대개 프로토콜 식별). 길이/타입 필드는 IEEE Std 802.3 3.2.6에 정의돼 있다 — 「Tutorial」 첫 문단
- 필드 값이 1536(0x0600) 이상이면 타입으로 읽으므로 이더타입은 모두 0x0600~0xFFFF에 든다. 길이 읽기와 타입 읽기는 서로 배타적이다 — 「Tutorial」 둘째 문단
- 같은 자리의 필드를 표준 이전 이더넷은 타입 필드로, 초기 IEEE 802.3은 길이 필드로 불렀다 — 각주 1
- (phase 72 step 5) 타입으로 읽으면 이 필드의 이더타입이 MAC 클라이언트의 프로토콜을 가리킨다. 여러 표준이 이더타입을 16진수 네 자리(WX-YZ 꼴)로 적는다 — 「Tutorial」 둘째·셋째 문단

쓰인 곳: 강의 수정 이력 L1, (phase 72 step 5) `ethernet.ethertype-length`(이더타입은 실린 데이터의 프로토콜을 가리키고 16진수로 적는다, 0600~FFFF, 두 읽기는 겹치지 않는다, 예전 이름 타입 필드·길이 필드)

## IANA — IEEE 802 Numbers (EtherType 레지스트리)
https://www.iana.org/assignments/ieee-802-numbers/ieee-802-numbers.xhtml

- 0000~05DC(10진 0~1500) 구간은 IEEE 802.3 길이 필드로 표시돼 있다 — EtherType 표
- IPv4는 0800, ARP는 0806, IPv6는 86DD다 — EtherType 표
- (phase 72 step 1) 8100은 「고객 VLAN 태그(C-Tag) 타입」이고 예전 이름은 Q-Tag다(근거 RFC 9542). 88A8은 IEEE 802.1Q의 서비스 VLAN 태그(S-Tag)다 — EtherType 표

- (phase 72 step 5) 레지스트리 XML(https://www.iana.org/assignments/ieee-802-numbers/ieee-802-numbers.xml)을 다시 열어 확인했다. 0000-05DC(10진 0-1500) 「IEEE802.3 Length Field」 다음 기록은
  예전에 쓰다 무효가 된 값(0101-01FF·0200·0201·0400)이고, 그다음이 0600(10진 1536)이다. 05DD~05FF(10진 1501~1535)에 대한 기록은 없다.
  0800은 「Internet Protocol version 4 (IPv4)」, 0806은 「Address Resolution Protocol (ARP)」, 86DD는 「Internet Protocol version 6 (IPv6)」으로 적혀 있다 — EtherType 표

쓰인 곳: 강의 수정 이력 L1, `ethernet.ethertype-length`(0000~05DC는 길이, 0800·86DD·0806, ARP의 풀네임, 05DD~05FF에 정해진 것이 없음), (phase 72 step 1) `hub-switch-vlan.vlan-tagging`(TPID 0x8100)

## RFC 9542 — IANA Considerations and IETF Protocol and Documentation Usage for IEEE 802 Parameters
https://www.rfc-editor.org/rfc/rfc9542

- 2024년 기준 IEEE가 할당하는 MAC 주소 접두사는 길이가 셋이다 — MA-L 24비트, MA-M 28비트, MA-S 36비트. 접두사 뒤에 남는 비트를 받은 쪽이 채운다 — §2.1(Table 1)
- 첫 옥텟의 X 비트(Local 비트)가 0이면 IEEE가 할당한 접두사를 가진 쪽이 관리하는 전역 주소이고, 1이면 그 네트워크의 관리자가 정해 쓸 수 있는 주소다 — §2.1.1
- 이더타입은 부호 없는 정수로 0x0600 이상인 16비트 식별자다. 길이로 쓰는 값은 이더타입과 헷갈리지 않도록 0x5DD 미만이어야 한다 — §3
- 이 RFC는 그 필드를 짧게 「프레임 길이를 주는 필드」라고 부른다. 무엇의 길이인지는 IEEE 802.3 3.2.6이 정한다(위 항목) — §3
- (phase 72) 이 RFC는 옥텟 하나를 16진수 두 자리로 적고, 옥텟 사이를 하이픈으로 가른다. IEEE 802.3 링크에서는 옥텟 안의 비트를 가장 낮은 비트부터 보낸다 — §1.1
- (phase 72) 48비트 MAC 주소는 이더넷 인터페이스를 가리키는 식별자로 가장 흔히 쓰인다. 전역에서 하나뿐인 것을 EUI-48이라고도 부른다 — §2.1
- (phase 72) 첫 옥텟의 가장 낮은 비트(M 비트, 흔히 그룹·멀티캐스트 비트)가 0이면 유니캐스트 주소, 1이면 그룹 주소(멀티캐스트나 브로드캐스트)다 — §2.1.1
- (phase 72) IEEE가 할당하는 MA-L·MA-M·MA-S 접두사는 Local 비트가 0이다. 접두사를 받은 쪽은 그 접두사의 M 비트를 1로 바꾼 꼴로 그룹 주소를 만들 수 있다 — §2.1.2
- (phase 72) IANA가 가진 OUI는 00-00-5E이고, 그 아래 유니캐스트 주소는 00-00-5E-00-00-00~00-00-5E-FF-FF-FF다 — §2.1.3
- (phase 72) **문서에 쓰라고 정해 둔 48비트 MAC 주소**: 유니캐스트 00-00-5E-00-53-00~00-00-5E-00-53-FF, 멀티캐스트 01-00-5E-90-10-00~01-00-5E-90-10-FF — §2.1.4
- (phase 72) 이 RFC에는 모든 비트가 1인 브로드캐스트 주소를 적은 문장이 없다 — 전문 검색. 근거는 IEEE 802.3 §3.2.3.1(위 항목)과 RFC 894(아래 항목)다

쓰인 곳: 강의 수정 이력 L1, L2, (phase 72) L29, `ethernet.mac-address`(전역·지역 관리·16진 표기·문서용 주소)와 두 주제의 예시 주소(`phases/72-network-ethernet-switch/guide.md` 「예시 값」), (phase 72 step 5) `ethernet.ethertype-length`(이더타입은 0x0600 이상, 길이는 0x5DD 미만, §3)

## IEEE RA — Guidelines for Use of EUI, OUI, and CID
https://standards.ieee.org/wp-content/uploads/import/documents/tutorials/eui.pdf

- OUI와 CID는 24비트다. IEEE RA는 이와 별도로 36비트 OUI-36도 할당한다 — PDF 2쪽 「IEEE-Administered organizational identifiers: OUI and CID」
- EUI를 MAC 주소로 쓸 때 첫 옥텟의 가장 낮은 비트(I/G)는 개별/그룹을, 그다음 비트(U/L)는 전역 관리(0)/지역 관리(1)를 나타낸다.
  전역 관리 주소는 전 세계에서 하나뿐이도록 만든 주소다 — PDF 6쪽
- IEEE RA가 할당한 OUI·OUI-36으로 만든 주소는 U/L이 0이라 전역 관리 주소다 — PDF 6쪽
- (phase 72) 문서 날짜는 2017-08-03이다. OUI는 3옥텟이고, 첫 옥텟의 가장 낮은 두 비트(M·X)가 **둘 다 0**이다. 그러니 첫 옥텟이 홀수이거나 둘째 비트가 1인 값은 IEEE RA가 준 OUI가 아니다 — PDF 2쪽 「OUI」
  (예외로 802.3-1985 승인 전 초기 이더넷 업체에 준 블록 ID 약 18개는 X 비트가 1이다 — 같은 쪽 NOTE)
- (phase 72) IEEE RA는 OUI를 하이픈으로 옥텟을 가른 16진 꼴로 적는다(예: AC-DE-48). EUI-48도 같은 꼴로 적는다(예: AC-DE-48-23-45-67) — PDF 3쪽, PDF 9쪽 「EUI Structure and Representation」
- (phase 72) EUI-48은 흔히 하드웨어 인터페이스의 주소로 쓰이고, 예전에는 「MAC-48」이라고도 불렀다 — PDF 6쪽
- (phase 72) IEEE RA가 준 OUI·OUI-36은 M 비트가 0이라, 그것으로 만든 주소는 I/G가 0인 개별 주소다. OUI를 받은 쪽은 M 비트를 1로 바꾼 꼴로 그룹 주소(I/G=1)를 만들 수 있고, 그 주소는 장치 하나를 가리키지 않는다 — PDF 6쪽

쓰인 곳: 강의 수정 이력 L2, (phase 72) L29, `ethernet.mac-address`(전역 유일성·OUI·구분 비트)

## RFC 791 — Internet Protocol
https://www.rfc-editor.org/rfc/rfc791

- (phase 72 step 4, 2026-10-28 확인) 옥텟은 비트 8개인 바이트다 — Glossary 「octet」(본문 43쪽). MAC 주소의 두 자리 묶음과 프레임 필드 크기의 단위를 풀 때만 쓴다.

- IP가 하는 기본 기능은 주소 지정과 단편화 둘이다 — §1.4
- 주소는 4옥텟(32비트) 고정 길이다. 그러니 이론상 개수는 2^32 = 4,294,967,296이다 — §2.3 「Addressing」
- 주소 클래스: A는 맨 앞 1비트가 0이고 다음 7비트가 네트워크, 나머지 24비트가 호스트 쪽이다. B는 맨 앞 2비트가 10, 다음 14비트가 네트워크, 나머지 16비트가 호스트 쪽이다.
  C는 맨 앞 3비트가 110, 다음 21비트가 네트워크, 나머지 8비트가 호스트 쪽이다 — §2.3 「Addressing」
- 단편화 오프셋 필드는 8옥텟(64비트) 단위로 센다. 첫 조각의 오프셋은 0이다 — §3.1 「Fragment Offset」
- TTL은 데이터그램을 처리하는 모든 모듈이 최소 1씩 줄인다 — §3.1 「Time to Live」
- IP는 데이터그램이라 부르는 데이터 덩어리를 출발지에서 목적지로 나른다. 쓰이는 환경은 패킷 교환 방식의 컴퓨터 통신 네트워크들을 서로 이은 시스템이다 — §1.1 「Motivation」, §1.2 「Scope」(인터넷 데이터그램)
- IP는 인터넷 데이터그램 하나하나를 다른 데이터그램과 관계없는 독립된 것으로 다룬다. 데이터그램 사이에 연결이나 논리적 회선이 없다 — §1.4 「Operation」
- (phase 71) 이름은 찾는 것이 무엇인지, 주소는 그것이 어디 있는지, 경로는 거기 어떻게 가는지를 가리키고, IP는 주로 주소를 다룬다 — §2.3 「Addressing」.
  IP 모듈은 인터넷 헤더에 실린 주소를 써서 데이터그램을 목적지 쪽으로 보낸다 — §1.4 「Operation」
- (phase 71) 데이터그램을 나눠야 하는 것은, 큰 패킷을 실을 수 있는 네트워크에서 출발한 데이터그램이 목적지로 가는 길에 더 작은 패킷만 실을 수 있는 네트워크를 지나야 할 때다 — §2.3 「Fragmentation」.
  IP 모듈은 「작은 패킷」 네트워크를 지나야 할 때 데이터그램을 나누고 다시 합친다 — §1.4 「Operation」

쓰인 곳: 강의 수정 이력 L3, L6, 면접 수정 이력 I8, `protocols-encapsulation.packet-switching`, `protocols-encapsulation.tcp-ip-model`, `protocols-encapsulation.pdu-names`, `ethernet.mac-address`(바이트·옥텟의 뜻; `ethernet.frame`에서도 쓰는 단위), (phase 72 step 5) `ethernet.ethertype-length`(IP는 여러 네트워크를 이은 곳에서 데이터그램을 출발지에서 목적지로 나르고 주소를 다룬다 — IPv4·IPv6·IP 주소의 한 줄 풀이, §1.1·§1.2·§2.3)

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

쓰인 곳: 강의 수정 이력 L4, L5, L10, 면접 수정 이력 I3, I8, (phase 72 step 5) `ethernet.ethertype-length`(IPv6는 주소를 32비트에서 128비트로 늘렸다, §1)

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
- TCP 세그먼트는 하나하나 IP 데이터그램(인터넷 데이터그램)에 담겨 보내진다 — §2.2, §3.1

쓰인 곳: 강의 수정 이력 L9, L12, L13, 면접 수정 이력 I2, `protocols-encapsulation.osi-model`, `protocols-encapsulation.tcp-ip-model`, `protocols-encapsulation.encapsulation`, `protocols-encapsulation.pdu-names`

## RFC 768 — User Datagram Protocol
https://www.rfc-editor.org/rfc/rfc768

- UDP는 트랜잭션 지향이고, 전달과 중복 방지를 보장하지 않는다 — Introduction
- 순서 있고 신뢰할 수 있는 데이터 스트림 전달이 필요한 응용은 TCP를 써야 한다 — Introduction
- 길이 필드는 헤더와 데이터를 합친 UDP 데이터그램의 옥텟 수다 — Fields
- 체크섬은 의사 헤더·UDP 헤더·데이터에 대한 16비트 1의 보수 합이다. 0으로 보내면 보낸 쪽이 체크섬을 만들지 않았다는 뜻이다 — Fields
- UDP가 주고받는 단위를 사용자 데이터그램(user datagram)이라 부르고, 그냥 데이터그램이라고도 쓴다. 헤더 그림의 제목은 「User Datagram Header Format」이다 — Format, Fields, User Interface

쓰인 곳: 강의 수정 이력 L10, 면접 수정 이력 I3, I4, I10, `protocols-encapsulation.pdu-names`

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
- 네 계층의 영문 이름은 Application Layer, Transport Layer, Internet Layer, Link Layer다. 호스트는 대개 계층마다 프로토콜을 적어도 하나 구현해야 한다 — §1.1.3
- 링크 계층: 호스트가 자기가 직접 이어진 네트워크에서 통신하려면 그 네트워크에 닿는 데 쓰는 통신 프로토콜을 구현해야 하고, 그것을 링크 계층(또는 매체 접근 계층) 프로토콜이라 부른다.
  강의는 이 계층을 「네트워크 액세스 계층」이라 부른다 — §1.1.3
- 응용 계층의 사용자 프로토콜로 Telnet(원격 로그인), FTP(파일 전송), SMTP(전자 우편 전달)를 든다 — §1.1.3
- (2026-10-28) 응용 계층 프로토콜은 사용자에게 직접 서비스를 주는 사용자 프로토콜과, 여러 시스템 기능을 받쳐 주는 지원(support) 프로토콜로 나뉜다.
  지원 프로토콜은 호스트 이름 대응·부팅·관리에 쓰이고, 그 예로 SNMP, BOOTP, RARP, DNS를 든다 — §1.1.3
- (2026-10-28) IP는 비연결형(데이터그램) 서비스라 종단 간 전달을 보장하지 않는다. 데이터그램은 손상되거나, 중복되거나, 순서가 바뀌거나, 아예 닿지 않을 수 있다.
  인터넷의 IP는 OSI 비연결형 네트워크 프로토콜의 본보기였다 — §1.1.3
- (2026-10-28) 인터넷 계층 프로토콜은 IP·ICMP·IGMP다. ICMP는 IP의 일부로 여기는 제어 프로토콜로, 오류 보고·혼잡 보고·첫 홉 게이트웨이의 경로 바꿈(redirect)을 맡는다.
  구조로는 IP 위에 얹혀 TCP·UDP처럼 IP로 자기 데이터를 나른다. IGMP는 IP 멀티캐스트에 쓰는 호스트 그룹을 동적으로 꾸리는 인터넷 계층 프로토콜이다 — §1.1.3
- 세션 계층은 따로 없다. 네 계층 가운데 세션에 해당하는 것이 없고, OSI와 견주는 말은 응용 계층이 표현·응용을 합쳤다는 위 한 곳뿐이다. 전문에 「session」이라는 말이 나오지 않는다 — §1.1.3, 전문 검색(2026-10-27)
- 이 문서의 용어(§1.3.3):
  - 세그먼트는 TCP의 종단 간 전송 단위로, TCP 헤더 뒤에 응용 데이터가 붙은 것이다. IP 데이터그램에 담겨 전송된다.
  - IP 데이터그램은 IP의 종단 간 전송 단위로, IP 헤더 뒤에 전송 계층의 메시지가 붙은 것이다. 인터넷 계층을 설명하는 3장에서는 「데이터그램」만 써도 IP 데이터그램을 뜻한다.
  - 패킷은 인터넷 계층과 링크 계층 사이에서 넘겨지는 데이터 단위로, IP 헤더와 데이터를 담는다. IP 데이터그램 전체일 수도, 그 조각일 수도 있다.
  - 프레임은 링크 계층 프로토콜의 전송 단위로, 링크 계층 헤더 뒤에 패킷이 붙은 것이다.
  - 메시지는 이 문서가 아래 계층을 설명할 때 **전송 계층 프로토콜의 전송 단위**를 가리키는 말이다(TCP 세그먼트도 메시지다). 이 과목은 응용 계층의 단위를 강의(p37)대로 데이터라 부르고
    메시지는 HTTP 표준의 이름(HTTP 메시지)으로만 덧붙이므로(ADR-058) 이 정의는 개념 본문에 옮기지 않는다 — HTTP 메시지의 근거는 아래 RFC 9110 §1.3이다.

쓰인 곳: 강의 수정 이력 L10, L25, 면접 수정 이력 I3, I9, I10, `network-basics.host`, `network-basics.network-equipment`, `network-basics.internet`, `network-basics.cast-types`,
`protocols-encapsulation.protocol`, `protocols-encapsulation.reference-model`, `protocols-encapsulation.tcp-ip-model`, `protocols-encapsulation.pdu-names`, `protocols-encapsulation.packet-switching`, `exam-notes.md` E2,
(phase 72에서 쓰일 곳) `ethernet.ethernet`(링크 계층 = 강의의 네트워크 액세스 계층, §1.1.3), `ethernet.frame`(링크 계층의 전송 단위가 프레임, §1.3.3)

## RFC 871 — A Perspective on the ARPANET Reference Model
https://www.rfc-editor.org/rfc/rfc871

1982년 9월, 설계에 참여한 사람이 쓴 글이다(표준이 아니라 설명 문서). 역사적 사실을 확인하는 데만 쓴다.

- TCP와 IP를 포함한 ARPANET 프로토콜 묶음은 ARPANET 참조 모델(ARM)이라는 틀 안에서 설계되었고, 이 글은 그것을 ISO의 OSI 참조 모델과 견준다 — Abstract
- ARM은 계층을 셋(프로세스·응용 수준, 호스트 간 수준, 네트워크 수준)으로 보고, OSI는 적어도 일곱으로 본다 — 「Layering」, 각주가 딸린 계층 수 논의

쓰인 곳: 강의 수정 이력 L25, `protocols-encapsulation.tcp-ip-model`

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

- HTTP는 Hypertext Transfer Protocol이다 — Abstract
- HTTP에서 주고받는 단위는 메시지이고, 메시지는 요청이거나 응답이다. 클라이언트가 요청 메시지를 만들어 보내고, 서버는 하나 이상의 응답 메시지로 답한다 — §1.3, §3.4
- (2026-10-28) HTTP 메시지는 넷으로 이루어진다. 메시지를 설명하고 보낼 곳을 정하는 제어 데이터, 그 제어 데이터를 넓히는 이름·값 짝의 헤더, 본문(content),
  본문을 보내는 동안 얻은 정보를 싣는 트레일러다 — §6
- (2026-10-28) 본문은 헤더 뒤에 보내는 바이트의 흐름이다. HTTP 메시지는 흔히 자원의 표현, 곧 자원의 상태를 나타내는 정보의 전체나 일부를 본문에 싣는다.
  GET 요청에 대한 200 응답이면 본문은 요청한 자원의 지금 상태를 나타낸다 — §6.4, §6.4.1, §3.2
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

쓰인 곳: 강의 수정 이력 L20, L21, L22, 면접 수정 이력 I6, I7, I12, I14, I15, `protocols-encapsulation.tcp-ip-model`, `protocols-encapsulation.pdu-names`,
`protocols-encapsulation.encapsulation`, `protocols-encapsulation.decapsulation`

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

쓰인 곳: `network-basics.cast-types`, `protocols-encapsulation.tcp-ip-model`(phase 71 — IGMP 문장의 멀티캐스트 풀이)

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
- (2026-10-28) 가상 회선은 꼭 회선 교환을 하지 않고도 연결형 서비스를 주는 네트워크 서비스다 — 「virtual circuit」
- (2026-10-28) 데이터그램은 앞서 주고받은 것에 기대지 않고, 목적지까지 가는 데 필요한 정보를 스스로 담은 독립된 데이터 단위다 — 「datagram」
- (2026-10-28) 메시지 교환은 따로 풀이하지 않고 패킷 교환 항목으로 넘긴다 — 「message switching」
- (phase 71) 10BaseT는 꼬아 만든 구리선 쌍(twisted-pair copper wire)으로, 10BaseF는 광섬유 케이블(fiber-optic cable)로 데이터를 보내는 물리 계층 규격이다 — 「10BaseT」, 「10BaseF」
- (phase 71) 서버는 자원을 내주는 쪽이고, 클라이언트는 다른 컴퓨터 시스템이나 프로세스에 서비스를 요청하는 쪽이다 — 「server」, 「client」
- (phase 71) PING은 목적지에 ICMP echo 요청을 보내고 응답을 기다려, 그 목적지에 닿을 수 있는지 시험하는 프로그램이다 — 「Packet InterNet Groper (PING)」
- (phase 71) 인터넷 주소는 인터넷에서 노드 하나를 유일하게 가리키는 IP 주소다. IP 주소는 RFC 791이 정한 32비트 주소다 — 「internet address」, 「IP address」

쓰인 곳: `network-basics.computer-network`, `network-basics.host`, `network-basics.internet`, `network-basics.cast-types`, `network-basics.lan-wan`, `network-basics.traffic`, `network-basics.packet-loss`,
`network-basics.communication-link`(phase 71 — 트위스티드 페어 케이블의 구리선), `protocols-encapsulation.tcp-ip-model`(phase 71 — IP 주소),
`protocols-encapsulation.pdu-names`(계층을 가리지 않고 쓰는 넓은 뜻의 패킷), `protocols-encapsulation.packet-switching`(가상 회선·데이터그램·메시지 교환, phase 71에 노드·서버 풀이),
(phase 72에서 쓰일 곳) `ethernet.ethernet`(LAN), `ethernet.standard-names`(10BaseT — 꼬아 만든 구리선 쌍), `ethernet.mac-address`(브로드캐스트·멀티캐스트·유니캐스트)

## RFC 3013 — Recommended Internet Service Provider Security Services and Procedures
https://www.rfc-editor.org/rfc/rfc3013

BCP 46이다. **이름 표기만** 가져온다.

- ISP는 Internet Service Provider의 줄임말이다 — 제목, Abstract

쓰인 곳: `network-basics.lan-wan`

## (2026-10-28) RFC 903 — A Reverse Address Resolution Protocol
https://www.rfc-editor.org/rfc/rfc903

인터넷 표준이고 폐기되지 않았다(rfc-editor 상태).

- 디스크가 없는 워크스테이션 같은 호스트는 켜질 때 자기 프로토콜 주소(IP 주소)를 모르고 하드웨어 주소만 아는 일이 많다. RARP는 그런 호스트가 자기 IP 주소를
  바깥에서 알아내는 방법이다. 하드웨어 주소를 알아내는 ARP와 반대 방향의 문제를 푼다 — §I
- 하드웨어 주소와 IP 주소의 대응표를 가진 서버가 있어야 한다 — §II
- RARP를 데이터 링크 수준(data-link level)의 별도 프로토콜로 두고, 이더넷에서는 ARP와 다른 이더타입을 쓴다 — §III
- 이 RFC에는 RARP가 인터넷(네트워크) 계층이라는 말이 없다. RFC 1122 §1.1.3은 RARP를 응용 계층의 지원 프로토콜로 든다(위 RFC 1122 항목).
  자격시험이 RARP를 인터넷 계층으로 보는 것은 `exam-notes.md`의 E2다

쓰인 곳: `protocols-encapsulation.tcp-ip-model`, (phase 72 step 5) `ethernet.ethertype-length`(ARP는 하드웨어 주소를 알아내는 프로토콜이다, §I — 「IP 주소로 같은 네트워크 안 장치의 MAC 주소」는 강의 p133)

## (2026-10-28) RFC 1123 — Requirements for Internet Hosts -- Application and Support
https://www.rfc-editor.org/rfc/rfc1123

인터넷 표준이고 폐기되지 않았다(rfc-editor 상태). RFC 1122와 짝으로, 응용 계층과 지원 프로토콜을 다룬다.

- 원격 관리 절에서 네트워크 관리 프로토콜로 SNMP를 들고, 인터넷 호스트는 SNMP(또는 CMOT) 에이전트를 갖추는 것이 좋다(SHOULD)고 한다 — §6.3.1

쓰인 곳: `protocols-encapsulation.tcp-ip-model`

## (2026-10-28) RFC 1350 — The TFTP Protocol (Revision 2)
https://www.rfc-editor.org/rfc/rfc1350

인터넷 표준(STD 33)이다.

- TFTP(Trivial File Transfer Protocol)는 파일을 주고받는 아주 단순한 프로토콜이고, UDP 위에 구현되어 있다 — Summary, §1

쓰인 곳: `protocols-encapsulation.tcp-ip-model`

## (2026-10-28) RFC 4949 — Internet Security Glossary, Version 2
https://www.rfc-editor.org/rfc/rfc4949

정보성(Informational) 문서다. 용어의 뜻을 확인하는 데만 쓴다.

- 프로토콜은 시스템 사이의 연관(예: 통신)을 구현·제어하는 규칙(형식과 절차)의 묶음이다. 또는 둘 이상의 개체가 함께 목표를 이루려고 밟는 순서 있는 단계들이다 — §4 「protocol」
- 암호화는 데이터(평문)를 원래 뜻을 감춘 다른 형태(암호문)로 바꿔, 원래 형태로 쓰이지 못하게 하는 변환이다. 되돌리는 변환이 복호화다 — §4 「encryption」

쓰인 곳: `protocols-encapsulation.protocol`, `protocols-encapsulation.osi-model`

## (2026-10-28) ITU-T X.800 (03/91) — Security architecture for Open Systems Interconnection for CCITT applications
https://www.itu.int/rec/T-REC-X.800-199103-I/en

1991-03 승인, 현행 권고다. ISO 7498-2와 짝이고, X.200 §5.1.3 NOTE가 보안을 이 권고에 넘긴다. ADR-057이 허용 목록에 더했다.

- 표현 계층은 응용 계층이 주는 기밀성 서비스 등을 받쳐 주는 기능을 줄 수 있다. 그 기능은 전송 구문으로 인코딩된 데이터에서만 돌아가는 것, 예컨대 암호 기법에 기댄 것이다 — §7.6.1, Note
- 데이터 전달에 쓰는 암호화 메커니즘을 위쪽 계층에 둘 때는 표현 계층에 둔다. 보낼 때는 전송 구문으로 바꾸는 과정의 마지막 단계, 받을 때는 첫 단계에서 동작한다 — §7.6.2
- 암호화는 표현 계층만의 일이 아니다. 데이터 링크 계층이 주는 보안 서비스는 기밀성 둘(연결·비연결)뿐이고, 그것을 암호화 메커니즘으로 준다 — §7.2.1, §7.2.2.
  물리(§7.1)·네트워크(§7.3)·전송(§7.4) 계층에도 기밀성 서비스가 있고, 세션 계층에는 보안 서비스가 없다 — §7.5.1

쓰인 곳: `protocols-encapsulation.osi-model`, `exam-notes.md` E3

## (2026-10-28) ITU-T Q.9 (11/88) — Vocabulary of switching and signalling terms
https://www.itu.int/rec/T-REC-Q.9-198811-I/en

1988-11 승인, 현행 권고다. ADR-057이 허용 목록에 더했다.

- 메시지 교환(message switching)은 축적 전달 교환(store-and-forward switching)이라고도 한다. 망의 몇몇 노드가 메시지를 받아 필요한 만큼 저장했다가 넘겨,
  메시지가 갈 길을 이어 가는 과정이다 — 용어 1130
- 「datagram」은 이 용어집에 없다

쓰인 곳: `protocols-encapsulation.packet-switching`

## (2026-10-28) ITU-T X.25 (10/96) — Interface between DTE and DCE for terminals operating in the packet mode
https://www.itu.int/rec/T-REC-X.25-199610-I/en

1996-10 승인, 현행 권고다. 패킷 교환 공중 데이터망에 단말을 잇는 규격이다. ADR-057이 허용 목록에 더했다.

- 가상 회선 서비스는 가상 호(virtual call)와 영구 가상 회선(permanent virtual circuit) 둘이다. 가상 호는 호를 맺고 푸는 절차가 있다 — §3, §4.1
- 가상 호와 영구 가상 회선에서 오가는 데이터 패킷에는 방향마다 차례로 순서 번호를 매긴다 — §4.4.1.1
- 망은 가상 호마다(호 단위로) 자원을 배정하고 그 호가 지날 경로를 정한다 — §6.27
- 이 판에는 데이터그램 서비스가 없다 — 전문 검색

쓰인 곳: `protocols-encapsulation.packet-switching`

## (phase 71) ITU-T G Suppl. 42 (10/2018) — Guide on the use of the ITU-T Recommendations related to optical fibres and systems technology
https://www.itu.int/rec/T-REC-G.Sup42-201810-I/en

G 시리즈 권고의 보충 문서(Supplement)다. 권고가 아니라 광섬유·광 전송 권고들의 쓰임을 안내하는 정보성 문서라, 용어의 뜻을 확인하는 데만 쓴다. 위 페이지에서 무료 PDF를 받아 읽었다.

- 광섬유는 구리선이 전자를 이끌듯 빛을 이끌 수 있어, 레이저 빛으로 통신하는 데 알맞다고 제안되었다 — §5
- 광 송신기 안에서 전기 신호인 비트 흐름이 빛(광 반송파)의 세기를 바꾸고, 광섬유를 지난 광 신호는 광 수신기가 다시 전기 신호로 바꾼다 — §5.6

쓰인 곳: `network-basics.communication-link`, `ethernet.standard-names`(광케이블은 빛을 이끄는 광섬유로 빛 신호를 실어 나른다)

## (phase 71) Microsoft Learn — Windows commands, ping, Task Manager
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands
https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping
https://learn.microsoft.com/en-us/troubleshoot/windows-server/support-tools/support-tools-task-manager

지원되는 모든 Windows와 Windows Server를 대상으로 쓴 문서다(Windows commands 첫 문단, Task Manager 「Applies to」). 2026-10-28에 읽은 판: Windows commands 2025-07-29, ping 2023-09-15, Task Manager 2026-02-12.

- 지원되는 모든 Windows에는 콘솔 명령이 들어 있다. Windows의 명령줄 셸은 명령 셸과 PowerShell 둘이고, 셸은 사용자와 운영 체제·응용 프로그램 사이를 바로 잇는 프로그램이다.
  ping은 이 명령 목록에 있다 — Windows commands 첫 문단, 「Command-line shells」, 「Command-line reference A-Z」
- ping은 ICMP echo 요청 메시지를 보내 다른 TCP/IP 컴퓨터와 IP 수준에서 이어지는지 확인하고, 돌아온 echo 응답을 표시한다 — ping 첫 문단
- ping의 문법은 옵션 뒤에 목적지(`<targetname>`)를 적는 꼴이고, 목적지는 호스트 이름이나 IP 주소다. 예를 들어 `ping /a 10.0.99.221`처럼 입력한다 — ping 「Syntax」, 「Parameters」, 「Examples」
- 작업 관리자는 Windows에 기본으로 들어 있는(in-box) 도구로, 응용 프로그램과 프로세스의 성능과 자원 사용을 살핀다 — Task Manager 「Summary」
- 작업 관리자의 프로세스 탭은 실행 중인 앱과 백그라운드 프로세스의 목록을, 성능 탭은 성능 데이터의 목록과 그래프를 보여 준다 — Task Manager 「More information」 표

쓰인 곳: `network-basics.throughput`(작업 관리자), `network-basics.packet-loss`(ping 명령)

## (phase 72) IEEE 802.3 — Ethernet, 4.1.2 Normal operation, 4.2.4 Frame reception model, 4.2.5 Preamble generation
https://www.ieee802.org/3/as/public/0503/4d0_1_CMP.pdf

위 3장 항목과 같은 IEEE P802.3as Draft 0.1(2005-03)의 4장이다. IEEE Std 802.3-2005 4장 본문을 싣고 있어 그 본문을 근거로 쓴다.

- 보낼 때 MAC 부계층은 위에서 받은 데이터로 프레임을 만들면서, 프레임 **앞에** 프리앰블과 SFD를 붙인다. 목적지·출발지 주소, 길이/타입 필드, (필요하면) 패드, FCS도 이때 붙인다 — §4.1.2.1.1
- 받을 때는 물리 계층이 들어오는 프리앰블에 맞춰 동기를 잡는다. MAC 부계층은 프리앰블과 SFD까지의 앞 비트를 버리고 그 뒤를 모은다 — §4.1.2.1.2
- 모은 프레임의 목적지 주소 필드를 보고 이 스테이션이 받을 프레임인지 정한다. 받을 프레임이면 주소·길이/타입·데이터를 MAC 클라이언트(위 계층)로 넘기고,
  FCS로 프레임이 오는 길에 손상됐는지도 검사한다 — §4.1.2.1.2
- 주소 인식: MAC 부계층은 목적지 주소가 ① 자기 개별 주소인 프레임, ② 브로드캐스트 주소인 프레임, ③ 위 계층이 켜 둔 그룹 주소인 프레임을 알아보고 받아들인다.
  켜 둔 그룹 주소는 다시 끌 수 있다. 목적지 주소와 상관없이 오류 없는 프레임을 모두 받아들이는 무차별(promiscuous) 수신 모드를 둘 수도 있다(선택) — §4.2.4.1.1
- FCS 검사: 받은 비트(FCS 필드는 빼고)로 만든 CRC가 받은 값과 다르면 오류로 보고 그 프레임을 잘못된 것으로 판정한다 — §4.2.4.1.2
- 프리앰블은 물리 계층 회로가 안정되도록 데이터보다 먼저 보내는 비트열이고, 10101010을 일곱 번 보낸다. 왼쪽 비트부터 보내며 0으로 끝나고, 바로 뒤에 SFD가 온다 — §4.2.5

쓰인 곳: (phase 72) 강의 수정 이력 L28, `ethernet.nic`(자기 주소·브로드캐스트 주소·켜 둔 그룹 주소의 프레임만 받아 위 계층으로 넘긴다, 무차별 모드는 선택 기능), `ethernet.frame`(프리앰블·SFD), `ethernet.fcs`(받는 쪽이 FCS를 뺀 비트로 다시 계산해 받은 값과 견주고, 다르면 잘못된 프레임으로 판정, §4.2.4.1.2), (phase 72 step 6) `hub-switch-vlan.hub`·문항 n035 해설(허브가 내보낸 신호를 받은 호스트의 NIC가 목적지 주소를 보고 자기 프레임만 받아들이고 나머지는 버린다)

## (phase 72) IEEE 802.3 Working Group — Editorial guidelines (Frames and packets; Mb/s, Gb/s)
https://www.ieee802.org/3/WG_tools/editorial/requirements/words.html

IEEE 802.3 작업 그룹이 표준 본문을 쓸 때 따르는 낱말 지침이다. 2026-10-28에 읽은 판은 2024-05-15에 마지막으로 고쳤다.

- 프레임(MAC 프레임)은 **목적지 주소부터 FCS까지**다. MAC 프레임에 프리앰블·SFD·(필요하면) 확장 필드를 더한 것은 패킷(MAC 패킷)이라 부른다 — 「Frames and packets」
- 비트 전송 속도의 단위는 b/s이고 Mb/s·Gb/s·Tb/s로 적는다. bps·Mbps 꼴은 쓰지 않는다 — 「MBd, GBd, Mb/s, Gb/s」
- (같은 쓰임) 2026년에 진행 중인 P802.3dt 프로젝트의 범위 문안도 메타데이터를 「패킷의 프리앰블 필드」에 싣는다고 쓴다 —
  https://www.ieee802.org/3/dt/public/26_03/law_3dt_01a_2603.pdf PDF 5쪽 「IEEE P802.3dt draft PAR Scope」(802.3dt 태스크 포스 발표 자료, 2026-03-10)

쓰인 곳: (phase 72) 강의 수정 이력 L28, `ethernet.frame`(목적지 주소~FCS가 프레임, 프리앰블·SFD는 앞에 붙음), `ethernet.standard-names`(속도 단위 표기)

## (phase 72) IEEE Std 802.3ah-2004 — Introduction, 1.4 Definitions
https://www.ieee802.org/21/doctree/2006_Meeting_Docs/2006-11_meeting_docs/802.3ah-2004.pdf

발행된 IEEE 표준(IEEE Std 802.3ah-2004, 2004-09-07, IEEE Std 802.3-2002의 개정판)의 전문 PDF다. IEEE 802.21 작업 그룹이 회의 자료로 `ieee802.org`에 올려 둔 사본을 읽었다.

- IEEE 802.3의 프로젝트(개정)는 802.3 뒤에 붙인 꼬리 글자로 부른다(예: 802.3ae) — Introduction(PDF 5쪽)
- 802.3이 정하는 MAC 프로토콜은 CSMA/CD이고, 802.3-1985는 10 Mb/s로 동작했다. 그 뒤로 새 매체·새 속도·새 기능이 개정으로 더해졌다 — Introduction(PDF 5쪽)
- 802.3u는 100 Mb/s 동작을 더했고 **Fast Ethernet**이라고도 부른다. 802.3z는 1000 Mb/s 동작을 더했고 **Gigabit Ethernet**이라고도 부른다. 802.3ae는 **10 Gigabit Ethernet**이라고도 부른다.
  이런 큰 개정은 시장에서 프로젝트 번호로도 가리킨다. 802.3x는 전이중 동작과 흐름 제어 프로토콜을 정했다 — Introduction(PDF 5쪽)
- 규격 이름 하나는 「IEEE 802.3의 물리 계층 규격(Physical Layer specification)」 하나로 정의된다. 예: 1000BASE-BX10은 싱글 모드 광섬유 **한 가닥**으로, 1000BASE-LX10은 싱글 모드나 멀티 모드 광섬유 두 가닥으로
  1000 Mb/s 점대점 링크를 만드는 물리 계층 규격이다. 100BASE-FX는 멀티 모드 광섬유 두 가닥을 쓰는 100 Mb/s 규격이다 — §1.4(PDF 20쪽)

쓰인 곳: (phase 72) 강의 수정 이력 L26·L27, `ethernet.fast-gigabit`(802.3u를 Fast Ethernet, 802.3z를 Gigabit Ethernet, 802.3ae를 10 Gigabit Ethernet이라고도 부른다), (phase 72에서 쓰일 곳) `ethernet.ethernet`(개정판 이름), `ethernet.standard-names`

## (phase 72) David Law, 「Past PHY naming」 (IEEE 802.3, 2015-12-05)
https://www.ieee802.org/3/cb/public/jan16/PHY_names_1115.pdf

당시 IEEE 802.3 작업 그룹 의장이 P802.3cb 태스크 포스 자료로 올린 정리다. 802.3의 PHY(물리 계층 규격) 이름 목록과 이름 읽는 법을 담았다.

- 이름 꼴: 「데이터 속도 + 변조 방식 + 하이픈 뒤 글자」. 속도는 수만 있으면 Mb/s(10, 100, 1000), G가 붙으면 Gb/s(2.5G, 5G, 10G, 25G, 40G, 100G, 400G)다.
  변조 방식 BASE는 베이스밴드(Baseband), BROAD는 브로드밴드(Broadband)다 — PDF 10쪽
- 하이픈 뒤 첫 글자는 매체·파장·거리를 가리킨다: T 트위스티드 페어, C 트윈 액시얼(twin axial) 구리, S 짧은 파장(850 nm)이나 짧은 거리(100 m), L 긴 파장(1310 nm)이나 10 km,
  E 아주 긴 파장(1510 nm)이나 40 km, F 광섬유(2 km), K 백플레인, B 양방향 광, P 수동 광 — PDF 10쪽 「First letter (Media/Wavelength/Reach)」
- 하이픈 뒤 둘째 글자는 부호화 방식이다: X 외부에서 정한 부호(4B5B·8B10B), R 스크램블 부호(64B66B), W WAN 부호(SONET/SDH) — PDF 10쪽
- 처음 규격(10BASE5·10BASE2)은 BASE 뒤의 수가 최대 구간 길이를 100 m 단위로 나타냈다(10BASE5는 동축 500 m) — PDF 10쪽 「nTYPEm」, PDF 2쪽 표
- 규격별 매체(표): 100BASE-TX 평형 트위스티드 페어 2쌍 100 m, 1000BASE-T 평형 트위스티드 페어 4쌍 100 m, 1000BASE-SX 멀티 모드 광섬유 두 가닥(850 nm) 550 m,
  1000BASE-LX 싱글 모드 광섬유 두 가닥(1310 nm) 5 km, 1000BASE-CX 트윈 액시얼 구리 25 m, 1000BASE-BX10 싱글 모드 광섬유 한 가닥 10 km, 10GBASE-T 평형 트위스티드 페어 4쌍 100 m — PDF 3~5쪽 표

쓰인 곳: (phase 72) 강의 수정 이력 L26·L27, `ethernet.fast-gigabit`(100BASE-TX는 트위스티드 페어, 1000BASE-SX는 멀티 모드 광섬유), (phase 72에서 쓰일 곳) `ethernet.standard-names`

## (phase 72) Pete Anslow, 「PMD naming」 (IEEE P802.3bs Task Force, 2015-07)
https://www.ieee802.org/3/bs/public/15_07/anslow_3bs_03_0715.pdf

IEEE P802.3bs 태스크 포스 회의 발표 자료다.

- PMD 이름의 글자 하나하나에는 예전에 정해진 뜻이 있었다(IEEE Std 802.3 1.2.3). 예를 들어 10GBASE-LR의 L은 원래 「긴 파장」인데, 업계는 흔히 「긴 거리」로 읽었다 — 2쪽
- 그래서 40 Gb/s·100 Gb/s PMD 이름부터는 글자에 엄밀한 뜻을 두지 않는다 — 2쪽
- 이름 해독표: 속도(10 = 10 Mb/s, 100 = 100 Mb/s, 1000 = 1000 Mb/s, 2.5G = 2.5 Gb/s …), 변조 BASE = 베이스밴드, 첫 글자 C 트윈액스 구리·L 긴 파장 또는 10 km·S 짧은 파장 또는 100 m·
  T 트위스티드 페어, 둘째 글자 R 스크램블 부호·X 외부 부호, 끝의 수는 쌍이나 레인의 수 — 3쪽

쓰인 곳: (phase 72) 강의 수정 이력 L26, (phase 72에서 쓰일 곳) `ethernet.standard-names`

## (phase 72) David Law, 「IEEE 802.3 Ethernet」 (IEEE 802.3 Working Group Chair, Version 1.0, 2010-01)
https://www.ieee802.org/misc-docs/GlobeCom2009/IEEE_802d3_Law.pdf

당시 IEEE 802.3 작업 그룹 의장의 개요 발표 자료다.

- 802.3u-1995(100BASE-T): 100BASE-TX(Cat 5 2쌍, 100 m), 100BASE-T4(Cat 3 4쌍, 100 m), 100BASE-FX(멀티 모드 광섬유 두 가닥, 2 km) — 8쪽
- 802.3z-1998(1 Gb/s 동작): 1000BASE-SX(멀티 모드 광섬유 두 가닥, 220~550 m), 1000BASE-LX(싱글 모드 광섬유 두 가닥 5 km, **또는 멀티 모드 광섬유 두 가닥 550 m**),
  1000BASE-CX(구리 케이블 어셈블리, 25 m) — 10쪽
- 802.3ab-1999: 1000BASE-T(트위스티드 페어, 100 m) — 10쪽
- 802.3ae-2002(10 Gb/s 동작): 10GBASE-SR/SW(멀티 모드), 10GBASE-LX4(싱글 모드나 멀티 모드), 10GBASE-LR/LW(싱글 모드 10 km), 10GBASE-ER/EW(싱글 모드 40 km) — 10쪽
- 802.3an-2006: 10GBASE-T(트위스티드 페어, 100 m) — 12쪽

쓰인 곳: (phase 72) 강의 수정 이력 L26·L27, `ethernet.standard-names`(1000BASE-LX가 싱글 모드·멀티 모드 광섬유를 모두 쓴다, 10GBASE-SR은 멀티 모드), `ethernet.fast-gigabit`(100BASE-FX는 멀티 모드 광섬유, 802.3ae의 10GBASE-SR은 멀티 모드·10GBASE-LR은 싱글 모드, 802.3an의 10GBASE-T)

## (phase 72) IEEE SA — 802.3u-1995, 802.3z-1998, 802.3ab-1999, 802.3ae-2002, 802.3an-2006, 802.3cc-2017 표준 소개 페이지
https://standards.ieee.org/ieee/802.3u/1079/
https://standards.ieee.org/ieee/802.3z/1084/
https://standards.ieee.org/ieee/802.3ab/1086/
https://standards.ieee.org/ieee/802.3ae/1089/
https://standards.ieee.org/ieee/802.3an/3560/
https://standards.ieee.org/ieee/802.3cc/6753/

표준마다 제목·초록·발행일을 싣는 IEEE SA 페이지다. 여섯 모두 지금은 「Superseded」(뒤 판의 IEEE Std 802.3에 합쳐짐)로 표시돼 있다.

- 802.3u-1995(1995-10-26 발행): 제목은 「100 Mb/s 동작, 유형 100BASE-T」다. 100 Mb/s 물리 계층 규격 묶음을 통틀어 100BASE-T라 부르고, 100BASE-T4(Category 3·4·5 평형 케이블 4쌍),
  100BASE-TX(Category 5 평형 케이블 2쌍이나 150옴 차폐 평형 케이블), 100BASE-FX(멀티 모드 광섬유 두 가닥)를 담는다 — 제목, 초록
- 802.3z-1998(1998-10-01 발행): 802.3·이더넷 형식 프레임을 1,000 Mb/s로 보내기 위한 MAC 매개변수·물리 계층·리피터·관리 매개변수 — 제목, 초록
- 802.3ab-1999(1999-07-26 발행): Category 5 평형 구리 케이블 4쌍 위의 1000 Mb/s 동작, 유형 1000BASE-T — 제목, 초록
- 802.3ae-2002(2002-08-26 발행): 10 Gb/s 동작을 위한 MAC 매개변수·물리 계층·관리 매개변수 — 제목, 초록
- 802.3an-2006(2006-09-01 발행): 10 Gb/s 동작, 유형 10GBASE-T. 평형 트위스티드 페어 구조화 배선으로 최대 100 m를 잇는다 — 제목, 초록
- 802.3cc-2017(2018-01-15 발행): 싱글 모드 광섬유 위의 25 Gb/s 동작 — 적어도 10 km(25GBASE-LR)와 40 km(25GBASE-ER) — 제목, 초록

쓰인 곳: (phase 72) 강의 수정 이력 L27, `ethernet.fast-gigabit`(802.3u의 발행 연도·공식 이름 100BASE-T와 그 묶음에 든 100BASE-TX·100BASE-FX, 802.3z·802.3ab·802.3ae·802.3an의 발행 연도), (phase 72에서 쓰일 곳) `ethernet.ethernet`, `ethernet.standard-names`

## (phase 72) IEEE 802.3 태스크 포스 목표 — 802.3ae, 802.3an, 802.3cc
https://www.ieee802.org/3/ae/objectives.pdf
https://www.ieee802.org/3/an/objectives.pdf
https://www.ieee802.org/3/cc/P802_3cc_Objectives.pdf

태스크 포스가 표준을 만들 때 정한 목표 목록이다(표준 본문이 아니다).

- 802.3ae(10 Gigabit Ethernet, 2001-07 정리판): 802.3/이더넷 프레임 형식과 최소·최대 프레임 크기를 유지하고, **전이중 동작만** 지원한다. 멀티 모드 광섬유(65 m·300 m)와
  싱글 모드 광섬유(2 km·10 km·40 km) 거리를 목표로 한다 — 1~2쪽
- 802.3an(10GBASE-T, 2003-09): 전이중 동작만 지원하고, 4쌍 트위스티드 페어 구리 배선으로 최대 100 m를 목표로 한다 — 2~3쪽
- 802.3cc(25 Gb/s 싱글 모드 광, 2016-01 승인): 전이중 동작만 지원하고, 싱글 모드 광섬유로 적어도 10 km와 40 km를 목표로 한다 — 2쪽

쓰인 곳: (phase 72) 강의 수정 이력 L27, (phase 72에서 쓰일 곳) `ethernet.fast-gigabit`, (phase 72 step 6) `hub-switch-vlan.duplex`(1초에 10기가비트 이상은 전이중만)

## (phase 72) IEEE 802.3 Working Group — 1997-07 플레너리 회의록
https://www.ieee802.org/3/minutes/july97/minutes.html

- 새 프로젝트의 「5 Criteria」 문안이 처음에는 진행 중인 프로젝트를 「802.3u Fast Ethernet」, 「802.3z Gigabit Ethernet」으로 적었다. 작업 그룹은 수정안으로
  「Fast Ethernet」을 「100BASE-T」로 바꿔 승인했고, 「Gigabit Ethernet」은 그대로 두었다 — 「Criteria #1」 동의안
- 그러니 「Fast Ethernet」은 작업 그룹 안에서도 쓰던 이름이지만, 802.3u의 공식 이름은 표준 제목의 「100BASE-T」다(위 IEEE SA 항목). 802.3ah-2004 머리말도 「Fast Ethernet이라고도 부른다」로 쓴다(위 항목)

쓰인 곳: `ethernet.fast-gigabit`(802.3u의 공식 이름은 100BASE-T이고 Fast Ethernet은 함께 쓰는 이름)

## (phase 72) RFC 894 — A Standard for the Transmission of IP Datagrams over Ethernet Networks
https://www.rfc-editor.org/rfc/rfc894

인터넷 표준(STD 41)이다(rfc-editor 상태).

- IP 데이터그램은 표준 이더넷 프레임에 담아 보내고, 그 프레임의 타입 필드는 16진 0800이다 — 「Frame Format」
- 이더넷으로 보내는 데이터 필드의 최소 길이는 46옥텟이고, 모자라면 0인 옥텟으로 채운다. 채운 옥텟은 IP 패킷의 일부가 아니다 — 「Frame Format」
- IP 브로드캐스트 주소는 모든 비트가 1인 이더넷 브로드캐스트 주소 FF-FF-FF-FF-FF-FF(16진)에 대응한다 — 「Broadcast Address」
- 주의: 같은 절의 1500옥텟 문장은 「minimum」이라고 적혀 있어 바로 뒤의 「최대 IP 데이터그램 1500옥텟」과 어긋난다. 최대 크기의 근거로는 이 문장이 아니라 IEEE 802.3 그림 3–1(위 항목)을 쓴다 — 「Frame Format」

쓰인 곳: `ethernet.mac-address`(브로드캐스트 주소), `ethernet.ethertype-length`(IPv4 데이터를 실은 프레임의 타입 0800, 채운 옥텟은 IP 패킷이 아니다)

## (phase 72) Linux man-pages — ether_aton(3), arp(8)
https://man7.org/linux/man-pages/man3/ether_aton.3.html
https://man7.org/linux/man-pages/man8/arp.8.html

2026-10-28에 읽은 판: ether_aton(3)은 Linux man-pages 6.19(2026-02-08), arp(8)은 net-tools(2025-09-10).

- 48비트 이더넷 주소를 글자로 적는 표준 꼴은 16진수를 콜론으로 이은 꼴이다. ether_aton()은 그 꼴의 글자를 이진값으로 바꾸고, ether_ntoa()는 거꾸로 바꾸면서 앞자리 0을 뺀다 — ether_aton(3) DESCRIPTION
- arp 명령에 이더넷 주소를 줄 때는 6바이트를 16진수로 적고 콜론으로 가른다 — arp(8) 「arp -s」

쓰인 곳: `ethernet.mac-address`(콜론 꼴 표기)

## (phase 72 step 2) IEEE 802 LAN/MAN Standards Committee — 홈페이지
https://www.ieee802.org/

IEEE 802 위원회의 홈페이지다. 작업 그룹 목록이 이 페이지에 있다. IEEE라는 약어의 풀네임은 이 페이지와 standards.ieee.org 「About」 페이지(https://standards.ieee.org/about/) 어디에도 적혀 있지 않아 쓰지 않는다(2026-10-28 확인).

- IEEE 802는 LAN/MAN Standards Committee(LMSC), 곧 LAN·MAN 표준을 만드는 위원회다 — 홈페이지 첫머리
- 802.3은 그 위원회의 Ethernet Working Group(이더넷 작업 그룹)이다 — 홈페이지의 작업 그룹 목록

쓰인 곳: `ethernet.ethernet`(IEEE 802 표준 위원회 안의 이더넷 작업 그룹이 IEEE 802.3을 만든다)

## (phase 72 step 1) IEEE 802.3 — Ethernet, 4.1.1 Overview, 4.1.2.2 Access interference and recovery, 4.2.3.2 Transmit media access management, 4.4 Specific implementations
https://www.ieee802.org/3/as/public/0503/4d0_1_CMP.pdf

위 「4.1.2 Normal operation …」 항목과 같은 IEEE P802.3as Draft 0.1(2005-03)의 4장이다. IEEE Std 802.3-2005 4장 본문을 싣고 있어 그 본문을 근거로 쓴다.

- MAC 부계층은 두 방식 가운데 하나로 동작한다. **반이중**에서는 여러 스테이션이 물리 매체 하나를 두고 다투며 CSMA/CD 절차를 따르고, 양쪽 통신은 프레임을 번갈아 빠르게 주고받아 이룬다.
  보내기와 받기를 동시에 하면 서로 방해되는 매체(예: 10BASE2, 100BASE-T4)에서는 반이중만 쓸 수 있다 — §4.1.1 a)
- **전이중**은 세 조건이 모두 맞을 때 쓴다 — 매체가 보내기와 받기를 동시에 해도 방해가 없고(예: 10BASE-T, 100BASE-TX), 그 LAN에 스테이션이 꼭 둘이며, 둘 다 전이중으로 설정돼 있다.
  둘뿐이라 매체를 두고 다툴 일이 없으므로 CSMA/CD 절차가 필요 없다 — §4.1.1 b)
- 전이중으로 가장 흔히 쓰는 구성은 가운데에 **브리지(스위치라고도 부른다)** 하나를 두고, 브리지 포트마다 장치 하나를 저만의 LAN으로 잇는 것이다 — §4.1.1
- CSMA/CD는 한 스테이션이 보낸 신호를 매체의 모두가 받는 LAN(로컬 영역 브로드캐스트 매체)을 위한 매체 접근 방식이다 — §4.1.1
- 충돌: 반이중에서 둘 이상의 스테이션이 같은 때 보내면, 미루기 규칙을 지켜도 서로의 전송을 방해할 수 있다. 전송이 겹친 이 다툼을 충돌이라 부른다.
  충돌은 반이중에서만, 공유 매체를 둘 이상이 쓰려 할 때 생긴다. 전이중에서는 두 스테이션이 서로에게 동시에 보내도 방해가 없고, 물리 계층이 충돌을 알려도 전이중 MAC은 무시한다 — §4.1.2.2
- 충돌이 나면 보내던 스테이션은 잼(jam)이라는 비트열을 보내 충돌이 다른 송신 스테이션에도 알려질 만큼 이어지게 한 뒤 전송을 멈추고, 무작위로 고른 시간 뒤 다시 보낸다.
  충돌이 거듭되면 그 무작위 시간을 고르는 범위를 시도마다 넓혀(백오프) 붐비는 매체에 맞춘다. 끝내 성공하거나, 매체가 고장 났거나 너무 붐빈다고 보고 포기한다 — §4.1.2.2
- 받는 쪽은 충돌로 생긴 조각 프레임을 올바른 프레임과 가려낸다 — §4.1.2.2
- 반이중의 미루기 규칙: 보낼 것이 없을 때도 MAC은 물리 계층이 주는 carrierSense 신호로 매체에 다른 전송이 있는지 **지켜본다**. 매체가 쓰이고 있으면 자기 전송을 미루고,
  지나가는 프레임이 끝난 뒤에도 프레임 사이 간격(interFrameSpacing)만큼 더 기다렸다가 보낸다. 전이중에서는 carrierSense를 보고 미루지 않는다.
  매체를 살피려고 스테이션이 따로 신호를 보내는 절차는 이 규칙에 없다 — §4.2.3.2.1 a)·b)
- 충돌 감지와 잼: collisionDetect 신호로 충돌을 알아채면 전송을 곧바로 끊지 않고 jamSize만큼 더 보낸다. 잼의 내용은 정해져 있지 않다(다만 그때까지 보낸 조각의 CRC 값이 되도록 일부러 만들지는 않는다) — §4.2.3.2.4
- 재전송: 충돌로 끝난 전송은 성공하거나 attemptLimit번을 모두 충돌로 마칠 때까지 다시 한다. 다시 보내기 전 기다리는 시간은 slotTime의 정수배이고,
  n번째 재전송 전에는 0 ≤ r < 2^k(k = min(n, 10)) 범위에서 고르게 뽑은 무작위 정수 r만큼 기다린다. 이 방법의 이름이 절단 이진 지수 백오프(truncated binary exponential backoff)다.
  attemptLimit번 모두 실패하면 오류로 알린다 — §4.2.3.2.5
- 전이중 스테이션은 받는 트래픽 때문에 미루지도, 전송을 끊거나 잼을 보내거나 백오프하지도 않는다. 프레임이 있으면 프레임 사이 간격만 지키고 보낸다 — §4.2.3.2.6
- 값(표 4–2): 10 Mb/s·100 Mb/s와 1 Gb/s에서 attemptLimit 16, backoffLimit 10, jamSize 32비트다. 10 Gb/s에는 slotTime·attemptLimit·backoffLimit·jamSize가 해당하지 않는다(반이중이 없다) — §4.4.2
- 한 네트워크의 스테이션은 모두 같은 방식(반이중이나 전이중)으로 설정해야 한다. **리피터나 공유 구간(mixing segment)에 이은 DTE는 모두 반이중으로 설정해야 한다.**
  두 DTE를 링크 구간으로 바로 이으면 두 장치가 같은 방식을 써야 한다 — §4.4.1

쓰인 곳: (phase 72 step 1) 강의 수정 이력 L30·L31, `exam-notes.md` E5·E6, (phase 72 step 6) `hub-switch-vlan.hub`(허브에 이은 장치는 반이중, 같은 때 보내면 충돌 — 한 줄), `hub-switch-vlan.duplex`(반이중·전이중의 뜻과 전이중의 세 조건, 전이중에서는 충돌이 없음, 반이중에서 차례를 정하는 절차 없이 매체를 듣고 미룸, 스위치 포트마다 장치 하나를 잇는 흔한 전이중 구성, 10 Gb/s에는 반이중이 없음), 문항 n035·n036 해설, (phase 72에서 쓰일 곳) `hub-switch-vlan.collision-domain`, `hub-switch-vlan.csma-cd`, `hub-switch-vlan.switch`

## (phase 72 step 1) IEEE 802.3 — Ethernet, 3.5 Elements of the Tagged MAC Frame
https://www.ieee802.org/3/as/public/0503/3d0_1_CMP.pdf

위 「3.2.9 … 3.4」 항목과 같은 IEEE P802.3as Draft 0.1(2005-03)의 3장이다. 이 초안이 싣고 있는 802.3-2005의 3.5 본문을 근거로 쓴다.

- 태그 붙은 MAC 프레임은 보통 프레임에 **4옥텟짜리 QTag 앞붙이**를 **출발지 주소 바로 뒤**, 원래의 길이/타입 필드 앞에 끼운 것이다. 그래서 프레임이 4옥텟 길어진다 — §3.5 a)·c), 그림 3–5
- QTag 앞붙이는 두 필드다 — 타입으로 읽히는 2옥텟 상수(802.1Q 태그 프로토콜 타입)와, 2옥텟짜리 태그 제어 정보(TCI) — §3.5 a)
- 태그 붙은 프레임의 그 자리 길이/타입 필드는 언제나 타입으로 읽고, 값은 **0x8100**(0x81-00)이다 — §3.5.4
- 태그 제어 정보는 3비트 사용자 우선순위, CFI 1비트, **12비트 VLAN 식별자(VID)**로 나뉜다. 그 뜻은 IEEE 802.1Q가 정한다(이 절은 참고용이다) — §3.5.5, 그림 3–5
- 원래의 길이/타입 필드는 QTag 앞붙이 뒤로 정확히 4옥텟 밀려난다. 프리앰블·SFD·주소·FCS는 보통 프레임과 같다 — §3.5.1~§3.5.3, §3.5.6, §3.5.8

쓰인 곳: (phase 72에서 쓰일 곳) `hub-switch-vlan.vlan-tagging`

## (phase 72 step 1) IEEE 802.3 개정 프로젝트의 의견 처리 기록 — 리피터 조항을 「새 설치에 권하지 않음」으로 정한 결정 (P802.3ay D1.0, P802.3bh D2.0·D3.0)
https://ieee802.org/3/axay/comments/D1.0/802.3ay_D1p0.pdf
https://ieee802.org/3/bh/comments/P802d3_802d3_bh_D2p0_All_Comment.pdf
https://www.ieee802.org/3/bh/comments/P802d3_802d3_bh_D3p0_All_Clause.pdf

세 문서 모두 IEEE 802.3 **개정 프로젝트의 투표 의견과 그 처리(응답) 기록**이다. 표준 본문이 아니다. P802.3ay는 IEEE Std 802.3-2008을, P802.3bh는 IEEE Std 802.3-2012를 만든 개정 프로젝트다
(다음 개정인 802.3bx의 의견 기록 제목이 「Revision to IEEE Std 802.3-2012」다 — https://www.ieee802.org/3/bx/comments/P8023-D2p0-Comments_Final_byCls.pdf).
의견 하나는 제안일 뿐이므로, 여기에는 **응답이 받아들임(ACCEPT, ACCEPT IN PRINCIPLE)으로 끝난 것**과 그 응답이 정한 문구만 적는다. 발행된 802.3 본문의 문구는 무료로 열리지 않아 직접 보지 못했다.

- P802.3ay D1.0(Maintenance #9 Revision, 의견 기록 2007-06-30) #104(41장, 1000 Mb/s 리피터): 의견은 1000 Mb/s 리피터가 상업적으로 거의 만들어지지 않았고 오래전부터 구할 수 없다며 이 조항에
  「새 설치에 권하지 않음」 주석을 달자고 했다. 응답은 ACCEPT IN PRINCIPLE이고, 정한 주석은 「이 리피터는 새 설치에 권하지 않는다. 2007년 5월부터 이 조항의 유지 보수 변경은 더 검토하지 않는다」라는 뜻이다.
  같은 기록 #121(41장의 표기 고치기)은 「이 조항은 폐기(deprecate)되는 중」이라는 이유로 거절됐다 — 의견 #104, #121(PDF 22쪽)
- P802.3bh D2.0(첫 작업 그룹 투표, 의견 기록 2011-09-22) #168: 의견은 쓰이지 않게 된 PHY에 「새 설치에 권하지 않음」 주석을 달자고 했다. 응답은 ACCEPT IN PRINCIPLE이고,
  대상으로 **10장(10BASE2), 17장, 9장(10 Mb/s 리피터), 27장(100 Mb/s 리피터), 41장(1000 Mb/s 리피터)**을 적었다 — 의견 #168(PDF 35쪽)
- P802.3bh D3.0(첫 스폰서 투표, 의견 기록 2012-04-16) #i-49: 13장(리피터를 쓸 때의 망 구성)은 이제 리피터를 쓸 때만 해당하는데 9장을 폐기했으니 13장도 같은 주석을 달자는 의견이다.
  응답은 ACCEPT IN PRINCIPLE이고, 정한 주석은 「이 조항은 새 설치에 권하지 않는 조항들과 관련되며, 이 조항도 새 설치에 권하지 않는다. 2012년 3월부터 유지 보수 변경은 더 검토하지 않는다」라는 뜻이다 — 의견 #i-49(PDF 12쪽)
- 같은 기록 #i-50: 의견은 「이제 공유 매체와 리피터가 모두 폐기됐다(새 설치에 권하지 않음). 남은 것은 전이중을 쓸 수 있는 점대점·점대다점 PHY뿐」이라 쓰고, 4장(반이중을 담은 CSMA/CD MAC)에도
  새 설치에 권하지 않는다는 주석을 달자고 했다. 응답은 **REJECT**다 — 영향이 넓어 다음 개정에서 따로 다루겠다고 했다. 그러니 **반이중·CSMA/CD 자체를 표준이 새 설치에 권하지 않는다고 정한 것은 아니다** — 의견 #i-50(PDF 12쪽)
- 주의: 리피터가 표준에서 사라진 것은 아니다. 2022년 P802.3da 태스크 포스는 10BASE-T1S 같은 새 PHY의 공유 구간에 쓸 리피터를 따로 정할지 논의했다 —
  https://www.ieee802.org/3/da/public/040622/zimmerman_3da_01_03312022.pdf 22쪽(802.3cg-2019가 9장 리피터를 10BASE-T1L·10BASE-T1S에 적용하지 않기로 했다는 것)
- (참고) 같은 P802.3bh D3.0 기록 #i-89(ACCEPT): IEEE Std 802.5는 토큰 링 표준이고 철회됐다. 마지막 개정은 802.5v-2001 「Gigabit Token Ring Operation」이다 — 의견 #i-89

쓰인 곳: (phase 72 step 6) `hub-switch-vlan.hub`(10·100 Mb/s와 1 Gb/s 리피터가 있다, 작업 그룹이 리피터 규격을 새 설치에 권하지 않고 더는 고치지 않기로 정함 — 1 Gb/s는 2007년, 10·100 Mb/s는 2011~2012년의 개정 작업, 규격을 지운 것은 아님), (phase 72에서 쓰일 곳) `hub-switch-vlan.csma-cd`(토큰 방식의 이름)

## (phase 72 step 1) IEEE 802.3 Working Group — ITU-T Q12/15에 보낸 회신 「Response to Progress on Ethernet related recommendations」(2003-07)
https://www.ieee802.org/1/files/public/docs2003/ITU%20Q12%20liaison%20from%20dot3.pdf

IEEE 802.3 작업 그룹이 2003년 7월 회의에서 승인해 ITU-T 15연구반 Q12에 보낸 공식 회신(communication statement)이다.

- IEEE 802 구조에서 이더넷 링크로 잇는 장치는 두 가지다 — DTE와 리피터. DTE는 호스트, 802.1D 브리지, 라우터 같은 장치다 — 「Response」 둘째 문단
- **리피터는 802.3이 정한 장치로, 반이중으로만 동작하고 CSMA/CD 장치 여럿이 한 매체에 접근하게(다중 포트 접근) 한다** — 「Response」 둘째 문단
- 2계층 네트워크 장치는 IEEE 802.1D 브리지로 모델링하라고 권한다 — 「Response」 권고 2)

쓰인 곳: (phase 72 step 1) 강의 수정 이력 L30, `exam-notes.md` E7, (phase 72 step 6) `hub-switch-vlan.hub`(리피터는 반이중으로만 동작하고 여러 장치가 한 매체를 함께 쓰게 한다), (phase 72에서 쓰일 곳) `hub-switch-vlan.switch`

## (phase 72 step 1) RFC 2108 — Definitions of Managed Objects for IEEE 802.3 Repeater Devices using SMIv2
https://www.rfc-editor.org/rfc/rfc2108

Proposed Standard(Standards Track)이다. IETF HUB MIB 작업 그룹이 만든 리피터 관리 MIB다.

- 이 MIB가 다루는 리피터는 IEEE 802.3의 9장(10 Mb/s 베이스밴드 리피터)과 27장(100 Mb/s 베이스밴드 리피터)이 정한 장치다 — §2.2
- 리피터는 비트 단위로 받아 다시 내보내는 장치이고, 들어오는 데이터를 패킷의 정보에 따라 처리하지 않는다 — §2.4.1.2
- 받은 신호를 다른 모든 포트로 내보낸다는 문장과 「충돌 도메인」의 정의는 이 RFC에 없다(전문 검색)

쓰인 곳: (phase 72 step 6) `hub-switch-vlan.hub`(표준의 이름은 리피터, 비트 단위로 받아 다시 내보내고 담긴 내용을 읽지 않는 물리 계층 장비), 문항 n035 해설

## (phase 72 step 1) IEEE SA — 802.1D-2004, 802.1Q-2022 표준 소개 페이지
https://standards.ieee.org/ieee/802.1D/3387/
https://standards.ieee.org/ieee/802.1Q/10323/

- 802.1D-2004 「MAC Bridges」(2004-06-09 발행, 지금은 802.1Q-2014에 합쳐져 Superseded): IEEE 802 LAN을 MAC 서비스 경계 아래에서 잇는 구조를 정한다. 이 표준의 MAC 브리지는 **저마다 MAC을 가진 서로 다른 LAN**에 붙은
  스테이션들이, LLC와 네트워크 계층 프로토콜이 보기에 같은 LAN에 있는 것처럼 통신하게 한다 — 초록
- 802.1Q-2022 「Bridges and Bridged Networks」(2022-12-22 발행, Active): 브리지 네트워크가 MAC 서비스를 어떻게 지원하는지와, MAC 브리지·VLAN 브리지의 동작(관리·프로토콜·알고리즘)을 정한다 — 초록

쓰인 곳: (phase 72 step 1) 강의 수정 이력 L30, (phase 72에서 쓰일 곳) `hub-switch-vlan.switch`(표준의 이름은 브리지), `hub-switch-vlan.collision-domain`(브리지는 포트마다 다른 LAN을 잇는다), `hub-switch-vlan.vlan`

## (phase 72 step 1) IEEE 802.1 — IETF 86 Tutorial 「IEEE 802.1Q Media Access Control Bridges and Virtual Bridged Local Area Networks」(2013-03-10)
https://www.ieee802.org/802_tutorials/2013-03/8021-IETF-tutorial-final.pdf

IEEE 802.1 작업 그룹 사람들(P. Thaler, N. Finn 외)이 IETF 86에서 802.1Q를 소개한 튜토리얼 자료다(표준 본문이 아니다).

- 브리지는 **목적지 MAC 주소**와 VLAN ID(VID)를 보고 프레임을 전달한다 — 12쪽
- 프레임을 어디로 보낼지 모르면 그 프레임의 VLAN 안에서 **받은 포트를 뺀 모든 포트**로 내보낸다. 어디로 보낼지 알면 필요 없는 포트로는 내보내지 않는다(목적지 쪽으로만 내보낸다) — 12쪽
- 브로드캐스트와 목적지를 모르는 유니캐스트는 그 VLAN에 플러딩되는 프레임의 예다 — 27쪽(MVRP 설명)
- 활성 토폴로지(실제로 프레임이 다니는 경로)를 정하는 프로토콜로 RSTP·MSTP·SPB가 있다. **처음의 스패닝 트리 프로토콜(STP)은 이제 역사 속 이름이고 RSTP가 그 자리를 이었다** — 26쪽
- 802.1Q는 12비트 VLAN만 다루는 표준이 아니다(서비스·백본 태그 등도 있다) — 16쪽
- (phase 72 step 3) MAC은 Media Access Control의 약어다 — 문서 제목(「IEEE 802.1Q Media Access Control Bridges …」)

쓰인 곳: (phase 72 step 1) 강의 수정 이력 L32, `exam-notes.md` E4, (phase 72 step 3) 문항 n030 해설(MAC의 풀네임), (phase 72에서 쓰일 곳) `hub-switch-vlan.switch`, `hub-switch-vlan.flooding-forwarding-filtering`, `hub-switch-vlan.stp`, `hub-switch-vlan.broadcast-domain`

## (phase 72 step 1) IEEE 802.1 — 802.1w Rapid Reconfiguration of Spanning Tree 프로젝트 페이지
https://www.ieee802.org/1/pages/802.1w.html

IEEE 802.1 작업 그룹의 프로젝트 페이지다. 프로젝트는 끝났고 802.1D-2004에 합쳐졌다.

- 802.1w는 802.1D-1998을 보완해 MAC 브리지가 빠르게 다시 구성되게 하는 변경을 정했다 — 프로젝트 설명 첫 문단
- 동기: 그때의 스패닝 트리 프로토콜은 **링크가 끊기거나 되살아날 때 다시 구성해 서비스를 되살리는 데** 시간이 오래 걸렸다 — 프로젝트 설명의 첫 항목

쓰인 곳: (phase 72에서 쓰일 곳) `hub-switch-vlan.stp`(쓰던 길이 끊기면 다시 구성한다)

## (phase 72 step 1) RFC 4188 — Definitions of Managed Objects for Bridges
https://www.rfc-editor.org/rfc/rfc4188

Proposed Standard(Standards Track)이다. IEEE 802.1D-1998의 투명 브리지를 관리하는 MIB다.

- 브리지는 네트워크 계층 아래에서 LAN 구간들을 잇는 장치다. 투명 브리징은 IEEE 802.1D가 정한다 — §3
- 전달 데이터베이스(dot1dTpFdbTable)의 항목은 유니캐스트 MAC 주소와, **출발지 주소가 그 주소인 프레임이 들어온 포트의 번호**를 짝짓는다. 항목 상태에는 배운 것(learned)·관리자가 넣은 것(mgmt) 등이 있다 — §4 dot1dTpFdbAddress·dot1dTpFdbPort·dot1dTpFdbStatus
- 동적으로 배운 전달 정보를 지우기까지의 시간이 dot1dTpAgingTime(초)이고, **802.1D-1998은 기본값 300초를 권한다** — §4 dot1dTpAgingTime(REFERENCE 802.1D-1998 14.7.1.1.3)
- 전달 과정이 걸러 버린(filtered) 프레임의 수를 센다 — §4 dot1dTpPortInDiscards
- 스패닝 트리 프로토콜이 정하는 포트 상태는 disabled·blocking(차단)·listening·learning(학습)·forwarding(전달)·broken이고, 그 상태가 포트가 받은 프레임을 어떻게 다룰지 정한다 — §4 dot1dStpPortState(REFERENCE 802.1D-1998 8.5.5.2)
- 스패닝 트리에는 뿌리(루트)가 있고 스패닝 트리 프로토콜이 그것을 정한다 — §4 dot1dStpDesignatedRoot
- 이 RFC는 학습·플러딩의 절차와 고리를 설명하지 않는다(전문 검색) — 그 근거는 위 802.1 튜토리얼과 아래 RFC 7348이다

쓰인 곳: (phase 72에서 쓰일 곳) `hub-switch-vlan.switch`, `hub-switch-vlan.mac-address-table`, `hub-switch-vlan.flooding-forwarding-filtering`(필터링), `hub-switch-vlan.stp`

## (phase 72 step 1) RFC 4363 — Definitions of Managed Objects for Bridges with Traffic Classes, Multicast Filtering, and Virtual LAN Extensions
https://www.rfc-editor.org/rfc/rfc4363

Proposed Standard(Standards Track)이다. IEEE 802.1Q-2003의 VLAN을 관리하는 Q-BRIDGE MIB다.

- 이 MIB는 **포트 기반 VLAN**을 다룬다 — 프레임이 들어온 브리지 포트로 VLAN 소속이 정해지는 VLAN이다. 802.1Q에는 포트와 프로토콜로 정하는 VLAN도 있지만 이 MIB 밖이다 — §2
- PVID는 포트로 들어온 **태그 없는 프레임**(과 우선순위 태그만 붙은 프레임)에 매기는 VLAN ID다 — §5 dot1qPvid(REFERENCE 802.1Q 12.10.1.1)
- 포트가 태그 없는 프레임을 받을지는 설정으로 정한다 — 모두 받거나(admitAll, 받으면 PVID로 VLAN을 매긴다), 태그 붙은 프레임만 받는다(admitOnlyVlanTagged) — §5 dot1qPortAcceptableFrameTypes
- 입력 필터링을 켜면 그 포트가 들어 있지 않은 VLAN의 프레임은 버린다 — §5 dot1qPortIngressFiltering
- VLAN마다 그 VLAN의 프레임을 내보내는 포트 묶음(egress ports)이 있고, 그 가운데 **태그를 떼고 내보내는 포트 묶음(untagged ports)**을 따로 둔다. 나머지 포트는 태그를 붙인 채 내보낸다 — §5 dot1qVlanStaticEgressPorts·dot1qVlanStaticUntaggedPorts·dot1qVlanCurrentEgressPorts·dot1qVlanCurrentUntaggedPorts
- 802.1Q VLAN ID로 쓰는 값은 1~4094다. 0과 4095는 쓰지 않는다 — §5 VlanId·VlanIndex
- MAC 주소로 VLAN을 정하는 방식은 이 RFC에 없다 — 강의 p105의 MAC 주소 기반 VLAN은 강의 사실로만 쓴다

쓰인 곳: `exam-notes.md` E4, (phase 72에서 쓰일 곳) `hub-switch-vlan.vlan-membership`(포트 기반 VLAN), `hub-switch-vlan.vlan-tagging`(태그 붙은 포트·안 붙은 포트, VLAN ID 범위)

## (phase 72 step 1) RFC 7348 — Virtual eXtensible Local Area Network (VXLAN)
https://www.rfc-editor.org/rfc/rfc7348

Informational(Independent Submission)이다. VXLAN을 만든 까닭을 설명하면서 2계층 네트워크의 STP와 VLAN을 정리한 부분만 쓴다.

- 2계층 네트워크는 중복 경로 때문에 생기는 고리를 피하려고 IEEE 802.1D의 스패닝 트리 프로토콜(STP)을 쓴다. **STP는 일부 링크를 쓰지 못하게 막아 프레임이 복제되고 고리를 도는 것을 막는다** — §3.1
- 그래서 STP를 쓰면 사 둔 포트·링크 가운데 일부를 쓰지 못하고, 여러 경로로 나눠 보내는 데서 오는 회복력도 얻지 못한다 — §3.1
- VLAN은 브로드캐스트를 격리하는 데 쓴다. **이더넷 프레임에 담는 12비트 VLAN ID로 큰 2계층 네트워크를 여러 브로드캐스트 도메인으로 나눈다.** VLAN은 4094개까지다 — §3.1
- STP로 고리 없는 토폴로지를 만들면 쓰지 못하는 링크가 많이 생길 수 있다 — §1

쓰인 곳: (phase 72에서 쓰일 곳) `hub-switch-vlan.stp`, `hub-switch-vlan.broadcast-domain`, `hub-switch-vlan.vlan`, `hub-switch-vlan.vlan-tagging`(VLAN ID 12비트)

## (phase 72 step 1) RFC 5517 — Cisco Systems' Private VLANs: Scalable Security in a Multi-Client Environment
https://www.rfc-editor.org/rfc/rfc5517

Informational(Independent Submission)이다. 시스코 사설 VLAN을 설명하는 문서인데, VLAN 일반을 말한 두 문장만 쓴다. 사설 VLAN 자체는 쓰지 않는다.

- **VLAN 하나는 그 안의 호스트들이 2계층에서 서로 바로 통신할 수 있는 브로드캐스트 도메인이다** — §1
- (보통의 구성에서) VLAN마다 서브넷을 따로 둔다 — §1.2

쓰인 곳: `exam-notes.md` E4, (phase 72에서 쓰일 곳) `hub-switch-vlan.broadcast-domain`, `hub-switch-vlan.vlan`

## (phase 72 step 1) RFC 1812 — Requirements for IP Version 4 Routers
https://www.rfc-editor.org/rfc/rfc1812

Proposed Standard(Standards Track)이다.

- 링크 계층에서 동작하는 패킷 교환 장치는 보통 브리지라고 부른다. 네트워크들을 잇는 IP 데이터그램 전달 장치는 라우터라고 부른다 — §2.2.3
- 라우터는 **링크 계층 브로드캐스트로 받은 패킷을 다른 네트워크로 넘기지 않는다**(목적지가 IP 멀티캐스트 주소인 경우만 예외다). 링크 계층 멀티캐스트로 받은 패킷도 목적지가 IP 멀티캐스트가 아니면 넘기지 않는다 — §5.3.4
- 링크 계층은 받은 패킷의 목적지 물리 주소가 유니캐스트·브로드캐스트·멀티캐스트 가운데 무엇인지 IP 계층에 알려야 한다 — §3.2

쓰인 곳: `exam-notes.md` E4·E7, (phase 72에서 쓰일 곳) `hub-switch-vlan.switch`(브리지는 링크 계층 장치), `hub-switch-vlan.broadcast-domain`(라우터가 경계가 된다)

## (phase 72 step 1) NIST SP 800-125B — Secure Virtual Network Configuration for Virtual Machine (VM) Protection (2016-03)
https://csrc.nist.gov/pubs/sp/800/125/b/final

NIST 특별 간행물이다. 위 csrc.nist.gov 페이지가 링크한 본문 PDF(https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-125B.pdf)의 2.4절만 쓴다.

- VLAN은 처음에 데이터 센터에서 관리를 쉽게 하려고(예: 브로드캐스트를 가두려고) 썼고, 트래픽을 격리하므로 네트워크를 나누는 보안 수단으로도 가치가 있었다 — §2.4
- 물리 스위치에서는 포트 하나 이상에 VLAN ID를 매겨 VLAN을 정하고, 그 포트에 이은 호스트가 그 VLAN의 구성원이 된다. 그렇게 **물리적 위치와 상관없이** 서버를 논리적으로 묶는다 — §2.4
- 여러 VLAN의 트래픽을 받고 보낼 수 있게 설정한 물리 스위치 포트를 **트렁크 포트**(trunking ports)라 부르고, 그런 링크를 트렁크 링크라 부른다 — §2.4, §3
- VLAN으로 나눈 무리의 트래픽은 다른 무리의 트래픽과 격리된다. 예를 들어 웹 서버·응용·데이터베이스 층마다 VLAN을 따로 두고 **층 사이의 트래픽은 방화벽 규칙으로 통제**할 수 있다.
  VLAN마다 다른 QoS 규칙도 줄 수 있다 — §2.4
- VLAN ID가 12비트라 VLAN은 4000개 남짓까지만 정할 수 있다 — §2.4.1·§2.4.2

쓰인 곳: (phase 72에서 쓰일 곳) `hub-switch-vlan.vlan`(VLAN마다 다른 보안 정책), `hub-switch-vlan.vlan-tagging`(트렁크라는 낱말)

## (phase 72 step 1) Cisco — Catalyst 9200 「VLAN Configuration Guide, Cisco IOS XE 17.14.x」와 Catalyst 2960-L 「VLAN Configuration Guide, Cisco IOS Release 15.2(7)E」의 Configuring VTP
https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9200/software/release/17-14/configuration_guide/vlan/b_1714_vlan_9200_cg/configuring_vtp.html
https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960l/software/15-2_7_e/configuration_guide/vlan/b_1527e_vlan_2960l_cg/m_vlan_vtp_cg.html

시스코 스위치의 설정 가이드(제품 문서)다. VTP(VLAN Trunking Protocol)는 시스코가 만든 프로토콜이라 이 문서를 출처로 쓴다. 2026-10-28에 읽은 판: Catalyst 9200 IOS XE 17.14.x(2024-04-05 고침),
Catalyst 2960-L IOS 15.2(7)E(2020-09-17 고침). **제품과 판마다 달라질 수 있다.** VLAN·태그·트렁크의 일반 사실은 여기서 가져오지 않는다.

- VTP는 VLAN 설정이 어긋나지 않게 맞추는 2계층 메시지 프로토콜이다. VTP 도메인(VLAN 관리 도메인)은 서로 이은 장치 하나 이상으로 이루어지고, 같은 도메인의 장치는 모두 같은 도메인 이름을 써야 한다 — 9200 「Information About VTP」의 「VTP」·「VTP Domain」
- VTP 도메인의 장치는 **트렁크 포트마다** 설정 정보를 주기적으로 알린다(advertisement). 그래서 트렁크 포트가 적어도 하나 있어야 하고, VTP는 트렁크 모드 포트에서만 켤 수 있다 —
  9200 「VTP Advertisements」·「Prerequisites for VTP」·「Configuring VTP on a Per-Port Basis」
- 모드 넷: **서버**(VLAN을 만들고 고치고 지울 수 있다. 기본 모드), **클라이언트**(알림을 주고받지만 그 장치에서 VLAN을 만들거나 고치거나 지울 수 없다),
  **트랜스페어런트**(VTP에 참여하지 않는다 — 자기 VLAN 설정을 알리지 않고 받은 알림으로 맞추지도 않는다. 버전 2·3에서는 받은 알림을 트렁크로 넘겨준다),
  **off**(트랜스페어런트와 같되 받은 알림을 트렁크로 넘기지도 않는다) — 9200·2960-L 「VTP Modes」 표
- 두 문서 모두 off 모드를 특정 VTP 버전에 묶어 적지 않는다(명령 문법 `vtp mode {client | server | transparent | off}`). 「off는 버전 3에만 있다」는 이 두 문서로 확인하지 못했다 — 9200·2960-L 「VTP Modes」
- 버전은 1·2·3이 있고 기본은 버전 1이다 — 9200 「VTP Version 2」·「VTP Version 3」

쓰인 곳: `exam-notes.md` E8, (phase 72에서 쓰일 곳) `hub-switch-vlan.vlan-tagging`(끝 문단 VTP)

## (phase 72 step 4) MDN — Grammar and types, Integer literals
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#integer_literals

2026-10-28 확인. MAC 주소의 16진 표기를 이해하는 바탕만 가져온다. JavaScript 문법은 학습 범위에 넣지 않는다.

- 16진 정수 표기는 0~9와 A~F(또는 a~f)를 쓴다. A는 10, F는 15이고, 대소문자가 값에 영향을 주지 않는다 — 「Integer literals」
- 2진 표기는 0과 1만 쓴다 — 같은 절. 두 자리 16진수 = 8비트라는 묶음은 RFC 9542 §1.1의 옥텟 표기와 RFC 791 Glossary의 옥텟 정의로 뒷받침한다.

쓰인 곳: `ethernet.mac-address`(16진수의 뜻·대소문자)
