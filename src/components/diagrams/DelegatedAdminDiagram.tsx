import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['iam-permissions'].diagrams['delegated-admin']

// 조직 박스 하나가 계정 넷과 버킷을 모두 감싼다.
const groups = [
  { id: 'org', x: 4, y: 8, width: 272, height: 288 },
]

// 위에서 아래로 관리 계정, 구성원 계정 둘, 감사 계정, 버킷을 둔다.
const nodes = [
  { id: 'management', x: 82, y: 32, width: 116, color: 'stroke-diagram-resource' },
  { id: 'member-1', x: 12, y: 104, width: 116, color: 'stroke-diagram-resource' },
  { id: 'member-2', x: 152, y: 104, width: 116, color: 'stroke-diagram-resource' },
  { id: 'audit', x: 82, y: 176, width: 116, color: 'stroke-diagram-resource' },
  { id: 'bucket', x: 82, y: 240, width: 116, color: 'stroke-diagram-managed' },
]

// 관리 계정은 구성원 계정 둘 사이(x 140)로 내려가 감사 계정의 위 변으로, 구성원 계정은 각자 내려가 옆 변으로 들어간다.
const paths: Record<string, string> = {
  'management-audit': 'M140 64 V176',
  'member-1-audit': 'M70 136 V192 H82',
  'member-2-audit': 'M210 136 V192 H198',
  'audit-bucket': 'M140 208 V240',
}

// 지정과 모이는지 여부는 곁말 글자로만 보인다.
const notes = [
  { id: 'delegate', x: 148, y: 92, textAnchor: 'start' as const, scenarios: ['delegate'] },
  { id: 'gathered', x: 140, y: 224, textAnchor: 'middle' as const, scenarios: ['delegate'] },
  { id: 'not-gathered', x: 140, y: 288, textAnchor: 'middle' as const, scenarios: ['bucket-first'] },
]

// 가로형은 관리 계정 → 감사 계정을 왼쪽에서 오른쪽으로 두고, 구성원 계정 둘을 오른쪽 열에, 버킷을 감사 계정 아래에 둔다.
const wideGroups = [
  { id: 'org', x: 4, y: 8, width: 432, height: 176 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'management', x: 16, y: 56, width: 104 },
  { id: 'audit', x: 168, y: 56, width: 104 },
  { id: 'member-1', x: 320, y: 24, width: 104 },
  { id: 'member-2', x: 320, y: 88, width: 104 },
  { id: 'bucket', x: 168, y: 128, width: 104 },
]

// 구성원 계정 둘은 x 296 통로에서 꺾여 감사 계정의 오른쪽 변으로 들어간다.
const widePaths: Record<string, string> = {
  'management-audit': 'M120 72 H168',
  'member-1-audit': 'M320 40 H296 V64 H272',
  'member-2-audit': 'M320 104 H296 V80 H272',
  'audit-bucket': 'M220 88 V128',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'delegate', x: 144, y: 50, textAnchor: 'middle' as const },
  { id: 'gathered', x: 220, y: 112, textAnchor: 'middle' as const },
  { id: 'not-gathered', x: 220, y: 176, textAnchor: 'middle' as const },
]

export const delegatedAdminScenarios: DiagramScenario[] = [
  { id: 'delegate', nodes: ['management', 'audit', 'member-1', 'member-2'], paths: ['management-audit', 'member-1-audit', 'member-2-audit'] },
  { id: 'bucket-first', nodes: ['audit', 'bucket', 'member-1', 'member-2'], paths: ['audit-bucket'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DelegatedAdminDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-delegated-admin-arrow`
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
      scenarios={delegatedAdminScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 304'}>
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
