# Step 6: file-attributes

## 배경

phase 75는 네트워크 과목의 `linux-filesystem`·`linux-permissions`·`linux-shell`을 만든다. 전체 계획·결정·공통 규칙은 `phases/75-network-linux-basics/guide.md`에 있다.
**이 step은 주제 `linux-filesystem`의 마지막 개념(11 파일 속성)의 글·문항·도식을 함께 만들고, 이 주제를 마무리한다.**

기출은 관리자가 지우려 해도 지워지지 않는 파일의 속성을 확인하는 명령(`lsattr`)을 물었다.

## 읽어야 할 파일

- **`phases/75-network-linux-basics/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/75-network-linux-basics/index.json`의 step 0~5 `summary`(특히 step 0의 k)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 75)」 항목의 chattr(1)·lsattr(1)·capabilities(7)), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-filesystem` 주제(앞 step이 쓴 개념 10개 — **이미 푼 낱말은 다시 풀지 않는다**), `src/data/network/questions.json`, `src/data/network/visuals/linux-filesystem.json`
- 앞 step의 도식과 그 테스트, `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-filesystem` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `linux-filesystem.file-attributes` | 파일 속성 | — | 권한(누가 읽고 쓰고 실행할 수 있는지 정한 것 — 이 주제에서 처음이면 한 줄)과는 따로, `ext4` 같은 Linux 파일 시스템이 파일에 붙이는 표시가 파일 속성이다. `chattr`로 붙이고(`+`) 떼고(`-`), `lsattr`로 본다. **`i` 속성**: 붙은 파일은 고치기·지우기·이름 바꾸기가 막히고(근거가 말하는 만큼), 관리자 root도 먼저 속성을 떼야 지울 수 있다. `i`를 붙이고 떼는 것은 root(그 권한을 가진 프로세스)만 할 수 있다. 명령과 결과를 함께 보인다 — 예 파일 `notice.txt`(guide.md 「예시 값」에 더한 이름표 — 예로 붙인 이름이라고 밝힌다)에 `chattr +i notice.txt`, `lsattr notice.txt`의 출력에서 `i`가 보이는 자리(출력 꼴은 step 0이 확인한 대로 — 확인하지 못했으면 「출력에 `i`가 보인다」로만 쓴다), root가 `rm`(파일을 지우는 명령 — 한 줄)으로 지우려 하면 거부되고 `chattr -i` 뒤에야 지워지는 차례. 권한과 무엇이 다른지(4절) — root는 보통 권한 검사를 받지 않지만 `i` 속성에는 막힌다(step 0 결과의 근거대로). 다른 속성(`a`)을 하나 더 들지는 step 0 결과대로 |

### 2. 문항 — `n123`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n123` | `file-attributes` | 4지선다 「상황 적용」 — 중요한 파일(예 `config.txt`)을 관리자 root조차 실수로 고치거나 지우지 못하게 막으려면 어떤 명령을 쓰는가 → `chattr +i config.txt`. 오답은 같은 목적에 그럴듯해 보이는 명령 — 모든 사용자의 쓰기 권한을 빼는 `chmod`(root는 권한 검사를 받지 않는다), 소유자를 root로 바꾸는 `chown`(root는 소유자와 관계없이 지운다), 속성을 보기만 하는 `lsattr`. `chmod`·`chown`이 무엇을 하는지 문제문이나 보기에서 풀이 없이 전제하지 않는다 — 보기를 「모든 사용자의 쓰기 권한을 뺀다(`chmod a-w config.txt`)」처럼 하는 일과 함께 쓴다. 정답 위치는 균형대로. 해설은 넷이 각각 무엇을 하는지와 `i` 속성이 권한과 다른 점을 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 기출의 `file`·`stat`·`lsattr`·`lsblk` 묶음과 `/root/passwd` 상황을 쓰지 않는다). 이 문항은 4지선다이므로 예/아니요 균형은 그대로이고, 정답 위치의 균형을 지킨다.

### 3. 도식 — `src/data/network/visuals/linux-filesystem.json`에 더한다

#### 3-1. `linux-filesystem.file-attributes` — `ImmutableAttributeDiagram`, JSON 키 `immutable-attribute`

- 물음형 제목 예: `root도 지우지 못하는 파일은 어떻게 만들까?`
- 그릴 것: 노드 `root`, `notice.txt`, 명령 노드 `rm`·`chattr +i`·`lsattr`. 시나리오 경로 — `rm`에서 `notice.txt`로(지워짐), `chattr +i`에서 `notice.txt`로, `lsattr`에서 `notice.txt`로. `root`에서 `rm`으로 가는 경로는 「root가 실행한다」는 뜻으로 시나리오 `plain`·`immutable`에서 보인다.
  막힌 것은 색이 아니라 곁말(「거부」)과 사라지는 경로로 보인다(guide.md 「색」).
- 시나리오:

  | id | label | 선명한 것 | 경로·곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `plain` | 속성이 없을 때 | `root`·`rm`·`notice.txt` | `root` → `rm` → `notice.txt`. 속성이 없으면 root는 권한과 관계없이 파일을 지울 수 있다 |
  | `immutable` | `i`를 붙였을 때 | `root`·`rm`·`chattr +i`·`notice.txt` | `chattr +i` → `notice.txt`, `root` → `rm`. `rm`에서 `notice.txt`로 가는 경로는 보이지 않고 곁말 「거부」. `i`가 붙으면 root도 지울 수 없다 |
  | `check` | 속성 보기 | `lsattr`·`notice.txt` | `lsattr` → `notice.txt`, 곁말로 붙은 속성 `i`. 떼려면 root가 `chattr -i`를 실행한다 |

- 요점 테스트: `rm`에서 `notice.txt`로 가는 경로가 `plain`에서는 보이고 `immutable`에서는 보이지 않는다. `immutable`의 보이는 곁말에 「거부」가 있다. `check`에서 `root`와 `rm`은 흐리다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~6, 8~11, 13~17)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 123개, 마지막 id는 `n123`이다. `linux-filesystem`의 개념은 11개, 문항은 13개(n111~n123)다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. **주제를 마무리하며 통독한다** — `linux-filesystem`의 개념 11개를 처음부터 끝까지 처음 배우는 사람의 눈으로 읽고, 풀이 없이 처음 나오는 낱말과, 같은 낱말을 두 번 푼 곳을 세어 summary에 적는다(고치지 않는다 — 이 step의 개념이 아니면).
   기출 18문항이 묻는 사실(guide.md 표의 「다룰 것」에 적힌 기출 표기)이 모두 본문에 있는지 하나씩 대조해 표로 적는다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」의 질문으로 다시 읽는다. chattr(1)의 `i` 설명을 옮기지 않았는가.
4. `phases/75-network-linux-basics/index.json`의 step 6을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」과 위 2의 통독 결과.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **권한 비트(`rwx`)·`chmod`·`chown`을 이 주제에서 자세히 쓰지 마라.** 이유: `linux-permissions`(step 8~11)의 범위다. 여기서는 「권한과 따로」를 말할 만큼만 한 줄로 푼다.
- **속성 목록을 늘어놓지 마라.** 이유: 기출은 `i`만 묻는다. 하나 더 든다면 step 0이 확인한 `a` 하나까지다.
- **앞 step의 개념·문항·도식을 고치지 마라.** 이유: 통독에서 찾은 것은 summary에 적고, 사용자가 판단한다.
