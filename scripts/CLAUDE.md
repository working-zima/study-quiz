# scripts/

harness 실행기, 에이전트 훅, 데이터 가드레일·감사 도구가 있다. 파일마다 쓰임과 사용법이 **머리 주석**에 있으니 고치기 전에 먼저 읽는다.

## execute.py — harness step 실행기

`python3 scripts/execute.py <phase 폴더> [--push] [--agent claude|codex] [--max-steps N]`. step 문서를 쓰는 법은 `.claude/commands/harness.md`에 있다.

- `feat-{phase}` 브랜치로 옮긴 뒤(없으면 현재 브랜치에서 판다) `phases/<phase>/index.json`의 `pending` step을 순서대로 실행한다.
  그래서 `develop`에서 실행한다(루트 「Git 전략」).
- 매 step 프롬프트에 루트 `CLAUDE.md`와 `docs/*.md`를 넣는다(`_load_guardrails`). **하위 디렉토리의 `CLAUDE.md`는 넣지 않는다.**
- step이 `completed`가 되면 `_commit_step`이 `git add -A`로 코드 커밋(`feat(…)`)과 출력 커밋(`chore(…)`)을 따로 만든다.
  그래서 에이전트마다 worktree를 하나씩 둔다(루트 「에이전트를 여러 개 동시에 돌릴 때」).
- 한 step을 세 번까지 다시 시도하고, 그래도 실패하면 `error`로 멈춘다. `blocked`면 바로 멈춘다.
- `--max-steps N`은 step N개를 실행한 뒤 멈춰 검토하게 한다. `--push`는 phase가 끝난 뒤에만 push한다.
- 실행기 자체의 테스트는 `test_execute.py`다.

## hooks/ — 에이전트 훅

`.claude/settings.json`(Claude)과 `.codex/hooks.json`(Codex)이 부른다. 이름이 `codex-`로 시작해도 Claude 쪽이 함께 쓰는 것이 있다.

| 훅 | 언제·누가 | 무엇을 막는가 |
|---|---|---|
| `codex-block-dangerous.sh` | Bash 실행 전, 둘 다 | `rm -rf`·`git push --force`·`git reset --hard`·`DROP TABLE` |
| `tdd-guard.sh` | Edit·Write 전, Claude | 테스트 파일이 아직 없는 구현 코드(`.ts`·`.tsx`·`.js`·`.jsx`) 편집. 테스트·타입·설정 파일과 `.md`·`.json`은 통과 |
| `codex-tdd-guard.sh` | Edit·Write·apply_patch 전, Codex | 패치에서 대상 파일을 뽑아 `tdd-guard.sh`에 넘긴다 |
| `codex-verify-gate.sh` | 멈추기 전, 둘 다 | `lint`·`build`·`test` 중 하나라도 실패하면 멈추지 못하게 하고 한 번 더 고치게 한다 |

## 데이터 가드레일·감사 — 손으로 돌린다

`npm test`·`npm run build`에 엮여 있지 않다. 대상은 AWS 과목 데이터(`src/data/aws/`)와 그 원본이다.

| 스크립트 | 무엇 | 근거 |
|---|---|---|
| `check-structure.mjs` + `topics-baseline.json` | 개념 id·name·parentId·순서, 주제 메타데이터, 문항 파일 해시가 스냅샷과 같은가 | ADR-009·ADR-041, ARCHITECTURE 「데이터 모델」 |
| `sync-baseline.mjs` | 스냅샷의 `name`·`questionsSha256`만 갱신한다. 구조가 달라져 있으면 거부한다 | ADR-041 |
| `coverage.mjs` | 개념마다 문항이 붙어 있는가 | ADR-026 |
| `check-verbatim.mjs` | 개념 본문이 원본을 그대로 옮겼는가. 원본이 없으면 건너뛴다 | ADR-009·ADR-025 |
| `check-keywords.mjs`·`encrypt-keywords.mjs` | 키워드 평문 검사와 암호화 | ADR-040 |
| `content-audit.mjs`·`explanation-audit.mjs` | 개념 제목·문항 문구 감사, 해설 길이 감사 | ADR-030·ADR-027 |
| `field-diff.mjs`·`notation-diff.mjs` | 기준 커밋과 필드별 대조, 표기 치환만 바뀌었는지 대조 | 각 머리 주석 |
| `extract-pdf.py`·`extract-dump.py`·`collect-gaps.py`·`concept-index.py` | 원본 PDF·덤프 추출과 정리 | ADR-009·ADR-021 |

지난 phase 전용 도구(`phases/<phase>/tools/`)는 그 phase의 기록이라 고치지 않는다. 지금도 쓰는 도식 교차 검사기
`phases/38-service-diagrams/tools/check-path-crossings.mjs`는 `src/components/diagrams/CLAUDE.md`를 본다.
