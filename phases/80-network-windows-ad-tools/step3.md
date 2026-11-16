# Step 3: forest-trust

## 배경

phase 80은 네트워크 과목의 `windows-ad`·`windows-admin-tools`를 만든다. 전체 계획·결정·공통 규칙은 `phases/80-network-windows-ad-tools/guide.md`에 있다.
**이 step은 `windows-ad`의 개념 둘(5 도메인·트리·포리스트, 6 트러스트)의 글·문항·도식을 만든다.** 6은 5에 딸린 개념이다. step 0이 확인한 개념 여섯의 마지막 step이다.

기출은 이 주제에서 트러스트를 가장 자주 묻는다(4회). 둘 이상의 도메인을 가진 조직에서 한 도메인의 사용자가 다른 도메인의 공유 자원에 접근하도록, 서로 다른 도메인 사이의 인증과 권한 부여를 위해 설정하는 것으로 트러스트를 고르게 하고
(오답은 도메인·트리·포리스트 — [기출 2024-05-19 #34]·[기출 2025-08-24 #34]), 그림 지문의 (A)로 트러스트를 고르게 한다(오답은 사이트·OU·도메인 컨트롤러 — [기출 2024-08-25 #30]·[기출 2026-08-02 #36], 지문이 추출본에 없다).

## 읽어야 할 파일

- **`phases/80-network-windows-ad-tools/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/80-network-windows-ad-tools/index.json`의 step 0 `summary`(도메인·트리·포리스트, 트러스트의 방향·전이성·저절로 만들어지는 트러스트·다른 포리스트와의 트러스트, 기출 판정, 한국어 이름)와 step 1·2 `summary`(「앞 개념에 고칠 것」, 문항 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 80 step 0)」 줄과 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1·2가 쓴 `windows-ad` 네 개념** — 특히 `active-directory`의 도메인·인증, `domain-controller`의 복제, `dns.domain-hierarchy`의 오른쪽이 위 단계인 이름 — 뜻을 맞춘다),
  `src/data/network/questions.json`, `src/data/network/visuals/windows-ad.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1·2가 만든 도식과 그 테스트, 선례 `DomainTreeDiagram`(도메인 이름의 나무)·`DirectoryTreeDiagram`(나무)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2024-05-19 #34], [기출 2025-08-24 #34], [기출 2024-08-25 #30], [기출 2026-08-02 #36] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-ad` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 5 | `windows-ad.domain-tree-forest` | 도메인·트리·포리스트 | — | **목록 개념**. 소개 문단 — AD DS가 도메인들을 묶는 세 단계의 구조가 있다는 것(step 0 결과대로). 항목(「글」의 항목 이름 규칙 (1)): **도메인**(domain — 같은 디렉터리 데이터베이스와 같은 정책을 쓰는 관리 단위, 이름은 DNS 이름 꼴 `example.com`), **트리**(tree — 이름이 이어지는 부모·자식 도메인의 묶음 — `example.com`과 그 아래 `sales.example.com`), **포리스트**(forest — 트리 하나 이상의 묶음이자 AD DS의 가장 바깥 경계, 같은 포리스트의 도메인들이 함께 쓰는 것은 step 0 결과대로 이름만 한 줄). 항목 뒤 문단: 이름이 이어지지 않는 트리 둘(`example.com`·`example.net`)이 한 포리스트에 들 수 있다는 것(step 0 결과대로), 도메인 이름을 DNS 이름처럼 오른쪽이 위 단계로 읽는다는 것(`dns.domain-hierarchy`와 뜻을 맞춘 한 줄 — `sales.example.com`의 부모가 `example.com`). **세 단계가 무엇이 다른지**(4절 — 무엇을 묶는지, 어디까지가 경계인지). 비유를 쓰면 무엇이 다른지 밝힌다(guide.md 「글」). 예시 이름은 문서의 예로 남겨 둔 이름이라고 처음 쓸 때 밝힌다 |
| 6 | `windows-ad.trust` | 트러스트 | `windows-ad.domain-tree-forest` | **트러스트**가 한 도메인이 다른 도메인의 인증을 믿어 그 도메인 사용자가 자기 자원에 접근할 수 있게 하는 관계라는 것(step 0 결과대로). **신뢰하는 도메인**(trusting — 자원이 있는 쪽)과 **신뢰받는 도메인**(trusted — 계정이 있는 쪽 — 한국어 이름은 step 0 결과대로), **방향**(단방향·양방향), **전이성**(전이·비전이)을 차례로. 계산 예를 단계대로 — `example.com`이 `example.org`를 단방향으로 신뢰하면 ① `example.org`의 사용자가 로그온하면 `example.org`의 도메인 컨트롤러가 확인하고 ② `example.com`은 그 확인을 믿으므로 ③ `example.com`의 자원에 사용 권한을 받은 `example.org` 사용자가 접근할 수 있고 ④ 거꾸로 `example.com`의 사용자는 `example.org`의 자원에 접근할 수 없다(방향 규칙은 step 0 결과대로 확인하고, 다르면 그 결과를 따른다 — 「예시 값」). 같은 포리스트의 부모·자식 도메인 사이에 저절로 만들어지는 트러스트와 그 성질(step 0 결과대로 — 예: `example.com`과 `sales.example.com`), 그래서 같은 포리스트의 도메인끼리는 서로 인증이 이어진다는 것(전이 — `sales.example.com`과 `example.net`), 다른 포리스트와 잇는 트러스트의 이름(step 0 결과대로 한 줄). 트러스트는 인증을 받아들이게 할 뿐 자원의 사용 권한은 따로 준다(step 0 결과대로). **단방향과 양방향, 전이와 비전이가 무엇이 다른지**(4절). 트러스트를 「도메인·트리·포리스트」와 다른 종류의 것(구조가 아니라 구조 사이의 관계)이라고 밝힌다 — 기출의 오답이 구조 이름이다 |

### 2. 문항 — `src/data/network/questions.json`에 `n261`~`n263`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n261` | `domain-tree-forest` | 4지선다 「개념 비교」 — 본문과 다른 장면(예: 한 회사가 `example.org`를 첫 도메인으로 쓰다가 그 아래 `hr.example.org`를 더 만들었고, 따로 인수한 회사의 `example.net`도 같은 AD DS 구조에 넣었다)을 주고 이 구조를 바르게 설명한 것을 고르게 한다. **보기는 구조 이름이 아니라 설명 문장으로**(정답 예: 셋은 한 포리스트에 들고, `example.org`와 `hr.example.org`는 같은 트리다. 오답은 흔한 혼동 — 이름이 다른 `example.net`은 같은 포리스트에 들 수 없다, `hr.example.org`는 `example.org`와 다른 트리다, 트리 하나가 포리스트 여럿을 묶는다 등 — step 0 결과로 정말 틀렸는지 따진다). 기출 묶음(도메인·트리·포리스트·트러스트)을 보기로 쓰지 않는다. **정답 위치 2** |
| `n262` | `trust` | 4지선다 「상황 적용」(방향 계산) — 본문과 다른 이름의 장면(예: `example.net` 도메인이 `example.org` 도메인을 단방향으로 신뢰하고, 자원의 사용 권한은 알맞게 주었다)을 주고 어느 쪽 사용자가 어느 쪽 자원에 접근할 수 있는지 고르게 한다. 정답 하나, 오답은 방향을 거꾸로 읽은 것·양쪽 모두·어느 쪽도 아님(사용 권한은 주었다는 조건 때문에 틀린다). 방향 규칙은 step 0 결과대로 손으로 다시 따진다. **정답 위치 3** |
| `n263` | `trust` | 예/아니요 「원인과 결과」 — **예** 쪽으로 세운다. 예: 같은 포리스트에서 `sales.example.org`와 `hr.example.org`가 모두 `example.org`의 자식 도메인이라면, 두 자식 도메인 사이에 트러스트를 따로 만들지 않아도 한쪽 사용자가 다른 쪽에서 인증을 받을 수 있나요?(예 — 저절로 만들어지는 부모·자식 트러스트가 전이되기 때문이다, step 0 결과대로 — 결과가 다르면 방향을 바꾸고 균형을 다시 맞춘다). 해설은 전이성과, 그래도 자원의 사용 권한은 따로 줘야 한다는 것을 가르친다. n262와 다른 것(방향이 아니라 전이)을 묻는다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 52·아니요 51, 정답 위치 40/40/40/40.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `windows-ad.domain-tree-forest` — `AdForestStructureDiagram`, JSON 키 `ad-forest-structure`

- 물음형 제목 예: `도메인·트리·포리스트는 무엇을 묶을까?`
- 그릴 것: 포리스트(가장 바깥 그룹 박스) 안에 트리 둘(그룹 박스) — 첫 트리에 `example.com`과 그 아래 `sales.example.com`(부모 → 자식 직교 경로), 둘째 트리에 `example.net`. 그룹 박스 안의 그룹 박스는 라벨 영역이 겹치지 않게 둔다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `domain` | 도메인 | `example.com` 하나 | 도메인은 같은 디렉터리와 정책을 쓰는 관리 단위다 |
  | `tree` | 트리 | `example.com`·`sales.example.com`과 그 사이 경로 | 이름이 이어지는 부모·자식 도메인이 한 트리를 이룬다 |
  | `forest` | 포리스트 | 세 도메인 모두 | 이름이 다른 트리도 한 포리스트에 들고, 포리스트가 가장 바깥 경계다 |

- 요점 테스트: `tree`에서 선명한 도메인 노드의 라벨이 모두 `example.com`으로 끝나고 `example.net`은 흐리다. `forest`에서 선명한 도메인 노드가 셋이다. 그룹 박스는 흐려지지 않는다.

#### 3-2. `windows-ad.trust` — `DomainTrustDiagram`, JSON 키 `domain-trust`

- 물음형 제목 예: `트러스트를 맺으면 누가 어느 쪽 자원을 쓸까?`
- 그릴 것: 도메인 둘 — `example.com`(자원 노드를 가진 그룹 박스)과 `example.org`(사용자 노드를 가진 그룹 박스). **신뢰 경로**(신뢰하는 도메인 → 신뢰받는 도메인)와 **접근 경로**(사용자 → 자원)를 서로 다른 경로로 그리고, 곁말로 어느 것이 신뢰이고 어느 것이 접근인지 밝힌다(본문의 말). 전이를 보이려면 `sales.example.com`·`example.com`·`example.net`을 따로 둔 줄(본문에 쓴 예만).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `one-way` | 단방향 | 두 도메인, 신뢰 경로 하나, 접근 경로 하나 | 신뢰의 방향과 접근의 방향이 반대다(step 0 결과대로 — 본문의 말) |
  | `two-way` | 양방향 | 두 도메인, 신뢰 경로 둘, 접근 경로 둘 | 양방향이면 두 도메인의 사용자가 서로의 자원에 접근할 수 있다 |
  | `transitive` | 전이 | `sales.example.com`·`example.com`·`example.net`과 그 사이 트러스트 | 같은 포리스트에서는 트러스트가 이어져 직접 맺지 않은 도메인끼리도 인증이 이어진다 |

  본문이 양방향이나 전이를 쓰지 않았으면 그 시나리오를 뺀다.
- 요점 테스트: `one-way`에서 보이는 신뢰 경로의 시작 노드가 `example.com` 쪽이고 끝이 `example.org` 쪽이며, 보이는 접근 경로는 `example.org`의 사용자에서 시작해 `example.com`의 자원에서 끝난다(방향은 step 0 결과의 규칙과 같게 — 본문과 테스트가 같은 규칙을 쓴다). `two-way`에서 보이는 접근 경로가 둘이다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~7, 9~13)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 263개, 마지막 id는 `n263`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가. 트러스트의 방향을 본문·도식·문항·해설이 모두 같은 규칙으로 말하는가(한 곳이라도 거꾸로면 고친다).
3. n261·n262의 보기 넷을 step 0 결과로 하나씩 따져 정답이 하나뿐인지 본다. n262는 방향을 한 단계씩 손으로 다시 따진다.
4. 지금까지 쓴 `windows-ad` 여섯 개념을 처음부터 통독하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다.
5. `phases/80-network-windows-ad-tools/index.json`의 step 3을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 7~22를 만들지 마라.** 이유: step 5~13의 범위다. OU·사이트는 이 step에서 쓰지 않는다(기출의 오답 보기여도).
- **step 1·2의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 어긋남을 찾으면 summary에 적는다.
- **트러스트 만드는 마법사의 차례, 숏컷 트러스트·영역 트러스트 같은 유형 전체, 선택적 인증, SID 필터링을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **step 0이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
