import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-topology'].diagrams['star-center-failure']

// 세로형은 가운데에 HUB01을 두고, 그 위에 PC01·PC02, 아래에 PC03·PC04를 둔다.
// 케이블은 노드의 위·아래 변에서 나와 꺾여 HUB01의 왼쪽·오른쪽 변으로 들어간다 — 위쪽 케이블과 아래쪽 케이블은 HUB01 변의 서로 다른 높이에 닿는다.
// 노드끼리 바로 잇는 선은 없다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pc01', x: 40, y: 8, width: 64 },
  { id: 'pc02', x: 176, y: 8, width: 64 },
  { id: 'hub', x: 108, y: 72, width: 64 },
  { id: 'pc03', x: 40, y: 136, width: 64 },
  { id: 'pc04', x: 176, y: 136, width: 64 },
]

// 케이블 넷은 늘 보인다. 화살표는 케이블 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'link-pc01': 'M72 40 V80 H108',
  'link-pc02': 'M208 40 V80 H172',
  'link-pc03': 'M108 96 H72 V136',
  'link-pc04': 'M172 96 H208 V136',
  'from-pc01': 'M72 40 V80 H108',
  'to-pc02': 'M172 80 H208 V40',
  'to-pc03': 'M108 96 H72 V136',
  'to-pc04': 'M172 96 H208 V136',
}

const linkIds = ['link-pc01', 'link-pc02', 'link-pc03', 'link-pc04']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보이고, 그림 아래의 빈 줄 가운데에 둔다.
const noteScenarios: Record<string, string> = {
  'normal-note': 'normal',
  'node-fail-note': 'node-fail',
  'center-fail-note': 'center-fail',
}

const notes: Note[] = [
  { id: 'normal-note', x: 140, y: 188, anchor: 'middle' },
  { id: 'node-fail-note', x: 140, y: 188, anchor: 'middle' },
  { id: 'center-fail-note', x: 140, y: 188, anchor: 'middle' },
]

// 가로형은 가운데에 HUB01을 두고, 왼쪽 위·아래에 PC01·PC03, 오른쪽 위·아래에 PC02·PC04를 둔다.
// 케이블은 노드의 안쪽 변에서 나와 꺾여 HUB01의 위·아래 변으로 들어간다.
const wideNodes = [
  { id: 'pc01', x: 48, y: 8, width: 64 },
  { id: 'pc02', x: 328, y: 8, width: 64 },
  { id: 'hub', x: 188, y: 56, width: 64 },
  { id: 'pc03', x: 48, y: 104, width: 64 },
  { id: 'pc04', x: 328, y: 104, width: 64 },
]

const widePaths: Record<string, string> = {
  'link-pc01': 'M112 24 H204 V56',
  'link-pc02': 'M328 24 H236 V56',
  'link-pc03': 'M204 88 V120 H112',
  'link-pc04': 'M236 88 V120 H328',
  'from-pc01': 'M112 24 H204 V56',
  'to-pc02': 'M236 56 V24 H328',
  'to-pc03': 'M204 88 V120 H112',
  'to-pc04': 'M236 88 V120 H328',
}

const wideNotes: Note[] = [
  { id: 'normal-note', x: 220, y: 160, anchor: 'middle' },
  { id: 'node-fail-note', x: 220, y: 160, anchor: 'middle' },
  { id: 'center-fail-note', x: 220, y: 160, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 케이블을 함께 적는다.
// 중앙을 거쳐: PC01의 신호가 HUB01에 닿고, 허브인 HUB01이 나머지 셋 쪽 케이블로 내보낸다.
// 노드 하나의 고장: PC03과 그 케이블이 흐려지고, PC01 → HUB01 → PC02·PC04 길이 남는다.
// 중앙의 고장: HUB01이 흐려지고 화살표가 하나도 없다. 케이블은 멀쩡하므로 선명하게 둔다.
export const starCenterFailureScenarios: DiagramScenario[] = [
  {
    id: 'normal',
    nodes: ['pc01', 'pc02', 'hub', 'pc03', 'pc04', ...linkIds],
    paths: ['from-pc01', 'to-pc02', 'to-pc03', 'to-pc04'],
  },
  {
    id: 'node-fail',
    nodes: ['pc01', 'pc02', 'hub', 'pc04', 'link-pc01', 'link-pc02', 'link-pc04'],
    paths: ['from-pc01', 'to-pc02', 'to-pc04'],
  },
  {
    id: 'center-fail',
    nodes: ['pc01', 'pc02', 'pc03', 'pc04', ...linkIds],
    paths: [],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function StarCenterFailureDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-star-center-failure-arrow`
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
      scenarios={starCenterFailureScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 172' : '0 0 280 200'}>
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
