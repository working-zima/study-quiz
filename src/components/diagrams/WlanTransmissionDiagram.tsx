import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['wireless-lan'].diagrams['wlan-transmission']

// 세로형은 맨 위 줄에 802.11b와 802.11a·g를, 가운데 줄에 대역 확산 박스로 묶은 FHSS·DSSS와 박스 밖의 OFDM을,
// 맨 아래 줄에 802.11-1997과 적외선을 둔다. 802.11b는 DSSS 바로 위에, 802.11a·g는 OFDM 바로 위에 세워 화살표를 곧게 둔다.
// 화살표는 802.11의 판에서 그 판이 쓰는 전송 방식으로 간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'std11b', x: 104, y: 16, width: 72 },
  { id: 'std11ag', x: 200, y: 16, width: 72 },
  { id: 'fhss', x: 16, y: 120, width: 72 },
  { id: 'dsss', x: 104, y: 120, width: 72 },
  { id: 'ofdm', x: 200, y: 120, width: 72 },
  { id: 'std1997', x: 96, y: 200, width: 96 },
  { id: 'ir', x: 208, y: 200, width: 64 },
]

const groups = [
  { id: 'spread', x: 8, y: 96, width: 176, height: 64, labelX: 16, labelY: 109 },
]

const paths: Record<string, string> = {
  '11b-dsss': 'M140 48 V120',
  '11ag-ofdm': 'M236 48 V120',
  '1997-fhss': 'M96 216 H52 V152',
  '1997-dsss': 'M140 200 V152',
  '1997-ir': 'M192 216 H208',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 대역 확산은 박스 위, OFDM은 OFDM 아래, 적외선은 적외선 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'spread-note': 'spread',
  'ofdm-note': 'ofdm',
  'infrared-note': 'infrared',
}

const notes: Note[] = [
  { id: 'spread-note', x: 8, y: 80, anchor: 'start' },
  { id: 'ofdm-note', x: 272, y: 180, anchor: 'end' },
  { id: 'infrared-note', x: 240, y: 248, anchor: 'middle' },
]

// 가로형은 가운데 줄에 대역 확산 박스(FHSS·DSSS)와 OFDM·적외선을 나란히 둔다. 802.11-1997에서 적외선으로 가는 화살표는 OFDM 아래를 지나 올라간다.
const wideNodes = [
  { id: 'std11b', x: 120, y: 16, width: 80 },
  { id: 'std11ag', x: 240, y: 16, width: 80 },
  { id: 'fhss', x: 24, y: 104, width: 80 },
  { id: 'dsss', x: 120, y: 104, width: 80 },
  { id: 'ofdm', x: 240, y: 104, width: 80 },
  { id: 'std1997', x: 112, y: 192, width: 96 },
  { id: 'ir', x: 344, y: 104, width: 80 },
]

const wideGroups = [
  { id: 'spread', x: 8, y: 80, width: 208, height: 72, labelX: 16, labelY: 93 },
]

const widePaths: Record<string, string> = {
  '11b-dsss': 'M160 48 V104',
  '11ag-ofdm': 'M280 48 V104',
  '1997-fhss': 'M112 208 H64 V136',
  '1997-dsss': 'M160 192 V136',
  '1997-ir': 'M208 208 H384 V136',
}

const wideNotes: Note[] = [
  { id: 'spread-note', x: 8, y: 72, anchor: 'start' },
  { id: 'ofdm-note', x: 280, y: 172, anchor: 'middle' },
  { id: 'infrared-note', x: 384, y: 88, anchor: 'middle' },
]

// 대역 확산: 802.11-1997의 FHSS·DSSS와 802.11b의 DSSS. OFDM: 802.11a·g. 적외선: 802.11-1997.
export const wlanTransmissionScenarios: DiagramScenario[] = [
  {
    id: 'spread',
    nodes: ['std11b', 'fhss', 'dsss', 'std1997'],
    paths: ['11b-dsss', '1997-fhss', '1997-dsss'],
  },
  {
    id: 'ofdm',
    nodes: ['std11ag', 'ofdm'],
    paths: ['11ag-ofdm'],
  },
  {
    id: 'infrared',
    nodes: ['std1997', 'ir'],
    paths: ['1997-ir'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function WlanTransmissionDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-wlan-transmission-arrow`
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
      scenarios={wlanTransmissionScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 240' : '0 0 280 256'}>
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
