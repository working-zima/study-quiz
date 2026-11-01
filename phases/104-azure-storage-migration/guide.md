# phase 104 공통 안내 — Azure AZ-900 과목의 스토리지·데이터 이동과 마이그레이션

이 phase의 **모든 step이 먼저 읽는 문서**다. step 문서는 자기 일의 세부만 적고, 과목 결정·두 주제의 개념 표와 글·문항·도식·파일 형식의 공통 규칙은 여기에 둔다.
step 문서와 이 문서가 다르면 step 문서를 따르고 그 차이를 summary에 적는다.

## 배경 — 다시 묻지 말 결정

Azure AZ-900 과목(`src/data/azure/`, ADR-060)은 phase 100에서 생겼고 phase 101·102·103이 주제 3~10을 더했다. 주제 지도(`docs/source/azure/topic-map.md`)의 주제 20개 가운데 1~10이 있고, **이 phase는 11·12를 더한다.**
둘 다 공식 학습 가이드의 묶음 「Describe Azure storage services」를 채운다.

**앞 phase가 남긴 것(이 phase의 출발점):**

- 주제 열 — `azure-cloud-computing`(개념 7)·`azure-cloud-models`(5)·`azure-cloud-benefits`(7)·`azure-sla-lifecycle`(6)·`azure-service-types`(4)·`azure-regions-zones`(6)·`azure-resource-hierarchy`(6)·`azure-compute`(9)·`azure-virtual-networking`(8)·`azure-network-protection`(4), 개념 62개.
- 문항 `az001`~`az085`(85개) — 예/아니요 예 22·아니요 23, 4지선다 정답 위치(`answerIndex` 0~3) 10/10/10/10.
- 도식 27개, 표 `PricingModelsTable`·`CloudModelsTable`·`ServiceTypesTable`·`HostingOptionsTable`.
- 출처 문서 `docs/source/azure/official.md`(항목 머리 `## (phase 100) …`~`## (phase 103) …`)와 `docs/source/azure/corrections.md`(D1~D64, G1~G40). **이 phase는 D65·G41부터 잇는다.**
- 검증 값(설계 때 잰 값): 테스트 244파일·5545개, 교차 검사 세로·가로 노드 1103·경로 757, `check-verbatim --subject azure` 원본 319개·단위 584개(설계 세션이 Learn 단원을 더 받아 원본이 311에서 늘었다 — 아래 「출처」).
- 실행 보고 `phases/100-…`~`103-azure-compute-networking/verification.md` — 출처 step이 정한 표기와 그 이유, 마무리에서 고친 문항의 꼴이 있다. **`103`의 「마무리 수정」을 읽는다** — 문제문의 「…만으로」, 「…뒤에도」처럼 답을 암시하는 말과, 정답 보기만 문제문 낱말을 되풀이하는 것을 고쳤다. 같은 것을 반복하지 않는다.

**앞 주제가 이미 쓴 것 — 겹치지 않게:**

- `azure-regions-zones.availability-zones`·`region-pairs`·`zone-service-categories`(phase 102)가 가용성 영역과 지역 쌍, 영역 중복의 뜻을 가르친다. 이 phase는 그 낱말을 한 줄로 다시 풀고(이 주제 화면만 읽고 뜻이 서야 한다), **데이터의 복사본을 어디에 몇 개 두는가**를 쓴다. 문항 `az042`(데이터 센터 장애와 가용성 영역)와 같은 것을 묻지 않는다.
- `azure-virtual-networking.endpoints`(phase 103)가 스토리지 계정으로 가는 프라이빗 엔드포인트를 가르친다. 이 phase의 스토리지 계정 「엔드포인트」는 **서비스마다 정해지는 접속 주소**를 쓰고 프라이빗 엔드포인트는 다시 쓰지 않는다. `az072`와 같은 것을 묻지 않는다.
- `azure-compute.vm-resources`(phase 103)가 OS 디스크·데이터 디스크의 쓰임을 가르친다. 이 phase의 Azure Disk Storage는 Azure Storage 서비스 가운데 어떤 것인지(VM에 붙이는 블록 수준 볼륨)까지만 쓴다.
- 다른 주제의 몫: 스토리지 비용 요인과 전송 요금은 `azure-cost-factors`, 서비스별 Azure 데이터베이스는 어느 주제에도 없다 — 이 phase에서 만들지 않는다.

**사용자 결정(2026-10-30, 다시 묻지 마라):**

- **범위**: Microsoft Learn의 AZ-900 공식 학습 가이드(2026-07-20 기준)가 뼈대다. 가이드 밖이라도 **용어집에 있고 덤프도 묻는 현행 것**은 넣는다.
  지원이 끝난 서비스·옛 이름은 빼거나 현행으로 고친다. 덤프만 묻는 것은 넣지 않는다.
- **도식**: **주제마다 최소 하나**, 그리고 구조·흐름이 있는 개념에는 개념마다. 정의형 개념에는 없다. 비교표는 도식을 대신하지 않는다.
- 주제 지도(20개, 순서·별점·phase)는 사용자가 「고칠 것 없음」으로 확인했다.
- 사실의 기준은 **Microsoft 공식 문서**다. 덤프와 용어집은 범위·강조의 기준이자 사실 **후보**이고, 공식 문서와 다르면 공식 문서를 따르고 수정 이력에 남긴다(ADR-060).
  덤프 문항·용어집 문장은 옮기지 않는다(ADR-009, ADR-021과 같은 방식). 덤프는 시험 주관 기관의 문항이 아니므로 「자격시험은 ~로 본다」 줄을 쓰지 않는다.
- 용어는 **Microsoft 한국어 문서의 표기**를 따른다. 주제 id는 `azure-` 접두사, 별점은 덤프 출제 빈도(대표 문항 25 이상 ★★★, 13~24 ★★☆, 12 이하 없음).
- **서비스마다의 SLA 수치는 쓰지 않는다**(phase 101 설계 — SLA 약관 원문을 받아 확인할 수 없다). 가격·지역 수도 쓰지 않는다.

**이 phase에서 정한 것(설계):**

- 개념 14개, 문항 20개(`az086`~`az105`), 도식 9개, 표 셋(`RedundancyOptionsTable`·`StorageAccountTypesTable`·`DataMoveOptionsTable`). 아래 「두 주제와 개념 14개」.
- **`azure-data-movement`는 별점이 없다**(대표 문항 3 — `importance` 0). 주제 지도대로다.
- **쓰지 않는 수치**: 내구성의 「9가 몇 개」(11 nines 등), 복구 지점 목표(RPO) 분, 가용성 SLA, 스토리지 계정 용량 한도, Queue 메시지 크기, **Data Box 장치 용량**.
  까닭: 내구성·RPO·SLA는 덤프가 묻지 않고 개념을 흐리며, Data Box 용량은 **설계 때 문서끼리 어긋났다**(Learn 단원은 80TB, 제품 개요는 120TB·525TB 장치와 80TB 장치의 단계적 중단) — 「큰 데이터」로 충분하다. 복사본 수(LRS·ZRS 3, GRS·GZRS 6)와 최소 보관 기간(30·90·180일)은 덤프가 묻고 개념의 요점이라 쓴다(출처 step이 확인한 값).
  NO.294·307의 「2TB·파일 100만 개」는 틀린 주장이라는 처리만 수정 이력에 남기고, 맞는 한도 수치를 본문에 쓰지 않는다.
- **Learn 단원이 다루지만 쓰지 않는 것**: Data Lake Storage Gen2(「분석용」까지 한 줄도 쓰지 않는다 — 학습 가이드의 줄에 없다), 관리 디스크의 종류, 스토리지 클라이언트 라이브러리의 언어 목록, Azure Migrate의 ISV 도구, Data Box 지우는 표준의 이름(NIST), 수명 주기 관리 정책.
  옛 계정 유형(범용 v1, 레거시 Blob Storage 계정)은 쓰지 않는다 — 덤프가 그 전제로 물으면 출처 step이 처리를 남긴다.
- **도식은 구조·흐름이 있는 개념 9개에 하나씩**(아래 「도식」). 붙이지 않는 개념: `storage-services`(목록 개념)·`blob-storage`(정의형)·`account-types`(표를 붙인다)·`azcopy`·`storage-explorer`(`FileSyncDiagram`이 AzCopy의 방향을 함께 그린다).
- **ADR은 필요 없다.** 쓸 출처가 모두 이미 허용된 `learn.microsoft.com` 안에 있다. 허용 목록 밖의 곳이 꼭 필요하면 쓰지 말고 출처 step의 summary 「사용자 확인」에 적는다.

**실행 규칙:**

- **step 하나는 30분 안에 끝나야 한다.** `scripts/execute.py`가 step을 1800초에서 끊는다. 그래서 step은 **브라우저 화면 실측(개발 서버·headless Chrome·CDP)을 하지 않는다** —
  phase가 끝난 뒤 메인 세션이 모든 도식을 한꺼번에 실측한다. 시간을 아끼려고 검증 명령을 건너뛰지는 마라.
