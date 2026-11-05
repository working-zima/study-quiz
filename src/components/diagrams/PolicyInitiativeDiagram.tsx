import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-governance'].diagrams['policy-initiative']

const nodes = [
  { id: 'def-1', x: 8, y: 8, width: 84 },
  { id: 'def-2', x: 98, y: 8, width: 84 },
  { id: 'def-3', x: 188, y: 8, width: 84 },
  { id: 'def-4', x: 8, y: 152, width: 100 },
  { id: 'initiative', x: 80, y: 88, width: 120 },
  { id: 'scope', x: 152, y: 152, width: 100 },
]
const paths: Record<string, string> = {
  'join-1': 'M50 40 V104 H80',
  'join-2': 'M140 40 V88',
  'join-3': 'M230 40 V104 H200',
  'join-4': 'M58 152 V136 H110 V120',
  'assign': 'M176 120 V152',
}
const notes = [
  { id: 'group-note', x: 140, y: 140, scenario: 'group' },
  { id: 'assign-note', x: 202, y: 200, scenario: 'assign' },
  { id: 'add-note', x: 202, y: 200, scenario: 'add' },
]

const wideNodes = [
  { id: 'def-1', x: 8, y: 8, width: 104 },
  { id: 'def-2', x: 8, y: 56, width: 104 },
  { id: 'def-3', x: 8, y: 104, width: 104 },
  { id: 'def-4', x: 8, y: 152, width: 104 },
  { id: 'initiative', x: 200, y: 80, width: 120 },
  { id: 'scope', x: 348, y: 80, width: 84 },
]
const widePaths: Record<string, string> = {
  'join-1': 'M112 24 H240 V80',
  'join-2': 'M112 72 H160 V88 H200',
  'join-3': 'M112 120 H160 V104 H200',
  'join-4': 'M112 168 H240 V112',
  'assign': 'M320 96 H348',
}
const wideNotes = [
  { id: 'group-note', x: 260, y: 140, scenario: 'group' },
  { id: 'assign-note', x: 390, y: 132, scenario: 'assign' },
  { id: 'add-note', x: 340, y: 140, scenario: 'add' },
]

export const policyInitiativeScenarios: DiagramScenario[] = [
  {"id": "group", "nodes": ["def-1", "def-2", "def-3", "initiative"], "paths": ["join-1", "join-2", "join-3"]},
  {"id": "assign", "nodes": ["initiative", "scope"], "paths": ["assign"]},
  {"id": "add", "nodes": ["def-4", "initiative", "scope"], "paths": ["join-4", "assign"]},
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PolicyInitiativeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-policy-initiative-arrow`
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
      scenarios={policyInitiativeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 212'}>
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
