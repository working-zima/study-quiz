# Step 7: azure-arc

## 배경

phase 107의 전체 계획·결정·공통 규칙은 `phases/107-azure-governance-tools/guide.md`에 있다. **이 step은 주제 `azure-management-tools`에 개념 13(Azure Arc)의 글·문항과 도식 `AzureArcDiagram`을 더해 주제를 마친다.**

중심 문제: **Azure Arc는 옮기지 않는다.** Azure 밖의 서버는 그 자리에서 실행되고, Azure에는 그 서버를 가리키는 리소스가 나타나 Azure 리소스처럼 정책·역할·태그를 건다. 학습자는 이것을 Azure Migrate(Azure로 옮기는 도구)나 VPN 연결(네트워크를 잇는 것)과 섞는다 — 4절대로 가른다.
앞 phase가 Arc를 한 줄씩만 썼다(`azure-cloud-models.multicloud`, `azure-security-model.defender-for-cloud`, `az128`) — 이 개념이 Arc의 자리다.

## 읽어야 할 파일

- **`phases/107-azure-governance-tools/guide.md` 전체**
- `phases/107-azure-governance-tools/index.json`의 앞 step `summary` — 특히 step 4가 확정한 Arc의 대상 목록과 「옮기지 않는다」의 근거
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식
- 도식 선례 — `src/components/diagrams/AzureMigrateDiagram.tsx`와 `.test.tsx`(옮기는 쪽 — 그림이 닮지 않게), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/106-azure-cost/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/data/azure/visuals/azure-management-tools.json`과 앞 step의 도식, `src/data/azure/topics.json`의 `azure-management-tools` 개념 8~12
- 겹치지 않게: `azure-cloud-models.multicloud`·`hybrid-cloud`, `azure-data-movement.azure-migrate`, `azure-security-model.defender-for-cloud`와 `az128`

## 작업

### 1. 개념 — `topics.json`의 `azure-management-tools` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 13 | `azure-management-tools.azure-arc` | — | 첫 문장은 리소스가 Azure·온-프레미스·다른 클라우드에 흩어지면 환경마다 다른 도구로 따로 관리해야 한다는 문제부터. **하이브리드**·**다중 클라우드**를 한 줄씩 푼다. Arc가 하는 일 — Azure 밖의 것을 Azure Resource Manager에 나타나게 하고(이 주제의 앞 개념이 Resource Manager를 풀었으면 되짚기만), 포털에서 보고 정책·역할·태그를 건다. 관리하는 대상은 step 4가 확정한 목록(미리 보기로 적힌 것은 쓰지 않는다), **Kubernetes 클러스터**를 한 줄로 푼다. **옮기지 않는다** — Azure Migrate와의 차이를 4절대로 한 문단(Azure Migrate는 이 주제 화면에서 한 줄로 푼다). **도식의 예(회사 A의 온-프레미스 서버, 다른 클라우드의 VM)를 본문에 쓴다** |

### 2. 문항 — `az172`~`az173`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az172` | `azure-arc` | 4지선다, 정답 위치 2 「상황 적용」 — 회사 데이터 센터의 서버를 옮기지 않고 그 자리에 둔 채, Azure에서 Azure VM과 같은 정책을 걸어 관리하려 한다. 정답 Azure Arc. 오답은 「온-프레미스와 Azure를 잇는다」로 헷갈리는 것(Azure Migrate, VPN 게이트웨이, Microsoft Entra Connect 같은 것) — 해설이 각각 무엇을 하는지 한 줄씩 푼다. 정답 이름의 일부를 문제문에 쓰지 않는다 |
| `az173` | `azure-arc` | 예/아니요, 정답 **아니요** 「흔한 오해」 — Azure Arc로 연결한 온-프레미스 서버는 Azure 데이터 센터로 옮겨져 실행되는가. 해설은 서버가 어디서 실행되고 Azure에 무엇이 나타나는지 가르친다. `az128`(Defender for Cloud의 범위)과 다른 것을 묻는다 |

### 3. 도식 — `azure-management-tools.azure-arc` — `AzureArcDiagram`, JSON 키 `azure-arc`

- 물음형 제목 예: `Azure 밖에 있는 서버를 어떻게 Azure에서 함께 관리할까?`
- 그릴 것: 그룹 `g-outside`(「Azure 밖」) 안에 `server-1`(「온-프레미스 서버」)·`other-vm`(「다른 클라우드의 VM」), 그룹 `g-azure`(「Azure」) 안에 `arm`(「Azure Resource Manager」)·`policy`(「Azure Policy」), 두 그룹 사이에 `arc`(「Azure Arc」). 경로 `connect-1`(`server-1`→`arc`), `connect-2`(`other-vm`→`arc`), `project`(`arc`→`arm`), `govern`(`policy`→`arm`). 라벨은 본문의 말로 고친다.
- 세로형(폭 280)은 위에서 아래로 `g-outside` → `arc` → `g-azure`로 쌓는다. `Azure Resource Manager`는 반각 글자가 많다 — 1.15배로 폭을 잡는다.
- 시나리오(말은 step 4 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `without` | Arc 없이 | `server-1`·`other-vm` | 없음 | 「환경마다 따로 관리한다」 | 흩어진 서버를 환경마다 다른 도구로 관리한다 |
  | `connect` | Arc로 연결하면 | `server-1`·`other-vm`·`arc`·`arm` | `connect-1`·`connect-2`·`project` | 「Azure 리소스처럼 나타난다」 | 서버는 그 자리에 있고, Azure Resource Manager에 그 서버가 리소스로 나타난다 |
  | `govern` | 함께 다스리기 | `arm`·`policy`·`server-1` | `govern` | 「정책·역할·태그를 건다」, 「서버는 옮겨지지 않는다」 | Azure 리소스처럼 정책을 걸어 함께 관리한다 |

- 요점 테스트: `server-1`·`other-vm`은 어느 배치에서도 `g-outside` 안이다 — 어느 시나리오에서도 `g-azure` 안으로 옮겨진 노드가 없다(노드 위치가 시나리오에 따라 바뀌지 않는다). `without`에서 `arc`·`arm`이 opacity `0.25`이고 경로가 보이지 않는다. `connect`의 보이는 경로 셋의 끝이 `arc`·`arc`·`arm`이다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다. `AzureMigrateDiagram`처럼 서버가 Azure로 건너가는 화살표로 읽히지 않게 — `connect-*`는 「연결」, 서버 노드는 늘 바깥 그룹에 둔다.

registry에 한 줄(`azure-management-tools.azure-cli` 키 뒤).

### 4. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~7·9·10)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 173개, 마지막 id는 `az173`, 예 43·아니요 43, 정답 위치 21/22/22/22이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `azure-management-tools`의 개념이 6개이고 순서가 guide.md 표와 같은지 본다. 「Copilot」·「Terraform」·「사용자 지정 위치」가 이 주제의 개념·문항·도식·표에 없는지 `grep`으로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/107-azure-governance-tools/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **Arc를 설치·연결하는 절차(에이전트, 스크립트, 포트)를 쓰지 마라.** 이유: 학습 가이드의 줄은 「목적」이다.
- **Arc의 데이터 서비스·사용자 지정 위치·ITOps 같은 Learn의 세부를 늘어놓지 마라.** 이유: guide 「배경」.
- **Azure Monitor·Microsoft Defender for Cloud가 Arc 서버에 무엇을 하는지 자세히 쓰지 마라.** 이유: 다른 주제(모니터링 — phase 108, 보안 도구 — phase 105)의 몫이다. 「모니터링도 Azure 리소스처럼 한다」 한 줄까지.
