import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['transmission-media'].diagrams['media-signal-kinds']

// 세로형은 왼쪽에 보내는 쪽, 오른쪽에 받는 쪽을 두고, 가운데 열의 위쪽 유선 매체 박스에 구리선과 광섬유를,
// 아래쪽 무선 매체 박스에 공간을 쌓는다. 화살표는 신호가 보내는 쪽에서 매체 하나를 지나 받는 쪽으로 가는 길이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'sender', x: 8, y: 80, width: 68 },
  { id: 'copper', x: 108, y: 28, width: 64 },
  { id: 'fiber', x: 108, y: 80, width: 64 },
  { id: 'space', x: 108, y: 164, width: 64 },
  { id: 'receiver', x: 204, y: 80, width: 68 },
]

const groups = [
  { id: 'wired', x: 92, y: 8, width: 96, height: 124, labelX: 100, labelY: 21 },
  { id: 'wireless', x: 92, y: 144, width: 96, height: 72, labelX: 100, labelY: 157 },
]

const paths: Record<string, string> = {
  'sender-copper': 'M40 80 V44 H108',
  'copper-receiver': 'M172 44 H238 V80',
  'sender-fiber': 'M76 96 H108',
  'fiber-receiver': 'M172 96 H204',
  'sender-space': 'M40 112 V180 H108',
  'space-receiver': 'M172 180 H238 V112',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 매체마다 신호가 무엇에 실려 가는지 적는다. 자기 시나리오를 골랐을 때만 보이고, 세로형은 그 매체 노드 바로 아래의 빈자리에 둔다.
const noteScenarios: Record<string, string> = {
  'copper-note': 'wired',
  'fiber-note': 'wired',
  'space-note': 'wireless',
}

const notes: Note[] = [
  { id: 'copper-note', x: 140, y: 73, anchor: 'middle' },
  { id: 'fiber-note', x: 140, y: 125, anchor: 'middle' },
  { id: 'space-note', x: 140, y: 209, anchor: 'middle' },
]

// 가로형은 같은 짜임을 넓힌다. 매체 박스를 넓혀 곁말을 매체 노드의 오른쪽, 받는 쪽으로 가는 화살표 바로 위에 둔다.
const wideNodes = [
  { id: 'sender', x: 8, y: 68, width: 88 },
  { id: 'copper', x: 144, y: 28, width: 72 },
  { id: 'fiber', x: 144, y: 68, width: 72 },
  { id: 'space', x: 144, y: 140, width: 72 },
  { id: 'receiver', x: 344, y: 68, width: 88 },
]

const wideGroups = [
  { id: 'wired', x: 128, y: 8, width: 184, height: 100, labelX: 136, labelY: 21 },
  { id: 'wireless', x: 128, y: 120, width: 184, height: 60, labelX: 136, labelY: 133 },
]

const widePaths: Record<string, string> = {
  'sender-copper': 'M52 68 V44 H144',
  'copper-receiver': 'M216 44 H388 V68',
  'sender-fiber': 'M96 84 H144',
  'fiber-receiver': 'M216 84 H344',
  'sender-space': 'M52 100 V156 H144',
  'space-receiver': 'M216 156 H388 V100',
}

const wideNotes: Note[] = [
  { id: 'copper-note', x: 224, y: 40, anchor: 'start' },
  { id: 'fiber-note', x: 224, y: 80, anchor: 'start' },
  { id: 'space-note', x: 224, y: 152, anchor: 'start' },
]

// 유선 매체: 신호가 구리선이나 광섬유를 지나 받는 쪽으로 간다. 무선 매체: 신호가 공간을 지나 받는 쪽으로 간다.
export const mediaSignalKindsScenarios: DiagramScenario[] = [
  {
    id: 'wired',
    nodes: ['sender', 'copper', 'fiber', 'receiver'],
    paths: ['sender-copper', 'copper-receiver', 'sender-fiber', 'fiber-receiver'],
  },
  {
    id: 'wireless',
    nodes: ['sender', 'space', 'receiver'],
    paths: ['sender-space', 'space-receiver'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MediaSignalKindsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-media-signal-kinds-arrow`
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
      scenarios={mediaSignalKindsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 188' : '0 0 280 224'}>
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
