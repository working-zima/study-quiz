# Step 3: redundancy

## 배경

phase 104의 전체 계획·결정·공통 규칙은 `phases/104-azure-storage-migration/guide.md`에 있다.
**이 step은 주제 `azure-storage`에 개념 6(스토리지 중복성)·7(보조 지역으로 복제)의 글·문항과 도식 `LrsZrsDiagram`·`GeoRedundancyDiagram`, 표 `RedundancyOptionsTable`을 더한다.**

## 읽어야 할 파일

- **`phases/104-azure-storage-migration/guide.md` 전체**
- `phases/104-azure-storage-migration/index.json`의 step 0·2 `summary` — 복사본 수, 「복제는 백업이 아니다」를 쓸 수 있는지, 표기
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**
- `docs/UI_GUIDE.md`의 「도식」 절과 비교표의 규칙
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/components/diagrams/CLAUDE.md`, `src/data/azure/topics.json`의 `azure-storage` 앞 개념
- 도식 선례 — `src/components/diagrams/ZoneIsolationDiagram.tsx`(가용성 영역, 멈춘 상태), `RegionPairDiagram.tsx`(지역 둘 사이의 복제)와 각 `.test.tsx`, 표 선례 `azureComputeTables.tsx`와 `.test.tsx`

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-storage` 끝에 덧붙인다

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 6 | `azure-storage.storage-redundancy` | 스토리지 중복성 | — | 첫 문단은 **복사본을 왜 여러 개 두는가**. **중복성**·**지역**·**주 지역**·**데이터 센터**·**서버 랙**·**가용성 영역**·**동기**를 푼다. 복사본 수와 **위치**를 가른다 — 언제나 셋이고 위치가 다르다. **LRS와 ZRS를 「무엇이 멈출 때 무엇이 남는가」로** 견준다. 액세스 계층과 다른 질문이라는 것을 한 줄로(4절). 「복제는 백업이 아니다」는 step 0이 쓸 수 있다고 한 말로만. **도식의 예를 본문에 쓴다** |
| 7 | `azure-storage.geo-redundancy` | 보조 지역으로 복제 | `storage-redundancy` | **보조 지역**·**지역 쌍**·**비동기**·**장애 조치**를 푼다. GRS와 GZRS는 **주 지역 안에서 어떻게 두느냐**로 갈린다. RA- 접두사는 **장애 조치 전에도 보조 지역을 읽는다**는 뜻이라는 것을 하나의 규칙으로 쓴다(옵션을 여섯으로 외우지 않게). 읽은 데이터가 최신이 아닐 수 있다는 것까지. **도식의 예를 본문에 쓴다**. 끝 문단은 표로 이어지는 문장이 아니라 고르는 기준(어디까지의 장애를 견딜 것인가, 비용) |

### 2. 문항 — `az094`~`az097`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az094` | `storage-redundancy` | 4지선다 「상황 적용」 — 데이터 센터 한 곳이 멈춰도 읽고 쓸 수 있어야 하고, 규정 때문에 **복사본은 같은 지역 안에만** 두어야 하는 상황. 정답 ZRS. 오답 LRS·GRS·GZRS — 조건이 다른 곳으로 가는 옵션을 가른다. 보기는 네 옵션의 이름과 같은 꼴의 짧은 풀이 또는 이름만. 문제문에 「영역」을 쓰지 않는다 |
| `az095` | `storage-redundancy` | 예/아니요 — 예가 되는 주장: LRS로 저장하면 복사본 셋이 데이터 센터 한 곳 안에 있는가. 해설은 그래서 무엇을 막고 무엇을 못 막는지를 가르친다. 「겨우」 같은 말로 답을 흘리지 않는다. `az042`와 같은 것을 묻지 않는다 |
| `az096` | `geo-redundancy` | 4지선다 「상황 적용」 — 지역 전체가 멈출 때를 대비하고, **평소에도** 보조 지역의 데이터를 읽어 보고서를 만드는 상황(장애 조치 없이). 정답 RA-GRS(또는 RA-GZRS — 보기 넷 안에 정답이 하나가 되게 고른다). 오답 같은 범주. 조건에 맞는 옵션이 둘이 되지 않게 보기를 고른다 |
| `az097` | `geo-redundancy` | 예/아니요 「흔한 오해」 — 아니요가 되는 주장: GRS를 고르면 평소에도 보조 지역의 복사본을 읽을 수 있는가. 해설은 장애 조치와 RA-GRS를 가르친다 |

