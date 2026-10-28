import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId.ethernet.diagrams['ethernet-frame']

// 프리앰블부터 보내는 순서대로 빈틈없이 잇되, 프레임 경계는 목적지 주소부터다.
// 칸 크기는 바이트 수에 비례하지 않는다. 세로형은 위→아래, 가로형은 왼쪽→오른쪽이다.
const nodes = [
  { id: 'preamble', x: 24, y: 24, width: 140 },
  { id: 'destination', x: 24, y: 56, width: 140 },
  { id: 'source', x: 24, y: 88, width: 140 },
  { id: 'type-length', x: 24, y: 120, width: 140 },
  { id: 'data', x: 24, y: 152, width: 140 },
  { id: 'fcs', x: 24, y: 184, width: 140 },
]
const wideNodes = [
  { id: 'preamble', x: 6, y: 40, width: 74 },
  { id: 'destination', x: 80, y: 40, width: 90 },
  { id: 'source', x: 170, y: 40, width: 90 },
  { id: 'type-length', x: 260, y: 40, width: 78 },
  { id: 'data', x: 338, y: 40, width: 64 },
  { id: 'fcs', x: 402, y: 40, width: 32 },
]
const groups = [
  { id: 'frame', x: 14, y: 56, width: 252, height: 184, labelX: 24, labelY: 230 },
]
const wideGroups = [
  { id: 'frame', x: 80, y: 8, width: 354, height: 98, labelX: 90, labelY: 24 },
]
const notes = [
  { id: 'preamble', x: 178, y: 44 },
  { id: 'destination', x: 178, y: 76 },
  { id: 'source', x: 178, y: 108 },
  { id: 'type-length', x: 178, y: 140 },
  { id: 'data', x: 178, y: 172 },
  { id: 'fcs', x: 178, y: 204 },
]
const wideNotes = [
  { id: 'preamble', x: 43, y: 90 },
  { id: 'destination', x: 125, y: 90 },
  { id: 'source', x: 215, y: 90 },
  { id: 'type-length', x: 299, y: 90 },
  { id: 'data', x: 370, y: 90 },
  { id: 'fcs', x: 418, y: 90 },
]

export const ethernetFrameScenarios: DiagramScenario[] = [
  { id: 'header', nodes: ['destination', 'source', 'type-length'], paths: [] },
  { id: 'payload', nodes: ['data'], paths: [] },
  { id: 'trailer', nodes: ['fcs'], paths: [] },
  { id: 'preamble', nodes: ['preamble'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function EthernetFrameDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend}
      scenarios={ethernetFrameScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 112' : '0 0 280 248'}>
          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-border" x={group.x} y={group.y} width={group.width} height={group.height} strokeWidth="1.5" />
              <text data-group-label={group.id} className="fill-muted" x={group.labelX} y={group.labelY} fontSize="9">{text.groups?.[group.id]}</text>
            </g>
          ))}
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="0" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">{text.nodes[node.id]}</text>
            </g>
          ))}
          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} className="fill-muted" x={note.x} y={note.y} textAnchor={wide ? 'middle' : 'start'} fontSize="9" opacity={opacityOf(note.id)}>{text.notes?.[note.id]}</text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
