import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-virtual-networking'].diagrams['private-endpoint']

// 세로형은 인터넷 쪽 줄을 위에, 가상 네트워크를 아래에 두고 스토리지 계정을 그 사이에 둔다.
const groups = [
  { id: 'vnet', x: 8, y: 128, width: 264, height: 80 },
]
const nodes = [
  { id: 'user', x: 8, y: 8, width: 104 },
  { id: 'public-ep', x: 146, y: 8, width: 112 },
  { id: 'storage', x: 154, y: 76, width: 96 },
  { id: 'vm-1', x: 20, y: 152, width: 80 },
  { id: 'pe', x: 140, y: 152, width: 124 },
]
const paths: Record<string, string> = {
  'user-to-public': 'M112 24 H146',
  'public-to-storage': 'M202 40 V76',
  'vm-to-pe': 'M100 168 H140',
  'pe-to-storage': 'M202 152 V108',
}
const notes = [
  { id: 'public-note', x: 80, y: 62 },
  { id: 'private-note', x: 150, y: 198 },
]

// 가로형은 왼쪽에서 오른쪽으로 흐르고 두 길이 오른쪽의 스토리지 계정으로 모인다.
const wideGroups = [
  { id: 'vnet', x: 8, y: 112, width: 292, height: 80 },
]
const wideNodes = [
  { id: 'user', x: 20, y: 24, width: 104 },
  { id: 'public-ep', x: 176, y: 24, width: 112 },
  { id: 'storage', x: 330, y: 84, width: 96 },
  { id: 'vm-1', x: 28, y: 136, width: 80 },
  { id: 'pe', x: 164, y: 136, width: 124 },
]
const widePaths: Record<string, string> = {
  'user-to-public': 'M124 40 H176',
  'public-to-storage': 'M288 40 H378 V84',
  'vm-to-pe': 'M108 152 H164',
  'pe-to-storage': 'M288 152 H378 V116',
}
const wideNotes = [
  { id: 'public-note', x: 200, y: 72 },
  { id: 'private-note', x: 200, y: 182 },
]
const scenarioNote: Record<string, string> = { public: 'public-note', private: 'private-note' }
export const privateEndpointScenarios: DiagramScenario[] = [
  { id: 'public', nodes: ['user', 'public-ep', 'storage'], paths: ['user-to-public', 'public-to-storage'] },
  { id: 'private', nodes: ['vm-1', 'pe', 'storage'], paths: ['vm-to-pe', 'pe-to-storage'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PrivateEndpointDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-private-endpoint-arrow`
  const wide = useWideDiagram()
  const layoutGroups = wide ? wideGroups : groups
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && scenarioNote[active.id] === note.id)

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend} scenarios={privateEndpointScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 216'}>
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
