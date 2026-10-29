# Step 6: public-private

## 배경

phase 74는 네트워크 과목의 `ip-addressing`·`ip-address-types`·`routing`을 만든다. 전체 계획·결정·공통 규칙은 `phases/74-network-addressing-routing/guide.md`에 있다.
**이 step은 주제 `ip-address-types`를 만들고 그 첫 개념 둘(9 공인 IP 주소, 10 사설 IP 주소)의 글·문항·도식을 함께 만든다.** `ip-addressing`은 step 1~4가 끝냈다.

이 주제는 학습자가 「IP 주소는 세계에서 하나뿐인가」를 처음 여는 화면이다. 앞 주제를 읽지 않고 바로 들어올 수 있다.

## 읽어야 할 파일

- **`phases/74-network-addressing-routing/guide.md` 전체** — 개념 표, 예시 값(특히 「사설 주소의 예」), 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/74-network-addressing-routing/index.json`의 step 5 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 step 4 `summary`(교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-6 IP 주소의 분류」 절과 「강의 수정 이력」(L7·L8), `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p180~p188 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`,
  `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들과 step 1~4가 만든 `ip-addressing` 도식), `src/types/visuals.ts`, `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

`ip-addressing` 주제 바로 뒤에 주제 객체를 더한다 — `{ "id": "ip-address-types", "title": "공인·사설 IP, NAT, DHCP", "importance": 3, "sourcePages": [180, 198], "concepts": [ … ] }`.
개념은 guide.md 표의 9·10이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `ip-address-types.public-address` | 공인 IP 주소 | — | 이 주제의 첫 개념이라 **IP 주소**(장치를 가리키는 32비트 주소, 예 `203.0.113.1`), **인터넷**(세계의 네트워크들을 이은 네트워크), **라우터**, **ISP**(인터넷에 이어 주는 회사)를 짧게 푼다. 「IP 주소는 세계에서 하나뿐인가」라는 물음으로 열고 — 공인 주소는 그렇고 사설 주소는 아니다 — 공인 주소를 겹치지 않게 나눠 주는 차례를 쓴다(step 5 결과대로). 예시 주소가 문서의 예로 쓰라고 남겨 둔 주소라는 것을 밝힌다 |
| 10 | `ip-address-types.private-address` | 사설 IP 주소 | — | 사설 네트워크(회사·집처럼 한 조직 안의 네트워크)를 푼다. 대역 셋의 시작·끝 주소, 여러 조직이 같은 사설 주소를 써도 되는 까닭(인터넷으로 나가지 않으므로), 인터넷의 라우터가 사설 주소로 가는 경로를 받지 않는다는 것. 172.16~172.31의 경계는 `/12`에서 나온다는 것을 계산으로 보인다(둘째 옥텟의 앞 4비트 `0001`이 같다). 예는 `192.168.0.10`(사설 주소라고 밝힌다). 사설 주소로 인터넷에 나가려면 경계의 장비가 주소를 바꿔야 한다는 한 줄(NAT라는 이름과 한 줄 풀이만) |

### 2. 문항 — `src/data/network/questions.json`에 `n090`~`n092`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n090` | `public-address` | 예/아니요 감 — 흔한 오해 「회사 안 컴퓨터의 IP 주소도 모두 세계에서 하나뿐이다」(아니요 — 사설 주소), 또는 공인 주소를 아무나 정해 쓸 수 없는 까닭. 주장의 방향은 균형에 맞춰 고른다 |
| `n091` | `private-address` | 4지선다 「상황 적용」 감 — 사설 주소가 **아닌** 것을 고르거나 사설 주소인 것을 고른다. 오답과 정답을 대역의 경계 가까이에서 고른다(172.15·172.16·172.31·172.32처럼). 보기에 쓰는 공인 쪽 주소는 문서용 대역이나, 「사설 대역 밖」임만 판단하면 되는 주소로 하고, 그 주소가 실제로 누구 것인지 말하지 않는다 |
| `n092` | `private-address` | 예/아니요 감 — 「서로 다른 두 회사가 안쪽 네트워크에서 같은 사설 주소 `192.168.0.10`을 써도 된다」(예), 또는 「사설 주소를 쓰는 호스트가 보낸 패킷은 주소를 바꾸지 않아도 인터넷의 서버에 닿는다」(아니요). n091과 다른 것을 묻는다 |

