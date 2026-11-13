# phase 79 검증 보고

확인한 날: 2026-11-13(Windows PC). 브랜치 `feat-79-network-dns-linux-servers`는 origin/develop 3f288a9에서 팠다.
설계 커밋은 758e5b4f, phase 완료 커밋은 f7350e3e, 통독 수정 커밋은 a3c168f7이다. 설계는 사용자가 승인했다(11-12 「응」).
실행은 `scripts/execute.py --agent claude`로 했다. 저장소 밖 `p79-run\run-chunk.cmd`가 실행기(`execute_wrap.py`, subprocess 제한 3600초)를 띄우고, 감독 스크립트(`supervisor.ps1`)가 남은 step을 이어 돌렸다.
통독 수정·AC·화면 실측·이 보고서는 메인 세션이 했다. 병합·push는 하지 않았다.

`dns`는 강의 Ch5-1(p328–351, ★★★), `linux-servers`는 강의 밖(`sourcePages` [0,0], ★★☆)이다.
사실은 표준과 공식 문서에서 가져왔다: RFC, IANA, learn.microsoft.com(Windows Server DNS), man7.org(man-pages 6.19), ISC BIND 9 ARM 9.20.30, Apache HTTP Server 2.4 문서, iptables 1.8.13·netfilter.org.
기출은 범위를 정하고 답을 확인하는 데만 썼다.

## step별 결과

| step | 걸린 시간 | 결과 | 테스트(파일/개) |
|---|---|---|---|
| 0 dns-sources-a | 28분 | `dns` 앞 개념 8개가 쓸 사실(standards.md 「(phase 79 step 0)」), 강의 수정 이력 L48~L51 | — |
| 1 dns-hosts | 24분 | 개념 1 DNS·2 hosts 파일, n226~n228 — 주제 만듦 | 405/8900 |
| 2 hierarchy-name-servers | 27분 | 개념 3 도메인 이름의 계층 구조·4 네임 서버의 종류, n229~n230 | 407/8944 |
| 3 zone-resolution | 40분 | 개념 5 영역과 주·보조 서버·6 이름 풀이 과정, n231~n232 | 409/8984 |
| 4 query-modes-ttl | 23분 | 개념 7 재귀적·반복적 질의·8 DNS 캐시와 TTL, n233~n235 | 411/9024 |
| 5 dns-sources-b | 36분 | `dns` 뒤 개념 6개가 쓸 사실(「(phase 79 step 5)」), 레코드·SOA 필드 표 | — |
| 6 records-soa | 33분 | 개념 9 DNS 레코드·10 SOA 레코드, n236~n239 | 413/9069 |
| 7 reverse-round-robin | 24분 | 개념 11 역방향 조회와 PTR·12 DNS 라운드 로빈, n240~n242 | 415/9108 |
| 8 transport-dnssec | 27분 | 개념 13 DNS가 쓰는 UDP와 TCP·14 DNSSEC, n243~n244, `dns` 통독 — 주제 완성(개념 14) | 417/9148 |
| 9 linux-servers-sources | 40분 | `linux-servers`가 쓸 사실(「(phase 79 step 9)」), Apache 지시자 표 | — |
| 10 resolv-bind | 33분 | 개념 15 DNS 클라이언트 설정 파일·16 BIND와 named, n245~n246 — 주제 만듦 | 419/9190 |
| 11 named-options-httpd | 29분 | 개념 17 named.conf의 options 문·18 Apache와 httpd.conf, n247~n249 | 421/9230 |
| 12 listen-keepalive | 27분 | 개념 19 Listen과 포트 권한·20 KeepAlive와 KeepAliveTimeout, n250~n252 | 423/9272 |
| 13 indexes-request-body | 23분 | 개념 21 Options와 디렉터리 목록·22 LimitRequestBody, n253~n254 | 425/9312 |
| 14 iptables | 22분 | 개념 23 iptables, n255, `linux-servers` 통독 — 주제 완성(개념 9) | 426/9335 |

걸린 시간은 index.json의 `started_at`~`completed_at`이다(Stop 훅 시간 포함).

결과는 이렇다.

