import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-security'].diagrams['vpn-site-types']

// 세로형은 맨 위의 본사 박스에 VPNGW1, 가운데 줄 왼쪽에 출장 중인 노트북·오른쪽에 인터넷, 맨 아래의 지사 박스에 VPNGW2를 둔다.
// 화살표는 VPN 연결이 지나는 길을 한 방향으로 그린 것이고, 두 시나리오 모두 인터넷을 지난다. 노드는 모두 회색이다.
const nodes = [
  { id: 'vpngw1', x: 136, y: 28, width: 128 },
  { id: 'laptop', x: 16, y: 112, width: 112 },
  { id: 'internet', x: 168, y: 112, width: 72 },
  { id: 'vpngw2', x: 136, y: 196, width: 128 },
]

const groups = [
  { id: 'hq', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 21 },
  { id: 'branch', x: 8, y: 176, width: 264, height: 64, labelX: 16, labelY: 189 },
]

const paths: Record<string, string> = {
  'gw1-internet': 'M184 60 V112',
  'internet-gw2': 'M184 144 V196',
  'laptop-internet': 'M128 128 H168',
  'internet-gw1': 'M224 112 V60',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 시나리오마다 하나라 맨 아래 가운데 한 자리를 함께 쓴다.
const noteScenarios: Record<string, string> = {
  'site-note': 'site',
  'remote-note': 'remote',
}

const notes: Note[] = [
  { id: 'site-note', x: 140, y: 258, anchor: 'middle' },
  { id: 'remote-note', x: 140, y: 258, anchor: 'middle' },
]

// 가로형은 왼쪽의 본사 박스(VPNGW1), 가운데의 인터넷, 오른쪽의 지사 박스(VPNGW2)를 한 줄에 두고, 출장 중인 노트북을 인터넷 아래에 둔다.
// 곁말은 노트북 아래에 둔다.
const wideNodes = [
  { id: 'vpngw1', x: 16, y: 32, width: 128 },
  { id: 'laptop', x: 164, y: 112, width: 112 },
  { id: 'internet', x: 184, y: 32, width: 72 },
  { id: 'vpngw2', x: 296, y: 32, width: 128 },
]

const wideGroups = [
  { id: 'hq', x: 8, y: 8, width: 144, height: 64, labelX: 16, labelY: 21 },
  { id: 'branch', x: 288, y: 8, width: 144, height: 64, labelX: 296, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'gw1-internet': 'M144 48 H184',
  'internet-gw2': 'M256 48 H296',
  'laptop-internet': 'M220 112 V64',
  'internet-gw1': 'M184 56 H144',
}

const wideNotes: Note[] = [
  { id: 'site-note', x: 220, y: 164, anchor: 'middle' },
  { id: 'remote-note', x: 220, y: 164, anchor: 'middle' },
]

// 사이트 간: VPNGW1에서 인터넷을 거쳐 VPNGW2로 가는 길이 보이고, 노트북은 흐려진다.
// 원격 접속: 노트북에서 인터넷을 거쳐 VPNGW1로 가는 길이 보이고, VPNGW2는 흐려진다.
export const vpnSiteTypesScenarios: DiagramScenario[] = [
  {
    id: 'site',
    nodes: ['vpngw1', 'internet', 'vpngw2'],
    paths: ['gw1-internet', 'internet-gw2'],
  },
  {
    id: 'remote',
    nodes: ['laptop', 'internet', 'vpngw1'],
    paths: ['laptop-internet', 'internet-gw1'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VpnSiteTypesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-vpn-site-types-arrow`
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
      scenarios={vpnSiteTypesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 264'}>
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
