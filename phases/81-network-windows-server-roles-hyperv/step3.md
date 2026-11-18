# Step 3: dhcp-reservation-failover

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 `windows-server-roles`의 개념 둘(5 DHCP 예약, 6 DHCP 장애 조치)의 글·문항·도식을 함께 만든다.** 둘 다 4 「DHCP 서버 역할」(step 2)에 딸린 개념이다.

기출은 DHCP 장애 조치의 MCLT가 파트너 서버가 기존 임대를 잠시 늘려 줄 수 있는 최대 시간이라는 것([기출 2026-05-17 #42] — 오답: 서버 간 인증에 쓰는 최대 시간·Discover 재전송 간격·범위를 끄는 유예 시간)과,
새 예약이 지원하는 유형이 DHCP만이 아니라는 것([기출 2025-02-23 #44]의 오답 보기)을 묻는다.

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 0 `summary`(예약 창의 항목·지원되는 유형, 장애 조치의 두 방식·기본 비율·MCLT·상태 전환 간격·공유 암호, 기출 판정, E 번호, 한국어 이름)와 step 1·2 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 1과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 0)」 줄과 항목), `docs/source/network/exam-notes.md`(E39~가 있으면)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`windows-server-roles`의 앞 개념 넷(step 1·2)**, 특히 `dhcp-server-role`의 범위·제외 범위·임대 기간 문장과 뜻을 맞춘다. `ip-address-types.dhcp`(예약·수동 할당·BOOTP 문장, 갱신 — 임대 시간의 절반·8분의 7), `ethernet`이나 `arp`의 MAC 주소 문장
- `src/data/network/questions.json`, `src/data/network/visuals/windows-server-roles.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `DhcpScopeRangeDiagram`(step 2), `DhcpLeaseDiagram`, `RouteFailoverDiagram`(장애 전과 뒤), `AccountLockoutDiagram`(시간이 흐르는 그림)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2026-05-17 #42], [기출 2025-02-23 #44] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-server-roles` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `windows-server-roles.dhcp-reservation` | DHCP 예약 | `windows-server-roles.dhcp-server-role` | 예약의 뜻, **MAC 주소**(네트워크 어댑터마다 정해진 하드웨어 주소 — 한 줄, 앞 주제와 뜻을 맞춘다)로 클라이언트를 알아본다는 것, 새 예약 창에 넣는 값과 지원되는 유형(step 0 결과대로 — DHCP·BOOTP·둘 다), **BOOTP** 한 줄. 예약한 클라이언트도 DHCP로 주소를 받는다는 것(`ip-address-types.dhcp`의 「예약」 문장과 뜻을 맞춘다). 예약 주소와 범위의 관계(step 0 결과대로). **예약과 제외 범위**, **예약과 고정 IP 주소**(4절 — `server-static-ip`와 뜻을 맞춘다). 예: 프린터(MAC `00-00-5E-00-53-01`)에 `192.0.2.150` 예약(「예시 값」 — 문서용 MAC 주소라고 밝힌다) |
| 6 | `windows-server-roles.dhcp-failover` | DHCP 장애 조치 | `windows-server-roles.dhcp-server-role` | 장애 조치의 뜻(step 0 결과대로), 두 방식과 기본 비율(step 0 결과대로), **MCLT**(정의는 step 0 결과대로 — 문서의 말을 옮기지 말고, 「파트너와 연락이 끊겼을 때 남은 서버가 기존 클라이언트의 임대를 얼마까지 늘려 줄 수 있는가」를 자기 말로), 상태 전환 간격·공유 암호(step 0 결과대로 한 줄씩 — MCLT와 무엇이 다른지가 드러나게), 한 관계의 서버 수·IPv4(step 0 결과대로). **부하 분산과 상시 대기**(4절). 계산 예: `SRV01`·`SRV02`가 부하 분산 중 `SRV01`이 멈추면, `SRV02`가 `SRV01`에서 주소를 받은 클라이언트에게 임대를 MCLT만큼만 늘려 준다 — 시각을 하나 정해 몇 시까지인지 단계대로(MCLT 값은 step 0이 확인한 기본값이면 기본값이라 밝히고, 아니면 「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n289`~`n290`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n289` | `dhcp-reservation` | 예/아니요 「개념 확인」 — **아니요** 쪽으로 세운다. 예: 서버 관리자가 프린터의 주소를 DHCP 서버에 예약해 두면, 그 프린터는 자기 네트워크 설정에 그 주소를 직접 넣어야 그 주소를 쓸 수 있나요?(아니요 — 예약한 클라이언트도 DHCP로 그 주소를 받는다, step 0 결과대로). 해설은 예약·제외 범위·고정 주소를 가른다 |
| `n290` | `dhcp-failover` | 4지선다 「상황 적용」 — 본문과 다른 장면(서버 이름 `SRV05`·`SRV06`, 다른 시각)을 주고, 파트너와 연락이 끊긴 뒤 남은 서버가 기존 클라이언트의 임대를 어떻게 다루는지 고르게 한다. 정답은 MCLT로 정해진 시간까지만 늘려 준다는 것(값은 문제문에 준다), 오답은 흔한 혼동(원래 임대 기간만큼 늘려 준다, 상태 전환 간격으로 읽기, 범위를 끈다 — 기출 묶음과 같은 넷이 되지 않게 범주를 「무슨 일이 일어나나」로 바꾼다). **정답 위치 3**. 해설은 시각 셈을 단계대로 보인다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 57·아니요 57, 정답 위치 44/44/44/44.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `dhcp-reservation` — `DhcpReservationDiagram`, JSON 키 `dhcp-reservation`

- 물음형 제목 예: `예약한 장치는 어떻게 늘 같은 주소를 받을까?`
- 그릴 것: DHCP 서버 `SRV01`(그룹 박스 — 안에 범위 노드와 예약 노드 「`00-00-5E-00-53-01` → `192.0.2.150`」(라벨이 길면 MAC 주소 노드와 주소 노드 둘로 나눠 잇는다)), 클라이언트 둘 — 예약한 프린터와 다른 PC(`PC01`).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `reserved` | 예약한 장치 | 프린터·예약 노드·`192.0.2.150`과 그 경로 | MAC 주소가 맞는 장치에게 늘 같은 주소를 DHCP로 준다 |
  | `other` | 다른 장치 | `PC01`·범위 노드와 그 경로 | 예약이 없는 장치는 범위에서 남은 주소를 빌린다 |

- 요점 테스트: `reserved`의 경로는 예약 노드를 지나 프린터에 닿고, `other`의 경로는 예약 노드를 지나지 않는다(예약 노드가 흐리다). 두 시나리오의 끝 클라이언트 노드가 다르다.

#### 3-2. `dhcp-failover` — `DhcpFailoverDiagram`, JSON 키 `dhcp-failover`

- 물음형 제목 예: `DHCP 서버 한 대가 멈추면 클라이언트의 임대는 어떻게 될까?`
- 그릴 것: DHCP 서버 `SRV01`·`SRV02`와 둘 사이의 임대 정보 맞추기 경로, 클라이언트 노드(`PC01`). 장애 뒤 결과 노드(「MCLT만큼 임대를 늘려 준다」 — 본문의 말과 본문 계산 예의 값).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `normal` | 평소 | 두 서버·클라이언트, 두 서버 사이 경로 | 두 서버가 임대 정보를 나눠 갖고 요청을 나눠 받는다(부하 분산) |
  | `partner-down` | 한 대가 멈춤 | `SRV02`·클라이언트·결과 노드, `SRV01`은 흐림 | 남은 서버는 기존 임대를 MCLT만큼만 늘려 준다(본문 계산 예의 시각) |

- 요점 테스트: `partner-down`에서 `SRV01` 노드가 흐리고 두 서버 사이 경로가 보이지 않으며, 결과 노드가 선명하다. `normal`에서는 결과 노드가 흐리다. 결과 노드의 문구에 MCLT가 있고 본문 계산 예의 값과 같다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 290개, 마지막 id는 `n290`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 1·2가 푼 낱말을 다시 풀지 않았는가. 예약에 관한 말이 `ip-address-types.dhcp`·`dhcp-server-role`과 어긋나지 않는가.
3. n290의 시각 셈과 본문 계산 예를 손으로 다시 하고, 오답 셋이 정말 틀렸는지 step 0의 MCLT 근거로 따진다.
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 3을 갱신한다(guide.md 「summary에 적을 것」 / error / blocked — step 1과 같은 규칙).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 7~23을 만들지 마라.** 이유: 다른 step의 범위다.
- **장애 조치의 구성 차례 전체(마법사 단계마다의 설정)·복제 명령·IPv6를 쓰지 마라.** 이유: 기출이 묻는 것은 MCLT와 두 방식까지다(ADR-059 「범위」). 관계를 만드는 자리는 한 줄이면 된다.
- **step 1·2의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
