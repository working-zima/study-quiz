import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenario: string }

const text = visualsByTopicId['azure-governance'].diagrams['lock-types']

const nodes = [
  { id: 'owner', x: 90, y: 8, width: 100 },
  { id: 'vm-1', x: 90, y: 64, width: 100 },
  { id: 'read', x: 8, y: 152, width: 80 },
  { id: 'update', x: 100, y: 152, width: 80 },
  { id: 'delete', x: 192, y: 152, width: 80 },
]
const paths: Record<string, string> = {
  'owner-delete': 'M140 40 V64',
  'do-read': 'M112 96 V124 H48 V152',
  'do-update': 'M140 96 V152',
}
const notes: Note[] = [
  { id: 'delete-lock-note', x: 232, y: 202, anchor: 'middle', scenario: 'delete-lock' },
  { id: 'read-only-note', x: 186, y: 202, anchor: 'middle', scenario: 'read-only' },
  { id: 'owner-note', x: 150, y: 56, anchor: 'start', scenario: 'owner' },
]

const wideNodes = [
  { id: 'owner', x: 8, y: 72, width: 96 },
  { id: 'vm-1', x: 160, y: 72, width: 100 },
  { id: 'read', x: 320, y: 8, width: 100 },
  { id: 'update', x: 320, y: 72, width: 100 },
  { id: 'delete', x: 320, y: 136, width: 100 },
]
const widePaths: Record<string, string> = {
  'owner-delete': 'M104 88 H160',
  'do-read': 'M210 72 V24 H320',
  'do-update': 'M260 88 H320',
}
const wideNotes: Note[] = [
  { id: 'delete-lock-note', x: 370, y: 188, anchor: 'middle', scenario: 'delete-lock' },
  { id: 'read-only-note', x: 370, y: 188, anchor: 'middle', scenario: 'read-only' },
  { id: 'owner-note', x: 132, y: 62, anchor: 'middle', scenario: 'owner' },
]

export const lockTypesScenarios: DiagramScenario[] = [
  { id: 'delete-lock', nodes: ['vm-1', 'read', 'update'], paths: ['do-read', 'do-update'] },
  { id: 'read-only', nodes: ['vm-1', 'read'], paths: ['do-read'] },
  { id: 'owner', nodes: ['owner', 'vm-1'], paths: ['owner-delete'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LockTypesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-lock-types-arrow`
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
      scenarios={lockTypesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 212'}>
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
