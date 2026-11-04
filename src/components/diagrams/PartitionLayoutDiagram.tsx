import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-filesystem'].diagrams['partition-layout']

// 세로형은 위에 명령 fdisk·fsck를 두고, 그 아래 둘째 디스크 테두리 안에 파티션 테이블·파티션 1·파티션 2를 한 줄에 빈틈없이 잇는다.
// fdisk는 파티션 테이블 바로 위에, fsck는 파티션 1 바로 위에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'fdisk', x: 52, y: 8, width: 56 },
  { id: 'fsck', x: 124, y: 8, width: 56 },
  { id: 'table', x: 16, y: 78, width: 100 },
  { id: 'part1', x: 116, y: 78, width: 72 },
  { id: 'part2', x: 188, y: 78, width: 72 },
]

const groups = [
  { id: 'disk', x: 8, y: 56, width: 264, height: 78, labelX: 16, labelY: 70 },
]

// 화살표는 명령이 다루는 대상이다. 명령의 아래 변에서 곧게 내려가 칸의 위 변에 닿는다.
const paths: Record<string, string> = {
  'to-table': 'M80 40 V78',
  'to-part1': 'M152 40 V78',
}

// 곁말은 칸 아래에 둔다. 크기 곁말과 점검 곁말은 시나리오가 달라 함께 보이지 않는다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'table-note', x: 66, y: 126, anchor: 'middle', scenarios: ['table'] },
  { id: 'size1-note', x: 152, y: 126, anchor: 'middle', scenarios: ['areas'] },
  { id: 'size2-note', x: 224, y: 126, anchor: 'middle', scenarios: ['areas'] },
  { id: 'check-note', x: 152, y: 126, anchor: 'middle', scenarios: ['check'] },
]

// 가로형도 같은 짜임이다. 칸을 넓혀 디스크 테두리가 폭을 채우고, 명령은 각자 다루는 칸 위에 둔다.
const wideNodes = [
  { id: 'fdisk', x: 56, y: 8, width: 64 },
  { id: 'fsck', x: 188, y: 8, width: 64 },
  { id: 'table', x: 16, y: 78, width: 136 },
  { id: 'part1', x: 152, y: 78, width: 136 },
  { id: 'part2', x: 288, y: 78, width: 136 },
]

const wideGroups = [
  { id: 'disk', x: 8, y: 56, width: 424, height: 78, labelX: 16, labelY: 70 },
]

const widePaths: Record<string, string> = {
  'to-table': 'M88 40 V78',
  'to-part1': 'M220 40 V78',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'table-note', x: 84, y: 126, anchor: 'middle' },
  { id: 'size1-note', x: 220, y: 126, anchor: 'middle' },
  { id: 'size2-note', x: 356, y: 126, anchor: 'middle' },
  { id: 'check-note', x: 220, y: 126, anchor: 'middle' },
]

// 「파티션 테이블」은 fdisk에서 표로, 「점검」은 fsck에서 파티션 1로 간다. 「나뉜 구역」은 화살표 없이 두 파티션과 크기를 보인다.
export const partitionLayoutScenarios: DiagramScenario[] = [
  { id: 'table', nodes: ['fdisk', 'table'], paths: ['to-table'] },
  { id: 'areas', nodes: ['part1', 'part2'], paths: [] },
  { id: 'check', nodes: ['fsck', 'part1'], paths: ['to-part1'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PartitionLayoutDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-partition-layout-arrow`
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
      scenarios={partitionLayoutScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 142' : '0 0 280 142'}>
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
