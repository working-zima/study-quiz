import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-data-movement'].diagrams['file-sync']

// 세로형은 온-프레미스를 위에, Azure를 아래에 쌓는다. 경로는 두 노드 사이를 곧게 지나고, 양방향의 두 선은 x 88·112로 어긋나게 둔다.
const groups = [
  { id: 'on-premises', x: 8, y: 8, width: 264, height: 68 },
  { id: 'azure', x: 8, y: 96, width: 264, height: 68 },
]
const nodes = [
  { id: 'server', x: 40, y: 32, width: 120 },
  { id: 'share', x: 40, y: 120, width: 120 },
]
const paths: Record<string, string> = {
  'azcopy-one-way': 'M100 64 V120',
  'sync-up': 'M88 64 V120',
  'sync-down': 'M112 120 V64',
}
const notes = [
  { id: 'azcopy-note', x: 120, y: 90, textAnchor: 'start' as const, scenario: 'azcopy' },
  { id: 'sync-note', x: 120, y: 90, textAnchor: 'start' as const, scenario: 'file-sync' },
  { id: 'server-tier-note', x: 168, y: 52, textAnchor: 'start' as const, scenario: 'cloud-tiering' },
  { id: 'share-tier-note', x: 168, y: 140, textAnchor: 'start' as const, scenario: 'cloud-tiering' },
]

// 가로형은 온-프레미스를 왼쪽에, Azure를 오른쪽에 둔다. 두 박스 사이의 빈자리에 곁말이 들어가고, 양방향의 두 선은 y 40·56으로 어긋나게 둔다.
const wideGroups = [
  { id: 'on-premises', x: 8, y: 8, width: 140, height: 84 },
  { id: 'azure', x: 292, y: 8, width: 140, height: 84 },
]
const wideNodes = [
  { id: 'server', x: 20, y: 32, width: 116 },
  { id: 'share', x: 304, y: 32, width: 116 },
]
const widePaths: Record<string, string> = {
  'azcopy-one-way': 'M136 48 H304',
  'sync-up': 'M136 40 H304',
  'sync-down': 'M304 56 H136',
}
const wideNotes = [
  { id: 'azcopy-note', x: 220, y: 34, textAnchor: 'middle' as const, scenario: 'azcopy' },
  { id: 'sync-note', x: 220, y: 34, textAnchor: 'middle' as const, scenario: 'file-sync' },
  { id: 'server-tier-note', x: 78, y: 80, textAnchor: 'middle' as const, scenario: 'cloud-tiering' },
  { id: 'share-tier-note', x: 362, y: 80, textAnchor: 'middle' as const, scenario: 'cloud-tiering' },
]

export const fileSyncScenarios: DiagramScenario[] = [
  { id: 'azcopy', nodes: ['server', 'share'], paths: ['azcopy-one-way'] },
  { id: 'file-sync', nodes: ['server', 'share'], paths: ['sync-up', 'sync-down'] },
  { id: 'cloud-tiering', nodes: ['server', 'share'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FileSyncDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-file-sync-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={fileSyncScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 100' : '0 0 280 172'}>
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
              {text.groups![group.id]}
            </text>
          ))}

          {visiblePaths.map((id) => (
            <path key={id} data-path={id} d={layoutPaths[id]} className="fill-none stroke-title" strokeWidth="1.5" strokeLinejoin="round" markerEnd={`url(#${arrowId})`} />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
