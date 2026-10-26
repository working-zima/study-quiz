import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ecs-eks-fargate'].diagrams['ecs-structure']

// 왼쪽 박스가 EC2 인스턴스, 오른쪽 박스가 Fargate다. 박스마다 태스크 둘이 위아래로 있다.
const groups = [
  { id: 'ec2', x: 4, y: 64, width: 132, height: 128 },
  { id: 'fargate', x: 144, y: 64, width: 132, height: 128 },
]

// 위에 태스크 정의 → 서비스를 두고, 그 아래 두 박스 안에 태스크를 둔다.
const nodes = [
  { id: 'taskdef', x: 12, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'service', x: 152, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'ec2-task-1', x: 16, y: 88, width: 108, color: 'stroke-disabled' },
  { id: 'ec2-task-2', x: 16, y: 136, width: 108, color: 'stroke-disabled' },
  { id: 'fg-task-1', x: 156, y: 88, width: 108, color: 'stroke-disabled' },
  { id: 'fg-task-2', x: 156, y: 136, width: 108, color: 'stroke-disabled' },
]

// 서비스에서 나가는 두 경로는 박스의 위 변에서 끝난다 — 태스크가 그 박스 안에서 돈다는 뜻이다.
// 다시 시작하는 경로는 두 박스 사이 통로(x 140)로 내려간다. 장면 하나에 예 하나라 EC2 쪽에만 그린다.
const paths: Record<string, string> = {
  'taskdef-service': 'M128 24 H152',
  'service-ec2': 'M180 40 V52 H100 V64',
  'service-fargate': 'M230 40 V64',
  'restart': 'M152 32 H140 V152 H124',
}

// 누가 관리하는지와 멈춘 태스크는 곁말 글자로만 보인다.
// stopped는 두 태스크 상자 사이에 들므로 한글 글리프 윗선(기준선 위 8)이 위 상자 테두리에 닿지 않게 131에 둔다.
const notes = [
  { id: 'user-managed', x: 70, y: 208, textAnchor: 'middle' as const, scenarios: ['ec2'] },
  { id: 'aws-managed', x: 210, y: 208, textAnchor: 'middle' as const, scenarios: ['fargate'] },
  { id: 'stopped', x: 70, y: 131, textAnchor: 'middle' as const, scenarios: ['restart'] },
  { id: 'restarted', x: 70, y: 184, textAnchor: 'middle' as const, scenarios: ['restart'] },
]

// 가로형은 태스크 정의 → 서비스를 왼쪽에 두고, 두 박스를 오른쪽에 위아래로 둔다.
const wideGroups = [
  { id: 'ec2', x: 244, y: 8, width: 192, height: 80 },
  { id: 'fargate', x: 244, y: 104, width: 192, height: 80 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다. EC2 박스에서는 새 태스크(ec2-task-2)가 왼쪽에 와서 다시 시작하는 화살표가 짧게 닿는다.
const wideNodes = [
  { id: 'taskdef', x: 8, y: 72, width: 100 },
  { id: 'service', x: 128, y: 72, width: 92 },
  { id: 'ec2-task-2', x: 256, y: 40, width: 84 },
  { id: 'ec2-task-1', x: 344, y: 40, width: 84 },
  { id: 'fg-task-1', x: 256, y: 136, width: 84 },
  { id: 'fg-task-2', x: 344, y: 136, width: 84 },
]

// 서비스에서 나가는 두 경로는 박스의 왼쪽 변에서 끝난다.
const widePaths: Record<string, string> = {
  'taskdef-service': 'M108 88 H128',
  'service-ec2': 'M174 72 V48 H244',
  'service-fargate': 'M174 104 V144 H244',
  'restart': 'M220 80 H236 V56 H256',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'user-managed', x: 428, y: 22, textAnchor: 'end' as const },
  { id: 'aws-managed', x: 428, y: 118, textAnchor: 'end' as const },
  { id: 'stopped', x: 386, y: 84, textAnchor: 'middle' as const },
  { id: 'restarted', x: 298, y: 84, textAnchor: 'middle' as const },
]

export const ecsStructureScenarios: DiagramScenario[] = [
  { id: 'ec2', nodes: ['taskdef', 'service', 'ec2-task-1', 'ec2-task-2'], paths: ['taskdef-service', 'service-ec2'] },
  { id: 'fargate', nodes: ['taskdef', 'service', 'fg-task-1', 'fg-task-2'], paths: ['taskdef-service', 'service-fargate'] },
  { id: 'restart', nodes: ['service', 'ec2-task-2'], paths: ['restart'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EcsStructureDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ecs-structure-arrow`
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
      scenarios={ecsStructureScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 216'}>
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
