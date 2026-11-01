import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-compute'].diagrams['function-trigger']

// 트리거 셋을 위 줄에, 함수를 그 아래 가운데에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'request', x: 8, y: 8, width: 68 },
  { id: 'timer', x: 84, y: 8, width: 52 },
  { id: 'message', x: 142, y: 8, width: 130 },
  { id: 'function', x: 72, y: 96, width: 136 },
]

// 트리거 아래 변에서 나와 함수 위 변의 서로 다른 점에 닿는다. 한 번에 경로 하나만 보인다.
const paths: Record<string, string> = {
  'from-request': 'M42 40 V68 H100 V96',
  'from-timer': 'M110 40 V96',
  'from-message': 'M207 40 V68 H180 V96',
}
// 곁말은 함수 아래 같은 자리에 둔다. 시나리오마다 하나만 보인다.
const notes = [
  { id: 'idle-note', x: 140, y: 142 },
  { id: 'request-note', x: 140, y: 142 },
  { id: 'timer-note', x: 140, y: 142 },
  { id: 'message-note', x: 140, y: 142 },
]

// 가로형은 트리거 셋을 왼쪽에 위아래로, 함수를 오른쪽 가운데에 둔다.
const wideNodes = [
  { id: 'request', x: 56, y: 8, width: 130 },
  { id: 'timer', x: 56, y: 56, width: 130 },
  { id: 'message', x: 56, y: 104, width: 130 },
  { id: 'function', x: 264, y: 56, width: 112 },
]
const widePaths: Record<string, string> = {
  'from-request': 'M186 24 H224 V64 H264',
  'from-timer': 'M186 72 H264',
  'from-message': 'M186 120 H224 V80 H264',
}
const wideNotes = [
  { id: 'idle-note', x: 320, y: 102 },
  { id: 'request-note', x: 320, y: 102 },
  { id: 'timer-note', x: 320, y: 102 },
  { id: 'message-note', x: 320, y: 102 },
]

const scenarioNote: Record<string, string> = { idle: 'idle-note', request: 'request-note', timer: 'timer-note', message: 'message-note' }

export const functionTriggerScenarios: DiagramScenario[] = [
  { id: 'idle', nodes: ['function'], paths: [] as string[] },
  { id: 'request', nodes: ['request', 'function'], paths: ['from-request'] },
  { id: 'timer', nodes: ['timer', 'function'], paths: ['from-timer'] },
  { id: 'message', nodes: ['message', 'function'], paths: ['from-message'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FunctionTriggerDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-function-trigger-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && scenarioNote[active.id] === note.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={functionTriggerScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 152'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {visiblePaths.map((id) => (
            <path
              key={id}
              data-path={id}
              d={layoutPaths[id]}
              className="fill-none stroke-title"
              strokeWidth="1.5"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
