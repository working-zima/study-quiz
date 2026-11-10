import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-monitoring'].diagrams['monitoring-tools']

// 세로형은 오른쪽에 「Azure 쪽」과 「내 구독」을 위아래로 쌓고, 왼쪽에 Azure Service Health와 Azure Advisor를 둔다.
// 두 화살표는 왼쪽으로 곧게 가고, Azure Monitor는 내 구독 아래에 두어 VM 1과 웹 앱 1의 화살표를 아래로 받는다.
const nodes = [
  { id: 'platform', x: 164, y: 30, width: 100 },
  { id: 'vm-1', x: 162, y: 118, width: 42 },
  { id: 'web-app', x: 212, y: 118, width: 56 },
  { id: 'service-health', x: 8, y: 30, width: 140 },
  { id: 'advisor', x: 8, y: 118, width: 140 },
  { id: 'monitor', x: 132, y: 192, width: 140 },
]
const paths: Record<string, string> = {
  'platform-to-health': 'M164 46 H148',
  'vm-to-advisor': 'M162 134 H148',
  'vm-to-monitor': 'M183 150 V192',
  'app-to-monitor': 'M240 150 V192',
}
const groups = [
  { id: 'g-azure', x: 152, y: 8, width: 124, height: 64 },
  { id: 'g-mine', x: 152, y: 96, width: 124, height: 64 },
]
const notes = [
  { id: 'health-note', x: 78, y: 76, anchor: 'middle' as const, scenario: 'azure-side' },
  { id: 'advisor-note', x: 78, y: 164, anchor: 'middle' as const, scenario: 'improve' },
  { id: 'monitor-note', x: 202, y: 238, anchor: 'middle' as const, scenario: 'my-data' },
]

// 가로형은 두 그룹을 위에 나란히 두고, 도구 셋을 아래 한 줄에 놓아 화살표가 아래로 내려간다.
// VM 1에서 Azure Monitor로 가는 화살표는 Azure Advisor를 피해 두 줄 사이(y 92)로 옆을 지난다.
const wideNodes = [
  { id: 'platform', x: 58, y: 30, width: 100 },
  { id: 'vm-1', x: 256, y: 30, width: 64 },
  { id: 'web-app', x: 352, y: 30, width: 56 },
  { id: 'service-health', x: 38, y: 120, width: 140 },
  { id: 'advisor', x: 196, y: 120, width: 104 },
  { id: 'monitor', x: 318, y: 120, width: 104 },
]
const widePaths: Record<string, string> = {
  'platform-to-health': 'M108 62 V120',
  'vm-to-advisor': 'M276 62 V120',
  'vm-to-monitor': 'M304 62 V92 H344 V120',
  'app-to-monitor': 'M380 62 V120',
}
const wideGroups = [
  { id: 'g-azure', x: 8, y: 8, width: 200, height: 64 },
  { id: 'g-mine', x: 232, y: 8, width: 200, height: 64 },
]
const wideNotes = [
  { id: 'health-note', x: 108, y: 168, anchor: 'middle' as const, scenario: 'azure-side' },
  { id: 'advisor-note', x: 248, y: 168, anchor: 'middle' as const, scenario: 'improve' },
  { id: 'monitor-note', x: 370, y: 168, anchor: 'middle' as const, scenario: 'my-data' },
]

export const monitoringToolsScenarios: DiagramScenario[] = [
  { id: 'azure-side', nodes: ['platform', 'service-health'], paths: ['platform-to-health'] },
  { id: 'improve', nodes: ['vm-1', 'advisor'], paths: ['vm-to-advisor'] },
  { id: 'my-data', nodes: ['vm-1', 'web-app', 'monitor'], paths: ['vm-to-monitor', 'app-to-monitor'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MonitoringToolsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-monitoring-tools-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={monitoringToolsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 248'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-disabled" x={group.x} y={group.y} width={group.width} height={group.height} rx="4" strokeWidth="1.5" />
              <text data-group-label={group.id} className="fill-muted" x={group.x + 10} y={group.y + 14} fontSize="9">
                {text.groups![group.id]}
              </text>
            </g>
          ))}

          {visiblePaths.map((id) => (
            <path key={id} data-path={id} d={layoutPaths[id]} className="fill-none stroke-title" strokeWidth="1.5" strokeLinejoin="round" markerEnd={`url(#${arrowId})`} />
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
