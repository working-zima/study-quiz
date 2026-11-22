import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['raid-storage'].diagrams['raid-striping']

// 세로형은 디스크 박스 넷을 두 줄로 둘씩 두고(윗줄 DISK0·DISK1, 아랫줄 DISK2·DISK3), 박스마다 조각 칸 둘을 위아래로 빈틈없이 붙인다.
// 위 칸이 첫째 줄(A1~A4), 아래 칸이 둘째 줄(A5~A8)의 조각이다. 화살표는 없다 — 칸이 어느 디스크 박스 안에 있는지가 그림의 뜻이다.
const nodes = [
  { id: 'a1', x: 40, y: 28, width: 64 },
  { id: 'a2', x: 176, y: 28, width: 64 },
  { id: 'a3', x: 40, y: 128, width: 64 },
  { id: 'a4', x: 176, y: 128, width: 64 },
  { id: 'a5', x: 40, y: 60, width: 64 },
  { id: 'a6', x: 176, y: 60, width: 64 },
  { id: 'a7', x: 40, y: 160, width: 64 },
  { id: 'a8', x: 176, y: 160, width: 64 },
]

const groups = [
  { id: 'disk0', x: 8, y: 8, width: 128, height: 92, labelX: 16, labelY: 21 },
  { id: 'disk1', x: 144, y: 8, width: 128, height: 92, labelX: 152, labelY: 21 },
  { id: 'disk2', x: 8, y: 108, width: 128, height: 92, labelX: 16, labelY: 121 },
  { id: 'disk3', x: 144, y: 108, width: 128, height: 92, labelX: 152, labelY: 121 },
]

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 「고장」은 DISK1 박스 안, 디스크 이름 바로 옆에 붙는다. 나머지 곁말은 디스크 박스들 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'stripe-note': 'stripe',
  'fail-mark': 'fail',
  'fail-note': 'fail',
}

const notes: Note[] = [
  { id: 'stripe-note', x: 140, y: 224, anchor: 'middle' },
  { id: 'fail-mark', x: 186, y: 21, anchor: 'start' },
  { id: 'fail-note', x: 140, y: 224, anchor: 'middle' },
]

// 가로형은 디스크 박스 넷을 한 줄에 DISK0부터 DISK3까지 두므로, 위 칸 넷이 첫째 줄, 아래 칸 넷이 둘째 줄로 가로로 늘어선다.
const wideNodes = [
  { id: 'a1', x: 26, y: 28, width: 64 },
  { id: 'a2', x: 134, y: 28, width: 64 },
  { id: 'a3', x: 242, y: 28, width: 64 },
  { id: 'a4', x: 350, y: 28, width: 64 },
  { id: 'a5', x: 26, y: 60, width: 64 },
  { id: 'a6', x: 134, y: 60, width: 64 },
  { id: 'a7', x: 242, y: 60, width: 64 },
  { id: 'a8', x: 350, y: 60, width: 64 },
]

const wideGroups = [
  { id: 'disk0', x: 8, y: 8, width: 100, height: 92, labelX: 16, labelY: 21 },
  { id: 'disk1', x: 116, y: 8, width: 100, height: 92, labelX: 124, labelY: 21 },
  { id: 'disk2', x: 224, y: 8, width: 100, height: 92, labelX: 232, labelY: 21 },
  { id: 'disk3', x: 332, y: 8, width: 100, height: 92, labelX: 340, labelY: 21 },
]

const wideNotes: Note[] = [
  { id: 'stripe-note', x: 220, y: 124, anchor: 'middle' },
  { id: 'fail-mark', x: 158, y: 21, anchor: 'start' },
  { id: 'fail-note', x: 220, y: 124, anchor: 'middle' },
]

// 나눠 놓기: 조각 여덟이 모두 선명하다 — 디스크마다 차례로 번갈아 놓인 모습이다.
// 디스크 하나의 고장: DISK1의 칸 A2·A6이 흐리다(잃은 조각). 디스크 박스는 흐려지지 않고, DISK1 이름 옆에 「고장」이 붙는다.
export const raidStripingScenarios: DiagramScenario[] = [
  {
    id: 'stripe',
    nodes: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'],
    paths: [],
  },
  {
    id: 'fail',
    nodes: ['a1', 'a3', 'a4', 'a5', 'a7', 'a8'],
    paths: [],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RaidStripingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={raidStripingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 136' : '0 0 280 236'}>
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
