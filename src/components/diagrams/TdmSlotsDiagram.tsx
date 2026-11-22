import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['transmission-media'].diagrams['tdm-slots']

// 세로형은 왼쪽 위에 입력 A·B·C·D를 위에서 아래로 쌓고, 그 오른쪽에 다중화기를 둔다. 그 아래에 동기식 박스(칸 넷)와 비동기식 박스(칸 둘)를 나란히 둔다.
// 박스 안의 칸은 빈틈없이 위에서 아래로 이어 쌓는다 — 칸이 회선을 지나는 차례다. 노드는 모두 회색이다.
const nodes = [
  { id: 'in-a', x: 8, y: 8, width: 100 },
  { id: 'in-b', x: 8, y: 48, width: 100 },
  { id: 'in-c', x: 8, y: 88, width: 100 },
  { id: 'in-d', x: 8, y: 128, width: 100 },
  { id: 'mux', x: 168, y: 68, width: 80 },
  { id: 'sync-a', x: 16, y: 196, width: 108 },
  { id: 'sync-b', x: 16, y: 228, width: 108 },
  { id: 'sync-c', x: 16, y: 260, width: 108 },
  { id: 'sync-d', x: 16, y: 292, width: 108 },
  { id: 'async-a', x: 148, y: 196, width: 116 },
  { id: 'async-c', x: 148, y: 228, width: 116 },
]

const groups = [
  { id: 'sync', x: 8, y: 176, width: 124, height: 156, labelX: 16, labelY: 189 },
  { id: 'async', x: 140, y: 176, width: 132, height: 92, labelX: 148, labelY: 189 },
]

const paths: Record<string, string> = {
  'in-a-mux': 'M108 24 H132 V72 H168',
  'in-b-mux': 'M108 64 H124 V80 H168',
  'in-c-mux': 'M108 104 H124 V88 H168',
  'in-d-mux': 'M108 144 H132 V96 H168',
  'mux-sync': 'M192 100 V164 H72 V196',
  'mux-async': 'M224 100 V196',
}

// 입력에서 다중화기로 가는 화살표는 늘 보인다. 다중화기에서 칸의 열로 가는 화살표는 그 방식을 골랐을 때만 보인다.
const linkIds = ['in-a-mux', 'in-b-mux', 'in-c-mux', 'in-d-mux']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 그림 아래의 빈 줄 가운데를 함께 쓴다.
const noteScenarios: Record<string, string> = {
  'sync-note': 'sync',
  'async-note': 'async',
}

const notes: Note[] = [
  { id: 'sync-note', x: 140, y: 352, anchor: 'middle' },
  { id: 'async-note', x: 140, y: 352, anchor: 'middle' },
]

// 가로형은 왼쪽에 입력 A·B·C·D를 쌓고, 그 오른쪽에 다중화기를, 그 오른쪽에 동기식 박스와 비동기식 박스를 나란히 둔다.
// 비동기식 박스로 가는 화살표는 동기식 박스 아래를 돌아 두 박스 사이의 통로로 올라간다.
const wideNodes = [
  { id: 'in-a', x: 8, y: 8, width: 100 },
  { id: 'in-b', x: 8, y: 48, width: 100 },
  { id: 'in-c', x: 8, y: 88, width: 100 },
  { id: 'in-d', x: 8, y: 128, width: 100 },
  { id: 'mux', x: 132, y: 68, width: 64 },
  { id: 'sync-a', x: 220, y: 28, width: 72 },
  { id: 'sync-b', x: 220, y: 60, width: 72 },
  { id: 'sync-c', x: 220, y: 92, width: 72 },
  { id: 'sync-d', x: 220, y: 124, width: 72 },
  { id: 'async-a', x: 316, y: 28, width: 116 },
  { id: 'async-c', x: 316, y: 60, width: 116 },
]

const wideGroups = [
  { id: 'sync', x: 212, y: 8, width: 88, height: 156, labelX: 220, labelY: 21 },
  { id: 'async', x: 308, y: 8, width: 132, height: 92, labelX: 316, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'in-a-mux': 'M108 24 H124 V72 H132',
  'in-b-mux': 'M108 64 H116 V80 H132',
  'in-c-mux': 'M108 104 H116 V88 H132',
  'in-d-mux': 'M108 144 H124 V96 H132',
  'mux-sync': 'M196 76 H208 V44 H220',
  'mux-async': 'M188 100 V176 H304 V44 H316',
}

const wideNotes: Note[] = [
  { id: 'sync-note', x: 220, y: 196, anchor: 'middle' },
  { id: 'async-note', x: 220, y: 196, anchor: 'middle' },
]

const inputIds = ['in-a', 'in-b', 'in-c', 'in-d']

// 동기식: 입력마다 칸을 하나씩 늘 주어 B·D의 칸이 빈 채로 간다. 비동기식: 보낼 데이터가 있는 A·C의 칸 둘만 꼬리표를 붙여 채운다.
export const tdmSlotsScenarios: DiagramScenario[] = [
  {
    id: 'sync',
    nodes: [...inputIds, 'mux', 'sync-a', 'sync-b', 'sync-c', 'sync-d'],
    paths: ['mux-sync'],
  },
  {
    id: 'async',
    nodes: [...inputIds, 'mux', 'async-a', 'async-c'],
    paths: ['mux-async'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TdmSlotsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-tdm-slots-arrow`
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
      scenarios={tdmSlotsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 204' : '0 0 280 360'}>
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

          {linkIds.map((id) => (
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
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
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
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
