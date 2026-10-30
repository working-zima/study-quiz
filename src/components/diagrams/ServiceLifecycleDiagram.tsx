import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-sla-lifecycle'].diagrams['service-lifecycle']

// 세 단계를 위에서 아래로 차례대로 둔다. 노드는 모두 회색이고 그룹 박스는 없다.
const nodes = [
  { id: 'private-preview', x: 16, y: 8, width: 112 },
  { id: 'public-preview', x: 16, y: 72, width: 112 },
  { id: 'ga', x: 16, y: 136, width: 112 },
]

// 늘 그려지는 연결선 둘이다. 앞 단계의 아래 변에서 곧게 내려가 다음 단계의 위 변에서 화살표로 끝난다.
const paths: Record<string, string> = {
  'private-to-public': 'M72 40 V72',
  'public-to-ga': 'M72 104 V136',
}

// 고른 단계의 오른쪽에 두 줄을 둔다. 윗줄은 누가 쓸 수 있는지, 아랫줄은 SLA가 있는지다.
const notes = [
  { id: 'private-who', x: 140, y: 21, textAnchor: 'start' as const, scenarios: ['private'] },
  { id: 'private-sla', x: 140, y: 35, textAnchor: 'start' as const, scenarios: ['private'] },
  { id: 'public-who', x: 140, y: 85, textAnchor: 'start' as const, scenarios: ['public'] },
  { id: 'public-sla', x: 140, y: 99, textAnchor: 'start' as const, scenarios: ['public'] },
  { id: 'ga-who', x: 140, y: 149, textAnchor: 'start' as const, scenarios: ['ga'] },
  { id: 'ga-sla', x: 140, y: 163, textAnchor: 'start' as const, scenarios: ['ga'] },
]

// 가로형은 세 단계를 왼쪽에서 오른쪽으로 차례대로 둔다. 연결선은 앞 단계의 오른쪽 변에서 다음 단계의 왼쪽 변으로 간다.
const wideNodes = [
  { id: 'private-preview', x: 16, y: 8, width: 112 },
  { id: 'public-preview', x: 164, y: 8, width: 112 },
  { id: 'ga', x: 312, y: 8, width: 112 },
]

const widePaths: Record<string, string> = {
  'private-to-public': 'M128 24 H164',
  'public-to-ga': 'M276 24 H312',
}

// 가로형의 곁말은 고른 단계 아래 가운데에 두 줄로 둔다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'private-who', x: 72, y: 54, textAnchor: 'middle' as const },
  { id: 'private-sla', x: 72, y: 68, textAnchor: 'middle' as const },
  { id: 'public-who', x: 220, y: 54, textAnchor: 'middle' as const },
  { id: 'public-sla', x: 220, y: 68, textAnchor: 'middle' as const },
  { id: 'ga-who', x: 368, y: 54, textAnchor: 'middle' as const },
  { id: 'ga-sla', x: 368, y: 68, textAnchor: 'middle' as const },
]

// 세 단계는 선명한 노드와 곁말로 갈린다. 시나리오에만 쓰이는 경로는 없고, 단계의 차례를 잇는 연결선은 늘 보인다.
export const serviceLifecycleScenarios: DiagramScenario[] = [
  { id: 'private', nodes: ['private-preview'], paths: [] },
  { id: 'public', nodes: ['public-preview'], paths: [] },
  { id: 'ga', nodes: ['ga'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ServiceLifecycleDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-service-lifecycle-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={serviceLifecycleScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 80' : '0 0 280 176'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {Object.entries(layoutPaths).map(([id, d]) => (
            <path
              key={id}
              data-link={id}
              d={d}
              className="fill-none stroke-title"
              strokeWidth="1.5"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
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
