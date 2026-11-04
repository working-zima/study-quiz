# Step 7: dmesg-runlevel

## 배경

phase 76은 네트워크 과목의 `linux-process-boot`·`linux-accounts`를 만든다. 전체 계획·결정·공통 규칙은 `phases/76-network-linux-process-accounts/guide.md`에 있다.
**이 step은 주제 `linux-process-boot`의 개념 둘(13 커널 메시지와 dmesg, 14 실행 레벨)의 글·문항·도식을 함께 만든다.** 13은 `boot-sequence`에 딸린 개념이고, 14는 시스템 상태 묶음의 머리 개념이다.

기출은 부팅 때 남은 커널 메시지(하드웨어·디스크·메모리·CPU·커널의 이상)를 확인하는 로그 파일을 두 번 묻고(시험의 답은 `/var/log/dmesg`), 다중 사용자와 그래픽 화면을 지원하는 실행 레벨(5)과 `init 6`(재부팅)을 묻는다.

## 읽어야 할 파일

- **`phases/76-network-linux-process-accounts/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/76-network-linux-process-accounts/index.json`의 step 0~6 `summary`(특히 step 0의 m·n과 `/var/log/dmesg`의 E 항목)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/standards.md`(특히 「(phase 76)」 항목의 dmesg(1)·syslog(2)·runlevel(8)·telinit(8)·systemd.special(7)), `docs/source/network/exam-notes.md`(step 0이 더한 항목)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`의 `linux-process-boot` 주제(앞 step이 쓴 개념 — **이미 푼 낱말은 다시 풀지 않는다**. 특히 `boot-sequence`), `src/data/network/questions.json`, `src/data/network/visuals/linux-process-boot.json`
- 앞 step의 도식과 그 테스트(특히 `BootSequenceDiagram`), phase 75의 `FstabFieldsDiagram`(표 모양), `src/components/diagrams/registry.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `linux-process-boot` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 13 | `linux-process-boot.dmesg` | 커널 메시지와 dmesg | `boot-sequence` | 커널은 부팅하면서(그리고 실행 중에도) 장치를 찾은 결과와 오류를 메시지로 남긴다. 그 메시지가 쌓이는 곳(메모리 안의 링 버퍼 — 정해진 크기, 가득 차면 어떻게 되는지는 step 0 결과대로)과 `dmesg`가 그것을 출력한다는 것. 장치 드라이버(장치를 다루는 커널의 부분 — 한 줄)를 푼다. 쓰임 — 새로 단 디스크를 커널이 알아봤는지, 하드웨어 오류가 있었는지 확인한다. `dmesg`의 출력 꼴(줄 앞의 시각 등)은 step 0이 확인한 만큼만 보인다. **시험 쪽 처리**: step 0이 `/var/log/dmesg`를 허용한 출처에서 찾지 못해 E 항목을 만들었으면, 본문은 출처의 사실을 쓴 뒤 그 E 항목의 처리대로 「자격시험은 부팅 때의 커널 메시지가 로그 파일 `/var/log/dmesg`에 남는다고 본다」를 한 줄 덧붙인다(그 파일이 있다고 사실처럼 쓰지 않는다). 기출 오답 보기의 파일(`/var/log/btmp` 등)을 쓸지는 step 0 결과대로 — 쓴다면 한 줄 |
| 14 | `linux-process-boot.runlevel` | 실행 레벨 | — | **목록 개념**. 소개 문단: 시스템이 어떤 상태로 동작하는지를 0~6의 번호로 정한 것(System V init에서 온 방식 — step 0 결과대로 한 줄). 항목 다섯 — `- **끄기**(`0`)는 …`, `- **복구 모드**(`1`)는 …`, `- **문자 화면 다중 사용자**(`3`)는 …`, `- **그래픽 다중 사용자**(`5`)는 …`, `- **다시 시작**(`6`)은 …`(guide.md 「글」의 항목 이름 규칙 (2) — 이름은 바꿔도 된다). 다중 사용자(여러 사용자가 동시에 로그인해 쓰는 상태)와 그래픽 로그인 화면(마우스로 고르는 창 화면 — 한 줄)을 푼다. **3과 5가 무엇이 다른지**(4절 — 둘 다 다중 사용자, 5는 그래픽 로그인 화면까지). 항목 뒤 문단: 지금의 systemd는 번호 대신 **타깃**(함께 켤 유닛을 묶은 이름 — 한 줄)을 쓰고 번호마다 대응하는 타깃이 있다(step 0이 확인한 runlevel(8)의 표 — 2·3·4가 같은 타깃이라는 것까지). `runlevel` 명령이 보여 주는 것과 `init 번호`(telinit)로 레벨을 바꾼다는 것은 step 0 결과대로 — `init 6`이 다시 시작이라는 것은 여기서 한 줄(끄는 명령들과 견주는 것은 딸린 개념이 쓴다) |

### 2. 문항 — `src/data/network/questions.json`에 `n159`~`n161`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n159` | `dmesg` | 4지선다 「상황 적용」 — 본문과 다른 상황(예: 서버에 새로 단 디스크가 보이지 않아, 부팅 때 커널이 그 디스크를 알아봤는지 확인하려 한다)에서 무엇을 입력하나 → `dmesg`. 오답은 같은 범주(무엇인가를 보여 주는 명령)에서 헷갈릴 만한 것 — 로그인 기록을 보이는 `last`, 메모리 양을 보이는 `free`, 프로세스를 보이는 `top` 같은. 오답 명령이 이 주제 밖이면 해설에서 한 줄로 푼다. 기출처럼 로그 파일 경로 넷을 보기로 두지 않는다(guide.md 「문항」 11항). **정답 위치 2** |
| `n160` | `runlevel` | 4지선다 「상황 적용」 — 그래픽 화면 없이 여러 사용자가 원격으로 접속해 쓰는 서버를 켤 때마다 그 상태로 시작하게 하려면, 실행 레벨 몇에 해당하는 systemd 타깃을 쓰나 → `multi-user.target`(실행 레벨 3). 보기는 타깃 이름 넷(`multi-user.target`·`graphical.target`·`rescue.target`·`reboot.target` 같은 — step 0이 확인한 이름)이다. 기출의 runlevel 번호 넷 묶음을 쓰지 않는다. **정답 위치 1** |
| `n161` | `runlevel` | 예/아니요 「오해 바로잡기」 — 3과 5의 차이에 관한 주장(예: 실행 레벨 5는 그래픽 로그인 화면 없이 문자 화면으로 여러 사용자가 쓰는 상태인가 — 아니요, 그것은 3이고 5는 그래픽 로그인 화면까지). step 6이 끝난 뒤의 균형(계획대로면 예 29·아니요 28)에서 **아니요** 쪽으로 세운다. n160과 다른 것을 묻는다. 해설은 3과 5를 둘 다 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항 — 「부팅 때 커널 메시지가 저장되는 로그 파일」 꼴과 경로 넷, 「다중 사용자와 GUI를 지원하는 runlevel」 꼴과 번호 넷, `init 0`·`1`·`5`·`6` 묶음을 쓰지 않는다).
형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

