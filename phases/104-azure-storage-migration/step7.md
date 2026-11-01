# Step 7: migrate-data-box

## 배경

phase 104의 전체 계획·결정·공통 규칙은 `phases/104-azure-storage-migration/guide.md`에 있다.
**이 step은 주제 `azure-data-movement`에 개념 13(Azure Migrate)·14(Azure Data Box)의 글·문항과 도식 `AzureMigrateDiagram`·`DataBoxDiagram`, 표 `DataMoveOptionsTable`을 더해 주제와 phase를 마친다.**

## 읽어야 할 파일

- **`phases/104-azure-storage-migration/guide.md` 전체**
- `phases/104-azure-storage-migration/index.json`의 step 5·6 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**
- `docs/UI_GUIDE.md`의 「도식」 절과 비교표의 규칙
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/components/diagrams/CLAUDE.md`, `src/data/azure/topics.json`의 `azure-data-movement` 앞 개념
- 도식 선례 — `src/components/diagrams/FileSyncDiagram.tsx`(step 6), `HierarchyInheritanceDiagram.tsx`(그룹 안의 단계)와 각 `.test.tsx`, 표 선례 `azureComputeTables.tsx`·`azureStorageTables.tsx`와 그 테스트

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-data-movement` 끝에 덧붙인다

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 13 | `azure-data-movement.azure-migrate` | Azure Migrate | — | **마이그레이션**·**허브**·**온-프레미스**를 푼다(앞 개념이 온-프레미스를 풀었으면 되짚는다). 첫 문단은 **파일 몇 개를 옮기는 앞 도구들과 무엇이 다른가** — 데이터 센터의 무엇을 옮길지 평가하고 이전을 한곳에서 지켜본다. **평가와 마이그레이션이 다른 단계**라는 것을 예로 — 회사 E. **도식의 예를 본문에 쓴다** |
| 14 | `azure-data-movement.data-box` | Azure Data Box | — | **왜 네트워크로 보내지 않는가**(대역폭)로 시작한다. **대역폭**을 한 줄로 푼다. 흐름을 문단 하나로 — 주문·배달·복사·반송·업로드·지움. 내보내기는 그 반대. **용량 수치를 쓰지 않는다**. **도식의 예를 본문에 쓴다**. 이 주제의 도구를 고르는 기준은 표로 넘긴다 — 진행 안내 없이 끝 문단은 Data Box가 맞지 않는 때(인터넷으로 충분히 빠른 작은 데이터)로 끝난다(step 5 결과대로) |

### 2. 문항 — `az104`~`az105`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az104` | `azure-migrate` | 4지선다 「상황 적용」 — 온-프레미스 서버들을 옮기기 전에 **무엇을 옮길 수 있는지 먼저 살펴보고** 이전까지 한곳에서 지켜보려는 상황. 정답 Azure Migrate. 오답은 같은 범주 — Data Box·AzCopy·File Sync. 문제문에 「이전」·「마이그레이션」을 그대로 쓰지 않는다(정답 이름의 일부다) |
| `az105` | `data-box` | 4지선다 「상황 적용」 — 데이터가 크고 네트워크가 느려서 인터넷으로 보내면 너무 오래 걸리는 상황. 정답 Data Box. 오답은 같은 범주 — AzCopy·File Sync·Azure Migrate. 덤프 NO.324의 문장을 옮기지 않는다. 숫자(테라바이트)를 쓰려면 사실 주장이 아닌 상황 값으로 쓰고, 안 써도 된다 |

**phase 끝의 균형을 확인한다** — 예 26·아니요 27(차이 1 이하), 정답 위치 13/13/13/13에 가깝게(최대·최소 차이 2 이하).

### 3. 도식 — `src/data/azure/visuals/azure-data-movement.json`에 더한다

#### `azure-data-movement.azure-migrate` — `AzureMigrateDiagram`, JSON 키 `azure-migrate`

