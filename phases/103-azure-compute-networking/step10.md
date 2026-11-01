# Step 10: protection-sources

## 배경

phase 103은 Azure AZ-900 과목에 주제 셋을 더한다. 전체 계획과 결정은 `phases/103-azure-compute-networking/guide.md`에 있다. step 0~9가 주제 `azure-compute`·`azure-virtual-networking`을 끝냈다.
step 11·12가 주제 `azure-network-protection`(네트워크 보호)의 개념 4개를 쓰기 전에, **이 step은 그 개념들이 쓸 사실을 Microsoft 공식 문서로 확인해 `docs/source/azure/official.md`에 더하고,
덤프·용어집이 공식 문서와 다르거나 공식 문서에 없는 곳을 `docs/source/azure/corrections.md`에 더한다.** 데이터·코드는 고치지 않는다.

이 주제는 **공식 학습 가이드 밖**이다(주제 지도의 `*` — 용어집에 있고 덤프도 묻는 현행 서비스). 그래서 Learn AZ-900 단원이 없고, 제품 문서가 유일한 근거다.
이 주제의 중심 문제는 셋이다.
(1) **덤프 답이 공식 문서와 어긋나 보이는 문항** — 설계 때 본 예: NO.68은 NSG 인바운드 규칙의 원본을 「애플리케이션 보안 그룹만」으로 적는다(IP 주소·서비스 태그·애플리케이션 보안 그룹 모두일 수 있다).
(2) **옛 이름** — 덤프 NO.3이 DDoS Protection을 「Basic/Standard」로 적는다. 현행 이름과 종류를 확인한다(memory: 용어집도 옛 이름을 쓴다).
(3) **NSG와 Azure Firewall의 경계** — 덤프가 「여러 구독·가상 네트워크의 트래픽을 한곳에서」를 Firewall로, 「VM의 포트 허용」을 NSG로 되풀이한다. 그 경계를 공식 문서의 어느 말로 세우는지 찾는다.

## 읽어야 할 파일

- `phases/103-azure-compute-networking/guide.md` — 특히 「배경」, 「세 주제와 개념 21개」의 `azure-network-protection` 표, 「예시 값」, 「출처」, 「출처 step(0·5·10)의 공통 형식」
- `phases/103-azure-compute-networking/index.json`의 step 5 `summary` — 마지막 D·G 번호, NSG를 한 줄로 푼 근거
- `docs/source/azure/CLAUDE.md` — **이 규칙을 따른다**
- `docs/source/azure/official.md`, `docs/source/azure/corrections.md` — 이미 있는 항목 「(phase 101) Azure DDoS Protection — Azure DDoS Protection overview」(DDoS 표기 「분산 서비스 거부」를 정한 줄), step 0·5가 더한 항목과 표기 정리를 먼저 읽는다
- `docs/source/azure/dump-topics.tsv`에서 `primary`나 `secondary`가 `network-protection`인 줄과, 그 문항을 `docs/source/azure/raw/dump/dump.md`에서 찾아 읽는다
  (설계 때 본 것: NO.3·7·31·52·68·102·116·127·163·197·222·229·236·261·269·284·288·379·428·432·441·443·467·483). 그림으로만 표시된 정답은 `raw/dump/img/`의 PNG를 본다. **문장을 옮기지 않는다**
- `docs/source/azure/raw/glossary/`의 NSG·Azure Firewall·DDoS Protection 항목(어느 파일인지 찾는다 — 아키텍처·서비스 또는 ID·보안) — 무엇을 주장하는지만 본다
- `docs/source/azure/raw/official/docs-ddos-protection-overview.md`와 `ko-` 판(phase 101이 받음)
- `docs/ADR.md`의 **ADR-009**, **ADR-021**, **ADR-060**

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

