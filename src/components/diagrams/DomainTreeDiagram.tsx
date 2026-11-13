import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['domain-tree']

// 세로형은 위 박스에 이름 나무를 위에서 아래로 그린다. 루트 아래에 최상위 도메인 com·net·org를 한 줄로, com 아래로 example,
// example 아래로 www와 mail을 둔다. 나무 왼쪽에는 층마다 그 단계의 이름을 단다.
// 아래 박스에는 이름 www.example.com을 쓴 차례 그대로 레이블 www · example · com을 빈틈없이 잇고, 레이블마다 아래에 단계 이름을 단다.
const nodes = [
  { id: 'root', x: 96, y: 24, width: 72 },
  { id: 'com', x: 108, y: 80, width: 48 },
  { id: 'net', x: 164, y: 80, width: 48 },
  { id: 'org', x: 220, y: 80, width: 48 },
  { id: 'example', x: 96, y: 136, width: 72 },
  { id: 'www', x: 84, y: 192, width: 48 },
  { id: 'mail', x: 140, y: 192, width: 48 },
  { id: 'name-www', x: 44, y: 264, width: 56 },
  { id: 'name-example', x: 100, y: 264, width: 80 },
  { id: 'name-com', x: 180, y: 264, width: 56 },
]

const groups = [
  { id: 'tree', x: 2, y: 4, width: 276, height: 228, labelX: 10, labelY: 17 },
  { id: 'name', x: 2, y: 244, width: 276, height: 80, labelX: 10, labelY: 257 },
]

// 위 단계와 바로 아래 마디를 잇는 선(b-)은 늘 보이고, 고른 시나리오의 화살표(to-)를 그 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'b-com': 'M132 56 V80',
  'b-net': 'M132 56 V68 H188 V80',
  'b-org': 'M132 56 V68 H244 V80',
  'b-example': 'M132 112 V136',
  'b-www': 'M132 168 V180 H108 V192',
  'b-mail': 'M132 168 V180 H164 V192',
  'to-com': 'M132 56 V80',
  'to-example': 'M132 112 V136',
  'to-www': 'M132 168 V180 H108 V192',
}

const linkIds = ['b-com', 'b-net', 'b-org', 'b-example', 'b-www', 'b-mail']

// 나무의 층 이름(layer)은 늘 보이고 흐려지지 않는다. 레이블의 단계 이름(field)은 늘 보이고 자기 레이블 노드의 opacity를 따른다.
// 나머지 곁말은 자기 시나리오에서만 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', layer?: true, field?: string, scenarios: string[] }[] = [
  { id: 'tld-layer', x: 10, y: 100, anchor: 'start', layer: true, scenarios: [] },
  { id: 'second-layer', x: 10, y: 156, anchor: 'start', layer: true, scenarios: [] },
  { id: 'third-layer', x: 10, y: 212, anchor: 'start', layer: true, scenarios: [] },
  { id: 'www-level', x: 72, y: 310, anchor: 'middle', field: 'name-www', scenarios: [] },
  { id: 'example-level', x: 140, y: 310, anchor: 'middle', field: 'name-example', scenarios: [] },
  { id: 'com-level', x: 208, y: 310, anchor: 'middle', field: 'name-com', scenarios: [] },
  { id: 'read-note', x: 270, y: 257, anchor: 'end', scenarios: ['read'] },
  { id: 'sub-note', x: 196, y: 212, anchor: 'start', scenarios: ['subdomain'] },
]

// 가로형은 왼쪽 박스에 같은 나무를 그리고, 오른쪽 박스에는 레이블을 나무의 같은 층 옆에 위에서 아래로 놓는다 — 맨 위가 오른쪽 레이블 com이다.
const wideNodes = [
  { id: 'root', x: 88, y: 28, width: 72 },
  { id: 'com', x: 100, y: 84, width: 48 },
  { id: 'net', x: 152, y: 84, width: 48 },
  { id: 'org', x: 204, y: 84, width: 48 },
  { id: 'example', x: 88, y: 140, width: 72 },
  { id: 'www', x: 72, y: 196, width: 48 },
  { id: 'mail', x: 128, y: 196, width: 48 },
  { id: 'name-www', x: 292, y: 196, width: 64 },
  { id: 'name-example', x: 292, y: 140, width: 64 },
  { id: 'name-com', x: 292, y: 84, width: 64 },
]

const wideGroups = [
  { id: 'tree', x: 8, y: 8, width: 264, height: 228, labelX: 16, labelY: 21 },
  { id: 'name', x: 284, y: 8, width: 148, height: 228, labelX: 292, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'b-com': 'M124 60 V84',
  'b-net': 'M124 60 V72 H176 V84',
  'b-org': 'M124 60 V72 H228 V84',
  'b-example': 'M124 116 V140',
  'b-www': 'M124 172 V184 H96 V196',
  'b-mail': 'M124 172 V184 H152 V196',
  'to-com': 'M124 60 V84',
  'to-example': 'M124 116 V140',
  'to-www': 'M124 172 V184 H96 V196',
}

// 곁말의 자리만 배치마다 다르다. 보이는 때와 opacity는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'tld-layer', x: 16, y: 104, anchor: 'start' },
  { id: 'second-layer', x: 16, y: 160, anchor: 'start' },
  { id: 'third-layer', x: 16, y: 216, anchor: 'start' },
  { id: 'www-level', x: 364, y: 216, anchor: 'start' },
  { id: 'example-level', x: 364, y: 160, anchor: 'start' },
  { id: 'com-level', x: 364, y: 104, anchor: 'start' },
  { id: 'read-note', x: 292, y: 44, anchor: 'start' },
  { id: 'sub-note', x: 184, y: 216, anchor: 'start' },
]

// nodes에는 선명하게 둘 노드와 나무의 선을 함께 적는다.
// 읽는 차례: 루트에서 www까지 내려가는 갈래와 이름의 레이블 셋. 최상위 도메인: 루트와 그 아래 층, 그리고 맨 오른쪽 레이블 com.
// 서브 도메인: example.com과 그 아래에 딸린 www·mail, 그리고 이름의 레이블 셋.
export const domainTreeScenarios: DiagramScenario[] = [
  {
    id: 'read',
    nodes: ['root', 'com', 'example', 'www', 'name-www', 'name-example', 'name-com', 'b-com', 'b-example', 'b-www'],
    paths: ['to-com', 'to-example', 'to-www'],
  },
  { id: 'tld', nodes: ['root', 'com', 'net', 'org', 'name-com', 'b-com', 'b-net', 'b-org'], paths: [] },
  { id: 'subdomain', nodes: ['example', 'www', 'mail', 'name-www', 'name-example', 'name-com', 'b-www', 'b-mail'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DomainTreeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-domain-tree-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.layer || note.field !== undefined || (active !== null && note.scenarios.includes(active.id)))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={domainTreeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 244' : '0 0 280 328'}>
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

          {linkIds.map((id) => (
            <path key={id} data-link={id} d={layoutPaths[id]} className="fill-none stroke-muted" strokeWidth="1.5" opacity={opacityOf(id)} />
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
            <text
              key={note.id}
              data-note={note.id}
              x={note.x}
              y={note.y}
              textAnchor={note.anchor}
              opacity={note.field === undefined ? undefined : opacityOf(note.field)}
              className="fill-muted"
              fontSize="9"
            >
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