#### 3-1. `linux-process-boot.dmesg` — `KernelMessagesDiagram`, JSON 키 `kernel-messages`

- 물음형 제목 예: `부팅 때 커널이 남긴 메시지는 어디서 볼까?`
- 그릴 것: 커널 노드, 링 버퍼(그룹 박스 「링 버퍼(메모리)」 안에 메시지 노드 둘셋 — 라벨은 본문이 쓴 말로, 예: 「디스크를 찾음」·「오류」), `dmesg` 노드, 화면(출력) 노드. 경로 — 커널 → 링 버퍼(남긴다), 링 버퍼 → `dmesg` → 화면(출력한다).
  **`/var/log/dmesg` 파일 노드를 그리지 마라** — 「자격시험은」 줄로만 쓴 것은 도식에 사실처럼 그리지 않는다(guide.md 「도식」).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `write` | 남기기 | 커널·메시지 노드 | 커널이 장치를 찾은 결과와 오류를 메시지로 남긴다 |
  | `read` | `dmesg` | 메시지 노드·`dmesg`·화면 | `dmesg`가 쌓인 커널 메시지를 출력한다 |
  | `full` | 가득 차면 | 메시지 노드(와 곁말) | (step 0이 근거를 찾았을 때만) 정해진 크기라 가득 차면 오래된 메시지부터 새 것으로 덮인다 |

