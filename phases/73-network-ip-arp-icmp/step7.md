# Step 7: extension-slaac

## 배경

phase 73은 네트워크 과목의 `ip-protocol`(IP와 단편화)·`arp`(ARP)·`icmp`(ICMP, IGMP 포함)를 만든다. 전체 계획·결정·공통 규칙은 `phases/73-network-ip-arp-icmp/guide.md`에 있다.
step 2~6이 개념 1~10을 넣었다. **이 step은 IPv6에 딸린 마지막 둘 — 11 확장 헤더와 12 주소 자동 설정(SLAAC) — 의 글·문항·도식을 만들어 `ip-protocol`의 개념 12개를 끝낸다.** 12는 강의에 없고 기출이 세 번 물었다.

## 읽어야 할 파일

- **`phases/73-network-ip-arp-icmp/guide.md` 전체** — 개념 표, 예시 값, 출처·글·문항·도식·파일 형식 규칙, 공통 AC. **이 문서를 따른다**
- `phases/73-network-ip-arp-icmp/index.json`의 step 0·1 `summary`(개념마다 무엇을 쓰고 무엇을 쓰지 않는지)와 앞 step들의 `summary`(같은 주제에서 이미 푼 낱말, 교차 검사 수, 균형)
- **`docs/WRITING_GUIDE.md` 전체**
- `docs/ADR.md`의 **ADR-056**, **ADR-055**, **ADR-059**, **ADR-054**, **ADR-030**, **ADR-026**·**ADR-027**, **ADR-046**, **ADR-041**, **ADR-044**, **ADR-036**·**ADR-037**·**ADR-038**, **ADR-047**·**ADR-048**, **ADR-009**
- `docs/UI_GUIDE.md`의 「도식 전용 색상」과 「도식」 절 전체
- `docs/source/network/CLAUDE.md`, `docs/source/network/lecture-outline.md`의 「Ch3-1 IP(IPv4, IPv6)」 절과 「강의 수정 이력」, `docs/source/network/standards.md`, `docs/source/network/exam-notes.md`
- `docs/source/network/raw/lecture.md`의 p128~p129 — 정리에서 빠진 것이 없는지 원문으로 확인한다(옮기지 않는다)
- `src/data/CLAUDE.md`, `src/components/diagrams/CLAUDE.md`
- `src/data/network/topics.json`, `src/data/network/questions.json`, `src/data/network/index.ts`, `src/data/network/data.test.ts`, `src/data/network/visuals.test.ts`, `src/data/index.test.ts`의 예/아니요 불변식,
  `src/components/diagrams/networkDiagramCoverage.test.ts`
- 도식 선례(guide.md 「도식」에 적힌 파일들), 이 주제에서 앞 step이 만든 도식과 `src/data/network/visuals/ip-protocol.json`, `src/types/visuals.ts`, `src/components/diagrams/DiagramFrame.tsx`(고치지 마라), `src/components/diagrams/registry.ts`, `src/hooks/useWideDiagram.ts`, `src/lib/svg-bounds.ts`

## 작업

### 1. 개념 — `src/data/network/topics.json`

주제 `ip-protocol`의 `concepts` 끝에 덧붙인다. 개념은 guide.md 표의 11 확장 헤더, 12 주소 자동 설정 (SLAAC)이다.

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 11 | `ip-protocol.extension-headers` | 확장 헤더 | `ip-protocol.ipv6` | 없을 수도 여럿일 수도, 다음 헤더 칸으로 사슬처럼 이어진다(p128 그림의 0개·1개·2개). 단편화 확장 헤더의 칸(p129)과 출발지만 나눈다는 것(L4). 경로의 라우터는 대개 확장 헤더를 보지 않는다는 것은 step 0 결과대로. 확장 헤더 종류 이름은 단편화 말고는 늘어놓지 않는다(필요하면 한 문장) |
| 12 | `ip-protocol.slaac` | 주소 자동 설정 (SLAAC) | `ip-protocol.ipv6` | 라우터가 알려 주는 접두사(네트워크 앞부분 — 이 주제 안에서 한 줄로 푼다) + 호스트가 만든 뒷부분 = 자기 주소. 서버 없이 된다는 것이 요점. 「상태 비저장」의 뜻, 겹침 확인, 라우터 알림이 ICMPv6 메시지라는 것은 step 0 결과대로. 예시 접두사는 `2001:db8::/32` 안에서. DHCP는 「주소를 나눠 주는 서버」로 한 줄 |

