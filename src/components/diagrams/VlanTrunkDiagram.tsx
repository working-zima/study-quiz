import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['hub-switch-vlan'].diagrams['vlan-trunk']

// 세로형은 왼쪽 열에 위에서부터 스위치 1의 호스트 A·C, 스위치 1, 트렁크 링크, 스위치 2, 스위치 2의 호스트 B·D를 두고,
// 오른쪽 열에 트렁크로 오가는 프레임의 칸을 앞에서부터 위→아래로 잇는다. 칸 크기는 바이트 수에 비례하지 않는다.
// VLAN은 색이 아니라 그룹 박스와 라벨로 가르고, 노드는 모두 회색이다.
const nodes = [
  { id: 'host-a', x: 8, y: 24, width: 56 },
  { id: 'host-c', x: 76, y: 24, width: 56 },
  { id: 'switch-1', x: 4, y: 84, width: 132 },
  { id: 'switch-2', x: 4, y: 164, width: 132 },
  { id: 'host-b', x: 8, y: 224, width: 56 },
  { id: 'host-d', x: 76, y: 224, width: 56 },
  { id: 'destination', x: 146, y: 76, width: 92 },
  { id: 'source', x: 146, y: 108, width: 92 },
  { id: 'tag', x: 146, y: 140, width: 92 },
  { id: 'type-length', x: 146, y: 172, width: 92 },
  { id: 'data', x: 146, y: 204, width: 92 },
  { id: 'fcs', x: 146, y: 236, width: 92 },
]

// 케이블과 트렁크 링크는 늘 보인다. 화살표는 그 위에 겹쳐 그리고, 호스트 → 스위치 1 → 트렁크 → 스위치 2 → 호스트로 간다.
const paths: Record<string, string> = {
  'cable-a': 'M36 84 V56',
  'cable-c': 'M104 84 V56',
  'trunk-link': 'M70 116 V164',
  'cable-b': 'M36 196 V224',
  'cable-d': 'M104 196 V224',
  'from-a': 'M36 56 V84',
  'from-c': 'M104 56 V84',
  'trunk': 'M70 116 V164',
  'to-b': 'M36 196 V224',
  'to-d': 'M104 196 V224',
}

const linkIds = ['cable-a', 'cable-c', 'trunk-link', 'cable-b', 'cable-d']

// VLAN 박스는 호스트 하나씩을 두른다. 아래 두 박스는 케이블이 들어오는 위쪽을 비우려고 라벨을 박스 아래쪽에 둔다.
const groups = [
  { id: 'vlan-1-sw1', x: 4, y: 4, width: 64, height: 60, labelX: 10, labelY: 17 },
  { id: 'vlan-2-sw1', x: 72, y: 4, width: 64, height: 60, labelX: 78, labelY: 17 },
  { id: 'vlan-1-sw2', x: 4, y: 216, width: 64, height: 60, labelX: 10, labelY: 270 },
  { id: 'vlan-2-sw2', x: 72, y: 216, width: 64, height: 60, labelX: 78, labelY: 270 },
  { id: 'frame', x: 140, y: 52, width: 136, height: 224, labelX: 146, labelY: 66 },
]

// 트렁크 링크 곁말은 늘 보이고, 태그 곁말은 시나리오마다 태그 칸 바로 곁에 붙는다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] | null }[] = [
  { id: 'trunk-name', x: 76, y: 144, anchor: 'start', scenarios: null },
  { id: 'tag-vlan-1', x: 257, y: 160, anchor: 'middle', scenarios: ['vlan-1'] },
  { id: 'tag-vlan-2', x: 257, y: 160, anchor: 'middle', scenarios: ['vlan-2'] },
]

// 가로형은 왼쪽부터 스위치 1의 호스트, 스위치 1, 트렁크 링크, 스위치 2, 스위치 2의 호스트를 한 줄로 두고,
// 그 아래에 프레임의 칸을 왼쪽→오른쪽으로 잇는다.
const wideNodes = [
  { id: 'host-a', x: 16, y: 24, width: 72 },
  { id: 'host-c', x: 16, y: 92, width: 72 },
  { id: 'switch-1', x: 124, y: 58, width: 72 },
  { id: 'switch-2', x: 244, y: 58, width: 72 },
  { id: 'host-b', x: 348, y: 24, width: 72 },
  { id: 'host-d', x: 348, y: 92, width: 72 },
  { id: 'destination', x: 14, y: 168, width: 92 },
  { id: 'source', x: 106, y: 168, width: 92 },
  { id: 'tag', x: 198, y: 168, width: 66 },
  { id: 'type-length', x: 264, y: 168, width: 80 },
  { id: 'data', x: 344, y: 168, width: 50 },
  { id: 'fcs', x: 394, y: 168, width: 32 },
]

const widePaths: Record<string, string> = {
  'cable-a': 'M124 66 H112 V40 H88',
  'cable-c': 'M124 82 H112 V108 H88',
  'trunk-link': 'M196 74 H244',
  'cable-b': 'M316 66 H328 V40 H348',
  'cable-d': 'M316 82 H328 V108 H348',
  'from-a': 'M88 40 H112 V66 H124',
  'from-c': 'M88 108 H112 V82 H124',
  'trunk': 'M196 74 H244',
  'to-b': 'M316 66 H328 V40 H348',
  'to-d': 'M316 82 H328 V108 H348',
}

const wideGroups = [
  { id: 'vlan-1-sw1', x: 8, y: 4, width: 96, height: 60, labelX: 14, labelY: 17 },
  { id: 'vlan-2-sw1', x: 8, y: 72, width: 96, height: 60, labelX: 14, labelY: 85 },
  { id: 'vlan-1-sw2', x: 336, y: 4, width: 96, height: 60, labelX: 342, labelY: 17 },
  { id: 'vlan-2-sw2', x: 336, y: 72, width: 96, height: 60, labelX: 342, labelY: 85 },
  { id: 'frame', x: 8, y: 148, width: 424, height: 72, labelX: 14, labelY: 162 },
]

const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'trunk-name', x: 220, y: 50, anchor: 'middle' },
  { id: 'tag-vlan-1', x: 231, y: 214, anchor: 'middle' },
  { id: 'tag-vlan-2', x: 231, y: 214, anchor: 'middle' },
]

const frameCells = ['destination', 'source', 'tag', 'type-length', 'data', 'fcs']

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다. 프레임의 칸은 늘 선명하고, 다른 VLAN의 호스트와 그 케이블이 흐려진다.
export const vlanTrunkScenarios: DiagramScenario[] = [
  { id: 'vlan-1', nodes: ['host-a', 'switch-1', 'switch-2', 'host-b', 'cable-a', 'trunk-link', 'cable-b', ...frameCells], paths: ['from-a', 'trunk', 'to-b'] },
  { id: 'vlan-2', nodes: ['host-c', 'switch-1', 'switch-2', 'host-d', 'cable-c', 'trunk-link', 'cable-d', ...frameCells], paths: ['from-c', 'trunk', 'to-d'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VlanTrunkDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-vlan-trunk-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.scenarios === null || (active !== null && note.scenarios.includes(active.id)))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={vlanTrunkScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 228' : '0 0 280 284'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" className="fill-none stroke-disabled" strokeWidth="1" />
          ))}
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.labelX} y={group.labelY} className="fill-muted" fontSize="9">
              {text.groups?.[group.id]}
            </text>
          ))}

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
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx={frameCells.includes(node.id) ? '0' : '4'} strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
