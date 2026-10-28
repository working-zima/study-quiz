import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['icmp'].diagrams['ip-limits']

// 세로형은 호스트 A를 맨 위에, 호스트 B를 맨 아래에 가로로 길게 두고, 그 사이에 패킷 셋을 한 줄로 늘어놓는다.
// 화살표는 패킷마다 따로 내려간다. 노드는 모두 회색이고 박스는 없다.
const nodes = [
  { id: 'host-a', x: 16, y: 8, width: 248 },
  { id: 'packet-1', x: 16, y: 96, width: 72 },
  { id: 'packet-2', x: 104, y: 96, width: 72 },
  { id: 'packet-3', x: 192, y: 96, width: 72 },
  { id: 'host-b', x: 16, y: 184, width: 248 },
]

const paths: Record<string, string> = {
  'send-1': 'M52 40 V96',
  'send-2': 'M140 40 V96',
  'send-3': 'M228 40 V96',
  'arrive-1': 'M52 128 V184',
  'arrive-3': 'M228 128 V184',
}

// 사라짐과 연결 없음은 패킷 줄과 호스트 B 사이 가운데에, 닿은 차례는 호스트 B 아래에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'lost-note', x: 140, y: 152, anchor: 'middle', scenarios: ['unreliable'] },
  { id: 'order-note', x: 140, y: 236, anchor: 'middle', scenarios: ['unreliable'] },
  { id: 'connect-note', x: 140, y: 152, anchor: 'middle', scenarios: ['connectionless'] },
]

// 가로형은 호스트 A를 왼쪽에, 패킷 셋을 가운데 세로로, 호스트 B를 오른쪽에 둔다.
const wideNodes = [
  { id: 'host-a', x: 16, y: 64, width: 96 },
  { id: 'packet-1', x: 160, y: 8, width: 80 },
  { id: 'packet-2', x: 160, y: 64, width: 80 },
  { id: 'packet-3', x: 160, y: 120, width: 80 },
  { id: 'host-b', x: 336, y: 64, width: 96 },
]

const widePaths: Record<string, string> = {
  'send-1': 'M112 72 H136 V24 H160',
  'send-2': 'M112 80 H160',
  'send-3': 'M112 88 H136 V136 H160',
  'arrive-1': 'M240 24 H288 V72 H336',
  'arrive-3': 'M240 136 H288 V88 H336',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'lost-note', x: 200, y: 110, anchor: 'middle' },
  { id: 'order-note', x: 432, y: 52, anchor: 'end' },
  { id: 'connect-note', x: 288, y: 84, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드를 적는다. 비신뢰성은 닿는 쪽을, 비연결형은 보내는 쪽을 밝힌다.
// 패킷 2에서 호스트 B로 가는 화살표는 두지 않는다 — 패킷 2는 호스트 B에 닿지 않는다.
export const ipLimitsScenarios: DiagramScenario[] = [
  { id: 'unreliable', nodes: ['packet-1', 'packet-2', 'packet-3', 'host-b'], paths: ['arrive-1', 'arrive-3'] },
  { id: 'connectionless', nodes: ['host-a', 'packet-1', 'packet-2', 'packet-3'], paths: ['send-1', 'send-2', 'send-3'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IpLimitsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ip-limits-arrow`
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
      scenarios={ipLimitsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 244'}>
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
