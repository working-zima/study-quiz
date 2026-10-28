import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['protocols-encapsulation'].diagrams['pdu-names']

// 왼쪽 박스에 TCP/IP 모델의 네 계층을 맨 위 응용 계층부터 쌓고, 오른쪽 박스에서 같은 줄에 그 계층의 단위 이름을 둔다.
const groups = [
  { id: 'layers', x: 4, y: 8, width: 124, height: 220 },
  { id: 'units', x: 136, y: 8, width: 140, height: 220 },
]

// 전송 계층 줄에만 단위가 둘이다. TCP가 만든 세그먼트와 UDP가 만든 데이터그램을 나란히 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'app', x: 8, y: 32, width: 116 },
  { id: 'transport', x: 8, y: 84, width: 116 },
  { id: 'internet', x: 8, y: 136, width: 116 },
  { id: 'network-access', x: 8, y: 188, width: 116 },
  { id: 'message', x: 144, y: 32, width: 60 },
  { id: 'segment', x: 144, y: 84, width: 60 },
  { id: 'datagram', x: 208, y: 84, width: 64 },
  { id: 'packet', x: 144, y: 136, width: 60 },
  { id: 'frame', x: 144, y: 188, width: 60 },
]

// 곁말은 시나리오와 상관없이 늘 보이고, 자기 칸 바로 아래 왼쪽 끝에서 그 칸의 opacity를 따른다.
const notes = [
  { id: 'by-tcp', x: 144, y: 127, cell: 'segment' },
  { id: 'by-udp', x: 208, y: 127, cell: 'datagram' },
  { id: 'packet-standard', x: 144, y: 179, cell: 'packet' },
]

// 가로형은 두 박스를 넓히고, 패킷의 다른 이름은 패킷 칸 바로 오른쪽에 둔다.
const wideGroups = [
  { id: 'layers', x: 8, y: 8, width: 176, height: 220 },
  { id: 'units', x: 200, y: 8, width: 232, height: 220 },
]

const wideNodes = [
  { id: 'app', x: 20, y: 32, width: 152 },
  { id: 'transport', x: 20, y: 84, width: 152 },
  { id: 'internet', x: 20, y: 136, width: 152 },
  { id: 'network-access', x: 20, y: 188, width: 152 },
  { id: 'message', x: 212, y: 32, width: 80 },
  { id: 'segment', x: 212, y: 84, width: 80 },
  { id: 'datagram', x: 304, y: 84, width: 80 },
  { id: 'packet', x: 212, y: 136, width: 80 },
  { id: 'frame', x: 212, y: 188, width: 80 },
]

const wideNotes = [
  { id: 'by-tcp', x: 212, y: 127 },
  { id: 'by-udp', x: 304, y: 127 },
  { id: 'packet-standard', x: 300, y: 155 },
]

// 계층 넷과 데이터·패킷·프레임은 두 시나리오에서 같고, 전송 계층의 단위만 갈린다. 이 도식에는 화살표가 없다.
const shared = ['app', 'transport', 'internet', 'network-access', 'message']

export const pduNamesScenarios: DiagramScenario[] = [
  { id: 'tcp', nodes: [...shared, 'segment', 'packet', 'frame'], paths: [] },
  { id: 'udp', nodes: [...shared, 'datagram', 'packet', 'frame'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PduNamesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={pduNamesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 236' : '0 0 280 236'}>
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

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="start" className="fill-muted" fontSize="9" opacity={opacityOf(note.cell)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
