# Step 7: reserved-loopback

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `ip-address-types`에 개념 둘(11 예약된 IP 주소, 12 루프백 주소)의 글·문항·도식을 더한다.** 주제와 개념 9·10은 step 6이 만들었다.

기출은 루프백을 네 번(`127.0.0.1`·「루프백 테스트」), 사설 대역을 네 번 물었다. 이 step의 목록은 그 둘 말고도 강의 p186–p187의 표가 보이는 대역 가운데 학습자가 실제로 만나는 것을 고른 것이다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 5 `summary`와 step 6 `summary`(이미 푼 낱말, 교차 검사 수, 균형), step 0 `summary`의 D·E 클래스 메모
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-6 IP 주소의 분류」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p186~p188 — 원문(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `ip-address-types`의 개념 9·10), `src/data/network/questions.json`, `src/data/network/visuals/ip-address-types.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`
- step 6이 만든 도식과 그 테스트, 도식 선례(guide.md 「도식」), `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `ip-address-types`에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `ip-address-types.reserved-addresses` | 예약된 IP 주소 | — | **목록 개념**. 소개 문단 — 호스트에 나눠 주지 않고 쓰임을 따로 정해 둔 대역이 있고, IANA가 그 목록을 레지스트리로 관리한다(이름은 step 5 결과대로). 사설 대역도 그 가운데 하나라는 한 줄(개념 10과 되풀이하지 않는다). 항목 — guide.md 표 11의 일곱(`0.0.0.0/8`, `127.0.0.0/8`, `169.254.0.0/16`, 문서용 셋, `224.0.0.0/4`, `240.0.0.0/4`, `255.255.255.255`). 루프백 항목은 한 줄로 그치고, 멀티캐스트·브로드캐스트는 한 줄씩 푼다. 「라우터가 넘기지 않는다」처럼 범위를 말하는 사실은 step 5가 확인한 것만 |
| 12 | `ip-address-types.loopback` | 루프백 주소 | `reserved-addresses` | 무엇인가(`127.0.0.0/8`의 주소, 흔히 `127.0.0.1`) → 무엇이 일어나는가(보낸 패킷이 네트워크 카드 밖으로 나가지 않고 같은 호스트 안에서 되돌아온다) → 왜 쓰는가(다른 장치·케이블 없이 자기 호스트의 네트워크 소프트웨어를 시험한다 — 처리는 step 5 결과대로) → 이름 `localhost`(step 5 결과대로). 루프백 주소로 보낸 패킷은 다른 호스트에 닿지 않는다는 것을 예로 보인다 |

### 2. 문항 — `src/data/network/questions.json`에 `n093`~`n094`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n093` | `reserved-addresses` | 4지선다 「상황 적용」 감 — 주소를 받지 못한 호스트가 `169.254`로 시작하는 주소를 갖고 있을 때 무엇을 뜻하는지, 또는 어떤 상황에 맞는 예약 대역을 고른다. 오답은 같은 목록의 다른 대역(루프백·문서용·브로드캐스트)에서. 루프백만 묻지 않는다 — n094와 겹친다 |
| `n094` | `loopback` | 예/아니요 감 — 흔한 오해 「`127.0.0.1`로 보낸 패킷은 같은 네트워크의 다른 호스트에게도 닿는다」(아니요), 또는 「네트워크 케이블을 뽑아도 `127.0.0.1`로 보낸 시험은 호스트 안에서 이뤄진다」(예). 주장의 방향은 균형에 맞춰 고른다 |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `ip-address-types.reserved-addresses` — `ReservedAddressesDiagram`, JSON 키 `reserved-addresses`

- 물음형 제목 예: `호스트에 주지 않는 주소에는 어떤 것이 있을까?`
- 그릴 것: 대역 노드 일곱(항목 순서대로)과 곁말로 쓰임 한 마디씩. 세로형은 한 열, 가로형은 두 열로 둘 수 있다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `stay-local` | 밖으로 나가지 않는 주소 | `127.0.0.0/8`·`169.254.0.0/16`·`255.255.255.255` | 이 주소로 보낸 것은 호스트나 그 네트워크 밖으로 넘어가지 않는다(step 5가 확인한 범위대로) |
  | `special-use` | 쓰임을 정한 대역 | 문서용·`224.0.0.0/4`·`240.0.0.0/4` | 문서의 예·멀티캐스트·나중을 위한 예약처럼 쓰임이 정해진 대역이다 |

- 요점 테스트: 두 시나리오의 선명한 노드 집합이 겹치지 않고, 합치면 `0.0.0.0/8`을 뺀 여섯 노드다(또는 step이 정한 나눔대로 — 나눔을 바꾸면 summary에 적는다). `stay-local` 노드마다의 곁말이 본문 항목의 말과 같다.

#### 3-2. `ip-address-types.loopback` — `LoopbackDiagram`, JSON 키 `loopback`

- 물음형 제목 예: `127.0.0.1로 보낸 패킷은 어디로 갈까?`
- 그릴 것: 호스트 A의 그룹 박스 안에 프로그램 노드와 네트워크 소프트웨어 노드, 네트워크 카드 노드. 박스 밖에 네트워크와 다른 호스트 B(`192.168.0.11`).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `loopback` | `127.0.0.1`로 | 프로그램·네트워크 소프트웨어 | 루프백 주소로 보낸 패킷은 호스트 밖으로 나가지 않고 되돌아온다 |
  | `other-host` | 다른 호스트로 | 프로그램·네트워크 소프트웨어·네트워크 카드·호스트 B | 다른 호스트의 주소로 보낸 패킷은 네트워크 카드를 거쳐 네트워크로 나간다 |

- 요점 테스트: `loopback`의 보이는 경로가 모두 호스트 A의 그룹 박스 안에 있고 네트워크 카드 노드에 닿지 않는다. `other-host`의 보이는 경로는 네트워크 카드를 지나 호스트 B에서 끝난다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 94개, 마지막 id는 `n094`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 6의 개념에서 이미 푼 낱말을 다시 풀지 않았는가. 목록의 루프백 항목과 개념 12가 같은 말을 되풀이하지 않는가.
   step 5 summary가 정한 것을 지켰는가.
3. `phases/74-network-addressing-routing/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 13~17을 만들지 마라.** 이유: step 8~10의 범위다.
- **강의 표의 나머지 대역(`100.64.0.0/10`·`192.0.0.0/24`·`192.88.99.0/24`·`198.18.0.0/15`)을 항목으로 넣지 마라.** 이유: guide.md 개념 표 11 — 학습자가 만나는 것만 고른다.