- 개념 23개: `dns` 14, `linux-servers` 9.
- 문항 30개(n226~n255): 4지선다 16, 예/아니요 14.
- 도식 23개: 개념마다 하나다.
- 새 테스트 477개: phase 시작 403파일·8858개 → 426파일·9335개.
- 교차 검사 노드·경로: 2139·1446 → 2316·1565.

## 실행 중에 일어난 일

- **사용자 요청으로 멈춤(11-12 16:33).** 사용자가 토큰이 모자라 멈추기 좋은 때에 멈춰 달라고 했다. 그때 step 10은 커밋까지 끝났고(4b8b7425), step 11은 시작한 지 3분째였다.
  감독 트리와 keep-awake를 끄고, step 11이 남긴 변경(index.json의 `started_at` 한 줄)만 되돌렸다. 11-13 10:09에 step 11~14 pending으로 다시 띄웠고 11:50에 끝났다.
- 30분 제한·사용량 한도에 걸린 step은 없다. 오류·blocked도 없다.

## 출처 step의 판정

- 사용자 확인이 필요한 것은 세 출처 step 모두 없었다. 시험의 답이 표준·공식 문서와 어긋난 곳이 없어 새 E 항목은 없다.
- 강의 수정 이력 L48~L51(step 0): p347 재귀 사슬 그림(루트·TLD가 대신 묻는 사슬은 그리지 않는다), 「루트 서버 13대」(이름 13개와 그 뒤의 여러 서버), 권한 있는 서버·리졸버의 설명, 도메인과 호스트 이름의 구분.
- 설계 때 적은 것과 다르게 쓴 것(step 0, 그대로 받아들였다): Linux가 hosts 파일을 먼저 보는지는 `nsswitch.conf`의 `hosts:` 줄에 달렸다, TCP가 필수인 영역 전송은 AXFR이다, 정책 리졸버가 있어 「DNS는 통신을 거르지 않는다」로 절대화하지 않는다.
- 출처를 찾지 못해 쓰지 않은 것: 라운드 로빈의 「멈춘 서버 주소도 계속 답한다」·「캐시 때문에 고르게 안 나뉜다」, DNS 관리자 SOA 탭·라운드 로빈 확인란의 실제 라벨, Indexes가 꺼졌을 때와 LimitRequestBody를 넘었을 때의 상태 코드, iptables 체인 정책의 처음 값, Apache 기본 설치 경로(문서마다 다르다), 「DHCP가 resolv.conf를 고친다」.

## 통독 뒤 고친 곳(a3c168f7)

step 8·14의 통독이 남긴 두 건을 메인 세션이 고쳤다. 사실은 바꾸지 않고 풀이 문장의 자리만 옮겼다.

- `dns.domain-hierarchy` 문단 5가 「255바이트」로 바이트를 처음 쓰면서 풀지 않았다 → 그 자리에 `tcp-udp.tcp`와 같은 풀이(비트 8개를 묶은 단위)를 넣고, `dns.dns-transport` 문단 3의 풀이를 뺐다.
- `linux-servers.httpd-conf` 문단 0이 「운영체제」를 처음 쓰면서 풀지 않았다 → `linux-servers.apache-listen` 문단 4에 있던 풀이 문장을 문단 0으로 옮겼다.

## AC(통독 수정 뒤, 11-13)

- `npm run build` 통과, `npm run lint` 통과.
- `npm test`: 426파일 9335개 가운데 9334개 통과, 1개 실패 — `src/pages/KeywordQuizPage.test.tsx` 「한 판 더를 누르면 …」의 5000ms 제한 초과.
  이 파일만 다시 돌리면 18개 모두 통과한다. phase 79는 이 페이지·컴포넌트·테스트를 건드리지 않았다(3f288a9 이후 diff 없음).
  전체 실행(296초)이 같은 때 메인 저장소에서 돈 Stop 훅의 전체 테스트와 겹친 부하 탓으로 본다. 11-12에도 메인 저장소(main, 변경 없음)에서 같은 테스트가 실행 부하 중에 제한을 넘겼다.
