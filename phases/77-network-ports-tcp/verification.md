# phase 77 검증 보고

확인한 날: 2026-11-09~10(Windows PC). 브랜치 `feat-77-network-ports-tcp` — **origin/main 2c0dbbc에서 분기**했다(origin/develop 1b8b562에는 main의 Azure phase 108이 아직 없어서).
설계 커밋 45eb898, 제어 비트 처리 변경 890ae5c, phase 완료 커밋 35c9762. 설계는 사용자가 승인했다(11-09 「응 진행해줘」).
실행은 `scripts/execute.py --agent claude`를 저장소 밖 `p77-run\run-chunk.cmd`로 띄우고, 그 위의 감독 스크립트(`supervisor.ps1`)가 남은 step을 이어 돌렸다.
step 0~8은 11-09, step 9~12는 11-10에 돌았다(사이에 사용자 요청으로 step 8과 9 사이에서 멈췄다). 통독·AC·화면 실측·이 보고서는 메인 세션이 했다. 병합·push는 하지 않았다.

강의가 있는 주제다(Ch4-1 포트, Ch4-3 TCP·UDP, Ch4-5·Ch4-6 연결·상태). 사실은 강의와 표준(RFC, IANA 레지스트리, man7.org, learn.microsoft.com의 `netstat` 문서)에서 가져왔고,
둘이 어긋나면 표준을 따랐다(ADR-059). 기출은 답을 확인하는 데만 썼다.

## step별 결과

| step | 걸린 시간 | 결과 | 테스트 |
|---|---|---|---|
| 0 ports-sources | 25분 | `ports`가 쓸 사실(standards.md 「(phase 77)」 줄), 강의 수정 이력 L43, exam-notes E27·E28 | 7949 |
| 1 port-number-ranges | 19분 | 개념 1 포트 번호·2 포트 번호의 범위, n171~n172 — 주제 `ports` 만듦 | 7988 |
| 2 well-known-client-server | 25분 | 개념 3 잘 알려진 포트·4 서버 포트와 클라이언트 포트, n173~n175 — `ports` 완성(개념 4) | 8027 |
| 3 tcp-udp-sources | 24분 | `tcp-udp`가 쓸 사실(「(phase 77 step 3)」 항목과 줄), L44~L47, E29 | 8027 |
| 4 tcp-mss | 21분(+ 커밋 뒤 30분 제한까지 붙잡힘) | 개념 5 TCP·6 MSS, n176~n177 — 주제 `tcp-udp` 만듦 | 8064 |
| 5 tcp-header-sequence | 25분 | 개념 7 TCP 세그먼트 헤더·8 순서 번호, n178~n180 | 8106 |
| 6 ack-control-bits | 23분 | 개념 9 확인 응답 번호·10 TCP 제어 비트, n181~n183 | 8150 |
| 7 udp-header | 26분 | 개념 11 UDP·12 UDP 데이터그램 헤더, n184~n185 | 8191 |
| 8 transport-choice | 16분(+ 커밋 뒤 붙잡힘) | 개념 13 TCP와 UDP를 고르는 기준, n186~n187 — `tcp-udp` 완성(개념 9) | 8214 |
| 9 connection-sources | 24분 | `tcp-connection`이 쓸 사실(RFC 9293·RFC 1337·ss(8)·netstat), 상태 전이 표. 새 L·E 없음 | 8214 |
| 10 handshake-termination | 29분 | 개념 14 3-way handshake·15 TCP 연결 종료, n188~n190 — 주제 `tcp-connection` 만듦 | 8256 |
| 11 states-opening | 28분 | 개념 16 TCP 상태·17 연결을 맺는 동안의 상태, n191~n193 | 8299 |
| 12 closing-time-wait | 25분 | 개념 18 연결을 끊는 동안의 상태·19 TIME-WAIT 상태, n194~n195 — `tcp-connection` 완성(개념 6) | 8339 |

