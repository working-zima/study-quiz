import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['hub-switch-vlan'].diagrams['vlan-split']

// 위에 개발부의 호스트 A·B와 총무부의 호스트 C·D를 포트 1~4 차례로 세우고, 그 아래에 스위치를 둔다.
// VLAN은 색이 아니라 그룹 박스와 라벨로 가르고, 노드는 모두 회색이다.
const nodes = [
  { id: 'switch', x: 10, y: 96, width: 260 },
  { id: 'host-a', x: 10, y: 24, width: 56 },
  { id: 'host-b', x: 78, y: 24, width: 56 },
  { id: 'host-c', x: 146, y: 24, width: 56 },
  { id: 'host-d', x: 214, y: 24, width: 56 },
]

// 케이블 넷은 늘 보인다. 화살표는 케이블 위에 겹쳐 그린다 — 호스트 A에서 스위치로 내려가고, 스위치에서 내보낸 호스트로 올라간다.
const paths: Record<string, string> = {
  'cable-a': 'M38 96 V56',
  'cable-b': 'M106 96 V56',
  'cable-c': 'M174 96 V56',
  'cable-d': 'M242 96 V56',
  'from-a': 'M38 56 V96',
  'to-b': 'M106 96 V56',
  'to-c': 'M174 96 V56',
  'to-d': 'M242 96 V56',
}

const linkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']

// VLAN 박스는 「VLAN으로 나누면」에서만 그린다. 박스 하나가 같은 부서의 호스트 둘과 부서 곁말을 두르고, 스위치는 두르지 않는다.
const groups = [
  { id: 'vlan-1', x: 4, y: 4, width: 134, height: 76, labelX: 14, labelY: 18, scenarios: ['vlan'] },
  { id: 'vlan-2', x: 142, y: 4, width: 134, height: 76, labelX: 152, labelY: 18, scenarios: ['vlan'] },
]

// 부서 곁말은 늘 보이고, 같은 부서 호스트 둘의 케이블 사이에 둔다.
const depts = [
  { id: 'dev', x: 72, y: 72 },
  { id: 'admin', x: 208, y: 72 },
]

// 개수 곁말은 스위치 아래 가운데에 둔다.
const notes = [
  { id: 'one-domain', x: 140, y: 148, scenarios: ['no-vlan'] },
  { id: 'two-domains', x: 140, y: 148, scenarios: ['vlan'] },
]

// 가로형도 같은 모양이다. 폭이 넓어진 만큼 호스트와 스위치를 넓힌다.
const wideNodes = [
  { id: 'switch', x: 14, y: 96, width: 412 },
  { id: 'host-a', x: 14, y: 24, width: 88 },
  { id: 'host-b', x: 122, y: 24, width: 88 },
  { id: 'host-c', x: 230, y: 24, width: 88 },
  { id: 'host-d', x: 338, y: 24, width: 88 },
]

const widePaths: Record<string, string> = {
  'cable-a': 'M58 96 V56',
  'cable-b': 'M166 96 V56',
  'cable-c': 'M274 96 V56',
  'cable-d': 'M382 96 V56',
  'from-a': 'M58 56 V96',
  'to-b': 'M166 96 V56',
  'to-c': 'M274 96 V56',
  'to-d': 'M382 96 V56',
}

// 박스·라벨·곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형 groups·notes에서 id로 가져온다.
const wideGroups = [
  { id: 'vlan-1', x: 8, y: 4, width: 206, height: 76, labelX: 18, labelY: 18 },
  { id: 'vlan-2', x: 226, y: 4, width: 206, height: 76, labelX: 236, labelY: 18 },
]

const wideDepts = [
  { id: 'dev', x: 112, y: 72 },
  { id: 'admin', x: 328, y: 72 },
]

const wideNotes = [
  { id: 'one-domain', x: 220, y: 148 },
  { id: 'two-domains', x: 220, y: 148 },
]

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다. VLAN으로 나누면 프레임이 가지 않는 총무부의 C·D와 그 케이블이 흐려진다.
export const vlanSplitScenarios: DiagramScenario[] = [
  { id: 'no-vlan', nodes: ['switch', 'host-a', 'host-b', 'host-c', 'host-d', ...linkIds], paths: ['from-a', 'to-b', 'to-c', 'to-d'] },
  { id: 'vlan', nodes: ['switch', 'host-a', 'host-b', 'cable-a', 'cable-b'], paths: ['from-a', 'to-b'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VlanSplitDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-vlan-split-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutGroups = wide ? wideGroups.map((group) => ({ ...groups.find(({ id }) => id === group.id)!, ...group })) : groups
  const layoutDepts = wide ? wideDepts : depts
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownGroups = active ? layoutGroups.filter((group) => group.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={vlanSplitScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 156' : '0 0 280 156'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {shownGroups.map((group) => (
            <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" className="fill-none stroke-disabled" strokeWidth="1" />
          ))}
          {shownGroups.map((group) => (
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

          {layoutDepts.map((dept) => (
            <text key={dept.id} data-dept={dept.id} x={dept.x} y={dept.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![dept.id]}
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
