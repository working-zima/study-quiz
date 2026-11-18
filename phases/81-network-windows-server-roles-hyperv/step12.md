# Step 12: live-storage-migration

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 `windows-hyperv`의 개념 둘(19 실시간 마이그레이션, 20 저장소 마이그레이션)의 글·문항·도식을 함께 만든다.** 20은 19에 딸린 개념이다.

기출은 Hyper-V에서 가상 하드 디스크를 가상 컴퓨터가 실행 중일 때에도 다른 저장소로 옮길 수 있다는 것을 세 번 묻는다([기출 2024-08-25 #43]·[기출 2025-11-02 #29]·[기출 2026-02-01 #33] — 같은 문항).

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 9 `summary`(실시간 마이그레이션·저장소 마이그레이션의 정의·옮겨 가는 것·화면 이름·cmdlet·요구 조건, 기출 판정, E 번호, 한국어 이름)와 step 10·11 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 10과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 9)」 줄과 항목), `docs/source/network/exam-notes.md`(phase 81이 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`windows-hyperv`의 앞 개념 넷(step 10·11)**, 특히 `virtual-machines`의 가상 하드 디스크 문장과 `checkpoints`의 파일 문장(옮겨 가는 파일과 뜻을 맞춘다), `hyper-v`의 가용성 문장
- `src/data/network/questions.json`, `src/data/network/visuals/windows-hyperv.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `RouteFailoverDiagram`(옮겨 가기), `MountPointDiagram`(저장 위치), `VirtualHardDiskDiagram`·`CheckpointApplyDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-08-25 #43] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-hyperv` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 19 | `windows-hyperv.live-migration` | 실시간 마이그레이션 | — | **마이그레이션**(옮기기 — 한 줄). 실시간 마이그레이션의 뜻과 쓰는 때(step 9 결과대로 — 「사용자가 느끼는 중단 없이」는 문서의 말이 있을 때만), 무엇이 옮겨 가는지(실행 상태·메모리 — step 9 결과대로), 저장소까지 함께 옮기는 방식(step 9 결과대로 한 줄), 요구 조건은 근거가 있으면 한 줄. `hyper-v`의 가용성 문장과 뜻을 맞춘다. **실시간 마이그레이션과 전원을 끄고 옮기기**(4절 — 끄고 옮기면 그동안 서비스가 멈춘다, 근거대로). 예: `HV01`에서 실행 중인 `VM01`을 `HV02`로 옮긴다 — 옮기는 동안과 뒤에 `VM01`이 어디서 실행되는지 단계대로(「예시 값」) |
| 20 | `windows-hyperv.storage-migration` | 저장소 마이그레이션 | `windows-hyperv.live-migration` | 저장소 마이그레이션의 뜻(step 9 결과대로 — 실행 중인 채로, 옮겨 가는 파일: 가상 하드 디스크·구성·검사점 — `virtual-machines`·`checkpoints`와 뜻을 맞춘다), 화면 이름과 cmdlet(step 9 결과대로 한 줄씩), 쓰는 때(근거대로). 가상 컴퓨터는 같은 호스트에 남는다. **저장소 마이그레이션과 실시간 마이그레이션**(4절 — 무엇이 어디로: 파일이 다른 저장 위치로 / 실행이 다른 호스트로). 예: 실행 중인 `VM01`의 `D:\VMs\VM01.vhdx`를 `E:\VMs`로 옮긴다 — 옮긴 뒤 파일 경로와 `VM01`이 실행되는 호스트(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n306`~`n308`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n306` | `live-migration` | 예/아니요 「원리 이해」 — **예** 쪽으로 세운다. 예: 호스트 `HV05`를 점검하려고 그 위에서 실행 중인 가상 컴퓨터 `VM07`을 실시간 마이그레이션으로 `HV06`에 옮기는 동안에도, `VM07` 안의 서비스를 계속 쓸 수 있나요?(예 — step 9 결과대로). 해설은 무엇이 옮겨 가는지와 끄고 옮기기와의 차이를 가르친다 |
| `n307` | `storage-migration` | 4지선다 「상황 적용」 — 본문과 다른 장면(실행 중인 `VM07`의 가상 하드 디스크를 저장 공간이 모자란 드라이브에서 새 드라이브로 옮기되 가상 컴퓨터를 멈추지 않아야 한다)을 주고 무엇을 써야 하는지 고르게 한다. 정답 저장소 마이그레이션(step 9의 화면 이름), 오답은 같은 범주의 Hyper-V 기능에서 헷갈리는 것(실시간 마이그레이션 — 다른 호스트로 옮긴다, 내보내기 — 복사본을 만든다, 검사점 — 되돌릴 시점을 저장한다 등, step 9의 근거 안에서). 기출 묶음(복제 불가·실행 중 저장소 이동·물리 서버 하나에 가상 컴퓨터 하나·사용률 낮아짐)과 범주가 다르다. **정답 위치 1** |
| `n308` | `storage-migration` | 예/아니요 「개념 비교」 — **아니요** 쪽으로 세운다. 예: 저장소 마이그레이션으로 `VM07`의 가상 하드 디스크를 다른 저장 위치로 옮기면, `VM07`도 다른 Hyper-V 호스트에서 실행되게 바뀌나요?(아니요 — 같은 호스트에 남는다, step 9 결과대로). 해설은 두 마이그레이션이 옮기는 것을 가른다. n307과 다른 것을 묻는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 61·아니요 61, 정답 위치 47/47/46/46.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `live-migration` — `LiveMigrationDiagram`, JSON 키 `live-migration`

- 물음형 제목 예: `실행 중인 가상 컴퓨터를 멈추지 않고 다른 호스트로 어떻게 옮길까?`
- 그릴 것: 호스트 `HV01`·`HV02`(그룹 박스 둘), 옮기기 전의 `VM01`(`HV01` 안)과 옮긴 뒤의 `VM01`(`HV02` 안 — 다른 id·다른 자리), 둘 사이의 옮기기 경로(실행 상태·메모리 — 곁말), 사용자 노드(서비스를 쓰는 쪽).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `before` | 옮기기 전 | `HV01`의 `VM01`·사용자와 그 경로 | `VM01`이 `HV01`에서 실행 중이다 |
  | `moving` | 옮기는 중 | 두 `VM01`과 옮기기 경로 | 실행 상태와 메모리를 `HV02`로 넘기는 동안에도 서비스는 이어진다(본문의 말대로) |
  | `after` | 옮긴 뒤 | `HV02`의 `VM01`·사용자와 그 경로 | 이제 `HV02`에서 실행된다 — `HV01`을 점검할 수 있다 |

- 요점 테스트: `before`와 `after`에서 선명한 `VM01` 노드가 서로 다른 id이고 다른 호스트 박스 안에 있다. `moving`에서만 옮기기 경로가 보인다.

#### 3-2. `storage-migration` — `StorageMigrationDiagram`, JSON 키 `storage-migration`

- 물음형 제목 예: `저장소 마이그레이션에서는 무엇이 옮겨 가고 무엇이 그대로일까?`
- 그릴 것: 호스트 `HV01`(그룹 박스 — 안에 `VM01` 노드 하나), 저장 위치 둘(`D:\VMs` 박스 — 파일 `D:\VMs\VM01.vhdx`, `E:\VMs` 박스 — 옮긴 뒤 파일 노드, 다른 id). `VM01` → 파일 경로(옮기기 전과 뒤 각각), 파일 → 파일 옮기기 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `before` | 옮기기 전 | `VM01`·`D:\VMs`의 파일과 그 경로 | 디스크 파일이 `D:\VMs`에 있다 |
  | `after` | 옮긴 뒤 | `VM01`·`E:\VMs`의 파일과 그 경로 | 실행 중인 채로 파일만 `E:\VMs`로 옮겨 갔다 — `VM01`은 같은 호스트에 남는다 |

- 요점 테스트: 두 시나리오에서 선명한 `VM01` 노드가 **같은 id**이고(호스트가 바뀌지 않는다 — `live-migration` 도식과 가르는 요점), 선명한 파일 노드는 서로 다른 id·다른 박스 안이다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 308개, 마지막 id는 `n308`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 10·11이 푼 낱말을 다시 풀지 않았는가.
3. n307의 보기 넷을 step 9의 근거로 하나씩 따져 정답이 하나뿐인지 본다(실시간 마이그레이션의 「저장소까지 함께 옮기는 방식」이 문제문의 조건 — 같은 호스트에 둔다 등 — 으로 갈리는지 본다).
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 12를 갱신한다(guide.md 「summary에 적을 것」 / error / blocked — step 1과 같은 규칙).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 21~23을 만들지 마라.** 이유: 다른 step의 범위다. 복제본은 이 step의 글에서 이름도 꺼내지 않는다.
- **장애 조치 클러스터·인증 방식(CredSSP·Kerberos)·실시간 마이그레이션 네트워크 설정을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 10·11의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
