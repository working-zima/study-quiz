import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-security-model'].diagrams['zero-trust']

// 세로형은 디바이스 둘을 위에, 요청 확인과 앱을 그 아래에 쌓는다. 믿고 바로 가는 길은 요청 확인의 왼쪽으로 돈다.
const groups = [
  { id: 'corp-network', x: 8, y: 8, width: 100, height: 66 },
]
const nodes = [
  { id: 'inside-device', x: 14, y: 34, width: 88 },
  { id: 'outside-device', x: 120, y: 34, width: 152 },
  { id: 'verify', x: 90, y: 120, width: 100 },
  { id: 'app', x: 90, y: 176, width: 100 },
]
const paths: Record<string, string> = {
  'trusted': 'M40 66 V192 H90',
  'to-verify-in': 'M98 66 V120',
  'to-verify-out': 'M170 66 V120',
  'verified': 'M140 152 V176',
}
const notes = [
  { id: 'perimeter-note', x: 46, y: 100, textAnchor: 'start' as const, scenario: 'perimeter' },
  { id: 'zero-trust-note', x: 148, y: 170, textAnchor: 'start' as const, scenario: 'zero-trust' },
  { id: 'high-risk-note', x: 196, y: 140, textAnchor: 'start' as const, scenario: 'high-risk' },
]

// 가로형은 디바이스 둘을 왼쪽에, 요청 확인과 앱을 오른쪽으로 잇는다. 믿고 바로 가는 길은 요청 확인의 위로 지나간다.
const wideGroups = [
  { id: 'corp-network', x: 8, y: 8, width: 120, height: 66 },
]
const wideNodes = [
  { id: 'inside-device', x: 20, y: 34, width: 96 },
  { id: 'outside-device', x: 8, y: 100, width: 152 },
  { id: 'verify', x: 190, y: 64, width: 96 },
  { id: 'app', x: 336, y: 64, width: 96 },
]
const widePaths: Record<string, string> = {
  'trusted': 'M116 40 H384 V64',
  'to-verify-in': 'M116 56 H238 V64',
  'to-verify-out': 'M160 116 H238 V96',
  'verified': 'M286 80 H336',
}
const wideNotes = [
  { id: 'perimeter-note', x: 250, y: 30, textAnchor: 'middle' as const, scenario: 'perimeter' },
  { id: 'zero-trust-note', x: 246, y: 120, textAnchor: 'start' as const, scenario: 'zero-trust' },
  { id: 'high-risk-note', x: 246, y: 120, textAnchor: 'start' as const, scenario: 'high-risk' },
]

export const zeroTrustScenarios: DiagramScenario[] = [
  { id: 'perimeter', nodes: ['inside-device', 'app'], paths: ['trusted'] },
  { id: 'zero-trust', nodes: ['inside-device', 'outside-device', 'verify', 'app'], paths: ['to-verify-in', 'to-verify-out', 'verified'] },
  { id: 'high-risk', nodes: ['outside-device', 'verify'], paths: ['to-verify-out'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ZeroTrustDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-zero-trust-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={zeroTrustScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 140' : '0 0 280 216'}>
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
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">
              {text.groups![group.id]}
            </text>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
