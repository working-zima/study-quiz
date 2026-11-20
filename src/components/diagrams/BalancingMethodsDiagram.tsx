import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-devices'].diagrams['balancing-methods']

// 세로형은 세 줄에 걸쳐 줄마다 왼쪽부터 첫 바퀴의 요청(요청 1~3), 둘째 바퀴의 요청(요청 4~6), 그 요청들을 받는 웹 서버를 둔다.
// 첫 바퀴의 요청은 둘째 바퀴의 요청 위를 넘어 서버의 위 변으로, 둘째 바퀴의 요청은 서버의 왼쪽 변으로 들어간다.
// 맨 아래 줄의 새 연결은 최소 연결 시나리오에서 WEB02로 간다. 서버마다의 연결 수 곁말은 서버 오른쪽에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'rr1', x: 8, y: 28, width: 56 },
  { id: 'rr2', x: 8, y: 80, width: 56 },
  { id: 'rr3', x: 8, y: 132, width: 56 },
  { id: 'rr4', x: 80, y: 28, width: 56 },
  { id: 'rr5', x: 80, y: 80, width: 56 },
  { id: 'rr6', x: 80, y: 132, width: 56 },
  { id: 'newconn', x: 8, y: 188, width: 64 },
  { id: 'web01', x: 168, y: 28, width: 56 },
  { id: 'web02', x: 168, y: 80, width: 56 },
  { id: 'web03', x: 168, y: 132, width: 56 },
]

const paths: Record<string, string> = {
  'rr1-web01': 'M36 28 V16 H196 V28',
  'rr2-web02': 'M36 80 V70 H196 V80',
  'rr3-web03': 'M36 132 V122 H196 V132',
  'rr4-web01': 'M136 44 H168',
  'rr5-web02': 'M136 96 H168',
  'rr6-web03': 'M136 148 H168',
  'newconn-web02': 'M72 204 H152 V100 H168',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'rr-note': 'round-robin',
  'web01-count': 'least-conn',
  'web02-count': 'least-conn',
  'web03-count': 'least-conn',
  'lc-note': 'least-conn',
}

const notes: Note[] = [
  { id: 'rr-note', x: 272, y: 204, anchor: 'end' },
  { id: 'web01-count', x: 230, y: 48, anchor: 'start' },
  { id: 'web02-count', x: 230, y: 100, anchor: 'start' },
  { id: 'web03-count', x: 230, y: 152, anchor: 'start' },
  { id: 'lc-note', x: 8, y: 236, anchor: 'start' },
]

// 가로형은 가운데 줄에 웹 서버 셋을 나란히 두고, 서버마다 바로 위에 그 서버로 가는 첫 바퀴·둘째 바퀴의 요청을 둔다.
// 새 연결은 WEB02 바로 아래에 두고, 연결 수 곁말은 서버마다 아래 오른쪽에 둔다.
const wideNodes = [
  { id: 'rr1', x: 16, y: 8, width: 56 },
  { id: 'rr2', x: 160, y: 8, width: 56 },
  { id: 'rr3', x: 304, y: 8, width: 56 },
  { id: 'rr4', x: 80, y: 8, width: 56 },
  { id: 'rr5', x: 224, y: 8, width: 56 },
  { id: 'rr6', x: 368, y: 8, width: 56 },
  { id: 'newconn', x: 188, y: 136, width: 64 },
  { id: 'web01', x: 32, y: 72, width: 88 },
  { id: 'web02', x: 176, y: 72, width: 88 },
  { id: 'web03', x: 320, y: 72, width: 88 },
]

const widePaths: Record<string, string> = {
  'rr1-web01': 'M44 40 V72',
  'rr2-web02': 'M188 40 V72',
  'rr3-web03': 'M332 40 V72',
  'rr4-web01': 'M108 40 V72',
  'rr5-web02': 'M252 40 V72',
  'rr6-web03': 'M396 40 V72',
  'newconn-web02': 'M220 136 V104',
}

const wideNotes: Note[] = [
  { id: 'rr-note', x: 432, y: 192, anchor: 'end' },
  { id: 'web01-count', x: 84, y: 124, anchor: 'start' },
  { id: 'web02-count', x: 228, y: 124, anchor: 'start' },
  { id: 'web03-count', x: 372, y: 124, anchor: 'start' },
  { id: 'lc-note', x: 220, y: 192, anchor: 'middle' },
]

// 라운드 로빈: 요청 1~6과 서버 셋이 선명하고 요청마다 차례에 맞는 서버로 화살표가 간다. 최소 연결: 새 연결과 서버 셋이 선명하고 화살표는 WEB02로 하나.
export const balancingMethodsScenarios: DiagramScenario[] = [
  {
    id: 'round-robin',
    nodes: ['rr1', 'rr2', 'rr3', 'rr4', 'rr5', 'rr6', 'web01', 'web02', 'web03'],
    paths: ['rr1-web01', 'rr2-web02', 'rr3-web03', 'rr4-web01', 'rr5-web02', 'rr6-web03'],
  },
  {
    id: 'least-conn',
    nodes: ['newconn', 'web01', 'web02', 'web03'],
    paths: ['newconn-web02'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function BalancingMethodsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-balancing-methods-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={balancingMethodsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 244'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
