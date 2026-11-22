import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['transmission-media'].diagrams['channel-coding-flow']

// 세로형은 원래 정보에서 되살린 데이터 비트까지를 위에서 아래로 한 줄로 잇는다. 위의 「보내는 쪽」 박스에 원천 부호화와 채널 부호화의 차례를,
// 아래의 「받는 쪽」 박스에 오류 검출·정정과 데이터 비트를 두고, 매체는 두 박스 사이 밖에 둔다. 곁말은 자기 노드 오른쪽의 빈자리에 둔다.
const nodes = [
  { id: 'info', x: 32, y: 28, width: 80 },
  { id: 'source-coding', x: 28, y: 80, width: 88 },
  { id: 'data', x: 28, y: 132, width: 88 },
  { id: 'channel-coding', x: 28, y: 184, width: 88 },
  { id: 'coded', x: 24, y: 236, width: 152 },
  { id: 'medium', x: 40, y: 296, width: 64 },
  { id: 'check', x: 24, y: 364, width: 100 },
  { id: 'data-out', x: 28, y: 416, width: 88 },
]

const groups = [
  { id: 'sender', x: 8, y: 8, width: 264, height: 268, labelX: 16, labelY: 21 },
  { id: 'receiver', x: 8, y: 344, width: 264, height: 112, labelX: 16, labelY: 357 },
]

const paths: Record<string, string> = {
  'info-source': 'M72 60 V80',
  'source-data': 'M72 112 V132',
  'data-channel': 'M72 164 V184',
  'channel-coded': 'M72 216 V236',
  'coded-medium': 'M72 268 V296',
  'medium-check': 'M72 328 V364',
  'check-out': 'M72 396 V416',
}

const linkIds = ['info-source', 'source-data', 'data-channel', 'channel-coded', 'coded-medium', 'medium-check', 'check-out']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'source-note': 'source',
  'add-note': 'channel',
  'medium-note': 'channel',
  'check-note': 'channel',
}

const notes: Note[] = [
  { id: 'source-note', x: 128, y: 99, anchor: 'start' },
  { id: 'add-note', x: 128, y: 203, anchor: 'start' },
  { id: 'medium-note', x: 116, y: 315, anchor: 'start' },
  { id: 'check-note', x: 136, y: 383, anchor: 'start' },
]

// 가로형은 보내는 쪽 박스 안에서 윗줄을 왼쪽에서 오른쪽으로(원래 정보 → 원천 부호화 → 데이터 비트), 오른쪽 끝에서 아래로 내려(채널 부호화)
// 아랫줄을 오른쪽에서 왼쪽으로(데이터 비트 + 여분 비트) 잇는다. 그 아래 박스 밖에 매체를, 오른쪽 「받는 쪽」 박스에 오류 검출·정정과 데이터 비트를 둔다.
const wideNodes = [
  { id: 'info', x: 24, y: 28, width: 80 },
  { id: 'source-coding', x: 128, y: 28, width: 88 },
  { id: 'data', x: 248, y: 28, width: 88 },
  { id: 'channel-coding', x: 248, y: 100, width: 88 },
  { id: 'coded', x: 24, y: 100, width: 152 },
  { id: 'medium', x: 40, y: 196, width: 64 },
  { id: 'check', x: 200, y: 196, width: 100 },
  { id: 'data-out', x: 324, y: 196, width: 88 },
]

const wideGroups = [
  { id: 'sender', x: 8, y: 8, width: 424, height: 156, labelX: 16, labelY: 21 },
  { id: 'receiver', x: 184, y: 176, width: 248, height: 80, labelX: 192, labelY: 189 },
]

const widePaths: Record<string, string> = {
  'info-source': 'M104 44 H128',
  'source-data': 'M216 44 H248',
  'data-channel': 'M292 60 V100',
  'channel-coded': 'M248 116 H176',
  'coded-medium': 'M72 132 V196',
  'medium-check': 'M104 212 H200',
  'check-out': 'M300 212 H324',
}

const wideNotes: Note[] = [
  { id: 'source-note', x: 172, y: 84, anchor: 'middle' },
  { id: 'add-note', x: 292, y: 152, anchor: 'middle' },
  { id: 'medium-note', x: 16, y: 252, anchor: 'start' },
  { id: 'check-note', x: 250, y: 244, anchor: 'middle' },
]

// 원천 부호화: 원래 정보를 데이터 비트로 바꾸는 구간. 채널 부호화: 데이터 비트에 여분을 덧붙여 보내고 받는 쪽이 되살리는 구간.
export const channelCodingFlowScenarios: DiagramScenario[] = [
  {
    id: 'source',
    nodes: ['info', 'source-coding', 'data'],
    paths: [],
  },
  {
    id: 'channel',
    nodes: ['data', 'channel-coding', 'coded', 'medium', 'check', 'data-out'],
    paths: [],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ChannelCodingFlowDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-channel-coding-flow-arrow`
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
      scenarios={channelCodingFlowScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 264' : '0 0 280 464'}>
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

          {linkIds.map((id) => (
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              markerEnd={`url(#${arrowId})`}
            />
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
