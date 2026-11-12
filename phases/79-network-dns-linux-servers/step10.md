# Step 10: resolv-bind

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 주제 `linux-servers`를 만들고 그 첫 개념 둘(15 DNS 클라이언트 설정 파일, 16 BIND와 named)의 글·문항·도식을 함께 만든다.** 둘 다 머리 개념이다.

기출은 DNS 서버의 주소가 잘못돼 이름 풀이가 되지 않을 때 고치는 파일로 `/etc/resolv.conf`를 고르게 하고([기출 2024-05-19 #28]),
BIND를 운영할 때 할 일 가운데 「방화벽에서 UDP 53번만 열면 된다」를 틀린 말로 둔다 — 맞는 말로 두는 것은 `iptables`로 방화벽 설정, `named-checkconf`로 설정 파일 검사다([기출 2025-05-25 #42]).

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 9 `summary`(`resolv.conf`의 줄, BIND·`named`·`named.conf`·`zone` 문의 꼴, 검사 명령, E 번호)와 step 8 `summary`의 「앞 개념에 고칠 것」
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 79 step 9)」 줄과 resolv.conf(5)·nsswitch.conf(5)·BIND 9 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(`dns` 주제 전체 — 특히 `hosts-file`·`name-servers`·`dns-zone`·`dns-transport`의 말과 예시 값, `linux-process-boot`의 데몬·`systemctl` — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `FstabFieldsDiagram`·`PasswdFieldsDiagram`(설정 줄의 칸), `HostsFileDiagram`(step 1 — 같은 주제가 아니지만 이름 풀이 차례를 맞춘다)과 그 테스트, `src/data/network/visuals/linux-accounts.json`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-05-19 #28], [기출 2025-05-25 #42] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`linux-accounts` 주제 객체 바로 뒤(지금 배열의 맨 끝)에 주제 객체를 더한다 — `{ "id": "linux-servers", "title": "Linux 서버 설정", "importance": 2, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 2(★★☆, 출제 8/11회)인지 `data.test.ts`의 주제 지도 표와 견준다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 15 | `linux-servers.resolv-conf` | DNS 클라이언트 설정 파일 | — | 이 주제의 첫 개념이라 **서버**(요청을 받아 일을 해 주는 프로그램이나 컴퓨터), **설정 파일**(프로그램이 어떻게 동작할지 적어 둔 글자 파일), **DNS**(이름으로 IP 주소를 찾아 주는 시스템)·**DNS 서버**, **이름 풀이**, **IP 주소**를 한 줄씩 푼다(`dns` 주제의 말과 뜻을 맞춘다). `/etc/resolv.conf`가 이 컴퓨터가 이름을 풀 때 물을 DNS 서버의 주소를 적는 파일이라는 것. 줄 셋을 예로 읽는다 — `nameserver 192.0.2.53`, `nameserver 192.0.2.54`, `search example.com`(「예시 값」, step 9의 꼴대로): 두 서버를 적은 차례대로 묻는다는 것(한도와 차례의 근거는 step 9 결과대로), `server1`처럼 짧은 이름을 쓰면 `server1.example.com`을 붙여 묻는다는 것. **`/etc/hosts`와 무엇이 다른지**(4절 — 이름과 주소의 짝 자체와, 짝을 물어볼 서버의 주소). 둘 가운데 무엇을 먼저 보는지 정하는 `/etc/nsswitch.conf`(step 9·0 결과대로 한 줄). DNS 서버 주소를 잘못 적으면 이름으로 접속하지 못한다는 원인과 결과를 한 줄 |
| 16 | `linux-servers.bind-named` | BIND와 named | — | **BIND**(ISC가 만드는 DNS 서버 프로그램 — step 9 결과대로), 데몬 **`named`**(뒤에서 늘 실행되며 질의를 기다리는 프로그램 — `linux-process-boot`의 데몬과 뜻을 맞춘 한 줄). 설정 파일 `named.conf`의 구성 — 서버 전체의 설정을 적는 `options` 문과 맡을 영역마다의 `zone` 문(영역·주 서버·보조 서버를 이 화면에서 한 줄씩 다시 푼다). 예 `zone` 문 하나 — `example.com` 영역을 주 서버로 맡고 영역 파일 이름을 적는다(step 9의 꼴대로, 「예시 값」). 설정 검사 명령 `named-checkconf`(설정 파일의 문법)와 `named-checkzone`(영역 파일)이 무엇을 검사하는지와 언제 쓰는지(고친 뒤 다시 읽히기 전에 — step 9 결과대로). DNS 서버는 UDP `53`과 TCP `53`을 함께 열어야 한다(한 줄 — `dns.dns-transport`와 뜻을 맞춘다. 방화벽 설정 명령은 이름만 — iptables의 꼴은 이 주제의 다른 개념이 다룬다는 말은 쓰지 않는다). `zone` 문의 `type` 값 옛 이름(`master`·`slave`)은 step 9 결과대로 한 줄 |

### 2. 문항 — `src/data/network/questions.json`에 `n245`~`n246`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n245` | `resolv-conf` | 4지선다 「상황 적용」 — 본문과 다른 값의 장면(예: Linux 서버에서 `ping 203.0.113.10`은 응답이 오는데 `ping www.example.org`는 「이름을 찾을 수 없다」는 오류가 난다. `/etc/resolv.conf`에 적힌 DNS 서버 주소가 잘못돼 있었다)을 주고, 무엇을 고쳐야 하는지 고르게 한다 — 보기는 파일 이름이 아니라 「고칠 줄」로(정답: `nameserver` 줄의 주소를 바른 DNS 서버 주소로. 오답은 같은 범주의 헷갈리는 수정 — `/etc/hosts`에 DNS 서버의 주소를 적는다, `search` 줄에 DNS 서버의 주소를 적는다, `nameserver` 줄에 도메인 이름을 적는다 — 오답이 출처로 정말 틀렸는지 따진다). 기출 묶음(`resolv.conf`·`networks`·`protocols`·`services`)을 쓰지 않는다. 문항 글에 백틱을 쓰지 않는다. **정답 위치 1** |
| `n246` | `bind-named` | 예/아니요 「원인과 결과」 — 시작 때 균형(예 47·아니요 48)에서 **예** 쪽으로 세운다. 예: BIND를 쓰는 DNS 서버의 방화벽에서 UDP 53번만 열고 TCP 53번을 막아 두면, 응답이 커서 TCP로 다시 묻는 질의나 보조 서버의 영역 전송이 실패하는가(예). 기출의 문장 「UDP 53번만 열면 된다」를 그대로 쓰지 않는다. 해설은 DNS가 TCP를 쓰는 때와 `named-checkconf`의 쓰임을 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 48·아니요 48, 정답 위치 38/38/37/37.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

이 step이 `src/data/network/visuals/linux-servers.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'linux-servers': linuxServersVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」 — `'linux-accounts'` 바로 뒤, 지금 맨 끝).

#### 3-1. `linux-servers.resolv-conf` — `ResolvConfDiagram`, JSON 키 `resolv-conf`

- 물음형 제목 예: `Linux는 이름을 풀 때 어느 DNS 서버에 물을까?`
- 그릴 것: `/etc/resolv.conf`의 본문 예 줄 셋(`nameserver 192.0.2.53`·`nameserver 192.0.2.54`·`search example.com`)을 줄마다 노드로(그룹 박스 「`/etc/resolv.conf`」), 옆이나 아래에 이 컴퓨터가 `server1`을 풀 때의 흐름 — 붙여 만든 이름 `server1.example.com` → 첫 DNS 서버 `192.0.2.53`에 묻기(→ 답이 없을 때 둘째 서버 — 본문에 쓴 만큼).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `servers` | 물을 서버 | `nameserver` 두 줄과 DNS 서버 노드 | 적어 둔 DNS 서버에 적은 차례대로 묻는다 |
  | `search` | 짧은 이름 | `search` 줄과 붙여 만든 이름 | 짧은 이름에는 `search`의 도메인을 붙여 묻는다 |

  둘째 서버로 넘어가는 차례를 본문에 근거와 함께 썼으면 `fallback` 시나리오를 더한다(첫 서버가 답하지 않을 때 둘째 서버에 묻는다).
- 요점 테스트: `servers`에서 선명한 DNS 서버 노드의 주소가 `nameserver` 줄의 주소와 같다. `search`에서 붙여 만든 이름 노드가 `search` 줄의 도메인으로 끝난다. 그룹 박스는 흐려지지 않는다.

#### 3-2. `linux-servers.bind-named` — `NamedFilesDiagram`, JSON 키 `named-files`

- 물음형 제목 예: `BIND는 어떤 파일을 읽고 무엇을 열어 둘까?`
- 그릴 것: 데몬 `named` 노드, 그것이 읽는 `named.conf`(안에 `options` 문과 본문 예의 `zone` 문 — 그룹 박스), `zone` 문이 가리키는 영역 파일, 검사 명령 둘(`named-checkconf` → `named.conf`, `named-checkzone` → 영역 파일), 그리고 `named`가 질의를 받는 포트 UDP `53`·TCP `53`. 직교 경로만.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `config` | 설정 | `named`·`named.conf`·`zone` 문·영역 파일 | `named`는 `named.conf`를 읽고, `zone` 문이 가리키는 영역 파일로 답한다 |
  | `check` | 검사 | 검사 명령 둘과 그 대상 | 고친 뒤에는 설정 파일과 영역 파일을 각각 검사한다 |
  | `ports` | 포트 | `named`와 UDP `53`·TCP `53` | DNS 서버는 UDP와 TCP의 `53`번을 함께 열어 둔다 |

- 요점 테스트: `named-checkconf`의 경로는 `named.conf`에, `named-checkzone`의 경로는 영역 파일에 닿는다(서로 바뀌지 않는다). `ports`에서 선명한 포트 노드가 둘이고 하나는 UDP, 하나는 TCP다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 246개, 마지막 id는 `n246`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `linux-accounts` 바로 뒤(맨 끝)에 있고, `importance` 2·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다. `dns` 주제가 그대로 `tcp-connection` 뒤에 있는지도 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. step 9 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가. 설정 줄의 꼴이 출처의 꼴과 같은가(문장을 옮기지 않고).
4. n245의 장면을 `resolv.conf`의 사실로 따라가 정답과 오답이 맞는지 따진다.
5. `phases/79-network-dns-linux-servers/index.json`의 step 10을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 17~23을 만들지 마라.** 이유: step 11~14의 범위다. 이 step의 글이 `options` 문을 쓸 때는 「서버 전체 설정을 적는 곳」이라는 한 줄로 그친다.
- **`dns` 주제의 개념·문항·도식을 고치지 마라.** 이유: step 1~8이 만들었다. 어긋남을 찾으면 summary에 적는다.
- **`rpm`·`yum`·`sudo`·`rndc`를 쓰지 마라.** 이유: guide.md 「배경」 — 기출이 묻지 않거나 출처를 더하지 않기로 했다.
- **step 9가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
