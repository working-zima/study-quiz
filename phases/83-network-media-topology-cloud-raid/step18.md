# Step 18: raid-basics-raid0

## 배경

phase 83은 네트워크 과목의 `transmission-media`·`network-topology`·`cloud-sdn`·`raid-storage`를 만든다. 전체 계획·결정·공통 규칙은 `phases/83-network-media-topology-cloud-raid/guide.md`에 있다.
**이 step은 주제 `raid-storage`를 만들고 그 첫 개념 둘(1 RAID, 2 RAID 0)의 글·문항·도식을 함께 만든다.** 2는 1에 딸린 개념이다.
이 주제는 주제 지도 42번, 과목의 마지막 주제라 `windows-admin-tools` 바로 뒤(= `topics.json` 배열의 끝)에 들어간다. 디스크·파티션은 `linux-filesystem`이 풀었지만 이 주제에서도 한 줄로 다시 푼다(guide.md 「배경」).

기출은 RAID의 특징에서 「메모리 용량이 는다」·「여러 논리 드라이브를 하나의 물리 드라이브로 쓴다」가 틀린 말임을 묻고([기출 2024-08-25 #47]·[기출 2025-02-23 #50]), RAID 0에서 「하나가 손상돼도 복구된다」가 틀린 말임을 묻는다([기출 2025-05-25 #46], 지문 누락 [기출 2024-05-19 #49]·[기출 2025-11-02 #46] — 오답 Linear RAID·RAID 1·RAID 5).

## 읽어야 할 파일

- guide.md 「개념을 넣는 step의 공통 — 읽어야 할 파일」 전부. 그에 더해:
- `phases/83-network-media-topology-cloud-raid/index.json`의 step 17 `summary`(RAID의 뜻·세 방법·핫 스왑·재구축·백업, 레벨 표, 연결(Linear), 기출 판정, E 번호, 한국어 이름)
- `src/data/network/topics.json` — `linux-filesystem.partition`·`disk-device-names`(디스크 — 뜻을 맞춘 한 줄), `windows-hyperv.virtual-machines`(가상 하드 디스크 — 헷갈리지 않게)
- 도식 선례: `EncapsulationDiagram`·`TftpBlocksDiagram`(칸 줄), `LoadBalancerPoolDiagram`(하나가 여럿 앞에), `PartitionLayoutDiagram`(있으면 — 디스크 칸)과 그 테스트

## 작업

### 1. 개념 — `src/data/network/topics.json`

`windows-admin-tools` 주제 객체 바로 뒤에 주제 객체를 끼운다 — 배열의 마지막이다. `{ "id": "raid-storage", "title": "RAID와 스토리지", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 2(★★☆, 출제 8/11회)인지 `data.test.ts`의 주제 지도 표와 견준다. 끼운 자리의 `  }` / `,` / `  {` 줄 꼴과, 마지막 주제 뒤에 쉼표 없이 `]`가 오는지 본다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `raid-storage.raid` | RAID | — | 이 주제의 첫 개념이라 디스크(한 줄)를 푼다. RAID의 뜻과 이름 풀이(step 17 결과대로), 논리 디스크, 세 방법(스트라이핑·미러링·패리티 — 한 줄씩, 딸린 개념이 자세히), RAID 레벨(한 줄), 핫 스왑·재구축(근거대로), RAID는 메모리가 아니라 디스크를 묶는다·여러 물리 디스크를 논리 디스크 하나로 보인다, 백업과의 관계(근거대로 — E가 있으면 「자격시험은」 한 줄). **물리 디스크와 논리 디스크**(4절). 예: 서버 `SRV01`에 디스크 `DISK0`~`DISK3`을 RAID로 묶으면 운영 체제에는 디스크 하나가 보인다 |
| 2 | `raid-storage.raid-0` | RAID 0 | `raid-storage.raid` | 스트라이핑만 하는 레벨(step 17 결과대로), 빨라지는 까닭(디스크 여럿이 동시에), 용량(합), 디스크 최소 수, 하나만 고장 나도 전체를 잃는 까닭(조각이 흩어져 있다), 연결(Linear)과의 차이(근거가 있을 때만). **RAID 0과 RAID 1**(4절 — RAID 1은 이 자리에서 한 줄로), **RAID 0과 연결**(4절 — 근거가 있을 때만). 계산 예: 2TB 디스크 넷을 RAID 0으로 묶으면 8TB, 조각 A1~A8이 `DISK0`→`DISK1`→`DISK2`→`DISK3` 차례로 두 바퀴 놓인다(단계대로) |

이 주제의 단위 표기(`2TB` 꼴 등)를 이 step이 정한다 — summary에 적는다.

### 2. 문항 — `src/data/network/questions.json`에 `n384`~`n386`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n384` | `raid` | 예/아니요 「개념 확인」 — **아니요** 쪽으로 세운다. 기출의 「논리를 물리로」 뒤집은 오해를 겨냥하되 기출 문장·묶음을 쓰지 않는다 — 예: 디스크 셋을 RAID로 묶은 서버 `SRV05`에서, 운영 체제는 묶인 디스크 셋을 저마다 따로인 디스크 셋으로 보나요?(아니요 — 논리 디스크 하나로 본다, step 17 결과대로). 해설은 RAID가 무엇을 묶어 무엇으로 보이는지와 그 까닭을 가르친다 |
| `n385` | `raid-0` | 4지선다 「계산」 — 본문과 다른 수. 예: 1TB 디스크 셋을 RAID 0으로 묶으면 쓸 수 있는 용량은(정답 3TB — 오답 1TB(RAID 1로 착각)·2TB(RAID 5로 착각)·1.5TB 같은 흔한 실수, step 17의 용량 공식대로). 해설은 레벨마다 용량을 단계대로 견준다. 기출 묶음(RAID 0의 설명 넷, Linear·0·1·5)을 쓰지 않는다. **정답 위치 0** |
| `n386` | `raid-0` | 예/아니요 「원인과 결과」 — **예** 쪽으로 세운다. 예: 디스크 넷을 RAID 0으로 묶은 서버에서 디스크 하나가 고장 났다. 나머지 셋이 멀쩡해도 그 묶음에 저장한 파일을 온전히 읽을 수 없게 되나요?(예 — 조각이 모든 디스크에 흩어져 있다, step 17 결과대로). n385와 다른 것을 묻는다. 해설은 RAID 0에 중복이나 패리티가 없다는 것과 그래서 무엇을 대가로 무엇을 얻는지를 가르친다 |

이 step이 끝나면 예 79·아니요 78, 정답 위치 58/57/57/57이다(guide.md 「문항」 9항). 문항 글에 백틱을 쓰지 않는다.

### 3. 도식

이 step이 `src/data/network/visuals/raid-storage.json`을 만들고 `src/data/network/index.ts`에 import(`raidStorageVisuals` — 경로 알파벳순, `protocols-encapsulation.json` 뒤)와 `visualsByTopicId`의 `'raid-storage': raidStorageVisuals`(`'windows-admin-tools'` 바로 뒤 — 맨 끝)를 넣는다.

#### 3-1. `raid` — `RaidArrayDiagram`, JSON 키 `raid-array`

- 물음형 제목 예: `RAID로 묶은 디스크는 운영 체제에게 어떻게 보일까?`
- 그릴 것: 위에 「운영 체제」, 가운데 「논리 디스크」, 아래 「RAID 묶음」 그룹 박스 안에 `DISK0`~`DISK3`(280 폭에서 두 줄로 둘씩). 운영 체제 → 논리 디스크 경로, 논리 디스크 → 디스크 넷 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `os-view` | 운영 체제가 보는 것 | 운영 체제·논리 디스크와 그 경로 | 운영 체제에는 디스크 하나만 보인다 |
  | `physical` | 실제로 놓인 것 | 논리 디스크·디스크 넷과 그 경로 | 실제로는 물리 디스크 넷에 나눠 두거나 겹쳐 둔다(본문대로) |

- 요점 테스트: 「운영 체제」에서 나간 보이는 경로가 `os-view`에서 하나이고 그 끝이 「논리 디스크」다(디스크 넷에 바로 닿지 않는다). `physical`에서 「논리 디스크」에서 나간 보이는 경로가 넷이다.

#### 3-2. `raid-0` — `RaidStripingDiagram`, JSON 키 `raid-striping`

- 물음형 제목 예: `RAID 0은 파일 조각을 디스크에 어떻게 놓을까?`
- 그릴 것: 디스크 넷(`DISK0`~`DISK3` — 그룹 박스 넷, 280 폭에서 두 줄로 둘씩, 440 폭에서 한 줄에 넷), 디스크마다 조각 칸 둘(A1·A5 / A2·A6 / A3·A7 / A4·A8 — 본문 예와 같은 차례). 칸 노드는 디스크 그룹 안에 세로로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `stripe` | 나눠 놓기 | 조각 칸 여덟 | 조각을 디스크마다 차례로 번갈아 놓는다 — 넷이 함께 읽고 쓴다 |
  | `fail` | 디스크 하나의 고장 | `DISK1`의 칸(A2·A6)을 뺀 칸(그 둘은 흐림) | A2·A6을 잃어 파일 전체를 온전히 읽지 못한다(본문대로) |

- 요점 테스트: 조각 칸 이름의 차례가 디스크를 번갈아 놓인다(A1이 `DISK0`, A2가 `DISK1`, …, A5가 다시 `DISK0` — 칸 노드가 어느 디스크 그룹 박스 안에 있는지 좌표로). `fail`에서 흐린 칸이 `DISK1` 그룹 안의 둘뿐이다.

위 도식 설계는 출발점이다. 본문(step 17 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 386개, 마지막 id는 `n386`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json` 배열의 마지막(`windows-admin-tools` 바로 뒤)에 있고, `importance` 2·`sourcePages` [0, 0]인지, 데이터 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 계산 예(8TB, 조각의 차례)를 손으로 다시 따진다.
4. n385의 보기 넷을 step 17의 용량 공식으로 하나씩 따져 정답이 하나뿐인지 본다.
5. guide.md 「검증 절차의 끝」대로 `phases/83-network-media-topology-cloud-raid/index.json`의 step 18을 갱신한다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~5를 만들지 마라.** 이유: step 19·20의 범위다. RAID 1·5는 이 step에서 이름과 한 줄만 쓴다.
- **하드웨어·소프트웨어 RAID의 구현 차이, RAID 6·10을 쓰지 마라.** 이유: 기출이 묻지 않는다(guide.md 「배경」).
