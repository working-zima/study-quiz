import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ecs-eks-fargate'].diagrams['eks-compute']

// 큰 박스는 파드가 올라가는 자리다. 위는 EC2 인스턴스 노드 하나, 아래는 Fargate의 격리된 환경 둘이다.
const groups = [
  { id: 'node', x: 4, y: 64, width: 272, height: 72 },
  { id: 'fg-1', x: 4, y: 216, width: 132, height: 64 },
  { id: 'fg-2', x: 144, y: 216, width: 132, height: 64 },
]

// 위에 컨트롤 플레인, 노드 박스 안에 파드 둘, 그 아래 Fargate 프로필, 격리된 환경마다 파드 하나.
const nodes = [
  { id: 'cp', x: 82, y: 8, width: 116, color: 'stroke-diagram-managed' },
  { id: 'pod-a', x: 24, y: 92, width: 104, color: 'stroke-disabled' },
  { id: 'pod-b', x: 152, y: 92, width: 104, color: 'stroke-disabled' },
  { id: 'profile', x: 82, y: 160, width: 116, color: 'stroke-disabled' },
  { id: 'pod-c', x: 16, y: 240, width: 108, color: 'stroke-disabled' },
  { id: 'pod-d', x: 156, y: 240, width: 108, color: 'stroke-disabled' },
]

// 경로는 모두 박스의 위 변에서 끝난다 — 파드가 그 박스 안에서 돈다는 뜻이다.
const paths: Record<string, string> = {
  'cp-node': 'M140 40 V64',
  'profile-fg-1': 'M110 192 V216',
  'profile-fg-2': 'M190 192 V204 H230 V216',
}

// 누가 관리하는지는 곁말 글자로만 보인다. 자체 관리형과 관리형 노드 그룹은 그림이 같고 이 곁말만 다르다.
const notes = [
  { id: 'self', x: 140, y: 152, textAnchor: 'middle' as const, scenarios: ['self'] },
  { id: 'managed', x: 140, y: 152, textAnchor: 'middle' as const, scenarios: ['managed'] },
  { id: 'fargate', x: 140, y: 296, textAnchor: 'middle' as const, scenarios: ['fargate'] },
]

// 가로형은 컨트롤 플레인을 왼쪽에, 노드 박스를 가운데에, Fargate 프로필과 격리된 환경 둘을 오른쪽에 둔다.
const wideGroups = [
  { id: 'node', x: 128, y: 40, width: 144, height: 120 },
  { id: 'fg-1', x: 288, y: 64, width: 70, height: 64 },
  { id: 'fg-2', x: 366, y: 64, width: 70, height: 64 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다. 노드 박스 안의 파드 둘은 위아래로 쌓는다.
const wideNodes = [
  { id: 'cp', x: 8, y: 84, width: 104 },
  { id: 'pod-a', x: 148, y: 68, width: 104 },
  { id: 'pod-b', x: 148, y: 112, width: 104 },
  { id: 'profile', x: 300, y: 8, width: 124 },
  { id: 'pod-c', x: 296, y: 88, width: 54 },
  { id: 'pod-d', x: 374, y: 88, width: 54 },
]

const widePaths: Record<string, string> = {
  'cp-node': 'M112 100 H128',
  'profile-fg-1': 'M352 40 V64',
  'profile-fg-2': 'M410 40 V64',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'self', x: 200, y: 184, textAnchor: 'middle' as const },
  { id: 'managed', x: 200, y: 184, textAnchor: 'middle' as const },
  { id: 'fargate', x: 362, y: 148, textAnchor: 'middle' as const },
]

export const eksComputeScenarios: DiagramScenario[] = [
  { id: 'self', nodes: ['cp', 'pod-a', 'pod-b'], paths: ['cp-node'] },
  { id: 'managed', nodes: ['cp', 'pod-a', 'pod-b'], paths: ['cp-node'] },
  { id: 'fargate', nodes: ['cp', 'profile', 'pod-c', 'pod-d'], paths: ['profile-fg-1', 'profile-fg-2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EksComputeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-eks-compute-arrow`
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
      scenarios={eksComputeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 304'}>
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
