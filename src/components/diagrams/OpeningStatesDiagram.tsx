import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-connection'].diagrams['opening-states']

// 왼쪽 줄에 클라이언트의 상태, 오른쪽 줄에 서버의 상태를 위에서 아래로 놓고, 가운데 줄에 오가는 세그먼트를 놓는다. 아래로 갈수록 나중이다.
// 화살표는 세그먼트를 보낸 쪽의 상태에서 나와 세그먼트를 거쳐, 그것을 받은 쪽이 옮겨 간 상태의 위 변으로 들어간다.
// 줄 위의 곁말이 어느 쪽 줄인지 알린다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client-closed', x: 8, y: 22, width: 90 },
  { id: 'client-syn-sent', x: 8, y: 70, width: 90 },
  { id: 'client-established', x: 8, y: 166, width: 90 },
  { id: 'server-listen', x: 182, y: 22, width: 90 },
  { id: 'server-syn-received', x: 182, y: 118, width: 90 },
  { id: 'server-established', x: 182, y: 214, width: 90 },
  { id: 'seg-syn', x: 110, y: 70, width: 60 },
  { id: 'seg-synack', x: 110, y: 118, width: 60 },
  { id: 'seg-ack', x: 110, y: 166, width: 60 },
]

const paths: Record<string, string> = {
  'syn-out': 'M98 86 H110',
  'syn-in': 'M170 86 H227 V118',
  'synack-out': 'M182 134 H170',
  'synack-in': 'M110 134 H53 V166',
  'ack-out': 'M98 182 H110',
  'ack-in': 'M170 182 H227 V214',
}

// 줄 머리 곁말은 늘 보이고, 나머지 곁말은 자기 시나리오에서만 모든 노드 아래 가운데에 보인다.
const notes = [
  { id: 'head-client', x: 53, y: 14, scenarios: null },
  { id: 'head-server', x: 227, y: 14, scenarios: null },
  { id: 'wait-synack', x: 140, y: 264, scenarios: ['syn-sent'] },
  { id: 'wait-ack', x: 140, y: 264, scenarios: ['syn-received'] },
  { id: 'client-first', x: 140, y: 264, scenarios: ['client-established'] },
  { id: 'server-last', x: 140, y: 264, scenarios: ['server-established'] },
]

// 가로형은 같은 꼴로 줄 사이를 넓힌다.
const wideNodes = [
  { id: 'client-closed', x: 16, y: 22, width: 112 },
  { id: 'client-syn-sent', x: 16, y: 70, width: 112 },
  { id: 'client-established', x: 16, y: 166, width: 112 },
  { id: 'server-listen', x: 312, y: 22, width: 112 },
  { id: 'server-syn-received', x: 312, y: 118, width: 112 },
  { id: 'server-established', x: 312, y: 214, width: 112 },
  { id: 'seg-syn', x: 164, y: 70, width: 112 },
  { id: 'seg-synack', x: 164, y: 118, width: 112 },
  { id: 'seg-ack', x: 164, y: 166, width: 112 },
]

const widePaths: Record<string, string> = {
  'syn-out': 'M128 86 H164',
  'syn-in': 'M276 86 H368 V118',
  'synack-out': 'M312 134 H276',
  'synack-in': 'M164 134 H72 V166',
  'ack-out': 'M128 182 H164',
  'ack-in': 'M276 182 H368 V214',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'head-client', x: 72, y: 14 },
  { id: 'head-server', x: 368, y: 14 },
  { id: 'wait-synack', x: 220, y: 264 },
  { id: 'wait-ack', x: 220, y: 264 },
  { id: 'client-first', x: 220, y: 264 },
  { id: 'server-last', x: 220, y: 264 },
]

// SYN을 보낸 뒤 — 클라이언트는 SYN-SENT, 서버는 아직 LISTEN. SYN을 받은 뒤 — 서버가 SYN+ACK로 답하고 SYN-RECEIVED.
// 클라이언트 연결됨 — SYN+ACK를 받은 클라이언트가 ACK를 보내며 ESTABLISHED, 서버는 아직 SYN-RECEIVED. 서버 연결됨 — ACK를 받은 서버도 ESTABLISHED.
export const openingStatesScenarios: DiagramScenario[] = [
  { id: 'syn-sent', nodes: ['client-syn-sent', 'seg-syn', 'server-listen'], paths: ['syn-out'] },
  { id: 'syn-received', nodes: ['seg-syn', 'server-syn-received', 'seg-synack'], paths: ['syn-in', 'synack-out'] },
  { id: 'client-established', nodes: ['seg-synack', 'seg-ack', 'client-established', 'server-syn-received'], paths: ['synack-in', 'ack-out'] },
  { id: 'server-established', nodes: ['seg-ack', 'server-established'], paths: ['ack-in'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function OpeningStatesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-opening-states-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.scenarios === null || (active !== null && note.scenarios.includes(active.id)))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={openingStatesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 272' : '0 0 280 272'}>
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
