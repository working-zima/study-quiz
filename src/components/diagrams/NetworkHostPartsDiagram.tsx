import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-addressing'].diagrams['network-host-parts']

// 세로형은 호스트 A의 주소와 호스트 B의 주소를 옥텟 넷씩 두 줄로 놓는다. 앞 세 열은 네트워크 부분 박스에, 넷째 열은 호스트 부분 박스에 든다.
// 줄 이름표는 두 박스 밖 왼쪽에 둔다. 박스 아래 곁말은 이 예에서 정한 경계의 비트 수다. 이어진 칸 자체가 차례를 보이므로 화살표는 두지 않는다.
const nodes = [
  { id: 'a-1', x: 69, y: 28, width: 40 },
  { id: 'a-2', x: 115, y: 28, width: 40 },
  { id: 'a-3', x: 161, y: 28, width: 40 },
  { id: 'a-4', x: 225, y: 28, width: 40 },
  { id: 'b-1', x: 69, y: 68, width: 40 },
  { id: 'b-2', x: 115, y: 68, width: 40 },
  { id: 'b-3', x: 161, y: 68, width: 40 },
  { id: 'b-4', x: 225, y: 68, width: 40 },
]

const groups = [
  { id: 'network', x: 62, y: 4, width: 146, height: 104 },
  { id: 'host', x: 214, y: 4, width: 62, height: 104 },
]

// 줄 이름표는 어느 시나리오에서나 선명하다. 비트 수 곁말은 자기 박스의 첫 줄 옥텟의 흐림을 따른다.
const notes = [
  { id: 'row-a', owner: null, x: 32, y: 47 },
  { id: 'row-b', owner: null, x: 32, y: 87 },
  { id: 'network-bits', owner: 'a-1', x: 135, y: 124 },
  { id: 'host-bits', owner: 'a-4', x: 245, y: 124 },
]

// 가로형은 같은 짜임에서 옥텟과 박스를 넓힌다.
const wideNodes = [
  { id: 'a-1', x: 94, y: 28, width: 64 },
  { id: 'a-2', x: 166, y: 28, width: 64 },
  { id: 'a-3', x: 238, y: 28, width: 64 },
  { id: 'a-4', x: 348, y: 28, width: 64 },
  { id: 'b-1', x: 94, y: 68, width: 64 },
  { id: 'b-2', x: 166, y: 68, width: 64 },
  { id: 'b-3', x: 238, y: 68, width: 64 },
  { id: 'b-4', x: 348, y: 68, width: 64 },
]

const wideGroups = [
  { id: 'network', x: 80, y: 4, width: 236, height: 104 },
  { id: 'host', x: 324, y: 4, width: 112, height: 104 },
]

const wideNotes = [
  { id: 'row-a', x: 44, y: 47 },
  { id: 'row-b', x: 44, y: 87 },
  { id: 'network-bits', x: 198, y: 124 },
  { id: 'host-bits', x: 380, y: 124 },
]

// 네트워크 부분: 두 줄의 앞 세 옥텟이 선명하다. 호스트 부분: 두 줄의 넷째 옥텟이 선명하다.
export const networkHostPartsScenarios: DiagramScenario[] = [
  { id: 'network', nodes: ['a-1', 'a-2', 'a-3', 'b-1', 'b-2', 'b-3'], paths: [] },
  { id: 'host', nodes: ['a-4', 'b-4'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function NetworkHostPartsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string | null) => (active && id !== null && !active.nodes.includes(id) ? 0.25 : 1)
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
      scenarios={networkHostPartsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 132' : '0 0 280 132'}>
          <g className="fill-none stroke-disabled" strokeWidth="1">
            {layoutGroups.map((group) => (
              <rect key={group.id} data-group={group.id} x={group.x} y={group.y} width={group.width} height={group.height} rx="4" />
            ))}
          </g>
          {layoutGroups.map((group) => (
            <text key={group.id} data-group-label={group.id} x={group.x + group.width / 2} y={group.y + 14} textAnchor="middle" className="fill-muted" fontSize="9">
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor="middle" className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
