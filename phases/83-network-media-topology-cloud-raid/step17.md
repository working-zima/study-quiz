# Step 17: raid-sources

## 배경

phase 83은 네트워크 과목의 `transmission-media`·`network-topology`·`cloud-sdn`·`raid-storage`를 만든다. 전체 계획과 결정은 `phases/83-network-media-topology-cloud-raid/guide.md`에 있다.
step 18~20이 `raid-storage`의 개념 5개(RAID, RAID 0, RAID 1, RAID 5, DAS·NAS·SAN)를 쓰기 전에,
**이 step은 그 개념들이 쓸 사실을 허용한 출처로 확인하고 출처 문서에 남긴다.** 데이터·코드는 고치지 않는다.

이 주제의 사실은 SNIA(사전·DDF 사양·기술 문서)와 IETF RFC(iSCSI), learn.microsoft.com(Windows Server의 iSCSI 대상 서버 — 필요한 것만)에서 가져온다(ADR-059). 기출 9문항이 모두 이 step의 개념에 걸린다 —
RAID의 특징([기출 2024-08-25 #47]·[기출 2025-02-23 #50]), RAID 0([기출 2025-05-25 #46], 지문 누락 [기출 2024-05-19 #49]·[기출 2025-11-02 #46]), RAID 1([기출 2024-02-25 #46]·[기출 2026-05-17 #46]), RAID 5([기출 2025-08-24 #46]), SAN([기출 2025-05-25 #37] 조건 누락).

## 읽어야 할 파일

- guide.md 「출처 step(0·3·7·12·17)의 공통」이 적은 파일 전부 — 특히 「배경」, 「네 주제와 개념 30개」의 `raid-storage` 표, 「예시 값」, 「출처」
- `phases/83-network-media-topology-cloud-raid/index.json`의 앞 출처 step `summary`와 `docs/source/network/exam-notes.md`에 phase 83이 더한 문단·E 항목(다음 E 번호를 이어 쓴다)
- `docs/source/network/standards.md`의 기존 항목 가운데 디스크·파티션(phase 75 — man7.org), Hyper-V의 가상 하드 디스크·저장소(phase 81), 파일 서버(phase 81 — 파일 및 스토리지 서비스) — **있는 사실을 다시 찾지 않는다**
- `src/data/network/topics.json`의 `linux-filesystem.partition`·`disk-device-names`·`filesystem-mount`, `windows-hyperv.virtual-machines`, `windows-server-roles.file-print-services` — 뜻을 맞춘다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳: SNIA(`snia.org/education/dictionary` — SNIA Dictionary의 RAID·disk array·striping·mirroring·parity·RAID 0·1·4·5·hot swap·rebuild·concatenation·DAS·NAS·SAN·block·file 항목, `snia.org/tech_activities/standards/curr_standards/ddf` — Common RAID Disk Data Format(DDF) 사양의 RAID 레벨 정의(RAID-0·1·4·5와 패리티가 놓이는 차례 — 그림·표가 있으면 그 모양), SNIA의 기술 문서·교육 자료 가운데 공식 문서인 것),
IETF RFC(RFC 7143 — iSCSI의 뜻: IP 네트워크로 SCSI를 나른다, 필요하면 RFC 3720(대체됨)의 판 관계), learn.microsoft.com(Windows Server의 iSCSI 대상 서버 개요 — 근거가 필요할 때만, ko-kr 판의 이름).
**판을 적는다** — SNIA 사전은 판(해)·확인한 날, DDF는 판 번호(예: 2.0 rev 19)와 해, RFC는 번호와 고친 RFC. 응답이 느리면 `curl -4`로 다시 받는다.
**한국어 이름**: RAID·디스크 배열·논리 디스크·스트라이핑·스트라이프·미러링·패리티·분산(회전) 패리티·핫 스왑·재구축·연결(concatenation)·DAS·NAS·SAN·블록·파일·파이버 채널·iSCSI를 정하고 고른 까닭을 적는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `raid` | **RAID**의 뜻과 이름의 풀이(independent·inexpensive — SNIA의 말), 물리 디스크 여럿을 논리 디스크 하나처럼 보이게 한다는 것, 스트라이핑·미러링·패리티의 뜻(한 줄씩), RAID 레벨이라는 말, **핫 스왑**·**재구축**(SNIA의 말), RAID가 백업을 대신하지 않는다는 근거(있으면). **[기출 2024-08-25 #47]**(「메모리 용량 증가」가 틀린 말 — 시험이 맞는 말로 두는 셋: 여러 디스크에 일부 중복된 데이터를 나눠 둔다·읽기와 쓰기가 빨라진다·데이터를 안전하게 백업)과 **[기출 2025-02-23 #50]**(「여러 논리 드라이브를 하나의 물리 드라이브로」가 틀린 말 — 시험이 맞는 말로 두는 셋: 병렬 전송으로 빨라진다·같은 데이터를 다른 위치에 중복 저장·가동 중에 디스크를 바꾼다)이 문서와 맞는지 — 특히 「안전하게 백업」을 문서가 RAID의 일로 보는지(아니면 E 항목) | SNIA Dictionary, DDF 사양 |
| b | `raid-0` | **RAID 0**(스트라이핑만, 중복 없음 — SNIA의 말), 디스크 최소 수, 용량(합), 하나만 고장 나도 전체를 잃는다는 근거, **연결(concatenation)**·「Linear」라는 이름이 SNIA에 있는지(있으면 RAID 0과 무엇이 다른지). **[기출 2025-05-25 #46]**(「하나만 손상돼도 복구된다」가 틀린 말 — 시험이 맞는 말로 두는 셋: 최소 2개·속도 향상·스트라이핑), 지문 누락 둘(보기만)이 문서와 맞는지 | SNIA Dictionary, DDF 사양 |
| c | `raid-1` | **RAID 1**(미러링 — SNIA의 말), 용량(디스크 하나만큼), 한 디스크가 고장 나도 계속 쓴다, 읽기 성능·쓰기 부담(문서의 말이 있는 만큼). **[기출 2024-02-25 #46]·[기출 2026-05-17 #46]**(미러링 = RAID 1, 「최고의 성능과 고장 대비 능력」이라는 시험의 말 — 문서와 다르면 E 항목)이 문서와 맞는지 | SNIA Dictionary, DDF 사양 |
| d | `raid-5` | **패리티**와 그것으로 잃은 조각을 다시 계산하는 원리(XOR — 문서의 말이 있으면), **RAID 5**(패리티를 모든 디스크에 돌아가며 둔다 — SNIA의 이름 「rotating parity」·「distributed parity」 가운데 무엇인지), **RAID 4**(패리티 디스크 하나 — 그 디스크가 병목이 된다는 근거), RAID 2·3이 무엇인지(한 줄 — 근거가 있으면), 디스크 최소 수, 용량(n−1), 하나의 고장은 견디고 둘이면 잃는다, DDF가 보이는 패리티의 놓이는 차례(그림·표). **[기출 2025-08-24 #46]**(회전 패리티로 병목을 줄인다 = RAID 5 — 오답 RAID 2·3·4)이 문서와 맞는지 | SNIA Dictionary, DDF 사양 |
| e | `network-storage` | **DAS**·**NAS**·**SAN**의 뜻(SNIA의 말), **파일 단위**와 **블록 단위** 접근의 차이, SAN이 서버와 저장 장치만 잇는 네트워크라는 것, **파이버 채널**(한 줄)과 **iSCSI**(RFC 7143 — IP 네트워크로 SCSI 명령을 나른다), Windows Server의 iSCSI 대상 서버(learn.microsoft.com — 필요할 때만, ko-kr 이름). **[기출 2025-05-25 #37]**(조건 누락 — 보기 NAS·SAN·RAID·SSD와 정답 SAN만 본다) | SNIA Dictionary, RFC 7143, learn.microsoft.com |

빠진 것을 읽다가 찾으면 더한다. **RAID 2·3·4·6·10의 세부, 하드웨어·소프트웨어 RAID의 구현 차이, SAN의 파이버 채널 계층, NAS의 파일 공유 프로토콜 세부(SMB·NFS의 메시지)는 확인하지 않는다**(guide.md 「배경」).

### 2. `docs/source/network/standards.md`·`exam-notes.md`

guide.md 「출처 step의 공통」의 꼴대로 더한다. `exam-notes.md`는 앞 출처 step들의 문단 뒤에 이 step의 문단을 잇고, E 번호는 앞 출처 step이 쓴 다음 번호부터.

### 3. summary — 뒤 step이 이것을 보고 쓴다

`raid-storage`의 개념 1~5마다 한 줄씩(guide.md 「출처 step의 공통」의 summary 꼴). 특히 다음을 개념 step이 그대로 쓸 수 있게 적는다.
- RAID의 뜻과 이름 풀이, 논리 디스크, 세 방법, 핫 스왑·재구축, 백업과의 관계.
- 레벨마다(0·1·4·5) 무엇을 하는지·디스크 최소 수·용량 공식·견디는 고장 수(표로), 연결(Linear)을 쓸 수 있는지, 패리티의 놓이는 차례(DDF 그림의 모양).
- 패리티로 다시 계산하는 원리를 어디까지 쓸 수 있는지(XOR의 근거).
- DAS·NAS·SAN·파일·블록·파이버 채널·iSCSI.
- 기출 판정 줄 아홉(지문·조건 누락 셋은 보기만).
끝에 「사용자 확인」 칸 — 없으면 「없음」.

## Acceptance Criteria

guide.md 「출처 step의 공통」의 AC(`npm test`, `git status --porcelain`, `git diff --stat`).

## 검증 절차

guide.md 「출처 step의 공통」의 검증 절차대로 하고 `phases/83-network-media-topology-cloud-raid/index.json`의 step 17을 갱신한다.

## 금지사항

guide.md 「출처 step의 공통」의 금지와 「모든 step의 공통 금지」를 따른다. 그에 더해:

- **디스크·저장 장치 업체의 문서·상품 페이지를 근거로 쓰지 마라.** 이유: 허용 목록 밖이다. RAID의 사실은 SNIA에서 가져온다.
- **앞 세 주제를 정리하지 마라.** 이유: 범위가 겹치면 뒤 step이 무엇을 근거로 쓸지 흐려진다.