### 3. 도식 — `src/data/azure/visuals/azure-storage.json`에 더한다

#### `azure-storage.storage-redundancy` — `LrsZrsDiagram`, JSON 키 `lrs-zrs`

- 물음형 제목 예: `복사본 셋을 어디에 두면 무엇을 견딜까?`
- 그릴 것: 그룹 박스 `lrs-datacenter`(「LRS — 데이터 센터 한 곳」) 안에 노드 `lrs-1`·`lrs-2`·`lrs-3`(「복사본 1」~「복사본 3」). 그룹 박스 `zrs-region`(「ZRS — 가용성 영역 셋」) 안에 그룹 박스 `zone-1`·`zone-2`·`zone-3`(「영역 1」~「영역 3」), 각 영역 안에 노드 `zrs-1`·`zrs-2`·`zrs-3`(「복사본 1」~「복사본 3」). 경로는 없다(guide.md 「경로가 없는 도식」).
  세로형(폭 280)은 두 큰 박스를 위아래로 쌓는다. 안쪽 박스 셋이 나란히 들지 않으면 노드 폭과 간격을 계산해 summary에 적는다 — 라벨을 줄이지 않는다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `compare` | 복사본의 위치 | `lrs-1`·`lrs-2`·`lrs-3`·`zrs-1`·`zrs-2`·`zrs-3` | 「데이터 센터 한 곳에 셋」, 「영역마다 하나」 | 복사본은 어느 쪽이든 셋이다. 다른 것은 그 셋을 두는 곳이다 |
  | `datacenter-down` | 데이터 센터가 멈출 때 | `zrs-2`·`zrs-3` | `lrs-datacenter` 안 「데이터 센터가 멈추면 복사본 셋 모두 닿지 않는다」, `zone-1` 곁 「이 영역이 멈춤」, 「나머지 영역으로 읽고 쓴다」 | LRS는 데이터 센터가 통째로 멈추면 복사본을 모두 잃을 수 있지만, ZRS는 영역 하나가 멈춰도 나머지 복사본으로 계속 읽고 쓴다 |

  노드 색은 그대로이고 멈춘 상태는 곁말과 흐림으로 보인다(guide.md 「색」). `전체`와 `compare`의 선명한 노드가 같아도 곁말이 다르므로 괜찮다.
- 요점 테스트:
  - `lrs-1`~`lrs-3`의 상자가 `lrs-datacenter` 안, `zrs-N`이 각각 `zone-N` 안, `zone-N`이 `zrs-region` 안이다(세로형·가로형 모두).
  - `datacenter-down`에서 `lrs-1`~`lrs-3`과 `zrs-1`이 opacity `0.25`, `zrs-2`·`zrs-3`이 선명하다.

#### `azure-storage.geo-redundancy` — `GeoRedundancyDiagram`, JSON 키 `geo-redundancy`

