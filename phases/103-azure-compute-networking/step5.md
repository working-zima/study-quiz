# Step 5: networking-sources

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획과 결정은 `phases/103-azure-compute-networking/guide.md`에 있다. step 0~4가 주제 `azure-compute`를 끝냈다.
step 6~9가 주제 `azure-virtual-networking`(가상 네트워크와 연결)의 개념 8개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고,
덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다.

이 주제의 중심 문제는 셋이다.
(1) **Learn 단원이 옮겨졌다** — 네트워킹 단원이 새 모듈 「Describe Azure networking services」로 갔다(guide.md 「출처」). 앞 phase 항목이 옛 주소를 가리키면 새 주소로 확인하고, 내용이 바뀐 곳을 적는다.
(2) **덤프 답이 공식 문서와 어긋나 보이는 문항** — 설계 때 본 예: NO.288은 가상 네트워크에서 스토리지 계정으로 가는 트래픽이 인터넷을 거치지 않게 하는 것을 NSG로 적는다. NO.86의 세 진술(같은 지역의 가상 네트워크가 기본으로 이어지는가 등).
(3) **「VM끼리 통신을 막으려면 다른 가상 네트워크에」라는 덤프의 되풀이**(NO.184·395·451·474) — 가상 네트워크의 격리가 공식 문서의 어느 말로 서는지, 그 덤프 답이 맞는지.

## 읽어야 할 파일

