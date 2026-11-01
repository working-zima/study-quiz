import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-network-protection'].diagrams['ddos-protection']

// 트래픽은 위에서 내려와 DDoS Protection을 지난다. 공격 트래픽의 화살표는 DDoS Protection에서 끝나고, 공용 IP 주소로 바로 가는 경로는 없다.
const groups = [
  { id: 'vnet', x: 32, y: 148, width: 216, height: 64 },
]
const nodes = [
  { id: 'users', x: 20, y: 8, width: 104 },
  { id: 'attack', x: 156, y: 8, width: 104 },
  { id: 'ddos', x: 70, y: 80, width: 140 },
  { id: 'public-ip', x: 44, y: 172, width: 104 },
  { id: 'vm-1', x: 176, y: 172, width: 60 },
]
const paths: Record<string, string> = {
  'users-in': 'M80 40 V80',
  'pass': 'M120 112 V172',
  'attack-in': 'M200 40 V80',
  'link-ip': 'M148 188 H176',
}
const notes = [
  { id: 'watch-note', x: 190, y: 134 },
  { id: 'filter-note', x: 236, y: 64 },
  { id: 'pass-note', x: 190, y: 134 },
]

// 가로형은 왼쪽의 트래픽 둘 → 가운데 DDoS Protection → 오른쪽 가상 네트워크로 흐른다.
const wideGroups = [
  { id: 'vnet', x: 304, y: 8, width: 128, height: 128 },
]
const wideNodes = [
  { id: 'users', x: 8, y: 16, width: 104 },
  { id: 'attack', x: 8, y: 88, width: 104 },
  { id: 'ddos', x: 156, y: 40, width: 120 },
  { id: 'public-ip', x: 316, y: 32, width: 104 },
  { id: 'vm-1', x: 336, y: 96, width: 64 },
]
const widePaths: Record<string, string> = {
  'users-in': 'M112 32 H134 V48 H156',
  'pass': 'M276 56 H316',
  'attack-in': 'M112 104 H134 V64 H156',
  'link-ip': 'M368 64 V96',
}
const wideNotes = [
  { id: 'watch-note', x: 216, y: 92 },
  { id: 'filter-note', x: 134, y: 124 },
  { id: 'pass-note', x: 216, y: 92 },
]
const scenarioNotes: Record<string, string[]> = { normal: ['watch-note'], attack: ['filter-note', 'pass-note'] }

export const ddosProtectionScenarios: DiagramScenario[] = [
  { id: 'normal', nodes: ['users', 'ddos', 'public-ip', 'vm-1'], paths: ['users-in', 'pass'] },
  { id: 'attack', nodes: ['users', 'attack', 'ddos', 'public-ip', 'vm-1'], paths: ['users-in', 'attack-in', 'pass'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DdosProtectionDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ddos-protection-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && scenarioNotes[active.id].includes(note.id))

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} scenarios={ddosProtectionScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 144' : '0 0 280 220'}>
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
          <path data-link="link-ip" d={layoutPaths['link-ip']} className="fill-none stroke-disabled" strokeWidth="1" />
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
