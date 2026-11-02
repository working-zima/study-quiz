import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cost-factors'].diagrams['hybrid-benefit']

// 세로형은 회사가 가진 것을 위에, VM 요금을 아래에 둔다. 경로는 VM 요금의 그룹 라벨(왼쪽)을 피해 오른쪽 노드로 내려간다.
const groups = [
  { id: 'on-premises', x: 8, y: 8, width: 264, height: 72 },
  { id: 'vm-bill', x: 8, y: 104, width: 264, height: 72 },
]
const nodes = [
  { id: 'license', x: 24, y: 36, width: 232 },
  { id: 'compute', x: 24, y: 132, width: 104 },
  { id: 'os-license', x: 140, y: 132, width: 116 },
]
const paths: Record<string, string> = {
  'use-license': 'M198 68 V132',
}
const notes = [
  { id: 'without-note', x: 140, y: 194, scenario: 'without' },
  { id: 'with-note', x: 140, y: 194, scenario: 'with' },
]

// 가로형은 회사가 가진 것을 왼쪽에, VM 요금을 오른쪽에 두고 라이선스끼리 같은 줄에 세워 경로를 곧게 잇는다.
const wideGroups = [
  { id: 'on-premises', x: 8, y: 44, width: 192, height: 72 },
  { id: 'vm-bill', x: 232, y: 8, width: 200, height: 112 },
]
const wideNodes = [
  { id: 'license', x: 20, y: 76, width: 168 },
  { id: 'compute', x: 244, y: 32, width: 176 },
  { id: 'os-license', x: 244, y: 76, width: 176 },
]
const widePaths: Record<string, string> = {
  'use-license': 'M188 92 H244',
}
const wideNotes = [
  { id: 'without-note', x: 220, y: 138, scenario: 'without' },
  { id: 'with-note', x: 220, y: 138, scenario: 'with' },
]

export const hybridBenefitScenarios: DiagramScenario[] = [
  { id: 'without', nodes: ['compute', 'os-license'], paths: [] },
  { id: 'with', nodes: ['license', 'compute'], paths: ['use-license'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function HybridBenefitDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-hybrid-benefit-arrow`
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
      scenarios={hybridBenefitScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 148' : '0 0 280 204'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
