# phase 104 검증 보고

확인한 날: 2026-11-01(Mac). 브랜치 `feat-104-azure-storage-migration`(origin/develop `a4bb28d`에서 분기), 설계 커밋 `2304a6c`, phase 완료 커밋 `abebc4a`, 마무리 수정은 이 보고와 함께 커밋한다.
사용자 지시 「다음 작업 진행하자」에 따라 메인 세션이 설계해 바로 실행했다. 실행은 저장소 밖 `aws-quiz-p103-sup/`의 supervisor로 세 덩어리(step 0~2 / 3~4 / 5~7)를 돌렸다. codex가 기본이고, 사용량 한도면 같은 step을 Claude가 처음부터 다시 실행한다.

## step별 결과

| step | 맡은 쪽 | 끝난 때 | 결과 | 테스트 |
|---|---|---|---|---|
| 0 storage-sources | codex 한도 → Claude | 09:49 | `official.md` 새 항목 19, `corrections.md` D65~D72·G41~G43 | 5545 |
| 1 services-blob-tiers | Claude | 10:02 | 개념 1·2·3, az086~az090, `AccessTierDiagram` — 주제 `azure-storage` 만듦 | 5568 |
| 2 rehydration-files | Claude 한도 → Claude | 12:01 | 개념 4·5, az091~az093, `ArchiveRehydrationDiagram`·`FileShareDiagram` | 5606 |
| 3 redundancy | codex 한도 → Claude | 12:15 | 개념 6·7, az094~az097, `LrsZrsDiagram`·`GeoRedundancyDiagram`·`RedundancyOptionsTable` | 5662 |
| 4 storage-accounts | Claude | 12:28 | 개념 8·9, az098~az100, `StorageAccountDiagram`·`StorageAccountTypesTable` — `azure-storage` 완성 | 5691 |
| 5 movement-sources | codex·Claude 한도 → Claude | 16:54 | `official.md` 새 항목 13, `corrections.md` D73·G44~G46 | 5691 |
| 6 file-tools | Claude | 17:05 | 개념 10·11·12, az101~az103, `FileSyncDiagram` — 주제 `azure-data-movement` 만듦 | 5712 |
| 7 migrate-data-box | Claude | 17:18 | 개념 13·14, az104·az105, `AzureMigrateDiagram`·`DataBoxDiagram`·`DataMoveOptionsTable` — `azure-data-movement` 완성 | 5758 |

결과: 주제 2개(`azure-storage` ★★☆, `azure-data-movement` 별점 없음 — 주제 지도와 같다), 개념 14개(9·5), 문항 20개(az086~az105), 도식 9개, 표 셋, 새 테스트 213개.
과목 전체는 주제 12개·개념 76개·문항 105개. 실행 전체는 11-01 09:26 ~ 17:18이고, 그중 약 5시간 45분은 두 쪽 모두 사용량 한도라 기다린 시간이다. 사용량 한도가 아닌 실패로 멈춘 step은 없다.

## 실행 중에 일어난 일

- **사용량 한도로 여섯 번 끊겼고 그때마다 그 step을 처음부터 다시 실행했다.** 끊긴 시도는 step 0(codex)·2(Claude)·3(codex)·5(codex·Claude·codex)다. 부분 변경은 커밋되지 않고 stash로 남았다.
- step 5의 codex 시도는 14:30에 시작해 12분 일한 뒤 다시 한도에 걸렸다. 그 시도가 받아 둔 공식 문서 사본은 다음 시도가 다시 받지 않고 읽었다(파일 머리의 URL이 허용한 출처인지 확인).
- 결과적으로 여덟 step 모두 Claude가 끝냈다. codex가 끝낸 step은 없다.

## 설계와 달라진 것

모두 step summary에 이유가 있고, 받아들였다.

