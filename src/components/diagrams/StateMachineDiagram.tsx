import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['api-gateway-step-functions'].diagrams['state-machine']

// 큰 박스 하나가 상태 머신 하나다. 그룹 경계는 시나리오와 무관하게 남긴다.
const groups = [
  { id: 'machine', x: 4, y: 64, width: 272, height: 104 },
]

// 맨 아래 노드는 견줘 볼 구성이라 어디서 시작되는지 본문에 없다. 경로를 잇지 않는다.
const nodes = [
  { id: 's3', x: 20, y: 8, width: 108, color: 'stroke-diagram-managed' },
  { id: 'rule', x: 152, y: 8, width: 108, color: 'stroke-diagram-managed' },
  { id: 'task-a', x: 12, y: 96, width: 76, color: 'stroke-diagram-managed' },
  { id: 'approval', x: 102, y: 96, width: 76, color: 'stroke-diagram-managed' },
  { id: 'task-b', x: 192, y: 96, width: 76, color: 'stroke-diagram-managed' },
  { id: 'one-lambda', x: 20, y: 200, width: 240, color: 'stroke-diagram-managed' },
]

// 실행 시작 경로는 S3 버킷 아래 통로(y 52)로 꺾어, 그룹 라벨 오른쪽(x 70)으로 내려간다.
// 재시도는 첫 태스크의 아래 변에서 나와 다시 아래 변으로 들어가는 고리다.
const paths: Record<string, string> = {
  's3-rule': 'M128 24 H152',
  'rule-task': 'M206 40 V52 H70 V96',
  'retry': 'M64 128 V144 H36 V128',
  'task-approval': 'M88 112 H102',
  'approval-task': 'M178 112 H192',
}

// per-upload와 up-to-year는 같은 자리를 쓰지만 서로 다른 시나리오에서만 보인다.
const notes = [
  { id: 'per-upload', x: 268, y: 78, textAnchor: 'end' as const, scenarios: ['start'] },
  { id: 'on-failure', x: 72, y: 150, textAnchor: 'start' as const, scenarios: ['retry'] },
  { id: 'up-to-year', x: 268, y: 78, textAnchor: 'end' as const, scenarios: ['one-lambda'] },
  { id: 'limit-15', x: 140, y: 248, textAnchor: 'middle' as const, scenarios: ['one-lambda'] },
]

// 가로형은 실행 시작을 한 줄로 왼쪽에서 오른쪽으로 들인다 — S3 버킷 → EventBridge 규칙 → 첫 태스크.
// 실행 시작 경로는 상태 머신 왼쪽 변을 수평선으로 지나 그룹 라벨 아래로 들어간다.
const wideGroups = [
  { id: 'machine', x: 196, y: 8, width: 240, height: 88 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 's3', x: 8, y: 32, width: 56 },
  { id: 'rule', x: 80, y: 32, width: 100 },
  { id: 'task-a', x: 204, y: 32, width: 56 },
  { id: 'approval', x: 276, y: 32, width: 76 },
  { id: 'task-b', x: 368, y: 32, width: 56 },
  { id: 'one-lambda', x: 196, y: 112, width: 240 },
]

const widePaths: Record<string, string> = {
  's3-rule': 'M64 48 H80',
  'rule-task': 'M180 48 H204',
  'retry': 'M240 64 V80 H216 V64',
  'task-approval': 'M260 48 H276',
  'approval-task': 'M352 48 H368',
}

// 곁말은 자리와 정렬만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'per-upload', x: 428, y: 22, textAnchor: 'end' as const },
  { id: 'on-failure', x: 248, y: 90, textAnchor: 'start' as const },
  { id: 'up-to-year', x: 428, y: 22, textAnchor: 'end' as const },
  { id: 'limit-15', x: 316, y: 160, textAnchor: 'middle' as const },
]

export const stateMachineScenarios: DiagramScenario[] = [
  { id: 'start', nodes: ['s3', 'rule', 'task-a'], paths: ['s3-rule', 'rule-task'] },
  { id: 'retry', nodes: ['task-a'], paths: ['retry'] },
  { id: 'approval', nodes: ['task-a', 'approval', 'task-b'], paths: ['task-approval', 'approval-task'] },
  { id: 'one-lambda', nodes: ['one-lambda'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function StateMachineDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-state-machine-arrow`
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
      scenarios={stateMachineScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 168' : '0 0 280 256'}>
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
