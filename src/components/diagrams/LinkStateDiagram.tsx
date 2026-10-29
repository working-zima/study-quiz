import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['routing'].diagrams['link-state']

// 세로형은 라우터 1을 위, 라우터 4를 아래, 라우터 2와 라우터 3을 가운데 양옆에 둔다.
// 라우터 1과 라우터 4를 바로 잇는 링크는 두 라우터 사이를 곧게 내려간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'router-1', x: 108, y: 8, width: 64 },
  { id: 'router-2', x: 16, y: 104, width: 64 },
  { id: 'router-3', x: 200, y: 104, width: 64 },
  { id: 'router-4', x: 108, y: 200, width: 64 },
]

// 링크 다섯은 늘 보이고, 고른 시나리오의 화살표를 그 위에 겹쳐 그린다.
// 링크 상태를 알리는 화살표는 라우터 1에서 이웃 셋으로 나가고, 패킷이 가는 길은 라우터 2나 라우터 3을 거쳐 라우터 4로 간다.
const paths: Record<string, string> = {
  'link-1-2': 'M108 24 H48 V104',
  'link-1-3': 'M172 24 H232 V104',
  'link-2-4': 'M48 136 V216 H108',
  'link-3-4': 'M232 136 V216 H172',
  'link-1-4': 'M140 40 V200',
  'flood-1-2': 'M108 24 H48 V104',
  'flood-1-3': 'M172 24 H232 V104',
  'flood-1-4': 'M140 40 V200',
  'go-1-2': 'M108 24 H48 V104',
  'go-2-4': 'M48 136 V216 H108',
  'go-1-3': 'M172 24 H232 V104',
  'go-3-4': 'M232 136 V216 H172',
}

const linkIds = ['link-1-2', 'link-1-3', 'link-2-4', 'link-3-4', 'link-1-4']

// 링크마다의 비용은 그 링크 곁에 늘 둔다. 시나리오마다의 곁말 하나는 그림 아래 같은 자리에 둔다.
// scenarios가 null인 곁말은 시나리오와 상관없이 늘 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] | null }[] = [
  { id: 'cost-1-2', x: 54, y: 72, anchor: 'start', scenarios: null },
  { id: 'cost-1-3', x: 226, y: 72, anchor: 'end', scenarios: null },
  { id: 'cost-2-4', x: 54, y: 176, anchor: 'start', scenarios: null },
  { id: 'cost-3-4', x: 226, y: 176, anchor: 'end', scenarios: null },
  { id: 'cost-1-4', x: 146, y: 124, anchor: 'start', scenarios: null },
  { id: 'same-map', x: 140, y: 248, anchor: 'middle', scenarios: ['flood'] },
  { id: 'via-2-sum', x: 140, y: 248, anchor: 'middle', scenarios: ['shortest'] },
  { id: 'via-3-sum', x: 140, y: 248, anchor: 'middle', scenarios: ['equal-cost'] },
]

// 가로형은 라우터 1을 왼쪽, 라우터 4를 오른쪽, 라우터 2와 라우터 3을 가운데 위아래에 두고, 바로 잇는 링크는 가운데를 곧게 지난다.
const wideNodes = [
  { id: 'router-1', x: 16, y: 72, width: 64 },
  { id: 'router-2', x: 188, y: 8, width: 64 },
  { id: 'router-3', x: 188, y: 136, width: 64 },
  { id: 'router-4', x: 360, y: 72, width: 64 },
]

const widePaths: Record<string, string> = {
  'link-1-2': 'M48 72 V24 H188',
  'link-1-3': 'M48 104 V152 H188',
  'link-2-4': 'M252 24 H392 V72',
  'link-3-4': 'M252 152 H392 V104',
  'link-1-4': 'M80 88 H360',
  'flood-1-2': 'M48 72 V24 H188',
  'flood-1-3': 'M48 104 V152 H188',
  'flood-1-4': 'M80 88 H360',
  'go-1-2': 'M48 72 V24 H188',
  'go-2-4': 'M252 24 H392 V72',
  'go-1-3': 'M48 104 V152 H188',
  'go-3-4': 'M252 152 H392 V104',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'cost-1-2', x: 118, y: 18, anchor: 'middle' },
  { id: 'cost-1-3', x: 118, y: 168, anchor: 'middle' },
  { id: 'cost-2-4', x: 322, y: 18, anchor: 'middle' },
  { id: 'cost-3-4', x: 322, y: 168, anchor: 'middle' },
  { id: 'cost-1-4', x: 220, y: 82, anchor: 'middle' },
  { id: 'same-map', x: 220, y: 196, anchor: 'middle' },
  { id: 'via-2-sum', x: 220, y: 196, anchor: 'middle' },
  { id: 'via-3-sum', x: 220, y: 196, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 링크를 함께 적는다. 가장 작은 비용은 라우터 2를 거치는 길만,
// 같은 비용의 길은 라우터 2와 라우터 3을 거치는 두 길을 밝히고, 두 시나리오 모두 바로 잇는 링크는 흐리다.
export const linkStateScenarios: DiagramScenario[] = [
  {
    id: 'flood',
    nodes: ['router-1', 'router-2', 'router-3', 'router-4', 'link-1-2', 'link-1-3', 'link-1-4'],
    paths: ['flood-1-2', 'flood-1-3', 'flood-1-4'],
  },
  { id: 'shortest', nodes: ['router-1', 'router-2', 'router-4', 'link-1-2', 'link-2-4'], paths: ['go-1-2', 'go-2-4'] },
  {
    id: 'equal-cost',
    nodes: ['router-1', 'router-2', 'router-3', 'router-4', 'link-1-2', 'link-2-4', 'link-1-3', 'link-3-4'],
    paths: ['go-1-2', 'go-2-4', 'go-1-3', 'go-3-4'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LinkStateDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-link-state-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.scenarios === null || (active !== null && note.scenarios.includes(active.id)))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={linkStateScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 204' : '0 0 280 256'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
