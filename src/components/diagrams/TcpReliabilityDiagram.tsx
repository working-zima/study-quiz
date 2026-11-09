import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-udp'].diagrams['tcp-reliability']

// 세로형은 왼쪽에 보내는 쪽, 오른쪽에 받는 쪽 기둥(그룹 박스)을 세우고, 그 사이에 오가는 것 하나를 노드 하나로 위에서 아래로 차례대로 놓는다.
// 방향은 노드 양옆의 짧은 화살표가 보인다 — 기둥의 변에서 노드의 변까지, 노드의 변에서 기둥의 변까지다.
// 연결 맺기는 두 쪽이 주고받으므로 양옆에 두 방향 화살표를 하나씩 둔다. 받은 차례 노드는 받는 쪽 기둥 아래에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'connect', x: 74, y: 32, width: 132 },
  { id: 'seg-1', x: 74, y: 72, width: 132 },
  { id: 'seg-2', x: 74, y: 112, width: 132 },
  { id: 'seg-3', x: 74, y: 152, width: 132 },
  { id: 'ack', x: 74, y: 192, width: 132 },
  { id: 'resend', x: 74, y: 232, width: 132 },
  { id: 'deliver', x: 132, y: 288, width: 140 },
]

const groups = [
  { id: 'sender', x: 8, y: 8, width: 52, height: 264, labelX: 12, labelY: 20 },
  { id: 'receiver', x: 220, y: 8, width: 52, height: 264, labelX: 224, labelY: 20 },
]

const paths: Record<string, string> = {
  'connect-1': 'M60 42 H74',
  'connect-2': 'M206 42 H220',
  'connect-3': 'M220 54 H206',
  'connect-4': 'M74 54 H60',
  's1-out': 'M60 88 H74',
  's1-in': 'M206 88 H220',
  's2-out': 'M60 128 H74',
  's2-in': 'M206 128 H220',
  's3-out': 'M60 168 H74',
  's3-in': 'M206 168 H220',
  'ack-out': 'M220 208 H206',
  'ack-in': 'M74 208 H60',
  'resend-out': 'M60 248 H74',
  'resend-in': 'M206 248 H220',
  'deliver': 'M246 272 V288',
}

// 곁말은 자기 시나리오에서만 보이고, 받는 쪽 기둥 안에서 자기 세그먼트와 같은 줄에 놓인다.
const notes = [
  { id: 'late', x: 246, y: 132, scenarios: ['order'] },
  { id: 'early', x: 246, y: 172, scenarios: ['order'] },
  { id: 'lost', x: 246, y: 132, scenarios: ['resend'] },
]

// 가로형도 같은 꼴로 두 기둥 사이를 넓히고, 받은 차례 노드는 받는 쪽 기둥 아래에 둔다.
const wideNodes = [
  { id: 'connect', x: 152, y: 32, width: 136 },
  { id: 'seg-1', x: 152, y: 72, width: 136 },
  { id: 'seg-2', x: 152, y: 112, width: 136 },
  { id: 'seg-3', x: 152, y: 152, width: 136 },
  { id: 'ack', x: 152, y: 192, width: 136 },
  { id: 'resend', x: 152, y: 232, width: 136 },
  { id: 'deliver', x: 292, y: 288, width: 140 },
]

const wideGroups = [
  { id: 'sender', x: 8, y: 8, width: 88, height: 264, labelX: 16, labelY: 20 },
  { id: 'receiver', x: 344, y: 8, width: 88, height: 264, labelX: 352, labelY: 20 },
]

const widePaths: Record<string, string> = {
  'connect-1': 'M96 42 H152',
  'connect-2': 'M288 42 H344',
  'connect-3': 'M344 54 H288',
  'connect-4': 'M152 54 H96',
  's1-out': 'M96 88 H152',
  's1-in': 'M288 88 H344',
  's2-out': 'M96 128 H152',
  's2-in': 'M288 128 H344',
  's3-out': 'M96 168 H152',
  's3-in': 'M288 168 H344',
  'ack-out': 'M344 208 H288',
  'ack-in': 'M152 208 H96',
  'resend-out': 'M96 248 H152',
  'resend-in': 'M288 248 H344',
  'deliver': 'M388 272 V288',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'late', x: 388, y: 132 },
  { id: 'early', x: 388, y: 172 },
  { id: 'lost', x: 388, y: 132 },
]

// 연결 먼저: 데이터 세그먼트 없이 연결 맺기만 두 방향으로 오간다.
// 차례 맞추기: 세그먼트 셋이 모두 닿고, 받는 쪽이 차례대로 넘긴다.
// 다시 보내기: 세그먼트 2는 받는 쪽에 닿지 않고(흐림), 확인 응답 뒤 보내는 쪽이 다시 보낸 세그먼트 2가 닿는다.
export const tcpReliabilityScenarios: DiagramScenario[] = [
  { id: 'connect', nodes: ['connect'], paths: ['connect-1', 'connect-2', 'connect-3', 'connect-4'] },
  { id: 'order', nodes: ['seg-1', 'seg-2', 'seg-3', 'deliver'], paths: ['s1-out', 's1-in', 's2-out', 's2-in', 's3-out', 's3-in', 'deliver'] },
  {
    id: 'resend',
    nodes: ['seg-1', 'seg-3', 'ack', 'resend', 'deliver'],
    paths: ['s1-out', 's1-in', 's2-out', 's3-out', 's3-in', 'ack-out', 'ack-in', 'resend-out', 'resend-in', 'deliver'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TcpReliabilityDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-tcp-reliability-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={tcpReliabilityScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 328' : '0 0 280 328'}>
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
