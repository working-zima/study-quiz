import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-protocol'].diagrams['ip-across-networks']

// 세로형은 LAN 1을 위에, LAN 2를 아래에 쌓는다. 라우터는 저마다 자기 LAN 박스 안에 있고, 두 라우터를 잇는 연결이 두 박스 사이를 지난다.
// 박스와 그 라벨은 늘 보이고 흐려지지 않는다. 노드는 모두 회색이다.
const groups = [
  { id: 'lan-1', x: 4, y: 8, width: 272, height: 80 },
  { id: 'lan-2', x: 4, y: 120, width: 272, height: 80 },
]

const nodes = [
  { id: 'host-a', x: 16, y: 40, width: 96 },
  { id: 'router-1', x: 168, y: 40, width: 96 },
  { id: 'router-2', x: 168, y: 152, width: 96 },
  { id: 'host-b', x: 16, y: 152, width: 96 },
]

// 연결 셋은 늘 보인다. 화살표는 그 위에 겹쳐 그린다 — 호스트 A에서 라우터 1, 라우터 2를 거쳐 호스트 B로 간다.
const paths: Record<string, string> = {
  'cable-a': 'M112 56 H168',
  'router-link': 'M216 72 V152',
  'cable-b': 'M168 168 H112',
  'hop-1': 'M112 56 H168',
  'hop-2': 'M216 72 V152',
  'hop-3': 'M168 168 H112',
}

const linkIds = ['cable-a', 'router-link', 'cable-b']

// 곁말은 두 LAN 박스 사이, 라우터 연결의 왼쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle', scenarios: string[] }[] = [
  { id: 'lan-note', x: 16, y: 108, anchor: 'start', scenarios: ['lan'] },
  { id: 'e2e-note', x: 16, y: 108, anchor: 'start', scenarios: ['end-to-end'] },
]

// 가로형은 LAN 1을 왼쪽에, LAN 2를 오른쪽에 나란히 두고 네 장치를 한 줄로 늘어놓는다.
const wideGroups = [
  { id: 'lan-1', x: 4, y: 8, width: 172, height: 72 },
  { id: 'lan-2', x: 264, y: 8, width: 172, height: 72 },
]

const wideNodes = [
  { id: 'host-a', x: 16, y: 32, width: 64 },
  { id: 'router-1', x: 100, y: 32, width: 64 },
  { id: 'router-2', x: 276, y: 32, width: 64 },
  { id: 'host-b', x: 360, y: 32, width: 64 },
]

const widePaths: Record<string, string> = {
  'cable-a': 'M80 48 H100',
  'router-link': 'M164 48 H276',
  'cable-b': 'M340 48 H360',
  'hop-1': 'M80 48 H100',
  'hop-2': 'M164 48 H276',
  'hop-3': 'M340 48 H360',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' }[] = [
  { id: 'lan-note', x: 16, y: 96, anchor: 'start' },
  { id: 'e2e-note', x: 220, y: 96, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 연결을 함께 적는다. LAN 안 전달에서는 라우터 1 너머가 흐려진다.
export const ipAcrossNetworksScenarios: DiagramScenario[] = [
  { id: 'lan', nodes: ['host-a', 'router-1', 'cable-a'], paths: ['hop-1'] },
  { id: 'end-to-end', nodes: ['host-a', 'router-1', 'router-2', 'host-b', ...linkIds], paths: ['hop-1', 'hop-2', 'hop-3'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IpAcrossNetworksDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ip-across-networks-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={ipAcrossNetworksScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 104' : '0 0 280 208'}>
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

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
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
