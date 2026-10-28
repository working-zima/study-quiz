import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['icmp'].diagrams['ping-result']

// 위에서부터 요청 1~4의 왕복을 한 줄씩 그린다. 줄마다 같은 두 호스트를 다시 그리고, 아래 상자에 결과 요약을 둔다.
// 요약 상자는 늘 보이고 흐려지지 않는다. 노드는 모두 회색이다.
const groups = [
  { id: 'summary', x: 8, y: 200, width: 264, height: 104 },
]

const nodes = [
  { id: 'host-a-1', x: 8, y: 8, width: 56 },
  { id: 'host-b-1', x: 216, y: 8, width: 56 },
  { id: 'host-a-2', x: 8, y: 56, width: 56 },
  { id: 'host-b-2', x: 216, y: 56, width: 56 },
  { id: 'host-a-3', x: 8, y: 104, width: 56 },
  { id: 'host-b-3', x: 216, y: 104, width: 56 },
  { id: 'host-a-4', x: 8, y: 152, width: 56 },
  { id: 'host-b-4', x: 216, y: 152, width: 56 },
  { id: 'sent', x: 16, y: 224, width: 80 },
  { id: 'received', x: 100, y: 224, width: 80 },
  { id: 'loss', x: 184, y: 224, width: 80 },
  { id: 'min', x: 16, y: 264, width: 80 },
  { id: 'avg', x: 100, y: 264, width: 80 },
  { id: 'max', x: 184, y: 264, width: 80 },
]

// 줄마다 위쪽 화살표가 에코 요청, 아래쪽 화살표가 에코 응답이다. 요청 3에는 응답 화살표가 없다.
const paths: Record<string, string> = {
  'request-1': 'M64 16 H216',
  'reply-1': 'M216 32 H64',
  'request-2': 'M64 64 H216',
  'reply-2': 'M216 80 H64',
  'request-3': 'M64 112 H216',
  'request-4': 'M64 160 H216',
  'reply-4': 'M216 176 H64',
}

// 곁말은 자기 줄의 두 화살표 사이 가운데에 놓인다.
const notes = [
  { id: 'rtt-1', x: 140, y: 28, scenarios: ['replies', 'rtt'] },
  { id: 'rtt-2', x: 140, y: 76, scenarios: ['replies', 'rtt'] },
  { id: 'lost-3', x: 140, y: 124, scenarios: ['loss'] },
  { id: 'rtt-4', x: 140, y: 172, scenarios: ['replies', 'rtt'] },
]

// 가로형은 왕복 줄 넷을 왼쪽에, 요약 상자를 오른쪽에 둔다. 요약은 왼쪽 열이 보낸 수·받은 수·손실률, 오른쪽 열이 최소·평균·최대다.
const wideGroups = [
  { id: 'summary', x: 248, y: 8, width: 184, height: 152 },
]

const wideNodes = [
  { id: 'host-a-1', x: 16, y: 8, width: 56 },
  { id: 'host-b-1', x: 176, y: 8, width: 56 },
  { id: 'host-a-2', x: 16, y: 48, width: 56 },
  { id: 'host-b-2', x: 176, y: 48, width: 56 },
  { id: 'host-a-3', x: 16, y: 88, width: 56 },
  { id: 'host-b-3', x: 176, y: 88, width: 56 },
  { id: 'host-a-4', x: 16, y: 128, width: 56 },
  { id: 'host-b-4', x: 176, y: 128, width: 56 },
  { id: 'sent', x: 256, y: 32, width: 80 },
  { id: 'received', x: 256, y: 72, width: 80 },
  { id: 'loss', x: 256, y: 112, width: 80 },
  { id: 'min', x: 344, y: 32, width: 80 },
  { id: 'avg', x: 344, y: 72, width: 80 },
  { id: 'max', x: 344, y: 112, width: 80 },
]

const widePaths: Record<string, string> = {
  'request-1': 'M72 16 H176',
  'reply-1': 'M176 32 H72',
  'request-2': 'M72 56 H176',
  'reply-2': 'M176 72 H72',
  'request-3': 'M72 96 H176',
  'request-4': 'M72 136 H176',
  'reply-4': 'M176 152 H72',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'rtt-1', x: 124, y: 28 },
  { id: 'rtt-2', x: 124, y: 68 },
  { id: 'lost-3', x: 124, y: 108 },
  { id: 'rtt-4', x: 124, y: 148 },
]

const rows = ['host-a-1', 'host-b-1', 'host-a-2', 'host-b-2', 'host-a-3', 'host-b-3', 'host-a-4', 'host-b-4']

// 응답 줄은 응답이 돌아온 요청 1·2·4의 왕복을, 손실은 네 줄 전부와 보낸 수·받은 수·손실률을,
// 왕복 시간은 응답 줄의 값과 최소·평균·최대를 보인다.
export const pingResultScenarios: DiagramScenario[] = [
  {
    id: 'replies',
    nodes: ['host-a-1', 'host-b-1', 'host-a-2', 'host-b-2', 'host-a-4', 'host-b-4'],
    paths: ['request-1', 'reply-1', 'request-2', 'reply-2', 'request-4', 'reply-4'],
  },
  {
    id: 'loss',
    nodes: [...rows, 'sent', 'received', 'loss'],
    paths: ['request-1', 'reply-1', 'request-2', 'reply-2', 'request-3', 'request-4', 'reply-4'],
  },
  { id: 'rtt', nodes: ['min', 'avg', 'max'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PingResultDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ping-result-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
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
      scenarios={pingResultScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 168' : '0 0 280 312'}>
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
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
