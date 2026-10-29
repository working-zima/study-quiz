# Step 3: mask-and

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `ip-addressing`에 개념 둘(5 서브넷 마스크, 6 네트워크 주소 계산)의 글·문항·도식을 더한다.** 개념 1~4는 step 1·2가 만들었다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 0 `summary`와 step 1·2 `summary`(이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-5 IP 주소」 절과 「강의 수정 이력」, `docs/source/network/interview-facts.md`의 Q25와 I5, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p174~p177 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `ip-addressing`의 개념 1~4), `src/data/network/questions.json`, `src/data/network/visuals/ip-addressing.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`
- step 1·2가 만든 도식과 그 테스트, 도식 선례(guide.md 「도식」), `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `ip-addressing`에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `ip-addressing.subnet-mask` | 서브넷 마스크 | — | 무엇인가(주소와 같은 32비트, 네트워크 부분 자리 1, 호스트 부분 자리 0, 1은 왼쪽부터 끊김 없이) → 어떻게 적는가(점 10진 `255.255.255.0`, 같은 경계를 접두사 길이 `/24`로 — I5. 2진수는 계산할 때 펼쳐 보는 꼴) → 클래스마다의 기본 마스크(A `255.0.0.0`·B `255.255.0.0`·C `255.255.255.0`) → 누가 쓰는가(호스트가 목적지가 같은 네트워크인지 가리는 데 — step 0 결과대로). 개념 4의 CIDR 표기와 무엇이 같고 무엇이 다른지(같은 경계를 적는 두 꼴)를 말한다. 예: `192.0.2.1`과 `255.255.255.0` |
| 6 | `ip-addressing.network-address-calc` | 네트워크 주소 계산 | `subnet-mask` | **AND**(두 비트가 모두 1일 때만 1, 하나라도 0이면 0)를 푼다. 예 `192.0.2.130` AND `255.255.255.192`(`/26`) = `192.0.2.128` — 앞 세 옥텟은 마스크가 `255`라 그대로, 넷째 옥텟은 `10000010` AND `11000000` = `10000000` = 128. 마스크가 1인 자리는 주소의 비트가 남고 0인 자리는 지워진다는 것, 그래서 결과가 그 주소가 속한 네트워크의 주소라는 것. 경계가 옥텟 가운데 있을 때만 2진수로 펼쳐 계산하면 된다는 것 |

### 2. 문항 — `src/data/network/questions.json`에 `n085`~`n086`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n085` | `subnet-mask` | 예/아니요 감 — 「`/24`와 `255.255.255.0`은 같은 경계를 가리킨다」(예, 면접 Q25 메모), 또는 흔한 오해 「A·B·C 클래스는 모두 같은 기본 마스크를 쓴다」(아니요). 주장의 방향은 균형에 맞춰 고른다 |
| `n086` | `network-address-calc` | 4지선다 「상황 적용」 감 — 본문 예와 다른 문서용 주소와 마스크(예: `198.51.100.77`과 `255.255.255.224`)로 네트워크 주소를 고른다. 오답은 흔한 실수에서 — 넷째 옥텟을 0으로 지운 값, 주소를 그대로 둔 값, 블록 하나를 잘못 센 값 |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다. 계산 문항은 정답과 오답을 손으로 다시 계산한다.

### 3. 도식

#### 3-1. `ip-addressing.subnet-mask` — `SubnetMaskDiagram`, JSON 키 `subnet-mask`

- 물음형 제목 예: `서브넷 마스크의 1과 0은 주소의 어디를 가리킬까?`
- 그릴 것: 주소 `192.0.2.1`의 옥텟 노드 넷과 그 아래 마스크의 옥텟 노드 넷(`255`·`255`·`255`·`0`)을 열을 맞춰 두 줄로. 앞 세 열을 덮는 그룹 박스 「네트워크 부분」, 넷째 열을 덮는 「호스트 부분」. 마스크 옥텟의 2진수(`11111111`·`00000000`)는 곁말로.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `dotted` | 점 10진 | 마스크 줄 넷 | 마스크 `255.255.255.0`은 앞 24비트가 1, 뒤 8비트가 0이다 |
  | `prefix` | 접두사 길이 | 주소 줄 넷과 마스크의 앞 세 옥텟 | 같은 경계를 `/24`로도 적는다 — 1이 24개라는 뜻이다 |

- 요점 테스트: 두 줄의 같은 열 노드가 같은 그룹 박스 안에 있다(마스크 `255` 셋이 「네트워크 부분」 박스 안, `0`이 「호스트 부분」 박스 안). `dotted`의 보이는 곁말에 `11111111`이, `prefix`의 보이는 곁말이나 캡션에 `/24`가 있다.

#### 3-2. `ip-addressing.network-address-calc` — `MaskAndDiagram`, JSON 키 `mask-and`

- 물음형 제목 예: `주소와 마스크를 AND하면 무엇이 남을까?`
- 그릴 것: 세 줄 — 주소(`192.0.2.130`), 마스크(`255.255.255.192`), 결과(`192.0.2.128`). 줄마다 점 10진 노드 하나와, 넷째 옥텟을 앞 2비트 노드·뒤 6비트 노드로 펼친 것(주소 `10`·`000010`, 마스크 `11`·`000000`, 결과 `10`·`000000`).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `keep` | 마스크가 1인 자리 | 세 줄의 앞 2비트 노드 | 마스크가 1인 자리는 주소의 비트가 그대로 남는다 |
  | `clear` | 마스크가 0인 자리 | 세 줄의 뒤 6비트 노드 | 마스크가 0인 자리는 모두 0이 되어 호스트 부분이 지워진다 |
  | `result` | 결과 | 결과 줄 | 남은 값 `192.0.2.128`이 이 주소가 속한 네트워크의 주소다 |

- 요점 테스트: `keep`의 선명한 노드가 세 줄의 앞 2비트 노드이고 주소 줄과 결과 줄의 그 라벨이 같다(`10`). `clear`의 선명한 결과 줄 노드 라벨이 `000000`이다. `result`의 선명한 노드에 라벨 `192.0.2.128`이 있다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 86개, 마지막 id는 `n086`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 1·2의 개념에서 이미 푼 낱말을 다시 풀지 않았는가. 서브넷 마스크와 CIDR 표기가 같은 말을 되풀이하지 않는가.
   step 0 summary가 정한 것을 지켰는가. AND 계산을 다시 해 봤는가.
3. `phases/74-network-addressing-routing/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 7·8(서브네팅, 서브넷 수와 호스트 수)을 만들지 마라.** 이유: step 4의 범위다. 이 step의 예(`/26`)는 경계가 옥텟 가운데 있는 마스크를 보이려는 것이지 네트워크를 나누는 설명이 아니다.
- **강의 예시 주소(`192.168.219.103` 등)를 옮기지 마라.** 이유: guide.md 「예시 값」.
