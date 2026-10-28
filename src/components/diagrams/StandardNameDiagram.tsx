import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ethernet'].diagrams['standard-name']

// 왼쪽부터 속도·BASE·하이픈 뒤 글자를 모서리 없는 칸으로 빈틈없이 이어 붙인다. 노드는 모두 회색이다.
// 본문은 세 부분의 길이를 말하지 않으므로 칸 폭을 같게 둔다.
const nodes = [
  { id: 'speed', x: 14, y: 8, width: 84 },
  { id: 'base', x: 98, y: 8, width: 84 },
  { id: 'letters', x: 182, y: 8, width: 84 },
]

// 칸의 뜻을 적은 곁말은 자기 칸 바로 아래 가운데에 둔다. encoding은 하이픈 뒤 글자 칸 아래 둘째 줄이다.
const notes = [
  { id: 'speed', x: 56, y: 54 },
  { id: 'base', x: 140, y: 54 },
  { id: 'letters', x: 224, y: 54 },
  { id: 'encoding', x: 224, y: 68 },
]

// 가로형은 칸을 넓혀 가운데에 둔다.
const wideNodes = [
  { id: 'speed', x: 40, y: 8, width: 120 },
  { id: 'base', x: 160, y: 8, width: 120 },
  { id: 'letters', x: 280, y: 8, width: 120 },
]

const wideNotes = [
  { id: 'speed', x: 100, y: 54 },
  { id: 'base', x: 220, y: 54 },
  { id: 'letters', x: 340, y: 54 },
  { id: 'encoding', x: 340, y: 68 },
]

// 이 도식에는 화살표가 없고 칸도 흐려지지 않는다. 시나리오는 칸의 글자와 곁말로 갈린다.
export const standardNameScenarios: DiagramScenario[] = [
  { id: '10base-t', nodes: ['speed', 'base', 'letters'], paths: [] },
  { id: '1000base-sx', nodes: ['speed', 'base', 'letters'], paths: [] },
  { id: '10gbase-t', nodes: ['speed', 'base', 'letters'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

// BASE 칸과 그 곁말은 어느 이름에서나 같다. 나머지는 고른 이름의 것(「이름 id.자리」)을, 아무것도 고르지 않았으면 일반 뜻을 쓴다.
// 고른 이름에 그 자리의 글이 없으면(둘째 글자가 없는 이름의 encoding) 그리지 않는다.
function keyOf(id: string, active: DiagramScenario | null) {
  return id === 'base' || !active ? id : `${active.id}.${id}`
}

export function StandardNameDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={standardNameScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 80' : '0 0 280 80'}>
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="0" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[keyOf(node.id, active)]}
              </text>
            </g>
          ))}

          {layoutNotes.map((note) => {
            const key = keyOf(note.id, active)
            const wording = text.notes?.[key]
            return wording && (
              <text key={note.id} data-note={key} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
                {wording}
              </text>
            )
          })}
        </svg>
      </div>
    </DiagramFrame>
  )
}
