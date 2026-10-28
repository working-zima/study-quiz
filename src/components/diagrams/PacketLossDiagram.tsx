import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-basics'].diagrams['ping-loss']

// 보낸 메시지를 세는 박스를 위에, 돌아온 응답을 세는 박스를 아래에 둔다. 두 호스트는 박스 밖 맨 위에 있다.
const groups = [
  { id: 'sent', x: 4, y: 64, width: 272, height: 64 },
  { id: 'back', x: 4, y: 144, width: 272, height: 64 },
]

// 칸 하나가 메시지나 응답 하나다. 본문의 ping 예에서 가장 많이 보낸 수인 7개만큼 칸을 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'sender', x: 8, y: 16, width: 96 },
  { id: 'receiver', x: 176, y: 16, width: 96 },
  { id: 'sent-1', x: 18, y: 88, width: 28 },
  { id: 'sent-2', x: 54, y: 88, width: 28 },
  { id: 'sent-3', x: 90, y: 88, width: 28 },
  { id: 'sent-4', x: 126, y: 88, width: 28 },
  { id: 'sent-5', x: 162, y: 88, width: 28 },
  { id: 'sent-6', x: 198, y: 88, width: 28 },
  { id: 'sent-7', x: 234, y: 88, width: 28 },
  { id: 'back-1', x: 18, y: 168, width: 28 },
  { id: 'back-2', x: 54, y: 168, width: 28 },
  { id: 'back-3', x: 90, y: 168, width: 28 },
  { id: 'back-4', x: 126, y: 168, width: 28 },
  { id: 'back-5', x: 162, y: 168, width: 28 },
  { id: 'back-6', x: 198, y: 168, width: 28 },
  { id: 'back-7', x: 234, y: 168, width: 28 },
]

// 메시지는 위쪽 통로로 상대 호스트에게 가고, 응답은 아래쪽 통로로 돌아온다.
const paths: Record<string, string> = {
  'request': 'M104 28 H176',
  'reply': 'M176 36 H104',
}

// 손실 곁말은 「돌아온 응답」 박스 오른쪽 위에 둔다. 결과마다 글만 바뀐다.
const notes = [
  { id: 'loss-zero', x: 266, y: 158, textAnchor: 'end' as const, scenarios: ['all-back'] },
  { id: 'loss-full', x: 266, y: 158, textAnchor: 'end' as const, scenarios: ['none-back'] },
]

const sentIds = ['sent-1', 'sent-2', 'sent-3', 'sent-4', 'sent-5', 'sent-6', 'sent-7']
const backIds = ['back-1', 'back-2', 'back-3', 'back-4', 'back-5', 'back-6', 'back-7']

// 가로형은 두 호스트를 양 끝에 두고, 두 박스를 그 아래에 나란히 둔다.
const wideGroups = [
  { id: 'sent', x: 4, y: 64, width: 212, height: 64 },
  { id: 'back', x: 224, y: 64, width: 212, height: 64 },
]

const wideNodes = [
  { id: 'sender', x: 8, y: 16, width: 120 },
  { id: 'receiver', x: 312, y: 16, width: 120 },
  { id: 'sent-1', x: 14, y: 88, width: 24 },
  { id: 'sent-2', x: 42, y: 88, width: 24 },
  { id: 'sent-3', x: 70, y: 88, width: 24 },
  { id: 'sent-4', x: 98, y: 88, width: 24 },
  { id: 'sent-5', x: 126, y: 88, width: 24 },
  { id: 'sent-6', x: 154, y: 88, width: 24 },
  { id: 'sent-7', x: 182, y: 88, width: 24 },
  { id: 'back-1', x: 234, y: 88, width: 24 },
  { id: 'back-2', x: 262, y: 88, width: 24 },
  { id: 'back-3', x: 290, y: 88, width: 24 },
  { id: 'back-4', x: 318, y: 88, width: 24 },
  { id: 'back-5', x: 346, y: 88, width: 24 },
  { id: 'back-6', x: 374, y: 88, width: 24 },
  { id: 'back-7', x: 402, y: 88, width: 24 },
]

const widePaths: Record<string, string> = {
  'request': 'M128 28 H312',
  'reply': 'M312 36 H128',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'loss-zero', x: 426, y: 78, textAnchor: 'end' as const },
  { id: 'loss-full', x: 426, y: 78, textAnchor: 'end' as const },
]

export const packetLossScenarios: DiagramScenario[] = [
  { id: 'all-back', nodes: ['sender', 'receiver', ...sentIds, ...backIds], paths: ['request', 'reply'] },
  { id: 'none-back', nodes: ['sender', 'receiver', 'sent-1', 'sent-2', 'sent-3'], paths: ['request'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PacketLossDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-packet-loss-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={packetLossScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 136' : '0 0 280 216'}>
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
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
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
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
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