받는 법과 이름 규칙은 step 0과 같다(`python3 -I scripts/azure-source/fetch_page.py …`, 인증서 오류면 `SSL_CERT_FILE=/etc/ssl/cert.pem`). 영문판으로 사실을, 한국어판으로 표기만 본다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `network-security-groups` | NSG의 정의(Azure 리소스로 오가는 트래픽을 거르는 보안 규칙의 묶음), **연결할 수 있는 곳**(서브넷·네트워크 인터페이스 — 가상 네트워크 자체에는 연결하지 않는다는 것의 현행 문서의 말), 서브넷·네트워크 인터페이스마다 연결할 수 있는 NSG 수, NSG 하나를 여러 서브넷·네트워크 인터페이스에 연결할 수 있는지, 서브넷과 네트워크 인터페이스 둘 다에 NSG가 있을 때 트래픽이 어떻게 평가되는지(인바운드는 서브넷 → 네트워크 인터페이스 순서 등 — 한 줄로 쓸 만큼만), 요금(추가 요금이 없다 — VM 개요의 표가 이미 말하면 가리킨다). **포트**·**네트워크 인터페이스**·**트래픽**을 한 줄로 풀 근거. 덤프 NO.261·467(연결 대상 — 그림 정답), NO.236, NO.102·229·269·379·428·441·443(VM으로 들어오는 포트 허용 — 「해결책」 연작의 답이 서로 맞는지) | NSG 개요(`learn.microsoft.com/azure/virtual-network/network-security-groups-overview`), 「How network security groups filter network traffic」(`…/virtual-network/network-security-group-how-it-works`), 한국어판 |
| b | `security-rules` | 보안 규칙의 속성(이름, **우선순위**, 원본·대상, 프로토콜, 방향, 포트 범위, 작업 — 현행 문서의 표), **원본·대상에 쓸 수 있는 것**(IP 주소·주소 범위, **서비스 태그**, **애플리케이션 보안 그룹** — 둘의 정의 한 줄씩), 우선순위 번호의 범위와 **낮은 번호부터 처리하고 맞으면 멈춘다**, **기본 규칙**의 이름·우선순위·내용(인바운드: 가상 네트워크 안 허용, 부하 분산 장치 허용, 나머지 모두 거부 / 아웃바운드: 가상 네트워크 안 허용, 인터넷 허용, 나머지 거부 — 현행대로), 기본 규칙은 지울 수 없지만 더 높은 우선순위의 규칙으로 덮어쓸 수 있다는 것, **상태 저장**(나가는 요청의 응답이 들어오는 것을 따로 허용하지 않아도 된다 — 현행 문서의 말). **인바운드**·**아웃바운드**·**프로토콜**을 한 줄로 풀 근거. **NO.68**: 덤프 답 「애플리케이션 보안 그룹만」이 현행 문서와 맞는지 — D 항목으로 | a의 문서들, 서비스 태그 개요(`learn.microsoft.com/azure/virtual-network/service-tags-overview`), 애플리케이션 보안 그룹(`…/virtual-network/application-security-groups`) |
| c | `azure-firewall` | Azure Firewall의 정의(관리형 클라우드 네트워크 방화벽 서비스, 상태 저장, 고가용성 내장, 크기 조정), **여러 구독·가상 네트워크에 걸쳐 규칙을 한곳에서 만들고 적용하고 기록한다**는 것이 현행 문서의 어느 말로 서는지(Firewall Manager·방화벽 정책 — 「Azure Firewall Manager provides a central place to manage Azure Firewalls across multiple subscriptions」 같은 말), 규칙의 종류(NAT 규칙·네트워크 규칙·애플리케이션 규칙 — 현행 이름과 한 줄 뜻), 위협 인텔리전스, SKU 셋(이름만), **NSG와의 차이**를 공식 문서가 말하는 곳이 있으면(예: 「Azure Firewall and network security groups」 비교, FAQ). **방화벽**·**상태 저장**·**NAT**를 한 줄로 풀 근거. 덤프 NO.127·197·432(여러 구독·가상 네트워크), NO.31(NAT 규칙), NO.7(Traffic Manager로는 안 된다 — 이 주제에서 쓸지) | Azure Firewall 개요(`learn.microsoft.com/azure/firewall/overview`), 기능(`…/firewall/features`), 규칙 처리(`…/firewall/rule-processing`), Firewall Manager 개요(`learn.microsoft.com/azure/firewall-manager/overview`), Azure Firewall FAQ, Learn 「Introduction to Azure Firewall」 모듈 |
| d | `ddos-protection` | DDoS Protection의 정의와 하는 일(트래픽을 지켜보다 공격을 알아차리면 걸러 내고 정상 트래픽은 통과 — 현행 문서의 말), **무엇을 지키는가**(가상 네트워크의 공용 IP 주소를 가진 리소스), **현행 종류**(인프라 보호 — 기본, DDoS Network Protection, DDoS IP Protection — 이름·한국어 표기와 각각이 더 주는 것: 공격 분석·보고서·경고·지원 등), 덤프의 「DDoS Protection Basic/Standard」가 옛 이름이라는 근거(현행 문서가 옛 이름을 언급하면 그 말), **DDoS Protection이 하지 않는 것** — 웹 앱 계층의 공격(예: SQL 주입)은 웹 애플리케이션 방화벽의 몫이라는 것이 현행 문서에 있는지(있으면 한 줄로 쓸 근거, 없으면 「쓰지 않는다」). phase 101 항목에 이미 있는 사실은 다시 적지 않는다. 덤프 NO.3(웹사이트를 공격에서 지키고 공격 보고서 — 덤프 답 DDoS가 현행 기능과 맞는지), NO.163(DDoS 계획을 고쳐 HTTP를 허용 — 아니다). NO.52·116·222는 `azure-security-model`의 몫이라 「쓰지 않는다」로만 | DDoS Protection 개요(받아 둠), 종류 비교(`learn.microsoft.com/azure/ddos-protection/ddos-protection-sku-comparison`), 한국어판 |
| e | 셋 공통 | **NSG·Azure Firewall·DDoS Protection이 트래픽을 암호화하는가**(NO.284·483) — 공식 문서가 암호화를 이들의 기능으로 들지 않는다는 것을 어떻게 기록할지(「공식 문서가 그런 기능을 말하지 않는다」로 쓰지 않는다 처리 / 암호화는 VPN 같은 다른 것의 몫이라는 근거가 있으면 그것). 세 서비스가 「네트워크 보안」 범주로 함께 묶인다는 것(Azure Firewall 개요의 메모) | a·c·d의 문서들 |
| f | 도식 | `NsgAssociationDiagram`(웹 서브넷에 연결한 NSG A — 그 서브넷의 VM 1·VM 2에, 데이터베이스 서브넷 VM 3의 네트워크 인터페이스에 연결한 NSG B — VM 3에만), `NsgRuleOrderDiagram`(우선순위 100의 허용 규칙과 기본 거부 규칙 — 맞는 규칙에서 멈춤), `FirewallHubDiagram`(여러 가상 네트워크의 트래픽이 한곳의 Azure Firewall을 지남), `DdosProtectionDiagram`(공격 트래픽은 걸러지고 정상 트래픽은 공용 IP 주소의 VM에)의 라벨·곁말·캡션의 사실마다 근거가 a~d에 있는지 | a~d의 결과 |

