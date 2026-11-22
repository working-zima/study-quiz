import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['raid-storage'].diagrams['raid-mirroring']

// 세로형은 맨 위에 「쓰는 데이터」, 가운데에 DISK0·DISK1 박스를 나란히, 맨 아래에 「읽는 쪽」을 둔다.
// 디스크 박스마다 칸 A1·A2·A3을 위아래로 빈틈없이 붙이고, 같은 덩이는 두 디스크의 같은 자리에 둔다. 화살표는 데이터가 가는 쪽이다.
const nodes = [
  { id: 'write', x: 92, y: 8, width: 96 },
  { id: 'd0-a1', x: 40, y: 80, width: 64 },
  { id: 'd0-a2', x: 40, y: 112, width: 64 },
  { id: 'd0-a3', x: 40, y: 144, width: 64 },
  { id: 'd1-a1', x: 176, y: 80, width: 64 },
  { id: 'd1-a2', x: 176, y: 112, width: 64 },
  { id: 'd1-a3', x: 176, y: 144, width: 64 },
  { id: 'read', x: 92, y: 216, width: 96 },
]

const groups = [
  { id: 'disk0', x: 8, y: 56, width: 128, height: 136, labelX: 16, labelY: 69 },
  { id: 'disk1', x: 144, y: 56, width: 128, height: 136, labelX: 152, labelY: 69 },
]

// 쓰는 화살표는 「쓰는 데이터」 아래 변에서 나와 두 디스크 박스 위에서 갈라져 첫 칸의 위 변으로 들어간다.
// 읽는 화살표는 DISK1의 마지막 칸 아래 변에서 나와 「읽는 쪽」의 오른쪽 변으로 들어간다.
const paths: Record<string, string> = {
  'write-disk0': 'M120 40 V48 H88 V80',
  'write-disk1': 'M160 40 V48 H208 V80',
  'disk1-read': 'M208 176 V232 H188',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 「고장」은 DISK0 박스 안, 디스크 이름 바로 옆에 붙는다. 나머지 곁말은 「읽는 쪽」 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'write-note': 'write',
  'fail-mark': 'fail',
  'fail-note': 'fail',
}

const notes: Note[] = [
  { id: 'write-note', x: 140, y: 272, anchor: 'middle' },
  { id: 'fail-mark', x: 52, y: 69, anchor: 'start' },
  { id: 'fail-note', x: 140, y: 272, anchor: 'middle' },
]

// 가로형은 왼쪽에 「쓰는 데이터」, 가운데에 DISK0 박스(위)와 DISK1 박스(아래), 오른쪽에 「읽는 쪽」을 둔다.
// 디스크 박스마다 칸 A1·A2·A3을 왼쪽에서 오른쪽으로 빈틈없이 잇는다.
const wideNodes = [
  { id: 'write', x: 8, y: 64, width: 88 },
  { id: 'd0-a1', x: 140, y: 32, width: 64 },
  { id: 'd0-a2', x: 204, y: 32, width: 64 },
  { id: 'd0-a3', x: 268, y: 32, width: 64 },
  { id: 'd1-a1', x: 140, y: 120, width: 64 },
  { id: 'd1-a2', x: 204, y: 120, width: 64 },
  { id: 'd1-a3', x: 268, y: 120, width: 64 },
  { id: 'read', x: 368, y: 120, width: 64 },
]

const wideGroups = [
  { id: 'disk0', x: 128, y: 8, width: 216, height: 64, labelX: 136, labelY: 21 },
  { id: 'disk1', x: 128, y: 96, width: 216, height: 64, labelX: 136, labelY: 109 },
]

const widePaths: Record<string, string> = {
  'write-disk0': 'M96 72 H112 V48 H140',
  'write-disk1': 'M96 88 H112 V136 H140',
  'disk1-read': 'M332 136 H368',
}

const wideNotes: Note[] = [
  { id: 'write-note', x: 220, y: 184, anchor: 'middle' },
  { id: 'fail-mark', x: 172, y: 21, anchor: 'start' },
  { id: 'fail-note', x: 220, y: 184, anchor: 'middle' },
]

// 똑같이 쓰기: 「쓰는 데이터」가 두 디스크의 같은 자리에 똑같이 쓰인다. 「읽는 쪽」은 흐리다.
// 디스크 하나의 고장: DISK0의 칸이 모두 흐리고, DISK1의 칸에서 「읽는 쪽」으로 읽는다. DISK0 이름 옆에 「고장」이 붙는다.
export const raidMirroringScenarios: DiagramScenario[] = [
  {
    id: 'write',
    nodes: ['write', 'd0-a1', 'd0-a2', 'd0-a3', 'd1-a1', 'd1-a2', 'd1-a3'],
    paths: ['write-disk0', 'write-disk1'],
  },
  {
    id: 'fail',
    nodes: ['d1-a1', 'd1-a2', 'd1-a3', 'read'],
    paths: ['disk1-read'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RaidMirroringDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-raid-mirroring-arrow`
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
      scenarios={raidMirroringScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 280'}>
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
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" strokeWidth="1.5" />
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
