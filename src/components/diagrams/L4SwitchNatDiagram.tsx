import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-devices'].diagrams['l4-switch-nat']

// 세로형은 왼쪽 열에 위에서 아래로 클라이언트, L4 스위치, 웹 서버를 둔다. WEB02는 WEB01 오른쪽에 있다.
// 오른쪽 열의 두 박스는 스위치 앞 구간(클라이언트와 스위치 사이)과 뒤 구간(스위치와 WEB01 사이)이고,
// 박스마다 위 칸은 요청, 아래 칸은 응답이 그 구간을 지날 때 패킷에 적힌 값이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'client', x: 8, y: 8, width: 96 },
  { id: 'switch', x: 8, y: 110, width: 96 },
  { id: 'web01', x: 8, y: 252, width: 120 },
  { id: 'web02', x: 152, y: 252, width: 120 },
  { id: 'req-front', x: 120, y: 26, width: 148 },
  { id: 'res-front', x: 120, y: 62, width: 148 },
  { id: 'req-back', x: 120, y: 168, width: 148 },
  { id: 'res-back', x: 120, y: 204, width: 148 },
]

const groups = [
  { id: 'front', x: 116, y: 8, width: 156, height: 94, labelX: 124, labelY: 20 },
  { id: 'back', x: 116, y: 150, width: 156, height: 94, labelX: 124, labelY: 162 },
]

// 화살표는 패킷이 가는 쪽이다. 요청(클라이언트 → 스위치 → WEB01)과 응답(WEB01 → 스위치 → 클라이언트)을 나란히 따로 둔다.
const paths: Record<string, string> = {
  'req-client-switch': 'M40 40 V110',
  'req-switch-web01': 'M40 142 V252',
  'res-web01-switch': 'M72 252 V142',
  'res-switch-client': 'M72 110 V40',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 가상 주소 곁말은 예시 곁말이라 늘 보이고 L4 스위치의 opacity를 따른다(ADR-038). 스위치 오른쪽, 두 박스 사이에 둔다.
const addressNote: Note = { id: 'address-note', x: 112, y: 130, anchor: 'start' }

// 시나리오 곁말은 자기 시나리오를 골랐을 때만 보이고, 웹 서버 아래 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'request-note': 'request',
  'response-note': 'response',
}

const notes: Note[] = [
  { id: 'request-note', x: 140, y: 298, anchor: 'middle' },
  { id: 'response-note', x: 140, y: 298, anchor: 'middle' },
]

// 가로형은 위 줄에 왼쪽부터 클라이언트, L4 스위치, WEB01을 두고 WEB02는 WEB01 위에 둔다.
// 아래 줄의 두 박스는 왼쪽이 스위치 앞 구간, 오른쪽이 뒤 구간이다.
const wideNodes = [
  { id: 'client', x: 16, y: 56, width: 96 },
  { id: 'switch', x: 172, y: 56, width: 96 },
  { id: 'web01', x: 312, y: 56, width: 120 },
  { id: 'web02', x: 312, y: 8, width: 120 },
  { id: 'req-front', x: 16, y: 118, width: 148 },
  { id: 'res-front', x: 16, y: 154, width: 148 },
  { id: 'req-back', x: 276, y: 118, width: 148 },
  { id: 'res-back', x: 276, y: 154, width: 148 },
]

const wideGroups = [
  { id: 'front', x: 8, y: 100, width: 164, height: 94, labelX: 16, labelY: 112 },
  { id: 'back', x: 268, y: 100, width: 164, height: 94, labelX: 276, labelY: 112 },
]

const widePaths: Record<string, string> = {
  'req-client-switch': 'M112 66 H172',
  'req-switch-web01': 'M268 66 H312',
  'res-web01-switch': 'M312 78 H268',
  'res-switch-client': 'M172 78 H112',
}

const wideAddressNote: Note = { id: 'address-note', x: 220, y: 48, anchor: 'middle' }

const wideNotes: Note[] = [
  { id: 'request-note', x: 220, y: 212, anchor: 'middle' },
  { id: 'response-note', x: 220, y: 212, anchor: 'middle' },
]

// 요청: 요청 화살표와 「목적지」 칸 둘이 선명하다. 응답: 응답 화살표와 「출발지」 칸 둘이 선명하다. 고르지 않은 WEB02는 두 시나리오 모두 흐리다.
export const l4SwitchNatScenarios: DiagramScenario[] = [
  {
    id: 'request',
    nodes: ['client', 'switch', 'web01', 'req-front', 'req-back'],
    paths: ['req-client-switch', 'req-switch-web01'],
  },
  {
    id: 'response',
    nodes: ['client', 'switch', 'web01', 'res-back', 'res-front'],
    paths: ['res-web01-switch', 'res-switch-client'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function L4SwitchNatDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-l4-switch-nat-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const layoutAddressNote = wide ? wideAddressNote : addressNote

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={l4SwitchNatScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 220' : '0 0 280 304'}>
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
              {node.id === 'switch' && (
                <text data-example-note={layoutAddressNote.id} x={layoutAddressNote.x} y={layoutAddressNote.y} textAnchor={layoutAddressNote.anchor} className="fill-muted" fontSize="9">
                  {text.notes![layoutAddressNote.id]}
                </text>
              )}
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