- 「주제마다 도식 하나 이상」을 `src/components/diagrams/azureDiagramCoverage.test.ts`가 지킨다. 그래서 **주제를 처음 만드는 step(1·6)이 그 주제의 첫 도식도 함께** 만든다.
  저장소의 Stop 훅(`scripts/hooks/codex-verify-gate.sh`)은 테스트가 실패한 상태로 step을 끝내지 못하게 한다.
- **진행 안내 문장을 쓰지 않는다.** 「다음 개념에서 다룬다」, 「뒤에서 자세히 다룬다」처럼 글의 진행만 알리는 말은 `src/data/azure/data.test.ts`의 진행 안내 테스트가 막는다.
  뒤 개념이나 다른 주제가 자세히 다룰 낱말이 지금 필요하면 그 자리에서 한 줄로 풀고 넘어간다. 「앞 개념에서 본 것처럼」 같은 되짚기는 써도 된다.
- **이 Mac의 Python은 HTTPS 인증서를 찾지 못한다.** 공식 문서를 받을 때 `CERTIFICATE_VERIFY_FAILED`가 나면 명령 앞에 `SSL_CERT_FILE=/etc/ssl/cert.pem`을 붙인다. 이것은 인터넷 연결 문제가 아니다 — blocked로 멈추지 마라.

## step 여덟 개

| step | 이름 | 하는 일 |
|---|---|---|
| 0 | `storage-sources` | 주제 11이 쓸 사실을 공식 문서로 확인해 `official.md`·`corrections.md`에 더한다 |
| 1 | `services-blob-tiers` | 주제 11을 만들고 개념 1·2·3의 글·문항과 도식 `AccessTierDiagram` |
| 2 | `rehydration-files` | 개념 4·5의 글·문항과 도식 `ArchiveRehydrationDiagram`·`FileShareDiagram` |
| 3 | `redundancy` | 개념 6·7의 글·문항과 도식 `LrsZrsDiagram`·`GeoRedundancyDiagram`, 표 `RedundancyOptionsTable` |
| 4 | `storage-accounts` | 개념 8·9의 글·문항과 도식 `StorageAccountDiagram`, 표 `StorageAccountTypesTable` |
| 5 | `movement-sources` | 주제 12가 쓸 사실을 확인해 두 문서에 더한다 |
| 6 | `file-tools` | 주제 12를 만들고 개념 10·11·12의 글·문항과 도식 `FileSyncDiagram` |
| 7 | `migrate-data-box` | 개념 13·14의 글·문항과 도식 `AzureMigrateDiagram`·`DataBoxDiagram`, 표 `DataMoveOptionsTable` |

## 두 주제와 개념 14개

주제 객체(`src/data/azure/topics.json`의 기존 열 주제 뒤에 이 순서로):

```json
{ "id": "azure-storage", "title": "스토리지", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }
{ "id": "azure-data-movement", "title": "데이터 이동과 마이그레이션", "importance": 0, "sourcePages": [0, 0], "concepts": [ … ] }
```

별점: 주제 지도의 대표 문항 수가 `azure-storage` 22(★★☆), `azure-data-movement` 3(없음)이다. `data.test.ts`가 이 값을 본다.

개념 id는 `<주제 id>.<슬러그>`다. 표의 순서·슬러그·`parentId`를 바꾸지 않는다(바꿔야 할 이유가 있으면 바꾸지 말고 summary에 적는다).
**`name`은 출처 step(0·5)이 확인한 Microsoft 한국어 문서의 표기를 따른다** — 표의 이름은 잠정이다. 한국어판 안에서도 표기가 섞인 것(아래 「한국어판에서 본 것」)은 출처 step이 하나로 정하고 근거를 남긴다.
`parentId` 열의 값은 같은 주제의 슬러그다 — JSON에는 `azure-storage.blob-storage`처럼 전체 id로 쓴다. 딸린 개념은 부모 바로 뒤에 이어 두고, 부모는 머리 개념이어야 한다(ADR-041 — 딸린 개념 아래에 또 딸리지 않는다).
「다룰 것」은 범위다. 문장은 직접 쓰고, 사실은 아래 「출처」대로 가져온다. 「step N 결과」라고 적힌 사실은 그 step의 summary와 출처 문서에 적힌 처리를 따른다 —
확인되지 않았으면 쓰지 않는다. 「덤프」 뒤의 `NO.`는 덤프 문항 번호다(`docs/source/azure/dump-topics.tsv`·`raw/dump/dump.md`).

**한국어판에서 본 것(설계 때, 출처 step이 다시 확인한다):** Learn 「Describe Azure storage services」 한국어판은 기계 번역이라 표기가 흔들린다 —
「Azure 블롭스」·「Azure 큐」·「Azure 디스크」·「Azure 테이블」(제목)과 「Blob Storage」, 「지역 중복 스토리지」와 「지리적 중복 스토리지」(둘 다 GRS), 「지역 영역 중복 스토리지」, 「보조 지역」과 「이차 지역」, 「기본 지역」과 「주 지역」, 「리하일레이션」(오타로 보임),
「Azure Migrate(Azure 마이그레이션)」, 「Azure 파일 동기화」(Azure File Sync), 「핫·쿨·콜드·보관 계층」. 제품 문서 한국어판까지 보고 하나로 정한다. 계정 유형 이름(「표준 범용 v2」, 「프리미엄 블록 Blob」 등)도 출처 step이 정한다.

### `azure-storage` — 스토리지 (공식 학습 가이드 「Compare Azure Storage services」·「Describe storage tiers」·「Describe redundancy options」·「Describe storage account options and storage types」)

