import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['ad-forest-structure']

// 세로형은 가장 바깥 포리스트 박스 안에 트리 박스 둘을 위아래로 쌓는다. 첫 트리에는 부모 example.com 아래에 자식 sales.example.com을,
// 둘째 트리에는 example.net 하나를 둔다. 부모에서 자식으로 가는 화살표는 곧게 내려간다.
const nodes = [
  { id: 'com', x: 20, y: 44, width: 124 },
  { id: 'sales', x: 20, y: 100, width: 124 },
  { id: 'net', x: 20, y: 168, width: 96 },
]

const groups = [
  { id: 'forest', x: 4, y: 4, width: 272, height: 212, labelX: 12, labelY: 17 },
  { id: 'tree-com', x: 12, y: 24, width: 256, height: 116, labelX: 20, labelY: 37 },
  { id: 'tree-net', x: 12, y: 148, width: 256, height: 60, labelX: 20, labelY: 161 },
]

const paths: Record<string, string> = {
  'com-sales': 'M82 76 V100',
}

// 곁말은 자기 시나리오에서만 보인다. 「가장 작은 묶음」은 example.com 오른쪽에, 「이름이 이어진다」는 sales.example.com 오른쪽에,
// 「이름이 달라도 같은 포리스트」는 example.net 오른쪽에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'domain-note', x: 152, y: 64, anchor: 'start', scenarios: ['domain'] },
  { id: 'tree-note', x: 152, y: 120, anchor: 'start', scenarios: ['tree'] },
  { id: 'forest-note', x: 124, y: 188, anchor: 'start', scenarios: ['forest'] },
]

// 가로형은 트리 박스 둘을 포리스트 박스 안에 나란히 놓는다. 「이름이 달라도 같은 포리스트」는 example.net 아래에 놓인다.
const wideNodes = [
  { id: 'com', x: 20, y: 44, width: 124 },
  { id: 'sales', x: 20, y: 100, width: 124 },
  { id: 'net', x: 260, y: 44, width: 96 },
]

const wideGroups = [
  { id: 'forest', x: 4, y: 4, width: 432, height: 144, labelX: 12, labelY: 17 },
  { id: 'tree-com', x: 12, y: 24, width: 232, height: 116, labelX: 20, labelY: 37 },
  { id: 'tree-net', x: 252, y: 24, width: 184, height: 116, labelX: 260, labelY: 37 },
]

const widePaths: Record<string, string> = {
  'com-sales': 'M82 76 V100',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'domain-note', x: 152, y: 64, anchor: 'start' },
  { id: 'tree-note', x: 152, y: 120, anchor: 'start' },
  { id: 'forest-note', x: 260, y: 92, anchor: 'start' },
]

// 도메인: example.com 하나. 트리: 이름이 이어지는 부모와 자식 도메인. 포리스트: 이름이 다른 트리까지 세 도메인 모두.
export const adForestStructureScenarios: DiagramScenario[] = [
  { id: 'domain', nodes: ['com'], paths: [] },
  { id: 'tree', nodes: ['com', 'sales'], paths: ['com-sales'] },
  { id: 'forest', nodes: ['com', 'sales', 'net'], paths: ['com-sales'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function AdForestStructureDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ad-forest-structure-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={adForestStructureScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 156' : '0 0 280 224'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.labelX} y={group.labelY} className="fill-muted" fontSize="9">
              {text.groups?.[group.id]}
            </text>
          ))}

          {active?.paths.map((id) => (
            <path
              key={id}
              data-path={id}
              d={layoutPaths[id]}
              className="fill-none stroke-title"
              strokeWidth="2"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
          ))}

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
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