- **계층과 중복성은 완전히 별개가 아니다**(step 0) — guide는 서로 다른 질문이라고만 했지만 보관 계층은 LRS·GRS·RA-GRS에서만 된다. `access-tiers`와 `storage-redundancy` 끝에 이 예외를 적었다.
- **표기**(step 0·5) — 「이름공간」→「네임스페이스」, Table의 「행과 속성」→「키와 특성」, `file-sync`의 name은 한국어판을 따라 「Azure 파일 동기화(Azure File Sync)」, 노드는 「Azure 파일 공유」·「Data Box 디바이스」·「스토리지 계정」.
- **「파일 공유는 스토리지 계정 안에 만든다」를 클래식 파일 공유로 한정했다**(step 0) — 새 방식(Microsoft.FileShares)은 계정 없이 NFS 공유만 만든다. NFS 클라이언트는 Learn의 Linux·macOS가 아니라 제품 문서의 Linux로 썼다.
- **프리미엄 페이지 Blob은 LRS**(step 0) — 계정 개요만 LRS·ZRS로 적고 Learn·Redundancy·Create account는 LRS라 다수·최신을 따랐다.
- **Azure Migrate와 Data Box**(step 5) — guide의 「데이터를 옮기는 서비스가 아니라」는 쓰지 않았다. Data Box가 Azure Migrate 허브의 도구이기도 하다. 「평가하고 묶는 허브 / 큰 데이터를 장치로 옮기는 서비스」로 가르고, az104는 서버의 평가를 조건으로 주었다.
- **AzCopy와 File Sync 문구**(step 5) — 「다른 클라우드와 오간다」는 「다른 클라우드의 저장소에서 Azure로」로, Storage Explorer의 「모든 작업을 AzCopy로」는 「대부분의 전송」으로, 「같은 데이터 센터의 새 서버」는 「새 Windows Server」로, File Sync는 「곧바로」가 아니라고 썼다.
- **곁말** — 「오프라인 — 읽을 수 없다」→「데이터를 읽을 수 없다」(메타데이터는 읽힌다), 「같은 드라이브로 탑재」→「같은 파일 공유를 탑재」, 관리 디스크의 「스토리지 계정 없이 쓴다」→「계정을 직접 만들지 않는다」, 「나머지 파일」→「나머지 파일의 내용」(이름과 폴더 구조는 서버에 남는다).
- **표의 `sources`는 개념 id다** — step 문서는 근거 문서라 했으나 `visuals.test.ts`가 개념 id를 요구한다. 근거 문서는 `official.md`에 있다.

## 사용자가 볼 것

8개 step 모두 「사용자 확인」은 「없음」이다.

- **덤프 답이 공식 문서와 달라 고쳐 쓴 것**(`corrections.md` D65~D73) — 보관 계층을 AzCopy로 언제든 읽는다는 답(D65), 보관 계층을 계정 수준에서 정한다는 답(D66), 프리미엄 블록 Blob이 LRS만이라는 답(D67), 구독이나 지역이 다르면 계정 이름이 같아도 된다는 답(D68), 온-프레미스 동기화를 Queue Storage로 답한 문항(D69), 복사본·자동 백업·2TB(D70), 파일 공유는 계정 키로만 닿는다는 해설(D71), VM 데이터 디스크를 Blob으로 답한 문항(D72), Storage Explorer·File Sync(D73).
- **용어집이 공식 문서와 달라 고쳐 쓴 것**(G41~G46) — 액세스 계층을 셋으로 든 것(G41), 서비스 목록과 Table의 뜻(G42), LRS를 「지역 내 3중 복제」로 적은 것(G43), AzCopy·Storage Explorer 범위(G44), Azure Migrate(G45), Data Box의 내보내기 방향(G46).
- **쓰지 않은 것** — 내구성(9의 개수)·RPO·SLA·용량 수치, Data Box 용량(Learn 80TB와 제품 개요 120·525TB가 갈린다), Data Lake Gen2, 옛 계정 유형, 수명 주기 정책, 스마트 계층, 장애 조치의 종류, 옛 이름 Server Assessment·Server Migration.
- **복사본 수 여섯은 계산값이다** — GRS·GZRS의 「모두 여섯」은 문서에 낱말로 없고 주 지역 셋 + 보조 지역 셋이다. 덤프 NO.297의 6과 같다.

## 메인 세션이 마무리에서 고친 것

새 문항 20개와 개념 14개를 메인 세션이 직접 읽고 고쳤다. 정답 방향·사실·균형은 그대로다. 문항 20개 가운데 답을 흘리는 꼴(guide 「문항」 11항)은 찾지 못했다.

- **az100** — 「SMB와 NFS를 모두 쓰려고, SMB 파일 공유와 NFS 파일 공유를 … 함께 두려 합니다. 이때 …」가 한 문장에 같은 말을 되풀이해, 「SMB와 NFS를 모두 씁니다. SMB 파일 공유와 NFS 파일 공유를 … 함께 두려면 … 고르면 되나요?」로.
- **`geo-redundancy`** — 「보고서를 만드는 읽는 앱이」가 어색해 「보고서에 쓸 데이터를 읽는 앱이」로. 처음에는 「보고서를 만드는 앱이」로 고쳤다가, 도식 노드 「읽는 앱」이 본문에 있어야 한다는 `GeoRedundancyDiagram` 테스트가 실패해 이 문구로 다시 썼다. 테스트는 고치지 않았다.
- **`azure-files`** — step 5가 정한 이름에 맞춰 「Azure File Sync라는 도구」를 「Azure 파일 동기화(Azure File Sync)라는 도구」로.
- **`access-tiers`** — step 4가 적어 둔 것. 끝 문단의 「한 지역」은 풀이가 뒤 개념에 있어, 가용성 영역의 풀이를 「Azure 데이터 센터가 있는 지리적 구역인 지역 안에서 전원과 네트워크가 따로인 곳」으로 고쳤다.

## 남겨 둔 것

