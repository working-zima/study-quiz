import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-monitoring'].diagrams['app-insights']

// 세로형은 실제 사용자와 가용성 테스트의 요청을 위에서 웹 앱으로 모으고, 앱이 부르는 대상과 모니터링 기능을 아래에서 가른다.
const nodes = [
  { id: 'user', x: 16, y: 16, width: 64 },
  { id: 'test', x: 152, y: 16, width: 112 },
  { id: 'web-app', x: 96, y: 80, width: 88 },
  { id: 'database', x: 16, y: 144, width: 88 },
  { id: 'app-insights', x: 120, y: 144, width: 144 },
]
const paths: Record<string, string> = {
  'user-to-app': 'M80 32 H112 V80',
  'test-to-app': 'M208 48 V64 H168 V80',
  'app-to-db': 'M120 112 V128 H60 V144',
  'app-to-ai': 'M160 112 V128 H192 V144',
}
const notes = [
  { id: 'requests-note', x: 140, y: 220, anchor: 'middle' as const, scenario: 'requests' },
  { id: 'dependency-note', x: 140, y: 220, anchor: 'middle' as const, scenario: 'dependency' },
  { id: 'availability-note', x: 140, y: 220, anchor: 'middle' as const, scenario: 'availability' },
]

// 가로형은 요청을 보내는 둘을 왼쪽에 쌓고 웹 앱에서 데이터베이스와 Application Insights로 갈라 놓는다.
const wideNodes = [
  { id: 'user', x: 8, y: 16, width: 64 },
  { id: 'test', x: 8, y: 88, width: 112 },
  { id: 'web-app', x: 152, y: 52, width: 88 },
  { id: 'database', x: 280, y: 16, width: 88 },
  { id: 'app-insights', x: 288, y: 88, width: 144 },
]
const widePaths: Record<string, string> = {
  'user-to-app': 'M72 32 H120 V68 H152',
  'test-to-app': 'M120 104 H136 V68 H152',
  'app-to-db': 'M240 68 H260 V32 H280',
  'app-to-ai': 'M240 68 H272 V104 H288',
}
const wideNotes = [
  { id: 'requests-note', x: 220, y: 146, anchor: 'middle' as const, scenario: 'requests' },
  { id: 'dependency-note', x: 220, y: 146, anchor: 'middle' as const, scenario: 'dependency' },
  { id: 'availability-note', x: 220, y: 146, anchor: 'middle' as const, scenario: 'availability' },
]

export const appInsightsScenarios: DiagramScenario[] = [
  { id: 'requests', nodes: ['user', 'web-app', 'app-insights'], paths: ['user-to-app', 'app-to-ai'] },
  { id: 'dependency', nodes: ['web-app', 'database', 'app-insights'], paths: ['app-to-db', 'app-to-ai'] },
  { id: 'availability', nodes: ['test', 'web-app', 'app-insights'], paths: ['test-to-app', 'app-to-ai'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AppInsightsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-app-insights-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} scenarios={appInsightsScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 228'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>
          {visiblePaths.map((id) => (
            <path key={id} data-path={id} d={layoutPaths[id]} className="fill-none stroke-title" strokeWidth="1.5" strokeLinejoin="round" markerEnd={`url(#${arrowId})`} />
          ))}
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={active && !active.nodes.includes(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">{text.nodes[node.id]}</text>
            </g>
          ))}
          {shownNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">{text.notes![note.id]}</text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
