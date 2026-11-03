import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cost-management'].diagrams['spending-limit']

// 세로형은 크레딧과 지출 한도를 위에 세우고 그 아래로 VM 1과 스토리지 계정을 나눈다. 업그레이드는 VM 1 아래에 있다.
const nodes = [
  { id: 'credit', x: 90, y: 8, width: 100 },
  { id: 'limit', x: 90, y: 64, width: 100 },
  { id: 'vm', x: 8, y: 120, width: 120 },
  { id: 'storage', x: 152, y: 120, width: 120 },
  { id: 'upgrade', x: 8, y: 180, width: 120 },
]
const paths: Record<string, string> = {
  'reach': 'M140 40 V64',
  'stop-vm': 'M120 96 V108 H68 V120',
  'read-only': 'M160 96 V108 H212 V120',
  'resume': 'M68 180 V152',
}
const notes = [
  { id: 'stop-note', x: 68, y: 166, anchor: 'middle' as const, scenario: 'reach' },
  { id: 'read-only-note', x: 212, y: 166, anchor: 'middle' as const, scenario: 'reach' },
  { id: 'resume-note', x: 140, y: 200, anchor: 'start' as const, scenario: 'upgrade' },
]

// 가로형은 왼쪽에서 오른쪽으로 흐르고, 지출 한도에서 위아래로 갈라진다. 업그레이드는 지출 한도 위에서 VM 1로 곧게 간다.
const wideNodes = [
  { id: 'credit', x: 8, y: 64, width: 64 },
  { id: 'limit', x: 88, y: 64, width: 80 },
  { id: 'vm', x: 192, y: 16, width: 88 },
  { id: 'storage', x: 192, y: 112, width: 96 },
  { id: 'upgrade', x: 88, y: 16, width: 80 },
]
const widePaths: Record<string, string> = {
  'reach': 'M72 80 H88',
  'stop-vm': 'M168 72 H180 V32 H192',
  'read-only': 'M168 88 H180 V128 H192',
  'resume': 'M168 32 H192',
}
const wideNotes = [
  { id: 'stop-note', x: 296, y: 36, anchor: 'start' as const, scenario: 'reach' },
  { id: 'read-only-note', x: 296, y: 132, anchor: 'start' as const, scenario: 'reach' },
  { id: 'resume-note', x: 296, y: 36, anchor: 'start' as const, scenario: 'upgrade' },
]

export const spendingLimitScenarios: DiagramScenario[] = [
  { id: 'reach', nodes: ['credit', 'limit', 'vm', 'storage'], paths: ['reach', 'stop-vm', 'read-only'] },
  { id: 'upgrade', nodes: ['upgrade', 'vm'], paths: ['resume'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SpendingLimitDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-spending-limit-arrow`
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
      scenarios={spendingLimitScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 220'}>
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
