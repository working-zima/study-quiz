# Step 8: transport-dnssec

## 배경

phase 79는 네트워크 과목의 `dns`·`linux-servers`를 만든다. 전체 계획·결정·공통 규칙은 `phases/79-network-dns-linux-servers/guide.md`에 있다.
**이 step은 `dns`의 마지막 개념 둘(13 DNS가 쓰는 UDP와 TCP, 14 DNSSEC)의 글·문항·도식을 만들고, 이 주제를 끝낸다.** 둘 다 머리 개념이다. 쓰기를 마친 뒤 주제 전체(14개념)를 통독하는 데 시간을 쓴다.

기출은 TCP와 UDP를 모두 쓰는 응용 프로토콜로 DNS를 두 번 고르게 하고(L11), BIND를 운영할 때 「방화벽에서 UDP 53번만 열면 된다」를 틀린 말로 둔다.
DNSSEC은 응답의 무결성과 출처 인증을 준다는 것을 묻는다 — 오답은 캐싱 메커니즘, Windows Server에서 지원하지 않는다, 모든 질의를 자동으로 암호화한다.

## 읽어야 할 파일

- **`phases/79-network-dns-linux-servers/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/79-network-dns-linux-servers/index.json`의 step 5 `summary`(DNS가 TCP를 쓰는 때의 목록과 근거, 응답 크기 한도와 잘림 표시, DNSSEC이 주는 것과 주지 않는 것, 레코드 이름, E 번호)와 step 0~7 `summary`
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-041**, **ADR-044**, **ADR-046**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 L11, `docs/source/network/standards.md`(「(phase 79 step 5)」 줄과 RFC 1035·7766·6891·9364·4033 항목, learn.microsoft.com DNSSEC 항목), `docs/source/network/exam-notes.md`
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`(**step 1~7이 쓴 `dns` 열두 개념**, `tcp-udp.udp`·`tcp-udp.transport-choice`의 DNS 문단과 UDP·TCP 풀이, `ports.well-known-ports`의 DNS 항목, `app-protocols-mgmt-security.tls`의 전자 서명·공개 키·인증서 풀이 — 뜻을 맞춘다),
  `src/data/network/questions.json`, `src/data/network/visuals/dns.json`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식, `src/components/diagrams/networkDiagramCoverage.test.ts`
- step 1~7이 만든 도식과 그 테스트, 선례 `ThreeWayHandshakeDiagram`(두 장치 사이 차례)·`DirectoryTreeDiagram`(나무)과 그 테스트, `src/components/diagrams/registry.ts`
- `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`
- 기출 [기출 2025-05-25 #42], [기출 2026-02-01 #8], [기출 2026-05-17 #11], [기출 2025-11-02 #42] — 보기 묶음이 겹치지 않게 본다(문장을 옮기지 않는다)

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `dns` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 13 | `dns.dns-transport` | DNS가 쓰는 UDP와 TCP | — | **UDP**(연결을 맺지 않고 바로 보내는 전송 방식)와 **TCP**(연결을 맺고 빠짐없이 차례대로 전하는 전송 방식)를 한 줄씩 푼다(`tcp-udp`의 말과 뜻을 맞춘다). DNS는 포트 `53`을 둘 다 쓴다(L11). 보통의 질의·응답은 UDP — 클라이언트 `192.0.2.10`이 로컬 DNS 서버 `192.0.2.53`의 UDP `53`에 묻고 답을 받는 흐름(「예시 값」). TCP를 쓰는 때(step 5의 목록대로) — 응답이 UDP로 보내기에 클 때 서버가 잘렸다는 표시를 한 응답을 보내고 클라이언트가 TCP `53`으로 다시 묻는 흐름을 차례대로, 영역 전송(앞 개념 `dns-zone`을 되짚는 한 줄). DNS 구현이 TCP를 반드시 지원해야 한다는 것(L11·RFC 7766). 그래서 **DNS 서버를 운영할 때 방화벽에서 UDP `53`과 TCP `53`을 함께 열어야 한다**(방화벽 — 한 줄 풀이, step 5 결과대로). 크기 한도의 수와 EDNS는 step 5 결과대로 한 줄 |
| 14 | `dns.dnssec` | DNSSEC (DNS Security Extensions) | — | DNS 응답이 그 영역의 진짜 데이터인지(**출처 인증**)와 도중에 바뀌지 않았는지(**무결성**)를 **전자 서명**으로 확인하게 하는 확장(step 5 결과대로 — 전자 서명·공개 키는 이 화면에서 한 줄씩 풀고 `app-protocols-mgmt-security.tls`의 말과 뜻을 맞춘다). 차례: 영역이 레코드에 서명을 붙여 둔다 → 로컬 DNS 서버가 답과 서명을 받아 그 영역의 공개 키로 확인한다 → 그 공개 키는 위 영역이 보증한다(루트까지 — 레코드 이름 RRSIG·DNSKEY·DS는 step 5 결과대로 한 줄씩). 예: `www.example.com`의 A 레코드에 붙은 서명을 확인하는 차례(「예시 값」). **서명과 암호화가 무엇이 다른지**(4절 — DNSSEC은 응답의 내용을 감추지 않는다, step 5 결과대로). 막으려는 위협(가짜 응답이 캐시에 들어가는 것 — 이름은 step 5 결과대로). Windows Server DNS의 지원은 step 5 결과대로 한 줄 |

쓰기를 마친 뒤 **주제 `dns`의 열네 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말, 개념 사이의 어긋남, 되풀이 — 특히 영역 전송·판 번호·TTL이 `dns-zone`·`dns-cache-ttl`·`soa-record`·`dns-transport`에서 같은 뜻인지)을
summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다.

### 2. 문항 — `src/data/network/questions.json`에 `n243`~`n244`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n243` | `dns-transport` | 4지선다 「상황 적용」 — 장면을 주고 DNS가 TCP `53`을 쓰는 때를 고르게 한다(예: 「클라이언트가 UDP로 보낸 질의에 잘렸다는 표시가 붙은 응답이 돌아왔다. 클라이언트가 다음에 할 일은?」 → 같은 질의를 TCP `53`으로 다시 보낸다). 오답은 같은 범주(헷갈리는 다음 동작 — 잘린 응답을 그대로 쓴다, UDP로 같은 질의를 되풀이한다, 포트 `853` 같은 다른 포트로 묻는다 — 오답이 출처로도 정말 틀렸는지 따진다). 「TCP와 UDP를 모두 쓰는 프로토콜 고르기」 기출 꼴을 그대로 쓰지 않는다. **정답 위치 0** |
| `n244` | `dnssec` | 예/아니요 「오해 바로잡기」 — 시작 때 균형(예 47·아니요 47)에서 **아니요** 쪽으로 세운다. 예: 어떤 영역이 DNSSEC으로 서명돼 있으면 그 영역의 이름을 묻는 질의와 응답의 내용을 중간에서 볼 수 없게 되는가(아니요 — 서명은 감추지 않는다. 출처 인증과 무결성). 해설은 서명으로 무엇을 확인하는지와 무엇을 주지 않는지를 가르친다 |