결과: 개념 19개(`ports` 4 ★★☆ · `tcp-udp` 9 ★★★ · `tcp-connection` 6 ★★☆, 딸린 개념 9), 문항 25개(n171~n195), 도식 19개(개념마다 하나),
새 테스트 390개(phase 시작 359파일·7949개 → 378파일·8339개). 걸린 시간은 index.json의 `started_at`~`completed_at`이다.

## 실행 중에 일어난 일

- **첫 실행이 3초 만에 죽음(11-09 09:47).** 감독·keep-awake·실행기가 콘솔 창을 띄운 채 시작했다가 모두 끝났다(로그 끝 `^C`). 창을 숨겨(`Win32_ProcessStartup` ShowWindow=0) 13:10에 다시 띄운 뒤로는 끊기지 않았다.
- **step 4·8은 에이전트가 작업을 커밋한 뒤에도 끝나지 않았다.** step 4는 30분 제한에 걸려 실행기가 끝났고 감독이 다음 실행으로 이어갔다. step 8 때는 사용자가 「잠깐 멈추기 좋은 곳에서 멈춰줘」라고 해,
  step 9가 시작되기 전에 감독과 실행기를 껐다. 그래서 `step4-output.json`·`step8-output.json`과 「step 4/8 output」 커밋은 없다. 두 step의 작업 커밋(1632085·331c57a)은 온전하고 AC도 통과했다.
- **11-10 09:11 다시 띄움.** 남은 step 9~12가 끊김 없이 돌았다. 사용량 한도에는 한 번도 걸리지 않았다.
- **제어 비트 처리를 step 3 뒤에 바꿨다(890ae5c).** 설계와 step 3은 「지금은 제어 비트 8개·예약 4비트」를 전제했다. 그런데 step 3이 RFC 9768(2026-04)과 IANA 「TCP Header Flags」 레지스트리(2026-04-24 갱신)가 비트 7을 AE로 다시 정한 것을 찾았다.
  메인 세션이 IANA 레지스트리 XML과 RFC 9768 머리를 직접 받아 확인했다. 그래서 step 5·6 전에 guide·step 5·6 문서와 exam-notes E29의 처리를 「본문은 지금의 레지스트리대로 9개·예약 3비트,
  RFC 9293 그림과 강의 p239의 8개는 한 문단으로 설명, 「자격시험은」 줄 없음」으로 바꿨다(사용자에게 알림).

## 설계와 달라진 것

모두 step summary에 이유가 있고, 받아들였다. 사실과 정답 논리를 바꾼 것은 없다.

- **도식 꼴.** 280 폭에 들지 않는 라벨은 그룹 박스·곁말로 나눴다. 예: 세그먼트는 켠 비트를 이름으로 단 박스와 안의 번호 노드로 그렸다. 제어 비트 아홉 칸은 세로형에서 세 칸씩 세 줄로 놓았다.
  `TIME-WAIT · 2×MSL`은 노드 「TIME-WAIT」와 곁말 「2×MSL 동안」으로 나눴다. CLOSING은 끊는 동안의 상태 아래에 「두 쪽이 거의 함께 끊을 때」 박스로 따로 두었다.
- **출처에 없는 것은 쓰지 않음.** 「4-way handshake」라는 이름은 RFC 9293에 없어 쓰지 않았다. `ss -tan`의 출력 꼴은 ss(8)가 보이지 않아 출력을 그리지 않았다.
  2×MSL이 왜 2배인지와 운영체제의 실제 TIME-WAIT 길이는 허용 출처에서 찾지 못해 쓰지 않았다. 「연결이 끝나면 클라이언트 번호를 다시 쓸 수 있다」도 출처가 없어 쓰지 않았다.
