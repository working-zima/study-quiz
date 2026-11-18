import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-hyperv'].diagrams['hyper-v-replica']

// 세로형은 위에 주 서버 HV01 박스와 복제본 서버 HV02 박스를 나란히 두고, 박스마다 VM01과 VM01 복제본을 둔다. 두 VM01은 서로 다른 호스트에 있는
// 따로 된 것이라 다른 노드로 다른 자리에 둔다. 아래 줄에는 10:05(복제 끝)와 10:08(HV01 멈춤) 두 시각을 왼쪽에서 오른쪽으로 둔다.
// 복제 화살표는 VM01에서 VM01 복제본으로, 시각 화살표는 10:05에서 10:08로 간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'vm-primary', x: 24, y: 32, width: 92 },
  { id: 'vm-replica', x: 164, y: 32, width: 92 },
  { id: 't-replicated', x: 24, y: 120, width: 96 },
  { id: 't-stopped', x: 152, y: 120, width: 112 },
]

const groups = [
  { id: 'hv01', x: 8, y: 8, width: 124, height: 80, labelX: 16, labelY: 21 },
  { id: 'hv02', x: 148, y: 8, width: 124, height: 80, labelX: 156, labelY: 21 },
]

const paths: Record<string, string> = {
  'replicate': 'M116 48 H164',
  'timeline': 'M120 136 H152',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 복제 곁말은 두 박스와 시각 줄 사이에, 「멈춤」은 HV01의 VM01 아래에,
// 「10:05까지의 변경」은 HV02의 복제본 아래에, 없는 변경의 곁말은 시각 줄 아래에 둔다.
const noteScenarios: Record<string, string[]> = {
  'replicate-note': ['replicate'],
  'stopped-note': ['failover'],
  'replica-note': ['failover'],
  'lost-note': ['failover'],
}

const notes: Note[] = [
  { id: 'replicate-note', x: 140, y: 104, anchor: 'middle' },
  { id: 'stopped-note', x: 70, y: 80, anchor: 'middle' },
  { id: 'replica-note', x: 210, y: 80, anchor: 'middle' },
  { id: 'lost-note', x: 140, y: 168, anchor: 'middle' },
]

// 가로형은 같은 배치를 넓힌다 — 두 호스트 박스를 나란히 두고 그 사이를 넓게 띄우며, 시각 줄도 가운데로 모은다.
const wideNodes = [
  { id: 'vm-primary', x: 48, y: 32, width: 100 },
  { id: 'vm-replica', x: 292, y: 32, width: 100 },
  { id: 't-replicated', x: 76, y: 120, width: 96 },
  { id: 't-stopped', x: 268, y: 120, width: 112 },
]

const wideGroups = [
  { id: 'hv01', x: 8, y: 8, width: 180, height: 80, labelX: 16, labelY: 21 },
  { id: 'hv02', x: 252, y: 8, width: 180, height: 80, labelX: 260, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'replicate': 'M148 48 H292',
  'timeline': 'M172 136 H268',
}

const wideNotes: Note[] = [
  { id: 'replicate-note', x: 220, y: 104, anchor: 'middle' },
  { id: 'stopped-note', x: 98, y: 80, anchor: 'middle' },
  { id: 'replica-note', x: 342, y: 80, anchor: 'middle' },
  { id: 'lost-note', x: 220, y: 168, anchor: 'middle' },
]

// 복제: HV01의 VM01이 실행 중이고, 바뀐 내용이 HV02의 복제본으로 간다. 10:05에 한 번 끝난다.
// 장애 조치: 10:08에 HV01이 멈춰 VM01이 흐려지고, HV02의 복제본을 켜서 이어 쓴다. 복제본에는 10:05까지의 변경만 있다.
export const hyperVReplicaScenarios: DiagramScenario[] = [
  { id: 'replicate', nodes: ['vm-primary', 'vm-replica', 't-replicated'], paths: ['replicate'] },
  { id: 'failover', nodes: ['vm-replica', 't-replicated', 't-stopped'], paths: ['timeline'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function HyperVReplicaDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-hyper-v-replica-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={hyperVReplicaScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 176'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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

          {active?.paths.map((id) => (
            <path
              key={id}
              data-path={id}
              d={layoutPaths[id]}
              className="fill-none stroke-title"
              strokeWidth="2"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {active && layoutNotes.filter((note) => noteScenarios[note.id].includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
