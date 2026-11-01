# Step 11: network-security-groups

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획·결정·공통 규칙은 `phases/103-azure-compute-networking/guide.md`에 있다.
**이 step은 주제 `azure-network-protection`(네트워크 보호)을 만들고 그 첫 개념 둘(18 네트워크 보안 그룹, 19 보안 규칙)의 글·문항과 도식 `NsgAssociationDiagram`·`NsgRuleOrderDiagram`을 만든다.**

덤프가 이 주제에서 가장 많이 묻는 것이 NSG다 — 어디에 연결하는가, 그리고 VM의 포트를 열려면 무엇을 하는가. 두 도식이 그 둘을 하나씩 맡는다:
`NsgAssociationDiagram`은 **연결한 곳에 따라 규칙이 미치는 VM이 다르다**는 것을, `NsgRuleOrderDiagram`은 **규칙을 우선순위 번호가 낮은 것부터 보고 처음 맞는 규칙에서 멈춘다**는 것을 보인다.

사실은 step 10이 확인해 `official.md`에 남긴 것에서만 가져온다.

## 읽어야 할 파일

- **`phases/103-azure-compute-networking/guide.md` 전체**
- `phases/103-azure-compute-networking/index.json`의 step 10 `summary`(개념마다 확정한 `name`, NSG를 연결할 수 있는 곳, 기본 규칙, 상태 저장, NO.68의 처리)와 step 9 `summary`(교차 검사 수, 균형 줄)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 앞 주제의 NSG 한 줄 — `topics.json`의 `azure-compute.vm-resources`, `azure-virtual-networking.subnets` — 같은 말을 되풀이하지 않고, 이 주제만 읽어도 서게 쓴다
- 도식 선례 — step 6의 `VnetIsolationDiagram`(가상 네트워크 안의 서브넷), step 8의 `SiteToSiteVpnDiagram`과 `src/data/azure/visuals/azure-virtual-networking.json`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-virtual-networking` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-network-protection", "title": "네트워크 보호", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 18·19다. `name`은 step 10 summary가 확정한 표기를 쓴다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 18 | `azure-network-protection.network-security-groups` | 네트워크 보안 그룹 | — | 이 주제의 첫 개념이라 **VM**·**가상 네트워크**·**서브넷**·**네트워크 인터페이스**·**IP 주소**·**포트**·**트래픽**을 짧게 푼다(앞 주제가 푼 낱말도 다시). 「어디에 연결하는가」와 「연결한 곳에 따라 미치는 범위」가 요점이다. NSG를 처음 쓸 때 「네트워크 보안 그룹(NSG)」으로 약어를 세운다(도식 라벨이 「NSG A」를 쓴다). **도식의 예를 본문에 쓴다** — 회사 E가 웹 서브넷에 NSG A를 연결하고(VM 1·VM 2), 데이터베이스 서브넷의 VM 3에는 네트워크 인터페이스에 NSG B를 연결한다 |
| 19 | `azure-network-protection.security-rules` | 보안 규칙 | `network-security-groups` | 부모 바로 뒤. 규칙의 속성은 한 문단에 묶고(목록 개념이 아니다), **우선순위**와 **기본 규칙**을 세운다. **인바운드**·**아웃바운드**·**프로토콜**·**서비스 태그**·**애플리케이션 보안 그룹**을 한 줄씩 푼다. 포트 예는 하나로 정해 도식과 같게 쓴다(guide.md 「예시 값」 — 웹 요청의 포트 같은 것, 덤프의 번호를 그대로 가져오지 않아도 된다). **도식의 예를 본문에 쓴다** — 우선순위 100에 그 포트를 허용하는 인바운드 규칙을 더하면, 그 포트로 오는 요청은 그 규칙에서 허용되고 다른 포트로 오는 요청은 기본 거부 규칙에서 거부된다 |

### 2. 문항 — `az079`~`az082`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az079` | `network-security-groups` | 예/아니요 「흔한 오해」 — NSG를 가상 네트워크 전체에 바로 연결할 수 있는가(아니요 — 서브넷이나 네트워크 인터페이스에 연결한다, step 10 결과대로). 해설은 두 연결 대상과 각각이 미치는 범위를 가르친다. 균형을 보고 주장의 방향을 바꿔도 된다 |
| `az080` | `network-security-groups` | 4지선다 「상황 적용」 — 웹 서브넷의 VM 모두에, 앞으로 그 서브넷에 더할 VM까지 같은 규칙을 한 번에 걸려면 NSG를 어디에 연결하나(그 서브넷). 오답은 같은 범주(NSG를 거는 곳과 그 비슷한 것): 각 VM의 네트워크 인터페이스(지금의 VM에는 되지만 새 VM마다 다시 해야 한다 — 문제문의 「앞으로 더할 VM까지」가 가른다), 가상 네트워크 전체, VM들이 든 리소스 그룹 |
| `az081` | `security-rules` | 4지선다 「원리 이해」 — 같은 NSG에 우선순위 100의 「포트 거부」와 우선순위 200의 「같은 포트 허용」 인바운드 규칙이 있을 때 그 포트로 오는 요청은 어떻게 되나(거부 — 번호가 낮은 규칙이 먼저, 맞으면 멈춘다). 오답은 실제로 헷갈리는 결과: 허용된다(번호가 큰 규칙이 앞선다고 착각), 허용된다(허용이 거부보다 앞선다고 착각), 두 규칙이 부딪혀 기본 규칙이 적용된다 |
| `az082` | `security-rules` | 예/아니요 — NSG 인바운드 규칙의 원본으로 IP 주소 말고 서비스 태그나 애플리케이션 보안 그룹도 쓸 수 있는가(예 — NO.68의 사실을 문장은 직접 만들어, step 10 결과대로), 또는 VM으로 나간 요청의 응답이 돌아올 때 그 응답을 허용하는 인바운드 규칙을 따로 만들어야 하는가(아니요 — 상태 저장, step 10이 확인했을 때). 균형을 보고 하나를 고른다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 9 summary의 균형 줄이다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-network-protection.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-network-protection': azureNetworkProtectionVisuals`로 넣는다.

