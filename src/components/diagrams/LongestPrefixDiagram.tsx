import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['routing'].diagrams['longest-prefix']

// 맨 위는 라우터 1이 받은 패킷이고, 그 아래가 라우터 1의 라우팅 테이블 두 행이다. 행마다 목적지 주소 칸과 게이트웨이 칸을 빈틈없이 잇고,
// 둘째 행(/28)을 첫째 행(/24) 바로 아래에 붙인다. 노드는 모두 회색이다.
const nodes = [
  { id: 'dest', x: 40, y: 8, width: 152 },
  { id: 'r24-prefix', x: 40, y: 84, width: 120 },
  { id: 'r24-gw', x: 160, y: 84, width: 96 },
  { id: 'r28-prefix', x: 40, y: 116, width: 120 },
  { id: 'r28-gw', x: 160, y: 116, width: 96 },
]

// 고른 행을 가리키는 화살표. 첫째 행을 지나지 않도록 표의 왼쪽으로 돌아 둘째 행의 왼쪽 변에 닿는다.
const paths: Record<string, string> = {
  'pick': 'M40 24 H20 V132 H40',
}

// scenarios가 null인 곁말(목적지의 넷째 수, 열 이름)은 늘 보인다. 나머지는 그 시나리오에서만 표 아래에 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] | null }[] = [
  { id: 'dest-bits', x: 116, y: 60, anchor: 'middle', scenarios: null },
  { id: 'col-prefix', x: 100, y: 76, anchor: 'middle', scenarios: null },
  { id: 'col-gw', x: 208, y: 76, anchor: 'middle', scenarios: null },
  { id: 'match-24', x: 8, y: 172, anchor: 'start', scenarios: ['both-match'] },
  { id: 'match-28', x: 8, y: 188, anchor: 'start', scenarios: ['both-match'] },
  { id: 'bits-28', x: 8, y: 204, anchor: 'start', scenarios: ['both-match'] },
  { id: 'pick-28', x: 8, y: 172, anchor: 'start', scenarios: ['longest'] },
  { id: 'next-hop', x: 8, y: 188, anchor: 'start', scenarios: ['longest'] },
]

// 가로형은 패킷을 왼쪽에, 표를 오른쪽에 둔다. 패킷이 둘째 행과 같은 높이라 화살표가 곧게 간다.
const wideNodes = [
  { id: 'dest', x: 8, y: 64, width: 152 },
  { id: 'r24-prefix', x: 200, y: 40, width: 120 },
  { id: 'r24-gw', x: 320, y: 40, width: 96 },
  { id: 'r28-prefix', x: 200, y: 72, width: 120 },
  { id: 'r28-gw', x: 320, y: 72, width: 96 },
]

const widePaths: Record<string, string> = {
  'pick': 'M160 88 H200',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'dest-bits', x: 84, y: 112, anchor: 'middle' },
  { id: 'col-prefix', x: 260, y: 32, anchor: 'middle' },
  { id: 'col-gw', x: 368, y: 32, anchor: 'middle' },
  { id: 'match-24', x: 200, y: 128, anchor: 'start' },
  { id: 'match-28', x: 200, y: 144, anchor: 'start' },
  { id: 'bits-28', x: 200, y: 160, anchor: 'start' },
  { id: 'pick-28', x: 200, y: 128, anchor: 'start' },
  { id: 'next-hop', x: 200, y: 144, anchor: 'start' },
]

// 두 행 모두: 패킷과 두 행의 목적지 주소 칸. 가장 긴 접두사: 패킷과 /28 행의 두 칸, 그 행으로 가는 화살표.
export const longestPrefixScenarios: DiagramScenario[] = [
  { id: 'both-match', nodes: ['dest', 'r24-prefix', 'r28-prefix'], paths: [] },
  { id: 'longest', nodes: ['dest', 'r28-prefix', 'r28-gw'], paths: ['pick'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LongestPrefixDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-longest-prefix-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => note.scenarios === null || (active !== null && note.scenarios.includes(active.id)))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={longestPrefixScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 168' : '0 0 280 216'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
