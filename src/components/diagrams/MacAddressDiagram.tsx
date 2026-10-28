import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId.ethernet.diagrams['mac-address']

// 두 배치 모두 주소 여섯 묶음을 왼쪽부터 빈틈없이 잇는다. 앞 세 칸은 24비트 접두사다.
const nodes = [
  { id: 'octet-1', x: 14, y: 32, width: 42 },
  { id: 'octet-2', x: 56, y: 32, width: 42 },
  { id: 'octet-3', x: 98, y: 32, width: 42 },
  { id: 'octet-4', x: 140, y: 32, width: 42 },
  { id: 'octet-5', x: 182, y: 32, width: 42 },
  { id: 'octet-6', x: 224, y: 32, width: 42 },
]
const wideNodes = [
  { id: 'octet-1', x: 28, y: 32, width: 64 },
  { id: 'octet-2', x: 92, y: 32, width: 64 },
  { id: 'octet-3', x: 156, y: 32, width: 64 },
  { id: 'octet-4', x: 220, y: 32, width: 64 },
  { id: 'octet-5', x: 284, y: 32, width: 64 },
  { id: 'octet-6', x: 348, y: 32, width: 64 },
]
const groups = [
  { id: 'prefix', x: 14, y: 8, width: 126, height: 64 },
  { id: 'remainder', x: 140, y: 8, width: 126, height: 64 },
]
const wideGroups = [
  { id: 'prefix', x: 28, y: 8, width: 192, height: 64 },
  { id: 'remainder', x: 220, y: 8, width: 192, height: 64 },
]
const notes = [
  { id: 'bits', x: 35, y: 88 },
  { id: 'individual', x: 14, y: 110 },
  { id: 'universal', x: 14, y: 126 },
]
const wideNotes = [
  { id: 'bits', x: 60, y: 88 },
  { id: 'individual', x: 28, y: 110 },
  { id: 'universal', x: 28, y: 126 },
]

export const macAddressScenarios: DiagramScenario[] = [
  { id: 'prefix', nodes: ['octet-1', 'octet-2', 'octet-3', 'octet-4', 'octet-5', 'octet-6'], paths: [] },
  { id: 'first-octet', nodes: ['octet-1'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MacAddressDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes : notes

  return (
    <DiagramFrame label={text.label} question={text.question} idleCaption={text.idleCaption} legend={text.legend}
      scenarios={macAddressScenarios} active={active} onSelect={setActive}>
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 136' : '0 0 280 136'}>
          {layoutGroups.map((group) => (
            <g key={group.id}>
              <rect data-group={group.id} className="fill-none stroke-border" x={group.x} y={group.y} width={group.width} height={group.height} strokeWidth="1.5" />
              <text data-group-label={group.id} className="fill-muted" x={group.x + group.width / 2} y="22" textAnchor="middle" fontSize="9">{text.groups?.[group.id]}</text>
            </g>
          ))}
          {layoutNodes.map((node) => (
            <g key={node.id} data-node={node.id} opacity={opacityOf(node.id)}>
              <rect className="fill-panel stroke-disabled" x={node.x} y={node.y} width={node.width} height="32" rx="0" strokeWidth="1.5" />
              <text className="fill-title" x={node.x + node.width / 2} y={node.y + 16} dominantBaseline="central" textAnchor="middle" fontSize="10">{text.nodes[node.id]}</text>
            </g>
          ))}
          {active?.id === 'first-octet' && layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} className="fill-muted" x={note.x} y={note.y} textAnchor={note.id === 'bits' ? 'middle' : 'start'} fontSize="9">{text.notes?.[note.id]}</text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