- `phases/103-azure-compute-networking/guide.md` — 특히 「배경」(쓰지 않는 것), 「세 주제와 개념 21개」의 `azure-virtual-networking` 표, 「한국어판에서 본 것」, 「예시 값」, 「출처」, 「출처 step(0·5·10)의 공통 형식」
- `phases/103-azure-compute-networking/index.json`의 step 0 `summary` — 마지막 D·G 번호, 출처 step이 정한 방식
- `docs/source/azure/CLAUDE.md` — **이 규칙을 따른다**
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — 이미 있는 항목 「(phase 100) Azure ExpressRoute — What is Azure ExpressRoute?」, 「(phase 102) Azure DNS — Azure DNS overview」, 「(phase 102) Azure Virtual Network — What is Azure Virtual Network?」, step 0이 더한 항목과 「한국어 표기 정리 — `azure-compute`」를 먼저 읽는다
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `virtual-networking`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다
  (설계 때 본 것: NO.29·32·86·119·180·184·252·263·288·295·342·395·451·474·497). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/2-architecture-services.md`의 가상 네트워크·서브넷·피어링·VPN Gateway·ExpressRoute·DNS 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — guide.md 「출처」의 네트워킹 목록(Learn 단원 넷과 `ko-` 판, 제품 문서 셋)
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

받는 법과 이름 규칙은 step 0과 같다(`python3 -I scripts/azure-source/fetch_page.py …`, 인증서 오류면 `SSL_CERT_FILE=/etc/ssl/cert.pem`). 영문판으로 사실을, 한국어판으로 표기만 본다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `virtual-network` | 가상 네트워크의 정의와 하는 일 일곱(격리와 분할, 인터넷 통신, Azure 리소스 사이, 온-프레미스와, 트래픽 경로, 트래픽 거르기, 가상 네트워크 잇기), **격리** — 다른 가상 네트워크의 리소스와 기본으로 통신하지 않는다는 것의 현행 문서의 말, 사설 IP 주소 공간을 정하고 그 범위는 인터넷에서 경로가 잡히지 않는다는 것, 인터넷에서 들어오는 연결(공용 IP 주소, 공용 부하 분산 장치), 이름 확인(Azure 제공 / 내부·외부 DNS 서버), 가상 네트워크가 지역 하나·구독 하나에 속하는지. **NO.86**: 같은 지역에 배포한 가상 네트워크끼리 기본으로 이어지는가, 같은 리소스 그룹 안의 가상 네트워크 이름이 달라야 하는가, 주소 공간이 구독 안에서 겹치면 안 되는가 — 그림의 정답을 보고 공식 문서(가상 네트워크 FAQ 등)와 맞춰 본다. **NO.184·395·451·474**: VM끼리 통신을 막으려고 다른 가상 네트워크에 두는 것이 맞는 답인지(같은 가상 네트워크 안에서는 NSG로도 막을 수 있다는 것도 확인). **온-프레미스**·**IP 주소**·**DNS**를 한 줄로 풀 근거 | Learn 단원 2(받아 둠), 가상 네트워크 개요(받아 둠), 가상 네트워크 FAQ(`learn.microsoft.com/azure/virtual-network/virtual-networks-faq`) |
| b | `subnets` | 서브넷의 정의(가상 네트워크의 주소 공간을 나눈 부분), 나누는 까닭(현행 문서의 말로), **같은 가상 네트워크 안의 서브넷끼리 Azure가 기본으로 트래픽을 보낸다**는 것(Learn 단원 2 「Route network traffic」, 가상 네트워크 트래픽 라우팅 문서), 서브넷 사이 트래픽을 NSG로 거를 수 있다는 것. 덤프 NO.342 | Learn 단원 2, 가상 네트워크 개요, 「Virtual network traffic routing」(`learn.microsoft.com/azure/virtual-network/virtual-networks-udr-overview`) — 기본 경로가 있다는 사실만 |
| c | `peering` | 피어링의 정의(두 가상 네트워크를 직접 잇는다), 트래픽이 사설이고 Microsoft 백본으로 다니며 공용 인터넷에 들어가지 않는다, 다른 지역끼리도(전역 피어링 — 현행 이름과 한국어 표기), 다른 구독·다른 테넌트의 가상 네트워크도 잇는지, **비전이성**(A-B, B-C를 이어도 A-C는 이어지지 않는다)의 현행 문서의 말, **Microsoft 백본 네트워크**를 한 줄로 풀 근거. 덤프 NO.252 | Learn 단원 2, 피어링 개요(`learn.microsoft.com/azure/virtual-network/virtual-network-peering-overview`)와 한국어판 |
| d | `endpoints` | **엔드포인트**의 뜻(서비스에 닿는 접속 지점 — 공식 문서가 정의하는 말이 있으면 그 말로), 퍼블릭 엔드포인트(공용 IP 주소, 어디서나 닿음)와 프라이빗 엔드포인트(가상 네트워크 안, 그 가상 네트워크의 주소 공간에서 받은 사설 IP 주소)의 정의, 프라이빗 엔드포인트가 무엇에 닿게 하는가(Private Link로 제공되는 Azure 서비스 — 예: 스토리지 계정), 그 트래픽이 공용 인터넷을 지나지 않는가의 현행 문서의 말, **Private Link**·**스토리지 계정**을 한 줄로 풀 근거, 표기(「퍼블릭」/「공용」 — 한국어판이 엔드포인트와 IP 주소를 다르게 적는다). **NO.288**: 덤프 답(NSG)이 맞는지 — 공식 문서로 맞는 답(서비스 엔드포인트나 프라이빗 엔드포인트)을 확인해 D 항목으로. 이 주제는 서비스 엔드포인트를 쓰지 않는다(guide.md 「배경」) — 처리 줄에 그렇게 적는다 | Learn 단원 2, 프라이빗 엔드포인트 개요(`learn.microsoft.com/azure/private-link/private-endpoint-overview`)와 한국어판, 공용 IP 주소(`learn.microsoft.com/azure/virtual-network/ip-services/public-ip-addresses`) |
| e | `vpn-gateway` | **VPN**의 정의(믿을 수 없는 네트워크 너머로 사설 네트워크를 잇는 암호화된 터널), VPN 게이트웨이의 정의(가상 네트워크 게이트웨이의 한 종류), **전용 서브넷**에 배포한다(그 서브넷의 이름 — 예: GatewaySubnet — 과 한국어 표기), 인터넷을 건너는 데이터가 암호화된다, **가상 네트워크마다 VPN 게이트웨이 하나**와 게이트웨이 하나로 여러 곳에 이음, **사이트 간 연결에 필요한 리소스**(VPN 게이트웨이, 로컬 네트워크 게이트웨이, 연결, 온-프레미스의 VPN 장치 — 현행 사이트 간 연결 문서의 말로), **로컬 네트워크 게이트웨이**의 정의(온-프레미스 VPN 장치와 네트워크를 Azure에서 나타내는 것), 기본 활성/대기 구성(한 줄로 쓸 것만). 정책 기반·경로 기반, 활성/활성, 영역 중복 게이트웨이는 「쓰지 않는다」로 기록만. **NO.29**(온-프레미스와 잇는 데 만들 리소스 둘 — 덤프 답 「가상 네트워크 게이트웨이·게이트웨이 서브넷」이 맞는지), **NO.32·497**(온-프레미스 VPN 장치를 Azure에서 나타내는 것), NO.180 | Learn 단원 3(받아 둠), VPN Gateway 개요(`learn.microsoft.com/azure/vpn-gateway/vpn-gateway-about-vpngateways`), 사이트 간 연결 만들기(`learn.microsoft.com/azure/vpn-gateway/tutorial-site-to-site-portal`), 한국어판 |
| f | `vpn-connection-types` | 연결 셋의 정의와 한국어 표기 — 사이트 간(온-프레미스 VPN 장치와), 지점 및 사이트 간(컴퓨터 한 대가 — 그 컴퓨터가 연결을 시작한다), VNet 간(다른 가상 네트워크와). 한국어판이 「지점 및 사이트 간」과 「지점 간」을 섞어 쓰므로 제품 문서 한국어판까지 보고 하나로 정한다. NO.180·263 | Learn 단원 2·3, VPN Gateway 개요와 한국어판 |
| g | `expressroute` | ExpressRoute의 정의(연결 공급자의 도움으로 온-프레미스를 사설 연결로 Microsoft 클라우드에), **ExpressRoute 회로**, 공용 인터넷을 지나지 않는다와 그 결과(안정성·속도·고른 대기 시간·보안), Microsoft 365에도 닿는다, 특징(지정학적 지역 안 모든 지역, Global Reach, BGP 동적 라우팅, 피어링 위치마다 중복), 고르는 때, **ExpressRoute를 써도 공용 인터넷으로 가는 것**(DNS 쿼리·인증서 해지 목록 확인·CDN 요청), VPN 게이트웨이를 ExpressRoute의 대체 경로로. **BGP**·**라우팅**·**연결 공급자**를 한 줄로 풀 근거. phase 100 항목에 이미 있는 사실은 다시 적지 않는다. **NO.119**: ExpressRoute가 동작하는 계층을 공식 문서가 말하면 사실만 적고 「쓰지 않는다」(guide.md 「배경」). NO.252·263·295 | Learn 단원 4(받아 둠), ExpressRoute 소개(받아 둠) |
| h | `azure-dns` | Azure DNS의 정의(DNS 도메인을 Azure 인프라에서 호스트), 같은 자격 증명·API·도구·청구, 이점(애니캐스트로 가장 가까운 이름 서버, Azure Resource Manager 기반의 접근 제어·활동 로그·리소스 잠금, 포털·PowerShell·CLI, 사설 도메인, 별칭 레코드), **도메인 이름을 살 수 없다**(App Service 도메인·다른 등록 기관에서 사서 Azure DNS에 호스트). **DNS**·**레코드**·**애니캐스트**를 한 줄로 풀 근거. phase 102 항목에 이미 있는 사실은 다시 적지 않는다 | Learn 단원 5(받아 둠), DNS 개요(받아 둠) |
| i | 도식 | `VnetIsolationDiagram`(가상 네트워크 A의 서브넷 둘에 VM 1·VM 2, 가상 네트워크 B에 VM 3 — 같은 가상 네트워크 안은 통신, 다른 가상 네트워크와는 기본으로 통신하지 않음), `VnetPeeringDiagram`(지역 A의 가상 네트워크 둘과 지역 B의 가상 네트워크 하나 — 백본으로 다니는 피어링 트래픽), `PrivateEndpointDiagram`(스토리지 계정에 닿는 퍼블릭 엔드포인트와 프라이빗 엔드포인트), `SiteToSiteVpnDiagram`(온-프레미스 VPN 장치·로컬 네트워크 게이트웨이·게이트웨이 서브넷의 VPN 게이트웨이, 집의 컴퓨터), `ExpressRouteDiagram`(연결 공급자를 거친 사설 연결과 인터넷 위의 VPN)의 라벨·곁말·캡션의 사실마다 근거가 a~g에 있는지 | a~g의 결과 |

빠진 것을 읽다가 찾으면 더한다. 덤프 문항(위 번호)과 용어집 항목을 하나씩 읽어 공식 문서와 다른 주장이 더 있는지 본다.
NO.263·288은 다른 주제와 함께 걸린 문항이다 — step 0이나 앞 phase의 D 항목에 이미 있으면 새로 만들지 말고 summary에 그 번호를 적는다.

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·5·10)의 공통 형식」대로. 이미 있는 항목(가상 네트워크 개요·ExpressRoute 소개·DNS 개요)에는 사실 줄을 덧붙이고(끝에 `(phase 103)`), Learn 단원 넷은 새 모듈 이름(「Describe Azure networking services」)으로 새 항목을 둔다.
「(phase 102) Azure Virtual Network — What is Azure Virtual Network? (한 줄 풀이만)」 항목은 제목의 「(한 줄 풀이만)」을 그대로 두고 아래에 덧붙인다.
끝에 「한국어 표기 정리 — `azure-virtual-networking`」 항목 — 개념 8개와 목록 항목 이름(엔드포인트 둘, 연결 유형 셋)마다 고른 표기와 근거 문서, 섞여 쓰인 표기(퍼블릭/공용, 지점 및 사이트 간/지점 간, VPN 게이트웨이/가상 네트워크 게이트웨이)와 고른 까닭.

### 3. `docs/source/azure/corrections.md`에 더한다

step 0이 쓴 마지막 번호 다음부터(D·G 모두). 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.288** — 가상 네트워크에서 스토리지 계정으로 가는 트래픽을 인터넷에서 떼는 것을 NSG로 적는다.
- **NO.86** — 세 진술의 덤프 답이 공식 문서와 맞는지.
- **NO.29·32·497** — VPN에 필요한 리소스, 로컬 네트워크 게이트웨이.
- **NO.184·395·451·474** — 덤프끼리 답이 갈리면(같은 「해결책」 연작에서) 항목으로.
- 용어집 항목의 옛 이름·틀린 주장(예: 피어링이 인터넷을 거친다, ExpressRoute가 암호화한다 같은 것이 있으면).

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-virtual-networking`의 개념 8개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**.
목록 개념(`endpoints`·`vpn-connection-types`)은 항목 이름도. 위 표의 a~i마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다.
특히 (1) 가상 네트워크의 격리를 쓸 말과 NO.184 무리의 처리, (2) 피어링의 비전이성·다른 구독, (3) 퍼블릭/공용 표기, (4) 사이트 간 연결에 필요한 리소스와 로컬 네트워크 게이트웨이의 정의, (5) 연결 유형 셋의 표기,
(6) 도식 다섯에 쓸 수 있는 사실과 이름. 받은 파일 목록(`raw/official/`). 마지막 D·G 번호. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·5·10)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작 값은 step 4가 끝났을 때의 수 — step 4 summary).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/103-azure-compute-networking/index.json`의 step 5를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 6~9가 쓴다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.**
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.**
- **NSG·Azure Firewall·DDoS Protection의 사실을 이 step에서 정리하지 마라.** 이유: step 10의 범위다. 이 주제의 글이 NSG를 한 줄로 풀 근거(무엇을 하는지)만 적는다.
- **step 0이 더한 항목과 `azure-compute`의 표기 정리를 고치지 마라.** 이유: 앞 step의 기록이다. 고칠 것을 찾으면 summary에 적는다.
- **`topic-map.md`·`dump-topics.tsv`를 고치지 마라.**
