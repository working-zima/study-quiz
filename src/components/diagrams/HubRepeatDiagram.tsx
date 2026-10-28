import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['hub-switch-vlan'].diagrams['hub-repeat']

// 허브를 위에 길게 두고, 그 아래에 호스트 A~D를 포트 1~4 차례로 한 줄에 세운다. 노드는 모두 회색이다.
// 이 장면(노드 id와 자리)은 같은 주제의 뒤 도식들이 함께 쓴다.
const nodes = [
  { id: 'hub', x: 10, y: 24, width: 260 },
  { id: 'host-a', x: 10, y: 112, width: 56 },
  { id: 'host-b', x: 78, y: 112, width: 56 },
  { id: 'host-c', x: 146, y: 112, width: 56 },
  { id: 'host-d', x: 214, y: 112, width: 56 },
]

// 케이블 넷은 늘 보인다. 화살표는 케이블 위에 겹쳐 그린다 — 보낸 호스트에서 허브로 올라가고, 허브에서 나머지 호스트로 내려간다.
const paths: Record<string, string> = {
  'cable-a': 'M38 56 V112',
  'cable-b': 'M106 56 V112',
  'cable-c': 'M174 56 V112',
  'cable-d': 'M242 56 V112',
  'from-a': 'M38 112 V56',
  'from-d': 'M242 112 V56',
  'to-a': 'M38 56 V112',
  'to-b': 'M106 56 V112',
  'to-c': 'M174 56 V112',
  'to-d': 'M242 56 V112',
}

const linkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']

// 포트 이름표는 허브 바로 아래, 자기 케이블 오른쪽에 늘 보인다.
const ports = [
  { id: 'port-1', x: 42, y: 72 },
  { id: 'port-2', x: 110, y: 72 },
  { id: 'port-3', x: 178, y: 72 },
  { id: 'port-4', x: 246, y: 72 },
]

// 곁말은 호스트 아래 가운데에 둔다. A가 C에게 보낼 때만 보인다.
const notes = [
  { id: 'receiver', x: 174, y: 158, scenarios: ['a-sends'] },
  { id: 'discard-b', x: 106, y: 158, scenarios: ['a-sends'] },
  { id: 'discard-d', x: 242, y: 158, scenarios: ['a-sends'] },
]

// 가로형도 같은 모양이다. 폭이 넓어진 만큼 호스트를 넓히고 케이블을 줄인다.
const wideNodes = [
  { id: 'hub', x: 14, y: 24, width: 412 },
  { id: 'host-a', x: 14, y: 96, width: 88 },
  { id: 'host-b', x: 122, y: 96, width: 88 },
  { id: 'host-c', x: 230, y: 96, width: 88 },
  { id: 'host-d', x: 338, y: 96, width: 88 },
]

const widePaths: Record<string, string> = {
  'cable-a': 'M58 56 V96',
  'cable-b': 'M166 56 V96',
  'cable-c': 'M274 56 V96',
  'cable-d': 'M382 56 V96',
  'from-a': 'M58 96 V56',
  'from-d': 'M382 96 V56',
  'to-a': 'M58 56 V96',
  'to-b': 'M166 56 V96',
  'to-c': 'M274 56 V96',
  'to-d': 'M382 56 V96',
}

const widePorts = [
  { id: 'port-1', x: 62, y: 72 },
  { id: 'port-2', x: 170, y: 72 },
  { id: 'port-3', x: 278, y: 72 },
  { id: 'port-4', x: 386, y: 72 },
]

// 곁말 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'receiver', x: 274, y: 142 },
  { id: 'discard-b', x: 166, y: 142 },
  { id: 'discard-d', x: 382, y: 142 },
]

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다. 신호는 어느 시나리오에서나 케이블 넷을 모두 지난다.
export const hubRepeatScenarios: DiagramScenario[] = [
  { id: 'a-sends', nodes: ['hub', 'host-a', 'host-b', 'host-c', 'host-d', ...linkIds], paths: ['from-a', 'to-b', 'to-c', 'to-d'] },
  { id: 'd-sends', nodes: ['hub', 'host-a', 'host-b', 'host-c', 'host-d', ...linkIds], paths: ['from-d', 'to-a', 'to-b', 'to-c'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function HubRepeatDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-hub-repeat-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutPorts = wide ? widePorts : ports
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={hubRepeatScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 168'}>
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
            <text key={port.id} data-port={port.id} x={port.x} y={port.y} textAnchor="start" className="fill-muted" fontSize="9">
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
