# Step 1: virtual-machines

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/103-azure-compute-networking/guide.md`에 있다.
**이 step은 주제 `azure-compute`(컴퓨팅과 앱 호스팅)를 만들고 그 첫 개념 둘(1 가상 머신, 2 가상 머신에 필요한 리소스)의 글·문항과, 이 주제의 첫 도식 `VmResourcesDiagram`을 함께 만든다.**

사실은 step 0이 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다. step 0 summary가 「쓰지 않는다」로 정한 것(크기 계열 표, 가격 등)을 지킨다.

## 읽어야 할 파일

- **`phases/103-azure-compute-networking/guide.md` 전체**
- `phases/103-azure-compute-networking/index.json`의 step 0 `summary` — 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지, **VM에 꼭 있어야 하는 리소스와 선택인 리소스**
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 앞 주제의 VM 글 — `topics.json`의 `azure-service-types.iaas`·`azure-cloud-computing.spot-vm`(같은 말을 되풀이하지 않고, 이 주제만 읽어도 서게 쓴다)
- 도식 선례 — `src/components/diagrams/ResourceGroupScopeDiagram.tsx`와 `.test.tsx`(phase 102, 그룹 박스와 늘 보이는 연결선), `src/data/azure/visuals/azure-resource-hierarchy.json`,
  `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-resource-hierarchy` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-compute", "title": "컴퓨팅과 앱 호스팅", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 1·2다. `name`은 step 0 summary가 확정한 표기를 쓴다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `azure-compute.virtual-machines` | 가상 머신(Azure Virtual Machines) | — | 이 주제의 첫 개념이라 **VM**·**가상화**·**운영 체제**·**IaaS**(서비스형 인프라 — 공급자에게서 서버 같은 기반을 빌리고 그 위의 소프트웨어는 고객이 맡는 방식)·**이미지**를 짧게 푼다. 「고객이 무엇을 정하고 무엇을 계속 맡는가」가 요점이다. 쓰임 다섯은 한 문단에 한 줄씩 — 예는 직접 만든다 |
| 2 | `azure-compute.vm-resources` | 가상 머신에 필요한 리소스 | `virtual-machines` | **목록 개념**(ADR-046) — 소개 문단 뒤 `- **한국어 이름**(English name)은 …` 항목, 항목 다음에 「꼭 있는 것과 필요할 때 붙이는 것」을 가르는 문단. **리소스**·**리소스 그룹**·**네트워크 인터페이스**·**IP 주소**를 이 자리에서 한 줄씩 푼다. **도식의 예를 본문에 쓴다** — 회사 A가 VM 1을 만들 때 함께 생기는 것과, 인터넷에서 바로 접속하려고 공용 IP 주소를 더 붙이는 것(이름표라고 밝힐 필요는 없다) |

### 2. 문항 — `src/data/azure/questions.json`에 `az056`~`az057`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az056` | `virtual-machines` | 4지선다 「상황 적용」 — VM이 맞는 상황을 고른다. 예: 회사 B가 운영 체제의 설정을 직접 바꿔야 하는 오래된 프로그램을 그대로 클라우드로 옮기려 한다 — 무엇에 실행하나. 오답은 같은 범주(Azure에서 앱을 실행하는 곳)에서 실제로 헷갈리는 것 — 운영 체제를 고객이 다루지 않는 서비스(step 0이 확인한 것)들. 이 주제의 뒤 개념이 다룰 서비스를 보기로 쓰면 보기 안에서 한 줄로 풀거나, 문제문의 조건만으로 갈리게 한다. `az034`(IaaS에서 고객이 맡는 일)와 같은 것을 묻지 않는다 |
| `az057` | `vm-resources` | 예/아니요 「흔한 오해」 — 공용 IP 주소가 없으면 VM을 만들 수 없는가(아니요 — 공용 IP는 인터넷과 직접 통신할 때 붙이는 것이고, VM이 통신하려면 가상 네트워크와 네트워크 인터페이스가 있어야 한다. step 0 결과대로). 해설은 꼭 있는 것과 선택인 것을 가르친다. 균형을 보고 주장의 방향을 바꿔도 된다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 guide.md 「배경」의 균형 줄이다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-compute.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-compute': azureComputeVisuals`로 넣는다.

