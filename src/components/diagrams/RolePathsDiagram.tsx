import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['iam-permissions'].diagrams['role-paths']

// 맡는 쪽이 있는 곳 둘만 박스로 둔다. 역할과 수단이 어느 계정에 놓이는지는 본문이 말하지 않아 감싸지 않는다.
const groups = [
  { id: 'datacenter', x: 4, y: 56, width: 120, height: 60 },
  { id: 'other-account', x: 4, y: 132, width: 120, height: 60 },
]

// 줄마다 맡는 쪽을 왼쪽, 역할을 맡기는 수단을 오른쪽에 두고 IAM 역할을 맨 아래 오른쪽에 둔다.
const nodes = [
  { id: 'ec2', x: 16, y: 8, width: 92, color: 'stroke-disabled' },
  { id: 'profile', x: 152, y: 8, width: 116, color: 'stroke-diagram-managed' },
  { id: 'system', x: 16, y: 76, width: 92, color: 'stroke-disabled' },
  { id: 'roles-anywhere', x: 152, y: 76, width: 116, color: 'stroke-diagram-managed' },
  { id: 'workload', x: 16, y: 152, width: 92, color: 'stroke-disabled' },
  { id: 'trust', x: 152, y: 152, width: 116, color: 'stroke-diagram-managed' },
  { id: 'role', x: 152, y: 220, width: 116, color: 'stroke-diagram-managed' },
]

// 위 두 줄의 수단은 오른쪽 통로(x 274)로 내려가 역할의 오른쪽 변으로, 신뢰 정책은 곧게 위 변으로 들어간다.
const paths: Record<string, string> = {
  'ec2-profile': 'M108 24 H152',
  'profile-role': 'M268 24 H274 V236 H268',
  'system-ra': 'M108 92 H152',
  'ra-role': 'M268 92 H274 V236 H268',
  'workload-trust': 'M108 168 H152',
  'trust-role': 'M210 184 V220',
}

const notes = [
  { id: 'no-key', x: 62, y: 50, textAnchor: 'middle' as const, scenarios: ['instance-profile'] },
  { id: 'cert', x: 62, y: 128, textAnchor: 'middle' as const, scenarios: ['roles-anywhere'] },
  { id: 'temp', x: 210, y: 272, textAnchor: 'middle' as const, scenarios: ['instance-profile', 'roles-anywhere', 'trust-policy'] },
]

// 가로형은 열마다 맡는 쪽을 위, 수단을 가운데에 두고 IAM 역할을 아래 가운데에 둔다.
const wideGroups = [
  { id: 'datacenter', x: 152, y: 8, width: 136, height: 60 },
  { id: 'other-account', x: 296, y: 8, width: 136, height: 60 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'ec2', x: 28, y: 28, width: 96 },
  { id: 'system', x: 172, y: 28, width: 96 },
  { id: 'workload', x: 316, y: 28, width: 96 },
  { id: 'profile', x: 18, y: 96, width: 116 },
  { id: 'roles-anywhere', x: 162, y: 96, width: 116 },
  { id: 'trust', x: 306, y: 96, width: 116 },
  { id: 'role', x: 162, y: 168, width: 116 },
]

// 왼쪽·오른쪽 열은 수단 아래에서 꺾여 역할의 옆 변으로, 가운데 열은 곧게 위 변으로 들어간다.
const widePaths: Record<string, string> = {
  'ec2-profile': 'M76 60 V96',
  'profile-role': 'M76 128 V184 H162',
  'system-ra': 'M220 60 V96',
  'ra-role': 'M220 128 V168',
  'workload-trust': 'M364 60 V96',
  'trust-role': 'M364 128 V184 H278',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'no-key', x: 76, y: 20, textAnchor: 'middle' as const },
  { id: 'cert', x: 228, y: 82, textAnchor: 'start' as const },
  { id: 'temp', x: 220, y: 216, textAnchor: 'middle' as const },
]

export const rolePathsScenarios: DiagramScenario[] = [
  { id: 'instance-profile', nodes: ['ec2', 'profile', 'role'], paths: ['ec2-profile', 'profile-role'] },
  { id: 'roles-anywhere', nodes: ['system', 'roles-anywhere', 'role'], paths: ['system-ra', 'ra-role'] },
  { id: 'trust-policy', nodes: ['workload', 'trust', 'role'], paths: ['workload-trust', 'trust-role'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RolePathsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-role-paths-arrow`
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
      scenarios={rolePathsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 224' : '0 0 280 280'}>
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
