# Step 11: vlan-details

## 배경

phase 72는 네트워크 과목의 `ethernet`(이더넷과 프레임)과 `hub-switch-vlan`(허브·스위치·VLAN)을 만든다. 전체 계획·결정·공통 규칙은 `phases/72-network-ethernet-switch/guide.md`에 있다.
step 6~10이 `hub-switch-vlan`의 개념 9~18을 만들었다. **이 step은 VLAN에 딸린 마지막 둘 — 19 포트 기반 VLAN과 MAC 주소 기반 VLAN, 20 VLAN 태그와 트렁크 — 의 글·문항·도식을 만들어 phase의 개념 20개를 끝낸다.**

- 19는 강의 p103–p105다.
- 20은 강의에 없고 기출이 세 번 물었다(트렁크, 태그 포트). **VTP는 사용자 결정(2026-10-28, 권장안 A)으로 개념 20의 한 문단에 쓴다** — 시스코가 만든 프로토콜이라, step 1이 허용 출처에 더한 cisco.com의 제품 문서가 출처다.

## 읽어야 할 파일

- **`phases/72-network-ethernet-switch/guide.md` 전체.** **이 문서를 따른다**
- `phases/72-network-ethernet-switch/index.json`의 step 0~10 `summary` — 특히 **step 1**(VLAN 지정 방식·태그·트렁크·VTP의 결과와 E 항목)과 **step 10**(VLAN 도식의 장면)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-057**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`(cisco.com 줄 포함), `docs/source/network/lecture-outline.md`의 「Ch2-3」 절과 수정 이력, `docs/source/network/standards.md`(step 1의 802.1Q·IANA·RFC 7348·RFC 4363·시스코 항목), `docs/source/network/exam-notes.md`(step 1의 E 항목)
- `docs/source/network/raw/lecture.md`의 p103~p105 — 원문 확인용(옮기지 않는다). 그림 p104·p105는 렌더해서 본다
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- **`src/data/network/topics.json`의 `hub-switch-vlan` 주제(개념 9~18)** — 특히 18 VLAN. `ethernet` 주제의 `frame`(태그가 끼는 자리를 말하려면 같은 필드 이름을 쓴다)
- `src/data/network/questions.json`, `src/data/network/visuals/hub-switch-vlan.json`, `src/data/network/data.test.ts`(`parentId`·목록 항목 규칙), `src/data/index.test.ts`의 예/아니요 불변식
- 도식 선례(guide.md 「도식」)와 step 2~10이 만든 도식과 그 테스트 — 특히 `EthernetFrameDiagram`(프레임 칸)과 `VlanSplitDiagram`, `src/components/diagrams/registry.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 둘 — `hub-switch-vlan` 주제의 `concepts` 끝에(개념 18 바로 뒤)

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 19 | `hub-switch-vlan.vlan-membership` | 포트 기반 VLAN과 MAC 주소 기반 VLAN | `hub-switch-vlan.vlan` | **목록 개념** — 소개 문단(장치가 어느 VLAN에 드는지 정하는 두 방식) 뒤에 `- **포트 기반 VLAN**(port-based VLAN)은 …`, `- **MAC 주소 기반 VLAN**(MAC address-based VLAN)은 …`. 강의의 정적·동적이라는 별칭과 그 까닭(관리자가 포트마다 정해 두는가, 장치의 주소로 정해지는가). 결과 — 포트 기반은 장치를 다른 포트에 꽂으면 그 포트의 VLAN이 되고, MAC 주소 기반은 다른 포트에 꽂아도 같은 VLAN이다(p105 그림). 표준에서의 자리는 step 1 결과대로 |
| 20 | `hub-switch-vlan.vlan-tagging` | VLAN 태그와 트렁크 | `hub-switch-vlan.vlan` | 원인 → 해결 순서로. 같은 VLAN이 스위치 여러 대에 걸치면 스위치 사이의 링크 하나로 여러 VLAN의 프레임이 오간다 → 받는 스위치가 어느 VLAN의 프레임인지 알도록 보내는 스위치가 프레임에 VLAN 번호(VLAN ID)를 담은 태그를 끼운다(IEEE 802.1Q — 크기·자리·VLAN ID 12비트와 쓸 수 있는 범위는 step 1 결과대로). 여러 VLAN의 태그 붙은 프레임이 오가는 링크·포트를 트렁크(태그 포트)라 부른다 — 용어의 출처는 step 1 결과대로(E 항목이면 「자격시험은」). 장치에 이은 포트로는 태그를 떼고 내보낸다는 것은 출처가 있을 때만. **끝 문단 — VTP**: 시스코 스위치끼리 VLAN 설정을 트렁크로 퍼뜨려 맞추는 시스코의 프로토콜이고, 스위치마다 모드(서버·클라이언트·트랜스페어런트 — 각각 무엇을 하는지)를 정한다. step 1이 읽은 시스코 문서의 범위를 넘지 않고, 표준이 아니라 한 업체의 기술이라는 것을 밝힌다 |

