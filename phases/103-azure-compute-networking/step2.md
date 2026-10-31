# Step 2: scale-availability-sets

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/103-azure-compute-networking/guide.md`에 있다.
**이 step은 주제 `azure-compute`의 개념 둘(3 가상 머신 확장 집합, 4 가용성 집합)의 글·문항과 도식 `ScaleSetDiagram`·`AvailabilitySetDiagram`을 만든다.**

둘은 모두 「VM 여러 대를 묶는 방법」이라 학습자가 섞는다. 이 step의 글은 **무엇을 위해 묶는가**로 둘을 가른다 — 확장 집합은 같은 구성의 VM 수를 수요에 맞춰 늘리고 줄이며 부하를 나누고,
가용성 집합은 VM이 한꺼번에 멈추지 않게 전원·네트워크와 유지 관리의 묶음에 나눠 둔다. 그리고 가용성 집합이 막지 못하는 것(데이터 센터 수준의 장애)은 가용성 영역의 몫이라는 것을 세운다.

사실은 step 0이 확인해 `official.md`에 남긴 것에서만 가져온다.

## 읽어야 할 파일

- **`phases/103-azure-compute-networking/guide.md` 전체**
- `phases/103-azure-compute-networking/index.json`의 step 0·1 `summary` — step 0: 장애 도메인·업데이트 도메인의 수와 번호 매김, 확장 집합이 가용성 영역에 걸칠 수 있는지, 공식 문서의 권장 / step 1: 이 주제가 이미 푼 낱말, 교차 검사 수, 균형 줄
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」)
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-compute`(step 1이 쓴 개념 1·2)와 앞 주제의 `azure-cloud-benefits.scalability`·`elasticity`, `azure-regions-zones.availability-zones` — 같은 말을 되풀이하지 않고, 이 주제만 읽어도 서게 쓴다
- `src/data/azure/questions.json`의 `az017`·`az018`·`az042`·`az043` — 같은 것을 묻지 않는다
- 도식 선례 — step 1의 `VmResourcesDiagram`과 `src/data/azure/visuals/azure-compute.json`, `src/components/diagrams/ZoneIsolationDiagram.tsx`와 `.test.tsx`(phase 102 — 그룹 안의 그룹, 멈춘 영역을 곁말과 흐림으로), `src/components/diagrams/CloudScalingDiagram.tsx`(phase 101 — VM 수가 바뀌는 시나리오)

## 작업

### 1. 개념 — `azure-compute` 주제의 `concepts` 끝에 덧붙인다

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `azure-compute.scale-sets` | 가상 머신 확장 집합 | — | **부하 분산 장치**를 한 줄로 푼다. 확장 집합이 없을 때 해야 하는 일과 견주어 세운다. 가용성 영역에 걸칠 수 있다는 것은 step 0이 확인했으면 한 줄로(가용성 영역은 이 주제에서 한 줄로 푼다). **도식의 예를 본문에 쓴다** — 평소 VM 두 대가 요청을 나눠 받다가 사용자가 몰리면 같은 구성의 VM이 저절로 더해진다(대수는 예시) |
| 4 | `azure-compute.availability-sets` | 가용성 집합 | — | **장애 도메인**·**업데이트 도메인**을 이 자리에서 푼다(전원·네트워크 스위치를 함께 쓰는 묶음 / 계획된 유지 관리 때 함께 다시 시작될 수 있는 묶음). **계획된 유지 관리**(Azure가 미리 정해 하는 하드웨어·소프트웨어 업데이트 — step 0 결과의 말로)를 한 줄로 푼다. 막지 못하는 것과 그 대비(가용성 영역)를 4절대로. 확장 집합과 무엇이 다른지를 한 문단으로 — 「앞 개념에서 본 확장 집합은」으로 되짚어도 된다. **도식의 예를 본문에 쓴다** — VM 네 대를 가용성 집합에 두면 장애 도메인 셋에 나뉘어 한 장애 도메인에는 두 대가 놓이고, 업데이트 도메인은 네 대가 저마다 다르다(step 0이 확인한 배정 규칙과 어긋나지 않게, 「예를 들어」로) |

