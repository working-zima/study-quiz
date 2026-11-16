import { useId, useState } from 'react'
import { visualsByTopicId } from '../../data/network'
import { useWideDiagram } from '../../hooks/useWideDiagram'
import { DiagramFrame, type DiagramScenario } from './DiagramFrame'

const text = visualsByTopicId['windows-ad'].diagrams['domain-user-account']

// 세로형은 왼쪽에 만드는 차례 넷(도구 → OU → 계정 → 그룹)을 위에서 아래로 쌓고, 오른쪽에 로그온하는 PC 둘과 공유 폴더를 둔다.
// 도구 이름이 길어 첫 줄은 거의 한 줄 전체 폭을 쓴다.
const nodes = [
  { id: 'tool', x: 32, y: 12, width: 232 },
  { id: 'ou', x: 32, y: 64, width: 100 },
  { id: 'user', x: 32, y: 116, width: 100 },
  { id: 'group', x: 32, y: 168, width: 100 },
  { id: 'pc01', x: 184, y: 64, width: 80 },
  { id: 'otherpc', x: 184, y: 116, width: 80 },
  { id: 'share', x: 184, y: 168, width: 80 },
]

const paths: Record<string, string> = {
  'tool-ou': 'M82 44 V64',
  'ou-user': 'M82 96 V116',
  'user-group': 'M82 148 V168',
  'user-pc01': 'M132 124 H158 V80 H184',
  'user-otherpc': 'M132 140 H184',
  'group-share': 'M132 184 H184',
}

// 번호 ①~④는 자기 차례 노드의 바로 왼쪽에 놓인다. 「구성원」은 계정 → 그룹 화살표 오른쪽에, 「사용 권한」은 그룹 → 공유 폴더 화살표 위에 놓인다.
const notes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end', scenarios: string[] }[] = [
  { id: 'step-1', x: 18, y: 32, anchor: 'middle', scenarios: ['create'] },
  { id: 'step-2', x: 18, y: 84, anchor: 'middle', scenarios: ['create'] },
  { id: 'step-3', x: 18, y: 136, anchor: 'middle', scenarios: ['create'] },
  { id: 'step-4', x: 18, y: 188, anchor: 'middle', scenarios: ['create'] },
  { id: 'member-note', x: 88, y: 162, anchor: 'start', scenarios: ['access'] },
  { id: 'permission-note', x: 158, y: 178, anchor: 'middle', scenarios: ['access'] },
]

// 가로형은 도구를 맨 위에 두고 OU → 계정 → 그룹을 왼쪽에서 오른쪽으로 잇는다. 계정 아래에 PC 둘, 그룹 아래에 공유 폴더를 둔다.
const wideNodes = [
  { id: 'tool', x: 32, y: 16, width: 216 },
  { id: 'ou', x: 32, y: 72, width: 100 },
  { id: 'user', x: 172, y: 72, width: 100 },
  { id: 'group', x: 312, y: 72, width: 112 },
  { id: 'pc01', x: 104, y: 132, width: 96 },
  { id: 'otherpc', x: 212, y: 132, width: 96 },
  { id: 'share', x: 324, y: 132, width: 100 },
]

const widePaths: Record<string, string> = {
  'tool-ou': 'M82 48 V72',
  'ou-user': 'M132 88 H172',
  'user-group': 'M272 88 H312',
  'user-pc01': 'M192 104 V132',
  'user-otherpc': 'M252 104 V132',
  'group-share': 'M368 104 V132',
}

// 곁말의 자리만 배치마다 다르다. 보이는 시나리오는 세로형에서 id로 가져온다.
const wideNotes: { id: string, x: number, y: number, anchor: 'start' | 'middle' | 'end' }[] = [
  { id: 'step-1', x: 22, y: 36, anchor: 'middle' },
  { id: 'step-2', x: 22, y: 84, anchor: 'middle' },
  { id: 'step-3', x: 162, y: 84, anchor: 'middle' },
  { id: 'step-4', x: 302, y: 84, anchor: 'middle' },
  { id: 'member-note', x: 292, y: 100, anchor: 'middle' },
  { id: 'permission-note', x: 374, y: 122, anchor: 'start' },
]

// 만들기: 도구에서 OU를 골라 계정을 만들고 그룹에 넣는 차례. 로그온: 계정과 두 PC. 자원 접근: 계정 → 그룹 → 공유 폴더.
export const domainUserAccountScenarios: DiagramScenario[] = [
  { id: 'create', nodes: ['tool', 'ou', 'user', 'group'], paths: ['tool-ou', 'ou-user', 'user-group'] },
  { id: 'logon', nodes: ['user', 'pc01', 'otherpc'], paths: ['user-pc01', 'user-otherpc'] },
  { id: 'access', nodes: ['user', 'group', 'share'], paths: ['user-group', 'group-share'] },
].map((scenario) => {
  const wording = text.scenarios.find(({ id }) => id === scenario.id)!
  return { ...scenario, label: wording.label, caption: wording.caption }
})

export function DomainUserAccountDiagram() {
  const [active, setActive] = useState<DiagramScenario | null>(null)
  const arrowId = `${useId()}-domain-user-account-arrow`
  const opacityOf = (id: string) => (active && !active.nodes.includes(id) ? 0.25 : 1)
  const wide = useWideDiagram()
  const layoutNodes = wide ? wideNodes : nodes
  const layoutPaths = wide ? widePaths : paths
  const layoutNotes = wide ? wideNotes.map((note) => ({ ...notes.find(({ id }) => id === note.id)!, ...note })) : notes
  const shownNotes = layoutNotes.filter((note) => active !== null && note.scenarios.includes(active.id))

  return (
    <DiagramFrame
      label={text.label}
      question={text.question}
      idleCaption={text.idleCaption}
      legend={text.legend}
      scenarios={domainUserAccountScenarios}
      active={active}
      onSelect={setActive}
    >
      <div className={wide ? 'w-full' : '-mx-4 w-full max-w-[380px] max-sm:w-[calc(100%+2rem)] sm:mx-0'}>
        <svg aria-label={text.svgLabel} className="block h-auto w-full" role="img" viewBox={wide ? '0 0 440 176' : '0 0 280 212'}>
          <defs>
            <marker id={arrowId} markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" viewBox="0 0 6 6">
              <path className="fill-title" d="M0 0 L6 3 L0 6 Z" />
            </marker>
          </defs>

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
