import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['protocols-encapsulation'].diagrams['decapsulation-peel']

// 받은 데이터 한 덩어리를 모서리 없는 칸으로 앞에서부터 빈틈없이 이어 붙인다. 칸 이름과 폭은 캡슐화 도식의 프레임 줄과 같다.
// 세로형은 280 안에 여섯 칸이 들어가지 않아 헤더 넷과 데이터·트레일러 두 줄로 나눈다. 노드는 모두 회색이다.
const nodes = [
  { id: 'ethernet', x: 12, y: 32, width: 70 },
  { id: 'ip', x: 82, y: 32, width: 50 },
  { id: 'tcp', x: 132, y: 32, width: 56 },
  { id: 'http', x: 188, y: 32, width: 62 },
  { id: 'data', x: 12, y: 68, width: 48 },
  { id: 'trailer', x: 60, y: 68, width: 54 },
]

// 지금 떼는 칸을 가리키는 곁말은 칸 바로 위 가운데에 둔다. 트레일러만 두 번째 줄 오른쪽에 둔다.
// 응용 프로그램에 닿는다는 곁말은 데이터 칸 바로 아래에 둔다.
const notes = [
  { id: 'detach-ethernet', x: 47, y: 27, textAnchor: 'middle' as const },
  { id: 'detach-ip', x: 107, y: 27, textAnchor: 'middle' as const },
  { id: 'detach-tcp', x: 160, y: 27, textAnchor: 'middle' as const },
  { id: 'detach-http', x: 219, y: 27, textAnchor: 'middle' as const },
  { id: 'detach-trailer', x: 122, y: 87, textAnchor: 'start' as const },
  { id: 'arrive-data', x: 12, y: 114, textAnchor: 'start' as const },
]

// 가로형은 여섯 칸을 한 줄로 가운데에 둔다.
const wideNodes = [
  { id: 'ethernet', x: 50, y: 32, width: 70 },
  { id: 'ip', x: 120, y: 32, width: 50 },
  { id: 'tcp', x: 170, y: 32, width: 56 },
  { id: 'http', x: 226, y: 32, width: 62 },
  { id: 'data', x: 288, y: 32, width: 48 },
  { id: 'trailer', x: 336, y: 32, width: 54 },
]

const wideNotes = [
  { id: 'detach-ethernet', x: 85, y: 27, textAnchor: 'middle' as const },
  { id: 'detach-ip', x: 145, y: 27, textAnchor: 'middle' as const },
  { id: 'detach-tcp', x: 198, y: 27, textAnchor: 'middle' as const },
  { id: 'detach-http', x: 257, y: 27, textAnchor: 'middle' as const },
  { id: 'detach-trailer', x: 363, y: 27, textAnchor: 'middle' as const },
  { id: 'arrive-data', x: 312, y: 78, textAnchor: 'middle' as const },
]

// nodes에는 그 계층에 닿았을 때 아직 남아 있는 칸(지금 떼는 칸 포함)을 적는다. 앞 계층이 이미 뗀 칸은 흐려진다.
// 지금 떼는 칸과 남은 칸은 곁말로 갈린다. 이 도식에는 화살표가 없다.
const scenarioNotes: Record<string, string[]> = {
  'network-access': ['detach-ethernet', 'detach-trailer'],
  internet: ['detach-ip'],
  transport: ['detach-tcp'],
  application: ['detach-http', 'arrive-data'],
}

export const decapsulationScenarios: DiagramScenario[] = [
  { id: 'network-access', nodes: ['ethernet', 'ip', 'tcp', 'http', 'data', 'trailer'], paths: [] },
  { id: 'internet', nodes: ['ip', 'tcp', 'http', 'data'], paths: [] },
  { id: 'transport', nodes: ['tcp', 'http', 'data'], paths: [] },
  { id: 'application', nodes: ['http', 'data'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DecapsulationDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutNotes = (wide ? wideNotes : notes).filter((note) => active && scenarioNotes[active.id].includes(note.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={decapsulationScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 88' : '0 0 280 124'}>
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="0" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">
                {text.nodes[node.id]}
              </text>
            </g>
          ))}

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.textAnchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
