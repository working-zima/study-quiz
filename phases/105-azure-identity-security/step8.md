# Step 8: security-tools

## 배경

phase 105의 전체 계획·결정·공통 규칙은 `phases/105-azure-identity-security/guide.md`에 있다. **이 step은 주제 `azure-security-model`에 개념 14(Microsoft Defender for Cloud)·15(Azure Key Vault)·16(Microsoft Sentinel)의 글·문항과 도식 `DefenderForCloudDiagram`·`SentinelFlowDiagram`, 표 `SecurityToolsTable`을 더해 주제와 phase의 데이터를 마친다.**

## 읽어야 할 파일

- **`phases/105-azure-identity-security/guide.md` 전체**
- `phases/105-azure-identity-security/index.json`의 앞 step `summary` — 특히 출처 step이 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/GeoRedundancyDiagram.tsx`와 `.test.tsx`, `src/data/azure/visuals/azure-storage.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/104-azure-storage-migration/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/data/azure/visuals/azure-security-model.json`, `src/components/diagrams/azureSecurityModelTables.tsx`, 앞 step의 도식

## 작업

### 1. 개념 — `topics.json`의 `azure-security-model` 끝에

| # | id | 이 step에서 특히 |
|---|---|---|
| 14 | `azure-security-model.defender-for-cloud` | **보는 곳과 하는 일**을 나눠 쓴다. 회사 A의 Azure VM·사내 서버·AWS 자원의 예. 평가·보안·방어는 직접 쓴 상황으로(보안 점수가 낮아 권장 사항을 처리한다 등). 규정 준수, 무료·유료는 step 5의 말로. 예전 이름을 한 번 밝힌다 |
| 15 | `azure-security-model.key-vault` | 앱 코드에 데이터베이스 암호를 적어 두는 문제에서 시작한다. 비밀·키·인증서를 예와 함께 한 줄씩 풀고 **인증서**를 푼다. **도식이 없는 정의형 개념**이다(guide.md 「배경」) |
| 16 | `azure-security-model.sentinel` | **SIEM**을 일상의 말로 풀고 흐름을 회사 A의 예로. Defender for Cloud와 가르는 문단(자원의 상태와 보호 / 여러 곳의 보안 데이터를 모아 찾고 대응). 표의 사실을 본문에 먼저 쓴다. 이 개념으로 주제가 끝나므로 주제 전체를 통독한다 |

### 2. 문항 — `az127`~`az130`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az127` | `defender-for-cloud` | 4지선다, 정답 위치 2 「상황 적용」 — 회사의 Azure 환경이 규제 표준을 얼마나 지키는지 점수와 권장 사항으로 보려 한다. 정답 Microsoft Defender for Cloud. 오답 Microsoft Sentinel·Azure Key Vault·Azure RBAC 같은 이 주제의 것. 「보안 상태」·「평가」가 정답을 흘리면 고쳐 쓴다 |
| `az128` | `defender-for-cloud` | 예/아니요, 정답 **아니요** 「흔한 오해」 — Defender for Cloud가 보호하는 대상은 Azure 안의 리소스뿐인가. 해설은 온-프레미스(Azure Arc)와 다른 클라우드를 가르친다 |
| `az129` | `key-vault` | 4지선다, 정답 위치 3 「상황 적용」 — 앱이 쓰는 데이터베이스 암호와 TLS 인증서를 코드 밖 한곳에 두고 누가 읽는지 통제하려 한다. 정답 Azure Key Vault. 오답 Azure Files·Microsoft Sentinel·Microsoft Defender for Cloud처럼 그럴듯한 것. TLS는 그 자리에서 푼다 |
| `az130` | `sentinel` | 4지선다, 정답 위치 0 「상황 적용」 — 여러 시스템의 보안 로그를 한곳에 모아 공격 흔적을 찾고, 찾으면 정해 둔 대응을 자동으로 실행하려 한다. 정답 Microsoft Sentinel. 오답 Microsoft Defender for Cloud·Azure Key Vault·Microsoft Entra ID. Defender for Cloud가 함께 맞지 않게 조건(여러 곳의 로그를 모음·자동 대응)을 준다 |

### 3. 도식

#### `azure-security-model.defender-for-cloud` — `DefenderForCloudDiagram`, JSON 키 `defender-for-cloud`