### 2. 문항 — `src/data/network/questions.json`에 `n061`~`n062`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n061` | `extension-headers` | 예/아니요 또는 4지선다 감 — 확장 헤더가 사슬로 이어지는 원리(기본 헤더의 다음 헤더 칸이 무엇을 가리키는지), 또는 경로 MTU보다 큰 IPv6 패킷을 보낼 때 누가 어떤 헤더를 붙이는지. n050(단편화)·n057(IPv6)과 다른 것을 묻는다. 형식은 균형에 맞춰 고른다 |
| `n062` | `slaac` | 4지선다 「원리 이해」 감 — 주소를 나눠 주는 서버가 없는 네트워크에서 IPv6 호스트가 자기 주소를 얻는 방법. 오답은 같은 범주(DHCP 서버에게 받는다, 관리자가 정해 준다, ARP로 알아낸다 등) |

기출 문항의 문장을 옮기지 않는다 — 시험이 같은 사실을 물어도 상황과 문장은 직접 만든다. 형식·정답 방향은 이 step이 끝났을 때 guide.md 「문항」 9항의 균형을 지키도록 고른다.

### 3. 도식

`src/data/network/visuals/ip-protocol.json`의 `diagrams`에 키를 더한다. 앞 step이 쓴 키는 고치지 않는다.

#### 3-1. `ip-protocol.extension-headers` — `ExtensionChainDiagram`, JSON 키 `extension-chain`

- 물음형 제목 예: `확장 헤더는 어떻게 이어질까?`
- 그릴 것: 기본 헤더 → (확장 헤더) → 상위 계층 헤더와 데이터. 헤더마다 다음 헤더 칸 곁말이 다음 상자를 가리킨다.
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `none` | 확장 헤더 없음 | 기본 헤더와 상위 계층 | 확장 헤더가 없으면 다음 헤더 칸이 곧바로 상위 계층(예: TCP)을 가리킨다 |
  | `fragment` | 단편화 헤더 | 기본 헤더·단편화 헤더·상위 계층 | 출발지가 패킷을 나눌 때 단편화 확장 헤더를 끼운다 |

- 요점 테스트: `none`에서는 기본 헤더에서 상위 계층 상자로 바로 가는 경로가 보이고 단편화 헤더가 흐려진다. `fragment`에서는 기본 헤더 → 단편화 헤더 → 상위 계층으로 이어진 경로가 보인다.

#### 3-2. `ip-protocol.slaac` — `SlaacDiagram`, JSON 키 `slaac`

- 물음형 제목 예: `서버 없이 IPv6 주소를 어떻게 만들까?`
- 그릴 것: 라우터와 호스트 A, 그리고 주소를 이루는 두 칸(접두사 | 호스트가 만든 뒷부분).
- 시나리오:

  | id | label | 선명한 것 | 캡션이 말할 것 |
  |---|---|---|---|
  | `advertise` | 접두사 알림 | 라우터·호스트 A·접두사 칸 | 라우터가 이 네트워크의 접두사를 알린다 |
  | `combine` | 주소 만들기 | 호스트 A와 두 칸 | 호스트가 접두사에 자기가 만든 뒷부분을 붙여 주소를 만든다 |

- 요점 테스트: `combine`의 두 칸 곁말을 이으면 본문의 예시 주소와 같고, 접두사 칸의 값이 `advertise`에서 라우터가 알린 접두사와 같다. 주소를 나눠 주는 서버 노드가 없다.

위 도식 설계는 출발점이다. 본문(step 0·1 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다. 시나리오의 사실이 본문에 없으면 그 시나리오를 빼고 summary에 적는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step(2~14)의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 62개, 마지막 id는 `n062`다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 주제 `ip-protocol`의 개념 순서와 `parentId`가 guide.md 표와 같은지, 앞 step의 개념·문항·도식 문구가 한 글자도 바뀌지 않았는지 node로 본다.
3. 개념마다 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. 요약만 읽고 무엇인지 알 수 있는가, 요약에 아직 풀지 않은 전문용어가 있는가.
   step 0·1 summary가 「쓰지 않는다」·「고쳐 쓴다」·「자격시험은」으로 정한 것을 지켰는가.
   이 step으로 `ip-protocol` 주제가 끝난다 — 주제의 개념 전부를 처음부터 끝까지 통독하고, 같은 말의 되풀이와 앞뒤 개념의 어긋남을 찾는다(고치지 말고 앞 step의 것이면 summary에 적는다).
4. `phases/73-network-ip-arp-icmp/index.json`의 step 7을 갱신한다.
   - 성공 → guide.md 「summary에 적을 것」.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - `check-verbatim`이 원본을 찾지 못해 「건너뜀」으로 끝나면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다.

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`arp`·`icmp` 주제의 개념을 만들지 마라.** 이유: step 8~14의 범위다.
- **step 0·1이 확인하지 못한 사실을 사실처럼 쓰지 마라.** 이유: 확인하지 못한 사실은 쓰지 않는다. 필요하면 허용한 출처를 열어 확인하고 `standards.md`에 먼저 더한다.
