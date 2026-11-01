import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-network-protection'].diagrams['firewall-hub']

// 가상 네트워크 둘을 위에, 방화벽을 둘 사이 아래에 둔다. VM에서 나온 트래픽은 그룹 라벨을 피해 방화벽의 옆 변으로 들어간다.
const groups = [
  { id: 'vnet-a', x: 8, y: 8, width: 124, height: 64 },
  { id: 'vnet-b', x: 148, y: 8, width: 124, height: 64 },
  { id: 'fw-vnet', x: 64, y: 88, width: 152, height: 72 },
]
const nodes = [
  { id: 'vm-1', x: 38, y: 30, width: 64 },
  { id: 'vm-2', x: 178, y: 30, width: 64 },
  { id: 'firewall', x: 84, y: 110, width: 112 },
  { id: 'internet', x: 100, y: 188, width: 80 },
]
const paths: Record<string, string> = {
  'a-to-fw': 'M60 62 V126 H84',
  'b-to-fw': 'M220 62 V126 H196',
  'fw-to-internet': 'M140 142 V188',
  'fw-to-b': 'M196 126 H220 V62',
}
const notes = [
  { id: 'outbound-note', x: 72, y: 176 },
  { id: 'between-note', x: 150, y: 84 },
]

// 가로형은 왼쪽의 가상 네트워크 둘 → 가운데 방화벽 → 오른쪽 인터넷으로 흐른다.
const wideGroups = [
  { id: 'vnet-a', x: 8, y: 8, width: 120, height: 64 },
  { id: 'vnet-b', x: 8, y: 88, width: 120, height: 64 },
  { id: 'fw-vnet', x: 168, y: 32, width: 152, height: 72 },
]
const wideNodes = [
  { id: 'vm-1', x: 36, y: 32, width: 64 },
  { id: 'vm-2', x: 36, y: 112, width: 64 },
  { id: 'firewall', x: 188, y: 56, width: 112 },
  { id: 'internet', x: 360, y: 56, width: 72 },
]
const widePaths: Record<string, string> = {
  'a-to-fw': 'M100 48 H144 V64 H188',
  'b-to-fw': 'M100 128 H144 V80 H188',
  'fw-to-internet': 'M300 72 H360',
  'fw-to-b': 'M188 80 H144 V128 H100',
}
const wideNotes = [
  { id: 'outbound-note', x: 244, y: 122 },
  { id: 'between-note', x: 244, y: 122 },
]
const scenarioNotes: Record<string, string[]> = { outbound: ['outbound-note'], between: ['between-note'] }

export const firewallHubScenarios: DiagramScenario[] = [
  { id: 'outbound', nodes: ['vm-1', 'vm-2', 'firewall', 'internet'], paths: ['a-to-fw', 'b-to-fw', 'fw-to-internet'] },
  { id: 'between', nodes: ['vm-1', 'firewall', 'vm-2'], paths: ['a-to-fw', 'fw-to-b'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FirewallHubDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-firewall-hub-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && scenarioNotes[active.id].includes(note.id))

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} scenarios={firewallHubScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 160' : '0 0 280 228'}>
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
