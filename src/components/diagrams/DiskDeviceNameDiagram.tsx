import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-filesystem'].diagrams['disk-device-name']

// 세로형은 장치 이름 테두리 안에 /dev/ · sd · a · 5 네 덩어리를 한 줄에 빈틈없이 잇는다.
// 덩어리의 뜻은 그 아래 곁말로 보인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'dir', x: 20, y: 30, width: 72 },
  { id: 'driver', x: 92, y: 30, width: 56 },
  { id: 'disk', x: 148, y: 30, width: 56 },
  { id: 'part', x: 204, y: 30, width: 56 },
]

const groups = [
  { id: 'name', x: 8, y: 8, width: 264, height: 96, labelX: 16, labelY: 22 },
]

// 곁말은 자기 덩어리 아래에 둔다. 파티션 번호의 곁말만 두 줄이다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'dir-note', x: 20, y: 82, anchor: 'start', scenarios: ['directory'] },
  { id: 'driver-note', x: 120, y: 82, anchor: 'middle', scenarios: ['driver'] },
  { id: 'disk-note', x: 176, y: 82, anchor: 'middle', scenarios: ['disk'] },
  { id: 'part-note', x: 260, y: 82, anchor: 'end', scenarios: ['partition'] },
  { id: 'logical-note', x: 260, y: 96, anchor: 'end', scenarios: ['partition'] },
]

// 가로형도 같은 짜임이다. 덩어리를 넓혀 테두리 가운데에 둔다.
const wideNodes = [
  { id: 'dir', x: 48, y: 30, width: 104 },
  { id: 'driver', x: 152, y: 30, width: 80 },
  { id: 'disk', x: 232, y: 30, width: 80 },
  { id: 'part', x: 312, y: 30, width: 80 },
]

const wideGroups = [
  { id: 'name', x: 8, y: 8, width: 424, height: 96, labelX: 16, labelY: 22 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'dir-note', x: 48, y: 82, anchor: 'start' },
  { id: 'driver-note', x: 192, y: 82, anchor: 'middle' },
  { id: 'disk-note', x: 272, y: 82, anchor: 'middle' },
  { id: 'part-note', x: 392, y: 82, anchor: 'end' },
  { id: 'logical-note', x: 392, y: 96, anchor: 'end' },
]

// 화살표는 없다. 시나리오마다 덩어리 하나를 선명하게 두고 그 뜻을 곁말로 보인다.
export const diskDeviceNameScenarios: DiagramScenario[] = [
  { id: 'directory', nodes: ['dir'], paths: [] },
  { id: 'driver', nodes: ['driver'], paths: [] },
  { id: 'disk', nodes: ['disk'], paths: [] },
  { id: 'partition', nodes: ['part'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DiskDeviceNameDiagram() {
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
      scenarios={diskDeviceNameScenarios}
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

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
