import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-identity'].diagrams['domain-services']

// 세로형은 온-프레미스 → Entra ID → 관리되는 도메인을 위에서 아래로 쌓고, 옛 앱을 박스 아래에 둔다.
// 도메인 컨트롤러 둘은 박스 안에 나란히 두어 동기화는 왼쪽(dc-1)으로, 옛 앱은 오른쪽(dc-2)으로 곧게 닿는다.
const groups = [
  { id: 'managed-domain', x: 8, y: 150, width: 264, height: 66 },
]
const nodes = [
  { id: 'on-prem-ad', x: 48, y: 8, width: 184 },
  { id: 'entra', x: 76, y: 88, width: 128 },
  { id: 'dc-1', x: 20, y: 176, width: 112 },
  { id: 'dc-2', x: 148, y: 176, width: 112 },
  { id: 'legacy-app', x: 168, y: 256, width: 72 },
]
const paths: Record<string, string> = {
  'hybrid-sync': 'M140 40 V88',
  'one-way': 'M104 120 V176',
  'app-auth': 'M204 256 V208',
}
const notes = [
  { id: 'azure-note', x: 262, y: 164, textAnchor: 'end' as const, scenario: 'managed' },
  { id: 'connect-note', x: 148, y: 68, textAnchor: 'start' as const, scenario: 'sync' },
  { id: 'one-way-note', x: 112, y: 140, textAnchor: 'start' as const, scenario: 'sync' },
  { id: 'app-auth-note', x: 196, y: 240, textAnchor: 'end' as const, scenario: 'legacy' },
]

// 가로형은 위 줄에 온-프레미스 → Entra ID를, 아래 줄에 옛 앱 → 관리되는 도메인을 둔다.
// 옛 앱의 경로가 dc-1을 지나지 않도록 dc-2를 왼쪽에, Entra ID 바로 아래에 dc-1을 둔다.
const wideGroups = [
  { id: 'managed-domain', x: 160, y: 84, width: 272, height: 64 },
]
const wideNodes = [
  { id: 'on-prem-ad', x: 8, y: 24, width: 184 },
  { id: 'entra', x: 272, y: 24, width: 128 },
  { id: 'dc-1', x: 296, y: 108, width: 112 },
  { id: 'dc-2', x: 172, y: 108, width: 112 },
  { id: 'legacy-app', x: 8, y: 108, width: 72 },
]
const widePaths: Record<string, string> = {
  'hybrid-sync': 'M192 40 H272',
  'one-way': 'M336 56 V108',
  'app-auth': 'M80 124 H172',
}
const wideNotes = [
  { id: 'azure-note', x: 422, y: 98, textAnchor: 'end' as const, scenario: 'managed' },
  { id: 'connect-note', x: 232, y: 16, textAnchor: 'middle' as const, scenario: 'sync' },
  { id: 'one-way-note', x: 328, y: 76, textAnchor: 'end' as const, scenario: 'sync' },
  { id: 'app-auth-note', x: 8, y: 100, textAnchor: 'start' as const, scenario: 'legacy' },
]

export const domainServicesScenarios: DiagramScenario[] = [
  { id: 'managed', nodes: ['dc-1', 'dc-2'], paths: [] },
  { id: 'sync', nodes: ['on-prem-ad', 'entra', 'dc-1'], paths: ['hybrid-sync', 'one-way'] },
  { id: 'legacy', nodes: ['legacy-app', 'dc-2'], paths: ['app-auth'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DomainServicesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-domain-services-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
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
      scenarios={domainServicesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 156' : '0 0 280 296'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>
          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
              {text.groups![group.id]}
            </text>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
