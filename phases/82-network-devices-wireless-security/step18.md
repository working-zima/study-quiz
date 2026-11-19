# Step 18: vpn-tunneling

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `network-security`의 개념 둘(5 VPN, 6 터널링)의 글·문항·도식을 함께 만든다.** 6은 5에 딸린 개념이다.
이 주제가 VPN과 터널을 정의하는 자리다 — `windows-server-roles.remote-access`가 한 줄로 쓴 VPN·터널과 뜻을 맞춘다(guide.md 「배경」).

기출은 공용 네트워크 위에 사설 네트워크처럼 쓰는 기술이 VPN이라는 것([기출 2026-05-17 #21] — 지문, 오답 NAT·PPP·PPPoE),
두 지점 사이에 가상의 통로를 만들어 패킷을 담아 보내는 VPN의 기술이 터널링이라는 것을 세 번 묻는다([기출 2024-05-19 #22]·[기출 2026-02-01 #19] — 오답 인증·암호화·접근 제어, [기출 2024-11-03 #24] — 지문, 오답 접근 통제·방화벽 설정·FTP).

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 15 `summary`(VPN의 정의·꼴·주는 보호, 「구성 기술 넷」의 처리, 터널·터널링의 정의와 차례, 기출 판정, E 번호)와 step 16~17 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 16과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 15)」 항목, phase 74의 사설 주소 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`network-security`의 앞 개념 넷(step 16~17)**, `protocols-encapsulation.encapsulation`(캡슐화), `ip-address-types.private-address`·`public-address`, `windows-server-roles.remote-access` — 뜻을 맞춘다
- `src/data/network/questions.json`, `src/data/network/visuals/network-security.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `EncapsulationDiagram`(겹겹의 헤더), `RemoteAccessServicesDiagram`(바깥에서 회사 네트워크로), `NatTranslationDiagram`(안과 밖의 주소), `NacAdmissionDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 위 4문항 — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `network-security` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `network-security.vpn` | VPN | — | VPN의 뜻(step 15 결과대로 — 영문 이름 virtual private network와 「가상 사설망」), **사설 주소**(인터넷에 나가지 않는 회사 안의 주소 — 한 줄, 앞 주제와 뜻을 맞춘다), 두 꼴(이름은 step 15 결과대로 — 무엇과 무엇을 잇는지), VPN이 주는 보호(step 15 결과대로). VPN을 이루는 기술(터널링·인증·암호화·접근 제어 — step 15의 처리대로: 묶는 문서가 없으면 각각이 VPN에서 하는 일만 쓰고 시험의 묶음은 「자격시험은」 줄로). `windows-server-roles.remote-access`의 VPN 한 줄과 뜻을 맞춘다. **사이트 간 VPN과 원격 접속 VPN**(4절). 예: 본사 `10.1.0.0/24`와 지사 `10.2.0.0/24`를 `VPNGW1`(`192.0.2.1`)·`VPNGW2`(`203.0.113.1`)가 인터넷 너머로 잇고, 출장 중인 노트북 하나가 `VPNGW1`에 붙어 본사 네트워크를 쓴다(「예시 값」 — 사설 주소와 문서용 주소라고 밝힌다) |
| 6 | `network-security.tunneling` | 터널링 | `network-security.vpn` | 터널링과 터널의 뜻(step 15 결과대로), 캡슐화(한 줄 — `protocols-encapsulation.encapsulation`과 뜻을 맞춘다), 바깥 헤더(터널 양 끝의 공인 주소)와 안쪽 패킷(사설 주소)이 어떻게 놓이고 터널 끝에서 다시 꺼내지는지, 그 사이의 인터넷 라우터는 바깥 헤더만 보고 전달한다는 것(근거대로). 터널링 자체는 암호화가 아니라는 것(step 15 결과대로 — 암호화는 IPsec 같은 것이 더한다는 한 줄, 진행 안내를 붙이지 않는다). **터널링과 암호화**(4절). 예: `10.1.0.5`가 `10.2.0.7`에 보낸 패킷을 `VPNGW1`이 출발지 `192.0.2.1`·목적지 `203.0.113.1`의 바깥 헤더로 감싸 보내고, `VPNGW2`가 바깥 헤더를 떼어 `10.2.0.7`에 전한다(「예시 값」 — 단계대로, 칸마다 주소를 따라 본다) |

### 2. 문항 — `src/data/network/questions.json`에 `n347`~`n349`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n347` | `vpn` | 4지선다 「상황 적용」 — 본문과 다른 장면(공장 네트워크 `172.16.10.0/24`와 연구소 네트워크 `172.16.20.0/24`를 인터넷 너머로 한 회사 네트워크처럼 잇는다, 또는 재택근무자 노트북 한 대를 회사 네트워크에 잇는다)을 주고 어느 꼴의 VPN인지, 또는 그 일을 하는 기술을 고르게 한다. 오답은 같은 범주(다른 꼴의 VPN, NAT, 웹 응용 프로그램 프록시처럼 회사 자원을 바깥에 내놓는 다른 방법 등 — step 15와 앞 주제의 근거로 따진다). **정답 위치 0**. 기출 묶음(NAT·PPP·PPPoE·VPN)을 쓰지 않는다 |
| `n348` | `tunneling` | 예/아니요 「원리 이해」 — **예** 쪽으로 세운다. 예: 사설 주소를 쓰는 두 사무실이 인터넷 너머로 터널을 이었다. 한 사무실의 PC가 다른 사무실의 PC에 보낸 원래 패킷은, 터널 양 끝의 공인 주소가 적힌 다른 패킷 안에 담겨 인터넷을 지나가나요?(예 — step 15 결과대로). 해설은 바깥 헤더와 안쪽 패킷, 터널 끝에서 꺼내는 일을 가르친다 |
| `n349` | `tunneling` | 4지선다 「원리 이해」 — 본문과 다른 값의 장면(안쪽 `172.16.10.5` → `172.16.20.9`, 터널 끝 `198.51.100.1`·`198.51.100.2`)을 주고, 인터넷 가운데의 라우터가 패킷을 전달할 때 보는 목적지 주소를 고르게 한다(정답 `198.51.100.2` — 바깥 헤더). 오답은 안쪽 목적지 주소, 안쪽 출발지 주소, 바깥 출발지 주소. **정답 위치 1**. n348과 다른 것을 묻는다. 해설은 칸마다 주소를 따라간다. 기출 묶음(인증·암호화·접근 제어·터널링 / 접근 통제·방화벽 설정·FTP·터널링)을 쓰지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 70·아니요 69, 정답 위치 53/53/52/52.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `vpn` — `VpnSiteTypesDiagram`, JSON 키 `vpn-site-types`

- 물음형 제목 예: `VPN은 어디와 어디를 이어 줄까?`
- 그릴 것: 본사 그룹 박스(`10.1.0.0/24` — 그룹 라벨, 안에 `VPNGW1`), 지사 그룹 박스(`10.2.0.0/24`, 안에 `VPNGW2`), 가운데 인터넷 노드, 출장 중인 노트북 노드. 280 폭에서는 위아래로 쌓는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `site` | 사이트 간 | `VPNGW1`·인터넷·`VPNGW2`와 그 경로 | 두 사무실의 네트워크를 인터넷 너머로 한 네트워크처럼 잇는다 |
  | `remote` | 원격 접속 | 노트북·인터넷·`VPNGW1`과 그 경로 | 밖에 있는 컴퓨터 한 대를 회사 네트워크에 잇는다 |

- 요점 테스트: `site`의 보이는 경로 양 끝이 `VPNGW1`·`VPNGW2`이고, `remote`의 보이는 경로 한쪽 끝은 노트북이다. 두 시나리오 모두 경로가 인터넷 노드를 지난다.

#### 3-2. `tunneling` — `TunnelEncapsulationDiagram`, JSON 키 `tunnel-encapsulation`

- 물음형 제목 예: `터널을 지나는 패킷은 어떻게 감싸일까?`
- 그릴 것: 패킷을 칸 노드 줄로 — 안쪽 패킷(「10.1.0.5 → 10.2.0.7」·「데이터」), 바깥 헤더(「192.0.2.1 → 203.0.113.1」). 단계마다 자리가 다른 패킷 줄 셋(`VPNGW1` 앞, 인터넷 안, `VPNGW2` 뒤 — 다른 id·다른 자리)과 `VPNGW1`·`VPNGW2` 노드. 칸이 280 폭에 들지 않으면 칸 노드를 세로로 쌓는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `wrap` | 감싸기 | 원래 패킷 줄·`VPNGW1`·감싼 패킷 줄 | 게이트웨이가 원래 패킷 앞에 터널 양 끝의 주소를 적은 바깥 헤더를 붙인다 |
  | `cross` | 인터넷 지나기 | 감싼 패킷 줄과 인터넷 쪽 경로 | 인터넷의 라우터는 바깥 헤더의 주소만 보고 전달한다 |
  | `unwrap` | 꺼내기 | `VPNGW2`·꺼낸 패킷 줄 | 반대쪽 게이트웨이가 바깥 헤더를 떼고 원래 패킷을 `10.2.0.7`에 전한다 |

- 요점 테스트: 바깥 헤더 노드는 `wrap`·`cross`에서 선명하고 `unwrap`의 꺼낸 패킷 줄에는 없다. 안쪽 패킷의 주소 라벨(「10.1.0.5 → 10.2.0.7」)은 세 단계에서 같다(테스트가 라벨 문자열을 견준다).

위 도식 설계는 출발점이다. 본문(step 15 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 터널을 관 그림이나 자물쇠로 그리지 않는다(guide.md 「도식」).

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 349개, 마지막 id는 `n349`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 터널의 예를 칸마다 손으로 따라가 주소가 맞는지 본다.
3. n347·n349의 보기 넷을 step 15의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/82-network-devices-wireless-security/index.json`의 step 18을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 7~8(VPN 프로토콜·IPsec)을 만들지 마라.** 이유: step 19의 범위다. PPTP·L2TP·IPsec은 이 step에서 이름만 쓴다.
- **VPN 배포 절차·인증서 구성·제품 기능을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 16~17의 개념·문항·도식과 `windows-server-roles`를 고치지 마라.** 이유: 다른 step·앞 phase의 범위다. 고칠 것을 찾으면 summary에 적는다.
