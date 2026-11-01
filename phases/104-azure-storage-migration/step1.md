# Step 1: services-blob-tiers

## 배경

phase 104는 Azure AZ-900 과목에 주제 둘을 더한다. 전체 계획·결정·공통 규칙은 `phases/104-azure-storage-migration/guide.md`에 있다.
**이 step은 주제 `azure-storage`(스토리지)를 만들고 그 첫 개념 셋(1 Azure Storage 서비스, 2 Azure Blob Storage, 3 Blob 액세스 계층)의 글·문항과, 이 주제의 첫 도식 `AccessTierDiagram`을 함께 만든다.**

사실은 step 0이 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다. step 0 summary가 「쓰지 않는다」로 정한 것을 지킨다.

## 읽어야 할 파일

- **`phases/104-azure-storage-migration/guide.md` 전체**
- `phases/104-azure-storage-migration/index.json`의 step 0 `summary` — 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지, 계정 기본 계층의 현행 표현
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/ZoneIsolationDiagram.tsx`와 `.test.tsx`(그룹 박스와 시나리오), `src/data/azure/visuals/azure-regions-zones.json`,
  `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-network-protection` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-storage", "title": "스토리지", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
개념은 guide.md 표의 1·2·3이다. `name`은 step 0 summary가 확정한 표기를 쓴다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `azure-storage.storage-services` | Azure Storage 서비스 | — | **목록 개념**(ADR-046) — 소개 문단 뒤 `- **한국어 이름**(English name)은 …` 항목 다섯, 항목 다음에 고르는 기준의 문단. 이 주제의 첫 개념이라 **스토리지**·**VM**을 짧게 푼다. 항목은 데이터의 모양과 쓰는 방식으로 쓴다 — 항목끼리 같은 꼴이어서 다섯을 나란히 견줄 수 있게 |
| 2 | `azure-storage.blob-storage` | Azure Blob Storage | — | **비정형 데이터**·**객체**·**컨테이너**·**HTTP**를 푼다. 컨테이너가 앱을 실행하는 그 컨테이너와 다른 말이라는 것을 그 자리에서 밝힌다. 쓰임은 사례로(직접 만든 예) — 목록을 그대로 옮기지 않는다. 앞 개념의 Blob 항목을 되풀이하지 않고 「왜 파일 공유가 아니라 Blob인가」까지 간다 |
| 3 | `azure-storage.access-tiers` | Blob 액세스 계층 | `blob-storage` | 계층은 **얼마나 자주 읽는가**의 선택이라는 것을 첫 문장에 세운다. 네 계층을 일상의 예로 — 직접 만든다(회사 A의 쇼핑몰 이미지·지난달 영수증·감사용 옛 기록 같은 꼴). **도식의 예를 본문에 쓴다** — 네 계층 이름, 비용의 방향, 최소 보관 일수, 계정 기본값으로 고를 수 없는 계층 |

### 2. 문항 — `src/data/azure/questions.json`에 `az086`~`az090`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az086` | `storage-services` | 4지선다 「상황 적용」 — 앱의 구성 요소들이 처리할 일을 메시지로 쌓아 두고 나중에 하나씩 꺼내는 상황. 정답 Azure Queue Storage. 오답은 같은 범주(Azure Storage 서비스) — Blob·Files·Table. 문제문에 「큐」·「쌓아 두는 줄」처럼 정답 이름에 닿는 말을 쓰지 않는다 |
| `az087` | `storage-services` | 4지선다 「상황 적용」 — `az086`과 다른 서비스를 고른다: VM에 붙일 디스크, 또는 행과 속성으로 된 구조적 데이터. 오답은 같은 범주. 보기 네 개의 꼴을 같게(이름 + 필요하면 짧은 풀이 — 모두 같은 길이로) |
| `az088` | `blob-storage` | 예/아니요 — 예가 되는 주장: Blob Storage의 객체는 URL로 세계 어디에서나 닿을 수 있는가(HTTP/HTTPS). 해설은 무엇으로 닿는지와 드라이브로 탑재하는 Azure Files와의 차이를 가르친다. 문제문에 정답 낱말을 흘리지 않는다 |
| `az089` | `access-tiers` | 4지선다 「상황 적용」 — 최소 보관 기간과 읽을 때 기다려도 되는지를 문제문에 주고 계층 넷 가운데 고른다. 정답이 쿨이나 콜드 중 하나가 되게 해도 좋다(보관을 묻는 문항은 `az091`이 가깝다) — 다른 계층이 함께 맞지 않게 조건을 준다 |
| `az090` | `access-tiers` | 예/아니요 「흔한 오해」 — 아니요가 되는 주장: 보관 계층을 스토리지 계정의 기본 계층으로 정할 수 있는가. 해설은 어디서 어떤 계층을 정하는지(계정 기본값 / Blob마다)를 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 시작 값은 guide.md 「배경」의 균형 줄이다. 4지선다 정답 위치는 이 phase 끝에 13/13/13/13에 가깝게 고르게 둔다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-storage.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-storage': azureStorageVisuals`로 넣는다.

