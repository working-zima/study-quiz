# Step 14: iptables

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 `linux-servers`의 마지막 개념(23 iptables)의 글·문항·도식을 만들고, 이 주제와 phase의 개념 쓰기를 끝낸다.** 개념이 하나이므로 쓰기를 마친 뒤 주제 전체(9개념)를 통독하는 데 시간을 쓴다.

기출은 바깥에서 들어오는 Telnet 접속을 막는 규칙을 iptables 규칙 넷 가운데 고르게 한다([기출 2024-05-19 #44] — 오답은 `OUTPUT` 체인, `udp`, 포트 `21`). BIND 문항([기출 2025-05-25 #42])은 방화벽을 `iptables`로 설정할 수 있다는 것을 맞는 말로 둔다.

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 9 `summary`(iptables의 체인·테이블·규칙의 차례·조각의 뜻·대상·`-L`·nftables, 기출 규칙 넷의 판정)와 step 10~13 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 79 step 9)」 줄과 iptables(8)·iptables-extensions(8)·netfilter 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 10~13이 쓴 `linux-servers` 여덟 개념** — 특히 `bind-named`의 UDP·TCP `53`, `apache-listen`의 `8080`, `ports`·`tcp-udp`의 포트·TCP·UDP 풀이, `app-protocols-mail-file.ssh`의 Telnet — 뜻을 맞춘다),
  `src/data/network/questions.json`, `src/data/network/visuals/linux-servers.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 10~13이 만든 도식과 그 테스트, 선례 `NetstatLinuxOptionsDiagram`(명령 줄의 조각)·`FirewallHubDiagram`과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-05-19 #44], [기출 2025-05-25 #42] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-servers` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 23 | `linux-servers.iptables` | iptables | — | **패킷**(네트워크로 오가는 데이터의 덩어리 — 한 줄), **커널**(운영체제의 핵심 프로그램 — 한 줄), **방화벽**(허락하지 않은 통신을 막는 장치나 프로그램 — 이 주제의 앞 개념이 풀었으면 다시 풀지 않는다)을 푼다. iptables가 Linux 커널의 패킷 거르기 기능(netfilter)에 규칙을 넣고 빼고 보는 명령이라는 것(step 9 결과대로). **체인** 셋 — `INPUT`(이 컴퓨터로 들어오는 패킷), `OUTPUT`(이 컴퓨터가 내보내는 패킷), `FORWARD`(이 컴퓨터를 거쳐 지나가는 패킷)와 기본 테이블 `filter`(한 줄). 규칙은 위에서부터 견주어 처음 맞는 규칙의 대상을 따르고, 맞는 것이 없으면 체인의 기본 정책을 따른다(step 9 결과대로). 규칙 한 줄을 조각마다 읽는다 — `iptables -A INPUT -p tcp --dport 8080 -j DROP`: `-A INPUT`(INPUT 체인 끝에 더한다), `-p tcp`(TCP 패킷만), `--dport 8080`(목적지 포트가 `8080`인 것), `-j DROP`(버린다)(「예시 값」). 대상 `ACCEPT`·`DROP`·`REJECT`의 차이(step 9 결과대로). DNS 서버라면 `-p udp --dport 53 -j ACCEPT`와 `-p tcp --dport 53 -j ACCEPT`를 함께 둔다는 예(이 주제의 `bind-named`와 뜻을 맞춘다). **`INPUT`과 `OUTPUT`이 무엇이 다른지**(4절 — 바깥에서 들어오는 연결을 막으려면 `INPUT`), **`tcp`와 `udp`를 바꿔 적으면 맞지 않는다는 것**(4절). 규칙 목록 보기 `iptables -L`, 뒤를 잇는 nftables는 step 9 결과대로 한 줄씩 |

쓰기를 마친 뒤 **주제 `linux-servers`의 아홉 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이, `dns` 주제와 뜻이 어긋나는 곳)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다.

