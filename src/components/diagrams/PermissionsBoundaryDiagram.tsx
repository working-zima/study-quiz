import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['iam-permissions'].diagrams.boundary

// 붙인 정책과 권한 경계의 범위를 겹친 박스 둘로 둔다. 두 라벨이 상대 박스 안에 놓이지 않게 어긋나게 겹친다.
const groups = [
  { id: 'policy-range', x: 104, y: 8, width: 172, height: 88 },
  { id: 'boundary-range', x: 4, y: 48, width: 172, height: 88 },
]

// 위쪽은 범위 박스 안의 세 칸, 아래쪽은 역할 생성 요청에서 두 갈래로 내려가는 흐름이다.
const nodes = [
  { id: 'policy-only', x: 196, y: 32, width: 64, color: 'stroke-disabled' },
  { id: 'effective', x: 108, y: 56, width: 64, color: 'stroke-diagram-managed' },
  { id: 'boundary-only', x: 12, y: 72, width: 72, color: 'stroke-disabled' },
  { id: 'request', x: 72, y: 160, width: 136, color: 'stroke-disabled' },
  { id: 'scp', x: 30, y: 224, width: 80, color: 'stroke-diagram-managed' },
  { id: 'rejected', x: 30, y: 288, width: 80, color: 'stroke-disabled' },
  { id: 'created', x: 162, y: 224, width: 96, color: 'stroke-disabled' },
  { id: 'found', x: 162, y: 288, width: 96, color: 'stroke-diagram-managed' },
]

// 흐름의 화살표는 모두 곧은 수직선이다.
const paths: Record<string, string> = {
  'request-scp': 'M100 192 V224',
  'scp-rejected': 'M70 256 V288',
  'request-created': 'M180 192 V224',
  'created-found': 'M210 256 V288',
}

const notes = [
  { id: 'not-usable', x: 228, y: 82, textAnchor: 'middle' as const, scenarios: ['boundary'] },
  { id: 'not-granted', x: 48, y: 122, textAnchor: 'middle' as const, scenarios: ['boundary'] },
  { id: 'scp-requires', x: 94, y: 216, textAnchor: 'end' as const, scenarios: ['scp'] },
  { id: 'never-created', x: 70, y: 336, textAnchor: 'middle' as const, scenarios: ['scp'] },
  { id: 'exists-until', x: 210, y: 336, textAnchor: 'middle' as const, scenarios: ['detect'] },
]

// 가로형은 겹친 두 박스를 왼쪽에, 생성 흐름을 오른쪽에 둔다.
const wideGroups = [
  { id: 'policy-range', x: 88, y: 8, width: 148, height: 88 },
  { id: 'boundary-range', x: 4, y: 48, width: 156, height: 88 },
]

// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'policy-only', x: 168, y: 32, width: 60 },
  { id: 'effective', x: 92, y: 56, width: 64 },
  { id: 'boundary-only', x: 8, y: 72, width: 72 },
  { id: 'request', x: 276, y: 8, width: 140 },
  { id: 'scp', x: 252, y: 72, width: 80 },
  { id: 'rejected', x: 252, y: 136, width: 80 },
  { id: 'created', x: 340, y: 72, width: 96 },
  { id: 'found', x: 340, y: 136, width: 96 },
]

const widePaths: Record<string, string> = {
  'request-scp': 'M300 40 V72',
  'scp-rejected': 'M292 104 V136',
  'request-created': 'M388 40 V72',
  'created-found': 'M388 104 V136',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'not-usable', x: 198, y: 82, textAnchor: 'middle' as const },
  { id: 'not-granted', x: 44, y: 122, textAnchor: 'middle' as const },
  { id: 'scp-requires', x: 306, y: 60, textAnchor: 'start' as const },
  { id: 'never-created', x: 292, y: 184, textAnchor: 'middle' as const },
  { id: 'exists-until', x: 388, y: 184, textAnchor: 'middle' as const },
]

export const permissionsBoundaryScenarios: DiagramScenario[] = [
  { id: 'boundary', nodes: ['effective'], paths: [] },
  { id: 'scp', nodes: ['request', 'scp', 'rejected'], paths: ['request-scp', 'scp-rejected'] },
  { id: 'detect', nodes: ['request', 'created', 'found'], paths: ['request-created', 'created-found'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PermissionsBoundaryDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-boundary-arrow`
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
      scenarios={permissionsBoundaryScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 344'}>
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
