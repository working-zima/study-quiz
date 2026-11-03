# Step 5: tools-portal

## 배경

phase 107의 전체 계획·결정·공통 규칙은 `phases/107-azure-governance-tools/guide.md`에 있다.
**이 step은 주제 `azure-management-tools`(관리 도구)를 만들고 개념 8(Azure 관리 도구)·9(Azure 포털)의 글·문항과 도식 `ToolAccessDiagram`을 더한다.**
사실은 step 4가 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

중심 문제: **도구가 여럿이어도 하는 일은 같다.** 어느 도구로 보내든 요청은 같은 관리 서비스를 거친다. 학습자가 도구를 「무엇을 할 수 있는가」가 아니라 **「어디서 어떻게 여는가」**로 고르게 한다 — 덤프가 가장 많이 묻는 것이 기기·운영 체제별로 쓸 수 있는 도구다(guide 「세 주제와 개념 17개」).

## 읽어야 할 파일

- **`phases/107-azure-governance-tools/guide.md` 전체**
- `phases/107-azure-governance-tools/index.json`의 앞 step `summary` — 특히 step 4가 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/CostAnalysisDiagram.tsx`와 `.test.tsx`(주제를 만드는 step의 첫 도식), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/106-azure-cost/verification.md`의 「메인 세션이 마무리에서 고친 것」
- 겹치지 않게: `src/data/azure/topics.json`의 `azure-cloud-benefits.manageability`와 `az023`, `azure-security-model.rbac-scope` 문단 4

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-governance` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-management-tools", "title": "관리 도구", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`. 개념은 guide.md 표의 8·9다. `name`은 step 4 summary가 확정한 표기를 쓴다.

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 8 | `azure-management-tools.management-tools` | — | **목록 개념**(ADR-046). 소개 문단 첫 문장은 Azure에서 리소스를 만들고 바꾸는 길이 하나가 아니라는 것부터. **리소스**·**구독**·**리소스 그룹**·**명령줄**을 이 문단에서 짧게 푼다. **Azure Resource Manager**를 한 줄로 풀고 어느 도구든 그곳을 거쳐 같은 결과가 된다고 쓴다. 항목 여섯은 같은 꼴(무엇으로 · 어디서 여는가). Azure PowerShell·Azure CLI 항목은 한 줄씩만 — 뒤 개념이 자세히 쓴다. **도식의 예(브라우저, 설치한 컴퓨터, 휴대폰)를 본문에 쓴다** |
| 9 | `azure-management-tools.azure-portal` | — | 웹 브라우저로 여는 화면부터. 무엇을 하는가(만들기·관리·지켜보기, 대시보드). **브라우저면 운영 체제와 상관없이 쓴다**(step 4 결과대로). 데이터 센터마다 있어 장애에 견디고, 유지 관리로 멈추는 시간이 없다. 주소는 step 4 결과대로 코드 표기. 명령 도구와의 차이 한 줄(화면을 눌러 하나씩 / 명령을 스크립트로 되풀이). 도식 없음 — 정의형 |

### 2. 문항 — `src/data/azure/questions.json`에 `az164`~`az166`

| id | 개념 | 형식과 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az164` | `management-tools` | 4지선다, 정답 위치 2 「상황 적용」 — 회사가 직접 만든 프로그램이 사람 손을 거치지 않고 Azure에 요청을 보내 리소스를 만들어야 한다. 정답 REST API. 오답은 Azure 포털·Azure 모바일 앱·Azure Cloud Shell처럼 「사람이 여는 도구」 — 「프로그램이 직접」이라는 조건으로 갈린다. 스크립트로도 맞게 읽히지 않게 Azure PowerShell·Azure CLI는 보기에 두지 않는다. 덤프 NO.235의 「데스크톱 앱」 문장을 쓰지 않는다 |
| `az165` | `management-tools` | 예/아니요, 정답 **예** 「개념 확인」 — step 4가 확인한 범위에서: 휴대폰의 Azure 모바일 앱으로 VM을 중지할 수 있는가. 근거가 다르면 맞는 주장으로 고친다(답은 예로 둔다) |
| `az166` | `azure-portal` | 예/아니요, 정답 **아니요** 「흔한 오해」 — Azure 포털은 정해진 유지 관리 시간마다 잠시 쓸 수 없게 되는가. 해설은 왜 멈추지 않는지(데이터 센터마다 있다, 계속 업데이트된다)를 가르친다. 덤프 NO.445의 「Windows에서만」 진술을 그대로 쓰지 않는다 |

### 3. 도식 — `azure-management-tools.management-tools` — `ToolAccessDiagram`, JSON 키 `tool-access`

이 step이 `src/data/azure/visuals/azure-management-tools.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-management-tools': azureManagementToolsVisuals`로 넣는다.

