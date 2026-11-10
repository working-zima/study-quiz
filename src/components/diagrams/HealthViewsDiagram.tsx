import { useState } from 'react'
import { visualsByTopicId } from '../../data/azure'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['azure-monitoring'].diagrams['health-views']

// 세로형은 오른쪽에 「모든 지역의 모든 서비스」를 두고 그 안에 「내가 쓰는 서비스와 지역」을 겹쳐 넣는다.
// 왼쪽에는 보기 셋을 넓은 범위부터 위에서 아래로 쌓고, 각 보기를 그 보기가 보는 범위의 노드와 같은 줄에 맞춘다.
// 범위는 선이 아니라 선명한 노드로 보이므로 경로가 없다.
const nodes = [
  { id: 'other-service', x: 132, y: 30, width: 104 },
  { id: 'my-service', x: 140, y: 92, width: 104 },
  { id: 'vm-1', x: 140, y: 148, width: 42 },
  { id: 'azure-status', x: 8, y: 30, width: 84 },
  { id: 'service-health', x: 8, y: 92, width: 104 },
  { id: 'resource-health', x: 8, y: 148, width: 108 },
]
const groups = [
  { id: 'g-all', x: 124, y: 8, width: 148, height: 188 },
  { id: 'g-mine', x: 132, y: 70, width: 132, height: 118 },
]
const notes = [
  { id: 'status-note', x: 50, y: 78, anchor: 'middle' as const, scenario: 'status' },
  { id: 'service-note', x: 60, y: 138, anchor: 'middle' as const, scenario: 'service' },
  { id: 'resource-note', x: 62, y: 194, anchor: 'middle' as const, scenario: 'resource' },
]

// 가로형은 두 그룹을 위에 겹쳐 두고, 보기 셋을 아래 한 줄에 놓는다. 각 보기는 그 보기가 보는 범위의 노드 바로 아래에 선다.
const wideNodes = [
  { id: 'other-service', x: 40, y: 52, width: 104 },
  { id: 'my-service', x: 212, y: 52, width: 104 },
  { id: 'vm-1', x: 357, y: 52, width: 42 },
  { id: 'azure-status', x: 50, y: 116, width: 84 },
  { id: 'service-health', x: 212, y: 116, width: 104 },
  { id: 'resource-health', x: 324, y: 116, width: 108 },
]
const wideGroups = [
  { id: 'g-all', x: 8, y: 8, width: 424, height: 92 },
  { id: 'g-mine', x: 200, y: 30, width: 224, height: 62 },
]
const wideNotes = [
  { id: 'status-note', x: 92, y: 162, anchor: 'middle' as const, scenario: 'status' },
  { id: 'service-note', x: 264, y: 162, anchor: 'middle' as const, scenario: 'service' },
  { id: 'resource-note', x: 378, y: 162, anchor: 'middle' as const, scenario: 'resource' },
]

export const healthViewsScenarios: DiagramScenario[] = [
  { id: 'status', nodes: ['azure-status', 'other-service', 'my-service'], paths: [] },
  { id: 'service', nodes: ['service-health', 'my-service'], paths: [] },
  { id: 'resource', nodes: ['resource-health', 'vm-1'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function HealthViewsDiagram() {
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
      scenarios={healthViewsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 172' : '0 0 280 204'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
