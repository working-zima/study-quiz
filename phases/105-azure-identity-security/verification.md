# phase 105 검증 보고

확인한 날: 2026-11-02(Mac). 브랜치 `feat-105-azure-identity-security`(origin/develop `be72017`에서 분기), 설계 커밋 `3957965`, phase 완료 커밋 `a29646d`, 마무리 수정은 이 보고와 함께 커밋한다.
다음 작업을 묻자 사용자가 「Azure phase 105 설계」를 골랐고, 메인 세션이 설계해 바로 실행했다. 사용자가 자는 동안 「한도 풀리면 계속 진행」하라고 해서, 저장소 밖 `aws-quiz-p103-sup/`의 supervisor로 세 덩어리(step 0~2 / 3~4 / 5~8)를 돌리고 `chain-p105.sh`가 덩어리를 차례로 이었다. codex가 기본이고, 사용량 한도면 같은 step을 Claude가 처음부터 다시 실행한다.

## step별 결과

| step | 맡은 쪽 | 끝난 때 | 결과 | 테스트 |
|---|---|---|---|---|
| 0 identity-sources | codex 한도 → Claude | 11-01 22:40 | `official.md` 새 항목 21·덧붙임 2, `corrections.md` D74~D80·G47~G49 | 5758 |
| 1 entra-id-connect | Claude | 22:53 | 개념 1·2, az106~az108, `EntraConnectDiagram` — 주제 `azure-identity` 만듦 | 5777 |
| 2 domain-services-auth | Claude 한도 → Claude | 11-02 03:10 | 개념 3·4, az109~az112, `DomainServicesDiagram`·`AuthVsAuthzDiagram` | 5819 |
| 3 sso-mfa-passwordless | codex 한도 → Claude | 03:24 | 개념 5·6·7, az113~az116, `SingleSignOnDiagram`·`MfaFactorsDiagram`·`SignInMethodsTable` | 5869 |
| 4 external-conditional | codex 한도 → Claude | 03:38 | 개념 8·9, az117~az119, `ExternalIdentitiesDiagram`·`ConditionalAccessDiagram` — `azure-identity` 완성 | 5911 |
| 5 security-sources | codex·Claude 한도 → Claude | 08:08 | `official.md`, `corrections.md` D81~D87·G50~G55 | 5911 |
| 6 rbac | Claude | 08:23 | 개념 10·11, az120~az123, `RbacAssignmentDiagram`·`RbacScopeDiagram`·`RbacRolesTable` — 주제 `azure-security-model` 만듦 | 5961 |
| 7 zero-trust-defense | Claude | 08:35 | 개념 12·13, az124~az126, `ZeroTrustDiagram`·`DefenseInDepthDiagram` | 6003 |
| 8 security-tools | Claude 한도 → Claude | 13:06 | 개념 14·15·16, az127~az130, `DefenderForCloudDiagram`·`SentinelFlowDiagram`·`SecurityToolsTable` — `azure-security-model` 완성 | 6052 |

결과: 주제 2개(`azure-identity`·`azure-security-model`, 둘 다 ★★★ — 주제 지도와 같다), 개념 16개(9·7), 문항 25개(az106~az130), 도식 13개, 표 셋, 새 테스트 294개.
과목 전체는 주제 14개·개념 92개·문항 130개. 실행 전체는 11-01 22:13 ~ 11-02 13:06이고, 그중 약 12시간 30분은 사용량 한도라 기다린 시간이다. 사용량 한도가 아닌 실패로 멈춘 step은 없다.

## 실행 중에 일어난 일

- **사용량 한도로 일곱 번 끊겼고 그때마다 그 step을 처음부터 다시 실행했다.** 끊긴 시도는 step 0(codex)·2(Claude)·3(codex)·4(codex)·5(codex·Claude)·8(Claude)이다. 부분 변경은 커밋되지 않고 stash로 남았다.
- 결과적으로 아홉 step 모두 Claude가 끝냈다. codex가 끝낸 step은 없다.
- **덩어리를 잇는 일을 세션 밖으로 뺐다.** 세션도 같은 한도에 걸리므로, 앞 덩어리가 `range_done`이고 「사용자 확인」이 없으며 워킹 트리가 깨끗할 때만 다음 덩어리를 띄우는 `chain-p105.sh`를 두었다. 세 조건은 모두 통과했다.

## 설계와 달라진 것

모두 step summary에 이유가 있고, 받아들였다.