빠진 것을 읽다가 찾으면 더한다. 덤프 문항(위 번호)과 용어집 항목을 하나씩 읽어 공식 문서와 다른 주장이 더 있는지 본다.
NO.52·116·222·288은 다른 주제와 함께 걸린 문항이다 — step 5나 앞 phase의 D 항목에 이미 있으면 새로 만들지 말고 summary에 그 번호를 적는다.

### 2. `docs/source/azure/official.md`에 더한다

guide.md 「출처 step(0·5·10)의 공통 형식」대로. 이미 있는 「(phase 101) Azure DDoS Protection — …」 항목에는 사실 줄을 덧붙이고(끝에 `(phase 103)` — 그 항목의 「DDoS Protection 서비스는 이 주제에서 이름을 쓰지 않는다」는 phase 101 주제의 처리이므로 고치지 않는다), 새로 받은 문서는 새 항목으로 둔다.
끝에 「한국어 표기 정리 — `azure-network-protection`」 항목 — 개념 4개와 규칙 속성·기본 규칙·DDoS 종류의 이름마다 고른 표기와 근거 문서, 섞여 쓰인 표기와 고른 까닭.

### 3. `docs/source/azure/corrections.md`에 더한다

step 5가 쓴 마지막 번호 다음부터(D·G 모두). 미리 본 후보 — 확인한 뒤 해당하면 항목으로 남긴다.

