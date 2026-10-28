import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['hub-switch-vlan'].diagrams['switch-forward']

// 같은 호스트 A~D를 위에서는 허브에, 아래에서는 스위치에 하나씩 이은 두 장면을 세로로 쌓는다.
// 두 장면은 허브 도식(HubRepeatDiagram)과 같은 모양이고, 노드는 모두 회색이다.
const nodes = [
  { id: 'hub', x: 10, y: 8, width: 260 },
  { id: 'host-a', x: 10, y: 72, width: 56 },
  { id: 'host-b', x: 78, y: 72, width: 56 },
  { id: 'host-c', x: 146, y: 72, width: 56 },
  { id: 'host-d', x: 214, y: 72, width: 56 },
  { id: 'switch', x: 10, y: 136, width: 260 },
  { id: 'sw-host-a', x: 10, y: 200, width: 56 },
  { id: 'sw-host-b', x: 78, y: 200, width: 56 },
  { id: 'sw-host-c', x: 146, y: 200, width: 56 },
  { id: 'sw-host-d', x: 214, y: 200, width: 56 },
]

// 케이블 여덟은 늘 보인다. 화살표는 케이블 위에 겹쳐 그린다 — 호스트 A에서 장비로 올라가고, 장비에서 내보낸 호스트로 내려간다.
const paths: Record<string, string> = {
  'hub-cable-a': 'M38 40 V72',
  'hub-cable-b': 'M106 40 V72',
  'hub-cable-c': 'M174 40 V72',
  'hub-cable-d': 'M242 40 V72',
  'sw-cable-a': 'M38 168 V200',
  'sw-cable-b': 'M106 168 V200',
  'sw-cable-c': 'M174 168 V200',
  'sw-cable-d': 'M242 168 V200',
  'hub-from-a': 'M38 72 V40',
  'hub-to-b': 'M106 40 V72',
  'hub-to-c': 'M174 40 V72',
  'hub-to-d': 'M242 40 V72',
  'sw-from-a': 'M38 200 V168',
  'sw-to-c': 'M174 168 V200',
}

const hubLinkIds = ['hub-cable-a', 'hub-cable-b', 'hub-cable-c', 'hub-cable-d']
const switchLinkIds = ['sw-cable-a', 'sw-cable-b', 'sw-cable-c', 'sw-cable-d']
const linkIds = [...hubLinkIds, ...switchLinkIds]

// 포트 이름표는 장비 바로 아래, 자기 케이블 오른쪽에 늘 보이고 자기 케이블과 같은 흐림을 따른다.
const ports = [
  { id: 'hub-port-1', link: 'hub-cable-a', x: 42, y: 60 },
  { id: 'hub-port-2', link: 'hub-cable-b', x: 110, y: 60 },
  { id: 'hub-port-3', link: 'hub-cable-c', x: 178, y: 60 },
  { id: 'hub-port-4', link: 'hub-cable-d', x: 246, y: 60 },
  { id: 'sw-port-1', link: 'sw-cable-a', x: 42, y: 188 },
  { id: 'sw-port-2', link: 'sw-cable-b', x: 110, y: 188 },
  { id: 'sw-port-3', link: 'sw-cable-c', x: 178, y: 188 },
  { id: 'sw-port-4', link: 'sw-cable-d', x: 246, y: 188 },
]

// 곁말은 자기 장면의 호스트 줄 아래 가운데에 둔다.
const notes = [
  { id: 'hub-note', x: 140, y: 120, scenarios: ['hub'] },
  { id: 'switch-note', x: 140, y: 248, scenarios: ['switch'] },
]

// 가로형도 두 장면을 세로로 쌓는다. 폭이 넓어진 만큼 호스트를 넓히고 케이블을 줄인다.
const wideNodes = [
  { id: 'hub', x: 14, y: 8, width: 412 },
  { id: 'host-a', x: 14, y: 64, width: 88 },
  { id: 'host-b', x: 122, y: 64, width: 88 },
  { id: 'host-c', x: 230, y: 64, width: 88 },
  { id: 'host-d', x: 338, y: 64, width: 88 },
  { id: 'switch', x: 14, y: 124, width: 412 },
  { id: 'sw-host-a', x: 14, y: 180, width: 88 },
  { id: 'sw-host-b', x: 122, y: 180, width: 88 },
  { id: 'sw-host-c', x: 230, y: 180, width: 88 },
  { id: 'sw-host-d', x: 338, y: 180, width: 88 },
]

const widePaths: Record<string, string> = {
  'hub-cable-a': 'M58 40 V64',
  'hub-cable-b': 'M166 40 V64',
  'hub-cable-c': 'M274 40 V64',
  'hub-cable-d': 'M382 40 V64',
  'sw-cable-a': 'M58 156 V180',
  'sw-cable-b': 'M166 156 V180',
  'sw-cable-c': 'M274 156 V180',
  'sw-cable-d': 'M382 156 V180',
  'hub-from-a': 'M58 64 V40',
  'hub-to-b': 'M166 40 V64',
  'hub-to-c': 'M274 40 V64',
  'hub-to-d': 'M382 40 V64',
  'sw-from-a': 'M58 180 V156',
  'sw-to-c': 'M274 156 V180',
}

// 포트 이름표와 곁말의 자리만 배치마다 다르다. 이어진 케이블과 보이는 시나리오는 세로형에서 id로 가져온다.
const widePorts = [
  { id: 'hub-port-1', x: 62, y: 56 },
  { id: 'hub-port-2', x: 170, y: 56 },
  { id: 'hub-port-3', x: 278, y: 56 },
  { id: 'hub-port-4', x: 386, y: 56 },
  { id: 'sw-port-1', x: 62, y: 172 },
  { id: 'sw-port-2', x: 170, y: 172 },
  { id: 'sw-port-3', x: 278, y: 172 },
  { id: 'sw-port-4', x: 386, y: 172 },
]

const wideNotes = [
  { id: 'hub-note', x: 220, y: 112 },
  { id: 'switch-note', x: 220, y: 228 },
]

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다. 스위치 장면에서는 프레임이 지나가지 않는 B·D와 그 케이블도 흐려진다.
export const switchForwardScenarios: DiagramScenario[] = [
  { id: 'hub', nodes: ['hub', 'host-a', 'host-b', 'host-c', 'host-d', ...hubLinkIds], paths: ['hub-from-a', 'hub-to-b', 'hub-to-c', 'hub-to-d'] },
  { id: 'switch', nodes: ['switch', 'sw-host-a', 'sw-host-c', 'sw-cable-a', 'sw-cable-c'], paths: ['sw-from-a', 'sw-to-c'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SwitchForwardDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-switch-forward-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutPorts = wide ? widePorts.map((port) => ({ ...ports.find(({ id }) => id === port.id)!, ...port })) : ports
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={switchForwardScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 236' : '0 0 280 256'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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

          {layoutPorts.map((port) => (
            <text key={port.id} data-port={port.id} x={port.x} y={port.y} textAnchor="start" className="fill-muted" fontSize="9" opacity={opacityOf(port.link)}>
              {text.notes![port.id]}
            </text>
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
