# Step 3: desktop-containers

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/103-azure-compute-networking/guide.md`에 있다.
**이 step은 주제 `azure-compute`의 개념 셋(5 Azure Virtual Desktop, 6 컨테이너, 7 Azure의 컨테이너 서비스)의 글·문항과 도식 `VmContainerDiagram`을 만든다.**

개념 6·7이 이 step의 중심이다 — 컨테이너는 VM과 **운영 체제를 누가 맡는가**로 갈리고(개념 6), Azure의 세 컨테이너 서비스는 **고객이 맡는 관리의 양**으로 갈린다(개념 7).
개념 5(Virtual Desktop)는 정의형이라 도식이 없다.

사실은 step 0이 확인해 `official.md`에 남긴 것에서만 가져온다.

## 읽어야 할 파일

- **`phases/103-azure-compute-networking/guide.md` 전체**
- `phases/103-azure-compute-networking/index.json`의 step 0·2 `summary` — step 0: Virtual Desktop(NO.499의 확인 결과), 컨테이너가 운영 체제를 어떻게 함께 쓰는지의 현행 표현, 세 컨테이너 서비스의 표기 / step 2: 교차 검사 수, 균형 줄
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-compute`(개념 1~4)와 앞 주제의 `azure-cloud-benefits.scalability`(컨테이너를 푼 한 줄) — 같은 말을 되풀이하지 않는다
- 도식 선례 — step 1·2의 도식과 `src/data/azure/visuals/azure-compute.json`, `src/components/diagrams/SharedResponsibilityDiagram.tsx`(phase 101 — 누가 무엇을 맡는가를 나란히)
- 목록 개념 선례 — `topics.json`의 `azure-regions-zones.zone-service-categories`·`azure-resource-hierarchy.subscription-boundaries`(phase 102)

## 작업

### 1. 개념 — `azure-compute` 주제의 `concepts` 끝에 덧붙인다

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `azure-compute.virtual-desktop` | Azure Virtual Desktop | — | **데스크톱**(운영 체제의 바탕 화면과 그 위의 앱으로 일하는 환경)·**가상화**(앞 개념이 풀었으면 되짚는다)·**Microsoft Entra ID**를 한 줄씩 푼다. 쓰는 경우의 예는 직접 만든다(Learn 단원의 지원 팀 예를 옮기지 않는다). NO.499에서 step 0이 확인한 사실만 쓴다 |
| 6 | `azure-compute.containers` | 컨테이너 | — | VM(개념 1)을 되짚어 견주며 세운다. **호스트**·**엔진**·**프런트 엔드**·**백 엔드**·**마이크로 서비스**를 한 줄씩 푼다. **도식의 예를 본문에 쓴다** — 호스트 하나에 VM 두 대를 두면 VM마다 운영 체제가 있고, 같은 호스트에 컨테이너 세 개를 두면 컨테이너마다 운영 체제를 두지 않는다(step 0이 확인한 표현으로 — 「호스트의 운영 체제를 함께 쓴다」가 확인되지 않았으면 「고객이 운영 체제를 관리하지 않는다」까지만) |
| 7 | `azure-compute.container-services` | Azure의 컨테이너 서비스 | `containers` | **목록 개념**(ADR-046) — 소개 문단 뒤 항목 셋(`- **한국어 이름**(English name)은 …`), 항목 다음에 고르는 기준 문단. **PaaS**·**오케스트레이션**·**부하 분산**(앞 개념이 풀었으면 되짚는다)을 푼다. 부모(개념 6) 바로 뒤에 둔다 |

### 2. 문항 — `az061`~`az064`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az061` | `virtual-desktop` | 예/아니요 「흔한 오해」 — Azure Virtual Desktop으로 받은 데스크톱의 앱과 데이터가 사용자의 기기에 내려받아져 실행되는가(아니요 — Azure에 남는다), 또는 VM 한 대에 여러 사용자가 동시에 접속할 수 있는가(다중 세션 — 예). 균형을 보고 하나를 고른다. 해설은 Virtual Desktop이 무엇을 어디에 두는지 가르친다 |
| `az062` | `containers` | 4지선다 「원리 이해」 또는 예/아니요 — 컨테이너가 VM보다 빨리 만들고 다시 시작하는 까닭(고객이 컨테이너마다 운영 체제를 두고 관리하지 않는다 — step 0 결과의 말로), 또는 컨테이너마다 고객이 운영 체제를 설치하고 패치하는가(아니요). 4지선다라면 오답은 같은 범주(까닭)에서 실제로 헷갈리는 것 — 컨테이너가 더 큰 하드웨어에서 실행되어서, 컨테이너가 데이터를 저장하지 않아서 같은 것은 출처에 없는 주장이므로 쓰지 않는다. 출처 안에서 오답 셋을 만들 수 없으면 예/아니요 |
| `az063` | `container-services` | 4지선다 「상황 적용」 — 컨테이너 하나를 VM 관리도, 따로 크기 조정·오케스트레이션도 없이 가장 빠르고 간단하게 실행하려는 상황(Container Instances). 오답은 같은 범주(Azure에서 컨테이너를 실행하는 방법) — Container Apps·AKS·VM에 직접 설치. **Container Apps와 갈리게** 문제문에 조건(크기 조정이나 부하 분산이 필요 없다)을 준다 |
| `az064` | `container-services` | 예/아니요 또는 4지선다 — 많은 컨테이너의 수명 주기를 관리하는 것이 오케스트레이션이고 그 서비스가 AKS라는 것, 또는 Container Instances가 어느 서비스 유형인가(PaaS — NO.117의 사실을 문장은 직접 만들어). `az063`과 다른 것을 묻는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 2 summary의 균형 줄이다.

