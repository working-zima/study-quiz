import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['organizations-cloudtrail-config'].diagrams['scp-scope']

// 관리 계정과 OU를 모두 조직의 루트 안에 둔다. 조직·OU 경계는 흐리지 않는다.
const groups = [
  { id: 'root', x: 4, y: 56, width: 272, height: 192 },
  { id: 'ou-1', x: 12, y: 128, width: 124, height: 112 },
  { id: 'ou-2', x: 144, y: 128, width: 124, height: 112 },
]

const nodes = [
  { id: 'scp', x: 82, y: 8, width: 116, color: 'stroke-diagram-managed' },
  { id: 'management', x: 12, y: 80, width: 116, color: 'stroke-diagram-resource' },
  { id: 'account-a', x: 20, y: 150, width: 108, color: 'stroke-diagram-resource' },
  { id: 'account-b', x: 20, y: 194, width: 108, color: 'stroke-diagram-resource' },
  { id: 'account-c', x: 152, y: 150, width: 108, color: 'stroke-diagram-resource' },
]

// 화살표는 적용 계정 전체가 아니라 SCP를 붙인 자리에서 끝난다.
const paths: Record<string, string> = {
  'scp-root': 'M140 40 V56',
  'scp-ou': 'M140 40 V120 H100 V128',
  'scp-account': 'M190 40 V48 H240 V150',
}

const notes = [
  { id: 'management-exempt', x: 150, y: 100, scenarios: ['root'] },
]

// 가로형은 조직 루트 안을 관리 계정 · OU 1 · OU 2로 가로로 편다. SCP는 그 위에 둔다.
const wideGroups = [
  { id: 'root', x: 4, y: 56, width: 432, height: 96 },
  { id: 'ou-1', x: 120, y: 80, width: 168, height: 64 },
  { id: 'ou-2', x: 304, y: 80, width: 124, height: 64 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'scp', x: 162, y: 8, width: 116 },
  { id: 'management', x: 16, y: 88, width: 88 },
  { id: 'account-a', x: 132, y: 102, width: 68 },
  { id: 'account-b', x: 208, y: 102, width: 68 },
  { id: 'account-c', x: 316, y: 102, width: 100 },
]

// 화살표는 세로형처럼 SCP를 붙인 자리(루트 · OU 1 · 계정 C)의 위 변에서 끝난다.
const widePaths: Record<string, string> = {
  'scp-root': 'M190 40 V56',
  'scp-ou': 'M220 40 V80',
  'scp-account': 'M278 24 H372 V102',
}

// 곁말은 관리 계정 바로 아래에 둔다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'management-exempt', x: 16, y: 136 },
]

export const orgScpScopeScenarios: DiagramScenario[] = [
  { id: 'root', nodes: ['scp', 'account-a', 'account-b', 'account-c'], paths: ['scp-root'] },
  { id: 'ou', nodes: ['scp', 'account-a', 'account-b'], paths: ['scp-ou'] },
  { id: 'account', nodes: ['scp', 'account-c'], paths: ['scp-account'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function OrgScpScopeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-org-scp-scope-arrow`
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
      scenarios={orgScpScopeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 256'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="start" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
