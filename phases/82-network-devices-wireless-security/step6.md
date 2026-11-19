# Step 6: mesh-handoff

## 배경

phase 82는 네트워크 과목의 `wireless-lan`·`network-devices`·`network-security`를 만든다. 전체 계획·결정·공통 규칙은 `phases/82-network-devices-wireless-security/guide.md`에 있다.
**이 step은 `wireless-lan`의 개념 둘(9 무선 메시 네트워크, 10 핸드오프)의 글·문항·도식을 함께 만든다.** 둘 다 머리 개념이다.

기출은 무선 메시 네트워크가 중앙 제어 없이 노드끼리 여러 홉으로 전달하고 끊긴 길을 비켜 간다는 것을 네 번 묻고([기출 2024-11-03 #27]·[기출 2025-08-24 #19] — 「중앙 제어 없이는 구성할 수 없다」가 틀린 말, [기출 2025-02-23 #26]·[기출 2026-05-17 #24] — 지문, 오답 WSN·SDN·CDN),
움직이는 단말의 연결을 다른 기지국으로 넘기는 것이 핸드오프라는 것([기출 2024-08-25 #23] — 오답 채널 체인징·페이징·핸드셰이크)을 묻는다.

## 읽어야 할 파일

- **`phases/82-network-devices-wireless-security/guide.md` 전체** — **이 문서를 따른다**
- `phases/82-network-devices-wireless-security/index.json`의 step 4 `summary`(802.11s 메시의 동작, 기지국·셀·핸드오프·페이징의 정의와 출처, 무선 LAN의 재연결, 기출 판정, E 번호)와 step 1~5 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 1과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 82 step 0·4)」 항목), `docs/source/network/exam-notes.md`(phase 82가 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`wireless-lan`의 앞 개념 여덟(step 1~5)**, 특히 `wireless-lan`(인프라스트럭처 모드·AP)·`zigbee`(메시 한 줄)
- `src/data/network/questions.json`, `src/data/network/visuals/wireless-lan.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `RouteFailoverDiagram`·`SpanningTreeDiagram`(끊긴 길과 다른 길), `LiveMigrationDiagram`(옮겨 가기 전과 뒤), `WirelessLanModesDiagram`(이 phase)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-11-03 #27], [기출 2025-08-24 #19], [기출 2025-02-23 #26], [기출 2026-05-17 #24], [기출 2024-08-25 #23] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `wireless-lan` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `wireless-lan.wireless-mesh` | 무선 메시 네트워크 | — | 메시 네트워크의 뜻(그물 모양 — 노드가 여러 이웃과 이어진다), 802.11s(step 4 결과대로), 멀티홉, 노드가 스스로 이웃을 찾고 경로를 정한다는 것(중앙 장치 없이 — step 4 결과대로, 경로 선택 방법의 이름은 한 줄), 링크가 끊기면 다른 경로로 보낸다는 것과 노드가 들고 나며 구성이 바뀐다는 것(step 4 결과대로 — 근거가 없으면 쓰지 않고 「자격시험은」 줄은 E가 있을 때만). 앞 개념 `zigbee`의 메시 한 줄과 뜻을 맞춘다. **메시 네트워크와 인프라스트럭처 모드**(4절). 예: `MESH01`~`MESH04`에서 `MESH01`의 프레임이 `MESH02`를 거쳐 `MESH04`로 가다가, `MESH02`가 꺼지면 `MESH03`을 거쳐 간다(「예시 값」 — 단계대로) |
| 10 | `wireless-lan.handoff` | 핸드오프 | — | 이동통신의 기지국과 셀(한 줄씩 — step 4 결과대로), 핸드오프(핸드오버라고도 부른다 — step 4 결과대로)의 뜻과 까닭, 무선 LAN에서 다른 AP로 옮겨 붙는 것 한 줄(step 4 결과대로). 페이징은 step 4가 근거를 찾았을 때만 — 찾지 못했으면 4절 짝을 「핸드오프와 무선 LAN의 재연결」로 바꾸고 summary에 적는다. **핸드오프와 페이징**(4절 — step 4 결과대로). 예: 버스에 탄 휴대폰이 `BS01`의 셀을 벗어나 `BS02`의 셀로 들어가는 동안 통화가 끊기지 않게 연결이 `BS02`로 넘어간다(「예시 값」 — 단계대로) |

### 2. 문항 — `src/data/network/questions.json`에 `n323`~`n325`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n323` | `wireless-mesh` | 예/아니요 「원리 이해」 — **아니요** 쪽으로 세운다. 예: 건물 여러 동을 무선 메시 노드로 이으려 한다. 이 메시 네트워크가 동작하려면 모든 노드의 경로를 정해 주는 중앙 제어 장치가 있어야 하나요?(아니요 — 노드가 스스로 이웃을 찾고 경로를 정한다, step 4 결과대로). 해설은 멀티홉과 경로 선택을 가르친다. 기출의 특징 넷 묶음을 쓰지 않는다 |
| `n324` | `wireless-mesh` | 4지선다 「원인과 결과」 — 본문과 다른 장면(메시 노드 다섯 가운데 하나가 전원이 꺼진다 등)을 주고, 그 노드를 거치던 프레임이 어떻게 되는지 고르게 한다. 정답은 다른 노드를 거치는 경로로 전달된다는 것(step 4 결과대로), 오답은 흔한 혼동(그 노드가 다시 켜질 때까지 모든 통신이 멈춘다, AP가 새 경로를 정해 줄 때까지 기다린다, 꺼진 노드에 이어 있던 노드도 모두 연결이 끊긴다 등 — 장면에서 정말 틀렸는지 따진다). **정답 위치 2**. n323과 다른 것을 묻는다. 기출 묶음(WSN·SDN·CDN·메시)을 쓰지 않는다 |
| `n325` | `handoff` | 4지선다 「개념 비교」 — 이동하는 단말에 일어나는 일 하나를 주고(예: 통화 중인 휴대폰이 다른 기지국의 셀로 들어간다) 무엇이라 부르는지, 또는 핸드오프가 일어날 때 무엇이 바뀌는지를 고르게 한다. 오답은 같은 범주에서 step 4가 근거를 찾은 것만(페이징·무선 LAN의 재연결·채널 등). **정답 위치 3**. 기출 묶음(채널 체인징·페이징·핸드셰이크·핸드오프)을 쓰지 않는다 — 핸드셰이크·채널 체인징은 보기로 쓰지 않는다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 64·아니요 65, 정답 위치 49/49/49/49.
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `wireless-mesh` — `MeshRerouteDiagram`, JSON 키 `mesh-reroute`

- 물음형 제목 예: `메시 노드 하나가 꺼지면 프레임은 어디로 갈까?`
- 그릴 것: `MESH01`~`MESH04`를 마름모꼴(왼쪽 `MESH01`, 위 `MESH02`, 아래 `MESH03`, 오른쪽 `MESH04`)로 두고 이웃끼리 잇는 링크 경로. 세로형 280 폭에서는 위아래로 펼친다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `normal` | 평소 | 네 노드와 `MESH01`→`MESH02`→`MESH04` 경로 | 노드 여럿을 거쳐 목적지까지 전달한다 |
  | `reroute` | 노드가 꺼졌을 때 | `MESH01`·`MESH03`·`MESH04`와 `MESH01`→`MESH03`→`MESH04` 경로 | `MESH02`가 꺼지자 다른 이웃을 거치는 경로로 보낸다(본문의 말대로) |

- 요점 테스트: `reroute`에서 `MESH02`는 흐리고 보이는 경로 어느 것도 `MESH02`에 닿지 않는다. 두 시나리오의 경로가 같은 출발 노드(`MESH01`)와 같은 도착 노드(`MESH04`)를 갖는다.

#### 3-2. `handoff` — `CellHandoffDiagram`, JSON 키 `cell-handoff`

- 물음형 제목 예: `움직이는 휴대폰의 연결은 어느 기지국이 이어 받을까?`
- 그릴 것: `BS01`의 셀(그룹 박스)과 `BS02`의 셀(그룹 박스), 휴대폰 노드 둘(옮겨 가기 전 자리와 뒤 자리 — 서로 다른 id·다른 자리), 휴대폰과 기지국을 잇는 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `before` | 옮기기 전 | 앞 자리의 휴대폰·`BS01`과 그 경로 | `BS01`의 셀 안에서 `BS01`과 통신한다 |
  | `after` | 옮긴 뒤 | 뒤 자리의 휴대폰·`BS02`와 그 경로 | 셀을 옮겨 가자 연결이 `BS02`로 넘어가 끊기지 않는다 |

- 요점 테스트: `before`와 `after`의 선명한 휴대폰 노드가 다른 id이고 서로 다른 셀 박스 안에 있다. 보이는 경로의 기지국 쪽 끝이 `before`는 `BS01`, `after`는 `BS02`다.

위 도식 설계는 출발점이다. 본문(step 4 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 325개, 마지막 id는 `n325`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 메시의 동작이 step 4가 근거를 찾은 것만인가.
3. n324·n325의 보기 넷을 step 4의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. `phases/82-network-devices-wireless-security/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 11(인지 무선)을 만들지 마라.** 이유: step 7의 범위다.
- **셀룰러(LTE·5G)의 절차·하드·소프트 핸드오프의 세부, 802.11s의 보안·프레임 형식을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
- **메시 토폴로지 일반(유선 메시·완전 메시)을 쓰지 마라.** 이유: 주제 지도의 `network-topology`(phase 83)의 범위다. 이 개념은 무선 메시를 쓴다.
- **step 1~5의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 고칠 것을 찾으면 summary에 적는다.
