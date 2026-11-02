# Step 7: zero-trust-defense

## 배경

phase 105의 전체 계획·결정·공통 규칙은 `phases/105-azure-identity-security/guide.md`에 있다. **이 step은 주제 `azure-security-model`에 개념 12(제로 트러스트)·13(심층 방어)의 글·문항과 도식 `ZeroTrustDiagram`·`DefenseInDepthDiagram`을 더한다.**

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
- `src/data/azure/visuals/azure-security-model.json`, 앞 step의 도식
- `src/data/azure/topics.json`의 `azure-network-protection.ddos-protection` — 겹치지 않게

## 작업

### 1. 개념 — `topics.json`의 `azure-security-model` 끝에

| # | id | 이 step에서 특히 |
|---|---|---|
| 12 | `azure-security-model.zero-trust` | **이전 방식과 견주며** 시작한다 — 회사 네트워크 안이면 믿던 경계 기반이 왜 안 맞게 되었는가(재택·휴대 기기). 원칙 셋은 각각 무슨 일을 하게 되는지 일상의 말로. 관리되지 않는 기기로 공용 네트워크에서 로그인하는 회사 A 직원의 예 |
| 13 | `azure-security-model.defense-in-depth` | **목록 개념**(ADR-046) — 소개 문단(왜 겹쳐 두는가) 뒤 항목 일곱은 바깥에서 안으로, 같은 꼴(무엇을 지키는가 + Azure의 예 하나). 항목 다음 문단에 한 계층이 뚫릴 때 일어나는 일과, 제로 트러스트와 어떻게 다른가(믿지 않는 태도 / 겹겹이 막는 구조, 둘은 함께 쓴다 — step 5 근거 안에서) |

### 2. 문항 — `az124`~`az126`

| id | 개념 | 형식과 방향 |
|---|---|---|
| `az124` | `zero-trust` | 예/아니요, 정답 **아니요** 「흔한 오해」 — 제로 트러스트에서는 회사 네트워크 안에 있는 기기의 요청에 인증을 생략하는가. 해설은 요청마다 무엇을 보는지와 원칙 셋을 가르친다 |
| `az125` | `defense-in-depth` | 4지선다, 정답 위치 1 「상황 적용」 — 서비스를 쓰지 못하게 하려고 대량의 트래픽을 보내는 공격을 네트워크 가장자리에서 걸러 내는 것은 어느 계층의 일인가. 정답 경계. 오답 네트워크·컴퓨팅·애플리케이션(표기는 step 5 결과). 문제문에 「경계」를 쓰지 않는다 — 「가장자리」도 정답을 흘리면 다르게 쓴다. DDoS는 그 자리에서 푼다 |
| `az126` | `defense-in-depth` | 예/아니요, 정답 **예** 「원리 이해」 — 바깥 계층 하나가 뚫려도 그 안의 계층이 공격을 계속 막도록 설계하는 것이 이 모델의 뜻인가. 문제문이 정의에서 이름만 지운 꼴이 되지 않게 상황으로 쓴다 |

### 3. 도식

#### `azure-security-model.zero-trust` — `ZeroTrustDiagram`, JSON 키 `zero-trust`

- 물음형 제목 예: `회사 안에서 보낸 요청도 왜 확인할까?`
- 그릴 것: 그룹 `corp-network`(「회사 네트워크」) 안에 `inside-device`(「사내 기기」). 그룹 밖에 `outside-device`(「공용 네트워크의 기기」), `verify`(「요청 검증」), `app`(「앱」). 경로 `trusted`(`inside-device`→`app`), `to-verify-in`(`inside-device`→`verify`), `to-verify-out`(`outside-device`→`verify`), `verified`(`verify`→`app`).
- 시나리오:

  | id | label | 선명한 노드 | 보이는 경로 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|---|
  | `perimeter` | 경계 기반 | `inside-device`·`app` | `trusted` | 「안에 있으면 믿는다」 | 예전 방식은 회사 네트워크 안의 요청을 믿었다 |
  | `zero-trust` | 제로 트러스트 | 넷 모두 | `to-verify-in`·`to-verify-out`·`verified` | 「어디서 오든 확인」 | 위치와 상관없이 ID·기기 상태·위험을 보고 허용한다 |
  | `high-risk` | 위험이 높을 때 | `outside-device`·`verify` | `to-verify-out` | 「로그인 차단」 | 위험이 너무 높으면 앱까지 가지 못한다(근거 안에서) |