- **NO.68** — NSG 인바운드 규칙의 원본을 「애플리케이션 보안 그룹만」으로 적는다.
- **NO.3 등의 「DDoS Protection Basic/Standard」** — 옛 이름. 현행 이름으로 고쳐 쓴다.
- **용어집의 DDoS 항목** — 옛 이름이면 G 항목.
- **NO.261·467** — 그림 정답이 공식 문서(서브넷·네트워크 인터페이스)와 맞는지, 덤프끼리 갈리는지.
- **NO.284·483** — Firewall·NSG의 암호화에 대한 덤프 답.
- 「해결책」 연작(NO.102·163·229·269·379 등)에서 덤프끼리 답이 갈리면 항목으로.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`azure-network-protection`의 개념 4개마다 한 줄씩: **확정한 `name`(한국어 표기와 그 근거 문서), 무엇을 쓸 수 있는지(출처와 함께), 무엇을 고쳐 쓰는지(D·G 번호), 무엇을 쓰지 않는지**.
위 표의 a~f마다 결과(확인함/덤프가 맞음/못 찾음)와 근거 문서를 적는다.
특히 (1) NSG를 연결할 수 있는 곳과 그 수, (2) 기본 규칙의 이름·우선순위·내용과 상태 저장, (3) Azure Firewall의 「중앙」을 쓸 말과 규칙 종류의 현행 이름, (4) DDoS Protection의 현행 종류와 옛 이름 처리, 웹 앱 공격에 대해 쓸 수 있는 것,
(5) 암호화에 대한 처리, (6) 도식 넷에 쓸 수 있는 사실과 이름. 받은 파일 목록(`raw/official/`). 마지막 D·G 번호. 끝에 「사용자 확인」 칸을 둔다(없으면 「없음」).

## Acceptance Criteria

guide.md 「출처 step(0·5·10)의 공통 형식」의 공통 AC.

## 검증 절차

1. 공통 AC를 실행한다. `npm test`는 그대로 통과해야 한다. `check-verbatim`의 원본 수가 받은 문서만큼 늘어 있어야 한다(시작 값은 step 9가 끝났을 때의 수 — step 9 summary).
2. 바뀐 파일이 `docs/source/azure/official.md`·`corrections.md`와 phase 메타데이터뿐인지 본다.
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 문장이 원문을 옮기지 않았는지 다시 본다. 한국어판과 32자 넘게 겹치지 않는지 `findVerbatimRuns`로 본다.
4. `phases/103-azure-compute-networking/index.json`의 step 10을 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다(인증서 오류는 여기에 들지 않는다).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 11·12가 쓴다.
- **확인하지 못한 사실을 `official.md`·`corrections.md`에 적지 마라.**
- **`docs/source/azure/CLAUDE.md`의 허용 목록을 넓히지 마라.**
- **심층 방어·Microsoft Defender for Cloud·Azure Bastion·웹 애플리케이션 방화벽을 이 주제의 사실로 정리하지 마라.** 이유: 다른 주제의 몫이거나 범위 밖이다(주제 지도 「초안에서 바꾼 것」 — Bastion·WAF는 묻는 문항이 없다). 웹 애플리케이션 방화벽은 DDoS Protection이 하지 않는 일을 가리키는 한 줄의 근거만.
- **step 0·5가 더한 항목과 표기 정리를 고치지 마라.** 이유: 앞 step의 기록이다. 고칠 것을 찾으면 summary에 적는다.
- **`topic-map.md`·`dump-topics.tsv`를 고치지 마라.**
