import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-protocol'].diagrams['fragment-fields']

// 세로형은 조각 셋을 세 열로 나란히 두고, 열마다 조각 이름 아래에 식별자·MF·단편화 오프셋 칸을 빈틈없이 쌓는다.
// 아래 그룹 박스는 원래 데이터이고, 그 안의 띠는 각 조각이 담은 데이터다. 띠 조각은 자기 열과 가운데가 맞는다. 노드는 모두 회색이다.
const nodes = [
  { id: 'frag-1', x: 12, y: 8, width: 80 },
  { id: 'id-1', x: 12, y: 40, width: 80 },
  { id: 'mf-1', x: 12, y: 72, width: 80 },
  { id: 'offset-1', x: 12, y: 104, width: 80 },
  { id: 'frag-2', x: 100, y: 8, width: 80 },
  { id: 'id-2', x: 100, y: 40, width: 80 },
  { id: 'mf-2', x: 100, y: 72, width: 80 },
  { id: 'offset-2', x: 100, y: 104, width: 80 },
  { id: 'frag-3', x: 188, y: 8, width: 80 },
  { id: 'id-3', x: 188, y: 40, width: 80 },
  { id: 'mf-3', x: 188, y: 72, width: 80 },
  { id: 'offset-3', x: 188, y: 104, width: 80 },
  { id: 'data-1', x: 8, y: 184, width: 88 },
  { id: 'data-2', x: 96, y: 184, width: 88 },
  { id: 'data-3', x: 184, y: 184, width: 88 },
]

const groups = [
  { id: 'data', x: 4, y: 164, width: 272, height: 60 },
]

// 데이터의 시작 자리 곁말은 오프셋 칸 바로 아래 자기 열 가운데에 늘 보이고, 그 조각과 같은 흐림을 따른다.
const startNotes = [
  { id: 'start-1', fragment: 'frag-1', x: 52, y: 152 },
  { id: 'start-2', fragment: 'frag-2', x: 140, y: 152 },
  { id: 'start-3', fragment: 'frag-3', x: 228, y: 152 },
]

// 가로형은 같은 짜임에서 열과 띠를 넓힌다.
const wideNodes = [
  { id: 'frag-1', x: 16, y: 8, width: 128 },
  { id: 'id-1', x: 16, y: 40, width: 128 },
  { id: 'mf-1', x: 16, y: 72, width: 128 },
  { id: 'offset-1', x: 16, y: 104, width: 128 },
  { id: 'frag-2', x: 160, y: 8, width: 128 },
  { id: 'id-2', x: 160, y: 40, width: 128 },
  { id: 'mf-2', x: 160, y: 72, width: 128 },
  { id: 'offset-2', x: 160, y: 104, width: 128 },
  { id: 'frag-3', x: 300, y: 8, width: 128 },
  { id: 'id-3', x: 300, y: 40, width: 128 },
  { id: 'mf-3', x: 300, y: 72, width: 128 },
  { id: 'offset-3', x: 300, y: 104, width: 128 },
  { id: 'data-1', x: 8, y: 184, width: 144 },
  { id: 'data-2', x: 152, y: 184, width: 144 },
  { id: 'data-3', x: 296, y: 184, width: 136 },
]

const wideGroups = [
  { id: 'data', x: 4, y: 164, width: 432, height: 60 },
]

const wideStartNotes = [
  { id: 'start-1', x: 80, y: 152 },
  { id: 'start-2', x: 224, y: 152 },
  { id: 'start-3', x: 364, y: 152 },
]

// 조각 하나를 고르면 그 조각의 칸 넷과 그 조각이 담은 데이터만 선명하다. 칸 그림이라 화살표가 없다.
export const fragmentFieldsScenarios: DiagramScenario[] = [
  { id: 'first', nodes: ['frag-1', 'id-1', 'mf-1', 'offset-1', 'data-1'], paths: [] },
  { id: 'middle', nodes: ['frag-2', 'id-2', 'mf-2', 'offset-2', 'data-2'], paths: [] },
  { id: 'last', nodes: ['frag-3', 'id-3', 'mf-3', 'offset-3', 'data-3'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FragmentFieldsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutStartNotes = wide ? wideStartNotes.map((note) => ({ ...startNotes.find(({ id }) => id === note.id)!, ...note })) : startNotes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={fragmentFieldsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 232'}>
          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
              {text.groups?.[group.id]}
            </text>
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutStartNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity={opacityOf(note.fragment)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
