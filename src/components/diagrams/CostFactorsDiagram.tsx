import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cost-factors'].diagrams['cost-factors']

// 세로형은 견줄 VM 둘을 위에, 요금을 가르는 요인 셋을 아래에 둔다. 경로는 VM 1 아래를 돌아 VM 2에 닿는다.
const nodes = [
  { id: 'vm-1', x: 16, y: 8, width: 104 },
  { id: 'vm-2', x: 160, y: 8, width: 104 },
  { id: 'region', x: 8, y: 104, width: 56 },
  { id: 'hours', x: 70, y: 104, width: 72 },
  { id: 'license', x: 148, y: 104, width: 124 },
]
const paths: Record<string, string> = {
  'region-to-vm': 'M36 104 V72 H184 V40',
  'hours-to-vm': 'M106 104 V72 H212 V40',
  'license-to-vm': 'M240 104 V40',
}
const notes = [
  { id: 'region-note', x: 8, y: 150, textAnchor: 'start' as const, scenario: 'region' },
  { id: 'hours-note', x: 106, y: 150, textAnchor: 'middle' as const, scenario: 'hours' },
  { id: 'license-note', x: 272, y: 150, textAnchor: 'end' as const, scenario: 'license' },
]

// 가로형도 VM 둘을 위에, 요인 셋을 아래에 두고 폭만 넓힌다.
const wideNodes = [
  { id: 'vm-1', x: 48, y: 8, width: 120 },
  { id: 'vm-2', x: 272, y: 8, width: 120 },
  { id: 'region', x: 16, y: 88, width: 96 },
  { id: 'hours', x: 164, y: 88, width: 112 },
  { id: 'license', x: 308, y: 88, width: 124 },
]
const widePaths: Record<string, string> = {
  'region-to-vm': 'M64 88 V64 H296 V40',
  'hours-to-vm': 'M220 88 V64 H340 V40',
  'license-to-vm': 'M372 88 V40',
}
const wideNotes = [
  { id: 'region-note', x: 16, y: 134, textAnchor: 'start' as const, scenario: 'region' },
  { id: 'hours-note', x: 220, y: 134, textAnchor: 'middle' as const, scenario: 'hours' },
  { id: 'license-note', x: 432, y: 134, textAnchor: 'end' as const, scenario: 'license' },
]

export const costFactorsScenarios: DiagramScenario[] = [
  { id: 'region', nodes: ['vm-1', 'vm-2', 'region'], paths: ['region-to-vm'] },
  { id: 'hours', nodes: ['vm-1', 'vm-2', 'hours'], paths: ['hours-to-vm'] },
  { id: 'license', nodes: ['vm-1', 'vm-2', 'license'], paths: ['license-to-vm'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CostFactorsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-cost-factors-arrow`
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
      scenarios={costFactorsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 160'}>
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
