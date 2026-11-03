# phase 106 검증 보고

확인한 날: 2026-11-03(Mac). 브랜치 `feat-106-azure-cost`(origin/develop `c47ab8f`에서 분기), 설계 커밋 `63a9dcf`, phase 완료 커밋 `e65a601`, 마무리 수정은 이 보고와 함께 커밋한다.
사용자가 「새 세션에서 azure 106 이어서 하자」고 해서 이어받았다. 저장소 밖 `aws-quiz-p103-sup/`의 supervisor로 세 덩어리(step 0~2 / 3~5 / 6~8)를 돌리고 `chain-p106.sh`가 덩어리를 차례로 이었다. codex가 기본이고, 사용량 한도면 같은 step을 다른 쪽이 처음부터 다시 실행한다.

## step별 결과

| step | 맡은 쪽 | 끝난 때 | 결과 | 테스트 |
|---|---|---|---|---|
| 0 cost-factors-sources | codex 한도 → Claude | 11-02 19:23 | `official.md` 새 항목 16·덧붙임 6곳, `corrections.md` D88~D98·G56~G58 | 6052 |
| 1 factors-data-transfer | Claude | 19:38 | 개념 1·2, az131~az134, `CostFactorsDiagram`·`DataTransferCostsDiagram` — 주제 `azure-cost-factors` 만듦 | 6094 |
| 2 vm-stop-unused | Claude 한도 → codex | 21:47 | 개념 3·4, az135~az138, `VmStopBillingDiagram`·`LeftoverResourcesDiagram` | 6131 |
| 3 savings-calculator | codex·Claude 한도 → Claude | 23:45 | 개념 5·6·7, az139~az142, `HybridBenefitDiagram`·`PricingCalculatorDiagram`·`CostSavingOptionsTable` — `azure-cost-factors` 완성 | 6177 |
| 4 cost-management-sources | Claude·codex·Claude 한도 → Claude | 11-03 04:42 | `official.md` 새 항목 14·덧붙임 3곳, `corrections.md` D99~D105·G59 | 6177 |
| 5 cost-management-analysis | Claude | 04:52 | 개념 8·9, az143·az144, `CostAnalysisDiagram` — 주제 `azure-cost-management` 만듦 | 6198 |
| 6 budgets-alerts | codex 한도 → Claude | 05:02 | 개념 10·11, az145~az147, `BudgetAlertDiagram` | 6218 |
| 7 tags | Claude·codex 한도 → Claude | 09:43 | 개념 12·13, az148·az149, `TagCostReportDiagram`·`TagInheritanceDiagram` | 6258 |
| 8 free-account-limit | Claude | 09:57 | 개념 14·15, az150~az152, `FreeAccountOffersDiagram`·`SpendingLimitDiagram`·`CostToolsTable` — `azure-cost-management` 완성 | 6310 |

결과: 주제 2개(`azure-cost-factors` ★★★·`azure-cost-management` ★★☆ — 주제 지도와 같다), 개념 15개(7·8), 문항 22개(az131~az152), 도식 12개, 표 둘, 새 테스트 258개.
과목 전체는 주제 16개·개념 107개·문항 152개다. 실행 전체는 11-02 19:07 ~ 11-03 09:58(약 14시간 50분)이고, 그중 약 11시간 15분은 사용량 한도라 기다린 시간이다. 사용량 한도가 아닌 실패로 멈춘 step은 없다.

## 실행 중에 일어난 일

- **사용량 한도로 열 번 끊겼고 그때마다 그 step을 처음부터 다시 실행했다.** 끊긴 시도는 step 0(codex)·2(Claude)·3(codex·Claude)·4(Claude·codex·Claude)·6(codex)·7(Claude·codex)이다. 부분 변경은 커밋되지 않고 stash로 남았다.
- step 2만 codex가 끝냈고 나머지 여덟 step은 Claude가 끝냈다.
- 덩어리를 잇는 조건 셋(앞 덩어리 `range_done`, 「사용자 확인」 없음, 워킹 트리 깨끗함)은 모두 통과했다.

## 설계와 달라진 것

모두 step summary에 이유가 있고, 받아들였다.

