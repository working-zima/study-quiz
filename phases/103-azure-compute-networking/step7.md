# Step 7: peering-endpoints

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/103-azure-compute-networking/guide.md`에 있다.
**이 step은 주제 `azure-virtual-networking`의 개념 둘(12 가상 네트워크 피어링, 13 퍼블릭 엔드포인트와 프라이빗 엔드포인트)의 글·문항과 도식 `VnetPeeringDiagram`·`PrivateEndpointDiagram`을 만든다.**

두 개념 모두 **트래픽이 공용 인터넷을 지나지 않는다**는 점이 요점이지만 잇는 대상이 다르다 — 피어링은 가상 네트워크와 가상 네트워크를, 프라이빗 엔드포인트는 가상 네트워크와 Azure 서비스(예: 스토리지 계정)를 잇는다.
글과 도식이 「무엇과 무엇을 잇는가」를 먼저 세우게 한다.

사실은 step 5가 확인해 `official.md`에 남긴 것에서만 가져온다.

## 읽어야 할 파일

- **`phases/103-azure-compute-networking/guide.md` 전체**
- `phases/103-azure-compute-networking/index.json`의 step 5 `summary`(피어링의 비전이성·다른 구독, 퍼블릭/공용 표기, NO.288의 처리)와 step 6 `summary`(이 주제가 이미 푼 낱말, 교차 검사 수, 균형 줄)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`의 `azure-virtual-networking`(개념 10·11)
- 도식 선례 — step 6의 `VnetIsolationDiagram`과 `src/data/azure/visuals/azure-virtual-networking.json`, `src/components/diagrams/RegionPairDiagram.tsx`(phase 102 — 지역 둘과 그 사이 경로)
- 목록 개념 선례 — `topics.json`의 `azure-compute.container-services`(step 3)

## 작업

### 1. 개념 — `azure-virtual-networking` 주제의 `concepts` 끝에 덧붙인다

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 12 | `azure-virtual-networking.peering` | 가상 네트워크 피어링 | — | **Microsoft 백본 네트워크**·**지역**을 한 줄로 푼다. 개념 10의 「격리」를 되짚어 「그 격리를 풀어 잇는 방법」으로 세운다. 비전이성·다른 구독은 step 5가 확인한 것만. VNet 간 VPN과 지나는 길이 다르다는 것은 VPN 게이트웨이를 한 줄로 풀어 쓴다. **도식의 예를 본문에 쓴다** — 지역 A의 가상 네트워크 A·B와 지역 B의 가상 네트워크 C, A-B와 A-C를 피어링 |
| 13 | `azure-virtual-networking.endpoints` | 퍼블릭 엔드포인트와 프라이빗 엔드포인트 | — | **목록 개념**(ADR-046) — 소개 문단(**엔드포인트**를 푼다) 뒤 항목 둘, 항목 다음에 고르는 기준 문단. **스토리지 계정**·**Private Link**를 한 줄씩 푼다. 서비스 엔드포인트는 쓰지 않는다. 표기는 step 5가 정한 대로(「퍼블릭 엔드포인트」와 「공용 IP 주소」가 함께 나오면 그대로 둔다 — Microsoft 한국어 문서의 표기). **도식의 예를 본문에 쓴다** — 회사 B의 스토리지 계정에 인터넷의 사용자는 퍼블릭 엔드포인트로, 가상 네트워크 안의 VM 1은 프라이빗 엔드포인트로 닿는다 |

### 2. 문항 — `az071`~`az072`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az071` | `peering` | 예/아니요 「흔한 오해」 — 가상 네트워크 A-B, B-C를 피어링하면 A와 C의 리소스도 서로 통신하는가(아니요 — step 5가 비전이성을 확인했을 때), 확인하지 못했으면 피어링한 두 가상 네트워크 사이의 트래픽이 공용 인터넷을 지나는가(아니요). 균형을 보고 주장의 방향을 바꿔도 된다. 해설은 피어링이 무엇을 잇고 트래픽이 어디로 다니는지 가르친다 |
| `az072` | `endpoints` | 4지선다 「상황 적용」 — 가상 네트워크 안의 VM이 스토리지 계정에 닿을 때 트래픽이 공용 인터넷을 지나지 않게 하려면(프라이빗 엔드포인트). 오답은 같은 범주(Azure 서비스나 다른 네트워크에 닿는 방법)에서 실제로 헷갈리는 것: 퍼블릭 엔드포인트로 닿는다, VM에 공용 IP 주소를 붙인다, 가상 네트워크 피어링(가상 네트워크끼리를 잇는 것이라 서비스에 닿는 길이 아니다). 서비스 엔드포인트는 보기로 쓰지 않는다(정답이 둘이 된다) |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 6 summary의 균형 줄이다.

### 3. 도식 — `src/data/azure/visuals/azure-virtual-networking.json`의 `diagrams`에 두 키를 더한다(앞 키는 바꾸지 않는다)

#### `azure-virtual-networking.peering` — `VnetPeeringDiagram`, JSON 키 `vnet-peering`