- **표기.** 상태 이름은 RFC의 하이픈 꼴(`SYN-RECEIVED`)을 기본으로 썼다. Windows `netstat` 설명서의 밑줄 꼴과 Linux `ss`의 소문자 꼴(`syn-recv`)은 표기 문단에서 함께 보였다. 강의 화면의 대문자 「SYN-RECV」는 ss(8)에 없어 쓰지 않았다.
- **문항.** n174는 본문 예 8080과 겹치지 않게 8000을 썼다. n189의 오답 「SYN만」은 「RST와 ACK」로 바꿨다(기출 보기 묶음과 겹치지 않게). n191의 오답 「상대의 SYN」은 「어느 상대에게서든 새로 올 연결 요청인 SYN」으로 좁혔다(SYN+ACK에도 SYN이 있어 우길 수 있어서).

## 사용자가 볼 것

시험의 답이 표준과 어긋나거나 강의가 표준과 다른 곳은 ADR-059의 규칙대로 처리했다. 사용자 결정이 필요하지 않다고 봤다.

- **E27** — 시험은 잘 알려진 포트를 「1~1023」으로 본다. 표준(RFC 6335·IANA)은 0~1023이고 0번은 어떤 서비스에도 정해 주지 않는다. 본문은 0~1023과 「0번은 남겨 둔 번호」를 쓰고 「자격시험은」 줄을 붙였다.
- **E28** — 시험은 「HTTPS가 UDP 443을 쓴다」를 틀린 설명으로 둔다. HTTP/3(RFC 9114)는 같은 443을 UDP로 쓴다. 본문은 기본 포트를 TCP 443으로 쓰고 「자격시험은」 줄을 붙였다. 「HTTPS는 TCP만 쓴다」를 맞는 말로 쓰는 문항은 없다.
- **E29** — 위 「제어 비트 처리」. 시험의 「Flags 9비트」는 지금의 IANA 레지스트리와 맞는다. 문항은 8과 9로 정답을 가르지 않는다.
- **강의 수정 이력 L43~L47** — 동적 포트를 「사용자가 자유롭게 할당」(L43), 초기 순서 번호를 첫 데이터 바이트 번호로 그림(L44), 「8000을 받으면 8001」 그림(L45), TCP를 「하나 보내고 확인받은 뒤 다음」으로 그림(L46), UDP 헤더 칸이 「모두 TCP에 있는 정보」(L47).
  본문은 표준대로 썼다.

**메인 세션 통독 뒤 고친 곳** — 사실과 정답 논리는 그대로다. n192만 문항 자체를 바꿨다.

