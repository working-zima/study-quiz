import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['routing'].diagrams['default-route']

// 맨 위는 라우터 1이 받은 두 패킷, 가운데는 라우터 1의 라우팅 테이블(행마다 목적지 주소·게이트웨이·인터페이스 칸을 빈틈없이 잇는다),
// 맨 아래는 패킷이 나가는 두 곳 — 바로 이어진 네트워크 192.0.2.0과 라우터 2다. 노드는 모두 회색이다.
const nodes = [
  { id: 'pkt-a', x: 8, y: 8, width: 124 },
  { id: 'pkt-b', x: 140, y: 8, width: 132 },
  { id: 'r1-dest', x: 24, y: 72, width: 96 },
  { id: 'r1-gw', x: 120, y: 72, width: 96 },
  { id: 'r1-if', x: 216, y: 72, width: 48 },
  { id: 'r2-dest', x: 24, y: 104, width: 96 },
  { id: 'r2-gw', x: 120, y: 104, width: 96 },
  { id: 'r2-if', x: 216, y: 104, width: 48 },
  { id: 'host-net', x: 24, y: 180, width: 128 },
  { id: 'router-2', x: 168, y: 180, width: 80 },
]

// 첫째 행은 아래에 둘째 행이 붙어 있어, 표의 왼쪽으로 돌아 네트워크 192.0.2.0의 왼쪽 변에 닿는다. 둘째 행은 게이트웨이 칸에서 곧게 내려간다.
const paths: Record<string, string> = {
  'to-host': 'M24 88 H12 V196 H24',
  'to-router-2': 'M192 136 V180',
}

// scenarios가 null인 곁말(열 이름)은 늘 보인다. 나머지는 그 시나리오에서만 그림 아래에 보인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] | null }[] = [
  { id: 'col-dest', x: 72, y: 64, anchor: 'middle', scenarios: null },
  { id: 'col-gw', x: 168, y: 64, anchor: 'middle', scenarios: null },
  { id: 'col-if', x: 240, y: 64, anchor: 'middle', scenarios: null },
  { id: 'specific-why', x: 8, y: 236, anchor: 'start', scenarios: ['specific'] },
  { id: 'specific-out', x: 8, y: 252, anchor: 'start', scenarios: ['specific'] },
  { id: 'default-why', x: 8, y: 236, anchor: 'start', scenarios: ['default'] },
  { id: 'default-out', x: 8, y: 252, anchor: 'start', scenarios: ['default'] },
]

// 가로형은 패킷을 위에, 표를 왼쪽 아래에, 나가는 곳 둘을 표의 오른쪽에 둔다. 행마다 인터페이스 칸에서 곧게 오른쪽으로 나간다.
const wideNodes = [
  { id: 'pkt-a', x: 24, y: 8, width: 124 },
  { id: 'pkt-b', x: 164, y: 8, width: 132 },
  { id: 'r1-dest', x: 24, y: 64, width: 96 },
  { id: 'r1-gw', x: 120, y: 64, width: 96 },
  { id: 'r1-if', x: 216, y: 64, width: 48 },
  { id: 'r2-dest', x: 24, y: 96, width: 96 },
  { id: 'r2-gw', x: 120, y: 96, width: 96 },
  { id: 'r2-if', x: 216, y: 96, width: 48 },
  { id: 'host-net', x: 296, y: 56, width: 128 },
  { id: 'router-2', x: 296, y: 104, width: 80 },
]

const widePaths: Record<string, string> = {
  'to-host': 'M264 80 H296',
  'to-router-2': 'M264 112 H296',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'col-dest', x: 72, y: 56, anchor: 'middle' },
  { id: 'col-gw', x: 168, y: 56, anchor: 'middle' },
  { id: 'col-if', x: 240, y: 56, anchor: 'middle' },
  { id: 'specific-why', x: 24, y: 168, anchor: 'start' },
  { id: 'specific-out', x: 24, y: 184, anchor: 'start' },
  { id: 'default-why', x: 24, y: 168, anchor: 'start' },
  { id: 'default-out', x: 24, y: 184, anchor: 'start' },
]

// 맞는 행이 있을 때: 192.0.2.4 패킷과 첫째 행, 네트워크 192.0.2.0. 맞는 행이 없을 때: 198.51.100.7 패킷과 디폴트 라우트 행, 라우터 2.
export const defaultRouteScenarios: DiagramScenario[] = [
  { id: 'specific', nodes: ['pkt-a', 'r1-dest', 'r1-gw', 'r1-if', 'host-net'], paths: ['to-host'] },
  { id: 'default', nodes: ['pkt-b', 'r2-dest', 'r2-gw', 'r2-if', 'router-2'], paths: ['to-router-2'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DefaultRouteDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-default-route-arrow`
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
      scenarios={defaultRouteScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 196' : '0 0 280 264'}>
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
