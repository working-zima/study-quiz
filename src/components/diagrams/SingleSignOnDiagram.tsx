import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-identity'].diagrams['single-sign-on']

// 세로형은 직원 → Entra ID → 앱 셋을 위에서 아래로 둔다. 앱으로 가는 경로는 모두 Entra ID 아래 변에서 갈라진다.
const nodes = [
  { id: 'user', x: 90, y: 8, width: 100 },
  { id: 'entra', x: 66, y: 72, width: 148 },
  { id: 'app-1', x: 8, y: 160, width: 80 },
  { id: 'app-2', x: 100, y: 160, width: 80 },
  { id: 'app-3', x: 192, y: 160, width: 80 },
]
const paths: Record<string, string> = {
  'sign-in': 'M140 40 V72',
  'to-app-1': 'M120 104 V132 H48 V160',
  'to-app-2': 'M140 104 V160',
  'to-app-3': 'M160 104 V132 H232 V160',
}
const notes = [
  { id: 'once-note', x: 148, y: 60, textAnchor: 'start' as const, scenario: 'first' },
  { id: 'again-note', x: 140, y: 208, textAnchor: 'middle' as const, scenario: 'others' },
  { id: 'weak-note', x: 148, y: 60, textAnchor: 'start' as const, scenario: 'weak' },
]

// 가로형은 직원 → Entra ID → 앱 셋을 왼쪽에서 오른쪽으로 둔다. 앱 셋은 세로로 쌓고 Entra ID 오른쪽 변에서 갈라진다.
const wideNodes = [
  { id: 'user', x: 8, y: 56, width: 72 },
  { id: 'entra', x: 128, y: 56, width: 136 },
  { id: 'app-1', x: 340, y: 8, width: 92 },
  { id: 'app-2', x: 340, y: 56, width: 92 },
  { id: 'app-3', x: 340, y: 104, width: 92 },
]
const widePaths: Record<string, string> = {
  'sign-in': 'M80 72 H128',
  'to-app-1': 'M264 64 H302 V24 H340',
  'to-app-2': 'M264 72 H340',
  'to-app-3': 'M264 80 H302 V120 H340',
}
const wideNotes = [
  { id: 'once-note', x: 104, y: 48, textAnchor: 'middle' as const, scenario: 'first' },
  { id: 'again-note', x: 196, y: 108, textAnchor: 'middle' as const, scenario: 'others' },
  { id: 'weak-note', x: 104, y: 48, textAnchor: 'middle' as const, scenario: 'weak' },
]

export const singleSignOnScenarios: DiagramScenario[] = [
  { id: 'first', nodes: ['user', 'entra'], paths: ['sign-in'] },
  { id: 'others', nodes: ['entra', 'app-1', 'app-2', 'app-3'], paths: ['to-app-1', 'to-app-2', 'to-app-3'] },
  { id: 'weak', nodes: ['user', 'entra', 'app-1', 'app-2', 'app-3'], paths: ['sign-in', 'to-app-1', 'to-app-2', 'to-app-3'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SingleSignOnDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-single-sign-on-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = active ? layoutNotes.filter(({ scenario }) => scenario === active.id) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={singleSignOnScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 216'}>
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
