import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-address-types'].diagrams['dhcp-lease']

// 세로형은 왼쪽 위에 DHCP 서버, 왼쪽 아래에 PC를 두고, 둘 사이 오른쪽에 서버가 알려 주는 값 넷을 박스로 묶어 쌓는다.
// 화살표는 박스 왼쪽의 빈 길로 서버와 PC 사이를 오간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'server', x: 8, y: 8, width: 104 },
  { id: 'pc', x: 8, y: 252, width: 104 },
  { id: 'ip', x: 72, y: 76, width: 192 },
  { id: 'mask', x: 72, y: 116, width: 192 },
  { id: 'gateway', x: 72, y: 156, width: 192 },
  { id: 'dns', x: 72, y: 196, width: 192 },
]

const groups = [
  { id: 'settings', x: 56, y: 56, width: 216, height: 180, labelX: 64, labelY: 68 },
]

// 서버에서 PC로 가는 화살표는 x 24, PC에서 서버로 가는 화살표는 x 48을 지난다.
// 갱신의 응답은 임대와 같은 길로 서버에서 PC로 간다.
const paths: Record<string, string> = {
  'lease': 'M24 40 V252',
  'renew-request': 'M48 252 V40',
  'renew-reply': 'M24 40 V252',
}

// 서버의 주소는 서버의 흐림을 따른다.
const ownerNotes = [
  { id: 'server-address', owner: 'server', x: 120, y: 28, anchor: 'start' as const },
]

// 임대와 갱신의 내용은 자기 시나리오에서만 보이고 PC 오른쪽에 둔다.
const notes = [
  { id: 'lease-time', x: 120, y: 266, anchor: 'start' as const, scenarios: ['lease'] },
  { id: 'renew-time', x: 120, y: 266, anchor: 'start' as const, scenarios: ['renew'] },
  { id: 'renew-ack', x: 120, y: 280, anchor: 'start' as const, scenarios: ['renew'] },
]

// 가로형은 왼쪽에 DHCP 서버, 오른쪽에 PC를 두고 화살표를 가로로 잇는다. 알려 주는 값 넷은 그 아래 박스에 두 줄 두 칸으로 둔다.
const wideNodes = [
  { id: 'server', x: 16, y: 24, width: 104 },
  { id: 'pc', x: 320, y: 24, width: 104 },
  { id: 'ip', x: 24, y: 108, width: 192 },
  { id: 'mask', x: 224, y: 108, width: 192 },
  { id: 'gateway', x: 24, y: 148, width: 192 },
  { id: 'dns', x: 224, y: 148, width: 192 },
]

const wideGroups = [
  { id: 'settings', x: 16, y: 88, width: 408, height: 100, labelX: 24, labelY: 100 },
]

const widePaths: Record<string, string> = {
  'lease': 'M120 32 H320',
  'renew-request': 'M320 48 H120',
  'renew-reply': 'M120 32 H320',
}

// 곁말의 자리만 배치마다 다르다. 흐림을 따르는 노드와 보이는 시나리오는 세로형에서 id로 가져온다.
const wideOwnerNotes = [
  { id: 'server-address', x: 68, y: 72, anchor: 'middle' as const },
]

const wideNotes = [
  { id: 'lease-time', x: 220, y: 18, anchor: 'middle' as const },
  { id: 'renew-time', x: 220, y: 72, anchor: 'middle' as const },
  { id: 'renew-ack', x: 220, y: 18, anchor: 'middle' as const },
]

// 임대: 서버·PC와 알려 주는 값 넷이 선명하고 서버에서 PC로 화살표가 간다.
// 갱신: 서버와 PC만 선명하고 PC의 요청과 서버의 응답이 오간다.
export const dhcpLeaseScenarios: DiagramScenario[] = [
  { id: 'lease', nodes: ['server', 'pc', 'ip', 'mask', 'gateway', 'dns'], paths: ['lease'] },
  { id: 'renew', nodes: ['server', 'pc'], paths: ['renew-request', 'renew-reply'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DhcpLeaseDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-dhcp-lease-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutOwnerNotes = wide ? wideOwnerNotes.map((note) => ({ ...ownerNotes.find(({ id }) => id === note.id)!, ...note })) : ownerNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={dhcpLeaseScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 196' : '0 0 280 292'}>
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

          {layoutOwnerNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
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
