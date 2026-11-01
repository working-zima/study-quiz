import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-storage'].diagrams['lrs-zrs']

// 세로형은 LRS 박스와 ZRS 박스를 위아래로 쌓는다. 복사본 셋을 나란히 두어 두 옵션의 복사본 수가 같다는 것을 보인다.
const groups = [
  { id: 'lrs-datacenter', x: 8, y: 8, width: 264, height: 76 },
  { id: 'zrs-region', x: 8, y: 94, width: 264, height: 108 },
  { id: 'zone-1', x: 16, y: 118, width: 80, height: 64 },
  { id: 'zone-2', x: 100, y: 118, width: 80, height: 64 },
  { id: 'zone-3', x: 184, y: 118, width: 80, height: 64 },
]

// 노드는 모두 회색이다. 무엇이 멈추는지는 흐림과 곁말로만 보인다.
const nodes = [
  { id: 'lrs-1', x: 20, y: 32, width: 72 },
  { id: 'lrs-2', x: 104, y: 32, width: 72 },
  { id: 'lrs-3', x: 188, y: 32, width: 72 },
  { id: 'zrs-1', x: 24, y: 142, width: 64 },
  { id: 'zrs-2', x: 108, y: 142, width: 64 },
  { id: 'zrs-3', x: 192, y: 142, width: 64 },
]

const notes = [
  { id: 'lrs-compare-note', x: 20, y: 76, scenario: 'compare' },
  { id: 'zrs-compare-note', x: 16, y: 194, scenario: 'compare' },
  { id: 'lrs-down-note', x: 20, y: 76, scenario: 'datacenter-down' },
  { id: 'zone-1-note', x: 16, y: 194, scenario: 'datacenter-down' },
  { id: 'zrs-left-note', x: 100, y: 194, scenario: 'datacenter-down' },
]

// 가로형도 위아래로 쌓되 복사본의 열을 맞춘다. 곁말은 박스 라벨 줄의 오른쪽에 둔다.
const wideGroups = [
  { id: 'lrs-datacenter', x: 8, y: 8, width: 424, height: 64 },
  { id: 'zrs-region', x: 8, y: 80, width: 424, height: 96 },
  { id: 'zone-1', x: 18, y: 104, width: 128, height: 64 },
  { id: 'zone-2', x: 156, y: 104, width: 128, height: 64 },
  { id: 'zone-3', x: 294, y: 104, width: 128, height: 64 },
]

const wideNodes = [
  { id: 'lrs-1', x: 30, y: 32, width: 104 },
  { id: 'lrs-2', x: 168, y: 32, width: 104 },
  { id: 'lrs-3', x: 306, y: 32, width: 104 },
  { id: 'zrs-1', x: 30, y: 128, width: 104 },
  { id: 'zrs-2', x: 168, y: 128, width: 104 },
  { id: 'zrs-3', x: 306, y: 128, width: 104 },
]

const wideNotes = [
  { id: 'lrs-compare-note', x: 150, y: 22, scenario: 'compare' },
  { id: 'zrs-compare-note', x: 150, y: 94, scenario: 'compare' },
  { id: 'lrs-down-note', x: 150, y: 22, scenario: 'datacenter-down' },
  { id: 'zone-1-note', x: 66, y: 118, scenario: 'datacenter-down' },
  { id: 'zrs-left-note', x: 150, y: 94, scenario: 'datacenter-down' },
]

// 그릴 경로는 없다. 데이터 센터가 멈추면 LRS의 셋과 영역 1의 복사본이 흐려진다.
export const lrsZrsScenarios: DiagramScenario[] = [
  { id: 'compare', nodes: ['lrs-1', 'lrs-2', 'lrs-3', 'zrs-1', 'zrs-2', 'zrs-3'], paths: [] },
  { id: 'datacenter-down', nodes: ['zrs-2', 'zrs-3'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LrsZrsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={lrsZrsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 210'}>
          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
              {text.groups![group.id]}
            </text>
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="start" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
