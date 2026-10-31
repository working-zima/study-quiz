# phase 103 검증 보고

확인한 날: 2026-11-01(Mac). 브랜치 `feat-103-azure-compute-networking`(origin/develop `c658d15`에서 분기), 설계 커밋 `d8309d2`, phase 완료 커밋 `b65f4bd`, 마무리 수정 `b44c0e6`.
설계는 사용자가 승인했다(「응」). 실행은 저장소 밖 `aws-quiz-p103-sup/`의 supervisor로 세 덩어리(step 0~4 / 5~9 / 10~12)를 돌렸다. codex가 기본이고, 사용량 한도면 같은 step을 Claude가 처음부터 다시 실행한다.

## step별 결과

| step | 맡은 쪽 | 끝난 때 | 결과 | 테스트 |
|---|---|---|---|---|
| 0 compute-sources | codex 한도 → Claude | 10-31 14:08 | `official.md` 새 항목 23·덧붙임 8, `corrections.md` D51~D57·G27~G32 | 5263 |
| 1 virtual-machines | codex | 14:22 | 개념 1·2, az056·az057, `VmResourcesDiagram` — 주제 `azure-compute` 만듦 | 5279 |
| 2 scale-availability-sets | codex 한도 → Claude | 14:42 | 개념 3·4, az058~az060, `ScaleSetDiagram`·`AvailabilitySetDiagram` | 5311 |
| 3 desktop-containers | Claude | 15:42 | 개념 5·6·7, az061~az064, `VmContainerDiagram` | 5330 |
| 4 functions-app-service | Claude | 15:55 | 개념 8·9, az065~az067, `FunctionTriggerDiagram`·`HostingOptionsTable` — `azure-compute` 완성 | 5358 |
| 5 networking-sources | codex 한도 → Claude | 16:11 | `official.md`, `corrections.md` D58~D60·G33~G38 | 5358 |
| 6 virtual-network-subnets | Claude 한도 → codex | 19:32 | 개념 10·11, az068~az070, `VnetIsolationDiagram` — 주제 `azure-virtual-networking` 만듦 | 5376 |
| 7 peering-endpoints | codex 한도 → Claude | 20:59 | 개념 12·13, az071·az072, `VnetPeeringDiagram`·`PrivateEndpointDiagram` | 5416 |
| 8 vpn-gateway | Claude | 21:12 | 개념 14·15, az073~az075, `SiteToSiteVpnDiagram` | 5436 |
| 9 expressroute-dns | Claude | 21:26 | 개념 16·17, az076~az078, `ExpressRouteDiagram` — `azure-virtual-networking` 완성 | 5458 |
| 10 protection-sources | codex·Claude 한도 → Claude | 11-01 01:54 | `official.md`, `corrections.md` D61~D64·G39·G40 | 5458 |
| 11 network-security-groups | Claude | 02:08 | 개념 18·19, az079~az082, `NsgAssociationDiagram`·`NsgRuleOrderDiagram` — 주제 `azure-network-protection` 만듦 | 5497 |
| 12 firewall-ddos | Claude | 02:20 | 개념 20·21, az083~az085, `FirewallHubDiagram`·`DdosProtectionDiagram` — `azure-network-protection` 완성 | 5545 |

결과: 주제 3개(`azure-compute`·`azure-virtual-networking`·`azure-network-protection`, 모두 ★★☆ — 주제 지도와 같다), 개념 21개(9·8·4), 문항 30개(az056~az085), 도식 14개, 표 하나, 새 테스트 282개.
과목 전체는 주제 10개·개념 62개·문항 85개. 실행 전체 10-31 13:39 ~ 11-01 02:21이고, 그중 약 8시간은 두 쪽 모두 사용량 한도라 기다린 시간이다. 사용량 한도가 아닌 실패로 멈춘 step은 없다.

## 실행 중에 일어난 일

