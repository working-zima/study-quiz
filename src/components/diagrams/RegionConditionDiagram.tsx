import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['iam-permissions'].diagrams['region-condition']

// 사용자 → 정책 평가를 위에서 아래로 두고, 그 아래에 리전 둘을 나란히, 리전 B 아래에 사후 알림을 둔다.
// 감쌀 경계가 없어 그룹 박스는 없다.
const nodes = [
  { id: 'user', x: 82, y: 8, width: 116, color: 'stroke-disabled' },
  { id: 'policy', x: 82, y: 80, width: 116, color: 'stroke-diagram-managed' },
  { id: 'region-a', x: 12, y: 176, width: 116, color: 'stroke-diagram-managed' },
  { id: 'region-b', x: 152, y: 176, width: 116, color: 'stroke-diagram-managed' },
  { id: 'notify', x: 152, y: 248, width: 116, color: 'stroke-diagram-managed' },
]

// 정책 평가에서 갈라지는 두 요청은 y 144 통로에서 각 리전 열로 꺾인다.
const paths: Record<string, string> = {
  'user-policy': 'M140 40 V80',
  'policy-a': 'M110 112 V144 H70 V176',
  'policy-b': 'M170 112 V144 H210 V176',
  'b-notify': 'M210 208 V248',
}

// 조건이 보는 쪽과 판정은 곁말 글자로만 보인다.
const notes = [
  { id: 'origin', x: 206, y: 28, textAnchor: 'start' as const, scenarios: ['source-ip'] },
  { id: 'destination', x: 206, y: 100, textAnchor: 'start' as const, scenarios: ['requested-region'] },
  { id: 'a-allowed', x: 70, y: 224, textAnchor: 'middle' as const, scenarios: ['requested-region'] },
  { id: 'b-denied', x: 210, y: 224, textAnchor: 'middle' as const, scenarios: ['requested-region'] },
  { id: 'b-reached', x: 210, y: 224, textAnchor: 'middle' as const, scenarios: ['source-ip'] },
  { id: 'happened', x: 144, y: 268, textAnchor: 'end' as const, scenarios: ['after-fact'] },
]

// 가로형은 사용자 → 정책 평가를 왼쪽에서 오른쪽으로 두고, 리전 둘과 알림을 오른쪽 열에 세로로 둔다.
// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'user', x: 8, y: 56, width: 88 },
  { id: 'policy', x: 136, y: 56, width: 104 },
  { id: 'region-a', x: 284, y: 8, width: 120 },
  { id: 'region-b', x: 284, y: 104, width: 120 },
  { id: 'notify', x: 284, y: 168, width: 120 },
]

const widePaths: Record<string, string> = {
  'user-policy': 'M96 72 H136',
  'policy-a': 'M240 64 H256 V24 H284',
  'policy-b': 'M240 80 H256 V120 H284',
  'b-notify': 'M300 136 V168',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'origin', x: 52, y: 108, textAnchor: 'middle' as const },
  { id: 'destination', x: 188, y: 108, textAnchor: 'middle' as const },
  { id: 'a-allowed', x: 344, y: 56, textAnchor: 'middle' as const },
  { id: 'b-denied', x: 352, y: 152, textAnchor: 'middle' as const },
  { id: 'b-reached', x: 352, y: 152, textAnchor: 'middle' as const },
  { id: 'happened', x: 276, y: 188, textAnchor: 'end' as const },
]

export const regionConditionScenarios: DiagramScenario[] = [
  { id: 'requested-region', nodes: ['user', 'policy', 'region-a', 'region-b'], paths: ['user-policy', 'policy-a'] },
  { id: 'source-ip', nodes: ['user', 'policy', 'region-a', 'region-b'], paths: ['user-policy', 'policy-a', 'policy-b'] },
  { id: 'after-fact', nodes: ['user', 'policy', 'region-b', 'notify'], paths: ['user-policy', 'policy-b', 'b-notify'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RegionConditionDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-region-condition-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes.map((node) => ({ ...nodes.find(({ id }) => id === node.id)!, ...node })) : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={regionConditionScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 208' : '0 0 280 288'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
