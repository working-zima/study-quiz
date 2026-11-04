import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['ps-columns']

// 세로형은 ps -ef가 보인 backup.sh의 줄을 칸으로 끊어, 칸마다 「칸 이름 | 값」 한 행으로 위에서 아래로 쌓는다.
// 행은 빈틈없이 잇고, 이름 칸 바로 오른쪽에 값 칸이 맞닿는다. TTY 칸은 본문이 값을 예로 들지 않아 그리지 않는다. 선은 없다.
const nodes = [
  { id: 'uid-name', x: 16, y: 30, width: 88 },
  { id: 'uid', x: 104, y: 30, width: 160 },
  { id: 'pid-name', x: 16, y: 62, width: 88 },
  { id: 'pid', x: 104, y: 62, width: 160 },
  { id: 'ppid-name', x: 16, y: 94, width: 88 },
  { id: 'ppid', x: 104, y: 94, width: 160 },
  { id: 'c-name', x: 16, y: 126, width: 88 },
  { id: 'c', x: 104, y: 126, width: 160 },
  { id: 'stime-name', x: 16, y: 158, width: 88 },
  { id: 'stime', x: 104, y: 158, width: 160 },
  { id: 'time-name', x: 16, y: 190, width: 88 },
  { id: 'time', x: 104, y: 190, width: 160 },
  { id: 'cmd-name', x: 16, y: 222, width: 88 },
  { id: 'cmd', x: 104, y: 222, width: 160 },
]

const groups = [
  { id: 'line', x: 8, y: 8, width: 264, height: 254, labelX: 16, labelY: 22 },
]

// 가로형은 두 열이다. 왼쪽 열에 UID·PID·PPID·C를, 오른쪽 열에 STIME·TIME·CMD를 위에서부터 둔다.
// 오른쪽 열의 값 칸은 가장 긴 CMD 값이 들어가도록 더 넓다.
const wideNodes = [
  { id: 'uid-name', x: 16, y: 30, width: 56 },
  { id: 'uid', x: 72, y: 30, width: 120 },
  { id: 'pid-name', x: 16, y: 62, width: 56 },
  { id: 'pid', x: 72, y: 62, width: 120 },
  { id: 'ppid-name', x: 16, y: 94, width: 56 },
  { id: 'ppid', x: 72, y: 94, width: 120 },
  { id: 'c-name', x: 16, y: 126, width: 56 },
  { id: 'c', x: 72, y: 126, width: 120 },
  { id: 'stime-name', x: 208, y: 30, width: 64 },
  { id: 'stime', x: 272, y: 30, width: 152 },
  { id: 'time-name', x: 208, y: 62, width: 64 },
  { id: 'time', x: 272, y: 62, width: 152 },
  { id: 'cmd-name', x: 208, y: 94, width: 64 },
  { id: 'cmd', x: 272, y: 94, width: 152 },
]

const wideGroups = [
  { id: 'line', x: 8, y: 8, width: 424, height: 158, labelX: 16, labelY: 22 },
]

// 시나리오마다 칸 둘의 이름과 값이 선명하다. C 칸은 어느 시나리오에도 들지 않는다.
export const psColumnsScenarios: DiagramScenario[] = [
  { id: 'who', nodes: ['uid-name', 'uid', 'cmd-name', 'cmd'], paths: [] },
  { id: 'ids', nodes: ['pid-name', 'pid', 'ppid-name', 'ppid'], paths: [] },
  { id: 'time', nodes: ['stime-name', 'stime', 'time-name', 'time'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PsColumnsDiagram() {
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
      scenarios={psColumnsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 174' : '0 0 280 270'}>
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
