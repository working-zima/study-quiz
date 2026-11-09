import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-udp'].diagrams['sequence-numbers']

// 세로형은 세그먼트를 보낸 차례대로 위에서 아래로 쌓는다. 맨 앞은 연결을 맺을 때 ISN을 알리는 SYN 세그먼트이고,
// 그 뒤 세그먼트 상자마다 헤더의 순서 번호 칸과 실은 데이터의 바이트 번호 칸을 맞붙여 둔다. 노드는 모두 회색이고 경로는 없다.
const nodes = [
  { id: 'syn', x: 16, y: 24, width: 120 },
  { id: 'seq-1', x: 16, y: 88, width: 112 },
  { id: 'bytes-1', x: 128, y: 88, width: 136 },
  { id: 'seq-2', x: 16, y: 152, width: 112 },
  { id: 'bytes-2', x: 128, y: 152, width: 136 },
  { id: 'seq-3', x: 16, y: 216, width: 112 },
  { id: 'bytes-3', x: 128, y: 216, width: 136 },
]

const groups = [
  { id: 'syn', x: 8, y: 4, width: 264, height: 56, labelX: 16, labelY: 18 },
  { id: 'seg-1', x: 8, y: 68, width: 264, height: 56, labelX: 16, labelY: 82 },
  { id: 'seg-2', x: 8, y: 132, width: 264, height: 56, labelX: 16, labelY: 146 },
  { id: 'seg-3', x: 8, y: 196, width: 264, height: 56, labelX: 16, labelY: 210 },
]

// 계산 곁말은 자기 시나리오에서만 보인다. 세로형은 그 계산이 가리키는 세그먼트 상자의 라벨 줄 오른쪽 끝에 붙는다.
const notes = [
  { id: 'next-calc', x: 264, y: 146, anchor: 'end' as const, scenarios: ['next'] },
  { id: 'isn-calc', x: 264, y: 82, anchor: 'end' as const, scenarios: ['isn'] },
]

// 가로형은 SYN 세그먼트를 위에 두고, 그 아래 세그먼트 셋을 보낸 차례대로 왼쪽에서 오른쪽으로 놓는다.
// 세그먼트 상자 안에서는 순서 번호 칸 아래에 데이터 칸을 맞붙인다.
const wideNodes = [
  { id: 'syn', x: 12, y: 24, width: 120 },
  { id: 'seq-1', x: 8, y: 88, width: 134 },
  { id: 'bytes-1', x: 8, y: 120, width: 134 },
  { id: 'seq-2', x: 153, y: 88, width: 134 },
  { id: 'bytes-2', x: 153, y: 120, width: 134 },
  { id: 'seq-3', x: 298, y: 88, width: 134 },
  { id: 'bytes-3', x: 298, y: 120, width: 134 },
]

const wideGroups = [
  { id: 'syn', x: 4, y: 4, width: 432, height: 56, labelX: 12, labelY: 18 },
  { id: 'seg-1', x: 4, y: 68, width: 142, height: 88, labelX: 12, labelY: 82 },
  { id: 'seg-2', x: 149, y: 68, width: 142, height: 88, labelX: 157, labelY: 82 },
  { id: 'seg-3', x: 294, y: 68, width: 142, height: 88, labelX: 302, labelY: 82 },
]

// 가로형의 계산 곁말은 그 세그먼트 상자 바로 아래, 같은 열에 놓인다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes = [
  { id: 'next-calc', x: 153, y: 172, anchor: 'start' as const },
  { id: 'isn-calc', x: 8, y: 172, anchor: 'start' as const },
]

// 첫 바이트: 첫째 세그먼트의 두 칸. 다음 번호: 첫째·둘째 세그먼트의 칸과 계산 곁말. 시작 번호: SYN 세그먼트와 첫째 세그먼트의 칸, 계산 곁말.
export const sequenceNumbersScenarios: DiagramScenario[] = [
  { id: 'first-byte', nodes: ['seq-1', 'bytes-1'], paths: [] },
  { id: 'next', nodes: ['seq-1', 'bytes-1', 'seq-2', 'bytes-2'], paths: [] },
  { id: 'isn', nodes: ['syn', 'seq-1', 'bytes-1'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SequenceNumbersDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.scenarios.includes(active.id)) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={sequenceNumbersScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 180' : '0 0 280 256'}>
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
