import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-security-model'].diagrams['sentinel-flow']

// 세로형은 다섯 단계를 위에서 아래로 쌓고, 곁말을 상자 오른쪽에 둔다.
const nodes = [
  { id: 'sources', x: 8, y: 8, width: 120 },
  { id: 'collect', x: 8, y: 64, width: 120 },
  { id: 'detect', x: 8, y: 120, width: 120 },
  { id: 'investigate', x: 8, y: 176, width: 120 },
  { id: 'respond', x: 8, y: 232, width: 120 },
]
const paths: Record<string, string> = {
  'flow-1': 'M68 40 V64',
  'flow-2': 'M68 96 V120',
  'flow-3': 'M68 152 V176',
  'flow-4': 'M68 208 V232',
}
const notes = [
  { id: 'collect-note', x: 136, y: 28, textAnchor: 'start' as const, scenario: 'collect' },
  { id: 'detect-note', x: 136, y: 168, textAnchor: 'start' as const, scenario: 'detect' },
  { id: 'respond-note', x: 136, y: 252, textAnchor: 'start' as const, scenario: 'respond' },
]

// 가로형은 다섯 단계를 한 줄로 잇고, 곁말을 상자 위에 둔다.
const wideNodes = [
  { id: 'sources', x: 8, y: 40, width: 108 },
  { id: 'collect', x: 134, y: 40, width: 60 },
  { id: 'detect', x: 212, y: 40, width: 60 },
  { id: 'investigate', x: 290, y: 40, width: 60 },
  { id: 'respond', x: 368, y: 40, width: 60 },
]
const widePaths: Record<string, string> = {
  'flow-1': 'M116 56 H134',
  'flow-2': 'M194 56 H212',
  'flow-3': 'M272 56 H290',
  'flow-4': 'M350 56 H368',
}
const wideNotes = [
  { id: 'collect-note', x: 120, y: 30, textAnchor: 'middle' as const, scenario: 'collect' },
  { id: 'detect-note', x: 281, y: 30, textAnchor: 'middle' as const, scenario: 'detect' },
  { id: 'respond-note', x: 385, y: 30, textAnchor: 'middle' as const, scenario: 'respond' },
]

// 경로 넷은 일의 차례라 어느 장면에서나 보인다. 장면이 가리키는 단계는 선명한 상자가 보인다.
const allPaths = ['flow-1', 'flow-2', 'flow-3', 'flow-4']

export const sentinelFlowScenarios: DiagramScenario[] = [
  { id: 'collect', nodes: ['sources', 'collect'], paths: allPaths },
  { id: 'detect', nodes: ['detect', 'investigate'], paths: allPaths },
  { id: 'respond', nodes: ['respond'], paths: allPaths },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SentinelFlowDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-sentinel-flow-arrow`
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
      scenarios={sentinelFlowScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 80' : '0 0 280 272'}>
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
