# phase 78 검증 보고

확인한 날: 2026-11-11(Windows PC). 브랜치 `feat-78-network-app-protocols-diagnostics`는 origin/develop be993a9에서 팠다.
설계 커밋은 ca09b31, phase 완료 커밋은 1c882919, 통독 수정 커밋은 409f8933이다. 설계는 사용자가 승인했다(11-11 「응」).
실행은 `scripts/execute.py --agent claude`로 했다. 저장소 밖 `p78-run\run-chunk.cmd`가 실행기를 띄우고, 그 위의 감독 스크립트(`supervisor.ps1`)가 남은 step을 이어 돌렸다.
통독·AC·화면 실측·이 보고서는 메인 세션이 했다. 병합·push는 하지 않았다.

세 주제는 모두 강의 밖이다(`sourcePages` [0,0], ★★★). 사실은 표준과 공식 문서에서 가져왔다: RFC, IANA, learn.microsoft.com(Windows 명령 참조, Windows Server 문제 해결 문서, IIS FTP 문서), man7.org.
`ipconfig /all`의 항목만 강의 p194 그림을 함께 근거로 썼다(아래 「통독 뒤 고친 곳」). 기출은 범위를 정하고 답을 확인하는 데만 썼다.

## step별 결과

| step | 걸린 시간 | 결과 | 테스트(파일/개) |
|---|---|---|---|
| 0 mail-file-sources | 커밋까지 25분(+ 커밋 뒤 30분 제한에 걸림) | `app-protocols-mail-file`가 쓸 사실(standards.md 「(phase 78 step 0)」), exam-notes E30·E31 | — |
| 1 mail-path-smtp | 커밋까지 22분(+ 커밋 뒤 30분 제한에 걸림) | 개념 1 전자우편의 전달 과정·2 SMTP, n196~n197 — 주제 만듦 | 380/8383 |
| 2 pop3-imap | 25분 | 개념 3 POP3·4 IMAP, n198~n199 | 382/8425 |
| 3 ftp-modes | 34분 | 개념 5 FTP·6 FTP의 능동 모드와 수동 모드, n200~n202 | 384/8465 |
| 4 tftp-ssh | 37분 | 개념 7 TFTP·8 SSH, n203~n205 — 주제 완성(개념 8) | 386/8509 |
| 5 mgmt-security-sources | 39분 | `app-protocols-mgmt-security`가 쓸 사실(「(phase 78 step 5)」), E32 | — |
| 6 snmp-mib | 30분 | 개념 9 SNMP·10 MIB, n206~n208 — 주제 만듦 | 388/8551 |
| 7 snmp-poll-versions | 27분 | 개념 11 SNMP의 폴링과 트랩·12 SNMP의 버전과 보안, n209~n210 | 390/8591 |
| 8 ntp-sntp | 28분 | 개념 13 NTP·14 SNTP, n211~n212 | 392/8631 |
| 9 tls-https | 35분 | 개념 15 TLS·16 HTTPS, n213~n214 | 394/8671 |
| 10 sip | 32분 | 개념 17 SIP, n215 — 주제 완성(개념 9) | 395/8692 |
| 11 diagnostic-sources | 38분 | `diagnostic-commands`가 쓸 사실(「(phase 78 step 11)」), E33·E34 | — |
| 12 ipconfig | 25분 | 개념 18 ipconfig 명령·19 ipconfig의 옵션, n216~n218 — 주제 만듦 | 397/8734 |
| 13 ping-tracert | 23분 | 개념 20 ping 명령의 옵션·21 tracert 명령, n219~n220 | 399/8776 |
| 14 pathping-netstat | 27분 | 개념 22 pathping 명령·23 netstat 명령, n221~n223 | 401/8816 |
| 15 netstat-options | 21분 | 개념 24 Windows netstat의 옵션·25 Linux netstat의 옵션, n224~n225 — 주제 완성(개념 8) | 403/8858 |

걸린 시간은 index.json의 `started_at`~`completed_at`이다. 그 값이 없는 step 0~2는 step summary의 어림이다. 3~15의 시간에는 Stop 훅 시간이 들어 있다.

