import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-basics'].diagrams['cast-types']

// 네트워크 박스 하나가 보내는 호스트와 호스트 넷을 모두 감싼다.
const groups = [
  { id: 'network', x: 4, y: 8, width: 272, height: 204 },
]

// 보내는 호스트를 위에, 호스트 넷을 그 아래 두 줄 두 칸에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'sender', x: 82, y: 32, width: 116 },
  { id: 'host-a', x: 12, y: 96, width: 100 },
  { id: 'host-b', x: 168, y: 96, width: 100 },
  { id: 'host-c', x: 12, y: 160, width: 100 },
  { id: 'host-d', x: 168, y: 160, width: 100 },
]

// 보내는 호스트에서 두 칸 사이 통로(x 140)로 내려가 각 호스트의 안쪽 변으로 들어간다. 내려가는 줄기는 함께 쓴다.
const paths: Record<string, string> = {
  'to-a': 'M140 64 V112 H112',
  'to-b': 'M140 64 V112 H168',
  'to-c': 'M140 64 V176 H112',
  'to-d': 'M140 64 V176 H168',
}

// 목적지와 그룹은 호스트 바로 아래의 곁말 글자로만 보인다.
const notes = [
  { id: 'destination', x: 62, y: 140, textAnchor: 'middle' as const, scenarios: ['unicast'] },
  { id: 'group-b', x: 218, y: 140, textAnchor: 'middle' as const, scenarios: ['multicast'] },
  { id: 'group-c', x: 62, y: 204, textAnchor: 'middle' as const, scenarios: ['multicast'] },
]

// 가로형은 보내는 호스트를 위 가운데에, 호스트 넷을 아래 한 줄에 둔다.
const wideGroups = [
  { id: 'network', x: 4, y: 8, width: 432, height: 152 },
]

const wideNodes = [
  { id: 'sender', x: 160, y: 32, width: 120 },
  { id: 'host-a', x: 14, y: 104, width: 88 },
  { id: 'host-b', x: 122, y: 104, width: 88 },
  { id: 'host-c', x: 230, y: 104, width: 88 },
  { id: 'host-d', x: 338, y: 104, width: 88 },
]

// 보내는 호스트에서 y 84의 가로줄로 내려가 각 호스트의 위 변 가운데로 들어간다.
const widePaths: Record<string, string> = {
  'to-a': 'M220 64 V84 H58 V104',
  'to-b': 'M220 64 V84 H166 V104',
  'to-c': 'M220 64 V84 H274 V104',
  'to-d': 'M220 64 V84 H382 V104',
}

// 곁말은 자리가 배치마다 다르다. 정렬과 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'destination', x: 58, y: 148 },
  { id: 'group-b', x: 166, y: 148 },
  { id: 'group-c', x: 274, y: 148 },
]

export const castTypesScenarios: DiagramScenario[] = [
  { id: 'unicast', nodes: ['sender', 'host-a'], paths: ['to-a'] },
  { id: 'broadcast', nodes: ['sender', 'host-a', 'host-b', 'host-c', 'host-d'], paths: ['to-a', 'to-b', 'to-c', 'to-d'] },
  { id: 'multicast', nodes: ['sender', 'host-b', 'host-c'], paths: ['to-b', 'to-c'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CastTypesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-cast-types-arrow`
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
      scenarios={castTypesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 168' : '0 0 280 220'}>
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
