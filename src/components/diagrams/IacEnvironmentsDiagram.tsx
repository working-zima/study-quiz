import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-infrastructure-as-code'].diagrams['iac-environments']

// 세로형은 손으로 설정하는 칸을 위에, 코드로 만드는 칸을 아래에 쌓는다. 칸마다 세 환경을 한 줄에 둔다.
// 코드 한 벌은 아래 칸의 가운데 위에 두고, 양옆 환경으로 가는 화살표는 코드 한 벌의 옆 변에서 나와 꺾여 내려간다.
const nodes = [
  { id: 'manual-dev', x: 12, y: 28, width: 78 },
  { id: 'manual-test', x: 101, y: 28, width: 78 },
  { id: 'manual-prod', x: 190, y: 28, width: 78 },
  { id: 'code', x: 104, y: 120, width: 72 },
  { id: 'code-dev', x: 12, y: 192, width: 78 },
  { id: 'code-test', x: 101, y: 192, width: 78 },
  { id: 'code-prod', x: 190, y: 192, width: 78 },
]
const paths: Record<string, string> = {
  'to-dev': 'M104 136 H51 V192',
  'to-test': 'M140 152 V192',
  'to-prod': 'M176 136 H229 V192',
}
const groups = [
  { id: 'g-manual', x: 4, y: 8, width: 272, height: 80 },
  { id: 'g-code', x: 4, y: 100, width: 272, height: 152 },
]
const notes = [
  { id: 'manual-note', x: 140, y: 78, anchor: 'middle' as const, scenario: 'manual' },
  { id: 'code-note', x: 140, y: 242, anchor: 'middle' as const, scenario: 'code' },
  { id: 'rebuild-note', x: 268, y: 242, anchor: 'end' as const, scenario: 'rebuild' },
]

// 가로형은 두 칸을 나란히 두고, 칸마다 세 환경을 세로로 쌓는다. 코드 한 벌은 오른쪽 칸의 왼쪽에 두고,
// 가운데 테스트 환경으로는 곧게, 위아래 환경으로는 코드 한 벌의 위·아래 변에서 나와 꺾여 들어간다.
const wideNodes = [
  { id: 'manual-dev', x: 73, y: 32, width: 78 },
  { id: 'manual-test', x: 73, y: 72, width: 78 },
  { id: 'manual-prod', x: 73, y: 112, width: 78 },
  { id: 'code', x: 240, y: 72, width: 72 },
  { id: 'code-dev', x: 340, y: 32, width: 78 },
  { id: 'code-test', x: 340, y: 72, width: 78 },
  { id: 'code-prod', x: 340, y: 112, width: 78 },
]
const widePaths: Record<string, string> = {
  'to-dev': 'M276 72 V48 H340',
  'to-test': 'M312 88 H340',
  'to-prod': 'M276 104 V128 H340',
}
const wideGroups = [
  { id: 'g-manual', x: 8, y: 8, width: 208, height: 164 },
  { id: 'g-code', x: 224, y: 8, width: 208, height: 164 },
]
const wideNotes = [
  { id: 'manual-note', x: 112, y: 164, anchor: 'middle' as const, scenario: 'manual' },
  { id: 'code-note', x: 328, y: 164, anchor: 'middle' as const, scenario: 'code' },
  { id: 'rebuild-note', x: 418, y: 164, anchor: 'end' as const, scenario: 'rebuild' },
]

export const iacEnvironmentsScenarios: DiagramScenario[] = [
  { id: 'manual', nodes: ['manual-dev', 'manual-test', 'manual-prod'], paths: [] },
  { id: 'code', nodes: ['code', 'code-dev', 'code-test', 'code-prod'], paths: ['to-dev', 'to-test', 'to-prod'] },
  { id: 'rebuild', nodes: ['code', 'code-prod'], paths: ['to-prod'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function IacEnvironmentsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-iac-environments-arrow`
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
      scenarios={iacEnvironmentsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 260'}>
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