- 물음형 제목 예: `데이터 센터를 어떻게 옮기기 시작할까?`
- 그릴 것: 그룹 박스 `on-premises`(「온-프레미스 데이터 센터」) 안에 노드 `servers`(「서버」)·`databases`(「데이터베이스」)·`web-apps`(「웹 앱」). 그룹 박스 `hub`(「Azure Migrate」) 안에 노드 `assess`(「검색 및 평가」)·`migrate`(「마이그레이션」) — 도구 이름은 step 5 결과대로. 노드 `azure`(「Azure」). 경로 `assess-flow`(`servers`→`assess`), `migrate-next`(`assess`→`migrate`), `to-azure`(`migrate`→`azure`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `assess` | 먼저 평가 | `servers`·`databases`·`web-apps`·`assess` | `assess-flow` | `assess` 옆 「무엇이 있고 옮길 수 있나」 | 먼저 데이터 센터에 무엇이 있는지 찾고 Azure로 옮길 수 있는지 평가한다 |
  | `migrate` | 그다음 이전 | `assess`·`migrate`·`azure` | `migrate-next`·`to-azure` | `hub` 곁 「한곳에서 지켜본다」 | 평가한 뒤 허브에서 이전을 시작하고 진행 상황을 지켜본다 |

- 요점 테스트:
  - `servers`·`databases`·`web-apps`는 `on-premises` 그룹 안, `assess`·`migrate`는 `hub` 그룹 안, `azure`는 두 그룹 밖이다(세로형·가로형 모두).
  - 경로가 `servers`에서 `azure`로 이어진다(앞 경로의 끝 노드가 다음 경로의 시작 노드).
  - `assess`에서 `azure`가 `0.25`, `migrate`에서 `servers`가 `0.25`다.

#### `azure-data-movement.data-box` — `DataBoxDiagram`, JSON 키 `data-box`

- 물음형 제목 예: `네트워크가 아니라 장치로 어떻게 옮길까?`
- 그릴 것: 노드 `local-data`(「온-프레미스 데이터」), `box`(「Data Box 장치」), `azure-storage`(「Azure 스토리지」). 경로 `copy-in`(`local-data`→`box`), `ship-in`(`box`→`azure-storage`), `ship-out`(`azure-storage`→`box`), `copy-out`(`box`→`local-data`). 두 방향의 선이 겹치지 않게 어긋나게 둔다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `import` | Azure로 가져오기 | 셋 모두 | `copy-in`·`ship-in` | `copy-in` 곁 「네트워크에 연결해 복사」, `ship-in` 곁 「반송하면 저절로 업로드」 | 받은 장치에 데이터를 복사해 돌려보내면 Azure에 올라가고, 그 뒤 장치의 디스크를 지운다 |
  | `export` | Azure에서 내보내기 | 셋 모두 | `ship-out`·`copy-out` | `ship-out` 곁 「데이터를 담아 배달」, `copy-out` 곁 「받아서 복사」 | 복구나 규제 때문에 큰 데이터를 내보낼 때는 장치가 데이터를 담아 온다. 돌려보낸 뒤 Azure 데이터 센터에서 디스크를 지운다(step 5 결과대로) |

  선명한 노드가 같아도 경로와 곁말이 다르므로 두 시나리오는 갈린다.
- 요점 테스트:
  - `import`에서 `ship-out`·`copy-out`이 보이지 않고, `export`에서 `copy-in`·`ship-in`이 보이지 않는다.
  - `import`의 경로는 `local-data`에서 `azure-storage`로 이어지고, `export`의 경로는 그 반대다.

위 도식 설계는 출발점이다. 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념(과 같은 주제의 다른 개념) 본문에 있어야 한다(ADR-036·038).

#### 표 `DataMoveOptionsTable`, JSON `tables["data-move-options"]`, 개념 `azure-data-movement.data-box`

`src/components/diagrams/azureDataMovementTables.tsx`(새 파일)에 함수, 테스트 `azureDataMovementTables.test.tsx`. 열 셋: `도구`(행 머리)·`옮기는 방식`·`알맞은 때`.

| 도구 | 옮기는 방식 | 알맞은 때 |
|---|---|---|
| AzCopy | 명령줄에서 복사, 한 방향 동기화 | 명령으로 파일을 옮기거나 작업을 자동으로 하고 싶을 때(사실은 step 5 결과대로) |
| Azure Storage Explorer | 내 컴퓨터의 앱 화면에서 관리 | 화면을 보며 파일을 올리고 내려받을 때 |
| Azure File Sync | Windows 파일 서버와 양방향으로 저절로 | 파일 서버를 계속 쓰면서 파일을 Azure Files에 모을 때 |
| Azure Migrate | 허브에서 평가하고 이전 | 온-프레미스의 서버·데이터베이스·웹 앱을 옮길 때 |
| Azure Data Box | 장치에 담아 배송 | 데이터가 크고 네트워크로 보내기 어려울 때 |

칸의 표현은 본문과 맞춘다. 칸의 사실은 이 주제 본문에 있어야 한다. 열 폭의 계산을 summary에 적는다. `sources`는 근거 문서.
registry에 `'azure-data-movement.azure-migrate': AzureMigrateDiagram`, `'azure-data-movement.data-box': [DataBoxDiagram, DataMoveOptionsTable]` 두 줄.

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식·표가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고치고, `grep -n '쓰일 곳' docs/source/azure/official.md`로 이 phase(step 0·5)가 남긴 「쓰일 곳」이 없는지 본다(개념이 생긴 줄은 모두 고친다. 근거 기록이라 그대로 두는 줄이 있으면 summary에 적는다).

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 105개, 마지막 id는 `az105`, 주제 `azure-data-movement`의 개념은 5개(주제 완성)다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. **이 주제 전체를 처음부터 끝까지 통독한다** — 개념 10~14와 도식·표의 글. 풀이 없이 처음 나오는 낱말, 진행 안내 문장을 찾아 자기 개념에 있으면 고치고, 앞 개념에 있으면 summary에 적는다.
3. 용량 수치가 글·문항·해설·표에 없는지 `grep`으로 본다(`80`, `120`, `525`, `TB`, `테라바이트`).
4. `phases/104-azure-storage-migration/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **Data Box 용량 수치, 지우는 표준의 이름(NIST), Data Box Heavy 같은 지원 종료 제품을 쓰지 마라.** 이유: guide.md 「배경」.
- **Azure Migrate의 ISV 도구를 쓰지 마라.** 이유: guide.md 「배경」.
- **앞 step이 쓴 글·문항·도식을 고치지 마라.** 이유: guide.md 「모든 step의 공통 금지」. 고칠 것을 찾으면 summary에 적는다.
