import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['raid-storage'].diagrams['raid-array']

// 세로형은 맨 위에 운영 체제, 그 아래 논리 디스크를 두고, 맨 아래 「RAID 묶음」 박스에 물리 디스크 넷을 두 줄로 둘씩 둔다.
// 화살표는 운영 체제가 쓴 데이터가 가는 쪽이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'os', x: 92, y: 8, width: 96 },
  { id: 'logical', x: 92, y: 64, width: 96 },
  { id: 'disk0', x: 24, y: 144, width: 64 },
  { id: 'disk1', x: 192, y: 144, width: 64 },
  { id: 'disk2', x: 24, y: 200, width: 64 },
  { id: 'disk3', x: 192, y: 200, width: 64 },
]

const groups = [
  { id: 'raid', x: 8, y: 120, width: 264, height: 124, labelX: 16, labelY: 133 },
]

// 윗줄 디스크로 가는 화살표는 묶음 박스 위에서 옆으로 꺾어 디스크 위 변으로 들어가고,
// 아랫줄 디스크로 가는 화살표는 두 윗줄 디스크 사이의 빈 통로로 내려가 디스크 안쪽 변으로 들어간다.
const paths: Record<string, string> = {
  'os-logical': 'M140 40 V64',
  'logical-disk0': 'M108 96 V112 H80 V144',
  'logical-disk1': 'M172 96 V112 H200 V144',
  'logical-disk2': 'M124 96 V216 H88',
  'logical-disk3': 'M156 96 V216 H192',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 「RAID 묶음」 박스 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'os-view-note': 'os-view',
  'physical-note': 'physical',
}

const notes: Note[] = [
  { id: 'os-view-note', x: 140, y: 264, anchor: 'middle' },
  { id: 'physical-note', x: 140, y: 264, anchor: 'middle' },
]

// 가로형은 왼쪽에 운영 체제, 가운데 논리 디스크를 두고, 오른쪽 「RAID 묶음」 박스에 물리 디스크 넷을 두 줄로 둘씩 둔다.
// DISK1·DISK3으로 가는 화살표는 두 줄 디스크 사이의 빈 통로를 지나 디스크의 아래·위 변으로 들어간다.
const wideNodes = [
  { id: 'os', x: 8, y: 72, width: 88 },
  { id: 'logical', x: 128, y: 72, width: 96 },
  { id: 'disk0', x: 272, y: 32, width: 64 },
  { id: 'disk1', x: 352, y: 32, width: 64 },
  { id: 'disk2', x: 272, y: 120, width: 64 },
  { id: 'disk3', x: 352, y: 120, width: 64 },
]

const wideGroups = [
  { id: 'raid', x: 256, y: 8, width: 176, height: 164, labelX: 264, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'os-logical': 'M96 88 H128',
  'logical-disk0': 'M224 76 H240 V48 H272',
  'logical-disk1': 'M224 84 H392 V64',
  'logical-disk2': 'M224 100 H240 V136 H272',
  'logical-disk3': 'M224 92 H376 V120',
}

const wideNotes: Note[] = [
  { id: 'os-view-note', x: 120, y: 148, anchor: 'middle' },
  { id: 'physical-note', x: 120, y: 148, anchor: 'middle' },
]

// 운영 체제가 보는 것: 운영 체제는 논리 디스크 하나에만 쓴다. 물리 디스크 넷은 흐리다.
// 실제로 놓인 것: 논리 디스크에 쓴 데이터가 물리 디스크 넷으로 간다. 운영 체제는 흐리다.
export const raidArrayScenarios: DiagramScenario[] = [
  {
    id: 'os-view',
    nodes: ['os', 'logical'],
    paths: ['os-logical'],
  },
  {
    id: 'physical',
    nodes: ['logical', 'disk0', 'disk1', 'disk2', 'disk3'],
    paths: ['logical-disk0', 'logical-disk1', 'logical-disk2', 'logical-disk3'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RaidArrayDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-raid-array-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={raidArrayScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 276'}>
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
            <text key={group.id} data-group-label={group.id} x={group.labelX} y={group.labelY} className="fill-muted" fontSize="9">
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
