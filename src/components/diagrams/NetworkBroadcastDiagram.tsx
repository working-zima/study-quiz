import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-addressing'].diagrams['network-broadcast']

// 세로형은 네트워크의 주소를 위에서 아래로 커지는 차례로 놓는다. 맨 위 네트워크 주소와 맨 아래 브로드캐스트 주소는 박스 밖에,
// 그 사이 첫 주소·줄임(…)·끝 주소는 「호스트에 붙일 수 있는 주소」 박스 안에 둔다. 두 주소의 이름과 호스트 부분 비트는 상자 오른쪽 곁말이다.
const nodes = [
  { id: 'net', x: 12, y: 8, width: 96 },
  { id: 'first', x: 12, y: 74, width: 96 },
  { id: 'gap', x: 44, y: 114, width: 32 },
  { id: 'last', x: 12, y: 154, width: 96 },
  { id: 'broadcast', x: 12, y: 206, width: 96 },
]

const groups = [
  { id: 'hosts', x: 4, y: 52, width: 272, height: 142, labelX: 14, labelY: 66 },
]

// 곁말은 자기 주소의 흐림을 따른다. 개수 곁말은 첫 주소를 따른다.
const notes = [
  { id: 'net-role', owner: 'net', x: 120, y: 21, anchor: 'start' as const },
  { id: 'net-bits', owner: 'net', x: 120, y: 34, anchor: 'start' as const },
  { id: 'count', owner: 'first', x: 190, y: 134, anchor: 'middle' as const },
  { id: 'broadcast-role', owner: 'broadcast', x: 120, y: 219, anchor: 'start' as const },
  { id: 'broadcast-bits', owner: 'broadcast', x: 120, y: 232, anchor: 'start' as const },
]

// 가로형은 주소를 왼쪽에서 오른쪽으로 커지는 차례로 놓고, 두 주소의 이름과 비트는 상자 아래 곁말로 둔다.
const wideNodes = [
  { id: 'net', x: 8, y: 40, width: 96 },
  { id: 'first', x: 120, y: 40, width: 84 },
  { id: 'gap', x: 210, y: 40, width: 20 },
  { id: 'last', x: 236, y: 40, width: 84 },
  { id: 'broadcast', x: 336, y: 40, width: 96 },
]

const wideGroups = [
  { id: 'hosts', x: 112, y: 8, width: 216, height: 104, labelX: 122, labelY: 22 },
]

const wideNotes = [
  { id: 'net-role', x: 56, y: 88, anchor: 'middle' as const },
  { id: 'net-bits', x: 56, y: 102, anchor: 'middle' as const },
  { id: 'count', x: 220, y: 96, anchor: 'middle' as const },
  { id: 'broadcast-role', x: 384, y: 88, anchor: 'middle' as const },
  { id: 'broadcast-bits', x: 384, y: 102, anchor: 'middle' as const },
]

// 네트워크 주소: 첫 주소만 선명하다. 호스트에 붙일 주소: 박스 안의 세 상자가 선명하다. 브로드캐스트 주소: 끝 주소만 선명하다.
export const networkBroadcastScenarios: DiagramScenario[] = [
  { id: 'network-address', nodes: ['net'], paths: [] },
  { id: 'hosts', nodes: ['first', 'gap', 'last'], paths: [] },
  { id: 'broadcast', nodes: ['broadcast'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NetworkBroadcastDiagram() {
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
      scenarios={networkBroadcastScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 120' : '0 0 280 246'}>
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

          {layoutNotes.map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
