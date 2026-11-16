# Step 12: certificate-efs

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다. 전체 계획·결정·공통 규칙은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
**이 step은 `windows-admin-tools`의 개념 둘(19 인증서와 인증서 관리자, 20 EFS)의 글·문항·도식을 만든다.** 둘 다 머리 개념이다.
EFS는 사용자의 인증서와 개인 키로 파일을 암호화하므로, 인증서와 그 파일 형식을 먼저 세우고 EFS가 그것을 쓰는 쪽으로 이어 쓴다.

기출은 장애에 대비해 백업해 둔 인증서 키를 복원하려 실행 창에서 인증서 관리자를 여는 명령으로 `certmgr.msc`를 고르게 하고([기출 2024-08-25 #37]),
EFS에 대한 맞는 설명으로 「EFS는 인증서 파일 확장자로 CER·P7B·PFX·SST 형식을 지원한다」를 고르게 한다 — 오답은 Windows 시스템의 파일에만 암호화를 적용한다, 개인 키를 보호하는 방법으로 암호만 쓸 수 있다,
사용자만 같으면 Windows를 다시 설치해도 암호화된 파일을 열 수 있다이다([기출 2024-02-25 #39]).

## 읽어야 할 파일

- **`phases/80-network-windows-ad-tools/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/80-network-windows-ad-tools/index.json`의 step 8 `summary`(인증서 관리자·파일 형식 표, EFS의 켜는 자리·백업 방법·DRA·스마트 카드·암호화할 수 없는 파일, EFS 기출의 판정과 E 번호, 한국어 이름)와 step 11 `summary`의 「앞 개념에 고칠 것」·문항 균형
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 80 step 8)」 줄과 항목, phase 78의 TLS·인증서 항목), `docs/source/network/exam-notes.md`(step 8이 더한 항목 — 특히 EFS의 인증서 형식)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 9~11이 쓴 `windows-admin-tools` 여섯 개념** — 특히 `mmc-run-commands`의 인증서 관리자 항목, `app-protocols-mgmt-security.tls`의 인증서·공개 키·개인 키 — 뜻을 맞춘다. 다른 주제라 이 주제 화면에서 다시 푼다),
  `src/data/network/questions.json`, `src/data/network/visuals/windows-admin-tools.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 9~11이 만든 도식과 그 테스트, 선례 `ChmodChangeDiagram`(설정 전과 뒤)·`FstabFieldsDiagram`(칸)과 그 테스트, phase 78의 TLS 도식(인증서 그림말 — 같은 말을 쓴다), `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-08-25 #37], [기출 2024-02-25 #39] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-admin-tools` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 19 | `windows-admin-tools.certificate-manager` | 인증서와 인증서 관리자 | — | **인증서**(공개 키와 그 주인의 정보를 인증 기관이 보증한 전자 문서)와 짝인 **개인 키**(주인만 갖는 비밀 키), **공개 키**(누구에게나 알려도 되는 키)를 이 화면에서 한 줄씩 푼다(`app-protocols-mgmt-security.tls`와 뜻을 맞춘다 — 그 주제를 가리키지 않는다). **인증서 관리자**(`certmgr.msc` — 지금 로그온한 사용자의 인증서를 보는 도구, 컴퓨터의 인증서를 보는 도구는 step 8 결과대로 한 줄). 인증서를 파일로 **내보내고 가져오는** 일 — 백업과 복원, 다른 컴퓨터로 옮기기(step 8 결과대로). 파일 형식(step 8의 표대로 — 형식 이름이 이름이라 목록으로 쓰면 「글」의 항목 이름 규칙 (2), 목록으로 쓰지 않으면 문단에서): `.cer`(인증서 하나), `.p7b`(인증서 여럿), `.pfx`(인증서와 **개인 키**까지 — 암호로 보호), `.sst`(인증서 저장소). **개인 키를 담는 형식과 담지 않는 형식이 무엇이 다른지**(4절 — 개인 키 없이는 그 키로 암호화한 것을 열 수 없다는 것은 「EFS」와 뜻을 맞춘다). 예: `user01`의 인증서를 개인 키와 함께 `user01.pfx`로 내보내 두면, 컴퓨터를 바꾼 뒤 가져와 다시 쓸 수 있다(「예시 값」). EFS 기출 정답(인증서 파일 형식)의 「자격시험은」 줄이 필요하면 step 8의 E 번호 처리대로 — 이 개념과 `efs` 가운데 처리가 정한 곳에 둔다 |
| 20 | `windows-admin-tools.efs` | EFS | — | **EFS**(Encrypting File System, 암호화 파일 시스템)가 **NTFS**(Windows가 디스크에 파일을 저장하는 방식 — 한 줄) 볼륨의 파일·폴더를 사용자마다 **암호화**(키가 있어야 읽을 수 있게 바꾸는 것 — 한 줄)하는 기능이라는 것(step 8 결과대로). 따라 할 차례 — 파일 속성에서 내용을 암호화하도록 고른다(메뉴 이름은 step 8이 확인한 만큼). 그 사용자의 인증서와 개인 키로 암호화하고 열기 때문에 같은 컴퓨터의 다른 사용자는 열 수 없다(step 8 결과대로). **키를 잃으면 열 수 없다** — Windows를 다시 설치하면 같은 이름의 계정을 만들어도 다른 키라 열리지 않는다 → 인증서와 개인 키를 `.pfx`로 백업해 둔다(`certificate-manager`와 뜻을 맞춘다, `cipher` 명령의 백업 옵션은 step 8 결과대로 한 줄). 복구 에이전트(DRA)는 step 8 결과대로 한 줄. 개인 키를 스마트 카드에 둘 수 있다는 것은 step 8 결과대로 한 줄. 암호화할 수 없는 파일은 step 8 결과대로 한 줄. 예: `user01`이 `D:\Data\report.docx`를 암호화하면 같은 컴퓨터의 다른 계정으로는 열리지 않고, `user01.pfx`를 백업해 두지 않은 채 Windows를 다시 설치하면 `user01`도 열 수 없다(「예시 값」 — 단계대로). 드라이브 전체를 암호화하는 BitLocker와 무엇이 다른지는 한 줄(4절의 짝은 「BitLocker 드라이브 암호화」가 말한다는 말은 쓰지 않는다) |

### 2. 문항 — `src/data/network/questions.json`에 `n280`~`n281`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n280` | `certificate-manager` | 4지선다 「상황 적용」 — 본문과 다른 장면(예: 직원 `user07`이 EFS로 암호화한 파일을 쓰고 있다. 노트북을 바꾸기 전에 새 노트북에서도 그 파일을 열 수 있게 인증서를 파일로 내보내려 한다)을 주고 알맞은 파일 형식을 고르게 한다. 정답 `.pfx`(개인 키까지 담는다), 오답 `.cer`·`.p7b`·`.sst`(개인 키를 담지 않는다 — step 8의 표로 각각 따진다). 문항 글에는 백틱 없이 쓴다. 기출 EFS 문항의 보기 묶음을 쓰지 않는다 — 형식 넷을 보기로 두는 것은 기출 보기(설명 문장 넷)와 범주가 다르다. **정답 위치 2** |
| `n281` | `efs` | 예/아니요 「원인과 결과」 — 시작 때 균형(예 55·아니요 54)에서 **아니요** 쪽으로 세운다. 예: `user07`이 EFS로 암호화한 파일을, 같은 컴퓨터에 로그온한 다른 사용자 `user08`이 그대로 열 수 있나요?(아니요 — 사용자의 인증서와 개인 키로 암호화한다, step 8 결과대로). 해설은 EFS의 키, 백업(`.pfx`)과 재설치 때의 일을 가르친다. 기출 오답의 문장(재설치해도 열 수 있다)을 그대로 쓰지 않는다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 55·아니요 55, 정답 위치 43/43/43/42.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `windows-admin-tools.certificate-manager` — `CertificateFilesDiagram`, JSON 키 `certificate-files`

- 물음형 제목 예: `인증서를 내보낼 때 어느 파일에 개인 키까지 담길까?`
- 그릴 것: 인증서 관리자(그룹 박스 — `user01`의 인증서와 개인 키 노드), 내보내기 경로, 파일 형식 노드 넷(`.cer`·`.p7b`·`.pfx`·`.sst`)과 각 형식이 담는 것(곁말 — 본문의 말). 개인 키 경로는 `.pfx`로만 간다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `cert-only` | 인증서만 | 인증서와 `.cer`·`.p7b`·`.sst`, 그 경로 | 이 형식들은 인증서를 담고 개인 키는 담지 않는다(본문의 말) |
  | `with-key` | 개인 키까지 | 인증서·개인 키와 `.pfx`, 그 경로 | `.pfx`는 개인 키까지 담고 암호로 보호한다 |

- 요점 테스트: 개인 키 노드에서 나가는 경로가 `.pfx` 노드에서만 끝난다(다른 형식으로 가는 개인 키 경로가 없다). `cert-only`에서 개인 키 노드와 `.pfx`는 흐리다.

#### 3-2. `windows-admin-tools.efs` — `EfsKeyBackupDiagram`, JSON 키 `efs-key-backup`

- 물음형 제목 예: `EFS로 암호화한 파일은 누가 열 수 있을까?`
- 그릴 것: 파일 `D:\Data\report.docx`(노드 — 반각 문자가 많아 폭을 넉넉히), `user01`과 그 인증서·개인 키, 같은 컴퓨터의 다른 사용자(이름표), 백업 파일 `user01.pfx`, Windows를 다시 설치한 뒤의 새 계정(이름표 — 본문의 말).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `owner` | 주인 | `user01`·개인 키·파일과 그 경로 | 암호화한 사용자는 자기 개인 키로 연다 |
  | `other-user` | 다른 사용자 | 다른 사용자와 파일(경로 없음, 곁말 「열 수 없음」) | 같은 컴퓨터라도 다른 사용자는 열 수 없다 |
  | `reinstall` | 다시 설치 | 새 계정·`user01.pfx`·파일과 그 경로 | 다시 설치한 뒤에는 백업해 둔 `.pfx`를 가져와야 열 수 있다 |

  복구 에이전트를 본문에 썼어도 도식에 넣는 것은 선택이다 — 넣으면 시나리오를 더한다.
- 요점 테스트: `other-user`에서 다른 사용자 노드에서 파일 노드로 가는 경로가 보이지 않는다. `reinstall`에서 보이는 경로가 `user01.pfx` 노드를 거쳐 파일에 닿는다. 색·자물쇠 그림으로 암호화를 가르지 않는다(곁말로).

위 도식 설계는 출발점이다. 본문(step 8 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~7, 9~13)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 281개, 마지막 id는 `n281`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. step 8 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 인증서·개인 키의 말이 `app-protocols-mgmt-security.tls`와 어긋나지 않는가.
3. n280의 보기 넷을 step 8의 형식 표로 하나씩 따져 정답이 하나뿐인지 본다. Windows 경로가 JSON에서 `\\`로 적혀 화면에 `\` 하나로 보이는지 `node -e`로 확인한다.
4. `phases/80-network-windows-ad-tools/index.json`의 step 12를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 21~22를 만들지 마라.** 이유: step 13의 범위다. BitLocker는 한 줄로 그친다.
- **step 9~11의 개념·문항·도식과 `windows-ad` 주제를 고치지 마라.** 이유: 다른 step의 범위다. 어긋남을 찾으면 summary에 적는다.
- **인증 기관(AD CS) 구축, 인증서 템플릿, 인증서 경로 검증, EFS의 암호화 알고리즘·키 길이를 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **step 8이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