- **n192 다시 씀.** 처음 n192(SYN+ACK를 보내고 ACK를 아직 못 받은 서버의 상태 → SYN-RECEIVED, 보기 SYN-SENT·LISTEN·SYN-RECEIVED·ESTABLISHED)는 기출 [기출 2024-02-25 #29](같은 문항 2025-02-23 #35·2026-05-17 #32)와 같았다.
  이 기출은 LISTEN이던 서버가 SYN을 받으면 어느 상태인지 묻고, 보기는 SYN_SENT·SYN_RECEIVED·ESTABLISHED·CLOSE다. 묻는 사실과 정답이 같고 보기 넷 가운데 셋이 겹친다.
  step 11은 「상황을 바꿨다」고 보고 판단을 물었지만, guide 문항 규칙 11(보기 범주를 바꾸거나, 보기 둘 이상을 바꾸거나, 상황을 바꿔 묻는다)에 못 미친다고 봤다.
  그래서 보기 범주를 「상태의 차례」로 바꿨다. 새 n192는 연결을 청한 클라이언트 쪽이 거친 상태의 차례를 묻는다. 정답은 `CLOSED → SYN-SENT → ESTABLISHED`이고 위치 2를 유지해 균형이 그대로다.
  오답은 서버 쪽 길 `LISTEN → SYN-RECEIVED → ESTABLISHED`, `CLOSED → LISTEN → SYN-SENT → ESTABLISHED`, 그리고 `CLOSED → SYN-SENT → SYN-RECEIVED → ESTABLISHED`다. 마지막 것은 SYN+ACK에도 SYN이 켜져 있어서 빠지기 쉬운 오답이다.
  근거는 RFC 9293 §3.10.7.3과 `opening-states` 본문의 「이 예에서 클라이언트는 SYN-RECEIVED를 거치지 않는다」. 두 쪽 상태의 짝을 보기로 두는 안은 n193(클라이언트가 먼저 ESTABLISHED)과 겹쳐 쓰지 않았다.
- **n190 해설 끝** 「정상 종료에는 FIN과 ACK가 방향마다 한 번씩, 세그먼트 넷이 오간다」 → 「방향마다 FIN과 ACK가 한 번씩, 보통 세그먼트 넷이 오간다」.
  같은 개념 본문이 서버의 ACK와 FIN이 한 세그먼트에 실리면 셋이라고 쓰므로, 해설이 늘 넷인 것처럼 읽히지 않게 했다.
- **n195 해설과 `TimeWaitDiagram`의 「늦게 온 옛 세그먼트」 캡션** 「같은 IP 주소와 포트 번호로 곧바로 새 연결을 맺으면」 → 「양 끝의 IP 주소와 포트 번호가 모두 같은 새 연결을 곧바로 맺으면」.
  본문은 「양 끝의 IP 주소와 포트 번호, 모두 네 값」이라고 정확히 쓰는데, 줄인 문장은 한쪽 주소만 같아도 되는 것처럼 읽혀서 고쳤다. 도식 테스트의 기대 문장을 먼저 바꿔 실패를 보고, 그 뒤 데이터를 고쳐 통과시켰다.
- 그대로 둔 것: `ports.well-known-ports`의 「…가짜 프로그램이 아니라고 믿을 수 있다」는 services(5)의 취지대로지만 단정이 조금 강하다(보류 후보).
  「두 쪽이 거의 함께 끊으면 두 쪽 모두 …」가 `tcp-states` 목록 뒤 문단, `closing-states`, `time-wait`에 한 번씩 나온다. 개념마다 다른 물음에 답하는 문장이라 남겼다(step 12 판단과 같음).

## 다시 돌린 검증 (phase가 끝난 뒤, 통독 수정까지 넣은 상태)

실행 프로세스가 모두 끝난 뒤라 부하가 겹치지 않았다.

- `npm run build` 통과, `npm run lint` 종료 코드 0, `npm test` 378파일·8339개 통과.
- `check-structure` 「구조 이상 없음」.
- 교차 검사 「✓ 교차 없음 — 세로 노드 1928개·경로 1219개, 가로 노드 1928개·경로 1219개」(phase 시작 1769/1138에서 +159/+81).
- `check-verbatim --subject network` 「전사 이상 없음 — network: 원본 2개, 단위 1721개」. 원본 2개를 실제로 대조했다.
- 문항 195개(n171~n195 25개), 예 35·아니요 36, 정답 위치 31/31/31/31 — 균형 규칙 안이고 설계의 계획과 같다. phase의 25문항만 보면 예 4·아니요 5, 위치 4/4/4/4.
- 주제 18개 — `ports`·`tcp-udp`·`tcp-connection`이 `routing` 뒤·`linux-filesystem` 앞에 차례대로 있다(importance 2·3·2, sourcePages [217, 233]·[236, 253]·[256, 280]).
- **바뀌지 않아야 하는 것** — 설계 커밋 45eb898의 기존 주제 15개·문항 170개를 지금 파일과 node로 통째로 견줘 차이 0. AWS·Azure 데이터와 `src/data/index.ts`는 diff가 없다.
- **문항 25개를 메인 세션이 통독**했다. 계산이 든 문항은 손으로 다시 풀어 정답 키와 같다.
  n177 1400 − 20 − 20 = 1360, n179 7 × 4 = 28, n180 2001 + 500 + 500 = 3001, n181 3001 + 400 = 3401, n185 1208 − 8 = 1200, n188 8000 + 1 = 8001.
- 메인 세션이 출처를 직접 확인한 것: IANA tcp-parameters 레지스트리의 비트 7 = AE(RFC 9768, 2026-04-24 갱신), RFC 9768 머리(2026-04, Standards Track), RFC 9846 머리(2026-07, RFC 8446을 폐기 — step 2가 TLS 1.3의 RFC 번호로 씀).

## 화면 확인 (headless Chrome + CDP, 개발 서버 `127.0.0.1:5274`)

설치된 Chrome을 headless로 띄우고 저장소의 `ws`로 CDP를 몰았다. 스크립트는 저장소 밖 `p77-run\measure-p77.cjs`로, phase 76의 측정기를 세 주제로 바꾼 것이다. 폭 320·390(배율 2, 모바일)과 1180(배율 1)에서 쟀다.
측정기가 실제로 결함을 잡는지는 결함을 일부러 넣는 자가 시험으로 먼저 확인했다. 곁말을 SVG 밖으로, 노드 라벨을 상자보다 길게, 곁말끼리 겹치게, 그룹 라벨을 테두리 위로 옮겼고, 세 폭·세 주제 모두에서 잡아 합계 245건이었다.

- **넘침** — 세 폭에서 세 주제 모두 페이지 가로 넘침 0. 모든 시나리오 버튼을 누른 뒤에도 0. 도식 폭은 320·380, 1180에서는 가로형 638·621.
- **도식 19개의 모든 시나리오**(폭마다 79개 상태 — `ports` 16, `tcp-udp` 38, `tcp-connection` 25)를 하나씩 눌러 보이는 SVG 글자를 화면 픽셀로 쟀다.
  SVG 밖으로 나간 글자 0, 노드 라벨이 자기 상자보다 넓은 곳 0, 글자끼리 겹친 곳 0, 곁말이 노드 상자에 겹친 곳 0, 곁말·라벨이 그룹 박스 테두리에 걸친 곳 0.
  검사가 실제로 요소를 보는지는 그룹 박스 177개·노드 677개·글자 976개(폭 320 기준)를 세어 확인했다. 캡션을 고친 뒤 `tcp-connection`을 다시 재어도 0이다.
- 콘솔에는 기존의 vite 연결 알림·React 개발 안내·React Router future flag 경고 둘만 있다(새 것 없음).
- 캡처해서 눈으로 본 것: `ClosingStatesDiagram`(320, 동시에 끊기 — FIN-WAIT-1 → CLOSING → TIME-WAIT), `TimeWaitDiagram`(320, 늦게 온 옛 세그먼트), `UdpDeliveryDiagram`(1180, 체크섬이 맞지 않아 버림).
  칸·곁말·캡션이 제자리에 있고 값이 본문과 같다.

## 병합 때 볼 것

origin/main은 2c0dbbc, origin/develop은 1b8b562 그대로다(11-10 fetch). `git merge-tree`로 두 쪽에 시험 병합하면 모두 충돌이 없다.
이 브랜치는 origin/main에서 팠으므로, develop에 병합하면 main에만 있던 Azure phase 108(2c0dbbc까지)도 함께 develop에 들어간다.
바뀐 파일은 다음뿐이다.

- network 데이터: `topics.json`·`questions.json`·`visuals/ports.json`·`visuals/tcp-udp.json`·`visuals/tcp-connection.json`·`index.ts`
- 도식: 새 도식 19개와 테스트, `registry.ts`
- 출처 문서: `docs/source/network/standards.md`·`lecture-outline.md`·`exam-notes.md`
- phase 메타데이터: `phases/index.json`과 phase 77 폴더

## 배포 방법(「배포」 승인 뒤)

phase 76과 같다. network worktree에서 origin/develop(1b8b562) 위에 `merge --no-ff feat-77-network-ports-tcp`로 develop 병합 커밋을 만들고, 그 위에 origin/main(2c0dbbc)에서 release 커밋을 만든다.
그 뒤 `git fetch`로 원격이 그대로인지 확인하고 `git push origin <병합>:refs/heads/develop` → `git push origin <release>:refs/heads/main`을 단독 명령으로 실행한다.
마지막으로 Pages가 성공했는지, 공개 번들에 새 주제 id와 n195가 있는지 확인한다.
