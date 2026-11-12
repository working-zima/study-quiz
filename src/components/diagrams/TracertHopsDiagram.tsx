import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['diagnostic-commands'].diagrams['tracert-hops']

// 왼쪽 박스에 PC에서 목적지까지 패킷이 거치는 장치를 위에서 아래로 늘 보이는 선으로 잇고,
// 오른쪽 박스에 tracert 결과의 홉 1~4 줄을 그 장치와 같은 높이에 둔다. 화살표는 결과의 줄에서 그 줄에 주소가 적힌 장치로 간다.
// TTL을 늘려 보내는 차례는 icmp 주제의 도식이 그리므로 여기서는 결과를 읽는 것만 그린다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pc', x: 16, y: 28, width: 108 },
  { id: 'router-1', x: 16, y: 76, width: 108 },
  { id: 'router-2', x: 16, y: 124, width: 108 },
  { id: 'router-3', x: 16, y: 172, width: 108 },
  { id: 'dest', x: 16, y: 220, width: 108 },
  { id: 'hop-1', x: 152, y: 76, width: 104 },
  { id: 'hop-2', x: 152, y: 124, width: 104 },
  { id: 'hop-3', x: 152, y: 172, width: 104 },
  { id: 'hop-4', x: 152, y: 220, width: 104 },
]

const groups = [
  { id: 'route', x: 8, y: 8, width: 124, height: 264, labelX: 16, labelY: 21 },
  { id: 'result', x: 136, y: 56, width: 136, height: 216, labelX: 144, labelY: 69 },
]

// 늘 보이는 연결선 넷(경로의 앞 장치 → 다음 장치)과, 고른 줄의 화살표(결과의 줄 → 장치).
const paths: Record<string, string> = {
  'link-1': 'M70 60 V76',
  'link-2': 'M70 108 V124',
  'link-3': 'M70 156 V172',
  'link-4': 'M70 204 V220',
  'map-1': 'M152 92 H124',
  'map-2': 'M152 140 H124',
  'map-3': 'M152 188 H124',
  'map-4': 'M152 236 H124',
}

const linkIds = ['link-1', 'link-2', 'link-3', 'link-4']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만, 결과 박스 안에 보인다.
const noteScenarios: Record<string, string> = {
  'gateway-note': 'first-hop',
  'path-note': 'path',
  'dest-note': 'destination',
}

// 세로형은 곁말을 그 줄 바로 아래에 둔다.
const notes: Note[] = [
  { id: 'gateway-note', x: 144, y: 119, anchor: 'start' },
  { id: 'path-note', x: 144, y: 215, anchor: 'start' },
  { id: 'dest-note', x: 144, y: 265, anchor: 'start' },
]

// 가로형은 두 박스를 더 벌려 놓고, 곁말을 그 줄의 오른쪽에 둔다.
const wideNodes = [
  { id: 'pc', x: 16, y: 28, width: 120 },
  { id: 'router-1', x: 16, y: 68, width: 120 },
  { id: 'router-2', x: 16, y: 108, width: 120 },
  { id: 'router-3', x: 16, y: 148, width: 120 },
  { id: 'dest', x: 16, y: 188, width: 120 },
  { id: 'hop-1', x: 208, y: 68, width: 96 },
  { id: 'hop-2', x: 208, y: 108, width: 96 },
  { id: 'hop-3', x: 208, y: 148, width: 96 },
  { id: 'hop-4', x: 208, y: 188, width: 96 },
]

const wideGroups = [
  { id: 'route', x: 8, y: 8, width: 136, height: 220, labelX: 16, labelY: 21 },
  { id: 'result', x: 192, y: 48, width: 240, height: 180, labelX: 200, labelY: 61 },
]

const widePaths: Record<string, string> = {
  'link-1': 'M76 60 V68',
  'link-2': 'M76 100 V108',
  'link-3': 'M76 140 V148',
  'link-4': 'M76 180 V188',
  'map-1': 'M208 84 H136',
  'map-2': 'M208 124 H136',
  'map-3': 'M208 164 H136',
  'map-4': 'M208 204 H136',
}

const wideNotes: Note[] = [
  { id: 'gateway-note', x: 316, y: 88, anchor: 'start' },
  { id: 'path-note', x: 316, y: 168, anchor: 'start' },
  { id: 'dest-note', x: 316, y: 208, anchor: 'start' },
]

// nodes에는 선명하게 둘 노드와 연결선을 함께 적는다.
export const tracertHopsScenarios: DiagramScenario[] = [
  { id: 'first-hop', nodes: ['router-1', 'hop-1'], paths: ['map-1'] },
  {
    id: 'path',
    nodes: ['router-1', 'router-2', 'router-3', 'hop-1', 'hop-2', 'hop-3', 'link-2', 'link-3'],
    paths: ['map-1', 'map-2', 'map-3'],
  },
  { id: 'destination', nodes: ['dest', 'hop-4'], paths: ['map-4'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TracertHopsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-tracert-hops-arrow`
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
      scenarios={tracertHopsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 236' : '0 0 280 280'}>
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
