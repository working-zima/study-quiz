# Step 2: availability-zones

## 배경

phase 102는 Azure AZ-900 과목에 주제 둘을 더한다. 전체 계획·결정·공통 규칙은 `phases/102-azure-regions-resource-hierarchy/guide.md`에 있다.
**이 step은 주제 `azure-regions-zones`에 개념 둘(3 가용성 영역, 4 가용성 영역 서비스 범주)의 글·문항과 도식 `ZoneIsolationDiagram`을 더한다.**

가용성 영역은 덤프가 이 주제에서 가장 많이 묻는 개념이고, 묻는 것은 거의 하나다 — **가용성 영역이 어떤 장애를 막고 어떤 장애를 못 막는가.**
데이터 센터 하나·영역 하나의 장애는 막고, 지역 전체에 미치는 큰 사건은 못 막는다. 본문·도식·문항이 이 경계를 분명히 세운다.

## 읽어야 할 파일

- **`phases/102-azure-regions-resource-hierarchy/guide.md` 전체**
- `phases/102-azure-regions-resource-hierarchy/index.json`의 step 0 `summary`(개념 3·4의 확정 `name`·범주 셋의 현행 이름·쓸 것과 쓰지 않을 것)와 step 1 `summary`(개념 1·2가 푼 낱말, 도식 설계, 균형 줄, 교차 검사 수)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체(특히 「수량과 상태를 바꾸는 도식」)
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/topics.json`(step 1이 만든 `azure-regions-zones`의 개념 1·2 — **먼저 통독한다**), `questions.json`, `visuals/azure-regions-zones.json`, `data.test.ts`·`visuals.test.ts`
- 도식 선례 — step 1의 `src/components/diagrams/AzureRegionDiagram.tsx`와 `.test.tsx`(같은 주제 — 그룹 안의 그룹, 이름표), `src/components/diagrams/NatCountDiagram.tsx`(가용 영역 하나의 장애를 곁말과 흐림으로 — 짜임만 참고하고 AWS의 낱말은 가져오지 않는다),
  `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-regions-zones` 끝에

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `azure-regions-zones.availability-zones` | 가용성 영역 | — | 지역(개념 2)과 데이터 센터(개념 1)를 되짚어 세운다 — 지역 안에서 물리적으로 떨어진 데이터 센터 묶음이라는 것, 독립된 전원·냉각·네트워크라서 하나가 멈춰도 나머지가 동작한다는 것. 지원 지역에는 최소 셋, 모든 지역이 지원하지는 않는다. 쓰는 법(영역마다 두고 복제, 비용이 들 수 있다). **못 막는 것**: 한 지역의 여러 영역에 함께 미치는 큰 사건 — 그 대비는 리소스를 다른 지역에도 두는 것이다(지역 쌍을 이름으로 쓰려면 한 줄로 푼다). **중복**을 한 줄로 푼다. **도식의 예를 본문에 쓴다** — 회사 A가 VM 1·VM 2·VM 3을 지역 A의 영역 1·2·3에 하나씩 두었다, 영역 1이 멈추면 VM 2·VM 3이 계속 동작한다, 지역 A 전체에 미치는 사건이면 셋 모두 멈춘다(VM 대수는 예라고 밝힌다) |
| 4 | `azure-regions-zones.zone-service-categories` | 가용성 영역 서비스 범주 | `availability-zones` | **목록 개념**(ADR-046) — 소개 문단 하나 뒤에 `- **한국어 이름**(English name)은 …` 꼴 항목 셋. 이름과 예는 step 0 summary가 확정한 현행 것. 영역 서비스와 영역 중복 서비스는 **누가 다른 영역에 복제하는가**(고객이 영역마다 둔다 / 플랫폼이 저절로)로 갈린다는 것을 항목 뒤 문단에서 4절대로 말한다. 비지역 서비스가 개념 2의 「지역을 고르지 않는 서비스」와 같은 것이면 그렇게 되짚는다(같지 않으면 되짚지 않는다 — step 0 결과대로). **관리 디스크**·**IP 주소** 같은 예의 낱말은 한 줄로 풀거나, 풀기 어려우면 예로 쓰지 않는다 |

### 2. 문항 — `src/data/azure/questions.json`에 `az042`~`az044`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az042` | `availability-zones` | 4지선다 「상황 적용」 — 회사 B가 **한 지역 안에서** 데이터 센터 하나가 멈춰도 웹 서비스가 계속 동작하게 하려 한다. 어떻게 두나 — 정답: VM을 같은 지역의 가용성 영역 여럿에 나눠 둔다. 오답은 실제로 헷갈리는 것(한 데이터 센터 안에 VM을 여러 대, 리소스를 리소스 그룹 여럿으로 나눔 — 리소스 그룹을 쓰려면 한 줄로 푼다, 더 큰 VM 한 대). **「다른 지역에 둔다」를 보기에 넣지 마라** — 데이터 센터 장애에도 맞는 답이라 정답이 둘이 된다(guide.md 「문항」 4항) |
| `az043` | `availability-zones` | 예/아니요 「흔한 오해」 — 가용성 영역 셋에 나눠 둔 VM은 지역 전체에 미치는 큰 재해에도 계속 동작하는가(아니요). 해설은 영역이 막는 범위와, 지역 전체에 대비하는 법(다른 지역에도 둔다)까지 가르친다. 균형을 보고 같은 사실을 맞는 쪽 주장(예 — 「영역 하나가 멈춰도 다른 영역의 VM은 계속 동작하나요?」 같은 꼴)으로 바꿔도 된다 — `az042`와 같은 것을 묻지 않게 |
| `az044` | `zone-service-categories` | 예/아니요 또는 4지선다 「개념 비교」 — 영역 서비스와 영역 중복 서비스를 가르는 것(누가 다른 영역에 복제하나). 예: 영역 하나에 고정해 만든 VM을 Azure가 다른 영역에 저절로 복제하는가(아니요 — 고객이 영역마다 둔다). 4지선다라면 범주 셋과 「가용성 영역을 쓰지 않음」 같은 범주 밖 보기를 섞지 말고, 상황(어느 쪽이 복제를 맡는가)으로 보기를 만든다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 step 1 summary의 균형 줄이다.

