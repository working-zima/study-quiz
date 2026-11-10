import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-monitoring'].diagrams['alert-rule']

// 세로형은 신호 둘을 위에 놓고 경고 규칙 → 작업 그룹 → 알림·자동화 순으로 내려간다.
const nodes = [
  { id: 'vm-1', x: 16, y: 16, width: 64 },
  { id: 'sh-event', x: 104, y: 16, width: 160 },
  { id: 'rule', x: 84, y: 80, width: 112 },
  { id: 'action-group', x: 84, y: 144, width: 112 },
  { id: 'email', x: 16, y: 208, width: 72 },
  { id: 'automation', x: 176, y: 208, width: 88 },
]
const paths: Record<string, string> = {
  'vm-to-rule': 'M48 48 V64 H112 V80',
  'sh-to-rule': 'M184 48 V64 H168 V80',
  'rule-to-group': 'M140 112 V144',
  'group-to-email': 'M112 176 V192 H52 V208',
  'group-to-automation': 'M168 176 V192 H220 V208',
}
const notes = [
  { id: 'metric-note', x: 140, y: 264, anchor: 'middle' as const, scenario: 'metric' },
  { id: 'service-note', x: 140, y: 264, anchor: 'middle' as const, scenario: 'service' },
  { id: 'automate-note', x: 140, y: 264, anchor: 'middle' as const, scenario: 'automate' },
]

// 가로형은 신호 → 규칙 → 작업 그룹을 가운데 줄에 두고, 작업 그룹의 결과를 오른쪽 위아래로 가른다.
const wideNodes = [
  { id: 'vm-1', x: 8, y: 16, width: 64 },
  { id: 'sh-event', x: 8, y: 88, width: 160 },
  { id: 'rule', x: 184, y: 52, width: 72 },
  { id: 'action-group', x: 272, y: 52, width: 80 },
  { id: 'email', x: 368, y: 16, width: 64 },
  { id: 'automation', x: 368, y: 88, width: 64 },
]
const widePaths: Record<string, string> = {
  'vm-to-rule': 'M72 32 H176 V68 H184',
  'sh-to-rule': 'M168 104 H176 V68 H184',
  'rule-to-group': 'M256 68 H272',
  'group-to-email': 'M352 68 H360 V32 H368',
  'group-to-automation': 'M352 68 H360 V104 H368',
}
const wideNotes = [
  { id: 'metric-note', x: 220, y: 146, anchor: 'middle' as const, scenario: 'metric' },
  { id: 'service-note', x: 220, y: 146, anchor: 'middle' as const, scenario: 'service' },
  { id: 'automate-note', x: 220, y: 146, anchor: 'middle' as const, scenario: 'automate' },
]

export const alertRuleScenarios: DiagramScenario[] = [
  { id: 'metric', nodes: ['vm-1', 'rule', 'action-group', 'email'], paths: ['vm-to-rule', 'rule-to-group', 'group-to-email'] },
  { id: 'service', nodes: ['sh-event', 'rule', 'action-group', 'email'], paths: ['sh-to-rule', 'rule-to-group', 'group-to-email'] },
  { id: 'automate', nodes: ['rule', 'action-group', 'automation'], paths: ['rule-to-group', 'group-to-automation'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AlertRuleDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-alert-rule-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} scenarios={alertRuleScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 152' : '0 0 280 272'}>
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
