import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cost-factors'].diagrams['pricing-calculator']

// 세로형은 어림하는 줄을 왼쪽에, 실제 비용을 보는 줄을 오른쪽에 세운다. 두 줄 사이에는 경로가 없다.
const nodes = [
  { id: 'choices', x: 8, y: 8, width: 128 },
  { id: 'calculator', x: 8, y: 64, width: 128 },
  { id: 'estimate', x: 8, y: 120, width: 128 },
  { id: 'resource', x: 148, y: 8, width: 124 },
  { id: 'cost-management', x: 148, y: 64, width: 124 },
]
const paths: Record<string, string> = {
  'to-calculator': 'M72 40 V64',
  'to-estimate': 'M72 96 V120',
  'to-cost-management': 'M210 40 V64',
}
const notes = [
  { id: 'before-note', x: 140, y: 172, scenario: 'before' },
  { id: 'after-note', x: 140, y: 172, scenario: 'after' },
]

// 가로형은 어림하는 줄을 위에, 실제 비용을 보는 줄을 아래에 왼쪽에서 오른쪽으로 편다.
const wideNodes = [
  { id: 'choices', x: 8, y: 8, width: 128 },
  { id: 'calculator', x: 156, y: 8, width: 128 },
  { id: 'estimate', x: 304, y: 8, width: 128 },
  { id: 'resource', x: 8, y: 64, width: 128 },
  { id: 'cost-management', x: 156, y: 64, width: 128 },
]
const widePaths: Record<string, string> = {
  'to-calculator': 'M136 24 H156',
  'to-estimate': 'M284 24 H304',
  'to-cost-management': 'M136 80 H156',
}
const wideNotes = [
  { id: 'before-note', x: 220, y: 114, scenario: 'before' },
  { id: 'after-note', x: 220, y: 114, scenario: 'after' },
]

export const pricingCalculatorScenarios: DiagramScenario[] = [
  { id: 'before', nodes: ['choices', 'calculator', 'estimate'], paths: ['to-calculator', 'to-estimate'] },
  { id: 'after', nodes: ['resource', 'cost-management'], paths: ['to-cost-management'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PricingCalculatorDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-pricing-calculator-arrow`
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
      scenarios={pricingCalculatorScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 124' : '0 0 280 182'}>
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
