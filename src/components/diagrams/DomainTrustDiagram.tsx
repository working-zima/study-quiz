import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['domain-trust']

// 세로형은 왼쪽에 example.com이 든 포리스트 박스(example.com, 그 아래 자식 도메인 sales.example.com)를,
// 오른쪽에 다른 포리스트 박스(example.org)를 둔다. 신뢰 화살표는 example.com에서 example.org로 위쪽 줄을,
// 접근 화살표는 그 반대로 아래쪽 줄을 지난다. 전이에서는 example.org에서 내려와 sales.example.com으로 가는 접근 화살표가 보인다.
const nodes = [
  { id: 'com', x: 12, y: 28, width: 100 },
  { id: 'sales', x: 12, y: 88, width: 124 },
  { id: 'org', x: 184, y: 28, width: 84 },
]

const groups = [
  { id: 'forest-com', x: 4, y: 4, width: 168, height: 124, labelX: 12, labelY: 17 },
  { id: 'forest-org', x: 176, y: 4, width: 100, height: 64, labelX: 184, labelY: 17 },
]

const paths: Record<string, string> = {
  'trust-com-org': 'M112 38 H184',
  'access-org-com': 'M184 50 H112',
  'trust-both': 'M112 38 H184',
  'access-both': 'M184 50 H112',
  'access-org-sales': 'M226 60 V104 H136',
}

// 양방향 트러스트의 두 선은 양쪽 끝에 화살촉이 있다.
const doubleHeaded = new Set(['trust-both', 'access-both'])

// 곁말은 자기 시나리오에서만 보인다. 신뢰 곁말은 신뢰 화살표 위에, 접근 곁말은 접근 화살표 아래에 놓인다.
// 전이의 「접근」은 example.org에서 내려오는 화살표 오른쪽에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'trust-note', x: 148, y: 34, anchor: 'middle', scenarios: ['one-way'] },
  { id: 'access-note', x: 148, y: 62, anchor: 'middle', scenarios: ['one-way'] },
  { id: 'trust-both-note', x: 148, y: 34, anchor: 'middle', scenarios: ['two-way'] },
  { id: 'access-both-note', x: 148, y: 62, anchor: 'middle', scenarios: ['two-way'] },
  { id: 'transitive-note', x: 148, y: 34, anchor: 'middle', scenarios: ['transitive'] },
  { id: 'reach-note', x: 232, y: 86, anchor: 'start', scenarios: ['transitive'] },
]

// 가로형은 두 포리스트 박스를 넓게 벌려 두 도메인 사이의 화살표를 길게 둔다.
const wideNodes = [
  { id: 'com', x: 12, y: 28, width: 112 },
  { id: 'sales', x: 12, y: 88, width: 124 },
  { id: 'org', x: 296, y: 28, width: 100 },
]

const wideGroups = [
  { id: 'forest-com', x: 4, y: 4, width: 232, height: 124, labelX: 12, labelY: 17 },
  { id: 'forest-org', x: 248, y: 4, width: 188, height: 64, labelX: 256, labelY: 17 },
]

const widePaths: Record<string, string> = {
  'trust-com-org': 'M124 38 H296',
  'access-org-com': 'M296 50 H124',
  'trust-both': 'M124 38 H296',
  'access-both': 'M296 50 H124',
  'access-org-sales': 'M346 60 V104 H136',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'trust-note', x: 180, y: 34, anchor: 'middle' },
  { id: 'access-note', x: 180, y: 62, anchor: 'middle' },
  { id: 'trust-both-note', x: 180, y: 34, anchor: 'middle' },
  { id: 'access-both-note', x: 180, y: 62, anchor: 'middle' },
  { id: 'transitive-note', x: 180, y: 34, anchor: 'middle' },
  { id: 'reach-note', x: 186, y: 100, anchor: 'middle' },
]

// 단방향: 신뢰는 example.com → example.org, 접근은 그 반대. 양방향: 두 선 모두 양쪽으로.
// 전이: 단방향 포리스트 트러스트가 example.org의 사용자를 sales.example.com까지 잇는다.
export const domainTrustScenarios: DiagramScenario[] = [
  { id: 'one-way', nodes: ['com', 'org'], paths: ['trust-com-org', 'access-org-com'] },
  { id: 'two-way', nodes: ['com', 'org'], paths: ['trust-both', 'access-both'] },
  { id: 'transitive', nodes: ['com', 'sales', 'org'], paths: ['trust-com-org', 'access-org-sales'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DomainTrustDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const markerBase = useId()
  const arrowId = `${markerBase}-domain-trust-arrow`
  const startArrowId = `${markerBase}-domain-trust-start-arrow`
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
      scenarios={domainTrustScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 136' : '0 0 280 136'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
            <marker id={startArrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M6 0 L0 3 L6 6 Z" />
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
              markerStart={doubleHeaded.has(id) ? `url(#${startArrowId})` : undefined}
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
