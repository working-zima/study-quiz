import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cost-management'].diagrams['tag-inheritance']

// 세로형은 그룹의 태그와 VM 1을 위아래로 두고 그 사이에 곁말을 둔다. Azure Policy는 리소스 그룹 아래 밖에 있다.
const nodes = [
  { id: 'group-tag', x: 24, y: 32, width: 232 },
  { id: 'vm', x: 24, y: 92, width: 232 },
  { id: 'policy', x: 24, y: 172, width: 96 },
]
const paths: Record<string, string> = {
  'policy-to-vm': 'M72 172 V124',
}
const groups = [
  { id: 'resource-group', x: 8, y: 8, width: 264, height: 132 },
]
const notes = [
  { id: 'default-note', x: 140, y: 82, anchor: 'middle' as const, scenario: 'default' },
  { id: 'policy-note', x: 132, y: 192, anchor: 'start' as const, scenario: 'policy' },
]

// 가로형은 그룹의 태그와 VM 1을 나란히 두고 그 사이에 곁말을 둔다. Azure Policy는 리소스 그룹 오른쪽 밖에 있다.
const wideNodes = [
  { id: 'group-tag', x: 24, y: 32, width: 88 },
  { id: 'vm', x: 240, y: 32, width: 72 },
  { id: 'policy', x: 344, y: 32, width: 88 },
]
const widePaths: Record<string, string> = {
  'policy-to-vm': 'M344 48 H312',
}
const wideGroups = [
  { id: 'resource-group', x: 8, y: 8, width: 320, height: 72 },
]
const wideNotes = [
  { id: 'default-note', x: 176, y: 52, anchor: 'middle' as const, scenario: 'default' },
  { id: 'policy-note', x: 432, y: 100, anchor: 'end' as const, scenario: 'policy' },
]

export const tagInheritanceScenarios: DiagramScenario[] = [
  { id: 'default', nodes: ['group-tag', 'vm'], paths: [] },
  { id: 'policy', nodes: ['policy', 'vm'], paths: ['policy-to-vm'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TagInheritanceDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-tag-inheritance-arrow`
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
      scenarios={tagInheritanceScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 108' : '0 0 280 212'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
