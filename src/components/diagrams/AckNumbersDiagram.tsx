import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-udp'].diagrams['ack-numbers']

// 세로형은 왼쪽에 보내는 쪽, 오른쪽에 받는 쪽 기둥(그룹 박스)을 세우고, 그 사이에 오가는 세그먼트 하나를 노드 하나로 오가는 차례대로 위에서 아래로 놓는다.
// 방향은 노드 양옆의 짧은 화살표가 보인다 — 세그먼트는 보내는 쪽에서 받는 쪽으로, 확인 응답은 받는 쪽에서 보내는 쪽으로 간다.
// 시나리오마다 쓰는 확인 응답은 서로 다른 노드다. 같은 번호 6001이라도 차례대로 받았을 때와 빠졌을 때의 노드가 따로 있다. 노드는 모두 회색이다.
const nodes = [
  { id: 'seg-1', x: 74, y: 32, width: 132 },
  { id: 'ack-1', x: 74, y: 72, width: 132 },
  { id: 'seg-2', x: 74, y: 112, width: 132 },
  { id: 'seg-3', x: 74, y: 152, width: 132 },
  { id: 'ack-2', x: 74, y: 192, width: 132 },
  { id: 'ack-3', x: 74, y: 232, width: 132 },
]

const groups = [
  { id: 'sender', x: 8, y: 8, width: 52, height: 264, labelX: 12, labelY: 20 },
  { id: 'receiver', x: 220, y: 8, width: 52, height: 264, labelX: 224, labelY: 20 },
]

const paths: Record<string, string> = {
  's1-out': 'M60 48 H74',
  's1-in': 'M206 48 H220',
  'ack1-out': 'M220 88 H206',
  'ack1-in': 'M74 88 H60',
  's2-out': 'M60 128 H74',
  's2-in': 'M206 128 H220',
  's3-out': 'M60 168 H74',
  's3-in': 'M206 168 H220',
  'ack2-out': 'M220 208 H206',
  'ack2-in': 'M74 208 H60',
  'ack3-out': 'M220 248 H206',
  'ack3-in': 'M74 248 H60',
}

// 곁말은 자기 시나리오에서만 보이고, 받는 쪽 기둥 안에서 사라진 세그먼트와 같은 줄에 놓인다.
const notes = [
  { id: 'lost', x: 246, y: 132, scenarios: ['gap'] },
]

// 가로형도 같은 꼴로 두 기둥 사이를 넓힌다.
const wideNodes = [
  { id: 'seg-1', x: 152, y: 32, width: 136 },
  { id: 'ack-1', x: 152, y: 72, width: 136 },
  { id: 'seg-2', x: 152, y: 112, width: 136 },
  { id: 'seg-3', x: 152, y: 152, width: 136 },
  { id: 'ack-2', x: 152, y: 192, width: 136 },
  { id: 'ack-3', x: 152, y: 232, width: 136 },
]

const wideGroups = [
  { id: 'sender', x: 8, y: 8, width: 88, height: 264, labelX: 16, labelY: 20 },
  { id: 'receiver', x: 344, y: 8, width: 88, height: 264, labelX: 352, labelY: 20 },
]

const widePaths: Record<string, string> = {
  's1-out': 'M96 48 H152',
  's1-in': 'M288 48 H344',
  'ack1-out': 'M344 88 H288',
  'ack1-in': 'M152 88 H96',
  's2-out': 'M96 128 H152',
  's2-in': 'M288 128 H344',
  's3-out': 'M96 168 H152',
  's3-in': 'M288 168 H344',
  'ack2-out': 'M344 208 H288',
  'ack2-in': 'M152 208 H96',
  'ack3-out': 'M344 248 H288',
  'ack3-in': 'M152 248 H96',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'lost', x: 388, y: 132 },
]

// 차례대로: 첫째 세그먼트를 받고 6001로 답한다.
// 빠졌을 때: 둘째 세그먼트는 받는 쪽에 닿지 않고(흐림), 셋째를 받고도 사라진 둘째의 번호 6001로 답한다.
// 한꺼번에 확인: 셋을 다 받고 8001 하나로 답한다.
export const ackNumbersScenarios: DiagramScenario[] = [
  { id: 'in-order', nodes: ['seg-1', 'ack-1'], paths: ['s1-out', 's1-in', 'ack1-out', 'ack1-in'] },
  { id: 'gap', nodes: ['seg-1', 'seg-3', 'ack-2'], paths: ['s1-out', 's1-in', 's2-out', 's3-out', 's3-in', 'ack2-out', 'ack2-in'] },
  { id: 'cumulative', nodes: ['seg-1', 'seg-2', 'seg-3', 'ack-3'], paths: ['s1-out', 's1-in', 's2-out', 's2-in', 's3-out', 's3-in', 'ack3-out', 'ack3-in'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AckNumbersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ack-numbers-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={ackNumbersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 280' : '0 0 280 280'}>
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
            <text key={group.id} data-group-label={group.id} x={group.labelX} y={group.labelY} className="fill-muted" fontSize="9">
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
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
