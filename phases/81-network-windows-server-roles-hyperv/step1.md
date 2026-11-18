# Step 1: roles-features-static-ip

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 주제 `windows-server-roles`를 만들고 그 첫 개념 둘(1 서버 역할과 기능, 2 서버의 고정 IP 주소)의 글·문항·도식을 함께 만든다.** 2는 1에 딸린 개념이다.
이 주제 화면만 읽고도 Windows Server·서버·역할의 뜻이 서게 쓴다.

기출은 FTP 서버를 서버 관리자의 역할 서비스로 설치할 수 있고 PowerShell로도 설치할 수 있다는 것([기출 2026-05-17 #44] — 설치 자리만 이 step의 몫)과,
DNS 서버를 설치하던 서버의 주소 문제를 고치는 방법으로 `ipconfig /renew`가 맞지 않다는 것([기출 2025-05-25 #43] — 지문이 그림이라 보기와 정답만 본다)을 묻는다.

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 0 `summary`(역할·역할 서비스·기능의 구분, 마법사 단계, 설치 cmdlet, 고정 IP 주소의 근거, 기출 판정, E 번호, 한국어 이름)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 0)」 줄과 항목), `docs/source/network/exam-notes.md`(E39~가 있으면 그 항목)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(`ip-address-types.static-dynamic-address`·`dhcp`, `diagnostic-commands.ipconfig-options`, `windows-ad.active-directory`·`domain-controller`, `windows-admin-tools.bitlocker`·`powershell` — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `BuiltinLocalGroupsDiagram`(관계), `AdForestStructureDiagram`(포함), `IpconfigOptionsDiagram`(설정 전과 뒤)과 그 테스트, `src/data/network/visuals/windows-ad.json`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2026-05-17 #44], [기출 2025-05-25 #43] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`windows-ad` 주제 객체 바로 뒤(= `windows-admin-tools` 주제 객체 앞)에 주제 객체를 끼운다 — `{ "id": "windows-server-roles", "title": "Windows Server의 서버 역할", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 2(★★☆, 출제 8/11회)인지 `data.test.ts`의 주제 지도 표와 견준다. 끼운 자리의 `  }` / `,` / `  {` 줄 꼴이 기존과 같은지 본다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `windows-server-roles.server-roles-features` | 서버 역할과 기능 | — | 이 주제의 첫 개념이라 **운영 체제**(컴퓨터를 움직이는 기본 프로그램), **서버**(네트워크의 다른 컴퓨터가 보낸 요청을 받아 일을 해 주는 컴퓨터)와 **클라이언트**(요청하는 쪽), **Windows Server**(서버로 쓰도록 만든 Windows)를 한 줄씩 푼다. 역할·역할 서비스·기능의 구분과 예(step 0 결과대로 — 한국어 화면 이름). 설치하는 두 자리 — 서버 관리자의 역할 및 기능 추가 마법사(단계 이름은 step 0이 확인한 만큼, 화면 꼴을 지어 보이지 않는다)와 PowerShell(Windows의 명령 셸 — 한 줄)의 `Install-WindowsFeature`·`Get-WindowsFeature`(꼴은 step 0 결과대로 — 명령 줄과 그것이 하는 일을 함께). 두 자리가 같은 일을 한다는 것. **역할과 역할 서비스와 기능이 무엇이 다른지**(4절). 예: `SRV01`에 DHCP 서버 역할을 설치(「예시 값」) — 마법사로 하는 차례와 같은 일을 하는 명령 한 줄 |
| 2 | `windows-server-roles.server-static-ip` | 서버의 고정 IP 주소 | `windows-server-roles.server-roles-features` | **IP 주소**(네트워크에서 장치를 가리키는 번호 — 한 줄), 고정 IP 주소와 DHCP로 받은 주소(DHCP — 장치에게 주소를 자동으로 정해 주는 통신 규칙, 한 줄)(`ip-address-types.static-dynamic-address`와 뜻을 맞춘다). 고정 주소를 써야 하는 서버와 까닭(step 0 결과대로 — 역할마다 문서의 말이 있는 것만). DHCP로 받은 주소에서 역할을 설치할 때 일(step 0 결과대로 — 근거가 없으면 쓰지 않는다). 고정 주소를 넣는 차례(메뉴 이름은 step 0 결과대로 — 주소·서브넷 마스크·기본 게이트웨이·DNS 서버를 한 줄씩 푼다). `ipconfig /renew`가 하는 일과 그것이 고정 주소를 만들지 않는 까닭(`diagnostic-commands.ipconfig-options`와 뜻을 맞춘다). 「자격시험은」 줄은 step 0이 E를 만들었을 때만. 예: `SRV01`에 `192.0.2.10`·`255.255.255.0`·기본 게이트웨이 `192.0.2.1`(「예시 값」 — RFC 5737의 문서용 주소라고 밝힌다) |

### 2. 문항 — `src/data/network/questions.json`에 `n284`~`n285`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n284` | `server-roles-features` | 4지선다 「개념 비교」 — 본문과 다른 서버(`SRV05` 등)에서 할 일 하나를 주고, 그 일이 역할·역할 서비스·기능 가운데 무엇으로 설치되는지, 또는 이미 설치된 역할 안에서 무엇을 더 골라야 하는지를 고르게 한다(step 0이 확인한 예 안에서). 오답은 같은 범주(다른 갈래로 잘못 읽은 것). **정답 위치 0**. FTP 서버 설치 기출의 보기 묶음(역할 서비스·서드파티·SFTP·PowerShell 불가)을 쓰지 않는다 |
| `n285` | `server-static-ip` | 예/아니요 「원인과 결과」 — **아니요** 쪽으로 세운다. 예: DHCP로 주소를 받던 서버(`SRV05`)에서 `ipconfig /renew`를 실행하면, 그 서버의 IP 주소가 바뀌지 않는 고정 주소로 설정되나요?(아니요 — DHCP 서버에게 임대를 다시 받을 뿐, step 0 결과대로). 해설은 고정 주소를 넣는 자리와 서버가 고정 주소를 쓰는 까닭을 가르친다. 기출의 보기 묶음을 쓰지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 56·아니요 56, 정답 위치 44/43/43/43.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

이 step이 `src/data/network/visuals/windows-server-roles.json`을 만들고 `src/data/network/index.ts`에 import(`windowsServerRolesVisuals` — 경로 알파벳순)와 `visualsByTopicId`의 `'windows-server-roles': windowsServerRolesVisuals`(`'windows-ad'` 바로 뒤)를 넣는다.

#### 3-1. `server-roles-features` — `RoleServiceFeatureDiagram`, JSON 키 `role-service-feature`

- 물음형 제목 예: `서버에 무엇을 설치하면 어떤 일을 맡게 될까?`
- 그릴 것: 서버 `SRV01`(그룹 박스) 안에 역할 갈래(그룹 박스 — 역할 둘쯤, 그 가운데 하나 안에 역할 서비스 노드)와 기능 갈래(기능 노드 하나쯤) — 노드 이름은 본문의 예만. 서버 밖에 설치하는 두 자리(역할 및 기능 추가 마법사·`Install-WindowsFeature`) 노드를 두고 서버로 잇는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `role` | 역할 | 역할 노드와 그 역할 서비스 | 역할은 서버가 다른 컴퓨터에게 해 주는 일이고, 역할 서비스는 그 안에서 고르는 구성 요소다 |
  | `feature` | 기능 | 기능 노드 | 기능은 서버 자신의 일을 돕는다(본문의 말대로) |
  | `install` | 설치하는 자리 | 두 자리 노드와 서버로 가는 경로 둘 | 마법사와 명령이 같은 일을 한다 |

- 요점 테스트: `role`과 `feature`의 선명한 노드 집합이 겹치지 않는다. `install`에서 보이는 경로 둘이 각각 다른 자리 노드에서 시작해 같은 서버 박스(또는 그 안의 같은 노드)에 닿는다.

#### 3-2. `server-static-ip` — `ServerStaticIpDiagram`, JSON 키 `server-static-ip`

- 물음형 제목 예: `서버의 주소는 왜 바뀌지 않게 두어야 할까?`
- 그릴 것: 서버 `SRV01` 노드, 그 주소 노드(`192.0.2.10`), 서버를 주소로 찾아오는 클라이언트 노드(`PC01` 등 — 본문에 나온 것만), 그리고 두 결과 갈래 — 고정 주소일 때(주소 그대로)와 `ipconfig /renew`를 실행했을 때(DHCP 서버에게 다시 받은 주소 — 본문의 말).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `static` | 고정 주소 | 서버·고정 주소 노드·클라이언트와 그 경로 | 사람이 넣은 주소는 바뀌지 않아 클라이언트가 계속 찾아온다 |
  | `renew` | ipconfig /renew | 서버·DHCP 서버 노드·다시 받은 주소 노드 | 임대를 다시 받을 뿐 주소는 여전히 DHCP로 받은 주소다 |

- 요점 테스트: `static`과 `renew`의 결과 노드가 다른 id·다른 자리다. `renew`에서 보이는 경로가 서버와 DHCP 서버 노드를 잇고, `static`의 고정 주소 노드는 흐리다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 285개, 마지막 id는 `n285`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `windows-ad` 바로 뒤·`windows-admin-tools` 바로 앞에 있고, `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가.
4. n284의 보기 넷을 step 0의 구분으로 하나씩 따져 정답이 하나뿐인지 본다.
5. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~23을 만들지 마라.** 이유: step 2~14의 범위다. DHCP 서버·웹 서버(IIS)는 예로 이름만 쓰고 자세히 풀지 않는다.
- **DNS 서버·DHCP 서버의 설정을 쓰지 마라.** 이유: DNS는 `dns` 주제의 몫이고 DHCP 서버 설정은 step 2·3의 범위다. 이 step은 「주소가 바뀌지 않아야 하는 까닭」까지만.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
