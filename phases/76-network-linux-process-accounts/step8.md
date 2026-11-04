# Step 8: shutdown-commands

## 배경

phase 76은 네트워크 과목의 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획·결정·공통 규칙은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
**이 step은 주제 `linux-process-boot`의 마지막 개념(15 시스템을 끄고 다시 시작하는 명령)의 글·문항·도식을 함께 만들고, 이 주제를 마무리한다.** 15는 `runlevel`에 딸린 개념이다.

기출은 서버를 끄려 할 때 끄는 명령이 아닌 것(`init 6`)을 고르게 하고(맞는 것으로 `shutdown -h now`·`poweroff`·`halt`를 둔다), `init`으로 재부팅하는 번호(6)를 묻는다.

## 읽어야 할 파일

- **`phases/76-network-linux-process-accounts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/76-network-linux-process-accounts/index.json`의 step 0~7 `summary`(특히 step 0의 o와 `halt`의 E 항목 판정)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 76)」 항목의 shutdown(8)·halt(8)·telinit(8)), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-process-boot` 주제(앞 step이 쓴 개념 14개 — **이미 푼 낱말은 다시 풀지 않는다**. 특히 `runlevel`), `src/data/network/questions.json`, `src/data/network/visuals/linux-process-boot.json`
- 앞 step의 도식과 그 테스트(특히 `RunlevelTargetsDiagram`), `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-process-boot` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 15 | `linux-process-boot.shutdown-commands` | 시스템을 끄고 다시 시작하는 명령 | `runlevel` | **목록 개념**. 소개 문단: 시스템을 끄거나 다시 시작하는 명령들 — 결과가 셋(꺼진다·멈춘다·다시 켜진다)으로 갈린다는 것. 항목 넷 — `- **정한 때에 끄기**(`shutdown`)는 …`, `- **끄기**(`poweroff`)는 …`, `- **멈추기**(`halt`)는 …`, `- **다시 시작**(`reboot`)은 …`(guide.md 「글」의 항목 이름 규칙 (2) — 이름은 바꿔도 된다). `shutdown` 항목: 꼴(`shutdown 옵션 때`)과 `-h now`(지금 끄기)·`-r now`(지금 다시 시작), 때 자리에 `+10`(10분 뒤)을 적는 것 — 각각의 결과와 함께(step 0 결과대로 — `-h`가 끄기인지 멈추기인지도). `halt` 항목: 시스템을 멈추되 전원까지 끄는지는 step 0 결과대로, `poweroff`와 무엇이 다른지(4절). 항목 뒤 문단: 실행 레벨을 바꾸는 `init 0`은 끄기, `init 6`은 다시 시작이라 **`init 6`은 시스템을 끈 채로 두지 않는다** — 하드웨어를 고치려고 끄려는 상황에서 `init 6`을 쓰면 다시 켜진다는 것을 예로. 같은 결과를 내는 명령끼리 묶어 한 번 더 정리한다(끄기: `shutdown -h now`·`poweroff`·`init 0`, 다시 시작: `shutdown -r now`·`reboot`·`init 6` — step 0 결과가 허락하는 만큼). 시험이 `halt`를 끄는 명령으로 보는 것은 step 0의 판정대로(E 항목이 있으면 「자격시험은」 줄) |

### 2. 문항 — `src/data/network/questions.json`에 `n162`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n162` | `shutdown-commands` | 4지선다 「개념 비교」 — `shutdown -r now`와 같은 결과를 내는 명령을 고른다 → `reboot`. 오답은 결과가 「끄기」나 「멈추기」인 명령 — `poweroff`, `halt`, `init 0`. 보기 넷 가운데 다시 시작하는 명령이 정답 하나뿐인지 따진다(`init 6`을 보기에 넣으면 정답이 둘이 되므로 넣지 마라). 기출의 보기 넷(`shutdown -h now`·`poweroff`·`init 6`·`halt`)과는 둘 이상 다르다. **정답 위치 3** |

형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다(이 step은 4지선다 하나뿐이라 예/아니요 균형은 step 7이 끝난 때와 같다 — 계획대로면 예 29·아니요 29).

### 3. 도식

#### 3-1. `linux-process-boot.shutdown-commands` — `ShutdownCommandsDiagram`, JSON 키 `shutdown-commands`

- 물음형 제목 예: `이 명령을 입력하면 꺼질까, 다시 켜질까?`
- 그릴 것: 명령 노드(`shutdown -h now`·`poweroff`·`init 0`·`halt`·`shutdown -r now`·`reboot`·`init 6` — 본문에 쓴 것만)와 결과 노드 셋(「꺼진다」·「멈춘다」·「다시 켜진다」 — 본문의 말로). 명령에서 결과로 경로를 잇는다. 280 폭에서 명령 노드가 많으면 결과마다 그룹 박스로 묶어 세로로 쌓는다(guide.md 「나무와 차례」 — 한 줄에 넷 이상 두지 않는다).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `poweroff` | 끄기 | 끄는 명령들·「꺼진다」 | 시스템을 끄고 전원까지 끈다 |
  | `halt` | 멈추기 | `halt`·「멈춘다」 | 시스템을 멈춘다 — 전원에 관해서는 본문대로 |
  | `reboot` | 다시 시작 | 다시 시작하는 명령들·「다시 켜진다」 | 끈 뒤 다시 켠다 — `init 6`은 끈 채로 두지 않는다 |

- 요점 테스트: `init 6` 노드는 `reboot` 시나리오에서 선명하고 `poweroff` 시나리오에서 흐리다. `init 0` 노드는 그 반대다. 각 명령 노드에서 나가는 경로가 결과 노드 하나에만 닿는다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면(예: `halt`가 전원을 어떻게 하는지 출처가 말하지 않으면) 그 시나리오를 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 162개, 마지막 id는 `n162`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념을 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 명령마다의 결과가 shutdown(8)·halt(8)·telinit(8)과 같은가(공식 문서 문장을 옮기지 않고).
3. **주제를 마무리하는 step이다** — `linux-process-boot`의 개념 15개를 처음부터 끝까지 통독해, 풀이 없이 처음 나오는 낱말, 같은 말의 되풀이, 진행 안내 문장이 없는지 본다(도식 문구 포함). 문항 18개(n145~n162)의 균형과, 같은 개념의 두 문항이 서로 다른 것을 묻는지 본다.
   앞 개념에 고칠 것을 찾으면 고치지 말고 summary에 적는다.
4. `phases/76-network-linux-process-accounts/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」과, 주제 통독 결과.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~14를 고치지 마라.** 이유: 앞 step의 범위다. 통독에서 찾은 것은 summary에 적는다.
- **`shutdown`의 알림 메시지·취소(`-c`)·`wall` 같은 것을 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
