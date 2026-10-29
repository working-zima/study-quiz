# Step 13: prefix-default

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `routing`에 라우팅 테이블에 딸린 개념 둘(20 롱기스트 프리픽스 매치, 21 디폴트 라우트)의 글·문항·도식을 더한다.** 주제와 개념 18·19는 step 12가 만들었다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 11 `summary`와 step 12 `summary`(이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-7 라우팅」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p206~p208 — 원문(옮기지 않는다). p207은 렌더해서 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `routing`의 개념 18·19), `src/data/network/questions.json`, `src/data/network/visuals/routing.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`
- step 12가 만든 도식과 그 테스트, 도식 선례(guide.md 「도식」), `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `routing`에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 20 | `routing.longest-prefix-match` | 롱기스트 프리픽스 매치 | `routing-table` | **접두사**(주소의 앞쪽 네트워크 부분, 그 비트 수를 `/24`처럼 적는다)를 한 줄로 푼다. 규칙(여러 행이 맞으면 접두사가 가장 긴 행 — 더 좁은 범위를 가리키는 행을 고른다, 근거는 step 11 결과대로) → 왜(더 길게 맞는 행이 목적지를 더 정확하게 안다) → 예를 단계대로 — 목적지 `198.51.100.20`, 행 `198.51.100.0/24`(게이트웨이 `203.0.113.2`)와 `198.51.100.16/28`(게이트웨이 `203.0.113.6` 같은 다른 문서용 주소). 넷째 옥텟 20 = `00010100`, `/28`의 넷째 옥텟 앞 4비트 `0001`이 `198.51.100.16`(`00010000`)과 같아 두 행 모두 맞고, 접두사가 28로 더 긴 행을 고른다. 게이트웨이 주소는 본문에 쓴 것만 도식에 쓴다 |
| 21 | `routing.default-route` | 디폴트 라우트 | `routing-table` | 무엇인가(어느 행에도 맞지 않는 패킷을 보내는 기본 경로, 목적지 `0.0.0.0`·마스크 `0.0.0.0` — `0.0.0.0/0`, p208) → 왜 다른 행을 앞지르지 않는가(접두사 길이 0이라 모든 주소에 맞지만 가장 짧으므로 개념 20의 규칙에서 마지막에 남는다) → 쓰임(인터넷으로 나가는 쪽 라우터를 가리키게 두면 표에 모든 목적지를 적지 않아도 된다). 호스트의 디폴트 라우트가 가리키는 라우터가 기본 게이트웨이라는 것은 step 11 결과대로 — 기본 게이트웨이와 디폴트 라우트가 무엇이 다른지(장치와 표의 행) 한 문단. 예 — 라우터 1의 표 `192.0.2.0/24`(`eth0`)와 `0.0.0.0/0`(게이트웨이 `203.0.113.2`, `eth1`)에서 `192.0.2.4`로 가는 패킷과 `198.51.100.7`로 가는 패킷 |

### 2. 문항 — `src/data/network/questions.json`에 `n103`~`n104`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n103` | `longest-prefix-match` | 4지선다 「상황 적용」 감 — 본문 예와 다른 문서용 대역(예: `203.0.113.0/24`·`203.0.113.64/26`·`203.0.113.96/27`과 디폴트 라우트)의 표와 목적지(예: `203.0.113.100`)를 주고 고를 행을 고른다. 오답은 맞지만 더 짧은 행, 맞지 않는 행, 디폴트 라우트. 정답과 오답을 2진수로 다시 계산한다 |
| `n104` | `default-route` | 예/아니요 감 — 흔한 오해 「`0.0.0.0/0`은 모든 목적지에 맞으므로 다른 행보다 먼저 고른다」(아니요), 또는 「표에 맞는 행이 디폴트 라우트뿐이면 패킷은 디폴트 라우트의 게이트웨이로 간다」(예). 주장의 방향은 균형에 맞춰 고른다 |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `routing.longest-prefix-match` — `LongestPrefixDiagram`, JSON 키 `longest-prefix`

- 물음형 제목 예: `두 행에 모두 맞으면 어느 쪽으로 보낼까?`
- 그릴 것: 목적지 `198.51.100.20` 노드(곁말로 넷째 옥텟 `00010100`)와 표의 두 행 노드(`198.51.100.0/24 → 203.0.113.2`, `198.51.100.16/28 → (본문의 다른 게이트웨이)`). 행마다 맞는 비트 수 곁말.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `both-match` | 두 행 모두 | 목적지·두 행 | `198.51.100.20`은 `/24` 행에도 `/28` 행에도 맞는다 |
  | `longest` | 가장 긴 접두사 | 목적지·`/28` 행 | 앞 28비트까지 맞는 `/28` 행이 더 좁게 가리키므로 그 행의 게이트웨이로 보낸다 |

- 요점 테스트: `both-match`의 선명한 행 노드가 둘이다. `longest`의 선명한 행 노드는 라벨에 `/28`이 있는 하나이고, 목적지에서 그 행으로 가는 경로만 보인다.

#### 3-2. `routing.default-route` — `DefaultRouteDiagram`, JSON 키 `default-route`

- 물음형 제목 예: `표에 맞는 행이 없으면 패킷은 어디로 갈까?`
- 그릴 것: 라우터 1의 표 두 행(`192.0.2.0/24 → eth0`, `0.0.0.0/0 → 203.0.113.2`), 패킷 두 개(목적지 `192.0.2.4`·`198.51.100.7`), 그 너머 호스트 쪽과 라우터 2 쪽.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `specific` | 맞는 행이 있을 때 | `192.0.2.4` 패킷·`/24` 행 | `192.0.2.4`는 `192.0.2.0/24` 행에 맞아 `eth0` 쪽으로 간다 |
  | `default` | 맞는 행이 없을 때 | `198.51.100.7` 패킷·`0.0.0.0/0` 행·라우터 2 | 맞는 행이 디폴트 라우트뿐이라 게이트웨이 `203.0.113.2`로 보낸다 |

- 요점 테스트: `specific`에서 `0.0.0.0/0` 행이 흐리고, `default`에서 `/24` 행이 흐리다. `default`의 보이는 경로가 라우터 2 쪽에서 끝난다.

위 도식 설계는 출발점이다. 본문(step 11 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 104개, 마지막 id는 `n104`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 12의 개념에서 이미 푼 낱말을 다시 풀지 않았는가. 2진수 비교를 손으로 다시 해 봤는가.
   step 11 summary가 정한 것을 지켰는가.
3. `phases/74-network-addressing-routing/index.json`의 step 13을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 22~26을 만들지 마라.** 이유: step 14~16의 범위다.
- **강의 예(`192.168.2.20`·`192.168.2.16/28`·`192.168.0.0/16`·`192.168.0.1`)를 옮기지 마라.** 이유: guide.md 「예시 값」 — 문서용 대역에서 다시 만든다.
