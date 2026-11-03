import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cost-management'].diagrams['free-account-offers']

// 세로형은 무료 계정 상자 안에 세 가지를 쌓고, 오른쪽 밖에 업그레이드와 종량제 요금을 둔다.
const nodes = [
  { id: 'credit', x: 16, y: 28, width: 132 },
  { id: 'free-12', x: 16, y: 70, width: 132 },
  { id: 'always-free', x: 16, y: 112, width: 132 },
  { id: 'upgrade', x: 172, y: 28, width: 100 },
  { id: 'pay-as-you-go', x: 172, y: 160, width: 100 },
]
const paths: Record<string, string> = {
  'keep-12': 'M172 44 H160 V86 H148',
  'keep-always': 'M190 60 V128 H148',
  'to-payg': 'M148 86 H164 V176 H172',
}
const groups = [
  { id: 'free-account', x: 8, y: 8, width: 148, height: 144 },
]
const notes = [
  { id: 'stopped-note', x: 8, y: 176, anchor: 'start' as const, scenario: 'after-30' },
  { id: 'upgrade-note', x: 8, y: 176, anchor: 'start' as const, scenario: 'upgrade' },
  { id: 'after-12-note', x: 8, y: 176, anchor: 'start' as const, scenario: 'after-12' },
]

// 가로형은 무료 계정 상자 안에 세 가지를 나란히 두고, 그 아래에 종량제 요금과 업그레이드를 둔다.
const wideNodes = [
  { id: 'credit', x: 20, y: 28, width: 116 },
  { id: 'free-12', x: 152, y: 28, width: 128 },
  { id: 'always-free', x: 296, y: 28, width: 124 },
  { id: 'upgrade', x: 296, y: 100, width: 124 },
  { id: 'pay-as-you-go', x: 20, y: 100, width: 116 },
]
const widePaths: Record<string, string> = {
  'keep-12': 'M296 116 H216 V60',
  'keep-always': 'M358 100 V60',
  'to-payg': 'M176 60 V116 H136',
}
const wideGroups = [
  { id: 'free-account', x: 8, y: 8, width: 424, height: 64 },
]
const wideNotes = [
  { id: 'stopped-note', x: 220, y: 150, anchor: 'middle' as const, scenario: 'after-30' },
  { id: 'upgrade-note', x: 220, y: 150, anchor: 'middle' as const, scenario: 'upgrade' },
  { id: 'after-12-note', x: 220, y: 150, anchor: 'middle' as const, scenario: 'after-12' },
]

export const freeAccountOffersScenarios: DiagramScenario[] = [
  { id: 'start', nodes: ['credit', 'free-12', 'always-free'], paths: [] },
  { id: 'after-30', nodes: [], paths: [] },
  { id: 'upgrade', nodes: ['upgrade', 'free-12', 'always-free'], paths: ['keep-12', 'keep-always'] },
  { id: 'after-12', nodes: ['always-free', 'pay-as-you-go'], paths: ['to-payg'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FreeAccountOffersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-free-account-offers-arrow`
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
      scenarios={freeAccountOffersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 158' : '0 0 280 200'}>
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
