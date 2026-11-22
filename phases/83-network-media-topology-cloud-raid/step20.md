# Step 20: network-storage-review

## 배경

phase 83은 네트워크 과목의 `transmission-media`·`network-topology`·`cloud-sdn`·`raid-storage`를 만든다. 전체 계획·결정·공통 규칙은 `phases/83-network-media-topology-cloud-raid/guide.md`에 있다.
**이 step은 `raid-storage`의 마지막 개념(5 DAS·NAS·SAN)의 글·문항·도식을 만들고, 주제 전체(5개념)를 통독한다.** phase 83의 마지막 step이다.
쓰기를 마친 뒤 주제 전체를 통독하는 데 시간을 쓴다.

기출은 조건이 빠진 문항에서 서버가 쓸 네트워크 스토리지로 SAN을 고르게 한다([기출 2025-05-25 #37] — 오답 NAS·RAID·SSD).

## 읽어야 할 파일

- guide.md 「개념을 넣는 step의 공통 — 읽어야 할 파일」 전부. 그에 더해:
- `phases/83-network-media-topology-cloud-raid/index.json`의 step 17 `summary`(DAS·NAS·SAN·파일과 블록·파이버 채널·iSCSI, E 번호)와 step 18·19 `summary`
- `src/data/network/topics.json` — **`raid-storage`의 앞 개념 넷**, `windows-server-roles.file-print-services`(파일 서버 — 뜻을 맞춘다), `linux-filesystem.filesystem-mount`(파일 시스템 — 블록과 파일을 가를 때 뜻을 맞춘다)
- 도식 선례: `RaidArrayDiagram`(이 phase), `VpnSiteTypesDiagram`·`WirelessLanModesDiagram`(구성 갈래), `VirtualSwitchTypesDiagram`(갈래별 연결)과 그 테스트

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `raid-storage` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `raid-storage.network-storage` | DAS·NAS·SAN | — | **목록 개념**. 소개 문단 — 서버가 저장 장치를 어떻게 이어 쓰는가로 가른다(step 17 결과대로). 항목 셋(DAS·NAS·SAN — 「- **SAN**(storage area network)은 …」 꼴, step 17의 말대로). 항목 뒤 문단: 파일 단위와 블록 단위 접근(한 줄씩), 파이버 채널·iSCSI(이름 한 줄씩 — iSCSI는 RFC 7143), Windows Server의 iSCSI 대상 서버(근거가 있을 때만 한 줄), RAID는 저장 장치 안에서 디스크를 묶는 기술이고 DAS·NAS·SAN은 서버가 저장 장치를 잇는 방식이라는 것(앞 개념 `raid`와 뜻을 맞춘다). **NAS와 SAN**(4절 — 파일인가 블록인가, LAN인가 전용 네트워크인가), **DAS와 SAN**(4절). 예: 서버 `SRV01`·`SRV02`가 SAN으로 저장 장치 `STOR01`의 디스크를 블록 단위로 쓰고, 사무실 PC들은 LAN으로 `NAS01`의 공유 폴더를 파일 단위로 쓴다 |

### 2. 문항 — `src/data/network/questions.json`에 `n389`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n389` | `network-storage` | 4지선다 「상황 적용」 — 기출 묶음(NAS·SAN·RAID·SSD)을 쓰지 않는다 — 보기는 DAS·NAS·SAN과, 이 주제에서 헷갈리는 다른 하나(예: RAID 5처럼 저장 장치 안의 기술 — 정답과 범주가 다르면 오답이 너무 쉬워지므로, 같은 범주의 그럴듯한 것을 step 17 결과 안에서 고른다. 셋째 연결 방식이 없으면 「파일 서버」처럼 본문에 있는 것). 예: 서버 두 대가 저장 장치 하나의 디스크를 자기 디스크처럼 블록 단위로 쓰고, 그 연결은 사무실 PC들이 쓰는 LAN과 따로 둔 네트워크로 하려 한다. 어느 방식인가(정답 SAN). 정답의 이름이 문제문에 나오지 않게 한다(「storage area network」 같은 풀이도). **정답 위치 2** |

이 step이 끝나면 예 79·아니요 79, 정답 위치 58/58/58/57이다(guide.md 「문항」 9항). 문항 글에 백틱을 쓰지 않는다.

### 3. 도식 — `StorageAttachDiagram`, JSON 키 `storage-attach`

- 물음형 제목 예: `서버는 저장 장치를 어떻게 이어 쓸까?`
- 그릴 것: 갈래 셋 — DAS(`SRV01` → 바로 이은 디스크 노드), NAS(사무실 PC 노드 → 「LAN」 → `NAS01`), SAN(`SRV01`·`SRV02` → 「전용 네트워크」 → `STOR01`). 갈래마다 노드 id를 따로 둔다(`SRV01`이 두 갈래에 나오면 id를 달리한다). 곁말로 「파일 단위」·「블록 단위」. 280 폭에서는 갈래를 위아래로 쌓는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `das` | DAS | DAS 갈래의 노드와 경로 | 서버 한 대에 저장 장치를 바로 잇는다 |
  | `nas` | NAS | NAS 갈래의 노드와 경로 | LAN으로 여러 컴퓨터에게 파일 단위로 내준다 |
  | `san` | SAN | SAN 갈래의 노드와 경로 | 따로 둔 네트워크로 서버들이 블록 단위로 쓴다 |

- 요점 테스트: 세 시나리오의 선명한 노드 집합이 서로 겹치지 않는다. `nas`의 보이는 경로가 「LAN」 노드를 지나고, `san`의 보이는 경로가 「전용 네트워크」 노드를 지나며 「LAN」 노드를 지나지 않는다.

위 도식 설계는 출발점이다. 본문(step 17 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

### 4. 주제 `raid-storage` 통독

쓰기를 마친 뒤 **주제 `raid-storage`의 다섯 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이, 같은 사실을 여러 곳이 다르게 말하는 곳 — 예: 레벨마다 용량을 말한 자리, 「논리 디스크」의 말, 백업과의 관계, 단위 표기)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다. 도식 다섯 개의 문구도 함께 읽는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 389개, 마지막 id는 `n389`다. 과목 전체에서 예/아니요 158개(예 79·아니요 79), 4지선다 231개(정답 위치 58/58/58/57)다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념을 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. DAS·NAS·SAN의 항목이 혼자 서지 않고 소개 문단에 이어지는가.
3. n389의 보기 넷을 step 17의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. 주제 `raid-storage`의 다섯 개념을 통독한다(「작업」 4). 도식 다섯 개의 문구도 함께 읽는다.
5. phase 83이 만든 개념이 30개(`transmission-media` 10·`network-topology` 8·`cloud-sdn` 7·`raid-storage` 5)이고 문항이 `n353`~`n389` 37개인지 node로 센다.
6. guide.md 「검증 절차의 끝」대로 `phases/83-network-media-topology-cloud-raid/index.json`의 step 20을 갱신한다(「앞 개념에 고칠 것」에 통독 결과).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **SAN의 파이버 채널 계층, NAS의 파일 공유 프로토콜 세부(SMB·NFS의 메시지), SSD를 쓰지 마라.** 이유: 기출이 묻지 않거나 허용한 출처의 근거가 없다(guide.md 「배경」).
- **step 18·19의 개념·문항·도식과 앞 세 주제를 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
