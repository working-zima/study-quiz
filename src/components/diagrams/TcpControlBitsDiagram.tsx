import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['tcp-udp'].diagrams['tcp-control-bits']

// 세로형은 280 폭 한 줄에 아홉 칸이 들지 않아, 헤더의 차례대로 세 칸씩 세 줄로 빈틈없이 잇는다(칸을 이은 표 모양).
// 칸 하나가 1비트이고, 칸 묶음의 라벨이 9비트임을 밝힌다. 노드는 모두 회색이고 경로는 없다.
const nodes = [
  { id: 'ae', x: 8, y: 24, width: 88 },
  { id: 'cwr', x: 96, y: 24, width: 88 },
  { id: 'ece', x: 184, y: 24, width: 88 },
  { id: 'urg', x: 8, y: 56, width: 88 },
  { id: 'ack', x: 96, y: 56, width: 88 },
  { id: 'psh', x: 184, y: 56, width: 88 },
  { id: 'rst', x: 8, y: 88, width: 88 },
  { id: 'syn', x: 96, y: 88, width: 88 },
  { id: 'fin', x: 184, y: 88, width: 88 },
]

const groups = [
  { id: 'bits', x: 4, y: 4, width: 272, height: 120, labelX: 14, labelY: 18 },
]

// 뜻의 곁말은 자기 시나리오에서만 보이고, 칸 묶음 아래 가운데에 놓인다.
const notes = [
  { id: 'start', x: 140, y: 144 },
  { id: 'confirm', x: 140, y: 144 },
  { id: 'finish', x: 140, y: 144 },
  { id: 'reset', x: 140, y: 144 },
]

// 가로형은 넓어진 폭으로 아홉 칸을 한 줄에 둔다.
const wideNodes = [
  { id: 'ae', x: 8, y: 24, width: 47 },
  { id: 'cwr', x: 55, y: 24, width: 47 },
  { id: 'ece', x: 102, y: 24, width: 47 },
  { id: 'urg', x: 149, y: 24, width: 47 },
  { id: 'ack', x: 196, y: 24, width: 47 },
  { id: 'psh', x: 243, y: 24, width: 47 },
  { id: 'rst', x: 290, y: 24, width: 47 },
  { id: 'syn', x: 337, y: 24, width: 47 },
  { id: 'fin', x: 384, y: 24, width: 47 },
]

const wideGroups = [
  { id: 'bits', x: 4, y: 4, width: 432, height: 60, labelX: 14, labelY: 18 },
]

const wideNotes = [
  { id: 'start', x: 220, y: 84 },
  { id: 'confirm', x: 220, y: 84 },
  { id: 'finish', x: 220, y: 84 },
  { id: 'reset', x: 220, y: 84 },
]

// 자주 쓰는 비트 넷을 하나씩 고른다. 칸 그림이라 화살표가 없다. 시나리오 id가 곧 그 시나리오의 곁말 id다.
export const tcpControlBitsScenarios: DiagramScenario[] = [
  { id: 'start', nodes: ['syn'], paths: [] },
  { id: 'confirm', nodes: ['ack'], paths: [] },
  { id: 'finish', nodes: ['fin'], paths: [] },
  { id: 'reset', nodes: ['rst'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function TcpControlBitsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes
  const shownNotes = active ? layoutNotes.filter((note) => note.id === active.id) : []

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={tcpControlBitsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 96' : '0 0 280 156'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
