import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenario: string }

const text = visualsByTopicId['azure-governance'].diagrams['lock-inheritance']

const nodes = [
  { id: 'admin', x: 90, y: 8, width: 100 },
  { id: 'rg-lock', x: 24, y: 80, width: 100 },
  { id: 'vm-lock', x: 156, y: 80, width: 108 },
  { id: 'disk-1', x: 24, y: 160, width: 100 },
  { id: 'vm-1', x: 156, y: 160, width: 108 },
]
const groups = [
  { id: 'rg-1', x: 8, y: 56, width: 264, height: 168 },
]
const paths: Record<string, string> = {
  'to-vm': 'M124 96 H140 V176 H156',
  'to-disk': 'M74 112 V160',
  'direct': 'M210 112 V160',
  'delete-rg': 'M140 40 V88 H124',
}
const notes: Note[] = [
  { id: 'inherit-note', x: 140, y: 212, anchor: 'middle', scenario: 'inherit' },
  { id: 'stack-note', x: 264, y: 212, anchor: 'end', scenario: 'stack' },
  { id: 'delete-group-note', x: 150, y: 52, anchor: 'start', scenario: 'delete-group' },
]

const wideNodes = [
  { id: 'admin', x: 8, y: 40, width: 88 },
  { id: 'rg-lock', x: 140, y: 40, width: 100 },
  { id: 'vm-lock', x: 300, y: 40, width: 116 },
  { id: 'disk-1', x: 140, y: 120, width: 100 },
  { id: 'vm-1', x: 300, y: 120, width: 116 },
]
const wideGroups = [
  { id: 'rg-1', x: 120, y: 8, width: 312, height: 176 },
]
const widePaths: Record<string, string> = {
  'to-vm': 'M240 56 H270 V136 H300',
  'to-disk': 'M190 72 V120',
  'direct': 'M358 72 V120',
  'delete-rg': 'M96 56 H140',
}
const wideNotes: Note[] = [
  { id: 'inherit-note', x: 270, y: 172, anchor: 'middle', scenario: 'inherit' },
  { id: 'stack-note', x: 416, y: 172, anchor: 'end', scenario: 'stack' },
  { id: 'delete-group-note', x: 56, y: 92, anchor: 'middle', scenario: 'delete-group' },
]

export const lockInheritanceScenarios: DiagramScenario[] = [
  { id: 'inherit', nodes: ['rg-lock', 'vm-1', 'disk-1'], paths: ['to-vm', 'to-disk'] },
  { id: 'stack', nodes: ['rg-lock', 'vm-lock', 'vm-1'], paths: ['to-vm', 'direct'] },
  { id: 'delete-group', nodes: ['admin', 'rg-lock'], paths: ['delete-rg'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LockInheritanceDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-lock-inheritance-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
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
      scenarios={lockInheritanceScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 232'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="6" className="fill-none stroke-disabled" strokeWidth="1.5" />
              <text data-group-label={group.id} x={group.x + 10} y={group.y + 14} fontSize="9" className="fill-muted">{text.groups![group.id]}</text>
            </g>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
