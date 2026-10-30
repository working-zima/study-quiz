# phase 101 검증 보고

확인한 날: 2026-10-31(Windows PC). 브랜치 `feat-101-azure-benefits-sla-service-types`(origin/develop 275c0e9에서 분기), 설계 커밋 0daa1e7, phase 완료 커밋 fb4279d.
설계는 사용자가 승인했다(「진행해줘」). 실행은 `scripts/execute.py --agent claude --max-steps 3`을 세 덩어리(step 0~2 / 3~5 / 6~8)로 끊어 돌렸다.
실행기는 저장소 밖 `run-chunk.cmd`를 WMI로 띄운 프로세스라 메인 세션과 떨어져 돌았다. 덩어리 사이에는 메인 세션이 summary와 AC를 다시 보고 다음 덩어리를 띄웠다(사용자 「웬만하면 멈추지 말고 진행해」).

## step별 결과

| step | 걸린 시간 | 결과 | 테스트 |
|---|---|---|---|
| 0 benefits-sources | 28분 | `official.md` 새 항목 15·표기 정리 1, `corrections.md` D16~D21·G10~G14 | 5011 |
| 1 availability-scalability | 24분 | 개념 1~3, az015~az019, `CloudScalingDiagram` — 주제 `azure-cloud-benefits` 만듦 | 5030 |
| 2 reliability-manageability | 19분 | 개념 4~7, az020~az023 — `azure-cloud-benefits` 완성 | 5030 |
| 3 sla-lifecycle-sources | 22분 | `official.md` 새 항목 11·표기 정리 1, `corrections.md` D22~D29·G15~G16, 허용 출처에 약관 쪽 | 5030 |
| 4 sla-composite | 18분 | 개념 8~10, az024~az027, `CompositeSlaDiagram` — 주제 `azure-sla-lifecycle` 만듦 | 5051 |
| 5 preview-ga-lifecycle | 20분 | 개념 11~13, az028~az031, `ServiceLifecycleDiagram` — `azure-sla-lifecycle` 완성 | 5076 |
| 6 service-types-sources | 18분 | `official.md` 새 항목 9·표기 정리 1, `corrections.md` D30~D37·G17~G19, 「공유 책임 모델」 표기 결정 | 5076 |
| 7 shared-responsibility-iaas | 21분 | 개념 14·15, az032~az035, `SharedResponsibilityDiagram` — 주제 `azure-service-types` 만듦, `topic-map.md` 제목 칸 | 5098 |
| 8 paas-saas | 17분 | 개념 16·17, az036~az038, `ServiceTypesTable` — `azure-service-types` 완성, `corrections.md` 「(쓰일 곳)」 표지 정리 | 5105 |

결과: 주제 3개(`azure-cloud-benefits` ★★☆ · `azure-sla-lifecycle` ★★☆ · `azure-service-types` ★★★), 개념 17개(7 · 6 · 4), 문항 24개(az015~az038), 도식 넷·비교표 하나, 새 테스트 94개.
과목 전체는 주제 5개·개념 29개·문항 38개. 30분 제한에 걸린 step은 없다(가장 긴 것 28분). 사용량 한도·네트워크 끊김으로 실패한 step도 없다.

## 실행 중에 일어난 일

- **메인 폴더의 Stop 훅 테스트가 두 번 흔들렸다.** 메인 세션이 턴을 끝낼 때마다 `scripts/hooks/codex-verify-gate.sh`가 메인 폴더(`main`, 변경 없음)에서 전체 테스트를 돌리는데,
  azure worktree의 step 에이전트가 같은 시각에 `vitest run`을 돌리면 `VpcPathsDiagram.test.tsx`만 18개가 실패했다(시나리오마다 클릭을 되풀이하는 테스트가 기본 5초를 넘김).
  그 파일만 돌리면 64개, 부하가 없을 때 전체를 다시 돌리면 5011개가 통과했다. 코드 결함이 아니라 고치지 않았고, 이후 메인 세션은 덩어리가 도는 동안 전체 테스트를 겹쳐 돌리지 않았다.
  step 쪽 AC는 이 영향을 받지 않았다(모든 step이 자기 AC를 통과했다).

## 설계와 달라진 것

모두 step summary에 이유가 있고, 받아들였다.

