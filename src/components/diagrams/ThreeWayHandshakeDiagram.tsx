import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-connection'].diagrams['three-way-handshake']

// 맨 위에 클라이언트와 서버의 주소·포트를 머리 노드로 두고, 그 아래 왼쪽에 클라이언트, 오른쪽에 서버 기둥(그룹 박스)을 세운다.
// 두 기둥 사이에는 세그먼트 하나를 박스 하나로 오가는 차례대로 위에서 아래로 놓는다. 박스 이름은 그 세그먼트에 켠 제어 비트이고, 안의 노드가 적는 번호다.
// 방향은 박스 양옆의 짧은 화살표가 보인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client', x: 8, y: 8, width: 128 },
  { id: 'server', x: 144, y: 8, width: 128 },
  { id: 'syn-seq', x: 88, y: 76, width: 104 },
  { id: 'synack-seq', x: 88, y: 148, width: 104 },
  { id: 'synack-ack', x: 88, y: 188, width: 104 },
  { id: 'ack-ack', x: 88, y: 272, width: 104 },
]

const groups = [
  { id: 'client-side', x: 8, y: 48, width: 60, height: 288, labelX: 12, labelY: 60 },
  { id: 'server-side', x: 212, y: 48, width: 60, height: 288, labelX: 216, labelY: 60 },
  { id: 'syn', x: 80, y: 56, width: 120, height: 60, labelX: 86, labelY: 69 },
  { id: 'syn-ack', x: 80, y: 128, width: 120, height: 100, labelX: 86, labelY: 141 },
  { id: 'ack', x: 80, y: 252, width: 120, height: 60, labelX: 86, labelY: 265 },
]

const paths: Record<string, string> = {
  'syn-out': 'M68 92 H80',
  'syn-in': 'M200 92 H212',
  'synack-out': 'M212 178 H200',
  'synack-in': 'M80 178 H68',
  'ack-out': 'M68 288 H80',
  'ack-in': 'M200 288 H212',
}

// 계산 곁말은 자기 시나리오에서만 보이고, 자기 세그먼트 박스 바로 아래 두 기둥 사이에 놓인다.
const notes = [
  { id: 'plus-client', x: 140, y: 242, scenarios: ['syn-ack'] },
  { id: 'plus-server', x: 140, y: 326, scenarios: ['ack'] },
]

// 가로형은 기둥 사이가 넓어 세그먼트 박스 안의 노드를 나란히 둔다. 왼쪽이 순서 번호, 오른쪽이 확인 응답이다.
const wideNodes = [
  { id: 'client', x: 8, y: 8, width: 128 },
  { id: 'server', x: 304, y: 8, width: 128 },
  { id: 'syn-seq', x: 116, y: 76, width: 100 },
  { id: 'synack-seq', x: 116, y: 148, width: 100 },
  { id: 'synack-ack', x: 224, y: 148, width: 100 },
  { id: 'ack-ack', x: 224, y: 232, width: 100 },
]

const wideGroups = [
  { id: 'client-side', x: 8, y: 48, width: 88, height: 248, labelX: 16, labelY: 60 },
  { id: 'server-side', x: 344, y: 48, width: 88, height: 248, labelX: 352, labelY: 60 },
  { id: 'syn', x: 108, y: 56, width: 224, height: 60, labelX: 116, labelY: 69 },
  { id: 'syn-ack', x: 108, y: 128, width: 224, height: 60, labelX: 116, labelY: 141 },
  { id: 'ack', x: 108, y: 212, width: 224, height: 60, labelX: 116, labelY: 225 },
]

const widePaths: Record<string, string> = {
  'syn-out': 'M96 92 H108',
  'syn-in': 'M332 92 H344',
  'synack-out': 'M344 164 H332',
  'synack-in': 'M108 164 H96',
  'ack-out': 'M96 248 H108',
  'ack-in': 'M332 248 H344',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'plus-client', x: 220, y: 202 },
  { id: 'plus-server', x: 220, y: 286 },
]

// ① 클라이언트가 SYN으로 자기 ISN을 알린다. ② 서버가 SYN과 ACK를 함께 켜 자기 ISN을 알리고 클라이언트의 ISN + 1로 확인한다.
// ③ 클라이언트가 ACK로 서버의 ISN + 1을 확인한다. 머리 노드 둘은 세 시나리오 모두 선명하다.
export const threeWayHandshakeScenarios: DiagramScenario[] = [
  { id: 'syn', nodes: ['client', 'server', 'syn-seq'], paths: ['syn-out', 'syn-in'] },
  { id: 'syn-ack', nodes: ['client', 'server', 'synack-seq', 'synack-ack'], paths: ['synack-out', 'synack-in'] },
  { id: 'ack', nodes: ['client', 'server', 'ack-ack'], paths: ['ack-out', 'ack-in'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ThreeWayHandshakeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-three-way-handshake-arrow`
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
      scenarios={threeWayHandshakeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 304' : '0 0 280 344'}>
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
