import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-monitoring'].diagrams['activity-log']

// 세로형은 관리 작업을 위쪽 가로줄에 두고, 리소스 안의 요청이 진단 설정과 리소스 로그로 내려가는 길을 세로로 둔다.
const nodes = [
  { id: 'admin', x: 16, y: 16, width: 72 },
  { id: 'vm-1', x: 104, y: 16, width: 72 },
  { id: 'activity-log', x: 192, y: 16, width: 72 },
  { id: 'database', x: 96, y: 88, width: 88 },
  { id: 'diag', x: 96, y: 152, width: 88 },
  { id: 'resource-log', x: 96, y: 216, width: 88 },
]
const paths: Record<string, string> = {
  'stop-vm': 'M88 32 H104',
  'vm-to-activity': 'M176 32 H192',
  'vm-to-db': 'M140 48 V88',
  'db-to-diag': 'M140 120 V152',
  'diag-to-log': 'M140 184 V216',
}
const notes = [
  { id: 'manage-note', x: 140, y: 72, anchor: 'middle' as const, scenario: 'manage' },
  { id: 'inside-note', x: 140, y: 268, anchor: 'middle' as const, scenario: 'inside' },
]

// 가로형은 관리 작업을 윗줄에, 리소스 안의 요청을 아랫줄에 둔다. VM 1은 두 길이 갈리는 공통 노드다.
const wideNodes = [
  { id: 'admin', x: 8, y: 16, width: 72 },
  { id: 'vm-1', x: 104, y: 16, width: 64 },
  { id: 'activity-log', x: 192, y: 16, width: 88 },
  { id: 'database', x: 104, y: 88, width: 88 },
  { id: 'diag', x: 224, y: 88, width: 88 },
  { id: 'resource-log', x: 336, y: 88, width: 96 },
]
const widePaths: Record<string, string> = {
  'stop-vm': 'M80 32 H104',
  'vm-to-activity': 'M168 32 H192',
  'vm-to-db': 'M136 48 V88',
  'db-to-diag': 'M192 104 H224',
  'diag-to-log': 'M312 104 H336',
}
const wideNotes = [
  { id: 'manage-note', x: 356, y: 34, anchor: 'middle' as const, scenario: 'manage' },
  { id: 'inside-note', x: 272, y: 148, anchor: 'middle' as const, scenario: 'inside' },
]

export const activityLogScenarios: DiagramScenario[] = [
  { id: 'manage', nodes: ['admin', 'vm-1', 'activity-log'], paths: ['stop-vm', 'vm-to-activity'] },
  { id: 'inside', nodes: ['vm-1', 'database', 'diag', 'resource-log'], paths: ['vm-to-db', 'db-to-diag', 'diag-to-log'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ActivityLogDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-activity-log-arrow`
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
      scenarios={activityLogScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 272'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
