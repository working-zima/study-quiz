# Step 6: virtual-network-subnets

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/103-azure-compute-networking/guide.md`에 있다.
**이 step은 주제 `azure-virtual-networking`(가상 네트워크와 연결)을 만들고 그 첫 개념 둘(10 가상 네트워크, 11 서브넷)의 글·문항과, 이 주제의 첫 도식 `VnetIsolationDiagram`을 함께 만든다.**

두 개념은 「나눔」과 「격리」로 갈린다 — 서브넷은 한 가상 네트워크의 주소 공간을 나누지만 그 사이 트래픽은 기본으로 오가고, 가상 네트워크끼리는 따로 잇지 않으면 통신하지 않는다.
학습자가 「서브넷을 나누면 막힌다」, 「같은 지역의 가상 네트워크는 이어져 있다」로 오해하기 쉽다.

사실은 step 5가 확인해 `official.md`에 남긴 것에서만 가져온다.

## 읽어야 할 파일

- **`phases/103-azure-compute-networking/guide.md` 전체**
- `phases/103-azure-compute-networking/index.json`의 step 5 `summary`(개념마다 확정한 `name`, 격리를 쓸 말, NO.184 무리의 처리)와 step 4 `summary`(교차 검사 수, 균형 줄)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 앞 주제의 가상 네트워크 한 줄 — `topics.json`의 `azure-resource-hierarchy.resource`, `azure-compute.vm-resources` — 같은 말을 되풀이하지 않고, 이 주제만 읽어도 서게 쓴다
- 도식 선례 — `src/components/diagrams/AzureRegionDiagram.tsx`와 `.test.tsx`(phase 102 — 그룹 안의 그룹 둘, 어느 그룹에도 들지 않는 노드), `src/data/azure/visuals/azure-regions-zones.json`, step 1~4의 도식

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-compute` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-virtual-networking", "title": "가상 네트워크와 연결", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 10·11이다. `name`은 step 5 summary가 확정한 표기를 쓴다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 10 | `azure-virtual-networking.virtual-network` | 가상 네트워크 | — | 이 주제의 첫 개념이라 **리소스**·**VM**·**온-프레미스**·**IP 주소**(사설·공용)·**트래픽**·**DNS**를 짧게 푼다. 하는 일 일곱을 한 문장에 늘어놓지 말고, 격리를 세운 뒤 나머지는 「인터넷과」·「온-프레미스와」·「다른 가상 네트워크와」 잇는 일로 묶어 한 문장씩. **도식의 예를 본문에 쓴다** — 회사 A가 가상 네트워크 A를 웹 서브넷과 데이터베이스 서브넷으로 나눠 VM 1·VM 2를 두고, 가상 네트워크 B에 VM 3을 둔다 |
| 11 | `azure-virtual-networking.subnets` | 서브넷 | `virtual-network` | 부모(개념 10) 바로 뒤. 「나눔」과 「격리」의 차이를 4절대로 — 서브넷을 나눠도 기본으로 막히지 않고, 막으려면 규칙(네트워크 보안 그룹 — 한 줄 풀이)을 건다. 도식은 부모의 것을 함께 쓴다 — 본문의 예(웹·데이터베이스 서브넷)를 부모와 같은 이름으로 |

### 2. 문항 — `az068`~`az070`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az068` | `virtual-network` | 4지선다 「상황 적용」 — VM 두 대가 따로 규칙을 두지 않아도 기본으로 서로 통신하지 않게 두려면 어디에 두는가(서로 다른 가상 네트워크 — step 5의 처리대로). 오답은 같은 범주(VM을 두는 곳의 선택)에서 실제로 헷갈리는 것: 같은 가상 네트워크에 두되 리소스 그룹을 나눈다, 같은 가상 네트워크에 두되 가용성 영역을 나눈다, 같은 가상 네트워크에 두되 공용 IP 주소를 붙이지 않는다. **「같은 가상 네트워크의 다른 서브넷」은 보기로 쓰지 않는다**(`az070`이 묻는다) |
| `az069` | `virtual-network` | 예/아니요 — 가상 네트워크의 사설 IP 주소로 인터넷에서 VM에 바로 닿을 수 있는가(아니요 — 들어오게 하려면 공용 IP 주소나 공용 부하 분산 장치), 또는 같은 지역에 만든 가상 네트워크끼리 기본으로 이어지는가(아니요 — NO.86, step 5 결과). `az068`과 다른 것을 고른다. 균형을 보고 주장의 방향을 바꿔도 된다 |
| `az070` | `subnets` | 예/아니요 「흔한 오해」 — 같은 가상 네트워크 안에서 서브넷을 나눠 VM을 두면, 서브넷이 다르다는 것만으로 두 VM의 통신이 기본으로 막히는가(아니요). 해설은 기본 경로와, 막으려면 무엇을 거는지 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 4 summary의 균형 줄이다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-virtual-networking.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-virtual-networking': azureVirtualNetworkingVisuals`로 넣는다.

