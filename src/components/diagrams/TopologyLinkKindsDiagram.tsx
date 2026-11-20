import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-topology'].diagrams['topology-link-kinds']

// 세로형은 위 「점 대 점」 박스에 PC01과 PC02를 링크 하나로 잇고, 아래 「다중점」 박스 가운데에 노드 넷이 함께 쓰는 링크를 점 하나로 두어
// PC01·PC02는 그 위에서, PC03·PC04는 그 아래에서 저마다 잇는다. 두 박스의 PC01·PC02는 이름이 같아도 서로 다른 노드라 id를 달리한다.
// 가는 선(링크)은 늘 보이고, 화살표(PC01이 보낸 신호)는 시나리오를 골랐을 때만 링크 위에 겹쳐 보인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'p2p-pc01', x: 24, y: 28, width: 64 },
  { id: 'p2p-pc02', x: 192, y: 28, width: 64 },
  { id: 'mp-pc01', x: 24, y: 112, width: 64 },
  { id: 'mp-pc02', x: 192, y: 112, width: 64 },
  { id: 'mp-shared', x: 24, y: 160, width: 232 },
  { id: 'mp-pc03', x: 24, y: 208, width: 64 },
  { id: 'mp-pc04', x: 192, y: 208, width: 64 },
]

const groups = [
  { id: 'p2p', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 21 },
  { id: 'multipoint', x: 8, y: 88, width: 264, height: 160, labelX: 16, labelY: 101 },
]

const paths: Record<string, string> = {
  'p2p-link': 'M88 44 H192',
  'mp-link-1': 'M56 144 V160',
  'mp-link-2': 'M224 144 V160',
  'mp-link-3': 'M56 192 V208',
  'mp-link-4': 'M224 192 V208',
  'p2p-signal': 'M88 44 H192',
  'mp-from-1': 'M56 144 V160',
  'mp-to-2': 'M224 160 V144',
  'mp-to-3': 'M56 192 V208',
  'mp-to-4': 'M224 192 V208',
}

const p2pLinkIds = ['p2p-link']
const multipointLinkIds = ['mp-link-1', 'mp-link-2', 'mp-link-3', 'mp-link-4']
const linkIds = [...p2pLinkIds, ...multipointLinkIds]

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 그림 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'p2p-note': 'p2p',
  'mp-note': 'multipoint',
}

const notes: Note[] = [
  { id: 'p2p-note', x: 140, y: 264, anchor: 'middle' },
  { id: 'mp-note', x: 140, y: 264, anchor: 'middle' },
]

// 가로형은 두 박스를 왼쪽(점 대 점)과 오른쪽(다중점)에 나란히 둔다. 다중점 박스 안의 짜임은 세로형과 같다.
const wideNodes = [
  { id: 'p2p-pc01', x: 20, y: 76, width: 56 },
  { id: 'p2p-pc02', x: 116, y: 76, width: 56 },
  { id: 'mp-pc01', x: 224, y: 28, width: 64 },
  { id: 'mp-pc02', x: 344, y: 28, width: 64 },
  { id: 'mp-shared', x: 216, y: 76, width: 200 },
  { id: 'mp-pc03', x: 224, y: 124, width: 64 },
  { id: 'mp-pc04', x: 344, y: 124, width: 64 },
]

const wideGroups = [
  { id: 'p2p', x: 8, y: 8, width: 176, height: 156, labelX: 16, labelY: 21 },
  { id: 'multipoint', x: 200, y: 8, width: 232, height: 156, labelX: 208, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'p2p-link': 'M76 92 H116',
  'mp-link-1': 'M256 60 V76',
  'mp-link-2': 'M376 60 V76',
  'mp-link-3': 'M256 108 V124',
  'mp-link-4': 'M376 108 V124',
  'p2p-signal': 'M76 92 H116',
  'mp-from-1': 'M256 60 V76',
  'mp-to-2': 'M376 76 V60',
  'mp-to-3': 'M256 108 V124',
  'mp-to-4': 'M376 108 V124',
}

const wideNotes: Note[] = [
  { id: 'p2p-note', x: 220, y: 180, anchor: 'middle' },
  { id: 'mp-note', x: 220, y: 180, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 링크를 함께 적는다.
// 점 대 점: PC01의 신호가 링크를 지나 PC02에만 닿는다. 다중점: PC01의 신호가 함께 쓰는 링크를 지나 PC02·PC03·PC04에 모두 닿는다.
export const topologyLinkKindsScenarios: DiagramScenario[] = [
  {
    id: 'p2p',
    nodes: ['p2p-pc01', 'p2p-pc02', ...p2pLinkIds],
    paths: ['p2p-signal'],
  },
  {
    id: 'multipoint',
    nodes: ['mp-pc01', 'mp-pc02', 'mp-shared', 'mp-pc03', 'mp-pc04', ...multipointLinkIds],
    paths: ['mp-from-1', 'mp-to-2', 'mp-to-3', 'mp-to-4'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TopologyLinkKindsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-topology-link-kinds-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={topologyLinkKindsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 188' : '0 0 280 276'}>
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
