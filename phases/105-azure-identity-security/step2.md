# Step 2: domain-services-auth

## 배경

phase 105의 전체 계획·결정·공통 규칙은 `phases/105-azure-identity-security/guide.md`에 있다. **이 step은 주제 `azure-identity`에 개념 3(Microsoft Entra Domain Services)·4(인증과 권한 부여)의 글·문항과 도식 `DomainServicesDiagram`·`AuthVsAuthzDiagram`을 더한다.**

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
- `src/data/azure/visuals/azure-identity.json`, `src/components/diagrams/EntraConnectDiagram.tsx` — step 1이 만든 것

## 작업

### 1. 개념 — `topics.json`의 `azure-identity` 끝에

| # | id | parentId | 이 step에서 특히 |
|---|---|---|---|
| 3 | `azure-identity.domain-services` | `entra-id` | **왜 있는가부터** — 도메인 조인·LDAP·Kerberos에 기대는 옛 앱을 클라우드로 옮기는데 도메인 컨트롤러를 직접 운영하고 싶지 않은 회사 B를 예로. **앞의 Connect와 동기화 방향이 어떻게 다른지** 밝힌다. Entra ID와 가르는 기준을 4절대로. 도식의 예를 본문에 쓴다 |
| 4 | `azure-identity.authentication-authorization` | — | 첫 문장에 둘의 차이를 세운다. 일상의 예(직접 만든다 — 공항·건물 출입처럼 쓰면 실제 동작과 다른 점을 밝힌다). 로그인에 성공한 직원 A가 리소스 하나에서 거부되는 상황을 본문에 쓴다. 뒤 개념(RBAC 등)을 「…에서 다룬다」로 가리키지 않는다 |

### 2. 문항 — `az109`~`az112`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az109` | `domain-services` | 4지선다, 정답 위치 1 「상황 적용」 — LDAP·Kerberos를 쓰는 옛 앱을 Azure로 옮기는데 도메인 컨트롤러를 직접 관리하고 싶지 않다. 정답 Microsoft Entra Domain Services. 오답: Microsoft Entra Connect(ID 동기화), Azure VM에 도메인 컨트롤러 직접 설치(관리 조건에 어긋남), 외부 ID나 조건부 액세스처럼 출처 안의 것. 「오답 셋만 같은 말로 시작」하지 않게 보기 꼴을 맞춘다 |
| `az110` | `domain-services` | 예/아니요, 정답 **예** 「원리 이해」 — Entra ID의 사용자가 동기화된 관리형 도메인에 기존 자격 증명으로 로그인할 수 있는가. 해설에 한 방향 동기화(관리형 도메인에서 만든 것은 Entra ID로 돌아가지 않는다)를 가르친다 |
| `az111` | `authentication-authorization` | 4지선다, 정답 위치 2 「원인과 결과」 — 직원이 로그인에 성공했는데 어느 리소스를 열 때 거부된다. 어느 단계가 막았는가. 정답 권한 부여. 오답은 인증·SSO·다단계 인증처럼 로그인 쪽 낱말. 문제문에 「권한」을 쓰지 않는다 |
| `az112` | `authentication-authorization` | 예/아니요, 정답 **아니요** 「흔한 오해」 — 인증에 성공한 사용자는 그 조직의 모든 리소스를 쓸 수 있는가. 해설은 두 단계가 무엇을 묻는지 가르친다. 「항상」·「절대」를 쓰지 않는다 |

### 3. 도식

#### `azure-identity.domain-services` — `DomainServicesDiagram`, JSON 키 `domain-services`

- 물음형 제목 예: `도메인 컨트롤러를 직접 두지 않고 옛 앱을 옮기려면?`
- 그릴 것: 그룹 `managed-domain`(「관리형 도메인」) 안에 `dc-1`(「도메인 컨트롤러 1」)·`dc-2`(「도메인 컨트롤러 2」). 그룹 밖에 `entra`(「Microsoft Entra ID」), `on-prem-ad`(온-프레미스의 Active Directory — 이름은 step 0 표기), `legacy-app`(「옛 앱」).
- 경로: `hybrid-sync`(`on-prem-ad`→`entra`), `one-way`(`entra`→`dc-1`), `app-auth`(`legacy-app`→`dc-2`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `managed` | 관리하는 쪽 | `dc-1`·`dc-2` | 없음 | 「Azure가 관리」 | 도메인 컨트롤러 둘을 Azure가 고른 지역에 두고 관리·업데이트한다 |
  | `sync` | ID 동기화 | `on-prem-ad`·`entra`·`dc-1` | `hybrid-sync`·`one-way` | 「Microsoft Entra Connect」, 「한 방향으로 동기화」 | 온-프레미스의 ID는 Connect로 Entra ID에 가고, Entra ID에서 관리형 도메인으로 한 방향으로 간다 |
  | `legacy` | 옛 앱 | `legacy-app`·`dc-2` | `app-auth` | 「LDAP·Kerberos로 인증」 | 옛 앱은 코드를 고치지 않고 관리형 도메인에 닿는다(근거가 있는 말로) |

- 요점 테스트: `dc-1`·`dc-2`는 `managed-domain` 안, 나머지 셋은 밖(두 배치). `one-way`는 `entra`에서 `dc-1`로 가고 그 반대 경로가 없다. `managed`에서 경로가 없다. `sync`에서 `legacy-app`이 opacity `0.25`다.

#### `azure-identity.authentication-authorization` — `AuthVsAuthzDiagram`, JSON 키 `auth-vs-authz`

- 물음형 제목 예: `로그인했는데 왜 거부될까?`
- 그릴 것: `user`(「사용자」), `authn`(「인증」), `authz`(「권한 부여」), `resource`(「리소스」)를 차례로. 경로 `step-1`(`user`→`authn`), `step-2`(`authn`→`authz`), `step-3`(`authz`→`resource`). 곁말로 「누구인가?」(`authn` 곁)·「무엇을 해도 되는가?」(`authz` 곁)는 늘 보인다(`data-note`가 시나리오와 무관하면 선례를 본다).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `authn-fail` | 인증 실패 | `user`·`authn` | `step-1` | 「자격 증명이 맞지 않다」 | 누구인지 증명하지 못하면 권한을 보기 전에 멈춘다 |
  | `authz-deny` | 권한 없음 | `user`·`authn`·`authz` | `step-1`·`step-2` | 「로그인은 되었다」, 「이 리소스는 거부」 | 인증은 통과했지만 이 리소스의 일을 허용받지 않았다 |
  | `allowed` | 허용 | 넷 모두 | 셋 모두 | 없음 | 두 단계를 차례로 통과해야 리소스에 닿는다 |

- 요점 테스트: 세 경로가 `user`에서 `resource`로 이어진다. `authn-fail`에서 `resource`·`authz`가 opacity `0.25`, `authz-deny`에서 `resource`만 opacity `0.25`, `allowed`에서 모두 선명.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로).

### 4. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 112개, 마지막 id는 `az112`, 예 28·아니요 29다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
3. `phases/105-azure-identity-security/index.json`의 step 2을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **RBAC를 개념으로 세우거나 역할 이름을 늘어놓지 마라.** 이유: 주제 14의 범위다. 권한 부여의 예로 한 구절이면 충분하다.
- **도메인 서비스를 고르는 쪽에 옛 앱이 아닌 일반 앱을 예로 들지 마라.** 이유: 일반 앱은 Entra ID 쪽이다. 두 서비스가 함께 맞는 상황이 된다.
