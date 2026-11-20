import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['transmission-media'].diagrams['twisted-pair-pins']

// 세로형은 왼쪽에 꼰 쌍의 묶음 넷(핀 1·2, 3·6, 4·5, 7·8)을 위에서 아래로 쌓고, 묶음마다 핀 둘을 나란히 둔다.
// 오른쪽 위에 보내는 쌍과 받는 쌍을 둔다. 핀 1의 화살표는 묶음 위로, 핀 3의 화살표는 두 묶음 사이로 돌아 쌍 노드에 닿는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pin1', x: 52, y: 16, width: 52 },
  { id: 'pin2', x: 112, y: 16, width: 52 },
  { id: 'pin3', x: 52, y: 72, width: 52 },
  { id: 'pin6', x: 112, y: 72, width: 52 },
  { id: 'pin4', x: 52, y: 128, width: 52 },
  { id: 'pin5', x: 112, y: 128, width: 52 },
  { id: 'pin7', x: 52, y: 184, width: 52 },
  { id: 'pin8', x: 112, y: 184, width: 52 },
  { id: 'send', x: 196, y: 16, width: 76 },
  { id: 'receive', x: 196, y: 72, width: 76 },
]

// 묶음 라벨은 핀 둘의 왼쪽, 묶음 높이의 가운데에 둔다.
const groups = [
  { id: 'pair-12', x: 8, y: 8, width: 164, height: 48, labelX: 16, labelY: 36 },
  { id: 'pair-36', x: 8, y: 64, width: 164, height: 48, labelX: 16, labelY: 92 },
  { id: 'pair-45', x: 8, y: 120, width: 164, height: 48, labelX: 16, labelY: 148 },
  { id: 'pair-78', x: 8, y: 176, width: 164, height: 48, labelX: 16, labelY: 204 },
]

const paths: Record<string, string> = {
  'pin1-send': 'M78 16 V4 H234 V16',
  'pin2-send': 'M164 32 H196',
  'pin3-receive': 'M78 104 V116 H234 V104',
  'pin6-receive': 'M164 88 H196',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 「신호를 싣지 않음」은 쓰지 않는 두 묶음의 오른쪽에, 「여덟 가닥, 네 쌍」은 그 둘 사이에 둔다.
const noteScenarios: Record<string, string> = {
  'pairs-note': 'pairs',
  'unused-45': 'in-use',
  'unused-78': 'in-use',
}

const notes: Note[] = [
  { id: 'pairs-note', x: 234, y: 176, anchor: 'middle' },
  { id: 'unused-45', x: 184, y: 148, anchor: 'start' },
  { id: 'unused-78', x: 184, y: 204, anchor: 'start' },
]

// 가로형은 묶음 넷을 한 줄에 나란히 두고, 보내는 쌍을 핀 1·2의 묶음 아래에, 받는 쌍을 핀 3·6의 묶음 아래에 둔다.
// 화살표는 핀의 아래 변에서 곧게 내려간다.
const wideNodes = [
  { id: 'pin1', x: 30, y: 28, width: 38 },
  { id: 'pin2', x: 74, y: 28, width: 38 },
  { id: 'pin3', x: 132, y: 28, width: 38 },
  { id: 'pin6', x: 176, y: 28, width: 38 },
  { id: 'pin4', x: 234, y: 28, width: 38 },
  { id: 'pin5', x: 278, y: 28, width: 38 },
  { id: 'pin7', x: 336, y: 28, width: 38 },
  { id: 'pin8', x: 380, y: 28, width: 38 },
  { id: 'send', x: 31, y: 108, width: 80 },
  { id: 'receive', x: 133, y: 108, width: 80 },
]

const wideGroups = [
  { id: 'pair-12', x: 24, y: 8, width: 94, height: 60, labelX: 32, labelY: 21 },
  { id: 'pair-36', x: 126, y: 8, width: 94, height: 60, labelX: 134, labelY: 21 },
  { id: 'pair-45', x: 228, y: 8, width: 94, height: 60, labelX: 236, labelY: 21 },
  { id: 'pair-78', x: 330, y: 8, width: 94, height: 60, labelX: 338, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'pin1-send': 'M49 60 V108',
  'pin2-send': 'M93 60 V108',
  'pin3-receive': 'M151 60 V108',
  'pin6-receive': 'M195 60 V108',
}

const wideNotes: Note[] = [
  { id: 'pairs-note', x: 326, y: 124, anchor: 'middle' },
  { id: 'unused-45', x: 275, y: 88, anchor: 'middle' },
  { id: 'unused-78', x: 377, y: 88, anchor: 'middle' },
]

// 네 쌍: 핀 여덟이 모두 선명하고 화살표는 없다. 10BASE-T가 쓰는 쌍: 핀 1·2에서 보내는 쌍으로, 핀 3·6에서 받는 쌍으로 화살표가 가고 핀 4·5·7·8은 흐려진다.
export const twistedPairPinsScenarios: DiagramScenario[] = [
  {
    id: 'pairs',
    nodes: ['pin1', 'pin2', 'pin3', 'pin6', 'pin4', 'pin5', 'pin7', 'pin8'],
    paths: [],
  },
  {
    id: 'in-use',
    nodes: ['pin1', 'pin2', 'pin3', 'pin6', 'send', 'receive'],
    paths: ['pin1-send', 'pin2-send', 'pin3-receive', 'pin6-receive'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TwistedPairPinsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-twisted-pair-pins-arrow`
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
      scenarios={twistedPairPinsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 148' : '0 0 280 232'}>
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
