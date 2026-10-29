import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['routing'].diagrams['route-failover']

// 세로형은 호스트 A와 라우터 1을 위에 두고, 라우터 1에서 왼쪽 라우터 2와 오른쪽 라우터 3으로 길이 갈렸다가
// 라우터 4에서 다시 만나 호스트 E로 이어지게 쌓는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'host-a', x: 102, y: 8, width: 76 },
  { id: 'router-1', x: 102, y: 72, width: 76 },
  { id: 'router-2', x: 24, y: 136, width: 76 },
  { id: 'router-3', x: 180, y: 136, width: 76 },
  { id: 'router-4', x: 102, y: 200, width: 76 },
  { id: 'host-e', x: 102, y: 264, width: 76 },
]

// 연결 여섯은 늘 보이고, 고른 시나리오의 화살표를 그 위에 겹쳐 그린다. 라우터 2에서 라우터 4로 가는 화살표는 없다.
const paths: Record<string, string> = {
  'link-a-1': 'M140 40 V72',
  'link-1-2': 'M102 88 H62 V136',
  'link-1-3': 'M178 88 H218 V136',
  'link-2-4': 'M62 168 V216 H102',
  'link-3-4': 'M218 168 V216 H178',
  'link-4-e': 'M140 232 V264',
  'hop-a-1': 'M140 40 V72',
  'hop-1-2': 'M102 88 H62 V136',
  'hop-1-3': 'M178 88 H218 V136',
  'hop-3-4': 'M218 168 V216 H178',
  'hop-4-e': 'M140 232 V264',
}

const linkIds = ['link-a-1', 'link-1-2', 'link-1-3', 'link-2-4', 'link-3-4', 'link-4-e']

// 「멈춤」은 라우터 2 위 왼쪽에 늘 둔다. 라우터 1이 정한 다음 홉은 그 길 쪽에 — 라우터 2면 왼쪽, 라우터 3이면 오른쪽에 둔다.
// scenarios가 null인 곁말은 시나리오와 상관없이 늘 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] | null }[] = [
  { id: 'stopped', x: 24, y: 130, anchor: 'start', scenarios: null },
  { id: 'static-next', x: 98, y: 82, anchor: 'end', scenarios: ['static'] },
  { id: 'dynamic-next', x: 182, y: 82, anchor: 'start', scenarios: ['dynamic'] },
  { id: 'unreached', x: 182, y: 284, anchor: 'start', scenarios: ['static'] },
]

// 가로형은 왼쪽에서 오른쪽으로 호스트 A·라우터 1을 두고, 라우터 2는 위로, 라우터 3은 아래로 갈렸다가 라우터 4·호스트 E로 다시 만난다.
const wideNodes = [
  { id: 'host-a', x: 8, y: 64, width: 64 },
  { id: 'router-1', x: 96, y: 64, width: 64 },
  { id: 'router-2', x: 184, y: 24, width: 64 },
  { id: 'router-3', x: 184, y: 104, width: 64 },
  { id: 'router-4', x: 272, y: 64, width: 64 },
  { id: 'host-e', x: 360, y: 64, width: 64 },
]

const widePaths: Record<string, string> = {
  'link-a-1': 'M72 80 H96',
  'link-1-2': 'M128 64 V40 H184',
  'link-1-3': 'M128 96 V120 H184',
  'link-2-4': 'M248 40 H304 V64',
  'link-3-4': 'M248 120 H304 V96',
  'link-4-e': 'M336 80 H360',
  'hop-a-1': 'M72 80 H96',
  'hop-1-2': 'M128 64 V40 H184',
  'hop-1-3': 'M128 96 V120 H184',
  'hop-3-4': 'M248 120 H304 V96',
  'hop-4-e': 'M336 80 H360',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'stopped', x: 216, y: 18, anchor: 'middle' },
  { id: 'static-next', x: 64, y: 52, anchor: 'middle' },
  { id: 'dynamic-next', x: 64, y: 112, anchor: 'middle' },
  { id: 'unreached', x: 390, y: 112, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 연결을 함께 적는다. 두 시나리오 모두 멈춘 라우터 2는 흐리다.
// 정적 라우팅은 라우터 1이 멈춘 라우터 2에게 계속 넘기는 데서 끝나고, 동적 라우팅은 라우터 3과 라우터 4를 거쳐 호스트 E에 닿는다.
export const routeFailoverScenarios: DiagramScenario[] = [
  { id: 'static', nodes: ['host-a', 'router-1', 'link-a-1', 'link-1-2'], paths: ['hop-a-1', 'hop-1-2'] },
  {
    id: 'dynamic',
    nodes: ['host-a', 'router-1', 'router-3', 'router-4', 'host-e', 'link-a-1', 'link-1-3', 'link-3-4', 'link-4-e'],
    paths: ['hop-a-1', 'hop-1-3', 'hop-3-4', 'hop-4-e'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RouteFailoverDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-route-failover-arrow`
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
      scenarios={routeFailoverScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 304'}>
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
