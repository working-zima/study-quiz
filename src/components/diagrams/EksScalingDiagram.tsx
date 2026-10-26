import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ecs-eks-fargate'].diagrams['eks-scaling']

// 큰 박스는 이미 파드로 가득 찬 노드 하나다.
const groups = [
  { id: 'node', x: 4, y: 64, width: 160, height: 108 },
]

// 위 줄에 파드 오토스케일러와 대기 중인 파드, 가운데에 가득 찬 노드와 새 노드, 아래 줄에 확장 기능 둘.
// 새 노드는 그룹 박스가 아니라 노드 상자다 — 그룹 박스는 흐려지지 않아 처음부터 있는 것처럼 보인다.
const nodes = [
  { id: 'hpa', x: 8, y: 8, width: 156, color: 'stroke-disabled' },
  { id: 'pending', x: 180, y: 8, width: 92, color: 'stroke-disabled' },
  { id: 'pod-1', x: 16, y: 88, width: 136, color: 'stroke-disabled' },
  { id: 'pod-2', x: 16, y: 128, width: 136, color: 'stroke-disabled' },
  { id: 'new-node', x: 172, y: 104, width: 100, color: 'stroke-diagram-resource' },
  { id: 'ca', x: 8, y: 196, width: 148, color: 'stroke-disabled' },
  { id: 'asg', x: 164, y: 196, width: 108, color: 'stroke-disabled' },
]

// Auto Scaling 그룹에서는 경로가 나가지 않는다 — 대기 중인 파드를 모르기 때문이다.
const paths: Record<string, string> = {
  'hpa-pending': 'M164 24 H180',
  'pending-new-node': 'M226 40 V104',
  'ca-new-node': 'M150 196 V184 H222 V136',
}

// 판정은 곁말 글자로만 보인다.
const notes = [
  { id: 'waiting', x: 226, y: 56, textAnchor: 'middle' as const, scenarios: ['hpa-only'] },
  { id: 'added', x: 228, y: 168, textAnchor: 'start' as const, scenarios: ['with-ca'] },
  { id: 'unaware', x: 218, y: 244, textAnchor: 'middle' as const, scenarios: ['asg-only'] },
]

// 가로형은 같은 줄 구성을 왼쪽에서 오른쪽으로 펴고, 확장 기능 둘을 오른쪽 열에 위아래로 둔다.
const wideGroups = [
  { id: 'node', x: 4, y: 64, width: 168, height: 72 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다. 가득 찬 노드 박스 안의 파드 둘은 나란히 둔다.
const wideNodes = [
  { id: 'hpa', x: 8, y: 8, width: 156 },
  { id: 'pending', x: 196, y: 8, width: 92 },
  { id: 'pod-1', x: 16, y: 88, width: 68 },
  { id: 'pod-2', x: 92, y: 88, width: 68 },
  { id: 'new-node', x: 196, y: 88, width: 92 },
  { id: 'ca', x: 312, y: 88, width: 120 },
  { id: 'asg', x: 312, y: 136, width: 120 },
]

const widePaths: Record<string, string> = {
  'hpa-pending': 'M164 24 H196',
  'pending-new-node': 'M242 40 V88',
  'ca-new-node': 'M312 104 H288',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'waiting', x: 242, y: 60, textAnchor: 'middle' as const },
  { id: 'added', x: 300, y: 80, textAnchor: 'middle' as const },
  { id: 'unaware', x: 304, y: 156, textAnchor: 'end' as const },
]

export const eksScalingScenarios: DiagramScenario[] = [
  { id: 'hpa-only', nodes: ['hpa', 'pending', 'pod-1', 'pod-2'], paths: ['hpa-pending'] },
  { id: 'with-ca', nodes: ['pending', 'ca', 'new-node'], paths: ['ca-new-node', 'pending-new-node'] },
  { id: 'asg-only', nodes: ['asg', 'pending'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EksScalingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-eks-scaling-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={eksScalingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 252'}>
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

          {active?.paths.map((id) => (
            <path
              key={id}
              data-path={id}
              d={layoutPaths[id]}
              className="fill-none stroke-title"
              strokeWidth="2"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
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
