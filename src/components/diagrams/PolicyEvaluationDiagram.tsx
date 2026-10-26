import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/aws'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['iam-permissions'].diagrams['policy-evaluation']

// 왼쪽 열을 위에서 아래로 요청 → 명시적 거부 → 허용 → 기본 거부로 쌓고, 두 물음의 결과를 오른쪽에 둔다.
// 감쌀 경계가 없어 그룹 박스는 없다.
const nodes = [
  { id: 'request', x: 12, y: 8, width: 128, color: 'stroke-disabled' },
  { id: 'check-deny', x: 12, y: 64, width: 128, color: 'stroke-diagram-managed' },
  { id: 'denied', x: 168, y: 64, width: 100, color: 'stroke-disabled' },
  { id: 'check-allow', x: 12, y: 136, width: 128, color: 'stroke-diagram-managed' },
  { id: 'allowed', x: 168, y: 136, width: 100, color: 'stroke-disabled' },
  { id: 'default-deny', x: 12, y: 208, width: 128, color: 'stroke-disabled' },
]

// "예"는 오른쪽, "아니오"는 아래로 간다. 화살표는 모두 곧은 선이다.
const paths: Record<string, string> = {
  'request-deny': 'M76 40 V64',
  'deny-yes': 'M140 80 H168',
  'deny-no': 'M76 96 V136',
  'allow-yes': 'M140 152 H168',
  'allow-no': 'M76 168 V208',
}

const notes = [
  { id: 'yes-1', x: 154, y: 74, textAnchor: 'middle' as const, scenarios: ['conditional-deny', 'source-ip'] },
  { id: 'no-1', x: 84, y: 120, textAnchor: 'start' as const, scenarios: ['allowed', 'none'] },
  { id: 'yes-2', x: 154, y: 146, textAnchor: 'middle' as const, scenarios: ['allowed'] },
  { id: 'no-2', x: 84, y: 192, textAnchor: 'start' as const, scenarios: ['none'] },
  { id: 'allow-exists', x: 148, y: 28, textAnchor: 'start' as const, scenarios: ['conditional-deny'] },
  { id: 'source-ip', x: 148, y: 28, textAnchor: 'start' as const, scenarios: ['source-ip'] },
]

// 가로형은 같은 흐름을 왼쪽에서 오른쪽으로 펴고, "예"는 아래로 간다.
// 라벨과 색은 세로형 nodes에서 id로 가져온다.
const wideNodes = [
  { id: 'request', x: 8, y: 16, width: 56 },
  { id: 'check-deny', x: 88, y: 16, width: 116 },
  { id: 'check-allow', x: 236, y: 16, width: 96 },
  { id: 'default-deny', x: 364, y: 16, width: 72 },
  { id: 'denied', x: 96, y: 88, width: 100 },
  { id: 'allowed', x: 234, y: 88, width: 100 },
]

const widePaths: Record<string, string> = {
  'request-deny': 'M64 32 H88',
  'deny-yes': 'M146 48 V88',
  'deny-no': 'M204 32 H236',
  'allow-yes': 'M284 48 V88',
  'allow-no': 'M332 32 H364',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'yes-1', x: 152, y: 72, textAnchor: 'start' as const },
  { id: 'no-1', x: 220, y: 26, textAnchor: 'middle' as const },
  { id: 'yes-2', x: 290, y: 72, textAnchor: 'start' as const },
  { id: 'no-2', x: 348, y: 26, textAnchor: 'middle' as const },
  { id: 'allow-exists', x: 8, y: 80, textAnchor: 'start' as const },
  { id: 'source-ip', x: 8, y: 80, textAnchor: 'start' as const },
]

export const policyEvaluationScenarios: DiagramScenario[] = [
  { id: 'conditional-deny', nodes: ['request', 'check-deny', 'denied'], paths: ['request-deny', 'deny-yes'] },
  { id: 'source-ip', nodes: ['request', 'check-deny', 'denied'], paths: ['request-deny', 'deny-yes'] },
  { id: 'allowed', nodes: ['request', 'check-deny', 'check-allow', 'allowed'], paths: ['request-deny', 'deny-no', 'allow-yes'] },
  { id: 'none', nodes: ['request', 'check-deny', 'check-allow', 'default-deny'], paths: ['request-deny', 'deny-no', 'allow-no'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PolicyEvaluationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-policy-evaluation-arrow`
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
      scenarios={policyEvaluationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 128' : '0 0 280 248'}>
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
