import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-monitoring'].diagrams['resource-health']

// 세로형은 원인 둘을 위에 나란히 두고, 두 화살표가 VM 1의 양옆으로 들어온다.
// VM 1 아래에 Resource Health를 두고, 지원 요청은 Resource Health 오른쪽에 둔다. 곁말은 Resource Health 바로 아래에 선다.
const nodes = [
  { id: 'platform-event', x: 16, y: 8, width: 104 },
  { id: 'user-action', x: 160, y: 8, width: 104 },
  { id: 'vm-1', x: 112, y: 72, width: 56 },
  { id: 'resource-health', x: 40, y: 128, width: 112 },
  { id: 'support', x: 192, y: 128, width: 72 },
]
const paths: Record<string, string> = {
  'platform-to-vm': 'M68 40 V88 H112',
  'user-to-vm': 'M212 40 V88 H168',
  'vm-to-rh': 'M140 104 V128',
  'rh-to-support': 'M152 144 H192',
}
const notes = [
  { id: 'platform-note', x: 96, y: 178, anchor: 'middle' as const, scenario: 'platform' },
  { id: 'user-note', x: 96, y: 178, anchor: 'middle' as const, scenario: 'user' },
]

// 가로형은 원인 둘을 왼쪽에 위아래로 쌓고, VM 1 → Resource Health → 지원 요청을 왼쪽에서 오른쪽으로 잇는다.
// 두 원인의 화살표는 x 130에서 꺾여 VM 1의 왼쪽 변 위아래로 들어온다.
const wideNodes = [
  { id: 'platform-event', x: 8, y: 8, width: 104 },
  { id: 'user-action', x: 8, y: 72, width: 104 },
  { id: 'vm-1', x: 148, y: 40, width: 56 },
  { id: 'resource-health', x: 228, y: 40, width: 112 },
  { id: 'support', x: 364, y: 40, width: 72 },
]
const widePaths: Record<string, string> = {
  'platform-to-vm': 'M112 24 H130 V48 H148',
  'user-to-vm': 'M112 88 H130 V64 H148',
  'vm-to-rh': 'M204 56 H228',
  'rh-to-support': 'M340 56 H364',
}
const wideNotes = [
  { id: 'platform-note', x: 284, y: 96, anchor: 'middle' as const, scenario: 'platform' },
  { id: 'user-note', x: 284, y: 96, anchor: 'middle' as const, scenario: 'user' },
]

export const resourceHealthScenarios: DiagramScenario[] = [
  { id: 'platform', nodes: ['platform-event', 'vm-1', 'resource-health', 'support'], paths: ['platform-to-vm', 'vm-to-rh', 'rh-to-support'] },
  { id: 'user', nodes: ['user-action', 'vm-1', 'resource-health'], paths: ['user-to-vm', 'vm-to-rh'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ResourceHealthDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-resource-health-arrow`
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
      scenarios={resourceHealthScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 112' : '0 0 280 186'}>
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
