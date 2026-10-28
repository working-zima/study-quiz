# Step 5: ipv4-ipv6

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 2~4가 개념 1~6을 넣었다. **이 step은 7 IPv4 주소와 8 IPv6의 글·문항·도식을 만든다.** 개념 8은 IPv6 블록의 머리다 — 뒤 step 6·7이 그 밑에 9 IPv6 주소 표기, 10 IPv6 기본 헤더, 11 확장 헤더, 12 주소 자동 설정을 딸린 개념으로 붙인다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-1 IP(IPv4, IPv6)」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`, `docs/source/network/interview-facts.md`의 Q37과 수정 이력 I8
- `docs/source/network/raw/lecture.md`의 p124~p126 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), 이 주제에서 앞 step이 만든 도식과 `src/data/network/visuals/ip-protocol.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

주제 `ip-protocol`의 `concepts` 끝에 덧붙인다. 개념은 guide.md 표의 7 IPv4 주소, 8 IPv6이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `ip-protocol.ipv4-address` | IPv4 주소 | — | 32비트, 8비트씩 0~255 넷, 점 표기, 2^32(약 43억 — I8), 주소 부족. 예시는 guide.md의 문서용 주소. 2진수는 「0과 1로 적은 수」로 풀고 8비트로 0~255를 적을 수 있다는 것만. 네트워크 부분·호스트 부분·클래스·서브넷 마스크는 쓰지 않는다(phase 74) |
| 8 | `ip-protocol.ipv6` | IPv6 | — | IETF가 만든 다음 판, 128비트, 2^128(L5). 달라진 점을 한 문단에 — 기본 헤더가 고정 크기로 단순해졌다, 브로드캐스트가 없고 멀티캐스트가 맡는다(멀티캐스트·브로드캐스트를 한 줄로 푼다), 주소 자동 설정, 라우터가 단편화하지 않는다. 각 줄은 딸린 개념 9~12와 개념 2가 자세히 다룬다는 것을 알리지 말고 사실로만 쓴다. 끝 문단 — IPv4와 함께 쓰는 방법 셋(step 0 결과대로) |

### 2. 문항 — `src/data/network/questions.json`에 `n056`~`n057`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n056` | `ipv4-address` | 4지선다 「상황 적용」 감 — 보기 넷 가운데 올바른 IPv4 주소 표기 하나(나머지는 256 이상의 수, 묶음이 셋이나 다섯, 등 실제로 헷갈리는 꼴). 주소는 문서용 범위에서 |
| `n057` | `ipv6` | 예/아니요 감 — 「IPv6에도 같은 네트워크의 모든 장치에게 한 번에 보내는 브로드캐스트 주소가 있다」(아니요 — 멀티캐스트가 맡는다). 방향은 균형에 맞춰 고른다 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

`src/data/network/visuals/ip-protocol.json`의 `diagrams`에 키를 더한다. 앞 step이 쓴 키는 고치지 않는다.

#### 3-1. `ip-protocol.ipv4-address` — `Ipv4AddressDiagram`, JSON 키 `ipv4-address`

- 물음형 제목 예: `32비트 주소는 어떻게 네 수가 될까?`
- 그릴 것: 32비트를 8비트씩 네 칸(옥텟)으로 나눈 띠와, 칸마다 십진수. 칸은 빈틈없이 이어 붙인다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `bits` | 8비트씩 | 네 칸의 비트 묶음 | 32비트를 8비트씩 넷으로 나눈다 |
  | `decimal` | 십진수 | 네 칸의 십진수와 점 | 각 칸을 0~255의 십진수로 적고 점으로 잇는다 |

- 요점 테스트: 네 칸의 십진수를 점으로 이으면 본문의 예시 주소와 같고, 각 칸의 수가 0~255 안이다.

#### 3-2. `ip-protocol.ipv6` — `Ipv6ChangesDiagram`, JSON 키 `ipv6-changes`

- 물음형 제목 예: `IPv6는 IPv4에서 무엇이 달라졌을까?`
- 그릴 것: IPv4 쪽과 IPv6 쪽 두 열(그룹 박스), 같은 줄에 짝지은 노드 — 주소 크기, 브로드캐스트, 헤더, 단편화하는 곳. 비교표가 아니라 짝 노드로 그린다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `address` | 주소 크기 | 주소 크기 짝 | 주소가 32비트에서 128비트로 늘었다 |
  | `broadcast` | 브로드캐스트 | 브로드캐스트 짝 | IPv6에는 브로드캐스트가 없고 멀티캐스트가 그 일을 맡는다 |
  | `header` | 헤더 | 헤더 짝 | 기본 헤더가 고정 크기로 단순해졌다 |
  | `fragment` | 단편화 | 단편화 짝 | IPv6에서는 출발지만 나눈다 |

- 요점 테스트: 시나리오마다 선명한 노드가 같은 줄의 IPv4·IPv6 짝 둘이고, 네 시나리오의 짝이 서로 다르다.

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 57개, 마지막 id는 `n057`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `ip-protocol`의 개념 순서와 `parentId`가 guide.md 표와 같은지, 앞 step의 개념·문항·도식 문구가 한 글자도 바뀌지 않았는지 node로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 5을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 9~12(IPv6 주소 표기, 기본 헤더, 확장 헤더, 주소 자동 설정)를 만들지 마라.** 이유: step 6·7의 범위다. 개념 8은 달라진 점을 한 줄씩만 쓴다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
