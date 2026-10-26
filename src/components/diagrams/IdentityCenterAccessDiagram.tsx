import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['identity-federation'].diagrams['identity-center-access']

// Identity Center는 계정 박스 밖에 두고, 서비스와 계정의 경계는 흐리지 않는다.
const groups = [
  { id: 'identity-center', x: 20, y: 60, width: 240, height: 64 },
  { id: 'account-a', x: 20, y: 144, width: 116, height: 104 },
  { id: 'account-b', x: 144, y: 144, width: 116, height: 104 },
]

const nodes = [
  { id: 'user', x: 82, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'permission-set', x: 82, y: 84, width: 116, color: 'stroke-diagram-managed' },
  { id: 'role-a', x: 28, y: 168, width: 100, color: 'stroke-diagram-resource' },
  { id: 'iam-user-a', x: 28, y: 208, width: 100, color: 'stroke-diagram-resource' },
  { id: 'iam-user-b', x: 152, y: 208, width: 100, color: 'stroke-diagram-resource' },
]

// 사용자의 계정 접근 경로는 박스 바깥 통로를 쓴다. 왼쪽의 두 경로는 동시에 보이지 않는다.
const paths: Record<string, string> = {
  'user-login': 'M140 40 V60',
  'set-role': 'M110 116 V168',
  'user-role': 'M82 24 H8 V184 H28',
  'user-iam-a': 'M82 24 H8 V224 H28',
  'user-iam-b': 'M198 24 H270 V224 H252',
}

const notes = [
  { id: 'creates-role', x: 116, y: 138, textAnchor: 'start' as const, scenarios: ['assign'] },
  { id: 'assume-role', x: 14, y: 52, textAnchor: 'start' as const, scenarios: ['assign'] },
  { id: 'no-assignment', x: 202, y: 188, textAnchor: 'middle' as const, scenarios: ['assign'] },
  { id: 'per-account', x: 140, y: 52, textAnchor: 'middle' as const, scenarios: ['iam-users'] },
]

// 가로형은 왼쪽에서 오른쪽으로 사용자 · IAM Identity Center · 계정을 두고, 계정 A와 B를 위아래로 쌓는다.
const wideGroups = [
  { id: 'identity-center', x: 96, y: 24, width: 112, height: 64 },
  { id: 'account-a', x: 280, y: 24, width: 156, height: 64 },
  { id: 'account-b', x: 280, y: 104, width: 156, height: 64 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'user', x: 8, y: 48, width: 64 },
  { id: 'permission-set', x: 108, y: 48, width: 88 },
  { id: 'role-a', x: 292, y: 48, width: 64 },
  { id: 'iam-user-a', x: 364, y: 48, width: 64 },
  { id: 'iam-user-b', x: 292, y: 128, width: 64 },
]

// 권한 세트 → 역할은 곧은 수평선이고, 사용자가 계정 A로 가는 길은 위 통로(y 8)로 돌아 노드 위 변에 닿는다.
const widePaths: Record<string, string> = {
  'user-login': 'M72 64 H96',
  'set-role': 'M196 64 H292',
  'user-role': 'M40 48 V8 H324 V48',
  'user-iam-a': 'M40 48 V8 H396 V48',
  'user-iam-b': 'M40 80 V144 H292',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'creates-role', x: 242, y: 56, textAnchor: 'middle' as const },
  { id: 'assume-role', x: 332, y: 20, textAnchor: 'start' as const },
  { id: 'no-assignment', x: 396, y: 148, textAnchor: 'middle' as const },
  { id: 'per-account', x: 166, y: 136, textAnchor: 'middle' as const },
]

export const identityCenterAccessScenarios: DiagramScenario[] = [
  { id: 'assign', nodes: ['user', 'permission-set', 'role-a'], paths: ['user-login', 'set-role', 'user-role'] },
  { id: 'iam-users', nodes: ['user', 'iam-user-a', 'iam-user-b'], paths: ['user-iam-a', 'user-iam-b'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IdentityCenterAccessDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-identity-center-access-arrow`
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
      scenarios={identityCenterAccessScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 256'}>
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
