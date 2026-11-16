# Step 11: resmon-powershell

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다. 전체 계획·결정·공통 규칙은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
**이 step은 `windows-admin-tools`의 개념 둘(17 리소스 모니터, 18 PowerShell)의 글·문항·도식을 만든다.** 17은 16(성능 모니터)에 딸린 개념이고, 18은 머리 개념이다.

기출은 리소스 모니터에서 점검할 수 없는 것으로 방화벽을 고르게 하고(맞는 쪽 CPU·메모리·네트워크 — [기출 2024-11-03 #36]), CPU·메모리·네트워크·디스크 사용량을 실시간으로 보기에 알맞은 도구로 리소스 모니터를 고르게 한다
(오답 Server Manager·System Hardware Monitor·Event Viewer — [기출 2026-02-01 #42]). PowerShell은 「기존 DOS 명령은 쓸 수 없다」를 틀린 설명으로 고르게 한다 —
맞는 말로 두는 것은 스크립트를 콘솔에서 대화형으로 쓸 수 있다, 스크립트는 글자로 되어 있다, 대소문자를 가리지 않는다이다([기출 2024-11-03 #31]·[기출 2026-08-02 #30] — 같은 문항).

## 읽어야 할 파일

- **`phases/80-network-windows-ad-tools/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/80-network-windows-ad-tools/index.json`의 step 8 `summary`(리소스 모니터의 탭·실행 이름·여는 자리, PowerShell의 cmdlet·별칭·외부 실행 파일·대소문자·`.ps1`·실행 정책·5.1과 7, 「DOS 명령」의 처리, E 번호, 한국어 이름)와 step 10 `summary`의 「앞 개념에 고칠 것」·문항 균형
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 80 step 8)」 줄과 항목, phase 71의 작업 관리자 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 9·10이 쓴 `windows-admin-tools` 네 개념** — 특히 `performance-monitor`의 성능 카운터·데이터 수집기 집합, `mmc-run-commands`의 명령 프롬프트·실행 창, `network-basics.throughput`의 작업 관리자, `diagnostic-commands`의 `ipconfig`·`ping` — 뜻을 맞춘다),
  `src/data/network/questions.json`, `src/data/network/visuals/windows-admin-tools.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 9·10이 만든 도식과 그 테스트, 선례 `NetstatLinuxOptionsDiagram`(명령 줄의 조각)·`IpconfigOptionsDiagram`(명령과 결과)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-11-03 #36], [기출 2026-02-01 #42], [기출 2024-11-03 #31], [기출 2026-08-02 #30] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-admin-tools` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 17 | `windows-admin-tools.resource-monitor` | 리소스 모니터 | `windows-admin-tools.performance-monitor` | **리소스 모니터**(Resource Monitor — 실행 이름 `resmon`, 여는 다른 자리는 step 8 결과대로)가 **CPU·메모리·디스크·네트워크** 네 자원을 **프로세스**(실행 중인 프로그램 — 한 줄로 푼다)마다 실시간으로 보여 주는 도구라는 것(step 8 결과대로). 탭(개요·CPU·메모리·디스크·네트워크 — 한국어 화면 이름)과 탭마다 보이는 것 한 줄씩(step 8 결과대로 — 네트워크 탭의 프로세스별 사용량 등 문서에 있는 것만). 방화벽 설정을 보거나 바꾸는 도구가 아니다 — 탭에 그런 것이 없다는 사실로 쓴다. **리소스 모니터와 성능 모니터가 무엇이 다른지**(4절 — 지금 이 순간 프로세스별로 보기와, 카운터를 골라 정한 간격으로 오래 모으기 — `performance-monitor`의 말과 뜻을 맞춘다), 작업 관리자와의 관계(step 8·phase 71 결과대로 한 줄). 기출 문제문이 이 도구의 기능처럼 적은 것(업데이트·설치 정보 등)은 step 8 판정대로 — 다른 도구의 기능이면 리소스 모니터에 붙이지 않는다. 예: 파일을 내려받는 동안 네트워크 탭에서 그 프로그램이 주고받는 양이 보인다(「예시 값」 — 프로그램 이름은 짓지 않고 「내려받는 프로그램」처럼 이름표로) |
| 18 | `windows-admin-tools.powershell` | PowerShell | — | **PowerShell**이 명령을 글자로 입력해 실행하는 **셸**(사용자의 명령을 받아 운영 체제에 전하는 프로그램 — 한 줄)이자 **스크립트**(명령을 차례로 적어 둔 파일 — 한 줄) 언어라는 것(step 8 결과대로). **cmdlet**(동사-명사 꼴 — `Get-Service`는 서비스 목록을 가져온다, `Get-ChildItem`은 폴더 안의 항목을 가져온다)과 결과가 객체라는 것(step 8 결과대로 한 줄 — 객체는 한 줄로 푼다). **옛 명령 이름도 쓸 수 있다** — `dir`·`cd`·`copy` 같은 이름이 **별칭**(alias)으로 cmdlet에 이어지고(`dir` → `Get-ChildItem`), `ipconfig`·`ping` 같은 실행 파일도 그대로 실행된다(step 8 결과대로 — 「DOS 명령」이라는 말을 쓸지와 「자격시험은」 줄은 step 8의 처리대로). 명령 이름과 매개 변수는 **대소문자를 가리지 않는다**(step 8 결과대로 — **매개 변수**는 한 줄로 푼다). 스크립트는 글자 파일(확장자 `.ps1`)이고, 같은 명령을 콘솔에서 한 줄씩 대화형으로도 실행한다. **실행 정책**(스크립트 실행을 막거나 허용하는 설정 — Windows Server의 기본값은 step 8 결과대로 한 줄), Windows PowerShell 5.1과 PowerShell 7의 관계(step 8 결과대로 한 줄). **PowerShell과 명령 프롬프트(`cmd`)가 무엇이 다른지**, **cmdlet과 별칭**(4절). 예: `Get-Service`와 `get-service`가 같은 cmdlet을 실행한다(「예시 값」이 아니라 사실 — step 8 근거) |

### 2. 문항 — `src/data/network/questions.json`에 `n277`~`n279`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n277` | `resource-monitor` | 4지선다 「상황 적용」 — 본문과 다른 장면(예: 서버가 갑자기 느려졌다. 지금 이 순간 어느 프로세스가 디스크를 가장 많이 읽고 쓰는지 프로세스별로 보고 싶다)을 주고 알맞은 도구와 볼 곳을 고르게 한다. 정답: 리소스 모니터의 디스크 탭. 오답은 흔한 혼동 — 이벤트 뷰어의 시스템 로그(지난 기록), 성능 모니터 데이터 수집기 집합의 보고서(모아 둔 값 — 문제문의 「지금 이 순간 프로세스별」에 어긋난다), 로컬 보안 정책 등. 기출 묶음(Server Manager·System Hardware Monitor·Resource Monitor·Event Viewer / CPU·Memory·Network·Firewall)과 넷 가운데 둘 이상이 다르게 한다. **정답 위치 0** |
| `n278` | `powershell` | 예/아니요 「개념 확인」 — 시작 때 균형(예 54·아니요 54)에서 **예** 쪽으로 세운다. 예: PowerShell 창에 명령 프롬프트에서 쓰던 `ipconfig`를 그대로 입력하면 실행되나요?(예 — 실행 파일을 그대로 실행한다, step 8 결과대로. 본문의 예 `dir`과 다른 것을 고른다). 해설은 외부 실행 파일과 별칭(`dir` → `Get-ChildItem`)을 함께 가르친다. 기출의 문장 「기존 DOS 명령은 사용할 수 없다」를 그대로 쓰지 않는다 |
| `n279` | `powershell` | 4지선다 「개념 확인」 — 대소문자가 다른 세 꼴(예: `Get-Process`·`get-process`·`GET-PROCESS` — 문항 글에는 백틱 없이)을 입력했을 때 무엇이 실행되는지 고르게 한다. 정답: 셋 모두 같은 cmdlet을 실행한다. 오답은 흔한 오해 — 첫 꼴만 실행된다, 소문자 꼴만 실행된다, 셋 모두 오류다 — step 8 결과로 정말 틀렸는지 따진다. n278과 다른 것(실행 파일이 아니라 대소문자)을 묻는다. **정답 위치 1** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 55·아니요 54, 정답 위치 43/43/42/42.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `windows-admin-tools.resource-monitor` — `ResourceMonitorDiagram`, JSON 키 `resource-monitor`

- 물음형 제목 예: `지금 어느 프로그램이 자원을 많이 쓰는지 어디서 볼까?`
- 그릴 것: 리소스 모니터(그룹 박스) 안에 탭 노드(개요·CPU·메모리·디스크·네트워크 — 본문의 이름), 프로세스 이름표(본문 예의 「내려받는 프로그램」 등)와 그것이 쓰는 자원 경로, 옆에 성능 모니터 노드(곁말로 차이 — 본문의 말). 280 폭에서 탭은 두 줄로 쌓는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `tabs` | 탭 | 탭 노드들 | 개요와 네 자원마다 탭이 있다 |
  | `per-process` | 프로세스별 | 프로세스 이름표와 네 자원 탭, 그 경로 | 프로세스마다 CPU·메모리·디스크·네트워크를 얼마나 쓰는지 지금 값으로 본다 |
  | `compare` | 성능 모니터와 | 리소스 모니터와 성능 모니터 노드 | 리소스 모니터는 지금 이 순간을, 성능 모니터는 고른 카운터를 오래 모은다 |

- 요점 테스트: `tabs`에서 선명한 탭 노드의 라벨 집합이 본문이 든 탭 이름과 같고, 「방화벽」이 들어간 노드가 없다. `per-process`에서 보이는 경로의 끝 노드가 CPU·메모리·디스크·네트워크 탭 넷이다.

#### 3-2. `windows-admin-tools.powershell` — `PowerShellCommandsDiagram`, JSON 키 `powershell-commands`

- 물음형 제목 예: `PowerShell에 적은 이름은 무엇을 실행할까?`
- 그릴 것: 입력 노드(`Get-ChildItem`·`dir`·`ipconfig`·`get-service`와 `Get-Service` — 본문에 쓴 것만)에서 실행되는 것 노드(cmdlet `Get-ChildItem`, cmdlet `Get-Service`, 실행 파일 `ipconfig`)로 가는 경로, cmdlet 이름을 동사·명사 조각(`Get` · `ChildItem`)으로 나눈 줄.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `cmdlet` | cmdlet | 동사·명사 조각 줄 | cmdlet 이름은 동사와 명사를 하이픈으로 잇는다 |
  | `alias` | 별칭 | `dir`과 `Get-ChildItem`, 그 경로 | 옛 이름은 별칭으로 cmdlet에 이어진다 |
  | `native` | 실행 파일 | `ipconfig` 입력과 실행 파일, 그 경로 | 명령 프롬프트에서 쓰던 실행 파일도 그대로 실행된다 |
  | `case` | 대소문자 | `get-service`·`Get-Service` 입력과 같은 cmdlet, 그 경로 | 대소문자를 가리지 않아 같은 cmdlet이 실행된다 |

- 요점 테스트: `alias`에서 보이는 경로가 `dir` 노드에서 시작해 `Get-ChildItem` cmdlet 노드에서 끝난다. `case`에서 보이는 두 경로가 같은 cmdlet 노드에서 끝난다. `cmdlet`의 조각 노드를 하이픈으로 이으면 본문의 cmdlet 이름이 된다.

위 도식 설계는 출발점이다. 본문(step 8 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~7, 9~13)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 279개, 마지막 id는 `n279`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. step 8 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. cmdlet·별칭의 짝이 출처와 같은가.
3. n277·n279의 보기 넷을 step 8 결과로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/80-network-windows-ad-tools/index.json`의 step 11을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 19~22를 만들지 마라.** 이유: step 12·13의 범위다.
- **step 9·10의 개념·문항·도식과 `windows-ad` 주제를 고치지 마라.** 이유: 다른 step의 범위다. 어긋남을 찾으면 summary에 적는다.
- **PowerShell의 변수·파이프라인·제어문·함수·원격 실행·모듈 설치, 리소스 모니터의 프로세스 끝내기·필터 조작 차례를 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **step 8이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
