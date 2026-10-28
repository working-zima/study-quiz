# Step 6: ipv6-notation-header

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 5가 개념 7 IPv4 주소·8 IPv6(블록 머리)를 넣었다. **이 step은 IPv6에 딸린 9 IPv6 주소 표기와 10 IPv6 기본 헤더의 글·문항·도식을 만든다.** 둘 다 기출이 자주 묻는다(표기 약 7회, 홉 제한 3회). 다음 step 7이 확장 헤더와 주소 자동 설정을 잇는다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-1 IP(IPv4, IPv6)」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p126~p127 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), 이 주제에서 앞 step이 만든 도식과 `src/data/network/visuals/ip-protocol.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

주제 `ip-protocol`의 `concepts` 끝에 덧붙인다. 개념은 guide.md 표의 9 IPv6 주소 표기, 10 IPv6 기본 헤더이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `ip-protocol.ipv6-address-notation` | IPv6 주소 표기 | `ip-protocol.ipv6` | 16진수를 이 주제 안에서 한 줄로 푼다(0~9와 a~f로 적는 수, 한 자리가 4비트). 여덟 묶음·콜론, 앞쪽 0 생략, `::`는 한 번만(두 번이면 몇 묶음씩 줄였는지 알 수 없다), 권고 표기(step 0 결과대로). 예시는 `2001:db8::/32` 안에서 — 한 주소를 전체 표기 → 앞쪽 0 생략 → `::` 줄임 순서로 보여 준다 |
| 10 | `ip-protocol.ipv6-header` | IPv6 기본 헤더 | `ip-protocol.ipv6` | **목록 개념** — 40바이트 고정, 칸 여덟을 항목으로. 홉 제한은 IPv4의 TTL과 같은 일(이 주제의 TTL 개념을 이름으로 가리켜도 된다 — 같은 주제다), 다음 헤더는 IPv4의 프로토콜 칸에 해당, 트래픽 클래스(옛 이름 Priority는 step 0 결과·E번호대로). IPv4 헤더에 있던 칸 가운데 없어진 것(단편화 칸 셋, 헤더 체크섬) |

### 2. 문항 — `src/data/network/questions.json`에 `n058`~`n060`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n058` | `ipv6-address-notation` | 4지선다 「상황 적용」 감 — 전체 표기 주소 하나를 주고 가장 짧게 바르게 줄인 꼴을 고르게 한다. 오답은 실제 실수(`::` 두 번, 묶음 가운데·끝의 0을 지움, 0 묶음 하나를 `::`로 줄임 등) |
| `n059` | `ipv6-address-notation` | 예/아니요 감 — 줄인 주소 하나를 주고 「이 주소를 원래의 여덟 묶음으로 되살릴 수 있다」 또는 `::`를 두 번 쓴 주소가 올바른지. n058과 다른 것을 묻는다 |
| `n060` | `ipv6-header` | 4지선다 「개념 비교」 감 — IPv4의 TTL과 같은 일을 하는 IPv6 기본 헤더의 칸. 오답은 다른 IPv6 칸(트래픽 클래스, 흐름 레이블, 다음 헤더). 정답 이름을 문제문에 쓰지 않는다 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

`src/data/network/visuals/ip-protocol.json`의 `diagrams`에 키를 더한다. 앞 step이 쓴 키는 고치지 않는다.

#### 3-1. `ip-protocol.ipv6-address-notation` — `Ipv6NotationDiagram`, JSON 키 `ipv6-notation`

- 물음형 제목 예: `IPv6 주소는 어떻게 줄여 쓸까?`
- 그릴 것: 같은 주소를 세 줄로 — 전체 표기(여덟 묶음), 앞쪽 0을 지운 표기, `::`로 줄인 표기. 줄마다 묶음 노드를 빈틈없이 잇거나, 280 폭에 맞지 않으면 줄마다 주소 문자열 노드 하나와 묶음 곁말로 그린다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `full` | 전체 표기 | 전체 표기 줄 | 16비트 묶음 여덟을 16진수 네 자리씩 콜론으로 잇는다 |
  | `leading-zeros` | 앞쪽 0 생략 | 앞쪽 0을 지운 줄 | 묶음마다 앞쪽의 0은 지울 수 있다 |
  | `double-colon` | `::` 줄임 | `::`로 줄인 줄 | 0만 있는 묶음이 이어진 한 곳을 `::`로 줄인다 — 한 번만 |

- 요점 테스트: 세 줄의 주소가 같은 128비트를 가리킨다 — 줄인 꼴을 되살리면 전체 표기와 같다(테스트가 문자열로 되살려 비교한다). `::`는 마지막 줄에 한 번만 나온다.

#### 3-2. `ip-protocol.ipv6-header` — `Ipv6HeaderDiagram`, JSON 키 `ipv6-header`

- 물음형 제목 예: `IPv6 기본 헤더에는 어떤 칸이 있을까?`
- 그릴 것: 칸 여덟을 순서대로 빈틈없이 이은 줄(비트 폭 비율을 맞추지 않는다)과 전체 40바이트 곁말.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `hop-limit` | 홉 제한 | 홉 제한 칸 | 노드를 지날 때마다 1씩 줄고 0이면 버린다 — IPv4의 TTL과 같은 일 |
  | `next-header` | 다음 헤더 | 다음 헤더 칸 | 헤더 뒤에 무엇이 오는지 — IPv4의 프로토콜 칸에 해당 |
  | `addresses` | 주소 | 출발지·목적지 주소 칸 | 주소 둘이 각 128비트라 헤더의 대부분을 차지한다 |

- 요점 테스트: 칸 노드의 이름을 순서대로 읽으면 본문의 여덟 칸과 같고, 헤더 체크섬·식별자 칸 노드가 없다.

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 60개, 마지막 id는 `n060`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `ip-protocol`의 개념 순서와 `parentId`가 guide.md 표와 같은지, 앞 step의 개념·문항·도식 문구가 한 글자도 바뀌지 않았는지 node로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 11·12(확장 헤더, 주소 자동 설정)를 만들지 마라.** 이유: step 7의 범위다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