#### `azure-network-protection.network-security-groups` — `NsgAssociationDiagram`, JSON 키 `nsg-association`

- 물음형 제목 예: `NSG를 서브넷에 걸 때와 네트워크 인터페이스에 걸 때, 규칙은 어느 VM에 미칠까?`
- 그릴 것: 그룹 박스 `vnet`(「가상 네트워크」) 안에 그룹 박스 `subnet-web`(「웹 서브넷」)·`subnet-db`(「데이터베이스 서브넷」 — 본문이 정한 이름).
  `subnet-web` 안에 노드 `nsg-a`(「NSG A」)·`vm-1`(「VM 1」)·`vm-2`(「VM 2」). `subnet-db` 안에 노드 `vm-3`(「VM 3」)·`nic-3`(「네트워크 인터페이스」)·`nsg-b`(「NSG B」).
  늘 보이는 연결선 — `vm-3`과 `nic-3`(`link-nic`), `nic-3`과 `nsg-b`(`link-nsg-b`). `nsg-a`에는 선을 두지 않는다 — 서브넷 박스 안에 있는 것이 「그 서브넷에 연결」을 뜻한다는 것을 `legend`로 밝힌다(guide.md 「경로」 — 그룹에 거는 것은 선이 아니라 그룹 안의 노드로).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `subnet` | 서브넷에 연결 | `nsg-a`·`vm-1`·`vm-2` | `nsg-a` 옆 「웹 서브넷의 VM 모두에 적용」 | NSG A를 웹 서브넷에 연결하면 그 서브넷의 VM 1·VM 2 모두에 같은 규칙이 걸린다 |
  | `nic` | 네트워크 인터페이스에 연결 | `nsg-b`·`nic-3`·`vm-3` | `nsg-b` 옆 「VM 3에만 적용」 | NSG B를 VM 3의 네트워크 인터페이스에 연결하면 VM 3에만 규칙이 걸린다 |

