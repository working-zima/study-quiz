import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-basics'].diagrams['traffic-load']

// 서버 셋을 둔 웹 사이트를 아래에 둔다. 사용자는 그 박스 밖에 있다.
const groups = [
  { id: 'site', x: 8, y: 128, width: 264, height: 80 },
]

// 사용자 넷을 위에 한 줄로, 서버 셋을 아래에 한 줄로 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'user-1', x: 8, y: 16, width: 56 },
  { id: 'user-2', x: 76, y: 16, width: 56 },
  { id: 'user-3', x: 144, y: 16, width: 56 },
  { id: 'user-4', x: 212, y: 16, width: 56 },
  { id: 'server-1', x: 44, y: 160, width: 56 },
  { id: 'server-2', x: 112, y: 160, width: 56 },
  { id: 'server-3', x: 180, y: 160, width: 56 },
]

// 몰릴 때는 네 화살표가 서버 2의 위 변으로 모인다. 바깥 사용자의 화살표가 더 아래에서 꺾어 안쪽 화살표와 만나지 않는다.
// 나눠 받을 때는 네 화살표가 같은 높이에서 꺾어 서버 셋으로 나뉜다. 그룹 라벨이 있는 왼쪽 위로는 지나지 않는다.
const paths: Record<string, string> = {
  'concentrated-1': 'M36 48 V112 H116 V160',
  'concentrated-2': 'M104 48 V96 H132 V160',
  'concentrated-3': 'M172 48 V96 H148 V160',
  'concentrated-4': 'M240 48 V112 H164 V160',
  'distributed-1': 'M36 48 V104 H72 V160',
  'distributed-2': 'M104 48 V104 H124 V160',
  'distributed-3': 'M172 48 V104 H156 V160',
  'distributed-4': 'M240 48 V104 H208 V160',
}

// 과부하 곁말은 요청이 몰린 서버 2 바로 아래에 둔다.
const notes = [
  { id: 'overload', x: 140, y: 204, textAnchor: 'middle' as const, scenarios: ['concentrated'] },
]

// 가로형은 사용자 넷을 왼쪽에 쌓고, 웹 사이트를 오른쪽에 둔다.
const wideGroups = [
  { id: 'site', x: 232, y: 8, width: 200, height: 152 },
]

const wideNodes = [
  { id: 'user-1', x: 8, y: 8, width: 64 },
  { id: 'user-2', x: 8, y: 48, width: 64 },
  { id: 'user-3', x: 8, y: 88, width: 64 },
  { id: 'user-4', x: 8, y: 128, width: 64 },
  { id: 'server-1', x: 296, y: 28, width: 64 },
  { id: 'server-2', x: 296, y: 68, width: 64 },
  { id: 'server-3', x: 296, y: 108, width: 64 },
]

// 화살표는 오른쪽으로 가다 꺾어 서버의 왼쪽 변으로 들어간다. 바깥 사용자의 화살표가 더 오른쪽(x 176)에서 꺾는다.
const widePaths: Record<string, string> = {
  'concentrated-1': 'M72 24 H176 V72 H296',
  'concentrated-2': 'M72 64 H160 V80 H296',
  'concentrated-3': 'M72 104 H160 V88 H296',
  'concentrated-4': 'M72 144 H176 V96 H296',
  'distributed-1': 'M72 24 H176 V36 H296',
  'distributed-2': 'M72 64 H160 V76 H296',
  'distributed-3': 'M72 104 H160 V92 H296',
  'distributed-4': 'M72 144 H176 V132 H296',
}

// 곁말은 자리와 정렬이 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'overload', x: 368, y: 87, textAnchor: 'start' as const },
]

export const trafficLoadScenarios: DiagramScenario[] = [
  {
    id: 'concentrated',
    nodes: ['user-1', 'user-2', 'user-3', 'user-4', 'server-2'],
    paths: ['concentrated-1', 'concentrated-2', 'concentrated-3', 'concentrated-4'],
  },
  {
    id: 'distributed',
    nodes: ['user-1', 'user-2', 'user-3', 'user-4', 'server-1', 'server-2', 'server-3'],
    paths: ['distributed-1', 'distributed-2', 'distributed-3', 'distributed-4'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TrafficLoadDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-traffic-load-arrow`
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
      scenarios={trafficLoadScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 168' : '0 0 280 216'}>
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
