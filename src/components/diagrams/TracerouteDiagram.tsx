import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['icmp'].diagrams['traceroute']

// 요청과 돌아오는 답을 나란한 선으로 구별한다. TTL이 다 된 장치 뒤로는 화살표를 그리지 않는다.
const nodes = [
  { id: 'source', x: 16, y: 8, width: 112 },
  { id: 'router-1', x: 16, y: 104, width: 112 },
  { id: 'router-2', x: 16, y: 200, width: 112 },
  { id: 'dest', x: 16, y: 296, width: 112 },
]

const paths: Record<string, string> = {
  'out-1': 'M48 40 V104',
  'out-2': 'M48 136 V200',
  'out-3': 'M48 232 V296',
  'back-1': 'M96 104 V40',
  'back-2': 'M96 200 V136',
  'back-3': 'M96 296 V232',
}

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'ttl-1-1', x: 12, y: 76, anchor: 'start', scenarios: ['ttl-1'] },
  { id: 'drop-1', x: 140, y: 124, anchor: 'start', scenarios: ['ttl-1'] },
  { id: 'time-1', x: 112, y: 76, anchor: 'start', scenarios: ['ttl-1'] },
  { id: 'ttl-2-1', x: 12, y: 76, anchor: 'start', scenarios: ['ttl-2'] },
  { id: 'ttl-2-2', x: 12, y: 172, anchor: 'start', scenarios: ['ttl-2'] },
  { id: 'drop-2', x: 140, y: 220, anchor: 'start', scenarios: ['ttl-2'] },
  { id: 'time-2', x: 112, y: 172, anchor: 'start', scenarios: ['ttl-2'] },
  { id: 'ttl-3-1', x: 12, y: 76, anchor: 'start', scenarios: ['ttl-3'] },
  { id: 'ttl-3-2', x: 12, y: 172, anchor: 'start', scenarios: ['ttl-3'] },
  { id: 'ttl-3-3', x: 12, y: 268, anchor: 'start', scenarios: ['ttl-3'] },
  { id: 'echo-reply', x: 112, y: 268, anchor: 'start', scenarios: ['ttl-3'] },
]

const wideNodes = [
  { id: 'source', x: 8, y: 40, width: 88 },
  { id: 'router-1', x: 128, y: 40, width: 72 },
  { id: 'router-2', x: 240, y: 40, width: 72 },
  { id: 'dest', x: 344, y: 40, width: 88 },
]

const widePaths: Record<string, string> = {
  'out-1': 'M96 48 H128',
  'out-2': 'M200 48 H240',
  'out-3': 'M312 48 H344',
  'back-1': 'M128 64 H96',
  'back-2': 'M240 64 H200',
  'back-3': 'M344 64 H312',
}

const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'ttl-1-1', x: 112, y: 30, anchor: 'middle' },
  { id: 'drop-1', x: 164, y: 14, anchor: 'middle' },
  { id: 'time-1', x: 112, y: 108, anchor: 'middle' },
  { id: 'ttl-2-1', x: 112, y: 30, anchor: 'middle' },
  { id: 'ttl-2-2', x: 220, y: 30, anchor: 'middle' },
  { id: 'drop-2', x: 276, y: 14, anchor: 'middle' },
  { id: 'time-2', x: 220, y: 108, anchor: 'middle' },
  { id: 'ttl-3-1', x: 112, y: 30, anchor: 'middle' },
  { id: 'ttl-3-2', x: 220, y: 30, anchor: 'middle' },
  { id: 'ttl-3-3', x: 328, y: 30, anchor: 'middle' },
  { id: 'echo-reply', x: 328, y: 108, anchor: 'middle' },
]

export const tracerouteScenarios: DiagramScenario[] = [
  { id: 'ttl-1', nodes: ['source', 'router-1'], paths: ['out-1', 'back-1'] },
  { id: 'ttl-2', nodes: ['source', 'router-1', 'router-2'], paths: ['out-1', 'out-2', 'back-2', 'back-1'] },
  { id: 'ttl-3', nodes: ['source', 'router-1', 'router-2', 'dest'], paths: ['out-1', 'out-2', 'out-3', 'back-3', 'back-2', 'back-1'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TracerouteDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-traceroute-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={tracerouteScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 128' : '0 0 280 336'}>
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

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
