import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-management-tools'].diagrams['cloud-shell']

// 세로형은 웹 브라우저를 위에, Azure Cloud Shell 칸을 가운데에, 스토리지 계정을 아래에 둔다.
// Cloud Shell 칸 안에서 셸 둘을 왼쪽 열에, 미리 설치된 도구 칸을 오른쪽 열에 두고 같은 높이끼리 곧은 화살표로 잇는다.
// PowerShell에서 Azure CLI로 가는 화살표는 두 열 사이의 틈(x 120)으로 올라간다. Bash에서 Azure PowerShell로 가는 화살표는 없다.
const nodes = [
  { id: 'browser', x: 92, y: 8, width: 96 },
  { id: 'bash', x: 24, y: 104, width: 88 },
  { id: 'pwsh', x: 24, y: 160, width: 88 },
  { id: 'cli', x: 140, y: 104, width: 116 },
  { id: 'azps', x: 140, y: 160, width: 116 },
  { id: 'storage', x: 24, y: 252, width: 96 },
]
const paths: Record<string, string> = {
  'bash-cli': 'M112 120 H140',
  'pwsh-cli': 'M112 168 H120 V128 H140',
  'pwsh-azps': 'M112 176 H140',
}
const groups = [
  { id: 'g-cloud-shell', x: 8, y: 56, width: 264, height: 180 },
  { id: 'g-tools', x: 128, y: 80, width: 136, height: 128 },
]
const notes = [
  { id: 'bash-note', x: 140, y: 228, anchor: 'middle' as const, scenario: 'bash' },
  { id: 'pwsh-note', x: 140, y: 228, anchor: 'middle' as const, scenario: 'pwsh' },
  { id: 'storage-note', x: 132, y: 272, anchor: 'start' as const, scenario: 'files' },
]

// 가로형은 웹 브라우저와 스토리지 계정을 왼쪽 열에, Azure Cloud Shell 칸을 오른쪽에 둔다.
// 칸 안의 배치는 세로형과 같고, PowerShell에서 Azure CLI로 가는 화살표는 두 열 사이의 틈(x 240)으로 올라간다.
const wideNodes = [
  { id: 'browser', x: 8, y: 56, width: 96 },
  { id: 'bash', x: 136, y: 56, width: 88 },
  { id: 'pwsh', x: 136, y: 112, width: 88 },
  { id: 'cli', x: 272, y: 56, width: 128 },
  { id: 'azps', x: 272, y: 112, width: 128 },
  { id: 'storage', x: 8, y: 112, width: 96 },
]
const widePaths: Record<string, string> = {
  'bash-cli': 'M224 72 H272',
  'pwsh-cli': 'M224 120 H240 V80 H272',
  'pwsh-azps': 'M224 128 H272',
}
const wideGroups = [
  { id: 'g-cloud-shell', x: 120, y: 8, width: 312, height: 188 },
  { id: 'g-tools', x: 248, y: 32, width: 176, height: 128 },
]
const wideNotes = [
  { id: 'bash-note', x: 276, y: 184, anchor: 'middle' as const, scenario: 'bash' },
  { id: 'pwsh-note', x: 276, y: 184, anchor: 'middle' as const, scenario: 'pwsh' },
  { id: 'storage-note', x: 8, y: 164, anchor: 'start' as const, scenario: 'files' },
]

export const cloudShellScenarios: DiagramScenario[] = [
  { id: 'bash', nodes: ['browser', 'bash', 'cli'], paths: ['bash-cli'] },
  { id: 'pwsh', nodes: ['browser', 'pwsh', 'cli', 'azps'], paths: ['pwsh-cli', 'pwsh-azps'] },
  { id: 'files', nodes: ['browser', 'storage'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CloudShellDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-cloud-shell-arrow`
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
      scenarios={cloudShellScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 204' : '0 0 280 296'}>
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
