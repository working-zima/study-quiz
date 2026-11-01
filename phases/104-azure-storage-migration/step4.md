# Step 4: storage-accounts

## 배경

phase 104의 전체 계획·결정·공통 규칙은 `phases/104-azure-storage-migration/guide.md`에 있다.
**이 step은 주제 `azure-storage`에 개념 8(스토리지 계정)·9(스토리지 계정 유형)의 글·문항과 도식 `StorageAccountDiagram`, 표 `StorageAccountTypesTable`을 더해 주제를 마친다.**

## 읽어야 할 파일

- **`phases/104-azure-storage-migration/guide.md` 전체**
- `phases/104-azure-storage-migration/index.json`의 step 0·3 `summary` — 계정 유형 넷의 확정 이름과 칸, 관리 디스크와 스토리지 계정에 관한 앞 phase 확인
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**(백틱), **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**
- `docs/UI_GUIDE.md`의 「도식」 절과 비교표의 규칙
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/components/diagrams/CLAUDE.md`, `src/data/azure/topics.json`의 `azure-storage` 앞 개념
- 도식 선례 — `src/components/diagrams/ResourceGroupScopeDiagram.tsx`(그룹 안과 밖), `src/components/diagrams/azureStorageTables.tsx`(step 3)와 각 `.test.tsx`

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-storage` 끝에 덧붙인다

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 8 | `azure-storage.storage-accounts` | 스토리지 계정 | — | 앞 개념들이 한 줄로 푼 스토리지 계정을 여기서 세운다. **이름공간**·**엔드포인트**·**구독**을 푼다. 이름 규칙은 **왜 전역에서 유일한가**(이름이 주소가 되기 때문이다) — 예시 이름 하나를 본문에 정해(guide.md 「예시 값」) 그 이름의 Blob·Files 주소를 백틱으로 쓴다. 만들 때 지역과 중복성 옵션을 고른다 — 앞 개념을 되짚는다. **도식의 예를 본문에 쓴다** |
| 9 | `azure-storage.account-types` | 스토리지 계정 유형 | `storage-accounts` | 문단은 **유형이 무엇을 정하는가**와 표준과 프리미엄을 고르는 기준까지. 표의 칸을 문단으로 되풀이하지 않는다. **블록 Blob**·**페이지 Blob**·**트랜잭션**·**대기 시간**을 푼다. **표를 읽는 법을 문장으로 알리지 않는다** — 「아래 표」 같은 진행 안내를 쓰지 않는다 |

### 2. 문항 — `az098`~`az100`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az098` | `storage-accounts` | 예/아니요 「흔한 오해」 — 아니요가 되는 주장: 구독이 다르면 같은 이름의 스토리지 계정을 만들 수 있는가. 해설은 이름이 주소가 되므로 Azure 전체에서 하나뿐이라는 것을 가르친다 |
| `az099` | `storage-accounts` | 4지선다 「개념 확인」 — 이름 규칙(3~24자, 숫자·소문자만)에 맞는 이름을 고른다. 정답 하나. 오답은 대문자가 든 이름, 하이픈이 든 이름, 3자 미만이나 24자 초과 이름 — 실제 회사 이름을 쓰지 않는다. 또는 파일 공유를 어디에 만드는가 — 상황을 정해 고른다. 고른 쪽의 이유를 summary에 |
| `az100` | `account-types` | 예/아니요 — 예가 되는 주장: SMB와 NFS 파일 공유를 함께 지원하는 계정이 필요할 때 프리미엄 파일 공유 계정이 맞는가(step 0 결과대로). 해설은 유형이 서비스와 옵션을 정한다는 것을 가르친다. 균형을 보고 방향을 바꿔도 된다. NO.146의 사실(프리미엄 블록 Blob과 중복성)을 물어도 된다 — 덤프 답이 맞다고 step 0이 확인했을 때만 |

### 3. 도식 — `src/data/azure/visuals/azure-storage.json`에 더한다

#### `azure-storage.storage-accounts` — `StorageAccountDiagram`, JSON 키 `storage-account`

