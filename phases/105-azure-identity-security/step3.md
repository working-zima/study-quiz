# Step 3: sso-mfa-passwordless

## 배경

phase 105의 전체 계획·결정·공통 규칙은 `phases/105-azure-identity-security/guide.md`에 있다. **이 step은 주제 `azure-identity`에 개념 5(SSO)·6(다단계 인증)·7(암호 없는 인증)의 글·문항과 도식 `SingleSignOnDiagram`·`MfaFactorsDiagram`, 표 `SignInMethodsTable`을 더한다.**

중심 문제: step 0이 확인한 **NO.142·505의 처리**. 덤프는 암호 + 보안 질문을 다단계 인증으로 답하고, Learn은 둘을 같은 범주로 적는다. 본문·도식·문항은 step 0 summary의 처리를 따른다.

## 읽어야 할 파일

- **`phases/105-azure-identity-security/guide.md` 전체**
- `phases/105-azure-identity-security/index.json`의 앞 step `summary` — 특히 출처 step이 개념마다 확정한 `name`, 무엇을 쓰고 무엇을 쓰지 않는지
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-060**, **ADR-056**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/azure/CLAUDE.md`, `docs/source/azure/official.md`, `docs/source/azure/corrections.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/azure/index.ts`·`topics.json`·`questions.json`·`data.test.ts`·`visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/azureDiagramCoverage.test.ts`
- 도식 선례 — `src/components/diagrams/GeoRedundancyDiagram.tsx`와 `.test.tsx`, `src/data/azure/visuals/azure-storage.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- `phases/104-azure-storage-migration/verification.md`의 「메인 세션이 마무리에서 고친 것」
- `src/components/diagrams/azureStorageTables.tsx`와 `.test.tsx` — 표 선례
- `src/data/azure/visuals/azure-identity.json`, 앞 step의 도식

## 작업

### 1. 개념 — `topics.json`의 `azure-identity` 끝에

| # | id | 이 step에서 특히 |
|---|---|---|
| 5 | `azure-identity.single-sign-on` | 로그인 횟수가 줄어드는 이야기에서 끝내지 말고, 왜 보안에도 영향이 있는가(암호 재사용·퇴사자 접근)와 **왜 위험도 함께 모이는가**까지 간다. 회사 A의 앱 셋을 예로. 수량이 예시 값임을 밝힌다 |
| 6 | `azure-identity.multifactor-authentication` | 범주를 **일상의 예**로(비밀번호·휴대폰·지문). 왜 범주가 달라야 하는가를 원리로. 표기는 step 0 결과. SSO와 가르는 기준(로그인 횟수 / 요소의 수) |
| 7 | `azure-identity.passwordless` | **목록 개념**(ADR-046) — 항목 셋은 같은 꼴(누가 쓰기 좋은가, 무엇으로 로그인하는가). MFA와 무엇이 다른가(암호에 더한다 / 암호를 없앤다). 표에 쓰는 사실을 본문에 먼저 쓴다 |

### 2. 문항 — `az113`~`az116`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az113` | `single-sign-on` | 예/아니요, 정답 **예** 「원리 이해」 — SSO에서 처음 로그인에 쓰는 인증이 약하면, 그 로그인으로 닿는 다른 앱의 접근도 그만큼 약해지는가 |
| `az114` | `multifactor-authentication` | 예/아니요, 정답 **아니요** 「흔한 오해」 — step 0이 근거를 찾았을 때: 암호와 보안 질문을 함께 쓰면 서로 다른 두 범주의 요소를 쓴 것인가(세 범주를 풀어 쓴다). 근거의 범위 안에서 주장을 세운다 — Learn 단원 3이 둘을 같은 범주로 적으므로 **「범주가 다른가」**는 그것만으로 답이 선다. 해설은 맞는 조합을 가르친다 |
| `az115` | `multifactor-authentication` | 4지선다, 정답 위치 3 「상황 적용」 — 암호로 로그인하는 시스템에 서로 다른 범주의 요소를 하나 더하려 한다. 정답 휴대폰으로 받는 코드나 앱 알림(가진 것). 오답은 아는 것의 범주(또 하나의 암호, 보안 질문 등)이거나 범주 밖의 것. 「범주」를 안 읽은 사람도 문제문을 이해하게 한 줄 풀이를 둔다 |
| `az116` | `passwordless` | 4지선다, 정답 위치 0 「상황 적용」 — 자기 전용 Windows PC로 일하는 직원이 암호 없이 그 PC에서 로그인하려 한다. 정답 Windows Hello for Business. 오답은 나머지 두 방법과 같은 범주의 그럴듯한 것(문제문의 「Windows」가 정답 이름을 흘리지 않게 고쳐 쓴다 — 예: 「회사가 직원마다 나눠 준 노트북」처럼. 그때 조건은 본문의 사실로 답이 갈려야 한다) |