- **사용량 한도로 여덟 번 끊겼고 그때마다 그 step을 처음부터 다시 실행했다.** 끊긴 시도는 step 0·2·5·6·7·10(세 번)이다. 부분 변경은 커밋되지 않고 stash로 남았다.
- **Claude 한도의 실제 문구를 처음 확인했다** — 「You've hit your 5-hour limit · resets …」. supervisor의 판별기가 한도로 맞게 읽고 대기로 넘어갔다.
- **10-31 15시쯤 사용자가 Claude 계정을 바꿨다.** step 3 진행 중 supervisor를 `SIGSTOP`으로 얼렸다가 계정을 바꾼 뒤 풀었다. step 3의 execute는 15:02에 끝났고 supervisor 검증이 15:42로 늦어졌을 뿐, 결과에 영향이 없다.
- **step 0의 codex 초안은 쓰지 않았다.** Claude가 초안을 참고만 하고 사실을 사본으로 다시 확인해 새로 썼다.

## 설계와 달라진 것

모두 step summary에 이유가 있고, 받아들였다.

- **피어링과 VNet 간 VPN을 가르는 기준**(step 5) — guide는 「지나는 길」이라 했지만 VPN FAQ가 VNet 간 트래픽도 Microsoft 백본으로 다닌다고 한다. 「게이트웨이와 암호화된 터널이 있는가」로 갈랐고, 지나는 길로 가르는 것은 사이트 간 VPN과 ExpressRoute다.
- **Azure Firewall·NSG와 암호화**(step 10, D64) — guide의 「어느 것도 트래픽을 암호화하지 않는다」는 Firewall Premium의 TLS 검사 때문에 쓰지 않고 「지나가는 트래픽을 모두 암호화해 주지는 않는다」까지만 썼다. 「크기가 제한 없이 늘어난다」도 종류마다 상한이 있어 쓰지 않았다. 「NSG 하나로는 여러 가상 네트워크를 걸 수 없다」도 같은 NSG를 서브넷 여럿에 연결할 수 있어 쓰지 않았다.
- **Functions의 트리거**(step 4) — step 문서의 예는 함수 하나가 트리거 둘이었는데, 공식 문서가 함수 하나에 트리거가 꼭 하나라고 해서 함수 둘로 고치고 본문에 그 사실을 넣었다. `FunctionTriggerDiagram`에 넷째 시나리오 message를 더했다.
- **표기** — 「사설 IP 주소」 대신 「개인 IP 주소」, 「VPN 장치」 대신 「VPN 디바이스」(한국어판을 따라). 「터널」은 network-protection 주제에서 풀지 않아 「암호화된 통로」로 썼다.
- **문항을 step 문서의 예와 다르게 낸 곳** — az059(넷째 보기 「지역 쌍」→「지역」, 이 주제에서 지역 쌍을 풀지 않아서), az064(「AKS가 맞나요?」는 문제문의 Kubernetes가 답을 흘려 Container Apps 상황형으로), az074·az077(균형 때문에 정답을 예로), az082(서비스 태그 쪽).
- **도식** — `VmContainerDiagram`은 280 폭에 옆자리가 없어 곁말을 호스트 박스 아래로 옮겼고 호스트 소프트웨어 생략을 범례에 밝혔다. `SiteToSiteVpnDiagram` 가로형 곁말은 터널 아래로, `ExpressRouteDiagram`의 `vpn-note`는 폭 때문에 인터넷 노드의 옆이 아닌 곳으로 옮겼다(아래 화면 확인). `NsgRuleOrderDiagram`의 기본 규칙 라벨은 「우선순위 65500: 나머지 거부」로 — 앞의 두 허용 규칙이 있어 「모두 거부」는 틀리다.
- **DDoS 개념을 목록으로 썼다**(step 12) — guide는 목록 개념으로 적지 않았지만 현행 종류 셋이 ADR-046 기준에 맞는다.