- **개념·항목 이름을 Microsoft 한국어판 표기로**(step 0·3·6). 잠정 이름에서 바뀐 것: 「수직 확장·수평 확장」 → 「수직 크기 조정·수평 크기 조정」(한국어판 셋이 모두 「크기 조정」), 「클라우드의 관리」 → 「클라우드 관리」(한국어판 절 제목),
  「SLA」 → 「서비스 수준 계약(SLA)」, 「GA」 → 「일반 공급(GA)」, 미리 보기 항목 「비공개 미리 보기」·「공개 미리 보기」, 「수명 주기 정책」 → 「최신 수명 주기 정책」,
  「공동 책임 모델」 → 「공유 책임 모델」(받은 한국어판 여섯 문서에 14번, 「공동」은 2번) — 그래서 **주제 제목도 「서비스 유형과 공유 책임」**(id 그대로).
- **세 유형 이름을 「서비스형」 꼴로**(step 6) — IaaS(서비스형 인프라)·PaaS(서비스형 플랫폼)·SaaS(서비스형 소프트웨어). 아래 「사용자가 볼 것」 첫 항목.
- **덤프만 묻는 이점 넷**(step 0) — 내결함성·재해 복구는 공식 정의(「Reliability in Azure」 재해 복구 개요)가 있어 안정성 개념에 한 줄씩, 지리적 분산·민첩성은 정의가 없어 이점 이름으로 쓰지 않는다(D19·D20).
  민첩성의 내용(조달 없이 새 서비스를 빨리 내놓음)만 탄력성 개념에 한 줄. Site Recovery는 이름도 쓰지 않았다(D16).
- **step 2가 공식 문서 둘을 더 받았다** — 「What is Azure PowerShell?」·「What is the Azure portal?」(learn.microsoft.com). 관리 효율성의 PowerShell·웹 포털을 풀 근거가 step 0에 없어서다.
- **`SharedResponsibilityDiagram`의 행은 보안 문서 「Shared responsibility in the cloud」의 책임 표 10행**(step 6·7). Learn 단원의 그림은 글로 읽을 수 없어 근거로 치지 않았다.
  책임 표에서 SaaS의 클라이언트 장치가 「함께」라 「장치」를 「서비스 유형에 따라」 묶음에 두고, 본문에 「SaaS에서도 장치 보호·규정은 고객」을 써서 Learn 단원 4(장치는 늘 고객)와 어긋나지 않게 했다.
  IaaS의 배정을 확인하지 못한 Learn의 「ID와 액세스」 행은 그리지 않았다.
- **`CompositeSlaDiagram`의 연결선 흐림은 도착하는 서비스를 따른다**(step 4) — 「서비스 하나」에서 서비스 B로 가는 선이 선명하면 캡션과 어긋나서다. `ServiceLifecycleDiagram`의 연결선은 단계의 차례라 흐리지 않는다(step 5).
- **문항을 step 문서의 예와 다르게 낸 곳** — az024(「SLA가 멈춤을 막아 주나」 — G16의 더 흔한 오해), az025(4지선다 2×2 — 크레딧/놓친 매출 × 청구/저절로), az026(99.9%·99.5% — step 문서 예의 값이 덤프 NO.143·337과 같아 옮긴 꼴이 되므로),
  az030(「GA 뒤에도 바뀌나」 — 운영 권장은 az029, SLA는 az028이 이미 물음), az038(「보안 업데이트를 고객이 적용하나」 — 데이터가 고객에게 남는다는 것은 az032가 물음). 균형 때문에 정답 방향을 뒤집은 곳도 있다(az027).
- **허용 출처에 `azure.microsoft.com/support/legal/`**(step 3, 설계 때 정해 알림) — 미리 보기 약관이 거기 있다. `microsoft.com/licensing`의 SLA 약관은 받을 수 없어 「쓰지 않기로 판단했다」로 적었다. 그래서 서비스마다의 SLA 수치는 쓰지 않는다.

## 사용자가 볼 것

출처 step 셋(0·3·6)을 포함해 모든 step의 「사용자 확인」은 「없음」이다. 아래는 덩어리를 넘기며 메인 세션이 짚어 둔 것이다.

- **「IaaS(서비스형 인프라)」는 Microsoft 한국어판에 그대로 있는 말이 아니다**(step 6이 밝힘). 받은 한국어판 안에서도 표기가 갈린다 — 「서비스 제공 인프라」 7번·「서비스로서의 인프라」 2번,
  「서비스형 플랫폼」 4번, 「서비스형 소프트웨어」 3번·「서비스로서의 소프트웨어」 1번·「서비스 제공 소프트웨어」 2번(메인 세션이 `raw/official/ko-*.md`에서 다시 셈).
  셋을 한 꼴로 맞추려고 PaaS·SaaS 쪽의 「서비스형」을 IaaS에도 붙였다(근거는 `official.md` 「한국어 표기 정리 — azure-service-types」). 다른 꼴을 원하면 개념 name 세 곳과 표·본문의 괄호 풀이를 바꾸면 된다.
