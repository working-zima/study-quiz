import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-sla-lifecycle'].diagrams['composite-sla']

// 앱을 위 가운데에, 앱이 기대는 서비스 둘을 아래에 나란히 둔다. 노드는 모두 회색이고 그룹 박스는 없다.
const nodes = [
  { id: 'app', x: 92, y: 8, width: 96 },
  { id: 'service-a', x: 20, y: 96, width: 80 },
  { id: 'service-b', x: 180, y: 96, width: 80 },
]

// 늘 그려지는 연결선 둘이다. 앱의 왼쪽·오른쪽 변에서 나가 꺾어 내려가 각 서비스의 위 변에서 화살표로 끝난다.
// 앱 바로 아래는 앱의 값을 적는 곁말 자리로 비워 둔다.
const paths: Record<string, string> = {
  'app-a': 'M92 24 H60 V96',
  'app-b': 'M188 24 H220 V96',
}

// 연결선이 어느 서비스로 가는지. 선의 흐림은 그 서비스를 따른다.
const linkTargets: Record<string, string> = {
  'app-a': 'service-a',
  'app-b': 'service-b',
}

// 서비스의 SLA는 서비스 아래에, 앱의 값은 앱 아래 두 연결선 사이에 둔다. 앱의 값은 시나리오마다 글이 다르다.
const notes = [
  { id: 'a-value', x: 60, y: 146, textAnchor: 'middle' as const, scenarios: ['single', 'composite'] },
  { id: 'b-value', x: 220, y: 146, textAnchor: 'middle' as const, scenarios: ['composite'] },
  { id: 'app-single', x: 140, y: 58, textAnchor: 'middle' as const, scenarios: ['single'] },
  { id: 'app-composite', x: 140, y: 58, textAnchor: 'middle' as const, scenarios: ['composite'] },
]

// 가로형은 앱을 왼쪽에, 서비스 둘을 오른쪽에 위아래로 둔다. 연결선은 앱의 오른쪽 변에서 나가 서비스의 왼쪽 변으로 들어간다.
const wideNodes = [
  { id: 'app', x: 24, y: 36, width: 96 },
  { id: 'service-a', x: 280, y: 8, width: 80 },
  { id: 'service-b', x: 280, y: 68, width: 80 },
]

// 두 선의 세로 구간이 한 줄로 이어져 보이지 않게 꺾는 x를 다르게 둔다.
const widePaths: Record<string, string> = {
  'app-a': 'M120 44 H184 V24 H280',
  'app-b': 'M120 60 H216 V84 H280',
}

// 곁말은 자리가 배치마다 다르다. 정렬과 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'a-value', x: 368, y: 28, textAnchor: 'start' as const },
  { id: 'b-value', x: 368, y: 88, textAnchor: 'start' as const },
  { id: 'app-single', x: 72, y: 84 },
  { id: 'app-composite', x: 72, y: 84 },
]

// 두 경우는 앱이 기대는 서비스의 수(선명한 노드)와 곁말로 갈린다. 시나리오에만 쓰이는 경로는 없다.
export const compositeSlaScenarios: DiagramScenario[] = [
  { id: 'single', nodes: ['app', 'service-a'], paths: [] },
  { id: 'composite', nodes: ['app', 'service-a', 'service-b'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CompositeSlaDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-composite-sla-arrow`
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
      scenarios={compositeSlaScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 108' : '0 0 280 152'}>
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
              opacity={opacityOf(linkTargets[id])}
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