기출 문항의 문장·보기 묶음을 옮기지 않는다(guide.md 「문항」 11항). 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다 — 계획대로면 예 47·아니요 48, 정답 위치 38/37/37/37.
문항 글에 백틱을 쓰지 않는다(guide.md 「문항」 7항).

### 3. 도식

#### 3-1. `dns.dns-transport` — `DnsTransportDiagram`, JSON 키 `dns-transport`

- 물음형 제목 예: `DNS는 언제 UDP를 쓰고 언제 TCP를 쓸까?`
- 그릴 것: 두 기둥 — 왼쪽 클라이언트 `192.0.2.10`, 오른쪽 로컬 DNS 서버 `192.0.2.53` — 사이에 본문의 두 흐름을 위에서 아래로: UDP `53` 질의 → UDP 응답 / UDP 질의 → 잘렸다는 표시의 응답 → TCP `53`으로 다시 질의 → TCP 응답. 영역 전송을 그리려면 본문에 쓴 만큼 — 두 기둥에 들지 않으면 곁말 한 줄로.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `udp` | 보통 질의 | UDP 질의와 응답 | 보통의 질의와 응답은 연결 없이 UDP `53`으로 오간다 |
  | `truncated` | 큰 응답 | 잘린 응답과 TCP 재질의·응답 | 응답이 커서 잘렸다는 표시를 받으면 TCP `53`으로 다시 묻는다 |

