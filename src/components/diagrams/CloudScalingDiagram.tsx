import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cloud-benefits'].diagrams['cloud-scaling']

// 같은 웹사이트를 실행하는 VM 셋을 그룹 박스 하나 안에 한 줄로 둔다. 노드는 모두 회색이고 경로는 없다.
// 수직 크기 조정은 VM 1 하나만, 수평 크기 조정은 셋을 선명하게 두고, 그 VM에 하는 일을 노드 아래 곁말로 보인다.
const groups = [
  { id: 'vms', x: 6, y: 4, width: 268, height: 80 },
]

const nodes = [
  { id: 'vm-1', x: 30, y: 26, width: 64 },
  { id: 'vm-2', x: 108, y: 26, width: 64 },
  { id: 'vm-3', x: 186, y: 26, width: 64 },
]

// 곁말은 자기 VM 바로 아래, 그룹 박스 안에 둔다.
const notes = [
  { id: 'vm-1-note', x: 62, y: 74, scenarios: ['vertical'] },
  { id: 'vm-2-note', x: 140, y: 74, scenarios: ['horizontal'] },
  { id: 'vm-3-note', x: 218, y: 74, scenarios: ['horizontal'] },
]

// 가로형도 같은 모양이다. 폭이 넓어진 만큼 박스와 노드를 넓힌다.
const wideGroups = [
  { id: 'vms', x: 14, y: 4, width: 412, height: 80 },
]

const wideNodes = [
  { id: 'vm-1', x: 52, y: 26, width: 96 },
  { id: 'vm-2', x: 172, y: 26, width: 96 },
  { id: 'vm-3', x: 292, y: 26, width: 96 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'vm-1-note', x: 100, y: 74 },
  { id: 'vm-2-note', x: 220, y: 74 },
  { id: 'vm-3-note', x: 340, y: 74 },
]

export const cloudScalingScenarios: DiagramScenario[] = [
  { id: 'vertical', nodes: ['vm-1'], paths: [] },
  { id: 'horizontal', nodes: ['vm-1', 'vm-2', 'vm-3'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CloudScalingDiagram() {
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
      scenarios={cloudScalingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 88' : '0 0 280 88'}>
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
