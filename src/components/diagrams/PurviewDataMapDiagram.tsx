import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-governance'].diagrams['purview-data-map']

// 세로형은 회사 A의 데이터 안에 온-프레미스와 다른 클라우드를 위 줄 양 끝에, SaaS를 그 아래 가운데에 두고, Microsoft Purview를 그룹 아래에 둔다.
// 계보 화살표는 위 줄의 두 노드 사이를 곧게 지난다. 세 곳에서 Purview로 가는 화살표는 데이터를 옮기는 것이 아니라 정보가 모이는 방향이다.
const nodes = [
  { id: 'on-prem', x: 16, y: 30, width: 80 },
  { id: 'other-cloud', x: 176, y: 30, width: 88 },
  { id: 'saas', x: 112, y: 74, width: 56 },
  { id: 'purview', x: 76, y: 150, width: 128 },
]
const paths: Record<string, string> = {
  'on-prem-to-purview': 'M56 62 V166 H76',
  'cloud-to-purview': 'M220 62 V166 H204',
  'saas-to-purview': 'M140 106 V150',
  'lineage': 'M96 46 H176',
}
const groups = [
  { id: 'company-data', x: 8, y: 8, width: 264, height: 106 },
]
const notes = [
  { id: 'discover-note', x: 140, y: 198, anchor: 'middle' as const, scenario: 'discover' },
  { id: 'classify-note', x: 140, y: 198, anchor: 'middle' as const, scenario: 'classify' },
  { id: 'lineage-note', x: 140, y: 198, anchor: 'middle' as const, scenario: 'lineage' },
]

// 가로형은 세 곳을 한 줄에 두고 Microsoft Purview를 그 아래 가운데에 둔다.
const wideNodes = [
  { id: 'on-prem', x: 24, y: 30, width: 80 },
  { id: 'other-cloud', x: 176, y: 30, width: 88 },
  { id: 'saas', x: 336, y: 30, width: 80 },
  { id: 'purview', x: 156, y: 112, width: 128 },
]
const widePaths: Record<string, string> = {
  'on-prem-to-purview': 'M64 62 V128 H156',
  'cloud-to-purview': 'M220 62 V112',
  'saas-to-purview': 'M376 62 V128 H284',
  'lineage': 'M104 46 H176',
}
const wideGroups = [
  { id: 'company-data', x: 8, y: 8, width: 424, height: 64 },
]
const wideNotes = [
  { id: 'discover-note', x: 220, y: 164, anchor: 'middle' as const, scenario: 'discover' },
  { id: 'classify-note', x: 220, y: 164, anchor: 'middle' as const, scenario: 'classify' },
  { id: 'lineage-note', x: 220, y: 164, anchor: 'middle' as const, scenario: 'lineage' },
]

export const purviewDataMapScenarios: DiagramScenario[] = [
  { id: 'discover', nodes: ['on-prem', 'other-cloud', 'saas', 'purview'], paths: ['on-prem-to-purview', 'cloud-to-purview', 'saas-to-purview'] },
  { id: 'classify', nodes: ['on-prem', 'purview'], paths: ['on-prem-to-purview'] },
  { id: 'lineage', nodes: ['on-prem', 'other-cloud', 'purview'], paths: ['lineage'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PurviewDataMapDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-purview-data-map-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={purviewDataMapScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 172' : '0 0 280 208'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-disabled" x={group.x} y={group.y} width={group.width} height={group.height} rx="4" strokeWidth="1.5" />
              <text data-group-label={group.id} className="fill-muted" x={group.x + 10} y={group.y + 14} fontSize="9">
                {text.groups![group.id]}
              </text>
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
