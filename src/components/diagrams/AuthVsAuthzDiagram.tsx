import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-identity'].diagrams['auth-vs-authz']

// 세로형은 네 단계를 위에서 아래로 쌓는다. 긴 곁말이 오른쪽에 들어가도록 상자를 왼쪽으로 붙인다.
const nodes = [
  { id: 'user', x: 40, y: 8, width: 100 },
  { id: 'authn', x: 40, y: 72, width: 100 },
  { id: 'authz', x: 40, y: 136, width: 100 },
  { id: 'resource', x: 40, y: 200, width: 100 },
]
const paths: Record<string, string> = {
  'step-1': 'M90 40 V72',
  'step-2': 'M90 104 V136',
  'step-3': 'M90 168 V200',
}
// owner가 있는 곁말은 늘 보이고 자기 노드의 opacity를 따른다(ADR-038). scenario가 있는 곁말은 그 장면에서만 보인다.
const notes = [
  { id: 'authn-question', x: 148, y: 84, textAnchor: 'start' as const, owner: 'authn' },
  { id: 'authz-question', x: 148, y: 148, textAnchor: 'start' as const, owner: 'authz' },
  { id: 'credential-note', x: 148, y: 98, textAnchor: 'start' as const, scenario: 'authn-fail' },
  { id: 'signed-in-note', x: 148, y: 98, textAnchor: 'start' as const, scenario: 'authz-deny' },
  { id: 'denied-note', x: 148, y: 162, textAnchor: 'start' as const, scenario: 'authz-deny' },
]

// 가로형은 네 단계를 왼쪽에서 오른쪽으로 둔다. 단계가 묻는 말은 상자 위에, 장면의 곁말은 상자 아래에 둔다.
const wideNodes = [
  { id: 'user', x: 8, y: 24, width: 72 },
  { id: 'authn', x: 112, y: 24, width: 88 },
  { id: 'authz', x: 232, y: 24, width: 88 },
  { id: 'resource', x: 352, y: 24, width: 80 },
]
const widePaths: Record<string, string> = {
  'step-1': 'M80 40 H112',
  'step-2': 'M200 40 H232',
  'step-3': 'M320 40 H352',
}
const wideNotes = [
  { id: 'authn-question', x: 156, y: 16, textAnchor: 'middle' as const, owner: 'authn' },
  { id: 'authz-question', x: 276, y: 16, textAnchor: 'middle' as const, owner: 'authz' },
  { id: 'credential-note', x: 156, y: 70, textAnchor: 'middle' as const, scenario: 'authn-fail' },
  { id: 'signed-in-note', x: 156, y: 70, textAnchor: 'middle' as const, scenario: 'authz-deny' },
  { id: 'denied-note', x: 276, y: 70, textAnchor: 'middle' as const, scenario: 'authz-deny' },
]

export const authVsAuthzScenarios: DiagramScenario[] = [
  { id: 'authn-fail', nodes: ['user', 'authn'], paths: ['step-1'] },
  { id: 'authz-deny', nodes: ['user', 'authn', 'authz'], paths: ['step-1', 'step-2'] },
  { id: 'allowed', nodes: ['user', 'authn', 'authz', 'resource'], paths: ['step-1', 'step-2', 'step-3'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AuthVsAuthzDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-auth-vs-authz-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const isDimmed = (nodeId: string) => active !== null && !active.nodes.includes(nodeId)
  const shownNotes = layoutNotes.filter((note) => note.owner !== undefined || (active !== null && note.scenario === active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={authVsAuthzScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 80' : '0 0 280 240'}>
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
              opacity={note.owner === undefined ? undefined : isDimmed(note.owner) ? 0.25 : 1}
              className="fill-muted"
              fontSize="9"
            >
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
