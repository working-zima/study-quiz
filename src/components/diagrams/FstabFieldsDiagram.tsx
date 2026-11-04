import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-filesystem'].diagrams['fstab-fields']

// 세로형은 /etc/fstab의 예 한 줄을 칸 여섯으로 끊어, 칸마다 「칸 이름 | 값」 한 행으로 위에서 아래로 쌓는다.
// 행은 빈틈없이 잇고, 이름 칸 바로 오른쪽에 값 칸이 맞닿는다. 노드는 모두 회색이고 선은 없다.
const nodes = [
  { id: 'spec-name', x: 16, y: 30, width: 120 },
  { id: 'spec', x: 136, y: 30, width: 128 },
  { id: 'file-name', x: 16, y: 62, width: 120 },
  { id: 'file', x: 136, y: 62, width: 128 },
  { id: 'type-name', x: 16, y: 94, width: 120 },
  { id: 'type', x: 136, y: 94, width: 128 },
  { id: 'opts-name', x: 16, y: 126, width: 120 },
  { id: 'opts', x: 136, y: 126, width: 128 },
  { id: 'freq-name', x: 16, y: 158, width: 120 },
  { id: 'freq', x: 136, y: 158, width: 128 },
  { id: 'pass-name', x: 16, y: 190, width: 120 },
  { id: 'pass', x: 136, y: 190, width: 128 },
]

const groups = [
  { id: 'line', x: 8, y: 8, width: 264, height: 222, labelX: 16, labelY: 22 },
]

// 가로형은 시나리오의 짝대로 세 행이다. 행마다 「이름 | 값」 두 짝을 왼쪽부터 놓아, 왼쪽 위에서 오른쪽 아래로 읽으면 칸의 차례가 된다.
const wideNodes = [
  { id: 'spec-name', x: 16, y: 30, width: 112 },
  { id: 'spec', x: 128, y: 30, width: 88 },
  { id: 'file-name', x: 224, y: 30, width: 112 },
  { id: 'file', x: 336, y: 30, width: 88 },
  { id: 'type-name', x: 16, y: 62, width: 112 },
  { id: 'type', x: 128, y: 62, width: 88 },
  { id: 'opts-name', x: 224, y: 62, width: 112 },
  { id: 'opts', x: 336, y: 62, width: 88 },
  { id: 'freq-name', x: 16, y: 94, width: 112 },
  { id: 'freq', x: 128, y: 94, width: 88 },
  { id: 'pass-name', x: 224, y: 94, width: 112 },
  { id: 'pass', x: 336, y: 94, width: 88 },
]

const wideGroups = [
  { id: 'line', x: 8, y: 8, width: 424, height: 126, labelX: 16, labelY: 22 },
]

// 시나리오마다 칸 둘의 이름과 값이 선명하다. 세 시나리오를 합하면 열두 칸이 한 번씩 나온다.
export const fstabFieldsScenarios: DiagramScenario[] = [
  { id: 'what-where', nodes: ['spec-name', 'spec', 'file-name', 'file'], paths: [] },
  { id: 'how', nodes: ['type-name', 'type', 'opts-name', 'opts'], paths: [] },
  { id: 'check', nodes: ['freq-name', 'freq', 'pass-name', 'pass'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FstabFieldsDiagram() {
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
      scenarios={fstabFieldsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 142' : '0 0 280 238'}>
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