#### `azure-virtual-networking.virtual-network` — `VnetIsolationDiagram`, JSON 키 `vnet-isolation`

- 물음형 제목 예: `서로 다른 가상 네트워크의 VM끼리도 바로 통신할 수 있을까?`
- 그릴 것: 그룹 박스 `vnet-a`(「가상 네트워크 A」) 안에 그룹 박스 `subnet-web`(「웹 서브넷」)·`subnet-db`(「데이터베이스 서브넷」 — 본문이 정한 이름), 그룹 박스 `vnet-b`(「가상 네트워크 B」).
  노드 — `subnet-web` 안에 `vm-1`(「VM 1」), `subnet-db` 안에 `vm-2`(「VM 2」), `vnet-b` 안에 `vm-3`(「VM 3」). 경로 `same-vnet` — `vm-1`에서 `vm-2`로, `same`에서만 보인다. `vm-1`과 `vm-3` 사이에는 경로를 두지 않는다.
  세로형은 가상 네트워크 둘을 위아래로 쌓는다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `same` | 같은 가상 네트워크 | `vm-1`·`vm-2` | `same-vnet` | `same-vnet` 근처 「서브넷이 달라도 통신」 | 같은 가상 네트워크 안이면 서브넷이 달라도 Azure가 기본으로 트래픽을 보낸다 |
  | `other` | 다른 가상 네트워크 | `vm-1`·`vm-3` | 없음 | `vm-3` 옆 「따로 잇지 않으면 통신하지 않음」 | 가상 네트워크는 서로 격리되어, 따로 잇지 않으면 다른 가상 네트워크의 VM과 통신하지 않는다(잇는 방법 — 피어링 등 — 은 이름만 한 줄로, 본문에 있는 것만) |

- 요점 테스트:
  - `subnet-web`·`subnet-db`가 `vnet-a` 안에 있고, `vnet-a`와 `vnet-b`의 상자가 겹치지 않는다. `vm-3`은 `vnet-b` 안이다(세로형·가로형 모두).
  - `same-vnet`의 두 끝이 `vm-1`·`vm-2`의 변 위다.
  - `other`에서 보이는 경로가 없고 `vm-2`가 opacity `0.25`다. `same`에서 `vm-3`이 `0.25`다.
- 캡션·곁말의 사실은 개념 10·11 본문에 있어야 한다(ADR-036·038).

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-virtual-networking.virtual-network': VnetIsolationDiagram` 한 줄(`azure-compute.app-service` 키 뒤). 개념 11에는 도식이 없다.

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `VnetIsolationDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~9·11~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 70개, 마지막 id는 `az070`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 아홉째 주제이고 `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지, `azure-compute`의 개념 9개·`az056`~`az067`·도식 문구가 그대로인지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 5 summary가 「쓰지 않는다」로 정한 것을 지켰는가.
4. `phases/103-azure-compute-networking/index.json`의 step 6을 갱신한다(성공 → guide.md 「summary에 적을 것」, 3회 실패 → `error`, `check-verbatim` 「건너뜀」 → `blocked`).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 12~17을 만들지 마라.** 이유: step 7~9의 범위다. 이 step의 글이 피어링·VPN 게이트웨이·ExpressRoute를 쓸 때는 한 줄 풀이로 그친다.
- **주소 범위의 실제 값과 CIDR 표기, 경로 테이블·사용자 정의 경로·BGP를 쓰지 마라.** 이유: guide.md 「배경」·「예시 값」.
- **NSG의 규칙을 자세히 쓰지 마라.** 이유: 주제 `azure-network-protection`의 몫이다. 한 줄 풀이로 그친다.
