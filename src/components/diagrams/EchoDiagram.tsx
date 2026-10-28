import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['icmp'].diagrams['echo']

// 위에서 아래로 두 번의 왕복을 배치한다. 같은 호스트를 되풀이해 그리고, 보내는 쪽만 선명하게 둔다.
const nodes = [
  { id: 'host-a-1', x: 8, y: 32, width: 80 },
  { id: 'host-b-1', x: 192, y: 32, width: 80 },
  { id: 'host-a-2', x: 8, y: 144, width: 80 },
  { id: 'host-b-2', x: 192, y: 144, width: 80 },
]

const paths: Record<string, string> = {
  'request-1': 'M88 40 H192',
  'reply-1': 'M192 56 H88',
  'request-2': 'M88 152 H192',
  'reply-2': 'M192 168 H88',
}

const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'request-1-note', x: 140, y: 20, anchor: 'middle', scenarios: ['request'] },
  { id: 'request-2-note', x: 140, y: 132, anchor: 'middle', scenarios: ['request'] },
  { id: 'reply-1-note', x: 140, y: 84, anchor: 'middle', scenarios: ['reply'] },
  { id: 'reply-2-note', x: 140, y: 196, anchor: 'middle', scenarios: ['reply'] },
]

const wideNodes = [
  { id: 'host-a-1', x: 16, y: 32, width: 96 },
  { id: 'host-b-1', x: 328, y: 32, width: 96 },
  { id: 'host-a-2', x: 16, y: 144, width: 96 },
  { id: 'host-b-2', x: 328, y: 144, width: 96 },
]

const widePaths: Record<string, string> = {
  'request-1': 'M112 40 H328',
  'reply-1': 'M328 56 H112',
  'request-2': 'M112 152 H328',
  'reply-2': 'M328 168 H112',
}

const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'request-1-note', x: 220, y: 20, anchor: 'middle' },
  { id: 'request-2-note', x: 220, y: 132, anchor: 'middle' },
  { id: 'reply-1-note', x: 220, y: 84, anchor: 'middle' },
  { id: 'reply-2-note', x: 220, y: 196, anchor: 'middle' },
]

export const echoScenarios: DiagramScenario[] = [
  { id: 'request', nodes: ['host-a-1', 'host-a-2'], paths: ['request-1', 'request-2'] },
  { id: 'reply', nodes: ['host-b-1', 'host-b-2'], paths: ['reply-1', 'reply-2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EchoDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-echo-arrow`
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
      scenarios={echoScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 200'}>
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
