import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['hub-switch-vlan'].diagrams['collision-domain']

// 같은 호스트 A~D를 위에서는 허브에, 아래에서는 스위치에 하나씩 이은 두 장면을 세로로 쌓는다.
// 두 장면은 허브 도식(HubRepeatDiagram)과 같은 모양이고, 노드는 모두 회색이다.
const nodes = [
  { id: 'hub', x: 10, y: 12, width: 260 },
  { id: 'host-a', x: 10, y: 76, width: 56 },
  { id: 'host-b', x: 78, y: 76, width: 56 },
  { id: 'host-c', x: 146, y: 76, width: 56 },
  { id: 'host-d', x: 214, y: 76, width: 56 },
  { id: 'switch', x: 10, y: 144, width: 260 },
  { id: 'sw-host-a', x: 10, y: 204, width: 56 },
  { id: 'sw-host-b', x: 78, y: 204, width: 56 },
  { id: 'sw-host-c', x: 146, y: 204, width: 56 },
  { id: 'sw-host-d', x: 214, y: 204, width: 56 },
]

// 케이블 여덟은 늘 보인다. 이 도식에는 화살표가 없다 — 시나리오는 충돌 도메인 박스와 곁말로 갈린다.
const paths: Record<string, string> = {
  'hub-cable-a': 'M38 44 V76',
  'hub-cable-b': 'M106 44 V76',
  'hub-cable-c': 'M174 44 V76',
  'hub-cable-d': 'M242 44 V76',
  'sw-cable-a': 'M38 176 V204',
  'sw-cable-b': 'M106 176 V204',
  'sw-cable-c': 'M174 176 V204',
  'sw-cable-d': 'M242 176 V204',
}

const hubLinkIds = ['hub-cable-a', 'hub-cable-b', 'hub-cable-c', 'hub-cable-d']
const switchLinkIds = ['sw-cable-a', 'sw-cable-b', 'sw-cable-c', 'sw-cable-d']
const linkIds = [...hubLinkIds, ...switchLinkIds]

// 충돌 도메인 박스는 자기 시나리오에서만 그린다. 허브 쪽은 허브와 호스트 넷을 한 박스로,
// 스위치 쪽은 포트에 이은 케이블과 호스트 하나씩을 박스 넷으로 두르고 스위치는 두르지 않는다.
const groups = [
  { id: 'hub-domain', x: 4, y: 4, width: 272, height: 112, scenarios: ['hub'] },
  { id: 'sw-domain-a', x: 6, y: 180, width: 64, height: 62, scenarios: ['switch'] },
  { id: 'sw-domain-b', x: 74, y: 180, width: 64, height: 62, scenarios: ['switch'] },
  { id: 'sw-domain-c', x: 142, y: 180, width: 64, height: 62, scenarios: ['switch'] },
  { id: 'sw-domain-d', x: 210, y: 180, width: 64, height: 62, scenarios: ['switch'] },
]

// 개수 곁말은 각 장면 아래 가운데에 둔다.
const notes = [
  { id: 'hub-count', x: 140, y: 132, scenarios: ['hub'] },
  { id: 'switch-count', x: 140, y: 258, scenarios: ['switch'] },
]

// 가로형도 두 장면을 세로로 쌓는다. 폭이 넓어진 만큼 호스트를 넓히고 케이블을 줄인다.
const wideNodes = [
  { id: 'hub', x: 14, y: 12, width: 412 },
  { id: 'host-a', x: 14, y: 72, width: 88 },
  { id: 'host-b', x: 122, y: 72, width: 88 },
  { id: 'host-c', x: 230, y: 72, width: 88 },
  { id: 'host-d', x: 338, y: 72, width: 88 },
  { id: 'switch', x: 14, y: 140, width: 412 },
  { id: 'sw-host-a', x: 14, y: 196, width: 88 },
  { id: 'sw-host-b', x: 122, y: 196, width: 88 },
  { id: 'sw-host-c', x: 230, y: 196, width: 88 },
  { id: 'sw-host-d', x: 338, y: 196, width: 88 },
]

const widePaths: Record<string, string> = {
  'hub-cable-a': 'M58 44 V72',
  'hub-cable-b': 'M166 44 V72',
  'hub-cable-c': 'M274 44 V72',
  'hub-cable-d': 'M382 44 V72',
  'sw-cable-a': 'M58 172 V196',
  'sw-cable-b': 'M166 172 V196',
  'sw-cable-c': 'M274 172 V196',
  'sw-cable-d': 'M382 172 V196',
}

// 박스와 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형 groups·notes에서 id로 가져온다.
const wideGroups = [
  { id: 'hub-domain', x: 6, y: 4, width: 428, height: 108 },
  { id: 'sw-domain-a', x: 8, y: 176, width: 100, height: 58 },
  { id: 'sw-domain-b', x: 116, y: 176, width: 100, height: 58 },
  { id: 'sw-domain-c', x: 224, y: 176, width: 100, height: 58 },
  { id: 'sw-domain-d', x: 332, y: 176, width: 100, height: 58 },
]

const wideNotes = [
  { id: 'hub-count', x: 220, y: 128 },
  { id: 'switch-count', x: 220, y: 250 },
]

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다. 고른 장면 밖은 흐려진다.
export const collisionDomainScenarios: DiagramScenario[] = [
  { id: 'hub', nodes: ['hub', 'host-a', 'host-b', 'host-c', 'host-d', ...hubLinkIds], paths: [] },
  { id: 'switch', nodes: ['switch', 'sw-host-a', 'sw-host-b', 'sw-host-c', 'sw-host-d', ...switchLinkIds], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CollisionDomainDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutGroups = wide ? wideGroups.map((group) => ({ ...groups.find(({ id }) => id === group.id)!, ...group })) : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={collisionDomainScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 256' : '0 0 280 264'}>
          {active && layoutGroups.filter((group) => group.scenarios.includes(active.id)).map((group) => (
            <rect
              key={group.id}
              data-group={group.id}
              x={group.x}
              y={group.y}
              width={group.width}
              height={group.height}
              rx="4"
              className="fill-none stroke-disabled"
              strokeWidth="1"
            />
          ))}

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
