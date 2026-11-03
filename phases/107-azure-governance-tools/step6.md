# Step 6: shell-commands

## 배경

phase 107의 전체 계획·결정·공통 규칙은 `phases/107-azure-governance-tools/guide.md`에 있다. **이 step은 주제 `azure-management-tools`에 개념 10(Azure Cloud Shell)·11(Azure PowerShell)·12(Azure CLI)의 글·문항과 도식 `CloudShellDiagram`, 표 `CommandToolsTable`을 더한다.**

중심 문제: **셸과 도구를 가른다.** Cloud Shell은 명령을 입력하는 자리(셸)이고, Azure PowerShell과 Azure CLI는 그 자리에서 실행하는 Azure 명령 도구다. Learn 단원 2는 「Azure CLI = Bash」처럼 짝지어 적지만 현행 제품 문서는 두 셸 모두에 두 도구가 들어 있다고 한다 — step 4가 정한 말로 쓴다. 그리고 PowerShell(셸)과 Azure PowerShell(그 위의 명령 묶음)도 가른다.

## 읽어야 할 파일

- **`phases/107-azure-governance-tools/guide.md` 전체**
- `phases/107-azure-governance-tools/index.json`의 앞 step `summary` — 특히 step 4가 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**(백틱 코드 표기), **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/RbacScopeDiagram.tsx`와 `.test.tsx`(그룹 안의 그룹), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `src/components/diagrams/azureCostManagementTables.tsx`와 `.test.tsx` — 표 선례
- `phases/106-azure-cost/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/data/azure/visuals/azure-management-tools.json`과 앞 step의 도식, `src/data/azure/topics.json`의 `azure-management-tools` 개념 8·9 — 앞 개념이 이미 푼 낱말과 목록 항목의 한 줄

## 작업

### 1. 개념 — `topics.json`의 `azure-management-tools` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 10 | `azure-management-tools.cloud-shell` | — | **셸**을 첫 문단에서 한 줄로 푼다. 설치 없이 브라우저에서 연다, 이미 로그인되어 있다. 두 셸을 고르고 두 셸 모두에 두 도구가 있다(step 4 결과의 말 그대로 — Learn의 짝짓기를 옮기지 않는다). 여는 곳 셋(step 4 결과, 주소는 코드 표기). 파일을 남기는 일(스토리지 계정 — 한 줄로 푼다 — 과 저장 요금, 붙이지 않으면 닫을 때 지워진다). **스크립트**(여러 명령을 차례로 적어 한 번에 실행하는 파일)를 이 주제에서 처음 쓰면 여기서 푼다. **도식의 예(웹 브라우저, 두 셸, 스토리지 계정)를 본문에 쓴다** |
| 11 | `azure-management-tools.azure-powershell` | — | PowerShell과 Azure PowerShell을 4절대로 가르는 것부터(셸 / 그 위의 Azure 명령 묶음). **cmdlet**과 명령 예 `New-AzVM`(step 4가 확인한 이름, 코드 표기 — 옵션 없이). 명령이 Azure REST API를 부른다(앞 개념이 REST API를 풀었으면 되짚기만). 하나씩 / 스크립트로 되풀이. 설치할 수 있는 운영 체제와 쓰려면 있어야 하는 것(step 4 결과대로 — 버전 수치는 쓰지 않는다). Cloud Shell에도 있다. 도식 없음 |
| 12 | `azure-management-tools.azure-cli` | — | 명령이 `az`로 시작한다(`az vm create`, 코드 표기). **Azure PowerShell과 할 수 있는 일은 같고 명령의 꼴이 다르다** — 같은 VM 만들기를 두 꼴로 견주는 문단(4절, 어느 쪽에 익숙한가로 고른다). 설치할 수 있는 운영 체제, Windows에 처음부터 들어 있는가(step 4 결과대로), 설치한 뒤 실행하는 셸(step 4 결과대로). 표 `CommandToolsTable`의 칸에 쓰는 사실을 본문에 먼저 쓴다 |

### 2. 문항 — `az167`~`az171`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az167` | `cloud-shell` | 4지선다, 정답 위치 0 「상황 적용」 — 프로그램을 설치할 수 없는 컴퓨터에서 Azure 명령을 바로 실행하려 한다. 정답 Azure Cloud Shell. 오답은 실제로 헷갈리는 것(설치형 명령 도구, 포털의 화면 등) — 「설치할 수 없다」는 조건으로 갈린다. 모바일 앱도 Cloud Shell을 열 수 있으므로 보기에 두지 않는다(정답이 둘로 읽힌다) |
| `az168` | `cloud-shell` | 예/아니요, 정답 **예** 「흔한 오해」 — step 4가 확인한 범위에서: Cloud Shell을 PowerShell로 열었을 때 az로 시작하는 Azure CLI 명령을 실행할 수 있는가(문항에는 백틱을 쓰지 않는다 — guide 「예시 값」). 「PowerShell을 골라도」처럼 답을 흘리는 「…도」를 쓰지 않는다. 근거가 다르면 맞는 주장으로 고친다(답은 예로 둔다) |
| `az169` | `azure-powershell` | 4지선다, 정답 위치 3 「개념 비교」 — 받은 스크립트에 `New-AzVM` 꼴의 명령이 적혀 있다. 이 명령을 실행하려면 컴퓨터에 무엇이 있어야 하는가(정답 Azure PowerShell — step 4의 표기). 오답은 Azure CLI, 셸만 있는 PowerShell, Bash처럼 「명령을 입력하는 것」으로 헷갈리는 것. Cloud Shell은 두 도구를 다 담아 정답으로도 읽히므로 보기에 두지 않는다(guide 「문항」 4항). 명령 이름은 백틱 없이 쓴다 |
| `az170` | `azure-powershell` | 예/아니요, 정답 **예** 「개념 확인」 — Windows가 아닌 운영 체제(Linux나 macOS 가운데 하나)의 컴퓨터에 Azure PowerShell을 설치해 쓸 수 있는가. 덤프 NO.224·445의 진술 문장을 그대로 쓰지 않는다 |
| `az171` | `azure-cli` | 4지선다, 정답 위치 1 「원인과 결과」 — Windows 컴퓨터에 Azure CLI를 설치한 담당자가 az 명령을 어디서 입력할 수 있는가(step 4 결과대로, 백틱 없이). 오답은 「Bash에서만」처럼 Learn의 짝짓기에서 생기는 오해와 실제로 헷갈리는 것 |

