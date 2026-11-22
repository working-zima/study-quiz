import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['network-topology'].diagrams['token-passing']

// 세로형은 네 노드를 사각형 둘레에 놓는다 — 왼쪽 위 PC01, 오른쪽 위 PC02, 오른쪽 아래 PC03, 왼쪽 아래 PC04.
// 한 방향 링크 넷이 PC01 → PC02 → PC03 → PC04 → PC01의 고리를 이룬다(원으로 그리지 않고 직교 선으로 잇는다). 노드는 모두 회색이다.
// 토큰은 노드로 그리지 않는다 — 링 위의 토큰은 하나뿐이라, 지금 누가 토큰을 쥐었는지는 고리 안쪽의 곁말로 밝힌다.
const nodes = [
  { id: 'pc01', x: 24, y: 8, width: 64 },
  { id: 'pc02', x: 192, y: 8, width: 64 },
  { id: 'pc03', x: 192, y: 120, width: 64 },
  { id: 'pc04', x: 24, y: 120, width: 64 },
]

// 링크 넷은 늘 보이고, 가는 회색 화살표로 다음 노드 쪽(도는 방향)을 가리킨다. 토큰·데이터의 굵은 화살표는 링크 위에 겹쳐 그린다.
const paths: Record<string, string> = {
  'link-12': 'M88 24 H192',
  'link-23': 'M224 40 V120',
  'link-34': 'M192 136 H88',
  'link-41': 'M56 120 V40',
  'token-12': 'M88 24 H192',
  'token-23': 'M224 40 V120',
  'token-34': 'M192 136 H88',
  'token-41': 'M56 120 V40',
  'data-34': 'M192 136 H88',
  'data-41': 'M56 120 V40',
  'release-34': 'M192 136 H88',
}

const linkIds = ['link-12', 'link-23', 'link-34', 'link-41']

type Note = { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 고리 안쪽의 곁말은 토큰이 어디 있는지를, 그림 아래의 곁말은 그 장면에서 무엇이 가는지를 밝힌다.
const noteScenarios: Record<string, string> = {
  'circulate-center': 'circulate',
  'holder-transmit': 'transmit',
  'holder-release': 'release',
  'circulate-note': 'circulate',
  'transmit-note': 'transmit',
  'release-note': 'release',
}

const notes: Note[] = [
  { id: 'circulate-center', x: 140, y: 84, anchor: 'middle' },
  { id: 'holder-transmit', x: 140, y: 84, anchor: 'middle' },
  { id: 'holder-release', x: 140, y: 84, anchor: 'middle' },
  { id: 'circulate-note', x: 140, y: 176, anchor: 'middle' },
  { id: 'transmit-note', x: 140, y: 176, anchor: 'middle' },
  { id: 'release-note', x: 140, y: 176, anchor: 'middle' },
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
  'token-12': 'M128 24 H312',
  'token-23': 'M344 40 V104',
  'token-34': 'M312 120 H128',
  'token-41': 'M96 104 V40',
  'data-34': 'M312 120 H128',
  'data-41': 'M96 104 V40',
  'release-34': 'M312 120 H128',
}

const wideNotes: Note[] = [
  { id: 'circulate-center', x: 220, y: 76, anchor: 'middle' },
  { id: 'holder-transmit', x: 220, y: 76, anchor: 'middle' },
  { id: 'holder-release', x: 220, y: 76, anchor: 'middle' },
  { id: 'circulate-note', x: 220, y: 160, anchor: 'middle' },
  { id: 'transmit-note', x: 220, y: 160, anchor: 'middle' },
  { id: 'release-note', x: 220, y: 160, anchor: 'middle' },
]

// 토큰이 돈다: 보낼 데이터가 없는 노드들이 토큰을 다음 노드로 넘겨, 토큰이 고리를 한 바퀴 돈다.
// 토큰을 잡고 보낸다: 토큰을 잡은 PC03이 PC01에게 보낸 데이터가 PC04를 거쳐 PC01에 닿는다. 이 장면에 끼지 않는 PC02는 흐리다.
// 토큰을 넘긴다: 다 보낸 PC03이 새 토큰을 다음 노드 PC04로 내보낸다.
export const tokenPassingScenarios: DiagramScenario[] = [
  {
    id: 'circulate',
    nodes: ['pc01', 'pc02', 'pc03', 'pc04'],
    paths: ['token-12', 'token-23', 'token-34', 'token-41'],
  },
  {
    id: 'transmit',
    nodes: ['pc03', 'pc04', 'pc01'],
    paths: ['data-34', 'data-41'],
  },
  {
    id: 'release',
    nodes: ['pc03', 'pc04'],
    paths: ['release-34'],
  },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TokenPassingDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const baseId = useId()
  const arrowId = `${baseId}-token-passing-arrow`
  const linkArrowId = `${baseId}-token-passing-link-arrow`
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
      scenarios={tokenPassingScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 172' : '0 0 280 188'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
            <marker id={linkArrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-muted" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

          {linkIds.map((id) => (
            <path
              key={id}
              data-link={id}
              d={layoutPaths[id]}
              className="fill-none stroke-muted"
              strokeWidth="1.5"
              markerEnd={`url(#${linkArrowId})`}
            />
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
