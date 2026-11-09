import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-udp'].diagrams['mss-size']

// 세로형은 IP 패킷 하나를 앞 칸부터 위에서 아래로 쌓는다 — IPv4 헤더, TCP 헤더, 데이터. 칸의 높이는 크기에 비례하지 않고 숫자가 크기를 말한다.
// 바깥 박스가 MTU가 재는 패킷 전체이고, 데이터 칸만 안쪽 박스로 한 번 더 묶어 MSS가 재는 범위를 보인다. 노드는 모두 회색이고 경로는 없다.
const nodes = [
  { id: 'ip-header', x: 16, y: 28, width: 248 },
  { id: 'tcp-header', x: 16, y: 60, width: 248 },
  { id: 'data', x: 16, y: 112, width: 248 },
]

const groups = [
  { id: 'mtu', x: 8, y: 8, width: 264, height: 148, labelX: 16, labelY: 20 },
  { id: 'mss', x: 12, y: 96, width: 256, height: 52, labelX: 20, labelY: 108 },
]

// 계산 곁말은 자기 시나리오에서만 보이고 MTU 박스 아래에 놓인다.
const notes = [
  { id: 'mtu-sum', x: 16, y: 176, scenarios: ['mtu'] },
  { id: 'mss-calc', x: 16, y: 176, scenarios: ['mss'] },
]

// 가로형은 앞 칸부터 왼쪽에서 오른쪽으로 한 줄에 둔다. 두 헤더 칸은 맞붙이고, 데이터 칸은 MSS 박스 안에 둔다.
const wideNodes = [
  { id: 'ip-header', x: 16, y: 48, width: 124 },
  { id: 'tcp-header', x: 140, y: 48, width: 120 },
  { id: 'data', x: 268, y: 48, width: 152 },
]

const wideGroups = [
  { id: 'mtu', x: 8, y: 8, width: 424, height: 88, labelX: 16, labelY: 20 },
  { id: 'mss', x: 264, y: 28, width: 160, height: 60, labelX: 272, labelY: 40 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'mtu-sum', x: 16, y: 116 },
  { id: 'mss-calc', x: 16, y: 116 },
]

// MTU: 패킷의 세 칸이 모두 선명하다. MSS: 데이터 칸만 선명하다.
export const mssSizeScenarios: DiagramScenario[] = [
  { id: 'mtu', nodes: ['ip-header', 'tcp-header', 'data'], paths: [] },
  { id: 'mss', nodes: ['data'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MssSizeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={mssSizeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 124' : '0 0 280 184'}>
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

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="start" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
