# Step 2: classes-cidr

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `ip-addressing`에 개념 둘(3 주소 클래스, 4 CIDR)의 글·문항·도식을 더한다.** 주제와 개념 1·2는 step 1이 만들었다.

기출은 거의 매회 클래스를 묻는다(첫 옥텟이나 2진수로 클래스 가르기, 유효한 C 클래스 주소 고르기, D 클래스). 학습자가 이 화면에서 그 판단을 스스로 할 수 있어야 한다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 0 `summary`와 step 1 `summary`(이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-5 IP 주소」 절과 「강의 수정 이력」(특히 L6), `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p167~p173, p178 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `ip-addressing`의 개념 1·2), `src/data/network/questions.json`, `src/data/network/visuals/ip-addressing.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`
- step 1이 만든 `NetworkHostPartsDiagram`·`NetworkBroadcastDiagram`과 그 테스트, 도식 선례(guide.md 「도식」), `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `ip-addressing`에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 3 | `ip-addressing.address-classes` | 주소 클래스 | — | **목록 개념**. 소개 문단 — 예전에는 주소 맨 앞의 비트 몇 개로 네트워크 부분의 크기를 정했고, 이렇게 나눈 갈래를 클래스, 그 방식을 클래스풀 주소 체계라 한다. 항목 다섯(A~E) — 맨 앞 비트, 첫 옥텟의 10진수 범위, 네트워크 부분의 크기(D·E는 쓰임). B·C의 2진수는 L6대로(B `10000000`~`10111111`, C `11000000`~`11011111`). 첫 옥텟을 2진수로 펼쳐 클래스를 가르는 예 하나(예: 첫 옥텟 150 → `10010110` → 맨 앞 `10` → B). A·B 클래스는 특정 주소가 아니라 첫 옥텟 값으로만 보인다(guide.md 「예시 값」). 첫 옥텟 0·127의 쓰임, D·E의 근거, 클래스가 지금 쓰이지 않는다는 것은 step 0 결과대로 |
| 4 | `ip-addressing.cidr` | CIDR (Classless Inter-Domain Routing) | — | 클래스의 한계(네트워크 크기가 셋뿐 — 호스트에 줄 수 있는 주소가 A 16,777,214·B 65,534·C 254개로, 그 사이 크기가 필요하면 주소가 남거나 모자란다 — 계산은 개념 2의 2^h − 2로 보인다)와 CIDR의 뜻(경계를 아무 비트에나 둔다, 클래스리스 주소 체계, 지금 쓰는 방식). CIDR 표기 — 주소 뒤 `/`와 네트워크 부분의 비트 수(접두사 길이). 예: `192.0.2.0/26`(앞 26비트가 네트워크, 주소 64개). 만든 까닭은 step 0 결과대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n082`~`n084`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n082` | `address-classes` | 4지선다 「상황 적용」 감 — 첫 옥텟을 2진수로 펼친 값(본문 예와 다른 값)을 주고 클래스를 고른다. 오답은 맨 앞 비트를 하나 잘못 읽었을 때 나오는 클래스들 |
| `n083` | `address-classes` | 예/아니요 감 — 흔한 오해 「D 클래스 주소도 네트워크 부분과 호스트 부분으로 나뉜다」(아니요) 같은 것. n082와 다른 것을 묻는다 |
| `n084` | `cidr` | 예/아니요 또는 4지선다 감 — 「클래스리스 체계에서는 첫 옥텟이 192~223인 주소라도 네트워크 부분이 24비트가 아닐 수 있다」(예), 또는 `/n`이 가리키는 것과 주소 수를 고르기. 형식은 균형에 맞춰 |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다. 보기의 주소도 문서용 대역 안에서 만들고, A·B 클래스는 첫 옥텟 값으로만 쓴다.

### 3. 도식

#### 3-1. `ip-addressing.address-classes` — `AddressClassesDiagram`, JSON 키 `address-classes`

- 물음형 제목 예: `첫 옥텟만 보고 어느 클래스인지 어떻게 알까?`
- 그릴 것: 클래스마다 한 줄 — 클래스 이름 노드(`A`~`E`), 맨 앞 비트 노드(`0`·`10`·`110`·`1110`·`1111`), 첫 옥텟 범위 노드(`0~127` 등), 곁말(네트워크 부분 8·16·24비트 / 멀티캐스트 / 예약).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `unicast` | A·B·C | A·B·C 세 줄 | 맨 앞 비트가 길어질수록 네트워크 부분이 8·16·24비트로 커진다 |
  | `others` | D·E | D·E 두 줄 | D는 멀티캐스트, E는 예약이라 네트워크·호스트로 나누지 않는다 |
  | `example` | 첫 옥텟 150 | B 줄 | 150을 2진수로 펼치면 `10010110`이라 맨 앞이 `10`인 B 클래스다 |

- 요점 테스트: `unicast`의 선명한 줄이 A·B·C이고 맨 앞 비트 노드 라벨이 `0`·`10`·`110`이다. `others`는 D·E 줄만. `example`은 B 줄만 선명하고 보이는 곁말에 `10010110`이 있다.

#### 3-2. `ip-addressing.cidr` — `CidrBoundaryDiagram`, JSON 키 `cidr-boundary`

- 물음형 제목 예: `경계를 아무 비트에나 두면 무엇이 달라질까?`
- 그릴 것: 주소 `192.0.2.0`의 옥텟 노드 넷(넷째 옥텟은 2진수 `00000000`으로 펼친 노드를 함께). 경계를 가리키는 곁말과 그 경계로 생기는 주소 수 곁말.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `classful` | 클래스풀 | 앞 세 옥텟 | 클래스로 나누면 경계는 8·16·24비트 자리뿐이라 이 네트워크는 주소 256개다 |
  | `classless` | CIDR | 앞 세 옥텟과 넷째 옥텟의 앞 2비트 | `192.0.2.0/26`처럼 경계를 26비트에 두면 주소 64개짜리 네트워크가 된다 |

- 요점 테스트: `classful`의 보이는 곁말에 `256`이, `classless`의 보이는 곁말에 `/26`과 `64`가 있다. 두 시나리오의 선명한 노드 집합 또는 보이는 곁말이 다르다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 84개, 마지막 id는 `n084`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 1의 개념 1·2에서 이미 푼 낱말을 다시 풀지 않았는가.
   step 0 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가. 2진수와 호스트 수 계산을 다시 해 봤는가.
3. `phases/74-network-addressing-routing/index.json`의 step 2를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 5~8(서브넷 마스크, 네트워크 주소 계산, 서브네팅, 서브넷 수와 호스트 수)을 만들지 마라.** 이유: step 3·4의 범위다. CIDR의 본문이 서브넷 마스크를 언급하면 한 줄 풀이로 그친다.
- **실제로 쓰이는 공인·사설 주소를 클래스의 예로 들지 마라.** 이유: guide.md 「예시 값」 — 그 주소의 다른 뜻을 따로 풀어야 한다.
