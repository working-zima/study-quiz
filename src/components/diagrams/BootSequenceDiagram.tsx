import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['boot-sequence']

// 세로형은 다섯 단계를 위에서 아래로 쌓는다. 단계 사이의 화살표는 늘 보이고, 고른 단계가 넘겨주는 화살표만 굵게 겹쳐 그린다.
const nodes = [
  { id: 'firmware', x: 72, y: 8, width: 136 },
  { id: 'loader', x: 72, y: 72, width: 136 },
  { id: 'kernel', x: 72, y: 136, width: 136 },
  { id: 'init', x: 72, y: 200, width: 136 },
  { id: 'service', x: 72, y: 264, width: 136 },
]

const paths: Record<string, string> = {
  'l-loader': 'M140 40 V72',
  'l-kernel': 'M140 104 V136',
  'l-init': 'M140 168 V200',
  'l-service': 'M140 232 V264',
  'to-loader': 'M140 40 V72',
  'to-kernel': 'M140 104 V136',
  'to-init': 'M140 168 V200',
  'to-service': 'M140 232 V264',
}

const linkIds = ['l-loader', 'l-kernel', 'l-init', 'l-service']

// 곁말은 시나리오마다 하나이고, 그 단계가 넘겨주는 화살표의 오른쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'firmware', x: 148, y: 60, anchor: 'start', scenarios: ['firmware'] },
  { id: 'loader', x: 148, y: 124, anchor: 'start', scenarios: ['loader'] },
  { id: 'kernel', x: 148, y: 188, anchor: 'start', scenarios: ['kernel'] },
  { id: 'init', x: 148, y: 252, anchor: 'start', scenarios: ['init'] },
]

// 가로형은 다섯 단계를 왼쪽에서 오른쪽으로 한 줄에 둔다. 곁말은 넘겨주는 화살표 아래 가운데에 둔다.
const wideNodes = [
  { id: 'firmware', x: 8, y: 16, width: 64 },
  { id: 'loader', x: 92, y: 16, width: 80 },
  { id: 'kernel', x: 192, y: 16, width: 56 },
  { id: 'init', x: 268, y: 16, width: 56 },
  { id: 'service', x: 344, y: 16, width: 88 },
]

const widePaths: Record<string, string> = {
  'l-loader': 'M72 32 H92',
  'l-kernel': 'M172 32 H192',
  'l-init': 'M248 32 H268',
  'l-service': 'M324 32 H344',
  'to-loader': 'M72 32 H92',
  'to-kernel': 'M172 32 H192',
  'to-init': 'M248 32 H268',
  'to-service': 'M324 32 H344',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'firmware', x: 82, y: 68, anchor: 'middle' },
  { id: 'loader', x: 182, y: 68, anchor: 'middle' },
  { id: 'kernel', x: 258, y: 68, anchor: 'middle' },
  { id: 'init', x: 334, y: 68, anchor: 'middle' },
]

export const bootSequenceScenarios: DiagramScenario[] = [
  { id: 'firmware', nodes: ['firmware', 'loader'], paths: ['to-loader'] },
  { id: 'loader', nodes: ['loader', 'kernel'], paths: ['to-kernel'] },
  { id: 'kernel', nodes: ['kernel', 'init'], paths: ['to-init'] },
  { id: 'init', nodes: ['init', 'service'], paths: ['to-service'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function BootSequenceDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const baseId = useId()
  const arrowId = `${baseId}-boot-sequence-arrow`
  const linkArrowId = `${baseId}-boot-sequence-link-arrow`
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
      scenarios={bootSequenceScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 80' : '0 0 280 304'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
            <marker id={linkArrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-muted" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              markerEnd={`url(#${linkArrowId})`}
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