#### `azure-storage.access-tiers` — `AccessTierDiagram`, JSON 키 `access-tiers`

- 물음형 제목 예: `읽는 빈도에 따라 어느 계층에 둘까?`
- 그릴 것: 그룹 박스 `online`(라벨 「온라인 계층」) 안에 노드 `hot`(「핫 계층」)·`cool`(「쿨 계층」)·`cold`(「콜드 계층」). 그룹 박스 `offline`(라벨 「오프라인 계층」) 안에 노드 `archive`(「보관 계층」). 라벨은 step 0이 확정한 표기를 쓴다.
  세로형은 네 노드를 위에서 아래로, 가로형은 왼쪽에서 오른쪽으로 둔다. 시나리오 경로 `cost-1`(`hot`→`cool`)·`cost-2`(`cool`→`cold`)·`cost-3`(`cold`→`archive`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `cost` | 비용의 방향 | 넷 모두 | `cost-1`·`cost-2`·`cost-3` | 「화살표 쪽일수록 저장 비용이 낮다」, 「화살표 쪽일수록 읽는 비용이 높다」 | 자주 읽는 데이터는 읽는 비용이 낮은 쪽, 거의 읽지 않는 데이터는 저장 비용이 낮은 쪽에 둔다 |
  | `retention` | 최소 보관 기간 | `cool`·`cold`·`archive` | 없음 | `cool` 옆 「최소 30일」, `cold` 옆 「최소 90일」, `archive` 옆 「최소 180일」 | 핫 계층에는 최소 보관 기간이 없고, 뒤로 갈수록 오래 두는 데이터에 맞는다(값은 step 0 결과대로) |
  | `account-default` | 계정 기본값 | `hot`·`cool`·`cold` | 없음 | `archive` 옆 「계정 기본값으로 고를 수 없다」 | 스토리지 계정의 기본 계층은 핫·쿨·콜드에서 고른다. 보관 계층은 Blob마다 정한다 |

  **곁말 위치**: 세로형에서 노드 오른쪽에 곁말을 둘 수 없으면 노드 폭을 줄이고 곁말을 그룹 안 빈 곳에 두거나 노드 아래로 내린다. 곁말이 라벨을 덮지 않는지 `estimateTextWidth`로 잰다.
- 요점 테스트:
  - `hot`·`cool`·`cold`의 상자는 `online` 그룹 안, `archive`의 상자는 `offline` 그룹 안이다(세로형·가로형 모두).
  - `cost`에서 경로 셋이 모두 보이고, 나머지 시나리오에서는 보이지 않는다. 경로 셋은 `hot`에서 `archive`로 이어진다(앞 경로의 끝 노드가 다음 경로의 시작 노드).
  - `retention`에서 `hot`이 opacity `0.25`이고 곁말 셋에 30·90·180이 있다.
  - `account-default`에서 `archive`만 opacity `0.25`다.
- 캡션·곁말의 사실은 개념 3 본문에 있어야 한다(ADR-036·038).

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

registry에는 `'azure-storage.access-tiers': AccessTierDiagram` 한 줄(`azure-network-protection.ddos-protection` 키 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 `AccessTierDiagram`이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다(guide.md 「출처」).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 90개, 마지막 id는 `az090`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 열한째 주제이고 `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 0 summary가 「쓰지 않는다」로 정한 것을 지켰는가.
4. `phases/104-azure-storage-migration/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 4~9(리하이드레이션, Azure Files, 중복성, 스토리지 계정)를 만들지 마라.** 이유: step 2~4의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **파일 공유의 액세스 계층(Azure Files 쪽)을 쓰지 마라.** 이유: 이 개념은 Blob의 계층이다. 두 말이 섞이면 NO.242의 혼동을 그대로 가르치게 된다.
- **계층의 금액·SLA 수치를 쓰지 마라.** 이유: guide.md 「배경」.
