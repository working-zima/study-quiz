# Step 2: file-print-dhcp-scope

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 `windows-server-roles`의 개념 둘(3 파일 서버와 프린트 서버, 4 DHCP 서버 역할)의 글·문항·도식을 함께 만든다.**

기출은 파일·프린터 서버로 쓰려면 있어야 하는 통신 규칙이 TCP/IP라는 것([기출 2024-11-03 #30] — 오답 SNMP·SMTP·IGMP)과,
DHCP 범위를 만들 때 서브넷 지연이 밀리초 단위라는 것(임대 기간 단위·WINS 옵션·예약 유형은 오답 보기 — [기출 2025-02-23 #44]·[기출 2026-08-02 #32], 같은 문항)을 묻는다.

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 0 `summary`(SMB·파일 서버·인쇄 서버, 새 범위 마법사의 단계·단위·기본 임대 기간·WINS, 기출 판정, E 번호, 한국어 이름)와 step 1 `summary`(이미 푼 낱말, 교차 검사 수)
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 1과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 0)」 줄과 항목), `docs/source/network/exam-notes.md`(E39~가 있으면)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`windows-server-roles`의 앞 개념 둘(step 1)** 과 뜻을 맞출 것: `ip-address-types.dhcp`·`dhcp-messages`(임대·예약·BOOTP·Discover/Offer), `app-protocols-mgmt-security.snmp`, `app-protocols-mail-file.smtp`·`ftp`, `icmp`의 IGMP 문장, `ports`의 잘 알려진 포트, `windows-admin-tools.work-folders`
- `src/data/network/questions.json`, `src/data/network/visuals/windows-server-roles.json`(step 1), `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `DhcpLeaseDiagram`·`DhcpExchangeDiagram`(DHCP), `ProtocolMatchDiagram`·`HttpsStackDiagram`(층을 쌓은 노드), `RoleServiceFeatureDiagram`·`ServerStaticIpDiagram`(step 1)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-11-03 #30], [기출 2025-02-23 #44] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-server-roles` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `windows-server-roles.file-print-services` | 파일 서버와 프린트 서버 | — | 파일 서버와 프린트 서버가 하는 일, 맡는 역할·역할 서비스 이름(step 0 결과대로). **SMB**의 뜻과 TCP/IP 위에서 동작한다는 것·포트(step 0 결과대로 — **프로토콜**(통신 규칙)·**TCP/IP**(인터넷의 기본 통신 규칙 묶음)·**포트 번호**(한 컴퓨터 안에서 통신할 프로그램을 가르는 번호)를 한 줄씩 푼다). 그래서 파일·프린터 공유에 TCP/IP가 있어야 한다는 것(step 0의 판정대로 — 「자격시험은」 줄은 E가 있을 때만). 공유 폴더를 여는 UNC 경로(step 0 결과대로). SNMP(네트워크 장비 관리)·SMTP(메일 보내기)·IGMP(멀티캐스트 그룹 가입) 한 줄씩 — 파일·프린터 공유의 통신 규칙이 아니다(앞 주제와 뜻을 맞춘다). 클라우드 폴더와의 관계는 step 0이 근거를 남겼을 때만 한 줄. 예: `SRV01`의 공유 `Data`를 `PC01`이 `\\SRV01\Data`로 연다(「예시 값」) |
| 4 | `windows-server-roles.dhcp-server-role` | DHCP 서버 역할 | — | DHCP(한 줄 — `ip-address-types.dhcp`와 뜻을 맞춘다, 임대(정한 기간 동안 주소를 빌려주는 것)도 한 줄로 다시 푼다)를 Windows Server가 맡는 역할, 관리 도구와 실행 이름, 도메인에서의 권한 부여(step 0 결과대로 — 도메인은 「여러 컴퓨터의 계정을 한곳에서 관리하는 묶음」 한 줄). 범위와 새 범위 마법사의 차례(step 0이 확인한 단계 이름·값·단위 — 서브넷 지연의 밀리초, 임대 기간의 단위, 옵션의 라우터·DNS 서버·WINS 서버). **서브넷 지연**은 무엇을 늦추는지(DHCPOFFER — `dhcp-messages`의 Offer와 뜻을 맞춘다)를 함께 쓴다. **WINS**(한 줄 — step 0 결과대로, 지원 상태도). 기본 임대 기간은 step 0 결과대로(판). **범위와 제외 범위가 무엇이 다른지**(4절). 계산 예: 범위 `192.0.2.100`~`192.0.2.199`(100개)에서 제외 `192.0.2.100`~`192.0.2.109`(10개)를 빼면 나눠 줄 수 있는 주소가 90개 — 단계대로 센다(「예시 값」), 임대 기간 예 `3`일 |

### 2. 문항 — `src/data/network/questions.json`에 `n286`~`n288`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n286` | `file-print-services` | 4지선다 「상황 적용」 — 사무실 PC가 서버의 공유 폴더에 있는 파일을 열 때 둘 사이에 오가는 통신 규칙을 고르게 한다. 정답 SMB, 오답은 같은 범주의 응용 계층 프로토콜에서 헷갈리는 것(예: FTP — 파일을 주고받지만 공유 폴더를 여는 규칙이 아니다, SNMP, NFS가 출처에 없으면 쓰지 않는다 — step 0의 근거 안에서). 기출 묶음(TCP/IP·SNMP·SMTP·IGMP)과 같은 넷이 되지 않게 한다. **정답 위치 1** |
| `n287` | `dhcp-server-role` | 4지선다 「계산」 — 본문과 다른 값의 범위와 제외 범위(예: `198.51.100.50`~`198.51.100.149`에서 `198.51.100.50`~`198.51.100.59`와 `198.51.100.140`~`198.51.100.149`를 제외)를 주고 나눠 줄 수 있는 주소 수를 고르게 한다. 오답은 흔한 셈 실수(끝 주소를 빼고 세기, 제외를 한쪽만 빼기 등). **정답 위치 2**. 해설은 셈을 단계대로 보인다 |
| `n288` | `dhcp-server-role` | 예/아니요 「개념 확인」 — **예** 쪽으로 세운다. 예: 새 범위 마법사에서 정하는 서브넷 지연을 늘리면, 그 DHCP 서버는 주소를 달라는 클라이언트에게 제안을 보내기 전에 그만큼 더 기다리나요?(예 — step 0 결과대로, 단위는 해설에서). 또는 step 0이 확인한 다른 사실로 **예**가 되는 주장. n287과 다른 것을 묻는다. 기출의 보기 문장(임대 기간 단위·WINS·예약 유형·지연 시간 단위)을 그대로 주장으로 세우지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 57·아니요 56, 정답 위치 44/44/44/43.
문항 글에 백틱을 쓰지 않는다. UNC 경로를 문항에 쓰면 백틱 없이 쓰고 JSON 이스케이프를 확인한다.

### 3. 도식

#### 3-1. `file-print-services` — `SmbShareAccessDiagram`, JSON 키 `smb-share-access`

- 물음형 제목 예: `다른 PC는 서버의 공유 폴더를 어떻게 열까?`
- 그릴 것: 클라이언트 `PC01`과 서버 `SRV01`(그룹 박스 — 안에 공유 `Data`와 프린터 노드), 둘 사이의 경로에 SMB와 그 아래 TCP/IP(층을 쌓은 노드 둘 — 본문의 말), 경로 곁말에 UNC 경로 `\\SRV01\Data`.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `file` | 공유 폴더 | `PC01`·SMB·TCP/IP·공유 `Data`와 그 경로 | UNC 경로로 공유 폴더를 열면 SMB가 TCP/IP 위에서 파일을 오가게 한다 |
  | `print` | 공유 프린터 | `PC01`·프린트 서버 쪽 노드·프린터와 그 경로 | 인쇄 작업이 프린트 서버를 거쳐 프린터로 간다(본문의 말대로) |

- 요점 테스트: 두 시나리오의 끝 노드(공유 `Data` / 프린터)가 다르고 각각 다른 경로로만 닿는다. `file`에서 SMB 노드와 TCP/IP 노드가 함께 선명하다(SMB만 선명하고 TCP/IP가 흐리면 실패).

#### 3-2. `dhcp-server-role` — `DhcpScopeRangeDiagram`, JSON 키 `dhcp-scope-range`

- 물음형 제목 예: `범위를 만들면 어느 주소가 클라이언트에게 갈까?`
- 그릴 것: 범위 `192.0.2.100`~`192.0.2.199`를 한 줄의 구간(그룹 박스나 이어 붙인 노드)으로, 그 앞쪽에 제외 범위 `192.0.2.100`~`192.0.2.109` 조각, 나머지 조각(나눠 주는 주소 `192.0.2.110`~`192.0.2.199`, 90개). 마법사의 차례(범위 → 제외와 지연 → 임대 기간 → 옵션 → 활성화)를 번호 곁말(①~⑤)로 둘 수 있으면 둔다(본문의 단계 이름만 — 화면 흉내 금지).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `range` | 범위 | 범위 전체 구간 | 한 서브넷에서 나눠 줄 주소의 연속된 범위다 |
  | `exclude` | 제외 범위 | 제외 조각 | 범위 안이지만 누구에게도 주지 않는다 |
  | `lease` | 나눠 주는 주소 | 나머지 조각과 클라이언트 노드·경로 | 100개에서 제외 10개를 뺀 90개를 임대 기간 동안 빌려준다 |

- 요점 테스트: `exclude`와 `lease`의 선명한 조각 노드가 겹치지 않고 서로 다른 자리다. `lease`의 곁말이나 캡션에 `90`이 있고, 그 수가 본문의 계산 예와 같다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 288개, 마지막 id는 `n288`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 1이 푼 낱말을 다시 풀지 않았는가. step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가.
3. n287의 셈을 손으로 다시 하고, 오답 셋이 각각 어떤 실수에서 나오는지 해설과 맞춘다. n286의 오답이 정말 공유 폴더를 여는 규칙이 아닌지 출처로 따진다.
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 2를 갱신한다(guide.md 「summary에 적을 것」 / error / blocked — step 1과 같은 규칙).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 5~23을 만들지 마라.** 이유: 다른 step의 범위다. 예약·장애 조치는 이 step의 글에서 이름도 꺼내지 않는다 — 꺼내야 하면 한 줄로 그친다.
- **SMB의 버전·암호화·다중 채널, DHCP의 IPv6·정책·필터를 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 1의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