### 3. 도식

#### `azure-identity.single-sign-on` — `SingleSignOnDiagram`, JSON 키 `single-sign-on`

- 물음형 제목 예: `한 번 로그인으로 어떻게 여러 앱에 닿을까?`
- 그릴 것: `user`(「직원」), `entra`(「Microsoft Entra ID」), `app-1`·`app-2`·`app-3`(「앱 1」~「앱 3」). 경로 `sign-in`(`user`→`entra`), `to-app-1`·`to-app-2`·`to-app-3`(`entra`→각 앱). 앱 셋은 예시임을 범례·본문에서 밝힌다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `first` | 처음 로그인 | `user`·`entra` | `sign-in` | 「한 번 로그인」 | 직원이 한 번 인증한다 |
  | `others` | 다른 앱 | `entra`·앱 셋 | `to-app-*` 셋 | 「다시 로그인하지 않는다」 | 믿을 수 있는 앱에는 다시 암호를 넣지 않고 닿는다 |
  | `weak` | 처음 인증이 약할 때 | 다섯 모두 | 넷 모두 | 「처음 인증만큼만 안전」 | 처음 인증이 뚫리면 이어지는 앱에도 그 인증으로 닿는다 |

- 요점 테스트: 앱으로 가는 경로 셋의 시작이 모두 `entra`이고 `user`에서 앱으로 바로 가는 경로가 없다. `first`에서 앱 셋이 opacity `0.25`. `others`에서 `user`가 opacity `0.25`.

#### `azure-identity.multifactor-authentication` — `MfaFactorsDiagram`, JSON 키 `mfa-factors`

- 물음형 제목 예: `무엇과 무엇을 합쳐야 다단계일까?`
- 그릴 것: 그룹 셋 — `know`(「아는 것」: `password` 「암호」, `question` 「보안 질문」), `have`(「가진 것」: `phone` 「휴대폰」), `are`(「본인의 특성」: `biometric` 「지문·얼굴」). 경로 없음. 세로형은 그룹을 위아래로, 가로형은 좌우로.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `different` | 서로 다른 범주 | `password`·`phone` | 「범주 둘」 | 암호가 새어도 휴대폰이 없으면 로그인하지 못한다 |
  | `biometric` | 생체를 더할 때 | `password`·`biometric` | 「범주 둘」 | 지문이나 얼굴은 본인의 특성이라 범주가 다르다 |
  | `same` | 같은 범주 | `password`·`question` | 「같은 범주의 둘」 | 둘 다 아는 것이라 범주가 하나다(step 0의 처리대로) |

  세 시나리오의 「선명한 노드 + 곁말」이 서로 달라야 한다.
- 요점 테스트: `password`·`question`은 `know` 안, `phone`은 `have` 안, `biometric`은 `are` 안(두 배치). 경로가 없다. `same`에서 `phone`·`biometric`이 opacity `0.25`이고 `different`에서 `question`·`biometric`이 opacity `0.25`다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로).

### 4. 표 — `SignInMethodsTable`

`src/components/diagrams/azureIdentityTables.tsx`와 `.test.tsx`를 새로 만든다. `visuals/azure-identity.json`의 `tables["sign-in-methods"]`, 개념 `azure-identity.passwordless`. 열은 **방법 · 로그인에 쓰는 것 · 보안과 편의**. 행은 암호만 / 다단계 인증 / 암호 없는 인증 — 칸은 step 0이 확인한 대로 쓴다. 근거 없는 칸은 비우지 말고 말을 바꾸거나 열을 다시 설계한다. `columnWidths`와 계산은 guide.md 「도식」대로 summary에 적는다. registry의 표 등록은 선례를 따른다.

### 5. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 116개, 마지막 id는 `az116`, 예 29·아니요 30이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
3. `phases/105-azure-identity-security/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **암호 + 보안 질문을 다단계 인증의 예로 쓰지 마라.** 이유: 덤프 답의 오류를 가르치게 된다(guide.md 「배경」, step 0의 D 항목).
- **「MFA는 무조건 안전하다」, 「암호 없는 인증이 언제나 낫다」 같은 단정을 쓰지 마라.** 이유: 공식 문서의 범위를 넘고, 예/아니요 문항의 금지어와 같은 꼴이다.
