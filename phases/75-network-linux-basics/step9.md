# Step 9: permission-string

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-permissions`의 개념 둘(14 권한 문자열, 15 파일 종류 문자)의 글·문항·도식을 함께 만든다.** 권한 문자열은 새 머리 개념이고, 파일 종류 문자는 거기 딸린 목록 개념이다.

기출은 권한 문자열 `-rwxr-x--x`를 부류마다 읽는 문항을 두 번, `ls -l` 첫 글자 `-`의 뜻(일반 파일)을 물었다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 7·8 `summary`(특히 step 7의 c·d)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75 step 7)」 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-permissions` 주제(step 8이 쓴 두 개념 — **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-permissions.json`
- step 8이 만든 `PermissionClassesDiagram`·`RwxMeaningDiagram`과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들 — 글자열을 덩어리로 끊는 것은 `NetworkHostPartsDiagram`), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-permissions` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 14 | `linux-permissions.permission-string` | 권한 문자열 | — | `ls -l`(디렉터리 안의 파일을 자세히 보여 주는 명령 — 한 줄)이 파일마다 보여 주는 한 줄의 예를 보인다 — `report.txt`의 줄(링크 수·크기·날짜는 예시 값이고 그렇게 밝힌다, 칸의 차례는 step 7 결과대로). 그 첫 칸 10글자 `-rw-r--r--`를 덩어리로 끊어 읽는 법을 단계대로 — 첫 글자(파일 종류), 다음 세 글자씩 소유자·그룹·그 밖, 각 자리의 차례 `r`·`w`·`x`와 없으면 `-`. 앞 개념의 세 부류·세 권한과 이어 쓴다. 디렉터리 `docs`의 `drwxr-xr-x`도 한 번 읽어 보인다(첫 글자 `d`는 한 줄 — 자세히는 쓰지 않는다) |
| 15 | `linux-permissions.file-type-char` | 파일 종류 문자 | `linux-permissions.permission-string` | **목록 개념**. 소개 문단: 권한 문자열의 첫 글자는 그 이름이 어떤 종류의 파일인지 알려 준다. 항목 다섯 — `- **일반 파일**(`-`)은 …`, `- **디렉터리**(`d`)는 …`, `- **심볼릭 링크**(`l`)는 …`, `- **블록 장치**(`b`)는 …`, `- **문자 장치**(`c`)는 …`(guide.md 「글」의 항목 이름 규칙 (2)). 항목마다 무엇인지 한 문장과 예(일반 파일 `report.txt`, 디렉터리 `docs`, 심볼릭 링크 `latest` → `report.txt`, 블록 장치 디스크 `/dev/sda`, 문자 장치는 step 7이 확인한 예 — 없으면 예 없이). 장치 파일을 한 줄로 푼다. 항목 뒤 문단: **하드 링크**는 같은 파일에 이름을 하나 더 붙인 것이라 따로 된 종류가 없고 원래 파일의 종류로 보인다 — `report.txt`에 하드 링크 `report2.txt`를 만들면 둘 다 `-`. 심볼릭 링크와 무엇이 다른지(4절). `p`·`s`는 step 7 결과대로 |

### 2. 문항 — `n126`~`n127`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n126` | `permission-string` | 4지선다 「원리 이해」 — 본문 예(`-rw-r--r--`·`drwxr-xr-x`)와 기출(`-rwxr-x--x`)과 다른 권한 문자열(예 `-rw-rw-r--`나 `-rwxr-----`) 하나를 주고, 정한 부류(예: 그룹에 속한 사람)가 그 파일로 할 수 있는 것을 고르게 한다. 오답은 흔한 잘못 읽기에서 — 부류의 덩어리를 한 칸 밀려 읽은 결과, 첫 글자를 소유자 권한으로 센 결과, 다른 부류의 권한. 정답 위치는 균형대로. 해설은 문자열을 덩어리로 끊어 단계대로 읽는다 |
| `n127` | `file-type-char` | 예/아니요 「오해 바로잡기」 — `ls -l`로 볼 때, 하드 링크로 만든 이름은 원래 파일과 같은 종류 글자(일반 파일이면 `-`)로 보이는가(예). step 8이 끝난 뒤의 균형(계획대로면 예 22·아니요 23)에서 **예** 쪽으로 세운다. 이름은 본문과 다르게(예 `plan.txt`와 그 하드 링크 `plan-copy.txt`). 해설은 하드 링크와 심볼릭 링크(`l`)의 차이를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 「파일 종류 넷」 보기 묶음과 `-rwxr-x--x` 설명 넷을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식 — `src/data/network/visuals/linux-permissions.json`에 더한다

#### 3-1. `linux-permissions.permission-string` — `PermissionStringDiagram`, JSON 키 `permission-string`

- 물음형 제목 예: `-rw-r--r--는 어떻게 읽을까?`
- 그릴 것: `-rw-r--r--`를 덩어리 노드 넷으로 — `-` | `rw-` | `r--` | `r--`(guide.md 「글자열 칸」). 덩어리 위나 아래에 무엇의 자리인지(`종류`·`소유자`·`그룹`·`그 밖`)를 그룹 라벨이나 곁말로. 시나리오마다 그 덩어리의 뜻을 곁말로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `type` | 종류 | `-` | 첫 글자는 파일의 종류 — `-`는 일반 파일 |
  | `owner` | 소유자 | `rw-` | 소유자는 읽기·쓰기를 할 수 있고 실행은 못 한다 |
  | `group` | 그룹 | 그룹의 `r--` | 그룹에 든 사용자는 읽기만 |
  | `others` | 그 밖 | 그 밖의 `r--` | 그 밖의 사용자도 읽기만 |

- 요점 테스트: 네 노드의 라벨을 차례로 이으면 `-rw-r--r--`다. 시나리오마다 선명한 노드가 정확히 하나이고 서로 다르다. `owner`의 보이는 곁말에 「읽기」와 「쓰기」가 있고 「실행」을 할 수 있다고 말하지 않는다.

#### 3-2. `linux-permissions.file-type-char` — `FileTypeCharDiagram`, JSON 키 `file-type-char`

- 물음형 제목 예: `첫 글자만 보고 무엇인지 알 수 있을까?`
- 그릴 것: 표 모양 줄 다섯 — 줄마다 종류 글자 노드와 이름 노드(`-` `report.txt`, `-` `report2.txt`, `l` `latest`, `d` `docs`, `b` `sda`). 장치의 이름은 본문이 쓴 대로(`/dev/sda`를 쓰면 라벨도). 시나리오 경로 — `latest`에서 `report.txt`로(가리킨다).
- 시나리오:

  | id | label | 선명한 것 | 경로·곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `hard-link` | 하드 링크 | `report.txt`·`report2.txt` 두 줄 | 곁말 「같은 파일의 두 이름」. 하드 링크는 따로 된 종류가 없어 둘 다 `-` |
  | `symlink` | 심볼릭 링크 | `latest` 줄·`report.txt` 줄 | `latest` → `report.txt`. 심볼릭 링크는 `l`로 보이고 다른 파일의 경로를 담는다 |
  | `others` | 디렉터리와 장치 | `docs` 줄·`sda` 줄 | 디렉터리는 `d`, 디스크 같은 블록 장치는 `b` |

- 요점 테스트: `hard-link`의 선명한 두 줄의 종류 글자 노드 라벨이 모두 `-`다. `symlink`에서 보이는 경로가 `latest` 줄에서 시작해 `report.txt` 줄에서 끝나고, `latest` 줄의 종류 글자가 `l`이다. `others`에서 `-` 줄은 모두 흐리다.

위 도식 설계는 출발점이다. 본문(step 7 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 127개, 마지막 id는 `n127`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. `permission-string`은 `parentId`가 없고, `file-type-char`는 `parentId`가 `linux-permissions.permission-string`이며 바로 뒤에 있는지 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 본문·문항·도식의 권한 문자열을 한 글자씩 다시 읽어 서로 맞는지 본다. `ls -l` 한 줄의 칸 차례가 step 7 결과와 같은가.
4. `phases/75-network-linux-basics/index.json`의 step 9를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **8진수(`644`)를 이 step에서 계산하지 마라.** 이유: step 10의 `octal-mode`가 쓴다. 권한 문자열을 수로 바꾸는 말이 필요하면 한 줄 풀이로 그친다.
- **`s`·`t`(특수 권한) 글자와 문자열 끝의 `+`·`.`(ACL·SELinux 표시)를 쓰지 마라.** 이유: 기출이 묻지 않는다.
- **`ln`의 옵션을 늘어놓지 마라.** 이유: 하드 링크·심볼릭 링크는 종류 글자를 가르는 데만 쓴다. `ln`·`ln -s`의 꼴은 step 7이 확인했으면 한 줄까지.
