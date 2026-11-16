import { useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['ds-commands']

// 세로형은 위 박스에 고유 이름 CN=user01,OU=영업팀,DC=example,DC=com의 조각 넷을 위에서부터 빈틈없이 쌓고,
// 조각의 뜻은 곁말로 그 조각의 오른쪽에 둔다. 아래 박스에는 명령 칸 바로 오른쪽에 그 명령이 하는 일 칸을 맞대어 여섯 줄로 쌓는다.
// 명령이 디렉터리를 바꾸는지 보기만 하는지는 아래 박스 라벨 줄의 오른쪽 곁말이 말한다. 선은 없다.
const nodes = [
  { id: 'cn', x: 16, y: 24, width: 84 },
  { id: 'ou', x: 16, y: 56, width: 84 },
  { id: 'dc1', x: 16, y: 88, width: 84 },
  { id: 'dc2', x: 16, y: 120, width: 84 },
  { id: 'dsadd', x: 16, y: 192, width: 60 },
  { id: 'add', x: 76, y: 192, width: 152 },
  { id: 'dsmod', x: 16, y: 228, width: 60 },
  { id: 'mod', x: 76, y: 228, width: 152 },
  { id: 'dsrm', x: 16, y: 264, width: 60 },
  { id: 'rm', x: 76, y: 264, width: 152 },
  { id: 'dsquery', x: 16, y: 300, width: 60 },
  { id: 'query', x: 76, y: 300, width: 152 },
  { id: 'dsget', x: 16, y: 336, width: 60 },
  { id: 'get', x: 76, y: 336, width: 152 },
  { id: 'dsmove', x: 16, y: 372, width: 60 },
  { id: 'move', x: 76, y: 372, width: 152 },
]

const groups = [
  { id: 'dn', x: 8, y: 4, width: 264, height: 156, labelX: 16, labelY: 17 },
  { id: 'commands', x: 8, y: 168, width: 264, height: 244, labelX: 16, labelY: 181 },
]

// 곁말은 자기 시나리오를 골랐을 때만 보인다. 「이어 읽으면 example.com」은 두 DC 조각이 맞닿은 줄에 걸쳐 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'cn-note', x: 108, y: 43, anchor: 'start', scenarios: ['dn'] },
  { id: 'ou-note', x: 108, y: 75, anchor: 'start', scenarios: ['dn'] },
  { id: 'dc-note', x: 108, y: 123, anchor: 'start', scenarios: ['dn'] },
  { id: 'change-note', x: 264, y: 181, anchor: 'end', scenarios: ['change'] },
  { id: 'look-note', x: 264, y: 181, anchor: 'end', scenarios: ['look'] },
]

// 가로형은 고유 이름 조각을 왼쪽에서 오른쪽으로 빈틈없이 잇고, 조각의 뜻은 그 조각 아래에 둔다.
// 명령은 두 열 세 줄로 놓는다 — 왼쪽 열에 dsadd·dsmod·dsrm, 오른쪽 열에 dsquery·dsget·dsmove.
const wideNodes = [
  { id: 'cn', x: 16, y: 24, width: 96 },
  { id: 'ou', x: 112, y: 24, width: 80 },
  { id: 'dc1', x: 192, y: 24, width: 96 },
  { id: 'dc2', x: 288, y: 24, width: 72 },
  { id: 'dsadd', x: 16, y: 116, width: 60 },
  { id: 'add', x: 76, y: 116, width: 110 },
  { id: 'dsmod', x: 16, y: 152, width: 60 },
  { id: 'mod', x: 76, y: 152, width: 110 },
  { id: 'dsrm', x: 16, y: 188, width: 60 },
  { id: 'rm', x: 76, y: 188, width: 110 },
  { id: 'dsquery', x: 204, y: 116, width: 60 },
  { id: 'query', x: 264, y: 116, width: 152 },
  { id: 'dsget', x: 204, y: 152, width: 60 },
  { id: 'get', x: 264, y: 152, width: 152 },
  { id: 'dsmove', x: 204, y: 188, width: 60 },
  { id: 'move', x: 264, y: 188, width: 152 },
]

const wideGroups = [
  { id: 'dn', x: 8, y: 4, width: 424, height: 80, labelX: 16, labelY: 17 },
  { id: 'commands', x: 8, y: 92, width: 424, height: 136, labelX: 16, labelY: 105 },
]

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'cn-note', x: 64, y: 72, anchor: 'middle' },
  { id: 'ou-note', x: 152, y: 72, anchor: 'middle' },
  { id: 'dc-note', x: 288, y: 72, anchor: 'middle' },
  { id: 'change-note', x: 424, y: 105, anchor: 'end' },
  { id: 'look-note', x: 424, y: 105, anchor: 'end' },
]

// 고유 이름: 조각 넷. 만들고 바꾸고 지우기: 디렉터리를 바꾸는 명령 넷과 그 일. 찾고 보기: 보기만 하는 명령 둘과 그 일.
export const dsCommandsScenarios: DiagramScenario[] = [
  { id: 'dn', nodes: ['cn', 'ou', 'dc1', 'dc2'], paths: [] },
  { id: 'change', nodes: ['dsadd', 'add', 'dsmod', 'mod', 'dsrm', 'rm', 'dsmove', 'move'], paths: [] },
  { id: 'look', nodes: ['dsquery', 'query', 'dsget', 'get'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DsCommandsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={dsCommandsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 232' : '0 0 280 416'}>
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
