import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-identity'].diagrams['entra-connect']

// 세로형은 온-프레미스를 위에, 클라우드를 아래에 쌓는다. 노드의 가운데를 x 140에 맞춰 경로를 곧게 둔다.
const groups = [
  { id: 'on-premises', x: 8, y: 8, width: 264, height: 124 },
  { id: 'cloud', x: 8, y: 168, width: 264, height: 124 },
]
const nodes = [
  { id: 'ad', x: 80, y: 32, width: 120 },
  { id: 'connect', x: 60, y: 88, width: 160 },
  { id: 'entra', x: 76, y: 192, width: 128 },
  { id: 'cloud-app', x: 90, y: 248, width: 100 },
]
const paths: Record<string, string> = {
  'sync-1': 'M140 64 V88',
  'sync-2': 'M140 120 V192',
  'sign-in': 'M140 224 V248',
}
const notes = [
  { id: 'separate-note', x: 140, y: 154, textAnchor: 'middle' as const, scenario: 'separate' },
  { id: 'sync-note', x: 148, y: 154, textAnchor: 'start' as const, scenario: 'synced' },
  { id: 'sign-in-note', x: 148, y: 240, textAnchor: 'start' as const, scenario: 'synced' },
]

// 가로형은 온-프레미스를 왼쪽에, 클라우드를 오른쪽에 둔다. 네 노드가 한 줄에 들어가지 않아 박스마다 두 단으로 쌓고,
// Connect와 Entra ID를 같은 줄에 두어 두 박스 사이의 경로를 곧게 둔다. 박스 사이가 곁말 「ID를 따로 두 벌 관리」보다 좁아 그 곁말은 박스 아래에 둔다.
const wideGroups = [
  { id: 'on-premises', x: 8, y: 8, width: 176, height: 124 },
  { id: 'cloud', x: 292, y: 8, width: 140, height: 124 },
]
const wideNodes = [
  { id: 'ad', x: 36, y: 32, width: 120 },
  { id: 'connect', x: 16, y: 88, width: 160 },
  { id: 'entra', x: 298, y: 88, width: 128 },
  { id: 'cloud-app', x: 304, y: 32, width: 116 },
]
const widePaths: Record<string, string> = {
  'sync-1': 'M96 64 V88',
  'sync-2': 'M176 104 H298',
  'sign-in': 'M328 88 V64',
}
const wideNotes = [
  { id: 'separate-note', x: 220, y: 150, textAnchor: 'middle' as const, scenario: 'separate' },
  { id: 'sync-note', x: 238, y: 96, textAnchor: 'middle' as const, scenario: 'synced' },
  { id: 'sign-in-note', x: 334, y: 80, textAnchor: 'start' as const, scenario: 'synced' },
]

export const entraConnectScenarios: DiagramScenario[] = [
  { id: 'separate', nodes: ['ad', 'entra'], paths: [] },
  { id: 'synced', nodes: ['ad', 'connect', 'entra', 'cloud-app'], paths: ['sync-1', 'sync-2', 'sign-in'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EntraConnectDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-entra-connect-arrow`
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
      scenarios={entraConnectScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 156' : '0 0 280 300'}>
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
