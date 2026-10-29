import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-addressing'].diagrams['mask-and']

// 세로형은 IP 주소, 서브넷 마스크, AND 결과를 위에서부터 세 줄로 놓는다. 줄마다 왼쪽은 점 10진 표기 상자, 오른쪽 두 칸은 넷째 옥텟의 앞 2비트와 뒤 6비트다.
// 두 비트 칸은 세 줄을 가로지르는 박스로 열을 묶는다. 줄 이름표는 그 줄 상자 바로 위에, 넷째 옥텟 곁말은 두 박스 위에 둔다.
const nodes = [
  { id: 'a-dot', x: 6, y: 40, width: 108 },
  { id: 'a-hi', x: 134, y: 40, width: 36 },
  { id: 'a-lo', x: 196, y: 40, width: 68 },
  { id: 'm-dot', x: 6, y: 96, width: 108 },
  { id: 'm-hi', x: 134, y: 96, width: 36 },
  { id: 'm-lo', x: 196, y: 96, width: 68 },
  { id: 'r-dot', x: 6, y: 152, width: 108 },
  { id: 'r-hi', x: 134, y: 152, width: 36 },
  { id: 'r-lo', x: 196, y: 152, width: 68 },
]

const groups = [
  { id: 'hi', x: 124, y: 18, width: 56, height: 172 },
  { id: 'lo', x: 186, y: 18, width: 88, height: 172 },
]

// 곁말은 어느 시나리오에서나 선명하다 — 줄 이름표가 흐려지면 어느 줄이 무엇인지 읽을 수 없다.
const notes = [
  { id: 'octet', x: 199, y: 12, anchor: 'middle' as const },
  { id: 'row-address', x: 6, y: 32, anchor: 'start' as const },
  { id: 'row-mask', x: 6, y: 88, anchor: 'start' as const },
  { id: 'row-result', x: 6, y: 144, anchor: 'start' as const },
]

// 가로형은 줄 이름표를 점 10진 표기 상자 왼쪽에 놓고, 줄 사이를 좁힌다.
const wideNodes = [
  { id: 'a-dot', x: 88, y: 40, width: 124 },
  { id: 'a-hi', x: 246, y: 40, width: 36 },
  { id: 'a-lo', x: 330, y: 40, width: 80 },
  { id: 'm-dot', x: 88, y: 80, width: 124 },
  { id: 'm-hi', x: 246, y: 80, width: 36 },
  { id: 'm-lo', x: 330, y: 80, width: 80 },
  { id: 'r-dot', x: 88, y: 120, width: 124 },
  { id: 'r-hi', x: 246, y: 120, width: 36 },
  { id: 'r-lo', x: 330, y: 120, width: 80 },
]

const wideGroups = [
  { id: 'hi', x: 228, y: 18, width: 72, height: 140 },
  { id: 'lo', x: 308, y: 18, width: 124, height: 140 },
]

const wideNotes = [
  { id: 'octet', x: 330, y: 12 },
  { id: 'row-address', x: 8, y: 59 },
  { id: 'row-mask', x: 8, y: 99 },
  { id: 'row-result', x: 8, y: 139 },
]

// 마스크가 1인 자리: 세 줄의 앞 2비트 칸이 선명하다. 마스크가 0인 자리: 세 줄의 뒤 6비트 칸이 선명하다. 결과: AND 결과 줄이 선명하다.
export const maskAndScenarios: DiagramScenario[] = [
  { id: 'keep', nodes: ['a-hi', 'm-hi', 'r-hi'], paths: [] },
  { id: 'clear', nodes: ['a-lo', 'm-lo', 'r-lo'], paths: [] },
  { id: 'result', nodes: ['r-dot', 'r-hi', 'r-lo'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function MaskAndDiagram() {
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
      scenarios={maskAndScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 164' : '0 0 280 196'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity="1">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
