import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-address-types'].diagrams['address-assignment']

// 세로형은 사설 네트워크 박스 안 위쪽에 DHCP 서버와 네트워크 프린터를, 아래쪽에 PC 1과 PC 2를 둔다.
// 장치의 주소와 그 주소를 얻은 방법은 노드 아래 곁말로 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'server', x: 24, y: 28, width: 104 },
  { id: 'printer', x: 152, y: 28, width: 104 },
  { id: 'pc1', x: 24, y: 136, width: 104 },
  { id: 'pc2', x: 152, y: 136, width: 104 },
]

const groups = [
  { id: 'private', x: 8, y: 8, width: 264, height: 188, labelX: 16, labelY: 20 },
]

// 화살표는 DHCP 서버가 주소를 나눠 주는 방향이다. 프린터로 가는 화살표는 없다 — 프린터의 주소는 관리자가 직접 넣었다.
const paths: Record<string, string> = {
  'to-pc1': 'M40 60 V136',
  'to-pc2': 'M112 60 V112 H176 V136',
}

// 장치의 주소는 그 장치의 흐림을 따른다.
const ownerNotes = [
  { id: 'server-address', owner: 'server', x: 76, y: 74, anchor: 'middle' as const },
  { id: 'printer-address', owner: 'printer', x: 204, y: 74, anchor: 'middle' as const },
]

// 주소를 얻은 방법은 자기 시나리오에서만 보인다. 정적 할당은 프린터 아래, 동적 할당은 두 PC 아래에 둔다.
const notes = [
  { id: 'printer-static', x: 204, y: 88, anchor: 'middle' as const, scenarios: ['static'] },
  { id: 'printer-kept', x: 204, y: 102, anchor: 'middle' as const, scenarios: ['static'] },
  { id: 'pc1-address', x: 76, y: 182, anchor: 'middle' as const, scenarios: ['dynamic'] },
  { id: 'pc2-address', x: 204, y: 182, anchor: 'middle' as const, scenarios: ['dynamic'] },
]

// 가로형은 왼쪽에 DHCP 서버, 가운데에 PC 1과 PC 2를 위아래로, 오른쪽에 네트워크 프린터를 둔다.
// 서버에서 두 PC로 가는 화살표는 서버 오른쪽 변에서 나간다.
const wideNodes = [
  { id: 'server', x: 20, y: 28, width: 104 },
  { id: 'printer', x: 316, y: 28, width: 108 },
  { id: 'pc1', x: 168, y: 28, width: 104 },
  { id: 'pc2', x: 168, y: 108, width: 104 },
]

const wideGroups = [
  { id: 'private', x: 8, y: 8, width: 424, height: 156, labelX: 16, labelY: 20 },
]

const widePaths: Record<string, string> = {
  'to-pc1': 'M124 44 H168',
  'to-pc2': 'M124 52 H144 V124 H168',
}

// 곁말의 자리만 배치마다 다르다. 흐림을 따르는 노드와 보이는 시나리오는 세로형에서 id로 가져온다.
const wideOwnerNotes = [
  { id: 'server-address', x: 72, y: 74, anchor: 'middle' as const },
  { id: 'printer-address', x: 370, y: 74, anchor: 'middle' as const },
]

const wideNotes = [
  { id: 'printer-static', x: 370, y: 88, anchor: 'middle' as const },
  { id: 'printer-kept', x: 370, y: 102, anchor: 'middle' as const },
  { id: 'pc1-address', x: 220, y: 74, anchor: 'middle' as const },
  { id: 'pc2-address', x: 220, y: 154, anchor: 'middle' as const },
]

// 정적 할당: 프린터만 선명하고 화살표가 없다. 동적 할당: DHCP 서버와 두 PC가 선명하고 서버에서 두 PC로 화살표가 간다.
export const addressAssignmentScenarios: DiagramScenario[] = [
  { id: 'static', nodes: ['printer'], paths: [] },
  { id: 'dynamic', nodes: ['server', 'pc1', 'pc2'], paths: ['to-pc1', 'to-pc2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AddressAssignmentDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-address-assignment-arrow`
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
      scenarios={addressAssignmentScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 172' : '0 0 280 204'}>
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
