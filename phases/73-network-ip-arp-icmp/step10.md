# Step 10: rarp-nd

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 8·9가 개념 13~16(ARP와 딸린 개념)을 넣었다. **이 step은 17 RARP와 18 IPv6의 이웃 탐색의 글·문항·도식을 만들어 `arp`의 개념 6개를 끝낸다.** 둘 다 강의에 없고 기출이 물었다 — 사실은 `standards.md`(RFC 903, step 1이 더한 RFC 4861 등)에서만 가져온다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-2 ARP」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p130~p134 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), 이 주제에서 앞 step이 만든 도식과 `src/data/network/visuals/arp.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

주제 `arp`의 `concepts` 끝에 덧붙인다. 개념은 guide.md 표의 17 RARP, 18 IPv6의 이웃 탐색이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 17 | `arp.rarp` | RARP (Reverse ARP) | — | ARP와 반대 방향(자기 MAC 주소로 자기 IP 주소를 알아낸다), 짝을 가진 서버가 답한다, 쓰던 장치(디스크 없는 워크스테이션 — 한 줄로 푼다). 시험은 인터넷 계층으로 본다(E2 — 이 개념도 「자격시험은」 줄을 덧붙인다). 지금 다른 방법이 그 일을 맡는다는 것은 step 1이 확인했을 때만. ARP와 견주는 4절 문단을 둔다(무엇을 알고 무엇을 묻는가) |
| 18 | `arp.neighbor-discovery` | IPv6의 이웃 탐색 | — | IPv6에는 ARP가 없다, 이웃 요청·이웃 광고가 ARP 요청·응답에 해당, 이 메시지들이 ICMPv6 메시지(ICMPv6를 한 줄로 — IPv6에서 오류 알림·진단 메시지를 나르는 프로토콜), 요청을 멀티캐스트로(브로드캐스트가 없다 — 이 주제 안에서 다시 풀 필요가 있으면 한 줄). 영문 이름을 함께 쓴다(Neighbor Discovery, Neighbor Solicitation, Neighbor Advertisement). 라우터 알림도 이웃 탐색의 메시지라는 것은 step 1 결과대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n068`~`n069`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n068` | `rarp` | 4지선다 「개념 비교」 감 — 자기 MAC 주소만 아는 장치가 자기 IP 주소를 알아내려 할 때 쓰는 것, 또는 ARP와 RARP가 각각 무엇으로 무엇을 알아내는지의 짝. 오답은 같은 범주(ARP, 이웃 탐색, ICMP 등) |
| `n069` | `neighbor-discovery` | 예/아니요 감 — 「IPv6 호스트도 이웃의 MAC 주소를 알아낼 때 ARP 요청을 브로드캐스트한다」(아니요) 같은 오해. 아니요 문항이면 해설이 이웃 요청·광고와 ICMPv6를 가르친다. 방향은 균형에 맞춰 고른다 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

`src/data/network/visuals/arp.json`의 `diagrams`에 키를 더한다. 앞 step이 쓴 키는 고치지 않는다.

#### 3-1. `arp.rarp` — `RarpDirectionDiagram`, JSON 키 `rarp-direction`

- 물음형 제목 예: `ARP와 RARP는 무엇을 알아낼까?`
- 그릴 것: 두 줄 — ARP 줄(아는 것: IP 주소 → 알아내는 것: MAC 주소), RARP 줄(아는 것: 자기 MAC 주소 → 알아내는 것: 자기 IP 주소, 답하는 쪽: RARP 서버).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `arp` | ARP | ARP 줄 | 상대의 IP 주소로 그 MAC 주소를 알아낸다 |
  | `rarp` | RARP | RARP 줄과 RARP 서버 | 자기 MAC 주소로 자기 IP 주소를 서버에게 받는다 |

- 요점 테스트: 두 시나리오에서 화살표의 방향(아는 것 → 알아내는 것)이 반대다 — ARP는 IP 주소 노드에서 MAC 주소 노드로, RARP는 MAC 주소 노드에서 IP 주소 노드로 가는 경로가 보인다.

#### 3-2. `arp.neighbor-discovery` — `NeighborDiscoveryDiagram`, JSON 키 `neighbor-discovery`

- 물음형 제목 예: `IPv6는 ARP 대신 무엇으로 이웃을 찾을까?`
- 그릴 것: 같은 링크의 호스트 A~D. A가 B의 MAC 주소를 찾는 장면. 요청이 닿는 멀티캐스트 그룹은 그룹 박스로(본문에 그 사실이 있을 때).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `solicit` | 이웃 요청 | 호스트 A와 요청이 닿는 장치 | A가 이웃 요청을 멀티캐스트로 보낸다 — 브로드캐스트가 아니다 |
  | `advertise` | 이웃 광고 | 호스트 B와 A | B가 이웃 광고로 자기 MAC 주소를 A에게 알린다 |

- 요점 테스트: `solicit`에서 요청 경로가 모든 호스트가 아니라 본문이 말한 대상에게만 닿고(대상을 정할 수 없으면 「브로드캐스트가 아니다」 곁말만), `advertise`의 보이는 경로는 B에서 A로 가는 하나뿐이다. 「ARP」라는 노드가 없다.

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 69개, 마지막 id는 `n069`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `arp`의 개념 순서와 `parentId`가 guide.md 표와 같은지, 앞 step의 개념·문항·도식 문구가 한 글자도 바뀌지 않았는지 node로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
   이 step으로 `arp` 주제가 끝난다 — 주제의 개념 전부를 처음부터 끝까지 통독하고, 같은 말의 되풀이와 앞뒤 개념의 어긋남을 찾는다(고치지 말고 앞 step의 것이면 summary에 적는다).
4. `phases/73-network-ip-arp-icmp/index.json`의 step 10을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`icmp` 주제의 개념을 만들지 마라.** 이유: step 11~14의 범위다. 이웃 탐색 개념은 ICMPv6를 한 줄로만 푼다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
