import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-address-types'].diagrams['reserved-addresses']

// 세로형은 예약된 주소 범위를 본문 목록의 차례대로 한 열에 쌓고, 범위마다 이름과 쓰임 곁말 두 줄을 오른쪽에 둔다.
// 문서용 주소는 범위가 셋이라 얇은 선 박스로 묶고, 쓰임 곁말을 가운데 범위 오른쪽에 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'this-network', x: 8, y: 8, width: 112 },
  { id: 'loopback', x: 8, y: 48, width: 112 },
  { id: 'link-local', x: 8, y: 88, width: 112 },
  { id: 'doc-1', x: 8, y: 146, width: 112 },
  { id: 'doc-2', x: 8, y: 182, width: 112 },
  { id: 'doc-3', x: 8, y: 218, width: 112 },
  { id: 'multicast', x: 8, y: 266, width: 112 },
  { id: 'future', x: 8, y: 306, width: 112 },
  { id: 'limited-broadcast', x: 8, y: 346, width: 112 },
]

const groups = [
  { id: 'documentation', x: 4, y: 128, width: 272, height: 130, labelX: 12, labelY: 140 },
]

// 곁말은 자기 범위 상자의 흐림을 따른다. 문서용 주소의 곁말은 가운데 범위를 따른다(세 범위는 늘 함께 선명하다).
const notes = [
  { id: 'this-network-name', owner: 'this-network', x: 128, y: 21 },
  { id: 'this-network-use', owner: 'this-network', x: 128, y: 35 },
  { id: 'loopback-name', owner: 'loopback', x: 128, y: 61 },
  { id: 'loopback-use', owner: 'loopback', x: 128, y: 75 },
  { id: 'link-local-name', owner: 'link-local', x: 128, y: 101 },
  { id: 'link-local-use', owner: 'link-local', x: 128, y: 115 },
  { id: 'documentation-use', owner: 'doc-2', x: 128, y: 195 },
  { id: 'documentation-device', owner: 'doc-2', x: 128, y: 209 },
  { id: 'multicast-name', owner: 'multicast', x: 128, y: 279 },
  { id: 'multicast-use', owner: 'multicast', x: 128, y: 293 },
  { id: 'future-name', owner: 'future', x: 128, y: 319 },
  { id: 'future-use', owner: 'future', x: 128, y: 333 },
  { id: 'limited-broadcast-name', owner: 'limited-broadcast', x: 128, y: 359 },
  { id: 'limited-broadcast-use', owner: 'limited-broadcast', x: 128, y: 373 },
]

// 가로형은 세 열이다. 왼쪽 열에 앞 세 범위, 가운데 열에 문서용 주소 박스, 오른쪽 열에 뒤 세 범위를 두어
// 위에서 아래로, 왼쪽에서 오른쪽으로 읽으면 본문의 차례가 된다. 곁말 두 줄은 범위 상자 아래에 둔다.
const wideNodes = [
  { id: 'this-network', x: 8, y: 8, width: 112 },
  { id: 'loopback', x: 8, y: 74, width: 112 },
  { id: 'link-local', x: 8, y: 140, width: 112 },
  { id: 'doc-1', x: 158, y: 28, width: 112 },
  { id: 'doc-2', x: 158, y: 64, width: 112 },
  { id: 'doc-3', x: 158, y: 100, width: 112 },
  { id: 'multicast', x: 304, y: 8, width: 112 },
  { id: 'future', x: 304, y: 74, width: 112 },
  { id: 'limited-broadcast', x: 304, y: 140, width: 112 },
]

const wideGroups = [
  { id: 'documentation', x: 140, y: 8, width: 148, height: 162, labelX: 148, labelY: 20 },
]

// 곁말의 자리만 배치마다 다르다. 흐림을 따르는 노드는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'this-network-name', x: 8, y: 53 },
  { id: 'this-network-use', x: 8, y: 66 },
  { id: 'loopback-name', x: 8, y: 119 },
  { id: 'loopback-use', x: 8, y: 132 },
  { id: 'link-local-name', x: 8, y: 185 },
  { id: 'link-local-use', x: 8, y: 198 },
  { id: 'documentation-use', x: 148, y: 149 },
  { id: 'documentation-device', x: 148, y: 162 },
  { id: 'multicast-name', x: 304, y: 53 },
  { id: 'multicast-use', x: 304, y: 66 },
  { id: 'future-name', x: 304, y: 119 },
  { id: 'future-use', x: 304, y: 132 },
  { id: 'limited-broadcast-name', x: 304, y: 185 },
  { id: 'limited-broadcast-use', x: 304, y: 198 },
]

// 밖으로 나가지 않는 주소: 루프백·링크 로컬·제한 브로드캐스트. 쓰임을 정한 범위: 문서용 셋·멀티캐스트·앞으로 쓸 주소.
// 「이 네트워크」 주소는 어느 시나리오에도 들지 않는다. 어느 시나리오에도 선이 없다.
export const reservedAddressesScenarios: DiagramScenario[] = [
  { id: 'stay-local', nodes: ['loopback', 'link-local', 'limited-broadcast'], paths: [] },
  { id: 'special-use', nodes: ['doc-1', 'doc-2', 'doc-3', 'multicast', 'future'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ReservedAddressesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={reservedAddressesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 208' : '0 0 280 386'}>
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

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="start" className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
