import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-identity'].diagrams['conditional-access']

// 세로형은 신호 → 결정 → 적용 셋을 위에서 아래로 둔다. 적용으로 가는 경로는 결정의 아래 변에서 갈라진다.
const nodes = [
  { id: 'signals', x: 90, y: 24, width: 100 },
  { id: 'decision', x: 90, y: 88, width: 100 },
  { id: 'allow', x: 8, y: 168, width: 80 },
  { id: 'mfa', x: 92, y: 168, width: 96 },
  { id: 'block', x: 192, y: 168, width: 80 },
]
const paths: Record<string, string> = {
  'to-decision': 'M140 56 V88',
  'to-allow': 'M120 120 V144 H48 V168',
  'to-mfa': 'M140 120 V168',
  'to-block': 'M160 120 V144 H232 V168',
}
// owner가 있는 곁말은 늘 보이고 자기 노드의 opacity를 따른다(ADR-038). scenario가 있는 곁말은 그 장면에서만 보인다.
const notes = [
  { id: 'signals-note', x: 140, y: 16, textAnchor: 'middle' as const, owner: 'signals' },
  { id: 'usual-note', x: 148, y: 76, textAnchor: 'start' as const, scenario: 'usual' },
  { id: 'unusual-note', x: 148, y: 76, textAnchor: 'start' as const, scenario: 'unusual' },
  { id: 'risky-note', x: 148, y: 76, textAnchor: 'start' as const, scenario: 'risky' },
]

// 가로형은 신호 → 결정 → 적용 셋을 왼쪽에서 오른쪽으로 둔다. 적용 셋은 세로로 쌓고 결정의 오른쪽 변에서 갈라진다.
const wideNodes = [
  { id: 'signals', x: 8, y: 56, width: 76 },
  { id: 'decision', x: 176, y: 56, width: 84 },
  { id: 'allow', x: 320, y: 8, width: 112 },
  { id: 'mfa', x: 320, y: 56, width: 112 },
  { id: 'block', x: 320, y: 104, width: 112 },
]
const widePaths: Record<string, string> = {
  'to-decision': 'M84 72 H176',
  'to-allow': 'M260 64 H290 V24 H320',
  'to-mfa': 'M260 72 H320',
  'to-block': 'M260 80 H290 V120 H320',
}
const wideNotes = [
  { id: 'signals-note', x: 8, y: 48, textAnchor: 'start' as const, owner: 'signals' },
  { id: 'usual-note', x: 8, y: 102, textAnchor: 'start' as const, scenario: 'usual' },
  { id: 'unusual-note', x: 8, y: 102, textAnchor: 'start' as const, scenario: 'unusual' },
  { id: 'risky-note', x: 8, y: 102, textAnchor: 'start' as const, scenario: 'risky' },
]

export const conditionalAccessScenarios: DiagramScenario[] = [
  { id: 'usual', nodes: ['signals', 'decision', 'allow'], paths: ['to-decision', 'to-allow'] },
  { id: 'unusual', nodes: ['signals', 'decision', 'mfa'], paths: ['to-decision', 'to-mfa'] },
  { id: 'risky', nodes: ['signals', 'decision', 'block'], paths: ['to-decision', 'to-block'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ConditionalAccessDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-conditional-access-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  // 신호에서 결정으로 가는 경로는 늘 보인다.
  const visiblePaths = active ? active.paths : ['to-decision']
  const isDimmed = (id: string) => active !== null && !active.nodes.includes(id)
  const shownNotes = layoutNotes.filter((note) => note.owner !== undefined || (active !== null && note.scenario === active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={conditionalAccessScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 208'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {visiblePaths.map((id) => (
            <path key={id} data-path={id} d={layoutPaths[id]} className="fill-none stroke-title" strokeWidth="1.5" strokeLinejoin="round" markerEnd={`url(#${arrowId})`} />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={isDimmed(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text
              key={note.id}
              data-note={note.id}
              x={note.x}
              y={note.y}
              textAnchor={note.textAnchor}
              className="fill-muted"
              fontSize="9"
              opacity={note.owner === undefined ? undefined : isDimmed(note.owner) ? 0.25 : 1}
            >
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
