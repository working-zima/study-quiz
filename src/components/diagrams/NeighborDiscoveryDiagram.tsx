import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['arp'].diagrams['neighbor-discovery']

// 바깥 상자가 호스트 A~D가 이어진 같은 링크다. 호스트 A를 왼쪽에 두고, 오른쪽에 B·C·D를 위아래로 둔다.
// 안쪽 상자는 B의 주소 2001:db8::2에 맞춘 요청 노드 멀티캐스트 주소의 그룹이고 B만 그 안에 든다.
// 그룹 상자와 라벨은 늘 보이고 흐려지지 않는다. 노드는 모두 회색이다.
const groups = [
  { id: 'link', x: 8, y: 8, width: 264, height: 238 },
  { id: 'multicast', x: 120, y: 32, width: 148, height: 84 },
]

const nodes = [
  { id: 'host-a', x: 20, y: 60, width: 72 },
  { id: 'host-b', x: 158, y: 60, width: 72 },
  { id: 'host-c', x: 158, y: 132, width: 72 },
  { id: 'host-d', x: 158, y: 192, width: 72 },
]

// 이웃 요청은 A에서 그룹 안의 B로, 이웃 광고는 B에서 A로 같은 줄을 거꾸로 간다.
const paths: Record<string, string> = {
  'solicit': 'M92 76 H158',
  'advertise': 'M158 76 H92',
}

// IPv6 주소 곁말은 늘 보이고 자기 호스트 바로 아래 가운데에 놓여 그 호스트의 흐림을 따른다.
const hostNotes = [
  { id: 'ipv6-a', host: 'host-a', x: 56, y: 104 },
  { id: 'ipv6-b', host: 'host-b', x: 194, y: 108 },
  { id: 'ipv6-c', host: 'host-c', x: 194, y: 178 },
  { id: 'ipv6-d', host: 'host-d', x: 194, y: 238 },
]

// 시나리오 곁말 — 메시지 이름, 담은 것, 보내는 방식을 A 아래 빈자리에 세 줄로 둔다.
const notes = [
  { id: 'solicit-name', x: 82, y: 144, scenarios: ['solicit'] },
  { id: 'solicit-target', x: 82, y: 160, scenarios: ['solicit'] },
  { id: 'solicit-cast', x: 82, y: 176, scenarios: ['solicit'] },
  { id: 'advertise-name', x: 82, y: 144, scenarios: ['advertise'] },
  { id: 'advertise-mac', x: 82, y: 160, scenarios: ['advertise'] },
  { id: 'advertise-cast', x: 82, y: 176, scenarios: ['advertise'] },
]

// 가로형은 A·그룹 안의 B·그룹 밖의 C와 D를 왼쪽에서 오른쪽으로 둔다. C와 D는 오른쪽 끝에 위아래로 둔다.
const wideGroups = [
  { id: 'link', x: 8, y: 8, width: 424, height: 164 },
  { id: 'multicast', x: 168, y: 28, width: 152, height: 84 },
]

const wideNodes = [
  { id: 'host-a', x: 32, y: 56, width: 80 },
  { id: 'host-b', x: 204, y: 56, width: 80 },
  { id: 'host-c', x: 344, y: 32, width: 80 },
  { id: 'host-d', x: 344, y: 96, width: 80 },
]

const widePaths: Record<string, string> = {
  'solicit': 'M112 72 H204',
  'advertise': 'M204 72 H112',
}

// 곁말의 자리만 배치마다 다르다. 붙는 호스트와 보이는 시나리오는 세로형에서 id로 가져온다.
const wideHostNotes = [
  { id: 'ipv6-a', x: 72, y: 104 },
  { id: 'ipv6-b', x: 244, y: 104 },
  { id: 'ipv6-c', x: 384, y: 76 },
  { id: 'ipv6-d', x: 384, y: 140 },
]

const wideNotes = [
  { id: 'solicit-name', x: 140, y: 132 },
  { id: 'solicit-target', x: 140, y: 146 },
  { id: 'solicit-cast', x: 140, y: 160 },
  { id: 'advertise-name', x: 140, y: 132 },
  { id: 'advertise-mac', x: 140, y: 146 },
  { id: 'advertise-cast', x: 140, y: 160 },
]

// 두 시나리오 모두 메시지를 주고받는 A와 B만 선명하다. 그룹에 들지 않은 C·D는 요청을 받지 않으므로 흐리게 둔다.
export const neighborDiscoveryScenarios: DiagramScenario[] = [
  { id: 'solicit', nodes: ['host-a', 'host-b'], paths: ['solicit'] },
  { id: 'advertise', nodes: ['host-a', 'host-b'], paths: ['advertise'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NeighborDiscoveryDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-neighbor-discovery-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutHostNotes = wide ? wideHostNotes.map((note) => ({ ...hostNotes.find(({ id }) => id === note.id)!, ...note })) : hostNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={neighborDiscoveryScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 256'}>
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

          {layoutHostNotes.map((note) => (
            <text key={note.id} data-host-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity={opacityOf(note.host)}>
              {text.notes![note.id]}
            </text>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
