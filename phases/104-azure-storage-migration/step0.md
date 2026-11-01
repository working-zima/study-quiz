# Step 0: storage-sources

## 배경

phase 104는 Azure AZ-900 과목에 주제 둘(11 스토리지, 12 데이터 이동과 마이그레이션)을 더한다. 전체 계획과 결정은 `phases/104-azure-storage-migration/guide.md`에 있다.
step 1~4가 주제 `azure-storage`의 개념 9개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고,
덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다. 두 문서의 형식은 앞 phase가 만든 것을 그대로 따른다.

이 주제의 중심 문제는 둘이다.
(1) **덤프가 낡았거나 덤프끼리 답이 갈리는 문항** — 설계 때 본 예: NO.354는 보관 계층의 데이터를 AzCopy로 언제든 읽을 수 있다는 쪽(답 A)을 표시하지만, 같은 사실을 묻는 NO.66·148·435는 리하이드레이션 쪽으로 보인다. NO.50·190·438은 콜드 계층이 없던 때의 말이고, NO.294·307은 용량 한도를 묻는다.
(2) **Learn 단원과 제품 문서의 차이** — 설계 때 본 예: Learn 단원 4는 계정 수준 설정을 「핫·쿨·콜드」로 적는다. 제품 문서 「Access tiers」로 현행 표현을 확인한다. 계정의 「기본 액세스 계층」과 Blob마다의 계층을 가른다.

## 읽어야 할 파일

- `phases/104-azure-storage-migration/guide.md` — 특히 「배경」(앞 주제가 이미 쓴 것, 쓰지 않는 수치), 「두 주제와 개념 14개」의 `azure-storage` 표, 「한국어판에서 본 것」, 「예시 값」, 「출처」, 「출처 step(0·5)의 공통 형식」
- `docs/source/azure/CLAUDE.md` — 원본 셋, 허용하는 출처, 가리키는 표기, 덤프의 그림을 보는 법. **이 규칙을 따른다**
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — **앞 phase가 만든 형식을 따른다.** 이미 있는 항목 「(phase 100) Learn 「Describe Azure storage services」 — 4 …」, 지역 쌍·영역 중복을 말하는 항목들, 앞 phase의 NO.306·487 처리(`grep -n 'NO.306\|NO.487' docs/source/azure/corrections.md`), 「한국어 표기 정리」 항목들을 먼저 읽는다
- `phases/103-azure-compute-networking/verification.md`의 「설계와 달라진 것」 — 출처 step이 현행 문서로 바꾼 방식
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `storage-services`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다
  (설계 때 본 것: NO.50·66·108·146·148·158·161·190·199·231·242·294·297·306·307·352·354·412·435·438·477·487·495·504·506, 비용 쪽 NO.12·436은 `azure-cost-factors`의 몫이라 보지 않는다). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/2-architecture-services.md`의 Azure Storage·스토리지 계층·스토리지 계정·중복성 항목 — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/`의 받아 둔 문서 — guide.md 「출처」의 스토리지 목록
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

