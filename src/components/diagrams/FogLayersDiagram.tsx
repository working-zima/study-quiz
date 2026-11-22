import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['cloud-sdn'].diagrams['fog-layers']

// 세로형은 맨 위에 클라우드 데이터 센터를 두고, 그 아래 「공장 안」 박스에 포그 노드 FOG01(가운데)과 센서 셋(맨 아래 한 줄)을 둔다.
// 화살표는 센서가 만든 데이터가 가는 쪽이다. 노드는 모두 회색이다.
const nodes = [
  { id: 'sensor01', x: 16, y: 176, width: 68 },
  { id: 'sensor02', x: 106, y: 176, width: 68 },
  { id: 'sensor03', x: 196, y: 176, width: 68 },
  { id: 'fog01', x: 106, y: 96, width: 68 },
  { id: 'cloud', x: 20, y: 8, width: 240 },
]

const groups = [
  { id: 'factory', x: 8, y: 64, width: 264, height: 156, labelX: 16, labelY: 77 },
]

// 포그가 없을 때 센서에서 클라우드로 곧장 가는 화살표는 FOG01을 비켜 간다 — SENSOR02의 화살표는 오른쪽 변에서 나와 FOG01 오른쪽 틈으로 올라간다.
// 포그가 있을 때 센서 셋의 화살표는 FOG01의 아래 변으로 모이고, FOG01에서 클라우드로 가는 화살표는 하나다.
const paths: Record<string, string> = {
  's1-cloud': 'M70 176 V40',
  's2-cloud': 'M174 192 H185 V40',
  's3-cloud': 'M230 176 V40',
  's1-fog': 'M50 176 V152 H122 V128',
  's2-fog': 'M140 176 V128',
  's3-fog': 'M230 176 V152 H158 V128',
  'fog-cloud': 'M140 96 V40',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 「공장 안」 박스 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'cloud-only-note': 'cloud-only',
  'fog-note': 'fog',
}

const notes: Note[] = [
  { id: 'cloud-only-note', x: 140, y: 240, anchor: 'middle' },
  { id: 'fog-note', x: 140, y: 240, anchor: 'middle' },
]

// 가로형은 왼쪽 「공장 안」 박스에 센서 셋을 세로로 쌓고 그 오른쪽에 FOG01을 두며, 클라우드 데이터 센터를 박스 밖 오른쪽 끝에 둔다.
// 포그가 없을 때 SENSOR01의 화살표는 FOG01 위로, SENSOR02·SENSOR03의 화살표는 FOG01 아래로 지나 클라우드로 간다.
const wideNodes = [
  { id: 'sensor01', x: 24, y: 32, width: 88 },
  { id: 'sensor02', x: 24, y: 88, width: 88 },
  { id: 'sensor03', x: 24, y: 144, width: 88 },
  { id: 'fog01', x: 176, y: 88, width: 72 },
  { id: 'cloud', x: 300, y: 88, width: 132 },
]

const wideGroups = [
  { id: 'factory', x: 8, y: 8, width: 264, height: 184, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  's1-cloud': 'M112 40 H360 V88',
  's2-cloud': 'M68 120 V132 H340 V120',
  's3-cloud': 'M112 160 H400 V120',
  's1-fog': 'M112 48 H144 V96 H176',
  's2-fog': 'M112 104 H176',
  's3-fog': 'M112 160 H144 V112 H176',
  'fog-cloud': 'M248 104 H300',
}

const wideNotes: Note[] = [
  { id: 'cloud-only-note', x: 220, y: 208, anchor: 'middle' },
  { id: 'fog-note', x: 220, y: 208, anchor: 'middle' },
]

// 모두 멀리 보내기: 센서 셋이 저마다 클라우드 데이터 센터로 곧장 보낸다. FOG01은 흐리다.
// 가까이에서 먼저: 센서 셋이 FOG01로 보내고, 클라우드로 가는 화살표는 FOG01에서 나오는 하나뿐이다.
export const fogLayersScenarios: DiagramScenario[] = [
  {
    id: 'cloud-only',
    nodes: ['sensor01', 'sensor02', 'sensor03', 'cloud'],
    paths: ['s1-cloud', 's2-cloud', 's3-cloud'],
  },
  {
    id: 'fog',
    nodes: ['sensor01', 'sensor02', 'sensor03', 'fog01', 'cloud'],
    paths: ['s1-fog', 's2-fog', 's3-fog', 'fog-cloud'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FogLayersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-fog-layers-arrow`
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
      scenarios={fogLayersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 252'}>
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
