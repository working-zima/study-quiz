import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['wireless-lan'].diagrams['mesh-reroute']

// 세로형은 MESH01을 맨 위 가운데에, MESH04를 맨 아래 가운데에 두고, 그 사이 양옆에 MESH02(왼쪽)와 MESH03(오른쪽)을 둔다.
// MESH01과 MESH04는 바로 이어져 있지 않고, 두 갈래로 MESH02·MESH03과 이어진다. 노드는 모두 회색이다.
const nodes = [
  { id: 'mesh01', x: 104, y: 16, width: 72 },
  { id: 'mesh02', x: 16, y: 104, width: 64 },
  { id: 'mesh03', x: 200, y: 104, width: 64 },
  { id: 'mesh04', x: 104, y: 192, width: 72 },
]

// 링크 넷은 늘 보이고, 고른 시나리오의 화살표를 그 위에 겹쳐 그린다. 화살표는 MESH01이 보낸 프레임이 한 홉씩 건너가는 길이다.
const paths: Record<string, string> = {
  'link-01-02': 'M104 32 H48 V104',
  'link-01-03': 'M176 32 H232 V104',
  'link-02-04': 'M48 136 V208 H104',
  'link-03-04': 'M232 136 V208 H176',
  'hop-01-02': 'M104 32 H48 V104',
  'hop-02-04': 'M48 136 V208 H104',
  'hop-01-03': 'M176 32 H232 V104',
  'hop-03-04': 'M232 136 V208 H176',
}

const linkIds = ['link-01-02', 'link-01-03', 'link-02-04', 'link-03-04']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 「꺼짐」은 MESH02 왼쪽 위에, 거쳐 가는 노드는 가운데 빈자리에 둔다.
const noteScenarios: Record<string, string> = {
  'off': 'reroute',
  'via-02': 'normal',
  'via-03': 'reroute',
}

const notes: Note[] = [
  { id: 'off', x: 16, y: 98, anchor: 'start' },
  { id: 'via-02', x: 140, y: 80, anchor: 'middle' },
  { id: 'via-03', x: 140, y: 168, anchor: 'middle' },
]

// 가로형은 MESH01을 왼쪽에, MESH04를 오른쪽에 두고, 그 사이 위에 MESH02를, 아래에 MESH03을 둔다.
const wideNodes = [
  { id: 'mesh01', x: 24, y: 72, width: 72 },
  { id: 'mesh02', x: 184, y: 16, width: 72 },
  { id: 'mesh03', x: 184, y: 128, width: 72 },
  { id: 'mesh04', x: 344, y: 72, width: 72 },
]

const widePaths: Record<string, string> = {
  'link-01-02': 'M60 72 V32 H184',
  'link-01-03': 'M60 104 V144 H184',
  'link-02-04': 'M256 32 H380 V72',
  'link-03-04': 'M256 144 H380 V104',
  'hop-01-02': 'M60 72 V32 H184',
  'hop-02-04': 'M256 32 H380 V72',
  'hop-01-03': 'M60 104 V144 H184',
  'hop-03-04': 'M256 144 H380 V104',
}

const wideNotes: Note[] = [
  { id: 'off', x: 220, y: 11, anchor: 'middle' },
  { id: 'via-02', x: 220, y: 78, anchor: 'middle' },
  { id: 'via-03', x: 220, y: 106, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 링크를 함께 적는다. 평소에는 노드와 링크가 모두 살아 있고 프레임이 MESH02를 거친다.
// 노드가 꺼졌을 때는 MESH02와 거기 닿는 링크 둘이 흐려지고 프레임이 MESH03을 거친다.
export const meshRerouteScenarios: DiagramScenario[] = [
  {
    id: 'normal',
    nodes: ['mesh01', 'mesh02', 'mesh03', 'mesh04', 'link-01-02', 'link-01-03', 'link-02-04', 'link-03-04'],
    paths: ['hop-01-02', 'hop-02-04'],
  },
  {
    id: 'reroute',
    nodes: ['mesh01', 'mesh03', 'mesh04', 'link-01-03', 'link-03-04'],
    paths: ['hop-01-03', 'hop-03-04'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MeshRerouteDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-mesh-reroute-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={meshRerouteScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 240'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