- 요점 테스트: `write`에서 보이는 경로는 커널에서 링 버퍼로 가고, `read`에서 보이는 경로는 링 버퍼에서 `dmesg`를 거쳐 화면에 닿는다. 어느 노드·곁말에도 `/var/log/dmesg`가 없다.

#### 3-2. `linux-process-boot.runlevel` — `RunlevelTargetsDiagram`, JSON 키 `runlevel-targets`

- 물음형 제목 예: `실행 레벨 번호는 어떤 상태일까?`
- 그릴 것: 표 모양(guide.md 「표 모양 그림」) — 행마다 번호 노드와 타깃 노드(`poweroff.target` 등)를 빈틈없이 잇고, 상태 이름(끄기·복구 모드·…)은 번호 노드 곁말이나 그룹 박스로. 행은 본문 항목의 다섯(0·1·3·5·6)이고, 2·4가 3과 같은 타깃이라는 것은 곁말이나 캡션으로(본문에 있으면).
  세로형 280 폭에 「번호 | 상태 | 타깃」 세 칸이 들지 않으면 상태 이름을 행 위의 곁말로 올린다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `off-reboot` | 끄기·다시 시작 | 0·6의 행 | 0은 끄기, 6은 다시 시작 — `init 6`은 시스템을 끈 채로 두지 않는다 |
  | `multi-user` | 문자 화면 | 3의 행 | 여러 사용자가 접속하지만 그래픽 로그인 화면은 없다 |
  | `graphical` | 그래픽 화면 | 5의 행 | 다중 사용자에 그래픽 로그인 화면까지 |
  | `rescue` | 복구 모드 | 1의 행 | 관리자 혼자 시스템을 고치는 상태 |

- 요점 테스트: 행마다 번호 노드와 타깃 노드의 짝이 runlevel(8)의 표(step 0이 `standards.md`에 적은 것)와 같다 — 0·`poweroff.target`, 1·`rescue.target`, 3·`multi-user.target`, 5·`graphical.target`, 6·`reboot.target`. `graphical`의 선명한 번호 노드는 `5` 하나다.

위 도식 설계는 출발점이다. 본문(step 0 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~8, 10~12)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 161개, 마지막 id는 `n161`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. step 0 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가 — 특히 `/var/log/dmesg`를 사실처럼 쓰거나 그리지 않았는가.
3. 실행 레벨과 타깃의 짝을 runlevel(8)과 하나씩 견준다. n160·n161의 정답과 오답이 그 표로 정해지는지 본다.
4. `phases/76-network-linux-process-accounts/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **개념 1~12와 15를 만들거나 고치지 마라.** 이유: 다른 step의 범위다. `shutdown`·`poweroff`·`halt`·`reboot`는 step 8이 쓴다 — 이 step은 `init 6`의 한 줄까지만.
- **`/var/log/dmesg`를 공식 문서의 사실처럼 쓰지 마라.** 이유: ADR-059 「기출의 자리」 — 시험의 답이 출처에 없으면 「자격시험은」 줄로만 쓴다.
- **`journalctl`과 System V의 `/etc/inittab`·`/etc/rc*.d`를 쓰지 마라.** 이유: 기출이 묻지 않는다(ADR-059 「범위」).
