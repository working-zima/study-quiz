import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['top-screen']

// 세로형은 top 화면을 위에서 아래로 그린다. 위 테두리(요약 영역)에 칸 넷을 두 줄로,
// 아래 테두리(작업 영역)에 프로세스 줄 셋을 %CPU가 큰 것부터 두고, 줄마다 이름 칸 바로 오른쪽에 %CPU 칸이 맞닿는다.
// ps와 top을 견준 두 칸은 테두리 밖 맨 아래에 나란히 둔다. 선은 없다.
const nodes = [
  { id: 'uptime', x: 16, y: 30, width: 120 },
  { id: 'task-count', x: 144, y: 30, width: 120 },
  { id: 'cpu', x: 16, y: 70, width: 120 },
  { id: 'memory', x: 144, y: 70, width: 120 },
  { id: 'row1', x: 16, y: 144, width: 144 },
  { id: 'row1-cpu', x: 160, y: 144, width: 104 },
  { id: 'row2', x: 16, y: 176, width: 144 },
  { id: 'row2-cpu', x: 160, y: 176, width: 104 },
  { id: 'row3', x: 16, y: 208, width: 144 },
  { id: 'row3-cpu', x: 160, y: 208, width: 104 },
  { id: 'ps', x: 8, y: 260, width: 128 },
  { id: 'top', x: 144, y: 260, width: 128 },
]

const groups = [
  { id: 'summary', x: 8, y: 8, width: 264, height: 102, labelX: 16, labelY: 22 },
  { id: 'tasks', x: 8, y: 122, width: 264, height: 126, labelX: 16, labelY: 136 },
]

// 가로형은 요약 영역의 칸 넷을 맨 위 한 줄에 두고, 그 아래 왼쪽에 작업 영역을, 오른쪽 테두리 밖에 견준 두 칸을 세로로 둔다.
const wideNodes = [
  { id: 'uptime', x: 16, y: 30, width: 96 },
  { id: 'task-count', x: 120, y: 30, width: 96 },
  { id: 'cpu', x: 224, y: 30, width: 96 },
  { id: 'memory', x: 328, y: 30, width: 96 },
  { id: 'row1', x: 16, y: 104, width: 144 },
  { id: 'row1-cpu', x: 160, y: 104, width: 104 },
  { id: 'row2', x: 16, y: 136, width: 144 },
  { id: 'row2-cpu', x: 160, y: 136, width: 104 },
  { id: 'row3', x: 16, y: 168, width: 144 },
  { id: 'row3-cpu', x: 160, y: 168, width: 104 },
  { id: 'ps', x: 296, y: 112, width: 128 },
  { id: 'top', x: 296, y: 160, width: 128 },
]

const wideGroups = [
  { id: 'summary', x: 8, y: 8, width: 424, height: 62, labelX: 16, labelY: 22 },
  { id: 'tasks', x: 8, y: 82, width: 272, height: 126, labelX: 16, labelY: 96 },
]

// 시나리오마다 한 영역의 칸만 선명하다. 다시 그리기는 테두리 밖 견준 두 칸이다.
export const topScreenScenarios: DiagramScenario[] = [
  { id: 'summary', nodes: ['uptime', 'task-count', 'cpu', 'memory'], paths: [] },
  { id: 'tasks', nodes: ['row1', 'row1-cpu', 'row2', 'row2-cpu', 'row3', 'row3-cpu'], paths: [] },
  { id: 'refresh', nodes: ['ps', 'top'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TopScreenDiagram() {
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
      scenarios={topScreenScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 216' : '0 0 280 300'}>
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
