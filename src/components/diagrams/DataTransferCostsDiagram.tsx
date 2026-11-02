import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cost-factors'].diagrams['data-transfer-costs']

// 세로형은 Azure 밖을 위에, 두 지역을 아래에 나란히 둔다. 들어오고 나가는 경로는 그룹 라벨 자리(x 50까지)보다 오른쪽을 지난다.
const groups = [
  { id: 'region-a', x: 8, y: 72, width: 124, height: 80 },
  { id: 'region-b', x: 148, y: 72, width: 124, height: 80 },
]
const nodes = [
  { id: 'outside', x: 20, y: 8, width: 100 },
  { id: 'vm-1', x: 20, y: 104, width: 100 },
  { id: 'vm-2', x: 160, y: 104, width: 100 },
]
const paths: Record<string, string> = {
  'inbound': 'M56 40 V104',
  'outbound': 'M92 104 V40',
  'between': 'M120 120 H160',
}
const notes = [
  { id: 'in-note', x: 128, y: 28, textAnchor: 'start' as const, scenario: 'in' },
  { id: 'out-note', x: 128, y: 28, textAnchor: 'start' as const, scenario: 'out' },
  { id: 'between-note', x: 140, y: 170, textAnchor: 'middle' as const, scenario: 'between' },
]

// 가로형은 Azure 밖, 지역 A, 지역 B를 왼쪽에서 오른쪽으로 잇는다.
const wideGroups = [
  { id: 'region-a', x: 136, y: 16, width: 130, height: 88 },
  { id: 'region-b', x: 302, y: 16, width: 130, height: 88 },
]
const wideNodes = [
  { id: 'outside', x: 8, y: 40, width: 88 },
  { id: 'vm-1', x: 150, y: 40, width: 100 },
  { id: 'vm-2', x: 316, y: 40, width: 100 },
]
const widePaths: Record<string, string> = {
  'inbound': 'M96 48 H150',
  'outbound': 'M150 64 H96',
  'between': 'M250 56 H316',
}
const wideNotes = [
  { id: 'in-note', x: 8, y: 122, textAnchor: 'start' as const, scenario: 'in' },
  { id: 'out-note', x: 8, y: 122, textAnchor: 'start' as const, scenario: 'out' },
  { id: 'between-note', x: 283, y: 122, textAnchor: 'middle' as const, scenario: 'between' },
]

export const dataTransferCostsScenarios: DiagramScenario[] = [
  { id: 'in', nodes: ['outside', 'vm-1'], paths: ['inbound'] },
  { id: 'out', nodes: ['outside', 'vm-1'], paths: ['outbound'] },
  { id: 'between', nodes: ['vm-1', 'vm-2'], paths: ['between'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DataTransferCostsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-data-transfer-costs-arrow`
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
      scenarios={dataTransferCostsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 132' : '0 0 280 180'}>
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
