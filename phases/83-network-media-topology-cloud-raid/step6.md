# Step 6: tdm-wdm-review

## 배경

phase 83은 네트워크 과목의 `transmission-media`·`network-topology`·`cloud-sdn`·`raid-storage`를 만든다. 전체 계획·결정·공통 규칙은 `phases/83-network-media-topology-cloud-raid/guide.md`에 있다.
**이 step은 `transmission-media`의 마지막 개념 둘(9 시분할 다중화, 10 파장 분할 다중화)의 글·문항·도식을 만들고, 주제 전체(10개념)를 통독한다.** 둘 다 `multiplexing`에 딸린 개념이다.
쓰기를 마친 뒤 주제 전체를 통독하는 데 시간을 쓴다.

기출은 보낼 데이터가 없어도 타임 슬롯을 주어 대역폭을 낭비하는 방식이 TDM(동기식)임을 묻고([기출 2024-11-03 #19]·[기출 2025-05-25 #19] — 오답 STDM·FDM·FDMA),
WDM이 광 증폭기로 중계 없이 먼 거리를 보낸다는 것을 묻는다([기출 2025-05-25 #22]·[기출 2026-05-17 #20] — 「회선을 늘리기 어렵다」·「시간축에서 다중화」·「채널마다 같은 형식·속도·프로토콜」이 틀린 말).

## 읽어야 할 파일

- guide.md 「개념을 넣는 step의 공통 — 읽어야 할 파일」 전부. 그에 더해:
- `phases/83-network-media-topology-cloud-raid/index.json`의 step 3 `summary`(타임 슬롯·프레임, 동기식·통계적 TDM, WDM·DWDM·CWDM·광 증폭기, E 번호)와 step 0~5 `summary`
- `src/data/network/topics.json` — **`transmission-media`의 앞 개념 여덟**(특히 `multiplexing`·`optical-fiber`·`transmission-impairments`), `protocols-encapsulation.circuit-switching`·`packet-switching`(정해 둔 몫과 나눠 씀 — 뜻을 맞춘다), `network-devices.repeater`
- 도식 선례: `MuxDemuxDiagram`·`PonSplitDiagram`(이 phase), `TftpBlocksDiagram`·`EncapsulationDiagram`(칸 줄)과 그 테스트

## 작업

### 1. 개념 — `src/data/network/topics.json`의 `transmission-media` 끝에 덧붙인다

| # | id | name | parentId | 이 step에서 특히 |
|---|---|---|---|---|
| 9 | `transmission-media.tdm` | 시분할 다중화 | `transmission-media.multiplexing` | 타임 슬롯·프레임(한 줄씩 — 앞 개념의 슬롯과 뜻을 맞춘다), 동기식 TDM과 통계적 TDM(step 3 결과대로 — 「TDM」이라고만 하면 무엇을 가리키는지도 근거대로), 칸에 누구 것인지 알리는 표시(근거대로). `circuit-switching`·`packet-switching`의 정해 둔 몫·나눠 씀과 뜻을 맞춘 한 줄. **동기식 TDM과 통계적 TDM**(4절). 계산 예: 입력 A·B·C·D 넷 가운데 이번 바퀴에 A·C만 보낼 데이터가 있을 때, 동기식 TDM은 칸 넷 가운데 둘이 비고 통계적 TDM은 칸 둘만 쓴다(「예시 값」 — 단계대로) |
| 10 | `transmission-media.wdm` | 파장 분할 다중화 | `transmission-media.multiplexing` | 파장(한 줄), WDM의 뜻, DWDM·CWDM(격자 간격 — step 3 결과대로), 광 증폭기(빛인 채로 여러 파장을 함께 키운다 — step 3의 말대로), 파장마다 다른 속도·형식(근거대로), 파장을 더해 늘린다(근거대로). 「무중계」의 처리는 step 3 결과대로. **WDM과 FDM**(4절), **광 증폭기와 리피터**(4절 — `transmission-impairments`의 증폭기·리피터 문단과 뜻을 맞춘다). 예: 파장 λ1~λ4의 빛 넷이 광섬유 한 가닥으로 가고 중간의 광 증폭기가 넷을 한꺼번에 키운다(λ1~λ4는 이름표) |

### 2. 문항 — `src/data/network/questions.json`에 `n363`~`n364`

| id | 개념 | 방향(바꿀 수 있다 — 바꾸면 이유를 summary에) |
|---|---|---|
| `n363` | `tdm` | 예/아니요 「개념 비교」 — **아니요** 쪽으로 세운다. 동기식과 통계적 TDM을 바꾼 오해를 겨냥한다 — 예: 입력 다섯을 동기식 TDM으로 다중화할 때, 이번 바퀴에 보낼 데이터가 없는 입력에는 타임 슬롯을 주지 않아 대역폭을 아끼나요?(아니요 — 그것은 통계적 TDM, step 3 결과대로). 해설은 빈 슬롯이 왜 생기는지와 통계적 TDM이 무엇을 더 붙이는지를 가르친다. 기출 묶음(TDM·STDM·FDM·FDMA)을 쓰지 않는다 |
| `n364` | `wdm` | 4지선다 「원리 이해」 — 기출의 특징 넷 묶음을 쓰지 않는다. 광 증폭기가 하는 일을 상황으로 묻는다 — 예: 파장 여덟 개가 실린 긴 WDM 회선 중간에서, 파장마다 빛을 전기로 바꾸지 않고 여덟 파장을 한꺼번에 키우는 장치를 둔다. 이 장치가 하는 일로 맞는 것은(정답 — 빛인 채로 함께 키운다, 오답 — 파장마다 전기로 바꿔 다시 만든다(리피터의 일)·파장을 하나로 합친다(다중화기의 일)·한 가닥의 빛을 여러 가닥으로 나눈다(광 분배기의 일), step 3 결과대로). **정답 위치 1** |

이 step이 끝나면 예 73·아니요 73, 정답 위치 55/55/54/54다(guide.md 「문항」 9항). 문항 글에 백틱을 쓰지 않는다.

### 3. 도식

#### 3-1. `tdm` — `TdmSlotsDiagram`, JSON 키 `tdm-slots`

- 물음형 제목 예: `보낼 데이터가 없는 입력의 칸은 어떻게 될까?`
- 그릴 것: 입력 A·B·C·D 노드(세로로 — A·C 곁에 곁말 「보낼 데이터 있음」), 「다중화기」, 그 오른쪽에 프레임 칸 줄 둘 — 동기식 줄은 칸 넷(A·빈 칸·C·빈 칸), 통계적 줄은 칸 둘(A·C — 칸 이름에 「A의 데이터」처럼 누구 것인지 보인다, 근거대로). 두 줄은 서로 다른 자리에 둔다. 280 폭에서 칸 넷이 한 줄에 들지 않으면 칸을 세로로 쌓는다(guide.md 「도식」).
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `sync` | 동기식 TDM | 입력 넷·다중화기·동기식 칸 넷 | 입력마다 칸을 늘 하나씩 주어 B·D의 칸이 빈 채로 간다 |
  | `stat` | 통계적 TDM | 입력 넷·다중화기·통계적 칸 둘 | 보낼 데이터가 있는 A·C에만 칸을 준다 |

- 요점 테스트: `sync`의 선명한 칸 노드가 넷이고 그 가운데 빈 칸이 둘(본문 예와 같다), `stat`의 선명한 칸 노드가 둘이다. 두 시나리오의 선명한 칸 노드 집합이 겹치지 않는다.

#### 3-2. `wdm` — `WdmWavelengthsDiagram`, JSON 키 `wdm-wavelengths`

- 물음형 제목 예: `광섬유 한 가닥에 여러 신호를 어떻게 싣고 멀리 보낼까?`
- 그릴 것: 왼쪽 λ1~λ4 송신 노드(세로로), 「다중화기」 → 「광섬유」 → 「광 증폭기」 → 「광섬유」 → 「역다중화기」 → λ1~λ4 수신 노드. 280 폭에서는 가운데 줄을 세로로 내려 놓는다.
- 시나리오:

  | id | label | 선명한 것 | 곁말·캡션이 말할 것 |
  |---|---|---|---|
  | `combine` | 한 가닥에 싣기 | 송신 넷·다중화기·첫 광섬유 | 파장이 다른 빛 넷을 한 가닥에 함께 싣는다 |
  | `amplify` | 빛인 채로 키우기 | 광섬유·광 증폭기와 그 앞뒤 경로 | 빛을 전기로 바꾸지 않고 넷을 한꺼번에 키운다(본문대로) |
  | `split` | 다시 나누기 | 둘째 광섬유·역다중화기·수신 넷 | 받는 쪽이 파장마다 다시 나눈다 |

- 요점 테스트: `amplify`에서 광 증폭기로 들어가는 보이는 경로와 나오는 보이는 경로가 하나씩이다(파장마다 따로 가지 않는다). 세 시나리오의 선명한 노드 집합이 서로 다르다.

위 도식 설계는 출발점이다. 본문(step 3 결과)과 맞지 않거나 280 폭에 들지 않으면 바꾸되, 바꾼 것과 이유를 summary에 적는다.

### 4. 주제 `transmission-media` 통독

쓰기를 마친 뒤 **주제 `transmission-media`의 열 개념을 처음부터 끝까지 통독**하고, 앞 개념에 고칠 것(풀이가 빠진 낱말 — 특히 이더넷·IP를 모르는 학습자에게, 개념 사이의 어긋남, 되풀이, 같은 사실을 여러 곳이 다르게 말하는 곳 — 예: 감쇠·대역폭·전자기 간섭의 말, 리피터와 증폭기, 단위 표기, 광섬유를 푼 자리)을 summary의 「앞 개념에 고칠 것」에 적는다 — 고치지는 않는다. 도식 열 개의 문구도 함께 읽는다.

## Acceptance Criteria

guide.md 「개념을 넣는 step의 공통 AC와 검증」의 명령 전부. 이 step이 끝나면 문항은 364개, 마지막 id는 `n364`이다.

## 검증 절차

1. guide.md 공통 AC를 실행하고 그 절의 확인을 모두 한다.
2. 개념을 WRITING_GUIDE 「6. 최종 검토」와 「맥락」 절의 질문으로 다시 읽는다. TDM의 계산 예를 칸마다 손으로 다시 센다.
3. n364의 보기 넷을 step 3의 근거로 하나씩 따져 정답이 하나뿐인지 본다.
4. 주제 `transmission-media`의 열 개념을 통독한다(「작업」 4). 도식 열 개의 문구도 함께 읽는다.
5. guide.md 「검증 절차의 끝」대로 `phases/83-network-media-topology-cloud-raid/index.json`의 step 6을 갱신한다(「앞 개념에 고칠 것」에 통독 결과).

## 금지사항

guide.md 「모든 step의 공통 금지」에 더해:

- **`network-topology`·`cloud-sdn`·`raid-storage`의 개념을 만들지 마라.** 이유: step 8~20의 범위다.
- **SONET·SDH·E1 프레임 형식 전체, WDM의 채널 격자 표 전체를 쓰지 마라.** 이유: 기출이 묻지 않는다(guide.md 「배경」).
- **step 1~5의 개념·문항·도식을 고치지 마라.** 이유: 다른 step의 범위다. 통독에서 고칠 것을 찾으면 summary에 적는다.
