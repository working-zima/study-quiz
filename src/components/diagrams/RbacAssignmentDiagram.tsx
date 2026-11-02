import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-security-model'].diagrams['rbac-assignment']

// 세로형은 엔지니어 그룹 → 역할 → 역할을 건 범위를 위에서 아래로 쌓는다. 박스 안의 왼쪽 열끼리, 오른쪽 열끼리 곧게 잇는다.
const groups = [
  { id: 'engineers', x: 8, y: 8, width: 264, height: 66 },
  { id: 'scope', x: 8, y: 176, width: 264, height: 66 },
]
const nodes = [
  { id: 'member', x: 20, y: 34, width: 112 },
  { id: 'new-member', x: 148, y: 34, width: 112 },
  { id: 'role', x: 76, y: 120, width: 128 },
  { id: 'resource', x: 20, y: 202, width: 112 },
  { id: 'new-resource', x: 148, y: 202, width: 112 },
]
const paths: Record<string, string> = {
  'assign': 'M104 66 V120',
  'assign-new': 'M176 66 V120',
  'grant': 'M104 152 V202',
  'grant-new': 'M176 152 V202',
}
const notes = [
  { id: 'assign-note', x: 112, y: 96, textAnchor: 'start' as const, scenario: 'assign' },
  { id: 'new-person-note', x: 168, y: 96, textAnchor: 'end' as const, scenario: 'new-person' },
  { id: 'new-resource-note', x: 168, y: 168, textAnchor: 'end' as const, scenario: 'new-resource' },
]

// 가로형은 엔지니어 그룹 → 역할 → 역할을 건 범위를 왼쪽에서 오른쪽으로 두고, 박스 안의 노드는 위아래로 쌓는다.
const wideGroups = [
  { id: 'engineers', x: 8, y: 8, width: 128, height: 106 },
  { id: 'scope', x: 304, y: 8, width: 128, height: 106 },
]
const wideNodes = [
  { id: 'member', x: 20, y: 34, width: 104 },
  { id: 'new-member', x: 20, y: 74, width: 104 },
  { id: 'role', x: 172, y: 40, width: 96 },
  { id: 'resource', x: 316, y: 34, width: 104 },
  { id: 'new-resource', x: 316, y: 74, width: 104 },
]
const widePaths: Record<string, string> = {
  'assign': 'M124 50 H172',
  'assign-new': 'M124 90 H148 V64 H172',
  'grant': 'M268 50 H316',
  'grant-new': 'M268 64 H292 V90 H316',
}
const wideNotes = [
  { id: 'assign-note', x: 220, y: 90, textAnchor: 'middle' as const, scenario: 'assign' },
  { id: 'new-person-note', x: 220, y: 90, textAnchor: 'middle' as const, scenario: 'new-person' },
  { id: 'new-resource-note', x: 220, y: 90, textAnchor: 'middle' as const, scenario: 'new-resource' },
]

export const rbacAssignmentScenarios: DiagramScenario[] = [
  { id: 'assign', nodes: ['member', 'role', 'resource'], paths: ['assign', 'grant'] },
  { id: 'new-person', nodes: ['new-member', 'role', 'resource'], paths: ['assign-new', 'grant'] },
  { id: 'new-resource', nodes: ['member', 'role', 'new-resource'], paths: ['assign', 'grant-new'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RbacAssignmentDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-rbac-assignment-arrow`
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
      scenarios={rbacAssignmentScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 122' : '0 0 280 250'}>
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
