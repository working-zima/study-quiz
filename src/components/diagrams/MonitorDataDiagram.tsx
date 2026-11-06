import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-monitoring'].diagrams['monitor-data']

// 세로형은 데이터 원본 그룹과 Azure Monitor 그룹을 위아래로 쌓고, 분석과 경고를 맨 아래에 둔다.
// 위쪽 두 노드의 경로는 긴 온-프레미스 노드를 피해 그룹 바깥의 좌우 통로로 내려간다.
const nodes = [
  { id: 'web-app', x: 18, y: 34, width: 72 },
  { id: 'vm-1', x: 184, y: 34, width: 72 },
  { id: 'onprem', x: 18, y: 90, width: 244 },
  { id: 'metrics', x: 160, y: 188, width: 96 },
  { id: 'logs', x: 24, y: 188, width: 96 },
  { id: 'analyze', x: 16, y: 272, width: 112 },
  { id: 'alerts', x: 172, y: 272, width: 92 },
]
const paths: Record<string, string> = {
  'vm-to-metrics': 'M256 50 H276 V204 H256',
  'app-to-logs': 'M18 50 H4 V204 H24',
  'onprem-to-logs': 'M72 122 V188',
  'logs-to-analyze': 'M72 220 V272',
  'metrics-to-alerts': 'M208 220 V272',
}
const groups = [
  { id: 'g-sources', x: 8, y: 8, width: 264, height: 136 },
  { id: 'g-monitor', x: 8, y: 160, width: 264, height: 72 },
]
const notes = [
  { id: 'collect-note', x: 140, y: 154, anchor: 'middle' as const, scenario: 'collect' },
  { id: 'metrics-note', x: 218, y: 328, anchor: 'middle' as const, scenario: 'metrics' },
  { id: 'logs-note', x: 64, y: 328, anchor: 'middle' as const, scenario: 'logs' },
]

// 가로형은 데이터 원본 → Azure Monitor → 쓰임을 왼쪽에서 오른쪽으로 놓는다.
// 데이터 원본의 긴 노드는 그룹 너비를 그대로 쓰고, 세 경로는 두 그룹 사이의 통로에서 갈라진다.
const wideNodes = [
  { id: 'web-app', x: 32, y: 36, width: 144 },
  { id: 'vm-1', x: 32, y: 92, width: 144 },
  { id: 'onprem', x: 16, y: 148, width: 176 },
  { id: 'metrics', x: 220, y: 64, width: 80 },
  { id: 'logs', x: 220, y: 148, width: 80 },
  { id: 'analyze', x: 328, y: 148, width: 104 },
  { id: 'alerts', x: 328, y: 64, width: 104 },
]
const widePaths: Record<string, string> = {
  'vm-to-metrics': 'M176 108 H196 V80 H220',
  'app-to-logs': 'M176 52 H196 V164 H220',
  'onprem-to-logs': 'M192 164 H220',
  'logs-to-analyze': 'M300 164 H328',
  'metrics-to-alerts': 'M300 80 H328',
}
const wideGroups = [
  { id: 'g-sources', x: 8, y: 8, width: 184, height: 224 },
  { id: 'g-monitor', x: 208, y: 8, width: 104, height: 224 },
]
const wideNotes = [
  { id: 'collect-note', x: 100, y: 220, anchor: 'middle' as const, scenario: 'collect' },
  { id: 'metrics-note', x: 379, y: 116, anchor: 'middle' as const, scenario: 'metrics' },
  { id: 'logs-note', x: 380, y: 220, anchor: 'middle' as const, scenario: 'logs' },
]

export const monitorDataScenarios: DiagramScenario[] = [
  { id: 'collect', nodes: ['web-app', 'vm-1', 'onprem', 'metrics', 'logs'], paths: ['vm-to-metrics', 'app-to-logs', 'onprem-to-logs'] },
  { id: 'metrics', nodes: ['vm-1', 'metrics', 'alerts'], paths: ['vm-to-metrics', 'metrics-to-alerts'] },
  { id: 'logs', nodes: ['web-app', 'logs', 'analyze'], paths: ['app-to-logs', 'logs-to-analyze'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MonitorDataDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-monitor-data-arrow`
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
      scenarios={monitorDataScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 336'}>
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
