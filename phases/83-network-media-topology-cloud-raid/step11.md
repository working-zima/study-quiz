# Step 11: fddi-ieee802-review

## 배경

phase 83은 네트워크 과목의 `transmission-media`·`network-topology`·`cloud-sdn`·`raid-storage`를 만든다. 전체 계획·결정·공통 규칙은 `phases/83-network-media-topology-cloud-raid/guide.md`에 있다.
**이 step은 `network-topology`의 마지막 개념 둘(7 FDDI, 8 IEEE 802 표준)의 글·문항·도식을 만들고, 주제 전체(8개념)를 통독한다.** 7은 `token-ring`에 딸린 개념, 8은 부모가 없는 목록 개념이다.
쓰기를 마친 뒤 주제 전체를 통독하는 데 시간을 쓴다.

기출은 FDDI가 광섬유·토큰 패싱의 **이중** 링이라는 것(「한 개의 링」이 틀린 말 — [기출 2024-11-03 #23])과 IEEE 802 번호와 표준의 짝(802.11 무선 LAN이 맞는 짝 — [기출 2026-05-17 #22])을 묻는다.

## 읽어야 할 파일

- guide.md 「개념을 넣는 step의 공통 — 읽어야 할 파일」 전부. 그에 더해:
- `phases/83-network-media-topology-cloud-raid/index.json`의 step 7 `summary`(FDDI의 이중 링·래핑·PMD·PHY·MAC·SMT·속도, IEEE 802 작업 그룹 번호와 상태 표, E 번호)와 step 8~10 `summary`
- `src/data/network/topics.json` — **`network-topology`의 앞 개념 여섯**(특히 `ring-topology`·`token-ring`), `transmission-media.optical-fiber`(광섬유 — 한 줄로 다시), `ethernet.ethernet`(802.3 — 뜻을 맞춘다), `wireless-lan.wireless-lan`·`wpan`(802.11·802.15 — 뜻을 맞춘다)
- `docs/source/network/standards.md`의 「(phase 72 step 2) IEEE 802 LAN/MAN Standards Committee — 홈페이지」 항목
- 도식 선례: `RingPassDiagram`·`TokenPassingDiagram`(이 phase), `WpanStandardsDiagram`·`Ieee80211BandsDiagram`(번호와 기술의 짝), `RouteFailoverDiagram`과 그 테스트

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `network-topology` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `network-topology.fddi` | FDDI | `network-topology.token-ring` | FDDI의 뜻(step 7 결과대로 — 속도는 근거의 값), 이중 링(1차·2차 — 방향이 반대), 한 곳이 끊기면 양옆 노드가 두 링을 이어 고리 하나로 되돌린다(래핑 — 이름은 step 7 결과대로), PMD·PHY·MAC·SMT가 맡는 일(step 7 결과대로 — 기출이 묻는 만큼, E가 있으면 「자격시험은」 한 줄). 앞 개념 `token-ring`의 토큰과 뜻을 맞춘다. **1차 링과 2차 링**(4절), **FDDI와 토큰 링**(4절). 예: 노드 `A`~`D`의 이중 링에서 `B`와 `C` 사이 링크가 끊기면 `B`와 `C`가 두 링을 이어 고리 하나로 만든다(단계대로) |
| 8 | `network-topology.ieee-802-standards` | IEEE 802 표준 | — | **목록 개념**. 소개 문단 — IEEE 802가 무엇이고 작업 그룹마다 번호를 붙인다는 것(phase 72의 IEEE 802 홈페이지 항목과 step 7 결과대로). 항목(번호와 맡은 기술과 지금 상태 — step 7 결과대로): 802.1, 802.2(근거대로), 802.3, 802.4, 802.5, 802.11, 802.15(「- **802.3**은 …」 꼴). 항목 뒤 문단: 802.3은 이더넷, 802.11은 무선 LAN, 802.15는 WPAN의 표준이라는 것을 「어느 기술인가」로 한 줄씩(「~에서 다룬다」 같은 진행 안내 금지). **802.3과 802.5**(4절 — 매체 접근 방식, 앞 개념 `token-ring`과 뜻을 맞춘다) |

### 2. 문항 — `src/data/network/questions.json`에 `n372`~`n373`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n372` | `fddi` | 4지선다 「원인과 결과」 — 기출 묶음(한 링·PMD·PHY·SMT)을 쓰지 않는다. 예: FDDI 이중 링에서 두 노드 사이의 광섬유가 끊겼다. 그 뒤에 일어나는 일로 맞는 것은(정답 — 끊긴 곳 양옆의 노드가 1차 링과 2차 링을 이어 고리 하나로 통신을 이어 간다, step 7 결과대로 / 오답 — 링 전체가 멈춘다(링이 하나일 때의 일)·끊긴 곳 양옆 노드만 통신하지 못한다·2차 링이 없어 1차 링만으로 반쪽씩 통신한다 같은 그럴듯한 것, 출처로 틀린 것을 확인). **정답 위치 1** |
| `n373` | `ieee-802-standards` | 4지선다 「개념 확인」 — 기출 묶음(802.3 토큰 버스·802.4 토큰 링·802.11 무선 LAN·802.5 CSMA/CD의 짝 넷)을 쓰지 않는다. 짝 넷을 늘어놓는 대신 상황으로 묻는다 — 예: 토큰을 차례로 넘겨 보낼 차례를 정하는 링 모양의 LAN 표준을 찾으려면 IEEE 802의 어느 번호를 봐야 하나(정답 802.5 — 오답 802.3·802.4·802.11, step 7 결과대로) 또는 다른 기술로 같은 꼴. 정답의 이름이 문제문에 나오지 않게 한다. **정답 위치 2** |

이 step이 끝나면 예 75·아니요 75, 정답 위치 56/56/56/55다(guide.md 「문항」 9항). 문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `fddi` — `FddiDualRingDiagram`, JSON 키 `fddi-dual-ring`

- 물음형 제목 예: `FDDI는 링 한 곳이 끊겨도 어떻게 통신을 이어 갈까?`
- 그릴 것: 사각형 둘레의 노드 `A`~`D`, 노드 사이마다 링크 둘 — 1차 링(안쪽, 한 방향)과 2차 링(바깥쪽, 반대 방향) — 을 직교 경로로(원으로 그리지 않는다). 래핑 시나리오용으로 `B`·`C`에서 1차 링과 2차 링을 잇는 짧은 경로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `normal` | 1차 링 | 네 노드와 1차 링 경로 | 평소에는 1차 링으로 데이터가 돈다(본문대로) |
  | `wrap` | 끊긴 뒤 | 네 노드와 `B`–`C` 사이를 뺀 1차·2차 링 경로, `B`·`C`의 잇는 경로 | `B`와 `C`가 두 링을 이어 고리 하나로 되돌린다 |

- 요점 테스트: `wrap`에서 `B`와 `C` 사이를 잇는 보이는 경로가 없고, 보이는 경로를 따라가면 `A`·`B`·`C`·`D`를 모두 지나 처음 노드로 돌아온다(고리 하나). `normal`에서 2차 링 경로가 보이지 않는다.

#### 3-2. `ieee-802-standards` — `Ieee802GroupsDiagram`, JSON 키 `ieee802-groups`

- 물음형 제목 예: `IEEE 802의 번호마다 어떤 기술이 있을까?`
- 그릴 것: 위에 「IEEE 802」 노드, 아래에 작업 그룹 노드(본문 항목과 같은 번호 — 「802.3 이더넷」처럼 번호와 기술을 한 라벨에, 폭이 모자라면 노드를 한 줄 전체 폭으로), 「IEEE 802」에서 각 노드로 가는 경로. 280 폭에서는 세로로 쌓는다. 활동 중인 것과 해산한 것을 그룹 박스 둘로 나눈다(step 7 결과대로 — 상태 근거가 없으면 그룹을 나누지 않고 정지 그림으로).
- 시나리오(상태 근거가 있을 때):

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `active` | 활동 중 | 활동 중인 작업 그룹 노드 | 지금도 표준을 고치고 더한다(본문대로) |
  | `disbanded` | 해산 | 해산·쉼인 작업 그룹 노드 | 작업 그룹이 해산해 더 고치지 않는다(본문대로) |

- 요점 테스트: 노드 라벨의 번호 집합이 본문 항목의 번호 집합과 같다. `active`와 `disbanded`의 선명한 작업 그룹 노드 집합이 겹치지 않고 합치면 전부다.

위 도식 설계는 출발점이다. 본문(step 7 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

### 4. 주제 `network-topology` 통독

쓰기를 마친 뒤 **주제 `network-topology`의 여덟 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말 — 특히 이더넷·허브·CSMA/CD를 모르는 학습자에게, 개념 사이의 어긋남, 되풀이, 같은 사실을 여러 곳이 다르게 말하는 곳 — 예: 「성형」과 「스타형」, 점 대 점의 말, 링의 끊김을 말한 두 자리, 토큰을 푼 두 자리)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다. 도식 여덟 개의 문구도 함께 읽는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 373개, 마지막 id는 `n373`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념을 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. IEEE 802의 항목이 혼자 서지 않고 소개 문단에 이어지는가.
3. n372·n373의 보기 넷을 step 7의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. 주제 `network-topology`의 여덟 개념을 통독한다(「작업」 4). 도식 여덟 개의 문구도 함께 읽는다.
5. guide.md 「검증 절차의 끝」대로 `phases/83-network-media-topology-cloud-raid/index.json`의 step 11을 갱신한다(「앞 개념에 고칠 것」에 통독 결과).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`cloud-sdn`·`raid-storage`의 개념을 만들지 마라.** 이유: step 13~20의 범위다.
- **FDDI의 프레임 형식·타이머, 802.6(DQDB)의 동작을 쓰지 마라.** 이유: 기출이 묻지 않는다(guide.md 「배경」).
- **step 8~10의 개념·문항·도식과 `transmission-media`를 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
