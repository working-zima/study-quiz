# Step 3: speeds-nic

## 배경

phase 72는 네트워크 과목의 `ethernet`(이더넷과 프레임)과 `hub-switch-vlan`(허브·스위치·VLAN)을 만든다. 전체 계획·결정·공통 규칙은 `phases/72-network-ethernet-switch/guide.md`에 있다.
step 2가 주제 `ethernet`과 개념 1~2(이더넷, 이더넷 규격 이름)를 글·문항·도식과 함께 만들었다.
**이 step은 개념 3 패스트 이더넷과 기가비트 이더넷, 4 NIC의 글·문항·도식을 만든다.** 3은 규격 이름 읽기(개념 2)에서 이어지는 세대 이름이고 기출이 세 번 물었다(100BASE-T 계열의 이름).
4는 장치를 LAN에 잇는 하드웨어이고, 링크 속도로 3과 이어진다. 다음 step 4가 MAC 주소와 이더넷 프레임을 잇는다.

## 읽어야 할 파일

- **`phases/72-network-ethernet-switch/guide.md` 전체.** **이 문서를 따른다**
- `phases/72-network-ethernet-switch/index.json`의 step 0~2 `summary` — 특히 step 0의 b~d(세대 이름·규격 번호)와 g(NIC가 받아들이는 프레임)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-057**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch2-1 이더넷」 절과 수정 이력, `docs/source/network/standards.md`(step 0의 항목), `docs/source/network/exam-notes.md`(step 0의 E 항목)
- `docs/source/network/raw/lecture.md`의 p55, p57, p65~p66 — 원문 확인용(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- **`src/data/network/topics.json`의 `ethernet` 주제(step 2가 쓴 개념 1~2)** — 이미 푼 낱말을 다시 풀지 않고, 같은 것을 같은 이름으로 부른다
- `src/data/network/questions.json`, `src/data/network/visuals/ethernet.json`, `src/data/network/data.test.ts`(목록 항목·`parentId` 규칙), `src/data/index.test.ts`의 예/아니요 불변식
- 도식 선례(guide.md 「도식」)와 step 2가 만든 `EthernetLayersDiagram`·`StandardNameDiagram`과 그 테스트, `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 둘 — `ethernet` 주제의 `concepts` 끝에

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `ethernet.fast-gigabit` | 패스트 이더넷과 기가비트 이더넷 | `ethernet.ethernet` | **목록 개념** — 소개 문단 하나 뒤에 `- **패스트 이더넷**(Fast Ethernet)은 …`, `- **기가비트 이더넷**(Gigabit Ethernet)은 …`. 속도, 규격 번호, 대표 이름(100BASE-TX / 1000BASE-T·1000BASE-SX)과 케이블. 목록 뒤 문단으로 10기가비트 이더넷(802.3ae, 10GBASE-T는 802.3an). 이름이 허용한 출처에 없으면 step 0이 만든 E 항목대로 「자격시험은 ~라 부른다」를 쓴다. 이름만 보고 속도를 아는 법(개념 2)과 이어지게 쓰고, 개념 2가 이미 푼 케이블·이름 읽기를 되풀이하지 않는다 |
| 4 | `ethernet.nic` | NIC (Network Interface Card) | — | 무엇(컴퓨터를 LAN에 잇는 하드웨어 — 랜카드, USB 랜 어댑터, 메인보드에 붙은 것)과 하는 일(케이블로 들어온 신호를 컴퓨터에 넘김, 받은 프레임이 자기 앞으로 온 것인지 보고 아니면 버림, 링크 속도). 「자기 앞으로 온 것」을 무엇으로 판단하는지 말하려면 MAC 주소가 필요하다 — 이 개념에서는 「NIC마다 붙은 주소(MAC 주소, 바로 다음 개념)」로 한 줄만 풀고 자세히는 개념 5에 둔다. 브로드캐스트 프레임을 받아들인다는 것은 step 0이 확인했을 때만 쓴다. 링크 속도는 개념 3의 세대와 이어 말할 수 있다(출처 범위에서) |

### 2. 문항 — `n028`~`n030`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n028` | `fast-gigabit` | 4지선다 — 100 Mb/s 규격 계열을 무엇이라 부르는지. 정의에서 이름만 지운 꼴이 되지 않게 상황(예: 네트워크 장비 상자에 적힌 100BASE-TX)을 준다. 오답은 같은 범주(이더넷 세대 이름) |
| `n029` | `fast-gigabit` | 4지선다 — 1 Gb/s로 광케이블을 쓰는 규격을 고르게 한다. 오답은 이 주제 본문에 나오는 다른 규격 이름(1000BASE-T, 10GBASE-T, 2.5GBASE-T 등)에서. `n028`과 다른 것을 묻는다 |
| `n030` | `nic` | 「원리 이해」 — NIC가 받은 프레임을 컴퓨터에 넘기는지 버리는지를 목적지 주소로 판단하는 상황. 예/아니요든 4지선다든 정답이 출처의 사실(강의 p66, step 0)로 정해지게 한다. 브로드캐스트를 다룰 거면 본문에 그 사실이 있어야 한다 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다.

### 3. 도식 — `src/data/network/visuals/ethernet.json`의 `diagrams`에 더한다

#### 3-1. `ethernet.fast-gigabit` — `EthernetSpeedsDiagram`, JSON 키 `ethernet-speeds`

- 물음형 제목 예: `패스트 이더넷과 기가비트 이더넷은 얼마나 빠를까?`
- 그릴 것: 속도가 커지는 차례로 놓은 세대 셋 이상(본문에 나오는 것 — 100 Mb/s 패스트, 1 Gb/s 기가비트, 10 Gb/s 10기가비트). 칸 곁에 대표 규격 이름.
  막대 길이로 속도를 비례해 그리지 않는다(10배씩 차이 나 그릴 수 없다) — 위치와 라벨로 차례를 보인다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `fast` | 패스트 이더넷 | 100 Mb/s 칸과 100BASE-TX | 100 Mb/s 규격 계열의 이름과 규격 번호 |
  | `gigabit` | 기가비트 이더넷 | 1 Gb/s 칸과 1000BASE-T·1000BASE-SX | 같은 1 Gb/s라도 트위스티드 페어(1000BASE-T)와 광케이블(1000BASE-SX) 규격이 따로 있다 |

- 요점 테스트: `gigabit`에서 1 Gb/s 칸에 딸린 규격 이름이 둘이고 서로 다른 매체를 가리킨다. 세대 칸이 속도 차례로 놓여 있다(세로형은 위에서 아래, 가로형은 왼쪽에서 오른쪽).

#### 3-2. `ethernet.nic` — `NicFilterDiagram`, JSON 키 `nic-filter`

- 물음형 제목 예: `NIC는 들어온 프레임을 모두 컴퓨터에 넘길까?`
- 그릴 것: 컴퓨터 안의 NIC(그룹 박스로 컴퓨터를 두르고 그 안에 NIC 노드), 케이블 쪽에서 들어오는 프레임, 컴퓨터 쪽으로 넘기는 길.
  NIC의 주소를 곁말로 쓰려면 그 주소(guide.md 「예시 값」)가 본문에 있어야 한다 — 없으면 `내 주소`·`다른 장치의 주소` 같은 이름표로 그린다.
- 시나리오:

  | id | label | 경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `mine` | 내 주소로 온 프레임 | 프레임이 NIC를 지나 컴퓨터로 넘어가는 경로, 곁말에 목적지 = 이 NIC의 주소 | 목적지가 자기 주소면 받아서 컴퓨터에 넘긴다 |
  | `other` | 다른 장치 앞으로 온 프레임 | 컴퓨터로 가는 경로가 없고 NIC 곁에 `버림` 같은 본문의 말 | 목적지가 다른 장치면 컴퓨터에 넘기지 않고 버린다 |

  본문이 브로드캐스트 프레임을 받아들인다고 쓰면 `broadcast` 시나리오를 더해도 된다.
- 요점 테스트: `mine`에만 NIC에서 컴퓨터로 가는 경로가 보이고, `other`에서는 그 경로가 보이지 않는다. 두 시나리오의 목적지 곁말이 서로 다르다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~11)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 30개, 마지막 id는 `n030`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다. `ethernet` 주제의 개념 1~2 줄과 `n026`~`n027`, step 2의 도식 파일이 바뀌지 않았는지 기계로 확인한다.
2. `parentId`가 두 단·연속 규칙을 지키는가(개념 3이 개념 2 바로 뒤에 붙어 있고, 개념 4는 머리 없음).
3. `ethernet` 주제를 개념 1부터 4까지 통독한다 — NIC·Mb/s·Gb/s가 처음 나오는 자리에서 풀렸는가, 같은 것을 두 이름으로 부르지 않는가(예: NIC를 랜카드·네트워크 인터페이스로 섞어 부르지 않는다 — 별칭은 한 번 밝히고 이름 하나로 쓴다).
4. `phases/72-network-ethernet-switch/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **MAC 주소와 이더넷 프레임·그 필드(개념 5~8)를 만들지 마라.** 이유: step 4·5의 범위다. NIC가 프레임을 판단한다고 말할 때 프레임과 MAC 주소는 한 줄 풀이로 그친다.
- **step 0이 확인하지 못한 세대 이름이나 규격 번호를 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 시험만 그렇게 부르면 「자격시험은」 줄로 쓴다.
- **25G·40G·100G 이더넷처럼 기출이 묻지 않는 세대를 목록 항목으로 늘리지 마라.** 이유: 기출이 묻는 사실과 그 바탕만 쓴다(ADR-059). 규격 이름 읽기(개념 2)의 예로 나오는 것은 괜찮다.
