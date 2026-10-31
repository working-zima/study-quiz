import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-compute'].diagrams['availability-sets']

// 가용성 집합 안에 장애 도메인 셋을 나란히 둔다. 장애 도메인 A에는 VM 1과 VM 4를 위아래로 쌓는다.
// 업데이트 도메인은 박스로 그리지 않고 유지 관리 시나리오의 곁말과 캡션으로 보인다. 노드는 모두 회색이고 경로는 없다.
const groups = [
  { id: 'availability-set', x: 4, y: 4, width: 272, height: 170 },
  { id: 'fd-a', x: 12, y: 28, width: 80, height: 138 },
  { id: 'fd-b', x: 100, y: 28, width: 80, height: 138 },
  { id: 'fd-c', x: 188, y: 28, width: 80, height: 138 },
]
const nodes = [
  { id: 'vm-1', x: 24, y: 56, width: 56 },
  { id: 'vm-2', x: 112, y: 56, width: 56 },
  { id: 'vm-3', x: 200, y: 56, width: 56 },
  { id: 'vm-4', x: 24, y: 112, width: 56 },
]
// 곁말은 장애 도메인 A 안에 둔다. 다시 시작 중은 VM 1 바로 아래, 전원이 멈춤은 장애 도메인 A의 맨 아래다.
const notes = [
  { id: 'vm-1-note', x: 52, y: 102, scenarios: ['maintenance'] },
  { id: 'fd-a-note', x: 52, y: 158, scenarios: ['power'] },
]

// 가로형은 장애 도메인 셋을 넓게 펴고, 장애 도메인 A의 VM 둘을 나란히 둔다. 곁말은 VM 아래 한 줄에 둔다.
const wideGroups = [
  { id: 'availability-set', x: 8, y: 4, width: 424, height: 108 },
  { id: 'fd-a', x: 20, y: 26, width: 128, height: 78 },
  { id: 'fd-b', x: 156, y: 26, width: 128, height: 78 },
  { id: 'fd-c', x: 292, y: 26, width: 128, height: 78 },
]
const wideNodes = [
  { id: 'vm-1', x: 32, y: 48, width: 48 },
  { id: 'vm-2', x: 196, y: 48, width: 48 },
  { id: 'vm-3', x: 332, y: 48, width: 48 },
  { id: 'vm-4', x: 88, y: 48, width: 48 },
]
// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'vm-1-note', x: 56, y: 94 },
  { id: 'fd-a-note', x: 84, y: 94 },
]

// 여기서 흐림은 선택 밖이 아니라 멈춘 VM이다. 전원 장애는 장애 도메인 A의 둘을, 유지 관리는 VM 1 하나만 멈춘다.
export const availabilitySetScenarios: DiagramScenario[] = [
  { id: 'power', nodes: ['vm-2', 'vm-3'], paths: [] },
  { id: 'maintenance', nodes: ['vm-2', 'vm-3', 'vm-4'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AvailabilitySetDiagram() {
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
      scenarios={availabilitySetScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 120' : '0 0 280 180'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
