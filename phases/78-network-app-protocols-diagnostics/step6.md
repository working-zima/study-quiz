# Step 6: snmp-mib

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 주제 `app-protocols-mgmt-security`를 만들고 그 첫 개념 둘(9 SNMP, 10 MIB)의 글·문항·도식을 함께 만든다.** 10은 9에 딸린 개념이다.

기출은 SNMP를 일곱 번 묻는다 — 원격 장치의 설정과 감시를 맡는 응용 계층 프로토콜이라는 것, TCP가 아니라 UDP를 쓴다는 것(3회), 매니저가 에이전트와 통신해 상태를 조회하거나 설정을 바꾼다는 것,
에이전트가 관리 정보를 갖고 있다는 것([기출 2026-08-02 #16]의 오답 「에이전트는 관리 정보를 DB에 저장하지 않는다」가 틀린 말).

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 5 `summary`(SNMP·MIB에 무엇을 쓰고 무엇을 쓰지 않는지, OID의 가지 이름과 번호, E 항목)와 step 1~4 `summary`의 형식
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 78 step 5)」 항목 — RFC 3410·3411·3416·3417·2578·3418·1157), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(`app-protocols-mail-file`의 첫 개념 — 프로토콜·TCP·포트를 어떻게 풀었는지, `protocols-encapsulation.tcp-ip-model`의 응용 계층, `tcp-udp.udp` — 뜻을 맞춘다), `src/data/network/questions.json`, `src/data/network/index.ts`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `DirectoryTreeDiagram`(나무), `IcmpFeedbackDiagram`(장치 사이 차례), step 1~4가 만든 도식과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-05-19 #7·#14], [기출 2024-11-03 #13], [기출 2025-02-23 #9], [기출 2025-08-24 #16], [기출 2025-11-02 #3], [기출 2026-08-02 #16] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`

