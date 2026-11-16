import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['local-user-accounts']

// 세로형은 위에 서버 SRV01 박스를 두고, 그 안에 계정 넷을 두 줄 두 칸으로(위 줄 Administrator·Guest, 아래 줄 DefaultAccount·user01) 놓은 뒤
// user01 바로 아래에 SRV01의 자원을 둔다. 그 아래 다른 컴퓨터 PC01 박스에 PC01의 자원을 SRV01의 자원과 같은 열에 둔다.
// 화살표는 user01에서 바로 아래 SRV01의 자원으로 가는 곧은 세로선 하나뿐이고, PC01 쪽으로 가는 선은 없다.
const nodes = [
  { id: 'admin', x: 12, y: 24, width: 124 },
  { id: 'guest', x: 148, y: 24, width: 124 },
  { id: 'default', x: 12, y: 80, width: 124 },
  { id: 'user01', x: 148, y: 80, width: 124 },
  { id: 'srv-res', x: 148, y: 136, width: 124 },
  { id: 'pc-res', x: 148, y: 208, width: 124 },
]

const groups = [
  { id: 'srv01', x: 4, y: 4, width: 272, height: 172, labelX: 12, labelY: 17 },
  { id: 'pc01', x: 4, y: 188, width: 272, height: 60, labelX: 12, labelY: 201 },
]

const paths: Record<string, string> = {
  'use-srv': 'M210 112 V136',
}

// 곁말은 자기 시나리오에서만 보인다. 기본 계정의 곁말은 그 계정 바로 아래에, PC01의 곁말은 PC01의 자원 왼쪽에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'admin-note', x: 74, y: 70, anchor: 'middle', scenarios: ['builtin'] },
  { id: 'guest-note', x: 210, y: 70, anchor: 'middle', scenarios: ['builtin'] },
  { id: 'default-note', x: 74, y: 126, anchor: 'middle', scenarios: ['builtin'] },
  { id: 'pc-note', x: 140, y: 228, anchor: 'end', scenarios: ['scope'] },
]

// 가로형은 서버 SRV01 박스를 왼쪽에, 다른 컴퓨터 PC01 박스를 오른쪽에 나란히 두고, 두 컴퓨터의 자원을 같은 줄에 놓는다.
const wideNodes = [
  { id: 'admin', x: 20, y: 28, width: 120 },
  { id: 'guest', x: 152, y: 28, width: 120 },
  { id: 'default', x: 20, y: 84, width: 120 },
  { id: 'user01', x: 152, y: 84, width: 120 },
  { id: 'srv-res', x: 152, y: 140, width: 120 },
  { id: 'pc-res', x: 304, y: 140, width: 120 },
]

const wideGroups = [
  { id: 'srv01', x: 8, y: 8, width: 272, height: 172, labelX: 16, labelY: 21 },
  { id: 'pc01', x: 296, y: 8, width: 136, height: 172, labelX: 304, labelY: 21 },
]

const widePaths: Record<string, string> = {
  'use-srv': 'M212 116 V140',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'admin-note', x: 80, y: 74, anchor: 'middle' },
  { id: 'guest-note', x: 212, y: 74, anchor: 'middle' },
  { id: 'default-note', x: 80, y: 130, anchor: 'middle' },
  { id: 'pc-note', x: 364, y: 126, anchor: 'middle' },
]

// 기본 계정: 설치할 때 생기는 계정 셋과 그 성질. 쓰이는 곳: SRV01의 로컬 계정 user01은 SRV01의 자원에만 쓰이고 PC01에서는 쓰이지 않는다.
export const localUserAccountsScenarios: DiagramScenario[] = [
  { id: 'builtin', nodes: ['admin', 'guest', 'default'], paths: [] },
  { id: 'scope', nodes: ['user01', 'srv-res'], paths: ['use-srv'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function LocalUserAccountsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-local-user-accounts-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={localUserAccountsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 188' : '0 0 280 252'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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

          {active?.paths.map((id) => (
            <path
              key={id}
              data-path={id}
              d={layoutPaths[id]}
              className="fill-none stroke-title"
              strokeWidth="2"
              strokeLinejoin="round"
              markerEnd={`url(#${arrowId})`}
            />
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
