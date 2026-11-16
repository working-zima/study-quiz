# Step 13: bitlocker-work-folders

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다. 전체 계획·결정·공통 규칙은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
**이 step은 `windows-admin-tools`의 마지막 개념 둘(21 BitLocker 드라이브 암호화, 22 클라우드 폴더)의 글·문항·도식을 만들고, 이 주제와 phase의 개념 쓰기를 끝낸다.** 둘 다 머리 개념이다.
쓰기를 마친 뒤 주제 전체(10개념)를 통독하는 데 시간을 쓴다.

기출은 하드디스크를 도난당해도 암호화 키 없이는 데이터를 읽지 못하도록 하드디스크 자체를 암호화하는 기술로 BitLocker를 고르게 하고(오답 EFS·AD·FileVault — [기출 2024-08-25 #28]),
더 많은 위치와 더 다양한 장치에서 데이터에 접근하게 하는 Windows Server의 서비스로 클라우드 폴더를 고르게 한다(오답 서버 코어·VPN·DirectAccess Server — [기출 2024-02-25 #43]).

## 읽어야 할 파일

- **`phases/80-network-windows-ad-tools/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/80-network-windows-ad-tools/index.json`의 step 8 `summary`(BitLocker의 TPM·복구 키·To Go·설치, EFS와의 차이 근거, 클라우드 폴더의 한국어 이름·동기화 공유·오프라인·정책·OneDrive와의 차이·지원 상태, E 번호)와 step 9~12 `summary`(「앞 개념에 고칠 것」·문항 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 80 step 8)」 줄과 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 9~12가 쓴 `windows-admin-tools` 여덟 개념** — 특히 `efs`의 암호화·NTFS·개인 키, `certificate-manager`의 `.pfx` — 뜻을 맞춘다),
  `src/data/network/questions.json`, `src/data/network/visuals/windows-admin-tools.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 9~12가 만든 도식과 그 테스트(특히 `EfsKeyBackupDiagram` — 같은 그림말을 쓴다), `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-08-25 #28], [기출 2024-02-25 #43] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-admin-tools` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 21 | `windows-admin-tools.bitlocker` | BitLocker 드라이브 암호화 | — | **BitLocker**가 **볼륨**(드라이브 — 디스크에서 하나의 드라이브 문자로 보이는 영역, 한 줄) 전체를 암호화해, 디스크를 떼어 다른 컴퓨터에 붙여도 키 없이는 읽을 수 없게 하는 기능이라는 것(step 8 결과대로). **TPM**(컴퓨터 안에 붙은 보안 칩 — 한 줄)과 함께 쓰는 방식(step 8 결과대로 한 줄), 키를 잃거나 하드웨어가 바뀌었을 때 쓰는 **복구 키**(꼴은 step 8 결과대로 — 따로 안전하게 보관한다), 이동식 드라이브의 BitLocker To Go(step 8 결과대로 한 줄). Windows Server에서는 기능으로 설치한다는 것은 step 8 결과대로 한 줄. **BitLocker와 EFS가 무엇이 다른지**(4절 — 드라이브 전체와 파일 하나하나, 막으려는 일(디스크를 잃거나 도둑맞을 때와 같은 컴퓨터의 다른 사용자), 함께 쓸 수 있는지는 step 8 결과대로 — `efs`의 말과 뜻을 맞춘다). 예: 서버의 데이터 드라이브 `D:`를 BitLocker로 암호화하면, 누가 그 디스크를 떼어 다른 컴퓨터에 붙여도 키 없이는 `D:`의 파일을 읽을 수 없다(「예시 값」) |
| 22 | `windows-admin-tools.work-folders` | 클라우드 폴더 | — | **클라우드 폴더**(Work Folders — 한국어 이름은 step 8이 고른 대로, 영문 이름을 함께)가 파일 서버의 역할 서비스로, 사용자가 회사 PC와 개인 기기에서 업무 파일을 쓰게 하는 기능이라는 것(step 8 결과대로). **파일 서버**(파일을 저장해 여러 사람이 쓰게 하는 서버 — 한 줄)의 **동기화 공유**에 파일을 두고 기기와 **동기화**(양쪽의 파일을 같은 내용으로 맞추는 것 — 한 줄)한다, 연결이 끊긴 동안 기기에서 고친 파일은 다시 연결되면 동기화한다, 기기에 암호화와 잠금 화면 암호를 요구하는 정책을 걸 수 있다(step 8 결과대로). 설치하는 자리(파일 및 저장소 서비스 아래 — step 8 결과대로 한 줄). **클라우드 폴더와 OneDrive가 무엇이 다른지**(4절 — 이름에 「클라우드」가 붙었지만 파일은 회사의 파일 서버에 있고, OneDrive는 Microsoft의 클라우드 서비스에 둔다 — step 8 결과대로). 지원 상태는 step 8 결과대로 한 줄. 예: 동기화 공유 `D:\SyncShare`에 둔 업무 파일을 회사 PC와 개인 노트북에서 함께 쓴다(「예시 값」) |

쓰기를 마친 뒤 **주제 `windows-admin-tools`의 열 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이, `windows-ad` 주제와 뜻이 어긋나는 곳 — `gpedit.msc`·로컬 그룹 이름 등)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다.

### 2. 문항 — `src/data/network/questions.json`에 `n282`~`n283`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n282` | `bitlocker` | 4지선다 「개념 비교」 — 본문과 다른 장면(예: 출장용 노트북을 잃어버려도, 디스크를 떼어 다른 컴퓨터에 붙인 사람이 그 안의 어떤 파일도 읽지 못하게 드라이브 전체를 보호하고 싶다)을 주고 알맞은 기능을 고르게 한다. 정답 BitLocker. 오답은 같은 범주에서 헷갈리는 것 — EFS(파일마다 고른 것만 암호화 — 문제문의 「드라이브 전체」에 어긋난다), 클라우드 폴더(동기화 — 기기 암호화 정책을 걸 수는 있어도 드라이브 암호화 기능 자체는 아니다 — step 8 결과로 따진다), 계정 잠금 정책(로그온 시도를 막을 뿐 디스크를 떼어 가면 소용없다) 등. 기출 묶음(BitLocker·EFS·AD·FileVault)과 넷 가운데 둘 이상이 다르게 한다. **정답 위치 3** |
| `n283` | `work-folders` | 예/아니요 「원인과 결과」 — 시작 때 균형(예 55·아니요 55)에서 **예** 쪽으로 세운다. 예: 클라우드 폴더를 쓰는 노트북에서 인터넷 연결이 끊긴 동안 고친 업무 파일은, 다시 연결되면 회사 파일 서버와 동기화되나요?(예 — step 8 결과대로). 해설은 파일의 원본이 회사 파일 서버의 동기화 공유에 있다는 것과 OneDrive와의 차이를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 56·아니요 55, 정답 위치 43/43/43/43.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `windows-admin-tools.bitlocker` — `BitLockerVolumeDiagram`, JSON 키 `bitlocker-volume`

- 물음형 제목 예: `디스크를 떼어 가면 BitLocker로 암호화한 데이터는 어떻게 될까?`
- 그릴 것: 서버(그룹 박스 — TPM 노드와 드라이브 `D:` 노드), 디스크를 떼어 붙인 다른 컴퓨터(그룹 박스 — 이름표), 복구 키 노드, 비교용 EFS 노드(파일 하나 — 본문의 말).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `normal` | 이 서버에서 | TPM·`D:`와 그 경로 | 이 서버에서는 TPM과 함께 드라이브를 그대로 쓴다(본문의 말) |
  | `stolen` | 떼어 갔을 때 | 다른 컴퓨터와 `D:`(경로 없음, 곁말 「읽을 수 없음」) | 디스크를 다른 컴퓨터에 붙여도 키 없이는 읽을 수 없다 |
  | `recovery` | 복구 키 | 복구 키와 `D:`, 그 경로 | 키를 쓸 수 없을 때는 따로 보관한 복구 키로 연다 |
  | `vs-efs` | EFS와 | `D:`와 EFS 노드 | BitLocker는 드라이브 전체를, EFS는 고른 파일을 암호화한다 |

  TPM이나 복구 키를 본문에 쓰지 않았으면 그 시나리오를 뺀다.
- 요점 테스트: `stolen`에서 다른 컴퓨터 쪽 노드에서 `D:`로 가는 경로가 보이지 않는다. `recovery`에서 보이는 경로가 복구 키 노드에서 시작해 `D:`에서 끝난다. 색·자물쇠 그림으로 암호화를 가르지 않는다(곁말로).

#### 3-2. `windows-admin-tools.work-folders` — `WorkFoldersSyncDiagram`, JSON 키 `work-folders-sync`

- 물음형 제목 예: `클라우드 폴더의 파일은 어디에 있고 어떻게 맞춰질까?`
- 그릴 것: 회사 파일 서버(그룹 박스 — 동기화 공유 `D:\SyncShare` 노드), 회사 PC, 개인 노트북(이름표), 동기화 경로(서버와 각 기기 사이), 비교용 OneDrive 노드(이름표 — 본문의 말, 동기화 공유와 잇지 않는다).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `sync` | 동기화 | 동기화 공유·회사 PC·개인 노트북과 동기화 경로 | 파일은 회사 파일 서버의 동기화 공유에 있고 기기들과 같은 내용으로 맞춰진다 |
  | `offline` | 끊겼을 때 | 개인 노트북(곁말 「연결 끊김 — 기기에서 고침」)과 다시 이어진 동기화 경로 | 연결이 끊긴 동안 고친 파일은 다시 연결되면 동기화한다 |
  | `policy` | 기기 정책 | 동기화 공유와 기기들(곁말 「암호화·잠금 화면 암호」) | 기기에 암호화와 잠금 화면 암호를 요구할 수 있다 |
  | `vs-onedrive` | OneDrive와 | 동기화 공유와 OneDrive 노드 | 이름에 클라우드가 붙었지만 파일은 회사 서버에 있다 |

  본문에 쓰지 않은 사실의 시나리오는 뺀다.
- 요점 테스트: `sync`에서 보이는 동기화 경로가 모두 한쪽 끝을 동기화 공유 노드에 둔다. 어느 시나리오에서도 OneDrive 노드에 닿는 경로가 없다.

위 도식 설계는 출발점이다. 본문(step 8 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~7, 9~13)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 283개, 마지막 id는 `n283`이다. 균형은 예 56·아니요 55, 정답 위치 43/43/43/43이어야 한다(계획과 다르면 어느 step에서 달라졌는지 summary에 적는다).

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 8 summary가 「쓰지 않는다」로 정한 것(BitLocker 보호기 전체·설정 절차, 클라우드 폴더 배포 절차)을 지켰는가. EFS와 BitLocker의 차이를 `efs`와 같은 말로 쓰는가.
3. n282의 보기 넷을 하나씩 「이 기능으로 문제문의 조건(드라이브 전체, 떼어 간 디스크)이 되는가」로 따져 정답이 하나뿐인지 본다.
4. 주제 `windows-admin-tools`의 열 개념을 통독한다(「작업」 1). 도식 열 개의 문구도 함께 읽는다.
5. phase 전체로 — 두 주제의 개념 22개·문항 28개(`n256`~`n283`)·도식 22개가 모두 들어갔는지, `topics.json`의 주제 차례(`windows-ad`가 `linux-servers` 뒤, `windows-admin-tools`가 `windows-ad` 뒤 — 맨 끝)와 registry·`visualsByTopicId`의 자리를 다시 본다.
6. `phases/80-network-windows-ad-tools/index.json`의 step 13을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(「앞 개념에 고칠 것」에 통독 결과).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **step 9~12의 개념·문항·도식과 `windows-ad` 주제를 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
- **BitLocker의 보호기 종류 전체·설정 절차·암호화 방식, 클라우드 폴더의 배포 절차·AD FS·웹 응용 프로그램 프록시, OneDrive의 기능을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **FileVault처럼 Microsoft 문서로 확인할 수 없는 다른 회사의 제품을 쓰지 마라.** 이유: 허용한 출처 밖이다(ADR-059).
- **step 8이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
