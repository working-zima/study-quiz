import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ecs-eks-fargate'].diagrams['pod-permissions']

// 큰 박스는 파드 둘이 함께 도는 노드 하나다.
const groups = [
  { id: 'node', x: 4, y: 192, width: 272, height: 72 },
]

// 위에 노드 IAM 역할과 OIDC 공급자, 오른쪽 열로 OIDC 공급자 → IAM 역할 → 서비스 계정, 왼쪽 열 가운데에 네트워크 정책.
// IAM 역할 둘과 OIDC 공급자만 파랑이고 쿠버네티스 쪽은 회색이다.
const nodes = [
  { id: 'node-role', x: 8, y: 8, width: 124, color: 'stroke-diagram-managed' },
  { id: 'oidc', x: 148, y: 8, width: 124, color: 'stroke-diagram-managed' },
  { id: 'irsa-role', x: 148, y: 72, width: 124, color: 'stroke-diagram-managed' },
  { id: 'netpol', x: 8, y: 136, width: 124, color: 'stroke-disabled' },
  { id: 'sa', x: 148, y: 136, width: 124, color: 'stroke-disabled' },
  { id: 'pod-b', x: 16, y: 216, width: 116, color: 'stroke-disabled' },
  { id: 'pod-a', x: 148, y: 216, width: 116, color: 'stroke-disabled' },
]

// 노드 IAM 역할의 화살표는 두 열 사이 통로(x 140)로 내려가 노드 박스의 위 변에서 끝난다 — 노드 전체에 붙는다는 뜻이다.
// 서비스 계정의 화살표는 파드 A에만 닿는다.
const paths: Record<string, string> = {
  'node-role-node': 'M132 24 H140 V192',
  'oidc-irsa-role': 'M210 40 V72',
  'irsa-role-sa': 'M210 104 V136',
  'sa-pod-a': 'M210 168 V216',
  'pod-b-pod-a': 'M132 232 H148',
}

// 판정은 곁말 글자로만 보인다.
const notes = [
  { id: 'all-pods', x: 140, y: 280, textAnchor: 'middle' as const, scenarios: ['node-role'] },
  { id: 'trust', x: 218, y: 60, textAnchor: 'start' as const, scenarios: ['irsa'] },
  { id: 'only-a', x: 140, y: 280, textAnchor: 'middle' as const, scenarios: ['irsa'] },
  { id: 'traffic-only', x: 70, y: 184, textAnchor: 'middle' as const, scenarios: ['netpol'] },
]

// 가로형은 노드 박스를 왼쪽에, 서비스 계정 ← IAM 역할을 오른쪽으로 펴고, OIDC 공급자를 IAM 역할 위에, 네트워크 정책을 서비스 계정 아래에 둔다.
const wideGroups = [
  { id: 'node', x: 4, y: 64, width: 196, height: 72 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다. 노드 박스 안의 파드 둘은 나란히 둔다.
const wideNodes = [
  { id: 'node-role', x: 8, y: 8, width: 120 },
  { id: 'oidc', x: 336, y: 24, width: 96 },
  { id: 'irsa-role', x: 336, y: 88, width: 96 },
  { id: 'sa', x: 224, y: 88, width: 96 },
  { id: 'netpol', x: 224, y: 144, width: 96 },
  { id: 'pod-b', x: 16, y: 88, width: 80 },
  { id: 'pod-a', x: 108, y: 88, width: 80 },
]

const widePaths: Record<string, string> = {
  'node-role-node': 'M68 40 V64',
  'oidc-irsa-role': 'M384 56 V88',
  'irsa-role-sa': 'M336 104 H320',
  'sa-pod-a': 'M224 104 H188',
  'pod-b-pod-a': 'M96 104 H108',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'all-pods', x: 102, y: 152, textAnchor: 'middle' as const },
  { id: 'trust', x: 392, y: 76, textAnchor: 'start' as const },
  { id: 'only-a', x: 148, y: 152, textAnchor: 'middle' as const },
  { id: 'traffic-only', x: 328, y: 164, textAnchor: 'start' as const },
]

export const podPermissionsScenarios: DiagramScenario[] = [
  { id: 'node-role', nodes: ['node-role', 'pod-a', 'pod-b'], paths: ['node-role-node'] },
  { id: 'irsa', nodes: ['oidc', 'irsa-role', 'sa', 'pod-a'], paths: ['oidc-irsa-role', 'irsa-role-sa', 'sa-pod-a'] },
  { id: 'netpol', nodes: ['netpol', 'pod-a', 'pod-b'], paths: ['pod-b-pod-a'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PodPermissionsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-pod-permissions-arrow`
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
      scenarios={podPermissionsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 288'}>
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
