# Step 13: cloud-deployment

## 배경

phase 83은 네트워크 과목의 `transmission-media`·`network-topology`·`cloud-sdn`·`raid-storage`를 만든다. 전체 계획·결정·공통 규칙은 `phases/83-network-media-topology-cloud-raid/guide.md`에 있다.
**이 step은 주제 `cloud-sdn`을 만들고 그 첫 개념 둘(1 클라우드 컴퓨팅, 2 클라우드 배포 모델)의 글·문항·도식을 함께 만든다.** 2는 1에 딸린 개념이다.
이 주제는 주제 지도 30번이라 `network-security` 바로 뒤에 들어간다 — 학습자는 IP·스위치·라우터·로드 밸런서·방화벽까지 보았고, **가상화·가상 컴퓨터는 아직 모른다**고 보고 쓴다(guide.md 「배경」).

기출은 클라우드의 특징에서 「단일 임차인 모델의 자원 풀」이 틀린 말임을 묻고([기출 2024-11-03 #26]·[기출 2026-02-01 #24]), 배포 모델에서 on-premises가 배포 모델이 아님([기출 2025-08-24 #27]·[기출 2026-08-02 #22])과 「사설 클라우드는 회사 안팎의 모든 이용자가 함께 쓴다」가 틀린 말임([기출 2025-02-23 #25]·[기출 2025-05-25 #25])을 묻는다.

## 읽어야 할 파일

- guide.md 「개념을 넣는 step의 공통 — 읽어야 할 파일」 전부. 그에 더해:
- `phases/83-network-media-topology-cloud-raid/index.json`의 step 12 `summary`(다섯 특징·멀티테넌트·서비스 모델, 배포 모델 넷·온프레미스, 기출 판정, E 번호, 한국어 이름)
- `src/data/network/topics.json` — `windows-hyperv.hyper-v`(가상화 — 한 줄로 다시 풀고 뜻을 맞춘다), `network-devices.load-balancing`(서버를 늘리는 장면 — 뜻을 맞춘다), `network-basics.client-server`
- 도식 선례: `LoadBalancerPoolDiagram`(서버 묶음), `VpnSiteTypesDiagram`·`WirelessLanModesDiagram`(구성 갈래), `VirtualSwitchTypesDiagram`(누가 무엇에 닿는가)과 그 테스트

## 작업

### 1. 개념 — `src/data/network/topics.json`

`network-security` 주제 객체 바로 뒤(= `diagnostic-commands` 주제 객체 앞)에 주제 객체를 끼운다 — `{ "id": "cloud-sdn", "title": "클라우드·SDN·NFV", "importance": 3, "sourcePages": [0, 0], "concepts": [ … ] }`.
`importance`가 3(★★★, 출제 9/11회)인지 `data.test.ts`의 주제 지도 표와 견준다. 끼운 자리의 `  }` / `,` / `  {` 줄 꼴이 기존과 같은지 본다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 1 | `cloud-sdn.cloud-computing` | 클라우드 컴퓨팅 | — | 이 주제의 첫 개념이라 가상화(한 줄 — `windows-hyperv.hyper-v`와 뜻을 맞춘다)를 푼다. **목록 개념**. 소개 문단 — 클라우드 컴퓨팅의 뜻(step 12 결과대로). 항목 다섯(다섯 핵심 특징 — 이름은 step 12 결과대로, 「- **자원 풀링**(resource pooling)은 …」 꼴, 멀티테넌트는 자원 풀링 항목에서). 항목 뒤 문단: 서비스 모델 셋(IaaS·PaaS·SaaS — 사용자가 어디까지 맡는가 한 줄씩, step 12 결과대로), 사용자가 자원의 정확한 위치를 모를 수 있다(근거대로). 시험의 맞는 말 셋과 「단일 임차인」의 처리는 step 12 결과대로. **멀티테넌트와 단일 테넌트**(4절), **자원 풀링과 빠른 탄력성**(4절). 예: 회사 `example.com`이 웹 서버 `WEB01`을 클라우드에서 빌려 쓰다가 손님이 몰리는 날에 서버를 셋으로 늘린다(「예시 값」) |
| 2 | `cloud-sdn.cloud-deployment-models` | 클라우드 배포 모델 | `cloud-sdn.cloud-computing` | **목록 개념**. 소개 문단 — 클라우드 인프라를 누가 쓰도록 여는가로 가른다(step 12 결과대로). 항목 넷(사설·커뮤니티·공용·하이브리드 — 누가 쓰는가·누가 운영하는가·어디에 두는가를 step 12의 말대로). 항목 뒤 문단: 온프레미스의 처리(step 12 결과대로), 시험의 맞는 말 셋의 처리(step 12 결과대로 — 업체 이름은 쓰지 않는다). **사설 클라우드와 공용 클라우드**(4절 — 누가 쓰는가), **하이브리드 클라우드와 커뮤니티 클라우드**(4절). 예: `example.com`이 고객 정보는 사설 클라우드에, 손님이 몰릴 때 늘리는 웹 서버는 공용 클라우드에 두고 둘을 잇는다 |

### 2. 문항 — `src/data/network/questions.json`에 `n374`~`n376`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n374` | `cloud-computing` | 예/아니요 「개념 확인」 — **예** 쪽으로 세운다. 「클라우드 자원은 고객마다 따로 떼어 둔다」는 오해를 겨냥한다 — 예: 클라우드 제공자는 서버·저장 장치 같은 자원을 하나의 묶음으로 두고, 그 묶음을 여러 고객이 나눠 쓰게 하나요?(예 — 자원 풀링·멀티테넌트, step 12 결과대로). 해설은 고객마다 자원을 그때그때 나눠 주고 돌려받는 것과 고객의 데이터가 서로 섞이지 않게 나뉜다는 것(근거대로)을 가르친다. 기출 묶음(클라우드의 특징 넷)을 쓰지 않는다 |
| `n375` | `cloud-deployment-models` | 4지선다 「상황 적용」 — 기출 묶음(public·on-premises·hybrid·private / 위치·공용·사설·하이브리드 설명 넷)을 쓰지 않는다. 예: 같은 규정을 따라야 하는 병원 몇 곳이 함께 쓰려고 만든 클라우드는 어느 배포 모델인가(정답 커뮤니티 — 오답 사설·공용·하이브리드, step 12 결과대로). 정답이 하나뿐인지 — 「병원 몇 곳」이 한 조직이 아니고 누구나도 아니라는 조건이 문제문에 있어야 한다. **정답 위치 3** |
| `n376` | `cloud-deployment-models` | 예/아니요 「개념 비교」 — **아니요** 쪽으로 세운다. 예: 회사 `shop.example.com`이 자기 직원만 쓰는 사설 클라우드를 만들었다. 사설 클라우드라면 그 회사 건물 안의 서버로만 운영해야 하고, 다른 업체의 데이터 센터에 두면 사설 클라우드가 아닌가요? — 이중 부정·「~만」이 되지 않게 고쳐 쓴다(예: 「사설 클라우드는 그 조직의 건물 안에 둔 서버로만 만들 수 있나요?」는 「~만」 금지에 걸린다 → 「사설 클라우드를 다른 업체의 데이터 센터에 두면 사설 클라우드라 부를 수 없나요?」처럼). 정답 아니요 — 사설은 누가 쓰는가의 말이고 자리(온프레미스·외부)는 따로다(step 12 결과대로). n375와 다른 것을 묻는다 |

이 step이 끝나면 예 76·아니요 76, 정답 위치 56/56/56/56이다(guide.md 「문항」 9항). 문항 글에 백틱을 쓰지 않는다.

### 3. 도식

이 step이 `src/data/network/visuals/cloud-sdn.json`을 만들고 `src/data/network/index.ts`에 import(`cloudSdnVisuals` — 경로 알파벳순, `arp.json` 뒤)와 `visualsByTopicId`의 `'cloud-sdn': cloudSdnVisuals`(`'network-security'` 바로 뒤)를 넣는다.

#### 3-1. `cloud-computing` — `CloudTraitsDiagram`, JSON 키 `cloud-traits`

- 물음형 제목 예: `클라우드는 여러 고객에게 자원을 어떻게 내줄까?`
- 그릴 것: 왼쪽(세로형은 위)에 고객 노드 셋(「고객 A」·「고객 B」·`example.com`), 가운데 「네트워크」, 오른쪽(아래)에 「자원 풀」 그룹 박스 안의 서버·저장 장치·네트워크 노드와 `WEB01`, 빠른 탄력성 시나리오용으로 늘어난 서버 노드 둘(다른 자리). 구름 그림을 그리지 않는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `pooling` | 자원 풀링 | 고객 셋·네트워크·자원 풀의 노드 | 여러 고객이 같은 자원 묶음을 나눠 쓴다 |
  | `elasticity` | 빠른 탄력성 | `example.com`·네트워크·`WEB01`과 늘어난 서버 둘 | 손님이 몰리면 서버를 셋으로 늘리고, 줄면 다시 줄인다 |
  | `measured` | 측정되는 서비스 | `example.com`과 쓰는 자원 | 쓴 만큼 재어 요금을 매긴다 |

- 요점 테스트: `pooling`에서 고객 셋에서 나온 보이는 경로가 모두 같은 「자원 풀」 그룹 박스 안의 노드에 닿는다. 늘어난 서버 둘은 `elasticity`에서만 선명하다.

#### 3-2. `cloud-deployment-models` — `DeploymentModelUsersDiagram`, JSON 키 `deployment-model-users`

- 물음형 제목 예: `배포 모델마다 누가 그 클라우드를 쓸까?`
- 그릴 것: 클라우드 인프라 노드 넷(「사설 클라우드」·「커뮤니티 클라우드」·「공용 클라우드」 — 하이브리드는 사설과 공용을 잇는 경로로), 쓰는 쪽 노드(「한 조직」·「뜻을 같이하는 조직들」·「누구나」). 280 폭에서는 세로로 쌓는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `private` | 사설 | 사설 클라우드·한 조직 | 한 조직만 쓴다 — 안에 두든 밖에 두든(본문대로) |
  | `community` | 커뮤니티 | 커뮤니티 클라우드·뜻을 같이하는 조직들 | 같은 관심사의 조직들이 함께 쓴다 |
  | `public` | 공용 | 공용 클라우드·누구나 | 누구나 쓸 수 있게 연다 |
  | `hybrid` | 하이브리드 | 사설·공용 클라우드와 둘을 잇는 경로 | 둘 이상을 묶어 데이터와 응용 프로그램을 옮긴다 |

- 요점 테스트: 네 시나리오의 선명한 노드 집합이 서로 다르다. `hybrid`에서만 사설 클라우드와 공용 클라우드를 잇는 경로가 보인다.

위 도식 설계는 출발점이다. 본문(step 12 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 376개, 마지막 id는 `n376`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 새 주제가 `topics.json`에서 `network-security` 바로 뒤·`diagnostic-commands` 바로 앞에 있고, `importance` 3·`sourcePages` [0, 0]인지, 데이터 테스트를 통과하는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 가상화를 모르는 학습자가 막히지 않는가. 업체 이름이 없는가.
4. n375의 보기 넷을 step 12의 근거로 하나씩 따져 정답이 하나뿐인지 본다. n376이 「~만」·이중 부정 없이 읽히는지 본다.
5. guide.md 「검증 절차의 끝」대로 `phases/83-network-media-topology-cloud-raid/index.json`의 step 13을 갱신한다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 3~7을 만들지 마라.** 이유: step 14~16의 범위다. 서버리스·SDN·NFV는 이 step에서 이름도 쓰지 않아도 된다.
- **클라우드 업체·상품 이름(기출에 나온 업체 포함)을 쓰지 마라.** 이유: 허용 출처 밖의 사실이고 기출의 값이다(guide.md 「예시 값」).
