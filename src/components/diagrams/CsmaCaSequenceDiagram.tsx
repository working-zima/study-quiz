import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['wireless-lan'].diagrams['csma-ca-sequence']

// 맨 위 박스에 LAPTOP01이 보내기 전에 거치는 차례(채널 듣기 → 정해 둔 시간 → 백오프)를 왼쪽에서 오른쪽으로 둔다.
// 그 아래는 오가는 프레임이다. 첫 줄은 RTS와 CTS, 둘째 줄은 데이터 프레임과 ACK이고, 줄마다 LAPTOP01과 AP01을 되풀이해 그린다.
// LAPTOP02는 첫 줄 맨 오른쪽, AP01 너머에 둔다 — LAPTOP01의 RTS는 AP01에서 멈추고, AP01의 CTS만 LAPTOP02에 닿는다.
// 보내는 쪽의 화살표는 노드 위쪽, 답하는 쪽의 화살표는 노드 아래쪽을 지난다. 노드는 모두 회색이다.
const nodes = [
  { id: 'listen', x: 20, y: 30, width: 68 },
  { id: 'fixed-wait', x: 104, y: 30, width: 84 },
  { id: 'backoff', x: 204, y: 30, width: 56 },
  { id: 'laptop01-rts', x: 8, y: 104, width: 72 },
  { id: 'ap01-rts', x: 116, y: 104, width: 48 },
  { id: 'laptop02', x: 200, y: 104, width: 72 },
  { id: 'laptop01-data', x: 8, y: 188, width: 72 },
  { id: 'ap01-data', x: 116, y: 188, width: 48 },
]

const groups = [
  { id: 'before-send', x: 8, y: 8, width: 264, height: 60, labelX: 16, labelY: 22 },
]

const paths: Record<string, string> = {
  'listen-wait': 'M88 46 H104',
  'wait-backoff': 'M188 46 H204',
  'rts': 'M80 112 H116',
  'cts': 'M116 128 H80',
  'cts-laptop02': 'M164 128 H200',
  'data': 'M80 196 H116',
  'ack': 'M116 212 H80',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 프레임 이름 곁말은 그 화살표 곁에 둔다 — 보내는 화살표는 줄 위, 답하는 화살표는 줄 아래.
// CTS는 AP01에서 양쪽으로 나가므로 AP01 바로 아래에 두고, LAPTOP02의 곁말은 그 아래 줄에 오른쪽으로 붙인다.
const noteScenarios: Record<string, string[]> = {
  'rts-note': ['rtscts'],
  'cts-note': ['rtscts'],
  'hold-note': ['rtscts'],
  'data-note': ['basic', 'rtscts'],
  'ack-note': ['basic', 'rtscts'],
}

const notes: Note[] = [
  { id: 'rts-note', x: 98, y: 98, anchor: 'middle' },
  { id: 'cts-note', x: 140, y: 150, anchor: 'middle' },
  { id: 'hold-note', x: 272, y: 164, anchor: 'end' },
  { id: 'data-note', x: 98, y: 182, anchor: 'middle' },
  { id: 'ack-note', x: 98, y: 234, anchor: 'middle' },
]

// 가로형은 같은 짜임을 넓힌다. 장치 사이를 넓혀 화살표를 길게 두고, LAPTOP02의 곁말은 CTS 곁말과 같은 줄에 둔다.
const wideNodes = [
  { id: 'listen', x: 24, y: 30, width: 104 },
  { id: 'fixed-wait', x: 168, y: 30, width: 104 },
  { id: 'backoff', x: 312, y: 30, width: 104 },
  { id: 'laptop01-rts', x: 24, y: 96, width: 104 },
  { id: 'ap01-rts', x: 200, y: 96, width: 72 },
  { id: 'laptop02', x: 336, y: 96, width: 96 },
  { id: 'laptop01-data', x: 24, y: 168, width: 104 },
  { id: 'ap01-data', x: 200, y: 168, width: 72 },
]

const wideGroups = [
  { id: 'before-send', x: 8, y: 8, width: 424, height: 60, labelX: 16, labelY: 22 },
]

const widePaths: Record<string, string> = {
  'listen-wait': 'M128 46 H168',
  'wait-backoff': 'M272 46 H312',
  'rts': 'M128 104 H200',
  'cts': 'M200 120 H128',
  'cts-laptop02': 'M272 120 H336',
  'data': 'M128 176 H200',
  'ack': 'M200 192 H128',
}

const wideNotes: Note[] = [
  { id: 'rts-note', x: 164, y: 90, anchor: 'middle' },
  { id: 'cts-note', x: 236, y: 142, anchor: 'middle' },
  { id: 'hold-note', x: 432, y: 142, anchor: 'end' },
  { id: 'data-note', x: 164, y: 162, anchor: 'middle' },
  { id: 'ack-note', x: 164, y: 214, anchor: 'middle' },
]

// 기본 차례: 기다림을 거친 뒤 데이터 프레임과 ACK만 오가고, RTS·CTS 줄과 LAPTOP02는 흐리다.
// RTS/CTS: 기다림을 거친 뒤 RTS·CTS가 먼저 오가고(CTS는 LAPTOP02에도 닿는다), 이어서 데이터 프레임과 ACK가 오간다.
export const csmaCaSequenceScenarios: DiagramScenario[] = [
  {
    id: 'basic',
    nodes: ['listen', 'fixed-wait', 'backoff', 'laptop01-data', 'ap01-data'],
    paths: ['listen-wait', 'wait-backoff', 'data', 'ack'],
  },
  {
    id: 'rtscts',
    nodes: ['listen', 'fixed-wait', 'backoff', 'laptop01-rts', 'ap01-rts', 'laptop02', 'laptop01-data', 'ap01-data'],
    paths: ['listen-wait', 'wait-backoff', 'rts', 'cts', 'cts-laptop02', 'data', 'ack'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CsmaCaSequenceDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-csma-ca-sequence-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={csmaCaSequenceScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 224' : '0 0 280 244'}>
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

          {active && layoutNotes.filter((note) => noteScenarios[note.id].includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
