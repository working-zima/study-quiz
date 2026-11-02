import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-identity'].diagrams['external-identities']

// 세로형은 위 줄에 테넌트 밖의 두 사용자를, 그 아래에 직원 테넌트를, 맨 아래 줄에 고객과 외부 테넌트를 둔다.
// 협력사 직원의 경로는 그룹 라벨을 피해 x 80으로 내려간다.
const groups = [
  { id: 'our-tenant', x: 8, y: 60, width: 264, height: 78 },
  { id: 'external-tenant', x: 124, y: 150, width: 148, height: 66 },
]
const nodes = [
  { id: 'partner', x: 16, y: 8, width: 104 },
  { id: 'other-tenant', x: 140, y: 8, width: 132 },
  { id: 'guest', x: 20, y: 84, width: 100 },
  { id: 'app', x: 156, y: 84, width: 100 },
  { id: 'customer', x: 8, y: 176, width: 72 },
  { id: 'customer-app', x: 134, y: 176, width: 128 },
]
const paths: Record<string, string> = {
  'b2b-1': 'M80 40 V84',
  'b2b-2': 'M120 100 H156',
  'direct': 'M206 40 V84',
  'consumer': 'M80 192 H134',
}
const notes = [
  { id: 'guest-note', x: 20, y: 130, textAnchor: 'start' as const, scenario: 'collaboration' },
  { id: 'trust-note', x: 214, y: 52, textAnchor: 'start' as const, scenario: 'direct-connect' },
  { id: 'hidden-note', x: 262, y: 130, textAnchor: 'end' as const, scenario: 'direct-connect' },
  { id: 'social-note', x: 8, y: 168, textAnchor: 'start' as const, scenario: 'customers' },
]

// 가로형은 왼쪽 열에 테넌트 밖의 사용자 셋을, 오른쪽에 테넌트 둘을 위아래로 둔다.
// 다른 테넌트의 사용자는 게스트 사용자 아래를 지나 앱과 리소스의 아래 변으로 올라간다.
const wideGroups = [
  { id: 'our-tenant', x: 156, y: 8, width: 276, height: 108 },
  { id: 'external-tenant', x: 156, y: 124, width: 276, height: 64 },
]
const wideNodes = [
  { id: 'partner', x: 8, y: 32, width: 132 },
  { id: 'other-tenant', x: 8, y: 80, width: 132 },
  { id: 'guest', x: 172, y: 32, width: 100 },
  { id: 'app', x: 320, y: 32, width: 100 },
  { id: 'customer', x: 8, y: 148, width: 132 },
  { id: 'customer-app', x: 172, y: 148, width: 128 },
]
const widePaths: Record<string, string> = {
  'b2b-1': 'M140 48 H172',
  'b2b-2': 'M272 48 H320',
  'direct': 'M140 96 H370 V64',
  'consumer': 'M140 164 H172',
}
const wideNotes = [
  { id: 'guest-note', x: 172, y: 78, textAnchor: 'start' as const, scenario: 'collaboration' },
  { id: 'trust-note', x: 172, y: 90, textAnchor: 'start' as const, scenario: 'direct-connect' },
  { id: 'hidden-note', x: 422, y: 110, textAnchor: 'end' as const, scenario: 'direct-connect' },
  { id: 'social-note', x: 8, y: 140, textAnchor: 'start' as const, scenario: 'customers' },
]

export const externalIdentitiesScenarios: DiagramScenario[] = [
  { id: 'collaboration', nodes: ['partner', 'guest', 'app'], paths: ['b2b-1', 'b2b-2'] },
  { id: 'direct-connect', nodes: ['other-tenant', 'app'], paths: ['direct'] },
  { id: 'customers', nodes: ['customer', 'customer-app'], paths: ['consumer'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ExternalIdentitiesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-external-identities-arrow`
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
      scenarios={externalIdentitiesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 196' : '0 0 280 224'}>
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