- **보안 질문**(step 0, D74) — 「같은 범주 둘은 다단계 인증이 아니다」라고 바로 쓴 공식 문장은 찾지 못했다. 쓴 것은 확인된 세 사실이다: 암호와 보안 질문은 둘 다 아는 것(Learn 단원 3), Microsoft Entra 다단계 인증은 세 범주 가운데 둘 이상을 요구(제품 문서), 보안 질문은 로그인 인증 방법이 아니고 셀프 서비스 암호 재설정에만 쓰며 2027년 3월에 그 지원도 끝남(제품 문서). 덤프 NO.142·505의 답을 쓰지 않았다.
- **RBAC의 데이터 수준**(step 5) — Learn 단원 6의 「데이터 수준은 강제하지 않는다」는 제품 문서의 데이터 작업과 어긋나 그대로 쓰지 않았다. 자주 보는 네 역할에는 데이터 작업이 없고, 저장소처럼 데이터 작업이 있는 서비스는 전용 역할로 준다고 썼다. 허용 모델은 「할당끼리 합쳐진다」로 쓰고 「막는 방법이 없다」로 단정하지 않았다(거부 할당이 있다).
- **외부 ID**(step 0·4) — 고객 쪽 이름은 Learn의 「for customers(formerly Azure AD B2C)」가 아니라 현행 제품 문서의 「외부 테넌트의 외부 ID」로 썼다. FAQ가 새 이름이 아니라고 답한다. 도식은 고객을 직원 테넌트의 앱이 아니라 별도 그룹 「외부 테넌트」의 앱으로 잇는다.
- **SSO와 보안**(step 0, G48) — guide의 「보안을 더하는 것이 아니다」는 제품 문서가 노출 감소를 이점으로 들어서 쓰지 않고, 「확인 수단을 더하는 일은 아니다」로 썼다.
- **표기** — 「관리형 도메인」→「관리되는 도메인」, 「도메인 조인」→「도메인 가입」, 「관리되는 디바이스」→「관리 디바이스」, 「본인의 특성」→「사용자의 속성」, 「기기」→「디바이스」, 「요청 검증」→「요청 확인」. 모두 Microsoft 한국어 문서를 따랐다.
- **제로 트러스트와 심층 방어를 「함께 쓴다」고 쓰지 않았다**(step 7) — 그 문장을 공식 문서에서 찾지 못해 각 정의로 차이만 썼다.
- **도식** — `EntraConnectDiagram`의 동기화는 기본 방향인 한 방향으로, Connect는 온-프레미스 그룹 안에 그렸다. 반대 방향의 쓰기 저장은 본문 한 줄로만 쓴다. `DefenderForCloudDiagram`의 곁말은 「많은 서비스는 추가 배포 없이」로 좁혔다.

## 사용자가 볼 것

9개 step 모두 「사용자 확인」은 「없음」이다.

- **덤프 답이 공식 문서와 달라 고쳐 쓴 것**(`corrections.md` D74~D87) — 암호 + 보안 질문을 다단계 인증으로 답한 것(D74), 구독에서 새 사용자를 만든다는 답(D75), 라이선스 하나(D76), 사용자를 리소스 그룹으로 묶는다는 답(D77), Entra ID의 그룹 정책과 Windows 10만 가입(D78), 온-프레미스·제삼자 ID(D79), 인증이 접근 수준을 정한다는 답(D80), 역할 할당을 「Policies」에서 한다는 답(D81), DDoS 보호가 네트워크 계층이라는 답(D82), 심층 방어 계층의 순서(D83), 리소스 그룹에 소유자를 여럿 둘 수 없다는 답(D84), Azure Security Center·Azure Sentinel 이름(D85), 무료 기능 두 가지(D86), Azure Disk Encryption(D87). 덤프끼리 답이 갈린 것은 D76·D77·D79·D80·D82·D84다.
- **용어집이 공식 문서와 달라 고쳐 쓴 것**(G47~G55) — Entra ID의 B2C(G47), SSO의 보안 수준(G48), MFA 방법과 자동 MFA(G49), 대표 역할 셋(G50), 제로 트러스트의 구현 수단(G51), 심층 방어 네 계층(G52), Defender for Cloud의 범위(G53), Key Vault의 HSM(G54), Sentinel의 SOAR·AI(G55).
- **쓰지 않은 것** — Entra ID Protection·PIM·Defender for Identity, 라이선스 수, Entra ID 요금제, OpenID Connect·SAML, Key Vault의 FIPS·요금제, Sentinel의 포털 전환 일정, Defender 플랜 하나하나와 금액.
- **지원 종료 날짜를 본문에 둘 썼다** — 보안 질문의 암호 재설정(2027년 3월), Azure Disk Encryption(2028년 9월 15일). 둘 다 제품 문서의 예고이고 `official.md`에 근거가 있다. 그날이 지나면 본문을 고쳐야 한다.

## 메인 세션이 마무리에서 고친 것

새 문항 25개와 개념 16개를 메인 세션이 직접 읽고 고쳤다. 정답 방향·사실·균형은 그대로다.

