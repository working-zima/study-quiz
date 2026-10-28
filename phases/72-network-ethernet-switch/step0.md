# Step 0: ethernet-sources

## 배경

phase 72는 네트워크 과목의 `ethernet`(이더넷과 프레임)과 `hub-switch-vlan`(허브·스위치·VLAN)을 만든다. 전체 계획과 결정은 `phases/72-network-ethernet-switch/guide.md`에 있다.
step 2~5가 `ethernet`의 개념 8개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실 가운데 강의 밖이거나 강의가 틀렸을 수 있는 것을 표준·공식 문서로 확인하고 출처 문서에 남긴다.**
데이터·코드는 고치지 않는다. 뒤 step은 이 step이 남긴 기록과 summary를 보고 무엇을 쓰고 무엇을 쓰지 않을지 정한다.

## 읽어야 할 파일

- `phases/72-network-ethernet-switch/guide.md` — 특히 「두 주제와 개념 20개」의 `ethernet` 표와 「예시 값」
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 가리키는 표기, 그림만 있는 슬라이드를 보는 법. **이 규칙을 따른다**
- `docs/source/network/lecture-outline.md`의 「Ch2-1 이더넷」 절과 「강의 수정 이력」 전체(L1·L2의 형식이 본보기다)
- `docs/source/network/standards.md` 전체 — 이미 있는 IEEE 802.3 §3.2.6·§3.2.9·§3.4, IEEE RA, IANA, RFC 9542 항목. 있는 사실을 다시 찾지 않는다
- `docs/source/network/interview-facts.md`의 Q21과 수정 이력 I1, `docs/source/network/exam-notes.md`(E1~E3의 형식이 본보기다)
- `docs/source/network/raw/lecture.md`의 p48~p70 — 원문(옮기지 않는다). 그림 슬라이드 p48–p50·p60·p64는 렌더해서 본다(CLAUDE.md의 PyMuPDF 방법)
- `docs/source/network/raw/exam/data.txt`에서 `ethernet`으로 분류한 줄과 그 문항(시험 날짜·번호로 `raw/exam/`의 교사용 텍스트에서 찾는다) — 시험이 무엇을 정답으로 보는지만 본다. 문장을 옮기지 않는다
- `docs/ADR.md`의 **ADR-055**, **ADR-057**, **ADR-059**, **ADR-009**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어(WebFetch) 확인한다

IEEE 802.3 표준 본문은 허용한 곳에서 무료로 열리지 않는 경우가 많다. phase 69가 한 것처럼 **IEEE 802.3 작업 그룹이 `ieee802.org`에 올린 개정 초안·회의 자료·작업 그룹 페이지가
그 절의 본문이나 내용을 싣고 있으면 그것을 근거로 쓰고, 어떤 문서인지(초안 이름·날짜)를 항목에 적는다.** `standards.ieee.org`의 표준 소개 페이지, IETF RFC, IANA도 허용한 곳이다.
위키백과·블로그·업체 학습 페이지는 쓰지 않는다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `standard-names` | 규격 이름 표기 규칙 — 속도, BASE(베이스밴드의 뜻인지), 뒤 글자. 매체 글자의 뜻: 강의 p59는 C = 동축, T = 트위스티드 페어, S = 멀티 모드 광, L = 싱글 모드 광이라 한다. 1000BASE-CX의 C, 1000BASE-SX·LX의 S·L이 매체가 아니라 다른 것(파장 등)을 뜻하는지, 1000BASE-LX가 멀티 모드 광에서도 쓰이는지 | IEEE 802.3 §1.2.3(물리 계층·매체 표기), Clause 38·39(1000BASE-SX/LX/CX), 802.3z 자료 |
| b | `fast-gigabit` | 100 Mb/s 규격(802.3u, 100BASE-T 계열·100BASE-TX)과 그 이름 「Fast Ethernet」이 허용한 출처에 있는지 | `ieee802.org/3`의 작업 그룹·태스크 포스 페이지, `standards.ieee.org`의 802.3u 소개 |
| c | `fast-gigabit` | 1 Gb/s 규격 — 802.3z(1000BASE-X: SX·LX·CX)와 802.3ab(1000BASE-T, 어떤 케이블을 몇 쌍 쓰는지), 이름 「Gigabit Ethernet」 | `ieee802.org/3/z`, `ieee802.org/3/ab` |
| d | `fast-gigabit` | 10 Gb/s — 802.3ae(10기가비트 이더넷, 전이중만 쓰는지), 802.3an(10GBASE-T). 강의 p55의 802.3cc(25 Gb/s 싱글 모드 광)도 맞는지 | `ieee802.org/3/ae`, `ieee802.org/3/an`, `ieee802.org/3/cc` |
| e | `mac-address` | 48비트, 16진 표기(IEEE·RFC의 하이픈 꼴), 첫 옥텟의 I/G 비트(개별·그룹), 모든 비트가 1인 브로드캐스트 주소, RFC 9542 §2.1.4의 문서용 주소 | RFC 9542 §2.1·§2.1.1·§2.1.4, IEEE RA EUI 가이드 |
| f | `mac-address` | **새 수정 이력 후보**: 강의 예시 MAC 주소 `a1:c2:e3:a4:c5:e6`(p64)와 `ab:cd:ab:cd:00:01`~`00:04`(Ch2-3 p93–p97 그림)는 첫 옥텟이 홀수라 그룹 주소다. 같은 예시가 강의의 다른 쪽(Ch3 등)에도 쓰였는지 `raw/lecture.md`와 렌더로 찾는다 | RFC 9542 §2.1.1 |
| g | `nic` | 받은 프레임의 목적지가 자기 주소가 아니면 버린다(강의 p66). 자기 주소 말고 브로드캐스트·그룹 주소의 프레임도 받아들이는지 | IEEE 802.3 Clause 4(MAC의 수신 — 주소 인식), RFC 9542 |
| h | `frame` | 프리앰블 7옥텟·SFD 1옥텟의 값(강의 p62). **IEEE 802.3이 프리앰블·SFD를 「프레임」 안에 넣는지, 프레임 앞에 붙는 것으로 따로 보는지**(강의 p60–p61은 프리앰블을 프레임의 첫 필드로 그린다). 데이터 46~1500옥텟과 패드 | IEEE 802.3 §3.1.1(프레임 형식)·§3.2.1~3.2.2·정의 절(1.4), 이미 있는 §3.2.6 항목 |
| i | `fcs` | 이미 있는 §3.2.9·§3.4 항목으로 충분한지만 본다(CRC를 무엇으로 계산하고, 다르면 버리고, 고치지 않는다) | `standards.md` |

