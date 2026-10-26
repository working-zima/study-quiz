import { useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['emr-glue-athena'].diagrams['cluster-cost']

// 위 박스는 하루, 아래 박스는 긴 작업 하나가 도는 동안이다. 그룹 경계는 시나리오와 무관하게 남긴다.
const groups = [
  { id: 'day', x: 4, y: 8, width: 272, height: 144 },
  { id: 'work', x: 4, y: 168, width: 272, height: 196 },
  { id: 'high', x: 12, y: 192, width: 124, height: 144 },
  { id: 'low', x: 144, y: 192, width: 124, height: 144 },
]

// 막대 길이는 시간 비율이 아니다. 일시적 클러스터가 작업과 같은 자리·같은 길이라는 것과 장기 실행이 더 길다는 것만 뜻이 있다.
const nodes = [
  { id: 'job', x: 16, y: 32, width: 100, color: 'stroke-disabled' },
  { id: 'long-running', x: 16, y: 72, width: 248, color: 'stroke-diagram-managed' },
  { id: 'transient', x: 16, y: 112, width: 100, color: 'stroke-diagram-managed' },
  { id: 'high-1', x: 24, y: 216, width: 100, color: 'stroke-diagram-managed' },
  { id: 'high-2', x: 24, y: 256, width: 100, color: 'stroke-diagram-managed' },
  { id: 'high-3', x: 24, y: 296, width: 100, color: 'stroke-diagram-managed' },
  { id: 'low-busy', x: 156, y: 216, width: 100, color: 'stroke-diagram-managed' },
  { id: 'low-idle-1', x: 156, y: 256, width: 100, color: 'stroke-diagram-managed' },
  { id: 'low-idle-2', x: 156, y: 296, width: 100, color: 'stroke-diagram-managed' },
]

const notes = [
  { id: 'idle-cost', x: 192, y: 52, textAnchor: 'middle' as const, scenarios: ['long-running'] },
  { id: 'ends-with-job', x: 124, y: 132, textAnchor: 'start' as const, scenarios: ['transient'] },
  { id: 'idle-nodes-cost', x: 206, y: 352, textAnchor: 'middle' as const, scenarios: ['no-scaling'] },
  { id: 'add-nodes', x: 74, y: 352, textAnchor: 'middle' as const, scenarios: ['managed'] },
  { id: 'remove-nodes', x: 206, y: 352, textAnchor: 'middle' as const, scenarios: ['managed'] },
]

// 가로형도 두 박스를 위아래로 둔다. 위 막대를 넓히고, 아래 두 칸의 노드를 한 줄로 편다.
const wideGroups = [
  { id: 'day', x: 4, y: 8, width: 432, height: 144 },
  { id: 'work', x: 4, y: 168, width: 432, height: 116 },
  { id: 'high', x: 12, y: 192, width: 204, height: 64 },
  { id: 'low', x: 224, y: 192, width: 204, height: 64 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'job', x: 16, y: 32, width: 140 },
  { id: 'long-running', x: 16, y: 72, width: 408 },
  { id: 'transient', x: 16, y: 112, width: 140 },
  { id: 'high-1', x: 22, y: 216, width: 58 },
  { id: 'high-2', x: 86, y: 216, width: 58 },
  { id: 'high-3', x: 150, y: 216, width: 58 },
  { id: 'low-busy', x: 234, y: 216, width: 58 },
  { id: 'low-idle-1', x: 298, y: 216, width: 58 },
  { id: 'low-idle-2', x: 362, y: 216, width: 58 },
]

// 곁말은 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'idle-cost', x: 290, y: 52, textAnchor: 'middle' as const },
  { id: 'ends-with-job', x: 164, y: 132, textAnchor: 'start' as const },
  { id: 'idle-nodes-cost', x: 326, y: 272, textAnchor: 'middle' as const },
  { id: 'add-nodes', x: 114, y: 272, textAnchor: 'middle' as const },
  { id: 'remove-nodes', x: 326, y: 272, textAnchor: 'middle' as const },
]

// 경로가 없는 도식이다. 장면은 노드의 opacity와 곁말로만 바뀐다.
export const emrClusterCostScenarios: DiagramScenario[] = [
  { id: 'long-running', nodes: ['job', 'long-running'], paths: [] },
  { id: 'transient', nodes: ['job', 'transient'], paths: [] },
  { id: 'no-scaling', nodes: ['high-1', 'high-2', 'high-3', 'low-busy', 'low-idle-1', 'low-idle-2'], paths: [] },
  { id: 'managed', nodes: ['high-1', 'high-2', 'high-3', 'low-busy'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EmrClusterCostDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={emrClusterCostScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 292' : '0 0 280 372'}>
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

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className={`fill-panel ${node.color}`} x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
