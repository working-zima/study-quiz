import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['emr-glue-athena'].diagrams['node-roles']

// 노드 셋과 분산 파일 시스템을 클러스터 박스 하나에 담는다. 그룹 경계는 시나리오와 무관하게 남긴다.
const groups = [
  { id: 'cluster', x: 4, y: 8, width: 272, height: 232 },
]

// 분산 파일 시스템은 코어 노드 바로 아래에 둔다. 코어가 회수되면 둘이 함께 흐려진다.
const nodes = [
  { id: 'primary', x: 82, y: 36, width: 116, color: 'stroke-diagram-managed' },
  { id: 'core', x: 20, y: 116, width: 108, color: 'stroke-diagram-managed' },
  { id: 'task', x: 152, y: 116, width: 108, color: 'stroke-diagram-managed' },
  { id: 'fs', x: 20, y: 196, width: 108, color: 'stroke-disabled' },
]

const paths: Record<string, string> = {
  'primary-core': 'M110 68 V116',
  'primary-task': 'M170 68 V116',
  'core-fs': 'M74 148 V196',
}

// 같은 자리를 장면마다 다른 곁말이 나눠 쓴다. 스팟은 두 장면에서 보인다.
const notes = [
  { id: 'manage', x: 204, y: 56, textAnchor: 'start' as const, scenarios: ['roles'] },
  { id: 'store', x: 80, y: 176, textAnchor: 'start' as const, scenarios: ['roles'] },
  { id: 'compute-only', x: 206, y: 168, textAnchor: 'middle' as const, scenarios: ['roles'] },
  { id: 'on-demand-primary', x: 204, y: 56, textAnchor: 'start' as const, scenarios: ['task-spot'] },
  { id: 'on-demand-core', x: 74, y: 168, textAnchor: 'middle' as const, scenarios: ['task-spot'] },
  { id: 'spot-task', x: 206, y: 168, textAnchor: 'middle' as const, scenarios: ['task-spot', 'core-spot'] },
  { id: 'core-reclaimed', x: 74, y: 168, textAnchor: 'middle' as const, scenarios: ['core-spot'] },
  { id: 'data-lost', x: 134, y: 216, textAnchor: 'start' as const, scenarios: ['core-spot'] },
  { id: 'general-primary', x: 204, y: 56, textAnchor: 'start' as const, scenarios: ['memory'] },
  { id: 'memory-core', x: 74, y: 168, textAnchor: 'middle' as const, scenarios: ['memory'] },
  { id: 'memory-task', x: 206, y: 168, textAnchor: 'middle' as const, scenarios: ['memory'] },
]

// 가로형은 프라이머리를 왼쪽에, 코어(위)·태스크(아래)를 가운데 열에, 분산 파일 시스템을 코어 오른쪽에 둔다.
const wideGroups = [
  { id: 'cluster', x: 4, y: 8, width: 432, height: 144 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'primary', x: 16, y: 64, width: 104 },
  { id: 'core', x: 168, y: 32, width: 104 },
  { id: 'task', x: 168, y: 104, width: 104 },
  { id: 'fs', x: 316, y: 32, width: 108 },
]

// 관리 화살표는 프라이머리의 위·아래 변에서 나와 꺾여 코어·태스크의 왼쪽 변으로 들어간다.
const widePaths: Record<string, string> = {
  'primary-core': 'M68 64 V48 H168',
  'primary-task': 'M68 96 V120 H168',
  'core-fs': 'M272 48 H316',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'manage', x: 68, y: 140, textAnchor: 'middle' as const },
  { id: 'store', x: 220, y: 84, textAnchor: 'middle' as const },
  { id: 'compute-only', x: 280, y: 124, textAnchor: 'start' as const },
  { id: 'on-demand-primary', x: 68, y: 140, textAnchor: 'middle' as const },
  { id: 'on-demand-core', x: 220, y: 84, textAnchor: 'middle' as const },
  { id: 'spot-task', x: 280, y: 124, textAnchor: 'start' as const },
  { id: 'core-reclaimed', x: 220, y: 84, textAnchor: 'middle' as const },
  { id: 'data-lost', x: 370, y: 84, textAnchor: 'middle' as const },
  { id: 'general-primary', x: 68, y: 140, textAnchor: 'middle' as const },
  { id: 'memory-core', x: 220, y: 84, textAnchor: 'middle' as const },
  { id: 'memory-task', x: 280, y: 124, textAnchor: 'start' as const },
]

export const emrNodeRolesScenarios: DiagramScenario[] = [
  { id: 'roles', nodes: ['primary', 'core', 'task', 'fs'], paths: ['primary-core', 'primary-task', 'core-fs'] },
  { id: 'task-spot', nodes: ['primary', 'core', 'task', 'fs'], paths: [] },
  { id: 'core-spot', nodes: ['primary', 'task'], paths: [] },
  { id: 'memory', nodes: ['core', 'task'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EmrNodeRolesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-emr-node-roles-arrow`
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
      scenarios={emrNodeRolesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 248'}>
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
