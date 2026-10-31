import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-virtual-networking'].diagrams.expressroute

// 세로형은 온-프레미스 네트워크에서 두 길이 갈라진다 — 아래로 연결 공급자, 오른쪽으로 공용 인터넷. 두 길 모두 맨 아래의 Microsoft 클라우드에 닿는다.
// 연결 공급자의 두 경로는 그룹 라벨을 피해 그 오른쪽(x 122·136)으로 내려간다.
const groups = [
  { id: 'microsoft', x: 8, y: 112, width: 264, height: 68 },
]
const nodes = [
  { id: 'onprem', x: 8, y: 8, width: 140 },
  { id: 'internet', x: 180, y: 8, width: 92 },
  { id: 'provider', x: 8, y: 64, width: 132 },
  { id: 'm365', x: 18, y: 140, width: 96 },
  { id: 'vnet', x: 130, y: 140, width: 138 },
]
const paths: Record<string, string> = {
  'er-in': 'M74 40 V64',
  'er-vnet': 'M136 96 V140',
  'er-m365': 'M122 96 V156 H114',
  'vpn-in': 'M148 24 H180',
  'vpn-vnet': 'M226 40 V140',
}
const notes = [
  { id: 'er-note', x: 212, y: 83 },
  { id: 'vpn-note', x: 168, y: 58 },
]

// 가로형은 왼쪽의 온-프레미스 네트워크에서 오른쪽의 Microsoft 클라우드로 흐른다. 연결 공급자가 위 길, 공용 인터넷이 아래 길이다.
const wideGroups = [
  { id: 'microsoft', x: 278, y: 8, width: 154, height: 116 },
]
const wideNodes = [
  { id: 'onprem', x: 8, y: 72, width: 132 },
  { id: 'provider', x: 170, y: 32, width: 80 },
  { id: 'internet', x: 170, y: 120, width: 80 },
  { id: 'm365', x: 286, y: 32, width: 110 },
  { id: 'vnet', x: 286, y: 84, width: 138 },
]
const widePaths: Record<string, string> = {
  'er-in': 'M74 72 V48 H170',
  'er-vnet': 'M250 56 H268 V96 H286',
  'er-m365': 'M250 44 H286',
  'vpn-in': 'M74 104 V136 H170',
  'vpn-vnet': 'M250 136 H272 V108 H286',
}
const wideNotes = [
  { id: 'er-note', x: 210, y: 26 },
  { id: 'vpn-note', x: 210, y: 170 },
]
const scenarioNotes: Record<string, string[]> = {
  expressroute: ['er-note'],
  vpn: ['vpn-note'],
}
export const expressRouteScenarios: DiagramScenario[] = [
  { id: 'expressroute', nodes: ['onprem', 'provider', 'vnet', 'm365'], paths: ['er-in', 'er-vnet', 'er-m365'] },
  { id: 'vpn', nodes: ['onprem', 'internet', 'vnet'], paths: ['vpn-in', 'vpn-vnet'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function ExpressRouteDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-expressroute-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && scenarioNotes[active.id].includes(note.id))

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} scenarios={expressRouteScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 188'}>
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
