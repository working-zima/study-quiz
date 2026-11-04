import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-permissions'].diagrams['permission-string']

// 세로형은 권한 문자열 테두리 안에 - · rw- · r-- · r-- 네 덩어리를 한 줄에 빈틈없이 잇는다.
// 덩어리 바로 위에는 그 칸이 무엇의 자리인지(종류·소유자·그룹·그 밖)를 늘 보이고, 덩어리의 뜻은 아래 곁말로 보인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'type', x: 24, y: 46, width: 40 },
  { id: 'owner', x: 64, y: 46, width: 64 },
  { id: 'group', x: 128, y: 46, width: 64 },
  { id: 'others', x: 192, y: 46, width: 64 },
]

const groups = [
  { id: 'string', x: 8, y: 8, width: 264, height: 96, labelX: 16, labelY: 22 },
]

// 자리 이름은 자기 덩어리 위 가운데에 늘 보인다.
const slots: { id: string, x: number, y: number }[] = [
  { id: 'type-slot', x: 44, y: 40 },
  { id: 'owner-slot', x: 96, y: 40 },
  { id: 'group-slot', x: 160, y: 40 },
  { id: 'others-slot', x: 224, y: 40 },
]

// 곁말은 자기 덩어리 아래 가운데에 두고, 그 덩어리를 고른 시나리오에서만 보인다.
const notes: { id: string, x: number, y: number, scenarios: string[] }[] = [
  { id: 'type-note', x: 44, y: 96, scenarios: ['type'] },
  { id: 'owner-note', x: 96, y: 96, scenarios: ['owner'] },
  { id: 'group-note', x: 160, y: 96, scenarios: ['group'] },
  { id: 'others-note', x: 224, y: 96, scenarios: ['others'] },
]

// 가로형도 같은 짜임이다. 덩어리를 넓혀 테두리 가운데에 둔다.
const wideNodes = [
  { id: 'type', x: 44, y: 46, width: 64 },
  { id: 'owner', x: 108, y: 46, width: 96 },
  { id: 'group', x: 204, y: 46, width: 96 },
  { id: 'others', x: 300, y: 46, width: 96 },
]

const wideGroups = [
  { id: 'string', x: 8, y: 8, width: 424, height: 96, labelX: 16, labelY: 22 },
]

const wideSlots: { id: string, x: number, y: number }[] = [
  { id: 'type-slot', x: 76, y: 40 },
  { id: 'owner-slot', x: 156, y: 40 },
  { id: 'group-slot', x: 252, y: 40 },
  { id: 'others-slot', x: 348, y: 40 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number }[] = [
  { id: 'type-note', x: 76, y: 96 },
  { id: 'owner-note', x: 156, y: 96 },
  { id: 'group-note', x: 252, y: 96 },
  { id: 'others-note', x: 348, y: 96 },
]

// 화살표는 없다. 시나리오마다 덩어리 하나를 선명하게 두고 그 뜻을 곁말로 보인다.
export const permissionStringScenarios: DiagramScenario[] = [
  { id: 'type', nodes: ['type'], paths: [] },
  { id: 'owner', nodes: ['owner'], paths: [] },
  { id: 'group', nodes: ['group'], paths: [] },
  { id: 'others', nodes: ['others'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PermissionStringDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutSlots = wide ? wideSlots : slots
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={permissionStringScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 112' : '0 0 280 112'}>
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

          {layoutSlots.map((slot) => (
            <text key={slot.id} data-slot={slot.id} x={slot.x} y={slot.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![slot.id]}
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
