import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-security-model'].diagrams['defender-for-cloud']

// 세로형은 Defender for Cloud를 맨 위에 넓게 두고, Azure와 온-프레미스를 나란히, 다른 클라우드를 그 아래에 둔다. 아래 박스로 가는 화살표 둘은 위 두 박스 사이로 내려간다.
const groups = [
  { id: 'azure', x: 8, y: 64, width: 116, height: 66 },
  { id: 'on-premises', x: 156, y: 64, width: 116, height: 66 },
  { id: 'other-clouds', x: 8, y: 150, width: 264, height: 66 },
]
const nodes = [
  { id: 'defender', x: 8, y: 8, width: 264 },
  { id: 'azure-resource', x: 18, y: 90, width: 96 },
  { id: 'server', x: 166, y: 90, width: 96 },
  { id: 'aws', x: 88, y: 176, width: 60 },
  { id: 'gcp', x: 156, y: 176, width: 60 },
]
const paths: Record<string, string> = {
  'watch-azure': 'M66 40 V90',
  'watch-server': 'M236 40 V90',
  'watch-aws': 'M134 40 V168 H118 V176',
  'watch-gcp': 'M146 40 V168 H186 V176',
}
const notes = [
  { id: 'azure-note', x: 8, y: 144, textAnchor: 'start' as const, scenario: 'azure' },
  { id: 'hybrid-note', x: 272, y: 144, textAnchor: 'end' as const, scenario: 'hybrid' },
  { id: 'multicloud-note', x: 154, y: 144, textAnchor: 'start' as const, scenario: 'multicloud' },
]

// 가로형은 세 박스를 한 줄에 둔다. 화살표는 그룹 라벨을 피해 노드의 오른쪽 부분으로 곧게 내려간다.
const wideGroups = [
  { id: 'azure', x: 8, y: 72, width: 116, height: 66 },
  { id: 'on-premises', x: 136, y: 72, width: 116, height: 66 },
  { id: 'other-clouds', x: 264, y: 72, width: 168, height: 66 },
]
const wideNodes = [
  { id: 'defender', x: 40, y: 8, width: 360 },
  { id: 'azure-resource', x: 18, y: 98, width: 96 },
  { id: 'server', x: 146, y: 98, width: 96 },
  { id: 'aws', x: 274, y: 98, width: 76 },
  { id: 'gcp', x: 356, y: 98, width: 66 },
]
const widePaths: Record<string, string> = {
  'watch-azure': 'M66 40 V98',
  'watch-server': 'M224 40 V98',
  'watch-aws': 'M346 40 V98',
  'watch-gcp': 'M389 40 V98',
}
const wideNotes = [
  { id: 'azure-note', x: 8, y: 154, textAnchor: 'start' as const, scenario: 'azure' },
  { id: 'hybrid-note', x: 194, y: 154, textAnchor: 'middle' as const, scenario: 'hybrid' },
  { id: 'multicloud-note', x: 348, y: 154, textAnchor: 'middle' as const, scenario: 'multicloud' },
]

export const defenderForCloudScenarios: DiagramScenario[] = [
  { id: 'azure', nodes: ['defender', 'azure-resource'], paths: ['watch-azure'] },
  { id: 'hybrid', nodes: ['defender', 'server'], paths: ['watch-server'] },
  { id: 'multicloud', nodes: ['defender', 'aws', 'gcp'], paths: ['watch-aws', 'watch-gcp'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DefenderForCloudDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-defender-for-cloud-arrow`
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
      scenarios={defenderForCloudScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 164' : '0 0 280 224'}>
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
