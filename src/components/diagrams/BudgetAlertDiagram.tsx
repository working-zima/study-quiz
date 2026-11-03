import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cost-management'].diagrams['budget-alert']

// 세로형은 쓴 비용과 예산을 위에 세우고, 그 아래를 경고 쪽과 자동화 쪽 두 열로 나눈다.
const nodes = [
  { id: 'spending', x: 90, y: 8, width: 100 },
  { id: 'budget', x: 90, y: 64, width: 100 },
  { id: 'alert', x: 8, y: 120, width: 116 },
  { id: 'email', x: 8, y: 176, width: 116 },
  { id: 'automation', x: 156, y: 120, width: 116 },
  { id: 'resource', x: 156, y: 176, width: 116 },
]
const paths: Record<string, string> = {
  'to-budget': 'M140 40 V64',
  'to-alert': 'M110 96 V108 H66 V120',
  'to-email': 'M66 152 V176',
  'to-automation': 'M170 96 V108 H214 V120',
  'to-resource': 'M214 152 V176',
}
const notes = [
  { id: 'alert-note', x: 208, y: 226, scenario: 'alert' },
  { id: 'automation-note', x: 208, y: 226, scenario: 'automation' },
]

// 가로형은 왼쪽에서 오른쪽으로 흐르고, 예산에서 위아래 두 줄로 갈라진다.
const wideNodes = [
  { id: 'spending', x: 8, y: 48, width: 88 },
  { id: 'budget', x: 128, y: 48, width: 80 },
  { id: 'alert', x: 240, y: 16, width: 88 },
  { id: 'email', x: 352, y: 16, width: 80 },
  { id: 'automation', x: 240, y: 80, width: 88 },
  { id: 'resource', x: 352, y: 80, width: 80 },
]
const widePaths: Record<string, string> = {
  'to-budget': 'M96 64 H128',
  'to-alert': 'M168 48 V32 H240',
  'to-email': 'M328 32 H352',
  'to-automation': 'M168 80 V96 H240',
  'to-resource': 'M328 96 H352',
}
const wideNotes = [
  { id: 'alert-note', x: 368, y: 130, scenario: 'alert' },
  { id: 'automation-note', x: 368, y: 130, scenario: 'automation' },
]

export const budgetAlertScenarios: DiagramScenario[] = [
  { id: 'alert', nodes: ['spending', 'budget', 'alert', 'email'], paths: ['to-budget', 'to-alert', 'to-email'] },
  { id: 'automation', nodes: ['spending', 'budget', 'automation', 'resource'], paths: ['to-budget', 'to-automation', 'to-resource'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function BudgetAlertDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-budget-alert-arrow`
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
      scenarios={budgetAlertScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 140' : '0 0 280 236'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
