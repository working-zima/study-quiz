import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['ip-addressing'].diagrams['cidr-boundary']

// 세로형은 같은 주소 192.0.2.0을 두 줄로 놓는다. 위 줄은 클래스 방식의 경계(24비트), 아래 줄은 192.0.2.0/26의 경계(26비트)이고,
// 넷째 옥텟은 2진수로 펼쳐 아래 줄에서는 앞 2비트와 뒤 6비트로 나눈다. 줄마다 네트워크 부분 박스와 호스트 부분 박스가 경계를 보인다.
// 줄 제목은 줄 위에, 개수 곁말은 줄 아래에 둔다.
const nodes = [
  { id: 'c-1', x: 10, y: 40, width: 40 },
  { id: 'c-2', x: 56, y: 40, width: 34 },
  { id: 'c-3', x: 96, y: 40, width: 32 },
  { id: 'c-4', x: 146, y: 40, width: 124 },
  { id: 'v-1', x: 10, y: 144, width: 40 },
  { id: 'v-2', x: 56, y: 144, width: 34 },
  { id: 'v-3', x: 96, y: 144, width: 32 },
  { id: 'v-4', x: 134, y: 144, width: 34 },
  { id: 'v-5', x: 186, y: 144, width: 84 },
]

const groups = [
  { id: 'classful-network', x: 4, y: 18, width: 130, height: 60 },
  { id: 'classful-host', x: 140, y: 18, width: 136, height: 60 },
  { id: 'classless-network', x: 4, y: 122, width: 170, height: 60 },
  { id: 'classless-host', x: 180, y: 122, width: 96, height: 60 },
]

// 곁말은 자기 줄의 첫 옥텟 상자의 흐림을 따른다.
const notes = [
  { id: 'classful-title', owner: 'c-1', x: 8, y: 12, anchor: 'start' as const },
  { id: 'classful-count', owner: 'c-1', x: 8, y: 92, anchor: 'start' as const },
  { id: 'classless-title', owner: 'v-1', x: 8, y: 116, anchor: 'start' as const },
  { id: 'classless-count', owner: 'v-1', x: 8, y: 196, anchor: 'start' as const },
]

// 가로형은 같은 짜임에서 상자를 넓히고, 줄 제목과 개수 곁말을 줄 위 한 줄의 왼쪽 끝과 오른쪽 끝에 놓는다.
const wideNodes = [
  { id: 'c-1', x: 16, y: 40, width: 60 },
  { id: 'c-2', x: 84, y: 40, width: 52 },
  { id: 'c-3', x: 144, y: 40, width: 52 },
  { id: 'c-4', x: 220, y: 40, width: 204 },
  { id: 'v-1', x: 16, y: 126, width: 60 },
  { id: 'v-2', x: 84, y: 126, width: 52 },
  { id: 'v-3', x: 144, y: 126, width: 52 },
  { id: 'v-4', x: 204, y: 126, width: 52 },
  { id: 'v-5', x: 280, y: 126, width: 144 },
]

const wideGroups = [
  { id: 'classful-network', x: 8, y: 18, width: 196, height: 60 },
  { id: 'classful-host', x: 212, y: 18, width: 220, height: 60 },
  { id: 'classless-network', x: 8, y: 104, width: 256, height: 60 },
  { id: 'classless-host', x: 272, y: 104, width: 160, height: 60 },
]

const wideNotes = [
  { id: 'classful-title', x: 8, y: 12, anchor: 'start' as const },
  { id: 'classful-count', x: 432, y: 12, anchor: 'end' as const },
  { id: 'classless-title', x: 8, y: 98, anchor: 'start' as const },
  { id: 'classless-count', x: 432, y: 98, anchor: 'end' as const },
]

// 클래스풀: 위 줄의 네트워크 부분(앞 세 옥텟)이 선명하다. CIDR: 아래 줄의 네트워크 부분(앞 세 옥텟과 넷째 옥텟의 앞 2비트)이 선명하다.
export const cidrBoundaryScenarios: DiagramScenario[] = [
  { id: 'classful', nodes: ['c-1', 'c-2', 'c-3'], paths: [] },
  { id: 'classless', nodes: ['v-1', 'v-2', 'v-3', 'v-4'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function CidrBoundaryDiagram() {
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
      scenarios={cidrBoundaryScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 172' : '0 0 280 204'}>
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
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9" opacity={opacityOf(note.owner)}>
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