결과는 이렇다.

- 개념 25개: `app-protocols-mail-file` 8, `app-protocols-mgmt-security` 9, `diagnostic-commands` 8.
- 문항 30개(n196~n225): 4지선다 16, 예/아니요 14.
- 도식 25개: 개념마다 하나다.
- 새 테스트 519개: phase 시작 378파일·8339개 → 403파일·8858개.
- 교차 검사 노드·경로: 1928·1219 → 2139·1446.

## 실행 중에 일어난 일

- **재부팅으로 멈춤(10:49).** 사용자가 재부팅하려고 정리를 요청했다. 그때 step 0은 시작한 지 7분째였고 아직 커밋 전이었다.
  감독 트리와 keep-awake를 끄고 index.json의 시작 표시를 되돌렸다. 16 step이 모두 pending인 상태에서 11:33에 다시 띄웠다.
- **step 0·1이 30분 제한에 걸림.** 두 step 모두 에이전트가 작업을 커밋한 뒤 끝나지 않았다. 커밋은 25·22분째였다.
  Stop 훅(lint·build·test, 5~8분)이 도는 동안 execute.py의 1800초 제한에 걸려 `TimeoutExpired`로 끝났다. 그래서 `step0-output.json`·`step1-output.json`과 `completed_at`이 없다.
  두 작업 커밋(6f0b392·0f3b258)은 온전하고, 다음 step이 이어받아 AC를 돌렸다.
  - **12:57 실행기를 바꿨다.** step 2 커밋 뒤 감독을 끄고, 저장소 밖 래퍼 `p78-run\execute_wrap.py`로 execute.py를 실행하게 했다. 래퍼는 subprocess 제한만 1800 → 3600초로 바꾼다.
  - 그 뒤로는 제한에 걸린 step이 없다. step 3(34분)·4(37분)·5(39분)·11(38분)은 옛 제한이었으면 넘었을 시간이다.
