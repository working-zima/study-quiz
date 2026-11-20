import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['wireless-lan'].diagrams['cognitive-radio']

// 세로형은 맨 위에 인지 무선 장치를 두 채널 위로 넓게 두고, 그 아래 줄에 채널 A·채널 B를, 채널 A 아래에 허가받은 사용자를 둔다.
// 화살표는 장치나 허가받은 사용자에서 그쪽이 쓰는 채널로 간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'device', x: 40, y: 16, width: 200 },
  { id: 'ch-a', x: 24, y: 104, width: 96 },
  { id: 'ch-b', x: 160, y: 104, width: 96 },
  { id: 'licensed', x: 16, y: 184, width: 112 },
]

const paths: Record<string, string> = {
  'device-ch-a': 'M72 48 V104',
  'device-ch-b': 'M208 48 V104',
  'licensed-ch-a': 'M72 184 V136',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'sense-note': 'sense',
  'move-note': 'vacate',
  'licensed-note': 'vacate',
}

const notes: Note[] = [
  { id: 'sense-note', x: 80, y: 72, anchor: 'start' },
  { id: 'move-note', x: 200, y: 92, anchor: 'end' },
  { id: 'licensed-note', x: 80, y: 164, anchor: 'start' },
]

// 가로형은 허가받은 사용자를 채널 A 왼쪽에 두어 높이를 줄인다. 장치는 두 채널 위로 넓게 둔다.
const wideNodes = [
  { id: 'device', x: 168, y: 16, width: 248 },
  { id: 'ch-a', x: 168, y: 96, width: 104 },
  { id: 'ch-b', x: 312, y: 96, width: 104 },
  { id: 'licensed', x: 16, y: 96, width: 112 },
]

const widePaths: Record<string, string> = {
  'device-ch-a': 'M220 48 V96',
  'device-ch-b': 'M364 48 V96',
  'licensed-ch-a': 'M128 112 H168',
}

const wideNotes: Note[] = [
  { id: 'sense-note', x: 228, y: 72, anchor: 'start' },
  { id: 'move-note', x: 356, y: 88, anchor: 'end' },
  { id: 'licensed-note', x: 16, y: 148, anchor: 'start' },
]

// 빈 채널 쓰기: 장치가 비어 있는 채널 A를 쓴다. 비켜 가기: 허가받은 사용자가 채널 A를 쓰기 시작하고 장치는 채널 B로 옮긴다.
export const cognitiveRadioScenarios: DiagramScenario[] = [
  {
    id: 'sense',
    nodes: ['device', 'ch-a', 'ch-b'],
    paths: ['device-ch-a'],
  },
  {
    id: 'vacate',
    nodes: ['device', 'ch-a', 'ch-b', 'licensed'],
    paths: ['licensed-ch-a', 'device-ch-b'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CognitiveRadioDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-cognitive-radio-arrow`
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
      scenarios={cognitiveRadioScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 232'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
