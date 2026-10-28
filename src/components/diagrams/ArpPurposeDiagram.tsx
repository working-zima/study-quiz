import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['arp'].diagrams['arp-purpose']

// 세로형은 호스트 A와 호스트 B를 맨 위 양쪽에 두고, 그 아래 프레임 상자 안에 A가 보낼 프레임의 칸 셋을 앞쪽부터 위에서 아래로 맞붙여 쌓는다.
// 칸에 적히는 값은 칸 오른쪽에 둔다. 상자와 그 라벨은 늘 보이고 흐려지지 않는다. 노드는 모두 회색이다.
const groups = [
  { id: 'frame', x: 8, y: 56, width: 264, height: 128 },
]

const nodes = [
  { id: 'host-a', x: 8, y: 8, width: 72 },
  { id: 'host-b', x: 200, y: 8, width: 72 },
  { id: 'dst-mac', x: 20, y: 80, width: 100 },
  { id: 'src-mac', x: 20, y: 112, width: 100 },
  { id: 'packet', x: 20, y: 144, width: 100 },
]

// 화살표는 프레임이 호스트 A에서 호스트 B로 가는 길이다.
const paths: Record<string, string> = {
  'send': 'M80 24 H200',
}

// 칸 값 곁말은 늘 보이고 자기 칸 곁에 놓여 그 칸의 흐림을 따른다. 목적지 MAC 주소 칸의 값은 시나리오마다 달라 아래 notes에 둔다.
const cellNotes = [
  { id: 'src-value', cell: 'src-mac', x: 132, y: 132, anchor: 'start' as const },
  { id: 'packet-value', cell: 'packet', x: 132, y: 164, anchor: 'start' as const },
]

// 시나리오 곁말 — 목적지 MAC 주소 칸의 값은 그 칸 곁에, 보낼 수 없다는 말은 두 호스트 사이에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'dst-unknown', x: 132, y: 100, anchor: 'start', scenarios: ['unknown'] },
  { id: 'dst-known', x: 132, y: 100, anchor: 'start', scenarios: ['resolved'] },
  { id: 'blocked', x: 140, y: 28, anchor: 'middle', scenarios: ['unknown'] },
]

// 가로형은 칸 셋을 왼쪽에서 오른쪽으로 맞붙여 한 띠로 두고, 칸에 적히는 값은 칸 아래 가운데에 둔다.
const wideGroups = [
  { id: 'frame', x: 16, y: 56, width: 408, height: 88 },
]

const wideNodes = [
  { id: 'host-a', x: 16, y: 8, width: 72 },
  { id: 'host-b', x: 352, y: 8, width: 72 },
  { id: 'dst-mac', x: 28, y: 80, width: 128 },
  { id: 'src-mac', x: 156, y: 80, width: 128 },
  { id: 'packet', x: 284, y: 80, width: 128 },
]

const widePaths: Record<string, string> = {
  'send': 'M88 24 H352',
}

// 곁말의 자리만 배치마다 다르다. 값이 붙는 칸과 보이는 시나리오는 세로형에서 id로 가져온다.
const wideCellNotes = [
  { id: 'src-value', x: 220, y: 128, anchor: 'middle' as const },
  { id: 'packet-value', x: 348, y: 128, anchor: 'middle' as const },
]

const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'dst-unknown', x: 92, y: 128, anchor: 'middle' },
  { id: 'dst-known', x: 92, y: 128, anchor: 'middle' },
  { id: 'blocked', x: 220, y: 28, anchor: 'middle' },
]

// ARP 전에는 호스트 A가 아는 것(목적지 IP 주소를 적은 IP 패킷)과 채우지 못한 목적지 MAC 주소 칸만 선명하다.
export const arpPurposeScenarios: DiagramScenario[] = [
  { id: 'unknown', nodes: ['host-a', 'dst-mac', 'packet'], paths: [] },
  { id: 'resolved', nodes: ['host-a', 'host-b', 'dst-mac', 'src-mac', 'packet'], paths: ['send'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ArpPurposeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-arp-purpose-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutCellNotes = wide ? wideCellNotes.map((note) => ({ ...cellNotes.find(({ id }) => id === note.id)!, ...note })) : cellNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={arpPurposeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 192'}>
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
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
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

          {layoutCellNotes.map((note) => (
            <text key={note.id} data-cell-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.cell)}>
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
