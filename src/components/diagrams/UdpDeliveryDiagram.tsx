import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-udp'].diagrams['udp-delivery']

// 세로형은 왼쪽에 보내는 쪽, 오른쪽에 받는 쪽 기둥(그룹 박스)을 세우고, 그 사이에 데이터그램 하나를 노드 하나로 보낸 차례대로 위에서 아래로 놓는다.
// 방향은 노드 양옆의 짧은 화살표가 보인다. UDP에는 연결 맺기도 확인 응답도 다시 보내기도 없으므로, 화살표는 모두 보내는 쪽에서 받는 쪽으로만 간다.
// 데이터그램 사이를 넓게 두어 그 아래에 곁말이 들어갈 자리를 남겼다. 노드는 모두 회색이다.
const nodes = [
  { id: 'dg-1', x: 74, y: 40, width: 132 },
  { id: 'dg-2', x: 74, y: 96, width: 132 },
  { id: 'dg-3', x: 74, y: 152, width: 132 },
]

const groups = [
  { id: 'sender', x: 8, y: 8, width: 52, height: 200, labelX: 12, labelY: 20 },
  { id: 'receiver', x: 220, y: 8, width: 52, height: 200, labelX: 224, labelY: 20 },
]

const paths: Record<string, string> = {
  'd1-out': 'M60 56 H74',
  'd1-in': 'M206 56 H220',
  'd2-out': 'M60 112 H74',
  'd2-in': 'M206 112 H220',
  'd3-out': 'M60 168 H74',
  'd3-in': 'M206 168 H220',
}

// 곁말은 자기 시나리오에서만 보인다. 사라짐은 받는 쪽 기둥 안 데이터그램 2의 줄에, 나머지는 두 기둥 사이에 놓인다.
const notes = [
  { id: 'direct', x: 140, y: 32, scenarios: ['no-connection'] },
  { id: 'lost', x: 246, y: 116, scenarios: ['lost'] },
  { id: 'no-resend', x: 140, y: 142, scenarios: ['lost'] },
  { id: 'damaged', x: 140, y: 198, scenarios: ['damaged'] },
]

// 가로형도 같은 꼴로 두 기둥 사이를 넓힌다.
const wideNodes = [
  { id: 'dg-1', x: 152, y: 40, width: 136 },
  { id: 'dg-2', x: 152, y: 96, width: 136 },
  { id: 'dg-3', x: 152, y: 152, width: 136 },
]

const wideGroups = [
  { id: 'sender', x: 8, y: 8, width: 88, height: 200, labelX: 16, labelY: 20 },
  { id: 'receiver', x: 344, y: 8, width: 88, height: 200, labelX: 352, labelY: 20 },
]

const widePaths: Record<string, string> = {
  'd1-out': 'M96 56 H152',
  'd1-in': 'M288 56 H344',
  'd2-out': 'M96 112 H152',
  'd2-in': 'M288 112 H344',
  'd3-out': 'M96 168 H152',
  'd3-in': 'M288 168 H344',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'direct', x: 220, y: 32 },
  { id: 'lost', x: 388, y: 116 },
  { id: 'no-resend', x: 220, y: 142 },
  { id: 'damaged', x: 220, y: 198 },
]

// 바로 보내기: 연결을 맺지 않고 데이터그램 셋을 곧바로 보내 모두 닿는다.
// 잃었을 때: 데이터그램 2는 받는 쪽에 닿지 않고(흐림), 보내는 쪽은 다시 보내지 않는다.
// 망가졌을 때: 데이터그램 3은 닿았지만 체크섬이 맞지 않아 받는 쪽이 버린다.
export const udpDeliveryScenarios: DiagramScenario[] = [
  { id: 'no-connection', nodes: ['dg-1', 'dg-2', 'dg-3'], paths: ['d1-out', 'd1-in', 'd2-out', 'd2-in', 'd3-out', 'd3-in'] },
  { id: 'lost', nodes: ['dg-1', 'dg-3'], paths: ['d1-out', 'd1-in', 'd2-out', 'd3-out', 'd3-in'] },
  { id: 'damaged', nodes: ['dg-3'], paths: ['d3-out', 'd3-in'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function UdpDeliveryDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-udp-delivery-arrow`
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
      scenarios={udpDeliveryScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 216'}>
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
