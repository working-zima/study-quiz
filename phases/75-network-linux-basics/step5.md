# Step 5: fstab-swap

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-filesystem`의 개념 둘(9 /etc/fstab 파일, 10 스왑 공간)의 글·문항·도식을 함께 만든다.** `/etc/fstab`은 `filesystem-mount`에 딸린 개념이고, 스왑 공간은 새 머리 개념이다.

기출은 「부팅과 함께 자동으로 마운트할 항목과 옵션을 적은 파일」, 스왑을 네 번(메모리가 가득 찰 때 쓰는 파티션, 스왑 파티션 형식의 뜻, 「한 번 정한 스왑은 더할 수 없다」가 틀린 말) 물었다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 0~4 `summary`(특히 step 0의 i·j와 스왑 크기 권고의 처리)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-filesystem` 주제(앞 step이 쓴 개념 — 특히 `filesystem-mount`의 `mount /dev/sdb1 /data` 예. **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-filesystem.json`
- 앞 step의 도식(`MountPointDiagram` 등)과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들 — 표 모양은 `RoutingTableDiagram`), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-filesystem` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `linux-filesystem.fstab` | /etc/fstab 파일 | `linux-filesystem.filesystem-mount` | 앞 개념의 `mount /dev/sdb1 /data`는 다시 켜면 풀린다(step 0 결과의 근거대로) — 그래서 시스템이 마운트할 파일 시스템을 한 줄에 하나씩 적어 두는 설정 파일이 `/etc/fstab`이다. 예 한 줄 `/dev/sdb1 /data ext4 defaults 0 2`를 칸 여섯으로 끊어 읽는다 — 장치, 마운트 지점, 파일 시스템 형식, 마운트 옵션(`defaults` — 흔히 쓰는 기본 옵션 묶음, 근거대로), 백업 프로그램 dump가 쓰는 표시, 부팅 때 `fsck`로 점검하는 차례(`0`이면 점검하지 않음 — 근거대로). 부팅할 때 이 파일의 항목이 자동으로 마운트된다는 것을 step 0이 정한 근거와 말로 쓴다. 장치를 UUID로 적는 꼴은 step 0 결과가 쓰기로 했으면 한 줄 |
| 10 | `linux-filesystem.swap` | 스왑 공간 | — | **메모리**(RAM — 실행 중인 프로그램과 데이터를 두는 빠른 저장 장치, 전원이 꺼지면 내용이 사라진다)를 이 개념에서 푼다. 메모리가 모자랄 때 커널이 당장 쓰지 않는 메모리 내용을 디스크로 옮겨 두는 공간이 스왑 공간이고, 스왑 파티션이나 스왑 파일로 만든다. 명령과 결과 — `mkswap`으로 스왑 공간을 만들고 `swapon`으로 켠다. 설치할 때 만들지 않았거나 더 필요해지면 **설치한 뒤에도 스왑 파일을 만들어 더할 수 있다**(step 0 결과의 근거대로). 부팅 때마다 쓰려면 `/etc/fstab`에 스왑 항목을 적는다는 한 줄. 스왑과 메모리가 무엇이 다른지(4절 — 스왑은 메모리 내용을 잠시 옮겨 두는 디스크의 공간이지 메모리 자체가 아니다)를 쓴다. 디스크가 메모리보다 느리다는 것과 크기 권고는 step 0 결과대로(근거가 없으면 쓰지 않는다) |

### 2. 문항 — `n120`~`n122`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n120` | `fstab` | 4지선다 「원인과 결과」 — `mount`로 붙여 쓰던 디스크가 서버를 다시 켠 뒤 붙어 있지 않을 때, 다시 켤 때마다 붙게 하려면 무엇을 해야 하는가 → `/etc/fstab`에 그 파일 시스템의 줄을 더한다. 오답은 같은 범주(디스크를 다루는 일)에서 헷갈리는 것 — 파일 시스템을 다시 만든다(`mkfs`), 파티션 테이블을 다시 쓴다(`fdisk`), 마운트 지점 디렉터리를 다시 만든다. 장치·디렉터리 이름은 본문 예와 다르게(예 `/dev/sdb2`·`/backup`). 해설은 각 오답이 무엇을 하는 일이고 왜 다시 켠 뒤의 마운트와 관계없는지 가르친다 |
| `n121` | `swap` | 예/아니요 「오해 바로잡기」 — 설치를 마친 뒤에도 스왑 파일을 새로 만들어 스왑 공간을 늘릴 수 있는가(예). step 4가 끝난 뒤의 균형(계획대로면 예 21·아니요 22)에서 **예** 쪽으로 세운다. 해설은 `mkswap`·`swapon`의 차례를 가르친다 |
| `n122` | `swap` | 4지선다 「원리 이해」 — 실행 중인 프로그램이 많아 메모리가 거의 찼을 때 커널이 스왑 공간을 어떻게 쓰는가 → 당장 쓰지 않는 메모리 내용을 스왑으로 옮겨 메모리를 비운다. 오답은 디스크 공간의 다른 쓰임과 헷갈리는 것 — 임시 파일을 두는 곳(`/tmp`), 부팅 파일을 두는 곳, 지운 파일을 잠시 두는 곳 같은 것 가운데 출처로 틀렸다고 말할 수 있는 것. n121과 다른 것을 묻는다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 `SWAP`·`FAT32`·`RAID`·`LVM` 묶음, 스왑 설명 넷 묶음을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식 — `src/data/network/visuals/linux-filesystem.json`에 더한다

#### 3-1. `linux-filesystem.fstab` — `FstabFieldsDiagram`, JSON 키 `fstab-fields`

- 물음형 제목 예: `/etc/fstab의 한 줄은 무엇을 말할까?`
- 그릴 것: 예 한 줄 `/dev/sdb1 /data ext4 defaults 0 2`를 칸 여섯으로 — 표 모양(guide.md 「표 모양 그림」). 세로형은 행 여섯을 「칸 이름 노드 | 값 노드」 두 칸으로 쌓고, 가로형은 값 여섯을 한 줄에 두고 칸 이름을 곁말로 둘 수 있다. 칸 이름은 본문의 말과 같게 쓴다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `what-where` | 무엇을 어디에 | 장치·마운트 지점 칸 | 어느 장치를 어느 디렉터리에 붙일지 |
  | `how` | 어떻게 | 형식·옵션 칸 | 어떤 파일 시스템이고 어떤 옵션으로 붙일지 |
  | `check` | 백업과 점검 | dump·점검 차례 칸 | 백업 표시와 부팅 때 점검하는 차례(본문의 말대로) |

- 요점 테스트: 값 노드 여섯의 라벨을 차례로 공백으로 이으면 본문의 예 한 줄과 같다. `what-where`의 선명한 값 노드 라벨이 정확히 {`/dev/sdb1`, `/data`}다. 세 시나리오의 선명한 칸을 합하면 여섯 칸이 빠짐없이 한 번씩 나온다.

#### 3-2. `linux-filesystem.swap` — `SwapSpaceDiagram`, JSON 키 `swap-space`

- 물음형 제목 예: `메모리가 모자라면 무엇이 일어날까?`
- 그릴 것: 그룹 박스 「메모리(RAM)」 안에 노드 둘(`지금 쓰는 내용`·`당장 쓰지 않는 내용` — 본문의 말로), 그룹 박스 「디스크」 안에 `스왑 파티션`·`스왑 파일`, 명령 노드 `mkswap`·`swapon`. 시나리오 경로 — `당장 쓰지 않는 내용`에서 `스왑 파티션`으로, `mkswap`·`swapon`에서 `스왑 파일`로.
- 시나리오:

  | id | label | 선명한 것 | 경로·캡션이 말할 것 |
  |---|---|---|---|
  | `move` | 메모리가 모자랄 때 | `당장 쓰지 않는 내용`·`스왑 파티션` | `당장 쓰지 않는 내용` → `스왑 파티션`. 커널이 당장 쓰지 않는 내용을 디스크의 스왑 공간으로 옮겨 메모리를 비운다 |
  | `add` | 나중에 더하기 | `mkswap`·`swapon`·`스왑 파일` | `mkswap` → `스왑 파일`, `swapon` → `스왑 파일`. 설치한 뒤에도 스왑 파일을 만들어 켤 수 있다 |

- 요점 테스트: `add`에서 `스왑 파일`이 선명하고 `mkswap`·`swapon`에서 시작하는 경로가 보이며, `move`에서는 `스왑 파일`과 두 명령이 흐리다. `move`에서 보이는 경로는 메모리 그룹 안 노드에서 시작해 디스크 그룹 안 노드에서 끝난다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 122개, 마지막 id는 `n122`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `fstab`이 `filesystem-mount` 바로 뒤에 있고 `parentId`가 `linux-filesystem.filesystem-mount`인지, `swap`은 `parentId`가 없는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. fstab 여섯 칸의 이름·차례가 fstab(5)과 같은가(문장을 옮기지 않고).
   step 0 summary의 스왑 크기 권고 처리(쓰지 않음 등)를 지켰는가.
4. `phases/75-network-linux-basics/index.json`의 step 5를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **스왑 크기를 권하지 마라(「메모리의 두 배」 등).** 이유: 허용한 출처에 근거가 있을 때만 쓴다 — step 0 결과가 정한다.
- **`swappiness`·`free`·`vmstat` 같은 메모리 조정·관찰을 쓰지 마라.** 이유: 기출이 이 주제에서 묻지 않는다. `free`는 `linux-process-boot`(phase 76)의 범위다.
- **fstab의 옵션(`noauto`·`nofail` 등)을 늘어놓지 마라.** 이유: 기출이 묻지 않는다. `defaults`의 뜻까지만.
- **개념 11을 만들지 마라.** 이유: step 6의 범위다.