- **az107** — 오답 Azure Firewall은 ID 서비스가 아니라 소거로 풀려(ADR-030 기준 4) Azure RBAC로 바꾸고 해설도 맞췄다. RBAC는 ID를 다루는 쪽에서 실제로 헷갈리는 보기다.
- **az113** — 「이 처음 로그인이 암호 하나뿐이고」를 「이때 처음 로그인에 암호 하나만 쓰고」로.
- **az121** — 「꼭 맞는 것이 없습니다. 이 경우에도 …」가 답(아니요)을 암시해, 「회사 T가 직원에게 할당하는 역할은 Azure가 미리 만들어 둔 역할 가운데에서 골라야 하나요?」로.
- **`zero-trust`** — 「이 공용 네트워크의 디바이스가 보낸 요청에 … 바로 답하지 않고」를 「공용 네트워크의 디바이스가 보낸 이 요청을 … 바로 허용하지 않고」로. 도식 라벨이 본문에 있어야 한다는 테스트는 그대로 통과한다.

## 남겨 둔 것

- **`RbacScopeDiagram`의 「리소스 하나에」에서는 화살표가 흐린 상자에서 선명한 상자로 들어온다.** 화살표는 늘 보이는 상속 방향이고, 범례가 「선명한 상자가 그 역할이 미치는 곳」이라고 밝히며 캡션이 「위로 올라가지 않는다」고 말한다. step 6이 phase 끝에 보라고 적어 둔 것이고, 캡처를 보니 읽는 데 지장이 없어 고치지 않았다.
- `git stash`에 이 phase의 한도 중단 초안 7개가 남아 있다(`p34-usage-limit … step0·2·3·4·5·5·8`). 쓰이지 않는 것이고, 지우는 것은 사용자 판단으로 둔다.

## 다시 돌린 검증 (마무리 수정 뒤)

실행 부하가 없을 때 마무리 수정한 내용으로 다시 돌렸다. supervisor도 step마다 같은 검증을 돌려 모두 통과했다.

- `npm run build` 통과, `npm run lint` 경고 0, `npm test` 270파일·6052개 통과(phase 시작 255파일·5758개).
- `check-structure` 「구조 이상 없음」.
- 교차 검사 「✓ 교차 없음 — 세로 노드 1203개·경로 825개, 가로 노드 1203개·경로 825개」(phase 시작 1140/779에서 +63/+46).
- `check-verbatim --subject azure` 「전사 이상 없음 — azure: 원본 560개, 단위 886개」(phase 시작 원본 411개·단위 724개).
- 문항 130개(az001~az130), 예 32·아니요 33, 정답 위치 17/16/16/16.
- AWS·네트워크 데이터(`src/data/aws/`·`src/data/network/`)는 `be72017`과 diff 없음.

## 화면 확인 (headless Chrome + CDP, 개발 서버 `127.0.0.1:5300`)

phase 104의 측정기를 주제만 바꿔 썼다(저장소 밖 `p105-run/measure-p105.cjs`). 폭 305·320·390(배율 2, 모바일)과 1180(배율 1). 지난번처럼 첫 페이지를 다 뜨기 전에 재지 않도록 대기를 늘렸다.

- **넘침** — 네 폭에서 두 주제 모두 페이지 가로 넘침 0. 모든 시나리오 버튼을 누른 뒤에도 0.
- **도식 13개의 모든 시나리오**(폭마다 51개 상태 — `azure-identity` 27, `azure-security-model` 24)를 하나씩 눌러 보이는 SVG 글자를 화면 픽셀로 쟀다. SVG 밖으로 나간 글자, 노드 라벨이 자기 상자보다 넓은 곳, 글자끼리 겹친 곳, 곁말이 노드 상자에 겹친 곳, 그룹 박스 테두리에 걸친 곳 모두 0.
- **표 셋** — 폭 273·288·358·638에서 표 넘침 0, 낱말 끊김 0.
- **측정기 자가 시험** — 곁말을 SVG 밖으로, 라벨을 길게, 표 칸에 긴 낱말을 넣으면 폭 320에서 17건을 잡는다(`azure-identity` 4, `azure-security-model` 13).
- **과목 화면** — 과목 목록(`#/`)에 「Azure AZ-900 · 주제 14개 · 문항 130개」, 주제 목록(`#/azure`), 두 주제의 확인 문제(14·11문항)·랜덤(전체 130문항)·검색·복습 화면이 320·1180에서 넘침 0. 답을 누르면 해설이 뜬다. 콘솔 오류 없음. az121 문제문의 마지막 수정은 이 확인 뒤이고 문장 길이가 비슷하다.
- 캡처해서 눈으로 본 것: 도식 13개와 표 셋(390 전체, 1180 전체 — 각 도식의 마지막 시나리오). 곁말이 대상과 떨어져 읽히는 곳은 없다. 캡처 일부에 앱 머리글이 겹친 것은 `scrollIntoView`로 찍을 때 고정 머리글이 함께 찍힌 것이고 화면 결함이 아니다.
