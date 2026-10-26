import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ecs-eks-fargate'].diagrams['ecs-roles']

// 큰 박스가 EC2 인스턴스 한 대다. 태스크 A·B가 그 안에서 돈다.
const groups = [
  { id: 'instance', x: 4, y: 64, width: 272, height: 80 },
]

// 위에 역할 둘, 가운데 인스턴스 박스, 그 아래 버킷, 맨 아래에 실행 역할 줄을 둔다.
const nodes = [
  { id: 'task-role', x: 12, y: 8, width: 116, color: 'stroke-diagram-managed' },
  { id: 'instance-role', x: 152, y: 8, width: 116, color: 'stroke-diagram-managed' },
  { id: 'task-a', x: 16, y: 96, width: 116, color: 'stroke-disabled' },
  { id: 'task-b', x: 148, y: 96, width: 116, color: 'stroke-disabled' },
  { id: 'bucket', x: 82, y: 168, width: 116, color: 'stroke-disabled' },
  { id: 'exec-role', x: 12, y: 232, width: 116, color: 'stroke-diagram-managed' },
  { id: 'image-log', x: 152, y: 232, width: 116, color: 'stroke-disabled' },
]

// 태스크 역할은 태스크 A 상자로, 인스턴스 역할은 박스의 위 변으로 들어간다 — 붙는 자리가 권한이 닿는 범위다.
const paths: Record<string, string> = {
  'task-role-task-a': 'M100 40 V96',
  'instance-role-instance': 'M210 40 V64',
  'task-a-bucket': 'M100 128 V168',
  'task-b-bucket': 'M180 128 V168',
  'exec-role-image-log': 'M128 248 H152',
}

// 권한이 어디까지 닿는지는 곁말 글자로만 보인다.
const notes = [
  { id: 'only-a', x: 140, y: 216, textAnchor: 'middle' as const, scenarios: ['task-role'] },
  { id: 'both', x: 140, y: 216, textAnchor: 'middle' as const, scenarios: ['instance-role'] },
  { id: 'no-app', x: 140, y: 274, textAnchor: 'middle' as const, scenarios: ['exec-role'] },
]

// 가로형은 역할 둘을 왼쪽 열에, 인스턴스 박스를 가운데에, 버킷을 오른쪽에, 실행 역할 줄을 맨 아래에 둔다.
const wideGroups = [
  { id: 'instance', x: 144, y: 8, width: 160, height: 128 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다. 태스크 A·B는 박스 안에서 위아래로 선다.
const wideNodes = [
  { id: 'task-role', x: 8, y: 24, width: 112 },
  { id: 'instance-role', x: 8, y: 88, width: 112 },
  { id: 'task-a', x: 156, y: 36, width: 136 },
  { id: 'task-b', x: 156, y: 88, width: 136 },
  { id: 'bucket', x: 328, y: 56, width: 104 },
  { id: 'exec-role', x: 8, y: 160, width: 112 },
  { id: 'image-log', x: 144, y: 160, width: 112 },
]

// 인스턴스 역할의 경로는 박스의 왼쪽 변에서 끝난다. 버킷으로 가는 두 경로는 박스 밖 통로(x 310)에서 꺾인다.
const widePaths: Record<string, string> = {
  'task-role-task-a': 'M120 40 H156',
  'instance-role-instance': 'M120 104 H144',
  'task-a-bucket': 'M292 52 H310 V64 H328',
  'task-b-bucket': 'M292 104 H310 V80 H328',
  'exec-role-image-log': 'M120 176 H144',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'only-a', x: 380, y: 104, textAnchor: 'middle' as const },
  { id: 'both', x: 380, y: 104, textAnchor: 'middle' as const },
  { id: 'no-app', x: 264, y: 180, textAnchor: 'start' as const },
]

export const ecsRolesScenarios: DiagramScenario[] = [
  { id: 'task-role', nodes: ['task-role', 'task-a', 'bucket'], paths: ['task-role-task-a', 'task-a-bucket'] },
  { id: 'instance-role', nodes: ['instance-role', 'task-a', 'task-b', 'bucket'], paths: ['instance-role-instance', 'task-a-bucket', 'task-b-bucket'] },
  { id: 'exec-role', nodes: ['exec-role', 'image-log'], paths: ['exec-role-image-log'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EcsRolesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ecs-roles-arrow`
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
      scenarios={ecsRolesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 280'}>
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
