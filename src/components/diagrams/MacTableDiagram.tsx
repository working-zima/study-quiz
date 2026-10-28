import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['hub-switch-vlan'].diagrams['mac-table']

// 위에 MAC 주소 테이블 박스를 두고, 그 아래에 스위치를, 맨 아래에 호스트 A~D를 포트 1~4 차례로 세운다.
// 표의 줄(row-a·row-c)은 「포트 · MAC 주소」 한 칸짜리 노드이고, 시나리오에 따라 나타난다. 노드는 모두 회색이다.
const groups = [
  { id: 'table', x: 6, y: 4, width: 268, height: 92 },
]

const nodes = [
  { id: 'switch', x: 10, y: 112, width: 260 },
  { id: 'host-a', x: 10, y: 184, width: 56 },
  { id: 'host-b', x: 78, y: 184, width: 56 },
  { id: 'host-c', x: 146, y: 184, width: 56 },
  { id: 'host-d', x: 214, y: 184, width: 56 },
  { id: 'row-a', x: 14, y: 24, width: 166 },
  { id: 'row-c', x: 14, y: 56, width: 166 },
]

// 케이블 넷은 늘 보인다. 화살표는 케이블 위에 겹쳐 그리고, 프레임을 보낸 호스트에서 스위치로 올라간다.
const paths: Record<string, string> = {
  'cable-a': 'M38 144 V184',
  'cable-b': 'M106 144 V184',
  'cable-c': 'M174 144 V184',
  'cable-d': 'M242 144 V184',
  'from-a': 'M38 184 V144',
  'from-c': 'M174 184 V144',
}

const linkIds = ['cable-a', 'cable-b', 'cable-c', 'cable-d']
const rowIds = ['row-a', 'row-c']

// 포트 이름표는 스위치 바로 아래, 자기 케이블 오른쪽에 늘 보이고 자기 케이블과 같은 흐림을 따른다.
const ports = [
  { id: 'port-1', link: 'cable-a', x: 42, y: 168 },
  { id: 'port-2', link: 'cable-b', x: 110, y: 168 },
  { id: 'port-3', link: 'cable-c', x: 178, y: 168 },
  { id: 'port-4', link: 'cable-d', x: 246, y: 168 },
]

// 곁말은 자기가 가리키는 줄의 바로 오른쪽, 표 박스 안에 둔다.
const notes = [
  { id: 'new-a', x: 188, y: 44, scenarios: ['learn-a'] },
  { id: 'new-c', x: 188, y: 76, scenarios: ['learn-c'] },
  { id: 'aged-a', x: 188, y: 44, scenarios: ['aging'] },
]

// 가로형도 같은 모양이다. 폭이 넓어진 만큼 표의 줄과 호스트를 넓히고 케이블을 줄인다.
const wideGroups = [
  { id: 'table', x: 14, y: 4, width: 412, height: 92 },
]

const wideNodes = [
  { id: 'switch', x: 14, y: 112, width: 412 },
  { id: 'host-a', x: 14, y: 176, width: 88 },
  { id: 'host-b', x: 122, y: 176, width: 88 },
  { id: 'host-c', x: 230, y: 176, width: 88 },
  { id: 'host-d', x: 338, y: 176, width: 88 },
  { id: 'row-a', x: 22, y: 24, width: 200 },
  { id: 'row-c', x: 22, y: 56, width: 200 },
]

const widePaths: Record<string, string> = {
  'cable-a': 'M58 144 V176',
  'cable-b': 'M166 144 V176',
  'cable-c': 'M274 144 V176',
  'cable-d': 'M382 144 V176',
  'from-a': 'M58 176 V144',
  'from-c': 'M274 176 V144',
}

// 포트 이름표와 곁말의 자리만 배치마다 다르다. 이어진 케이블과 보이는 시나리오는 세로형에서 id로 가져온다.
const widePorts = [
  { id: 'port-1', x: 62, y: 164 },
  { id: 'port-2', x: 170, y: 164 },
  { id: 'port-3', x: 278, y: 164 },
  { id: 'port-4', x: 386, y: 164 },
]

const wideNotes = [
  { id: 'new-a', x: 232, y: 44 },
  { id: 'new-c', x: 232, y: 76 },
  { id: 'aged-a', x: 232, y: 44 },
]

// 시나리오마다 표에 적혀 있는 줄. 처음(전체)에는 표가 비어 있다. 지운 줄(시간이 지나면의 row-a)은 흐리게 남긴다.
const rowsOf: Record<string, string[]> = {
  'learn-a': ['row-a'],
  'learn-c': ['row-a', 'row-c'],
  aging: ['row-a', 'row-c'],
}

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다.
export const macTableScenarios: DiagramScenario[] = [
  { id: 'learn-a', nodes: ['switch', 'host-a', 'cable-a', 'row-a'], paths: ['from-a'] },
  { id: 'learn-c', nodes: ['switch', 'host-c', 'cable-c', 'row-a', 'row-c'], paths: ['from-c'] },
  { id: 'aging', nodes: ['switch', 'row-c'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MacTableDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-mac-table-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutPorts = wide ? widePorts.map((port) => ({ ...ports.find(({ id }) => id === port.id)!, ...port })) : ports
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownRows = active ? rowsOf[active.id] : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={macTableScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 224'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" className="fill-none stroke-disabled" strokeWidth="1" />
          ))}
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
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

          {layoutNodes.filter((node) => !rowIds.includes(node.id) || shownRows.includes(node.id)).map((node) => (
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="start" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
