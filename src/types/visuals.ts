// 시나리오 버튼 하나의 문구. id는 컴포넌트의 좌표 데이터와 짝을 맞추는 열쇠다.
export interface VisualScenarioText {
  id: string
  label: string
  caption: string
  sources: string[] // 근거 개념 id. 하나 이상.
}

// 도식 한 장의 문구. 좌표·경로는 컴포넌트에 둔다.
export interface VisualDiagramText {
  label: string // figure aria-label
  svgLabel: string // svg aria-label
  question?: string // 화면에 보이는 물음형 제목. 버튼 위에 표시한다. ADR-038
  idleCaption: string
  legend?: string
  nodes: Record<string, string> // 노드 id → 라벨
  nodeNotes?: Record<string, string> // 두 줄 노드의 윗줄(조건). UI_GUIDE 「두 줄 노드」
  groups?: Record<string, string> // 그룹 박스 id → 라벨
  notes?: Record<string, string> // 박스 없이 붙는 곁말(9). 예: 서브넷 열 이름, 장애 표시
  scenarios: VisualScenarioText[] // 정적 도식이면 빈 배열
  sources: string[] // idleCaption·노드 배치의 근거 개념 id
}

export interface ComparisonTableRow {
  header: string // 행 머리(th scope="row")
  cells: string[] // columns.length - 1 개
}

// 개념 읽기 머리(주제 제목 아래)에서 표로 바로 가는 링크. ADR-020의 앵커 이동을 쓴다.
export interface TableShortcut {
  id: string // 표 figure의 DOM id이자 링크의 해시. 개념 id와 겹치지 않게 점을 넣지 않는다.
  label: string // 링크 글
}

export interface ComparisonTable {
  label: string // figure aria-label이자 표 제목
  columns: string[] // 3개 이하. 첫 열은 행 머리 열의 제목.
  rows: ComparisonTableRow[]
  columnWidths?: string[] // 열마다 '36%' 같은 백분율. 합은 100%. 없으면 균등 분할.
  sources: string[]
  shortcut?: TableShortcut
}

export interface GlossaryTerm {
  term: string // 본문에 나오는 그대로. 예: "IAM"
  expansion?: string // 풀네임. 데이터에 근거가 없으면 두지 않는다.
  meaning: string
  sourceConceptId: string
}

// 단계 그림 한 장의 문구. 좌표는 컴포넌트에 둔다(ADR-050).
export interface StepFigureText {
  label: string // figure aria-label
  nodes: Record<string, string> // 노드 id → 라벨
  groups?: Record<string, string>
  notes?: Record<string, string> // 곁말 id → 글
  sources: string[]
}

export interface TopicVisuals {
  diagrams: Record<string, VisualDiagramText>
  tables: Record<string, ComparisonTable>
  glossary: GlossaryTerm[]
  stepFigures?: Record<string, Record<string, StepFigureText>> // 개념 id → 단계 번호("1"~"19") → 문구
}
