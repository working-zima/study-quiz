import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['protocols-encapsulation'].diagrams['packet-parts']

// 왼쪽부터 헤더·페이로드·트레일러를 모서리 없는 칸으로 빈틈없이 이어 붙인다. 노드는 모두 회색이다.
// 본문은 세 부분의 크기를 말하지 않으므로 칸 폭을 같게 둔다.
const nodes = [
  { id: 'header', x: 14, y: 32, width: 84 },
  { id: 'payload', x: 98, y: 32, width: 84 },
  { id: 'trailer', x: 182, y: 32, width: 84 },
]

// 칸마다 하는 일은 시나리오와 상관없이 늘 보이고, 자기 칸 바로 아래 가운데에서 그 칸의 opacity를 따른다.
const roleNotes = [
  { id: 'role-header', x: 56, y: 78, cell: 'header' },
  { id: 'role-payload', x: 140, y: 78, cell: 'payload' },
  { id: 'role-trailer', x: 224, y: 78, cell: 'trailer' },
]

// 트레일러가 붙는지를 말하는 곁말은 트레일러 칸 바로 위 가운데에 둔다. 두 시나리오는 같은 자리에 다른 글이 나온다.
const notes = [
  { id: 'trailer-used', x: 224, y: 24, scenarios: ['with-trailer'] },
  { id: 'trailer-absent', x: 224, y: 24, scenarios: ['without-trailer'] },
]

// 가로형은 칸을 넓혀 가운데에 둔다.
const wideNodes = [
  { id: 'header', x: 40, y: 32, width: 120 },
  { id: 'payload', x: 160, y: 32, width: 120 },
  { id: 'trailer', x: 280, y: 32, width: 120 },
]

const wideRoleNotes = [
  { id: 'role-header', x: 100, y: 78 },
  { id: 'role-payload', x: 220, y: 78 },
  { id: 'role-trailer', x: 340, y: 78 },
]

const wideNotes = [
  { id: 'trailer-used', x: 340, y: 24 },
  { id: 'trailer-absent', x: 340, y: 24 },
]

// 이 도식에는 화살표가 없다. 시나리오는 칸의 opacity와 트레일러 곁말로 갈린다.
export const packetPartsScenarios: DiagramScenario[] = [
  { id: 'with-trailer', nodes: ['header', 'payload', 'trailer'], paths: [] },
  { id: 'without-trailer', nodes: ['header', 'payload'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PacketPartsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutRoleNotes = wide ? wideRoleNotes.map((note) => ({ ...roleNotes.find(({ id }) => id === note.id)!, ...note })) : roleNotes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={packetPartsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 88' : '0 0 280 88'}>
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="0" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutRoleNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity={opacityOf(note.cell)}>
              {text.notes![note.id]}
            </text>
          ))}
          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
