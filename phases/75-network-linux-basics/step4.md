# Step 4: device-names-mount

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-filesystem`의 개념 둘(7 디스크 장치 이름, 8 파일 시스템과 마운트)의 글·문항·도식을 함께 만든다.** 디스크 장치 이름은 `partition`에 딸린 개념이고, 파일 시스템과 마운트는 새 머리 개념이다.

기출은 `/dev/sda5`를 해석하는 문항(「다섯째 물리 디스크」가 틀린 해석), 새 디스크를 쓰는 차례(`fdisk`·`mkfs`·`mount`)와 관계없는 명령을 물었다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 0~3 `summary`(특히 step 0의 g·h와 `sd`·「다섯 번째 파티션」 처리)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-filesystem` 주제(앞 step이 쓴 개념 — 특히 `partition`·`mbr-gpt`의 주 파티션·논리 파티션 번호. **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-filesystem.json`
- 앞 step의 도식(`PartitionLayoutDiagram`·`MbrGptDiagram` 등)과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-filesystem` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `linux-filesystem.disk-device-names` | 디스크 장치 이름 | `linux-filesystem.partition` | Linux는 디스크와 파티션 같은 장치도 `/dev` 아래의 **장치 파일**로 나타내고, 프로그램은 그 파일을 열어 장치를 다룬다(근거대로). **드라이버**(장치를 다루는 커널의 부분)를 한 줄로 푼다. 이름 `/dev/sda5`를 덩어리로 끊어 읽는 법을 단계대로 보인다 — `/dev/`(장치 파일 디렉터리), `sd`(`sd` 드라이버가 다루는 디스크 — 무슨 디스크인지는 step 0 결과대로), `a`(첫째 디스크, `b`는 둘째), `5`(파티션 번호). 파티션 번호 없이 `/dev/sda`는 디스크 전체. MBR 디스크에서 1~4는 주 파티션·확장 파티션, 5부터 논리 파티션이라 `/dev/sda5`는 첫째 디스크의 첫 논리 파티션이다 — 수 5가 디스크의 차례가 아니라는 것(4절). 예는 시스템 디스크 `/dev/sda`와 새 디스크 `/dev/sdb`·`/dev/sdb1`(guide.md 「예시 값」). 「자격시험은」 줄(SATA 등)은 step 0 결과대로 |
| 8 | `linux-filesystem.filesystem-mount` | 파일 시스템과 마운트 | — | **파일 시스템**(파티션에 파일을 이름과 디렉터리로 저장하고 찾는 구조 — 예 `ext4`)과 **마운트**(그 파일 시스템을 디렉터리 나무의 한 디렉터리, 곧 마운트 지점에 붙이는 일)를 차례로 쓴다. 명령과 결과를 함께 보인다 — `mkfs.ext4 /dev/sdb1`로 파일 시스템을 만들고, `mount /dev/sdb1 /data` 뒤에는 `/data` 아래가 새 디스크의 내용, `umount /data`로 뗀다(마운트 지점 `/data`가 미리 있는 빈 디렉터리라는 것은 근거대로). 새 디스크를 쓰는 차례 — 나누기(`fdisk`) → 파일 시스템 만들기(`mkfs`) → 붙이기(`mount`) — 를 문단 하나로 묶는다. 파티션과 파일 시스템이 무엇이 다른지(4절 — 구역과 그 안의 저장 구조). `mkfs`가 형식별 명령(`mkfs.ext4` 등)의 앞단이라는 것, `mount`만 한 것은 다시 켜면 풀린다는 것은 step 0 결과대로(뒤 것은 `/etc/fstab`을 한 줄로 풀고 넘어간다) |

### 2. 문항 — `n118`~`n119`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n118` | `disk-device-names` | 4지선다 「원리 이해」 — MBR 디스크라는 조건에서 `/dev/sdb6`이 가리키는 것 → 둘째 디스크의 둘째 논리 파티션. 오답은 흔한 잘못 읽기에서 — 여섯째 디스크(수를 디스크 차례로 읽음), 둘째 디스크의 여섯째 주 파티션(주 파티션이 1~4라는 것을 놓침), 첫째 디스크의 여섯째 파티션(`b`를 첫째로 읽음). 정답 위치는 균형대로. 해설은 덩어리마다 읽는 법을 단계대로 보인다 |
| `n119` | `filesystem-mount` | 예/아니요 「오해 바로잡기」 — 새 디스크의 파티션에 `mkfs`로 파일 시스템을 만들기만 하면 디렉터리 나무에서 바로 그 디스크의 파일에 닿을 수 있는가(아니요 — 마운트 지점에 붙여야 한다). step 2가 끝난 뒤의 균형(계획대로면 예 21·아니요 21)에서 **아니요** 쪽으로 세운다. 해설은 만들기와 붙이기의 차이와 `mount`의 꼴을 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 `/dev/sda5` 해석 보기 넷을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식 — `src/data/network/visuals/linux-filesystem.json`에 더한다

#### 3-1. `linux-filesystem.disk-device-names` — `DiskDeviceNameDiagram`, JSON 키 `disk-device-name`

- 물음형 제목 예: `/dev/sda5는 어떻게 읽을까?`
- 그릴 것: 이름 `/dev/sda5`를 덩어리 노드 넷으로 — `/dev/` | `sd` | `a` | `5`(guide.md 「글자열 칸」). 덩어리마다 뜻을 곁말로(시나리오에서 보인다). 노드 사이는 빈틈없이 잇거나 같은 그룹 박스 「장치 이름」으로 묶는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `directory` | `/dev/` | `/dev/` | 장치 파일을 두는 디렉터리 |
  | `driver` | `sd` | `sd` | `sd` 드라이버가 다루는 디스크(본문의 말대로) |
  | `disk` | `a` | `a` | 몇째 디스크인지 — `a`는 첫째, `b`는 둘째 |
  | `partition` | `5` | `5` | 파티션 번호 5 — MBR에서는 첫 논리 파티션이고, 다섯째 디스크가 아니다 |

- 요점 테스트: 시나리오마다 선명한 노드가 정확히 하나이고 네 시나리오의 선명한 노드가 서로 다르다. `partition`의 보이는 곁말에 「논리 파티션」이 있고, `disk`의 보이는 곁말에 「첫째」가 있다. 네 노드의 라벨을 차례로 이으면 `/dev/sda5`다.

#### 3-2. `linux-filesystem.filesystem-mount` — `MountPointDiagram`, JSON 키 `mount-point`

- 물음형 제목 예: `새 디스크를 쓰려면 무엇을 차례로 할까?`
- 그릴 것: 왼쪽(세로형이면 위)에 디렉터리 나무 `/` → `home`·`data`(가지는 늘 보이는 연결선), 오른쪽(아래)에 `/dev/sdb1` 노드, 명령 노드 `fdisk`·`mkfs.ext4`·`mount`. 시나리오마다 명령에서 `/dev/sdb1`로, 마지막에는 `/dev/sdb1`에서 `data`로 가는 경로.
- 시나리오:

  | id | label | 선명한 것 | 경로·캡션이 말할 것 |
  |---|---|---|---|
  | `partition` | 1. 나누기 | `fdisk`·`/dev/sdb1` | `fdisk` → `/dev/sdb1`. 디스크를 나눠 파티션을 만든다 |
  | `make` | 2. 파일 시스템 | `mkfs.ext4`·`/dev/sdb1` | `mkfs.ext4` → `/dev/sdb1`. 파티션에 `ext4` 파일 시스템을 만든다 — 아직 나무에서 닿을 수 없다 |
  | `mount` | 3. 마운트 | `mount`·`/dev/sdb1`·`/`·`data` | `/dev/sdb1` → `data`. `/data`에 붙이면 `/data` 아래가 새 디스크의 내용이다 |

- 요점 테스트: `/dev/sdb1`에서 `data`로 가는 경로는 `mount`에서만 보인다. `make`에서는 나무의 노드(`/`·`home`·`data`)가 모두 흐리다. 세 시나리오의 캡션이 각각 1·2·3의 차례를 말한다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 119개, 마지막 id는 `n119`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `disk-device-names`가 `mbr-gpt` 바로 뒤에 있고 `parentId`가 `linux-filesystem.partition`인지, `filesystem-mount`는 `parentId`가 없는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. `/dev/sda5`·`/dev/sdb6`의 읽기를 `mbr-gpt` 본문의 번호 규칙과 맞춰 다시 따진다.
   step 0 summary의 `sd`·SATA 처리와 「자격시험은」 줄을 지켰는가.
4. `phases/75-network-linux-basics/index.json`의 step 4를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`/etc/fstab`의 칸을 쓰지 마라.** 이유: step 5의 `fstab`이 쓴다. 이 step에서는 「다시 켜도 붙어 있게 하려면 `/etc/fstab`에 적는다」는 한 줄까지만.
- **NVMe(`/dev/nvme0n1`)·가상 디스크(`/dev/vda`) 같은 다른 이름 꼴을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **`mkfs`·`mount`의 옵션(`-t`·`-o` 등)을 늘어놓지 마라.** 이유: 기출이 묻지 않는다. 본문의 꼴은 `mkfs.ext4 장치`, `mount 장치 디렉터리`, `umount 디렉터리`까지다.
- **개념 9~11을 만들지 마라.** 이유: step 5·6의 범위다.