### 3. 도식 — `azure-management-tools.cloud-shell` — `CloudShellDiagram`, JSON 키 `cloud-shell`

- 물음형 제목 예: `브라우저에서 연 Cloud Shell 안에는 무엇이 들어 있을까?`
- 그릴 것: `browser`(「웹 브라우저」), 바깥 그룹 `g-cloud-shell`(「Azure Cloud Shell」) 안에 안쪽 그룹 `g-bash`(「Bash」)·`g-pwsh`(「PowerShell」), 각 안쪽 그룹에 `Azure CLI`·`Azure PowerShell` 노드 둘(`bash-cli`·`bash-azps`·`pwsh-cli`·`pwsh-azps` — 라벨은 같고 id만 다르다), 바깥에 `storage`(「스토리지 계정」). **Bash 쪽에 Azure CLI만, PowerShell 쪽에 Azure PowerShell만 두는 그림을 그리지 마라** — Learn의 짝짓기를 그림으로 가르치게 된다(step 4 결과가 다르면 그 결과대로 그린다).
  경로는 넣어도 되고 없어도 된다. 경로를 쓰면 노드에서 시작하고 끝나야 한다(그룹은 끝점이 될 수 없다 — guide 「경로」).
- 세로형(폭 280)에서 안쪽 그룹 둘을 나란히 두기 어려우면 위아래로 쌓는다. `Azure PowerShell`은 반각 글자가 많다 — 1.15배로 폭을 잡는다.
- 시나리오(말은 step 4 결과대로):

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `bash` | Bash를 고르면 | `browser`·`bash-cli`·`bash-azps` | 설계대로 | 「두 도구가 모두 있다」 | Bash 셸에서도 Azure CLI와 Azure PowerShell을 쓴다 |
  | `pwsh` | PowerShell을 고르면 | `browser`·`pwsh-cli`·`pwsh-azps` | 설계대로 | 「두 도구가 모두 있다」 | PowerShell 셸에서도 두 도구를 쓴다 |
  | `files` | 파일을 남기려면 | `storage`와 설계대로 | 설계대로 | step 4 결과 | 스토리지 계정을 붙이면 파일이 남고 그 저장 요금이 붙는다, 붙이지 않으면 닫을 때 지워진다 |

- 요점 테스트: `bash`와 `pwsh`의 선명한 노드에 각각 `Azure CLI`·`Azure PowerShell` 라벨이 하나씩 있다(두 셸 모두 두 도구). 네 도구 노드가 모두 `g-cloud-shell` 안이고 `storage`·`browser`는 밖이다(두 배치). 안쪽 그룹이 바깥 그룹 안에 들어 있다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄 — `cloud-shell`(도식), `azure-cli`(표). `azure-powershell`은 도식이 없어 넣지 않는다.

### 4. 표 — `CommandToolsTable`

`src/components/diagrams/azureManagementToolsTables.tsx`와 `.test.tsx`를 새로 만든다. `visuals/azure-management-tools.json`의 `tables["command-tools"]`, 개념 `azure-management-tools.azure-cli`. 열은 **도구 · 명령의 꼴 · 실행하는 곳**. 행은 Azure PowerShell / Azure CLI / Azure Cloud Shell — 칸은 이 주제 본문과 같게 쓴다. **칸에 백틱을 넣지 않는다** — `ComparisonTableFigure`는 칸의 글자를 그대로 그려 백틱이 화면에 보인다(설계 때 확인). 명령의 꼴은 「az로 시작하는 명령」, 「동사-명사 꼴의 cmdlet」처럼 글자로 쓴다. Cloud Shell 행은 「두 꼴을 모두 쓴다」·「브라우저」 쪽으로. `columnWidths`와 계산은 guide.md 「도식」대로 summary에 적는다. registry의 표 등록은 선례를 따른다.

### 5. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~7·9·10)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 171개, 마지막 id는 `az171`, 예 43·아니요 42, 정답 위치 21/22/21/22이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 「Bash 명령을 쓴다」처럼 Azure CLI를 한 셸에 묶는 말, 「PowerShell Core」·「Windows PowerShell」 같은 옛 조건이 새 개념·문항·도식·표에 없는지 `grep`으로 본다(step 4가 다르게 정했으면 그 결과를 따른다).
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/107-azure-governance-tools/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **명령의 옵션·매개변수·출력, 설치 명령, 버전 번호를 쓰지 마라.** 이유: guide 「배경」 — 명령 이름 둘(`az vm create`·`New-AzVM`)까지만.
- **Cloud Shell의 세션 시간·저장 용량 수치, Azure 드라이브, Terraform 같은 미리 설치된 다른 도구를 쓰지 마라.** 이유: guide 「배경」.
- **개념 13(Azure Arc)을 만들지 마라.** 이유: step 7의 범위다.
