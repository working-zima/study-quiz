# Step 9: mmc-event-viewer

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다. 전체 계획·결정·공통 규칙은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
**이 step은 주제 `windows-admin-tools`를 만들고 그 첫 개념 둘(13 MMC와 실행 창 명령, 14 이벤트 뷰어)의 글·문항·도식을 함께 만든다.** 둘 다 머리 개념이다.
학습자는 `windows-ad`를 읽지 않고 이 주제로 바로 들어올 수 있으므로, 이 주제 화면만 읽고도 운영 체제·Windows Server·관리 도구의 뜻이 서게 쓴다.

기출은 장애에 대비해 백업해 둔 인증서 키를 복원하려 실행 창에서 인증서 관리자를 여는 명령으로 `certmgr.msc`를 고르게 하고(오답 `eventvwr.msc`·`compmgmt.msc`·`secpol.msc` — [기출 2024-08-25 #37]),
명령 프롬프트나 실행 창에 넣었을 때 실행되지 않거나 짝이 맞지 않는 것으로 `compmgmt` – 컴퓨터 관리를 고르게 한다(맞는 짝 `devmgmt.msc` – 장치 관리자, `gpedit.msc` – 로컬 그룹 정책 편집기, `perfmon` – 성능 모니터 — [기출 2025-08-24 #41]).
이벤트 뷰어는 시스템을 끌 때마다 이유를 남겨 안정적으로 운영하려는 서버에서 지난 종료·재부팅 기록을 보는 곳으로 두 번 나온다(오답 성능 모니터·로컬 보안 정책·그룹 정책 편집기 — [기출 2024-08-25 #39]·[기출 2025-11-02 #38]).

## 읽어야 할 파일

- **`phases/80-network-windows-ad-tools/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/80-network-windows-ad-tools/index.json`의 step 8 `summary`(도구와 실행 이름의 짝 표, `.msc`를 뺀 꼴의 판정, 이벤트 한 건의 칸, 종료·재부팅 기록, 종료 이벤트 추적기, E 번호, 한국어 이름)와 step 7 `summary`의 문항 균형
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 80 step 8)」 줄과 항목), `docs/source/network/exam-notes.md`(step 8이 더한 항목 — 특히 `.msc`)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(`diagnostic-commands.ipconfig`의 명령 프롬프트, `windows-ad.group-policy`의 `gpedit.msc` — 뜻을 맞춘다. 다른 주제라 이 주제 화면에서 다시 푼다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `IpconfigOptionsDiagram`(명령과 결과의 짝), `NamedFilesDiagram`(도구·파일의 관계), `windows-ad` 주제의 도식들과 그 테스트, `src/data/network/visuals/windows-ad.json`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-08-25 #37], [기출 2025-08-24 #41], [기출 2024-08-25 #39], [기출 2025-11-02 #38] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`windows-ad` 주제 객체 바로 뒤(지금 배열의 맨 끝)에 주제 객체를 더한다 — `{ "id": "windows-admin-tools", "title": "Windows 관리 도구와 보안 기능", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 2(★★☆, 출제 8/11회)인지 `data.test.ts`의 주제 지도 표와 견준다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 13 | `windows-admin-tools.mmc-run-commands` | MMC와 실행 창 명령 | — | **목록 개념**. 이 주제의 첫 개념이라 **운영 체제**, **Windows Server**, **관리 도구**(컴퓨터의 설정·상태를 보고 바꾸는 프로그램), **명령 프롬프트**(명령을 글자로 입력하는 창), **실행 창**(Windows 키와 `R`을 함께 눌러 여는, 이름을 적어 프로그램을 여는 작은 창 — step 8 결과대로)을 한 줄씩 푼다. 소개 문단 — **MMC**(Microsoft Management Console)가 관리 도구 조각(**스냅인**)을 담아 한 창에 보여 주는 틀이고, 그 구성을 저장한 파일의 확장자가 `.msc`라는 것(step 8 결과대로), 실행 창이나 명령 프롬프트에 실행 이름을 적어 도구를 여는 차례. 항목(「글」의 항목 이름 규칙 (2) — `- **장치 관리자**(`devmgmt.msc`)는 …`): 컴퓨터 관리, 장치 관리자, 로컬 그룹 정책 편집기, 로컬 보안 정책, 이벤트 뷰어, 인증서 관리자, 성능 모니터 — 실행 이름과 하는 일 한 문장씩(step 8의 짝 표대로, 한국어 화면 이름). 항목 뒤 문단: `.msc`를 빼고 적는 꼴의 처리(step 8의 판정 — 「자격시험은 ~로 본다」 줄이 필요하면 E 번호의 처리대로). 예: 실행 창에 `eventvwr.msc`를 적으면 이벤트 뷰어가 열린다(「예시 값」이 아니라 사실 — step 8 근거) |
| 14 | `windows-admin-tools.event-viewer` | 이벤트 뷰어 | — | **이벤트**(운영 체제나 프로그램에 일어난 일을 남긴 기록 한 건), **이벤트 로그**(이벤트를 모아 둔 기록), **이벤트 뷰어**(로그를 보고 걸러 찾는 도구 — `eventvwr.msc`)(step 8 결과대로). 이벤트 한 건에 담기는 칸 — 수준(정보·경고·오류·위험 등), 날짜와 시간, 원본, 이벤트 ID(step 8 결과대로 — 칸 이름은 한국어 화면 이름). **종료·재부팅 기록** — 시스템 로그에 남고, 누가 어떤 이유로 껐는지 남기는 이벤트와 그 ID(step 8 결과대로 — 문서에 없는 ID는 쓰지 않는다), 끌 때 이유를 적게 하는 종료 이벤트 추적기(step 8 결과대로 한 줄). 따라 할 차례 — 이벤트 뷰어를 열고 시스템 로그를 골라 종료 이벤트로 걸러 찾는다(메뉴 이름은 step 8이 확인한 만큼 — 화면 꼴을 지어 보이지 않는다). **이벤트 뷰어와 성능 모니터가 무엇이 다른지**(4절 — 이미 일어난 일의 기록과, CPU 사용률처럼 지금 재는 값 — 성능 모니터는 한 줄로 푼다). 로그의 종류(응용 프로그램·보안 등)는 이름만 한 줄(자세한 것은 딸린 개념의 몫이라는 말은 쓰지 않는다) |

### 2. 문항 — `src/data/network/questions.json`에 `n271`~`n274`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n271` | `mmc-run-commands` | 4지선다 「개념 확인」 — 실행 이름 하나(예: `secpol.msc`)를 주고 그것으로 연 도구에서 할 수 있는 일을 고르게 한다. **보기는 실행 이름이 아니라 「할 수 있는 일」로**(정답: 이 컴퓨터의 보안 정책(암호·계정 잠금 등)을 보고 바꾼다 — step 8 결과대로 확인, 오답은 다른 도구의 일 — 장치 드라이버를 확인한다, 인증서를 내보낸다, 지난 이벤트를 찾는다 등). 기출 묶음(`eventvwr.msc`·`compmgmt.msc`·`secpol.msc`·`certmgr.msc` / `compmgmt`·`devmgmt.msc`·`gpedit.msc`·`perfmon`의 짝)을 보기로 쓰지 않는다. **정답 위치 1** |
| `n272` | `mmc-run-commands` | 예/아니요 「개념 확인」 — 시작 때 균형(예 53·아니요 52)에서 **예** 쪽으로 세운다. 예: 실행 창에 `gpedit.msc`를 적어 연 도구에서 바꾼 설정은 그 컴퓨터 한 대의 로컬 정책에 걸리나요?(예 — 로컬 그룹 정책 편집기, step 8·4 결과대로). 해설은 도메인 전체의 정책은 그룹 정책 관리 콘솔에서 다룬다는 것과 MMC·`.msc`의 뜻을 가르친다. n271과 다른 도구를 묻는다 |
| `n273` | `event-viewer` | 4지선다 「상황 적용」 — 본문과 다른 장면(예: 월요일 아침에 보니 파일 서버가 주말 사이 다시 시작돼 있었다. 언제, 누가, 어떤 이유로 다시 시작했는지 알고 싶다)을 주고 어디를 봐야 하는지 고르게 한다. **보기는 도구 이름만이 아니라 「도구 + 볼 곳」으로**(정답: 이벤트 뷰어의 시스템 로그에서 종료 이벤트를 찾는다. 오답 — 이벤트 뷰어의 보안 로그만 본다(step 8 결과로 종료 기록이 거기 없는지 확인), 성능 모니터의 실시간 그래프를 본다, 리소스 모니터의 CPU 탭을 본다 등). 기출 묶음(성능 모니터·이벤트 뷰어·로컬 보안 정책·그룹 정책 편집기)과 넷 가운데 둘 이상이 다르게 한다. **정답 위치 2** |
| `n274` | `event-viewer` | 예/아니요 「개념 비교」 — **아니요** 쪽으로 세운다. 예: 이벤트 뷰어를 열면 지금 이 순간 CPU 사용률이 오르내리는 그래프를 볼 수 있나요?(아니요 — 이벤트 뷰어는 일어난 일의 기록을 본다. 지금 재는 값은 성능 모니터의 일이다). 해설은 이벤트 한 건의 칸과 두 도구가 무엇이 다른지를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 54·아니요 53, 정답 위치 42/42/42/41.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

이 step이 `src/data/network/visuals/windows-admin-tools.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'windows-admin-tools': windowsAdminToolsVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」 — `'windows-ad'` 바로 뒤, 지금 맨 끝).

#### 3-1. `windows-admin-tools.mmc-run-commands` — `RunCommandsDiagram`, JSON 키 `run-commands`

- 물음형 제목 예: `실행 창에 무엇을 적으면 어느 도구가 열릴까?`
- 그릴 것: 맨 위에 실행 창 노드, 그 아래 「실행 이름 → 도구」 짝 줄을 본문의 항목 수만큼 세로로 쌓는다(한 줄에 실행 이름 노드 하나와 도구 노드 하나). `.msc` 도구들은 MMC(그룹 박스 또는 곁말 「MMC가 여는 콘솔」)로 묶어, MMC가 담는 것과 아닌 것이 보이게 한다(본문에 쓴 만큼). 280 폭에서 한 줄에 노드 둘까지.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `mmc` | MMC | MMC와 `.msc` 짝들 | `.msc` 파일은 MMC가 여는 콘솔이고, 그 안에 관리 도구가 담긴다 |
  | `policy` | 정책 | `gpedit.msc`·`secpol.msc` 짝 | 이 컴퓨터의 정책과 보안 설정을 여는 이름이다 |
  | `records` | 기록과 성능 | `eventvwr.msc`·`perfmon` 짝 | 일어난 일의 기록과 지금 재는 값을 여는 이름이다 |

  짝 줄의 나눔은 본문 항목에 맞게 바꿔도 된다. 시나리오끼리 선명한 짝이 겹치지 않게 한다.
- 요점 테스트: 짝 줄마다 실행 이름 노드에서 나간 경로가 같은 줄의 도구 노드에서 끝난다(다른 줄로 건너가지 않는다). 실행 이름 노드의 라벨 집합이 본문 항목의 실행 이름 집합과 같다.

#### 3-2. `windows-admin-tools.event-viewer` — `EventViewerDiagram`, JSON 키 `event-viewer`

- 물음형 제목 예: `지난밤 서버가 왜 다시 시작됐는지 어디서 찾을까?`
- 그릴 것: 운영 체제·프로그램(이름표) → 이벤트 → 이벤트 로그(시스템 로그 등 본문에 쓴 이름) → 이벤트 뷰어의 흐름, 그리고 이벤트 한 건의 칸 줄(수준·날짜와 시간·원본·이벤트 ID — 칸 이름은 본문의 말).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `record` | 기록 | 운영 체제·이벤트·이벤트 로그와 그 경로 | 일이 일어나면 이벤트가 로그에 쌓인다 |
  | `fields` | 이벤트 한 건 | 칸 줄 | 이벤트마다 수준·시각·원본·ID가 남는다 |
  | `shutdown` | 종료 기록 | 시스템 로그·이벤트 뷰어와 그 경로 | 종료와 재부팅 기록은 시스템 로그에 남고 이벤트 뷰어로 찾는다(step 8 결과대로) |

- 요점 테스트: `shutdown`에서 보이는 경로가 시스템 로그 노드를 지나 이벤트 뷰어에서 끝난다. `fields`에서 선명한 칸 노드의 라벨 집합이 본문이 든 칸 이름과 같다.

위 도식 설계는 출발점이다. 본문(step 8 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~7, 9~13)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 274개, 마지막 id는 `n274`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `windows-ad` 바로 뒤(맨 끝)에 있고, `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다. `windows-ad`가 그대로 `linux-servers` 뒤에 있는지도 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. step 8 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 실행 이름과 도구의 짝이 step 8의 표와 같은가. 이벤트 ID를 지어내지 않았는가.
4. n271·n273의 보기 넷을 step 8 결과로 하나씩 따져 정답이 하나뿐인지 본다.
5. `phases/80-network-windows-ad-tools/index.json`의 step 9를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 15~22를 만들지 마라.** 이유: step 10~13의 범위다. 이 step의 글이 성능 모니터·인증서를 말해야 하면 한 줄 풀이로 그친다.
- **`windows-ad` 주제의 개념·문항·도식을 고치지 마라.** 이유: step 1~7이 만들었다. 어긋남을 찾으면 summary에 적는다.
- **관리 도구 창·메뉴를 그림으로 흉내 내지 마라.** 이유: guide.md 「도식」 — 출처가 보이는 화면 꼴이 아니고 판마다 다르다.
- **step 8이 확인하지 못한 사실(이벤트 ID, 실행 이름, 메뉴 이름)을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
