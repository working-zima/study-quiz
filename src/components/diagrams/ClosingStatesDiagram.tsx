import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-connection'].diagrams['closing-states']

// 왼쪽 줄에 먼저 끊는 클라이언트의 상태, 오른쪽 줄에 나중에 끊는 서버의 상태를 위에서 아래로 놓고, 가운데 줄에 오가는 세그먼트를 놓는다. 아래로 갈수록 나중이다.
// 화살표는 세그먼트를 보낸 쪽의 상태에서 나와 세그먼트를 거쳐, 그것을 받은 쪽이 옮겨 간 상태의 위 변으로 들어간다.
// 세 줄 아래의 박스에는 두 쪽이 거의 함께 끊을 때 한쪽이 거치는 상태 셋을 왼쪽에서 오른쪽으로 놓는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client-established', x: 8, y: 22, width: 90 },
  { id: 'client-fin-wait-1', x: 8, y: 66, width: 90 },
  { id: 'client-fin-wait-2', x: 8, y: 154, width: 90 },
  { id: 'client-time-wait', x: 8, y: 242, width: 90 },
  { id: 'client-closed', x: 8, y: 330, width: 90 },
  { id: 'server-established', x: 182, y: 22, width: 90 },
  { id: 'server-close-wait', x: 182, y: 110, width: 90 },
  { id: 'server-last-ack', x: 182, y: 198, width: 90 },
  { id: 'server-closed', x: 182, y: 286, width: 90 },
  { id: 'seg-fin-1', x: 110, y: 66, width: 60 },
  { id: 'seg-ack-1', x: 110, y: 110, width: 60 },
  { id: 'seg-fin-2', x: 110, y: 198, width: 60 },
  { id: 'seg-ack-2', x: 110, y: 242, width: 60 },
  { id: 'sim-fin-wait-1', x: 14, y: 398, width: 78 },
  { id: 'sim-closing', x: 108, y: 398, width: 64 },
  { id: 'sim-time-wait', x: 188, y: 398, width: 78 },
]

const groups = [
  { id: 'simultaneous', x: 8, y: 378, width: 264, height: 60, labelX: 12, labelY: 390 },
]

const paths: Record<string, string> = {
  'fin1-out': 'M98 82 H110',
  'fin1-in': 'M170 82 H227 V110',
  'ack1-out': 'M182 126 H170',
  'ack1-in': 'M110 126 H53 V154',
  'fin2-out': 'M182 214 H170',
  'fin2-in': 'M110 214 H53 V242',
  'ack2-out': 'M98 258 H110',
  'ack2-in': 'M170 258 H227 V286',
  'sim-1': 'M92 414 H108',
  'sim-2': 'M172 414 H188',
}

// 줄 머리 곁말은 늘 보이고, 나머지 곁말은 자기 시나리오에서만 모든 노드와 아래 박스 밑 가운데에 보인다.
const notes = [
  { id: 'head-active', x: 53, y: 14, scenarios: null },
  { id: 'head-passive', x: 227, y: 14, scenarios: null },
  { id: 'wait-fin', x: 140, y: 456, scenarios: ['active'] },
  { id: 'wait-program', x: 140, y: 456, scenarios: ['passive'] },
  { id: 'wait-ack', x: 140, y: 456, scenarios: ['simultaneous'] },
]

// 가로형은 같은 꼴로 줄 사이를 넓힌다.
const wideNodes = [
  { id: 'client-established', x: 16, y: 22, width: 112 },
  { id: 'client-fin-wait-1', x: 16, y: 66, width: 112 },
  { id: 'client-fin-wait-2', x: 16, y: 154, width: 112 },
  { id: 'client-time-wait', x: 16, y: 242, width: 112 },
  { id: 'client-closed', x: 16, y: 330, width: 112 },
  { id: 'server-established', x: 312, y: 22, width: 112 },
  { id: 'server-close-wait', x: 312, y: 110, width: 112 },
  { id: 'server-last-ack', x: 312, y: 198, width: 112 },
  { id: 'server-closed', x: 312, y: 286, width: 112 },
  { id: 'seg-fin-1', x: 164, y: 66, width: 112 },
  { id: 'seg-ack-1', x: 164, y: 110, width: 112 },
  { id: 'seg-fin-2', x: 164, y: 198, width: 112 },
  { id: 'seg-ack-2', x: 164, y: 242, width: 112 },
  { id: 'sim-fin-wait-1', x: 64, y: 398, width: 96 },
  { id: 'sim-closing', x: 184, y: 398, width: 72 },
  { id: 'sim-time-wait', x: 280, y: 398, width: 96 },
]

const wideGroups = [
  { id: 'simultaneous', x: 8, y: 378, width: 424, height: 60, labelX: 16, labelY: 390 },
]

const widePaths: Record<string, string> = {
  'fin1-out': 'M128 82 H164',
  'fin1-in': 'M276 82 H368 V110',
  'ack1-out': 'M312 126 H276',
  'ack1-in': 'M164 126 H72 V154',
  'fin2-out': 'M312 214 H276',
  'fin2-in': 'M164 214 H72 V242',
  'ack2-out': 'M128 258 H164',
  'ack2-in': 'M276 258 H368 V286',
  'sim-1': 'M160 414 H184',
  'sim-2': 'M256 414 H280',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'head-active', x: 72, y: 14 },
  { id: 'head-passive', x: 368, y: 14 },
  { id: 'wait-fin', x: 220, y: 456 },
  { id: 'wait-program', x: 220, y: 456 },
  { id: 'wait-ack', x: 220, y: 456 },
]

const clientStates = ['client-established', 'client-fin-wait-1', 'client-fin-wait-2', 'client-time-wait', 'client-closed']
const serverStates = ['server-established', 'server-close-wait', 'server-last-ack', 'server-closed']
const segments = ['seg-fin-1', 'seg-ack-1', 'seg-fin-2', 'seg-ack-2']
const columnPaths = ['fin1-out', 'fin1-in', 'ack1-out', 'ack1-in', 'fin2-out', 'fin2-in', 'ack2-out', 'ack2-in']

// 먼저 끊는 쪽 — 클라이언트의 상태 다섯과 오가는 세그먼트. 나중에 끊는 쪽 — 서버의 상태 넷과 오가는 세그먼트.
// 동시에 끊기 — 아래 박스의 FIN-WAIT-1 → CLOSING → TIME-WAIT.
export const closingStatesScenarios: DiagramScenario[] = [
  { id: 'active', nodes: [...clientStates, ...segments], paths: columnPaths },
  { id: 'passive', nodes: [...serverStates, ...segments], paths: columnPaths },
  { id: 'simultaneous', nodes: ['sim-fin-wait-1', 'sim-closing', 'sim-time-wait'], paths: ['sim-1', 'sim-2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ClosingStatesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-closing-states-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.scenarios === null || (active !== null && note.scenarios.includes(active.id)))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={closingStatesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 464' : '0 0 280 464'}>
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
