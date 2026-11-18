# Step 7: iis-logging-ftp

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 `windows-server-roles`의 개념 둘(11 IIS 로그, 12 FTP 서버)의 글·문항·도식을 함께 만든다.** 11은 7 「IIS 웹 서버」에 딸린 개념이고, 12는 홀로 선 개념이다.

기출은 IIS 로그 파일의 저장 위치를 바꿀 수 있다는 것(W3C만 지원·실시간 기록·오래된 로그 자동 삭제는 틀린 말 — [기출 2026-02-01 #45])과,
FTP 서버를 서버 관리자의 웹 서버(IIS) 역할 서비스로 설치한다는 것(서드파티 필요·IIS FTP로 SFTP 구성·PowerShell 설치 불가는 틀린 말 — [기출 2026-05-17 #44])을 묻는다.

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 4 `summary`(로그 형식·디렉터리·롤오버·자동 삭제·버퍼, FTP 역할 서비스·기능 이름·FTP 사이트 차례·FTPS·SFTP, 기출 판정, E 번호)와 step 1~6 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 1과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 0·4)」 항목), `docs/source/network/exam-notes.md`(phase 81이 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`windows-server-roles`의 앞 개념 열(step 1~6)**, 특히 `server-roles-features`(역할 서비스·`Install-WindowsFeature`)와 `iis`·`iis-site-bindings`·`iis-home-directory`. `app-protocols-mail-file.ftp`·`ftp-modes`·`ssh`, `app-protocols-mgmt-security.tls`, `windows-admin-tools.event-viewer`(로그라는 말의 뜻)
- `src/data/network/questions.json`, `src/data/network/visuals/windows-server-roles.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `FtpConnectionsDiagram`·`SshSessionDiagram`(FTP·SSH), `LoginRecordsDiagram`(로그), `RoleServiceFeatureDiagram`(step 1)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2026-02-01 #45], [기출 2026-05-17 #44] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-server-roles` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `windows-server-roles.iis-logging` | IIS 로그 | `windows-server-roles.iis` | **로그**(일어난 일을 차례로 적어 둔 기록 — 한 줄). IIS 로그가 적는 것(필드 몇 — step 4 결과대로), 형식 넷과 기본(step 4 결과대로), 디렉터리 기본값과 바꾸는 자리, 롤오버 선택지(step 4 결과대로). 자동 삭제·버퍼 쓰기는 step 4가 근거를 남긴 만큼만 — 근거가 없으면 쓰지 않는다(「자격시험은」 줄은 E가 있을 때만, E가 「공식 문서에서 확인하지 못했다」면 시험의 판정을 사실처럼 쓰지 않는다). **로그 형식과 롤오버**(4절). 예: 로그 디렉터리를 `D:\Logs`로 바꾸고 매일 새 파일을 연다(「예시 값」) |
| 12 | `windows-server-roles.ftp-server` | FTP 서버 | — | FTP 한 줄(`app-protocols-mail-file.ftp`와 뜻을 맞춘다). 웹 서버(IIS)의 FTP 서버 역할 서비스(step 4 결과대로 — `server-roles-features`의 역할 서비스 문장과 뜻을 맞춘다)와 두 설치 자리(마법사·`Install-WindowsFeature` — 기능 이름은 step 4 결과대로). IIS 관리자에서 FTP 사이트를 더하는 차례(step 4 결과대로 — 단계 이름은 출처가 보이는 만큼). FTPS와 SFTP(step 4 결과대로 — **SSH**(암호화한 원격 접속 통신 규칙) 한 줄, **TLS**(통신을 암호화하는 규칙) 한 줄). **FTPS와 SFTP가 무엇이 다른지**(4절). 예: `SRV01`에 FTP 사이트 `ftp.example.com`(실제 경로 `D:\Ftp`, 포트 `21`)을 만든다(「예시 값」) |

### 2. 문항 — `src/data/network/questions.json`에 `n296`~`n297`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n296` | `iis-logging` | 예/아니요 「개념 확인」 — **예** 쪽으로 세운다. 예: IIS 로그를 W3C 형식으로 남길 때, 한 줄에 기록할 필드를 관리자가 골라 정할 수 있나요?(예 — step 4 결과대로). 또는 step 4가 확인한 다른 사실로 **예**가 되는 주장(롤오버 일정 등). 기출 묶음(저장 위치 변경·W3C만·실시간·자동 삭제)의 문장을 주장으로 세우지 않는다. 해설은 형식 넷과 롤오버를 가르친다 |
| `n297` | `ftp-server` | 4지선다 「상황 적용」 — IIS의 FTP 서버로 파일 전송을 암호화하려는 관리자에게 어떤 방식이 맞는지(또는 IIS FTP 서버가 지원하는 보안 연결이 무엇인지) 고르게 한다. 정답 FTPS(FTP over SSL — step 4 결과의 이름), 오답은 같은 범주의 헷갈리는 것(SFTP — SSH 위의 다른 프로토콜, TFTP — 인증도 암호화도 없다(`app-protocols-mail-file.tftp`와 뜻을 맞춘다), FTP 수동 모드 — 연결 방향의 차이일 뿐 암호화가 아니다 등, step 4·앞 주제의 근거 안에서). **정답 위치 3**. 기출 묶음(역할 서비스·서드파티·SFTP·PowerShell 불가)과 범주가 다르다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 59·아니요 58, 정답 위치 45/45/45/45.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `iis-logging` — `IisLogRolloverDiagram`, JSON 키 `iis-log-rollover`

- 물음형 제목 예: `IIS는 요청 기록을 어디에, 언제 새 파일로 남길까?`
- 그릴 것: 요청 노드 → IIS(사이트) 노드 → 로그 디렉터리(그룹 박스 — 본문의 기본 디렉터리와 바꾼 `D:\Logs` 둘을 다른 자리에), 디렉터리 안의 로그 파일 노드(날마다 하나씩 — 이름 꼴은 본문이 쓴 것만, 이름을 지어내지 말고 「첫째 날 파일」·「둘째 날 파일」 같은 이름표).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `directory` | 저장 위치 | 요청·사이트·`D:\Logs` 박스 안 파일 노드와 그 경로, 기본 디렉터리는 흐림 | 로그 디렉터리는 기본값에서 다른 폴더로 바꿀 수 있다 |
  | `rollover` | 롤오버 | 날마다의 파일 노드 둘 | 정한 일정이 지나면 새 로그 파일을 연다(본문의 일정 이름) |

- 요점 테스트: `directory`에서 보이는 경로가 `D:\Logs` 쪽에 닿고 기본 디렉터리 쪽 파일 노드가 흐리다. `rollover`에서 선명한 파일 노드가 둘이고 서로 다른 id·다른 자리다.

#### 3-2. `ftp-server` — `IisFtpSiteDiagram`, JSON 키 `iis-ftp-site`

- 물음형 제목 예: `Windows Server에서 FTP 서버는 어디에 설치되고 어떻게 지킬까?`
- 그릴 것: 웹 서버(IIS) 역할 박스 안의 FTP 서버 역할 서비스 노드, 그 위의 FTP 사이트 `ftp.example.com`(포트 `21`, 실제 경로 `D:\Ftp` — 칸 줄), 클라이언트 노드와의 연결 둘 — FTPS(TLS로 암호화)와 SFTP(SSH — IIS FTP 서버 쪽에 닿지 않는 별개 프로토콜, 본문이 말하는 만큼).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `install` | 설치 자리 | 역할 박스·FTP 서버 역할 서비스·FTP 사이트 | FTP 서버는 웹 서버(IIS) 역할의 역할 서비스로 설치한다 |
  | `secure` | 보안 연결 | 클라이언트·FTPS 경로·FTP 사이트 | IIS의 FTP 서버는 TLS로 암호화한 FTPS를 쓴다 — SFTP는 SSH 위의 다른 프로토콜이다(본문의 말대로) |

- 요점 테스트: `secure`에서 보이는 경로가 클라이언트와 FTP 사이트를 FTPS로 잇고, SFTP 쪽 노드가 FTP 사이트로 잇는 경로가 어느 시나리오에서도 없다. `install`에서는 클라이언트 노드가 흐리다.

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. SFTP에 관한 문서의 말이 없어 본문이 「FTPS를 쓴다」만 말하면, SFTP 노드는 그리지 않고 FTPS만 그린다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 297개, 마지막 id는 `n297`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 1~6이 푼 낱말을 다시 풀지 않았는가. FTP·SSH·TLS에 관한 말이 앞 주제와 어긋나지 않는가.
3. n297의 보기 넷을 step 4와 앞 주제의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 7을 갱신한다(guide.md 「summary에 적을 것」 / error / blocked — step 1과 같은 규칙).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 13~23을 만들지 마라.** 이유: 다른 step의 범위다.
- **FTP 사용자 격리·FTP 방화벽 지원 설정·로그 필드 전체 목록을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 1~6의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
