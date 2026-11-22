import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['raid-storage'].diagrams['raid-parity-rotation']

// 세로형은 디스크 박스 넷을 두 줄로 둘씩 두고(윗줄 DISK0·DISK1, 아랫줄 DISK2·DISK3), 박스마다 칸 넷을 위아래로 빈틈없이 붙인다.
// 박스마다 위 칸부터 첫째 줄~넷째 줄이다. 패리티 P1~P4는 DISK3·DISK2·DISK1·DISK0의 첫째~넷째 칸에 놓인다(본문 예의 배치).
// 「다시 계산한 A2」는 두 줄의 디스크 박스 사이 빈자리에 둔다.
const nodes = [
  { id: 'a1', x: 40, y: 28, width: 64 },
  { id: 'a2', x: 176, y: 28, width: 64 },
  { id: 'a3', x: 40, y: 248, width: 64 },
  { id: 'p1', x: 176, y: 248, width: 64 },
  { id: 'a4', x: 40, y: 60, width: 64 },
  { id: 'a5', x: 176, y: 60, width: 64 },
  { id: 'p2', x: 40, y: 280, width: 64 },
  { id: 'a6', x: 176, y: 280, width: 64 },
  { id: 'a7', x: 40, y: 92, width: 64 },
  { id: 'p3', x: 176, y: 92, width: 64 },
  { id: 'a8', x: 40, y: 312, width: 64 },
  { id: 'a9', x: 176, y: 312, width: 64 },
  { id: 'p4', x: 40, y: 124, width: 64 },
  { id: 'a10', x: 176, y: 124, width: 64 },
  { id: 'a11', x: 40, y: 344, width: 64 },
  { id: 'a12', x: 176, y: 344, width: 64 },
  { id: 'rebuilt', x: 52, y: 180, width: 104 },
]

const groups = [
  { id: 'disk0', x: 8, y: 8, width: 128, height: 156, labelX: 16, labelY: 21 },
  { id: 'disk1', x: 144, y: 8, width: 128, height: 156, labelX: 152, labelY: 21 },
  { id: 'disk2', x: 8, y: 228, width: 128, height: 156, labelX: 16, labelY: 241 },
  { id: 'disk3', x: 144, y: 228, width: 128, height: 156, labelX: 152, labelY: 241 },
]

// A1은 DISK0 박스의 왼쪽 여백을 따라 내려가 「다시 계산한 A2」의 왼쪽 변으로, A3과 P1은 칸의 위 변에서 올라가 아래·오른쪽 변으로 들어간다.
const paths: Record<string, string> = {
  'a1-rebuilt': 'M40 44 H24 V196 H52',
  'a3-rebuilt': 'M72 248 V212',
  'p1-rebuilt': 'M208 248 V196 H156',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 「고장」은 DISK1 박스 안, 디스크 이름 바로 옆에 붙는다. 나머지 곁말은 디스크 박스들 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'layout-note': 'layout',
  'fail-mark': 'rebuild',
  'rebuild-note': 'rebuild',
}

const notes: Note[] = [
  { id: 'layout-note', x: 140, y: 404, anchor: 'middle' },
  { id: 'fail-mark', x: 186, y: 21, anchor: 'start' },
  { id: 'rebuild-note', x: 140, y: 404, anchor: 'middle' },
]

// 가로형은 디스크 박스 넷을 한 줄에 DISK0부터 DISK3까지 두고, 「다시 계산한 A2」를 박스들 아래에 둔다.
// A1·P1은 DISK0·DISK3 박스의 바깥쪽 여백을, A3은 DISK2 박스의 왼쪽 여백을 따라 내려간다.
const wideNodes = [
  { id: 'a1', x: 26, y: 28, width: 64 },
  { id: 'a2', x: 134, y: 28, width: 64 },
  { id: 'a3', x: 242, y: 28, width: 64 },
  { id: 'p1', x: 350, y: 28, width: 64 },
  { id: 'a4', x: 26, y: 60, width: 64 },
  { id: 'a5', x: 134, y: 60, width: 64 },
  { id: 'p2', x: 242, y: 60, width: 64 },
  { id: 'a6', x: 350, y: 60, width: 64 },
  { id: 'a7', x: 26, y: 92, width: 64 },
  { id: 'p3', x: 134, y: 92, width: 64 },
  { id: 'a8', x: 242, y: 92, width: 64 },
  { id: 'a9', x: 350, y: 92, width: 64 },
  { id: 'p4', x: 26, y: 124, width: 64 },
  { id: 'a10', x: 134, y: 124, width: 64 },
  { id: 'a11', x: 242, y: 124, width: 64 },
  { id: 'a12', x: 350, y: 124, width: 64 },
  { id: 'rebuilt', x: 172, y: 196, width: 104 },
]

const wideGroups = [
  { id: 'disk0', x: 8, y: 8, width: 100, height: 156, labelX: 16, labelY: 21 },
  { id: 'disk1', x: 116, y: 8, width: 100, height: 156, labelX: 124, labelY: 21 },
  { id: 'disk2', x: 224, y: 8, width: 100, height: 156, labelX: 232, labelY: 21 },
  { id: 'disk3', x: 332, y: 8, width: 100, height: 156, labelX: 340, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'a1-rebuilt': 'M26 44 H17 V212 H172',
  'a3-rebuilt': 'M242 44 H233 V196',
  'p1-rebuilt': 'M414 44 H423 V212 H276',
}

const wideNotes: Note[] = [
  { id: 'layout-note', x: 220, y: 252, anchor: 'middle' },
  { id: 'fail-mark', x: 158, y: 21, anchor: 'start' },
  { id: 'rebuild-note', x: 220, y: 252, anchor: 'middle' },
]

// 패리티 돌려 놓기: 칸 열여섯이 모두 선명하다 — 줄마다 패리티가 다른 디스크에 놓인 모습이다. 「다시 계산한 A2」는 흐리다.
// 조각 다시 계산: DISK1이 고장 나 첫째 줄의 A2를 잃었다. 같은 줄에 남은 A1·A3·P1에서 「다시 계산한 A2」로 화살표가 간다.
export const raidParityRotationScenarios: DiagramScenario[] = [
  {
    id: 'layout',
    nodes: ['a1', 'a2', 'a3', 'p1', 'a4', 'a5', 'p2', 'a6', 'a7', 'p3', 'a8', 'a9', 'p4', 'a10', 'a11', 'a12'],
    paths: [],
  },
  {
    id: 'rebuild',
    nodes: ['a1', 'a3', 'p1', 'rebuilt'],
    paths: ['a1-rebuilt', 'a3-rebuilt', 'p1-rebuilt'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RaidParityRotationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-raid-parity-rotation-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={raidParityRotationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 260' : '0 0 280 412'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.labelX} y={group.labelY} className="fill-muted" fontSize="9">
              {text.groups?.[group.id]}
            </text>
          ))}

          {active?.paths.map((id) => (
            <path
              key={id}
              data-path={id}
              d={layoutPaths[id]}
              className="fill-none stroke-title"
              strokeWidth="2"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
