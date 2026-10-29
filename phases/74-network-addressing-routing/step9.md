# Step 9: static-dynamic-address

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `ip-address-types`에 개념 하나(15 정적 IP 주소와 동적 IP 주소)의 글·문항·도식을 더한다.** 개념 9~14는 step 6~8이 만들었다.
개념이 하나뿐인 step이다 — 다음 step 10이 DHCP와 그 메시지를 한 번에 만들도록, 그 앞의 이 개념을 따로 둔 것이다.

기출은 「DHCP를 적용할 장비로 알맞은 것」을 두 번, 「DHCP의 장점이 아닌 것(고정 주소가 필요한 웹 서버에 동적 주소)」을 한 번 물었다. 그 판단의 바탕이 이 개념이다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 5 `summary`(특히 고정 주소를 쓸 장치의 처리와 E번호)와 step 6~8 `summary`(이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-6」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p190~p191, p197~p198 — 원문(옮기지 않는다). 그림은 렌더해서 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(특히 `ip-address-types`의 개념 9~14), `src/data/network/questions.json`, `src/data/network/visuals/ip-address-types.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`
- step 6~8이 만든 도식과 그 테스트, 도식 선례(guide.md 「도식」), `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `ip-address-types`에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 15 | `ip-address-types.static-dynamic-address` | 정적 IP 주소와 동적 IP 주소 | — | **목록 개념**. 소개 문단 — 장치가 IP 주소를 갖는 방법은 사람이 직접 정해 넣는 것(정적 할당)과 네트워크에 이을 때 자동으로 받는 것(동적 할당) 둘이다(p190). 항목 둘 — **정적 IP 주소**(관리자가 장치의 설정 화면에 주소·서브넷 마스크·기본 게이트웨이를 직접 넣는다, 바꾸지 않으면 그대로다 — p191·p197–p198의 화면이 보이는 것), **동적 IP 주소**(장치가 켜지거나 네트워크에 이을 때 받고, 다음에 받을 때는 다른 주소일 수 있다 — 자동으로 주는 프로토콜은 DHCP라는 한 줄). 항목 뒤 문단 — 어느 장치에 어느 쪽이 맞는가(다른 장치가 늘 같은 주소로 찾아오는 서버·네트워크 프린터 / 자주 들고 나는 사용자 PC). 그 판단의 근거와 「자격시험은」 줄은 step 5 결과대로. 서브넷 마스크·기본 게이트웨이를 한 줄씩 푼다(이 주제에서 처음이면) |

### 2. 문항 — `src/data/network/questions.json`에 `n097`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n097` | `static-dynamic-address` | 4지선다 「상황 적용」 감 — 한 사무실의 장치 가운데 동적 주소(DHCP)가 가장 알맞은 것, 또는 고정 주소가 필요한 것을 고른다. 기출의 장치 목록을 그대로 쓰지 말고 상황을 직접 만든다. 정답이 step 5가 정한 근거(표준이든 「자격시험은」이든)로 하나로 정해져야 한다 — 근거가 「자격시험은」뿐이면 해설에 그렇다고 밝힌다. 균형상 예/아니요가 필요하면 흔한 오해 「동적 주소는 한 번 받으면 바뀌지 않는다」(아니요) |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### `ip-address-types.static-dynamic-address` — `AddressAssignmentDiagram`, JSON 키 `address-assignment`

- 물음형 제목 예: `주소를 직접 정할 때와 자동으로 받을 때는 무엇이 다를까?`
- 그릴 것: 사설 네트워크 그룹 박스 안에 관리자가 주소를 정한 장치(예: 「프린터」 `192.168.0.2`)와 자동으로 받는 장치 둘(「PC 1」·「PC 2」), 주소를 나눠 주는 장치(「DHCP 서버」 — 공유기 자리 `192.168.0.1`). 곁말로 주소.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `static` | 정적 할당 | 프린터 | 관리자가 넣은 주소는 바꾸지 않는 한 그대로라 다른 장치가 늘 같은 주소로 찾아온다 |
  | `dynamic` | 동적 할당 | DHCP 서버·PC 1·PC 2 | PC는 네트워크에 이을 때 DHCP 서버에게 주소를 받고, 다음에는 다른 주소를 받을 수 있다 |

- 요점 테스트: `static`의 보이는 경로가 없거나 DHCP 서버에 닿지 않는다(프린터는 서버에게 받지 않는다). `dynamic`의 보이는 경로는 DHCP 서버에서 시작해 두 PC에서 끝난다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 「어느 장치에 고정 주소」가 step 5 결과로 「자격시험은」 줄뿐이면, 도식의 캡션은 그 판단을 사실처럼 말하지 말고 정적·동적의 동작만 말한다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 97개, 마지막 id는 `n097`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 6~8의 개념에서 이미 푼 낱말을 다시 풀지 않았는가. step 5 summary가 정한 것을 지켰는가.
3. `phases/74-network-addressing-routing/index.json`의 step 9를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **DHCP의 동작(임대·갱신·메시지·할당 방식)을 이 개념에 쓰지 마라.** 이유: step 10의 개념 16·17이다. 이 개념은 「자동으로 주는 프로토콜이 DHCP」라는 한 줄로 그친다.
- **강의 화면의 주소(`192.168.219.103`·`8.8.8.8` 등)와 운영체제 설정 화면의 메뉴 이름을 옮기지 마라.** 이유: guide.md 「예시 값」. 설정 화면의 조작 방법은 이 과목의 범위가 아니다.
