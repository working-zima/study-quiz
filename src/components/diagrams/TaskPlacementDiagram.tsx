import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ecs-eks-fargate'].diagrams['task-placement']

// 큰 박스 하나가 가용 영역 하나다. 셋을 나란히 두고 박스마다 태스크를 하나씩 넣는다.
const groups = [
  { id: 'az-a', x: 4, y: 64, width: 88, height: 72 },
  { id: 'az-b', x: 96, y: 64, width: 88, height: 72 },
  { id: 'az-c', x: 188, y: 64, width: 88, height: 72 },
]

// 위에 ECS 서비스, 아래 영역 박스마다 태스크 하나.
const nodes = [
  { id: 'service', x: 82, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'task-a', x: 12, y: 88, width: 76, color: 'stroke-disabled' },
  { id: 'task-b', x: 104, y: 88, width: 76, color: 'stroke-disabled' },
  { id: 'task-c', x: 196, y: 88, width: 76, color: 'stroke-disabled' },
]

// 영역 라벨이 박스 왼쪽 위에 있으므로 화살표는 박스의 오른쪽 부분으로 내려가 태스크의 위 변에 닿는다.
const paths: Record<string, string> = {
  'service-task-a': 'M90 40 V52 H80 V88',
  'service-task-b': 'M170 40 V88',
  'service-task-c': 'M198 24 H262 V88',
}

// 장애는 색이 아니라 영역 A 라벨 옆 곁말로 보인다.
const notes = [
  { id: 'down', x: 72, y: 78, textAnchor: 'start' as const, scenarios: ['az-down'] },
  { id: 'each', x: 140, y: 152, textAnchor: 'middle' as const, scenarios: ['spread'] },
  { id: 'continue', x: 140, y: 152, textAnchor: 'middle' as const, scenarios: ['az-down'] },
]

// 가로형도 영역 셋을 나란히 두고 박스만 넓힌다.
const wideGroups = [
  { id: 'az-a', x: 4, y: 64, width: 140, height: 72 },
  { id: 'az-b', x: 150, y: 64, width: 140, height: 72 },
  { id: 'az-c', x: 296, y: 64, width: 140, height: 72 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'service', x: 162, y: 8, width: 116 },
  { id: 'task-a', x: 40, y: 88, width: 96 },
  { id: 'task-b', x: 186, y: 88, width: 96 },
  { id: 'task-c', x: 332, y: 88, width: 96 },
]

const widePaths: Record<string, string> = {
  'service-task-a': 'M180 40 V52 H100 V88',
  'service-task-b': 'M240 40 V88',
  'service-task-c': 'M278 24 H400 V88',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'down', x: 72, y: 78, textAnchor: 'start' as const },
  { id: 'each', x: 220, y: 152, textAnchor: 'middle' as const },
  { id: 'continue', x: 220, y: 152, textAnchor: 'middle' as const },
]

export const taskPlacementScenarios: DiagramScenario[] = [
  { id: 'spread', nodes: ['service', 'task-a', 'task-b', 'task-c'], paths: ['service-task-a', 'service-task-b', 'service-task-c'] },
  { id: 'az-down', nodes: ['service', 'task-b', 'task-c'], paths: ['service-task-b', 'service-task-c'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TaskPlacementDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-task-placement-arrow`
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
      scenarios={taskPlacementScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 160'}>
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
