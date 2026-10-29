import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-addressing'].diagrams['subnet-mask']

// 세로형은 위 줄에 IP 주소 192.0.2.1의 옥텟 넷, 아래 줄에 서브넷 마스크 255.255.255.0의 옥텟 넷을 열을 맞춰 놓는다.
// 앞 세 열은 네트워크 부분 박스에, 넷째 열은 호스트 부분 박스에 든다. 줄 이름표는 두 박스 밖 왼쪽에, 2진수와 접두사 길이 곁말은 박스 아래에 둔다.
const nodes = [
  { id: 'a-1', x: 82, y: 28, width: 36 },
  { id: 'a-2', x: 124, y: 28, width: 36 },
  { id: 'a-3', x: 166, y: 28, width: 36 },
  { id: 'a-4', x: 226, y: 28, width: 36 },
  { id: 'm-1', x: 82, y: 68, width: 36 },
  { id: 'm-2', x: 124, y: 68, width: 36 },
  { id: 'm-3', x: 166, y: 68, width: 36 },
  { id: 'm-4', x: 226, y: 68, width: 36 },
]

const groups = [
  { id: 'network', x: 76, y: 4, width: 132, height: 104 },
  { id: 'host', x: 214, y: 4, width: 60, height: 104 },
]

// 곁말의 흐림: 줄 이름표는 늘 선명하다. 2진수 곁말은 점 10진 버튼에서, 접두사 길이 곁말은 접두사 길이 버튼에서만 선명하다(「전체」에서는 모두 선명하다).
const notes = [
  { id: 'row-address', scenario: null, x: 4, y: 47, anchor: 'start' as const },
  { id: 'row-mask', scenario: null, x: 4, y: 87, anchor: 'start' as const },
  { id: 'ones', scenario: 'dotted', x: 142, y: 124, anchor: 'middle' as const },
  { id: 'zeros', scenario: 'dotted', x: 244, y: 124, anchor: 'middle' as const },
  { id: 'prefix', scenario: 'prefix', x: 142, y: 140, anchor: 'middle' as const },
]

// 가로형은 같은 짜임에서 옥텟과 박스를 넓힌다.
const wideNodes = [
  { id: 'a-1', x: 104, y: 28, width: 60 },
  { id: 'a-2', x: 172, y: 28, width: 60 },
  { id: 'a-3', x: 240, y: 28, width: 60 },
  { id: 'a-4', x: 344, y: 28, width: 60 },
  { id: 'm-1', x: 104, y: 68, width: 60 },
  { id: 'm-2', x: 172, y: 68, width: 60 },
  { id: 'm-3', x: 240, y: 68, width: 60 },
  { id: 'm-4', x: 344, y: 68, width: 60 },
]

const wideGroups = [
  { id: 'network', x: 96, y: 4, width: 212, height: 104 },
  { id: 'host', x: 316, y: 4, width: 116, height: 104 },
]

const wideNotes = [
  { id: 'row-address', x: 12, y: 47 },
  { id: 'row-mask', x: 12, y: 87 },
  { id: 'ones', x: 202, y: 124 },
  { id: 'zeros', x: 374, y: 124 },
  { id: 'prefix', x: 202, y: 140 },
]

// 점 10진: 마스크 줄 넷이 선명하다. 접두사 길이: 마스크의 1이 덮는 열, 곧 두 줄의 앞 세 옥텟이 선명하다.
export const subnetMaskScenarios: DiagramScenario[] = [
  { id: 'dotted', nodes: ['m-1', 'm-2', 'm-3', 'm-4'], paths: [] },
  { id: 'prefix', nodes: ['a-1', 'a-2', 'a-3', 'm-1', 'm-2', 'm-3'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function SubnetMaskDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const noteOpacity = (scenario: string | null) => (active && scenario && active.id !== scenario ? 0.25 : 1)
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
      scenarios={subnetMaskScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 148' : '0 0 280 148'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={noteOpacity(note.scenario)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