- **덤프 답이 공식 문서와 다른 것** — 그대로 가르치지 않고 고쳐 쓴다. 예: NO.103·188·405(Site Recovery의 이점을 「내결함성」으로 — 재해 복구, D16), NO.179(예측 가능성을 「민첩성」으로, D18),
  NO.71(서비스 크레딧이 저절로 들어온다 — 보통 고객이 청구, D24), NO.328(공개 미리 보기에 SLA가 있다, D26), NO.15(SaaS에서 데이터를 함께 맡는다 — 늘 고객, D30), NO.135(관리 부담이 가장 적은 웹앱 배포가 IaaS — PaaS, D31).
- 공개 미리 보기를 「운영 환경에 쓸 수 없다」고 단정하지 않는다 — 금지는 비공개 미리 보기 약관에만 있고, 공개 미리 보기는 「운영 환경에 권하지 않는다」(D27).
- 복합 SLA는 「어림값」이고 Microsoft가 앱 전체를 두고 약속하는 SLA가 아니라고 본문·캡션·문항 해설이 함께 말한다(「How to read a service-level agreement」의 한계).

## 메인 세션이 마무리에서 고친 것

- `ServiceTypesTable` IaaS 행 「맞는 경우」 칸 — 「리프트 앤 시프트 마이그레이션, 개발·테스트 환경」을 「…, 개발과 테스트 환경」으로(fde0a58). 390·1180 화면 실측에서 「개발·」과 「테스트 환경」이 두 줄로 끊겼다.
  표 테스트(`azureServiceTypesTables.test.tsx`)의 기대 문구를 먼저 바꿔 실패를 본 뒤 데이터를 고쳤다. 개념 본문의 「개발·테스트 환경」은 줄글이라 그대로 두었다.

## 남겨 둔 것

- `docs/UI_GUIDE.md` 「`break-keep`은 항상 `break-anywhere`와 함께」 절의 「가운뎃점은 줄바꿈 기회가 아니다」 — 그 절의 예(영문 낱말을 가운뎃점으로 이은 주제 제목)에서는 맞지만,
  한글 사이의 가운뎃점은 표 칸에서 실제로 줄이 끊겼다(위 수정). 문서를 고칠지는 이 phase의 범위 밖이라 두었다 — 표 칸에 「한글·한글」을 쓸 때는 실측으로 본다.
- `docs/source/azure/topic-map.md` 45행의 「다룰 것」·「학습 가이드」 칸과 98행, `azureDiagramCoverage.test.ts` 주석, `guide.md`에는 「공동 책임」이 남아 있다(step 7·8 메모). 앱 글이 아니고, 학습 가이드 칸은 가이드의 말을 적은 것이라 고치지 않았다.
- `docs/source/azure/dump-topics.tsv`의 분류 메모가 덤프 답과 다른 곳: NO.160·188·405·145(step 0), NO.135·290(step 6). 분류 메모일 뿐이고 수정 이력에 처리가 있다.
- `corrections.md` D36·D37의 「(쓰일 곳) 개념 글에 쓰지 않는다 — 근거 기록」, phase 100 항목(D1~D15·G1~G9)의 같은 표지, `official.md`에서 D 번호만 걸린 「쓰일 곳」 다섯 줄 — 가리키는 개념이 없어 그대로다.
- 통독 메모: 고가용성(개념 1)과 안정성(개념 4)의 끝 문단이 둘의 차이를 서로 되짚는다(guide가 둘 다에 요구함). 공유 책임 모델(개념 14)과 PaaS(개념 16)가 PaaS의 책임 나눔을 두 번 말한다 — 개념 16은 「코드만이 아니다」(G17) 쪽으로 짧게 썼다.

## 다시 돌린 검증 (phase가 끝난 뒤)

메인 세션이 마무리 수정을 더한 워킹 트리에서 다시 돌렸다. 덩어리마다(step 2·5·8 뒤)에도 같은 AC를 돌려 모두 통과했다.

