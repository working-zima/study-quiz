# Step 3: partition-mbr-gpt

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-filesystem`의 개념 둘(5 파티션, 6 MBR과 GPT)의 글·문항·도식을 함께 만든다.** 파티션은 새 머리 개념이고, MBR과 GPT는 거기 딸린 목록 개념이다.

기출은 「`fdisk`는 파일 시스템 점검 명령이 아니다」, 「2TB가 넘는 디스크를 GPT로 나누는 명령」, 「새 디스크를 붙이는 차례와 관계없는 명령」을 물었다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 0~2 `summary`(특히 step 0의 e·f와 `gdisk`·「GPT에는 gdisk」 처리)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`(「허용하는 출처」의 `gdisk` 항목), `docs/source/network/standards.md`(특히 「(phase 75)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-filesystem` 주제(앞 step이 쓴 개념 — **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-filesystem.json`
- 앞 step의 도식(`DirectoryTreeDiagram`·`StandardDirectoriesDiagram`·`EtcFilesDiagram`·`ProcViewDiagram`)과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-filesystem` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `linux-filesystem.partition` | 파티션 | — | 이 주제에서 디스크가 처음 주인공이 되는 개념이라 **디스크**(전원이 꺼져도 내용이 남는 저장 장치)를 한 줄로 푼다(앞 개념이 이미 풀었으면 다시 풀지 않는다). 파티션 = 디스크 하나를 따로 쓰는 구역으로 나눈 것, 파티션 테이블 = 구역마다 디스크의 어디서 어디까지인지 적은 표(디스크 앞쪽). `fdisk`는 파티션 테이블을 만들고 고치는 명령이다. `fdisk`로 표를 고치는 것만으로는 파일을 저장할 수 없고, 그 구역에 파일 시스템(파일을 이름과 디렉터리로 저장하는 구조 — 한 줄)을 만들어야 한다는 한 줄. 파일 시스템을 점검하고 고치는 명령은 `fsck`로 따로 있다 — `fdisk`와 이름이 비슷해 헷갈리지만 하는 일이 다르다(4절). 예는 새로 붙인 둘째 디스크를 둘로 나누는 것(크기는 예시 값) |
| 6 | `linux-filesystem.mbr-gpt` | MBR과 GPT | `linux-filesystem.partition` | **목록 개념**. 소개 문단: 파티션 테이블을 적는 형식이 둘 있다. 항목 둘 — `- **MBR**(Master Boot Record)은 …`, `- **GPT**(GUID Partition Table)는 …`(guide.md 「글」의 항목 이름 규칙 (1)). **섹터**(디스크가 한 번에 읽고 쓰는 가장 작은 단위)를 한 줄로 푼다. MBR 항목: 첫 섹터의 파티션 칸 넷(주 파티션, 번호 1~4), 그 하나를 확장 파티션으로 두면 안에 논리 파티션을 더 만들고 번호는 5부터, 위치·크기를 32비트 섹터 수로 적는다. GPT 항목: 64비트 주소, 파티션 수(도구가 흔히 128개로 둔다), 첫 섹터의 보호용 MBR(옛 도구가 GPT 디스크를 빈 디스크로 잘못 알고 덮어쓰지 않게 — 근거대로). 항목 뒤 문단: **MBR의 한계를 단계대로 계산한다** — 32비트로 셀 수 있는 섹터 수 2^32 = 4,294,967,296개, 섹터 하나 512바이트, 곱하면 2,199,023,255,552바이트(약 2.2TB, 2TiB) — 그래서 그보다 큰 디스크는 GPT로 나눈다. TB·TiB를 어떻게 적을지는 step 0 결과대로. 마지막 문단: 지금의 `fdisk`는 두 형식을 모두 다루고, `gdisk`는 GPT 디스크를 다루려고 따로 만든 도구다(step 0 결과 — 「자격시험은」 줄이 정해졌으면 그대로 덧붙인다) |

### 2. 문항 — `n116`~`n117`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n116` | `partition` | 4지선다 「상황 적용」 — 새로 붙인 디스크를 구역 둘로 나누려 할 때 쓰는 명령 → `fdisk`. 오답은 이름이나 하는 일이 헷갈리는 디스크 명령 — `fsck`(파일 시스템 점검), `mkfs`(파일 시스템 만들기), `mount`(디렉터리에 붙이기). 해설은 넷이 각각 무엇을 하는지와 새 디스크를 쓰는 차례에서 `fdisk`가 맨 앞이라는 것을 가르친다(`mkfs`·`mount`의 사실은 step 0이 `standards.md`에 남긴 것으로). 정답 위치는 균형대로 |
| `n117` | `mbr-gpt` | 4지선다 「원인과 결과」 또는 「상황 적용」 — 3TB 디스크(예시 값) 전체를 파티션 하나로 쓰려 할 때 MBR이 아니라 GPT를 골라야 하는 까닭. 정답: MBR은 위치·크기를 32비트 섹터 수로 적어 512바이트 섹터에서 약 2.2TB까지만 다룬다. 오답은 MBR의 다른 특징을 까닭처럼 내세운 것 — 「주 파티션이 넷뿐이라」(하나만 쓰므로 상관없다), 「논리 파티션은 5번부터라」, 「첫 섹터에 보호용 MBR이 없어서」(그것은 GPT의 것이다) 같은 것. 문제문에 섹터를 한 줄로 푼다. 해설은 2^32 × 512 계산을 단계대로 보인다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — `fdisk`·`mkfs`·`gdisk`·`mount`나 `fdisk`·`mkfs`·`mount`·`cal` 묶음을 쓰지 않는다). 이 step의 두 문항은 4지선다이므로 예/아니요 균형은 그대로이고, 정답 위치의 균형을 지킨다.

