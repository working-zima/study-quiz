import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-virtual-networking'].diagrams['site-to-site-vpn']

// 세로형은 온-프레미스 쪽을 위에, 가상 네트워크를 그 아래에 둔다. 로컬 네트워크 게이트웨이는 두 네트워크 박스 밖 맨 아래다.
// 터널은 게이트웨이 서브넷 라벨을 피해 VPN 게이트웨이의 라벨 오른쪽(x 124)으로 들어온다.
const groups = [
  { id: 'onprem', x: 8, y: 8, width: 180, height: 64 },
  { id: 'vnet', x: 8, y: 100, width: 264, height: 140 },
  { id: 'gateway-subnet', x: 20, y: 120, width: 166, height: 64 },
]
const nodes = [
  { id: 'vpn-device', x: 20, y: 30, width: 156 },
  { id: 'laptop', x: 196, y: 30, width: 76 },
  { id: 'vpn-gw', x: 74, y: 142, width: 100 },
  { id: 'vm-1', x: 84, y: 196, width: 80 },
  { id: 'lng', x: 62, y: 252, width: 156 },
]
const paths: Record<string, string> = {
  's2s-tunnel': 'M124 62 V142',
  'p2s-tunnel': 'M234 62 V158 H174',
  'gw-to-vm': 'M124 174 V196',
}
const notes = [
  { id: 's2s-note', x: 194, y: 88 },
  { id: 'lng-note', x: 140, y: 298 },
  { id: 'laptop-note', x: 176, y: 88 },
]

// 가로형은 왼쪽의 온-프레미스 쪽에서 오른쪽의 가상 네트워크로 흐른다.
const wideGroups = [
  { id: 'onprem', x: 8, y: 24, width: 180, height: 64 },
  { id: 'vnet', x: 300, y: 8, width: 132, height: 140 },
  { id: 'gateway-subnet', x: 308, y: 28, width: 116, height: 64 },
]
const wideNodes = [
  { id: 'vpn-device', x: 20, y: 46, width: 156 },
  { id: 'laptop', x: 40, y: 112, width: 76 },
  { id: 'vpn-gw', x: 316, y: 50, width: 100 },
  { id: 'vm-1', x: 344, y: 104, width: 80 },
  { id: 'lng', x: 130, y: 144, width: 156 },
]
const widePaths: Record<string, string> = {
  's2s-tunnel': 'M176 66 H316',
  'p2s-tunnel': 'M116 128 H330 V82',
  'gw-to-vm': 'M384 82 V104',
}
const wideNotes = [
  { id: 's2s-note', x: 232, y: 100 },
  { id: 'lng-note', x: 208, y: 190 },
  { id: 'laptop-note', x: 200, y: 120 },
]
const scenarioNotes: Record<string, string[]> = {
  'site-to-site': ['s2s-note', 'lng-note'],
  'point-to-site': ['laptop-note'],
}
export const siteToSiteVpnScenarios: DiagramScenario[] = [
  { id: 'site-to-site', nodes: ['vpn-device', 'lng', 'vpn-gw', 'vm-1'], paths: ['s2s-tunnel', 'gw-to-vm'] },
  { id: 'point-to-site', nodes: ['laptop', 'vpn-gw', 'vm-1'], paths: ['p2s-tunnel', 'gw-to-vm'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SiteToSiteVpnDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-site-to-site-vpn-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && scenarioNotes[active.id].includes(note.id))

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} scenarios={siteToSiteVpnScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 308'}>
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
