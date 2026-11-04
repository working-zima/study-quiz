import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['crontab-fields']

// 세로형은 테두리 「시간 칸 다섯」 안에 칸 이름 다섯을 한 줄로 잇고, 그 바로 아래에 칸마다 적은 값을 맞닿게 둔다.
// 왼쪽부터 분·시·일·월·요일 차례이고, 명령 칸은 테두리 밖 아래에 이름과 값을 위아래로 둔다. 노드는 모두 회색이고 선은 없다.
const nodes = [
  { id: 'min-name', x: 20, y: 30, width: 48 },
  { id: 'min', x: 20, y: 62, width: 48 },
  { id: 'hour-name', x: 68, y: 30, width: 48 },
  { id: 'hour', x: 68, y: 62, width: 48 },
  { id: 'day-name', x: 116, y: 30, width: 48 },
  { id: 'day', x: 116, y: 62, width: 48 },
  { id: 'month-name', x: 164, y: 30, width: 48 },
  { id: 'month', x: 164, y: 62, width: 48 },
  { id: 'dow-name', x: 212, y: 30, width: 48 },
  { id: 'dow', x: 212, y: 62, width: 48 },
  { id: 'cmd-name', x: 20, y: 132, width: 240 },
  { id: 'command', x: 20, y: 164, width: 240 },
]

const groups = [
  { id: 'fields', x: 8, y: 8, width: 264, height: 94, labelX: 16, labelY: 22 },
]

// 곁말은 시나리오마다 하나이고, 그 시나리오가 밝히는 값 칸들의 가운데 아래에 둔다. 명령 시나리오에는 곁말이 없다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'time', x: 68, y: 120, anchor: 'middle', scenarios: ['time'] },
  { id: 'every', x: 164, y: 120, anchor: 'middle', scenarios: ['every'] },
  { id: 'weekday', x: 236, y: 120, anchor: 'middle', scenarios: ['weekday'] },
]

// 가로형은 crontab 한 줄처럼 여섯 칸을 한 줄에 둔다. 시간 칸 다섯은 테두리 안, 명령 칸은 그 오른쪽 테두리 밖이다.
const wideNodes = [
  { id: 'min-name', x: 16, y: 30, width: 48 },
  { id: 'min', x: 16, y: 62, width: 48 },
  { id: 'hour-name', x: 64, y: 30, width: 48 },
  { id: 'hour', x: 64, y: 62, width: 48 },
  { id: 'day-name', x: 112, y: 30, width: 48 },
  { id: 'day', x: 112, y: 62, width: 48 },
  { id: 'month-name', x: 160, y: 30, width: 48 },
  { id: 'month', x: 160, y: 62, width: 48 },
  { id: 'dow-name', x: 208, y: 30, width: 48 },
  { id: 'dow', x: 208, y: 62, width: 48 },
  { id: 'cmd-name', x: 272, y: 30, width: 160 },
  { id: 'command', x: 272, y: 62, width: 160 },
]

const wideGroups = [
  { id: 'fields', x: 8, y: 8, width: 256, height: 94, labelX: 16, labelY: 22 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'time', x: 64, y: 120, anchor: 'middle' },
  { id: 'every', x: 160, y: 120, anchor: 'middle' },
  { id: 'weekday', x: 232, y: 120, anchor: 'middle' },
]

// 시나리오마다 칸의 이름과 값이 함께 선명하다. 네 시나리오를 합하면 열두 칸이 한 번씩 나온다.
export const crontabFieldsScenarios: DiagramScenario[] = [
  { id: 'time', nodes: ['min-name', 'min', 'hour-name', 'hour'], paths: [] },
  { id: 'every', nodes: ['day-name', 'day', 'month-name', 'month'], paths: [] },
  { id: 'weekday', nodes: ['dow-name', 'dow'], paths: [] },
  { id: 'command', nodes: ['cmd-name', 'command'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CrontabFieldsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={crontabFieldsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 128' : '0 0 280 204'}>
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

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