- **`StorageAccountTypesTable`의 「RA-GRS」·「RA-GZRS」가 폭에 따라 하이픈에서 줄이 바뀐다.** 폭 305에서 「RA-/GZRS」, 320에서 「RA-/GRS,」이고 412 같은 다른 폭에서도 생긴다(390·1180은 한 줄). 하이픈은 브라우저가 줄을 바꾸는 자리이고, UI_GUIDE가 막는 낱말 중간 끊김(`break-anywhere`)은 아니며 읽는 데 지장이 없다. 열 폭 네 가지와 옵션 순서 세 가지를 폭 288~430에서 재 봤지만 모든 폭에서 없어지는 조합은 없었다(`p104-run/sweep.cjs`). 줄바꿈 없는 하이픈(U+2011)이면 없앨 수 있지만, 눈에 보이지 않게 다른 글자를 데이터에 넣는 선례가 없고 옆 표의 같은 이름과 글자가 달라져 넣지 않았다.
- `git stash`에 이 phase의 한도 중단 초안 6개가 남아 있다(`p34-usage-limit … step0·2·3·5·5·5`). 쓰이지 않는 것이고, 지우는 것은 사용자 판단으로 둔다.
- `official.md` 3102줄의 「쓰일 곳: D70(근거 기록)」은 근거 기록이라 그대로 둔다.

## 다시 돌린 검증 (마무리 수정 뒤)

실행 부하가 없을 때 마무리 수정한 내용으로 다시 돌렸다. supervisor도 step마다 같은 검증을 돌려 모두 통과했다.

- `npm run build` 통과, `npm run lint` 경고 0, `npm test` 255파일·5758개 통과(phase 시작 244파일·5545개).
- `check-structure` 「구조 이상 없음」.
- 교차 검사 「✓ 교차 없음 — 세로 노드 1140개·경로 779개, 가로 노드 1140개·경로 779개」(phase 시작 1103/757에서 +37/+22).
- `check-verbatim --subject azure` 「전사 이상 없음 — azure: 원본 395개, 단위 724개」(phase 시작 원본 319개·단위 584개).
- 문항 105개(az001~az105), 예 26·아니요 27, 정답 위치 13/13/13/13. 해설 187자 이상 등 문항 규칙은 `data.test.ts`가 본다.
- AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `a4bb28d`와 diff 없음.

## 화면 확인 (headless Chrome + CDP, 개발 서버 `127.0.0.1:5300`)

phase 103의 측정기를 주제만 바꿔 썼다(저장소 밖 `p104-run/measure-p104.cjs`). 폭 305·320·390(배율 2, 모바일)과 1180(배율 1).

- **넘침** — 네 폭에서 두 주제 모두 페이지 가로 넘침 0. 모든 시나리오 버튼을 누른 뒤에도 0.
- **도식 9개의 모든 시나리오**(폭마다 31개 상태 — `azure-storage` 21, `azure-data-movement` 10)를 하나씩 눌러 보이는 SVG 글자를 화면 픽셀로 쟀다. SVG 밖으로 나간 글자, 노드 라벨이 자기 상자보다 넓은 곳, 글자끼리 겹친 곳, 곁말이 노드 상자에 겹친 곳, 그룹 박스 테두리에 걸친 곳 모두 0.
- **표 셋** — 표 넘침 0. 낱말 끊김은 위 「남겨 둔 것」의 한 칸뿐이다(폭 305·320에서 각 1건). 나머지 표는 없다.
- **측정기 자가 시험** — 곁말을 SVG 밖으로, 라벨을 길게, 표 칸에 긴 낱말을 넣으면 폭 320에서 16건을 잡는다(`azure-storage` 10, `azure-data-movement` 6). 첫 실측의 폭 305 `azure-storage`는 첫 페이지가 다 뜨기 전에 재서 도식 0개로 나왔고, 그 폭만 다시 재서 도식 6개·표 2개를 확인했다.
- **과목 화면** — 과목 목록(`#/`)에 「Azure AZ-900 · 주제 12개 · 문항 105개」, 주제 목록(`#/azure`), 두 주제의 확인 문제(15·5문항)·랜덤(전체 105문항)·검색·복습 화면이 320·1180에서 넘침 0. 답을 누르면 해설이 뜬다. 콘솔 오류 없음.
- 캡처해서 눈으로 본 것: `LrsZrsDiagram`(320·1180 데이터 센터가 멈출 때), `GeoRedundancyDiagram`(390·1180 장애 조치 전에 읽기), `StorageAccountDiagram`(320·1180 주소, 320 계정 밖), `FileShareDiagram`(390 사무실과 Azure에서), `ArchiveRehydrationDiagram`(390 옮긴 뒤 읽을 때), `FileSyncDiagram`(390·1180 클라우드 계층화), `AzureMigrateDiagram`(390 그다음 이전), `DataBoxDiagram`(1180 가져오기, 390 내보내기), 표 `StorageAccountTypesTable`·`DataMoveOptionsTable`(320). 곁말이 대상과 떨어져 읽히는 곳은 없다. 캡처 일부에 앱 머리글이 겹친 것은 `scrollIntoView`로 찍을 때 고정 머리글이 함께 찍힌 것이고 화면 결함이 아니다.
