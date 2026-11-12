# Step 15: netstat-options

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 `diagnostic-commands`의 마지막 개념 둘(24 Windows netstat의 옵션, 25 Linux netstat의 옵션)의 글·문항·도식을 함께 만들고, 이 주제와 phase를 끝낸다.** 둘 다 23 `netstat`에 딸린 개념이다.

기출은 Windows netstat에서 열린 포트와 연관된 실행 파일을 보는 옵션 `-b`([기출 2025-11-02 #45]), 라우팅 테이블을 보는 `-r`([기출 2026-08-02 #35]), 원격 접속 흔적을 보는 `-an`([기출 2024-11-03 #12]),
Linux netstat의 옵션 설명(`-r` 라우팅 테이블·`-p` PID와 프로그램 이름·`-a` 모든 연결과 기다리는 포트는 맞고, `-t`가 연결된 뒤의 시간이라는 것은 틀린 말 — [기출 2025-08-24 #35]·[2026-05-17 #28]), 불필요한 서비스 포트를 보는 `netstat -antp`([기출 2024-08-25 #32])를 묻는다.

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 11 `summary`(netstat 옵션에 무엇을 쓰고 무엇을 쓰지 않는지, 옵션 표기, E 항목)와 step 12~14 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(Microsoft Learn netstat·man7.org netstat(8)·services(5) 항목과 「(phase 78 step 11)」 줄), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 12~14가 쓴 `diagnostic-commands`의 여섯 개념** — 특히 23 `netstat`의 예 줄, `routing.routing-table`의 `netstat -r`·`route print`, `tcp-connection.tcp-states`의 `ss -tan` 옵션 풀이 — 뜻을 맞춘다), `src/data/network/questions.json`,
  `src/data/network/visuals/diagnostic-commands.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 12~14가 만든 도식과 그 테스트, 선례 `PermissionStringDiagram`(글자열을 뜻 단위로 나눠 읽기 — `src/components/diagrams/registry.ts`에서 찾는다), `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-08-25 #32], [기출 2024-11-03 #12], [기출 2025-08-24 #35], [기출 2025-11-02 #45], [기출 2026-05-17 #28], [기출 2026-08-02 #35] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `diagnostic-commands` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 24 | `diagnostic-commands.netstat-windows-options` | Windows netstat의 옵션 | `netstat` | **목록 개념** — 소개 문단 뒤에 항목 여덟: `- **모두 보기**(`-a`)는 …`, `- **숫자로 보기**(`-n`)는 …`, `- **PID 보기**(`-o`)는 …`, `- **실행 파일 보기**(`-b`)는 …`, `- **프로토콜 고르기**(`-p`)는 …`, `- **라우팅 테이블 보기**(`-r`)는 …`, `- **통계 보기**(`-s`)는 …`, `- **이더넷 통계 보기**(`-e`)는 …`(뜻과 표기는 step 11 summary대로). **PID**(운영체제가 실행 중인 프로그램마다 붙이는 번호 — 한 줄)를 푼다. 항목 뒤 문단: 옵션을 이어 쓴 `netstat -ano`를 입력하면 무엇이 보이는지 — 모든 연결과 기다리는 포트를, 숫자로, 마지막 칸에 PID와 함께(Windows PC `192.0.2.10`의 웹 브라우저가 `198.51.100.10:443`과 맺은 연결 줄 — 「예시 값」, 출력의 꼴은 step 11이 확인한 만큼). `-b`의 권한 조건은 step 11 결과대로 |
| 25 | `diagnostic-commands.netstat-linux-options` | Linux netstat의 옵션 | `netstat` | **목록 개념** — 소개 문단 뒤에 항목 일곱: `- **모두 보기**(`-a`)는 …`, `- **숫자로 보기**(`-n`)는 …`, `- **TCP만 보기**(`-t`)는 …`, `- **UDP만 보기**(`-u`)는 …`, `- **기다리는 소켓만 보기**(`-l`)는 …`, `- **프로그램 보기**(`-p`)는 …`, `- **라우팅 테이블 보기**(`-r`)는 …`. 항목 뒤 문단: `netstat -antp`를 옵션 하나씩 읽는다 — `a`(모두) + `n`(숫자) + `t`(TCP) + `p`(프로그램) → Linux 서버 `198.51.100.10`에서 `22`번을 기다리는 줄에 `sshd`의 PID `812`가 붙어 나온다(「예시 값」). **`-p`가 Windows와 Linux에서 다른 일을 한다**(4절 — Windows는 프로토콜 고르기, Linux는 프로그램 보기), **`-t`는 시간이 아니라 TCP**. `/etc/services`는 서비스 이름과 번호의 목록일 뿐 지금 열린 포트를 보여 주지 않는다는 것 한 줄. 다른 사용자의 프로그램을 보려면 root여야 한다는 것은 step 11 결과대로 |

이 step의 개념이 이 주제와 phase의 마지막이다. 쓰기를 마친 뒤 **주제 `diagnostic-commands`의 여덟 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다.

### 2. 문항 — `src/data/network/questions.json`에 `n224`~`n225`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n224` | `netstat-windows-options` | 4지선다 「출력 읽기」 — Windows에서 `netstat -ano`를 입력한 결과의 한 줄(본문과 다른 값 — 예: 로컬 `192.0.2.20:50100`, 외부 `198.51.100.20:443`, 맺은 연결, 마지막 칸 `4120` — 꼴은 step 11이 확인한 만큼)을 주고, 마지막 칸의 수가 무엇인지 고르게 한다. 정답: 그 연결을 가진 프로그램의 PID. 오답은 같은 줄을 잘못 읽은 것 — 외부 컴퓨터의 포트 번호, 연결이 맺어진 뒤 흐른 시간, 주고받은 바이트 수. 기출 묶음(`-b`·`-p`·`-a`·`-n`, `-a`·`-r`·`-n`·`-s`)을 쓰지 않는다 — 보기가 「칸의 뜻」이라 범주가 다르다. **정답 위치 3** |
| `n225` | `netstat-linux-options` | 예/아니요 「오해 바로잡기」 — n224 뒤의 균형(계획대로면 예 42·아니요 42)에서 **아니요** 쪽으로 세운다. 예: Linux에서 `netstat -p`와 Windows에서 `netstat -p`가 같은 정보를 보여 주는가(아니요), 또는 Linux netstat에 `-t`를 붙이면 연결이 맺어진 뒤 흐른 시간이 나오는가(아니요). 기출의 보기 문장을 옮기지 않는다. 해설은 두 운영체제의 `-p`와 Linux의 `-t`, `-antp`를 읽는 법을 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 42·아니요 43, 정답 위치 35/35/35/35(phase 끝 — 문항 225개, 예/아니요 85개, 4지선다 140개).

### 3. 도식

#### 3-1. `diagnostic-commands.netstat-windows-options` — `NetstatWindowsOptionsDiagram`, JSON 키 `netstat-windows-options`

- 물음형 제목 예: `netstat -ano는 무엇을 더 보여 줄까?`
- 그릴 것: 명령 줄 `netstat -ano`를 옵션 노드 셋(`a`·`n`·`o`)으로 나누고, 옵션마다 결과 줄의 어느 부분을 바꾸는지 잇는다(모든 연결과 기다리는 포트 / 숫자 주소 / 마지막 칸 PID). 결과 줄은 본문 예 하나 — 세로형에서는 「칸 이름: 값」 노드 여럿으로 세운다. `-r`·`-b`처럼 다른 일을 하는 옵션을 곁에 둘지는 판단(본문에 쓴 만큼).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `all` | -a | `a` 노드와 기다리는 줄·맺은 줄 | 맺은 연결과 기다리는 포트를 모두 보인다 |
  | `numeric` | -n | `n` 노드와 주소 칸 | 주소와 포트를 이름으로 바꾸지 않고 숫자로 보인다 |
  | `pid` | -o | `o` 노드와 PID 칸 | 연결마다 그 프로그램의 PID를 마지막 칸에 보인다 |

- 요점 테스트: `pid`에서 선명한 칸 노드가 PID 칸이고 다른 시나리오에서는 흐리다. 옵션 노드 라벨을 차례대로 이으면 `ano`다. `numeric`에서 선명한 주소 칸의 라벨이 숫자 주소(`198.51.100.10:443` 등 본문 값)다.

#### 3-2. `diagnostic-commands.netstat-linux-options` — `NetstatLinuxOptionsDiagram`, JSON 키 `netstat-linux-options`

- 물음형 제목 예: `netstat -antp는 어떻게 읽을까?`
- 그릴 것: `netstat -antp`를 옵션 노드 넷(`a`·`n`·`t`·`p`)으로 나누고 옵션마다 뜻을 곁말로, 그 아래에 결과 줄(`22`번을 기다리는 줄과 `812/sshd` — 꼴은 본문대로). 견주기로 Windows의 `-p` 노드(「프로토콜 고르기」)를 두고 Linux의 `p` 노드(「프로그램 보기」)와 나란히 — 같은 글자, 다른 일.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `read` | 읽기 | 옵션 노드 넷과 결과 줄 | 모든 TCP 소켓을 숫자로, 프로그램과 함께 보인다 |
  | `tcp` | -t | `t` 노드 | `-t`는 시간이 아니라 TCP만 보이라는 뜻이다 |
  | `p-differs` | -p 견주기 | Linux `p` 노드와 Windows `-p` 노드 | 같은 `-p`라도 Linux는 프로그램을, Windows는 프로토콜을 고른다 |

- 요점 테스트: 옵션 노드 라벨을 차례대로 이으면 `antp`다. `read`에서 선명한 결과 줄에 `812`와 `sshd`가 있다. `p-differs`에서 선명한 두 노드의 곁말이 서로 다르고(프로그램·프로토콜), `tcp`의 곁말에 TCP가 있다.

위 도식 설계는 출발점이다. 본문(step 11 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 225개, 마지막 id는 `n225`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. `routing.routing-table`(`netstat -r` = `route print`)·`tcp-connection.tcp-states`(`-t`·`-a`·`-n` 풀이)와 어긋나지 않는가.
   옵션의 뜻이 step 11 summary·문서와 같은가(옵션 설명을 번역해 옮기지 않았는가). 출력 화면을 지어 보이지 않았는가.
3. n224의 줄을 칸 하나씩 다시 읽고 오답 셋이 정말 틀린지 따진다.
4. 주제 `diagnostic-commands`의 여덟 개념을 통독한다(「작업」 1).
5. phase 끝의 수를 확인한다 — 문항 225, 예/아니요 예 42·아니요 43, 4지선다 정답 위치 35/35/35/35(다르면 각 step의 바뀐 방향 때문인지 summary를 보고 적는다), 세 주제의 개념 8·9·8, 새 도식 25.
6. `phases/78-network-app-protocols-diagnostics/index.json`의 step 15를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(「앞 개념에 고칠 것」에 통독 결과, 끝에 5의 수).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **step 12~14의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
- **`routing`·`tcp-connection` 주제의 글을 고치지 마라.** 이유: 앞 phase의 주제다. 어긋남을 찾으면 summary에 적는다.
- **step 11이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. netstat의 화면을 지어 보이지 마라.
- **`ss`의 옵션, netstat의 `-i`·`-g`·`--timers` 같은 기출 밖 옵션을 항목으로 늘어놓지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