`app-protocols-mail-file` 주제 객체 바로 뒤에 주제 객체를 더한다 — `{ "id": "app-protocols-mgmt-security", "title": "관리·시간·보안 프로토콜", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 3(★★★, 출제 9/11회)인지 `data.test.ts`의 주제 지도 표와 견준다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `app-protocols-mgmt-security.snmp` | SNMP (Simple Network Management Protocol) | — | 이 주제의 첫 개념이라 **프로토콜**, **응용 계층**(프로그램끼리 주고받는 내용을 정하는 맨 위 계층 — 한 줄), **네트워크 장비**(라우터·스위치 등 — 한 줄씩), **UDP와 TCP**(한 줄씩 — 확인 없이 따로 보내는 방식과 연결을 맺고 확인하며 보내는 방식), **포트**(한 줄)를 짧게 푼다. 매니저와 에이전트가 무엇이고 어디서 실행되는지, 매니저가 묻고(조회) 바꾸게 하는(설정) 것, 에이전트가 `161`번에서 기다린다는 것, UDP를 쓴다는 것과 그 까닭·권고의 세기는 step 5 결과대로. 예: 관리 시스템 한 대가 「라우터 1」·「스위치 1」을 관리한다(「예시 값」 — 이름표). **매니저와 에이전트가 무엇이 다른지**(4절). 지금 표준 SNMPv3를 한 줄 |
| 10 | `app-protocols-mgmt-security.mib` | MIB (Management Information Base) | `snmp` | 에이전트가 관리 정보를 관리 객체로 모아 둔 정보 저장소, 객체마다 이름표 OID. 예: 「라우터 1」이 켜진 뒤 흐른 시간 `sysUpTime`의 OID `1.3.6.1.2.1.1.3`을 **나무를 따라 한 단계씩** 읽는다 — step 5 summary의 가지 이름과 번호 그대로(예: `1` iso → `3` org → … → `3` sysUpTime). 값을 물을 때의 `.0`은 step 5 결과대로. 매니저가 이 OID로 물으면 에이전트가 자기 MIB의 값을 돌려준다는 차례. **값을 만드는 쪽이 매니저가 아니라 에이전트라는 것**(4절 — 매니저와 에이전트의 몫). MIB 모듈(정의 문서)이라는 뜻은 step 5 결과대로 한 줄 |

### 2. 문항 — `src/data/network/questions.json`에 `n206`~`n208`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n206` | `snmp` | 4지선다 「원리 이해」 — 관리 시스템의 매니저가 장비의 에이전트에게 값을 묻는 상황을 주고, 그 요청이 어떤 전송 방식으로 어느 쪽의 어느 포트로 가는지 고르게 한다. 정답: UDP로 에이전트의 `161`번(step 5 결과대로). 오답은 같은 꼴 — TCP로 `161`번, UDP로 매니저의 `162`번(트랩을 받는 쪽과 바꾼 것), TCP로 에이전트의 다른 번호. 기출의 `181`·`143`과 기출 묶음 넷을 쓰지 않는다. **정답 위치 1** |
| `n207` | `snmp` | 예/아니요 「오해 바로잡기」 — step 4가 끝난 뒤의 균형(계획대로면 예 38·아니요 38)에서 **예** 쪽으로 세운다. 예: 매니저가 SNMP로 장비의 설정 값을 바꾸게 할 수도 있는가(예 — 감시만 하는 것이 아니다). n206과 다른 것을 묻는다. 해설은 조회와 설정, 매니저와 에이전트의 몫을 가르친다 |
| `n208` | `mib` | 예/아니요 「오해 바로잡기」 — n207 뒤의 균형(계획대로면 예 39·아니요 38)에서 **아니요** 쪽으로 세운다. 예: 에이전트가 관리 정보를 따로 갖고 있지 않아서, 매니저가 물을 때마다 매니저 쪽에서 그 값을 만들어 내는가(아니요). 기출 [2026-08-02 #16]의 보기 문장을 옮기지 않는다. 해설은 MIB와 OID, 에이전트가 값을 돌려주는 차례를 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 39·아니요 39, 정답 위치 33/33/32/32.

### 3. 도식

이 step이 `src/data/network/visuals/app-protocols-mgmt-security.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'app-protocols-mgmt-security': appProtocolsMgmtSecurityVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」 — `'app-protocols-mail-file'` 항목 바로 뒤).

#### 3-1. `app-protocols-mgmt-security.snmp` — `SnmpRolesDiagram`, JSON 키 `snmp-roles`

- 물음형 제목 예: `SNMP에서 누가 묻고 누가 답할까?`
- 그릴 것: 관리 시스템(매니저) 노드 하나와 장비 둘(「라우터 1」·「스위치 1」 — 각각 안에 에이전트, 그룹 박스나 곁말). 매니저에서 에이전트로 가는 요청 경로와 돌아오는 응답 경로, 곁말로 UDP·`161`. 280 폭에서 장비 둘을 나란히 두기 어려우면 세로로 쌓는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `query` | 조회 | 매니저·「라우터 1」의 에이전트와 요청·응답 경로 | 매니저가 묻고 에이전트가 값을 돌려준다 |
  | `set` | 설정 | 매니저·「스위치 1」의 에이전트와 설정 요청 경로 | 매니저가 에이전트에게 값을 바꾸게 한다 |
  | `transport` | UDP | 요청 경로의 곁말(UDP·`161`) | 요청은 UDP로 에이전트의 `161`번에 간다 |

- 요점 테스트: 요청 경로는 모두 매니저 노드에서 시작해 에이전트 노드에서 끝난다. `transport`의 곁말에 `UDP`와 `161`이 있고 `TCP`는 없다. 에이전트 노드는 장비 그룹 안에 있다.

#### 3-2. `app-protocols-mgmt-security.mib` — `MibTreeDiagram`, JSON 키 `mib-tree`

- 물음형 제목 예: `OID는 MIB의 값을 어떻게 가리킬까?`
- 그릴 것: OID 나무의 한 갈래 — `iso(1)`부터 `sysUpTime(3)`까지 가지 노드를 위에서 아래로 직교 경로로(선례 `DirectoryTreeDiagram`), 맨 아래에 완성된 OID `1.3.6.1.2.1.1.3`. 280 폭에서 노드 여덟 개가 한 줄로 들지 않으므로 세로로 쌓고, 가로형은 두 줄로 꺾는다. 매니저의 요청이 이 OID로 에이전트의 MIB에 닿는 작은 그림을 곁에 둘지는 판단.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `path` | 나무 따라가기 | 가지 노드 전부 | 가지 번호를 위에서부터 점으로 이으면 OID가 된다 |
  | `object` | 관리 객체 | `sysUpTime(3)`과 완성된 OID | 이 OID가 가리키는 값은 장비가 켜진 뒤 흐른 시간이다 |
  | `agent` | 값은 에이전트에 | OID 노드와 에이전트 쪽 노드 | 매니저가 OID로 묻고 에이전트가 MIB의 값을 돌려준다 |

- 요점 테스트: 가지 노드의 라벨에서 번호를 위에서부터 차례로 뽑아 점으로 이으면 `1.3.6.1.2.1.1.3`이다(step 5 summary와 같다). `object`에서 선명한 노드 라벨에 `sysUpTime`이 있다. 가지 경로가 모두 위 노드의 아래 변에서 시작한다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 208개, 마지막 id는 `n208`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `app-protocols-mail-file` 바로 뒤·`linux-filesystem` 앞에 있고, `importance` 3·`sourcePages` [0, 0]인지, `data.test.ts`의 주제 지도·`sourcePages`·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 5 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가.
4. OID를 가지 하나씩 손으로 다시 읽고(두 번), n206의 오답 셋이 정말 틀린지 따진다.
5. `phases/78-network-app-protocols-diagnostics/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 11~17을 만들거나 `app-protocols-mail-file`을 고치지 마라.** 이유: 다른 step의 범위다. 이 step의 글이 트랩·버전을 쓸 때는 한 줄 풀이로 그친다.
- **step 5가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
- **SNMP 메시지의 형식(PDU 칸), SMI의 자료형, MIB 모듈의 문법을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
