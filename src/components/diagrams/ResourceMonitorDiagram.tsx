import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-admin-tools'].diagrams['resource-monitor']

// 맨 위 가운데에 예로 고른 내려받는 프로그램을 두고, 그 아래 리소스 모니터 박스 안에 네 자원을 두 줄 두 칸으로 둔다.
// 아랫줄로 가는 화살표는 윗줄 두 칸 사이를 지나 두 줄 사이에서 꺾인다. 박스 밖 아래에 성능 모니터를 둔다.
const nodes = [
  { id: 'process', x: 84, y: 8, width: 112 },
  { id: 'cpu', x: 28, y: 80, width: 96 },
  { id: 'memory', x: 156, y: 80, width: 96 },
  { id: 'disk', x: 28, y: 136, width: 96 },
  { id: 'network', x: 156, y: 136, width: 96 },
  { id: 'perfmon', x: 8, y: 212, width: 112 },
]

const groups = [
  { id: 'resmon', x: 8, y: 56, width: 264, height: 140, labelX: 16, labelY: 69 },
]

const paths: Record<string, string> = {
  'process-cpu': 'M100 40 V80',
  'process-memory': 'M180 40 V80',
  'process-disk': 'M132 40 V120 H76 V136',
  'process-network': 'M148 40 V128 H204 V136',
}

// 두 곁말은 성능 모니터와에서만 보인다. 지금 이 순간 곁말은 박스 안 아래쪽에, 오래 모으는 곁말은 박스 밖 성능 모니터 오른쪽에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'now-note', x: 16, y: 188, anchor: 'start', scenarios: ['compare'] },
  { id: 'collect-note', x: 128, y: 232, anchor: 'start', scenarios: ['compare'] },
]

// 가로형은 내려받는 프로그램과 성능 모니터를 왼쪽에 위아래로 두고, 오른쪽 리소스 모니터 박스 안에 네 자원을 두 줄 두 칸으로 둔다.
// 오른쪽 칸으로 가는 화살표는 두 줄 사이를 지나 두 칸 사이에서 꺾인다.
const wideNodes = [
  { id: 'process', x: 8, y: 72, width: 120 },
  { id: 'cpu', x: 168, y: 48, width: 112 },
  { id: 'memory', x: 304, y: 48, width: 112 },
  { id: 'disk', x: 168, y: 112, width: 112 },
  { id: 'network', x: 304, y: 112, width: 112 },
  { id: 'perfmon', x: 8, y: 136, width: 120 },
]

const wideGroups = [
  { id: 'resmon', x: 152, y: 24, width: 280, height: 152, labelX: 160, labelY: 37 },
]

const widePaths: Record<string, string> = {
  'process-cpu': 'M128 76 H148 V64 H168',
  'process-memory': 'M128 84 H296 V64 H304',
  'process-disk': 'M128 100 H148 V128 H168',
  'process-network': 'M128 92 H288 V128 H304',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'now-note', x: 160, y: 168, anchor: 'start' },
  { id: 'collect-note', x: 8, y: 184, anchor: 'start' },
]

// 네 자원: 리소스 모니터가 나눠 보여 주는 자원. 프로세스별: 프로세스 하나가 네 자원을 저마다 얼마나 쓰는지. 성능 모니터와: 지금 보기와 오래 모으기.
export const resourceMonitorScenarios: DiagramScenario[] = [
  { id: 'resources', nodes: ['cpu', 'memory', 'disk', 'network'], paths: [] },
  { id: 'per-process', nodes: ['process', 'cpu', 'memory', 'disk', 'network'], paths: ['process-cpu', 'process-memory', 'process-disk', 'process-network'] },
  { id: 'compare', nodes: ['cpu', 'memory', 'disk', 'network', 'perfmon'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ResourceMonitorDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-resource-monitor-arrow`
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
      scenarios={resourceMonitorScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 252'}>
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
