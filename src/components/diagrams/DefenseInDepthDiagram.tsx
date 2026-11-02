import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-security-model'].diagrams['defense-in-depth']

// 세로형은 계층 일곱을 바깥쪽부터 위에서 아래로 쌓고, 곁말을 상자 오른쪽에 둔다.
const nodes = [
  { id: 'physical', x: 24, y: 8, width: 120 },
  { id: 'identity', x: 24, y: 64, width: 120 },
  { id: 'perimeter', x: 24, y: 120, width: 120 },
  { id: 'network', x: 24, y: 176, width: 120 },
  { id: 'compute', x: 24, y: 232, width: 120 },
  { id: 'application', x: 24, y: 288, width: 120 },
  { id: 'data', x: 24, y: 344, width: 120 },
]
const paths: Record<string, string> = {
  'next-1': 'M84 40 V64',
  'next-2': 'M84 96 V120',
  'next-3': 'M84 152 V176',
  'next-4': 'M84 208 V232',
  'next-5': 'M84 264 V288',
  'next-6': 'M84 320 V344',
}
// owner가 있는 곁말은 늘 보이고 자기 노드의 opacity를 따른다(ADR-038). scenario가 있는 곁말은 그 장면에서만 보인다.
const notes = [
  { id: 'data-note', x: 152, y: 364, textAnchor: 'start' as const, owner: 'data' },
  { id: 'ddos-note', x: 152, y: 140, textAnchor: 'start' as const, scenario: 'ddos' },
  { id: 'identity-note', x: 152, y: 84, textAnchor: 'start' as const, scenario: 'identity' },
  { id: 'breached-note', x: 152, y: 196, textAnchor: 'start' as const, scenario: 'breach' },
  { id: 'next-layer-note', x: 152, y: 252, textAnchor: 'start' as const, scenario: 'breach' },
]

// 가로형은 일곱이 한 줄에 들지 않아 위 넷·아래 셋으로 접는다. 네트워크에서 컴퓨팅으로 가는 화살표가 두 줄 사이를 지나 왼쪽으로 돌아간다.
const wideNodes = [
  { id: 'physical', x: 8, y: 40, width: 88 },
  { id: 'identity', x: 120, y: 40, width: 88 },
  { id: 'perimeter', x: 232, y: 40, width: 88 },
  { id: 'network', x: 344, y: 40, width: 88 },
  { id: 'compute', x: 8, y: 104, width: 88 },
  { id: 'application', x: 120, y: 104, width: 88 },
  { id: 'data', x: 232, y: 104, width: 88 },
]
const widePaths: Record<string, string> = {
  'next-1': 'M96 56 H120',
  'next-2': 'M208 56 H232',
  'next-3': 'M320 56 H344',
  'next-4': 'M388 72 V88 H52 V104',
  'next-5': 'M96 120 H120',
  'next-6': 'M208 120 H232',
}
const wideNotes = [
  { id: 'data-note', x: 328, y: 124, textAnchor: 'start' as const, owner: 'data' },
  { id: 'ddos-note', x: 276, y: 30, textAnchor: 'middle' as const, scenario: 'ddos' },
  { id: 'identity-note', x: 164, y: 30, textAnchor: 'middle' as const, scenario: 'identity' },
  { id: 'breached-note', x: 388, y: 30, textAnchor: 'middle' as const, scenario: 'breach' },
  { id: 'next-layer-note', x: 52, y: 150, textAnchor: 'middle' as const, scenario: 'breach' },
]

// 경로 여섯은 계층의 순서라 어느 장면에서나 보인다. 장면이 가리키는 계층은 선명한 상자가 보인다.
const allPaths = ['next-1', 'next-2', 'next-3', 'next-4', 'next-5', 'next-6']

export const defenseInDepthScenarios: DiagramScenario[] = [
  { id: 'ddos', nodes: ['perimeter'], paths: allPaths },
  { id: 'identity', nodes: ['identity'], paths: allPaths },
  { id: 'breach', nodes: ['compute', 'application', 'data'], paths: allPaths },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DefenseInDepthDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-defense-in-depth-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const isDimmed = (nodeId: string) => active !== null && !active.nodes.includes(nodeId)
  const shownNotes = layoutNotes.filter((note) => note.owner !== undefined || (active !== null && note.scenario === active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={defenseInDepthScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 384'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {allPaths.map((id) => (
            <path key={id} data-path={id} d={layoutPaths[id]} className="fill-none stroke-title" strokeWidth="1.5" strokeLinejoin="round" markerEnd={`url(#${arrowId})`} />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={isDimmed(node.id) ? 0.25 : 1}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {shownNotes.map((note) => (
            <text
              key={note.id}
              data-note={note.id}
              x={note.x}
              y={note.y}
              textAnchor={note.textAnchor}
              opacity={note.owner === undefined ? undefined : isDimmed(note.owner) ? 0.25 : 1}
              className="fill-muted"
              fontSize="9"
            >
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
