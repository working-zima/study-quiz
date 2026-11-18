# Step 10: hyperv-vms

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 주제 `windows-hyperv`를 만들고 그 첫 개념 둘(15 Hyper-V, 16 가상 컴퓨터와 가상 하드 디스크)의 글·문항·도식을 함께 만든다.** 16은 15에 딸린 개념이다.
이 주제 화면만 읽고도 가상화·가상 컴퓨터·호스트의 뜻이 서게 쓴다.

기출은 Hyper-V를 쓰면 서버 가용성이 줄어든다는 것이 틀린 말이라는 것([기출 2025-02-23 #30] — 하드웨어 사용률·유지 비용·개발과 테스트는 맞는 말로 둔다)과,
물리 서버 하나에서 가상 컴퓨터 여럿을 실행하고 가상 컴퓨터를 쓸수록 하드웨어 사용률이 낮아지지 않는다는 것([기출 2024-08-25 #43] 등 셋의 오답 보기)을 묻는다.

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 9 `summary`(가상화·Hyper-V·얻는 것·가상 장치·VHD/VHDX, 기출 판정, E 번호, 한국어 이름)와 step 8 `summary`(교차 검사 수·균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 9)」 줄과 항목), `docs/source/network/exam-notes.md`(phase 81이 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(`windows-server-roles.server-roles-features`의 역할 설치 문장, `linux-process-boot`의 커널, `linux-filesystem`의 파일 — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `ShellLayerDiagram`(층), `AdForestStructureDiagram`(포함), `RoleServiceFeatureDiagram`(이 phase)과 그 테스트, `src/data/network/visuals/windows-server-roles.json`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-02-23 #30], [기출 2024-08-25 #43] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`windows-server-roles` 주제 객체 바로 뒤(= `windows-admin-tools` 주제 객체 앞)에 주제 객체를 끼운다 — `{ "id": "windows-hyperv", "title": "Hyper-V와 Windows 컨테이너", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 2(★★☆, 출제 8/11회)인지 `data.test.ts`의 주제 지도 표와 견준다. 끼운 자리의 `  }` / `,` / `  {` 줄 꼴이 기존과 같은지 본다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 15 | `windows-hyperv.hyper-v` | Hyper-V | — | 이 주제의 첫 개념이라 **운영 체제**, **서버**, **Windows Server**를 한 줄씩 푼다. 가상화·가상 컴퓨터·하이퍼바이저·호스트·게스트(step 9 결과대로 — 한국어 이름은 step 9가 고른 것). Hyper-V가 무엇인지와 역할로 설치하는 것·관리 도구(step 9 결과대로 — **서버 역할**(서버가 맡는 일의 단위)은 한 줄로 푼다). 하드웨어 요구는 step 9 결과대로 한 줄. 얻는 것(step 9가 확인한 문서의 쓰임만 — 하드웨어를 더 많이 쓰게 된다(사용률), 업무 연속성(가용성), 개발과 테스트, 비용은 step 9의 판정대로). 「가용성」(서비스가 멈추지 않고 쓰일 수 있는 정도)은 한 줄로 푼다. **호스트와 게스트**(4절). 예: 호스트 `HV01`에서 가상 컴퓨터 `VM01`·`VM02`를 실행(「예시 값」) |
| 16 | `windows-hyperv.virtual-machines` | 가상 컴퓨터와 가상 하드 디스크 | `windows-hyperv.hyper-v` | 가상 컴퓨터의 가상 장치(step 9 결과대로)와 그것이 호스트의 물리 하드웨어를 나눠 쓴다는 것. 한 호스트에서 여럿을 함께 실행하고, 더 실행할수록 호스트의 하드웨어를 더 많이 쓴다(step 9의 근거대로 — 기출의 오답 둘을 바로잡는 문장). 가상 하드 디스크와 VHD·VHDX(step 9 결과대로 — 차이는 근거가 있는 것만). 세대 1·2는 쓰지 않아도 된다(쓰면 step 9 결과대로 한 줄). **VHD와 VHDX**, **가상 컴퓨터와 물리 컴퓨터**(4절 — 디스크가 호스트의 파일이라 옮기고 복사할 수 있다). 예: `VM01`의 디스크 파일 `D:\VMs\VM01.vhdx`(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n301`~`n302`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n301` | `hyper-v` | 예/아니요 「원인과 결과」 — **예** 쪽으로 세운다. 예: 따로 놓인 물리 서버 여러 대의 일을 Hyper-V 호스트 한 대의 가상 컴퓨터들로 옮겨 모으면, 그 호스트의 하드웨어를 이전의 물리 서버 한 대보다 더 많이 쓰게 되나요?(예 — step 9 결과대로). 해설은 서버 통합과 Hyper-V로 얻는 것(가용성이 줄지 않는다는 것 포함)을 가르친다. 기출 묶음(하드웨어 사용률·가용성 감소·유지 비용·개발과 테스트)의 문장을 주장으로 세우지 않는다 |
| `n302` | `virtual-machines` | 4지선다 「개념 비교」 — 가상 컴퓨터에 아주 큰 디스크가 필요한 장면(본문과 다른 이름 `VM07`, 크기는 step 9가 확인한 VHD 한계를 넘는 값)을 주고 어떤 가상 하드 디스크 형식을 써야 하는지 고르게 한다. 정답 VHDX, 오답은 같은 범주에서(VHD, 검사점 파일 AVHDX — step 9가 근거를 남겼을 때만, ISO 같은 출처에 없는 형식은 쓰지 않는다 — 보기 넷이 출처 안에서 모이지 않으면 범주를 「디스크 형식과 그 성질」로 바꾸고 summary에 적는다). **정답 위치 2** |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 60·아니요 59, 정답 위치 46/46/46/45.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

이 step이 `src/data/network/visuals/windows-hyperv.json`을 만들고 `src/data/network/index.ts`에 import(`windowsHypervVisuals` — 경로 알파벳순: `windows-admin-tools.json` 뒤·`windows-server-roles.json` 앞)와 `visualsByTopicId`의 `'windows-hyperv': windowsHypervVisuals`(`'windows-server-roles'` 바로 뒤)를 넣는다.

#### 3-1. `hyper-v` — `HypervisorLayersDiagram`, JSON 키 `hypervisor-layers`

- 물음형 제목 예: `물리 서버 한 대에서 운영 체제 여럿이 어떻게 함께 실행될까?`
- 그릴 것: 아래에서 위로 층 — 물리 하드웨어(CPU·메모리·디스크 — 본문의 말), 하이퍼바이저(Hyper-V), 그 위에 가상 컴퓨터 `VM01`·`VM02`(각자 게스트 운영 체제). 호스트 `HV01`(그룹 박스)가 전체를 묶는다. 280 폭에서 가상 컴퓨터 둘을 나란히(넷 이상 금지).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `host` | 호스트 | 물리 하드웨어·하이퍼바이저 | 호스트는 가상 컴퓨터를 실행하는 물리 컴퓨터다 |
  | `guest` | 게스트 | `VM01`·`VM02` | 게스트 운영 체제는 저마다 자기 컴퓨터를 가진 것처럼 실행된다 |
  | `share` | 하드웨어 나눠 쓰기 | 가상 컴퓨터 둘·하이퍼바이저·물리 하드웨어와 그 경로 | 하이퍼바이저가 하나의 하드웨어를 나눠 준다 — 그래서 하드웨어를 더 많이 쓰게 된다 |

- 요점 테스트: `host`와 `guest`의 선명한 노드 집합이 겹치지 않는다. `share`에서 보이는 경로가 두 가상 컴퓨터에서 각각 하이퍼바이저를 거쳐 같은 물리 하드웨어 노드에 닿는다.

#### 3-2. `virtual-machines` — `VirtualHardDiskDiagram`, JSON 키 `virtual-hard-disk`

- 물음형 제목 예: `가상 컴퓨터의 디스크는 실제로 어디에 있을까?`
- 그릴 것: 가상 컴퓨터 `VM01`(그룹 박스 — 안에 가상 프로세서·메모리·가상 하드 디스크·네트워크 어댑터 노드 — 본문이 든 것만), 호스트 `HV01`(그룹 박스 — 안에 파일 `D:\VMs\VM01.vhdx` 노드). 가상 하드 디스크 노드 → 파일 노드 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `devices` | 가상 장치 | `VM01` 안의 가상 장치 노드들 | 가상 컴퓨터는 소프트웨어로 만든 장치를 갖는다 |
  | `file` | 디스크 파일 | 가상 하드 디스크 노드·파일 노드와 그 경로 | 가상 하드 디스크는 호스트에 놓인 파일 하나다(본문의 형식 이름) |

- 요점 테스트: `file`에서 보이는 경로가 `VM01` 박스 안의 가상 하드 디스크 노드에서 `HV01` 박스 안의 파일 노드로 간다. 파일 노드의 라벨에 `.vhdx`가 있고 백슬래시가 글자 그대로 보인다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 302개, 마지막 id는 `n302`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `windows-server-roles` 바로 뒤·`windows-admin-tools` 바로 앞에 있고, `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. step 9 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가.
4. n302의 보기 넷을 step 9의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
5. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 10을 갱신한다(guide.md 「summary에 적을 것」 / error / blocked — step 1과 같은 규칙).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 17~23을 만들지 마라.** 이유: step 11~14의 범위다. 가상 스위치·검사점·마이그레이션·복제본·컨테이너는 이 step의 글에서 이름도 꺼내지 않는다 — 꺼내야 하면 한 줄로 그친다.
- **동적 메모리·중첩 가상화·장애 조치 클러스터·세대 1·2의 차이 전체를 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **`windows-server-roles`의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