순서는 학습 가이드와 같다 — 어떤 서비스가 있는가(데이터의 모양) → 그 가운데 가장 많이 묻는 Blob과 계층(얼마나 자주 읽는가) → 파일 공유 → 복사본을 어디에 두는가(어디까지의 장애를 견디는가) → 이것들을 담는 스토리지 계정.
학습자가 가장 많이 헷갈리는 것은 **셋이 서로 다른 질문이라는 것**이다 — **서비스**는 어떤 모양의 데이터인가, **액세스 계층**은 얼마나 자주 읽는가, **중복성**은 어디까지의 장애를 견디는가. 글과 문항이 이 셋을 섞지 않게 한다. 계층을 바꿔도 복사본의 위치는 그대로고, 중복성을 바꿔도 읽는 비용의 구조는 그대로다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 1 | `storage-services` | Azure Storage 서비스 | — | 1 | **목록 개념** — 소개 문단(Azure Storage는 데이터를 담아 두는 Azure 서비스들의 묶음이다. **스토리지**를 이 자리에서 푼다. 하드웨어 유지 관리와 업데이트를 Azure가 맡고, 저장한 데이터를 Azure가 암호화한다는 것을 한 줄씩 — step 0 결과대로) 뒤 항목 다섯. Azure Blob Storage: 글자·이진 데이터(사진·동영상 같은)를 객체로 담는다. Azure Files: 여러 컴퓨터가 함께 쓰는 파일 공유. Azure Queue Storage: 앱의 구성 요소들이 주고받는 메시지를 쌓아 둔다. Azure Table Storage: 행과 속성으로 된 구조적 데이터를 NoSQL로 담는다(**NoSQL**을 한 줄로 푼다). Azure Disk Storage: VM(가상 머신, 한 줄로 푼다)에 붙이는 블록 수준 저장 볼륨 — 관리 디스크(**블록 수준**을 한 줄로 푼다). 항목 다음에 고르는 기준(데이터의 모양과 쓰는 방식 — 큰 파일을 URL로 / 드라이브처럼 / 앱 사이의 메시지 / 구조적 데이터 / VM의 디스크)을 한 문단으로. 이름의 한국어 표기는 step 0 결과대로. 덤프: NO.108, 161, 306(디스크 저장 — 앞 phase의 D 항목이 있으면 그 처리), 487 |
| 2 | `blob-storage` | Azure Blob Storage | — | 1 | **비정형 데이터**(표처럼 정해진 틀이 없는 데이터 — 한 줄로 푼다)를 객체로 담는 서비스. 언제 쓰는가 — 브라우저에 이미지나 문서를 바로 내주기, 동영상·오디오 스트리밍, 백업·재해 복구·보관, 분석용 데이터 — 쓰임마다 한 줄, 예는 직접 만든다. HTTP나 HTTPS로 세계 어디서나 URL로 닿는다(**HTTP**를 한 줄로 푼다). 객체(**Blob**)를 담는 **컨테이너**(컴퓨트의 컨테이너와 다른 낱말이다 — 그 자리에서 밝힌다, step 0 결과대로). Azure Files와 **드라이브처럼 탑재하는가 / URL로 객체를 다루는가**로 갈린다는 것을 4절대로. 덤프: NO.161 |
| 3 | `access-tiers` | Blob 액세스 계층 | `blob-storage` | 1 | 데이터를 얼마나 자주 읽느냐에 따라 저장 비용과 읽는 비용의 균형을 고르는 것. 항목 넷 — 핫(자주 읽고 고침), 쿨(자주 읽지 않고 **최소 30일** 둠), 콜드(자주 읽지 않고 **최소 90일** 둠), 보관(거의 읽지 않고 **최소 180일** 두며, 읽기까지 기다려도 됨). 예는 직접 만든다. **저장 비용이 낮을수록 읽는 비용이 높다** — 금액은 쓰지 않는다. 어디에서 정하는가: 스토리지 계정의 **기본 계층**은 핫·쿨·콜드 가운데서 고르고 **보관은 계정 기본값이 될 수 없다**, Blob마다는 네 계층 모두 올릴 때나 올린 뒤에 정할 수 있다 — step 0 결과대로. 온라인 계층(핫·쿨·콜드)과 오프라인 계층(보관)이라는 이름을 세운다(step 0 결과대로). 계층은 Blob에 있는 것이다 — 파일 공유의 계층은 쓰지 않는다(NO.242의 그 부분은 step 0이 처리한다). **이 개념에 도식 `AccessTierDiagram`을 붙인다**. 덤프: NO.50, 190, 242, 438, 504 |
| 4 | `archive-rehydration` | 보관 계층 데이터 읽기(리하이드레이션) | `blob-storage` | 2 | 보관 계층은 오프라인이라 **그 Blob을 바로 읽거나 고칠 수 없다** — 먼저 온라인 계층(핫·쿨·콜드)으로 옮겨야 하고, 이 일을 **리하이드레이션**이라 한다(낱말의 뜻을 한 줄로 푼다, 한국어 표기는 step 0 결과대로). 두 방법(계층을 바꾸기, 온라인 계층으로 복사하기)과 걸리는 시간(시간 단위 — step 0이 확인한 값대로. 우선순위 표준·높음은 쓸지 step 0이 정한다). 그래서 바로 꺼내야 하는 데이터는 보관 계층에 두지 않는다. AzCopy로 바로 읽히는 것도, Azure Backup으로 복원하는 것도 아니다(NO.354의 덤프 답 처리 — step 0 결과대로). **이 개념에 도식 `ArchiveRehydrationDiagram`을 붙인다**. 덤프: NO.66, 148, 354, 435 |
| 5 | `azure-files` | Azure Files | — | 2 | 클라우드에 있는 관리형 **파일 공유** — 파일 서버 하드웨어와 운영 체제 패치를 고객이 맡지 않는다(**파일 공유**를 이 자리에서 푼다). **SMB**·**NFS** 프로토콜로 닿는다(**프로토콜**과 함께 한 줄씩 푼다. 어느 운영 체제가 어느 프로토콜을 쓰는지는 step 0 결과대로). 클라우드와 온-프레미스(회사가 직접 운영하는 데이터 센터 — 한 줄로 푼다)의 컴퓨터가 같은 공유를 **동시에 탑재**한다 — **탑재**(드라이브 문자나 폴더처럼 연결해 쓰는 것)를 한 줄로 푼다. Windows에서 네트워크 드라이브로 연결하는 예. 파일 공유는 스토리지 계정 안에 만든다(스토리지 계정을 한 줄로 푼다). Azure File Sync로 Windows 서버에 캐시할 수 있다는 것은 한 줄 풀이만. **이 개념에 도식 `FileShareDiagram`을 붙인다**. 덤프: NO.199, 352, 412 |
| 6 | `storage-redundancy` | 스토리지 중복성 | — | 3 | 하드웨어 고장·정전·지역 재해에서 데이터를 지키려고 **복사본을 여러 개 두는 것**. **중복성**을 푼다. 주 지역(계정을 만들 때 고른 지역 — **지역**을 한 줄로 푼다) 안에는 **언제나 복사본이 셋**이고, 그 셋을 어디에 두느냐가 두 옵션으로 갈린다 — **LRS**(로컬 중복 스토리지): 데이터 센터 **한 곳** 안에 셋, 가장 싸고 서버 랙·드라이브 고장을 막지만 그 데이터 센터가 통째로 멈추면 잃을 수 있다. **ZRS**(영역 중복 스토리지): **가용성 영역 셋**에 동기로 하나씩 — 영역 하나가 멈춰도 읽고 쓸 수 있다(**가용성 영역**·**동기**를 한 줄로 푼다). 복사본이 많다고 백업이 되는 것은 아니라는 것(NO.294·307 — 「다른 데이터 센터로 저절로 백업」이 왜 틀렸는지) — step 0 결과대로. 비용과 가용성 사이에서 고른다. **이 개념에 도식 `LrsZrsDiagram`을 붙인다**. 덤프: NO.231, 294, 307 |
| 7 | `geo-redundancy` | 보조 지역으로 복제 | `storage-redundancy` | 3 | 지역 전체의 재해에 대비해 멀리 있는 **보조 지역**으로도 복제하는 옵션. 보조 지역은 지역 쌍으로 Azure가 정한다(**지역 쌍**을 한 줄로 푼다). **GRS**: 주 지역은 LRS, 보조 지역에도 LRS — 모두 복사본 **여섯**. **GZRS**: 주 지역은 ZRS, 보조 지역은 LRS — 복사본 수는 step 0 결과대로. 보조 지역으로는 **비동기**로 복제하므로 주 지역이 복구되지 않으면 최근 쓴 데이터를 잃을 수 있다(수치는 쓰지 않는다). **기본으로 보조 지역의 데이터는 읽을 수 없고**, 장애 조치(보조 지역을 주 지역으로 바꾸는 일 — 한 줄로 푼다) 뒤에 쓴다. 장애 조치 전에 읽으려면 **RA-GRS**·**RA-GZRS** — 그 데이터는 최신이 아닐 수 있다. **이 개념에 도식 `GeoRedundancyDiagram`과 표 `RedundancyOptionsTable`을 붙인다**. 덤프: NO.297, 146의 옵션 이름 |
| 8 | `storage-accounts` | 스토리지 계정 | — | 4 | Blob·파일 공유·큐·테이블을 담는 Azure 리소스로, 그 데이터에 **고유한 이름공간**을 준다(**이름공간**을 한 줄로 푼다). **이름은 Azure 전체에서 하나뿐**이다 — 구독이나 지역이 달라도 같은 이름을 쓸 수 없다. 이름은 3~24자, 숫자와 소문자만. 이름과 서비스가 합쳐져 **엔드포인트**(서비스에 닿는 주소)가 된다 — Blob과 Files의 주소 꼴을 예로(백틱). 만들 때 지역과 중복성 옵션을 고른다. 관리 디스크는 스토리지 계정 없이 쓴다는 것(앞 phase의 D 항목이 확인한 사실 — step 0이 가리킨다). 용량 수치는 쓰지 않는다 — NO.294·307의 「2TB」는 수정 이력의 몫. **이 개념에 도식 `StorageAccountDiagram`을 붙인다**. 덤프: NO.158, 412 |
| 9 | `account-types` | 스토리지 계정 유형 | `storage-accounts` | 4 | 계정 유형이 쓸 수 있는 서비스와 중복성 옵션을 정한다는 것. 넷을 표 `StorageAccountTypesTable`로 — 표준 범용 v2(거의 모든 경우에 권장, 네 서비스, 여섯 옵션), 프리미엄 블록 Blob(트랜잭션이 많거나 작은 객체, 낮은 대기 시간 — LRS·ZRS), 프리미엄 파일 공유(파일 공유만 — SMB와 NFS를 함께, LRS·ZRS), 프리미엄 페이지 Blob(페이지 Blob만 — LRS). **블록 Blob**·**페이지 Blob**·**트랜잭션**·**대기 시간**을 한 줄씩 푼다. 표준과 프리미엄이 무엇이 다른가(step 0 결과대로 — 저장 장치 이름은 확인한 것만). 이름의 표기는 step 0 결과대로. **이 개념에 표 `StorageAccountTypesTable`을 붙인다**. 덤프: NO.146 |

### `azure-data-movement` — 데이터 이동과 마이그레이션 (공식 학습 가이드 「Identify options for moving files, including AzCopy, Azure Storage Explorer, and Azure File Sync」·「Describe migration options, including Azure Migrate and Azure Data Box」)

작은 일에서 큰 일로 간다 — 파일을 옮기는 도구(명령줄의 AzCopy → 화면의 Storage Explorer → 늘 맞춰 두는 File Sync) → 데이터 센터를 통째로 옮기는 준비(Azure Migrate) → 네트워크로 보내기 어려운 큰 데이터(Data Box).
학습자가 가장 많이 헷갈리는 것은 **「무엇을, 어떤 방식으로 옮기는가」**다 — 한쪽으로 복사(AzCopy·Storage Explorer)와 양쪽을 늘 맞춤(File Sync), 온라인 이전(Azure Migrate)과 장치 배송(Data Box). 마지막 개념의 표 `DataMoveOptionsTable`이 다섯을 나란히 둔다.