### 2. 문항 — `az058`~`az060`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az058` | `scale-sets` | 4지선다 「상황 적용」 — 같은 구성의 VM 여러 대가 요청을 나눠 받고, 수요나 정해 둔 일정에 따라 대수가 저절로 바뀌어야 하는 상황. 오답은 같은 범주(VM 여러 대를 묶거나 나눠 두는 Azure 기능 — 가용성 집합, 가용성 영역 등 step 0이 확인한 것)에서. `az017`·`az018`(늘리고 줄이는 것이 확장성·탄력성인가)과 다르게, **어느 기능을 쓰는가**를 묻는다 |
| `az059` | `availability-sets` | 4지선다 「개념 비교」 — 장애 도메인과 업데이트 도메인을 가른다. 예: 회사 C는 Azure의 계획된 유지 관리로 VM이 다시 시작될 때 웹 서비스의 VM이 한꺼번에 다시 시작되지 않게 하고 싶다 — 가용성 집합이 VM을 무엇에 나눠 두기 때문인가. 오답은 장애 도메인, 가용성 영역, 지역 쌍처럼 「나눠 두는 단위」 범주에서 |
| `az060` | `availability-sets` | 예/아니요 「흔한 오해」 — 가용성 집합에 VM을 나눠 두면 데이터 센터 전체가 멈추는 장애에도 VM이 계속 동작하는가(아니요 — step 0 결과대로). 해설은 가용성 집합이 막는 범위와 데이터 센터 장애의 대비(가용성 영역)를 가르친다. `az042`(데이터 센터 하나가 멈춰도 — VM을 어떻게 둘까)와 같은 것을 묻지 않는다 — 이 문항은 가용성 집합이 **무엇을 막지 못하는가**를 묻는다. 균형을 보고 주장의 방향을 바꿔도 된다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 1 summary의 균형 줄이다.

### 3. 도식 — `src/data/azure/visuals/azure-compute.json`의 `diagrams`에 두 키를 더한다(step 1의 `vm-resources`는 바꾸지 않는다)

#### `azure-compute.scale-sets` — `ScaleSetDiagram`, JSON 키 `scale-sets`

- 물음형 제목 예: `사용자가 몰리면, 확장 집합은 무엇을 할까?`
- 그릴 것: 그룹 밖 노드 `lb`(「부하 분산 장치」 — 본문이 정한 말), 그룹 박스 `scale-set`(「확장 집합」 — 본문이 정한 말) 안에 노드 `vm-1`·`vm-2`·`vm-3`·`vm-4`(「VM 1」~「VM 4」).
  경로 — `lb`에서 각 VM으로: `to-vm-1`·`to-vm-2`는 늘 보이고, `to-vm-3`·`to-vm-4`는 `peak`에서만 보인다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `normal` | 평소 | `lb`·`vm-1`·`vm-2` | 늘 보이는 둘 | — | 평소에는 같은 구성의 VM 두 대가 부하 분산 장치에서 요청을 나눠 받는다(대수는 예시) |
  | `peak` | 사용자가 몰릴 때 | 넷 모두와 `lb` | 넷 모두 | `vm-3`·`vm-4` 옆 「저절로 더해짐」 | 수요가 늘면 확장 집합이 같은 구성의 VM을 저절로 더하고, 부하 분산 장치가 새 VM에도 요청을 보낸다. 수요가 줄면 다시 줄인다 |

- 요점 테스트:
  - VM 넷의 상자가 `scale-set` 그룹 박스 안이고 `lb`는 밖이다(세로형·가로형 모두).
  - 경로 넷의 시작점은 모두 `lb`의 변 위, 끝점은 각 VM의 변 위다.
  - `normal`에서 `vm-3`·`vm-4`가 opacity `0.25`이고 `to-vm-3`·`to-vm-4`가 보이지 않는다. `peak`에서 경로 넷이 모두 보인다.

#### `azure-compute.availability-sets` — `AvailabilitySetDiagram`, JSON 키 `availability-sets`

