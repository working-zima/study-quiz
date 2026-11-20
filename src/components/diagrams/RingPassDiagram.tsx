import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-topology'].diagrams['ring-pass']

// 세로형은 네 노드를 사각형 둘레에 놓는다 — 왼쪽 위 PC01, 오른쪽 위 PC02, 오른쪽 아래 PC03, 왼쪽 아래 PC04.
// 한 방향 링크 넷이 PC01 → PC02 → PC03 → PC04 → PC01의 고리를 이룬다(원으로 그리지 않고 직교 선으로 잇는다).
// 고리 가운데의 빈자리에 도는 방향 곁말을 늘 둔다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pc01', x: 24, y: 8, width: 64 },
  { id: 'pc02', x: 192, y: 8, width: 64 },
  { id: 'pc03', x: 192, y: 120, width: 64 },
  { id: 'pc04', x: 24, y: 120, width: 64 },
]

// 링크 넷은 늘 보인다. 화살표는 링크 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'link-12': 'M88 24 H192',
  'link-23': 'M224 40 V120',
  'link-34': 'M192 136 H88',
  'link-41': 'M56 120 V40',
  'hop-12': 'M88 24 H192',
  'hop-23': 'M224 40 V120',
}

const linkIds = ['link-12', 'link-23', 'link-34', 'link-41']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 도는 방향 곁말(dir-note)은 늘 보이고, 장면 곁말은 자기 시나리오를 골랐을 때만 그림 아래의 빈 줄에 보인다.
const noteScenarios: Record<string, string | null> = {
  'dir-note': null,
  'pass-note': 'pass',
  'break-note': 'break',
}

const notes: Note[] = [
  { id: 'dir-note', x: 140, y: 84, anchor: 'middle' },
  { id: 'pass-note', x: 140, y: 176, anchor: 'middle' },
  { id: 'break-note', x: 140, y: 176, anchor: 'middle' },
]

// 가로형도 같은 사각형 둘레에 놓되 가로로 넓게 벌린다.
const wideNodes = [
  { id: 'pc01', x: 64, y: 8, width: 64 },
  { id: 'pc02', x: 312, y: 8, width: 64 },
  { id: 'pc03', x: 312, y: 104, width: 64 },
  { id: 'pc04', x: 64, y: 104, width: 64 },
]

const widePaths: Record<string, string> = {
  'link-12': 'M128 24 H312',
  'link-23': 'M344 40 V104',
  'link-34': 'M312 120 H128',
  'link-41': 'M96 104 V40',
  'hop-12': 'M128 24 H312',
  'hop-23': 'M344 40 V104',
}

const wideNotes: Note[] = [
  { id: 'dir-note', x: 220, y: 76, anchor: 'middle' },
  { id: 'pass-note', x: 220, y: 160, anchor: 'middle' },
  { id: 'break-note', x: 220, y: 160, anchor: 'middle' },
]

// nodes에는 선명하게 둘 노드와 링크를 함께 적는다.
// 차례로 거쳐: PC01이 보낸 데이터가 PC02를 거쳐 PC03에 닿는다. 네 노드와 링크는 모두 선명하다.
// 노드 하나의 고장: PC02와 PC02에서 나가는 링크가 흐려지고, PC01에서 PC02까지의 화살표만 남는다.
export const ringPassScenarios: DiagramScenario[] = [
  {
    id: 'pass',
    nodes: ['pc01', 'pc02', 'pc03', 'pc04', ...linkIds],
    paths: ['hop-12', 'hop-23'],
  },
  {
    id: 'break',
    nodes: ['pc01', 'pc03', 'pc04', 'link-12', 'link-34', 'link-41'],
    paths: ['hop-12'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RingPassDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-ring-pass-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes : notes
  const shownNote = (id: string) => noteScenarios[id] === null || noteScenarios[id] === active?.id

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={ringPassScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 172' : '0 0 280 188'}>
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

          {layoutNotes.filter((note) => shownNote(note.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
