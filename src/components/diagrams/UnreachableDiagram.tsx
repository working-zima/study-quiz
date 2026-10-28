import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['icmp'].diagrams['destination-unreachable']

// 세로형은 출발지 호스트·라우터·목적지 호스트를 위에서 아래로 쌓는다. 목적지 쪽으로 가는 패킷의 화살표는 왼쪽(x 48)에,
// 출발지 쪽으로 돌아오는 목적지 도달 불가 메시지의 화살표는 오른쪽(x 96)에 나란히 둔다. 노드는 모두 회색이고 박스는 없다.
const nodes = [
  { id: 'source', x: 16, y: 8, width: 112 },
  { id: 'router', x: 16, y: 104, width: 112 },
  { id: 'dest', x: 16, y: 200, width: 112 },
]

const paths: Record<string, string> = {
  'to-router': 'M48 40 V104',
  'to-dest': 'M48 136 V200',
  'router-error': 'M96 104 V40',
  'dest-error-1': 'M96 200 V136',
  'dest-error-2': 'M96 104 V40',
}

// 막힌 까닭의 곁말은 메시지를 보내는 장치 오른쪽에, 타입·코드 곁말은 돌아오는 화살표 오른쪽에 둔다.
// 다음 구간의 MTU 곁말은 라우터와 목적지 호스트 사이에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'no-route-note', x: 140, y: 124, anchor: 'start', scenarios: ['network'] },
  { id: 'code-0-note', x: 104, y: 76, anchor: 'start', scenarios: ['network'] },
  { id: 'no-program-note', x: 140, y: 220, anchor: 'start', scenarios: ['port'] },
  { id: 'code-3-note', x: 104, y: 172, anchor: 'start', scenarios: ['port'] },
  { id: 'df-drop-note', x: 140, y: 124, anchor: 'start', scenarios: ['fragment'] },
  { id: 'mtu-note', x: 24, y: 172, anchor: 'start', scenarios: ['fragment'] },
  { id: 'code-4-note', x: 104, y: 76, anchor: 'start', scenarios: ['fragment'] },
]

// 가로형은 세 장치를 왼쪽에서 오른쪽으로 한 줄에 둔다. 패킷은 위(y 48), 돌아오는 메시지는 아래(y 64)다.
const wideNodes = [
  { id: 'source', x: 16, y: 40, width: 96 },
  { id: 'router', x: 172, y: 40, width: 96 },
  { id: 'dest', x: 328, y: 40, width: 96 },
]

const widePaths: Record<string, string> = {
  'to-router': 'M112 48 H172',
  'to-dest': 'M268 48 H328',
  'router-error': 'M172 64 H112',
  'dest-error-1': 'M328 64 H268',
  'dest-error-2': 'M172 64 H112',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'no-route-note', x: 220, y: 28, anchor: 'middle' },
  { id: 'code-0-note', x: 142, y: 92, anchor: 'middle' },
  { id: 'no-program-note', x: 432, y: 28, anchor: 'end' },
  { id: 'code-3-note', x: 298, y: 92, anchor: 'middle' },
  { id: 'df-drop-note', x: 220, y: 28, anchor: 'middle' },
  { id: 'mtu-note', x: 298, y: 92, anchor: 'middle' },
  { id: 'code-4-note', x: 142, y: 92, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드를 적는다. 라우터가 패킷을 버리는 두 시나리오에서는 패킷이 닿지 못한 목적지 호스트가 흐려진다.
// 포트 도달 불가에서는 패킷과 메시지가 모두 라우터를 지나므로 라우터도 선명하다.
export const unreachableScenarios: DiagramScenario[] = [
  { id: 'network', nodes: ['source', 'router'], paths: ['to-router', 'router-error'] },
  { id: 'port', nodes: ['source', 'router', 'dest'], paths: ['to-router', 'to-dest', 'dest-error-1', 'dest-error-2'] },
  { id: 'fragment', nodes: ['source', 'router'], paths: ['to-router', 'router-error'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function UnreachableDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-unreachable-arrow`
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
      scenarios={unreachableScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 100' : '0 0 280 240'}>
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
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
