# Step 5: frame-fields

## 배경

phase 72는 네트워크 과목의 `ethernet`(이더넷과 프레임)과 `hub-switch-vlan`(허브·스위치·VLAN)을 만든다. 전체 계획·결정·공통 규칙은 `phases/72-network-ethernet-switch/guide.md`에 있다.
step 2~4가 `ethernet`의 개념 1~6(이더넷부터 이더넷 프레임까지)을 만들었다.
**이 step은 프레임에 딸린 개념 7 이더타입/길이 필드와 8 FCS의 글·문항·도식을 만들어 `ethernet` 주제를 끝낸다.** 둘 다 강의 내용이 표준과 달라 고친 자리가 있다(L1, 면접 I1).
다음 step 6부터는 둘째 주제 `hub-switch-vlan`이다.

## 읽어야 할 파일

- **`phases/72-network-ethernet-switch/guide.md` 전체.** **이 문서를 따른다**
- `phases/72-network-ethernet-switch/index.json`의 step 0~4 `summary` — 특히 step 0의 i(FCS)와 step 4(프레임 본문이 필드를 어떻게 불렀는지)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch2-1 이더넷」 절과 수정 이력(**L1**), `docs/source/network/interview-facts.md`의 Q21과 수정 이력 **I1**,
  `docs/source/network/standards.md`(IEEE 802.3 §3.2.6·§3.2.9·§3.4, IEEE RA EtherType, IANA IEEE 802 Numbers, RFC 9542), `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p67~p70 — 원문 확인용(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- **`src/data/network/topics.json`의 `ethernet` 주제(개념 1~6)** — 이미 푼 낱말(프레임, 비트·바이트, 16진수, 헤더·트레일러 등)을 다시 풀지 않는다
- `src/data/network/questions.json`, `src/data/network/visuals/ethernet.json`, `src/data/network/data.test.ts`(`parentId` 규칙), `src/data/index.test.ts`의 예/아니요 불변식
- 도식 선례(guide.md 「도식」)와 step 2~4가 만든 도식과 그 테스트, `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 둘 — `ethernet` 주제의 `concepts` 끝에(개념 6 바로 뒤)

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `ethernet.ethertype-length` | 이더타입/길이 필드 | `ethernet.frame` | 2바이트 필드가 값으로 두 뜻 — 1536(16진 0600) 이상이면 이더타입(데이터 칸에 무엇이 들었는지: 0800 IPv4, 86DD IPv6, 0806 ARP), 1500 이하면 데이터의 길이. **수정 이력 L1을 고친 쪽으로** — 프레임 전체 크기가 아니다. 두 읽기는 겹치지 않는다. 받는 쪽이 이 값을 보고 데이터를 누구에게 넘길지 정한다는 원리. IPv4·IPv6·ARP는 한 줄 풀이만(인터넷에서 쓰는 주소 체계의 두 판, IP 주소로 MAC 주소를 알아내는 프로토콜 — 출처에 있는 말로) |
| 8 | `ethernet.fcs` | FCS (Frame Check Sequence) | `ethernet.frame` | 프레임 끝의 4바이트 값(CRC). 보내는 쪽이 프레임 내용으로 계산해 끝에 붙이고, 받는 쪽이 받은 내용으로 다시 계산해 다르면 오류로 보고 그 프레임을 버린다. **고치지 않는다(I1)** — 다시 보내 달라고 하는 것도 이더넷이 하는 일이 아니다(출처에 있는 범위에서). CRC는 「보낼 비트들로 계산한 검사용 값」 정도로 풀고 계산법은 다루지 않는다. FCS를 무엇으로 계산하는지(프리앰블·FCS를 뺀 나머지)는 `standards.md` §3.2.9 |

### 2. 문항 — `n033`~`n034`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n033` | `ethertype-length` | 「상황 적용」 — 필드 값 하나를 주고 받는 쪽이 그것을 어떻게 읽는지(이더타입인지 길이인지, 무엇이 들었는지)를 고르게 한다. 또는 L1의 오해(1500 이하면 프레임 전체 크기)를 겨냥한 예/아니요 |
| `n034` | `fcs` | I1의 오해(오류를 찾으면 고쳐서 넘긴다)를 겨냥한 예/아니요 감. 해설은 검출하고 버릴 뿐 고치지 않는다는 것을 가르친다. 주장의 방향은 균형에 맞춰 고른다 |

