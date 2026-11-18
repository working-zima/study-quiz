# Step 13: replica-containers

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 `windows-hyperv`의 개념 둘(21 Hyper-V 복제본, 22 Windows 컨테이너)의 글·문항·도식을 함께 만든다.** 둘 다 홀로 선 개념이다(22에는 step 14가 딸린 개념 하나를 붙인다).

기출은 Hyper-V가 가상 컴퓨터를 다른 서버로 복제할 수 없다는 것이 틀린 말이라는 것([기출 2024-08-25 #43] 등 셋의 오답 보기)과,
가상화 기반의 응용 프로그램 실행 환경으로 Windows 컨테이너를 고르게 하는 것을 세 번 묻는다([기출 2024-02-25 #44]·[기출 2025-05-25 #38]·[기출 2026-05-17 #29] — 지문이 그림이라 보기와 정답만 본다, 오답 Hyper-V/Virtual Machine·IIS·Nano Server).

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 9 `summary`(복제본의 정의·복제 빈도·장애 조치·잃을 수 있는 변경, 컨테이너의 정의·가상 컴퓨터와의 차이·두 격리 방식·런타임, 기출 판정, E 번호, 한국어 이름)와 step 10~12 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 10과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 9)」 줄과 항목), `docs/source/network/exam-notes.md`(phase 81이 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`windows-hyperv`의 앞 개념 여섯(step 10~12)**, 특히 `hyper-v`(가상화·호스트·게스트·가용성)·`checkpoints`·`live-migration`(4절 비교의 상대). `linux-process-boot`의 커널·프로세스 문장(뜻을 맞춘다)
- `src/data/network/questions.json`, `src/data/network/visuals/windows-hyperv.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `AccountLockoutDiagram`(시각이 흐르는 그림), `ShellLayerDiagram`(층), `HypervisorLayersDiagram`·`LiveMigrationDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-08-25 #43], [기출 2024-02-25 #44], [기출 2025-05-25 #38], [기출 2026-05-17 #29] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-hyperv` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 21 | `windows-hyperv.hyper-v-replica` | Hyper-V 복제본 | — | 복제본의 뜻(step 9 결과대로 — **복제**(같은 내용을 다른 곳에 복사해 두고 맞춰 가는 것) 한 줄), 주 서버·복제본 서버, 복제 빈도(고를 수 있는 값 — step 9 결과대로), 장애 조치(step 9 결과대로 한 줄). 마지막 복제 뒤의 변경을 잃을 수 있다는 것(근거가 있을 때만). **복제본과 실시간 마이그레이션**, **복제본과 검사점**(4절 — 앞 개념과 뜻을 맞춘다). 계산 예: 복제 빈도 `5`분으로 `HV01`의 `VM01`을 `HV02`에 복제하는데 `10:05`에 복제가 끝나고 `10:08`에 `HV01`이 멈추면, `HV02`의 복제본에는 `10:05`까지의 변경이 있고 그 뒤 3분의 변경은 없다 — 단계대로(「예시 값」 — 복제 빈도 값이 step 9의 선택지에 없으면 있는 값으로 바꾼다) |
| 22 | `windows-hyperv.windows-containers` | Windows 컨테이너 | — | **커널**(운영 체제의 중심부 — 하드웨어를 다루고 프로그램에 자원을 나눠 준다, 한 줄), **응용 프로그램**(한 줄)을 푼다. 컨테이너·컨테이너 이미지·Windows 컨테이너의 뜻(step 9 결과대로), 「컨테이너」 기능과 컨테이너 런타임(step 9 결과대로 한 줄). 두 격리 방식과 기본값(step 9 결과대로). **컨테이너와 가상 컴퓨터**(4절 — step 9가 확인한 비교만: 운영 체제 전체를 갖는가 커널을 함께 쓰는가, 크기·시작 시간), **프로세스 격리와 Hyper-V 격리**(4절). 기본 이미지의 이름(Nano Server 등)은 이 화면에서 이름만 한 줄 — 목록은 딸린 개념의 몫이라는 말은 쓰지 않는다. 예: 호스트 `HV01`에서 같은 이미지로 컨테이너 둘을 실행 — 프로세스 격리면 둘이 호스트의 커널을 함께 쓰고, Hyper-V 격리면 저마다 작은 가상 컴퓨터 안에서 자기 커널로 실행된다(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n309`~`n311`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n309` | `hyper-v-replica` | 4지선다 「계산」 — 본문과 다른 값(복제 빈도는 step 9의 선택지 가운데 본문과 다른 값, 호스트 `HV05`·`HV06`, 다른 시각)을 주고 주 호스트가 멈춘 뒤 복제본에 어느 때까지의 변경이 있는지(또는 잃는 변경이 몇 분인지) 고르게 한다. 오답은 흔한 혼동(멈춘 시각까지 다 있다고 보기, 다음 복제 시각으로 읽기, 빈도를 한 번 더 빼기). **정답 위치 2**. 해설은 시각 셈을 단계대로 보이고, 잃을 수 있다는 근거가 step 9에 없으면 문항을 「복제본이 무엇을 해 주는가」 상황 적용으로 바꾸고 summary에 적는다 |
| `n310` | `windows-containers` | 4지선다 「개념 비교」 — 본문과 다른 장면(같은 응용 프로그램을 여러 벌, 가볍게 띄워 빨리 시작해야 하고 호스트와 같은 커널을 써도 된다 등 — 「띄운다」라는 말은 쓰지 않는다)을 주고 무엇을 고를지 묻는다. 정답 프로세스 격리로 실행하는 Windows 컨테이너, 오답은 같은 범주에서 헷갈리는 것(가상 컴퓨터, Hyper-V 격리 컨테이너 — 문제문의 조건(커널을 함께 써도 된다·가장 가볍게)으로 갈리게, 다른 하나 — step 9의 근거 안에서). 기출 묶음(Virtual Machine·IIS·Windows 컨테이너·Nano Server)과 같은 넷이 되지 않게 한다. **정답 위치 3** |
| `n311` | `windows-containers` | 예/아니요 「개념 확인」 — **예** 쪽으로 세운다. 예: Hyper-V 격리로 실행한 Windows 컨테이너는 컨테이너마다 호스트와 따로인 자기 커널을 쓰나요?(예 — step 9 결과대로). 해설은 두 격리 방식과 그 차이가 무엇을 지키는지(격리의 강도 — 근거대로)를 가르친다. n310과 다른 것을 묻는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 62·아니요 61, 정답 위치 47/47/47/47.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `hyper-v-replica` — `HyperVReplicaDiagram`, JSON 키 `hyper-v-replica`

- 물음형 제목 예: `주 호스트가 멈추면 복제본에는 어느 때까지의 변경이 남아 있을까?`
- 그릴 것: 주 서버 `HV01`(박스 — `VM01`)과 복제본 서버 `HV02`(박스 — 복제본 `VM01`, 다른 id), 복제 경로(곁말: 복제 빈도 `5`분), 시각 노드 줄(`10:05` 복제 끝 → `10:08` 멈춤 — 본문의 계산 예).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `replicate` | 복제 | 두 `VM01`과 복제 경로·`10:05` | 정한 빈도마다 바뀐 내용을 복제본 서버로 보낸다 |
  | `failover` | 장애 조치 | `HV02`의 복제본·`10:08`, `HV01`의 `VM01`은 흐림 | 주 호스트가 멈추면 복제본을 켜서 이어 쓴다 — `10:05` 뒤의 변경은 없다(본문의 말대로) |

- 요점 테스트: `failover`에서 `HV01` 쪽 `VM01`이 흐리고 복제 경로가 보이지 않으며, 복제본 노드와 `10:08` 노드가 선명하다. 두 `VM01` 노드는 서로 다른 id다.

#### 3-2. `windows-containers` — `ContainerIsolationDiagram`, JSON 키 `container-isolation`

- 물음형 제목 예: `컨테이너는 가상 컴퓨터와 무엇을 다르게 나눠 쓸까?`
- 그릴 것: 호스트 `HV01`(박스) 안에 아래에서 위로 — 호스트 커널 노드, 그 위에 프로세스 격리 컨테이너 둘(커널을 함께 씀)과, 옆에 Hyper-V 격리 컨테이너(작은 가상 컴퓨터 박스 — 안에 자기 커널 노드와 컨테이너). 280 폭에서 한 줄에 넷 이상 두지 마라 — 세로로 쌓는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `process` | 프로세스 격리 | 프로세스 격리 컨테이너 둘·호스트 커널과 그 경로 | 컨테이너들이 호스트의 커널을 함께 쓴다 |
  | `hyperv` | Hyper-V 격리 | Hyper-V 격리 컨테이너·그 안의 자기 커널 | 컨테이너마다 작은 가상 컴퓨터 안에서 자기 커널로 실행된다 |

- 요점 테스트: `process`에서 보이는 경로가 컨테이너 둘에서 같은 호스트 커널 노드로 가고, `hyperv`에서는 Hyper-V 격리 컨테이너의 경로가 호스트 커널이 아닌 자기 커널 노드(다른 id)로 간다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 311개, 마지막 id는 `n311`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 10~12가 푼 낱말을 다시 풀지 않았는가. 복제본·검사점·실시간 마이그레이션의 비교가 앞 개념의 말과 어긋나지 않는가.
3. n309의 시각 셈과 본문 계산 예를 손으로 다시 하고, n310의 보기 넷을 step 9의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 13을 갱신한다(guide.md 「summary에 적을 것」 / error / blocked — step 1과 같은 규칙).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 23을 만들지 마라.** 이유: step 14의 범위다. 기본 이미지의 목록·판 호환성은 이 step의 글에서 풀지 않는다.
- **Dockerfile 문법·컨테이너 네트워크 드라이버·Kubernetes·복제본의 인증서 설정·확장 복제를 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 10~12의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