- 물음형 제목 예: `Azure 밖의 서버까지 어떻게 살필까?`
- 그릴 것: `defender`(「Microsoft Defender for Cloud」). 그룹 `azure`(「Azure」: `azure-resource` 「Azure 리소스」), 그룹 `on-premises`(「온-프레미스」: `server` 「사내 서버」), 그룹 `other-clouds`(「다른 클라우드」: `aws` 「AWS」·`gcp` 「GCP」). 경로 `watch-azure`·`watch-server`·`watch-aws`·`watch-gcp`(`defender`→각 노드 — 방향은 본문과 맞춘다).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `azure` | Azure | `defender`·`azure-resource` | `watch-azure` | 「따로 배포하지 않아도 된다」(step 5 근거의 범위로) | Azure 서비스의 많은 것은 추가 배포 없이 본다 |
  | `hybrid` | 온-프레미스 | `defender`·`server` | `watch-server` | 「Azure Arc로 연결」 | 사내 서버는 Azure Arc를 배포해 보호를 넓힌다 |
  | `multicloud` | 다른 클라우드 | `defender`·`aws`·`gcp` | `watch-aws`·`watch-gcp` | 「환경을 연결」 | AWS·GCP의 자원도 연결해 권장 사항과 보호를 받는다 |

- 요점 테스트: `azure-resource`·`server`·`aws`·`gcp`가 자기 그룹 안(두 배치). 모든 경로가 `defender`와 이어진다. 시나리오마다 다른 그룹의 노드가 opacity `0.25`다.

#### `azure-security-model.sentinel` — `SentinelFlowDiagram`, JSON 키 `sentinel-flow`

- 물음형 제목 예: `흩어진 보안 로그로 공격을 어떻게 찾을까?`
- 그릴 것: `sources`(「여러 데이터 원본」), `collect`·`detect`·`investigate`·`respond`(「수집」·「탐지」·「조사」·「대응」 — 표기는 step 5 결과). 경로 `flow-1`~`flow-4`가 차례로 잇고 늘 보인다. 세로형은 위에서 아래로, 가로형은 한 줄에 들지 않으면 두 줄로 접는다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `collect` | 모으기 | `sources`·`collect` | 「사용자·기기·앱·인프라」(step 5 근거 범위로) | 여러 곳의 보안 데이터를 한곳에 모은다 |
  | `detect` | 찾기 | `detect`·`investigate` | 「위협을 찾아 조사」 | 모은 데이터에서 위협을 찾고 범위를 살핀다 |
  | `respond` | 대응 | `respond` | 「플레이북으로 자동화」 | 정해 둔 절차를 플레이북으로 자동 실행한다 |

- 요점 테스트: 다섯 노드가 경로로 차례로 이어진다. `respond`에서 `sources`·`collect`·`detect`·`investigate`가 opacity `0.25`. 곁말 셋이 시나리오마다 하나씩만 보인다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로).

### 4. 표 — `SecurityToolsTable`

`src/components/diagrams/azureSecurityModelTables.tsx`에 더한다. `tables["security-tools"]`, 개념 `azure-security-model.sentinel`. 열은 **도구 · 맡는 일 · 고르는 때**, 행은 Microsoft Defender for Cloud·Azure Key Vault·Microsoft Sentinel. 칸은 본문에 맞춰 쓴다. **`Microsoft`·`Defender`·`Sentinel`이 낱말 중간에서 끊기지 않게** 첫 열 폭을 재고 계산을 summary에 적는다.

### 5. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다. 이 phase가 남긴 「쓰일 곳」이 근거 기록 말고 없어야 한다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 130개, 마지막 id는 `az130`, 예 32·아니요 33, 정답 위치 17/16/16/16이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `azure-security-model`의 개념이 7개이고 순서가 guide.md 표와 같은지 본다. 표 셋과 도식 열셋이 모두 있고 `phases/index.json`의 이 phase가 끝났는지(execute.py가 적는다) 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/105-azure-identity-security/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **가격·플랜 하나하나·CSPM 같은 약어의 나열을 쓰지 마라.** 이유: guide.md 「배경」. 무료·유료는 step 5가 정한 말까지만 쓴다.
- **Sentinel을 Azure Monitor의 기능처럼 설명하지 마라.** 이유: `azure-monitoring`의 범위이고 두 서비스가 섞인다.
- **Defender for Cloud와 Sentinel이 함께 정답인 상황을 만들지 마라.** 이유: guide.md 「문항」 4항.