- 물음형 제목 예: `피어링한 가상 네트워크 사이의 트래픽은 어디로 다닐까?`
- 그릴 것: 그룹 박스 `region-a`(「지역 A」) 안에 그룹 박스 `vnet-a`(「가상 네트워크 A」)·`vnet-b`(「가상 네트워크 B」), 그룹 박스 `region-b`(「지역 B」) 안에 그룹 박스 `vnet-c`(「가상 네트워크 C」).
  노드 — 각 가상 네트워크 안에 `vm-1`·`vm-2`·`vm-3`, 그룹 밖에 `backbone`(「Microsoft 백본 네트워크」)·`internet`(「공용 인터넷」).
  경로 — `a-to-backbone`(`vm-1` → `backbone`), `backbone-to-b`(`backbone` → `vm-2`), `backbone-to-c`(`backbone` → `vm-3`). `internet`으로 가는 경로는 없다.
  지역 둘이 280 폭에 나란히 들지 않으면 위아래로 쌓는다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `regional` | 같은 지역 | `vm-1`·`backbone`·`vm-2` | `a-to-backbone`·`backbone-to-b` | `internet` 옆 「지나지 않음」 | 피어링한 가상 네트워크 A·B 사이의 트래픽은 사설로 Microsoft 백본 네트워크를 다니고 공용 인터넷에 들어가지 않는다 |
  | `global` | 다른 지역 | `vm-1`·`backbone`·`vm-3` | `a-to-backbone`·`backbone-to-c` | `backbone-to-c` 근처 「지역이 달라도」 | 다른 지역의 가상 네트워크 C와도 피어링할 수 있고, 그 트래픽도 백본으로 다닌다 |

- 요점 테스트:
  - `vnet-a`·`vnet-b`가 `region-a` 안, `vnet-c`가 `region-b` 안이고, `backbone`·`internet`은 어느 지역 박스에도 들지 않는다(세로형·가로형 모두).
  - 어느 시나리오에서도 보이는 경로의 끝점이 `internet`의 변 위에 있지 않다.
  - 두 시나리오 모두 `backbone`이 선명하고, `regional`에서 `vm-3`이, `global`에서 `vm-2`가 opacity `0.25`다.

#### `azure-virtual-networking.endpoints` — `PrivateEndpointDiagram`, JSON 키 `private-endpoint`

- 물음형 제목 예: `VM이 스토리지 계정에 닿을 때, 인터넷을 거치지 않으려면?`
- 그릴 것: 그룹 박스 `vnet`(「가상 네트워크」) 안에 노드 `vm-1`(「VM 1」)·`pe`(「프라이빗 엔드포인트」). 그룹 밖에 노드 `storage`(「스토리지 계정」)·`public-ep`(「퍼블릭 엔드포인트」)·`user`(「인터넷의 사용자」).
  경로 — `user-to-public`(`user` → `public-ep`), `public-to-storage`(`public-ep` → `storage`), `vm-to-pe`(`vm-1` → `pe`), `pe-to-storage`(`pe` → `storage`). 모두 시나리오에서만 보인다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `public` | 퍼블릭 엔드포인트 | `user`·`public-ep`·`storage` | `user-to-public`·`public-to-storage` | `public-ep` 옆 「공용 IP 주소 — 어디서나 닿음」 | 퍼블릭 엔드포인트는 공용 IP 주소를 가져 인터넷 어디서나 닿을 수 있다 |
  | `private` | 프라이빗 엔드포인트 | `vm-1`·`pe`·`storage` | `vm-to-pe`·`pe-to-storage` | `pe` 옆 「가상 네트워크의 사설 IP 주소」 | 프라이빗 엔드포인트는 가상 네트워크 안에서 사설 IP 주소를 받아, VM 1이 공용 인터넷을 거치지 않고 스토리지 계정에 닿게 한다(step 5 결과의 말로) |

- 요점 테스트:
  - `vm-1`·`pe`가 `vnet` 안이고 `public-ep`·`storage`·`user`는 밖이다(세로형·가로형 모두).
  - `private`에서 보이는 경로가 `public-ep`·`user`의 변에 닿지 않는다. `public`에서 보이는 경로가 `pe`·`vm-1`의 변에 닿지 않는다.
  - 두 시나리오 모두 `storage`가 선명하다.

두 도식 모두 캡션·곁말의 사실은 개념 12·13 본문에 있어야 한다(ADR-036·038). 위 설계는 출발점이다 — 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-virtual-networking.peering': VnetPeeringDiagram`, `'azure-virtual-networking.endpoints': PrivateEndpointDiagram` 두 줄(`azure-virtual-networking.virtual-network` 키 뒤, 개념 순서대로).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 두 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~9·11~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 `azure-virtual-networking`의 개념은 4개, 문항은 72개, 마지막 id는 `az072`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 앞 step이 쓴 개념·문항(`az056`~`az070`)·도식 문구가 그대로인지 기계로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 두 개념을 읽고 「무엇과 무엇을 잇는가」가 갈리는가.
4. `phases/103-azure-compute-networking/index.json`의 step 7을 갱신한다(성공 → guide.md 「summary에 적을 것」, 3회 실패 → `error`, `check-verbatim` 「건너뜀」 → `blocked`).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 14~17을 만들지 마라.** 이유: step 8·9의 범위다.
- **서비스 엔드포인트를 본문·문항·도식에 쓰지 마라.** 이유: guide.md 「배경」 — 학습 가이드는 퍼블릭·프라이빗 엔드포인트만 들고, 함께 쓰면 문항의 정답이 둘이 된다.
- **스토리지 계정의 종류와 세부를 쓰지 마라.** 이유: 주제 `azure-storage`의 몫이다. 한 줄 풀이로 그친다.
