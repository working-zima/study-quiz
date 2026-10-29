import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-address-types'].diagrams['nat-translation']

// 세로형은 위에서 아래로 사설 네트워크 박스(호스트 A), 두 박스 사이의 NAT 라우터, 인터넷 박스(서버)를 쌓는다.
// 장치의 주소와 구간의 출발지·목적지 곁말은 노드 오른쪽에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'host', x: 24, y: 28, width: 112 },
  { id: 'router', x: 24, y: 116, width: 112 },
  { id: 'server', x: 24, y: 212, width: 112 },
]

const groups = [
  { id: 'private', x: 8, y: 8, width: 264, height: 92, labelX: 16, labelY: 20 },
  { id: 'internet', x: 8, y: 164, width: 264, height: 92, labelX: 16, labelY: 176 },
]

// 화살표는 패킷이 가는 방향이다. 나가는 패킷과 돌아오는 응답의 화살표를 나란히 따로 둔다.
const paths: Record<string, string> = {
  'out-inside': 'M72 60 V116',
  'out-outside': 'M72 148 V212',
  'in-outside': 'M88 212 V148',
  'in-inside': 'M88 116 V60',
}

// 장치의 주소는 그 장치의 흐림을 따른다.
const ownerNotes = [
  { id: 'host-address', owner: 'host', x: 144, y: 48, anchor: 'start' as const },
  { id: 'router-inside', owner: 'router', x: 144, y: 129, anchor: 'start' as const },
  { id: 'router-outside', owner: 'router', x: 144, y: 143, anchor: 'start' as const },
  { id: 'server-address', owner: 'server', x: 144, y: 232, anchor: 'start' as const },
]

// 구간의 출발지·목적지 곁말은 자기 시나리오에서만 보인다. 안쪽 구간은 사설 네트워크 박스, 바깥 구간은 인터넷 박스 안에 둔다.
const notes = [
  { id: 'out-inside-src', x: 144, y: 76, anchor: 'start' as const, scenarios: ['outbound'] },
  { id: 'out-inside-dst', x: 144, y: 90, anchor: 'start' as const, scenarios: ['outbound'] },
  { id: 'out-outside-src', x: 144, y: 186, anchor: 'start' as const, scenarios: ['outbound'] },
  { id: 'out-outside-dst', x: 144, y: 200, anchor: 'start' as const, scenarios: ['outbound'] },
  { id: 'in-outside-src', x: 144, y: 186, anchor: 'start' as const, scenarios: ['inbound'] },
  { id: 'in-outside-dst', x: 144, y: 200, anchor: 'start' as const, scenarios: ['inbound'] },
  { id: 'in-inside-src', x: 144, y: 76, anchor: 'start' as const, scenarios: ['inbound'] },
  { id: 'in-inside-dst', x: 144, y: 90, anchor: 'start' as const, scenarios: ['inbound'] },
]

// 가로형은 왼쪽에서 오른쪽으로 사설 네트워크 박스(호스트 A), 두 박스 사이의 NAT 라우터, 인터넷 박스(서버)를 놓는다.
// 장치의 주소는 노드 아래에, 구간의 출발지·목적지 곁말은 그 구간이 속한 박스의 아래쪽에 둔다.
const wideNodes = [
  { id: 'host', x: 20, y: 28, width: 80 },
  { id: 'router', x: 188, y: 28, width: 88 },
  { id: 'server', x: 344, y: 28, width: 76 },
]

const wideGroups = [
  { id: 'private', x: 8, y: 8, width: 168, height: 108, labelX: 16, labelY: 20 },
  { id: 'internet', x: 288, y: 8, width: 144, height: 108, labelX: 296, labelY: 20 },
]

const widePaths: Record<string, string> = {
  'out-inside': 'M100 40 H188',
  'out-outside': 'M276 40 H344',
  'in-outside': 'M344 52 H276',
  'in-inside': 'M188 52 H100',
}

// 곁말의 자리만 배치마다 다르다. 흐림을 따르는 노드와 보이는 시나리오는 세로형에서 id로 가져온다.
const wideOwnerNotes = [
  { id: 'host-address', x: 60, y: 74, anchor: 'middle' as const },
  { id: 'router-inside', x: 232, y: 74, anchor: 'middle' as const },
  { id: 'router-outside', x: 232, y: 88, anchor: 'middle' as const },
  { id: 'server-address', x: 382, y: 74, anchor: 'middle' as const },
]

const wideNotes = [
  { id: 'out-inside-src', x: 16, y: 92, anchor: 'start' as const },
  { id: 'out-inside-dst', x: 16, y: 106, anchor: 'start' as const },
  { id: 'out-outside-src', x: 296, y: 92, anchor: 'start' as const },
  { id: 'out-outside-dst', x: 296, y: 106, anchor: 'start' as const },
  { id: 'in-outside-src', x: 296, y: 92, anchor: 'start' as const },
  { id: 'in-outside-dst', x: 296, y: 106, anchor: 'start' as const },
  { id: 'in-inside-src', x: 16, y: 92, anchor: 'start' as const },
  { id: 'in-inside-dst', x: 16, y: 106, anchor: 'start' as const },
]

// 나갈 때: 호스트 A → NAT 라우터 → 서버. 응답이 올 때: 서버 → NAT 라우터 → 호스트 A. 두 시나리오 모두 세 장치가 선명하다.
export const natTranslationScenarios: DiagramScenario[] = [
  { id: 'outbound', nodes: ['host', 'router', 'server'], paths: ['out-inside', 'out-outside'] },
  { id: 'inbound', nodes: ['host', 'router', 'server'], paths: ['in-outside', 'in-inside'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NatTranslationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-nat-translation-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutOwnerNotes = wide ? wideOwnerNotes.map((note) => ({ ...ownerNotes.find(({ id }) => id === note.id)!, ...note })) : ownerNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={natTranslationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 124' : '0 0 280 264'}>
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

          {layoutOwnerNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
