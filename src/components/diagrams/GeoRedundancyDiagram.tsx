import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-storage'].diagrams['geo-redundancy']

// 세로형은 주 지역을 위에, 보조 지역을 아래에, 읽는 앱을 맨 아래에 둔다.
const groups = [
  { id: 'primary', x: 4, y: 4, width: 272, height: 64 },
  { id: 'secondary', x: 4, y: 100, width: 272, height: 64 },
]
const nodes = [
  { id: 'primary-lrs', x: 10, y: 28, width: 144 },
  { id: 'primary-zrs', x: 160, y: 28, width: 108 },
  { id: 'secondary-lrs', x: 14, y: 124, width: 144 },
  { id: 'report-app', x: 40, y: 184, width: 80 },
]
// 경로는 그룹 라벨 자리(x 61까지)보다 오른쪽을 지나 보조 지역 노드에 닿는다.
const paths: Record<string, string> = {
  'replicate-grs': 'M80 60 V124',
  'replicate-gzrs': 'M214 60 V80 H120 V124',
  'read-secondary': 'M80 184 V156',
}
const notes = [
  { id: 'grs-note', x: 86, y: 92, textAnchor: 'start' as const, scenario: 'grs' },
  { id: 'gzrs-note', x: 126, y: 94, textAnchor: 'start' as const, scenario: 'gzrs' },
  { id: 'stale-note', x: 164, y: 144, textAnchor: 'start' as const, scenario: 'read-access' },
]

// 가로형은 주 지역을 왼쪽에, 보조 지역을 오른쪽에 두고 복제를 왼쪽에서 오른쪽으로 그린다. 읽는 앱은 보조 지역 아래에 둔다.
const wideGroups = [
  { id: 'primary', x: 8, y: 8, width: 176, height: 112 },
  { id: 'secondary', x: 256, y: 8, width: 176, height: 64 },
]
const wideNodes = [
  { id: 'primary-lrs', x: 20, y: 32, width: 152 },
  { id: 'primary-zrs', x: 20, y: 80, width: 152 },
  { id: 'secondary-lrs', x: 268, y: 32, width: 152 },
  { id: 'report-app', x: 344, y: 88, width: 76 },
]
const widePaths: Record<string, string> = {
  'replicate-grs': 'M172 44 H268',
  'replicate-gzrs': 'M172 96 H220 V56 H268',
  'read-secondary': 'M382 88 V64',
}
const wideNotes = [
  { id: 'grs-note', x: 187, y: 38, textAnchor: 'start' as const, scenario: 'grs' },
  { id: 'gzrs-note', x: 226, y: 88, textAnchor: 'start' as const, scenario: 'gzrs' },
  { id: 'stale-note', x: 420, y: 22, textAnchor: 'end' as const, scenario: 'read-access' },
]

export const geoRedundancyScenarios: DiagramScenario[] = [
  { id: 'grs', nodes: ['primary-lrs', 'secondary-lrs'], paths: ['replicate-grs'] },
  { id: 'gzrs', nodes: ['primary-zrs', 'secondary-lrs'], paths: ['replicate-gzrs'] },
  { id: 'read-access', nodes: ['report-app', 'primary-lrs', 'secondary-lrs'], paths: ['replicate-grs', 'read-secondary'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function GeoRedundancyDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-geo-redundancy-arrow`
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
      scenarios={geoRedundancyScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 128' : '0 0 280 224'}>
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
