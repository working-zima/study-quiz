import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['dc-replication']

// 세로형은 맨 위 오른쪽에 로그온하는 PC01을 두고, 그 아래 example.com의 도메인 컨트롤러 박스에 DC01·DC02를 나란히,
// 그 아래에 읽기 전용 도메인 컨트롤러를 놓는다. PC01은 DC02 바로 위라 로그온 화살표가 곧게 내려간다.
// 복제 화살표는 DC01에서 DC02로, 읽기 전용 쪽 화살표는 DC02에서 읽기 전용 도메인 컨트롤러로 들어가기만 한다.
const nodes = [
  { id: 'pc01', x: 160, y: 8, width: 108 },
  { id: 'dc01', x: 12, y: 80, width: 108 },
  { id: 'dc02', x: 160, y: 80, width: 108 },
  { id: 'rodc', x: 60, y: 136, width: 160 },
]

const groups = [
  { id: 'dcs', x: 4, y: 56, width: 272, height: 120, labelX: 12, labelY: 69 },
]

const paths: Record<string, string> = {
  'dc01-dc02': 'M120 96 H160',
  'pc01-dc02': 'M214 40 V80',
  'dc02-rodc': 'M200 112 V136',
}

// 곁말은 자기 시나리오에서만 보인다. 「복제」는 복제 화살표 위에, 「멈춤」은 DC01 바로 아래에, 「한 방향으로만 받는다」는 읽기 전용 쪽 화살표 왼쪽에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'copy-note', x: 140, y: 90, anchor: 'middle', scenarios: ['replicate'] },
  { id: 'stop-note', x: 66, y: 128, anchor: 'middle', scenarios: ['failover'] },
  { id: 'oneway-note', x: 192, y: 128, anchor: 'end', scenarios: ['rodc'] },
]

// 가로형은 DC01·DC02·읽기 전용 도메인 컨트롤러를 한 줄에 왼쪽부터 놓고, PC01을 DC02 바로 위에 둔다.
const wideNodes = [
  { id: 'pc01', x: 148, y: 8, width: 92 },
  { id: 'dc01', x: 16, y: 80, width: 92 },
  { id: 'dc02', x: 148, y: 80, width: 92 },
  { id: 'rodc', x: 268, y: 80, width: 160 },
]

const wideGroups = [
  { id: 'dcs', x: 4, y: 56, width: 432, height: 80, labelX: 12, labelY: 69 },
]

const widePaths: Record<string, string> = {
  'dc01-dc02': 'M108 96 H148',
  'pc01-dc02': 'M194 40 V80',
  'dc02-rodc': 'M240 96 H268',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'copy-note', x: 128, y: 90, anchor: 'middle' },
  { id: 'stop-note', x: 62, y: 128, anchor: 'middle' },
  { id: 'oneway-note', x: 348, y: 128, anchor: 'middle' },
]

// 복제: DC01에서 바꾼 내용이 DC02로. 한 대가 멈출 때: DC01이 멈춰도 PC01의 로그온을 DC02가 확인. 읽기 전용: 한 방향으로 복제받기만 한다.
export const domainControllerReplicationScenarios: DiagramScenario[] = [
  { id: 'replicate', nodes: ['dc01', 'dc02'], paths: ['dc01-dc02'] },
  { id: 'failover', nodes: ['pc01', 'dc02'], paths: ['pc01-dc02'] },
  { id: 'rodc', nodes: ['dc02', 'rodc'], paths: ['dc02-rodc'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DomainControllerReplicationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-dc-replication-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={domainControllerReplicationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 184'}>
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

          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