공식 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 받아 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다. `CERTIFICATE_VERIFY_FAILED`면 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`).
이름은 `learn-<모듈>-<단원>.md`(Learn 단원), `docs-<서비스>-<쪽>.md`(제품 문서), 한국어판은 앞에 `ko-`를 붙인다.
영문판(`en-us`)으로 사실을 확인하고, 한국어판(`ko-kr`)은 **용어 표기만** 본다. 어디서 찾아봤는지 summary에 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `storage-services` | 서비스 다섯(Blob·Files·Queue·Table·Disk)의 정의와 현행 이름, 이점 가운데 쓸 것(Azure가 하드웨어 유지 관리·업데이트를 맡는다, 저장한 데이터를 서비스가 암호화한다). **NoSQL**·**블록 수준**을 한 줄로 풀 근거. Queue·Table·관리 디스크 문서의 첫 문단. 덤프 NO.108·161 | Learn 단원 4(받아 둠), Queue·Table 소개, 관리 디스크 개요 |
| b | `blob-storage` | Blob의 정의(비정형 객체), **쓰임**(브라우저에 내주기, 스트리밍, 백업·보관, 분석), HTTP/HTTPS로 URL로 닿는다는 것, 객체를 담는 **컨테이너**의 정의(「컨테이너는 Blob을 묶는다」 — 현행 문서의 말로). **비정형 데이터**를 한 줄로 풀 근거 | Learn 단원 4, Blob 소개 |
| c | `access-tiers` | 네 계층의 정의와 **최소 보관 일수**(쿨 30·콜드 90·보관 180), 일찍 지우거나 옮기면 어떻게 되는가(조기 삭제 요금 — 쓸지 정한다, 금액 없이 한 줄까지), **저장 비용과 읽는 비용의 방향**, **온라인/오프라인 계층**이라는 이름, **계정의 기본 액세스 계층**(핫·쿨·콜드 가운데 고른다, 보관은 안 된다), Blob마다의 계층(올릴 때·올린 뒤, 네 계층 모두), 올린 뒤 계정 기본값을 바꾸면 무엇이 달라지는가. 계층이 Blob에만 있는 말인지(Azure Files의 계층과 혼동 — NO.242). 덤프 NO.50·190·242·438·504 — 그림까지 본다 | Learn 단원 4, 「Access tiers for blob data」 |
| d | `archive-rehydration` | 보관 계층이 오프라인이라 **읽거나 고칠 수 없다**는 것, **리하이드레이션**의 정의, 두 방법(계층 바꾸기·온라인 계층으로 복사), 걸리는 시간과 우선순위(표준·높음 — 값을 확인하고 쓸지 정한다), 한국어 표기(Learn 한국어판의 「리하일레이션」은 오타로 보인다 — 제품 문서 한국어판을 본다). **NO.354·66·148·435**: 답을 그림까지 본다 — 덤프끼리 갈리면 항목으로 | 「Blob rehydration from the archive tier」 |
| e | `azure-files` | Azure Files의 정의(관리형 파일 공유), SMB·NFS와 어느 운영 체제에서 닿는가, 클라우드와 온-프레미스가 **동시에 탑재**, Windows에서 드라이브 문자로 연결하는 것(NO.199), 파일 공유를 스토리지 계정 안에 만드는 것(NO.412 — 포털에서 어디서 만드는가는 쓰지 않아도 된다), Azure File Sync로 캐시한다는 한 줄(자세한 것은 step 5). **SMB**·**NFS**·**프로토콜**을 한 줄로 풀 근거. Blob과 Files를 어떻게 나눠 고르는가(문서에 있으면). NO.352(온-프레미스와 동기화) | Learn 단원 4, Files 소개, Windows에서 탑재 문서 |
| f | `storage-redundancy` | **언제나 주 지역에 셋**, LRS(데이터 센터 하나)·ZRS(가용성 영역 셋, 동기)의 정의, LRS가 막는 것과 못 막는 것, ZRS일 때 영역 하나가 멈춰도 읽고 쓸 수 있음, 값은 복사본 수만(내구성 9의 개수는 기록만 하고 쓰지 않음을 적는다). **NO.231·294·307**: 복사본 수, 「다른 데이터 센터로 저절로 백업」, 「2TB·파일 100만 개」 — 현행 한도 문서로 주장이 틀렸는지만 확인하고 값은 쓰지 않는다. **복제는 백업이 아니다**를 공식 문서가 말하는가 — 말하지 않으면 그 문장을 쓰지 말고 「지운 데이터도 복제본에서 지워진다」 같은 확인된 사실만 쓸지 정한다 | Learn 단원 3(받아 둠), 「Azure Storage redundancy」 |
| g | `geo-redundancy` | GRS·GZRS의 구성(주 지역/보조 지역)과 **복사본 수**(GRS 6, GZRS — 문서의 말로), 보조 지역을 Azure가 지역 쌍으로 정하는 것, 비동기 복제와 최근 데이터 유실 가능성, **기본으로 보조 지역을 읽을 수 없음**, 장애 조치, RA-GRS·RA-GZRS. 현행 표기(GRS의 「지역 중복」과 「지리적 중복」이 섞임). `RedundancyOptionsTable`의 칸마다 근거. 덤프 NO.297 | Learn 단원 3, 「Azure Storage redundancy」, phase 102 지역 쌍 항목 |
| h | `storage-accounts` | 계정의 정의, **고유한 이름공간**, 이름 규칙(3~24자, 숫자·소문자, Azure 전체에서 하나 — NO.158), 엔드포인트 꼴(Blob·Files), 만들 때 고르는 것(지역·중복성), 관리 디스크가 스토리지 계정을 쓰지 않는다는 앞 phase 확인(가리킨다). **NO.412**(파일 공유는 스토리지 계정에서) | Learn 단원 2(받아 둠), 「Storage account overview」(받아 둠) |
| i | `account-types` | 네 유형의 이름·지원 서비스·중복성 옵션과 권장 용도(Learn 단원 2와 제품 문서가 같은지 — **다르면 현행 제품 문서**), 옛 유형을 쓰지 않는 까닭, 표준과 프리미엄의 차이(저장 장치 — 문서의 말로). **블록 Blob**·**페이지 Blob**·**트랜잭션**·**대기 시간**을 한 줄로 풀 근거. **NO.146**: 프리미엄 블록 Blob 계정이 지원하는 중복성 — 덤프 답을 그림까지 본다 | Learn 단원 2, 「Storage account overview」 |
| j | 도식·표 | `AccessTierDiagram`·`ArchiveRehydrationDiagram`·`FileShareDiagram`·`LrsZrsDiagram`·`GeoRedundancyDiagram`·`StorageAccountDiagram`과 표 `RedundancyOptionsTable`·`StorageAccountTypesTable`의 라벨·곁말·캡션·칸의 사실마다 근거가 있는지(각 step 문서의 설계를 읽는다) | a~i의 결과 |

빠진 것을 읽다가 찾으면 더한다. 덤프 문항(위 번호)과 용어집 항목을 하나씩 읽어 공식 문서와 다른 주장이 더 있는지 본다.
NO.306·487은 앞 phase의 D 항목에 이미 있다 — 새로 만들지 말고 summary에 그 번호를 적는다.

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·5)의 공통 형식」대로. 이미 있는 항목(Learn 단원 4, 지역 쌍)에는 사실 줄을 덧붙이고(끝에 `(phase 104)`), 새로 받은 문서는 새 항목으로 둔다.
Learn 단원 2·3은 phase 100 항목과 같은 꼴(「(phase 104) Learn 「Describe Azure storage services」 — 2 Describe Azure storage accounts」)로 새 항목을 둔다. 단원 6·7은 step 5의 몫이다.
끝에 「한국어 표기 정리 — `azure-storage`」 항목 — 개념 9개와 목록 항목 이름(서비스 다섯, 계층 넷, 옵션 여섯, 계정 유형 넷)마다 고른 표기와 근거 문서, 섞여 쓰인 표기와 고른 까닭.

### 3. `docs/source/azure/corrections.md`에 더한다

D65·G41부터. 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.354** — 보관 계층 데이터를 AzCopy로 언제든 읽는다는 답. NO.66·148·435와 답이 갈리는지.
- **NO.50·190·438·504** — 콜드 계층이 빠진 설명, 「계정 수준」의 말이 현행과 맞는지, 「쿨이 가장 싸다」 같은 진술의 답.
- **NO.242** — 프리미엄의 파일 공유와 쿨 계층을 잇는 진술.
- **NO.294·307·477·495·506** — 복사본 셋, 저절로 백업, 2TB·100만 개. 덤프끼리 답이 갈리는지.
- **NO.146** — 프리미엄 블록 Blob의 중복성.
- 용어집 「스토리지 계층」(콜드가 빠짐으로 보임), 「Azure Storage」(Disk가 빠짐), 「스토리지 계정」 항목의 낡은 주장.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-storage`의 개념 9개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**.
목록 개념(`storage-services`)은 항목 이름도. 위 표의 a~j마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다.
특히 (1) 계정 기본 계층에서 보관을 고를 수 없다는 것의 현행 표현, (2) 리하이드레이션의 표기와 걸리는 시간을 쓸지, (3) 복사본 수(LRS·ZRS·GRS·GZRS), (4) 「복제는 백업이 아니다」를 쓸 수 있는지, (5) 계정 유형 넷의 확정 이름과 칸, (6) 도식 여섯과 표 둘에 쓸 수 있는 사실과 이름. 받은 파일 목록(`raw/official/`). 마지막 D·G 번호. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·5)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작 319개).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/104-azure-storage-migration/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다 — guide.md 「배경」).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 1~4가 쓴다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다.
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.** 이유: 허용 출처를 넓히는 것은 설계에서 정한다. 다른 곳이 꼭 필요하면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **내구성·RPO·SLA·용량 수치와 가격을 `official.md`에 가르칠 사실로 적지 마라.** 이유: guide.md 「배경」이 쓰지 않기로 했다. 쓰지 않는다는 처리만 남긴다.
- **`azure-data-movement`의 사실(AzCopy·Storage Explorer·File Sync·Azure Migrate·Data Box)을 이 step에서 정리하지 마라.** 이유: step 5의 범위다.
- **`topic-map.md`·`dump-topics.tsv`를 고치지 마라.**