- `node phases/38-service-diagrams/tools/check-path-crossings.mjs`: 「✓ 교차 없음 — 세로 노드 2316개·경로 1565개, 가로 노드 2316개·경로 1565개」.
- `node scripts/check-verbatim.mjs --subject network`: 「✓ 전사 이상 없음 — network: 원본 2개, 단위 2343개」.
- 균형: 문항 255, 예/아니요 예 49·아니요 50, 4지선다 정답 위치 39/39/39/39 — 계획과 같다. n226 이후 문항 글(문제문·보기)에 백틱 0.

## 문항 손 검산

30문항을 모두 읽고 정답과 해설의 수를 다시 셌다.

- n234 TTL: 600 − 240 = 360초.
- n238 SOA: 데이터 차례 MNAME·RNAME·SERIAL·REFRESH·RETRY·EXPIRE·MINIMUM → EXPIRE 1209600초 = 14일.
- n239 RNAME: `admin.example.org.` → admin@example.org.
- n240·n241 역방향 이름: 203.0.113.25 → 25.113.0.203.in-addr.arpa, 203.0.113.40 → 40.113.0.203.in-addr.arpa. 오답 「0.203.25.113」은 둘씩 묶어 그 안에서만 뒤집은 꼴이다.
- n252 KeepAliveTimeout 10: 응답 뒤 12초면 연결이 닫혀 새 연결로 보낸다.
- n254 2MiB: 2 × 1024 × 1024 = 2097152. 2000000은 97152, 2048000은 49152바이트 작다. 2048은 2KiB.
- n255 iptables: 들어오는 SSH 접속은 `INPUT`·`-p tcp`·`--dport 22`. `--sport 22`는 이 서버가 다른 SSH 서버에 접속했을 때의 응답 패킷에 맞는다.
- n247·n248 named.conf: 묻는 쪽을 가리는 것은 `allow-query`, `listen-on`은 서버 자신의 주소·포트. `allow-query`가 없으면 모두 받는다(9.20.30 기본).

정답이 둘로 읽히는 문항, 오답이 다른 범주로 튀는 문항은 찾지 못했다.

## 화면 실측(11-13)

개발 서버(vite, 5274)와 headless Chrome(CDP 9333)으로 `#/network/topic/dns`·`#/network/topic/linux-servers`를 320·390·1180px에서 쟀다. 도식마다 「전체」와 모든 시나리오를 눌러 보이는 글자를 화면 픽셀로 쟀다(`p79-run\measure-p79.cjs`, 결과 `final-measure.txt`).

| 폭 | 주제 | 가로 넘침 | 도식 | 상태 | 노드 | 글자 | 도식 폭 | 문제 |
|---|---|---|---|---|---|---|---|---|
| 320 | dns | 0 | 14 | 54 | 403 | 574 | 320 | 0 |
| 320 | linux-servers | 0 | 9 | 36 | 296 | 402 | 320 | 0 |
| 390 | dns | 0 | 14 | 54 | 403 | 574 | 380 | 0 |
| 390 | linux-servers | 0 | 9 | 36 | 296 | 402 | 380 | 0 |
| 1180 | dns | −15 | 14 | 54 | 403 | 574 | 638/621 | 0 |
| 1180 | linux-servers | −15 | 9 | 36 | 296 | 402 | 638/621 | 0 |

- 1180의 −15는 세로 스크롤바 폭이다. 1180의 도식 폭 638/621은 phase 78 실측과 같은 값이다.
- 자가 시험(`SELFTEST=1` — 곁말 하나를 오른쪽 끝으로, 노드 라벨 하나를 길게, 그룹 라벨을 테두리 위로 옮긴다)에서는 문제 97건을 잡았다. 검사기가 넘침·겹침을 실제로 잡는다.
- 첫 실행의 320px은 개발 서버 첫 컴파일 전이라 도식 0개로 잡혀, 서버가 데워진 뒤 다시 잰 값을 적었다.
- 스크린숏 69장(23도식 × 3폭)은 `p79-run\shots`에 있다(저장소 밖). 가장 높은 둘(320px `IptablesChainsDiagram`·`SoaFieldsDiagram`)을 눈으로 보았고, 글자가 상자 안에 있고 겹침이 없다.
- 콘솔: vite 연결·React DevTools 안내·React Router future flag 경고뿐이고 오류는 없다.
