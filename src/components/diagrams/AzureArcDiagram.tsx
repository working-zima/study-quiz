import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-management-tools'].diagrams['azure-arc']

// 세로형은 위에서 아래로 「Azure 밖」 칸 → Azure Arc → 「Azure」 칸을 쌓는다.
// 서버 둘은 어느 장면에서도 「Azure 밖」 칸에 있고, Azure Arc로 가는 화살표는 관리를 위한 연결이다 — 서버가 Azure로 건너가는 선이 아니다.
const nodes = [
  { id: 'server-1', x: 20, y: 32, width: 108 },
  { id: 'other-vm', x: 144, y: 32, width: 120 },
  { id: 'arc', x: 104, y: 112, width: 72 },
  { id: 'arm', x: 64, y: 184, width: 152 },
  { id: 'policy', x: 92, y: 252, width: 96 },
]
const paths: Record<string, string> = {
  'connect-1': 'M74 64 V128 H104',
  'connect-2': 'M204 64 V128 H176',
  'project': 'M140 144 V184',
  'govern': 'M140 252 V216',
}
const groups = [
  { id: 'g-outside', x: 8, y: 8, width: 264, height: 68 },
  { id: 'g-azure', x: 8, y: 160, width: 264, height: 148 },
]
const notes = [
  { id: 'without-note', x: 140, y: 98, anchor: 'middle' as const, scenario: 'without' },
  { id: 'connect-note', x: 140, y: 236, anchor: 'middle' as const, scenario: 'connect' },
  { id: 'govern-note', x: 140, y: 300, anchor: 'middle' as const, scenario: 'govern' },
  { id: 'stay-note', x: 84, y: 98, anchor: 'start' as const, scenario: 'govern' },
]

// 가로형은 왼쪽부터 「Azure 밖」 칸 → Azure Arc → 「Azure」 칸을 둔다.
// 두 서버에서 나온 연결은 Azure Arc의 위·아래 변으로 들어가고, Azure Policy는 Azure Resource Manager 아래에 둔다.
const wideNodes = [
  { id: 'server-1', x: 16, y: 32, width: 124 },
  { id: 'other-vm', x: 16, y: 88, width: 124 },
  { id: 'arc', x: 176, y: 60, width: 72 },
  { id: 'arm', x: 272, y: 60, width: 152 },
  { id: 'policy', x: 300, y: 120, width: 96 },
]
const widePaths: Record<string, string> = {
  'connect-1': 'M140 48 H212 V60',
  'connect-2': 'M140 104 H212 V92',
  'project': 'M248 76 H272',
  'govern': 'M348 120 V92',
}
const wideGroups = [
  { id: 'g-outside', x: 8, y: 8, width: 140, height: 124 },
  { id: 'g-azure', x: 264, y: 8, width: 168, height: 176 },
]
const wideNotes = [
  { id: 'without-note', x: 8, y: 148, anchor: 'start' as const, scenario: 'without' },
  { id: 'connect-note', x: 272, y: 110, anchor: 'start' as const, scenario: 'connect' },
  { id: 'govern-note', x: 348, y: 172, anchor: 'middle' as const, scenario: 'govern' },
  { id: 'stay-note', x: 8, y: 148, anchor: 'start' as const, scenario: 'govern' },
]

export const azureArcScenarios: DiagramScenario[] = [
  { id: 'without', nodes: ['server-1', 'other-vm'], paths: [] },
  { id: 'connect', nodes: ['server-1', 'other-vm', 'arc', 'arm'], paths: ['connect-1', 'connect-2', 'project'] },
  { id: 'govern', nodes: ['server-1', 'arc', 'arm', 'policy'], paths: ['connect-1', 'project', 'govern'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AzureArcDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-azure-arc-arrow`
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes
  const visiblePaths = active ? active.paths : []
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={azureArcScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 192' : '0 0 280 316'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-disabled" x={group.x} y={group.y} width={group.width} height={group.height} rx="4" strokeWidth="1.5" />
              <text data-group-label={group.id} className="fill-muted" x={group.x + 10} y={group.y + 14} fontSize="9">
                {text.groups![group.id]}
              </text>
            </g>
          ))}

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