- **표기** — 「할당 해제」→「할당 취소」(Microsoft 한국어 문서 46 대 2), 상태 이름은 「중지됨」·「중지됨(할당 취소됨)」. 「이상 징후 경고」→「변칙 경고」(한국어 문서에 없는 말이다). 저축 플랜은 Learn 한국어판의 「절감 계획」 대신 제품 문서 제목의 「Azure 저축 플랜」으로 썼다.
- **태그 예** — 「부서=영업」을 `Department=Sales`로(G59). 공식 문서가 영어가 아닌 태그의 VM 메타데이터 문제를 경고한다. 보고서 라벨 「영업부 비용」은 이름표라 그대로다.
- **`FreeAccountOffersDiagram`** — 시나리오를 넷으로 다시 짰다. 30일이 지나면 크레딧만이 아니라 구독과 서비스가 함께 멈추고, 업그레이드한 계정은 12개월이 지나도 쓰던 서비스가 멈추지 않고 요금이 붙기 때문이다. 설계의 「항상 무료 서비스만 남는다」는 빠졌다.
- **리소스 그룹 자체의 요금** — 근거를 찾지 못해(D92) 「별도 요금이 없는 것」에서 뺐다. az137·az138도 그에 맞춰 바뀌었다.
- **쓰지 않은 사실** — 원격 연결 끊기·절전 모드의 요금, 태그를 왜 물려받지 않게 설계했는지의 까닭은 문서에 없어 쓰지 않았다. Red Hat·SUSE 구독과, 스폿·하이브리드 혜택에 크레딧을 못 쓴다는 사실은 근거는 있으나 개념을 흐려 쓰지 않았다.

## 사용자가 볼 것

9개 step 모두 「사용자 확인」은 「없음」이다.

- **메인 세션이 정해 진행한 것**(설계 때) — 덤프 44문항을 28·16으로 배정해 별점 그대로(`topic-map.md`). **TCO 계산기는 지원이 끝나** 개념·문항 없이 `pricing-calculator` 본문 한 줄로 뒀다. Learn에 있는 저축 플랜을 개념으로 더했다. 금액·할인율·제품 개수·%는 쓰지 않고, 요금이 붙는지 여부와 기간(1·3년, 30일·12개월)은 쓴다.
- **덤프 답이 공식 문서와 달라 고쳐 쓴 것**(`corrections.md` D88~D105) — 지역을 비용 요인에서 뺀 답(D88), TCO 계산기(D89), 「항상 무료」 전송(D90), VPN 전송 방향(D91), 리소스 그룹 요금(D92), 원격 세션 안에서 끄기(D93), 예약의 용량 확보(D94), Marketplace 값(D95), 사용자 계정 요금(D96), 전송 무료 양(D97), 할당 취소 뒤 남는 것(D98), Cost Management에 Enterprise Agreement가 필요하다는 답(D99), 관리 그룹 범위(D100), 비용 추적 도구(D101), 무료 계정 상한(D102), 지출 한도(D103), 평가판 뒤 VM(D104), 비용 메일 도구(D105). 덤프끼리 답이 갈린 것은 D91·D93·D100·D105다.
- **용어집이 공식 문서와 달라 고쳐 쓴 것**(G56~G59) — TCO 계산기(G56), 예약의 중도 해지(G57), 가격 계산기의 「연간」·「견적서」(G58), 태그의 「키=값」과 한국어 태그 예(G59).

## 메인 세션이 마무리에서 고친 것

새 문항 22개와 개념 15개를 메인 세션이 직접 읽고 고쳤다. 정답 방향·균형은 그대로다.

- **앞 phase의 「지출 한도」 네 곳**(step 4·8이 넘긴 판단) — `azure-resource-hierarchy.subscription-boundaries`의 항목 문장과 예시 문장, `management-group`의 첫 문장, `visuals/azure-resource-hierarchy.json`의 캡션 하나에서 지출 한도를 뺐다. 「구독마다 상한을 정해 둔다」는 뜻으로 읽히는데, Azure 지출 한도는 크레딧이 든 구독에만 있고 금액을 바꿀 수 없으며 종량제에 없어, 이번 phase의 `spending-limit` 개념과 어긋난다. Learn은 이 말을 일반 낱말로 썼다. 예산으로 바꾸지 않은 것은 예산이 상한이 아니고, 이 개념의 요지가 액세스 규칙이기 때문이다. 문항에는 없었다. `official.md` 대조 절에 처리를 적었다. 이미 공개된 phase 102의 문장을 고친 것이다.
- **az150** — 다시 썼다. 「두 달이 지났을 때 끝난 것」을 묻는 전 문항은 이름만으로 「항상 무료」·「둘 다」·「12개월」이 빠져 크레딧 하나만 남았다(ADR-030 기준 4). 「업그레이드하지 않고 30일이 지나면 어떻게 되나」로 바꿔, 실제로 헷갈리는 답(무료 서비스는 남는다, 종량제로 저절로 바뀐다)을 오답으로 두었다. 「다른 설정은 바꾸지 않은 채」는 지출 한도를 없앤 평가판이 종량제로 바뀌는 예외를 막는다. 정답 위치 3은 그대로다.
- **az138** — 「별도로 확인하지 않아도 모두 삭제되었다고 판단해도 되나요?」가 답(아니요)을 흘려 「디스크도 함께 삭제되었다고 볼 수 있나요?」로.
- **az133** — 「이 나가는 전송의 가격은 지역을 지리적으로 묶은 단위인 청구 영역에」의 끼워 넣은 라벨을 「이렇게 Azure 밖으로 나가는 전송의 가격은 청구 영역(가격을 매기려고 지역을 지리적으로 묶은 것)에」로.
- **`BudgetAlertDiagram` 자동화 장면 캡션** — 비용 경고와 이메일이 흐려 경고가 안 가는 것처럼 읽혔다(step 6이 넘긴 곳). 캡션에 「비용 경고와 이메일도 그대로 가며, 이 장면은 자동화 갈래만 밝혔다」를 더했다.
- **`SpendingLimitDiagram` 업그레이드 장면 캡션** — 스토리지 계정만 흐려 그대로 멈춘 것처럼 읽혀 「이 장면은 VM 1을 예로 그렸다」를 더했다.