- **사용량 한도(17:57) → 자동 재개(18:38).** step 12가 5시간 한도에 걸렸다(「You've hit your 5-hour limit · resets 6:30pm」). 감독은 이것을 한도로 판정해 step 12를 pending으로 되돌렸다(ab7c4a62).
  step 12에는 feat 커밋이 없었으므로 반쯤 된 작업은 남지 않았다. 감독은 10분마다 풀렸는지 확인하다가 18:38에 step 12부터 이어 돌렸고, 20:13에 끝났다.
  - 이 한도 문구는 옛 판정식에 걸리지 않는 꼴이었다. 17:19 step 10 output 커밋 직후에 판정식을 넓혀 감독을 다시 띄워 두었기 때문에 한도로 잡혔다.

## 설계와 달라진 것

모두 step summary에 이유가 있고, 그대로 받아들였다. 사실과 정답 논리를 바꾼 것은 없다.

- **도식 꼴.** 280 폭에 들지 않는 라벨은 자리를 옮기거나 그룹 박스·곁말로 나눴다.
  - 포트 번호는 서버 기둥이 아니라 그 포트로 가는 노드에 적었다: FTP 「제어 연결 · 21번」, TFTP 「읽기 요청 · 69번」, SSH의 TCP 연결 노드 22. 기둥에 적으면 모든 연결이 그 포트로 가는 것처럼 읽히기 때문이다.
  - SIP 두 주소는 세로형에서 엇갈려 두었다.
  - netstat 옵션 노드는 세로로 쌓았다. 280 폭 한 줄에 넷을 두지 않는다는 규칙 때문이다.
- **출처에 없는 것은 쓰지 않음.**
  - `ipconfig /all`의 항목은 step 12가 Windows 문서로 확인한 호스트 이름·DNS 서버만 그렸다. 도식의 「/all에서 더 나오는 줄」이 그 둘이다.
  - `ipconfig /renew` 뒤 주소 값과 pathping·netstat의 출력 화면은 지어 보이지 않고 칸의 값만 적었다.
  - netstat `-o`의 PID가 마지막 칸이라는 것은 Windows Server 문제 해결 문서(「How to determine which program uses or blocks specific TCP ports」)의 칸 차례로 확인했다. 옛 판 글이라 칸의 차례만 가져왔다(step 15).
- **문항.**
  - n199: 결과 넷 대신 서버·노트북 두 곳의 상태를 2×2로 엮었다.
  - n206: 오답을 {UDP, TCP} × {161, 162}로 세웠다.
  - n208: 「MIB가 관리 시스템 쪽에 있는가」로 세웠다.
  - n216: 「옵션 없이 다시」 오답이 소거로 지워지지 않게 앞의 시도를 문제문에서 뺐다.
  - n220: n075와 주장이 겹치지 않게 netstat 쪽으로 세웠다.
  - n222: 값 고르기 대신 두 줄을 읽은 진술 넷으로 했다.
  - n224: 오답 「외부 쪽 컴퓨터의 PID」를 더했다. 「(PID)」는 정답에만 붙지 않게 했다.
- **기출과의 겹침.** 새 문항 30개를 기출 원문과 대조했다. 대조한 기출은 pathping 셋, `ipconfig /all`, `/flushdns`, FTP 수동 모드, SNMPv2c다.
  보기 넷 묶음이 같은 문항은 없다. 기출 문장을 옮긴 곳도 없다(guide 문항 규칙 11).

## 사용자가 볼 것

시험과 표준이 어긋나는 곳은 ADR-059의 규칙대로 처리했다. 사용자 결정이 필요하지 않다고 봤다. 출처 step 0·5·11의 「사용자 확인」도 모두 「없음」이었다.

- **E30** — 시험은 TFTP를 「신속한 파일 전송에 FTP보다 훨씬 효과적」이라고 맞는 말로 둔다.
  RFC 1350·1123은 이와 다르게 쓴다. TFTP는 작고 구현하기 쉬우며, 블록마다 확인 응답을 기다리므로 지연이 큰 경로에서는 성능이 좋지 않다. 본문은 RFC대로 썼다.
- **E31** — 시험은 「UDP라 데이터를 잃을 수 있다」를 TFTP의 단점으로 둔다.
  본문은 RFC 1350대로 썼다. TFTP는 블록마다 확인 응답을 받고, 잃으면 다시 보내 채운다. 여기에 「자격시험은 …을 단점으로 본다」를 한 줄 덧붙였다.
- **E32** — 시험은 SNMP가 「네트워크 확장을 용이하게 해 준다」고 본다.
  본문은 RFC 1157 §3.1의 설계 목표(에이전트를 가볍게, 관리 대상을 넓힐 수 있게)를 한 줄로 썼다.
- **E33** — 시험은 Windows ping 옵션을 하이픈으로 적는다(`ping -t`).
  본문은 Microsoft 참조 페이지대로 빗금(`/t`·`/n`·`/a`·`/l`)을 쓰고, 하이픈 표기도 쓰인다는 「자격시험은」 줄을 덧붙였다.
- **E34** — 시험은 netstat이 「인터페이스의 구성 정보·상태 정보」를 준다고 본다.
  본문은 참조 페이지대로 썼다: `-e` 이더넷 통계, `-r` 라우팅 테이블과 인터페이스 목록. 「자격시험은」 줄은 `netstat` 개념에 한 번만 두었다.
  어댑터의 주소 설정을 묻는 문항의 정답은 ipconfig로 세웠다.
- **허용 출처의 경계** — step 0은 FTP 능동·수동 모드 이름과 수동 모드 포트 범위의 근거로 IIS FTP 문서를 썼다. learn.microsoft.com의 Windows Server 문서라 허용 목록 안이라고 판단했다.
  다르게 보면 `ftp-modes`는 RFC 959·1579·2428만으로도 쓸 수 있다(step 0 summary).

## 통독 뒤 고친 곳 (409f8933)

사실과 정답 논리는 그대로다.

- **n198·n199의 백틱을 뺐다.** 문제문·해설에 `RETR`·`DELE`·`QUIT`·`user4@example.org`가 백틱으로 감싸여 있었다. 문항 화면은 글을 그대로 그려서 백틱 기호가 화면에 보였다.
  step 4가 찾았고, 그 뒤 step마다 「그대로다」로 남겨 둔 것이다. 지금은 네트워크 문항 전체에 백틱이 하나도 없다.
- **「바이트」 풀이 자리를 옮겼다.** `app-protocols-mgmt-security`에서 「바이트」가 처음 나오는 곳은 snmp 문단 3인데, 풀이는 뒤 개념인 mib 문단 0에 있었다(step 10 통독).
  풀이를 snmp 문단 3으로 옮기고 mib 문단 0에서는 덜어 냈다. WRITING_GUIDE 3절 「새로운 전문용어가 등장하면 그 의미를 함께 설명해」를 따른 것이다.
- **`ipconfig /all`의 항목을 보탰다.** step 12는 Windows 문서에서 근거를 찾은 항목(호스트 이름·DNS 서버)만 쓰고, 나머지는 「같은 항목」으로 열어 두었다.
  강의 p194 그림의 `ipconfig /all` 화면에는 물리적 주소, DHCP 사용, 임대 시작·만료 날짜, DHCP 서버가 보인다(`lecture-outline.md:237`, 렌더 이미지로 확인).
  그래서 ipconfig 문단 4에 「물리 주소(MAC 주소)와 DHCP를 쓰는지, DHCP로 받았으면 DHCP 서버의 주소와 임대 시각까지 나온다」는 줄과 임대 풀이 한 줄을 더했다.
  이로써 앞 주제 `ip-address-types.dhcp` 문단 5(같은 내용, step 11·12가 근거를 찾지 못했다고 적은 문단)의 근거도 같은 그림이 된다. 문단 5는 고칠 것이 없다.

그대로 둔 것:

- **같은 주제 안에서 두 번 푼 낱말**(step 10 통독) — 클라이언트·서버(ntp 문단 0·tls 문단 0)와 암호화(snmp-versions 문단 3·tls 문단 1)다.
  ntp의 풀이는 「시계를 맞추려는 쪽·시각을 알려 주는 쪽」이라는 NTP 안의 역할이다. tls 문단 1의 암호화는 TLS가 하는 세 가지 보호를 늘어놓는 문장의 한 항목이다.
  풀이가 어긋나지 않고, 덜어 내면 각 개념의 문장이 홀로 읽히지 않는다. WRITING_GUIDE도 두 번 푸는 것을 막지 않는다.
- **netstat LISTEN 줄의 외부 주소 표기** — `netstat` 문단 3은 Windows 참조 페이지대로 포트가 정해지지 않으면 `*`라고만 쓴다.
  step 15가 읽은 Windows Server 2003 글의 출력 예는 `0.0.0.0:0`으로 적는다. 판이 달라서 생긴 차이로 보았다(step 15와 같은 판단).
- **예/아니요 해설의 첫머리** — 「예.」·「아니요.」로 시작하는 해설과 그렇지 않은 해설(n214·n218·n220·n223·n225)이 섞여 있다. 정답은 화면이 따로 보이므로 그대로 두었다.

## 문항 통독과 손 검산

메인 세션이 n196~n225를 모두 읽었다. 정답이 하나로 정해지는지, 오답이 같은 범주 안에 있는지, 해설이 오답마다 까닭을 대는지 봤다. 정답이 흔들리는 문항은 없었다.
계산이 나오는 곳은 손으로 다시 셈했다. 모두 맞다.

- TFTP 1,300바이트: 블록 1·2가 512바이트씩, 1,300 − 1,024 = 276바이트가 블록 3이다. 276 < 512이므로 블록 3이 마지막이다(`tftp` 문단 6~8).
- sysUpTime OID: iso(1)·org(3)·dod(6)·internet(1)·mgmt(2)·mib-2(1)·system(1)·sysUpTime(3) → `1.3.6.1.2.1.1.3`이고, 값 하나짜리 객체라 `.0`을 붙인다(`mib` 문단 3·5, n208).
- 폴링 메시지 수: 장비 20대 × 요청·응답 2 = 5분마다 40개다. 한 시간이면 40 × 12 = 480개, 1분 간격이면 40 × 60 = 2,400개로 다섯 배다(`snmp-operations` 문단 4).
- stratum: 주 서버 1 → 2 → 그 서버에서 받는 학교 서버 3(n211, `ntp` 문단 4).
- pathping 시간: 250밀리초 × 4홉 = 1초이고, 1초 × 100 = 100초다. 문서 예 5홉 → 125초와 같은 셈이다(`pathping` 문단 2).
- pathping 잃은 비율: 10 ÷ 100 = 0.1 → 10%(`pathping` 문단 5).

## 다시 돌린 검증 (phase가 끝난 뒤, 통독 수정까지 넣은 상태)

실행 프로세스가 모두 끝난 뒤라 부하가 겹치지 않았다. HEAD 409f8933.

```
npm run build   → ✓ built, exit 0
npm run lint    → exit 0
npm test        → Test Files 403 passed (403), Tests 8858 passed (8858)
check-path-crossings → 교차 없음 — 세로 노드 2139개·경로 1446개, 가로 노드 2139개·경로 1446개
check-verbatim --subject network → 전사 이상 없음 — network: 원본 2개, 단위 2059개
균형 → 문항 225 마지막 n225 정답 위치 35/35/35/35 예 42 아니요 43
git status --porcelain → 이 보고서(verification.md) 한 줄뿐
```

- 기존 18주제 객체와 기존 문항 195개는 origin/develop be993a9와 통째로 같다(node로 비교).
  주제 차례는 `… → tcp-connection → app-protocols-mail-file → app-protocols-mgmt-security → diagnostic-commands → linux-filesystem → …`이다.
- 바뀐 파일은 `src/data/network/{topics,questions}.json`·`index.ts`·`visuals/` 새 파일 셋, 새 도식 컴포넌트·테스트, `registry.ts`, `docs/source/network/{standards,exam-notes}.md`, phase 메타데이터뿐이다.
- 새 도식 파일에는 16진 색·애니메이션·빨강·초록·주황·이모지·O/X가 없다(grep).

## 화면 실측

headless Chrome(CDP)과 개발 서버로 세 주제 페이지를 폭 320·390·1180에서 열었다. 도식마다 「전체」와 모든 시나리오를 눌러 보이는 글자를 화면 픽셀로 쟀다.
스크립트는 `p78-run\measure-p78.cjs`이고, `measure-p77.cjs`에서 주제만 바꿨다. 스크린샷 75장은 `p78-run\shots\`에 있다(저장소 밖).

| 폭 | 주제 | 도식 | 상태 | 노드 | 글자 | 도식 폭 | 가로 넘침 | 문제 |
|---|---|---|---|---|---|---|---|---|
| 320 | app-protocols-mail-file | 8 | 33 | 286 | 426 | 320 | 0 | 0 |
| 320 | app-protocols-mgmt-security | 9 | 33 | 228 | 346 | 320 | 0 | 0 |
| 320 | diagnostic-commands | 8 | 31 | 323 | 426 | 320 | 0 | 0 |
| 390 | (세 주제 같음) | 25 | 97 | 837 | 1198 | 380 | 0 | 0 |
| 1180 | (세 주제 같음) | 25 | 97 | 837 | 1198 | 638/621 | −15(스크롤 막대) | 0 |

- 「문제」는 네 가지를 센다: SVG 밖으로 나간 글자, 상자보다 넓은 노드 라벨, 서로 겹친 글자, 그룹 박스 테두리에 걸친 글자. 곁말이 노드에 겹치는 것도 본다.
- 검사기가 실제로 잡는지 먼저 시험했다. 곁말·노드 라벨·그룹 라벨을 일부러 망가뜨리자 세 폭에서 106건을 잡았다(SVG 밖 37·라벨 넘침 33·그룹 테두리 24·글자 겹침 12).
- 콘솔에는 vite 연결과 React Router의 미래 플래그 경고만 나왔다(앞 phase와 같음).
- 스크린샷 넉 장(320의 netstat 결과 줄·Linux netstat 옵션, 1180의 Windows netstat 옵션·ipconfig 옵션)은 눈으로도 봤다.
