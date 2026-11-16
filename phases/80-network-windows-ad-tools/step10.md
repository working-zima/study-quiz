# Step 10: windows-logs-perfmon

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다. 전체 계획·결정·공통 규칙은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
**이 step은 `windows-admin-tools`의 개념 둘(15 Windows 로그, 16 성능 모니터)의 글·문항·도식을 만든다.** 15는 14(이벤트 뷰어)에 딸린 개념이고, 16은 머리 개념이다.

기출은 Windows Server 2022의 이벤트 뷰어에서 Windows 로그에 드는 것으로 「응용 프로그램」을 고르게 하고(오답 하드웨어 이벤트·인터넷 익스플로러·Windows PowerShell — [기출 2025-08-24 #30]),
성능 모니터로 서버 성능을 분석할 때 일정 주기로 데이터를 모으려 성능 모니터를 시작하는 명령으로 `perfmon`을 고르게 한다(오답 `msconfig`·`dfrg`·`secpol` — [기출 2025-05-25 #35]).

## 읽어야 할 파일

- **`phases/80-network-windows-ad-tools/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/80-network-windows-ad-tools/index.json`의 step 8 `summary`(Windows 로그 다섯과 응용 프로그램 및 서비스 로그, 어느 일이 어느 로그에, 성능 카운터·데이터 수집기 집합, E 번호, 한국어 이름)와 step 9 `summary`의 「앞 개념에 고칠 것」·문항 균형
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 80 step 8)」 줄과 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 9가 쓴 `windows-admin-tools` 두 개념** — 이미 푼 낱말(운영 체제·관리 도구·실행 창·MMC·이벤트·이벤트 로그)을 다시 풀지 않는다, `event-viewer`가 성능 모니터를 한 줄로 푼 말과 뜻을 맞춘다),
  `src/data/network/questions.json`, `src/data/network/visuals/windows-admin-tools.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 9가 만든 도식(`RunCommandsDiagram`·`EventViewerDiagram`)과 그 테스트, 선례 `KeepAliveTimelineDiagram`(시간의 흐름)·`DirectoryTreeDiagram`(나무)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-08-24 #30], [기출 2025-05-25 #35] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-admin-tools` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 15 | `windows-admin-tools.windows-logs` | Windows 로그 | `windows-admin-tools.event-viewer` | **목록 개념**. 소개 문단 — 이벤트 뷰어의 「Windows 로그」 아래에 운영 체제가 남기는 로그 다섯이 있다는 것(step 8 결과대로). 항목(한국어 화면 이름에 영문 이름 — 「글」의 항목 이름 규칙 (1)): 응용 프로그램(Application), 보안(Security — 로그온 성공·실패 같은 **감사** 기록, 감사는 한 줄로 푼다), Setup(이름은 step 8 결과대로), 시스템(System — 운영 체제 구성 요소·드라이버·서비스, 종료·재부팅 기록 — `event-viewer`와 뜻을 맞춘다), 전달된 이벤트(Forwarded Events) — 각각 무엇을 남기는지 한 문장씩(step 8 결과대로). **드라이버**·**서비스**는 한 줄씩 푼다. 항목 뒤 문단: 「응용 프로그램 및 서비스 로그」가 특정 프로그램이나 구성 요소의 로그를 모은 다른 묶음이라는 것과 그 예(하드웨어 이벤트·Windows PowerShell 등 — step 8 결과대로). **Windows 로그와 응용 프로그램 및 서비스 로그가 무엇이 다른지**(4절). 어느 일이 어느 로그에 남는지 예 셋(step 8 결과대로 — 근거가 있는 것만) |
| 16 | `windows-admin-tools.performance-monitor` | 성능 모니터 | — | **성능 모니터**(Performance Monitor — 실행 이름 `perfmon`)가 **성능 카운터**(CPU 사용률·사용 가능한 메모리처럼 컴퓨터의 상태를 수로 재는 항목)의 값을 그래프로 보여 주고 모아 두는 도구라는 것(step 8 결과대로). 두 쓰임 — 지금 값을 실시간 그래프로 보기와, **데이터 수집기 집합**(고른 카운터를 정한 간격으로 모아 로그 파일로 남기는 설정)으로 모은 뒤 보고서로 보기(step 8 결과대로). 따라 할 차례 — 성능 모니터를 열고 카운터를 고르고 수집 간격을 정해 데이터 수집기 집합을 시작한다(메뉴 이름은 step 8이 확인한 만큼). 카운터 이름의 꼴(`\Processor(_Total)\% Processor Time` — 조각의 뜻은 step 8 결과대로 한 줄). 예: CPU 사용률 카운터를 `15`초 간격으로 모으는 데이터 수집기 집합 — 한 시간이면 값이 240개 남는다(`3600 ÷ 15 = 240`, 「예시 값」 — 계산을 단계대로). 이벤트 뷰어와 무엇이 다른지는 `event-viewer`와 뜻을 맞춘 한 줄(4절의 짝은 「이벤트 뷰어」가 이미 말했다 — 되풀이하지 않는다) |

### 2. 문항 — `src/data/network/questions.json`에 `n275`~`n276`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n275` | `windows-logs` | 4지선다 「상황 적용」 — 본문과 다른 장면(예: 누군가 밤사이 서버에 여러 번 로그온을 시도했다가 실패했는지 확인하고 싶다 — 감사가 켜져 있다는 조건은 step 8 결과대로 문제문에 밝힌다)을 주고 어느 로그를 봐야 하는지 고르게 한다. 정답 보안, 오답 시스템·응용 프로그램·Setup(또는 응용 프로그램 및 서비스 로그) — 각각 무엇을 남기는지로 따진다. 기출 묶음(하드웨어 이벤트·인터넷 익스플로러·Windows PowerShell·응용 프로그램)을 쓰지 않는다. **정답 위치 3** |
| `n276` | `performance-monitor` | 예/아니요 「원인과 결과」 — 시작 때 균형(예 54·아니요 53)에서 **아니요** 쪽으로 세운다. 예: 성능 모니터로 메모리 사용량을 30초마다 하룻밤 동안 모으려면, 관리자가 밤새 성능 모니터 화면을 열어 두고 값을 직접 적어야 하나요?(아니요 — 데이터 수집기 집합이 정한 간격으로 모아 로그 파일로 남긴다, step 8 결과대로). 해설은 실시간 그래프와 데이터 수집기 집합의 차이, 실행 이름 `perfmon`을 가르친다. 본문의 값(`15`초)과 다른 값을 쓴다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 54·아니요 54, 정답 위치 42/42/42/42.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `windows-admin-tools.windows-logs` — `WindowsLogsDiagram`, JSON 키 `windows-logs`

- 물음형 제목 예: `어떤 일이 어느 로그에 남을까?`
- 그릴 것: 「Windows 로그」 그룹 박스 안에 로그 노드 다섯, 그 옆(세로형은 아래)에 「응용 프로그램 및 서비스 로그」 그룹 박스와 그 안의 예 노드(본문에 쓴 것만), 그리고 일어나는 일 노드(본문의 예 셋 — 로그온 실패 등)에서 해당 로그로 가는 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `security` | 보안 | 로그온 실패와 보안 로그, 그 경로 | 로그온 성공·실패 같은 감사 기록은 보안 로그에 남는다 |
  | `system` | 시스템 | 본문의 시스템 예와 시스템 로그, 그 경로 | 운영 체제 구성 요소와 서비스의 일은 시스템 로그에 남는다 |
  | `application` | 응용 프로그램 | 본문의 프로그램 예와 응용 프로그램 로그, 그 경로 | 프로그램이 남긴 일은 응용 프로그램 로그에 남는다 |
  | `apps-services` | 다른 묶음 | 응용 프로그램 및 서비스 로그와 그 안의 예 | 특정 프로그램의 로그는 Windows 로그와 다른 묶음에 있다 |

  본문의 예가 셋보다 적으면 시나리오를 줄인다.
- 요점 테스트: `security`·`system`·`application`에서 보이는 경로가 각각 「Windows 로그」 그룹 박스 안의 서로 다른 로그 노드에서 끝난다. `apps-services`에서 선명한 노드가 모두 「Windows 로그」 그룹 박스 밖에 있다.

#### 3-2. `windows-admin-tools.performance-monitor` — `PerfmonCollectorDiagram`, JSON 키 `perfmon-collector`

- 물음형 제목 예: `성능 모니터는 값을 어떻게 모아 둘까?`
- 그릴 것: 카운터 노드(`\Processor(_Total)\% Processor Time` — 반각 문자가 많아 폭을 넉넉히, 280 폭에 들지 않으면 한 줄 전체 폭), 실시간 그래프 노드, 데이터 수집기 집합(그룹 박스 — 카운터와 곁말 「`15`초마다」), 로그 파일 노드, 보고서 노드. 직교 경로만.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `live` | 실시간 | 카운터와 실시간 그래프, 그 경로 | 고른 카운터의 지금 값을 그래프로 본다 |
  | `collect` | 모으기 | 데이터 수집기 집합과 로그 파일, 그 경로 | 정한 간격으로 값을 모아 로그 파일로 남긴다 |
  | `report` | 보고서 | 로그 파일과 보고서, 그 경로 | 모은 값을 나중에 보고서로 본다 |

- 요점 테스트: `collect`에서 보이는 간격 곁말의 수가 본문 예의 간격(`15`초)과 같다(테스트에서 본문 문자열과 견준다). `live`에서 로그 파일·보고서 노드는 흐리다.

위 도식 설계는 출발점이다. 본문(step 8 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~7, 9~13)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 276개, 마지막 id는 `n276`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. step 8 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 로그 이름이 한국어 화면 이름인가. 계산 예를 손으로 다시 했는가.
3. n275의 보기 넷을 step 8 결과로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/80-network-windows-ad-tools/index.json`의 step 10을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 17~22를 만들지 마라.** 이유: step 11~13의 범위다. 리소스 모니터를 말해야 하면 한 줄 풀이로 그친다.
- **step 9의 개념·문항·도식과 `windows-ad` 주제를 고치지 마라.** 이유: 다른 step의 범위다. 어긋남을 찾으면 summary에 적는다.
- **이벤트 구독 설정, 로그 크기·보존 설정, 성능 카운터 전체 목록, 경고(알림) 설정을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **step 8이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