- 요점 테스트:
  - `subnet-web`·`subnet-db`가 `vnet` 안이고, `nsg-a`·`vm-1`·`vm-2`가 `subnet-web` 안, `vm-3`·`nic-3`·`nsg-b`가 `subnet-db` 안이다(세로형·가로형 모두).
  - 두 시나리오의 선명한 노드가 겹치지 않는다. `subnet`에서 `vm-3`이, `nic`에서 `vm-1`·`vm-2`가 opacity `0.25`다.
  - 늘 보이는 연결선 둘은 `전체`와 두 시나리오에서 모두 보이고, `nsg-a`의 변에 닿는 선분이 없다.

#### `azure-network-protection.security-rules` — `NsgRuleOrderDiagram`, JSON 키 `nsg-rule-order`

- 물음형 제목 예: `규칙이 여러 개면, NSG는 어느 규칙을 따를까?`
- 그릴 것: 노드 `web-req`(「웹 요청」 — 본문의 포트 예를 담은 말)·`other-req`(「다른 포트 요청」)를 한쪽에, 규칙 노드 `rule-100`(「100: 웹 포트 허용」 — 본문의 말로)·`rule-default`(「기본 규칙: 인바운드 모두 거부」 — step 10이 확인한 기본 규칙의 우선순위·뜻으로)를 **우선순위 순서대로 위에서 아래로**, 노드 `vm-1`(「VM 1」).
  규칙 노드의 라벨이 길면 노드를 넓힌다 — 줄이지 마라. 그룹 박스 `nsg`(「NSG」)로 규칙 노드 둘을 감싸도 된다.
  경로 — `web-to-100`(`web-req` → `rule-100`), `allow-to-vm`(`rule-100` → `vm-1`), `other-to-100`(`other-req` → `rule-100`), `next-to-default`(`rule-100` → `rule-default`). 모두 시나리오에서만 보인다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `match` | 웹 요청 | `web-req`·`rule-100`·`vm-1` | `web-to-100`·`allow-to-vm` | `rule-100` 옆 「맞음 — 허용하고 멈춤」 | 우선순위 100의 규칙이 먼저 보이고, 맞으므로 허용하고 거기서 멈춘다 — 기본 규칙까지 가지 않는다 |
  | `no-match` | 다른 포트 요청 | `other-req`·`rule-100`·`rule-default` | `other-to-100`·`next-to-default` | `rule-default` 옆 「맞음 — 거부」 | 우선순위 100의 규칙에 맞지 않으면 다음 규칙으로 가고, 끝의 기본 규칙에서 거부된다 — VM 1에 닿지 않는다 |

- 요점 테스트:
  - `rule-100`의 y가 `rule-default`의 y보다 작다(위에 있다 — 세로형·가로형 모두).
  - `match`에서 `rule-default`가, `no-match`에서 `vm-1`이 opacity `0.25`다.
  - `no-match`에서 보이는 경로의 끝점이 `vm-1`의 변에 닿지 않는다.

두 도식 모두 캡션·곁말의 사실은 개념 18·19 본문에 있어야 한다(ADR-036·038). 위 설계는 출발점이다 — 본문(step 10 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-network-protection.network-security-groups': NsgAssociationDiagram`, `'azure-network-protection.security-rules': NsgRuleOrderDiagram` 두 줄(`azure-virtual-networking.expressroute` 키 뒤, 개념 순서대로).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 두 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~9·11~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 82개, 마지막 id는 `az082`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 열째 주제이고 `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지, 앞 두 주제의 개념 17개·`az056`~`az078`·도식 문구가 그대로인지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 10 summary가 「쓰지 않는다」로 정한 것을 지켰는가.
4. `phases/103-azure-compute-networking/index.json`의 step 11을 갱신한다(성공 → guide.md 「summary에 적을 것」, 3회 실패 → `error`, `check-verbatim` 「건너뜀」 → `blocked`).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 20·21(Azure Firewall, DDoS Protection)을 만들지 마라.** 이유: step 12의 범위다.
- **기본 규칙의 이름(영문 규칙 이름)을 늘어놓지 마라.** 이유: 뜻으로 충분하다 — 우선순위 번호와 하는 일을 쓴다(step 10이 확인한 것).
- **앞 주제의 NSG 한 줄(`azure-compute.vm-resources`·`azure-virtual-networking.subnets`)을 고치지 마라.** 이유: 앞 step의 글이다.
