import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-admin-tools'].diagrams['perfmon-collector']

// 맨 위에 성능 카운터를 한 줄 전체 폭으로 둔다. 그 아래 왼쪽에 실시간 그래프를, 오른쪽에 로그 파일이 든 데이터 수집기 집합 박스를 두고,
// 박스 아래에 보고서를 둔다. 카운터에서 로그 파일로, 로그 파일에서 보고서로 가는 화살표는 박스의 그룹 라벨과 간격 곁말의 오른쪽을 지난다.
const nodes = [
  { id: 'counter', x: 20, y: 8, width: 240 },
  { id: 'live', x: 8, y: 72, width: 112 },
  { id: 'log-file', x: 168, y: 84, width: 96 },
  { id: 'report', x: 168, y: 164, width: 96 },
]

const groups = [
  { id: 'collector', x: 136, y: 56, width: 140, height: 92, labelX: 144, labelY: 69 },
]

const paths: Record<string, string> = {
  'counter-live': 'M64 40 V72',
  'counter-log': 'M256 40 V84',
  'log-report': 'M256 116 V164',
}

// 간격 곁말은 모으기에서만 보이고, 데이터 수집기 집합 박스 안 로그 파일 아래에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'interval-note', x: 144, y: 136, anchor: 'start', scenarios: ['collect'] },
]

// 가로형은 실시간 그래프 → 데이터 수집기 집합 → 보고서를 왼쪽에서 오른쪽으로 한 줄에 둔다. 카운터는 그 위 가운데에 두고,
// 실시간 그래프로 가는 화살표는 카운터의 왼쪽 변에서 나간다.
const wideNodes = [
  { id: 'counter', x: 100, y: 8, width: 240 },
  { id: 'live', x: 8, y: 84, width: 112 },
  { id: 'log-file', x: 164, y: 84, width: 96 },
  { id: 'report', x: 324, y: 84, width: 96 },
]

const wideGroups = [
  { id: 'collector', x: 140, y: 56, width: 160, height: 92, labelX: 148, labelY: 69 },
]

const widePaths: Record<string, string> = {
  'counter-live': 'M100 24 H64 V84',
  'counter-log': 'M250 40 V84',
  'log-report': 'M260 100 H324',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'interval-note', x: 148, y: 136, anchor: 'start' },
]

// 실시간: 카운터의 지금 값을 그래프로 본다. 모으기: 데이터 수집기 집합이 값을 로그 파일에 쓴다. 보고서: 모은 값을 나중에 본다.
export const perfmonCollectorScenarios: DiagramScenario[] = [
  { id: 'live', nodes: ['counter', 'live'], paths: ['counter-live'] },
  { id: 'collect', nodes: ['counter', 'log-file'], paths: ['counter-log'] },
  { id: 'report', nodes: ['log-file', 'report'], paths: ['log-report'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PerfmonCollectorDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-perfmon-collector-arrow`
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
      scenarios={perfmonCollectorScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 156' : '0 0 280 204'}>
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
