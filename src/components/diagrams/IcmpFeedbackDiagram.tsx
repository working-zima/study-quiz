import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['icmp'].diagrams['icmp-feedback']

// 세로형은 출발지 호스트·라우터·목적지 호스트를 위에서 아래로 쌓는다. 목적지 쪽으로 가는 화살표는 왼쪽(x 48)에,
// 출발지 쪽으로 돌아오는 화살표는 오른쪽(x 96)에 나란히 둔다. 노드는 모두 회색이고 박스는 없다.
const nodes = [
  { id: 'source', x: 16, y: 8, width: 112 },
  { id: 'router', x: 16, y: 104, width: 112 },
  { id: 'dest', x: 16, y: 200, width: 112 },
]

const paths: Record<string, string> = {
  'packet': 'M48 40 V104',
  'error': 'M96 104 V40',
  'request-1': 'M48 40 V104',
  'request-2': 'M48 136 V200',
  'reply-1': 'M96 200 V136',
  'reply-2': 'M96 104 V40',
}

// 장치에 붙는 곁말은 그 장치 오른쪽에, 오가는 메시지의 곁말은 출발지와 라우터 사이에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'drop-note', x: 140, y: 124, anchor: 'start', scenarios: ['error'] },
  { id: 'error-note', x: 104, y: 76, anchor: 'start', scenarios: ['error'] },
  { id: 'unreachable-note', x: 140, y: 220, anchor: 'start', scenarios: ['error'] },
  { id: 'request-note', x: 40, y: 76, anchor: 'end', scenarios: ['query'] },
  { id: 'reply-note', x: 104, y: 76, anchor: 'start', scenarios: ['query'] },
]

// 가로형은 세 장치를 왼쪽에서 오른쪽으로 한 줄에 둔다. 목적지 쪽으로 가는 화살표는 위(y 40), 돌아오는 화살표는 아래(y 56)다.
const wideNodes = [
  { id: 'source', x: 16, y: 32, width: 96 },
  { id: 'router', x: 172, y: 32, width: 96 },
  { id: 'dest', x: 328, y: 32, width: 96 },
]

const widePaths: Record<string, string> = {
  'packet': 'M112 40 H172',
  'error': 'M172 56 H112',
  'request-1': 'M112 40 H172',
  'request-2': 'M268 40 H328',
  'reply-1': 'M328 56 H268',
  'reply-2': 'M172 56 H112',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'drop-note', x: 220, y: 20, anchor: 'middle' },
  { id: 'error-note', x: 142, y: 84, anchor: 'middle' },
  { id: 'unreachable-note', x: 376, y: 20, anchor: 'middle' },
  { id: 'request-note', x: 142, y: 28, anchor: 'middle' },
  { id: 'reply-note', x: 142, y: 84, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드를 적는다. 오류 보고에서는 패킷이 닿지 못한 목적지 호스트가 흐려진다.
// 오류 보고에는 패킷을 다시 보내는 화살표가 없다 — ICMP는 문제를 알릴 뿐 다시 보내지 않는다.
export const icmpFeedbackScenarios: DiagramScenario[] = [
  { id: 'error', nodes: ['source', 'router'], paths: ['packet', 'error'] },
  { id: 'query', nodes: ['source', 'router', 'dest'], paths: ['request-1', 'request-2', 'reply-1', 'reply-2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IcmpFeedbackDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-icmp-feedback-arrow`
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
      scenarios={icmpFeedbackScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 96' : '0 0 280 240'}>
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
