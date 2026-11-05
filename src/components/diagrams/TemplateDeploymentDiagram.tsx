import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-infrastructure-as-code'].diagrams['template-deployment']

// 세로형은 위에서 아래로 ARM 템플릿 → Azure Resource Manager → 리소스를 놓는다. 가상 네트워크 1 아래에 VM 1을 세로로 두어
// 만드는 순서(then-vm)가 곧게 내려가게 하고, 스토리지 계정 1은 오른쪽에 따로 둔다 — Azure Resource Manager에서 바로 만든다.
const nodes = [
  { id: 'template', x: 98, y: 16, width: 84 },
  { id: 'arm', x: 64, y: 88, width: 152 },
  { id: 'vnet-1', x: 24, y: 160, width: 104 },
  { id: 'storage-1', x: 156, y: 160, width: 104 },
  { id: 'vm-1', x: 44, y: 248, width: 64 },
]
const paths: Record<string, string> = {
  'submit': 'M140 48 V88',
  'create-vnet': 'M76 120 V160',
  'then-vm': 'M76 192 V248',
  'create-storage': 'M208 120 V160',
}
const notes = [
  { id: 'validate-note', x: 148, y: 72, anchor: 'start' as const, scenarios: ['validate'] },
  { id: 'vnet-note', x: 84, y: 232, anchor: 'start' as const, scenarios: ['order'] },
  { id: 'storage-note', x: 156, y: 210, anchor: 'start' as const, scenarios: ['order'] },
  { id: 'redeploy-note', x: 148, y: 72, anchor: 'start' as const, scenarios: ['redeploy'] },
]

// 가로형은 왼쪽에서 오른쪽으로 ARM 템플릿 → Azure Resource Manager → 리소스를 놓는다. 오른쪽 열 위에 가상 네트워크 1, 그 아래 VM 1,
// 맨 아래 스토리지 계정 1을 두고, Azure Resource Manager의 오른쪽 변에서 나온 두 경로가 x 292에서 위아래로 갈라진다.
const wideNodes = [
  { id: 'template', x: 8, y: 72, width: 84 },
  { id: 'arm', x: 120, y: 72, width: 152 },
  { id: 'vnet-1', x: 312, y: 24, width: 104 },
  { id: 'vm-1', x: 332, y: 96, width: 64 },
  { id: 'storage-1', x: 312, y: 160, width: 104 },
]
const widePaths: Record<string, string> = {
  'submit': 'M92 88 H120',
  'create-vnet': 'M272 80 H292 V40 H312',
  'then-vm': 'M364 56 V96',
  'create-storage': 'M272 96 H292 V176 H312',
}
const wideNotes = [
  { id: 'validate-note', x: 106, y: 64, anchor: 'middle' as const, scenarios: ['validate'] },
  { id: 'vnet-note', x: 312, y: 148, anchor: 'start' as const, scenarios: ['order'] },
  { id: 'storage-note', x: 312, y: 212, anchor: 'start' as const, scenarios: ['order'] },
  { id: 'redeploy-note', x: 106, y: 64, anchor: 'middle' as const, scenarios: ['redeploy'] },
]

export const templateDeploymentScenarios: DiagramScenario[] = [
  { id: 'validate', nodes: ['template', 'arm'], paths: ['submit'] },
  { id: 'order', nodes: ['arm', 'vnet-1', 'vm-1', 'storage-1'], paths: ['create-vnet', 'then-vm', 'create-storage'] },
  { id: 'redeploy', nodes: ['template', 'arm', 'vnet-1', 'vm-1', 'storage-1'], paths: ['submit'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TemplateDeploymentDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-template-deployment-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={templateDeploymentScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 220' : '0 0 280 288'}>
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
