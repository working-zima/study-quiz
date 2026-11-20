import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['wireless-lan'].diagrams['zigbee-stack']

// 세로형은 위에 Zigbee 사양 박스(응용 계층·네트워크 계층)를, 그 아래에 IEEE 802.15.4 박스(매체 접근 제어·물리 계층)를 쌓는다.
// 계층 칸은 아래에서 위로 물리 계층 → 매체 접근 제어 → 네트워크 계층 → 응용 계층 차례다. 맨 아래 줄에 SENSOR01·LIGHT01·코디네이터를
// 왼쪽부터 두고, 메시에서 데이터가 SENSOR01 → LIGHT01 → 코디네이터로 가는 화살표를 그린다. 노드는 모두 회색이다.
const nodes = [
  { id: 'app', x: 24, y: 28, width: 120 },
  { id: 'nwk', x: 24, y: 68, width: 120 },
  { id: 'mac', x: 24, y: 136, width: 120 },
  { id: 'phy', x: 24, y: 176, width: 120 },
  { id: 'sensor01', x: 8, y: 240, width: 76 },
  { id: 'light01', x: 102, y: 240, width: 76 },
  { id: 'coordinator', x: 196, y: 240, width: 76 },
]

const groups = [
  { id: 'zigbee', x: 8, y: 8, width: 152, height: 100, labelX: 16, labelY: 21 },
  { id: 'ieee802154', x: 8, y: 116, width: 152, height: 100, labelX: 16, labelY: 129 },
]

const paths: Record<string, string> = {
  'sensor-light': 'M84 256 H102',
  'light-coordinator': 'M178 256 H196',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 계층의 곁말 둘은 두 박스의 오른쪽에, 메시의 곁말은 장치 줄 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'zigbee-note': 'layers',
  'ieee-note': 'layers',
  'mesh-note': 'mesh',
}

const notes: Note[] = [
  { id: 'zigbee-note', x: 168, y: 62, anchor: 'start' },
  { id: 'ieee-note', x: 168, y: 170, anchor: 'start' },
  { id: 'mesh-note', x: 140, y: 292, anchor: 'middle' },
]

// 가로형은 왼쪽에 두 박스를 같은 차례로 쌓고, 오른쪽 열에 위에서부터 코디네이터·LIGHT01·SENSOR01을 둔다.
// 화살표는 아래의 SENSOR01에서 위로 LIGHT01을 거쳐 코디네이터로 간다. 메시의 곁말은 LIGHT01 왼쪽에 둔다.
const wideNodes = [
  { id: 'app', x: 24, y: 28, width: 144 },
  { id: 'nwk', x: 24, y: 68, width: 144 },
  { id: 'mac', x: 24, y: 136, width: 144 },
  { id: 'phy', x: 24, y: 176, width: 144 },
  { id: 'sensor01', x: 320, y: 180, width: 104 },
  { id: 'light01', x: 320, y: 104, width: 104 },
  { id: 'coordinator', x: 320, y: 28, width: 104 },
]

const wideGroups = [
  { id: 'zigbee', x: 8, y: 8, width: 176, height: 100, labelX: 16, labelY: 21 },
  { id: 'ieee802154', x: 8, y: 116, width: 176, height: 100, labelX: 16, labelY: 129 },
]

const widePaths: Record<string, string> = {
  'sensor-light': 'M372 180 V136',
  'light-coordinator': 'M372 104 V60',
}

const wideNotes: Note[] = [
  { id: 'zigbee-note', x: 192, y: 62, anchor: 'start' },
  { id: 'ieee-note', x: 192, y: 170, anchor: 'start' },
  { id: 'mesh-note', x: 312, y: 124, anchor: 'end' },
]

// 계층: 계층 칸 넷만 선명하고 화살표는 없다. 메시: 장치 셋이 선명하고 SENSOR01 → LIGHT01 → 코디네이터 화살표가 보인다.
export const zigbeeStackScenarios: DiagramScenario[] = [
  {
    id: 'layers',
    nodes: ['app', 'nwk', 'mac', 'phy'],
    paths: [],
  },
  {
    id: 'mesh',
    nodes: ['sensor01', 'light01', 'coordinator'],
    paths: ['sensor-light', 'light-coordinator'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ZigbeeStackDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-zigbee-stack-arrow`
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
      scenarios={zigbeeStackScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 224' : '0 0 280 300'}>
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
