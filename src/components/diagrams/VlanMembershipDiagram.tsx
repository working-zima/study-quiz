import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['hub-switch-vlan'].diagrams['vlan-membership']

// 위에 포트 1에서 포트 3으로 옮겨 꽂은 호스트 A를, 그 아래 「스위치」 박스 안에 포트 1~4를 둔다.
// 맨 아래 두 표 박스는 두 방식이 VLAN을 정할 때 보는 표이고, 한 칸이 항목 하나다. 노드는 모두 회색이다.
const nodes = [
  { id: 'host-a', x: 146, y: 24, width: 56 },
  { id: 'port-1', x: 10, y: 96, width: 56 },
  { id: 'port-2', x: 78, y: 96, width: 56 },
  { id: 'port-3', x: 146, y: 96, width: 56 },
  { id: 'port-4', x: 214, y: 96, width: 56 },
  { id: 'row-port-1', x: 10, y: 168, width: 126 },
  { id: 'row-port-2', x: 144, y: 168, width: 126 },
  { id: 'row-port-3', x: 10, y: 200, width: 126 },
  { id: 'row-port-4', x: 144, y: 200, width: 126 },
  { id: 'row-mac-a', x: 10, y: 268, width: 180 },
]

// 케이블은 늘 보인다. 화살표는 케이블 위에 겹쳐 그리고, A가 보낸 프레임이 포트 3으로 들어오는 길이다.
const paths: Record<string, string> = {
  'cable-a': 'M174 96 V56',
  'from-a': 'M174 56 V96',
}

const linkIds = ['cable-a']

const groups = [
  { id: 'switch', x: 4, y: 72, width: 272, height: 64, labelX: 14, labelY: 86 },
  { id: 'port-table', x: 4, y: 148, width: 272, height: 92, labelX: 14, labelY: 162 },
  { id: 'mac-table', x: 4, y: 248, width: 272, height: 60, labelX: 14, labelY: 262 },
]

// A의 MAC 주소는 A 바로 위에, 옮겨 꽂았다는 곁말은 A 왼쪽에 늘 보인다. A가 든 VLAN은 시나리오마다 A 오른쪽에 붙는다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] | null }[] = [
  { id: 'mac-a', x: 174, y: 16, anchor: 'middle', scenarios: null },
  { id: 'moved', x: 140, y: 44, anchor: 'end', scenarios: null },
  { id: 'in-vlan-2', x: 208, y: 44, anchor: 'start', scenarios: ['port-based'] },
  { id: 'in-vlan-1', x: 208, y: 44, anchor: 'start', scenarios: ['mac-based'] },
]

// 가로형은 포트를 넓히고, 두 표를 스위치 아래에 나란히 둔다.
const wideNodes = [
  { id: 'host-a', x: 226, y: 24, width: 88 },
  { id: 'port-1', x: 18, y: 96, width: 88 },
  { id: 'port-2', x: 122, y: 96, width: 88 },
  { id: 'port-3', x: 226, y: 96, width: 88 },
  { id: 'port-4', x: 330, y: 96, width: 88 },
  { id: 'row-port-1', x: 14, y: 168, width: 100 },
  { id: 'row-port-2', x: 118, y: 168, width: 100 },
  { id: 'row-port-3', x: 14, y: 200, width: 100 },
  { id: 'row-port-4', x: 118, y: 200, width: 100 },
  { id: 'row-mac-a', x: 238, y: 168, width: 188 },
]

const widePaths: Record<string, string> = {
  'cable-a': 'M270 96 V56',
  'from-a': 'M270 56 V96',
}

const wideGroups = [
  { id: 'switch', x: 8, y: 72, width: 424, height: 64, labelX: 18, labelY: 86 },
  { id: 'port-table', x: 8, y: 148, width: 216, height: 92, labelX: 18, labelY: 162 },
  { id: 'mac-table', x: 232, y: 148, width: 200, height: 92, labelX: 242, labelY: 162 },
]

// 곁말의 자리만 배치마다 다르다. 글의 정렬과 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'mac-a', x: 270, y: 16 },
  { id: 'moved', x: 220, y: 44 },
  { id: 'in-vlan-2', x: 320, y: 44 },
  { id: 'in-vlan-1', x: 320, y: 44 },
]

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다. 두 방식 모두 A와 포트 3이 선명하고, 그 방식이 찾아보는 칸 하나만 선명하다.
export const vlanMembershipScenarios: DiagramScenario[] = [
  { id: 'port-based', nodes: ['host-a', 'port-3', 'cable-a', 'row-port-3'], paths: ['from-a'] },
  { id: 'mac-based', nodes: ['host-a', 'port-3', 'cable-a', 'row-mac-a'], paths: ['from-a'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VlanMembershipDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-vlan-membership-arrow`
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
      scenarios={vlanMembershipScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 248' : '0 0 280 316'}>
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
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
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
