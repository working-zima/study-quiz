# Step 14: poe-pxe-review

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `network-devices`의 마지막 개념 둘(9 PoE, 10 PXE)의 글·문항·도식을 함께 만들고, 주제 전체(10개념)를 통독한다.** 둘 다 머리 개념이다.
쓰기를 마친 뒤 주제 전체를 통독하는 데 시간을 쓴다.

기출은 랜선으로 전원도 보내는 스위치를 두 번 묻고([기출 2024-05-19 #50]·[기출 2025-11-02 #50] — 지문, 오답 L2 스위치·IP 공유기·UPS),
네트워크 카드로 컴퓨터를 부팅하게 하는 것이 PXE라는 것을 묻는다([기출 2026-05-17 #50] — 오답 PnP·PoE·PE).

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 12 `summary`(PoE·PSE·PD·802.3af·at·bt·검출, 「PoE 스위치」의 처리, PXE의 차례·WDS, PnP·PE를 쓸 수 있는지, 기출 판정, E 번호)와 step 8~13 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 9와 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 8·12)」 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`network-devices`의 앞 개념 여덟(step 9~13)**, `ethernet.nic`·`ethernet.ethernet`, `ip-address-types.dhcp`·`dhcp-messages`, `app-protocols-mail-file.tftp` — 뜻을 맞춘다
- `src/data/network/questions.json`, `src/data/network/visuals/network-devices.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `DhcpExchangeDiagram`·`TftpBlocksDiagram`(주고받는 차례), `BootSequenceDiagram`(부팅 차례), `LoadBalancerPoolDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-05-19 #50], [기출 2025-11-02 #50], [기출 2026-05-17 #50] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `network-devices` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `network-devices.poe` | PoE | — | PoE의 뜻(step 12 결과대로 — 이더넷 케이블과 꼬임 쌍선을 한 줄로 푼다), PSE와 PD(이름과 예는 step 12 결과대로), 802.3af·at·bt의 해와 한 포트가 줄 수 있는 전력(step 12가 확인한 값만), 전원을 보내기 전에 상대가 PD인지 확인한다는 것(step 12 결과대로 한 줄 — 그래서 PoE를 모르는 장치를 꽂아도 전원을 보내지 않는다는 것은 근거가 있을 때만), 전원 콘센트가 없는 곳에 장치를 둘 수 있다는 것(근거대로). 「PoE 스위치」라는 이름은 step 12의 처리대로. **PoE 스위치와 일반 스위치**(4절). 예: PoE 스위치 `SW01`이 무선 AP `AP01`과 IP 카메라 `CAM01`에 랜선 하나씩으로 데이터와 전원을 함께 보낸다(「예시 값」) |
| 10 | `network-devices.pxe` | PXE | — | PXE의 뜻(step 12 결과대로), **부팅**(컴퓨터를 켜서 운영 체제를 불러오는 과정 — 한 줄), 차례(step 12 결과대로) — NIC의 PXE가 DHCP로 주소와 부팅 서버·부팅 파일 이름을 받는다 → TFTP로 부팅 파일을 받는다 → 그 파일을 실행한다(앞 주제의 DHCP·TFTP·NIC와 뜻을 맞춘다 — 이 화면에서 한 줄씩 다시 푼다). 쓰는 곳 — 여러 컴퓨터에 운영 체제 설치(WDS 한 줄 — 지금 판의 상태는 step 12 결과대로). **PXE와 PoE**(4절 — 이름은 비슷하지만 하나는 부팅, 하나는 전원). PnP·PE는 step 12가 근거를 찾았을 때만. 예: 디스크가 빈 `PC05`가 켜지면 DHCP 서버에게서 주소와 부팅 서버 `SRV01`(`192.0.2.10`)·부팅 파일 이름을 받고, `SRV01`에서 TFTP로 부팅 파일을 받아 실행한다(「예시 값」 — 단계대로) |

### 2. 문항 — `src/data/network/questions.json`에 `n339`~`n340`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n339` | `poe` | 예/아니요 「상황 적용」 — **예** 쪽으로 세운다. 예: 천장에 전원 콘센트가 없는 자리에 무선 AP `AP07`을 달아야 한다. PoE를 지원하는 스위치와 AP라면, 스위치에서 이어 온 랜선 하나로 `AP07`에 데이터와 전원을 함께 보낼 수 있나요?(예 — step 12 결과대로). 해설은 PSE·PD와 검출을 가르친다. 기출 묶음(L2 스위치·IP 공유기·UPS·PoE 스위치)을 쓰지 않는다 |
| `n340` | `pxe` | 4지선다 「원리 이해」 — PXE 부팅의 차례를 묻는다. 예: 디스크가 빈 컴퓨터(본문과 다른 이름)가 PXE로 부팅할 때 부팅 파일을 받기 전에 먼저 하는 일, 또는 부팅 파일을 받을 때 쓰는 프로토콜을 고르게 한다(정답·오답은 step 12의 차례와 앞 주제의 프로토콜 — DHCP·TFTP·FTP·DNS 등에서). **정답 위치 0**. 기출 묶음(PnP·PoE·PE·PXE)을 쓰지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 68·아니요 67, 정답 위치 52/51/51/51.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `poe` — `PoePowerDiagram`, JSON 키 `poe-power`

- 물음형 제목 예: `PoE 스위치는 랜선 하나로 무엇을 함께 보낼까?`
- 그릴 것: 위에 `SW01`(PSE — 곁말이나 그룹 라벨), 아래에 `AP01`·`CAM01`(PD), 그 사이 데이터 경로와 전원 경로(다른 id — 전원 경로는 `SW01`에서 PD 쪽으로만 화살표). 오른쪽이나 아래에 PoE를 지원하지 않는 장치 노드를 둘 수 있다(step 12가 검출의 근거를 찾았을 때만).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `data` | 데이터 | `SW01`·`AP01`·`CAM01`과 데이터 경로 | 여느 스위치처럼 프레임을 주고받는다 |
  | `power` | 전원 | `SW01`·`AP01`·`CAM01`과 전원 경로 | 같은 랜선으로 PSE가 PD에 전원을 보낸다 |

- 요점 테스트: `power`에서 보이는 경로가 모두 `SW01`에서 시작한다. `data`와 `power`의 보이는 경로 id 집합이 겹치지 않는다.

#### 3-2. `pxe` — `PxeBootDiagram`, JSON 키 `pxe-boot`

- 물음형 제목 예: `디스크가 빈 컴퓨터는 어디서 부팅 파일을 받을까?`
- 그릴 것: `PC05`(NIC — 곁말), DHCP 서버 노드, 부팅 서버 `SRV01`(`192.0.2.10`), 그리고 「부팅 파일 실행」 노드. 차례마다 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `dhcp` | 1. 주소 받기 | `PC05`·DHCP 서버와 그 경로 | DHCP로 주소와 부팅 서버·부팅 파일 이름을 받는다 |
  | `tftp` | 2. 파일 받기 | `PC05`·`SRV01`과 그 경로 | 부팅 서버에서 TFTP로 부팅 파일을 받는다 |
  | `run` | 3. 실행 | `PC05`·「부팅 파일 실행」과 그 경로 | 받은 파일을 실행해 운영 체제 설치 같은 다음 일을 시작한다(본문의 말대로) |

- 요점 테스트: 시나리오마다 `PC05`가 선명하고 상대 노드가 다르다(DHCP 서버·`SRV01`·실행 노드). `tftp`에서 보이는 경로의 화살표는 `SRV01` → `PC05` 쪽이다(파일이 오는 방향).

위 도식 설계는 출발점이다. 본문(step 12 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

### 4. 주제 `network-devices` 통독

쓰기를 마친 뒤 **주제 `network-devices`의 열 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이, 같은 사실을 여러 곳이 다르게 말하는 곳 — 예: 계층의 이름, 게이트웨이의 두 뜻, 역방향 프록시를 푼 자리, 가상 주소·상태 확인의 말, 「자격시험은」 줄의 꼴)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다. 도식 열 개의 문구도 함께 읽는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 340개, 마지막 id는 `n340`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 전력 값·해가 step 12의 기록과 같은가. PXE의 차례가 step 12의 절과 하나씩 맞는가.
3. n340의 보기 넷을 step 12의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. 주제 `network-devices`의 열 개념을 통독한다(「작업」 4). 도식 열 개의 문구도 함께 읽는다.
5. `phases/82-network-devices-wireless-security/index.json`의 step 14를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(「앞 개념에 고칠 것」에 통독 결과).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`network-security`의 개념을 만들지 마라.** 이유: step 16~19의 범위다.
- **PoE의 전력 등급표 전체·전압·쌍 배치, PXE 펌웨어·UEFI 부팅 세부, WDS 설치 절차를 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 9~13의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
