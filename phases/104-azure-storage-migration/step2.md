# Step 2: rehydration-files

## 배경

phase 104의 전체 계획·결정·공통 규칙은 `phases/104-azure-storage-migration/guide.md`에 있다.
**이 step은 주제 `azure-storage`에 개념 4(보관 계층 데이터 읽기)·5(Azure Files)의 글·문항과 도식 `ArchiveRehydrationDiagram`·`FileShareDiagram`을 더한다.**

## 읽어야 할 파일

- **`phases/104-azure-storage-migration/guide.md` 전체**
- `phases/104-azure-storage-migration/index.json`의 step 0·1 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**
- `docs/UI_GUIDE.md`의 「도식」 절 전체
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/components/diagrams/CLAUDE.md`, `src/data/azure/topics.json`의 `azure-storage` 앞 개념(같은 말을 되풀이하지 않고, 이미 푼 낱말을 다시 풀지 않는다)
- 도식 선례 — `src/components/diagrams/AccessTierDiagram.tsx`와 `.test.tsx`(step 1), `NsgAssociationDiagram.tsx`와 `.test.tsx`(시나리오마다 다른 노드·곁말), `src/data/azure/visuals/azure-storage.json`

## 작업

### 1. 개념 — `src/data/azure/topics.json`의 `azure-storage` 끝에 덧붙인다

| # | id | name(잠정) | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 4 | `azure-storage.archive-rehydration` | 보관 계층 데이터 읽기(리하이드레이션) | `blob-storage` | 「이름은 step 0 결과대로」. **왜 바로 못 읽는가**(오프라인)부터 쓴다. **리하이드레이션** 낱말을 한 줄로 푼다. 예는 직접 만든다 — 회사 B가 몇 년 전 기록을 감사 때 꺼내는 상황. **도식의 예를 본문에 쓴다** — 앱이 바로 읽으려 할 때와 온라인 계층으로 옮긴 뒤. `ParentId`는 `blob-storage`다(ADR-041 — 부모는 머리 개념이다. `access-tiers`가 아니다) — 배치는 `access-tiers` 바로 뒤. 앞 개념의 계층 설명을 되풀이하지 않고 「앞 개념의 보관 계층」으로 되짚는다 |
| 5 | `azure-storage.azure-files` | Azure Files | — | **파일 공유**·**프로토콜**·**SMB**·**NFS**·**탑재**·**온-프레미스**·**스토리지 계정**을 푼다. **도식의 예를 본문에 쓴다** — 회사 C의 사무실 컴퓨터 두 대(예시 값이라고 밝힌다)와 Azure의 VM 1이 같은 파일 공유를 탑재. Blob과 **쓰는 방식**(드라이브처럼 탑재 / URL로 객체를 다룸)으로 갈린다는 것을 4절대로 — Blob을 앞 개념으로 되짚는다 |

### 2. 문항 — `az091`~`az093`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `az091` | `archive-rehydration` | 4지선다 「원인과 결과」 또는 「상황 적용」 — 보관 계층에 둔 Blob을 지금 앱이 읽어야 한다. 먼저 할 일을 고른다. 정답은 온라인 계층으로 옮기는 것. 오답은 같은 범주(데이터를 꺼내려 할 때 생각나는 조치)에서 — **덤프의 보기(AzCopy·Azure Backup)를 그대로 옮기지 않고**, 계정 기본 계층을 바꾸는 것(Blob마다 정한 계층은 그대로 — 사실은 step 0 결과대로)·중복성 옵션을 바꾸는 것처럼 실제로 헷갈리는 것을 고른다. 정답의 이름(「리하이드레이션」)을 문제문에 쓰지 않는다 |
| `az092` | `azure-files` | 4지선다 「상황 적용」 — 여러 대의 컴퓨터가 같은 폴더를 드라이브처럼 연결해 쓰는 상황. 정답 Azure Files. 오답은 Blob Storage·Queue Storage·Disk Storage. 정답 낱말(파일 공유)을 문제문에 그대로 쓰지 않고 「같은 폴더」처럼 쓴다. VM 데이터 디스크와 갈리는 조건(여러 대가 동시에)을 준다 |
| `az093` | `azure-files` | 예/아니요 — 예가 되는 주장: Azure Files의 파일 공유는 클라우드의 컴퓨터뿐 아니라 온-프레미스의 컴퓨터에서도 탑재할 수 있는가. 해설은 탑재와 SMB·NFS를 가르친다. 균형을 보고 방향을 바꿔도 된다 |

### 3. 도식 — `src/data/azure/visuals/azure-storage.json`에 더한다

#### `azure-storage.archive-rehydration` — `ArchiveRehydrationDiagram`, JSON 키 `archive-rehydration`

- 물음형 제목 예: `보관 계층의 Blob을 왜 바로 읽을 수 없을까?`
- 그릴 것: 노드 `app`(「앱」), `archive-blob`(「보관 계층의 Blob」), `online-blob`(「온라인 계층의 Blob」). 그룹 박스는 없어도 된다. 경로 `read-archive`(`app`→`archive-blob`), `rehydrate`(`archive-blob`→`online-blob`), `read-online`(`app`→`online-blob`). 세로형은 `app`을 위에, 두 Blob 노드를 그 아래에 둔다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `read-now` | 바로 읽을 때 | `app`·`archive-blob` | `read-archive` | `archive-blob` 옆 「오프라인 — 읽을 수 없다」 | 보관 계층은 오프라인이라 앱이 그 Blob을 바로 읽거나 고칠 수 없다 |
  | `rehydrate` | 옮긴 뒤 읽을 때 | 셋 모두 | `rehydrate`·`read-online` | `rehydrate` 옆 「리하이드레이션」(step 0 표기), 걸리는 시간을 쓰기로 했으면 그 값 | 먼저 온라인 계층으로 옮겨야 앱이 읽는다. 옮기는 데 시간이 걸리므로 바로 꺼낼 데이터에는 맞지 않는다 |

- 요점 테스트:
  - `read-now`에서 `online-blob`이 opacity `0.25`이고 경로 `read-online`이 보이지 않는다.
  - `rehydrate`에서 `read-archive`가 보이지 않고, `rehydrate`의 시작이 `archive-blob`, 끝이 `online-blob`이다.

#### `azure-storage.azure-files` — `FileShareDiagram`, JSON 키 `file-share`

- 물음형 제목 예: `여러 컴퓨터가 어떻게 같은 파일을 함께 쓸까?`
- 그릴 것: 그룹 박스 `on-premises`(「온-프레미스」) 안에 노드 `pc-1`(「컴퓨터 1」)·`pc-2`(「컴퓨터 2」), 그룹 박스 `azure`(「Azure」) 안에 노드 `vm-1`(「VM 1」)과 그룹 박스 `account`(「스토리지 계정」) 안의 노드 `share`(「파일 공유」). 그룹 안의 그룹은 guide.md 「그룹 박스 안의 그룹 박스」대로. 경로 `mount-1`(`pc-1`→`share`), `mount-2`(`pc-2`→`share`), `mount-vm`(`vm-1`→`share`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `office` | 사무실에서 | `pc-1`·`pc-2`·`share` | `mount-1`·`mount-2` | `share` 옆 「같은 드라이브로 탑재」 | 컴퓨터 두 대가 파일 공유 하나를 드라이브처럼 탑재해 같은 파일을 함께 쓴다 |
  | `hybrid` | 사무실과 Azure에서 | `pc-1`·`vm-1`·`share` | `mount-1`·`mount-vm` | `vm-1` 옆 「클라우드에서 탑재」, `pc-1` 옆 「온-프레미스에서 탑재」 | 온-프레미스의 컴퓨터와 Azure의 VM이 같은 파일 공유를 동시에 탑재한다 |

- 요점 테스트:
  - `share`의 상자가 `account` 그룹 안, `account` 그룹이 `azure` 그룹 안이고, `pc-1`·`pc-2`는 `on-premises` 그룹 안이다(세로형·가로형 모두).
  - 모든 경로의 끝은 `share`다.
  - `office`에서 `vm-1`이 `0.25`, `hybrid`에서 `pc-2`가 `0.25`다.

위 도식 설계는 출발점이다. 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038).

registry에 `'azure-storage.archive-rehydration': ArchiveRehydrationDiagram`, `'azure-storage.azure-files': FileShareDiagram` 두 줄(`azure-storage.access-tiers` 뒤).

### 4. `official.md`의 「쓰일 곳」

이 step의 개념 id와 도식이 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~7)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 93개, 마지막 id는 `az093`, 주제 `azure-storage`의 개념은 5개다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `archive-rehydration`의 `parentId`가 `azure-storage.blob-storage`이고 `access-tiers` 바로 뒤에 있는지, `azure-files`에 `parentId`가 없는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다.
4. `phases/104-azure-storage-migration/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 6~9(중복성, 스토리지 계정)를 만들지 마라.** 이유: step 3·4의 범위다. 스토리지 계정은 이 step에서 한 줄 풀이로 그친다.
- **Azure File Sync를 자세히 쓰지 마라.** 이유: 주제 `azure-data-movement`의 몫이다. 한 줄 풀이로 그친다.
- **`topics.json`의 앞 개념 줄을 고치지 마라.** 이유: guide.md 「모든 step의 공통 금지」. 고칠 것을 찾으면 summary에 적는다.
