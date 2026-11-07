import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-monitoring'].diagrams['advisor-recommendation']

// 세로형은 위에서 아래로 흐른다. 맨 위에 VM 1과 Defender for Cloud, 그 아래 Azure Advisor, 다시 아래에 비용·보안 권장 사항을 두고,
// 맨 아래 담당자가 비용 권장 사항을 받는다. VM 1의 화살표는 Advisor의 왼쪽 변으로 들어간다.
const nodes = [
  { id: 'vm-1', x: 24, y: 16, width: 56 },
  { id: 'defender', x: 132, y: 16, width: 128 },
  { id: 'advisor', x: 84, y: 88, width: 112 },
  { id: 'cost-rec', x: 16, y: 160, width: 100 },
  { id: 'security-rec', x: 164, y: 160, width: 100 },
  { id: 'admin', x: 38, y: 232, width: 56 },
]
const paths: Record<string, string> = {
  'vm-to-advisor': 'M52 48 V104 H84',
  'defender-to-advisor': 'M180 48 V88',
  'advisor-to-cost': 'M100 120 V160',
  'advisor-to-security': 'M180 120 V160',
  'cost-to-admin': 'M66 192 V232',
}
const notes = [
  { id: 'cost-note', x: 62, y: 212, anchor: 'middle' as const, scenario: 'cost' },
  { id: 'security-note', x: 272, y: 212, anchor: 'end' as const, scenario: 'security' },
  { id: 'act-note', x: 102, y: 252, anchor: 'start' as const, scenario: 'act' },
]

// 가로형은 왼쪽에서 오른쪽으로 흐른다. 왼쪽에 VM 1과 Defender for Cloud, 가운데 Azure Advisor, 오른쪽에 권장 사항 둘을 두고,
// 담당자는 비용 권장 사항 아래에 둔다. 두 출처의 화살표는 Advisor의 위·아래 변으로, 두 권장 사항으로 가는 화살표는 x 292에서 갈라진다.
const wideNodes = [
  { id: 'vm-1', x: 44, y: 24, width: 56 },
  { id: 'defender', x: 8, y: 88, width: 128 },
  { id: 'advisor', x: 164, y: 56, width: 112 },
  { id: 'cost-rec', x: 308, y: 88, width: 100 },
  { id: 'security-rec', x: 308, y: 24, width: 100 },
  { id: 'admin', x: 330, y: 152, width: 56 },
]
const widePaths: Record<string, string> = {
  'vm-to-advisor': 'M100 40 H190 V56',
  'defender-to-advisor': 'M136 104 H190 V88',
  'advisor-to-cost': 'M276 80 H292 V104 H308',
  'advisor-to-security': 'M276 64 H292 V40 H308',
  'cost-to-admin': 'M358 120 V152',
}
const wideNotes = [
  { id: 'cost-note', x: 304, y: 140, anchor: 'end' as const, scenario: 'cost' },
  { id: 'security-note', x: 8, y: 136, anchor: 'start' as const, scenario: 'security' },
  { id: 'act-note', x: 322, y: 172, anchor: 'end' as const, scenario: 'act' },
]

export const advisorRecommendationScenarios: DiagramScenario[] = [
  { id: 'cost', nodes: ['vm-1', 'advisor', 'cost-rec'], paths: ['vm-to-advisor', 'advisor-to-cost'] },
  { id: 'security', nodes: ['defender', 'advisor', 'security-rec'], paths: ['defender-to-advisor', 'advisor-to-security'] },
  { id: 'act', nodes: ['cost-rec', 'admin'], paths: ['cost-to-admin'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AdvisorRecommendationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-advisor-recommendation-arrow`
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
      scenarios={advisorRecommendationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 272'}>
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
