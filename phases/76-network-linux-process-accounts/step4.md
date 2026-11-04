# Step 4: systemctl-cron

## 배경

phase 76은 네트워크 과목의 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획·결정·공통 규칙은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
**이 step은 주제 `linux-process-boot`의 개념 둘(7 systemctl 명령, 8 cron 데몬)의 글·문항·도식을 함께 만든다.** 7은 `daemon`에 딸린 개념이고, 8은 작업 예약 묶음의 머리 개념이다.

기출은 systemd를 쓰는 Linux에서 `systemctl`의 쓰임으로 알맞지 않은 것(`passwd`)을 한 번 묻는다. 작업 예약은 crontab의 시간 칸(2회)과 `crontab -r`(3회)을 묻고, 그 둘은 step 5의 딸린 개념이 맡는다 — 이 step은 그 바탕인 cron 데몬을 쓴다.

## 읽어야 할 파일

- **`phases/76-network-linux-process-accounts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/76-network-linux-process-accounts/index.json`의 step 0~3 `summary`(특히 step 0의 g·h)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 76)」 항목의 systemctl(1)·systemd.unit(5)·cron(8)·crontab(5)), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-process-boot` 주제(앞 step이 쓴 개념 — **이미 푼 낱말은 다시 풀지 않는다**. 특히 `daemon`이 systemd·`crond`를 어떻게 풀었는지), `src/data/network/questions.json`, `src/data/network/visuals/linux-process-boot.json`
- 앞 step의 도식과 그 테스트(특히 `DaemonServiceDiagram`), phase 75의 `ChmodChangeDiagram`(바뀌기 전·뒤), `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-process-boot` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 7 | `linux-process-boot.systemctl` | systemctl 명령 | `daemon` | systemd가 관리하는 서비스(데몬)를 다루는 명령이다. 유닛(systemd가 켜고 끄는 대상 하나 — 서비스는 이름 끝이 `.service`인 유닛, step 0 결과대로 한 줄)을 푼다. 명령 꼴 `systemctl 동작 서비스이름`과 동작 여섯(`start`·`stop`·`restart`·`status`·`enable`·`disable`)을 예 `crond`(guide.md 「예시 값」)로 — 동작마다 무엇이 달라지는지(지금 켜져 있는지, 부팅 때 켜질지)를 함께 쓴다. **`start`와 `enable`의 차이**(4절) — 「지금 상태」와 「부팅 때 설정」은 따로이고, `start`는 앞의 것만, `enable`은 뒤의 것만 바꾼다. 둘 다 하려면 `enable --now`(step 0 결과대로). `status`는 상태를 보여 줄 뿐 바꾸지 않는다 — 출력의 꼴은 step 0이 확인한 만큼만 보인다(지어서 보이지 않는다). 동작 여섯을 목록 개념으로 쓸지 문단으로 쓸지는 읽기 쉬운 쪽으로 고른다 — 목록이면 guide.md 「글」의 항목 이름 규칙 (2)대로 |
| 8 | `linux-process-boot.cron` | cron 데몬 | — | 정해 둔 시각에 명령을 되풀이해 실행해 주는 데몬이다(앞 개념들이 푼 「데몬」을 되짚기만 한다). 사용자마다의 예약 목록 **crontab**(한 줄에 작업 하나)을 cron이 정기적으로 살펴 시각이 맞는 줄의 명령을 실행한다 — 살피는 간격(매분)과 사용자의 crontab이 저장되는 곳은 step 0 결과대로. 예: `user1`이 `/home/user1/backup.sh`를 매주 토요일 02:30에 실행되게 crontab에 한 줄을 둔다(guide.md 「예시 값」 — 줄은 `30 2 * * 6 /home/user1/backup.sh`, 칸 읽는 법은 이 개념에서 길게 풀지 않고 「분·시·일·월·요일 다섯 칸 뒤에 명령」 한 줄로). 시스템 전체의 예약 파일 `/etc/crontab`이 따로 있다는 한 줄. 사용자가 로그인해 있지 않아도 실행된다는 것은 step 0이 근거를 찾았을 때만. 한 번만 실행하는 예약(`at`)은 다루지 않는다 |

### 2. 문항 — `src/data/network/questions.json`에 `n152`~`n153`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n152` | `systemctl` | 4지선다 「원인과 결과」 — 관리자가 `systemctl start crond`로 `crond`를 켰는데, 다시 부팅하자 `crond`가 꺼져 있었다. 부팅 때마다 켜지게 하려면 무엇을 입력했어야 하나 → `systemctl enable crond`. 오답은 흔한 혼동에서 — `restart`(다시 켜기 — 지금 상태만), `status`(보기만), `disable`(반대로 — 부팅 때 켜지지 않게). 보기 넷이 모두 `systemctl 동작 crond` 꼴이고 정답이 하나뿐인지 따진다(`enable --now`를 보기에 넣으면 정답이 둘이 되므로 넣지 마라). **정답 위치 2** |
| `n153` | `cron` | 예/아니요 「오해 바로잡기」 — cron이 작업을 실행하는 조건에 관한 오해. step 3이 끝난 뒤의 균형(계획대로면 예 27·아니요 27)에서 **아니요** 쪽으로 세운다 — 예: crontab에 적은 작업은 그 사용자가 로그인해 있을 때만 실행되는가(아니요 — step 0이 근거를 찾았을 때만). 근거가 없으면 같은 방향의 다른 주장(예: cron은 crontab의 한 줄을 그 시각에 한 번 실행한 뒤 그 줄을 지우는가 — 아니요, 지울 때까지 되풀이한다)으로 바꾼다. 해설은 cron이 언제 무엇을 실행하는지를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 「systemctl의 사용 예로 적절하지 않은 것」 꼴과 기출의 네 줄을 쓰지 않는다). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `linux-process-boot.systemctl` — `SystemctlActionsDiagram`, JSON 키 `systemctl-actions`

