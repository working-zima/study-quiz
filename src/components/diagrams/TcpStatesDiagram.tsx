import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-connection'].diagrams['tcp-states']

// 세로형은 연결의 단계 하나를 박스 하나로 두고 연결 전 → 맺는 중 → 연결됨 → 끊는 중 차례로 위에서 아래로 쌓는다. 박스 안 노드가 그 단계의 상태다.
// 끊는 중 박스는 두 열이다. 왼쪽 열은 먼저 끊는 쪽이, 오른쪽 열은 나중에 끊는 쪽이 거치는 상태이고, 열 머리 곁말이 그것을 알린다.
// 상태 사이의 화살표는 그리지 않는다. 노드는 모두 회색이다. 노드의 차례는 본문 목록의 차례다.
const nodes = [
  { id: 'closed', x: 16, y: 28, width: 120 },
  { id: 'listen', x: 144, y: 28, width: 120 },
  { id: 'syn-sent', x: 16, y: 96, width: 120 },
  { id: 'syn-received', x: 144, y: 96, width: 120 },
  { id: 'established', x: 16, y: 164, width: 120 },
  { id: 'fin-wait-1', x: 16, y: 248, width: 120 },
  { id: 'fin-wait-2', x: 16, y: 288, width: 120 },
  { id: 'close-wait', x: 144, y: 248, width: 120 },
  { id: 'closing', x: 16, y: 328, width: 120 },
  { id: 'last-ack', x: 144, y: 288, width: 120 },
  { id: 'time-wait', x: 16, y: 368, width: 120 },
]

const groups = [
  { id: 'before', x: 8, y: 8, width: 264, height: 60, labelX: 16, labelY: 20 },
  { id: 'opening', x: 8, y: 76, width: 264, height: 60, labelX: 16, labelY: 88 },
  { id: 'established', x: 8, y: 144, width: 264, height: 60, labelX: 16, labelY: 156 },
  { id: 'closing', x: 8, y: 212, width: 264, height: 196, labelX: 16, labelY: 224 },
]

// 곁말은 자기 줄 첫 노드 바로 위에 서고, 그 노드의 흐림을 따른다.
const notes = [
  { id: 'active-note', owner: 'fin-wait-1', x: 16, y: 240 },
  { id: 'passive-note', owner: 'close-wait', x: 144, y: 240 },
]

// 가로형은 연결 전·맺는 중·연결됨을 위에 나란히 두고, 끊는 중을 아래 넓은 박스 하나로 둔다.
// 끊는 중 박스 안에서는 먼저 끊는 쪽의 상태를 윗줄에, 나중에 끊는 쪽의 상태를 아랫줄에 왼쪽부터 놓는다.
const wideNodes = [
  { id: 'closed', x: 16, y: 28, width: 120 },
  { id: 'listen', x: 16, y: 68, width: 120 },
  { id: 'syn-sent', x: 160, y: 28, width: 120 },
  { id: 'syn-received', x: 160, y: 68, width: 120 },
  { id: 'established', x: 304, y: 28, width: 120 },
  { id: 'fin-wait-1', x: 16, y: 152, width: 96 },
  { id: 'fin-wait-2', x: 120, y: 152, width: 96 },
  { id: 'close-wait', x: 16, y: 208, width: 96 },
  { id: 'closing', x: 224, y: 152, width: 96 },
  { id: 'last-ack', x: 120, y: 208, width: 96 },
  { id: 'time-wait', x: 328, y: 152, width: 96 },
]

const wideGroups = [
  { id: 'before', x: 8, y: 8, width: 136, height: 100, labelX: 16, labelY: 20 },
  { id: 'opening', x: 152, y: 8, width: 136, height: 100, labelX: 160, labelY: 20 },
  { id: 'established', x: 296, y: 8, width: 136, height: 100, labelX: 304, labelY: 20 },
  { id: 'closing', x: 8, y: 116, width: 424, height: 132, labelX: 16, labelY: 128 },
]

const wideNotes = [
  { id: 'active-note', x: 16, y: 144 },
  { id: 'passive-note', x: 16, y: 200 },
]

// 단계를 고르면 그 단계 박스의 상태만 선명하다.
export const tcpStatesScenarios: DiagramScenario[] = [
  { id: 'before', nodes: ['closed', 'listen'], paths: [] },
  { id: 'opening', nodes: ['syn-sent', 'syn-received'], paths: [] },
  { id: 'established', nodes: ['established'], paths: [] },
  { id: 'closing', nodes: ['fin-wait-1', 'fin-wait-2', 'close-wait', 'closing', 'last-ack', 'time-wait'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TcpStatesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={tcpStatesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 256' : '0 0 280 416'}>
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

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
