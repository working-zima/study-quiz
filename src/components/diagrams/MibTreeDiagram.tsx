import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['app-protocols-mgmt-security'].diagrams['mib-tree']

// 세로형은 OID 나무의 한 갈래를 왼쪽 열에 위에서 아래로 쌓는다 — iso(1)부터 sysUpTime(3)까지 여덟 가지.
// sysUpTime(3) 오른쪽에 완성된 OID를 두고, 맨 아래 줄에 매니저와 「라우터 1」의 에이전트를 나란히 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'iso', x: 8, y: 8, width: 104 },
  { id: 'org', x: 8, y: 56, width: 104 },
  { id: 'dod', x: 8, y: 104, width: 104 },
  { id: 'internet', x: 8, y: 152, width: 104 },
  { id: 'mgmt', x: 8, y: 200, width: 104 },
  { id: 'mib2', x: 8, y: 248, width: 104 },
  { id: 'system', x: 8, y: 296, width: 104 },
  { id: 'sysuptime', x: 8, y: 344, width: 104 },
  { id: 'oid', x: 136, y: 344, width: 136 },
  { id: 'manager', x: 8, y: 424, width: 104 },
  { id: 'agent', x: 136, y: 424, width: 136 },
]

// 가지는 늘 보이고, 고른 시나리오의 화살표를 그 위에 겹쳐 그린다. 가지와 그 위의 화살표는 위 가지에서 아래 가지로 간다.
const paths: Record<string, string> = {
  'b-org': 'M60 40 V56',
  'b-dod': 'M60 88 V104',
  'b-internet': 'M60 136 V152',
  'b-mgmt': 'M60 184 V200',
  'b-mib2': 'M60 232 V248',
  'b-system': 'M60 280 V296',
  'b-sysuptime': 'M60 328 V344',
  'walk-org': 'M60 40 V56',
  'walk-dod': 'M60 88 V104',
  'walk-internet': 'M60 136 V152',
  'walk-mgmt': 'M60 184 V200',
  'walk-mib2': 'M60 232 V248',
  'walk-system': 'M60 280 V296',
  'walk-sysuptime': 'M60 328 V344',
  'to-oid': 'M112 360 H136',
  'ask': 'M112 432 H136',
  'answer': 'M136 448 H112',
}

const linkIds = ['b-org', 'b-dod', 'b-internet', 'b-mgmt', 'b-mib2', 'b-system', 'b-sysuptime']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 그 시나리오를 골랐을 때만 보인다.
const noteScenarios: Record<string, string> = {
  'join-note': 'path',
  'object-note': 'object',
  'ask-note': 'agent',
  'value-note': 'agent',
}

const notes: Note[] = [
  { id: 'join-note', x: 136, y: 336, anchor: 'start' },
  { id: 'object-note', x: 136, y: 400, anchor: 'start' },
  { id: 'ask-note', x: 8, y: 404, anchor: 'start' },
  { id: 'value-note', x: 272, y: 476, anchor: 'end' },
]

// 가로형은 나무를 두 줄로 꺾는다. 윗줄은 iso(1)에서 internet(1)까지 왼쪽에서 오른쪽으로, 아랫줄은 internet(1) 아래의 mgmt(2)에서
// sysUpTime(3)까지 오른쪽에서 왼쪽으로 간다. sysUpTime(3) 아래에 OID를, 그 오른쪽에 매니저와 「라우터 1」의 에이전트를 둔다.
const wideNodes = [
  { id: 'iso', x: 8, y: 8, width: 92 },
  { id: 'org', x: 116, y: 8, width: 92 },
  { id: 'dod', x: 224, y: 8, width: 92 },
  { id: 'internet', x: 332, y: 8, width: 92 },
  { id: 'mgmt', x: 332, y: 72, width: 92 },
  { id: 'mib2', x: 224, y: 72, width: 92 },
  { id: 'system', x: 116, y: 72, width: 92 },
  { id: 'sysuptime', x: 8, y: 72, width: 92 },
  { id: 'oid', x: 8, y: 136, width: 136 },
  { id: 'manager', x: 192, y: 136, width: 96 },
  { id: 'agent', x: 304, y: 136, width: 128 },
]

const widePaths: Record<string, string> = {
  'b-org': 'M100 24 H116',
  'b-dod': 'M208 24 H224',
  'b-internet': 'M316 24 H332',
  'b-mgmt': 'M378 40 V72',
  'b-mib2': 'M332 88 H316',
  'b-system': 'M224 88 H208',
  'b-sysuptime': 'M116 88 H100',
  'walk-org': 'M100 24 H116',
  'walk-dod': 'M208 24 H224',
  'walk-internet': 'M316 24 H332',
  'walk-mgmt': 'M378 40 V72',
  'walk-mib2': 'M332 88 H316',
  'walk-system': 'M224 88 H208',
  'walk-sysuptime': 'M116 88 H100',
  'to-oid': 'M54 104 V136',
  'ask': 'M288 144 H304',
  'answer': 'M304 160 H288',
}

const wideNotes: Note[] = [
  { id: 'join-note', x: 64, y: 124, anchor: 'start' },
  { id: 'object-note', x: 8, y: 188, anchor: 'start' },
  { id: 'ask-note', x: 296, y: 128, anchor: 'middle' },
  { id: 'value-note', x: 296, y: 188, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 가지를 함께 적는다.
// 나무 따라가기 — 여덟 가지와 가지 선, 완성된 OID. 관리 객체 — sysUpTime(3)과 그 OID. 값은 에이전트에 — OID와 매니저·에이전트.
export const mibTreeScenarios: DiagramScenario[] = [
  {
    id: 'path',
    nodes: ['iso', 'org', 'dod', 'internet', 'mgmt', 'mib2', 'system', 'sysuptime', ...linkIds, 'oid'],
    paths: ['walk-org', 'walk-dod', 'walk-internet', 'walk-mgmt', 'walk-mib2', 'walk-system', 'walk-sysuptime', 'to-oid'],
  },
  { id: 'object', nodes: ['sysuptime', 'oid'], paths: ['to-oid'] },
  { id: 'agent', nodes: ['oid', 'manager', 'agent'], paths: ['ask', 'answer'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MibTreeDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-mib-tree-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={mibTreeScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 200' : '0 0 280 488'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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

          {active && layoutNotes.filter((note) => noteScenarios[note.id] === active.id).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
