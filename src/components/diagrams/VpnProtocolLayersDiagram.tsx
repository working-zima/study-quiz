import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-security'].diagrams['vpn-protocol-layers']

// 세로형은 왼쪽 열에 계층 칸 셋을 위에서부터 전송 → 네트워크 → 데이터 링크로 쌓고, 오른쪽 열에 VPN 프로토콜을 그 계층 칸과 같은 줄에 둔다.
// 데이터 링크 줄에는 PPTP와 L2TP가 나란히 서서, L2TP의 화살표는 PPTP 아래로 돌아 데이터 링크 칸의 아래 변으로 들어간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'tl', x: 16, y: 24, width: 112 },
  { id: 'nl', x: 16, y: 72, width: 112 },
  { id: 'dl', x: 16, y: 120, width: 112 },
  { id: 'ssl', x: 152, y: 24, width: 112 },
  { id: 'ipsec', x: 152, y: 72, width: 112 },
  { id: 'pptp', x: 152, y: 120, width: 52 },
  { id: 'l2tp', x: 212, y: 120, width: 52 },
]

const paths: Record<string, string> = {
  'ssl-tl': 'M152 40 H128',
  'ipsec-nl': 'M152 88 H128',
  'pptp-dl': 'M152 136 H128',
  'l2tp-dl': 'M238 152 V164 H72 V152',
}

type Note = { id: string, x: number, y: number }

// 곁말은 자기 시나리오를 골랐을 때만, 그림 아래의 한 자리에 보인다.
const noteScenarios: Record<string, string> = {
  'layer2-note': 'layer2',
  'l2tp-note': 'layer2',
  'layer3-note': 'layer3',
  'tls-note': 'tls',
}

const notes: Note[] = [
  { id: 'layer2-note', x: 16, y: 188 },
  { id: 'l2tp-note', x: 16, y: 202 },
  { id: 'layer3-note', x: 16, y: 188 },
  { id: 'tls-note', x: 16, y: 188 },
]

// 가로형은 칸과 프로토콜을 넓힐 뿐 줄과 차례는 세로형과 같다.
const wideNodes = [
  { id: 'tl', x: 16, y: 24, width: 144 },
  { id: 'nl', x: 16, y: 72, width: 144 },
  { id: 'dl', x: 16, y: 120, width: 144 },
  { id: 'ssl', x: 200, y: 24, width: 128 },
  { id: 'ipsec', x: 200, y: 72, width: 128 },
  { id: 'pptp', x: 200, y: 120, width: 96 },
  { id: 'l2tp', x: 320, y: 120, width: 96 },
]

const widePaths: Record<string, string> = {
  'ssl-tl': 'M200 40 H160',
  'ipsec-nl': 'M200 88 H160',
  'pptp-dl': 'M200 136 H160',
  'l2tp-dl': 'M368 152 V164 H88 V152',
}

const wideNotes: Note[] = [
  { id: 'layer2-note', x: 16, y: 188 },
  { id: 'l2tp-note', x: 16, y: 202 },
  { id: 'layer3-note', x: 16, y: 188 },
  { id: 'tls-note', x: 16, y: 188 },
]

// PPTP·L2TP — 데이터 링크 계층의 터널. IPsec — 네트워크 계층. SSL/TLS VPN — NIST가 묶는 전송 계층.
export const vpnProtocolLayersScenarios: DiagramScenario[] = [
  {
    id: 'layer2',
    nodes: ['dl', 'pptp', 'l2tp'],
    paths: ['pptp-dl', 'l2tp-dl'],
  },
  {
    id: 'layer3',
    nodes: ['nl', 'ipsec'],
    paths: ['ipsec-nl'],
  },
  {
    id: 'tls',
    nodes: ['tl', 'ssl'],
    paths: ['ssl-tl'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VpnProtocolLayersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-vpn-protocol-layers-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={vpnProtocolLayersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 212' : '0 0 280 212'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="start" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