### 3. 도식 — `src/data/network/visuals/linux-filesystem.json`에 더한다

#### 3-1. `linux-filesystem.partition` — `PartitionLayoutDiagram`, JSON 키 `partition-layout`

- 물음형 제목 예: `디스크를 나누면 무엇이 생길까?`
- 그릴 것: 그룹 박스 「디스크 하나」 안에 칸을 빈틈없이 이은 노드 셋 — `파티션 테이블` | `파티션 1` | `파티션 2`(280 폭이면 위에서 아래로 쌓는다). 그룹 밖의 명령 노드 `fdisk`와 `fsck`.
- 시나리오:

  | id | label | 선명한 것 | 경로·캡션이 말할 것 |
  |---|---|---|---|
  | `table` | 파티션 테이블 | `fdisk`·`파티션 테이블` | `fdisk` → `파티션 테이블`. `fdisk`는 디스크 앞쪽의 표를 만들고 고친다 |
  | `areas` | 나뉜 구역 | `파티션 1`·`파티션 2` | 표에 적힌 대로 나뉜 구역을 저마다 따로 쓴다 |
  | `check` | 점검 | `fsck`·`파티션 1` | `fsck` → `파티션 1`. 구역 안에 만든 파일 시스템을 점검하는 것은 `fsck`다 — `fdisk`가 아니다 |

- 요점 테스트: `table`에서 보이는 경로는 `fdisk`에서 `파티션 테이블`로 가는 것 하나다. `check`에서 보이는 경로는 `fsck`에서 시작해 `파티션 테이블`이 아닌 노드에서 끝나고, `fdisk`는 흐리다.

#### 3-2. `linux-filesystem.mbr-gpt` — `MbrGptDiagram`, JSON 키 `mbr-gpt`

- 물음형 제목 예: `MBR과 GPT는 파티션을 어떻게 적을까?`
- 그릴 것: 그룹 박스 둘 — 「MBR 디스크」: `MBR`(첫 섹터) 노드, 주 파티션 칸 `1`·`2`·`3`, `4 (확장)` 노드와 그 안(작은 그룹 박스나 아래 줄)의 논리 파티션 `5`·`6`. 「GPT 디스크」: `보호용 MBR`, `GPT 헤더·표`, 파티션 `1`·`2`·`…`.
  노드 라벨은 본문의 말과 같게 쓴다(본문이 「확장 파티션」을 쓰면 라벨도). 280 폭에 칸 다섯을 한 줄에 넣지 마라 — 두 줄로 나누거나 그룹을 위아래로 쌓는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `mbr` | MBR | `MBR`·주 파티션 칸 `1`~`3`·`4 (확장)` | 첫 섹터에 파티션 칸이 넷. 곁말 「32비트 섹터 수 — 약 2.2TB까지」(본문의 계산과 같은 말로) |
  | `logical` | 논리 파티션 | `4 (확장)`·`5`·`6` | 확장 파티션 안에 논리 파티션을 더 만들고, 번호는 5부터 붙는다 |
  | `gpt` | GPT | GPT 그룹의 노드 전부 | 64비트 주소라 2.2TB 한계가 없고, 첫 섹터에는 보호용 MBR을 둔다 |

- 요점 테스트: `logical`의 선명한 노드 라벨 가운데 수로 된 것이 `5`·`6`이고 둘 다 5 이상이다. `gpt`의 선명한 노드는 모두 GPT 그룹 안에 있고 MBR 그룹의 노드는 모두 흐리다. `mbr`의 보이는 곁말에 본문 계산의 결과(약 2.2TB)가 있다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 117개, 마지막 id는 `n117`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `partition`은 `parentId`가 없고, `mbr-gpt`는 `parentId`가 `linux-filesystem.partition`이며 `partition` 바로 뒤에 있는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. **2^32 × 512를 손으로 다시 계산하고**, 본문·해설·도식 곁말의 수가 서로 같은지 본다.
   step 0 summary의 `gdisk` 처리와 「자격시험은」 줄을 지켰는가. `gdisk`의 사실은 rodsbooks.com 항목에서만 왔는가.
4. `phases/75-network-linux-basics/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **장치 이름(`/dev/sda5`의 해석)을 이 step에서 자세히 쓰지 마라.** 이유: step 4의 `disk-device-names`가 쓴다. 디스크를 부를 때는 「둘째 디스크」처럼 쓰거나, 장치 이름을 쓰면 한 줄로 푼다.
- **`mkfs`·`mount`를 자세히 쓰지 마라.** 이유: step 4의 `filesystem-mount`가 쓴다. 파티션 본문에서는 「그 구역에 파일 시스템을 만들어야 한다」는 한 줄까지만.
- **`fdisk`의 대화형 명령(`n`·`p`·`w` 등)을 쓰지 마라.** 이유: 기출이 묻지 않고, 판마다 다르다(ADR-059 「범위」).
- **`gdisk`의 사실을 rodsbooks.com 밖에서 가져오지 마라.** 이유: 사용자가 그 문서를 `gdisk`에만 허용했다(2026-10-30).