- `npm run build` 통과, `npm run lint` 경고 0, `npm test` 223파일·5105개 통과(phase 시작 218파일·5011개).
- `check-structure` 「구조 이상 없음」.
- 교차 검사 「✓ 교차 없음 — 세로 노드 1001개·경로 699개, 가로 노드 1001개·경로 699개」(phase 시작 982/695에서 +19/+4).
- `check-verbatim --subject azure` 「전사 이상 없음 — azure: 원본 138개, 단위 249개」(phase 시작 원본 64개).
- 문항 38개(az001~az038), 예 10·아니요 11, 정답 위치 4/5/4/4 — 균형 규칙(예/아니요 차이 1 이하, 정답 위치 차이 2 이하) 안.
- phase 100의 주제 2개·문항 14개가 275c0e9와 통째로 같다. 문항의 `conceptId`는 모두 있는 개념을 가리킨다. AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 275c0e9와 diff 없음.
- 새 글(주제 셋의 개념·문항·도식 문구)에서 「공동 책임」·Site Recovery·Office 365·Azure AD·지리적 분산·민첩성·리팩터링·Cosmos·「전담」·진행 안내 문구가 0. 수치 99.95%·99.5%는 「예로 든 값」이라 밝힌 복합 SLA 예와 문항에만,
  「언제나」는 az020의 틀린 보기와 그것을 바로잡는 해설에만 있다.

## 화면 확인 (headless Chrome + CDP, 개발 서버 `127.0.0.1:5300`)

phase 100의 측정기(`measure-p100.cjs`)를 주제만 바꿔 썼다(저장소 밖 `p101-run/measure-p101.cjs`). 폭 320·390(배율 2, 모바일)과 1180(배율 1), 그리고 305.
측정기가 결함을 잡는지는 자가 시험(곁말을 SVG 밖으로, 노드 라벨을 상자보다 길게, 표 칸에 띄어쓰기 없는 긴 낱말)으로 먼저 봤다 — SVG 밖·라벨 넓음·그룹 박스 걸침·낱말 끊김을 잡았다.

- **넘침** — 네 폭에서 세 주제 모두 페이지 가로 넘침 0. 모든 시나리오 버튼을 누른 뒤에도 0. 도식 폭은 305·320·380, 1180에서는 가로형 638·621.
- **도식 넷의 모든 시나리오**(폭마다 15개 상태 — `azure-cloud-benefits` 3, `azure-sla-lifecycle` 7, `azure-service-types` 5)를 하나씩 눌러 보이는 SVG 글자를 화면 픽셀로 쟀다.
  SVG 밖으로 나간 글자 0, 노드 라벨이 자기 상자보다 넓은 곳 0, 글자끼리 겹친 곳 0, 곁말이 노드 상자에 겹친 곳 0, 그룹 박스 테두리에 걸친 곳 0. 폭마다 그룹 박스 18개·노드 80개·글자 116개를 세어 검사가 요소를 보는지 확인했다.
- **비교표** — 처음 잰 때 390·1180에서 「개발·테스트」 낱말 끊김 1건(위 「고친 것」). 고친 뒤 칸마다 낱말 63개를 Range로 재어 두 줄로 끊긴 낱말 0, 칸 밖 글자 0, 표 넘침 0.
  데스크톱 Chrome의 표 폭 273px(열 폭 22/40/38의 어림 기준)은 305 폭으로 재현해 따로 쟀다 — 역시 0.
- **과목 화면** — 과목 목록(`#/`)에 「Azure AZ-900 · 주제 5개 · 문항 38개」, 주제 목록에 새 주제 셋(★★☆·★★☆·★★★)과 「서비스 유형과 공유 책임」 제목,
  세 주제의 확인 문제(9·8·7문항)·랜덤(전체 38문항)·검색·복습 화면이 320·1180에서 넘침 0. 확인 문제에서 예/아니요를 누르면 해설이 뜬다.
- 콘솔에는 기존의 React Router future flag 경고 둘만 있다(오류·예외 없음).
- 캡처해서 눈으로 본 것: `SharedResponsibilityDiagram`(390, SaaS — 「늘 고객」 셋과 장치·애플리케이션이 선명하고 「함께」 곁말 둘), `CompositeSlaDiagram`(1180, 서비스 둘 — 곁말 「99.9% × 99.95% ≈ 99.85%」),
  `ServiceTypesTable`(390, 고치기 전 끊김 확인) — 칸·곁말·캡션이 제자리에 있고 값이 본문과 같다.