| # | 슬러그 | name(잠정) | parentId | step | 다룰 것 |
|---|---|---|---|---|---|
| 10 | `azcopy` | AzCopy | — | 6 | 스토리지 계정과 Blob·파일을 주고받는 **명령줄 도구**(**명령줄**을 한 줄로 푼다). 이 주제의 첫 개념이라 **스토리지 계정**·**Blob**·**Azure Files**를 짧게 푼다. 올리기·내려받기·계정 사이 복사·동기화. **동기화는 한 방향이다** — 원본과 대상을 정하면 그 방향으로만 복사하고, 시간 표시로 양쪽을 맞추지 않는다. 다른 클라우드 공급자와도 쓸 수 있다는 것은 한 줄(step 5 결과대로). 덤프: NO.240 |
| 11 | `storage-explorer` | Azure Storage Explorer | — | 6 | 스토리지 계정의 파일과 Blob을 **화면으로** 관리하는 독립 실행형 앱 — Windows·macOS·Linux. 안에서는 AzCopy로 일한다. 올리기·내려받기·계정 사이 옮기기. AzCopy와 **어떻게 다루는가**(명령 / 화면)로 갈린다는 것을 4절대로. NO.240의 「클라우드에 있는 마이그레이션 서비스」가 왜 틀렸는지(내려받아 실행하는 앱이다 — step 5 결과대로). 덤프: NO.240 |
| 12 | `file-sync` | Azure File Sync | — | 6 | Azure Files에 파일을 모으면서 Windows 파일 서버도 계속 쓰게 하는 도구 — 서버에 설치하면 **양방향으로 저절로** 맞춰진다(AzCopy의 한 방향과 견준다). 서버에서 쓸 수 있는 프로토콜, 세계 곳곳에 캐시를 둘 수 있다는 것(**캐시**를 한 줄로 푼다), 서버가 고장 나면 같은 데이터 센터의 새 서버에 설치해 바꾼다는 것, **클라우드 계층화**(자주 쓰는 파일은 서버에, 나머지는 클라우드에 — 앞의 Blob 액세스 계층과 다른 말이다)를 한 줄씩. 맞추는 상대가 파일 공유라는 것(NO.413 — Blob 컨테이너나 Data Lake가 아니다, step 5 결과대로). **이 개념에 도식 `FileSyncDiagram`을 붙인다** — AzCopy의 한 방향도 함께 그린다. 덤프: NO.240, 413 |
| 13 | `azure-migrate` | Azure Migrate | — | 7 | 온-프레미스 환경을 클라우드로 옮기는 일을 한곳에서 시작하고 진행하고 지켜보는 **허브** 서비스(**마이그레이션**·**허브**를 한 줄씩 푼다). 두 단계 — 먼저 **검색 및 평가**(무엇이 있고 옮길 수 있는지), 그다음 **마이그레이션**. 허브에 통합된 도구의 범위(서버·데이터베이스·웹 앱 — 이름은 step 5 결과대로). 데이터를 옮기는 서비스가 아니라 데이터 센터 이전을 묶는 곳이라는 것과 **Data Box와 어떻게 다른가**(네트워크로 이전 / 장치를 배송)를 4절대로. **이 개념에 도식 `AzureMigrateDiagram`을 붙인다** |
| 14 | `data-box` | Azure Data Box | — | 7 | 큰 데이터를 **물리 장치에 담아 배송**해 옮기는 서비스. 언제 쓰는가 — 네트워크 대역폭이 모자랄 때의 일회성 대량 이전, 온라인 전송이 너무 느린 주기적 업로드, 복구·규제 때문에 Azure에서 내보내기(쓰임마다 한 줄, step 5 결과대로). **용량 수치는 쓰지 않는다**(「배경」). 흐름 — 포털에서 주문, 지역 배송 업체가 배달, 로컬 네트워크에 연결해 복사, 반송, Azure에 저절로 업로드, 디스크를 지운다. 내보내기는 그 반대. **이 개념에 도식 `DataBoxDiagram`과 표 `DataMoveOptionsTable`을 붙인다**. 덤프: NO.324 |

**문항 수**: 개념마다 하나, 다섯 개념(`storage-services`·`access-tiers`·`azure-files`·`storage-redundancy`·`geo-redundancy`)과 `storage-accounts`만 둘 — 모두 20개, `az086`~`az105`.
문항은 개념 순서대로 `questions.json` 끝에 붙인다. step마다 맡는 id:

| step | id | 개념별 수 |
|---|---|---|
| 1 | `az086`~`az090` | 1 둘, 2 하나, 3 둘 |
| 2 | `az091`~`az093` | 4 하나, 5 둘 |
| 3 | `az094`~`az097` | 6 둘, 7 둘 |
| 4 | `az098`~`az100` | 8 둘, 9 하나 |
| 6 | `az101`~`az103` | 10 하나, 11 하나, 12 하나 |
| 7 | `az104`~`az105` | 13 하나, 14 하나 |

**예시 값 — 두 주제가 함께 쓴다:**

- **조직 이름**은 「회사 A」·「회사 B」처럼 이름표로 쓴다. 실제 회사 이름을 예로 들지 않는다(Azure·Microsoft처럼 공식 문서가 사실로 드는 이름은 예외).
- **VM 이름표**는 `VM 1`, **지역**은 「지역 A」·「지역 B」, **가용성 영역**은 「영역 1」·「영역 2」·「영역 3」, 복사본은 「복사본 1」처럼 쓴다. 수량이 예시 값이면(컴퓨터 두 대 등) 본문이나 캡션에서 밝힌다. 복사본 수(3, 6)는 공식 문서의 값이다.
- **스토리지 계정 이름의 예**는 규칙(3~24자, 숫자와 소문자)에 맞는 이름표 하나를 본문에 정해 도식과 같이 쓴다. 실제 회사 이름이 아니어야 한다. 엔드포인트 꼴은 백틱으로 쓴다(`EmphasizedText`는 굵은 이름 안의 백틱을 코드로 그리지 않는다).
- **공식 문서가 정한 값**(최소 보관 일수, 이름 길이, 복사본 수)은 출처 step이 확인한 것만 쓴다. 가격·서비스별 SLA 수치·내구성 수치·용량 수치는 쓰지 않는다(「배경」).
- **서비스 이름**은 Microsoft 한국어 문서 표기로 쓰고, 영문 이름이 다르면 처음 나올 때 괄호에 적는다(출처 step이 표기를 확인한다).

도식은 본문에 나온 예시 값만 쓴다(ADR-038) — 그러니 이 값들을 도식에 쓰려면 그 개념의 본문에 먼저 쓴다.

## 출처

- 사실은 `docs/source/azure/official.md`(Microsoft 공식 문서에서 확인한 사실과 URL)에서만 가져온다. 출처 step(0·5)이 그 주제에 필요한 사실을 확인해 남긴다. 그 summary가 개념마다 무엇을 쓰고 무엇을 쓰지 않는지 적는다.
- 덤프·용어집의 주장이 `docs/source/azure/corrections.md`에 걸려 있으면 **고친 쪽**을 쓴다. 덤프·용어집에만 있고 공식 문서가 말하지 않는 주장은 쓰지 않는다.
- 개념 step에서 그 밖의 사실이 필요하면, 허용한 출처(`docs/source/azure/CLAUDE.md` 「허용하는 출처」)를 실제로 열어 확인하고 `official.md`에 URL과 「쓰인 곳」을 적은 뒤 쓴다.
  받은 문서는 `python3 -I scripts/azure-source/fetch_page.py <url> docs/source/azure/raw/official/<이름>.md`로 `raw/official/`에 둔다(전사 검사가 이 폴더를 원본으로 읽는다. 인증서 오류는 「배경」의 `SSL_CERT_FILE`).
  확인하지 못한 사실은 쓰지 않는다. 블로그·Microsoft Q&A·Tech Community·위키백과·자격증 교재·덤프 사이트는 쓰지 않는다.
- **`official.md`의 「쓰인 곳」**: 출처 step은 아직 개념이 없으므로 「쓰일 곳」으로 적는다. 그 개념을 만든 step이 자기 개념 id가 걸린 줄의 「쓰일 곳」을 「쓰인 곳」으로 고친다.
- **사실만 가져오고 문장은 직접 쓴다**(ADR-009). 덤프의 문제문·보기·해설, 용어집 설명, 공식 문서(특히 한국어판)의 문장을 옮기지 않는다. `check-verbatim --subject azure`는 하한선일 뿐이다.
- 덤프 문항을 그대로 문항으로 만들지 않는다 — 덤프가 같은 사실을 물어도 상황과 문장은 직접 만든다(ADR-021과 같은 이유).

설계 세션이 받아 둔 공식 문서(`docs/source/azure/raw/official/`, 영문판과 한국어판 `ko-…`):

- Learn 「Describe Azure storage services」 — `learn-describe-azure-storage-services-{2-accounts, 3-redundancy, 4-describe-azure-storage-services, 6-identify-azure-data-migration-options, 7-identify-azure-file-movement-options}.md`와 `ko-` 판. 4는 phase 100이 받았다 — `official.md`에 항목이 있고 거기에 덧붙인다.
- 제품 문서(앞 phase가 받음): `docs-storage-common-storage-account-overview.md`, `docs-storage-common-storage-private-endpoints.md`.
- AZ-900 학습 가이드 — `az-900-study-guide.md`.

