import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-server-roles'].diagrams['dhcp-reservation']

// 세로형은 위쪽 SRV01의 범위 박스 안 윗줄에 MAC 주소 칸과 그 MAC 주소에 예약한 주소 칸을, 아랫줄에 나눠 줄 수 있는 주소 칸을 둔다.
// 박스 아래에는 예약한 주소 밑에 프린터를, 나눠 줄 수 있는 주소 밑에 PC01을 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'mac', x: 16, y: 28, width: 124 },
  { id: 'reserved', x: 172, y: 28, width: 88 },
  { id: 'pool', x: 16, y: 76, width: 160 },
  { id: 'printer', x: 188, y: 152, width: 56 },
  { id: 'pc01', x: 72, y: 152, width: 48 },
]

const groups = [
  { id: 'scope', x: 8, y: 8, width: 264, height: 112, labelX: 16, labelY: 21 },
]

// mac-reserved는 SRV01이 요청에 든 MAC 주소로 예약을 찾는 것이고, 나머지 둘은 SRV01이 클라이언트에게 주소를 주는 방향이다.
const paths: Record<string, string> = {
  'mac-reserved': 'M140 44 H172',
  'reserved-printer': 'M216 60 V152',
  'pool-pc': 'M96 108 V152',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'reserved-note': 'reserved',
  'other-note': 'other',
}

const notes: Note[] = [
  { id: 'reserved-note', x: 216, y: 204, anchor: 'middle' },
  { id: 'other-note', x: 96, y: 204, anchor: 'middle' },
]

// 가로형은 범위 박스를 왼쪽에 두고, 프린터와 PC01을 박스 오른쪽에 자기 칸과 같은 줄로 세운다.
const wideNodes = [
  { id: 'mac', x: 16, y: 28, width: 124 },
  { id: 'reserved', x: 172, y: 28, width: 88 },
  { id: 'pool', x: 16, y: 76, width: 160 },
  { id: 'printer', x: 312, y: 28, width: 56 },
  { id: 'pc01', x: 316, y: 76, width: 48 },
]

const wideGroups = [
  { id: 'scope', x: 8, y: 8, width: 264, height: 112, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'mac-reserved': 'M140 44 H172',
  'reserved-printer': 'M260 44 H312',
  'pool-pc': 'M176 92 H316',
}

const wideNotes: Note[] = [
  { id: 'reserved-note', x: 340, y: 72, anchor: 'middle' },
  { id: 'other-note', x: 340, y: 124, anchor: 'middle' },
]

// 예약한 장치: MAC 주소에서 예약을 찾아 예약한 주소를 프린터에게 준다. 다른 장치: 나눠 줄 수 있는 주소에서 PC01에게 준다(예약 노드를 지나지 않는다).
export const dhcpReservationScenarios: DiagramScenario[] = [
  { id: 'reserved', nodes: ['mac', 'reserved', 'printer'], paths: ['mac-reserved', 'reserved-printer'] },
  { id: 'other', nodes: ['pool', 'pc01'], paths: ['pool-pc'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DhcpReservationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-dhcp-reservation-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={dhcpReservationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 136' : '0 0 280 216'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
