import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['icmp'].diagrams['icmp-message']

// 세로형은 IP 헤더를 한 줄 전체에 두고, 그 바로 아래 줄에 ICMP 메시지의 타입·코드·체크섬·나머지 칸을 빈틈없이 이어 붙인다.
// 칸의 너비는 비트 수가 아니라 라벨이 들어가는 폭으로 정했다. 노드는 모두 회색이다.
const nodes = [
  { id: 'ip-header', x: 8, y: 24, width: 264 },
  { id: 'type', x: 8, y: 56, width: 56 },
  { id: 'code', x: 64, y: 56, width: 56 },
  { id: 'checksum', x: 120, y: 56, width: 64 },
  { id: 'rest', x: 184, y: 56, width: 88 },
]

const groups = [
  { id: 'packet', x: 4, y: 4, width: 272, height: 104 },
]

// 칸의 크기 곁말은 그 칸 바로 아래 같은 가운데에 늘 보이고, 그 칸의 흐림을 따른다.
const sizeNotes = [
  { id: 'type-size', field: 'type', x: 36, y: 102 },
  { id: 'code-size', field: 'code', x: 92, y: 102 },
  { id: 'checksum-size', field: 'checksum', x: 152, y: 102 },
  { id: 'rest-size', field: 'rest', x: 228, y: 102 },
]

// 시나리오 곁말은 그룹 박스 밖 아래에 둔다. 타입 번호는 타입 칸 아래 가운데에, 코드는 코드 칸 왼쪽 끝 가까이에서 시작한다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'echo-type', x: 36, y: 128, anchor: 'middle', scenarios: ['echo-request'] },
  { id: 'echo-code', x: 66, y: 128, anchor: 'start', scenarios: ['echo-request'] },
  { id: 'unreachable-type', x: 36, y: 128, anchor: 'middle', scenarios: ['unreachable'] },
  { id: 'unreachable-code', x: 66, y: 128, anchor: 'start', scenarios: ['unreachable'] },
  { id: 'time-type', x: 36, y: 128, anchor: 'middle', scenarios: ['time-exceeded'] },
  { id: 'time-code', x: 66, y: 128, anchor: 'start', scenarios: ['time-exceeded'] },
]

// 가로형은 IP 헤더와 ICMP 메시지의 네 칸을 한 줄로 이어 붙인다.
const wideNodes = [
  { id: 'ip-header', x: 8, y: 24, width: 104 },
  { id: 'type', x: 112, y: 24, width: 72 },
  { id: 'code', x: 184, y: 24, width: 64 },
  { id: 'checksum', x: 248, y: 24, width: 80 },
  { id: 'rest', x: 328, y: 24, width: 104 },
]

const wideGroups = [
  { id: 'packet', x: 4, y: 4, width: 432, height: 72 },
]

const wideSizeNotes = [
  { id: 'type-size', field: 'type', x: 148, y: 70 },
  { id: 'code-size', field: 'code', x: 216, y: 70 },
  { id: 'checksum-size', field: 'checksum', x: 288, y: 70 },
  { id: 'rest-size', field: 'rest', x: 380, y: 70 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'echo-type', x: 148, y: 96, anchor: 'middle' },
  { id: 'echo-code', x: 186, y: 96, anchor: 'start' },
  { id: 'unreachable-type', x: 148, y: 96, anchor: 'middle' },
  { id: 'unreachable-code', x: 186, y: 96, anchor: 'start' },
  { id: 'time-type', x: 148, y: 96, anchor: 'middle' },
  { id: 'time-code', x: 186, y: 96, anchor: 'start' },
]

// 어느 메시지든 번호가 들어가는 칸은 타입과 코드다. 시나리오는 곁말의 번호로 갈린다. 칸 그림이라 화살표가 없다.
export const icmpMessageScenarios: DiagramScenario[] = [
  { id: 'echo-request', nodes: ['type', 'code'], paths: [] },
  { id: 'unreachable', nodes: ['type', 'code'], paths: [] },
  { id: 'time-exceeded', nodes: ['type', 'code'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IcmpMessageDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutSizeNotes = wide ? wideSizeNotes : sizeNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={icmpMessageScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 104' : '0 0 280 136'}>
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

          {layoutSizeNotes.map((note) => (
            <text key={note.id} data-size-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity={opacityOf(note.field)}>
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