설계 때 열어 보고(모두 200) 받지 않은 것(출처 step이 받는다 — 주소는 출발점이고, 옮겨졌으면 같은 내용의 현행 쪽을 찾는다). 앞에 `learn.microsoft.com/azure/`를 붙인다:
주제 11 — `storage/blobs/storage-blobs-introduction`, `storage/blobs/access-tiers-overview`(설계 때 본 것: 계정 기본 계층은 핫·쿨·콜드), `storage/blobs/archive-rehydrate-overview`, `storage/common/storage-redundancy`, `storage/files/storage-files-introduction`, `storage/files/storage-how-to-use-files-windows`, `storage/queues/storage-queues-introduction`, `storage/tables/table-storage-overview`, `virtual-machines/managed-disks-overview`.
주제 12 — `storage/common/storage-use-azcopy-v10`, `storage/storage-explorer/vs-azure-tools-storage-manage-with-storage-explorer`, `storage/file-sync/file-sync-introduction`, `migrate/migrate-services-overview`, `databox/data-box-overview`(설계 때 본 것: 장치 용량이 Learn 단원과 다르다 — 「배경」).

## 글 — `docs/WRITING_GUIDE.md`를 따른다(ADR-056, ADR-060)

- `summary`는 WRITING_GUIDE 2절 — 처음 보는 사람이 일상 말로 「무엇이고 무슨 역할인지」 알게 하는 한 문장. 다른 전문용어를 알아야 이해되면 안 되고, 제목 낱말을 되풀이하는 순환 정의, 숫자·분류를 넣지 않는다.
- `paragraphs`는 3절의 흐름(개념 → 원리 → 예시 → 특징)을 필요한 만큼. 누가·무엇을·어디서 어디로를 빠뜨리지 않는다. 같은 말을 되풀이하지 않는다.
  헷갈리는 짝은 4절대로 무엇이 다르고 왜 나눠 부르는지를 말한다 — 이 phase의 짝: Blob과 Files, 액세스 계층과 중복성, 쿨과 콜드, 콜드와 보관, LRS와 ZRS, ZRS와 GRS, GRS와 RA-GRS, 복제와 백업, 표준 계정과 프리미엄 계정,
  AzCopy와 Storage Explorer, AzCopy의 동기화와 File Sync, 클라우드 계층화와 Blob 액세스 계층, Azure Migrate와 Data Box.
- **이 주제 화면만 읽고 뜻이 서야 한다.** 학습자는 주제 목록에서 아무 주제로나 바로 들어오므로, 다른 주제에 정의가 있다는 것은 도움이 되지 않는다.
  이 주제 안에서 처음 쓰는 낱말(VM, 지역, 가용성 영역, 지역 쌍, 온-프레미스, 스토리지 계정, Blob, HTTP, 프로토콜, 리소스, 구독 등)은 그 자리에서 짧게 푼다. 앞 phase 주제가 푼 낱말도 이 주제에서는 다시 푼다.
  앞 step이 같은 주제에서 이미 푼 낱말은 다시 풀지 않는다 — 쓰기 전에 그 주제의 앞 개념을 읽는다. 도식의 라벨·곁말·캡션과 표의 칸도 화면의 글이다.
- **진행 안내 문장을 쓰지 않는다**(「배경」). 다른 주제나 뒤 개념을 가리키는 말이 필요하면 그 낱말을 그 자리에서 한 줄로 풀고, 「~에서 다룬다」·「~에서 자세히」·「다음 개념의」·「(다음 개념)」을 붙이지 않는다.
- 비유는 이해를 돕는 데만 쓰고, 실제 동작과 다르면 그 자리에서 밝힌다. 비유로 사실을 대신하지 않는다.
- `name`은 명사구다(ADR-030 기준 1). **굵은 글씨(`**`)는 목록 항목의 이름에만** 쓴다(ADR-055와 같은 규칙, ADR-060). 목록 개념은 소개 문단 하나 뒤에 `- **한국어 이름**(English name)은 …` 꼴 항목을 두고, 항목은 혼자 서지 않는다(ADR-046).
  `EmphasizedText`는 `**…**` 안의 백틱을 코드로 그리지 않으므로 굵은 이름 안에 백틱을 넣지 않는다.
- 관용 표현(`돌린다`·`띄운다`·`태운다`·`물린다`)을 쓰지 않고 하는 일을 그대로 쓴다(ADR-030 기준 5). 평서문 「~다」로 쓴다. 「A vs B」 제목은 쓰지 않는다.
- 공식 문서의 마케팅 어조(「지능적으로」, 「원활한」, 「강력한」, 「최상위」, 「무제한」을 꾸밈말로)를 옮기지 않는다 — 무엇이 어떻게 되는지를 쓴다.

## 문항 — WRITING_GUIDE 「객관식 문제의 문장과 선택지 구성 원칙」과 ADR-054·ADR-030

가장 중요한 원칙: **질문은 쉽게 이해할 수 있도록, 선택은 충분한 생각이 필요하도록.**

1. **정의에서 이름만 지운 「무엇인가?」 꼴을 내지 않는다.** 개념에 맞는 방식 하나를 고른다 — 개념 확인, 원리 이해, 상황 적용, 개념 비교, 원인과 결과. 고른 방식과 이유를 summary에 적는다.
2. **사람이 사람에게 묻듯 쓴다.** 소리 내어 읽어 어색하거나 한 번에 이해되지 않으면 다시 쓴다. 쉼표로 조건을 줄줄이 잇는 압축문을 쓰지 않는다.
3. 무엇을 묻는지는 첫 읽기에 분명하고, 어려움은 보기를 고르는 데서 나온다. 문제문을 비틀어 난이도를 만들지 않는다.
4. 보기는 기술적으로 갈리고 정답은 하나다. 비슷한 개념을 보기로 둘 때는 그 차이를 판단할 조건을 문제문에 준다. 오답은 문제문이 묻는 범주 안에서, 실제로 헷갈리는 것에서 고른다(ADR-030 기준 4).
   정답의 이름이나 그 일부를 문제문에 쓰지 않는다(기준 3). 보기 넷은 서로 다르다.
   **두 개념이 함께 맞게 읽힐 수 있는 상황을 만들지 않는다** — 이 phase에서 특히:
   「자주 읽지 않는 데이터를 싸게 두고 싶다」는 쿨에도 콜드에도 보관에도 맞다 — 최소 보관 기간과 읽을 때 기다려도 되는지를 문제문에 준다.
   「데이터 센터가 멈춰도 데이터를 지키고 싶다」는 ZRS에도 GRS에도 GZRS에도 맞다 — 복사본을 둘 범위(같은 지역 안이어야 한다 / 다른 지역까지)를 준다.
   「파일을 Azure에 두고 여러 곳에서 쓰고 싶다」는 Blob에도 Files에도 맞다 — 쓰는 방식(드라이브처럼 탑재 / URL로)을 준다.
   「파일을 Azure로 옮기고 싶다」는 AzCopy에도 Storage Explorer에도 Data Box에도 맞다 — 다루는 방식(명령 / 화면)이나 네트워크 조건을 준다.
   「온-프레미스의 데이터를 Azure로 옮기고 싶다」는 Azure Migrate에도 Data Box에도 맞다 — 무엇을 옮기는가(서버의 평가와 이전 / 네트워크로 보내기 어려운 큰 데이터)를 준다.
5. 판단에 쓰이지 않는 정보(전문용어·수치·조건·부정문)를 늘어놓지 않는다. 판단에 필요한 조건은 남긴다.
6. **형식(ADR-054)**: 흔히 오해하는 것을 바로잡으면 예/아니요, 비슷한 개념을 구별하거나 상황에 맞는 것을 고르면 4지선다. 같은 범주의 그럴듯한 오답 셋을 출처 안에서 쓸 수 없으면 예/아니요.
   예/아니요는 주장 하나, 이중 부정·「항상」「절대」 금지, 「~인가요?」「~나요?」로 끝난다. **아니요 문항의 해설은 무엇이 틀렸는지에서 그치지 않고 맞는 사실을 가르친다.**
   예/아니요의 주장은 맞는 쪽으로도 틀린 쪽으로도 세울 수 있다 — 아래 균형을 맞추려고 주장의 방향을 고른다.
7. **문항은 풀면서 배우게 쓴다.** 문항은 섞여 나오고 랜덤 세트는 일부만 뽑으므로 혼자 읽혀야 한다. 문제문이 이 주제 밖의 낱말을 풀이 없이 전제하지 않는다(기준 5).
   상황에 쓰는 이름(「회사 A」)·숫자는 사실 주장이 아니어야 하고, 그 상황의 정답은 출처의 사실로 정해져야 한다. 문항 상황은 본문 예와 다르게 만들어 본문 문장을 외워서 풀리지 않게 한다.
8. **해설은 187자 이상**이고 그 개념을 가르치는 글이다(ADR-026·027). 4지선다는 정답이 왜 맞는지와 오답 셋이 각각 왜 아닌지를 담는다. 약어는 해설마다 처음 쓸 때 풀어 쓴다.
   같은 말을 늘려 길이를 채우지 않는다. 해설의 사실은 개념 본문이나 `official.md`에 있는 것이다.
9. **균형 — step이 끝났을 때 과목 전체에서**: 예/아니요의 예와 아니요 수 차이 **1 이하**, 4지선다의 정답 위치(`answerIndex` 0~3) 수의 최대·최소 차이 **2 이하**.
   phase 104 시작 때는 문항 85개, 예 22·아니요 23, 정답 위치 10/10/10/10이다.
