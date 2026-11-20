# Step 16: nfv-review

## 배경

phase 83은 네트워크 과목의 `transmission-media`·`network-topology`·`cloud-sdn`·`raid-storage`를 만든다. 전체 계획·결정·공통 규칙은 `phases/83-network-media-topology-cloud-raid/guide.md`에 있다.
**이 step은 `cloud-sdn`의 마지막 개념(7 NFV)의 글·문항·도식을 만들고, 주제 전체(7개념)를 통독한다.**
쓰기를 마친 뒤 주제 전체를 통독하는 데 시간을 쓴다.

기출은 NFV를 네 번 묻는다 — 「소프트웨어가 아닌 하드웨어로 제어」가 틀린 말([기출 2024-05-19 #26]·[기출 2025-08-24 #18]), 장점은 방화벽·라우터·로드 밸런서를 VNF로 만들어 유연하게 배치·확장하는 것([기출 2026-08-02 #26] — 오답 「제어 평면 분리」·「전용 하드웨어를 꼭 쓴다」·「물리 인프라 없이 운영」), 지문 누락 하나([기출 2024-11-03 #21] — 오답 WMN·VPN·CDN).

## 읽어야 할 파일

- guide.md 「개념을 넣는 step의 공통 — 읽어야 할 파일」 전부. 그에 더해:
- `phases/83-network-media-topology-cloud-raid/index.json`의 step 12 `summary`(VNF·NFVI·MANO, 장점, NFV와 SDN의 관계, E 번호)와 step 13~15 `summary`
- `src/data/network/topics.json` — **`cloud-sdn`의 앞 개념 여섯**(특히 `cloud-computing`의 가상화 한 줄과 `sdn`), `network-security.firewall`·`network-devices.load-balancing`·`routing.routing`(네트워크 기능의 예 — 뜻을 맞춘다), `windows-hyperv.hyper-v`(하이퍼바이저 — 뜻을 맞춘다)
- 도식 선례: `ServerlessDutiesDiagram`·`SdnPlanesDiagram`(이 phase), `ZigbeeStackDiagram`·`OsiStackDiagram`(쌓은 칸)과 그 테스트

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `cloud-sdn` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `cloud-sdn.nfv` | NFV | — | 네트워크 기능(한 줄 — 방화벽·라우터·로드 밸런서를 앞 주제의 뜻과 맞춘다)과 기능마다 전용 장비를 두던 방식, NFV의 뜻(step 12 결과대로), VNF·NFVI·MANO(step 12의 이름과 뜻대로), 장점(근거대로), 물리 서버·네트워크는 여전히 필요하다(NFVI). **NFV와 SDN**(4절 — 앞 개념 `sdn`과 뜻을 맞춘다, 함께 쓴다는 것은 근거대로), **VNF와 NFVI**(4절). 예: 지사마다 두던 방화벽 장비를 범용 서버 `NFVI01` 위의 가상 방화벽(VNF)으로 바꾸고, 트래픽이 늘면 VNF를 하나 더 실행한다(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n382`~`n383`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n382` | `nfv` | 4지선다 「개념 비교」 — 기출 묶음(NFV의 설명 넷 둘, NFV·WMN·VPN·CDN)을 쓰지 않는다. NFV의 구성 셋의 일을 묻는다 — 예: NFV에서 가상 방화벽·가상 라우터 같은 소프트웨어가 실행되도록 서버·저장 장치·네트워크 하드웨어와 가상화 계층을 내주는 부분은(정답 NFVI — 오답 VNF·NFV MANO와, SDN의 컨트롤러처럼 이 주제에서 헷갈리는 것 하나, step 12 결과대로). **정답 위치 3** |
| `n383` | `nfv` | 예/아니요 「원리 이해」 — **예** 쪽으로 세운다. 예: NFV로 방화벽 기능을 옮기면, 방화벽 전용 장비 대신 범용 서버 위에서 실행되는 소프트웨어가 그 일을 하나요?(예 — step 12 결과대로). n382와 다른 것을 묻는다. 해설은 「하드웨어로 제어한다」는 오해를 바로잡고, 그래도 물리 하드웨어(NFVI)가 필요하다는 것과 SDN과의 차이를 가르친다 |

이 step이 끝나면 예 78·아니요 77, 정답 위치 57/57/57/57이다(guide.md 「문항」 9항). 문항 글에 백틱을 쓰지 않는다.

### 3. 도식 — `NfvArchitectureDiagram`, JSON 키 `nfv-architecture`

- 물음형 제목 예: `NFV에서 네트워크 기능은 어디에서 실행될까?`
- 그릴 것: 아래에서 위로 — 「NFVI」 그룹 박스 안에 「하드웨어(`NFVI01`)」 칸과 「가상화 계층」 칸, 그 위에 VNF 노드(「가상 방화벽」·「가상 라우터」, 늘림 시나리오용 「가상 방화벽 2」는 다른 자리), 옆에 「NFV MANO」 노드와 VNF·NFVI로 가는 경로. 비교용으로 옆에 「전용 방화벽 장비」 노드(지난 방식 — 본문에 썼을 때만).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `vnf` | VNF | VNF 노드 둘 | 네트워크 기능을 소프트웨어로 만든 것이다 |
  | `nfvi` | NFVI | 하드웨어·가상화 계층 칸 | VNF가 실행될 하드웨어와 가상화 계층이다 |
  | `scale` | 늘리기 | MANO·VNF 셋과 MANO에서 가는 경로 | 트래픽이 늘면 MANO가 VNF를 하나 더 실행한다(본문대로) |

- 요점 테스트: 「가상 방화벽 2」는 `scale`에서만 선명하다. VNF 노드의 y가 「가상화 계층」 칸보다 위다(좌표로 — 하드웨어 위에 가상화, 그 위에 VNF). 세 시나리오의 선명한 노드 집합이 서로 다르다.

위 도식 설계는 출발점이다. 본문(step 12 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

### 4. 주제 `cloud-sdn` 통독

쓰기를 마친 뒤 **주제 `cloud-sdn`의 일곱 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말 — 특히 가상화를 모르는 학습자에게, 개념 사이의 어긋남, 되풀이, 같은 사실을 여러 곳이 다르게 말하는 곳 — 예: 가상화를 푼 두 자리, IaaS의 말, 데이터 센터·클라우드의 말, 제어 평면의 말)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다. 도식 일곱 개의 문구도 함께 읽는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 383개, 마지막 id는 `n383`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념을 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. NFV와 SDN을 처음 보는 사람이 둘을 가를 수 있는가.
3. n382의 보기 넷을 step 12의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. 주제 `cloud-sdn`의 일곱 개념을 통독한다(「작업」 4). 도식 일곱 개의 문구도 함께 읽는다.
5. guide.md 「검증 절차의 끝」대로 `phases/83-network-media-topology-cloud-raid/index.json`의 step 16을 갱신한다(「앞 개념에 고칠 것」에 통독 결과).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`raid-storage`의 개념을 만들지 마라.** 이유: step 18~20의 범위다.
- **ETSI NFV의 참조점(인터페이스) 전체, MANO의 세부 구성(VNFM·NFVO·VIM의 일)을 쓰지 마라.** 이유: 기출이 묻지 않는다(guide.md 「배경」). 이름을 한 줄로 드는 것까지는 된다(근거가 있을 때).
- **step 13~15의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
