import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-network-protection'].diagrams['nsg-rule-order']

// 규칙은 우선순위 순서대로 위에서 아래로 놓는다. 허용된 요청은 기본 규칙을 거치지 않도록 NSG 상자 바깥을 돌아 VM 1에 닿는다.
const groups = [
  { id: 'nsg', x: 20, y: 56, width: 240, height: 160 },
]
const nodes = [
  { id: 'web-req', x: 20, y: 8, width: 112 },
  { id: 'other-req', x: 148, y: 8, width: 112 },
  { id: 'rule-100', x: 52, y: 80, width: 176 },
  { id: 'rule-default', x: 52, y: 160, width: 176 },
  { id: 'vm-1', x: 188, y: 232, width: 64 },
]
const paths: Record<string, string> = {
  'web-to-100': 'M76 40 V80',
  'allow-to-vm': 'M228 96 H268 V248 H252',
  'other-to-100': 'M204 40 V80',
  'next-to-default': 'M200 112 V160',
}
const notes = [
  { id: 'match-note', x: 96, y: 134 },
  { id: 'pass-note', x: 96, y: 134 },
  { id: 'default-note', x: 140, y: 208 },
]

// 가로형은 요청 → 규칙 → VM 1로 흐른다. 규칙끼리는 세로형과 같이 위에서 아래로 살핀다.
const wideGroups = [
  { id: 'nsg', x: 136, y: 8, width: 200, height: 168 },
]
const wideNodes = [
  { id: 'web-req', x: 8, y: 24, width: 112 },
  { id: 'other-req', x: 8, y: 72, width: 112 },
  { id: 'rule-100', x: 148, y: 40, width: 176 },
  { id: 'rule-default', x: 148, y: 118, width: 176 },
  { id: 'vm-1', x: 364, y: 40, width: 68 },
]
const widePaths: Record<string, string> = {
  'web-to-100': 'M120 48 H148',
  'allow-to-vm': 'M324 56 H364',
  'other-to-100': 'M120 88 H134 V64 H148',
  'next-to-default': 'M290 72 V118',
}
const wideNotes = [
  { id: 'match-note', x: 216, y: 98 },
  { id: 'pass-note', x: 216, y: 98 },
  { id: 'default-note', x: 236, y: 166 },
]
const scenarioNotes: Record<string, string[]> = { match: ['match-note'], 'no-match': ['pass-note', 'default-note'] }

export const nsgRuleOrderScenarios: DiagramScenario[] = [
  { id: 'match', nodes: ['web-req', 'rule-100', 'vm-1'], paths: ['web-to-100', 'allow-to-vm'] },
  { id: 'no-match', nodes: ['other-req', 'rule-100', 'rule-default'], paths: ['other-to-100', 'next-to-default'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NsgRuleOrderDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-nsg-rule-order-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && scenarioNotes[active.id].includes(note.id))

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} scenarios={nsgRuleOrderScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 184' : '0 0 280 272'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>
          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />)}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">{text.groups![group.id]}</text>
          ))}
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">{text.notes![note.id]}</text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