10. 한 문항은 개념 하나만 묻는다(ADR-030 기준 2). 같은 개념의 두 문항은 서로 다른 것을 묻는다. 앞 phase의 문항(특히 `az042` 데이터 센터 장애와 가용성 영역, `az072` 스토리지 계정의 프라이빗 엔드포인트)과 같은 것을 묻지 않는다.
11. 답을 흘리는 꼴을 피한다 — 문제문의 「…만으로」, 「…뒤에도」처럼 답의 방향을 암시하는 말, 정답 보기만 문제문의 낱말을 되풀이하는 것, **오답 셋만 같은 말로 시작해 정답만 꼴이 다른 것**(phase 103 `az056`·`az060`·`az068`·`az070`·`az077`·`az080`).
12. 덤프 문항의 문장·보기 구성을 옮기지 않는다. 덤프가 되풀이하는 꼴(「다음 진술이 맞으면 예」 세 개 묶음, 「해결책: …, 목표를 이루나?」 연작, 밑줄 친 말 고치기, 짝짓기)도 쓰지 않는다 — 앱의 형식은 4지선다와 예/아니요 하나씩이다.

검수 — 문항마다 WRITING_GUIDE 객관식 7항의 여섯 질문으로 다시 읽고, 보기마다 「이것이 정답이라고 우길 수 있는가」를 따진다. 문제문만 읽고 보기를 보지 않은 채 정답 글자를 짐작할 수 있지 않은지도 본다.

## 도식 — 구조·흐름이 있는 개념 9개에 하나씩, 표 셋

선례는 앞 phase의 Azure 도식(`ZoneIsolationDiagram`·`RegionPairDiagram`·`NsgAssociationDiagram`·`VnetPeeringDiagram`·`ExpressRouteDiagram`과 그 `.test.tsx`, `src/data/azure/visuals/*.json`)과
네트워크 도식(`MacTableDiagram`·`CastTypesDiagram`·`ArpCacheDiagram`)이다. 그룹 박스 안에 그룹 박스를 두는 짜임은 phase 102의 `ZoneIsolationDiagram`(지역 안의 영역)을, 하나가 멈춘 상태를 곁말과 흐림으로 보이는 짜임은 같은 도식의 시나리오를 본다.
표는 `azureComputeTables.tsx`와 그 테스트를 본다.
규칙의 근거는 UI_GUIDE 「도식 전용 색상」·「도식」 절 전체, ADR-036·037·038·047·048, `src/components/diagrams/CLAUDE.md`다.
사용자 미리보기 승인을 받지 않고 **step이 좌표를 설계한다.** 그래서 기계 검사를 모두 통과시키고 설계를 summary에 남긴다.

| 도식 | JSON 키 | 개념 | step | 요지 |
|---|---|---|---|---|
| `AccessTierDiagram` | `access-tiers` | `azure-storage.access-tiers` | 1 | 네 계층 — 저장 비용과 읽는 비용의 방향, 최소 보관 기간, 계정 기본값으로 정할 수 있는 계층 |
| `ArchiveRehydrationDiagram` | `archive-rehydration` | `azure-storage.archive-rehydration` | 2 | 보관 계층의 Blob은 바로 읽지 못하고, 온라인 계층으로 옮긴 뒤 읽는다 |
| `FileShareDiagram` | `file-share` | `azure-storage.azure-files` | 2 | 스토리지 계정 안의 파일 공유를 사무실 컴퓨터들과 Azure의 VM이 함께 탑재한다 |
| `LrsZrsDiagram` | `lrs-zrs` | `azure-storage.storage-redundancy` | 3 | 복사본 셋의 위치 — 데이터 센터 한 곳 / 가용성 영역 셋. 데이터 센터가 멈출 때 무엇이 남는가 |
| `GeoRedundancyDiagram` | `geo-redundancy` | `azure-storage.geo-redundancy` | 3 | 주 지역에서 보조 지역으로 복제 — GRS와 GZRS의 주 지역 차이, 장애 조치 전 읽기 |
| `StorageAccountDiagram` | `storage-account` | `azure-storage.storage-accounts` | 4 | 계정 안의 서비스 넷과 엔드포인트, 계정 밖의 관리 디스크 |
| `FileSyncDiagram` | `file-sync` | `azure-data-movement.file-sync` | 6 | AzCopy의 한 방향과 Azure File Sync의 양방향, 클라우드 계층화 |
| `AzureMigrateDiagram` | `azure-migrate` | `azure-data-movement.azure-migrate` | 7 | 온-프레미스의 서버·데이터베이스·웹 앱이 허브의 평가와 마이그레이션을 거쳐 Azure로 |
| `DataBoxDiagram` | `data-box` | `azure-data-movement.data-box` | 7 | 장치를 오가는 두 방향 — Azure로 가져오기와 Azure에서 내보내기 |

표 — 파일 `src/components/diagrams/azureStorageTables.tsx`(둘)·`azureDataMovementTables.tsx`(하나):

| 표 | JSON `tables` 키 | 개념 | step | 열 |
|---|---|---|---|---|
| `RedundancyOptionsTable` | `redundancy-options` | `azure-storage.geo-redundancy` | 3 | 옵션 · 주 지역 · 보조 지역 |
| `StorageAccountTypesTable` | `account-types` | `azure-storage.account-types` | 4 | 유형 · 지원 서비스 · 중복성 옵션 |
| `DataMoveOptionsTable` | `data-move-options` | `azure-data-movement.data-box` | 7 | 도구 · 옮기는 방식 · 알맞은 때 |

- **파일**: 컴포넌트는 `src/components/diagrams/<이름>Diagram.tsx`(이름이 `Diagram.tsx`로 끝나야 교차 검사와 커버리지 테스트가 도식으로 본다), 테스트는 같은 이름의 `.test.tsx`.
  문구(물음형 제목 `question`·노드 라벨·그룹 라벨·곁말·캡션·`idleCaption`·`legend`·figure `label`·`svgLabel`·시나리오·`sources`)는 그 주제의 `src/data/azure/visuals/<주제 id>.json`의 `diagrams["<키>"]`에 둔다.
  `glossary`는 빈 배열이다(ADR-037). 도식 이름과 키는 위 표대로다 — 이미 있는 이름과 겹치지 않는 것을 골라 두었다.
- **표**: 위 「표」 표의 파일에 함수를 둔다(주제마다 파일 하나), 테스트는 같은 이름의 `.test.tsx`. `azureComputeTables.tsx`처럼 `ComparisonTableFigure`에 JSON의 `tables["<키>"]`를 넘긴다.
  열은 셋 이하(첫 열이 행 머리), `columnWidths`는 열 수만큼의 백분율이고 합이 100%다(`visuals.test.ts`).
  열 폭은 스크롤 막대가 낀 320px(표 폭 약 273px)에서 가장 긴 덩어리(띄어쓰기 없이 이어진 글자)가 들어가게 어림해 정하고, 그 계산을 summary에 적는다(실측은 phase 끝에 한다).
- **사실은 본문에만 있는 것**(ADR-036). 캡션·곁말·라벨·표 칸의 사실마다 그 개념(과 같은 주제의 다른 개념) 본문의 문단을 근거로 댈 수 있어야 한다. 예시 값도 본문에 나오는 것만(ADR-038).
  「회사 A」·「지역 A」·「VM 1」처럼 대상을 가르는 이름표는 사실이 아니므로 써도 된다. 글과 도식을 같은 step이 만드므로, 도식에 필요한 사실은 **글에 먼저 쓴다** — 출처에 없으면 그리지 않는다.
- **말**: 노드 라벨·곁말은 본문에 쓰인 말과 같게 쓴다. 라벨을 줄이거나 영문 약어로 바꿔 폭을 맞추지 마라 — 노드를 넓히거나 배치를 바꾼다. (본문이 「네트워크 보안 그룹(NSG)」처럼 약어를 함께 세웠으면 라벨에 그 약어를 써도 된다.)
- **글자 크기**: 노드 라벨 10, 그룹 라벨·곁말 9(viewBox 단위). `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`. 노드 높이는 32다(교차 검사기가 32로 본다 — 키 큰 노드를 만들지 말고 그룹 박스를 쓴다).
- **글자 폭의 여유**: `estimateTextWidth`는 반각 문자(영문·숫자·기호)를 0.55em으로 보지만 실제 화면에서는 0.61em까지 넓다(phase 72 화면 실측).
  반각 문자가 섞인 노드 라벨·곁말·그룹 라벨(예: `VM 1`, `LRS`, `Azure Files`, `Data Box`)은 `estimateTextWidth` 값의 **1.15배**를 폭으로 잡아 노드 폭·배치를 정하고, 그 범위가 둘레 박스와 `viewBox` 안에 들게 한다.
- **그룹 박스 안의 그룹 박스**(지역 안의 가용성 영역 등): 안쪽 박스의 라벨 영역이 바깥 박스의 라벨 영역과 겹치지 않게 위아래로 떼고, 노드는 자기를 담는 가장 안쪽 박스의 라벨 영역 아래에 둔다.
  세로형(폭 280)에서 나란히 두기 어려우면 위아래로 쌓는다 — 폭을 맞추려고 라벨을 줄이지 않는다.
