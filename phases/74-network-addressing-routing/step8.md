# Step 8: nat-napt

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `ip-address-types`에 개념 둘(13 NAT, 14 NAPT)의 글·문항·도식을 더한다.** 개념 9~12는 step 6·7이 만들었다.

기출은 NAT를 여섯 번 물었다 — 무엇을 하는 기술인지, 정적 NAT, PAT, 계층(L2가 아니다), 보안. 강의 p189는 NAT를 「주소 부족 문제 해결」로 소개하지만 L7이 「완화」로 한정했다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — **이 문서를 따른다**(특히 「예시 값」의 사설·공인·포트 번호)
- `phases/74-network-addressing-routing/index.json`의 step 5 `summary`(NAT의 보안, PAT라는 이름, 정적·동적 대응의 처리)와 step 6·7 `summary`(이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-6」 절, 「Ch4-1 포트」 절의 NAT 줄, 「강의 수정 이력」의 L7·L8, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p189와 p230~p233 — 원문(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `ip-address-types`의 개념 9~12와 `arp.arp-across-routers` 끝 문단 — NAT를 한 줄로 언급한다), `src/data/network/questions.json`, `src/data/network/visuals/ip-address-types.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`
- step 6·7이 만든 도식과 그 테스트, 도식 선례(guide.md 「도식」, 특히 표 모양의 `MacTableDiagram`·`ArpCacheDiagram`), `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `ip-address-types`에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 13 | `ip-address-types.nat` | NAT (Network Address Translation) | — | 무엇인가(경계의 장비가 지나가는 패킷의 IP 주소를 바꾸는 기능) → 어떻게(나갈 때 출발지 사설 주소를 공인 주소로, 응답이 들어올 때 목적지를 다시 사설 주소로 — 그 짝을 표에 적어 둔다) → 예(호스트 `192.168.0.10` → NAT 라우터 바깥 주소 `203.0.113.1` → 서버 `198.51.100.10`, 응답은 거꾸로) → 어느 계층인가(IP 헤더의 주소를 고치므로 네트워크 계층) → 무엇을 주는가(공인 주소가 덜 필요해 주소 부족을 완화한다 — L7. 주소 공간을 늘린 것은 IPv6). 주소 대응을 고정하는 방식과 묶음에서 고르는 방식, 보안에 관한 문장은 step 5 결과대로만 쓴다 — 기출 보기의 「보안상 이점」을 사실처럼 쓰지 않는다(step 5가 정한 처리를 따른다) |
| 14 | `ip-address-types.napt` | NAPT (Network Address Port Translation) | `nat` | **포트**(한 호스트 안에서 어느 프로그램의 통신인지 가리키는 번호)를 푼다. 주소만 바꾸는 NAT는 공인 주소 하나에 사설 주소 하나를 대응시키지만, NAPT는 포트 번호까지 바꿔 공인 주소 하나를 여러 호스트가 함께 쓰게 한다 — 무엇이 다르고 왜 나눠 부르는지(WRITING_GUIDE 4절). 예 — 호스트 `192.168.0.10`과 `192.168.0.11`이 같은 출발지 포트 `50000`으로 보내도, NAT 라우터가 `203.0.113.1`의 포트 `60001`·`60002`로 나눠 적어 응답을 제 호스트에게 돌려준다(포트 번호는 예시 값이라고 밝힌다). 이름 「PAT」의 처리는 step 5 결과대로 |

### 2. 문항 — `src/data/network/questions.json`에 `n095`~`n096`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n095` | `nat` | 4지선다 「원리 이해」 또는 예/아니요 감 — 응답 패킷이 NAT 라우터에 들어올 때 무엇을 보고 어느 호스트에게 돌려주는지, 또는 흔한 오해 「NAT는 프레임의 MAC 주소를 바꾸는 데이터 링크 계층 기술이다」(아니요). 「주소 부족을 해결한다」를 맞는 보기로 두지 않는다(L7) |
| `n096` | `napt` | 4지선다 「상황 적용」 감 — 사설 네트워크의 호스트 셋이 공인 주소 하나로 동시에 인터넷 서버와 통신하는 상황에서, NAT 라우터가 응답을 제 호스트에게 돌려주려고 기록하는 것을 고른다. 오답은 같은 범주(MAC 주소만, 목적지 주소만, 사설 주소만)에서 |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `ip-address-types.nat` — `NatTranslationDiagram`, JSON 키 `nat-translation`

- 물음형 제목 예: `NAT 라우터는 패킷의 주소를 어떻게 바꿀까?`
- 그릴 것: 왼쪽(세로형은 위) 사설 네트워크 그룹 박스 안의 호스트 `192.168.0.10`, 가운데 NAT 라우터(안쪽 `192.168.0.1`·바깥 `203.0.113.1`), 오른쪽(세로형은 아래) 인터넷 쪽 서버 `198.51.100.10`. 곁말로 구간마다의 출발지·목적지 주소.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `outbound` | 나갈 때 | 호스트·NAT 라우터·서버 | NAT 라우터가 출발지 `192.168.0.10`을 `203.0.113.1`로 바꿔 내보내고 그 짝을 적어 둔다 |
  | `inbound` | 응답이 올 때 | 서버·NAT 라우터·호스트 | 응답의 목적지 `203.0.113.1`을 적어 둔 짝에 따라 `192.168.0.10`으로 바꿔 넘긴다 |

- 요점 테스트: `outbound`의 경로가 호스트에서 시작해 서버에서 끝나고, 라우터 앞 구간 곁말에 `192.168.0.10`, 뒤 구간 곁말에 `203.0.113.1`이 출발지로 있다. `inbound`의 경로는 서버에서 시작해 호스트에서 끝난다. 서버 쪽 구간 곁말 어디에도 `192.168.0.`로 시작하는 주소가 없다.

#### 3-2. `ip-address-types.napt` — `NaptPortsDiagram`, JSON 키 `napt-ports`

- 물음형 제목 예: `공인 주소 하나를 여러 호스트가 어떻게 나눠 쓸까?`
- 그릴 것: 사설 네트워크의 호스트 둘(`192.168.0.10`·`192.168.0.11`), NAT 라우터(`203.0.113.1`), NAT 라우터 아래 대응 표의 두 줄(`192.168.0.10:50000` ↔ `203.0.113.1:60001`, `192.168.0.11:50000` ↔ `203.0.113.1:60002`), 서버.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `host-1` | 첫 호스트 | 호스트 `.10`·NAT 라우터·표 첫 줄·서버 | 같은 공인 주소라도 포트 `60001`로 나가므로 응답을 `.10`에게 돌려줄 수 있다 |
  | `host-2` | 둘째 호스트 | 호스트 `.11`·NAT 라우터·표 둘째 줄·서버 | 둘째 호스트는 포트 `60002`로 나가 첫 호스트와 갈린다 |

- 요점 테스트: 두 시나리오의 선명한 NAT 라우터 노드가 같은 노드(공인 주소 하나)이고, 선명한 표 줄은 서로 다르며 그 라벨의 공인 쪽 포트가 다르다(`60001`·`60002`). 두 호스트의 사설 쪽 포트는 같다(`50000`).

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 표 줄의 글자가 280 폭에 들지 않으면 줄을 둘로 나누거나 곁말로 돌린다 — 주소를 줄여 쓰지 않는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 96개, 마지막 id는 `n096`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 6·7의 개념에서 이미 푼 낱말을 다시 풀지 않았는가. NAT와 NAPT가 같은 말을 되풀이하지 않고 차이를 말하는가.
   step 5 summary가 정한 것(보안·PAT·정적 대응)과 L7·L8을 지켰는가.
3. `phases/74-network-addressing-routing/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 15~17을 만들지 마라.** 이유: step 9·10의 범위다.
- **NAT를 「주소 부족을 해결한다」로 쓰지 마라.** 이유: L7 — 완화다.
- **잘 알려진 포트 번호(80 등)나 강의 그림의 주소·포트(p230–p233)를 예로 옮기지 마라.** 이유: guide.md 「예시 값」. 포트와 서비스의 대응은 `ports` 주제의 일이다.
