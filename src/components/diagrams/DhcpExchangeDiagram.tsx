import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-address-types'].diagrams['dhcp-exchange']

// 위에서 아래로 두 번의 왕복을 배치한다. 같은 클라이언트와 DHCP 서버를 두 줄에 되풀이해 그린다.
// 위 줄은 Discover와 Offer, 아래 줄은 그다음 오가는 Request와 ACK다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client-1', x: 8, y: 40, width: 88 },
  { id: 'server-1', x: 184, y: 40, width: 88 },
  { id: 'client-2', x: 8, y: 144, width: 88 },
  { id: 'server-2', x: 184, y: 144, width: 88 },
]

const paths: Record<string, string> = {
  'discover': 'M96 48 H184',
  'offer': 'M184 64 H96',
  'request': 'M96 152 H184',
  'ack': 'M184 168 H96',
}

// 메시지의 이름과 보내는 방식·내용은 늘 보이고, 자기 줄 클라이언트의 흐림을 따른다.
// 클라이언트가 보내는 메시지의 곁말은 화살표 위에, 서버가 보내는 메시지의 곁말은 화살표 아래에 둔다.
const notes = [
  { id: 'discover', owner: 'client-1', x: 140, y: 16 },
  { id: 'discover-address', owner: 'client-1', x: 140, y: 30 },
  { id: 'offer', owner: 'client-1', x: 140, y: 92 },
  { id: 'request', owner: 'client-2', x: 140, y: 120 },
  { id: 'request-server', owner: 'client-2', x: 140, y: 134 },
  { id: 'ack', owner: 'client-2', x: 140, y: 196 },
]

// 가로형도 같은 짜임이다. 폭이 넓어진 만큼 노드를 넓히고 화살표를 늘린다.
const wideNodes = [
  { id: 'client-1', x: 16, y: 40, width: 104 },
  { id: 'server-1', x: 320, y: 40, width: 104 },
  { id: 'client-2', x: 16, y: 144, width: 104 },
  { id: 'server-2', x: 320, y: 144, width: 104 },
]

const widePaths: Record<string, string> = {
  'discover': 'M120 48 H320',
  'offer': 'M320 64 H120',
  'request': 'M120 152 H320',
  'ack': 'M320 168 H120',
}

// 곁말의 자리만 배치마다 다르다. 흐림을 따르는 노드는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'discover', x: 220, y: 16 },
  { id: 'discover-address', x: 220, y: 30 },
  { id: 'offer', x: 220, y: 92 },
  { id: 'request', x: 220, y: 120 },
  { id: 'request-server', x: 220, y: 134 },
  { id: 'ack', x: 220, y: 196 },
]

// 서버 찾기: 위 줄이 선명하고 Discover와 Offer가 오간다. 확정: 아래 줄이 선명하고 Request와 ACK가 오간다.
export const dhcpExchangeScenarios: DiagramScenario[] = [
  { id: 'find', nodes: ['client-1', 'server-1'], paths: ['discover', 'offer'] },
  { id: 'confirm', nodes: ['client-2', 'server-2'], paths: ['request', 'ack'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DhcpExchangeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-dhcp-exchange-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={dhcpExchangeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 204' : '0 0 280 204'}>
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
