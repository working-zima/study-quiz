# Step 11: virtual-switch-checkpoints

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 `windows-hyperv`의 개념 둘(17 가상 스위치, 18 검사점)의 글·문항·도식을 함께 만든다.** 둘 다 홀로 선 개념이다.

기출은 가상 컴퓨터의 어느 순간 상태를 저장했다가 되돌리는 Hyper-V의 기능이 검사점이라는 것을 두 번 묻는다([기출 2026-05-17 #45]·[기출 2026-08-02 #45] — 지문이 그림이라 보기와 정답만 본다,
오답 가상 스위치·새로 고침·내보내기 / 내보내기·롤백·타임머신). 가상 스위치는 그 오답이라 무엇인지를 정확히 가르친다.

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 9 `summary`(가상 스위치 세 종류, 검사점 두 종류·적용·옛 이름·내보내기, 기출 판정, E 번호, 한국어 이름)와 step 10 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 10과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 9)」 줄과 항목), `docs/source/network/exam-notes.md`(phase 81이 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`windows-hyperv`의 앞 개념 둘(step 10)**, `hub-switch-vlan`의 스위치 문장(뜻을 맞춘다), `windows-admin-tools.bitlocker`(백업·복구라는 말이 있으면)
- `src/data/network/questions.json`, `src/data/network/visuals/windows-hyperv.json`(step 10), `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `SwitchForwardDiagram`·`VlanSplitDiagram`(스위치와 범위), `EfsKeyBackupDiagram`(했을 때와 안 했을 때), `HypervisorLayersDiagram`(step 10)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2026-05-17 #45], [기출 2026-08-02 #45] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-hyperv` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 17 | `windows-hyperv.virtual-switch` | 가상 스위치 | — | **목록 개념**. 소개 문단 — 가상 스위치가 무엇인지(step 9 결과대로 — **스위치**(같은 네트워크의 장치들을 이어 데이터를 받을 장치에게만 넘겨 주는 장비 — `hub-switch-vlan`과 뜻을 맞춘 한 줄), **네트워크 어댑터**(컴퓨터를 네트워크에 잇는 장치 — 한 줄)), 만드는 자리(step 9 결과대로). 항목은 세 종류(step 9의 한국어 화면 이름과 영문 — 「글」의 항목 이름 규칙 (1)). 항목마다 그 스위치에 이은 가상 컴퓨터가 누구와 통신할 수 있는지 한 문장. 항목 뒤 문단: **내부와 개인**(4절 — 호스트와 통신하는가), 외부 스위치가 호스트의 물리 네트워크 어댑터를 쓴다는 것(step 9 결과대로). 예: `VM01`·`VM02`를 개인 스위치 `Switch01`에 이으면 둘끼리만 통신(「예시 값」) |
| 18 | `windows-hyperv.checkpoints` | 검사점 | — | 검사점의 뜻(step 9 결과대로)과 저장하는 것·되돌리기(「적용」 — step 9의 화면 이름), 두 종류와 기본값(step 9 결과대로 — 게스트 안의 백업 기술은 「운영 체제가 파일을 쓰는 중이 아닌, 데이터가 맞는 상태를 잡는 기술」 한 줄로 풀거나 근거대로), 옛 이름(step 9 결과대로 한 줄), 백업을 대신하지 않는다는 것(근거가 있을 때만). **검사점과 내보내기**(4절 — step 9 결과대로). 계산 예가 아닌 차례 예: `VM01`에 업데이트를 설치하기 전에 검사점을 만들고 → 업데이트 뒤 문제가 생기면 → 그 검사점을 적용해 업데이트 전 상태로 돌아간다(「예시 값」 — 단계대로, 적용하면 검사점 뒤의 변경이 어떻게 되는지는 step 9 결과대로) |

### 2. 문항 — `src/data/network/questions.json`에 `n303`~`n305`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n303` | `virtual-switch` | 4지선다 「상황 적용」 — 본문과 다른 장면(테스트용 가상 컴퓨터 `VM07`·`VM08`이 서로만 통신하고 호스트와도 회사 네트워크와도 통신하지 않아야 한다 등)을 주고 어떤 가상 스위치를 만들어야 하는지 고르게 한다. 정답 개인, 오답은 외부·내부와 같은 범주의 하나(세 종류뿐이면 넷째 보기는 「가상 스위치 없이 네트워크 어댑터를 빼기」 같은 것이 아니라 출처 안의 다른 선택 — 보기 넷이 출처 안에서 모이지 않으면 장면을 바꿔 정답을 내부로 하고 보기를 「누가 누구와 통신하는가」 범주로 바꾼다). **정답 위치 3** |
| `n304` | `checkpoints` | 4지선다 「상황 적용」 — 본문과 다른 장면(가상 컴퓨터 `VM07`에서 설정을 바꾸기 전에, 문제가 생기면 지금 상태로 바로 돌아갈 수 있게 해 두려 한다)을 주고 무엇을 해야 하는지 고르게 한다. 정답 검사점을 만들어 둔다, 오답은 같은 범주의 Hyper-V 기능에서 헷갈리는 것(내보내기, 저장소 이동, 복제 — 각자 무엇을 하는지 해설에, step 9의 근거 안에서). 기출 묶음(가상 스위치·새로 고침·내보내기·검사점 / 내보내기·롤백·타임머신·검사점)과 같은 넷이 되지 않게 한다 — 보기를 기능 이름이 아니라 「하는 일」 문장으로 바꿔도 된다. **정답 위치 0** |
| `n305` | `checkpoints` | 예/아니요 「개념 비교」 — **아니요** 쪽으로 세운다. 예: 프로덕션 검사점을 적용하면 가상 컴퓨터가 검사점을 만든 순간 실행 중이던 프로그램의 메모리 상태 그대로 다시 이어서 실행되나요?(아니요 — 프로덕션 검사점은 메모리 상태를 저장하지 않는다, step 9 결과대로). 해설은 두 종류의 차이와 기본값을 가르친다. n304와 다른 것을 묻는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 60·아니요 60, 정답 위치 47/46/46/46.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `virtual-switch` — `VirtualSwitchTypesDiagram`, JSON 키 `virtual-switch-types`

- 물음형 제목 예: `가상 스위치의 종류에 따라 가상 컴퓨터는 누구와 통신할까?`
- 그릴 것: 호스트 `HV01`(그룹 박스 — 안에 호스트 노드(관리 운영 체제 — 본문의 말), `VM01`·`VM02`, 가상 스위치 `Switch01` 노드), 박스 밖에 물리 네트워크 노드. 스위치에서 각 대상으로 가는 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `external` | 외부 | 가상 컴퓨터 둘·스위치·호스트·물리 네트워크와 그 경로 | 물리 네트워크까지 통신한다 |
  | `internal` | 내부 | 가상 컴퓨터 둘·스위치·호스트 | 가상 컴퓨터끼리와 호스트까지 — 물리 네트워크는 아니다 |
  | `private` | 개인 | 가상 컴퓨터 둘·스위치 | 같은 호스트의 가상 컴퓨터끼리만 통신한다 |

  (각 항목의 범위는 step 9 결과대로 — 다르면 표를 고치고 summary에 적는다.)
- 요점 테스트: 선명한 노드 수가 `external` > `internal` > `private`로 줄고, `private`에서 호스트 노드와 물리 네트워크 노드가 흐리며 그쪽으로 가는 경로가 보이지 않는다. `internal`에서 물리 네트워크 노드만 흐리다.

#### 3-2. `checkpoints` — `CheckpointApplyDiagram`, JSON 키 `checkpoint-apply`

- 물음형 제목 예: `검사점을 적용하면 가상 컴퓨터는 어느 때로 돌아갈까?`
- 그릴 것: 시간 순서의 노드 줄 — `VM01`의 상태 ①(업데이트 전) → 검사점 만들기 → ②(업데이트 뒤, 문제) → 적용 → ①로 돌아온 상태(다른 id·다른 자리의 노드). 차례는 번호 곁말.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `create` | 만들기 | 상태 ①·검사점 노드와 그 경로 | 업데이트 전에 그 순간의 상태를 검사점으로 저장한다 |
  | `apply` | 적용 | 상태 ②·검사점·돌아온 상태와 적용 경로 | 검사점을 적용하면 저장한 순간의 상태로 돌아간다(그 뒤의 변경은 본문의 말대로) |

- 요점 테스트: `apply`에서 돌아온 상태 노드가 상태 ① 노드와 다른 id·다른 자리이고, 보이는 적용 경로가 검사점 노드에서 돌아온 상태 노드로 간다. `create`에서는 돌아온 상태 노드가 흐리다.

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 305개, 마지막 id는 `n305`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 10이 푼 낱말을 다시 풀지 않았는가. 스위치의 말이 `hub-switch-vlan`과 어긋나지 않는가.
3. n303·n304의 보기 넷을 step 9의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 11을 갱신한다(guide.md 「summary에 적을 것」 / error / blocked — step 1과 같은 규칙).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 19~23을 만들지 마라.** 이유: 다른 step의 범위다.
- **가상 스위치의 VLAN·확장·SR-IOV·SET, 검사점의 파일 구조 전체를 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **step 10의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