## 사용자가 볼 것

13개 step 모두 「사용자 확인」은 「없음」이다.

- **덤프 답이 공식 문서와 달라 고쳐 쓴 것**(`corrections.md` D51~D64) — VM 필수 리소스를 공용 IP로 답한 NO.192(D51), Azure Virtual Desktop 세션 호스트 20대면 최대 20이라는 NO.499 둘째 답(D52), 가상 네트워크 주소 공간이 구독 안에서 달라야 한다는 답(D58), 스토리지 트래픽을 NSG로 답한 문항(D59), 「반드시」 다른 가상 네트워크라는 답(D60), NSG 원본을 「ASG만」으로 적은 답(D61), DDoS Basic·Standard 옛 이름(D62), NSG를 가상 네트워크에 연결한다는 답(D63), Firewall·NSG가 트래픽을 모두 암호화한다는 답(D64).
- **용어집이 공식 문서와 달라 고쳐 쓴 것**(G27~G40) — 가용성 집합·확장 집합의 「무중단」류 표현, Functions 요금 일반화, Load Balancer 「라운드 로빈」(G32), DDoS 옛 이름(G39) 등.
- **쓰지 않은 것** — VM 크기 계열 표, VPN 정책/경로 기반, ExpressRoute 연결 모델, OSI 계층(NO.119), 서비스 엔드포인트(NO.288), 심층 방어 계층, 가용성 집합의 기본 도메인 수(도구마다 달라서).

## 메인 세션이 마무리에서 고친 것

새 문항 30개와 개념 21개를 메인 세션이 직접 읽고 고쳤다(`b44c0e6`). 정답 방향·사실·균형은 그대로다.

- **문제문·보기가 답을 흘린 문항 다섯**
  - az056 — 정답 보기의 풀이 「운영 체제와 프로그램을 직접 구성하는 컴퓨터」가 문제문의 「운영 체제의 설정을 … 직접」과 겹쳐, 「Azure에서 실행하는 가상의 컴퓨터」로.
  - az060 — 「이렇게 나눠 둔 것만으로」 → 「이렇게 나눠 두면」. az070 — 「서브넷이 다르다는 것만으로」 → 「서브넷이 다르면」. 「만으로」가 답(아니요)을 암시했다.
  - az077 — 「이은 뒤에도」 → 「이은 뒤」. 「도」가 답(예)을 전제했다.
  - az080 — 정답 보기만 문제문의 「구역」을 되풀이했다(「그 구역인 서브넷」). 「VM들이 있는 서브넷」으로 바꿔, 서브넷이 구역이라는 것을 알아야 고르게 했다. 해설 첫 문장도 맞췄다.
- **풀이 없이 먼저 나온 낱말 둘** — 「코드」의 풀이를 처음 나오는 `containers`로 옮기고 `functions`에서 뺐다. `virtual-machines`의 「데이터 센터」를 풀었다.

## 남겨 둔 것

- az068은 오답 셋만 「같은 가상 네트워크에 두고」로 시작해 정답이 꼴로 눈에 띈다. 범주는 맞고 내용으로 푸는 문항이라 고치지 않았다 — 다른 꼴을 원하면 보기를 다시 쓰면 된다.
- `git stash`에 이 phase의 한도 중단 초안이 남아 있다(`p34-usage-limit … step0·2·5·6·7·10`). 쓰이지 않는 것이고, 지우는 것은 사용자 판단으로 둔다.
- `corrections.md`의 「(쓰일 곳)」 표지 가운데 이 phase 항목은 없다. 남은 것은 phase 100 이전 기록이다.

## 다시 돌린 검증 (마무리 수정 뒤)

실행 부하가 없을 때 `b44c0e6`의 내용으로 다시 돌렸다. 덩어리마다 supervisor도 step마다 같은 검증을 돌려 모두 통과했다.