### 2. 문항 — `src/data/network/questions.json`에 `n255`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n255` | `iptables` | 4지선다 「상황 적용」 — 본문·기출과 다른 서비스의 장면(예: 이 서버로 바깥에서 들어오는 SSH 접속(TCP `22`)을 막고 싶다, 또는 바깥에서 들어오는 DNS 질의(UDP `53`)만 받고 싶다)을 주고 맞는 규칙을 고르게 한다. 정답 하나(`iptables -A INPUT -p tcp --dport 22 -j DROP` 꼴), 오답은 흔한 실수 — `OUTPUT`으로 적은 것, 프로토콜을 바꾼 것, 다른 포트를 적은 것(같은 실수 범주라도 **기출의 규칙 넷(Telnet `23`·`21`)과 같은 묶음이 되지 않게** 서비스와 포트를 바꾼다). 보기마다 「이 규칙이 그 패킷을 막는가」를 따져 정답이 하나뿐인지 본다. 문항 글에 백틱을 쓰지 않는다. **정답 위치 3** |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 49·아니요 50, 정답 위치 39/39/39/39.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `linux-servers.iptables` — `IptablesChainsDiagram`, JSON 키 `iptables-chains`

- 물음형 제목 예: `패킷은 어느 체인의 규칙을 지날까?`
- 그릴 것: 이 컴퓨터(그룹 박스)와 그 안의 프로그램(이름표 — 예: 웹 서버), 바깥(이름표), 지나가는 패킷이 향하는 다른 곳(이름표). 패킷의 세 길 — 바깥 → `INPUT` → 프로그램, 프로그램 → `OUTPUT` → 바깥, 바깥 → `FORWARD` → 다른 곳 — 을 직교 경로와 체인 노드로. 아래에 본문 예 규칙 `iptables -A INPUT -p tcp --dport 8080 -j DROP`을 조각 넷(`-A INPUT`·`-p tcp`·`--dport 8080`·`-j DROP`) 노드로 나눠 두고 곁말로 뜻을 단다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `input` | 들어오는 패킷 | 바깥 → `INPUT` → 프로그램의 길 | 이 컴퓨터로 들어오는 패킷은 `INPUT`의 규칙을 지난다 |
  | `output` | 나가는 패킷 | 프로그램 → `OUTPUT` → 바깥의 길 | 이 컴퓨터가 내보내는 패킷은 `OUTPUT`의 규칙을 지난다 |
  | `forward` | 지나가는 패킷 | 바깥 → `FORWARD` → 다른 곳의 길 | 거쳐 지나가는 패킷은 `FORWARD`의 규칙을 지난다 |
  | `rule` | 규칙 읽기 | 규칙 조각 넷 | 체인·프로토콜·목적지 포트가 맞는 패킷에 대상을 적용한다 |

- 요점 테스트: `input`에서 보이는 경로가 `INPUT` 노드를 지나고 `OUTPUT`·`FORWARD` 노드는 흐리다. 규칙 조각 노드의 왼쪽→오른쪽(또는 위→아래) 차례가 본문 규칙의 차례와 같고, 이어 붙이면 본문 규칙 문자열이 된다(테스트에서 견준다). 색으로 막힘을 가르지 않는다(곁말 「버린다」 등 본문의 말).

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 255개, 마지막 id는 `n255`다. 균형은 예 49·아니요 50, 정답 위치 39/39/39/39이어야 한다(계획과 다르면 어느 step에서 달라졌는지 summary에 적는다).

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 9 summary가 「쓰지 않는다」로 정한 것(`nat` 테이블·연결 추적 등)을 지켰는가. 규칙 조각의 뜻이 iptables(8)·iptables-extensions(8)와 같은가.
3. n255의 보기 넷을 하나씩 「이 패킷이 이 규칙에 맞는가」로 따져 정답이 하나뿐인지 본다.
4. 주제 `linux-servers`의 아홉 개념을 통독한다(「작업」 1). 도식 아홉 개의 문구도 함께 읽는다.
5. phase 전체로 — 두 주제의 개념 23개·문항 30개·도식 23개가 모두 들어갔는지, `topics.json`의 주제 차례(`dns`가 `tcp-connection` 뒤, `linux-servers`가 `linux-accounts` 뒤)와 registry의 두 자리를 다시 본다.
6. `phases/79-network-dns-linux-servers/index.json`의 step 14를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(「앞 개념에 고칠 것」에 통독 결과).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **step 10~13의 개념·문항·도식과 `dns` 주제를 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
- **iptables의 `nat`·`mangle` 테이블, 연결 추적(`-m state`·`conntrack`), 규칙 저장·복원, nftables의 문법을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **step 9가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
