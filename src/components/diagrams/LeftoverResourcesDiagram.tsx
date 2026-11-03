import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-cost-factors'].diagrams['leftover-resources']

// 세로형은 같은 그룹의 자원을 위아래로 놓고, 곁말은 그룹 아래에 둔다.
const nodes = [
  { id: 'vm', x: 24, y: 40, width: 232 },
  { id: 'disk', x: 24, y: 88, width: 232 },
  { id: 'public-ip', x: 24, y: 136, width: 232 },
  { id: 'nic', x: 24, y: 184, width: 232 },
]
const groups = [
  { id: 'resource-group', x: 8, y: 8, width: 264, height: 224 },
]
const notes = [
  { id: 'after-note', x: 140, y: 254, scenario: 'after' },
  { id: 'charged-note', x: 140, y: 254, scenario: 'charged' },
]

// 가로형은 같은 소속을 유지하며 두 열로 펼친다.
const wideNodes = [
  { id: 'vm', x: 24, y: 40, width: 184 },
  { id: 'disk', x: 232, y: 40, width: 184 },
  { id: 'public-ip', x: 24, y: 88, width: 184 },
  { id: 'nic', x: 232, y: 88, width: 184 },
]
const wideGroups = [
  { id: 'resource-group', x: 8, y: 8, width: 424, height: 128 },
]
const wideNotes = [
  { id: 'after-note', x: 220, y: 156, scenario: 'after' },
  { id: 'charged-note', x: 220, y: 156, scenario: 'charged' },
]

export const leftoverResourcesScenarios: DiagramScenario[] = [
  { id: 'before', nodes: ['vm', 'disk', 'public-ip', 'nic'], paths: [] },
  { id: 'after', nodes: ['disk', 'public-ip', 'nic'], paths: [] },
  { id: 'charged', nodes: ['disk', 'public-ip'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LeftoverResourcesDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenario === active.id)

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={leftoverResourcesScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 272'}>
          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-disabled" x={group.x} y={group.y} width={group.width} height={group.height} rx="4" strokeWidth="1.5" />
              <text data-group-label={group.id} className="fill-muted" x={group.x + 10} y={group.y + 14} fontSize="9">
                {text.groups![group.id]}
              </text>
            </g>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
