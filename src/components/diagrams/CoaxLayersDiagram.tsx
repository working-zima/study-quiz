import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['transmission-media'].diagrams['coax-layers']

// 세로형은 동축 케이블 박스 안에 네 겹을 가운데에서 바깥쪽 차례로 위에서 아래로 쌓는다. 박스 오른쪽 아래, 피복 옆에 바깥 잡음을 둔다.
// 화살표는 바깥 잡음이 와 닿는 곳이고, 바깥 도체의 오른쪽 변에서 끝난다. 노드는 모두 회색이다.
const nodes = [
  { id: 'core', x: 96, y: 28, width: 72 },
  { id: 'insulator', x: 96, y: 68, width: 72 },
  { id: 'outer', x: 96, y: 108, width: 72 },
  { id: 'jacket', x: 96, y: 148, width: 72 },
  { id: 'noise', x: 188, y: 148, width: 80 },
]

const groups = [
  { id: 'cable', x: 88, y: 8, width: 88, height: 180, labelX: 96, labelY: 21 },
]

const paths: Record<string, string> = {
  'noise-outer': 'M188 164 H180 V124 H168',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 「신호를 나르는 쌍」의 곁말은 케이블 박스 왼쪽 빈자리에 그 겹의 줄마다,
// 「바깥 잡음 줄이기」의 곁말은 박스 오른쪽, 바깥 도체의 줄에 둔다.
const noteScenarios: Record<string, string> = {
  'core-note': 'pair',
  'insulator-note': 'pair',
  'outer-note': 'pair',
  'shield-note': 'shield',
}

const notes: Note[] = [
  { id: 'core-note', x: 80, y: 48, anchor: 'end' },
  { id: 'insulator-note', x: 80, y: 88, anchor: 'end' },
  { id: 'outer-note', x: 80, y: 128, anchor: 'end' },
  { id: 'shield-note', x: 188, y: 128, anchor: 'start' },
]

// 가로형은 네 겹을 왼쪽에서 오른쪽으로 한 줄에 놓고, 케이블 박스 오른쪽 밖에 바깥 잡음을 둔다.
// 화살표는 케이블 박스 아래로 돌아 바깥 도체의 아래 변에서 끝난다. 「신호를 나르는 쌍」의 곁말은 박스 안, 그 겹의 위쪽 빈자리에 둔다.
const wideNodes = [
  { id: 'core', x: 24, y: 28, width: 72 },
  { id: 'insulator', x: 104, y: 28, width: 72 },
  { id: 'outer', x: 184, y: 28, width: 72 },
  { id: 'jacket', x: 264, y: 28, width: 72 },
  { id: 'noise', x: 356, y: 28, width: 76 },
]

const wideGroups = [
  { id: 'cable', x: 16, y: 8, width: 328, height: 60, labelX: 272, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'noise-outer': 'M394 60 V80 H220 V60',
}

const wideNotes: Note[] = [
  { id: 'core-note', x: 60, y: 21, anchor: 'middle' },
  { id: 'insulator-note', x: 140, y: 21, anchor: 'middle' },
  { id: 'outer-note', x: 220, y: 21, anchor: 'middle' },
  { id: 'shield-note', x: 228, y: 100, anchor: 'start' },
]

// 신호를 나르는 쌍: 중심 도체와 바깥 도체가 한 쌍이고, 그 사이를 절연체가 채운다.
// 바깥 잡음 줄이기: 바깥 잡음이 바깥 도체에 와 닿고, 바깥 도체가 안쪽 중심 도체의 신호를 둘러싼다.
export const coaxLayersScenarios: DiagramScenario[] = [
  {
    id: 'pair',
    nodes: ['core', 'insulator', 'outer'],
    paths: [],
  },
  {
    id: 'shield',
    nodes: ['core', 'outer', 'noise'],
    paths: ['noise-outer'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CoaxLayersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-coax-layers-arrow`
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
      scenarios={coaxLayersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 108' : '0 0 280 196'}>
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
