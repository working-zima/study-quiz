import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['emr-glue-athena'].diagrams['runtime-role']

// 역할·인스턴스 프로파일·노드를 클러스터 박스 하나에 담는다. 그룹 경계는 시나리오와 무관하게 남긴다.
const groups = [
  { id: 'cluster', x: 4, y: 56, width: 272, height: 196 },
]

// 작업은 클러스터 위, S3 데이터와 보안 구성은 클러스터 아래 밖에 둔다.
const nodes = [
  { id: 'job-a', x: 36, y: 8, width: 92, color: 'stroke-disabled' },
  { id: 'job-b', x: 152, y: 8, width: 92, color: 'stroke-disabled' },
  { id: 'role-a', x: 36, y: 88, width: 92, color: 'stroke-diagram-managed' },
  { id: 'role-b', x: 152, y: 88, width: 92, color: 'stroke-diagram-managed' },
  { id: 'profile', x: 82, y: 144, width: 116, color: 'stroke-diagram-managed' },
  { id: 'node-1', x: 36, y: 200, width: 92, color: 'stroke-diagram-managed' },
  { id: 'node-2', x: 152, y: 200, width: 92, color: 'stroke-diagram-managed' },
  { id: 's3-a', x: 36, y: 280, width: 92, color: 'stroke-diagram-managed' },
  { id: 's3-b', x: 152, y: 280, width: 92, color: 'stroke-diagram-managed' },
  { id: 'security', x: 82, y: 336, width: 116, color: 'stroke-diagram-managed' },
]

// 기본 구성은 두 열 사이 통로로 인스턴스 프로파일을 지나고, 런타임 역할은 클러스터 안 바깥 통로로 내려가 프로파일을 거치지 않는다.
// 보안 구성 화살표는 개별 노드가 아니라 클러스터 박스의 아래 변에서 끝난다.
const paths: Record<string, string> = {
  'job-a-profile': 'M128 24 H136 V144',
  'job-b-profile': 'M152 24 H144 V144',
  'profile-s3-a': 'M136 176 V264 H82 V280',
  'profile-s3-b': 'M144 176 V264 H198 V280',
  'job-a-role-a': 'M82 40 V88',
  'job-b-role-b': 'M198 40 V88',
  'role-a-s3-a': 'M36 104 H24 V296 H36',
  'role-b-s3-b': 'M244 104 H256 V296 H244',
  'profile-role-a': 'M100 144 V120',
  'profile-role-b': 'M180 144 V120',
  'node-node': 'M128 216 H152',
  'security-cluster': 'M140 336 V252',
}

// 같은 권한·역할 인수는 인스턴스 프로파일 오른쪽 자리를 장면마다 나눠 쓴다.
const notes = [
  { id: 'same-permission', x: 206, y: 164, textAnchor: 'start' as const, scenarios: ['instance-profile'] },
  { id: 'per-job', x: 140, y: 76, textAnchor: 'middle' as const, scenarios: ['runtime-role'] },
  { id: 'assumes', x: 206, y: 164, textAnchor: 'start' as const, scenarios: ['trust'] },
  { id: 'in-transit', x: 140, y: 194, textAnchor: 'middle' as const, scenarios: ['encryption'] },
  { id: 'at-rest', x: 140, y: 246, textAnchor: 'middle' as const, scenarios: ['encryption'] },
]

// 가로형도 작업 · 클러스터 · S3의 세 층을 유지한다. 노드 둘은 클러스터 안 오른쪽에, 보안 구성은 오른쪽 아래 밖에 둔다.
const wideGroups = [
  { id: 'cluster', x: 4, y: 56, width: 432, height: 112 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'job-a', x: 40, y: 8, width: 92 },
  { id: 'job-b', x: 196, y: 8, width: 92 },
  { id: 'role-a', x: 40, y: 80, width: 92 },
  { id: 'role-b', x: 196, y: 80, width: 92 },
  { id: 'profile', x: 116, y: 124, width: 100 },
  { id: 'node-1', x: 312, y: 100, width: 48 },
  { id: 'node-2', x: 380, y: 100, width: 48 },
  { id: 's3-a', x: 40, y: 192, width: 92 },
  { id: 's3-b', x: 196, y: 192, width: 92 },
  { id: 'security', x: 320, y: 192, width: 104 },
]

// 경로가 모두 곧은 수직선이다. 보안 구성 화살표는 세로형처럼 클러스터 박스의 아래 변에서 끝난다.
const widePaths: Record<string, string> = {
  'job-a-profile': 'M132 24 H160 V124',
  'job-b-profile': 'M196 24 H172 V124',
  'profile-s3-a': 'M124 156 V192',
  'profile-s3-b': 'M208 156 V192',
  'job-a-role-a': 'M86 40 V80',
  'job-b-role-b': 'M242 40 V80',
  'role-a-s3-a': 'M60 112 V192',
  'role-b-s3-b': 'M268 112 V192',
  'profile-role-a': 'M124 124 V112',
  'profile-role-b': 'M208 124 V112',
  'node-node': 'M360 116 H380',
  'security-cluster': 'M372 192 V168',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'same-permission', x: 224, y: 144, textAnchor: 'start' as const },
  { id: 'per-job', x: 164, y: 72, textAnchor: 'middle' as const },
  { id: 'assumes', x: 224, y: 144, textAnchor: 'start' as const },
  { id: 'in-transit', x: 370, y: 94, textAnchor: 'middle' as const },
  { id: 'at-rest', x: 370, y: 152, textAnchor: 'middle' as const },
]

export const emrRuntimeRoleScenarios: DiagramScenario[] = [
  {
    id: 'instance-profile',
    nodes: ['job-a', 'job-b', 'profile', 's3-a', 's3-b'],
    paths: ['job-a-profile', 'job-b-profile', 'profile-s3-a', 'profile-s3-b'],
  },
  {
    id: 'runtime-role',
    nodes: ['job-a', 'job-b', 'role-a', 'role-b', 's3-a', 's3-b'],
    paths: ['job-a-role-a', 'job-b-role-b', 'role-a-s3-a', 'role-b-s3-b'],
  },
  { id: 'trust', nodes: ['profile', 'role-a', 'role-b'], paths: ['profile-role-a', 'profile-role-b'] },
  { id: 'encryption', nodes: ['security', 'node-1', 'node-2', 's3-a', 's3-b'], paths: ['security-cluster', 'node-node'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EmrRuntimeRoleDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-emr-runtime-role-arrow`
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
      scenarios={emrRuntimeRoleScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 376'}>
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
