import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-filesystem'].diagrams['mount-point']

// 세로형은 위에 디렉터리 나무(/ 아래 home·data)를 테두리로 묶고, 그 아래에 새 디스크의 파티션 /dev/sdb1과 명령을 둔다.
// /dev/sdb1은 data 바로 아래, fdisk는 그 왼쪽, mkfs.ext4는 그 아래, mount는 왼쪽 아래에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'root', x: 116, y: 30, width: 48 },
  { id: 'home', x: 44, y: 80, width: 72 },
  { id: 'data', x: 164, y: 80, width: 72 },
  { id: 'fdisk', x: 16, y: 168, width: 64 },
  { id: 'sdb1', x: 160, y: 168, width: 80 },
  { id: 'mount', x: 16, y: 224, width: 64 },
  { id: 'mkfs', x: 160, y: 224, width: 80 },
]

const groups = [
  { id: 'tree', x: 8, y: 8, width: 264, height: 112, labelX: 16, labelY: 22 },
]

// 나무의 가지(b-)는 늘 보이고, 화살표(to-)는 시나리오마다 보인다. 명령의 화살표는 /dev/sdb1로, 마운트의 화살표는 /dev/sdb1에서 data로 간다.
const paths: Record<string, string> = {
  'b-home': 'M140 62 V71 H80 V80',
  'b-data': 'M140 62 V71 H200 V80',
  'to-part': 'M80 184 H160',
  'to-make': 'M200 224 V200',
  'to-mount': 'M80 240 H120 V192 H160',
  'to-data': 'M200 168 V112',
}

const linkIds = ['b-home', 'b-data']

// 단계마다의 상태 곁말은 mkfs.ext4 아래에, 마운트 지점의 곁말은 data로 오르는 화살표 왼쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'no-fs-note', x: 200, y: 272, anchor: 'middle', scenarios: ['partition'] },
  { id: 'unmounted-note', x: 200, y: 272, anchor: 'middle', scenarios: ['make'] },
  { id: 'mountpoint-note', x: 194, y: 148, anchor: 'end', scenarios: ['mount'] },
]

// 가로형은 왼쪽에 디렉터리 나무를, 오른쪽에 /dev/sdb1을 두고 명령은 그 위·아래·오른쪽에 둔다.
const wideNodes = [
  { id: 'root', x: 84, y: 30, width: 48 },
  { id: 'home', x: 24, y: 80, width: 72 },
  { id: 'data', x: 120, y: 80, width: 72 },
  { id: 'fdisk', x: 272, y: 24, width: 64 },
  { id: 'sdb1', x: 264, y: 80, width: 80 },
  { id: 'mount', x: 360, y: 80, width: 64 },
  { id: 'mkfs', x: 264, y: 136, width: 80 },
]

const wideGroups = [
  { id: 'tree', x: 8, y: 8, width: 200, height: 128, labelX: 16, labelY: 22 },
]

const widePaths: Record<string, string> = {
  'b-home': 'M108 62 V71 H60 V80',
  'b-data': 'M108 62 V71 H156 V80',
  'to-part': 'M304 56 V80',
  'to-make': 'M304 136 V112',
  'to-mount': 'M360 96 H344',
  'to-data': 'M264 96 H192',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'no-fs-note', x: 304, y: 188, anchor: 'middle' },
  { id: 'unmounted-note', x: 304, y: 188, anchor: 'middle' },
  { id: 'mountpoint-note', x: 156, y: 128, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 가지를 함께 적는다. 「3. 마운트」만 나무의 / · data와 그 가지를 밝힌다.
export const mountPointScenarios: DiagramScenario[] = [
  { id: 'partition', nodes: ['fdisk', 'sdb1'], paths: ['to-part'] },
  { id: 'make', nodes: ['mkfs', 'sdb1'], paths: ['to-make'] },
  { id: 'mount', nodes: ['mount', 'sdb1', 'root', 'data', 'b-data'], paths: ['to-mount', 'to-data'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MountPointDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-mount-point-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={mountPointScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 196' : '0 0 280 280'}>
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

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
