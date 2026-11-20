import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['wireless-lan'].diagrams['mimo-streams']

// 세로형은 맨 위에 AP01 박스를 두고 그 안에 안테나 넷을 2×2로 쌓는다. 아래 줄 왼쪽에 LAPTOP01, 오른쪽에 LAPTOP02를 둔다.
// 화살표 하나가 공간 스트림 하나이고, 어느 안테나에서 나가는지는 본문이 말하지 않으므로 AP01 박스의 아래 변에서 나가게 그린다.
// 노드는 모두 회색이다.
const nodes = [
  { id: 'ant1', x: 56, y: 28, width: 72 },
  { id: 'ant2', x: 152, y: 28, width: 72 },
  { id: 'ant3', x: 56, y: 68, width: 72 },
  { id: 'ant4', x: 152, y: 68, width: 72 },
  { id: 'laptop01', x: 16, y: 176, width: 104 },
  { id: 'laptop02', x: 160, y: 176, width: 104 },
]

const groups = [
  { id: 'ap01', x: 48, y: 8, width: 184, height: 100, labelX: 56, labelY: 21 },
]

const paths: Record<string, string> = {
  'mimo-s1': 'M64 108 V176',
  'mimo-s2': 'M104 108 V176',
  'mu-s1': 'M84 108 V176',
  'mu-s2': 'M200 108 V176',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. MIMO는 LAPTOP01 아래, MU-MIMO는 LAPTOP02 아래에 둔다.
const noteScenarios: Record<string, string> = {
  'mimo-note': 'mimo',
  'mu-mimo-note': 'mu-mimo',
}

const notes: Note[] = [
  { id: 'mimo-note', x: 68, y: 228, anchor: 'middle' },
  { id: 'mu-mimo-note', x: 212, y: 228, anchor: 'middle' },
]

// 가로형은 왼쪽에 AP01 박스(안테나 2×2)를, 오른쪽 열에 LAPTOP01과 LAPTOP02를 위아래로 둔다. 화살표는 AP01 박스의 오른쪽 변에서 나간다.
const wideNodes = [
  { id: 'ant1', x: 16, y: 28, width: 72 },
  { id: 'ant2', x: 104, y: 28, width: 72 },
  { id: 'ant3', x: 16, y: 68, width: 72 },
  { id: 'ant4', x: 104, y: 68, width: 72 },
  { id: 'laptop01', x: 320, y: 20, width: 104 },
  { id: 'laptop02', x: 320, y: 76, width: 104 },
]

const wideGroups = [
  { id: 'ap01', x: 8, y: 8, width: 176, height: 100, labelX: 16, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'mimo-s1': 'M184 28 H320',
  'mimo-s2': 'M184 44 H320',
  'mu-s1': 'M184 36 H320',
  'mu-s2': 'M184 92 H320',
}

const wideNotes: Note[] = [
  { id: 'mimo-note', x: 252, y: 16, anchor: 'middle' },
  { id: 'mu-mimo-note', x: 252, y: 72, anchor: 'middle' },
]

// MIMO: 스트림 둘이 모두 LAPTOP01로 간다. MU-MIMO: 스트림 하나씩 LAPTOP01과 LAPTOP02로 간다.
export const mimoStreamsScenarios: DiagramScenario[] = [
  {
    id: 'mimo',
    nodes: ['ant1', 'ant2', 'ant3', 'ant4', 'laptop01'],
    paths: ['mimo-s1', 'mimo-s2'],
  },
  {
    id: 'mu-mimo',
    nodes: ['ant1', 'ant2', 'ant3', 'ant4', 'laptop01', 'laptop02'],
    paths: ['mu-s1', 'mu-s2'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MimoStreamsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-mimo-streams-arrow`
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
      scenarios={mimoStreamsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 120' : '0 0 280 240'}>
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