### 3. 도식 — `src/data/azure/visuals/azure-compute.json`의 `diagrams`에 한 키를 더한다(앞 키는 바꾸지 않는다)

#### `azure-compute.containers` — `VmContainerDiagram`, JSON 키 `vm-containers`

- 물음형 제목 예: `VM과 컨테이너는 운영 체제를 어떻게 다르게 둘까?`
- 그릴 것: 그룹 박스 둘을 나란히(세로형은 위아래로) — `vm-host`(「VM으로 실행」)와 `container-host`(「컨테이너로 실행」). 그룹 라벨은 본문의 말로 바꿔도 된다.
  `vm-host` 안에 그룹 박스 `vm-1`(「VM 1」)·`vm-2`(「VM 2」), 각 VM 박스 안에 노드 `vm-1-app`(「앱 1」)·`vm-1-os`(「운영 체제」)와 `vm-2-app`(「앱 2」)·`vm-2-os`(「운영 체제」).
  `container-host` 안에 노드 `ctr-1`·`ctr-2`·`ctr-3`(「컨테이너 1」~「컨테이너 3」)과, 컨테이너가 함께 쓰는 아래층을 나타내는 노드 `host-os` — 라벨은 step 0이 확인한 표현대로(예: 「호스트의 운영 체제」). 확인되지 않았으면 `host-os`를 빼고 곁말로만 보인다(summary에).
  늘 보이는 연결선 — 각 앱에서 자기 VM의 운영 체제로(`link-vm-1`·`link-vm-2`), 각 컨테이너에서 `host-os`로(`link-ctr-1`~`link-ctr-3`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `vm` | VM | `vm-host` 안의 노드 모두 | `vm-1-os` 옆 「VM마다 따로, 고객이 관리」 | VM은 저마다 운영 체제를 실행하고, 그 운영 체제는 고객이 관리한다 |
  | `container` | 컨테이너 | `container-host` 안의 노드 모두 | `container-host` 근처 「컨테이너마다 운영 체제를 두지 않음」 | 컨테이너는 고객이 운영 체제를 관리하지 않아 가볍고, 빨리 만들고 늘리고 멈출 수 있다(step 0 결과대로) |

- 요점 테스트:
  - `vm-1`·`vm-2` 박스가 저마다 운영 체제 노드를 하나씩 담고, `container-host` 안의 운영 체제 노드는 하나(또는 없음)이다(세로형·가로형 모두).
  - `vm`에서 `container-host` 안의 노드가 모두 opacity `0.25`이고, `container`에서 `vm-host` 안의 노드가 모두 `0.25`다 — 두 시나리오의 선명한 노드가 겹치지 않는다.
  - 늘 보이는 연결선은 두 시나리오와 `전체`에서 모두 보이고, 어느 선도 그룹 박스 `vm-host`와 `container-host`를 가로지르지 않는다.
- 캡션·곁말의 사실은 개념 6 본문에 있어야 한다(ADR-036·038).

위 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-compute.containers': VmContainerDiagram` 한 줄(`azure-compute.availability-sets` 키 뒤). 개념 5·7에는 도식이 없다.

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `VmContainerDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~9·11~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 `azure-compute`의 개념은 7개, 문항은 64개, 마지막 id는 `az064`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. step 1·2가 쓴 개념 1~4·`az056`~`az060`·도식 문구 셋이 그대로인지 기계로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 세 컨테이너 서비스의 항목을 읽고 「언제 무엇을 고르는가」가 서는가.
4. `phases/103-azure-compute-networking/index.json`의 step 3을 갱신한다(성공 → guide.md 「summary에 적을 것」, 3회 실패 → `error`, `check-verbatim` 「건너뜀」 → `blocked`).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 8·9(Functions, App Service)를 만들지 마라.** 이유: step 4의 범위다.
- **Kubernetes의 구성 요소(파드·노드 풀·컨트롤 플레인 같은 것)를 쓰지 마라.** 이유: AZ-900 범위를 넘는다 — AKS는 「컨테이너의 수명 주기를 관리하는 오케스트레이션 서비스」까지다.
- **Learn 단원의 예(지원 팀의 교대 근무, 웹사이트를 셋으로 나눈 예)를 그대로 옮기지 마라.** 이유: ADR-009 — 사실만 가져오고 예는 직접 만든다.
