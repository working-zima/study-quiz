import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['iam-permissions'].diagrams['group-policy']

// 사용자 셋을 IAM 그룹 박스 하나에 담는다. 그룹 경계는 시나리오와 무관하게 남긴다.
const groups = [
  { id: 'group', x: 140, y: 56, width: 136, height: 152 },
]

// 그룹에 붙인 정책은 그룹 위, 사용자마다 직접 붙인 정책은 왼쪽 밖에 둔다.
const nodes = [
  { id: 'group-policy', x: 152, y: 8, width: 112, color: 'stroke-diagram-managed' },
  { id: 'policy-a', x: 12, y: 80, width: 104, color: 'stroke-diagram-managed' },
  { id: 'policy-b', x: 12, y: 124, width: 104, color: 'stroke-diagram-managed' },
  { id: 'policy-c', x: 12, y: 168, width: 104, color: 'stroke-diagram-managed' },
  { id: 'user-a', x: 152, y: 80, width: 112, color: 'stroke-disabled' },
  { id: 'user-b', x: 152, y: 124, width: 112, color: 'stroke-disabled' },
  { id: 'user-c', x: 152, y: 168, width: 112, color: 'stroke-disabled' },
]

// 그룹에 붙인 정책 화살표는 개별 사용자가 아니라 그룹 박스의 위 변에서 끝난다.
// 직접 붙인 정책 화살표는 그룹 박스의 왼쪽 변을 지나 각 사용자에 닿는다.
const paths: Record<string, string> = {
  'group-policy-group': 'M208 40 V56',
  'policy-a-user-a': 'M116 96 H152',
  'policy-b-user-b': 'M116 140 H152',
  'policy-c-user-c': 'M116 184 H152',
}

const notes = [
  { id: 'three-places', x: 64, y: 224, textAnchor: 'middle' as const, scenarios: ['per-user'] },
  { id: 'one-place', x: 208, y: 224, textAnchor: 'middle' as const, scenarios: ['group'] },
  { id: 'leftover', x: 64, y: 72, textAnchor: 'middle' as const, scenarios: ['leftover'] },
]

// 가로형은 사용자 셋을 그룹 안에 나란히 두고, 직접 붙인 정책을 그 위, 그룹에 붙인 정책을 왼쪽에 둔다.
const wideGroups = [
  { id: 'group', x: 156, y: 56, width: 280, height: 64 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'group-policy', x: 8, y: 80, width: 120 },
  { id: 'policy-a', x: 166, y: 8, width: 84 },
  { id: 'policy-b', x: 258, y: 8, width: 84 },
  { id: 'policy-c', x: 350, y: 8, width: 84 },
  { id: 'user-a', x: 170, y: 80, width: 76 },
  { id: 'user-b', x: 262, y: 80, width: 76 },
  { id: 'user-c', x: 354, y: 80, width: 76 },
]

// 그룹에 붙인 정책 화살표는 세로형처럼 사용자가 아니라 그룹 박스의 왼쪽 변에서 끝난다.
const widePaths: Record<string, string> = {
  'group-policy-group': 'M128 96 H156',
  'policy-a-user-a': 'M208 40 V80',
  'policy-b-user-b': 'M300 40 V80',
  'policy-c-user-c': 'M392 40 V80',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'three-places', x: 300, y: 140, textAnchor: 'middle' as const },
  { id: 'one-place', x: 300, y: 140, textAnchor: 'middle' as const },
  { id: 'leftover', x: 158, y: 28, textAnchor: 'end' as const },
]

export const groupPolicyScenarios: DiagramScenario[] = [
  {
    id: 'per-user',
    nodes: ['policy-a', 'policy-b', 'policy-c', 'user-a', 'user-b', 'user-c'],
    paths: ['policy-a-user-a', 'policy-b-user-b', 'policy-c-user-c'],
  },
  { id: 'group', nodes: ['group-policy', 'user-a', 'user-b', 'user-c'], paths: ['group-policy-group'] },
  {
    id: 'leftover',
    nodes: ['group-policy', 'policy-a', 'user-a', 'user-b', 'user-c'],
    paths: ['group-policy-group', 'policy-a-user-a'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function GroupPolicyDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-group-policy-arrow`
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
      scenarios={groupPolicyScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 148' : '0 0 280 232'}>
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