#### `azure-compute.vm-resources` — `VmResourcesDiagram`, JSON 키 `vm-resources`

- 물음형 제목 예: `VM 하나를 만들면, 무엇이 함께 있어야 할까?`
- 그릴 것: 그룹 박스 `vnet`(라벨 「가상 네트워크」) 안에 노드 `vm-1`(「VM 1」)·`nic`(「네트워크 인터페이스」). 그룹 밖에 노드 `os-disk`(「OS 디스크」)·`data-disk`(「데이터 디스크」)·`public-ip`(「공용 IP 주소」)·`nsg`(「네트워크 보안 그룹」).
  늘 보이는 연결선 — `vm-1`과 `os-disk`(`link-os`), `vm-1`과 `data-disk`(`link-data`), `vm-1`과 `nic`(`link-nic`), `nic`과 `public-ip`(`link-ip`), `nic`과 `nsg`(`link-nsg`). 연결선의 뜻(VM에 붙은 리소스)을 `legend`나 캡션으로 밝힌다.
  노드 라벨은 step 0이 확정한 표기를 쓴다(예: 「네트워크 인터페이스」가 아니라 다른 표기로 정했으면 그것을).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `required` | 꼭 있는 것 | `vm-1`·`os-disk`·`nic` | `nic` 옆 「가상 네트워크에 잇는다」 | VM 1은 운영 체제가 든 OS 디스크와, 가상 네트워크에 잇는 네트워크 인터페이스 없이는 만들 수 없다(step 0 결과대로 — 네트워크 보안 그룹을 여기에 넣을지도 step 0이 정한 「꼭/선택」대로) |
  | `optional` | 필요할 때 붙이는 것 | `vm-1`·`data-disk`·`public-ip` | `public-ip` 옆 「인터넷과 직접 통신할 때」, `data-disk` 옆 「데이터를 따로 둘 때」 | 공용 IP 주소와 데이터 디스크는 필요할 때 붙인다 — 데이터 디스크는 VM이 고장 나도 떼어 새 VM에 붙일 수 있다 |

  두 시나리오의 선명한 노드가 겹치는 것은 `vm-1`뿐이어야 한다. 네트워크 보안 그룹이 어느 쪽인지 step 0이 정하지 못했으면 두 시나리오 어디에도 선명하게 넣지 않고 `전체`에서만 보인다(곁말도 없다) — 그렇게 했으면 summary에.
- 요점 테스트:
  - `vm-1`·`nic`의 상자가 `vnet` 그룹 박스 안에 있고, `os-disk`·`data-disk`·`public-ip`·`nsg`의 상자는 그 박스 밖이다(세로형·가로형 모두).
  - `required`에서 `public-ip`·`data-disk`가 opacity `0.25`이고, `optional`에서 `os-disk`·`nic`이 `0.25`다.
  - 늘 보이는 연결선 다섯은 두 시나리오와 `전체`에서 모두 보이고, 각 선의 한 끝은 `vm-1`이나 `nic`이다.
- 캡션·곁말의 사실은 개념 2(와 1) 본문에 있어야 한다(ADR-036·038).

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-compute.vm-resources': VmResourcesDiagram` 한 줄(`azure-resource-hierarchy.hierarchy` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `VmResourcesDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~9·11~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 57개, 마지막 id는 `az057`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 여덟째 주제이고 `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 0 summary가 「쓰지 않는다」로 정한 것을 지켰는가.
4. `phases/103-azure-compute-networking/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~9(확장 집합, 가용성 집합, Virtual Desktop, 컨테이너, 컨테이너 서비스, Functions, App Service)를 만들지 마라.** 이유: step 2~4의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **네트워크 보안 그룹·가상 네트워크를 이 주제에서 자세히 쓰지 마라.** 이유: 주제 `azure-virtual-networking`·`azure-network-protection`의 몫이다(guide.md 「배경」). 한 줄 풀이로 그친다.
- **VM 크기 계열(B·D·E…)과 크기 이름 읽는 법을 쓰지 마라.** 이유: guide.md 「배경」이 쓰지 않기로 했다.