빠진 것을 읽다가 찾으면 더한다. 강의 Ch2-1 p48–p70에서 표준과 다르거나 오해를 부르게 줄여 말한 곳이 더 있으면 같은 방법으로 확인한다.

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 72) <문서 이름> — <절 제목>`, URL 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— §절 번호`, 「쓰인 곳」.
  같은 문서의 기존 항목이 있으면 그 항목에 「(phase 72)」를 붙인 줄로 더한다. 머리말의 「(phase 71)」 설명 다음 줄에 「(phase 72)」가 무엇인지(이 phase의 이더넷·스위치 사실, 확인한 날) 한 줄을 더한다.
- 초안·회의 자료를 근거로 쓰면 어떤 문서인지와, 그것이 표준 본문을 싣고 있는지 내용만 다루는지를 적는다.
- 「쓰인 곳」에는 아직 개념 id가 없으므로 **쓰일 개념 id**(`ethernet.standard-names` 등)와 수정 이력 번호를 적는다.

### 3. `docs/source/network/lecture-outline.md` — 수정 이력

- 확인 결과 강의가 표준과 다르거나 오해를 부르게 줄여 말했으면 `### L26 — …`부터 번호를 이어 「강의 수정 이력」 끝에 더한다. 형식은 L1·L2와 같다 —
  강의(직접 쓴 말)·표준(직접 쓴 말)·근거(문서와 절, URL)·처리(**고쳐 쓴다 / 한정해 쓴다 / 쓰지 않는다**).
  제목 끝에는 `[phase 72에서 찾음]`을 붙인다. 「설계 때 받은 후보」 표는 phase 69의 기록이라 고치지 않는다.
- 위 1-f(예시 MAC 주소)는 확인되면 항목으로 남기고, 처리는 「고쳐 쓴다 — 예시 주소를 RFC 9542 §2.1.4의 문서용 유니캐스트 주소로 바꾼다」로 적는다.
- 「강의별 정리」의 Ch2-1 절에서 해당 줄 끝에 `⚠ L번호`를 단다(L1·L2처럼). 줄의 내용은 강의가 말한 것 그대로 둔다.
- 확인 결과 강의가 맞으면 수정 이력을 만들지 않고 summary에 「확인 결과 강의가 맞다」로 적는다.

### 4. `docs/source/network/exam-notes.md` — 시험의 답이 표준과 다르거나 표준에 없는 곳

이 주제의 기출 문항(`data.txt`의 `ethernet` 줄)이 정답으로 보는 것이 허용한 출처에 없거나 다르면 `## E4 — …`부터 번호를 이어 더한다(E1~E3 형식).
예: 100BASE-T 계열을 부르는 이름 「Fast Ethernet」이 허용한 출처에 없으면, 본문은 표준이 말하는 것(100 Mb/s 규격, 802.3u)을 쓰고 「자격시험은 이것을 패스트 이더넷이라 부른다」를 덧붙인다고 적는다.
표준에 있으면 항목을 만들지 않는다.

### 5. summary — 뒤 step이 이것을 보고 쓴다

`ethernet`의 개념 8개마다 한 줄씩: **무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(L번호), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호)**.
위 표의 a~i마다 결과(확인함/강의가 맞음/못 찾음)와 근거 문서를 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`lecture-outline.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다(`raw/render/`의 렌더 그림은 gitignore 안이라 나오지 않는다).
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 표준 문서와 강의·기출 문장 모두 옮기지 않는다.
4. `phases/72-network-ethernet-switch/index.json`의 step 0을 갱신한다.
   - 성공 → `"summary"`에 위 「5. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - WebFetch가 아예 되지 않는 등(인터넷 연결 없음) 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 2~5가 쓴다.
- **확인하지 못한 사실을 standards.md·수정 이력에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **허용한 출처 밖의 문서(위키백과·블로그·자격증 교재·업체 학습 페이지)를 근거로 쓰지 마라.** 이유: ADR-059. 강의가 링크해도 마찬가지다.
- **강의·기출·표준 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **`hub-switch-vlan`의 사실(허브·CSMA/CD·스위치·VLAN·STP)을 이 step에서 정리하지 마라.** 이유: step 1의 범위다. 읽다가 본 것은 summary에 메모만 한다.
- **`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 허용 출처 목록은 step 1이 cisco.com을 더할 때만 고친다.
