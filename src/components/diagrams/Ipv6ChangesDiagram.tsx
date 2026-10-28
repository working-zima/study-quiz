import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-protocol'].diagrams['ipv6-changes']

// 세로형은 왼쪽 그룹 박스에 IPv4를, 오른쪽 그룹 박스에 IPv6를 두고, 같은 점을 견주는 두 노드를 같은 줄에 짝짓는다.
// 줄은 위에서부터 주소 크기·브로드캐스트·헤더·단편화다. 브로드캐스트 줄 아래에는 IPv6 쪽에 곁말을 둔다. 노드는 모두 회색이다.
const groups = [
  { id: 'v4', x: 4, y: 4, width: 134, height: 200 },
  { id: 'v6', x: 142, y: 4, width: 134, height: 200 },
]

const nodes = [
  { id: 'v4-address', x: 12, y: 28, width: 120 },
  { id: 'v6-address', x: 150, y: 28, width: 120 },
  { id: 'v4-broadcast', x: 12, y: 68, width: 120 },
  { id: 'v6-broadcast', x: 150, y: 68, width: 120 },
  { id: 'v4-header', x: 12, y: 124, width: 120 },
  { id: 'v6-header', x: 150, y: 124, width: 120 },
  { id: 'v4-fragment', x: 12, y: 164, width: 120 },
  { id: 'v6-fragment', x: 150, y: 164, width: 120 },
]

// 화살표는 같은 줄의 IPv4 노드 오른쪽 변에서 IPv6 노드 왼쪽 변으로 간다. 고른 줄의 것만 보인다.
const paths: Record<string, string> = {
  'change-address': 'M132 44 H150',
  'change-broadcast': 'M132 84 H150',
  'change-header': 'M132 140 H150',
  'change-fragment': 'M132 180 H150',
}

// 곁말은 IPv6의 브로드캐스트 노드 바로 아래에 늘 보이고, 그 노드의 흐림을 따른다.
const notes = [
  { id: 'multicast', owner: 'v6-broadcast', x: 210, y: 114 },
]

// 가로형은 같은 짜임에서 두 열을 넓힌다.
const wideGroups = [
  { id: 'v4', x: 4, y: 4, width: 212, height: 200 },
  { id: 'v6', x: 224, y: 4, width: 212, height: 200 },
]

const wideNodes = [
  { id: 'v4-address', x: 16, y: 28, width: 176 },
  { id: 'v6-address', x: 248, y: 28, width: 176 },
  { id: 'v4-broadcast', x: 16, y: 68, width: 176 },
  { id: 'v6-broadcast', x: 248, y: 68, width: 176 },
  { id: 'v4-header', x: 16, y: 124, width: 176 },
  { id: 'v6-header', x: 248, y: 124, width: 176 },
  { id: 'v4-fragment', x: 16, y: 164, width: 176 },
  { id: 'v6-fragment', x: 248, y: 164, width: 176 },
]

const widePaths: Record<string, string> = {
  'change-address': 'M192 44 H248',
  'change-broadcast': 'M192 84 H248',
  'change-header': 'M192 140 H248',
  'change-fragment': 'M192 180 H248',
}

const wideNotes = [
  { id: 'multicast', x: 336, y: 114 },
]

// 줄 하나를 고르면 그 줄의 IPv4·IPv6 짝만 선명하고 둘 사이의 화살표가 보인다.
export const ipv6ChangesScenarios: DiagramScenario[] = [
  { id: 'address', nodes: ['v4-address', 'v6-address'], paths: ['change-address'] },
  { id: 'broadcast', nodes: ['v4-broadcast', 'v6-broadcast'], paths: ['change-broadcast'] },
  { id: 'header', nodes: ['v4-header', 'v6-header'], paths: ['change-header'] },
  { id: 'fragment', nodes: ['v4-fragment', 'v6-fragment'], paths: ['change-fragment'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function Ipv6ChangesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ipv6-changes-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={ipv6ChangesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 208' : '0 0 280 208'}>
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
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
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

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
