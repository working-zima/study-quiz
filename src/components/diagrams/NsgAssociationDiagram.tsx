import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-network-protection'].diagrams['nsg-association']

// 세로형은 서브넷 둘을 위아래로 쌓는다. NSG A는 웹 서브넷 상자 안의 위치로 「그 서브넷에 연결」을 보인다.
const groups = [
  { id: 'vnet', x: 8, y: 8, width: 264, height: 256 },
  { id: 'subnet-web', x: 20, y: 36, width: 240, height: 88 },
  { id: 'subnet-db', x: 20, y: 136, width: 240, height: 116 },
]
const nodes = [
  { id: 'nsg-a', x: 32, y: 60, width: 64 },
  { id: 'vm-1', x: 108, y: 60, width: 64 },
  { id: 'vm-2', x: 184, y: 60, width: 64 },
  { id: 'vm-3', x: 32, y: 160, width: 64 },
  { id: 'nic-3', x: 112, y: 160, width: 124 },
  { id: 'nsg-b', x: 144, y: 208, width: 60 },
]
// 통신 방향이 아니라 연결 관계다. 화살표 없이 모든 시나리오에서 유지한다.
const paths: Record<string, string> = {
  'link-nic': 'M96 176 H112',
  'link-nsg-b': 'M174 192 V208',
}
const notes = [
  { id: 'subnet-note', x: 140, y: 112 },
  { id: 'nic-note', x: 88, y: 228 },
]

// 가로형은 서브넷 둘을 나란히 두고, NSG를 그 서브넷의 VM 위에 놓는다.
const wideGroups = [
  { id: 'vnet', x: 8, y: 8, width: 424, height: 172 },
  { id: 'subnet-web', x: 20, y: 36, width: 172, height: 132 },
  { id: 'subnet-db', x: 204, y: 36, width: 216, height: 132 },
]
const wideNodes = [
  { id: 'nsg-a', x: 72, y: 60, width: 68 },
  { id: 'vm-1', x: 32, y: 108, width: 68 },
  { id: 'vm-2', x: 112, y: 108, width: 68 },
  { id: 'vm-3', x: 216, y: 108, width: 56 },
  { id: 'nic-3', x: 284, y: 108, width: 124 },
  { id: 'nsg-b', x: 316, y: 60, width: 60 },
]
const widePaths: Record<string, string> = {
  'link-nic': 'M272 124 H284',
  'link-nsg-b': 'M346 108 V92',
}
const wideNotes = [
  { id: 'subnet-note', x: 106, y: 156 },
  { id: 'nic-note', x: 262, y: 80 },
]
const scenarioNote: Record<string, string> = { subnet: 'subnet-note', nic: 'nic-note' }

export const nsgAssociationScenarios: DiagramScenario[] = [
  { id: 'subnet', nodes: ['nsg-a', 'vm-1', 'vm-2'], paths: [] },
  { id: 'nic', nodes: ['nsg-b', 'nic-3', 'vm-3'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NsgAssociationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && scenarioNote[active.id] === note.id)

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} scenarios={nsgAssociationScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 188' : '0 0 280 272'}>
          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />)}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.x + 10} y={group.y + 14} className="fill-muted" fontSize="9">{text.groups![group.id]}</text>
          ))}
          <g className="fill-none stroke-disabled" strokeWidth="1.5">
            {Object.entries(layoutPaths).map(([id, d]) => <path key={id} data-link={id} d={d} />)}
          </g>
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