- 물음형 제목 예: `지역 전체가 멈출 때를 어떻게 대비할까?`
- 그릴 것: 그룹 박스 `primary`(「주 지역」) 안에 노드 `primary-lrs`(「데이터 센터 한 곳에 셋」)·`primary-zrs`(「영역 셋에 하나씩」). 그룹 박스 `secondary`(「보조 지역」) 안에 노드 `secondary-lrs`(「데이터 센터 한 곳에 셋」). 그룹 밖에 노드 `report-app`(「읽는 앱」). 경로 `replicate-grs`(`primary-lrs`→`secondary-lrs`), `replicate-gzrs`(`primary-zrs`→`secondary-lrs`), `read-secondary`(`report-app`→`secondary-lrs`).
  (`전체`에서는 노드 넷이 선명하고 시나리오 경로는 없다.)
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `grs` | GRS | `primary-lrs`·`secondary-lrs` | `replicate-grs` | 경로 옆 「비동기로 복제」 | 주 지역 데이터 센터 한 곳의 복사본 셋을 보조 지역의 복사본 셋으로 복제한다 — 모두 여섯 |
  | `gzrs` | GZRS | `primary-zrs`·`secondary-lrs` | `replicate-gzrs` | 경로 옆 「비동기로 복제」 | 주 지역에서는 영역 셋에 나눠 두고, 보조 지역으로 복제한다(복사본 수를 쓰려면 step 0 결과대로) |
  | `read-access` | 장애 조치 전에 읽기 | `report-app`·`primary-lrs`·`secondary-lrs` | `replicate-grs`·`read-secondary` | `secondary-lrs` 옆 「최신이 아닐 수 있다」 | RA-GRS는 장애 조치 전에도 보조 지역을 읽게 한다. 복제가 비동기라 읽는 값이 최신이 아닐 수 있다 |

- 요점 테스트:
  - `primary-lrs`·`primary-zrs`가 `primary` 그룹 안, `secondary-lrs`가 `secondary` 그룹 안이고 `report-app`은 두 그룹 밖이다(세로형·가로형 모두).
  - `grs`에서 `primary-zrs`, `gzrs`에서 `primary-lrs`가 opacity `0.25`다.
  - `read-secondary`는 `read-access`에서만 보인다.

위 도식 설계는 출발점이다. 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038).

#### 표 `RedundancyOptionsTable`, JSON `tables["redundancy-options"]`, 개념 `azure-storage.geo-redundancy`

`src/components/diagrams/azureStorageTables.tsx`(새 파일)에 함수, 테스트 `azureStorageTables.test.tsx`. 열 셋: `옵션`(행 머리)·`주 지역`·`보조 지역`.

| 옵션 | 주 지역 | 보조 지역 |
|---|---|---|
| LRS | 데이터 센터 한 곳에 복사본 셋 | 복제하지 않음 |
| ZRS | 가용성 영역 셋에 하나씩 | 복제하지 않음 |
| GRS | 데이터 센터 한 곳에 복사본 셋 | 복사본 셋. 장애 조치 뒤에 읽음 |
| GZRS | 가용성 영역 셋에 하나씩 | 복사본 셋. 장애 조치 뒤에 읽음 |
| RA-GRS | GRS와 같음 | 복사본 셋. 장애 조치 전에도 읽음 |
| RA-GZRS | GZRS와 같음 | 복사본 셋. 장애 조치 전에도 읽음 |

칸의 표현은 본문과 맞춘다. 칸의 사실은 개념 6·7 본문에 있어야 한다. 열 폭은 guide.md 「표」의 계산을 summary에 적는다. `sources`는 근거 문서.
registry에 `'azure-storage.storage-redundancy': LrsZrsDiagram` 한 줄과 `'azure-storage.geo-redundancy': [GeoRedundancyDiagram, RedundancyOptionsTable]` 한 줄(한 개념에 도식과 표를 함께 붙일 때는 배열로 쓴다 — 선례 `'network-basics.packet-loss'`).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식·표가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 97개, 마지막 id는 `az097`, 주제 `azure-storage`의 개념은 7개다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `geo-redundancy`의 `parentId`가 `azure-storage.storage-redundancy`인지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 내구성 수치·RPO 분이 글·문항·해설·표에 없는지 `grep`으로 본다(`99.`, `9가`, `15분`).
4. `phases/104-azure-storage-migration/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 8·9(스토리지 계정, 계정 유형)를 만들지 마라.** 이유: step 4의 범위다. 스토리지 계정의 뜻은 앞 개념이 풀었으면 되짚는다.
- **내구성·RPO·SLA 수치를 쓰지 마라.** 이유: guide.md 「배경」.
- **지역 쌍·가용성 영역을 주 내용으로 다시 가르치지 마라.** 이유: `azure-regions-zones`의 몫이다. 이 주제에서 한 줄로만 푼다.
