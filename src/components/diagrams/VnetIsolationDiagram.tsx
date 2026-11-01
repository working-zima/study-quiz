import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-virtual-networking'].diagrams['vnet-isolation']

// 세로형은 가상 네트워크와 그 안의 서브넷을 위아래로 배치한다.
const groups = [
  { id: 'vnet-a', x: 8, y: 8, width: 264, height: 224 },
  { id: 'subnet-web', x: 20, y: 36, width: 240, height: 68 },
  { id: 'subnet-db', x: 20, y: 150, width: 240, height: 68 },
  { id: 'vnet-b', x: 8, y: 248, width: 264, height: 100 },
]
const nodes = [
  { id: 'vm-1', x: 32, y: 60, width: 96 },
  { id: 'vm-2', x: 32, y: 174, width: 96 },
  { id: 'vm-3', x: 32, y: 276, width: 96 },
]
// 아래 서브넷의 이름을 가로지르지 않도록 오른쪽 통로를 지난다.
const paths: Record<string, string> = {
  'same-vnet': 'M128 76 H248 V190 H128',
}
const notes = [
  { id: 'same-note', x: 132, y: 130 },
  { id: 'other-note', x: 140, y: 332 },
]

// 가로형은 A 안의 서브넷 둘을 나란히 놓아 요청 경로를 곧게 잇는다.
const wideGroups = [
  { id: 'vnet-a', x: 8, y: 8, width: 424, height: 140 },
  { id: 'subnet-web', x: 20, y: 36, width: 192, height: 68 },
  { id: 'subnet-db', x: 228, y: 36, width: 192, height: 68 },
  { id: 'vnet-b', x: 8, y: 164, width: 424, height: 80 },
]
const wideNodes = [
  { id: 'vm-1', x: 32, y: 60, width: 96 },
  { id: 'vm-2', x: 240, y: 60, width: 96 },
  { id: 'vm-3', x: 20, y: 192, width: 80 },
]
const widePaths: Record<string, string> = {
  'same-vnet': 'M128 76 H240',
}
const wideNotes = [
  { id: 'same-note', x: 220, y: 128 },
  { id: 'other-note', x: 264, y: 212 },
]
const scenarioNote: Record<string, string> = { same: 'same-note', other: 'other-note' }
export const vnetIsolationScenarios: DiagramScenario[] = [
  { id: 'same', nodes: ['vm-1', 'vm-2'], paths: ['same-vnet'] },
  { id: 'other', nodes: ['vm-1', 'vm-3'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function VnetIsolationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-vnet-isolation-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && scenarioNote[active.id] === note.id)

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} scenarios={vnetIsolationScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 252' : '0 0 280 356'}>
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
