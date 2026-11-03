import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-governance'].diagrams['policy-check']

const nodes = [
  { id: 'request-a', x: 8, y: 8, width: 148 },
  { id: 'request-b', x: 8, y: 56, width: 148 },
  { id: 'rbac', x: 180, y: 56, width: 92 },
  { id: 'policy', x: 118, y: 136, width: 100 },
  { id: 'vm-1', x: 118, y: 224, width: 100 },
]
const groups = [
  { id: 'policy-rule', x: 40, y: 112, width: 232, height: 88 },
]
const paths: Record<string, string> = {
  'a-to-policy': 'M156 24 H168 V136',
  'b-to-rbac': 'M156 72 H180',
  'b-to-policy': 'M24 88 V152 H118',
  'create': 'M168 168 V224',
}
const notes = [
  { id: 'allowed-note', x: 168, y: 272, scenario: 'allowed' },
  { id: 'denied-note', x: 168, y: 186, scenario: 'denied' },
  { id: 'role-note', x: 226, y: 104, scenario: 'owner' },
  { id: 'owner-note', x: 168, y: 186, scenario: 'owner' },
]

const wideNodes = [
  { id: 'request-a', x: 8, y: 8, width: 168 },
  { id: 'request-b', x: 8, y: 88, width: 168 },
  { id: 'rbac', x: 8, y: 168, width: 168 },
  { id: 'policy', x: 260, y: 72, width: 112 },
  { id: 'vm-1', x: 296, y: 192, width: 100 },
]
const wideGroups = [
  { id: 'policy-rule', x: 200, y: 40, width: 232, height: 112 },
]
const widePaths: Record<string, string> = {
  'a-to-policy': 'M176 24 H188 V88 H260',
  'b-to-rbac': 'M92 120 V168',
  'b-to-policy': 'M176 104 H240 V88 H260',
  'create': 'M316 104 V192',
}
const wideNotes = [
  { id: 'allowed-note', x: 346, y: 240, scenario: 'allowed' },
  { id: 'denied-note', x: 316, y: 130, scenario: 'denied' },
  { id: 'role-note', x: 92, y: 216, scenario: 'owner' },
  { id: 'owner-note', x: 316, y: 130, scenario: 'owner' },
]

export const policyCheckScenarios: DiagramScenario[] = [
  {"id": "allowed", "nodes": ["request-a", "policy", "vm-1"], "paths": ["a-to-policy", "create"]},
  {"id": "denied", "nodes": ["request-b", "policy"], "paths": ["b-to-policy"]},
  {"id": "owner", "nodes": ["request-b", "rbac", "policy"], "paths": ["b-to-rbac", "b-to-policy"]},
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PolicyCheckDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-policy-check-arrow`
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
      scenarios={policyCheckScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 250' : '0 0 280 284'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
