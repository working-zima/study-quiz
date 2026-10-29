import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['routing'].diagrams['routing-table']

// 세로형은 280 폭에 다섯 열을 한 줄로 넣을 수 없어 표를 돌려 세운다 — 행 하나가 칸 다섯을 위에서 아래로 쌓은 줄이고, 첫째 행 줄 오른쪽에
// 둘째 행 줄이 빈틈없이 붙는다. 열 이름은 같은 높이의 왼쪽 곁말, 행 이름은 줄 위의 곁말이다. 맨 위는 라우터 1이 받은 패킷이다.
const nodes = [
  { id: 'packet', x: 8, y: 8, width: 172 },
  { id: 'r1-dest', x: 80, y: 72, width: 96 },
  { id: 'r1-mask', x: 80, y: 104, width: 96 },
  { id: 'r1-gw', x: 80, y: 136, width: 96 },
  { id: 'r1-if', x: 80, y: 168, width: 96 },
  { id: 'r1-metric', x: 80, y: 200, width: 96 },
  { id: 'r2-dest', x: 176, y: 72, width: 96 },
  { id: 'r2-mask', x: 176, y: 104, width: 96 },
  { id: 'r2-gw', x: 176, y: 136, width: 96 },
  { id: 'r2-if', x: 176, y: 168, width: 96 },
  { id: 'r2-metric', x: 176, y: 200, width: 96 },
]

// 열 이름과 행 이름은 늘 보이고 선명하다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'col-dest', x: 8, y: 91, anchor: 'start' },
  { id: 'col-mask', x: 8, y: 123, anchor: 'start' },
  { id: 'col-gw', x: 8, y: 155, anchor: 'start' },
  { id: 'col-if', x: 8, y: 187, anchor: 'start' },
  { id: 'col-metric', x: 8, y: 219, anchor: 'start' },
  { id: 'row-1', x: 128, y: 64, anchor: 'middle' },
  { id: 'row-2', x: 224, y: 64, anchor: 'middle' },
]

// 가로형은 보통의 표 모양이다 — 행마다 칸 다섯을 왼쪽에서 오른쪽으로 빈틈없이 잇고, 둘째 행을 첫째 행 바로 아래에 붙인다.
// 열 이름은 그 열 위에, 행 이름은 그 행 왼쪽에 둔다.
const wideNodes = [
  { id: 'packet', x: 56, y: 8, width: 172 },
  { id: 'r1-dest', x: 56, y: 70, width: 96 },
  { id: 'r1-mask', x: 152, y: 70, width: 100 },
  { id: 'r1-gw', x: 252, y: 70, width: 96 },
  { id: 'r1-if', x: 348, y: 70, width: 48 },
  { id: 'r1-metric', x: 396, y: 70, width: 40 },
  { id: 'r2-dest', x: 56, y: 102, width: 96 },
  { id: 'r2-mask', x: 152, y: 102, width: 100 },
  { id: 'r2-gw', x: 252, y: 102, width: 96 },
  { id: 'r2-if', x: 348, y: 102, width: 48 },
  { id: 'r2-metric', x: 396, y: 102, width: 40 },
]

const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'col-dest', x: 104, y: 62, anchor: 'middle' },
  { id: 'col-mask', x: 202, y: 62, anchor: 'middle' },
  { id: 'col-gw', x: 300, y: 62, anchor: 'middle' },
  { id: 'col-if', x: 372, y: 62, anchor: 'middle' },
  { id: 'col-metric', x: 416, y: 62, anchor: 'middle' },
  { id: 'row-1', x: 8, y: 89, anchor: 'start' },
  { id: 'row-2', x: 8, y: 121, anchor: 'start' },
]

// 맞는 행 찾기: 패킷과 둘째 행의 목적지 주소·서브넷 마스크 칸. 내보내기: 둘째 행의 게이트웨이·인터페이스 칸. 경로는 없다.
export const routingTableScenarios: DiagramScenario[] = [
  { id: 'match', nodes: ['packet', 'r2-dest', 'r2-mask'], paths: [] },
  { id: 'forward', nodes: ['r2-gw', 'r2-if'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RoutingTableDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={routingTableScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 142' : '0 0 280 240'}>
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
