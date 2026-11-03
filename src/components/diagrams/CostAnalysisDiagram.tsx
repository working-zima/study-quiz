import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cost-management'].diagrams['cost-analysis']

// 세로형은 지난달 비용을 왼쪽에, 나누는 기준 셋을 오른쪽에 위아래로 세운다.
const nodes = [
  { id: 'total', x: 8, y: 52, width: 100 },
  { id: 'by-group', x: 160, y: 8, width: 112 },
  { id: 'by-service', x: 160, y: 52, width: 112 },
  { id: 'by-region', x: 160, y: 96, width: 112 },
]
const paths: Record<string, string> = {
  'to-group': 'M58 52 V24 H160',
  'to-service': 'M108 68 H160',
  'to-region': 'M58 84 V112 H160',
}
const notes = [
  { id: 'group-note', x: 140, y: 150, scenario: 'group' },
  { id: 'service-note', x: 140, y: 150, scenario: 'service' },
  { id: 'region-note', x: 140, y: 150, scenario: 'region' },
]

// 가로형은 지난달 비용을 위 가운데에, 기준 셋을 아래에 나란히 둔다.
const wideNodes = [
  { id: 'total', x: 160, y: 8, width: 120 },
  { id: 'by-group', x: 8, y: 64, width: 128 },
  { id: 'by-service', x: 156, y: 64, width: 128 },
  { id: 'by-region', x: 304, y: 64, width: 128 },
]
const widePaths: Record<string, string> = {
  'to-group': 'M160 24 H72 V64',
  'to-service': 'M220 40 V64',
  'to-region': 'M280 24 H368 V64',
}
const wideNotes = [
  { id: 'group-note', x: 220, y: 116, scenario: 'group' },
  { id: 'service-note', x: 220, y: 116, scenario: 'service' },
  { id: 'region-note', x: 220, y: 116, scenario: 'region' },
]

export const costAnalysisScenarios: DiagramScenario[] = [
  { id: 'group', nodes: ['total', 'by-group'], paths: ['to-group'] },
  { id: 'service', nodes: ['total', 'by-service'], paths: ['to-service'] },
  { id: 'region', nodes: ['total', 'by-region'], paths: ['to-region'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CostAnalysisDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-cost-analysis-arrow`
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
      scenarios={costAnalysisScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 124' : '0 0 280 160'}>
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
