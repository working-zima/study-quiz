import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['wireless-lan'].diagrams['wpan-standards']

// 세로형은 왼쪽 IEEE 802.15 박스 안에 규격 셋을 위에서부터 802.15.1·802.15.3·802.15.4 차례로 쌓고,
// 같은 줄 오른쪽 박스 밖에 그 짝(블루투스·멀티미디어·SENSOR01)을 둔다. 곁말은 짝 노드 바로 아래에 둔다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'dot1', x: 24, y: 32, width: 80 },
  { id: 'dot3', x: 24, y: 88, width: 80 },
  { id: 'dot4', x: 24, y: 144, width: 80 },
  { id: 'bluetooth', x: 144, y: 32, width: 120 },
  { id: 'multimedia', x: 144, y: 88, width: 120 },
  { id: 'sensor01', x: 144, y: 144, width: 120 },
]

const groups = [
  { id: 'ieee80215', x: 8, y: 8, width: 112, height: 176, labelX: 16, labelY: 21 },
]

const paths: Record<string, string> = {
  'dot1-bluetooth': 'M104 48 H144',
  'dot3-multimedia': 'M104 104 H144',
  'dot4-sensor01': 'M104 160 H144',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'dot1-note': 'dot1',
  'dot3-note': 'dot3',
  'dot4-note': 'dot4',
}

const notes: Note[] = [
  { id: 'dot1-note', x: 204, y: 76, anchor: 'middle' },
  { id: 'dot3-note', x: 204, y: 132, anchor: 'middle' },
  { id: 'dot4-note', x: 204, y: 188, anchor: 'middle' },
]

// 가로형은 위쪽 IEEE 802.15 박스 안에 규격 셋을 한 줄로 두고, 각 규격 바로 아래 박스 밖에 그 짝을 둔다. 곁말은 짝 노드 아래에 둔다.
const wideNodes = [
  { id: 'dot1', x: 32, y: 32, width: 96 },
  { id: 'dot3', x: 172, y: 32, width: 96 },
  { id: 'dot4', x: 312, y: 32, width: 96 },
  { id: 'bluetooth', x: 16, y: 120, width: 128 },
  { id: 'multimedia', x: 156, y: 120, width: 128 },
  { id: 'sensor01', x: 296, y: 120, width: 128 },
]

const wideGroups = [
  { id: 'ieee80215', x: 8, y: 8, width: 424, height: 72, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'dot1-bluetooth': 'M80 64 V120',
  'dot3-multimedia': 'M220 64 V120',
  'dot4-sensor01': 'M360 64 V120',
}

const wideNotes: Note[] = [
  { id: 'dot1-note', x: 80, y: 168, anchor: 'middle' },
  { id: 'dot3-note', x: 220, y: 168, anchor: 'middle' },
  { id: 'dot4-note', x: 360, y: 168, anchor: 'middle' },
]

// 규격마다 그 규격과 짝 하나만 선명하고, 둘을 잇는 화살표 하나가 보인다.
export const wpanStandardsScenarios: DiagramScenario[] = [
  {
    id: 'dot1',
    nodes: ['dot1', 'bluetooth'],
    paths: ['dot1-bluetooth'],
  },
  {
    id: 'dot3',
    nodes: ['dot3', 'multimedia'],
    paths: ['dot3-multimedia'],
  },
  {
    id: 'dot4',
    nodes: ['dot4', 'sensor01'],
    paths: ['dot4-sensor01'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function WpanStandardsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-wpan-standards-arrow`
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
      scenarios={wpanStandardsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 196'}>
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
