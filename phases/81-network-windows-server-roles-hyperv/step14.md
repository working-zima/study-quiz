# Step 14: base-images-readthrough

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다. 전체 계획·결정·공통 규칙은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
**이 step은 `windows-hyperv`의 마지막 개념(23 컨테이너 기본 이미지)의 글·문항·도식을 만들고, 주제 `windows-hyperv` 전체(9개념)를 통독한다.** 23은 22 「Windows 컨테이너」(step 13)에 딸린 개념이다.
쓰기를 마친 뒤 주제 전체를 통독하는 데 시간을 쓴다. 이 phase의 마지막 step이다.

기출은 Windows 컨테이너를 묻는 세 문항([기출 2024-02-25 #44]·[기출 2025-05-25 #38]·[기출 2026-05-17 #29])에서 Nano Server를 오답 보기로 둔다 — Nano Server가 무엇인지(지금은 컨테이너의 기본 이미지)를 정확히 가르친다.

## 읽어야 할 파일

- **`phases/81-network-windows-server-roles-hyperv/guide.md` 전체** — **이 문서를 따른다**
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 9 `summary`(기본 이미지의 목록·이름·쓰임·크기·이미지 이름 꼴·판 호환성·Nano Server의 지금 자리와 판, 기출 판정, E 번호)와 step 0의 「Features Removed or No Longer Developed」 줄(Nano Server), step 10~13 `summary`
- **`docs/WRITING_GUIDE.md` 전체**, `docs/ADR.md`의 step 10과 같은 ADR들, `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(「(phase 81 step 9)」 줄과 항목), `docs/source/network/exam-notes.md`(phase 81이 더한 E)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json` — **`windows-hyperv`의 앞 개념 여덟(step 10~13)**, 특히 `windows-containers`의 컨테이너 이미지·두 격리 방식 문장
- `src/data/network/questions.json`, `src/data/network/visuals/windows-hyperv.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례: `ContainerIsolationDiagram`(step 13), `ExtensionChainDiagram`·`ShellLayerDiagram`(쌓인 층)과 그 테스트, `src/components/diagrams/registry.ts`
- 기출 [기출 2024-02-25 #44], [기출 2025-05-25 #38], [기출 2026-05-17 #29] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `windows-hyperv` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 23 | `windows-hyperv.container-base-images` | 컨테이너 기본 이미지 | `windows-hyperv.windows-containers` | **목록 개념**. 소개 문단 — 기본 이미지의 뜻(step 9 결과대로 — 컨테이너 이미지가 층을 쌓아 만들어진다는 것은 근거가 있을 때만). 항목은 step 9가 확인한 기본 이미지(이름은 step 9의 표기 — 「글」의 항목 이름 규칙 (1): `- **Nano Server**는 …`). 항목마다 무엇에 맞는지와 크기의 차이를 한 문장(step 9 결과대로 — 문서의 설명을 번역해 옮기지 않는다). 항목 뒤 문단: Nano Server의 지금 자리와 판(step 9 결과대로 — 호스트에 설치하는 운영 체제가 아니라 기본 이미지로만 나온다는 것, 그래서 컨테이너 자체의 이름이 아니라는 것), 프로세스 격리의 판 호환성(step 9 결과대로 한 줄), 이미지를 받는 곳과 이름 꼴(step 9 결과대로 한 줄 — 이미지 이름은 백틱). **Nano Server와 Server Core**(4절). 예: Nano Server 기본 이미지 위에 응용 프로그램을 얹은 이미지(「예시 값」 — 이미지 이름은 step 9가 확인한 꼴만 쓰고, 지어낸 태그를 쓰지 않는다) |

### 2. 문항 — `src/data/network/questions.json`에 `n312`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n312` | `container-base-images` | 예/아니요 「개념 확인」 — **아니요** 쪽으로 세운다. 예: 새 물리 서버에 Windows Server 2022를 설치할 때 설치 옵션으로 Nano Server를 골라, 그 서버의 운영 체제로 쓸 수 있나요?(아니요 — 지금 Nano Server는 컨테이너 기본 이미지로만 나온다, step 9 결과대로 — 판을 문제문에 준다). 해설은 기본 이미지들의 쓰임과 Nano Server가 Windows 컨테이너 자체의 이름이 아니라는 것을 가르친다. step 9가 Nano Server의 지금 자리를 확인하지 못했으면 step 9가 확인한 다른 사실로 **아니요**가 되는 주장을 세운다 |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 62·아니요 62, 정답 위치 47/47/47/47(이 phase의 끝 값).
문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `container-base-images` — `BaseImageChoiceDiagram`, JSON 키 `base-image-choice`

- 물음형 제목 예: `컨테이너 이미지는 어떤 기본 이미지 위에 만들까?`
- 그릴 것: 기본 이미지 노드들(step 9가 확인한 것 — 세로로 쌓되 280 폭 한 줄에 넷 이상 두지 마라)과 그 위에 얹는 응용 프로그램 층 노드, 그리고 컨테이너 노드(이미지로 만든 것). 크기의 차이는 곁말(본문의 말)로 — 막대 길이로 수치를 지어 보이지 않는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `nano` | Nano Server | Nano Server 노드·응용 프로그램 층·컨테이너와 그 경로 | 가장 작은 기본 이미지 위에 응용 프로그램을 얹는다(본문의 쓰임) |
  | `servercore` | Server Core | Server Core 노드·응용 프로그램 층·컨테이너와 그 경로 | 전통적인 Windows Server 응용 프로그램에 맞는 기본 이미지다(본문의 쓰임) |

  (본문이 다른 기본 이미지도 들면 시나리오를 더해도 된다 — summary에 적는다.)
- 요점 테스트: 두 시나리오에서 선명한 기본 이미지 노드가 다르고, 보이는 경로가 각자의 기본 이미지에서 응용 프로그램 층으로 간다. 어느 시나리오에서도 Nano Server 노드가 「호스트」·「운영 체제 설치」 노드로 이어지는 경로가 없다(그런 노드를 두지 않아도 된다).

위 도식 설계는 출발점이다. 본문(step 9 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

### 4. 주제 `windows-hyperv` 통독

쓰기를 마친 뒤 **주제 `windows-hyperv`의 아홉 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이, 여러 곳이 같은 말을 해야 하는 곳 — 예: 가상 컴퓨터·검사점·마이그레이션의 한국어 이름, 가용성의 말, 커널의 풀이)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다. 도식 아홉 개의 문구도 함께 읽는다.
`windows-server-roles` 쪽과 겹치는 말(서버 역할, `Install-WindowsFeature`, 역할 서비스)이 두 주제에서 어긋나지 않는지도 본다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~3, 5~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 312개, 마지막 id는 `n312`이고, 예/아니요 예 62·아니요 62, 정답 위치 47/47/47/47이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념을 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 기본 이미지 설명이 문서 문장의 번역이 아니라 자기 말인가.
3. 주제 `windows-hyperv`의 아홉 개념을 통독한다(「작업」 4). 도식 아홉 개의 문구도 함께 읽는다.
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 14를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(「앞 개념에 고칠 것」에 통독 결과).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **이 phase의 표에 없는 개념을 만들지 마라.** 이유: guide.md의 개념 23개가 범위다.
- **이미지 태그·판 목록 전체, Dockerfile, 이미지 크기의 수치를 지어 쓰지 마라.** 이유: 기출이 묻지 않고, 수치는 판마다 바뀐다(ADR-059 「범위」). 크기는 문서가 말하는 비교만.
- **step 10~13의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
