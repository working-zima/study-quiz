# Step 7: snmp-poll-versions

## 배경

phase 78은 네트워크 과목의 `app-protocols-mail-file`·`app-protocols-mgmt-security`·`diagnostic-commands`를 만든다. 전체 계획·결정·공통 규칙은 `phases/78-network-app-protocols-diagnostics/guide.md`에 있다.
**이 step은 `app-protocols-mgmt-security`의 개념 둘(11 SNMP의 폴링과 트랩, 12 SNMP의 버전과 보안)의 글·문항·도식을 함께 만든다.** 둘 다 9 `snmp`에 딸린 개념이다.

기출은 SNMP가 주기적으로 폴링해 상태 정보를 모은다는 것과 폴링의 부담([기출 2024-05-19 #7] — step 5의 판정대로), SNMPv2c가 암호화와 인증을 기본으로 준다는 보기가 틀린 말이라는 것([기출 2025-08-24 #16])을 묻는다.

## 읽어야 할 파일

- **`phases/78-network-app-protocols-diagnostics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/78-network-app-protocols-diagnostics/index.json`의 step 5 `summary`(SNMP 메시지 이름과 방향, 버전·커뮤니티 문자열·USM의 근거, E 항목)와 step 6 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 78 step 5)」 항목 — RFC 3416·3417·1157·1901·3410·3414), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 6이 쓴 `snmp`·`mib`** — 이미 푼 낱말과 예시 값을 확인한다), `src/data/network/questions.json`, `src/data/network/visuals/app-protocols-mgmt-security.json`,
  `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 6이 만든 `SnmpRolesDiagram`·`MibTreeDiagram`과 그 테스트, 선례 `IcmpFeedbackDiagram`, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-05-19 #7], [기출 2025-02-23 #9], [기출 2025-08-24 #16] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `app-protocols-mgmt-security` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `app-protocols-mgmt-security.snmp-operations` | SNMP의 폴링과 트랩 | `snmp` | 두 방향을 차례대로 — **폴링**: 매니저가 정해 둔 간격(예: 5분 — 예시 값이라고 밝힌다)마다 「라우터 1」의 에이전트에게 `GetRequest`로 값을 묻고 `Response`를 받는다, 값을 바꿀 때는 `SetRequest`. **트랩**: 「스위치 1」의 인터페이스가 끊기면 에이전트가 묻지 않았는데도 매니저의 `162`번으로 알린다. 메시지 이름과 방향, 확인 응답을 받는 알림(`InformRequest`)은 step 5 summary대로. 폴링의 부담(장비 수와 간격)은 step 5 결과대로 — 근거가 없으면 쓰지 않거나 「자격시험은」 줄. **폴링과 트랩이 무엇이 다른지**(4절 — 누가 먼저 보내는지, 받는 쪽 포트 `161`과 `162`). 트랩만으로 다 알 수 없어 둘을 함께 쓴다는 것은 근거가 있을 때만 |
| 12 | `app-protocols-mgmt-security.snmp-versions` | SNMP의 버전과 보안 | `snmp` | **목록 개념** — 소개 문단(판마다 요청을 누가 보냈는지 가리는 방법과 보안이 다르다) 뒤에 항목 셋: `- **SNMPv1**은 …`, `- **SNMPv2c**는 …`, `- **SNMPv3**는 …`. 커뮤니티 문자열(한 줄 풀이)이 메시지에 암호화되지 않은 채 실려 중간에서 엿보면 알아낼 수 있다는 것, v3의 USM이 더하는 인증과 암호화(step 5 결과대로). 예: 매니저와 에이전트가 커뮤니티 문자열 `netops`(「예시 값」 — 흔한 기본값 이름을 쓰지 않는다)를 맞춰 둔 v2c 요청. 항목 뒤 문단: **커뮤니티 문자열은 암호처럼 쓰지만 암호화가 아니다**(4절), v2c가 암호화와 인증을 기본으로 준다는 말은 틀렸다는 것. RFC 1157·1901의 상태(역사 기록)는 step 5 결과대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n209`~`n210`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n209` | `snmp-operations` | 4지선다 「상황 적용」 — 장비에 일이 생긴 순간 매니저가 바로 알게 하려는 상황(본문 예와 다른 장비·일)을 주고, 어떤 메시지가 누구에게서 누구에게 가는지 고르게 한다. 정답: 에이전트가 매니저에게 보내는 트랩. 오답은 같은 꼴(메시지 이름 + 방향) — 매니저가 보내는 `GetRequest`, 매니저가 보내는 `SetRequest`, 에이전트가 보내는 `Response`(묻지 않으면 오지 않는다). 메시지 이름은 step 5 summary대로. **정답 위치 2** |
| `n210` | `snmp-versions` | 예/아니요 「오해 바로잡기」 — step 6이 끝난 뒤의 균형(계획대로면 예 39·아니요 39)에서 **아니요** 쪽으로 세운다. 예: SNMPv2c 요청을 중간에서 엿본 사람이 커뮤니티 문자열을 알아낼 수 없는가 — 이중 부정을 피하려면 「SNMPv2c는 주고받는 메시지를 암호화하는가」(아니요). 기출 [2025-08-24 #16]의 보기 문장을 옮기지 않는다. 해설은 커뮤니티 문자열이 어떻게 실려 가는지와 v3가 더하는 것을 가르친다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 39·아니요 40, 정답 위치 33/33/33/32.

### 3. 도식

#### 3-1. `app-protocols-mgmt-security.snmp-operations` — `SnmpPollTrapDiagram`, JSON 키 `snmp-poll-trap`

- 물음형 제목 예: `SNMP 메시지는 누가 먼저 보낼까?`
- 그릴 것: 두 기둥 — 매니저, 에이전트 — 사이에 메시지를 위에서 아래로. 폴링 쪽(`GetRequest` → `Response`, `SetRequest` → `Response` — 에이전트의 `161`)과 트랩 쪽(트랩 — 매니저의 `162`)을 그룹 박스로 나눈다. 방향은 노드 양옆의 짧은 화살표.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `poll` | 폴링 | `GetRequest`·`Response` | 매니저가 간격마다 묻고 에이전트가 답한다 |
  | `set` | 설정 | `SetRequest`·`Response` | 값을 바꿀 때도 매니저가 먼저 보낸다 |
  | `trap` | 트랩 | 트랩 노드 | 일이 생기면 에이전트가 묻지 않아도 매니저의 `162`번으로 알린다 |

- 요점 테스트: `trap`에서 선명한 메시지 노드의 화살표 방향이 에이전트에서 매니저 쪽이고, `poll`·`set`의 요청 노드는 매니저에서 에이전트 쪽이다. 트랩 쪽 곁말에 `162`가, 폴링 쪽 곁말에 `161`이 있다.

#### 3-2. `app-protocols-mgmt-security.snmp-versions` — `SnmpVersionsDiagram`, JSON 키 `snmp-versions`

- 물음형 제목 예: `중간에서 엿보면 무엇이 보일까?`
- 그릴 것: 매니저에서 에이전트로 가는 같은 요청 하나를 두 줄로 — v2c 줄(메시지 안에 커뮤니티 문자열 `netops`가 그대로, 곁말 「그대로 보임」)과 v3 줄(메시지가 인증·암호화됨, 곁말 「암호화됨」 — 본문의 말로). 중간에서 엿보는 쪽을 노드로 둘지는 판단. 색·자물쇠 그림을 쓰지 않는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `v2c` | SNMPv2c | v2c 줄과 커뮤니티 문자열 | 커뮤니티 문자열이 암호화되지 않은 채 실려 엿보면 알아낼 수 있다 |
  | `v3` | SNMPv3 | v3 줄 | v3는 인증과 암호화를 더해 엿보거나 바꿔치기 어렵게 한다 |

- 요점 테스트: `v2c`에서 선명한 노드 라벨에 `netops`가 있고 `v3`에서는 그 노드가 흐리다. `v2c`의 곁말에 「그대로」가, `v3`의 곁말에 암호화가 있다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~15)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 210개, 마지막 id는 `n210`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 6이 이미 푼 낱말을 다시 풀지 않았는가.
   메시지 이름과 방향, 포트가 step 5 summary·RFC 3416·3417과 같은가(문장을 옮기지 않고).
3. n209의 오답 셋이 그 상황에서 정말 틀린지 따진다.
4. `phases/78-network-app-protocols-diagnostics/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 13~17을 만들거나 step 6의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
- **step 5가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
- **`GetBulkRequest`·`Report`의 세부, USM의 키 계산과 알고리즘 이름, VACM의 규칙을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
