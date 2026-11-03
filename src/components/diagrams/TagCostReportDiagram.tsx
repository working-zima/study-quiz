import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cost-management'].diagrams['tag-cost-report']

// 세로형은 구독 안에 리소스 셋을 나란히 두고, 그 아래 구독 밖에 비용 둘을 둔다. 화살표는 곧게 내려간다.
const nodes = [
  { id: 'vm-sales', x: 16, y: 32, width: 72 },
  { id: 'disk-sales', x: 96, y: 32, width: 72 },
  { id: 'vm-research', x: 184, y: 32, width: 80 },
  { id: 'report-sales', x: 16, y: 112, width: 152 },
  { id: 'report-research', x: 184, y: 112, width: 80 },
]
const paths: Record<string, string> = {
  'sales-vm': 'M52 64 V112',
  'sales-disk': 'M132 64 V112',
  'research-vm': 'M224 64 V112',
}
const groups = [
  { id: 'subscription', x: 8, y: 8, width: 264, height: 72 },
]
const notes = [
  { id: 'sales-note', x: 92, y: 162, scenario: 'sales' },
  { id: 'research-note', x: 224, y: 162, scenario: 'research' },
]

// 가로형도 소속과 방향이 같고, 노드만 넓게 편다.
const wideNodes = [
  { id: 'vm-sales', x: 24, y: 32, width: 120 },
  { id: 'disk-sales', x: 160, y: 32, width: 120 },
  { id: 'vm-research', x: 296, y: 32, width: 120 },
  { id: 'report-sales', x: 24, y: 112, width: 256 },
  { id: 'report-research', x: 296, y: 112, width: 120 },
]
const widePaths: Record<string, string> = {
  'sales-vm': 'M84 64 V112',
  'sales-disk': 'M220 64 V112',
  'research-vm': 'M356 64 V112',
}
const wideGroups = [
  { id: 'subscription', x: 8, y: 8, width: 424, height: 72 },
]
const wideNotes = [
  { id: 'sales-note', x: 152, y: 162, scenario: 'sales' },
  { id: 'research-note', x: 356, y: 162, scenario: 'research' },
]

export const tagCostReportScenarios: DiagramScenario[] = [
  { id: 'sales', nodes: ['vm-sales', 'disk-sales', 'report-sales'], paths: ['sales-vm', 'sales-disk'] },
  { id: 'research', nodes: ['vm-research', 'report-research'], paths: ['research-vm'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TagCostReportDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-tag-cost-report-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={tagCostReportScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 172' : '0 0 280 172'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-disabled" x={group.x} y={group.y} width={group.width} height={group.height} rx="4" strokeWidth="1.5" />
              <text data-group-label={group.id} className="fill-muted" x={group.x + 10} y={group.y + 14} fontSize="9">
                {text.groups![group.id]}
              </text>
            </g>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
