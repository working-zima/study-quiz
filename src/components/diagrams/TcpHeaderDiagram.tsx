import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-udp'].diagrams['tcp-header-fields']

// 세로형은 TCP 헤더를 표준 문서처럼 32비트 한 줄씩 위에서 아래로 쌓는다. 칸 이름 뒤 숫자가 비트 수다.
// 넷째 줄의 칸 넷(데이터 오프셋·예약·제어 비트·윈도우)은 280 폭 한 줄에 들지 않아, 상자 하나로 묶고 그 안에서 두 줄로 나눴다.
// 칸의 너비는 라벨이 들어가는 폭으로 정했다. 노드는 모두 회색이고 경로는 없다.
const nodes = [
  { id: 'src-port', x: 8, y: 24, width: 132 },
  { id: 'dst-port', x: 140, y: 24, width: 132 },
  { id: 'seq', x: 8, y: 56, width: 264 },
  { id: 'ack', x: 8, y: 88, width: 264 },
  { id: 'offset', x: 12, y: 140, width: 136 },
  { id: 'reserved', x: 148, y: 140, width: 120 },
  { id: 'control', x: 12, y: 172, width: 128 },
  { id: 'window', x: 140, y: 172, width: 128 },
  { id: 'checksum', x: 8, y: 208, width: 132 },
  { id: 'urgent', x: 140, y: 208, width: 132 },
  { id: 'options', x: 8, y: 240, width: 264 },
]

const groups = [
  { id: 'header', x: 4, y: 4, width: 272, height: 272, labelX: 14, labelY: 18 },
  { id: 'row4', x: 8, y: 120, width: 264, height: 88, labelX: 16, labelY: 134 },
]

// 크기 곁말은 헤더 상자의 라벨 줄 오른쪽 끝에, 옵션 곁말은 헤더 상자 아래에 늘 보인다.
const notes = [
  { id: 'size', x: 268, y: 18, anchor: 'end' as const },
  { id: 'options', x: 8, y: 292, anchor: 'start' as const },
]

// 가로형은 넓어진 폭으로 넷째 줄의 칸 넷을 한 줄에 둔다. 넷째 줄 상자와 그 라벨은 세로형과 같이 남긴다.
const wideNodes = [
  { id: 'src-port', x: 8, y: 24, width: 212 },
  { id: 'dst-port', x: 220, y: 24, width: 212 },
  { id: 'seq', x: 8, y: 56, width: 424 },
  { id: 'ack', x: 8, y: 88, width: 424 },
  { id: 'offset', x: 12, y: 140, width: 128 },
  { id: 'reserved', x: 140, y: 140, width: 76 },
  { id: 'control', x: 216, y: 140, width: 104 },
  { id: 'window', x: 320, y: 140, width: 108 },
  { id: 'checksum', x: 8, y: 176, width: 212 },
  { id: 'urgent', x: 220, y: 176, width: 212 },
  { id: 'options', x: 8, y: 208, width: 424 },
]

const wideGroups = [
  { id: 'header', x: 4, y: 4, width: 432, height: 240, labelX: 14, labelY: 18 },
  { id: 'row4', x: 8, y: 120, width: 424, height: 56, labelX: 16, labelY: 134 },
]

const wideNotes = [
  { id: 'size', x: 428, y: 18, anchor: 'end' as const },
  { id: 'options', x: 8, y: 260, anchor: 'start' as const },
]

// 하는 일이 비슷한 칸끼리 묶는다. 예약·긴급 포인터·옵션은 어느 묶음에도 들지 않는다. 칸 그림이라 화살표가 없다.
export const tcpHeaderScenarios: DiagramScenario[] = [
  { id: 'ports', nodes: ['src-port', 'dst-port'], paths: [] },
  { id: 'numbers', nodes: ['seq', 'ack'], paths: [] },
  { id: 'control', nodes: ['offset', 'control', 'window'], paths: [] },
  { id: 'error-check', nodes: ['checksum'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TcpHeaderDiagram() {
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
      scenarios={tcpHeaderScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 268' : '0 0 280 300'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
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
