import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-security'].diagrams['tunnel-encapsulation']

// 세로형은 위에서 아래로 본사 박스(원래 패킷) → VPNGW1 → 인터넷 박스(감싼 패킷) → VPNGW2 → 지사 박스(꺼낸 패킷)를 쌓는다.
// 패킷은 칸을 빈틈없이 이은 줄이다. 감싼 패킷은 한 줄에 들지 않아 바깥 IP 헤더 칸을 원래 패킷 바로 위에 두었다. 노드는 모두 회색이다.
const nodes = [
  { id: 'orig-inner', x: 44, y: 32, width: 136 },
  { id: 'orig-data', x: 180, y: 32, width: 56 },
  { id: 'vpngw1', x: 76, y: 96, width: 128 },
  { id: 'wrap-outer', x: 44, y: 176, width: 192 },
  { id: 'wrap-inner', x: 44, y: 208, width: 136 },
  { id: 'wrap-data', x: 180, y: 208, width: 56 },
  { id: 'vpngw2', x: 76, y: 280, width: 128 },
  { id: 'out-inner', x: 44, y: 360, width: 136 },
  { id: 'out-data', x: 180, y: 360, width: 56 },
]

const groups = [
  { id: 'hq', x: 8, y: 8, width: 264, height: 64, labelX: 16, labelY: 21 },
  { id: 'internet', x: 8, y: 152, width: 264, height: 104, labelX: 16, labelY: 165 },
  { id: 'branch', x: 8, y: 336, width: 264, height: 64, labelX: 16, labelY: 349 },
]

const paths: Record<string, string> = {
  'orig-gw1': 'M140 64 V96',
  'gw1-wrap': 'M140 128 V176',
  'wrap-gw2': 'M140 240 V280',
  'gw2-out': 'M140 312 V360',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 그 단계의 화살표 오른쪽에 둔다.
const noteScenarios: Record<string, string> = {
  'wrap-note': 'wrap',
  'cross-note': 'cross',
  'unwrap-note': 'unwrap',
}

const notes: Note[] = [
  { id: 'wrap-note', x: 148, y: 146, anchor: 'start' },
  { id: 'cross-note', x: 148, y: 270, anchor: 'start' },
  { id: 'unwrap-note', x: 148, y: 330, anchor: 'start' },
]

// 가로형은 위 줄에 본사 박스와 VPNGW1, 가운데에 인터넷 박스, 아래 줄에 지사 박스와 VPNGW2를 둔다.
// 감싼 패킷은 한 줄에 들어, 바깥 IP 헤더 칸이 원래 패킷 바로 앞(왼쪽)에 붙는다.
const wideNodes = [
  { id: 'orig-inner', x: 16, y: 32, width: 136 },
  { id: 'orig-data', x: 152, y: 32, width: 56 },
  { id: 'vpngw1', x: 296, y: 32, width: 128 },
  { id: 'wrap-outer', x: 64, y: 120, width: 168 },
  { id: 'wrap-inner', x: 232, y: 120, width: 136 },
  { id: 'wrap-data', x: 368, y: 120, width: 56 },
  { id: 'vpngw2', x: 296, y: 216, width: 128 },
  { id: 'out-inner', x: 16, y: 216, width: 136 },
  { id: 'out-data', x: 152, y: 216, width: 56 },
]

const wideGroups = [
  { id: 'hq', x: 8, y: 8, width: 208, height: 64, labelX: 16, labelY: 21 },
  { id: 'internet', x: 8, y: 96, width: 424, height: 64, labelX: 16, labelY: 109 },
  { id: 'branch', x: 8, y: 192, width: 208, height: 64, labelX: 16, labelY: 205 },
]

const widePaths: Record<string, string> = {
  'orig-gw1': 'M208 48 H296',
  'gw1-wrap': 'M312 64 V84 H148 V120',
  'wrap-gw2': 'M148 152 V176 H360 V216',
  'gw2-out': 'M296 232 H208',
}

const wideNotes: Note[] = [
  { id: 'wrap-note', x: 320, y: 80, anchor: 'start' },
  { id: 'cross-note', x: 232, y: 198, anchor: 'start' },
  { id: 'unwrap-note', x: 296, y: 266, anchor: 'start' },
]

// 감싸기: 원래 패킷이 VPNGW1에 닿고, VPNGW1이 바깥 IP 헤더를 붙인 감싼 패킷을 내보낸다.
// 인터넷 지나기: 감싼 패킷이 바깥 헤더의 목적지인 VPNGW2 쪽으로 간다. 꺼내기: VPNGW2가 바깥 헤더를 뗀 원래 패킷을 지사 박스로 넘긴다.
export const tunnelEncapsulationScenarios: DiagramScenario[] = [
  {
    id: 'wrap',
    nodes: ['orig-inner', 'orig-data', 'vpngw1', 'wrap-outer', 'wrap-inner', 'wrap-data'],
    paths: ['orig-gw1', 'gw1-wrap'],
  },
  {
    id: 'cross',
    nodes: ['wrap-outer', 'wrap-inner', 'wrap-data', 'vpngw2'],
    paths: ['wrap-gw2'],
  },
  {
    id: 'unwrap',
    nodes: ['vpngw2', 'out-inner', 'out-data'],
    paths: ['gw2-out'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TunnelEncapsulationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-tunnel-encapsulation-arrow`
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
      scenarios={tunnelEncapsulationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 272' : '0 0 280 408'}>
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
