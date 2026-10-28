# Step 14: ping-igmp

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 11~13이 개념 19~24를 넣었다. **이 step은 25 ping과 26 IGMP의 글·문항·도식을 만들어 `icmp`의 개념 8개와 phase의 개념 26개를 끝낸다.** 26은 강의에 없고 기출이 일곱 번 물었다 — 사실은 `standards.md`의 RFC에서만 가져온다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-3 ICMP」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`, `docs/source/network/interview-facts.md`의 Q31
- `docs/source/network/raw/lecture.md`의 p156 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), 이 주제에서 앞 step이 만든 도식과 `src/data/network/visuals/icmp.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

주제 `icmp`의 `concepts` 끝에 덧붙인다. 개념은 guide.md 표의 25 ping, 26 IGMP이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 25 | `icmp.ping` | ping | `icmp.icmp` | 결과의 예를 예시 값으로 직접 만든다(보낸 4·받은 3처럼 — 강의 p156의 출력을 옮기지 않는다). 손실률, 왕복 시간(RTT — 이 주제 안에서 한 줄로 푼다) 최소·평균·최대, 응답의 TTL(step 0·1의 처리대로 — 초가 아니다). 문제를 알려 줄 뿐 고치지 않는다. 옵션은 강의 그림의 횟수 옵션 한 줄(Linux `-c`, Windows는 step 1 결과대로)만 |
| 26 | `icmp.igmp` | IGMP (Internet Group Management Protocol) | — | 멀티캐스트·그룹을 한 줄로 푼다(RFC 1112). 같은 네트워크의 멀티캐스트 라우터가 그룹 구성원을 알게 하는 프로토콜, 질의·보고·탈퇴(판은 step 1 결과대로), IP에 담겨 가는 네트워크 계층 프로토콜, 같은 네트워크 밖으로 나가지 않는다(TTL 1 — step 1 결과대로), 유니캐스트용이 아니다. ICMP와 견주는 4절 문단(같은 계층·같이 IP에 담기지만 하는 일이 다르다). 기출의 「비대칭·TTL 제공·IGMPv1 재전송」 처리는 step 1 summary대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n077`~`n079`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n077` | `ping` | 4지선다 「상황 적용」 감 — 예시 결과(보낸 수·받은 수·RTT 줄)를 주고 맞는 해석 하나를 고르게 한다(손실률, 평균 왕복 시간, TTL의 뜻). 숫자는 본문 예와 다르게 |
| `n078` | `igmp` | 4지선다 「원리 이해」 감 — IGMP가 멀티캐스트 라우터에게 알려 주는 것(같은 네트워크에 어느 그룹의 구성원이 있는지). 오답은 다른 네트워크 계층 프로토콜의 일(오류 알림 — ICMP, MAC 주소 찾기 — ARP, 경로 찾기 등) |
| `n079` | `igmp` | 예/아니요 감 — n078과 다른 것: 「IGMP 메시지는 다른 네트워크의 라우터까지 퍼져 나간다」(아니요 — step 1이 TTL 1을 확인했으면), 또는 「호스트는 그룹을 떠날 때도 IGMP로 알릴 수 있다」(예 — 판 조건과 함께). 방향은 균형에 맞춰 고른다 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

`src/data/network/visuals/icmp.json`의 `diagrams`에 키를 더한다. 앞 step이 쓴 키는 고치지 않는다.

#### 3-1. `icmp.ping` — `PingResultDiagram`, JSON 키 `ping-result`

- 물음형 제목 예: `ping 결과에서 무엇을 읽을까?`
- 그릴 것: 호스트 A와 대상 호스트, 보낸 에코 요청 넷과 돌아온 응답 셋(하나는 돌아오지 않음). 결과 요약 칸(보낸 수·받은 수·손실률, RTT 최소·평균·최대).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `replies` | 응답 줄 | 돌아온 응답 셋과 각 RTT·TTL 곁말 | 응답마다 순서 번호·TTL·왕복 시간이 적힌다 |
  | `loss` | 손실 | 돌아오지 않은 요청과 요약의 손실률 | 보낸 4개 가운데 하나가 돌아오지 않아 손실률 25% |
  | `rtt` | 왕복 시간 | 요약의 RTT 칸 | 돌아온 응답의 왕복 시간으로 최소·평균·최대를 낸다 |

- 요점 테스트: `loss`의 손실률 곁말이 (보낸 수 − 받은 수) ÷ 보낸 수와 같고, `rtt`의 최소·평균·최대가 `replies`에 적힌 RTT 셋에서 계산한 값과 같다(테스트가 계산한다). 수는 본문 예와 같다.

#### 3-2. `icmp.igmp` — `IgmpGroupDiagram`, JSON 키 `igmp-group`

- 물음형 제목 예: `멀티캐스트 라우터는 그룹 구성원을 어떻게 알까?`
- 그릴 것: 한 LAN(그룹 박스) 안의 멀티캐스트 라우터와 호스트 A~C, LAN 밖의 다른 네트워크(흐린 노드나 박스).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `query` | 질의 | 라우터와 호스트 A~C | 라우터가 같은 네트워크의 호스트들에게 어느 그룹에 있는지 묻는다 |
  | `report` | 보고 | 호스트 B와 라우터 | 그룹에 들어간 호스트 B가 보고로 알린다 |
  | `leave` | 탈퇴 | 호스트 B와 라우터 | 그룹을 떠나는 호스트가 알린다(본문이 쓴 판 조건대로) |

- 요점 테스트: 모든 시나리오에서 IGMP 메시지 경로가 LAN 그룹 박스 밖으로 나가지 않는다(경로의 모든 점이 박스 안). `report`·`leave`의 경로는 호스트 B에서 라우터로 가는 것뿐이다.

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 79개, 마지막 id는 `n079`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `icmp`의 개념 순서와 `parentId`가 guide.md 표와 같은지, 앞 step의 개념·문항·도식 문구가 한 글자도 바뀌지 않았는지 node로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
   이 step으로 `icmp` 주제가 끝난다 — 주제의 개념 전부를 처음부터 끝까지 통독하고, 같은 말의 되풀이와 앞뒤 개념의 어긋남을 찾는다(고치지 말고 앞 step의 것이면 summary에 적는다).
   phase의 마지막 step이다 — 세 주제의 개념 수(12·6·8), 문항 31개(`n049`~`n079`), 도식 26개(개념마다 하나)를 node로 세어 summary에 적는다.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 14을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **앞 step이 쓴 개념 1~24와 그 문항·도식을 고치지 마라.** 이유: 범위가 겹치면 사용자가 무엇이 어디서 바뀌었는지 따라갈 수 없다. 고칠 것을 찾으면 summary에 적는다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