### 3. 도식 — `src/data/network/visuals/ethernet.json`의 `diagrams`에 더한다

#### 3-1. `ethernet.ethertype-length` — `EtherTypeLengthDiagram`, JSON 키 `ethertype-length`

- 물음형 제목 예: `같은 두 바이트를 왜 다르게 읽을까?`
- 그릴 것: 필드 값의 범위를 두 구간(1500 이하 — 길이로 읽음, 1536 이상 — 이더타입으로 읽음)과 그 사이 쓰지 않는 틈으로 나눈 띠, 그리고 시나리오마다 그 값이 어느 구간에 떨어지는지와 받는 쪽의 읽기.
- 시나리오(값은 본문에 나오는 것만):

  | id | label | 선명한 것·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `ipv4` | 0800 | 이더타입 구간, 곁말 `IPv4` | 1536 이상이라 이더타입으로 읽고, 데이터 칸에 IPv4 패킷이 들었다고 안다 |
  | `arp` | 0806 | 이더타입 구간, 곁말 `ARP` | 같은 구간의 다른 값은 다른 내용물을 가리킨다 |
  | `length` | 1500 이하 값 | 길이 구간, 곁말 `데이터의 길이` | 1500 이하면 데이터의 길이로 읽는다 — 프레임 전체 크기가 아니다 |

  `length`의 예시 값을 숫자로 쓰려면 본문에 그 숫자가 있어야 한다.
- 요점 테스트: 이더타입 시나리오들은 1536 이상 구간만, `length`는 1500 이하 구간만 선명하다. 두 구간 노드가 겹치지 않고 1500 이하 구간이 앞(세로형 위, 가로형 왼쪽)에 있다.

#### 3-2. `ethernet.fcs` — `FcsCheckDiagram`, JSON 키 `fcs-check`

- 물음형 제목 예: `받은 프레임이 망가졌는지 어떻게 알까?`
- 그릴 것: 보내는 쪽(프레임 내용으로 계산 → FCS를 붙임), 링크, 받는 쪽(다시 계산 → 받은 FCS와 비교), 비교 뒤의 갈림(위 계층에 넘김 / 버림).
- 시나리오:

  | id | label | 경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `match` | 값이 같을 때 | 비교 → 넘김 경로 | 다시 계산한 값과 FCS가 같으면 데이터를 위 계층으로 넘긴다 |
  | `mismatch` | 값이 다를 때 | 링크 곁에 손상 곁말, 비교 → 버림, 넘김 경로 없음 | 다르면 오류로 보고 버린다 — 고치지 않는다 |

- 요점 테스트: `match`에만 넘김 경로가 보이고 `mismatch`에만 버림 곁말이 보인다. 어느 시나리오에도 「고침」·「다시 보냄」을 뜻하는 경로나 곁말이 없다(본문이 그 일을 하지 않는다고 말하므로).

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~11)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 34개, 마지막 id는 `n034`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다. `ethernet`의 개념 1~6 줄, `n026`~`n032`, 앞 step의 도식 파일이 바뀌지 않았는지 기계로 확인한다.
2. `parentId`가 두 단·연속 규칙을 지키는가(개념 7·8이 개념 6 바로 뒤에 붙어 있다).
3. **`ethernet` 주제 전체(개념 1~8)를 처음부터 통독한다** — 이 주제가 완성되는 step이다. 풀이 없이 처음 나오는 낱말, 같은 것을 두 이름으로 부르는 곳, 개념끼리 같은 말을 되풀이하는 곳을 찾아
   이 step의 개념이면 고치고, 앞 step의 개념이면 고치지 말고 summary에 적는다.
4. L1·I1을 지켰는가 — 「1500 이하 = 프레임 크기」, 「FCS로 오류를 고친다」로 읽힐 문장이 없는가.
5. `phases/72-network-ethernet-switch/index.json`의 step 5를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」과 3에서 찾은 것.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`hub-switch-vlan` 주제를 만들지 마라.** 이유: step 6부터의 범위다.
- **IPv4·IPv6·ARP를 이 주제에서 풀어 설명하지 마라.** 이유: phase 73의 주제다. 이더타입 값이 무엇을 가리키는지 알 만큼의 한 줄 풀이로 그친다.
- **CRC 계산법을 더하지 마라.** 이유: 기출이 묻지 않는다(ADR-059 — 기출이 묻는 사실과 그 바탕만).
