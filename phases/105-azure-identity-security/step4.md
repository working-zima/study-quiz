# Step 4: external-conditional

## 배경

phase 105의 전체 계획·결정·공통 규칙은 `phases/105-azure-identity-security/guide.md`에 있다. **이 step은 주제 `azure-identity`에 개념 8(외부 ID)·9(조건부 액세스)의 글·문항과 도식 `ExternalIdentitiesDiagram`·`ConditionalAccessDiagram`을 더해 주제를 마친다.**

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
- `src/data/azure/visuals/azure-identity.json`, 앞 step의 도식

## 작업

### 1. 개념 — `topics.json`의 `azure-identity` 끝에

| # | id | 이 step에서 특히 |
|---|---|---|
| 8 | `azure-identity.external-identities` | **목록 개념**(ADR-046) — 소개 문단(테넌트 풀이, 왜 필요한가) 뒤 항목 셋은 같은 꼴(누구와, 디렉터리에 어떻게 나타나는가). 이름은 step 0 결과. SSO와 무엇이 다른가를 항목 다음 문단에. 게스트 접근 검토 한 줄 |
| 9 | `azure-identity.conditional-access` | **신호 → 결정 → 적용**의 흐름을 회사 A 직원의 두 로그인(평소 위치 / 낯선 위치)으로 보인다. 쓰임 넷은 나열이 아니라 조건을 말한 문장으로. 앞의 다단계 인증과의 관계(모두에게 늘 / 상황에 따라). 이 개념으로 주제가 끝나므로 주제 전체를 통독하고, 풀이 없이 처음 나오는 낱말을 찾는다 |

### 2. 문항 — `az117`~`az119`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az117` | `external-identities` | 4지선다, 정답 위치 1 「상황 적용」 — 협력사 직원이 자기 회사 계정으로 우리 회사의 앱에 들어오게 하고, 우리 디렉터리에는 게스트로 나타나게 하려 한다. 정답 B2B 협업. 오답: B2B 직접 연결·고객용 External ID·Microsoft Entra Connect(이름은 step 0 결과). 문제문이 「협업」을 쓰지 않는다 |
| `az118` | `conditional-access` | 4지선다, 정답 위치 2 「상황 적용」 — 평소에는 추가 인증 없이 들어오지만, 회사 밖의 낯선 위치에서 로그인하면 둘째 인증을 요구하려 한다. 정답 조건부 액세스. 오답: Azure RBAC·Microsoft Entra Connect·SSO 같은 출처 안의 것. `NO.151`의 상황(패치된 장치)을 옮기지 않는다 |
| `az119` | `conditional-access` | 예/아니요, 정답 **예** 「원리 이해」 — 관리되는 디바이스(회사가 정한 보안 기준을 맞춘 기기 — 풀어 쓴다)에서만 어느 앱에 닿게 정할 수 있는가 |

### 3. 도식

#### `azure-identity.external-identities` — `ExternalIdentitiesDiagram`, JSON 키 `external-identities`

- 물음형 제목 예: `회사 밖의 사람은 어떻게 들어올까?`
- 그릴 것: 그룹 `our-tenant`(「회사 A의 테넌트」) 안에 `guest`(「게스트 사용자」)·`app`(「앱과 리소스」). 그룹 밖에 `partner`(「협력사 직원」), `other-tenant`(「다른 테넌트의 사용자」), `customer`(「고객」). 경로 `b2b-1`(`partner`→`guest`), `b2b-2`(`guest`→`app`), `direct`(`other-tenant`→`app`), `consumer`(`customer`→`app`). 고객 쪽 구성이 다르면(별도 외부 테넌트) step 0 결과대로 그룹을 더한다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `collaboration` | B2B 협업 | `partner`·`guest`·`app` | `b2b-1`·`b2b-2` | 「디렉터리에 게스트로 표시」 | 자기 자격 증명으로 로그인하고 우리 디렉터리에는 게스트로 나타난다 |
  | `direct-connect` | B2B 직접 연결 | `other-tenant`·`app` | `direct` | 「상호 신뢰」, 「디렉터리에 표시되지 않음」 | 두 테넌트가 서로 믿고, Teams 공유 채널로 닿는다 |
  | `customers` | 고객 | `customer`·`app` | `consumer` | 「소셜 ID도 쓸 수 있다」(step 0 결과대로) | 소비자와 고객이 자기 ID로 회사가 공개한 앱에 닿는다 |

- 요점 테스트: `guest`·`app`은 `our-tenant` 안, 나머지는 밖(두 배치). `direct-connect`에서 `guest`가 opacity `0.25`이고 `b2b-1`이 보이지 않는다. 시나리오마다 다른 두 시나리오의 경로가 보이지 않는다.

#### `azure-identity.conditional-access` — `ConditionalAccessDiagram`, JSON 키 `conditional-access`

- 물음형 제목 예: `같은 사람인데 왜 어떤 때는 더 물을까?`
- 그릴 것: `signals`(「신호」), `decision`(「결정」), `allow`(「허용」), `mfa`(「둘째 인증 요구」), `block`(「차단」). 경로 `to-decision`(`signals`→`decision`), `to-allow`·`to-mfa`·`to-block`(`decision`→각각). `to-decision`은 늘 보인다. 곁말 「사용자·위치·디바이스·앱」은 `signals` 곁에 늘 보인다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `usual` | 평소 위치 | `signals`·`decision`·`allow` | `to-allow` | 「평소 위치」 | 평소처럼 로그인하면 추가로 묻지 않고 들어온다 |
  | `unusual` | 낯선 위치 | `signals`·`decision`·`mfa` | `to-mfa` | 「낯선 위치」 | 신호가 평소와 다르면 둘째 인증을 요구한다 |
  | `risky` | 위험한 위치 | `signals`·`decision`·`block` | `to-block` | 「위험으로 표시된 위치」 | 위험으로 표시된 곳이면 접근을 막는다 |

  경로 셋은 같은 노드에서 갈라지되 겹쳐 그리지 않는다.
- 요점 테스트: `to-allow`·`to-mfa`·`to-block`의 시작이 모두 `decision`이다. 시나리오마다 적용 노드 하나만 선명하고 나머지 둘이 opacity `0.25`다. 시나리오마다 보이는 적용 경로가 하나다.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로).

### 4. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다. 주제 13의 「쓰일 곳」이 근거 기록 말고 남지 않아야 한다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 119개, 마지막 id는 `az119`, 예 30·아니요 30이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `azure-identity`의 개념이 9개이고 순서가 guide.md 표와 같은지, 개념 2·3의 `parentId`가 `azure-identity.entra-id`인지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
4. `phases/105-azure-identity-security/index.json`의 step 4을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **조건부 액세스를 모든 Entra ID 요금제에 있는 것처럼, 또는 특정 요금제에만 있는 것처럼 쓰지 마라.** 이유: 요금제를 쓰지 않기로 했다(guide.md 「배경」).
- **앞 개념의 글을 고치지 마라.** 고칠 것을 찾으면 summary에 적는다. 이유: 앞 step의 스냅숏 검사가 막고, 메인 세션이 phase 끝에 한꺼번에 고친다.
