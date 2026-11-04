import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['linux-accounts'].diagrams['passwd-fields']

// 세로형은 user4의 /etc/passwd 한 줄을 콜론으로 끊어, 칸마다 「칸 이름 | 값」 한 행으로 위에서 아래로 쌓는다.
// 행은 빈틈없이 잇고, 이름 칸 바로 오른쪽에 값 칸이 맞닿는다. /etc/shadow는 테두리 밖 오른쪽 아래에 두고,
// 암호 칸의 값 x에서 오른쪽으로 나와 값 칸들 오른쪽을 따라 내려가는 선으로 잇는다.
const nodes = [
  { id: 'name-name', x: 16, y: 30, width: 88 },
  { id: 'name', x: 104, y: 30, width: 104 },
  { id: 'password-name', x: 16, y: 62, width: 88 },
  { id: 'password', x: 104, y: 62, width: 104 },
  { id: 'uid-name', x: 16, y: 94, width: 88 },
  { id: 'uid', x: 104, y: 94, width: 104 },
  { id: 'gid-name', x: 16, y: 126, width: 88 },
  { id: 'gid', x: 104, y: 126, width: 104 },
  { id: 'gecos-name', x: 16, y: 158, width: 88 },
  { id: 'gecos', x: 104, y: 158, width: 104 },
  { id: 'home-name', x: 16, y: 190, width: 88 },
  { id: 'home', x: 104, y: 190, width: 104 },
  { id: 'shell-name', x: 16, y: 222, width: 88 },
  { id: 'shell', x: 104, y: 222, width: 104 },
  { id: 'shadow', x: 176, y: 278, width: 96 },
]

const groups = [
  { id: 'line', x: 8, y: 8, width: 264, height: 254, labelX: 16, labelY: 22 },
]

const paths: Record<string, string> = {
  'shadow-path': 'M208 78 H240 V278',
}

// 곁말은 /etc/shadow의 왼쪽에 둔다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'shadow', x: 168, y: 298, anchor: 'end', scenarios: ['password'] },
]

// 가로형은 두 열이다. 왼쪽 열에 사용자 이름·암호 칸·UID·GID를, 오른쪽 열에 설명 칸·홈 디렉터리·로그인 셸을 위에서부터 둔다.
// 암호 칸의 값 x에서 두 열 사이의 틈으로 나와 곧게 내려가 테두리 밖의 /etc/shadow에 닿는다.
const wideNodes = [
  { id: 'name-name', x: 16, y: 30, width: 80 },
  { id: 'name', x: 96, y: 30, width: 96 },
  { id: 'password-name', x: 16, y: 62, width: 80 },
  { id: 'password', x: 96, y: 62, width: 96 },
  { id: 'uid-name', x: 16, y: 94, width: 80 },
  { id: 'uid', x: 96, y: 94, width: 96 },
  { id: 'gid-name', x: 16, y: 126, width: 80 },
  { id: 'gid', x: 96, y: 126, width: 96 },
  { id: 'gecos-name', x: 208, y: 30, width: 88 },
  { id: 'gecos', x: 296, y: 30, width: 112 },
  { id: 'home-name', x: 208, y: 62, width: 88 },
  { id: 'home', x: 296, y: 62, width: 112 },
  { id: 'shell-name', x: 208, y: 94, width: 88 },
  { id: 'shell', x: 296, y: 94, width: 112 },
  { id: 'shadow', x: 152, y: 190, width: 96 },
]

const wideGroups = [
  { id: 'line', x: 8, y: 8, width: 424, height: 158, labelX: 16, labelY: 22 },
]

const widePaths: Record<string, string> = {
  'shadow-path': 'M192 78 H200 V190',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'shadow', x: 256, y: 210, anchor: 'start' },
]

export const passwdFieldsScenarios: DiagramScenario[] = [
  { id: 'ids', nodes: ['name-name', 'name', 'uid-name', 'uid', 'gid-name', 'gid'], paths: [] },
  { id: 'password', nodes: ['password-name', 'password', 'shadow'], paths: ['shadow-path'] },
  { id: 'login', nodes: ['home-name', 'home', 'shell-name', 'shell'], paths: [] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function PasswdFieldsDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-passwd-fields-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutGroups = wide ? wideGroups : groups
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={passwdFieldsScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 230' : '0 0 280 318'}>
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

          {active && layoutNotes.filter((note) => note.scenarios.includes(active.id)).map((note) => (
            <text key={note.id} data-note={note.id} x={note.x} y={note.y} textAnchor={note.anchor} className="fill-muted" fontSize="9">
              {text.notes![note.id]}
            </text>
          ))}
        </svg>
      </div>
    </DiagramFrame>
  )
}
