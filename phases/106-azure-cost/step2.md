# Step 2: vm-stop-unused

## 배경

phase 106의 전체 계획·결정·공통 규칙은 `phases/106-azure-cost/guide.md`에 있다. **이 step은 주제 `azure-cost-factors`에 개념 3(VM 중지와 할당 해제)·4(쓰지 않는 리소스와 비용)의 글·문항과 도식 `VmStopBillingDiagram`·`LeftoverResourcesDiagram`을 더한다.**

학습자가 가장 많이 묻는 「껐는데 왜 돈이 나가나」에 답하는 step이다. **무엇을 어떻게 끄면 어느 요금이 멈추는가**를 빠짐없이 가르게 쓴다.

## 읽어야 할 파일

- **`phases/106-azure-cost/guide.md` 전체**
- `phases/106-azure-cost/index.json`의 앞 step `summary` — 특히 출처 step이 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/RbacScopeDiagram.tsx`와 `.test.tsx`, `src/data/azure/visuals/azure-security-model.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/105-azure-identity-security/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/data/azure/visuals/azure-cost-factors.json`, 앞 step의 도식
- `src/data/azure/topics.json`의 `azure-compute.vm-resources`와 `az057` — 겹치지 않게

## 작업

### 1. 개념 — `topics.json`의 `azure-cost-factors` 끝에

| # | id | 이 step에서 특히 |
|---|---|---|
| 3 | `azure-cost-factors.vm-stop-deallocate` | 회사 A의 VM 1을 예로 세 상태를 차례로 — 실행 중, 운영 체제 안에서 종료, 할당 해제. 요금을 컴퓨팅과 디스크로 나눠 쓴다. 왜 운영 체제 안에서 끈 VM에 요금이 나오는가의 까닭(하드웨어를 잡고 있다)을 쓴다. 표기는 step 0 결과 |
| 4 | `azure-cost-factors.unused-resources` | 「모든 리소스에 요금이 붙는다」, 「요금이 없다」를 근거 범위로 쓴다(step 0 결과 — 근거를 못 찾은 것은 쓰지 않는다). 회사 B가 VM 1을 지운 뒤 리소스 그룹에 남은 것을 살피는 예. **도식의 예를 본문에 쓴다** |

### 2. 문항 — `az135`~`az138`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az135` | `vm-stop-deallocate` | 4지선다, 정답 위치 2 「상황 적용」 — 밤에는 쓰지 않는 VM의 컴퓨팅 요금을 멈추려 한다. 정답은 할당 해제에 이르는 동작(step 0 결과의 포털 중지). 오답은 실제로 헷갈리는 것 — 운영 체제 안에서 종료, 원격 연결 끊기, 절전 모드 |
| `az136` | `vm-stop-deallocate` | 예/아니요, 정답 **예** 「원인과 결과」 — 할당 해제한 VM의 디스크에 요금이 계속 붙는가. 놀람을 담지 않는다 |
| `az137` | `unused-resources` | 4지선다, 정답 위치 3 「상황 적용」 — 쓰지 않는 리소스 넷 가운데 지우면 비용이 줄어드는 것. 보기는 step 0 결과의 범위에서(예: 공용 IP 주소 / 네트워크 인터페이스 / 그 밖의 요금 없는 것). 덤프의 수량 나열을 옮기지 않는다 |
| `az138` | `unused-resources` | 예/아니요, 정답 **아니요** 「흔한 오해」 — step 0이 근거를 찾았을 때: 리소스 그룹을 지우지 않고 그대로 두는 것 자체로 요금이 나오는가. 근거가 없으면 다른 오해(VM을 지우면 딸린 디스크도 늘 함께 지워지는가)로 바꾸고 summary에 적는다. 답은 아니요로 둔다 |

### 3. 도식

#### `azure-cost-factors.vm-stop-deallocate` — `VmStopBillingDiagram`, JSON 키 `vm-stop-billing`

- 물음형 제목 예: `VM을 껐는데 무엇에 요금이 붙을까?`
- 그릴 것: 그룹 `vm`(「VM 1」) 안에 `compute`(「컴퓨팅」)·`disk`(「디스크」). 경로 없음. 상태 차이는 곁말과 흐림으로 보인다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `running` | 실행 중 | 둘 | 「둘 다 요금」 | 실행하는 동안 컴퓨팅과 디스크에 요금이 붙는다 |
  | `shutdown` | 운영 체제 안에서 종료 | 둘 | 「하드웨어를 잡고 있다」 | 꺼졌어도 할당되어 있어 컴퓨팅 요금이 계속된다 |
  | `deallocated` | 할당 해제 | `disk` | 「디스크 요금만 남는다」 | 하드웨어를 놓아 컴퓨팅 요금이 멈추고 디스크 요금은 남는다 |

- 요점 테스트: `running`과 `shutdown`은 선명한 노드가 같고 곁말과 캡션이 다르다. `deallocated`에서만 `compute`가 opacity `0.25`이고 `disk`는 어느 시나리오에서도 선명하다. 경로가 없다.

#### `azure-cost-factors.unused-resources` — `LeftoverResourcesDiagram`, JSON 키 `leftover-resources`

- 물음형 제목 예: `VM을 지운 뒤 무엇을 더 지워야 할까?`
- 그릴 것: 그룹 `resource-group`(「리소스 그룹 1」) 안에 `vm`(「VM 1」)·`disk`(「디스크」)·`public-ip`(「공용 IP 주소」)·`nic`(「네트워크 인터페이스」). 경로 없음.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `before` | VM이 있을 때 | 넷 | 없음 | VM을 만들면 딸린 리소스도 함께 생긴다 |
  | `after` | VM만 지운 뒤 | `disk`·`public-ip`·`nic` | 「함께 지워지지 않을 수 있다」 | VM을 지워도 딸린 리소스는 남을 수 있다 |
  | `charged` | 요금이 붙는 것 | `disk`·`public-ip` | 「지우면 비용이 준다」 | 남은 리소스 가운데 디스크와 공용 IP 주소에 요금이 붙고 네트워크 인터페이스에는 별도 요금이 없다 |

- 요점 테스트: 네 노드가 모두 `resource-group` 안(두 배치). `after`에서 `vm`만 opacity `0.25`, `charged`에서 `vm`·`nic`이 opacity `0.25`. 경로가 없다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로).

### 4. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 138개, 마지막 id는 `az138`, 예 34·아니요 35이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
3. `phases/106-azure-cost/index.json`의 step 2을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **「끄면 요금이 멈춘다」를 할당 해제와 가르지 않고 쓰지 마라.** 이유: 이 개념이 바로잡는 오해다.
- **근거를 못 찾은 「요금 없음」을 쓰지 마라.** 이유: step 0이 그 범위를 정했다. 학습자가 믿고 그대로 둘 수 있는 말이다.