- **색**: 노드는 모두 회색(`stroke-disabled`, 선례와 같은 클래스). 도식 전용 두 색(`diagram-managed`·`diagram-resource`)은 AWS 계층의 뜻이라 쓰지 않는다. 초록·빨강·주황, 16진 색, 이모지, O/X도 쓰지 않는다(ADR-036).
  강조는 opacity로만 한다 — 선택 밖 노드 `0.25`, 그룹 박스는 흐려지지 않는다. 나쁜 상태(멈춘 데이터 센터, 닿지 않는 복사본, 읽을 수 없는 Blob)는 색이 아니라 곁말과 흐림으로 보인다(UI_GUIDE 「수량과 상태를 바꾸는 도식」).
- **두 배치**: 세로형(`viewBox` 폭 280)과 가로형(폭 440)을 함께 만든다. 가로형은 `useWideDiagram()`이 `true`일 때 쓴다. `nodes`·`wideNodes`·경로·`wideGroups`·`wideNotes`를 **한 줄에 하나씩 글자 그대로** 적는다 —
  반복문이나 계산으로 만들지 마라(교차 검사기가 글자로 읽는다). 노드 id·경로 id·시나리오·문구는 두 배치가 함께 쓰고, 고른 시나리오는 배치가 바뀌어도 유지된다.
- **경로**: 직교(M/H/V)만, 노드 변에서 시작하고 끝나며, 다른 노드 상자 안을 지나지 않는다. 늘 보이는 연결선도 같은 경로 선언 꼴(`'id': 'M…'`)로 적는다.
  화살표 마커는 선례와 같고 마커 id는 `useId`로 만든다. 그룹 라벨 영역을 지나는 선분이 없어야 한다. 경로는 그룹 박스가 아니라 노드에서 시작하고 끝난다 — 그룹 전체를 가리키는 것은 선이 아니라 그룹 안에 둔 노드나 곁말로 보인다.
  `phases/38-service-diagrams/tools/check-path-crossings.mjs`는 `*Diagram.tsx`의 `const nodes = [`·`const wideNodes = [` 블록에서 `{ id: '…', x: N, y: N, width: N` 순서를, 경로 객체에서 `'id': 'M…'`를 정규식으로 읽는다. 이 형식을 지켜라.
- **물음형 제목**(ADR-038): 그림이 답하는 것 하나를 학습자의 말로. step 문서의 예는 바꿔도 된다.
- **시나리오**: step 문서에 적힌 시나리오를 둔다. 시나리오가 있는 도식은 `전체`(아무것도 고르지 않음)에서 노드가 모두 선명하다.
  두 시나리오의 「선명한 노드 + 보이는 경로 + 보이는 곁말」이 같으면 그 시나리오는 아무것도 가르지 못한다 — 다르게 설계한다. 캡션은 20자를 넘는다(`visuals.test.ts`).
- **금지**: SVG 두 개를 그려 놓고 CSS로 하나를 숨기지 마라. 기준 폭 문자열(`'(min-width: 768px)'`)을 도식 파일에 쓰지 마라(ADR-047). 흐르는 점·자동 재생 같은 애니메이션 금지.
  공용 컴포넌트(`DiagramFrame.tsx`·`ComparisonTableFigure.tsx`·`ConceptList.tsx`·`useWideDiagram.ts`)와 교차 검사기, `src/lib/svg-bounds.ts`를 고치지 마라.
- **registry**: `src/components/diagrams/registry.ts`의 `diagramsByConceptId`에 `'<개념 id>': <컴포넌트>` 한 줄씩. import는 기존 정렬(모듈 경로 알파벳순),
  키는 기존 Azure 키들(`azure-network-protection.ddos-protection`) 뒤에 개념 순서대로.
- **주제의 시각 요소 파일**: 주제를 만드는 step(1·6)이 `src/data/azure/visuals/<주제 id>.json`(`{ "diagrams": {}, "tables": {}, "glossary": [] }` 꼴)을 만들고
  `src/data/azure/index.ts`의 `visualsByTopicId`에 `'<주제 id>'`로 넣는다. import 이름은 `azureStorageVisuals`·`azureDataMovementVisuals`,
  import 줄은 경로 알파벳순, `visualsByTopicId`의 항목은 주제 순서대로.

### 도식 테스트 — 도식마다 먼저 쓰고 실패를 확인한 뒤 구현한다

`<이름>Diagram.test.tsx` — 선례와 같은 관문을 건다. 세로형은 `matchMedia` 없이, 가로형은 `describe('가로형 (768px 이상)', …)` 안에서만 `vi.stubGlobal('matchMedia', …)`.

1. 물음형 제목이 시나리오 버튼보다 앞에 보인다(헤딩이 아니다).
2. 처음(`전체`)에는 노드가 모두 선명하다. 시나리오에만 쓰이는 경로는 보이지 않는다(늘 보이는 연결선은 보인다).
3. 시나리오마다 선명한 노드 집합, 보이는 경로, 보이는 곁말, 캡션이 JSON·step 문서의 설계와 같다. 선택 밖 노드는 opacity `0.25`, 그룹 박스는 흐려지지 않는다.
4. 모든 `rect`가 `boxesOutsideViewBox`로 `viewBox` 안이고, 노드 라벨이 `estimateTextWidth(라벨, 10) + 12 <= 노드 폭`이다. 곁말·그룹 라벨은 `estimateTextWidth(문구, 9)`로 잰 가로 범위가 `viewBox` 안이다.
   그룹 박스 안의 그룹 박스는 안쪽이 바깥쪽 안에 들어 있다.
5. 경로의 끝점이 노드 변 위에 있고, 어떤 선분도 다른 노드 상자 안과 그룹 라벨 영역을 지나지 않는다.
6. **그 도식의 요점** — step 문서에 도식마다 적힌 「요점 테스트」.
7. 두 번 렌더해도 화살표 마커 id가 겹치지 않는다. JSON의 시나리오 id 집합과 컴포넌트의 것이 같고, 문구를 JSON에서 읽는다.
8. `ConceptList`에 앵커 개념을 주면 본문 뒤에 이 도식이 온다.
9. 가로형: `viewBox` 폭 440, 래퍼에 `w-full`이 있고 `max-w-[380px]`·`-mx-4`가 없다. 노드·그룹 id 집합과 경로 id 합집합이 세로형과 같고, 3~6번을 가로형에서도 통과한다. 폭이 바뀌어도 고른 시나리오와 캡션이 유지된다.

경로가 없는 도식은 경로에 관한 항목(2의 경로 부분, 5)을 「경로가 없다」로 바꿔 건다.

표 테스트(`azureStorageTables.test.tsx`·`azureDataMovementTables.test.tsx`)는 선례 `azureComputeTables.test.tsx`와 같은 것을 본다 — 로더·`glossary`, 이름·열·`columnWidths`·근거(`sources`), 행 순서와 칸 문구, `colgroup`, `ConceptList` 배치.

## 파일 형식

- `topics.json`: 주제 객체는 2칸 들여쓰기, `concepts` 배열의 개념은 **한 줄에 하나**(6칸 들여쓰기 + `JSON.stringify(concept)`). 개념 키 순서는 `id`, `parentId`(있을 때), `name`, `summary`, `paragraphs`.
  주제 키 순서는 `id`, `title`, `importance`, `sourcePages`, `concepts`. 앞 step이 쓴 줄과 다른 주제의 줄은 글자 하나도 바꾸지 않고, 자기 개념을 그 주제의 `concepts` 끝에 덧붙인다.
  주제를 만드는 step은 바로 앞 주제 객체의 닫는 줄 `  }`을 `  },`로 바꾸고 그 뒤에 새 주제를 덧붙인다 — 그 밖의 기존 줄은 바꾸지 않는다.
- `questions.json`: `[` 다음 줄부터 **한 줄에 문항 하나**, 마지막 줄 뒤에 `]`. 키 순서 — 4지선다 `id`, `topicId`, `conceptId`, `format`, `prompt`, `choices`, `answerIndex`, `explanation` /
  예/아니요 `id`, `topicId`, `conceptId`, `format`, `prompt`, `answer`, `explanation`. 기존 줄은 바꾸지 않고 끝에 덧붙인다(마지막 기존 줄 끝에 쉼표 하나를 더하는 것은 예외).
- 파일 끝 줄바꿈 하나. 스크립트로 쓸 때 CRLF로 바꾸지 않는다.
- 이 저장소의 TDD 훅은 테스트 파일 없이 새 `.js`·`.ts` 파일을 쓰지 못하게 막는다. 데이터를 고치는 일회용 스크립트가 필요하면 저장소 밖(임시 디렉터리)에 `.cjs`로 두거나 `node -e`를 쓴다.

## 개념을 넣는 step(1~4·6~7)의 공통 AC와 검증

```bash
npm run build
npm run lint
npm test
node phases/38-service-diagrams/tools/check-path-crossings.mjs
node scripts/check-verbatim.mjs --subject azure
node -e "const q=require('./src/data/azure/questions.json');const yn=q.filter(x=>x.format==='yes-no');const ch=q.filter(x=>x.format==='choice');const pos=[0,1,2,3].map(i=>ch.filter(x=>x.answerIndex===i).length);console.log('문항',q.length,'마지막',q[q.length-1].id,'정답 위치',pos.join('/'),'예',yn.filter(x=>x.answer).length,'아니요',yn.filter(x=>!x.answer).length)"
git status --porcelain
```

