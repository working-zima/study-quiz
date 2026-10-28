# phase 72 검증 보고

확인한 날: 2026-10-28. 브랜치 `feat-72-network-ethernet-switch`(origin/develop a7507f9에서 분기), 설계 커밋 9cf09f1, phase 완료 커밋 52bfd9c.
step 0~3은 Windows PC의 network worktree에서 codex로 돌렸고, 브랜치를 push(43e141a)한 뒤 Mac의 메인 저장소로 옮겨 step 4부터 이었다.
Mac에는 gitignore된 `docs/source/network/raw/`를 사용자가 복사해 두었고, `check-verbatim --subject network`가 원본 2개를 실제로 대조하는 것을 확인한 뒤 돌렸다.

## step별 결과

| step | 에이전트 | 걸린 시간 | 결과 | 테스트 |
|---|---|---|---|---|
| 0 ethernet-sources | codex | 21분 | `ethernet`이 쓸 사실을 허용 출처에서 확인, 강의 수정 이력 L26~L29 | 3372 |
| 1 switch-sources | codex | 26분 | `hub-switch-vlan`이 쓸 사실, L30~L32, exam-notes E4~E8, 허용 출처에 cisco.com 제품 문서(VTP에만) | 3372 |
| 2 ethernet-names | codex | 24분 | 개념 1 이더넷·2 이더넷 규격 이름, n026~n028 | 3416 |
| 3 speeds-nic | codex | 22분 | 개념 3 패스트·기가비트 이더넷·4 NIC, n029~n030 | 3461 |
| 4 mac-frame | codex | 16분 | 개념 5 MAC 주소·6 이더넷 프레임, n031~n032 | 3495 |
| 5 frame-fields | Claude | 24분 | 개념 7 이더타입/길이 필드·8 FCS, n033~n034 — `ethernet` 완성 | 3537 |
| 6 hub-duplex | Claude | 19분 | 개념 9 허브·10 반이중과 전이중, n035~n036 | 3583 |
| 7 collision-csma | Claude | 24분 | 개념 11 충돌 도메인·12 CSMA/CD, n037~n039 | 3627 |
| 8 switch-table | Claude | 23분 | 개념 13 스위치·14 MAC 주소 테이블, n040~n041 | 3675 |
| 9 forwarding-stp | Claude | 25분 | 개념 15 플러딩·포워딩·필터링·16 STP, n042~n043 | 3725 |
| 10 broadcast-vlan | Claude | 23분 | 개념 17 브로드캐스트 도메인·18 VLAN, n044~n046 | 3773 |
| 11 vlan-details | Claude + 메인 세션 | 30분 + 마무리 | 개념 19 포트·MAC 주소 기반 VLAN·20 VLAN 태그와 트렁크(VTP 문단), n047~n048 — `hub-switch-vlan` 완성 | 3817 |

결과: 개념 20개(`ethernet` 8 ★★☆ · `hub-switch-vlan` 12 ★★★), 문항 23개(n026~n048), 도식 20개(개념마다 하나), 새 테스트 445개.

## 실행 중에 일어난 일

- **codex 사용량 한도(step 5).** step 4가 `completed`를 쓴 직후 한도에 걸렸고, step 5는 `You've hit your usage limit`으로 0초 만에 세 번 실패해 error가 커밋됐다(2eca6e0).
  작업 변경이 없었으므로 그 기록만 되돌렸다(bcd5eb8). 사용자가 Claude로 바꾸라고 해 step 5~11은 `--agent claude`로 돌렸다.
- **step 11 시간 제한.** Claude 에이전트가 글·문항·도식·테스트·`standards.md`를 다 쓴 뒤 마무리 검증 중 `execute.py`의 1800초 제한에 걸려 `TimeoutExpired`로 끝났다(커밋 전).
  사용자 승인을 받아 작업을 버리지 않고, 메인 세션이 step 11 문서의 검증 절차(공통 AC, 주제·개념 수, `parentId`, 앞 데이터 불변, 주제 통독, VTP 출처 범위)를 다시 하고
  summary를 써서 실행기와 같은 형식으로 커밋했다(9b81cbc·3b82dc1). 그 뒤 실행기를 다시 돌려 phase 완료를 찍었다(52bfd9c).
- 실패한 step의 반쯤 된 작업이 브랜치에 남은 곳은 없다.

## 설계와 달라진 것

모두 step summary에 이유가 있고, 받아들였다.

- **프리앰블·SFD는 프레임 밖**(step 4, L28). 강의 그림은 8바이트를 프리앰블로 헤더에 넣었지만, 802.3 작업 그룹의 현재 용어대로 목적지 MAC 주소~FCS를 프레임으로 쓰고 강의와 다른 점을 본문에 밝혔다.
- **문항 상황을 본문 예와 다르게**(step 6 n035). 본문 예(A→C) 그대로면 정답 보기가 본문 문장과 같아 기억으로 풀리므로 B→D로 냈다.
- **「L2 스위치」는 자격시험의 이름으로**(step 8, E7). 허용 출처에 그 이름이 없어 「자격시험은 L2(2계층) 스위치라 부른다」로 썼다.
- **에이징 까닭의 근거로 RFC 4761을 새로 열었다**(step 8). step 1 항목에 근거가 없었다. RFC라 허용 출처 안이다.
- **VLAN 사이 통신은 그리지 않았다**(step 10, E4). 3계층 장비를 거친다는 것은 자격시험의 시각이라 본문에만 그렇게 밝혔다.
- **VTP는 한 문단이 아니라 두 문단**(step 11). 무엇·도메인·알림 / 모드로 나눴다. 버전별 세부·명령은 넣지 않았다.
- **MAC 주소 기반 VLAN에는 영문 이름을 붙이지 않았다**(step 11). 허용 출처에 그 방식이 없어 강의 사실로만 쓴다(`standards.md`).

