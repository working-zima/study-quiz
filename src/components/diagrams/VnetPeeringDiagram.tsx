import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-virtual-networking'].diagrams['vnet-peering']

// 세로형은 지역 둘을 위아래로 쌓고 그 사이에 백본을 넓게 둔다.
const groups = [
  { id: 'region-a', x: 8, y: 8, width: 264, height: 104 },
  { id: 'vnet-a', x: 20, y: 32, width: 116, height: 68 },
  { id: 'vnet-b', x: 144, y: 32, width: 116, height: 68 },
  { id: 'region-b', x: 8, y: 180, width: 140, height: 104 },
  { id: 'vnet-c', x: 20, y: 204, width: 116, height: 68 },
]
const nodes = [
  { id: 'vm-1', x: 42, y: 56, width: 72 },
  { id: 'vm-2', x: 166, y: 56, width: 72 },
  { id: 'backbone', x: 20, y: 128, width: 240 },
  { id: 'vm-3', x: 42, y: 228, width: 72 },
  { id: 'internet', x: 164, y: 204, width: 88 },
]
// 가상 네트워크 C의 이름을 가로지르지 않도록 VM 3의 오른쪽 변으로 들어간다.
const paths: Record<string, string> = {
  'a-to-backbone': 'M78 88 V128',
  'backbone-to-b': 'M202 128 V88',
  'backbone-to-c': 'M124 160 V244 H114',
}
const notes = [
  { id: 'regional-note', x: 208, y: 250 },
  { id: 'global-note', x: 172, y: 174 },
]

// 가로형은 지역 둘을 나란히 두고 백본을 그 아래 전체 폭으로 둔다.
const wideGroups = [
  { id: 'region-a', x: 8, y: 8, width: 260, height: 104 },
  { id: 'vnet-a', x: 20, y: 32, width: 116, height: 68 },
  { id: 'vnet-b', x: 144, y: 32, width: 116, height: 68 },
  { id: 'region-b', x: 284, y: 8, width: 148, height: 104 },
  { id: 'vnet-c', x: 296, y: 32, width: 124, height: 68 },
]
const wideNodes = [
  { id: 'vm-1', x: 42, y: 56, width: 72 },
  { id: 'vm-2', x: 166, y: 56, width: 72 },
  { id: 'vm-3', x: 322, y: 56, width: 72 },
  { id: 'backbone', x: 20, y: 128, width: 400 },
  { id: 'internet', x: 178, y: 176, width: 84 },
]
const widePaths: Record<string, string> = {
  'a-to-backbone': 'M78 88 V128',
  'backbone-to-b': 'M202 128 V88',
  'backbone-to-c': 'M358 128 V88',
}
const wideNotes = [
  { id: 'regional-note', x: 304, y: 196 },
  { id: 'global-note', x: 398, y: 124 },
]
const scenarioNote: Record<string, string> = { regional: 'regional-note', global: 'global-note' }
export const vnetPeeringScenarios: DiagramScenario[] = [
  { id: 'regional', nodes: ['vm-1', 'backbone', 'vm-2'], paths: ['a-to-backbone', 'backbone-to-b'] },
  { id: 'global', nodes: ['vm-1', 'backbone', 'vm-3'], paths: ['a-to-backbone', 'backbone-to-c'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VnetPeeringDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-vnet-peering-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && scenarioNote[active.id] === note.id)

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} scenarios={vnetPeeringScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 220' : '0 0 280 292'}>
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
