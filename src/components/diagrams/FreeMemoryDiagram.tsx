import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-process-boot'].diagrams['free-memory']

// 세로형은 free가 보인 칸을 「칸 이름 | 값」 한 행씩 위에서 아래로 쌓는다. 메모리 쪽 여섯 칸을 위 테두리에,
// 스왑 쪽 세 칸을 아래 테두리에 둔다. 행은 빈틈없이 잇고 이름 칸 바로 오른쪽에 값 칸이 맞닿는다. 선은 없다.
const nodes = [
  { id: 'mem-total-name', x: 16, y: 30, width: 88 },
  { id: 'mem-total', x: 104, y: 30, width: 160 },
  { id: 'mem-used-name', x: 16, y: 62, width: 88 },
  { id: 'mem-used', x: 104, y: 62, width: 160 },
  { id: 'mem-free-name', x: 16, y: 94, width: 88 },
  { id: 'mem-free', x: 104, y: 94, width: 160 },
  { id: 'mem-shared-name', x: 16, y: 126, width: 88 },
  { id: 'mem-shared', x: 104, y: 126, width: 160 },
  { id: 'mem-cache-name', x: 16, y: 158, width: 88 },
  { id: 'mem-cache', x: 104, y: 158, width: 160 },
  { id: 'mem-avail-name', x: 16, y: 190, width: 88 },
  { id: 'mem-avail', x: 104, y: 190, width: 160 },
  { id: 'swap-total-name', x: 16, y: 276, width: 88 },
  { id: 'swap-total', x: 104, y: 276, width: 160 },
  { id: 'swap-used-name', x: 16, y: 308, width: 88 },
  { id: 'swap-used', x: 104, y: 308, width: 160 },
  { id: 'swap-free-name', x: 16, y: 340, width: 88 },
  { id: 'swap-free', x: 104, y: 340, width: 160 },
]

const groups = [
  { id: 'mem', x: 8, y: 8, width: 264, height: 222, labelX: 16, labelY: 22 },
  { id: 'swap', x: 8, y: 254, width: 264, height: 126, labelX: 16, labelY: 268 },
]

// used의 셈은 두 테두리 사이에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'calc', x: 140, y: 246, anchor: 'middle', scenarios: ['used'] },
]

// 가로형은 메모리 쪽 여섯 칸을 두 열(왼쪽 total·used·free, 오른쪽 shared·buff/cache·available)로,
// 스왑 쪽 세 칸을 아래 테두리에 한 줄로 둔다.
const wideNodes = [
  { id: 'mem-total-name', x: 16, y: 30, width: 80 },
  { id: 'mem-total', x: 96, y: 30, width: 112 },
  { id: 'mem-used-name', x: 16, y: 62, width: 80 },
  { id: 'mem-used', x: 96, y: 62, width: 112 },
  { id: 'mem-free-name', x: 16, y: 94, width: 80 },
  { id: 'mem-free', x: 96, y: 94, width: 112 },
  { id: 'mem-shared-name', x: 224, y: 30, width: 88 },
  { id: 'mem-shared', x: 312, y: 30, width: 112 },
  { id: 'mem-cache-name', x: 224, y: 62, width: 88 },
  { id: 'mem-cache', x: 312, y: 62, width: 112 },
  { id: 'mem-avail-name', x: 224, y: 94, width: 88 },
  { id: 'mem-avail', x: 312, y: 94, width: 112 },
  { id: 'swap-total-name', x: 16, y: 184, width: 56 },
  { id: 'swap-total', x: 72, y: 184, width: 80 },
  { id: 'swap-used-name', x: 160, y: 184, width: 56 },
  { id: 'swap-used', x: 216, y: 184, width: 72 },
  { id: 'swap-free-name', x: 296, y: 184, width: 56 },
  { id: 'swap-free', x: 352, y: 184, width: 72 },
]

const wideGroups = [
  { id: 'mem', x: 8, y: 8, width: 424, height: 126, labelX: 16, labelY: 22 },
  { id: 'swap', x: 8, y: 162, width: 424, height: 62, labelX: 16, labelY: 176 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'calc', x: 220, y: 154, anchor: 'middle' },
]

// 시나리오마다 칸 셋의 이름과 값이 선명하다. used는 total·used·available, free와 available은 free·buff/cache·available, 스왑은 스왑 쪽 세 칸이다.
export const freeMemoryScenarios: DiagramScenario[] = [
  { id: 'used', nodes: ['mem-total-name', 'mem-total', 'mem-used-name', 'mem-used', 'mem-avail-name', 'mem-avail'], paths: [] },
  { id: 'available', nodes: ['mem-free-name', 'mem-free', 'mem-cache-name', 'mem-cache', 'mem-avail-name', 'mem-avail'], paths: [] },
  { id: 'swap', nodes: ['swap-total-name', 'swap-total', 'swap-used-name', 'swap-used', 'swap-free-name', 'swap-free'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function FreeMemoryDiagram() {
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
      scenarios={freeMemoryScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 388'}>
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