## 사용자가 볼 것

- **VTP가 「시스코 고유이고 Catalyst 대부분에 있다」는 한 문장의 출처.** 허용한 시스코 설정 가이드 두 편에 이 문장이 없어, step 11이 시스코 TAC의
  「Configure VTP on Catalyst Switches」(설정 예제·기술 지원 문서)를 시스코 제품 문서로 보고 가져왔다. 학습·마케팅 페이지는 아니지만 설계 때 정한 「설정 가이드·명령 참조」보다 넓다.

## 남겨 둔 것

- 개념 7(이더타입/길이)의 IPv6 풀이에 「주소 길이를 32비트에서 128비트로 늘렸다」가 들어갔다 — step 문서의 「한 줄 풀이만」보다 조금 길지만 틀린 사실은 아니다.
- 개념 20 넷째 문단이 프레임 필드 순서를 `ethernet` 주제와 겹쳐 다시 말한다. 이 주제만 펼쳐 읽어도 서도록 둔 것이다.
- `estimateTextWidth`는 반각 문자를 0.55em으로 잡는데, 크기 9의 「VLAN 2」는 Chrome에서 약 0.61em이었다. 그래서 테스트는 통과해도 실제 글자가 1px쯤 넘칠 수 있다(아래 화면 확인에서 한 곳).
  모든 도식이 쓰는 함수라 이 phase에서는 고치지 않았다.
- `check-verbatim`은 공식 문서를 대조하지 못한다(ADR-059 「트레이드오프」). 이 Mac에서 과목 구분 없이 돌리면 AWS 쪽 1건(`cost-management.compute-vs-ec2-instance-savings-plans`)이 걸리는데,
  이 PC에만 `concepts-raw.md`가 있어 드러나는 기존 건이고 phase 72 범위 밖이다.

## 다시 돌린 검증 (phase가 끝난 뒤)

- `npm run build`·`npm run lint` 통과(청크 500kB 초과 경고 하나 — 실패가 아니다), `npm test` 157파일·3817개 통과.
- 교차 검사 「✓ 교차 없음 — 세로 노드 629개·경로 505개, 가로 노드 629개·경로 505개」(phase 시작 497/380에서 +132/+125).
- `check-verbatim --subject network` 「전사 이상 없음 — 원본 2개, 단위 388개」.
- 문항 48개, 예 8·아니요 9, 정답 위치 7/8/8/8 — 균형 규칙(예/아니요 차이 1 이하, 위치 차이 2 이하) 안.
- 주제 `network-basics,protocols-encapsulation,ethernet,hub-switch-vlan`, 개념 43.
- step 4 끝, step 5 끝, step 6~11 묶음 끝(그리고 step 11 단독)에서 앞 데이터(다른 주제, 앞 개념, 앞 문항, 기존 도식 JSON)를 그 직전 커밋과 통째로 비교해 바뀐 것 0을 확인했다.
- phase 전체에서 AWS 데이터(`src/data/aws/`), `src/pages/`, `src/types/`, `src/lib/`, `scripts/`, 교차 검사기는 바뀌지 않았다.

## 화면 확인 (headless Chrome + CDP, 개발 서버 `127.0.0.1:5270`)

설치된 Chrome을 headless로 띄우고 저장소의 `ws`로 CDP를 몰았다(스크립트는 저장소 밖). 폭 320·390(배율 2, 모바일)과 1180(배율 1).

- **넘침** — 세 폭에서 두 주제 모두 페이지 가로 넘침 0. 모든 시나리오 버튼을 누른 뒤에도 0. 도식 폭은 320·380, 1180에서는 가로형 638·621.
- **도식 20개의 모든 시나리오**(폭마다 70개 상태 — `ethernet` 29, `hub-switch-vlan` 41)를 하나씩 눌러 보이는 SVG 글자를 화면 픽셀로 쟀다.
  SVG 밖으로 나간 글자 0, 노드 라벨이 자기 상자보다 넓은 곳 0, 글자끼리 겹친 곳 0, 곁말이 노드 상자에 겹친 곳 0.
  측정기가 결함을 잡는지는 `row-mac-a` 라벨을 일부러 길게 바꿔 「SVG 밖」·「상자보다 넓음」 두 가지가 나오는 것으로 확인했다.
- **곁말·라벨이 그룹 박스 테두리에 걸치는 곳** — 한 곳을 찾아 고쳤다. `VlanTrunkDiagram` 세로형에서 「VLAN 2 프레임」의 곁말 「VLAN 2」(x 244, 시작 정렬)가
  프레임 박스 오른쪽 테두리를 320px에서 1.0px, 390px에서 1.2px 넘었다. 곁말 둘을 태그 칸 오른쪽(238)과 박스 오른쪽(276) 사이 가운데(x 257, 가운데 정렬)로 옮겼다 —
  테스트의 기대 좌표를 먼저 바꿔 두 개가 실패하는 것을 본 뒤 고쳤다. 고친 뒤 세 폭 모두 걸침 0.
- **step 4·11에서 실측하지 못했던 곳** — MAC 주소 도식 첫 칸의 비트 곁말(「00000000」·「오른쪽 끝 0: 개별 주소」·「그 왼쪽 0: 전역 관리」)과
  VLAN 소속 도식 세로형의 `00-00-5E-00-53-01 · VLAN 1` 칸(폭 180)은 320px에서 넘치지 않는다. 스크린숏으로도 봤다.
- 콘솔 — 오류 0. 경고는 기존의 React Router future flag 두 종류뿐.
- 실기기는 보지 않았다.