- 물음형 제목 예: `스토리지 계정 안에는 무엇이 있을까?`
- 그릴 것: 그룹 박스 `account`(라벨은 본문의 예시 이름을 쓴 「스토리지 계정」, 예시 이름은 곁말로) 안에 노드 `blob`(「Blob」)·`files`(「파일 공유」)·`queue`(「큐」)·`table`(「테이블」) — 표기는 step 0 결과대로. 그룹 밖에 노드 `managed-disk`(「관리 디스크」). 경로는 없다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `services` | 계정 안의 서비스 | `blob`·`files`·`queue`·`table` | 그룹 곁 「이름은 Azure 전체에서 하나뿐」 | 스토리지 계정 하나가 Blob·파일 공유·큐·테이블을 담고, 계정 이름이 이 데이터의 이름공간이 된다 |
  | `endpoint` | 주소 | `blob`·`files` | `blob` 곁과 `files` 곁에 본문의 주소 꼴(`예시이름.blob.core.windows.net` 꼴 — 예시 이름은 본문과 같다) | 계정 이름과 서비스가 합쳐져 서비스마다 다른 주소가 된다 |
  | `disk` | 계정 밖 | `managed-disk` | `managed-disk` 곁 「스토리지 계정 없이 쓴다」 | 관리 디스크는 스토리지 계정을 만들고 관리하지 않아도 쓴다(step 0이 가리킨 사실대로) |

  주소 곁말은 반각 문자가 많다 — guide.md 「글자 폭의 여유」의 1.15배로 재고, 280 폭에 들지 않으면 줄을 나누거나 예시 이름을 짧게 정한다.
- 요점 테스트:
  - `blob`·`files`·`queue`·`table`의 상자가 `account` 그룹 안이고, `managed-disk`의 상자는 그 밖이다(세로형·가로형 모두).
  - `endpoint`의 두 곁말이 본문에 있는 주소와 같고, 첫 부분의 계정 이름이 같다.
  - `disk`에서 네 서비스 노드가 opacity `0.25`다.

위 도식 설계는 출발점이다. 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038).

#### 표 `StorageAccountTypesTable`, JSON `tables["account-types"]`, 개념 `azure-storage.account-types`

`src/components/diagrams/azureStorageTables.tsx`에 함수를 더하고 테스트를 더한다. 열 셋: `유형`(행 머리)·`지원 서비스`·`중복성 옵션`. 행은 step 0이 확정한 넷, 칸은 step 0 결과대로(옵션 나열은 `LRS, ZRS`처럼 공백으로 끊는다).
유형 이름이 표의 긴 덩어리가 되면 열 폭을 먼저 잡는다 — 320 폭의 계산을 summary에 적는다. 칸의 사실은 개념 8·9 본문에 있어야 한다 — 그러니 표에 쓴 이름은 본문에 쓴다.
registry에 `'azure-storage.storage-accounts': StorageAccountDiagram`, `'azure-storage.account-types': StorageAccountTypesTable` 두 줄.

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식·표가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 100개, 마지막 id는 `az100`, 주제 `azure-storage`의 개념은 9개(주제 완성)다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `account-types`의 `parentId`가 `azure-storage.storage-accounts`인지 본다.
3. **이 주제 전체를 처음부터 끝까지 통독한다** — 개념 1~9와 도식·표의 글. 풀이 없이 처음 나오는 낱말, 계층과 중복성이 섞인 문장, 진행 안내 문장을 찾아 자기 개념에 있으면 고치고, 앞 개념에 있으면 summary에 적는다.
4. `phases/104-azure-storage-migration/index.json`의 step 4를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **용량 한도(2TB, 5PB 등) 수치를 쓰지 마라.** 이유: guide.md 「배경」. 문항의 해설에도 쓰지 않는다.
- **옛 계정 유형(범용 v1, 레거시 Blob Storage)을 쓰지 마라.** 이유: guide.md 「배경」.
- **프라이빗 엔드포인트를 다시 쓰지 마라.** 이유: `azure-virtual-networking.endpoints`의 몫이다. 「엔드포인트」는 이 개념에서 서비스마다의 주소만 뜻한다.
- **주제 `azure-data-movement`를 만들지 마라.** 이유: step 6의 범위다.