## 남겨 둔 것

- `FreeAccountOffersDiagram`의 「업그레이드하지 않으면」은 선명한 노드가 없다(step 8이 넘긴 곳). 캡처를 보니 곁말 「구독과 서비스가 멈춘다」와 캡션으로 읽혀 UI_GUIDE의 무너진 영역 꼴대로 두었다.
- `git stash`에 이 phase의 한도 중단 초안 10개가 남아 있다(`p34-usage-limit … step0·2·3·3·4·4·4·6·7·7`). 쓰이지 않는 것이고, 지우는 것은 사용자 판단으로 둔다.

## 다시 돌린 검증 (마무리 수정 뒤)

실행 부하가 없을 때 마무리 수정한 내용으로 다시 돌렸다. supervisor도 step마다 같은 검증을 돌려 모두 통과했다.

- `npm run build` 통과, `npm run lint` 경고 0, `npm test` 284파일·6310개 통과(phase 시작 270파일·6052개).
- `check-structure` 「구조 이상 없음」.
- 교차 검사 「✓ 교차 없음 — 세로 노드 1253개·경로 854개, 가로 노드 1253개·경로 854개」(phase 시작 1203/825에서 +50/+29).
- `check-verbatim --subject azure` 「전사 이상 없음 — azure: 원본 626개, 단위 1037개」(phase 시작 원본 560개·단위 886개).
- 문항 152개(az001~az152), 예 38·아니요 38, 정답 위치 19/19/19/19.
- AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `c47ab8f`와 diff 없음.

## 화면 확인 (headless Chrome + CDP, 개발 서버 `127.0.0.1:5300`)

phase 105의 측정기를 주제만 바꿔 썼다(저장소 밖 `p106-run/measure-p106.cjs`). 폭 305·320·390(배율 2, 모바일)과 1180(배율 1). 이 측정은 캡션 두 개를 고치기 전에 했다. 고친 것은 SVG 밖의 HTML 문단이라 줄만 늘어나므로 다시 재지 않았다.

- **넘침** — 네 폭에서 두 주제 모두 페이지 가로 넘침 0. 모든 시나리오 버튼을 누른 뒤에도 0.
- **도식 12개의 모든 시나리오**(폭마다 43개 상태 — `azure-cost-factors` 22, `azure-cost-management` 21)를 하나씩 눌러 보이는 SVG 글자를 화면 픽셀로 쟀다. SVG 밖으로 나간 글자, 노드 라벨이 자기 상자보다 넓은 곳, 글자끼리 겹친 곳, 곁말이 노드 상자에 겹친 곳, 그룹 박스 테두리에 걸친 곳 모두 0.
- **표 둘** — 폭 273·288·358·621~638에서 표 넘침 0, 낱말 끊김 0.
- **측정기 자가 시험** — 곁말을 SVG 밖으로, 라벨을 길게, 표 칸에 긴 낱말을 넣으면 폭 320에서 18건을 잡는다(주제마다 9).
- **과목 화면** — 과목 목록(`#/`)에 「Azure AZ-900 · 주제 16개 · 문항 152개」, 주제 목록(`#/azure`), 두 주제의 확인 문제(12·10문항)·랜덤(전체 152문항)·검색·복습 화면이 320·1180에서 넘침 0. 답을 누르면 해설이 뜬다. 콘솔 오류 없음. 이 확인은 문항을 고친 뒤에 했다.
- 캡처해서 눈으로 본 것: 도식 12개와 표 둘(390 전체, 1180 전체 — 각 도식의 마지막 시나리오), 그리고 step이 넘긴 `BudgetAlertDiagram`·`FreeAccountOffersDiagram`·`SpendingLimitDiagram`의 모든 장면(390). 곁말이 대상과 떨어져 읽히는 곳은 없다. 캡처 일부에 앱 머리글이 겹친 것은 `scrollIntoView`로 찍을 때 고정 머리글이 함께 찍힌 것이고 화면 결함이 아니다.
