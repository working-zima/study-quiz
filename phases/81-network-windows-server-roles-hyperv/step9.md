# Step 9: hyperv-sources

## 배경

phase 81은 네트워크 과목의 `windows-server-roles`·`windows-hyperv`를 만든다 — 둘 다 강의 밖 주제다. 전체 계획과 결정은 `phases/81-network-windows-server-roles-hyperv/guide.md`에 있다.
step 10~14가 `windows-hyperv`의 개념 9개(Hyper-V, 가상 컴퓨터와 가상 하드 디스크, 가상 스위치, 검사점, 실시간 마이그레이션, 저장소 마이그레이션, Hyper-V 복제본, Windows 컨테이너, 컨테이너 기본 이미지)를 쓰기 전에,
**이 step은 그 개념들이 쓸 사실을 허용한 공식 문서(learn.microsoft.com)로 확인하고 출처 문서에 남긴다.** 데이터·코드는 고치지 않는다.

사실의 출처는 **learn.microsoft.com 하나뿐이다**(ADR-059 — Hyper-V 문서 `windows-server/virtualization/hyper-v/…`, Windows 컨테이너 문서 `virtualization/windowscontainers/…`도 그 안이다). 기출 9문항이 묻는 것은 —
Hyper-V의 특징(실행 중인 가상 하드 디스크를 다른 저장소로 옮길 수 있다 — [기출 2024-08-25 #43]·[기출 2025-11-02 #29]·[기출 2026-02-01 #33], 같은 문항),
Hyper-V로 얻는 것(가용성이 줄어든다는 틀린 말 — [기출 2025-02-23 #30]), Windows 컨테이너([기출 2024-02-25 #44]·[기출 2025-05-25 #38]·[기출 2026-05-17 #29] — 지문이 그림, 오답 Hyper-V/Virtual Machine·IIS·Nano Server),
검사점([기출 2026-05-17 #45]·[기출 2026-08-02 #45] — 지문이 그림, 오답 가상 스위치·새로 고침·내보내기·롤백·타임머신)이다.

## 읽어야 할 파일

- `phases/81-network-windows-server-roles-hyperv/guide.md` — 특히 「배경」, 「두 주제와 개념 23개」의 `windows-hyperv` 표 15~23행, 「예시 값」, 「출처」
- `phases/81-network-windows-server-roles-hyperv/index.json`의 step 0 `summary`의 「Features Removed or No Longer Developed」 줄(Hyper-V 기능·Nano Server)과 역할 설치 cmdlet, step 1~8 `summary`(뒤 주제가 뜻을 맞출 말)
- `docs/source/network/CLAUDE.md` — 출처 규칙, 허용하는 출처, 기출의 자리. **이 규칙을 따른다**
- `docs/source/network/standards.md` — 머리의 규칙과 기존 항목의 형식(「(phase 81 step 0·4)」 항목들), 이미 있는 항목: phase 72의 스위치(IEEE 802.1D 등), phase 80의 BitLocker·「Features Removed…」, phase 81 step 0의 서버 역할 설치. **있는 사실을 다시 찾지 않는다** — 그 항목에 줄을 더한다
- `docs/source/network/exam-notes.md` — 형식과 마지막 번호(step 0·4가 더한 E 번호 다음부터)
- `docs/ADR.md`의 **ADR-059**, **ADR-057**, **ADR-009**
- `src/data/network/topics.json`의 `hub-switch-vlan`(스위치·MAC 주소 표), `linux-process-boot`(커널·프로세스의 뜻), `windows-server-roles.server-roles-features`(역할 설치) — 이미 가르친 사실(뜻을 맞춘다)
- 기출: `docs/source/network/raw/exam/data.txt`에서 `X-windows`로 분류한 줄과 위 9문항(교사용 텍스트). 문장을 옮기지 않는다

## 작업

### 1. 확인할 것 — 하나씩 허용한 출처를 실제로 열어 확인한다

볼 곳은 learn.microsoft.com이다(영문 `en-us`와 한국어 `ko-kr` 판). **판을 적는다** — 페이지의 갱신 날짜와 적용 대상(Windows Server의 판). 지난 판 문서(`previous-versions`)는 지금 판에 없을 때만 쓰고 그 판을 적는다.
응답이 느리면 `curl -4`로 다시 받는다. 위키백과·블로그·업체 학습 페이지·Q&A 사이트는 쓰지 않는다.
**한국어 이름**: virtual machine은 ko-kr 문서에서 「가상 머신」과 「가상 컴퓨터」가 섞일 수 있다 — Hyper-V 관리자의 한국어 화면 이름과 기출이 쓰는 이름(가상 컴퓨터)을 견주어 고르고 그 까닭을 적는다. checkpoint(검사점·체크포인트), live migration(실시간 마이그레이션), Hyper-V Replica(Hyper-V 복제본)도 같다.

| # | 개념 | 확인할 것 | 볼 곳(예) |
|---|---|---|---|
| a | `hyper-v` | Hyper-V가 무엇인지(하드웨어 가상화 제품 — 가상 컴퓨터를 만들고 실행), 가상화·하이퍼바이저·호스트·게스트를 말하는 문서의 말, Windows Server의 역할로 설치한다는 것(`Install-WindowsFeature -Name Hyper-V`), 관리 도구 Hyper-V 관리자(실행 이름 `virtmgmt.msc`), 하드웨어 요구(64비트 프로세서·SLAT·하드웨어 가상화 — 한 줄로 쓸 만큼), **Hyper-V로 얻는 것**(문서가 드는 쓰임 — 하드웨어를 더 효과적으로 쓰기(서버 통합), 업무 연속성, 개발과 테스트의 효율, 사설 클라우드·VDI 등). **[기출 2025-02-23 #30]**: 틀린 말 「서버 가용성이 줄어든다」와 맞는 말로 두는 셋(하드웨어 사용률을 높인다, 유지 비용을 줄인다, 개발·테스트 효율)이 문서와 맞는지 — 특히 「유지 비용」은 문서에 그런 말이 있는지(전력·공간을 덜 쓴다 등) | `windows-server/virtualization/hyper-v/overview`(또는 `hyper-v-overview`), `…/get-started/install-hyper-v`, `…/system-requirements-for-hyper-v-on-windows`, ko-kr 판 |
| b | `virtual-machines` | 가상 컴퓨터가 갖는 가상 장치(가상 프로세서·메모리·가상 하드 디스크·네트워크 어댑터), 한 호스트에서 여러 가상 컴퓨터를 실행한다는 근거(호스트가 지원하는 최대 수 — 쓰지 않아도 되지만 근거로), **가상 하드 디스크** 형식 VHD와 VHDX(최대 크기 2,040GB·64TB 등 차이), 세대 1·2(한 줄 — 쓸지 말지는 개념 step 재량). **[기출 2024-08-25 #43] 등 셋**의 오답 「물리 서버 하나에 가상 컴퓨터 하나」·「가상 컴퓨터를 쓸수록 물리 서버의 하드웨어 사용률이 낮아진다」가 틀렸다는 근거(a의 「하드웨어를 더 효과적으로」 문장과 함께) | `windows-server/virtualization/hyper-v/plan/plan-for-hyper-v-scalability-in-windows-server`, `…/manage/create-a-virtual-machine-in-hyper-v`(또는 get-started), VHDX 문서(`…/storage/…`·`hyper-v-virtual-hard-disk-format-overview` 등), `…/plan/should-i-create-a-generation-1-or-2-virtual-machine-in-hyper-v`, ko-kr 판 |
| c | `virtual-switch` | **가상 스위치**가 무엇인지, 세 종류(외부·내부·개인 — 한국어 화면 이름, 각자가 잇는 범위: 물리 네트워크·호스트·가상 컴퓨터끼리), 만드는 자리(가상 스위치 관리자 — 한국어 이름), `New-VMSwitch`의 `-SwitchType`(Internal·Private)과 외부 스위치(`-NetAdapterName`). [기출 2026-05-17 #45]의 오답 보기라 「검사점이 아니다」만 판정하면 된다 | `windows-server/virtualization/hyper-v/get-started/create-a-virtual-switch-for-hyper-v-virtual-machines`, `…/plan/plan-hyper-v-networking-in-windows-server`, `powershell/module/hyper-v/new-vmswitch`, ko-kr 판 |
| d | `checkpoints` | **검사점**이 무엇인지(어느 순간의 상태를 저장해 그 상태로 돌아갈 수 있게), 저장하는 것(디스크·설정·메모리 — 종류마다), 두 종류(**프로덕션 검사점**·**표준 검사점** — 정의, 프로덕션이 게스트 안의 VSS·파일 시스템 고정을 쓰는지, 메모리 상태를 저장하는지, 기본값과 판), 되돌리기(「적용」 — 한국어 화면 이름), 옛 이름 「스냅숏」, 검사점이 만드는 파일(`.avhdx` 차이 디스크 — 한 줄), 검사점이 백업을 대신하지 않는다는 문서의 말(있으면), **내보내기**(export)·**가져오기**(import)가 무엇인지(가상 컴퓨터 파일을 통째로 복사해 다른 호스트에서 가져오기). **[기출 2026-05-17 #45]·[기출 2026-08-02 #45]**(지문이 그림 — 정답 검사점)의 오답(가상 스위치·새로 고침·내보내기·롤백·타임머신)이 Hyper-V에서 무엇인지(롤백·타임머신은 Hyper-V의 기능 이름이 아니라는 것은 문서에 그런 이름이 없음을 적는 것으로 충분) | `windows-server/virtualization/hyper-v/manage/choose-between-standard-or-production-checkpoints-in-hyper-v`, `…/manage/enable-or-disable-checkpoints-in-hyper-v`, `virtualization/hyper-v-on-windows/user-guide/checkpoints`, `…/deploy/export-and-import-virtual-machines`, ko-kr 판 |
| e | `live-migration` | **실시간 마이그레이션**이 무엇인지(실행 중인 가상 컴퓨터를 한 호스트에서 다른 호스트로 — 사용자가 느끼는 중단 없이), 쓰는 때(점검·부하 — 문서의 말), 공유 없는 실시간 마이그레이션(저장소까지 함께 — 한 줄), 요구 조건(같은 도메인·같은 프로세서 제조사 등 — 한 줄로 쓸 만큼만) | `windows-server/virtualization/hyper-v/manage/live-migration-overview`, `…/deploy/set-up-hosts-for-live-migration-without-failover-clustering`, ko-kr 판 |
| f | `storage-migration` | **저장소 마이그레이션**이 무엇인지(실행 중인 가상 컴퓨터의 가상 하드 디스크·구성·검사점 파일을 다른 위치로 — 가상 컴퓨터는 같은 호스트), 화면 이름(「이동」 마법사의 「가상 컴퓨터의 저장소 이동」 등 — 문서가 보이는 만큼), `Move-VMStorage`, 쓰는 때(문서의 말). **[기출 2024-08-25 #43] 등 셋**의 정답 「가상 하드디스크를 실행 중에도 다른 저장소로 옮길 수 있다」가 문서와 맞는지 | `live-migration-overview`의 저장소 절, `powershell/module/hyper-v/move-vmstorage`, 지난 판 「Virtual Machine Storage Migration Overview」(지금 판에 없을 때), ko-kr 판 |
| g | `hyper-v-replica` | **Hyper-V 복제본**이 무엇인지(가상 컴퓨터를 다른 호스트에 복제해 두고 주 사이트가 멈추면 복제본으로 넘어간다), 주 서버·복제본 서버, **복제 빈도**(고를 수 있는 값 — 30초·5분·15분 등, 기본), 장애 조치(계획된·계획되지 않은 — 한 줄), 복제가 비동기라 마지막 복제 뒤 변경을 잃을 수 있다는 근거(있으면). **[기출 2024-08-25 #43] 등 셋**의 오답 「가상 컴퓨터를 다른 서버로 복제할 수 없다」가 틀렸다는 근거 | `windows-server/virtualization/hyper-v/manage/set-up-hyper-v-replica`, `…/manage/hyper-v-replica…`(개요), `powershell/module/hyper-v/enable-vmreplication`(`-ReplicationFrequencySec`), ko-kr 판 |
| h | `windows-containers` | **컨테이너**가 무엇인지(문서의 정의 — 응용 프로그램을 격리된 공간에서 실행, 호스트의 커널을 함께 씀), **컨테이너 이미지**, 가상 컴퓨터와의 차이(문서의 비교 — 운영 체제 전체·커널·크기·시작 시간 등), Windows Server의 「컨테이너」 기능과 컨테이너 런타임(문서가 말하는 것 — Docker·containerd 등 이름은 문서대로 한 줄), **두 격리 방식**(프로세스 격리·Hyper-V 격리 — 정의, Windows Server의 기본값, Windows 클라이언트의 기본값). **기출 셋**(지문이 그림 — 정답 Windows 컨테이너, 오답 가상 컴퓨터·IIS·Nano Server)은 판정할 수 있는 만큼만 | `virtualization/windowscontainers/about/`(Containers vs. virtual machines), `…/manage-containers/hyperv-container`(Isolation modes), `…/quick-start/set-up-environment`, ko-kr 판 |
| i | `container-base-images` | **기본 이미지**가 무엇인지와 Microsoft가 내놓는 기본 이미지의 목록·이름(Nano Server·Server Core·Server·Windows 등 — 지금 문서의 목록과 이름), 각 이미지가 맞는 쓰임(문서의 말)과 크기 차이, 이미지를 받는 곳(Microsoft Container Registry — 이미지 이름 꼴 `mcr.microsoft.com/windows/nanoserver:<태그>` 등, 문서가 보이는 만큼), 프로세스 격리에서 호스트와 컨테이너의 Windows 판이 맞아야 한다는 것(버전 호환성 문서), **Nano Server**가 지금은 호스트에 설치하는 운영 체제가 아니라 컨테이너 기본 이미지로만 나온다는 것과 그 판(Windows Server 1709 등 — 문서나 step 0의 개발 중단 목록 줄). 기출이 Nano Server를 Windows 컨테이너의 오답으로 두는 것을 이것으로 설명할 수 있는지 | `virtualization/windowscontainers/manage-containers/container-base-images`, `…/deploy-containers/version-compatibility`, `windows-server/get-started/getting-started-with-nano-server`(또는 Nano Server 변경 문서), ko-kr 판 |

빠진 것을 읽다가 찾으면 더한다. **장애 조치 클러스터, 동적 메모리, 중첩 가상화, 차폐된 가상 컴퓨터, 세대 1·2의 차이 전체, Dockerfile 문법, Kubernetes, 컨테이너 네트워크 드라이버 전체는 확인하지 않는다**(guide.md 「배경」).

### 2. `docs/source/network/standards.md` — 확인한 사실을 더한다

- 기존 항목의 형식을 따른다: `## (phase 81 step 9) Microsoft Learn — <문서 제목들>`, URL 한 줄씩, **갱신 날짜와 적용 대상** 한 줄, 직접 쓴 사실 한 줄씩 끝에 `— 절 제목`, 「쓰인 곳」.
  같은 문서의 기존 항목이 있으면 새 항목을 만들지 말고 그 항목에 「(phase 81 step 9)」를 붙인 줄로 더한다.
- 주제별로 서너 항목에 모은다(예: 「Hyper-V·가상 컴퓨터·가상 하드 디스크·가상 스위치」, 「검사점·내보내기」, 「실시간 마이그레이션·저장소 마이그레이션·Hyper-V 복제본」, 「Windows 컨테이너·격리·기본 이미지」). 항목마다 **한국어 이름** 줄을 둔다.
- 「쓰인 곳」에는 **쓰일 개념 id**와 exam-notes 번호를 적는다. 머리의 「확인한 날」 문단들 끝에 「(phase 81 step 9)」 줄을 더한다.

### 3. `docs/source/network/exam-notes.md` — 시험의 답이 공식 문서와 다르거나 공식 문서에 없는 곳

이 step의 기출 9문항이 정답으로 보는 것(과 시험이 맞는 말로 두는 보기)이 허용한 출처에 없거나 다르면 앞 step이 쓴 마지막 E 번호 다음부터 이어 더한다(형식 같음).
공식 문서에 있으면 항목을 만들지 않는다. step 0의 문단처럼 이 step이 본 문항 수와 더한 항목을 소개하고 공식 문서와 맞는 문항들을 한 줄씩 짚는 문단을 둔다(확인한 날 포함).

미리 본 것 — 판정은 이 step이 출처를 읽고 한다:
- [기출 2025-02-23 #30]의 「유지 비용을 줄일 수 있다」 — 문서가 비용을 직접 말하지 않으면(전력·공간만 말하면) 그 차이를 적는다. 답(가용성이 줄어든다가 틀린 말)은 문서로 서므로 E 대신 문단 한 줄이어도 된다.
- 컨테이너 셋과 검사점 둘은 지문이 빠졌다 — 정답이 그 기능 이름이라는 것만 판정하고, 지문이 무엇을 묘사했는지 지어내지 않는다.

### 4. summary — 뒤 step이 이것을 보고 쓴다

`windows-hyperv`의 개념 15~23마다 한 줄씩: **무엇을 쓸 수 있는지(문서·갱신 날짜·절), 무엇을 쓰지 않는지, 「자격시험은」 줄이 필요한지(E번호), 한국어 이름**.
위 표의 a~i마다 결과(확인함/못 찾음)와 근거 문서·판을 적는다. 못 찾은 것은 무엇을 어디서 찾아봤는지 적는다.
특히 다음을 개념 step이 그대로 쓸 수 있게 적는다.
- 가상화·하이퍼바이저·호스트·게스트의 근거, Hyper-V 설치·관리 도구, Hyper-V로 얻는 것(문서가 드는 쓰임 목록).
- 가상 컴퓨터의 가상 장치, VHD·VHDX 차이, 한 호스트의 여러 가상 컴퓨터 근거.
- 가상 스위치 세 종류의 한국어 이름과 잇는 범위.
- 검사점 두 종류의 정의·기본값·판, 적용의 화면 이름, 옛 이름, 내보내기·가져오기.
- 실시간 마이그레이션·저장소 마이그레이션의 정의·옮겨 가는 것·화면 이름·cmdlet.
- 복제본의 정의, 복제 빈도 값(기본), 장애 조치, 잃을 수 있는 변경의 근거.
- 컨테이너의 정의, 가상 컴퓨터와의 차이, 두 격리 방식과 기본값, 컨테이너 런타임.
- 기본 이미지의 목록·이름·쓰임·크기 차이, 이미지 이름 꼴, 판 호환성, Nano Server의 지금 자리와 그 판.
- 기출 판정 줄: Hyper-V 특징 넷, Hyper-V 설명 넷, 컨테이너 셋, 검사점 둘.
끝에 「사용자 확인」 칸을 둔다 — 사용자가 정해야 할 것이 있으면 적고, 없으면 「없음」.

## Acceptance Criteria

```bash
npm test
git status --porcelain
git diff --stat
```

## 검증 절차

1. AC를 실행한다. `npm test`는 이 step이 코드를 고치지 않았으므로 그대로 통과해야 한다.
2. 바뀐 파일이 `docs/source/network/standards.md`·`exam-notes.md`와 phase 메타데이터뿐인지 본다(내려받은 문서는 저장소 밖에 둔다).
3. 더한 사실마다 URL을 실제로 열어 확인했는지, 판(갱신 날짜·적용 대상)을 적었는지, 문장이 원문(영문·한국어 판)을 옮기지 않았는지 다시 본다.
4. `phases/81-network-windows-server-roles-hyperv/index.json`의 step 9를 갱신한다.
   - 성공 → `"summary"`에 위 「4. summary」의 내용.
   - 3회 실패 → `"status": "error"`, `"error_message"`에 구체적 내용.
   - 인터넷 연결이 없어 문서를 열 수 없는 등 확인 자체가 불가능하면 → `"status": "blocked"`, `"blocked_reason"`에 사유를 적고 멈춘다. 확인하지 못한 사실을 지어서 적지 마라.

## 금지사항

- **`src/`의 데이터·코드·테스트를 고치지 마라.** 이유: 이 step은 출처만 확인한다. 개념은 step 10~14가 쓴다.
- **확인하지 못한 사실을 standards.md에 적지 마라.** 이유: 뒤 step이 이 기록을 근거로 학습자에게 가르친다. 못 찾았으면 못 찾았다고 summary에 적는다.
- **learn.microsoft.com 밖의 문서(Docker 문서·위키백과·블로그·업체 학습 페이지·Q&A 사이트)를 근거로 쓰지 마라.** 이유: ADR-059. 꼭 필요한 곳이 목록에 없으면 쓰지 말고 summary의 「사용자 확인」에 적는다.
- **기출·공식 문서의 문장을 옮기지 마라.** 이유: ADR-009·ADR-057.
- **기존 항목의 줄을 고치거나 지우지 마라.** 이유: 앞 phase의 개념이 그 줄을 근거로 쓴다. 더할 것은 「(phase 81 step 9)」 줄로 더한다.
- **장애 조치 클러스터·동적 메모리·중첩 가상화·차폐된 가상 컴퓨터·Kubernetes를 정리하지 마라.** 이유: 기출이 묻지 않는 것을 끌어오지 않는다(ADR-059 「범위」).
- **`lecture-outline.md`·`interview-facts.md`·`docs/source/network/CLAUDE.md`·`topic-map.md`를 고치지 마라.** 이유: 강의·면접은 이 주제를 다루지 않고, 이 phase는 새 출처를 더하지 않는다.
