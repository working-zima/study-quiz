# Step 1: entra-id-connect

## 배경

phase 105는 Azure AZ-900 과목에 주제 둘을 더한다. 전체 계획·결정·공통 규칙은 `phases/105-azure-identity-security/guide.md`에 있다.
**이 step은 주제 `azure-identity`(ID와 인증)를 만들고 그 첫 개념 둘(1 Microsoft Entra ID, 2 Microsoft Entra Connect)의 글·문항과, 이 주제의 첫 도식 `EntraConnectDiagram`을 함께 만든다.**
사실은 step 0이 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

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

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-data-movement` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-identity", "title": "ID와 인증", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`. 개념은 guide.md 표의 1·2다. `name`은 step 0 summary가 확정한 표기를 쓴다.

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 1 | `azure-identity.entra-id` | — | **목록 개념**(ADR-046). 이 주제의 첫 개념이라 **ID**·**디렉터리**를 짧게 푼다. 소개 문단 첫 문장에서 무엇을 하는 서비스인지 세우고 뒤 항목 넷은 같은 꼴로. 항목 다음 문단에 「도메인 컨트롤러를 직접 설치하지 않는다」(**도메인 컨트롤러**를 한 줄로 푼다)와 예전 이름 |
| 2 | `azure-identity.entra-connect` | `entra-id` | 회사 A의 온-프레미스 Active Directory를 예로, 연결이 없을 때 두 벌을 관리하는 불편에서 시작한다. **도식의 예를 본문에 쓴다** |

### 2. 문항 — `src/data/azure/questions.json`에 `az106`~`az108`

| id | 개념 | 형식과 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az106` | `entra-id` | 예/아니요, 정답 **아니요** 「흔한 오해」 — 온-프레미스 AD처럼 Entra ID를 쓰려면 Azure의 VM에 도메인 컨트롤러를 설치해야 하는가. 해설은 누가 무엇을 운영하는지와 도메인 컨트롤러가 필요한 옛 앱 쪽 서비스가 따로 있다는 것을 가르친다. `az041`(Entra ID와 지역)과 겹치지 않는다 |
| `az107` | `entra-id` | 4지선다, 정답 위치 0 「상황 적용」 — 직원들이 클라우드 앱에 회사 계정으로 로그인하게 하고, 그 ID를 한곳에서 관리하려는 상황. 정답 Microsoft Entra ID. 오답은 같은 범주의 Azure 서비스에서 실제로 헷갈리는 것(Microsoft Entra Domain Services·Azure Key Vault·Microsoft Defender for Cloud 같은 — 출처 안에서). 보기의 낱말을 문제문이 되풀이하지 않는다 |
| `az108` | `entra-connect` | 예/아니요, 정답 **예** 「원인과 결과」 — 온-프레미스 AD와 Entra ID를 연결하면 사용자가 같은 ID로 온-프레미스와 클라우드 양쪽에 닿는가. 「…도」, 「…만으로」로 방향을 흘리지 않는다 |

### 3. 도식 — `EntraConnectDiagram`, JSON 키 `entra-connect`

이 step이 `src/data/azure/visuals/azure-identity.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-identity': azureIdentityVisuals`로 넣는다.

- 물음형 제목 예: `온-프레미스 계정을 클라우드에서도 쓰려면?`
- 그릴 것: 그룹 `on-premises`(「온-프레미스」) 안에 `ad`(「Active Directory」). 그룹 `cloud`(「클라우드」) 안에 `entra`(「Microsoft Entra ID」)·`cloud-app`(「클라우드 앱」). `connect`(「Microsoft Entra Connect」)는 step 0이 확인한 자리에 둔다(온-프레미스에 설치한다고 확인되면 그 그룹 안). 세로형은 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로.
- 경로: `sync-1`(`ad`→`connect`), `sync-2`(`connect`→`entra`), `sign-in`(`entra`→`cloud-app`). 화살표 방향은 step 0이 확인한 동기화 방향대로 — 양방향이면 경로를 나란히 둘로 그리고 id를 그에 맞게 바꾼다(`FileSyncDiagram`의 `sync-up`·`sync-down`이 선례).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `separate` | 연결하지 않을 때 | `ad`·`entra` | 없음 | 「ID를 따로 두 벌 관리」 | 두 곳에 같은 사람의 ID를 따로 만들고 고쳐야 한다 |
  | `synced` | 연결한 뒤 | 넷 모두 | 셋 모두 | 「사용자 ID를 동기화」, 「같은 ID로 로그인」 | Connect가 ID를 맞춰 온-프레미스와 클라우드에 같은 ID로 닿는다 |

- 요점 테스트: `ad`는 `on-premises` 안, `entra`·`cloud-app`은 `cloud` 안(두 배치). `separate`에서 경로가 없고 `connect`·`cloud-app`이 opacity `0.25`다. `synced`에서 경로가 `ad`에서 `cloud-app`까지 이어진다(앞 경로의 끝 노드가 다음 경로의 시작 노드 — 양방향으로 바꾸면 그에 맞게).

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에는 `'azure-identity.entra-connect': EntraConnectDiagram` 한 줄(`azure-data-movement.data-box` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 108개, 마지막 id는 `az108`, 예 27·아니요 28이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 열셋째 주제이고 `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/105-azure-identity-security/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~9를 만들지 마라.** 이유: step 2~4의 범위다. 이 step의 글이 그 낱말(MFA, SSO, 인증)을 쓸 때는 한 줄 풀이로 그친다.
