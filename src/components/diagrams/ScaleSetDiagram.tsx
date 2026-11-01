import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-compute'].diagrams['scale-sets']

// 부하 분산 장치는 확장 집합 밖 왼쪽에, VM 넷은 확장 집합 안에 위아래로 쌓는다. 노드는 모두 회색이다.
const groups = [
  { id: 'scale-set', x: 124, y: 8, width: 148, height: 200 },
]
const nodes = [
  { id: 'lb', x: 8, y: 98, width: 96 },
  { id: 'vm-1', x: 136, y: 32, width: 56 },
  { id: 'vm-2', x: 136, y: 76, width: 56 },
  { id: 'vm-3', x: 136, y: 120, width: 56 },
  { id: 'vm-4', x: 136, y: 164, width: 56 },
]

// 경로마다 부하 분산 장치 오른쪽 변의 다른 점에서 나와, 서로 겹치지 않는 세로선을 지나 VM 왼쪽 변에 닿는다.
const paths: Record<string, string> = {
  'to-vm-1': 'M104 102 H110 V48 H136',
  'to-vm-2': 'M104 110 H116 V92 H136',
  'to-vm-3': 'M104 118 H116 V136 H136',
  'to-vm-4': 'M104 126 H110 V180 H136',
}
// 곁말은 더해진 VM 오른쪽, 확장 집합 안에 둔다.
const notes = [
  { id: 'vm-3-note', x: 200, y: 140, textAnchor: 'start' as const },
  { id: 'vm-4-note', x: 200, y: 184, textAnchor: 'start' as const },
]

// 가로형은 부하 분산 장치를 위에, VM 넷을 확장 집합 안에 한 줄로 둔다. 바깥쪽 VM으로 가는 경로가 더 높은 줄을 지나 서로 엇갈리지 않는다.
const wideGroups = [
  { id: 'scale-set', x: 8, y: 64, width: 424, height: 84 },
]
const wideNodes = [
  { id: 'lb', x: 160, y: 8, width: 120 },
  { id: 'vm-1', x: 56, y: 88, width: 72 },
  { id: 'vm-2', x: 152, y: 88, width: 72 },
  { id: 'vm-3', x: 248, y: 88, width: 72 },
  { id: 'vm-4', x: 344, y: 88, width: 72 },
]
const widePaths: Record<string, string> = {
  'to-vm-1': 'M168 40 V48 H92 V88',
  'to-vm-2': 'M200 40 V56 H188 V88',
  'to-vm-3': 'M240 40 V56 H284 V88',
  'to-vm-4': 'M272 40 V48 H380 V88',
}
const wideNotes = [
  { id: 'vm-3-note', x: 284, y: 136, textAnchor: 'middle' as const },
  { id: 'vm-4-note', x: 380, y: 136, textAnchor: 'middle' as const },
]

// 평소 VM 둘로 가는 경로는 늘 보인다. 사용자가 몰릴 때에만 더해진 VM 둘과 그리로 가는 경로가 나온다.
const basePaths = ['to-vm-1', 'to-vm-2']
const scenarioNotes: Record<string, string[]> = { peak: ['vm-3-note', 'vm-4-note'] }

export const scaleSetScenarios: DiagramScenario[] = [
  { id: 'normal', nodes: ['lb', 'vm-1', 'vm-2'], paths: basePaths },
  { id: 'peak', nodes: ['lb', 'vm-1', 'vm-2', 'vm-3', 'vm-4'], paths: ['to-vm-1', 'to-vm-2', 'to-vm-3', 'to-vm-4'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ScaleSetDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-scale-set-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : basePaths
  const shownNotes = layoutNotes.filter((note) => active !== null && (scenarioNotes[active.id] ?? []).includes(note.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={scaleSetScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 156' : '0 0 280 216'}>
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
            <path
              key={id}
              data-path={id}
              d={layoutPaths[id]}
              className="fill-none stroke-title"
              strokeWidth="1.5"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
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