### 2. 문항 — `n047`~`n048`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n047` | `vlan-membership` | 「상황 적용」 4지선다 또는 예/아니요 — 노트북을 다른 포트로 옮겨 꽂았는데 같은 VLAN에 남는 상황을 주고 어느 방식인지, 또는 포트 기반에서 옮기면 어떻게 되는지 |
| `n048` | `vlan-tagging` | 「원인과 결과」 4지선다 — 스위치 두 대에 같은 VLAN의 장치가 나뉘어 있을 때, 스위치 사이 링크 하나로 받은 프레임이 어느 VLAN 것인지 받는 스위치가 아는 방법. 오답은 헷갈리는 것(목적지 MAC 주소로 안다, 포트 번호로 안다, VLAN마다 링크를 따로 둔다 등). VTP를 묻지 않는다 — 한 문항은 개념 하나의 한 가지만 |

### 3. 도식 — `src/data/network/visuals/hub-switch-vlan.json`의 `diagrams`에 더한다

장면은 step 10의 VLAN 장면을 이어 쓴다. VLAN은 색이 아니라 **그룹 박스**와 라벨로 가른다.

#### 3-1. `hub-switch-vlan.vlan-membership` — `VlanMembershipDiagram`, JSON 키 `vlan-membership`

- 물음형 제목 예: `노트북을 다른 포트에 꽂으면 VLAN이 바뀔까?`
- 그릴 것: 스위치와 포트 몇 개, 옮겨 꽂는 장치 하나(그 장치의 MAC 주소는 guide.md 「예시 값」의 문서용 주소이고 본문에 있어야 한다), VLAN을 정하는 표(포트 → VLAN 또는 MAC 주소 → VLAN)를 칸으로.
- 시나리오:

  | id | label | 선명한 것·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `port-based` | 포트 기반 | 포트 → VLAN 표, 장치를 옮긴 포트의 VLAN 곁말 | 포트마다 VLAN을 정해 두므로, 다른 포트에 꽂으면 그 포트의 VLAN이 된다 |
  | `mac-based` | MAC 주소 기반 | MAC 주소 → VLAN 표, 옮긴 뒤에도 같은 VLAN 곁말 | 장치의 MAC 주소로 정하므로 어느 포트에 꽂아도 같은 VLAN이다 |

- 요점 테스트: 두 시나리오에서 장치가 꽂힌 포트는 같고, 그 장치가 드는 VLAN 곁말은 서로 다르다(또는 `mac-based`에서만 옮기기 전과 같다). 시나리오마다 보이는 표가 다르다.

#### 3-2. `hub-switch-vlan.vlan-tagging` — `VlanTrunkDiagram`, JSON 키 `vlan-trunk`

