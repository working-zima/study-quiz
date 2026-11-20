import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-security'].diagrams['ipsec-modes']

// 세로형은 전송 모드 박스와 터널 모드 박스를 나란히 두고, 박스마다 패킷의 칸을 앞에서 뒤로 위에서 아래로 쌓는다.
// 두 모드 모두 IP 헤더 칸과 ESP 헤더 칸이 같은 높이에 오고, 그 아래의 「암호화되는 부분」 박스가 모드마다 무엇을 감싸는지 견준다.
// 칸은 모두 회색이고, 암호화되는지는 색이 아니라 박스로 가른다.
const nodes = [
  { id: 't-ip', x: 20, y: 28, width: 104 },
  { id: 't-esp', x: 20, y: 60, width: 104 },
  { id: 't-data', x: 20, y: 116, width: 104 },
  { id: 'n-ip', x: 156, y: 28, width: 104 },
  { id: 'n-esp', x: 156, y: 60, width: 104 },
  { id: 'u-ip', x: 156, y: 116, width: 104 },
  { id: 'u-data', x: 156, y: 148, width: 104 },
]

const groups = [
  { id: 'transport', x: 8, y: 8, width: 128, height: 188, labelX: 16, labelY: 21 },
  { id: 'tunnel', x: 144, y: 8, width: 128, height: 188, labelX: 152, labelY: 21 },
  { id: 't-enc', x: 16, y: 96, width: 112, height: 60, labelX: 20, labelY: 109 },
  { id: 'u-enc', x: 152, y: 96, width: 112, height: 92, labelX: 156, labelY: 109 },
]

type Note = { id: string, x: number, y: number }

// 곁말은 자기 시나리오를 골랐을 때만, 두 박스 아래의 한 자리에 보인다.
const noteScenarios: Record<string, string> = {
  'transport-note': 'transport',
  'tunnel-note': 'tunnel',
}

const notes: Note[] = [
  { id: 'transport-note', x: 16, y: 214 },
  { id: 'tunnel-note', x: 16, y: 214 },
]

// 가로형은 두 모드를 위아래 줄로 두고, 줄마다 패킷의 칸을 앞에서 뒤로 왼쪽에서 오른쪽으로 잇는다.
// 두 줄의 IP 헤더 칸과 ESP 헤더 칸이 같은 열에 서고, 「암호화되는 부분」 박스는 두 줄 모두 ESP 헤더 바로 뒤에서 시작한다.
const wideNodes = [
  { id: 't-ip', x: 24, y: 48, width: 104 },
  { id: 't-esp', x: 128, y: 48, width: 80 },
  { id: 't-data', x: 216, y: 48, width: 104 },
  { id: 'n-ip', x: 24, y: 144, width: 104 },
  { id: 'n-esp', x: 128, y: 144, width: 80 },
  { id: 'u-ip', x: 216, y: 144, width: 104 },
  { id: 'u-data', x: 320, y: 144, width: 104 },
]

const wideGroups = [
  { id: 'transport', x: 8, y: 8, width: 424, height: 88, labelX: 16, labelY: 21 },
  { id: 'tunnel', x: 8, y: 104, width: 424, height: 88, labelX: 16, labelY: 117 },
  { id: 't-enc', x: 212, y: 28, width: 112, height: 60, labelX: 216, labelY: 41 },
  { id: 'u-enc', x: 212, y: 124, width: 216, height: 60, labelX: 216, labelY: 137 },
]

const wideNotes: Note[] = [
  { id: 'transport-note', x: 16, y: 210 },
  { id: 'tunnel-note', x: 16, y: 210 },
]

// 전송 모드 — 원래 IP 헤더를 그대로 두고 데이터만 암호화한다. 터널 모드 — 원래 IP 헤더까지 암호화하고 새 IP 헤더를 붙인다.
export const ipsecModesScenarios: DiagramScenario[] = [
  {
    id: 'transport',
    nodes: ['t-ip', 't-esp', 't-data'],
    paths: [],
  },
  {
    id: 'tunnel',
    nodes: ['n-ip', 'n-esp', 'u-ip', 'u-data'],
    paths: [],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IpsecModesDiagram() {
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
      scenarios={ipsecModesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 220' : '0 0 280 224'}>
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
