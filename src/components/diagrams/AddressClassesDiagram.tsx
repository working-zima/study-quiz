import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-addressing'].diagrams['address-classes']

// 세로형은 클래스마다 한 줄에 이름·맨 앞 비트·첫 옥텟 범위 상자를 왼쪽부터 놓고, 오른쪽 곁말에 네트워크 부분의 길이나 쓰임을 적는다.
// 맨 위 곁말은 열 이름이다. 아래 두 곁말은 첫 옥텟 150을 펼쳐 B 클래스로 가르는 예다. 클래스는 서로 겹치지 않는 범위라 줄을 따로 둔다(강의 수정 이력 L37).
const nodes = [
  { id: 'a-name', x: 4, y: 22, width: 28 },
  { id: 'a-bits', x: 38, y: 22, width: 48 },
  { id: 'a-range', x: 92, y: 22, width: 60 },
  { id: 'b-name', x: 4, y: 60, width: 28 },
  { id: 'b-bits', x: 38, y: 60, width: 48 },
  { id: 'b-range', x: 92, y: 60, width: 60 },
  { id: 'c-name', x: 4, y: 98, width: 28 },
  { id: 'c-bits', x: 38, y: 98, width: 48 },
  { id: 'c-range', x: 92, y: 98, width: 60 },
  { id: 'd-name', x: 4, y: 136, width: 28 },
  { id: 'd-bits', x: 38, y: 136, width: 48 },
  { id: 'd-range', x: 92, y: 136, width: 60 },
  { id: 'e-name', x: 4, y: 174, width: 28 },
  { id: 'e-bits', x: 38, y: 174, width: 48 },
  { id: 'e-range', x: 92, y: 174, width: 60 },
]

// 곁말의 흐림: 열 이름은 늘 선명하고, 줄의 곁말은 그 줄 이름 상자를 따른다. 예의 곁말은 「전체」와 그 시나리오에서만 선명하다.
const notes = [
  { id: 'head-name', owner: null, scenario: null, x: 18, y: 14, anchor: 'middle' as const },
  { id: 'head-bits', owner: null, scenario: null, x: 62, y: 14, anchor: 'middle' as const },
  { id: 'head-range', owner: null, scenario: null, x: 122, y: 14, anchor: 'middle' as const },
  { id: 'a-use', owner: 'a-name', scenario: null, x: 160, y: 42, anchor: 'start' as const },
  { id: 'b-use', owner: 'b-name', scenario: null, x: 160, y: 80, anchor: 'start' as const },
  { id: 'c-use', owner: 'c-name', scenario: null, x: 160, y: 118, anchor: 'start' as const },
  { id: 'd-use', owner: 'd-name', scenario: null, x: 160, y: 156, anchor: 'start' as const },
  { id: 'e-use', owner: 'e-name', scenario: null, x: 160, y: 194, anchor: 'start' as const },
  { id: 'example-bits', owner: null, scenario: 'example', x: 4, y: 226, anchor: 'start' as const },
  { id: 'example-class', owner: null, scenario: 'example', x: 4, y: 242, anchor: 'start' as const },
]

// 가로형은 같은 짜임에서 상자를 넓히고, 예의 곁말 둘을 한 줄에 놓는다.
const wideNodes = [
  { id: 'a-name', x: 16, y: 22, width: 40 },
  { id: 'a-bits', x: 64, y: 22, width: 64 },
  { id: 'a-range', x: 136, y: 22, width: 80 },
  { id: 'b-name', x: 16, y: 58, width: 40 },
  { id: 'b-bits', x: 64, y: 58, width: 64 },
  { id: 'b-range', x: 136, y: 58, width: 80 },
  { id: 'c-name', x: 16, y: 94, width: 40 },
  { id: 'c-bits', x: 64, y: 94, width: 64 },
  { id: 'c-range', x: 136, y: 94, width: 80 },
  { id: 'd-name', x: 16, y: 130, width: 40 },
  { id: 'd-bits', x: 64, y: 130, width: 64 },
  { id: 'd-range', x: 136, y: 130, width: 80 },
  { id: 'e-name', x: 16, y: 166, width: 40 },
  { id: 'e-bits', x: 64, y: 166, width: 64 },
  { id: 'e-range', x: 136, y: 166, width: 80 },
]

const wideNotes = [
  { id: 'head-name', x: 36, y: 14 },
  { id: 'head-bits', x: 96, y: 14 },
  { id: 'head-range', x: 176, y: 14 },
  { id: 'a-use', x: 228, y: 42 },
  { id: 'b-use', x: 228, y: 78 },
  { id: 'c-use', x: 228, y: 114 },
  { id: 'd-use', x: 228, y: 150 },
  { id: 'e-use', x: 228, y: 186 },
  { id: 'example-bits', x: 16, y: 222 },
  { id: 'example-class', x: 152, y: 222 },
]

// A·B·C: 세 줄이 선명하다. D·E: 두 줄이 선명하다. 첫 옥텟 150: B 줄만 선명하다.
export const addressClassesScenarios: DiagramScenario[] = [
  { id: 'unicast', nodes: ['a-name', 'a-bits', 'a-range', 'b-name', 'b-bits', 'b-range', 'c-name', 'c-bits', 'c-range'], paths: [] },
  { id: 'others', nodes: ['d-name', 'd-bits', 'd-range', 'e-name', 'e-bits', 'e-range'], paths: [] },
  { id: 'example', nodes: ['b-name', 'b-bits', 'b-range'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AddressClassesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const noteOpacity = (note: (typeof notes)[number]) => {
    if (note.scenario) return active && active.id !== note.scenario ? 0.25 : 1
    return note.owner ? opacityOf(note.owner) : 1
  }
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={addressClassesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 250'}>
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={noteOpacity(note)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