- 물음형 제목 예: `스위치 사이 링크 하나로 VLAN 여럿을 어떻게 나를까?`
- 그릴 것: 스위치 둘을 잇는 링크 하나(트렁크), 각 스위치에 VLAN 1·VLAN 2 장치 하나씩(그룹 박스), 그리고 태그가 끼인 프레임을 칸으로(`ethernet` 주제의 프레임 필드 이름을 그대로 — 목적지 MAC 주소, 출발지 MAC 주소, 태그, 이더타입/길이, 데이터, FCS. 칸 너비를 크기에 비례하게 그리지 않는다).
- 시나리오:

  | id | label | 경로·곁말 | 캡션이 말할 것 |
  |---|---|---|---|
  | `vlan-1` | VLAN 1 프레임 | 왼쪽 VLAN 1 장치 → 스위치 → 트렁크 → 스위치 → 오른쪽 VLAN 1 장치, 프레임의 태그 칸에 `VLAN 1` | 트렁크를 지나는 동안 태그가 어느 VLAN의 프레임인지 알려 준다 |
  | `vlan-2` | VLAN 2 프레임 | 같은 트렁크를 지나 VLAN 2 장치로, 태그 칸에 `VLAN 2` | 같은 링크로 다른 VLAN의 프레임도 오간다 |

  태그가 출발지 MAC 주소 뒤에 낀다는 것은 step 1이 확인했을 때만 그 자리에 그린다. 장치 쪽 포트에서 태그를 뗀다는 것도 본문에 있을 때만 보인다. VTP는 그리지 않는다.
- 요점 테스트: 두 시나리오가 같은 트렁크 경로를 지나고, 태그 칸의 글자가 서로 다르며, 각 경로의 끝 장치가 같은 VLAN 그룹 안에 있다. 프레임 칸이 본문의 필드 순서대로 빈틈없이 이어진다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~11)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 48개, 마지막 id는 `n048`이다. 더해:

```bash
node -e "const t=require('./src/data/network/topics.json');const c=t.flatMap(x=>x.concepts.map(y=>y.id));console.log('주제',t.map(x=>x.id).join(','),'개념',c.length)"
```

주제는 `network-basics,protocols-encapsulation,ethernet,hub-switch-vlan`, 개념은 43개(1장 23 + 이 phase 20)여야 한다.

## 검증 절차

1. guide.md 공통 AC와 위 명령을 실행하고 그 절의 확인을 모두 한다. 앞 개념·문항·도식 파일이 바뀌지 않았는지 기계로 확인한다.
2. `parentId`가 두 단·연속 규칙을 지키는가(개념 19·20이 18 바로 뒤).
3. **`hub-switch-vlan` 주제 전체(개념 9~20)를 처음부터 통독한다** — 이 주제가 완성되는 step이다. 풀이 없이 처음 나오는 낱말, 같은 것을 두 이름으로 부르는 곳, 개념끼리 되풀이하는 곳을 찾아
   이 step의 개념이면 고치고, 앞 step의 개념이면 고치지 말고 summary에 적는다.
4. VTP 문단이 step 1이 읽은 시스코 문서의 범위 안이고, 시스코 문서를 VTP 밖의 사실(VLAN·태그 일반)의 근거로 쓰지 않았는가.
5. `phases/72-network-ethernet-switch/index.json`의 step 11을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」과 3에서 찾은 것.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **VLAN을 색으로 가르지 마라.** 이유: 도식 전용 두 색은 AWS 계층의 뜻이고, 다른 색도 정답·오답·중요도가 점유했다(ADR-036). 그룹 박스와 라벨로 가른다.
- **VTP를 따로 개념이나 문항으로 만들지 마라. VTP 버전별 세부·VTP 도메인 설정 명령을 더하지 마라.** 이유: 사용자 결정은 개념 20의 한 문단이다. 기출은 모드만 물었다.
- **네이티브 VLAN, Q-in-Q, LACP 같은 기출 보기에만 나온 이름을 풀어 설명하지 마라.** 이유: 기출이 정답으로 묻지 않은 것을 끌어오지 않는다(ADR-059).
