import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ports'].diagrams['port-ranges']

// 세로형은 범위 하나를 박스 하나로 두고 작은 번호부터 위에서 아래로 쌓는다. 박스 안 왼쪽 노드가 범위의 번호, 오른쪽 노드가 그 범위에 드는 예다.
// 박스 왼쪽 위 그룹 라벨이 범위의 이름이고, 오른쪽 위 곁말이 번호를 IANA가 어떻게 정해 주는지다. 노드는 모두 회색이고 경로는 없다.
const nodes = [
  { id: 'range-1', x: 16, y: 28, width: 100 },
  { id: 'example-1', x: 120, y: 28, width: 144 },
  { id: 'range-2', x: 16, y: 96, width: 100 },
  { id: 'example-2', x: 120, y: 96, width: 144 },
  { id: 'range-3', x: 16, y: 164, width: 100 },
  { id: 'example-3', x: 120, y: 164, width: 144 },
]

const groups = [
  { id: 'well-known', x: 8, y: 8, width: 264, height: 60, labelX: 16, labelY: 20 },
  { id: 'registered', x: 8, y: 76, width: 264, height: 60, labelX: 16, labelY: 88 },
  { id: 'dynamic', x: 8, y: 144, width: 264, height: 60, labelX: 16, labelY: 156 },
]

// 곁말은 자기 범위 노드의 흐림을 따른다.
const notes = [
  { id: 'assign-1', owner: 'range-1', x: 264, y: 20, anchor: 'end' as const },
  { id: 'assign-2', owner: 'range-2', x: 264, y: 88, anchor: 'end' as const },
  { id: 'assign-3', owner: 'range-3', x: 264, y: 156, anchor: 'end' as const },
]

// 가로형도 세 범위를 위아래로 쌓는다. 예 라벨(가장 긴 것 「8080 · HTTP 대체 번호」)이 세 칸을 나란히 둔 폭에 들지 않아서다. 박스와 노드를 넓힌다.
const wideNodes = [
  { id: 'range-1', x: 16, y: 28, width: 144 },
  { id: 'example-1', x: 168, y: 28, width: 200 },
  { id: 'range-2', x: 16, y: 96, width: 144 },
  { id: 'example-2', x: 168, y: 96, width: 200 },
  { id: 'range-3', x: 16, y: 164, width: 144 },
  { id: 'example-3', x: 168, y: 164, width: 200 },
]

const wideGroups = [
  { id: 'well-known', x: 8, y: 8, width: 424, height: 60, labelX: 16, labelY: 20 },
  { id: 'registered', x: 8, y: 76, width: 424, height: 60, labelX: 16, labelY: 88 },
  { id: 'dynamic', x: 8, y: 144, width: 424, height: 60, labelX: 16, labelY: 156 },
]

const wideNotes = [
  { id: 'assign-1', x: 424, y: 20, anchor: 'end' as const },
  { id: 'assign-2', x: 424, y: 88, anchor: 'end' as const },
  { id: 'assign-3', x: 424, y: 156, anchor: 'end' as const },
]

// 범위를 고르면 그 범위의 번호와 예만 선명하다.
export const portRangesScenarios: DiagramScenario[] = [
  { id: 'well-known', nodes: ['range-1', 'example-1'], paths: [] },
  { id: 'registered', nodes: ['range-2', 'example-2'], paths: [] },
  { id: 'dynamic', nodes: ['range-3', 'example-3'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PortRangesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={portRangesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 212' : '0 0 280 212'}>
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

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
