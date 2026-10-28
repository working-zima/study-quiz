import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['icmp'].diagrams['igmp-group']

// 상자가 같은 네트워크다. 상자 안에 멀티캐스트 라우터를 위에, 호스트 A·B·C를 아래에 두고,
// 상자 밖 위에 다른 네트워크를 둔다. 상자와 라벨은 늘 보이고 흐려지지 않는다. 노드는 모두 회색이다.
const groups = [
  { id: 'lan', x: 8, y: 56, width: 264, height: 192 },
]

const nodes = [
  { id: 'other', x: 92, y: 8, width: 96 },
  { id: 'router', x: 88, y: 88, width: 104 },
  { id: 'host-a', x: 24, y: 168, width: 64 },
  { id: 'host-b', x: 108, y: 168, width: 64 },
  { id: 'host-c', x: 192, y: 168, width: 64 },
]

// 라우터와 다른 네트워크를 잇는 연결선은 늘 보인다. IGMP 메시지 화살표는 모두 상자 안에서 오간다.
const paths: Record<string, string> = {
  'uplink': 'M140 88 V40',
  'query-a': 'M112 120 V144 H56 V168',
  'query-b': 'M140 120 V168',
  'query-c': 'M168 120 V144 H224 V168',
  'report': 'M140 168 V120',
  'leave': 'M140 168 V120',
}

// 메시지 이름과 하는 일을 호스트 아래 빈자리에 두 줄로 둔다.
const notes = [
  { id: 'query-name', x: 140, y: 222, scenarios: ['query'] },
  { id: 'query-what', x: 140, y: 236, scenarios: ['query'] },
  { id: 'report-name', x: 140, y: 222, scenarios: ['report'] },
  { id: 'report-what', x: 140, y: 236, scenarios: ['report'] },
  { id: 'leave-name', x: 140, y: 222, scenarios: ['leave'] },
  { id: 'leave-what', x: 140, y: 236, scenarios: ['leave'] },
]

// 가로형은 다른 네트워크를 상자 밖 왼쪽에, 라우터를 상자 안 왼쪽에, 호스트 셋을 상자 안 오른쪽에 위아래로 둔다.
const wideGroups = [
  { id: 'lan', x: 128, y: 8, width: 304, height: 168 },
]

const wideNodes = [
  { id: 'other', x: 16, y: 72, width: 96 },
  { id: 'router', x: 144, y: 72, width: 104 },
  { id: 'host-a', x: 344, y: 24, width: 72 },
  { id: 'host-b', x: 344, y: 72, width: 72 },
  { id: 'host-c', x: 344, y: 120, width: 72 },
]

const widePaths: Record<string, string> = {
  'uplink': 'M144 88 H112',
  'query-a': 'M248 80 H296 V40 H344',
  'query-b': 'M248 88 H344',
  'query-c': 'M248 96 H296 V136 H344',
  'report': 'M344 88 H248',
  'leave': 'M344 88 H248',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'query-name', x: 196, y: 140 },
  { id: 'query-what', x: 196, y: 154 },
  { id: 'report-name', x: 196, y: 140 },
  { id: 'report-what', x: 196, y: 154 },
  { id: 'leave-name', x: 196, y: 140 },
  { id: 'leave-what', x: 196, y: 154 },
]

const linkIds = ['uplink']

// 질의는 라우터가 호스트 셋에게, 보고와 탈퇴는 호스트 B가 라우터에게 보낸다. 다른 네트워크는 어느 시나리오에서도 흐리다.
export const igmpGroupScenarios: DiagramScenario[] = [
  { id: 'query', nodes: ['router', 'host-a', 'host-b', 'host-c'], paths: ['query-a', 'query-b', 'query-c'] },
  { id: 'report', nodes: ['router', 'host-b'], paths: ['report'] },
  { id: 'leave', nodes: ['router', 'host-b'], paths: ['leave'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IgmpGroupDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-igmp-group-arrow`
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
      scenarios={igmpGroupScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 256'}>
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

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" />
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
