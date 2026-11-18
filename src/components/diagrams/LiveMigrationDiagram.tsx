import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-hyperv'].diagrams['live-migration']

// 세로형은 위 가운데에 사용자를 두고, 그 아래에 호스트 HV01 박스와 HV02 박스를 나란히 둔다. 박스마다 VM01이 하나씩 있는데,
// 같은 가상 컴퓨터가 그 호스트에서 실행될 때의 자리라 옮기기 전과 옮긴 뒤를 다른 노드로 다른 자리에 둔다.
// 사용자의 화살표는 위에서 내려와 그때 VM01이 실행되는 호스트의 VM01로 가고, 옮기는 화살표는 HV01의 VM01에서 HV02의 VM01로 간다. 노드는 모두 회색이다.
const nodes = [
  { id: 'user', x: 92, y: 8, width: 96 },
  { id: 'vm-before', x: 24, y: 96, width: 92 },
  { id: 'vm-after', x: 164, y: 96, width: 92 },
]

const groups = [
  { id: 'hv01', x: 8, y: 64, width: 124, height: 88, labelX: 16, labelY: 77 },
  { id: 'hv02', x: 148, y: 64, width: 124, height: 88, labelX: 156, labelY: 77 },
]

const paths: Record<string, string> = {
  'user-before': 'M116 40 V52 H70 V96',
  'user-after': 'M164 40 V52 H210 V96',
  'move': 'M116 112 H164',
}

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 「HV01에서 실행 중」은 옮기기 전과 옮기는 중에 HV01의 VM01 아래,
// 옮기는 곁말은 두 박스 아래, 「HV02에서 이어서 실행」은 옮긴 뒤 HV02의 VM01 아래에 둔다.
const noteScenarios: Record<string, string[]> = {
  'running-note': ['before', 'moving'],
  'moving-note': ['moving'],
  'after-note': ['after'],
}

const notes: Note[] = [
  { id: 'running-note', x: 70, y: 144, anchor: 'middle' },
  { id: 'moving-note', x: 140, y: 172, anchor: 'middle' },
  { id: 'after-note', x: 210, y: 144, anchor: 'middle' },
]

// 가로형은 같은 배치를 넓힌다 — 사용자를 위 가운데에, 두 호스트 박스를 아래에 나란히 두고 그 사이를 넓게 띄운다.
const wideNodes = [
  { id: 'user', x: 172, y: 8, width: 96 },
  { id: 'vm-before', x: 48, y: 96, width: 100 },
  { id: 'vm-after', x: 292, y: 96, width: 100 },
]

const wideGroups = [
  { id: 'hv01', x: 8, y: 64, width: 180, height: 88, labelX: 16, labelY: 77 },
  { id: 'hv02', x: 252, y: 64, width: 180, height: 88, labelX: 260, labelY: 77 },
]

const widePaths: Record<string, string> = {
  'user-before': 'M196 40 V52 H98 V96',
  'user-after': 'M244 40 V52 H342 V96',
  'move': 'M148 112 H292',
}

const wideNotes: Note[] = [
  { id: 'running-note', x: 98, y: 144, anchor: 'middle' },
  { id: 'moving-note', x: 220, y: 172, anchor: 'middle' },
  { id: 'after-note', x: 342, y: 144, anchor: 'middle' },
]

// 옮기기 전: 사용자가 HV01의 VM01을 쓴다. 옮기는 중: VM01이 HV01에서 계속 실행되어 사용자는 그대로 HV01의 VM01을 쓰고,
// 그동안 VM01의 내용이 HV02로 넘어간다. 옮긴 뒤: 사용자가 HV02의 VM01을 쓴다.
export const liveMigrationScenarios: DiagramScenario[] = [
  { id: 'before', nodes: ['user', 'vm-before'], paths: ['user-before'] },
  { id: 'moving', nodes: ['user', 'vm-before', 'vm-after'], paths: ['user-before', 'move'] },
  { id: 'after', nodes: ['user', 'vm-after'], paths: ['user-after'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LiveMigrationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-live-migration-arrow`
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
      scenarios={liveMigrationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 184'}>
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