### 3. 도식

#### `azure-regions-zones.availability-zones` — `ZoneIsolationDiagram`, JSON 키 `availability-zones`

- 물음형 제목 예: `가용성 영역 하나가 멈추면, 그 지역에 둔 VM은 어떻게 될까?`
- 그릴 것: 그룹 박스 `region`(「지역 A」) 안에 그룹 박스 `zone-1`·`zone-2`·`zone-3`(「영역 1」·「영역 2」·「영역 3」 — step 0이 확인한 표기). 영역마다 노드 `vm-1`·`vm-2`·`vm-3`(「VM 1」…).
  영역마다 `dc-1`·`dc-2`·`dc-3`(「데이터 센터」)을 함께 두어 「영역은 데이터 센터 묶음」을 보여도 된다 — 280 폭에 들지 않으면 VM만 둔다(summary에).
  영역 사이를 잇는 늘 보이는 연결선(고속 네트워크·복제)은 본문에 근거가 있고 그룹 라벨 영역을 지나지 않게 그릴 수 있을 때만 둔다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `zone-down` | 영역 하나 중단 | 영역 2·3의 노드 | `zone-1` 라벨 옆 「중단」, 영역 2·3 쪽 「계속 동작」 | 영역 1이 멈춰도 전원·냉각·네트워크가 따로인 영역 2·3의 VM 2·VM 3은 계속 동작한다 |
  | `region-down` | 지역 전체 중단 | 없음 | `region` 라벨 옆 「지역 전체 중단」 | 지역 A 전체에 미치는 큰 사건이면 영역 셋의 VM이 모두 멈춘다 — 이 대비는 다른 지역에도 두는 것이다 |

  `region-down`은 선명한 노드가 없는 시나리오라 `nodes: []`로 둔다 — 선례의 흐림 계산(`active && !active.nodes.includes(id) ? 0.25 : 1`)으로 모든 노드가 흐려진다(설계 때 `HybridCloudDiagram.tsx`·`NatCountDiagram.tsx`에서 확인함).
- 요점 테스트:
  - `zone-down`에서 `zone-1` 박스 안의 노드는 모두 opacity `0.25`, `zone-2`·`zone-3` 박스 안의 노드는 모두 선명하다.
  - `region-down`에서 `region` 박스 안의 노드가 모두 `0.25`이고, 두 시나리오의 「선명한 노드 + 곁말」이 서로 다르다.
  - 세 영역 박스가 모두 `region` 박스 안에 있고 서로 겹치지 않는다. 각 VM 노드는 자기 영역 박스 하나에만 든다(세로형·가로형 모두).
- 캡션·곁말의 사실은 개념 3 본문에 있어야 한다(ADR-036·038).

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-regions-zones.availability-zones': ZoneIsolationDiagram` 한 줄(`azure-regions-zones.region` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `ZoneIsolationDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1·2·3·5·6·7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 44개, 마지막 id는 `az044`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `azure-regions-zones`의 개념 1~4를 처음부터 통독한다 — 개념 1·2가 이미 푼 낱말을 다시 풀지 않았는가, 「영역이 막는 범위」가 본문·도식·문항에서 같은가.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 0 summary가 「쓰지 않는다」로 정한 것(NO.493의 SLA 수치 등)을 지켰는가.
4. `phases/102-azure-regions-resource-hierarchy/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 5·6(지역 쌍, 소버린 지역)을 만들지 마라.** 이유: step 3의 범위다. 이 step의 글이 지역 쌍을 말할 때는 한 줄 풀이로 그친다.
- **step 1이 쓴 개념 1·2와 `AzureRegionDiagram`을 고치지 마라.** 고칠 것을 찾으면 summary에 적는다.
- **가용성 영역을 쓰는 서비스의 SLA 수치(덤프 NO.493의 99.99% 등)를 쓰지 마라.** 이유: guide.md 「배경」 — 서비스별 SLA 수치는 확인할 수 없다.
- **VM 확장 집합·가용성 집합을 개념으로 세우거나 자세히 쓰지 마라.** 이유: 주제 `azure-compute`의 몫이다(guide.md 「배경」).
