# Step 9: arp-cache-routers

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 8이 주제 `arp`를 만들고 개념 13 ARP·14 ARP 요청과 ARP 응답을 넣었다. **이 step은 ARP에 딸린 15 ARP 캐시와 16 다른 네트워크로 보낼 때의 ARP의 글·문항·도식을 만든다.** 다음 step 10이 RARP와 IPv6의 이웃 탐색을 잇는다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-2 ARP」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p138~p143 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), 이 주제에서 앞 step이 만든 도식과 `src/data/network/visuals/arp.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

주제 `arp`의 `concepts` 끝에 덧붙인다. 개념은 guide.md 표의 15 ARP 캐시, 16 다른 네트워크로 보낼 때의 ARP이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 15 | `arp.arp-cache` | ARP 캐시 | `arp.arp` | ARP 테이블이라는 다른 이름(p138). 표에 있으면 다시 묻지 않는다, 시간이 지나면 지운다(step 1 결과의 까닭과 함께), `arp -a`로 본다(p139 — 그림의 출력을 옮기지 않고 예시 값으로), 고정 항목 `-s`·지우기 `-d`(step 1 결과대로, Windows와 Linux가 다르면 다르다고). 표에 도메인 이름은 없다. 캐시는 장치마다 따로 있다(기출) |
| 16 | `arp.arp-across-routers` | 다른 네트워크로 보낼 때의 ARP | `arp.arp` | p140–p143 장면을 예시 값으로 — 호스트 A(`192.0.2.1`) → 라우터 1 → 라우터 2 → 호스트 B(다른 네트워크). 라우터의 두 인터페이스는 각 네트워크의 주소를 가진다(guide.md 예시 값에서 고른다). 라우터를 이 주제 안에서 한 줄로 푼다. 구간마다 MAC 주소는 바뀌고 IP 주소는 그대로(step 1 결과대로), 구간마다 ARP 캐시에 적히는 짝이 다르다. 「기본 게이트웨이」라는 이름은 step 1 결과대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n065`~`n067`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n065` | `arp-cache` | 예/아니요 감 — 「ARP 캐시에 상대의 짝이 있으면 그 상대에게 보낼 때 ARP 요청을 다시 보내지 않는다」(예) 같은 원리, 또는 「ARP 캐시의 항목은 한 번 적히면 지우기 전까지 남는다」(아니요) 같은 오해. 방향은 균형에 맞춰 고른다 |
| `n066` | `arp-cache` | 4지선다 감 — n065와 다른 것: ARP 캐시에 무엇이 짝지어 있는지(IP 주소와 MAC 주소 — 오답은 도메인 이름과 IP 주소, 포트와 IP 주소, MAC 주소와 스위치 포트), 또는 고정 항목·지우기 명령의 쓰임 |
| `n067` | `arp-across-routers` | 4지선다 「상황 적용」 감 — 호스트 A가 다른 네트워크의 호스트에게 처음 보낼 때 ARP로 누구의 MAC 주소를 알아내는지(자기 네트워크의 라우터). 오답은 목적지 호스트, 목적지 쪽 라우터, 브로드캐스트 주소 등 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

`src/data/network/visuals/arp.json`의 `diagrams`에 키를 더한다. 앞 step이 쓴 키는 고치지 않는다.

#### 3-1. `arp.arp-cache` — `ArpCacheDiagram`, JSON 키 `arp-cache`

- 물음형 제목 예: `ARP 캐시가 있으면 무엇이 달라질까?`
- 그릴 것: 호스트 A와 그 ARP 캐시(IP 주소 | MAC 주소 줄 둘쯤), 보낼 상대 둘.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `hit` | 캐시에 있음 | 캐시의 그 줄과 상대 | 표에 짝이 있으면 ARP 요청 없이 바로 프레임을 보낸다 |
  | `miss` | 캐시에 없음 | 캐시와 ARP 요청 표시 | 표에 없으면 ARP 요청을 브로드캐스트하고 답을 표에 적는다 |
  | `expire` | 시간이 지남 | 지워지는 줄 | 정해진 시간이 지난 항목은 지운다 |

- 요점 테스트: `hit`에서는 ARP 요청 곁말·경로가 보이지 않고, `miss`에서는 보인다. `expire`에서 지워지는 줄 노드만 흐려진다.

#### 3-2. `arp.arp-across-routers` — `ArpHopsDiagram`, JSON 키 `arp-hops`

- 물음형 제목 예: `라우터를 지날 때 바뀌는 주소는 무엇일까?`
- 그릴 것: 호스트 A — 라우터 1 — 라우터 2 — 호스트 B. 구간 셋. 구간마다 프레임의 출발지·목적지 MAC 곁말과 IP 패킷의 출발지·목적지 IP 곁말.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `hop-1` | 첫 구간 | 호스트 A·라우터 1 | A는 라우터 1의 MAC 주소를 ARP로 알아내 보낸다 |
  | `hop-2` | 가운데 구간 | 라우터 1·라우터 2 | 라우터 1이 다음 구간에서 다시 ARP를 한다 |
  | `hop-3` | 마지막 구간 | 라우터 2·호스트 B | 라우터 2가 호스트 B의 MAC 주소를 알아내 넘긴다 |

- 요점 테스트: 세 시나리오의 IP 곁말(출발지·목적지)이 모두 같고, MAC 곁말은 시나리오마다 다르다. 시나리오마다 보이는 경로는 그 구간 하나뿐이다.

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 67개, 마지막 id는 `n067`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `arp`의 개념 순서와 `parentId`가 guide.md 표와 같은지, 앞 step의 개념·문항·도식 문구가 한 글자도 바뀌지 않았는지 node로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
4. `phases/73-network-ip-arp-icmp/index.json`의 step 9을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 17·18(RARP, IPv6의 이웃 탐색)을 만들지 마라.** 이유: step 10의 범위다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
