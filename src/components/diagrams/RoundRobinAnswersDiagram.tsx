import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['dns'].diagrams['round-robin-answers']

// 세로형은 상자 넷을 두 줄 두 칸으로 놓는다. 왼쪽 위가 DNS 서버에 적힌 레코드, 나머지 셋이 질의 1·2·3의 답이다.
// 상자마다 주소 칸 셋을 위에서 아래로 빈틈없이 잇고, 위 칸이 먼저 놓인 주소다. 답의 노드는 질의마다 다른 id다. 노드는 모두 회색이고 선은 없다.
const nodes = [
  { id: 'rec-10', x: 20, y: 32, width: 104 },
  { id: 'rec-11', x: 20, y: 64, width: 104 },
  { id: 'rec-12', x: 20, y: 96, width: 104 },
  { id: 'q1-10', x: 156, y: 32, width: 104 },
  { id: 'q1-11', x: 156, y: 64, width: 104 },
  { id: 'q1-12', x: 156, y: 96, width: 104 },
  { id: 'q2-11', x: 20, y: 176, width: 104 },
  { id: 'q2-12', x: 20, y: 208, width: 104 },
  { id: 'q2-10', x: 20, y: 240, width: 104 },
  { id: 'q3-12', x: 156, y: 176, width: 104 },
  { id: 'q3-10', x: 156, y: 208, width: 104 },
  { id: 'q3-11', x: 156, y: 240, width: 104 },
]

const groups = [
  { id: 'server', x: 8, y: 8, width: 128, height: 128, labelX: 16, labelY: 21 },
  { id: 'q1', x: 144, y: 8, width: 128, height: 128, labelX: 152, labelY: 21 },
  { id: 'q2', x: 8, y: 152, width: 128, height: 128, labelX: 16, labelY: 165 },
  { id: 'q3', x: 144, y: 152, width: 128, height: 128, labelX: 152, labelY: 165 },
]

// 가로형은 같은 상자 넷을 왼쪽부터 한 줄로 놓는다. 상자 안의 칸 차례는 세로형과 같다.
const wideNodes = [
  { id: 'rec-10', x: 7, y: 32, width: 96 },
  { id: 'rec-11', x: 7, y: 64, width: 96 },
  { id: 'rec-12', x: 7, y: 96, width: 96 },
  { id: 'q1-10', x: 117, y: 32, width: 96 },
  { id: 'q1-11', x: 117, y: 64, width: 96 },
  { id: 'q1-12', x: 117, y: 96, width: 96 },
  { id: 'q2-11', x: 227, y: 32, width: 96 },
  { id: 'q2-12', x: 227, y: 64, width: 96 },
  { id: 'q2-10', x: 227, y: 96, width: 96 },
  { id: 'q3-12', x: 337, y: 32, width: 96 },
  { id: 'q3-10', x: 337, y: 64, width: 96 },
  { id: 'q3-11', x: 337, y: 96, width: 96 },
]

const wideGroups = [
  { id: 'server', x: 4, y: 8, width: 102, height: 128, labelX: 9, labelY: 21 },
  { id: 'q1', x: 114, y: 8, width: 102, height: 128, labelX: 119, labelY: 21 },
  { id: 'q2', x: 224, y: 8, width: 102, height: 128, labelX: 229, labelY: 21 },
  { id: 'q3', x: 334, y: 8, width: 102, height: 128, labelX: 339, labelY: 21 },
]

const records = ['rec-10', 'rec-11', 'rec-12']

// 시나리오마다 서버에 적힌 레코드와 그 질의의 답 상자가 선명하다. 레코드는 그대로이고 답의 차례만 질의마다 하나씩 돈다.
export const roundRobinAnswersScenarios: DiagramScenario[] = [
  { id: 'first', nodes: [...records, 'q1-10', 'q1-11', 'q1-12'], paths: [] },
  { id: 'second', nodes: [...records, 'q2-11', 'q2-12', 'q2-10'], paths: [] },
  { id: 'third', nodes: [...records, 'q3-12', 'q3-10', 'q3-11'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function RoundRobinAnswersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={roundRobinAnswersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 136' : '0 0 280 288'}>
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

          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="4" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
