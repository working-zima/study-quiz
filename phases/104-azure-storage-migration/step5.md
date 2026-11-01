# Step 5: movement-sources

## 배경

phase 104의 전체 계획과 결정은 `phases/104-azure-storage-migration/guide.md`에 있다.
step 6·7이 주제 `azure-data-movement`의 개념 5개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고, 덤프·용어집이 공식 문서와 다른 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다.

이 주제의 중심 문제: **Learn 단원과 제품 문서의 차이.** 설계 때 본 예 — Data Box 장치 용량(Learn 단원 6은 80TB, 제품 개요는 120TB·525TB와 80TB의 단계적 중단). guide.md 「배경」이 용량 수치를 쓰지 않기로 정했다. 같은 식으로 어긋나는 다른 사실을 찾아 현행 쪽을 쓴다.

## 읽어야 할 파일

- `phases/104-azure-storage-migration/guide.md` — 특히 「배경」, 「두 주제와 개념 14개」의 `azure-data-movement` 표, 「한국어판에서 본 것」, 「출처」, 「출처 step(0·5)의 공통 형식」
- `phases/104-azure-storage-migration/index.json`의 step 0 `summary` — 표기와 마지막 D·G 번호
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞이 만든 형식을 따른다.** step 0이 쓴 항목을 먼저 읽는다
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `data-movement`인 줄(NO.240·324·413)과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다. 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/2-architecture-services.md`의 AzCopy / Azure Storage Explorer·Azure File Sync·Azure Migrate·Azure Data Box 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 Learn 단원 6·7과 `ko-` 판
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

공식 문서를 받는 법과 파일 이름은 step 0과 같다(guide.md 「출처」). 영문판(`en-us`)으로 사실을 확인하고, 한국어판(`ko-kr`)은 **용어 표기만** 본다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `azcopy` | AzCopy의 정의(명령줄 유틸리티), 할 수 있는 일(올리기·내려받기·계정 사이 복사·동기화), **동기화가 한 방향**이라는 것(시간 표시로 양쪽을 맞추지 않는다), 다른 클라우드 공급자와 쓸 수 있다는 것의 현행 범위. **명령줄**을 한 줄로 풀 근거. Files도 Blob과 같이 다루는지. 덤프 NO.240 | Learn 단원 7(받아 둠), 「Get started with AzCopy」 |
| b | `storage-explorer` | Storage Explorer의 정의(독립 실행형 앱, 화면), Windows·macOS·Linux, 안에서 AzCopy를 쓴다는 것, 할 수 있는 일. **NO.240**의 「클라우드에 있는 마이그레이션 서비스」가 틀렸다는 것을 그림의 답까지 본다 | Learn 단원 7, 「Get started with Storage Explorer」 |
| c | `file-sync` | File Sync의 정의, 양방향 동기화, Windows 서버에 설치, 서버에서 쓸 수 있는 프로토콜(Learn은 SMB·NFS·FTPS), 캐시를 여럿, 서버 교체, **클라우드 계층화**(블롭 액세스 계층과 다른 말이라는 것의 근거). **NO.352·413**: 온-프레미스와 맞추는 상대가 파일 공유인지 — 그림의 답까지 본다(NO.352는 step 0 결과를 본다). 맞춰지는 상대가 Azure Files만인지 현행 문서로. 표기(「Azure File Sync」/「Azure 파일 동기화」) | Learn 단원 7, 「What is Azure File Sync?」 |
| d | `azure-migrate` | Azure Migrate의 정의(허브), 도구(검색 및 평가, 서버 마이그레이션 — 현행 이름), 통합된 범위(서버·데이터베이스·웹 앱 — 현행 문서의 말로), Learn의 「실시간(real-time)」 표현이 현행 문서와 맞는지. Data Box와의 차이의 근거 | Learn 단원 6(받아 둠), 「Azure Migrate overview」 |
| e | `data-box` | Data Box의 정의(물리 장치로 옮기는 서비스), 쓰임, 흐름(포털에서 주문, 배송 업체, 로컬 웹 UI로 설정해 네트워크에 연결, 복사, 반송, 저절로 업로드), **내보내기의 흐름**, 끝난 뒤 디스크를 지우는 것(표준 이름은 쓰지 않는다). 용량 수치는 어긋난다는 처리만 남기고 쓰지 않는다. 언제 맞는가(네트워크 조건 — 문서의 말로). 덤프 NO.324 | Learn 단원 6, 「What is Azure Data Box?」 |
| f | 도식·표 | `FileSyncDiagram`·`AzureMigrateDiagram`·`DataBoxDiagram`과 표 `DataMoveOptionsTable`의 라벨·곁말·캡션·칸의 사실마다 근거가 있는지(step 6·7 문서의 설계를 읽는다) | a~e의 결과 |

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·5)의 공통 형식」대로. Learn 단원 6·7은 새 항목(「(phase 104) Learn 「Describe Azure storage services」 — 6 …」 꼴), 제품 문서도 새 항목으로. 끝에 「한국어 표기 정리 — `azure-data-movement`」 항목.

### 3. `docs/source/azure/corrections.md`에 더한다

step 0의 마지막 번호 다음부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.240** — Storage Explorer의 정체, File Sync의 동기화 대상.
- **NO.413** — File Sync의 상대가 Data Lake 컨테이너인지.
- 용어집 「AzCopy / Azure Storage Explorer」(업로드/다운로드 도구로만 적는 곳), 「Azure Data Box」의 낡은 용량 수치·옛 제품(Data Box Heavy 등 지원 종료 — 현행 문서로) 주장.

### 4. summary — 뒤 step이 이것을 보고 쓴다

개념 5개마다 한 줄씩: **확정한 `name`, 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**. 위 표의 a~f마다 결과와 근거 문서.
특히 (1) File Sync의 상대와 프로토콜의 현행 표현, (2) Azure Migrate의 도구 이름과 범위, (3) Data Box 내보내기의 흐름, (4) 도식 셋과 표에 쓸 수 있는 사실과 이름. 받은 파일 목록. 마지막 D·G 번호. 끝에 「사용자 확인」 칸(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·5)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다.
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/104-azure-storage-migration/index.json`의 step 5를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.**
- **Data Box 용량을 가르칠 사실로 적지 마라.** 이유: guide.md 「배경」. 어긋난다는 처리만 남긴다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라. `topic-map.md`·`dump-topics.tsv`를 고치지 마라.**
