import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-regions-zones'].diagrams['availability-zones']

// 지역 박스 안에 영역 셋을 위아래로 쌓는다. 영역마다 데이터 센터와 VM을 한 줄에 나란히 둔다.
// 영역 박스는 지역의 라벨 자리보다 아래에서 시작하고, 노드는 자기 영역 박스의 라벨 자리 아래에 있다.
const groups = [
  { id: 'region', x: 6, y: 4, width: 268, height: 240 },
  { id: 'zone-1', x: 16, y: 28, width: 248, height: 64 },
  { id: 'zone-2', x: 16, y: 100, width: 248, height: 64 },
  { id: 'zone-3', x: 16, y: 172, width: 248, height: 64 },
]

// 노드는 모두 회색이다. 무엇이 멈추는지는 흐림과 곁말로만 보인다.
const nodes = [
  { id: 'dc-1', x: 28, y: 52, width: 96 },
  { id: 'vm-1', x: 156, y: 52, width: 96 },
  { id: 'dc-2', x: 28, y: 124, width: 96 },
  { id: 'vm-2', x: 156, y: 124, width: 96 },
  { id: 'dc-3', x: 28, y: 196, width: 96 },
  { id: 'vm-3', x: 156, y: 196, width: 96 },
]

// 곁말은 자기 박스의 라벨 오른쪽, 라벨과 같은 줄에 두고 그 시나리오에서만 보인다.
const notes = [
  { id: 'region-note', x: 54, y: 18, textAnchor: 'start' as const, scenarios: ['region-down'] },
  { id: 'zone-1-note', x: 64, y: 42, textAnchor: 'start' as const, scenarios: ['zone-down'] },
  { id: 'zone-2-note', x: 64, y: 114, textAnchor: 'start' as const, scenarios: ['zone-down'] },
  { id: 'zone-3-note', x: 64, y: 186, textAnchor: 'start' as const, scenarios: ['zone-down'] },
]

// 가로형은 영역 셋을 나란히 두고, 영역마다 데이터 센터 아래에 VM을 둔다.
const wideGroups = [
  { id: 'region', x: 8, y: 4, width: 424, height: 136 },
  { id: 'zone-1', x: 18, y: 28, width: 130, height: 104 },
  { id: 'zone-2', x: 156, y: 28, width: 130, height: 104 },
  { id: 'zone-3', x: 294, y: 28, width: 130, height: 104 },
]

const wideNodes = [
  { id: 'dc-1', x: 31, y: 52, width: 104 },
  { id: 'vm-1', x: 31, y: 92, width: 104 },
  { id: 'dc-2', x: 169, y: 52, width: 104 },
  { id: 'vm-2', x: 169, y: 92, width: 104 },
  { id: 'dc-3', x: 307, y: 52, width: 104 },
  { id: 'vm-3', x: 307, y: 92, width: 104 },
]

// 곁말은 자리가 배치마다 다르다. 보이는 시나리오는 세로형 notes에서 id로 가져온다.
const wideNotes = [
  { id: 'region-note', x: 56, y: 18, textAnchor: 'start' as const },
  { id: 'zone-1-note', x: 66, y: 42, textAnchor: 'start' as const },
  { id: 'zone-2-note', x: 204, y: 42, textAnchor: 'start' as const },
  { id: 'zone-3-note', x: 342, y: 42, textAnchor: 'start' as const },
]

// 영역 하나가 멈추면 다른 두 영역의 노드만 선명하고, 지역 전체가 멈추면 선명한 노드가 없다. 그릴 경로는 없다.
export const zoneIsolationScenarios: DiagramScenario[] = [
  { id: 'zone-down', nodes: ['dc-2', 'vm-2', 'dc-3', 'vm-3'], paths: [] },
  { id: 'region-down', nodes: [], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ZoneIsolationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={zoneIsolationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 148' : '0 0 280 252'}>
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
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