기출 문항의 문장을 옮기지 않는다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

이 step이 `src/data/network/visuals/ip-address-types.json`을 만들고 `src/data/network/index.ts`의 `visualsByTopicId`에 `'ip-address-types': ipAddressTypesVisuals`로 넣는다(guide.md 「주제의 시각 요소 파일」).

#### 3-1. `ip-address-types.public-address` — `PublicAllocationDiagram`, JSON 키 `public-allocation`

- 물음형 제목 예: `공인 IP 주소는 누가 나눠 줄까?`
- 그릴 것: 위에서 아래로 나눠 주는 차례 — `IANA` → 지역 등록 기관(예: `APNIC`) → (나라 기관) → `ISP` → 사용자(회사·가정). 이어지는 경로. 단계 이름은 step 5 결과대로(확인되지 않은 단계는 그리지 않는다).
- 시나리오: 정지 그림(`idleCaption` — 공인 주소는 겹치지 않도록 위에서 아래로 나눠 준 묶음 안에서만 쓴다)으로 해도 된다. 시나리오를 두면 둘 — `chain`(나눠 주는 차례 전체), `isp`(사용자는 ISP에게서 주소를 받는다).
- 요점 테스트: 경로가 위의 기관에서 아래의 사용자 쪽으로만 이어진다(사용자 노드에서 시작하는 경로가 없다). `IANA` 노드가 맨 위에 있다.

#### 3-2. `ip-address-types.private-address` — `PrivateRangesDiagram`, JSON 키 `private-ranges`

- 물음형 제목 예: `사설 IP 주소는 어느 범위이고, 왜 겹쳐도 될까?`
- 그릴 것: 대역 노드 셋(`10.0.0.0/8`·`172.16.0.0/12`·`192.168.0.0/16`)과 곁말로 각 끝 주소. 그 아래에 사설 네트워크 둘(그룹 박스 「회사 1」·「회사 2」), 각각 안에 호스트 `192.168.0.10`, 둘 사이에 「인터넷」 노드.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `ranges` | 사설 대역 셋 | 대역 노드 셋 | 사설 주소는 이 세 범위 안의 주소다 |
  | `overlap` | 겹쳐 쓰기 | 두 회사의 호스트 | 두 회사가 같은 사설 주소를 써도, 그 주소가 인터넷으로 나가지 않으므로 부딪치지 않는다 |

- 요점 테스트: `ranges`의 선명한 노드가 대역 셋이고 곁말에 `172.31.255.255`가 있다. `overlap`의 선명한 호스트 노드 둘의 라벨이 같고(`192.168.0.10`) 서로 다른 그룹 박스 안에 있다. 호스트에서 인터넷 노드로 가는 보이는 경로가 없다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~10, 12~16)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 92개, 마지막 id는 `n092`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `ip-addressing` 바로 뒤에 있고, `importance` 3·`sourcePages` [180, 198]인지, `data.test.ts`의 주제 지도·진행 안내 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 5 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가. L8(바깥 호스트에 사설 주소)을 어기지 않았는가.
4. `phases/74-network-addressing-routing/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 11~17(예약된 IP 주소, 루프백 주소, NAT, NAPT, 정적·동적 주소, DHCP, DHCP 메시지 교환)을 만들지 마라.** 이유: step 7~10의 범위다. 이 step의 글이 그 낱말을 쓸 때는 한 줄 풀이로 그친다.
- **`ip-addressing` 주제를 고치지 마라.** 이유: step 1~4가 끝낸 주제다. 고칠 것을 찾으면 summary에 적는다.
