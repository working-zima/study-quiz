import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-storage'].diagrams['access-tiers']

// 세로형은 온라인 계층 박스 아래에 오프라인 계층 박스를 두고, 네 계층을 위에서 아래로 쌓는다.
const groups = [
  { id: 'online', x: 8, y: 8, width: 264, height: 162 },
  { id: 'offline', x: 8, y: 186, width: 264, height: 66 },
]
const nodes = [
  { id: 'hot', x: 28, y: 32, width: 128 },
  { id: 'cool', x: 28, y: 80, width: 128 },
  { id: 'cold', x: 28, y: 128, width: 128 },
  { id: 'archive', x: 28, y: 210, width: 128 },
]
// 화살표는 오프라인 계층의 라벨 자리(x 86까지)보다 오른쪽을 지난다.
const paths: Record<string, string> = {
  'cost-1': 'M92 64 V80',
  'cost-2': 'M92 112 V128',
  'cost-3': 'M92 160 V210',
}
// 곁말은 그 시나리오에서만 보인다. 긴 곁말은 박스 아래에, 일수는 자기 노드 오른쪽에 둔다.
const notes = [
  { id: 'cost-storage-note', x: 18, y: 270, textAnchor: 'start' as const, scenarios: ['cost'] },
  { id: 'cost-read-note', x: 18, y: 284, textAnchor: 'start' as const, scenarios: ['cost'] },
  { id: 'cool-note', x: 164, y: 99, textAnchor: 'start' as const, scenarios: ['retention'] },
  { id: 'cold-note', x: 164, y: 147, textAnchor: 'start' as const, scenarios: ['retention'] },
  { id: 'archive-note', x: 164, y: 229, textAnchor: 'start' as const, scenarios: ['retention'] },
  { id: 'default-note', x: 18, y: 270, textAnchor: 'start' as const, scenarios: ['account-default'] },
]

// 가로형은 두 박스를 나란히 두고, 네 계층을 왼쪽에서 오른쪽으로 놓는다.
const wideGroups = [
  { id: 'online', x: 8, y: 8, width: 296, height: 74 },
  { id: 'offline', x: 320, y: 8, width: 112, height: 74 },
]
const wideNodes = [
  { id: 'hot', x: 20, y: 32, width: 80 },
  { id: 'cool', x: 116, y: 32, width: 80 },
  { id: 'cold', x: 212, y: 32, width: 80 },
  { id: 'archive', x: 332, y: 32, width: 88 },
]
const widePaths: Record<string, string> = {
  'cost-1': 'M100 48 H116',
  'cost-2': 'M196 48 H212',
  'cost-3': 'M292 48 H332',
}
// 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'cost-storage-note', x: 8, y: 98, textAnchor: 'start' as const },
  { id: 'cost-read-note', x: 224, y: 98, textAnchor: 'start' as const },
  { id: 'cool-note', x: 156, y: 76, textAnchor: 'middle' as const },
  { id: 'cold-note', x: 252, y: 76, textAnchor: 'middle' as const },
  { id: 'archive-note', x: 376, y: 76, textAnchor: 'middle' as const },
  { id: 'default-note', x: 432, y: 98, textAnchor: 'end' as const },
]

// 화살표는 데이터가 옮겨 가는 길이 아니라 비용이 달라지는 방향이다. 범례가 그 사실을 밝힌다.
export const accessTierScenarios: DiagramScenario[] = [
  { id: 'cost', nodes: ['hot', 'cool', 'cold', 'archive'], paths: ['cost-1', 'cost-2', 'cost-3'] },
  { id: 'retention', nodes: ['cool', 'cold', 'archive'], paths: [] },
  { id: 'account-default', nodes: ['hot', 'cool', 'cold'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AccessTierDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-access-tier-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={accessTierScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 106' : '0 0 280 292'}>
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
              {text.groups?.[group.id]}
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