- 요점 테스트: `inside-device`는 `corp-network` 안, 나머지는 밖(두 배치). `zero-trust`에서 `trusted`가 보이지 않고 앱으로 들어가는 경로가 `verified` 하나다. `perimeter`에서 `verified`가 보이지 않는다. `high-risk`에서 `app`이 opacity `0.25`.

#### `azure-security-model.defense-in-depth` — `DefenseInDepthDiagram`, JSON 키 `defense-in-depth`

- 물음형 제목 예: `한 겹이 뚫리면 그다음은 무엇이 막을까?`
- 그릴 것: 노드 일곱 — `physical`·`identity`·`perimeter`·`network`·`compute`·`application`·`data`(라벨은 step 5 표기), 바깥에서 안으로. 세로형은 위에서 아래로 한 줄(높이가 길어도 된다). 가로형은 폭 440에 일곱이 한 줄로 들지 않으면 **두 줄(위 넷·아래 셋)**로 접고 경로를 꺾는다 — 라벨을 줄이지 않는다. 경로 `next-1`~`next-6`이 차례로 잇고 늘 보인다. 데이터 노드 곁에 곁말 「지키려는 것」은 늘 보인다.
- 시나리오:

  | id | label | 선명한 노드 | 보이는 곁말 | 캡션이 말할 것 |
  |---|---|---|---|---|
  | `ddos` | 대규모 공격 | `perimeter` | `perimeter` 곁 「DDoS 보호」 | 사용자가 서비스를 못 쓰게 되기 전에 경계에서 대규모 공격을 걸러 낸다 |
  | `identity` | 로그인 | `identity` | `identity` 곁 「SSO·다단계 인증」 | 필요한 만큼만 접근을 주고 로그인과 변경을 기록한다 |
  | `breach` | 한 계층이 뚫릴 때 | `compute`·`application`·`data` | `network` 곁 「이 계층이 뚫림」, `compute` 곁 「다음 계층이 막는다」 | 공격이 한 겹을 넘어도 안쪽 계층이 남아 늦추고 경고를 낸다 |

- 요점 테스트: 노드 일곱이 위 순서대로 경로로 이어진다(`next-1`의 끝이 `next-2`의 시작). `data`가 마지막이다. `ddos`에서 `perimeter`만 선명. `breach`에서 `physical`·`identity`·`perimeter`·`network`가 opacity `0.25`.

위 도식 설계는 출발점이다. 본문(출처 step 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 캡션·곁말의 사실은 그 개념 본문에 있어야 한다(ADR-036·038). 라벨은 본문에 쓰인 말과 같게 쓴다.

registry에 두 줄(개념 순서대로).

### 4. `official.md`의 「쓰일 곳」을 「쓰인 곳」으로 고친다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4·6~8)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 126개, 마지막 id는 `az126`, 예 32·아니요 32다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 출처 step summary가 「쓰지 않는다」로 정한 것을 지켰는가. 문항마다 guide.md 「문항」 11항(답을 흘리는 꼴)을 다시 본다.
3. `phases/105-azure-identity-security/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **DDoS Protection의 동작·종류, NSG·Azure Firewall의 동작을 다시 쓰지 마라.** 이유: `azure-network-protection`의 범위다. 계층의 예로 이름과 한 구절만 쓴다.
- **「제로 트러스트 제품을 산다」처럼 제품으로 쓰지 마라.** 이유: 공식 문서가 말하는 것은 보안 모델이다.
- **계층을 넷이나 여섯으로 줄이거나 합치지 마라.** 이유: 일곱이 Learn 단원의 값이고, 용어집의 네 계층 표현은 고쳐 쓴다(step 5의 G 항목).
