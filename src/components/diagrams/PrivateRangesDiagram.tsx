import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-address-types'].diagrams['private-ranges']

// 세로형은 위에 사설 주소 범위 셋을 쌓고 끝 주소 곁말을 그 오른쪽에 둔다. 아래에는 회사 1과 회사 2의 사설 네트워크 박스를
// 양쪽에 두고, 박스마다 같은 주소 192.168.0.10을 하나씩, 두 박스 사이에 인터넷을 둔다. 호스트와 인터넷 사이에는 선을 긋지 않는다.
const nodes = [
  { id: 'r10', x: 8, y: 8, width: 104 },
  { id: 'r172', x: 8, y: 48, width: 104 },
  { id: 'r192', x: 8, y: 88, width: 104 },
  { id: 'host1', x: 14, y: 160, width: 92 },
  { id: 'internet', x: 116, y: 160, width: 48 },
  { id: 'host2', x: 174, y: 160, width: 92 },
]

const groups = [
  { id: 'company1', x: 8, y: 136, width: 104, height: 64, labelX: 18, labelY: 150 },
  { id: 'company2', x: 168, y: 136, width: 104, height: 64, labelX: 178, labelY: 150 },
]

// 끝 주소 곁말은 자기 범위 상자의 흐림을 따른다.
const ownerNotes = [
  { id: 'end-10', owner: 'r10', x: 120, y: 27, anchor: 'start' as const },
  { id: 'end-172', owner: 'r172', x: 120, y: 67, anchor: 'start' as const },
  { id: 'end-192', owner: 'r192', x: 120, y: 107, anchor: 'start' as const },
]

// 「나가지 않는다」 곁말은 겹쳐 쓰기에서만 두 회사 아래에 보인다.
const notes = [
  { id: 'no-exit', x: 140, y: 216, anchor: 'middle' as const, scenarios: ['overlap'] },
]

// 가로형은 범위 셋을 위 한 줄에 나란히 두고 끝 주소를 그 아래에 적는다. 아래 줄에 회사 1, 인터넷, 회사 2를 놓는다.
const wideNodes = [
  { id: 'r10', x: 16, y: 8, width: 112 },
  { id: 'r172', x: 164, y: 8, width: 112 },
  { id: 'r192', x: 312, y: 8, width: 112 },
  { id: 'host1', x: 40, y: 96, width: 92 },
  { id: 'internet', x: 196, y: 96, width: 48 },
  { id: 'host2', x: 308, y: 96, width: 92 },
]

const wideGroups = [
  { id: 'company1', x: 16, y: 72, width: 140, height: 64, labelX: 26, labelY: 86 },
  { id: 'company2', x: 284, y: 72, width: 140, height: 64, labelX: 294, labelY: 86 },
]

// 곁말의 자리만 배치마다 다르다. 흐림을 따르는 노드와 보이는 시나리오는 세로형에서 id로 가져온다.
const wideOwnerNotes = [
  { id: 'end-10', x: 72, y: 54, anchor: 'middle' as const },
  { id: 'end-172', x: 220, y: 54, anchor: 'middle' as const },
  { id: 'end-192', x: 368, y: 54, anchor: 'middle' as const },
]

const wideNotes = [
  { id: 'no-exit', x: 220, y: 152, anchor: 'middle' as const },
]

// 사설 대역 셋: 범위 상자 셋만 선명하다. 겹쳐 쓰기: 두 회사의 192.168.0.10만 선명하다. 어느 시나리오에도 선이 없다.
export const privateRangesScenarios: DiagramScenario[] = [
  { id: 'ranges', nodes: ['r10', 'r172', 'r192'], paths: [] },
  { id: 'overlap', nodes: ['host1', 'host2'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PrivateRangesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutOwnerNotes = wide ? wideOwnerNotes.map((note) => ({ ...ownerNotes.find(({ id }) => id === note.id)!, ...note })) : ownerNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={privateRangesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 224'}>
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
