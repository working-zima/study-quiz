# Step 6: file-tools

## 배경

phase 104의 전체 계획·결정·공통 규칙은 `phases/104-azure-storage-migration/guide.md`에 있다.
**이 step은 주제 `azure-data-movement`(데이터 이동과 마이그레이션)를 만들고 그 첫 개념 셋(10 AzCopy, 11 Azure Storage Explorer, 12 Azure File Sync)의 글·문항과, 이 주제의 첫 도식 `FileSyncDiagram`을 함께 만든다.**

사실은 step 5가 확인해 `docs/source/azure/official.md`에 남긴 것에서만 가져온다.

## 읽어야 할 파일

- **`phases/104-azure-storage-migration/guide.md` 전체**
- `phases/104-azure-storage-migration/index.json`의 step 5 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**
- `docs/UI_GUIDE.md`의 「도식」 절 전체
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`, `src/data/azure/index.ts`·`data.test.ts`·`visuals.test.ts`, `src/components/diagrams/azureDiagramCoverage.test.ts`
- `src/data/azure/topics.json`의 `azure-storage`(같은 말을 되풀이하지 않되, **이 주제 화면만 읽고 뜻이 서게** 한다)
- 도식 선례 — `src/components/diagrams/ExpressRouteDiagram.tsx`(두 길을 시나리오로 가르는 짜임), `FileShareDiagram.tsx`(step 2)와 각 `.test.tsx`

## 작업

### 1. 개념 — `src/data/azure/topics.json`

`azure-storage` 주제 뒤에 주제 객체를 더한다 — `{ "id": "azure-data-movement", "title": "데이터 이동과 마이그레이션", "importance": 0, "sourcePages": [0, 0], "concepts": [ … ] }`. `importance`는 **0**이다(주제 지도의 대표 문항 3).
개념은 guide.md 표의 10·11·12다. `name`은 step 5 summary가 확정한 표기를 쓴다.

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 10 | `azure-data-movement.azcopy` | AzCopy | — | 이 주제의 첫 개념이라 **스토리지 계정**·**Blob**·**Azure Files**·**명령줄**을 짧게 푼다(앞 phase·앞 주제가 푼 낱말도 이 주제에서 다시 푼다). 첫 문단은 **누가 언제 쓰는가**. **동기화가 한 방향**이라는 것을 예로 — 회사 D가 서버의 폴더를 계정에 맞췄을 때 계정에서 지운·바꾼 것이 서버로 돌아오지 않는다(동기화의 정확한 동작은 step 5 결과대로). **도식의 예를 본문에 쓴다** — 원본과 대상 |
| 11 | `azure-data-movement.storage-explorer` | Azure Storage Explorer | — | AzCopy와 무엇이 같고(스토리지 계정을 다룬다, 안에서 AzCopy로 일한다) 무엇이 다른가(명령 / 화면) — 4절. 내려받아 실행하는 앱이라는 것 |
| 12 | `azure-data-movement.file-sync` | Azure File Sync | — | **Windows 파일 서버**·**캐시**·**클라우드 계층화**를 푼다. 클라우드 계층화와 Blob 액세스 계층이 **이름은 비슷해도 다른 일**이라는 것을 그 자리에서 밝힌다(4절). 온-프레미스·양방향의 뜻을 푼다. **도식의 예를 본문에 쓴다** — AzCopy의 한 방향과 File Sync의 양방향, 자주 쓰는 파일과 그렇지 않은 파일 |

### 2. 문항 — `az101`~`az103`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az101` | `azcopy` | 예/아니요 「흔한 오해」 — 아니요가 되는 주장: AzCopy로 동기화하면 양쪽에서 바뀐 내용이 서로 맞춰지는가. 해설은 원본과 대상, 한 방향을 가르친다. 문제문을 AzCopy 이름을 주고 쓴다 — 예/아니요에서는 정답 이름을 지우지 않아도 된다 |
| `az102` | `storage-explorer` | 4지선다 「상황 적용」 — 명령을 쓰지 않는 담당자가 스토리지 계정의 파일을 화면에서 올리고 내려받는 상황. 정답 Storage Explorer. 오답은 같은 범주의 도구 — AzCopy·Azure File Sync·Azure Data Box. Azure 포털을 보기로 쓰면 그것도 맞을 수 있으니 보기에 넣지 않고, 문제문이 「내 컴퓨터에 설치해 쓰는 앱」을 조건으로 준다(step 5 결과대로) |
| `az103` | `file-sync` | 4지선다 「상황 적용」 — 지점의 Windows 파일 서버를 그대로 쓰면서, 그 파일을 Azure에 모으고 양쪽이 저절로 맞춰지는 상황. 정답 Azure File Sync. 오답은 같은 범주 — AzCopy·Storage Explorer·Azure Data Box. 문제문에 「동기화」를 쓰지 않는다(정답 이름의 일부다) |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/azure/visuals/azure-data-movement.json`을 만들고 `src/data/azure/index.ts`의 `visualsByTopicId`에 `'azure-data-movement': azureDataMovementVisuals`로 넣는다.

#### `azure-data-movement.file-sync` — `FileSyncDiagram`, JSON 키 `file-sync`

- 물음형 제목 예: `한 방향 복사와 양쪽을 맞추는 일은 어떻게 다를까?`
- 그릴 것: 노드 `server`(「Windows 파일 서버」), `share`(「Azure Files 파일 공유」 — 표기는 step 5 결과대로). 그룹 박스 `on-premises`(「온-프레미스」)가 `server`를 담고, 그룹 박스 `azure`(「Azure」)가 `share`를 담는다. 경로 `azcopy-one-way`(`server`→`share`), `sync-up`(`server`→`share`), `sync-down`(`share`→`server`). 양방향의 두 선이 겹치지 않게 어긋나게 둔다(글자 그대로의 경로 — 교차 검사를 통과해야 한다).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `azcopy` | AzCopy | 둘 다 | `azcopy-one-way` | 「정한 방향으로만 복사」 | AzCopy의 동기화는 원본에서 대상으로 한 방향이다. 대상에서 바뀐 것이 원본으로 돌아오지 않는다 |
  | `file-sync` | Azure File Sync | 둘 다 | `sync-up`·`sync-down` | 「양쪽이 저절로 맞춰진다」 | File Sync는 서버에 설치하면 서버와 파일 공유의 파일을 양방향으로 맞춘다 |
  | `cloud-tiering` | 클라우드 계층화 | 둘 다 | 없음 | `server` 곁 「자주 쓰는 파일」, `share` 곁 「나머지 파일」 | 자주 쓰는 파일은 서버에 복제해 두고, 나머지는 요청할 때까지 클라우드에 둔다. Blob 액세스 계층과 다른 일이다 |

- 요점 테스트:
  - `server`는 `on-premises` 그룹 안, `share`는 `azure` 그룹 안이다(세로형·가로형 모두).
  - `azcopy`에서 `sync-up`·`sync-down`이 보이지 않고, `file-sync`에서 `azcopy-one-way`가 보이지 않는다.
  - `sync-up`의 끝이 `share`, `sync-down`의 끝이 `server`다.

위 도식 설계는 출발점이다. 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념(과 같은 주제의 다른 개념) 본문에 있어야 한다(ADR-036·038).

registry에 `'azure-data-movement.file-sync': FileSyncDiagram` 한 줄(`azure-storage` 키들 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 103개, 마지막 id는 `az103`, 주제 `azure-data-movement`의 개념은 3개다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`의 열두째 주제이고 `importance` 0·`sourcePages` [0, 0]인지, `data.test.ts`와 `azureDiagramCoverage.test.ts`를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다.
4. `phases/104-azure-storage-migration/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 13·14(Azure Migrate, Data Box)를 만들지 마라.** 이유: step 7의 범위다.
- **주제 `azure-storage`의 글을 고치지 마라.** 이유: 앞 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