- 물음형 제목 예: `가용성 집합은 VM을 어떻게 나눠 둘까?`
- 그릴 것: 그룹 박스 `availability-set`(「가용성 집합」) 안에 그룹 박스 `fd-1`·`fd-2`·`fd-3`(「장애 도메인 1」~「장애 도메인 3」 — 번호 매김은 step 0 결과대로. 공식 번호를 정하지 못했으면 이름표로 쓰고 summary에).
  노드 — `fd-1` 안에 `vm-1`·`vm-4`, `fd-2` 안에 `vm-2`, `fd-3` 안에 `vm-3`. 경로는 없다.
  업데이트 도메인은 노드 라벨에 넣지 않고 `maintenance`의 곁말·캡션으로 보인다(라벨이 길어져 폭을 넘는다). 세로형에서 장애 도메인 셋이 나란히 들지 않으면 위아래로 쌓는다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `power` | 전원 장애 | `vm-2`·`vm-3` | `fd-1` 근처 「전원이 멈춤」 | 전원과 네트워크 스위치를 함께 쓰는 장애 도메인 1이 멈추면 그 안의 VM 1·VM 4가 함께 멈추고, 다른 장애 도메인의 VM 2·VM 3은 계속 동작한다 |
  | `maintenance` | 계획된 유지 관리 | `vm-2`·`vm-3`·`vm-4` | `vm-1` 옆 「다시 시작 중」 | 계획된 유지 관리 때는 업데이트 도메인을 한 번에 하나씩 다시 시작한다 — VM 1의 업데이트 도메인이 다시 시작되는 동안 업데이트 도메인이 다른 VM 2~VM 4는 계속 동작한다 |

  두 시나리오가 흐리게 하는 VM이 다르다는 것(`power`는 VM 1·VM 4, `maintenance`는 VM 1만)이 이 도식의 요점이다 — 장애 도메인과 업데이트 도메인은 서로 다른 묶음이다.
  여기서 흐림은 「선택 밖」이 아니라 「멈춘 VM」을 뜻한다 — `legend`나 캡션으로 밝힌다(UI_GUIDE 「수량과 상태를 바꾸는 도식」).
- 요점 테스트:
  - `fd-1`·`fd-2`·`fd-3`이 `availability-set` 안에 있고, `vm-1`·`vm-4`가 `fd-1` 안, `vm-2`가 `fd-2` 안, `vm-3`이 `fd-3` 안이다(세로형·가로형 모두).
  - `power`에서 opacity `0.25`인 노드가 정확히 `vm-1`·`vm-4`이고, `maintenance`에서 정확히 `vm-1`이다.
  - 경로가 없다.

두 도식 모두 캡션·곁말의 사실은 개념 3·4 본문에 있어야 한다(ADR-036·038). 위 설계는 출발점이다 — 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-compute.scale-sets': ScaleSetDiagram`, `'azure-compute.availability-sets': AvailabilitySetDiagram` 두 줄(`azure-compute.vm-resources` 키 뒤, 개념 순서대로).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 두 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~9·11~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 `azure-compute`의 개념은 4개, 문항은 60개, 마지막 id는 `az060`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다. 교차 검사의 노드·경로 수가 두 도식만큼 늘었는지 step 1 summary의 수와 견준다.
2. step 1이 쓴 개념 1·2·`az056`~`az057`·`vm-resources` 도식 문구가 그대로인지 기계로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 확장 집합과 가용성 집합을 읽고 「무엇을 위해 묶는가」가 갈리는가.
4. `phases/103-azure-compute-networking/index.json`의 step 2를 갱신한다(성공 → guide.md 「summary에 적을 것」, 3회 실패 → `error`, `check-verbatim` 「건너뜀」 → `blocked`).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 5~9를 만들지 마라.** 이유: step 3·4의 범위다.
- **가용성 영역·지역 쌍을 이 주제에서 다시 개념으로 세우거나 자세히 쓰지 마라.** 이유: phase 102 `azure-regions-zones`의 몫이다. 한 줄 풀이로 그친다.
- **SLA 수치(99.95% 같은 것)를 쓰지 마라.** 이유: guide.md 「배경」.