- `check-verbatim`은 「전사 이상 없음」이고 **원본 319개 이상을 대조했다고 나와야 한다**(`raw/`가 없으면 「건너뜀」으로 통과하므로 그때는 blocked로 멈춘다). 균형은 위 「문항」 9항,
  교차 검사기는 「교차 없음」이고 노드·경로 수가 이 step이 더한 만큼 늘어야 한다(앞 step이 끝났을 때의 수는 그 step summary에, phase 시작 값은 「배경」에 있다). **검사기를 고쳐서 통과시키지 마라.**
- **바뀌지 않아야 하는 것을 기계로 확인한다** — `git show HEAD:src/data/azure/topics.json`·`questions.json`과 `visuals/*.json`을 지금 파일과 node로 읽어, 기존 주제 객체·기존 개념·기존 문항·기존 도식 문구가 통째로 같은지 본다.
  AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `git diff --stat`에 나오지 않아야 한다.
- **글로 읽는다** — 그 주제의 개념을 처음부터 이 step의 개념까지 처음 배우는 사람의 눈으로 통독하고, 풀이 없이 처음 나오는 낱말을 세어 본다(도식 문구 포함). 진행 안내 문장이 없는지도 본다.
  불변식과 테스트는 이런 결함을 잡지 못한다. 브라우저 화면 실측은 하지 않는다(「배경」의 시간 제한 — phase 끝에 메인 세션이 한다).
- 이모지·O/X·빨강·초록·주황·도식 전용 두 색·16진 색·애니메이션·기준 폭 문자열이 새 파일에 없는지 `grep`으로 본다.
- 바뀐 파일은 `src/data/azure/topics.json`·`questions.json`·`visuals/<주제>.json`(과 주제를 만드는 step은 `src/data/azure/index.ts`), 새 도식 컴포넌트와 테스트(step 3·4·7은 표 컴포넌트와 테스트),
  `src/components/diagrams/registry.ts`, `docs/source/azure/official.md`(「쓰인 곳」과 더한 사실), phase 메타데이터뿐이어야 한다.

**summary에 적을 것**(사용자가 이것을 읽고 판단한다): 개념마다 id·name과 **새 요약문 전문**, 문항마다 id·개념·형식·고른 방식·**문제문 전문**·정답, 균형 줄(예/아니요·정답 위치),
도식마다 이름·두 배치의 `viewBox`·시나리오별 선명한 노드·경로·곁말과 캡션 요지·물음형 제목·요점 테스트, 설계 의도와 달라진 점과 이유,
`official.md`에 더한 사실, 교차 검사 결과 줄, 새 테스트 수와 전체 테스트 수, 걸린 시간의 어림. 끝에 「사용자 확인」 칸(없으면 「없음」).

## 출처 step(0·5)의 공통 형식

- `official.md` 항목: `## (phase 104) <문서 제목> — <단원·절 제목>`, URL 한 줄, 확인한 날, 직접 쓴 사실 한 줄씩(끝에 `— 「절 제목」`), **한국어 표기** 줄, 「쓰일 곳」(개념 id와 D·G 번호).
  앞 phase가 이미 둔 항목(예: 「(phase 100) Learn 「Describe Azure storage services」 — 4 Describe Azure storage services」)은 새 항목을 만들지 말고 그 항목에 사실 줄과 「쓰일 곳」을 덧붙인다 — 덧붙인 줄 끝에 `(phase 104)`.
  주제마다 「한국어 표기 정리 — `<주제 id>`」 항목을 하나 둔다(앞 phase의 항목이 본보기 — 개념마다 확정한 `name`과 근거 문서, 섞여 쓰인 표기와 고른 까닭).
- `corrections.md` 항목: `## D65 — <짧은 제목> (phase 104)`부터 덤프, `## G41 — … (phase 104)`부터 용어집. 짜임은 앞 phase 항목과 같다 — **덤프/용어집**(문항 번호·쪽-번호와 주장) · **공식 문서** · **처리**(고쳐 쓴다 / 한정해 쓴다 / 쓰지 않는다) · **쓰인 곳**.
  덤프 답이 공식 문서와 **맞는** 문항은 항목을 만들지 않는다 — summary에 「확인 결과 덤프가 맞다」로 적는다. 덤프끼리 답이 갈리는 문항은 항목으로 남긴다.
  D·G 번호는 앞 출처 step이 쓴 마지막 번호 다음부터 잇는다(step 5는 step 0의 마지막 번호 다음).
- 그림으로만 표시된 덤프 정답은 OCR 글자나 `index.json`의 `answer`를 믿지 말고 `raw/dump/img/`의 그림을 직접 본다(`docs/source/azure/CLAUDE.md` 「덤프의 그림을 보는 법」).
- **시간을 나눠 쓴다** — 주제 11은 덤프 문항이 약 25개다. 하나하나 끝까지 읽으면 30분을 넘길 수 있다(넘기면 step이 처음부터 다시 돈다).
  `dump-topics.tsv`의 `note`로 먼저 거르고, 공식 문서와 어긋날 수 있는 주장이 든 문항(수치, 옛 이름, 지원이 끝난 것, 덤프끼리 답이 갈림, 덤프에만 있는 낱말)은 문제문·보기·그림을 끝까지 읽는다.
  나머지는 덤프 답이 공식 문서와 맞는지만 확인한다. 받을 문서를 먼저 모두 받고, 확인 → 기록 순으로 한다.
- 공통 AC:

```bash
npm test
node scripts/check-verbatim.mjs --subject azure
git status --porcelain
git diff --stat
```

  `npm test`는 출처 step이 코드를 고치지 않았으므로 그대로 통과해야 한다. `check-verbatim`은 원본 수가 받은 문서만큼 늘어 있어야 한다.
  `official.md`·`corrections.md`의 한국어 문장이 `raw/official/ko-…`와 32자 넘게 겹치지 않는지 `node -e`로 `findVerbatimRuns`(`scripts/check-verbatim.mjs`가 export한다)에 두 파일의 문단을 넣어 본다.
- 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.
  인증서 오류(`CERTIFICATE_VERIFY_FAILED`)는 연결 문제가 아니다 — 「배경」대로 `SSL_CERT_FILE`을 붙여 다시 받는다.

## 모든 step의 공통 금지

- **출처 문서에 없는 사실을 쓰거나 그리지 마라.** 이유: 원본에 없는 내용을 지어내지 않는 것이 이 저장소의 규칙이다(루트 CLAUDE.md, ADR-036). 필요하면 확인해서 `official.md`에 먼저 더한다.
- **덤프·용어집·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009. `check-verbatim --subject azure`는 하한선일 뿐이다.
- **수정 이력(`corrections.md`)에 걸린 덤프·용어집의 주장을 그대로 가르치지 마라.** 이유: 틀린 사실을 학습자가 외우게 된다.
- **불변식 테스트·커버리지 테스트를 고치거나 예외를 더하지 마라.** 이유: 테스트가 실패하면 데이터를 고치거나 도식을 그린다(ADR-026). 진행 안내 가드 테스트도 마찬가지다 — 걸리면 문장을 고친다.
- **자기 step의 개념이 아닌 개념을 만들거나, 앞 step·앞 phase가 쓴 글·문항·도식을 고치지 마라.** 이유: 범위가 겹치면 사용자가 무엇이 어디서 바뀌었는지 따라갈 수 없다.
  고칠 것을 찾으면 고치지 말고 summary에 적는다.
- **AWS·네트워크 데이터와 그 테스트를 고치지 마라.** 기존 테스트를 깨뜨리지 마라.
- **브라우저 실측을 하지 마라.** 이유: step 시간 제한 30분(「배경」). 화면 확인은 phase 끝에 한꺼번에 한다.
- **`docs/source/azure/raw/` 아래 파일을 커밋하지 마라.** 이유: 덤프·용어집·공식 문서의 추출 전문이다(ADR-009). `.gitignore`가 막고 있는지 `git status`로 본다.
- **서비스마다의 SLA 수치, 가격, 지역 수·데이터 센터 수, 대역폭 수치를 본문·문항·도식에 쓰지 마라.** 이유: 약관 원문을 받아 확인할 수 없거나(SLA), 계속 바뀌는 수다(「배경」).
- **다른 주제의 몫(비용 요인과 전송 요금, 프라이빗 엔드포인트, VM의 리소스, Microsoft Entra ID)을 개념으로 세우거나 자세히 쓰지 마라.** 이유: 그 주제를 만드는 phase의 범위다. 필요한 낱말은 그 자리에서 한 줄로 푼다.
- **「배경」이 쓰지 않기로 한 것(내구성·RPO·SLA·용량 수치, Data Box 장치 용량, Data Lake Storage Gen2, 관리 디스크의 종류, 옛 계정 유형, 수명 주기 관리 정책, ISV 도구)을 쓰지 마라.** 이유: 학습 가이드의 줄에 없거나 문서끼리 어긋나는 수치라 개념을 흐린다.
