import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-udp'].diagrams['udp-header-fields']

// 세로형은 UDP 헤더를 TCP 헤더처럼 32비트 한 줄씩 쌓는다. 칸 넷이 모두 16비트라 두 줄이다. 칸 이름 뒤 숫자가 비트 수다.
// 그 아래 따로 떨어진 상자에 TCP 헤더에만 있는 칸 넷을 모은다. 헤더의 줄이 아니므로 칸 사이를 띄웠다. 노드는 모두 회색이고 경로는 없다.
const nodes = [
  { id: 'src-port', x: 8, y: 24, width: 132 },
  { id: 'dst-port', x: 140, y: 24, width: 132 },
  { id: 'length', x: 8, y: 56, width: 132 },
  { id: 'checksum', x: 140, y: 56, width: 132 },
  { id: 'tcp-seq', x: 12, y: 128, width: 124 },
  { id: 'tcp-ack', x: 144, y: 128, width: 124 },
  { id: 'tcp-control', x: 12, y: 168, width: 124 },
  { id: 'tcp-window', x: 144, y: 168, width: 124 },
]

const groups = [
  { id: 'header', x: 4, y: 4, width: 272, height: 92, labelX: 14, labelY: 18 },
  { id: 'tcp-only', x: 4, y: 108, width: 272, height: 100, labelX: 14, labelY: 122 },
]

// 크기 곁말은 UDP 헤더 상자의 라벨 줄 오른쪽 끝에 늘 보인다.
const notes = [
  { id: 'size', x: 268, y: 18 },
]

// 가로형은 넓어진 폭으로 TCP 헤더에만 있는 칸 넷을 한 줄에 둔다.
const wideNodes = [
  { id: 'src-port', x: 8, y: 24, width: 212 },
  { id: 'dst-port', x: 220, y: 24, width: 212 },
  { id: 'length', x: 8, y: 56, width: 212 },
  { id: 'checksum', x: 220, y: 56, width: 212 },
  { id: 'tcp-seq', x: 12, y: 128, width: 98 },
  { id: 'tcp-ack', x: 118, y: 128, width: 98 },
  { id: 'tcp-control', x: 224, y: 128, width: 98 },
  { id: 'tcp-window', x: 330, y: 128, width: 98 },
]

const wideGroups = [
  { id: 'header', x: 4, y: 4, width: 432, height: 92, labelX: 14, labelY: 18 },
  { id: 'tcp-only', x: 4, y: 108, width: 432, height: 60, labelX: 14, labelY: 122 },
]

const wideNotes = [
  { id: 'size', x: 428, y: 18 },
]

// 포트 둘, 길이와 체크섬, UDP 헤더에 없는 칸 넷으로 나눠 본다. 칸 그림이라 화살표가 없다.
export const udpHeaderScenarios: DiagramScenario[] = [
  { id: 'ports', nodes: ['src-port', 'dst-port'], paths: [] },
  { id: 'length-checksum', nodes: ['length', 'checksum'], paths: [] },
  { id: 'missing', nodes: ['tcp-seq', 'tcp-ack', 'tcp-control', 'tcp-window'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function UdpHeaderDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={udpHeaderScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 216'}>
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

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="end" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
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
        </svg>
      </div>
    </DiagramFrame>
  )
}
