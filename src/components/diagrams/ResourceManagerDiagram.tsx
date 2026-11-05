import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-infrastructure-as-code'].diagrams['resource-manager']

// 세로형은 요청을 보내는 곳 넷을 두 줄로 놓는다. 윗줄(Azure 포털·Azure CLI)은 가운데에, 아랫줄(Azure PowerShell·REST API)은 양 끝에 두어,
// 윗줄의 화살표가 아랫줄 두 상자 사이의 틈(x 124~196)으로 내려가 Azure Resource Manager에 닿는다. 그 아래에 VM 1을 둔다.
const nodes = [
  { id: 'portal', x: 60, y: 16, width: 76 },
  { id: 'cli', x: 148, y: 16, width: 76 },
  { id: 'powershell', x: 8, y: 64, width: 116 },
  { id: 'rest', x: 196, y: 64, width: 76 },
  { id: 'arm', x: 64, y: 136, width: 152 },
  { id: 'vm-1', x: 108, y: 208, width: 64 },
]
const paths: Record<string, string> = {
  'portal-to-arm': 'M132 48 V136',
  'cli-to-arm': 'M160 48 V136',
  'ps-to-arm': 'M96 96 V136',
  'rest-to-arm': 'M204 96 V136',
  'arm-to-vm': 'M140 168 V208',
}
const notes = [
  { id: 'auth-note', x: 148, y: 192, anchor: 'start' as const, scenarios: ['portal'] },
  { id: 'same-note', x: 180, y: 228, anchor: 'start' as const, scenarios: ['cli', 'rest'] },
  { id: 'denied-note', x: 148, y: 192, anchor: 'start' as const, scenarios: ['denied'] },
]

// 가로형은 요청을 보내는 곳 넷을 위 한 줄에 놓고, 그 아래 가운데에 Azure Resource Manager, 맨 아래에 VM 1을 둔다.
// 양 끝(Azure 포털·REST API)의 화살표는 내려온 뒤 Azure Resource Manager의 옆 변으로 들어간다.
const wideNodes = [
  { id: 'portal', x: 24, y: 16, width: 76 },
  { id: 'cli', x: 116, y: 16, width: 76 },
  { id: 'powershell', x: 208, y: 16, width: 116 },
  { id: 'rest', x: 340, y: 16, width: 76 },
  { id: 'arm', x: 144, y: 96, width: 152 },
  { id: 'vm-1', x: 188, y: 176, width: 64 },
]
const widePaths: Record<string, string> = {
  'portal-to-arm': 'M62 48 V112 H144',
  'cli-to-arm': 'M154 48 V96',
  'ps-to-arm': 'M266 48 V96',
  'rest-to-arm': 'M378 48 V112 H296',
  'arm-to-vm': 'M220 128 V176',
}
const wideNotes = [
  { id: 'auth-note', x: 228, y: 152, anchor: 'start' as const, scenarios: ['portal'] },
  { id: 'same-note', x: 260, y: 196, anchor: 'start' as const, scenarios: ['cli', 'rest'] },
  { id: 'denied-note', x: 228, y: 152, anchor: 'start' as const, scenarios: ['denied'] },
]

export const resourceManagerScenarios: DiagramScenario[] = [
  { id: 'portal', nodes: ['portal', 'arm', 'vm-1'], paths: ['portal-to-arm', 'arm-to-vm'] },
  { id: 'cli', nodes: ['cli', 'arm', 'vm-1'], paths: ['cli-to-arm', 'arm-to-vm'] },
  { id: 'rest', nodes: ['rest', 'arm', 'vm-1'], paths: ['rest-to-arm', 'arm-to-vm'] },
  { id: 'denied', nodes: ['powershell', 'arm'], paths: ['ps-to-arm'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ResourceManagerDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-resource-manager-arrow`
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
      scenarios={resourceManagerScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 248'}>
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
