import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-security-model'].diagrams['rbac-scope']

// 세로형은 넓은 범위부터 위에서 아래로 쌓고, 역할을 건 곳을 노드 오른쪽의 곁말로 보인다.
const nodes = [
  { id: 'management-group', x: 24, y: 8, width: 120 },
  { id: 'subscription', x: 24, y: 64, width: 120 },
  { id: 'resource-group', x: 24, y: 120, width: 120 },
  { id: 'resource', x: 24, y: 176, width: 120 },
]
const paths: Record<string, string> = {
  'inherit-1': 'M84 40 V64',
  'inherit-2': 'M84 96 V120',
  'inherit-3': 'M84 152 V176',
}
const notes = [
  { id: 'at-mg-note', x: 152, y: 28, textAnchor: 'start' as const, scenario: 'at-mg' },
  { id: 'at-subscription-note', x: 152, y: 84, textAnchor: 'start' as const, scenario: 'at-subscription' },
  { id: 'at-resource-note', x: 152, y: 196, textAnchor: 'start' as const, scenario: 'at-resource' },
]

// 가로형은 넓은 범위부터 왼쪽에서 오른쪽으로 잇고, 역할을 건 곳을 노드 위의 곁말로 보인다.
const wideNodes = [
  { id: 'management-group', x: 8, y: 40, width: 88 },
  { id: 'subscription', x: 120, y: 40, width: 88 },
  { id: 'resource-group', x: 232, y: 40, width: 88 },
  { id: 'resource', x: 344, y: 40, width: 88 },
]
const widePaths: Record<string, string> = {
  'inherit-1': 'M96 56 H120',
  'inherit-2': 'M208 56 H232',
  'inherit-3': 'M320 56 H344',
}
const wideNotes = [
  { id: 'at-mg-note', x: 52, y: 30, textAnchor: 'middle' as const, scenario: 'at-mg' },
  { id: 'at-subscription-note', x: 164, y: 30, textAnchor: 'middle' as const, scenario: 'at-subscription' },
  { id: 'at-resource-note', x: 388, y: 30, textAnchor: 'middle' as const, scenario: 'at-resource' },
]

// 경로 셋은 범위가 이어지는 모양이라 어느 장면에서나 보인다. 역할이 미치는 곳은 선명한 상자가 보인다.
const allPaths = ['inherit-1', 'inherit-2', 'inherit-3']

export const rbacScopeScenarios: DiagramScenario[] = [
  { id: 'at-mg', nodes: ['management-group', 'subscription', 'resource-group', 'resource'], paths: allPaths },
  { id: 'at-subscription', nodes: ['subscription', 'resource-group', 'resource'], paths: allPaths },
  { id: 'at-resource', nodes: ['resource'], paths: allPaths },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RbacScopeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-rbac-scope-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={rbacScopeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 80' : '0 0 280 216'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {allPaths.map((id) => (
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