- 요점 테스트: `udp`에서 TCP 노드가 흐리거나 보이지 않는다. `truncated`에서 TCP 질의 노드가 잘린 응답 노드보다 아래(뒤)에 있다. 질의 노드는 클라이언트 쪽에서 서버 쪽으로, 응답 노드는 반대 방향의 화살표를 갖는다. 포트 라벨이 모두 `53`이다.

#### 3-2. `dns.dnssec` — `DnssecChainDiagram`, JSON 키 `dnssec-chain`

- 물음형 제목 예: `DNSSEC은 응답의 무엇을 확인해 줄까?`
- 그릴 것: 위에서 아래로 루트 → `com` → `example.com`의 믿음 사슬(나무의 한 갈래 — 층마다 노드 하나, 층 사이 경로에 「위 영역이 아래 영역의 키를 보증」 곁말), 옆에 로컬 DNS 서버와 받은 답(`www.example.com`의 A 레코드 + 서명). 답이 보이는 그대로라는 것을 곁말로(「내용은 그대로 보인다」 같은 본문의 말).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `sign` | 서명 | `example.com`과 서명이 붙은 레코드 | 영역이 레코드에 서명을 붙여 둔다 |
  | `verify` | 확인 | 로컬 DNS 서버·서명 레코드·사슬의 층들 | 공개 키로 서명을 확인하고, 그 키는 위 영역이 보증한다 |
  | `visible` | 감추지 않음 | 답 노드와 「그대로 보인다」 곁말 | 서명은 바뀌지 않았는지 확인할 뿐 내용을 감추지 않는다 |

- 요점 테스트: 사슬 노드의 위아래 차례가 루트 → `com` → `example.com`이다. 어느 노드 라벨·곁말에도 「암호화됨」 같은 말이 없다. `visible`의 곁말에 본문의 「그대로 보인다」 꼴의 말이 있다. 자물쇠 그림·색으로 상태를 가르지 않는다.

위 도식 설계는 출발점이다. 본문(step 5 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼거나 바꾸고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(1~4, 6~8, 10~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 244개, 마지막 id는 `n244`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. L11과 step 5 summary가 「쓰지 않는다」·「자격시험은」으로 정한 것을 지켰는가.
3. n243의 오답 셋이 출처로 정말 틀린지, n244의 주장이 근거로 정해지는지 따진다.
4. 주제 `dns`의 열네 개념을 통독한다(「작업」 1). 도식 열네 개의 문구도 함께 읽는다.
5. `phases/79-network-dns-linux-servers/index.json`의 step 8을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」(「앞 개념에 고칠 것」에 통독 결과).
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **step 1~7의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
- **DNSSEC의 키 관리·서명 알고리즘·NSEC, EDNS의 옵션, 질의를 암호화하는 다른 방식(DoT·DoH)을 쓰지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **BIND의 설정(`dnssec-validation` 등)이나 iptables 규칙을 쓰지 마라.** 이유: `linux-servers`(step 10~14)의 개념이다. 방화벽은 「UDP `53`과 TCP `53`을 함께 연다」까지만.
- **step 5가 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다.
- **`linux-servers` 주제의 개념을 만들지 마라.** 이유: step 10~14의 범위다.
