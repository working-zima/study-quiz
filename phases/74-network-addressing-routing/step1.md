# Step 1: network-host-broadcast

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `ip-addressing`을 만들고 그 첫 개념 둘(1 네트워크 부분과 호스트 부분, 2 네트워크 주소와 브로드캐스트 주소)의 글·문항·도식을 함께 만든다.**

이 주제는 학습자가 IP 주소를 나누는 법을 처음 여는 화면이다. 학습자는 네트워크를 처음 공부하는 사람이고, 앞 주제(`ip-protocol`의 IPv4 주소)를 읽지 않고 바로 들어올 수 있다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 0 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-5 IP 주소」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p161~p171 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `ip-protocol.ipv4-address` — 이 주제가 이어 쓰는 앞 개념), `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`icmp` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "ip-addressing", "title": "IP 주소와 서브넷 마스크", "importance": 3, "sourcePages": [161, 179], "concepts": [ … ] }`.
개념은 guide.md 표의 1·2다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `ip-addressing.network-host` | 네트워크 부분과 호스트 부분 | — | 이 주제의 첫 개념이라 **IP 주소**(IPv4 주소 — 32비트, 8비트씩 네 묶음을 0~255 십진수로 적고 점으로 잇는다. 예 `192.0.2.1`), **비트·2진수·옥텟**, **네트워크**(서로 바로 주고받을 수 있게 이어진 장치들의 묶음), **호스트**(네트워크에 이어진 컴퓨터 같은 장치), **라우터**(네트워크와 네트워크를 잇는 장비)를 짧게 푼다. 예는 `192.0.2.1`·`192.0.2.2`가 같은 네트워크이고 앞 24비트가 네트워크 부분이라고 **가정한** 예로 든다(경계는 예에서 정한 것이라고 밝힌다). 경계가 주소마다 다를 수 있다는 것(p165–p166)과 경계를 알려 주는 방법이 따로 있다는 것까지 쓰고, 그 방법의 이름(클래스·서브넷 마스크)은 한 줄 풀이로만 든다 — 「~에서 다룬다」를 붙이지 않는다 |
| 2 | `ip-addressing.network-broadcast-address` | 네트워크 주소와 브로드캐스트 주소 | `network-host` | **브로드캐스트**(한 네트워크의 모든 호스트에게 한꺼번에 보내는 것)를 푼다. 예는 개념 1의 네트워크(`192.0.2.0`~`192.0.2.255`, 호스트 부분 8비트) — 네트워크 주소 `192.0.2.0`(호스트 부분 `00000000`), 브로드캐스트 주소 `192.0.2.255`(`11111111`), 호스트에 줄 수 있는 주소 `192.0.2.1`~`192.0.2.254` 254개. 2^8 = 256에서 2를 빼는 까닭을 단계대로 보인다. 이름·근거·예외는 step 0 결과대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n080`~`n081`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n080` | `network-host` | 예/아니요 감 「상황 적용」 — 앞 24비트가 네트워크 부분이라고 정한 상황에서 두 주소가 같은 네트워크인지(문서용 대역 안의 다른 주소로). 또는 흔한 오해 「주소의 네트워크 부분은 언제나 앞 세 옥텟이다」(아니요). 주장의 방향은 균형에 맞춰 고른다 |
| `n081` | `network-broadcast-address` | 4지선다 「상황 적용」 감 — 본문 예와 다른 문서용 네트워크(예: `203.0.113.0`, 호스트 부분 8비트)에서 호스트에게 줄 수 있는 주소를 고르거나, 줄 수 없는 주소의 까닭을 고른다. 오답은 네트워크 주소·브로드캐스트 주소처럼 흔히 헷갈리는 것에서 |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.
보기의 주소도 문서용 대역 안에서 만든다(guide.md 「예시 값」).

### 3. 도식

이 step이 `src/data/network/visuals/ip-addressing.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'ip-addressing': ipAddressingVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `ip-addressing.network-host` — `NetworkHostPartsDiagram`, JSON 키 `network-host-parts`

- 물음형 제목 예: `IP 주소의 어디까지가 네트워크를 가리킬까?`
- 그릴 것: 같은 네트워크의 두 주소 `192.0.2.1`과 `192.0.2.2`를 옥텟 노드 넷씩 두 줄로(`192`·`0`·`2`·`1` / `192`·`0`·`2`·`2`). 앞 세 열을 덮는 그룹 박스 「네트워크 부분」, 넷째 열을 덮는 그룹 박스 「호스트 부분」.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `network` | 네트워크 부분 | 두 줄의 앞 세 옥텟 노드 | 같은 네트워크의 두 주소는 네트워크 부분이 같다(이 예에서는 앞 24비트) |
  | `host` | 호스트 부분 | 두 줄의 넷째 옥텟 노드 | 호스트 부분은 네트워크 안의 호스트마다 다르다 |

- 요점 테스트: `network`의 선명한 노드가 두 줄의 앞 세 옥텟 여섯 개이고, 같은 열의 두 노드 라벨이 서로 같다. `host`의 선명한 노드는 넷째 옥텟 둘이고 두 라벨이 서로 다르다.

#### 3-2. `ip-addressing.network-broadcast-address` — `NetworkBroadcastDiagram`, JSON 키 `network-broadcast`

- 물음형 제목 예: `네트워크의 주소 가운데 호스트에 줄 수 없는 것은 무엇일까?`
- 그릴 것: 네트워크 `192.0.2.0`~`192.0.2.255`의 주소를 위에서 아래로 — `192.0.2.0`, `192.0.2.1`, (줄임 노드 `…`), `192.0.2.254`, `192.0.2.255`. 곁말로 각 끝 주소의 호스트 부분 2진수(`00000000`·`11111111`).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `network-address` | 네트워크 주소 | `192.0.2.0` | 호스트 부분이 모두 0인 주소는 네트워크 자체를 가리킨다 |
  | `hosts` | 호스트에 주는 주소 | `192.0.2.1`~`192.0.2.254` 쪽 노드 | 남은 254개만 호스트에 준다(256 − 2) |
  | `broadcast` | 브로드캐스트 주소 | `192.0.2.255` | 호스트 부분이 모두 1인 주소는 네트워크의 모든 호스트에게 보낼 때 쓴다 |

- 요점 테스트: `network-address`의 선명한 노드는 라벨이 `192.0.2.0`인 것 하나이고 보이는 곁말에 `00000000`이 있다. `broadcast`는 `192.0.2.255` 하나와 `11111111`. `hosts`의 선명한 노드에 `192.0.2.0`·`192.0.2.255`가 없다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 81개, 마지막 id는 `n081`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `icmp` 바로 뒤에 있고, `importance` 3·`sourcePages` [161, 179]인지, `data.test.ts`의 주제 지도·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가. 본문의 계산(256 − 2)을 다시 해 봤는가.
4. `phases/74-network-addressing-routing/index.json`의 step 1을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~8(주소 클래스, CIDR, 서브넷 마스크, 네트워크 주소 계산, 서브네팅, 서브넷 수와 호스트 수)을 만들지 마라.** 이유: step 2~4의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
