import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cloud-computing'].diagrams['capacity-planning']

// 세 줄을 그룹 박스로 묶어 위에서부터 필요한 서버, 기존 데이터 센터에 미리 갖춘 서버, 클라우드에서 그달 빌린 서버를 둔다.
// 같은 달은 같은 열에 선다. 노드는 모두 회색이고 경로는 없다.
const groups = [
  { id: 'need', x: 6, y: 4, width: 268, height: 60 },
  { id: 'owned', x: 6, y: 72, width: 268, height: 72 },
  { id: 'rented', x: 6, y: 152, width: 268, height: 60 },
]

const nodes = [
  { id: 'need-1', x: 13, y: 24, width: 56 },
  { id: 'need-2', x: 79, y: 24, width: 56 },
  { id: 'need-3', x: 145, y: 24, width: 56 },
  { id: 'need-4', x: 211, y: 24, width: 56 },
  { id: 'owned-1', x: 13, y: 92, width: 56 },
  { id: 'owned-2', x: 79, y: 92, width: 56 },
  { id: 'owned-3', x: 145, y: 92, width: 56 },
  { id: 'owned-4', x: 211, y: 92, width: 56 },
  { id: 'rented-1', x: 13, y: 172, width: 56 },
  { id: 'rented-2', x: 79, y: 172, width: 56 },
  { id: 'rented-3', x: 145, y: 172, width: 56 },
  { id: 'rented-4', x: 211, y: 172, width: 56 },
]

// 남고 모자란 대수는 가운데 줄 노드마다 바로 아래, 가운데 줄 박스 안에 둔다. 기존 데이터 센터를 고를 때만 보인다.
const notes = [
  { id: 'owned-note-1', x: 41, y: 138, scenarios: ['traditional'] },
  { id: 'owned-note-2', x: 107, y: 138, scenarios: ['traditional'] },
  { id: 'owned-note-3', x: 173, y: 138, scenarios: ['traditional'] },
  { id: 'owned-note-4', x: 239, y: 138, scenarios: ['traditional'] },
]

// 가로형도 같은 모양이다. 폭이 넓어진 만큼 줄과 노드를 넓힌다.
const wideGroups = [
  { id: 'need', x: 14, y: 4, width: 412, height: 60 },
  { id: 'owned', x: 14, y: 72, width: 412, height: 72 },
  { id: 'rented', x: 14, y: 152, width: 412, height: 60 },
]

const wideNodes = [
  { id: 'need-1', x: 22, y: 24, width: 88 },
  { id: 'need-2', x: 122, y: 24, width: 88 },
  { id: 'need-3', x: 222, y: 24, width: 88 },
  { id: 'need-4', x: 322, y: 24, width: 88 },
  { id: 'owned-1', x: 22, y: 92, width: 88 },
  { id: 'owned-2', x: 122, y: 92, width: 88 },
  { id: 'owned-3', x: 222, y: 92, width: 88 },
  { id: 'owned-4', x: 322, y: 92, width: 88 },
  { id: 'rented-1', x: 22, y: 172, width: 88 },
  { id: 'rented-2', x: 122, y: 172, width: 88 },
  { id: 'rented-3', x: 222, y: 172, width: 88 },
  { id: 'rented-4', x: 322, y: 172, width: 88 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'owned-note-1', x: 66, y: 138 },
  { id: 'owned-note-2', x: 166, y: 138 },
  { id: 'owned-note-3', x: 266, y: 138 },
  { id: 'owned-note-4', x: 366, y: 138 },
]

const needIds = ['need-1', 'need-2', 'need-3', 'need-4']

export const capacityPlanningScenarios: DiagramScenario[] = [
  { id: 'traditional', nodes: [...needIds, 'owned-1', 'owned-2', 'owned-3', 'owned-4'], paths: [] },
  { id: 'cloud', nodes: [...needIds, 'rented-1', 'rented-2', 'rented-3', 'rented-4'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CapacityPlanningDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={capacityPlanningScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 216'}>
          {layoutGroups.map((group) => (
            <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" className="fill-none stroke-disabled" strokeWidth="1" />
          ))}
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
