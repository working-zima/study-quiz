import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-storage'].diagrams['archive-rehydration']

// 세로형은 앱을 위에, 두 Blob을 그 아래 나란히 둔다. 옮기는 화살표는 두 Blob 사이를 지난다.
const nodes = [
  { id: 'app', x: 98, y: 8, width: 84 },
  { id: 'archive-blob', x: 8, y: 88, width: 112 },
  { id: 'online-blob', x: 152, y: 88, width: 120 },
]
const paths: Record<string, string> = {
  'read-archive': 'M120 40 V64 H64 V88',
  'rehydrate': 'M120 104 H152',
  'read-online': 'M160 40 V64 H212 V88',
}
const notes = [
  { id: 'offline-note', x: 8, y: 136, textAnchor: 'start' as const, scenario: 'read-now' },
  { id: 'rehydrate-note', x: 140, y: 136, textAnchor: 'middle' as const, scenario: 'rehydrate' },
]

// 가로형은 셋을 한 줄에 둔다. 앱에서 온라인 계층의 Blob으로 가는 경로는 보관 계층의 Blob 위로 돌아간다.
const wideNodes = [
  { id: 'app', x: 8, y: 48, width: 64 },
  { id: 'archive-blob', x: 128, y: 48, width: 124 },
  { id: 'online-blob', x: 308, y: 48, width: 124 },
]
const widePaths: Record<string, string> = {
  'read-archive': 'M72 64 H128',
  'rehydrate': 'M252 64 H308',
  'read-online': 'M40 48 V24 H370 V48',
}
const wideNotes = [
  { id: 'offline-note', x: 190, y: 96, textAnchor: 'middle' as const, scenario: 'read-now' },
  { id: 'rehydrate-note', x: 280, y: 96, textAnchor: 'middle' as const, scenario: 'rehydrate' },
]

export const archiveRehydrationScenarios: DiagramScenario[] = [
  { id: 'read-now', nodes: ['app', 'archive-blob'], paths: ['read-archive'] },
  { id: 'rehydrate', nodes: ['app', 'archive-blob', 'online-blob'], paths: ['rehydrate', 'read-online'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ArchiveRehydrationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-archive-rehydration-arrow`
  const wide = useWideDiagram()
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
      scenarios={archiveRehydrationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 104' : '0 0 280 144'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