- 물음형 제목 예: `어떤 기기에서 무엇으로 Azure를 다룰까?`
- 그릴 것: 그룹 `g-browser`(「웹 브라우저로 연다」) 안에 `portal`(「Azure 포털」)·`cloud-shell`(「Azure Cloud Shell」), 그룹 `g-install`(「컴퓨터에 설치한다」) 안에 `powershell`(「Azure PowerShell」)·`cli`(「Azure CLI」), 그룹 `g-phone`(「휴대폰 앱」) 안에 `mobile`(「Azure 모바일 앱」), 아래에 `arm`(「Azure Resource Manager」). 경로 `portal-to-arm`·`shell-to-arm`·`ps-to-arm`·`cli-to-arm`·`mobile-to-arm`(각 도구 → `arm`). 그룹 이름은 본문의 말로 고친다.
- 세로형(폭 280)은 그룹 셋을 위아래로 쌓고 그룹 안의 노드 둘을 나란히 둔다. `Azure Cloud Shell`·`Azure PowerShell`·`Azure Resource Manager`는 반각 글자가 많다 — guide 「글자 폭의 여유」의 1.15배로 폭을 잡는다. 경로가 다른 그룹의 노드·라벨 영역을 지나지 않게 `arm`까지의 길을 설계한다(필요하면 `arm`을 가운데 두고 그룹을 양옆에).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `browser` | 브라우저로 | `portal`·`cloud-shell`·`arm` | `portal-to-arm`·`shell-to-arm` | 「설치 없이」 | 웹 브라우저만 있으면 운영 체제와 상관없이 포털과 Cloud Shell을 연다 |
  | `install` | 설치해서 | `powershell`·`cli`·`arm` | `ps-to-arm`·`cli-to-arm` | 「Windows·Linux·macOS」 | 두 명령 도구는 Windows·Linux·macOS 컴퓨터에 설치해 쓴다 |
  | `phone` | 휴대폰 앱으로 | `mobile`·`arm` | `mobile-to-arm` | step 4 결과 | 모바일 앱으로 할 수 있는 일 — step 4 결과대로 |

  `idleCaption`은 어느 도구로 보내든 요청이 Azure Resource Manager를 거친다는 것을 말한다.
- 요점 테스트: 어느 시나리오에서도 `arm`이 선명하고, 보이는 경로의 끝이 모두 `arm`이다. 시나리오마다 선명한 도구 노드가 그 그룹의 노드뿐이다. 다섯 경로의 합집합이 다섯 도구에서 하나씩 나온다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다. 휴대폰에서 브라우저로 포털을 여는 것도 맞는 사실이다 — 캡션이 「휴대폰에서는 앱만」으로 읽히지 않게 쓴다.

registry에 한 줄(`azure-governance.lock-inheritance` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3·5~7·9·10)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 166개, 마지막 id는 `az166`, 예 41·아니요 42, 정답 위치 20/21/21/21이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 열여덟째 주제이고 `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/107-azure-governance-tools/index.json`의 step 5를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 10~13을 만들지 마라.** 이유: step 6·7의 범위다. 이 step의 글이 Cloud Shell·명령 도구·Azure Arc를 쓸 때는 한 줄 풀이로 그친다.
- **Azure Resource Manager를 이 주제에서 자세히 쓰지 마라.** 이유: 주제 19(`azure-infrastructure-as-code.resource-manager`)의 몫이다. 「모든 도구의 요청이 거치는 Azure의 관리 서비스」 한 줄까지.
- **포털의 메뉴 경로·화면 이름을 늘어놓지 마라.** 이유: 화면은 자주 바뀌고 학습 가이드의 줄은 「무엇인가」다.