- `npm run build` 통과, `npm run lint` 경고 0, `npm test` 244파일·5545개 통과(phase 시작 229파일·5263개).
- `check-structure` 「구조 이상 없음」.
- 교차 검사 「✓ 교차 없음 — 세로 노드 1103개·경로 757개, 가로 노드 1103개·경로 757개」(phase 시작 1033/710에서 +70/+47).
- `check-verbatim --subject azure` 「전사 이상 없음 — azure: 원본 311개, 단위 584개」(phase 시작 원본 193개·단위 356개).
- 문항 85개(az001~az085), 예 22·아니요 23, 정답 위치 10/10/10/10. 문항의 `conceptId`는 모두 있는 개념을 가리킨다.
- AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `c658d15`와 diff 없음.

## 화면 확인 (headless Chrome + CDP, 개발 서버 `127.0.0.1:5300`)

phase 102의 측정기를 주제만 바꿔 썼다(저장소 밖 `p103-run/measure-p103.cjs`). 폭 305·320·390(배율 2, 모바일)과 1180(배율 1).

- **측정기를 한 곳 고쳤다.** 첫 실측이 `VmResourcesDiagram`의 「개인 IP 주소」를 「라벨이 상자보다 넓음」으로 잡았는데, 이것은 네트워크 인터페이스 노드 그룹 안에 넣은 곁말(`data-note`)을 상자 안 라벨로 잰 오탐이었다. 폭 160 상자 아래에 놓인 글자이고 캡처로도 확인했다. 도식은 고치지 않았다.
  측정기는 `data-note`를 라벨 검사에서 빼고 곁말 검사(노드에 겹침)에 넣도록 고쳤다. 느슨해지지 않았는지 자가 시험으로 봤다 — 곁말을 SVG 밖으로, 라벨을 길게, 표 칸에 긴 낱말을 넣으면 세 주제에서 34건을 잡는다(`azure-compute` 7, `azure-virtual-networking` 12, `azure-network-protection` 15).
- **넘침** — 네 폭에서 세 주제 모두 페이지 가로 넘침 0. 모든 시나리오 버튼을 누른 뒤에도 0. 도식 폭은 305·320·380, 1180에서는 가로형 638·621.
- **도식 14개의 모든 시나리오**(폭마다 44개 상태 — `azure-compute` 17, `azure-virtual-networking` 15, `azure-network-protection` 12)를 하나씩 눌러 보이는 SVG 글자를 화면 픽셀로 쟀다. SVG 밖으로 나간 글자 0, 노드 라벨이 자기 상자보다 넓은 곳 0, 글자끼리 겹친 곳 0, 곁말이 노드 상자에 겹친 곳 0, 그룹 박스 테두리에 걸친 곳 0.
- **표** — `HostingOptionsTable`은 폭 273·288·358·638에서 표 넘침 0, 낱말 끊김 0(낱말 84개).
- **과목 화면** — 과목 목록(`#/`)에 「Azure AZ-900 · 주제 10개 · 문항 85개」, 주제 목록에 새 주제 셋, 세 주제의 확인 문제(12·11·7문항)·랜덤(전체 85문항)·검색·복습 화면이 320·1180에서 넘침 0. 답을 누르면 해설이 뜬다. 콘솔 오류 없음. 문구 수정 전에 확인한 것이고, 수정은 문항·개념 문장뿐이다.
- 캡처해서 눈으로 본 것: `VmResourcesDiagram`(390 전체 — 「개인 IP 주소」는 네트워크 인터페이스 아래 곁말), `SiteToSiteVpnDiagram`(1180 사이트 간 — 「인터넷 위의 암호화된 터널」이 터널 화살표 아래, 온-프레미스 박스 오른쪽 아래), `ExpressRouteDiagram`(390·1180 사이트 간 VPN — 「암호화된 터널로 지남」이 공용 인터넷 가까이). 곁말이 대상과 떨어져 읽히는 곳은 없다.