- 물음형 제목 예: `start와 enable은 무엇을 바꿀까?`
- 그릴 것: 바뀌기 전·뒤(guide.md 「전과 후를 보이는 그림」) — 서비스 `crond`의 두 상태 노드(「지금: 꺼짐」·「부팅 때: 켜지지 않음」 같은)를 바뀌기 전 줄에, 명령 노드를 가운데에, 바뀐 뒤의 두 상태 노드를 아래 줄에. 시나리오마다 명령 노드와 뒤 상태 노드가 다른 id·다른 자리다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `start` | `start` | 전 상태·`systemctl start crond`·뒤 상태 | 지금 켜진다 — 부팅 때 설정은 그대로 |
  | `enable` | `enable` | 전 상태·`systemctl enable crond`·뒤 상태 | 부팅 때 켜지게 된다 — 지금 상태는 그대로 |
  | `status` | `status` | 전 상태·`systemctl status crond`·(바뀌지 않은) 뒤 상태 | 상태를 보여 줄 뿐 아무것도 바꾸지 않는다 |

  step 0이 `--now`를 확인했으면 `enable-now` 시나리오(둘 다 바뀐다)를 더해도 된다.
- 요점 테스트: `start`에서 뒤 상태가 전 상태와 「지금」 노드만 다르고, `enable`에서는 「부팅 때」 노드만 다르며, `status`에서는 둘 다 같다(라벨로 견준다).

#### 3-2. `linux-process-boot.cron` — `CronScheduleDiagram`, JSON 키 `cron-schedule`

- 물음형 제목 예: `예약해 둔 작업은 누가 실행할까?`
- 그릴 것: 사용자 `user1`, 그 사용자의 crontab(본문 예의 줄 — 줄 전체가 280 폭에 들지 않으면 노드를 넓히거나 두 줄 노드 대신 그룹 박스로), 데몬 `crond`, 실행되는 `backup.sh`. 경로 — `user1` → crontab(적어 둔다), `crond` → crontab(살핀다), `crond` → `backup.sh`(시각이 되면 실행한다).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `register` | 적어 두기 | `user1`·crontab | 사용자가 자기 crontab에 시각과 명령을 한 줄로 적어 둔다 |
  | `check` | 살피기 | `crond`·crontab | cron이 crontab을 정기적으로 살핀다(간격은 본문대로) |
  | `run` | 실행하기 | `crond`·`backup.sh` | 적힌 시각이 되면 그 명령을 실행한다 — 매주 되풀이한다 |

- 요점 테스트: `run`에서 보이는 경로가 `crond`에서 시작해 `backup.sh`에서 끝난다. `register`에서는 `crond`가 흐리고, `check`·`run`에서는 선명하다. crontab 노드(또는 곁말)의 줄이 본문 예의 줄과 같다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 153개, 마지막 id는 `n153`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. `start`·`enable`·`status`가 무엇을 바꾸는지가 systemctl(1)과 같은가(공식 문서 문장을 옮기지 않고).
3. n152의 보기 넷을 하나씩 실행했다고 치고 다시 부팅한 뒤 `crond`가 켜지는지 따져, 정답이 하나뿐인지 본다.
4. `phases/76-network-linux-process-accounts/index.json`의 step 4를 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~6과 9~15를 만들거나 고치지 마라.** 이유: 다른 step의 범위다. crontab의 칸 읽기와 `crontab` 명령의 옵션은 step 5가 쓴다 — 이 step은 한 줄까지만.
- **`systemctl status`의 출력 꼴을 지어 보이지 마라.** 이유: 출력 꼴도 사실이다. step 0이 확인한 만큼만 쓴다.
- **기출의 `systemctl` 네 줄과 서비스 이름(`httpd`·`nginx`)을 쓰지 마라.** 이유: guide.md 「예시 값」 — 기출 상황의 값을 옮기지 않는다.
